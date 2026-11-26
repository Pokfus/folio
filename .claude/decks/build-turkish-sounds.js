#!/usr/bin/env node
"use strict";
/*
  build-turkish-sounds.js — writes decks/Turkish-Sounds-and-Spelling.folio-deck.json (Nov 2026, the Turkish
  beginner pass — docs/lang-decks.md). Standalone Node helper, zero deps. Not part of the site.

    node .claude/decks/build-turkish-sounds.js [--check] [--report]

  WHY. Turkish is spelled as it sounds, and an English reader still misreads it: c is the j of joy, ç and ş
  are ch and sh, ı is not i, ö and ü are vowels English has not got, ğ is silent or lengthens a vowel, j is
  the s of measure. Of Turkish A1's 500 headwords as first shipped, 219 contain one of those letters, and no
  deck or description said how any is read, or where the stress falls. And every sentence of every card is
  built with suffixes whose vowel follows the word (-ler / -lar; -i / -ı / -ü / -u) and whose consonant
  follows it too (-de / -te; kitap, kitabı): the cards show those forms and nothing said what the pattern is.

  IT READS NO LIVE SOURCE: the table turkish-sounds.json (its `_` says where every cell came from, at which
  Wikipedia revision; `.claude/turkish/sounds.py --verify` checks it) and the shipped Turkish A1 deck, found
  by its deck id and CARD TYPE (`turkish`), not by its file name. Every example word is a Turkish A1
  headword, shown with that card's speaker and first meaning; a word the deck does not card fails the run,
  so the deck cannot drift from A1. A rule's table of forms is READ OFF THE FORMS ROWS of the A1 cards its
  row names (`pairsFrom`, `cells`): a form no card shows cannot be on a rule's card.

  A card is ONE NOTE with one template (card type `trsound`). Its id is pinned by the row's `key` in
  turkish-ids.json (deck `trsounds`), which this script extends and turkish-fix.js checks. The deck's title
  contains "Sounds and spelling", which is what `.claude/build-lang-decks.js` ranks before level A1.

  ROWS OF SPANS, NOT A TABLE: the deck sanitizer (`uDeckNormalize` in app.js) drops <table>, <tr> and <td>.
  The CSS is the German sounds deck's (build-german-sounds.js) by way of the Indonesian one, copied: a
  change there does not reach here.
*/
const fs = require("fs"), path = require("path");
const HERE = __dirname, DIR = path.join(HERE, "..", "..", "decks");
const TABLE = path.join(HERE, "turkish-sounds.json"), IDS = path.join(HERE, "turkish-ids.json");
const FILE = "Turkish-Sounds-and-Spelling.folio-deck.json", ID = "trsounds";
const argv = process.argv.slice(2), CHECK = argv.includes("--check"), REPORT = argv.includes("--report");
const STAMP = Date.UTC(2026, 10, 26), STAMP_ISO = "2026-11-26T00:00:00.000Z";
const fail = (m) => { console.error("FAIL  " + m); process.exit(1); };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const strip = (s) => String(s || "").replace(/<[^>]+>/g, "").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const fold = (s) => s.replace(/İ/g, "i").replace(/I/g, "ı").toLowerCase(); // never toLowerCase alone: I is ı's capital

const T = JSON.parse(fs.readFileSync(TABLE, "utf8"));
/* Turkish A1, found by its deck id and card type rather than by its file name */
const a1 = fs.readdirSync(DIR).filter((f) => /Turkish/.test(f) && f.endsWith(".folio-deck.json"))
  .map((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"))).find((d) => d.meta && d.meta.id === "turkisha1" && d.meta.types && d.meta.types.turkish);
if (!a1) fail("no Turkish A1 deck (id turkisha1, card type turkish) in decks/");
const glossOf = (c) => { const m = /<(?:div class="uc-gl"|li)>([\s\S]*?)<\/(?:div|li)>/.exec(c.fields.English); return m ? strip(m[1]) : ""; };
const byHead = new Map(a1.cards.map((c) => [c.fields.Word, c]));
/* where a row's letters stand in a headword: [first, last] character */
function hits(c, rx) {
  const t = fold(c.fields.Word), out = [];
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

/* one word a Turkish A1 card already carries: its speaker, itself with the letters picked out, then the
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
const named = (key, w) => byHead.get(w) || fail(key + " names " + w + ", which Turkish A1 does not card");
const lab = (t) => '<span class="uc-lab">' + t + "</span>";
/* a `says` is a list of quotations: one paragraph each */
const saysHTML = (q) => (q || []).map((x) => '<span class="uc-q">' + esc(x) + "</span>").join("");

const cards = [];
const add = (key, f) => cards.push({ id: idFor(key), num: String(cards.length + 1), key, type: "trsound",
  fields: Object.assign({ Letters: "", Kind: "", Name: "", Rows: "", Says: "", Pairs: "", Examples: "" }, f) });

for (const [group, kind] of [["vowels", "vowel"], ["consonants", "consonant"]]) for (const r of T[group]) {
  const rows = [];
  for (const row of r.rows) {
    const body = row.words.map(([w, ipa]) => { const c = named(r.key, w); if (row.mark && !hits(c, row.mark).length) fail(r.key + ": " + w + " does not show " + row.mark); return wordRow(c, row.mark, ipa); });
    rows.push('<div class="uc-sr">' + (row.when ? '<div class="uc-when">' + esc(row.when) + "</div>" : "")
      + '<div class="uc-ipa">' + esc(row.ipa) + "</div>" + (row.like ? '<div class="uc-like">' + row.like + "</div>" : "")
      + '<div class="uc-rows">' + lab("as in") + body.join("") + "</div></div>");
  }
  add(r.key, { Letters: r.show, Kind: "Turkish " + kind, Name: r.name || "", Rows: rows.join(""), Says: saysHTML(r.says) });
}
/* one cell of a card's Forms row */
const cellOf = (key, c, label) => { const m = new RegExp('<span class="uc-fl">' + label + "</span><b>([^<]*)</b>").exec(c.fields.Forms); return m ? strip(m[1]) : fail(key + ": the card " + c.fields.Word + " shows no " + label); };
for (const r of T.rules) {
  const ex = lab("as in") + r.words.map(([w, ipa]) => wordRow(named(r.key, w), null, ipa)).join("");
  const list = r.pairsFrom ? r.pairsFrom.map((w) => [w].concat(r.cells.map((l) => cellOf(r.key, named(r.key, w), l)))) : r.pairs;
  const pairs = !list ? "" : '<div class="uc-pairs">' + (r.heads ? '<div class="uc-pair uc-pairh">' + r.heads.map((h) => "<span>" + esc(h) + "</span>").join("") + "</div>" : "")
    + list.map((p) => '<div class="uc-pair">' + p.map((x) => "<span>" + esc(x) + "</span>").join("") + "</div>").join("") + "</div>";
  add(r.key, { Letters: r.show, Kind: r.kind, Name: r.name, Says: saysHTML(r.says), Pairs: pairs, Examples: ex });
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
`;

const type = { id: "trsound", name: "Turkish sounds and spelling", speechLang: "tr-TR",
  fields: ["Letters", "Kind", "Name", "Rows", "Says", "Pairs", "Examples"],
  cards: [{ name: "Spelling → sound",
    front: '<div class="uc-ask">{{Kind}}</div><div class="uc-snd">{{Letters}}</div>',
    back: '{{FrontSide}}{{#Name}}<div class="uc-name">{{Name}}</div>{{/Name}}<hr>{{#Rows}}{{Rows}}{{/Rows}}'
      + '{{#Says}}<div class="uc-field">{{Says}}</div>{{/Says}}{{#Pairs}}{{Pairs}}{{/Pairs}}'
      + '{{#Examples}}<div class="uc-rows uc-alone">{{Examples}}</div>{{/Examples}}' }],
  css: CSS };

const n = cards.length, nV = cards.filter((c) => c.key.startsWith("vowel:")).length, nC = cards.filter((c) => c.key.startsWith("letter:")).length, nR = n - nV - nC;
const heads = a1.cards.map((c) => fold(c.fields.Word));
const cnt = (re) => heads.filter((w) => re.test(w)).length;
const odd = cnt(/[ığçşöücjâîû]/);
const forms = (label) => a1.cards.filter((c) => c.fields.Forms.includes('uc-fl">' + label + "<")).length;
const cite = (s) => "Wikipedia, “" + s.title + "”, revision " + s.revid + " of " + s.date;
const desc = "How Turkish is read and spelled, and how its suffixes change, before or beside the first word: " + n + " notes, one card each — the " + nV + " vowels (a, e, ı, i, o, ö, u, ü), "
  + nC + " consonant letters whose sound is not the one an English reader gives them (c, ç, g, ğ, j, r, ş, y), and "
  + nR + " rules: the circumflex, where the stress falls, the suffixes with e or a (-ler, -lar), the suffixes with i, ı, ü or u, the present in -iyor, the final consonant that softens before a vowel (kitap, kitabı), "
  + "the suffix whose d becomes t (evde, kitapta), and the question particle mi with de, both written apart. "
  + "Turkish is spelled as it sounds, so the deck is short; what it holds is what the spelling does not tell an English reader. c is the j of joy (" + cnt(/c/) + " of Turkish A1's " + heads.length
  + " headwords contain it), ç and ş are ch and sh (" + cnt(/ç/) + " and " + cnt(/ş/) + "), ı without a dot is another vowel than i (" + cnt(/ı/) + "), ö and ü are front rounded vowels (" + cnt(/ö/) + " and " + cnt(/ü/)
  + "), ğ is never a g (" + cnt(/ğ/) + "), j is the s of measure (" + cnt(/j/) + "); " + odd + " of the " + heads.length + " contain at least one of these or a circumflex. "
  + "AND THE SUFFIXES, which every sentence uses: a Turkish word takes its endings one after another, and each ending's vowel is chosen by the vowel before it. The level decks show the forms — "
  + forms("accusative") + " cards of Turkish A1 carry a row of cases, " + forms("my") + " a possessed form, " + forms("present") + " a verb's tenses — and the five rule cards here say what the pattern in those rows is, each with a table of forms read off A1's own cards. "
  + "The front shows the letter or the ending. The back gives the sound in the International Phonetic Alphabet and the English sound it resembles, then words of the Turkish A1 deck with a speaker beside each, the letter picked out, "
  + "and the word's own transcription from the dictionary (ˈ stands before the stressed syllable, ː after a long vowel). Say the word, then press the speaker and compare. "
  + "THE ORDER is the vowels, the consonants, then the rules. At the default of ten new cards a day the deck takes " + Math.ceil(n / 10) + " days; it is meant to be studied beside Turkish A1, not finished first. — WHAT IS NOT HERE: "
  + "nothing is written for this deck. Each sound and each English comparison is a cell of the letter's row in the table of the first page named below, and each sentence under a letter a sentence of that page's notes; the rules are sentences of the three pages, "
  + "each quotation a paragraph of its own, with a cut marked […]. The letters that sound as an English reader expects (b, d, f, h, k, l, m, n, p, s, t, v, z) have no card. "
  + "The rule cards show only forms an A1 card shows, so the buffer consonants (araba, arabayı; arabası) and the personal endings of the verb are on the cards and have no rule here: no sentence was found to quote for them. "
  + "The speaker is your device's Turkish voice reading the example word, so a device without one is silent. — Sounds, English comparisons and notes: "
  + cite(T.sources.alphabet) + ". Rules: " + cite(T.sources.phonology) + "; " + cite(T.sources.grammar)
  + " (all CC BY-SA 4.0). Transcriptions: English Wiktionary, via kaikki.org (CC BY-SA 4.0). "
  + "Example words, forms and meanings: the Turkish A1 deck on this shelf (English Wiktionary via kaikki.org, CC BY-SA 4.0).";
const deck = { folioDeck: 1, exportedAt: STAMP_ISO, meta: { author: "", language: "en", glossMode: "site", version: 1, createdAt: STAMP, updatedAt: STAMP,
  forkedFrom: null, id: ID, title: "Turkish — Sounds and spelling", color: a1.meta.color,
  subtitle: n + " letters, sounds and suffix rules — start here, beside Turkish A1", desc,
  tags: ["turkish", "türkçe", "pronunciation", "spelling", "vowel harmony"], types: { trsound: type } }, cards, gloss: {} };

if (REPORT) {
  console.log(FILE + "  (" + n + " notes)\n  " + deck.meta.subtitle + "\n  " + cards.map((c) => c.key).join(" "));
  for (const c of cards) console.log("  " + c.key + ": " + [...c.fields.Rows.matchAll(/data-say="([^"]+)"/g)].map((m) => m[1]).join(", ") + [...c.fields.Examples.matchAll(/data-say="([^"]+)"/g)].map((m) => m[1]).join(", ")
    + (c.fields.Pairs ? "  | " + strip(c.fields.Pairs.replace(/<\/div>/g, " / ").replace(/<\/span><span>/g, " ")) : ""));
  console.log("  " + desc);
  process.exit(0);
}
const p = path.join(DIR, FILE), text = JSON.stringify(deck), cur = fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
if (cur === text && !pinChanged) { console.log("  unchanged " + FILE + "  (" + n + " notes)"); if (CHECK) console.log("  ok    the Turkish sounds deck is current"); process.exit(0); }
if (CHECK) { console.log("  STALE     " + FILE + "\n\n  FAIL  the deck is not what turkish-sounds.json and Turkish A1 give — run without --check"); process.exit(1); }
fs.writeFileSync(p, text); console.log("  wrote     " + FILE + "  (" + n + " notes)");
if (pinChanged) { fs.writeFileSync(IDS, "{\n" + Object.keys(pin).map((k) => JSON.stringify(k) + ": " + JSON.stringify(pin[k])).join(",\n") + "\n}\n"); console.log("  turkish-ids.json: new rows written"); }
