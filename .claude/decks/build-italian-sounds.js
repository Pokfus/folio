#!/usr/bin/env node
"use strict";
/*
  build-italian-sounds.js — writes decks/Italian-Sounds-and-Spelling.folio-deck.json (Nov 2026, the Italian
  beginner pass — docs/lang-decks.md). Standalone Node helper, zero deps. Not part of the site.

    node .claude/decks/build-italian-sounds.js            # build
    node .claude/decks/build-italian-sounds.js --check    # is the deck what the table and CILS A1 give?
    node .claude/decks/build-italian-sounds.js --report   # print the cards and what was left out, write nothing

  WHY IT EXISTS. Nothing on the Italian shelf said how a letter is read. Measured on CILS A1 on 2026-11-16:
  of its 1,004 headwords 454 contain a spelling whose sound is not the English one (c or g before e and i,
  ch, gli, gn, sc, qu, z, a silent h) or that English does not make at all (a doubled consonant), and 41
  end in a written accent; no deck and no description mentioned any of it.

  IT READS NO LIVE SOURCE: only `italian-sounds.json` (the articles' sentences and cells, captured by hand
  at the revisions it names) and the shipped CILS A1 deck. NOTHING ON A CARD IS COMPOSED HERE. A sound's
  English comparison is the cell of Wikipedia's Help:IPA/Italian; a context or a rule is a sentence of
  "Italian orthography" (two are from "Italian phonology"); an example word is a CILS A1 card, with that
  card's first meaning and its speaker; the transcription beside a hand-picked word is the English
  Wiktionary's. The header of the table says which is which.

  WHICH ROWS ARE CARDED, AND WITH WHICH WORDS. A row with an `rx` is one whose sound the spelling decides
  (c before e or i, gn, sc before a, o, u): its example words are the first three one-word headwords of
  CILS A1, in the order the deck is dealt, whose bare word (the article taken off, lower case) shows it —
  so they are words met early. A row with `words` is one the spelling does NOT decide (an open or a close
  e, s between vowels, z, where the stress falls): its words are named in the table, each with the
  transcription that shows the sound, and a word CILS A1 does not card fails the build. A row no A1
  headword shows is left out (gh), and `--report` lists what was left out.

  THE CARD TYPE is `itsound`, not `cils`: italian-fix.js edits `cils` decks only and holds this one to its
  pinned ids. The ids come from `italian-ids.json` (a row's `key` → N); a new row takes the next number.
  Re-run this after italian-fix.js changes CILS A1 (its order decides the example words), then
  `.claude/build-lang-decks.js`.
*/
const fs = require("fs"), path = require("path");
const HERE = __dirname, DIR = path.join(HERE, "..", "..", "decks");
const TABLE = path.join(HERE, "italian-sounds.json"), IDS = path.join(HERE, "italian-ids.json");
const FILE = "Italian-Sounds-and-Spelling.folio-deck.json", ID = "itsounds";
const argv = process.argv.slice(2), CHECK = argv.includes("--check"), REPORT = argv.includes("--report");
const STAMP = Date.UTC(2026, 10, 16), STAMP_ISO = "2026-11-16T00:00:00.000Z";
const fail = (m) => { console.error("FAIL  " + m); process.exit(1); };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const strip = (s) => String(s || "").replace(/<[^>]+>/g, "").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");

const T = JSON.parse(fs.readFileSync(TABLE, "utf8"));
/* CILS A1, found by its deck id and card type rather than by its file name */
const a1 = fs.readdirSync(DIR).filter((f) => /Italian/.test(f) && f.endsWith(".folio-deck.json"))
  .map((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"))).find((d) => d.meta && d.meta.id === "cilsa1" && d.meta.types && d.meta.types.cils);
if (!a1) fail("no CILS A1 deck (id cilsa1, card type cils) in decks/");
const glossOf = (c) => { const m = /<(?:div class="uc-gl"|li)>([\s\S]*?)<\/(?:div|li)>/.exec(c.fields.English); return m ? strip(m[1]) : ""; };
const byHead = new Map(a1.cards.map((c) => [c.fields.Word, c]));
/* the bare word and where it starts in the headword: `la casa` → casa at 3, `l'anno` → anno at 2 */
const artLen = (w) => { const m = /^(?:il|lo|la|i|gli|le)\s+|^l'/i.exec(w); return m ? m[0].length : 0; };
const isNoun = (c) => c.fields.Italian.includes("uc-art");
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

/* one word a CILS A1 card already carries: its speaker, itself with the letters picked out, then the
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
const named = (key, w) => byHead.get(w) || fail(key + " names " + w + ", which CILS A1 does not card");
const lab = (t) => '<span class="uc-lab">' + t + "</span>";

const cards = [], left = [], thin = [];
const add = (key, f) => cards.push({ id: idFor(key), num: String(cards.length + 1), key, type: "itsound",
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
  add(r.key, { Letters: r.show, Kind: /\s|.{2,}/.test(r.show) && kind === "consonant" ? "Italian letters" : "Italian " + kind, Name: r.name || "", Rows: rows.join(""), Says: r.says || "" });
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

const type = { id: "itsound", name: "Italian sounds and spelling", speechLang: "it-IT",
  fields: ["Letters", "Kind", "Name", "Rows", "Says", "Pairs", "Examples"],
  cards: [{ name: "Spelling → sound",
    front: '<div class="uc-ask">{{Kind}}</div><div class="uc-snd">{{Letters}}</div>',
    back: '{{FrontSide}}{{#Name}}<div class="uc-name">{{Name}}</div>{{/Name}}<hr>{{#Rows}}{{Rows}}{{/Rows}}'
      + '{{#Says}}<div class="uc-field">{{Says}}</div>{{/Says}}{{#Pairs}}{{Pairs}}{{/Pairs}}'
      + '{{#Examples}}<div class="uc-rows uc-alone">{{Examples}}</div>{{/Examples}}' }],
  css: CSS };

const n = cards.length, nV = cards.filter((c) => c.key.startsWith("vowel:")).length, nC = cards.filter((c) => c.key.startsWith("letter:")).length, nR = n - nV - nC;
const bareWords = a1.cards.map((c) => c.fields.Word.slice(off(c)).toLowerCase());
const odd = bareWords.filter((w) => /(?<![sc])c(?=[eiéèì])|ch|g(?=[eiéèì])|gli|gn|sc|qu|z|h|([bcdfglmnprstv])\1/.test(w)).length, acc = bareWords.filter((w) => /[àèéìòù]$/.test(w)).length;
const cite = (s) => "Wikipedia, “" + s.title + "”, revision " + s.revid + " of " + s.timestamp.slice(0, 10);
const desc = "How Italian is read, before or beside the first word: " + n + " notes, one card each — the five vowels, " + nC
  + " consonant letters and groups of letters whose sound is not the English one (c, ch, g, ci and gi before another vowel, gli, gn, sc, qu, r, s, z), and "
  + nR + " rules: the silent h, the doubled consonant, where the stress falls and when it is written, and the accents that tell la from là. "
  + "The front shows the letters. The back gives, for each position the letters can stand in, the sound in the International Phonetic Alphabet and the "
  + "English sound it resembles, then up to three words of the CILS A1 deck with a speaker beside each and the letters picked out; where the spelling "
  + "does not decide the sound (an open or a close e, s between two vowels, z, the stress) the word's own transcription stands beside it. Say the word, "
  + "then press the speaker and compare. Of CILS A1's " + bareWords.length + " words, " + odd + " contain one of these spellings or a doubled consonant and "
  + acc + " end in a written accent. THE ORDER is the vowels, the consonants in alphabetical order, then the rules. At the default of ten new cards a day "
  + "the deck takes " + Math.ceil(n / 10) + " days; it is meant to be studied beside CILS A1, not finished first. — WHAT IS NOT HERE: no description is written "
  + "for this deck. Each English comparison is a cell of the first page named below, each context and rule a sentence of the second (two are from the "
  + "third), with a cut marked […]. A row is carded only where a CILS A1 headword shows it, so gh has no card, and the letters that sound as an English "
  + "speaker expects (b, d, f, l, m, n, p, t, v) have none. No source here says which syllable of every word is stressed, so the two stress cards "
  + "give the rule and three transcribed words, and the stressed syllable is not marked on the other cards. The speaker is your device's Italian voice "
  + "reading the example word, so a device without one is silent. — English comparisons: " + cite(T.sources.ipa) + ". Contexts and rules: "
  + cite(T.sources.orthography) + "; " + cite(T.sources.phonology) + " (all CC BY-SA 4.0). Transcriptions: English Wiktionary, via kaikki.org (CC BY-SA 4.0). "
  + "Example words and meanings: the CILS A1 deck on this shelf (English Wiktionary via kaikki.org, CC BY-SA 4.0).";
const deck = { folioDeck: 1, exportedAt: STAMP_ISO, meta: { author: "", language: "en", glossMode: "site", version: 1, createdAt: STAMP, updatedAt: STAMP,
  forkedFrom: null, id: ID, title: "Italian — Sounds and spelling",
  subtitle: n + " letters, double consonants, stress and written accents — start here, beside CILS A1", desc,
  tags: ["italian", "pronunciation", "spelling", "alphabet"], types: { itsound: type } }, cards, gloss: {} };

if (REPORT) {
  console.log(FILE + "  (" + n + " notes)\n  " + deck.meta.subtitle + "\n  " + cards.map((c) => c.key).join(" "));
  console.log("  rows left out, no A1 headword shows them: " + (left.join("; ") || "none"));
  console.log("  fewer than three example words: " + (thin.join(", ") || "none"));
  for (const c of cards) console.log("  " + c.key + ": " + [...c.fields.Rows.matchAll(/data-say="([^"]+)"/g)].map((m) => m[1]).join(", ") + [...c.fields.Examples.matchAll(/data-say="([^"]+)"/g)].map((m) => m[1]).join(", "));
  process.exit(0);
}
const p = path.join(DIR, FILE), text = JSON.stringify(deck), cur = fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
if (cur === text && !pinChanged) { console.log("  unchanged " + FILE + "  (" + n + " notes)"); if (CHECK) console.log("  ok    the Italian sounds deck is current"); process.exit(0); }
if (CHECK) { console.log("  STALE     " + FILE + "\n\n  FAIL  the deck is not what italian-sounds.json and CILS A1 give — run without --check"); process.exit(1); }
fs.writeFileSync(p, text); console.log("  wrote     " + FILE + "  (" + n + " notes)");
if (pinChanged) { fs.writeFileSync(IDS, "{\n" + Object.keys(pin).map((k) => JSON.stringify(k) + ":" + JSON.stringify(pin[k])).join(",\n") + "\n}\n"); console.log("  italian-ids.json: new rows written"); }
