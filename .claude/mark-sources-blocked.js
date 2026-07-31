#!/usr/bin/env node
// Record that a card was researched and CANNOT be brought to the citation bar — the red mark in the Edit
// page's card list (see `cardSourceState` in app.js, and docs/citation-plan.md "The red mark").
//
//   node .claude/mark-sources-blocked.js <batch.json>
//
// <batch.json> = {
//   "blocked": { "<cardId>": "<why, in one sentence: what was searched and what is closed>", … },
//   "clear":   ["<cardId>", …]        // a card unblocked by a later pass — the flag comes back off
// }
//
// The flag is a CONCLUSION, not a guess. A card earns it only after a batch has actually gone looking:
// named the works its claims rest on, tried the open deposit, the review that restates a closed original,
// the holding institution's catalogue and the file-not-the-landing-page trick, and come back short.
// Marking a card unsourceable before searching is precisely the failure the footnote apparatus exists to
// prevent, so the reason string is required and has to say what was tried.
//
// It is stored on the card in data.js as `sourcesBlocked` and rides through the in-app editor untouched
// (serializeCardData carries it, exactly as it carries `sources`). It is never shown to a reader — the
// citation fold shows the sources a card HAS; a card that cannot be cited simply has none.
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const dataPath = path.join(root, "data.js");

function loadWindow(file) { const win = {}; new Function("window", fs.readFileSync(file, "utf8"))(win); return win; }
function die(msg) { console.error("ERROR: " + msg); process.exit(1); }

const appSrc = fs.readFileSync(path.join(root, "app.js"), "utf8");
const tm = /const SRC_TARGET = (\d+);/.exec(appSrc);
const TARGET = tm ? +tm[1] : 5;

const batchFile = process.argv[2];
if (!batchFile) die("usage: node .claude/mark-sources-blocked.js <batch.json>");
const batch = JSON.parse(fs.readFileSync(batchFile, "utf8"));
if (!batch.blocked && !batch.clear) die("batch file needs a `blocked` object and/or a `clear` array");

const win = loadWindow(dataPath), cards = win.CARD_DATA, tree = win.COLLECTION_TREE;
const byId = new Map(cards.map((c) => [c.id, c]));
const marked = [], cleared = [];

for (const id of Object.keys(batch.blocked || {})) {
  const card = byId.get(id);
  if (!card) die("no card with id " + id);
  const why = String(batch.blocked[id] || "").replace(/\s+/g, " ").trim();
  if (why.length < 30) die("card " + id + " needs a real reason — what was searched, and what turned out to be closed or absent. A bare flag tells the next pass nothing and invites it to re-do the same search.");
  const n = Array.isArray(card.sources) ? card.sources.length : 0;
  if (n >= TARGET) die("card " + id + " already carries " + n + " sources, which meets the bar of " + TARGET + " — it is not blocked.");
  card.sourcesBlocked = why;
  marked.push(id + " (" + n + "/" + TARGET + ")");
}
for (const id of batch.clear || []) {
  const card = byId.get(id);
  if (!card) die("no card with id " + id);
  if (card.sourcesBlocked) { delete card.sourcesBlocked; cleared.push(id); }
}

const out =
  "/* Card data. Add cards one at a time with `node .claude/add-card.js <card.json> [deckId]` (see CLAUDE.md). */\n" +
  "window.CARD_DATA = [\n" + cards.map((c) => JSON.stringify(c)).join(",\n") + "\n];\n\n" +
  "/* Collection -> deck -> sub-deck tree. Leaf decks carry a `cardIds` array. */\n" +
  "window.COLLECTION_TREE = " + JSON.stringify(tree, null, 2) + ";\n";
fs.writeFileSync(dataPath, out);
loadWindow(dataPath);   // re-parse to confirm valid JS

if (marked.length) console.log("marked blocked: " + marked.join(", "));
if (cleared.length) console.log("unblocked: " + cleared.join(", "));
const all = loadWindow(dataPath).CARD_DATA || [];
const short = all.filter((c) => (Array.isArray(c.sources) ? c.sources.length : 0) < TARGET);
console.log("coverage: cards at the " + TARGET + "-source bar " + (all.length - short.length) + "/" + all.length +
  " | below it " + short.length + " (" + short.filter((c) => c.sourcesBlocked).length + " blocked)");
