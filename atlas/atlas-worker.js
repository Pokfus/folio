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
  const D2R = Math.PI / 180;

  function unitVectors(T) {
    const n = T.lon.length, q = T.quantum, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const lon = T.lon[i] * q * D2R, lat = T.lat[i] * q * D2R, c = Math.cos(lat);
      pos[3 * i] = c * Math.cos(lon); pos[3 * i + 1] = c * Math.sin(lon); pos[3 * i + 2] = Math.sin(lat);
    }
    return pos;
  }

  /* ---------- arcs → segments at a level ---------- */
  /* The tag packs arc id, flags and kind into one float: kind + 8·flags + 64·arc (exact below 2^24, so
     arcs up to 262k). Tile-edge chords (KIND.EDGE) are never segments: they close a fill, not a line. */
  const KIND_EDGE = 6;
  function buildSegments(T, pos, level, arcIdOf) {
    const nA = T.arcOffset.length - 1;
    const skip = (a) => T.arcMinLod[a] > level || T.arcKind[a] === KIND_EDGE;
    let count = 0;
    for (let a = 0; a < nA; a++) { if (skip(a)) continue; for (let i = T.arcOffset[a] + 1; i < T.arcOffset[a + 1]; i++) if (T.rank[i] <= level) count++; }
    const segs = new Float32Array(count * 7);   // ax ay az bx by bz tag
    let k = 0;
    for (let a = 0; a < nA; a++) {
      if (skip(a)) continue;
      const tag = (arcIdOf ? arcIdOf(a) : a) * 64 + (T.arcFlags[a] & 3) * 8 + T.arcKind[a];
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

  function triangulateFace(T, pos, face, faceId, level, sink) {
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
    for (const h of polys) { if (h.area > 0) continue; const o = outers.find((o) => inside(h.p[0], o)); if (o) o.holes.push(h); }
    let triangles = 0;
    const chord = 2 * Math.sin(CHORD_DEG[Math.min(level, CHORD_DEG.length - 1)] * D2R / 2), chord2 = chord * chord;
    for (const o of outers) {
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
     384 buckets = 6 cube faces × 8 × 8 cells. Each triangle goes into the bucket of its centroid, each
     segment into that of its midpoint; the arrays are reordered by bucket and a (start, count) range per
     bucket is emitted, with the bucket's bounding cap (centre, angular radius) so the renderer can test
     "can this bucket be on screen" with one dot product. Software GL pays per triangle rasterised, and
     a zoomed-in view sees a few per cent of the earth. */
  const BUCKETS = 384;
  function bucketOf(x, y, z) {
    const ax = Math.abs(x), ay = Math.abs(y), az = Math.abs(z);
    let face, u, w;
    if (ax >= ay && ax >= az) { face = x < 0 ? 1 : 0; u = y / ax; w = z / ax; }
    else if (ay >= az) { face = y < 0 ? 3 : 2; u = x / ay; w = z / ay; }
    else { face = z < 0 ? 5 : 4; u = x / az; w = y / az; }
    const cu = Math.min(7, Math.max(0, Math.floor((u + 1) * 4))), cw = Math.min(7, Math.max(0, Math.floor((w + 1) * 4)));
    return face * 64 + cu * 8 + cw;
  }
  // caps: per bucket the normalised mean of its items' centres and the largest angle from it to ANY
  // vertex of an item (an endpoint of a 1° segment at LOD 0 lies well outside its midpoint's cell)
  function caps(count, centreOf, pointsOf, bucketOfItem) {
    const sum = new Float64Array(BUCKETS * 3), cap = new Float32Array(BUCKETS * 4);
    for (let i = 0; i < count; i++) { const b = bucketOfItem(i), d = centreOf(i); sum[3 * b] += d[0]; sum[3 * b + 1] += d[1]; sum[3 * b + 2] += d[2]; }
    for (let b = 0; b < BUCKETS; b++) { const l = Math.hypot(sum[3 * b], sum[3 * b + 1], sum[3 * b + 2]) || 1; cap[4 * b] = sum[3 * b] / l; cap[4 * b + 1] = sum[3 * b + 1] / l; cap[4 * b + 2] = sum[3 * b + 2] / l; cap[4 * b + 3] = 0; }
    for (let i = 0; i < count; i++) {
      const b = bucketOfItem(i);
      for (const d of pointsOf(i)) { const c = Math.max(-1, Math.min(1, d[0] * cap[4 * b] + d[1] * cap[4 * b + 1] + d[2] * cap[4 * b + 2])); const a = Math.acos(c); if (a > cap[4 * b + 3]) cap[4 * b + 3] = a; }
    }
    return cap;
  }
  function sortByBucket(count, bucketOfItem) {
    const bucket = new Int32Array(count), start = new Uint32Array(BUCKETS + 1);
    for (let i = 0; i < count; i++) { bucket[i] = bucketOfItem(i); start[bucket[i] + 1]++; }
    for (let b = 0; b < BUCKETS; b++) start[b + 1] += start[b];
    const order = new Uint32Array(count), fill = start.slice(0, BUCKETS);
    for (let i = 0; i < count; i++) order[fill[bucket[i]]++] = i;
    const range = new Uint32Array(BUCKETS * 2);
    for (let b = 0; b < BUCKETS; b++) { range[2 * b] = start[b]; range[2 * b + 1] = start[b + 1] - start[b]; }
    return { order, range };
  }
  // segments: reorder the 7-float records into 8-float texels (a.xyz, tag, b.xyz, 0) by bucket
  function bucketSegments(segs) {
    const n = segs.length / 7;
    const mid = (i) => { const x = segs[7 * i] + segs[7 * i + 3], y = segs[7 * i + 1] + segs[7 * i + 4], z = segs[7 * i + 2] + segs[7 * i + 5]; const l = Math.hypot(x, y, z) || 1; return [x / l, y / l, z / l]; };
    const bk = new Int32Array(n); for (let i = 0; i < n; i++) { const m = mid(i); bk[i] = bucketOf(m[0], m[1], m[2]); }
    const { order, range } = sortByBucket(n, (i) => bk[i]);
    const out = new Float32Array(n * 8);
    for (let k = 0; k < n; k++) { const i = order[k]; out[8 * k] = segs[7 * i]; out[8 * k + 1] = segs[7 * i + 1]; out[8 * k + 2] = segs[7 * i + 2]; out[8 * k + 3] = segs[7 * i + 6]; out[8 * k + 4] = segs[7 * i + 3]; out[8 * k + 5] = segs[7 * i + 4]; out[8 * k + 6] = segs[7 * i + 5]; out[8 * k + 7] = 0; }
    const ends = (i) => [[segs[7 * i], segs[7 * i + 1], segs[7 * i + 2]], [segs[7 * i + 3], segs[7 * i + 4], segs[7 * i + 5]]];
    const cap = caps(n, (k) => mid(order[k]), (k) => ends(order[k]), (k) => bk[order[k]]);
    return { segs: out, segRange: range, segCap: cap };
  }
  function bucketTriangles(pos, idx) {
    const n = idx.length / 3;
    const cen = (t) => { const a = idx[3 * t], b = idx[3 * t + 1], c = idx[3 * t + 2]; const x = pos[4 * a] + pos[4 * b] + pos[4 * c], y = pos[4 * a + 1] + pos[4 * b + 1] + pos[4 * c + 1], z = pos[4 * a + 2] + pos[4 * b + 2] + pos[4 * c + 2]; const l = Math.hypot(x, y, z) || 1; return [x / l, y / l, z / l]; };
    const bk = new Int32Array(n); for (let t = 0; t < n; t++) { const c = cen(t); bk[t] = bucketOf(c[0], c[1], c[2]); }
    const { order, range } = sortByBucket(n, (t) => bk[t]);
    const out = new Uint32Array(idx.length);
    for (let k = 0; k < n; k++) { const t = order[k]; out[3 * k] = idx[3 * t]; out[3 * k + 1] = idx[3 * t + 1]; out[3 * k + 2] = idx[3 * t + 2]; }
    const corners = (t) => [0, 1, 2].map((j) => { const v = idx[3 * t + j]; return [pos[4 * v], pos[4 * v + 1], pos[4 * v + 2]]; });
    const cap = caps(n, (k) => cen(order[k]), (k) => corners(order[k]), (k) => bk[order[k]]);
    // ranges in index units
    for (let b = 0; b < BUCKETS; b++) { range[2 * b] *= 3; range[2 * b + 1] *= 3; }
    return { faceIdx: out, faceRange: range, faceCap: cap };
  }

  function handle(msg, post) {
    if (msg.type === "tile") { handleTile(msg, post); return; }
    if (msg.type !== "load") return;
    const t0 = now();
    let T;
    try { T = root.AtlasFormat.read(new Uint8Array(msg.buffer)); }
    catch (e) { post({ type: "error", message: "topology: " + e.message }); return; }
    const pos = unitVectors(T);
    const faceEntity = new Uint32Array(T.faces.length);
    T.faces.forEach((f, i) => { faceEntity[i] = f.entity; });
    post({ type: "meta", header: T.header, faceEntity, parseMs: now() - t0 }, [faceEntity.buffer]);
    const stats = { parseMs: Math.round(now() - t0), levels: [] };
    for (let level = 0; level < T.lodCount; level++) {
      const t1 = now();
      const raw = buildSegments(T, pos, level);
      const sink = Sink();
      let tris = 0;
      T.faces.forEach((f, i) => { tris += triangulateFace(T, pos, f, i, level, sink); });
      const F = sink.result();
      const S = bucketSegments(raw), B = bucketTriangles(F.pos, F.idx);
      const s = { level, segments: raw.length / 7, faceVertices: F.vertices, triangles: F.triangles, ms: Math.round(now() - t1) };
      stats.levels.push(s);
      post({ type: "lod", level, segs: S.segs, segRange: S.segRange, segCap: S.segCap, facePos: F.pos, faceIdx: B.faceIdx, faceRange: B.faceRange, faceCap: B.faceCap, buckets: BUCKETS, stats: s },
        [S.segs.buffer, S.segRange.buffer, S.segCap.buffer, F.pos.buffer, B.faceIdx.buffer, B.faceRange.buffer, B.faceCap.buffer]);
    }
    stats.totalMs = Math.round(now() - t0);
    post({ type: "done", stats });
  }
  function handleTile(msg, post) {
    const t0 = now();
    let T;
    try { T = root.AtlasFormat.read(new Uint8Array(msg.buffer)); }
    catch (e) { post({ type: "error", message: "tile " + msg.key + ": " + e.message }); return; }
    const tile = T.header.tile, level = tile ? tile.z : 3;
    const pos = unitVectors(T);
    const arcIdOf = (a) => (T.arcRef && T.arcRef[a] >= 0 ? T.arcRef[a] : 0);
    const raw = buildSegments(T, pos, 0, arcIdOf);
    const sink = Sink();
    let tris = 0;
    // a tile's faces are pieces of core faces: the triangle's face id is the CORE index (faceRef)
    const chordLevel = Math.min(level, CHORD_DEG.length - 1);
    T.faces.forEach((f, i) => { const coreFace = T.faceRef ? T.faceRef[i] : i; tris += triangulateFace(T, pos, f, coreFace, chordLevel, sink); });
    const F = sink.result();
    const S = bucketSegments(raw), B = bucketTriangles(F.pos, F.idx);
    const stats = { key: msg.key, z: level, segments: raw.length / 7, faceVertices: F.vertices, triangles: F.triangles, ms: Math.round(now() - t0), bytes: msg.buffer.byteLength };
    post({ type: "tile", key: msg.key, tile, segs: S.segs, segRange: S.segRange, segCap: S.segCap, facePos: F.pos, faceIdx: B.faceIdx, faceRange: B.faceRange, faceCap: B.faceCap, buckets: BUCKETS, stats },
      [S.segs.buffer, S.segRange.buffer, S.segCap.buffer, F.pos.buffer, B.faceIdx.buffer, B.faceRange.buffer, B.faceCap.buffer]);
  }
  function now() { return (typeof performance !== "undefined" ? performance.now() : Date.now()); }

  if (IN_WORKER) {
    root.onmessage = (e) => { try { handle(e.data, (m, tr) => root.postMessage(m, tr || [])); } catch (err) { root.postMessage({ type: "error", message: String(err && err.stack || err) }); } };
  } else {
    // main-thread shim (file://): the same handler, called directly; the caller supplies `post`
    root.AtlasWorkerMain = { handle: (msg, post) => { try { handle(msg, (m) => post(m)); } catch (err) { post({ type: "error", message: String(err && err.stack || err) }); } } };
  }
})(typeof self !== "undefined" ? self : globalThis);
