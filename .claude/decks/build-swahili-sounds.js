#!/usr/bin/env node
"use strict";
/*
  build-swahili-sounds.js — writes decks/Swahili-Sounds-and-Spelling.folio-deck.json (Nov 2026, the Swahili
  beginner pass — docs/lang-decks.md). Standalone Node helper, zero deps. Not part of the site.

    node .claude/decks/build-swahili-sounds.js [--check] [--report]

  WHY. Swahili is spelled as it sounds, so the plan gave it no script deck and no romanisation — and an
  English reader still misreads it: ng' is the ng of sing and ng the ng of finger, the m of mtu is a
  syllable of its own, dh, th, gh and kh are Arabic sounds, every vowel is said in full and the stress is on
  the second-last syllable. No deck and no description said any of it. And every sentence of every card is
  built on what the grammars call concord: the noun's class chooses the prefix of the adjective, of "of", of
  this and that, and of the verb. The level cards show those forms (since the beginner pass, five class
  pairs on every agreeing word and the cells of Wiktionary's table on every verb); nothing said what the
  pattern in those rows is.

  IT READS NO LIVE SOURCE: the table swahili-sounds.json (its `_` says where every cell came from, at which
  Wikipedia revision; `.claude/swahili/sounds.py --verify` checks it) and the shipped Swahili A1 deck, found
  by its deck id and CARD TYPE (`swahili`), not by its file name. A sound's card shows the key's own
  example, then the first three words of Swahili A1, in the order A1 deals them, whose spelling has the
  sound — each with that card's speaker, its first meaning and the dictionary's transcription where the
  table has one. A rule's table of forms is READ OFF THE FORMS ROWS of the A1 cards its row names: a form
  no card shows cannot be on a rule's card, and a card that loses a cell fails the run.

  A card is ONE NOTE with one template (card type `swsound`). Its id is pinned by the row's `key` in
  swahili-ids.json (deck `swsounds`), which this script extends and swahili-fix.js checks. The deck's title
  contains "Sounds and spelling", which is what `.claude/build-lang-decks.js` ranks before level A1.

  ROWS OF SPANS, NOT A TABLE: the deck sanitizer (`uDeckNormalize` in app.js) drops <table>, <tr> and <td>.
  The CSS is the Turkish sounds deck's (build-turkish-sounds.js), copied: a change there does not reach here.
*/
const fs = require("fs"), path = require("path");
const HERE = __dirname, DIR = path.join(HERE, "..", "..", "decks");
const TABLE = path.join(HERE, "swahili-sounds.json"), IDS = path.join(HERE, "swahili-ids.json");
const FILE = "Swahili-Sounds-and-Spelling.folio-deck.json", ID = "swsounds";
const argv = process.argv.slice(2), CHECK = argv.includes("--check"), REPORT = argv.includes("--report");
const STAMP = Date.UTC(2026, 10, 27), STAMP_ISO = "2026-11-27T00:00:00.000Z";
const fail = (m) => { console.error("FAIL  " + m); process.exit(1); };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const strip = (s) => String(s || "").replace(/<[^>]+>/g, "").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
/* a cell the key prints with letters in bold: escaped, the <b> kept */
const escB = (s) => esc(s).replace(/&lt;(\/?)b&gt;/g, "<$1b>");

const T = JSON.parse(fs.readFileSync(TABLE, "utf8"));
/* Swahili A1, found by its deck id and card type rather than by its file name */
const a1 = fs.readdirSync(DIR).filter((f) => /Swahili/.test(f) && f.endsWith(".folio-deck.json"))
  .map((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"))).find((d) => d.meta && d.meta.id === "swahilia1" && d.meta.types && d.meta.types.swahili);
if (!a1) fail("no Swahili A1 deck (id swahilia1, card type swahili) in decks/");
const glossOf = (c) => { const m = /<(?:div class="uc-gl"|li)>([\s\S]*?)<\/(?:div|li)>/.exec(c.fields.English); return m ? strip(m[1]) : ""; };
const headOf = (c) => strip(c.fields.Swahili);
const byHead = new Map(a1.cards.map((c) => [c.fields.Word, c]));

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

/* one word a Swahili A1 card already carries: its speaker, itself as the card prints it with the letters
   picked out, then the dictionary's transcription (where the table has one) and the card's first meaning */
function wordRow(c, re) {
  const w = c.fields.Word, shown = headOf(c);
  let html = esc(shown);
  if (re) {
    // the letters are found in the word as spoken; a stem is printed with its hyphen in front
    const pre = shown.length - w.length, marks = [];
    for (const m of w.toLowerCase().matchAll(new RegExp(re, "g"))) if (m[0].length) marks.push([m.index + pre, m.index + pre + m[0].length]);
    let out = "", at = 0;
    for (const [a, b] of marks) { out += esc(shown.slice(at, a)) + "<b>" + esc(shown.slice(a, b)) + "</b>"; at = b; }
    html = out + esc(shown.slice(at));
  }
  const ipa = T.ipa[w];
  return '<div class="uc-row"><span class="uc-rz"><span class="uc-tts uc-exsay" data-say="' + esc(w) + '"></span>' + html
    + '</span><span class="uc-rg">' + (ipa ? '<span class="uc-ri">' + esc(ipa) + "</span>" : "") + esc(glossOf(c)) + "</span></div>";
}
const named = (key, w) => byHead.get(w) || fail(key + " names " + w + ", which Swahili A1 does not card");
const lab = (t) => '<span class="uc-lab">' + t + "</span>";
/* a `says` is a list of quotations: one paragraph each */
const saysHTML = (q) => (q || []).map((x) => '<span class="uc-q">' + esc(x) + "</span>").join("");
/* the first three words of A1, in the order it deals them, whose spelling has the sound; a one-word card only */
function firstWords(re, ipaRe, not) {
  if (!re && !ipaRe) return [];
  const rx = new RegExp(re || "."), ix = ipaRe ? new RegExp(ipaRe) : null, out = [];
  for (const c of a1.cards) {
    const w = c.fields.Word;
    if (/\s/.test(w) || w === not || !rx.test(w.toLowerCase()) || (ix && !(T.ipa[w] && ix.test(T.ipa[w])))) continue;
    out.push(c);
    if (out.length === 3) break;
  }
  return out;
}

const cards = [];
const add = (key, f) => cards.push({ id: idFor(key), num: String(cards.length + 1), key, type: "swsound",
  fields: Object.assign({ Letters: "", Kind: "", Rows: "", Says: "", Pairs: "", Examples: "" }, f) });

for (const r of T.sounds) {
  const k = r.cells || fail(r.key + " has no cells — run python3 .claude/swahili/sounds.py --fill");
  const words = firstWords(r.re, r.ipaRe, k.word);
  // the key's own row: its example with a speaker, its transcription and meaning, its English comparison
  const own = '<div class="uc-row"><span class="uc-rz"><span class="uc-tts uc-exsay" data-say="' + esc(k.word) + '"></span>' + escB(k.wordB)
    + '</span><span class="uc-rg"><span class="uc-ri">' + esc(k.ipa) + "</span>" + esc(k.gloss) + "</span></div>";
  const rows = '<div class="uc-sr"><div class="uc-ipa">' + esc(r.sym) + "</div>"
    + '<div class="uc-like">' + (r.kind === "stress" || r.sym === "ː" ? esc(k.like) : "As in " + escB(k.like)) + "</div>"
    + '<div class="uc-rows">' + lab("the key’s example") + own + "</div>"
    + (words.length ? '<div class="uc-rows">' + lab("in Swahili A1") + words.map((c) => wordRow(c, r.re)).join("") + "</div>" : "") + "</div>";
  add(r.key, { Letters: r.show, Kind: "Swahili " + r.kind, Rows: rows, Says: saysHTML((k.note ? [k.note] : []).concat(r.says || [])) });
}

/* one cell of a card's Forms row, as the card prints it */
const cellOf = (key, c, label) => { const m = new RegExp('<span class="uc-fl">' + label + "</span>([^<]*)</span>").exec(c.fields.Forms); return m ? strip(m[1]) : fail(key + ": the card " + c.fields.Word + " shows no " + label); };
const CLASS_ROWS = ["m-wa", "m-mi", "ji-ma", "ki-vi", "n"];
function grid(r) {
  const g = r.grid, key = r.key;
  if (!g) return null;
  if (g.type === "nouns") // class, singular, plural — the class as the card's own label has it
    return { heads: ["class", "one", "more than one"], rows: g.words.map((w) => { const c = named(key, w), m = /noun, class ([^<,]*)/.exec(c.fields.English); if (!m) fail(key + ": " + w + " shows no class"); return [m[1], headOf(c), cellOf(key, c, "plural")]; }) };
  if (g.type === "classes") // one row for each class pair, one column for each card
    return { heads: ["class"].concat(g.words.map((w) => headOf(named(key, w)))), rows: CLASS_ROWS.map((l) => [l].concat(g.words.map((w) => cellOf(key, named(key, w), l)))) };
  if (g.type === "forms") // one row for each card, one column for each named cell
    return { heads: [""].concat(g.cells), rows: g.words.map((w) => [headOf(named(key, w))].concat(g.cells.map((l) => cellOf(key, named(key, w), l)))) };
  if (g.type === "persons") { // the six pronoun cards beside the six cells of one card's rows
    const c = named(key, g.word), cols = g.cells.map((l) => cellOf(key, c, l).split(" · "));
    for (const col of cols) if (col.length !== g.pronouns.length) fail(key + ": " + g.word + " has " + col.length + " forms in a row, not " + g.pronouns.length);
    return { heads: [""].concat(g.cells), rows: g.pronouns.map((p, i) => [headOf(named(key, p)) + " (" + glossOf(named(key, p)).split(/[ (,;]/)[0] + ")"].concat(cols.map((col) => col[i]))) };
  }
  if (g.type === "labels") // what the card's own part-of-speech line says of each noun
    return { heads: ["", "as its card says"], rows: g.words.map((w) => { const c = named(key, w), m = /<div class="uc-pos">(noun[^<]*)<\/div>/.exec(c.fields.English); if (!m || !/takes m-wa agreement/.test(m[1])) fail(key + ": the card " + w + " does not say it takes m-wa agreement"); return [headOf(c), strip(m[1]).replace(/^noun, /, "")]; }) };
  fail(key + ": unknown grid " + g.type);
}
for (const r of T.rules) {
  const g = grid(r);
  const pairs = !g ? "" : '<div class="uc-pairs">' + '<div class="uc-pair uc-pairh">' + g.heads.map((h) => "<span>" + esc(h) + "</span>").join("") + "</div>"
    + g.rows.map((p) => '<div class="uc-pair">' + p.map((x) => "<span>" + esc(x) + "</span>").join("") + "</div>").join("") + "</div>";
  const ws = r.words || (r.grid && (r.grid.words || [r.grid.word])) || [];
  const ex = ws.length ? lab("the cards") + ws.map((w) => wordRow(named(r.key, w), null)).join("") : "";
  add(r.key, { Letters: r.show, Kind: "Swahili " + r.kind, Says: saysHTML(r.says), Pairs: pairs, Examples: ex });
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

const type = { id: "swsound", name: "Swahili sounds and agreement", speechLang: "sw-KE",
  fields: ["Letters", "Kind", "Rows", "Says", "Pairs", "Examples"],
  cards: [{ name: "Spelling → sound",
    front: '<div class="uc-ask">{{Kind}}</div><div class="uc-snd">{{Letters}}</div>',
    back: '{{FrontSide}}<hr>{{#Rows}}{{Rows}}{{/Rows}}'
      + '{{#Says}}<div class="uc-field">{{Says}}</div>{{/Says}}{{#Pairs}}{{Pairs}}{{/Pairs}}'
      + '{{#Examples}}<div class="uc-rows uc-alone">{{Examples}}</div>{{/Examples}}' }],
  css: CSS };

const n = cards.length, nS = T.sounds.length, nR = T.rules.length;
const heads = a1.cards.map((c) => c.fields.Word.toLowerCase()).filter((w) => !/\s/.test(w));
const cnt = (re) => heads.filter((w) => re.test(w)).length;
const forms = (label) => a1.cards.filter((c) => c.fields.Forms.includes('uc-fl">' + label + "<")).length;
const cite = (s) => "Wikipedia, “" + s.title + "”, revision " + s.revid + " of " + s.date;
const desc = "How Swahili is read, and how its words agree, before or beside the first word: " + n + " notes, one card each — " + nS + " sounds (the five vowels, the doubled vowel, the stress, and the "
  + (nS - 7) + " consonant spellings an English reader says wrongly: ch, sh, ny, ng', ng, g, j, r, the Arabic dh, th, gh and kh, the m and n that are a syllable of their own, and mb, nd, nj, nz, mv) and "
  + nR + " rules: that Swahili has no tones, the noun classes, what a noun's class does to an adjective, to “of”, to this and that and to the numbers that agree, the people and animals that take m-wa agreement whatever their class, "
  + "is and is not (ni, si), the verb's subject prefix, to have (kuwa na), the tense markers, the negative, the short verbs that keep ku-, the commands, and the Swahili clock. "
  + "Swahili is spelled as it sounds, so the sounds are few; what they hold is what the spelling does not tell an English reader. Of Swahili A1's " + heads.length + " one-word headwords, "
  + cnt(/^m(?![aeiouwbv])|^n(?![aeioudgjyz'])/) + " begin with an m or an n that is a syllable (mtu, nchi), " + cnt(/ng(?!')/) + " have the ng of finger, " + cnt(/ny/) + " ny, " + cnt(/ch/) + " ch, " + cnt(/sh/) + " sh, "
  + cnt(/dh|th|gh|kh/) + " an Arabic dh, th, gh or kh, " + cnt(/(?<!n)j/) + " a j and " + cnt(/aa|ee|ii|oo|uu/) + " a doubled vowel. "
  + "AND THE AGREEMENT, which every sentence uses: a Swahili noun belongs to a class, and the adjective, the possessive, “of”, this and that and the verb each take a prefix chosen by it. The level decks show the forms — "
  + forms("plural") + " cards of Swahili A1 carry a plural, " + forms("ki-vi") + " a row of agreeing forms for the five pairs of classes, " + forms("present") + " a verb's present, negative and commands — and the rule cards here say what the pattern in those rows is, each with a table of forms read off A1's own cards. "
  + "The front shows the spelling or the question. The back gives the sound in the International Phonetic Alphabet and the English sound the key compares it to, the key's own example, then the first words of the Swahili A1 deck that have it, with a speaker beside each, the letters picked out, "
  + "and the word's own transcription from the dictionary where it has one (ˈ stands before the stressed syllable, a dot between syllables). Say the word, then press the speaker and compare. "
  + "THE ORDER is the vowels, the stress, the consonants, then the rules. At the default of ten new cards a day the deck takes " + Math.ceil(n / 10) + " days; it is meant to be studied beside Swahili A1, not finished first. — WHAT IS NOT HERE: "
  + "nothing is written for this deck. Each sound, each example and each English comparison is a cell of the sound's row in the key named first below, and each sentence a sentence of one of the four pages, a paragraph of its own, with a cut marked […]. "
  + "The letters that sound as an English reader expects (b, d, f, h, k, l, n, p, s, t, v, w, y, z) have no card. No sentence was found to quote for two things a learner is usually told, so neither has a card: that two vowels side by side are two syllables (kuamka, chai), and that the days are numbered from Saturday (Jumamosi, the first; Jumapili, the second). "
  + "The rule cards show only forms an A1 card shows, so the past, future and perfect are the tails the dictionary prints (-lisoma, -tasoma, -mesoma), to go behind a subject prefix. "
  + "The speaker is your device's Swahili voice reading the example word, so a device without one is silent. — Sounds, examples and English comparisons: "
  + cite(T.sources.ipa) + ". Rules: " + cite(T.sources.swahili) + "; " + cite(T.sources.grammar) + "; " + cite(T.sources.time)
  + " (all CC BY-SA 4.0). Transcriptions: English Wiktionary, via kaikki.org (CC BY-SA 4.0). "
  + "Example words, forms and meanings: the Swahili A1 deck on this shelf (English Wiktionary via kaikki.org, CC BY-SA 4.0).";
const deck = { folioDeck: 1, exportedAt: STAMP_ISO, meta: { author: "", language: "en", glossMode: "site", version: 1, createdAt: STAMP, updatedAt: STAMP,
  forkedFrom: null, id: ID, title: "Swahili — Sounds and spelling", color: a1.meta.color,
  subtitle: n + " sounds and rules of agreement — start here, beside Swahili A1", desc,
  tags: ["swahili", "kiswahili", "pronunciation", "spelling", "noun classes"], types: { swsound: type } }, cards, gloss: {} };

if (REPORT) {
  console.log(FILE + "  (" + n + " notes)\n  " + deck.meta.subtitle + "\n  " + cards.map((c) => c.key).join(" "));
  for (const c of cards) console.log("  " + c.key + ": " + [...(c.fields.Rows + c.fields.Examples).matchAll(/data-say="([^"]+)"/g)].map((m) => m[1]).join(", ")
    + (c.fields.Pairs ? "  | " + strip(c.fields.Pairs.replace(/<\/div>/g, " / ").replace(/<\/span><span>/g, " | ")) : ""));
  console.log("  " + desc);
  process.exit(0);
}
const p = path.join(DIR, FILE), text = JSON.stringify(deck), cur = fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
if (cur === text && !pinChanged) { console.log("  unchanged " + FILE + "  (" + n + " notes)"); if (CHECK) console.log("  ok    the Swahili sounds deck is current"); process.exit(0); }
if (CHECK) { console.log("  STALE     " + FILE + "\n\n  FAIL  the deck is not what swahili-sounds.json and Swahili A1 give — run without --check"); process.exit(1); }
fs.writeFileSync(p, text); console.log("  wrote     " + FILE + "  (" + n + " notes)");
if (pinChanged) { fs.writeFileSync(IDS, "{\n" + Object.keys(pin).map((k) => JSON.stringify(k) + ": " + JSON.stringify(pin[k])).join(",\n") + "\n}\n"); console.log("  swahili-ids.json: new rows written"); }
