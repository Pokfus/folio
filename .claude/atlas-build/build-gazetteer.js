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
   NAMES ARE ENGLISH, ONE ROW PER PLACE (Phase 1d, 2026-10-09; the site is English only). The display name is
     1. the source's English field where the source translated it (NAME_EN / name_en differing from NAME; the core's
        admin-1 units take Natural Earth admin-1 name_en by ISO code — "Magadan", not NE's "Maga Buryatdan"; "Tibet", not
        "Xizang"). A COUNTRY keeps the core's name, which is Natural Earth admin-0's NAME — already the English short
        name ("China", "Czechia", "Vatican"); NE's NAME_EN there is the long form ("People's Republic of China", "Czech
        Republic") and is wrong outright on a row or two ("Wake Island" for the Spratly Islands), measured 2026-10-09.
        Two guards on the field: an English field that turns a town or a unit INTO a country's name is a source fault ("Saudi
        Arabia" for Ha'il) and is not taken; and where two units of one country end up with one English name (Moscow the city
        and the oblast, Washington the state and the District), each takes its English Wikipedia title where that begins with
        the shared name and goes on without a parenthesis ("Moscow Oblast", "Washington, D.C."). NE's one-word English for the
        Jewish Autonomous Oblast ("Jewish") stays as the field gives it, and is reported;
     2. else the item's English label from Wikidata (the cached SPARQL pass, wiki-sitelinks.json `labels`) — where the
        source has NO English field, or copied a local name with letters outside ASCII into it ("Aoukâr"), and the label
        is plain ASCII, under 60 characters, without a parenthesis. MEASURED before the rule was narrowed (2026-10-09):
        read broadly ("the label wherever the source's English field repeats the local name") it renamed 80 rows and some
        70 of them wrongly — Natural Earth's own Wikidata ids are wrong on a few towns (Niamey → Maradi, Misrata → an
        Arabic label, Baqubah → Bagdad) and Wikidata's labels follow conventions of their own ("Bali Island", "Ōita-shi",
        "Taoyuan District", "Australian continent"). Narrowed, it changes one row. "Böhmerwald" stays: Natural Earth's
        English field and the item's English label both say Böhmerwald, and the item has no English article;
     3. else the source name as given (HydroLAKES' lake names, a river with no Wikidata item).
   Diacritics follow the English Wikipedia title: where the title and the chosen name differ only in diacritics
   or case the title's spelling wins (São Paulo keeps its ã, Bogotá gains its á, Zürich loses its ü — because
   en.wikipedia writes Zurich). Nothing is re-spelt by hand, and canvas text is outside the site's spelling pass.
   ONE ROW PER WIKIDATA ITEM PER KIND: Natural Earth names one river per stretch (Rhein, Rhin and Rhine are three
   records of Q584; Donau and Danube two of Q1653; Tajo and Tejo; Chang Jiang and Yangtze), and splits an ocean or
   an island group over several polygons; rows sharing a QID within a kind are merged — the marine and regions
   polygons as one shape before the label geometry is computed, the rivers as one row whose `alt` column lists
   the other water entities (the worker lays the name along every stretch; a tap on any stretch answers with the
   row) — and every other name becomes an alias, so a search for "Donau" finds the Danube. Two admin-1 units
   with one QID (Natural Earth gives Altai Krai the Republic's Q5971) are a source fault: the unit whose English
   name is not the item's label loses the QID and the link, and the report says so. The source's other name
   fields (NAME, NAMEALT, NAMEASCII, NAME_LONG, ABBREV…) and the merged rows' names become `aliases` for the
   search box — minus any that fold (diacritics and case stripped) to the name itself, which the search folds anyway.

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
const TIER = Number(flag("--tier", 1000000));                 // the shipped v0 carries no further city tier (§7 Phase 1c: it would not fit the budget); 250000 was the first build's trial
const TOWN_MIN = Number(flag("--town-min", 100000));
const RIVER_MAX_RANK = Number(flag("--river-rank", 7));    // Natural Earth scale ranks above this (the smallest streams) carry no label row; 8 until Phase 1d, when the English names and the aliases cost 20 KB and the 288 rank-8 rivers (28 KB, drawn but unnamed) were the lever that cost the reader least
const BUDGET = 600000;                                      // the owner's 0.6 MB, DECIMAL (1 MB = 1,000,000 bytes) since Phase 1d; it was 0.6 × 1024² before
const W = require("./lib/wikidata.js");
const fold = (x) => String(x || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
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
const report = { generated, perKind: {}, tiers: {}, v1: { matched: 0, missing: [] }, within: { set: 0, none: 0 }, wiki: { asked: 0, found: 0, missing: 0 }, left: {}, merged: {}, renamed: { bySourceEnglish: 0, byLabel: 0, byTitleDiacritics: 0, perKind: {}, examples: [] }, qidDropped: [] };
const left = (k) => { report.left[k] = (report.left[k] || 0) + 1; };
function row(o) { rows.push(o); }

/* ---------- 1. countries and admin-1 ---------- */
log("countries and admin-1 units…");
const adm0 = dbfRows("ne-10m-admin0", "ne_10m_admin_0_countries.shp");
const adm0ByA3 = new Map(adm0.map((r) => [r.ADM0_A3, r]));
S["ne-10m-admin1"] = ensureSource("ne-10m-admin1");
const adm1ByIso = new Map(dbfRows("ne-10m-admin1", "ne_10m_admin_1_states_provinces.shp").filter((r) => r.iso_3166_2).map((r) => [String(r.iso_3166_2).toUpperCase(), r]));
S["ne-10m-rivers"] = ensureSource("ne-10m-rivers");
const riverByNeId = new Map(); for (const r of dbfRows("ne-10m-rivers", "ne_10m_rivers_lake_centerlines_scale_rank.shp")) if (r.ne_id != null && !riverByNeId.has(r.ne_id)) riverByNeId.set(r.ne_id, r);
global.window = {};
require(path.join(ROOT, "countries.js")); require(path.join(ROOT, "country-stats.js")); require(path.join(ROOT, "country-spans.js")); require(path.join(ROOT, "country-sources.js"));
const v1Keys = new Set(Object.keys(global.window.COUNTRY_INFO || {}));
const areaRank = (km2, bins) => { for (let i = 0; i < bins.length; i++) if (km2 >= bins[i]) return i; return bins.length; };
const prose = { preferred: 0, unpreferred: [] };
H.entities.forEach((e, ei) => {
  const faces = entityFaces.get(ei);
  if (!faces.length) { left("face-less entity " + e.id); return; }
  if (!clean(e.name)) { left("unnamed entity " + e.id); return; }
  // rings at LOD 1 (2.5 km) for the big faces, at LOD 2 (500 m) for everything under 20k vertices — a thin
  // territory's LOD 1 ring can bulge a quantum into its neighbour, and the anchor is checked against the z=4 partition
  let parts = [];
  for (const fi of faces) for (const ring of faceRings(core, core.faces[fi], 1)) parts.push(ring);
  const nv = parts.reduce((n, r) => n + r.length, 0);
  if (nv < 20000) { parts = []; for (const fi of faces) for (const ring of faceRings(core, core.faces[fi], 2)) parts.push(ring); }
  // `prefer` sees the coordinates as the file will carry them (three decimals, 55 m): a rounding had put the Vatican's anchor in Italy
  const r3p = (f) => (lon, lat) => f(r3(lon), r3(lat));
  const prefer = r3p(e.kind === "polity" ? (lon, lat) => countryAt(lon, lat) === e.id : (lon, lat) => countryAt(lon, lat) === e.parent);
  let g = parts.length ? L.labelGeometry(parts, { prefer }) : null;
  const r4 = (v) => Math.round(v * 10000) / 10000;
  let atPrecision = r3;
  if (!g || !g.preferred) {
    // a face with no ring in the core at all — its land exists only in the z=4 tiles (the Vatican, Ashmore and
    // Cartier, Bajo Nuevo, Serranilla, the Coral Sea Islands): the tiles' own face, the first of its vertices'
    // mean, ring centroids and vertices that the partition says is this country; a territory the partition holds
    // no land for at all (a reef OSM never drew) takes Natural Earth's label point (LABEL_X, LABEL_Y of admin-0,
    // PD) and is reported as unmapped — the checker expects the sea there
    const cands = [];
    for (const t of land.tiles) for (const f of t.faces) {
      if (H.entities[t.T.faces[f.face].entity].id !== e.id) continue;
      let mx = 0, my = 0; for (let i = 0; i < f.X.length; i++) { mx += f.X[i]; my += f.Y[i]; } mx /= f.X.length; my /= f.X.length;
      cands.push([mx * Q, my * Q]);
      for (let i = 0; i < f.X.length; i++) for (const u of [0.3, 0.5, 0.7, 1]) cands.push([(mx + (f.X[i] - mx) * u) * Q, (my + (f.Y[i] - my) * u) * Q]);   // towards each vertex: a sliver's centroid can be outside it
    }
    // three decimals first; a territory under a hectare or two (the Vatican's z=4 face is a 3-vertex triangle) at four
    const prefer4 = (lon, lat) => countryAt(r4(lon), r4(lat)) === (e.kind === "polity" ? e.id : e.parent);
    let at = cands.find((c) => prefer(c[0], c[1])) || null, preferred = !!at;
    if (!at) { at = cands.find((c) => prefer4(c[0], c[1])) || null; if (at) { preferred = true; atPrecision = r4; left("anchor at four decimals"); } }
    if (!at && g) { if (g.preferred) {} }   // (the ring geometry stays when the tiles offer nothing better)
    if (at) { left("anchor from the z=4 tiles' face"); g = { at, path: [at, at], lenKm: 0, areaKm2: g ? g.areaKm2 : 0, preferred }; }
    else if (!g) { const ne = e.kind === "polity" ? adm0ByA3.get(e.a3) : null; if (!ne || ne.LABEL_X == null) { left("no geometry " + e.id); return; } at = [ne.LABEL_X, ne.LABEL_Y]; report.unmapped = (report.unmapped || []).concat(e.id); left("unmapped in the partition, anchored at Natural Earth's label point"); g = { at, path: [at, at], lenKm: 0, areaKm2: 0, preferred: false }; }
  }
  if (g.preferred) prose.preferred++; else prose.unpreferred.push(e.id);
  // the path is written at two decimals (1.1 km): a degenerate path (the anchor twice) or one whose rounded
  // points the partition puts elsewhere is dropped — the label then sits straight at the anchor
  const pathOK = g.lenKm > 0 && g.path.every((q) => prefer(q[0], q[1])) && g.path.every((q) => { const r = q.map(r2); return prefer(r[0], r[1]); });
  const pathOut = pathOK ? g.path.map((q) => q.map(r2)) : 0, lenOut = pathOK ? Math.round(g.lenKm) : 0;
  if (!pathOK && g.lenKm > 0) left("path dropped at two decimals");
  if (e.kind === "polity") {
    const ne = adm0ByA3.get(e.a3) || {};
    const cands = [e.name, ne.NAME, ne.NAME_LONG, ne.FORMAL_EN, ne.NAME_EN, ne.ABBREV, ne.NAME_SORT, ne.BRK_NAME, ne.NAME_CIAWF].filter(Boolean).map((s) => clean(s).toLowerCase());
    const v1 = cands.find((k) => v1Keys.has(k)) || 0;
    if (v1) report.v1.matched++; else report.v1.missing.push(e.name);
    const aliases = [...new Set([e.name, ne.NAME, ne.NAME_LONG, ne.FORMAL_EN, ne.ABBREV, ne.NAME_ALT].map(clean).filter(Boolean))];
    row({ src: { en: null, local: e.name, noLabel: true }, id: e.id, name: e.name, kind: "country", rank: areaRank(g.areaKm2, [2e6, 5e5, 1e5, 2e4, 2e3]), qid: e.qid || 0, within: e.sovereign && e.sovereign !== e.a3 ? "adm0:" + e.sovereign.toLowerCase() : 0, geom: "f" + faces[0], at: g.at.map(atPrecision), path: pathOut, len: lenOut, z: ne.MIN_LABEL != null ? [ne.MIN_LABEL, ne.MAX_LABEL] : 0, aliases, wiki: 0, v1, area: Math.round(g.areaKm2) });
  } else if (e.kind === "admin1") {
    const ne1 = adm1ByIso.get(String(e.iso || "").toUpperCase()) || {};
    row({ src: { en: ne1.name_en, local: ne1.name || e.name, noLabel: true }, id: e.id, name: e.name, kind: "admin1", rank: areaRank(g.areaKm2, [5e5, 1e5, 2e4]) + 3, qid: e.qid || 0, within: e.parent || 0, geom: "f" + faces[0], at: g.at.map(atPrecision), path: pathOut, len: lenOut, z: 0, aliases: [e.name, ne1.name, ne1.name_alt, ne1.gn_name].map(clean).filter(Boolean), wiki: 0, area: Math.round(g.areaKm2) });
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
  const aliases = [r.NAME, r.NAMEALT, r.NAMEPAR, r.NAMEASCII].map(clean).filter(Boolean);
  row({ src: { en: r.NAME_EN, local: r.NAME }, id: "city:" + r.NE_ID, name: clean(r.NAME), kind, rank: r.SCALERANK == null ? 7 : r.SCALERANK, qid: /^Q\d+$/.test(r.WIKIDATAID) ? r.WIKIDATAID : 0, within, geom: 0, at: [r3(r.LONGITUDE), r3(r.LATITUDE)], path: 0, len: 0, z: r.MIN_ZOOM || 0, aliases, wiki: 0, pop, tier: inBase ? 0 : 1 });
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
    // a feature split over several records — one ne_id (the Great Barrier Reef), or several records of ONE Wikidata
    // item (the Atlantic as two polygons, an island group's scattered parts; Phase 1d) — is one place with one anchor
    const key = m.qid ? m.kind + ":" + m.qid : m.id;
    const have = byId.get(key);
    if (have) { have.parts.push(...parts); if (have.m.name !== m.name) { left("id shared by two names " + id); have.m.aliases.push(m.name); } if (m.id !== have.m.id) { report.merged[m.kind] = (report.merged[m.kind] || 0) + 1; have.m.aliases.push(...(m.aliases || [])); } continue; }
    byId.set(key, { m, parts });
  }
  const water = (lon, lat) => !land.isLand(Math.round(r3(lon) / Q), Math.round(r3(lat) / Q)), onLand = (lon, lat) => !water(lon, lat);
  for (const { m, parts } of byId.values()) {
    const sea = m.kind === "ocean" || m.kind === "sea" || m.kind === "gulf" || m.kind === "strait";
    const g = L.labelGeometry(parts, { prefer: sea ? water : onLand });
    if (!g) { left("no geometry " + id); continue; }
    if (!g.preferred) left((sea ? "sea anchor on land: " : "land anchor in water: ") + m.name);
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
  const aliases = [r.name, r.namealt].map(clean).filter((s) => s && s.toUpperCase() !== s);
  return { src: { en: r.name_en, local: r.name }, id: "sea:" + r.ne_id, name, kind, rank: r.scalerank == null ? 3 : r.scalerank, qid: /^Q\d+$/.test(r.wikidataid) ? r.wikidataid : 0, within: 0, geom: 0, z: r.min_label != null ? [r.min_label, r.max_label] : 0, aliases, wiki: 0 };
});
log("region polygons…");
const REGION = { Island: "island", "Island group": "island-group", "Range/mtn": "range", Continent: "region", Desert: "region", Plateau: "region", Plain: "region", Basin: "region", Lowland: "region", Depression: "region", Valley: "region", Wetlands: "region", Delta: "region", Gorge: "region", Tundra: "region", Foothills: "region", Geoarea: "region", Peninsula: "region", "Pen/cape": "region", Isthmus: "region", Coast: "region" };
shapes("ne-10m-regions-polys", "ne_10m_geography_regions_polys.shp", null, (r) => {
  const kind = REGION[r.FEATURECLA]; const name = clean(r.NAME_EN || r.NAME);
  if (!kind || !name) { left("region " + r.FEATURECLA); return null; }
  const aliases = [r.NAME, r.NAMEALT].map(clean).filter((s) => s && s.toUpperCase() !== s);
  return { src: { en: r.NAME_EN, local: r.NAME }, id: "reg:" + r.NE_ID, name, kind, rank: r.FEATURECLA === "Continent" ? 0 : (r.SCALERANK == null ? 5 : r.SCALERANK), qid: /^Q\d+$/.test(r.WIKIDATAID) ? r.WIKIDATAID : 0, within: 0, geom: 0, z: r.MIN_LABEL != null ? [r.MIN_LABEL, r.MAX_LABEL] : 0, aliases, wiki: 0, sub: r.FEATURECLA };
});
log("region points…");
{
  const dbf = dbfRows("ne-10m-regions-points", "ne_10m_geography_regions_points.shp");
  for (const r of dbf) {
    const kind = r.featurecla === "island" ? "island" : r.featurecla === "island group" ? "island-group" : null;
    const name = clean(r.name_en || r.name);
    if (!kind || !name) { left("point " + r.featurecla); continue; }
    const aliases = [r.name, r.name_alt].map(clean).filter(Boolean);
    row({ src: { en: r.name_en, local: r.name }, id: "pt:" + r.ne_id, name, kind, rank: r.scalerank == null ? 6 : r.scalerank, qid: /^Q\d+$/.test(r.wikidataid) ? r.wikidataid : 0, within: countryAt(r.long_x, r.lat_y) || 0, geom: 0, at: [r3(r.long_x), r3(r.lat_y)], path: 0, len: 0, z: r.min_zoom || 0, aliases, wiki: 0 });
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
  const g = L.labelGeometry(parts, { prefer: (lon, lat) => land.isLand(Math.round(r3(lon) / Q), Math.round(r3(lat) / Q)) });
  if (!g) { left("lake without geometry"); return; }
  if (!g.preferred) left("lake anchor in the sea: " + e.name);
  const area = e.area_km2 || g.areaKm2;
  // a lake whose chord is under 6 km is under 40 px even at the cap (0.15 km/px): its name could never be placed
  if (g.lenKm < 6 && area < 25) { left("lake too small to label"); return; }
  row({ src: { en: null, local: e.name }, id: e.id, name: clean(e.name), kind: "lake", rank: areaRank(area, [1e4, 2e3, 500, 100, 25]) + 1, qid: 0, within: sameCountry([g.at]) || 0, geom: "l" + ei, at: g.at.map(r3), path: g.lenKm >= 60 ? g.path.map((p) => p.map(r2)) : 0, len: Math.round(g.lenKm), z: 0, aliases: [], wiki: 0, area: Math.round(area) });
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
  // the references are ONE-BASED and signed, as every arc list in the format is (pack-water.js writes arcIndex + 1):
  // read zero-based they named the arc after each one, and a river's anchor could land on its neighbour (Oct 2026)
  for (const rv of lists) for (const ref of rv.arcs) { const a = Math.abs(ref) - 1; const s0 = water.arcOffset[a], e0 = water.arcOffset[a + 1]; const run = []; for (let i = s0; i < e0; i++) if (water.rank[i] === 0 || i === s0 || i === e0 - 1) run.push([water.lon[i] * WQ, water.lat[i] * WQ]); if (ref < 0) run.reverse(); pts.push(...run); }
  if (!pts.length) continue;
  const mid = pts[Math.floor(pts.length / 2)];
  const ne = riverByNeId.get(e.ne_id) || {};
  const aliases = [e.name, e.label, ne.name, ne.name_alt].map(clean).filter(Boolean);
  row({ src: { en: ne.name_en, local: ne.name || e.name }, id: rid, name: clean(e.name), kind: "river", rank: e.scalerank == null ? 5 : e.scalerank, qid: e.wikidata || 0, within: sameCountry([mid, pts[0], pts[pts.length - 1]]) || 0, geom: "r" + ei, at: mid.map(r3), path: 0, len: 0, z: 0, aliases, wiki: 0, pts, ents: [ei] });
}

/* ---------- 5. Wikipedia titles from Wikidata sitelinks ---------- */
let cache = { retrieved: null, titles: {}, labels: {} };
try { cache = JSON.parse(fs.readFileSync(WIKI_CACHE, "utf8")); } catch (e) {}
cache.labels = cache.labels || {};
const qids = [...new Set(rows.map((r) => r.qid).filter(Boolean))];
const missing = qids.filter((q) => refetch || !(q in cache.titles));
report.wiki.asked = qids.length;
if (!noWiki) {
  W.fetchMissing(cache, "titles", qids, W.sitelinkQuery, WIKI_CACHE, { refetch, log });
  W.fetchMissing(cache, "labels", qids, W.labelQuery, WIKI_CACHE, { refetch, log });   // Phase 1d: the English labels behind rule 2
}
for (const r of rows) { if (!r.qid) continue; const t = cache.titles[r.qid]; if (t) { report.wiki.found++; r.wiki = t === r.name ? 1 : t; } else if (r.qid in cache.titles) { report.wiki.missing++; } else report.wiki.unfetched = (report.wiki.unfetched || 0) + 1; }

/* ---------- 5b. English names (the header's rule) ---------- */
log("English names…");
const countryNames = new Set(rows.filter((r) => r.kind === "country").map((r) => fold(r.name)));
const extendsTo = (en, title) => { if (!en || !title || /[()]/.test(title) || title.length > 48) return false; const a = fold(en), b = fold(title); return b.length > a.length && b.startsWith(a) && /^[ ,]/.test(b.slice(a.length)); };
for (const r of rows) {
  const src = r.src || { en: null, local: r.name };
  let en = clean(src.en); const local = clean(src.local) || r.name, before = r.name;
  const label = r.qid ? cache.labels[r.qid] : null, title = r.qid ? cache.titles[r.qid] : null;
  // an island or a river may share a country's name; a town turned INTO one by its English field is a source fault
  if (en && fold(en) !== fold(local) && /^(capital|city|town|admin1)$/.test(r.kind) && countryNames.has(fold(en))) { report.renamed.examples.push(`${r.kind}: ${r.name} keeps its name — the source's English field turns it into "${en}", a country (a source fault)`); en = null; }
  let name = null, how = null;
  if (en && fold(en) !== fold(local)) { name = en; how = "bySourceEnglish"; }                    // 1. the source translated it
  else if (!src.noLabel && label && label.length <= 60 && !/[()]/.test(label) && !/[^\x20-\x7e]/.test(label) && (!en || /[^\x20-\x7e]/.test(local)) && fold(label) !== fold(local) && fold(label) !== fold(en || local)) { name = label; how = "byLabel"; }   // 2. Wikidata's English label, narrowly (the header says why)
  else name = en || local || r.name;                                                                  // 3. the source name as given
  if (title && fold(title) === fold(name) && title !== name) { name = title; how = how || "byTitleDiacritics"; }   // diacritics and case follow en.wikipedia
  if (name !== before) {
    report.renamed[how || "byTitleDiacritics"]++;
    report.renamed.perKind[r.kind] = (report.renamed.perKind[r.kind] || 0) + 1;
    if (report.renamed.examples.length < 400) report.renamed.examples.push(`${r.kind}: ${before} → ${name} (${how || "title"})`);
  }
  r.aliases = (r.aliases || []).concat([before, local, en]);
  r.name = name;
}
// 1b. two units of one country with one English name (Moscow the city and Moscow the oblast; Washington the state and the
// District): each takes its English Wikipedia title where that begins with the shared name and goes on without a parenthesis
// ("Moscow Oblast", "Washington, D.C."; "Washington (state)" has one and keeps "Washington")
{
  const groups = new Map();
  for (const r of rows) { if (r.kind !== "admin1") continue; const k = r.within + ":" + fold(r.name); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(r); }
  for (const g of groups.values()) { if (g.length < 2) continue; for (const r of g) { const title = r.qid ? cache.titles[r.qid] : null; if (extendsTo(r.name, title)) { report.renamed.examples.push(`admin1: ${r.name} → ${title} (two units of one country shared the name)`); r.aliases.push(r.name); r.name = title; } } }
}
/* ---------- 5c. one row per Wikidata item per kind ---------- */
log("merging rows that share a QID within a kind…");
{
  const byKey = new Map();
  for (const r of rows) { if (!r.qid) continue; const k = r.kind + ":" + r.qid; if (!byKey.has(k)) byKey.set(k, []); byKey.get(k).push(r); }
  const drop = new Set();
  for (const [k, group] of byKey) {
    if (group.length < 2) continue;
    const kind = group[0].kind;
    if (kind === "country" || kind === "admin1") {
      // two faces, one QID: a source fault — the unit whose English name is the item's keeps it
      const label = cache.labels[group[0].qid], title = cache.titles[group[0].qid];
      const keep = group.find((r) => fold(r.name) === fold(label) || fold(r.name) === fold(title)) || group[0];
      // …and where the source gave the wrong unit the item's English name too (Natural Earth's admin-1 name_en for Altai Krai
      // reads "Altai Republic"), the wrong unit falls back to its local name, so no two units of one country share a name
      for (const r of group) if (r !== keep) { report.qidDropped.push(`${r.kind} ${r.id} "${r.name}" shared ${r.qid} with "${keep.name}"`); r.qid = 0; r.wiki = 0; if (fold(r.name) === fold(keep.name) && r.src && clean(r.src.local) && fold(r.src.local) !== fold(keep.name)) { report.qidDropped.push(`${r.id} renamed back to its local "${clean(r.src.local)}"`); r.aliases = (r.aliases || []).concat([r.name]); r.name = clean(r.src.local); } }
      continue;
    }
    // the primary row: the best rank, then the longest geometry (a river's vertex count, a lake's chord), then the first
    group.sort((a, b) => a.rank - b.rank || ((b.pts ? b.pts.length : b.len || 0) - (a.pts ? a.pts.length : a.len || 0)));
    const keep = group[0];
    for (const r of group.slice(1)) {
      drop.add(r);
      keep.aliases = (keep.aliases || []).concat([r.name], r.aliases || []);
      if (kind === "river") { keep.ents = keep.ents.concat(r.ents); keep.pts = keep.pts.concat(r.pts); }
      report.merged[kind] = (report.merged[kind] || 0) + 1;
    }
    if (kind === "river") { const pts = keep.pts; keep.at = pts[Math.floor(pts.length / 2)].map(r3); keep.within = sameCountry(keep.ents.map((ei) => { const p = rows.find((x) => x.geom === "r" + ei); return p ? p.pts : []; }).flatMap((p) => (p.length ? [p[0], p[p.length - 1]] : []))) || 0; }
  }
  for (let i = rows.length - 1; i >= 0; i--) if (drop.has(rows[i])) rows.splice(i, 1);
  for (const r of rows) {
    if (r.kind === "river" && r.ents && r.ents.length > 1) { const main = Number(String(r.geom).slice(1)); r.alt = r.ents.filter((ei) => ei !== main); }
    // aliases: distinct by fold, never the name itself, at most four
    const seenA = new Set([fold(r.name)]); const out = [];
    for (const a of r.aliases || []) { const c = clean(a); const f = fold(c); if (!c || seenA.has(f)) continue; seenA.add(f); out.push(c); }
    r.aliases = out.slice(0, 4);
    delete r.pts; delete r.ents; delete r.src;
  }
}
for (const r of rows) { if (!r.qid) continue; const t = cache.titles[r.qid]; if (t) { r.wiki = t === r.name ? 1 : t; } else r.wiki = 0; }   // the title again, against the FINAL name

/* ---------- 6. the table ---------- */
const COLS = ["id", "name", "kind", "rank", "qid", "within", "geom", "at", "path", "len", "z", "aliases", "wiki", "v1", "alt"];
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
const sources = headerSources(["ne-10m-admin0", "ne-10m-admin1", "osm-land-polygons", "ne-10m-populated-places", "ne-10m-marine-polys", "ne-10m-regions-polys", "ne-10m-regions-points", "ne-10m-rivers", "hydrolakes"]).concat([{ id: "wikidata-sitelinks", name: "Wikidata — the English labels and enwiki sitelinks of the items the sources name (the English display name where a source has none, and the Wikipedia title behind each link)", version: "fetched " + (cache.retrieved || "n/a") + " through query.wikidata.org", url: "https://query.wikidata.org/", licence: "CC0", licenceUrl: "https://creativecommons.org/publicdomain/zero/1.0/", attribution: "Wikidata, CC0 1.0", retrieved: cache.retrieved || "n/a", sha256: null }]);
const table = { format: 1, generated, generator, kinds: KINDS, cols: COLS, counts: Object.fromEntries(KINDS.map((k) => [k, report.perKind[k].n])), rows: rows.map(encode) };
const body = "/* sources: " + JSON.stringify(sources) + " */\n" +
  "/* atlas/data/gazetteer.js — GENERATED by .claude/atlas-build/build-gazetteer.js (docs/atlas-v2-design.md §2.6, §2.8). Do not edit.\n" +
  "   The places the Atlas names: rows under `cols` (trailing zeros trimmed; 0 = none), ids stable across builds\n" +
  "   (adm0:<a3>, adm1:…, city:<NE id>, sea:<NE id>, reg:<NE id>, pt:<NE id>, lake:<HydroLAKES id>, river:<NE id>).\n" +
  "   `geom` names the face (f<index>), lake entity (l<index>) or river entity (r<index>) in topology.bin / water.bin;\n" +
  "   `qid` is the Wikidata item's number, `within` the containing row's index + 1 (0 = none);\n" +
  "   `at` is the label anchor (lon, lat), `path` the label baseline, `len` its room in km, `z` the source's zoom\n" +
  "   hints, `wiki` the enwiki title (1 = the name itself), `v1` the key into countries.js, `alt` a merged river's other\n" +
  "   water entities (one row per Wikidata item per kind; the other names are aliases). Names are English (header rule). */\n" +
  "window.ATLAS_GAZETTEER = " + JSON.stringify(table, (k, v) => v, 0).replace(/\],\[/g, "],\n[") + ";\n";
report.bytes = Buffer.byteLength(body, "utf8");
report.aliasBytes = { all: 0, firstTwo: 0, firstOne: 0 }; for (const r of rows) { const a = r.aliases || []; report.aliasBytes.all += Buffer.byteLength(JSON.stringify(a)) - 2; report.aliasBytes.firstTwo += Buffer.byteLength(JSON.stringify(a.slice(0, 2))) - 2; report.aliasBytes.firstOne += Buffer.byteLength(JSON.stringify(a.slice(0, 1))) - 2; }
report.objectBytes = Buffer.byteLength(JSON.stringify(rows.map((r) => { const o = {}; for (const c of COLS) if (r[c]) o[c] = r[c]; return o; })), "utf8");
report.ms = Date.now() - t0;
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "gazetteer-report.json"), JSON.stringify(report, null, 2) + "\n");
log("\nsize per kind (bytes of rows):");
for (const k of KINDS) log(`  ${k.padEnd(13)} ${String(report.perKind[k].n).padStart(5)}  ${String(report.perKind[k].bytes).padStart(8)}`);
for (const [k, v] of Object.entries(report.tiers)) log(`  tier ${k}: ${v.n} places, ${v.bytes} bytes`);
log(`  whole file ${report.bytes} bytes (${(report.bytes / 1e6).toFixed(3)} MB decimal; the same rows as objects would be ${(report.objectBytes / 1e6).toFixed(3)} MB); budget ${(BUDGET / 1e6).toFixed(2)} MB ${report.bytes <= BUDGET ? "OK" : "EXCEEDED"}`);
log(`  aliases cost ${report.aliasBytes.all} bytes (the first two alone ${report.aliasBytes.firstTwo}, the first alone ${report.aliasBytes.firstOne})`);
log(`  English names: ${report.renamed.bySourceEnglish} by the source's English field, ${report.renamed.byLabel} by Wikidata's label, ${report.renamed.byTitleDiacritics} by the title's diacritics; per kind ${JSON.stringify(report.renamed.perKind)}`);
log(`  merged (rows sharing a QID within a kind): ${JSON.stringify(report.merged)}; QIDs dropped as source faults: ${report.qidDropped.join("; ") || "none"}`);
log(`  within: ${report.within.set} set, ${report.within.none} none; wiki: ${report.wiki.found} titles of ${report.wiki.asked} items with a QID (${report.wiki.missing} items have no enwiki sitelink${report.wiki.unfetched ? ", " + report.wiki.unfetched + " not fetched" : ""})`);
log(`  anchors: ${prose.preferred} countries and admin-1 units anchored in their own land by the z=4 partition; not: ${prose.unpreferred.join(", ") || "none"}`);
log(`  v1 prose: ${report.v1.matched} countries matched, ${report.v1.missing.length} without an entry: ${report.v1.missing.join("; ")}`);
log(`  left out: ${JSON.stringify(report.left)}`);
log(`  ${report.ms} ms`);
if (report.bytes > BUDGET) { console.error("over budget — lower --tier or trim a kind"); process.exit(1); }
if (!dry) {
  fs.writeFileSync(path.join(OUT, "gazetteer.js"), body);
  if (install) { fs.writeFileSync(path.join(DATA, "gazetteer.js"), body); log("installed atlas/data/gazetteer.js"); require("./build-credits.js").build({ install: true }); } else log("wrote out/gazetteer.js (--install copies it into atlas/data/)");
}
