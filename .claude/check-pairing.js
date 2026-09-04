#!/usr/bin/env node
/* THE TWO COLUMNS, PAIRED THE WAY THE READER'S PAGE PAIRS THEM (Sep 2026, batch E44).
   Not part of the site.

       node .claude/check-pairing.js [bookId …]

   A Library book with an original-language column is drawn as ROWS, and a row is a claim the two
   editions themselves make: the section number by which any passage of the work is cited, kept as a
   `<span class="bk-n">` marker on both sides by the importer. Where one side has a section the other
   has not, the row is still drawn with that side empty — the honest rendering, and the shelf carries
   a hundred or so of them, every one recorded in its own book's entry.

   WHY THIS EXISTS. There was one book where it was not a hundred but 1,819, and nothing on the shelf
   could see it. Thucydides is the only work here whose two columns are read by DIFFERENT extractors —
   a Wikisource English against a Perseus TEI Greek — and each made a locally correct decision about
   the marker's sort key: the wiki rule wrote a bare `<span class="bk-n">34</span>`, and
   teiBookChapters writes `data-n` on every marker of every book it reads. app.js pairs on
   `parseInt(data-n ?? text)`, so the English offered the keys 1..146 and the Greek 100..14600, and the
   book paired 7 of its 1,826 sections — those seven being an English chapter number that happened to
   equal a Greek key, which is worse than an empty cell because it reads as a pairing.

   THE IMPORTER'S OWN RECONCILIATION REPORTED IT PERFECT, and that is the finding worth carrying: it
   compared the LABEL each column prints, and both print "34". A check that reads a different field
   from the one the reader's page reads is not a check. That one is fixed too, and it is per book and
   runs only when a book is rebuilt; this one is the shelf-wide question, asked of the files that
   actually shipped, in app.js's own terms.

   THE RULE IS SLICED OUT OF app.js BY TEXT, as every other checker here slices what it tests, so this
   cannot go on measuring a rule the page has stopped using. If the two lines below are not found the
   script says so and stops: a scanner quietly measuring the wrong thing is the exact fault it exists
   to catch.

   IT IS A MEASURE AND NOT A GATE — exit 0 whatever it finds. Most of what it reports is genuine
   difference between two independently edited texts and is recorded in the books' own entries; what
   it is for is the case where a whole book pairs on nothing. Read the totals, not the rows. */

const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const BOOKS = path.join(ROOT, "books");

/* ---- the pairing rule, read off app.js rather than remembered ---- */
const app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const READ_KEY = 'const v = parseInt(raw != null && raw !== "" ? raw : node.textContent, 10);';
const GUARD = "n = v >= 0 ? v : n;";
for (const [what, line] of [["the key", READ_KEY], ["the guard", GUARD]]) {
  if (!app.includes(line)) {
    console.error("app.js no longer contains " + what + " this script measures:\n  " + line +
      "\nbookSections has changed — re-read it and update this file before believing anything it says.");
    process.exit(0);
  }
}

/* The same two lines, over a marker in the source text rather than over a DOM node. `data-n` wins
   where it is present and non-empty; anything that does not parse to a number at or above zero is not
   a section number and continues the section already open, which is what the guard says — dropping it
   here has the same effect, since app.js splits at the marker and then merges the piece back into the
   section already open.
   `([^<]*)` FOR THE LABEL IS SAFE AND WAS MEASURED: all 62,573 markers on the shelf hold plain text
   inside a single span, so none is missed. A marker that ever carries markup would be invisible to
   this regex, which is why the figure is recorded rather than assumed. */
const MARK = /<span class="bk-n"([^>]*)>([^<]*)<\/span>/g;
function marks(html) {
  const out = [];
  let m;
  MARK.lastIndex = 0;
  while ((m = MARK.exec(html || ""))) {
    const dn = /data-n="([^"]*)"/.exec(m[1]);
    const v = parseInt(dn && dn[1] !== "" ? dn[1] : m[2], 10);
    if (v >= 0) out.push({ k: v, t: (m[2] || "").trim() || String(v) });
  }
  return out;
}

/* BOTH FILES ARE READ INTO ONE `window`, and the queue is what makes that necessary: a book file
   PUSHES onto `FOLIO_BOOKS_IN` rather than assigning a global, exactly as the i18n files do, so
   re-seeding the window between the two requires leaves each push in a window nobody is holding. */
function load(id, orig) {
  global.window = { FOLIO_BOOKS_IN: [], FOLIO_BOOK_ORIG_IN: [] };
  for (const f of [id + ".js", orig]) {
    const p = path.join(BOOKS, f);
    delete require.cache[require.resolve(p)];
    require(p);
  }
  return global.window;
}

const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const origs = fs.readdirSync(BOOKS).filter((f) => /^[a-z0-9-]+\.[a-z]{2,3}\.js$/.test(f)).sort();

let books = 0, withGaps = 0, withChGaps = 0, rows = 0, unpaired = 0, broken = [];
for (const f of origs) {
  const id = f.replace(/\.[a-z]{2,3}\.js$/, "");
  if (only.length && !only.includes(id)) continue;
  if (!fs.existsSync(path.join(BOOKS, id + ".js"))) { console.log("! " + id + " — no English column on the shelf"); continue; }
  const w = load(id, f);
  const en = w.FOLIO_BOOKS_IN[0], or = w.FOLIO_BOOK_ORIG_IN[0];
  if (!en || !or) { console.log("! " + id + " — one of the two files pushed nothing"); continue; }
  books++;

  const enBy = new Map(en.chapters.map((c) => [c.n, c]));
  /* CHAPTER-LEVEL PAIRING IS A DIFFERENT AND MUCH HEALTHIER QUESTION, and it is counted in BOTH
     directions or half of it is invisible: this walk runs over the ORIGINAL's chapters, so a chapter
     the English has and the original has not would never be reached at all. The Ramayana has three. */
  const orNums = new Set(or.chapters.map((c) => c.n));
  const noOr = en.chapters.filter((c) => !orNums.has(c.n)).map((c) => c.n);
  let paired = 0, enOnly = 0, orOnly = 0, noEn = [], lines = [];
  for (const oc of or.chapters) {
    const ec = enBy.get(oc.n);
    if (!ec) { noEn.push(oc.n); continue; }
    const A = marks(ec.html), B = marks(oc.html);
    const as = new Set(A.map((x) => x.k)), bs = new Set(B.map((x) => x.k));
    const p = A.filter((x) => bs.has(x.k)).length;
    const eo = A.filter((x) => !bs.has(x.k)), oo = B.filter((x) => !as.has(x.k));
    paired += p; enOnly += eo.length; orOnly += oo.length;
    if (eo.length || oo.length) {
      const fmt = (a) => a.slice(0, 8).map((x) => x.t).join(" ") + (a.length > 8 ? " …" : "");
      /* The chapter NAMED as the reader sees it, off the shipped record's own title — "Fitt 24",
         "Book III", "Letter 22". The word for a chapter lives in app.js's eager BOOKS registry and
         not in the generated file, and a report that says "chapter 24" of a poem divided into fitts
         is a report written from a different book than the one on screen. */
      lines.push("    " + (ec.t || "chapter " + oc.n) +
        (eo.length ? " — " + eo.length + " with no original (" + fmt(eo) + ")" : "") +
        (oo.length ? " — " + oo.length + " with no translation (" + fmt(oo) + ")" : ""));
    }
  }
  rows += paired + enOnly + orOnly;
  unpaired += enOnly + orOnly;
  /* A WHOLE BOOK PAIRING ON (ALMOST) NOTHING is the shape this exists for, and it is worth calling out
     rather than leaving to be read off a row count: a handful of unpaired sections is two editors
     dividing a text differently, and a book that pairs a tenth of its sections is a fault. */
  const total = paired + enOnly + orOnly;
  const bad = total > 20 && paired < total * 0.5;
  if (bad) broken.push(id + " (" + paired + " of " + total + ")");
  /* THE TWO GAPS ARE COUNTED APART, or the closing sentence is not true of either: a book may have
     every section pair and still be missing a whole chapter on one side (the Ramayana), and the
     hundred-odd recorded gaps are SECTIONS. */
  if (enOnly || orOnly) withGaps++;
  if (noEn.length || noOr.length) withChGaps++;
  if (enOnly || orOnly || noEn.length || noOr.length) {
    console.log((bad ? "!! " : " · ") + id + " — " + paired + " paired, " + enOnly +
      " English-only, " + orOnly + " original-only" +
      (noEn.length ? ", " + noEn.length + " whole chapters absent from the translation" : "") +
      (noOr.length ? ", " + noOr.length + " whole chapters absent from the original (" + noOr.join(" ") + ")" : ""));
    lines.slice(0, bad ? 3 : 40).forEach((l) => console.log(l));
    if (bad && lines.length > 3) console.log("    … and " + (lines.length - 3) + " more");
  }
}

const s = (n, one, many) => n + " " + (n === 1 ? one : many || one + "s");
console.log("\n" + s(books, "book") + " with an original column; " + s(rows, "row") + ", " + unpaired +
  " of them drawn with one side empty (" + (rows ? ((unpaired / rows) * 100).toFixed(1) : "0") + "%)");
/* WHAT THE SHELF'S OWN RESIDUE IS, said as history rather than as a guarantee: the hundred-odd gaps
   standing when this was written are each recorded in their book's entry, and a gap this reports
   tomorrow is not covered by that sentence. Read a new one before believing it is another. */
console.log(s(withGaps, "book") + " with at least one section that pairs to nothing; the 107 standing " +
  "in Sep 2026 are each recorded in that book's own entry in .claude/fetch-book.js — a NEW one is not");
console.log(s(withChGaps, "book") + " missing a WHOLE chapter on one side, which is the coarser and " +
  "much healthier question");
if (broken.length) {
  console.log("\n!! " + s(broken.length, "book") + " pairing fewer than half its sections, which is not " +
    "an editorial difference but a fault: " + broken.join(", "));
} else {
  console.log("no book pairs fewer than half its sections");
}
process.exit(0);
