#!/usr/bin/env node
/* build-admin.js — step 2 of the Atlas v2 build: present-day admin-0 and admin-1 faces conflated onto
   the OSM land partition.

     node build-admin.js            out/coast.bin + Natural Earth admin-0/admin-1 → out/full.bin
                                    (the whole topology at LOD 0–4, one file), out/admin-log.json
                                    (the snap log), out/admin-report.json (the measurements)

   WHAT CONFLATION MEANS HERE (docs/atlas-v2-design.md §2.3, revised in Phase 1a). Natural Earth's
   country polygons disagree with an OSM coast far more than two Natural Earth themes disagreed with
   each other in Phase 0 — their shoreline vertices sit a median 560 m and up to a few kilometres
   from OSM's, and where NE treats a river or an estuary as water and OSM as land the polygons stop
   kilometres short of any OSM coast (measured: the St Lawrence, the Corantijn, the Yalu, the Minho).
   So the NE shoreline is NEVER used as geometry. The faces are built the other way round — the
   land partition is CUT by the NE border lines and every piece is LABELLED by the NE polygon that
   contains it:

     1. Lines. A NE vertex shared by two polygons is a border vertex; an edge whose two ends are
        shared with a common neighbour is a border edge. An UNSHARED vertex farther than D_FAR from
        the OSM coast is a line one polygon drew on its own (the Chile side of Tierra del Fuego, one
        vertex of Sudan's Bir Tawil edge, the banks of a river NE treats as water) and is kept as a
        ONE-SIDED line, flagged DISPUTED; an unshared vertex within D_FAR is NE's own coast and is
        discarded. A ring with no shared vertex at all (an island, Australia, Antarctica) contributes
        no line. Admin-1 (US, China, Russia, the UK nations — Q-A7 a) adds its internal lines the
        same way, with kind ADMIN1; its outer boundary is admin-0's and the coast's.
     2. Ends. Every line is cut where it crosses the OSM coast. A line's loose end on land is joined
        to the nearest coast point within the source's tolerance (a logged snap); a loose end over
        water is a tail the source drew past the shore and is cut off; a line that runs over water
        between two crossings stays, flagged WATER (the US–Canada line in the Great Lakes). An
        admin-1 end is joined to the nearest admin-0 line or coast point the same way.
     3. Faces. Coast rings and lines form one planar graph; its left-hand cycles are walked, the sea
        cycles dropped, and every land piece gets the admin-0 polygon (and the admin-1 unit) that
        contains its interior points — by majority over several, by proximity for an islet NE does
        not have. A piece no polygon claims is a sliver (a lens between two one-sided lines, a river
        strip) and merges into the neighbour with the longest shared boundary when it is thin or
        small; a large one stays unmapped (a lake NE excludes: water). Pieces of one entity merge
        into its face; a line with the same entity on both sides is dropped.
     4. Levels. Vertex ranks come from the coast file's Visvalingam areas (NE lines get their own),
        endpoints fixed; crossings between simplified arcs are repaired per level by re-adding the
        largest removed vertex. Every vertex on a tile line of z=4 is nudged by one quantum so no
        tile boundary ever meets a vertex (pack.js relies on it).

   Every measurement that shaped a threshold is written to out/admin-report.json and quoted in the
   design doc. NOTHING IS HAND-EDITED AFTERWARDS.
*/
"use strict";
const fs = require("fs"), path = require("path");
const { ensureSource } = require("./fetch-sources.js");
const { SnapLog } = require("./lib/log.js");
const { readShp, readDbf } = require("./lib/shp.js");
const R = require("./lib/rings.js");
const G = require("./lib/geo.js");
const Coast = require("./lib/coastfile.js");
const SegIndex = require("./lib/segindex.js");
const F = require("./lib/format.js");

const HERE = __dirname, OUT = path.join(HERE, "out");
const LOD_M = [10000, 2500, 500, 250, 75];   // Visvalingam √area per level; LOD 0–2 resident, 3–4 tiles (see docs §2.3 "as measured"). LOD 0 was 8 km: 10 km is still under half a pixel from 20 km/px up and 0.63 px at its 16 km/px switch, and it is what keeps a globe frame under the gate in software GL (§2.2)
const FINEST = LOD_M.length - 1;
const D_FAR = 2500;                         // m — an unshared NE vertex beyond this from the OSM coast is a one-sided line, not NE coast (measured: 198 of 202 NE coast runs lie within 1 km at their nearest vertex; the river banks start at 2–50 km)
const SRC = { coast: "osm-land-polygons", adm0: "ne-10m-admin0", adm1: "ne-10m-admin1" };
const SRC_IDS = [SRC.coast, SRC.adm0, SRC.adm1];
const SRC_I = { coast: 0, adm0: 1, adm1: 2 };
const TOLERANCE_M = { [SRC.adm0]: 4000, [SRC.adm1]: 4000, [SRC.coast]: 100 };   // NE: the measured 99th percentile of a border end's distance to the OSM coast is 3.5 km (out/admin-report.json); OSM: the two sides of its antimeridian cut
const ADMIN1 = { USA: 1, CHN: 1, RUS: 1, GBR: 1 };
const SLIVER_WIDTH_M = 1500, SLIVER_KM2 = 30;   // an unclaimed piece thinner or smaller than this merges into its longest-boundary neighbour
const TILE_U = R.U(11.25);                      // z=4 tile lines: multiples of 11.25° (z=3's 45° are among them)
const KIND = F.KIND, FLAG = F.FLAG;
const Q = R.QUANTUM, X180 = R.X180;
const KM_PER_U = Q * 111.32;
const t0 = Date.now();
const say = (m) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${m}`);
const deg = (x, y) => [+(x * Q).toFixed(5), +(y * Q).toFixed(5)];

function main() {
  const log = new SnapLog("build-admin", TOLERANCE_M);
  const report = { lod_m: LOD_M, d_far_m: D_FAR, tolerances_m: TOLERANCE_M };

  /* ================= 0. the coast ================= */
  const C = Coast.read(path.join(OUT, "coast.bin"));
  if (C.header.source.id !== SRC.coast) throw new Error("coast.bin is not from " + SRC.coast);
  const coastSrc = ensureSource(SRC.coast, { verifyOnly: true });
  if (coastSrc.sha256 !== C.header.source.sha256) throw new Error("coast.bin was built from a different pin of " + SRC.coast);
  const nRings = C.ringOffset.length - 1;
  // the working coast: vertices that survive the finest level, per ring; rings with fewer than 3 vanish.
  // Every ring is simplified on its own, so at the finest level two neighbouring rings — or two reaches
  // of one — can cross (Smith Island's marsh islets; measured: 11,967 crossings in the 75 m set). The
  // face walk needs a planar coast, so the set is made planar HERE, before any line touches it: the
  // largest reserve vertex (an OSM vertex below the finest tolerance) between the ends of each crossing
  // segment is re-added, pass after pass, until nothing crosses — the repair stage 11 runs per LOD level,
  // run once on the ring arrays. A crossing no reserve can fix (two original OSM edges that cross after
  // quantisation) is left for stage 11, which makes it a junction.
  const keep = new Uint8Array(C.x.length);
  for (let i = 0; i < C.x.length; i++) if (C.size[i] >= LOD_M[FINEST]) keep[i] = 1;
  let nW = 0, ringsKept = 0, ringsVanished = 0, WX, WY, WORIG, WSZ, WRING, wRingStart, cidx;
  const CELL = Math.round(0.02 / Q);   // 2.2 km cells
  const wNext = (w) => { const r = WRING[w]; return w + 1 < wRingStart[r + 1] ? w + 1 : wRingStart[r]; };
  const wPrev = (w) => { const r = WRING[w]; return w > wRingStart[r] ? w - 1 : wRingStart[r + 1] - 1; };
  const buildWorking = () => {
    nW = 0; ringsKept = 0; ringsVanished = 0;
    const kept = new Int32Array(nRings);
    for (let r = 0; r < nRings; r++) { let k = 0; for (let i = C.ringOffset[r]; i < C.ringOffset[r + 1]; i++) if (keep[i]) k++; kept[r] = k; if (k >= 3) { nW += k; ringsKept++; } else ringsVanished++; }
    WX = new Int32Array(nW); WY = new Int32Array(nW); WORIG = new Int32Array(nW); WSZ = new Float32Array(nW); WRING = new Int32Array(nW);
    wRingStart = new Uint32Array(ringsKept + 1);
    let w = 0, wr = 0;
    for (let r = 0; r < nRings; r++) {
      if (kept[r] < 3) continue;
      wRingStart[wr] = w;
      // a re-added reserve vertex takes the finest tolerance as its size, so stage 11 ranks it at the finest level
      for (let i = C.ringOffset[r]; i < C.ringOffset[r + 1]; i++) if (keep[i]) { WX[w] = C.x[i]; WY[w] = C.y[i]; WORIG[w] = i; WSZ[w] = Math.max(C.size[i], LOD_M[FINEST]); WRING[w] = wr; w++; }
      wr++;
    }
    wRingStart[ringsKept] = w;
    // segment s = working vertex s → wNext(s)
    cidx = SegIndex.build(nW, CELL, (s) => { const n = wNext(s); return [WX[s], WY[s], WX[n], WY[n]]; });
  };
  const ringOfOrig = (o) => { let lo = 0, hi = nRings - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (C.ringOffset[m] <= o) lo = m; else hi = m - 1; } return lo; };
  let planarPasses = 0, planarReAdded = 0, planarResidual = 0, planarCrossings0 = 0;
  { let touched = null, stale = true;
    for (let pass = 0; pass < 40; pass++) {
      buildWorking(); stale = false; planarPasses = pass + 1;
      const t0 = Date.now();
      const vecW = (w) => G.vec(WX[w], WY[w], Q);
      const crossing = [];
      const test = (p, q) => { const pn = wNext(p), qn = wNext(q); if (p === q || p === qn || pn === q || pn === qn) return; if (G.segmentsCross(vecW(p), vecW(pn), vecW(q), vecW(qn))) crossing.push(p, q); };
      if (!touched) cidx.pairs(test);
      else {
        // after the first pass only a segment with a touched end can be in a new crossing: query around those
        const seen = new Set();
        for (let s = 0; s < nW; s++) {
          const n = wNext(s); if (!touched.has(WORIG[s]) && !touched.has(WORIG[n])) continue;
          const cx = Math.round((WX[s] + WX[n]) / 2), cy = Math.round((WY[s] + WY[n]) / 2);
          const rU = Math.max(Math.abs(WX[n] - WX[s]), Math.abs(WY[n] - WY[s])) / 2 + 1;
          cidx.near(cx, cy, Math.min(rU, 60 * CELL), (q) => { if (q === s) return; const lo = Math.min(s, q), hi = Math.max(s, q); const key = lo * 16777216 + hi; if (seen.has(key)) return; seen.add(key); test(lo, hi); });
        }
      }
      if (pass === 0) planarCrossings0 = crossing.length / 2;
      if (!crossing.length) { say(`  coast planarity pass ${pass}: ${nW} segments, 0 crossings (${Date.now() - t0} ms)`); break; }
      touched = new Set(); const want = new Set();
      for (let k = 0; k < crossing.length; k++) {
        const s = crossing[k], n = wNext(s), o0 = WORIG[s], o1 = WORIG[n];
        touched.add(o0); touched.add(o1);
        const r = ringOfOrig(o0), rs = C.ringOffset[r], len = C.ringOffset[r + 1] - rs;
        const steps = ((o1 - o0) % len + len) % len;   // along the ring, o1 always follows o0
        let best = -1, bestSz = -1;
        for (let kk = 1; kk < steps; kk++) { const o = rs + ((o0 - rs + kk) % len); if (!keep[o] && C.size[o] > bestSz) { bestSz = C.size[o]; best = o; } }
        if (best >= 0) want.add(best);
      }
      for (const o of want) { keep[o] = 1; touched.add(o); }
      planarReAdded += want.size; stale = want.size > 0;
      say(`  coast planarity pass ${pass}: ${nW} segments, ${crossing.length / 2} crossings, ${want.size} reserve vertices re-added (${Date.now() - t0} ms)`);
      if (!want.size) { planarResidual = crossing.length / 2; for (let k = 0; k < Math.min(crossing.length, 20); k += 2) log.event("coast-crossing-without-reserve", { at: deg(WX[crossing[k]], WY[crossing[k]]) }); break; }
    }
    if (stale) buildWorking();
  }
  say(`coast: ${nRings} rings, ${C.x.length} vertices → working set at ${LOD_M[FINEST]} m: ${ringsKept} rings, ${nW} vertices (${ringsVanished} rings vanish below the finest level); planar after ${planarPasses} pass(es): ${planarCrossings0} crossings, ${planarReAdded} reserve vertices re-added, ${planarResidual} left for stage 11`);
  // Rings under TINY_KM2 are invisible to the lines: no crossing node, no hug, no join lands on them. Two
  // such marsh fragments can touch or overlap after quantisation (a vertex of one exactly on an edge of the
  // other — Smith Island, measured), and a border threaded through both made the face walk leak. A line
  // crossing a tiny islet simply passes over it; the islet keeps its ring and takes one side's label, and
  // stage 11 makes the crossing a shared vertex so every level stays planar.
  const TINY_KM2 = 0.1;
  const ringTiny = new Uint8Array(ringsKept); let tinyRings = 0;
  for (let r = 0; r < ringsKept; r++) {
    let a2 = 0, sy = 0; const s0 = wRingStart[r], s1 = wRingStart[r + 1];
    for (let w = s0; w < s1; w++) { const n = w + 1 < s1 ? w + 1 : s0; a2 += (WX[w] - WX[s0]) * (WY[n] - WY[s0]) - (WX[n] - WX[s0]) * (WY[w] - WY[s0]); sy += WY[w]; }
    const km2 = Math.abs(a2) / 2 * KM_PER_U * KM_PER_U * Math.cos(sy / (s1 - s0) * Q * Math.PI / 180);
    if (km2 < TINY_KM2) { ringTiny[r] = 1; tinyRings++; }
  }
  say(`${tinyRings} working rings under ${TINY_KM2} km² are invisible to the lines`);
  report.coast = { rings: nRings, vertices: C.x.length, workingRings: ringsKept, workingVertices: nW, ringsBelowFinest: ringsVanished, planar: { passes: planarPasses, crossings: planarCrossings0, reAdded: planarReAdded, residual: planarResidual }, tinyRingsInvisibleToLines: { count: tinyRings, km2: TINY_KM2 } };
  say(`coast segment index: ${cidx.total} entries, ${cidx.nCells} cells`);

  // nearest working coast segment to a quantised point, in a local metric; expanding search
  function nearestCoast(x, y, maxM, skipTiny) {
    const ky = KM_PER_U, kx = KM_PER_U * Math.cos(y * Q * Math.PI / 180);
    let best = null;
    for (let rad = CELL; ; rad *= 2) {
      cidx.near(x, y, rad, (s) => {
        if (skipTiny && ringTiny[WRING[s]]) return;
        const n = wNext(s);
        const ax = (WX[s] - x) * kx, ay = (WY[s] - y) * ky, bx = (WX[n] - x) * kx, by = (WY[n] - y) * ky;
        const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
        let t = l2 > 0 ? -(ax * dx + ay * dy) / l2 : 0; t = Math.max(0, Math.min(1, t));
        const m = Math.hypot(ax + t * dx, ay + t * dy) * 1000;
        if (!best || m < best.metres) best = { seg: s, t, metres: m };
      });
      const covered = rad * KM_PER_U * 1000 * Math.min(1, Math.cos(y * Q * Math.PI / 180)) * 0.95;   // guaranteed radius searched, metres
      if (best && best.metres <= covered) return best.metres <= maxM ? best : null;
      if (covered >= maxM) return best && best.metres <= maxM ? best : null;
    }
  }
  // which side of the coast a point lies on: land (left) or sea; corner-aware at a vertex
  function onLand(x, y) {
    const near = nearestCoast(x, y, 500000);
    if (!near) return null;
    const s = near.seg, n = wNext(s);
    const ky = KM_PER_U, kx = KM_PER_U * Math.cos(y * Q * Math.PI / 180);
    const cross = (a, b) => ((WX[b] - WX[a]) * kx) * ((y - WY[a]) * ky) - ((WY[b] - WY[a]) * ky) * ((x - WX[a]) * kx);
    if (near.t > 1e-6 && near.t < 1 - 1e-6) return cross(s, n) > 0;
    const v = near.t <= 1e-6 ? s : n, p = wPrev(v), q = wNext(v);
    const leftIn = cross(p, v) > 0, leftOut = cross(v, q) > 0;
    const turnLeft = (((WX[v] - WX[p]) * kx) * ((WY[q] - WY[v]) * ky) - ((WY[v] - WY[p]) * ky) * ((WX[q] - WX[v]) * kx)) > 0;
    return turnLeft ? (leftIn && leftOut) : (leftIn || leftOut);
  }

  /* ================= 1. Natural Earth ================= */
  const adm0Src = ensureSource(SRC.adm0, { verifyOnly: true }), adm1Src = ensureSource(SRC.adm1, { verifyOnly: true });
  const entities = [], entIndex = new Map();
  const neRings = [];                 // { ent, unit, pts: [[x,y]…], keys: [pkey…], layer: 0|1 }
  const keyEnt = new Map();           // pkey → Set(ent)  (admin-0)
  const keyUnit = new Map();          // pkey → Set(unit) (admin-1 of the four countries)
  const units = [];                   // admin-1 units: { id, name, ent, a3, qid, type }
  const unitIndex = new Map();
  const NE = { x: [], y: [] }, neKeyId = new Map();   // NE vertex registry (graph nodes)
  const neId = (x, y) => { const k = R.pkey(x, y); let id = neKeyId.get(k); if (id == null) { id = NE.x.length; neKeyId.set(k, id); NE.x.push(x); NE.y.push(y); } return id; };
  function prepRing(part) {
    const pts = []; let last = null;
    for (let i = 0; i < part.length; i += 2) { const q = R.qpt([part[i], part[i + 1]]); const k = R.pkey(q[0], q[1]); if (k !== last) { pts.push(q); last = k; } }
    if (pts.length > 1 && R.pkey(pts[0][0], pts[0][1]) === R.pkey(pts[pts.length - 1][0], pts[pts.length - 1][1])) pts.pop();
    R.cutSpikes(pts);
    return pts.length >= 3 ? pts : null;
  }
  { const dir = path.join(adm0Src.dir), shp = path.join(dir, "ne_10m_admin_0_countries.shp"), rows = readDbf(path.join(dir, "ne_10m_admin_0_countries.dbf"), "utf8").rows;
    let i = 0, rings = 0, degenerate = 0;
    for (const rec of readShp(shp)) {
      const P = rows[i++];
      const a3 = String(P.ADM0_A3 || P.ISO_A3 || P.NAME).toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const eid = "adm0:" + a3;
      if (!entIndex.has(eid)) { entIndex.set(eid, entities.length); entities.push({ id: eid, name: P.ADMIN || P.NAME, kind: "polity", qid: P.WIKIDATAID || null, iso3: P.ISO_A3 && P.ISO_A3 !== "-99" ? P.ISO_A3 : null, a3: P.ADM0_A3, type: P.TYPE, sovereign: P.SOV_A3 }); }
      const ent = entIndex.get(eid);
      for (const part of rec.parts) {
        const pts = prepRing(part); if (!pts) { degenerate++; continue; }
        const keys = pts.map((p) => R.pkey(p[0], p[1]));
        for (const k of keys) { let s = keyEnt.get(k); if (!s) keyEnt.set(k, s = new Set()); s.add(ent); }
        neRings.push({ ent, unit: -1, pts, keys, layer: 0 }); rings++;
      }
    }
    say(`admin-0: ${i} features → ${entities.length} entities, ${rings} rings (${degenerate} degenerate), ${keyEnt.size} distinct vertices`); }
  const nAdm0 = entities.length;
  { const dir = path.join(adm1Src.dir), shp = path.join(dir, "ne_10m_admin_1_states_provinces.shp"), rows = readDbf(path.join(dir, "ne_10m_admin_1_states_provinces.dbf"), "utf8").rows;
    let i = 0, rings = 0, kept = 0;
    for (const rec of readShp(shp)) {
      const P = rows[i++];
      if (!ADMIN1[P.adm0_a3]) continue;
      const parentId = "adm0:" + P.adm0_a3.toLowerCase();
      if (!entIndex.has(parentId)) { say(`  admin-1 row ${P.name} names a parent not in admin-0 (${P.adm0_a3}) — skipped`); continue; }
      const ent = entIndex.get(parentId);
      const nation = P.adm0_a3 === "GBR";
      const uname = nation ? P.geonunit : P.name;
      const slug = String(nation ? P.gu_a3 || P.geonunit : P.iso_3166_2 || P.name).toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const uid = "adm1:" + P.adm0_a3.toLowerCase() + ":" + slug;
      if (!unitIndex.has(uid)) { unitIndex.set(uid, units.length); units.push({ id: uid, name: uname, kind: "admin1", parent: parentId, ent, qid: nation ? null : P.wikidataid || null, type: nation ? "Nation" : P.type_en || P.type || null, iso: nation ? null : P.iso_3166_2 || null }); kept++; }
      const unit = unitIndex.get(uid);
      for (const part of rec.parts) {
        const pts = prepRing(part); if (!pts) continue;
        const keys = pts.map((p) => R.pkey(p[0], p[1]));
        for (const k of keys) { let s = keyUnit.get(k); if (!s) keyUnit.set(k, s = new Set()); s.add(unit); }
        neRings.push({ ent, unit, pts, keys, layer: 1 }); rings++;
      }
    }
    say(`admin-1: ${kept} units in ${Object.keys(ADMIN1).join("/")} (${units.filter((u) => u.parent === "adm0:gbr").map((u) => u.name).join(", ")} for the UK), ${rings} rings, ${keyUnit.size} distinct vertices`); }

  /* ================= 2. every NE vertex's distance to the OSM coast ================= */
  const distMemo = new Map();
  const coastDist = (x, y) => { const k = R.pkey(x, y); let d = distMemo.get(k); if (d === undefined) { const n = nearestCoast(x, y, 60000); d = n ? n.metres : Infinity; distMemo.set(k, d); } return d; };
  // (computed lazily: only unshared vertices and ends need it — a 60 km search around every inland border vertex would take hours)
  const hist = (vals) => { const bins = [100, 250, 500, 1000, 2000, 2500, 5000, 10000, 20000, 50000, Infinity]; const out = {}; let lo = 0; for (const b of bins) { out[`${lo}-${b === Infinity ? "inf" : b}`] = vals.filter((v) => v >= lo && v < b).length; lo = b; } out.beyond60km = vals.filter((v) => v === Infinity).length; const s = vals.filter((v) => v !== Infinity).sort((a, b) => a - b); const pct = (p) => s.length ? Math.round(s[Math.min(s.length - 1, Math.floor(p / 100 * s.length))]) : null; out.n = vals.length; out.p50 = pct(50); out.p90 = pct(90); out.p95 = pct(95); out.p99 = pct(99); return out; };

  /* ================= 3. the cutting lines ================= */
  // vertex classes per ring: SHARED (a border vertex), FAR (unshared, beyond D_FAR), NEAR (NE coast)
  const edges = new Map();            // "a,b" (node ids, a<b) → { a, b, kind, flags, ents: Set }
  let borderEdges = 0, farEdges = 0, ringsWithoutLines = 0, adm1Internal = 0, adm1Far = 0;
  const endDists = [], unsharedDists = [], farVertices = [];
  // admin-0 cutting-line distance index (for admin-1's outer vertices) is built after admin-0's lines exist
  const addEdge = (p, q, kind, flags, ent) => {
    const a = neId(p[0], p[1]), b = neId(q[0], q[1]);
    if (a === b) return;
    const key = a < b ? a + "," + b : b + "," + a;
    let e = edges.get(key);
    if (!e) { e = { a: Math.min(a, b), b: Math.max(a, b), kind, flags, ents: new Set() }; edges.set(key, e); }
    else { if (e.kind === KIND.ADMIN1 && kind === KIND.BORDER) e.kind = KIND.BORDER; if (!(flags & FLAG.DISPUTED)) e.flags &= ~FLAG.DISPUTED; }
    e.ents.add(ent);
  };
  for (const Rg of neRings) {
    if (Rg.layer !== 0) continue;
    const { pts, keys, ent } = Rg, n = pts.length;
    const shared = keys.map((k) => keyEnt.get(k).size >= 2);
    if (!shared.some((s) => s)) { ringsWithoutLines++; continue; }
    // far: unshared, beyond D_FAR from the OSM coast AND on OSM land — a NE shoreline vertex out at sea
    // (a generalised line across a bay, the Arctic) is nothing to cut along; a bank where OSM has land is
    // …and never a vertex ON the antimeridian: that is the source's own cut (Russia, Fiji), not a line
    const far = pts.map((p, i) => !shared[i] && p[0] !== -X180 && coastDist(p[0], p[1]) > D_FAR && onLand(p[0], p[1]) === true);
    for (let i = 0; i < n; i++) { if (!shared[i]) { const d = coastDist(pts[i][0], pts[i][1]); unsharedDists.push(d); if (far[i]) farVertices.push({ ent: entities[ent].a3, at: deg(pts[i][0], pts[i][1]), metres: d === Infinity ? null : Math.round(d) }); } }
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      let border = false;
      if (shared[i] && shared[j]) { const A = keyEnt.get(keys[i]), B = keyEnt.get(keys[j]); for (const e of A) if (e !== ent && B.has(e)) { border = true; break; } }
      if (border) { addEdge(pts[i], pts[j], KIND.BORDER, 0, ent); borderEdges++; }
      else if (far[i] || far[j]) { addEdge(pts[i], pts[j], KIND.BORDER, FLAG.DISPUTED, ent); farEdges++; }
      // a border end: shared vertex followed by NE coast
      if (shared[i] && !shared[j] && !far[j]) endDists.push(coastDist(pts[i][0], pts[i][1]));
      if (shared[j] && !shared[i] && !far[i]) endDists.push(coastDist(pts[j][0], pts[j][1]));
    }
  }
  say(`admin-0 lines: ${borderEdges} border edges, ${farEdges} one-sided edges (${farVertices.length} far vertices), ${ringsWithoutLines} rings without a shared vertex (islands, continents of one entity)`);
  report.ne = { unsharedVertexToCoast_m: hist(unsharedDists), borderEndToCoast_m: hist(endDists), farVertices: farVertices.length, farVerticesSample: farVertices.slice(0, 60) };
  // admin-0 line index: for admin-1 outer vertices "near an admin-0 line" (the one-sided lines included)
  const adm0Edges = [...edges.values()];
  const lidx = SegIndex.build(adm0Edges.length, CELL, (i) => { const e = adm0Edges[i]; return [NE.x[e.a], NE.y[e.a], NE.x[e.b], NE.y[e.b]]; });
  function nearestLine(x, y, maxM) {
    const ky = KM_PER_U, kx = KM_PER_U * Math.cos(y * Q * Math.PI / 180);
    let best = null;
    for (let rad = CELL; ; rad *= 2) {
      lidx.near(x, y, rad, (i) => {
        const e = adm0Edges[i];
        const ax = (NE.x[e.a] - x) * kx, ay = (NE.y[e.a] - y) * ky, bx = (NE.x[e.b] - x) * kx, by = (NE.y[e.b] - y) * ky;
        const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
        let t = l2 > 0 ? -(ax * dx + ay * dy) / l2 : 0; t = Math.max(0, Math.min(1, t));
        const m = Math.hypot(ax + t * dx, ay + t * dy) * 1000;
        if (!best || m < best.metres) best = { edge: i, t, metres: m };
      });
      const covered = rad * KM_PER_U * 1000 * Math.min(1, Math.cos(y * Q * Math.PI / 180)) * 0.95;
      if (best && best.metres <= covered) return best.metres <= maxM ? best : null;
      if (covered >= maxM) return best && best.metres <= maxM ? best : null;
    }
  }
  const adm1Ends = [];
  for (const Rg of neRings) {
    if (Rg.layer !== 1) continue;
    const { pts, keys, ent, unit } = Rg, n = pts.length;
    const internal = keys.map((k) => { const s = keyUnit.get(k); if (s.size < 2) return false; for (const u of s) if (u !== unit && units[u].ent === ent) return true; return false; });
    if (!internal.some((s) => s)) continue;
    const far = pts.map((p, i) => { if (internal[i] || p[0] === -X180) return false; if (coastDist(p[0], p[1]) <= D_FAR) return false; if (nearestLine(p[0], p[1], D_FAR)) return false; return onLand(p[0], p[1]) === true; });
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      let line = false;
      if (internal[i] && internal[j]) { const A = keyUnit.get(keys[i]), B = keyUnit.get(keys[j]); for (const u of A) if (u !== unit && units[u].ent === ent && B.has(u)) { line = true; break; } }
      if (line) { addEdge(pts[i], pts[j], KIND.ADMIN1, 0, ent); adm1Internal++; }
      else if (far[i] || far[j]) { addEdge(pts[i], pts[j], KIND.ADMIN1, FLAG.DISPUTED, ent); adm1Far++; }
      if (internal[i] && !internal[j] && !far[j]) adm1Ends.push(pts[i]);
      if (internal[j] && !internal[i] && !far[i]) adm1Ends.push(pts[j]);
    }
  }
  say(`admin-1 lines: ${adm1Internal} internal edges, ${adm1Far} one-sided edges, ${adm1Ends.length} ends on the outer boundary`);

  /* ================= 4. chains ================= */
  // graph over NE nodes
  const adj = new Map();   // node → [{ to, e }]
  const edgeList = [...edges.values()];
  edgeList.forEach((e, i) => { for (const [a, b] of [[e.a, e.b], [e.b, e.a]]) { let l = adj.get(a); if (!l) adj.set(a, l = []); l.push({ to: b, e: i }); } });
  const attr = (e) => e.kind * 4 + (e.flags & FLAG.DISPUTED ? 1 : 0);
  const isBreak = (node) => { const l = adj.get(node); if (l.length !== 2) return true; return attr(edgeList[l[0].e]) !== attr(edgeList[l[1].e]); };
  const chains = [];        // { nodes: [node…], kind, flags, ents }
  const edgeUsed = new Uint8Array(edgeList.length);
  const walk = (start, first) => {
    const e0 = edgeList[first.e];
    const nodes = [start, first.to]; edgeUsed[first.e] = 1;
    const ents = new Set(e0.ents);
    let cur = first.to, prevE = first.e;
    while (!isBreak(cur)) {
      const l = adj.get(cur); const nx = l[0].e === prevE ? l[1] : l[0];
      if (edgeUsed[nx.e]) break;
      edgeUsed[nx.e] = 1; for (const x of edgeList[nx.e].ents) ents.add(x);
      nodes.push(nx.to); prevE = nx.e; cur = nx.to;
      if (cur === start) break;
    }
    chains.push({ nodes, kind: e0.kind, flags: e0.flags, ents });
  };
  for (const [node, l] of adj) if (isBreak(node)) for (const first of l) if (!edgeUsed[first.e]) walk(node, first);
  // loops without a break: start at the smallest node
  for (let i = 0; i < edgeList.length; i++) if (!edgeUsed[i]) { const e = edgeList[i]; walk(Math.min(e.a, e.b), adj.get(Math.min(e.a, e.b)).find((x) => x.e === i)); }
  say(`chains: ${chains.length} (${chains.filter((c) => c.kind === KIND.BORDER && !(c.flags & 1)).length} shared borders, ${chains.filter((c) => c.kind === KIND.BORDER && (c.flags & 1)).length} one-sided, ${chains.filter((c) => c.kind === KIND.ADMIN1).length} admin-1)`);

  /* ================= 5. the planar graph: nodes, coast insertions, crossings, ends ================= */
  // Global vertex table: coast working vertices first (ids 0..nW-1), then NE nodes, then inserted points.
  const VX = [], VY = [], VSZ = [], VORIG = [];   // grown as arrays; typed later
  const vertAdd = (x, y, sz, orig) => { VX.push(x); VY.push(y); VSZ.push(sz); VORIG.push(orig); return VX.length - 1; };
  for (let w = 0; w < nW; w++) vertAdd(WX[w], WY[w], WSZ[w], WORIG[w]);
  const neVert = new Int32Array(NE.x.length);
  for (let i = 0; i < NE.x.length; i++) neVert[i] = vertAdd(NE.x[i], NE.y[i], 1e9, -1);
  const vertByKey = new Map();   // pkey → vertex id, for coast vertices and inserted points (NE nodes may coincide with neither)
  // two rings that touch at one quantised point (or a ring that touches itself) SHARE that vertex: the first
  // id is canonical, the others alias to it and the point is a junction. Measured at Smith Island: a line
  // through two coincident ids made a zero-length edge whose angle no walk can order, and a line edge
  // along a coast edge between the two ids did not dedupe into it.
  const wAlias = new Int32Array(nW); let coincident = 0;
  for (let w = 0; w < nW; w++) { const k = R.pkey(WX[w], WY[w]); const c = vertByKey.get(k); if (c == null) { vertByKey.set(k, w); wAlias[w] = w; } else { wAlias[w] = c; coincident++; } }
  for (let i = 0; i < NE.x.length; i++) { const k = R.pkey(NE.x[i], NE.y[i]); if (!vertByKey.has(k)) vertByKey.set(k, neVert[i]); }
  // coast insertions: segment s → [{ t, v }]
  const insert = new Map();
  const coastVertSet = new Set(); for (let w = 0; w < nW; w++) coastVertSet.add(w);   // every vertex that lies on a coast ring (working + inserted)
  const onCoast = (v) => coastVertSet.has(v);
  const coastJunction = new Uint8Array(nW);   // a working vertex that became a node
  // ONLY where a line reaches such a point do the coincident ids merge: elsewhere each ring stays the simple
  // cycle the walk relies on (a ring whose 28 m inlet collapsed onto itself must not become a spur with the
  // sea on both sides — measured: merging every coincident pair made 40 mixed cycles)
  const lineJunction = new Uint8Array(nW);
  const wid = (w) => (lineJunction[wAlias[w]] ? wAlias[w] : w);
  say(`${coincident} coast vertices coincide with an earlier one (rings touching at a point)`);
  report.coastCoincident = coincident;
  const pointOnCoast = (s, t) => {
    // a point on working segment s at parameter t → a vertex id (existing within 1 quantum, else inserted)
    const n = wNext(s);
    const x = Math.round(WX[s] + t * (WX[n] - WX[s])), y = Math.round(WY[s] + t * (WY[n] - WY[s]));
    if (Math.abs(x - WX[s]) <= 1 && Math.abs(y - WY[s]) <= 1) { coastJunction[s] = 1; lineJunction[wAlias[s]] = 1; return wAlias[s]; }
    if (Math.abs(x - WX[n]) <= 1 && Math.abs(y - WY[n]) <= 1) { coastJunction[n] = 1; lineJunction[wAlias[n]] = 1; return wAlias[n]; }
    const k = R.pkey(x, y);
    let v = vertByKey.get(k);
    if (v == null) { v = vertAdd(x, y, 1e9, -1); vertByKey.set(k, v); }
    if (!coastVertSet.has(v)) { coastVertSet.add(v); let l = insert.get(s); if (!l) insert.set(s, l = []); l.push({ t, v }); }
    return v;
  };
  // line edges as vertex-id pairs, with their chain attributes; each chain becomes a list of vertex ids
  // which crossings then split
  const lines = chains.map((c) => ({ v: c.nodes.map((n) => neVert[n]), kind: c.kind, flags: c.flags, ents: c.ents }));
  // crossings of every line edge with the working coast
  let crossings = 0, touches = 0;
  const crossAt = (x1, y1, x2, y2, x3, y3, x4, y4) => {
    // proper intersection of two segments in the (unwrapped) plane; returns [t, u] or null
    const d = (x2 - x1) * (y4 - y3) - (y2 - y1) * (x4 - x3);
    if (d === 0) return null;
    const t = ((x3 - x1) * (y4 - y3) - (y3 - y1) * (x4 - x3)) / d, u = ((x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1)) / d;
    if (t < 0 || t > 1 || u < 0 || u > 1) return null;   // inclusive: a line through a coast vertex, or a NE vertex on a coast segment, is a junction too
    return [t, u];
  };
  function cutAtCoast() {
  let n = 0;
  for (const L of lines) {
    const out = [L.v[0]];
    for (let i = 1; i < L.v.length; i++) {
      const a = L.v[i - 1], b = L.v[i];
      const x1 = VX[a], y1 = VY[a]; let x2 = VX[b], y2 = VY[b];
      if (x2 - x1 > X180) x2 -= 2 * X180; else if (x1 - x2 > X180) x2 += 2 * X180;
      const hits = [];
      const rU = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) / 2 + 2;
      cidx.near(Math.round((x1 + x2) / 2), Math.round((y1 + y2) / 2), rU, (s) => {
        if (ringTiny[WRING[s]]) return;
        const n = wNext(s);
        let x3 = WX[s], y3 = WY[s], x4 = WX[n], y4 = WY[n];
        if (x3 - x1 > X180) { x3 -= 2 * X180; x4 -= 2 * X180; } else if (x1 - x3 > X180) { x3 += 2 * X180; x4 += 2 * X180; }
        if (x4 - x3 > X180) x4 -= 2 * X180; else if (x3 - x4 > X180) x4 += 2 * X180;
        const r = crossAt(x1, y1, x2, y2, x3, y3, x4, y4);
        if (r) hits.push({ t: r[0], s, u: r[1] });
      });
      hits.sort((p, q) => p.t - q.t);
      for (const h of hits) { const v = pointOnCoast(h.s, h.u); if (v !== a && v !== b && v !== out[out.length - 1]) { out.push(v); n++; } }
      if (b !== out[out.length - 1]) out.push(b);
    }
    L.v = out;
  }
  return n;
  }
  // a crossing snapped onto a coast vertex bends the line by a quantum, which can graze the next coast
  // segment: cut again until nothing is left to cut (measured: 4 such grazes on the first build)
  for (let round = 0; round < 6; round++) { const n = cutAtCoast(); crossings += n; say(`crossings: round ${round}: ${n} line/coast crossings inserted`); if (!n) break; }
  // lines against lines: NE polygons overlap here and there (Phase 0: Costa Rica and Nicaragua on the San
  // Juan's bar) and two one-sided versions of a line can crisscross; every such crossing is a node too
  let lineCrossings = 0;
  { const E = []; lines.forEach((L, li) => { for (let i = 1; i < L.v.length; i++) E.push(li, i - 1); });
    const nE = E.length / 2;
    const ex = (k) => { const L = lines[E[2 * k]], a = L.v[E[2 * k + 1]], b = L.v[E[2 * k + 1] + 1]; return [VX[a], VY[a], VX[b], VY[b]]; };
    const eidx = SegIndex.build(nE, CELL, ex);
    const hits = new Map();   // line index → [{ i, t, v }]
    eidx.pairs((p, q) => {
      const Lp = lines[E[2 * p]], Lq = lines[E[2 * q]], ip = E[2 * p + 1], iq = E[2 * q + 1];
      const a = Lp.v[ip], b = Lp.v[ip + 1], c = Lq.v[iq], d = Lq.v[iq + 1];
      if (a === c || a === d || b === c || b === d) return;
      let x1 = VX[a], y1 = VY[a], x2 = VX[b], y2 = VY[b], x3 = VX[c], y3 = VY[c], x4 = VX[d], y4 = VY[d];
      if (x2 - x1 > X180) x2 -= 2 * X180; else if (x1 - x2 > X180) x2 += 2 * X180;
      if (x3 - x1 > X180) { x3 -= 2 * X180; x4 -= 2 * X180; } else if (x1 - x3 > X180) { x3 += 2 * X180; x4 += 2 * X180; }
      if (x4 - x3 > X180) x4 -= 2 * X180; else if (x3 - x4 > X180) x4 += 2 * X180;
      const r = crossAt(x1, y1, x2, y2, x3, y3, x4, y4); if (!r) return;
      let px = Math.round(x1 + r[0] * (x2 - x1)), py = Math.round(y1 + r[0] * (y2 - y1));
      if (px >= X180) px -= 2 * X180; if (px < -X180) px += 2 * X180;
      const k = R.pkey(px, py); let v = vertByKey.get(k); if (v == null) { v = vertAdd(px, py, 1e9, -1); vertByKey.set(k, v); }
      for (const [li, i, tt] of [[E[2 * p], ip, r[0]], [E[2 * q], iq, r[1]]]) { let l = hits.get(li); if (!l) hits.set(li, l = []); l.push({ i, t: tt, v }); }
      lineCrossings++;
    });
    for (const [li, l] of hits) {
      const L = lines[li]; const byEdge = new Map(); for (const h of l) { let a = byEdge.get(h.i); if (!a) byEdge.set(h.i, a = []); a.push(h); }
      const out = [L.v[0]];
      for (let i = 1; i < L.v.length; i++) { const a = byEdge.get(i - 1); if (a) { a.sort((p, q) => p.t - q.t); for (const h of a) if (h.v !== out[out.length - 1]) out.push(h.v); } if (L.v[i] !== out[out.length - 1]) out.push(L.v[i]); }
      L.v = out;
    }
  }
  say(`crossings: ${lineCrossings} line/line crossings inserted`);
  /* A line vertex within a quantum and a half of a coast segment — a border that hugs a straight OSM
     shore (the Delaware–Maryland line at Fenwick Island, the Maryland–Virginia line past Smith Island,
     measured) — is snapped ONTO the shore. Left where it was, the line crosses the shore just before and
     after it, and the sliver between the two leaves two edges at a node pointing the same way, which no
     angular order can tell apart: the face walk then leaks the ocean onto land. On the shore, the line's
     edges coincide with the coast's and dedupe into them, which is what a border along a coast is. */
  let hugged = 0;
  { const alias = new Map();
    const HUG_M = 1.5 * Q * 111320;
    for (const L of lines) for (const v of L.v) { if (onCoast(v) || alias.has(v)) continue; const near = nearestCoast(VX[v], VY[v], HUG_M, true); if (!near) continue; const pv = pointOnCoast(near.seg, near.t); if (pv === v) continue; alias.set(v, pv); hugged++; log.snap({ source: L.kind === KIND.ADMIN1 ? SRC.adm1 : SRC.adm0, kind: "line-vertex-hugging-coast→coast", from: deg(VX[v], VY[v]), to: deg(VX[pv], VY[pv]), metres: near.metres }); }
    if (alias.size) for (const L of lines) { const out = []; for (const v of L.v) { const w = alias.has(v) ? alias.get(v) : v; if (w !== out[out.length - 1]) out.push(w); } L.v = out; }
  }
  say(`${hugged} line vertices hugging the coast snapped onto it`);
  if (hugged) for (let round = 0; round < 6; round++) { const n = cutAtCoast(); crossings += n; if (!n) break; say(`crossings after the snap: round ${round}: ${n} inserted`); }
  report.crossings = { lineCoast: crossings, lineLine: lineCrossings, hugged };
  // ends: a line vertex of degree 1 in the line graph (counting all lines)
  const lineDeg = new Map(); const bump = (v) => lineDeg.set(v, (lineDeg.get(v) || 0) + 1);
  for (const L of lines) { bump(L.v[0]); bump(L.v[L.v.length - 1]); }
  let endsJoined = 0, tailsCut = 0, endsInWater = 0, endsUnjoined = 0, adm1ToLine = 0;
  const joinEnd = (L, atStart) => {
    const v = atStart ? L.v[0] : L.v[L.v.length - 1];
    if (lineDeg.get(v) !== 1 || onCoast(v)) return;
    const x = VX[v], y = VY[v];
    const srcId = L.kind === KIND.ADMIN1 ? SRC.adm1 : SRC.adm0;
    const land = onLand(x, y);
    // an admin-1 end may belong on an admin-0 line rather than the coast
    let lineHit = null;
    if (L.kind === KIND.ADMIN1) { const nl = nearestLine(x, y, TOLERANCE_M[srcId]); if (nl) lineHit = nl; }
    const near = nearestCoast(x, y, TOLERANCE_M[srcId], true);
    // only when the line is nearer than the coast (or no coast is near): the join segment is then shorter than
    // the distance to the coast and cannot cross it. An end over water never joins a line across the shore —
    // its tail over water is cut back to the coast below (Fenwick Island, 2026-10-08: such a join through
    // the coast let the ocean walk onto the island)
    if (lineHit && (!near || lineHit.metres <= near.metres)) {
      // project onto the admin-0 edge: find the line that holds that edge and insert the point into it
      const e = adm0Edges[lineHit.edge];
      const pa = neVert[e.a], pb = neVert[e.b];
      const px = Math.round(NE.x[e.a] + lineHit.t * (NE.x[e.b] - NE.x[e.a])), py = Math.round(NE.y[e.a] + lineHit.t * (NE.y[e.b] - NE.y[e.a]));
      let target = null;
      for (const M of lines) { if (M === L) continue; for (let i = 1; i < M.v.length; i++) { if ((M.v[i - 1] === pa && M.v[i] === pb) || (M.v[i - 1] === pb && M.v[i] === pa)) { target = { M, i }; break; } } if (target) break; }
      if (target) {
        let pv;
        if (Math.abs(px - VX[pa]) <= 1 && Math.abs(py - VY[pa]) <= 1) pv = pa;
        else if (Math.abs(px - VX[pb]) <= 1 && Math.abs(py - VY[pb]) <= 1) pv = pb;
        else { pv = vertAdd(px, py, 1e9, -1); target.M.v.splice(target.i, 0, pv); }
        if (pv !== v) { if (atStart) L.v.unshift(pv); else L.v.push(pv); }
        bump(pv); bump(pv);   // the admin-0 line now passes through it, plus this end
        log.snap({ source: srcId, kind: "admin1-end→admin0-line", from: deg(x, y), to: deg(px, py), metres: lineHit.metres });
        adm1ToLine++; endsJoined++;
        return;
      }
    }
    if (land === false) {
      // over water: cut the tail back to the last coast vertex of this line, if the tail is short
      const idx = atStart ? L.v.findIndex((u) => onCoast(u)) : (() => { for (let i = L.v.length - 1; i >= 0; i--) if (onCoast(L.v[i])) return i; return -1; })();
      if (idx >= 0) {
        const tail = atStart ? L.v.slice(0, idx + 1) : L.v.slice(idx);
        let m = 0; for (let i = 1; i < tail.length; i++) m += R.metres(VX[tail[i - 1]], VY[tail[i - 1]], VX[tail[i]], VY[tail[i]]);
        if (m <= 4 * TOLERANCE_M[srcId]) { if (atStart) L.v = L.v.slice(idx); else L.v = L.v.slice(0, idx + 1); tailsCut++; log.event("tail-over-water-cut", { kind: L.kind, metres: Math.round(m), at: deg(x, y) }); return; }
        log.event("tail-over-water-kept", { kind: L.kind, metres: Math.round(m), at: deg(x, y) });
      }
      endsInWater++;
      log.event("end-in-water", { kind: L.kind, at: deg(x, y), ents: [...L.ents].map((e) => entities[e].a3) });
      return;
    }
    if (near) {
      const pv = pointOnCoast(near.seg, near.t);
      if (pv !== v) { if (atStart) L.v.unshift(pv); else L.v.push(pv); }
      bump(pv);
      log.snap({ source: srcId, kind: L.kind === KIND.ADMIN1 ? "admin1-end→coast" : "border-end→coast", from: deg(x, y), to: deg(VX[pv], VY[pv]), metres: near.metres, ents: [...L.ents].map((e) => entities[e].a3) });
      endsJoined++;
      return;
    }
    endsUnjoined++;
    log.event("end-unjoined", { kind: L.kind, at: deg(x, y), ents: [...L.ents].map((e) => entities[e].a3), land });
  };
  for (const L of lines) { joinEnd(L, true); joinEnd(L, false); }
  say(`ends: ${endsJoined} joined to the coast or an admin-0 line (${adm1ToLine} admin-1 ends onto admin-0 lines), ${tailsCut} tails over water cut, ${endsInWater} ends left over water, ${endsUnjoined} could not be joined`);
  report.ends = { joined: endsJoined, adm1ToLine, tailsCut, inWater: endsInWater, unjoined: endsUnjoined };

  /* ================= 6. arcs ================= */
  // materialise coast rings with insertions; junctions = inserted points and vertices flagged coastJunction
  const vertDeg = new Map();   // vertex → number of line incidences (for junction detection on lines)
  for (const L of lines) for (const v of L.v) vertDeg.set(v, (vertDeg.get(v) || 0) + 1);
  const isNodeV = new Uint8Array(VX.length);   // a vertex where an arc must end
  for (const L of lines) { isNodeV[L.v[0]] = 1; isNodeV[L.v[L.v.length - 1]] = 1; }
  for (const [v, d] of vertDeg) if (d >= 2) isNodeV[v] = 1;   // interior to a line AND (another line passes or it is also a coast vertex)
  for (const l of insert.values()) for (const ins of l) isNodeV[ins.v] = 1;
  for (let w = 0; w < nW; w++) if (coastJunction[w]) isNodeV[wid(w)] = 1;
  // a line's interior vertex that is on the coast is a node too (a crossing snapped to a coast vertex)
  for (const L of lines) for (const v of L.v) if (onCoast(v)) isNodeV[v] = 1;
  const arcs = [];   // { v: [vertex ids], kind, source, flags, closed }
  const arcKey = new Map();
  const registerArc = (seq, kind, source, flags) => {
    const fk = seq.join(","), bk = seq.slice().reverse().join(",");
    let i = arcKey.get(fk); if (i != null) return i + 1;
    i = arcKey.get(bk); if (i != null) return -(i + 1);
    i = arcs.length; arcs.push({ v: seq, kind, source, flags, closed: seq[0] === seq[seq.length - 1] }); arcKey.set(fk, i); return i + 1;
  };
  let coastArcs = 0;
  for (let r = 0; r < ringsKept; r++) {
    const seq = [];
    for (let w = wRingStart[r]; w < wRingStart[r + 1]; w++) { seq.push(wid(w)); const l = insert.get(w); if (l) { l.sort((p, q) => p.t - q.t); for (const ins of l) seq.push(ins.v); } }
    const n = seq.length;
    let first = -1; for (let i = 0; i < n; i++) if (isNodeV[seq[i]]) { first = i; break; }
    if (first < 0) { let m = 0; for (let i = 1; i < n; i++) if (seq[i] < seq[m]) m = i; const ring = seq.slice(m).concat(seq.slice(0, m)); ring.push(ring[0]); registerArc(ring, KIND.COAST, SRC_I.coast, 0); coastArcs++; continue; }
    let cur = [seq[first]];
    for (let s = 1; s <= n; s++) { const v = seq[(first + s) % n]; cur.push(v); if (isNodeV[v] || s === n) { registerArc(cur, KIND.COAST, SRC_I.coast, 0); coastArcs++; cur = [v]; } }
  }
  let lineArcs = 0;
  for (const L of lines) {
    if (L.v.length < 2) continue;
    let cur = [L.v[0]];
    for (let i = 1; i < L.v.length; i++) { cur.push(L.v[i]); if (isNodeV[L.v[i]] || i === L.v.length - 1) { if (cur.length >= 2 && !(cur.length === 2 && cur[0] === cur[1])) { registerArc(cur, L.kind, L.kind === KIND.ADMIN1 ? SRC_I.adm1 : SRC_I.adm0, L.flags); lineArcs++; } cur = [L.v[i]]; } }
  }
  say(`arcs: ${arcs.length} (${coastArcs} coast, ${lineArcs} line)`);

  /* ================= 7. the face walk ================= */
  const nA = arcs.length;
  const incident = new Map();   // vertex → [{ arc, dir }] half-arcs leaving the vertex
  const addInc = (v, arc, dir) => { let l = incident.get(v); if (!l) incident.set(v, l = []); l.push({ arc, dir }); };
  arcs.forEach((a, i) => { addInc(a.v[0], i, 1); addInc(a.v[a.v.length - 1], i, -1); });
  const angleOut = (arc, dir) => {
    const a = arcs[arc]; const v0 = dir > 0 ? a.v[0] : a.v[a.v.length - 1], v1 = dir > 0 ? a.v[1] : a.v[a.v.length - 2];
    let dx = VX[v1] - VX[v0]; if (dx > X180) dx -= 2 * X180; else if (dx < -X180) dx += 2 * X180;
    return Math.atan2(VY[v1] - VY[v0], dx * Math.cos(VY[v0] * Q * Math.PI / 180));
  };
  let angleTies = 0;
  for (const [v, l] of incident) { for (const h of l) h.ang = angleOut(h.arc, h.dir); l.sort((p, q) => p.ang - q.ang); for (let i = 1; i < l.length; i++) if (Math.abs(l[i].ang - l[i - 1].ang) < 1e-7) { angleTies++; if (angleTies <= 20) log.event("angle-tie-at-node", { at: deg(VX[v], VY[v]), arcs: [l[i - 1].arc, l[i].arc], kinds: [arcs[l[i - 1].arc].kind, arcs[l[i].arc].kind] }); } }
  if (angleTies) say(`  ⚠ ${angleTies} nodes have two arcs leaving in the same direction`);
  if (process.env.DEBUG_NODE) for (const [dlon, dlat, dr] of process.env.DEBUG_NODE.split(";").map((s) => s.split(",").map(Number))) {
    const x = R.U(dlon), y = R.U(dlat), r = R.U(dr || 0.01);
    for (const [v, l] of incident) if (Math.abs(VX[v] - x) <= r && Math.abs(VY[v] - y) <= r) console.log(`  DEBUG node ${v} at ${deg(VX[v], VY[v])} onCoast ${onCoast(v)}: ` + l.map((h) => { const a = arcs[h.arc]; const v1 = h.dir > 0 ? a.v[1] : a.v[a.v.length - 2]; return `arc${h.arc}${h.dir > 0 ? "+" : "-"} k${a.kind} f${a.flags} n${a.v.length} ang ${h.ang.toFixed(4)} → ${deg(VX[v1], VY[v1])}${a.closed ? " closed" : ""}`; }).join(" | "));
  }
  report.angleTies = angleTies;
  const nextHalf = (arc, dir) => {
    // arriving at the end of (arc, dir): the next half-arc for the left face = the one just clockwise of our reverse
    const a = arcs[arc]; const end = dir > 0 ? a.v[a.v.length - 1] : a.v[0];
    const l = incident.get(end);
    const rev = l.findIndex((h) => h.arc === arc && h.dir === -dir);
    const i = (rev - 1 + l.length) % l.length;   // sorted ascending by angle: clockwise = previous
    return l[i];
  };
  const halfKey = (arc, dir) => arc * 2 + (dir > 0 ? 0 : 1);
  const cycleOf = new Int32Array(nA * 2).fill(-1);
  const cycles = [];   // { halves: [[arc,dir]…], land: bool, area: steradians…, outer }
  for (let a = 0; a < nA; a++) for (const dir of [1, -1]) {
    if (cycleOf[halfKey(a, dir)] >= 0) continue;
    const halves = []; let cur = { arc: a, dir }; let guard = 0;
    while (cycleOf[halfKey(cur.arc, cur.dir)] < 0 && guard++ < 1e7) { cycleOf[halfKey(cur.arc, cur.dir)] = cycles.length; halves.push([cur.arc, cur.dir]); cur = nextHalf(cur.arc, cur.dir); }
    cycles.push({ halves });
  }
  say(`face walk: ${cycles.length} cycles from ${nA * 2} half-arcs`);
  // classify and measure
  const vec = (v) => G.vec(VX[v], VY[v], Q);
  const P = [0, 0, 1];
  const tri = (a, b) => { const num = G.dot(P, G.cross(a, b)); const den = 1 + G.dot(P, a) + G.dot(a, b) + G.dot(b, P); return 2 * Math.atan2(num, den); };
  const arcArea = new Float64Array(nA), arcLenM = new Float64Array(nA);
  arcs.forEach((a, i) => { let s = 0, m = 0; for (let k = 1; k < a.v.length; k++) { const p = vec(a.v[k - 1]), q = vec(a.v[k]); s += tri(p, q); m += G.chordMetres(p, q); } arcArea[i] = s; arcLenM[i] = m; });
  const R2 = G.R_EARTH_M * G.R_EARTH_M / 1e6;
  let mixed = 0;
  for (const c of cycles) {
    let landVotes = 0, seaVotes = 0, area = 0;
    for (const [a, d] of c.halves) { if (arcs[a].kind === KIND.COAST) { if (d > 0) landVotes++; else seaVotes++; } area += d > 0 ? arcArea[a] : -arcArea[a]; }
    c.land = seaVotes === 0;   // no coast at all → land (a border loop); any sea-side coast → sea
    if (landVotes && seaVotes) { mixed++; c.mixed = true; c.land = landVotes >= seaVotes; }
    let A = area % (4 * Math.PI); if (A < 0) A += 4 * Math.PI;
    c.km2 = A * R2; c.outer = A < 2 * Math.PI;
  }
  if (mixed) { say(`  ⚠ ${mixed} cycles walk coast on both sides (a crossing the planar graph missed)`); for (const c of cycles) if (c.mixed) { const [a] = c.halves[0]; let land = 0, sea = 0; for (const [x, d] of c.halves) if (arcs[x].kind === KIND.COAST) { if (d > 0) land++; else sea++; } const minority = land < sea ? 1 : -1; const where = c.halves.filter(([x, d]) => arcs[x].kind === KIND.COAST && d === minority).slice(0, 6).map(([x, d]) => ({ arc: x, len: arcs[x].v.length, at: deg(VX[arcs[x].v[0]], VY[arcs[x].v[0]]) })); const half = ([x, d]) => { const v = arcs[x].v; const s0 = d > 0 ? v[0] : v[v.length - 1], s1 = d > 0 ? v[v.length - 1] : v[0]; return `${x}${d > 0 ? "+" : "-"}k${arcs[x].kind}f${arcs[x].flags}n${v.length}@${deg(VX[s0], VY[s0]).map((q) => q.toFixed(5))}→${deg(VX[s1], VY[s1]).map((q) => q.toFixed(5))}`; }; const ctx = []; if (c.halves.length <= 80) ctx.push(c.halves.map(half)); else c.halves.forEach(([x, d], i) => { if (arcs[x].kind === KIND.COAST && d === minority) ctx.push(c.halves.slice(Math.max(0, i - 3), i + 4).map(half)); }); log.event("cycle-mixed", { halves: c.halves.length, land, sea, at: deg(VX[arcs[a].v[0]], VY[arcs[a].v[0]]), minorityCoast: where, context: ctx.slice(0, 8) }); if (process.env.DEBUG_NODE) for (const line of ctx.slice(0, 8)) say("  mixed cycle: " + line.join(" ")); } }
  if (process.env.DEBUG_STOP === "walk") { say("DEBUG_STOP=walk: stopping after the face walk"); log.write(path.join(OUT, "admin-log-walk.json")); process.exit(0); }
  const landCycles = cycles.filter((c) => c.land);
  const outers = landCycles.filter((c) => c.outer), holes = landCycles.filter((c) => !c.outer);
  say(`cycles: ${landCycles.length} land (${outers.length} outer, ${holes.length} holes), ${cycles.length - landCycles.length} sea`);
  // bbox + a point for each cycle (first vertex)
  const cycleVerts = (c) => { const out = []; for (const [a, d] of c.halves) { const v = arcs[a].v; if (d > 0) for (let i = 0; i < v.length - 1; i++) out.push(v[i]); else for (let i = v.length - 1; i > 0; i--) out.push(v[i]); } return out; };
  const bboxOf = (vs) => { let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity; const bx = VX[vs[0]]; for (const v of vs) { let x = VX[v]; if (x - bx > X180) x -= 2 * X180; else if (x - bx < -X180) x += 2 * X180; if (x < x0) x0 = x; if (x > x1) x1 = x; if (VY[v] < y0) y0 = VY[v]; if (VY[v] > y1) y1 = VY[v]; } return { x0, x1, y0, y1, bx }; };
  const pointInPoly = (px, py, vs, polar) => {
    // even-odd in the polygon's unwrapped frame; a polar ring is closed through the pole
    const bx = VX[vs[0]]; const ux = (x) => { if (x - bx > X180) x -= 2 * X180; else if (x - bx < -X180) x += 2 * X180; return x; };
    const n = vs.length; let inside = false;
    const X = new Float64Array(n + (polar ? 2 : 0)), Y = new Float64Array(n + (polar ? 2 : 0));
    let cum = VX[vs[0]]; X[0] = cum; Y[0] = VY[vs[0]];
    for (let i = 1; i < n; i++) { let dx = VX[vs[i]] - VX[vs[i - 1]]; if (dx > X180) dx -= 2 * X180; else if (dx < -X180) dx += 2 * X180; cum += dx; X[i] = cum; Y[i] = VY[vs[i]]; }
    let m = n;
    if (polar) { const pole = polar < 0 ? -R.Y90 : R.Y90; X[n] = X[n - 1]; Y[n] = pole; X[n + 1] = X[0]; Y[n + 1] = pole; m = n + 2; }
    for (const qx of [ux(px), ux(px) + 2 * X180, ux(px) - 2 * X180]) {
      inside = false;
      for (let i = 0, j = m - 1; i < m; j = i++) { if ((Y[i] > py) !== (Y[j] > py) && qx < (X[j] - X[i]) * (py - Y[i]) / (Y[j] - Y[i]) + X[i]) inside = !inside; }
      if (inside) return true;
    }
    return false;
  };
  const turnOf = (vs) => { let t = 0; for (let i = 1; i <= vs.length; i++) { let dx = VX[vs[i % vs.length]] - VX[vs[i - 1]]; if (dx > X180) dx -= 2 * X180; else if (dx < -X180) dx += 2 * X180; t += dx; } return t; };
  for (const c of landCycles) { c.vs = cycleVerts(c); c.bb = bboxOf(c.vs); const t = turnOf(c.vs); c.polar = Math.abs(t) > X180 ? (c.bb.y0 + c.bb.y1 < 0 ? -1 : 1) : 0; }
  // holes → their outer: the smallest outer cycle containing the hole's first vertex
  // a hole's enclosing piece is the smallest outer cycle containing a point just LEFT of the hole's first
  // segment (the enclosing land side) — never an outer that shares an arc with the hole: the outside of a
  // lone enclave loop (Lesotho, Adygea, the Vatican) walks the same arc as the enclave's own piece, and a
  // test on a boundary vertex once made the enclave its own hole
  const leftOf = (c) => { const [a, d] = c.halves[0]; const v = arcs[a].v; const i0 = d > 0 ? 0 : v.length - 1, i1 = d > 0 ? 1 : v.length - 2; let dx = VX[v[i1]] - VX[v[i0]]; if (dx > X180) dx -= 2 * X180; else if (dx < -X180) dx += 2 * X180; const dy = VY[v[i1]] - VY[v[i0]]; const L = Math.hypot(dx, dy) || 1; const off = Math.max(2, Math.min(20, L / 4)); let x = Math.round(VX[v[i0]] + dx / 2 - dy / L * off), y = Math.round(VY[v[i0]] + dy / 2 + dx / L * off); if (x >= X180) x -= 2 * X180; if (x < -X180) x += 2 * X180; return [x, y]; };
  for (const h of holes) {
    const [px, py] = leftOf(h);
    const hArcs = new Set(h.halves.map((x) => x[0]));
    let best = null;
    for (const o of outers) {
      if (o.polar === 0) { const b = o.bb; let x = px; if (x - b.bx > X180) x -= 2 * X180; else if (x - b.bx < -X180) x += 2 * X180; if (x < b.x0 || x > b.x1 || py < b.y0 || py > b.y1) continue; }
      if (best && o.km2 >= best.km2) continue;
      if (o.halves.some((x) => hArcs.has(x[0]))) continue;
      if (pointInPoly(px, py, o.vs, o.polar)) best = o;
    }
    if (best) { (best.holes || (best.holes = [])).push(h); h.outerOf = best; } else log.event("hole-without-outer", { km2: Math.round(h.km2), at: deg(px, py) });
  }
  const pieces = outers;   // each outer cycle with its holes is a piece
  say(`pieces: ${pieces.length}`);

  /* ================= 8. labelling ================= */
  // NE polygons as unwrapped rings with a latitude-band edge index, per entity (admin-0) and per unit (admin-1)
  function polyIndex(ringsOf) {
    // ringsOf: [{ pts }] → { contains(x, y) }
    const bands = new Map(); const BAND = Math.round(0.1 / Q);
    const edgesX = [], edgesY = [];
    for (const Rg of ringsOf) {
      const pts = Rg.pts, n = pts.length; const { turn } = R.ringAreaAndTurn(pts);
      const X = new Float64Array(n + 2), Y = new Float64Array(n + 2); let cum = pts[0][0]; X[0] = cum; Y[0] = pts[0][1];
      for (let i = 1; i < n; i++) { let dx = pts[i][0] - pts[i - 1][0]; if (dx > X180) dx -= 2 * X180; else if (dx < -X180) dx += 2 * X180; cum += dx; X[i] = cum; Y[i] = pts[i][1]; }
      let m = n;
      if (Math.abs(turn) > X180) { const pole = (pts.reduce((s, p) => s + p[1], 0) / n) < 0 ? -R.Y90 : R.Y90; X[n] = X[n - 1]; Y[n] = pole; X[n + 1] = X[0]; Y[n + 1] = pole; m = n + 2; }
      for (let i = 0, j = m - 1; i < m; j = i++) {
        const e = edgesX.length; edgesX.push(X[i], X[j]); edgesY.push(Y[i], Y[j]);
        const lo = Math.floor(Math.min(Y[i], Y[j]) / BAND), hi = Math.floor(Math.max(Y[i], Y[j]) / BAND);
        for (let b = lo; b <= hi; b++) { let l = bands.get(b); if (!l) bands.set(b, l = []); l.push(e); }
      }
    }
    return {
      contains(px, py) {
        const l = bands.get(Math.floor(py / BAND)); if (!l) return false;
        for (const qx of [px, px + 2 * X180, px - 2 * X180]) {
          let inside = false;
          for (const e of l) { const xi = edgesX[e], xj = edgesX[e + 1], yi = edgesY[e], yj = edgesY[e + 1]; if ((yi > py) !== (yj > py) && qx < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside; }
          if (inside) return true;
        }
        return false;
      },
    };
  }
  const entPoly = entities.map((_, e) => polyIndex(neRings.filter((r) => r.layer === 0 && r.ent === e)));
  const entBox = entities.map((_, e) => { let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity; for (const r of neRings) if (r.layer === 0 && r.ent === e) for (const p of r.pts) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; } return { x0, x1, y0, y1 }; });
  const unitPoly = units.map((_, u) => polyIndex(neRings.filter((r) => r.layer === 1 && r.unit === u)));
  const unitBox = units.map((_, u) => { let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity; for (const r of neRings) if (r.layer === 1 && r.unit === u) for (const p of r.pts) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; } return { x0, x1, y0, y1 }; });
  const inBox = (b, x, y) => x >= b.x0 - 2 && x <= b.x1 + 2 && y >= b.y0 - 2 && y <= b.y1 + 2;
  // NE vertex grid for proximity labelling
  const neGrid = new Map(); const NG = Math.round(0.25 / Q);
  for (const Rg of neRings) if (Rg.layer === 0) for (const p of Rg.pts) { const k = Math.floor(p[0] / NG) * 100003 + Math.floor(p[1] / NG); let l = neGrid.get(k); if (!l) neGrid.set(k, l = []); l.push(p[0], p[1], Rg.ent); }
  const nearestEntity = (x, y, maxM) => {
    const ky = KM_PER_U, kx = KM_PER_U * Math.cos(y * Q * Math.PI / 180); let best = null;
    for (let rad = 1; rad <= 8; rad *= 2) {
      const cx = Math.floor(x / NG), cy = Math.floor(y / NG);
      for (let i = -rad; i <= rad; i++) for (let j = -rad; j <= rad; j++) { const l = neGrid.get((cx + i) * 100003 + (cy + j)); if (!l) continue; for (let k = 0; k < l.length; k += 3) { const m = Math.hypot((l[k] - x) * kx, (l[k + 1] - y) * ky) * 1000; if (!best || m < best.m) best = { m, ent: l[k + 2] }; } }
      if (best && best.m <= rad * NG * KM_PER_U * 1000 * 0.9) break;
    }
    return best && best.m <= maxM ? best : null;
  };
  // interior sample points of a piece
  const samplesOf = (c) => {
    const vs = c.vs, out = [];
    const inPiece = (x, y) => pointInPoly(x, y, vs, c.polar) && !(c.holes || []).some((h) => pointInPoly(x, y, h.vs, h.polar));
    // centroid (planar, unwrapped)
    { let sx = 0, sy = 0; const bx = VX[vs[0]]; for (const v of vs) { let x = VX[v]; if (x - bx > X180) x -= 2 * X180; else if (x - bx < -X180) x += 2 * X180; sx += x; sy += VY[v]; } const cx = Math.round(sx / vs.length), cy = Math.round(sy / vs.length); if (inPiece(cx, cy)) out.push([cx, cy]); }
    // midpoint of the longest run of a horizontal scanline through the bbox centre
    { const b = c.bb; const py = Math.round((b.y0 + b.y1) / 2); const xs = []; const n = vs.length;
      for (let i = 0, j = n - 1; i < n; j = i++) { const yi = VY[vs[i]], yj = VY[vs[j]]; if ((yi > py) !== (yj > py)) { let xi = VX[vs[i]], xj = VX[vs[j]]; if (xj - xi > X180) xj -= 2 * X180; else if (xi - xj > X180) xj += 2 * X180; xs.push(xi + (xj - xi) * (py - yi) / (yj - yi)); } }
      xs.sort((p, q) => p - q);
      let bestL = -1, bestX = null; for (let k = 0; k + 1 < xs.length; k += 2) { const L = xs[k + 1] - xs[k]; if (L > bestL) { bestL = L; bestX = (xs[k] + xs[k + 1]) / 2; } }
      if (bestX != null) { let x = Math.round(bestX); if (x >= X180) x -= 2 * X180; if (x < -X180) x += 2 * X180; if (inPiece(x, py)) out.push([x, py]); } }
    // left-offset midpoints of up to three edges
    const NS = Math.min(10, c.halves.length);
    for (let k = 0; k < NS; k++) {
      const [a, d] = c.halves[Math.floor(k * c.halves.length / NS)]; const v = arcs[a].v;
      const i0 = d > 0 ? 0 : v.length - 1, i1 = d > 0 ? 1 : v.length - 2;
      let dx = VX[v[i1]] - VX[v[i0]]; if (dx > X180) dx -= 2 * X180; else if (dx < -X180) dx += 2 * X180; const dy = VY[v[i1]] - VY[v[i0]];
      const L = Math.hypot(dx, dy) || 1; const off = Math.max(3, Math.min(40, L / 4));
      let x = Math.round(VX[v[i0]] + dx / 2 - dy / L * off), y = Math.round(VY[v[i0]] + dy / 2 + dx / L * off);
      if (x >= X180) x -= 2 * X180; if (x < -X180) x += 2 * X180;
      if (inPiece(x, y)) out.push([x, y]);
    }
    return out;
  };
  let byContainment = 0, byProximity = 0, unmappedPieces = 0, ties = 0, adm1ByContainment = 0, adm1ByProximity = 0, adm1Missing = 0;
  const DBG = process.env.DEBUG_PIECE_AT ? process.env.DEBUG_PIECE_AT.split(";").map((s) => s.split(",").map(Number)) : [];
  for (const c of pieces) {
    const samples = samplesOf(c);
    c.samples = samples;
    for (const [dlon, dlat] of DBG) { const b = c.bb; let x = R.U(dlon); if (x - b.bx > X180) x -= 2 * X180; else if (x - b.bx < -X180) x += 2 * X180; if (x >= b.x0 && x <= b.x1 && R.U(dlat) >= b.y0 && R.U(dlat) <= b.y1 && c.km2 < 2e7) console.log(`  DEBUG piece near ${dlon},${dlat}: km2 ${c.km2.toFixed(1)} halves ${c.halves.length} polar ${c.polar} vs ${c.vs.length} bbox ${deg(b.x0, b.y0)}–${deg(b.x1, b.y1)} samples ${JSON.stringify(samples.map((s) => deg(s[0], s[1])))} first-vertex-inside ${pointInPoly(VX[c.vs[0]] + 1, VY[c.vs[0]] + 1, c.vs, c.polar)}`); }
    const votes = new Map();
    for (const [x, y] of samples) for (let e = 0; e < nAdm0; e++) if (inBox(entBox[e], x, y) && entPoly[e].contains(x, y)) votes.set(e, (votes.get(e) || 0) + 1);
    let ent = -1;
    for (const [dlon, dlat] of DBG) { const b = c.bb; let x = R.U(dlon); if (x - b.bx > X180) x -= 2 * X180; else if (x - b.bx < -X180) x += 2 * X180; if (x >= b.x0 && x <= b.x1 && R.U(dlat) >= b.y0 && R.U(dlat) <= b.y1 && c.km2 < 2e7) console.log(`  DEBUG votes ${JSON.stringify([...votes.entries()].map(([e, n]) => [entities[e].a3, n]))}`); }
    if (votes.size) {
      const sorted = [...votes.entries()].sort((p, q) => q[1] - p[1]);
      ent = sorted[0][0];
      if (sorted.length > 1 && sorted[0][1] === sorted[1][1]) { ties++; log.event("label-tie", { km2: Math.round(c.km2), ents: sorted.map((s) => entities[s[0]].a3), at: deg(samples[0][0], samples[0][1]) }); }
      byContainment++;
    } else if (samples.length) {
      const near = nearestEntity(samples[0][0], samples[0][1], 60000);
      if (near) { ent = near.ent; byProximity++; c.byProximity = near.m; } else unmappedPieces++;
    } else { unmappedPieces++; log.event("piece-without-interior-point", { km2: Math.round(c.km2), halves: c.halves.length }); }
    c.ent = ent; c.unit = -1;
    if (ent >= 0 && ADMIN1[entities[ent].a3]) {
      const uv = new Map();
      for (const [x, y] of samples) for (let u = 0; u < units.length; u++) if (units[u].ent === ent && inBox(unitBox[u], x, y) && unitPoly[u].contains(x, y)) uv.set(u, (uv.get(u) || 0) + 1);
      for (const [dlon, dlat] of DBG) { const b = c.bb; let x = R.U(dlon); if (x - b.bx > X180) x -= 2 * X180; else if (x - b.bx < -X180) x += 2 * X180; if (x >= b.x0 && x <= b.x1 && R.U(dlat) >= b.y0 && R.U(dlat) <= b.y1 && c.km2 < 2e7) console.log(`  DEBUG unit votes ${JSON.stringify([...uv.entries()].map(([u, n]) => [units[u].id, n]))}; units of ${entities[ent].a3} whose box holds sample 0: ${units.map((u, i) => i).filter((i) => units[i].ent === ent && inBox(unitBox[i], samples[0][0], samples[0][1])).map((i) => units[i].id).join(" ")}`); }
      if (uv.size) { c.unit = [...uv.entries()].sort((p, q) => q[1] - p[1])[0][0]; adm1ByContainment++; }
      else if (samples.length) {
        // nearest unit of this country by its vertices
        const ky = KM_PER_U, kx = KM_PER_U * Math.cos(samples[0][1] * Q * Math.PI / 180); let best = null;
        for (const Rg of neRings) if (Rg.layer === 1 && Rg.ent === ent) for (const p of Rg.pts) { const m = Math.hypot((p[0] - samples[0][0]) * kx, (p[1] - samples[0][1]) * ky) * 1000; if (!best || m < best.m) best = { m, unit: Rg.unit }; }
        if (best && best.m <= 100000) { c.unit = best.unit; adm1ByProximity++; } else adm1Missing++;
      } else adm1Missing++;
    }
  }
  say(`labels: ${byContainment} pieces by containment (${ties} ties), ${byProximity} by proximity, ${unmappedPieces} unmapped; admin-1: ${adm1ByContainment} by containment, ${adm1ByProximity} by proximity, ${adm1Missing} without a unit`);
  report.labels = { byContainment, byProximity, unmapped: unmappedPieces, ties, adm1ByContainment, adm1ByProximity, adm1Missing };

  /* ================= 9. slivers ================= */
  // piece on each side of every arc (index into pieces), via the cycle each half-arc belongs to
  const pieceOfCycle = new Map(); pieces.forEach((p, i) => { pieceOfCycle.set(p, i); for (const h of p.holes || []) pieceOfCycle.set(h, i); });
  const sideOf = (a, d) => { const c = cycles[cycleOf[halfKey(a, d)]]; const p = pieceOfCycle.get(c); return p == null ? -1 : p; };
  let merged = 0, mergedKm2 = 0, unmappedKept = 0, unmappedKm2 = 0;
  const unclaimed = pieces.map((p, i) => i).filter((i) => pieces[i].ent < 0);
  for (let round = 0; round < 5; round++) {
    let changed = 0;
    for (const i of unclaimed) {
      const p = pieces[i]; if (p.ent >= 0) continue;
      let perim = 0; const shared = new Map();
      for (const [a, d] of p.halves) { perim += arcLenM[a]; const o = sideOf(a, -d); if (o >= 0 && o !== i && pieces[o].ent >= 0) shared.set(o, (shared.get(o) || 0) + arcLenM[a]); }
      const width = p.km2 * 1e6 / Math.max(1, perim / 2);
      if (!(width < SLIVER_WIDTH_M || p.km2 < SLIVER_KM2)) continue;
      if (!shared.size) continue;
      const [o] = [...shared.entries()].sort((x, y) => y[1] - x[1])[0];
      p.ent = pieces[o].ent; p.unit = pieces[o].unit; p.mergedInto = o; merged++; mergedKm2 += p.km2; changed++;
      log.event("sliver-merged", { km2: +p.km2.toFixed(3), widthM: Math.round(width), into: entities[p.ent].a3, at: deg(VX[p.vs[0]], VY[p.vs[0]]) });
    }
    if (!changed) break;
  }
  for (const i of unclaimed) { const p = pieces[i]; if (p.ent < 0) { unmappedKept++; unmappedKm2 += p.km2; if (p.km2 > 1) log.event("unmapped-piece", { km2: Math.round(p.km2), at: deg(VX[p.vs[0]], VY[p.vs[0]]), halves: p.halves.length }); } }
  say(`slivers: ${merged} merged (${mergedKm2.toFixed(1)} km²); ${unmappedKept} pieces stay unmapped (${Math.round(unmappedKm2)} km²)`);
  report.slivers = { merged, mergedKm2: +mergedKm2.toFixed(1), unmappedPieces: unmappedKept, unmappedKm2: Math.round(unmappedKm2) };

  /* ================= 10. faces ================= */
  // per arc: the (ent, unit) on each side; drop arcs with the same labels both sides
  const leftEnt = new Int32Array(nA).fill(-1), rightEnt = new Int32Array(nA).fill(-1), leftUnit = new Int32Array(nA).fill(-1), rightUnit = new Int32Array(nA).fill(-1);
  for (let a = 0; a < nA; a++) { const l = sideOf(a, 1), r = sideOf(a, -1); if (l >= 0) { leftEnt[a] = pieces[l].ent; leftUnit[a] = pieces[l].unit; } if (r >= 0) { rightEnt[a] = pieces[r].ent; rightUnit[a] = pieces[r].unit; } }
  const dropArc = new Uint8Array(nA);
  let dropped = 0, water = 0, dangling = 0;
  for (let a = 0; a < nA; a++) {
    const A = arcs[a];
    if (A.kind === KIND.COAST) continue;
    if (cycleOf[halfKey(a, 1)] === cycleOf[halfKey(a, -1)]) { dropArc[a] = 1; dangling++; continue; }   // the same cycle on both sides: a line that dangles into land and bounds nothing
    if (leftEnt[a] >= 0 && leftEnt[a] === rightEnt[a] && leftUnit[a] === rightUnit[a]) { dropArc[a] = 1; dropped++; continue; }
    if (leftEnt[a] < 0 && rightEnt[a] < 0) { A.flags |= FLAG.WATER; water++; }
    if (A.kind === KIND.ADMIN1 && leftEnt[a] !== rightEnt[a] && leftEnt[a] >= 0 && rightEnt[a] >= 0) { A.kind = KIND.BORDER; log.event("admin1-arc-between-countries", { at: deg(VX[A.v[0]], VY[A.v[0]]) }); }
    if (A.kind === KIND.BORDER && leftEnt[a] >= 0 && leftEnt[a] === rightEnt[a] && leftUnit[a] !== rightUnit[a]) { A.kind = KIND.ADMIN1; A.source = SRC_I.adm1; log.event("border-arc-inside-one-country-became-admin1", { at: deg(VX[A.v[0]], VY[A.v[0]]) }); }
  }
  say(`arcs: ${dropped} with the same entity on both sides dropped, ${dangling} dangling dropped, ${water} over water flagged`);
  report.arcsDropped = { sameEntity: dropped, dangling, water };
  // faces: merge the pieces' half-arc refs per (ent, unit) and per ent, dropping dropped arcs and cancelling pairs
  const chainRings = (refs, label) => {
    // refs: signed arc refs; chain end→start into rings
    const startV = (ref) => { const v = arcs[Math.abs(ref) - 1].v; return ref > 0 ? v[0] : v[v.length - 1]; };
    const endV = (ref) => { const v = arcs[Math.abs(ref) - 1].v; return ref > 0 ? v[v.length - 1] : v[0]; };
    const byStart = new Map(); for (const r of refs) { let l = byStart.get(startV(r)); if (!l) byStart.set(startV(r), l = []); l.push(r); }
    const used = new Set(); const rings = [];
    for (const r0 of refs) {
      if (used.has(r0)) continue;
      const ring = [r0]; used.add(r0); let cur = r0; let guard = 0;
      while (endV(cur) !== startV(r0) && guard++ < 1e6) { const l = (byStart.get(endV(cur)) || []).filter((r) => !used.has(r)); if (!l.length) break; cur = l[0]; used.add(cur); ring.push(cur); }
      if (endV(cur) !== startV(r0)) log.event("face-ring-open", { label, refs: ring.length });
      rings.push(ring);
    }
    return rings;
  };
  const faces = [], faceRef = [];
  const facesByEnt = new Map(), facesByUnit = new Map();
  pieces.forEach((p, i) => { if (p.ent < 0) return; (facesByEnt.get(p.ent) || facesByEnt.set(p.ent, []).get(p.ent)).push(i); if (p.unit >= 0) (facesByUnit.get(p.unit) || facesByUnit.set(p.unit, []).get(p.unit)).push(i); });
  const refsOfPieces = (ids, keepArc) => {
    const count = new Map();
    for (const i of ids) { const p = pieces[i]; for (const c of [p].concat(p.holes || [])) for (const [a, d] of c.halves) { if (dropArc[a] || !keepArc(a)) continue; const ref = d > 0 ? a + 1 : -(a + 1); count.set(ref, (count.get(ref) || 0) + 1); } }
    const refs = []; for (const [ref, n] of count) { if (count.has(-ref)) continue; for (let k = 0; k < n; k++) refs.push(ref); }
    return refs;
  };
  for (let e = 0; e < nAdm0; e++) {
    const ids = facesByEnt.get(e); if (!ids) { log.event("entity-without-land", { entity: entities[e].id }); continue; }
    const refs = refsOfPieces(ids, (a) => arcs[a].kind !== KIND.ADMIN1);
    faces.push({ entity: e, source: SRC_I.adm0, rings: chainRings(refs, entities[e].id) }); faceRef.push(-1);
  }
  const nFace0 = faces.length;
  for (let u = 0; u < units.length; u++) {
    const ids = facesByUnit.get(u); if (!ids) { log.event("unit-without-land", { unit: units[u].id }); continue; }
    const refs = refsOfPieces(ids, () => true);
    faces.push({ entity: nAdm0 + u, source: SRC_I.adm1, rings: chainRings(refs, units[u].id) }); faceRef.push(-1);
  }
  say(`faces: ${nFace0} admin-0, ${faces.length - nFace0} admin-1`);
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, "admin-report.json"), JSON.stringify(report, null, 1));
  log.write(path.join(OUT, "admin-log.json"));
  // compact the arc list (dropped arcs out), renumber refs
  const newIndex = new Int32Array(nA).fill(-1); const keptArcs = [];
  for (let a = 0; a < nA; a++) if (!dropArc[a]) { newIndex[a] = keptArcs.length; keptArcs.push(arcs[a]); }
  for (const f of faces) f.rings = f.rings.map((r) => r.map((ref) => { const i = newIndex[Math.abs(ref) - 1]; if (i < 0) throw new Error("dropped arc referenced"); return ref > 0 ? i + 1 : -(i + 1); }));

  /* ================= 11. nudge off the tile lines, then ranks and crossing repair ================= */
  const A2 = keptArcs;
  let nudged = 0;
  const nudgedV = new Uint8Array(VX.length);
  for (const a of A2) for (let i = 0; i < a.v.length; i++) {
    const v = a.v[i]; if (nudgedV[v]) continue; nudgedV[v] = 1;
    if (VX[v] % TILE_U === 0) { VX[v] += 1; nudged++; }
    if (VY[v] % TILE_U === 0) { VY[v] += VY[v] > 0 ? -1 : 1; nudged++; }
    if (VX[v] >= X180) VX[v] -= 2 * X180;
  }
  say(`nudged ${nudged} coordinates off the z=4 tile lines (one quantum each)`);
  log.event("vertices-nudged-off-tile-lines", { count: nudged });

  // per-vertex size: coast vertices have theirs; NE vertices get an open Visvalingam per arc; inserted points are nodes (rank 0)
  for (const a of A2) {
    const n = a.v.length; a.size = new Array(n);
    for (let i = 0; i < n; i++) a.size[i] = VSZ[a.v[i]];
    if (a.kind !== KIND.COAST) { const xs = a.v.map((v) => VX[v]), ys = a.v.map((v) => VY[v]); const area = R.visvalingam(xs, ys, false); for (let i = 1; i < n - 1; i++) a.size[i] = Math.sqrt(area[i]); }
    a.size[0] = 1e9; a.size[n - 1] = 1e9;
    a.rank = new Array(n).fill(0);
    for (let i = 1; i < n - 1; i++) { let r = 0; while (r <= FINEST && a.size[i] < LOD_M[r]) r++; a.rank[i] = r; }   // r = FINEST+1 → never drawn (reserve)
    if (a.closed) { const order = []; for (let i = 1; i < n - 1; i++) order.push(i); order.sort((i, j) => a.size[j] - a.size[i]); for (const i of order.slice(0, 2)) if (a.rank[i] > FINEST) a.rank[i] = FINEST; }
  }
  const drawableAt = (a, level) => { if (!a.closed) return true; let kept = 0; for (let i = 1; i < a.v.length - 1; i++) if (a.rank[i] <= level) kept++; return kept >= 2; };
  const vecOf = (v) => G.vec(VX[v], VY[v], Q);
  const repairs = [];
  for (let level = 0; level <= FINEST; level++) {
    let pass = 0, fixedTotal = 0, residual = 0;
    let touched = null;   // null = every segment (pass 0); else a Set of VERTEX ids: only a segment with a touched end can be in a new crossing
    for (; pass < 40; pass++) {
      const segs = [];
      for (let ai = 0; ai < A2.length; ai++) { const a = A2[ai]; if (!drawableAt(a, level)) continue; let last = 0; for (let i = 1; i < a.v.length; i++) if (a.rank[i] <= level) { segs.push(ai, last, i); last = i; } }
      const nS = segs.length / 3; const tp = Date.now();
      const cell = Math.max(80, Math.round([1, 0.5, 0.1, 0.05, 0.02][level] / Q));
      const sidx = SegIndex.build(nS, cell, (s) => { const a = A2[segs[3 * s]]; return [VX[a.v[segs[3 * s + 1]]], VY[a.v[segs[3 * s + 1]]], VX[a.v[segs[3 * s + 2]]], VY[a.v[segs[3 * s + 2]]]]; });
      const crossing = [];
      const test = (p, q) => {
        const A = A2[segs[3 * p]], B = A2[segs[3 * q]];
        const a1 = A.v[segs[3 * p + 1]], a2 = A.v[segs[3 * p + 2]], b1 = B.v[segs[3 * q + 1]], b2 = B.v[segs[3 * q + 2]];
        if (a1 === b1 || a1 === b2 || a2 === b1 || a2 === b2) return;
        // two ids at one point touch as surely as one id (a junction made beside an existing vertex; measured: the
        // sphere test called the touch a crossing and the same junction was made 42 times at Durrës)
        const same = (u, v) => VX[u] === VX[v] && VY[u] === VY[v];
        if (same(a1, b1) || same(a1, b2) || same(a2, b1) || same(a2, b2)) return;
        if (G.segmentsCross(vecOf(a1), vecOf(a2), vecOf(b1), vecOf(b2))) crossing.push(p, q);
      };
      if (!touched) sidx.pairs(test);
      else {
        // a full pair sweep over 6 M segments is a minute; after the first pass only the arcs that changed,
        // or still crossed, can be in a crossing — query the index around each of their segments
        const seen = new Set();
        for (let s = 0; s < nS; s++) {
          const a = A2[segs[3 * s]];
          const v0 = a.v[segs[3 * s + 1]], v1 = a.v[segs[3 * s + 2]];
          if (!touched.has(v0) && !touched.has(v1)) continue;
          const cx = Math.round((VX[v0] + VX[v1]) / 2), cy = Math.round((VY[v0] + VY[v1]) / 2);
          const rU = Math.max(Math.abs(VX[v1] - VX[v0]), Math.abs(VY[v1] - VY[v0])) / 2 + 1;
          sidx.near(cx, cy, Math.min(rU, 60 * cell), (q) => { if (q === s) return; const lo = Math.min(s, q), hi = Math.max(s, q); const key = lo * 16777216 + hi; if (seen.has(key)) return; seen.add(key); test(lo, hi); });
        }
      }
      touched = new Set();
      for (let k = 0; k < crossing.length; k++) { const a = A2[segs[3 * crossing[k]]]; touched.add(a.v[segs[3 * crossing[k] + 1]]); touched.add(a.v[segs[3 * crossing[k] + 2]]); }
      const tq = Date.now();
      if (!crossing.length) break;
      let fixed = 0, reserved = 0;
      // insertions are applied after the loop so segment indices stay valid within a pass
      const pending = [], pendingX = [];
      // the reserve between two arc vertices exists only when both are originals of ONE ring: a vertex shared
      // with another ring at a line junction (stage 5's wid alias) carries that ring's original index, and a
      // "reserve" read across the two rings is garbage (measured: the LOD 4 repair diverged, 17 → 16,129 crossings)
      const noReserve = (a, i0, i1) => { const o0 = VORIG[a.v[i0]], o1 = VORIG[a.v[i1]]; let r = 0; { let lo = 0, hi = nRings - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (C.ringOffset[m] <= o0) lo = m; else hi = m - 1; } r = lo; } const rs = C.ringOffset[r], re = C.ringOffset[r + 1], len = re - rs; if (o1 < rs || o1 >= re) return true; const steps = ((o1 - o0) % len + len) % len; return steps === 0 || steps > len / 2 || steps === 1; };
      for (let k = 0; k < crossing.length; k++) {
        const s = crossing[k], a = A2[segs[3 * s]], i0 = segs[3 * s + 1], i1 = segs[3 * s + 2];
        if (i1 - i0 >= 2) {
          let best = -1, bestSz = -1;
          for (let i = i0 + 1; i < i1; i++) if (a.rank[i] > level && a.size[i] > bestSz) { bestSz = a.size[i]; best = i; }
          if (best >= 0) { a.rank[best] = level; fixed++; touched.add(a.v[best]); }
          continue;
        }
        // an original edge: first try the partner — if it has hidden vertices the loop reaches it on its own
        // turn; if BOTH are original edges, the two lines genuinely cross and their intersection becomes a
        // vertex of both (they then touch, which the planarity test allows): a graze the planar graph missed
        const partner = crossing[k ^ 1], pa = A2[segs[3 * partner]], pi0 = segs[3 * partner + 1], pi1 = segs[3 * partner + 2];
        const bare = (b, j0, j1) => b.kind !== KIND.COAST || VORIG[b.v[j0]] < 0 || VORIG[b.v[j1]] < 0 || noReserve(b, j0, j1);   // nothing hidden to re-add, not even in the reserve
        if (pi1 - pi0 < 2 && bare(a, i0, i1) && bare(pa, pi0, pi1)) {
          if (k % 2 === 0) { const v0 = a.v[i0], v1 = a.v[i1], w0 = pa.v[pi0], w1 = pa.v[pi1];
            let x1 = VX[v0], y1 = VY[v0], x2 = VX[v1], y2 = VY[v1], x3 = VX[w0], y3 = VY[w0], x4 = VX[w1], y4 = VY[w1];
            if (x2 - x1 > X180) x2 -= 2 * X180; else if (x1 - x2 > X180) x2 += 2 * X180;
            if (x3 - x1 > X180) { x3 -= 2 * X180; x4 -= 2 * X180; } else if (x1 - x3 > X180) { x3 += 2 * X180; x4 += 2 * X180; }
            if (x4 - x3 > X180) x4 -= 2 * X180; else if (x3 - x4 > X180) x4 += 2 * X180;
            const r = crossAt(x1, y1, x2, y2, x3, y3, x4, y4);
            if (r) { let px = Math.round(x1 + r[0] * (x2 - x1)), py = Math.round(y1 + r[0] * (y2 - y1)); if (px >= X180) px -= 2 * X180; if (px < -X180) px += 2 * X180;
              const nv = vertAdd(px, py, 1e9, -1); pendingX.push({ a, i0, nv }, { a: pa, i0: pi0, nv }); log.event("crossing-made-a-junction", { level, kinds: [a.kind, pa.kind], at: deg(px, py) }); }
            else {
              // the plane sees no proper crossing: one segment's end lies on the other (the sphere test's
              // tolerance) — make that end a vertex of the other segment, so the two touch at a shared vertex
              const dist = (px, py, qx, qy, rx, ry) => { const dx = rx - qx, dy = ry - qy, l2 = dx * dx + dy * dy; let tt = l2 > 0 ? ((px - qx) * dx + (py - qy) * dy) / l2 : 0; tt = Math.max(0, Math.min(1, tt)); return Math.hypot(px - (qx + tt * dx), py - (qy + tt * dy)); };
              const cands = [[v0, pa, pi0, dist(x1, y1, x3, y3, x4, y4)], [v1, pa, pi0, dist(x2, y2, x3, y3, x4, y4)], [w0, a, i0, dist(x3, y3, x1, y1, x2, y2)], [w1, a, i0, dist(x4, y4, x1, y1, x2, y2)]].sort((p, q) => p[3] - q[3]);
              const [vv, arc, at] = cands[0];
              pendingX.push({ a: arc, i0: at, nv: vv }); log.event("crossing-end-shared", { level, kinds: [a.kind, pa.kind], at: deg(VX[vv], VY[vv]), quanta: +cands[0][3].toFixed(2) });
            }
          }
          continue;
        }
        if (a.kind !== KIND.COAST) continue;
        const v0 = a.v[i0], v1 = a.v[i1], o0 = VORIG[v0], o1 = VORIG[v1];
        if (o0 < 0 || o1 < 0) continue;
        let r = 0; { let lo = 0, hi = nRings - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (C.ringOffset[m] <= o0) lo = m; else hi = m - 1; } r = lo; }
        const rs = C.ringOffset[r], re = C.ringOffset[r + 1], len = re - rs;
        if (o1 < rs || o1 >= re) continue;   // the other end belongs to another ring (a shared junction vertex): no reserve between them
        let steps = ((o1 - o0) % len + len) % len; if (steps === 0 || steps > len / 2) continue;   // not consecutive along the ring (the arc runs the other way or jumps)
        let best = -1, bestSz = -1;
        for (let kk = 1; kk < steps; kk++) { const o = rs + ((o0 - rs + kk) % len); if (C.size[o] > bestSz) { bestSz = C.size[o]; best = o; } }
        if (best < 0) continue;
        pending.push({ a, i0, o: best });
      }
      // group by arc and rebuild each touched arc once (a splice per vertex on a 300k-vertex ring is quadratic)
      const byArc = new Map();
      for (const p of pending) { let l = byArc.get(p.a); if (!l) byArc.set(p.a, l = new Map()); if (!l.has(p.i0)) l.set(p.i0, { o: p.o }); }
      for (const p of pendingX) { let l = byArc.get(p.a); if (!l) byArc.set(p.a, l = new Map()); if (!l.has(p.i0)) l.set(p.i0, { nv: p.nv }); }
      for (const [a, ins] of byArc) {
        const v = [], sz = [], rk = [];
        for (let i = 0; i < a.v.length; i++) { v.push(a.v[i]); sz.push(a.size[i]); rk.push(a.rank[i]); const x = ins.get(i); if (x) { if (x.nv != null) { v.push(x.nv); sz.push(1e9); rk.push(level); touched.add(x.nv); } /* the rank of the level that needed it: a rank-0 junction would reshape the coarser levels after their own repair */ else { const nv = vertAdd(C.x[x.o], C.y[x.o], C.size[x.o], x.o); v.push(nv); sz.push(C.size[x.o]); rk.push(level); reserved++; touched.add(nv); } fixed++; } }
        a.v = v; a.size = sz; a.rank = rk;
      }
      fixedTotal += fixed;
      say(`  LOD ${level} pass ${pass}: ${nS} segments, pairs ${tq - tp} ms, ${crossing.length / 2} crossings, ${fixed} fixed (${reserved} from the reserve) in ${Date.now() - tq} ms`);
      if (!fixed) { residual = crossing.length / 2; for (let k = 0; k < Math.min(crossing.length, 40); k += 2) { const s = crossing[k], t = crossing[k + 1]; const A = A2[segs[3 * s]], B = A2[segs[3 * t]]; log.event("crossing-residual", { level, kinds: [A.kind, B.kind], at: deg(VX[A.v[segs[3 * s + 1]]], VY[A.v[segs[3 * s + 1]]]), spans: [segs[3 * s + 2] - segs[3 * s + 1], segs[3 * t + 2] - segs[3 * t + 1]] }); } break; }
    }
    repairs.push({ level, passes: pass, reAdded: fixedTotal, residual });
    say(`crossing repair at LOD ${level}: ${fixedTotal} vertices re-added over ${pass} pass(es), ${residual} residual crossings`);
    for (const a of A2) if (a.closed && a.v[0] !== a.v[a.v.length - 1]) throw new Error("closed arc lost its closure");
  }
  report.repairs = repairs;
  for (const a of A2) { let m = 0; while (m <= FINEST && !drawableAt(a, m)) m++; a.minLod = m; }

  /* ================= 12. write ================= */
  // write out/full.bin: vertices with rank ≤ FINEST, arcs in order
  let nV = 0; for (const a of A2) for (let i = 0; i < a.v.length; i++) if (a.rank[i] <= FINEST) nV++;
  const lon = new Int32Array(nV), lat = new Int32Array(nV), rank = new Uint8Array(nV);
  const outArcs = []; let off = 0;
  const perLevel = new Array(FINEST + 1).fill(0);
  for (const a of A2) {
    let count = 0;
    for (let i = 0; i < a.v.length; i++) { if (a.rank[i] > FINEST) continue; lon[off + count] = VX[a.v[i]]; lat[off + count] = VY[a.v[i]]; rank[off + count] = a.rank[i]; for (let L = a.rank[i]; L <= FINEST; L++) perLevel[L]++; count++; }
    outArcs.push({ offset: off, count, kind: a.kind, source: a.source, minLod: a.minLod, flags: a.flags || 0 });
    off += count;
  }
  const allEntities = entities.concat(units.map((u) => ({ id: u.id, name: u.name, kind: "admin1", parent: u.parent, qid: u.qid, type: u.type, iso: u.iso })));
  const steps = faces.map((f, i) => [f.entity, 2022, null, i]).sort((p, q) => p[0] - q[0]);
  const topology = {
    quantum: Q, lod: { intervals_m: LOD_M, note: "Visvalingam √area per level, coarsest first; a vertex's rank is the coarsest level it survives at; levels 0–2 resident, 3–4 tiles" },
    generated: new Date().toISOString(), generator: "folio atlas-build: build-land.js → build-admin.js",
    sources: require("./fetch-sources.js").headerSources(SRC_IDS),
    entities: allEntities, steps,
    vertices: { lon, lat }, rank, arcs: outArcs, faces,
    extra: {
      stepYears: "[entity, from, to, face]; years inclusive, null = open; present-day faces dated from the source's release",
      tolerances_m: TOLERANCE_M, d_far_m: D_FAR,
      sourceVersions: { coast: coastSrc.entry.version, coastDataDate: C.header.source.dataDate, adm0: adm0Src.entry.version, adm1: adm1Src.entry.version },
      built: { step: "build-admin", at: new Date().toISOString(), stats: { coastRings: ringsKept, arcs: A2.length, coastArcs: A2.filter((a) => a.kind === KIND.COAST).length, pieces: pieces.length, facesAdm0: nFace0, facesAdm1: faces.length - nFace0, perLevel, repairs, crossings, snaps: log.summary() } },
    },
  };
  fs.mkdirSync(OUT, { recursive: true });
  const bytes = F.writeFile(path.join(OUT, "full.bin"), topology);
  report.output = { vertices: nV, perLevel, arcs: A2.length, faces: faces.length, bytes };
  fs.writeFileSync(path.join(OUT, "admin-report.json"), JSON.stringify(report, null, 1));
  log.write(path.join(OUT, "admin-log.json"));
  log.print();
  say(`wrote out/full.bin (${(bytes / 1048576).toFixed(2)} MB: ${nV} vertices, per level ${perLevel.join(" / ")}, ${A2.length} arcs, ${faces.length} faces), out/admin-report.json, out/admin-log.json`);
  log.check();
}

try { main(); } catch (e) { console.error("✗ build-admin: " + (e.stack || e.message)); process.exit(1); }
