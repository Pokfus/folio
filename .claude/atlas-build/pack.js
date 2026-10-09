#!/usr/bin/env node
/* pack.js — step 8 of the Atlas v2 build: the intermediate topology → the files the site serves.

     node pack.js              out/full.bin → out/dist/topology.bin, out/dist/tiles/{3,4}/<x>-<y>.bin,
                               out/dist/tiles-report.json
     node pack.js --install    …and then replace atlas/data/topology.bin and atlas/data/tiles/ with them
     node pack.js --dry        build everything in memory, print the report, write nothing

   THE CORE FILE (atlas/data/topology.bin) holds levels 0–2 of every arc that is drawable at one of
   them, every face (its rings restricted to those arcs — a ring that is one closed islet arc too small
   for level 2 is left out, and a face none of whose rings survive is written with no rings so its
   index stays valid), every entity and step, and the tile index: which tiles exist at each level.

   THE TILES (atlas/data/tiles/<z>/<x>-<y>.bin) carry level z of the same arcs, cut at the tile's
   edges, and — the decision recorded in docs/atlas-v2-design.md §2.3 — EACH FACE CLIPPED TO THE TILE
   as fill rings of its own, so a fill is triangulated from exactly the ring its stroke is drawn from
   at that level. A clipped ring closes along the tile's boundary with chords of kind EDGE, which the
   renderer never strokes. Tile arcs name the core arc they are a piece of (arcRef), tile faces name
   the core face (faceRef), and the entity indices are the core's. z=3 is 8×4 tiles of 45°, z=4 is
   32×16 of 11.25°; a tile with no land is not written and is absent from the index.

   HOW A FACE IS CLIPPED (per tile, per layer — admin-0 faces and admin-1 faces separately): every arc
   piece inside the tile knows which face lies on its left and right at that layer. Starting from any
   piece walked with face F on its left, follow F's pieces: at a piece's end inside the tile continue
   with F's ring successor; at the tile edge turn along the boundary counter-clockwise (interior on
   the left) to F's next piece entering the tile, emitting the chord — through any corners passed — as
   one EDGE arc. A face with no piece in the tile but containing a corner covers the whole tile and
   gets the rectangle. Because every vertex of the topology is nudged off the tile lines by
   build-admin.js, every crossing is proper and every entry/exit alternates.

   Determinism: the same full.bin gives the same bytes except the `generated` stamps; the `buildId`
   (sha256 of full.bin) in every header ties the tiles to their core.
*/
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const F = require("./lib/format.js");
const R = require("./lib/rings.js");
const G = require("./lib/geo.js");

const HERE = __dirname, OUT = path.join(HERE, "out"), DIST = path.join(OUT, "dist");
const SITE = path.join(HERE, "..", "..", "atlas", "data");
const argv = process.argv.slice(2);
const dry = argv.includes("--dry"), install = argv.includes("--install");
/* --twin alone: write atlas/data/topology.bin.js (the file:// twin, lib/twin.js) from the COMMITTED core and stop — the one step
   of this script a cloud session without out/full.bin can run (Phase 1d) */
if (argv.includes("--twin")) { const r = require("./lib/twin.js").writeTwin(path.join(SITE, "topology.bin")); console.log(`twin: ${r.file} ${r.twinBytes} bytes for ${r.bytes} (sha256 ${r.sha256.slice(0, 16)}…)`); require("./build-credits.js").build({ install: true }); process.exit(0); }
const RESIDENT = 3;                              // levels 0–2 in the core
const TILE_LEVELS = [{ z: 3, cols: 8, rows: 4 }, { z: 4, cols: 32, rows: 16 }];
const KIND = F.KIND;
const Q = R.QUANTUM, X180 = R.X180, Y90 = R.Y90;
const t0 = Date.now();
const say = (m) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${m}`);

const fullBytes = fs.readFileSync(path.join(OUT, "full.bin"));
const buildId = crypto.createHash("sha256").update(fullBytes).digest("hex").slice(0, 16);
const T = F.read(new Uint8Array(fullBytes));
const H = T.header, nA = T.arcOffset.length - 1, nF = T.faces.length;
const FINEST = T.lodCount - 1;
say(`full.bin: ${T.lon.length} vertices, ${nA} arcs, ${nF} faces, ${H.entities.length} entities, ${T.lodCount} levels; buildId ${buildId}`);
/* No vertex may lie on a z=4 tile line (a multiple of 11.25°): build-admin.js nudges them, but its
   crossing repair can insert a vertex afterwards (a reserve coast vertex, a junction) that lands on one.
   The same one-quantum nudge here is the authoritative pass: core and tiles are both cut from it. */
{ const TILE_U = Math.round(11.25 / Q); let nudged = 0;
  for (let i = 0; i < T.lon.length; i++) {
    if (T.lon[i] % TILE_U === 0) { T.lon[i] += 1; nudged++; }
    if (T.lat[i] % TILE_U === 0) { T.lat[i] += T.lat[i] > 0 ? -1 : 1; nudged++; }
    if (T.lon[i] >= X180) T.lon[i] -= 2 * X180;
  }
  say(`nudged ${nudged} coordinates off the tile lines`); }
const generated = new Date().toISOString();
const generator = "folio atlas-build: build-land.js → build-admin.js → pack.js (" + require("./package.json").version + ")";
const layerOf = (f) => (H.entities[T.faces[f].entity].parent ? 1 : 0);

/* ---------- per arc: faces on each side, per layer; ring successors ---------- */
const side = [new Int32Array(nA * 2).fill(-1), new Int32Array(nA * 2).fill(-1)];   // [layer][arc*2 + (0 left | 1 right)]
const succ = new Map();   // `${layer}:${face}:${ref}` → next ref in the ring
T.faces.forEach((f, fi) => {
  const L = layerOf(fi);
  for (const ring of f.rings) for (let k = 0; k < ring.length; k++) {
    const ref = ring[k], a = Math.abs(ref) - 1;
    side[L][a * 2 + (ref > 0 ? 0 : 1)] = fi;
    succ.set(L + ":" + fi + ":" + ref, ring[(k + 1) % ring.length]);
  }
});

/* ---------- the core ---------- */
function drawableAt(a, level) { return T.arcMinLod[a] <= level; }
const coreOf = new Int32Array(nA).fill(-1);
{
  let nV = 0, nArcs = 0;
  for (let a = 0; a < nA; a++) if (drawableAt(a, RESIDENT - 1)) { coreOf[a] = nArcs++; for (let i = T.arcOffset[a]; i < T.arcOffset[a + 1]; i++) if (T.rank[i] <= RESIDENT - 1) nV++; }
  var coreLon = new Int32Array(nV), coreLat = new Int32Array(nV), coreRank = new Uint8Array(nV), coreArcs = [];
  let off = 0;
  for (let a = 0; a < nA; a++) {
    if (coreOf[a] < 0) continue;
    let count = 0;
    for (let i = T.arcOffset[a]; i < T.arcOffset[a + 1]; i++) if (T.rank[i] <= RESIDENT - 1) { coreLon[off + count] = T.lon[i]; coreLat[off + count] = T.lat[i]; coreRank[off + count] = T.rank[i]; count++; }
    coreArcs.push({ offset: off, count, kind: T.arcKind[a], source: T.arcSource[a], minLod: T.arcMinLod[a], flags: T.arcFlags[a] });
    off += count;
  }
  var coreFaces = []; let droppedRings = 0, emptyFaces = 0;
  for (const f of T.faces) {
    const rings = [];
    for (const ring of f.rings) {
      const present = Array.from(ring).map((ref) => coreOf[Math.abs(ref) - 1] >= 0);
      if (present.every((p) => p)) rings.push(Array.from(ring).map((ref) => ref > 0 ? coreOf[ref - 1] + 1 : -(coreOf[-ref - 1] + 1)));
      else if (present.some((p) => p)) throw new Error("a face ring mixes resident and tile-only arcs");
      else droppedRings++;
    }
    if (!rings.length) emptyFaces++;
    coreFaces.push({ entity: f.entity, source: f.source, rings });
  }
  say(`core: ${coreArcs.length} arcs, ${nV} vertices, ${coreFaces.length} faces (${droppedRings} islet rings below level 2 left to the tiles, ${emptyFaces} faces with no resident ring)`);
}

/* ---------- tiles ---------- */
const tileReport = {};
const tileIndex = {};
const tileFiles = [];   // { rel, bytes }
for (const TL of TILE_LEVELS) {
  const L = TL.z, W = (2 * X180) / TL.cols, Hh = (2 * Y90) / TL.rows;
  if (W !== Math.round(W) || Hh !== Math.round(Hh)) throw new Error("tile size must be whole quanta");
  const tiles = new Map();   // key → { x, y, pieces: [], vertsByKey: Map, verts: [], events }
  const tileKey = (tx, ty) => tx * 1000 + ty;
  const tileAt = (tx, ty) => { const k = tileKey(tx, ty); let t = tiles.get(k); if (!t) tiles.set(k, t = { tx, ty, x0: -X180 + tx * W, y0: -Y90 + ty * Hh, pieces: [], firstPiece: new Map(), vkey: new Map(), vx: [], vy: [], arcs: [], faces: [] }); return t; };
  const vtx = (t, x, y) => { const k = R.pkey(x, y); let v = t.vkey.get(k); if (v == null) { v = t.vx.length; t.vkey.set(k, v); t.vx.push(x); t.vy.push(y); } return v; };
  // 1. arc pieces per tile
  let piecesTotal = 0;
  for (let a = 0; a < nA; a++) {
    if (!drawableAt(a, L)) continue;
    const idx = []; for (let i = T.arcOffset[a]; i < T.arcOffset[a + 1]; i++) if (T.rank[i] <= L) idx.push(i);
    // walk the polyline in an unwrapped frame, cutting at grid lines
    let cur = null;   // { t: tile, v: [vertex ids], start: bool }
    let ux = T.lon[idx[0]];                       // unwrapped x of the current vertex
    const tileOf = (x, y) => { let tx = Math.floor((x + X180) / W), ty = Math.floor((y + Y90) / Hh); tx = ((tx % TL.cols) + TL.cols) % TL.cols; ty = Math.max(0, Math.min(TL.rows - 1, ty)); return tileAt(tx, ty); };
    const wrapX = (x) => { x = ((x + X180) % (2 * X180) + 2 * X180) % (2 * X180) - X180; return x; };
    const begin = (t, x, y, atStart) => { cur = { t, v: [vtx(t, wrapX(x), y)], atStart, pos0: atStart ? null : boundaryPos(t, wrapX(x), y) }; };
    const finish = (x, y, atEnd) => { cur.v.push(vtx(cur.t, wrapX(x), y)); cur.atEnd = atEnd; cur.pos1 = atEnd ? null : boundaryPos(cur.t, wrapX(x), y); if (cur.v.length >= 2 && cur.v.some((v) => v !== cur.v[0])) { cur.arc = a; cur.t.pieces.push(cur); piecesTotal++; } cur = null; };
    function boundaryPos(t, x, y) {
      // position along the tile's boundary, counter-clockwise from its SW corner, in [0, 4)
      const x0 = t.x0, y0 = t.y0, x1 = x0 + W, y1 = y0 + Hh;
      let X = x; if (X - x0 > X180) X -= 2 * X180; else if (x0 - X > X180) X += 2 * X180;
      if (y === y0) return (X - x0) / W;
      if (X === x1) return 1 + (y - y0) / Hh;
      if (y === y1) return 2 + (x1 - X) / W;
      if (X === x0) return 3 + (y1 - y) / Hh;
      throw new Error(`point ${x},${y} is not on the boundary of tile ${t.tx},${t.ty} at z=${L}`);
    }
    let t = tileOf(T.lon[idx[0]], T.lat[idx[0]]);
    begin(t, ux, T.lat[idx[0]], true);
    /* An arc that leaves a tile and re-enters at the same rounded point (an excursion shorter than a
       quantum) is treated as not crossing at all: the split is undone on both sides. Dropping only the
       zero-length piece would leave the neighbour's boundary split at a point this tile does not know,
       and the edge chords would no longer match (measured: 65 of 4,515 at z=4 on the first build). */
    let lastCross = null;   // { x, y, piece: the piece finished there, tile }
    // The excursion's own vertex (outside this tile, up to a few quanta past the line) is NOT kept: the piece
    // touches the line at the shared crossing point instead, or its two segments to that vertex would cross
    // the edge chord that runs along the line (measured: 10 such crossings at z=4, Victoria Island's coast)
    const undoLast = () => { const p = lastCross.piece; const i = p.t.pieces.lastIndexOf(p); if (i >= 0) { p.t.pieces.splice(i, 1); piecesTotal--; } p.v.pop(); p.v.push(vtx(p.t, lastCross.x, lastCross.y)); p.atEnd = false; p.pos1 = null; cur = p; lastCross = null; };
    for (let k = 1; k < idx.length; k++) {
      const x1 = ux, y1 = T.lat[idx[k - 1]];
      let x2 = T.lon[idx[k]]; const y2 = T.lat[idx[k]];
      let dx = x2 - wrapX(x1); if (dx > X180) dx -= 2 * X180; else if (dx < -X180) dx += 2 * X180;
      x2 = x1 + dx;
      // crossings with vertical and horizontal grid lines strictly between the endpoints
      const hits = [];
      const gx0 = Math.min(x1, x2), gx1 = Math.max(x1, x2);
      for (let gx = (Math.floor((gx0 + X180) / W) + 1) * W - X180; gx < gx1; gx += W) if (gx > gx0) hits.push({ t: (gx - x1) / (x2 - x1), x: gx, y: null });
      const gy0 = Math.min(y1, y2), gy1 = Math.max(y1, y2);
      for (let gy = (Math.floor((gy0 + Y90) / Hh) + 1) * Hh - Y90; gy < gy1; gy += Hh) if (gy > gy0) hits.push({ t: (gy - y1) / (y2 - y1), x: null, y: gy });
      hits.sort((p, q) => p.t - q.t);
      for (let hi = 0; hi < hits.length; hi++) {
        const h = hits[hi];
        const px = h.x != null ? h.x : Math.round(x1 + h.t * (x2 - x1)), py = h.y != null ? h.y : Math.round(y1 + h.t * (y2 - y1));
        if (h.x == null && (px + X180) % W === 0) throw new Error("a crossing landed on a tile corner — build-admin's nudge should have prevented it");
        if (h.y == null && (py + Y90) % Hh === 0) throw new Error("a crossing landed on a tile corner (lat)");
        if (lastCross && lastCross.x === px && lastCross.y === py && cur.v.length <= 2) { undoLast(); continue; }   // out and straight back in (at most one vertex, within a quantum of the line): no crossing
        const finishedHere = cur;
        finish(px, py, false);
        lastCross = finishedHere.t.pieces[finishedHere.t.pieces.length - 1] === finishedHere ? { x: px, y: py, piece: finishedHere } : null;
        // the next tile: the one containing the stretch between this crossing and the next (or the segment's end)
        const tn = hi + 1 < hits.length ? hits[hi + 1].t : 1;
        const tm = (h.t + tn) / 2;
        const nx = x1 + tm * (x2 - x1), ny = y1 + tm * (y2 - y1);
        begin(tileOf(wrapX(nx), ny), px, py, false);   // not rounded: a midpoint half a quantum from the line must not round onto it
      }
      cur.v.push(vtx(cur.t, wrapX(x2), y2));
      if (cur.v.length > 2) lastCross = null;   // two vertices inside: the excursion is real
      ux = x2;
    }
    // the last vertex was pushed; mark the end
    cur.atEnd = true; cur.pos1 = null; cur.arc = a; if (cur.v.length >= 2 && cur.v.some((v) => v !== cur.v[0])) { cur.t.pieces.push(cur); piecesTotal++; }
    cur = null;
  }
  say(`z=${L}: ${tiles.size} tiles touched by ${piecesTotal} arc pieces`);
  if (process.env.DEBUG_FACE) {
    const fi = Number(process.env.DEBUG_FACE), Ly = layerOf(fi);
    for (let a = 0; a < nA; a++) if (side[Ly][a * 2] === fi || side[Ly][a * 2 + 1] === fi) {
      const s = T.arcOffset[a], e = T.arcOffset[a + 1];
      const where = []; for (const t of tiles.values()) for (const p of t.pieces) if (p.arc === a) where.push(`tile ${t.tx},${t.ty}: ${p.atStart ? "S" : "b" + p.pos0.toFixed(4)}→${p.atEnd ? "E" : "b" + p.pos1.toFixed(4)} (${p.v.length} v)`);
      console.log(`  DEBUG arc ${a} kind ${T.arcKind[a]} L${side[Ly][a * 2]} R${side[Ly][a * 2 + 1]} verts ${e - s} rank≤${L}: ${Array.from({ length: e - s }, (_, i) => i + s).filter((i) => T.rank[i] <= L).length}; ends ${(T.lon[s] * Q).toFixed(4)},${(T.lat[s] * Q).toFixed(4)} → ${(T.lon[e - 1] * Q).toFixed(4)},${(T.lat[e - 1] * Q).toFixed(4)}; pieces: ${where.join(" | ")}`);
    }
  }
  // 2. faces per tile per layer
  const faceRingsAt = new Map();   // for containment: face → rings as vertex index lists at level L (lazy)
  const ringsOf = (fi) => {
    let r = faceRingsAt.get(fi); if (r) return r;
    r = [];
    for (const ring of T.faces[fi].rings) {
      const vs = []; let skip = false;
      for (const ref of ring) { const a = Math.abs(ref) - 1; if (!drawableAt(a, L)) { skip = true; break; } const s = T.arcOffset[a], e = T.arcOffset[a + 1]; if (ref > 0) { for (let i = s; i < e - 1; i++) if (T.rank[i] <= L) vs.push(i); } else { for (let i = e - 1; i > s; i--) if (T.rank[i] <= L) vs.push(i); } }
      if (!skip && vs.length >= 3) r.push(vs);
    }
    faceRingsAt.set(fi, r); return r;
  };
  const faceContains = (fi, px, py) => {
    let inside = false;
    for (const vs of ringsOf(fi)) {
      const n = vs.length; const bx = T.lon[vs[0]];
      // unwrap relative to the ring's first vertex; test px at three longitudes
      let X = new Float64Array(n), Y = new Float64Array(n); let cum = bx; X[0] = cum; Y[0] = T.lat[vs[0]];
      let turn = 0;
      for (let i = 1; i < n; i++) { let dx = T.lon[vs[i]] - T.lon[vs[i - 1]]; if (dx > X180) dx -= 2 * X180; else if (dx < -X180) dx += 2 * X180; cum += dx; turn += dx; X[i] = cum; Y[i] = T.lat[vs[i]]; }
      { let dx = T.lon[vs[0]] - T.lon[vs[n - 1]]; if (dx > X180) dx -= 2 * X180; else if (dx < -X180) dx += 2 * X180; turn += dx; }
      let m = n;
      if (Math.abs(turn) > X180) { const pole = Y.reduce((s, y) => s + y, 0) / n < 0 ? -Y90 : Y90; const X2 = new Float64Array(n + 3), Y2 = new Float64Array(n + 3); X2.set(X); Y2.set(Y); X2[n] = X[0] + turn; Y2[n] = Y[0]; X2[n + 1] = X[0] + turn; Y2[n + 1] = pole; X2[n + 2] = X[0]; Y2[n + 2] = pole; X = X2; Y = Y2; m = n + 3; }   // close the turn at the first vertex one lap on, then down to the pole and back along it: the pole edge spans the full 360°, not the lap minus the closing edge (measured: the pole corner of the antimeridian cell tested outside Antarctica)
      for (const qx of [px, px + 2 * X180, px - 2 * X180]) {
        let c = false;
        for (let i = 0, j = m - 1; i < m; j = i++) if ((Y[i] > py) !== (Y[j] > py) && qx < (X[j] - X[i]) * (py - Y[i]) / (Y[j] - Y[i]) + X[i]) c = !c;
        if (c) { inside = !inside; break; }
      }
    }
    return inside;
  };
  const faceBox = new Map();
  // a ring that circles a pole reaches it: Antarctica's box runs to -90° although its ice front stops near
  // -78.5°, so the z=4 pole row (-90..-78.75) is whole-tile covers (measured: without this the row was empty
  // and the renderer showed sea south of the ice front at the cap)
  const boxOf = (fi) => { let b = faceBox.get(fi); if (b) return b; let y0 = Infinity, y1 = -Infinity, bx0 = Infinity, bx1 = -Infinity, polar = false; for (const vs of ringsOf(fi)) { let turn = 0, sum = 0, cum = T.lon[vs[0]]; if (cum < bx0) bx0 = cum; if (cum > bx1) bx1 = cum; for (let i = 0; i < vs.length; i++) { let dx = T.lon[vs[(i + 1) % vs.length]] - T.lon[vs[i]]; if (dx > X180) dx -= 2 * X180; else if (dx < -X180) dx += 2 * X180; turn += dx; sum += T.lat[vs[i]]; if (i + 1 < vs.length) { cum += dx; if (cum < bx0) bx0 = cum; if (cum > bx1) bx1 = cum; } } for (const v of vs) { if (T.lat[v] < y0) y0 = T.lat[v]; if (T.lat[v] > y1) y1 = T.lat[v]; } if (Math.abs(turn) > X180) { polar = true; if (sum < 0) y0 = -Y90; else y1 = Y90; } } b = { y0, y1, x0: bx0, x1: bx1, polar }; faceBox.set(fi, b); return b; };
  // the lon box is in the unwrapped frame of each ring's first vertex: test the point at three longitudes
  const inXBox = (b, px) => b.polar || [px, px + 2 * X180, px - 2 * X180].some((x) => x >= b.x0 && x <= b.x1);
  // 2b. A tile touched by no arc at all can still lie inside a face — the z=4 pole row under Antarctica's
  // ice front, a cell deep inside Brazil or Siberia with no line through it — and a tile that is not there
  // is drawn as sea. Create those tiles here, so the cover pass below gives each its face.
  { let made = 0;
    for (let ty = 0; ty < TL.rows; ty++) for (let tx = 0; tx < TL.cols; tx++) {
      if (tiles.has(tileKey(tx, ty))) continue;
      const x0 = -X180 + tx * W, y0 = -Y90 + ty * Hh, px = x0 + 2, py = y0 + 2;
      for (let fi = 0; fi < nF; fi++) { const b = boxOf(fi); if (py < b.y0 || py > b.y1 || !inXBox(b, px)) continue; if (faceContains(fi, px, py)) { tileAt(tx, ty); made++; break; } }
    }
    say(`z=${L}: ${made} tiles touched by no arc lie inside a face (whole-tile covers)`);
  }
  let faceTotal = 0, edgeArcs = 0, fullCovers = 0;
  for (const t of tiles.values()) {
    const x0 = t.x0, y0 = t.y0, x1 = x0 + W, y1 = y0 + Hh;
    const corner = (k) => (k % 4 === 0 ? [x0, y0] : k % 4 === 1 ? [x1, y0] : k % 4 === 2 ? [x1, y1] : [x0, y1]);
    // index: for each piece, the faces walking it forward (left) and backward (right), per layer
    for (const p of t.pieces) { t.firstPiece.set(p.arc * 2 + (p.atStart ? 0 : 1), p); }   // atStart: the piece that begins at the arc's start; also need the piece that ENDS at the arc's end
    const lastPiece = new Map(); for (const p of t.pieces) if (p.atEnd) lastPiece.set(p.arc, p);
    const pieceFaces = new Set();
    for (const p of t.pieces) for (const Ly of [0, 1]) { const l = side[Ly][p.arc * 2], r = side[Ly][p.arc * 2 + 1]; if (l >= 0) pieceFaces.add(Ly * 1e6 + l); if (r >= 0) pieceFaces.add(Ly * 1e6 + r); }
    const tileArcs = [], tileArcRef = [], tileFaces = [], tileFaceRef = [];
    const pieceArcId = new Map();   // piece → tile arc index
    const arcOfPiece = (p) => { let i = pieceArcId.get(p); if (i == null) { i = tileArcs.length; pieceArcId.set(p, i); tileArcs.push({ v: p.v, kind: T.arcKind[p.arc], source: T.arcSource[p.arc], flags: T.arcFlags[p.arc] }); tileArcRef.push({ core: coreOf[p.arc], bits: (p.atStart ? 1 : 0) | (p.atEnd ? 2 : 0), full: p.arc }); } return i; };
    const edgeArc = (vs) => { const i = tileArcs.length; tileArcs.push({ v: vs, kind: KIND.EDGE, source: 0, flags: 0 }); tileArcRef.push({ core: -1, bits: 0, full: -1 }); edgeArcs++; return i; };
    for (const Ly of [0, 1]) {
      // F-directed pieces: for face F, piece p walked forward if left==F, backward if right==F
      const byFace = new Map();
      for (const p of t.pieces) { const l = side[Ly][p.arc * 2], r = side[Ly][p.arc * 2 + 1]; if (l >= 0) (byFace.get(l) || byFace.set(l, []).get(l)).push({ p, dir: 1 }); if (r >= 0) (byFace.get(r) || byFace.set(r, []).get(r)).push({ p, dir: -1 }); }
      for (const [fi, dps] of byFace) {
        // entries: F-directed pieces beginning on the boundary, by boundary position
        const startPos = (dp) => (dp.dir > 0 ? dp.p.pos0 : dp.p.pos1), endPos = (dp) => (dp.dir > 0 ? dp.p.pos1 : dp.p.pos0);
        const entries = dps.filter((dp) => startPos(dp) != null).sort((a, b) => startPos(a) - startPos(b));
        const byStartNode = new Map();   // (arc, dir) → dp for pieces that begin at an interior node (the arc's start for +, end for −)
        for (const dp of dps) if (startPos(dp) == null) byStartNode.set(dp.p.arc * 2 + (dp.dir > 0 ? 0 : 1), dp);
        const visited = new Set();
        const rings = [];
        for (const start of dps) {
          if (visited.has(start)) continue;
          const ring = []; let dp = start; let guard = 0;
          while (!visited.has(dp) && guard++ < 1e6) {
            visited.add(dp);
            ring.push(dp.dir > 0 ? arcOfPiece(dp.p) + 1 : -(arcOfPiece(dp.p) + 1));
            const ep = endPos(dp);
            if (ep == null) {
              // interior end: the ring successor of this arc in F's ring, which begins at this node
              const ref = dp.dir > 0 ? dp.p.arc + 1 : -(dp.p.arc + 1);
              const nref = succ.get(Ly + ":" + fi + ":" + ref);
              if (nref == null) throw new Error(`no ring successor for face ${fi} ref ${ref}`);
              const na = Math.abs(nref) - 1;
              const next = byStartNode.get(na * 2 + (nref > 0 ? 0 : 1));
              if (!next) throw new Error(`face ${fi}: successor arc ${na} has no piece beginning at the node in tile ${t.tx},${t.ty} z=${L}`);
              dp = next;
            } else {
              // boundary exit: the next entry of F counter-clockwise
              const open = (e) => !visited.has(e) || e === start;   // the ring closes on its own start — which may be the very piece now exiting
              const ahead = entries.filter((e) => startPos(e) >= ep && open(e));
              let next = ahead[0] || entries.find(open);
              if (ahead.length && startPos(ahead[0]) === ep) next = ahead.find((e) => startPos(e) === ep && e.p.arc === dp.p.arc) || ahead[0];
              if (!next) { console.error(`face ${fi} (${H.entities[T.faces[fi].entity].id}) tile ${t.tx},${t.ty} z=${L}: exit at ${ep.toFixed(4)} with no unvisited entry; entries ${entries.map((e) => startPos(e).toFixed(4) + (visited.has(e) ? "v" : "")).join(" ")}`); throw new Error(`face ${fi}: exit without an entry in tile ${t.tx},${t.ty}`); }
              const sp = startPos(next);
              // the chord: exit point, corners passed, entry point
              const vs = [dp.dir > 0 ? dp.p.v[dp.p.v.length - 1] : dp.p.v[0]];
              let k = Math.floor(ep) + 1; const target = sp > ep ? sp : sp + 4;
              for (; k < target; k++) { const c = corner(k); vs.push(vtx(t, c[0], c[1])); }
              vs.push(next.dir > 0 ? next.p.v[0] : next.p.v[next.p.v.length - 1]);
              if (vs.length >= 2 && vs[0] !== vs[vs.length - 1]) ring.push(edgeArc(vs) + 1);
              dp = next;
            }
          }
          if (dp !== start) {
            const show = (d) => `arc${d.p.arc}${d.dir > 0 ? "+" : "-"}[${d.p.atStart ? "S" : "b" + d.p.pos0.toFixed(3)}→${d.p.atEnd ? "E" : "b" + d.p.pos1.toFixed(3)}] L${side[Ly][d.p.arc * 2]} R${side[Ly][d.p.arc * 2 + 1]}`;
            console.error(`face ${fi} (${H.entities[T.faces[fi].entity].id}) layer ${Ly} tile ${t.tx},${t.ty} z=${L}: walk from ${show(start)} reached visited ${show(dp)}; ring so far: ${ring.length} refs; entries: ${entries.map(show).join(" ")}`);
            throw new Error(`face ${fi}: ring did not return to its start in tile ${t.tx},${t.ty} z=${L}`);
          }
          rings.push(ring);
        }
        tileFaces.push({ entity: T.faces[fi].entity, source: T.faces[fi].source, rings }); tileFaceRef.push(fi); faceTotal++;
      }
      // faces covering the whole tile: no piece here, a corner (nudged inward) inside the face
      const px = x0 + 2, py = y0 + 2;
      for (let fi = 0; fi < nF; fi++) {
        if (layerOf(fi) !== Ly || byFace.has(fi)) continue;
        const b = boxOf(fi); if (py < b.y0 || py > b.y1 || !inXBox(b, px)) continue;
        if (!faceContains(fi, px, py)) continue;
        const vs = [0, 1, 2, 3, 0].map((k) => { const c = corner(k); return vtx(t, c[0], c[1]); });
        tileFaces.push({ entity: T.faces[fi].entity, source: T.faces[fi].source, rings: [[edgeArc(vs) + 1]] }); tileFaceRef.push(fi); faceTotal++; fullCovers++;
      }
    }
    t.arcs = tileArcs; t.arcRef = tileArcRef; t.faces = tileFaces; t.faceRef = tileFaceRef;
  }
  say(`z=${L}: ${faceTotal} face pieces (${fullCovers} whole-tile covers), ${edgeArcs} edge chords`);
  // 3. write
  const present = [], sizes = [], vcounts = [];
  let bytesTotal = 0, largest = { bytes: 0 };
  for (const t of [...tiles.values()].sort((p, q) => p.tx - q.tx || p.ty - q.ty)) {
    if (!t.faces.length) continue;   // an ocean tile crossed only by a water line, or touched by nothing drawn
    // vertices: arc by arc, in tile order
    let nV = 0; for (const a of t.arcs) nV += a.v.length;
    const lon = new Int32Array(nV), lat = new Int32Array(nV), rank = new Uint8Array(nV);
    const arcs = []; let off = 0;
    for (const a of t.arcs) { for (let i = 0; i < a.v.length; i++) { lon[off + i] = t.vx[a.v[i]]; lat[off + i] = t.vy[a.v[i]]; } arcs.push({ offset: off, count: a.v.length, kind: a.kind, source: a.source, minLod: 0, flags: a.flags }); off += a.v.length; }
    const x0 = t.x0, y0 = t.y0;
    const topology = {
      quantum: Q, lod: { intervals_m: [H.lod.intervals_m[L]], level: L, note: "one level: the tile's own; ranks are all 0" },
      generated, generator, sources: H.sources, entities: [], entityCount: H.entities.length, steps: [],
      vertices: { lon, lat }, rank, arcs, faces: t.faces, arcRef: t.arcRef.map((r) => ({ core: r.core, bits: r.bits })), faceRef: t.faceRef,
      extra: { tile: { z: L, x: t.tx, y: t.ty, lon0: x0 * Q, lat0: y0 * Q, lon1: (x0 + W) * Q, lat1: (y0 + Hh) * Q, interval_m: H.lod.intervals_m[L] }, core: { buildId, entities: H.entities.length, faces: nF }, buildId },
    };
    const bytes = F.write(topology);
    const rel = path.join("tiles", String(L), `${t.tx}-${t.ty}.bin`);
    tileFiles.push({ rel, bytes });
    present.push(`${t.tx}-${t.ty}`); sizes.push(bytes.length); vcounts.push(nV); bytesTotal += bytes.length;
    if (bytes.length > largest.bytes) largest = { bytes: bytes.length, tile: `${t.tx}-${t.ty}`, vertices: nV, arcs: arcs.length, faces: t.faces.length };
  }
  sizes.sort((a, b) => a - b); vcounts.sort((a, b) => a - b);
  const med = (arr) => arr.length ? arr[Math.floor(arr.length / 2)] : 0;
  tileReport[L] = { z: L, cols: TL.cols, rows: TL.rows, interval_m: H.lod.intervals_m[L], files: present.length, bytes: bytesTotal, vertices: vcounts.reduce((a, b) => a + b, 0), medianBytes: med(sizes), medianVertices: med(vcounts), largest, facePieces: faceTotal, edgeChords: edgeArcs, wholeTileCovers: fullCovers };
  tileIndex[L] = { z: L, cols: TL.cols, rows: TL.rows, interval_m: H.lod.intervals_m[L], present };
  say(`z=${L}: ${present.length} tiles, ${(bytesTotal / 1048576).toFixed(2)} MB, median ${(med(sizes) / 1024).toFixed(1)} KB, largest ${(largest.bytes / 1024).toFixed(1)} KB (${largest.tile})`);
}

/* ---------- the core file ---------- */
const core = {
  quantum: Q, lod: { intervals_m: H.lod.intervals_m.slice(0, RESIDENT), note: "resident levels; the tile levels are in header.tiles", tiles_m: H.lod.intervals_m.slice(RESIDENT) },
  generated, generator, sources: H.sources, entities: H.entities, steps: H.steps,
  vertices: { lon: coreLon, lat: coreLat }, rank: coreRank, arcs: coreArcs, faces: coreFaces,
  extra: Object.assign({}, { stepYears: H.stepYears, tolerances_m: H.tolerances_m, d_far_m: H.d_far_m, sourceVersions: H.sourceVersions, built: H.built, buildId, tiles: tileIndex }),
};
const coreBytes = F.write(core);
say(`topology.bin: ${coreBytes.length} bytes (${(coreBytes.length / 1048576).toFixed(3)} MB)`);
{ const h = F.read(coreBytes, { headerOnly: true }).header; const parts = Object.entries(h.sections).map(([k, v]) => `${k} ${(v.length / 1024).toFixed(1)} KB`); console.log(`  header ${(JSON.stringify(h).length / 1024).toFixed(1)} KB; ` + parts.join(", ")); }
const report = { buildId, generated, core: { bytes: coreBytes.length, vertices: coreLon.length, arcs: coreArcs.length, faces: coreFaces.length, levels: H.lod.intervals_m.slice(0, RESIDENT) }, tiles: tileReport, totalTileBytes: Object.values(tileReport).reduce((s, r) => s + r.bytes, 0), files: 1 + tileFiles.length };
console.log(`  tiles total ${(report.totalTileBytes / 1048576).toFixed(2)} MB in ${tileFiles.length} files; everything ${1 + tileFiles.length} files`);
if (dry) { console.log(JSON.stringify(report, null, 1)); process.exit(0); }
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, "tiles"), { recursive: true });
fs.writeFileSync(path.join(DIST, "topology.bin"), coreBytes);
for (const f of tileFiles) { fs.mkdirSync(path.dirname(path.join(DIST, f.rel)), { recursive: true }); fs.writeFileSync(path.join(DIST, f.rel), f.bytes); }
fs.writeFileSync(path.join(DIST, "tiles-report.json"), JSON.stringify(report, null, 1));
say(`wrote out/dist/ (${1 + tileFiles.length} files)`);
if (install) {
  fs.rmSync(path.join(SITE, "tiles"), { recursive: true, force: true });
  fs.cpSync(DIST, SITE, { recursive: true });
  fs.rmSync(path.join(SITE, "tiles-report.json"), { force: true });
  say(`installed into atlas/data/ (topology.bin + tiles/)`);
  { const r = require("./lib/twin.js").writeTwin(path.join(SITE, "topology.bin")); say(`twin for file://: ${r.file} (${(r.twinBytes / 1e6).toFixed(2)} MB)`); }
  require("./build-credits.js").build({ install: true });   // the credits page follows every install (Phase 1d)
}
