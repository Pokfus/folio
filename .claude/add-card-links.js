#!/usr/bin/env node
/* add-card-links.js — write `card.why` and `card.leadsTo` onto cards that already exist.
 *
 *     node .claude/add-card-links.js <batch.json> [--dry]
 *
 *     { "cards": {
 *         "wh-014": { "why": [ { "q": "Why does an assemblage this old matter?", "a": "Because …" },
 *                              { "q": "…?", "a": "…" }, { "q": "…?", "a": "…" } ] },
 *         "wh-001": { "leadsTo": [ { "id": "wh-003", "how": "one led to the other because …" } ] }
 *     } }
 *
 * `why` is THREE questions with their own brief answers (Sep 2026, on request) — the retired single
 * `{ q, at }` shape is refused, with the migration named; see card-links.js.
 *
 * WHY THIS EXISTS. `add-card.js` only ever adds a WHOLE new card, and `add-sources.js` touches only
 * `sources` and the abstract. Without this the two fields could be set on nothing but a card written
 * after today, which on a corpus of 1,400 shipped cards makes both features permanently dormant.
 *
 * THE VALIDATION IS `card-links.js`, THE SAME MODULE `add-card.js` CALLS. Not a copy: this repo has the
 * scar of a batch tool that kept its own copy of a field list and silently stripped two fields from all
 * 500 cards in one run.
 *
 * IT SPLICES LINES RATHER THAN REWRITING THE FILE. `data.js` is one JSON object per line, and
 * re-serialising the whole array normalises every card's key order — semantically identical, and it
 * turns a three-card change into a 1,400-line diff nobody can review. Only the lines that change are
 * rewritten; every other byte of the file is left exactly as it was.
 *
 * THE WHOLE BATCH IS VALIDATED BEFORE ANYTHING IS WRITTEN. A half-applied batch is worse than a refused
 * one, for the reason `add-card-difficulty.js` gives.
 *
 * Zero dependencies. Not part of the site.
 */
"use strict";
const fs = require("fs"), path = require("path");
const { checkWhy, checkLeadsTo, loadCardYears, collectionIndex } = require("./card-links.js");

const ROOT = path.join(__dirname, "..");
const DATA = path.join(ROOT, "data.js");
const file = process.argv[2];
const DRY = process.argv.includes("--dry");
if (!file) { console.error("usage: node .claude/add-card-links.js <batch.json> [--dry]"); process.exit(1); }

const batch = JSON.parse(fs.readFileSync(file, "utf8"));
const want = batch.cards || {};
if (!Object.keys(want).length) { console.error("ERROR: batch has no `cards`."); process.exit(1); }

function loadWindow(f) { const win = {}; new Function("window", fs.readFileSync(f, "utf8"))(win); return win; }
const win = loadWindow(DATA);
const cards = win.CARD_DATA, tree = win.COLLECTION_TREE;
const byId = {}; for (const c of cards) byId[c.id] = c;
const collIdx = collectionIndex(tree);
const cardYears = loadCardYears(fs.readFileSync(path.join(ROOT, "app.js"), "utf8"));

// ---- validate the whole batch first
const errs = [];
const merged = {};
for (const id of Object.keys(want)) {
  const cur = byId[id];
  if (!cur) { errs.push(id + ": no such card"); continue; }
  const patch = want[id] || {};
  const keys = Object.keys(patch).filter((k) => k !== "why" && k !== "leadsTo");
  if (keys.length) { errs.push(id + ": this tool writes only `why` and `leadsTo` (got " + keys.join(", ") + ")"); continue; }
  // the card as it WOULD be, so the checks see the abstract and the sources it will actually have
  const next = Object.assign({}, cur);
  if ("why" in patch) { if (patch.why === null) delete next.why; else next.why = patch.why; }
  if ("leadsTo" in patch) { if (patch.leadsTo === null) delete next.leadsTo; else next.leadsTo = patch.leadsTo; }
  const e1 = checkWhy(next);
  if (e1) { errs.push(id + ": " + e1); continue; }
  const e2 = checkLeadsTo(next, { byId, cardYears, collectionOf: (cid) => collIdx[cid] || null });
  if (e2) { errs.push(id + ": " + e2); continue; }
  merged[id] = next;
}
if (errs.length) {
  console.error("ERROR: the batch was NOT applied — " + errs.length + " problem" + (errs.length === 1 ? "" : "s") + ":");
  errs.forEach((e) => console.error("  · " + e));
  process.exit(1);
}

// ---- splice the changed lines
let src = fs.readFileSync(DATA, "utf8");
const lines = src.split("\n");
let touched = 0;
for (let i = 0; i < lines.length; i++) {
  const raw = lines[i];
  const body = raw.replace(/,\s*$/, "");
  if (!body.startsWith("{")) continue;
  let obj;
  try { obj = JSON.parse(body); } catch (e) { continue; }
  if (!obj || !merged[obj.id]) continue;
  lines[i] = JSON.stringify(merged[obj.id]) + (raw.endsWith(",") ? "," : "");
  touched++;
}
if (touched !== Object.keys(merged).length) {
  console.error("ERROR: matched " + touched + " lines for " + Object.keys(merged).length +
    " cards — data.js is not one card per line as expected. Nothing written.");
  process.exit(1);
}
if (DRY) { console.log("dry run: " + touched + " card" + (touched === 1 ? "" : "s") + " would change"); process.exit(0); }
fs.writeFileSync(DATA, lines.join("\n"));
loadWindow(DATA);   // re-parse to confirm the written file is valid JS

const after = loadWindow(DATA).CARD_DATA;
const nWhy = after.filter((c) => c && c.why).length;
const nLeads = after.filter((c) => c && Array.isArray(c.leadsTo) && c.leadsTo.length).length;
console.log("wrote " + touched + " card" + (touched === 1 ? "" : "s") +
  " | corpus now: " + nWhy + " with a `why` prompt, " + nLeads + " with causal edges");
