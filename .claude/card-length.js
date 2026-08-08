#!/usr/bin/env node
/* card-length.js — how long every card's background and question pool are, against the house bars.
 *
 *   node .claude/card-length.js                 the distribution + the standing
 *   node .claude/card-length.js --over          only the cards above a bar, longest first
 *   node .claude/card-length.js --under         only the cards below one, shortest first
 *   node .claude/card-length.js --questions     the question pool rather than the background
 *   node .claude/card-length.js --prefix=gr-    restrict to one collection (a batch's scope)
 *   node .claude/card-length.js --list          every card, sorted by length
 *
 * The bars are CLAUDE.md's: an abstract is about 300 words and always within 270–330; a question is one
 * sentence of about 28 words and always within 20–34. Not part of the site.
 *
 * WHY THIS EXISTS (2026-08-08). `add-card.js` enforces both bars, but only at ADD time — and every later
 * editing script writes prose without measuring it: `add-sources.js` merges a whole rewritten abstract,
 * `fix-field.js` does find-and-replace inside any field, `add-questions.js` writes the extras. So a card
 * can drift out of range in complete silence, which is exactly what `gr-208` did (264 words, six short).
 * The glossary has had `gloss-length.js` watching for this since the L-pass; the cards had nothing.
 * **Re-run after `add-sources.js`, `fix-field.js` and `add-questions.js`** — none of them measures.
 *
 * What is counted is the RENDERED PROSE, not the stored HTML: tags out, footnote markers out (a `<sup>`
 * carries no words but its digit would count as one), and an IMPERIAL CONVERSION does not count at all —
 * the identical pattern lives in add-card.js, add-questions.js and gloss-length.js, and the rule is
 * written down in CLAUDE.md ("THE WORD LIMITS DO NOT COUNT A CONVERSION"). Counting either would hold a
 * well-cited or carefully-converted card to a tighter prose budget than a bare one, which is the whole
 * reason this is a script and not a `wc -w`.
 */
"use strict";
const path = require("path");

const A_LO = 270, A_HI = 330;          // the background
const Q_LO = 20,  Q_HI = 34;           // one phrasing

global.window = {};
require(path.join(__dirname, "..", "data.js"));
const CARDS = global.window.CARD_DATA || [];

const IMPERIAL_PAREN = /\s*\((?=[^)]*\d)[^)]*\b(?:miles?|foot|feet|ft|inch(?:es)?|in|yards?|pounds?|lbs?|ounces?|oz|tons?|acres?|sq\s?mi|°F)\b[^)]*\)/gi;
const plain = (s) => String(s || "").replace(/<[^>]*>/g, " ").replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").trim();
const words = (s) => { const t = plain(String(s || "").replace(IMPERIAL_PAREN, "")); return t ? t.split(" ").length : 0; };

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const pfx = (argv.find((a) => a.startsWith("--prefix=")) || "").slice(9);
const QMODE = has("--questions");

const scope = CARDS.filter((c) => !pfx || String(c.id).startsWith(pfx));
if (!scope.length) { console.error("no cards match --prefix=" + pfx); process.exit(1); }

const lo = QMODE ? Q_LO : A_LO, hi = QMODE ? Q_HI : A_HI;

/* One row per measured unit: a card's background, or each phrasing in its pool. */
const rows = [];
for (const c of scope) {
  if (QMODE) {
    const pool = [c.question].concat(c.questions || []).filter((q) => q && String(q).trim());
    pool.forEach((q, i) => rows.push({ id: c.id + "#" + i, n: words(q), card: c.id }));
  } else {
    rows.push({ id: c.id, n: words(c.abstract), card: c.id });
  }
}

const over = rows.filter((r) => r.n > hi).sort((a, b) => b.n - a.n);
const under = rows.filter((r) => r.n < lo).sort((a, b) => a.n - b.n);
const show = (list) => list.forEach((r) => console.log("  " + String(r.n).padStart(4) + "  " + r.id +
  (r.n > hi ? "   +" + (r.n - hi) : "   " + (lo - r.n) + " short")));

if (has("--over"))  { console.log(""); show(over);  console.log("\n" + over.length + (over.length === 1 ? " item" : " items")); process.exit(0); }
if (has("--under")) { console.log(""); show(under); console.log("\n" + under.length + (under.length === 1 ? " item" : " items")); process.exit(0); }
if (has("--list"))  { console.log(""); rows.slice().sort((a, b) => b.n - a.n).forEach((r) => console.log("  " + String(r.n).padStart(4) + "  " + r.id)); process.exit(0); }

const what = QMODE ? "question" : "background";
console.log("\nCard " + what + " length — the bar is " + lo + "–" + hi + " words" + (pfx ? "  (--prefix=" + pfx + ")" : "") + "\n");
console.log("  " + rows.length + " " + what + (rows.length === 1 ? "" : "s") + " measured");
console.log("  " + (rows.length - over.length - under.length) + " inside the bar");
console.log("  " + over.length + " over, " + under.length + " under");
const mean = rows.reduce((a, r) => a + r.n, 0) / (rows.length || 1);
const ns = rows.map((r) => r.n).sort((a, b) => a - b);
console.log("  mean " + mean.toFixed(1) + " words, range " + ns[0] + "–" + ns[ns.length - 1] + "\n");

if (over.length)  { console.log("OVER THE BAR"); show(over); console.log(""); }
if (under.length) { console.log("UNDER THE BAR"); show(under); console.log(""); }
if (!over.length && !under.length) console.log("every " + what + " is inside the bar.\n");

/* a batch's own scope, so a collection can be worked one at a time */
if (!pfx) {
  const byPfx = {};
  rows.forEach((r) => { const p = r.card.replace(/\d+$/, ""); (byPfx[p] = byPfx[p] || []).push(r.n); });
  console.log("by collection");
  Object.keys(byPfx).sort().forEach((p) => {
    const v = byPfx[p], out = v.filter((n) => n > hi || n < lo).length;
    console.log("    " + p.padEnd(6) + String(v.length).padStart(5) + " " + what + "s, " + String(out).padStart(3) +
      " outside the bar, mean " + (v.reduce((a, b) => a + b, 0) / v.length).toFixed(0));
  });
  console.log("");
}
