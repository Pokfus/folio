#!/usr/bin/env node
"use strict";
/*
  build-latin-sounds.js — writes decks/Latin-Sounds-and-Spelling.folio-deck.json (Nov 2026, the Latin
  beginner pass — docs/lang-decks.md). Standalone Node helper, zero deps. Not part of the site.

    node .claude/decks/build-latin-sounds.js [--check] [--report]

  WHY. The level decks print every headword with its macrons and no deck said what a macron is, where the
  stress falls, or that c and g are always hard. And the speaker beside every word is an ITALIAN voice
  (`speechLang: it-IT`, the plan's §3: almost no device has a Latin one), which reads the Church
  pronunciation — soft c and g, v as in vest, ae as e, no long vowels — while the macrons describe the
  classical one: of Latin A1's 500 headwords as first shipped, 241 carry a macron and 138 contain a letter
  the two pronunciations read differently, and a learner was told neither. So this deck gives BOTH values
  on every card, the classical first and the Church one beside it, and its description says plainly which
  of the two the speaker gives. It also holds what every sentence uses and no card taught as a pattern:
  the cases, the five declensions and the conjugations, each with the table of a Latin A1 card.

  IT READS NO LIVE SOURCE: the table latin-sounds.json (its `_` says where every cell came from, at which
  Wikipedia revision; `.claude/latin/sounds.py --verify` checks it) and the shipped Latin A1 deck, found by
  its deck id and CARD TYPE (`latin`), not by its file name. Every example word is a Latin A1 headword,
  shown with that card's speaker and first meaning; a word the deck does not card fails the run, so the
  deck cannot drift from A1. An ending card's table is COPIED from the All forms table of the A1 card its
  row names (`tableFrom`, `blocks`), and its dictionary entry from that card's entry line (`partsFrom`): a
  form no card shows cannot be on a pattern's card.

  A card is ONE NOTE with one template (card type `lasound`). Its id is pinned by the row's `key` in
  latin-ids.json (deck `lasounds`), which this script extends and latin-fix.js checks. The deck's title
  contains "Sounds and spelling", which is what `.claude/build-lang-decks.js` ranks before level A1.

  ROWS OF SPANS, NOT A TABLE: the deck sanitizer (`uDeckNormalize` in app.js) drops <table>, <tr> and <td>.
  The CSS is the Turkish sounds deck's (build-turkish-sounds.js), copied, with the Latin level type's table
  rules (`.claude/latin/card.css`, .uc-cj…) for the ending cards: a change there does not reach here.
*/
const fs = require("fs"), path = require("path");
const HERE = __dirname, DIR = path.join(HERE, "..", "..", "decks");
const TABLE = path.join(HERE, "latin-sounds.json"), IDS = path.join(HERE, "latin-ids.json");
const FILE = "Latin-Sounds-and-Spelling.folio-deck.json", ID = "lasounds";
const argv = process.argv.slice(2), CHECK = argv.includes("--check"), REPORT = argv.includes("--report");
const STAMP = Date.UTC(2026, 10, 27), STAMP_ISO = "2026-11-27T00:00:00.000Z";
const fail = (m) => { console.error("FAIL  " + m); process.exit(1); };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const strip = (s) => String(s || "").replace(/<[^>]+>/g, "").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

const T = JSON.parse(fs.readFileSync(TABLE, "utf8"));
/* Latin A1, found by its deck id and card type rather than by its file name */
const a1 = fs.readdirSync(DIR).filter((f) => /Latin/.test(f) && f.endsWith(".folio-deck.json"))
  .map((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"))).find((d) => d.meta && d.meta.id === "latina1" && d.meta.types && d.meta.types.latin);
if (!a1) fail("no Latin A1 deck (id latina1, card type latin) in decks/");
const glossOf = (c) => { const m = /<(?:div class="uc-gl"|li)>([\s\S]*?)<\/(?:div|li)>/.exec(c.fields.English); return m ? strip(m[1]) : ""; };
const byHead = new Map(a1.cards.map((c) => [c.fields.Latin, c]));
/* where a row's letters stand in a headword: [first, last] character */
function hits(c, rx) {
  const t = c.fields.Latin.toLowerCase(), out = [];
  for (const m of t.matchAll(new RegExp(rx, "g"))) { const n = [...m[0]].length; if (n) out.push([m.index, m.index + n - 1]); }
  return out;
}

const pin = JSON.parse(fs.readFileSync(IDS, "utf8"));
let pinChanged = false;
function idFor(key) {
  if (!pin[ID]) { pin[ID] = {}; pinChanged = true; }
  if (!(key in pin[ID])) {
    if (CHECK) fail(ID + "/" + key + " has no pinned id — run without --check");
    pin[ID][key] = Math.max(0, ...Object.values(pin[ID])) + 1; pinChanged = true;
  }
  return "u_" + ID + "_" + pin[ID][key];
}

const say = (c) => '<span class="uc-tts uc-exsay" data-say="' + esc(c.fields.Word) + '"></span>';
/* one word a Latin A1 card already carries: its speaker (the Italian voice, reading the word without its
   macrons), itself with the letters picked out, the card's first meaning, and under them the two
   transcriptions the table gives for it: the classical one, then the Church one */
function wordRow(c, rx, cl, ec) {
  const w = c.fields.Latin;
  let shown = w;
  if (rx) {
    const chars = [...w], open = new Set(), close = new Set();
    for (const [a, b] of hits(c, rx)) { open.add(a); close.add(b); }
    shown = chars.map((ch, i) => (open.has(i) ? "\u0001" : "") + ch + (close.has(i) ? "\u0002" : "")).join("");
  }
  return '<div class="uc-row"><span class="uc-rz">' + say(c)
    + esc(shown).replace(/\u0001/g, "<b>").replace(/\u0002/g, "</b>") + '</span><span class="uc-rg">' + esc(glossOf(c)) + "</span>"
    + (cl || ec ? '<span class="uc-rp"><span class="uc-ri">' + esc(cl) + '</span><span class="uc-ri uc-ri2">' + esc(ec) + "</span></span>" : "") + "</div>";
}
const named = (key, w) => byHead.get(w) || fail(key + " names " + w + ", which Latin A1 does not card");
const lab = (t) => '<span class="uc-lab">' + t + "</span>";
const AS_IN = lab("as in · classical, then Church");
/* a `says` is a list of quotations: one paragraph each */
const saysHTML = (q) => (q || []).map((x) => '<span class="uc-q">' + esc(x) + "</span>").join("");
const rowsHTML = (r) => (r.rows || []).map((row) => '<div class="uc-sr">' + (row.when ? '<div class="uc-when">' + esc(row.when) + "</div>" : "")
  + '<div class="uc-ipa">' + esc(row.ipa) + "</div>" + (row.like ? '<div class="uc-like">' + row.like + "</div>" : "") + "</div>").join("");
const wordsHTML = (r) => !(r.words || []).length ? "" : AS_IN + r.words.map(([w, cl, ec]) => {
  const c = named(r.key, w);
  if (r.mark && !hits(c, r.mark).length) fail(r.key + ": " + w + " does not show " + r.mark);
  return wordRow(c, r.mark, cl, ec);
}).join("");
/* the dictionary entry of an A1 card, as its own card prints it */
const entryOf = (c) => strip(c.fields.Parts.replace(/<span class="uc-cls">/, " · "));
/* the All forms table of an A1 card, or the blocks of it a row names */
function tableOf(key, w, blocks) {
  const c = named(key, w);
  const all = [...c.fields.Table.matchAll(/<div class="uc-cj"><div class="uc-cjh">(.*?)<\/div>((?:<div class="uc-cjr">.*?<\/div>)*)<\/div>/g)];
  if (!all.length) fail(key + ": the card " + w + " has no table");
  const keep = blocks ? blocks.map((b) => all.find((m) => m[1] === b) || fail(key + ": the card " + w + " has no block " + b)) : all;
  return '<div class="uc-tb"><div class="uc-tbh">' + say(c) + esc(entryOf(c)) + '<span class="uc-tbg">' + esc(glossOf(c)) + '</span></div><div class="uc-cjg">' + keep.map((m) => m[0]).join("") + "</div></div>";
}

const cards = [];
const add = (key, f) => cards.push({ id: idFor(key), num: String(cards.length + 1), key, type: "lasound",
  fields: Object.assign({ Letters: "", Kind: "", Name: "", Rows: "", Says: "", Tables: "", Examples: "" }, f) });

for (const g of ["rules", "sounds", "endings"]) for (const r of T[g]) {
  const tables = (r.tableFrom || []).map((w) => tableOf(r.key, w, r.blocks)).join("")
    + (r.partsFrom ? '<div class="uc-rows uc-alone">' + r.partsFrom.map((w) => { const c = named(r.key, w); return '<div class="uc-row"><span class="uc-rz uc-rzl">' + say(c) + esc(entryOf(c)) + '</span><span class="uc-rg">' + esc(glossOf(c)) + "</span></div>"; }).join("") + "</div>" : "");
  add(r.key, { Letters: r.show, Kind: r.kind, Name: r.name || "", Rows: rowsHTML(r), Says: saysHTML(r.says), Tables: tables, Examples: wordsHTML(r) });
}

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
.uc-snd {
  font-size: 54px;
  line-height: 1.15;
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
  font-size: 16px;
  background: var(--paper-2, rgba(0,0,0,0.05));
  background: color-mix(in srgb, var(--paper-2, #EFEDE6) 58%, var(--card, #FFFFFF));
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
  font-size: 17px;
  line-height: 1.3;
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
  font-size: 13.5px;
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
.uc-q {
  display: block;
}
.uc-q + .uc-q {
  margin-top: 8px;
}
.uc-row {
  flex-wrap: wrap;
}
.uc-rzl {
  min-width: 0;
  font-size: 15px;
}
.uc-rp {
  flex: 0 0 100%;
  font-size: 13px;
  line-height: 1.35;
}
.uc-ri2 {
  opacity: 0.6;
}
.uc-sr + .uc-sr {
  margin-top: 8px;
}
.uc-tb {
  display: block;
  max-width: 100%;
  margin: 14px auto 0;
  padding: 11px 15px;
  border: 1px solid var(--rule, rgba(0,0,0,0.12));
  border-radius: 11px;
  text-align: left;
}
.uc-tbh {
  margin-bottom: 8px;
  font-size: 15px;
}
.uc-tbg {
  margin-left: 8px;
  font-size: 13px;
  opacity: 0.7;
}
.uc-cjg {
  display: grid;
  gap: 12px 18px;
  grid-template-columns: repeat(auto-fit, minmax(min(210px, 100%), 1fr));
}
.uc-cj {
  min-width: 0;
}
.uc-cjh {
  padding-bottom: 3px;
  border-bottom: 1px solid var(--rule, rgba(0,0,0,0.10));
  font-size: 9.5px;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  opacity: 0.5;
}
.uc-cjr {
  display: flex;
  gap: 10px;
  align-items: baseline;
  padding: 1.5px 0;
  font-size: 14px;
}
.uc-cj-p {
  flex: 0 0 auto;
  opacity: 0.55;
}
.uc-cj-f {
  flex: 1 1 auto;
  text-align: right;
  font-weight: 500;
}
`;

const type = { id: "lasound", name: "Latin sounds, spelling and endings", speechLang: "it-IT",
  fields: ["Letters", "Kind", "Name", "Rows", "Says", "Tables", "Examples"],
  cards: [{ name: "Spelling → sound",
    front: '<div class="uc-ask">{{Kind}}</div><div class="uc-snd">{{Letters}}</div>',
    back: '{{FrontSide}}{{#Name}}<div class="uc-name">{{Name}}</div>{{/Name}}<hr>{{#Rows}}{{Rows}}{{/Rows}}'
      + '{{#Says}}<div class="uc-field">{{Says}}</div>{{/Says}}{{#Tables}}{{Tables}}{{/Tables}}'
      + '{{#Examples}}<div class="uc-rows uc-alone">{{Examples}}</div>{{/Examples}}' }],
  css: CSS };

const n = cards.length, nR = T.rules.length, nS = T.sounds.length, nE = T.endings.length;
const nV = T.sounds.filter((r) => r.key.startsWith("vowel:")).length, nC = nS - nV;
const heads = a1.cards.map((c) => c.fields.Latin.toLowerCase()).filter((w) => !/[ -]/.test(w));
const cnt = (re) => heads.filter((w) => re.test(w)).length;
const FRONT = "(?=[eēiīyȳ]|ae|oe)";
const DIFF = new RegExp("v|c" + FRONT + "|g" + FRONT + "|gn|sc" + FRONT + "|t[iī][aāeēoōuū]|ae|oe|h");
const cite = (s) => "Wikipedia, “" + s.title + "”, revision " + s.revid + " of " + s.date;
const desc = "How Latin is read and spelled, and how its words change their endings, before or beside the first word: " + n + " notes, one card each — "
  + nR + " rules (the two pronunciations, the macron, where the stress falls, a doubled consonant, a vowel and m at the end of a word), the " + nV + " vowels and diphthongs (a, e, i, o, u, ae, oe, au), "
  + nC + " consonants that an English reader, or one of the two pronunciations, reads otherwise (c, g, gn, sc, ti, v, the consonant i, h, qu, r, s, ch), and "
  + nE + " patterns of endings: the cases, the five declensions, a verb's four principal parts, the conjugations and a deponent verb. "
  + "THERE ARE TWO PRONUNCIATIONS OF LATIN, and every card here gives both, the classical one first. The classical pronunciation is the one the macrons describe: the level decks print a macron over every long vowel ("
  + cnt(/[āēīōūȳ]/) + " of Latin A1's " + heads.length + " one-word headwords carry one), and in it c and g are always hard and v is a w. The Church pronunciation is the Italianate one: no long vowels, c and g soft before e and i, v as in English. "
  + "They read " + cnt(DIFF) + " of those " + heads.length + " headwords differently in at least one letter: v (" + cnt(/v/) + " headwords), c before e, i, ae or oe (" + cnt(new RegExp("c" + FRONT)) + "), g before the same (" + cnt(new RegExp("g" + FRONT))
  + "), gn (" + cnt(/gn/) + "), sc before the same (" + cnt(new RegExp("sc" + FRONT)) + "), ti before a vowel (" + cnt(/t[iī][aāeēoōuū]/) + "), ae and oe (" + cnt(/ae|oe/) + "), h (" + cnt(/h/) + "). "
  + "WHAT THE SPEAKER READS, here and beside every word of the Latin decks: your device's ITALIAN voice, because almost no device has a Latin one, given the word without its macrons. So it gives the CHURCH value of every card of this deck — the second line — and never the classical one: it does not hold a long vowel, it softens c and g, and it says v. "
  + "How it stresses a word is the voice's own doing and was not checked against the rule on the stress card. To learn the classical pronunciation, read the first line of the card and the first transcription beside each word, and say the word yourself; the speaker is the second. A device without an Italian voice is silent. "
  + "THE CARDS: the front shows the letters, the rule or the ending. The back gives the classical sound in the International Phonetic Alphabet with the English sound it resembles, then the Church one, then the notes of the source, then words of the Latin A1 deck with a speaker beside each, the letters picked out, and each word's two transcriptions from the dictionary, classical then Church "
  + "(ˈ stands before the stressed syllable, ː after a long vowel, a dot between syllables). "
  + "AND THE ENDINGS, which every sentence uses: a Latin noun changes its ending for its case and a verb for its person, and the level decks show the forms word by word, behind each card's All forms fold. The " + nE + " cards here say what the patterns are — which declension ends how, what the four principal parts under a verb are for, how the conjugations differ — each beside the table of a Latin A1 card, copied from that card, so that the same table is met again on the word. "
  + "THE ORDER is the rules, the vowels, the consonants, then the endings. At the default of ten new cards a day the deck takes " + Math.ceil(n / 10) + " days; it is meant to be studied beside Latin A1, not finished first. — WHAT IS NOT HERE: "
  + "nothing is written for this deck but its labels. Each sound and each English comparison is a cell of one row of the key named first below, placed as Classical or Church by the column its letter stands in there (h and ch, for which the key has no Church row, take theirs from the second page's table of the Church pronunciation); each note and each rule is a quoted run of one of the four pages. "
  + "The letters both pronunciations read as an English reader expects (b, d, f, l, m, n, p, t, x) have no card, nor has y, which no A1 headword contains. The patterns show only forms an A1 card shows: there is no card for the adjectives' or the pronouns' declensions, whose tables are on their own cards (bonus, fortis, hic, ille, quī). — Sounds, English comparisons and notes: "
  + cite(T.sources.key) + "; " + cite(T.sources.phonology) + ". Endings: " + cite(T.sources.declension) + "; " + cite(T.sources.conjugation)
  + " (all CC BY-SA 4.0). Transcriptions: English Wiktionary, via kaikki.org (CC BY-SA 4.0). "
  + "Example words, tables and meanings: the Latin A1 deck on this shelf (English Wiktionary via kaikki.org, CC BY-SA 4.0).";
const deck = { folioDeck: 1, exportedAt: STAMP_ISO, meta: { author: "", language: "en", glossMode: "site", version: 1, createdAt: STAMP, updatedAt: STAMP,
  forkedFrom: null, id: ID, title: "Latin — Sounds and spelling", color: a1.meta.color,
  subtitle: n + " sounds, spelling rules and patterns of endings — start here, beside Latin A1", desc,
  tags: ["latin", "pronunciation", "spelling", "macrons", "declensions"], types: { lasound: type } }, cards, gloss: {} };

if (REPORT) {
  console.log(FILE + "  (" + n + " notes)\n  " + deck.meta.subtitle + "\n  " + cards.map((c) => c.key).join(" "));
  for (const c of cards) console.log("  " + c.key + ": " + [...(c.fields.Examples + c.fields.Tables).matchAll(/data-say="([^"]+)"/g)].map((m) => m[1]).join(", "));
  console.log("  " + desc);
  process.exit(0);
}
const p = path.join(DIR, FILE), text = JSON.stringify(deck), cur = fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
if (cur === text && !pinChanged) { console.log("  unchanged " + FILE + "  (" + n + " notes)"); if (CHECK) console.log("  ok    the Latin sounds deck is current"); process.exit(0); }
if (CHECK) { console.log("  STALE     " + FILE + "\n\n  FAIL  the deck is not what latin-sounds.json and Latin A1 give — run without --check"); process.exit(1); }
fs.writeFileSync(p, text); console.log("  wrote     " + FILE + "  (" + n + " notes)");
if (pinChanged) { fs.writeFileSync(IDS, "{\n" + Object.keys(pin).map((k) => JSON.stringify(k) + ": " + JSON.stringify(pin[k])).join(",\n") + "\n}\n"); console.log("  latin-ids.json: new rows written"); }
