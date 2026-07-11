#!/usr/bin/env node
// Append a card to ../data.js and register its id in COLLECTION_TREE. Cheap regardless of file size
// (it parses + rewrites the array programmatically — no whole-file Edit). See CLAUDE.md.
//
//   node .claude/add-card.js <card.json> [deckId]
//
// <card.json>  a file holding ONE card object (all 13 fields). deckId defaults to the first leaf deck.
const fs = require("fs"), path = require("path");
const dataPath = path.join(__dirname, "..", "data.js");
const FIELDS = ["id","num","category","question","answer","answerDate","traditional","hanzi","pinyin","translations","abstract","citation","answerText"];

function loadWindow(file) { const win = {}; new Function("window", fs.readFileSync(file, "utf8"))(win); return win; }
function leafDecks(node, acc) { for (const ch of node.children || []) { if (ch.cardIds) acc.push(ch); if (ch.children) leafDecks(ch, acc); } return acc; }
function countIds(node) { const s = new Set(); (function w(n){ (n.cardIds||[]).forEach(i=>s.add(i)); (n.children||[]).forEach(w); })(node); return s.size; }

const cardFile = process.argv[2], deckId = process.argv[3];
if (!cardFile) { console.error("usage: node .claude/add-card.js <card.json> [deckId]"); process.exit(1); }
const card = JSON.parse(fs.readFileSync(cardFile, "utf8"));
for (const f of FIELDS) if (!(f in card)) { console.error("ERROR: card is missing field:", f); process.exit(1); }
if (!card.id) { console.error("ERROR: card.id is empty"); process.exit(1); }

const win = loadWindow(dataPath), cards = win.CARD_DATA, tree = win.COLLECTION_TREE;
if (cards.some(c => c.id === card.id)) { console.error("ERROR: duplicate id:", card.id); process.exit(1); }
const leaves = []; for (const col of tree.collections) leafDecks(col, leaves);
const deck = deckId ? leaves.find(d => d.id === deckId) : leaves[0];
if (!deck) { console.error("ERROR: deck not found:", deckId, "| available:", leaves.map(d=>d.id).join(", ")); process.exit(1); }

cards.push(card);
deck.cardIds.push(card.id);
for (const col of tree.collections) col.total = Math.max(col.total || 0, countIds(col));   // keep total >= card count

const out =
  "/* Card data. Add cards one at a time with `node .claude/add-card.js <card.json> [deckId]` (see CLAUDE.md). */\n" +
  "window.CARD_DATA = [\n" + cards.map(c => JSON.stringify(c)).join(",\n") + "\n];\n\n" +
  "/* Collection -> deck -> sub-deck tree. Leaf decks carry a `cardIds` array. */\n" +
  "window.COLLECTION_TREE = " + JSON.stringify(tree, null, 2) + ";\n";
fs.writeFileSync(dataPath, out);
loadWindow(dataPath);   // re-parse to confirm the written file is valid JS
console.log("added card " + card.id + " -> deck " + deck.id + " | total cards: " + cards.length);
