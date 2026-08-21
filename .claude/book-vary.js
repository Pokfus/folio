#!/usr/bin/env node
/* "Errors or INCONSISTENCIES": one name written two ways inside one book.  Fold every romanised-looking
 * form to a key that ignores case, hyphenation and the aspiration mark, and report each key the book
 * writes more than one way.  See docs/book-text-plan.md.
 *
 *   node .claude/book-vary.js <bookId>
 *   node .claude/book-vary.js --all
 *
 * UNLIKE THE SLIP SCAN THIS NEEDS NO CONFUSION TABLE — the book contradicts itself in plain sight, and
 * the only question is which spelling it uses most.  It is therefore the cheaper of the two and the one
 * to run first on a book whose romanisation is being converted at all: a `roman` entry written against
 * the majority spelling silently misses the minority one, and a name that reaches the reader half
 * converted is worse than one left alone.
 *
 * THE FOLD IS DELIBERATELY TOO AGGRESSIVE AND MUST NOT BE TIGHTENED.  It strips the turned comma, which
 * is PHONEMIC — so it collapses `Li Ch‘üan` (李筌) onto `P‘ang Chüan` (龐涓), and `chêng` (正) onto
 * `Chêng` (鄭) onto `Ch‘êng`.  Those are three different words and the tool says so anyway, because the
 * same strip is what catches the one real inconsistency it was written for (`Yao-ch‘ên` beside
 * `Yao-Ch‘ên`).  A group is EVIDENCE: read it, and expect most of them to be two genuinely different
 * names rather than one name written twice.
 */
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const strip = (h) => String(h || "").replace(/<[^>]*>/g, " ").replace(/&[a-z]+;/g, " ");

function groupsFor(id) {
  const win = { FOLIO_BOOKS_IN: [] };
  new Function("window", fs.readFileSync(path.join(root, "books", id + ".js"), "utf8"))(win);
  const b = win.FOLIO_BOOKS_IN[0];
  let text = strip(b.intro);
  (b.chapters || []).forEach((c) => {
    text += " " + strip(c.t) + " " + strip(c.html) + " " + (c.notes || []).map(strip).join(" ");
  });
  const forms = new Map();
  let m; const R = /\b[A-Za-z][A-Za-zâêîôûüŭǔ]*(?:[-‘’'][A-Za-zâêîôûüŭǔ]+)*\b/g;
  while ((m = R.exec(text))) {
    const w = m[0];
    if (!/[üêŭǔ]/.test(w) && !/[A-Z][a-z]*[-‘’]/.test(w)) continue;   // romanised-looking only
    forms.set(w, (forms.get(w) || 0) + 1);
  }
  const fold = (w) => w.toLowerCase().replace(/[-‘’']/g, "").replace(/ŭ/g, "u").replace(/ü/g, "u").replace(/ê/g, "e");
  const groups = new Map();
  for (const [w, n] of forms) { const k = fold(w); if (!groups.has(k)) groups.set(k, []); groups.get(k).push([w, n]); }
  return [...groups.values()].filter((g) => g.length > 1)
    .sort((a, z) => z.reduce((s, x) => s + x[1], 0) - a.reduce((s, x) => s + x[1], 0));
}

const arg = process.argv[2];
if (!arg) { console.error("usage: node .claude/book-vary.js <bookId> | --all"); process.exit(1); }

if (arg === "--all") {
  const ids = fs.readdirSync(path.join(root, "books"))
    .filter((f) => /\.js$/.test(f) && f.split(".").length === 2)
    .map((f) => f.replace(/\.js$/, "")).sort();
  let tot = 0;
  ids.forEach((id) => {
    let g; try { g = groupsFor(id); } catch (e) { console.log(String(id).padEnd(28) + "  (unreadable: " + e.message + ")"); return; }
    tot += g.length;
    console.log(String(id).padEnd(28) + String(g.length).padStart(5) + " variant group(s)");
  });
  console.log("\n" + ids.length + " books, " + tot + " group(s) in all");
} else {
  const out = groupsFor(arg);
  console.log(arg + ": " + out.length + " name(s) written more than one way");
  out.forEach((g) => {
    g.sort((a, z) => z[1] - a[1]);
    console.log("   " + g.map(([w, n]) => w + " x" + n).join("   |   "));
  });
}
