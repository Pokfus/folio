#!/usr/bin/env node
"use strict";
/*
  build-spanish-sounds.js — writes decks/Spanish-Sounds-and-Spelling.folio-deck.json (Nov 2026, the Spanish
  beginner pass — docs/lang-decks.md). Standalone Node helper, zero deps. Not part of the site.

    node .claude/decks/build-spanish-sounds.js            # build
    node .claude/decks/build-spanish-sounds.js --check    # is the deck what the table and DELE A1 give?
    node .claude/decks/build-spanish-sounds.js --report   # print the cards and what was left out, write nothing

  WHY IT EXISTS. Nothing on the Spanish shelf said how a letter is read. Measured on DELE A1 as shipped on
  2026-11-16: 169 of its 492 headwords contain a letter that does not have its English value (ñ, ll, rr, j,
  a silent h, c or g before e and i, z, qu, v) and 66 carry a written accent; no description mentioned
  either.

  IT READS NO LIVE SOURCE: only `spanish-sounds.json` (the article's rows, captured by hand at the revision
  it names) and the shipped DELE A1 deck. NOTHING ON A CARD IS COMPOSED HERE. A sound's context, IPA and
  English comparison are the article's row; a rule is the article's sentence; an example word is a DELE A1
  card, with that card's first meaning and its speaker.

  WHICH ROWS ARE CARDED. A row of the table is kept only if a headword of DELE A1 shows it. A headword is
  tested AS IT IS SAID, article and all with the space taken out, because the article's rows turn on what
  comes before a letter "even across a word boundary": the d of el dinero follows an l and is [d], the g
  of el agua follows a vowel. A headword that is a pair (bueno, buena) is not used. So a letter no A1
  headword shows (gü) has no card, and `--report` lists what was left out. The examples are the first
  three such headwords in the order A1 is dealt, so they are words met early.

  THE CARD TYPE is `essound`, not `dele`: spanish-fix.js edits `dele` decks only and holds this one to its
  pinned ids. The ids come from `spanish-ids.json` (a row's `key` → N); a new row takes the next number.
  Re-run this after spanish-fix.js changes DELE A1 (its order decides the example words), then
  `.claude/build-lang-decks.js`.
*/
const fs = require("fs"), path = require("path");
const HERE = __dirname, DIR = path.join(HERE, "..", "..", "decks");
const TABLE = path.join(HERE, "spanish-sounds.json"), IDS = path.join(HERE, "spanish-ids.json");
const FILE = "Spanish-Sounds-and-Spelling.folio-deck.json", ID = "essounds";
const argv = process.argv.slice(2), CHECK = argv.includes("--check"), REPORT = argv.includes("--report");
const STAMP = Date.UTC(2026, 10, 16), STAMP_ISO = "2026-11-16T00:00:00.000Z";
const fail = (m) => { console.error("FAIL  " + m); process.exit(1); };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const strip = (s) => String(s || "").replace(/<[^>]+>/g, "").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");

const T = JSON.parse(fs.readFileSync(TABLE, "utf8"));
/* DELE A1, found by its deck id and card type rather than by its file name */
const a1 = fs.readdirSync(DIR).filter((f) => /Spanish/.test(f) && f.endsWith(".folio-deck.json"))
  .map((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"))).find((d) => d.meta && d.meta.id === "delea1" && d.meta.types && d.meta.types.dele);
if (!a1) fail("no DELE A1 deck (id delea1, card type dele) in decks/");
const glossOf = (c) => {
  const p = String(c.fields.English).split('<div class="uc-sense">')[1] || "";
  const li = /<li>([\s\S]*?)<\/li>/.exec(p), one = /<div class="uc-gl">([\s\S]*?)<\/div>/.exec(p);
  return strip((li || one || ["", ""])[1]);
};
const byHead = new Map(a1.cards.map((c) => [c.fields.Spanish, c]));
const oneWord = a1.cards.filter((c) => /^[^,\/]+$/.test(c.fields.Spanish));   // one headword, not a pair
/* the headword as it is said: lower case, the space after an article taken out; `at` maps back to the text */
function said(w) { const at = []; let t = ""; [...w].forEach((ch, i) => { if (ch !== " ") { t += ch.toLowerCase(); at.push(i); } }); return { t, at }; }
/* where a row's letters stand in a headword: [first, last] character. What comes BEFORE a letter may be in
   the word before it; the letters themselves may not straddle two words (el lugar has no ll). */
function hits(w, rx) {
  const { t, at } = said(w), out = [];
  for (const m of t.matchAll(new RegExp(rx, "g"))) {
    const n = [...m[0]].length; if (!n) continue;
    const a = at[m.index], b = at[m.index + n - 1];
    if (b - a === n - 1) out.push([a, b]);
  }
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

/* one word a DELE A1 card already carries: its speaker, itself with the letters picked out, its meaning */
function wordRow(c, rx) {
  const w = c.fields.Spanish;
  let shown = w;
  if (rx) {
    const chars = [...w], open = new Set(), close = new Set();
    for (const [a, b] of hits(w, rx)) { open.add(a); close.add(b); }
    shown = chars.map((ch, i) => (open.has(i) ? "\u0001" : "") + ch + (close.has(i) ? "\u0002" : "")).join("");
  }
  return '<div class="uc-row"><span class="uc-rz"><span class="uc-tts uc-exsay" data-say="' + esc(c.fields.Word) + '"></span>'
    + esc(shown).replace(/\u0001/g, "<b>").replace(/\u0002/g, "</b>") + '</span><span class="uc-rg">' + esc(glossOf(c)) + "</span></div>";
}
const sentRow = (es, en) => '<div class="uc-row"><span class="uc-rz"><span class="uc-tts uc-exsay" data-say="' + esc(es) + '"></span>'
  + esc(es) + '</span><span class="uc-rg">' + esc(en) + "</span></div>";
const lab = (t) => '<span class="uc-lab">' + t + "</span>";

const cards = [], left = [], thin = [];
const add = (key, f) => cards.push({ id: idFor(key), num: String(cards.length + 1), key, type: "essound",
  fields: Object.assign({ Letters: "", Kind: "", Name: "", Rows: "", Says: "", Pairs: "", Examples: "" }, f) });

for (const [group, kind] of [["vowels", "vowel"], ["consonants", "consonant"]]) for (const r of T[group]) {
  const used = new Set(), rows = [];
  for (const row of r.rows) {
    const ws = oneWord.filter((c) => !used.has(c) && hits(c.fields.Spanish, row.rx).length).slice(0, 3);
    if (!ws.length) { left.push(r.show + (row.when ? " — " + strip(row.when) : "")); continue; }
    if (ws.length < 3) thin.push(r.key + " (" + ws.length + ")");
    ws.forEach((c) => used.add(c));
    rows.push('<div class="uc-sr">' + (row.when ? '<div class="uc-when">' + row.when + "</div>" : "")
      + '<div class="uc-ipa">' + row.ipa + '</div><div class="uc-like">' + row.like + "</div>"
      + '<div class="uc-rows">' + lab("as in") + ws.map((c) => wordRow(c, row.rx)).join("") + "</div></div>");
  }
  if (!rows.length) continue;
  add(r.key, { Letters: r.show, Kind: /\s|.{2,}/.test(r.show) && kind === "consonant" ? "Spanish letters" : "Spanish " + kind, Name: r.name || "", Rows: rows.join("") });
}
for (const r of T.rules) {
  let ex = "";
  if (r.words) ex = lab("as in") + r.words.map((w) => { const c = byHead.get(w); if (!c) fail(r.key + " names " + w + ", which DELE A1 does not card"); return wordRow(c, null); }).join("");
  if (r.sentences) ex = lab("as in") + r.sentences.map(([w, es]) => {
    const c = byHead.get(w); if (!c) fail(r.key + " names " + w + ", which DELE A1 does not card");
    const m = [...String(c.fields.Examples).matchAll(/<div class="uc-exz">([\s\S]*?)<\/div><div class="uc-exe">([\s\S]*?)<\/div>/g)].find((x) => strip(x[1]) === es);
    if (!m) fail(r.key + ": the card " + w + " has no example sentence “" + es + "”");
    return sentRow(es, strip(m[2]));
  }).join("");
  /* ROWS OF SPANS, NOT A TABLE: the deck sanitizer (`uDeckNormalize`) drops <table>, <tr> and <td> and keeps
     their text, so a table arrived as one run-on paragraph — seen on the first screenshot, not in the file. */
  const pairs = !r.pairs ? "" : '<div class="uc-pairs">' + (r.heads ? '<div class="uc-pair uc-pairh">' + r.heads.map((h) => "<span>" + esc(h) + "</span>").join("") + "</div>" : "")
    + r.pairs.map((p) => '<div class="uc-pair">' + p.map((x) => "<span>" + esc(x) + "</span>").join("") + "</div>").join("") + "</div>";
  add(r.key, { Letters: r.show, Kind: r.kind, Name: r.name, Says: r.says, Pairs: pairs, Examples: ex });
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
const type = { id: "essound", name: "Spanish sounds and spelling", speechLang: "es-ES",
  fields: ["Letters", "Kind", "Name", "Rows", "Says", "Pairs", "Examples"],
  cards: [{ name: "Spelling → sound",
    front: '<div class="uc-ask">{{Kind}}</div><div class="uc-snd">{{Letters}}</div>',
    back: '{{FrontSide}}{{#Name}}<div class="uc-name">{{Name}}</div>{{/Name}}<hr>{{#Rows}}{{Rows}}{{/Rows}}'
      + '{{#Says}}<div class="uc-field">{{Says}}</div>{{/Says}}{{#Pairs}}{{Pairs}}{{/Pairs}}'
      + '{{#Examples}}<div class="uc-rows uc-alone">{{Examples}}</div>{{/Examples}}' }],
  css: CSS };

const n = cards.length, nV = cards.filter((c) => c.key.startsWith("vowel:")).length, nC = cards.filter((c) => c.key.startsWith("letter:")).length, nR = n - nV - nC;
const heads = a1.cards.map((c) => c.fields.Word.toLowerCase());
const odd = heads.filter((w) => /ñ|ll|rr|j|(^|[^c])h|c[eiéí]|z|g[eiéí]|qu|v/.test(w)).length, acc = heads.filter((w) => /[áéíóú]/.test(w)).length;
const src = "Wikipedia, “" + T.source.title + "”, revision " + T.source.revid + " of " + T.source.timestamp.slice(0, 10);
const desc = "How Spanish is read, before or beside the first word: " + n + " notes, one card each — the five vowels, " + nC
  + " consonant letters and pairs of letters whose sound is not the English one (b and v, c, ch, d, g, gu, h, j, ll, ñ, qu, r, rr, x, y, z), and "
  + nR + " rules: where the stress falls, what the written accent is for, the words it tells apart (el and él, que and qué), and the inverted ¿ and ¡. "
  + "The front shows the letters. The back gives, for each position the letter can stand in, the sound in the International Phonetic Alphabet and the "
  + "English sound it resembles, then up to three words of the DELE A1 deck with a speaker beside each and the letters picked out. Say the word, then "
  + "press the speaker and compare. Of DELE A1's " + heads.length + " words, " + odd + " contain a letter that does not have its English value and "
  + acc + " carry a written accent. THE ORDER is the vowels, the consonants in alphabetical order, then the rules. At the default of ten new cards a day "
  + "the deck takes " + Math.ceil(n / 10) + " days; it is meant to be studied beside DELE A1, not finished first. — WHAT IS NOT HERE: no description is written "
  + "for this deck. Each context, sound and comparison is a row of the article named below, and each rule one of its sentences, with a cut marked […]. "
  + "A row is carded only where a DELE A1 headword shows it, so gü has no card, and the letters that sound as an English speaker expects "
  + "(f, k, l, m, n, p, s, t, w) have none. The two pronunciations of c and z are both given, Spain's first, as the article gives them. The speaker is your "
  + "device's Spanish voice reading the example word, so a device without one is silent. — Sounds, comparisons and rules: " + src
  + " (CC BY-SA 4.0). Example words and meanings: the DELE A1 deck on this shelf (Plan curricular del Instituto Cervantes; English Wiktionary via kaikki.org, CC BY-SA 4.0).";
const deck = { folioDeck: 1, exportedAt: STAMP_ISO, meta: { author: "", language: "en", glossMode: "site", version: 1, createdAt: STAMP, updatedAt: STAMP,
  forkedFrom: null, id: ID, title: "Spanish — Sounds and spelling",
  subtitle: n + " letters, stress rules and written accents — start here, beside DELE A1", desc,
  tags: ["spanish", "pronunciation", "spelling", "alphabet"], types: { essound: type } }, cards, gloss: {} };

if (REPORT) {
  console.log(FILE + "  (" + n + " notes)\n  " + deck.meta.subtitle + "\n  " + cards.map((c) => c.key).join(" "));
  console.log("  rows left out, no A1 headword shows them: " + (left.join("; ") || "none"));
  console.log("  fewer than three example words: " + (thin.join(", ") || "none"));
  for (const c of cards) console.log("  " + c.key + ": " + [...c.fields.Rows.matchAll(/data-say="([^"]+)"/g)].map((m) => m[1]).join(", ") + [...c.fields.Examples.matchAll(/data-say="([^"]+)"/g)].map((m) => m[1]).join(", "));
  process.exit(0);
}
const p = path.join(DIR, FILE), text = JSON.stringify(deck), cur = fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
if (cur === text && !pinChanged) { console.log("  unchanged " + FILE + "  (" + n + " notes)"); if (CHECK) console.log("  ok    the Spanish sounds deck is current"); process.exit(0); }
if (CHECK) { console.log("  STALE     " + FILE + "\n\n  FAIL  the deck is not what spanish-sounds.json and DELE A1 give — run without --check"); process.exit(1); }
fs.writeFileSync(p, text); console.log("  wrote     " + FILE + "  (" + n + " notes)");
if (pinChanged) { fs.writeFileSync(IDS, "{\n" + Object.keys(pin).map((k) => JSON.stringify(k) + ":" + JSON.stringify(pin[k])).join(",\n") + "\n}\n"); console.log("  spanish-ids.json: new rows written"); }
