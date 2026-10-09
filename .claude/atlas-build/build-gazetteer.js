#!/usr/bin/env node
/* build-gazetteer.js — step 6 of the Atlas v2 build: the places registry (docs/atlas-v2-design.md §2.6,
   §2.8; §7 "Phase 1c — as built").

     node build-gazetteer.js [--install] [--no-wiki] [--refetch] [--tier N] [--dry]

   WHAT IT WRITES: out/gazetteer.js (and with --install, atlas/data/gazetteer.js) — one table of every
   place the Atlas names in Phase 1c, plus out/gazetteer-report.json with the size per kind, the country
   → v1 prose key mapping and every country with no prose entry. The file is a plain script that assigns
   `window.ATLAS_GAZETTEER` (loadable by a <script> on file:// as well as by fetch), whose first line is
   the machine-readable `sources` header §2.10a asks of every generated file. Rows are arrays under a
   `cols` header with trailing zeros trimmed, because 0.6 MB was the owner's budget and an object per
   row cost a third again (measured; the report prints both).

   SOURCES (all PD unless stated) and the kind each feature class becomes — the table §2.6 carries:
     topology.bin faces          country (adm0:<a3>), admin1 (adm1:…)   [Natural Earth admin-0/1 conflated onto OSM land]
     NE 10m populated places     capital (ADM0CAP), city (POP_MAX ≥ 1,000,000, or ≥ --tier), town (the
                                 admin-1 capitals and the rest of the tier); scientific and meteorological
                                 stations are left out
     NE 10m marine polygons      ocean, sea; gulf ← gulf, bay, sound, inlet, fjord, lagoon; strait ← strait,
                                 channel. Left out: reef (2), river estuaries (3), the 11 unnamed "generic"
     NE 10m regions polygons     island, island-group; range ← Range/mtn; region ← Continent, Desert,
                                 Plateau, Plain, Basin, Lowland, Depression, Valley, Wetlands, Delta, Gorge,
                                 Tundra, Foothills, Geoarea, Peninsula, Pen/cape, Isthmus, Coast.
                                 Left out: Lake (3, the water file has them), Dragons-be-here (Null Island)
     NE 10m regions points       island, island-group (islands too small for a polygon). Left out: cape,
                                 waterfall, plain, pole — no kind of §2.6 is a cape, and a pole is not a place
     water.bin                   lake (every NAMED lake entity; HydroLAKES, CC BY 4.0 — its names as given,
                                 "Superior" not "Lake Superior"), river (every named river; NE 10m rivers)
   Names are the source's English name as given (NAME_EN where the table has one, else NAME); nothing is
   re-spelt or title-cased here, since canvas text is outside the site's spelling pass. The source's other
   name fields (NAME, NAMEALT, NAME_LONG, ABBREV…) become `aliases` for the search box.

   LABEL GEOMETRY (lib/label.js): an area kind gets `at` (the pole of inaccessibility) and `path` (2–5
   points along the principal axis), computed in an azimuthal projection about the shape's own centroid —
   so the United States is labelled over the United States, not over Europe (v1's antimeridian fault).
   A point kind gets `at`. A river gets `at` (its midpoint) and a geometry reference; the worker lays its
   repeated label along the polyline it already holds from water.bin.

   WIKIPEDIA TITLES come from Wikidata's enwiki sitelinks (CC0), fetched at build time in batches of 50
   through the SPARQL endpoint (the wbgetentities API answers 429 from this sandbox's shared address;
   query.wikidata.org answers) and cached in wiki-sitelinks.json beside this script, which is committed
   so a rebuild is reproducible offline. An entry whose item has no enwiki sitelink has no link; no title
   is ever written from memory.

   `within`: a city's country from its ADM0_A3 (and its admin-1 unit where the country has them and the
   name matches); a country's sovereign where it is a dependency; an area or river's country where its
   anchor AND both ends of its path fall in the same admin-0 face of the z=4 land tiles (lib/landindex.js),
   else none — a desert that spans five countries is in none of them.

   RANK is the layout's priority (lower first): Natural Earth's own SCALERANK/LABELRANK where the source
   has one, else area bins; `z` carries the source's label zoom hints (MIN_ZOOM, MIN_LABEL/MAX_LABEL) for
   the renderer's density rule. */
"use strict";
const fs = require("fs"), path = require("path");
const { spawnSync } = require("child_process");
const F = require("./lib/format.js");
const { readShp, readDbf } = require("./lib/shp.js");
const { ensureSource, headerSources } = require("./fetch-sources.js");
const LandIndex = require("./lib/landindex.js");
const L = require("./lib/label.js");

const HERE = __dirname, ROOT = path.join(HERE, "..", "..");
const DATA = path.join(ROOT, "atlas", "data");
const OUT = path.join(HERE, "out");
const WIKI_CACHE = path.join(HERE, "wiki-sitelinks.json");
const argv = process.argv.slice(2);
const flag = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const install = argv.includes("--install"), noWiki = argv.includes("--no-wiki"), refetch = argv.includes("--refetch"), dry = argv.includes("--dry");
const TIER = Number(flag("--tier", 250000));
const TOWN_MIN = Number(flag("--town-min", 50000));
const RIVER_MAX_RANK = Number(flag("--river-rank", 8));    // Natural Earth scale ranks above this (the smallest streams) carry no label row   // an admin-1 capital smaller than this is left out (measured: the budget, below)
const BUDGET = 0.6 * 1024 * 1024;
const generated = new Date().toISOString();
const generator = "folio atlas-build: build-gazetteer.js (" + require("./package.json").version + ")";
const log = (...a) => console.log(...a);
const t0 = Date.now();

/* ---------- the land: countries and admin-1 units from the core ---------- */
const core = F.readFile(path.join(DATA, "topology.bin"));
const H = core.header, Q = core.quantum;
const deg = (i) => [core.lon[i] * Q, core.lat[i] * Q];
function faceRings(T, face, level, force) {   // force: every vertex of every arc, whatever its rank or the arc's minLod
  const out = [];
  for (const refs of face.rings) {
    const ring = []; let skip = false;
    for (let r = 0; r < refs.length; r++) {
      const ref = refs[r], a = Math.abs(ref) - 1;
      if (!force && T.arcMinLod[a] > level) { skip = true; break; }
      const s = T.arcOffset[a], e = T.arcOffset[a + 1];
      if (ref > 0) { for (let i = s; i < e; i++) if (force || T.rank[i] <= level) { if (ring.length && i === s) continue; ring.push(i); } }
      else { for (let i = e - 1; i >= s; i--) if (force || T.rank[i] <= level) { if (ring.length && i === e - 1) continue; ring.push(i); } }
    }
    if (skip) continue;
    if (ring.length >= 3) out.push(ring.map((i) => [T.lon[i] * T.quantum, T.lat[i] * T.quantum]));
  }
  return out;
}
const entityFaces = new Map();   // entity index → [face index…]
H.entities.forEach((e, i) => entityFaces.set(i, []));
core.faces.forEach((f, i) => entityFaces.get(f.entity).push(i));

log("land index (z=4 tiles) for `within`…");
const land = LandIndex.load(DATA);
// which country is at (lon, lat): the admin-0 face of the tile that contains it (even-odd per face)
function countryAt(lon, lat) {
  const x = Math.round(lon / Q), y = Math.round(lat / Q);
  const t = land.tileOf(x, y); if (!t) return null;
  const byFace = new Map();
  for (const f of t.faces) {
    if (y < f.by0 || y > f.by1) continue;
    const X = f.X, Y = f.Y, m = X.length;
    let hit = false;
    for (const qx of [x, x + 2 * land.X180, x - 2 * land.X180]) {
      if (qx < f.bx0 || qx > f.bx1) continue;
      let c = false;
      for (let i = 0, j = m - 1; i < m; j = i++) if ((Y[i] > y) !== (Y[j] > y) && qx < (X[j] - X[i]) * (y - Y[i]) / (Y[j] - Y[i]) + X[i]) c = !c;
      if (c) { hit = true; break; }
    }
    if (hit) byFace.set(f.face, !byFace.get(f.face));
  }
  for (const [fi, inside] of byFace) if (inside) { const ent = t.T.faces[fi].entity; const e = H.entities[ent]; return e ? e.id : null; }
  return null;
}
const sameCountry = (pts) => { let w = null; for (const [lon, lat] of pts) { const c = countryAt(lon, lat); if (!c) return null; if (w && w !== c) return null; w = c; } return w; };

/* ---------- sources ---------- */
const S = {};
for (const id of ["ne-10m-admin0", "ne-10m-populated-places", "ne-10m-marine-polys", "ne-10m-regions-polys", "ne-10m-regions-points"]) S[id] = ensureSource(id);
const shpOf = (id, name) => path.join(S[id].dir, name);
const dbfRows = (id, name) => readDbf(shpOf(id, name).replace(/\.shp$/, ".dbf"), "utf8").rows;
const r3 = (v) => Math.round(v * 1000) / 1000, r2 = (v) => Math.round(v * 100) / 100;
const clean = (s) => String(s == null ? "" : s).replace(/\s+/g, " ").trim();

const rows = [];          // the table
const report = { generated, perKind: {}, tiers: {}, v1: { matched: 0, missing: [] }, within: { set: 0, none: 0 }, wiki: { asked: 0, found: 0, missing: 0 }, left: {} };
const left = (k) => { report.left[k] = (report.left[k] || 0) + 1; };
function row(o) { rows.push(o); }

/* ---------- 1. countries and admin-1 ---------- */
log("countries and admin-1 units…");
const adm0 = dbfRows("ne-10m-admin0", "ne_10m_admin_0_countries.shp");
const adm0ByA3 = new Map(adm0.map((r) => [r.ADM0_A3, r]));
global.window = {};
require(path.join(ROOT, "countries.js")); require(path.join(ROOT, "country-stats.js")); require(path.join(ROOT, "country-spans.js")); require(path.join(ROOT, "country-sources.js"));
const v1Keys = new Set(Object.keys(global.window.COUNTRY_INFO || {}));
const areaRank = (km2, bins) => { for (let i = 0; i < bins.length; i++) if (km2 >= bins[i]) return i; return bins.length; };
H.entities.forEach((e, ei) => {
  const faces = entityFaces.get(ei);
  if (!faces.length) { left("face-less entity " + e.id); return; }
  // rings at LOD 1 (2.5 km); a territory too small to survive there (Monaco, Gibraltar, the Spratlys) at LOD 2
  let parts = [];
  for (const fi of faces) for (const ring of faceRings(core, core.faces[fi], 1)) parts.push(ring);
  if (!parts.length) { for (const fi of faces) for (const ring of faceRings(core, core.faces[fi], 2)) parts.push(ring); left("rings only at LOD 2"); }
  // …and one that exists only in the tiles (the Vatican, Ashmore and Cartier, Bajo Nuevo, Serranilla, the Coral Sea Islands): every vertex its arcs carry
  if (!parts.length) { for (const fi of faces) for (const ring of faceRings(core, core.faces[fi], 2, true)) parts.push(ring); left("rings forced from every vertex"); }
  let g = L.labelGeometry(parts);
  if (!g) {
    // a face whose rings quantise to under three vertices (a reef, a rock): the mean of its arcs' vertices as a point anchor
    let sx = 0, sy = 0, sz = 0, n = 0;
    for (const fi of faces) for (const refs of core.faces[fi].rings) for (const ref of refs) { const a = Math.abs(ref) - 1; for (let i = core.arcOffset[a]; i < core.arcOffset[a + 1]; i++) { const v = L.unit(core.lon[i] * Q, core.lat[i] * Q); sx += v[0]; sy += v[1]; sz += v[2]; n++; } }
    if (!n) { left("no geometry " + e.id); return; }
    const at = L.lonlat([sx / n, sy / n, sz / n]);
    g = { at, path: [at, at], lenKm: 0, areaKm2: 0 }; left("point anchor from the arcs' mean");
  }
  if (e.kind === "polity") {
    const ne = adm0ByA3.get(e.a3) || {};
    const cands = [e.name, ne.NAME, ne.NAME_LONG, ne.FORMAL_EN, ne.NAME_EN, ne.ABBREV, ne.NAME_SORT, ne.BRK_NAME, ne.NAME_CIAWF].filter(Boolean).map((s) => clean(s).toLowerCase());
    const v1 = cands.find((k) => v1Keys.has(k)) || 0;
    if (v1) report.v1.matched++; else report.v1.missing.push(e.name);
    const aliases = [...new Set([ne.NAME_LONG, ne.FORMAL_EN, ne.ABBREV, ne.NAME_ALT].map(clean).filter((s) => s && s !== e.name))].slice(0, 3);
    row({ id: e.id, name: e.name, kind: "country", rank: areaRank(g.areaKm2, [2e6, 5e5, 1e5, 2e4, 2e3]), qid: e.qid || 0, within: e.sovereign && e.sovereign !== e.a3 ? "adm0:" + e.sovereign.toLowerCase() : 0, geom: "f" + faces[0], at: g.at.map(r3), path: g.path.map((p) => p.map(r2)), len: Math.round(g.lenKm), z: ne.MIN_LABEL != null ? [ne.MIN_LABEL, ne.MAX_LABEL] : 0, aliases, wiki: 0, v1, area: Math.round(g.areaKm2) });
  } else if (e.kind === "admin1") {
    row({ id: e.id, name: e.name, kind: "admin1", rank: areaRank(g.areaKm2, [5e5, 1e5, 2e4]) + 3, qid: e.qid || 0, within: e.parent || 0, geom: "f" + faces[0], at: g.at.map(r3), path: g.path.map((p) => p.map(r2)), len: Math.round(g.lenKm), z: 0, aliases: [], wiki: 0, area: Math.round(g.areaKm2) });
  }
});
const adm1ByCountry = new Map();   // adm0 id → [{ name, id }]
for (const r of rows) if (r.kind === "admin1") { if (!adm1ByCountry.has(r.within)) adm1ByCountry.set(r.within, []); adm1ByCountry.get(r.within).push(r); }
const countryIds = new Set(rows.filter((r) => r.kind === "country").map((r) => r.id));

/* ---------- 2. populated places ---------- */
log("populated places…");
const pp = dbfRows("ne-10m-populated-places", "ne_10m_populated_places.shp");
const tierCost = { "capitals + 1M + admin-1 capitals": 0 };
for (const r of pp) {
  if (/station/i.test(r.FEATURECLA)) { left("station"); continue; }
  const capital = r.ADM0CAP === 1 || r.FEATURECLA === "Admin-0 capital";
  const adm1cap = /^Admin-1/.test(r.FEATURECLA) || r.FEATURECLA === "Admin-0 region capital";
  const pop = r.POP_MAX || 0;
  const inBase = capital || pop >= 1e6 || (adm1cap && pop >= TOWN_MIN);
  if (adm1cap && !capital && pop < TOWN_MIN && pop < TIER) { left("admin-1 capital under " + TOWN_MIN); continue; }
  if (!inBase && pop < TIER) { left("below tier"); continue; }
  const kind = capital ? "capital" : (pop >= 1e6 || pop >= TIER) ? "city" : "town";
  const a3 = (r.ADM0_A3 || "").toLowerCase();
  let within = countryIds.has("adm0:" + a3) ? "adm0:" + a3 : (countryAt(r.LONGITUDE, r.LATITUDE) || 0);
  if (within && adm1ByCountry.has(within) && r.ADM1NAME) { const u = adm1ByCountry.get(within).find((x) => x.name.toLowerCase() === clean(r.ADM1NAME).toLowerCase()); if (u) within = u.id; }
  const aliases = [...new Set([r.NAME_EN, r.NAMEALT, r.NAMEPAR].map(clean).filter((s) => s && s !== r.NAME))].slice(0, 2);
  row({ id: "city:" + r.NE_ID, name: clean(r.NAME), kind, rank: r.SCALERANK == null ? 7 : r.SCALERANK, qid: /^Q\d+$/.test(r.WIKIDATAID) ? r.WIKIDATAID : 0, within, geom: 0, at: [r3(r.LONGITUDE), r3(r.LATITUDE)], path: 0, len: 0, z: r.MIN_ZOOM || 0, aliases, wiki: 0, pop, tier: inBase ? 0 : 1 });
}

/* ---------- 3. marine polygons and regions ---------- */
/* a source's records → rows. A feature Natural Earth split over several records with ONE ne_id (the Great
   Barrier Reef, a two-part island) is one place: its parts are gathered under the id before the geometry
   is computed, so it gets one anchor in its widest part rather than two rows that collide. */
function shapes(id, shp, rowsOf, map) {
  const dbf = dbfRows(id, shp); let i = 0, n = 0;
  const byId = new Map();
  for (const rec of readShp(shpOf(id, shp))) {
    const r = dbf[i++]; const m = map(r); if (!m) continue;
    const parts = rec.parts.map((xy) => { const ring = []; for (let k = 0; k < xy.length; k += 2) ring.push([xy[k], xy[k + 1]]); return ring; });
    const have = byId.get(m.id);
    if (have) { have.parts.push(...parts); if (have.m.name !== m.name) left("id shared by two names " + id); continue; }
    byId.set(m.id, { m, parts });
  }
  for (const { m, parts } of byId.values()) {
    const g = L.labelGeometry(parts);
    if (!g) { left("no geometry " + id); continue; }
    m.at = g.at.map(r3); m.path = g.path.map((p) => p.map(r2)); m.len = Math.round(g.lenKm); m.area = Math.round(g.areaKm2);
    if (m.kind !== "ocean" && m.kind !== "sea" && m.kind !== "gulf" && m.kind !== "strait") m.within = sameCountry([g.at, g.path[0], g.path[g.path.length - 1]]) || 0;
    row(m); n++;
  }
  return n;
}
log("marine polygons…");
const MARINE = { ocean: "ocean", sea: "sea", gulf: "gulf", bay: "gulf", sound: "gulf", inlet: "gulf", fjord: "gulf", lagoon: "gulf", strait: "strait", channel: "strait" };
shapes("ne-10m-marine-polys", "ne_10m_geography_marine_polys.shp", null, (r) => {
  const kind = MARINE[r.featurecla]; const name = clean(r.name_en || r.name);
  if (!kind || !name) { left("marine " + r.featurecla); return null; }
  const aliases = [...new Set([r.name, r.namealt].map(clean).filter((s) => s && s !== name && s.toUpperCase() !== s))];
  return { id: "sea:" + r.ne_id, name, kind, rank: r.scalerank == null ? 3 : r.scalerank, qid: /^Q\d+$/.test(r.wikidataid) ? r.wikidataid : 0, within: 0, geom: 0, z: r.min_label != null ? [r.min_label, r.max_label] : 0, aliases, wiki: 0 };
});
log("region polygons…");
const REGION = { Island: "island", "Island group": "island-group", "Range/mtn": "range", Continent: "region", Desert: "region", Plateau: "region", Plain: "region", Basin: "region", Lowland: "region", Depression: "region", Valley: "region", Wetlands: "region", Delta: "region", Gorge: "region", Tundra: "region", Foothills: "region", Geoarea: "region", Peninsula: "region", "Pen/cape": "region", Isthmus: "region", Coast: "region" };
shapes("ne-10m-regions-polys", "ne_10m_geography_regions_polys.shp", null, (r) => {
  const kind = REGION[r.FEATURECLA]; const name = clean(r.NAME_EN || r.NAME);
  if (!kind || !name) { left("region " + r.FEATURECLA); return null; }
  const aliases = [...new Set([r.NAME, r.NAMEALT].map(clean).filter((s) => s && s !== name && s.toUpperCase() !== s))];
  return { id: "reg:" + r.NE_ID, name, kind, rank: r.FEATURECLA === "Continent" ? 0 : (r.SCALERANK == null ? 5 : r.SCALERANK), qid: /^Q\d+$/.test(r.WIKIDATAID) ? r.WIKIDATAID : 0, within: 0, geom: 0, z: r.MIN_LABEL != null ? [r.MIN_LABEL, r.MAX_LABEL] : 0, aliases, wiki: 0, sub: r.FEATURECLA };
});
log("region points…");
{
  const dbf = dbfRows("ne-10m-regions-points", "ne_10m_geography_regions_points.shp");
  for (const r of dbf) {
    const kind = r.featurecla === "island" ? "island" : r.featurecla === "island group" ? "island-group" : null;
    const name = clean(r.name_en || r.name);
    if (!kind || !name) { left("point " + r.featurecla); continue; }
    const aliases = [...new Set([r.name, r.name_alt].map(clean).filter((s) => s && s !== name))];
    row({ id: "pt:" + r.ne_id, name, kind, rank: r.scalerank == null ? 6 : r.scalerank, qid: /^Q\d+$/.test(r.wikidataid) ? r.wikidataid : 0, within: countryAt(r.long_x, r.lat_y) || 0, geom: 0, at: [r3(r.long_x), r3(r.lat_y)], path: 0, len: 0, z: r.min_zoom || 0, aliases, wiki: 0 });
  }
}

/* ---------- 4. lakes and rivers from the water file ---------- */
log("lakes and rivers…");
const water = F.readFile(path.join(DATA, "water.bin"));
const WH = water.header, WQ = water.quantum;
const lakeFaces = new Map();
water.faces.forEach((f, i) => { if (!lakeFaces.has(f.entity)) lakeFaces.set(f.entity, []); lakeFaces.get(f.entity).push(i); });
WH.entities.forEach((e, ei) => {
  if (e.kind !== "lake" || !e.name || e.id === "lake:unnamed") return;
  const faces = lakeFaces.get(ei); if (!faces) { left("lake without a face"); return; }
  const parts = [];
  for (const fi of faces) for (const ring of faceRings(water, water.faces[fi], water.lodCount - 1)) parts.push(ring);
  const g = L.labelGeometry(parts);
  if (!g) { left("lake without geometry"); return; }
  const area = e.area_km2 || g.areaKm2;
  // a lake whose chord is under 6 km is under 40 px even at the cap (0.15 km/px): its name could never be placed
  if (g.lenKm < 6 && area < 25) { left("lake too small to label"); return; }
  row({ id: e.id, name: clean(e.name), kind: "lake", rank: areaRank(area, [1e4, 2e3, 500, 100, 25]) + 1, qid: 0, within: sameCountry([g.at]) || 0, geom: "l" + ei, at: g.at.map(r3), path: g.lenKm >= 60 ? g.path.map((p) => p.map(r2)) : 0, len: Math.round(g.lenKm), z: 0, aliases: [], wiki: 0, area: Math.round(area) });
});
// a river is one ENTITY with one or more arc lists in header.rivers (a list breaks where a lake was crossed or
// the source record had several parts): one row per named entity, its geometry reference the entity index
const riverLists = new Map();
(WH.rivers || []).forEach((rv) => { if (!riverLists.has(rv.entity)) riverLists.set(rv.entity, []); riverLists.get(rv.entity).push(rv); });
const riverIds = new Set();
for (const [ei, lists] of riverLists) {
  const e = WH.entities[ei]; if (!e || !e.name) continue;
  if (e.scalerank != null && e.scalerank > RIVER_MAX_RANK) { left("river of scale rank " + e.scalerank); continue; }
  // three Natural Earth rivers carry one ne_id over two differently named stretches (the Mackenzie and the
  // Comet, the Barwon and the Macintyre, the Avon and the Swan): two water entities, one id — the second row
  // takes the entity index as a suffix; picking goes by entity index (geom), never by this id
  let rid = e.id; if (riverIds.has(rid)) { rid = e.id + ":" + ei; left("river id shared by two stretches"); } riverIds.add(rid);
  // the polyline: every arc of every list in order, rank-0 vertices only for the sampling
  const pts = [];
  for (const rv of lists) for (const a of rv.arcs) for (let i = water.arcOffset[a]; i < water.arcOffset[a + 1]; i++) if (water.rank[i] === 0 || i === water.arcOffset[a] || i === water.arcOffset[a + 1] - 1) pts.push([water.lon[i] * WQ, water.lat[i] * WQ]);
  if (!pts.length) continue;
  const mid = pts[Math.floor(pts.length / 2)];
  const aliases = [...new Set([e.label].map(clean).filter((s) => s && s !== e.name))];
  row({ id: rid, name: clean(e.name), kind: "river", rank: e.scalerank == null ? 5 : e.scalerank, qid: e.wikidata || 0, within: sameCountry([mid, pts[0], pts[pts.length - 1]]) || 0, geom: "r" + ei, at: mid.map(r3), path: 0, len: 0, z: 0, aliases, wiki: 0 });
}

/* ---------- 5. Wikipedia titles from Wikidata sitelinks ---------- */
let cache = { retrieved: null, titles: {} };
try { cache = JSON.parse(fs.readFileSync(WIKI_CACHE, "utf8")); } catch (e) {}
const qids = [...new Set(rows.map((r) => r.qid).filter(Boolean))];
const missing = qids.filter((q) => refetch || !(q in cache.titles));
report.wiki.asked = qids.length;
function sparql(batch) {
  const q = "SELECT ?item ?article WHERE { VALUES ?item { " + batch.map((x) => "wd:" + x).join(" ") + " } ?article schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> . }";
  const r = spawnSync("curl", ["-sS", "-m", "90", "-A", "folio-atlas-build/0.1 (https://folio.study) curl", "-H", "Accept: application/sparql-results+json", "--data-urlencode", "query=" + q, "-w", "\n%{http_code}", "https://query.wikidata.org/sparql"], { encoding: "utf8", maxBuffer: 1 << 26 });
  if (r.status !== 0) throw new Error("curl failed: " + r.stderr);
  const nl = r.stdout.lastIndexOf("\n"), code = r.stdout.slice(nl + 1).trim(), body = r.stdout.slice(0, nl);
  if (code !== "200") throw new Error("HTTP " + code + " (the query service rate-limits a shared address; the build backs off and retries)");
  let j; try { j = JSON.parse(body); } catch (e) { throw new Error("SPARQL did not answer JSON: " + body.slice(0, 120).replace(/\s+/g, " ")); }
  const out = {};
  for (const b of j.results.bindings) {
    const qid = b.item.value.split("/").pop(), url = b.article.value;
    const title = decodeURIComponent(url.split("/wiki/")[1] || "").replace(/_/g, " ");
    if (title) out[qid] = title;
  }
  return out;
}
if (!noWiki && missing.length) {
  log(`Wikidata sitelinks: ${missing.length} of ${qids.length} items not in the cache — fetching in batches of 50…`);
  for (let i = 0; i < missing.length; i += 50) {
    const batch = missing.slice(i, i + 50);
    let got = null;
    // the query service limits a shared address: a refused batch waits 10, 30, 60 then 120 s before trying again
    for (let attempt = 0; attempt < 5 && !got; attempt++) {
      try { got = sparql(batch); } catch (e) { const wait = [10, 30, 60, 120, 120][attempt]; log("  batch " + (i / 50) + " refused (" + e.message.slice(0, 90) + "), waiting " + wait + " s"); spawnSync("sleep", [String(wait)]); }
    }
    if (!got) throw new Error("Wikidata did not answer; re-run later (the cache keeps what arrived)");
    for (const q of batch) cache.titles[q] = got[q] || null;
    cache.retrieved = new Date().toISOString().slice(0, 10);
    fs.writeFileSync(WIKI_CACHE, JSON.stringify(cache, null, 1) + "\n");
    process.stdout.write(`  ${Math.min(i + 50, missing.length)}/${missing.length}\r`);
    spawnSync("sleep", ["2.5"]);
  }
  log("");
}
for (const r of rows) { if (!r.qid) continue; const t = cache.titles[r.qid]; if (t) { report.wiki.found++; r.wiki = t === r.name ? 1 : t; } else if (r.qid in cache.titles) { report.wiki.missing++; } else report.wiki.unfetched = (report.wiki.unfetched || 0) + 1; }

/* ---------- 6. the table ---------- */
const COLS = ["id", "name", "kind", "rank", "qid", "within", "geom", "at", "path", "len", "z", "aliases", "wiki", "v1"];
const KINDS = ["country", "admin1", "capital", "city", "town", "sea", "ocean", "strait", "gulf", "lake", "river", "island", "island-group", "range", "region"];
const seen = new Set();
for (const r of rows) { if (seen.has(r.id)) throw new Error("duplicate id " + r.id); seen.add(r.id); if (!KINDS.includes(r.kind)) throw new Error("kind " + r.kind); if (r.within) report.within.set++; else report.within.none++; }
rows.sort((a, b) => KINDS.indexOf(a.kind) - KINDS.indexOf(b.kind) || a.rank - b.rank || (a.name < b.name ? -1 : 1));
// the table is compact: a QID is its number (the reader puts the Q back), `within` is the container's row
// index + 1 (0 = none), trailing zeros are trimmed
const rowIndex = new Map(); rows.forEach((r, i) => rowIndex.set(r.id, i));
const encode = (r) => { const out = COLS.map((c) => { let v = r[c]; if (c === "qid" && v) v = Number(String(v).replace(/^Q/, "")) || 0; if (c === "within" && v) v = (rowIndex.get(v) == null ? 0 : rowIndex.get(v) + 1); return v == null || v === false || (Array.isArray(v) && !v.length) ? 0 : v; }); while (out.length > 3 && out[out.length - 1] === 0) out.pop(); return out; };
const sizeOf = (list) => Buffer.byteLength(list.map((r) => JSON.stringify(encode(r))).join(",\n"), "utf8");
for (const k of KINDS) { const list = rows.filter((r) => r.kind === k); report.perKind[k] = { n: list.length, bytes: sizeOf(list) }; }
report.tiers["capitals, million-plus, admin-1 capitals"] = { n: rows.filter((r) => /^(capital|city|town)$/.test(r.kind) && !r.tier).length, bytes: sizeOf(rows.filter((r) => /^(capital|city|town)$/.test(r.kind) && !r.tier)) };
report.tiers["+ places of " + TIER + " and more"] = { n: rows.filter((r) => r.tier).length, bytes: sizeOf(rows.filter((r) => r.tier)) };
const sources = headerSources(["ne-10m-admin0", "ne-10m-admin1", "osm-land-polygons", "ne-10m-populated-places", "ne-10m-marine-polys", "ne-10m-regions-polys", "ne-10m-regions-points", "ne-10m-rivers", "hydrolakes"]).concat([{ id: "wikidata-sitelinks", name: "Wikidata — enwiki sitelinks of the items the sources name (the Wikipedia title behind each 'Learn more' link)", version: "fetched " + (cache.retrieved || "n/a") + " through query.wikidata.org", url: "https://query.wikidata.org/", licence: "CC0", licenceUrl: "https://creativecommons.org/publicdomain/zero/1.0/", attribution: "Wikidata, CC0 1.0", retrieved: cache.retrieved || "n/a", sha256: null }]);
const table = { format: 1, generated, generator, kinds: KINDS, cols: COLS, counts: Object.fromEntries(KINDS.map((k) => [k, report.perKind[k].n])), rows: rows.map(encode) };
const body = "/* sources: " + JSON.stringify(sources) + " */\n" +
  "/* atlas/data/gazetteer.js — GENERATED by .claude/atlas-build/build-gazetteer.js (docs/atlas-v2-design.md §2.6, §2.8). Do not edit.\n" +
  "   The places the Atlas names: rows under `cols` (trailing zeros trimmed; 0 = none), ids stable across builds\n" +
  "   (adm0:<a3>, adm1:…, city:<NE id>, sea:<NE id>, reg:<NE id>, pt:<NE id>, lake:<HydroLAKES id>, river:<NE id>).\n" +
  "   `geom` names the face (f<index>), lake entity (l<index>) or river entity (r<index>) in topology.bin / water.bin;\n" +
  "   `qid` is the Wikidata item's number, `within` the containing row's index + 1 (0 = none);\n" +
  "   `at` is the label anchor (lon, lat), `path` the label baseline, `len` its room in km, `z` the source's zoom\n" +
  "   hints, `wiki` the enwiki title (1 = the name itself), `v1` the key into countries.js. */\n" +
  "window.ATLAS_GAZETTEER = " + JSON.stringify(table, (k, v) => v, 0).replace(/\],\[/g, "],\n[") + ";\n";
report.bytes = Buffer.byteLength(body, "utf8");
report.objectBytes = Buffer.byteLength(JSON.stringify(rows.map((r) => { const o = {}; for (const c of COLS) if (r[c]) o[c] = r[c]; return o; })), "utf8");
report.ms = Date.now() - t0;
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "gazetteer-report.json"), JSON.stringify(report, null, 2) + "\n");
log("\nsize per kind (bytes of rows):");
for (const k of KINDS) log(`  ${k.padEnd(13)} ${String(report.perKind[k].n).padStart(5)}  ${String(report.perKind[k].bytes).padStart(8)}`);
for (const [k, v] of Object.entries(report.tiers)) log(`  tier ${k}: ${v.n} places, ${v.bytes} bytes`);
log(`  whole file ${report.bytes} bytes (${(report.bytes / 1048576).toFixed(3)} MB; the same rows as objects would be ${(report.objectBytes / 1048576).toFixed(3)} MB); budget ${(BUDGET / 1048576).toFixed(2)} MB ${report.bytes <= BUDGET ? "OK" : "EXCEEDED"}`);
log(`  within: ${report.within.set} set, ${report.within.none} none; wiki: ${report.wiki.found} titles of ${report.wiki.asked} items with a QID (${report.wiki.missing} items have no enwiki sitelink${report.wiki.unfetched ? ", " + report.wiki.unfetched + " not fetched" : ""})`);
log(`  v1 prose: ${report.v1.matched} countries matched, ${report.v1.missing.length} without an entry: ${report.v1.missing.join("; ")}`);
log(`  left out: ${JSON.stringify(report.left)}`);
log(`  ${report.ms} ms`);
if (report.bytes > BUDGET) { console.error("over budget — lower --tier or trim a kind"); process.exit(1); }
if (!dry) {
  fs.writeFileSync(path.join(OUT, "gazetteer.js"), body);
  if (install) { fs.writeFileSync(path.join(DATA, "gazetteer.js"), body); log("installed atlas/data/gazetteer.js"); } else log("wrote out/gazetteer.js (--install copies it into atlas/data/)");
}
