#!/usr/bin/env node
/* build-admin1.js — the LAZY ADMIN-1 LAYER of Atlas v2 (docs/atlas-v2-admin1-layer.md §3.1, step 1): atlas/data/admin1.bin, a file in
   history.bin's format of the present-day states and provinces of the countries in admin1-spec.json, laid onto the COMMITTED core.

     node .claude/atlas-build/build-admin1.js --extract     the units' geometry out of the pinned Natural Earth zip into admin1-source.json (needs fetch-sources.js ne-10m-admin1)
     node .claude/atlas-build/build-admin1.js [--dry]       build out/admin1.bin from the committed extract and the committed core, print the report
     node .claude/atlas-build/build-admin1.js --install     … and copy it to atlas/data/admin1.bin, write its file:// twin admin1.bin.js (gzip) and regenerate credits.js
     node .claude/atlas-build/build-admin1.js --check       rebuild in memory and fail unless the committed admin1.bin and its twin are exactly what the inputs build (CI's fast job)

   WHY NOT topology.bin (§2): a country's admin-1 inside the core is a whole-Atlas rebuild, and the every-country trial passed the core's 3 MB CI cap
   and did not pack. This file is rebuilt alone, against the core as it stands; topology.bin, the tiles, water, relief, the history and its slices
   never change (sha256 them before and after).

   HOW (§3.1 "a smaller builder for a smaller problem" — nothing of build-history.js's conflate() is copied). Admin-1 units TILE their country, and
   the country's outline is already in the core from the same family of sources, so the job is to SPLIT the core's face of the country by the
   units' shared interior lines:
     1. the inner lines: every edge of Natural Earth's unit rings that two different units of the country share (Natural Earth's admin-1 shares
        its vertices exactly between neighbours, measured: no inner line is lost), chained into polylines between nodes (a vertex where the
        degree is not two, or where the pair of units changes);
     2. clipped to the core's face of the country at its LOD 2 line (the finest resident level): a line is cut where it crosses the core's
        boundary, and only the pieces whose middle lies on the core's land are kept; an end that stops short of the boundary (Natural Earth's
        coast is coarser than OSM's) is carried to the nearest point of the core's boundary within EXTEND_M — those carries are counted and the
        largest is reported, and none may pass EXTEND_M;
     3. the core face's rings, cut at those junctions, and the kept lines are walked into faces (face on the left, history.bin's rule);
     4. each face is LABELLED by the unit whose Natural Earth polygon holds most of a grid of sample points inside it (an island no unit's
        polygon reaches — OSM draws many Natural Earth does not — goes to the unit nearest to it); a line with the same unit on both sides, or
        a dead end, is dropped and the walk repeated until nothing changes, so the slivers between Natural Earth's coast and OSM's never become
        faces of their own;
     5. the inner lines are simplified per level (Visvalingam, LOD_M, as the history does); the core's coast and border are REFERENCED, never
        copied (coreRef: two junction vertices and a range of the core arc), so a state meets the coast and the international border exactly at
        every level, a junction moving onto a coarser level's line by atlas-format.js junctionAt (no jpos section: the reader's fallback is exact
        for a junction that lies on one core segment).
   One face per unit (its rings: every piece of land it holds, islands and enclaves), one step per unit [present, null]. Entity ids are the
   core's scheme, `adm1:<a3>:<iso>`, kind `admin1`, `parent` the core's `adm0:` id; names, kinds, codes and items come from the spec, never from
   Natural Earth's attributes.

   LICENCE. The file references the OSM coast and carries junctions snapped onto it, so it is an ODbL derivative (as history.bin is); the header
   carries the core's own source blocks for osm-land-polygons, ne-10m-admin0 and ne-10m-admin1, and the credits page lists it under the ODbL
   statement. Deterministic: no clock in the header (`generated: null`), every table in spec order — two runs give one sha256. */
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const F = require("./lib/format.js");
const R = require("./lib/rings.js");
const SegIndex = require("./lib/segindex.js");
const Lbl = require("./lib/label.js");
const T = require("./lib/twin.js");

const HERE = __dirname, ROOT = path.join(HERE, "..", ".."), DATA = path.join(ROOT, "atlas", "data"), OUT = path.join(HERE, "out");
const SPEC_FILE = path.join(HERE, "admin1-spec.json"), EXTRACT_FILE = path.join(HERE, "admin1-source.json");
const BIN = "admin1.bin";
const argv = process.argv.slice(2);
const EXTRACT = argv.includes("--extract"), INSTALL = argv.includes("--install"), CHECK = argv.includes("--check"), DRY = argv.includes("--dry");
const Q = R.QUANTUM;
const LOD_M = [10000, 2500, 500];          // the core's three resident levels (history.bin's own table)
const EXTEND_M = 5000;                     // the farthest a line's loose end is carried to the core's boundary (measured on India: the largest is 4.25 km, the Tamil Nadu–Andhra Pradesh line at Pulicat Lake, whose lagoon shore OSM draws inland of Natural Earth's; the next is 1.24 km; the report lists the five largest)
const CELL_U = 400;                        // the segment index's cell: 0.1°
const SAMPLE_TARGET = 600;                 // grid samples per face for the label vote
const BUDGET_BYTES = 400 * 1024;           // the file's own budget (§4: set from step 1's measurement — India alone is printed by the build)
const TWINS_MAX = 12e6;                    // every file:// twin together (the owner's Phase 5 rule)
const GENERATOR = "folio atlas-build: build-admin1.js (0.1.0)";
const t0 = Date.now();
const say = (m) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${m}`);
const deg5 = (x, y) => [+(x * Q).toFixed(5), +(y * Q).toFixed(5)];
const pkey = R.pkey, unkey = (k) => { const x = Math.round(k / 4000000); return [x, k - x * 4000000]; };
const metres = R.metres;
const spec = JSON.parse(fs.readFileSync(SPEC_FILE, "utf8"));

/* ---------- --extract: the units' rings out of the pinned zip into a committed, offline extract ---------- */
if (EXTRACT) {
  const { ensureSource } = require("./fetch-sources.js");
  const { readShp, readDbf } = require("./lib/shp.js");
  const src = ensureSource("ne-10m-admin1", { verifyOnly: true });
  const man = require("./fetch-sources.js").loadManifest().find((s) => s.id === "ne-10m-admin1");
  const shp = path.join(src.dir, "ne_10m_admin_1_states_provinces.shp"), rows = readDbf(path.join(src.dir, "ne_10m_admin_1_states_provinces.dbf"), "utf8").rows;
  const want = new Map(); for (const c of spec.countries) for (const u of c.units) want.set(c.a3 + "|" + (u.ne || u.iso), c.a3 + "|" + u.iso);
  const out = { _about: "GENERATED by build-admin1.js --extract from the pinned Natural Earth 10m admin-1 zip (sha256 below): the quantised rings (quantum 2.5e-4°) of every unit admin1-spec.json names, keyed by the spec's ISO code. Each ring is [x0, y0, dx1, dy1, …], closing vertex dropped, consecutive duplicates removed. Do not edit: re-extract.", source: { id: man.id, version: man.version, sha256: man.sha256 }, quantum: Q, countries: {} };
  let i = 0;
  for (const rec of readShp(shp)) {
    const P = rows[i++]; const k = want.get(P.adm0_a3 + "|" + P.iso_3166_2); if (!k) continue;
    const [a3, iso] = k.split("|");
    const C = out.countries[a3] || (out.countries[a3] = {});
    if (C[iso]) throw new Error("two Natural Earth rows for " + iso);
    C[iso] = rec.parts.map((part) => {
      const pts = []; for (let j = 0; j < part.length; j += 2) { const q = R.qpt([part[j], part[j + 1]]); const l = pts[pts.length - 1]; if (!l || l[0] !== q[0] || l[1] !== q[1]) pts.push(q); }
      while (pts.length > 1 && pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1]) pts.pop();
      if (pts.length < 3) return null;
      const flat = [pts[0][0], pts[0][1]]; for (let j = 1; j < pts.length; j++) flat.push(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]);
      return flat;
    }).filter(Boolean);
  }
  for (const c of spec.countries) for (const u of c.units) if (!(out.countries[c.a3] || {})[u.iso]) throw new Error("Natural Earth has no row " + (u.ne || u.iso) + " for " + u.name);
  const text = JSON.stringify(out).replace(/\],"/g, "],\n\"") + "\n";
  fs.writeFileSync(EXTRACT_FILE, text);
  say(`extract: ${EXTRACT_FILE} (${(text.length / 1024).toFixed(1)} KB)`);
  process.exit(0);
}

/* ---------- the build (a pure function of the spec, the extract and the committed core) ---------- */
function build() {
  const ex = JSON.parse(fs.readFileSync(EXTRACT_FILE, "utf8"));
  const coreBytes = fs.readFileSync(path.join(DATA, "topology.bin"));
  const C = F.read(new Uint8Array(coreBytes));
  const CH = C.header;
  const report = { countries: {}, lod_m: LOD_M, extend_m: EXTEND_M };
  // the output registries
  const out = { lon: [], lat: [], rank: [], arcs: [], coreRef: [], faces: [], entities: [], steps: [], faceKm2: [], faceAnchor: [], arcEmpty: [] };
  const srcIds = ["ne-10m-admin1", "osm-land-polygons", "ne-10m-admin0"];
  const sources = srcIds.map((id) => { const s = CH.sources.find((x) => x.id === id); if (!s) throw new Error("the core's header carries no source " + id); return s; });
  const srcOfCore = CH.sources.map((s) => srcIds.indexOf(s.id));
  if (ex.source.sha256 !== sources[0].sha256) throw new Error("admin1-source.json was extracted from another Natural Earth file (" + ex.source.sha256.slice(0, 12) + ") than the core's ne-10m-admin1 (" + sources[0].sha256.slice(0, 12) + "): re-extract");

  for (const country of spec.countries) {
    const rep = report.countries[country.a3] = {};
    const parentIdx = CH.entities.findIndex((e) => e.id === country.parent);
    if (parentIdx < 0) throw new Error("the core has no entity " + country.parent);
    if (CH.entities.some((e) => e.parent === country.parent)) throw new Error(country.parent + " already has admin-1 units in the core: it stays there (§5), never here");
    const pFaces = []; C.faces.forEach((f, i) => { if (f.entity === parentIdx) pFaces.push(i); });
    if (!pFaces.length) throw new Error("the core has no face for " + country.parent);

    /* --- the boundary: every ring of the parent's faces at LOD 2, as points with the core arc and file offset each segment lies on --- */
    const B = [];   // rings: { refs: [{ arc, fwd }], pts: [[x,y]], seg: [{ ref, arc, k (END vertex offset, file order), fwd }] }
    for (const fi of pFaces) for (const ring of C.faces[fi].rings) {
      const r = { refs: [], pts: [], seg: [] };
      ring.forEach((ref, ri) => {
        const a = Math.abs(ref) - 1, fwd = ref > 0, s = C.arcOffset[a], n = C.arcOffset[a + 1] - s;
        r.refs.push({ arc: a, fwd, n });
        for (let j = 0; j < n; j++) {
          const o = fwd ? j : n - 1 - j;
          if (j === 0 && r.pts.length) continue;   // the previous arc's last vertex
          if (r.pts.length && j > 0) r.seg.push({ ref: ri, arc: a, k: fwd ? o : o + 1, fwd });
          else if (r.pts.length && j === 0) { /* unreachable */ }
          r.pts.push([C.lon[s + o], C.lat[s + o]]);
        }
      });
      // the ring closes on its first vertex: drop the duplicate
      const f = r.pts[0], l = r.pts[r.pts.length - 1];
      if (f[0] !== l[0] || f[1] !== l[1]) throw new Error("a core ring does not close");
      r.pts.pop();
      if (r.seg.length !== r.pts.length) throw new Error("ring bookkeeping: " + r.seg.length + " segments, " + r.pts.length + " points");
      B.push(r);
    }
    // segment table over every ring: id → (ring, j) with j the segment from pts[j] to pts[j+1 mod n]
    const segRing = [], segJ = [];
    B.forEach((r, ri) => { for (let j = 0; j < r.pts.length; j++) { segRing.push(ri); segJ.push(j); } });
    const segXY = (i) => { const r = B[segRing[i]], j = segJ[i], a = r.pts[j], b = r.pts[(j + 1) % r.pts.length]; return [a[0], a[1], b[0], b[1]]; };
    const bIdx = SegIndex.build(segRing.length, CELL_U, segXY);
    const inLand = (x, y) => {   // even-odd over every ring of the parent's faces (a horizontal ray to the east), the segments through the index
      let inside = false; const cy = Math.floor(y / CELL_U), seen = new Set();
      const x1 = Math.floor(x / CELL_U), x2 = Math.floor((x + 40 * CELL_U * 10) / CELL_U);
      for (let cx = x1; cx <= x2; cx++) bIdx.cell(cx, cy, (i) => {
        if (seen.has(i)) return; seen.add(i);
        const s = segXY(i); const [ax, ay, bx, by] = s;
        if ((ay > y) !== (by > y)) { const xc = ax + (y - ay) * (bx - ax) / (by - ay); if (xc > x) inside = !inside; }
      });
      return inside;
    };
    rep.boundary = { rings: B.length, points: B.reduce((s, r) => s + r.pts.length, 0) };

    /* --- the units and their inner lines --- */
    const units = country.units.map((u, i) => {
      const rings = (ex.countries[country.a3] || {})[u.iso]; if (!rings) throw new Error("the extract has no rings for " + u.iso + ": re-extract");
      const all = rings.map((flat) => { const pts = [[flat[0], flat[1]]]; for (let j = 2; j < flat.length; j += 2) pts.push([pts[pts.length - 1][0] + flat[j], pts[pts.length - 1][1] + flat[j + 1]]); return pts; });
      // a recorded correction (the spec's dropRings): a Natural Earth ring that lies wholly inside the box is not the unit's
      const drops = (country.dropRings || []).filter((d) => d.iso === u.iso);
      const kept = all.filter((r) => !drops.some((d) => r.every((p) => p[0] * Q >= d.within[0] && p[0] * Q <= d.within[2] && p[1] * Q >= d.within[1] && p[1] * Q <= d.within[3])));
      for (const d of drops) { const n = all.length - kept.length; if (n !== 1) throw new Error("dropRings for " + u.iso + " matches " + n + " rings, not one: a stale correction"); void d; }
      return { i, u, rings: kept };
    });
    rep.droppedRings = (country.dropRings || []).length;
    for (const U of units) { let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity; for (const r of U.rings) for (const p of r) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; } U.box = [x0, y0, x1, y1]; }
    const unitHas = (U, x, y) => { if (x < U.box[0] || x > U.box[2] || y < U.box[1] || y > U.box[3]) return false; let inside = false; for (const r of U.rings) for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const a = r[j], b = r[i]; if ((a[1] > y) !== (b[1] > y) && x < a[0] + (y - a[1]) * (b[0] - a[0]) / (b[1] - a[1])) inside = !inside; } return inside; };
    const edges = new Map();   // undirected edge "ka,kb" (ka<kb) → Set of units
    for (const U of units) for (const r of U.rings) for (let i = 0; i < r.length; i++) {
      const a = r[i], b = r[(i + 1) % r.length]; let ka = pkey(a[0], a[1]), kb = pkey(b[0], b[1]); if (ka === kb) continue; if (ka > kb) { const t = ka; ka = kb; kb = t; }
      const k = ka + "," + kb; let s = edges.get(k); if (!s) edges.set(k, s = new Set()); s.add(U.i);
    }
    const adj = new Map(), pairOf = new Map(); let innerEdges = 0, outerEdges = 0;
    for (const [k, s] of edges) {
      if (s.size < 2) { outerEdges++; continue; }
      if (s.size > 2) throw new Error("an edge shared by three units");
      innerEdges++;
      const [ka, kb] = k.split(",").map(Number);
      for (const [p, q] of [[ka, kb], [kb, ka]]) { let l = adj.get(p); if (!l) adj.set(p, l = []); l.push(q); }
      pairOf.set(k, [...s].sort((a, b) => a - b).join("|"));
    }
    const ekey = (a, b) => (a < b ? a + "," + b : b + "," + a);
    const isNode = (k) => { const l = adj.get(k); if (!l || l.length !== 2) return true; return pairOf.get(ekey(k, l[0])) !== pairOf.get(ekey(k, l[1])); };
    const used = new Set(), chains = [];
    const walk = (start, next) => { const ks = [start, next]; used.add(ekey(start, next)); let prev = start, cur = next; while (!isNode(cur)) { const l = adj.get(cur); const nx = l[0] === prev ? l[1] : l[0]; if (used.has(ekey(cur, nx))) break; used.add(ekey(cur, nx)); ks.push(nx); prev = cur; cur = nx; } return ks; };
    const nodeKeys = [...adj.keys()].filter(isNode).sort((a, b) => a - b);
    for (const k of nodeKeys) for (const n of adj.get(k).slice().sort((a, b) => a - b)) if (!used.has(ekey(k, n))) chains.push(walk(k, n));
    for (const k of [...adj.keys()].sort((a, b) => a - b)) for (const n of adj.get(k).slice().sort((a, b) => a - b)) if (!used.has(ekey(k, n))) chains.push(walk(k, n));   // closed loops with no node
    rep.innerEdges = innerEdges; rep.outerEdges = outerEdges; rep.chains = chains.length;
    const degree = (k) => (adj.get(k) || []).length;

    /* --- clip every chain to the core's land; carry the loose ends to the boundary --- */
    const segHit = (ax, ay, bx, by, cx, cy, dx, dy) => {   // proper intersection of AB and CD: [t on AB, u on CD] or null
      const rx = bx - ax, ry = by - ay, sx = dx - cx, sy = dy - cy, den = rx * sy - ry * sx; if (den === 0) return null;
      const t = ((cx - ax) * sy - (cy - ay) * sx) / den, u = ((cx - ax) * ry - (cy - ay) * rx) / den;
      return t > 0 && t <= 1 && u >= 0 && u < 1 ? [t, u] : null;
    };
    const near = (x, y, radU, fn) => { const c0x = Math.floor((x - radU) / CELL_U), c1x = Math.floor((x + radU) / CELL_U), c0y = Math.floor((y - radU) / CELL_U), c1y = Math.floor((y + radU) / CELL_U); const seen = new Set(); for (let cx = c0x; cx <= c1x; cx++) for (let cy = c0y; cy <= c1y; cy++) bIdx.cell(cx, cy, (i) => { if (!seen.has(i)) { seen.add(i); fn(i); } }); };
    const project = (x, y, i) => { const [ax, ay, bx, by] = segXY(i); const c = Math.cos(y * Q * Math.PI / 180); const vx = (bx - ax) * c, vy = by - ay, L2 = vx * vx + vy * vy; let u = L2 ? (((x - ax) * c) * vx + (y - ay) * vy) / L2 : 0; u = Math.max(0, Math.min(1, u)); return { u, x: ax + (bx - ax) * u, y: ay + (by - ay) * u }; };
    const pieces = [];   // { pts: [[x,y]], ends: [endA, endB] } with end = { kind: "J", seg, u } | { kind: "N", key }
    const carries = [];
    let dropped = 0, dangling = 0;
    for (const ch of chains) {
      const P = ch.map(unkey);
      const hits = [];
      for (let i = 0; i + 1 < P.length; i++) {
        const [ax, ay] = P[i], [bx, by] = P[i + 1];
        const cx0 = Math.floor(Math.min(ax, bx) / CELL_U), cx1 = Math.floor(Math.max(ax, bx) / CELL_U), cy0 = Math.floor(Math.min(ay, by) / CELL_U), cy1 = Math.floor(Math.max(ay, by) / CELL_U);
        const seen = new Set();
        for (let cx = cx0; cx <= cx1; cx++) for (let cy = cy0; cy <= cy1; cy++) bIdx.cell(cx, cy, (s) => {
          if (seen.has(s)) return; seen.add(s);
          const g = segXY(s), h = segHit(ax, ay, bx, by, g[0], g[1], g[2], g[3]); if (h) hits.push({ at: i + h[0], seg: s, u: h[1], x: ax + (bx - ax) * h[0], y: ay + (by - ay) * h[0] });
        });
      }
      hits.sort((a, b) => a.at - b.at || a.seg - b.seg);
      // the pieces between consecutive cut points
      const cuts = [{ at: 0, end: { kind: "N", key: ch[0] }, x: P[0][0], y: P[0][1] }].concat(hits.map((h) => ({ at: h.at, end: { kind: "J", seg: h.seg, u: h.u }, x: h.x, y: h.y }))).concat([{ at: P.length - 1, end: { kind: "N", key: ch[ch.length - 1] }, x: P[P.length - 1][0], y: P[P.length - 1][1] }]);
      for (let c = 0; c + 1 < cuts.length; c++) {
        const A = cuts[c], Bc = cuts[c + 1]; if (Bc.at - A.at < 1e-12) continue;
        const pts = [[A.x, A.y]]; for (let i = Math.floor(A.at) + 1; i < Bc.at; i++) pts.push(P[i]); pts.push([Bc.x, Bc.y]);
        // the middle of the piece by length
        let L = 0; const segL = []; for (let i = 0; i + 1 < pts.length; i++) { const d = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); segL.push(d); L += d; }
        let acc = 0, mx = pts[0][0], my = pts[0][1]; for (let i = 0; i < segL.length; i++) { if (acc + segL[i] >= L / 2) { const t = segL[i] ? (L / 2 - acc) / segL[i] : 0; mx = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t; my = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t; break; } acc += segL[i]; }
        if (!inLand(mx, my)) { dropped++; continue; }
        pieces.push({ pts, ends: [A.end, Bc.end] });
      }
    }
    // a loose end: an N end whose Natural Earth vertex lies on the country's outer edge (inner degree 1) — carried to the nearest boundary point
    for (const pc of pieces) for (const e of [0, 1]) {
      const end = pc.ends[e]; if (end.kind !== "N" || degree(end.key) !== 1) continue;
      const p = e === 0 ? pc.pts[0] : pc.pts[pc.pts.length - 1];
      let best = null; const radU = Math.ceil(EXTEND_M / (111320 * Q * Math.cos(p[1] * Q * Math.PI / 180)));
      near(p[0], p[1], radU, (s) => { const pr = project(p[0], p[1], s); const d = metres(p[0], p[1], pr.x, pr.y); if (!best || d < best.d || (d === best.d && s < best.s)) best = { d, s, u: pr.u, x: pr.x, y: pr.y }; });
      if (!best || best.d > EXTEND_M) { dangling++; if (process.env.DEBUG_A1) console.log("loose end at", deg5(...p).join(","), "nearest boundary", best ? Math.round(best.d) + " m" : "none within " + EXTEND_M); continue; }
      carries.push({ d: best.d, at: deg5(...p) });
      if (e === 0) pc.pts.unshift([best.x, best.y]); else pc.pts.push([best.x, best.y]);
      pc.ends[e] = { kind: "J", seg: best.s, u: best.u };
    }
    carries.sort((a, b) => b.d - a.d || a.at[0] - b.at[0]);
    rep.clip = { piecesKept: pieces.length, piecesOutside: dropped, carried: carries.length, carryMaxM: Math.round(carries.length ? carries[0].d : 0), carryP50M: Math.round(carries.length ? carries[Math.floor(carries.length / 2)].d : 0), largestCarries: carries.slice(0, 5).map((c) => ({ m: Math.round(c.d), at: c.at })), danglingLeft: dangling };
    if (dangling) throw new Error(dangling + " inner line end(s) left loose (no core boundary within " + EXTEND_M + " m): a gap in Natural Earth's shared boundaries — find it (DEBUG_A1=1) and record a correction, never widen the tolerance blindly");

    /* --- junctions: quantise each J end onto its core segment's file position --- */
    const junc = new Map();   // "x,y" → { ring, j, arcRef, arc, p (fractional file offset in the arc), x, y }
    function junctionOf(end) {
      const ri = segRing[end.seg], j = segJ[end.seg], r = B[ri], sg = r.seg[j], ref = r.refs[sg.ref];
      const a = r.pts[j], b = r.pts[(j + 1) % r.pts.length];
      let x = Math.round(a[0] + (b[0] - a[0]) * end.u), y = Math.round(a[1] + (b[1] - a[1]) * end.u), u = end.u;
      if (x === a[0] && y === a[1]) u = 0; else if (x === b[0] && y === b[1]) u = 1;
      // file position: the segment runs from file offset (k-1) to k when walked forward, k to k-1 when backward
      const p = sg.fwd ? (sg.k - 1) + u : sg.k - u;
      const key = x + "," + y;
      let J = junc.get(key);
      if (!J) junc.set(key, J = { ri, j, ref: sg.ref, arc: sg.arc, fwd: sg.fwd, n: ref.n, p, x, y, at: j + u });
      return J;
    }
    for (const pc of pieces) for (const e of [0, 1]) if (pc.ends[e].kind === "J") { const J = junctionOf(pc.ends[e]); pc.ends[e] = { kind: "J", key: J.x + "," + J.y }; if (e === 0) pc.pts[0] = [J.x, J.y]; else pc.pts[pc.pts.length - 1] = [J.x, J.y]; }
    // own piece points: integer, deduplicated
    for (const pc of pieces) { const q = []; for (const p of pc.pts) { const x = Math.round(p[0]), y = Math.round(p[1]); const l = q[q.length - 1]; if (!l || l[0] !== x || l[1] !== y) q.push([x, y]); } pc.pts = q; }
    const live = pieces.filter((pc) => pc.pts.length >= 2 && !(pc.pts.length === 2 && pc.pts[0][0] === pc.pts[1][0] && pc.pts[0][1] === pc.pts[1][1]));

    /* --- untwist: a line that crosses itself (Natural Earth's Yanam ring has a one-quantum bow-tie, shared by both its sides) loses the smaller
       loop — the vertices between the two crossing segments give way to the crossing point, rounded to the quantum --- */
    {
      const o = (a, b, c) => Math.sign((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]));
      let untwisted = 0;
      for (const pc of live) {
        for (let guard = 0; guard < 100; guard++) {
          const P = pc.pts, n = P.length, closed = P[0][0] === P[n - 1][0] && P[0][1] === P[n - 1][1];
          let hit = null;
          for (let i = 0; i + 1 < n && !hit; i++) for (let j = i + 2; j + 1 < n; j++) {
            if (closed && i === 0 && j === n - 2) continue;
            const a = P[i], b = P[i + 1], c = P[j], d = P[j + 1];
            if (o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0) { hit = [i, j]; break; }
          }
          if (!hit) break;
          const [i, j] = hit, a = P[i], b = P[i + 1], c = P[j], d = P[j + 1];
          const den = (b[0] - a[0]) * (d[1] - c[1]) - (b[1] - a[1]) * (d[0] - c[0]), t = ((c[0] - a[0]) * (d[1] - c[1]) - (c[1] - a[1]) * (d[0] - c[0])) / den;
          const X = [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t)];
          if (j - i > n / 2) throw new Error("a line crosses itself with a loop of more than half its vertices, near " + deg5(...X).join(",") + ": not untwisted blindly");
          pc.pts = P.slice(0, i + 1).concat([X]).concat(P.slice(j + 1)).filter((p, k, arr) => k === 0 || p[0] !== arr[k - 1][0] || p[1] !== arr[k - 1][1]);
          untwisted++;
        }
      }
      rep.untwisted = untwisted;
    }
    /* --- walk, label, drop, repeat --- */
    let round = 0, faces = null, bPieces = null, cycLabel = null, cycles = null, ringNext = null, zeroRings = 0;
    let active = live.slice();
    for (;;) {
      round++;
      // the junctions the active pieces use
      const usedJ = new Set(); for (const pc of active) for (const e of [0, 1]) if (pc.ends[e].kind === "J") usedJ.add(pc.ends[e].key);
      // boundary pieces: each ring cut at its core arc endpoints and at the used junctions
      bPieces = [];
      B.forEach((r, ri) => {
        const js = [...usedJ].map((k) => junc.get(k)).filter((J) => J.ri === ri);
        r.refs.forEach((ref, refI) => {
          const n = ref.n, start = ref.fwd ? 0 : n - 1, end = ref.fwd ? n - 1 : 0;
          const here = js.filter((J) => J.ref === refI && J.p !== 0 && J.p !== n - 1).sort((a, b) => (ref.fwd ? a.p - b.p : b.p - a.p));
          const cutsP = [start].concat(here.map((J) => J.p)).concat([end]);
          const cutsJ = [null].concat(here).concat([null]);
          for (let c = 0; c + 1 < cutsP.length; c++) {
            const pA = cutsP[c], pB = cutsP[c + 1]; if (pA === pB) continue;
            bPieces.push({ ri, refI, arc: ref.arc, fwd: ref.fwd, n, pA, pB, jA: cutsJ[c], jB: cutsJ[c + 1] });
          }
        });
      });
      // a boundary piece's successor along its ring: the walk takes it at every node no inner line touches (the core's rings carry
      // zero-width spikes — a coast segment walked out and back — where an angular choice would leave the ring)
      ringNext = bPieces.map((bp, i) => { const nx = bPieces[i + 1]; if (nx && nx.ri === bp.ri) return i + 1; let f = i; while (f > 0 && bPieces[f - 1].ri === bp.ri) f--; return f; });
      const s0 = (a) => C.arcOffset[a];
      for (const bp of bPieces) {   // LOD 2 geometry of the piece, for the walk and the labels
        const pts = [bp.jA ? [bp.jA.x, bp.jA.y] : [C.lon[s0(bp.arc) + bp.pA], C.lat[s0(bp.arc) + bp.pA]]];
        if (bp.fwd) { for (let i = Math.floor(bp.pA) + 1; i <= Math.ceil(bp.pB) - 1; i++) pts.push([C.lon[s0(bp.arc) + i], C.lat[s0(bp.arc) + i]]); }
        else { for (let i = Math.ceil(bp.pA) - 1; i >= Math.floor(bp.pB) + 1; i--) pts.push([C.lon[s0(bp.arc) + i], C.lat[s0(bp.arc) + i]]); }
        pts.push(bp.jB ? [bp.jB.x, bp.jB.y] : [C.lon[s0(bp.arc) + bp.pB], C.lat[s0(bp.arc) + bp.pB]]);
        bp.pts = pts;
      }
      // half-edges: boundary pieces forward only, own pieces both ways
      const H = [];
      bPieces.forEach((bp, i) => H.push({ kind: "b", i, pts: bp.pts }));
      active.forEach((pc, i) => { H.push({ kind: "o", i, dir: 1, pts: pc.pts }); H.push({ kind: "o", i, dir: -1, pts: pc.pts.slice().reverse() }); });
      const out0 = new Map();   // node → [half-edge ids] leaving it
      const nk = (p) => p[0] + "," + p[1];
      H.forEach((h, id) => { const k = nk(h.pts[0]); let l = out0.get(k); if (!l) out0.set(k, l = []); l.push(id); });
      const ang = (h) => { const a = h.pts[0]; let b = h.pts[1]; for (let i = 1; i < h.pts.length && b[0] === a[0] && b[1] === a[1]; i++) b = h.pts[i]; return Math.atan2(b[1] - a[1], (b[0] - a[0]) * Math.cos(a[1] * Q * Math.PI / 180)); };
      const backAng = (h) => { const n = h.pts.length, a = h.pts[n - 1]; let b = h.pts[n - 2]; for (let i = n - 2; i >= 0 && b[0] === a[0] && b[1] === a[1]; i--) b = h.pts[i]; return Math.atan2(b[1] - a[1], (b[0] - a[0]) * Math.cos(a[1] * Q * Math.PI / 180)); };
      for (const [, l] of out0) l.sort((p, q) => ang(H[p]) - ang(H[q]) || p - q);
      const twin = (id) => { const h = H[id]; if (h.kind !== "o") return -1; return h.dir === 1 ? id + 1 : id - 1; };
      const nextOf = (id) => {
        const h = H[id], k = nk(h.pts[h.pts.length - 1]), l = out0.get(k); if (!l || !l.length) throw new Error("a half-edge ends at a node with no way on, near " + deg5(...h.pts[h.pts.length - 1]).join(","));
        if (h.kind === "b" && !l.some((o) => H[o].kind === "o")) return ringNext[h.i];
        const th = backAng(h), tw = twin(id);
        // the first outgoing edge clockwise from the way back: the largest angle below th (cyclically), never the twin unless it is the only way
        let best = -1, bestD = Infinity;
        for (const o of l) { if (o === tw && l.length > 1) continue; let d = th - ang(H[o]); while (d <= 1e-12) d += 2 * Math.PI; if (d < bestD) { bestD = d; best = o; } }
        return best;
      };
      const cyc = new Int32Array(H.length).fill(-1); cycles = [];
      for (let id = 0; id < H.length; id++) {
        if (cyc[id] >= 0) continue;
        const c = []; let e = id, guard = 0;
        while (cyc[e] < 0) { cyc[e] = cycles.length; c.push(e); e = nextOf(e); if (++guard > H.length + 5) throw new Error("a face walk did not close"); }
        if (e !== id && process.env.DEBUG_WALK) { for (const x of c.concat([e])) { const h = H[x]; console.log(x, h.kind, h.i, h.dir, "from", deg5(...h.pts[0]).join(","), "to", deg5(...h.pts[h.pts.length - 1]).join(","), "n", h.pts.length, "ang", ang(h).toFixed(4), "back", backAng(h).toFixed(4), "outs", (out0.get(nk(h.pts[h.pts.length - 1])) || []).map((o) => o + ":" + H[o].kind + ":" + ang(H[o]).toFixed(4)).join(" ")); } }
        if (e !== id) throw new Error("a face walk closed on another half-edge (a node with an odd way on), near " + deg5(...H[id].pts[0]).join(","));
        cycles.push(c);
      }
      // each cycle as a polygon (LOD 2) with its signed area
      const polys = cycles.map((c) => { const pts = []; for (const e of c) { const p = H[e].pts; for (let i = 0; i + 1 < p.length; i++) pts.push(p[i]); } let A = 0; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) A += pts[j][0] * pts[i][1] - pts[i][0] * pts[j][1]; return { pts, area: A / 2 }; });
      const inPoly = (pts, x, y) => { let inside = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const a = pts[j], b = pts[i]; if ((a[1] > y) !== (b[1] > y) && x < a[0] + (y - a[1]) * (b[0] - a[0]) / (b[1] - a[1])) inside = !inside; } return inside; };
      // holes: a clockwise cycle belongs to the smallest counter-clockwise cycle holding it that is not its own other side
      const holeOf = new Map();
      polys.forEach((P, ci) => {
        if (P.area >= 0) return;
        const mine = new Set(cycles[ci].map((e) => twin(e)).filter((t) => t >= 0).map((t) => cyc[t]));
        let best = -1;
        for (let cj = 0; cj < polys.length; cj++) { if (polys[cj].area <= 0 || mine.has(cj)) continue; if (inPoly(polys[cj].pts, P.pts[0][0] + 0.25, P.pts[0][1] + 0.25) && (best < 0 || polys[cj].area < polys[best].area)) best = cj; }
        if (best < 0) throw new Error("a clockwise cycle no face holds, near " + deg5(...P.pts[0]).join(","));
        holeOf.set(ci, best);
      });
      // labels: a vote of grid samples inside the face (holes out); none → the face's pole; none inside any unit → the nearest unit
      cycLabel = new Int32Array(cycles.length).fill(-1); zeroRings = 0;
      const unitEdgeIdx = (() => { const segs = []; for (const U of units) for (const r of U.rings) for (let i = 0; i < r.length; i++) segs.push([U.i, r[i], r[(i + 1) % r.length]]); return { segs, idx: SegIndex.build(segs.length, CELL_U, (i) => [segs[i][1][0], segs[i][1][1], segs[i][2][0], segs[i][2][1]]) }; })();
      const nearestUnit = (x, y) => { let best = null; for (let rad = 4 * CELL_U; rad <= 400 * CELL_U && !best; rad *= 2) { const c0x = Math.floor((x - rad) / CELL_U), c1x = Math.floor((x + rad) / CELL_U), c0y = Math.floor((y - rad) / CELL_U), c1y = Math.floor((y + rad) / CELL_U); for (let cx = c0x; cx <= c1x; cx++) for (let cy = c0y; cy <= c1y; cy++) unitEdgeIdx.idx.cell(cx, cy, (i) => { const [ui, a, b] = unitEdgeIdx.segs[i]; const c = Math.cos(y * Q * Math.PI / 180), vx = (b[0] - a[0]) * c, vy = b[1] - a[1], L2 = vx * vx + vy * vy; let u = L2 ? ((x - a[0]) * c * vx + (y - a[1]) * vy) / L2 : 0; u = Math.max(0, Math.min(1, u)); const d = metres(x, y, a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u); if (!best || d < best.d || (d === best.d && ui < best.ui)) best = { d, ui }; }); } return best; };
      const holesOf = new Map(); for (const [h, o] of holeOf) { let l = holesOf.get(o); if (!l) holesOf.set(o, l = []); l.push(h); }
      const labelInfo = [];
      polys.forEach((P, ci) => {
        if (P.area < 0) return;
        if (P.area === 0) {   // a zero-width ring of the core's (a coast segment walked out and back, kept as the core keeps it): the unit it lies in, else the nearest
          const p = P.pts[0]; let lab = -1; for (const U of units) if (unitHas(U, p[0], p[1])) { lab = U.i; break; }
          if (lab < 0) { const nu = nearestUnit(p[0], p[1]); if (!nu) throw new Error("a zero-width ring no unit is near"); lab = nu.ui; }
          cycLabel[ci] = lab; zeroRings++; return;
        }
        const holes = (holesOf.get(ci) || []).map((h) => polys[h].pts);
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity; for (const p of P.pts) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
        const step = Math.max(1, Math.sqrt(Math.abs(P.area) / SAMPLE_TARGET));
        const votes = new Map(); let samples = 0;
        const vote = (x, y) => { if (!inPoly(P.pts, x, y) || holes.some((h) => inPoly(h, x, y))) return; samples++; for (const U of units) if (unitHas(U, x, y)) { votes.set(U.i, (votes.get(U.i) || 0) + 1); break; } };
        for (let y = y0 + step / 2; y < y1; y += step) for (let x = x0 + step / 2; x < x1; x += step) vote(x, y);
        if (!samples) { const g = Lbl.labelGeometry([P.pts.map((p) => [p[0] * Q, p[1] * Q])].concat(holes.map((h) => h.map((p) => [p[0] * Q, p[1] * Q])))); if (g) vote(g.at[0] / Q, g.at[1] / Q); }
        let best = -1, bv = 0; for (const [ui, v] of [...votes].sort((a, b) => a[0] - b[0])) if (v > bv) { bv = v; best = ui; }
        let how = "vote";
        if (best < 0) { const p = P.pts[0]; const nu = nearestUnit(p[0], p[1]); if (!nu) throw new Error("a face no unit is near, at " + deg5(...p).join(",")); best = nu.ui; how = "nearest"; labelInfo.push({ ci, how, d: Math.round(nu.d), at: deg5(...p), unit: units[nu.ui].u.iso, km2: +(Math.abs(P.area) * Q * Q * 12364 * Math.cos(p[1] * Q * Math.PI / 180)).toFixed(3) }); }
        cycLabel[ci] = best;
        void how;
      });
      for (const [h, o] of holeOf) cycLabel[h] = cycLabel[o];
      // drop: a piece with one unit on both sides, or a dead end (one cycle on both sides)
      const keep = [];
      let drops = 0;
      active.forEach((pc, i) => {
        const hid = H.findIndex((h) => h.kind === "o" && h.i === i && h.dir === 1);
        const c1 = cyc[hid], c2 = cyc[hid + 1];
        if (c1 === c2 || cycLabel[c1] === cycLabel[c2]) { drops++; if (process.env.DEBUG_A1) console.log("drop round", round, c1 === c2 ? "dead end" : "same unit " + units[cycLabel[c1]].u.iso, "from", deg5(...pc.pts[0]).join(","), "to", deg5(...pc.pts[pc.pts.length - 1]).join(","), pc.pts.length, "pts"); return; }
        keep.push(pc);
      });
      if (!drops) { faces = { H, cyc, polys, holeOf, labelInfo }; break; }
      active = keep;
      if (round > 50) throw new Error("the label/drop loop did not settle");
    }
    rep.rounds = round; rep.ownPieces = active.length; rep.nearestLabels = faces.labelInfo.length; rep.nearestMaxM = faces.labelInfo.reduce((m, l) => Math.max(m, l.d), 0); rep.nearestFarthest = faces.labelInfo.slice().sort((a, b) => b.d - a.d).slice(0, 8).map((l) => ({ m: l.d, at: l.at, unit: l.unit, km2: l.km2 }));

    /* --- merge own pieces that meet at a node of degree two (no junction, no third line) into one line --- */
    {
      const ends = new Map(); const nk = (p) => p[0] + "," + p[1];
      active.forEach((pc, i) => { for (const p of [pc.pts[0], pc.pts[pc.pts.length - 1]]) { const k = nk(p); let l = ends.get(k); if (!l) ends.set(k, l = []); l.push(i); } });
      // the labels of each piece's two sides travel with it: a merge is allowed only for one pair of units
      const H = faces.H, cyc = faces.cyc;
      const sides = (i) => { const hid = H.findIndex((h) => h.kind === "o" && h.i === i && h.dir === 1); return [cycLabel[cyc[hid]], cycLabel[cyc[hid + 1]]]; };
      const sd = active.map((_, i) => sides(i));
      const isJ = (k) => junc.has(k) && active.some((pc) => pc.ends.some((e) => e.kind === "J" && e.key === k));
      const gone = new Set(); let merged = 0;
      for (let i = 0; i < active.length; i++) {
        if (gone.has(i)) continue;
        let grown = true;
        while (grown) {
          grown = false;
          for (const atEnd of [true, false]) {
            const pc = active[i], p = atEnd ? pc.pts[pc.pts.length - 1] : pc.pts[0], k = nk(p), l = (ends.get(k) || []).filter((j) => !gone.has(j));
            if (l.length !== 2 || isJ(k)) continue;
            const j = l[0] === i ? l[1] : l[0]; if (j === i || gone.has(j)) continue;
            const q = active[j];
            const same = (sd[i][0] === sd[j][0] && sd[i][1] === sd[j][1]) || (sd[i][0] === sd[j][1] && sd[i][1] === sd[j][0]); if (!same) continue;
            let qp = q.pts.slice(), qe = q.ends.slice();
            const qStartsHere = nk(qp[0]) === k;
            if (atEnd) { if (!qStartsHere) { qp.reverse(); qe.reverse(); } pc.pts = pc.pts.concat(qp.slice(1)); pc.ends = [pc.ends[0], qe[1]]; }
            else { if (qStartsHere) { qp.reverse(); qe.reverse(); } pc.pts = qp.slice(0, -1).concat(pc.pts); pc.ends = [qe[0], pc.ends[1]]; }
            // a closed loop (an enclave's ring) stays one arc
            gone.add(j); merged++; grown = true;
            const ke = nk(atEnd ? pc.pts[pc.pts.length - 1] : pc.pts[0]); const le = ends.get(ke); if (le) { const ix = le.indexOf(j); if (ix >= 0) le[ix] = i; }
            break;
          }
        }
      }
      active = active.filter((_, i) => !gone.has(i));
      rep.merged = merged;
    }
    // walk once more on the merged pieces to get the final rings (the same faces, fewer arcs)
    {
      const usedJ = new Set(); for (const pc of active) for (const e of [0, 1]) if (pc.ends[e].kind === "J") usedJ.add(pc.ends[e].key);
      void usedJ;
    }

    /* --- the output: arcs (own and core-referencing), one face per unit --- */
    const H = faces.H, cyc = faces.cyc, polys = faces.polys;
    // re-derive the half-edge set for the merged pieces: boundary pieces are unchanged; own pieces replaced
    const bH = H.filter((h) => h.kind === "b");
    // map each boundary piece to an output arc
    const arcOfB = new Map(), arcOfO = new Map();
    const pushArc = (pts, rank, meta, core) => {
      const off = out.lon.length;
      for (let i = 0; i < pts.length; i++) { out.lon.push(pts[i][0]); out.lat.push(pts[i][1]); out.rank.push(rank[i]); }
      out.arcs.push(Object.assign({ offset: off, count: pts.length }, meta));
      out.coreRef.push(core || { core: -1 });
      out.arcEmpty.push(core && core.empty ? 1 : 0);
      return out.arcs.length - 1;
    };
    for (const h of bH) {
      const bp = bPieces[h.i], n = bp.n, a = bp.arc;
      const isInt = (p) => Number.isInteger(p);
      const segOf = (p) => (isInt(p) ? (p === 0 || p === n - 1 ? 0 : p) : Math.ceil(p));
      let from, to, empty = false;
      if (bp.fwd) { from = Math.floor(bp.pA) + 1; to = Math.ceil(bp.pB) - 1; if (from > to) empty = true; }
      else { from = Math.ceil(bp.pA) - 1; to = Math.floor(bp.pB) + 1; if (from < to) empty = true; }
      if (empty) { from = 0; to = 0; }
      const A = bp.pts[0], Bv = bp.pts[bp.pts.length - 1];
      const core = { core: a, from, to, segA: segOf(bp.pA), segB: segOf(bp.pB), empty };
      const k = bH.indexOf(h);
      arcOfB.set(h.i, pushArc([A, Bv], [0, 0], { kind: C.arcKind[a], source: srcOfCore[C.arcSource[a]], minLod: C.arcMinLod[a], flags: C.arcFlags[a] }, core));
      void k;
      if (srcOfCore[C.arcSource[a]] < 0) throw new Error("a core arc of the country names a source this file does not carry");
    }
    active.forEach((pc, i) => {
      const xs = pc.pts.map((p) => p[0]), ys = pc.pts.map((p) => p[1]);
      const area = R.visvalingam(xs, ys, false);
      const rank = pc.pts.map((p, j) => { if (j === 0 || j === pc.pts.length - 1) return 0; const sz = Math.sqrt(area[j]); let r = LOD_M.length - 1; for (let L = 0; L < LOD_M.length; L++) if (sz >= LOD_M[L]) { r = L; break; } return r; });
      arcOfO.set(i, pushArc(pc.pts, rank, { kind: F.KIND.ADMIN1, source: 0, minLod: 0, flags: 0 }, null));
    });
    // the final walk over the output arcs: the same graph as the last round, the merged own lines in place of their pieces
    const W = [];
    for (const h of bH) W.push({ ref: arcOfB.get(h.i) + 1, pts: bPieces[h.i].pts });
    active.forEach((pc, i) => { const a = arcOfO.get(i); W.push({ ref: a + 1, pts: pc.pts }); W.push({ ref: -(a + 1), pts: pc.pts.slice().reverse() }); });
    const nk = (p) => p[0] + "," + p[1];
    const outN = new Map(); W.forEach((h, id) => { const k = nk(h.pts[0]); let l = outN.get(k); if (!l) outN.set(k, l = []); l.push(id); });
    const ang = (h) => { const a = h.pts[0]; let b = h.pts[1]; for (let i = 1; i < h.pts.length && b[0] === a[0] && b[1] === a[1]; i++) b = h.pts[i]; return Math.atan2(b[1] - a[1], (b[0] - a[0]) * Math.cos(a[1] * Q * Math.PI / 180)); };
    const backAng = (h) => { const n = h.pts.length, a = h.pts[n - 1]; let b = h.pts[n - 2]; for (let i = n - 2; i >= 0 && b[0] === a[0] && b[1] === a[1]; i--) b = h.pts[i]; return Math.atan2(b[1] - a[1], (b[0] - a[0]) * Math.cos(a[1] * Q * Math.PI / 180)); };
    for (const [, l] of outN) l.sort((p, q) => ang(W[p]) - ang(W[q]) || p - q);
    const twinW = (id) => (W[id].ref < 0 ? id - 1 : (id + 1 < W.length && W[id + 1].ref === -W[id].ref ? id + 1 : -1));
    const nextW = (id) => { const h = W[id], l = outN.get(nk(h.pts[h.pts.length - 1])); if (id < bH.length && !l.some((o) => o >= bH.length)) return ringNext[id]; const th = backAng(h), tw = twinW(id); let best = -1, bestD = Infinity; for (const o of l) { if (o === tw && l.length > 1) continue; let d = th - ang(W[o]); while (d <= 1e-12) d += 2 * Math.PI; if (d < bestD) { bestD = d; best = o; } } return best; };
    const cycW = new Int32Array(W.length).fill(-1), cyclesW = [];
    for (let id = 0; id < W.length; id++) { if (cycW[id] >= 0) continue; const c = []; let e = id, g = 0; while (cycW[e] < 0) { cycW[e] = cyclesW.length; c.push(e); e = nextW(e); if (++g > W.length + 5) throw new Error("the final walk did not close"); } cyclesW.push(c); }
    // label the final cycles by the last round's labels: a cycle carries the label of the round's cycle that holds its boundary or own half-edges
    const polysW = cyclesW.map((c) => { const pts = []; for (const e of c) { const p = W[e].pts; for (let i = 0; i + 1 < p.length; i++) pts.push(p[i]); } let A = 0; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) A += pts[j][0] * pts[i][1] - pts[i][0] * pts[j][1]; return { pts, area: A / 2 }; });
    if (cyclesW.length !== polys.length) throw new Error("the merge changed the faces (" + polys.length + " → " + cyclesW.length + ")");
    // the round's labels by a shared first point and orientation: match each final cycle to the round's cycle with the same vertex set (by its smallest vertex key and area)
    const sig = (P) => { let m = null; for (const p of P.pts) { const k = p[0] * 4000000 + p[1]; if (m == null || k < m) m = k; } return m + "|" + Math.round(P.area); };
    const bySig = new Map(); polys.forEach((P, ci) => bySig.set(sig(P), ci));
    const labelW = cyclesW.map((c, ci) => { const k = bySig.get(sig(polysW[ci])); if (k == null) throw new Error("a final face matches no labelled face"); return cycLabel[k]; });
    // faces: one per unit
    const unitRings = units.map(() => []);
    // order: the unit's counter-clockwise rings by area (largest first), then its holes
    const order = cyclesW.map((c, ci) => ci).sort((a, b) => Math.abs(polysW[b].area) - Math.abs(polysW[a].area) || a - b);
    for (const ci of order) if (polysW[ci].area > 0) unitRings[labelW[ci]].push(ci);
    for (const ci of order) if (polysW[ci].area < 0) unitRings[labelW[ci]].push(ci);
    for (const ci of order) if (polysW[ci].area === 0) unitRings[labelW[ci]].push(ci);
    rep.zeroWidthRings = zeroRings;
    const firstEnt = out.entities.length;
    const unitStat = [];
    units.forEach((U) => {
      const ringsCi = unitRings[U.i];
      if (!ringsCi.length) throw new Error(U.u.name + " has no face: the conflation lost it");
      const rings = ringsCi.map((ci) => cyclesW[ci].map((e) => W[e].ref));
      const fi = out.faces.length;
      out.faces.push({ entity: firstEnt + U.i, source: 0, rings });
      const parts = ringsCi.map((ci) => polysW[ci].pts.map((p) => [p[0] * Q, p[1] * Q]));
      // the label point: the pole of the largest ring (holes out)
      const outerParts = ringsCi.filter((ci) => polysW[ci].area > 0);
      const big = outerParts[0];
      const lg = Lbl.labelGeometry([polysW[big].pts.map((p) => [p[0] * Q, p[1] * Q])].concat(ringsCi.filter((ci) => polysW[ci].area < 0).map((ci) => polysW[ci].pts.map((p) => [p[0] * Q, p[1] * Q]))));
      const all = Lbl.labelGeometry(parts);
      out.faceKm2.push(Math.round(all.areaKm2 * 10) / 10);
      out.faceAnchor.push([+lg.at[0].toFixed(5), +lg.at[1].toFixed(5)]);
      const u = U.u;
      out.entities.push({ id: "adm1:" + country.a3.toLowerCase() + ":" + u.iso.toLowerCase(), name: u.name, kind: "admin1", parent: country.parent, qid: u.qid, iso: u.iso, type: u.kind, wiki: u.wiki });
      out.steps.push([firstEnt + U.i, country.present, null, fi]);
      unitStat.push({ iso: u.iso, name: u.name, rings: rings.length, km2: Math.round(all.areaKm2) });
    });
    rep.units = unitStat;
    { const usedArcs = new Set(); for (const f of out.faces) for (const ring of f.rings) for (const ref of ring) usedArcs.add(Math.abs(ref) - 1); const unused = out.arcs.length - usedArcs.size; if (unused) throw new Error(unused + " arc(s) written but used by no face"); }
    rep.faces = out.faces.length;
  }
  const extra = {
    kindOf: "admin1",
    core: { file: "atlas/data/topology.bin", buildId: CH.buildId, arcs: C.arcOffset.length - 1 },
    admin1: { countries: spec.countries.map((c) => c.a3), present: spec.countries[0].present, note: "Present-day first-level units of countries the core does not carry, each laid onto the committed core: the coast and the international border are references to the core's own arcs, the inner lines are Natural Earth's. The disputed frontiers are drawn as Natural Earth's default view draws them (the area each state administers); docs/atlas-v2-admin1-layer.md." },
    arcEmpty: out.arcEmpty, faceKm2: out.faceKm2, faceAnchor: out.faceAnchor,
  };
  const model = {
    quantum: Q, lod: { intervals_m: LOD_M, note: "the core's three resident levels; a core-referencing arc takes the core's ranks" }, generated: null, generator: GENERATOR, sources,
    entities: out.entities, steps: out.steps, faceDelta: true,
    vertices: { lon: Int32Array.from(out.lon), lat: Int32Array.from(out.lat) }, rank: Uint8Array.from(out.rank), arcs: out.arcs,
    faces: out.faces, coreRef: out.coreRef, extra,
  };
  const bytes = F.write(model);
  return { bytes, report };
}

const twinText = (bytes) => T.twinText(bytes, BIN, F.read(bytes, { headerOnly: true }).header.sources, true);
const { bytes, report } = build();
const sha = crypto.createHash("sha256").update(bytes).digest("hex");
for (const [a3, r] of Object.entries(report.countries)) {
  say(`${a3}: boundary ${r.boundary.rings} rings / ${r.boundary.points} points; Natural Earth ${r.innerEdges} inner edges in ${r.chains} lines (${r.outerEdges} outer edges left to the core)`);
  say(`${a3}: clip — ${r.clip.piecesKept} pieces on the land, ${r.clip.piecesOutside} off it; ${r.clip.carried} loose ends carried to the core's boundary (largest ${r.clip.carryMaxM} m, median ${r.clip.carryP50M} m), ${r.clip.danglingLeft} left loose`);
  say(`${a3}: ${r.rounds} walk rounds; ${r.ownPieces} inner lines kept, ${r.merged} merges, ${r.untwisted} self-crossing(s) untwisted; ${r.nearestLabels} faces labelled by the nearest unit (farthest ${r.nearestMaxM} m); ${r.zeroWidthRings} zero-width core ring(s) kept with their unit; ${r.droppedRings} Natural Earth ring(s) dropped by the spec`);
  for (const u of r.units) say(`   ${u.iso.padEnd(6)} ${u.name.padEnd(42)} ${String(u.rings).padStart(4)} rings  ${String(u.km2).padStart(8)} km²`);
}
say(`admin1.bin: ${bytes.length} bytes (${(bytes.length / 1024).toFixed(1)} KB; budget ${BUDGET_BYTES / 1024} KB), sha256 ${sha.slice(0, 16)}`);
if (bytes.length > BUDGET_BYTES) { console.error(`✗ over the file's budget of ${BUDGET_BYTES} bytes`); process.exit(1); }
const twinNow = twinText(bytes);
const otherTwins = ["topology.bin.js", "water.bin.js", "history-wars.bin.js", "history-ww2.bin.js"].map((f) => { try { return fs.statSync(path.join(DATA, f)).size; } catch (e) { return 0; } }).reduce((a, b) => a + b, 0);
const allTwins = otherTwins + Buffer.byteLength(twinNow);
say(`twin admin1.bin.js: ${Buffer.byteLength(twinNow)} bytes (gzip); every file:// twin together ${(allTwins / 1e6).toFixed(2)} MB of ${TWINS_MAX / 1e6}`);
if (allTwins > TWINS_MAX) { console.error("✗ the file:// twins together pass 12 MB"); process.exit(1); }
if (CHECK) {
  const bad = [];
  let have = null; try { have = fs.readFileSync(path.join(DATA, BIN)); } catch (e) { bad.push("atlas/data/admin1.bin is missing"); }
  if (have && !Buffer.from(bytes).equals(have)) bad.push("atlas/data/admin1.bin is not what admin1-spec.json, admin1-source.json and the committed core build (run build-admin1.js --install)");
  const tc = T.checkTwin(path.join(DATA, BIN));
  if (!tc.ok) bad.push("the twin admin1.bin.js: " + tc.reason);
  if (bad.length) { for (const b of bad) console.error("✗ " + b); process.exit(1); }
  console.log("✓ admin1.bin and its twin are exactly what the inputs build");
  process.exit(0);
}
fs.mkdirSync(OUT, { recursive: true });
if (!DRY) { fs.writeFileSync(path.join(OUT, BIN), bytes); fs.writeFileSync(path.join(OUT, "admin1-report.json"), JSON.stringify(report, null, 1)); say(`wrote out/${BIN} and out/admin1-report.json`); }
if (INSTALL) {
  fs.writeFileSync(path.join(DATA, BIN), bytes);
  fs.writeFileSync(path.join(DATA, BIN + ".js"), twinNow);
  say(`installed atlas/data/${BIN} and its twin`);
  const { spawnSync } = require("child_process");
  const r = spawnSync(process.execPath, [path.join(HERE, "build-credits.js"), "--install"], { stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status || 1);
}
