/* atlas-worker.js — Atlas v2's geometry worker (docs/atlas-v2-design.md §2.1–§2.3).

   It takes the raw bytes of atlas/data/topology.bin and hands the main thread GPU-ready arrays, one
   level of detail at a time, coarsest first, so the globe paints as soon as LOD 0 is in:

     in   { type: "load", buffer }                   the file, transferred
     out  { type: "meta", header, faceEntity }       the JSON header (entities, steps, sources) and
                                                     which entity each face belongs to
     out  { type: "lod", level, segs, faces, ... }   per level: arc segments as unit-vector endpoint
                                                     pairs, and face triangles with a per-vertex face
                                                     id, every buffer transferred
     out  { type: "done", stats }                    timings and counts, for the perf suite and the log
     in   { type: "tile", key, buffer }              one tile (atlas/data/tiles/<z>/<x>-<y>.bin), transferred
     out  { type: "tile", key, segs, faces, ... }    the tile's segments and fill triangles in the same
                                                     shape as a level (Phase 1a: a tile IS a level, local
                                                     to its rectangle; its faces carry the CORE face index
                                                     so the style texture and the ID pass need nothing new)
     out  { type: "error", message }
     in   { type: "water", buffer }                  atlas/data/water.bin (Phase 1b), transferred
     out  { type: "water-meta", header }
     out  { type: "water-lod", level, lakeSegs…, riverSegs…, riverSmooth…, facePos… }
                                                     per resident water level: lake shores and rivers as
                                                     bucketed segment lists of their own, lake fills as
                                                     triangles; level 2 also carries the rivers smoothed
                                                     (two Chaikin passes over every vertex) for the tile zooms
     in   { type: "water-tile", key, buffer }        one water tile (atlas/data/water/<x>-<y>.bin)
     out  { type: "water-tile", key, lakeSegs…, facePos… }
     in   { type: "history", buffer }                atlas/data/history.bin (Phase 2a): the step topology of the historical
                                                     polities, conflated onto this core (header.core.buildId must match)
     out  { type: "history-meta", header, faceEntity, faceCap, faceArea }
     out  { type: "history-segs", level, segs… }     per resident level: the historical borders (own arcs and inherited
                                                     present-day border references) as a bucketed segment list, tag kind 7
     in   { type: "history-faces", level, faces, seq } the alive faces a year needs at a level (and the look-ahead ones)
     out  { type: "history-faces", level, meshes, seq } the meshes not yet resident on the main thread, each a small
                                                     (pos, idx) pair triangulated here and cached in an LRU
     in   { type: "history-evict", keys }            the main thread dropped these face:level meshes (its own LRU)
     in   { type: "relief", key, w, h, hi, lo, sh }  three greyscale ImageBitmaps (Phase 1b), transferred
     out  { type: "relief", key, w, h, rgb }         one RGB Uint8Array: shade, height high byte, low byte —
                                                     composed here on an OffscreenCanvas so the main thread
                                                     never reads 12 MB of pixels inside a frame

   WHY HERE AND NOT IN THE FILE (§2.3): triangle indices for every face would add megabytes to the
   wire; triangulating 258 faces at three levels takes well under a second here and never blocks a
   frame. WHY PER LEVEL: the fill is triangulated from the SAME simplified ring the stroke is drawn
   from, so the two agree exactly at every zoom, and the triangle count at globe scale is a tenth of
   the finest level's — which is what keeps the CI runner's software GL inside the frame budget.

   HOW A FACE IS TRIANGULATED: its rings (vertices surviving at this level) are projected
   azimuthal-equidistant about the face's own centroid, so Russia and Antarctica have no wrap or
   pole problem; rings that turn clockwise in that plane are holes and are attached to the outer ring
   that contains them; earcut does the rest. Every triangle edge longer than the level's chord
   threshold (4.1° / 2.3° / 1.0° — the angle at which a flat chord dips under the sphere by a quarter
   pixel at the zoom the level is first drawn) is bisected at its spherical midpoint, recursively,
   so no flat triangle visibly cuts through the globe. Midpoints are shared between the two triangles
   on an edge, so subdivision never opens a crack.

   The file is written to run in BOTH a Worker (importScripts) and, where workers are refused —
   file:// — on the main thread behind the same message shape (atlas.js's shim); nothing here touches
   the DOM. Earcut (atlas/vendor/earcut.js, ISC) is the only library.
*/
"use strict";
(function (root) {
  const IN_WORKER = typeof importScripts === "function";
  if (IN_WORKER) importScripts("atlas-format.js", "vendor/earcut.js");

  const CHORD_DEG = [4.1, 2.3, 1.0, 0.5, 0.3];   // per level 0–4: a quarter pixel of sag at each level's first use (levels 3–4 are tiles)
  /* COOPERATIVE YIELDING (Phase 1d). In a Worker nothing here needs to yield: a frame is never behind this thread. On
     the main thread (the file:// shim, or a worker that failed to start) the same code must not hold the page for the
     two seconds LOD 2 costs, so every heavy loop awaits `tick()` — a no-op in the worker, and in the shim a setTimeout(0)
     whenever more than Y.every ms have passed since the last one, which hands the event loop a frame and lets the
     progress bar move. The functions are async either way: one code path, one set of bugs. */
  const Y = { shim: false, last: 0, every: 40, progress: null };
  function tick(text, frac) { if (!Y.shim) return null; const t = now(); if (t - Y.last < Y.every) return null; Y.last = t; if (Y.progress && text) Y.progress(text, frac); return new Promise((r) => setTimeout(r, 0)); }
  const D2R = Math.PI / 180;
  const KIND_RIVER = 2, KIND_LAKE = 3;
  const LAKE_FACE_BASE = 524288;                  // lake fills carry face ids above 2^19 so the ID pass can tell them from countries (named in Phase 1c)

  async function unitVectors(T) {
    const n = T.lon.length, q = T.quantum, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const lon = T.lon[i] * q * D2R, lat = T.lat[i] * q * D2R, c = Math.cos(lat);
      pos[3 * i] = c * Math.cos(lon); pos[3 * i + 1] = c * Math.sin(lon); pos[3 * i + 2] = Math.sin(lat);
      if ((i & 0x3ffff) === 0x3ffff) await tick();
    }
    return pos;
  }
  // the file parsed: in a worker in one go; in the shim yielding between sections (atlas-format.js readSteps)
  const readTopology = (buffer) => (Y.shim ? root.AtlasFormat.readAsync(new Uint8Array(buffer), null, () => tick()) : root.AtlasFormat.read(new Uint8Array(buffer)));

  /* ---------- arcs → segments at a level ---------- */
  /* The tag packs arc id, flags and kind into one float: kind + 8·flags + 64·arc (exact below 2^24, so
     arcs up to 262k). Tile-edge chords (KIND.EDGE) are never segments: they close a fill, not a line. */
  const KIND_EDGE = 6, KIND_ADMIN1 = 5;
  function buildSegments(T, pos, level, arcIdOf, onlyKind) {
    const nA = T.arcOffset.length - 1;
    const skip = (a) => T.arcMinLod[a] > level || T.arcKind[a] === KIND_EDGE || (onlyKind != null && T.arcKind[a] !== onlyKind);
    let count = 0;
    for (let a = 0; a < nA; a++) { if (skip(a)) continue; for (let i = T.arcOffset[a] + 1; i < T.arcOffset[a + 1]; i++) if (T.rank[i] <= level) count++; }
    const segs = new Float32Array(count * 7);   // ax ay az bx by bz tag
    let k = 0;
    for (let a = 0; a < nA; a++) {
      if (skip(a)) continue;
      const tag = (arcIdOf ? arcIdOf(a) : a) * 64 + (T.arcFlags[a] & 7) * 8 + T.arcKind[a];
      let last = T.arcOffset[a];
      for (let i = T.arcOffset[a] + 1; i < T.arcOffset[a + 1]; i++) {
        if (T.rank[i] > level) continue;
        segs[k++] = pos[3 * last]; segs[k++] = pos[3 * last + 1]; segs[k++] = pos[3 * last + 2];
        segs[k++] = pos[3 * i]; segs[k++] = pos[3 * i + 1]; segs[k++] = pos[3 * i + 2];
        segs[k++] = tag;
        last = i;
      }
    }
    return segs;
  }

  /* ---------- faces → triangles at a level ---------- */
  // a face's rings at this level, as arrays of global vertex indices (first vertex not repeated at the end)
  function faceRings(T, face, level) {
    const out = [];
    for (const refs of face.rings) {
      const ring = [];
      let skip = false;
      for (let r = 0; r < refs.length; r++) {
        const ref = refs[r], a = Math.abs(ref) - 1;
        if (T.arcMinLod[a] > level) { skip = true; break; }
        const s = T.arcOffset[a], e = T.arcOffset[a + 1];
        if (ref > 0) { for (let i = s; i < e; i++) if (T.rank[i] <= level) { if (ring.length && i === s) continue; ring.push(i); } }
        else { for (let i = e - 1; i >= s; i--) if (T.rank[i] <= level) { if (ring.length && i === e - 1) continue; ring.push(i); } }
      }
      if (skip) continue;
      // the walk closes on its first vertex (same coordinates, possibly a different index): drop it
      if (ring.length > 1) { const f = ring[0], l = ring[ring.length - 1]; if (f === l || (T.lon[f] === T.lon[l] && T.lat[f] === T.lat[l])) ring.pop(); }
      if (ring.length >= 3) out.push(ring);
    }
    return out;
  }

  async function triangulateFace(T, pos, face, faceId, level, sink) {
    const rings = faceRings(T, face, level);
    if (!rings.length) return 0;
    // centroid of the face's vertices on the sphere
    let cx = 0, cy = 0, cz = 0;
    for (const ring of rings) for (const i of ring) { cx += pos[3 * i]; cy += pos[3 * i + 1]; cz += pos[3 * i + 2]; }
    let cl = Math.hypot(cx, cy, cz); if (cl < 1e-9) { cx = 0; cy = 0; cz = -1; cl = 1; }   // only a ring girdling the sphere: Antarctica-like → the south pole
    cx /= cl; cy /= cl; cz /= cl;
    // a right-handed tangent frame (e1, e2, c): e1 × e2 = c, so counter-clockwise on the sphere (seen from outside) stays counter-clockwise in the plane
    let ux = 0, uy = 0, uz = 1; if (Math.abs(cz) > 0.9) { ux = 1; uy = 0; uz = 0; }
    let e1x = uy * cz - uz * cy, e1y = uz * cx - ux * cz, e1z = ux * cy - uy * cx; const l1 = Math.hypot(e1x, e1y, e1z); e1x /= l1; e1y /= l1; e1z /= l1;
    const e2x = cy * e1z - cz * e1y, e2y = cz * e1x - cx * e1z, e2z = cx * e1y - cy * e1x;
    const proj = (i) => {
      const x = pos[3 * i], y = pos[3 * i + 1], z = pos[3 * i + 2];
      const d = Math.max(-1, Math.min(1, x * cx + y * cy + z * cz)), th = Math.acos(d);
      let tx = x - d * cx, ty = y - d * cy, tz = z - d * cz; const tl = Math.hypot(tx, ty, tz) || 1;
      return [th * (tx * e1x + ty * e1y + tz * e1z) / tl, th * (tx * e2x + ty * e2y + tz * e2z) / tl];
    };
    // project, classify by signed area, group holes under the smallest containing outer
    const polys = rings.map((ring) => { const p = ring.map(proj); let A = 0; for (let i = 0, j = p.length - 1; i < p.length; j = i++) A += (p[j][0] * p[i][1] - p[i][0] * p[j][1]); return { ring, p, area: A / 2, holes: [] }; });
    const outers = polys.filter((q) => q.area > 0).sort((a, b) => a.area - b.area);
    const inside = (pt, poly) => { let c = false; const p = poly.p; for (let i = 0, j = p.length - 1; i < p.length; j = i++) if ((p[i][1] > pt[1]) !== (p[j][1] > pt[1]) && pt[0] < (p[j][0] - p[i][0]) * (pt[1] - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0]) c = !c; return c; };
    let nh = 0;
    for (const h of polys) { if (h.area > 0) continue; const o = outers.find((o) => inside(h.p[0], o)); if (o) o.holes.push(h); if ((++nh & 31) === 0) await tick(); }
    let triangles = 0;
    const chord = 2 * Math.sin(CHORD_DEG[Math.min(level, CHORD_DEG.length - 1)] * D2R / 2), chord2 = chord * chord;
    let no = 0;
    for (const o of outers) {
      if ((++no & 15) === 0) await tick();   // Canada at LOD 2 is thousands of rings and 200 ms: the shim yields between them
      const flat = [], holeIdx = [], gidx = [];
      for (const [x, y] of o.p) flat.push(x, y);
      for (const i of o.ring) gidx.push(i);
      for (const h of o.holes) { holeIdx.push(gidx.length); for (const [x, y] of h.p) flat.push(x, y); for (const i of h.ring) gidx.push(i); }
      const tri = root.earcut(flat, holeIdx.length ? holeIdx : null, 2);
      // per-face vertex copies: local index per global vertex, plus midpoints
      const local = new Map();
      const L = (g) => { let l = local.get(g); if (l == null) { l = sink.vertex(pos[3 * g], pos[3 * g + 1], pos[3 * g + 2], faceId); local.set(g, l); } return l; };
      const mids = new Map();
      const mid = (la, lb) => {
        const key = la < lb ? la * 4294967296 + lb : lb * 4294967296 + la;
        let m = mids.get(key); if (m != null) return m;
        const A = sink.get(la), B = sink.get(lb);
        let x = A[0] + B[0], y = A[1] + B[1], z = A[2] + B[2]; const l = Math.hypot(x, y, z) || 1;
        m = sink.vertex(x / l, y / l, z / l, faceId); mids.set(key, m); return m;
      };
      const d2 = (la, lb) => { const A = sink.get(la), B = sink.get(lb); const dx = A[0] - B[0], dy = A[1] - B[1], dz = A[2] - B[2]; return dx * dx + dy * dy + dz * dz; };
      const emit = (a, b, c, depth) => {
        const ab = d2(a, b), bc = d2(b, c), ca = d2(c, a);
        const longest = Math.max(ab, bc, ca);
        if (longest <= chord2 || depth > 12) { sink.tri(a, b, c); triangles++; return; }
        if (longest === ab) { const m = mid(a, b); emit(a, m, c, depth + 1); emit(m, b, c, depth + 1); }
        else if (longest === bc) { const m = mid(b, c); emit(a, b, m, depth + 1); emit(a, m, c, depth + 1); }
        else { const m = mid(c, a); emit(a, b, m, depth + 1); emit(m, b, c, depth + 1); }
      };
      for (let t = 0; t < tri.length; t += 3) emit(L(gidx[tri[t]]), L(gidx[tri[t + 1]]), L(gidx[tri[t + 2]]), 0);
    }
    return triangles;
  }

  // a growable vertex + index sink for one level
  function Sink() {
    let pos = new Float32Array(1 << 18), n = 0, idx = new Uint32Array(1 << 18), m = 0;
    return {
      vertex(x, y, z, f) { if ((n + 1) * 4 > pos.length) { const p = new Float32Array(pos.length * 2); p.set(pos); pos = p; } pos[4 * n] = x; pos[4 * n + 1] = y; pos[4 * n + 2] = z; pos[4 * n + 3] = f; return n++; },
      get(i) { return [pos[4 * i], pos[4 * i + 1], pos[4 * i + 2]]; },
      tri(a, b, c) { if (m + 3 > idx.length) { const q = new Uint32Array(idx.length * 2); q.set(idx); idx = q; } idx[m++] = a; idx[m++] = b; idx[m++] = c; },
      result() { return { pos: pos.slice(0, n * 4), idx: idx.slice(0, m), vertices: n, triangles: m / 3 }; },
    };
  }

  /* ---------- buckets: sort geometry by direction so the renderer draws only what the view can see ----------
     1536 buckets = 6 cube faces × 16 × 16 cells (about 5.6° a cell; Phase 0 had 8 × 8). Each triangle
     goes into the bucket of its centroid, each segment into that of its midpoint; the arrays are
     reordered by bucket and a (start, count) range per bucket is emitted, with the bucket's bounding
     cap (centre, angular radius) so the renderer can test "can this bucket be on screen" with one dot
     product. Software GL pays per vertex and per triangle, and a zoomed-in view sees a few per cent of
     the earth; at the globe the coarse cells drew 76 % of LOD 0 for a hemisphere (measured), the finer
     ones under 60 %. The renderer merges runs across small invisible gaps, so draw calls stay few. */
  const CELLS = 16, BUCKETS = 6 * CELLS * CELLS;
  function bucketOf(x, y, z) {
    const ax = Math.abs(x), ay = Math.abs(y), az = Math.abs(z);
    let face, u, w;
    if (ax >= ay && ax >= az) { face = x < 0 ? 1 : 0; u = y / ax; w = z / ax; }
    else if (ay >= az) { face = y < 0 ? 3 : 2; u = x / ay; w = z / ay; }
    else { face = z < 0 ? 5 : 4; u = x / az; w = y / az; }
    const cu = Math.min(CELLS - 1, Math.max(0, Math.floor((u + 1) * CELLS / 2))), cw = Math.min(CELLS - 1, Math.max(0, Math.floor((w + 1) * CELLS / 2)));
    return face * CELLS * CELLS + cu * CELLS + cw;
  }
  // caps: per bucket the normalised mean of its items' centres and the largest angle from it to ANY
  // vertex of an item (an endpoint of a 1° segment at LOD 0 lies well outside its midpoint's cell)
  async function caps(count, centreOf, pointsOf, bucketOfItem, nB) {
    nB = nB || BUCKETS;
    const sum = new Float64Array(nB * 3), cap = new Float32Array(nB * 4);
    for (let i = 0; i < count; i++) { const b = bucketOfItem(i), d = centreOf(i); sum[3 * b] += d[0]; sum[3 * b + 1] += d[1]; sum[3 * b + 2] += d[2]; if ((i & 0x7fff) === 0x7fff) await tick(); }
    for (let b = 0; b < nB; b++) { const l = Math.hypot(sum[3 * b], sum[3 * b + 1], sum[3 * b + 2]) || 1; cap[4 * b] = sum[3 * b] / l; cap[4 * b + 1] = sum[3 * b + 1] / l; cap[4 * b + 2] = sum[3 * b + 2] / l; cap[4 * b + 3] = 0; }
    for (let i = 0; i < count; i++) {
      const b = bucketOfItem(i);
      for (const d of pointsOf(i)) { const c = Math.max(-1, Math.min(1, d[0] * cap[4 * b] + d[1] * cap[4 * b + 1] + d[2] * cap[4 * b + 2])); const a = Math.acos(c); if (a > cap[4 * b + 3]) cap[4 * b + 3] = a; }
      if ((i & 0x3fff) === 0x3fff) await tick();
    }
    return cap;
  }
  async function sortByBucket(count, bucketOfItem, nB) {
    nB = nB || BUCKETS;
    const bucket = new Int32Array(count), start = new Uint32Array(nB + 1);
    for (let i = 0; i < count; i++) { bucket[i] = bucketOfItem(i); start[bucket[i] + 1]++; if ((i & 0x3ffff) === 0x3ffff) await tick(); }
    for (let b = 0; b < nB; b++) start[b + 1] += start[b];
    const order = new Uint32Array(count), fill = start.slice(0, nB);
    for (let i = 0; i < count; i++) { order[fill[bucket[i]]++] = i; if ((i & 0x3ffff) === 0x3ffff) await tick(); }
    const range = new Uint32Array(nB * 2);
    for (let b = 0; b < nB; b++) { range[2 * b] = start[b]; range[2 * b + 1] = start[b + 1] - start[b]; }
    return { order, range };
  }
  // segments: reorder the 7-float records into 8-float texels (a.xyz, tag, b.xyz, 0) by bucket
  /* A TILE is a few per cent of the sphere, so the direction buckets would put all of it in one or
     two and the renderer would draw the whole tile whenever a corner showed (measured: 344k segments
     for a 190 km view of the fjords at the cap). A tile's content is bucketed on a 16×16 grid of its own
     lon/lat rectangle instead; the renderer's cap test is the same, only the ranges differ. */
  const TILE_GRID = 16;
  function tileBucketer(tile) {
    if (!tile) return { count: BUCKETS, of: bucketOf };
    const lon0 = tile.lon0, lat0 = tile.lat0, dl = (tile.lon1 - tile.lon0) / TILE_GRID, dp = (tile.lat1 - tile.lat0) / TILE_GRID;
    return { count: TILE_GRID * TILE_GRID, of: (x, y, z) => {
      let lon = Math.atan2(y, x) / D2R, lat = Math.asin(Math.max(-1, Math.min(1, z))) / D2R;
      let i = Math.floor((lon - lon0) / dl); if (i < 0) i += TILE_GRID * Math.ceil(-i / TILE_GRID); i = ((i % TILE_GRID) + TILE_GRID) % TILE_GRID;   // a tile spanning the antimeridian
      const j = Math.max(0, Math.min(TILE_GRID - 1, Math.floor((lat - lat0) / dp)));
      return j * TILE_GRID + Math.max(0, Math.min(TILE_GRID - 1, i));
    } };
  }
  /* Two lists in one texture: every other arc first, the admin-1 arcs after them with their own
     bucket ranges, so a view above the admin-1 threshold never submits them at all (at the globe
     they are an eighth of LOD 0's segments, measured, and the vertex shader was moving them off
     screen one by one). */
  /* BINS (Phase 1c, the lake cull): a bucket table may be repeated per AREA BIN — bucket index = bin × count +
     direction bucket — so the renderer can skip every bin whose lakes would project under about 2 px² at the
     zoom it draws (docs §7 "Phase 1c — as built"). `binOf(item)` names the bin; with nBins 1 nothing changes. */
  async function bucketSegments(segs, bucketer, binOf, nBins) {
    const B = bucketer || { count: BUCKETS, of: bucketOf };
    nBins = nBins || 1;
    const n = segs.length / 7, NB = B.count * nBins;
    const mid = (i) => { const x = segs[7 * i] + segs[7 * i + 3], y = segs[7 * i + 1] + segs[7 * i + 4], z = segs[7 * i + 2] + segs[7 * i + 5]; const l = Math.hypot(x, y, z) || 1; return [x / l, y / l, z / l]; };
    const ends = (i) => [[segs[7 * i], segs[7 * i + 1], segs[7 * i + 2]], [segs[7 * i + 3], segs[7 * i + 4], segs[7 * i + 5]]];
    const bk = new Int32Array(n); for (let i = 0; i < n; i++) { const m = mid(i); bk[i] = B.of(m[0], m[1], m[2]) + (binOf ? binOf(i) * B.count : 0); if ((i & 0x7fff) === 0x7fff) await tick(); }
    const main = [], a1 = [];
    for (let i = 0; i < n; i++) (segs[7 * i + 6] % 8 === KIND_ADMIN1 ? a1 : main).push(i);
    const out = new Float32Array(n * 8);
    let k = 0;
    const pack = async (ids, offset) => {
      const { order, range } = await sortByBucket(ids.length, (j) => bk[ids[j]], NB);
      for (let j = 0; j < ids.length; j++) { const i = ids[order[j]]; out[8 * k] = segs[7 * i]; out[8 * k + 1] = segs[7 * i + 1]; out[8 * k + 2] = segs[7 * i + 2]; out[8 * k + 3] = segs[7 * i + 6]; out[8 * k + 4] = segs[7 * i + 3]; out[8 * k + 5] = segs[7 * i + 4]; out[8 * k + 6] = segs[7 * i + 5]; out[8 * k + 7] = 0; k++; if ((j & 0xffff) === 0xffff) await tick(); }
      const cap = await caps(ids.length, (j) => mid(ids[order[j]]), (j) => ends(ids[order[j]]), (j) => bk[ids[order[j]]], NB);
      for (let b = 0; b < NB; b++) range[2 * b] += offset;
      return { range, cap };
    };
    const M = await pack(main, 0), A = await pack(a1, main.length);
    return { segs: out, segRange: M.range, segCap: M.cap, segRangeA1: A.range, segCapA1: A.cap };
  }
  async function bucketTriangles(pos, idx, bucketer, binOf, nBins) {
    const B = bucketer || { count: BUCKETS, of: bucketOf };
    nBins = nBins || 1;
    const n = idx.length / 3, NB = B.count * nBins;
    const cen = (t) => { const a = idx[3 * t], b = idx[3 * t + 1], c = idx[3 * t + 2]; const x = pos[4 * a] + pos[4 * b] + pos[4 * c], y = pos[4 * a + 1] + pos[4 * b + 1] + pos[4 * c + 1], z = pos[4 * a + 2] + pos[4 * b + 2] + pos[4 * c + 2]; const l = Math.hypot(x, y, z) || 1; return [x / l, y / l, z / l]; };
    const bk = new Int32Array(n); for (let t = 0; t < n; t++) { const c = cen(t); bk[t] = B.of(c[0], c[1], c[2]) + (binOf ? binOf(t) * B.count : 0); if ((t & 0x7fff) === 0x7fff) await tick(); }
    const { order, range } = await sortByBucket(n, (t) => bk[t], NB);
    const out = new Uint32Array(idx.length);
    for (let k = 0; k < n; k++) { const t = order[k]; out[3 * k] = idx[3 * t]; out[3 * k + 1] = idx[3 * t + 1]; out[3 * k + 2] = idx[3 * t + 2]; if ((k & 0x3ffff) === 0x3ffff) await tick(); }
    const corners = (t) => [0, 1, 2].map((j) => { const v = idx[3 * t + j]; return [pos[4 * v], pos[4 * v + 1], pos[4 * v + 2]]; });
    const cap = await caps(n, (k) => cen(order[k]), (k) => corners(order[k]), (k) => bk[order[k]], NB);
    // ranges in index units
    for (let b = 0; b < NB; b++) { range[2 * b] *= 3; range[2 * b + 1] *= 3; }
    return { faceIdx: out, faceRange: range, faceCap: cap };
  }

  // one message in; the heavy handlers are async (see `tick`) and a thrown error becomes an error message
  function handle(msg, post) {
    const guard = (p, what) => { if (p && typeof p.catch === "function") p.catch((err) => post({ type: "error", message: what + String(err && err.message || err) })); return p; };
    if (msg.type === "tile") return guard(handleTile(msg, post), "tile " + msg.key + ": ");
    if (msg.type === "water") return handleWater(msg, post);
    if (msg.type === "water-tile") return handleWaterTile(msg, post);
    if (msg.type === "relief") { handleRelief(msg, post); return null; }
    if (msg.type === "history") return guard(handleHistory(msg, post), "history: ");
    if (msg.type === "history-faces") return guard(handleHistoryFaces(msg, post), "history faces: ");
    if (msg.type === "history-evict") { if (HIST) for (const k of msg.keys || []) HIST.resident.delete(k); return null; }
    if (msg.type === "gazetteer") { loadGazetteer(msg.table); post({ type: "gazetteer", rows: GZ.rows.length }); return null; }
    if (msg.type === "metrics") { METRICS = msg.styles; return null; }
    if (msg.type === "layout") { handleLayout(msg, post); return null; }
    /* a lost GL context (Phase 1c): the main thread keeps nothing after upload, so the resident levels are
       rebuilt here from the raw files this worker kept — the same code path as the first load */
    if (msg.type === "rebuild") { return (async () => { if (RAW.topology) await handleLoad({ type: "load", buffer: RAW.topology, rebuild: true }, post); if (RAW.water) await handleWater({ type: "water", buffer: RAW.water }, post); if (RAW.history) { HIST = null; await handleHistory({ type: "history", buffer: RAW.history }, post); } })(); }
    if (msg.type === "load") return guard(handleLoad(msg, post), "topology: ");
    return null;
  }
  async function handleLoad(msg, post) {
    const t0 = now();
    let T;
    try { T = await readTopology(msg.buffer); }
    catch (e) { post({ type: "error", message: "topology: " + e.message }); return; }
    RAW.topology = msg.buffer;
    await tick("Reading the earth…", 0.33);
    const pos = await unitVectors(T);
    CORE = { T, pos };
    if (HIST_PENDING) { const m = HIST_PENDING; HIST_PENDING = null; handle(m, post); }
    const faceEntity = new Uint32Array(T.faces.length);
    T.faces.forEach((f, i) => { faceEntity[i] = f.entity; });
    post({ type: "meta", header: T.header, faceEntity, parseMs: now() - t0 }, [faceEntity.buffer]);
    const stats = { parseMs: Math.round(now() - t0), levels: [] };
    const nF = T.faces.length;
    for (let level = 0; level < T.lodCount; level++) {
      const t1 = now();
      const raw = buildSegments(T, pos, level);
      await tick("Shaping the land…", 0.35 + 0.5 * level / T.lodCount);
      const sink = Sink();
      let tris = 0;
      for (let i = 0; i < nF; i++) { tris += await triangulateFace(T, pos, T.faces[i], i, level, sink); if ((i & 7) === 7) await tick(level === 0 ? "Shaping the land…" : "Adding detail…", 0.35 + 0.5 * (level + 0.6 * i / nF) / T.lodCount); }
      const F = sink.result();
      const S = await bucketSegments(raw), B = await bucketTriangles(F.pos, F.idx);
      const s = { level, segments: raw.length / 7, faceVertices: F.vertices, triangles: F.triangles, ms: Math.round(now() - t1) };
      stats.levels.push(s);
      post({ type: "lod", level, segs: S.segs, segRange: S.segRange, segCap: S.segCap, segRangeA1: S.segRangeA1, segCapA1: S.segCapA1, facePos: F.pos, faceIdx: B.faceIdx, faceRange: B.faceRange, faceCap: B.faceCap, buckets: BUCKETS, stats: s },
        [S.segs.buffer, S.segRange.buffer, S.segCap.buffer, S.segRangeA1.buffer, S.segCapA1.buffer, F.pos.buffer, B.faceIdx.buffer, B.faceRange.buffer, B.faceCap.buffer]);
    }
    stats.totalMs = Math.round(now() - t0);
    post({ type: "done", stats, rebuild: !!msg.rebuild });
  }

  /* ================= Phase 1c: the gazetteer and the label layout (docs/atlas-v2-design.md §2.6) =================
     The main thread loads atlas/data/gazetteer.js and posts its table here once; it measures glyph advances
     for every label style on its own canvas (fonts are a DOM matter) and posts them as METRICS; it asks for a
     LAYOUT on settle, on a zoom-level change and on a density change, and between layouts it only translates
     what this returned by each label's anchor. So the whole placement — which names are candidates at this
     zoom, in what order, where each sits, which collide and are dropped — is decided here, off the frame.

     The order is the design's: the selected place, then by rank (Natural Earth's own scale ranks, or area
     bins) with the kind as tie-break; placement is greedy on a screen-space grid; a label that does not fit
     is dropped, never overlapped; the count is capped by the density stop (about 40 at the globe, 120 at
     country scale for "normal"; a phone one notch sparser). Every label is SHAPED here glyph by glyph — the
     advance of each character from METRICS plus the style's own tracking — so the main thread's glyph-by-glyph
     drawing and these collision rectangles agree to the pixel; small capitals are capitals of the smaller size.
     An area kind runs along its label path (the gazetteer's two to five points, projected), straight when the
     path is too short or too bent; a river repeats every ~400 px along its polyline; a city sits beside its
     marker on the first free side of four. Labels behind the horizon are not candidates; those near the limb
     carry an alpha for the fade. */
  const RAW = { topology: null, water: null, history: null };
  let CORE = null, HIST = null, HIST_PENDING = null;
  let GZ = null, RIVER_LINES = null, RIVER_CAPS = null, METRICS = null;
  const D2R_ = Math.PI / 180;
  const KW = { capital: 0, country: 1, ocean: 2, sea: 3, admin1: 4, region: 5, range: 5, "island-group": 6, island: 6, gulf: 6, strait: 6, city: 7, lake: 8, town: 9, river: 10 };
  const PHYSICAL = { sea: 1, ocean: 1, gulf: 1, strait: 1, lake: 1, river: 1, island: 1, "island-group": 1, range: 1, region: 1 };
  const MIN_CHORD_PX = 40;            // an area is labelled once it is this wide on screen (§2.6)
  const LIMB_Z = 0.1;                 // a name whose anchor is nearer the limb than this (view-space z; the fade reaches 1 at 0.2) is not a candidate
  const RIVER_REPEAT_PX = 400;
  const MARKER_R = { capital: 4, city: 3, town: 2.2 };
  function unitOf(lon, lat) { const la = lat * D2R_, lo = lon * D2R_, c = Math.cos(la); return [c * Math.cos(lo), c * Math.sin(lo), Math.sin(la)]; }
  function loadGazetteer(table) {
    const col = {}; table.cols.forEach((c, i) => { col[c] = i; });
    const rows = table.rows.map((r, i) => {
      const g = (c) => (r[col[c]] == null ? 0 : r[col[c]]);
      const at = g("at"), path = g("path"), geom = g("geom"), alt = g("alt");
      const river = typeof geom === "string" && geom[0] === "r" ? Number(geom.slice(1)) : -1;
      // a merged river (Phase 1d: one row per Wikidata item) names every stretch it is made of: `rivers` is all of them
      return { i, id: g("id"), name: g("name"), kind: g("kind"), rank: g("rank"), within: g("within"), len: g("len"), z: g("z"), a: at ? unitOf(at[0], at[1]) : null, p: path && path.length > 1 ? path.map((q) => unitOf(q[0], q[1])) : null, river, rivers: river >= 0 ? [river].concat(Array.isArray(alt) ? alt : []) : null };
    });
    GZ = { rows };
  }
  // the style a row is drawn in, by kind and by how much room it has (CSS px of chord)
  function styleFor(row, chordPx) {
    switch (row.kind) {
      case "polity": case "country": return chordPx >= 700 ? "country-l" : chordPx >= 260 ? "country-m" : "country-s";
      case "admin1": return "admin1";
      case "capital": return "capital"; case "city": return "city"; case "town": return "town";
      case "ocean": return "water-l"; case "sea": return chordPx >= 500 ? "water-l" : "water-m";
      case "gulf": case "strait": return "water-s";
      case "lake": return chordPx >= 300 ? "water-m" : "water-s";
      case "river": return "river";
      case "range": return "range"; case "region": return chordPx >= 900 ? "region-l" : "region";
      default: return "island";   // island, island-group
    }
  }
  // glyph by glyph: the characters to draw (capitals for a small-caps style), each advance, the total width
  function shape(text, st, missing) {
    const chars = [], adv = [], small = [];
    let w = 0;
    for (const ch of text) {
      let c = ch, sm = false;
      if (st.caps && ch !== ch.toUpperCase()) { c = ch.toUpperCase(); sm = true; }
      const table = sm ? st.advSmall : st.adv;
      let a = table[c];
      if (a == null) { a = (sm ? st.size * st.smallScale : st.size) * 0.6; if (missing) missing.add(st.id + "\u0001" + c); }
      chars.push(c); adv.push(a); small.push(sm);
      w += a;
    }
    w += st.track * Math.max(0, chars.length - 1);
    return { chars, adv, small, w, h: st.size * 1.2 };
  }
  function handleLayout(msg, post) {
    const t0 = now();
    if (!GZ || !METRICS) { post({ type: "layout", seq: msg.seq, placed: [], ms: 0, candidates: 0, reason: !GZ ? "no gazetteer" : "no metrics" }); return; }
    let res;
    try { res = layout(msg); }
    catch (e) { res = { placed: [], candidates: 0, cap: 0, error: String(e && e.stack || e) }; }   // a layout that throws must still answer, or the main thread waits for ever (Phase 2a)
    res.type = "layout"; res.seq = msg.seq; res.ms = now() - t0;
    post(res);
  }
  function layout(q) {
    const rot = q.rot, radius = q.radius, cx = q.cx, cy = q.cy, W = q.W, H = q.H, kmpp = q.kmpp;
    const zl = Math.log2(156.543 / kmpp);                                   // the web-mercator zoom at the equator Natural Earth's hints are in
    const shift = (q.density === "sparse" ? -1 : q.density === "dense" ? 1.5 : 0) + (q.phone ? -0.75 : 0);
    const t = Math.max(0, Math.min(1, (Math.log(24) - Math.log(kmpp)) / Math.log(24)));
    const cap = Math.round((40 + 80 * t) * (q.density === "sparse" ? 0.6 : q.density === "dense" ? 1.5 : 1) * (q.phone ? 0.6 : 1));
    const pad = q.density === "sparse" ? 8 : q.density === "dense" ? 2 : 4;
    const show = q.show || {};
    const proj = (v) => { const x = rot[0] * v[0] + rot[1] * v[1] + rot[2] * v[2], y = rot[3] * v[0] + rot[4] * v[1] + rot[5] * v[2], z = rot[6] * v[0] + rot[7] * v[1] + rot[8] * v[2]; return [cx + x * radius, cy - y * radius, z]; };
    const onScreen = (x, y, m) => x >= -m && y >= -m && x <= W + m && y <= H + m;
    const offScreen = (r) => Math.min(r[2], W) - Math.max(r[0], 0) < 8 || Math.min(r[3], H) - Math.max(r[1], 0) < 8;   // a rectangle with under 8 px of itself in the viewport
    const viewAngle = Math.min(Math.PI / 2, (Math.hypot(W, H) / 2 + 80) / radius) + 0.02;   // radians from the view's centre to its farthest corner, on the sphere
    const missing = new Set();
    const why = q.debug ? [] : null;
    let dropping = null;   // the row being placed, named in the debug reasons
    const drop = (reason) => { if (why) why.push(dropping ? dropping.name + ": " + reason : reason); };
    /* ---- candidates ---- */
    const cands = [];
    /* PHASE 2a: in a year before the present (q.present false) the present-day countries, provinces, capitals, cities and
       towns are not alive and are not named (the owner's decision: hide the anachronistic ones; the physical names stay);
       the alive polities are named along a path of their own, and the period capitals of the year are marked and named */
    const present = q.present !== false;
    const histRows = [];
    if (HIST && q.aliveFaces && q.aliveFaces.length) {
      for (const fi of q.aliveFaces) {
        const e = HIST.H.entities[HIST.T.faces[fi].entity]; if (!e || e.kind !== "polity") continue;
        const path = histLabelPath(fi, proj, W, H); if (!path) continue;
        const km2 = HIST.H.faceKm2 ? HIST.H.faceKm2[fi] : 0;
        histRows.push({ id: e.id, name: e.name, kind: "polity", rank: km2 >= 2e6 ? 0 : km2 >= 5e5 ? 1 : km2 >= 1e5 ? 2 : km2 >= 2e4 ? 3 : 4, path, len: path.len * kmpp, face: fi });
      }
    }
    for (const row of histRows) { const chordPx = row.path.len; if (!show.countries || chordPx < MIN_CHORD_PX) continue; cands.push({ row, chordPx, a: [row.path.anchor[0], row.path.anchor[1], 1], score: (row.id === q.selected ? -1000 : 0) + row.rank * 10 + KW.country, hist: true }); }
    for (const c of q.capitals || []) { const a = proj(unitOf(c.lon, c.lat)); if (a[2] < LIMB_Z || !onScreen(a[0], a[1], 200)) continue; if (!show.cities) continue; cands.push({ row: { id: "cap:" + c.entity + ":" + c.name, name: c.name, kind: "capital", rank: 0, a: unitOf(c.lon, c.lat) }, chordPx: 0, a, score: 0 + KW.capital, hist: true }); }
    for (const row of GZ.rows) {
      const k = row.kind;
      if (!present && (k === "country" || k === "admin1" || k === "capital" || k === "city" || k === "town")) continue;
      let chordPx = row.len / kmpp;
      if (k === "country") { if (!show.countries || chordPx < MIN_CHORD_PX) continue; if (row.z && zl > row.z[1] + 2) continue; }
      else if (k === "admin1") { if (!show.countries || !show.provinces || !q.admin1 || chordPx < MIN_CHORD_PX) continue; }
      else if (k === "capital" || k === "city" || k === "town") { if (!show.cities) continue; if (row.z && row.z > zl + shift) continue; }
      else if (PHYSICAL[k]) {
        if (!show.physical) continue;
        if (k === "lake") { if (!show.lakes || Math.max(row.len, 1) / kmpp < MIN_CHORD_PX) continue; }
        else if (k === "river") {
          if (!show.rivers || !q.riversDrawn || row.river < 0) continue;
          const maxRank = q.level === 0 ? 3 : q.level === 1 ? 6 : 99; if (row.rank > maxRank) continue;
          // the river's caps (one per stretch of a merged row) — none reaching the view means no vertex is projected
          if (!RIVER_CAPS || !row.rivers.some((ei) => { const capR = RIVER_CAPS.get(ei); if (!capR) return false; const d = Math.max(-1, Math.min(1, capR[0] * rot[6] + capR[1] * rot[7] + capR[2] * rot[8])); return Math.acos(d) - capR[3] <= viewAngle; })) continue;
        }
        else { const z = Array.isArray(row.z) ? row.z : null; if (z && (zl + shift < z[0] || zl > z[1] + 1)) continue; if (!z && !row.p) continue; if (row.p && chordPx < MIN_CHORD_PX) continue; }
      } else continue;
      let a = null;
      if (k !== "river") { a = proj(row.a); if (a[2] < LIMB_Z || !onScreen(a[0], a[1], 200)) continue; }   // nearer the limb than LIMB_Z a name is foreshortened past reading and faded: not a candidate
      const score = (row.id === q.selected ? -1000 : 0) + row.rank * 10 + (KW[k] || 5);
      cands.push({ row, chordPx, a, score });
    }
    cands.sort((p, r) => p.score - r.score);
    /* ---- the grid ---- */
    const CELL = 64, cols = Math.ceil(W / CELL) + 2, rows = Math.ceil(H / CELL) + 2;
    const cells = new Map();
    const rects = [];
    const clampC = (v, n) => Math.max(0, Math.min(n - 1, v));
    const cellsOf = (r, fn) => { const x0 = clampC(Math.floor(r[0] / CELL) + 1, cols), x1 = clampC(Math.floor(r[2] / CELL) + 1, cols), y0 = clampC(Math.floor(r[1] / CELL) + 1, rows), y1 = clampC(Math.floor(r[3] / CELL) + 1, rows); for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) fn(y * cols + x); };   // a rectangle beyond the viewport shares the edge cells, so off-screen labels still collide with each other
    const free = (r) => { let ok = true; cellsOf(r, (c) => { if (!ok) return; const list = cells.get(c); if (!list) return; for (const i of list) { const o = rects[i]; if (r[0] < o[2] + pad && r[2] > o[0] - pad && r[1] < o[3] + pad && r[3] > o[1] - pad) { ok = false; return; } } }); return ok; };
    const take = (r) => { const i = rects.length; rects.push(r); cellsOf(r, (c) => { let list = cells.get(c); if (!list) cells.set(c, list = []); list.push(i); }); };
    /* THE CHROME IS OCCUPIED GROUND (Phase 2a, task 0d). atlas.js measures the rectangles of its controls — the search box
       and its list, the zoom stack, the Legend and ? chips, an open sheet, the card or its phone strip, the stack chip, the
       year rail — at every layout and resize and sends them as `chrome`; they are taken before any label is placed, so no
       label can be placed under a control (the owner's phone had "Berlin" cut by the zoom buttons and "NORTH EUROPE" under
       the search box). A POINT label (a city and its marker) must be wholly on screen; an AREA or PATH label may be clipped
       by the viewport edge by at most a quarter of its length and never by a control. */
    const chrome = Array.isArray(q.chrome) ? q.chrome : [];
    const fullyOn = (r) => r[0] >= 0 && r[1] >= 0 && r[2] <= W && r[3] <= H;
    const hitsChrome = (r) => chrome.some((c) => r[0] < c[2] && r[2] > c[0] && r[1] < c[3] && r[3] > c[1]);
    // the fraction of a chain of glyph boxes (or one box) lying beyond the viewport, by box area
    const clippedFrac = (rs) => { let a = 0, v = 0; for (const r of rs) { const w = r[2] - r[0], h = r[3] - r[1]; if (w <= 0 || h <= 0) continue; a += w * h; v += Math.max(0, Math.min(r[2], W) - Math.max(r[0], 0)) * Math.max(0, Math.min(r[3], H) - Math.max(r[1], 0)); } return a > 0 ? 1 - v / a : 1; };
    const MAX_CLIP = 0.25;
    for (const c of chrome) take(c);   // the controls' rectangles are taken first (padded like any label), so nothing is laid out under them
    const placed = [];
    const union = (list) => { let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity; for (const r of list) { if (r[0] < x0) x0 = r[0]; if (r[1] < y0) y0 = r[1]; if (r[2] > x1) x1 = r[2]; if (r[3] > y1) y1 = r[3]; } return [x0, y0, x1, y1]; };
    /* a straight run of glyphs centred at (x, y) at angle `ang` (radians, screen y down): glyph origins and one rect */
    const straight = (sh, x, y, ang) => {
      const dx = Math.cos(ang), dy = Math.sin(ang);
      const sx = x - sh.w / 2 * dx, sy = y - sh.w / 2 * dy;
      const glyphs = []; let cum = 0;
      for (let i = 0; i < sh.chars.length; i++) { glyphs.push([sx + cum * dx, sy + cum * dy, ang, sh.small[i] ? 1 : 0]); cum += sh.adv[i] + (i + 1 < sh.chars.length ? METRICS[sh.style].track : 0); }
      const hw = sh.w / 2, hh = sh.h / 2;
      const ex = Math.abs(dx) * hw + Math.abs(dy) * hh, ey = Math.abs(dy) * hw + Math.abs(dx) * hh;
      return { glyphs, rects: [[x - ex, y - ey, x + ex, y + ey]] };
    };
    /* glyphs along a screen polyline S (points [x, y]) with cumulative lengths `cum`, the label's centre at arc
       length s0; null when the text would bend more than a reader can follow */
    const along = (sh, S, cum, s0, st) => {
      const glyphs = [], rs = [];
      let s = s0 - sh.w / 2, seg = 0, prev = null, turned = 0, sumCos = 0, sumSin = 0;
      for (let i = 0; i < sh.chars.length; i++) {
        const mid = s + sh.adv[i] / 2;
        while (seg + 1 < cum.length - 1 && cum[seg + 1] < mid) seg++;
        while (seg > 0 && cum[seg] > mid) seg--;
        const L = cum[seg + 1] - cum[seg] || 1, u = Math.max(0, Math.min(1, (mid - cum[seg]) / L));
        const x = S[seg][0] + (S[seg + 1][0] - S[seg][0]) * u, y = S[seg][1] + (S[seg + 1][1] - S[seg][1]) * u;
        const ang = Math.atan2(S[seg + 1][1] - S[seg][1], S[seg + 1][0] - S[seg][0]);
        // a glyph rotated beyond 90° from upright is upside down (the owner's "Danube" and "Rhône": a run whose ends read left
        // to right but whose middle, where the name sits, runs the other way) — the caller then tries the path reversed
        if (Math.abs(ang) > Math.PI / 2) return null;
        if (prev != null) { let d = ang - prev; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; if (Math.abs(d) > 0.4) return null; turned += Math.abs(d); if (turned > 1.6) return null; }
        prev = ang;
        sumCos += Math.cos(ang); sumSin += Math.sin(ang);
        // the glyph's origin is its left edge on the baseline; the baseline sits a quarter of the size under the line so the text straddles a river rather than riding above it
        const nx = Math.sin(ang) * st.size * 0.35, ny = -Math.cos(ang) * st.size * 0.35;
        const ox = x - Math.cos(ang) * sh.adv[i] / 2 + nx, oy = y - Math.sin(ang) * sh.adv[i] / 2 + ny;
        glyphs.push([ox, oy, ang, sh.small[i] ? 1 : 0]);
        const hs = Math.max(sh.adv[i], st.size) * 0.55;
        rs.push([x - hs, y - hs, x + hs, y + hs]);
        s += sh.adv[i] + st.track;
      }
      if (sumCos < 0) return null;   // the mean direction points left: the text would read backwards
      return { glyphs, rects: rs, meanAngle: Math.atan2(sumSin, sumCos) };
    };
    // along the polyline, and failing that along the polyline reversed (the same spot measured from the other end)
    const alongEither = (sh, S, cum, s0, st) => {
      const g = along(sh, S, cum, s0, st); if (g) return g;
      const Sr = S.slice().reverse(), cumR = polyline(Sr), L = cum[cum.length - 1];
      return along(sh, Sr, cumR, L - s0, st);
    };
    // a run averaged along its length: every vertex becomes the mean of the vertices within `radius` px of arc length
    // of it (the count and the order are kept, so an index into the smoothed run is an index into the real one)
    const smoothRun = (S, cum, radius) => {
      const out = new Array(S.length);
      for (let i = 0, j0 = 0; i < S.length; i++) {
        while (cum[i] - cum[j0] > radius) j0++;
        let sx = 0, sy = 0, n = 0;
        for (let j = j0; j < S.length && cum[j] - cum[i] <= radius; j++) { sx += S[j][0]; sy += S[j][1]; n++; }
        out[i] = [sx / n, sy / n];
      }
      return out;
    };
    const polyline = (pts) => { const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return cum; };
    const reads = (S) => { const dx = S[S.length - 1][0] - S[0][0], dy = S[S.length - 1][1] - S[0][1]; return Math.abs(dx) >= Math.abs(dy) * 0.35 ? dx >= 0 : dy <= 0; };   // left to right, else upward
    let riverLabels = 0;
    for (const c of cands) {
      if (placed.length >= cap) break;
      const row = c.row, k = row.kind; dropping = row;
      const styleId = styleFor(row, c.chordPx), st = METRICS[styleId];
      if (!st) { drop(k + " no metrics for style " + styleId); continue; }
      const text = row.name;
      const sh = shape(text, st, missing); sh.style = styleId;
      const base = { id: row.id, kind: k, style: styleId, text: sh.chars.join(""), score: c.score, selected: row.id === q.selected, hist: !!c.hist, face: row.face };
      if (k === "polity") {
        // along the path computed above (screen space already), else straight at its anchor; a polity's name is a country's style
        const S2 = row.path.pts.map((p) => [p[0], p[1]]); if (!reads(S2)) S2.reverse();
        const cum = polyline(S2), Ls = cum[cum.length - 1];
        let got = null, curved = false;
        if (Ls >= sh.w * 1.02) { const g = alongEither(sh, S2, cum, Ls / 2, st); if (g && g.rects.every(free) && clippedFrac(g.rects) <= MAX_CLIP) { got = g; curved = true; } }
        if (!got) { if (sh.w > row.path.len * 1.8) { drop("polity name wider than its path"); continue; } const g = straight(sh, c.a[0], c.a[1], 0); if (clippedFrac(g.rects) > MAX_CLIP) { drop("polity label clipped"); continue; } if (!free(g.rects[0])) { drop("polity collides"); continue; } got = g; }
        const ub = union(got.rects); if (offScreen(ub)) { drop("polity label wholly off screen"); continue; }
        got.rects.forEach(take);
        // the anchor's unit vector: unproject the screen anchor (the label follows the globe between layouts)
        const ax = (c.a[0] - cx) / radius, ay = -(c.a[1] - cy) / radius, az = Math.sqrt(Math.max(0, 1 - ax * ax - ay * ay));
        const aw = [rot[0] * ax + rot[3] * ay + rot[6] * az, rot[1] * ax + rot[4] * ay + rot[7] * az, rot[2] * ax + rot[5] * ay + rot[8] * az];
        placed.push(Object.assign(base, { a: aw, sx: c.a[0], sy: c.a[1], alpha: 1, glyphs: got.glyphs, box: ub, rects: got.rects, marker: null, hit: ub, curved, meanAngle: curved ? got.meanAngle : 0 }));
        continue;
      }
      if (k === "capital" || k === "city" || k === "town") {
        const r = MARKER_R[k], x = c.a[0], y = c.a[1];
        const mrect = [x - r - 1, y - r - 1, x + r + 1, y + r + 1];
        if (!fullyOn(mrect)) { drop("marker off screen"); continue; }
        if (!free(mrect)) { drop("marker collides"); continue; }
        if (!show.places) { take(mrect); placed.push(Object.assign(base, { text: "", a: row.a, sx: x, sy: y, alpha: Math.min(1, c.a[2] / 0.2), glyphs: [], box: mrect, rects: [mrect], marker: [x, y, r, k], hit: mrect })); continue; }
        const tries = [[x + r + 3 + sh.w / 2, y, 0], [x - r - 3 - sh.w / 2, y, 0], [x, y - r - 3 - sh.h / 2, 0], [x, y + r + 3 + sh.h / 2, 0]];
        let got = null;
        for (const [tx, ty, ang] of tries) { const g = straight(sh, tx, ty, ang); if (fullyOn(g.rects[0]) && free(g.rects[0])) { got = g; break; } }
        if (!got) { drop(onScreen(x, y, 0) ? "city label collides on all four sides, or is not wholly on screen" : "city off screen"); continue; }
        take(got.rects[0]); take(mrect);
        placed.push(Object.assign(base, { a: row.a, sx: x, sy: y, alpha: Math.min(1, c.a[2] / 0.2), glyphs: got.glyphs, box: union([got.rects[0], mrect]), rects: [got.rects[0], mrect], marker: [x, y, r, k], hit: union([got.rects[0], mrect]) }));
        continue;
      }
      if (k === "river") {
        const parts = RIVER_LINES ? row.rivers.flatMap((ei) => RIVER_LINES.get(ei) || []) : null; if (!parts || !parts.length) { drop("river has no line at this level"); continue; }
        // runs of consecutive on-screen vertices, part by part
        let run = [], runV = [], n = 0, perRiver = 0, maxLr = 0, tried = 0, collided = 0, bent = 0; const before = riverLabels;
        const flush = () => {
          if (run.length < 2 || perRiver >= 6) { run = []; runV = []; return; }
          if (!reads(run)) { run.reverse(); runV.reverse(); }
          const cum = polyline(run), Lr = cum[cum.length - 1]; if (Lr > maxLr) maxLr = Lr;
          // the text follows a SMOOTHED copy of the run (each vertex averaged with its neighbours within two text
          // sizes of arc length): at 0.5 km/px the LOD 1 vertices sit 10–15 px apart on a meander, closer than the
          // glyphs, and every try on the Rhine, the Moselle and the Weser bent past the 23° a reader can follow
          // (Phase 1d, found by the labels suite once the rank-8 rivers left the gazetteer); the text straddles the
          // channel's course rather than its every bend, and the anchor stays a vertex of the real line
          const runS = smoothRun(run, cum, st.size * 2), cumS = polyline(runS);
          // the name every RIVER_REPEAT_PX along the run; a run shorter than that carries it once, at its middle
          const LrS = cumS[cumS.length - 1];
          for (let s0 = LrS < RIVER_REPEAT_PX ? LrS / 2 : RIVER_REPEAT_PX / 2; s0 + sh.w / 2 + 10 < LrS && placed.length < cap; s0 += RIVER_REPEAT_PX) {
            // a spot that bends or collides is not the stretch's last word: the text slides up to 120 px either way
            let g = null, s1 = s0;
            for (const off of [0, 60, -60, 120, -120]) {
              s1 = s0 + off; if (s1 - sh.w / 2 < 10 || s1 + sh.w / 2 + 10 > LrS) continue;
              tried++;
              const t = alongEither(sh, runS, cumS, s1, st); if (!t) { bent++; continue; }
              if (!t.rects.every(free)) { collided++; continue; }
              if (clippedFrac(t.rects) > MAX_CLIP) continue;   // a run reaches 60 px past the canvas; the text may hang over the edge by a quarter at most
              g = t; break;
            }
            if (!g) continue;
            g.rects.forEach(take);
            // the anchor: the vertex nearest the label's centre
            let seg = 0; while (seg + 1 < cumS.length - 1 && cumS[seg + 1] < s1) seg++;
            const av = runV[seg];
            placed.push(Object.assign({}, base, { a: av, sx: run[seg][0], sy: run[seg][1], alpha: 1, glyphs: g.glyphs, box: union(g.rects), rects: g.rects, marker: null, hit: union(g.rects), curved: true, meanAngle: g.meanAngle }));
            perRiver++; riverLabels++;
          }
          run = []; runV = [];
        };
        for (const line of parts) {
          for (let i = 0; i < line.length; i += 3) {
            const v = [line[i], line[i + 1], line[i + 2]], p = proj(v);
            if (p[2] > 0.02 && onScreen(p[0], p[1], 60)) { run.push([p[0], p[1]]); runV.push(v); n++; } else flush();
          }
          flush();
        }
        if (riverLabels === before) drop(n ? `river run too short or collides (${n} vertices on screen, longest run ${Math.round(maxLr)} px, label ${Math.round(sh.w)} px, ${tried} tried, ${bent} too bent, ${collided} collided)` : "river line off screen");
        continue;
      }
      // an area kind: along its path when the path is long enough and gentle, else straight at the anchor
      let got = null, curved = false;
      if (row.p) {
        const S = row.p.map(proj);
        if (S.every((p) => p[2] > 0.01)) {
          const S2 = S.map((p) => [p[0], p[1]]);
          if (!reads(S2)) S2.reverse();
          const cum = polyline(S2), Ls = cum[cum.length - 1];
          if (Ls >= sh.w * 1.02) { const g = alongEither(sh, S2, cum, Ls / 2, st); if (g && g.rects.every(free) && clippedFrac(g.rects) <= MAX_CLIP) { got = g; curved = true; } }   // a run clipped by the edge by more than a quarter falls back to the straight name at the anchor
        }
      }
      if (!got) {
        if (c.chordPx > 0 && sh.w > c.chordPx * 1.8 && k !== "island" && k !== "island-group") { drop(k + " name wider than its shape"); continue; }   // the name would overhang the shape by most of its length
        const g = straight(sh, c.a[0], c.a[1], 0);
        if (!onScreen(c.a[0], c.a[1], 0)) { drop(k + " anchor off screen"); continue; }
        if (clippedFrac(g.rects) > MAX_CLIP) { drop(k + " label clipped by the edge by more than a quarter"); continue; }
        if (!free(g.rects[0])) { drop(k + " collides"); continue; }
        got = g;
      }
      // a label whose every glyph lies beyond the viewport (its anchor was within the 200 px margin) is not placed: it
      // would hold a slot of the density cap and draw nothing
      const ub = union(got.rects);
      if (offScreen(ub)) { drop(k + " label wholly off screen"); continue; }
      got.rects.forEach(take);
      placed.push(Object.assign(base, { a: row.a, sx: c.a[0], sy: c.a[1], alpha: Math.min(1, c.a[2] / 0.2), glyphs: got.glyphs, box: ub, rects: got.rects, marker: null, hit: ub, curved, meanAngle: curved ? got.meanAngle : 0 }));
    }
    void hitsChrome;
    return { placed, candidates: cands.length, cap, chrome: chrome.length, missing: [...missing].map((m) => m.split("\u0001")), rivers: riverLabels, why };
  }
  /* ================= Phase 2a: the step topology (atlas/data/history.bin) =================
     The file's faces are rings of signed arc references; an arc is either its own vertices (a historical border, with
     Visvalingam ranks for the three resident levels) or a REFERENCE to a core arc — a coast run or an inherited
     present-day border — stored as its two junction vertices plus (core arc, from, to): its geometry at a level is
     junction A, the core vertices of that range surviving the level, junction B. So the land partition this file was
     conflated onto is the core this worker already holds (CORE), and the buildId in the header must be the core's.
     A year's faces are triangulated LAZILY, one (face, level) at a time, into an LRU here; the main thread asks for the
     alive set of the year it shows and of the next change year in the direction of the scrub, so a year change never
     waits for earcut (§2.3, §2.4). The borders are one bucketed segment list per level with the arc index in the tag (kind
     7), and the main thread's per-arc style table decides which are drawn in a year — a year change costs a table. */
  const HIST_KIND = 7, HIST_LRU = 600;
  // the arc's geometry at a level (atlas-format.js historyArcGeometry: a coast junction moves onto the level's line)
  function histGeom(a, level) { return { own: false, pts: root.AtlasFormat.historyArcGeometry(HIST.T, CORE.T, a, level, HIST.junctions, HIST.empty) }; }
  // the geometry of every arc at a level as one local topology (lon, lat, rank 0, arcOffset), cached per level
  function histLevel(level) {
    let L = HIST.levels[level]; if (L) return L;
    const T = HIST.T, nA = T.arcOffset.length - 1;
    const lon = [], lat = [], arcOffset = new Uint32Array(nA + 1);
    for (let a = 0; a < nA; a++) {
      arcOffset[a] = lon.length;
      for (const p of histGeom(a, level).pts) { lon.push(p[0]); lat.push(p[1]); }
    }
    arcOffset[nA] = lon.length;
    const LT = { lon: Int32Array.from(lon), lat: Int32Array.from(lat), rank: new Uint8Array(lon.length), arcOffset, arcKind: T.arcKind, arcFlags: T.arcFlags, arcMinLod: new Uint8Array(nA), quantum: T.quantum };
    const D2R = Math.PI / 180, q = T.quantum, n = lon.length, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const la = lat[i] * q * D2R, lo = lon[i] * q * D2R, c = Math.cos(la); pos[3 * i] = c * Math.cos(lo); pos[3 * i + 1] = c * Math.sin(lo); pos[3 * i + 2] = Math.sin(la); }
    L = { T: LT, pos }; HIST.levels[level] = L; return L;
  }
  async function handleHistory(msg, post) {
    if (!CORE) { HIST_PENDING = msg; return; }   // the core is still loading: parsed once it is in
    const t0 = now();
    let T;
    try { T = await readTopology(msg.buffer); } catch (e) { post({ type: "error", message: "history: " + e.message }); return; }
    const H = T.header;
    if (!H.core || H.core.buildId !== CORE.T.header.buildId) { post({ type: "error", message: "history: built on core " + (H.core && H.core.buildId) + ", this is " + CORE.T.header.buildId }); return; }
    if (!T.coreArc) { post({ type: "error", message: "history: no coreRef section" }); return; }
    RAW.history = msg.buffer;
    HIST = { T, H, empty: H.arcEmpty || null, levels: [], meshes: new Map(), resident: new Set(), order: [], junctions: root.AtlasFormat.historyJunctions(T, CORE.T) };
    await tick();
    // per face: the bounding cap (centre, angular radius) and the area at LOD 0, for the rail's "what is on screen" and the label rank
    const nF = T.faces.length, faceCap = new Float32Array(nF * 4), faceEntity = new Uint32Array(nF);
    const L0 = histLevel(0);
    for (let fi = 0; fi < nF; fi++) {
      faceEntity[fi] = T.faces[fi].entity;
      let cx = 0, cy = 0, cz = 0, n = 0;
      const rings = faceRings(L0.T, T.faces[fi], 0);
      for (const ring of rings) for (const i of ring) { cx += L0.pos[3 * i]; cy += L0.pos[3 * i + 1]; cz += L0.pos[3 * i + 2]; n++; }
      const cl = Math.hypot(cx, cy, cz) || 1; cx /= cl; cy /= cl; cz /= cl;
      let r = 0; for (const ring of rings) for (const i of ring) { const d = Math.max(-1, Math.min(1, cx * L0.pos[3 * i] + cy * L0.pos[3 * i + 1] + cz * L0.pos[3 * i + 2])); const a = Math.acos(d); if (a > r) r = a; }
      faceCap[4 * fi] = cx; faceCap[4 * fi + 1] = cy; faceCap[4 * fi + 2] = cz; faceCap[4 * fi + 3] = r;
      if ((fi & 31) === 31) await tick();
    }
    // per face: its non-coast arcs (the borders a year draws), flat with offsets, so the main thread's arc table costs no geometry
    const faceArcOff = new Uint32Array(nF + 1), fa = [];
    for (let fi = 0; fi < nF; fi++) { faceArcOff[fi] = fa.length; const seen = new Set(); for (const ring of T.faces[fi].rings) for (const ref of ring) { const a = Math.abs(ref) - 1; if (T.arcKind[a] === 0 || seen.has(a)) continue; seen.add(a); fa.push(a); } }
    faceArcOff[nF] = fa.length; const faceArcs = Uint32Array.from(fa);
    post({ type: "history-meta", header: H, faceEntity, faceCap, faceArcOff, faceArcs, parseMs: Math.round(now() - t0) }, [faceEntity.buffer, faceCap.buffer, faceArcOff.buffer, faceArcs.buffer]);
    // the borders per level: every arc that is not a coast reference, tag = arc × 64 + (flags & 7) × 8 + HIST_KIND
    for (let level = 0; level < 3; level++) {
      const L = histLevel(level);
      const nA = T.arcOffset.length - 1;
      let count = 0;
      for (let a = 0; a < nA; a++) { if (T.arcKind[a] === 0) continue; count += Math.max(0, L.T.arcOffset[a + 1] - L.T.arcOffset[a] - 1); }
      const segs = new Float32Array(count * 7); let k = 0;
      for (let a = 0; a < nA; a++) {
        if (T.arcKind[a] === 0) continue;
        const tag = a * 64 + (T.arcFlags[a] & 7) * 8 + HIST_KIND;
        for (let i = L.T.arcOffset[a] + 1; i < L.T.arcOffset[a + 1]; i++) { const p = L.pos; segs[k++] = p[3 * (i - 1)]; segs[k++] = p[3 * (i - 1) + 1]; segs[k++] = p[3 * (i - 1) + 2]; segs[k++] = p[3 * i]; segs[k++] = p[3 * i + 1]; segs[k++] = p[3 * i + 2]; segs[k++] = tag; }
      }
      const S = await bucketSegments(segs);
      post({ type: "history-segs", level, segs: S.segs, segRange: S.segRange, segCap: S.segCap, count }, [S.segs.buffer, S.segRange.buffer, S.segCap.buffer]);
      await tick();
    }
    post({ type: "history-done", ms: Math.round(now() - t0), arcs: T.arcOffset.length - 1, faces: nF });
  }
  async function handleHistoryFaces(msg, post) {
    if (!HIST) return;
    const level = Math.min(2, msg.level | 0), L = histLevel(level), meshes = [];
    const t0 = now();
    for (const fi of msg.faces || []) {
      const key = fi + ":" + level;
      if (HIST.resident.has(key)) continue;
      let m = HIST.meshes.get(key);
      if (!m) {
        const sink = Sink();
        await triangulateFace(L.T, L.pos, HIST.T.faces[fi], fi, level, sink);
        const F = sink.result();
        // the face's coast edges at this level, for the fill-against-stroke stroke at the tile zooms (§2.3, Phase 2a)
        const coast = [];
        for (const ring of HIST.T.faces[fi].rings) for (const ref of ring) { const a = Math.abs(ref) - 1; if (HIST.T.arcKind[a] !== 0) continue; for (let i = L.T.arcOffset[a] + 1; i < L.T.arcOffset[a + 1]; i++) coast.push(L.pos[3 * (i - 1)], L.pos[3 * (i - 1) + 1], L.pos[3 * (i - 1) + 2], L.pos[3 * i], L.pos[3 * i + 1], L.pos[3 * i + 2], fi * 64 + HIST_KIND); }
        m = { face: fi, level, pos: F.pos, idx: F.triangles * 3 <= 65535 && F.vertices <= 65535 ? Uint16Array.from(F.idx) : F.idx, coast: Float32Array.from(coast), triangles: F.triangles };
        HIST.meshes.set(key, m); HIST.order.push(key);
        while (HIST.order.length > HIST_LRU) { const old = HIST.order.shift(); if (!HIST.resident.has(old)) HIST.meshes.delete(old); else HIST.order.push(old); if (HIST.order.length > HIST_LRU * 2) break; }
      }
      HIST.resident.add(key);
      meshes.push({ face: fi, level, pos: m.pos.slice(), idx: m.idx.slice(), coast: m.coast.slice(), triangles: m.triangles });
    }
    const transfer = []; for (const m of meshes) transfer.push(m.pos.buffer, m.idx.buffer, m.coast.buffer);
    post({ type: "history-faces", level, meshes, seq: msg.seq, ms: Math.round(now() - t0) }, transfer);
  }
  /* the label path of an alive face on screen: the area-weighted centre of its LOD 0 fill and the principal axis of its
     projected vertices, walked both ways from the centre while inside the projected rings (even-odd) — a straight run of
     up to five points, the polity's name laid along it in small capitals like a country's (§2.6) */
  function histLabelPath(fi, proj, W, H) {
    const L = histLevel(0), T = HIST.T;
    const rings = faceRings(L.T, T.faces[fi], 0).map((ring) => ring.map((i) => proj([L.pos[3 * i], L.pos[3 * i + 1], L.pos[3 * i + 2]])));
    const vis = rings.map((r) => r.filter((p) => p[2] > 0.02));
    if (!vis.some((r) => r.length >= 3)) return null;
    // the visible polygon's centroid and covariance (vertex-weighted; a fill's area needs the mesh — the vertices are enough for an axis).
    // "Visible" means ON SCREEN when at least three vertices are: a face reaching past the viewport (the Eastern Roman Empire at
    // 500 CE at 3 km/px, its Balkan third on screen and Anatolia, Syria and Egypt beyond the right edge) takes its name on the
    // part a reader sees, as a printed sheet names a country on the part the sheet shows; otherwise the margin box as before
    const inView = (x, y) => x >= 0 && x <= W && y >= 0 && y <= H;
    const inBox = (x, y) => x >= -W && x <= 2 * W && y >= -H && y <= 2 * H;
    let nIn = 0; for (const r of vis) for (const p of r) if (inView(p[0], p[1])) nIn++;
    const take = nIn >= 3 ? inView : inBox;
    let n = 0, sx = 0, sy = 0;
    for (const r of vis) for (const p of r) { if (!take(p[0], p[1])) continue; sx += p[0]; sy += p[1]; n++; }
    if (n < 3) return null;
    const cx = sx / n, cy = sy / n;
    let sxx = 0, sxy = 0, syy = 0;
    for (const r of vis) for (const p of r) { if (!take(p[0], p[1])) continue; const dx = p[0] - cx, dy = p[1] - cy; sxx += dx * dx; sxy += dx * dy; syy += dy * dy; }
    const ang = 0.5 * Math.atan2(2 * sxy, sxx - syy);
    const inside = (x, y) => { let c = false; for (const r of rings) { if (r.length < 3) continue; let hit = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const a = r[i], b = r[j]; if (a[2] <= 0 || b[2] <= 0) continue; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) hit = !hit; } if (hit) c = !c; } return c; };
    // the centre may fall outside a crescent (the Eastern Roman Empire round the Aegean at 500 CE: its centroid is at sea, and the
    // major axis through the nearest land point crosses the water at once). Candidates: the centroid when inside, then the inside
    // points met sliding from it along the minor and the major axis, both ways; at each, the reach along the major axis and along
    // the minor one; the longest run wins, so the label follows the crescent's limb rather than its chord
    const reachAt = (x, y, dx, dy) => { const go = (sgn) => { let d = 0; for (;;) { const nd = d + 6, px = x + dx * nd * sgn, py = y + dy * nd * sgn; if (!inside(px, py) || !take(px, py) || nd > Math.hypot(W, H)) break; d = nd; } return d; }; return [go(-1), go(1)]; };   // the reach stops at the screen edge when the face is on screen: the name lies on what is drawn
    const cands = []; if (inside(cx, cy)) cands.push([cx, cy]);
    for (const [ux, uy] of [[-Math.sin(ang), Math.cos(ang)], [Math.cos(ang), Math.sin(ang)]]) for (const sgn of [1, -1]) { let found = 0; for (let d = 4; d < Math.max(W, H) && found < 2; d += 4) { const x = cx + ux * d * sgn, y = cy + uy * d * sgn; if (!take(x, y)) break; if (inside(x, y)) { cands.push([x, y]); found++; d += 40; } } }
    if (!cands.length) return null;
    let best = null;
    for (const [x, y] of cands) for (const [dx, dy] of [[Math.cos(ang), Math.sin(ang)], [-Math.sin(ang), Math.cos(ang)]]) { const [a, b] = reachAt(x, y, dx, dy); if (!best || a + b > best.len) best = { x, y, dx, dy, a, b, len: a + b }; }
    if (!best || best.len < 24) return null;
    const { x: ox, y: oy, dx, dy, a, b } = best;
    const pts = []; for (let k = 0; k <= 4; k++) { const t = -a + (a + b) * k / 4; pts.push([ox + dx * t, oy + dy * t]); }
    return { pts, len: a + b, anchor: [ox, oy] };
  }
  /* ---------- water (Phase 1b): lake shores, rivers and lake fills, per resident level and per tile ----------
     Rivers come from a 1:10M source (chords 1.8 km at the median), so at the tile zooms (under 1 km/px)
     the resident polylines are smoothed instead of refined: two Chaikin passes over EVERY vertex the
     file carries (ranks 0–3), endpoints fixed — and because build-water.js splits a river at every
     junction, a fixed endpoint is a junction, so smoothing never opens a gap where a tributary joins. */
  function chaikin(pts, passes) {
    let P = pts;
    for (let p = 0; p < passes; p++) {
      if (P.length < 3) return P;
      const Qv = [P[0]];
      for (let i = 0; i + 1 < P.length; i++) {
        const a = P[i], b = P[i + 1];
        Qv.push(norm3([0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1], 0.75 * a[2] + 0.25 * b[2]]));
        Qv.push(norm3([0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1], 0.25 * a[2] + 0.75 * b[2]]));
      }
      Qv.push(P[P.length - 1]);
      P = Qv;
    }
    return P;
  }
  function norm3(v) { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
  function smoothedRiverSegments(T, pos) {
    const nA = T.arcOffset.length - 1, out = [];
    for (let a = 0; a < nA; a++) {
      if (T.arcKind[a] !== KIND_RIVER) continue;
      const tag = a * 64 + (T.arcFlags[a] & 7) * 8 + KIND_RIVER;
      const P = []; for (let i = T.arcOffset[a]; i < T.arcOffset[a + 1]; i++) P.push([pos[3 * i], pos[3 * i + 1], pos[3 * i + 2]]);
      const S = chaikin(P, 2);
      for (let i = 1; i < S.length; i++) out.push(S[i - 1][0], S[i - 1][1], S[i - 1][2], S[i][0], S[i][1], S[i][2], tag);
    }
    return Float32Array.from(out);
  }
  /* THE LAKE-AREA BINS (Phase 1c). At 3 km/px a 12 km² lake is a smear of a pixel, and the Europe view's lake
     primitives were mostly such smears (measured: 71k shore segments and 64k fill triangles). A resident
     level's lake triangles and shore segments are therefore laid out per area bin — half-octave bins from
     10 km² — and the renderer draws only the bins whose lakes cover at least LAKE_MIN_PX² at its zoom.
     Level 0 (lakes ≥ 1000 km², drawn above 16 km/px) and the tiles (≥ 6 km² at the cap) never cross that
     line and keep one bin. A face's area is the sum of its triangles' (a flat triangle on unit vectors × R²). */
  const LAKE_BIN_EDGES = [10, 14, 20, 28, 40, 57, 80, 113, 160, 226, 320, 453, 640, 905, 1280, 1810, 2560];
  const R_KM2 = 6371.0088 * 6371.0088;
  function lakeBinOf(km2) { let b = 0; while (b < LAKE_BIN_EDGES.length && km2 >= LAKE_BIN_EDGES[b]) b++; return b; }
  async function waterLevel(T, pos, level, bucketer, arcIdOf, withSmooth, withBins) {
    const lakeRaw = buildSegments(T, pos, level, arcIdOf, KIND_LAKE), riverRaw = buildSegments(T, pos, level, arcIdOf, KIND_RIVER);
    await tick("Filling the lakes…");
    const sink = Sink();
    let tris = 0;
    for (let i = 0; i < T.faces.length; i++) { const f = T.faces[i]; const id = LAKE_FACE_BASE + (T.faceRef && T.faceRef[i] >= 0 ? T.faceRef[i] : i); tris += await triangulateFace(T, pos, f, id, Math.min(level, CHORD_DEG.length - 1), sink); if ((i & 63) === 63) await tick("Filling the lakes…"); }
    const Fm = sink.result();
    let binTri = null, binSeg = null, nBins = 1;
    if (withBins) {
      nBins = LAKE_BIN_EDGES.length + 1;
      // area per face id from the triangles, then a bin per triangle and per shore segment (arc → face)
      const area = new Map();
      const P = Fm.pos, I = Fm.idx;
      for (let t = 0; t < I.length; t += 3) {
        const a = I[t], b = I[t + 1], c = I[t + 2];
        const ux = P[4 * b] - P[4 * a], uy = P[4 * b + 1] - P[4 * a + 1], uz = P[4 * b + 2] - P[4 * a + 2];
        const vx = P[4 * c] - P[4 * a], vy = P[4 * c + 1] - P[4 * a + 1], vz = P[4 * c + 2] - P[4 * a + 2];
        const cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
        const f = P[4 * a + 3];
        area.set(f, (area.get(f) || 0) + 0.5 * Math.hypot(cx, cy, cz) * R_KM2);
      }
      const arcFace = new Map();
      T.faces.forEach((f, i) => { const id = LAKE_FACE_BASE + (T.faceRef && T.faceRef[i] >= 0 ? T.faceRef[i] : i); for (const ring of f.rings) for (const ref of ring) arcFace.set(Math.abs(ref) - 1, id); });
      binTri = (t) => lakeBinOf(area.get(Fm.pos[4 * Fm.idx[3 * t] + 3]) || 0);
      binSeg = (i) => { const tag = lakeRaw[7 * i + 6], arc = Math.floor(tag / 64); return lakeBinOf(area.get(arcFace.get(arc)) || 0); };
    }
    const Lk = await bucketSegments(lakeRaw, bucketer, binSeg, nBins), Rv = await bucketSegments(riverRaw, bucketer), B = await bucketTriangles(Fm.pos, Fm.idx, bucketer, binTri, nBins);
    const m = { lakeSegs: Lk.segs, lakeRange: Lk.segRange, lakeCap: Lk.segCap, riverSegs: Rv.segs, riverRange: Rv.segRange, riverCap: Rv.segCap, facePos: Fm.pos, faceIdx: B.faceIdx, faceRange: B.faceRange, faceCap: B.faceCap, lakeBins: nBins > 1 ? LAKE_BIN_EDGES : null, stats: { level, lakeSegments: lakeRaw.length / 7, riverSegments: riverRaw.length / 7, triangles: tris, faceVertices: Fm.vertices } };
    const transfer = [Lk.segs.buffer, Lk.segRange.buffer, Lk.segCap.buffer, Rv.segs.buffer, Rv.segRange.buffer, Rv.segCap.buffer, Fm.pos.buffer, B.faceIdx.buffer, B.faceRange.buffer, B.faceCap.buffer];
    if (withSmooth) { const Sm = await bucketSegments(smoothedRiverSegments(T, pos), bucketer); m.smoothSegs = Sm.segs; m.smoothRange = Sm.segRange; m.smoothCap = Sm.segCap; m.stats.smoothSegments = Sm.segs.length / 8; transfer.push(Sm.segs.buffer, Sm.segRange.buffer, Sm.segCap.buffer); }
    return { m, transfer };
  }
  async function handleWater(msg, post) {
    try { await handleWaterInner(msg, post); } catch (e) { post({ type: "error", message: "water: " + (e && e.message || e) }); }
  }
  async function handleWaterInner(msg, post) {
    const t0 = now();
    let T;
    try { T = await readTopology(msg.buffer); }
    catch (e) { post({ type: "error", message: "water: " + e.message }); return; }
    await tick("Reading the rivers and lakes…");
    const pos = await unitVectors(T);
    RAW.water = msg.buffer;
    // Phase 1c: which entity each lake face belongs to (the ID pass names lakes), which river ENTITY each
    // arc is in, and every river entity's polyline parts at the LOD 1 vertices for the label layout (kept
    // here, never posted; a river has one part per arc list of header.rivers — a list breaks at a lake)
    const faceEntity = new Uint32Array(T.faces.length);
    T.faces.forEach((f, i) => { faceEntity[i] = f.entity; });
    const arcRiver = new Int32Array(T.arcOffset.length - 1).fill(-1);
    RIVER_LINES = new Map(); RIVER_CAPS = new Map();
    (T.header.rivers || []).forEach((rv) => {
      const pts = [];
      // header.rivers' arc references are ONE-BASED (the writer's TopoJSON habit: pack-water.js stores arcIndex + 1); read
      // as zero-based they named the arc after each one, so a river's name ran along its neighbours' lines and a tap on
      // an arc answered with the river of the arc before it (found by the Phase 1c screenshot review)
      for (const ref of rv.arcs) { const a = Math.abs(ref) - 1; if (a < 0 || a + 1 >= T.arcOffset.length) continue; arcRiver[a] = rv.entity; const s0 = T.arcOffset[a], e0 = T.arcOffset[a + 1]; if (ref > 0) { for (let i = s0; i < e0; i++) if (T.rank[i] <= 1) pts.push(pos[3 * i], pos[3 * i + 1], pos[3 * i + 2]); } else { for (let i = e0 - 1; i >= s0; i--) if (T.rank[i] <= 1) pts.push(pos[3 * i], pos[3 * i + 1], pos[3 * i + 2]); } }
      if (!RIVER_LINES.has(rv.entity)) RIVER_LINES.set(rv.entity, []);
      RIVER_LINES.get(rv.entity).push(Float32Array.from(pts));
    });
    await tick("Reading the rivers and lakes…");
    // a bounding cap per river (its parts' mean direction and the largest angle to any vertex): a river whose cap
    // is nowhere near the view is skipped before a single vertex is projected (952 named rivers, every layout)
    for (const [ent, parts] of RIVER_LINES) {
      let sx = 0, sy = 0, sz = 0, n = 0;
      for (const l of parts) for (let i = 0; i < l.length; i += 3) { sx += l[i]; sy += l[i + 1]; sz += l[i + 2]; n++; }
      const len = Math.hypot(sx, sy, sz) || 1, cx = sx / len, cy = sy / len, cz = sz / len;
      let ang = 0;
      for (const l of parts) for (let i = 0; i < l.length; i += 3) { const d = Math.max(-1, Math.min(1, l[i] * cx + l[i + 1] * cy + l[i + 2] * cz)); const a = Math.acos(d); if (a > ang) ang = a; }
      RIVER_CAPS.set(ent, [cx, cy, cz, ang]);
      if ((ent & 63) === 63) await tick();
    }
    post({ type: "water-meta", header: T.header, faceEntity, arcRiver, parseMs: Math.round(now() - t0) }, [faceEntity.buffer, arcRiver.buffer]);
    for (let level = 0; level < T.lodCount; level++) {
      const t1 = now();
      // the smoothed rivers are drawn past LOD 2, which only a tile zoom reaches: the shim (file://, no tiles) skips them
      const { m, transfer } = await waterLevel(T, pos, level, null, null, level === T.lodCount - 1 && !Y.shim, level >= 1);
      m.stats.ms = Math.round(now() - t1);
      post(Object.assign({ type: "water-lod", level }, m), transfer);
    }
  }
  async function handleWaterTile(msg, post) {
    try { await handleWaterTileInner(msg, post); } catch (e) { post({ type: "error", message: "water-tile " + msg.key + ": " + (e && e.message || e) }); }
  }
  async function handleWaterTileInner(msg, post) {
    const t0 = now();
    let T;
    try { T = await readTopology(msg.buffer); }
    catch (e) { post({ type: "error", message: "water-tile " + msg.key + ": " + e.message }); return; }
    const tile = T.header.tile;
    const pos = await unitVectors(T);
    const arcIdOf = (a) => (T.arcRef && T.arcRef[a] >= 0 ? T.arcRef[a] : 0);
    const { m, transfer } = await waterLevel(T, pos, 0, tileBucketer(tile), arcIdOf, false);
    m.stats.key = msg.key; m.stats.ms = Math.round(now() - t0); m.stats.bytes = msg.buffer.byteLength;
    post(Object.assign({ type: "water-tile", key: msg.key, tile, buckets: TILE_GRID * TILE_GRID }, m), transfer);
  }
  /* relief (Phase 1b): three greyscale bitmaps → one RGB byte array (shade, height high byte, low byte). The
     bitmaps were decoded with colorSpaceConversion "none" and are opaque greys, so a 2D canvas returns
     their bytes unchanged; the main thread uploads the result as one RGB8 texture. */
  function handleRelief(msg, post) {
    const w = msg.w, h = msg.h, n = w * h;
    if (typeof OffscreenCanvas !== "function") { post({ type: "relief", key: msg.key, w, h, rgb: null, planes: { hi: msg.hi, lo: msg.lo, sh: msg.sh } }, [msg.hi, msg.lo, msg.sh]); return; }   // the main thread composes
    const c = new OffscreenCanvas(w, h), x = c.getContext("2d", { willReadFrequently: true });
    const rgb = new Uint8Array(n * 3);
    [["sh", 0], ["hi", 1], ["lo", 2]].forEach(([k, ch]) => { x.drawImage(msg[k], 0, 0); const d = x.getImageData(0, 0, w, h).data; for (let i = 0, o = ch; i < n; i++, o += 3) rgb[o] = d[4 * i]; msg[k].close(); });
    post({ type: "relief", key: msg.key, w, h, rgb }, [rgb.buffer]);
  }

  async function handleTile(msg, post) {
    const t0 = now();
    let T;
    try { T = await readTopology(msg.buffer); }
    catch (e) { post({ type: "error", message: "tile " + msg.key + ": " + e.message }); return; }
    const tile = T.header.tile, level = tile ? tile.z : 3;
    const pos = await unitVectors(T);
    const arcIdOf = (a) => (T.arcRef && T.arcRef[a] >= 0 ? T.arcRef[a] : 0);
    const raw = buildSegments(T, pos, 0, arcIdOf);
    const sink = Sink();
    let tris = 0;
    // a tile's faces are pieces of core faces: the triangle's face id is the CORE index (faceRef)
    const chordLevel = Math.min(level, CHORD_DEG.length - 1);
    for (let i = 0; i < T.faces.length; i++) { const coreFace = T.faceRef ? T.faceRef[i] : i; tris += await triangulateFace(T, pos, T.faces[i], coreFace, chordLevel, sink); }
    const F = sink.result();
    const bucketer = tileBucketer(tile);
    const S = await bucketSegments(raw, bucketer), B = await bucketTriangles(F.pos, F.idx, bucketer);
    const stats = { key: msg.key, z: level, segments: raw.length / 7, faceVertices: F.vertices, triangles: F.triangles, ms: Math.round(now() - t0), bytes: msg.buffer.byteLength };
    post({ type: "tile", key: msg.key, tile, segs: S.segs, segRange: S.segRange, segCap: S.segCap, segRangeA1: S.segRangeA1, segCapA1: S.segCapA1, facePos: F.pos, faceIdx: B.faceIdx, faceRange: B.faceRange, faceCap: B.faceCap, buckets: bucketer.count, stats },
      [S.segs.buffer, S.segRange.buffer, S.segCap.buffer, S.segRangeA1.buffer, S.segCapA1.buffer, F.pos.buffer, B.faceIdx.buffer, B.faceRange.buffer, B.faceCap.buffer]);
  }
  function now() { return (typeof performance !== "undefined" ? performance.now() : Date.now()); }

  if (IN_WORKER) {
    root.onmessage = (e) => { try { handle(e.data, (m, tr) => root.postMessage(m, tr || [])); } catch (err) { root.postMessage({ type: "error", message: String(err && err.stack || err) }); } };
  } else {
    // main-thread shim (file://, or a worker that failed to start): the same handler, called directly, yielding every
    // Y.every ms (see `tick`); the caller supplies `post` and may supply `progress(text, frac)` for its status line
    root.AtlasWorkerMain = {
      handle: (msg, post, progress) => { Y.shim = true; if (progress) Y.progress = progress; try { const p = handle(msg, (m) => post(m)); return p && typeof p.then === "function" ? p.catch((err) => post({ type: "error", message: String(err && err.stack || err) })) : Promise.resolve(); } catch (err) { post({ type: "error", message: String(err && err.stack || err) }); return Promise.resolve(); } },
      yieldEvery: (ms) => { Y.every = ms; },
      _debug: { buildSegments, unitVectors, triangulateFace, Sink },   // for the chunk measurement in .claude/ (not used by the page)
    };
  }
})(typeof self !== "undefined" ? self : globalThis);
