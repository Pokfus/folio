#!/usr/bin/env node
/* A CHAPTER CARRYING ANOTHER CHAPTER'S TEXT, OVER THE WHOLE SHELF (Sep 2026, batch E42).
   Not part of the site.  Usage:  node .claude/check-twins.js [--verbose]

   WHY IT EXISTS. E38 found the Summa shipping two chapters byte-identical, with a whole question of
   Aquinas gone; E40 found a second pair the same way. Both were found by the cheapest check in
   `summa-witness.js` — the one that needs no second transcription at all — and that check had been
   pointed at ONE of the shelf's forty-eight books. This is it, pointed at all of them.

   WHAT IT CAN SEE THAT NOTHING ELSE CAN. A spelling sweep reads what is there; `book-audit.js` asks
   whether what is there belongs; `check-style.js` checks conventions. **None of them can tell that a
   chapter is the wrong chapter**, because the wrong chapter is perfectly good prose. What gives it
   away is that the same prose stands somewhere else in the same book — and that is a fact about the
   BOOK rather than about any sentence in it.

   IT COMPARES SHINGLES, NOT VOCABULARY. Two chapters of one work share their author's whole
   vocabulary, so a bag-of-words test scores every pair high and finds nothing. Runs of eight words
   are shared only where the text really is the same, which is also why a shared formula does not
   trip it: Aquinas closes 54 articles with the same sentence and no pair of them comes near the bar.

   THE BAR IS HALF THE SHORTER CHAPTER'S RUNS, deliberately low. A partial paste — the shape E36
   found INSIDE the Summa's chapters and which nothing had looked for BETWEEN them — leaves no exact
   match at all, so an equality test would miss it; at half, a chapter that has swallowed its
   neighbour still shows. Measured over the shelf the bar costs nothing: at 50% it reports the same
   single pair that byte-equality does, so there is no band of near-misses to wade through.

   RESULT WHEN IT WAS WRITTEN: 4,397 chapters compared pairwise within their books, ONE pair —
   Aesop's fable 122, "The Old Lion", carrying fable 121's text because Wikisource's page for it
   transcludes the wrong part of a scan page holding three fables. Repaired in E42; the shelf now
   reports none.

   IT EXITS 0 WHATEVER IT FINDS, like `card-focus.js` and `summa-witness.js`: it is a measure, and a
   gate that goes red on a finding somebody has read and recorded is a gate everybody learns to
   ignore. Read the figure. */
const fs = require("fs"), path = require("path");
const VERBOSE = process.argv.includes("--verbose");
const B = path.join(__dirname, "..", "books");
const BAR = 0.5, RUN = 8, MIN = 12;

function shingles(t) {
  const w = t.toLowerCase().match(/[a-zà-ÿ']+/g) || [];
  const s = new Set();
  for (let i = 0; i + RUN <= w.length; i++) s.add(w.slice(i, i + RUN).join(" "));
  return s;
}
const ids = fs.readdirSync(B)
  .filter((f) => /\.js$/.test(f) && !/\.[a-z]{2,3}\.js$/.test(f))
  .map((f) => f.replace(/\.js$/, "")).sort();

let tot = 0, skipped = 0, pairs = 0, books = 0;
for (const id of ids) {
  global.window = { FOLIO_BOOKS_IN: [], FOLIO_BOOK_ORIG_IN: [] };
  const f = path.join(B, id + ".js");
  delete require.cache[require.resolve(f)];
  require(f);
  const chs = ((window.FOLIO_BOOKS_IN[0] || {}).chapters) || [];
  /* A chapter too short to have twelve eight-word runs cannot be judged this way and is counted as
     skipped rather than passed — a one-line fable and a two-line chorus are real chapters. */
  const recs = [];
  for (const c of chs) {
    const s = shingles(c.html.replace(/<[^>]*>/g, " "));
    if (s.size < MIN) { skipped++; continue; }
    recs.push({ n: c.n, t: String(c.t || ""), s });
  }
  tot += recs.length;
  const out = [];
  for (let i = 0; i < recs.length; i++) for (let j = i + 1; j < recs.length; j++) {
    const A = recs[i].s, C = recs[j].s;
    const small = A.size <= C.size ? A : C, big = A.size <= C.size ? C : A;
    let n = 0; for (const x of small) if (big.has(x)) n++;
    const cover = n / small.size;
    if (cover >= BAR) out.push({ a: recs[i], b: recs[j], cover });
  }
  if (out.length) {
    books++; pairs += out.length;
    console.log(id + "  (" + chs.length + " chapters)");
    for (const o of out.sort((x, y) => y.cover - x.cover))
      console.log("   " + (o.cover * 100).toFixed(0) + "% shared  chapters " + o.a.n + " and " + o.b.n +
        "\n      " + o.a.t.slice(0, 66) + "\n      " + o.b.t.slice(0, 66));
  } else if (VERBOSE) console.log(id + ": clean (" + recs.length + " chapters)");
}
console.log("\n" + ids.length + " books, " + tot + " chapters compared pairwise within their book" +
  (skipped ? ", " + skipped + " too short to judge" : ""));
console.log(pairs ? "  " + pairs + " pair(s) in " + books + " book(s) share half their eight-word runs"
                  : "  no chapter carries another chapter's text");
process.exit(0);
