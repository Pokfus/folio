#!/usr/bin/env node
/* The SCHEDULER — Anki's SM-2 as ported into app.js (Aug 2026).
 *
 * Everything here fails SILENTLY on the live site: a wrong interval is still a number on a button, and a
 * card that graduates a step early still looks exactly like a card being studied. Nobody reports it; they
 * just learn less. So the schedule is pinned as arithmetic rather than through a browser.
 *
 * The block under test is PURE — no S, no DOM, no clock beyond what is passed in — so it is sliced out of
 * the real app.js by text and run in a `new Function`, the way test-daily-quote.js and test-card-types.js
 * take levelFromXP and cssScoped. It therefore cannot drift from what ships: rename the block and this
 * file fails loudly instead of testing a copy of yesterday's code.
 *
 *   node .claude/test-scheduler.js
 *
 * No browser, no dependencies.
 */
"use strict";
const fs = require("fs");
const path = require("path");

const APP = path.join(__dirname, "..", "app.js");
const src = fs.readFileSync(APP, "utf8");

/* ---------- slice the pure scheduler out of app.js ---------- */
const START = "  const SCHED = {";
const END = "  /* ---------- SRS ---------- */";
const a = src.indexOf(START), b = src.indexOf(END);
if (a < 0 || b < 0 || b < a) {
  console.error("FAIL: could not find the scheduler block in app.js — did the markers move?\n" +
    "      expected " + JSON.stringify(START) + " … " + JSON.stringify(END));
  process.exit(1);
}
const DAY = 86400000;
const SCHED_SRC = src.slice(a, b);
const api = new Function("DAY", SCHED_SRC + `
  return { SCHED, SCHED_AHEAD_MS, schedAnswer, schedPreview, schedBlank, schedIsLearning, schedFuzz, schedHardDelay, schedStep };
`)(DAY);
const { SCHED, schedAnswer, schedPreview, schedBlank, schedIsLearning } = api;

/* ---------- harness ---------- */
let pass = 0, fail = 0;
const T = 1_700_000_000_000;                       // a fixed clock: the scheduler takes `t`, so nothing here is flaky
const MIN = 60000;
function ok(cond, what) { if (cond) { pass++; } else { fail++; console.error("  FAIL " + what); } }
function eq(got, want, what) { ok(got === want, what + " — got " + JSON.stringify(got) + ", wanted " + JSON.stringify(want)); }
function near(got, want, tol, what) { ok(Math.abs(got - want) <= tol, what + " — got " + got + ", wanted ~" + want); }
function section(t) { console.log("\n" + t); }

const mins = (c, t) => (c.due - t) / MIN;          // how many minutes out a learning card was put
const days = (c, t) => (c.due - t) / DAY;
// answer a card a sequence of grades, each one `t` unchanged (the delays are what we are reading)
function run(card, grades, t) {
  let c = card;
  grades.forEach((g) => { c = schedAnswer(c, g, t == null ? T : t, "wh-001"); });
  return c;
}

/* ================= 1. the reported bug: a new card must NOT jump to tomorrow ================= */
section("1. A new card walks the learning steps");
{
  const one = schedAnswer(schedBlank(), "good", T, "wh-001");
  eq(one.status, "learning", "new + Good stays in learning (this is the whole bug report)");
  ok(one.due - T < DAY, "new + Good is due in MINUTES, not tomorrow");
  eq(mins(one, T), 10, "new + Good goes to the 10-minute step");
  eq(one.step, 1, "…and is recorded as standing on step 2 of 2");

  const two = schedAnswer(one, "good", T, "wh-001");
  eq(two.status, "review", "a SECOND Good graduates it");
  eq(days(two, T), 1, "…to tomorrow — one day, Anki's graduating interval");
  eq(two.interval, 1, "…with an interval of 1 day");
  eq(two.reps, 1, "a graduation counts as a rep");
  eq(two.ease, SCHED.startEase, "…and it graduates at the starting ease");

  // and the reader-visible half: the buttons must say so BEFORE the card is answered
  const p = schedPreview(null, "wh-001", T);
  near(p.again * 1440, 1, 0.001, "preview: Again on a new card is 1 minute");
  near(p.hard * 1440, 5.5, 0.001, "preview: Hard is the midpoint of the two steps");
  near(p.good * 1440, 10, 0.001, "preview: Good is 10 minutes, NOT a day");
  eq(p.easy, 4, "preview: Easy graduates straight to 4 days");
}

/* ================= 2. the rest of the learning ladder ================= */
section("2. Again / Hard / Easy while learning");
{
  const back = run(schedBlank(), ["good", "again"], T);
  eq(back.status, "learning", "Again on a learning card keeps it learning");
  eq(back.step, 0, "…and knocks it back to the first step");
  eq(mins(back, T), 1, "…due in 1 minute");

  const hard0 = schedAnswer(schedBlank(), "hard", T, "wh-001");
  eq(mins(hard0, T), 5.5, "Hard on the FIRST step is the midpoint (1m,10m) → 5.5m");
  eq(hard0.step, 0, "…and does not advance the step");

  const hard1 = run(schedBlank(), ["good", "hard"], T);
  eq(mins(hard1, T), 10, "Hard on a later step repeats that step");
  eq(hard1.step, 1, "…still on it");

  const easy = schedAnswer(schedBlank(), "easy", T, "wh-001");
  eq(easy.status, "review", "Easy graduates a new card immediately");
  eq(easy.interval, 4, "…at 4 days, Anki's easy interval");

  // Hard must never be worth more than Good, or the buttons are lying
  ok(mins(hard0, T) > mins(run(schedBlank(), ["again"], T), T), "Hard is slower than Again");
  ok(mins(hard0, T) < 10, "…and faster than Good");
}

/* ================= 3. review intervals ================= */
section("3. A graduated card grows by its ease");
{
  const grad = run(schedBlank(), ["good", "good"], T);          // interval 1, ease 2.5
  const g2 = schedAnswer(grad, "good", T, "wh-001");
  eq(g2.status, "review", "Good on a review card stays in review");
  ok(g2.interval >= 2, "…and the interval grows (1d × 2.5 ease)");
  eq(g2.ease, 2.5, "Good leaves the ease alone");

  const h = schedAnswer(grad, "hard", T, "wh-001");
  near(h.ease, 2.35, 1e-9, "Hard drops the ease by 0.15");
  const e = schedAnswer(grad, "easy", T, "wh-001");
  near(e.ease, 2.65, 1e-9, "Easy raises the ease by 0.15");

  // the ordering guarantee: hard < good < easy, always, whatever the fuzz does
  let bad = 0;
  for (let iv = 1; iv <= 400; iv++) {
    for (const ease of [1.3, 1.9, 2.5, 3.2]) {
      const c = { status: "review", interval: iv, ease: ease, reps: 3, lapses: 0, due: T, last: 0, step: 0 };
      const H = schedAnswer(c, "hard", T, "c" + iv).interval;
      const G = schedAnswer(c, "good", T, "c" + iv).interval;
      const E = schedAnswer(c, "easy", T, "c" + iv).interval;
      if (!(H < G && G < E)) bad++;
    }
  }
  eq(bad, 0, "Hard < Good < Easy for every interval 1..400 at four eases (1600 cases)");

  // the ease floor
  let low = { status: "review", interval: 10, ease: 2.5, reps: 5, lapses: 0, due: T, last: 0, step: 0 };
  for (let i = 0; i < 20; i++) low = schedAnswer(low, "hard", T, "wh-001");
  ok(low.ease >= SCHED.minEase - 1e-9, "the ease never falls below the 1.3 floor");

  // the ceiling
  const huge = schedAnswer({ status: "review", interval: 30000, ease: 3, reps: 9, due: T, lapses: 0, last: 0, step: 0 }, "easy", T, "wh-001");
  ok(huge.interval <= SCHED.maxIv, "an interval never passes the maximum");
}

/* ================= 4. days late are credited back ================= */
section("4. A card answered late is credited for the wait");
{
  const onTime = { status: "review", interval: 10, ease: 2.5, reps: 4, lapses: 0, due: T, last: 0, step: 0 };
  const late = Object.assign({}, onTime, { due: T - 20 * DAY });   // twenty days overdue
  ok(schedAnswer(late, "good", T, "x").interval > schedAnswer(onTime, "good", T, "x").interval,
    "twenty days overdue earns a longer interval than the same card answered on time");
}

/* ================= 5. lapses and relearning ================= */
section("5. A lapse relearns rather than resetting");
{
  const mature = { status: "review", interval: 40, ease: 2.5, reps: 8, lapses: 0, due: T, last: 0, step: 0 };
  const lapsed = schedAnswer(mature, "again", T, "wh-001");
  eq(lapsed.status, "relearn", "Again on a review card sends it to relearning, not back to 'new'");
  eq(lapsed.lapses, 1, "…and counts a lapse");
  near(lapsed.ease, 2.3, 1e-9, "…drops the ease by 0.20");
  eq(mins(lapsed, T), 10, "…and is due in 10 minutes, Anki's relearning step");
  eq(lapsed.lapseIv, 1, "…with the interval it will return to recorded on the card");
  ok(schedIsLearning(lapsed.status), "a relearning card counts in the LEARNING pile");

  const backAgain = schedAnswer(lapsed, "again", T, "wh-001");
  eq(backAgain.status, "relearn", "Again in relearning stays in relearning");
  eq(backAgain.step, 0, "…on the first step");

  const done = schedAnswer(lapsed, "good", T, "wh-001");
  eq(done.status, "review", "Good on the last relearning step graduates back to review");
  eq(done.interval, 1, "…to the interval the lapse computed");
  ok(!("lapseIv" in done), "…and the record is tidied up behind it");
  near(done.ease, 2.3, 1e-9, "the lapse's ease penalty survives relearning");

  const easyOut = schedAnswer(lapsed, "easy", T, "wh-001");
  eq(easyOut.interval, 2, "Easy out of relearning adds a day");

  const rp = schedPreview(lapsed, "wh-001", T);
  near(rp.again * 1440, 10, 1e-9, "preview in relearning: Again is 10 minutes");
  eq(rp.good, 1, "preview in relearning: Good is the recovered interval");
  eq(rp.easy, 2, "preview in relearning: Easy is that plus a day");

  // a leech is recorded and never acted on
  let leech = { status: "review", interval: 5, ease: 2.5, reps: 9, lapses: 7, due: T, last: 0, step: 0 };
  leech = schedAnswer(leech, "again", T, "wh-001");
  eq(leech.leech, true, "the eighth lapse marks a leech");
  ok(!leech.suspended, "…and nothing is auto-suspended by the scheduler");
}

/* ================= 6. the fuzz is seeded by the CARD, so previews are honest ================= */
section("6. The preview and the grade agree");
{
  let mismatch = 0, seen = new Set();
  for (let iv = 1; iv <= 120; iv++) {
    const c = { status: "review", interval: iv, ease: 2.5, reps: 3, lapses: 0, due: T, last: 0, step: 0 };
    const p = schedPreview(c, "wh-0" + iv, T);
    ["hard", "good", "easy"].forEach((g) => {
      if (schedAnswer(c, g, T, "wh-0" + iv).interval !== p[g]) mismatch++;
    });
    seen.add(schedAnswer(c, "good", T, "wh-0" + iv).interval);
  }
  eq(mismatch, 0, "every button shows exactly the interval that grading it will apply (360 cases)");

  // …and it really is fuzzed: the same card under different ids must not always land on one number
  const spread = new Set();
  for (let i = 0; i < 60; i++) {
    spread.add(schedAnswer({ status: "review", interval: 30, ease: 2.5, reps: 2, lapses: 0, due: T, last: 0, step: 0 }, "good", T, "card-" + i).interval);
  }
  ok(spread.size > 1, "the fuzz genuinely spreads intervals across cards (" + spread.size + " distinct)");
  ok(api.schedFuzz(2, "any") === 2, "…but a short interval is never fuzzed");
}

/* ================= 7. old saves back-fill ================= */
section("7. A record written before this scheduler existed");
{
  // what the previous scheduler left behind: learning, one step, no `step` field, interval 1/144
  const old = { reps: 0, lapses: 0, ease: 2.5, interval: 1 / 144, due: T, status: "learning", last: T - 60000 };
  const next = schedAnswer(old, "good", T, "wh-001");
  eq(next.status, "learning", "an older learning card is read as standing on step 1 and advances rather than graduating");
  eq(mins(next, T), 10, "…to the 10-minute step");
  ok(!Number.isNaN(next.due), "…with a real due date");

  const noEase = schedAnswer({ status: "review", interval: 5, reps: 2, lapses: 0, due: T, last: 0 }, "good", T, "wh-001");
  ok(noEase.interval >= 6 && !Number.isNaN(noEase.interval), "a record with no ease falls back to the starting ease");

  const junkStep = schedAnswer({ status: "learning", step: 99, ease: 2.5, interval: 0, reps: 0, lapses: 0, due: T, last: 0 }, "good", T, "wh-001");
  eq(junkStep.status, "review", "a step past the end of the ladder is clamped to the last one, and graduates");
}

/* ================= 8. purity — the caller's record is never mutated ================= */
section("8. The scheduler is pure");
{
  const before = schedBlank();
  const snap = JSON.stringify(before);
  schedAnswer(before, "easy", T, "wh-001");
  eq(JSON.stringify(before), snap, "answering does not touch the record passed in (the undo snapshot depends on this)");
  ok(!/\bS\.|document\.|window\./.test(SCHED_SRC.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "")),
    "the block reads no global state — which is what makes this file possible");
}

/* ================= 9. no card is ever scheduled backwards ================= */
section("9. Nothing is ever scheduled into the past");
{
  let bad = 0;
  const states = [
    schedBlank(),
    { status: "learning", step: 0, ease: 2.5, interval: 0, reps: 0, lapses: 0, due: T, last: 0 },
    { status: "learning", step: 1, ease: 2.5, interval: 0, reps: 0, lapses: 0, due: T, last: 0 },
    { status: "relearn", step: 0, lapseIv: 3, ease: 2.0, interval: 9, reps: 5, lapses: 2, due: T, last: 0 },
    { status: "review", interval: 1, ease: 1.3, reps: 1, lapses: 0, due: T, last: 0, step: 0 },
    { status: "review", interval: 250, ease: 3.4, reps: 20, lapses: 3, due: T - 90 * DAY, last: 0, step: 0 },
  ];
  states.forEach((c, i) => ["again", "hard", "good", "easy"].forEach((g) => {
    const n = schedAnswer(c, g, T, "s" + i);
    if (!(n.due > T)) bad++;
    if (n.status === "review" && !(n.interval >= 1)) bad++;
    if (!Number.isFinite(n.due) || !Number.isFinite(n.ease)) bad++;
  }));
  eq(bad, 0, "every state × every grade lands in the future with a sane interval (24 cases)");
}

/* ---------- report ---------- */
console.log("\n" + (fail ? "FAILED" : "PASSED") + " — " + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
