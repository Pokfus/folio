#!/usr/bin/env node
// Regression test for the home page's daily-quote running order (app.js: quoteRunningOrder / QUOTE_ORDER).
//
//   node .claude/test-daily-quote.js
//
// The rule it guards: the same author never speaks two days in a row, and never more than twice in any
// seven days. That is a property of the ARRANGEMENT, not of any one day, so it can be broken silently —
// by adding quotes to QUOTES (a fifth Confucius line tightens the pool), or by "simplifying"
// quoteRunningOrder back into an array walk. This test simulates a run of days off the real order and
// checks every window in it, so either mistake fails here rather than on the live home page.
//
// No dependencies and no browser: the pieces are sliced out of app.js by text (the same trick the
// Playwright tests use), so they can't drift from what ships.
const fs = require("fs"), path = require("path");
const src = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");

function slice(startRe, endMark, what) {
  const m = startRe.exec(src);
  if (!m) throw new Error("could not find " + what + " in app.js");
  const end = src.indexOf(endMark, m.index);
  if (end < 0) throw new Error("could not find the end of " + what + " in app.js");
  return src.slice(m.index, end + endMark.length);
}

const code = [
  slice(/^  function hashStr\(/m, "\n  }", "hashStr"),
  slice(/^  function mulberry32\(/m, "\n  }", "mulberry32"),
  slice(/^  function seededShuffle\(/m, "\n  }", "seededShuffle"),
  // SHIPPED_QUOTES since Aug 2026: the live `QUOTES` is now that literal with the admin's overlay applied
  // over it (see quotesMerged), and it is the SHIPPED pool this test is about — the rule has to hold for
  // what every reader gets, before any one editor's local overlay is laid on top.
  slice(/^  const SHIPPED_QUOTES = \[/m, "\n  ];", "the shipped quote pool"),
  slice(/^  const DQ_WEEK = /m, "\n  }", "quoteRunningOrder"),
  "  const QUOTES = SHIPPED_QUOTES;",
  "  const QUOTE_ORDER = quoteRunningOrder(QUOTES);",
  "  return { QUOTES, QUOTE_ORDER };",
].join("\n");
const { QUOTES, QUOTE_ORDER } = new Function(code)();

const DAYS = 400;                       // twenty cycles of the current pool — enough to cross every wrap
const WEEK = 7, MAX_PER_WEEK = 2;
let pass = 0, fail = 0;
const ok = (cond, name, extra) => {
  if (cond) { pass++; console.log("ok    " + name + (extra ? "  " + extra : "")); }
  else { fail++; console.log("FAIL  " + name + (extra ? "  " + extra : "")); }
};

// the sequence a reader actually sees: the running order, repeated
const seen = [];
for (let d = 0; d < DAYS; d++) seen.push(QUOTES[QUOTE_ORDER[d % QUOTE_ORDER.length]]);

ok(QUOTE_ORDER.length === QUOTES.length, "the order seats every quote", QUOTES.length + " quotes");
ok(new Set(QUOTE_ORDER).size === QUOTES.length, "…each exactly once — no quote is dropped or doubled");
ok(QUOTE_ORDER.every((i) => Number.isInteger(i) && i >= 0 && i < QUOTES.length), "…and every seat is a real quote");

const runs = [];
for (let d = 1; d < DAYS; d++) if (seen[d].a === seen[d - 1].a) runs.push(d + " " + seen[d].a);
ok(!runs.length, "no author speaks two days in a row", runs.length ? runs.slice(0, 5).join(", ") : "");

const weeks = [];
for (let d = 0; d + WEEK <= DAYS; d++) {
  const tally = {};
  for (let k = d; k < d + WEEK; k++) tally[seen[k].a] = (tally[seen[k].a] || 0) + 1;
  Object.keys(tally).forEach((a) => { if (tally[a] > MAX_PER_WEEK) weeks.push("day " + d + ": " + a + " ×" + tally[a]); });
}
ok(!weeks.length, "no author appears more than twice in any seven days", weeks.length ? weeks.slice(0, 5).join(", ") : "");

// The pool has to stay SOLVABLE, which is a fact about the pool and not about the code: c lines by one
// author leave c gaps round the circle summing to n, and no three may fit inside a week, so every
// neighbouring pair of gaps must total at least 7 — c·7 ≤ 2n. Past that the rule cannot be obeyed by any
// arrangement, quoteRunningOrder falls back to its best attempt, and the two checks above start failing
// with no bug to find. This assertion is what says so out loud: thin that author out, or widen the pool.
const counts = {};
QUOTES.forEach((q) => { counts[q.a] = (counts[q.a] || 0) + 1; });
const top = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
ok(counts[top] <= Math.floor((QUOTES.length * MAX_PER_WEEK) / WEEK),
  "no author has more lines than the week rule can spread",
  top + " has " + counts[top] + " of " + QUOTES.length + ", ceiling is " + Math.floor((QUOTES.length * MAX_PER_WEEK) / WEEK));

// a quote still lasts exactly one day, and the cycle still shows them all
ok(new Set(seen.slice(0, QUOTES.length).map((q) => q.t)).size === QUOTES.length,
  "one full cycle shows every quote once");

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
