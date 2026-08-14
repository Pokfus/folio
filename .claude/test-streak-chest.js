#!/usr/bin/env node
// Regression test for the weekly streak chest (app.js: bumpStreak / maybeStreakChest / streakChestProgress).
//
//   node .claude/test-streak-chest.js
//
// WHAT IT GUARDS, and why it needs a test of its own rather than an assertion tacked onto a browser suite:
// a chest is earned on the SEVENTH day of a run and every seventh day after, which is a property of a
// SEQUENCE OF DAYS. No single-session browser test can walk one — it would have to study on fourteen
// separate days — and every way this can be wrong is silent, because a chest that is not granted looks
// exactly like a chest that has not been earned yet.
//
// THE FAULT IT WAS WRITTEN FOR is the one this shape invites. `S.streakChest` records the COUNT the last
// chest was paid at rather than a date, which is what makes it idempotent against an undo or a second
// grade on the same day — and it therefore has to be CLEARED when the streak breaks, or a reader who
// reached seven, missed a day, and climbed back to seven finds their length already recorded and earns
// nothing. They are then paid normally at fourteen, so the loss is one chest, once, on a schedule nobody
// would ever reconstruct from the outside. Verified by reverting that one line: this file goes red.
//
// No dependencies and no browser: the two functions are sliced out of app.js by text (the trick the other
// no-browser tests use), so they cannot drift from what ships.
const fs = require("fs"), path = require("path");
const src = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");

// pull a named function out whole, by matching its braces
function grab(name) {
  const i = src.indexOf("function " + name + "(");
  if (i < 0) throw new Error("cannot find " + name + " in app.js — has it been renamed?");
  let depth = 0;
  for (let k = src.indexOf("{", i); k < src.length; k++) {
    if (src[k] === "{") depth++;
    else if (src[k] === "}") { depth--; if (!depth) return src.slice(i, k + 1); }
  }
  throw new Error("unbalanced braces reading " + name);
}

const everyM = /const STREAK_CHEST_EVERY = (\d+)/.exec(src);
if (!everyM) throw new Error("cannot find STREAK_CHEST_EVERY in app.js");
const EVERY = +everyM[1];

/* `Date` is passed in as well as the clock helpers: bumpStreak asks `Date.now()` for what yesterday was,
   so without stubbing it every simulated day reads as a break and the streak never passes 1 — which is
   what the first run of this reported, and is a fault in the harness rather than in the code. */
const make = new Function(
  "S", "dayKey", "DAY", "todayStr", "grantChest", "toast", "STREAK_CHEST_EVERY", "Date",
  grab("bumpStreak") + "\n" + grab("maybeStreakChest") + "\n" + grab("streakChestProgress") +
  "\nreturn { bumpStreak: bumpStreak, streakChestProgress: streakChestProgress };"
);

const DAY = 86400000;

/* Walk a pattern of days — 1 = studied, 0 = did not — and report what the reader ends up holding.
   The clock is a local `now` the stubs read, so a "day" is exactly one step of the pattern. */
function run(pattern) {
  const S = { streak: { count: 0, last: "" }, streakChest: 0 };
  let chests = 0, now = Date.UTC(2026, 0, 1);
  const dayKey = (ts) => new Date(ts).toISOString().slice(0, 10);
  const FakeDate = Object.create(Date);
  FakeDate.now = () => now;
  const api = make(S, dayKey, DAY, () => dayKey(now), () => chests++, () => {}, EVERY, FakeDate);
  for (const studied of pattern) {
    if (studied) api.bumpStreak();
    now += DAY;
  }
  return { chests, count: S.streak.count, paid: S.streakChest, progress: api.streakChestProgress(S) };
}

let fails = 0;
function check(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) fails++;
  console.log((ok ? "ok    " : "FAIL  ") + name + "  " + JSON.stringify(got) + (ok ? "" : "   want " + JSON.stringify(want)));
}
const days = (n) => Array(n).fill(1);

console.log("--- earning one ---");
check("a week short of the mark earns nothing", run(days(EVERY - 1)).chests, 0);
check("the seventh day in a row earns a chest", run(days(EVERY)).chests, 1);
check("...and records the length it was paid at", run(days(EVERY)).paid, EVERY);

console.log("\n--- and every week after ---");
check("two weeks earns two", run(days(EVERY * 2)).chests, 2);
check("three weeks earns three", run(days(EVERY * 3)).chests, 3);
check("a fortnight and a day is still two", run(days(EVERY * 2 + 1)).chests, 2);

console.log("\n--- a broken streak (the regression) ---");
const broke = run([...days(EVERY), 0, ...days(EVERY)]);
check("a run rebuilt after a missed day earns AGAIN at seven", broke.chests, 2);
check("...and the paid-at count came back down with the streak", broke.paid, EVERY);
check("a long gap resets the run to one", run([...days(9), 0, 0, 0, 1]).count, 1);
check("...and pays nothing for the first day back", run([...days(9), 0, 0, 0, 1]).chests, 1);

console.log("\n--- idempotence ---");
/* bumpStreak returns early when the streak was already advanced today, which is what stops a second
   graded card — or an undo and a re-grade — paying twice. */
check("studying twice in one day counts one day", run(days(EVERY)).count, EVERY);
const S2 = { streak: { count: EVERY, last: "" }, streakChest: EVERY };
check("a length already paid at is never paid twice", (() => {
  let chests = 0, now = Date.UTC(2026, 5, 1);
  const dayKey = (ts) => new Date(ts).toISOString().slice(0, 10);
  const FakeDate = Object.create(Date); FakeDate.now = () => now;
  const api = make(S2, dayKey, DAY, () => dayKey(now), () => chests++, () => {}, EVERY, FakeDate);
  api.bumpStreak(); api.bumpStreak();
  return chests;
})(), 0);

console.log("\n--- what the meter says ---");
/* The seventh day reads 7 of 7 rather than 0 of 7 — a meter should be full on the day the thing is
   earned, which is why the arithmetic is an offset rather than a bare modulo. */
check("day seven reads full", run(days(EVERY)).progress.into, EVERY);
check("day eight starts the next week", run(days(EVERY + 1)).progress.into, 1);
check("day one is one", run(days(1)).progress.into, 1);
check("no streak at all is zero", run([]).progress.into, 0);
check("...and the days left never go negative", run(days(EVERY)).progress.left, 0);
check("mid-week says how many are left", run(days(3)).progress.left, EVERY - 3);

console.log(fails ? "\nFAILED — " + fails + " failed" : "\nPASSED — " + "all checks passed");
process.exit(fails ? 1 : 0);
