#!/usr/bin/env node
/* build-card-faces.js — atlas/data/card-faces.js, what a MAP CARD needs from the engine (Atlas v2 Phase 4; docs/atlas-v2-card-windows.md)

     node .claude/atlas-build/build-card-faces.js [--install] [--check]

   A map card names its place by the key of a layer's own shape list (`map: { layer, key, dot }`: "Texas" in us-states, "Chad" in world). The card windows on the Atlas
   engine highlight FACES of topology.bin by entity id, so this file is the join: layer → key → [entity id, label lon, lat, west, south, east, north] — the id of the
   admin-0 or admin-1 entity that is the same place, the label point the opening view centres on, and the bounding box of the rings NEAR the label point (the fit reads its
   zoom off that box exactly as startCardGlobe's `fitTarget` reads it off the shape: Alaska's far Aleutians do not frame the Pacific) — and, per layer, the DOT table
   (the capitals and cities a card may mark: name → [lon, lat]) so the window needs none of the old shape bundles (usstates, chinaprov, russubj, world, worldcaps).
   HOW A KEY MEETS AN ENTITY. us-states, china-provinces and russia-subjects: the layer's own two-letter code against the entity's `iso` (US-AL, CN-XJ, RU-AL), a few by name; world: by
   the folded name, and for the 53 names Natural Earth's two files spell differently (world.js's "Dem. Rep. Congo", the engine's "Democratic Republic of the Congo") by ALIASES
   below. The pairing must be one to one, every key of every layer must resolve, and every map card's layer, keys and dot must be in the file — or this exits 1 naming each.
   The shape files are generated from Natural Earth (public domain), so `sources` lists the three Natural Earth files the engine's own entity table and the dots come from. */
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const HERE = __dirname, ROOT = path.join(HERE, "..", "..");
const F = require("./lib/format.js");
const { headerSources } = require("./fetch-sources.js");
const { loadCards } = require("../card-io.js");
const OUT = path.join(ROOT, "atlas", "data", "card-faces.js");
const header = F.read(fs.readFileSync(path.join(ROOT, "atlas", "data", "topology.bin")), { headerOnly: true }).header;
const ENT = header.entities;
const fold = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

/* world.js name → the engine's entity name, for every name the two Natural Earth files spell differently */
const ALIASES = {
  "Dhekelia": "Dhekelia Sovereign Base Area", "S. Sudan": "South Sudan", "Tanzania": "United Republic of Tanzania", "W. Sahara": "Western Sahara", "Congo": "Republic of the Congo",
  "Dem. Rep. Congo": "Democratic Republic of the Congo", "St-Martin": "Saint Martin", "Central African Rep.": "Central African Republic", "Côte d'Ivoire": "Ivory Coast", "Serbia": "Republic of Serbia",
  "Dominican Rep.": "Dominican Republic", "Timor-Leste": "East Timor", "Bosnia and Herz.": "Bosnia and Herzegovina", "USNB Guantanamo Bay": "US Naval Base Guantanamo Bay", "Brazilian I.": "Brazilian Island",
  "Eq. Guinea": "Equatorial Guinea", "Hong Kong": "Hong Kong S.A.R.", "N. Cyprus": "Northern Cyprus", "Cyprus U.N. Buffer Zone": "Cyprus No Mans Area", "Baikonur": "Baykonur Cosmodrome",
  "Akrotiri": "Akrotiri Sovereign Base Area", "Bahamas": "The Bahamas", "Turks and Caicos Is.": "Turks and Caicos Islands", "St. Pierre and Miquelon": "Saint Pierre and Miquelon", "Pitcairn Is.": "Pitcairn Islands",
  "Fr. Polynesia": "French Polynesia", "Fr. S. Antarctic Lands": "French Southern and Antarctic Lands", "Marshall Is.": "Marshall Islands", "St. Vin. and Gren.": "Saint Vincent and the Grenadines",
  "U.S. Minor Outlying Is.": "United States Minor Outlying Islands", "Antigua and Barb.": "Antigua and Barbuda", "St. Kitts and Nevis": "Saint Kitts and Nevis", "U.S. Virgin Is.": "United States Virgin Islands",
  "St-Barthélemy": "Saint Barthelemy", "British Virgin Is.": "British Virgin Islands", "Cayman Is.": "Cayman Islands", "Heard I. and McDonald Is.": "Heard Island and McDonald Islands", "Faeroe Is.": "Faroe Islands",
  "Indian Ocean Ter.": "Indian Ocean Territories", "Br. Indian Ocean Ter.": "British Indian Ocean Territory", "Cook Is.": "Cook Islands", "Wallis and Futuna Is.": "Wallis and Futuna", "Solomon Is.": "Solomon Islands",
  "Micronesia": "Federated States of Micronesia", "S. Geo. and the Is.": "South Georgia and the Islands", "Falkland Is.": "Falkland Islands", "N. Mariana Is.": "Northern Mariana Islands", "Coral Sea Is.": "Coral Sea Islands",
  "Spratly Is.": "Spratly Islands", "Clipperton I.": "Clipperton Island", "Macao": "Macao S.A.R", "Ashmore and Cartier Is.": "Ashmore and Cartier Islands", "Bajo Nuevo Bank": "Bajo Nuevo Bank (Petrel Is.)",
};
/* the layer's own name → the engine's, where the iso code does not carry it (Natural Earth's two spellings of a province) */
const NAME_ALIASES = { "china-provinces": { "Inner Mongolia": "Inner Mongol", "Tibet": "Xizang" } };
const LAYERS = [
  { layer: "us-states", file: "us-states.js", global: "US_STATES", iso: "US-", kind: "admin1", dots: [["US_CAPITALS", "us-states.js"], ["US_CITIES", "us-cities.js"]] },
  { layer: "china-provinces", file: "china-provinces.js", global: "CHINA_PROVINCES", iso: "CN-", kind: "admin1", dots: [["CHINA_CAPITALS", "china-provinces.js"]] },
  { layer: "russia-subjects", file: "russia-subjects.js", global: "RUSSIA_SUBJECTS", iso: "RU-", kind: "admin1", dots: [["RUSSIA_CENTRES", "russia-subjects.js"]] },
  { layer: "world", file: "world.js", global: "WORLD_GEO", kind: "admin0", dots: [["WORLD_CAPITALS", "world-capitals.js"]] },
];
const loadWin = (file) => { const p = path.join(ROOT, file); delete require.cache[require.resolve(p)]; global.window = {}; require(p); return global.window; };   // a file read twice (a layer and its dots) must run twice
const bbox = (ring) => { let x0 = 180, y0 = 90, x1 = -180, y1 = -90; for (const p of ring) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; } return [x0, y0, x1, y1, (x0 + x1) / 2, (y0 + y1) / 2]; };
const r3 = (v) => Math.round(v * 1000) / 1000;

function build() {
  const problems = [], layers = {}, dots = {};
  const byName = new Map(ENT.filter((e) => e.id.startsWith("adm0:")).map((e) => [fold(e.name), e]));
  const byIso = new Map(ENT.filter((e) => e.iso).map((e) => [e.iso.toUpperCase(), e]));
  const byName1 = new Map(ENT.filter((e) => e.kind === "admin1").map((e) => [fold(e.name), e]));
  const usedIds = new Set();
  for (const L of LAYERS) {
    const list = loadWin(L.file)[L.global];
    if (!Array.isArray(list)) { problems.push(L.layer + ": " + L.file + " does not define " + L.global); continue; }
    const out = layers[L.layer] = {}, ids = new Set();
    for (const st of list) {
      let ent = null;
      if (L.layer === "world") { const nm = ALIASES[st.n] || st.n; ent = byName.get(fold(nm)); }
      else { ent = st.a ? byIso.get(L.iso + String(st.a).toUpperCase()) : null; if (!ent) ent = byName1.get(fold((NAME_ALIASES[L.layer] || {})[st.n] || st.n)); }
      if (!ent) { problems.push(`${L.layer}: "${st.n}" matches no engine entity`); continue; }
      if (L.layer !== "world" && ent.kind !== "admin1") { problems.push(`${L.layer}: "${st.n}" matched ${ent.id}, which is not admin-1`); continue; }
      if (ids.has(ent.id)) problems.push(`${L.layer}: "${st.n}" and another key both match ${ent.id}`);
      ids.add(ent.id);
      const near = st.p.filter((ring) => { const b = bbox(ring); return Math.abs(b[4] - st.c[0]) < 25 && Math.abs(b[5] - st.c[1]) < 25; });
      const rings = near.length ? near : st.p;
      let x0 = 180, y0 = 90, x1 = -180, y1 = -90; for (const ring of rings) { const b = bbox(ring); if (b[0] < x0) x0 = b[0]; if (b[1] < y0) y0 = b[1]; if (b[2] > x1) x1 = b[2]; if (b[3] > y1) y1 = b[3]; }
      out[st.n] = [ent.id, r3(st.c[0]), r3(st.c[1]), r3(x0), r3(y0), r3(x1), r3(y1)];
    }
    const d = dots[L.layer] = {};
    for (const [g, file] of L.dots) { const T = loadWin(file)[g]; if (!T) { problems.push(`${L.layer}: ${file} does not define ${g}`); continue; } for (const [name, v] of Object.entries(T)) if (!d[name]) d[name] = v.n ? [v.c[0], v.c[1], v.s || "", v.n] : [v.c[0], v.c[1], v.s || ""]; }
  }
  // every map card's layer, keys and dot are in the file
  const cards = loadCards().cards || loadCards();
  let nMap = 0;
  for (const c of cards) {
    if (!c.map) continue; nMap++;
    const lay = layers[c.map.layer]; if (!lay) { problems.push(`${c.id}: layer ${c.map.layer} is not built`); continue; }
    for (const k of [].concat(c.map.key)) if (!lay[k]) problems.push(`${c.id}: key "${k}" is not in ${c.map.layer}`);
    if (c.map.dot && !dots[c.map.layer][c.map.dot]) problems.push(`${c.id}: dot "${c.map.dot}" is not in ${c.map.layer}'s dots`);
  }
  return { layers, dots, problems, nMap };
}
/* WATER-SUBJECT CARDS (Phase 4c, the owner's decision): a locator window draws its rivers at the Atlas's density, and a card whose subject is water gets one resident level finer
   (atlas-windows.js). WHICH cards: the kind of the registry row (`.claude/places-registry.js`: gazetteer, places.js) of the locator's place — river, lake, sea, ocean, strait or gulf (the
   registry's word for a bay) — where the place is the card's own `places` id whose name or alias is the locator's name, else its first. A name is read ONLY for a locator with NO resolved place:
   then a river or sea locator (the card's own declared kind, `declared`) and a point locator whose name has lake / lagoon / loch / lough / bay / gulf / strait / channel / sea / river in it
   (`byName`, the fallback; the build prints the cards). The windows read `water.cards`; they carry no name test of their own. */
function waterCards() {
  const R = require(path.join(ROOT, ".claude", "places-registry.js")), reg = R.loadRegistry();
  const WATER = new Set(["river", "lake", "sea", "ocean", "strait", "gulf"]), NAME = /\b(lake|lagoon|loch|lough|bay|gulf|strait|channel|sea|river)\b/i;
  const registry = [], declared = [], byName = [];
  for (const c of (loadCards().cards || loadCards())) {
    if (!c.locator) continue;
    const kind = c.locator.kind || "point", rows = (c.places || []).map((id) => reg.rows.get(id)).filter(Boolean);
    if (rows.length) {
      const f = R.fold(c.locator.name || ""), pick = rows.find((q) => R.fold(q.name || "") === f || (q.aliases || []).some((a) => R.fold(a) === f)) || rows[0];
      if (WATER.has(pick.kind)) registry.push(c.id);
    } else if (kind === "river" || kind === "sea") declared.push(c.id);
    else if (kind === "point" && NAME.test(c.locator.name || "")) byName.push(c.id);
  }
  const sort = (l) => l.slice().sort();
  return { cards: sort(registry.concat(declared, byName)), registry: registry.length, declared: sort(declared), byName: sort(byName) };
}
const W = waterCards();
const r = build();
if (r.problems.length) { console.error("build-card-faces: " + r.problems.length + " problems\n  " + r.problems.slice(0, 40).join("\n  ")); process.exit(1); }
const payload = { format: 1, layers: r.layers, dots: r.dots, water: { cards: W.cards, declared: W.declared, byName: W.byName } };
const json = JSON.stringify(payload).replace(/\{"/g, '{\n"').replace(/\],"/g, '],\n"');
const digest = crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex").slice(0, 16);
const body = "/* sources: " + JSON.stringify(headerSources(["ne-10m-admin0", "ne-10m-admin1", "ne-10m-populated-places"])) + " */\n" +
  "/* atlas/data/card-faces.js — GENERATED by .claude/atlas-build/build-card-faces.js (docs/atlas-v2-card-windows.md). Do not edit. For the map cards on the Atlas engine: layer → key → [entity id,\n   label lon, lat, west, south, east, north] and the dot tables (capitals and cities: name → [lon, lat, state]), and `water` — the locator cards whose subject is water (a registry kind of river / lake / sea / ocean / strait / gulf for the locator's place; `declared` and `byName` are the fallbacks for a locator with no resolved place). From Natural Earth (public domain) through the v1 shape files. */\n" +
  "window.ATLAS_CARD_FACES = " + json.replace(/^\{"format":1,/, '{"format":1,"digest":"' + digest + '",') + ";\n";
if (process.argv.includes("--check")) {
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
  if (cur !== body) { console.error("atlas/data/card-faces.js lags its inputs: run build-card-faces.js --install"); process.exit(1); }
  console.log("water-subject locators: " + W.cards.length + " — " + W.registry + " by the registry kind of their place, " + W.declared.length + " by a declared river or sea kind with no resolved place, " + W.byName.length + " by the name fallback (" + W.byName.join(", ") + ")");
  console.log("build-card-faces --check ok: " + r.nMap + " map cards resolve, " + Object.values(r.layers).reduce((n, l) => n + Object.keys(l).length, 0) + " keys");
} else if (process.argv.includes("--install")) { fs.writeFileSync(OUT, body); console.log("wrote atlas/data/card-faces.js (" + body.length + " bytes); " + r.nMap + " map cards resolve; water-subject locators " + W.cards.length + " (registry " + W.registry + ", declared kind " + W.declared.length + ", name fallback " + W.byName.length + ")"); }
else process.stdout.write(body);
