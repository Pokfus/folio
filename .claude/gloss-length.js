#!/usr/bin/env node
/* gloss-length.js — how long every glossary description is, against the 100-word bar.
 *
 *   node .claude/gloss-length.js              the distribution + the standing
 *   node .claude/gloss-length.js --over       only the terms above the bar, longest first
 *   node .claude/gloss-length.js --under      only the terms below it, shortest first
 *   node .claude/gloss-length.js --tag=place  restrict to terms whose FIRST tag is this (a batch's scope)
 *   node .claude/gloss-length.js --list       every term, sorted by length
 *
 * The bar is 100 words ±10% — see docs/glossary-length-plan.md. Not part of the site.
 *
 * What is counted is the RENDERED PROSE, not the stored HTML: tags out, footnote markers out (a `<sup>`
 * carries no words but its digit would count as one), entities resolved. Counting the HTML would make a
 * term with three citations look longer than an identical one with none, which is the whole reason this
 * is a script and not a `wc -w`.
 */
"use strict";
const path = require("path");

const WANT = 100, MARGIN = 0.1;
const LO = Math.round(WANT * (1 - MARGIN)), HI = Math.round(WANT * (1 + MARGIN));

global.window = {};
require(path.join(__dirname, "..", "glossary.js"));
const G = global.window.GLOSSARY || {};
const TAGS = global.window.GLOSSARY_TAGS || {};

/* An IMPERIAL conversion does not count, exactly as it does not on a card — the identical pattern lives in
   add-card.js and add-questions.js, and the rule is written down in CLAUDE.md ("THE WORD LIMITS DO NOT
   COUNT A CONVERSION"). Without this the glossary would be held to a tighter PROSE budget than the cards
   purely because its terms carry more measurements: a country term states an area, sometimes a height and a
   length too, at three words of conversion each. The leading space goes with the parenthetical, or the
   stripped text leaves a stray token behind. */
const IMPERIAL_PAREN = /\s*\((?=[^)]*\d)[^)]*\b(?:miles?|foot|feet|ft|inch(?:es)?|in|yards?|pounds?|lbs?|ounces?|oz|tons?|acres?|sq\s?mi|°F)\b[^)]*\)/gi;
// the same order the popup renders in: markers first (they sit inside the prose), then tags, then entities
function words(html) {
  return String(html || "")
    .replace(/<sup\b[^>]*>[\s\S]*?<\/sup>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&[a-z]+;/gi, "x")          // an entity is one word's worth of glyph, not a gap
    .replace(IMPERIAL_PAREN, "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean).length;
}

const args = process.argv.slice(2);
const tagArg = (args.find((a) => a.startsWith("--tag=")) || "").slice(6).toLowerCase();
const only = args.includes("--over") ? "over" : args.includes("--under") ? "under" : args.includes("--list") ? "list" : "";

let rows = Object.keys(G).map((k) => ({ k, n: words(G[k]), tag: (TAGS[k] || [])[0] || "—" }));
if (tagArg) rows = rows.filter((r) => r.tag === tagArg);
rows.sort((a, b) => a.n - b.n || a.k.localeCompare(b.k));

const under = rows.filter((r) => r.n < LO);
const over = rows.filter((r) => r.n > HI);
const at = rows.length - under.length - over.length;

if (only === "over" || only === "under" || only === "list") {
  const list = only === "over" ? over.slice().reverse() : only === "under" ? under : rows;
  list.forEach((r) => console.log(String(r.n).padStart(4) + "  " + r.k + "  [" + r.tag + "]"));
  console.log("\n" + list.length + " term" + (list.length === 1 ? "" : "s"));
  process.exit(0);
}

const sum = rows.reduce((a, r) => a + r.n, 0);
console.log("Glossary description length — the bar is " + WANT + " words ±" + Math.round(MARGIN * 100) + "% (" + LO + "–" + HI + ")");
if (tagArg) console.log("scope: first tag = " + tagArg);
console.log("");
console.log("  terms      " + rows.length);
console.log("  at the bar " + at + "   (" + (rows.length ? Math.round((at / rows.length) * 100) : 0) + "%)");
console.log("  under      " + under.length);
console.log("  over       " + over.length);
if (rows.length) {
  console.log("  mean       " + (sum / rows.length).toFixed(1) + " words");
  console.log("  range      " + rows[0].n + " (" + rows[0].k + ") – " + rows[rows.length - 1].n + " (" + rows[rows.length - 1].k + ")");
}

// the distribution, in twenties — the shape is what says whether a pass is trimming or growing
const buckets = {};
rows.forEach((r) => { const b = Math.floor(r.n / 20) * 20; buckets[b] = (buckets[b] || 0) + 1; });
console.log("");
Object.keys(buckets).map(Number).sort((a, b) => a - b).forEach((b) => {
  const n = buckets[b];
  const bar = "#".repeat(Math.max(1, Math.round((n / rows.length) * 60)));
  console.log("  " + String(b).padStart(4) + "–" + String(b + 19).padEnd(4) + " " + String(n).padStart(4) + "  " + bar);
});

// …and per kind, which is how docs/glossary-length-plan.md cuts its batches
if (!tagArg) {
  const by = {};
  rows.forEach((r) => { (by[r.tag] = by[r.tag] || []).push(r); });
  console.log("\n  by kind (the first tag — a batch's scope)");
  Object.keys(by).sort((a, b) => by[b].length - by[a].length).forEach((t) => {
    const g = by[t];
    const need = g.filter((r) => r.n < LO || r.n > HI).length;
    if (g.length < 2 && !need) return;
    console.log("    " + t.padEnd(16) + String(g.length).padStart(4) + " terms, " + String(need).padStart(4) +
      " outside the bar, mean " + (g.reduce((a, r) => a + r.n, 0) / g.length).toFixed(0));
  });
}
console.log("\nSee docs/glossary-length-plan.md for the batches.");
