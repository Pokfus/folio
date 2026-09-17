#!/usr/bin/env node
/*
  add-truefalse.js — cite a True-or-False statement, or add a new one.

    node .claude/add-truefalse.js <batch.json> [--dry]

    { "cite": { "<the statement's exact q>": { "why": "<with <sup> markers>", "src": ["<Chicago note>", …] } },
      "add":  [ { "q": …, "a": true, "why": …, "cat": …, "src": [ … ] } ] }

  WHY A HELPER RATHER THAN AN EDIT. `truefalse.js` is the one content pool with no writer of its own, and
  it is about to gain a source per statement: a hand edit has nothing checking that a marker points at a
  citation that exists, that a citation ends in a URL, that a new statement is not already in the pool, or
  that the prose is British and metric-first — all four of which fail SILENTLY on the page. This runs
  `check-truefalse.js`'s own rules by running that script afterwards, and refuses to write until the whole
  batch validates: a half-applied batch leaves the pool in a state no file describes.

  A STATEMENT IS KEYED BY ITS OWN `q`, not by its index. The pool is a running order nothing addresses
  from outside — no reader's progress and no id points into it — but an index moves the moment a statement
  is inserted, and a batch written against yesterday's indices would cite the wrong statements in silence.

  ONE STATEMENT PER LINE, the shape the file was given in Sep 2026 so that a change to it can be reviewed.

  Zero dependencies. Not part of the site.
*/
"use strict";
const fs = require("fs"), path = require("path"), cp = require("child_process");
const ROOT = path.join(__dirname, "..");
const FILE = path.join(ROOT, "truefalse.js");
const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const batchPath = args.find((a) => !a.startsWith("--"));
const die = (m) => { console.error("ERROR: " + m); process.exit(1); };
if (!batchPath) die("usage: node .claude/add-truefalse.js <batch.json> [--dry]");

const src = fs.readFileSync(FILE, "utf8");
const MARK = "window.TRUEFALSE = [";
const i = src.indexOf(MARK);
if (i < 0) die("could not find `window.TRUEFALSE = [` in truefalse.js");
const end = src.lastIndexOf("];");
if (end < 0 || end < i) die("could not find the end of the TRUEFALSE array — is the `];` still there?");
const head = src.slice(0, i), foot = src.slice(end + 2);
let pool;
try { pool = JSON.parse("[" + src.slice(i + MARK.length, end) + "]"); }
catch (e) { die("truefalse.js does not parse as a JSON array: " + e.message); }

const batch = JSON.parse(fs.readFileSync(batchPath, "utf8"));
const byQ = new Map(pool.map((x, k) => [String(x.q), k]));
const errs = [];
const CATS = new Set(pool.map((x) => x.cat));

function checkSrc(where, why, list) {
  if (!Array.isArray(list) || !list.length) return errs.push(where + ": no `src` — a statement ships cited");
  list.forEach((s, k) => {
    // the same rule `add-sources.js` holds a card's citations to: the note carries a URL a reader can open.
    // Not "ends in one" — the house form puts the access label after it, and `linkifySrcItem` lifts that
    // label into a chip at render time.
    if (typeof s !== "string" || !/https?:\/\/[^\s<>"']+/.test(s)) errs.push(where + ": source " + (k + 1) + " carries no URL a reader can open");
  });
  const marks = [...String(why || "").matchAll(/<sup[^>]*data-fn="(\d+)"/g)].map((m) => +m[1]);
  if (!marks.length) errs.push(where + ": the explanation points at nothing — put a marker on the claim each source carries");
  marks.forEach((n) => { if (!(n >= 1 && n <= list.length)) errs.push(where + ": a marker points at source " + n + " and there are " + list.length); });
  list.forEach((s, k) => { if (marks.indexOf(k + 1) < 0) errs.push(where + ": source " + (k + 1) + " is cited by no marker"); });
}

const cite = batch.cite || {};
Object.keys(cite).forEach((q) => {
  const k = byQ.get(q);
  if (k === undefined) return errs.push("cite: no statement reads exactly “" + q.slice(0, 60) + "…”");
  const p = cite[q] || {};
  const why = p.why !== undefined ? p.why : pool[k].why;
  checkSrc("#" + k, why, p.src || pool[k].src);
});
(batch.add || []).forEach((n, k) => {
  const where = "add[" + k + "]";
  if (!n || typeof n.q !== "string" || !n.q.trim()) return errs.push(where + ": no statement");
  if (typeof n.a !== "boolean") errs.push(where + ": `a` must be true or false");
  if (typeof n.why !== "string" || !n.why.trim()) errs.push(where + ": no explanation");
  if (typeof n.cat !== "string" || !n.cat.trim()) errs.push(where + ": no category");
  else if (!CATS.has(n.cat)) console.log("note: “" + n.cat + "” is a NEW category — the reader is shown it, so make sure that is meant");
  if (byQ.has(n.q)) errs.push(where + ": the pool already carries this statement");
  checkSrc(where, n.why, n.src);
});
if (errs.length) { errs.forEach((e) => console.error("  " + e)); die(errs.length + " problem(s) — nothing written"); }

Object.keys(cite).forEach((q) => {
  const k = byQ.get(q), p = cite[q];
  if (p.why !== undefined) pool[k].why = p.why;
  if (p.src) pool[k].src = p.src;
  if (p.q !== undefined) pool[k].q = p.q;
});
(batch.add || []).forEach((n) => pool.push({ q: n.q, a: n.a, why: n.why, cat: n.cat, src: n.src }));

// …and the SEMICOLON comes back with the bracket. `foot` begins after `];`, so emitting a bare "]" drops
// it: the file still parses (ASI), and the next run's `lastIndexOf("];")` then finds nothing and reads the
// array as garbage. Found on the second run, which is the only thing that could find it.
const out = head + MARK + "\n" + pool.map((e) => JSON.stringify(e)).join(",\n") + "\n];" + foot;
if (DRY) { console.log("dry run: " + Object.keys(cite).length + " cited, " + (batch.add || []).length + " added"); process.exit(0); }
fs.writeFileSync(FILE, out);
try { const w = {}; new Function("window", fs.readFileSync(FILE, "utf8"))(w); if (!Array.isArray(w.TRUEFALSE)) throw new Error("no array"); }
catch (e) { die("truefalse.js no longer parses: " + e.message); }
console.log("cited " + Object.keys(cite).length + ", added " + (batch.add || []).length + " — pool is now " + pool.length);
// …and the pool's own checker has the last word, so a batch can never leave it in a state the checker refuses
const r = cp.spawnSync(process.execPath, [path.join(__dirname, "check-truefalse.js")], { stdio: "inherit" });
process.exit(r.status || 0);
