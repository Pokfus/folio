const fs = require("fs");
const { TYPE, TYPE_ID, esc, measureHTML, charsHTML, examplesHTML, englishHTML } = require("./deckcore.js");

/* THE WHOLE OF HSK 3.0 AS ONE DECK (on request), where it was eleven — six levels and the 7–9 band cut
   into five parts to keep any one file usable. Two things happened at once and only together do they make
   this possible.

   Reverse cards halve it: a word was two rows and is now one note with two card templates, so the 21,792
   rows the eleven files held are 10,896 notes here, carrying the same 21,792 cards to study.

   And the LEVEL becomes the subdeck, which is the axis a learner actually works along. The old combined
   files spent their one subdeck axis on the study DIRECTION — Chinese → English and English → Chinese as
   two subdecks — and that is exactly what the two templates now express, so the axis came free. A reader
   adds "Level 3" to their daily study and gets both directions of the 491 words in it, which is what
   working through the syllabus looks like.

   The band the standard writes as 七至九级 is ONE level and stays one subdeck, at 5,562 notes the largest
   by a wide margin; its own two halves — 512 single characters and 5,088 words — are what the two
   subdecks under it would be, and are not split, because the standard does not split them and a reader
   who wants only the characters is not a reader the syllabus recognises.

     node build-hsk30.js                                                                                 */

const LEVELS = ["1", "2", "3", "4", "5", "6", "7"];
const SUB = { "1": "Level 1", "2": "Level 2", "3": "Level 3", "4": "Level 4", "5": "Level 5", "6": "Level 6", "7": "Levels 7–9" };
// rows in each official list, and the rows whose word is already carded at a lower level — both measured
const ROWS = { "1": 300, "2": 200, "3": 500, "4": 1000, "5": 1600, "6": 1800, "7": 5600 };
const CARRIED = { "1": 0, "2": 3, "3": 9, "4": 10, "5": 21, "6": 23, "7": 38 };

const DECK = "hsk30";
const STAMP = Date.parse("2026-08-10T00:00:00Z");

const cards = [];
let same = 0, withEx = 0, exN = 0;
const perLevel = [];
LEVELS.forEach((L) => {
  const words = JSON.parse(fs.readFileSync("w26-" + L + ".json", "utf8"));
  perLevel.push([L, words.length]);
  words.forEach((w, i) => {
    if (!w.trad) same++;
    if (w.examples && w.examples.length) { withEx++; exN += w.examples.length; }
    cards.push({
      id: "u_" + DECK + "_" + (cards.length + 1),
      num: String(i + 1), category: "HSK 3.0 " + SUB[L], sub: SUB[L],
      /* A Basic-shaped fallback, so a note still reads if it is ever detached from its type. It is the
         CHINESE → ENGLISH direction, template 1's — a note has one of these and two cards. */
      question: esc(w.simp) + (w.trad ? " / " + esc(w.trad) : ""),
      answer: esc(w.pinyin) + " — " + esc(w.senses.join("; ")),
      answerDate: "", answerText: w.senses.join("; "),
      traditional: w.trad, hanzi: w.simp, pinyin: w.pinyin, translations: "",
      abstract: "", citation: "",
      type: TYPE_ID,
      fields: {
        Simplified: w.simp, Traditional: w.trad, Pinyin: w.pinyin, Bopomofo: w.zhuyin,
        "Measure word": measureHTML(w.mw), English: englishHTML(w.senses),
        Characters: charsHTML(w.chars), Examples: examplesHTML(w.simp, w.examples),
      },
    });
  });
});

const N = cards.length;
const CARRIED_ALL = LEVELS.reduce((a, L) => a + CARRIED[L], 0);

const desc =
  "The whole of the official HSK 3.0 vocabulary in one deck — all seven levels, as subdecks you can add " +
  "and study one at a time. It is the standard as it now stands: the list announced at the end of 2025 " +
  "and in force from 2026, not the 2021 list it replaced, which is a different and much longer one (500 " +
  "words at Level 1 against 300). Levels 1 to 6 run 300, 200, 500, 1,000, 1,600 and 1,800 rows, and what " +
  "the standard writes as 七至九级 is a single level of 5,600 — 512 single characters and 5,088 words — " +
  "so that band is one subdeck here, as it is one level there. The official lists come to 11,000 rows " +
  "and this deck has " + N.toLocaleString() + " words, because a word listed again at a higher level " +
  "wherever it takes a new sense is one word to learn: " + CARRIED_ALL + " rows are words already carded " +
  "at a lower level, and where a level lists a word twice it has two readings, which one card shows " +
  "together with the definitions grouped under the reading they belong to. " +
  "Every word is ONE note with TWO cards — Chinese → English and English → Chinese — so each direction " +
  "is scheduled on its own (recognising a word comes long before producing it) while the word itself is " +
  "written once. " + N.toLocaleString() + " words, " + (N * 2).toLocaleString() + " cards. " +
  "Each card carries the simplified form, the traditional form, the syllabus's own pinyin, bopomofo, the " +
  "measure word where the word takes one, and the syllabus's own definition with its part of speech — the " +
  "sense the exam means, rather than every sense the word has. Traditional characters are shown at half " +
  "strength, and are omitted entirely where they are identical to the simplified — " + same.toLocaleString() +
  " of the " + N.toLocaleString() + " words. " +
  "Each card also breaks the word into its characters and shows the parts each one is written from, with " +
  "their readings and meanings, and carries a fold of real example sentences chosen to put the word in " +
  "different sentence shapes rather than the same one three times, with the word picked out in colour in " +
  "each and a speaker beside it. Above each sentence is its shape as a formula of word types — PRONOUN + " +
  "NOUN + ADVERB + ADJECTIVE. That formula is worked out by segmenting the sentence and looking every " +
  "word up in a part-of-speech table, so where one word is not in the table no formula is shown rather " +
  "than a guessed one. " +
  "Word list, pinyin and definitions: the official HSK 3.0 vocabulary lists. Traditional forms, bopomofo " +
  "and measure words: CC-CEDICT (CC BY-SA 4.0). Character parts and their meanings: Make Me a Hanzi. " +
  "Example sentences: Tatoeba (tatoeba.org), CC BY 2.0 FR — about half of that corpus is written in " +
  "traditional characters, and those sentences have been converted to simplified for this deck by a " +
  "character map derived from CC-CEDICT's own two columns; a sentence carrying a character whose " +
  "simplification depends on the word it is in was left out rather than guessed at.";

const deck = {
  folioDeck: 1,
  exportedAt: new Date(STAMP).toISOString(),
  meta: {
    id: DECK,
    title: "HSK 3.0 — Mandarin Chinese",
    subtitle: N.toLocaleString() + " words · all seven levels · both directions",
    desc: desc,
    author: "", language: "en",
    tags: ["chinese", "mandarin", "hsk", "hsk3.0", "vocabulary"],
    glossMode: "site", types: { [TYPE_ID]: TYPE },
    version: 1, createdAt: STAMP, updatedAt: STAMP, forkedFrom: null,
  },
  cards, gloss: {},
};

/* Written WITHOUT indentation, unlike the smaller decks: at this size a space per key is a megabyte of
   somebody's download for a file no one reads by eye. */
const out = "/home/user/folio/decks/HSK3.0-Mandarin.folio-deck.json";
fs.writeFileSync(out, JSON.stringify(deck));
console.log("HSK 3.0: " + N + " notes → " + N * 2 + " cards, " +
  (fs.statSync(out).size / 1048576).toFixed(1) + " MB");
perLevel.forEach(([L, n]) => console.log("   " + SUB[L].padEnd(12) + String(n).padStart(6) + " notes  (list has " + ROWS[L] + " rows)"));
console.log("   traditional identical to simplified: " + same + " / " + N);
console.log("   words with example sentences: " + withEx + " / " + N + " (" + exN + " sentences)");
