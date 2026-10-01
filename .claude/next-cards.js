#!/usr/bin/env node
/* next-cards.js — the next unwritten cards of a collection, with their deck ids, read off its plan.
 *
 *   node .claude/next-cards.js <prefix> [n]        e.g.  node .claude/next-cards.js rm- 10
 *
 * Saves opening a card plan (they run to thousands of lines) just to find the next lines. A plan's
 * running order is lines like "    rm-501  Trajan's Parthian campaign" under a heading ending
 * "— `<deck id>`" (## for a flat deck, ### for a subdeck). It prints the first n ids not yet in
 * data.js, skipping any line marked DEFERRED. Zero dependencies. Not part of the site.
 */
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const prefix = process.argv[2], n = +(process.argv[3] || 10);
if (!prefix) { console.error("usage: node .claude/next-cards.js <prefix> [n]"); process.exit(1); }

const md = fs.readFileSync(path.join(ROOT, "CLAUDE.md"), "utf8");
const row = md.split("\n").find((l) => l.includes("| `" + prefix + "` |"));
const plan = row && (row.match(/`(docs\/[a-z0-9-]+\.md)`/) || [])[1];
if (!plan) { console.error("no plan for prefix " + prefix + " in CLAUDE.md's index table"); process.exit(1); }

global.window = {};
require(path.join(ROOT, "data.js"));
const have = new Set(window.CARD_DATA.map((c) => c.id));

let deck = null, out = [];
const esc = prefix.replace(/[-]/g, "\\-");
const line = new RegExp("^\\s+(" + esc + "\\d{3,4})\\s+(.+)$");
for (const l of fs.readFileSync(path.join(ROOT, plan), "utf8").split("\n")) {
  if (/^# The 2026-08-04 renumbering/.test(l)) break;
  const h = l.match(/^#{2,3} .*— `([a-z0-9-]+)`\s*$/);
  if (h) { deck = h[1]; continue; }
  const m = l.match(line);
  if (!m || have.has(m[1]) || /^DEFERRED\b/i.test(m[2])) continue;
  out.push(m[1] + "  [" + deck + "]  " + m[2].trim());
  if (out.length >= n) break;
}
console.log(plan + "\n" + (out.length ? out.join("\n") : "nothing left to write"));
