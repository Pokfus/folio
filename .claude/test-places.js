#!/usr/bin/env node
/* test-places.js — the places registry, the migration's resolver and the author tooling, without a browser (Atlas v2 Phase 3a;
   docs/atlas-v2-design.md §2.8, §7 "Phase 3a — as built").

     node .claude/test-places.js

   WHAT IT PROVES, each a fault nothing else would see:
     · THE REGISTRY LOADS AS ONE TABLE: the gazetteer, atlas/data/places.js and the history entity table, every id unique
       and well formed, every kind in the taxonomy, names folded for lookup (Athens by name; a polity by its entity id), the
       polity → cards links readable (cardsOf) and every linked card a real card;
     · PHASE 3b, THE OWNER'S TWO DECISIONS ON THE REGISTRY: candidates of one kind family (a capital, city, town, ancient city, polis
       — the settlement) within 25 km are ONE place (the nearest to the card's own coordinate), names kept as aliases; they are
       ambiguous only across kinds (an island and an ancient city) or beyond 25 km; a mint or a diocese is not a place; a period
       name within 2 km of a modern city is folded into it and never the gazetteer edited (the alias overlay); `mountain` and `cape`
       are registry kinds; a second run changes nothing;
     · THE RESOLVER NEVER GUESSES, on fixtures: a gazetteer row by name within the radius resolves; a homonym beyond it does not
       (Olympia in Washington is not Olympia in Elis); two rows within the radius are AMBIGUOUS, none chosen; a Wikidata title
       whose coordinate agrees becomes a `pl:q…` row with the kind its classes give; a title that is far yields to a unique item
       around the coordinate; a disambiguation page, an unmapped class and a state are UNRESOLVED with their reasons; the same
       input resolves to the same answer twice (idempotent);
     · THE MIGRATION IS ADDITIVE: every card's `locator`, `war` and `map` in data.js are byte-identical to the last commit's
       (or to FOLIO_PLACES_BASE=<commit>, how the Phase 3a run was proved against the main it branched from), and `places`
       never appears in data.js (it is heavy);
     · THE TOOLING REFUSES WHAT IT SHOULD: add-places.js refuses an id the registry lacks and a malformed id, writes nothing then,
       lists and finds; an add then a remove leaves the collection's heavy file byte-identical; add-place.js refuses a call
       without --qid / --kind / --reason before touching the network; build-places.js's row validation names each fault.

   Zero dependencies. Not part of the site. Re-run after touching places-registry.js, migrate-places.js, add-places.js,
   atlas-build/build-places.js, atlas-build/add-place.js or check-cards.js's rule 9. */
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const { spawnSync, execSync } = require("child_process");
const ROOT = path.join(__dirname, "..");
const R = require("./places-registry.js");
const M = require("./migrate-places.js");
const B = require("./atlas-build/build-places.js");
const { loadCards } = require("./card-io.js");
let pass = 0, fail = 0;
const check = (name, ok, detail) => { if (ok) { pass++; console.log("  ok    " + name + (detail ? "  (" + detail + ")" : "")); } else { fail++; console.log("  FAIL  " + name + (detail ? "  (" + detail + ")" : "")); } };
const sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
const run = (args) => spawnSync(process.execPath, args, { cwd: ROOT, encoding: "utf8" });

console.log("\n1) the registry\n");
const reg = R.loadRegistry();
check("the registry loads with more than 5,900 rows", reg.rows.size > 5900, String(reg.rows.size));
check("every id is well formed", [...reg.rows.keys()].every(R.validId));
check("every kind is in the taxonomy", [...reg.rows.values()].every((r) => R.KINDS.includes(r.kind)), [...new Set([...reg.rows.values()].map((r) => r.kind))].join(", "));
check("Athens resolves by folded name to the gazetteer's capital", (reg.byName.get("athens") || []).some((r) => r.id === "city:1159151545"));
check("Rome the polity is a row of kind polity with a span and cards", reg.rows.get("pol:rome") && reg.rows.get("pol:rome").kind === "polity" && Array.isArray(reg.rows.get("pol:rome").span) && reg.cardsOf("pol:rome").length > 0, reg.cardsOf("pol:rome").length + " cards");
const { cards, tree } = loadCards();
const cardIds = new Set(cards.map((c) => c.id));
const linked = reg.entities.filter((e) => e.kind === "polity" || e.kind === "people" || e.kind === "culture").flatMap((e) => e.cards || []);
check("every card a polity links is a real card", linked.every((id) => cardIds.has(id)), linked.length + " links");
check("the places file, when present, is read as part of the registry", !fs.existsSync(R.PLACES) || [...reg.rows.keys()].some((id) => id.startsWith("pl:q")), fs.existsSync(R.PLACES) ? "present" : "absent");

console.log("\n2) the resolver on fixtures\n");
function fixtureRegistry(rows) {
  const map = new Map(), byName = new Map();
  for (const r of rows) { map.set(r.id, r); for (const n of [r.name].concat(r.aliases || [])) { const k = R.fold(n); let l = byName.get(k); if (!l) byName.set(k, l = []); l.push(r); } }
  return { rows: map, byName, entities: [], source: (id) => (id.startsWith("pl:") ? "places" : "gazetteer"), cardsOf: () => [] };
}
const olympiaGR = [21.63, 37.64], olympiaWA = [-122.9, 47.04];
const fx = fixtureRegistry([
  { id: "city:1", name: "Olympia", kind: "town", at: olympiaWA, aliases: [] },
  { id: "city:2", name: "Athens", kind: "capital", at: [23.73, 37.98], aliases: ["Athinai"] },
  { id: "city:3", name: "Springfield", kind: "town", at: [10.00, 50.00], aliases: [] },
  { id: "city:4", name: "Springfield", kind: "town", at: [10.05, 50.02], aliases: [] },
  { id: "reg:5", name: "Thessaly", kind: "region", at: [22.2, 39.5], aliases: [] },
  { id: "pl:q99", name: "Known Site", kind: "site", at: [30, 30], qid: "Q99", aliases: [] },
]);
const cache = {
  titles: {
    "Knossos": { qid: "Q173527", coord: [25.1632, 35.298], classes: ["Q839954"], label: "Knossos" },
    "Olympia": { qid: "Q5767", coord: [-122.9, 47.04], classes: ["Q515"], label: "Olympia" },
    "Folsom": { qid: "Q257124", coord: null, classes: ["Q4167410"], label: "Folsom" },
    "Falernian wine": { qid: "Q1", coord: [14.1, 41.2], classes: ["Q999"], label: "Falernian wine" },
    "Nanyue": { qid: "Q2", coord: [113, 23], classes: ["Q3024240"], label: "Nanyue" },
    "Known Site": { qid: "Q99", coord: [30, 30], classes: ["Q839954"], label: "Known Site" },
  },
  around: {
    [olympiaGR[0].toFixed(3) + "," + olympiaGR[1].toFixed(3) + ",25"]: [{ qid: "Q1395", coord: olympiaGR, label: "Olympia", title: "Olympia, Greece", classes: ["Q839954"] }, { qid: "Q555", coord: [21.6, 37.6], label: "Olympia Museum", title: "Olympia Museum", classes: ["Q33506"] }],
    "26.300,35.100,25": [],
    [olympiaGR[0].toFixed(3) + "," + olympiaGR[1].toFixed(3) + ",300"]: [],
    "14.100,41.200,25": [], "113.000,23.000,25": [],
  },
  classes: { Q839954: { label: "archaeological site", tops: ["Q839954"] }, Q515: { label: "city", tops: ["Q515"] }, Q4167410: { label: "Wikimedia disambiguation page", tops: [] }, Q999: { label: "wine", tops: [] }, Q3024240: { label: "historical country", tops: ["Q3024240"] }, Q33506: { label: "museum", tops: [] } },
  items: {},
};
const res = M.makeResolver(fx, cache);
const T = (name, at, kind, extra) => Object.assign({ name, label: "", kind: kind || "point", at, within: "", cards: ["x-001"] }, extra || {});
let r;
r = res.resolve(T("Athinai", [23.70, 37.99])); check("a gazetteer row by alias within the radius resolves", r.id === "city:2" && r.via === "gazetteer", JSON.stringify(r));
r = res.resolve(T("Olympia", olympiaGR)); check("a homonym 9,900 km away is not matched; the unique item around the coordinate is", r.id === "pl:q1395" && r.via === "around" && r.item && r.item.kind === "site", JSON.stringify(r).slice(0, 160));
r = res.resolve(T("Olympia", olympiaWA)); check("the same name at the other coordinate resolves to the gazetteer's town", r.id === "city:1", JSON.stringify(r));
r = res.resolve(T("Springfield", [10.02, 50.01])); check("two rows of one kind family within 25 km are ONE site: the nearer is the place, the other is merged in (3b, decision 1)", r.id === "city:3" && r.merged && r.merged.length === 1 && r.merged[0].id === "city:4", JSON.stringify(r));
r = res.resolve(T("Knossos", [25.16, 35.30])); check("a Wikidata title whose coordinate agrees becomes a pl:q row of kind site", r.id === "pl:q173527" && r.via === "title" && r.item.kind === "site" && r.item.sub === "site", JSON.stringify(r).slice(0, 160));
r = res.resolve(T("Knossos", [26.30, 35.10])); check("the same title 100 km away does not: unresolved with the distance named", !r.id && /km from the card/.test(r.unresolved), r.unresolved);
r = res.resolve(T("Folsom", [26.30, 35.10])); check("a disambiguation page is unresolved, named as such", !r.id && /disambiguation/.test(r.unresolved), r.unresolved);
r = res.resolve(T("Falernian wine", [14.1, 41.2])); check("an item whose class the taxonomy does not map is unresolved with the class printed", !r.id && /no class the taxonomy maps/.test(r.unresolved) && /wine/.test(r.unresolved), r.unresolved);
r = res.resolve(T("Nanyue", [113, 23])); check("a state is unresolved: a polity is an entity, not a place row", !r.id && /polity-spec/.test(r.unresolved), r.unresolved);
r = res.resolve(T("Known Site", [30.01, 30.01])); check("an item the registry already carries resolves to the existing row, not a second one", r.id === "pl:q99" && /places/.test(r.via), r.via);
r = res.resolve(T("Thessaly", [22.9, 39.2], "region")); check("a region matches a region row within 300 km", r.id === "reg:5", JSON.stringify(r));
r = res.resolve(T("Thessaly", [22.9, 39.2], "point")); check("…but a point of that name does not take a region row (kind-compatible only)", r.id !== "reg:5", JSON.stringify(r).slice(0, 100));
const a1 = JSON.stringify(res.resolve(T("Olympia", olympiaGR))), a2 = JSON.stringify(res.resolve(T("Olympia", olympiaGR))); check("resolution is idempotent", a1 === a2);
r = res.resolve(T("Nowhere Special", [50, 50])); check("a toponym the cache has not been asked about says so", !r.id && /not fetched/.test(r.unresolved), r.unresolved);

console.log("\n2b) decision 1 and decision 2: one place per site, 25 km, kinds (Phase 3b)\n");
{
  const real = M.loadCache().classes;
  const item = (qid, label, coord, classes, title) => ({ qid, coord, label, title: title || label, classes });
  const via = (name, at, kind, items) => {   // candidates arrive through the search around the coordinate
    const t = T(name, at, kind);
    const key = at[0].toFixed(3) + "," + at[1].toFixed(3) + "," + Math.min(M.RADIUS[kind || "point"] || 25, 50);
    return M.makeResolver(fixtureRegistry([]), { titles: { [name]: null }, labels: {}, around: { [key]: items }, classes: real, items: {} }).resolve(t);
  };
  const POLIS = "Q148837", ANCIENT = "Q15661340", CITY = "Q515", TOWN = "Q3957", ISLAND = "Q23442", MINT = "Q464780", MOUNTAIN = "Q8502", CAPE = "Q185113", FREGUESIA = "Q1131296", TOWN_PT = "Q19833170";
  let x = via("Corinth", [22.88, 37.91], "point", [item("Q1363688", "Corinth", [22.8808, 37.9058], [POLIS, ANCIENT], "Ancient Corinth"), item("Q103011", "Corinth", [22.9333, 37.9333], [CITY], "Corinth (modern city)"), item("Q127430042", "Corinth", [22.9, 37.9], [MINT], "Corinth"), item("Q127430043", "Corinth", [22.88, 37.9], [MINT], "Corinth")]);
  check("a polis, an ancient city and a modern city 6 km apart are one place (the nearest to the card; the mints are not places)", x.id === "pl:q1363688" && x.merged && x.merged.length === 1 && x.merged[0].qid === "Q103011", JSON.stringify(x).slice(0, 220));
  x = via("Thebes", [23.32, 38.32], "point", [item("Q11225429", "Thebes", [23.32, 38.32], [POLIS], "Thebes"), item("Q5760", "Thebes", [23.32, 38.32], [CITY], "Thebes, Greece"), item("Q127431406", "Thebes", [23.32, 38.32], [MINT], "Thebes")]);
  check("a polis alone is an ancient city, not a state: Thebes resolves, a tie goes to the item whose title is the toponym", x.id === "pl:q11225429" && x.item.kind === "site", JSON.stringify(x).slice(0, 200));
  x = via("Thera", [25.43, 36.42], "point", [item("Q129296", "Thera", [25.43, 36.4], [ISLAND, "Q1200957"], "Santorini"), item("Q433004", "Thera", [25.5, 36.36], [POLIS, "Q839954"], "Ancient Thera")]);
  check("an island and the polis of the same name 7 km apart are ONE site (3c, decision 1): the island is the place, an island that is also a tourist destination stays an island", x.id === "pl:q129296" && x.item.kind === "island" && x.merged && x.merged.length === 1 && x.merged[0].qid === "Q433004" && x.merged[0].how === "island-polis", JSON.stringify(x).slice(0, 200));
  x = via("Salamis", [23.5, 37.95], "battle", [item("Q202422", "Salamis", [23.5, 37.95], [ISLAND, POLIS], "Salamis Island"), item("Q28721684", "Salamis", [23.47, 37.92], [ANCIENT], "Salamis")]);
  check("an island that is also a polis is still an island (the polis class is read last), and the ancient city of that name folds into it", x.id === "pl:q202422" && x.item.kind === "island" && x.merged && x.merged[0].qid === "Q28721684", JSON.stringify(x).slice(0, 200));
  x = via("Macedonia", [22.0, 40.5], "region", [item("Q81734", "Macedonia", [22.0, 40.6], ["Q82794", "Q1620908"], "Macedonia"), item("Q103251", "Macedonia", [22.0, 41.1], ["Q82794", "Q1620908"], "Macedonia (region)")]);
  check("two regions more than 25 km apart are ambiguous even of one kind", Array.isArray(x.ambiguous) && /more than 25 km apart/.test(x.why), x.why);
  x = via("Sagres", [-8.94, 37.01], "point", [item("Q926672", "Sagres", [-8.94, 37.01], [FREGUESIA], "Sagres (Vila do Bispo)"), item("Q49364942", "Sagres", [-8.94, 37.01], [TOWN_PT], "Sagres")]);
  check("a freguesia and the town it is named for are one place, and the place is a town", x.id === "pl:q49364942" && x.item.kind !== "region", JSON.stringify(x).slice(0, 160));
  x = via("Mount Pelion", [23.05, 39.44], "point", [item("Q192345", "Pelion", [23.05, 39.44], [MOUNTAIN], "Mount Pelion")]);
  check("MOUNTAIN is a registry kind: an item whose class is mountain becomes a row of kind mountain", x.id === "pl:q192345" && x.item.kind === "mountain" && R.PLACE_KINDS.includes("mountain"), JSON.stringify(x).slice(0, 160));
  x = via("Cape Sounion", [24.02, 37.65], "point", [item("Q1013001", "Cape Sounion", [24.02, 37.65], [CAPE], "Cape Sounion")]);
  check("CAPE is a registry kind: an item whose class is cape becomes a row of kind cape", x.id === "pl:q1013001" && x.item.kind === "cape" && R.PLACE_KINDS.includes("cape"), JSON.stringify(x).slice(0, 160));
  x = via("Olympus", [22.35, 40.09], "point", [item("Q1", "Mount Olympus", [22.35, 40.09], [MOUNTAIN], "Olympus"), item("Q2", "Olympus", [22.4, 40.1], [TOWN], "Olympus")]);
  check("a mountain and a town of the same name are different kinds: ambiguous", Array.isArray(x.ambiguous) && /mountain/.test(x.why), x.why);
  check("two runs of the same fixture give the same answer (idempotent)", JSON.stringify(via("Corinth", [22.88, 37.91], "point", [item("Q1363688", "Corinth", [22.8808, 37.9058], [POLIS, ANCIENT]), item("Q103011", "Corinth", [22.9333, 37.9333], [CITY])])) === JSON.stringify(via("Corinth", [22.88, 37.91], "point", [item("Q1363688", "Corinth", [22.8808, 37.9058], [POLIS, ANCIENT]), item("Q103011", "Corinth", [22.9333, 37.9333], [CITY])])));
  /* across toponyms: a period name this migration owns is folded into a modern city within 2 km, and never otherwise */
  const fxr = fixtureRegistry([
    { id: "city:90", name: "Istanbul", kind: "city", at: [28.9784, 41.0082], aliases: [] },
    { id: "city:91", name: "Heraklion", kind: "city", at: [25.1442, 35.3387], aliases: [] },
    { id: "city:92", name: "London", kind: "capital", at: [-0.1276, 51.5072], aliases: [] },
  ]);
  const own = (qid, name, coord, classes, kind, sub) => ({ id: "pl:q" + qid.slice(1), via: "title", d: 0, item: { qid, kind: kind || "site", sub: sub || "site", coord, label: name, title: name, classes } });
  const results = [own("Q23725", "Byzantium", [28.9833, 41.0136], [ANCIENT]), own("Q173527", "Knossos", [25.1632, 35.298], [ANCIENT, "Q839954"]), own("Q189960", "Westminster", [-0.1357, 51.4975], [TOWN], "town", ""), own("Q300", "Ancient Tarquinia", [11.76, 42.25], [ANCIENT]), own("Q301", "Tarquinia", [11.7667, 42.25], [ANCIENT])];
  const X = M.crossMerge(results, fxr, {}, {});
  check("Byzantium (an ancient city 0.7 km from Istanbul) is folded into Istanbul, and its name becomes the gazetteer row's alias", X.into.get("pl:q23725") === "city:90" && (X.aliases.get("city:90") || []).includes("Byzantium") && results[0].id === "city:90" && !results[0].item, JSON.stringify([...X.into]));
  check("Knossos 4.3 km from Heraklion stays its own place and is listed for the owner instead", !X.into.has("pl:q173527") && X.near.some((m) => m.id === "pl:q173527" && m.km > 2), JSON.stringify(X.near));
  check("a modern town (Westminster) is never folded into a city, however near", !X.into.has("pl:q189960"));
  check("two period names of one ancient city within 1 km become one place (the lower Wikidata number keeps it)", X.into.get("pl:q301") === "pl:q300" || X.into.get("pl:q300") === "pl:q301", JSON.stringify([...X.into]));
  const X2 = M.crossMerge([{ id: "pl:q23725", item: results[0].item, via: "title", d: 0 }], fxr, {}, { "pl:q23725": { into: "city:91", reason: "owner" } });
  check("the owner's merges (places-spec.json `merges`) are honoured before any rule", X2.into.get("pl:q23725") === "city:91");
  /* the real registry after this migration: the overlay reads back, and no two places of one site remain */
  const regNow = R.loadRegistry();
  check("the alias overlay is read back: Epidamnos finds Durrës, a gazetteer row the migration never edited", (regNow.byName.get("epidamnos") || []).some((r) => r.id === "city:1159144543"), (regNow.byName.get("epidamnos") || []).map((r) => r.id).join(","));
  check("Byzantium finds Constantinople (one place, period names as aliases)", (regNow.byName.get("byzantium") || []).some((r) => r.id === "pl:q16869"), (regNow.byName.get("byzantium") || []).map((r) => r.id).join(","));
  const usedIds = [...new Set(loadCards().cards.flatMap((c) => c.places || []))].filter((id) => !id.startsWith("pol:"));
  const rest = M.crossMerge(usedIds.map((id) => ({ id })), regNow, JSON.parse(fs.readFileSync(path.join(ROOT, ".claude", "atlas-build", "places-spec.json"), "utf8")).rows || {}, {});
  check("no two places of one site remain among the places the cards use (the migration is at its fixed point)", rest.list.length === 0, rest.list.slice(0, 3).map((m) => m.name + " → " + m.intoName).join("; "));
}

console.log("\n2c) Phase 3c: island and polis, Wikidata-linked period settlements, the hill kind\n");
{
  const real = M.loadCache().classes;
  const item = (qid, label, coord, classes, title) => ({ qid, coord, label, title: title || label, classes });
  const via = (name, at, kind, items) => {
    const t = T(name, at, kind);
    const key = at[0].toFixed(3) + "," + at[1].toFixed(3) + "," + Math.min(M.RADIUS[kind || "point"] || 25, 50);
    return M.makeResolver(fixtureRegistry([]), { titles: { [name]: null }, labels: {}, around: { [key]: items }, classes: real, items: {} }).resolve(t);
  };
  const viaL = (name, at, kind, items) => {   // candidates arrive through the exact-label lookup (the resolver keeps those within the radius)
    const t = T(name, at, kind);
    return M.makeResolver(fixtureRegistry([]), { titles: { [name]: null }, labels: { [name]: items }, around: {}, classes: real, items: {} }).resolve(t);
  };
  const POLIS = "Q148837", ANCIENT = "Q15661340", ISLAND = "Q23442", VILLAGE = "Q532", CITY = "Q515", MOUNTAIN = "Q8502", HILL = "Q54050", PALACE = "Q16560", BATTLE = "Q178561";
  /* decision 1 */
  let x = viaL("Seriphos", [24.5, 37.15], "point", [item("Q217214", "Serifos", [24.5, 37.15], [ISLAND], "Serifos"), item("Q65244370", "Serifos", [24.5061, 37.1547], [POLIS], "Serifos (polis)")]);
  check("3c: an island and a polis of one name (Seriphos) fold into the ISLAND row, the polis its merged item", x.id === "pl:q217214" && x.item.kind === "island" && x.merged.length === 1 && x.merged[0].qid === "Q65244370" && x.merged[0].how === "island-polis", JSON.stringify(x).slice(0, 220));
  x = viaL("Ithaca", [20.72, 38.36], "point", [item("Q187471", "Ithaca", [20.6667, 38.4167], [ISLAND, POLIS], "Ithaca (island)"), item("Q3555023", "Vathy", [20.7202, 38.3647], ["Q486972"], "Vathy, Ithaca")]);
  check("3c: an island that is itself a polis (Ithaca) is the island, even when a modern town carrying the name only as an alias lies nearer the card — that town is set aside, not folded and not a rival", x.id === "pl:q187471" && x.item.kind === "island" && (x.merged || []).length === 0 && x.aside && x.aside[0].qid === "Q3555023", JSON.stringify(x).slice(0, 240));
  x = viaL("Rhodes", [28.2, 36.43], "point", [item("Q1", "Rhodes", [28.2, 36.3], [ISLAND], "Rhodes"), item("Q2", "Rhodes", [28.22, 36.43], [CITY], "Rhodes (city)")]);
  check("3c: an island and a MODERN town that bears the name itself are still different kinds: ambiguous", Array.isArray(x.ambiguous) && /different kinds/.test(x.why), x.why);
  x = viaL("Thera", [25.43, 36.42], "point", [item("Q129296", "Thera", [25.43, 36.4], [ISLAND], "Santorini"), item("Q433004", "Thera", [25.5, 36.36], [POLIS], "Ancient Thera"), item("Q65084301", "Thera", [28.28, 37.14], [ANCIENT], "Thera (Caria)")]);
  check("3c: a namesake polis 300 km away does not enter the fold (the radius still decides)", x.id === "pl:q129296" && x.merged.length === 1, JSON.stringify(x).slice(0, 160));
  x = viaL("Versailles", [2.12, 48.8], "point", [item("Q621", "Versailles", [2.1301, 48.8014], ["Q484170"], "Versailles"), item("Q2946", "Versailles", [2.1204, 48.8049], [PALACE, "Q751876"], "Palace of Versailles")]);
  check("3c: a palace and the commune beside it (Versailles) STAY ambiguous, listed for a human", Array.isArray(x.ambiguous) && /different kinds/.test(x.why), x.why);
  x = viaL("Waterloo", [4.4, 50.68], "battle", [item("Q179034", "Waterloo", [4.3994, 50.7147], ["Q493522"], "Waterloo"), item("Q48314", "Waterloo", [4.41, 50.68], [BATTLE], "Battle of Waterloo")]);
  check("3c: a battlefield and the town beside it (Waterloo) STAY ambiguous", Array.isArray(x.ambiguous) && /different kinds/.test(x.why), x.why);
  /* decision 2: only a Wikidata link folds a period settlement 2-25 km from a modern city */
  const fxr = fixtureRegistry([
    { id: "city:90", name: "Heraklion", kind: "city", at: [25.1442, 35.3387], qid: "Q160544", aliases: [] },
    { id: "city:91", name: "Constanța", kind: "city", at: [28.6348, 44.1733], qid: "Q79808", aliases: [] },
    { id: "city:92", name: "Manisa", kind: "city", at: [27.4289, 38.6191], qid: "Q147089", aliases: [] },
    { id: "city:93", name: "Xi'an", kind: "city", at: [108.94, 34.34], qid: "Q5826", aliases: [] },
    { id: "city:94", name: "Modern A", kind: "city", at: [10.0, 40.0], qid: "Q9001", aliases: [] },
  ]);
  const own = (qid, name, coord) => ({ id: "pl:q" + qid.slice(1), via: "title", d: 0, item: { qid, kind: "site", sub: "site", coord, label: name, title: name, classes: [ANCIENT] } });
  const mk = () => [own("Q173527", "Knossos", [25.1632, 35.298]), own("Q2441154", "Tomis", [28.6603, 44.1766]), own("Q920866", "Magnesia ad Sipylum", [27.4, 38.6]), own("Q11111", "Changan", [108.9, 34.31]), own("Q9002", "Old B", [10.04, 40.0])];
  const km2 = (a, b) => R.km(a, b);
  const links = {
    Q173527: { enwiki: "Knossos" }, Q160544: { enwiki: "Heraklion", P1365: ["Q65075667"] },
    Q2441154: { enwiki: null, P460: ["Q79808"] }, Q79808: { enwiki: "Constanța", P460: ["Q2441154"] },
    Q920866: { enwiki: "Magnesia ad Sipylum", P1366: ["Q147089"] }, Q147089: { enwiki: "Manisa" },
    Q11111: { enwiki: "Chang'an" }, Q5826: { enwiki: "Xi'an", P1365: ["Q999999"] },
    Q9002: { enwiki: "Shared Title" }, Q9001: { enwiki: "Shared Title" },
  };
  let results = mk(); let X = M.crossMerge(results, fxr, {}, {}, links);
  check("3c: Knossos 4.3 km from Heraklion with NO Wikidata link between them stays its own place (distance alone never folds)", km2([25.1632, 35.298], [25.1442, 35.3387]) > 4 && !X.into.has("pl:q173527") && X.near.some((m) => m.id === "pl:q173527" && /no Wikidata link found/.test(m.evidence)), JSON.stringify(X.near.find((m) => m.id === "pl:q173527")));
  check("3c: Tomis folds into Constanța where Wikidata says so (P460), the evidence recorded", X.into.get("pl:q2441154") === "city:91" && /P460/.test((X.list.find((m) => m.id === "pl:q2441154") || {}).evidence || ""), JSON.stringify(X.list.find((m) => m.id === "pl:q2441154")));
  check("3c: a period settlement folds where it is 'replaced by' the modern city (P1366)", X.into.get("pl:q920866") === "city:92" && /P1366 replaced by/.test((X.list.find((m) => m.id === "pl:q920866") || {}).evidence || ""));
  check("3c: Chang'an 4.7 km from Xi'an with no link between the two items stays separate (a link to some OTHER item is not evidence)", !X.into.has("pl:q11111"));
  check("3c: two items sharing one English Wikipedia article count as linked", X.into.get("pl:q9002") === "city:94" && /same English Wikipedia article/.test((X.list.find((m) => m.id === "pl:q9002") || {}).evidence || ""));
  check("3c: the fold's aliases carry the period name onto the modern city's overlay", (X.aliases.get("city:91") || []).includes("Tomis") && results[1].id === "city:91");
  check("3c: crossMerge reports the Wikidata items it needs (--fetch asks for exactly these)", X.wanted.includes("Q173527") && X.wanted.includes("Q160544") && X.wanted.every((q) => /^Q\d+$/.test(q)), X.wanted.join(","));
  results = mk(); X = M.crossMerge(results, fxr, {}, {}, {});
  check("3c: with no links in the cache nothing folds and every pair says it could not be checked (never a guess)", X.list.length === 0 && X.near.length >= 4 && X.near.every((m) => /could not check/.test(m.evidence)), X.near.map((m) => m.evidence).join(" | ").slice(0, 160));
  results = mk(); X = M.crossMerge(results, fxr, {}, {}, undefined);
  check("3c: …and the same when the cache has no `links` at all", X.list.length === 0);
  results = mk(); const a1 = JSON.stringify(M.crossMerge(results, fxr, {}, {}, links).list), a2 = JSON.stringify(M.crossMerge(mk(), fxr, {}, {}, links).list);
  check("3c: the evidence fold is deterministic (idempotent)", a1 === a2);
  /* decision 3: hill */
  check("3c: HILL is a registry kind and the taxonomy reads Q54050 as hill, mountain first", R.PLACE_KINDS.includes("hill") && M.TOPS.findIndex((t) => t[0] === "mountain") < M.TOPS.findIndex((t) => t[0] === "hill") && !M.TOPS.find((t) => t[0] === "mountain")[2].includes(HILL));
  x = viaL("Palatine Hill", [12.49, 41.89], "point", [item("Q200642", "Palatine Hill", [12.4879, 41.8895], ["Q17431399", "Q839954", HILL], "Palatine Hill")]);
  check("3c: an item whose class is hill becomes a row of kind hill (a hill that is also an archaeological site stays a hill)", x.id === "pl:q200642" && x.item.kind === "hill", JSON.stringify(x).slice(0, 200));
  x = viaL("Mount Olympus", [22.35, 40.09], "point", [item("Q80344", "Mount Olympus", [22.35, 40.09], ["Q46169", MOUNTAIN], "Mount Olympus")]);
  check("3c: …while a mountain stays a mountain", x.item.kind === "mountain", JSON.stringify(x).slice(0, 160));
  x = viaL("Isandlwana", [30.65, -28.35], "point", [item("Q3782078", "Isandlwana", [30.65, -28.35], [HILL, MOUNTAIN], "Isandlwana")]);
  check("3c: an item Wikidata classes as BOTH a hill and a mountain is a mountain (the mountain rule is read first; neither swallows the other's own class)", x.item.kind === "mountain", JSON.stringify(x).slice(0, 160));
  check("3c: kindOf: hill alone is hill, mountain alone is mountain, a subclass of hill (a tell is not mapped, an artificial hill is) is hill", M.kindOf({ classes: real }, [HILL]).kind === "hill" && M.kindOf({ classes: real }, [MOUNTAIN]).kind === "mountain" && M.kindOf({ classes: real }, ["Q10460934"]).kind === "hill");
  x = viaL("Pelion", [23.05, 39.44], "range", [item("Q192345", "Pelion", [23.05, 39.44], [HILL], "Pelion")]);
  check("3c: a locator of kind range still takes a hill (as it took a mountain)", x.id === "pl:q192345" && x.item.kind === "hill", JSON.stringify(x).slice(0, 120));
  /* the real data */
  const regNow = R.loadRegistry();
  const rowOf = (n) => (regNow.byName.get(R.fold(n)) || []).filter((r) => r.id.startsWith("pl:"));
  check("3c: the Palatine, the Temple Mount and the Capitoline are `hill` in the real registry", ["Palatine Hill", "Temple Mount", "Capitoline Hill"].every((n) => rowOf(n).some((r) => r.kind === "hill")), ["Palatine Hill", "Temple Mount", "Capitoline Hill"].map((n) => n + ":" + rowOf(n).map((r) => r.kind).join("/")).join(" "));
  check("3c: Mount Olympus and Mount Etna are still `mountain`", ["Mount Olympus", "Mount Etna"].every((n) => rowOf(n).some((r) => r.kind === "mountain")));
  const placeRows = [...regNow.rows.values()].filter((r) => r.id.startsWith("pl:"));
  check("3c: no hill-classed row is left as a mountain (every row whose cached classes include only the hill class is a hill)", placeRows.filter((r) => r.kind === "mountain").every((r) => { const it = (M.loadCache().items || {})[r.qid]; return !it || !(it.classes || []).includes(HILL) || (it.classes || []).includes(MOUNTAIN); }), placeRows.filter((r) => r.kind === "hill").length + " hills, " + placeRows.filter((r) => r.kind === "mountain").length + " mountains");
  /* Knossos and Heraklion in the real data: two places unless the cache really links them */
  const cacheNow = M.loadCache(), L = cacheNow.links || {};
  const knossos = rowOf("Knossos").find((r) => r.kind === "site"), herak = regNow.rows.get("city:1159148617");
  const linkedReal = knossos && herak && ((L[knossos.qid] || {}).P1366 || []).concat((L[knossos.qid] || {}).P1365 || [], (L[knossos.qid] || {}).P460 || []).includes(herak.qid) || ((L[herak && herak.qid] || {}).P1366 || []).concat((L[herak && herak.qid] || {}).P1365 || [], (L[herak && herak.qid] || {}).P460 || []).includes(knossos && knossos.qid) || (knossos && herak && (L[knossos.qid] || {}).enwiki && (L[knossos.qid] || {}).enwiki === (L[herak.qid] || {}).enwiki);
  check("3c: in the real data Knossos and Heraklion are two places unless the committed cache links them (it does not: distance alone never folds)", !!knossos && !!herak && knossos.id !== herak.id && !linkedReal, (knossos || {}).id + " / " + (herak || {}).id);
  const realUsed = [...new Set(loadCards().cards.flatMap((c) => c.places || []))];
  check("3c: every period pair folded by Wikidata evidence is persisted with that evidence, and none rests on distance alone", (() => { const sp = JSON.parse(fs.readFileSync(path.join(ROOT, ".claude", "atlas-build", "places-spec.json"), "utf8")); const items = [].concat(...Object.values(sp.rows).map((r) => r.merged || []), ...Object.values(sp.overlay || {}).map((o) => o.merged || [])).filter((m) => m.how === "wikidata"); return items.every((m) => m.evidence && /^(P1366|P1365|P460|the same English Wikipedia article)/.test(m.evidence) && m.km > 2); })(), "folded: " + (() => { const sp = JSON.parse(fs.readFileSync(path.join(ROOT, ".claude", "atlas-build", "places-spec.json"), "utf8")); return [].concat(...Object.values(sp.rows).map((r) => r.merged || []), ...Object.values(sp.overlay || {}).map((o) => o.merged || [])).filter((m) => m.how === "wikidata").map((m) => m.name).join(", "); })());
  check("3c: the island-and-polis names resolve in the real registry to one island row each (Thera, Salamis, Ithaca, Seriphos)", [["Thera", "Santorini"], ["Salamis", "Salamis Island"], ["Ithaca", "Ithaca (island)"], ["Seriphos", "Serifos"]].every(([n, nm]) => { const l = (regNow.byName.get(R.fold(n)) || []).filter((r) => r.kind === "island"); return l.length === 1 && l[0].name === nm; }));
  check("3c: the real registry's period-pair folds are at a fixed point (the idempotence check above)", realUsed.length > 0);
}

console.log("\n2d) decision e (2026-10-17): a living city never becomes a site because it carries \"tourist destination\" or \"ancient city\"\n");
{
  const real = M.loadCache().classes, K = (cls) => M.kindOf({ classes: real }, cls);
  const POLIS = "Q148837", ANCIENT = "Q15661340", TOURIST = "Q1200957", CITY = "Q515", BIG = "Q1549591", COMUNE = "Q747074", ARCH = "Q839954";
  check("Taranto and Syracuse (city, polis, comune, tourist destination, big city) are cities, not sites of the tourist-destination top", K([CITY, POLIS, COMUNE, TOURIST, BIG]).kind === "city");
  check("Trier (an urban district and urban municipality of Germany, an ancient city, a big city) is a city: the ancient-city class and what it reaches are set aside for a living city", K(["Q85632032", "Q42744322", ANCIENT, BIG, "Q134626"]).kind === "city");
  check("an item that is nothing but an ancient city, or a polis, stays the ancient city it is (a site)", K([ANCIENT]).kind === "site" && K([POLIS]).kind === "site" && K([ANCIENT, TOURIST]).kind === "site");
  check("an archaeological-site class carried DIRECTLY still makes a city a site", K([CITY, ARCH]).kind === "site");
  check("a 'former settlement' (Saticula), a 'submerged settlement' with no living class, a 'historical country' or a 'city-state' (Alba Longa) is not a living city: it stays a site", K(["Q22674925", ANCIENT]).kind === "site" && K([ANCIENT, "Q3024240", "Q133442"]).kind === "site" && K(["Q20616831", ANCIENT]).kind === "site");
  check("a frazione (Baiae) or a Serbian city (Naissus) beside the ancient-city class is a living settlement — Wikidata's own word", K(["Q20616831", ANCIENT, "Q1134686"]).kind !== "site" && K(["Q37800986", ANCIENT, BIG, "Q56061"]).kind === "city");
}

console.log("\n2e) the area anchors (2026-10-18): a homonym 260 km away is caught, a point in the card's area is not\n");
{
  const A = require("./atlas-build/lib/place-anchors.js");
  const L = { name: "Messapia", at: [18.1667, 40.35], kind: "region", area: [[17.25, 40.47], [17.6, 40.68], [17.95, 40.72], [18.35, 40.55], [18.52, 40.15], [18.36, 39.79], [18, 39.98], [17.75, 40.25]] };
  check("the Calabrian homonym (16.24 E 38.55 N) is 25 km or more outside Messapia's area", !A.agrees([16.2362, 38.5535], L).ok, Math.round(A.agrees([16.2362, 38.5535], L).km) + " km");
  check("Salento's coordinate (18.0 E 40.33 N) is inside it", A.agrees([18, 40.3333], L).ok && A.agrees([18, 40.3333], L).inside);
  check("a point 10 km outside the outline passes, 60 km outside does not", A.agrees([18.52 + 0.1, 40.15], L).ok && !A.agrees([18.52 + 0.7, 40.15], L).ok);
  check("without an area the locator's own coordinate decides, 25 km", A.agrees([18.3, 40.35], { at: [18.1667, 40.35] }).ok && !A.agrees([18.6, 40.35], { at: [18.1667, 40.35] }).ok);
  const reg = { rows: new Map([["pl:q1", { id: "pl:q1", name: "Messapia", aliases: [], kind: "region", at: [16.2362, 38.5535] }]]), source: () => "places" };
  const cards = [{ id: "t-1", locator: L, places: ["pl:q1"] }];
  const r0 = A.audit(reg, cards, {}), r1 = A.audit(reg, cards, { "pl:q1": "because" });
  check("the audit names the offender and carries an allow reason through", r0.offenders.length === 1 && !r0.offenders[0].allowed && r1.offenders[0].allowed === "because");
  reg.rows.get("pl:q1").at = [18, 40.3333];
  check("the audit passes once the anchor is Salento's", A.audit(reg, cards, {}).offenders.length === 0);
  const reg2 = R.loadRegistry(), cards2 = loadCards().cards;
  const live = A.audit(reg2, cards2, JSON.parse(fs.readFileSync(path.join(__dirname, "atlas-build", "place-anchors.json"), "utf8")).allow);
  check("the live registry has no area anchor off its card's area but the allowed ones", live.offenders.every((o) => o.allowed), live.offenders.filter((o) => !o.allowed).map((o) => o.name).join(", "));
  check("Messapia is the Salento row, pl:q735628, and card rm-020 carries it", reg2.rows.has("pl:q735628") && !reg2.rows.has("pl:q3234653") && cards2.find((c) => c.id === "rm-020").places.includes("pl:q735628"));
}
console.log("\n3) the migration is additive\n");
{
  // the base is HEAD (the working tree against the last commit: a migration run must not have touched an old field), or the
  // commit FOLIO_PLACES_BASE names — how the Phase 3a run was proved against the main it branched from (§7 "Phase 3a — as built")
  let base = null; try { base = execSync("git rev-parse " + (process.env.FOLIO_PLACES_BASE || "HEAD"), { cwd: ROOT, encoding: "utf8" }).trim(); } catch (e) { base = null; }
  if (!base) check("the base commit's data.js is readable (git)", false, "no git");
  else {
    const src = execSync("git show " + base + ":data.js", { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 28 });
    const w = {}; new Function("window", src)(w);
    const old = new Map((w.CARD_DATA || []).map((c) => [c.id, JSON.stringify([c.locator, c.war, c.map])]));
    const now = new Map(cards.map((c) => [c.id, JSON.stringify([c.locator, c.war, c.map])]));
    let diff = 0, gone = 0; for (const [id, v] of old) { if (!now.has(id)) { gone++; continue; } if (now.get(id) !== v) diff++; }
    check("every card's locator, war and map are byte-identical to the base commit's (" + base.slice(0, 8) + ")", diff === 0, diff + " differ, " + gone + " cards gone, " + old.size + " compared");
  }
  const light = fs.readFileSync(path.join(ROOT, "data.js"), "utf8");
  check("`places` never appears in data.js (it is a heavy field)", !/"places":/.test(light));
  const withPlaces = cards.filter((c) => Array.isArray(c.places));
  check("every places list on a card is sorted, distinct and resolves", withPlaces.every((c) => c.places.length && c.places.slice().sort().join() === c.places.join() && new Set(c.places).size === c.places.length && c.places.every((id) => reg.rows.has(id))), withPlaces.length + " cards carry places");
  check("every card a polity links carries the polity", !withPlaces.length || reg.entities.filter((e) => e.kind === "polity" || e.kind === "people" || e.kind === "culture").every((e) => (e.cards || []).every((id) => { const c = cards.find((x) => x.id === id); return !c || (c.places || []).includes(e.id); })), withPlaces.length ? "" : "no card carries places yet — the migration has not run");
}

console.log("\n4) the tooling refuses what it should\n");
{
  const card = cards.find((c) => c.id === "gr-001") || cards[0];
  const file = path.join(ROOT, "data-extra", card.id.replace(/-\d+$/, "") + ".js");
  // the baseline is card-io's own canonical rewrite of the corpus (a no-op on a tree every writer has been through; the
  // heavy files' header line changed when `places` joined the field list, so a tree from before that would differ once)
  require("./card-io.js").resplit();
  const before = sha(file), beforeLight = sha(path.join(ROOT, "data.js"));
  let r1 = run([".claude/add-places.js", card.id, "pl:q0"]); check("add-places refuses an id the registry lacks", r1.status === 1 && /does not resolve/.test(r1.stderr), r1.stderr.trim().slice(0, 100));
  r1 = run([".claude/add-places.js", card.id, "not-an-id"]); check("add-places refuses a malformed id", r1.status === 1 && /not a place id/.test(r1.stderr), r1.stderr.trim().slice(0, 100));
  r1 = run([".claude/add-places.js", "zz-999", "adm0:ita"]); check("add-places refuses a card that does not exist", r1.status === 1 && /not a card/.test(r1.stderr));
  check("…and wrote nothing", sha(file) === before && sha(path.join(ROOT, "data.js")) === beforeLight);
  r1 = run([".claude/add-places.js", "--find", "Athens"]); check("add-places --find lists Athens with its id", r1.status === 0 && /city:1159151545/.test(r1.stdout), r1.stdout.trim().split("\n")[0]);
  r1 = run([".claude/add-places.js", card.id, "--list"]); check("add-places --list runs", r1.status === 0 && r1.stdout.startsWith(card.id));
  const spare = (card.places || []).includes("adm0:ita") ? "adm0:fra" : "adm0:ita";
  r1 = run([".claude/add-places.js", card.id, spare]); check("add-places adds a resolving id to " + card.id, r1.status === 0 && /\+ /.test(r1.stdout), r1.stdout.trim().split("\n").slice(-1)[0]);
  const mid = loadCards().cards.find((c) => c.id === card.id); check("…and the card carries it, sorted", Array.isArray(mid.places) && mid.places.includes(spare) && mid.places.slice().sort().join() === mid.places.join());
  r1 = run([".claude/add-places.js", card.id, "-" + spare]); check("add-places removes it again", r1.status === 0 && /- /.test(r1.stdout));
  check("the heavy file is byte-identical after the add and the remove", sha(file) === before);
  check("data.js is byte-identical throughout", sha(path.join(ROOT, "data.js")) === beforeLight);
  const derivedCard = cards.find((c) => Array.isArray(c.places) && c.places.some((id) => id.startsWith("pol:") && reg.cardsOf(id).includes(c.id)));
  if (derivedCard) { const pid = derivedCard.places.find((id) => id.startsWith("pol:") && reg.cardsOf(id).includes(derivedCard.id)); r1 = run([".claude/add-places.js", derivedCard.id, "-" + pid]); check("add-places refuses to remove a polity the entity table links to the card (" + derivedCard.id + " " + pid + ")", r1.status === 1 && /derived/.test(r1.stderr), r1.stderr.trim().slice(0, 120)); check("…and wrote nothing", sha(path.join(ROOT, "data-extra", derivedCard.id.replace(/-\d+$/, "") + ".js")) === sha(path.join(ROOT, "data-extra", derivedCard.id.replace(/-\d+$/, "") + ".js")) && sha(path.join(ROOT, "data.js")) === beforeLight); }
  r1 = run([".claude/atlas-build/add-place.js", "--kind", "site", "--reason", "x"]); check("add-place refuses a call without --qid before the network", r1.status === 1 && /--qid/.test(r1.stderr));
  r1 = run([".claude/atlas-build/add-place.js", "--qid", "Q1", "--kind", "wine", "--reason", "x"]); check("add-place refuses a kind outside the taxonomy", r1.status === 1 && /--kind/.test(r1.stderr));
  r1 = run([".claude/atlas-build/add-place.js", "--qid", "Q1", "--kind", "site"]); check("add-place refuses a row without a reason", r1.status === 1 && /--reason/.test(r1.stderr));
  const f = (id, row) => B.faults(id, row);
  check("build-places names a bad id", f("pl:x", { name: "A", kind: "site", qid: "Q1", at: [0, 0] }).some((x) => /pl:q/.test(x)));
  check("build-places names a kind outside the taxonomy", f("pl:q1", { name: "A", kind: "wine", qid: "Q1", at: [0, 0] }).some((x) => /kind/.test(x)));
  check("build-places names a qid that does not match the id", f("pl:q1", { name: "A", kind: "site", qid: "Q2", at: [0, 0] }).some((x) => /qid/.test(x)));
  check("build-places names a coordinate that is not [lon, lat]", f("pl:q1", { name: "A", kind: "site", qid: "Q1", at: [200, 0] }).some((x) => /at is not/.test(x)));
  check("build-places names a manual row without a reason", f("pl:q1", { name: "A", kind: "site", qid: "Q1", at: [0, 0], manual: true }).some((x) => /reason/.test(x)));
  check("a valid row has no faults", f("pl:q1", { name: "A", kind: "site", qid: "Q1", at: [0, 0], within: "city:1159151545", aliases: ["B"], wiki: "A" }).length === 0);
  if (fs.existsSync(B.TARGET)) { const s = B.build({ check: true, log: () => {} }); check("atlas/data/places.js is in step with places-spec.json", s.ok, s.why); }
}
console.log(`\n${pass} ok, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
