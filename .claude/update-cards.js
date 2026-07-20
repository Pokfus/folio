#!/usr/bin/env node
// Update existing cards in ../data.js IN PLACE by id — merges the given fields into each matching
// card object (keeping id, num, category, answer, and the Chinese/citation fields), leaving every
// other card and the collection tree untouched. Mirrors add-card.js's serialization.
//
//   node .claude/update-cards.js <updates.json>
//
// <updates.json> is an ARRAY of objects, each { "id": "wh-001", ...fields to overwrite... }.
// Typical fields: question, answerDate, abstract, answerText, i18n. Only the keys present are
// overwritten; "id" selects the card and is never changed.
const fs = require("fs"), path = require("path");
const dataPath = path.join(__dirname, "..", "data.js");
function loadWindow(file) { const win = {}; new Function("window", fs.readFileSync(file, "utf8"))(win); return win; }

const updFile = process.argv[2];
if (!updFile) { console.error("usage: node .claude/update-cards.js <updates.json>"); process.exit(1); }
const updates = JSON.parse(fs.readFileSync(updFile, "utf8"));
if (!Array.isArray(updates)) { console.error("ERROR: updates file must be a JSON array"); process.exit(1); }

const win = loadWindow(dataPath), cards = win.CARD_DATA, tree = win.COLLECTION_TREE;
const byId = new Map(cards.map(c => [c.id, c]));
const applied = [];
for (const u of updates) {
  if (!u.id) { console.error("ERROR: an update entry has no id"); process.exit(1); }
  const card = byId.get(u.id);
  if (!card) { console.error("ERROR: no card with id", u.id); process.exit(1); }
  for (const k of Object.keys(u)) { if (k === "id") continue; card[k] = u[k]; }
  applied.push(u.id);
}

const out =
  "/* Card data. Add cards one at a time with `node .claude/add-card.js <card.json> [deckId]` (see CLAUDE.md). */\n" +
  "window.CARD_DATA = [\n" + cards.map(c => JSON.stringify(c)).join(",\n") + "\n];\n\n" +
  "/* Collection -> deck -> sub-deck tree. Leaf decks carry a `cardIds` array. */\n" +
  "window.COLLECTION_TREE = " + JSON.stringify(tree, null, 2) + ";\n";
fs.writeFileSync(dataPath, out);
loadWindow(dataPath);   // re-parse to confirm valid JS
console.log("updated " + applied.length + " cards: " + applied.join(", ") + " | total cards: " + cards.length);
