#!/usr/bin/env node
/* build-land.js — step 1 of the Atlas v2 build: the land/sea partition and the present-day faces.

     node build-land.js            → out/land.json (pack.js turns it into atlas/data/topology.bin)
                                     out/snap-log.json

   PHASE 0 SCOPE (docs/atlas-v2-design.md §7): Natural Earth 10m only. The coastline theme is the
   land partition; the admin-0 countries are conflated onto it as faces. Later phases swap the
   coastline for OSM at the finest LOD and add Cliopatria steps, rivers and lakes; the structure
   built here — one planar topology on the sphere, shared arcs, per-vertex LOD ranks — is what they
   build on.

   WHAT HAPPENS, IN ORDER (each a section below):

     1. Coast rings. The coastline theme is LineStrings cut at the antimeridian; they are joined back
        into closed rings on the sphere (x = 180 is x = -180). Every ring is oriented LAND ON THE LEFT,
        using the admin polygons as the oracle for which side is land (the Caspian is a coast ring
        with sea inside; the area sign alone cannot know that), falling back to the signed area for a
        ring no polygon uses.
     2. Admin rings, conflated. Each polygon ring's vertices are looked up in the coast: an exact
        match is a coast vertex; a vertex within d1 of a coast vertex is snapped to it and logged; the
        rest are border vertices. Maximal runs of coast vertices are REPLACED by the coast path between
        their ends (§2.3 step 1), so a polygon that skips coast vertices still has the coast as its
        boundary. A run whose coast path is far longer than its chord is a border crossing water (a
        river mouth), not a coast run, and is split there.
     3. Junctions and arcs, TopoJSON-style: a vertex visited with different neighbours is a junction;
        rings are cut there and identical sequences (either direction) become one arc. Coast rings go
        first, so a coast arc is canonical and an admin run along it dedupes to it.
     4. Seams. A border arc with the same entity on both sides is the antimeridian cut (Russia, Fiji,
        Antarctica's spur to the pole) — not a border. It is removed and the rings spliced.
     5. LOD ranks. Visvalingam per arc (monotone effective area, endpoints fixed) gives every vertex the
        coarsest level it survives at; crossings between simplified arcs are repaired by re-adding the
        largest removed vertex until none remain. A ring too small for a level vanishes there (minLod).
     6. Write out/land.json and the snap log.

   NOTHING IS HAND-EDITED AFTERWARDS. A wrong line is fixed here or in the source pin.
*/
"use strict";
const fs = require("fs"), path = require("path");
const { ensureSource } = require("./fetch-sources.js");
const { SnapLog } = require("./lib/log.js");
const G = require("./lib/geo.js");
const { KIND } = require("./lib/format.js");

const HERE = __dirname;
const OUT = path.join(HERE, "out");
const QUANTUM = 2.5e-4;                     // degrees per unit: 28 m at the equator — 0.19 px at the design's deepest zoom (150 m/px, §Q-A6) and 0.03 px at the 1 km/px where this file's finest level is first drawn; measured in Phase 0 against 1e-4 (1.66 MB) and 2e-4 (1.47 MB)
const LOD_INTERVALS_M = [8000, 2500, 500];  // Visvalingam interval per level, coarsest first (see the note in docs §2.3 "as measured")
const SOURCE_IDS = ["ne-10m-coastline", "ne-10m-admin0"];
const SRC_COAST = 0, SRC_ADMIN = 1;
const TOLERANCE_M = { "ne-10m-admin0": 1000, "ne-10m-coastline": 1000 };   // §2.3 step 4: present-day sources, 1 km
const U = (deg) => Math.round(deg / QUANTUM);
const X180 = U(180);

const t0 = Date.now();
const say = (m) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${m}`);

/* ---------- read the sources (verified against their pins) ---------- */
async function readSources() {
  const ms = require("mapshaper");
  const coastSrc = ensureSource("ne-10m-coastline"), adminSrc = ensureSource("ne-10m-admin0");
  const toGeo = async (shp) => {
    const r = await ms.applyCommands(`-i "${shp}" -o out.json format=geojson precision=0.0000001`);
    return JSON.parse(Buffer.from(r["out.json"]).toString());
  };
  const coast = await toGeo(path.join(coastSrc.dir, "ne_10m_coastline.shp"));
  const admin = await toGeo(path.join(adminSrc.dir, "ne_10m_admin_0_countries.shp"));
  return { coast, admin, versions: { coast: coastSrc.entry.version, admin: adminSrc.entry.version } };
}

/* ---------- 1. coast rings ---------- */
// a point as quantised ints with x in [-180, 180)
/* a point as quantised ints with x in [-180, 180). A longitude within SEAM_TOL of ±180 is put ON the
   antimeridian: both themes cut their polygons there and the cut lands at 179.999 as often as at
   180 (Fiji's pieces, measured), and a seam that is not one line is two borders no face shares. */
const SEAM_TOL = Math.round(0.0015 / QUANTUM);
let seamSnaps = 0;
const Y90 = U(90);
function qpt(p) {
  let x = U(p[0]), y = U(p[1]);
  if (Math.abs(Math.abs(x) - X180) <= SEAM_TOL && Math.abs(x) !== X180) { x = x < 0 ? -X180 : X180; seamSnaps++; }
  if (x >= X180) x -= 2 * X180; if (x < -X180) x += 2 * X180;
  if (Math.abs(y) >= Y90) { y = y < 0 ? -Y90 : Y90; x = 0; }   // every longitude at a pole is one point
  return [x, y];
}
// consecutive duplicates, including the wrap-around, after spikes have been cut
function dedupeRing(r) {
  const out = [];
  for (const p of r) { const q = out[out.length - 1]; if (!q || q[0] !== p[0] || q[1] !== p[1]) out.push(p); }
  while (out.length > 1 && out[0][0] === out[out.length - 1][0] && out[0][1] === out[out.length - 1][1]) out.pop();
  return out;
}
/* spikes (x, y, x → x) and the duplicates they leave, until nothing changes: a spur to the pole is
   [a, b, pole, b, a] and needs three rounds. `eq` compares two entries; returns the count removed. */
function cutSpikes(r, eq) {
  let removed = 0;
  for (let changed = true; changed;) {
    changed = false;
    let n = r.length;
    for (let i = 0; i < n && n >= 4; i++) { const a = r[(i - 1 + n) % n], c = r[(i + 1) % n]; if (eq(a, c)) { r.splice(i, 1); removed++; changed = true; n--; i--; } }
    // duplicates, including the wrap-around
    for (let i = r.length - 1; i > 0; i--) if (eq(r[i], r[i - 1])) { r.splice(i, 1); changed = true; }
    while (r.length > 1 && eq(r[0], r[r.length - 1])) { r.pop(); changed = true; }
  }
  return removed;
}
const eqPt = (a, b) => a[0] === b[0] && a[1] === b[1];
const pkey = (x, y) => x * 4000000 + y;   // unique: |y| ≤ 900000 < 4,000,000

function coastRings(coastGeo, log) {
  const lines = [];
  for (const f of coastGeo.features) {
    const g = f.geometry; if (!g) continue;
    for (const l of (g.type === "LineString" ? [g.coordinates] : g.coordinates)) {
      const pts = []; let last = null;
      for (const p of l) { const q = qpt(p); const k = pkey(q[0], q[1]); if (k !== last) { pts.push(q); last = k; } }
      if (pts.length >= 2) lines.push(pts);
    }
  }
  // join open lines end to start (either orientation) until every chain closes
  const byStart = new Map(), byEnd = new Map();
  const startK = (l) => pkey(l[0][0], l[0][1]), endK = (l) => pkey(l[l.length - 1][0], l[l.length - 1][1]);
  const open = [], rings = [];
  for (const l of lines) (startK(l) === endK(l) ? rings : open).push(l);
  /* THE ANTIMERIDIAN DOES NOT MEET ITSELF in Natural Earth: the coast is cut at ±180 and the two
     sides miss by 22–156 m (measured, 16 endpoints: Chukotka, Wrangel, Fiji's islands). An endpoint
     on the seam with no exact partner is joined to the nearest other seam endpoint within the
     source's tolerance by moving it onto that one, and every such move is a logged snap. */
  { const endsAt = new Map(); const addE = (k, e) => { let a = endsAt.get(k); if (!a) endsAt.set(k, a = []); a.push(e); };
    open.forEach((l, i) => { addE(startK(l), { i, w: 0 }); addE(endK(l), { i, w: 1 }); });
    const loose = [];
    for (const [k, es] of endsAt) if (es.length === 1) { const e = es[0]; const p = e.w ? open[e.i][open[e.i].length - 1] : open[e.i][0]; if (p[0] === -X180) loose.push(Object.assign(e, { p })); }
    const done = new Set();
    for (const e of loose) {
      if (done.has(e)) continue;
      let best = null;
      for (const f of loose) { if (f === e || done.has(f) || (f.i === e.i && f.w === e.w)) continue; const dy = Math.abs(f.p[1] - e.p[1]); if (!best || dy < best.dy) best = { f, dy }; }
      if (!best) continue;
      const metres = best.dy * QUANTUM * (Math.PI / 180) * 6371008.8;
      if (metres > TOLERANCE_M["ne-10m-coastline"]) continue;
      const f = best.f;
      log.snap({ source: "ne-10m-coastline", kind: "seam-endpoint-joined", from: [f.p[0] * QUANTUM, f.p[1] * QUANTUM], to: [e.p[0] * QUANTUM, e.p[1] * QUANTUM], metres });
      f.p[1] = e.p[1];   // in place: f.p IS the line's endpoint array
      done.add(e); done.add(f);
    }
  }
  const push = (m, k, i) => { let a = m.get(k); if (!a) m.set(k, a = []); a.push(i); };
  open.forEach((l, i) => { push(byStart, startK(l), i); push(byEnd, endK(l), i); });
  const used = new Uint8Array(open.length);
  let joined = 0;
  for (let i = 0; i < open.length; i++) {
    if (used[i]) continue;
    used[i] = 1;
    let chain = open[i].slice();
    for (let guard = 0; guard < 10000; guard++) {
      const sk = startK(chain), ek = endK(chain);
      if (sk === ek) break;
      let next = (byStart.get(ek) || []).find((j) => !used[j]);
      if (next != null) { used[next] = 1; chain = chain.concat(open[next].slice(1)); joined++; continue; }
      next = (byEnd.get(ek) || []).find((j) => !used[j]);
      if (next != null) { used[next] = 1; chain = chain.concat(open[next].slice().reverse().slice(1)); joined++; continue; }
      break;
    }
    if (startK(chain) !== endK(chain)) throw new Error(`coast chain from ${chain[0]} does not close (${chain.length} vertices)`);
    rings.push(chain);
  }
  log.event("coast-lines-joined", { pieces: open.length, joins: joined });
  // drop the closing duplicate; drop any ring that collapsed
  const out = [];
  let spikes = 0;
  for (let r of rings) {
    r = r.slice(0, -1);
    spikes += cutSpikes(r, eqPt);
    if (r.length >= 3) out.push(r); else log.event("coast-ring-dropped-degenerate", { vertices: r.length });
  }
  if (spikes) log.event("coast-spikes-removed", { count: spikes });
  log.event("seam-vertices-snapped-to-meridian", { count: seamSnaps });
  return out;
}

// signed planar area in the unwrapped lon/lat plane (units²); also the total longitude turn
function ringAreaAndTurn(r) {
  let area = 0, turn = 0, px = r[0][0], ux = px;
  const n = r.length;
  const xs = new Array(n);
  for (let i = 0; i < n; i++) {
    let dx = r[i][0] - px; if (dx > X180) dx -= 2 * X180; else if (dx < -X180) dx += 2 * X180;
    ux += dx; xs[i] = ux; turn += dx; px = r[i][0];
  }
  let dxc = r[0][0] - px; if (dxc > X180) dxc -= 2 * X180; else if (dxc < -X180) dxc += 2 * X180; turn += dxc;
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; area += xs[i] * r[j][1] - xs[j] * r[i][1]; }
  return { area: area / 2, turn };
}
function meanLat(r) { let s = 0; for (const p of r) s += p[1]; return s / r.length; }

/* ---------- vertex registry ---------- */
function Registry() {
  const ids = new Map();           // pkey → id
  const X = [], Y = [];            // id → coords
  return {
    X, Y,
    get(x, y) { return ids.get(pkey(x, y)); },
    add(x, y) { const k = pkey(x, y); let id = ids.get(k); if (id == null) { id = X.length; ids.set(k, id); X.push(x); Y.push(y); } return id; },
    size() { return X.length; },
  };
}

/* ---------- 2. admin rings conflated ---------- */
function nearestCoastVertex(x, y, index, reg, maxM) {
  // index: Map cell → coast ids, cell size 0.02° (2.2 km) so a 1 km search looks at 3×3 cells
  const C = Math.round(0.02 / QUANTUM);
  const cx = Math.floor(x / C), cy = Math.floor(y / C);
  const p = G.vec(x, y, QUANTUM);
  let best = -1, bestM = maxM;
  for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
    const arr = index.get((cx + i) * 100003 + (cy + j)); if (!arr) continue;
    for (const id of arr) { const m = G.chordMetres(p, G.vec(reg.X[id], reg.Y[id], QUANTUM)); if (m < bestM) { bestM = m; best = id; } }
  }
  return best < 0 ? null : { id: best, metres: bestM };
}

function main() {
  return readSources().then(({ coast, admin, versions }) => {
    const log = new SnapLog("build-land", TOLERANCE_M);
    say(`sources read: coastline ${versions.coast}, admin-0 ${versions.admin}`);

    /* 1 — coast rings into the registry */
    const rings = coastRings(coast, log);
    const reg = Registry();
    const coastRing = [];            // ring → [ids]
    const coastOf = new Map();       // id → { ring, index } (first occurrence)
    rings.forEach((r, ri) => {
      const ids = r.map(([x, y]) => reg.add(x, y));
      coastRing.push(ids);
      ids.forEach((id, i) => { if (!coastOf.has(id)) coastOf.set(id, { ring: ri, index: i }); else log.event("coast-vertex-shared-by-rings", { id }); });
    });
    const nCoastV = reg.size();
    say(`coast: ${rings.length} rings, ${nCoastV} distinct vertices`);
    const coastIndex = new Map();
    { const C = Math.round(0.02 / QUANTUM);
      for (let id = 0; id < nCoastV; id++) { const k = Math.floor(reg.X[id] / C) * 100003 + Math.floor(reg.Y[id] / C); let a = coastIndex.get(k); if (!a) coastIndex.set(k, a = []); a.push(id); } }

    /* 2 — admin rings, conflated onto the coast
       Three passes, because a projected vertex is INSERTED into a coast ring and every later lookup
       must see the ring as it then is:
         A. quantise, drop spikes and degenerate rings, orient, and count how many ENTITIES use each
            vertex — a vertex two polygons share is a border vertex by definition, whatever its
            distance from the shore (Monaco's, Gibraltar's); only the two ENDS of such a border may be
            coastal, and they are, when they sit within d1 of a coast segment.
         B. decide which non-exact vertices are coastal and project them onto the nearest coast
            SEGMENT (the design's step 1: "projected onto the coast arc"), inserting the projections
            into the coast rings. Besides a shared border's ends, a run of vertices used by ONE polygon
            only, bounded by exact coast vertices and lying wholly within d1, is a coast stretch the
            admin theme digitised separately (the two Natural Earth themes are different releases);
            a run with any vertex beyond d1 is a border run and is left alone.
         C. build the rings: coast runs become coast paths; a ring with no coastal vertex at all is an
            island the admin theme drew differently and takes the coast rings it contains (§2.3:
            "islands wholly inside the polygon take their complete coast rings"), or, containing none,
            is dropped as land the partition does not know. */
    const entities = [], entityIndex = new Map();
    const faces = [];                // { entity, rings: [[ids] | { adopt: coastRingIndex }] } before arc cutting
    const traversal = new Map();     // coast ring → { fwd, back, votes } from land-left admin rings
    const D1 = TOLERANCE_M["ne-10m-admin0"];
    let projected = 0, runsReplaced = 0, runsSplitAtChord = 0, borderV = 0, spikes = 0, adopted = 0, droppedRings = 0, degenerate = 0;

    /* A */
    const prepared = [];             // { eid, ent, pts, hole, keys }
    const keyEntities = new Map();   // pkey → Set(entity)
    for (const f of admin.features) {
      const P = f.properties, g = f.geometry; if (!g) continue;
      const a3 = String(P.ADM0_A3 || P.ISO_A3 || P.NAME).toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const eid = "adm0:" + a3;
      if (!entityIndex.has(eid)) {
        entityIndex.set(eid, entities.length);
        entities.push({ id: eid, name: P.ADMIN || P.NAME, kind: "polity", qid: P.WIKIDATAID || null, iso3: P.ISO_A3 && P.ISO_A3 !== "-99" ? P.ISO_A3 : null, a3: P.ADM0_A3, type: P.TYPE, sovereign: P.SOV_A3 });
      }
      const ent = entityIndex.get(eid);
      const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
      polys.forEach((poly) => poly.forEach((ring, ri) => {
        let pts = []; let last = null;
        for (const p of ring) { const q = qpt(p); const k = pkey(q[0], q[1]); if (k !== last) { pts.push(q); last = k; } }
        if (pts.length > 1 && pkey(pts[0][0], pts[0][1]) === pkey(pts[pts.length - 1][0], pts[pts.length - 1][1])) pts.pop();
        // spikes: x, y, x → x (a zero-area excursion the junction logic would turn into a two-vertex loop)
        spikes += cutSpikes(pts, eqPt);
        if (pts.length < 3) { degenerate++; return; }
        const { area } = ringAreaAndTurn(pts);
        const wantCCW = ri === 0;
        if ((area > 0) !== wantCCW) pts.reverse();
        const keys = pts.map(([x, y]) => pkey(x, y));
        for (const k of keys) { let s = keyEntities.get(k); if (!s) keyEntities.set(k, s = new Set()); s.add(ent); }
        prepared.push({ eid, ent, pts, hole: ri > 0, keys });
      }));
    }
    say(`admin: ${prepared.length} rings prepared (${spikes} spikes removed, ${degenerate} degenerate rings dropped)`);

    /* B — coast segment index and projection */
    const SEG_CELL = Math.round(0.02 / QUANTUM);
    const segIndex = new Map();
    const segKey = (cx, cy) => cx * 100003 + cy;
    coastRing.forEach((ids, ri) => {
      const L = ids.length;
      for (let i = 0; i < L; i++) {
        const a = ids[i], b = ids[(i + 1) % L];
        const x1 = reg.X[a], y1 = reg.Y[a], x2 = reg.X[b], y2 = reg.Y[b];
        if (Math.abs(x2 - x1) > X180) continue;   // the seam-joined segment: never a projection target
        for (let cx = Math.floor(Math.min(x1, x2) / SEG_CELL); cx <= Math.floor(Math.max(x1, x2) / SEG_CELL); cx++)
          for (let cy = Math.floor(Math.min(y1, y2) / SEG_CELL); cy <= Math.floor(Math.max(y1, y2) / SEG_CELL); cy++) {
            const k = segKey(cx, cy); let arr = segIndex.get(k); if (!arr) segIndex.set(k, arr = []); arr.push(ri, i);
          }
      }
    });
    const KM_PER_UNIT = QUANTUM * 111.32;
    function nearestCoastSegment(x, y, maxM) {
      const cx = Math.floor(x / SEG_CELL), cy = Math.floor(y / SEG_CELL);
      const ky = KM_PER_UNIT, kx = KM_PER_UNIT * Math.cos(y * QUANTUM * Math.PI / 180);
      let best = null;
      for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
        const arr = segIndex.get(segKey(cx + i, cy + j)); if (!arr) continue;
        for (let k = 0; k < arr.length; k += 2) {
          const ri = arr[k], si = arr[k + 1], ids = coastRing[ri], L = ids.length;
          const a = ids[si], b = ids[(si + 1) % L];
          const ax = (reg.X[a] - x) * kx, ay = (reg.Y[a] - y) * ky, bx = (reg.X[b] - x) * kx, by = (reg.Y[b] - y) * ky;
          const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
          let t = l2 > 0 ? -(ax * dx + ay * dy) / l2 : 0; t = Math.max(0, Math.min(1, t));
          const px = ax + t * dx, py = ay + t * dy, m = Math.hypot(px, py) * 1000;
          if (m < maxM && (!best || m < best.metres)) best = { ring: ri, seg: si, t, metres: m, x: Math.round(reg.X[a] + t * (reg.X[b] - reg.X[a])), y: Math.round(reg.Y[a] + t * (reg.Y[b] - reg.Y[a])) };
        }
      }
      return best;
    }
    function coastPathMetresB(ri, i, j, dir) {
      const ring = coastRing[ri], L = ring.length; let m = 0;
      const steps = ((dir * (j - i)) % L + L) % L;
      for (let k = 0; k < steps; k++) { const p = ring[((i + dir * k) % L + L) % L], q = ring[((i + dir * (k + 1)) % L + L) % L]; m += G.chordMetres(G.vec(reg.X[p], reg.Y[p], QUANTUM), G.vec(reg.X[q], reg.Y[q], QUANTUM)); }
      return m;
    }
    const isCoastV = new Uint8Array(reg.size() + 2000000);   // room for every border vertex and projection that follows
    for (let id = 0; id < nCoastV; id++) isCoastV[id] = 1;
    const insertions = new Map();    // ring → [{ seg, t, id }]
    const projMemo = new Map();      // pkey → id | null
    // the coast's own crossings of the antimeridian, by latitude: a polygon's seam end snaps to one of these
    const seamCoast = []; for (let id = 0; id < nCoastV; id++) if (reg.X[id] === -X180) seamCoast.push(id);
    function project(x, y, eid, why) {
      const k = pkey(x, y);
      if (projMemo.has(k)) return projMemo.get(k);
      let id = null;
      if (x === -X180) {
        let best = null; for (const c of seamCoast) { const m = Math.abs(reg.Y[c] - y) * QUANTUM * 111320; if (m <= D1 && (!best || m < best.m)) best = { c, m }; }
        if (best) { id = best.c; projected++; log.snap({ source: "ne-10m-admin0", kind: "seam-end→coast-crossing", from: [x * QUANTUM, y * QUANTUM], to: [reg.X[id] * QUANTUM, reg.Y[id] * QUANTUM], metres: best.m, entity: eid }); projMemo.set(k, id); return id; }
      }
      const near = nearestCoastSegment(x, y, D1);
      if (near) {
        const ids = coastRing[near.ring], L = ids.length;
        const s0 = ids[near.seg], s1 = ids[(near.seg + 1) % L];
        const close = (v) => Math.abs(reg.X[v] - near.x) <= 2 && Math.abs(reg.Y[v] - near.y) <= 2;   // within two quanta (~55 m): the vertex itself
        if (near.t < 1e-6 || close(s0)) id = s0;
        else if (near.t > 1 - 1e-6 || close(s1)) id = s1;
        else {
          const existing = reg.get(near.x, near.y);
          if (existing != null && isCoastV[existing]) id = existing;
          else {
            id = reg.add(near.x, near.y); isCoastV[id] = 1;
            let arr = insertions.get(near.ring); if (!arr) insertions.set(near.ring, arr = []); arr.push({ seg: near.seg, t: near.t, id });
          }
        }
        projected++;
        log.snap({ source: "ne-10m-admin0", kind: why, from: [x * QUANTUM, y * QUANTUM], to: [reg.X[id] * QUANTUM, reg.Y[id] * QUANTUM], metres: near.metres, entity: eid });
      }
      projMemo.set(k, id);
      return id;
    }
    for (const R of prepared) {
      const { pts, keys, eid } = R, n = pts.length;
      const exact = pts.map(([x, y]) => { const id = reg.get(x, y); return id != null && id < nCoastV ? id : -1; });
      const shared = keys.map((k) => keyEntities.get(k).size >= 2);
      R.exact = exact; R.coastId = exact.slice();
      // a non-exact vertex beside an exact coast vertex is a border's end on the shore, whether the
      // neighbour shares it (most borders) or not (the antimeridian seam, which two rings of ONE
      // entity share; a neighbour digitised apart): it is projected if within d1
      for (let i = 0; i < n; i++) {
        if (exact[i] >= 0) continue;
        if (exact[(i + 1) % n] >= 0 || exact[(i - 1 + n) % n] >= 0) { const id = project(pts[i][0], pts[i][1], eid, "border-end→coast-segment"); if (id != null) R.coastId[i] = id; }
      }
      // runs of unshared, non-exact vertices bounded by coastal vertices, wholly within d1
      let start = -1; for (let i = 0; i < n; i++) if (R.coastId[i] >= 0) { start = i; break; }
      const nearOf = (i) => { const k = keys[i]; if (!projMemo.has("n" + k)) projMemo.set("n" + k, nearestCoastSegment(pts[i][0], pts[i][1], D1)); return projMemo.get("n" + k); };
      const tryRun = (idx) => {
        if (!idx.length || idx.some((i) => shared[i] || !nearOf(i))) return;
        /* the run must FOLLOW the coast, not merely lie near it: its projections land on one coast
           ring, in one direction, and the coast path between the first and the last is about as long
           as the run (Ceuta's land border is within a kilometre of the shore at every vertex and is
           still a border: its path round the peninsula's coast is three times the border's length) */
        const near = idx.map((i) => nearOf(i));
        const ri = near[0].ring;
        if (near.some((q) => q.ring !== ri)) return;
        const L = coastRing[ri].length;
        let net = 0, runM = 0;
        for (let k = 1; k < near.length; k++) {
          let d = ((near[k].seg - near[k - 1].seg) % L + L) % L; if (d > L / 2) d -= L;
          net += d;
          runM += G.chordMetres(G.vec(pts[idx[k - 1]][0], pts[idx[k - 1]][1], QUANTUM), G.vec(pts[idx[k]][0], pts[idx[k]][1], QUANTUM));
        }
        if (near.length > 1) {
          const dir = net >= 0 ? 1 : -1;
          const pathM = coastPathMetresB(ri, near[0].seg, near[near.length - 1].seg, dir);
          if (pathM > 1.5 * runM + 1000) { log.event("coast-run-not-following", { entity: eid, vertices: idx.length, runM: Math.round(runM), pathM: Math.round(pathM), at: [pts[idx[0]][0] * QUANTUM, pts[idx[0]][1] * QUANTUM] }); return; }
        }
        for (const i of idx) { const id = project(pts[i][0], pts[i][1], eid, "coast-run→coast-segment"); if (id != null) R.coastId[i] = id; }
      };
      if (start < 0) {
        // no coastal vertex at all: a whole ring within d1 of the coast is a slightly shifted island
        tryRun(pts.map((_, i) => i));
      } else {
        let run = [];
        for (let s = 1; s <= n; s++) { const i = (start + s) % n; if (R.coastId[i] >= 0) { tryRun(run); run = []; } else run.push(i); }
      }
    }
    // insert the projections into their coast rings, in order along each segment
    let inserted = 0;
    for (const [ri, arr] of insertions) {
      const ids = coastRing[ri], out = [];
      const bySeg = new Map(); for (const ins of arr) { let a = bySeg.get(ins.seg); if (!a) bySeg.set(ins.seg, a = []); a.push(ins); }
      for (let i = 0; i < ids.length; i++) { out.push(ids[i]); const a = bySeg.get(i); if (a) { a.sort((p, q) => p.t - q.t); for (const ins of a) { out.push(ins.id); inserted++; } } }
      coastRing[ri] = out;
    }
    coastOf.clear();
    coastRing.forEach((ids, ri) => ids.forEach((id, i) => { if (!coastOf.has(id)) coastOf.set(id, { ring: ri, index: i }); }));
    say(`conflation: ${projected} vertices projected onto the coast (${inserted} new coast vertices inserted)`);

    /* coast ring centroids and boxes, for island adoption */
    const ringBox = coastRing.map((ids) => { let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, sx = 0, sy = 0; const bx = reg.X[ids[0]]; for (const id of ids) { let x = reg.X[id]; if (x - bx > X180) x -= 2 * X180; else if (x - bx < -X180) x += 2 * X180; const y = reg.Y[id]; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; sx += x; sy += y; } return { x0, x1, y0, y1, cx: sx / ids.length, cy: sy / ids.length }; });
    const ringAdopted = new Uint8Array(coastRing.length);
    function pointInRing(px, py, pts) {
      // planar even-odd in the ring's own unwrapped frame
      const bx = pts[0][0]; let inside = false; const n = pts.length;
      const ux = (x) => { if (x - bx > X180) x -= 2 * X180; else if (x - bx < -X180) x += 2 * X180; return x; };
      let qx = ux(px);
      for (let i = 0, j = n - 1; i < n; j = i++) {
        const xi = ux(pts[i][0]), yi = pts[i][1], xj = ux(pts[j][0]), yj = pts[j][1];
        if ((yi > py) !== (yj > py) && qx < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside;
      }
      return inside;
    }

    /* C — rings */
    for (const R of prepared) {
      const { pts, eid, ent, coastId } = R, n = pts.length;
      const ids = pts.map(([x, y], i) => { if (coastId[i] >= 0) return coastId[i]; borderV++; return reg.add(x, y); });
      const isCoast = (id) => isCoastV[id] === 1;
      let face = faces.find((f) => f.entity === ent && f.feature === R.eid);
      if (!face) { face = { entity: ent, feature: R.eid, rings: [] }; faces.push(face); }
      if (!ids.some(isCoast) && !R.keys.some((k) => keyEntities.get(k).size >= 2)) {
        // no vertex on the coast and none shared with a neighbour: not an inland ring (a landlocked
        // country, an enclave hole — those share every vertex) but an island the admin theme drew
        // where the coastline theme has other rings: take the coast rings inside it
        let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity; const bx = pts[0][0];
        for (const p of pts) { let x = p[0]; if (x - bx > X180) x -= 2 * X180; else if (x - bx < -X180) x += 2 * X180; if (x < x0) x0 = x; if (x > x1) x1 = x; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
        let took = 0;
        coastRing.forEach((cids, ri) => {
          if (ringAdopted[ri]) return;
          const b = ringBox[ri]; let cx = b.cx; if (cx - bx > X180) cx -= 2 * X180; else if (cx - bx < -X180) cx += 2 * X180;
          if (cx < x0 || cx > x1 || b.cy < y0 || b.cy > y1) return;
          if (!pointInRing(b.cx, b.cy, pts)) return;
          ringAdopted[ri] = 1; took++; adopted++;
          face.rings.push({ adopt: ri });
        });
        if (!took) { droppedRings++; log.event("admin-ring-without-land", { entity: eid, vertices: n, at: [pts[0][0] * QUANTUM, pts[0][1] * QUANTUM] }); }
        else log.event("island-rings-adopted", { entity: eid, rings: took });
        continue;
      }
      // runs of coast vertices → coast paths. A consecutive pair whose BOTH vertices another entity also
      // uses is one of that neighbour's border edges (the 49th parallel reaching Boundary Bay on either
      // side of Point Roberts; Gibraltar's fence) and ends a run even when both ends sit on the coast.
      const borderEdge = (i) => { const A = keyEntities.get(R.keys[i]), B = keyEntities.get(R.keys[(i + 1) % n]); if (A.size < 2 || B.size < 2) return false; for (const e of A) if (e !== ent && B.has(e)) return true; return false; };
      let start = ids.findIndex((id) => !isCoast(id));
      const out = [];
      const whole = start < 0 && !R.keys.some((k, i) => borderEdge(i));
      if (whole) expandRun(ids.slice(), true);
      else {
        if (start < 0) start = 0;
        let i = 0;
        while (i < n) {
          const idx = (start + i) % n, id = ids[idx];
          if (!isCoast(id)) { out.push(id); i++; continue; }
          const run = [];
          while (i < n) { const j = (start + i) % n; if (!isCoast(ids[j])) break; run.push(ids[j]); i++; if (borderEdge(j)) break; }
          expandRun(run, false);
        }
      }
      function expandRun(run, whole) {
        const pieces = [[run[0]]];
        for (let k = 1; k < run.length; k++) {
          const a = coastOf.get(run[k - 1]), b = coastOf.get(run[k]);
          let ok = a.ring === b.ring;
          if (ok) {
            const L = coastRing[a.ring].length;
            let d = ((b.index - a.index) % L + L) % L; if (d > L / 2) d -= L;
            if (Math.abs(d) > 1) {
              const chord = G.chordMetres(G.vec(reg.X[run[k - 1]], reg.Y[run[k - 1]], QUANTUM), G.vec(reg.X[run[k]], reg.Y[run[k]], QUANTUM));
              const pathM = coastPathMetres(a.ring, a.index, b.index, d > 0 ? 1 : -1);
              // a coast run skips vertices now and then; a border crossing water (a river mouth, a
              // fence across an isthmus) has a coast path many times its chord
              if (pathM > 2 * chord + 1000) { ok = false; runsSplitAtChord++; log.event("coast-run-split-at-chord", { entity: eid, chordM: Math.round(chord), pathM: Math.round(pathM), at: [reg.X[run[k - 1]] * QUANTUM, reg.Y[run[k - 1]] * QUANTUM] }); }
            }
          }
          if (ok) pieces[pieces.length - 1].push(run[k]); else pieces.push([run[k]]);
        }
        for (const piece of pieces) {
          if (piece.length < 2) { out.push(piece[0]); continue; }
          const a = coastOf.get(piece[0]), b = coastOf.get(piece[piece.length - 1]);
          const L = coastRing[a.ring].length, ring = coastRing[a.ring];
          /* the direction along the coast ring is the NET displacement of the piece, never a vote:
             a piece stepping −3, +1 nets −2 and must be walked backward (a vote tied and walked it
             forward, which is the long way round — Costa Rica's ring once circled South America) */
          let net = 0;
          for (let k = 1; k < piece.length; k++) {
            const p = coastOf.get(piece[k - 1]).index, q = coastOf.get(piece[k]).index;
            let d = ((q - p) % L + L) % L; if (d > L / 2) d -= L;
            net += d;
          }
          const dir = net >= 0 ? 1 : -1;
          { // a path many times longer than the piece is a lap round the ring, not a coast run: refuse it
            const steps = ((dir * (b.index - a.index)) % L + L) % L;
            if (steps > 200 && steps > 2 * piece.length) log.event("coast-run-long-path", { entity: eid, pieceLen: piece.length, steps, L, net, from: a.index, to: b.index, at: [reg.X[piece[0]] * QUANTUM, reg.Y[piece[0]] * QUANTUM] });
            if (steps > 4 * piece.length + 50) { log.event("coast-run-lap-refused", { entity: eid, pieceLen: piece.length, steps, L, at: [reg.X[piece[0]] * QUANTUM, reg.Y[piece[0]] * QUANTUM] }); for (const id of piece) out.push(id); continue; }
          }
          const v = traversal.get(a.ring) || { fwd: 0, back: 0, votes: [] }; if (dir > 0) v.fwd++; else v.back++; v.votes.push({ entity: eid, len: piece.length, dir, from: a.index, to: b.index, hole: R.hole }); traversal.set(a.ring, v);
          // the path itself is walked AFTER the coast rings are oriented (below): a run that walks a
          // ring against its land-left direction is a polygon crossing water (Natural Earth's Costa
          // Rica and Nicaragua overlap on the San Juan's bar) and becomes a chord, not coast
          runsReplaced++;
          out.push({ piece: true, ring: a.ring, from: a.index, to: b.index, dir, ids: piece, entity: eid });
        }
      }
      function coastPathMetres(ri, i, j, dir) {
        const ring = coastRing[ri], L = ring.length; let m = 0;
        const steps = ((dir * (j - i)) % L + L) % L;
        for (let k = 0; k < steps; k++) { const p = ring[((i + dir * k) % L + L) % L], q = ring[((i + dir * (k + 1)) % L + L) % L]; m += G.chordMetres(G.vec(reg.X[p], reg.Y[p], QUANTUM), G.vec(reg.X[q], reg.Y[q], QUANTUM)); }
        return m;
      }
      if (out.length) face.rings.push(out);
    }
    for (let i = faces.length - 1; i >= 0; i--) if (!faces[i].rings.length) faces.splice(i, 1);
    say(`admin: ${admin.features.length} features → ${entities.length} entities, ${faces.length} faces; ${borderV} border vertices, ${runsReplaced} coast runs replaced, ${runsSplitAtChord} split at a chord, ${adopted} island rings adopted, ${droppedRings} rings without land dropped`);

    /* orient coast rings land-left by the admin oracle, else by area */
    let flipped = 0, oracleless = 0, conflicted = 0;
    coastRing.forEach((ids, ri) => {
      const v = traversal.get(ri);
      let flip;
      if (v && (v.fwd || v.back)) {
        if (v.fwd && v.back) { conflicted++; const minority = v.fwd >= v.back ? -1 : 1; log.event("coast-ring-direction-conflict", { ring: ri, fwd: v.fwd, back: v.back, minority: v.votes.filter((x) => x.dir === minority).slice(0, 5) }); }
        flip = v.back > v.fwd;
      } else {
        oracleless++;
        log.event("coast-ring-without-oracle", { ring: ri, vertices: ids.length, at: [reg.X[ids[0]] * QUANTUM, reg.Y[ids[0]] * QUANTUM] });
        const r = ids.map((id) => [reg.X[id], reg.Y[id]]);
        const { area, turn } = ringAreaAndTurn(r);
        if (Math.abs(turn) > X180) flip = meanLat(r) < 0 ? turn > 0 : turn < 0;   // polar ring: land-left = westward around the south pole
        else flip = area < 0;
      }
      if (flip) { flipped++; log.event("coast-ring-flipped", { ring: ri, reason: v ? "admin traversal" : "signed area" }); }
      coastRing[ri] = { ids: flip ? ids.slice().reverse() : ids, orig: ids, flipped: flip };
    });
    say(`coast orientation: ${flipped} rings reversed to land-left, ${oracleless} without an admin oracle, ${conflicted} conflicts`);
    /* materialise the face rings now that every coast ring has its land-left direction: a coast run
       becomes the coast path between its ends when it walks the ring the land-left way; against it,
       it is a chord across water (logged); a run that returns to its own first vertex is the whole
       ring only when it spans it (Antarctica from the seam crossing round to it) and a spur otherwise */
    let chords = 0, loops = 0;
    for (const f of faces) f.rings = f.rings.map((r) => {
      if (!Array.isArray(r)) return coastRing[r.adopt].ids.slice();   // an adopted island ring, oriented
      const out = [];
      for (const it of r) {
        if (typeof it === "number") { out.push(it); continue; }
        const C = coastRing[it.ring], orig = C.orig, L = orig.length;
        const agrees = (it.dir > 0) !== C.flipped;
        if (!agrees) { chords++; log.event("coast-run-against-orientation", { entity: it.entity, vertices: it.ids.length, at: [reg.X[it.ids[0]] * QUANTUM, reg.Y[it.ids[0]] * QUANTUM] }); out.push(...it.ids); continue; }
        let steps = ((it.dir * (it.to - it.from)) % L + L) % L;
        if (steps === 0) { if (it.ids.length >= 0.9 * L) { steps = L; loops++; } else { out.push(...it.ids); continue; } }
        for (let k = 0; k <= steps; k++) out.push(orig[((it.from + it.dir * k) % L + L) % L]);
      }
      const clean = [];
      for (const id of out) if (clean.length === 0 || clean[clean.length - 1] !== id) clean.push(id);
      while (clean.length > 1 && clean[0] === clean[clean.length - 1]) clean.pop();
      // a run that steps onto the coast and straight back is a spur of coast ids: cut it like any spike
      const spurs = cutSpikes(clean, (a, b) => a === b);
      if (spurs) log.event("ring-spurs-cut", { count: spurs });
      return clean;
    }).filter((r) => r.length >= 3);
    for (let i = faces.length - 1; i >= 0; i--) if (!faces[i].rings.length) faces.splice(i, 1);
    say(`rings materialised: ${chords} coast runs against the ring's orientation became chords, ${loops} whole-ring runs`);
    // a flipped ring's traversal by admin rings is reversed too — nothing to do: the admin ring sequences
    // hold vertex ids, and the arc dedupe below is direction-agnostic; the kind/sign bookkeeping follows.

    /* 3 — junctions and arcs */
    const allRings = [];   // { ids, isCoast, face, idx }
    coastRing.forEach((r, ri) => allRings.push({ ids: r.ids, isCoast: true, ring: ri }));
    faces.forEach((f, fi) => f.rings.forEach((ids, k) => allRings.push({ ids, isCoast: false, face: fi, k })));
    const nV = reg.size();
    // junction = a vertex visited with two different neighbour sets, or visited twice
    const nb1 = new Int32Array(nV).fill(-1), nb2 = new Int32Array(nV).fill(-1), junction = new Uint8Array(nV), visited = new Uint8Array(nV);
    for (const R of allRings) {
      const ids = R.ids, n = ids.length;
      const seenHere = new Set();
      for (let i = 0; i < n; i++) {
        const v = ids[i], p = ids[(i - 1 + n) % n], q = ids[(i + 1) % n];
        if (seenHere.has(v)) { junction[v] = 1; } seenHere.add(v);
        if (!visited[v]) { visited[v] = 1; nb1[v] = Math.min(p, q); nb2[v] = Math.max(p, q); }
        else if (nb1[v] !== Math.min(p, q) || nb2[v] !== Math.max(p, q)) junction[v] = 1;
      }
    }
    let nJ = 0; for (let v = 0; v < nV; v++) nJ += junction[v];
    say(`junctions: ${nJ} of ${nV} vertices`);

    const arcs = [];                // { ids, kind, source }
    const arcByKey = new Map();     // "a,b,c" → arc index (forward)
    const refsOf = (R) => {
      const ids = R.ids, n = ids.length;
      let first = ids.findIndex((v) => junction[v]);
      if (first < 0) {             // no junction: one closed arc — cut at the smallest vertex id, so the
        first = 0;                 // same cycle met again (an island's admin ring IS its coast ring) dedupes
        for (let i = 1; i < n; i++) if (ids[i] < ids[first]) first = i;
      }
      const refs = [];
      let cur = [ids[first]];
      for (let s = 1; s <= n; s++) {
        const v = ids[(first + s) % n];
        cur.push(v);
        if (junction[v] || s === n) {
          refs.push(registerArc(cur, R));
          cur = [v];
        }
      }
      return refs;
    };
    function registerArc(seq, R) {
      const fk = seq.join(","), bk = seq.slice().reverse().join(",");
      let i = arcByKey.get(fk); if (i != null) return i + 1;
      i = arcByKey.get(bk); if (i != null) return -(i + 1);
      i = arcs.length;
      arcs.push({ ids: seq, kind: R.isCoast ? KIND.COAST : KIND.BORDER, source: R.isCoast ? SRC_COAST : SRC_ADMIN });
      arcByKey.set(fk, i);
      return i + 1;
    }
    const coastArcRefs = coastRing.map((r, ri) => refsOf(allRings[ri]));
    const faceRefs = faces.map((f, fi) => f.rings.map((ids, k) => refsOf({ ids, isCoast: false })));
    let nCoastArcs = arcs.filter((a) => a.kind === KIND.COAST).length;
    say(`arcs: ${arcs.length} (${nCoastArcs} coast, ${arcs.length - nCoastArcs} border)`);

    /* 4 — seams: a border arc with the same entity on both sides */
    const arcFaces = arcs.map(() => []);
    faceRefs.forEach((rings, fi) => rings.forEach((refs, k) => refs.forEach((ref, pos) => arcFaces[Math.abs(ref) - 1].push({ fi, k, pos, sign: Math.sign(ref) }))));
    const seam = new Uint8Array(arcs.length);
    let seams = 0;
    arcs.forEach((a, ai) => {
      if (a.kind !== KIND.BORDER) return;
      const uses = arcFaces[ai];
      if (uses.length === 2 && faces[uses[0].fi].entity === faces[uses[1].fi].entity && uses[0].sign !== uses[1].sign) { seam[ai] = 1; seams++; log.event("seam-removed", { entity: entities[faces[uses[0].fi].entity].id, vertices: a.ids.length }); }
    });
    // splice: repeatedly take a face with a seam reference and merge
    if (seams) {
      for (let fi = 0; fi < faces.length; fi++) {
        let rings = faceRefs[fi];
        for (let guard = 0; guard < 1000; guard++) {
          let found = null;
          for (let k = 0; k < rings.length && !found; k++) for (let p = 0; p < rings[k].length; p++) if (seam[Math.abs(rings[k][p]) - 1]) { found = { k, p }; break; }
          if (!found) break;
          const ref = rings[found.k][found.p], ai = Math.abs(ref) - 1;
          // find the partner reference (opposite sign, same arc) in this face
          let partner = null;
          for (let k = 0; k < rings.length && !partner; k++) for (let p = 0; p < rings[k].length; p++) { if (k === found.k && p === found.p) continue; if (rings[k][p] === -ref) { partner = { k, p }; break; } }
          if (!partner) throw new Error(`seam arc ${ai} has no partner inside face ${fi}`);
          if (partner.k === found.k) {
            // same ring, pinched: ... A +S X -S B ... → two rings: [A..] without the pinch, and the loop X
            const r = rings[found.k]; const i = Math.min(found.p, partner.p), j = Math.max(found.p, partner.p);
            const loop = r.slice(i + 1, j), rest = r.slice(0, i).concat(r.slice(j + 1));
            rings.splice(found.k, 1);
            if (rest.length) rings.push(rest);
            if (loop.length) rings.push(loop);
          } else {
            // two rings: r1 = [.. +S ..], r2 = [.. -S ..] → r1 with +S replaced by r2 rotated to start after -S, minus -S
            const r1 = rings[found.k], r2 = rings[partner.k];
            const rot = r2.slice(partner.p + 1).concat(r2.slice(0, partner.p));
            const merged = r1.slice(0, found.p).concat(rot, r1.slice(found.p + 1));
            const hi = Math.max(found.k, partner.k), lo = Math.min(found.k, partner.k);
            rings.splice(hi, 1); rings.splice(lo, 1); rings.push(merged);
          }
        }
        faceRefs[fi] = rings.filter((r) => r.length > 0);
      }
    }
    // the seam arcs themselves leave the topology: compact the arc list and renumber every reference
    if (seams) {
      const newIndex = new Int32Array(arcs.length).fill(-1); let n = 0;
      for (let i = 0; i < arcs.length; i++) if (!seam[i]) newIndex[i] = n++;
      const renum = (ref) => { const i = newIndex[Math.abs(ref) - 1]; if (i < 0) throw new Error("reference to a removed seam arc survived splicing"); return ref > 0 ? i + 1 : -(i + 1); };
      for (let fi = 0; fi < faceRefs.length; fi++) faceRefs[fi] = faceRefs[fi].map((r) => r.map(renum));
      for (let ri = 0; ri < coastArcRefs.length; ri++) coastArcRefs[ri] = coastArcRefs[ri].map(renum);
      for (let i = arcs.length - 1; i >= 0; i--) if (seam[i]) arcs.splice(i, 1);
      nCoastArcs = arcs.filter((a) => a.kind === KIND.COAST).length;
    }
    say(`seams: ${seams} removed; ${arcs.length} arcs remain`);
    /* DISPUTED: a border the sources disagree on. Its interior vertices belong to ONE polygon (the
       neighbour drew its own line elsewhere — Bir Tawil against Sudan, the Halaib triangle, the
       admin theme's Ronne ice front against the coastline's), or it is a bare chord between two
       coast vertices (a polygon crossing a river mouth or an isthmus). The renderer may dash it
       (§2.4); the checker lets such an arc have one face, where a border two polygons share may not. */
    let disputed = 0;
    for (const a of arcs) {
      if (a.kind !== KIND.BORDER) continue;
      const n = a.ids.length;
      let flag = false;
      if (n === 2) flag = isCoastV[a.ids[0]] === 1 && isCoastV[a.ids[1]] === 1;
      else for (let i = 1; i < n - 1; i++) { const s = keyEntities.get(pkey(reg.X[a.ids[i]], reg.Y[a.ids[i]])); if (!s || s.size < 2) { flag = true; break; } }
      a.flags = flag ? 1 : 0; if (flag) disputed++;
    }
    say(`disputed borders (one polygon's line, or a chord across water): ${disputed} of ${arcs.length - nCoastArcs}`);

    /* 5 — LOD ranks: Visvalingam per arc, then crossing repair per level */
    const vecOf = new Array(nV);
    const V = (id) => vecOf[id] || (vecOf[id] = G.vec(reg.X[id], reg.Y[id], QUANTUM));
    const LEVELS = LOD_INTERVALS_M.length;
    const areaThresh = LOD_INTERVALS_M.map((m) => m * m);
    const DROP = LEVELS;   // rank == LEVELS: not kept at any level
    for (const a of arcs) {
      const ids = a.ids, n = ids.length;
      a.rank = new Uint8Array(n);
      a.area = new Float64Array(n).fill(Infinity);
      const closed = ids[0] === ids[n - 1];
      if (n <= 2 + (closed ? 1 : 0)) { continue; }   // nothing removable
      // interior vertices 1..n-2 (for a closed arc the last equals the first and both stay)
      const prev = new Int32Array(n), next = new Int32Array(n);
      for (let i = 0; i < n; i++) { prev[i] = i - 1; next[i] = i + 1; }
      const area = a.area;
      const tri = (i) => (prev[i] < 0 || next[i] >= n) ? Infinity : G.triArea(V(ids[prev[i]]), V(ids[i]), V(ids[next[i]]));
      // binary heap of interior vertices by current area
      const heap = []; const where = new Int32Array(n).fill(-1);
      const key = new Float64Array(n);
      const less = (i, j) => key[heap[i]] < key[heap[j]];
      const swap = (i, j) => { const t = heap[i]; heap[i] = heap[j]; heap[j] = t; where[heap[i]] = i; where[heap[j]] = j; };
      const up = (i) => { while (i > 0) { const p = (i - 1) >> 1; if (less(i, p)) { swap(i, p); i = p; } else break; } };
      const down = (i) => { for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && less(l, m)) m = l; if (r < heap.length && less(r, m)) m = r; if (m === i) break; swap(i, m); i = m; } };
      const pushH = (v) => { where[v] = heap.length; heap.push(v); up(where[v]); };
      const popH = () => { const v = heap[0]; const last = heap.pop(); where[v] = -1; if (heap.length) { heap[0] = last; where[last] = 0; down(0); } return v; };
      const update = (v) => { if (where[v] < 0) return; key[v] = tri(v); up(where[v]); down(where[v]); };
      for (let i = 1; i < n - 1; i++) { key[i] = tri(i); pushH(i); }
      let lastArea = 0;
      while (heap.length) {
        const v = popH();
        const ar = Math.max(key[v], lastArea);   // monotone: a vertex never ranks above one removed before it
        lastArea = ar; area[v] = ar;
        next[prev[v]] = next[v]; prev[next[v]] = prev[v];
        update(prev[v]); update(next[v]);
      }
      for (let i = 1; i < n - 1; i++) { let r = 0; while (r < LEVELS && area[i] < areaThresh[r]) r++; a.rank[i] = r; }
      if (closed) {
        // a ring keeps its two largest interior vertices at the finest level, so it is never less than a triangle
        const order = []; for (let i = 1; i < n - 1; i++) order.push(i); order.sort((i, j) => area[j] - area[i]);
        for (const i of order.slice(0, 2)) if (a.rank[i] > LEVELS - 1) a.rank[i] = LEVELS - 1;
      }
    }
    say("visvalingam ranks computed");

    // crossing repair, coarsest level first (a vertex re-added at level k is present at all finer levels)
    const repairs = [];
    for (let level = 0; level < LEVELS; level++) {
      let pass = 0, fixedTotal = 0, residual = 0;
      for (; pass < 30; pass++) {
        const segs = [];   // { arc, i, j } with i<j indices into arc.ids, both present at this level
        for (let ai = 0; ai < arcs.length; ai++) {
          const a = arcs[ai]; if (!drawableAt(a, level)) continue;
          let last = 0;
          for (let i = 1; i < a.ids.length; i++) if (a.rank[i] <= level) { segs.push({ arc: ai, i: last, j: i }); last = i; }
        }
        const grid = G.Grid(level === 0 ? 1 : level === 1 ? 0.5 : 0.25, QUANTUM);
        segs.forEach((s, si) => { const a = arcs[s.arc]; grid.add(si, reg.X[a.ids[s.i]], reg.Y[a.ids[s.i]], reg.X[a.ids[s.j]], reg.Y[a.ids[s.j]]); });
        const crossing = [];
        grid.pairs((p, q) => {
          const s = segs[p], t = segs[q], A = arcs[s.arc], B = arcs[t.arc];
          const a1 = A.ids[s.i], a2 = A.ids[s.j], b1 = B.ids[t.i], b2 = B.ids[t.j];
          if (a1 === b1 || a1 === b2 || a2 === b1 || a2 === b2) return;
          if (G.segmentsCross(V(a1), V(a2), V(b1), V(b2))) crossing.push([p, q]);
        });
        if (!crossing.length) break;
        let fixed = 0;
        for (const [p, q] of crossing) for (const s of [segs[p], segs[q]]) {
          const a = arcs[s.arc];
          if (s.j - s.i < 2) continue;                  // an original edge: nothing hidden to re-add
          let best = -1, bestA = -1;
          for (let k = s.i + 1; k < s.j; k++) if (a.rank[k] > level && a.area[k] > bestA) { bestA = a.area[k]; best = k; }
          if (best >= 0) { a.rank[best] = level; fixed++; }
        }
        fixedTotal += fixed;
        if (!fixed) {
          residual = crossing.length;
          for (const [p, q] of crossing) { const s = segs[p], t = segs[q], A = arcs[s.arc], B = arcs[t.arc];
            const who = (ai) => { const out = []; faceRefs.forEach((rings, fi) => rings.forEach((r) => r.forEach((ref) => { if (Math.abs(ref) - 1 === ai) out.push(entities[faces[fi].entity].id); }))); return out; };
            log.event("crossing-residual", { level, kinds: [A.kind, B.kind], arcs: [s.arc, t.arc], at: [reg.X[A.ids[s.i]] * QUANTUM, reg.Y[A.ids[s.i]] * QUANTUM], spans: [s.j - s.i, t.j - t.i], lengths: [A.ids.length, B.ids.length], faces: [who(s.arc), who(t.arc)],
              segA: [[reg.X[A.ids[s.i]] * QUANTUM, reg.Y[A.ids[s.i]] * QUANTUM], [reg.X[A.ids[s.j]] * QUANTUM, reg.Y[A.ids[s.j]] * QUANTUM]], segB: [[reg.X[B.ids[t.i]] * QUANTUM, reg.Y[B.ids[t.i]] * QUANTUM], [reg.X[B.ids[t.j]] * QUANTUM, reg.Y[B.ids[t.j]] * QUANTUM]] }); }
          break;
        }
      }
      repairs.push({ level, passes: pass, reAdded: fixedTotal, residual });
      say(`crossing repair at LOD ${level}: ${fixedTotal} vertices re-added over ${pass} pass(es), ${residual} residual crossings`);
      log.event("crossing-repair", { level, reAdded: fixedTotal, residual });
    }
    function drawableAt(a, level) {
      if (a.ids[0] !== a.ids[a.ids.length - 1]) return true;
      let kept = 0; for (let i = 1; i < a.ids.length - 1; i++) if (a.rank[i] <= level) kept++;
      return kept >= 2;
    }
    // minLod per arc; drop vertices ranked beyond the finest level
    let kept = 0, dropped = 0;
    for (const a of arcs) {
      let min = 0; while (min < LEVELS && !drawableAt(a, min)) min++;
      a.minLod = min;
      const X = [], Y = [], Rk = [];
      for (let i = 0; i < a.ids.length; i++) { if (a.rank[i] >= DROP) { dropped++; continue; } X.push(reg.X[a.ids[i]]); Y.push(reg.Y[a.ids[i]]); Rk.push(a.rank[i]); kept++; }
      a.x = X; a.y = Y; a.r = Rk;
      a.startId = a.ids[0]; a.endId = a.ids[a.ids.length - 1];
    }
    const perLevel = LOD_INTERVALS_M.map((m, L) => { let c = 0; for (const a of arcs) for (const r of a.r) if (r <= L) c++; return c; });
    say(`vertices in the file: ${kept} (dropped below LOD ${LEVELS - 1}: ${dropped}); per level ${perLevel.join(" / ")}`);

    /* 6 — write */
    const steps = [];
    faceRefs.forEach((rings, fi) => { steps.push([faces[fi].entity, 2022, null, fi]); });
    const out = {
      step: "build-land", generated: new Date().toISOString(),
      quantum: QUANTUM, lod: { intervals_m: LOD_INTERVALS_M, note: "Visvalingam interval per level, coarsest first; a vertex's rank is the coarsest level it survives at" },
      sources: SOURCE_IDS,
      versions,
      tolerances_m: TOLERANCE_M,
      entities,
      steps, stepYears: "[entity, from, to, face]; years inclusive, null = open; present-day faces dated from the source's release",
      arcs: arcs.map((a) => ({ x: a.x, y: a.y, r: a.r, kind: a.kind, source: a.source, minLod: a.minLod, flags: a.flags || 0, startId: a.startId, endId: a.endId })),
      faces: faceRefs.map((rings, fi) => ({ entity: faces[fi].entity, source: SRC_ADMIN, rings })),
      coastRings: coastArcRefs,
      stats: { coastRings: rings.length, junctions: nJ, arcs: arcs.length, coastArcs: nCoastArcs, seams, projected, inserted, borderVertices: borderV, runsReplaced, runsSplitAtChord, verticesKept: kept, verticesDropped: dropped, perLevel, repairs },
    };
    fs.mkdirSync(OUT, { recursive: true });
    fs.writeFileSync(path.join(OUT, "land.json"), JSON.stringify(out));
    log.write(path.join(OUT, "snap-log.json"));
    log.print();
    log.check();
    say(`wrote out/land.json (${(fs.statSync(path.join(OUT, "land.json")).size / 1048576).toFixed(1)} MB) and out/snap-log.json`);
  });
}

main().catch((e) => { console.error("✗ build-land: " + (e.stack || e.message)); process.exit(1); });
