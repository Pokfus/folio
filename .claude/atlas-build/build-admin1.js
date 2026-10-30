#!/usr/bin/env node
/* build-admin1.js — atlas/data/admin1.bin, the lazy admin-1 layer (docs/atlas-v2-admin1-layer.md, step 1: India only).

     node .claude/atlas-build/build-admin1.js [--measure] [--dry] [--install] [--check] [--refresh]

   WHAT IT MAKES. A file in history.bin's format (atlas/atlas-format.js: coreRef arcs into the committed core, own arcs for the
   rest) holding the present-day admin-1 units of the countries in admin1-spec.json that the core does not carry, so the engine
   can draw them with the code it has, and a country is a spec row and a rebuild of THIS file — never of topology.bin.

   HOW (§3.1's recommendation: a smaller builder for a smaller problem; nothing of build-history.js's conflate() is called or
   copied). Admin-1 units TILE their country, and the country's outline is already in the core. So the job is to SPLIT the
   core's country face by the units' shared interior lines:
     1  the lines: every segment of Natural Earth 10m admin-1 used by two units of the country is interior; the interior segments
        are chained into lines between nodes (a triple point, a point where a line meets the country's outline, or a closed loop);
     2  the ends: a line's end on the outline is snapped onto the core's LOD 2 outline of the country face — where the line crosses
        it, when the end lies outside the face (in the sea, or over a border), else the nearest point of the outline, within
        SNAP_M (measured with --measure: the distance of every Natural Earth outline vertex from the core's outline). The
        junction is stored as history.bin stores a coast junction: a point on a core segment, the outline between two junctions a
        reference by id to the core arc (coreRef), so the units meet the coast and the borders exactly, at every level;
     3  the faces: the outline pieces (in the core's own orientation: the face on the left) and both sides of every line are
        walked into cycles; a clockwise cycle is a hole in the smallest counter-clockwise cycle around it;
     4  the labels: each face goes to the unit of Natural Earth that contains most of a set of interior sample points (the core's
        islands that Natural Earth lacks go to the nearest unit, reported); a line with one unit on both sides is dropped and
        the walk repeated; all faces of one unit are one entity's face (Puducherry's four pieces, the islands);
     5  the levels: the own arcs are ranked per level by Visvalingam (LOD_M, the core's three resident levels, as the history
        does), then repaired: a crossing at a level, against another line or against the outline at that level, re-adds the
        removed vertex of largest area between the crossing segment's ends, round after round.
   Entities are adm1:<a3>:<iso> (kind admin1, parent the core's adm0 id, qid, iso, the DECLARED name and kind from the spec),
   each with one step [the core's present year, null]. The header carries `sources`, the core's buildId, and the classes the
   worker reads (arcEmpty, faceKm2, faceAnchor). No clock in the output: two runs give one sha256.

   THE SOURCE CACHE. admin1-source.json holds the quantised rings of each spec country's units as read from the PINNED Natural
   Earth file (with its sha256), so --check (CI's fast job, offline) rebuilds the file from the cache and the committed core and
   compares bytes. --refresh (or a spec country missing from the cache) reads the pinned shapefile again: run
   `node fetch-sources.js ne-10m-admin1` in this directory first.

   --measure   the distances behind SNAP_M, then exit
   --dry       build and report, write nothing
   --install   copy to atlas/data/admin1.bin, write the file:// twin admin1.bin.js, regenerate credits.js
   --check     rebuild in memory and compare with the committed file and its twin; exit 1 on any difference */
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const R = require("./lib/rings.js");
const G = require("./lib/geo.js");
const SegIndex = require("./lib/segindex.js");
const F = require("./lib/format.js");
const Twin = require("./lib/twin.js");

const HERE = __dirname, ROOT = path.join(HERE, "..", ".."), DATA = path.join(ROOT, "atlas", "data"), OUT = path.join(HERE, "out");
const SPEC_FILE = path.join(HERE, "admin1-spec.json"), CACHE_FILE = path.join(HERE, "admin1-source.json");
const argv = process.argv.slice(2);
const MEASURE = argv.includes("--measure"), DRY = argv.includes("--dry"), INSTALL = argv.includes("--install"), CHECK = argv.includes("--check"), REFRESH = argv.includes("--refresh");
const Q = R.QUANTUM, X180 = R.X180;
const KIND = F.KIND, D2R = Math.PI / 180;
const t0 = Date.now();
const say = (m) => { if (!CHECK || argv.includes("--verbose")) console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${m}`); };
const deg = (x, y) => [+(x * Q).toFixed(5), +(y * Q).toFixed(5)];

/* ---------- the tolerances (measured with --measure on India, 2026-10-30; the figures are in docs/atlas-v2-admin1-layer.md §8) ---------- */
const SNAP_M = 1500;          // a line's end on the outline moves at most this far onto the core's LOD 2 outline; beyond it the build fails
const NEAREST_UNIT_M = 60000; // a core island no Natural Earth unit contains goes to the nearest unit within this; beyond it the build fails
const REPAIR_ROUNDS = 30;
const CELL = Math.round(0.05 / Q);
const SRC_ID = "ne-10m-admin1";

/* ---------- the core ---------- */
const core = F.readFile(path.join(DATA, "topology.bin"));
const CH = core.header, buildId = CH.buildId, nCA = core.arcOffset.length - 1;
const LOD_M = CH.lod.intervals_m.slice();
{ let mx = 0; for (let i = 0; i < core.rank.length; i++) if (core.rank[i] > mx) mx = core.rank[i]; if (mx !== LOD_M.length - 1) throw new Error("the core's finest rank is " + mx + ", its levels " + LOD_M.length); }
const PRESENT = (() => { const ys = new Set(CH.steps.map((s) => s[1])); if (ys.size !== 1) throw new Error("the core's steps start in " + [...ys].join(", ") + ": expected one present year"); return [...ys][0]; })();
say(`core ${buildId}: ${core.lon.length} vertices, ${nCA} arcs, ${core.faces.length} faces; levels ${LOD_M.join(" / ")} m; present ${PRESENT}`);

const spec = JSON.parse(fs.readFileSync(SPEC_FILE, "utf8"));

/* ---------- the source: Natural Earth's rings for each spec country, through the committed cache ---------- */
function manifestEntry() { return JSON.parse(fs.readFileSync(path.join(HERE, "sources.json"), "utf8")).sources.find((s) => s.id === SRC_ID); }
function readNE(countries) {
  const { ensureSource } = require("./fetch-sources.js");
  const { readShp, readDbf } = require("./lib/shp.js");
  const src = ensureSource(SRC_ID, { verifyOnly: true });
  const shp = path.join(src.dir, "ne_10m_admin_1_states_provinces.shp");
  const rows = readDbf(shp.replace(/\.shp$/, ".dbf"), "utf8").rows;
  const out = {};
  for (const c of countries) out[c.a3] = { units: {} };
  let i = 0;
  for (const rec of readShp(shp)) {
    const P = rows[i++]; const c = countries.find((x) => x.a3 === P.adm0_a3); if (!c) continue;
    const u = c.units.find((x) => (x.ne || x.iso) === P.iso_3166_2);
    if (!u) throw new Error(`Natural Earth has ${P.iso_3166_2} (${P.name}) in ${c.a3}; admin1-spec.json does not`);
    const rings = [];
    for (const part of rec.parts) {
      const pts = []; let last = null;
      for (let k = 0; k < part.length; k += 2) { const q = R.qpt([part[k], part[k + 1]]); const key = R.pkey(q[0], q[1]); if (key !== last) { pts.push(q); last = key; } }
      if (pts.length > 1 && R.eqPt(pts[0], pts[pts.length - 1])) pts.pop();
      R.cutSpikes(pts);
      if (pts.length >= 3) rings.push(pts);
    }
    out[c.a3].units[u.iso] = { ne: P.iso_3166_2, neName: P.name, neType: P.type_en, neQid: P.wikidataid, rings };
  }
  for (const c of countries) for (const u of c.units) if (!out[c.a3].units[u.iso]) throw new Error(`admin1-spec.json has ${u.iso}; Natural Earth has no ${u.ne || u.iso} in ${c.a3}`);
  return { sha256: src.sha256, out };
}
// the cache stores each ring as its first point and then deltas, flat: [x0, y0, dx1, dy1, …]
const packRing = (pts) => { const a = [pts[0][0], pts[0][1]]; for (let i = 1; i < pts.length; i++) a.push(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return a; };
const unpackRing = (a) => { const pts = [[a[0], a[1]]]; for (let i = 2; i < a.length; i += 2) pts.push([pts[pts.length - 1][0] + a[i], pts[pts.length - 1][1] + a[i + 1]]); return pts; };
function loadSource() {
  const pin = manifestEntry();
  let cache = fs.existsSync(CACHE_FILE) ? JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")) : null;
  const stale = !cache || cache.source.sha256 !== pin.sha256 || spec.countries.some((c) => !cache.countries[c.a3] || c.units.some((u) => !cache.countries[c.a3].units[u.iso]) || Object.keys(cache.countries[c.a3].units).length !== c.units.length);
  if (CHECK) { if (stale) throw new Error("admin1-source.json is missing, stale against the pin, or out of step with admin1-spec.json: run build-admin1.js --refresh --install"); }
  else if (REFRESH || stale) {
    say(`reading Natural Earth admin-1 (${REFRESH ? "--refresh" : "the cache lacks a spec country or is stale"})…`);
    const ne = readNE(spec.countries);
    cache = { about: "GENERATED by build-admin1.js from the pinned Natural Earth 10m admin-1 file (the sha256 below): the quantised rings (2.5e-4°, lib/rings.js qpt, deduplicated, spikes cut) of each admin1-spec.json country's units, each ring as [x0, y0, dx1, dy1, …]. It lets --check rebuild atlas/data/admin1.bin offline. Do not edit: rerun with --refresh.", source: { id: SRC_ID, sha256: ne.sha256 }, countries: {} };
    for (const c of spec.countries) { const units = {}; for (const u of c.units) { const r = ne.out[c.a3].units[u.iso]; units[u.iso] = { ne: r.ne, neName: r.neName, neType: r.neType, neQid: r.neQid, rings: r.rings.map(packRing) }; } cache.countries[c.a3] = { units }; }
    if (!DRY && !MEASURE) { fs.writeFileSync(CACHE_FILE, JSON.stringify(cache).replace(/\],"/g, "],\n\"") + "\n"); say("wrote admin1-source.json"); }
  }
  if (cache.source.sha256 !== pin.sha256) throw new Error("admin1-source.json was built from another Natural Earth file than the pin");
  return cache;
}
const cache = loadSource();

/* ---------- small geometry: a local planar frame about a point (metres), on quantised units ---------- */
const ux = (x, ref) => (x - ref > X180 ? x - 2 * X180 : ref - x > X180 ? x + 2 * X180 : x);
const wrapX = (x) => (x >= X180 ? x - 2 * X180 : x < -X180 ? x + 2 * X180 : x);
const mLat = Q * D2R * G.R_EARTH_M;
const metres = (x1, y1, x2, y2) => R.metres(x1, y1, x2, y2);
// the nearest point of an index's segments to (x, y) within maxM: { metres, px, py, k, t } or null
function nearestOn(idx, segOf, x, y, maxM) {
  const c = Math.cos(y * Q * D2R), mLon = mLat * c, rU = Math.ceil(maxM / Math.min(mLat, mLon || mLat));
  let best = null, bestD2 = maxM * maxM;
  idx.near(x, y, rU, (k) => {
    const s = segOf(k); const x1 = ux(s[0], x), x2 = ux(s[2], x1), y1 = s[1], y2 = s[3];
    const ax = (x1 - x) * mLon, ay = (y1 - y) * mLat, bx = (x2 - x) * mLon, by = (y2 - y) * mLat, dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
    let t = l2 > 0 ? -(ax * dx + ay * dy) / l2 : 0; if (t < 0) t = 0; else if (t > 1) t = 1;
    const px = ax + dx * t, py = ay + dy * t, d2 = px * px + py * py;
    if (d2 < bestD2 || (d2 === bestD2 && best && k < best.k)) { bestD2 = d2; best = { metres: Math.sqrt(d2), px: wrapX(Math.round(x1 + (x2 - x1) * t)), py: Math.round(y1 + (y2 - y1) * t), k, t }; }
  });
  return best;
}
// where segment p→q crosses segment a→b: { s (along p→q), t (along a→b) } or null; planar about p
function crossAt(p, q, a, b) {
  const c = Math.cos(p[1] * Q * D2R);
  const qx = (ux(q[0], p[0]) - p[0]) * c, qy = q[1] - p[1], ax = (ux(a[0], p[0]) - p[0]) * c, ay = a[1] - p[1], bx = (ux(b[0], p[0]) - p[0]) * c, by = b[1] - p[1];
  const rx = bx - ax, ry = by - ay, den = qx * ry - qy * rx;
  if (den === 0) return null;
  const s = (ax * ry - ay * rx) / den, t = (ax * qy - ay * qx) / den;
  return s >= 0 && s <= 1 && t >= 0 && t <= 1 ? { s, t } : null;
}
// even-odd point in a ring of [x, y] (planar, unwrapped about the point)
function inRing(ring, x, y) {
  let c = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ux(ring[i][0], x), yi = ring[i][1], xj = ux(ring[j][0], x), yj = ring[j][1];
    if ((yi > y) !== (yj > y) && x < xi + (y - yi) * (xj - xi) / (yj - yi)) c = !c;
  }
  return c;
}
const ringBox = (ring) => { let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity; for (const p of ring) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; } return [x0, y0, x1, y1]; };
const inBox = (b, x, y, padU) => x >= b[0] - (padU || 0) && x <= b[2] + (padU || 0) && y >= b[1] - (padU || 0) && y <= b[3] + (padU || 0);
// km² of a ring on the sphere, by the edge sum Σ Δλ (2 + sin φ1 + sin φ2) / 2 · R² (additive: a face split into pieces sums to the whole)
function ringKm2(ring) { const q = Q * D2R; let s = 0; for (let i = 0; i < ring.length; i++) { const a = ring[i], b = ring[(i + 1) % ring.length]; const d = ux(b[0], a[0]) - a[0]; s += d * q * (2 + Math.sin(a[1] * q) + Math.sin(b[1] * q)); } return -s / 2 * (G.R_EARTH_M / 1000) * (G.R_EARTH_M / 1000); }   // counter-clockwise positive
const segDist = (p, a, b) => { const c = Math.cos(p[1] * Q * D2R) * mLat, ax = (ux(a[0], p[0]) - p[0]) * c, ay = (a[1] - p[1]) * mLat, bx = (ux(b[0], p[0]) - p[0]) * c, by = (b[1] - p[1]) * mLat, dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy; let t = l2 > 0 ? -(ax * dx + ay * dy) / l2 : 0; t = Math.max(0, Math.min(1, t)); return Math.hypot(ax + dx * t, ay + dy * t); };

/* ================= one country ================= */
const report = { core: buildId, present: PRESENT, lod_m: LOD_M, snap_m: SNAP_M, nearest_unit_m: NEAREST_UNIT_M, countries: {} };
const ARCS = [];    // output arcs: { kind, source, core: { arc, from, to, segA, segB, empty } | null, va, vb, own: [[x,y]…] | null, rank }
const FACES = [];   // { entity, rings: [[signed ref…]…], km2, anchor }
const ENTS = [];
const SRC_IDX = { ne: 0, coast: 1, adm0: 2 };
const measure = { outline: [], ends: [] };

for (const country of spec.countries) {
  const rep = report.countries[country.a3] = {};
  const entIdx = CH.entities.findIndex((e) => e.id === country.parent);
  if (entIdx < 0) throw new Error(`the core has no entity ${country.parent}`);
  if (CH.entities.some((e) => e.parent === country.parent)) throw new Error(`the core already carries admin-1 units of ${country.parent}: two sources for one state would be two entities with one id (§5)`);
  const cFaces = core.faces.filter((f) => f.entity === entIdx);
  /* the outline: the core face's rings as oriented arcs, and every LOD 2 segment of them in one index */
  const rings = [];   // [{ a, dir }]
  for (const f of cFaces) for (const refs of f.rings) rings.push(Array.from(refs, (r) => ({ a: Math.abs(r) - 1, dir: r > 0 ? 1 : -1 })));
  const arcDir = new Map(); for (const ring of rings) for (const { a, dir } of ring) { if (arcDir.has(a)) throw new Error(`core arc ${a} is walked twice by ${country.parent}`); arcDir.set(a, dir); }
  const bA = [], bI = [];
  for (const ring of rings) for (const { a } of ring) for (let i = core.arcOffset[a] + 1; i < core.arcOffset[a + 1]; i++) { bA.push(a); bI.push(i); }
  const bSeg = (k) => [core.lon[bI[k] - 1], core.lat[bI[k] - 1], core.lon[bI[k]], core.lat[bI[k]]];
  const bIdx = SegIndex.build(bA.length, CELL, bSeg);
  // inside the face: the parity of a ray north against the outline (whole rings, so exact), segments bucketed by longitude strip
  const strips = new Map();
  for (let k = 0; k < bA.length; k++) { const s = bSeg(k); const x0 = s[0], x1 = ux(s[2], x0); for (let st = Math.floor(Math.min(x0, x1) / CELL); st <= Math.floor(Math.max(x0, x1) / CELL); st++) { let l = strips.get(st); if (!l) strips.set(st, l = []); l.push(k); } }
  const inFace = (x, y) => { const l = strips.get(Math.floor(x / CELL)); if (!l) return false; let c = false; for (const k of l) { const s = bSeg(k); const x0 = ux(s[0], x), x1 = ux(s[2], x0); if ((x0 > x) === (x1 > x)) continue; if (s[1] + (x - x0) * (s[3] - s[1]) / (x1 - x0) > y) c = !c; } return c; };
  say(`${country.a3}: the core face ${country.parent}: ${cFaces.length} face(s), ${rings.length} rings, ${arcDir.size} arcs (${[...arcDir.keys()].filter((a) => core.arcKind[a] === KIND.COAST).length} coast, ${[...arcDir.keys()].filter((a) => core.arcKind[a] === KIND.BORDER).length} border), ${bA.length} LOD 2 segments`);

  /* 1. the units' rings and the interior lines */
  const units = country.units.map((u) => ({ spec: u, rings: cache.countries[country.a3].units[u.iso].rings.map(unpackRing) }));
  // the spec's corrections of the source (admin1-spec.json `corrections`): a dropped ring, verified still to need dropping
  rep.corrections = [];
  for (const fx of country.corrections || []) {
    if (fx.drop !== "ring") continue;
    const u = units.find((x) => x.spec.iso === fx.iso); if (!u) throw new Error(`a correction names ${fx.iso}, not a unit of ${country.a3}`);
    const at = R.qpt(fx.at), hit = u.rings.map((r, i) => i).filter((i) => inRing(u.rings[i], at[0], at[1]));
    if (hit.length !== 1) throw new Error(`the ${fx.iso} ring to drop: ${hit.length} rings contain ${fx.at} (stale correction?)`);
    const ring = u.rings[hit[0]], chk = R.qpt(fx.check.outside);
    if (inRing(ring, chk[0], chk[1])) throw new Error(`the ${fx.iso} ring at ${fx.at} now contains its check point ${fx.check.outside}: the correction is stale, remove it`);
    u.rings.splice(hit[0], 1);
    rep.corrections.push({ iso: fx.iso, drop: "ring", vertices: ring.length, km2: +Math.abs(ringKm2(ring)).toFixed(1), checkPointFromRingKm: +(Math.min(...ring.map((p, i) => segDist(chk, p, ring[(i + 1) % ring.length]))) / 1000).toFixed(1) });
  }
  for (const u of units) u.boxes = u.rings.map(ringBox);
  const segUse = new Map();   // "ka:kb" (ka < kb) → { units: Set, a, b }
  units.forEach((u, ui) => { for (const ring of u.rings) for (let i = 0; i < ring.length; i++) { const p = ring[i], q = ring[(i + 1) % ring.length]; const kp = R.pkey(p[0], p[1]), kq = R.pkey(q[0], q[1]); const key = kp < kq ? kp + ":" + kq : kq + ":" + kp; let r = segUse.get(key); if (!r) segUse.set(key, r = { units: new Set(), a: kp < kq ? p : q, b: kp < kq ? q : p }); r.units.add(ui); } });
  const adj = new Map(), outlineV = new Set(), ptOf = new Map();
  let interiorSegs = 0, outlineSegs = 0, multi = 0;
  for (const [key, r] of segUse) {
    const [ka, kb] = key.split(":").map(Number); ptOf.set(ka, r.a); ptOf.set(kb, r.b);
    if (r.units.size === 1) { outlineV.add(ka); outlineV.add(kb); outlineSegs++; continue; }
    if (r.units.size > 2) multi++;
    interiorSegs++;
    const pair = [...r.units].sort((x, y) => x - y).join("|");
    for (const [u, v] of [[ka, kb], [kb, ka]]) { let l = adj.get(u); if (!l) adj.set(u, l = []); l.push({ v, pair, key }); }
  }
  if (multi) throw new Error(`${multi} Natural Earth segments are used by three units or more`);
  // every Natural Earth outline vertex against the core's outline: the measurement behind SNAP_M
  { const ds = []; for (const k of outlineV) { const p = ptOf.get(k); const n = nearestOn(bIdx, bSeg, p[0], p[1], 50000); ds.push(n ? n.metres : Infinity); } ds.sort((a, b) => a - b); measure.outline.push(...ds); rep.outlineVertices = ds.length; rep.outlineVertexToCoreM = { p50: Math.round(ds[Math.floor(ds.length * 0.5)]), p90: Math.round(ds[Math.floor(ds.length * 0.9)]), p99: Math.round(ds[Math.floor(ds.length * 0.99)]), max: Math.round(ds[ds.length - 1]) }; }
  const isNode = (k) => { const l = adj.get(k) || []; return l.length !== 2 || outlineV.has(k) || l[0].pair !== l[1].pair; };
  const lines = [];   // { pts, pair: [ui, uj], a: nodeKey, b: nodeKey, closed }
  const usedSeg = new Set();
  const walk = (start, first) => { const pts = [ptOf.get(start)]; let cur = start, e = first; for (;;) { usedSeg.add(e.key); pts.push(ptOf.get(e.v)); cur = e.v; if (isNode(cur) || cur === start) break; const nx = adj.get(cur).find((x) => !usedSeg.has(x.key)); if (!nx) break; e = nx; } return { pts, pair: first.pair.split("|").map(Number), a: start, b: cur, closed: cur === start }; };
  for (const [k, l] of adj) if (isNode(k)) for (const e of l) if (!usedSeg.has(e.key)) lines.push(walk(k, e));
  for (const [k, l] of adj) for (const e of l) if (!usedSeg.has(e.key)) lines.push(walk(k, e));   // closed loops with no node
  // a `join` correction: two line ends of one pair, both on Natural Earth's outline, joined by a straight chord into one line
  for (const fx of country.corrections || []) {
    if (!fx.join) continue;
    const pair = fx.join.map((iso) => units.findIndex((u) => u.spec.iso === iso)).sort((x, y) => x - y).join("|");
    const keys = fx.ends.map((p) => { const q = R.qpt(p); return R.pkey(q[0], q[1]); });
    const at = keys.map((k) => { const hits = []; lines.forEach((L, i) => { if (L.closed || L.pair.join("|") !== pair) return; if (L.a === k) hits.push({ i, end: "a" }); if (L.b === k) hits.push({ i, end: "b" }); }); if (hits.length !== 1 || !outlineV.has(k)) throw new Error(`the join ${fx.join.join("|")}: ${hits.length} line ends at ${JSON.stringify(fx.ends[keys.indexOf(k)])} on the outline (stale correction?)`); return hits[0]; });
    if (at[0].i === at[1].i) throw new Error(`the join ${fx.join.join("|")} names the two ends of one line`);
    const A = lines[at[0].i], B = lines[at[1].i];
    const ap = at[0].end === "b" ? A.pts : A.pts.slice().reverse(), bp = at[1].end === "a" ? B.pts : B.pts.slice().reverse();
    const chordM = metres(ap[ap.length - 1][0], ap[ap.length - 1][1], bp[0][0], bp[0][1]);
    const merged = { pts: ap.concat(bp), pair: A.pair, a: at[0].end === "b" ? A.a : A.b, b: at[1].end === "a" ? B.b : B.a, closed: false, joined: true };
    lines.splice(Math.max(at[0].i, at[1].i), 1); lines.splice(Math.min(at[0].i, at[1].i), 1, merged);
    rep.corrections.push({ join: fx.join, chordM: Math.round(chordM) });
  }
  rep.ne = { units: units.length, interiorSegments: interiorSegs, outlineSegments: outlineSegs, lines: lines.length, closedLoops: lines.filter((l) => l.closed).length };
  say(`${country.a3}: Natural Earth: ${units.length} units, ${interiorSegs} interior segments chained into ${lines.length} lines (${rep.ne.closedLoops} closed loops), ${outlineSegs} outline segments`);

  /* 2. the lines against the face: every crossing of the core's outline cuts a line and the parts outside are dropped (a line's
        tail in the sea or over a border, Diu's creek in mid-line), the cut a junction ON the outline; then an end left inside the
        face on Natural Earth's outline is extended to the nearest point of the core's outline, within SNAP_M */
  const junctionAtCore = (x, y, k, t) => { const i = bI[k]; if (x === core.lon[i - 1] && y === core.lat[i - 1]) t = 0; else if (x === core.lon[i] && y === core.lat[i]) t = 1; else if (t <= 0 || t >= 1) t = t <= 0 ? 1e-9 : 1 - 1e-9; return { x, y, a: bA[k], i, t }; };
  // the crossings of segment pa→pb with the outline, in order along it (half-open on both segments, so a crossing at a shared vertex counts once)
  const crossingsOf = (pa, pb) => {
    const out = [], seen = new Set();
    const x0 = Math.min(pa[0], ux(pb[0], pa[0])), x1 = Math.max(pa[0], ux(pb[0], pa[0])), y0 = Math.min(pa[1], pb[1]), y1 = Math.max(pa[1], pb[1]);
    for (let cx = Math.floor(x0 / CELL); cx <= Math.floor(x1 / CELL); cx++) for (let cy = Math.floor(y0 / CELL); cy <= Math.floor(y1 / CELL); cy++) bIdx.cell(cx, cy, (k) => { if (seen.has(k)) return; seen.add(k); const sg = bSeg(k); const c = crossAt(pa, pb, [sg[0], sg[1]], [sg[2], sg[3]]); if (c && c.s < 1 && c.t < 1) out.push({ s: c.s, t: c.t, k }); });
    return out.sort((p, q) => p.s - q.s || p.k - q.k);
  };
  const onOutline = (p) => { const n = nearestOn(bIdx, bSeg, p[0], p[1], 5); return n && n.metres < 1 ? n : null; };
  const sideOf = (p) => !!onOutline(p) || inFace(p[0], p[1]);   // a point on the outline is the face's (its closure)
  const snaps = [], clipped = [];
  const isoOf = (L) => L.pair.map((u) => units[u].spec.iso).join("|");
  for (const L0 of lines) {
    let pts = L0.pts; const aKey = L0.a, bKey = L0.b;
    if (L0.closed) {
      const j = pts.findIndex((p) => !inFace(p[0], p[1]));
      if (j < 0) { for (let i = 1; i < pts.length; i++) if (crossingsOf(pts[i - 1], pts[i]).length) throw new Error(`a closed line of ${isoOf(L0)} crosses the outline with every vertex inside`); clipped.push(L0); continue; }
      pts = pts.slice(j, -1).concat(pts.slice(0, j + 1));
    }
    let state = sideOf(pts[0]), cur = state ? { pts: [pts[0]], aJ: null } : null, along = 0;
    const out = [], cuts = [];
    for (let i = 1; i < pts.length; i++) {
      const pa = pts[i - 1], pb = pts[i], segM = metres(pa[0], pa[1], pb[0], pb[1]);
      // a vertex ON the outline (Natural Earth's line touching the core's border at one of its vertices) is a cut of its own: crossings
      // at it are not counted twice, and the side changes there when the segment's two states say so
      const onA = onOutline(pa), onB = onOutline(pb);
      let xs = crossingsOf(pa, pb).filter((c) => !(onA && c.s * segM < 1) && !(onB && (1 - c.s) * segM < 1));
      const want = sideOf(pa) !== sideOf(pb);
      if (((xs.length & 1) === 1) !== want) {
        if (onA) xs.unshift({ s: 0, k: onA.k, t: onA.t, at: pa }); else if (onB) xs.push({ s: 1, k: onB.k, t: onB.t, at: pb });
        else throw new Error(`a segment of ${isoOf(L0)} at ${deg(pa[0], pa[1])} changes side with ${xs.length} crossings of the outline`);
      }
      for (const c of xs) {
        const sg = bSeg(c.k), cx1 = sg[0], cx2 = ux(sg[2], cx1);
        const J = c.at ? junctionAtCore(c.at[0], c.at[1], c.k, c.t) : junctionAtCore(wrapX(Math.round(cx1 + (cx2 - cx1) * c.t)), Math.round(sg[1] + (sg[3] - sg[1]) * c.t), c.k, c.t);
        cuts.push({ J, along: along + segM * c.s });
        if (state) { if (!R.eqPt(cur.pts[cur.pts.length - 1], [J.x, J.y])) cur.pts.push([J.x, J.y]); cur.bJ = J; out.push(cur); cur = null; }
        else cur = { pts: [[J.x, J.y]], aJ: J };
        state = !state;
      }
      if (state && !R.eqPt(cur.pts[cur.pts.length - 1], pb)) cur.pts.push(pb);
      along += segM;
    }
    if (state) out.push(cur);
    if (state !== sideOf(pts[pts.length - 1])) throw new Error(`the crossings of a line of ${isoOf(L0)} with the outline do not match its ends' sides`);
    for (const pc of out) if (pc.pts.length >= 2) clipped.push({ pts: pc.pts, pair: L0.pair, a: pc.aJ ? null : L0.closed ? null : aKey, b: pc.bJ ? null : L0.closed ? null : bKey, aJ: pc.aJ || null, bJ: pc.bJ || null, closed: false, joined: L0.joined });
    // the report: a cut nearest an outline end that lies outside the face is that end's trim; every other cut splits the line
    cuts.forEach((c, n) => {
      const first = n === 0 && !L0.closed && outlineV.has(aKey) && !inFace(pts[0][0], pts[0][1]), last = n === cuts.length - 1 && !L0.closed && outlineV.has(bKey) && !inFace(pts[pts.length - 1][0], pts[pts.length - 1][1]);
      const endP = first ? pts[0] : last ? pts[pts.length - 1] : null;
      const near = endP ? nearestOn(bIdx, bSeg, endP[0], endP[1], 50000) : null;
      snaps.push({ at: deg((endP || [c.J.x, c.J.y])[0], (endP || [c.J.x, c.J.y])[1]), lines: [isoOf(L0)], how: endP ? "crossing" : "split", toOutlineM: near ? Math.round(near.metres) : 0, movedM: endP ? Math.round(metres(endP[0], endP[1], c.J.x, c.J.y)) : 0, trimmedM: endP ? Math.round(first ? c.along : along - c.along) : 0, onto: KIND_NAME(core.arcKind[c.J.a]) });
      if (endP) measure.ends.push(near ? near.metres : Infinity);
    });
  }
  lines.length = 0; lines.push(...clipped);
  // the ends still inside the face, on Natural Earth's outline: extended to the nearest point of the core's outline (one junction per node)
  const ends = new Map();
  for (const L of lines) for (const end of ["a", "b"]) if (L[end] != null && outlineV.has(L[end])) { let l = ends.get(L[end]); if (!l) ends.set(L[end], l = []); l.push({ L, end }); }
  for (const [nk, list] of ends) {
    const p = ptOf.get(nk), near = nearestOn(bIdx, bSeg, p[0], p[1], 50000);
    if (!sideOf(p)) throw new Error(`the outline end at ${deg(p[0], p[1])} is outside the face after the clip`);
    if ((!near || near.metres > SNAP_M) && !MEASURE) throw new Error(`the line end at ${deg(p[0], p[1])} (${list.map((x) => isoOf(x.L)).join(", ")}) is ${near ? Math.round(near.metres) + " m" : "over 50 km"} from the core's outline: over SNAP_M (${SNAP_M} m)`);
    if (!near) throw new Error(`the line end at ${deg(p[0], p[1])} is over 50 km from the core's outline`);
    const J = junctionAtCore(near.px, near.py, near.k, near.t);
    for (const { L, end } of list) { if (end === "b") { if (!R.eqPt(L.pts[L.pts.length - 1], [J.x, J.y])) L.pts.push([J.x, J.y]); } else if (!R.eqPt(L.pts[0], [J.x, J.y])) L.pts.unshift([J.x, J.y]); L[end + "J"] = J; }
    snaps.push({ at: deg(p[0], p[1]), lines: list.map((x) => isoOf(x.L)), how: "extended", toOutlineM: Math.round(near.metres), movedM: Math.round(metres(p[0], p[1], J.x, J.y)), trimmedM: 0, onto: KIND_NAME(core.arcKind[J.a]) });
    measure.ends.push(near.metres);
  }
  // an `island` correction: the core ring around the point goes to one unit whole; the clipped line pieces lying on it are dropped
  const forced = new Map();   // core ring index → unit index
  const ringPtsOf = (ring) => { const pts = []; for (const { a, dir } of ring) { const s = core.arcOffset[a], e = core.arcOffset[a + 1]; for (let k = 0; k < e - s; k++) { const i = dir > 0 ? s + k : e - 1 - k; if (!pts.length || !R.eqPt(pts[pts.length - 1], [core.lon[i], core.lat[i]])) pts.push([core.lon[i], core.lat[i]]); } } return pts; };
  for (const fx of country.corrections || []) {
    if (!fx.island) continue;
    const ui = units.findIndex((u) => u.spec.iso === fx.iso); if (ui < 0) throw new Error(`a correction names ${fx.iso}, not a unit of ${country.a3}`);
    const at = R.qpt(fx.island), hits = rings.map((r, i) => i).filter((i) => inRing(ringPtsOf(rings[i]), at[0], at[1]));
    const sizes = rings.map((r) => r.length), main = sizes.indexOf(Math.max(...sizes));
    if (hits.length !== 1 || hits[0] === main) throw new Error(`the island correction for ${fx.iso} at ${fx.island}: ${hits.length} rings of the core face contain it${hits[0] === main ? " (the mainland)" : ""} — stale correction?`);
    const ri = hits[0], ringArcs = new Set(rings[ri].map((x) => x.a));
    const before = lines.length;
    const iring = ringPtsOf(rings[ri]), onIsland = (L) => L.pts.filter((p) => inRing(iring, p[0], p[1])).length * 2 > L.pts.length;
    const keep = lines.filter((L) => !onIsland(L));
    void ringArcs;
    lines.length = 0; lines.push(...keep);
    forced.set(ri, ui);
    rep.corrections.push({ iso: fx.iso, island: fx.island, ringKm2: +ringKm2(ringPtsOf(rings[ri])).toFixed(1), linePiecesDropped: before - keep.length });
  }
  snaps.sort((a, b) => b.movedM - a.movedM);
  rep.snaps = { count: snaps.length, byHow: snaps.reduce((o, s) => ((o[s.how] = (o[s.how] || 0) + 1), o), {}), maxMovedM: snaps.length ? snaps[0].movedM : 0, p50MovedM: snaps.length ? snaps[Math.floor(snaps.length / 2)].movedM : 0, all: snaps };
  if (MEASURE) continue;
  // a line now ends at its junction (outline ends) or at its node (triple points); the endpoints' keys
  const pk = (p) => p[0] + "," + p[1];
  for (const L of lines) { L.pts = R.dedupeRing(L.pts).length === L.pts.length ? L.pts : L.pts.filter((p, i, a) => i === 0 || !R.eqPt(p, a[i - 1])); if (L.closed && !R.eqPt(L.pts[0], L.pts[L.pts.length - 1])) L.pts.push(L.pts[0]); }
  // every vertex of every line inside the face (or on the outline at a junction)
  { let out = 0; const where = []; for (const L of lines) for (let i = 0; i < L.pts.length; i++) { const p = L.pts[i]; const isJ = (i === 0 && L.aJ) || (i === L.pts.length - 1 && L.bJ); if (!isJ && !sideOf(p)) { out++; if (where.length < 8) where.push(deg(p[0], p[1]) + " " + L.pair.map((u) => units[u].spec.iso).join("|")); } } rep.lineVerticesOutside = out; if (out) throw new Error(`${out} interior-line vertices lie outside the core face after the snap: ${where.join("; ")}`); }

  /* 3. the outline pieces: each oriented arc cut at its junctions (and at its own ends) */
  const jByArc = new Map();
  for (const L of lines) for (const J of [L.aJ, L.bJ]) if (J) { let l = jByArc.get(J.a); if (!l) jByArc.set(J.a, l = []); if (!l.some((x) => x.x === J.x && x.y === J.y)) l.push(J); }
  const posOf = (J) => (J.t <= 0 ? J.i - 1 : J.t >= 1 ? J.i : J.i - 1 + J.t);
  const pieces = [];   // { a, dir, P: [x,y], Q: [x,y], from, to, segA, segB, empty, pts }
  const ringNext = [];
  rings.forEach((ring, ri) => { const first = pieces.length; for (const { a, dir } of ring) {
    const s = core.arcOffset[a], e = core.arcOffset[a + 1];
    const head = dir > 0 ? s : e - 1, tail = dir > 0 ? e - 1 : s;
    const hp = [core.lon[head], core.lat[head]], tp = [core.lon[tail], core.lat[tail]];
    const js = (jByArc.get(a) || []).filter((J) => !R.eqPt([J.x, J.y], hp) && !R.eqPt([J.x, J.y], tp)).sort((p, q) => dir * (posOf(p) - posOf(q)) || p.x - q.x || p.y - q.y);
    const cuts = [{ p: hp, pos: head, seg: 0 }].concat(js.map((J) => ({ p: [J.x, J.y], pos: J.t <= 0 ? J.i - 1 : J.t >= 1 ? J.i : J.i - 0.5, seg: (J.t <= 0 && J.i - 1 === s) || (J.t >= 1 && J.i === e - 1) ? 0 : J.t >= 1 ? Math.min(e - 1, J.i + 1) - s : J.i - s }))).concat([{ p: tp, pos: tail, seg: 0 }]);
    for (let c = 0; c + 1 < cuts.length; c++) {
      const A = cuts[c], B = cuts[c + 1];
      let lo, hi; if (dir > 0) { lo = Math.floor(A.pos) + 1; hi = Math.ceil(B.pos) - 1; } else { lo = Math.floor(B.pos) + 1; hi = Math.ceil(A.pos) - 1; }
      lo = Math.max(lo, s); hi = Math.min(hi, e - 1);
      let from = dir > 0 ? lo - s : hi - s, to = dir > 0 ? hi - s : lo - s, empty = lo > hi;
      while (!empty && core.lon[s + from] === A.p[0] && core.lat[s + from] === A.p[1]) { from += dir; empty = dir > 0 ? from > to : from < to; }
      while (!empty && core.lon[s + to] === B.p[0] && core.lat[s + to] === B.p[1]) { to -= dir; empty = dir > 0 ? from > to : from < to; }
      if (empty && R.eqPt(A.p, B.p)) continue;   // two cuts at one point: no piece
      const pts = [A.p]; if (!empty) for (let i = from; dir > 0 ? i <= to : i >= to; i += dir) pts.push([core.lon[s + i], core.lat[s + i]]); pts.push(B.p);
      pieces.push({ a, dir, P: A.p, Q: B.p, from: empty ? 0 : from, to: empty ? 0 : to, segA: A.seg, segB: B.seg, empty, pts, kind: core.arcKind[a], ring: ri });
    }
  }
  for (let i = first; i < pieces.length; i++) ringNext[i] = i + 1 < pieces.length ? i + 1 : first;
  if (pieces.length > first && !R.eqPt(pieces[pieces.length - 1].Q, pieces[first].P)) throw new Error(`ring ${ri} of the outline does not close`);
  });

  /* 3b. walk the faces; a line with one unit on both sides is dropped and the walk repeated */
  let active = lines.slice(), dropped = [];
  let cycles, label, holeOf, faceOfCycle, labelInfo, degenerate;
  const neUnitAt = (x, y) => { for (let ui = 0; ui < units.length; ui++) { const u = units[ui]; let c = false; for (let r = 0; r < u.rings.length; r++) if (inBox(u.boxes[r], x, y) && inRing(u.rings[r], x, y)) c = !c; if (c) return ui; } return -1; };
  const nearestUnit = (x, y) => { let best = -1, bd = Infinity; units.forEach((u, ui) => { for (let r = 0; r < u.rings.length; r++) { const b = u.boxes[r]; const padU = bd === Infinity ? Infinity : bd / mLat / Math.max(0.2, Math.cos(y * Q * D2R)); if (padU !== Infinity && !inBox(b, x, y, padU)) continue; const ring = u.rings[r]; for (let i = 0; i < ring.length; i++) { const d = segDist([x, y], ring[i], ring[(i + 1) % ring.length]); if (d < bd) { bd = d; best = ui; } } } }); return { unit: best, metres: bd }; };
  for (let round = 0; ; round++) {
    const H = [];   // half-edges: { from, to, pts, piece | line, rev }
    pieces.forEach((pc, i) => H.push({ from: pk(pc.P), to: pk(pc.Q), pts: pc.pts, piece: i }));
    active.forEach((L, i) => { H.push({ from: pk(L.pts[0]), to: pk(L.pts[L.pts.length - 1]), pts: L.pts, line: i, rev: false }); H.push({ from: pk(L.pts[L.pts.length - 1]), to: pk(L.pts[0]), pts: L.pts.slice().reverse(), line: i, rev: true }); });
    const outOf = new Map(); H.forEach((h, i) => { let l = outOf.get(h.from); if (!l) outOf.set(h.from, l = []); l.push(i); });
    const dirAt = (v, w) => { const c = Math.cos(v[1] * Q * D2R); return Math.atan2(w[1] - v[1], (ux(w[0], v[0]) - v[0]) * c); };
    const firstOther = (pts) => { for (let i = 1; i < pts.length; i++) if (!R.eqPt(pts[i], pts[0])) return pts[i]; return pts[pts.length - 1]; };
    const lastOther = (pts) => { const e = pts[pts.length - 1]; for (let i = pts.length - 2; i >= 0; i--) if (!R.eqPt(pts[i], e)) return pts[i]; return pts[0]; };
    const used = new Uint8Array(H.length); cycles = []; degenerate = [];
    for (let h0 = 0; h0 < H.length; h0++) {
      if (used[h0]) continue;
      const cyc = []; let h = h0, guard = 0;
      while (!used[h]) {
        if (guard++ > H.length) throw new Error("a face walk did not close");
        used[h] = 1; cyc.push(h);
        const he = H[h], v = he.pts[he.pts.length - 1], back = dirAt(v, lastOther(he.pts));
        let best = -1, bestRot = Infinity;
        // the outline keeps the core's own ring order (a node the core's ring passes twice — the spike at Sir Creek — is no choice);
        // the angle chooses only between the ring's next piece and the lines leaving the node
        const cands = (outOf.get(he.to) || []).filter((c) => H[c].piece == null || he.piece == null || H[c].piece === ringNext[he.piece]);
        for (const c of cands) {
          const twin = he.line != null && H[c].line === he.line && H[c].rev !== he.rev && !active[he.line].closed;
          let rot = back - dirAt(v, firstOther(H[c].pts)); while (rot <= 1e-12) rot += 2 * Math.PI; while (rot > 2 * Math.PI) rot -= 2 * Math.PI;
          if (twin) rot = 2 * Math.PI + 1;
          if (rot < bestRot) { bestRot = rot; best = c; }
        }
        if (best < 0) throw new Error(`a dead end in the face walk at ${deg(v[0], v[1])}`);
        h = best;
      }
      if (h !== h0) throw new Error("a face walk closed on another half-edge than its first");
      const pts = []; for (const k of cyc) for (const p of H[k].pts) if (!pts.length || !R.eqPt(pts[pts.length - 1], p)) pts.push(p);
      if (pts.length > 1 && R.eqPt(pts[0], pts[pts.length - 1])) pts.pop();
      const area = pts.length >= 3 ? R.ringAreaAndTurn(pts).area : 0;
      // a ring of no area (the core's two-arc ring at Sir Creek: a coast arc and a border arc over the same two points) draws nothing
      // and is left out — the worker drops a ring under three vertices too; one with a line in it would be a fault of the walk
      if (area === 0) { if (cyc.some((k) => H[k].line != null)) throw new Error(`a cycle of no area at ${deg(pts[0][0], pts[0][1])} holds a line`); degenerate.push({ at: deg(pts[0][0], pts[0][1]), arcs: cyc.map((k) => pieces[H[k].piece].a) }); continue; }
      cycles.push({ hs: cyc, pts, area, box: ringBox(pts) });
    }
    // holes: a clockwise cycle goes to the smallest counter-clockwise cycle around one of its vertices
    holeOf = new Int32Array(cycles.length).fill(-1);
    const outers = cycles.map((c, i) => i).filter((i) => cycles[i].area > 0);
    for (let i = 0; i < cycles.length; i++) {
      if (cycles[i].area > 0) continue;
      const own = new Set(cycles[i].pts.map(pk)); let best = -1;
      for (const p of cycles[i].pts) {
        for (const o of outers) { if (!inBox(cycles[o].box, p[0], p[1])) continue; if (cycles[o].pts.some((q) => R.eqPt(q, p))) continue; if (inRing(cycles[o].pts, p[0], p[1]) && (best < 0 || cycles[o].area < cycles[best].area)) best = o; }
        if (best >= 0) break;
      }
      void own;
      if (best < 0) throw new Error(`a clockwise cycle at ${deg(cycles[i].pts[0][0], cycles[i].pts[0][1])} lies in no face`);
      holeOf[i] = best;
    }
    // labels: Natural Earth's unit at interior sample points of each face (an outer cycle less its holes)
    label = new Int32Array(cycles.length).fill(-1); labelInfo = [];
    for (const o of outers) {
      const holes = cycles.map((c, i) => i).filter((i) => holeOf[i] === o).map((i) => cycles[i].pts);
      const inside = (x, y) => inRing(cycles[o].pts, x, y) && !holes.some((hr) => inRing(hr, x, y));
      const P = cycles[o].pts, votes = new Map(), samples = [];
      const segs = []; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; segs.push([metres(a[0], a[1], b[0], b[1]), i]); }
      segs.sort((x, y) => y[0] - x[0] || x[1] - y[1]);
      for (const [lenM, i] of segs.slice(0, 24)) {
        const a = P[i], b = P[(i + 1) % P.length], c = Math.cos(a[1] * Q * D2R);
        const dx = (ux(b[0], a[0]) - a[0]) * c, dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
        const offU = Math.min(lenM * 0.25, 1500) / mLat;
        for (const f of [0.5, 0.25, 0.75]) { const mx = a[0] + (ux(b[0], a[0]) - a[0]) * f, my = a[1] + dy * f; samples.push([wrapX(Math.round(mx - dy / l * offU / c)), Math.round(my + dx / l * offU)]); }
      }
      const bx = cycles[o].box; for (let gx = 1; gx < 8; gx++) for (let gy = 1; gy < 8; gy++) samples.push([Math.round(bx[0] + (bx[2] - bx[0]) * gx / 8), Math.round(bx[1] + (bx[3] - bx[1]) * gy / 8)]);
      let nIn = 0, first = null, bestClear = -1, anchor = null;
      for (const s of samples) {
        if (!inside(s[0], s[1])) continue; nIn++; if (!first) first = s;
        const u = neUnitAt(s[0], s[1]); if (u >= 0) votes.set(u, (votes.get(u) || 0) + 1);
        let clear = Infinity; for (const ring of [P].concat(holes)) for (let i = 0; i < ring.length; i++) { const d = segDist(s, ring[i], ring[(i + 1) % ring.length]); if (d < clear) clear = d; }
        if (clear > bestClear) { bestClear = clear; anchor = s; }
      }
      let u = -1, how = "contains", share = 0, nearM = 0;
      const fr = new Set(cycles[o].hs.map((h) => (H[h].piece != null ? pieces[H[h].piece].ring : -1)));
      if (fr.size === 1 && forced.has([...fr][0])) { u = forced.get([...fr][0]); how = "correction"; share = 1; }
      else if (votes.size) { const tot = [...votes.values()].reduce((s, v) => s + v, 0); const top = [...votes.entries()].sort((x, y) => y[1] - x[1] || x[0] - y[0])[0]; u = top[0]; share = top[1] / tot; }
      else { const at = first || P[0]; const n = nearestUnit(at[0], at[1]); u = n.unit; how = "nearest"; nearM = n.metres; if (n.metres > NEAREST_UNIT_M) throw new Error(`a core island at ${deg(at[0], at[1])} is ${Math.round(n.metres)} m from the nearest unit: over NEAREST_UNIT_M`); }
      label[o] = u; labelInfo[o] = { how, share: +share.toFixed(2), nearM: Math.round(nearM), samplesInside: nIn, anchor: anchor || first || P[0], km2: ringKm2(P) - holes.reduce((s, hr) => s + Math.abs(ringKm2(hr)), 0) };
    }
    for (let i = 0; i < cycles.length; i++) if (holeOf[i] >= 0) label[i] = label[holeOf[i]];
    // a line's two sides
    const sideOf = new Map(); cycles.forEach((c, ci) => { for (const h of c.hs) if (H[h].line != null) sideOf.set(H[h].line + (H[h].rev ? "r" : "f"), ci); });
    const same = active.filter((L, i) => label[sideOf.get(i + "f")] === label[sideOf.get(i + "r")]);
    rep.mismatchedLines = active.filter((L, i) => { const s = new Set([label[sideOf.get(i + "f")], label[sideOf.get(i + "r")]]); return !(s.has(L.pair[0]) && s.has(L.pair[1])); }).map((L) => ({ pair: L.pair.map((u) => units[u].spec.iso), at: deg(L.pts[0][0], L.pts[0][1]) }));
    faceOfCycle = { H };
    if (!same.length) break;
    if (round > 5) throw new Error("lines with one unit on both sides keep appearing");
    for (const L of same) dropped.push({ pair: L.pair.map((u) => units[u].spec.iso), at: deg(L.pts[0][0], L.pts[0][1]), vertices: L.pts.length });
    active = active.filter((L) => !same.includes(L));
  }
  rep.droppedLines = dropped; rep.degenerateRings = degenerate;
  const H = faceOfCycle.H;
  const outers = cycles.map((c, i) => i).filter((i) => cycles[i].area > 0);
  rep.cycles = { total: cycles.length, outer: outers.length, holes: cycles.length - outers.length };
  rep.labels = { byNearest: outers.filter((o) => labelInfo[o].how === "nearest").map((o) => ({ at: deg(labelInfo[o].anchor[0], labelInfo[o].anchor[1]), unit: units[label[o]].spec.iso, metres: labelInfo[o].nearM, km2: +labelInfo[o].km2.toFixed(3) })), lowShare: outers.filter((o) => labelInfo[o].how === "contains" && labelInfo[o].share < 0.9).map((o) => ({ at: deg(labelInfo[o].anchor[0], labelInfo[o].anchor[1]), unit: units[label[o]].spec.iso, share: labelInfo[o].share, km2: +labelInfo[o].km2.toFixed(2) })) };
  say(`${country.a3}: ${snaps.length} junctions (${JSON.stringify(rep.snaps.byHow)}; moved ≤ ${rep.snaps.maxMovedM} m), ${pieces.length} outline pieces, ${active.length} lines (${dropped.length} dropped), ${outers.length} faces + ${cycles.length - outers.length} holes; ${rep.labels.byNearest.length} labelled by the nearest unit, ${rep.labels.lowShare.length} under a 0.9 share`);

  /* 4. arcs, faces, entities */
  const arcBase = ARCS.length;
  const usedPiece = new Set(); for (const c of cycles) for (const h of c.hs) if (H[h].piece != null) usedPiece.add(H[h].piece);
  const pieceArc = pieces.map((pc, i) => { if (!usedPiece.has(i)) return -1; ARCS.push({ kind: pc.kind, source: pc.kind === KIND.COAST ? SRC_IDX.coast : SRC_IDX.adm0, core: { arc: pc.a, from: pc.from, to: pc.to, segA: pc.segA, segB: pc.segB, empty: pc.empty }, va: pc.P, vb: pc.Q, own: null }); return ARCS.length - 1; });
  const lineArc = active.map((L) => { ARCS.push({ kind: KIND.ADMIN1, source: SRC_IDX.ne, core: null, own: L.pts, va: L.pts[0], vb: L.pts[L.pts.length - 1], pair: L.pair }); return ARCS.length - 1; });
  void arcBase;
  const refOf = (h) => { const he = H[h]; return he.piece != null ? pieceArc[he.piece] + 1 : he.rev ? -(lineArc[he.line] + 1) : lineArc[he.line] + 1; };
  const unitsRep = [];
  units.forEach((u, ui) => {
    const os = outers.filter((o) => label[o] === ui);
    if (!os.length) throw new Error(`${u.spec.iso} (${u.spec.name}) has no face after the split`);
    const ringsOut = [];
    for (const o of os) { ringsOut.push(cycles[o].hs.map(refOf)); for (let i = 0; i < cycles.length; i++) if (holeOf[i] === o) ringsOut.push(cycles[i].hs.map(refOf)); }
    const km2 = os.reduce((s, o) => s + labelInfo[o].km2, 0);
    // the anchor: the sample point farthest inside the unit's largest piece
    const big = os.slice().sort((p, q) => labelInfo[q].km2 - labelInfo[p].km2)[0];
    const e = ENTS.length;
    ENTS.push({ id: `adm1:${country.a3.toLowerCase()}:${u.spec.iso.toLowerCase()}`, name: u.spec.name, kind: "admin1", parent: country.parent, qid: u.spec.qid, iso: u.spec.iso, type: u.spec.kind === "state" ? "State" : "Union territory" });
    FACES.push({ entity: e, rings: ringsOut, km2, anchor: labelInfo[big].anchor });
    unitsRep.push({ iso: u.spec.iso, name: u.spec.name, pieces: os.length, holes: ringsOut.length - os.length, km2: Math.round(km2 * 10) / 10 });
  });
  rep.units = unitsRep;
}
if (MEASURE) {
  const pct = (a, p) => a.length ? Math.round(a[Math.min(a.length - 1, Math.floor(a.length * p))]) : null;
  measure.outline.sort((a, b) => a - b); measure.ends.sort((a, b) => a - b);
  console.log(`\nNatural Earth outline vertices → the core's LOD 2 outline (m): n ${measure.outline.length}, p50 ${pct(measure.outline, 0.5)}, p90 ${pct(measure.outline, 0.9)}, p99 ${pct(measure.outline, 0.99)}, p99.9 ${pct(measure.outline, 0.999)}, max ${pct(measure.outline, 1)}`);
  console.log(`line ends on the outline → the core's outline (m): n ${measure.ends.length}, p50 ${pct(measure.ends, 0.5)}, p90 ${pct(measure.ends, 0.9)}, max ${pct(measure.ends, 1)}`);
  for (const [a3, rep] of Object.entries(report.countries)) { console.log(`${a3}: ${JSON.stringify(rep.snaps.byHow)}; the largest moves:`); for (const s of rep.snaps.all.slice(0, 12)) console.log("   " + JSON.stringify(s)); }
  process.exit(0);
}
function KIND_NAME(k) { return F.KIND_NAME[k]; }

/* ================= 5. ranks per level, then the planarity repair against the same level's outline ================= */
// a quantisation knot: two segments of one line, at most three apart, that cross once rounded to the quantum (Yanam's ring); the one
// vertex whose removal undoes it goes (a move of a few metres), reported
report.knots = [];
for (const a of ARCS) {
  if (!a.own) continue;
  const V = (p) => G.vec(p[0], p[1], Q), crosses = (pts, i, j) => !R.eqPt(pts[i + 1], pts[j]) && !R.eqPt(pts[i], pts[j + 1]) && G.segmentsCross(V(pts[i]), V(pts[i + 1]), V(pts[j]), V(pts[j + 1]));
  const knotAt = (pts) => { for (let i = 0; i + 1 < pts.length; i++) for (let j = i + 2; j <= i + 4 && j + 1 < pts.length; j++) if (crosses(pts, i, j)) return [i, j]; return null; };
  for (let guard = 0, k = knotAt(a.own); k && guard < 50; guard++, k = knotAt(a.own)) {
    let done = false;
    for (let v = k[0] + 1; v <= k[1] && !done; v++) { if (v === 0 || v === a.own.length - 1) continue; const t = a.own.slice(0, v).concat(a.own.slice(v + 1)); const kk = knotAt(t); if (!kk || kk[0] > k[1]) { report.knots.push({ pair: a.pair, at: deg(a.own[v][0], a.own[v][1]) }); a.own = t; done = true; } }
    if (!done) throw new Error(`a knot in a line at ${deg(a.own[k[0]][0], a.own[k[0]][1])} that no single vertex undoes`);
  }
}
for (const a of ARCS) {
  if (!a.own) continue;
  const area = R.visvalingam(a.own.map((p) => p[0]), a.own.map((p) => p[1]), false);
  a.area = area;
  a.rank = a.own.map((p, i) => { if (i === 0 || i === a.own.length - 1) return 0; const sz = Math.sqrt(area[i]); for (let L = 0; L < LOD_M.length; L++) if (sz >= LOD_M[L]) return L; return LOD_M.length - 1; });
}
const sources = (() => {
  const { headerSources } = require("./fetch-sources.js");
  const ne = headerSources([SRC_ID])[0];
  const coast = CH.sources.find((s) => s.id === "osm-land-polygons"), adm0 = CH.sources.find((s) => s.id === "ne-10m-admin0");
  if (!coast || !adm0) throw new Error("the core header lacks the OSM or the Natural Earth admin-0 source entry");
  const pick = (s) => ({ id: s.id, name: s.name, version: s.version, url: s.url, licence: s.licence, licenceUrl: s.licenceUrl, attribution: s.attribution, retrieved: s.retrieved, sha256: s.sha256 });
  return [pick(ne), pick(coast), pick(adm0)];
})();
function topologyOf() {
  const lon = [], lat = [], rank = [], arcs = [], coreRef = [];
  for (const a of ARCS) {
    const off = lon.length;
    if (a.core) { lon.push(a.va[0], a.vb[0]); lat.push(a.va[1], a.vb[1]); rank.push(0, 0); coreRef.push({ core: a.core.arc, from: a.core.from, to: a.core.to, segA: a.core.segA, segB: a.core.segB }); }
    else { for (let i = 0; i < a.own.length; i++) { lon.push(a.own[i][0]); lat.push(a.own[i][1]); rank.push(a.rank[i]); } coreRef.push({ core: -1 }); }
    arcs.push({ offset: off, count: lon.length - off, kind: a.kind, source: a.source, minLod: 0, flags: 0 });
  }
  const steps = ENTS.map((e, i) => [i, PRESENT, null, i]);
  return {
    quantum: Q, lod: { intervals_m: LOD_M, note: "the core's three resident levels; a core-referencing arc takes the core's ranks" },
    generated: null, generator: "folio atlas-build: build-admin1.js (" + require("./package.json").version + ")", sources,
    entities: ENTS, steps, faceDelta: true,
    vertices: { lon, lat }, rank, arcs, faces: FACES.map((f) => ({ entity: f.entity, source: SRC_IDX.ne, rings: f.rings })), coreRef,
    extra: {
      kindOf: "admin1", core: { file: "atlas/data/topology.bin", buildId, arcs: nCA },
      admin1: {
        scope: "The present-day first-level units (states, provinces, territories) of the countries in admin1-spec.json that topology.bin does not carry, conflated onto it: " + spec.countries.map((c) => c.name + " (" + c.units.length + ")").join(", ") + ". Names, kinds and ISO 3166-2 codes are declared in the spec, not read from Natural Earth.",
        countries: spec.countries.map((c) => ({ a3: c.a3, parent: c.parent, units: c.units.length })),
        snap_m: SNAP_M, lod_m: LOD_M,
        licence: "ODbL-1.0 as a whole: the file embeds junctions snapped onto OpenStreetMap geometry and references the OSM coast by arc id; the interior lines are Natural Earth's (public domain).",
      },
      arcEmpty: ARCS.map((a) => (a.core && a.core.empty ? 1 : 0)),
      faceKm2: FACES.map((f) => Math.round(f.km2)),
      faceAnchor: FACES.map((f) => deg(f.anchor[0], f.anchor[1])),
    },
  };
}
// the drawn segments of every arc at level L, as the engine computes them (atlas-format.js historyArcGeometry)
function levelSegments(Hr, L) {
  const J = F.historyJunctions(Hr, core), empty = Hr.header.arcEmpty, nA = Hr.arcOffset.length - 1, segs = [];
  for (let a = 0; a < nA; a++) { const pts = F.historyArcGeometry(Hr, core, a, L, J, empty); for (let i = 1; i < pts.length; i++) segs.push({ a, i, p: pts[i - 1], q: pts[i] }); }
  return segs;
}
function crossings(Hr, L) {
  const segs = levelSegments(Hr, L);
  const idx = SegIndex.build(segs.length, CELL, (k) => [segs[k].p[0], segs[k].p[1], segs[k].q[0], segs[k].q[1]]);
  const out = [], V = (p) => G.vec(p[0], p[1], Q);
  idx.pairs((x, y) => {
    const s = segs[x], t = segs[y];
    if (R.eqPt(s.p, t.p) || R.eqPt(s.p, t.q) || R.eqPt(s.q, t.p) || R.eqPt(s.q, t.q)) return;
    if (G.segmentsCross(V(s.p), V(s.q), V(t.p), V(t.q))) out.push([s, t]);
  });
  return out;
}
const repairLog = [];
let topology, bytes, Hread;
for (let round = 0; ; round++) {
  topology = topologyOf(); bytes = F.write(topology); Hread = F.read(bytes);
  let fixed = 0; const left = [];
  for (let L = 0; L < LOD_M.length; L++) {
    const xs = crossings(Hread, L); left.push(xs.length);
    for (const pair of xs) for (const s of pair) {
      const A = ARCS[s.a]; if (!A.own) continue;
      // the own vertices surviving the level (the geometry's points are these, endpoints moved to their junctions)
      const surv = []; for (let i = 0; i < A.own.length; i++) if (A.rank[i] <= L) surv.push(i);
      const u = surv[s.i - 1], w = surv[s.i]; let best = -1;
      for (let i = u + 1; i < w; i++) if (A.rank[i] > L && (best < 0 || A.area[i] > A.area[best])) best = i;
      if (best >= 0) { A.rank[best] = L; fixed++; }
    }
  }
  repairLog.push({ round, crossingsPerLevel: left, fixed });
  if (!fixed || round >= REPAIR_ROUNDS) { report.crossingsLeft = left; break; }
}
report.repair = repairLog;
say(`quantisation knots undone: ${report.knots.length} (${report.knots.map((k) => JSON.stringify(k.at)).join(", ")}); planarity repair: ${repairLog.length} round(s); crossings left per level ${report.crossingsLeft.join(" / ")}; re-added ${repairLog.reduce((s, r) => s + r.fixed, 0)} vertices`);

const sha = crypto.createHash("sha256").update(bytes).digest("hex");
const ownV = ARCS.filter((a) => a.own).reduce((s, a) => s + a.own.length, 0);
report.result = { bytes: bytes.length, sha256: sha, entities: ENTS.length, faces: FACES.length, arcs: ARCS.length, arcsCoastRef: ARCS.filter((a) => a.core && a.kind === KIND.COAST).length, arcsBorderRef: ARCS.filter((a) => a.core && a.kind === KIND.BORDER).length, arcsOwn: ARCS.filter((a) => a.own).length, ownVertices: ownV, ownVerticesPerLevel: LOD_M.map((_, L) => ARCS.filter((a) => a.own).reduce((s, a) => s + a.rank.filter((r) => r <= L).length, 0)), seconds: +((Date.now() - t0) / 1000).toFixed(1) };
say(`admin1.bin: ${bytes.length} bytes (${(bytes.length / 1e6).toFixed(3)} MB decimal), sha256 ${sha}; ${ENTS.length} entities, ${ARCS.length} arcs (${report.result.arcsCoastRef} coast and ${report.result.arcsBorderRef} border references, ${report.result.arcsOwn} own with ${ownV} vertices: ${report.result.ownVerticesPerLevel.join(" / ")} per level)`);
{ const h = F.read(bytes, { headerOnly: true }).header; say(`  header ${(JSON.stringify(h).length / 1024).toFixed(1)} KB; ` + Object.entries(h.sections).map(([k, v]) => `${k} ${(v.length / 1024).toFixed(1)} KB`).join(", ")); }

if (CHECK) {
  let fail = 0;
  const file = path.join(DATA, "admin1.bin");
  if (!fs.existsSync(file)) { console.log("  FAIL  atlas/data/admin1.bin does not exist"); process.exit(1); }
  const got = crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
  if (got === sha) console.log(`  ok    atlas/data/admin1.bin is what admin1-spec.json, admin1-source.json and the committed core build (${bytes.length} bytes, sha256 ${sha.slice(0, 16)}…)`);
  else { fail++; console.log(`  FAIL  atlas/data/admin1.bin lags its inputs: committed ${got}, rebuilt ${sha} — run build-admin1.js --install`); }
  const tw = Twin.checkTwin(file);
  if (tw.ok) console.log(`  ok    admin1.bin.js, the file:// twin, decodes to the same bytes (${tw.twinBytes} bytes)`); else { fail++; console.log(`  FAIL  admin1.bin.js: ${tw.reason}`); }
  process.exit(fail ? 1 : 0);
}
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "admin1-report.json"), JSON.stringify(report, null, 1));
say("wrote out/admin1-report.json");
if (!DRY) {
  fs.writeFileSync(path.join(OUT, "admin1.bin"), bytes);
  say("wrote out/admin1.bin");
  if (INSTALL) {
    const file = path.join(DATA, "admin1.bin");
    fs.writeFileSync(file, bytes);
    const tw = Twin.writeTwin(file, { gzip: true });
    say(`installed atlas/data/admin1.bin and its twin admin1.bin.js (${tw.twinBytes} bytes, gzip)`);
    try { require("./build-credits.js").build({ install: true }); say("regenerated atlas/data/credits.js"); } catch (e) { say("credits: " + e.message); }
  }
}
