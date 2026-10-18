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
   so no flat triangle visibly cuts through the globe. Every edge over the threshold is split into pieces that
   depend on the edge alone (2b), so the two sides of a shared edge differ by at most a piece's sagitta — never a crack.

   The file is written to run in BOTH a Worker (importScripts) and, where workers are refused —
   file:// — on the main thread behind the same message shape (atlas.js's shim); nothing here touches
   the DOM. Earcut (atlas/vendor/earcut.js, ISC) is the only library.
*/
"use strict";
(function (root) {
  const IN_WORKER = typeof importScripts === "function";
  if (IN_WORKER) importScripts("atlas-format.js", "vendor/earcut.js", "study.js");

  const CHORD_DEG = [4.1, 2.3, 1.0, 0.5, 0.3];   // per level 0–4: a quarter pixel of sag at each level's first use (levels 3–4 are tiles)
  /* COOPERATIVE YIELDING (Phase 1d). In a Worker nothing here needs to yield: a frame is never behind this thread. On
     the main thread (the file:// shim, or a worker that failed to start) the same code must not hold the page for the
     two seconds LOD 2 costs, so every heavy loop awaits `tick()` — a no-op in the worker, and in the shim a setTimeout(0)
     whenever more than Y.every ms have passed since the last one, which hands the event loop a frame and lets the
     progress bar move. The functions are async either way: one code path, one set of bugs. */
  const Y = { shim: false, last: 0, every: 40, progress: null };
  /* PHASE 4b — WHAT A CARD WINDOW WAITS FOR. The levels (LOD 2 is ~3 s of triangulation) are built in one go, and a message that arrived meanwhile — the history file a war window needs, 9 MB — waited behind them. In a
     Worker the load now yields every few faces and between levels (a macrotask, so the queue is read): `history*` messages run AT ONCE, at the next yield; every other message (the water, the tiles, the layout) is
     held until the levels are in, exactly the order it always had. `LOADING` / `HELD` are that rule; the shim (file://) keeps `tick`. */
  let LOADING = false; const HELD = [];
  const yieldNow = () => (Y.shim ? null : new Promise((r) => setTimeout(r, 0)));
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

  /* A FRAME AND A PROJECTION about the centre of a set of rings (vertex indices into `pos`): gnomonic wherever the polygon stays within 85° of
     the centre, else azimuthal equidistant; `fwd(i)` → [x, y] for vertex i, `inv(x, y)` → a unit vector (gnomonic only). Lifted out of
     triangulateFace unchanged (Phase 2c) so the presence mesh builds in the very same frame. */
  function makeFrame(pos, vs) {
      let cx = 0, cy = 0, cz = 0;
      for (const ring of vs) for (const i of ring) { cx += pos[3 * i]; cy += pos[3 * i + 1]; cz += pos[3 * i + 2]; }
      let cl = Math.hypot(cx, cy, cz); if (cl < 1e-9) { cx = 0; cy = 0; cz = -1; cl = 1; }   // only a ring girdling the sphere: Antarctica-like → the south pole
      cx /= cl; cy /= cl; cz /= cl;
      let ux = 0, uy = 0, uz = 1; if (Math.abs(cz) > 0.9) { ux = 1; uy = 0; uz = 0; }
      let e1x = uy * cz - uz * cy, e1y = uz * cx - ux * cz, e1z = ux * cy - uy * cx; const l1 = Math.hypot(e1x, e1y, e1z); e1x /= l1; e1y /= l1; e1z /= l1;
      const e2x = cy * e1z - cz * e1y, e2y = cz * e1x - cx * e1z, e2z = cx * e1y - cy * e1x;
      let dmin = 1;
      for (const ring of vs) for (const i of ring) { const d = pos[3 * i] * cx + pos[3 * i + 1] * cy + pos[3 * i + 2] * cz; if (d < dmin) dmin = d; }
      const gnomonic = dmin > 0.0872;   // cos 85°
      const fwd = gnomonic ? (i) => {
        const x = pos[3 * i], y = pos[3 * i + 1], z = pos[3 * i + 2], d = x * cx + y * cy + z * cz;
        return [(x * e1x + y * e1y + z * e1z) / d, (x * e2x + y * e2y + z * e2z) / d];
      } : (i) => {
        const x = pos[3 * i], y = pos[3 * i + 1], z = pos[3 * i + 2];
        const d = Math.max(-1, Math.min(1, x * cx + y * cy + z * cz)), th = Math.acos(d);
        let tx = x - d * cx, ty = y - d * cy, tz = z - d * cz; const tl = Math.hypot(tx, ty, tz) || 1;
        return [th * (tx * e1x + ty * e1y + tz * e1z) / tl, th * (tx * e2x + ty * e2y + tz * e2z) / tl];
      };
      /* the inverse of the gnomonic projection (a planar point back to a unit vector on the sphere); null for the azimuthal fallback */
      const inv = gnomonic ? (x, y) => { const px = cx + x * e1x + y * e2x, py = cy + x * e1y + y * e2y, pz = cz + x * e1z + y * e2z, l = Math.hypot(px, py, pz) || 1; return [px / l, py / l, pz / l]; } : null;
      return { fwd, inv, gnomonic };
  }

  async function triangulateFace(T, pos, face, faceId, level, sink) {
    const rings = faceRings(T, face, level);
    if (!rings.length) return 0;
    /* A FRAME AND A PROJECTION about a centre c on the sphere: a right-handed tangent frame (e1, e2, c), e1 × e2 = c, so
       counter-clockwise on the sphere (seen from outside) stays counter-clockwise in the plane. Two projections (2b):
       gnomonic — x = p·e1 / p·c, y = p·e2 / p·c — wherever the polygon stays within 85° of c, because it maps every great
       circle to a straight line: earcut's planar triangles then ARE the spherical triangles with great-circle edges, and
       the points the subdivision below places on great circles lie exactly on the planar edges. The azimuthal equidistant
       projection used alone until 2b bends great circles, and earcut's hole bridges make needle triangles thinner than that
       bend: lifted to the sphere, a needle folded over its neighbour and the fill was drawn twice along it (a darker line
       from the Volga to Lake Baikal through the Mongol Empire of 1245 — the bridge from the Baikal hole). It remains the
       projection for classifying the rings (it exists everywhere, and orientation is what matters there) and for a polygon
       reaching beyond 85° of its centre (a ring girdling the sphere; no outer ring of the core or the history file does). */
    const frameAbout = (vs) => makeFrame(pos, vs).fwd;
    const proj = frameAbout(rings);
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
      // the polygon's own frame (2b): Norway's face reaches Bouvet Island, France's its overseas departments — a frame about
      // the whole face would put the mainland far from the centre; about this outer ring and its holes it stays gnomonic
      const pr = frameAbout([o.ring].concat(o.holes.map((h) => h.ring)));
      for (const i of o.ring) { const [x, y] = pr(i); flat.push(x, y); gidx.push(i); }
      for (const h of o.holes) { holeIdx.push(gidx.length); for (const i of h.ring) { const [x, y] = pr(i); flat.push(x, y); gidx.push(i); } }
      const tri = root.earcut(flat, holeIdx.length ? holeIdx : null, 2);
      // per-face vertex copies: local index per global vertex, plus midpoints
      const local = new Map();
      const L = (g) => { let l = local.get(g); if (l == null) { l = sink.vertex(pos[3 * g], pos[3 * g + 1], pos[3 * g + 2], faceId); local.set(g, l); } return l; };
      /* SUBDIVISION WITHOUT CRACKS (Phase 2b). The 2a rule bisected each triangle's LONGEST edge, so the two triangles on a shared
         edge split it only when it was the longest of each — an edge long for one and not for the other was split on one side
         alone and left a flat chord against a great-circle polyline, a crack as wide as the chord's sagitta: along earcut's
         hole bridges (a hole is joined to the outer ring by a bridge edge both sides of the triangulation share; the Baikal
         hole's bridge in the Mongol Empire of 1245 ran 4,000 km west to the Volga steppe) it drew as a hairline of plain land
         through the fill. Now EVERY edge longer than the level's chord is split, into pieces that depend on that edge alone —
         its own length, the points along its great circle cached by its two ends — so each side of a shared edge is a
         polyline of pieces under the chord and the gap between the two sides is at most a piece's sagitta, under a quarter
         pixel by the chord's definition. Inside the triangle: spokes from its first vertex to every point of the opposite
         edge, each spoke split the same way (shared by the two strips beside it), and the strip between two neighbouring
         spokes cut into triangles by walking both. No recursion, no earcut, no overlap. */
      const d2 = (la, lb) => { const A = sink.get(la), B = sink.get(lb); const dx = A[0] - B[0], dy = A[1] - B[1], dz = A[2] - B[2]; return dx * dx + dy * dy + dz * dz; };
      const edgePts = new Map();   // "lo:hi:n" → the n−1 inner points from lo to hi, on the great circle
      const along = (la, lb, n) => {
        if (n <= 1) return [];
        const lo = Math.min(la, lb), hi = Math.max(la, lb), key = lo + ":" + hi + ":" + n;
        let arr = edgePts.get(key);
        if (!arr) { arr = []; const A = sink.get(lo), B = sink.get(hi); for (let k = 1; k < n; k++) { const t = k / n; const x = A[0] * (1 - t) + B[0] * t, y = A[1] * (1 - t) + B[1] * t, z = A[2] * (1 - t) + B[2] * t; const l = Math.hypot(x, y, z) || 1; arr.push(sink.vertex(x / l, y / l, z / l, faceId)); } edgePts.set(key, arr); }
        return la === lo ? arr : arr.slice().reverse();
      };
      const pieces = (la, lb) => Math.max(1, Math.ceil(Math.sqrt(d2(la, lb)) / chord));
      const put = (x, y, z) => { if (x === y || y === z || z === x) return; sink.tri(x, y, z); triangles++; };
      const emit = (a, b, c) => {
        const na = pieces(a, b), nb = pieces(b, c), nc = pieces(c, a);
        if (na <= 1 && nb <= 1 && nc <= 1) { put(a, b, c); return; }
        const far = [b].concat(along(b, c, nb), [c]);   // the opposite edge's points, b to c
        let prev = null;
        for (let k = 0; k < far.length; k++) {
          const spoke = [a].concat(along(a, far[k], pieces(a, far[k])), [far[k]]);   // a → far[k]; the first is a→b, the last a→c, both the boundary's own points
          if (prev) {
            const P = prev, Q = spoke; let i = 1, j = 1;
            put(P[0], P[1], Q[1]);   // both spokes leave a: the first triangle takes a step along each, never a zero-area sliver along one
            while (i < P.length - 1 || j < Q.length - 1) {
              const tP = (i + 1) / (P.length - 1), tQ = (j + 1) / (Q.length - 1);
              if (j >= Q.length - 1 || (i < P.length - 1 && tP <= tQ)) { put(P[i], P[i + 1], Q[j]); i++; }
              else { put(P[i], Q[j + 1], Q[j]); j++; }
            }
          }
          prev = spoke;
        }
      };
      for (let t = 0; t < tri.length; t += 3) emit(L(gidx[tri[t]]), L(gidx[tri[t + 1]]), L(gidx[tri[t + 2]]));
    }
    return triangles;
  }

  /* ================= Phase 2c: the PRESENCE mesh (a people's or a culture's soft face; design §2.5) =================
     A state's face is one fill with a border line. A presence has no border line and its fill FADES at its edge, so its mesh is
     drawn with a per-vertex alpha (the sink's fourth float, which a state's mesh uses for the face id): the face's ring at
     alpha 0, the same ring moved INWARD by a fade width at alpha 1, a strip between them, and the interior (the inset ring) at
     alpha 1. Where the edge is the COAST (a core reference) nothing fades — the coast is a real edge, and the renderer masks the
     fill by the land anyway — so a vertex moves inward by the fraction of its two edges that are SOFT arcs. The width is a share
     of the face's own size (6 %, between 12 and 300 km): a small people is a small smudge and the Huns a wide one. The inset ring
     is verified (no edge of it crosses another or the boundary; the width is halved up to twice and then dropped), so the fill
     never folds. Unlike a state's mesh it asks nothing of the stencil but the land. */
  const SOFT_KIND = 4, FADE_FRAC = 0.06, FADE_MIN_KM = 12, FADE_MAX_KM = 300, EARTH_KM = 6371;
  function presenceRings(T, face, level) {
    const out = [];
    for (const refs of face.rings) {
      const ring = [], soft = [];   // soft[i]: the edge that ENTERS vertex i lies on a SOFT arc
      let skip = false;
      for (let r = 0; r < refs.length; r++) {
        const ref = refs[r], a = Math.abs(ref) - 1;
        if (T.arcMinLod[a] > level) { skip = true; break; }
        const isSoft = T.arcKind[a] === SOFT_KIND ? 1 : 0, s0 = T.arcOffset[a], e0 = T.arcOffset[a + 1];
        if (ref > 0) { for (let i = s0; i < e0; i++) if (T.rank[i] <= level) { if (ring.length && i === s0) continue; ring.push(i); soft.push(isSoft); } }
        else { for (let i = e0 - 1; i >= s0; i--) if (T.rank[i] <= level) { if (ring.length && i === e0 - 1) continue; ring.push(i); soft.push(isSoft); } }
      }
      if (skip) continue;
      if (ring.length > 1) { const f = ring[0], l = ring[ring.length - 1]; if (f === l || (T.lon[f] === T.lon[l] && T.lat[f] === T.lat[l])) { ring.pop(); soft[0] = soft.pop(); } }   // the closing edge enters vertex 0 on the LAST arc
      if (ring.length >= 3) out.push({ ring, soft });
    }
    return out;
  }
  /* a uniform grid of segments, for the clearance and the verification of the inset rings (near-linear instead of N²) */
  function segGrid(cell) {
    const g = new Map(); const segs = [];
    const key = (x, y) => x + "," + y;
    return {
      segs,
      add(ax, ay, bx, by, tag) {
        const id = segs.length; segs.push([ax, ay, bx, by, tag]);
        const x0 = Math.floor(Math.min(ax, bx) / cell), x1 = Math.floor(Math.max(ax, bx) / cell), y0 = Math.floor(Math.min(ay, by) / cell), y1 = Math.floor(Math.max(ay, by) / cell);
        for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) { const k = key(x, y); let l = g.get(k); if (!l) g.set(k, l = []); l.push(id); }
        return id;
      },
      near(px, py, r, fn) { const x0 = Math.floor((px - r) / cell), x1 = Math.floor((px + r) / cell), y0 = Math.floor((py - r) / cell), y1 = Math.floor((py + r) / cell); const seen = new Set(); for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) { const l = g.get(key(x, y)); if (!l) continue; for (const id of l) { if (seen.has(id)) continue; seen.add(id); fn(id, segs[id]); } } },
      cellOf(id) { return segs[id]; },
    };
  }
  const distPtSeg = (px, py, ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy; let t = l2 > 0 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0; t = t < 0 ? 0 : t > 1 ? 1 : t; const qx = ax + dx * t - px, qy = ay + dy * t - py; return Math.sqrt(qx * qx + qy * qy); };
  const segCross = (a, b, c, d) => { const o = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]); const d1 = o(a, b, c), d2 = o(a, b, d), d3 = o(c, d, a), d4 = o(c, d, b); return ((d1 > 0) !== (d2 > 0)) && ((d3 > 0) !== (d4 > 0)) && d1 !== 0 && d2 !== 0 && d3 !== 0 && d4 !== 0; };

  /* the inset of one polygon (outer ring + holes) in its planar frame: { inner: [[x, y]…] per ring, d: [Float64Array] per ring }, or null when
     no width keeps the inset simple. Pure: the Node test (.claude/test-peoples.js) runs it on the committed history file. */
  function presenceInset(rings, D0) {
    const n = rings.map((r) => r.p.length);
    const weight = rings.map((r) => { const m = r.p.length, w = new Float64Array(m); for (let i = 0; i < m; i++) w[i] = (r.soft[i] + r.soft[(i + 1) % m]) / 2; return w; });
    if (!weight.some((w) => w.some((x) => x > 0))) return null;   // all coast: nothing fades
    const cell = Math.max(D0 * 3, 1e-9);
    // the clearance of every vertex: the distance to the nearest edge not touching it, limited to the width asked for
    const grid = segGrid(cell);
    rings.forEach((r, ri) => { const m = r.p.length; for (let i = 0; i < m; i++) { const a = r.p[i], b = r.p[(i + 1) % m]; grid.add(a[0], a[1], b[0], b[1], ri * 1e7 + i); } });
    const clear = rings.map((r, ri) => { const m = r.p.length, c = new Float64Array(m).fill(Infinity); for (let i = 0; i < m; i++) { if (!weight[ri][i]) continue; const P = r.p[i]; grid.near(P[0], P[1], D0 * 3, (id, sg) => { const tr = Math.floor(sg[4] / 1e7), te = sg[4] % 1e7; if (tr === ri && (te === i || te === (i - 1 + m) % m)) return; const d = distPtSeg(P[0], P[1], sg[0], sg[1], sg[2], sg[3]); if (d < c[i]) c[i] = d; }); } return c; });
    for (const scale of [1, 0.5, 0.25]) {
      const d = rings.map((r, ri) => { const m = r.p.length, o = new Float64Array(m); for (let i = 0; i < m; i++) o[i] = Math.min(D0 * scale * weight[ri][i], 0.4 * clear[ri][i]); return o; });
      const inner = rings.map((r, ri) => {
        const m = r.p.length, out = new Array(m);
        for (let i = 0; i < m; i++) {
          const p0 = r.p[(i - 1 + m) % m], p1 = r.p[i], p2 = r.p[(i + 1) % m];
          let e1x = p1[0] - p0[0], e1y = p1[1] - p0[1], e2x = p2[0] - p1[0], e2y = p2[1] - p1[1];
          const l1 = Math.hypot(e1x, e1y) || 1, l2 = Math.hypot(e2x, e2y) || 1; e1x /= l1; e1y /= l1; e2x /= l2; e2y /= l2;
          const n1x = -e1y, n1y = e1x, n2x = -e2y, n2y = e2x, dot = n1x * n2x + n1y * n2y;
          let vx = n1x + n2x, vy = n1y + n2y, k = 1 / Math.max(1e-6, 1 + dot);
          if (Math.hypot(vx, vy) * k > 3) { const l = Math.hypot(vx, vy) || 1; vx = vx / l; vy = vy / l; k = 1; } else { vx *= k; vy *= k; }
          out[i] = [p1[0] + vx * d[ri][i], p1[1] + vy * d[ri][i]];
        }
        return out;
      });
      // simple? no inset edge crosses another inset edge or a boundary edge (adjacent edges excepted)
      const chk = segGrid(cell); const bound = [];
      rings.forEach((r, ri) => { const m = r.p.length; for (let i = 0; i < m; i++) { const a = r.p[i], b = r.p[(i + 1) % m]; chk.add(a[0], a[1], b[0], b[1], "b" + ri + ":" + i); } });
      inner.forEach((q, ri) => { const m = q.length; for (let i = 0; i < m; i++) { const a = q[i], b = q[(i + 1) % m]; chk.add(a[0], a[1], b[0], b[1], "i" + ri + ":" + i); } });
      void bound;
      let bad = false;
      for (let id = 0; id < chk.segs.length && !bad; id++) {
        const sg = chk.segs[id]; if (sg[4][0] !== "i") continue;
        const [ri, ei] = sg[4].slice(1).split(":").map(Number), m = inner[ri].length;
        chk.near((sg[0] + sg[2]) / 2, (sg[1] + sg[3]) / 2, Math.hypot(sg[2] - sg[0], sg[3] - sg[1]) / 2 + 1e-12, (oid, o) => {
          if (bad || oid === id) return;
          const t = o[4], tr = Number(t.slice(1).split(":")[0]), te = Number(t.slice(1).split(":")[1]);
          if (t[0] === "i" && tr === ri && (te === (ei + 1) % m || te === (ei - 1 + m) % m)) return;
          if (t[0] === "b" && tr === ri && (te === ei || te === (ei - 1 + m) % m)) return;   // its own boundary edges
          if (segCross([sg[0], sg[1]], [sg[2], sg[3]], [o[0], o[1]], [o[2], o[3]])) bad = true;
        });
      }
      if (!bad) return { inner, d, scale };
    }
    return null;
  }
  async function presenceMesh(T, pos, face, level, sink, hard) {   // `hard` (2d, a front): no fade — a front is a line the plate drew, not an uncertain edge
    const rs = presenceRings(T, face, level);
    if (!rs.length) return 0;
    const proj = makeFrame(pos, rs.map((r) => r.ring)).fwd;
    const polys = rs.map((r) => { const p = r.ring.map(proj); let A = 0; for (let i = 0, j = p.length - 1; i < p.length; j = i++) A += (p[j][0] * p[i][1] - p[i][0] * p[j][1]); return { ring: r.ring, soft: r.soft, p, area: A / 2, holes: [] }; });
    const outers = polys.filter((q) => q.area > 0).sort((a, b) => a.area - b.area);
    const inside = (pt, poly) => { let c = false; const p = poly.p; for (let i = 0, j = p.length - 1; i < p.length; j = i++) if ((p[i][1] > pt[1]) !== (p[j][1] > pt[1]) && pt[0] < (p[j][0] - p[i][0]) * (pt[1] - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0]) c = !c; return c; };
    for (const h of polys) { if (h.area > 0) continue; const o = outers.find((o) => inside(h.p[0], o)); if (o) o.holes.push(h); }
    const chord = 2 * Math.sin(CHORD_DEG[Math.min(level, CHORD_DEG.length - 1)] * D2R / 2), chord2 = chord * chord;
    let triangles = 0, no = 0;
    for (const o of outers) {
      if ((++no & 7) === 0) await tick();
      const group = [o].concat(o.holes);
      const F = makeFrame(pos, group.map((g) => g.ring));
      const rings = group.map((g) => ({ g, p: g.ring.map(F.fwd), soft: g.soft }));
      let A = 0; { const p = rings[0].p; for (let i = 0, j = p.length - 1; i < p.length; j = i++) A += (p[j][0] * p[i][1] - p[i][0] * p[j][1]); A = Math.abs(A / 2); }
      const D0 = F.gnomonic && !hard ? Math.min(FADE_MAX_KM, Math.max(FADE_MIN_KM, FADE_FRAC * Math.sqrt(A) * EARTH_KM)) / EARTH_KM : 0;
      const ins = D0 > 0 ? presenceInset(rings, D0) : null;
      // vertices: the boundary (alpha 0 where it fades, else 1) and the inset ring (alpha 1)
      const outerId = [], innerId = [];
      rings.forEach((r, ri) => {
        outerId[ri] = []; innerId[ri] = [];
        r.g.ring.forEach((gi, i) => {
          const faded = ins && ins.d[ri][i] > 0;
          const oid = sink.vertex(pos[3 * gi], pos[3 * gi + 1], pos[3 * gi + 2], faded ? 0 : 1);
          outerId[ri][i] = oid;
          if (faded) { const q = ins.inner[ri][i], u = F.inv(q[0], q[1]); innerId[ri][i] = sink.vertex(u[0], u[1], u[2], 1); } else innerId[ri][i] = oid;
        });
      });
      // the subdivision of a triangle into pieces under the level's chord, the alpha interpolated along each great circle (no cracks: every
      // piece of an edge depends on that edge alone, as in triangulateFace)
      const edgePts = new Map();
      const d2 = (la, lb) => { const A1 = sink.get(la), B1 = sink.get(lb); const dx = A1[0] - B1[0], dy = A1[1] - B1[1], dz = A1[2] - B1[2]; return dx * dx + dy * dy + dz * dz; };
      const along = (la, lb, n) => {
        if (n <= 1) return [];
        const lo = Math.min(la, lb), hi = Math.max(la, lb), key = lo + ":" + hi + ":" + n;
        let arr = edgePts.get(key);
        if (!arr) { arr = []; const P = sink.get(lo), Q2 = sink.get(hi); for (let k = 1; k < n; k++) { const t = k / n; const x = P[0] * (1 - t) + Q2[0] * t, y = P[1] * (1 - t) + Q2[1] * t, z = P[2] * (1 - t) + Q2[2] * t; const l = Math.hypot(x, y, z) || 1; arr.push(sink.vertex(x / l, y / l, z / l, P[3] * (1 - t) + Q2[3] * t)); } edgePts.set(key, arr); }
        return la === lo ? arr : arr.slice().reverse();
      };
      const pieces = (la, lb) => Math.max(1, Math.ceil(Math.sqrt(d2(la, lb)) / chord));
      const put = (x, y, z) => { if (x === y || y === z || z === x) return; sink.tri(x, y, z); triangles++; };
      const emit = (a, b, c) => {
        const na = pieces(a, b), nb = pieces(b, c), nc = pieces(c, a);
        if (na <= 1 && nb <= 1 && nc <= 1) { put(a, b, c); return; }
        const far = [b].concat(along(b, c, nb), [c]);
        let prev = null;
        for (let k = 0; k < far.length; k++) {
          const spoke = [a].concat(along(a, far[k], pieces(a, far[k])), [far[k]]);
          if (prev) {
            const P = prev, Q2 = spoke; let i = 1, j = 1;
            put(P[0], P[1], Q2[1]);
            while (i < P.length - 1 || j < Q2.length - 1) {
              const tP = (i + 1) / (P.length - 1), tQ = (j + 1) / (Q2.length - 1);
              if (j >= Q2.length - 1 || (i < P.length - 1 && tP <= tQ)) { put(P[i], P[i + 1], Q2[j]); i++; }
              else { put(P[i], Q2[j + 1], Q2[j]); j++; }
            }
          }
          prev = spoke;
        }
      };
      // the interior: earcut on the inset rings (or on the boundary itself when nothing fades)
      const flat = [], holeIdx = [], gid = [];
      rings.forEach((r, ri) => { if (ri > 0) holeIdx.push(gid.length); const pts = ins ? ins.inner[ri] : r.p; pts.forEach((q, i) => { flat.push(q[0], q[1]); gid.push(innerId[ri][i]); }); });
      const tri = root.earcut(flat, holeIdx.length ? holeIdx : null, 2);
      for (let t = 0; t < tri.length; t += 3) emit(gid[tri[t]], gid[tri[t + 1]], gid[tri[t + 2]]);
      // the fade strip: one quad per boundary edge that has a faded end
      if (ins) rings.forEach((r, ri) => { const m = r.p.length; for (let i = 0; i < m; i++) { const j = (i + 1) % m; if (innerId[ri][i] === outerId[ri][i] && innerId[ri][j] === outerId[ri][j]) continue; emit(outerId[ri][i], outerId[ri][j], innerId[ri][j]); emit(outerId[ri][i], innerId[ri][j], innerId[ri][i]); } });
    }
    return triangles;
  }
  presenceMesh.inset = presenceInset;

  // a growable vertex + index sink for one level
  function Sink() {
    let pos = new Float32Array(1 << 18), n = 0, idx = new Uint32Array(1 << 18), m = 0;
    return {
      vertex(x, y, z, f) { if ((n + 1) * 4 > pos.length) { const p = new Float32Array(pos.length * 2); p.set(pos); pos = p; } pos[4 * n] = x; pos[4 * n + 1] = y; pos[4 * n + 2] = z; pos[4 * n + 3] = f; return n++; },
      get(i) { return [pos[4 * i], pos[4 * i + 1], pos[4 * i + 2], pos[4 * i + 3]]; },
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

  /* THE DRAW ORDER OF OVERLAPPING FACES (Phase 4b, the selected-state holes). The core holds a country's face AND its admin-1 children's (the United States, China and Russia: 173 of the 430 faces), overlapping, and the
     renderer has no depth buffer: the later triangle wins. A selected state's colour is on ITS face, so wherever a bucket holding a country triangle was drawn after the state's own, the country's land colour
     covered it — holes in Colorado, Texas. The buckets are spatial and a coarse triangle is filed under its centroid, so no order WITHIN a bucket can fix that; the fix is a list order: the children's
     triangles are a second bucketed list after the parents', drawn after every parent triangle (the segments' own two-list layout for admin-1 arcs). The triangles are the same ones, so the primitive budgets do
     not move; the renderer draws `faceRange` then `faceRangeA1`, and the 2D canvas fallback, which paints the index list in order, gets the same order for free. `CHILD_FACE[core face id]` is 1 for an admin-1 face. */
  let CHILD_FACE = null;
  function childFaces() {
    if (CHILD_FACE || !CORE) return CHILD_FACE;
    const T = CORE.T, ents = T.header.entities, c = new Uint8Array(T.faces.length); let any = 0;
    for (let f = 0; f < T.faces.length; f++) if (ents[T.faces[f].entity] && ents[T.faces[f].entity].kind === "admin1") { c[f] = 1; any++; }
    return (CHILD_FACE = any ? c : null);
  }
  async function bucketFaces(pos, idx, bucketer) {
    const child = childFaces();
    if (!child) return bucketTriangles(pos, idx, bucketer);
    const n = idx.length / 3; let nc = 0;
    for (let t = 0; t < n; t++) { if (child[pos[4 * idx[3 * t] + 3]]) nc++; if ((t & 0x3ffff) === 0x3ffff) await tick(); }
    if (!nc) return bucketTriangles(pos, idx, bucketer);
    const main = new Uint32Array((n - nc) * 3), kid = new Uint32Array(nc * 3); let m = 0, k = 0;
    for (let t = 0; t < n; t++) { const a = idx[3 * t], b = idx[3 * t + 1], c = idx[3 * t + 2]; if (child[pos[4 * a + 3]]) { kid[k++] = a; kid[k++] = b; kid[k++] = c; } else { main[m++] = a; main[m++] = b; main[m++] = c; } if ((t & 0x3ffff) === 0x3ffff) await tick(); }
    const M = n === nc ? null : await bucketTriangles(pos, main, bucketer), K = await bucketTriangles(pos, kid, bucketer);
    if (!M) return K;
    const faceIdx = new Uint32Array(idx.length); faceIdx.set(M.faceIdx); faceIdx.set(K.faceIdx, M.faceIdx.length);
    const off = M.faceIdx.length; for (let b = 0; b < K.faceRange.length; b += 2) K.faceRange[b] += off;
    return { faceIdx, faceRange: M.faceRange, faceCap: M.faceCap, faceRangeA1: K.faceRange, faceCapA1: K.faceCap };
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
    if (msg.type === "study-rows") { setStudyRows(msg.rows, msg.names); post({ type: "study-rows", n: STUDY ? STUDY.rows.size : 0, cities: STUDY && STUDY.cityHow ? STUDY.cityHow : null }); return null; }
    if (msg.type === "study-flags") { setStudyFlags(msg); return null; }
    if (msg.type === "polity-names") { POLITY_NAMES = msg.names || null; return null; }   // Phase 4 / 0c: dated display names
    if (msg.type === "metrics") { METRICS = msg.styles; return null; }
    if (msg.type === "layout") { handleLayout(msg, post); return null; }
    if (msg.type === "face-anchors") { handleFaceAnchors(msg, post); return null; }
    if (msg.type === "face-rings") { handleFaceRings(msg, post); return null; }
    /* a lost GL context (Phase 1c): the main thread keeps nothing after upload, so the resident levels are
       rebuilt here from the raw files this worker kept — the same code path as the first load */
    if (msg.type === "rebuild") { return (async () => { if (RAW.topology) await handleLoad({ type: "load", buffer: RAW.topology, rebuild: true }, post); if (RAW.water) await handleWater({ type: "water", buffer: RAW.water }, post); if (RAW.history) { HIST = null; await handleHistory({ type: "history", buffer: RAW.history }, post); } })(); }
    if (msg.type === "load") return guard(handleLoad(msg, post), "topology: ");
    return null;
  }
  async function handleLoad(msg, post) {
    LOADING = true;
    try { await loadLevels(msg, post); }
    finally { LOADING = false; while (HELD.length) { const m = HELD.shift(); try { handle(m, post); } catch (err) { post({ type: "error", message: String(err && err.stack || err) }); } } }
  }
  async function loadLevels(msg, post) {
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
      for (let i = 0; i < nF; i++) { tris += await triangulateFace(T, pos, T.faces[i], i, level, sink); if ((i & 7) === 7) await (tick(level === 0 ? "Shaping the land…" : "Adding detail…", 0.35 + 0.5 * (level + 0.6 * i / nF) / T.lodCount) || (level > 0 && (i & 15) === 15 ? yieldNow() : null)); }
      const F = sink.result();
      const S = await bucketSegments(raw), B = await bucketFaces(F.pos, F.idx);
      const s = { level, segments: raw.length / 7, faceVertices: F.vertices, triangles: F.triangles, ms: Math.round(now() - t1) };
      stats.levels.push(s);
      post({ type: "lod", level, segs: S.segs, segRange: S.segRange, segCap: S.segCap, segRangeA1: S.segRangeA1, segCapA1: S.segCapA1, facePos: F.pos, faceIdx: B.faceIdx, faceRange: B.faceRange, faceCap: B.faceCap, faceRangeA1: B.faceRangeA1 || null, faceCapA1: B.faceCapA1 || null, buckets: BUCKETS, stats: s },
        [S.segs.buffer, S.segRange.buffer, S.segCap.buffer, S.segRangeA1.buffer, S.segCapA1.buffer, F.pos.buffer, B.faceIdx.buffer, B.faceRange.buffer, B.faceCap.buffer].concat(B.faceRangeA1 ? [B.faceRangeA1.buffer, B.faceCapA1.buffer] : []));
      await yieldNow();   // a history message that came in during this level runs before the next
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
  /* Phase 4 / 0c: display names that change with the year (atlas/data/polity-names.js, sent by the page): entity id → [[from, to, name, qid]…] */
  let POLITY_NAMES = null;
  const nameIn = (id, y, base) => { const l = POLITY_NAMES && POLITY_NAMES[id]; if (l && y != null) for (const o of l) if (y >= o[0] && y <= o[1]) return o[2]; return base; };
  const D2R_ = Math.PI / 180;
  const KW = { capital: 0, country: 1, people: 4.5, ocean: 2, sea: 3, admin1: 4, region: 5, range: 5, "island-group": 6, island: 6, gulf: 6, strait: 6, city: 7, lake: 8, town: 9, river: 10 };
  const PHYSICAL = { sea: 1, ocean: 1, gulf: 1, strait: 1, lake: 1, river: 1, island: 1, "island-group": 1, range: 1, region: 1 };
  const MIN_CHORD_PX = 40;            // an area is labelled once it is this wide on screen (§2.6)
  const LIMB_Z = 0.1;                 // a name whose anchor is nearer the limb than this (view-space z; the fade reaches 1 at 0.2) is not a candidate
  const RIVER_REPEAT_PX = 400;
  const MARKER_R = { capital: 4, city: 3, town: 2.2 };
  const CAPITAL_AFTER_RANK = 1;       // a period capital is placed after the polities of on-screen area rank 0..this (task 0a, Phase 3a)
  const POLITY_WIDE = 1.8, POLITY_WIDE_LARGE = 3.0;   // a polity name may be this much wider than its label path and still sit straight at the anchor (the larger figure for the rank 0..CAPITAL_AFTER_RANK polities, whose name at globe scale is the one thing the view is for)
  const POLITY_SLIDE = [0].concat(...Array.from({ length: 15 }, (_, i) => [-(i + 1) * 0.03, (i + 1) * 0.03]));   // the fractions of the path's length a polity name slides from the middle when the middle is taken: 0, ±3 % … ±45 % (seven steps of 12 % until decision a of 2026-10-17 — with every mark and every study name hard ground, an empire's name must find a clear stretch of its path, and "Achaemenid Empire" at the Aegean in 483 BCE found none in seven)
  const POLITY_SIDE = [0, -0.25, 0.25, -0.45, 0.45];                                // the fractions of its own width a straight polity name moves sideways from its anchor when the anchor's place is taken (3b)
  const POLITY_NUDGE = [0, -1.2, 1.2, -2.4, 2.4, -3.6, 3.6];                    // the lines a straight polity name moves up or down from its anchor when the anchor is taken
  function unitOf(lon, lat) { const la = lat * D2R_, lo = lon * D2R_, c = Math.cos(la); return [c * Math.cos(lo), c * Math.sin(lo), Math.sin(la)]; }
  /* PHASE 3b — THE STUDY LAYER'S STATE. `rows`: the places the worker does not already have geometry for — every study place that is
     drawn as a MARK (a capital, city, town, site, mountain, hill, cape: a point) and every place of places.js that is an area or a water
     (a region, an island, a range …: a name at a point, no dot) — id → { id, name, kind, sub, a (unit vector), n (cards), pd
     (a present-day settlement: not alive in a past year) }. `flags`: id → 1 (a place of the Full Atlas) | 2 (the reader's own);
     absent = not drawn. A gazetteer AREA (a country, a province, a sea, a river …) and a polity are flagged only: the ordinary pass
     draws them in their own shape and the flag lifts them past the density rules, raises their score and tints them. */
  let STUDY = null;
  const STUDY_POINT = { capital: 1, city: 1, town: 1, site: 1, mountain: 1, hill: 1, cape: 1 };
  const SETTLE = { capital: 1, city: 1, town: 1 };
  /* the nudge of decision c (see the study pass): `list` is the layout's marks with their on-screen positions and half-extents; a stack (`members`) that
     overlaps another mark's box moves along the line between the two centres by the overlap (both move, half each, when both are stacks), never more than
     STACK_NUDGE_PX in all, and records the offset as `ox`, `oy`; a single mark never moves. Four passes settle a cluster. */
  const STACK_NUDGE_PX = 20, STACK_GAP_PX = 2;
  function nudgeStacks(list, W, H, hitsChrome) {
    const ms = list.filter((m) => m.cls), st = ms.filter((m) => m.members);
    if (!st.length) return;
    for (const m of st) { m.ox = 0; m.oy = 0; m.x0 = m.x; m.y0 = m.y; }
    /* each pass sums, per ring, the pushes of every overlap it is in (two rings share theirs; a single mark pushes the ring alone — the ring over a
       ring weighs double, so two rings one dot pushes the same way still part along their own line), then moves the ring by the sum, clamped to
       STACK_NUDGE_PX from its true point. Eight passes settle Rome's cluster; a ring that has used its room stays where it is. */
    for (let pass = 0; pass < 8; pass++) {
      let moved = false;
      for (const s of st) { s.px = 0; s.py = 0; }
      for (let i = 0; i < st.length; i++) {
        const s = st[i];
        for (const m of ms) {
          if (m === s || (m.members && ms.indexOf(m) < ms.indexOf(s))) continue;   // a ring pair once
          const sep = s.h + m.h + STACK_GAP_PX; let dx = s.x - m.x, dy = s.y - m.y, d = Math.hypot(dx, dy);
          if (d >= sep) continue;
          if (d < 1e-6) { dx = 1; dy = 0; d = 1; }
          const over = sep - d, ux = dx / d, uy = dy / d;
          if (m.members) { s.px += ux * over; s.py += uy * over; m.px -= ux * over; m.py -= uy * over; }   // a ring pair: each pushed by the whole overlap (weighs double a dot's push)
          else { s.px += ux * over * 0.5; s.py += uy * over * 0.5; }
        }
      }
      for (const s of st) {
        if (Math.abs(s.px) < 0.01 && Math.abs(s.py) < 0.01) continue;
        let nx = s.ox + s.px, ny = s.oy + s.py; const dn = Math.hypot(nx, ny);
        if (dn > STACK_NUDGE_PX) { nx *= STACK_NUDGE_PX / dn; ny *= STACK_NUDGE_PX / dn; }
        // a ring whose true point is on screen stays on screen: the nudge never pushes it past the frame's edge (test-atlas-study's property: a flagged place in the clear has its mark, or its city's ring, drawn)
        if (W && H) { const r = s.h + 2, x1 = Math.max(r, Math.min(W - r, s.x0 + nx)), y1 = Math.max(r, Math.min(H - r, s.y0 + ny)); if (s.x0 >= r && s.x0 <= W - r) nx = x1 - s.x0; if (s.y0 >= r && s.y0 <= H - r) ny = y1 - s.y0; }
        // nor under a control (the page hides a mark under the chrome): a nudge that would land there is shortened until it clears, or dropped
        if (hitsChrome) { const r = s.h + 2, box = (x, y) => [x - r, y - r, x + r, y + r]; if (!hitsChrome(box(s.x0, s.y0))) for (const f of [1, 0.75, 0.5, 0.25, 0]) { if (!hitsChrome(box(s.x0 + nx * f, s.y0 + ny * f))) { nx *= f; ny *= f; break; } } }
        if (Math.abs(nx - s.ox) > 0.01 || Math.abs(ny - s.oy) > 0.01) moved = true;
        s.ox = nx; s.oy = ny; s.x = s.x0 + nx; s.y = s.y0 + ny;
      }
      if (!moved) break;
    }
    for (const s of st) { delete s.px; delete s.py; delete s.x0; delete s.y0; }
  }
  function setStudyRows(rows, names) {
    const m = new Map(), points = new Set();
    for (const r of rows || []) { if (!r || !r.id || !isFinite(r.lon) || !isFinite(r.lat)) continue; m.set(r.id, { id: r.id, name: r.name || "", aliases: Array.isArray(r.aliases) ? r.aliases : [], kind: r.kind, sub: r.sub || "", cap: !!r.cap, a: unitOf(r.lon, r.lat), n: r.n || 0, pd: !!r.pd, within: r.within || "", pk: r.pk || "" }); if (STUDY_POINT[r.kind]) points.add(r.id); }
    /* CITY MEMBERSHIP (2026-10-17, decision d): which city each study place belongs to — the registry's parent, else the nearest settlement of the
       whole registry (the gazetteer's capitals, cities and towns and the study rows' own) within 3 km (AtlasStudy.cityMembership). Computed once,
       here, off the main thread; `cityName` is what a stack is called. */
    const AS = root.AtlasStudy, cities = [], cityName = new Map();
    if (GZ) for (const g of GZ.rows) if (SETTLE[g.kind] && g.a) { cities.push({ id: g.id, kind: g.kind, a: g.a }); cityName.set(g.id, g.name); }
    for (const r of m.values()) { if (SETTLE[r.kind]) cities.push({ id: r.id, kind: r.kind, a: r.a }); cityName.set(r.id, r.name); }
    for (const id of Object.keys(names || {})) if (!cityName.has(id)) cityName.set(id, names[id]);
    const cm = AS ? AS.cityMembership([...m.values()], cities, { km: 3 }) : { of: new Map(), how: null };
    STUDY = Object.assign(STUDY || { flags: new Map(), mode: "", rev: 0 }, { rows: m, points, city: cm.of, cityHow: cm.how, cityName });
  }
  function setStudyFlags(msg) {
    const f = new Map(); for (const [id, v] of msg.entries || []) if (v) f.set(id, v);
    STUDY = Object.assign(STUDY || { rows: new Map(), points: new Set() }, { flags: f, mode: msg.mode || "", rev: msg.rev || 0 });
  }
  function loadGazetteer(table) {
    const col = {}; table.cols.forEach((c, i) => { col[c] = i; });
    const rows = table.rows.map((r, i) => {
      const g = (c) => (r[col[c]] == null ? 0 : r[col[c]]);
      const at = g("at"), path = g("path"), geom = g("geom"), alt = g("alt");
      const river = typeof geom === "string" && geom[0] === "r" ? Number(geom.slice(1)) : -1;
      // a merged river (Phase 1d: one row per Wikidata item) names every stretch it is made of: `rivers` is all of them
      return { i, id: g("id"), name: g("name"), kind: g("kind"), rank: g("rank"), within: g("within"), len: g("len"), z: g("z"), a: at ? unitOf(at[0], at[1]) : null, p: path && path.length > 1 ? path.map((q) => unitOf(q[0], q[1])) : null, river, rivers: river >= 0 ? [river].concat(Array.isArray(alt) ? alt : []) : null };
    });
    GZ = { rows, byId: new Map(rows.map((r) => [r.id, r])) };
  }
  // the style a row is drawn in, by kind and by how much room it has (CSS px of chord)
  function styleFor(row, chordPx) {
    switch (row.kind) {
      case "polity": case "country": return chordPx >= 700 ? "country-l" : chordPx >= 260 ? "country-m" : "country-s";
      case "people": case "culture": case "extent": return chordPx >= 600 ? "people-l" : chordPx >= 240 ? "people-m" : "people-s";   // 2c: spaced italic, the territory's small capitals' opposite
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
    const atCap = q.kmppFloor > 0 && kmpp <= q.kmppFloor * 1.02;   // the zoom cap, the closest view the page allows (atlas.js kmFloor): a mark's name may stand above or below it there (decision c, 2026-10-18)
    const zl = Math.log2(156.543 / kmpp);                                   // the web-mercator zoom at the equator Natural Earth's hints are in
    const shift = (q.density === "sparse" ? -1 : q.density === "dense" ? 1.5 : 0) + (q.phone ? -0.75 : 0);
    const t = Math.max(0, Math.min(1, (Math.log(24) - Math.log(kmpp)) / Math.log(24)));
    const cap = Math.round((40 + 80 * t) * (q.density === "sparse" ? 0.6 : q.density === "dense" ? 1.5 : 1) * (q.phone ? 0.6 : 1));
    const FS = q.fs > 0 ? q.fs : 1;   // the reader's Text size as a factor of the names (atlas.js labelScaleNow): the METRICS already carry it in sizes, tracking and advances; these are the literals that must grow with the names
    const pad = (q.density === "sparse" ? 8 : q.density === "dense" ? 2 : 4) * FS;
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
    const study = STUDY && STUDY.mode && STUDY.flags.size ? STUDY : null;   // the study layer is on (3b)
    const histRows = [];
    if (HIST && q.aliveFaces && q.aliveFaces.length) {
      for (const fi of q.aliveFaces) {
        let e = HIST.H.entities[HIST.T.faces[fi].entity]; if (!e) continue;
        if (e.kind === "nested") { e = HIST.H.entities.find((x) => x.id === e.partners[0]); if (!e) continue; }   // a member inside its overlord is named as itself (2b)
        else if (e.kind !== "polity" && e.kind !== "people" && e.kind !== "culture" && e.kind !== "extent") continue;
        const path = histLabelPath(fi, proj, W, H, q); if (!path) continue;
        const km2 = HIST.H.faceKm2 ? HIST.H.faceKm2[fi] : 0;
        // the rank by the area ON SCREEN (2b): the face's area times the share of its vertices on screen, in screen pixels — a view
        // with many alive faces names the ones a reader sees most of first, and the order holds as the view moves
        const px2 = km2 * (path.visFrac || 0) / Math.max(1e-6, kmpp * kmpp);
        histRows.push({ id: e.id, name: nameIn(e.id, q.year, e.name), kind: e.kind === "people" || e.kind === "culture" || e.kind === "extent" ? e.kind : "polity", rank: px2 >= 4e5 ? 0 : px2 >= 1e5 ? 1 : px2 >= 2e4 ? 2 : px2 >= 4e3 ? 3 : 4, path, len: path.len * kmpp, face: fi, px2 });
      }
      histRows.sort((p, q) => q.px2 - p.px2);
    }
    /* THE PERSONAL ATLAS NAMES ONLY THE READER'S OWN POLITIES AND PEOPLES (2026-10-17, the owner's phone: "the Personal Atlas shows polities with no card the
       reader has studied — those belong only in the Full Atlas"): a state, a people or a culture no studied card links (flag 2) is not a candidate at all in
       Personal — not named, not marked, not muted. Its face is drawn plain (the page's `entColour`) and it is not tappable (the page's `tappable`). */
    for (const row of histRows) { const chordPx = row.path.len; const hl = study ? (study.flags.get(row.id) || 0) : 0; if (study && study.mode === "personal" && hl !== 2) continue; if (!hl && (!show.countries || chordPx < MIN_CHORD_PX)) continue; cands.push({ row, chordPx, a: [row.path.anchor[0], row.path.anchor[1], 1], score: (row.id === q.selected ? -1000 : 0) + (hl ? -400 - (hl === 2 ? 40 : 0) : 0) + row.rank * 10 + (row.kind === "polity" ? KW.country : KW.people), hist: true, hl }); }   // one pool (2c): a people's name is ranked with the states' — after a polity of its rank, before a region of it — and placed by the same grid, so it never collides with one
    /* A LARGE POLITY'S NAME OUTRANKS THE CAPITAL MARKERS INSIDE IT (Phase 3a, task 0a; the 2b review's Ottoman Empire of 1500
       and Mongol Empire of 1245 drew a fill and their capitals but no name). The period capitals scored 0 — before every
       polity, whose best score is KW.country — so Constantinople's marker and name took the cells at the Ottoman label's one
       trial position and the empire's name dropped as "polity collides". A capital now scores after the polities whose
       on-screen area ranks 0 or 1 (the empires of the view) and before the smaller ones; its MARKER is reserved before any
       label is laid out (below), so a name placed first flows round the square rather than over it, and the capital's own
       name is placed in its turn beside the marker. */
    for (const c of q.capitals || []) { const a = proj(unitOf(c.lon, c.lat)); if (a[2] < LIMB_Z || !onScreen(a[0], a[1], 200)) continue; if (!show.cities) continue; cands.push({ row: { id: "cap:" + c.entity + ":" + c.name, name: c.name, kind: "capital", rank: 0, a: unitOf(c.lon, c.lat) }, chordPx: 0, a, score: (CAPITAL_AFTER_RANK + 1) * 10 + KW.capital, hist: true }); }
    for (const row of GZ.rows) {
      const k = row.kind;
      if (!present && (k === "country" || k === "admin1" || k === "capital" || k === "city" || k === "town")) continue;
      /* a study place (3b) is lifted past the density rules: a country, a province, a sea, a river, a lake, an island the reader's cards are
         about is drawn whatever the density, the zoom band or the Names toggles say (the present-day rules above still hold: a past year has
         no present-day country); a settlement the study pass draws as a mark is not drawn twice */
      const hl = study ? (study.flags.get(row.id) || 0) : 0;
      if (hl && study.points.has(row.id)) continue;
      let chordPx = row.len / kmpp;
      if (k === "country") { if (!hl && (!show.countries || chordPx < MIN_CHORD_PX)) continue; if (!hl && row.z && zl > row.z[1] + 2) continue; }
      else if (k === "admin1") { if (!hl && (!show.countries || !show.provinces || !q.admin1 || chordPx < MIN_CHORD_PX)) continue; }
      else if (k === "capital" || k === "city" || k === "town") { if (!show.cities) continue; if (row.z && row.z > zl + shift) continue; }
      else if (PHYSICAL[k]) {
        if (!hl && !show.physical) continue;
        if (k === "lake") { if (!hl && (!show.lakes || Math.max(row.len, 1) / kmpp < MIN_CHORD_PX)) continue; }
        else if (k === "river") {
          if (!(hl || show.rivers) || !q.riversDrawn || row.river < 0) continue;
          const maxRank = q.level === 0 ? 3 : q.level === 1 ? 6 : 99; if (row.rank > maxRank) continue;
          // the river's caps (one per stretch of a merged row) — none reaching the view means no vertex is projected
          if (!RIVER_CAPS || !row.rivers.some((ei) => { const capR = RIVER_CAPS.get(ei); if (!capR) return false; const d = Math.max(-1, Math.min(1, capR[0] * rot[6] + capR[1] * rot[7] + capR[2] * rot[8])); return Math.acos(d) - capR[3] <= viewAngle; })) continue;
        }
        else { const z = Array.isArray(row.z) ? row.z : null; if (!hl && z && (zl + shift < z[0] || zl > z[1] + 1)) continue; if (!z && !row.p) continue; if (!hl && row.p && chordPx < MIN_CHORD_PX) continue; }
      } else continue;
      let a = null;
      if (k !== "river") { a = proj(row.a); if (a[2] < LIMB_Z || !onScreen(a[0], a[1], 200)) continue; }   // nearer the limb than LIMB_Z a name is foreshortened past reading and faded: not a candidate
      const score = (row.id === q.selected ? -1000 : 0) + (hl ? -400 - (hl === 2 ? 40 : 0) : 0) + row.rank * 10 + (KW[k] || 5);
      cands.push({ row, chordPx, a, score, hl });
    }
    cands.sort((p, r) => p.score - r.score);
    /* THE BARE NAMES ON THIS LAYOUT (2026-10-17, decision d): a settlement's label drops its ", <country or region>" qualifier (AtlasStudy.labelText)
       UNLESS two candidates of one layout share the bare name — those two keep their qualifier. Counted over the ordinary settlements here and the
       study names once they are listed (below); asked by both passes through `qualified` */
    const bareCount = new Map(), AS0 = root.AtlasStudy;
    const addBare = (name) => { if (!AS0 || !name) return; const b = AS0.bareName(name); bareCount.set(b, (bareCount.get(b) || 0) + 1); };
    const qualified = (name) => !!(AS0 && name && (bareCount.get(AS0.bareName(name)) || 0) > 1);
    for (const c of cands) if (!c.hist && (c.row.kind === "capital" || c.row.kind === "city" || c.row.kind === "town")) addBare(c.row.name);
    /* ---- the grid ---- */
    const CELL = 64, cols = Math.ceil(W / CELL) + 2, rows = Math.ceil(H / CELL) + 2;
    const cells = new Map();
    const rects = [], rectMark = [];   // rectMark[i]: the rect is a MARK's (a dot, a ring, a reserved capital square) — a city ring's name may stand a pixel from one as its last resort (decision a)
    const clampC = (v, n) => Math.max(0, Math.min(n - 1, v));
    const cellsOf = (r, fn) => { const x0 = clampC(Math.floor(r[0] / CELL) + 1, cols), x1 = clampC(Math.floor(r[2] / CELL) + 1, cols), y0 = clampC(Math.floor(r[1] / CELL) + 1, rows), y1 = clampC(Math.floor(r[3] / CELL) + 1, rows); for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) fn(y * cols + x); };   // a rectangle beyond the viewport shares the edge cells, so off-screen labels still collide with each other
    // what blocks a rectangle: 0 nothing, 1 a mark (with `markPad` in place of the pad against marks, when given), 2 a name or a control
    const blocker = (r, markPad, skip) => { let hit = 0; cellsOf(r, (c) => { if (hit === 2) return; const list = cells.get(c); if (!list) return; for (const i of list) { if (i === skip) continue; const o = rects[i], p = markPad != null && rectMark[i] ? markPad : pad; if (r[0] < o[2] + p && r[2] > o[0] - p && r[1] < o[3] + p && r[3] > o[1] - p) { hit = rectMark[i] ? Math.max(hit, 1) : 2; lastBlock = i; if (hit === 2) return; } } }); return hit; };
    let lastBlock = -1;   // the rect the last blocked query met (the debug reasons)
    const free = (r, markPad, skip) => blocker(r, markPad, skip) === 0;   // `skip`: the index of the name's OWN mark's rect, which its name may lie over (decision a: a name never covers a mark that is not its own)
    const take = (r, mark) => { const i = rects.length; rects.push(r); rectMark.push(!!mark); cellsOf(r, (c) => { let list = cells.get(c); if (!list) cells.set(c, list = []); list.push(i); }); };
    /* THE CHROME IS OCCUPIED GROUND (Phase 2a, task 0d). atlas.js measures the rectangles of its controls — the search box
       and its list, the zoom stack, the Legend and ? chips, an open sheet, the card or its phone strip, the stack chip, the
       year rail — at every layout and resize and sends them as `chrome`; they are taken before any label is placed, so no
       label can be placed under a control (the owner's phone had "Berlin" cut by the zoom buttons and "NORTH EUROPE" under
       the search box). A POINT label (a city and its marker) must be wholly on screen; so must an AREA or PATH label (a sea, a river,
       a region, a polity: Phase 3c — it used to be allowed to hang a quarter over the edge), and none sits under a control. */
    const chrome = Array.isArray(q.chrome) ? q.chrome : [];
    const fullyOn = (r) => r[0] >= 0 && r[1] >= 0 && r[2] <= W && r[3] <= H;
    const hitsChrome = (r) => chrome.some((c) => r[0] < c[2] && r[2] > c[0] && r[1] < c[3] && r[3] > c[1]);
    /* A POLITY'S NAME STAYS INSIDE THE FRAME (Phase 3b, task 0c; the owner's phone had "Mali Empire" cut by the frame's edge and the
       Ottoman Empire of 1500 unnamed). Phase 3c (the owner's decision 3) gives every AREA and PATH name the same rule — a sea's, a
       river's, a region's: no quarter hangs over the edge any more. A name is a title a reader needs whole, so it is slid back inside the frame by at most a third of its
       own width (and two lines' height) or it is not placed, and a name wider than its polity may break at a space onto two
       lines, which keeps it over the polity at a zoom where one line would hang far past the border. */
    const FRAME_PAD = 2 * FS;
    const inFrame = (rs) => rs.every((r) => r[0] >= FRAME_PAD && r[1] >= FRAME_PAD && r[2] <= W - FRAME_PAD && r[3] <= H - FRAME_PAD);
    const intoFrame = (g, lineH) => {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const r of g.rects) { x0 = Math.min(x0, r[0]); y0 = Math.min(y0, r[1]); x1 = Math.max(x1, r[2]); y1 = Math.max(y1, r[3]); }
      const dx = x0 < FRAME_PAD ? FRAME_PAD - x0 : x1 > W - FRAME_PAD ? W - FRAME_PAD - x1 : 0;
      const dy = y0 < FRAME_PAD ? FRAME_PAD - y0 : y1 > H - FRAME_PAD ? H - FRAME_PAD - y1 : 0;
      if (!dx && !dy) return g;
      if (Math.abs(dx) > (x1 - x0) / 3 || Math.abs(dy) > 2 * lineH) return null;
      return { glyphs: g.glyphs.map((q) => [q[0] + dx, q[1] + dy, q[2], q[3]]), rects: g.rects.map((r) => [r[0] + dx, r[1] + dy, r[2] + dx, r[3] + dy]) };
    };
    // a name broken at the space that makes the two lines most nearly equal; null when it has no space. The glyph list keeps one
    // glyph for the space, so it stays index for index with the text (the painter reads the two together).
    const splitName = (text, st, styleId) => {
      let best = null;
      for (let i = 1; i < text.length - 1; i++) {
        if (text[i] !== " ") continue;
        const a = shape(text.slice(0, i), st, missing), b = shape(text.slice(i + 1), st, missing); a.style = b.style = styleId;
        const wide = Math.max(a.w, b.w); if (!best || wide < best.wide) best = { a, b, wide, at: i };
      }
      return best;
    };
    const stacked = (two, x, y) => {
      const lh = two.a.h, g1 = straight(two.a, x, y - lh / 2, 0), g2 = straight(two.b, x, y + lh / 2, 0);
      const last = g1.glyphs[g1.glyphs.length - 1];
      return { glyphs: g1.glyphs.concat([[last[0], last[1], 0, 0]], g2.glyphs), rects: g1.rects.concat(g2.rects) };
    };
    for (const c of chrome) take(c);   // the controls' rectangles are taken first (padded like any label), so nothing is laid out under them
    const placed = [];
    // the period capitals' MARKERS are reserved before any label (task 0a): a polity name placed earlier in the order is laid
    // round them, and the marker itself cannot be lost to a name; the capital's own name is placed in its turn
    // (with the study layer on, a PRESENT-DAY capital's dot is not reserved: the reader's own marks take the ground first, and the dot yields)
    const reservedMarker = new Map();
    for (const c of cands) { if (c.row.kind !== "capital" || (study && !c.hist)) continue; const r = MARKER_R.capital * FS, x = c.a[0], y = c.a[1]; const m = [x - r - 1, y - r - 1, x + r + 1, y + r + 1]; if (fullyOn(m) && free(m)) { take(m, true); reservedMarker.set(c.row.id, m); } }
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
    /* THE 28 PX RULE (2026-10-16; the owner's phone: Dmanisi's name over the Ottoman Empire, far from its marker). NO NAME IS PLACED FARTHER FROM ITS
       ANCHOR THAN ITS OWN HALF-HEIGHT PLUS 28 PX (measured from the anchor to the nearest rectangle of the name's text): a name that cannot be put that
       close is not placed. The page draws a name at its layout position moved by the anchor's own motion since (never a sprite's old corner, never a
       stale offset), so the distance is the same in every frame of a drag, a wheel or a pinch — it is decided here, once per layout, and the Atlas page
       suite measures it in every frame. THE ANCHOR is where the name belongs: a city's and a study place's marker, a straight name's own point (the gazetteer's
       or a polity's), and — for a name that runs along a guide line (a river's course, a country's or polity's label path) — the point of that line under the
       name's middle (a river vertex can be 100 px from the name at a high zoom, so it is interpolated; before this, the anchor of a path name was the
       place's centre point, up to 120 px from where the name stood, and a river's was its nearest vertex). The same point is what the name follows between layouts. */
    const NEAR_PX = 28;
    const nearAnchor = (rs, x, y) => {
      let gap = Infinity, hh = 0;
      for (const r of rs) { const dx = Math.max(r[0] - x, 0, x - r[2]), dy = Math.max(r[1] - y, 0, y - r[3]); const d = Math.hypot(dx, dy); if (d < gap) gap = d; const h = (r[3] - r[1]) / 2; if (h > hh) hh = h; }
      return gap <= hh + NEAR_PX;
    };
    // the point at arc length s of a screen polyline: [x, y, the segment it lies on, the fraction along that segment]
    const pointAt = (S, cum, s) => {
      let seg = 0; while (seg + 1 < cum.length - 1 && cum[seg + 1] < s) seg++;
      const L = cum[seg + 1] - cum[seg] || 1, u = Math.max(0, Math.min(1, (s - cum[seg]) / L));
      return [S[seg][0] + (S[seg + 1][0] - S[seg][0]) * u, S[seg][1] + (S[seg + 1][1] - S[seg][1]) * u, seg, u];
    };
    /* ---- PHASE 3b: THE STUDY PASS — before the ordinary labels, so the places a reader studies take their ground first ----
       STACKS ARE GONE (2026-10-14, the owner's decision; docs/atlas-v2-design.md §7 "Stacks removed"): every place and every polity the
       layer flags is ONE MARK at its own position, at any zoom — never a count standing in for neighbours, and no clustering. This
       pass builds the list of marks (`marks`, posted with the labels and drawn by the page, which re-projects them every frame, so a
       mark is always at its true place and sized for the zoom of the moment: AtlasStudy.markHalf) and places the NAMES the study
       layer owns — a settlement's, a site's, a mountain's, an island's, a region's … name beside its mark.
       What a mark is to a NAME, which is the label engine's business (2026-10-17, decision a — the owner's phone over Rome at 1.2 km/px: "Ostia
       Antica" crossed by a mark, "Mount Vesuvius" over the marks near Naples): EVERY mark drawn clear is hard ground (`take`) before any name
       is laid, the reader's own and the others' alike, so NO name of any pass — a study name, a city's, a sea's, a polity's — ever covers a mark
       that is not its own, and every name is clear of the controls and wholly in the frame. The soft marks of Phase 3b (an ordinary name's
       licence over a small flag-1 dot) and decision d's fallback (a mark's own name over any lesser mark) are gone: the price is names dropped in
       a crowded Full Atlas, which test-atlas-overlaps.js counts per view. A mark is dropped for nothing a name does: only a control or the
       frame's edge (decided per frame by the page) hides one. */
    const marks = [], markById = new Map(), markRect = new Map();   // markRect: id → the index of the mark's rect in the grid (the ordinary pass lets a flagged place's own name lie over its own mark)
    const unitAt = (x, y) => { const ax = (x - cx) / radius, ay = -(y - cy) / radius, az = Math.sqrt(Math.max(0, 1 - ax * ax - ay * ay)); return [rot[0] * ax + rot[3] * ay + rot[6] * az, rot[1] * ax + rot[4] * ay + rot[7] * az, rot[2] * ax + rot[5] * ay + rot[8] * az]; };
    const GAZ_PRESENT = { country: 1, admin1: 1, capital: 1, city: 1, town: 1 };   // alive only in the present year, as the ordinary pass has it
    /* ONE CANDIDATE OF THE ORDINARY KIND (a polity, a period capital, a country, a city, a river, an area), laid or dropped. A function since decision b
       (2026-10-17): a CARD-LINKED polity's or country's name — one the study layer flags — ranks with the study names and is laid by the study pass at its
       flag's turn (after the places of that flag that have cards, since it has no card count), through this same code; the unflagged ones are laid by the
       ordinary pass below. The body is the old loop body unchanged, in a do … while (false) so its `continue`s still mean "next candidate". */
    const done = new Set();   // the candidates the study pass laid
    let capAll = Infinity, riverLabels = 0;   // set once the study pass has laid its names
    const layCand = (c, studyPass) => { do {
      const row = c.row, k = row.kind; dropping = row;
      const styleId = styleFor(row, c.chordPx), st = METRICS[styleId];
      if (!st) { drop(k + " no metrics for style " + styleId); continue; }
      const text = (k === "capital" || k === "city" || k === "town") && !c.hist && root.AtlasStudy ? root.AtlasStudy.labelText(row.name, null, { qualified: qualified(row.name) }).text : row.name;   // a settlement's name shows no parenthetical (decision f) and no ", <country>" qualifier unless two share the bare name (decision d, 2026-10-17)
      const sh = shape(text, st, missing); sh.style = styleId;
      const base = { id: row.id, kind: k, style: styleId, text: sh.chars.join(""), score: c.score, selected: row.id === q.selected, hist: !!c.hist, face: row.face, st: c.hl || 0 };
      if (studyPass) base.study = true;   // laid by the study pass (decision b)
      /* a flagged area or polity has a MARK at its anchor (the study pass): its name stands just above it, so the dot is read as the place and the name as its label */
      const mk0 = markById.get(row.id), up = mk0 ? -(mk0.h + 2 + sh.h / 2) : 0, own0 = markRect.get(row.id), freeOwn = (r) => free(r, null, own0);   // a flagged place's name may lie over its OWN mark (a name along its path crosses its anchor), never over another's; a polity or an area has none since 2026-10-18 / decision e
      if (k === "polity" || k === "people" || k === "culture" || k === "extent") {
        // along the path computed above (screen space already), else straight at its anchor; a polity's name is a country's style
        const S2 = row.path.pts.map((p) => [p[0], p[1]]); if (!reads(S2)) S2.reverse();
        const cum = polyline(S2), Ls = cum[cum.length - 1];
        let got = null, curved = false, lines = 1, mid = null;   // mid: the point of the guide line under a name that runs along it — that name's anchor (the 28 px rule)
        let cvTried = 0, cvBent = 0, cvName = 0, cvMark = 0, cvFrame = 0;   // what the tries along the path met (the drop reason)
        // along the path: at its middle first, then slid either way (task 0a: the one trial at the middle was where the capital sat)
        if (Ls >= sh.w * 1.02) for (const f of POLITY_SLIDE) { const s0 = Ls / 2 + f * Ls; if (s0 - sh.w / 2 < 0 || s0 + sh.w / 2 > Ls) continue; cvTried++; const g = alongEither(sh, S2, cum, s0, st); if (!g) { cvBent++; continue; } if (g.rects.every(freeOwn) && inFrame(g.rects)) { got = g; curved = true; mid = pointAt(S2, cum, s0); break; } if (why) { const b = Math.max(...g.rects.map((r) => blocker(r, null, own0))); if (b === 2) cvName++; else if (b === 1) cvMark++; else cvFrame++; } }
        if (!got) {
          const wide = row.path.len * (row.rank <= CAPITAL_AFTER_RANK ? POLITY_WIDE_LARGE : POLITY_WIDE);
          let clipped = 0, collided = 0, far = 0, stMark = 0;
          const straightTry = (make, w) => { for (const n of POLITY_NUDGE) for (const f of POLITY_SIDE) { const g = intoFrame(make(c.a[0] + f * w, c.a[1] + n * sh.h + up), sh.h); if (!g) { clipped++; continue; } if (!g.rects.every(freeOwn)) { collided++; if (why && Math.max(...g.rects.map((r) => blocker(r, null, own0))) === 1) stMark++; continue; } if (!nearAnchor(g.rects, c.a[0], c.a[1])) { far++; continue; } return g; } return null; };
          if (sh.w <= wide) got = straightTry((x, y) => straight(sh, x, y, 0), sh.w);
          let two = null;
          if (!got) { two = splitName(text, st, styleId); if (two && two.wide <= wide) { got = straightTry((x, y) => stacked(two, x, y), two.wide); if (got) lines = 2; } }
          if (!got) { drop(sh.w > wide && !(two && two.wide <= wide) ? "polity name wider than its path (" + Math.round(sh.w) + " px, " + (two ? Math.round(two.wide) + " px on two lines" : "no space to break at") + ", against " + Math.round(row.path.len) + ", rank " + row.rank + ")" : far > clipped + collided ? "polity name finds no free place within " + NEAR_PX + " px of its anchor" : clipped > collided ? "polity label clipped" : `polity collides (along the path ${cvTried} tries: ${cvBent} too bent, ${cvName} met a name or a control, ${cvMark} met a mark, ${cvFrame} left the frame; straight ${collided} collided, ${stMark} of them with a mark, ${clipped} clipped, ${far} too far; last met rect #${lastBlock} ${JSON.stringify((rects[lastBlock] || []).map(Math.round))} mark=${rectMark[lastBlock]} of ${rects.length}, chrome ${chrome.length})`); continue; }
        }
        const ub = union(got.rects); if (offScreen(ub)) { drop("polity label wholly off screen"); continue; }
        for (const r of got.rects) take(r);
        // the anchor's unit vector: unproject the screen anchor (the label follows the globe between layouts) — the guide line's point under the name when it runs along one, else the polity's own point
        const ap = mid || c.a, aw = unitAt(ap[0], ap[1]);
        placed.push(Object.assign(base, { a: aw, sx: ap[0], sy: ap[1], alpha: 1, glyphs: got.glyphs, box: ub, rects: got.rects, marker: null, hit: ub, curved, meanAngle: curved ? got.meanAngle : 0 }));
        continue;
      }
      if (k === "capital" || k === "city" || k === "town") {
        const r = MARKER_R[k] * FS, x = c.a[0], y = c.a[1];
        const mrect = [x - r - 1, y - r - 1, x + r + 1, y + r + 1];
        const own = reservedMarker.has(row.id);   // a capital's marker was reserved above and is its own ground
        if (!fullyOn(mrect)) { drop("marker off screen"); continue; }
        if (!own && !free(mrect, null, own0)) { drop("marker collides"); continue; }   // a flagged settlement's dot lies on its own study mark, which is not a collision (2026-10-18)
        if (!show.places) { if (!own) take(mrect, true); placed.push(Object.assign(base, { text: "", a: row.a, sx: x, sy: y, alpha: Math.min(1, c.a[2] / 0.2), glyphs: [], box: mrect, rects: [mrect], marker: [x, y, r, k], hit: mrect })); continue; }
        // a FLAGGED settlement's name (laid by the study pass beside the study layer's own mark, drawn over this dot) follows decision c of 2026-10-18: right or left of the
        // larger of the two glyphs at the 3 px gap, above or below only at the zoom cap; the plain Map's city names keep their four sides
        const g3 = 3 * FS, rr = studyPass && mk0 ? Math.max(r, mk0.h) : r;
        const tries = [[x + rr + g3 + sh.w / 2, y, 0], [x - rr - g3 - sh.w / 2, y, 0]].concat(studyPass && mk0 && !atCap ? [] : [[x, y - rr - g3 - sh.h / 2, 0], [x, y + rr + g3 + sh.h / 2, 0]]);
        let got = null;
        for (const [tx, ty, ang] of tries) { const g = straight(sh, tx, ty, ang); if (fullyOn(g.rects[0]) && free(g.rects[0], null, own0)) { got = g; break; } }
        if (!got) {
          // a reserved capital marker whose name finds no free side keeps its marker (task 0a): the square under the empire's
          // name still says where the capital is, and a tap answers with the name; an unreserved one drops as before
          if (own) { placed.push(Object.assign(base, { text: "", a: row.a, sx: x, sy: y, alpha: Math.min(1, c.a[2] / 0.2), glyphs: [], box: mrect, rects: [mrect], marker: [x, y, r, k], hit: mrect })); continue; }
          drop(onScreen(x, y, 0) ? "city label collides on all four sides, or is not wholly on screen" : "city off screen"); continue;
        }
        // a FLAGGED settlement's dot is the study layer's own mark, already drawn and already taken: no second dot under it (a filled-looking disc would read as the reader's own), the name alone (2026-10-18)
        const studyDot = !!(studyPass && mk0);
        take(got.rects[0]); if (!own && !studyDot) take(mrect, true);
        placed.push(Object.assign(base, { a: row.a, sx: x, sy: y, alpha: Math.min(1, c.a[2] / 0.2), glyphs: got.glyphs, box: studyDot ? got.rects[0] : union([got.rects[0], mrect]), rects: studyDot ? [got.rects[0]] : [got.rects[0], mrect], marker: studyDot ? null : [x, y, r, k], hit: union([got.rects[0], mrect]) }));
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
          for (let s0 = LrS < RIVER_REPEAT_PX ? LrS / 2 : RIVER_REPEAT_PX / 2; s0 + sh.w / 2 + 10 < LrS && placed.length < capAll; s0 += RIVER_REPEAT_PX) {
            // a spot that bends or collides is not the stretch's last word: the text slides up to 120 px either way
            let g = null, s1 = s0, av = null, apt = null;
            for (const off of [0, 60, -60, 120, -120]) {
              s1 = s0 + off; if (s1 - sh.w / 2 < 10 || s1 + sh.w / 2 + 10 > LrS) continue;
              tried++;
              const t = alongEither(sh, runS, cumS, s1, st); if (!t) { bent++; continue; }
              if (!t.rects.every(free)) { collided++; continue; }
              if (!inFrame(t.rects)) continue;   // a run reaches 60 px past the canvas; the text stays inside the frame like a polity's name (Phase 3c), another stretch or offset is tried
              // the anchor: the river's own point under the label's middle, between the two vertices it lies between (a vertex alone can be 100 px away at a high zoom: the 28 px rule)
              const pa = pointAt(runS, cumS, s1), v0 = runV[pa[2]], v1 = runV[pa[2] + 1] || v0;
              av = norm3([v0[0] + (v1[0] - v0[0]) * pa[3], v0[1] + (v1[1] - v0[1]) * pa[3], v0[2] + (v1[2] - v0[2]) * pa[3]]); apt = proj(av);
              if (!nearAnchor(t.rects, apt[0], apt[1])) { av = null; continue; }
              g = t; break;
            }
            if (!g) continue;
            for (const r of g.rects) take(r);
            placed.push(Object.assign({}, base, { a: av, sx: apt[0], sy: apt[1], alpha: 1, glyphs: g.glyphs, box: union(g.rects), rects: g.rects, marker: null, hit: union(g.rects), curved: true, meanAngle: g.meanAngle }));
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
      let got = null, curved = false, mid = null, far = false;
      if (row.p) {
        const S = row.p.map(proj);
        if (S.every((p) => p[2] > 0.01)) {
          const S2 = S.map((p) => [p[0], p[1]]);
          if (!reads(S2)) S2.reverse();
          const cum = polyline(S2), Ls = cum[cum.length - 1];
          if (Ls >= sh.w * 1.02) { const g = alongEither(sh, S2, cum, Ls / 2, st); if (g && g.rects.every(freeOwn) && inFrame(g.rects)) { got = g; curved = true; mid = pointAt(S2, cum, Ls / 2); } }   // a run that leaves the frame at all falls back to the straight name at the anchor, which is slid back inside it (Phase 3c)
        }
      }
      if (!got) {
        if (c.chordPx > 0 && sh.w > c.chordPx * 1.8 && k !== "island" && k !== "island-group") { drop(k + " name wider than its shape"); continue; }   // the name would overhang the shape by most of its length
        if (!onScreen(c.a[0], c.a[1], 0)) { drop(k + " anchor off screen"); continue; }
        // with a mark at the anchor: just above it, else just below it, else over it (its OWN mark, which a name may cover — decision a forbids another's only)
        let hung = false, hit = false;
        for (const dy of mk0 ? [up, -up, 0] : [0]) {
          const g = intoFrame(straight(sh, c.a[0], c.a[1] + dy, 0), sh.h);   // Phase 3c, decision 3: a sea's, a region's name stays inside the frame like a polity's — slid back by at most a third of its width, or not placed
          if (!g) { hung = true; continue; }
          if (!freeOwn(g.rects[0])) { hit = true; continue; }
          if (!nearAnchor(g.rects, c.a[0], c.a[1])) { far = true; continue; }
          got = g; break;
        }
        if (!got) { drop(far && !hit && !hung ? k + " name finds no free place within " + NEAR_PX + " px of its anchor" : hit || !hung ? k + " collides" : k + " label would hang out of the frame"); continue; }
      }
      // a label whose every glyph lies beyond the viewport (its anchor was within the 200 px margin) is not placed: it
      // would hold a slot of the density cap and draw nothing
      const ub = union(got.rects);
      if (offScreen(ub)) { drop(k + " label wholly off screen"); continue; }
      for (const r of got.rects) take(r);
      placed.push(Object.assign(base, mid ? { a: unitAt(mid[0], mid[1]), sx: mid[0], sy: mid[1], alpha: Math.min(1, c.a[2] / 0.2) } : { a: row.a, sx: c.a[0], sy: c.a[1], alpha: Math.min(1, c.a[2] / 0.2) }, { glyphs: got.glyphs, box: ub, rects: got.rects, marker: null, hit: ub, curved, meanAngle: curved ? got.meanAngle : 0 }));
    } while (false); };
    if (study) {
      const AS = root.AtlasStudy, h0 = AS.markHalf(kmpp) * FS, MARGIN = 120;
      const histAt = new Map();
      for (const hr of histRows) if (!histAt.has(hr.id)) histAt.set(hr.id, hr);
      const candById = new Map(); for (const c of cands) if (c.hl && !candById.has(c.row.id)) candById.set(c.row.id, c);   // the flagged candidates of the ordinary kind, laid by this pass (decision b)   // sorted by on-screen area: a polity's mark is on its largest face in view
      let list = [];
      for (const [id, f] of study.flags) {
        let kind, name = "", n = 0, a, x, y, z, unit, own = null;
        const srow = study.rows.get(id);
        if (srow) {
          if (!present && srow.pd) continue;   // a present-day city is not alive in a past year
          kind = srow.kind; name = srow.name; n = srow.n; unit = srow.a; own = srow;
          a = proj(unit); x = a[0]; y = a[1]; z = a[2];
        } else if (histAt.has(id)) {
          const hr = histAt.get(id), an = hr.path.anchor;
          kind = hr.kind; x = an[0]; y = an[1]; z = 1; unit = unitAt(x, y);
        } else {
          const g = GZ.byId.get(id); if (!g || !g.a) continue;
          if (!present && GAZ_PRESENT[g.kind]) continue;
          kind = g.kind; unit = g.a; a = proj(unit); x = a[0]; y = a[1]; z = a[2];
        }
        if (z < 0.02 || !onScreen(x, y, MARGIN)) continue;
        const sub = srow ? srow.sub : "", cap = !!(srow && srow.cap), cls = AS.markClass(kind, sub, cap);   // the glyph class (decision e; a capital's square, decision b of 2026-10-17); null for an area: a name, no mark
        list.push({ id, kind, sub, cls, name, n, f, unit, x, y, z, own, shape: cls ? AS.markShape(kind, sub, cap) : null, layer: AS.markLayer(kind, f), h: cls ? h0 * AS.markScale(kind, cls) : 0 });   // the drawn size: half for every class but the capital (decision a, 2026-10-18)
      }
      /* CITY STACKS (2026-10-17, decision d): the marks of ONE CITY within STACK_PX (28) of one another on screen become one mark with a count,
         at their mean position, named for the city; its members are not drawn (the page's popup pages through them). Never across cities, never
         by raw proximity: `study.city` is the membership (the registry's parent, else the nearest settlement within 3 km). Zoomed in until the
         members lie farther apart than 28 px they are drawn singly again — this is decided per layout, so a pinch holds the last decision. */
      if (study.city && study.city.size && list.length > 1) {
        const byCity = new Map();
        for (let i = 0; i < list.length; i++) { if (!list[i].cls) continue; const cid = study.city.get(list[i].id); if (!cid) continue; let l = byCity.get(cid); if (!l) byCity.set(cid, l = []); l.push(i); }
        const drop2 = new Set(), stacks = [];
        for (const [cid, idxs] of byCity) {
          if (idxs.length < 2) continue;
          for (const g of AS.stackGroups(idxs.map((i) => list[i]), AS.STACK_PX)) {
            const mem = g.map((j) => list[idxs[j]]); let sx = 0, sy = 0, f = 0, z = 0, n = 0;
            for (const mm of mem) { sx += mm.x; sy += mm.y; if (mm.f > f) f = mm.f; if (mm.z > z) z = mm.z; n += mm.n; drop2.add(mm.id); }
            sx /= mem.length; sy /= mem.length;
            const name = study.cityName.get(cid) || cid, id = "stk:" + cid + ":" + stacks.length;
            /* A STACK WHOSE CITY IS A CAPITAL IS THE CAPITAL'S SQUARE WITH THE COUNT INSIDE (2026-10-18, the owner's fifth look, decision d: "some capital cities, like
               Rome or Athens, still appear with circles instead of squares"): the city's row is a capital by the gazetteer's kind or the registry's capital
               statements (`cap`, decision b of 2026-10-17); any other city's stack is the ring. The square is sized to hold a two-digit count in the 9 px bold
               figure (AtlasStudy.squareHalf: 20 px across at every zoom; the ring's 19), its class is still the stack's (the popup pages through the members). */
            const crow = study.rows.get(cid), grow = GZ && GZ.byId ? GZ.byId.get(cid) : null, capCity = !!((crow && (crow.cap || crow.kind === "capital")) || (grow && grow.kind === "capital"));
            const hh = capCity ? AS.squareHalf(h0, FS) : AS.ringHalf(h0, FS);   // a count must fit inside, in a 9 px bold figure: never under 19 px across (decision a, 2026-10-18)
            stacks.push({ id, kind: "stack", sub: "", cls: "stack", name, n, f, unit: unitAt(sx, sy), x: sx, y: sy, z, own: { id, name, kind: "city", a: unitAt(sx, sy) }, city: cid, members: mem.map((mm) => mm.id).sort(), count: mem.length, shape: capCity ? "square" : "stack", cap: capCity, layer: AS.markLayer("stack", f), h: hh });
          }
        }
        if (drop2.size) list = list.filter((mm) => !drop2.has(mm.id)).concat(stacks);
        /* STACKS NEVER OVERLAP (2026-10-17, decision c; the owner's phone: the Vatican City ring ("3") sat on Rome's ("39") at the closest zoom). Two
           rings, or a ring and a single mark, whose boxes would overlap are NUDGED apart along the line between their centres by the overlap — a ring
           by at most STACK_NUDGE_PX (20); a ring moves (its position is a mean, not a point) and a single mark stays on its point; two rings share the
           overlap. The ring's offset (`ox`, `oy`, CSS px) goes to the page, which adds it after projecting the true position every frame and draws a
           HAIRLINE from the ring to the true point — so a gesture holds the rings apart at any zoom until the next layout, as it holds the stacks.
           Why a nudge and not a merge: the registry has no city extents to say when two cities "share" one (membership is the parent or the 3 km rule),
           and Vatican City is a sovereign capital, not a part of Rome — one ring for both would misname the places. Decided per layout, in the worker. */
        if (stacks.length) nudgeStacks(list, W, H, hitsChrome);
        /* A NUDGED RING'S NAME STANDS BESIDE THE RING AS DRAWN (2026-10-17, decision a; the owner's phone: "VATICAN CITY" over "Collatia", and Rome's "41"
           with no name beside it). The name is laid beside the nudged position, so its anchor — the point the page projects and moves it with — must be
           that position too: anchored at the ring's true mean, the page drew the name moved back by the whole nudge (up to 20 px), onto whatever lay
           there. The MARK keeps the true mean (the page adds ox, oy and draws the hairline from it). */
        for (const s of stacks) if (s.ox || s.oy) s.own.a = unitAt(s.x, s.y);
      }
      /* THE STACKS' NAMES COME FIRST (decision a): a city's ring is named before any other name — "Rome" beside the "41" — and the names that would
         collide with it yield; then the reader's own, then the rest by their cards */
      list.sort((p, r) => (r.members ? 1 : 0) - (p.members ? 1 : 0) || r.f - p.f || r.n - p.n || (p.id < r.id ? -1 : 1));
      for (const m of list) if (m.own && m.own.name && !m.members) addBare(m.own.name);   // the study names count toward the bare names of this layout (decision d, 2026-10-17)
      /* EVERY MARK IS AN OBSTACLE TO EVERY NAME (2026-10-17, decision d: "Lake Regillus" and "Appian Way", area names laid centred on their points,
         sat on the diamonds of other places; then decision a: every name of every pass). The marks' ground is taken BEFORE any name is laid, all of
         it hard, so a name, centred or beside, never covers a mark of the layer, its own or another's. */
      list.forEach((m) => {
        const hh = m.h, mrect = [m.x - hh - 1, m.y - hh - 1, m.x + hh + 1, m.y + hh + 1];
        m.rect = mrect; m.clear = fullyOn(mrect) && !hitsChrome(mrect);
        if (m.cls && m.clear) { markRect.set(m.id, rects.length); take(mrect, true); }
      });
      for (const m of list) {
        const hh = m.h, mrect = m.rect;
        dropping = m.own || { name: m.id };
        const base = { id: m.id, kind: m.kind, cls: m.cls, shape: m.shape, layer: m.layer, st: m.f, a: m.unit, sx: m.x, sy: m.y, h: hh, n: m.n, clear: m.clear, score: -300 - m.f * 10 - Math.min(9, m.n / 100) };
        if (m.members) { base.members = m.members; base.count = m.count; base.name = m.name; base.city = m.city; base.cap = !!m.cap; }   // a city stack (decision d); `cap`: a capital's, drawn as the square (decision d of 2026-10-18)
        if (m.ox || m.oy) { base.ox = Math.round(m.ox * 10) / 10; base.oy = Math.round(m.oy * 10) / 10; }   // nudged off its true point (decision c): the page adds the offset and draws the hairline
        if (m.cls) { marks.push(base); markById.set(m.id, base); }   // an AREA (no class) has no mark: its name stands at its point (decision e)
        if (!m.own) { const c2 = candById.get(m.id); if (c2) { done.add(c2); layCand(c2, true); } continue; }   // a flagged polity, country, sea or river: its name is laid HERE, at its flag's turn, by the ordinary code (decision b)
        if (!m.clear) continue;   // under a control or past the frame's edge: no name either (the page checks the mark again on every frame)
        const row = m.own;
        if (row && show.places && row.name) {
          const style = STUDY_POINT[row.kind] ? (row.kind === "capital" ? "capital" : row.kind === "city" ? "city" : "town") : styleFor(row, 0), st2 = METRICS[style];
          if (st2) {
            /* THE LABEL'S TEXT (decision f): no parenthetical, the short name past 28 characters, two lines past 22 (AtlasStudy.labelText); the popup keeps the full name */
            const lt = AS.labelText(row.name, row.aliases, { qualified: qualified(row.name) });
            let two = null, sh = null;
            const setText = (lines) => {   // one line, or two meeting at the point
              if (lines) { const a = shape(lines[0], st2, missing), b = shape(lines[1], st2, missing); a.style = b.style = style; two = { a, b, wide: Math.max(a.w, b.w), h: a.h + b.h }; sh = { w: two.wide, h: two.h, chars: [...lines[0], " ", ...lines[1]] }; }
              else { two = null; sh = shape(lt.text, st2, missing); }
              sh.style = style;
            };
            setText(lt.lines);
            const lay = (tx, ty) => (two ? stacked(two, tx, ty) : straight(sh, tx, ty, 0));
            // the box a try would take (what `lay` would return as rects: one line centred at the point, or two lines meeting at it), without the glyphs
            const boxAt = (tx, ty) => (two ? [[tx - two.a.w / 2, ty - two.a.h, tx + two.a.w / 2, ty], [tx - two.b.w / 2, ty, tx + two.b.w / 2, ty + two.b.h]] : [[tx - sh.w / 2, ty - sh.h / 2, tx + sh.w / 2, ty + sh.h / 2]]);
            /* A MARK'S NAME STANDS DIRECTLY RIGHT OR LEFT OF ITS MARK (2026-10-18, the owner's fifth look, decision c: "when icons are clustered, their text labels
               drift and it becomes impossible to tell which text belongs to which icon"). The name is vertically centred on its mark — a place's, a city ring's, a
               capital's — with NAME_GAP (3 px) between the mark's edge and the text, the right side first, then the left; there is NO other candidate: not above,
               not below, not a corner, not slid along a side, not farther out. Decision d's 64-box search (2026-10-17), the ring's last resorts (a pixel from a
               dot; the name on two lines) and the 28 px allowance for a mark's name are gone — a name 3 px from its mark cannot need it (an area's name still
               keeps the rule). If neither side is clear of every other name, every other mark and the controls, the name is NOT drawn: the reader sees the mark
               alone rather than a name that could be another's. At the ZOOM CAP (the closest view the page allows: `atCap`, from q.kmppFloor) the name may
               also stand above or below the mark, centred, at the same gap — there the marks lie as far apart as they ever will. An AREA's name (no mark) keeps
               its tries: on its point, then above, below and beside, then 10 px farther. The name may lie over its OWN mark only (`free`'s skip; it never
               does at this gap) and never over another's; test-atlas-overlaps.js reads the drawn boxes against the drawn marks at every view. */
            const NAME_GAP = 3 * FS, own0 = markRect.get(m.id), w2 = sh.w / 2, h2 = sh.h / 2, g = hh + NAME_GAP;
            const tries = m.cls
              ? [[m.x + g + w2, m.y], [m.x - g - w2, m.y]].concat(atCap ? [[m.x, m.y - g - h2], [m.x, m.y + g + h2]] : [])
              : [[m.x, m.y], [m.x, m.y - sh.h], [m.x, m.y + sh.h], [m.x + w2 + pad, m.y], [m.x - w2 - pad, m.y], [m.x, m.y - sh.h - 10], [m.x, m.y + sh.h + 10], [m.x + w2 + pad + 10, m.y], [m.x - w2 - pad - 10, m.y]];
            const okAt = (rs) => rs.every((r) => fullyOn(r) && free(r, null, own0)) && (!!m.cls || nearAnchor(rs, m.x, m.y));
            let got = null, tried = 0, frame = 0, far = 0, byName = 0, byMark = 0;   // why each try failed, for the drop reason (labelWhy)
            for (const [tx, ty] of tries) {
              const rs = boxAt(tx, ty); tried++;
              if (okAt(rs)) { got = lay(tx, ty); break; }
              if (!why) continue;
              if (!rs.every(fullyOn)) frame++; else { const bl = Math.max(...rs.map((r) => blocker(r, null, own0))); if (bl === 2) byName++; else if (bl === 1) byMark++; else far++; }
            }
            if (got) {
              for (const r of got.rects) take(r);
              placed.push({ id: row.id, kind: row.kind, style, text: sh.chars.join(""), score: base.score, selected: row.id === q.selected, hist: false, st: m.f, a: row.a, sx: m.x, sy: m.y, alpha: Math.min(1, m.z / 0.2), glyphs: got.glyphs, box: union(got.rects), rects: got.rects, marker: null, hit: union(got.rects), lines: two ? 2 : 1, study: true });   // `study`: laid by the study pass (decision b: the order is explicit and guarded)
            } else drop(`study name finds no free side clear of the names and the marks (${tried} tries: ${frame} left the frame, ${byName} met a name or a control, ${byMark} met a mark, 0 only a mark's pad, ${far} too far from the point)`);   // the format test-atlas-overlaps.js parses
          }
        }
      }
    }
    /* A POLITY'S OR A COUNTRY'S NAME THAT IS NOT A CARD-LINKED PLACE RANKS BELOW THE STUDY NAMES NEAR IT (2026-10-17, decision b: Vatican City as a
       state label against the places' names round Rome). The ordinary pass — the unflagged polities, countries and provinces, the cities, the water
       and the physical names — begins only here, after every study name is laid; a state's name that would collide with a study name is the one
       dropped. A CARD-LINKED polity or country (flagged by the study layer) was laid by the study pass above, at its flag's turn (`layCand`).
       test-atlas-overlaps.js asserts the order on the placed list. */
    capAll = cap + placed.length;   // the density cap counts the ordinary labels only: the study pass is the reader's own
    for (const c of cands) {
      if (placed.length >= capAll) break;
      if (done.has(c)) continue;   // laid by the study pass (decision b)
      layCand(c, false);
    }
    void hitsChrome;
    return { placed, marks, candidates: cands.length, cap, chrome: chrome.length, missing: [...missing].map((m) => m.split("\u0001")), rivers: riverLabels, why };
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
  const HIST_KIND = 7, HIST_LRU_BYTES = 96 * 1024 * 1024;   // the triangulated meshes kept here, by their bytes (2b), not by count
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
    // the borders travel with each face's mesh since 2b (handleHistoryFaces); the three per-level lists of every border are gone
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
        const ent = HIST.H.entities[HIST.T.faces[fi].entity], presence = !!ent && (ent.kind === "people" || ent.kind === "culture" || ent.kind === "extent" || ent.kind === "front");
        if (presence) await presenceMesh(L.T, L.pos, HIST.T.faces[fi], level, sink, ent.kind === "front"); else await triangulateFace(L.T, L.pos, HIST.T.faces[fi], fi, level, sink);   // 2c: a presence's mesh carries an edge alpha, not a face id
        const F = sink.result();
        // the face's coast edges at this level, for the fill-against-stroke stroke at the tile zooms (§2.3, Phase 2a), and — since 2b —
        // its BORDER edges (every non-coast arc, tagged with the arc index so the main thread's arc table still fades them), so the
        // renderer draws the borders of the faces on screen and no others: one list per level held every border of the file (51,025
        // arcs at full scale, 70,000 segments in a Mediterranean view with most at alpha 0), and a software rasteriser pays per segment
        const coast = [], border = [];
        if (!presence) for (const ring of HIST.T.faces[fi].rings) for (const ref of ring) { const a = Math.abs(ref) - 1; const list = HIST.T.arcKind[a] === 0 ? coast : border, tag = HIST.T.arcKind[a] === 0 ? fi * 64 + HIST_KIND : a * 64 + (HIST.T.arcFlags[a] & 7) * 8 + HIST_KIND; for (let i = L.T.arcOffset[a] + 1; i < L.T.arcOffset[a + 1]; i++) list.push(L.pos[3 * (i - 1)], L.pos[3 * (i - 1) + 1], L.pos[3 * (i - 1) + 2], tag, L.pos[3 * i], L.pos[3 * i + 1], L.pos[3 * i + 2], 0); }   // EIGHT floats a segment — (a.xyz, tag) (b.xyz, 0), the two texels uploadSegs reads — never the seven-float form bucketSegments takes: seven floats read as eight drew every segment after the first between unrelated points (the 2a review's chord across Latium and the fan over Sicily, fixed in 2b)
        m = { face: fi, level, pos: F.pos, idx: F.triangles * 3 <= 65535 && F.vertices <= 65535 ? Uint16Array.from(F.idx) : F.idx, coast: Float32Array.from(coast), border: Float32Array.from(border), triangles: F.triangles };
        m.bytes = m.pos.byteLength + m.idx.byteLength + m.coast.byteLength + m.border.byteLength;
        HIST.meshes.set(key, m); HIST.order.push(key); HIST.bytes = (HIST.bytes || 0) + m.bytes;
        let spins = 0; while (HIST.bytes > HIST_LRU_BYTES && HIST.order.length && spins++ < HIST.order.length * 2) { const old = HIST.order.shift(); if (!HIST.resident.has(old)) { const om = HIST.meshes.get(old); if (om) HIST.bytes -= om.bytes; HIST.meshes.delete(old); } else HIST.order.push(old); }
      }
      HIST.resident.add(key);
      meshes.push({ face: fi, level, pos: m.pos.slice(), idx: m.idx.slice(), coast: m.coast.slice(), border: m.border.slice(), triangles: m.triangles });
    }
    const transfer = []; for (const m of meshes) transfer.push(m.pos.buffer, m.idx.buffer, m.coast.buffer, m.border.buffer);
    post({ type: "history-faces", level, meshes, seq: msg.seq, ms: Math.round(now() - t0) }, transfer);
  }
  /* THE SELECTED STATE'S OUTLINE (2026-10-18, whole-state selection): the rings of the given history faces at a level, as unit vectors on the sphere (one Float32Array
     of xyz per ring, the walk `faceRings` makes — coast arcs included, which the face's border list leaves out), for the page to stroke on its label canvas every frame
     with the view's own projection: no mask pass, no read-back, exact at any pan, pinch or turn. A ring an arc of the level leaves out (arcMinLod) is left out. */
  function handleFaceRings(msg, post) {
    const rings = [], faces = [], transfer = [];
    if (HIST) {
      const level = Math.max(0, Math.min(2, msg.level | 0)), L = histLevel(level);
      for (const fi of msg.faces || []) {
        const f = HIST.T.faces[fi]; if (!f) continue; faces.push(fi);
        for (const ring of faceRings(L.T, f, level)) { const a = new Float32Array(ring.length * 3); let k = 0; for (const i of ring) { a[k++] = L.pos[3 * i]; a[k++] = L.pos[3 * i + 1]; a[k++] = L.pos[3 * i + 2]; } rings.push(a); transfer.push(a.buffer); }
      }
    }
    post({ type: "face-rings", seq: msg.seq, faces, rings }, transfer);
  }
  /* PHASE 4 PHONE FIXES (Oct 2026): a point INSIDE each of the given history faces, as far from its edge as the visible part of the face allows (a pole of inaccessibility, in screen pixels) — what a card window's war labels
     stand on (atlas-windows.js: each side is named on ground of its own tint, not at the centroid of the union of its faces, which fell on the other side's ground). The face's rings are the level the view draws (`msg.level`),
     projected with the message's view; the point is searched on a grid over the part of the face that is inside the frame (and the globe's disc) by an even-odd test, then refined three times round the best cell. Answers
     { seq, rows: [{ face, anchor: [x, y] | null, clear (px to the nearest edge), vis (the share of the face's vertices in the frame), km2 }] }; the view is the message's. */
  /* THE PIECE OF A FACE NEAREST A POINT (Oct 2026): a face is a set of rings — islands, with holes inside them — and a polity's face is rarely one piece (Rome in 209 BCE: Italy, Sicily, and a strip of North Africa an ally held). `near` is a screen point (the polity's capital
     of the year): the piece that holds it, else the piece whose outline is nearest. Returns the indices of that piece's rings (its outer ring and the rings nested directly inside it), or null when no ring has three vertices on the near side. */
  function pieceNear(rings, near) {
    const poly = rings.map((r) => r.filter((p) => p[2] > 0.02));
    const inRing = (pg, x, y) => { let c = false; for (let i = 0, j = pg.length - 1; i < pg.length; j = i++) { const a = pg[i], b = pg[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
    const wrap = poly.map((pg, i) => pg.length < 3 ? [] : poly.map((q, j) => j !== i && q.length >= 3 && inRing(q, pg[0][0], pg[0][1]) ? j : -1).filter((j) => j >= 0));   // the rings each ring lies inside
    const outer = [], holes = new Map();
    poly.forEach((pg, i) => { if (pg.length < 3) return; if (wrap[i].length % 2 === 0) { outer.push(i); holes.set(i, []); } });
    poly.forEach((pg, i) => { if (pg.length < 3 || wrap[i].length % 2 === 0) return; const par = wrap[i].find((j) => wrap[j].length === wrap[i].length - 1); if (par != null && holes.has(par)) holes.get(par).push(i); });
    const dist = (pg) => { let m = Infinity; for (let i = 0, j = pg.length - 1; i < pg.length; j = i++) { const a = pg[i], b = pg[j], dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy; let t = l2 ? ((near[0] - a[0]) * dx + (near[1] - a[1]) * dy) / l2 : 0; t = t < 0 ? 0 : t > 1 ? 1 : t; const ex = a[0] + t * dx - near[0], ey = a[1] + t * dy - near[1], d = ex * ex + ey * ey; if (d < m) m = d; } return Math.sqrt(m); };
    let best = null;
    for (const i of outer) { const inside = inRing(poly[i], near[0], near[1]) && !holes.get(i).some((h) => inRing(poly[h], near[0], near[1])), d = inside ? 0 : dist(poly[i]); if (!best || d < best.d) best = { i, d }; }
    return best ? [best.i].concat(holes.get(best.i)) : null;
  }
  function histPole(fi, proj, W, H, q, level, near) {   // `near`: a screen point [x, y] — the pole is searched in the piece of the face nearest it (the whole face when that piece has no visible point)
    const r = histPole0(fi, proj, W, H, q, level, near || null);
    return r || (near ? histPole0(fi, proj, W, H, q, level, null) : null);
  }
  function histPole0(fi, proj, W, H, q, level, near) {
    const L = histLevel(level), T = HIST.T;
    let rings = faceRings(L.T, T.faces[fi], level).map((ring) => ring.map((i) => proj([L.pos[3 * i], L.pos[3 * i + 1], L.pos[3 * i + 2]])));
    if (near) { const g = pieceNear(rings, near); if (g) rings = g.map((i) => rings[i]); }
    const rr = q.radius ? (q.radius * 0.985) * (q.radius * 0.985) : Infinity, inDisc = (x, y) => (x - q.cx) * (x - q.cx) + (y - q.cy) * (y - q.cy) < rr, M = 4;
    const segs = []; let nAll = 0, nIn = 0, x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const r of rings) {
      for (let i = 0; i < r.length; i++) { nAll++; const p = r[i]; if (p[2] > 0.02 && p[0] >= 0 && p[0] <= W && p[1] >= 0 && p[1] <= H && inDisc(p[0], p[1])) nIn++; }
      for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const a = r[i], b = r[j]; if (a[2] <= 0.02 || b[2] <= 0.02) continue; segs.push([a[0], a[1], b[0], b[1]]); }
    }
    if (!segs.length) return null;
    for (const sg of segs) { x0 = Math.min(x0, sg[0], sg[2]); x1 = Math.max(x1, sg[0], sg[2]); y0 = Math.min(y0, sg[1], sg[3]); y1 = Math.max(y1, sg[1], sg[3]); }
    x0 = Math.max(x0, M); y0 = Math.max(y0, M); x1 = Math.min(x1, W - M); y1 = Math.min(y1, H - M);
    if (x1 <= x0 || y1 <= y0) return null;
    const inside = (x, y) => { let c = false; for (const s of segs) { const yi = s[1], yj = s[3]; if ((yi > y) !== (yj > y) && x < (s[2] - s[0]) * (y - yi) / (yj - yi) + s[0]) c = !c; } return c; };
    const clearance = (x, y) => { let m = Infinity; for (const s of segs) { const dx = s[2] - s[0], dy = s[3] - s[1], l2 = dx * dx + dy * dy; let t = l2 ? ((x - s[0]) * dx + (y - s[1]) * dy) / l2 : 0; t = t < 0 ? 0 : t > 1 ? 1 : t; const ex = s[0] + t * dx - x, ey = s[1] + t * dy - y, d = ex * ex + ey * ey; if (d < m) m = d; } return Math.sqrt(m); };
    let best = null, step = Math.max(1, Math.max(x1 - x0, y1 - y0) / 28);
    const cells = [], tryAt = (x, y, keep) => { if (x < x0 || x > x1 || y < y0 || y > y1 || !inDisc(x, y) || !inside(x, y)) return; const c = clearance(x, y); if (keep) cells.push({ x, y, c }); if (!best || c > best.c) best = { x, y, c }; };
    for (let y = y0 + step / 2; y <= y1; y += step) for (let x = x0 + step / 2; x <= x1; x += step) tryAt(x, y, true);
    if (!best) {   // a face thinner than a cell: its midpoints along the edges it shows (an even-odd test on a point of the boundary's own inside)
      for (const s of segs) for (const t of [0.25, 0.5, 0.75]) { const mx = s[0] + (s[2] - s[0]) * t, my = s[1] + (s[3] - s[1]) * t; for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) tryAt(mx + ox * 1.5, my + oy * 1.5); }
      if (!best) return null;
    }
    for (let k = 0; k < 3; k++) { const c0 = best, st = step / 2; step = st; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dx || dy) tryAt(c0.x + dx * st, c0.y + dy * st); }
    // a few more points inside, best first and apart from one another (the window tries them in turn when the first has no room for its name): those at least a third as far from the edge as the best, 10 px or an eighth of the face apart
    const pts = [[best.x, best.y, best.c]], sp = Math.max(10, Math.max(x1 - x0, y1 - y0) / 8);
    cells.sort((a, b) => b.c - a.c);
    for (const c of cells) { if (pts.length >= 12 || c.c < Math.max(1.5, best.c / 3)) break; if (pts.every((p) => Math.hypot(p[0] - c.x, p[1] - c.y) >= sp)) pts.push([c.x, c.y, c.c]); }
    return { anchor: [best.x, best.y], pts, clear: best.c, vis: nAll ? nIn / nAll : 0, piece: !!near };
  }
  function handleFaceAnchors(msg, post) {
    const rows = [];
    if (HIST) {
      const rot = msg.rot, radius = msg.radius, cx = msg.cx, cy = msg.cy, W = msg.W, H = msg.H, level = Math.max(0, Math.min(2, msg.level | 0));
      const proj = (v) => { const x = rot[0] * v[0] + rot[1] * v[1] + rot[2] * v[2], y = rot[3] * v[0] + rot[4] * v[1] + rot[5] * v[2], z = rot[6] * v[0] + rot[7] * v[1] + rot[8] * v[2]; return [cx + x * radius, cy - y * radius, z]; };
      const nearOf = new Map(); for (const n of msg.near || []) { const p = proj(unitOf(n.lon, n.lat)); if (p[2] > 0.02) nearOf.set(n.face, [p[0], p[1]]); }   // a face's `near`: where its principal's capital is on screen (a capital behind the globe gives none)
      for (const fi of msg.faces || []) {
        let r = null; try { r = HIST.T.faces[fi] ? histPole(fi, proj, W, H, { radius, cx, cy }, level, nearOf.get(fi)) : null; } catch (e) { r = null; }
        rows.push({ face: fi, anchor: r ? r.anchor : null, pts: r ? r.pts : [], clear: r ? r.clear : 0, vis: r ? r.vis : 0, km2: HIST.H.faceKm2 ? HIST.H.faceKm2[fi] : 0, piece: !!(r && r.piece) });
      }
    }
    post({ type: "face-anchors", seq: msg.seq, rows });
  }
  /* the label path of an alive face on screen: the area-weighted centre of its LOD 0 fill and the principal axis of its
     projected vertices, walked both ways from the centre while inside the projected rings (even-odd) — a straight run of
     up to five points, the polity's name laid along it in small capitals like a country's (§2.6) */
  function histLabelPath(fi, proj, W, H, q) {
    const L = histLevel(0), T = HIST.T;
    // the globe's disc (2b): a face at the limb had its name laid past the sphere's edge (the Kingdom of Kongo in the Americas view at
    // 1500); every candidate point and every reach stays inside the disc, a little short of the limb
    const rr = q && q.radius ? (q.radius * 0.985) * (q.radius * 0.985) : Infinity, dcx = q ? q.cx : 0, dcy = q ? q.cy : 0;
    const inDisc = (x, y) => (x - dcx) * (x - dcx) + (y - dcy) * (y - dcy) < rr;
    const rings = faceRings(L.T, T.faces[fi], 0).map((ring) => ring.map((i) => proj([L.pos[3 * i], L.pos[3 * i + 1], L.pos[3 * i + 2]])));
    const vis = rings.map((r) => r.filter((p) => p[2] > 0.02));
    if (!vis.some((r) => r.length >= 3)) return null;
    // the visible polygon's centroid and covariance (vertex-weighted; a fill's area needs the mesh — the vertices are enough for an axis).
    // "Visible" means ON SCREEN when at least three vertices are: a face reaching past the viewport (the Eastern Roman Empire at
    // 500 CE at 3 km/px, its Balkan third on screen and Anatolia, Syria and Egypt beyond the right edge) takes its name on the
    // part a reader sees, as a printed sheet names a country on the part the sheet shows; otherwise the margin box as before
    const inView = (x, y) => x >= 0 && x <= W && y >= 0 && y <= H && inDisc(x, y);
    const inBox = (x, y) => x >= -W && x <= 2 * W && y >= -H && y <= 2 * H && inDisc(x, y);
    let nIn = 0, nAll = 0; for (const r of rings) for (const p of r) { nAll++; if (p[2] > 0.02 && inView(p[0], p[1])) nIn++; }
    const visFrac = nAll ? nIn / nAll : 0;
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
    return { pts, len: a + b, anchor: [ox, oy], visFrac };
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
    const S = await bucketSegments(raw, bucketer), B = await bucketFaces(F.pos, F.idx, bucketer);
    const stats = { key: msg.key, z: level, segments: raw.length / 7, faceVertices: F.vertices, triangles: F.triangles, ms: Math.round(now() - t0), bytes: msg.buffer.byteLength };
    post({ type: "tile", key: msg.key, tile, segs: S.segs, segRange: S.segRange, segCap: S.segCap, segRangeA1: S.segRangeA1, segCapA1: S.segCapA1, facePos: F.pos, faceIdx: B.faceIdx, faceRange: B.faceRange, faceCap: B.faceCap, faceRangeA1: B.faceRangeA1 || null, faceCapA1: B.faceCapA1 || null, buckets: bucketer.count, stats },
      [S.segs.buffer, S.segRange.buffer, S.segCap.buffer, S.segRangeA1.buffer, S.segCapA1.buffer, F.pos.buffer, B.faceIdx.buffer, B.faceRange.buffer, B.faceCap.buffer].concat(B.faceRangeA1 ? [B.faceRangeA1.buffer, B.faceCapA1.buffer] : []));
  }
  function now() { return (typeof performance !== "undefined" ? performance.now() : Date.now()); }

  if (IN_WORKER) {
    root.onmessage = (e) => { const m = e.data; if (LOADING && m && !/^history/.test(m.type)) { HELD.push(m); return; } try { handle(m, (a, tr) => root.postMessage(a, tr || [])); } catch (err) { root.postMessage({ type: "error", message: String(err && err.stack || err) }); } };
  } else {
    // main-thread shim (file://, or a worker that failed to start): the same handler, called directly, yielding every
    // Y.every ms (see `tick`); the caller supplies `post` and may supply `progress(text, frac)` for its status line
    root.AtlasWorkerMain = {
      handle: (msg, post, progress) => { Y.shim = true; if (progress) Y.progress = progress; try { const p = handle(msg, (m) => post(m)); return p && typeof p.then === "function" ? p.catch((err) => post({ type: "error", message: String(err && err.stack || err) })) : Promise.resolve(); } catch (err) { post({ type: "error", message: String(err && err.stack || err) }); return Promise.resolve(); } },
      yieldEvery: (ms) => { Y.every = ms; },
      _debug: { buildSegments, unitVectors, triangulateFace, Sink, presenceMesh, presenceInset, presenceRings, makeFrame },   // for the chunk measurement in .claude/ (not used by the page)
    };
  }
})(typeof self !== "undefined" ? self : globalThis);
