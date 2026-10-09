/* lib/landindex.js — the committed land partition, as a queryable index for the water build (Phase 1b).

   build-water.js must snap river mouths to the coast and decide whether a lake lies on land or in the
   sea, and the owner's rule for Phase 1b is "do not re-download OSM: use the committed core file and
   tiles as the land partition". The finest coast is in the z=4 tiles (75 m tolerance, 6.2 M coast
   segments in 382 files), read through the shared atlas/atlas-format.js reader like everything else.
   Nothing here is clever: a cell grid over the coast segments for "nearest coast within r", and the
   tiles' own clipped faces (admin-0 layer) for "is this point on land" by even-odd in the lon/lat
   plane — the plane every tile is cut in (docs/atlas-v2-design.md §7 "Phase 1a — as built").

     const L = LandIndex.load(dataDir)        // atlas/data: topology.bin (header) + tiles/4/*.bin
     L.nearestCoast(x, y, maxMetres)          → null | { metres, px, py, tile, arc, coreArc, seg, t }
                                                 (x, y, px, py in quantised units; t along the segment)
     L.isLand(x, y)                           → true if (x, y) is inside an admin-0 face of its z=4 tile;
                                                 a point in no tile is sea (open-ocean cells are omitted)
     L.coastSegments                           the count, for the report
   Coordinates are quantised units of the core's quantum (2.5·10⁻⁴°); metric distances take the
   latitude into account (one unit of longitude is 27.8·cos φ m). */
"use strict";
const fs = require("fs"), path = require("path");
const F = require("./format.js");
const SegIndex = require("./segindex.js");

const D2R = Math.PI / 180;

function load(dataDir, opts) {
  opts = opts || {};
  const core = F.readFile(path.join(dataDir, "topology.bin"), { headerOnly: true });
  const H = core.header, Q = core.quantum;
  const X180 = Math.round(180 / Q), Y90 = Math.round(90 / Q);
  const z = String(opts.z || 4);
  const idx = H.tiles[z];
  if (!idx) throw new Error("the core carries no z=" + z + " tile index");
  const W = (2 * X180) / idx.cols, Hh = (2 * Y90) / idx.rows;
  const tileKey = (tx, ty) => tx * 1000 + ty;
  const tiles = new Map();   // key → { T, x0, y0, faces: [{ X, Y, bx0, bx1, by0, by1 }…] (layer-0 rings, unwrapped) }
  const parentOf = new Map(H.entities.map((e) => [e.id, e.parent || null]));
  const entityLayer = H.entities.map((e) => (e.parent ? 1 : 0));
  // every coast segment of every tile, in one flat table for the grid
  let segX1 = [], segY1 = [], segX2 = [], segY2 = [], segTile = [], segArc = [];
  const t0 = Date.now();
  for (const key of idx.present) {
    const [tx, ty] = key.split("-").map(Number);
    const T = F.readFile(path.join(dataDir, "tiles", z, key + ".bin"));
    const x0 = Math.round(T.header.tile.lon0 / Q), y0 = Math.round(T.header.tile.lat0 / Q);
    const faces = [];
    T.faces.forEach((f, fi) => {
      if (entityLayer[f.entity] !== 0) return;
      for (const ring of f.rings) {
        const vs = [];
        for (const ref of ring) { const a = Math.abs(ref) - 1; const s = T.arcOffset[a], e = T.arcOffset[a + 1]; if (ref > 0) { for (let i = s; i < e - 1; i++) vs.push(i); } else { for (let i = e - 1; i > s; i--) vs.push(i); } }
        if (vs.length < 3) continue;
        const n = vs.length, X = new Float64Array(n), Y = new Float64Array(n);
        let cum = T.lon[vs[0]]; X[0] = cum; Y[0] = T.lat[vs[0]];
        for (let i = 1; i < n; i++) { let dx = T.lon[vs[i]] - T.lon[vs[i - 1]]; if (dx > X180) dx -= 2 * X180; else if (dx < -X180) dx += 2 * X180; cum += dx; X[i] = cum; Y[i] = T.lat[vs[i]]; }
        let bx0 = Infinity, bx1 = -Infinity, by0 = Infinity, by1 = -Infinity;
        for (let i = 0; i < n; i++) { if (X[i] < bx0) bx0 = X[i]; if (X[i] > bx1) bx1 = X[i]; if (Y[i] < by0) by0 = Y[i]; if (Y[i] > by1) by1 = Y[i]; }
        faces.push({ X, Y, bx0, bx1, by0, by1, face: fi });
      }
    });
    const tileIndex = tiles.size;
    tiles.set(tileKey(tx, ty), { key, T, x0, y0, faces, index: tileIndex });
    const nA = T.arcOffset.length - 1;
    for (let a = 0; a < nA; a++) {
      if (T.arcKind[a] !== F.KIND.COAST) continue;
      for (let i = T.arcOffset[a] + 1; i < T.arcOffset[a + 1]; i++) { segX1.push(T.lon[i - 1]); segY1.push(T.lat[i - 1]); segX2.push(T.lon[i]); segY2.push(T.lat[i]); segTile.push(tileIndex); segArc.push(a); }
    }
  }
  const tileList = [...tiles.values()];
  segX1 = Int32Array.from(segX1); segY1 = Int32Array.from(segY1); segX2 = Int32Array.from(segX2); segY2 = Int32Array.from(segY2); segTile = Int32Array.from(segTile); segArc = Int32Array.from(segArc);
  const n = segX1.length;
  const CELL = Math.round(0.05 / Q);   // 200 units = 5.6 km: a mouth search of a few km touches a cell or four
  const grid = SegIndex.build(n, CELL, (i) => [segX1[i], segY1[i], segX2[i], segY2[i]]);
  const loadMs = Date.now() - t0;

  const tileOf = (x, y) => { let tx = Math.floor((x + X180) / W), ty = Math.floor((y + Y90) / Hh); tx = ((tx % idx.cols) + idx.cols) % idx.cols; ty = Math.max(0, Math.min(idx.rows - 1, ty)); return tiles.get(tileKey(tx, ty)) || null; };

  /* nearest coast segment to (x, y) within maxMetres: a planar search in a frame scaled by cos φ, so the
     distance is metric to within the planar error over a few kilometres (negligible against a 28 m quantum) */
  function nearestCoast(x, y, maxMetres) {
    const mPerUnitLat = Q * D2R * 6371008.8, c = Math.cos(y * Q * D2R), mPerUnitLon = mPerUnitLat * c;
    const rU = Math.ceil(maxMetres / Math.min(mPerUnitLat, mPerUnitLon || mPerUnitLat));
    let best = null, bestD2 = maxMetres * maxMetres;
    grid.near(x, y, rU, (i) => {
      let x1 = segX1[i], x2 = segX2[i];
      if (x1 - x > X180) x1 -= 2 * X180; else if (x - x1 > X180) x1 += 2 * X180;
      if (x2 - x1 > X180) x2 -= 2 * X180; else if (x1 - x2 > X180) x2 += 2 * X180;
      const y1 = segY1[i], y2 = segY2[i];
      // in metres
      const ax = (x1 - x) * mPerUnitLon, ay = (y1 - y) * mPerUnitLat, bx = (x2 - x) * mPerUnitLon, by = (y2 - y) * mPerUnitLat;
      const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
      let t = l2 > 0 ? -(ax * dx + ay * dy) / l2 : 0; if (t < 0) t = 0; else if (t > 1) t = 1;
      const px = ax + dx * t, py = ay + dy * t, d2 = px * px + py * py;
      if (d2 < bestD2) {
        bestD2 = d2;
        let qx = Math.round(x1 + (x2 - x1) * t); if (qx >= X180) qx -= 2 * X180; if (qx < -X180) qx += 2 * X180;
        best = { metres: Math.sqrt(d2), px: qx, py: Math.round(y1 + (y2 - y1) * t), seg: i, t, tile: tileList[segTile[i]], arc: segArc[i] };
      }
    });
    if (best) { const T = best.tile.T; best.coreArc = T.arcRef ? T.arcRef[best.arc] : -1; best.tileKey = best.tile.key; }
    return best;
  }

  function isLand(x, y) {
    const t = tileOf(x, y);
    if (!t) return false;
    let inside = false;
    for (const f of t.faces) {
      if (y < f.by0 || y > f.by1) continue;
      const X = f.X, Y = f.Y, m = X.length;
      for (const qx of [x, x + 2 * X180, x - 2 * X180]) {
        if (qx < f.bx0 || qx > f.bx1) continue;
        let c = false;
        for (let i = 0, j = m - 1; i < m; j = i++) if ((Y[i] > y) !== (Y[j] > y) && qx < (X[j] - X[i]) * (y - Y[i]) / (Y[j] - Y[i]) + X[i]) c = !c;
        if (c) { inside = !inside; break; }
      }
    }
    return inside;
  }

  return { header: H, quantum: Q, X180, Y90, coastSegments: n, tiles: tileList, loadMs, nearestCoast, isLand, tileOf };
}

module.exports = { load };
