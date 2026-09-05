#!/usr/bin/env node
/* A CHAPTER THAT STOPS RATHER THAN ENDS (Sep 2026, batch E43).
   Not part of the site.  Usage:  node .claude/check-cutoff.js [--verbose]

   THE TELL IS TERMINAL PUNCTUATION, and it is the only one there is. A truncated chapter is not
   short — the Summa's Supplement q.95 lost 1,123 words and still ran to 20 KB — and it is not
   ungrammatical, because every sentence but the last is whole. What it cannot be is properly ended:
   text that was cut off stops in the middle of a sentence, and a sentence that has stopped in the
   middle has no full stop at the end of it.

   NEITHER OF THE OTHER TWO STRUCTURAL SCANNERS CAN SEE THIS. `check-twins.js` asks whether a chapter
   is the WRONG chapter; `summa-witness.js` asks whether an article is missing from a question. A
   chapter that is the right chapter, correctly placed, and simply stops two thirds of the way
   through passes both — and passes every spelling sweep, since the words it does have are correct.

   WHAT IT FOUND ON ITS FIRST RUN: 22 chapters of 4,403, five of them the Summa's, and all five the
   SOURCE's truncation rather than the importer's — each wiki page itself stops where Folio stopped,
   mid-sentence, with the MediaWiki parser report following immediately. Three were missing only a
   full stop, one six words, and Supplement q.95 the rest of its last article's answer and all nine
   paragraphs after it. Repaired in E43 from Gutenberg and CCEL.

   THE OTHER SEVENTEEN ARE NOT TRUNCATIONS, AND THAT IS WORTH KNOWING BEFORE READING THIS REPORT
   AGAIN. Eleven are VERSE — nine hymns of the Rigveda and two cantos of the Ramayana — where
   Griffith's last line often carries no stop; three are the Satyricon, whose sections fall where
   they fall (chapter 16's next chapter opens LOWERCASE and continues the sentence, so nothing is
   missing at all); and Aesop's moral, Machiavelli's chapter 25 and a Canterbury colophon each want a
   page-image read to settle a single mark. **Ask what the NEXT chapter opens with**: a lowercase
   word means the division simply falls mid-sentence and nothing is lost.

   IT EXITS 0 WHATEVER IT FINDS, like `check-twins.js` and `card-focus.js`. Its standing residue is
   the seventeen above, read and recorded; a gate that goes red on a finding somebody has already
   read is a gate everybody learns to ignore. */
const fs = require("fs"), path = require("path");
const VERBOSE = process.argv.includes("--verbose");
const B = path.join(__dirname, "..", "books");
/* The closing marks a real sentence can end on, plus the furniture a chapter may legitimately end
   with: a dash, an ellipsis, a divider's asterisk, a closing quote or bracket of any nation. */
const ENDS = /[.!?:;…*—–-]\s*$|[»"'’”›)\]]\s*$/;
const MIN = 25;

const ids = fs.readdirSync(B)
  .filter((f) => /\.js$/.test(f) && !/\.[a-z]{2,3}\.js$/.test(f))
  .map((f) => f.replace(/\.js$/, "")).sort();
let tot = 0, hits = 0, books = 0;
for (const id of ids) {
  global.window = { FOLIO_BOOKS_IN: [], FOLIO_BOOK_ORIG_IN: [] };
  const f = path.join(B, id + ".js");
  delete require.cache[require.resolve(f)];
  require(f);
  const chs = ((window.FOLIO_BOOKS_IN[0] || {}).chapters) || [];
  const out = [];
  for (let i = 0; i < chs.length; i++) {
    const c = chs[i];
    tot++;
    const ps = c.html.split(/<\/p>/)
      .map((p) => p.replace(/<[^>]*>/g, " ").replace(/&#\d+;|&[a-z]+;/g, " ").replace(/\s+/g, " ").trim())
      .filter(Boolean);
    const last = ps[ps.length - 1] || "";
    /* A very short last block is a heading, a colophon or a divider rather than a sentence. */
    if (last.length < MIN || ENDS.test(last)) continue;
    const nx = chs[i + 1];
    const open = nx ? nx.html.replace(/<[^>]*>/g, " ").replace(/&#\d+;|&[a-z]+;/g, " ")
      .replace(/\s+/g, " ").trim() : "";
    out.push({ n: c.n, last, continues: /^[a-z]/.test(open) });
  }
  if (out.length) {
    books++; hits += out.length;
    console.log(id + "  (" + out.length + " of " + chs.length + ")");
    for (const o of out)
      console.log("   ch " + o.n + (o.continues ? "  [the next chapter continues it]" : "") +
        "\n      …" + o.last.slice(-92));
  } else if (VERBOSE) console.log(id + ": clean (" + chs.length + " chapters)");
}
console.log("\n" + ids.length + " books, " + tot + " chapters");
console.log(hits ? "  " + hits + " in " + books + " book(s) end without terminal punctuation"
                 : "  every chapter ends on a terminal mark");
process.exit(0);
