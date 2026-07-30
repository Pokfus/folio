#!/usr/bin/env node
// Append a card to ../data.js and register its id in COLLECTION_TREE. Cheap regardless of file size
// (it parses + rewrites the array programmatically — no whole-file Edit). See CLAUDE.md.
//
//   node .claude/add-card.js <card.json> [deckId]
//
// <card.json>  a file holding ONE card object (all 13 fields), PLUS a `questions` array of 2 extra
//              question phrasings (3 in all — the site asks one at random), PLUS an `i18n` block with
//              the card translated into all 9 site languages (see CLAUDE.md):
//                "i18n": { "es": { "question": …, "questions": [q2, q3], "answer": …, "answerDate": …, "abstract": …, "answerText": … },
//                          "fr": …, "de": …, "it": …, "nl": …, "ru": …, "ar": …, "zh": … }
//              (pass "skipTranslations": true only for a deliberate English-only maintenance edit).
//              deckId defaults to the first leaf deck.
const fs = require("fs"), path = require("path");
const dataPath = path.join(__dirname, "..", "data.js");
const FIELDS = ["id","num","category","question","answer","answerDate","traditional","hanzi","pinyin","translations","abstract","citation","answerText"];
const I18N_LANGS = ["es","fr","de","it","nl","ru","ar","zh","ja"];
const I18N_FIELDS = ["question","answer","answerDate","abstract","answerText"];
// A question is ONE short clue — about 28 words (see CLAUDE.md "Add a card"). The blank counts as a word.
const Q_MIN = 20, Q_MAX = 34;
// Translations are checked loosely: Chinese/Japanese by character, the rest by word, both generous enough
// that only a question that was never shortened trips them.
const Q_TR_MAX_WORDS = 40, Q_TR_MAX_CHARS = 95;
const plain = (s) => String(s || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const qWords = (s) => plain(s).split(" ").filter(Boolean).length;

function loadWindow(file) { const win = {}; new Function("window", fs.readFileSync(file, "utf8"))(win); return win; }
function leafDecks(node, acc) { for (const ch of node.children || []) { if (ch.cardIds) acc.push(ch); if (ch.children) leafDecks(ch, acc); } return acc; }
function countIds(node) { const s = new Set(); (function w(n){ (n.cardIds||[]).forEach(i=>s.add(i)); (n.children||[]).forEach(w); })(node); return s.size; }

// Every official card asks its question 3 ways: `question` plus a `questions` array of exactly
// N_EXTRA further phrasings (each a full standalone clue under the same rules — mid-sentence blank,
// ~28 words). The site shows one of the three at random each time the card comes up. The data model
// allows up to 10 in all (community decks may experiment); official cards carry exactly 3.
const N_EXTRA = 2;

const cardFile = process.argv[2], deckId = process.argv[3];
if (!cardFile) { console.error("usage: node .claude/add-card.js <card.json> [deckId]"); process.exit(1); }
const card = JSON.parse(fs.readFileSync(cardFile, "utf8"));
for (const f of FIELDS) if (!(f in card)) { console.error("ERROR: card is missing field:", f); process.exit(1); }
if (!card.id) { console.error("ERROR: card.id is empty"); process.exit(1); }
if (!Array.isArray(card.questions) || card.questions.length !== N_EXTRA || card.questions.some(q => typeof q !== "string" || !q.trim())) {
  console.error("ERROR: card needs a `questions` array of exactly " + N_EXTRA + " EXTRA phrasings (3 questions in all — see CLAUDE.md). Each is a full standalone clue with its own mid-sentence blank.");
  process.exit(1);
}
for (const [qi, q] of [card.question, ...card.questions].entries()) {
  const qn = qWords(q);
  if (qn < Q_MIN || qn > Q_MAX) {
    console.error("ERROR: question " + (qi + 1) + " is " + qn + " words — it must be " + Q_MIN + "–" + Q_MAX + " (aim for ~28; see CLAUDE.md). Keep one identifying clue and move the rest into the abstract.");
    process.exit(1);
  }
  if (!/class="blank"/.test(q)) {
    console.error("ERROR: question " + (qi + 1) + " has no <span class=\"blank\">_____</span> — every phrasing blanks the answer mid-sentence.");
    process.exit(1);
  }
}
// nothing Folio shows is uncredited — the editors gate this too (wireMediaSource in app.js), and a card
// written straight into data.js has to meet the same rule or the credit is simply never added
for (const m of ["image", "video"]) {
  if (card[m] && String(card[m].src || "").trim() && !String(card[m].credit || "").trim()) {
    console.error("ERROR: card." + m + " has a src but no `credit` — every picture and clip carries its source (see CLAUDE.md).");
    process.exit(1);
  }
}
if (!card.skipTranslations) {   // every new card ships in all 9 site languages (i18n block -> shown by the language switcher)
  const missing = [];
  for (const l of I18N_LANGS) {
    const tr = (card.i18n || {})[l] || {};
    for (const f of I18N_FIELDS) if (!(typeof tr[f] === "string" && tr[f].trim())) missing.push(l + "." + f);
    // the phrasing pool translates as a set: every language carries the same number of extras
    if (!Array.isArray(tr.questions) || tr.questions.length !== N_EXTRA || tr.questions.some(q => typeof q !== "string" || !q.trim())) missing.push(l + ".questions[" + N_EXTRA + "]");
  }
  if (missing.length) { console.error("ERROR: card needs `i18n` translations for all 9 languages × 5 fields + the `questions` extras (missing: " + missing.slice(0, 10).join(", ") + (missing.length > 10 ? " … +" + (missing.length - 10) : "") + ") — or set skipTranslations:true for a deliberate English-only maintenance edit"); process.exit(1); }
  for (const l of I18N_LANGS) {   // a translation must be as short as the English, in its own idiom
    for (const q of [card.i18n[l].question, ...(card.i18n[l].questions || [])]) {
      const long = (l === "zh" || l === "ja") ? plain(q).length > Q_TR_MAX_CHARS : qWords(q) > Q_TR_MAX_WORDS;
      if (long) console.warn("WARNING: a " + l + " question looks much longer than the English — shorten it to match (see CLAUDE.md).");
    }
  }
}
delete card.skipTranslations;   // control flag only — never written to data.js

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
