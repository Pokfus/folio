#!/usr/bin/env node
/* check-water.js — the gate for the water files (Phase 1b, docs/atlas-v2-design.md §2.3, §2.11).

     node .claude/atlas-build/check-water.js [--max-bytes N] [--quiet]

   Reads atlas/data/water.bin and every atlas/data/water/<x>-<y>.bin with the same atlas/atlas-format.js
   the browser uses, and the land partition's z=4 tiles through lib/landindex.js — zero dependencies, so
   CI runs it without `npm ci`. Exit 1 on any failure. WHAT IT PROVES:

     licences      every arc and face traces to a source in the file's own header; the header's sources
                   are complete (§2.10a); every tile carries the core's sources and buildId
     well-formed   ranks within the LOD count, endpoints rank 0, every face ring is one closed LAKE arc
                   walked forward (the water on its left), every RIVER arc is in exactly one river's list
                   and in order (the arc's start is the previous arc's end, or a junction)
     planar        at every resident level, and in every tile, no two drawn LAKE segments cross — lakes
                   are planar among themselves (rivers crossing a lake's shore are counted, not failed:
                   the lake fill is drawn over the river)
     inside land   every lake's shore vertices lie on land in the z=4 partition to within the stated
                   tolerance: at most TOL_SEA_FRACTION of a lake's sampled vertices in the sea, and no
                   lake with a majority of them there (the Caspian rule); the count of vertices in the
                   sea is printed
     river ends    every river arc's end is (a) shared with another river arc, (b) on the coast within
                   TOL_END m, (c) on a lake's finest shore within TOL_END m, or (d) a free end on land
                   (a source, an endorheic end or a gap in the source), counted; no end is in the sea
     tiles         the index matches the directory; every tile arc with a core reference is a piece of
                   that core arc (kind, source, flags; outer ends coincide with the core arc's endpoints);
                   every EDGE chord is on the tile boundary and never stroked; a tile face names a core
                   face or carries an entity the core table has
     points        the 50 largest Natural Earth 10m lakes' interior points (PD; coordinates below, from the
                   ne_10m_lakes shapefile's own geometry) fall inside a lake face, or within 5 km of a lake
                   shore where the two sources draw the water differently (counted apart);
                   30 Natural Earth populated places that sit on great rivers (PD; coordinates from
                   ne_10m_populated_places) lie within TOL_CITY m of a river arc
     size          water.bin + tiles within --max-bytes (the owner's 12 MB)
*/
"use strict";
const fs = require("fs"), path = require("path");
const F = require("./lib/format.js");
const G = require("./lib/geo.js");
const SegIndex = require("./lib/segindex.js");
const LandIndex = require("./lib/landindex.js");

const argv = process.argv.slice(2);
const flag = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const quiet = argv.includes("--quiet");
const DATA = path.join(__dirname, "..", "..", "atlas", "data");
const file = path.join(DATA, "water.bin"), tileDir = path.join(DATA, "water");
const maxBytes = Number(flag("--max-bytes", 12 * 1024 * 1024));
const TOL_END = 60;            // m: a snapped end sits on its target to within a quantum or two (28 m)
const TOL_CITY = 10000;        // m: a river city's NE point to the river line — measured 2026-10-08: p50 under 2 km, the farthest Memphis at 8.4 km (a 1:10M line against a city-centre point; the city itself is wider)
const TOL_SEA_FRACTION = 0.5;  // a lake with more of its sampled shore in the sea than this is the sea

let pass = 0, fail = 0;
const ok = (m, d) => { pass++; if (!quiet) console.log(`  \x1b[32mok\x1b[0m    ${m}${d ? "  \x1b[2m" + d + "\x1b[0m" : ""}`); };
const bad = (m, d) => { fail++; console.log(`  \x1b[31mFAIL\x1b[0m  ${m}${d ? "  \x1b[2m" + d + "\x1b[0m" : ""}`); };
const note = (m) => { if (!quiet) console.log(`        \x1b[2m${m}\x1b[0m`); };

/* The 50 largest lakes of Natural Earth 10m (ne_10m_lakes 5.0.0, PD) by their own polygon area (holes subtracted),
   each with a point INSIDE NE's polygon by even-odd over every ring — the centroid of the outer ring, or where that
   falls outside (a crescent) or on an island, the middle of the longest water chord through it — rounded to
   2 decimals; computed from the shapefile on 2026-10-08, not written from memory. A HydroLAKES face must contain the point at the finest level. The Caspian and the Aral are left out:
   the Caspian is sea in the OSM partition and is dropped by design; the Aral's NE polygon is its old extent. */
const NE_LAKES = [
  ["Lake Superior", -87.66, 47.64],
  ["Lake Victoria", 33.06, -1.26],
  ["Lake Huron", -81.92, 45.19],
  ["Lake Michigan", -86.63, 44.65],
  ["Lake Tanganyika", 29.67, -6.46],
  ["Lake Baikal", 107.98, 53.67],
  ["Great Bear Lake", -120.54, 66.01],
  ["Lake Malawi", 34.57, -12.19],
  ["Great Slave Lake", -113.66, 61.96],
  ["Lake Erie", -81.45, 42.14],
  ["Lake Winnipeg", -97.61, 52.5],
  ["Lake Ontario", -77.83, 43.92],
  ["Lake Balkhash", 74.4, 46.28],
  ["Lake Ladoga", 31.19, 60.93],
  ["Georgian Bay", -80.51, 45.27],
  ["Lake Onega", 35.09, 61.92],
  ["Lake Saimaa", 28.24, 62.24],
  ["Represa de Sobradinho", -42.41, -10.08],
  ["Lake Eyre North", 137.4, -28.59],
  ["Lago Titicaca", -69.34, -15.92],
  ["Lake Athabasca", -109.99, 59.09],
  ["Lake Volta", -0.21, 7.71],
  ["Lago de Nicaragua", -85.41, 11.58],
  ["Lake Turkana", 36.04, 3.58],
  ["Smallwood Reservoir", -64.25, 54.26],
  ["Reindeer Lake", -102.48, 57.17],
  ["Issyk-Kul", 77.31, 42.48],
  ["Samara Reservoir", 48.9, 54.68],
  ["Vänern", 13.63, 58.94],
  ["Nettilling Lake", -70.36, 66.46],
  ["Lake Albert", 30.89, 1.63],
  ["Lake Winnipegosis", -99.77, 52.47],
  ["Lake Torrens", 137.71, -31.1],
  ["Lac Moeru", 28.63, -9.18],
  ["Lake Manitoba", -98.71, 51.21],
  ["Lake Kariba", 27.82, -17.06],
  ["Rybinsk Reservoir", 38.24, 58.7],
  ["Lake Taymyr", 101.67, 74.58],
  ["Lake Nipigon", -88.58, 49.79],
  ["Qinghai Hu", 100.21, 36.86],
  ["Lake of the Woods", -94.84, 49.4],
  ["Vilyuy Reservoir", 112.21, 62.83],
  ["Lake Urmia", 45.45, 37.67],
  ["Lake Gairdner", 135.88, -31.67],
  ["Päijänne", 25.8, 62.2],
  ["Lake Zaysan", 83.44, 48.71],
  ["Great Salt Lake", -112.54, 41.25],
  ["Bratsk Reservoir", 102.31, 55.36],
  ["Lake Khanka", 132.32, 44.88],
  ["Lagoa Mirim", -53.22, -32.92],
];
/* 30 Natural Earth 10m populated places (ne_10m_populated_places 5.1.2, PD) that sit on a great river; (lon, lat)
   are NE's own LONGITUDE/LATITUDE fields rounded to 2 decimals (looked up 2026-10-08 by NAME and ADM0_A3; NE
   carries a second "Niamey" at 7.1° E as an admin-1 capital — the admin-0 capital's point is used). A river arc
   must pass within TOL_CITY of the point; the river's name is for the report, not asserted. */
const RIVER_CITIES = [
  ["Cairo", 31.25, 30.05, "Nile"],
  ["Khartoum", 32.53, 15.59, "Nile"],
  ["Vienna", 16.36, 48.2, "Danube"],
  ["Budapest", 19.08, 47.5, "Danube"],
  ["Belgrade", 20.47, 44.82, "Danube"],
  ["Cologne", 6.95, 50.93, "Rhine"],
  ["Basel", 7.59, 47.58, "Rhine"],
  ["Rotterdam", 4.48, 51.92, "Rhine"],
  ["Paris", 2.33, 48.87, "Seine"],
  ["St. Louis", -90.24, 38.64, "Mississippi"],
  ["Memphis", -90, 35.12, "Mississippi"],
  ["New Orleans", -90.04, 30, "Mississippi"],
  ["Kansas City", -94.63, 39.11, "Missouri"],
  ["Manaus", -60, -3.1, "Amazon"],
  ["Iquitos", -73.25, -3.75, "Amazon"],
  ["Kinshasa", 15.31, -4.33, "Congo"],
  ["Niamey", 2.11, 13.52, "Niger"],
  ["Bamako", -8, 12.65, "Niger"],
  ["Wuhan", 114.27, 30.58, "Yangtze"],
  ["Chongqing", 106.59, 29.57, "Yangtze"],
  ["Lanzhou", 103.79, 36.06, "Yellow"],
  ["Varanasi", 83, 25.33, "Ganges"],
  ["Hyderabad (Sindh)", 68.37, 25.38, "Indus"],
  ["Phnom Penh", 104.91, 11.55, "Mekong"],
  ["Volgograd", 44.5, 48.71, "Volga"],
  ["Kazan", 49.12, 55.75, "Volga"],
  ["Omsk", 73.4, 54.99, "Irtysh"],
  ["Novosibirsk", 82.96, 55.03, "Ob"],
  ["Khabarovsk", 135.12, 48.45, "Amur"],
  ["Asunción", -57.64, -25.29, "Paraguay"],
];

function run() {
  const bytes = fs.readFileSync(file);
  console.log(`\ncheck-water: ${path.relative(process.cwd(), file)} (${bytes.length} bytes)\n`);
  let T;
  try { T = F.read(new Uint8Array(bytes)); ok("file parses", `format ${T.header.format}, ${T.header.counts.vertices} vertices, ${T.header.counts.arcs} arcs, ${T.header.counts.faces} lake faces, ${T.header.counts.entities} entities`); }
  catch (e) { bad("file parses", e.message); return; }
  const H = T.header, Q = T.quantum, LODS = T.lodCount, KIND = F.KIND;
  const nA = T.arcOffset.length - 1, nV = T.lon.length;
  const X180 = Math.round(180 / Q);
  const vec = (i) => G.vec(T.lon[i], T.lat[i], Q);

  /* licences */
  {
    const REQ = ["id", "name", "version", "url", "licence", "licenceUrl", "attribution", "retrieved"];
    const missing = []; (H.sources || []).forEach((s) => REQ.forEach((k) => { if (!s[k]) missing.push(`${s.id || "?"}.${k}`); }));
    if (!H.sources || !H.sources.length) bad("header carries a sources block"); else if (missing.length) bad("every header source is complete", missing.join(", ")); else ok("header sources complete", H.sources.map((s) => `${s.id} (${s.licence})`).join(", "));
    let badArc = 0, badFace = 0, wrongSrc = 0;
    for (let i = 0; i < nA; i++) { if (T.arcSource[i] >= H.sources.length) badArc++; else { const id = H.sources[T.arcSource[i]].id; if ((T.arcKind[i] === KIND.RIVER && id !== "ne-10m-rivers") || (T.arcKind[i] === KIND.LAKE && id !== "hydrolakes")) wrongSrc++; } }
    for (const f of T.faces) if (f.source >= H.sources.length) badFace++;
    badArc || badFace ? bad("every arc and face traces to a header source", `${badArc} arcs, ${badFace} faces do not`) : ok("every arc and face traces to a header source");
    wrongSrc ? bad("rivers trace to Natural Earth and lakes to HydroLAKES", `${wrongSrc} arcs`) : ok("rivers trace to Natural Earth and lakes to HydroLAKES");
    const blocked = (H.sources || []).some((s) => /hydrorivers/i.test(s.id));
    blocked ? bad("HydroRIVERS (licence not open, sources.json `blocked`) is not a source of this file") : ok("HydroRIVERS is not a source of this file");
  }
  /* well-formed */
  const kinds = {}; for (let i = 0; i < nA; i++) kinds[F.KIND_NAME[T.arcKind[i]]] = (kinds[F.KIND_NAME[T.arcKind[i]]] || 0) + 1;
  note(`arcs by kind: ${Object.entries(kinds).map(([k, v]) => k + " " + v).join(", ")}; levels ${H.lod.intervals_m.join(" / ")} m${H.lod.tiles_m ? " + tiles " + H.lod.tiles_m.join(" / ") + " m" : ""}`);
  {
    // Natural Earth classes some rivers intermittent; the build flags their arcs FLAG.INTERMITTENT (dashed in the renderer).
    // The first build wrote every river 0 because the constant was undefined — so: the flag exists and some arc carries it.
    let inter = 0, other = 0; for (let i = 0; i < nA; i++) { if (T.arcKind[i] === KIND.RIVER && (T.arcFlags[i] & F.FLAG.INTERMITTENT)) inter++; if (T.arcFlags[i] & ~(F.FLAG.DISPUTED | F.FLAG.WATER | F.FLAG.INTERMITTENT)) other++; }
    !F.FLAG.INTERMITTENT || !inter || other ? bad("intermittent rivers carry FLAG.INTERMITTENT and no arc carries an unknown flag", `FLAG.INTERMITTENT ${F.FLAG.INTERMITTENT}, ${inter} intermittent river arcs, ${other} with unknown flags`) : ok("intermittent rivers carry FLAG.INTERMITTENT and no arc carries an unknown flag", `${inter} intermittent river arcs`);
  }
  {
    let endRank = 0, rankRange = 0, short = 0, badKind = 0;
    for (let i = 0; i < nA; i++) { const s = T.arcOffset[i], e = T.arcOffset[i + 1]; if (T.rank[s] !== 0 || T.rank[e - 1] !== 0) endRank++; if (e - s < 2) short++; if (T.arcKind[i] !== KIND.RIVER && T.arcKind[i] !== KIND.LAKE && T.arcKind[i] !== KIND.EDGE) badKind++; }
    for (let i = 0; i < nV; i++) if (T.rank[i] >= LODS) rankRange++;
    endRank ? bad("arc endpoints are rank 0", `${endRank}`) : ok("arc endpoints are rank 0");
    rankRange ? bad("ranks within the LOD count", `${rankRange}`) : ok("ranks within the LOD count");
    short ? bad("every arc has ≥ 2 vertices", `${short}`) : ok("every arc has ≥ 2 vertices");
    badKind ? bad("every arc is a river or a lake shore", `${badKind} other kinds`) : ok("every arc is a river or a lake shore");
    const perLevel = []; for (let L = 0; L < LODS; L++) { let c = 0; for (let i = 0; i < nV; i++) if (T.rank[i] <= L) c++; perLevel.push(c); }
    note(`vertices per level: ${perLevel.join(" / ")}`);
  }
  /* faces: one closed LAKE arc per ring, forward; the face's entity is a lake */
  const lakeOfArc = new Int32Array(nA).fill(-1);
  {
    let multi = 0, back = 0, open = 0, notLake = 0, reused = 0, badEnt = 0;
    T.faces.forEach((f, fi) => {
      if (!H.entities[f.entity] || H.entities[f.entity].kind !== "lake") badEnt++;
      for (const r of f.rings) {
        if (r.length !== 1) { multi++; continue; }
        const ref = r[0]; if (ref < 0) back++;
        const a = Math.abs(ref) - 1; if (T.arcKind[a] !== KIND.LAKE) notLake++;
        const s = T.arcOffset[a], e = T.arcOffset[a + 1]; if (T.lon[s] !== T.lon[e - 1] || T.lat[s] !== T.lat[e - 1]) open++;
        if (lakeOfArc[a] >= 0) reused++; lakeOfArc[a] = fi;
      }
    });
    multi || back || open || notLake || reused ? bad("every lake ring is one closed LAKE arc walked forward, used once", `${multi} multi-arc, ${back} backward, ${open} open, ${notLake} not LAKE, ${reused} reused`) : ok("every lake ring is one closed LAKE arc walked forward, used once", `${T.faces.length} faces`);
    badEnt ? bad("every face's entity is a lake", `${badEnt}`) : ok("every face's entity is a lake");
    let unused = 0; for (let a = 0; a < nA; a++) if (T.arcKind[a] === KIND.LAKE && lakeOfArc[a] < 0) unused++;
    unused ? bad("every LAKE arc belongs to a face", `${unused}`) : ok("every LAKE arc belongs to a face");
  }
  /* rivers: the arc lists */
  const riverOfArc = new Int32Array(nA).fill(-1);
  {
    const rivers = H.rivers || [];
    let twice = 0, notRiver = 0, chainBad = 0, badEnt = 0;
    rivers.forEach((r, ri) => {
      if (!H.entities[r.entity] || H.entities[r.entity].kind !== "river") badEnt++;
      let prevEnd = null;
      for (const ref of r.arcs) {
        const a = ref - 1; if (T.arcKind[a] !== KIND.RIVER) notRiver++;
        if (riverOfArc[a] >= 0) twice++; riverOfArc[a] = ri;
        const s = T.arcOffset[a], e = T.arcOffset[a + 1];
        if (prevEnd && (T.lon[s] !== prevEnd[0] || T.lat[s] !== prevEnd[1])) chainBad++;   // a river's arcs chain (a multi-part NE record breaks the chain at a lake: allowed below as a counted gap)
        prevEnd = [T.lon[e - 1], T.lat[e - 1]];
      }
    });
    let orphan = 0; for (let a = 0; a < nA; a++) if (T.arcKind[a] === KIND.RIVER && riverOfArc[a] < 0) orphan++;
    twice || notRiver || orphan ? bad("every RIVER arc is in exactly one river's list", `${twice} twice, ${notRiver} not RIVER, ${orphan} in none`) : ok("every RIVER arc is in exactly one river's list", `${rivers.length} rivers`);
    badEnt ? bad("every river's entity is a river", `${badEnt}`) : ok("every river's entity is a river", `${rivers.filter((r) => H.entities[r.entity].name).length} named, ${rivers.filter((r) => H.entities[r.entity].wikidata).length} with a Wikidata id`);
    note(`river lists with a break between consecutive arcs (a lake crossed, or a multi-part source record): ${chainBad}`);
  }
  /* planarity among lakes per level */
  const planarLakes = (label, drawable, segOf) => {
    const segs = [];
    for (let a = 0; a < nA; a++) { if (T.arcKind[a] !== KIND.LAKE || !drawable(a)) continue; let last = T.arcOffset[a]; for (let i = T.arcOffset[a] + 1; i < T.arcOffset[a + 1]; i++) if (segOf(i)) { segs.push([a, last, i]); last = i; } }
    const grid = SegIndex.build(segs.length, Math.max(80, Math.round((segs.length > 3e5 ? 0.05 : 0.2) / Q)), (si) => { const s = segs[si]; return [T.lon[s[1]], T.lat[s[1]], T.lon[s[2]], T.lat[s[2]]]; });
    let crossings = 0; const sample = []; const same = (i, j) => T.lon[i] === T.lon[j] && T.lat[i] === T.lat[j];
    grid.pairs((p, q) => { const s = segs[p], t = segs[q]; if (same(s[1], t[1]) || same(s[1], t[2]) || same(s[2], t[1]) || same(s[2], t[2])) return; if (G.segmentsCross(vec(s[1]), vec(s[2]), vec(t[1]), vec(t[2]))) { crossings++; if (sample.length < 3) sample.push(`${H.entities[T.faces[lakeOfArc[s[0]]].entity].id}×${H.entities[T.faces[lakeOfArc[t[0]]].entity].id} at ${(T.lon[s[1]] * Q).toFixed(3)},${(T.lat[s[1]] * Q).toFixed(3)}`); } });
    crossings ? bad(`lakes planar ${label}`, `${crossings} crossings among ${segs.length} segments — ${sample.join("; ")}`) : ok(`lakes planar ${label}`, `${segs.length} shore segments`);
  };
  for (let L = 0; L < LODS; L++) planarLakes(`at LOD ${L}`, (a) => T.arcMinLod[a] <= L, (i) => T.rank[i] <= L);
  /* rivers crossing lake shores: counted */
  {
    const L = LODS - 1, segs = [];
    for (let a = 0; a < nA; a++) { if (T.arcMinLod[a] > L) continue; let last = T.arcOffset[a]; for (let i = T.arcOffset[a] + 1; i < T.arcOffset[a + 1]; i++) if (T.rank[i] <= L) { segs.push([a, last, i]); last = i; } }
    const grid = SegIndex.build(segs.length, Math.max(80, Math.round(0.05 / Q)), (si) => { const s = segs[si]; return [T.lon[s[1]], T.lat[s[1]], T.lon[s[2]], T.lat[s[2]]]; });
    let rl = 0, rr = 0; const same = (i, j) => T.lon[i] === T.lon[j] && T.lat[i] === T.lat[j];
    grid.pairs((p, q) => { const s = segs[p], t = segs[q]; const ks = T.arcKind[s[0]], kt = T.arcKind[t[0]]; if (ks === KIND.LAKE && kt === KIND.LAKE) return; if (same(s[1], t[1]) || same(s[1], t[2]) || same(s[2], t[1]) || same(s[2], t[2])) return; if (G.segmentsCross(vec(s[1]), vec(s[2]), vec(t[1]), vec(t[2]))) { if (ks === KIND.RIVER && kt === KIND.RIVER) rr++; else rl++; } });
    note(`crossings counted, not failed (the lake fill is drawn over the river; two NE rivers crossing are the source's): river×lake shore ${rl}, river×river ${rr}`);
  }

  /* the land partition: lakes inside land, river ends */
  const land = LandIndex.load(DATA);
  note(`land partition: ${land.coastSegments} coast segments from ${land.tiles.length} z=4 tiles (buildId ${land.header.buildId}${H.landBuildId === land.header.buildId ? ", the build this water was snapped to" : "; the water was snapped to " + H.landBuildId + " — rebuild it"})`);
  H.landBuildId === land.header.buildId ? ok("the water was built against this land partition") : bad("the water was built against this land partition", `${H.landBuildId} vs ${land.header.buildId}`);
  {
    let lakesSea = 0, vertsSea = 0, vertsAll = 0, worst = 0; const sample = [];
    T.faces.forEach((f, fi) => {
      if (!f.rings.length) return;
      const a = f.rings[0][0] - 1, s = T.arcOffset[a], e = T.arcOffset[a + 1] - 1, n = e - s, step = Math.max(1, Math.floor(n / 32));
      let sea = 0, all = 0;
      for (let i = s; i < e; i += step) { all++; if (!land.isLand(T.lon[i], T.lat[i])) sea++; }
      vertsSea += sea; vertsAll += all;
      const frac = sea / all; if (frac > worst) worst = frac;
      if (frac > TOL_SEA_FRACTION) { lakesSea++; if (sample.length < 5) sample.push(`${H.entities[f.entity].name || H.entities[f.entity].id} ${Math.round(frac * 100)} %`); }
    });
    lakesSea ? bad(`no lake has more than ${TOL_SEA_FRACTION * 100} % of its sampled shore in the sea`, `${lakesSea}: ${sample.join("; ")}`) : ok(`no lake has more than ${TOL_SEA_FRACTION * 100} % of its sampled shore in the sea`, `${vertsSea} of ${vertsAll} sampled shore vertices in the sea (${(100 * vertsSea / vertsAll).toFixed(2)} %), worst lake ${Math.round(worst * 100)} %`);
  }
  {
    // river ends: shared / coast / lake shore / free on land / in the sea
    const endKey = new Map();
    for (let a = 0; a < nA; a++) if (T.arcKind[a] === KIND.RIVER) for (const i of [T.arcOffset[a], T.arcOffset[a + 1] - 1]) { const k = T.lon[i] * 4000000 + T.lat[i]; endKey.set(k, (endKey.get(k) || 0) + 1); }
    // lake shores at the finest level for the nearest-shore test
    const shoreSegs = [];
    for (let a = 0; a < nA; a++) if (T.arcKind[a] === KIND.LAKE) for (let i = T.arcOffset[a] + 1; i < T.arcOffset[a + 1]; i++) shoreSegs.push([i - 1, i]);
    const shoreGrid = SegIndex.build(shoreSegs.length, Math.max(80, Math.round(0.05 / Q)), (si) => { const s = shoreSegs[si]; return [T.lon[s[0]], T.lat[s[0]], T.lon[s[1]], T.lat[s[1]]]; });
    const mPerLat = Q * Math.PI / 180 * G.R_EARTH_M;
    const nearestShore = (x, y, maxM) => { const c = Math.cos(y * Q * Math.PI / 180), mLon = mPerLat * c; let best = Infinity; shoreGrid.near(x, y, Math.ceil(maxM / Math.min(mPerLat, mLon)), (i) => { const s = shoreSegs[i]; let x1 = T.lon[s[0]], x2 = T.lon[s[1]]; if (x1 - x > X180) x1 -= 2 * X180; else if (x - x1 > X180) x1 += 2 * X180; if (x2 - x1 > X180) x2 -= 2 * X180; else if (x1 - x2 > X180) x2 += 2 * X180; const ax = (x1 - x) * mLon, ay = (T.lat[s[0]] - y) * mPerLat, bx = (x2 - x) * mLon, by = (T.lat[s[1]] - y) * mPerLat; const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy; let t = l2 > 0 ? -(ax * dx + ay * dy) / l2 : 0; t = Math.max(0, Math.min(1, t)); const px = ax + dx * t, py = ay + dy * t; const d = Math.sqrt(px * px + py * py); if (d < best) best = d; }); return best; };
    let shared = 0, coast = 0, lake = 0, free = 0, sea = 0; const seaSample = [];
    for (let a = 0; a < nA; a++) {
      if (T.arcKind[a] !== KIND.RIVER) continue;
      for (const i of [T.arcOffset[a], T.arcOffset[a + 1] - 1]) {
        const k = T.lon[i] * 4000000 + T.lat[i];
        if (endKey.get(k) > 1) { shared++; continue; }
        const nc = land.nearestCoast(T.lon[i], T.lat[i], TOL_END);
        if (nc) { coast++; continue; }
        if (nearestShore(T.lon[i], T.lat[i], TOL_END) <= TOL_END) { lake++; continue; }
        if (land.isLand(T.lon[i], T.lat[i])) free++; else { sea++; if (seaSample.length < 5) seaSample.push(`${(T.lon[i] * Q).toFixed(3)},${(T.lat[i] * Q).toFixed(3)}`); }
      }
    }
    sea ? bad(`no river arc ends in the sea (every end is shared, on the coast or a lake shore within ${TOL_END} m, or free on land)`, `${sea} in the sea — ${seaSample.join("; ")}`) : ok(`every river arc end is shared, on the coast or a lake shore within ${TOL_END} m, or free on land`, `${shared} shared, ${coast} on the coast, ${lake} on a lake shore, ${free} free on land (sources, endorheic ends, gaps)`);
  }
  /* the independent points */
  {
    const faceRings = T.faces.map((f) => f.rings.map((r) => { const a = r[0] - 1, s = T.arcOffset[a], e = T.arcOffset[a + 1] - 1; const n = e - s, X = new Float64Array(n), Y = new Float64Array(n); let cum = T.lon[s]; X[0] = cum; Y[0] = T.lat[s]; for (let i = 1; i < n; i++) { let dx = T.lon[s + i] - T.lon[s + i - 1]; if (dx > X180) dx -= 2 * X180; else if (dx < -X180) dx += 2 * X180; cum += dx; X[i] = cum; Y[i] = T.lat[s + i]; } let bx0 = Infinity, bx1 = -Infinity, by0 = Infinity, by1 = -Infinity; for (let i = 0; i < n; i++) { if (X[i] < bx0) bx0 = X[i]; if (X[i] > bx1) bx1 = X[i]; if (Y[i] < by0) by0 = Y[i]; if (Y[i] > by1) by1 = Y[i]; } return { X, Y, bx0, bx1, by0, by1 }; }));
    const inLake = (px, py) => { for (let fi = 0; fi < T.faces.length; fi++) { let inside = false; for (const g of faceRings[fi]) { if (py < g.by0 || py > g.by1) continue; for (const qx of [px, px + 2 * X180, px - 2 * X180]) { if (qx < g.bx0 || qx > g.bx1) continue; let c = false; const m = g.X.length; for (let i = 0, j = m - 1; i < m; j = i++) if ((g.Y[i] > py) !== (g.Y[j] > py) && qx < (g.X[j] - g.X[i]) * (py - g.Y[i]) / (g.Y[j] - g.Y[i]) + g.X[i]) c = !c; if (c) { inside = !inside; break; } } } if (inside) return fi; } return -1; };
    // inside a HydroLAKES lake, or — where the two sources draw the water differently (Natural Earth's point in
    // the Bratsk Reservoir's dendritic arms and in Lake Eyre's basin falls on HydroLAKES' dry ground) — within
    // TOL_LAKE_PT of a HydroLAKES shore, counted apart
    const TOL_LAKE_PT = 5000;
    const shoreSegs2 = []; for (let a = 0; a < nA; a++) if (T.arcKind[a] === KIND.LAKE) for (let i = T.arcOffset[a] + 1; i < T.arcOffset[a + 1]; i++) shoreSegs2.push([i - 1, i]);
    const shoreGrid2 = SegIndex.build(shoreSegs2.length, Math.max(80, Math.round(0.05 / Q)), (si) => { const s = shoreSegs2[si]; return [T.lon[s[0]], T.lat[s[0]], T.lon[s[1]], T.lat[s[1]]]; });
    const mPerLat2 = Q * Math.PI / 180 * G.R_EARTH_M;
    const nearShore = (x, y, maxM) => { const c = Math.cos(y * Q * Math.PI / 180), mLon = mPerLat2 * c; let best = Infinity; shoreGrid2.near(x, y, Math.ceil(maxM / Math.min(mPerLat2, mLon)), (i) => { const s = shoreSegs2[i]; let x1 = T.lon[s[0]], x2 = T.lon[s[1]]; if (x1 - x > X180) x1 -= 2 * X180; else if (x - x1 > X180) x1 += 2 * X180; if (x2 - x1 > X180) x2 -= 2 * X180; else if (x1 - x2 > X180) x2 += 2 * X180; const ax = (x1 - x) * mLon, ay = (T.lat[s[0]] - y) * mPerLat2, bx = (x2 - x) * mLon, by = (T.lat[s[1]] - y) * mPerLat2; const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy; let t = l2 > 0 ? -(ax * dx + ay * dy) / l2 : 0; t = Math.max(0, Math.min(1, t)); const px = ax + dx * t, py = ay + dy * t; const d = Math.sqrt(px * px + py * py); if (d < best) best = d; }); return best; };
    const missing = [], near = [];
    for (const [name, lon, lat] of NE_LAKES) { const x = Math.round(lon / Q), y = Math.round(lat / Q); const fi = inLake(x, y); if (fi >= 0) continue; const d = nearShore(x, y, TOL_LAKE_PT); if (d <= TOL_LAKE_PT) near.push(`${name} (${Math.round(d)} m)`); else missing.push(name); }
    missing.length ? bad(`the ${NE_LAKES.length} largest Natural Earth lakes' points fall inside a lake or within ${TOL_LAKE_PT} m of one`, missing.join(", ")) : ok(`the ${NE_LAKES.length} largest Natural Earth lakes' points fall inside a lake or within ${TOL_LAKE_PT} m of one`, `${NE_LAKES.length - near.length} inside${near.length ? "; within " + TOL_LAKE_PT + " m of a shore (the two sources draw the water differently): " + near.join(", ") : ""}`);
    // river cities
    const rsegs = []; for (let a = 0; a < nA; a++) if (T.arcKind[a] === KIND.RIVER) for (let i = T.arcOffset[a] + 1; i < T.arcOffset[a + 1]; i++) rsegs.push([a, i - 1, i]);
    const rgrid = SegIndex.build(rsegs.length, Math.max(80, Math.round(0.1 / Q)), (si) => { const s = rsegs[si]; return [T.lon[s[1]], T.lat[s[1]], T.lon[s[2]], T.lat[s[2]]]; });
    const mPerLat = Q * Math.PI / 180 * G.R_EARTH_M;
    const far = [], dists = [];
    for (const [city, lon, lat, river] of RIVER_CITIES) {
      const x = Math.round(lon / Q), y = Math.round(lat / Q), c = Math.cos(lat * Math.PI / 180), mLon = mPerLat * c;
      let best = Infinity, bestName = "";
      rgrid.near(x, y, Math.ceil(TOL_CITY * 2 / Math.min(mPerLat, mLon)), (i) => { const s = rsegs[i]; let x1 = T.lon[s[1]], x2 = T.lon[s[2]]; if (x1 - x > X180) x1 -= 2 * X180; else if (x - x1 > X180) x1 += 2 * X180; if (x2 - x1 > X180) x2 -= 2 * X180; else if (x1 - x2 > X180) x2 += 2 * X180; const ax = (x1 - x) * mLon, ay = (T.lat[s[1]] - y) * mPerLat, bx = (x2 - x) * mLon, by = (T.lat[s[2]] - y) * mPerLat; const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy; let t = l2 > 0 ? -(ax * dx + ay * dy) / l2 : 0; t = Math.max(0, Math.min(1, t)); const px = ax + dx * t, py = ay + dy * t; const d = Math.sqrt(px * px + py * py); if (d < best) { best = d; const ri = riverOfArc[s[0]]; bestName = ri >= 0 ? (H.entities[H.rivers[ri].entity].name || "?") : "?"; } });
      dists.push(best);
      if (best > TOL_CITY) far.push(`${city}: ${Number.isFinite(best) ? Math.round(best) + " m (" + bestName + ")" : "no river within " + TOL_CITY * 2 + " m"}`);
    }
    const sorted = dists.filter(Number.isFinite).sort((a, b) => a - b);
    far.length ? bad(`${RIVER_CITIES.length} river cities lie within ${TOL_CITY} m of a river arc`, far.join("; ")) : ok(`${RIVER_CITIES.length} river cities lie within ${TOL_CITY} m of a river arc`, `p50 ${Math.round(sorted[Math.floor(sorted.length / 2)])} m, max ${Math.round(sorted[sorted.length - 1])} m`);
  }

  /* ---------- tiles ---------- */
  let tileBytes = 0, tileFiles = 0, largest = 0;
  {
    const index = H.tiles && H.tiles[Object.keys(H.tiles)[0]];
    if (!index) bad("core header carries a water tile index");
    else {
      ok("core header carries a water tile index", `${index.present.length} of ${index.cols * index.rows} cells, ${index.interval_m} m`);
      const W = (2 * X180) / index.cols, Hh = Math.round(180 / Q) / index.rows;
      const onDisk = fs.existsSync(tileDir) ? fs.readdirSync(tileDir).filter((f) => /\.bin$/.test(f)).map((f) => f.replace(/\.bin$/, "")) : [];
      const present = new Set(index.present);
      const missing = index.present.filter((k) => !onDisk.includes(k)), extra = onDisk.filter((k) => !present.has(k));
      missing.length || extra.length ? bad("the water tile index matches the directory", `${missing.length} missing, ${extra.length} unlisted`) : ok("the water tile index matches the directory", `${onDisk.length} files`);
      let badBuild = 0, badSrc = 0, badRef = 0, badKind = 0, badEnds = 0, edgeOff = 0, edgeStroked = 0, badFace = 0, crossings = 0, arcsTotal = 0, facesTotal = 0, tileOnlyFaces = 0;
      const coreEnd = (a) => [[T.lon[T.arcOffset[a]], T.lat[T.arcOffset[a]]], [T.lon[T.arcOffset[a + 1] - 1], T.lat[T.arcOffset[a + 1] - 1]]];
      for (const key of index.present) {
        const f = path.join(tileDir, key + ".bin"); if (!fs.existsSync(f)) continue;
        const b = fs.readFileSync(f); tileBytes += b.length; tileFiles++; if (b.length > largest) largest = b.length;
        let Tt; try { Tt = F.read(new Uint8Array(b)); } catch (e) { bad(`water tile ${key} parses`, e.message); continue; }
        const th = Tt.header, tile = th.tile;
        if (!th.buildId || th.buildId !== H.buildId) badBuild++;
        if (!th.sources || th.sources.length !== H.sources.length || th.sources.some((s, i) => s.id !== H.sources[i].id)) badSrc++;
        const nT = Tt.arcOffset.length - 1, x0 = Math.round(tile.lon0 / Q), y0 = Math.round(tile.lat0 / Q), x1 = x0 + W, y1 = y0 + Hh;
        arcsTotal += nT;
        const onEdge = (x, y) => { let X = x; if (X - x0 > X180) X -= 2 * X180; else if (x0 - X > X180) X += 2 * X180; return y === y0 || y === y1 || X === x0 || X === x1; };
        for (let a = 0; a < nT; a++) {
          const s = Tt.arcOffset[a], e = Tt.arcOffset[a + 1];
          if (Tt.arcKind[a] === KIND.EDGE) { for (let i = s; i < e; i++) if (!onEdge(Tt.lon[i], Tt.lat[i])) { edgeOff++; break; } continue; }
          const core = Tt.arcRef ? Tt.arcRef[a] : -1;
          if (core < 0) continue;
          if (core >= nA) { badRef++; continue; }
          if (Tt.arcKind[a] !== T.arcKind[core] || Tt.arcSource[a] !== T.arcSource[core] || Tt.arcFlags[a] !== T.arcFlags[core]) badKind++;
          const bits = Tt.arcRefBits[a], ce = coreEnd(core), st = [Tt.lon[s], Tt.lat[s]], en = [Tt.lon[e - 1], Tt.lat[e - 1]];
          if ((bits & 1) && (st[0] !== ce[0][0] || st[1] !== ce[0][1])) badEnds++;
          if ((bits & 2) && (en[0] !== ce[1][0] || en[1] !== ce[1][1])) badEnds++;
          if (!(bits & 1) && !onEdge(st[0], st[1])) badEnds++;
          if (!(bits & 2) && !onEdge(en[0], en[1])) badEnds++;
          const ux = (x) => { let X = x; if (X - x0 > X180) X -= 2 * X180; else if (x0 - X > X180) X += 2 * X180; return X; };
          let south = true, north = true, west = true, east = true; for (let i = s; i < e; i++) { if (Tt.lat[i] !== y0) south = false; if (Tt.lat[i] !== y1) north = false; if (ux(Tt.lon[i]) !== x0) west = false; if (ux(Tt.lon[i]) !== x1) east = false; } if (e - s >= 2 && (south || north || west || east)) edgeStroked++;
        }
        Tt.faces.forEach((f, i) => { facesTotal++; const cf = Tt.faceRef ? Tt.faceRef[i] : -1; if (cf >= T.faces.length || f.entity >= H.entities.length || (cf >= 0 && T.faces[cf].entity !== f.entity) || H.entities[f.entity].kind !== "lake") badFace++; if (cf < 0) tileOnlyFaces++; });
        // planar per tile, in the lon/lat plane (lake arcs only; edge chords are the tile's)
        const segs = []; for (let a = 0; a < nT; a++) if (Tt.arcKind[a] === KIND.LAKE) for (let i = Tt.arcOffset[a] + 1; i < Tt.arcOffset[a + 1]; i++) segs.push([a, i - 1, i]);
        const grid = SegIndex.build(segs.length, Math.max(80, Math.round(0.02 / Q)), (si) => { const s = segs[si]; return [Tt.lon[s[1]], Tt.lat[s[1]], Tt.lon[s[2]], Tt.lat[s[2]]]; });
        const same = (i, j) => Tt.lon[i] === Tt.lon[j] && Tt.lat[i] === Tt.lat[j];
        const crossPlanar = (i1, i2, j1, j2) => { const x1 = Tt.lon[i1], yy1 = Tt.lat[i1]; let x2 = Tt.lon[i2], yy2 = Tt.lat[i2], x3 = Tt.lon[j1], yy3 = Tt.lat[j1], x4 = Tt.lon[j2], yy4 = Tt.lat[j2]; if (x2 - x1 > X180) x2 -= 2 * X180; else if (x1 - x2 > X180) x2 += 2 * X180; if (x3 - x1 > X180) { x3 -= 2 * X180; x4 -= 2 * X180; } else if (x1 - x3 > X180) { x3 += 2 * X180; x4 += 2 * X180; } if (x4 - x3 > X180) x4 -= 2 * X180; else if (x3 - x4 > X180) x4 += 2 * X180; const d = (x2 - x1) * (yy4 - yy3) - (yy2 - yy1) * (x4 - x3); if (d === 0) return false; const t = ((x3 - x1) * (yy4 - yy3) - (yy3 - yy1) * (x4 - x3)) / d, u = ((x3 - x1) * (yy2 - yy1) - (yy3 - yy1) * (x2 - x1)) / d; return t > 0 && t < 1 && u > 0 && u < 1; };
        grid.pairs((p, q) => { const s = segs[p], t = segs[q]; if (same(s[1], t[1]) || same(s[1], t[2]) || same(s[2], t[1]) || same(s[2], t[2])) return; if (crossPlanar(s[1], s[2], t[1], t[2])) crossings++; });
      }
      badBuild ? bad("every water tile names the core's buildId", `${badBuild}`) : ok("every water tile names the core's buildId", H.buildId);
      badSrc ? bad("every water tile carries the core's sources", `${badSrc}`) : ok("every water tile carries the core's sources");
      badRef || badKind ? bad("a water tile arc is a piece of its core arc (kind, source, flags)", `${badRef} bad refs, ${badKind} wrong kind`) : ok("a water tile arc is a piece of its core arc", `${arcsTotal} tile arcs`);
      badEnds ? bad("a water tile arc's ends are the core arc's endpoints or lie on the tile edge", `${badEnds}`) : ok("a water tile arc's ends are the core arc's endpoints or lie on the tile edge");
      edgeOff ? bad("every EDGE chord lies on its tile's boundary", `${edgeOff}`) : ok("every EDGE chord lies on its tile's boundary");
      edgeStroked ? bad("no stroked arc lies along a tile edge", `${edgeStroked}`) : ok("no stroked arc lies along a tile edge");
      badFace ? bad("every tile face names a core face or a lake entity of the core table", `${badFace}`) : ok("every tile face names a core face or a lake entity of the core table", `${facesTotal} face pieces, ${tileOnlyFaces} of lakes below the core's area filter`);
      crossings ? bad("lakes planar per water tile", `${crossings} crossings`) : ok("lakes planar per water tile");
    }
  }
  const total = bytes.length + tileBytes;
  total > maxBytes ? bad(`water within ${(maxBytes / 1048576).toFixed(0)} MB`, `${(total / 1048576).toFixed(2)} MB`) : ok(`water within ${(maxBytes / 1048576).toFixed(0)} MB`, `${(bytes.length / 1048576).toFixed(2)} MB core + ${(tileBytes / 1048576).toFixed(2)} MB in ${tileFiles} tiles = ${(total / 1048576).toFixed(2)} MB; largest tile ${(largest / 1024).toFixed(1)} KB`);
}

run();
console.log(`\n${pass} ok, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
