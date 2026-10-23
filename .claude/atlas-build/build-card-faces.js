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
   The shape files are generated from Natural Earth (public domain), so `sources` lists the three Natural Earth files the engine's own entity table and the dots come from.

   PHASE 5: the v1 shape files (world.js, us-states.js, china-provinces.js, russia-subjects.js, world-capitals.js, us-cities.js) are gone. Their names, label points, near-ring boxes, dot tables and neighbour
   lists were frozen ONCE into .claude/atlas-build/frozen/layers.json (freeze-v1.js, docs/atlas-v2-phase5-plan.md §4.6), and this builder reads that: the join to the engine's entity table, and every check
   below, are unchanged. A world row gains an 8th element, the largest ring's bounding-box area (Find it's size filter); the neighbour lists the "describe the map" setting prints go to their own lazy file,
   atlas/data/card-neighbours.js. */
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const HERE = __dirname, ROOT = path.join(HERE, "..", "..");
const F = require("./lib/format.js");
const { headerSources } = require("./fetch-sources.js");
const { loadCards } = require("../card-io.js");
const OUT = path.join(ROOT, "atlas", "data", "card-faces.js"), NBR_OUT = path.join(ROOT, "atlas", "data", "card-neighbours.js");
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
/* the engine's admin-1 entities carry Natural Earth's iso, which has Russia's two Moscow codes the wrong way round (RU-MOS on the city, RU-MOW on the oblast; ISO 3166-2 and the layer's own codes
   say the opposite — docs/russia-geography-card-plan.md "Natural Earth has the two Moscow codes the wrong way round"), so these two keys are joined through the engine's own iso, not theirs */
const ISO_OVERRIDES = { "russia-subjects": { MOS: "RU-MOW", MOW: "RU-MOS" } };
const FROZEN = JSON.parse(fs.readFileSync(path.join(HERE, "frozen", "layers.json"), "utf8")).layers;
const LAYERS = [
  { layer: "us-states", iso: "US-", kind: "admin1" },
  { layer: "china-provinces", iso: "CN-", kind: "admin1" },
  { layer: "russia-subjects", iso: "RU-", kind: "admin1" },
  { layer: "world", kind: "admin0" },
];
const r3 = (v) => Math.round(v * 1000) / 1000;

function build() {
  const problems = [], layers = {}, dots = {};
  const byName = new Map(ENT.filter((e) => e.id.startsWith("adm0:")).map((e) => [fold(e.name), e]));
  const byIso = new Map(ENT.filter((e) => e.iso).map((e) => [e.iso.toUpperCase(), e]));
  const byName1 = new Map(ENT.filter((e) => e.kind === "admin1").map((e) => [fold(e.name), e]));
  const usedIds = new Set();
  const nbrs = {};
  for (const L of LAYERS) {
    const FZ = FROZEN[L.layer];
    if (!FZ) { problems.push(L.layer + ": frozen/layers.json has no such layer"); continue; }
    const out = layers[L.layer] = {}, ids = new Set();
    for (const st of FZ.keys) {
      let ent = null;
      if (L.layer === "world") { const nm = ALIASES[st.n] || st.n; ent = byName.get(fold(nm)); }
      else { ent = st.a ? byIso.get((ISO_OVERRIDES[L.layer] || {})[String(st.a).toUpperCase()] || L.iso + String(st.a).toUpperCase()) : null; if (!ent) ent = byName1.get(fold((NAME_ALIASES[L.layer] || {})[st.n] || st.n)); }
      if (!ent) { problems.push(`${L.layer}: "${st.n}" matches no engine entity`); continue; }
      if (L.layer !== "world" && ent.kind !== "admin1") { problems.push(`${L.layer}: "${st.n}" matched ${ent.id}, which is not admin-1`); continue; }
      if (ids.has(ent.id)) problems.push(`${L.layer}: "${st.n}" and another key both match ${ent.id}`);
      ids.add(ent.id);
      out[st.n] = [ent.id, st.c[0], st.c[1], st.box[0], st.box[1], st.box[2], st.box[3]];
      if (L.layer === "world") out[st.n].push(st.area);
    }
    dots[L.layer] = Object.assign({}, FZ.dots);
    nbrs[L.layer] = FZ.neighbours;
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
  return { layers, dots, problems, nMap, nbrs };
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
/* the "describe the map" sentence's data (Settings → Describe geography maps): layer → the card's key (a shape's name, or a key-list joined by "|") → the names of the shapes it borders, among that layer's own shapes.
   Lazy: only a reader who switched the setting on fetches it. Frozen from the shapes by freeze-v1.js (the proximity-on-a-grid rule, two cells to count). */
const nbrBody = "/* sources: " + JSON.stringify(headerSources(["ne-10m-admin0", "ne-10m-admin1"])) + " */\n" +
  "/* atlas/data/card-neighbours.js — GENERATED by .claude/atlas-build/build-card-faces.js from frozen/layers.json. Do not edit. layer → map-card key → the shapes it borders on that layer's own map (the sentence the\n   \"Describe geography maps\" setting prints under a map card). */\n" +
  "window.ATLAS_CARD_NEIGHBOURS = " + JSON.stringify({ format: 1, layers: r.nbrs }).replace(/\],"/g, '],\n"') + ";\n";
if (process.argv.includes("--check")) {
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "", curN = fs.existsSync(NBR_OUT) ? fs.readFileSync(NBR_OUT, "utf8") : "";
  if (cur !== body) { console.error("atlas/data/card-faces.js lags its inputs: run build-card-faces.js --install"); process.exit(1); }
  if (curN !== nbrBody) { console.error("atlas/data/card-neighbours.js lags its inputs: run build-card-faces.js --install"); process.exit(1); }
  console.log("water-subject locators: " + W.cards.length + " — " + W.registry + " by the registry kind of their place, " + W.declared.length + " by a declared river or sea kind with no resolved place, " + W.byName.length + " by the name fallback (" + W.byName.join(", ") + ")");
  console.log("build-card-faces --check ok: " + r.nMap + " map cards resolve, " + Object.values(r.layers).reduce((n, l) => n + Object.keys(l).length, 0) + " keys");
} else if (process.argv.includes("--install")) { fs.writeFileSync(OUT, body); fs.writeFileSync(NBR_OUT, nbrBody); console.log("wrote atlas/data/card-faces.js (" + body.length + " bytes); " + r.nMap + " map cards resolve; water-subject locators " + W.cards.length + " (registry " + W.registry + ", declared kind " + W.declared.length + ", name fallback " + W.byName.length + ")"); }
else process.stdout.write(body);
