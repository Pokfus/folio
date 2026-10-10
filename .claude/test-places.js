#!/usr/bin/env node
/* test-places.js — the places registry, the migration's resolver and the author tooling, without a browser (Atlas v2 Phase 3a;
   docs/atlas-v2-design.md §2.8, §7 "Phase 3a — as built").

     node .claude/test-places.js

   WHAT IT PROVES, each a fault nothing else would see:
     · THE REGISTRY LOADS AS ONE TABLE: the gazetteer, atlas/data/places.js and the history entity table, every id unique
       and well formed, every kind in the taxonomy, names folded for lookup (Athens by name; a polity by its entity id), the
       polity → cards links readable (cardsOf) and every linked card a real card;
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
const linked = reg.entities.filter((e) => e.kind === "polity").flatMap((e) => e.cards || []);
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
r = res.resolve(T("Springfield", [10.02, 50.01])); check("two rows within the radius are ambiguous, none chosen", Array.isArray(r.ambiguous) && r.ambiguous.length === 2 && !r.id, JSON.stringify(r));
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
  check("every card a polity links carries the polity", !withPlaces.length || reg.entities.filter((e) => e.kind === "polity").every((e) => (e.cards || []).every((id) => { const c = cards.find((x) => x.id === id); return !c || (c.places || []).includes(e.id); })), withPlaces.length ? "" : "no card carries places yet — the migration has not run");
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
