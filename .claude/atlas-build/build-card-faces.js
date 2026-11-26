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
   atlas/data/card-neighbours.js.

   THE STATES OF THE PAST (2026-11-19, the Historical States collection; docs/historical-states-card-plan.md). The layer `past-states` is read off atlas/data/history.bin, not off a shape file: one key per
   polity of the history (kind `polity`, less the 1920 `snapshot` series of .claude/polity-spec.json, which exist for one card's borders), named as the Atlas names it IN THE YEAR OF ITS GREATEST EXTENT
   (atlas/data/polity-names.js: "Roman Empire" for pol:rome at 117). The row is [entity id, label lon, lat, west, south, east, north, YEAR, view lon, view lat, zoom]: the year, the zoom and the box are
   build-glossary-places.js `entityExtent` — the glossary windows' own rule, so a term's window and a card's window of one state agree on the year — the view's centre is the middle of that box, and the label point is the anchor of
   the largest face alive that year (a point inside the state). The window draws the whole history at that year and tints the entity (atlas-windows.js `pastLayer`). Its neighbours for the
   "describe the map" sentence are EXACT: the other polities whose faces of that year share an arc with one of its own, by the names they carry that year. */
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
// the layers whose units are in atlas/data/admin1.bin (docs/atlas-v2-admin1-layer.md), one per country of admin1-spec.json
const ADMIN1_LAYERS = [{ layer: "india-states", a3: "IND", parent: "adm0:ind" }];
/* the layers read off atlas/data/history.bin: the states of the past, each at the year of its greatest extent (the header above) */
const PAST_LAYERS = [{ layer: "past-states" }];
const Lbl = require("./lib/label.js");
const EXTRACT = JSON.parse(fs.readFileSync(path.join(HERE, "admin1-source.json"), "utf8")), SPEC = JSON.parse(fs.readFileSync(path.join(HERE, "admin1-spec.json"), "utf8"));
/* the seats' coordinates are Wikidata's (admin1-capitals.json, fetched 2026-11-14): a source block of its own, as build-places.js writes for its Wikidata items */
const WD_SEATS = (() => { const c = JSON.parse(fs.readFileSync(path.join(HERE, "admin1-capitals.json"), "utf8")); return { id: "wikidata-admin1-seats", name: "Wikidata — the seats of the admin-1 units in atlas/data/admin1.bin: each seat's coordinate (P625 of the item its unit's P36 names)", version: "fetched " + c.retrieved + " through query.wikidata.org", url: "https://query.wikidata.org/", licence: "CC0", licenceUrl: "https://creativecommons.org/publicdomain/zero/1.0/", attribution: "Wikidata, CC0 1.0", retrieved: c.retrieved, sha256: null }; })();

function build() {
  const problems = [], layers = {}, dots = {};
  const byName = new Map(ENT.filter((e) => e.id.startsWith("adm0:")).map((e) => [fold(e.name), e]));
  const byIso = new Map(ENT.filter((e) => e.iso).map((e) => [e.iso.toUpperCase(), e]));
  const byName1 = new Map(ENT.filter((e) => e.kind === "admin1").map((e) => [fold(e.name), e]));
  const usedIds = new Set();
  const nbrs = {}, pastYears = {};
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
  /* THE LAYERS OF THE LAZY ADMIN-1 FILE (2026-11-14; docs/atlas-v2-admin1-layer.md §3.2, step 2). A country the core does not carry has its units in atlas/data/admin1.bin, and its layer is read
     from that file, not from frozen/layers.json (which is v1's snapshot): key = the unit's declared name, the row its entity id, its label point (faceAnchor) and the bounding box of its
     rings at LOD 2; the dot table is admin1-capitals.json (the seats, coordinates fetched from Wikidata), each dot filed under the unit it stands in; the neighbours are EXACT —
     two units that share an inner line of the file. */
  for (const AL of ADMIN1_LAYERS) {
    const A = F.read(new Uint8Array(fs.readFileSync(path.join(ROOT, "atlas", "data", "admin1.bin"))));
    const out = layers[AL.layer] = {}, nb = {}, ids = new Set();
    const ents = A.header.entities;
    const faceOf = new Map(); A.faces.forEach((f, fi) => faceOf.set(ents[f.entity].id, fi));
    const arcUnits = new Map();
    A.faces.forEach((f, fi) => { for (const ring of f.rings) for (const ref of ring) { const a = Math.abs(ref) - 1; if (A.coreArc[a] >= 0) continue; let s = arcUnits.get(a); if (!s) arcUnits.set(a, s = new Set()); s.add(fi); } });
    for (let ei = 0; ei < ents.length; ei++) {
      const e = ents[ei]; if (e.parent !== AL.parent) continue;
      const fi = faceOf.get(e.id); if (fi == null) { problems.push(`${AL.layer}: ${e.name} has no face in admin1.bin`); continue; }
      if (usedIds.has(e.id) || ids.has(e.id)) problems.push(`${AL.layer}: ${e.id} twice`); ids.add(e.id);
      // the box and the label point from Natural Earth's own rings (public domain, as every other row of this file), not from admin1.bin's, which reference the OSM coast
      const rings = (EXTRACT.countries[AL.a3] || {})[e.iso]; if (!rings) { problems.push(`${AL.layer}: admin1-source.json has no rings for ${e.iso}`); continue; }
      const drops = (SPEC.countries.find((c) => c.a3 === AL.a3).dropRings || []).filter((d) => d.iso === e.iso);
      const pts = rings.map((flat) => { const out = [[flat[0], flat[1]]]; for (let j = 2; j < flat.length; j += 2) out.push([out[out.length - 1][0] + flat[j], out[out.length - 1][1] + flat[j + 1]]); return out.map((p) => [p[0] * EXTRACT.quantum, p[1] * EXTRACT.quantum]); })
        .filter((r) => !drops.some((d) => r.every((p) => p[0] >= d.within[0] && p[0] <= d.within[2] && p[1] >= d.within[1] && p[1] <= d.within[3])));
      let x0 = 180, y0 = 90, x1 = -180, y1 = -90;
      for (const r of pts) for (const [x, y] of r) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      const big = pts.slice().sort((a, b) => Math.abs(Lbl.labelGeometry([b]).areaKm2) - Math.abs(Lbl.labelGeometry([a]).areaKm2))[0];
      const at = Lbl.labelGeometry([big]).at;
      out[e.name] = [e.id, r3(at[0]), r3(at[1]), r3(x0), r3(y0), r3(x1), r3(y1)];
      const notNb = [].concat(...(SPEC.countries.find((c) => c.a3 === AL.a3).knownFaults || []).map((k) => k.notNeighbours || []));   // a pair the source makes neighbours wrongly (admin1-spec.json knownFaults)
      const n = new Set(); for (const [, s] of arcUnits) if (s.has(fi)) for (const o of s) if (o !== fi) { const oe = ents[A.faces[o].entity]; if (!notNb.some((p) => (p[0] === e.iso && p[1] === oe.iso) || (p[1] === e.iso && p[0] === oe.iso))) n.add(oe.name); }
      nb[e.name] = [...n].sort((a, b) => a.localeCompare(b));
    }
    const caps = JSON.parse(fs.readFileSync(path.join(HERE, "admin1-capitals.json"), "utf8")).countries[AL.a3] || {};
    const byIso = new Map(ents.map((e) => [e.iso, e]));
    const D = dots[AL.layer] = {};
    for (const [iso, c] of Object.entries(caps)) {
      const inUnit = byIso.get(c.inUnit || iso); if (!inUnit) { problems.push(`${AL.layer}: the seat ${c.name} names no unit ${c.inUnit || iso}`); continue; }
      const row = [c.lon, c.lat, inUnit.name];
      if (D[c.name] && JSON.stringify(D[c.name]) !== JSON.stringify(row)) problems.push(`${AL.layer}: two seats named ${c.name} at different points`);
      D[c.name] = row;
    }
    nbrs[AL.layer] = nb;
  }
  for (const PL of PAST_LAYERS) {
    const AF = require(path.join(ROOT, "atlas", "atlas-format.js")), { entityExtent } = require("./build-glossary-places.js");
    const HT = AF.read(new Uint8Array(fs.readFileSync(path.join(ROOT, "atlas", "data", "history.bin")))), H = HT.header;
    const spec = JSON.parse(fs.readFileSync(path.join(ROOT, ".claude", "polity-spec.json"), "utf8")).polities;
    const PN = (() => { const g = {}; new Function("window", fs.readFileSync(path.join(ROOT, "atlas", "data", "polity-names.js"), "utf8"))(g); return g.ATLAS_POLITY_NAMES.names; })();
    const nameAt = (e, y) => { const r = (PN[e.id] || []).find((q) => q[0] <= y && y <= q[1]); return r ? r[2] : e.name; };
    const isState = (e) => e.kind === "polity" && !((spec[e.id.replace(/^pol:/, "")] || {}).snapshot);
    const out = layers[PL.layer] = {}, nb = {}, rowOf = new Map();
    for (const e of H.entities) {
      if (!isState(e)) continue;
      const x = entityExtent(HT, e.id); if (!x || !x.box) { problems.push(`${PL.layer}: ${e.id} has no step in history.bin`); continue; }
      const key = nameAt(e, x.year);
      if (out[key]) { problems.push(`${PL.layer}: "${key}" names ${out[key][0]} and ${e.id}`); continue; }
      if (key.indexOf("|") >= 0) { problems.push(`${PL.layer}: "${key}" contains a pipe`); continue; }
      /* the view's centre: the middle of the frame, where the frame is less than half the globe wide (the glossary window's centre is the area-weighted mean of the faces' anchors, which for a
         state of ONE face is that face's label point — Rome's is in the Po valley); a state that spans more (the Spanish and Portuguese empires) keeps the weighted centre and the widest zoom */
      const wide = x.box[2] - x.box[0] >= 180, wrap = (v) => ((v + 180) % 360 + 360) % 360 - 180;
      const vlon = wide ? x.lon : wrap((x.box[0] + x.box[2]) / 2), vlat = wide ? x.lat : (x.box[1] + x.box[3]) / 2;
      out[key] = [e.id, r3(x.at[0]), r3(x.at[1]), r3(x.box[0]), r3(x.box[1]), r3(x.box[2]), r3(x.box[3]), x.year, r3(vlon), r3(vlat), Math.round(x.zoom * 100) / 100];
      rowOf.set(e.id, { key, year: x.year });
    }
    /* the neighbours, exact: at the state's year, every other polity one of whose faces alive then shares an arc with one of the state's own (a contested or nested face counts for the state it
       is shared with or belongs to — entityExtent's own rule — and names nobody) */
    const arcsOf = (fi) => { const a = new Set(); for (const ring of HT.faces[fi].rings) for (const ref of ring) a.add(Math.abs(ref) - 1); return a; };
    for (const [id, r] of rowOf) {
      const alive = H.steps.filter((st) => st[1] <= r.year && r.year <= st[2]);
      const ownerOf = (st) => { const o = H.entities[st[0]]; return o.kind === "polity" ? [o] : o.kind === "contested" || o.kind === "nested" ? (o.partners || []).slice(0, o.kind === "nested" ? 1 : 9).map((pid) => H.entities.find((q) => q.id === pid)).filter(Boolean) : []; };
      const mine = new Set(); for (const st of alive) if (ownerOf(st).some((o) => o.id === id)) for (const a of arcsOf(st[3])) mine.add(a);
      const n = new Set();
      for (const st of alive) { const os = ownerOf(st).filter((o) => o.id !== id && o.kind === "polity"); if (!os.length) continue; let touch = false; for (const a of arcsOf(st[3])) if (mine.has(a)) { touch = true; break; } if (touch) for (const o of os) n.add(nameAt(o, r.year)); }
      nb[r.key] = [...n].sort((a, b) => a.localeCompare(b));
    }
    dots[PL.layer] = {};
    nbrs[PL.layer] = nb;
    /* a card of the layer says its year in its question ("In 117 CE, the state highlighted on the map was _____."): the year is this file's, so a rebuild of history.bin that moves a state's
       greatest extent fails here until the card's question is rewritten */
    pastYears[PL.layer] = (c, keys) => { for (const k of keys) { const row = out[k]; if (!row) continue; const y = row[7], want = y < 0 ? -y + " BCE" : y < 1000 ? y + " CE" : String(y); const q = String(c.question || "").replace(/<[^>]+>/g, " "); if (!new RegExp("(^|[^0-9,])" + want.replace(/ /g, "\\s") + "([^0-9]|$)").test(q)) problems.push(`${c.id}: its question does not name ${want}, the year ${k} is drawn at (${PL.layer})`); } };
  }
  // every map card's layer, keys and dot are in the file
  const cards = loadCards().cards || loadCards();
  let nMap = 0;
  for (const c of cards) {
    if (!c.map) continue; nMap++;
    const lay = layers[c.map.layer]; if (!lay) { problems.push(`${c.id}: layer ${c.map.layer} is not built`); continue; }
    /* a map card's keys: its authored `map.key`, else (2026-11-15, .claude/map-places.js) every id of its `places` that is an entity of this layer, by its key here — the rule app.js `cardMapKeys` reads */
    let keys = c.map.key != null ? [].concat(c.map.key) : null;
    if (!keys) { const inv = new Map(Object.entries(lay).map(([k, row]) => [row[0], k])); keys = (c.places || []).slice().sort().filter((id) => inv.has(id)).map((id) => inv.get(id)); if (!keys.length) problems.push(`${c.id}: no map.key, and no id of its places is a shape of ${c.map.layer}`); }
    for (const k of keys) if (!lay[k]) problems.push(`${c.id}: key "${k}" is not in ${c.map.layer}`);
    if (c.map.dot && !dots[c.map.layer][c.map.dot]) problems.push(`${c.id}: dot "${c.map.dot}" is not in ${c.map.layer}'s dots`);
    if (pastYears[c.map.layer]) pastYears[c.map.layer](c, keys);
  }
  return { layers, dots, problems, nMap, nbrs };
}
/* WATER-SUBJECT CARDS (Phase 4c, the owner's decision): a locator window draws its rivers at the Atlas's density, and a card whose subject is water gets one resident level finer
   (atlas-windows.js). WHICH cards: the kind of the registry row (`.claude/places-registry.js`: gazetteer, places.js) of the locator's place — river, lake, sea, ocean, strait or gulf (the
   registry's word for a bay) — where the place is the card's own `places` id whose name or alias is the locator's name, else its first. A name is read ONLY for a locator with NO resolved place:
   then a river or sea locator (the card's own declared kind, `declared`) and a point locator whose name has lake / lagoon / loch / lough / bay / gulf / strait / channel / sea / river in it
   (`byName`, the fallback; the build prints the cards). The windows read `water.cards`; they carry no name test of their own.
   THE OWN MARK'S SHAPE (2026-11-14, the owner: "'Aegean Sea' should not be a dot", "make the symbol for Mount Olympus … a mountain (triangle)"): `marks.water` is the
   locators whose place's REGISTRY kind is water (the same pick), and of the name fallback only a name that BEGINS or ENDS with the water word ("Caspian Sea",
   "Lake Onega", "River Deben"; not "Operation Sea Lion" or "Fish River Canyon"; a ", <place>" qualifier set aside) — the window draws no dot for them and writes the name as a
   water name, blue and italic — `marks.rings` those of them whose locator name is a water outline of Find it's table (atlas/data/findit-waters.js: the window shades it,
   fetching that file only for these), and `marks.peak` those whose place is a mountain or a hill, whose own mark is the Atlas's peak triangle (study.js markClass).
   THE CAPITAL'S SQUARE (2026-11-20, the owner: "Ensure Rome and Athens always have square icons instead of dots in atlas windows"): `marks.capital` is the locators whose
   place — the registry row whose name or alias IS the locator's name — is of kind `capital` (a present-day national capital — the glossary windows' rule of 2026-11-16, applied to the cards): the window draws its own mark, a studied
   sibling at it and an `also` entry of the same name as the capital's square (atlas-windows.js `capitalCard` / `capitalName`). */
function waterCards() {
  const R = require(path.join(ROOT, ".claude", "places-registry.js")), reg = R.loadRegistry();
  const WATER = new Set(["river", "lake", "sea", "ocean", "strait", "gulf"]), NAME = /\b(lake|lagoon|loch|lough|bay|gulf|strait|channel|sea|river)\b/i;
  const registry = [], declared = [], byName = [], peak = [], nameWater = [], capital = [];
  const byId = new Map((loadCards().cards || loadCards()).map((c) => [c.id, c]));
  const FW = (() => { const g = { window: {} }; new Function("window", fs.readFileSync(path.join(ROOT, "atlas", "data", "findit-waters.js"), "utf8"))(g.window); return g.window.ATLAS_FINDIT_WATERS.waters; })();
  const EDGE = /^(lake|lagoon|loch|lough|bay|gulf|strait|sea|river)\b|\b(lake|lagoon|loch|lough|bay|gulf|strait|sea|river)$/i;
  for (const c of (loadCards().cards || loadCards())) {
    if (!c.locator) continue;
    const kind = c.locator.kind || "point", rows = (c.places || []).map((id) => reg.rows.get(id)).filter(Boolean);
    if (rows.length) {
      const f = R.fold(c.locator.name || ""), named = rows.find((q) => R.fold(q.name || "") === f || (q.aliases || []).some((a) => R.fold(a) === f)), pick = named || rows[0];
      if (WATER.has(pick.kind)) registry.push(c.id);
      else if (pick.kind === "mountain" || pick.kind === "hill") peak.push(c.id);
      else if (named && named.kind === "capital") capital.push(c.id);   // only a locator NAMED as the capital (its name or an alias): not the Forum, the pomerium or Arpinum, whose first place is Rome
    } else if (kind === "river" || kind === "sea") declared.push(c.id);
    else if (kind === "point" && NAME.test(c.locator.name || "")) { byName.push(c.id); if (EDGE.test(String(c.locator.name).split(",")[0].trim())) nameWater.push(c.id); }
  }
  const sort = (l) => l.slice().sort();
  return { cards: sort(registry.concat(declared, byName)), registry: registry.length, declared: sort(declared), byName: sort(byName), marks: { water: sort(registry.concat(nameWater)), rings: sort(registry.concat(nameWater).filter((id) => FW[String((byId.get(id).locator || {}).name || "").trim().toLowerCase()])), peak: sort(peak), capital: sort(capital) } };
}
const W = waterCards();
const r = build();
if (r.problems.length) { console.error("build-card-faces: " + r.problems.length + " problems\n  " + r.problems.slice(0, 40).join("\n  ")); process.exit(1); }
const payload = { format: 1, layers: r.layers, dots: r.dots, water: { cards: W.cards, declared: W.declared, byName: W.byName }, marks: W.marks };
const json = JSON.stringify(payload).replace(/\{"/g, '{\n"').replace(/\],"/g, '],\n"');
const digest = crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex").slice(0, 16);
const body = "/* sources: " + JSON.stringify(headerSources(["ne-10m-admin0", "ne-10m-admin1", "ne-10m-populated-places", "cliopatria"]).concat([WD_SEATS])) + " */\n" +
  "/* atlas/data/card-faces.js — GENERATED by .claude/atlas-build/build-card-faces.js (docs/atlas-v2-card-windows.md). Do not edit. For the map cards on the Atlas engine: layer → key → [entity id,\n   label lon, lat, west, south, east, north] and the dot tables (capitals and cities: name → [lon, lat, state]), and `water` — the locator cards whose subject is water (a registry kind of river / lake / sea / ocean / strait / gulf for the locator's place; `declared` and `byName` are the fallbacks for a locator with no resolved place), and `marks` — the locators whose own mark is a water name (`water`) or a peak (`peak`), by the same registry kind. From Natural Earth (public domain) through the v1 shape files. The layer `past-states` is the states of atlas/data/history.bin (Cliopatria, CC BY 4.0), each at the year of its greatest extent: [entity id, label lon, lat, west, south, east, north, year, view lon, view lat, zoom]. */\n" +
  "window.ATLAS_CARD_FACES = " + json.replace(/^\{"format":1,/, '{"format":1,"digest":"' + digest + '",') + ";\n";
/* the "describe the map" sentence's data (Settings → Describe geography maps): layer → the card's key (a shape's name, or a key-list joined by "|") → the names of the shapes it borders, among that layer's own shapes.
   Lazy: only a reader who switched the setting on fetches it. Frozen from the shapes by freeze-v1.js (the proximity-on-a-grid rule, two cells to count). */
const nbrBody = "/* sources: " + JSON.stringify(headerSources(["ne-10m-admin0", "ne-10m-admin1", "cliopatria"])) + " */\n" +
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
