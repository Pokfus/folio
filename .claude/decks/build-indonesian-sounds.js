#!/usr/bin/env node
"use strict";
/*
  build-indonesian-sounds.js — writes decks/Indonesian-Sounds-and-Spelling.folio-deck.json (Nov 2026, the
  Indonesian beginner pass — docs/lang-decks.md). Standalone Node helper, zero deps. Not part of the site.

    node .claude/decks/build-indonesian-sounds.js [--check] [--report]

  WHY. Indonesian spelling is close to its sound, and an English reader still misreads it: c is the ch of
  itchy, a final k is a glottal stop, ng and ngg differ, ny is one sound, the letter e is three vowels with
  nothing to say which, every vowel has one value, the stress moves off a syllable with /ə/, and the prefix
  meng- changes with the first sound of its root. Of UKBI 1's 506 headwords 258 contain c, ng, ny, kh, e or a
  final k, and no deck or description said how any of them is read.

  IT READS NO LIVE SOURCE: the table indonesian-sounds.json (its `_` says where every cell came from, at
  which Wikipedia revision) and the shipped UKBI 1 deck, found by its deck id and CARD TYPE (`ukbi`), not by
  its file name. Every example word is a UKBI 1 headword, shown with that card's speaker and first meaning;
  a word the deck does not card fails the run, so the deck cannot drift from UKBI 1. The meng- card's pairs
  are read off the Forms rows of the cards its row names.

  A card is ONE NOTE with one template (card type `idsound`). Its id is pinned by the row's `key` in
  indonesian-ids.json (deck `idsounds`), which this script extends and indonesian-fix.js checks. The deck's
  title contains "Sounds and spelling", which is what `.claude/build-lang-decks.js` ranks before level 1.

  ROWS OF SPANS, NOT A TABLE: the deck sanitizer (`uDeckNormalize` in app.js) drops <table>, <tr> and <td>.
  The CSS is the German sounds deck's (build-german-sounds.js), copied: a change there does not reach here.
*/
const fs = require("fs"), path = require("path");
const HERE = __dirname, DIR = path.join(HERE, "..", "..", "decks");
const TABLE = path.join(HERE, "indonesian-sounds.json"), IDS = path.join(HERE, "indonesian-ids.json");
const FILE = "Indonesian-Sounds-and-Spelling.folio-deck.json", ID = "idsounds";
const argv = process.argv.slice(2), CHECK = argv.includes("--check"), REPORT = argv.includes("--report");
const STAMP = Date.UTC(2026, 10, 19), STAMP_ISO = "2026-11-19T00:00:00.000Z";
const fail = (m) => { console.error("FAIL  " + m); process.exit(1); };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const strip = (s) => String(s || "").replace(/<[^>]+>/g, "").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

const T = JSON.parse(fs.readFileSync(TABLE, "utf8"));
/* UKBI 1, found by its deck id and card type rather than by its file name */
const l1 = fs.readdirSync(DIR).filter((f) => /UKBI|Indonesian/.test(f) && f.endsWith(".folio-deck.json"))
  .map((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"))).find((d) => d.meta && d.meta.id === "ukbi1" && d.meta.types && d.meta.types.ukbi);
if (!l1) fail("no UKBI 1 deck (id ukbi1, card type ukbi) in decks/");
const glossOf = (c) => { const m = /<(?:div class="uc-gl"|li)>([\s\S]*?)<\/(?:div|li)>/.exec(c.fields.English); return m ? strip(m[1]) : ""; };
const byHead = new Map(l1.cards.map((c) => [c.fields.Word, c]));
/* where a row's letters stand in a headword: [first, last] character */
function hits(c, rx) {
  const t = c.fields.Word.toLowerCase(), out = [];
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

/* one word a UKBI 1 card already carries: its speaker, itself with the letters picked out, then the
   transcription the table gives for it and the card's first meaning */
function wordRow(c, rx, ipa) {
  const w = c.fields.Word;
  let shown = w;
  if (rx) {
    const chars = [...w], open = new Set(), close = new Set();
    for (const [a, b] of hits(c, rx)) { open.add(a); close.add(b); }
    shown = chars.map((ch, i) => (open.has(i) ? "\u0001" : "") + ch + (close.has(i) ? "\u0002" : "")).join("");
  }
  return '<div class="uc-row"><span class="uc-rz"><span class="uc-tts uc-exsay" data-say="' + esc(w) + '"></span>'
    + esc(shown).replace(/\u0001/g, "<b>").replace(/\u0002/g, "</b>") + '</span><span class="uc-rg">'
    + (ipa ? '<span class="uc-ri">' + esc(ipa) + "</span>" : "") + esc(glossOf(c)) + "</span></div>";
}
const named = (key, w) => byHead.get(w) || fail(key + " names " + w + ", which UKBI 1 does not card");
const lab = (t) => '<span class="uc-lab">' + t + "</span>";

const cards = [];
const add = (key, f) => cards.push({ id: idFor(key), num: String(cards.length + 1), key, type: "idsound",
  fields: Object.assign({ Letters: "", Kind: "", Name: "", Rows: "", Says: "", Pairs: "", Examples: "" }, f) });

for (const [group, kind] of [["vowels", "vowel"], ["consonants", "consonant"]]) for (const r of T[group]) {
  const rows = [];
  for (const row of r.rows) {
    const body = row.words.map(([w, ipa]) => { const c = named(r.key, w); if (row.mark && !hits(c, row.mark).length) fail(r.key + ": " + w + " does not show " + row.mark); return wordRow(c, row.mark, ipa); });
    rows.push('<div class="uc-sr">' + (row.when ? '<div class="uc-when">' + esc(row.when) + "</div>" : "")
      + '<div class="uc-ipa">' + esc(row.ipa) + "</div>" + (row.like ? '<div class="uc-like">' + row.like + "</div>" : "")
      + '<div class="uc-rows">' + lab("as in") + body.join("") + "</div></div>");
  }
  add(r.key, { Letters: r.show, Kind: [...r.show].length > 1 ? "Indonesian letters" : "Indonesian " + kind, Name: r.name || "", Rows: rows.join(""), Says: esc(r.says || "") });
}
/* the root of a card, off its Forms row */
const rootOf = (key, c) => { const m = /<span class="uc-fl">root<\/span><b>([^<]*)<\/b>/.exec(c.fields.Forms); return m ? strip(m[1]) : fail(key + ": the card " + c.fields.Word + " shows no root"); };
for (const r of T.rules) {
  const ex = lab("as in") + r.words.map(([w, ipa]) => wordRow(named(r.key, w), null, ipa)).join("");
  const list = r.pairsFrom ? r.pairsFrom.map((w) => [rootOf(r.key, named(r.key, w)), w]) : r.pairs;
  const pairs = !list ? "" : '<div class="uc-pairs">' + (r.heads ? '<div class="uc-pair uc-pairh">' + r.heads.map((h) => "<span>" + esc(h) + "</span>").join("") + "</div>" : "")
    + list.map((p) => '<div class="uc-pair">' + p.map((x) => "<span>" + esc(x) + "</span>").join("") + "</div>").join("") + "</div>";
  add(r.key, { Letters: r.show, Kind: r.kind, Name: r.name, Says: esc(r.says), Pairs: pairs, Examples: ex });
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
`;

const type = { id: "idsound", name: "Indonesian sounds and spelling", speechLang: "id-ID",
  fields: ["Letters", "Kind", "Name", "Rows", "Says", "Pairs", "Examples"],
  cards: [{ name: "Spelling → sound",
    front: '<div class="uc-ask">{{Kind}}</div><div class="uc-snd">{{Letters}}</div>',
    back: '{{FrontSide}}{{#Name}}<div class="uc-name">{{Name}}</div>{{/Name}}<hr>{{#Rows}}{{Rows}}{{/Rows}}'
      + '{{#Says}}<div class="uc-field">{{Says}}</div>{{/Says}}{{#Pairs}}{{Pairs}}{{/Pairs}}'
      + '{{#Examples}}<div class="uc-rows uc-alone">{{Examples}}</div>{{/Examples}}' }],
  css: CSS };

const n = cards.length, nV = cards.filter((c) => c.key.startsWith("vowel:")).length, nC = cards.filter((c) => c.key.startsWith("letter:")).length, nR = n - nV - nC;
const heads = l1.cards.map((c) => c.fields.Word.toLowerCase());
const cnt = (re) => heads.filter((w) => re.test(w)).length;
const odd = cnt(/c|ng|ny|kh|e|k$/);
const cite = (s) => "Wikipedia, “" + s.title + "”, revision " + s.revid + " of " + s.timestamp.slice(0, 10);
const desc = "How Indonesian is read and spelled, before or beside the first word: " + n + " notes, one card each — " + nV + " vowel spellings (a, e, i, o, u, and ai and au at the end of a word), "
  + nC + " consonant letters and pairs of letters whose sound is not the one an English reader gives them (c, g, h, k, kh, ng, ny, r, v), and "
  + nR + " rules: where the stress falls, di and ke written apart or joined, the word written twice, how the prefix meng- changes with its root, and -ku, -mu and -nya written onto the word. "
  + "Indonesian is spelled close to its sound, so the deck is short; what it holds is what the spelling does not tell an English reader. The letter e is three vowels and nothing on the page says which ("
  + cnt(/e/) + " of UKBI 1's " + heads.length + " headwords contain it, and the e of besar is not the e of enak), c is never k or s (" + cnt(/c/) + " headwords), a final k is a glottal stop (" + cnt(/k$/)
  + "), ng is one sound and ngg is that sound and a g (" + cnt(/ng(?!g)/) + " and " + cnt(/ngg/) + "), ny is one sound (" + cnt(/ny/) + "); " + odd + " of the " + heads.length + " contain at least one of these. "
  + "The front shows the letters. The back gives the sound in the International Phonetic Alphabet and the English sound it resembles, then words of the UKBI 1 deck with a speaker beside each, the letters picked out, "
  + "and the word's own transcription from the dictionary (ˈ stands before the stressed syllable). Say the word, then press the speaker and compare. "
  + "THE ORDER is the vowels, the consonants, then the rules. At the default of ten new cards a day the deck takes " + Math.ceil(n / 10) + " days; it is meant to be studied beside UKBI 1, not finished first. — WHAT IS NOT HERE: "
  + "nothing is written for this deck. Each English comparison is a cell of the first page named below, and each sentence under a letter a sentence of its notes or of the fourth page; the rules are sentences of the second, "
  + "third and fourth pages, with a cut marked […], and the meanings of -ku, -mu and -nya are the English Wiktionary's. The second row of ng puts that page's cells for ŋ and ɡ side by side, which is what the words' transcriptions show. "
  + "The letters that sound as an English reader expects (b, d, f, j, l, m, n, p, s, t, w, y) have no card, and neither have sy (the sh of shoe) and z, which no UKBI 1 headword contains. The meng- card shows the changes "
  + "UKBI 1's own cards show, so it has no example of a root in s. The speaker is your device's Indonesian voice reading the example word, so a device without one is silent. — English comparisons and notes: "
  + cite(T.sources.ipa) + ". Rules: " + cite(T.sources.orthography) + "; " + cite(T.sources.phonology) + "; " + cite(T.sources.language)
  + " (all CC BY-SA 4.0). Transcriptions and the meanings of -ku, -mu and -nya: English Wiktionary, via kaikki.org (CC BY-SA 4.0). "
  + "Example words and meanings: the UKBI 1 deck on this shelf (English Wiktionary via kaikki.org, CC BY-SA 4.0).";
const deck = { folioDeck: 1, exportedAt: STAMP_ISO, meta: { author: "", language: "en", glossMode: "site", version: 1, createdAt: STAMP, updatedAt: STAMP,
  forkedFrom: null, id: ID, title: "Indonesian — Sounds and spelling", color: l1.meta.color,
  subtitle: n + " letters, vowels and spelling rules — start here, beside UKBI 1", desc,
  tags: ["indonesian", "bahasa indonesia", "pronunciation", "spelling"], types: { idsound: type } }, cards, gloss: {} };

if (REPORT) {
  console.log(FILE + "  (" + n + " notes)\n  " + deck.meta.subtitle + "\n  " + cards.map((c) => c.key).join(" "));
  for (const c of cards) console.log("  " + c.key + ": " + [...c.fields.Rows.matchAll(/data-say="([^"]+)"/g)].map((m) => m[1]).join(", ") + [...c.fields.Examples.matchAll(/data-say="([^"]+)"/g)].map((m) => m[1]).join(", "));
  console.log("  " + desc);
  process.exit(0);
}
const p = path.join(DIR, FILE), text = JSON.stringify(deck), cur = fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
if (cur === text && !pinChanged) { console.log("  unchanged " + FILE + "  (" + n + " notes)"); if (CHECK) console.log("  ok    the Indonesian sounds deck is current"); process.exit(0); }
if (CHECK) { console.log("  STALE     " + FILE + "\n\n  FAIL  the deck is not what indonesian-sounds.json and UKBI 1 give — run without --check"); process.exit(1); }
fs.writeFileSync(p, text); console.log("  wrote     " + FILE + "  (" + n + " notes)");
if (pinChanged) { fs.writeFileSync(IDS, "{\n" + Object.keys(pin).map((k) => JSON.stringify(k) + ":" + JSON.stringify(pin[k])).join(",\n") + "\n}\n"); console.log("  indonesian-ids.json: new rows written"); }
