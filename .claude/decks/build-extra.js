/* TWO DECKS THE VOCABULARY LISTS DO NOT COVER: common phrases and expressions, and Chinese idioms.

   Both are built the way the HSK decks are — same card type, same two directions, same character
   breakdown, same real example sentences — and neither is a list anybody sat down and wrote. The entries
   are CC-CEDICT's; which of them is an IDIOM is CC-CEDICT's own judgement, written into the gloss as
   "(idiom)"; which of them is a PHRASE rather than a word is decided by the rule in phrasepick.js; and how
   common each one is comes from two corpora, measured (see phrasepick.js for what each can and cannot see).
   Anything already carded in an HSK deck is excluded, which is the brief: these are what the lists leave out.

   IT IS A LIBRARY: `build-mandarin.js` requires it and writes the two decks. See the note on `noteOf`. */
const fs = require("fs");
const { TYPE, TYPE_ID, esc, charsHTML, examplesHTML, plainSensesHTML } = require("./deckcore.js");
const { examplesFor, partsOf } = require("./extras.js");
const { isIdiom, isPhrase, multi, HAN } = require("./phrasepick.js");
const numToMarks = require("./pinyin.js");

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
/* IT IS A LIBRARY AND NO LONGER WRITES A DECK OF ITS OWN (Aug 2026, when the one combined Mandarin file
   became nine). It used to run both ways — as `Mandarin-Phrases`/`Mandarin-Idioms` under the ids `zhphr`
   and `zhidm`, and as two subdecks of the combined deck when required — and with the phrases and the
   idioms now shipping as decks in their own right the two paths would write the SAME file under two
   different ids, which for a reader who has installed one is a silent swap to another deck. So
   `build-mandarin.js` is the one entry point, and the titles, ids and descriptions live in
   `hsk30-meta.js` where both halves read them. A note therefore never names a subdeck: `category` says
   which deck it belongs to and `sub` is empty. */
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

/* ---------------------------------------------------------------- PHRASES */
const PHRASE_BAR = 150;
const phrases = CED.filter((e) => !isIdiom(e) && multi(e) && !carded.has(e.simp) && isPhrase(e))
  .map((e) => ({ e, n: freq(e.simp) }))
  .filter((x) => x.n >= PHRASE_BAR || /* or the Tatoeba corpus uses it, which is the only measure that
     sees a free phrase at all — examplesFor returning anything IS that test */ examplesFor(x.e.simp, known, { phrase: true }).length)
  .sort((a, b) => b.n - a.n || a.e.simp.localeCompare(b.e.simp));


/* ---------------------------------------------------------------- IDIOMS */
const IDIOM_BAR = 60;
const idioms = CED.filter((e) => isIdiom(e) && multi(e) && !carded.has(e.simp))
  .map((e) => ({ e, n: freq(e.simp) })).filter((x) => x.n >= IDIOM_BAR)
  .sort((a, b) => b.n - a.n || a.e.simp.localeCompare(b.e.simp));


module.exports = { noteOf, phrases: phrases.map((x) => x.e), idioms: idioms.map((x) => x.e), PHRASE_BAR, IDIOM_BAR };

if (noZh) console.log("  !! entries with no bopomofo: " + noZh);
