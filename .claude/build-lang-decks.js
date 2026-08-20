#!/usr/bin/env node
/*
  build-lang-decks.js — writes `lang-decks.js`, the EAGER catalogue of the language decks in `decks/`.

    node .claude/build-lang-decks.js

  WHY A CATALOGUE EXISTS AT ALL.  The decks in `decks/` are 119 MB across 38 files and nothing on the
  site linked to one until Aug 2026 ("ensure that all our language collections are visible on the
  Collections page in their own Languages section").  A section that listed them by FETCHING them would
  cost a reader the whole shelf to draw a list, so what ships is the metadata — a title, a subtitle, a
  card count and a size, a few hundred bytes each — and the file itself is fetched only when somebody
  presses Add.  It is the Library's own arrangement: `BOOKS` is eager so the shelf can paint and a
  book's text is lazy.

  IT IS GENERATED, NEVER HAND-EDITED.  Every figure here is read off the deck file it describes, so a
  rebuilt deck cannot come to disagree with the row that offers it — which is the failure this shape is
  chosen to prevent, and it would be silent: a row claiming 500 words over a deck that now holds 700
  looks exactly like a row.

  THE LANGUAGE IS MATCHED FROM THE FILE NAME AGAINST A DECLARED LIST, AND AN UNMATCHED FILE IS AN ERROR
  rather than a file quietly left out.  The names do not follow one pattern — `DELE-A1-Spanish`,
  `French-Phrases`, `Italian-Core-Vocabulary`, `Mandarin-Chinese` — so a rule about position would drop
  three of them; what every one of them does carry is the language's own name somewhere in it.  Matching
  TWO languages is an error too: a deck the catalogue could file under either is a deck nobody would
  find twice.

  THE ORDER IS THE ORDER THE ROWS ARE DRAWN IN, and it is by language and then by the level the exam
  itself names, because a learner reads a ladder from the bottom.  A deck that is not a level (phrases,
  a core vocabulary) sorts last within its language, that being where a learner reaches it.
*/
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const DIR = path.join(ROOT, "decks");
const OUT = path.join(ROOT, "lang-decks.js");

/* The languages a deck may be filed under. The `word` is what is looked for in the file name; `name` is
   what a reader is shown. Adding a language is one row plus its deck files. */
const LANGS = [
  { word: "Mandarin", name: "Mandarin Chinese" },
  { word: "French", name: "French" },
  { word: "German", name: "German" },
  { word: "Indonesian", name: "Indonesian" },
  { word: "Italian", name: "Italian" },
  { word: "Portuguese", name: "Portuguese" },
  { word: "Spanish", name: "Spanish" },
];

/* A level inside a language, lowest first. Anything unmatched sorts after every level — a phrase book is
   not a rung on the ladder and a learner meets it once the words are in hand. */
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
function levelRank(title) {
  const m = /\b([ABC][12])\b/.exec(title);
  if (m) return LEVELS.indexOf(m[1]);
  const u = /\bUKBI (\d)\b/.exec(title);          // Indonesian's own seven predicates, numbered from the bottom
  if (u) return Number(u[1]) - 1;
  const h = /\bHSK (\d)\b/.exec(title);
  if (h) return Number(h[1]) - 1;
  return 90;
}

const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".folio-deck.json")).sort();
if (!files.length) { console.error("no deck files in decks/"); process.exit(1); }

const rows = [];
for (const f of files) {
  const hits = LANGS.filter((L) => f.indexOf(L.word) >= 0);
  if (hits.length !== 1) {
    console.error("! " + f + " matches " + hits.length + " languages (" + hits.map((h) => h.word).join(", ") + ") — add a row to LANGS or rename the file");
    process.exit(1);
  }
  const bytes = fs.statSync(path.join(DIR, f)).size;
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const m = d.meta || {};
  if (!m.id || !m.title) { console.error("! " + f + " has no meta.id or meta.title"); process.exit(1); }
  const notes = (d.cards || []).length;
  /* CARDS, NOT NOTES. A deck asks a word both ways from ONE note by giving its type two templates, so a
     count of rows is half what the reader will study — and the DELE decks do it the other way, one note
     per direction, so the two figures coincide there. Counting templates is what makes the two shapes
     comparable, and it is what every count on the site already means by "cards". */
  const tpl = {};
  const types = m.types || {};
  Object.keys(types).forEach((k) => { tpl[k] = Math.max(1, ((types[k] || {}).cards || []).length || 1); });
  let cards = 0;
  for (const c of (d.cards || [])) cards += (c.type && tpl[c.type]) ? tpl[c.type] : 1;
  const subs = new Set((d.cards || []).map((c) => String(c.sub || "").split("::")[0]).filter(Boolean));
  rows.push({
    lang: hits[0].name, file: f, id: m.id, title: m.title, sub: m.subtitle || "",
    notes: notes, cards: cards, subs: subs.size, bytes: bytes, rank: levelRank(m.title),
  });
}

rows.sort((a, b) => (a.lang === b.lang ? (a.rank - b.rank || a.title.localeCompare(b.title)) : a.lang.localeCompare(b.lang)));

const s = (v) => JSON.stringify(v);
let out = "/* lang-decks.js — the catalogue of the language decks in decks/, GENERATED by\n" +
  "   .claude/build-lang-decks.js. Never hand-edited: every figure is read off the deck file it\n" +
  "   describes, so a rebuilt deck cannot come to disagree with the row that offers it.\n" +
  "   Metadata only — a few hundred bytes a deck — so the Collections page can paint its Languages\n" +
  "   section without fetching " + Math.round(rows.reduce((n, r) => n + r.bytes, 0) / 1048576) + " MB of decks. The file itself is fetched on Add. */\n" +
  "window.LANG_DECKS = [\n";
for (const r of rows) {
  out += "  { lang: " + s(r.lang) + ", file: " + s(r.file) + ", id: " + s(r.id) +
    ", title: " + s(r.title) + ", sub: " + s(r.sub) +
    ", notes: " + r.notes + ", cards: " + r.cards + (r.subs ? ", subs: " + r.subs : "") +
    ", bytes: " + r.bytes + " },\n";
}
out += "];\n";
fs.writeFileSync(OUT, out);

const byLang = {};
rows.forEach((r) => { byLang[r.lang] = (byLang[r.lang] || 0) + 1; });
console.log("lang-decks.js: " + rows.length + " decks, " + Object.keys(byLang).length + " languages, " +
  Math.round(fs.statSync(OUT).size / 1024) + " KB");
Object.keys(byLang).sort().forEach((k) => console.log("  " + k + ": " + byLang[k]));
