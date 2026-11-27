#!/usr/bin/env node
/* .claude/book-checks.js — EVERYTHING THE LIBRARY AUDIT ASKS OF A BOOK, IN ONE COMMAND (Nov 2026).

     node .claude/book-checks.js <bookId>          # what fetch-book.js runs by itself after it writes a book
     node .claude/book-checks.js <bookId> --fast   # skip the two slow ones (the twins scan, the browser sweep)
     node .claude/book-checks.js --all             # the whole shelf, gates only (what CI runs piecemeal)

   Asked for in Nov 2026: "Whenever a new book is added, ensure all these checks and processes are
   applied automatically and immediately upon addition." So `fetch-book.js` ends every English import
   by running this for the book it just wrote (`--no-checks` skips it), and the report below is the
   last thing on the screen. Nothing here is new work: it is the audit's own tools, run in the audit's
   own order, each printing only this book's part.

   TWO KINDS OF STEP, and the report keeps them apart:

     GATES — a contradiction or a broken form. The script exits 1 if one fails, and CI runs the same
       commands over the whole shelf (.github/workflows/checks.yml):
         1  check-library.js      the catalogue row, the importer's entry and the shipped file agree
         2  book-emend.js --check the emendations are applied; the house form holds
         3  book-audit.js         nothing a finished book cannot contain (report; fails on tag damage only)
         4  test-book-quotes.js   the quotation-mark pass leaves no straight mark and no changed length
         4b check-cards.js        every card that quotes the book still quotes its words

     EVIDENCE — candidates to be read, never a verdict. They never fail the run:
         5  book-spell.js         words no dictionary has, improbable pairs, line-break hyphens
         6  book-scan.js          a rare word one scan-confusion from a common one
         7  book-vary.js          one name written two ways
         8  check-cutoff.js       a chapter that stops rather than ends
         9  check-counts.js       the About essay's own figures against the file
        10  check-pairing.js      the two columns paired as the reader pairs them (a book with an original)
        11  check-twins.js        a chapter carrying another chapter's text            (slow)
        12  book-gloss-sweep.js   every glossary link the reader draws in it           (slow; needs Playwright)
        13  book-gloss-candidates.js --book   the names it uses that the glossary lacks
        14  find-card-quotes.js --book        the cards that could quote it

   WHAT TO DO WITH THE EVIDENCE is in docs/library-audit.md ("A new book"): a slip no printing can
   have meant goes in .claude/book-emend.json; a wrong link in .claude/book-gloss-off.json (or the
   row's `glossOff`); then `node .claude/book-emend.js --apply <id>` and this command again.

   The dictionary (5, 13) and Playwright (12) are reached through NODE_PATH and are optional: a step
   whose library is missing says so and is skipped, as the tools themselves do.

   Not part of the site. */

const fs = require("fs"), path = require("path"), cp = require("child_process");
const HERE = __dirname, ROOT = path.join(HERE, "..");
const args = process.argv.slice(2);
const ALL = args.includes("--all"), FAST = args.includes("--fast");
const id = args.find((a) => !a.startsWith("--"));
if (!ALL && !id) { console.log("usage: node .claude/book-checks.js <bookId> [--fast] | --all"); process.exit(0); }
if (id && !fs.existsSync(path.join(ROOT, "books", id + ".js"))) { console.log("book-checks: books/" + id + ".js does not exist."); process.exit(1); }

const run = (script, a, opts) => {
  const t0 = Date.now();
  const r = cp.spawnSync(process.execPath, [path.join(HERE, script)].concat(a || []), { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 28, env: process.env, timeout: (opts && opts.timeout) || 900000 });
  return { out: (r.stdout || "") + (r.stderr || ""), code: r.status == null ? 1 : r.status, ms: Date.now() - t0 };
};
/* this book's part of a whole-shelf report: from its heading line to the next heading or blank-then-heading */
const section = (out, heads) => {
  const L = out.split("\n"); const keep = []; let on = false;
  for (const l of L) {
    const isHead = heads.some((h) => h.test(l));
    if (isHead) on = l.includes(id);
    else if (on && /^\S/.test(l) && !/^\s/.test(l) && l.trim() && !l.startsWith(" ")) on = false;
    if (on) keep.push(l);
  }
  return keep.join("\n").trim();
};
const tail = (s, n) => { const L = s.trim().split("\n"); return L.length > n ? L.slice(0, n).join("\n") + "\n      … and " + (L.length - n) + " more line(s)" : L.join("\n"); };
let failed = 0; const summary = [];
const step = (n, name, kind, body, verdict) => {
  console.log("\n── " + String(n).padStart(2) + "  " + name + "  [" + kind + "]" + (verdict ? "  " + verdict : ""));
  if (body && body.trim()) console.log(body.replace(/^/gm, "    "));
  summary.push(String(n).padStart(2) + "  " + name.padEnd(30) + (verdict || ""));
};

if (ALL) {
  for (const [script, a] of [["check-library.js", []], ["book-emend.js", ["--check"]], ["test-book-quotes.js", []]]) {
    const r = run(script, a); console.log(tail(r.out, 30)); if (r.code) failed++;
  }
  process.exit(failed ? 1 : 0);
}

console.log("════ book-checks: " + id + " ════");
/* ---- gates ---- */
let r = run("check-library.js", [id]);
step(1, "check-library", "gate", r.code ? r.out : "", r.code ? "FAIL" : "ok"); if (r.code) failed++;
r = run("book-emend.js", ["--check"]);
{ const mine = r.out.split("\n").filter((l) => l.startsWith(id + ":") || l.startsWith(id + " ")).join("\n");
  step(2, "book-emend --check", "gate", mine, mine ? "FAIL" : "ok"); if (mine) failed++; }
r = run("book-audit.js");
{ const mine = section(r.out, [/^== /]); const tags = /TAGS/.test(mine);
  step(3, "book-audit", "gate", mine, mine ? (tags ? "FAIL (unbalanced tags)" : "findings to read") : "ok"); if (tags) failed++; }
r = run("test-book-quotes.js");
step(4, "test-book-quotes", "gate", r.code ? r.out : "", r.code ? "FAIL" : "ok"); if (r.code) failed++;
/* 4b — THE CARDS THAT QUOTE THIS BOOK STILL QUOTE IT. A `card.quote` is the book's words in a named section
   (check-cards.js compares them); an emendation inside a quoted passage, or a re-cut chapter, leaves the card
   saying something the book no longer does. The first run of the audit's emendations broke seventeen. */
r = run("check-cards.js");
{ const blk = (/FAIL: quote-not-verbatim[^\n]*\n((?:  .*\n)*)/.exec(r.out) || [, ""])[1];
  const ids = [...blk.matchAll(/^  ([a-z0-9]+-\d+)\b.*$/gm)].map((m) => [m[1], m[0].trim()]);
  let mine = [];
  if (ids.length) { const { loadCards } = require("./card-io.js"); const cs = loadCards().cards; mine = ids.filter(([cid]) => { const c = cs.find((x) => x.id === cid); return c && c.quote && c.quote.book === id; }).map((x) => x[1]); }
  step("4b", "card quotations of this book", "gate", mine.join("\n") + (mine.length ? "\nGive each card the book's corrected words: node .claude/add-card-quotes.js <batch.json> --replace" : ""), mine.length ? "FAIL" : "ok"); if (mine.length) failed++; }
/* ---- evidence ---- */
r = run("book-spell.js", [id, "--max=60"]);
step(5, "book-spell", "evidence", tail(r.out, 90), /Skipped/.test(r.out) ? "skipped (no dictionary on NODE_PATH)" : (/— (\d+) word/.exec(r.out) || [])[1] + " word(s), " + ((/, (\d+) improbable/.exec(r.out) || [])[1] || 0) + " pair(s), " + ((/, (\d+) line-break/.exec(r.out) || [])[1] || 0) + " hyphen(s)");
r = run("book-scan.js", [id]);
step(6, "book-scan", "evidence", tail(r.out, 40), (r.out.match(/candidate/g) || []).length ? "" : "");
r = run("book-vary.js", [id]);
step(7, "book-vary", "evidence", tail(r.out, 40));
r = run("check-cutoff.js");
{ const mine = section(r.out, [/^\S.*\(\d+ of \d+\)\s*$/]); step(8, "check-cutoff", "evidence", tail(mine, 30), mine ? "chapters to look at" : "nothing"); }
r = run("check-counts.js");
{ const mine = section(r.out, [/^== /]); step(9, "check-counts", "evidence", mine, mine ? "a figure to look at" : "nothing"); }
r = run("check-pairing.js", [id]);
step(10, "check-pairing", "evidence", tail(r.out, 25));
if (FAST) { step(11, "check-twins", "evidence", "", "skipped (--fast)"); step(12, "book-gloss-sweep", "evidence", "", "skipped (--fast)"); }
else {
  r = run("check-twins.js");
  { const mine = section(r.out, [/^\S.*\(\d+ chapters\)\s*$/]); step(11, "check-twins", "evidence", mine, mine ? "chapters sharing text" : "nothing (" + Math.round(r.ms / 1000) + " s)"); }
  r = run("book-gloss-sweep.js", [id], { timeout: 1800000 });
  { const skipped = /not on NODE_PATH/.test(r.out); const wrong = /WRONG/.test(r.out);
    step(12, "book-gloss-sweep", "evidence", tail(r.out, 120), skipped ? "skipped (no Playwright on NODE_PATH)" : wrong ? "LINKS THE DATE RULE CALLS WRONG — the rule in app.js should have removed them" : "read the list"); if (wrong) failed++; }
}
r = run("book-gloss-candidates.js", ["--book=" + id, "--top=40"]);
step(13, "book-gloss-candidates", "evidence", tail(r.out, 45));
r = run("find-card-quotes.js", ["--book=" + id]);
step(14, "find-card-quotes", "evidence", tail(r.out, 45));

console.log("\n════ " + id + ": " + (failed ? failed + " GATE(S) FAILED" : "every gate passes") + " ════\n" + summary.join("\n"));
console.log("\nNext: read the evidence. A slip no printing can have meant → .claude/book-emend.json; a wrong link → .claude/book-gloss-off.json;\nthen `node .claude/book-emend.js --apply " + id + "` and this command again. docs/library-audit.md, \"A new book\".");
process.exit(failed ? 1 : 0);
