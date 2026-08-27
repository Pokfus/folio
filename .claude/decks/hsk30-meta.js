/* THE NINE MANDARIN DECKS — one table, required by build-mandarin.js so the generator and the shipped
   files cannot come to disagree about what a deck is called or what it says about itself.

   IT WAS ONE FILE UNTIL AUG 2026, and the reason it is nine is a request: "It shouldn't download the
   whole collection at once, its cards should be divided into decks the same as the other collections."
   One file of nine subdecks meant every row on the Collections page read 20.6 MB and pressing any of
   them fetched all nine — where a DELE level is its own file and downloads alone. The argument the one
   file was built on (a level, the phrases and the idioms are the same card type from one corpus, so
   three files was three imports) is answered by the collection banner instead: it adds the whole
   language at once, and each deck still arrives on its own.

   A DECK ID IS PERMANENT, so these are new ids rather than the old `hsk1`/`hsk2`, which belonged to the
   2012-standard decks deleted in Aug 2026 and would hand a reader who still has one a silent update to
   a different deck.

   THE CARDS CARRY NO `sub`. A level is the deck now, so a subdeck named after its own deck would be a
   fold with one row in it; the two direction rows a reader studies come from the card TYPE's two
   templates, as they do on every other language deck here. */
"use strict";

/* Rows carried up from a lower level — a word listed again wherever it takes a new sense. */
const CARRIED = { "Level 1": 0, "Level 2": 3, "Level 3": 9, "Level 4": 10, "Level 5": 21, "Level 6": 23, "Levels 7–9": 38 };

const FORMAT =
  "Every word is ONE note with TWO cards — Chinese → English and English → Chinese — so each direction is " +
  "scheduled on its own, and answering one puts the other off until tomorrow rather than testing the last " +
  "five minutes. Each card carries the simplified form, the traditional form, pinyin, bopomofo, the measure " +
  "word where the word takes one, and the definition; breaks the word into its characters and shows the " +
  "parts each one is written from, with their readings and meanings; and carries a fold of real example " +
  "sentences with the word picked out in colour and a speaker beside it.";

const SOURCES =
  "Word list, pinyin and definitions: the official HSK 3.0 vocabulary lists, and CC-CEDICT (CC BY-SA 4.0) " +
  "for the phrases and idioms. Traditional forms, bopomofo and measure words: CC-CEDICT. How common a " +
  "phrase or idiom is: the OpenSubtitles 2018 Mandarin frequency list, via hermitdave/FrequencyWords " +
  "(CC BY-SA 4.0). Character parts and their meanings: Make Me a Hanzi. Example sentences: Tatoeba " +
  "(tatoeba.org), CC BY 2.0 FR — about half of that corpus is written in traditional characters, and those " +
  "have been converted to simplified by a character map derived from CC-CEDICT's own two columns; a " +
  "sentence carrying a character whose simplification depends on the word it is in was left out rather " +
  "than guessed at.";

const STANDARD =
  "THE STANDARD is the list announced at the end of 2025 and in force from 2026, not the 2021 list it " +
  "replaced, which is a different and much longer one (500 words at Level 1 against 300). What the standard " +
  "writes as 七至九级 is a single level of 5,600 — 512 characters and 5,088 words — so that band is one " +
  "deck here as it is one level there. Above each example sentence is its shape as a formula of word types " +
  "— PRONOUN + NOUN + ADVERB + ADJECTIVE — worked out by segmenting the sentence and looking every word up " +
  "in a part-of-speech table, so where one word is not in the table no formula is shown rather than a " +
  "guessed one.";

function hskDesc(sub, ctx) {
  const carried = CARRIED[sub] || 0;
  return "The " + sub.toLowerCase() + " vocabulary of the official HSK 3.0 syllabus: " +
    ctx.n.toLocaleString() + " words, " + (ctx.n * 2).toLocaleString() + " cards. " + FORMAT + " — " + STANDARD +
    " The official list for this level runs " + ctx.rows.toLocaleString() + " rows and this deck holds " +
    ctx.n.toLocaleString() + ", because a word listed again at a higher level wherever it takes a new sense " +
    "is one word to learn: " + carried + " of those rows are words already carded at a lower level, and " +
    "where a level lists a word twice it has two readings, which one card shows together with the " +
    "definitions grouped under the reading they belong to. Traditional characters are shown at half " +
    "strength and omitted where they are identical to the simplified — " + ctx.same.toLocaleString() +
    " of the " + ctx.n.toLocaleString() + ". — " + SOURCES;
}

/* A deck's own one-line subtitle. The UNIT is per deck because "159 words" is the wrong word for a
   set expression and "477 words" for a four-character idiom: a chengyu is four words and one thing to
   learn. */
function subtitleOf(unit, n) {
  return n.toLocaleString() + " " + unit + " \u00b7 both directions";
}

const HSK_TAGS = ["chinese", "mandarin", "hsk", "hsk3.0", "vocabulary"];

const DECKS = [
  { sub: "Level 1", id: "hsk30l1", file: "Mandarin-HSK-3.0-Level-1.folio-deck.json", title: "Mandarin Chinese — HSK 3.0 Level 1", rows: 300, unit: "words", tags: HSK_TAGS, desc: hskDesc },
  { sub: "Level 2", id: "hsk30l2", file: "Mandarin-HSK-3.0-Level-2.folio-deck.json", title: "Mandarin Chinese — HSK 3.0 Level 2", rows: 200, unit: "words", tags: HSK_TAGS, desc: hskDesc },
  { sub: "Level 3", id: "hsk30l3", file: "Mandarin-HSK-3.0-Level-3.folio-deck.json", title: "Mandarin Chinese — HSK 3.0 Level 3", rows: 500, unit: "words", tags: HSK_TAGS, desc: hskDesc },
  { sub: "Level 4", id: "hsk30l4", file: "Mandarin-HSK-3.0-Level-4.folio-deck.json", title: "Mandarin Chinese — HSK 3.0 Level 4", rows: 1000, unit: "words", tags: HSK_TAGS, desc: hskDesc },
  { sub: "Level 5", id: "hsk30l5", file: "Mandarin-HSK-3.0-Level-5.folio-deck.json", title: "Mandarin Chinese — HSK 3.0 Level 5", rows: 1600, unit: "words", tags: HSK_TAGS, desc: hskDesc },
  { sub: "Level 6", id: "hsk30l6", file: "Mandarin-HSK-3.0-Level-6.folio-deck.json", title: "Mandarin Chinese — HSK 3.0 Level 6", rows: 1800, unit: "words", tags: HSK_TAGS, desc: hskDesc },
  { sub: "Levels 7–9", id: "hsk30l7", file: "Mandarin-HSK-3.0-Levels-7-9.folio-deck.json", title: "Mandarin Chinese — HSK 3.0 Levels 7–9", rows: 5600, unit: "words", tags: HSK_TAGS, desc: hskDesc },
  {
    sub: "Phrases", id: "hsk30phr", file: "Mandarin-Everyday-Phrases.folio-deck.json",
    title: "Mandarin Chinese — Everyday phrases",
    unit: "expressions", tags: ["chinese", "mandarin", "phrases", "expressions", "conversation"],
    desc: (sub, ctx) =>
      ctx.n + " set expressions — greetings, replies, exclamations and the small formulas a conversation is " +
      "held together by — none of them in any HSK list of either standard. " + FORMAT + " — " +
      "The syllabus already covers most of the common ones (of a probe list of thirty-six expressions a " +
      "beginner meets, twenty-four are in the HSK decks), so this is the remainder and it is short by " +
      "nature. An entry is here if it appears at least 150 times in a corpus of film subtitles or at least " +
      "once in the Tatoeba sentence corpus — two independent measures, and both are needed, because the " +
      "frequency list is word-segmented and cannot see a phrase like 对我来说 at all, while Tatoeba reads " +
      "running text and can. What counts as a phrase rather than a word is decided on the dictionary's own " +
      "definition: an entry whose first sense exclaims, asks a question or has a person in it, against one " +
      "that reads “to …”, “a …” or “the …”, which is a verb or a noun however conversational it is. That " +
      "rule is strict and it misses things — 好久不见, 没问题 and 太好了 are all complete utterances whose " +
      "definitions are two or three plain words with nothing in them to say so. Archaic, literary, dialectal " +
      "and coarse entries are left out. Only " + ctx.withEx + " of them carry an example sentence. — " + SOURCES,
  },
  {
    sub: "Idioms", id: "hsk30idm", file: "Mandarin-Idioms.folio-deck.json",
    title: "Mandarin Chinese — Idioms (chengyu)",
    unit: "idioms", tags: ["chinese", "mandarin", "idioms", "chengyu", "成语"],
    desc: (sub, ctx) =>
      ctx.n + " 成语 chéngyǔ, each a compressed story or image that means something its four characters do " +
      "not say outright: those the dictionary marks as idioms, that appear at least 60 times in a corpus of " +
      "film subtitles, and that are in no HSK list — 5,227 non-syllabus idioms are in the dictionary and " +
      "this is the head of that list. " + FORMAT + " — " +
      "Only " + ctx.withEx + " of them carry an example sentence, and that is the subject rather than a gap: " +
      "an idiom is literary, the sentence corpus is conversational, and of all 5,227 only 361 appear in it " +
      "even once. What stands in for it is the definition — the dictionary gives a chengyu both readings " +
      "where they differ, the literal picture and what it is used to mean — and the character breakdown " +
      "under it, which for an idiom is most of the explanation. — " + SOURCES,
  },
];

module.exports = { DECKS, CARRIED, FORMAT, SOURCES, STANDARD, hskDesc, subtitleOf };
