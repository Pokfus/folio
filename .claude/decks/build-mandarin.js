/* ONE MANDARIN DECK (Aug 2026, on request), with nine subdecks: the seven HSK 3.0 levels, the phrases the
   syllabus leaves out, and the chengyu.

   It supersedes the three files it is built from. The two extra decks are not HSK, so the deck is no longer
   titled as though it were — a reader adding "HSK 3.0" and finding idioms in it has been told something
   untrue, and the subdeck rows say which is which.

     node build-mandarin.js                                                                               */
const fs = require("fs");
const { TYPE, TYPE_ID, esc, measureHTML, charsHTML, examplesHTML, englishHTML } = require("./deckcore.js");
const extra = require("./build-extra.js");

const LEVELS = ["1", "2", "3", "4", "5", "6", "7"];
const SUB = { "1": "Level 1", "2": "Level 2", "3": "Level 3", "4": "Level 4", "5": "Level 5", "6": "Level 6", "7": "Levels 7–9" };
const ROWS = { "1": 300, "2": 200, "3": 500, "4": 1000, "5": 1600, "6": 1800, "7": 5600 };
const CARRIED = { "1": 0, "2": 3, "3": 9, "4": 10, "5": 21, "6": 23, "7": 38 };
const DECK = "hsk30";                 // unchanged, so a reader who already has it gets an update rather than a second deck
const STAMP = Date.parse("2026-08-10T00:00:00Z");

const cards = [];
let same = 0, hskWithEx = 0;
const per = [];
LEVELS.forEach((L) => {
  const words = JSON.parse(fs.readFileSync("w26-" + L + ".json", "utf8"));
  per.push([SUB[L], words.length]);
  words.forEach((w, i) => {
    if (!w.trad) same++;
    if (w.examples && w.examples.length) hskWithEx++;
    cards.push({
      id: "u_" + DECK + "_" + (cards.length + 1),
      num: String(i + 1), category: "HSK 3.0 " + SUB[L], sub: SUB[L],
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
const hskN = cards.length;

// …and the two the syllabus leaves out, built by build-extra.js and filed as the eighth and ninth subdecks
let extraEx = 0;
[["Phrases", extra.phrases], ["Idioms", extra.idioms]].forEach(([sub, rows]) => {
  per.push([sub, rows.length]);
  rows.forEach((e, i) => {
    const note = extra.noteOf(e, DECK, cards.length, sub);
    note.id = "u_" + DECK + "_" + (cards.length + 1);
    note.num = String(i + 1);
    note.sub = sub;
    if (note._ex) extraEx++;
    delete note._ex;
    cards.push(note);
  });
});

const N = cards.length;
const CARRIED_ALL = LEVELS.reduce((a, L) => a + CARRIED[L], 0);
const PH = extra.phrases.length, ID = extra.idioms.length;

const desc =
  "Mandarin vocabulary in one deck, as nine subdecks you can add and study one at a time: the seven levels " +
  "of the official HSK 3.0 syllabus, the everyday expressions the syllabus leaves out, and the four-character " +
  "idioms. " + N.toLocaleString() + " words, " + (N * 2).toLocaleString() + " cards. " +
  "Every word is ONE note with TWO cards — Chinese → English and English → Chinese — so each direction is " +
  "scheduled on its own, and answering one puts the other off until tomorrow rather than testing the last " +
  "five minutes. " +
  "Each card carries the simplified form, the traditional form, pinyin, bopomofo, the measure word where " +
  "the word takes one, and the definition; breaks the word into its characters and shows the parts each one " +
  "is written from, with their readings and meanings; and carries a fold of real example sentences with the " +
  "word picked out in colour and a speaker beside it. " +
  "— " +
  "THE SEVEN HSK SUBDECKS are the standard as it now stands: the list announced at the end of 2025 and in " +
  "force from 2026, not the 2021 list it replaced, which is a different and much longer one (500 words at " +
  "Level 1 against 300). Levels 1 to 6 run 300, 200, 500, 1,000, 1,600 and 1,800 rows, and what the standard " +
  "writes as 七至九级 is a single level of 5,600 — 512 characters and 5,088 words — so that band is one " +
  "subdeck here as it is one level there. The official lists come to 11,000 rows and these subdecks hold " +
  hskN.toLocaleString() + " words, because a word listed again at a higher level wherever it takes a new " +
  "sense is one word to learn: " + CARRIED_ALL + " rows are words already carded at a lower level, and where " +
  "a level lists a word twice it has two readings, which one card shows together with the definitions " +
  "grouped under the reading they belong to. Traditional characters are shown at half strength and omitted " +
  "where they are identical to the simplified — " + same.toLocaleString() + " of the " + hskN.toLocaleString() + ". " +
  "Above each example sentence is its shape as a formula of word types — PRONOUN + NOUN + ADVERB + ADJECTIVE " +
  "— worked out by segmenting the sentence and looking every word up in a part-of-speech table, so where one " +
  "word is not in the table no formula is shown rather than a guessed one. " +
  "— " +
  "PHRASES holds " + PH + " set expressions — greetings, replies, exclamations and the small formulas a " +
  "conversation is held together by — none of them in any HSK list of either standard. The syllabus already " +
  "covers most of the common ones (of a probe list of thirty-six expressions a beginner meets, twenty-four " +
  "are in the HSK subdecks), so this is the remainder and it is short by nature. An entry is here if it " +
  "appears at least 150 times in a corpus of film subtitles or at least once in the Tatoeba sentence corpus " +
  "— two independent measures, and both are needed, because the frequency list is word-segmented and cannot " +
  "see a phrase like 对我来说 at all, while Tatoeba reads running text and can. What counts as a phrase " +
  "rather than a word is decided on the dictionary's own definition: an entry whose first sense exclaims, " +
  "asks a question or has a person in it, against one that reads “to …”, “a …” or “the …”, which is a verb " +
  "or a noun however conversational it is. That rule is strict and it misses things — 好久不见, 没问题 and " +
  "太好了 are all complete utterances whose definitions are two or three plain words with nothing in them to " +
  "say so. Archaic, literary, dialectal and coarse entries are left out. " +
  "— " +
  "IDIOMS holds " + ID + " 成语 chéngyǔ, each a compressed story or image that means something its four " +
  "characters do not say outright: those the dictionary marks as idioms, that appear at least 60 times in " +
  "that same subtitle corpus, and that are in no HSK list — 5,227 non-syllabus idioms are in the dictionary " +
  "and this is the head of that list. Only " + extraEx + " of the phrases and idioms together carry an " +
  "example sentence, and for the idioms that is the subject rather than a gap: an idiom is literary, the " +
  "sentence corpus is conversational, and of all 5,227 only 361 appear in it even once. What stands in for " +
  "it is the definition — the dictionary gives a chengyu both readings where they differ, the literal " +
  "picture and what it is used to mean — and the character breakdown under it, which for an idiom is most " +
  "of the explanation. " +
  "— " +
  "Word list, pinyin and definitions: the official HSK 3.0 vocabulary lists, and CC-CEDICT (CC BY-SA 4.0) " +
  "for the phrases and idioms. Traditional forms, bopomofo and measure words: CC-CEDICT. How common a " +
  "phrase or idiom is: the OpenSubtitles 2018 Mandarin frequency list, via hermitdave/FrequencyWords " +
  "(CC BY-SA 4.0). Character parts and their meanings: Make Me a Hanzi. Example sentences: Tatoeba " +
  "(tatoeba.org), CC BY 2.0 FR — about half of that corpus is written in traditional characters, and those " +
  "have been converted to simplified by a character map derived from CC-CEDICT's own two columns; a " +
  "sentence carrying a character whose simplification depends on the word it is in was left out rather " +
  "than guessed at.";

const deck = {
  folioDeck: 1,
  exportedAt: new Date(STAMP).toISOString(),
  meta: {
    id: DECK,
    title: "Mandarin Chinese — HSK 3.0, phrases and idioms",
    subtitle: N.toLocaleString() + " words · nine subdecks · both directions",
    desc: desc,
    author: "", language: "en",
    tags: ["chinese", "mandarin", "hsk", "hsk3.0", "vocabulary", "phrases", "idioms", "chengyu"],
    glossMode: "site", types: { [TYPE_ID]: TYPE },
    version: 2, createdAt: STAMP, updatedAt: STAMP, forkedFrom: null,
  },
  cards, gloss: {},
};

const out = "/home/user/folio/decks/Mandarin-Chinese.folio-deck.json";
fs.writeFileSync(out, JSON.stringify(deck));
console.log("Mandarin Chinese: " + N + " notes → " + N * 2 + " cards, " +
  (fs.statSync(out).size / 1048576).toFixed(1) + " MB");
per.forEach(([s, n]) => console.log("   " + s.padEnd(12) + String(n).padStart(6) + " notes"));
console.log("   with example sentences: " + (hskWithEx + extraEx) + " / " + N);
