#!/usr/bin/env node
/* Probable transcription slips in a shipped Library book, with NO DICTIONARY — by using the book as its
 * own dictionary: a word that occurs ONCE and is one known OCR confusion away from a word that occurs
 * MANY times is a candidate.  See docs/book-text-plan.md.
 *
 *   node .claude/book-scan.js <bookId> [RARE=1] [COMMON=4] [MINLEN=5]
 *   node .claude/book-scan.js --all            # one line per book, for sizing a pass
 *
 * A CANDIDATE IS EVIDENCE AND NEVER A VERDICT.  Every one still has to be read against the printed page
 * before it may become a `fixes` entry in .claude/fetch-book.js — that is the shelf's standing rule (a
 * correction asserts "the printed page reads X and this transcription reads Y"), and a scan cannot make
 * that assertion, only point at where to look.
 *
 * THE CONFUSION SET IS DELIBERATELY SHORT, and that is what makes the output readable.  A five-letter
 * word is one arbitrary letter from a dozen other real words, so an unrestricted substitution reports
 * mostly ordinary English — measured on the Art of War, 369 candidates of which almost none was a slip
 * (tie/the, hot/not, lot/not).  What a scanned letterpress page actually confuses is a short list of
 * SHAPES; restricting to it took the same book to 13.
 *
 * A DROPPED OR INSERTED LETTER IS DELIBERATELY NOT REACHED, for the same reason one notch stronger:
 * adding it took that book from 13 candidates back to 207, because a shortened word reaches every
 * shorter real word and a lengthened one every longer one.  The substitution scan is precise BECAUSE
 * the set is small; general edit distance is not, and a list nobody can read through is not evidence.
 */
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");

/* the confusions a scanned page actually makes: a letter read as a letter of the same shape, and a
   ligature or a pair of letters read as one */
const SUB = [["u","n"],["n","u"],["c","e"],["e","c"],["l","i"],["i","l"],["l","t"],["t","l"],["h","b"],["b","h"],
  ["f","t"],["t","f"],["o","c"],["c","o"],["g","q"],["q","g"],["y","v"],["v","y"],["s","8"],["r","i"],["i","r"],
  ["a","o"],["o","a"],["d","cl"],["m","n"],["n","m"]];
const PAIR = [["rn","m"],["m","rn"],["m","in"],["in","m"],["m","iu"],["iu","m"],["ni","m"],["cl","d"],["d","cl"],
  ["li","h"],["h","li"],["ii","n"],["n","ii"],["ri","n"],["vv","w"],["w","vv"],["tt","u"],["fi","n"],["rr","n"]];

const strip = (h) => String(h || "").replace(/<[^>]*>/g, " ").replace(/&[a-z]+;/g, " ");

function loadBook(id) {
  const win = { FOLIO_BOOKS_IN: [] };
  new Function("window", fs.readFileSync(path.join(root, "books", id + ".js"), "utf8"))(win);
  return win.FOLIO_BOOKS_IN[0];
}

function scan(id, RARE, COMMON, MINLEN) {
  const b = loadBook(id);
  const parts = [{ w: "intro", t: strip(b.intro) }];
  (b.chapters || []).forEach((c) => {
    parts.push({ w: (b.chapterWord || "ch") + " " + c.n, t: strip(c.t) + " " + strip(c.html) });
    (c.notes || []).forEach((nt, i) => parts.push({ w: (b.chapterWord || "ch") + " " + c.n + " n" + (i + 1), t: strip(nt) }));
  });
  const freq = new Map(), where = new Map();
  parts.forEach((p) => {
    let m; const R = /[A-Za-zâêîôûüŭǔàéè]{3,}/g;
    while ((m = R.exec(p.t))) {
      const w = m[0].toLowerCase();
      freq.set(w, (freq.get(w) || 0) + 1);
      if (!where.has(w)) where.set(w, { p: p.w, c: p.t.slice(Math.max(0, m.index - 42), m.index + m[0].length + 42).replace(/\s+/g, " ") });
    }
  });
  const out = [];
  for (const [w, n] of freq) {
    if (n > RARE || w.length < MINLEN) continue;
    const cand = new Set();
    SUB.forEach(([a, z]) => { let i = -1; while ((i = w.indexOf(a, i + 1)) >= 0) cand.add(w.slice(0, i) + z + w.slice(i + a.length)); });
    PAIR.forEach(([a, z]) => { let i = -1; while ((i = w.indexOf(a, i + 1)) >= 0) cand.add(w.slice(0, i) + z + w.slice(i + a.length)); });
    const hits = [...cand].filter((c) => (freq.get(c) || 0) >= COMMON).sort((a, z) => freq.get(z) - freq.get(a));
    if (hits.length) out.push({ w, n, all: hits.slice(0, 3), at: where.get(w) });
  }
  out.sort((a, z) => freq.get(z.all[0]) - freq.get(a.all[0]));
  return { freq, out };
}

const arg = process.argv[2];
if (!arg) { console.error("usage: node .claude/book-scan.js <bookId> | --all"); process.exit(1); }

if (arg === "--all") {
  const ids = fs.readdirSync(path.join(root, "books"))
    .filter((f) => /\.js$/.test(f) && f.split(".").length === 2)
    .map((f) => f.replace(/\.js$/, "")).sort();
  let tot = 0;
  ids.forEach((id) => {
    let r; try { r = scan(id, 1, 4, 5); } catch (e) { console.log(String(id).padEnd(28) + "  (unreadable: " + e.message + ")"); return; }
    tot += r.out.length;
    console.log(String(id).padEnd(28) + String(r.out.length).padStart(5) + " candidate(s)");
  });
  console.log("\n" + ids.length + " books, " + tot + " candidate(s) in all");
} else {
  const RARE = +(process.argv[3] || 1), COMMON = +(process.argv[4] || 4), MINLEN = +(process.argv[5] || 5);
  const { freq, out } = scan(arg, RARE, COMMON, MINLEN);
  console.log(arg + ": " + freq.size + " distinct words, " + out.length + " candidate slip(s)\n");
  out.forEach((o) => {
    console.log("  " + o.w + "  (x" + o.n + ")  →  " + o.all.map((h) => h + " x" + freq.get(h)).join(", "));
    console.log("      " + o.at.p + ":  …" + o.at.c + "…");
  });
}
