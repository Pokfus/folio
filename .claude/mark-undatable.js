#!/usr/bin/env node
// Mark a card whose ANSWER TERM does not happen at a time — the Timeline game's own filter (see
// `cardUndatable` in app.js, and the "TERMS THAT DO NOT HAPPEN AT A TIME" comment beside it).
//
//   node .claude/mark-undatable.js <batch.json>
//
// <batch.json> = {
//   "undatable": { "<cardId>": "<why, in one sentence: what kind of thing the term names>", … },
//   "clear":     ["<cardId>", …]        // a card the flag turns out not to belong on
// }
//
// WHAT THE FLAG SAYS is that the year the game would place the card at is not a date the term is
// conventionally given. It fails two ways. A term may not be located in time at all — a physical feature
// (Tiber, Apennines), a material (Ochre), a condition (Ice age), a way of life (Hunter-gatherer), a
// category (zoonotic disease), a question (origins of social inequality) or a modern method (ancient
// DNA). Or it may name a process so diffuse that the earliest figure on its date line is one arbitrary
// moment inside it: `human evolution` sorts at 8 Mya because that is when the ape line split, which is
// not when human evolution happened — it is one end of the span the term names as a whole.
//
// WHAT IT DOES NOT SAY is that a long process cannot be dated. `domestication`, `animal domestication`
// and `Neolithic Revolution` all ran for millennia and all sort at the onset a reader would give them,
// which is the precision a Timeline round is answered to. Flagging those would empty the game of exactly
// the terms it is for. The reason string is required for that reason: it has to name the kind of thing
// the term is, so the next pass can tell a judgement from a habit.
//
// IT IS TIMELINE'S RULE AND NOTHING ELSE'S. The other games ask what a term IS, and the deck's own
// chronological order is untouched — human evolution still files at 8 Mya among its neighbours, which is
// where a reader studying it expects to meet it.
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const dataPath = path.join(root, "data.js");

function loadWindow(file) { const win = {}; new Function("window", fs.readFileSync(file, "utf8"))(win); return win; }
function die(msg) { console.error("ERROR: " + msg); process.exit(1); }

// the games' bar, read out of app.js rather than restated, so the coverage line below cannot come to
// describe a different pool from the one the site actually deals
const appSrc = fs.readFileSync(path.join(root, "app.js"), "utf8");
const bm = /const GAME_MAX_DIFFICULTY = (\d+);/.exec(appSrc);
if (!bm) die("could not find GAME_MAX_DIFFICULTY in app.js — the coverage report below would be guessing.");
const BAR = +bm[1];

const batchFile = process.argv[2];
if (!batchFile) die("usage: node .claude/mark-undatable.js <batch.json>");
const batch = JSON.parse(fs.readFileSync(batchFile, "utf8"));
if (!batch.undatable && !batch.clear) die("batch file needs an `undatable` object and/or a `clear` array");

const win = loadWindow(dataPath), cards = win.CARD_DATA, tree = win.COLLECTION_TREE;
const byId = new Map(cards.map((c) => [c.id, c]));
const marked = [], cleared = [];

for (const id of Object.keys(batch.undatable || {})) {
  const card = byId.get(id);
  if (!card) die("no card with id " + id);
  const why = String(batch.undatable[id] || "").replace(/\s+/g, " ").trim();
  if (why.length < 20) die("card " + id + " needs a real reason — what kind of thing its answer term names, and why the year the deck sorts it at is not a date the term is given. A bare flag reads as a card somebody found awkward.");
  card.undatable = true;
  marked.push(id + " — " + (card.answerText || "?"));
}
for (const id of batch.clear || []) {
  const card = byId.get(id);
  if (!card) die("no card with id " + id);
  if (card.undatable) { delete card.undatable; cleared.push(id + " — " + (card.answerText || "?")); }
}

const out =
  "/* Card data. Add cards one at a time with `node .claude/add-card.js <card.json> [deckId]` (see CLAUDE.md). */\n" +
  "window.CARD_DATA = [\n" + cards.map((c) => JSON.stringify(c)).join(",\n") + "\n];\n\n" +
  "/* Collection -> deck -> sub-deck tree. Leaf decks carry a `cardIds` array. */\n" +
  "window.COLLECTION_TREE = " + JSON.stringify(tree, null, 2) + ";\n";
fs.writeFileSync(dataPath, out);
loadWindow(dataPath);   // re-parse to confirm valid JS

if (marked.length) console.log("marked undatable:\n  " + marked.join("\n  "));
if (cleared.length) console.log("cleared:\n  " + cleared.join("\n  "));

/* The pool the Timeline game is left with. A flag that starves it is the opposite failure and just as
   quiet — the game shows a placard that reads as content nobody has written yet — so the count of
   DISTINCT YEARS is printed, that being what the puzzle actually needs five of. */
const all = loadWindow(dataPath).CARD_DATA || [];
const flagged = all.filter((c) => c.undatable);
const pool = all.filter((c) => Number.isInteger(c.difficulty) && c.difficulty <= BAR && !c.undatable);
console.log("undatable: " + flagged.length + " of " + all.length + " cards" +
  " | Timeline pool " + pool.length + " (of " + all.filter((c) => Number.isInteger(c.difficulty) && c.difficulty <= BAR).length + " at or below difficulty " + BAR + ")");
