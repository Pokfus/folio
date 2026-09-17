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

   THREE OF THE OTHER SEVENTEEN WERE TRUNCATIONS AFTER ALL, AND THE EXPLANATION THAT COVERED THEM IS
   THE THING TO READ HERE (Sep 2026, batch E57). This header used to say the eleven VERSE findings
   were Griffith's own practice — "his last line often carries no stop" — which is a reasonable
   reading of a translator and was covering a dropped character: the 1896 printing of the Rigveda
   sets a full stop after hymn 8.84's last line. **A MISSING CHARACTER HAS NO FIRST WITNESS**, since
   the source is the thing under suspicion, so nothing here can be settled from the text in hand; it
   takes a SECOND transcription of the same translation, and for three of the seventeen one was free
   at Project Gutenberg or on archive.org. Repaired in E57: Aesop's moral, Machiavelli's chapter 25
   and Rigveda 8.84.

   THE ELEVEN THAT WERE LEFT ARE NOW SETTLED, AND WHAT SETTLED THEM IS TWO HABITS (Sep 2026, batch
   E58). **LOOK FOR THE WITNESS THE BOOK ALREADY CITES.** E57 left eight Rigveda hymns standing
   because the scan it used holds one part of the translation — true, and the answer was one block up
   in the same entry of `fetch-book.js`, whose `fixes` table names the Internet Archive's scan of the
   very second edition this text is of, in two volumes that between them hold the whole of it. Seven
   were a lost terminal stop, FIVE OF THEM ENDING ON A COMMA where the printing sets a full stop; one
   was not a lost character at all but a lost LINE, 6.75.19 being a two-line stanza carrying only its
   first; and a ninth finding in that book was a section HEADING, the word VALAKHILYA, that the
   transcription had appended to the hymn before the appendix it introduces.
   **AND WHERE THERE IS NO SECOND TRANSCRIPTION, READ THE PAGE.** E44's rule, and it costs two
   requests: fetch any leaf of the scan, read the printed number off its running head to get the
   offset, then fetch the leaf you want, at
   `archive.org/download/<id>/page/n<leaf>_w1600.jpg`. **The offset is not constant** — a plate
   between two leaves moves it, and the Chaucer's was 43 at page 187 and 47 at page 214. It answered
   all three remaining: the two Ramayana cantos set a full stop inside their closing quotation where
   two OCRs had read a comma, and page 218 of the Chaucer sets the Clerk's colophon in italic with a
   stop — **and answered a second fault three lines above it**, `waiL` for `wail.`, which is the
   argument for looking at the page rather than at one line of it.
   **A SCAN'S PUNCTUATION IS THE LEAST RELIABLE THING ON IT.** Three of these five were read as a
   comma by an OCR and set as a full stop by the printing, so a comma in a scan is not evidence of a
   comma in the book.

   WHAT IS LEFT IS THREE, all of them the Satyricon and all three correct: chapter 16's next chapter
   opens LOWERCASE and continues the sentence, and 68 and 69 end on a comma before direct speech that
   the next section opens with, which is a capital and so invisible to the lowercase test.

   **Ask what the NEXT chapter opens with**: a lowercase word means the division simply falls
   mid-sentence and nothing is lost. **A COMMA IS NOT AN ANSWER EITHER WAY** — two of the Satyricon's
   sections end on one and are right, and Machiavelli's chapter 25 ended on one and was wrong.

   IT EXITS 0 WHATEVER IT FINDS, like `check-twins.js` and `card-focus.js`. Its standing residue is
   the three above, read and recorded; a gate that goes red on a finding somebody has already read is
   a gate everybody learns to ignore. */
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
