#!/usr/bin/env node
/* .claude/test-book-quotes.js — the reader's quotation-mark pass (`bookQuotes` in app.js), in Node.

     node .claude/test-book-quotes.js            # the cases, then the whole shelf
     node .claude/test-book-quotes.js --shelf    # also print each book's leftovers

   Two parts. THE CASES are the rules, one line each. THE SHELF runs the function over every
   paragraph of every shipped book and holds it to the two things that must be true whatever the
   text: the result is exactly as long as the input (highlights are stored as offsets), and no
   straight mark is left. It also counts paragraphs whose curled double marks do not balance — a
   number to watch, not a failure: a speech that runs over several paragraphs opens each and
   closes only the last, in print as here.

   Re-run after touching `bookQuotes` or `bookQuoteTree`. Not part of the site. */
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const a = app.indexOf("/* <book-quotes> */"), b = app.indexOf("/* </book-quotes> */");
if (a < 0 || b < 0) { console.log("FAIL  the <book-quotes> block is gone from app.js"); process.exit(1); }
const bookQuotes = (0, eval)("(function(){" + app.slice(a, b) + "; return bookQuotes; })()");
let pass = 0, fail = 0;
const eq = (name, input, want) => { const got = bookQuotes(input); if (got === want) pass++; else { fail++; console.log("FAIL  " + name + "\n        in:   " + input + "\n        want: " + want + "\n        got:  " + got); } };

eq("a plain quotation", '"Go," he said, "and return."', "“Go,” he said, “and return.”");
eq("an apostrophe inside a word", "don't, the king's, Ch'in", "don’t, the king’s, Ch’in");
eq("a plural possessive", "the soldiers' tents", "the soldiers’ tents");
eq("single quotation marks", "He answered, 'I will go.'", "He answered, ‘I will go.’");
eq("a quotation inside a quotation", '"He said, \'No,\' and left."', "“He said, ‘No,’ and left.”");
eq("an elision opening a sentence", "'Tis true, and 'twas ever so.", "’Tis true, and ’twas ever so.");
eq("an elision inside single quotation marks", "'Tis true,' he said, ''tis so.'", "’Tis true,’ he said, ‘’tis so.’");
eq("'em and 'gainst", "give 'em leave 'gainst the wall", "give ’em leave ’gainst the wall");
eq("a year cut short", "the summer of '45", "the summer of ’45");
eq("a leading mark nothing closes is an elision", "the 'prentice lad and th' old man", "the ’prentice lad and th’ old man");
eq("a quotation after a dash", 'voyagers—"Are they pirates?"—as if', "voyagers—“Are they pirates?”—as if");
eq("a quotation broken off at a dash", '"I thought—" he began.', "“I thought—” he began.");
eq("a quotation in brackets", '(called "the Great")', "(called “the Great”)");
eq("a quotation opening the block", '"Sing, goddess."', "“Sing, goddess.”");
eq("a dialect opening quote with capitals", "'Friend,' said he, 'what news?'", "‘Friend,’ said he, ‘what news?’");
eq("marks set off by spaces are read by what is open", 'known as " instincts." We call them "species reflexes " since', "known as “ instincts.” We call them “species reflexes ” since");
eq("a table's ditto mark", '"', "”");
eq("already curled text is left alone", "“Go,” he said. ‘No.’ It’s done.", "“Go,” he said. ‘No.’ It’s done.");
eq("nothing to do", "Arma virumque cano.", "Arma virumque cano.");
eq("an Arabic ain written as an opening mark", "the house of 'Imran and 'Ali's sons'", "the house of ‘Imran and ‘Ali’s sons’");
console.log((fail ? "FAIL  " : "ok    ") + "the cases: " + pass + " passed, " + fail + " failed");

/* ---- the shelf ---- */
global.window = { FOLIO_BOOKS_IN: [], FOLIO_BOOK_ORIG_IN: [] };
const DIR = path.join(ROOT, "books");
for (const f of fs.readdirSync(DIR).filter((f) => /^[a-z0-9-]+\.js$/.test(f))) require(path.join(DIR, f));
const text = (h) => h.replace(/<sup\b[^>]*>[\s\S]*?<\/sup>/g, "").replace(/<span class="bk-n"[^>]*>[\s\S]*?<\/span>/g, "").replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
let paras = 0, changed = 0, lenBad = 0, left = 0, unbal = 0;
const perBook = [];
for (const bk of window.FOLIO_BOOKS_IN) {
  let bUn = 0, bP = 0;
  for (const c of bk.chapters) for (const h of [c.html].concat(c.notes || [])) for (const p of h.split(/<\/(?:p|li|td|th|h3|h4)>/)) {
    const t = text(p); if (!t.trim()) continue;
    paras++; bP++;
    const out = bookQuotes(t);
    if (out !== t) changed++;
    if (out.length !== t.length) lenBad++;
    if (/["']/.test(out)) left++;
    const o = (out.match(/“/g) || []).length, cl = (out.match(/”/g) || []).length;
    if (o !== cl && !(o === cl + 1)) { unbal++; bUn++; }
  }
  perBook.push([bk.id, bUn, bP]);
}
const ok = !lenBad && !left;
console.log((ok ? "ok    " : "FAIL  ") + "the shelf: " + paras + " blocks in " + window.FOLIO_BOOKS_IN.length + " books, " + changed + " changed; " + lenBad + " changed length, " + left + " left a straight mark");
console.log("      " + unbal + " block(s) whose double marks neither balance nor open a speech that runs on (" + (100 * unbal / paras).toFixed(2) + "%)");
if (process.argv.includes("--shelf")) perBook.filter((x) => x[1]).sort((x, y) => y[1] / y[2] - x[1] / x[2]).slice(0, 25).forEach((x) => console.log("        " + x[0].padEnd(34) + x[1] + " of " + x[2]));
process.exit(fail || !ok ? 1 : 0);
