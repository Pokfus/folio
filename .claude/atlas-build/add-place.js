#!/usr/bin/env node
/* add-place.js — add ONE place to the registry by hand, Wikidata-checked (Atlas v2 Phase 3a; docs/atlas-v2-design.md §2.8
   "Author tooling", §7 "Phase 3a — as built").

     node .claude/atlas-build/add-place.js --qid Q121378 --kind island --reason "Corfu: the Temple of Artemis cards' island" [--name "Corfu"] [--sub cave|battle|building] [--within <id>] [--alias "Kerkyra" …] [--dry]
     node .claude/atlas-build/add-place.js --remove pl:q121378

   WHAT IT DOES. Asks Wikidata (query.wikidata.org/sparql, through curl; needs the network) for the item's English label,
   English Wikipedia title, coordinate (P625) and classes (P31), REFUSES when the item has no coordinate, when its classes
   contradict the kind asked for (a wine, a person or a temple cannot be filed as a city — the classes it found are printed),
   when the gazetteer or the entity table already carries the item (the existing id is printed: point the card at that), or
   when the id exists in places-spec.json without --replace; then writes the row to places-spec.json as `manual: true` with
   the reason, records the item in places-wikidata.json, and rebuilds atlas/data/places.js (build-places.js --install).
   The coordinate is the service's, never typed; the name defaults to the English Wikipedia title. A manual row is never
   overwritten by migrate-places.js. */
"use strict";
const fs = require("fs"), path = require("path");
const B = require("./build-places.js");
const W = require("./lib/wikidata.js");
const ROOT = path.join(__dirname, "..", "..");
const R = require(path.join(ROOT, ".claude", "places-registry.js"));
const argv = process.argv.slice(2);
const flag = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };
const flags = (n) => { const out = []; for (let i = 0; i < argv.length; i++) if (argv[i] === n) out.push(argv[i + 1]); return out; };
const DRY = argv.includes("--dry"), REPLACE = argv.includes("--replace");
const die = (m) => { console.error("add-place: " + m); process.exit(1); };

/* the taxonomy's tops, as migrate-places.js maps them (the one table; required from there so the two cannot drift) */
const TOPS = require(path.join(ROOT, ".claude", "migrate-places.js")).TOPS;

const spec = B.loadSpec(); spec.rows = spec.rows || {};
const cache = B.loadCache(); cache.items = cache.items || {}; cache.classes = cache.classes || {};
const remove = flag("--remove");
if (remove) {
  if (!spec.rows[remove]) die(remove + " is not in places-spec.json");
  const { loadCards } = require(path.join(ROOT, ".claude", "card-io.js")); const users = loadCards().cards.filter((c) => (c.places || []).includes(remove)).map((c) => c.id);
  if (users.length) die(remove + " is on " + users.length + " cards (" + users.slice(0, 8).join(", ") + "…): remove it from them first (add-places.js <card> -" + remove + ")");
  if (DRY) { console.log("would remove " + remove + " (" + spec.rows[remove].name + ")"); process.exit(0); }
  delete spec.rows[remove]; fs.writeFileSync(B.SPEC, JSON.stringify(spec, null, 1) + "\n"); B.build({ install: true, log: () => {} }); console.log("removed " + remove + " and rebuilt atlas/data/places.js"); process.exit(0);
}
const qid = flag("--qid"), kind = flag("--kind"), reason = flag("--reason");
if (!qid || !/^Q\d+$/.test(qid)) die("--qid Q<number> is required");
if (!kind || !R.PLACE_KINDS.includes(kind)) die("--kind is required and must be one of " + R.PLACE_KINDS.join(", "));
if (!reason) die("--reason is required: why the registry needs this place (which cards, what for)");
const id = "pl:q" + qid.slice(1);
const reg = R.loadRegistry();
for (const r of reg.rows.values()) if (r.qid === qid && r.id !== id) die("the registry already carries " + qid + " as " + r.id + " (" + r.name + ", " + r.kind + "): point the card at that id");
if (spec.rows[id] && !REPLACE) die(id + " is already in places-spec.json (" + spec.rows[id].name + "); pass --replace to rewrite it");

/* ask the service */
console.log("asking Wikidata for " + qid + "…");
const q = "SELECT ?item ?coord ?label ?article (GROUP_CONCAT(DISTINCT ?cls; separator=\" \") AS ?classes) WHERE { VALUES ?item { wd:" + qid + " } OPTIONAL { ?item wdt:P625 ?coord } OPTIONAL { ?item wdt:P31 ?cls } OPTIONAL { ?item rdfs:label ?label FILTER(lang(?label) = \"en\") } OPTIONAL { ?article schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> } } GROUP BY ?item ?coord ?label ?article";
let rows; try { rows = W.sparql(q); } catch (e) { die("Wikidata did not answer: " + e.message); }
if (!rows.length) die(qid + " is not an item Wikidata answers for");
const b = rows[0];
const m = /Point\(\s*(-?[\d.]+)\s+(-?[\d.]+)\s*\)/.exec(b.coord ? b.coord.value : "");
if (!m) die(qid + " has no coordinate (P625) — a place without one cannot be marked; refused");
const at = [Math.round(Number(m[1]) * 1e4) / 1e4, Math.round(Number(m[2]) * 1e4) / 1e4];
const classes = (b.classes && b.classes.value ? b.classes.value.split(" ") : []).map((x) => x.split("/").pop()).filter(Boolean);
const label = b.label ? b.label.value : "", title = b.article ? decodeURIComponent(b.article.value.split("/wiki/")[1] || "").replace(/_/g, " ") : "";
/* the classes against the kind: fetch what each class reaches and refuse a contradiction */
const TOP_IDS = [...new Set(TOPS.flatMap((t) => t[2]))];
const want = classes.filter((c) => !(c in cache.classes));
if (want.length) {
  const q2 = "SELECT ?cls ?label (GROUP_CONCAT(DISTINCT ?top; separator=\" \") AS ?tops) WHERE { VALUES ?cls { " + want.map((c) => "wd:" + c).join(" ") + " } OPTIONAL { VALUES ?top { " + TOP_IDS.map((c) => "wd:" + c).join(" ") + " } ?cls wdt:P279* ?top } OPTIONAL { ?cls rdfs:label ?label FILTER(lang(?label) = \"en\") } } GROUP BY ?cls ?label";
  let r2; try { r2 = W.sparql(q2); } catch (e) { die("Wikidata did not answer for the classes: " + e.message); }
  for (const x of r2) { const c = x.cls.value.split("/").pop(); cache.classes[c] = { label: x.label ? x.label.value : "", tops: (x.tops && x.tops.value ? x.tops.value.split(" ") : []).map((y) => y.split("/").pop()).filter(Boolean) }; }
  for (const c of want) cache.classes[c] = cache.classes[c] || { label: "", tops: [] };
}
const reached = new Set(); for (const c of classes) { reached.add(c); for (const t of ((cache.classes[c] || {}).tops || [])) reached.add(t); }
const given = TOPS.filter(([, , tops]) => tops.some((t) => reached.has(t))).map(([k, sub]) => k + (sub ? "/" + sub : ""));
const classText = classes.map((c) => c + (cache.classes[c] && cache.classes[c].label ? " (" + cache.classes[c].label + ")" : "")).join(", ") || "none";
if (!given.length) die(qid + " (" + (label || title) + ") has no class the taxonomy maps — classes: " + classText + "; refused rather than guessed");
if (!given.some((g) => g.split("/")[0] === kind)) die(qid + " (" + (label || title) + ") is not a " + kind + " by its classes (" + classText + " → " + given.join(", ") + "); refused");
if (given.some((g) => g.startsWith("polity") || g.startsWith("people"))) die(qid + " is a state or a people (" + classText + "): a polity is an entity of the history file, linked through polity-spec.json, not a place row");
const name = flag("--name") || title || label;
if (!name) die("the item has no English title or label; pass --name");
const sub = flag("--sub") || (given.find((g) => g.startsWith(kind + "/")) || "").split("/")[1] || "";
const within = flag("--within") || "";
if (within && !reg.rows.has(within) && !spec.rows[within]) die("--within " + within + " is not a registry id");
const aliases = [...new Set(flags("--alias").concat(label && R.fold(label) !== R.fold(name) ? [label] : []).filter((a) => a && R.fold(a) !== R.fold(name)))];
const row = { name, kind, sub, qid, at, within, aliases, wiki: title, manual: true, reason, evidence: { classes, via: "add-place" } };
console.log(JSON.stringify(Object.assign({ id }, row), null, 1));
if (DRY) process.exit(0);
spec.rows[id] = row;
spec.rows = Object.fromEntries(Object.entries(spec.rows).sort(([a], [b2]) => (a < b2 ? -1 : 1)));
fs.writeFileSync(B.SPEC, JSON.stringify(spec, null, 1) + "\n");
cache.items[qid] = { coord: at, classes, label, title }; cache.retrieved = new Date().toISOString().slice(0, 10);
fs.writeFileSync(B.CACHE, JSON.stringify(cache, null, 1) + "\n");
B.build({ install: true, log: () => {} });
console.log("added " + id + " (" + name + ", " + kind + (sub ? "/" + sub : "") + ") and rebuilt atlas/data/places.js — now: node .claude/add-places.js <cardId> " + id);
