#!/usr/bin/env node
/* pack-water.js — step 8b of the Atlas v2 build: out/water-full.bin → the water files the site serves (Phase 1b).

     node pack-water.js              → out/dist-water/water.bin, out/dist-water/water/<x>-<y>.bin, out/dist-water/water-report.json
     node pack-water.js --install    …and then replace atlas/data/water.bin and atlas/data/water/ with them
     node pack-water.js --dry        build everything in memory, print the report, write nothing

   WATER IS A FILE OF ITS OWN (the owner's rule for 1b: the land tiles of Phase 1a stay byte-identical,
   because every committed byte stays in git history), loaded when rivers or lakes are first wanted.

   THE CORE (atlas/data/water.bin) holds levels 0–2 of every lake drawable at one of them (the lake faces
   with their ring arcs, outer and holes) and EVERY river arc whole, with all of its vertices (ranks 0–3):
   rivers come from a 1:10M source whose chords are already longer than a pixel past LOD 2, so a tile
   could add nothing to them — the worker smooths the resident polylines instead (two Chaikin passes)
   where chords would show. The header carries the entity table (lakes and rivers, with the names and
   ids Phase 1c will label from), header.rivers (each river's arcs in order) and header.tiles (which
   water tiles exist).

   THE TILES (atlas/data/water/<x>-<y>.bin) are ONE level, 250 m, on the z=4 grid of 32 × 16 cells of
   11.25° — the lakes ≥ 5 km² (the ≥ 10 km² ones of the core at their finest vertices, plus the 5–10 km²
   lakes that exist only here), each face clipped to the tile with EDGE chords exactly as pack.js clips
   a country (one layer: a lake arc has the lake on its left and nothing on its right). Tile arcs name
   the core arc they are a piece of (arcRef; −1 for a lake below the core's area filter), tile faces
   name the core face (faceRef; −1 likewise — the tile then carries the entity index of the core's
   table, which lists every lake ≥ 5 km² whether or not the core draws it). Why one tile level and not
   two (§7 "Phase 1b — as built"): the census showed lakes ≥ 10 km² at 75 m would cost 19 MB alone,
   against a 12 MB budget for rivers and lakes together; 250 m is 1.7 px at the 150 m/px cap, and
   HydroLAKES' own polygons are of mixed provenance (MODIS 250 m for 167k of them), so a 75 m level
   would mostly resample the source's own steps. The renderer draws a z=4-grid water tile at both
   tile zooms and the resident level where no tile covers (the same stencil rule as the land).
*/
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const F = require("./lib/format.js");
const R = require("./lib/rings.js");

const HERE = __dirname, OUT = path.join(HERE, "out"), DIST = path.join(OUT, "dist-water");
const SITE = path.join(HERE, "..", "..", "atlas", "data");
const argv = process.argv.slice(2);
/* the file:// twin of water.bin (lib/twin.js, Phase 1d) — written at --install, or alone with --twin from the committed file. The
   owner's rule: the two twins together stay within 12 MB (decimal); water.bin is twinned only while they do, else rivers and lakes
   are absent on file:// and atlas.js says so. */
const TWIN_BUDGET = 12e6;
function writeWaterTwin() {
  const T = require("./lib/twin.js"), fs2 = require("fs");
  const site = path.join(__dirname, "..", "..", "atlas", "data");
  const land = path.join(site, "topology.bin.js"), landBytes = fs2.existsSync(land) ? fs2.statSync(land).size : 0;
  const r = T.writeTwin(path.join(site, "water.bin"));
  if (landBytes + r.twinBytes > TWIN_BUDGET) { fs2.rmSync(r.file, { force: true }); console.log(`water twin NOT written: ${(landBytes / 1e6).toFixed(2)} + ${(r.twinBytes / 1e6).toFixed(2)} MB would pass the ${TWIN_BUDGET / 1e6} MB twin budget — rivers and lakes are absent on file://`); return null; }
  console.log(`twin for file://: ${r.file} (${(r.twinBytes / 1e6).toFixed(2)} MB; both twins ${((landBytes + r.twinBytes) / 1e6).toFixed(2)} MB of ${TWIN_BUDGET / 1e6})`);
  require("./build-credits.js").build({ install: true });
  return r;
}
if (argv.includes("--twin")) { writeWaterTwin(); process.exit(0); }
const dry = argv.includes("--dry"), install = argv.includes("--install");
const MIN_TILE_KM2 = Number((() => { const i = argv.indexOf("--min-km2"); return i >= 0 ? argv[i + 1] : 0; })());   // lakes under this leave the tiles (the budget's last turn; the build's own floor is 5 km²)
const RESIDENT = 3;                              // levels 0–2 in the core
const TILE = { z: 3, cols: 32, rows: 16 };       // one tile level (250 m) on the z=4 grid
const KIND = F.KIND;
const Q = R.QUANTUM, X180 = R.X180, Y90 = R.Y90;
const t0 = Date.now();
const say = (m) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${m}`);

const fullBytes = fs.readFileSync(path.join(OUT, "water-full.bin"));
const buildId = crypto.createHash("sha256").update(fullBytes).digest("hex").slice(0, 16);
const T = F.read(new Uint8Array(fullBytes));
const H = T.header, nA = T.arcOffset.length - 1, nF = T.faces.length;
const FINEST = T.lodCount - 1;
if (FINEST !== TILE.z) throw new Error(`water-full.bin has ${T.lodCount} levels; this packer expects 4`);
say(`water-full.bin: ${T.lon.length} vertices, ${nA} arcs, ${nF} lake faces, ${H.entities.length} entities, ${H.rivers.length} rivers, ${T.lodCount} levels; buildId ${buildId}`);
{ const TILE_U = Math.round(11.25 / Q); let nudged = 0;
  for (let i = 0; i < T.lon.length; i++) {
    if (T.lon[i] % TILE_U === 0) { T.lon[i] += 1; nudged++; }
    if (T.lat[i] % TILE_U === 0) { T.lat[i] += T.lat[i] > 0 ? -1 : 1; nudged++; }
    if (T.lon[i] >= X180) T.lon[i] -= 2 * X180;
  }
  say(`nudged ${nudged} coordinates off the tile lines`); }
const generated = new Date().toISOString();
const generator = "folio atlas-build: build-water.js → pack-water.js (" + require("./package.json").version + ")";
const isRiver = (a) => T.arcKind[a] === KIND.RIVER;

/* ---------- per arc: the face on its left (a lake ring is used once, forward) ---------- */
const left = new Int32Array(nA).fill(-1);
const faceOut = new Uint8Array(nF);   // 1 = this lake is left out of the tiles (under --min-km2)
let leftOut = 0;
T.faces.forEach((f, fi) => { if (MIN_TILE_KM2 && H.lakeAreas && H.lakeAreas[fi] < MIN_TILE_KM2) { faceOut[fi] = 1; leftOut++; return; } for (const ring of f.rings) for (const ref of ring) { if (ref < 0) throw new Error("a lake ring walked backward"); left[ref - 1] = fi; } });
if (MIN_TILE_KM2) say(`--min-km2 ${MIN_TILE_KM2}: ${leftOut} lakes left out of the tiles`);

/* ---------- the core ---------- */
const drawableAt = (a, level) => T.arcMinLod[a] <= level;
const coreOf = new Int32Array(nA).fill(-1);
let coreLon, coreLat, coreRank, coreArcs = [], coreFaces = [], coreFaceOf = new Int32Array(nF).fill(-1);
{
  let nV = 0, nArcs = 0;
  const keepV = (a, i) => (isRiver(a) ? true : T.rank[i] <= RESIDENT - 1);
  for (let a = 0; a < nA; a++) if (isRiver(a) || drawableAt(a, RESIDENT - 1)) { coreOf[a] = nArcs++; for (let i = T.arcOffset[a]; i < T.arcOffset[a + 1]; i++) if (keepV(a, i)) nV++; }
  coreLon = new Int32Array(nV); coreLat = new Int32Array(nV); coreRank = new Uint8Array(nV);
  let off = 0;
  for (let a = 0; a < nA; a++) {
    if (coreOf[a] < 0) continue;
    let count = 0;
    for (let i = T.arcOffset[a]; i < T.arcOffset[a + 1]; i++) if (keepV(a, i)) { coreLon[off + count] = T.lon[i]; coreLat[off + count] = T.lat[i]; coreRank[off + count] = Math.min(T.rank[i], RESIDENT - 1); count++; }   // a river vertex of rank 3 is rank 2 here: the core has three levels and a river's finest vertices are LOD 2's
    coreArcs.push({ offset: off, count, kind: T.arcKind[a], source: T.arcSource[a], minLod: Math.min(T.arcMinLod[a], RESIDENT - 1 + (isRiver(a) ? 0 : 0)), flags: T.arcFlags[a] });
    off += count;
  }
  // a river arc's minLod is ≤ 2 by construction; a lake ring's is kept as is (≤ 2 here)
  let droppedRings = 0, emptyFaces = 0;
  var coreLakeIds = [];
  T.faces.forEach((f, fi) => {
    const rings = [];
    for (const ring of f.rings) { const a = ring[0] - 1; if (coreOf[a] >= 0) rings.push([coreOf[a] + 1]); else droppedRings++; }
    if (!rings.length) { emptyFaces++; return; }   // a 5–10 km² lake: tile-only, no core face
    coreFaceOf[fi] = coreFaces.length;
    coreFaces.push({ entity: f.entity, source: f.source, rings }); coreLakeIds.push(H.lakeIds ? H.lakeIds[fi] : 0);
  });
  say(`core: ${coreArcs.length} arcs (${coreArcs.filter((a) => a.kind === KIND.RIVER).length} river), ${nV} vertices, ${coreFaces.length} lake faces (${droppedRings} rings and ${emptyFaces} lakes exist only in the tiles)`);
}

/* ---------- tiles: arc pieces, then faces clipped, exactly as pack.js does it ---------- */
const L = TILE.z, W = (2 * X180) / TILE.cols, Hh = (2 * Y90) / TILE.rows;
if (W !== Math.round(W) || Hh !== Math.round(Hh)) throw new Error("tile size must be whole quanta");
const tiles = new Map();
const tileKey = (tx, ty) => tx * 1000 + ty;
const tileAt = (tx, ty) => { const k = tileKey(tx, ty); let t = tiles.get(k); if (!t) tiles.set(k, t = { tx, ty, x0: -X180 + tx * W, y0: -Y90 + ty * Hh, pieces: [], firstPiece: new Map(), vkey: new Map(), vx: [], vy: [], arcs: [], faces: [] }); return t; };
const vtx = (t, x, y) => { const k = R.pkey(x, y); let v = t.vkey.get(k); if (v == null) { v = t.vx.length; t.vkey.set(k, v); t.vx.push(x); t.vy.push(y); } return v; };
let piecesTotal = 0;
for (let a = 0; a < nA; a++) {
  if (isRiver(a) || !drawableAt(a, L) || left[a] < 0) continue;
  const idx = []; for (let i = T.arcOffset[a]; i < T.arcOffset[a + 1]; i++) if (T.rank[i] <= L) idx.push(i);
  let cur = null;
  let ux = T.lon[idx[0]];
  const tileOf = (x, y) => { let tx = Math.floor((x + X180) / W), ty = Math.floor((y + Y90) / Hh); tx = ((tx % TILE.cols) + TILE.cols) % TILE.cols; ty = Math.max(0, Math.min(TILE.rows - 1, ty)); return tileAt(tx, ty); };
  const wrapX = (x) => ((x + X180) % (2 * X180) + 2 * X180) % (2 * X180) - X180;
  const begin = (t, x, y, atStart) => { cur = { t, v: [vtx(t, wrapX(x), y)], atStart, pos0: atStart ? null : boundaryPos(t, wrapX(x), y) }; };
  const finish = (x, y, atEnd) => { cur.v.push(vtx(cur.t, wrapX(x), y)); cur.atEnd = atEnd; cur.pos1 = atEnd ? null : boundaryPos(cur.t, wrapX(x), y); if (cur.v.length >= 2 && cur.v.some((v) => v !== cur.v[0])) { cur.arc = a; cur.t.pieces.push(cur); piecesTotal++; } cur = null; };
  function boundaryPos(t, x, y) {
    const x0 = t.x0, y0 = t.y0, x1 = x0 + W, y1 = y0 + Hh;
    let X = x; if (X - x0 > X180) X -= 2 * X180; else if (x0 - X > X180) X += 2 * X180;
    if (y === y0) return (X - x0) / W;
    if (X === x1) return 1 + (y - y0) / Hh;
    if (y === y1) return 2 + (x1 - X) / W;
    if (X === x0) return 3 + (y1 - y) / Hh;
    throw new Error(`point ${x},${y} is not on the boundary of tile ${t.tx},${t.ty}`);
  }
  let t = tileOf(T.lon[idx[0]], T.lat[idx[0]]);
  begin(t, ux, T.lat[idx[0]], true);
  let lastCross = null;
  const undoLast = () => { const p = lastCross.piece; const i = p.t.pieces.lastIndexOf(p); if (i >= 0) { p.t.pieces.splice(i, 1); piecesTotal--; } p.v.pop(); p.v.push(vtx(p.t, lastCross.x, lastCross.y)); p.atEnd = false; p.pos1 = null; cur = p; lastCross = null; };
  for (let k = 1; k < idx.length; k++) {
    const x1 = ux, y1 = T.lat[idx[k - 1]];
    let x2 = T.lon[idx[k]]; const y2 = T.lat[idx[k]];
    let dx = x2 - wrapX(x1); if (dx > X180) dx -= 2 * X180; else if (dx < -X180) dx += 2 * X180;
    x2 = x1 + dx;
    const hits = [];
    const gx0 = Math.min(x1, x2), gx1 = Math.max(x1, x2);
    for (let gx = (Math.floor((gx0 + X180) / W) + 1) * W - X180; gx < gx1; gx += W) if (gx > gx0) hits.push({ t: (gx - x1) / (x2 - x1), x: gx, y: null });
    const gy0 = Math.min(y1, y2), gy1 = Math.max(y1, y2);
    for (let gy = (Math.floor((gy0 + Y90) / Hh) + 1) * Hh - Y90; gy < gy1; gy += Hh) if (gy > gy0) hits.push({ t: (gy - y1) / (y2 - y1), x: null, y: gy });
    hits.sort((p, q) => p.t - q.t);
    for (let hi = 0; hi < hits.length; hi++) {
      const h = hits[hi];
      const px = h.x != null ? h.x : Math.round(x1 + h.t * (x2 - x1)), py = h.y != null ? h.y : Math.round(y1 + h.t * (y2 - y1));
      if (h.x == null && (px + X180) % W === 0) throw new Error("a crossing landed on a tile corner");
      if (h.y == null && (py + Y90) % Hh === 0) throw new Error("a crossing landed on a tile corner (lat)");
      if (lastCross && lastCross.x === px && lastCross.y === py && cur.v.length <= 2) { undoLast(); continue; }
      const finishedHere = cur;
      finish(px, py, false);
      lastCross = finishedHere.t.pieces[finishedHere.t.pieces.length - 1] === finishedHere ? { x: px, y: py, piece: finishedHere } : null;
      const tn = hi + 1 < hits.length ? hits[hi + 1].t : 1;
      const tm = (h.t + tn) / 2;
      const nx = x1 + tm * (x2 - x1), ny = y1 + tm * (y2 - y1);
      begin(tileOf(wrapX(nx), ny), px, py, false);
    }
    cur.v.push(vtx(cur.t, wrapX(x2), y2));
    if (cur.v.length > 2) lastCross = null;
    ux = x2;
  }
  cur.atEnd = true; cur.pos1 = null; cur.arc = a; if (cur.v.length >= 2 && cur.v.some((v) => v !== cur.v[0])) { cur.t.pieces.push(cur); piecesTotal++; }
  cur = null;
}
say(`tiles: ${tiles.size} touched by ${piecesTotal} lake-ring pieces`);
// containment, for whole-tile covers
const faceRingsAt = new Map();
const ringsOf = (fi) => {
  let r = faceRingsAt.get(fi); if (r) return r;
  r = [];
  for (const ring of T.faces[fi].rings) {
    const vs = []; let skip = false;
    for (const ref of ring) { const a = Math.abs(ref) - 1; if (!drawableAt(a, L)) { skip = true; break; } const s = T.arcOffset[a], e = T.arcOffset[a + 1]; for (let i = s; i < e - 1; i++) if (T.rank[i] <= L) vs.push(i); }
    if (!skip && vs.length >= 3) r.push(vs);
  }
  faceRingsAt.set(fi, r); return r;
};
const faceContains = (fi, px, py) => {
  let inside = false;
  for (const vs of ringsOf(fi)) {
    const n = vs.length; const X = new Float64Array(n), Y = new Float64Array(n); let cum = T.lon[vs[0]]; X[0] = cum; Y[0] = T.lat[vs[0]];
    for (let i = 1; i < n; i++) { let dx = T.lon[vs[i]] - T.lon[vs[i - 1]]; if (dx > X180) dx -= 2 * X180; else if (dx < -X180) dx += 2 * X180; cum += dx; X[i] = cum; Y[i] = T.lat[vs[i]]; }
    for (const qx of [px, px + 2 * X180, px - 2 * X180]) { let c = false; for (let i = 0, j = n - 1; i < n; j = i++) if ((Y[i] > py) !== (Y[j] > py) && qx < (X[j] - X[i]) * (py - Y[i]) / (Y[j] - Y[i]) + X[i]) c = !c; if (c) { inside = !inside; break; } }
  }
  return inside;
};
const faceBox = new Map();
const boxOf = (fi) => { let b = faceBox.get(fi); if (b) return b; let y0 = Infinity, y1 = -Infinity, bx0 = Infinity, bx1 = -Infinity; for (const vs of ringsOf(fi)) { let cum = T.lon[vs[0]]; if (cum < bx0) bx0 = cum; if (cum > bx1) bx1 = cum; for (let i = 0; i < vs.length; i++) { let dx = T.lon[vs[(i + 1) % vs.length]] - T.lon[vs[i]]; if (dx > X180) dx -= 2 * X180; else if (dx < -X180) dx += 2 * X180; if (i + 1 < vs.length) { cum += dx; if (cum < bx0) bx0 = cum; if (cum > bx1) bx1 = cum; } } for (const v of vs) { if (T.lat[v] < y0) y0 = T.lat[v]; if (T.lat[v] > y1) y1 = T.lat[v]; } } b = { y0, y1, x0: bx0, x1: bx1 }; faceBox.set(fi, b); return b; };
const inXBox = (b, px) => [px, px + 2 * X180, px - 2 * X180].some((x) => x >= b.x0 && x <= b.x1);
{ let made = 0;
  for (let ty = 0; ty < TILE.rows; ty++) for (let tx = 0; tx < TILE.cols; tx++) {
    if (tiles.has(tileKey(tx, ty))) continue;
    const x0 = -X180 + tx * W, y0 = -Y90 + ty * Hh, px = x0 + 2, py = y0 + 2;
    for (let fi = 0; fi < nF; fi++) { const b = boxOf(fi); if (py < b.y0 || py > b.y1 || !inXBox(b, px)) continue; if (faceContains(fi, px, py)) { tileAt(tx, ty); made++; break; } }
  }
  say(`${made} tiles touched by no ring lie inside a lake (whole-tile covers)`); }
let faceTotal = 0, edgeArcs = 0, fullCovers = 0;
for (const t of tiles.values()) {
  const x0 = t.x0, y0 = t.y0, x1 = x0 + W, y1 = y0 + Hh;
  const corner = (k) => (k % 4 === 0 ? [x0, y0] : k % 4 === 1 ? [x1, y0] : k % 4 === 2 ? [x1, y1] : [x0, y1]);
  const tileArcs = [], tileArcRef = [], tileFaces = [], tileFaceRef = [], tileLakeIds = [];
  const pieceArcId = new Map();
  const arcOfPiece = (p) => { let i = pieceArcId.get(p); if (i == null) { i = tileArcs.length; pieceArcId.set(p, i); tileArcs.push({ v: p.v, kind: T.arcKind[p.arc], source: T.arcSource[p.arc], flags: T.arcFlags[p.arc] }); tileArcRef.push({ core: coreOf[p.arc], bits: (p.atStart ? 1 : 0) | (p.atEnd ? 2 : 0) }); } return i; };
  const edgeArc = (vs) => { const i = tileArcs.length; tileArcs.push({ v: vs, kind: KIND.EDGE, source: 1, flags: 0 }); tileArcRef.push({ core: -1, bits: 0 }); edgeArcs++; return i; };
  const byFace = new Map();
  for (const p of t.pieces) { const l = left[p.arc]; if (l >= 0) (byFace.get(l) || byFace.set(l, []).get(l)).push({ p, dir: 1 }); }
  for (const [fi, dps] of byFace) {
    const startPos = (dp) => dp.p.pos0, endPos = (dp) => dp.p.pos1;
    const entries = dps.filter((dp) => startPos(dp) != null).sort((a, b) => startPos(a) - startPos(b));
    const byStartNode = new Map();
    for (const dp of dps) if (startPos(dp) == null) byStartNode.set(dp.p.arc, dp);
    const visited = new Set();
    const rings = [];
    for (const start of dps) {
      if (visited.has(start)) continue;
      const ring = []; let dp = start; let guard = 0;
      while (!visited.has(dp) && guard++ < 1e6) {
        visited.add(dp);
        ring.push(arcOfPiece(dp.p) + 1);
        const ep = endPos(dp);
        if (ep == null) {
          // interior end: a lake ring is one closed arc, so its successor is itself — the piece beginning at the arc's start
          const next = byStartNode.get(dp.p.arc);
          if (!next) throw new Error(`lake face ${fi}: arc ${dp.p.arc} has no piece beginning at its start in tile ${t.tx},${t.ty}`);
          dp = next;
        } else {
          const open = (e) => !visited.has(e) || e === start;
          const ahead = entries.filter((e) => startPos(e) >= ep && open(e));
          let next = ahead[0] || entries.find(open);
          if (ahead.length && startPos(ahead[0]) === ep) next = ahead.find((e) => startPos(e) === ep && e.p.arc === dp.p.arc) || ahead[0];
          if (!next) throw new Error(`lake face ${fi}: exit without an entry in tile ${t.tx},${t.ty}`);
          const sp = startPos(next);
          const vs = [dp.p.v[dp.p.v.length - 1]];
          let k = Math.floor(ep) + 1; const target = sp > ep ? sp : sp + 4;
          for (; k < target; k++) { const c = corner(k); vs.push(vtx(t, c[0], c[1])); }
          vs.push(next.p.v[0]);
          if (vs.length >= 2 && vs[0] !== vs[vs.length - 1]) ring.push(edgeArc(vs) + 1);
          dp = next;
        }
      }
      if (dp !== start) throw new Error(`lake face ${fi}: ring did not return to its start in tile ${t.tx},${t.ty}`);
      rings.push(ring);
    }
    tileFaces.push({ entity: T.faces[fi].entity, source: T.faces[fi].source, rings }); tileFaceRef.push(coreFaceOf[fi]); tileLakeIds.push(H.lakeIds ? H.lakeIds[fi] : 0); faceTotal++;
  }
  const px = x0 + 2, py = y0 + 2;
  for (let fi = 0; fi < nF; fi++) {
    if (byFace.has(fi) || faceOut[fi]) continue;
    const b = boxOf(fi); if (py < b.y0 || py > b.y1 || !inXBox(b, px)) continue;
    if (!faceContains(fi, px, py)) continue;
    const vs = [0, 1, 2, 3, 0].map((k) => { const c = corner(k); return vtx(t, c[0], c[1]); });
    tileFaces.push({ entity: T.faces[fi].entity, source: T.faces[fi].source, rings: [[edgeArc(vs) + 1]] }); tileFaceRef.push(coreFaceOf[fi]); tileLakeIds.push(H.lakeIds ? H.lakeIds[fi] : 0); faceTotal++; fullCovers++;
  }
  t.arcs = tileArcs; t.arcRef = tileArcRef; t.faces = tileFaces; t.faceRef = tileFaceRef; t.lakeIds = tileLakeIds;
}
say(`${faceTotal} lake face pieces (${fullCovers} whole-tile covers), ${edgeArcs} edge chords`);
// write the tiles
const present = [], sizes = [], tileFiles = [];
let bytesTotal = 0, largest = { bytes: 0 };
for (const t of [...tiles.values()].sort((p, q) => p.tx - q.tx || p.ty - q.ty)) {
  if (!t.faces.length) continue;
  let nV = 0; for (const a of t.arcs) nV += a.v.length;
  const lon = new Int32Array(nV), lat = new Int32Array(nV), rank = new Uint8Array(nV);
  const arcs = []; let off = 0;
  for (const a of t.arcs) { for (let i = 0; i < a.v.length; i++) { lon[off + i] = t.vx[a.v[i]]; lat[off + i] = t.vy[a.v[i]]; } arcs.push({ offset: off, count: a.v.length, kind: a.kind, source: a.source, minLod: 0, flags: a.flags }); off += a.v.length; }
  const topology = {
    quantum: Q, lod: { intervals_m: [H.lod.intervals_m[L]], level: L, note: "one level: the tile's own; ranks are all 0" },
    generated, generator, sources: H.sources, entities: [], entityCount: H.entities.length, steps: [],
    vertices: { lon, lat }, rank, arcs, faces: t.faces, arcRef: t.arcRef, faceRef: t.faceRef,
    extra: { water: true, lakeIds: t.lakeIds, tile: { z: L, x: t.tx, y: t.ty, lon0: t.x0 * Q, lat0: t.y0 * Q, lon1: (t.x0 + W) * Q, lat1: (t.y0 + Hh) * Q, interval_m: H.lod.intervals_m[L] }, core: { buildId, entities: H.entities.length, faces: coreFaces.length }, buildId },
  };
  const bytes = F.write(topology);
  tileFiles.push({ rel: path.join("water", `${t.tx}-${t.ty}.bin`), bytes });
  present.push(`${t.tx}-${t.ty}`); sizes.push(bytes.length); bytesTotal += bytes.length;
  if (bytes.length > largest.bytes) largest = { bytes: bytes.length, tile: `${t.tx}-${t.ty}`, vertices: nV, arcs: arcs.length, faces: t.faces.length };
}
sizes.sort((a, b) => a - b);
const med = (arr) => arr.length ? arr[Math.floor(arr.length / 2)] : 0;
say(`water tiles: ${present.length} files, ${(bytesTotal / 1048576).toFixed(2)} MB, median ${(med(sizes) / 1024).toFixed(1)} KB, largest ${(largest.bytes / 1024).toFixed(1)} KB (${largest.tile})`);

/* ---------- the core file ---------- */
const riversOut = H.rivers.map((r) => ({ entity: r.entity, arcs: r.arcs.map((ref) => coreOf[ref - 1] + 1).filter((x) => x > 0) }));
const core = {
  quantum: Q, lod: { intervals_m: H.lod.intervals_m.slice(0, RESIDENT), note: "resident levels; the one tile level is in header.tiles", tiles_m: H.lod.intervals_m.slice(RESIDENT) },
  generated, generator, sources: H.sources, entities: H.entities, steps: [],
  vertices: { lon: coreLon, lat: coreLat }, rank: coreRank, arcs: coreArcs, faces: coreFaces,
  extra: { water: true, rivers: riversOut, lakeIds: coreLakeIds, lakeArea_km2: H.lakeArea_km2, riverRankLod: H.riverRankLod, distances_m: H.distances_m, landBuildId: H.landBuildId, built: H.built, buildId, riverRanks: "river arcs keep every vertex (ranks 0–3) in this file; the worker smooths them past LOD 2",
    tiles: { [L]: { z: L, cols: TILE.cols, rows: TILE.rows, interval_m: H.lod.intervals_m[L], present } } },
};
const coreBytes = F.write(core);
say(`water.bin: ${coreBytes.length} bytes (${(coreBytes.length / 1048576).toFixed(3)} MB)`);
{ const h = F.read(coreBytes, { headerOnly: true }).header; const parts = Object.entries(h.sections).map(([k, v]) => `${k} ${(v.length / 1024).toFixed(1)} KB`); console.log(`  header ${(JSON.stringify(h).length / 1024).toFixed(1)} KB; ` + parts.join(", ")); }
const report = { buildId, generated, minTileKm2: MIN_TILE_KM2, lakesLeftOutOfTiles: leftOut, core: { bytes: coreBytes.length, vertices: coreLon.length, arcs: coreArcs.length, riverArcs: coreArcs.filter((a) => a.kind === KIND.RIVER).length, lakeArcs: coreArcs.filter((a) => a.kind === KIND.LAKE).length, faces: coreFaces.length, rivers: riversOut.length, levels: H.lod.intervals_m.slice(0, RESIDENT) },
  tiles: { z: L, cols: TILE.cols, rows: TILE.rows, interval_m: H.lod.intervals_m[L], files: present.length, bytes: bytesTotal, medianBytes: med(sizes), largest, facePieces: faceTotal, edgeChords: edgeArcs, wholeTileCovers: fullCovers },
  totalBytes: coreBytes.length + bytesTotal, files: 1 + tileFiles.length };
console.log(`  water in all: ${(report.totalBytes / 1048576).toFixed(2)} MB in ${report.files} files (budget 12 MB)`);
if (dry) { console.log(JSON.stringify(report, null, 1)); process.exit(0); }
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, "water"), { recursive: true });
fs.writeFileSync(path.join(DIST, "water.bin"), coreBytes);
for (const f of tileFiles) fs.writeFileSync(path.join(DIST, f.rel), f.bytes);
fs.writeFileSync(path.join(DIST, "water-report.json"), JSON.stringify(report, null, 1));
say(`wrote out/dist-water/ (${1 + tileFiles.length} files)`);
if (install) {
  fs.rmSync(path.join(SITE, "water"), { recursive: true, force: true });
  fs.rmSync(path.join(SITE, "water.bin"), { force: true });
  fs.cpSync(DIST, SITE, { recursive: true });
  fs.rmSync(path.join(SITE, "water-report.json"), { force: true });
  say(`installed into atlas/data/ (water.bin + water/)`);
  writeWaterTwin();
  require("./build-credits.js").build({ install: true });   // the credits page follows every install (Phase 1d)
}
