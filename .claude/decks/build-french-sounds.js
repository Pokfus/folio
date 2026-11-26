#!/usr/bin/env node
"use strict";
/*
  build-french-sounds.js — writes decks/French-Sounds-and-Spelling.folio-deck.json (Nov 2026, the French
  beginner pass — docs/lang-decks.md). Standalone Node helper, zero deps. Not part of the site.
  `build-spanish-sounds.js`'s model.

    node .claude/decks/build-french-sounds.js            # build
    node .claude/decks/build-french-sounds.js --check    # is the deck what the table and DELF A1 give?
    node .claude/decks/build-french-sounds.js --report   # print the cards and what was left out, write nothing

  WHY IT EXISTS. Nothing on the French shelf said how a word is read, and French spelling does not say it.
  Measured on DELF A1 as shipped on 2026-11-16: of 441 headword forms, 89 end in a consonant letter that
  is not said, 116 hold a nasal vowel, 111 a final e that is not said, 59 an accent, and 387 at least one
  spelling that does not have its English value; 605 of its 1,290 example sentences hold an elision. The
  cards print IPA on the back, which says what a word sounds like and not why.

  IT READS NO LIVE SOURCE: only `french-sounds.json` (the articles' rows and passages, captured by hand at
  the revisions it names) and the shipped DELF A1 deck. NOTHING ON A CARD IS COMPOSED HERE. A spelling's
  position, sound and examples are a row of the article's tables; a rule is the article's passage; an
  example word is a DELF A1 card, with that card's first meaning and its speaker. There is NO English
  comparison ("like the a in father"): the article gives none, so the comparison is the speaker.

  WHICH ROWS ARE CARDED, AND WHICH WORDS SHOW THEM. A row is kept only if a one-word headword of DELF A1
  shows it: the row's `rx` must match the word's letters (article taken off) AND its `ipaRx` the
  pronunciation printed on that word's own card — so petit is an example of a silent final t because
  Wiktionary transcribes it /pə.ti/, and huit (/ɥit/) is not. The examples are the first three such
  headwords in the order A1 is dealt. A row with `sentences` names A1 example sentences instead (-ent, an
  ending no headword shows). `--report` lists what was left out.

  THE CARD TYPE is `frsound`, not `delf`: french-fix.js edits `delf` decks only and holds this one to its
  pinned ids. The ids come from `french-ids.json` (a row's `key` → N); a new row takes the next number.
  Re-run this after french-fix.js changes DELF A1 (its order decides the example words), then
  `.claude/build-lang-decks.js`.
*/
const fs = require("fs"), path = require("path");
const HERE = __dirname, DIR = path.join(HERE, "..", "..", "decks");
const TABLE = path.join(HERE, "french-sounds.json"), IDS = path.join(HERE, "french-ids.json");
const FILE = "French-Sounds-and-Spelling.folio-deck.json", ID = "frsounds";
const argv = process.argv.slice(2), CHECK = argv.includes("--check"), REPORT = argv.includes("--report");
const STAMP = Date.UTC(2026, 10, 16), STAMP_ISO = "2026-11-16T00:00:00.000Z";
const fail = (m) => { console.error("FAIL  " + m); process.exit(1); };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const strip = (s) => String(s || "").replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

const T = JSON.parse(fs.readFileSync(TABLE, "utf8"));
/* DELF A1, found by its deck id and card type rather than by its file name */
const a1 = fs.readdirSync(DIR).filter((f) => /French/.test(f) && f.endsWith(".folio-deck.json"))
  .map((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"))).find((d) => d.meta && d.meta.id === "delfa1" && d.meta.types && d.meta.types.delf);
if (!a1) fail("no DELF A1 deck (id delfa1, card type delf) in decks/");
const glossOf = (c) => {
  const p = String(c.fields.English).split('<div class="uc-sense">')[1] || "";
  const li = /<li>([\s\S]*?)<\/li>/.exec(p), one = /<div class="uc-gl">([\s\S]*?)<\/div>/.exec(p);
  return strip((li || one || ["", ""])[1]);
};
const byHead = new Map(a1.cards.map((c) => [c.fields.Word, c]));
/* the word itself: the article taken off, lower case; `off` is where it starts in the headword */
function bare(w) { const m = /^(le |la |les |l')/.exec(w); const off = m ? m[1].length : 0; return { t: w.slice(off).toLowerCase(), off }; }
const oneWord = a1.cards.filter((c) => /^[^,\/ ]+$/.test(bare(c.fields.Word).t) && c.fields.Ipa);   // one word, not a pair or a phrase
/* where a row's letters stand in a headword: [first, last] character of the headword as printed */
function hits(w, rx) {
  const { t, off } = bare(w), out = [];
  for (const m of t.matchAll(new RegExp(rx, "g"))) { if (m[0].length) out.push([off + m.index, off + m.index + m[0].length - 1]); }
  return out;
}
const shows = (c, row) => hits(c.fields.Word, row.rx).length && (!row.ipaRx || new RegExp(row.ipaRx).test(String(c.fields.Ipa).split(",")[0].trim()));

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

/* one word a DELF A1 card already carries: its speaker, itself with the letters picked out, its
   pronunciation as that card prints it, its meaning */
function wordRow(c, rx) {
  const w = c.fields.Word;
  let shown = w;
  if (rx) {
    const chars = [...w], open = new Set(), close = new Set();
    for (const [a, b] of hits(w, rx)) { open.add(a); close.add(b); }
    shown = chars.map((ch, i) => (open.has(i) ? "\u0001" : "") + ch + (close.has(i) ? "\u0002" : "")).join("");
  }
  return '<div class="uc-row"><span class="uc-rz"><span class="uc-tts uc-exsay" data-say="' + esc(w) + '"></span>'
    + esc(shown).replace(/\u0001/g, "<b>").replace(/\u0002/g, "</b>") + '</span><span class="uc-rg">' + esc(String(c.fields.Ipa).split(",")[0].trim()) + " · " + esc(glossOf(c)) + "</span></div>";
}
const sentRow = (fr, en) => '<div class="uc-row"><span class="uc-rz"><span class="uc-tts uc-exsay" data-say="' + esc(fr) + '"></span>'
  + esc(fr) + '</span><span class="uc-rg">' + esc(en) + "</span></div>";
const lab = (t) => '<span class="uc-lab">' + esc(t) + "</span>";
function sentences(key, list) {
  return list.map(([w, fr]) => {
    const c = byHead.get(w); if (!c) fail(key + " names " + w + ", which DELF A1 does not card");
    const m = [...String(c.fields.Examples).matchAll(/<div class="uc-exz">([\s\S]*?)<\/div><div class="uc-exe">([\s\S]*?)<\/div>/g)].find((x) => strip(x[1]) === fr);
    if (!m) fail(key + ": the card " + w + " has no example sentence “" + fr + "”");
    return sentRow(fr, strip(m[2]));
  }).join("");
}

const cards = [], left = [], thin = [];
const add = (key, f) => cards.push({ id: idFor(key), num: String(cards.length + 1), key, type: "frsound",
  fields: Object.assign({ Letters: "", Kind: "", Name: "", Rows: "", Says: "", Pairs: "", Examples: "" }, f) });

for (const [group, kind] of [["vowels", "vowel letters"], ["consonants", "consonant letters"]]) for (const r of T[group]) {
  const used = new Set(), rows = [];
  for (const row of r.rows) {
    let ex;
    if (row.sentences) ex = sentences(r.key, row.sentences);
    else {
      const ws = oneWord.filter((c) => !used.has(c) && shows(c, row)).slice(0, 3);
      if (!ws.length) { left.push(r.show + (row.when ? " — " + strip(row.when) : "")); continue; }
      if (ws.length < 3) thin.push(r.key + (row.when ? " [" + strip(row.when) + "]" : "") + " (" + ws.length + ")");
      ws.forEach((c) => used.add(c));
      ex = ws.map((c) => wordRow(c, row.rx)).join("");
    }
    rows.push('<div class="uc-sr">' + (row.when ? '<div class="uc-when">' + esc(row.when) + "</div>" : "")
      + '<div class="uc-ipa">' + esc(row.ipa) + '</div><div class="uc-like">' + row.eg + "</div>"
      + (row.also ? '<div class="uc-also">' + row.also + "</div>" : "")
      + '<div class="uc-rows">' + lab("as in") + ex + "</div></div>");
  }
  if (!rows.length) continue;
  add(r.key, { Letters: r.show, Kind: /^final:/.test(r.key) ? "French word endings" : /^nasal:/.test(r.key) ? "French vowel + n or m" : "French " + kind, Name: r.name || "", Rows: rows.join("") });
}
for (const r of T.rules) {
  if (!T.sources[r.src]) fail(r.key + " names no source");
  let ex = "";
  if (r.words) ex = lab(r.label || "as in") + r.words.map((w) => { const c = byHead.get(w); if (!c) fail(r.key + " names " + w + ", which DELF A1 does not card"); return wordRow(c, null); }).join("");
  if (r.sentences) ex = lab(r.label || "as in") + sentences(r.key, r.sentences);
  /* ROWS OF SPANS, NOT A TABLE: the deck sanitizer (`uDeckNormalize`) drops <table>, <tr> and <td>. */
  const pairs = !r.pairs ? "" : '<div class="uc-pairs">' + (r.heads ? '<div class="uc-pair uc-pairh">' + r.heads.map((h) => "<span>" + esc(h) + "</span>").join("") + "</div>" : "")
    + r.pairs.map((p) => '<div class="uc-pair">' + p.map((x) => "<span>" + esc(x) + "</span>").join("") + "</div>").join("") + "</div>";
  add(r.key, { Letters: r.show, Kind: r.kind, Name: r.name, Says: esc(r.says).replace(/&lt;(\/?b)&gt;/g, "<$1>"), Pairs: pairs, Examples: ex });
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
.uc-also {
  max-width: 30em;
  margin-top: 3px;
  font-size: 12.5px;
  line-height: 1.45;
  color: var(--ink-faint, #6C6A63);
}
.uc-like b, .uc-also b, .uc-rz b {
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
const type = { id: "frsound", name: "French sounds and spelling", speechLang: "fr-FR",
  fields: ["Letters", "Kind", "Name", "Rows", "Says", "Pairs", "Examples"],
  cards: [{ name: "Spelling → sound",
    front: '<div class="uc-ask">{{Kind}}</div><div class="uc-snd">{{Letters}}</div>',
    back: '{{FrontSide}}{{#Name}}<div class="uc-name">{{Name}}</div>{{/Name}}<hr>{{#Rows}}{{Rows}}{{/Rows}}'
      + '{{#Says}}<div class="uc-field">{{Says}}</div>{{/Says}}{{#Pairs}}{{Pairs}}{{/Pairs}}'
      + '{{#Examples}}<div class="uc-rows uc-alone">{{Examples}}</div>{{/Examples}}' }],
  css: CSS };

const n = cards.length, nV = cards.filter((c) => /^(vowel|nasal):/.test(c.key)).length, nC = cards.filter((c) => /^(letter|final):/.test(c.key)).length, nR = n - nV - nC;
const forms = a1.cards.flatMap((c) => c.fields.Word.split(", ").map((w) => bare(w).t));
const mark = forms.filter((w) => /[éèêëàâîïôùûç]/.test(w)).length;
const mute = oneWord.filter((c) => /[dpstxz]$/.test(bare(c.fields.Word).t) && !/[dpstxzk]\/$/.test(String(c.fields.Ipa).split(",")[0].trim())).length;
const srcOf = (k) => "“" + T.sources[k].title + "”, revision " + T.sources[k].revid + " of " + T.sources[k].timestamp.slice(0, 10);
const desc = "How French is read, before or beside the first word: " + n + " notes, one card each — " + nV + " vowel spellings (a, e, ai, au and eau, eu, i, o, oi, ou, u, y and the "
  + "nasal vowels an, en, in, on, un and oin), " + nC + " consonant spellings and word endings whose sound is not the English one (c, ch, g and gu, gn, h, j, -ill-, ph, qu, r, s between vowels, th, "
  + "ti before a vowel, x, the final consonants that are not said, -er and -ent), and " + nR + " rules: the five accents (é, è, ê, ë, ç), the ligature œ, elision (l', j', d'), liaison "
  + "(les‿amis), the mute and the aspirated h, and the space French puts before ? and !. The front shows the letters. The back gives, for each position the letters can stand in, the "
  + "sound in the International Phonetic Alphabet and the example words of the article it is taken from, then up to three words of the DELF A1 deck with a speaker beside each, the "
  + "letters picked out, and the pronunciation that word's own card prints. Say the word, then press the speaker and compare. Of DELF A1's " + a1.cards.length + " cards, " + mute
  + " are single words ending in a d, p, s, t, x or z that is not said, and " + mark + " of its " + forms.length + " headword forms carry an accent. THE ORDER is the vowels, the nasal vowels, the "
  + "consonants in alphabetical order, the word endings, then the rules. At Folio's default of ten new cards a day the deck takes " + Math.ceil(n / 10) + " days; it is meant to be studied "
  + "beside DELF A1, not finished first. — WHAT IS NOT HERE: no description is written for this deck and no English comparison is offered, the source giving none. Each position, sound "
  + "and set of examples is a row of the spelling-to-sound tables of the article named below, usually its major value, with a minor value or an exception quoted beneath where a "
  + "beginner meets it; each rule is a passage of the article named on its line, with a cut marked […]. A row is carded only where a one-word DELF A1 headword shows it, in spelling "
  + "and in the pronunciation its card prints, so the letters that sound as an English speaker expects (b, d, f, k, l, m, n, p, t, v, z) have no card. French stress has none either: "
  + "the articles do not treat it. The speaker is your device's French voice reading the example word, so a device without one is silent. — Spellings and sounds, the accents, œ and "
  + "the punctuation: Wikipedia, " + srcOf("A") + ". Liaison: " + srcOf("B") + ". Elision: " + srcOf("C") + ". The aspirated h: " + srcOf("D") + " (all CC BY-SA 4.0). Example words, "
  + "pronunciations and meanings: the DELF A1 deck on this shelf (English Wiktionary via kaikki.org, CC BY-SA 4.0; sentences from Tatoeba, CC BY 2.0 FR).";
const deck = { folioDeck: 1, exportedAt: STAMP_ISO, meta: { author: "", language: "en", glossMode: "site", version: 1, createdAt: STAMP, updatedAt: STAMP,
  forkedFrom: null, id: ID, title: "French — Sounds and spelling",
  subtitle: n + " spellings, silent letters, accents and liaison — start here, beside DELF A1", desc,
  tags: ["french", "pronunciation", "spelling", "alphabet"], types: { frsound: type } }, cards, gloss: {} };

if (REPORT) {
  console.log(FILE + "  (" + n + " notes: " + nV + " vowel, " + nC + " consonant and ending, " + nR + " rules)\n  " + deck.meta.subtitle);
  console.log("  rows left out, no A1 headword shows them: " + (left.join("; ") || "none"));
  console.log("  fewer than three example words: " + (thin.join(", ") || "none"));
  for (const c of cards) console.log("  " + c.key + ": " + [...(c.fields.Rows + c.fields.Examples).matchAll(/data-say="([^"]+)"/g)].map((m) => m[1]).join(", "));
  process.exit(0);
}
const p = path.join(DIR, FILE), text = JSON.stringify(deck), cur = fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
if (cur === text && !pinChanged) { console.log("  unchanged " + FILE + "  (" + n + " notes)"); if (CHECK) console.log("  ok    the French sounds deck is current"); process.exit(0); }
if (CHECK) { console.log("  STALE     " + FILE + "\n\n  FAIL  the deck is not what french-sounds.json and DELF A1 give — run without --check"); process.exit(1); }
fs.writeFileSync(p, text); console.log("  wrote     " + FILE + "  (" + n + " notes)");
if (pinChanged) { fs.writeFileSync(IDS, "{\n" + Object.keys(pin).map((k) => JSON.stringify(k) + ":" + JSON.stringify(pin[k])).join(",\n") + "\n}\n"); console.log("  french-ids.json: new rows written"); }
