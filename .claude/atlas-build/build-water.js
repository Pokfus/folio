#!/usr/bin/env node
/* build-water.js — step 5 of the Atlas v2 build: rivers and lakes → out/water-full.bin (Phase 1b, docs/atlas-v2-design.md §2.3, §7).

     node --max-old-space-size=12000 build-water.js            → out/water-full.bin, out/water-report.json, out/water-log.json
     node … build-water.js --measure                           print the distance distributions and exit (how the tolerances were chosen)

   WHAT IT MAKES. One topology in the shared .bin format (atlas/atlas-format.js) holding every river
   as arcs of kind RIVER and every lake as a face of LAKE arcs, at four levels of detail (10 km /
   2.5 km / 500 m / 250 m), ready for pack-water.js to split into atlas/data/water.bin (levels 0–2)
   and atlas/data/water/<x>-<y>.bin (level 3, on the z=4 grid). Water is an OVERLAY: it never enters
   the land partition, lakes are not cut out of country faces (borders cross lakes), and a river is
   never a border — so the land files of Phase 1a stay byte-identical.

   SOURCES (sources.json): `ne-10m-rivers` — Natural Earth 1:10m rivers and lake centerlines, the
   scale-rank edition (PD) — and `hydrolakes` (CC BY 4.0). HydroRIVERS, which §2.3 named, is NOT used:
   its own page (2026-10-08) defers to the HydroSHEDS v1 License Agreement, a WWF end-user licence that
   forbids distributing the data "as a stand-alone product", requires sub-licences "at least as
   protective", and asks the licensee to protect against copying — not an open licence under §2.10a.
   The entry stays in sources.json under `blocked`, with the finding, so it cannot be fetched by accident.

   RIVERS. Natural Earth draws a river as one or more polylines per scale rank (the lower course of a
   great river is rank 1, its headwaters rank 6+); lake centerlines (a river's course across a lake) and
   canals are dropped. The build makes a network of them:
     1. endpoints that coincide exactly are one node (NE's own chains);
     2. a free end within D_JOIN of another river's line is a tributary: it is projected onto that line,
        which gets a vertex (a junction) there;
     3. a free end in the sea (the OSM partition says so) is trimmed back to the last vertex on land
        and, like a free end on land within D_MOUTH of the coast, snapped onto the nearest coast segment
        of the z=4 tiles (the mouth); a free end within D_LAKE of a kept lake's shore is snapped onto it;
     4. what is left is a source (the upstream end) or, when both ends of a chain are free, a river
        that reaches nothing — endorheic, or a gap in Natural Earth — counted, never hidden.
   Every polyline is then split at its junctions into arcs (an arc is a polyline between junctions,
   §2.3), so Chaikin smoothing in the worker — which keeps an arc's endpoints — never opens a gap at a
   junction. A river's arcs are listed in order in header.rivers for Phase 1c to name and label; an
   intermittent river carries FLAG.INTERMITTENT and is drawn dashed. LOD: an arc's minLod comes from
   its scale rank (≤ 3 at the globe, ≤ 6 from LOD 1, all from LOD 2); vertices are ranked by
   Visvalingam like the coast. Every distance decision is in out/water-log.json and the distributions
   that fixed D_JOIN, D_MOUTH and D_LAKE print under --measure (quoted in §7 "Phase 1b — as built").

   LAKES. HydroLAKES polygons ≥ 5 km² (1.4 M lakes ≥ 0.1 km² exist; the census in §7 shows the 12 MB
   budget buys the ≥ 5 km² set at 250 m). Per level an area filter decides which lakes exist at all —
   ≥ 1000 km² at LOD 0, ≥ 100 at LOD 1, ≥ 10 at LOD 2, ≥ 5 at LOD 3 — so the globe is not speckled; a
   ring whose simplified form has fewer than three vertices at a level is absent there too. Each ring is
   one closed arc (outer rings counter-clockwise, holes clockwise: the water is on the left). A lake
   whose shore vertices mostly lie in the sea of the OSM partition (the Caspian) is dropped: it is
   already water. Lakes are made planar among themselves per level the way build-admin.js makes the
   coast planar: a crossing between two simplified rings re-adds the largest reserve vertex between the
   crossing segment's ends, pass after pass; a crossing no reserve can fix removes the smaller lake from
   that level (and from the file if the level is the finest). Rivers crossing a lake's shore (Natural
   Earth's line across a lake HydroLAKES draws larger) are counted, not repaired: the lake fill is drawn
   over the river, so the line vanishes under the water.
*/
"use strict";
const fs = require("fs"), path = require("path");
const F = require("./lib/format.js");
const R = require("./lib/rings.js");
const G = require("./lib/geo.js");
const SegIndex = require("./lib/segindex.js");
const LandIndex = require("./lib/landindex.js");
const { readShp, readDbf } = require("./lib/shp.js");
const { ensureSource, headerSources } = require("./fetch-sources.js");
const { SnapLog } = require("./lib/log.js");

const HERE = __dirname, OUT = path.join(HERE, "out"), DATA = path.join(HERE, "..", "..", "atlas", "data");
const argv = process.argv.slice(2);
const measureOnly = argv.includes("--measure");
const t0 = Date.now();
const say = (m) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${m}`);
const Q = R.QUANTUM, X180 = R.X180, Y90 = R.Y90;
const KIND = F.KIND, FLAG = F.FLAG;

const LOD_M = [10000, 2500, 500, 250];                 // Visvalingam √area per level; the finest is the water tiles' level
const LAKE_AREA_KM2 = [1000, 100, 10, 5];              // a lake exists at level L when its area ≥ this
const LAKE_MIN_KM2 = LAKE_AREA_KM2[LAKE_AREA_KM2.length - 1];
const SEA_FRACTION = 1 / 3;                            // a lake with more of its sampled shore than this in the OSM sea is dropped
const RIVER_RANK_LOD = (sr) => (sr <= 3 ? 0 : sr <= 6 ? 1 : 2);   // scale rank → first level drawn
/* the three distances, fixed from the --measure distributions of 2026-10-08 (§7 "Phase 1b — as built") */
const D_JOIN = 2000, D_MOUTH = 6000, D_LAKE = 4000;
const TOLERANCE_M = { "ne-10m-rivers": 6000, hydrolakes: 1 };   // the snap log fails the build past these
const log = new SnapLog("build-water", TOLERANCE_M);
const report = { generated: new Date().toISOString(), lod_m: LOD_M, lakeArea_km2: LAKE_AREA_KM2, distances_m: { D_JOIN, D_MOUTH, D_LAKE } };

/* ---------- the land partition ---------- */
const land = LandIndex.load(DATA);
say(`land index: ${land.coastSegments} coast segments from ${land.tiles.length} z=4 tiles in ${land.loadMs} ms`);

/* ---------- lakes ---------- */
const lakeSrc = ensureSource("hydrolakes"), riverSrc = ensureSource("ne-10m-rivers");
const lakes = [];   // { id, name, area, type, country, rings: [{ pts: [[x,y]…] (CCW outer / CW hole), outer, area_u2 }], dropped }
{
  const dbfFile = path.join(lakeSrc.dir, lakeSrc.entry.files[0].replace(/\.shp$/, ".dbf"));
  const dbf = fs.readFileSync(dbfFile);
  const count = dbf.readUInt32LE(4), headLen = dbf.readUInt16LE(8), recLen = dbf.readUInt16LE(10);
  const fields = []; for (let p = 32; p < headLen && dbf[p] !== 0x0d; p += 32) { let name = dbf.toString("latin1", p, p + 11); name = name.slice(0, name.indexOf("\0") >= 0 ? name.indexOf("\0") : 11); fields.push({ name, len: dbf[p + 16] }); }
  const off = {}; let o = 1; for (const f of fields) { off[f.name] = [o, f.len]; o += f.len; }
  const str = (r, f) => dbf.toString("utf8", headLen + r * recLen + off[f][0], headLen + r * recLen + off[f][0] + off[f][1]).trim();
  let read = 0, kept = 0, inSea = 0, tooSmall = 0, degenerate = 0, seaSample = [];
  for (const rec of readShp(path.join(lakeSrc.dir, lakeSrc.entry.files[0]))) {
    read++;
    const r = rec.n - 1; const area = Number(str(r, "Lake_area"));
    if (area < LAKE_MIN_KM2) { tooSmall++; continue; }
    const rings = [];
    for (const part of rec.parts) {
      const pts = []; for (let k = 0; k < part.length; k += 2) pts.push(R.qpt([part[k], part[k + 1]], null, 0));
      const ring = R.dedupeRing(pts); R.cutSpikes(ring);
      if (ring.length < 3) continue;
      const { area: A } = R.ringAreaAndTurn(ring);
      // shapefile: outer rings clockwise (negative planar area), holes counter-clockwise. Ours: water on the left.
      const outer = A < 0;
      if (outer) ring.reverse();
      rings.push({ pts: ring, outer, area_u2: Math.abs(A) });
    }
    if (!rings.some((g) => g.outer)) { degenerate++; continue; }
    // in the sea? the OSM partition decides: sample the largest outer ring's vertices
    const big = rings.filter((g) => g.outer).sort((a, b) => b.area_u2 - a.area_u2)[0];
    const n = big.pts.length, step = Math.max(1, Math.floor(n / 32)); let landN = 0, seaN = 0;
    for (let i = 0; i < n; i += step) { if (land.isLand(big.pts[i][0], big.pts[i][1])) landN++; else seaN++; }
    const name = str(r, "Lake_name");
    // more than a third of the sampled shore in the sea: the lake is the sea's (the Caspian, Lake Melville, the
    // lagoons OSM draws as sea) — a majority rule kept nine half-sea lagoons whose simplified shores then read
    // 52–64 % sea in the checker (measured on the first build)
    if (seaN > (landN + seaN) * SEA_FRACTION) { inSea++; if (seaSample.length < 12) seaSample.push(`${name || "#" + str(r, "Hylak_id")} ${area} km² (${seaN}/${landN + seaN} vertices in sea)`); log.event("lake-in-sea", { hylak: Number(str(r, "Hylak_id")), name, area, seaFraction: Math.round(100 * seaN / (landN + seaN)) / 100 }); continue; }
    lakes.push({ hylak: Number(str(r, "Hylak_id")), name, area, type: Number(str(r, "Lake_type")), country: str(r, "Country"), rings, seaVertices: seaN, sampled: landN + seaN });
    kept++;
    if (read % 200000 === 0) say(`lakes: ${read} read, ${kept} kept`);
  }
  report.lakes = { read, kept, belowMin: tooSmall, inSea, degenerate, seaSample };
  say(`lakes: ${read} read, ${tooSmall} under ${LAKE_MIN_KM2} km², ${inSea} in the sea (${seaSample.slice(0, 4).join("; ")}), ${degenerate} without an outer ring, ${kept} kept`);
}

/* ---------- true overlaps: lakes whose full-resolution rings cross another lake's ----------
   HydroLAKES merges polygons of eight provenances and a few overlap (a reservoir drawn over the lake it
   flooded, two sources' versions of one lake). No re-adding of vertices can make such a pair planar, and
   the per-level repair below would feed every reserve vertex back before giving up (measured: the 40-pass
   cap at every level, 20k vertices re-added at LOD 2). So the pair is settled here, once, on the source
   rings: the smaller lake is dropped from the file and counted. A lake's own rings crossing each other
   (an island drawn across its shore) lose the hole. */
{
  const segs = [];   // [lake, ring, i]
  lakes.forEach((L, li) => L.rings.forEach((g, gi) => { for (let k = 0; k < g.pts.length; k++) segs.push([li, gi, k]); }));
  const grid = SegIndex.build(segs.length, Math.max(80, Math.round(0.02 / Q)), (si) => { const [li, gi, k] = segs[si]; const g = lakes[li].rings[gi], a = g.pts[k], b = g.pts[(k + 1) % g.pts.length]; return [a[0], a[1], b[0], b[1]]; });
  const vec = (li, gi, k) => { const g = lakes[li].rings[gi], p = g.pts[k % g.pts.length]; return G.vec(p[0], p[1], Q); };
  const pairs = new Map(), selfCross = new Map();
  let found = 0;
  const bowties = new Map();   // "lake:ring" → [[ka, kb]…]: a ring crossing ITSELF (the source's own bow-ties)
  grid.pairs((p, q) => {
    const [la, ga, ka] = segs[p], [lb, gb, kb] = segs[q];
    const A = lakes[la].rings[ga], B = lakes[lb].rings[gb];
    const a1 = A.pts[ka], a2 = A.pts[(ka + 1) % A.pts.length], b1 = B.pts[kb], b2 = B.pts[(kb + 1) % B.pts.length];
    if (R.eqPt(a1, b1) || R.eqPt(a1, b2) || R.eqPt(a2, b1) || R.eqPt(a2, b2)) return;
    if (!G.segmentsCross(vec(la, ga, ka), vec(la, ga, ka + 1), vec(lb, gb, kb), vec(lb, gb, kb + 1))) return;
    found++;
    if (la === lb && ga === gb) { const key = la + ":" + ga; (bowties.get(key) || bowties.set(key, []).get(key)).push([Math.min(ka, kb), Math.max(ka, kb)]); return; }
    if (la === lb) { const key = la + ":" + Math.max(ga, gb); selfCross.set(key, (selfCross.get(key) || 0) + 1); return; }
    const key = Math.min(la, lb) + ":" + Math.max(la, lb);
    pairs.set(key, (pairs.get(key) || 0) + 1);
  });
  /* a bow-tie (a ring crossing itself: segment ka × segment kb, ka < kb) is cut at the crossing point: the shorter of the
     two loops it makes — the vertices strictly between the two segments, or the rest of the ring — is dropped and the
     crossing point joins the ends. One cut at a time per ring, re-measured, up to eight; a ring under four vertices after
     cutting is dropped (an outer ring: the lake with it). HydroLAKES rings do this where a polygon pinches through itself. */
  let bowtieCuts = 0, bowtieRingsDropped = 0;
  for (const [key] of bowties) {
    const [li, gi] = key.split(":").map(Number);
    const g = lakes[li].rings[gi];
    for (let round = 0; round < 8; round++) {
      let pts = g.pts, n = pts.length, cut = null;
      // the ring's own segments in a grid (a 50k-vertex shore is 1.25 G pairs by brute force; this is n log n)
      const rg = SegIndex.build(n, Math.max(80, Math.round(0.02 / Q)), (k) => { const a = pts[k], b = pts[(k + 1) % n]; return [a[0], a[1], b[0], b[1]]; });
      let best = null;
      rg.pairs((p, q) => {
        if (best) return;
        const ka = Math.min(p, q), kb = Math.max(p, q);
        if (kb === ka + 1 || (ka === 0 && kb === n - 1)) return;
        const a1 = pts[ka], a2 = pts[(ka + 1) % n], b1 = pts[kb], b2 = pts[(kb + 1) % n];
        if (R.eqPt(a1, b1) || R.eqPt(a1, b2) || R.eqPt(a2, b1) || R.eqPt(a2, b2)) return;
        if (G.segmentsCross(G.vec(a1[0], a1[1], Q), G.vec(a2[0], a2[1], Q), G.vec(b1[0], b1[1], Q), G.vec(b2[0], b2[1], Q))) best = [ka, kb];
      });
      cut = best;
      if (!cut) break;
      const [ka, kb] = cut;
      // the crossing point, in the lon/lat plane (the rings are short-segment; the quantised point lies on both to within a quantum)
      const a1 = pts[ka], a2 = pts[(ka + 1) % n], b1 = pts[kb], b2 = pts[(kb + 1) % n];
      const d = (a2[0] - a1[0]) * (b2[1] - b1[1]) - (a2[1] - a1[1]) * (b2[0] - b1[0]);
      const t = d === 0 ? 0.5 : ((b1[0] - a1[0]) * (b2[1] - b1[1]) - (b1[1] - a1[1]) * (b2[0] - b1[0])) / d;
      const X = [Math.round(a1[0] + (a2[0] - a1[0]) * t), Math.round(a1[1] + (a2[1] - a1[1]) * t)];
      const inner = pts.slice(ka + 1, kb + 1);          // the loop between the two segments
      const outerLoop = pts.slice(kb + 1).concat(pts.slice(0, ka + 1));
      const keep = inner.length >= outerLoop.length ? inner : outerLoop;
      const ring = R.dedupeRing([X].concat(keep)); R.cutSpikes(ring);
      bowtieCuts++;
      if (ring.length < 4) { g.dropped = true; bowtieRingsDropped++; if (g.outer) lakes[li].dropped = true; break; }
      g.pts = ring;
    }
  }
  if (bowtieCuts) report.lakes.bowtieCuts = bowtieCuts, report.lakes.bowtieRingsDropped = bowtieRingsDropped;
  let dropped = 0, holesDropped = 0; const sample = [];
  const gone = new Set();
  for (const [key, n] of [...pairs.entries()].sort((x, y) => y[1] - x[1])) {
    const [a, b] = key.split(":").map(Number);
    if (gone.has(a) || gone.has(b)) continue;
    const victim = lakes[a].area <= lakes[b].area ? a : b, keep = victim === a ? b : a;
    gone.add(victim); dropped++;
    if (sample.length < 12) sample.push(`${lakes[victim].name || "#" + lakes[victim].hylak} ${lakes[victim].area} km² × ${lakes[keep].name || "#" + lakes[keep].hylak} ${lakes[keep].area} km² (${n} crossings)`);
    log.event("lake-overlaps-dropped", { hylak: lakes[victim].hylak, name: lakes[victim].name, area: lakes[victim].area, over: lakes[keep].hylak, overName: lakes[keep].name, crossings: n });
  }
  for (const key of selfCross.keys()) { const [li, gi] = key.split(":").map(Number); const g = lakes[li].rings[gi]; if (g && !g.outer) { g.dropped = true; holesDropped++; } }
  for (const li of gone) lakes[li].dropped = true;
  report.lakes.overlapPairs = pairs.size; report.lakes.overlappingDropped = dropped; report.lakes.selfCrossingHolesDropped = holesDropped; report.lakes.overlapSample = sample;
  say(`overlaps at full resolution: ${found} crossings, ${pairs.size} lake pairs → ${dropped} smaller lakes dropped (${sample.slice(0, 4).join("; ")}); ${holesDropped} holes crossing their own shore dropped; ${bowties.size} rings crossing themselves → ${bowtieCuts} bow-tie cuts, ${bowtieRingsDropped} rings dropped`);
}

/* ---------- rivers ---------- */
const lines = [];   // { pts, name, sr, ne_id, rivernum, wikidata, intermittent, rec }
{
  const shpFile = path.join(riverSrc.dir, riverSrc.entry.files[0]);
  const rows = readDbf(shpFile.replace(/\.shp$/, ".dbf"), "utf8").rows;
  const cla = {}; let dropped = 0;
  for (const rec of readShp(shpFile)) {
    const row = rows[rec.n - 1];
    cla[row.featurecla] = (cla[row.featurecla] || 0) + 1;
    if (!/^River/.test(row.featurecla)) { dropped++; continue; }   // Lake Centerline, Canal
    for (const part of rec.parts) {
      const pts = []; for (let k = 0; k < part.length; k += 2) pts.push(R.qpt([part[k], part[k + 1]], null, 0));
      const line = R.dedupeRing(pts);
      if (line.length < 2) continue;
      lines.push({ pts: line, name: row.name || "", sr: row.scalerank, ne_id: row.ne_id, rivernum: row.rivernum, wikidata: row.wikidataid || "", intermittent: /Intermittent/.test(row.featurecla), label: row.label || row.name_en || row.name || "" });
    }
  }
  report.rivers = { featureClasses: cla, polylines: lines.length, droppedRecords: dropped };
  say(`rivers: ${lines.length} polylines (${JSON.stringify(cla)}; lake centerlines and canals dropped)`);
}

/* ---------- the river network ---------- */
// nodes: exact-coordinate map of endpoints
const nodeKey = (p) => R.pkey(p[0], p[1]);
const endUse = new Map();   // key → count of polyline ends there
for (const l of lines) { for (const p of [l.pts[0], l.pts[l.pts.length - 1]]) endUse.set(nodeKey(p), (endUse.get(nodeKey(p)) || 0) + 1); }
// every river segment, for the tributary search
const segOwner = [], segIdx = [];
for (let li = 0; li < lines.length; li++) for (let k = 1; k < lines[li].pts.length; k++) { segOwner.push(li); segIdx.push(k); }
const riverGrid = SegIndex.build(segOwner.length, Math.round(0.05 / Q), (i) => { const l = lines[segOwner[i]], a = l.pts[segIdx[i] - 1], b = l.pts[segIdx[i]]; return [a[0], a[1], b[0], b[1]]; });
const mPerLat = Q * Math.PI / 180 * G.R_EARTH_M;
function nearestOnLines(p, maxM, excludeLine) {
  const c = Math.cos(p[1] * Q * Math.PI / 180), mLon = mPerLat * c;
  let best = null, bestD2 = maxM * maxM;
  riverGrid.near(p[0], p[1], Math.ceil(maxM / Math.min(mPerLat, mLon)), (i) => {
    const li = segOwner[i]; if (li === excludeLine) return;
    const l = lines[li], a = l.pts[segIdx[i] - 1], b = l.pts[segIdx[i]];
    const ax = (a[0] - p[0]) * mLon, ay = (a[1] - p[1]) * mPerLat, bx = (b[0] - p[0]) * mLon, by = (b[1] - p[1]) * mPerLat;
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
    let t = l2 > 0 ? -(ax * dx + ay * dy) / l2 : 0; if (t < 0) t = 0; else if (t > 1) t = 1;
    const px = ax + dx * t, py = ay + dy * t, d2 = px * px + py * py;
    if (d2 < bestD2) { bestD2 = d2; best = { metres: Math.sqrt(d2), line: li, seg: segIdx[i], t, px: Math.round(a[0] + (b[0] - a[0]) * t), py: Math.round(a[1] + (b[1] - a[1]) * t) }; }
  });
  return best;
}
// lake shores (outer rings of kept lakes) for the river-end search
const shoreOwner = [], shoreRing = [], shoreIdx = [];
lakes.forEach((L, li) => L.rings.forEach((g, gi) => { for (let k = 0; k < g.pts.length; k++) { shoreOwner.push(li); shoreRing.push(gi); shoreIdx.push(k); } }));
const shoreGrid = SegIndex.build(shoreOwner.length, Math.round(0.05 / Q), (i) => { const g = lakes[shoreOwner[i]].rings[shoreRing[i]], a = g.pts[shoreIdx[i]], b = g.pts[(shoreIdx[i] + 1) % g.pts.length]; return [a[0], a[1], b[0], b[1]]; });
function nearestShore(p, maxM) {
  const c = Math.cos(p[1] * Q * Math.PI / 180), mLon = mPerLat * c;
  let best = null, bestD2 = maxM * maxM;
  shoreGrid.near(p[0], p[1], Math.ceil(maxM / Math.min(mPerLat, mLon)), (i) => {
    if (lakes[shoreOwner[i]].dropped) return;
    const g = lakes[shoreOwner[i]].rings[shoreRing[i]], a = g.pts[shoreIdx[i]], b = g.pts[(shoreIdx[i] + 1) % g.pts.length];
    const ax = (a[0] - p[0]) * mLon, ay = (a[1] - p[1]) * mPerLat, bx = (b[0] - p[0]) * mLon, by = (b[1] - p[1]) * mPerLat;
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
    let t = l2 > 0 ? -(ax * dx + ay * dy) / l2 : 0; if (t < 0) t = 0; else if (t > 1) t = 1;
    const px = ax + dx * t, py = ay + dy * t, d2 = px * px + py * py;
    if (d2 < bestD2) { bestD2 = d2; best = { metres: Math.sqrt(d2), lake: shoreOwner[i], ring: shoreRing[i], seg: shoreIdx[i], t, px: Math.round(a[0] + (b[0] - a[0]) * t), py: Math.round(a[1] + (b[1] - a[1]) * t) }; }
  });
  return best;
}
const pct = (arr, p) => { if (!arr.length) return NaN; const a = arr.slice().sort((x, y) => x - y); return a[Math.min(a.length - 1, Math.floor(p * a.length))]; };
const dist = (arr) => ({ n: arr.length, p50: Math.round(pct(arr, 0.5)), p90: Math.round(pct(arr, 0.9)), p95: Math.round(pct(arr, 0.95)), p99: Math.round(pct(arr, 0.99)), max: Math.round(Math.max(0, ...arr)) });

// the ends: classify every free end
const ends = [];   // { line, which: 0|1, p, shared, river: nearest, coast: nearest, shore: nearest, sea: bool }
for (let li = 0; li < lines.length; li++) {
  const l = lines[li];
  for (const which of [0, 1]) {
    const p = which ? l.pts[l.pts.length - 1] : l.pts[0];
    const shared = endUse.get(nodeKey(p)) > 1;
    const e = { line: li, which, p, shared };
    if (!shared) {
      e.river = nearestOnLines(p, 20000, li);
      e.coast = land.nearestCoast(p[0], p[1], 30000);
      e.shore = nearestShore(p, 20000);
      e.sea = !land.isLand(p[0], p[1]);
    }
    ends.push(e);
  }
}
{
  const free = ends.filter((e) => !e.shared);
  const dRiver = free.filter((e) => e.river).map((e) => e.river.metres), dCoast = free.filter((e) => e.coast).map((e) => e.coast.metres), dShore = free.filter((e) => e.shore).map((e) => e.shore.metres);
  const seaEnds = free.filter((e) => e.sea).length;
  report.endDistributions = { ends: ends.length, shared: ends.length - free.length, free: free.length, inSea: seaEnds, toRiver_m: dist(dRiver), toCoast_m: dist(dCoast), toLakeShore_m: dist(dShore),
    toRiverUnder: Object.fromEntries([500, 1000, 2000, 3000, 5000, 10000].map((d) => [d, dRiver.filter((x) => x <= d).length])),
    toCoastUnder: Object.fromEntries([500, 1000, 2000, 4000, 6000, 10000, 20000].map((d) => [d, dCoast.filter((x) => x <= d).length])),
    toShoreUnder: Object.fromEntries([500, 1000, 2000, 4000, 6000, 10000].map((d) => [d, dShore.filter((x) => x <= d).length])) };
  say(`river ends: ${ends.length}, ${ends.length - free.length} shared exactly, ${free.length} free (${seaEnds} in the sea); to another river ${JSON.stringify(report.endDistributions.toRiver_m)}; to the coast ${JSON.stringify(report.endDistributions.toCoast_m)}; to a lake shore ${JSON.stringify(report.endDistributions.toLakeShore_m)}`);
  say(`  free ends within D of a river: ${JSON.stringify(report.endDistributions.toRiverUnder)}; of the coast: ${JSON.stringify(report.endDistributions.toCoastUnder)}; of a lake shore: ${JSON.stringify(report.endDistributions.toShoreUnder)}`);
  if (measureOnly) { console.log(JSON.stringify(report, null, 1)); process.exit(0); }
}

/* decide each free end: of the targets within their tolerance — another river within D_JOIN, the coast
   within D_MOUTH, a lake shore within D_LAKE — the NEAREST wins; a free end in the sea is trimmed back
   to land before its mouth is placed */
const joins = [];   // { line, seg, p } vertices to insert into other lines (junctions)
let nJoin = 0, nMouth = 0, nLake = 0, nTrim = 0, nFree = 0, nSeaFree = 0; const trimM = [], joinM = [], mouthM = [], lakeM = [], nearCoast = [];
const toLonLat = (p) => [p[0] * Q, p[1] * Q];
for (const e of ends) {
  if (e.shared) continue;
  const l = lines[e.line];
  let p = e.p;
  if (e.sea) {
    // walk back to the last vertex on land; the mouth is then placed on the coast. The vertices are not
    // removed yet (the segment index still names them): the trim is applied after the junctions go in.
    let cut = 0, pts = l.pts;
    const order = e.which ? pts.map((_, i) => pts.length - 1 - i) : pts.map((_, i) => i);
    let keep = -1;
    for (const i of order) { if (land.isLand(pts[i][0], pts[i][1])) { keep = i; break; } cut++; }
    if (keep < 0 || pts.length - cut < 2) { nSeaFree++; log.event("river-wholly-in-sea", { name: l.name, ne_id: l.ne_id, vertices: pts.length }); e.unresolved = "whole line in sea"; l.dropped = true; continue; }   // a Natural Earth line over what OSM says is sea (the Indus delta's tidal channels): dropped
    if (cut) {
      let trimmed = 0; for (let k = 1; k <= cut; k++) { const a = e.which ? pts[pts.length - k] : pts[k - 1], b = e.which ? pts[pts.length - k - 1] : pts[k]; trimmed += R.metres(a[0], a[1], b[0], b[1]); }
      e.trimKeep = pts[keep]; nTrim++; trimM.push(trimmed);
      log.event("river-end-trimmed", { name: l.name, ne_id: l.ne_id, vertices: cut, metres: Math.round(trimmed) });
      p = pts[keep];
      e.coast = land.nearestCoast(p[0], p[1], 30000);
      e.river = nearestOnLines(p, 20000, e.line);
      e.shore = nearestShore(p, 20000);
    }
  }
  const setEnd = (q) => { e.newEnd = q; };
  const cands = [];
  if (e.river && e.river.metres <= D_JOIN) cands.push(["river", e.river.metres]);
  if (e.coast && e.coast.metres <= D_MOUTH) cands.push(["coast", e.coast.metres]);
  if (e.shore && e.shore.metres <= D_LAKE) cands.push(["lake", e.shore.metres]);
  cands.sort((a, b) => a[1] - b[1]);
  const pick = cands.length ? cands[0][0] : null;
  if (pick === "river") {
    const q = [e.river.px, e.river.py];
    log.snap({ source: "ne-10m-rivers", kind: "river-end→river", from: toLonLat(p), to: toLonLat(q), metres: e.river.metres, note: l.name });
    setEnd(q); joins.push({ line: e.river.line, seg: e.river.seg, t: e.river.t, p: q }); nJoin++; joinM.push(e.river.metres); e.joined = true;
  } else if (pick === "coast") {
    const q = [e.coast.px, e.coast.py];
    log.snap({ source: "ne-10m-rivers", kind: "river-end→coast", from: toLonLat(p), to: toLonLat(q), metres: e.coast.metres, note: l.name });
    setEnd(q); nMouth++; mouthM.push(e.coast.metres); e.mouth = true;
  } else if (pick === "lake") {
    const q = [e.shore.px, e.shore.py];
    log.snap({ source: "ne-10m-rivers", kind: "river-end→lake-shore", from: toLonLat(p), to: toLonLat(q), metres: e.shore.metres, note: l.name + " → " + (lakes[e.shore.lake].name || "#" + lakes[e.shore.lake].hylak) });
    setEnd(q); nLake++; lakeM.push(e.shore.metres); e.lakeEnd = true;
  } else { nFree++; e.free = true; if (e.coast && e.coast.metres <= 20000) nearCoast.push(e.coast.metres); }
}
report.ends = { joinedToRiver: nJoin, snappedToCoast: nMouth, snappedToLake: nLake, trimmedFromSea: nTrim, trimmed_m: dist(trimM), join_m: dist(joinM), mouth_m: dist(mouthM), lake_m: dist(lakeM), freeOnLand: nFree, freeWithin20kmOfCoast: nearCoast.length, freeNearCoast_m: dist(nearCoast), wholeLineInSea: nSeaFree };
say(`ends: ${nJoin} joined to a river, ${nMouth} snapped to the coast (${nTrim} trimmed back from the sea first, ${JSON.stringify(dist(trimM))} m), ${nLake} snapped to a lake shore, ${nFree} free on land (sources, endorheic ends and gaps), ${nSeaFree} lines wholly in the sea (dropped)`);
// rivers with both ends free: reach nothing
{
  const byLine = new Map(); for (const e of ends) { const a = byLine.get(e.line) || []; a.push(e); byLine.set(e.line, a); }
  let bothFree = 0; const sample = [];
  for (const [li, es] of byLine) if (es.every((e) => e.free)) { bothFree++; if (sample.length < 10) sample.push(lines[li].name || "#" + lines[li].ne_id); }
  report.ends.linesReachingNothing = bothFree; report.ends.linesReachingNothingSample = sample;
  say(`  polylines with both ends free (endorheic, or a gap in the source): ${bothFree} — ${sample.join(", ")}`);
}

/* insert junction vertices, then split every polyline at its junction vertices and at vertices other
   polylines end on; the result is the arc list */
{
  const byLine = new Map();
  for (const j of joins) { const a = byLine.get(j.line) || []; a.push(j); byLine.set(j.line, a); }
  for (const [li, js] of byLine) {
    const l = lines[li];
    js.sort((a, b) => (b.seg - a.seg) || (b.t - a.t));   // insert from the end so earlier indices stay valid
    for (const j of js) { if (R.eqPt(l.pts[j.seg - 1], j.p) || R.eqPt(l.pts[j.seg], j.p)) continue; l.pts.splice(j.seg, 0, j.p); }
  }
  // now the trims (to the kept vertex, found by identity: the junctions above shifted the indices) and the snapped ends
  for (const e of ends) {
    if (e.shared || e.unresolved) continue;
    const l = lines[e.line];
    if (e.trimKeep) { const k = l.pts.indexOf(e.trimKeep); if (k >= 0) { if (e.which) l.pts.splice(k + 1); else l.pts.splice(0, k); } }
    if (e.newEnd && l.pts.length >= 2) { if (e.which) l.pts[l.pts.length - 1] = e.newEnd; else l.pts[0] = e.newEnd; }
  }
}
const junction = new Map();   // key → count of line ends + inserted junctions at this point
for (const l of lines) { for (const p of [l.pts[0], l.pts[l.pts.length - 1]]) junction.set(nodeKey(p), (junction.get(nodeKey(p)) || 0) + 1); }
const riverArcs = [];   // { pts, line }
const riverOfLine = [];
for (let li = 0; li < lines.length; li++) {
  const l = lines[li]; if (l.dropped) continue;
  const pts = R.dedupeRing(l.pts.slice()); if (pts.length < 2) continue;
  // a dedupe of an open line must not drop a last vertex equal to the first (a loop); dedupeRing pops it — put it back
  if (l.pts.length >= 2 && R.eqPt(l.pts[0], l.pts[l.pts.length - 1]) && !R.eqPt(pts[0], pts[pts.length - 1])) pts.push(pts[0]);
  let start = 0; const arcs = [];
  for (let k = 1; k < pts.length; k++) {
    const isEnd = k === pts.length - 1, isJ = !isEnd && junction.has(nodeKey(pts[k]));
    if (isEnd || isJ) { arcs.push(riverArcs.length); riverArcs.push({ pts: pts.slice(start, k + 1), line: li }); start = k; }
  }
  riverOfLine[li] = arcs;
}
say(`river arcs: ${riverArcs.length} from ${lines.length} polylines (${joins.length} junction vertices inserted)`);

/* ---------- the topology: vertices, ranks, arcs, faces ---------- */
const lon = [], lat = [], rank = [], arcs = [], reserve = [];   // reserve: per arc, the dropped vertices [{ x, y, area, after }] for the crossing repair
const rankOf = (area) => { for (let L = 0; L < LOD_M.length; L++) if (area >= LOD_M[L] * LOD_M[L]) return L; return -1; };
function pushArc(pts, closed, kind, source, minLod, flags, keepAll) {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const ar = R.visvalingam(xs, ys, closed);
  const offset = lon.length; let count = 0; const res = [];
  for (let i = 0; i < pts.length; i++) {
    let r = rankOf(ar[i]);
    if (!closed && (i === 0 || i === pts.length - 1)) r = 0;
    if (closed && i === 0) r = 0;
    if (r < 0) { if (keepAll) r = LOD_M.length - 1; else { res.push({ x: pts[i][0], y: pts[i][1], area: ar[i], after: count - 1 }); continue; } }
    lon.push(pts[i][0]); lat.push(pts[i][1]); rank.push(r); count++;
  }
  if (closed) { lon.push(pts[0][0]); lat.push(pts[0][1]); rank.push(0); count++; }   // a closed arc repeats its first vertex
  arcs.push({ offset, count, kind, source, minLod, flags: flags || 0, closed });
  reserve.push(res);
  return arcs.length - 1;
}
// rivers first (source 0), then lakes (source 1)
const entities = [], rivers = [];
const riverEntityOf = new Map();   // ne_id|name → entity index
for (let li = 0; li < lines.length; li++) {
  const l = lines[li]; const arcIds = riverOfLine[li]; if (!arcIds || !arcIds.length) continue;
  const key = l.ne_id + "|" + l.name;
  let ei = riverEntityOf.get(key);
  if (ei == null) { ei = entities.length; riverEntityOf.set(key, ei); entities.push({ id: "river:" + l.ne_id + (l.name ? "" : ":" + li), kind: "river", name: l.name, label: l.label, ne_id: l.ne_id, rivernum: l.rivernum, wikidata: l.wikidata || undefined, scalerank: l.sr }); rivers.push({ entity: ei, arcs: [] }); }
  for (const ai of arcIds) {
    const a = riverArcs[ai];
    const arcIndex = pushArc(a.pts, false, KIND.RIVER, 0, RIVER_RANK_LOD(l.sr), l.intermittent ? FLAG.INTERMITTENT : 0, true);
    rivers[ei].arcs.push(arcIndex + 1);
  }
}
const nRiverArcs = arcs.length;
const faces = [], lakeIds = [], lakeAreas = [], lakeSea = [];
let lakeRingsDropped = 0;
const ENTITY_KM2 = 50;   // a lake with a name, or at least this large, is an entity of its own; the rest share one (34k rows of JSON were 3.5 MB)
const sharedLake = entities.length; entities.push({ id: "lake:unnamed", kind: "lake", name: "", note: "every unnamed lake under " + ENTITY_KM2 + " km²; its HydroLAKES id is header.lakeIds[face]" });
for (const L of lakes) {
  if (L.dropped) continue;
  const areaLod = LAKE_AREA_KM2.findIndex((a) => L.area >= a) >= 0 ? LAKE_AREA_KM2.findIndex((a) => L.area >= a) : -1;
  if (areaLod < 0) continue;
  let ei = sharedLake;
  if (L.name || L.area >= ENTITY_KM2) { ei = entities.length; entities.push({ id: "lake:" + L.hylak, kind: "lake", name: L.name, hylak: L.hylak, area_km2: L.area, type: L.type, country: L.country }); }
  const rings = [];
  const outerRings = L.rings.filter((g) => g.outer);
  for (const g of L.rings) {
    if (g.dropped) continue;
    const ai = pushArc(g.pts, true, KIND.LAKE, 1, areaLod, 0, false);
    const a = arcs[ai];
    // drawable at a level: at least three vertices (plus the closing one) with rank ≤ L
    let first = -1; for (let Lv = areaLod; Lv < LOD_M.length; Lv++) { let c = 0; for (let i = a.offset; i < a.offset + a.count - 1; i++) if (rank[i] <= Lv) c++; if (c >= 3) { first = Lv; break; } }
    if (first < 0) { lakeRingsDropped++; a.minLod = LOD_M.length; continue; }   // never drawable: an arc no face uses, dropped at write time
    a.minLod = first;
    g.arc = ai;
  }
  // a hole can only exist where its outer ring exists
  const outerMin = Math.min(...outerRings.filter((g) => g.arc != null).map((g) => arcs[g.arc].minLod), LOD_M.length);
  for (const g of L.rings) { if (g.arc == null) continue; if (!g.outer) arcs[g.arc].minLod = Math.max(arcs[g.arc].minLod, outerMin); rings.push([g.arc + 1]); }
  faces.push({ entity: ei, source: 1, rings, lake: L }); lakeIds.push(L.hylak); lakeAreas.push(L.area); lakeSea.push(Math.round(100 * L.seaVertices / L.sampled) / 100);
}
say(`topology: ${lon.length} vertices, ${arcs.length} arcs (${nRiverArcs} river, ${arcs.length - nRiverArcs} lake rings, ${lakeRingsDropped} rings never drawable), ${faces.length} lake faces, ${entities.length} entities`);

/* ---------- planarity among lakes, per level ---------- */
const lakeOfArc = new Int32Array(arcs.length).fill(-1);
faces.forEach((f, fi) => f.rings.forEach((r) => { lakeOfArc[r[0] - 1] = fi; }));
report.planar = [];
for (let L = 0; L < LOD_M.length; L++) {
  let passes = 0, readded = 0, removed = 0, holesRemoved = 0, crossings = -1; const perPass = [], lakesRemoved = new Set();
  let removedThisPass = 0, holesThisPass = 0;
  const MAX_PASSES = 24;
  for (; passes < MAX_PASSES; passes++) {
    const segs = [];
    for (let a = nRiverArcs; a < arcs.length; a++) { const A = arcs[a]; if (A.minLod > L) continue; let last = A.offset; for (let i = A.offset + 1; i < A.offset + A.count; i++) if (rank[i] <= L) { segs.push([a, last, i]); last = i; } }
    const grid = SegIndex.build(segs.length, Math.max(80, Math.round(0.05 / Q)), (si) => { const s = segs[si]; return [lon[s[1]], lat[s[1]], lon[s[2]], lat[s[2]]]; });
    const vec = (i) => G.vec(lon[i], lat[i], Q);
    const same = (i, j) => lon[i] === lon[j] && lat[i] === lat[j];
    const found = [];
    grid.pairs((p, q) => { const s = segs[p], t = segs[q]; if (same(s[1], t[1]) || same(s[1], t[2]) || same(s[2], t[1]) || same(s[2], t[2])) return; if (G.segmentsCross(vec(s[1]), vec(s[2]), vec(t[1]), vec(t[2]))) found.push([s, t]); });
    crossings = found.length; perPass.push(crossings);
    if (!crossings) break;
    const lastPass = passes === MAX_PASSES - 1;
    // repair: for each crossing segment, restore EVERY vertex the source had between its ends — stored ones of a
    // finer rank (lowered to L) and the reserve (below the finest tolerance) — so the stretch is at full resolution
    // and cannot cross the other ring's restored stretch (the pre-pass proved the source rings planar). Restoring
    // one vertex at a time, as build-admin.js does for the coast, oscillated here: dense lake districts at 2.5 km
    // (measured: 700 crossings at LOD 1 still 600 after 24 passes). Returns false only when nothing was left to add.
    let fixed = 0; removedThisPass = 0; holesThisPass = 0;
    // the stretch is restored to the NEXT level's resolution first, then two levels finer, then everything: restoring
    // to full resolution at once bloated LOD 0 by 82k vertices (measured) and spawned crossings with every neighbour
    const target = Math.min(LOD_M.length, L + 1 + Math.floor(passes / 2));
    const tolTarget2 = target < LOD_M.length ? LOD_M[target] * LOD_M[target] : 0;
    // every segment in a crossing, once, in DESCENDING arc and vertex order: a restore splices the global vertex
    // arrays, which shifts every index after it — processed this way the indices still to be used stay valid
    // (the first builds restored stale stretches and never converged: ~1,000 crossings a pass at LOD 2, measured)
    const segKey = (s) => s[0] + ":" + s[1];
    const unique = new Map();
    for (const [s, t] of found) { unique.set(segKey(s), s); unique.set(segKey(t), t); }
    const order = [...unique.values()].sort((p, q) => (q[0] - p[0]) || (q[1] - p[1]));
    const addedOn = new Map();
    const readdBetween = (s) => {
      const a = s[0], A = arcs[a];
      const i0 = s[1] - A.offset, i1 = s[2] - A.offset;
      let added = 0;
      for (let i = s[1] + 1; i < s[2]; i++) if (rank[i] > L && rank[i] <= target) { rank[i] = L; added++; }
      const res = reserve[a];
      const take = res.filter((r) => r.after >= i0 && r.after < i1 && r.area >= tolTarget2);
      if (take.length) {
        const takeSet = new Set(take);
        const keepRes = res.filter((r) => !takeSet.has(r));
        const nlon = [], nlat = [], nrank = [], newAfter = new Map();
        let ti = 0;
        for (let k = 0; k < A.count; k++) {
          nlon.push(lon[A.offset + k]); nlat.push(lat[A.offset + k]); nrank.push(rank[A.offset + k]);
          const myIndex = nlon.length - 1;
          for (const r of keepRes) if (r.after === k) newAfter.set(r, myIndex);
          while (ti < take.length && take[ti].after === k) { nlon.push(take[ti].x); nlat.push(take[ti].y); nrank.push(L); ti++; }
        }
        const grow = nlon.length - A.count;
        lon.splice(A.offset, A.count, ...nlon); lat.splice(A.offset, A.count, ...nlat); rank.splice(A.offset, A.count, ...nrank);
        for (let b = a + 1; b < arcs.length; b++) arcs[b].offset += grow;
        for (const r of keepRes) r.after = newAfter.get(r);
        reserve[a] = keepRes;
        A.count = nlon.length;
        added += take.length;
      }
      readded += added;
      return added > 0;
    };
    if (!lastPass) for (const s of order) addedOn.set(segKey(s), readdBetween(s));
    for (const [s, t] of found) { const f1 = !!addedOn.get(segKey(s)), f2 = !!addedOn.get(segKey(t)); if (f1 || f2) { fixed++; } else {
      // nothing left to restore on either side. Two rings of ONE lake (an island against its shore, two islands): the
      // hole leaves this level — never the lake. Two lakes: the smaller leaves this level (and the file, at the finest).
      const fa = lakeOfArc[s[0]], fb = lakeOfArc[t[0]]; if (fa < 0 || fb < 0) continue;
      if (fa === fb) {
        const ra = s[0], rb = t[0]; const isOuter = (a) => faces[fa].lake.rings.some((g) => g.arc === a && g.outer);
        let hole = isOuter(ra) ? rb : isOuter(rb) ? ra : (arcs[ra].count <= arcs[rb].count ? ra : rb);
        if (isOuter(hole)) continue;   // an outer ring crossing its own other outer ring: left as the source has it
        if (arcs[hole].minLod <= L) { arcs[hole].minLod = L + 1; holesRemoved++; holesThisPass++; }
        continue;
      }
      const victim = faces[fa].lake.area <= faces[fb].lake.area ? fa : fb;
      for (const r of faces[victim].rings) { const A = arcs[r[0] - 1]; if (A.minLod <= L) { A.minLod = L + 1; removed++; removedThisPass++; } }
      lakesRemoved.add(victim);
      log.event("lake-removed-from-level", { level: L, lake: faces[victim].lake.name || "#" + faces[victim].lake.hylak, area: faces[victim].lake.area, against: faces[victim === fa ? fb : fa].lake.name || "#" + faces[victim === fa ? fb : fa].lake.hylak });
    } }
    if (!fixed && !removedThisPass && !holesThisPass && target >= LOD_M.length) break;   // nothing changed at full resolution: what is left is the source's own (counted below)
    // after re-adding vertices the segment table is stale: rebuild next pass
  }
  // what the last pass removed is not re-measured: a removed ring draws nothing, so the count left is the pass before's minus those
  report.planar.push({ level: L, passes, readded, holesRemoved, lakesRemoved: lakesRemoved.size, ringsRemoved: removed, perPass, residual: perPass.length === MAX_PASSES ? 0 : crossings });
  say(`planar LOD ${L}: ${passes} pass(es) (${perPass.join(" → ")}), ${readded} vertices re-added, ${holesRemoved} islands and ${lakesRemoved.size} lakes (${removed} rings) removed from the level`);
}
// faces whose outer ring left the finest level vanish; rings with minLod past the end are dropped at write time

/* ---------- rivers crossing lake shores and each other: counted ---------- */
{
  const L = LOD_M.length - 1;
  const segs = [];
  for (let a = 0; a < arcs.length; a++) { const A = arcs[a]; if (A.minLod > L) continue; let last = A.offset; for (let i = A.offset + 1; i < A.offset + A.count; i++) if (rank[i] <= L) { segs.push([a, last, i]); last = i; } }
  const grid = SegIndex.build(segs.length, Math.max(80, Math.round(0.05 / Q)), (si) => { const s = segs[si]; return [lon[s[1]], lat[s[1]], lon[s[2]], lat[s[2]]]; });
  const vec = (i) => G.vec(lon[i], lat[i], Q);
  const same = (i, j) => lon[i] === lon[j] && lat[i] === lat[j];
  let rr = 0, rl = 0; const rlLakes = new Set();
  grid.pairs((p, q) => { const s = segs[p], t = segs[q]; const ks = arcs[s[0]].kind, kt = arcs[t[0]].kind; if (ks === KIND.LAKE && kt === KIND.LAKE) return; if (same(s[1], t[1]) || same(s[1], t[2]) || same(s[2], t[1]) || same(s[2], t[2])) return; if (G.segmentsCross(vec(s[1]), vec(s[2]), vec(t[1]), vec(t[2]))) { if (ks === KIND.RIVER && kt === KIND.RIVER) rr++; else { rl++; rlLakes.add(lakeOfArc[ks === KIND.LAKE ? s[0] : t[0]]); } } });
  report.riverCrossings = { riverRiver: rr, riverLakeShore: rl, lakesCrossedByRivers: rlLakes.size };
  say(`crossings not repaired (counted): river×river ${rr}, river×lake shore ${rl} (${rlLakes.size} lakes)`);
}

/* ---------- write ---------- */
{
  // drop arcs no level draws (minLod past the end) by compacting
  const keep = arcs.map((a) => a.minLod < LOD_M.length);
  const newIndex = new Int32Array(arcs.length).fill(-1); let n = 0; for (let a = 0; a < arcs.length; a++) if (keep[a]) newIndex[a] = n++;
  const lon2 = [], lat2 = [], rank2 = [], arcs2 = [];
  for (let a = 0; a < arcs.length; a++) { if (!keep[a]) continue; const A = arcs[a]; const off = lon2.length; for (let i = A.offset; i < A.offset + A.count; i++) { lon2.push(lon[i]); lat2.push(lat[i]); rank2.push(rank[i]); } arcs2.push({ offset: off, count: A.count, kind: A.kind, source: A.source, minLod: A.minLod, flags: A.flags }); }
  const faces2 = [], lakeIds2 = [], lakeAreas2 = [], lakeSea2 = []; let emptyFaces = 0;
  faces.forEach((f, fi) => { const rings = f.rings.map((r) => newIndex[r[0] - 1]).filter((i) => i >= 0).map((i) => [i + 1]); if (!rings.length) { emptyFaces++; return; } faces2.push({ entity: f.entity, source: f.source, rings }); lakeIds2.push(lakeIds[fi]); lakeAreas2.push(lakeAreas[fi]); lakeSea2.push(lakeSea[fi]); });
  const rivers2 = rivers.map((r) => ({ entity: r.entity, arcs: r.arcs.map((ref) => newIndex[ref - 1] + 1).filter((x) => x > 0) }));
  const perLevel = LOD_M.map((_, L) => rank2.filter((r) => r <= L).length);
  const sources = headerSources(["ne-10m-rivers", "hydrolakes"]);
  const topology = {
    quantum: Q, lod: { intervals_m: LOD_M }, generated: new Date().toISOString(), generator: "folio atlas-build: build-water.js (" + require("./package.json").version + ")",
    sources, entities, steps: [], vertices: { lon: Int32Array.from(lon2), lat: Int32Array.from(lat2) }, rank: Uint8Array.from(rank2), arcs: arcs2, faces: faces2,
    extra: { water: true, rivers: rivers2, lakeIds: lakeIds2, lakeAreas: lakeAreas2, lakeSea: lakeSea2, seaFraction: SEA_FRACTION, lakeArea_km2: LAKE_AREA_KM2, riverRankLod: "scalerank ≤3 → 0, ≤6 → 1, else 2", distances_m: { D_JOIN, D_MOUTH, D_LAKE }, landBuildId: land.header.buildId, built: report.generated },
  };
  log.check();
  fs.mkdirSync(OUT, { recursive: true });
  const bytes = F.writeFile(path.join(OUT, "water-full.bin"), topology);
  report.output = { file: "out/water-full.bin", bytes, vertices: lon2.length, verticesPerLevel: perLevel, arcs: arcs2.length, riverArcs: arcs2.filter((a) => a.kind === KIND.RIVER).length, lakeArcs: arcs2.filter((a) => a.kind === KIND.LAKE).length, faces: faces2.length, emptyFaces, rivers: rivers2.length, entities: entities.length };
  report.snapLog = log.summary();
  log.write(path.join(OUT, "water-log.json"));
  fs.writeFileSync(path.join(OUT, "water-report.json"), JSON.stringify(report, null, 1));
  log.print();
  say(`wrote out/water-full.bin: ${bytes} bytes, ${lon2.length} vertices (per level ${perLevel.join(" / ")}), ${arcs2.length} arcs, ${faces2.length} lake faces (${emptyFaces} with no drawable ring), ${rivers2.length} rivers`);
}
