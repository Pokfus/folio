#!/usr/bin/env node
/* add-places.js — add or remove places on ONE card, validated against the registry (Atlas v2 Phase 3a; docs/atlas-v2-design.md
   §2.8 "Author tooling", docs/card-authoring.md "Places (optional)").

     node .claude/add-places.js <cardId> <placeId> [<placeId> …]      add these ids (an id already on the card is left as it is)
     node .claude/add-places.js <cardId> -<placeId> [+<placeId> …]    a leading - removes an id, a leading + (or none) adds one
     node .claude/add-places.js <cardId> --list                        print the card's places with their names and kinds
     node .claude/add-places.js --find "<name>"                        look a name up in the registry (ids, kinds, coordinates)

   WHAT IT CHECKS. Every id must resolve in the places registry — the gazetteer (atlas/data/gazetteer.js: `adm0:…`, `adm1:…`,
   `city:…`, `sea:…`, `reg:…`, `lake:…`, `river:…`), the Phase 3 places (atlas/data/places.js: `pl:q<number>`) or the polity
   entity table (atlas/data/history.bin: `pol:<key>`); an id that does not is refused with the nearest names, and a name is
   never resolved for you (a name shared by two rows — Olympia, Moscow — would be a guess; `--find` shows the candidates and
   you choose). A place the registry lacks is added first with `node .claude/atlas-build/add-place.js --qid Q… --kind … --reason …`,
   then pointed at here. A card may not lose a place the migration derives from its own `locator`, `war` or `map`
   (migrate-places.js --check would fail CI): remove or change the old field first, or accept the derived id.

   The field is HEAVY (data-extra/<collection>.js), written through card-io.js — never by hand into data.js; sorted, distinct. */
"use strict";
const path = require("path");
const { loadCards, writeCards } = require("./card-io.js");
const R = require("./places-registry.js");
const argv = process.argv.slice(2);
const die = (m) => { console.error("add-places: " + m); process.exit(1); };
const reg = R.loadRegistry();
const describe = (id) => { const r = reg.rows.get(id); return r ? `${id}  ${r.name} (${r.kind}${r.sub ? "/" + r.sub : ""}${r.at ? ", " + r.at.join(", ") : ""}${r.span ? ", " + r.span.join("–") : ""})` : id + "  (not in the registry)"; };

if (argv[0] === "--find") {
  const q = R.fold(argv.slice(1).join(" ")); if (!q) die("--find needs a name");
  const hits = []; for (const [k, rows] of reg.byName) if (k === q || k.includes(q)) for (const r of rows) if (!hits.includes(r)) hits.push(r);
  hits.sort((a, b) => (R.fold(a.name) === q ? 0 : 1) - (R.fold(b.name) === q ? 0 : 1) || a.name.localeCompare(b.name));
  if (!hits.length) { console.log("nothing in the registry folds to \"" + q + "\" — add it with node .claude/atlas-build/add-place.js"); process.exit(0); }
  for (const r of hits.slice(0, 40)) console.log("  " + describe(r.id) + (reg.source(r.id) ? "  [" + reg.source(r.id) + "]" : ""));
  if (hits.length > 40) console.log("  … " + (hits.length - 40) + " more");
  process.exit(0);
}
const cardId = argv[0]; if (!cardId) die("usage: node .claude/add-places.js <cardId> <placeId…> | -<placeId> | --list | --find <name>");
const { cards, tree } = loadCards();
const card = cards.find((c) => c.id === cardId); if (!card) die(cardId + " is not a card");
const have = Array.isArray(card.places) ? card.places.slice() : [];
if (argv[1] === "--list" || argv.length === 1) { console.log(cardId + ": " + (have.length ? "" : "no places")); for (const id of have) console.log("  " + describe(id)); process.exit(0); }
const add = [], remove = [];
for (const a of argv.slice(1)) { if (a.startsWith("-")) remove.push(a.slice(1)); else add.push(a.startsWith("+") ? a.slice(1) : a); }
for (const id of add.concat(remove)) { if (!R.validId(id)) die("\"" + id + "\" is not a place id (adm0:… adm1:… city:… sea:… reg:… lake:… river:… pl:q… pol:…)"); if (!reg.rows.has(id)) { const near = []; const stem = R.fold(id.split(":").pop().replace(/[_-]/g, " ")); for (const [k, rows] of reg.byName) if (stem && (k.includes(stem) || stem.includes(k)) && k.length > 2) for (const r of rows) if (!near.includes(r)) near.push(r); die(id + " does not resolve in the registry" + (near.length ? "; nearest names: " + near.slice(0, 5).map((r) => r.id + " " + r.name).join("; ") : "") + " — add the place with node .claude/atlas-build/add-place.js first"); } }
// the derived ids a card may not lose: the migration's own derivation, recomputed for this card alone
let derived = new Set();
try { const M = require("./migrate-places.js"); const res = M.makeResolver(reg, M.loadCache()); if (card.locator && card.locator.name) { const t = M.collect([card]).values().next().value; if (t) { const r = res.resolve(t); if (r && r.id) derived.add(r.id); } } for (const id of have) if (id.startsWith("pol:") && reg.cardsOf(id).includes(cardId)) derived.add(id); } catch (e) { /* the registry alone then */ }
for (const id of remove) if (derived.has(id)) die(id + " is derived from the card's own locator or polity link; change that first (migrate-places.js --check would fail)");
const next = [...new Set(have.filter((id) => !remove.includes(id)).concat(add))].sort();
if (JSON.stringify(next) === JSON.stringify(have)) { console.log(cardId + ": unchanged"); process.exit(0); }
if (next.length) card.places = next; else delete card.places;
writeCards(cards, tree);
console.log(cardId + ": " + (next.length ? "" : "no places")); for (const id of next) console.log("  " + (have.includes(id) ? "  " : "+ ") + describe(id)); for (const id of remove) if (have.includes(id)) console.log("  - " + describe(id));
