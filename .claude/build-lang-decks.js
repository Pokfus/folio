#!/usr/bin/env node
/*
  build-lang-decks.js — writes `lang-decks.js`, the EAGER catalogue of the language decks in `decks/`.

    node .claude/build-lang-decks.js

  WHY A CATALOGUE EXISTS AT ALL.  The decks in `decks/` are 181 MB across 44 files and nothing on the
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
  `French-Phrases`, `Italian-Core-Vocabulary`, `Mandarin-Idioms` — so a rule about position would drop
  three of them; what every one of them does carry is the language's own name somewhere in it.  Matching
  TWO languages is an error too: a deck the catalogue could file under either is a deck nobody would
  find twice.

  IT CARRIES THE SUBDECK TREE and not merely a count of one, so the page can draw a deck's own decks
  as a curated collection draws its subdecks.  A node's count is CARDS rather than notes, for the reason
  the deck's own count is.

  IT CARRIES A CONTENT REVISION, `rev`, AND THAT IS WHAT LETS A DOWNLOADED DECK BE UPDATED (Sep 2026,
  on a bug report that a card repaired weeks earlier still read the old pinyin).  A deck file is fetched
  once and written to IndexedDB, and `langDeckDownload` returns early for a deck already mounted — so
  before this every content repair reached only readers who had not yet downloaded the deck.  `rev` is
  the first 12 hex of a SHA-256 over the deck's CARDS and GLOSSARY, canonically keyed, and deliberately
  NOT over the file's bytes: `exportedAt`, key order and whitespace all move without a word changing,
  and a row that says "update available" when nothing has changed is one a reader learns to ignore.
  The site compares it against the copy it holds; see `langDeckStale` in app.js.

  THE ORDER IS THE ORDER THE ROWS ARE DRAWN IN, and it is by NATIVE SPEAKERS and then by the level the
  exam itself names, because a learner reads a ladder from the bottom.  A deck that is not a level
  (phrases, a core vocabulary) sorts last within its language, that being where a learner reaches it.
*/
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const ROOT = path.join(__dirname, "..");
const DIR = path.join(ROOT, "decks");
const OUT = path.join(ROOT, "lang-decks.js");

/* The languages a deck may be filed under. The `word` is what is looked for in the file name; `name` is
   what a reader is shown. Adding a language is one row plus its deck files.

   `l1` IS FIRST-LANGUAGE SPEAKERS IN MILLIONS, and it is what the languages are ORDERED by (Aug 2026,
   on request: "Order the language decks by number of native speakers"). It is a rounded published
   figure rather than a precise one — the sources differ by a few million and nothing here turns on the
   difference, since all it decides is which banner is drawn above which. NATIVE speakers, deliberately:
   counting second-language speakers would put Indonesian, which perhaps forty million people grow up
   with and two hundred million use, above four of the languages above it, and a shelf ordered on a
   figure nobody can check reads as no order at all. */
const LANGS = [
  { word: "Mandarin", name: "Mandarin Chinese", l1: 941 },
  { word: "Spanish", name: "Spanish", l1: 486 },
  { word: "Portuguese", name: "Portuguese", l1: 236 },
  { word: "German", name: "German", l1: 76 },
  { word: "French", name: "French", l1: 74 },
  { word: "Italian", name: "Italian", l1: 65 },
  { word: "Indonesian", name: "Indonesian", l1: 43 },
];
const L1 = {};
LANGS.forEach((L) => { L1[L.name] = L.l1; });

/* A level inside a language, lowest first. Anything unmatched sorts after every level — a phrase book is
   not a rung on the ladder and a learner meets it once the words are in hand. */
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
function levelRank(title) {
  const m = /\b([ABC][12])\b/.exec(title);
  if (m) return LEVELS.indexOf(m[1]);
  const u = /\bUKBI (\d)\b/.exec(title);          // Indonesian's own seven predicates, numbered from the bottom
  if (u) return Number(u[1]) - 1;
  /* THE LEVEL IS TESTED BEFORE THE STANDARD, and the order is load-bearing: every Mandarin title reads
     "HSK 3.0 Level N", so a rule that looks for the standard first ranks all seven of them on the 3 and
     the shelf falls back to sorting them alphabetically — Level 1, Level 2, Levels 7–9, Level 3. */
  const l = /\bLevels? (\d)\b/.exec(title);
  if (l) return Number(l[1]) - 1;
  const h = /\bHSK (\d)\b/.exec(title);
  if (h) return Number(h[1]) - 1;
  return 90;
}

/* A GITIGNORED DECK FILE IS SKIPPED, and that is not tidiness: a combined file (`All-Languages`,
   `French-A1-C2`, the five per-language ones) is an ARTEFACT of the decks it combines, regenerable
   and deliberately uncommitted — so it is present on the machine that built it and absent on the
   deployed site. Catalogued, it would be a row whose Add fetches a 404 for every reader but one,
   and `test-lang-decks.js` asserts no catalogued deck is gitignored. The names are read out of
   `.gitignore` rather than guessed at from a pattern, since "combined" is not a shape a file name
   carries. */
const IGNORED = new Set(
  fs.readFileSync(path.join(ROOT, ".gitignore"), "utf8").split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.indexOf("decks/") === 0 && l.endsWith(".folio-deck.json"))
    .map((l) => l.slice("decks/".length))
);
const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".folio-deck.json") && !IGNORED.has(f)).sort();
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
  // the content revision — see the header. Keys are sorted at every level so that a re-serialisation
  // that moves them cannot move the hash, and nothing outside `cards` and `gloss` is in it.
  const canon = (v) => Array.isArray(v) ? v.map(canon)
    : (v && typeof v === "object") ? Object.keys(v).sort().reduce((o, k) => (o[k] = canon(v[k]), o), {}) : v;
  const rev = crypto.createHash("sha256")
    .update(JSON.stringify(canon({ cards: d.cards || [], gloss: d.gloss || {} }))).digest("hex").slice(0, 12);
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
  /* THE SUBDECK TREE, so the Collections page can draw a deck's own decks the way a curated
     collection draws its subdecks (Aug 2026, on request: "when I open the Mandarin Chinese collection,
     I should see the 9 decks inside it, and any subdecks if there are"). It was a COUNT, which is all a
     one-line row needed and which a fold cannot draw anything from.

     A path nests on `::`, exactly as `card.sub` does in app.js, and a node's count is the CARDS its
     whole subtree holds rather than the notes — the figure the deck row above it has always shown, so
     a parent and its children cannot come to disagree about what a card is. A node is created for every
     PREFIX of a path a card names, so an intermediate level exists exactly when something sits under
     it — the tree app.js derives at study time, taken here at build time from the same paths. */
  const tree = [];
  const at = (path) => {
    const parts = path.split("::");
    let list = tree, node = null;
    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      node = list.find((x) => x.n === name);
      if (!node) { node = { n: name, c: 0, k: [] }; list.push(node); }
      list = node.k;
    }
    return node;
  };
  for (const c of (d.cards || [])) {
    const sub = String(c.sub || "");
    if (!sub) continue;
    const mult = (c.type && tpl[c.type]) ? tpl[c.type] : 1;
    const parts = sub.split("::");
    for (let i = 0; i < parts.length; i++) at(parts.slice(0, i + 1).join("::")).c += mult;
  }
  const prune = (list) => list.map((x) => (x.k.length ? { n: x.n, c: x.c, k: prune(x.k) } : { n: x.n, c: x.c }));
  /* UNWRAP: whether the Collections page draws this deck's own top-level subdecks as the LANGUAGE's decks
     rather than drawing the deck and folding them inside it (Aug 2026, on request: "The Mandarin Chinese
     collection should only contain its nine subdecks, not the combined folder … i.e. unwrap them", and
     "for indonesian, unwrap 'Indonesian Phrases and Expressions'").

     THE TEST IS WHETHER THE TOP LEVEL IS A DIRECTION PAIR, and it is a heuristic on the TITLES because
     nothing else in a deck file distinguishes the two cases: a subdeck is a `sub` string either way, and
     the arrow is the only thing that says one of them means "the same words asked the other way round"
     rather than "a different part of the syllabus". A direction pair must stay wrapped — unwrapped, the
     Spanish shelf would be seven identical pairs of "Spanish → English" rows with nothing to say which
     level each belongs to.

     WHAT IT CATCHES IS THREE DECKS AND NOT THE TWO THE REQUEST NAMES: Mandarin's nine levels, Indonesian's
     three phrase groups, and — by the same rule — Portuguese's Expressions and Proverbs. That third one is
     the rule doing exactly what it says rather than an oversight, and is recorded here so it is not later
     read as one. */
  const flat = tree.length > 0 && !tree.some((n) => n.n.indexOf("\u2192") >= 0);
  rows.push({
    lang: hits[0].name, file: f, id: m.id, title: m.title, sub: m.subtitle || "",
    notes: notes, cards: cards, subs: tree.length, tree: prune(tree), flat: flat, bytes: bytes, rev: rev, rank: levelRank(m.title),
  });
}

/* Languages by native speakers, most first; a language's own decks by the level the exam itself
   names, because a learner reads a ladder from the bottom. */
rows.sort((a, b) => (a.lang === b.lang ? (a.rank - b.rank || a.title.localeCompare(b.title))
                                       : (L1[b.lang] - L1[a.lang] || a.lang.localeCompare(b.lang))));

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
    (r.tree.length ? ", tree: " + s(r.tree) : "") + (r.flat ? ", flat: true" : "") +
    ", bytes: " + r.bytes + ", rev: " + s(r.rev) + " },\n";
}
out += "];\n";
fs.writeFileSync(OUT, out);

const byLang = {};
rows.forEach((r) => { byLang[r.lang] = (byLang[r.lang] || 0) + 1; });
console.log("lang-decks.js: " + rows.length + " decks, " + Object.keys(byLang).length + " languages, " +
  Math.round(fs.statSync(OUT).size / 1024) + " KB");
Object.keys(byLang).sort().forEach((k) => console.log("  " + k + ": " + byLang[k]));
