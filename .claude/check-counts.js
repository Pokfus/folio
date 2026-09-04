/* .claude/check-counts.js — A BOOK'S OWN ACCOUNT OF ITSELF, CHECKED AGAINST ITSELF.
   node .claude/check-counts.js [--all]

   Every book on the shelf opens with front matter that COUNTS things: "124 letters", "614 questions",
   "102 of the 305 poems", "a prologue and forty-one numbered fitts". Those figures are written by hand,
   they are the first thing a reader is told about the book, and until Sep 2026 nothing had ever compared
   one of them to the file it describes.

   IT WAS WRITTEN BECAUSE A REPAIR DOES NOT TRAVEL TO THE PROSE THAT DESCRIBES IT (batch E49). Four
   batches — E38, E39, E40 and E41 — put 31 articles of the Summa back, taking it from 3,094 to 3,125,
   and none of them touched the sentence in its front matter that says "each of its 3,094 articles is a
   numbered section". Worse, the same front matter went on telling the reader that fourteen of its
   questions were missing an article heading and could not be cited from the page, which those same
   batches had made untrue. The text was mended and the book went on apologising for a defect it no
   longer had. Nothing else on the shelf could see it: every word is spelled correctly, every tag
   balances, the chapters are all there, and the sentence reads perfectly.

   IT IS A PROXY AND REPORTS EVIDENCE, NEVER A VERDICT, like card-focus.js and its three siblings here.
   A front matter counts many things that are not this book — Chambry's 359 Greek fables, the
   Franco-Italian Polo's 232 chapters, the 305 poems of which Legge translated 102 — so a bare list of
   every number would be 182 rows of mostly-correct prose that nobody reads twice.

   THE SIGNAL IS THE NEAR MISS. A figure that is FAR from the book's own count is nearly always about
   something else; a figure that is CLOSE and not equal is the signature of a count that was right once.
   3,094 against 3,125 is 1% out. So a claim is reported when it lands within NEAR of the chapter count
   or the section count (either column) without matching either.

   THE LEGITIMATE NEAR MISSES ARE DECLARED, WITH THE REASON, and a row excuses a claim only when the
   book, the CLAIMED number AND the actual count all still agree — so the day the file's count moves,
   the exemption stops applying and the claim is reported again. That is check-citations.js's
   CROSSREF_WRONG rule, and it is what keeps a declared exception from quietly covering a later fault.

   WHAT IT CANNOT SEE, STATED RATHER THAN LEFT TO BE DISCOVERED. It found ONE of the four things the
   batch that wrote it repaired.
     · It reads a number standing beside a NOUN, so a sentence that counts with a pronoun is invisible
       to it: Beowulf's front matter said the manuscript holds "a prologue and then forty-three of
       them, and those are the chapters here", where the tabs are a prologue and forty-one numbered
       fitts, and no pattern here matches "forty-three of them".
     · It counts DIVISIONS, and a front matter makes other kinds of claim about the book's condition.
       The Summa's went on stating that fourteen of its questions were missing an article heading and
       could not be cited from the page — as stale as the 3,094, and worse for a reader, since it
       describes a defect that four batches had removed. No count anywhere disagrees with that
       sentence, because it is not a count.
     · And a figure that is FAR from any count is passed over by design, so a front matter claiming
       twice or half what the book holds goes unreported. The near miss is the signal precisely
       because it is the shape a figure takes when it was right once.

   Exit 0 whatever it finds. Not part of the site. */

const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "books");
global.window = { FOLIO_BOOKS_IN: [], FOLIO_BOOK_ORIG_IN: [] };
fs.readdirSync(DIR).filter((f) => f.endsWith(".js")).sort().forEach((f) => require(path.join(DIR, f)));
const en = window.FOLIO_BOOKS_IN, or = window.FOLIO_BOOK_ORIG_IN;
const orById = Object.create(null); or.forEach((o) => (orById[o.id] = o));

const ALL = process.argv.includes("--all");

/* Within this fraction of a count, and not equal to it, a claim is worth a look.

   AND ONLY WHERE THE COUNT IS BIG ENOUGH FOR A NEAR MISS TO MEAN ANYTHING. A book with eight chapters
   mentions "seven books" legitimately, one with five mentions "four treatises", one with twenty-one
   mentions "the first twenty books" — at that scale the numbers in a book's prose and the number of
   its own divisions are the same order of magnitude, so proximity carries no information at all and
   the test is pure noise. Measured: the band below reports 22 books' worth of it without this floor
   and four books with it, of which two are real. A count of ZERO is dropped for the same reason —
   without that, every "two parts" in a book with no numbered sections is "within 3 of nought". */
const NEAR_FRAC = 0.08, MIN_COUNT = 40;

/* AND A FIGURE THE PROSE ITSELF HEDGES IS NOT A CLAIM TO CHECK. The Summa's own front matter says the
   work runs to "about 3,000 articles", which is true and is meant to be approximate; reporting it
   against 3,125 is reporting the book for rounding. */
const HEDGE = /\b(?:about|some|roughly|around|nearly|almost|over|under|more than|fewer than|at least|upwards of)\s*$/i;

/* A near miss that is the book being right about something else. Book, the number it CLAIMS, the
   number the file holds, and why. All three must still match for the row to apply. */
const KNOWN = [
  ["marco-polo", 232, 235,
   "Yule states the oldest Franco-Italian text's 232 chapters against his own 235, and says so"],
  ["ptahhotep", 46, 47,
   "section 32 is Gunn's own omission, so forty-six of the forty-seven carry the poem"],
  ["beowulf", 41, 42,
   "a prologue and forty-one numbered fitts make the forty-two tabs"],
  ["summa-theologica", 611, 614,
   "the five Parts hold 611 questions; the Appendix's three make the 614 tabs, and the sentence says so"],
];

const WORDS = { one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,
  thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19,twenty:20,thirty:30,
  forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90,hundred:100 };
function wordNum(s) {
  let cur = 0, any = false;
  for (const p of s.toLowerCase().replace(/-/g, " ").split(/\s+/).filter(Boolean)) {
    if (!(p in WORDS)) return null;
    any = true;
    cur = WORDS[p] === 100 ? (cur || 1) * 100 : cur + WORDS[p];
  }
  return any ? cur : null;
}

/* The nouns a book uses for its OWN divisions. Deliberately not every counting noun in the language:
   "3,182 lines" and "twelve thousand lines" are about the poem rather than about the file, and a book
   that states its length in lines is not making a claim this can check. */
const NOUN = "(chapters|books|letters|poems|hymns|questions|articles|fables|dialogues|tales|sections|" +
  "cantos|sonnets|plays|lives|essays|works|parts|volumes|odes|discourses|maxims|meditations|orations|" +
  "sermons|epistles|acts|treatises|fitts|sarga|sargas|kandas)";
const NUMW = "(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|" +
  "sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)";
const RX = new RegExp("(\\d[\\d,]*|" + NUMW + "(?:[- ]" + NUMW + ")*)" +
  "\\s+(?:of\\s+(?:the\\s+)?)?(?:[a-z'’-]+\\s+){0,3}?" + NOUN + "\\b", "gi");

function sections(b) {
  let n = 0;
  for (const c of b.chapters || []) n += (String(c.html).match(/class="bk-n"/g) || []).length;
  return n;
}
function near(n, k) { return k >= MIN_COUNT && n !== k && Math.abs(n - k) <= Math.max(1, k * NEAR_FRAC); }

let claims = 0, flagged = 0, excused = 0, books = 0;
const out = [];
for (const b of en) {
  const o = orById[b.id];
  const counts = [b.chapters.length, sections(b)];
  if (o) counts.push(o.chapters.length, sections(o));
  const near0 = counts.filter((c) => c > 0);                // a book with no numbered sections counts nothing
  const t = String(b.intro || "").replace(/<[^>]*>/g, " ").replace(/&[a-z]+;|&#\d+;/g, " ").replace(/\s+/g, " ");
  const hits = [];
  let m;
  RX.lastIndex = 0;
  while ((m = RX.exec(t))) {
    const n = /^\d/.test(m[1]) ? +m[1].replace(/,/g, "") : wordNum(m[1]);
    if (n == null) continue;
    claims++;
    if (counts.includes(n)) continue;                       // the book's own figure, stated correctly
    if (HEDGE.test(t.slice(Math.max(0, m.index - 24), m.index))) continue;   // "about 3,000 articles"
    const k = near0.filter((c) => near(n, c))[0];
    if (k == null) continue;                                // far off — a figure about something else
    const row = KNOWN.find((r) => r[0] === b.id && r[1] === n && r[2] === k);
    if (row) { excused++; if (ALL) hits.push({ ok: true, n: n, k: k, txt: m[0], why: row[3] }); continue; }
    flagged++;
    hits.push({ ok: false, n: n, k: k, txt: m[0], at: t.slice(Math.max(0, m.index - 90), m.index + 90) });
  }
  if (hits.length) {
    books++;
    out.push("== " + b.id + "   " + counts.join(" / ") + "  (chapters / sections" + (o ? " / original" : "") + ")");
    for (const h of hits)
      out.push(h.ok
        ? "     ok    " + JSON.stringify(h.txt) + " vs " + h.k + " — " + h.why
        : "     LOOK  " + JSON.stringify(h.txt) + " vs " + h.k + "\n           …" + h.at.replace(/\s+/g, " ") + "…");
  }
}
console.log(out.join("\n"));
console.log("\n" + claims + " counted claims in " + en.length + " books' front matter; " +
  flagged + " near a count without matching it" + (excused ? ", " + excused + " excused by a declared row" : "") +
  (flagged ? " — in " + books + " book(s)" : ""));
console.log(flagged ? "Read the finding before repairing it: a front matter counts many things that are not this book."
                    : "Every counted claim either matches a count this book holds or is plainly about something else.");
