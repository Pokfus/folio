/* Two more things per word: a CHARACTER BREAKDOWN with radicals, and EXAMPLE SENTENCES.
   Both are looked up, never composed. hanzistroke.com is the model for the shape — it prints a radical with
   its own reading and meaning, and a short sentence using the word — but not the source: its pages are all
   rights reserved, and copying a thousand of them into a deck that is then given away is not on.

     · RADICALS: skishore/makemeahanzi's dictionary.txt, whose entries come from Unihan and CC-CEDICT.
       Its `decomposition` is an Ideographic Description Sequence — 爸 is ⿱父巴 — so the parts a character
       is built from are the characters left once the ⿰⿱⿲ operators are dropped. Measured over all 904
       characters of the three levels, simplified and traditional: every part has an entry of its own, and
       31 characters decompose to nothing at all, being radicals in their own right (人, 女, 心, 又, 一).
     · PARTS OF SPEECH: drkameleon/complete-hsk-vocabulary, which tags all 11,470 HSK words with the
       ICTCLAS/PKU tagset, plus CC-CEDICT as the segmenter's word list.
     · SENTENCES: Tatoeba's Mandarin-English pairs (CC BY 2.0 FR, so commercial use is fine with the credit
       the deck carries). 88,612 Mandarin sentences and 77,858 links into English.

   NO PINYIN IS WRITTEN FOR A SENTENCE. Reading a whole sentence aloud correctly needs segmentation and a
   decision about every polyphone and every sandhi in it, and a romanisation that is quietly wrong two words
   in three is worse for a learner than none. A character's OWN reading inside the word is a different
   matter: where the word's official pinyin has one syllable per character it is split and used directly,
   which is the syllabus's own reading rather than a guess.

     node extras.js [levels…]  → adds `chars` and `examples` to w26-1..6.json, or to the levels named    */
const fs = require("fs");

const mmah = new Map();
fs.readFileSync("mmah.txt", "utf8").split(/\n/).forEach((l) => {
  if (!l.trim()) return;
  try { const j = JSON.parse(l); mmah.set(j.character, j); } catch (e) {}
});
const firstSense = (d) => String(d || "").split(/[;,]/)[0].trim();

/* The parts a character is written from. makemeahanzi gives an Ideographic Description Sequence — 爸 is
   ⿱父巴, 爱 is ⿱⿱爫冖友 — so the parts are what is left once the ⿰⿱⿲ operators are dropped, together with
   the ？ it writes for a stroke group that is not a character. A character that decomposes to nothing is
   a radical in its own right and says so rather than showing an empty row. */
const IDC = /[\u2FF0-\u2FFF]/;
function partsOf(ch) {
  const e = mmah.get(ch);
  if (!e) return [];
  const raw = [...String(e.decomposition || "")].filter((x) => !IDC.test(x) && x !== "？" && x !== "?");
  const seen = new Set(), out = [];
  raw.forEach((p) => {
    if (p === ch || seen.has(p)) return;
    seen.add(p);
    const pe = mmah.get(p) || {};
    out.push({ c: p, pinyin: (pe.pinyin || [])[0] || "", meaning: firstSense(pe.definition) });
  });
  return out;
}

/* CC-CEDICT's own space-separated readings, as a second way to line a word's pinyin up with its characters.
   The HSK 2.0 lists write the pinyin unspaced (bàba), so splitting on spaces gives one "syllable" for two
   characters and the breakdown falls back to each character's dictionary reading — which for 爸爸 prints
   bà twice where the word is bà ba. A dictionary form with one syllable per character and the same letters
   ignoring tone is the same reading, properly divided. */
const spaced = new Map();
JSON.parse(fs.readFileSync("complete.json", "utf8")).forEach((e) => {
  (e.forms || []).forEach((f) => {
    if (!spaced.has(e.simplified)) spaced.set(e.simplified, []);
    spaced.get(e.simplified).push(String(f.transcriptions.pinyin).trim().split(/\s+/));
  });
});
const bare = (x) => String(x).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f\s'·]/g, "");

/* ======================================================================================================
   THE SENTENCE'S SHAPE, AS A FORMULA — "PRONOUN + NOUN + ADVERB + ADJECTIVE".

   It is DERIVED and never composed: the sentence is segmented against a real dictionary and every token
   is looked up in a real part-of-speech table, so each term of the formula is a fact about a word rather
   than a reading of the sentence. A sentence with one token the table does not know gets NO formula at
   all — a guessed term would be indistinguishable from a known one, and this label's whole worth is that
   a reader can trust it.

   The tagset is ICTCLAS/PKU, as complete-hsk-vocabulary carries it. Several tags collapse onto one
   English word, which is the useful part: 的 is tagged u and n and 了 is y, u and v, and the first two of
   each are simply PARTICLE — so a word ambiguous in the tagset is often unambiguous once it is said in
   English. Where a word is still ambiguous after that (在 is preposition or verb, 好 adjective or adverb)
   the first tag is taken, which is the primary sense, and such sentences are RANKED BELOW ones whose
   every word has only one reading. */
const POS_LABEL = {
  v: "VERB", vn: "VERB", qv: "VERB",
  n: "NOUN", an: "NOUN", nz: "NOUN", nt: "NOUN", Ng: "NOUN",
  nr: "NAME", ns: "PLACE NAME",
  a: "ADJECTIVE", z: "ADJECTIVE", b: "ADJECTIVE",
  d: "ADVERB", ad: "ADVERB",
  r: "PRONOUN", Rg: "PRONOUN",
  m: "NUMBER", Mg: "NUMBER", mq: "NUMBER",
  q: "MEASURE WORD", qt: "MEASURE WORD",
  p: "PREPOSITION",
  c: "CONJUNCTION", cc: "CONJUNCTION",
  u: "PARTICLE", y: "PARTICLE",
  t: "TIME WORD", tg: "TIME WORD",
  f: "PLACE WORD", s: "PLACE WORD",
  e: "INTERJECTION", o: "SOUND WORD",
  l: "PHRASE", i: "PHRASE",
  k: "SUFFIX", h: "PREFIX",
};
const POSOF = new Map();
JSON.parse(fs.readFileSync("complete.json", "utf8")).forEach((e) => {
  if (!e.pos || !e.pos.length || POSOF.has(e.simplified)) return;
  const labs = e.pos.map((p) => POS_LABEL[p]).filter(Boolean);
  if (labs.length) POSOF.set(e.simplified, labs);
});

/* THE SYLLABUS'S OWN TAGS COME FIRST, and adding them is what keeps the deck's own words whole. The cost
   function prefers a reading with no untagged characters, so 这个 — which complete-hsk-vocabulary does not
   carry — was being cut into 这 + 个 (two tagged words, cheaper than one untagged one) and never appeared
   as a token at all; with the requirement that the word being learnt BE a token, that took the examples
   away from 你好, 这个, 那个, 一下, 不客气 and thirty more. The official list states the part of speech for
   every one of them, in its own gloss column, and it is the authority for these words anyway. */
const HSK_POS = {
  "n.": "NOUN", "v.": "VERB", "adj.": "ADJECTIVE", "adv.": "ADVERB", "mw.": "MEASURE WORD",
  "pron.": "PRONOUN", "num.": "NUMBER", "prep.": "PREPOSITION", "conj.": "CONJUNCTION",
  "part.": "PARTICLE", "suf.": "SUFFIX", "pref.": "PREFIX", "phr.": "PHRASE", "interj.": "INTERJECTION",
};
function seedFromSyllabus(words) {
  words.forEach((w) => {
    const labs = [];
    (w.senses || []).forEach((sense) => {
      const m = /^(?:[^()]*—\s*)?\(([^)]+)\)/.exec(sense);
      if (!m) return;
      const parts = m[1].split("/").map((x) => x.trim());
      if (!parts.every((x) => /^[a-z]{1,6}\.$/.test(x) && HSK_POS[x])) return;   // "(chicken) egg" is not a tag
      parts.forEach((x) => { if (!labs.includes(HSK_POS[x])) labs.push(HSK_POS[x]); });
    });
    if (labs.length) POSOF.set(w.simp, labs);
  });
}

/* The 3.0 lists are the only ones that carry the column — the 2.0 syllabus glosses without a part of
   speech — so both builds read them, and both benefit: 这个, 你好 and 一下 are the same words either way. */
/* WHICH LISTS THIS BUILD IS FOR — the two lines that differ between this file and extras2.js, its HSK 2.0
   sibling, which is re-derived from it by swapping exactly these. Everything below goes through them. */
const ALL = [1, 2, 3, 4, 5, 6, 7];   // 7 is the 七至九级 band, one level in the standard
const FILE = (L) => "w26-" + L + ".json";

const ASKED = process.argv.slice(2).map(Number).filter((n) => ALL.includes(n));
const DOING = ASKED.length ? ASKED : ALL;
// the part-of-speech column is in the HSK 3.0 lists alone, and both builds want it
[1, 2, 3, 4, 5, 6, 7].forEach((L) => {
  const f = "w26-" + L + ".json";
  if (fs.existsSync(f)) seedFromSyllabus(JSON.parse(fs.readFileSync(f, "utf8")));
});

/* CC-CEDICT is the segmenter's word list — far bigger than the HSK one, and a token boundary is a token
   boundary whether or not the word carries a tag. Its two columns also say which characters exist ONLY in
   traditional writing, which is how the traditional-script half of the Tatoeba corpus is kept out: this is
   a deck of simplified Chinese, and a traditional example would teach the wrong glyph. */
const CEDICT = new Set(), PROPER = new Set();
let TRAD_ONLY, T2S, T2S_RISKY;
{
  const simpChars = new Set(), tradChars = new Set(), pairs = [];
  fs.readFileSync("cedict.u8", "utf8").split(/\n/).forEach((l) => {
    if (!l || l[0] === "#") return;
    const m = /^(\S+)\s+(\S+)\s+\[[^\]]*\]\s*\/(.*)\/\s*$/.exec(l);
    if (!m) return;
    CEDICT.add(m[2]);
    /* A HEADWORD GLOSSED WITH A CAPITAL IS A NAME, and a name is where the segmenter's own cost function
       goes wrong: 露西 is Lucy, but splitting it into 露 + 西 leaves both halves tagged and so is cheaper
       than one word the tag table has never heard of. The word 露 then looks like a token and 露西不会用
       筷子 was offered as an example of "dew". Collected here and used to REFUSE a sentence, never to
       change the segmentation — the cost function is right about everything else. */
    if (/^\s*[A-Z]/.test(m[3] || "") || /\bsurname\b/.test(m[3] || "")) PROPER.add(m[2]);
    for (const c of m[2]) simpChars.add(c);
    for (const c of m[1]) tradChars.add(c);
    const t = [...m[1]], u = [...m[2]];
    if (t.length === u.length) pairs.push([t, u]);
  });
  TRAD_ONLY = new Set([...tradChars].filter((c) => !simpChars.has(c)));

  /* HALF THE CORPUS IS WRITTEN IN TRADITIONAL CHARACTERS, and throwing it away costs the upper levels
     most: an HSK 6 word is rare, and refusing 36,000 of the 67,000 usable sentences left 28% of level 6
     with no example at all. So a traditional sentence is CONVERTED — and the map is derived from
     CC-CEDICT's own two headword columns rather than written out, so its accuracy can be measured
     instead of asserted.

     Two rules make it safe, and both were arrived at by measuring. Only a character that exists ONLY in
     traditional writing may be mapped: a first cut mapped anything that ever differed across a pair and
     so folded 份 into 分, 座 into 坐 and 覆 into 复, all of them ordinary simplified characters, at a cost
     of 0.41% of headwords. And a sentence carrying a character that exists in BOTH scripts and sometimes
     simplifies (著 於 瞭 乾 裡 麼 …) is REFUSED rather than converted, since which way it should go depends
     on the word it is in. The refusal list is closed by iteration: convert every headword, add whatever
     character took part in a mismatch, and repeat until nothing is wrong. */
  const votes = new Map();
  T2S_RISKY = new Set();
  pairs.forEach(([t, u]) => {
    for (let i = 0; i < t.length; i++) {
      if (t[i] === u[i]) continue;
      if (TRAD_ONLY.has(t[i])) {
        if (!votes.has(t[i])) votes.set(t[i], new Map());
        const v = votes.get(t[i]);
        v.set(u[i], (v.get(u[i]) || 0) + 1);
      } else T2S_RISKY.add(t[i]);          // valid in both scripts — which way it goes depends on the word
    }
  });
  T2S = new Map();
  votes.forEach((v, t) => T2S.set(t, [...v].sort((a, b) => b[1] - a[1])[0][0]));
  let wrong = 0;
  for (let round = 0; round < 8; round++) {
    wrong = 0;
    const add = new Set();
    pairs.forEach(([t, u]) => {
      if (t.some((c) => T2S_RISKY.has(c))) return;
      if (t.map((c) => T2S.get(c) || c).join("") === u.join("")) return;
      wrong++;
      t.forEach((c, i) => { if (c !== u[i]) add.add(c); });
    });
    if (!add.size) break;
    add.forEach((c) => T2S_RISKY.add(c));
  }
  global.T2S_STATS = { mapped: T2S.size, refused: T2S_RISKY.size, wrong };
}

const PUNCT = /[。！？，、；：“”‘’（）〈〉《》…—～·　\s.!?,;:"'()]/;
/* A DYNAMIC PROGRAM rather than the obvious longest-match-first sweep, because the two disagree in both
   directions and each is wrong half the time. CC-CEDICT carries 这个 and 一下 as headwords while the tag
   table carries 这 + 个 and 一 + 下, so taking the longest match loses two tags; and the tag table carries
   小 while CC-CEDICT carries 小孩, so preferring a tagged match strands 孩 with nothing. Minimising the
   characters left untagged settles both, with a small per-token cost so that among equally taggable
   readings the one with fewer words wins. */
function segment(text) {
  const n = text.length;
  const best = new Array(n + 1).fill(null);
  best[0] = { cost: 0, from: -1, word: "" };
  for (let i = 0; i < n; i++) {
    if (!best[i]) continue;
    if (PUNCT.test(text[i])) {
      const c = best[i].cost;
      if (!best[i + 1] || best[i + 1].cost > c) best[i + 1] = { cost: c, from: i, word: "" };
      continue;
    }
    for (let len = Math.min(6, n - i); len >= 1; len--) {
      const w = text.slice(i, i + len);
      if (len > 1 && !POSOF.has(w) && !CEDICT.has(w)) continue;
      const untagged = POSOF.has(w) ? 0 : len;
      const c = best[i].cost + untagged * 10 + 1;
      const j = i + len;
      if (!best[j] || best[j].cost > c) best[j] = { cost: c, from: i, word: w };
    }
  }
  const out = [];
  let i = n;
  while (i > 0 && best[i]) { if (best[i].word) out.unshift(best[i].word); i = best[i].from; }
  return out;
}

const segMemo = new Map();
function segmentOf(text) {
  let v = segMemo.get(text);
  if (!v) { v = segment(text); segMemo.set(text, v); }
  return v;
}

/* IS THE WORD BEING USED AS A WORD HERE? — the hard filter, and the one that most improves the examples.
   Matching the characters is not enough: 可爱 contains 爱 and is not an example of it, 中国人 contains 中国
   and means a person, 看起来 contains 看 and means "seems". Each of those was offered before this, and each
   also forced the formula to cut a real word in half to mark the target. Segmenting first and requiring the
   word to come out as a token of its own settles both at once. */
const nameTrapMemo = new Map();
function nameTraps(word) {
  let v = nameTrapMemo.get(word);
  if (v) return v;
  v = [...PROPER].filter((p) => p.length > word.length && p.includes(word));
  nameTrapMemo.set(word, v);
  return v;
}
function wordIsToken(text, word) {
  if (segmentOf(text).indexOf(word) < 0) return false;
  return !nameTraps(word).some((p) => text.includes(p));
}
/* THE SAME QUESTION ASKED OF A PHRASE, which is several words by definition and therefore never a token.
   Run against the phrases deck the rule above threw away all but 9 of 178 entries' sentences and all but
   11 of the idioms', because a segmenter cuts 干什么 into 干 + 什么 and 好久不见 into 好久 + 不见 — which is
   right, and is exactly what a phrase IS. What the guard is really for is a match that CUTS ACROSS a token:
   爱 inside 可爱, 中国 inside 中国人. So the test becomes whether the match BEGINS and ENDS on a token
   boundary. It subsumes the rule above — anything that is a token trivially spans itself — and the only
   thing it additionally admits is a run of whole tokens, so the HSK decks would be unaffected but for the
   handful of their words a segmenter splits, and they are deliberately left on the older rule rather than
   have their shipped sentences quietly re-picked. */
function spansTokens(text, word) {
  const toks = segmentOf(text);
  let at = 0;
  const starts = new Set(), ends = new Set();
  toks.forEach((t) => { starts.add(at); at += t.length; ends.add(at); });
  let i = text.indexOf(word);
  while (i >= 0) {
    if (starts.has(i) && ends.has(i + word.length)) {
      return !nameTraps(word).some((p) => text.includes(p));
    }
    i = text.indexOf(word, i + 1);
  }
  return false;
}

/* The formula for one sentence, with the term for the word being learnt marked so the card can pick it out
   in the same vermilion the sentence uses. Returns null where a token is one the tag table does not carry
   — a guessed term would be indistinguishable from a known one, so none is written. */
const FORMULA_MAX = 8;
function formulaFor(text, word) {
  const toks = segmentOf(text);
  const target = toks.indexOf(word);
  if (target < 0 || !toks.length || toks.length > FORMULA_MAX) return null;
  const terms = [];
  let sure = true;
  for (const w of toks) {
    const p = POSOF.get(w);
    if (!p) return null;
    if (new Set(p).size > 1) sure = false;
    terms.push(p[0]);
  }
  return { terms, target, sure };
}

/* Tatoeba: id -> text for each language, then the links between them */
function loadSentences(file) {
  const m = new Map();
  fs.readFileSync(file, "utf8").split(/\n/).forEach((l) => {
    const t = l.split("\t");
    if (t.length >= 3) m.set(t[0], t[2]);
  });
  return m;
}
const cmn = loadSentences("cmn.tsv"), eng = loadSentences("eng.tsv");
const engOf = new Map();
fs.readFileSync("link.tsv", "utf8").split(/\n/).forEach((l) => {
  const [a, b] = l.split("\t");
  if (!a || !b) return;
  const zh = cmn.has(a) ? a : (cmn.has(b) ? b : null);
  const en = eng.has(b) ? b : (eng.has(a) ? a : null);
  if (!zh || !en) return;
  if (!engOf.has(zh)) engOf.set(zh, []);
  engOf.get(zh).push(eng.get(en));
});

/* The characters a learner AT THIS LEVEL has met, used only to RANK: a sentence made of words they know,
   with the one being learnt in it, teaches more than one that needs a dictionary for every other character.
   It is cumulative by level rather than one set for the whole syllabus — an HSK 4 learner knows the
   characters of levels 1 to 4 and not those of level 6, and ranking a level 4 example against the whole
   5,400-word list would call a sentence familiar on the strength of characters that learner has not met. */
const knownAt = {};
{
  const acc = new Set();
  ALL.forEach((L) => {
    const f = FILE(L);
    if (fs.existsSync(f)) JSON.parse(fs.readFileSync(f, "utf8")).forEach((w) => [...w.simp].forEach((c) => acc.add(c)));
    knownAt[L] = new Set(acc);
  });
}

const HAN = /[一-鿿]/;
/* A window of 5 to 22 characters is what a beginner can read; a WIDE pool with no upper bound is kept
   beside it for the handful of words — a vending-machine noun, a compound nobody writes short sentences
   about — that the narrow one cannot serve at all. A long real sentence beats no sentence. */
const MIN = 5, MAX = 22, WANT = 3;
const pool = [], wide = [];
let dropTrad = 0, dropMixed = 0, conv = 0;
cmn.forEach((text, id) => {
  if (!engOf.has(id)) return;
  const t = String(text).trim();
  const n = [...t].filter((c) => HAN.test(c)).length;
  if (n < MIN) return;
  /* Tatoeba's cmn corpus is written in BOTH scripts and says which nowhere in these three files. A
     traditional sentence under a simplified headword teaches the wrong glyph, so it is converted where
     the mapping above is certain and dropped where it is not. Anything carrying Latin letters or digits
     goes too — mostly transliterated names and mangled imports. */
  if ([...t].some((c) => !HAN.test(c) && !PUNCT.test(c))) { dropMixed++; return; }
  let simp = t;
  if ([...t].some((c) => TRAD_ONLY.has(c))) {
    if ([...t].some((c) => T2S_RISKY.has(c))) { dropTrad++; return; }
    simp = [...t].map((c) => T2S.get(c) || c).join("");
    conv++;
  }
  const rec = { t: simp, n, en: engOf.get(id)[0], id };
  wide.push(rec);
  if (n <= MAX) pool.push(rec);
});
pool.sort((a, b) => a.n - b.n);
wide.sort((a, b) => a.n - b.n);
console.log("Mandarin sentences with an English translation, " + MIN + "-" + MAX + " characters: " + pool.length);
console.log("  traditional→simplified map: " + global.T2S_STATS.mapped + " characters, " + global.T2S_STATS.refused
  + " refused as ambiguous, " + global.T2S_STATS.wrong + " headwords still converting wrongly");
console.log("  " + conv + " sentences converted from traditional; dropped " + dropTrad
  + " carrying an ambiguous character and " + dropMixed + " carrying Latin or digits");

// indexed by character so the per-word scan is not 988 passes over 60,000 sentences
function indexOf(list) {
  const m = new Map();
  list.forEach((s, i) => new Set([...s.t].filter((c) => HAN.test(c))).forEach((c) => {
    if (!m.has(c)) m.set(c, []);
    m.get(c).push(i);
  }));
  return m;
}
const byChar = indexOf(pool), byCharWide = indexOf(wide);
/* THREE SENTENCES THAT ARE NOT THE SAME SENTENCE. Ranked on quality alone the top two for 爸爸 came out
   我爸爸很忙。and 你爸爸很高。— the same frame twice, [pronoun] 爸爸 很 [adjective], which shows the word once
   and its grammar not at all. So each sentence is reduced to a SHAPE and a candidate is penalised for
   repeating a shape already chosen: whether it is a question, whether it is negated, where in the sentence
   the word falls, what immediately precedes and follows it, and which of the common grammar words it uses.
   The result is picked greedily — best remaining score after the penalty — so the first sentence is still
   the best one and the others are the best DIFFERENT ones. */
const GRAMMAR = ["是", "有", "在", "了", "过", "的", "得", "地", "很", "也", "都", "要", "会", "能", "想",
  "给", "把", "被", "和", "跟", "比", "就", "还", "才", "没", "不", "吗", "呢", "吧", "让", "从", "对", "为"];
const QUESTION = /[？?]|吗|呢|什么|怎么|哪|谁|几|多少|为什么/;

function shapeOf(text, word) {
  const i = text.indexOf(word);
  const n = [...text].filter((c) => HAN.test(c)).length;
  const before = i > 0 ? text[i - 1] : "^";
  const after = i + word.length < text.length ? text[i + word.length] : "$";
  return {
    q: QUESTION.test(text),
    neg: /[不没]/.test(text),
    where: i === 0 ? 0 : (i + word.length >= text.replace(/[。！？，、；：""''）]/g, "").length ? 2 : 1),
    before, after,
    grammar: new Set(GRAMMAR.filter((g) => text.includes(g))),
    formula: formulaFor(text, word),
    n,
  };
}
function sameness(a, b) {
  let d = 0;
  /* the heaviest term by a wide margin: the formula printed above each sentence IS the claim that the
     three show different structures, so two sentences carrying the same one contradict the card */
  const fa = a.formula ? a.formula.terms.join(" ") : "", fb = b.formula ? b.formula.terms.join(" ") : "";
  if (fa === fb) d += 4;
  if (a.q === b.q) d += 1;
  if (a.neg === b.neg) d += 0.7;
  if (a.where === b.where) d += 1;
  if (a.before === b.before) d += 1.2;      // the same word in front twice is the same frame twice
  if (a.after === b.after) d += 1.2;
  if (Math.abs(a.n - b.n) <= 2) d += 0.4;
  let shared = 0;
  a.grammar.forEach((g) => { if (b.grammar.has(g)) shared++; });
  const union = new Set([...a.grammar, ...b.grammar]).size || 1;
  d += 2.5 * (shared / union);
  return d;                                  // 0 (nothing alike) to about 8 (the same frame)
}
function search(word, list, index, known, opts) {
  const seed = index.get(word[0]) || [];
  const hits = [];
  const inWords = (opts && opts.phrase) ? spansTokens : wordIsToken;
  for (const i of seed) {
    const s = list[i];
    if (s.t.indexOf(word) < 0) continue;
    if (!inWords(s.t, word)) continue;   // 可爱 is not an example of 爱
    const chars = [...s.t].filter((c) => HAN.test(c));
    const familiar = chars.filter((c) => known.has(c)).length / chars.length;
    const shape = shapeOf(s.t, word);
    /* a sentence whose shape can be NAMED is worth a good deal more than one that cannot: the label is
       most of what the fold is for. Among those, a short formula reads and a nine-term one does not, and
       one whose every word has a single part of speech is one the label is certainly right about. */
    const f = shape.formula;
    const bonus = f ? 0.5 - 0.03 * f.terms.length + (f.sure ? 0.08 : 0) : 0;
    hits.push({ s, score: familiar - s.n / 200 + bonus, shape });
    if (hits.length > 400) break;
  }
  hits.sort((a, b) => b.score - a.score);
  const out = [], taken = [], seen = new Set();
  while (out.length < WANT) {
    let best = null, bestVal = -Infinity;
    for (const h of hits) {
      if (seen.has(h.s.t)) continue;
      const pen = taken.reduce((m, t) => Math.max(m, sameness(h.shape, t)), 0);
      const v = h.score - 0.18 * pen;
      if (v > bestVal) { bestVal = v; best = h; }
    }
    if (!best) break;
    seen.add(best.s.t);
    taken.push(best.shape);
    const f = best.shape.formula;
    out.push({ zh: best.s.t, en: best.s.en, st: f ? f.terms : null, si: f ? f.target : -1 });
  }
  return out;
}
function examplesFor(word, known, opts) {
  const got = search(word, pool, byChar, known, opts);
  return got.length ? got : search(word, wide, byCharWide, known, opts);
}

/* THE MACHINERY ABOVE IS ALSO A MODULE (Aug 2026). The phrases and the idioms decks need exactly what the
   vocabulary decks needed — the same Tatoeba pool with the same traditional-script exclusions, the same
   segmenter, the same part-of-speech table and the same three-different-shapes selection — and building a
   second copy of it is how two decks come to disagree about what a sentence is. Requiring this file runs
   everything down to here and stops; running it as a script goes on to write the levels, exactly as before. */
module.exports = { examplesFor, partsOf, spansTokens, wordIsToken, formulaFor, pool, wide, CEDICT, PROPER, HAN, T2S, TRAD_ONLY, mmah, firstSense };
if (require.main !== module) return;

let noEx = [], oddSplit = 0, total = 0, withEx = 0;
DOING.forEach((L) => {
  const words = JSON.parse(fs.readFileSync(FILE(L), "utf8"));
  words.forEach((w) => {
    total++;
    /* the character's reading inside THIS word, taken from the word's own official pinyin where the two
       line up one for one; where they do not (好玩儿 is three characters and two syllables) the dictionary's
       first reading is used instead, which is a fact about the character rather than about the word */
    let syl = String(w.pinyin).split("/")[0].trim().split(/\s+/);
    const chs = [...w.simp].filter((c) => HAN.test(c));
    if (syl.length !== chs.length) {
      const cand = (spaced.get(w.simp) || []).find((a) => a.length === chs.length && bare(a.join("")) === bare(syl.join("")));
      if (cand) syl = cand;
    }
    const aligned = syl.length === chs.length;
    if (!aligned) oddSplit++;
    /* A CHARACTER IS BROKEN DOWN ONCE (on request). 爸爸, 谢谢, 天天 and the rest are one character written
       twice, and a second row saying the same thing about the same character is a row a reader has to read
       to find out it says nothing. */
    const dedup = [];
    chs.forEach((c, i) => { if (!chs.slice(0, i).includes(c)) dedup.push(i); });
    /* THE ROW IS THE CHARACTER'S PARTS, NOT THE CHARACTER (on request). Its own reading and meaning are
       already above — the word, its pinyin and its gloss — so restating them is a line read for nothing;
       what the card has nowhere else is what the character is BUILT from. Where the traditional form is a
       different character it gets a row of its own at the traditional hanzi's own half strength, since
       simplification often changed exactly this: 说 is 讠 + 兑 and 說 is 言 + 兑. */
    const tchs = [...(w.trad || "")].filter((c) => HAN.test(c));
    w.chars = dedup.map((i) => {
      const c = chs[i];
      const t = tchs.length === chs.length ? tchs[i] : "";
      return { c, parts: partsOf(c), trad: t && t !== c ? t : "", tradParts: t && t !== c ? partsOf(t) : [] };
    });
    w.examples = examplesFor(w.simp, knownAt[L]);
    if (w.examples.length) withEx++; else noEx.push(w.simp);
  });
  fs.writeFileSync(FILE(L), JSON.stringify(words, null, 1));
  console.log("L" + L + ": " + words.length + " words, "
    + words.filter((w) => w.examples.length).length + " with an example sentence");
});
/* the formula above each sentence claims the three are different shapes; count how often that is true */
let three = 0, allEx = 0, noF = 0, exN = 0, labels = new Map(), atomic = 0, chRows = 0;
DOING.forEach((L) => JSON.parse(fs.readFileSync(FILE(L), "utf8")).forEach((w) => {
  const st = (w.examples || []).map((e) => (e.st || []).join(" + "));
  st.forEach((x) => { exN++; if (!x) noF++; else labels.set(x, (labels.get(x) || 0) + 1); });
  if (st.length === 3) { allEx++; if (new Set(st).size === 3 && st.every(Boolean)) three++; }
  (w.chars || []).forEach((c) => { chRows++; if (!c.parts.length) atomic++; });
}));
console.log("\nwords with three examples, all three a different formula: " + three + " / " + allEx);
console.log("sentences with no formula (a word the tag table doesn't carry): " + noF + " / " + exN);
console.log("distinct formulas in use: " + labels.size);
[...labels].sort((a, b) => b[1] - a[1]).slice(0, 10).forEach(([k, v]) => console.log("   " + String(v).padStart(4) + "  " + k));
console.log("\ncharacter rows: " + chRows + ", of which a radical in its own right (no parts): " + atomic);
console.log("\ncharacters whose reading came from the dictionary rather than the word's own pinyin: " + oddSplit);
console.log("words with no sentence in the corpus (" + noEx.length + "): " + noEx.slice(0, 60).join(" "));
console.log("coverage: " + withEx + " / " + total);
