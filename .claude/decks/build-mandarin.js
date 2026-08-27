/* THE NINE MANDARIN DECKS: the seven HSK 3.0 levels, the phrases the syllabus leaves out, and the chengyu.

   IT WAS ONE FILE OF NINE SUBDECKS AND IS NINE FILES (Aug 2026, on request: "It shouldn't download the
   whole collection at once, its cards should be divided into decks the same as the other collections").
   The one-file shape made every row on the Collections page read 20.6 MB and made pressing any of them
   fetch all nine, where a DELE level is its own file and downloads alone. What the one file bought — one
   Add for the whole language — the collection banner's own + now buys instead.

   THE TITLES, IDS AND DESCRIPTIONS ARE IN `hsk30-meta.js`, which the shipped files were split with, so the
   generator and the decks on disk cannot come to disagree about what a deck is called.

     node build-mandarin.js                                                                               */
const fs = require("fs");
const { TYPE, TYPE_ID, esc, measureHTML, charsHTML, examplesHTML, englishHTML } = require("./deckcore.js");
const extra = require("./build-extra.js");
const { DECKS, subtitleOf } = require("./hsk30-meta.js");

const LEVELS = ["1", "2", "3", "4", "5", "6", "7"];
const SUB = { "1": "Level 1", "2": "Level 2", "3": "Level 3", "4": "Level 4", "5": "Level 5", "6": "Level 6", "7": "Levels 7–9" };
/* A deck id is permanent, so these are new ids rather than the old `hsk1`/`hsk2`, which belonged to the
   2012-standard decks deleted in Aug 2026 and would hand a reader who still has one a silent update to
   a wholly different deck. `hsk30` itself is retired with the combined file. */
const byId = {};
DECKS.forEach((D) => { byId[D.sub] = D; });
const STAMP = Date.parse("2026-08-10T00:00:00Z");
const OUT = "/home/user/folio/decks/";

/* One deck out. `ctx` is what the descriptions in the meta table interpolate: how many rows this deck
   holds, how many the official list runs to, how many of them are identical in traditional characters,
   and how many carry an example sentence. */
function write(D, cards, ctx) {
  const deck = {
    folioDeck: 1,
    exportedAt: new Date(STAMP).toISOString(),
    meta: {
      id: D.id, title: D.title,
      subtitle: subtitleOf(D.unit, ctx.n),
      desc: D.desc(D.sub, ctx),
      author: "", language: "en",
      tags: D.tags,
      glossMode: "site", types: { [TYPE_ID]: TYPE },
      version: 1, createdAt: STAMP, updatedAt: STAMP, forkedFrom: null,
    },
    cards, gloss: {},
  };
  fs.writeFileSync(OUT + D.file, JSON.stringify(deck));
  console.log("  " + D.sub.padEnd(12) + String(ctx.n).padStart(6) + " notes  " +
    (fs.statSync(OUT + D.file).size / 1048576).toFixed(2) + " MB  " + ctx.withEx + " with examples");
  return ctx.n;
}

let total = 0, ex = 0;

// the seven HSK levels
LEVELS.forEach((L) => {
  const D = byId[SUB[L]];
  const words = JSON.parse(fs.readFileSync("w26-" + L + ".json", "utf8"));
  let same = 0, withEx = 0;
  const cards = words.map((w, i) => {
    if (!w.trad) same++;
    if (w.examples && w.examples.length) withEx++;
    return {
      id: "u_" + D.id + "_" + (i + 1),
      num: String(i + 1), category: "HSK 3.0 " + D.sub, sub: "",
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
    };
  });
  total += write(D, cards, { n: cards.length, rows: D.rows, same: same, withEx: withEx });
  ex += withEx;
});

// …and the two the syllabus leaves out, built by build-extra.js
[["Phrases", extra.phrases], ["Idioms", extra.idioms]].forEach(([sub, rows]) => {
  const D = byId[sub];
  let withEx = 0;
  const cards = rows.map((e, i) => {
    const note = extra.noteOf(e, D.id, i, "HSK 3.0 " + sub);
    if (note._ex) withEx++;
    delete note._ex;
    return note;
  });
  total += write(D, cards, { n: cards.length, rows: cards.length, same: 0, withEx: withEx });
  ex += withEx;
});

console.log("Mandarin: " + DECKS.length + " decks, " + total.toLocaleString() + " notes → " +
  (total * 2).toLocaleString() + " cards, " + ex.toLocaleString() + " with example sentences");
