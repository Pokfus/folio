#!/usr/bin/env node
"use strict";
/*
  build-bengali-alphabet.js — WRITES decks/Bengali-Alphabet.folio-deck.json (Nov 2026, the Bengali beginner
  pass — docs/lang-decks.md). Standalone Node helper, zero deps. Not part of the site.

    node .claude/decks/build-bengali-alphabet.js            # write the deck (and pin any new note)
    node .claude/decks/build-bengali-alphabet.js --check    # exit 1 unless the shipped deck is what this writes

  IT READS NO LIVE SOURCE: the table `bengali-alphabet.json` (cells and sentences of two Wikipedia pages at
  pinned revisions, cut by bengali-alphabet-quote.js) and the shipped Bengali level decks, for the example
  words. It replaces `.claude/bengali/alphabet.py`, whose descriptions of the sounds were written by hand.

  WHAT A CARD SAYS, AND WHERE EACH PART COMES FROM.
    · a LETTER (card type `bn-abc`, two cards: letter → sound, sound → letter): its name in romanisation and
      in IPA — a cell of the 'Bengali alphabet' tables; then every row of Help:IPA/Bengali that lists the
      letter: the symbol and the 'English approximation' cell; then the passages its row names.
    · a SIGN: its name, function, romanisation and IPA — the row of 'Diacritics and other symbols'.
    · a JOINED letter, and a CONJUNCT: its consonants, read off the letter itself (ক + ষ: a conjunct IS its
      consonants with the hasanta between them), with each one's name from the table; then every bullet of
      'Bengali alphabet' on how conjuncts are built that names it.
    · a RULE (card type `bn-rule`, one card): a heading, the letters it is about, and passages. The heading
      is written for the card and is not a quotation.
    · the EXAMPLE WORDS are cards of the level decks, in the order the shelf deals them (A1 first, in A1's
      order): the first word that shows the letter and has a pronunciation, a word not being used twice
      while another will do. Its romanisation, pronunciation and meaning are that card's — Wiktionary's.
  WHICH CONJUNCTS: every conjunct in two or more of A1's headwords that is not a phala or reph form (those
  are the sign rows) and has no row of its own. A1 decides, so a change to A1 can change this list; the ids
  are pinned (bengali-ids.json), a dropped conjunct's number retires, and none is dealt twice.

  THE REVERSE CARD needs every letter's sound side to be its own: the build fails if two are the same.
*/
const C = require("./bengali-common.js");
const CHECK = process.argv.includes("--check");
const T = C.readJSON(C.path.join(__dirname, "bengali-alphabet.json"), null);
if (!T) { console.error("build-bengali-alphabet: bengali-alphabet.json is missing"); process.exit(1); }
const decks = C.loadDecks();
const ids = C.readJSON(C.IDS, {});
const DECK = "bnabc", FILE = C.path.join(C.DECKS, "Bengali-Alphabet.folio-deck.json");
const STAMP = "2026-11-09T00:00:00.000Z", COLOR = "#574518";
const H = "্";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const fail = (m) => { console.error("build-bengali-alphabet: " + m); process.exit(1); };

// ---- the example words: the level decks' cards, in shelf order -----------------------------------
const WORDS = [];
for (const id of C.LEVELS) {
  if (!decks[id]) fail("no deck " + id);
  for (const c of decks[id].deck.cards) {
    const w = C.nfc(c.fields.Word);
    if (/\s/.test(w) || !c.fields.IPA) continue;
    const gl = /<div class="uc-gl">(.*?)<\/div>|<li>(.*?)<\/li>/.exec(c.fields.English);
    WORDS.push({ w, roman: c.fields.Roman, ipa: c.fields.IPA, gloss: gl ? gl[1] || gl[2] : "", level: C.LEVEL_NAME[id], a1: id === "bengalia1" });
  }
}
const used = new Set();
function word(test) {
  const hit = WORDS.find((x) => !used.has(x.w) && test(x.w)) || WORDS.find((x) => test(x.w));
  if (hit) used.add(hit.w);
  return hit;
}
const exHTML = (x) => '<div class="uc-exw"><span class="uc-ex">' + esc(x.w) + '</span><span class="uc-tts uc-exsay" data-say="' + esc(x.w) + '"></span>' +
  (x.roman ? '<span class="uc-exr">' + x.roman + "</span>" : "") + '<span class="uc-ipa">' + x.ipa + '</span><span class="uc-exe">' + x.gloss + "</span></div>";
const examples = (list) => list.filter(Boolean).map(exHTML).join("");

// ---- the parts of a card -------------------------------------------------------------------------
const SRC = { a: "Wikipedia, Bengali alphabet", i: "Wikipedia, Help:IPA/Bengali" };
const quote = (html, src) => '<div class="uc-q">' + html + '<span class="uc-src">' + SRC[src] + "</span></div>";
function passages(names, row) {
  const out = [];
  for (const n of names || []) {
    if (n === "note") { const L = T.letters[row.letter]; if (!L || !L.note) fail(row.key + " has no footnote in its table"); out.push(quote(L.note, "a")); }
    else if (n === "ipa-note") { for (const r of soundsOf(row.letter, row.kind)) for (const k of r.notes) out.push(quote(T.ipaNotes[k], "i")); }
    else { if (!T.passages[n]) fail("no passage " + n); out.push(quote(T.passages[n], n === "@coronal" ? "i" : "a")); }
  }
  return [...new Set(out)].join("");
}
// a letter stands in a word where it is not the body of a dotted letter (য in য়, ড in ড়: NFC keeps the dot apart)
const NUKTA = "়";
const holds = (L) => (w) => { for (let i = w.indexOf(L); i >= 0; i = w.indexOf(L, i + 1)) if (L.endsWith(NUKTA) || w[i + L.length] !== NUKTA) return true; return false; };
const has = holds;
// ... and stands ALONE where it is no part of a conjunct either (য in ্য is the phala, not the letter)
const alone = (L) => (w) => { for (let i = w.indexOf(L); i >= 0; i = w.indexOf(L, i + 1)) if (w[i - 1] !== H && w[i + L.length] !== H && w[i + L.length] !== NUKTA) return true; return false; };
const letterIn = (L) => (/^[\u0995-\u09B9]$/.test(L) ? alone(L) : holds(L));
// the rows of Help:IPA/Bengali that list a letter. The page writes its vowel signs on প, so প is a consonant's
// row only where the row is a consonant's; a vowel's own rows come before the marginal ones.
const VOWELISH = ["Monophthong", "Semivowel", "Diphthong", "Marginal consonant"];
function soundsOf(L, kind) {
  const rows = T.sounds.filter((r) => r.letters.includes(L));
  if (kind === "vowel" || L === "য" + NUKTA) return rows.filter((r) => VOWELISH.includes(r.section)).sort((a, b) => VOWELISH.indexOf(a.section) - VOWELISH.indexOf(b.section));
  return rows.filter((r) => /onsonant$/.test(r.section) || kind === "sign");
}
const likes = (L, kind) => soundsOf(L, kind).map((r) => '<span class="uc-like"><span class="uc-ipa">' + r.ipa + "</span>" +
  (r.section && !/^(Consonant|Monophthong)$/.test(r.section) ? " (" + r.section.toLowerCase() + ")" : "") + " · " + r.like + "</span>").join("");
const nameOf = (L) => { const x = T.letters[L]; return x ? '<span class="uc-rm">' + esc(x.tr) + '</span> <span class="uc-ipa">' + esc(x.ipa) + "</span>" : ""; };
const consonants = (s) => C.nfc(s).split(H).filter(Boolean);
const built = (s) => consonants(s).map((k) => esc(k) + (T.letters[k] ? " <i>" + esc(T.letters[k].tr) + "</i>" : "")).join(" + ");
const conjLines = (s) => T.conjuncts.filter((c) => c.named.includes(C.nfc(s))).map((c) => quote(c.html, "a")).join("");
const CONS = "[ক-হড়-য়]়?";

function letterCard(row) {
  const L = row.letter;
  let sound, says = passages(row.says, row), ex = [];
  if (row.kind === "vowel") {
    if (!T.letters[L]) fail("no table cell for " + L);
    sound = nameOf(L) + likes(L, "vowel");
    ex = [word((w) => w.startsWith(L)), row.sign ? word(has(row.sign)) : null];
  } else if (row.kind === "consonant" || row.kind === "dotted") {
    if (!T.letters[L]) fail("no table cell for " + L);
    sound = nameOf(L) + likes(L, row.kind);
    // a word that starts with the letter standing alone, else one that holds it
    ex = [word((w) => w.startsWith(L) && w[L.length] !== H && (L.endsWith(NUKTA) || w[L.length] !== NUKTA)) || word(letterIn(L)) || word(has(L))];
  } else if (row.kind === "joined") {
    sound = '<span class="uc-rm">' + built(L) + "</span>" + likes(L, "joined");
    says = says + conjLines(L);
    ex = [word(has(L))];
  } else {                                         // a sign
    const s = T.signs[L];
    if (!s) fail("no row of 'Diacritics and other symbols' for " + L);
    sound = '<span class="uc-rm">' + s.name + "</span>" + (s.tr && !/^[–-]$/.test(s.tr) ? ' <span class="uc-rm">' + s.tr + "</span>" : "") +
      (s.ipa && !/^[–-]$/.test(s.ipa) ? ' <span class="uc-ipa">' + s.ipa + "</span>" : "") + likes(L, "sign");
    says = quote(s.does, "a") + says;
    ex = [word(L === "র" + H ? (w) => new RegExp("র" + H + CONS).test(w) : has(L))];
  }
  return { type: "bn-abc", fields: { Key: row.key, Letter: esc(row.shown), Name: esc(row.name || row.letter), Sound: sound, Says: says, Example: examples(ex) } };
}

function ruleCard(r) {
  let body = passages(r.says, r), ex = [];
  if (r.pairs) {
    body += '<div class="uc-q">' + r.pairs.map((p) => '<div class="uc-pair">' + p.map((L) => {
      const s = soundsOf(L, "consonant").find((x) => x.section === "Consonant");
      if (!s) fail("no Help:IPA row for " + L);
      return '<span class="uc-pl">' + esc(L) + '</span> <span class="uc-ipa">' + s.ipa + "</span> " + s.like;
    }).join(" · ") + "</div>").join("") + '<span class="uc-src">' + SRC.i + ", the 'English approximation' of each row</span></div>";
  } else if (r.pick === "bare") {
    // words written with consonant letters alone: every vowel in them is the one no sign writes
    const bare = new RegExp("^(?:" + CONS + "){2,}$");
    ex = [word((w) => bare.test(w)), word((w) => bare.test(w)), word((w) => bare.test(w))];
  } else if (r.pick === "ae") {
    // the first three words whose pronunciation holds it
    ex = WORDS.filter((x) => /[æɛ]/.test(x.ipa)).slice(0, 3);
  } else if (Array.isArray(r.pick)) ex = r.pick.map((L) => word(letterIn(L)) || word(has(L)));
  return { type: "bn-rule", fields: { Key: r.key, Letter: esc(r.shown), Title: esc(r.title), Says: body, Example: examples(ex) } };
}

// ---- the conjuncts A1 needs ----------------------------------------------------------------------
function conjunctRows() {
  const count = new Map();
  const re = new RegExp("(?:" + CONS + H + ")+" + CONS, "g");
  for (const c of decks.bengalia1.deck.cards) for (const m of new Set(C.nfc(c.fields.Word).match(re) || [])) count.set(m, (count.get(m) || 0) + 1);
  const own = new Set(T.rows.map((r) => C.nfc(r.letter)));
  const out = [];
  for (const [k, n] of count) {
    const parts = consonants(k);
    if (n < 2 || own.has(k)) continue;
    if (parts[0] === "র" && parts.length === 2) continue;                    // reph
    if (/^[যরব]$/.test(parts[parts.length - 1]) && parts.length === 2) continue;   // a phala
    out.push({ k, n });
  }
  out.sort((a, b) => b.n - a.n || (a.k < b.k ? -1 : 1));
  return out.map(({ k, n }) => ({ type: "bn-abc", n, fields: { Key: "conj:" + k, Letter: esc(k), Name: esc(k),
    Sound: '<span class="uc-rm">' + built(k) + "</span>", Says: conjLines(k), Example: examples([word(has(k))]) } }));
}

// ---- assemble, in the deck's order ----------------------------------------------------------------
const GROUPS = ["vowel", "sign", "consonant", "dotted", "joined", "phala"];
const cards = [];
for (const g of GROUPS) {
  for (const row of T.rows.filter((r) => r.kind === g)) cards.push(letterCard(row));
  for (const r of T.rules.filter((x) => x.after === g)) cards.push(ruleCard(r));
}
const conj = conjunctRows();
cards.push(...conj);
for (const r of T.rows) if (!GROUPS.includes(r.kind)) fail("row " + r.key + " is of no known kind");
for (const r of T.rules) if (!GROUPS.includes(r.after)) fail("rule " + r.key + " follows no known group");

const sides = new Map();
for (const c of cards.filter((x) => x.type === "bn-abc")) {
  if (sides.has(c.fields.Sound)) fail(c.fields.Key + " and " + sides.get(c.fields.Sound) + " share a sound side: the reverse card is unanswerable");
  sides.set(c.fields.Sound, c.fields.Key);
}

// ---- the pin ---------------------------------------------------------------------------------------
ids._retired = ids._retired || {};
const live = (ids[DECK] = ids[DECK] || {}), gone = (ids._retired[DECK] = ids._retired[DECK] || {});
let idsChanged = false;
const keys = new Set();
for (const c of cards) {
  const k = c.fields.Key;
  if (keys.has(k)) fail("two notes share the key " + k);
  keys.add(k);
  if (!(k in live)) {
    if (CHECK) fail(k + " has no pinned number (run build-bengali-alphabet.js)");
    if (k in gone) { live[k] = gone[k]; delete gone[k]; } else live[k] = Math.max(0, ...Object.values(live), ...Object.values(gone)) + 1;
    idsChanged = true;
  }
  c.id = "u_" + DECK + "_" + live[k];
  c.sub = "";
  delete c.n;
}
for (const k of Object.keys(live)) if (!keys.has(k)) {
  if (CHECK) fail(k + " is pinned but the deck has no such note");
  gone[k] = live[k]; delete live[k]; idsChanged = true;
}
if (!Object.keys(gone).length) delete ids._retired[DECK];

// ---- the deck ---------------------------------------------------------------------------------------
const nLetters = cards.filter((c) => c.type === "bn-abc").length, nRules = cards.length - nLetters, nCards = nLetters * 2 + nRules;
const count = (k) => T.rows.filter((r) => r.kind === k).length;
const days = Math.ceil(nCards / C.NEW_PER_DAY);
const S = T.sources;
const desc =
  "The Bengali script (Bangla lipi), and how it is read: " + cards.length + " notes, " + nCards + " cards. The first deck of the Bengali collection. " +
  "In the traditional order: the " + count("vowel") + " vowels, each shown alone and as the sign it becomes after a consonant, written on ক (আ · কা); the " +
  count("sign") + " signs that sit on or beside a letter; the " + count("consonant") + " consonants row by row and the " + count("dotted") +
  " dotted letters (ড়, ঢ়, য়); the two joined letters every primer teaches (ক্ষ, জ্ঞ); the phala signs and reph (য-ফলা, র-ফলা, ব-ফলা, রেফ); and the " +
  conj.length + " other conjuncts that stand in two or more of Bengali A1's words (" + conj.slice(0, 4).map((c) => c.fields.Letter).join(", ") + " …). " +
  "A letter is two cards, each with its own schedule: see the letter and recall its sound, or see the sound and recall the letter. Between the groups stand " +
  nRules + " rule cards, one card each: the vowel no sign writes, the vowel signs, the letters that sound alike (ই ঈ, উ ঊ, শ ষ স, জ য, ন ণ), the vowel æ that has no letter, " +
  "the breathy consonants beside the plain ones, the two kinds of t and d, the headstroke, and how consonants join. " +
  "WHERE EVERY STATEMENT COMES FROM: nothing on a card is this deck's own description. A letter's name in romanisation and in the International Phonetic Alphabet is a cell of the " +
  "vowel or consonant table of Wikipedia's '" + S.alphabet.title + "' (revision " + S.alphabet.rev + ", " + S.alphabet.date + "); the English sound it is like is the 'English approximation' cell of every row of Wikipedia's '" +
  S.ipa.title + "' (revision " + S.ipa.rev + ", " + S.ipa.date + ") that lists the letter, with that page's own regional labels (American, Scottish, Indian); a sign's function is its row of the first page's table " +
  "'Diacritics and other symbols'; and each longer statement is a sentence of the first page, or a note of the second, quoted whole — a cut is marked […] — and signed beneath. A rule card's heading is the only text " +
  "written for the deck. What a conjunct is made of is read off the letter itself. Those two pages do not say that the inherent vowel is usually silent at the end of a word, " +
  "nor which side of its consonant each vowel sign is written on, so no card says either: the example words show both. " +
  "Every example word is a card of the level decks, the first in the order they are dealt that shows the letter, with a speaker and Wiktionary's romanisation and pronunciation: " +
  "the romanisation follows the SPELLING and the pronunciation gives the SOUND, and the symbols of the second are the ones this deck teaches. " +
  "At Folio's default of ten new cards a day this deck takes " + days + " days. " +
  "Sources. Wikipedia, '" + S.alphabet.title + "' and '" + S.ipa.title + "', at the revisions above (CC BY-SA 4.0). Example words, their romanisation, pronunciation and meanings: " +
  "English Wiktionary, via the kaikki.org extraction (CC BY-SA 4.0).";

const SAY = '<span class="uc-tts uc-say" data-say="{{Name}}"></span>';
const LETTER = '<div class="uc-letter">{{Letter}}' + SAY + "</div>";
const DETAIL = '<div class="uc-field"><div class="uc-pos">sound</div><div class="uc-gl">{{Sound}}</div>{{#Says}}<div class="uc-says">{{Says}}</div>{{/Says}}' +
  '{{#Example}}<div class="uc-pos uc-gap">as in</div><div class="uc-gl">{{Example}}</div>{{/Example}}</div>';
const RULE = '<div class="uc-ask">{{Title}}</div><div class="uc-letter uc-rule">{{Letter}}</div>';
const CSS = `.card {
  text-align: center;
  font-size: 17px;
  line-height: 1.6;
}
.uc-ask {
  margin-bottom: 14px;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.55;
}
.uc-letter {
  font-size: 60px;
  font-weight: 400;
  line-height: 1.3;
}
.uc-rule {
  font-size: 34px;
  line-height: 1.5;
}
.uc-say {
  margin-left: 14px;
  vertical-align: middle;
  font-size: 15px;
}
.uc-exsay {
  margin: 0 8px 0 6px;
  vertical-align: middle;
  font-size: 13px;
}
.uc-field {
  display: block;
  width: fit-content;
  min-width: min(300px, 100%);
  max-width: 100%;
  margin: 14px auto 0;
  padding: 11px 15px;
  border: 1px solid var(--rule, rgba(0,0,0,0.12));
  border-radius: 11px;
  text-align: left;
  background: color-mix(in srgb, var(--paper-2, #EFEDE6) 58%, var(--card, #FFFFFF));
}
.uc-pos {
  margin-bottom: 3px;
  font-size: 9.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-faint, #6C6A63);
}
.uc-gap {
  margin-top: 10px;
}
.uc-gl {
  line-height: 1.5;
}
.uc-rm {
  font-weight: 600;
}
.uc-ipa {
  margin-left: 4px;
  letter-spacing: 0.02em;
}
.uc-like {
  display: block;
  margin-top: 2px;
}
.uc-like .uc-ipa {
  margin-left: 0;
}
.uc-says {
  margin-top: 8px;
}
.uc-q {
  margin-top: 8px;
  padding-left: 10px;
  border-left: 2px solid var(--rule, rgba(0,0,0,0.16));
  font-size: 14.5px;
  line-height: 1.5;
}
.uc-src {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  opacity: 0.6;
}
.uc-pair {
  margin: 1px 0;
}
.uc-pl {
  font-size: 19px;
}
.uc-exw + .uc-exw {
  margin-top: 4px;
}
.uc-ex {
  font-size: 21px;
}
.uc-exr {
  font-size: 14px;
  opacity: 0.62;
}
.uc-exe {
  margin-left: 8px;
  opacity: 0.62;
}
`;
const deck = {
  folioDeck: 1, exportedAt: STAMP,
  meta: {
    id: DECK, title: "Bengali Alphabet (Bangla script)",
    subtitle: nLetters + " letters, signs and conjuncts, as two cards each · " + nRules + " rules of reading",
    desc, author: "", language: "en", color: COLOR, tags: ["bengali", "bangla", "alphabet", "script"], glossMode: "site",
    types: {
      "bn-abc": { id: "bn-abc", name: "Bengali letter", speechLang: "bn-IN", fields: ["Key", "Letter", "Name", "Sound", "Says", "Example"],
        cards: [{ name: "Letter → sound", front: LETTER, back: "{{FrontSide}}<hr>" + DETAIL },
          { name: "Sound → letter", front: '<div class="uc-ask">Which letter is this?</div><div class="uc-field"><div class="uc-gl">{{Sound}}</div></div>', back: "{{FrontSide}}<hr>" + LETTER + DETAIL }],
        css: CSS },
      "bn-rule": { id: "bn-rule", name: "Bengali reading rule", speechLang: "bn-IN", fields: ["Key", "Letter", "Title", "Says", "Example"],
        cards: [{ name: "Rule", front: RULE, back: "{{FrontSide}}<hr>" + '<div class="uc-field">{{Says}}{{#Example}}<div class="uc-pos uc-gap">as in</div><div class="uc-gl">{{Example}}</div>{{/Example}}</div>' }],
        css: CSS },
    },
    version: 1, createdAt: STAMP, updatedAt: STAMP, forkedFrom: null,
  },
  cards: cards.map((c) => ({ sub: c.sub, fields: c.fields, id: c.id, type: c.type })),
  gloss: {},
};
const out = JSON.stringify(deck);
if (CHECK) {
  if (!C.fs.existsSync(FILE) || C.fs.readFileSync(FILE, "utf8") !== out) fail("decks/Bengali-Alphabet.folio-deck.json is not what the table and the level decks give (run build-bengali-alphabet.js)");
  console.log("build-bengali-alphabet: ok — " + cards.length + " notes, " + nCards + " cards");
} else {
  if (idsChanged) { C.writeByDeck(C.IDS, ids); console.log("build-bengali-alphabet: bengali-ids.json updated"); }
  C.fs.writeFileSync(FILE, out);
  console.log("build-bengali-alphabet: wrote " + cards.length + " notes (" + nLetters + " letters and conjuncts, " + nRules + " rules), " + nCards + " cards");
}
