#!/usr/bin/env node
"use strict";
/*
  build-german-sounds.js — writes decks/German-Sounds-and-Spelling.folio-deck.json (Nov 2026, the German
  beginner pass — docs/lang-decks.md). Standalone Node helper, zero deps. Not part of the site.

    node .claude/decks/build-german-sounds.js            # build
    node .claude/decks/build-german-sounds.js --check    # is the deck what the table and Goethe A1 give?
    node .claude/decks/build-german-sounds.js --report   # print the cards and what was left out, write nothing

  WHY IT EXISTS. Nothing on the German shelf said how a letter is read. Measured on Goethe A1 on 2026-11-16:
  of its 785 headwords 453 contain a spelling whose sound is not the English one (ä, ö, ü, ß, ei, ie, eu,
  äu, ch, sch, an initial sp or st, z, w, v, j, an s before a vowel) and 88 end in a b, d or g that is read
  p, t or k; no deck and no description mentioned any of it.

  IT READS NO LIVE SOURCE: only `german-sounds.json` (the articles' sentences and cells, captured by hand
  at the revisions it names) and the shipped Goethe A1 deck. NOTHING ON A CARD IS COMPOSED HERE. A sound's
  English comparison is the cell of Wikipedia's Help:IPA/Standard German; a context is a cell and a rule
  a sentence of "German orthography" (the two stress rules are from "Standard German phonology"); an
  example word is a Goethe A1 card, with that card's first meaning and its speaker; the transcription
  beside a hand-picked word is the English Wiktionary's. The header of the table says which is which.

  WHICH ROWS ARE CARDED, AND WITH WHICH WORDS. A row with an `rx` is one whose sound the spelling decides
  (pf): its example words are the first three one-word headwords of Goethe A1, in the order the deck is
  dealt, whose bare word (the article taken off, lower case) shows it. A row with `words` names its words
  in the table, each with the transcription that shows the sound, and a word Goethe A1 does not card
  fails the build: German spelling decides less than Italian (a long or a short vowel, v, an s, the
  stress, a loanword's j or ch), so almost every row here is of this kind. A row no A1 headword shows is
  left out, and `--report` lists what was left out.

  THE CARD TYPE is `desound`, not `goethe`: german-fix.js and case-order.py edit `goethe` decks only, and
  german-fix.js holds this one to its pinned ids. The ids come from `german-ids.json` (a row's `key` → N);
  a new row takes the next number. Re-run this after german-fix.js changes Goethe A1 (its order decides
  the example words of an `rx` row), then `.claude/build-lang-decks.js`.
*/
const fs = require("fs"), path = require("path");
const HERE = __dirname, DIR = path.join(HERE, "..", "..", "decks");
const TABLE = path.join(HERE, "german-sounds.json"), IDS = path.join(HERE, "german-ids.json");
const FILE = "German-Sounds-and-Spelling.folio-deck.json", ID = "gersounds";
const argv = process.argv.slice(2), CHECK = argv.includes("--check"), REPORT = argv.includes("--report");
const STAMP = Date.UTC(2026, 10, 16), STAMP_ISO = "2026-11-16T00:00:00.000Z";
const fail = (m) => { console.error("FAIL  " + m); process.exit(1); };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const strip = (s) => String(s || "").replace(/<[^>]+>/g, "").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");

const T = JSON.parse(fs.readFileSync(TABLE, "utf8"));
/* Goethe A1, found by its deck id and card type rather than by its file name */
const a1 = fs.readdirSync(DIR).filter((f) => /German|Goethe/.test(f) && f.endsWith(".folio-deck.json"))
  .map((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"))).find((d) => d.meta && d.meta.id === "goethea1" && d.meta.types && d.meta.types.goethe);
if (!a1) fail("no Goethe A1 deck (id goethea1, card type goethe) in decks/");
const glossOf = (c) => { const m = /<(?:div class="uc-gl"|li)>([\s\S]*?)<\/(?:div|li)>/.exec(c.fields.English); return m ? strip(m[1]) : ""; };
const byHead = new Map(a1.cards.map((c) => [c.fields.Word, c]));
/* the bare word and where it starts in the headword: `die Stadt` → Stadt at 4 */
const artLen = (w) => { const m = /^(?:der|die|das)\s+/.exec(w); return m ? m[0].length : 0; };
const isNoun = (c) => c.fields.German.includes("uc-art");
const off = (c) => (isNoun(c) ? artLen(c.fields.Word) : 0);
const oneWord = a1.cards.filter((c) => /^[^,\/ ]+$/.test(c.fields.Word.slice(off(c))));   // one word, not a pair or a phrase
/* where a row's letters stand in a headword: [first, last] character of the whole headword */
function hits(c, rx) {
  const o = off(c), t = c.fields.Word.slice(o).toLowerCase(), out = [];
  for (const m of t.matchAll(new RegExp(rx, "g"))) { const n = [...m[0]].length; if (n) out.push([o + m.index, o + m.index + n - 1]); }
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

/* one word a Goethe A1 card already carries: its speaker, itself with the letters picked out, then the
   transcription the table gives for it (a hand-picked word) and the card's first meaning */
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
const named = (key, w) => byHead.get(w) || fail(key + " names " + w + ", which Goethe A1 does not card");
const lab = (t) => '<span class="uc-lab">' + t + "</span>";

const cards = [], left = [], thin = [];
const add = (key, f) => cards.push({ id: idFor(key), num: String(cards.length + 1), key, type: "desound",
  fields: Object.assign({ Letters: "", Kind: "", Name: "", Rows: "", Says: "", Pairs: "", Examples: "" }, f) });

for (const [group, kind] of [["vowels", "vowel"], ["consonants", "consonant"]]) for (const r of T[group]) {
  const used = new Set(), rows = [];
  for (const row of r.rows) {
    let body;
    if (row.words) {
      body = row.words.map(([w, ipa]) => { const c = named(r.key, w); if (row.mark && !hits(c, row.mark).length) fail(r.key + ": " + w + " does not show " + row.mark); return wordRow(c, row.mark, ipa); });
    } else {
      const ws = oneWord.filter((c) => !used.has(c) && hits(c, row.rx).length).slice(0, 3);
      if (!ws.length) { left.push(r.show + (row.when ? " — " + strip(row.when) : "")); continue; }
      if (ws.length < 3) thin.push(r.key + " (" + ws.length + ")");
      ws.forEach((c) => used.add(c));
      body = ws.map((c) => wordRow(c, row.rx));
    }
    rows.push('<div class="uc-sr">' + (row.when ? '<div class="uc-when">' + row.when + "</div>" : "")
      + '<div class="uc-ipa">' + row.ipa + "</div>" + (row.like ? '<div class="uc-like">' + row.like + "</div>" : "")
      + '<div class="uc-rows">' + lab("as in") + body.join("") + "</div></div>");
  }
  if (!rows.length) continue;
  add(r.key, { Letters: r.show, Kind: [...r.show.replace(/^-/, "")].length > 1 ? "German letters" : "German " + kind, Name: r.name || "", Rows: rows.join(""), Says: r.says || "" });
}
for (const r of T.rules) {
  const ex = lab("as in") + r.words.map(([w, ipa]) => wordRow(named(r.key, w), null, ipa)).join("");
  /* ROWS OF SPANS, NOT A TABLE: the deck sanitizer (`uDeckNormalize`) drops <table>, <tr> and <td> and keeps
     their text, so a table arrives as one run-on paragraph. */
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

const type = { id: "desound", name: "German sounds and spelling", speechLang: "de-DE",
  fields: ["Letters", "Kind", "Name", "Rows", "Says", "Pairs", "Examples"],
  cards: [{ name: "Spelling → sound",
    front: '<div class="uc-ask">{{Kind}}</div><div class="uc-snd">{{Letters}}</div>',
    back: '{{FrontSide}}{{#Name}}<div class="uc-name">{{Name}}</div>{{/Name}}<hr>{{#Rows}}{{Rows}}{{/Rows}}'
      + '{{#Says}}<div class="uc-field">{{Says}}</div>{{/Says}}{{#Pairs}}{{Pairs}}{{/Pairs}}'
      + '{{#Examples}}<div class="uc-rows uc-alone">{{Examples}}</div>{{/Examples}}' }],
  css: CSS };

const n = cards.length, nV = cards.filter((c) => c.key.startsWith("vowel:")).length, nC = cards.filter((c) => c.key.startsWith("letter:")).length, nR = n - nV - nC;
const bareWords = a1.cards.filter((c) => /^[^,\/ ]+$/.test(c.fields.Word.slice(off(c)))).map((c) => c.fields.Word.slice(off(c)).toLowerCase());
const odd = bareWords.filter((w) => /[äöüß]|ei|ie|eu|ch|^s[pt]|z|w|v|j|^s[aeiouäöü]/.test(w)).length, fin = bareWords.filter((w) => /[bdg]$/.test(w)).length;
const cite = (s) => "Wikipedia, “" + s.title + "”, revision " + s.revid + " of " + s.timestamp.slice(0, 10);
const desc = "How German is read, before or beside the first word: " + n + " notes, one card each — " + nV + " vowel spellings (ä, ö, ü, ei, ie, eu and äu, au, and the unstressed endings -e, -er and -en), "
  + nC + " consonant letters and groups of letters whose sound is not the English one (ch, chs, sch, sp and st at the start of a word, s, ß, z, w, v, j, a final b, d or g, -ig, r, h, ng, pf, tsch), and "
  + nR + " rules: the umlaut, how the spelling shows a long or a short vowel, the capital letter, where the stress falls, and the stress of a verb with a prefix. "
  + "The front shows the letters. The back gives, for each position the letters can stand in, the sound in the International Phonetic Alphabet and the "
  + "English sound it resembles, then up to three words of the Goethe A1 deck with a speaker beside each, the letters picked out and the word's own "
  + "transcription: German spelling does not always decide the sound (ä is long in spät and short in März, v is f in von and f or v in November), so the words "
  + "are chosen and each carries its transcription. Say the word, then press the speaker and compare. Of Goethe A1's " + bareWords.length
  + " one-word headwords, " + odd + " contain one of these spellings and " + fin + " end in a b, d or g that is read p, t or k. THE ORDER is the vowels, the consonants, "
  + "then the rules. At the default of ten new cards a day the deck takes " + Math.ceil(n / 10) + " days; it is meant to be studied beside Goethe A1, not finished first. — WHAT IS NOT HERE: "
  + "no description is written for this deck. Each English comparison is a cell of the first page named below, with that page's own labels (DE, AT and CH for "
  + "Germany, Austria and Switzerland; RP and Scottish for the English accent meant); each context is a cell and each rule a sentence of the second (the two "
  + "stress rules are from the third), with a cut marked […]. The letters that sound as an English speaker expects (f, k, l, m, n, p, t) have no card, and "
  + "neither have the plain vowels a, e, i, o, u, whose length the spelling does not always show. No source here marks the stressed syllable of every word, so the "
  + "two stress cards give the rule and transcribed words, and where a word's stress matters its transcription shows it (ˈ before the stressed syllable). The "
  + "speaker is your device's German voice reading the example word, so a device without one is silent. — English comparisons: " + cite(T.sources.ipa)
  + ". Contexts and rules: " + cite(T.sources.orthography) + "; " + cite(T.sources.phonology) + " (all CC BY-SA 4.0). Transcriptions: English Wiktionary, via kaikki.org (CC BY-SA 4.0). "
  + "Example words and meanings: the Goethe A1 deck on this shelf (English Wiktionary via kaikki.org, CC BY-SA 4.0).";
const deck = { folioDeck: 1, exportedAt: STAMP_ISO, meta: { author: "", language: "en", glossMode: "site", version: 1, createdAt: STAMP, updatedAt: STAMP,
  forkedFrom: null, id: ID, title: "German — Sounds and spelling",
  subtitle: n + " letters, umlauts, endings and stress rules — start here, beside Goethe A1", desc,
  tags: ["german", "pronunciation", "spelling", "alphabet"], types: { desound: type } }, cards, gloss: {} };

if (REPORT) {
  console.log(FILE + "  (" + n + " notes)\n  " + deck.meta.subtitle + "\n  " + cards.map((c) => c.key).join(" "));
  console.log("  rows left out, no A1 headword shows them: " + (left.join("; ") || "none"));
  console.log("  fewer than three example words: " + (thin.join(", ") || "none"));
  for (const c of cards) console.log("  " + c.key + ": " + [...c.fields.Rows.matchAll(/data-say="([^"]+)"/g)].map((m) => m[1]).join(", ") + [...c.fields.Examples.matchAll(/data-say="([^"]+)"/g)].map((m) => m[1]).join(", "));
  process.exit(0);
}
const p = path.join(DIR, FILE), text = JSON.stringify(deck), cur = fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
if (cur === text && !pinChanged) { console.log("  unchanged " + FILE + "  (" + n + " notes)"); if (CHECK) console.log("  ok    the German sounds deck is current"); process.exit(0); }
if (CHECK) { console.log("  STALE     " + FILE + "\n\n  FAIL  the deck is not what german-sounds.json and Goethe A1 give — run without --check"); process.exit(1); }
fs.writeFileSync(p, text); console.log("  wrote     " + FILE + "  (" + n + " notes)");
if (pinChanged) { fs.writeFileSync(IDS, "{\n" + Object.keys(pin).map((k) => JSON.stringify(k) + ":" + JSON.stringify(pin[k])).join(",\n") + "\n}\n"); console.log("  german-ids.json: new rows written"); }
