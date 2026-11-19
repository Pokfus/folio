#!/usr/bin/env node
"use strict";
/*
  bengali-alphabet-quote.js — CUTS THE ALPHABET DECK'S TABLE OUT OF ITS TWO SOURCES (Nov 2026, the Bengali
  beginner pass — docs/lang-decks.md). Standalone Node helper, zero deps. Not part of the site, and NOT a
  build step: build-bengali-alphabet.js reads only the table this writes.

    curl -sS -o ipa.wiki 'https://en.wikipedia.org/w/index.php?title=Help:IPA/Bengali&action=raw&oldid=1369348573'
    curl -sS -o abc.wiki 'https://en.wikipedia.org/w/index.php?title=Bengali_alphabet&action=raw&oldid=1379877198'
    node .claude/decks/bengali-alphabet-quote.js ipa.wiki abc.wiki        # writes bengali-alphabet.json

  WHY A SCRIPT. Until this pass the alphabet deck's sounds were written by hand in `.claude/bengali/alphabet.py`
  ("k as in skin", "the o of British hot"), from no named source. Every claim a card makes is now a CELL or a
  SENTENCE of one of two Wikipedia pages at a pinned revision, cut by this script so that nothing is retyped:
    · Help:IPA/Bengali — a row per sound: the IPA symbol, the letters that write it, the English
      approximation, and the notes hanging off it;
    · Bengali alphabet — the vowel and consonant tables (each letter's name in romanisation and in IPA), the
      table "Diacritics and other symbols" (a sign's name, function, romanisation and IPA), and the prose,
      from which whole sentences are taken by their first and last words (PASSAGES below).
  Wiki markup becomes <b>, <i> and ⟨ ⟩, a link becomes its text, a footnote or a citation is dropped, a cut
  inside a passage is marked […]; no word is changed. A template this script does not know stops it.

  WHAT IS CHOSEN BY HAND, here and nowhere else: which letters and signs get a row and in what order (ROWS:
  the traditional order the deck always had, keyed as its notes were on the day the ids were pinned), which
  passages are quoted (PASSAGES) and which row or rule card each stands on. The example words are not in
  the table at all: build-bengali-alphabet.js takes them from the shipped level decks.
*/
const fs = require("fs");
const path = require("path");
const [ipaFile, abcFile] = process.argv.slice(2);
if (!ipaFile || !abcFile) { console.error("usage: bengali-alphabet-quote.js <Help_IPA_Bengali.wiki> <Bengali_alphabet.wiki>"); process.exit(1); }
const IPA = fs.readFileSync(ipaFile, "utf8"), ABC = fs.readFileSync(abcFile, "utf8");
const SOURCES = {
  ipa: { title: "Help:IPA/Bengali", site: "en.wikipedia.org", rev: 1369348573, date: "2026-08-14" },
  alphabet: { title: "Bengali alphabet", site: "en.wikipedia.org", rev: 1379877198, date: "2026-10-12" },
};

// ---- wiki markup → the little HTML a card may carry ---------------------------------------------
const DROP = new Set(["efn", "sfnp", "harvnb", "harvcoltxt", "citation needed", "cite book", "cite journal", "cite web", "cite news", "refn", "main", "clear", "notelist", "reflist"]);
function clean(s) {
  s = s.replace(/<ref[^>]*\/>/g, "").replace(/<ref[^>]*>[\s\S]*?<\/ref>/g, "").replace(/<nowiki\s*\/>/g, "");
  s = s.replace(/<br\s*\/?>/g, " ").replace(/<\/?(?:small|big)>/g, "");
  for (let guard = 0; guard < 500; guard++) {
    const m = /\{\{([^{}]*)\}\}/.exec(s);
    if (!m) break;
    const p = m[1].split("|").map((x) => x.trim()), name = p[0].toLowerCase();
    let out;
    if (DROP.has(name)) out = "";
    else if (name === "lang") out = /-Latn$/.test(p[1]) ? "\x01" + p[2] + "\x02" : p[2];
    else if (name === "transliteration") out = "\x01" + p[p.length - 1] + "\x02";
    else if (name === "langx") out = p[2];
    else if (name === "ipa") out = p[1] === "bn" ? "[" + p[2] + "]" : p[1];
    else if (name === "ipa link") out = p[2] || p[1];
    else if (name === "ipaslink") out = "/" + (p[2] || p[1]) + "/";
    else if (name === "ipablink") out = "[" + (p[2] || p[1]) + "]";
    else if (name === "ipac-en") out = "/" + p.slice(1).join("") + "/";
    else if (name === "angbr") out = "⟨" + p[1] + "⟩";
    else if (name === "lit") out = "lit. '" + p[1] + "'";
    else throw new Error("unknown template {{" + m[1].slice(0, 60) + "}}");
    s = s.slice(0, m.index) + out + s.slice(m.index + m[0].length);
  }
  s = s.replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, "$1");
  s = s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  s = s.replace(/'''(.+?)'''/g, "<b>$1</b>").replace(/''(.+?)''/g, "<i>$1</i>").replace(/\x01/g, "<i>").replace(/\x02/g, "</i>");
  return s.replace(/[‌‍]/g, "").replace(/\s+/g, " ").replace(/ ([,.;:])/g, "$1").trim();
}
// the text of a balanced {{efn|…}} that starts at `from`
function balanced(s, from) {
  let depth = 0;
  for (let i = from; i < s.length - 1; i++) {
    if (s[i] === "{" && s[i + 1] === "{") { depth++; i++; } else if (s[i] === "}" && s[i + 1] === "}") { depth--; i++; if (!depth) return s.slice(from, i + 1); }
  }
  throw new Error("unbalanced template at " + from);
}
function cut(src, from, to) {
  const a = src.indexOf(from);
  if (a < 0 || src.indexOf(from, a + 1) >= 0) throw new Error("passage start not found once: " + from);
  const b = src.indexOf(to, a);
  if (b < 0) throw new Error("passage end not found: " + to);
  return src.slice(a, b + to.length);
}

// ---- Help:IPA/Bengali: one row per sound ---------------------------------------------------------
const refs = {};
for (const m of IPA.matchAll(/<ref name="?([^">/]+)"?\s*>([\s\S]*?)<\/ref>/g)) refs[m[1].trim()] = clean(m[2]);
const ipaRows = [];
{
  let section = "", lastLetters = "";
  const HEAD = /!\s*colspan="?\d"?\s*\|\s*(?:\[\[)?([A-Za-z ]+?)s?(?:\]\]s?)?\s*$/m;
  for (const chunk of IPA.slice(0, IPA.indexOf("==Notes==")).split(/\n\|-/)) {
    const h = HEAD.exec(chunk), b = /<big>\s*([\s\S]*?)<\/big>/.exec(chunk);
    // a heading above the row's own cells names this row's section; one below them (the next table's) the next row's
    if (h && (!b || h.index < b.index)) section = h[1].trim();
    if (b) {
      const end = chunk.indexOf("\n|}", b.index);
      const row = end < 0 ? chunk : chunk.slice(0, end);
      const noteNames = [...row.matchAll(/<ref name="?([^">/]+)"?\s*\/?>/g)].map((m) => m[1].trim());
      const body = row.slice(b.index + b[0].length).split("\n!")[0].replace(/\n\|/g, "||");
      const cells = body.split("||").map((c) => c.replace(/(?:rowspan|colspan)="\d"\s*/g, "").replace(/style="text-align:left;"\s*/, "").replace(/^\s*\|/, ""));
      const cl = cells.map(clean).filter((c, i) => i > 0 || c);
      let letters, like;
      if (cl.length >= 4) { letters = cl[0]; like = cl[3]; lastLetters = letters; }
      else if (/^[\u02C8\u02CC\u02D0]$/.test(clean(b[1]))) { section = "Suprasegmental"; letters = ""; like = cl[cl.length - 1]; }
      else { letters = lastLetters; like = cl[cl.length - 1]; }
      ipaRows.push({ ipa: clean(b[1]), letters: letters.split(/[,\s]+/).map((x) => x.replace(/[()|]/g, "")).filter(Boolean), like, section,
        notes: [...new Set(noteNames)].filter((n) => refs[n]) });
    }
    if (h && b && h.index > b.index) section = h[1].trim();
  }
}

// ---- Bengali alphabet: the vowel and consonant tables --------------------------------------------
const letters = {};
for (const m of ABC.matchAll(/font-size:24px;[^|\n]*\|\s*([^\n|{]+?)\s*(?:\n\||\|\|)\s*(?:style="[^"]*"\s*(?:bgcolor="[^"]*")?\s*\|)?\s*\{\{transliteration\|bn\|([^}]+)\}\}<br \/>([^\n]*)/g)) {
  const L = m[1].normalize("NFC");
  if (letters[L]) continue;
  let rest = m[3], note = "";
  const e = rest.indexOf("{{efn");
  if (e >= 0) {
    const raw = balanced(ABC, m.index + m[0].length - rest.length + e);
    if (!/^\{\{efn\|name=\w+\}\}$/.test(raw)) note = clean(raw.replace(/^\{\{efn\|(?:name=\w+\|)?/, "").replace(/\}\}$/, "").replace(/\n\*/g, " · "));
    rest = rest.slice(0, e);
  }
  letters[L] = { tr: m[2], ipa: clean(rest), note };
}

// ---- Bengali alphabet: "Diacritics and other symbols" --------------------------------------------
const signs = {};
{
  const t = cut(ABC, "===Diacritics and other symbols===", "====Notes====");
  // a function cell is long; where a card wants its opening only, the cut is after these words and is marked […]
  const UPTO = { "্য": "{{IPA|/ˈmukʰːɔ/}}", "্ব": "is pronounced {{IPA|/ˈbiʃːɔ/}}.", "ঃ": "'intercity'" };
  for (const chunk of t.split(/\n\|-/)) {
    const cells = chunk.replace(/\n\s*\|\|/g, "||").replace(/\n\|(?!\|)/g, "||").split("||").slice(1);
    if (cells.length < 5 || !/align=center/.test(cells[0])) continue;
    const sym = clean(cells[0].replace(/^.*align=center\s*\|/, "")).replace(/[‌‍◌\s]/g, "").normalize("NFC");
    let fn = cells[2].split(/\n(?:However|'''Note)/)[0], cutMark = "";
    if (UPTO[sym]) {
      const i = fn.indexOf(UPTO[sym]);
      if (i < 0) throw new Error("the function of " + sym + " no longer holds " + UPTO[sym]);
      if (fn.slice(i + UPTO[sym].length).trim()) cutMark = " […]";
      fn = fn.slice(0, i + UPTO[sym].length);
    }
    signs[sym] = { name: clean(cells[1]), does: clean(fn) + cutMark, tr: clean(cells[3]), ipa: clean(cells[4]) };
  }
}

// ---- the passages, by their first and last words --------------------------------------------------
// a passage that starts inside a sentence, or stops before its end, says so: […]
const P = (from, to, src) => {
  const t = clean(cut(src || ABC, from, to));
  return (/^[a-z\u0980-\u09FF]/.test(t) ? "[…] " : "") + t + (/[.)]$/.test(t) ? "" : " […]");
};
const PASSAGES = {
  inherent: P("An exception to the above system is the vowel", "may be written underneath the consonant."),
  inherentIs: P("represents the default [[inherent vowel]]", "for the entire Bengali script."),
  kar: P("When a vowel sound occurs syllable-initially", "'vowel sign')."),
  ae: P("Even though the [[near-open front unrounded vowel]] {{IPA|/æ/}} is one of the seven main vowel sounds in standard Bengali", "the script was conceived."),
  length: P("There are two graphemes for the vowel sound", "in modern Bengali."),
  ri: P("does not actually represent a vowel phoneme in Bengali", "{{IPA|/ri/}}."),
  names: P("The names of the letters are typically just the consonant sound", "{{lang|bn-Latn|gh}})."),
  n: P("since the consonant phoneme {{IPA|/n/}} is written as both", "and {{lang|bn|ঢ}})."),
  sh: P("The [[voiceless palato-alveolar sibilant]] phoneme", "in modern standard Bengali."),
  j: P("The [[voiced palato-alveolar affricate]]", "'plosive {{lang|bn-Latn|jô}}')."),
  y: P("The [[semivowel]] {{lang|bn|য়}}", "at the beginning of a word."),
  yGlide: P("The pronunciation of {{lang|bn|য়}}", "and {{IPA|/j/}}."),
  ja: P("whose onset was originally pronounced as a glide", "at the beginning of words."),
  yaphala: P("When present in the middle of words, in conjuncts, {{lang|bn|য}}", "or be completely silent."),
  flap: P("{{lang|bn|ড়}} and {{lang|bn|ঢ়}} were introduced to the inventory", "in modern Bengali."),
  conjunct: P("Clusters of up to four consonants", "resemblance to the base character."),
  conjunctSaid: P("Often, consonant conjuncts are not actually pronounced", "in Bengali."),
  gya: P("{{lang|bn|জ্ঞ}} ''jñô'', which is a combination of", "in modern Bengali"),
  ksha: P("Certain combinations must be memorised:", "''kṣô''"),
  khanda: P("As the first member of a conjunct, or when at the end of a word and followed by no vowel, {{lang|bn|ত}}", "{{lang|bn|[[ৎ]]}}"),
  matra: P("the Bengali letter-forms instead hang from", "the independent vowel এ ''e''."),
};
const coronal = refs.coronalstops;

// every bullet of the conjunct sections that names a conjunct, for the conjunct cards
const conjunctLines = [];
{
  const t = cut(ABC, "====Fused forms====", "===Certain compounds===");
  for (const line of t.split("\n")) if (/^\*+ /.test(line) && /e\.g\./.test(line)) {
    const html = clean(line.replace(/^\*+ /, ""));
    const named = [...new Set((html.match(/[ক-হৎড়-য়়্]+/g) || []).filter((x) => x.includes("্")).map((x) => x.normalize("NFC")))];
    conjunctLines.push({ html, named });
  }
}

// ---- the rows, in the deck's order ---------------------------------------------------------------
// [key (what the id is pinned to: the note's Letter on the day of the seed), kind, the letter, the sign-on-ক form, passages]
// `says` names passages; "note" is the letter's own footnote in its table, "ipa-note" the notes on its Help:IPA rows
const V = (L, on, says) => ({ key: on ? L + " · " + on : L, kind: "vowel", letter: L, sign: on ? on.slice(1) : "", shown: on ? L + " · " + on : L, says: says || [] });
const K = (L, says, kind) => ({ key: L, kind: kind || "consonant", letter: L, shown: L, says: says || [] });
const S = (key, sym, name, says, kind) => ({ key, kind: kind || "sign", letter: sym, shown: key, name, says: says || [] });
const ROWS = [
  V("অ", "", ["inherentIs", "note"]), V("আ", "কা"), V("ই", "কি"), V("ঈ", "কী"), V("উ", "কু"), V("ঊ", "কূ"),
  V("ঋ", "কৃ", ["ri"]), V("এ", "কে", ["note"]), V("ঐ", "কৈ"), V("ও", "কো"), V("ঔ", "কৌ"),
  S("কং", "ং", "অনুস্বার"), S("কঃ", "ঃ", "বিসর্গ"), S("কঁ", "ঁ", "চন্দ্রবিন্দু"), S("ক্", "্", "হসন্ত"), S("ৎ", "ৎ", "খণ্ড ত", ["khanda"]),
  K("ক"), K("খ"), K("গ"), K("ঘ"), K("ঙ"), K("চ"), K("ছ"), K("জ"), K("ঝ"), K("ঞ", ["note"]),
  K("ট"), K("ঠ"), K("ড"), K("ঢ"), K("ণ", ["note"]), K("ত"), K("থ"), K("দ"), K("ধ"), K("ন"),
  K("প"), K("ফ", ["note"]), K("ব"), K("ভ", ["note"]), K("ম"), K("য", ["ja"]), K("র", ["ipa-note"]), K("ল"), K("শ"), K("ষ"), K("স"), K("হ", ["note"]),
  K("ড়", ["flap"], "dotted"), K("ঢ়", [], "dotted"), K("য়", ["y", "yGlide"], "dotted"),
  { key: "ক্ষ", kind: "joined", letter: "ক্ষ", shown: "ক্ষ", says: ["ksha"] },
  { key: "জ্ঞ", kind: "joined", letter: "জ্ঞ", shown: "জ্ঞ", says: ["gya"] },
  S("ক্য", "্য", "য-ফলা", ["yaphala"], "phala"), S("ক্র", "্র", "র-ফলা", [], "phala"), S("ক্ব", "্ব", "ব-ফলা", [], "phala"),
  // new on 2026-11-19: the sign the deck lacked
  S("র্ক", "র্", "রেফ", [], "phala"),
];
// the rule cards (card type bn-rule, one card each): a heading, the letters it is about, what the sources say
// `after` is the group of rows a rule card follows; `pick` says which example words the builder looks for
const RULES = [
  { key: "rule:inherent", after: "vowel", title: "The vowel no sign writes", shown: "ক = ক + অ", says: ["inherent", "names"], pick: "bare" },
  { key: "rule:kar", after: "vowel", title: "A vowel after a consonant is a sign", shown: "কা কি কী কু কূ কৃ কে কৈ কো কৌ", says: ["kar"], pick: ["\u09BF", "\u09C7", "\u09CB"] },
  { key: "rule:length", after: "vowel", title: "Two letters, one vowel", shown: "ই ঈ · উ ঊ", says: ["length"], pick: ["\u09BF", "\u09C0", "\u09C1", "\u09C2"] },
  { key: "rule:ae", after: "vowel", title: "A vowel with no letter of its own", shown: "æ", says: ["ae"], pick: "ae" },
  { key: "rule:aspirate", after: "consonant", title: "অল্পপ্রাণ (Unaspirated) · মহাপ্রাণ (Aspirated)", shown: "ক খ · গ ঘ · চ ছ · জ ঝ · প ফ · ব ভ", says: [], pairs: [["ক", "খ"], ["গ", "ঘ"], ["চ", "ছ"], ["জ", "ঝ"], ["ট", "ঠ"], ["ড", "ঢ"], ["ত", "থ"], ["দ", "ধ"], ["প", "ফ"], ["ব", "ভ"]] },
  { key: "rule:dental", after: "consonant", title: "Two kinds of t and d", shown: "ত থ দ ধ · ট ঠ ড ঢ", says: ["@coronal"], pick: ["ত", "ট", "দ", "ড"] },
  { key: "rule:sh", after: "consonant", title: "Three letters, one sound", shown: "শ ষ স", says: ["sh"], pick: ["শ", "ষ", "স"] },
  { key: "rule:j", after: "consonant", title: "Two letters, one sound", shown: "জ য", says: ["j"], pick: ["জ", "য"] },
  { key: "rule:n", after: "consonant", title: "Two letters for n", shown: "ন ণ", says: ["n"], pick: ["ন", "ণ"] },
  { key: "rule:matra", after: "dotted", title: "The line the letters hang from", shown: "ত ৩ · ত্র এ", says: ["matra"] },
  { key: "rule:conjunct", after: "phala", title: "Consonants written as one", shown: "ক + ত = ক্ত", says: ["conjunct", "conjunctSaid"] },
];
// the header cells of the consonant table the aspiration card's title quotes
for (const h of ["{{lang|bn|অল্পপ্রাণ}} (Unaspirated)", "{{lang|bn|মহাপ্রাণ}} (Aspirated)"]) if (!ABC.includes(h)) throw new Error("the consonant table has no header " + h);

const out = {
  _: "bengali-alphabet.json — the table behind decks/Bengali-Alphabet.folio-deck.json, read by build-bengali-alphabet.js and WRITTEN BY bengali-alphabet-quote.js: do not edit it by hand, edit that script's ROWS, RULES or PASSAGES and re-run it over the two pages at the revisions in `sources`. NOTHING IN IT IS COMPOSED. `letters` is a cell of the vowel or consonant table of Wikipedia's 'Bengali alphabet' per letter: its name in romanisation (`tr`), that name in IPA (`ipa`) and the cell's own footnote (`note`). `sounds` is Help:IPA/Bengali row by row: the symbol, the letters that write it, the 'English approximation' cell (`like`) and the names of the notes on the row (`notes`, their text in `ipaNotes`). `signs` is a row of the 'Diacritics and other symbols' table of 'Bengali alphabet': name, function, romanisation, IPA. `passages` are whole sentences of 'Bengali alphabet' cut by their first and last words; `conjuncts` every bullet of its sections on how conjuncts are built that names one. Wiki markup is turned into <b>, <i> and ⟨ ⟩, a link becomes its text, a footnote or citation is dropped, and no word is changed. `rows` and `rules` say which letters, signs and rules have a card, in what order, and which passages stand on each; a row's `key` is what its id is pinned to (bengali-ids.json). A rule's `title` is a heading written for the card, not a quotation — except the aspiration card's, which is the two header cells of the consonant table.",
  sources: SOURCES, letters, sounds: ipaRows, ipaNotes: refs, signs, passages: Object.assign({ "@coronal": coronal }, PASSAGES), conjuncts: conjunctLines, rows: ROWS, rules: RULES,
};
const file = path.join(__dirname, "bengali-alphabet.json");
fs.writeFileSync(file, JSON.stringify(out, null, 1) + "\n");
console.log("wrote " + file + ": " + Object.keys(letters).length + " letters, " + ipaRows.length + " sounds, " + Object.keys(signs).length + " signs, " +
  Object.keys(PASSAGES).length + " passages, " + conjunctLines.length + " conjunct lines, " + ROWS.length + " rows, " + RULES.length + " rules");
