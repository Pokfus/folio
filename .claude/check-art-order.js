#!/usr/bin/env node
/* ============================================================================
   check-art-order.js — THE VISUAL ART RUNNING ORDER IS THE COLLECTION'S
   CHRONOLOGY, AND NOTHING ON THE PAGE SAYS WHEN IT TAKES A BACKWARD STEP.

     node .claude/check-art-order.js            report backward steps, exit 1 on any
     node .claude/check-art-order.js --list     print every line with the year read off it

   WHY IT EXISTS. `docs/art-card-plan.md` is a timeline: Ordered study deals a
   collection in the order its cards appear in the tree, which for a collection
   grown lowest-id first is the order of the ids — so the running order IS the
   chronological order, and a line moved out of date order is a card dealt out
   of date order. The plan has said so since it was written and the check was "by
   eye", which is exactly the kind of check that passes while a sweep quietly
   introduces thirty inversions. This is that check, mechanised.

   IT READS THE YEAR THE WAY THE LINES ARE WRITTEN, which is four shapes:
   `c. 73,000 years ago`, `c. 25,000 BCE`, `c. 150 CE` and a bare `1642`. A line
   whose year cannot be read is REPORTED rather than skipped — an unreadable year
   is a line nobody can place, which is a fault of its own.

   IT IS DELIBERATELY NOT IN THE CI FAST GATE. It checks one plan file, and the
   plan is edited by hand in batches; run it after any batch that moves a line.
   Not part of the site.
   ============================================================================ */
"use strict";
const fs = require("fs"), path = require("path");
const FILE = path.join(__dirname, "..", "docs", "art-card-plan.md");
const LIST = process.argv.includes("--list");

/* The year, as a signed number: negative BCE, positive CE, and "years ago"
   converted so the three scales compare. 1950 is the conventional present the
   "years ago" figures are quoted from; the constant cancels out of every
   comparison, so its exact value cannot change a verdict. */
function yearOf(text) {
  let m = text.match(/c\.\s*([\d,]+)\s*years ago/i);
  if (m) return 1950 - Number(m[1].replace(/,/g, ""));
  m = text.match(/([\d,]+)\s*BCE\s*$/) || text.match(/([\d,]+)\s*BCE\b/);
  if (m) return -Number(m[1].replace(/,/g, ""));
  m = text.match(/(\d{1,4})\s*CE\s*$/) || text.match(/(\d{1,4})\s*CE\b/);
  if (m) return Number(m[1]);
  const all = text.match(/\b(\d{3,4})\b\s*$/);
  if (all) return Number(all[1]);
  return null;
}

const lines = fs.readFileSync(FILE, "utf8").split("\n");
const rows = [];
for (const ln of lines) {
  const m = ln.match(/^    (art-\d{3,4})  (.*)$/);
  if (m) rows.push({ id: m[1], text: m[2], y: yearOf(m[2]) });
}

let bad = 0;
const unread = rows.filter((r) => r.y === null);
let prev = null;
for (const r of rows) {
  if (LIST) console.log(r.id, String(r.y).padStart(8), r.text);
  if (r.y === null) continue;
  if (prev && r.y < prev.y) {
    bad++;
    console.log("BACKWARD  " + prev.id + " (" + prev.y + ")  ->  " + r.id + " (" + r.y + ")");
    console.log("          " + prev.text);
    console.log("          " + r.text);
  }
  prev = r;
}
for (const r of unread) console.log("NO YEAR   " + r.id + "  " + r.text);
console.log("\n" + rows.length + " lines; " + bad + " backward steps; " + unread.length + " with no readable year.");
process.exit(bad || unread.length ? 1 : 0);
