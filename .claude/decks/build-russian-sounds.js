#!/usr/bin/env node
"use strict";
/*
  build-russian-sounds.js — writes decks/Russian-Sounds-and-Spelling.folio-deck.json AND
  decks/Russian-Alphabet.folio-deck.json (Nov 2026, the Russian beginner pass — docs/lang-decks.md).
  Standalone Node helper, zero deps. Not part of the site.

    node .claude/decks/build-russian-sounds.js            # build both
    node .claude/decks/build-russian-sounds.js --check    # are the two decks what the table and TORFL A1 give?
    node .claude/decks/build-russian-sounds.js --report   # print the cards, write nothing

  WHY IT EXISTS. The Russian word decks carry no romanisation, so the alphabet deck was the only key to
  them, and it taught 33 letters one sound each. Measured on TORFL A1 as shipped on 2026-11-19 (500 notes):
  174 have an unstressed о and 116 an unstressed а (read [ɐ] or [ə]), 115 an unstressed е or я (read [ɪ]), 239
  a consonant softened by the vowel after it and 158 by ь, 28 end in a voiced consonant that is read
  voiceless (хлеб, год, друг), 25 hold a voiced consonant devoiced by the next one, 23 an и or е after ж, ш, ц
  that is read [ɨ], 14 end in -ться, 7 write a consonant nobody says (здравствуйте, солнце, сердце), 6 are
  что or built on it, 3 read г as [v] (его, сегодня, ничего) — and 382 hold one of В Н Р С У Х, which look
  Latin and are not. The alphabet deck said one of these things (unstressed о "is said like а"), in the
  author's own words, and named no source for any sound.

  IT READS NO LIVE SOURCE: only `russian-sounds.json` (cells and sentences of three Wikipedia pages at the
  revisions it names, and the English Wiktionary's transcription of each example word, copied by machine
  from the kaikki.org extract) and the shipped TORFL A1 deck. NOTHING ON A CARD IS COMPOSED HERE.

  THE ALPHABET DECK is written here too, since 2026-11-19 (`.claude/torfl/alphabet.py`, hand-written with
  no sources, is gone): one note per letter, its NAME, its SOUNDS in the IPA and its ENGLISH EQUIVALENT
  the three cells of the Letters table of Wikipedia's "Russian alphabet", its example word a TORFL A1 card
  with that card's stress and first meaning and Wiktionary's transcription. The card type (`ru-abc`), its
  five fields, its two templates and its ids (`u_ruabc_1` … `33`, pinned by letter in russian-ids.json) are
  what they were, so a reader's progress on both directions is kept.

  THE SOUNDS DECK's card type is `rusound`, one card a note. An example word is named in the table and
  must be a headword of TORFL A1 (one word of an aspect pair may be named: `съесть` of `есть, съесть`); a
  word A1 does not card fails the build. Its ids come from russian-ids.json (a row's `key` → N); a new
  row takes the next number. russian-fix.js holds both decks to their pinned ids.

  Re-run after russian-fix.js changes TORFL A1 (a meaning or a stress shown here is A1's), then
  `.claude/build-lang-decks.js`.
*/
const fs = require("fs"), path = require("path");
const HERE = __dirname, DIR = path.join(HERE, "..", "..", "decks");
const TABLE = path.join(HERE, "russian-sounds.json"), IDS = path.join(HERE, "russian-ids.json");
const argv = process.argv.slice(2), CHECK = argv.includes("--check"), REPORT = argv.includes("--report");
const STAMP = Date.UTC(2026, 10, 19), STAMP_ISO = "2026-11-19T00:00:00.000Z";
const fail = (m) => { console.error("FAIL  " + m); process.exit(1); };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const strip = (s) => String(s || "").replace(/<[^>]+>/g, "").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
const bare = (s) => String(s).replace(/[́̀]/g, "");

const T = JSON.parse(fs.readFileSync(TABLE, "utf8"));
/* TORFL A1, found by its deck id and card type rather than by its file name */
const a1 = fs.readdirSync(DIR).filter((f) => /Russian/.test(f) && f.endsWith(".folio-deck.json"))
  .map((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"))).find((d) => d.meta && d.meta.id === "torfla1" && d.meta.types && d.meta.types.torfl);
if (!a1) fail("no TORFL A1 deck (id torfla1, card type torfl) in decks/");
const glossOf = (c) => { const m = /<(?:div class="uc-gl"|li)>([\s\S]*?)<\/(?:div|li)>/.exec(c.fields.English); return m ? strip(m[1].replace(/<span class="uc-eg">[\s\S]*?<\/span>/g, "")).trim() : ""; };
/* a word of A1 → its card and the same word with A1's stress (an aspect pair is `делать, сделать` / `де́лать / сде́лать`) */
const A1 = new Map();
for (const c of a1.cards) {
  const ws = c.fields.Word.split(", "), heads = strip(c.fields.Russian).split(" / ");
  ws.forEach((w, i) => { if (!A1.has(w)) A1.set(w, { c, head: heads.length === ws.length ? heads[i] : heads[0] }); });
}
const named = (key, w) => A1.get(w) || fail(key + " names " + w + ", which TORFL A1 does not card");
/* pick out the letters a pattern matches in the BARE word, on the stressed spelling */
function marked(head, rx) {
  if (!rx) return esc(head);
  const plain = bare(head).toLowerCase(), on = new Set();
  for (const m of plain.matchAll(new RegExp(rx, "g"))) for (let i = 0; i < m[0].length; i++) on.add(m.index + i);
  if (!on.size) return null;
  let out = "", k = -1;
  for (const ch of head) { if (ch === "́" || ch === "̀") { out += ch; continue; } k++; out += on.has(k) ? "\u0001" + ch + "\u0002" : ch; }
  /* a stress mark stays with its letter: «о\u0002́» → «о́\u0002» */
  return esc(out.replace(/\u0002([́̀])/g, "$1\u0002").replace(/\u0002\u0001/g, "")).replace(/\u0001/g, "<b>").replace(/\u0002/g, "</b>");
}
function wordRow(key, w, ipa, rx) {
  const { c, head } = named(key, w), shown = marked(head, rx);
  if (shown === null) fail(key + ": " + w + " does not show " + rx);
  return '<div class="uc-row"><span class="uc-rz"><span class="uc-tts uc-exsay" data-say="' + esc(w) + '"></span>' + shown
    + '</span><span class="uc-rg"><span class="uc-ri">' + esc(ipa) + "</span>" + esc(glossOf(c)) + "</span></div>";
}
const lab = (t) => '<span class="uc-lab">' + t + "</span>";
const cite = (s) => "Wikipedia, “" + s.title + "”, revision " + s.revid + " of " + s.timestamp.slice(0, 10);

const pin = JSON.parse(fs.readFileSync(IDS, "utf8"));
let pinChanged = false;
function idFor(deck, key) {
  if (!pin[deck]) { pin[deck] = {}; pinChanged = true; }
  if (!(key in pin[deck])) {
    if (CHECK) fail(deck + "/" + key + " has no pinned id — run without --check");
    pin[deck][key] = Math.max(0, ...Object.values(pin[deck])) + 1; pinChanged = true;
  }
  return "u_" + deck + "_" + pin[deck][key];
}

const BASE_CSS = `.card {
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
`;

/* ============================== the alphabet ============================== */
const ABC_ID = "ruabc", ABC_FILE = "Russian-Alphabet.folio-deck.json";
if (T.letters.length !== 33) fail("the alphabet is 33 letters, the table has " + T.letters.length);
const abcCards = T.letters.map((l) => {
  const { c, head } = named("letter " + l.key, l.word);
  if (!bare(head).toLowerCase().includes(l.key.slice(-1))) fail("the example " + l.word + " does not show " + l.key);
  return { sub: "", fields: {
    Letter: l.key, Name: esc(l.name),
    Sound: '<span class="uc-ipa">' + esc(l.ipa) + '</span><span class="uc-like">' + l.like + "</span>",
    Example: '<span class="uc-ex">' + esc(head) + '</span><span class="uc-ri">' + esc(l.wipa) + '</span><span class="uc-exe">' + esc(glossOf(c)) + "</span>",
    Word: esc(l.word) }, id: idFor(ABC_ID, l.key), type: "ru-abc", key: l.key };
});
const SAY_NAME = '<span class="uc-tts uc-say" data-say="{{Name}}"></span>', SAY_WORD = '<span class="uc-tts uc-say" data-say="{{Word}}"></span>';
const LETTER = '<div class="uc-letter">{{Letter}}' + SAY_NAME + "</div>";
const DETAIL = '<div class="uc-field"><div class="uc-pos">name</div><div class="uc-gl">{{Name}}</div>'
  + '<div class="uc-pos uc-gap">sound</div><div class="uc-gl">{{Sound}}</div>'
  + '<div class="uc-pos uc-gap">as in</div><div class="uc-gl">{{Example}}' + SAY_WORD + "</div></div>";
const ABC_CSS = BASE_CSS + `.uc-letter {
  font-size: 64px;
  font-weight: 400;
  line-height: 1.15;
}
.uc-say {
  margin-left: 14px;
  vertical-align: middle;
  font-size: 15px;
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
.uc-ipa, .uc-ri {
  margin-right: 9px;
  color: var(--accent, #B4532A);
}
.uc-like b {
  font-weight: 400;
  color: var(--accent, #B4532A);
}
.uc-ex {
  margin-right: 9px;
  font-size: 19px;
}
.uc-exe {
  opacity: 0.62;
}
`;
const abcDesc = "The 33 letters of the Russian alphabet, in alphabetical order — the first deck of the Russian collection, since the word decks are "
  + "written in Cyrillic from their first card and carry no transliteration. Both directions: see a letter and recall its sound, or see a sound and recall "
  + "the letter, each a card with its own schedule. Every note gives the letter in capital and small, its name (what a Russian calls it when spelling a "
  + "word aloud) with a speaker, its sounds in the International Phonetic Alphabet, the English sound it comes nearest to, and one word of the TORFL A1 "
  + "deck that shows it, with that word's stress, its own transcription and a speaker. A letter stands for more than one sound (а is [a] under the stress "
  + "and [ɐ] elsewhere; most consonants are hard or soft): this deck gives each letter's sounds, and the deck beside it, Russian — Sounds and spelling, "
  + "says which is read where. At the default of ten new cards a day, both directions together, the 33 letters take " + Math.ceil(33 / 5) + " days. — WHAT "
  + "IS NOT HERE: nothing on these cards was written for this deck. The name, the sounds and the English equivalent are the three cells of the Letters "
  + "table of the page named below, as it gives them (ъ and ь are described there rather than compared); the speaker is your device's Russian voice, so "
  + "a device without one is silent. — Names, sounds and English equivalents: " + cite(T.sources.alphabet) + " (CC BY-SA 4.0). Transcriptions: English "
  + "Wiktionary, via kaikki.org (CC BY-SA 4.0). Example words, stress and meanings: the TORFL A1 deck on this shelf (English Wiktionary via kaikki.org, "
  + "CC BY-SA 4.0).";
const abcDeck = { folioDeck: 1, exportedAt: "2026-10-30T00:00:00.000Z", meta: { id: ABC_ID, title: "Russian Alphabet",
  subtitle: "33 letters · both directions, as two cards per letter", desc: abcDesc, author: "", language: "en", color: "#2E5C9A",
  tags: ["russian", "alphabet", "cyrillic"], glossMode: "site",
  types: { "ru-abc": { id: "ru-abc", name: "Russian letter", speechLang: "ru-RU", fields: ["Letter", "Name", "Sound", "Example", "Word"],
    cards: [{ name: "Letter → sound", front: LETTER, back: "{{FrontSide}}<hr>" + DETAIL },
      { name: "Sound → letter", front: '<div class="uc-ask">Which letter is this?</div><div class="uc-field"><div class="uc-gl">{{Sound}}</div></div>', back: "{{FrontSide}}<hr>" + LETTER + DETAIL }],
    css: ABC_CSS } },
  version: 2, createdAt: "2026-10-30T00:00:00.000Z", updatedAt: STAMP_ISO, forkedFrom: null }, cards: abcCards, gloss: {} };

/* ============================== sounds and spelling ============================== */
const ID = "rusounds", FILE = "Russian-Sounds-and-Spelling.folio-deck.json";
const cards = [];
for (const r of T.sounds) {
  const f = { Letters: r.show, Kind: r.kind, Name: r.name || "", Rows: "", Says: r.says ? esc(r.says) : "", Pairs: "", Examples: "" };
  if (r.rows) f.Rows = r.rows.map((row) => '<div class="uc-sr">' + (row.when ? '<div class="uc-when">' + esc(row.when) + "</div>" : "")
    + '<div class="uc-ipa">' + esc(row.ipa) + "</div>" + (row.like ? '<div class="uc-like">' + row.like + "</div>" : "")
    + '<div class="uc-rows">' + lab("as in") + row.words.map(([w, ipa]) => wordRow(r.key, w, ipa, row.mark)).join("") + "</div></div>").join("");
  /* ROWS OF SPANS, NOT A TABLE: the deck sanitizer (`uDeckNormalize`) drops <table>, <tr> and <td> and keeps their text */
  if (r.pairs) f.Pairs = '<div class="uc-pairs">' + (r.heads ? '<div class="uc-pair uc-pairh">' + r.heads.map((h) => "<span>" + esc(h) + "</span>").join("") + "</div>" : "")
    + r.pairs.map((p) => '<div class="uc-pair">' + p.map((x) => "<span>" + esc(x) + "</span>").join("") + "</div>").join("") + "</div>";
  if (r.words) f.Examples = lab("as in") + r.words.map(([w, ipa]) => wordRow(r.key, w, ipa, null)).join("");
  cards.push({ id: idFor(ID, r.key), num: String(cards.length + 1), key: r.key, type: "rusound", fields: f });
}
const CSS = BASE_CSS + `.uc-snd {
  font-size: 46px;
  line-height: 1.2;
}
.uc-name {
  margin-top: 4px;
  font-size: 13px;
  letter-spacing: 0.04em;
  opacity: 0.7;
}
.uc-field, .uc-sr {
  display: block;
  width: fit-content;
  max-width: 100%;
  margin: 14px auto 0;
  padding: 11px 15px;
  border: 1px solid var(--rule, rgba(0,0,0,0.12));
  border-radius: 11px;
  text-align: left;
  font-size: 15px;
  line-height: 1.5;
  background: var(--paper-2, rgba(0,0,0,0.05));
  background: color-mix(in srgb, var(--paper-2, #EFEDE6) 58%, var(--card, #FFFFFF));
}
.uc-field {
  max-width: 34em;
}
.uc-when {
  margin-bottom: 3px;
  font-size: 9.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-faint, #6C6A63);
}
.uc-ipa {
  font-size: 20px;
  color: var(--accent, #B4532A);
}
.uc-like {
  max-width: 30em;
  font-size: 14.5px;
  line-height: 1.5;
}
.uc-like b, .uc-rz b {
  font-weight: 400;
  color: var(--accent, #B4532A);
}
.uc-tts {
  background: var(--paper, #F6F5F1);
  border-color: var(--paper-2, rgba(0,0,0,0.12));
}
.uc-exsay {
  margin-right: 7px;
  font-size: 12px;
  vertical-align: 0.08em;
}
.uc-lab {
  display: block;
  margin-bottom: 5px;
  font-size: 9.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.5;
}
.uc-rows {
  display: block;
  margin-top: 9px;
  padding-top: 8px;
  border-top: 1px solid var(--rule, rgba(0,0,0,0.10));
  text-align: left;
}
.uc-rows.uc-alone {
  width: fit-content;
  max-width: 100%;
  margin: 14px auto 0;
}
.uc-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 3px 0;
  font-size: 13.5px;
}
.uc-row + .uc-row {
  border-top: 1px solid var(--rule, rgba(0,0,0,0.10));
}
.uc-rz {
  font-size: 18px;
  line-height: 1.4;
  min-width: 5.5em;
}
.uc-rg {
  flex: 1 1 auto;
  opacity: 0.85;
}
.uc-ri {
  margin-right: 8px;
  color: var(--accent, #B4532A);
}
.uc-pairs {
  display: block;
  width: fit-content;
  max-width: 100%;
  margin: 12px auto 0;
  text-align: left;
  font-size: 14px;
  line-height: 1.45;
}
.uc-pair {
  display: flex;
  gap: 14px;
  padding: 4px 0;
  border-top: 1px solid var(--rule, rgba(0,0,0,0.10));
}
.uc-pair span {
  flex: 1 1 0;
  min-width: 0;
}
.uc-pairh {
  border-top: 0;
  font-size: 9.5px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.55;
}
hr {
  margin: 18px 0;
  border: 0;
  border-top: 1px solid currentColor;
  opacity: 0.18;
}
`;
const type = { id: "rusound", name: "Russian sounds and spelling", speechLang: "ru-RU",
  fields: ["Letters", "Kind", "Name", "Rows", "Says", "Pairs", "Examples"],
  cards: [{ name: "Spelling → sound",
    front: '<div class="uc-ask">{{Kind}}</div><div class="uc-snd">{{Letters}}</div>{{#Name}}<div class="uc-name">{{Name}}</div>{{/Name}}',
    back: '{{FrontSide}}<hr>{{#Rows}}{{Rows}}{{/Rows}}'
      + '{{#Says}}<div class="uc-field">{{Says}}</div>{{/Says}}{{#Pairs}}{{Pairs}}{{/Pairs}}'
      + '{{#Examples}}<div class="uc-rows uc-alone">{{Examples}}</div>{{/Examples}}' }],
  css: CSS };

/* what A1 shows of it, counted on the deck as it stands */
const V = "аеёиоуыэюя";
const heads = a1.cards.map((c) => strip(c.fields.Russian).toLowerCase());
const wordsOf = (h) => h.split(/[\s\/,]+/).filter((w) => /[а-яё]/.test(w));
const unstressed = (w, set) => { const n = [...bare(w)].filter((ch) => V.includes(ch)).length; if (n < 2) return false; for (let i = 0; i < w.length; i++) if (set.includes(w[i]) && w[i + 1] !== "́") return true; return false; };
const count = (f) => heads.filter((h) => wordsOf(h).some(f)).length;
const nAO = count((w) => unstressed(w, "оа")), nFin = count((w) => /[бвгджз]ь?$/.test(bare(w))), nSoft = count((w) => /ь/.test(w)), nLat = count((w) => /[внрсух]/.test(w));
const n = cards.length, nV = cards.filter((c) => c.key.startsWith("vowel:")).length, nC = cards.filter((c) => c.key.startsWith("letter:")).length, nR = n - nV - nC;
const desc = "How Russian is read once the letters are known: " + n + " notes, one card each — " + nV + " on the vowels (what о, а, е and я become without the "
  + "stress; ё, ю, ы and у; и and е after ж, ш and ц), " + nC + " on consonant letters and groups (ь and ъ, the vowel letters that begin with a [j], й, г read as "
  + "в in -ого and -его, ч in что, щ, ж and ш, ц, the ending -ться, х, р) and " + nR + " rules of spelling (the six letters that look Latin and are not, the "
  + "stress mark, hard and soft consonants and the vowel letters that show them, a voiced consonant at the end of a word, two consonants together, a "
  + "consonant that is written and not said). The front shows the letters. The back gives the sound in the International Phonetic Alphabet and the English "
  + "sound it resembles, the source's own sentence where there is a rule, and words of the TORFL A1 deck with a speaker beside each, the letters picked "
  + "out, A1's stress mark and the word's own transcription. Say the word, then press the speaker and compare. Of TORFL A1's " + heads.length + " notes, "
  + nAO + " have an unstressed о or а, " + nSoft + " a soft sign, " + nFin + " end in a voiced consonant that is read voiceless, and " + nLat
  + " hold one of В, Н, Р, С, У, Х. THE ORDER is the look-alike letters and the stress mark, the vowels, the consonants, then the other rules. At the "
  + "default of ten new cards a day the deck takes " + Math.ceil(n / 10) + " days; it follows the alphabet deck and is meant to be studied beside TORFL A1, not "
  + "finished first. — WHAT IS NOT HERE: no description was written for this deck. Each sound and each English comparison is a cell of the first page named "
  + "below, with that page's own labels (RP, American, Scottish, Australian English for the accent meant; \"for some dialects\"); the й and р rows and the "
  + "look-alike letters are cells of the second; each rule is a sentence or a note of the page it comes from, with a cut marked […]. The small labels over "
  + "a row (stressed, unstressed, last in the word) say where the letter stands in the words listed under it; each of those words carries the transcription "
  + "that shows the sound. The letters that sound much as an English speaker expects have no card here; each has one in the alphabet deck. The example "
  + "sentences of the word decks print no stress, as they were written: the stress of a word is on its own card. The speaker is your device's Russian voice "
  + "reading the example word, so a device without one is silent. — Sounds and English comparisons: " + cite(T.sources.ipa) + ". Letters, the two signs, hard "
  + "and soft, the stress mark: " + cite(T.sources.alphabet) + ". Silent consonants, -ться, stress: " + cite(T.sources.phonology) + " (all CC BY-SA 4.0). "
  + "Transcriptions: English Wiktionary, via kaikki.org (CC BY-SA 4.0). Example words, stress and meanings: the TORFL A1 deck on this shelf (English "
  + "Wiktionary via kaikki.org, CC BY-SA 4.0).";
const deck = { folioDeck: 1, exportedAt: STAMP_ISO, meta: { author: "", language: "en", glossMode: "site", version: 1, createdAt: STAMP, updatedAt: STAMP,
  forkedFrom: null, id: ID, title: "Russian — Sounds and spelling", color: "#2E5C9A",
  subtitle: n + " cards on how the letters are read: unstressed vowels, hard and soft, ь and ъ, final consonants — after the alphabet, beside TORFL A1", desc,
  tags: ["russian", "pronunciation", "spelling", "cyrillic"], types: { rusound: type } }, cards, gloss: {} };

if (REPORT) {
  console.log(ABC_FILE + "  (33 notes): " + abcCards.map((c) => c.key[0] + " " + c.fields.Word).join(", "));
  console.log(FILE + "  (" + n + " notes)\n  " + deck.meta.subtitle);
  for (const c of cards) console.log("  " + c.key + ": " + [...(c.fields.Rows + c.fields.Examples).matchAll(/data-say="([^"]+)"/g)].map((m) => m[1]).join(", "));
  process.exit(0);
}
let stale = 0;
for (const [file, d] of [[ABC_FILE, abcDeck], [FILE, deck]]) {
  const p = path.join(DIR, file), text = JSON.stringify(d), cur = fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
  if (cur === text) { console.log("  unchanged " + file + "  (" + d.cards.length + " notes)"); continue; }
  stale++;
  if (CHECK) { console.log("  STALE     " + file); continue; }
  fs.writeFileSync(p, text); console.log("  wrote     " + file + "  (" + d.cards.length + " notes)");
}
if (CHECK) { if (stale || pinChanged) { console.log("\n  FAIL  the decks are not what russian-sounds.json and TORFL A1 give — run without --check"); process.exit(1); } console.log("  ok    the Russian alphabet and sounds decks are current"); process.exit(0); }
if (pinChanged) { fs.writeFileSync(IDS, "{\n" + Object.keys(pin).map((k) => JSON.stringify(k) + ":" + JSON.stringify(pin[k])).join(",\n") + "\n}\n"); console.log("  russian-ids.json: new rows written"); }
