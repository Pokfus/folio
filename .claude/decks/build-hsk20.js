/* The HSK 2.0 decks, one per level, on the shared card type — so each word is ONE note with a Chinese →
   English card and an English → Chinese card rather than two rows saying the same thing twice.

   THEY ARE NOT COMBINED, unlike HSK 3.0. Two levels of 150 words each is not a collection, and the two
   standards are different exams: a reader studying the older syllabus wants the older syllabus, and rolling
   its levels together would say they were one thing.

     node build-hsk20.js                                                                                  */
const fs = require("fs");
const { TYPE, TYPE_ID, esc, measureHTML, charsHTML, examplesHTML, englishHTML } = require("./deckcore.js");

const STAMP = Date.parse("2026-08-10T00:00:00Z");

["1", "2"].forEach((LEVEL) => {
  const words = JSON.parse(fs.readFileSync("words" + LEVEL + ".json", "utf8"));
  const N = words.length, SAME = words.filter((w) => !w.trad).length;
  const HSK = "HSK " + LEVEL;
  const DECK = "hsk" + LEVEL + "all";
  const cards = words.map((w, i) => ({
    id: "u_" + DECK + "_" + (i + 1),
    num: String(i + 1), category: HSK, sub: "",
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
  }));
  const deck = {
    folioDeck: 1, exportedAt: new Date(STAMP).toISOString(),
    meta: {
      id: DECK,
      title: HSK + " — Mandarin Chinese",
      subtitle: N + " words · both directions",
      desc:
        "The official HSK " + LEVEL + " vocabulary of the 2012 standard — the one most textbooks and most " +
        "existing decks still follow, and a different list from HSK 3.0, which replaced it and is on these " +
        "shelves as its own deck. " +
        "Every word is ONE note with TWO cards — Chinese → English and English → Chinese — so each " +
        "direction is scheduled on its own while the word itself is written once. " + N + " words, " +
        (N * 2) + " cards. " +
        "Every card carries the simplified form, the traditional form, pinyin, bopomofo, the measure word " +
        "where the word takes one, and the syllabus's own definition. Traditional characters are shown at " +
        "half strength, and are omitted entirely where they are identical to the simplified — " + SAME +
        " of the " + N + " words. " +
        "Each card also breaks the word into its characters and shows the parts each one is written from, " +
        "with their readings and meanings, and carries a fold of three real example sentences chosen to " +
        "put the word in three different sentence shapes rather than the same one three times, with the " +
        "word picked out in colour in each and a speaker beside it. Above each sentence is its shape as a " +
        "formula of word types — PRONOUN + NOUN + ADVERB + ADJECTIVE — worked out by segmenting the " +
        "sentence and looking every word up in a part-of-speech table, so where one word is not in the " +
        "table no formula is shown rather than a guessed one. " +
        "Word list and definitions: the official HSK " + LEVEL + " vocabulary. Traditional forms, " +
        "bopomofo and measure words: CC-CEDICT (CC BY-SA 4.0). Character parts and their meanings: Make " +
        "Me a Hanzi. Example sentences: Tatoeba (tatoeba.org), CC BY 2.0 FR — about half of that corpus " +
        "is written in traditional characters, and those have been converted to simplified by a character " +
        "map derived from CC-CEDICT's own two columns.",
      author: "", language: "en",
      tags: ["chinese", "mandarin", "hsk", "hsk2.0", "hsk" + LEVEL, "vocabulary"],
      glossMode: "site", types: { [TYPE_ID]: TYPE },
      version: 1, createdAt: STAMP, updatedAt: STAMP, forkedFrom: null,
    },
    cards, gloss: {},
  };
  const out = "/home/user/folio/decks/HSK" + LEVEL + "-Mandarin.folio-deck.json";
  fs.writeFileSync(out, JSON.stringify(deck, null, 1));
  console.log(HSK + ": " + N + " notes → " + N * 2 + " cards, " +
    (fs.statSync(out).size / 1048576).toFixed(2) + " MB");
});
