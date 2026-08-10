/* TWO DECKS THE VOCABULARY LISTS DO NOT COVER: common phrases and expressions, and Chinese idioms.

   Both are built the way the HSK decks are — same card type, same two directions, same character
   breakdown, same real example sentences — and neither is a list anybody sat down and wrote. The entries
   are CC-CEDICT's; which of them is an IDIOM is CC-CEDICT's own judgement, written into the gloss as
   "(idiom)"; which of them is a PHRASE rather than a word is decided by the rule in phrasepick.js; and how
   common each one is comes from two corpora, measured (see phrasepick.js for what each can and cannot see).
   Anything already carded in an HSK deck is excluded, which is the brief: these are what the lists leave out.

     node build-extra.js                                                                                 */
const fs = require("fs");
const { TYPE, TYPE_ID, esc, charsHTML, examplesHTML, plainSensesHTML } = require("./deckcore.js");
const { examplesFor, partsOf } = require("./extras.js");
const { isIdiom, isPhrase, multi, HAN } = require("./phrasepick.js");
const numToMarks = require("./pinyin.js");

const STAMP = Date.parse("2026-08-10T00:00:00Z");
const OUT = "/home/user/folio/decks/";

/* ---------------------------------------------------------------- the sources */
const CED = [];
fs.readFileSync("cedict.u8", "utf8").split("\n").forEach((l) => {
  if (!l || l[0] === "#") return;
  const m = /^(\S+) (\S+) \[([^\]]*)\] \/(.*)\/$/.exec(l.trim());
  if (m) CED.push({ trad: m[1], simp: m[2], py: m[3], senses: m[4].split("/") });
});
const FREQ = new Map();
fs.readFileSync("freq_full.txt", "utf8").split("\n").forEach((l) => {
  const p = l.split(" "); if (p[0] && p[1]) FREQ.set(p[0], +p[1]);
});
const freq = (w) => FREQ.get(w) || 0;

/* everything already carded, in either standard, at any level — and every character in them, which is what
   the example picker means by a sentence the reader can read */
const carded = new Set(), known = new Set();
[1, 2, 3, 4, 5, 6, 7].forEach((L) => {
  const f = "w26-" + L + ".json";
  if (fs.existsSync(f)) JSON.parse(fs.readFileSync(f, "utf8")).forEach((w) => {
    carded.add(w.simp); [...w.simp].forEach((c) => known.add(c));
  });
});
["words1.json", "words2.json"].forEach((f) => JSON.parse(fs.readFileSync(f, "utf8")).forEach((w) => {
  carded.add(w.simp); [...w.simp].forEach((c) => known.add(c));
}));

/* THE BOPOMOFO TABLE IS DERIVED, not written out — the same trick the HSK build uses. complete.json gives
   both spellings for every one of its readings, so splitting each pair on its spaces yields an empirical
   syllable table, and a second copy with the tones stripped spells a syllable the HSK vocabulary happens
   never to use in one tone. */
const syl2zh = new Map();
JSON.parse(fs.readFileSync("complete.json", "utf8")).forEach((e) => (e.forms || []).forEach((f) => {
  const p = String(f.transcriptions.pinyin).trim().split(/\s+/);
  const z = String(f.transcriptions.bopomofo).trim().split(/\s+/);
  if (p.length !== z.length) return;
  p.forEach((s, i) => { const k = s.toLowerCase(); if (!syl2zh.has(k)) syl2zh.set(k, z[i]); });
}));
const TONE = ["", "ˊ", "ˇ", "ˋ"];
const bareSyl = new Map();
syl2zh.forEach((z, k) => {
  const b = k.normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (!bareSyl.has(b)) bareSyl.set(b, z.replace(/[˙ˊˇˋ]$/, ""));
});
function sylZhuyin(sy) {
  const k = sy.toLowerCase();
  if (syl2zh.has(k)) return syl2zh.get(k);
  const d = k.normalize("NFD");
  const base = bareSyl.get(d.replace(/[̀-ͯ]/g, ""));
  if (!base) return "";
  const mark = /̄/.test(d) ? 0 : /́/.test(d) ? 1 : /̌/.test(d) ? 2 : /̀/.test(d) ? 3 : -1;
  return mark < 0 ? base + "˙" : base + TONE[mark];
}
function toZhuyin(pinyin) {
  const parts = String(pinyin).trim().split(/\s+/).map(sylZhuyin);
  return parts.every(Boolean) ? parts.join(" ") : "";
}

/* ---------------------------------------------------------------- one entry → one note */
let noZh = 0;
function noteOf(e, deckId, i, sub) {
  const simp = e.simp, trad = e.trad === simp ? "" : e.trad;
  const pinyin = numToMarks(e.py);
  const zhuyin = toZhuyin(pinyin);
  if (!zhuyin) noZh++;
  const chs = [...simp].filter((c) => HAN.test(c));
  const tchs = [...(trad || "")].filter((c) => HAN.test(c));
  // one row per DISTINCT character, as the HSK decks do — 谢谢 is one character to break down, not two
  const dedup = [];
  chs.forEach((c, k) => { if (!chs.slice(0, k).includes(c)) dedup.push(k); });
  const chars = dedup.map((k) => {
    const c = chs[k], t = tchs.length === chs.length ? tchs[k] : "";
    return { c, parts: partsOf(c), trad: t && t !== c ? t : "", tradParts: t && t !== c ? partsOf(t) : [] };
  });
  const examples = examplesFor(simp, known, { phrase: true });
  const senses = e.senses;
  return {
    id: "u_" + deckId + "_" + (i + 1),
    num: String(i + 1), category: sub, sub: "",
    question: esc(simp) + (trad ? " / " + esc(trad) : ""),
    answer: esc(pinyin) + " — " + esc(senses.join("; ")),
    answerDate: "", answerText: senses.join("; "),
    traditional: trad, hanzi: simp, pinyin: pinyin, translations: "",
    abstract: "", citation: "",
    type: TYPE_ID,
    fields: {
      Simplified: simp, Traditional: trad, Pinyin: pinyin, Bopomofo: zhuyin,
      "Measure word": "", English: plainSensesHTML(senses),
      Characters: charsHTML(chars), Examples: examplesHTML(simp, examples),
    },
    _ex: examples.length,
  };
}

function write(file, deckId, title, subtitle, desc, tags, rows, sub) {
  const cards = rows.map((e, i) => noteOf(e, deckId, i, sub));
  const withEx = cards.filter((c) => c._ex).length;
  cards.forEach((c) => delete c._ex);
  const deck = {
    folioDeck: 1, exportedAt: new Date(STAMP).toISOString(),
    meta: {
      id: deckId, title, subtitle, desc: desc(withEx),
      author: "", language: "en", tags,
      glossMode: "site", types: { [TYPE_ID]: TYPE },
      version: 1, createdAt: STAMP, updatedAt: STAMP, forkedFrom: null,
    },
    cards, gloss: {},
  };
  fs.writeFileSync(OUT + file, JSON.stringify(deck, null, 1));
  console.log(title + ": " + cards.length + " notes → " + cards.length * 2 + " cards, " +
    (fs.statSync(OUT + file).size / 1048576).toFixed(1) + " MB, " + withEx + " with example sentences");
  return cards.length;
}

const SHARED_TAIL =
  "Every entry is ONE note with TWO cards — Chinese → English and English → Chinese — so each direction is " +
  "scheduled on its own. Each card carries the simplified form, the traditional form where it differs, " +
  "pinyin, bopomofo and CC-CEDICT's own definition, breaks the expression into its characters and shows " +
  "the parts each one is written from, and where the corpus has them carries a fold of real example " +
  "sentences with the expression picked out in colour and a speaker beside it. " +
  "Unlike the HSK decks these sentences mostly carry no PRONOUN + NOUN + ADVERB formula above them, and " +
  "that follows from what they are: the formula names each word of the sentence by its part of speech and " +
  "marks the one being learnt, and an expression that is itself several words has no single place in it to " +
  "mark. Where the expression is one word to a segmenter — which a four-character idiom usually is — the " +
  "formula is drawn as usual. " +
  "Definitions, readings and traditional forms: CC-CEDICT (CC BY-SA 4.0). How common each entry is: the " +
  "OpenSubtitles 2018 Mandarin frequency list, via hermitdave/FrequencyWords (CC BY-SA 4.0). Character " +
  "parts and their meanings: Make Me a Hanzi. Example sentences: Tatoeba (tatoeba.org), CC BY 2.0 FR — " +
  "about half of that corpus is written in traditional characters, and those have been converted to " +
  "simplified by a character map derived from CC-CEDICT's own two columns.";

/* ---------------------------------------------------------------- PHRASES */
const PHRASE_BAR = 150;
const phrases = CED.filter((e) => !isIdiom(e) && multi(e) && !carded.has(e.simp) && isPhrase(e))
  .map((e) => ({ e, n: freq(e.simp) }))
  .filter((x) => x.n >= PHRASE_BAR || /* or the Tatoeba corpus uses it, which is the only measure that
     sees a free phrase at all — examplesFor returning anything IS that test */ examplesFor(x.e.simp, known, { phrase: true }).length)
  .sort((a, b) => b.n - a.n || a.e.simp.localeCompare(b.e.simp));

write("Mandarin-Phrases.folio-deck.json", "zhphr",
  "Mandarin phrases and expressions",
  phrases.length + " expressions the HSK lists leave out",
  (withEx) =>
    "The set expressions of everyday Mandarin — greetings, replies, exclamations and the small formulas a " +
    "conversation is held together by — chosen from CC-CEDICT and ranked by how often they are used. " +
    "Nothing here is in any HSK list, of either standard, at any level: the syllabus covers most of the " +
    "common formulas already (of a probe list of thirty-six expressions a beginner meets, twenty-four are " +
    "carded in the HSK decks), so what is left is the remainder, and it is a short deck by nature. " +
    phrases.length + " expressions, " + phrases.length * 2 + " cards, " + withEx + " of them with example " +
    "sentences. " +
    "An entry is here if it appears at least " + PHRASE_BAR + " times in a corpus of film subtitles or at " +
    "least once in the Tatoeba sentence corpus — two independent measures, and both are needed, because " +
    "the frequency list is word-segmented and so cannot see a phrase like 对我来说 at all, while Tatoeba " +
    "reads running text and can. They are ordered with the commonest first. " +
    "What counts as a phrase rather than a word is decided on CC-CEDICT's own definition: an entry whose " +
    "first sense exclaims, asks a question or has a person in it — “that's right”, “what are you doing?”, " +
    "“as far as I'm concerned” — against one that reads “to …”, “a …” or “the …”, which is a verb or a " +
    "noun however conversational it is. That rule is deliberately strict and it misses things: 好久不见, " +
    "没问题 and 太好了 are all complete utterances whose definitions are two or three plain words with " +
    "nothing in them to say so. The looser rule was tried and let in Los Angeles, LeBron James and four " +
    "thousand ordinary nouns. " +
    "Entries CC-CEDICT marks as archaic, literary, dialectal or regional are left out, as are the coarse " +
    "ones a subtitle corpus is full of — a bar on what a deck should teach first, not a claim that they " +
    "are unimportant. " + SHARED_TAIL,
  ["chinese", "mandarin", "phrases", "expressions", "conversation"],
  phrases.map((x) => x.e), "Mandarin phrases");

/* ---------------------------------------------------------------- IDIOMS */
const IDIOM_BAR = 60;
const idioms = CED.filter((e) => isIdiom(e) && multi(e) && !carded.has(e.simp))
  .map((e) => ({ e, n: freq(e.simp) })).filter((x) => x.n >= IDIOM_BAR)
  .sort((a, b) => b.n - a.n || a.e.simp.localeCompare(b.e.simp));

write("Mandarin-Idioms.folio-deck.json", "zhidm",
  "Chinese idioms — chengyu",
  idioms.length + " of the most used, none of them in the HSK lists",
  (withEx) =>
    "成语 chéngyǔ, the four-character idioms Chinese draws on constantly, each one a compressed story or " +
    "image that means something its four characters do not say outright. This deck holds the " + idioms.length +
    " that CC-CEDICT marks as idioms, that appear at least " + IDIOM_BAR + " times in a corpus of film " +
    "subtitles, and that are in no HSK list of either standard — 5,227 non-syllabus idioms are in the " +
    "dictionary and this is the head of that list, ordered with the commonest first. " +
    idioms.length + " idioms, " + idioms.length * 2 + " cards. " +
    "Only " + withEx + " carry an example sentence, and that is the subject rather than a gap: an idiom is " +
    "literary, the sentence corpus is conversational, and of all 5,227 only 361 appear in it even once. " +
    "What stands in for the sentence is the definition and the characters. CC-CEDICT glosses a chengyu " +
    "with both readings where they differ — the literal picture and what it is used to mean, “lit. chicken " +
    "feathers and garlic skins” and then “trivia; trifling matters” — and the character breakdown under it " +
    "gives each of the four characters its own meaning, which for an idiom is most of the explanation. " +
    SHARED_TAIL,
  ["chinese", "mandarin", "idioms", "chengyu", "成语"],
  idioms.map((x) => x.e), "Chinese idioms");

if (noZh) console.log("  !! entries with no bopomofo: " + noZh);
