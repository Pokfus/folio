#!/usr/bin/env node
// Backfill EXTRA question phrasings onto EXISTING cards in ../data.js, in every language at once —
// the batch tool for giving the already-shipped single-question cards their full pool of 3
// (see CLAUDE.md "Generating cards"). It merges surgically: only `questions` and each language's
// `i18n[lang].questions` are written; every other field and every other language is untouched
// (unlike update-cards.js, whose whole-field assignment would clobber the rest of `i18n`).
//
//   node .claude/add-questions.js <batch.json> [--partial]
//
// <batch.json> = { "cards": { "<cardId>": {
//     "questions": ["<extra q2 html>", "<extra q3 html>"],          // REPLACES the card's extras
//     "i18n": { "es": ["q2", "q3"], "fr": …, … all 9 languages }     // per-language extras, same count
//   }, … } }
//
// Rules enforced (same as add-card.js): each English extra is 20–34 words with a mid-sentence
// <span class="blank">_____</span>; every language carries the SAME number of extras as English
// (all 9 required unless --partial); total phrasings per card ≤ 10 (official cards carry 3).
const fs = require("fs"), path = require("path");
const dataPath = path.join(__dirname, "..", "data.js");
const I18N_LANGS = ["es", "fr", "de", "it", "nl", "ru", "ar", "zh", "ja"];
/* ENGLISH ONLY, like add-card.js and add-glossary.js (Aug 2026, on request — see the MULTILANG bullet in
   CLAUDE.md). This tool demanded all nine translations until the card `i18n` blocks were REMOVED from
   data.js on 2026-08-08, after which it could only ever be run with `--partial` — a flag documented as
   being for a deliberate staged batch, not for the only shape the corpus can now have. Flip this back
   with the two in add-card.js and add-glossary.js when translations resume; a supplied translation is
   still checked either way, so the machinery below stays live rather than rotting. */
const REQUIRE_TRANSLATIONS = false;
const Q_MIN = 20, Q_MAX = 34, Q_TR_MAX_WORDS = 40, Q_TR_MAX_CHARS = 95, MAX_TOTAL = 10;
const plain = (s) => String(s || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
/* An IMPERIAL CONVERSION does not count towards a length limit (Aug 2026, on request). Measurements are
   written metric first with the imperial equivalent in parentheses, which costs about three words a figure
   and would otherwise squeeze the prose out of a card to make room for arithmetic. So the parenthetical is
   stripped before counting: the limit still binds what the card SAYS, and the conversion rides free. The
   pattern is deliberately narrow — a parenthesis holding a number and an imperial unit — so an ordinary
   aside is still counted (and asides are banned in an abstract anyway). */
const IMPERIAL_PAREN = /\s*\((?=[^)]*\d)[^)]*\b(?:miles?|foot|feet|ft|inch(?:es)?|in|yards?|pounds?|lbs?|ounces?|oz|tons?|acres?|sq\s?mi|°F)\b[^)]*\)/gi;
const unconverted = (s) => String(s || "").replace(IMPERIAL_PAREN, "");
const qWords = (s) => plain(unconverted(s)).split(" ").filter(Boolean).length;
function loadWindow(file) { const win = {}; new Function("window", fs.readFileSync(file, "utf8"))(win); return win; }

const batchFile = process.argv[2], partial = process.argv.includes("--partial");
if (!batchFile) { console.error("usage: node .claude/add-questions.js <batch.json> [--partial]"); process.exit(1); }
const batch = JSON.parse(fs.readFileSync(batchFile, "utf8"));
if (!batch || typeof batch.cards !== "object") { console.error("ERROR: batch file needs a `cards` object"); process.exit(1); }

const win = loadWindow(dataPath), cards = win.CARD_DATA, tree = win.COLLECTION_TREE;
const byId = new Map(cards.map(c => [c.id, c]));
const applied = [];
for (const id of Object.keys(batch.cards)) {
  const u = batch.cards[id], card = byId.get(id);
  if (!card) { console.error("ERROR: no card with id", id); process.exit(1); }
  const qs = u.questions;
  if (!Array.isArray(qs) || !qs.length || qs.some(q => typeof q !== "string" || !q.trim())) {
    console.error("ERROR: " + id + " needs a non-empty `questions` array of extra English phrasings"); process.exit(1);
  }
  if (1 + qs.length > MAX_TOTAL) { console.error("ERROR: " + id + " would carry " + (1 + qs.length) + " phrasings — the cap is " + MAX_TOTAL); process.exit(1); }
  for (const [i, q] of qs.entries()) {
    const n = qWords(q);
    if (n < Q_MIN || n > Q_MAX) { console.error("ERROR: " + id + " extra question " + (i + 2) + " is " + n + " words — it must be " + Q_MIN + "–" + Q_MAX + " (aim for ~28)"); process.exit(1); }
    if (!/class="blank"/.test(q)) { console.error("ERROR: " + id + " extra question " + (i + 2) + " has no <span class=\"blank\">_____</span>"); process.exit(1); }
    const dup = [card.question, ...qs.slice(0, i)].some(prev => plain(prev).toLowerCase() === plain(q).toLowerCase());
    if (dup) { console.error("ERROR: " + id + " extra question " + (i + 2) + " duplicates another phrasing — each must test the concept from a different angle"); process.exit(1); }
  }
  const tr = u.i18n || {};
  const missing = I18N_LANGS.filter(l => !(Array.isArray(tr[l]) && tr[l].length === qs.length && tr[l].every(q => typeof q === "string" && q.trim())));
  if (missing.length && !partial && REQUIRE_TRANSLATIONS) {
    console.error("ERROR: " + id + " needs `i18n` extras for all 9 languages, each with " + qs.length + " phrasings (missing/short: " + missing.join(", ") + ") — or pass --partial for a deliberate staged batch");
    process.exit(1);
  }
  for (const l of I18N_LANGS) {
    if (!Array.isArray(tr[l])) continue;
    for (const q of tr[l]) {
      const long = (l === "zh" || l === "ja") ? plain(q).length > Q_TR_MAX_CHARS : qWords(q) > Q_TR_MAX_WORDS;
      if (long) console.warn("WARNING: " + id + " has a " + l + " phrasing much longer than the English — shorten it to match");
    }
  }
  // merge: extras replace wholesale (per language); every other field / language is left alone
  card.questions = qs.slice();
  for (const l of I18N_LANGS) {
    if (!Array.isArray(tr[l])) continue;
    if (!card.i18n) card.i18n = {};
    if (!card.i18n[l]) { console.error("ERROR: " + id + " has no existing " + l + " translation block — translate the card first (add-lang.js), then its extra questions"); process.exit(1); }
    card.i18n[l] = Object.assign({}, card.i18n[l], { questions: tr[l].slice() });
  }
  applied.push(id);
}

const out =
  "/* Card data. Add cards one at a time with `node .claude/add-card.js <card.json> [deckId]` (see CLAUDE.md). */\n" +
  "window.CARD_DATA = [\n" + cards.map(c => JSON.stringify(c)).join(",\n") + "\n];\n\n" +
  "/* Collection -> deck -> sub-deck tree. Leaf decks carry a `cardIds` array. */\n" +
  "window.COLLECTION_TREE = " + JSON.stringify(tree, null, 2) + ";\n";
fs.writeFileSync(dataPath, out);
loadWindow(dataPath);   // re-parse to confirm valid JS
const done = cards.filter(c => Array.isArray(c.questions) && c.questions.length).length;
console.log("added extra questions to " + applied.length + " cards: " + applied.join(", ") + " | cards with a full pool now: " + done + "/" + cards.length);
