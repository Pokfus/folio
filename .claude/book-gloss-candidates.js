#!/usr/bin/env node
/* .claude/book-gloss-candidates.js — THE NAMES THE LIBRARY USES THAT THE GLOSSARY LACKS (Nov 2026, the Library audit).

     node .claude/book-gloss-candidates.js               # the shelf: the top 300
     node .claude/book-gloss-candidates.js --top=800
     node .claude/book-gloss-candidates.js --book=<id>   # what ONE book adds (what fetch-book runs for a new book)
     node .claude/book-gloss-candidates.js --json=<file>

   A reader taps a name in a book and the glossary answers — when it has the name. This lists the
   names it has not got, ranked by how much a reader would gain: a name counts for more the more
   BOOKS use it (a name in nine books is met by nine sets of readers), the more often, and — the
   strongest signal — where the CARDS use it too, since a term that cards and books both name and
   the glossary does not is a hole in the middle of the site.

   WHAT IS A NAME HERE: a capitalised word or run of words standing MID-SENTENCE (after a lower-case
   word), so a sentence's own first capital is never counted; joined by "of", "the", "de", "ibn"
   where both sides are capitalised ("Gulf of Corinth", "Philip of Macedon"). A possessive and a
   plural fold onto the name. What the glossary already answers is dropped: every key, title and
   alias, folded the same way.

   WHAT IT CANNOT DO: tell a person from a place, or two men of one name apart, or a translator's
   spelling from the modern one ("Mitylene" and "Mytilene" are two rows). The list is evidence for
   an editor; docs/library-glossary-candidates.md is the read and sorted version of one run.

   Not part of the site. Uses the dictionary on NODE_PATH when it is there (see book-spell.js) to
   drop capitalised common words; without it a built-in stop list does a rougher job. */

const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const args = process.argv.slice(2);
const arg = (k, d) => { const a = args.find((x) => x.startsWith("--" + k + "=")); return a ? a.slice(k.length + 3) : d; };
const TOP = +arg("top", 300), ONLY = arg("book", ""), JSON_OUT = arg("json", "");

let COMMON = null;
try { const scowl = require("wordlist-english"); COMMON = new Set(); for (const k of Object.keys(scowl)) { const t = +(k.split("/").pop()); if (t && t <= 60) for (const w of scowl[k]) if (w === w.toLowerCase()) COMMON.add(w); } } catch (e) {}
const STOP = new Set(("god gods lord lords king kings queen prince princes princess emperor empress sir lady madam father mother son daughter brother sister uncle master mistress heaven hell earth sun moon sea ocean river mount mountain lake island city temple church senate consul consuls tribune tribunes praetor dictator general captain duke earl count baron bishop archbishop pope saint st pharaoh majesty highness excellency grace " +
  "january february march april may june july august september october november december monday tuesday wednesday thursday friday saturday sunday spring summer autumn winter " +
  "north south east west northern southern eastern western book chapter part section volume vol note notes fig figure plate table preface introduction appendix " +
  "i o oh ah alas yea nay lo thou thee thy thine ye he she it we they his her their our your my mr mrs dr prof").split(" "));

const { loadGlossary } = require("./gloss-io.js");
const W = loadGlossary();
const fold = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’']s\b/g, "").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
const have = new Set();
for (const k of Object.keys(W.GLOSSARY)) { const t = k.replace(/_/g, " "); have.add(fold(t.replace(/\s*\([^)]*\)/g, ""))); have.add(fold(t)); if (t.includes(",")) have.add(fold(t.split(",")[0])); }   // "Thebes, Greece" answers "Thebes"
for (const k of Object.keys(W.GLOSSARY_TITLES || {})) have.add(fold(W.GLOSSARY_TITLES[k]));
for (const k of Object.keys(W.GLOSSARY_ALIASES || {})) for (const a of W.GLOSSARY_ALIASES[k] || []) have.add(fold(a));
const known = (f) => have.has(f) || have.has(f.replace(/s$/, "")) || have.has(f.replace(/es$/, "")) || have.has(f.replace(/ians?$/, "ia")) || have.has(f.replace(/ans?$/, "a")) || have.has(f + "s");

const app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const a0 = app.indexOf("\n  const BOOKS = ["), a1 = app.indexOf("\n  ];", a0);
const BOOKS = (0, eval)(app.slice(app.indexOf("[", a0), a1 + 4));
global.window = { FOLIO_BOOKS_IN: [], FOLIO_BOOK_ORIG_IN: [] };
for (const b of BOOKS) try { require(path.join(ROOT, "books", b.id + ".js")); } catch (e) {}
const plain = (h) => String(h || "").replace(/<sup\b[^>]*>[\s\S]*?<\/sup>/g, "").replace(/<span class="bk-n"[^>]*>[\s\S]*?<\/span>/g, " ").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ");

const NAME = /(?<=[a-z,;] )((?:[A-Z][a-zA-ZÀ-ɏ'’\-]{2,})(?: (?:of|the|de|del|della|von|van|al|ibn|bin|ben|ap|le|la) (?=[A-Z])| (?=[A-Z][a-z]))?(?:[A-Z][a-zA-ZÀ-ɏ'’\-]{2,})?(?: (?:of|the) (?=[A-Z])[A-Z][a-zA-ZÀ-ɏ'’\-]{2,})?)/g;
const T = new Map();     // fold -> { forms: {surface: n}, n, books: Map(id -> n), chapters }
for (const b of window.FOLIO_BOOKS_IN) {
  for (const c of b.chapters) {
    const x = plain(c.html); let m; NAME.lastIndex = 0;
    while ((m = NAME.exec(x))) {
      const s = m[1].replace(/[’']s$/, "").replace(/[’'\-]$/, "");
      if (/[’'](?:ll|d|ve|re|m|t)$/.test(s)) continue;                    // I'll, He'd
      const f = fold(s); if (f.length < 4) continue;
      let r = T.get(f); if (!r) T.set(f, r = { forms: {}, n: 0, books: new Map() });
      r.forms[s] = (r.forms[s] || 0) + 1; r.n++; r.books.set(b.id, (r.books.get(b.id) || 0) + 1);
    }
  }
}
/* the cards: how many name the term in their answer or their background */
const { loadCards } = require("./card-io.js");
const cl = loadCards(); const cards = cl.cards || cl;
const cardText = cards.map((c) => " " + fold((c.answer || "") + " " + String(c.abstract || "").replace(/<[^>]+>/g, " ")) + " ");

const rows = [];
for (const [f, r] of T) {
  if (known(f)) continue;
  const words = f.split(" ");
  if (words.length === 1 && (STOP.has(f) || (COMMON && COMMON.has(f)))) continue;
  if (words.every((w) => STOP.has(w) || (COMMON && COMMON.has(w)))) continue;
  if (words.length > 1 && known(words[words.length - 1]) && STOP.has(words[0])) continue;      // "King Darius" where Darius is answered
  const books = r.books.size;
  if (ONLY ? !r.books.has(ONLY) : (books < 2 && r.n < 25)) continue;
  rows.push({ f, r, books });
}
/* card counts only for what survives — a scan of 12,000 backgrounds per term is the slow part */
rows.sort((p, q) => q.books * 4 + Math.log2(q.r.n) - (p.books * 4 + Math.log2(p.r.n)));
const pool = rows.slice(0, Math.max(TOP * 4, 1500));
for (const x of pool) { const needle = " " + x.f + " "; let n = 0; for (const t of cardText) if (t.includes(needle)) n++; x.cards = n; }
const score = (x) => x.books * 3 + Math.log2(1 + x.r.n) * 1.5 + Math.min(40, x.cards) * 1.2 + (ONLY ? Math.log2(1 + (x.r.books.get(ONLY) || 0)) * 3 : 0);
pool.sort((p, q) => score(q) - score(p));
const top = pool.slice(0, TOP).map((x) => {
  const form = Object.entries(x.r.forms).sort((p, q) => q[1] - p[1])[0][0];
  const where = [...x.r.books].sort((p, q) => q[1] - p[1]).slice(0, 4).map(([id, n]) => id + "×" + n);
  return { term: form, books: x.books, mentions: x.r.n, cards: x.cards, where, score: +score(x).toFixed(1) };
});
if (JSON_OUT) fs.writeFileSync(JSON_OUT, JSON.stringify(top, null, 1));
console.log("term".padEnd(34) + "books".padStart(6) + "mentions".padStart(10) + "cards".padStart(7) + "   most in");
for (const t of top) console.log(t.term.slice(0, 33).padEnd(34) + String(t.books).padStart(6) + String(t.mentions).padStart(10) + String(t.cards).padStart(7) + "   " + t.where.join(", "));
console.log("\n" + rows.length + " name(s) the glossary does not answer" + (ONLY ? " in " + ONLY : " in two or more books (or 25 times in one)") + "; the top " + top.length + " shown." + (COMMON ? "" : " (No dictionary on NODE_PATH: capitalised common words are filtered by a short stop list only.)"));
