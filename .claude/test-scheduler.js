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
  return { SCHED, SCHED_AHEAD_MS, schedAnswer, schedPreview, schedBlank, schedIsLearning, schedFuzz, schedHardDelay, schedStep,
           FSRS_PARAMS, fsrsRetrievability, fsrsInterval, fsrsInitS, fsrsInitD, fsrsNextD, fsrsRecallS,
           fsrsForgetS, fsrsShortS, fsrsNextState, fsrsAnswer, fsrsSeed, fsrsPreviewIvs };
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
/* ================= 10. FSRS, checked against the reference implementation =================
   The one section in this file that does not reason about the maths at all. FSRS-6 is somebody else's
   algorithm, and a version of it reconstructed from prose is precisely the thing that looks right and
   quietly schedules everyone worse — so every number below is compared against vectors GENERATED by the
   reference implementation (`py-fsrs`, open-spaced-repetition) and committed as .claude/fsrs-vectors.json.

   256 grade sequences, each three answers deep, at four different gaps between reviews (same-minute,
   half an hour, a day, nine days) so the same-day branch, the recall branch and the lapse branch are all
   walked. Stability and difficulty are compared to 1e-9; the learning-step delays exactly.

   Regenerate the fixture with .claude/gen-fsrs-vectors.py if the parameters or the reference ever move —
   and if this section fails after an app.js change, the app is wrong, not the fixture. */
section("10. FSRS agrees with the reference implementation");
{
  const V = require("./fsrs-vectors.json");
  const F = api;
  const W = F.FSRS_PARAMS;
  // WHOSE numbers these are, printed rather than assumed: a fixture with no provenance cannot tell a
  // deliberate version bump from one quietly edited to fit a bug (`ref` is written by gen-fsrs-vectors.py).
  console.log("    (vectors from " + (V.ref || "an unrecorded reference") + ")");
  ok(!!V.ref, "the fixture records which reference produced it");
  eq(JSON.stringify(W), JSON.stringify(V.params), "the 21 default parameters are the reference's own");

  // --- the forgetting curve and the interval it inverts
  let curveBad = 0, curveWorst = 0;
  V.curve.forEach((c) => {
    const got = F.fsrsRetrievability(W, c.elapsed, c.s);
    const d = Math.abs(got - c.r);
    if (d > 1e-12) { curveBad++; curveWorst = Math.max(curveWorst, d); }
  });
  ok(curveBad === 0, "the forgetting curve matches the reference over " + V.curve.length +
    " stability/elapsed pairs (worst " + curveWorst.toExponential(2) + ")");
  /* R(S, S) = 0.9 exactly, whatever the decay — the property that makes "stability" mean "the 90%
     interval" and the one thing a wrong FACTOR would break silently. */
  [0.5, 1, 21, 365, 3650].forEach((s) => {
    near(F.fsrsRetrievability(W, s, s), 0.9, 1e-12, "R is 90% at t = S (S=" + s + ")");
  });
  let ivBad = 0;
  V.intervals.forEach((c) => {
    const raw = F.fsrsInterval(W, c.s, c.retention);
    const got = Math.min(36500, Math.max(1, Math.round(raw)));
    if (got !== c.days) { ivBad++; if (ivBad < 3) console.error("     iv S=" + c.s + " r=" + c.retention + " got " + got + " want " + c.days); }
  });
  ok(ivBad === 0, "the interval matches the reference over " + V.intervals.length + " stability/retention pairs");
  // a lower target retention must never mean a SHORTER interval — the direction a sign slip would flip
  const ret = [0.7, 0.8, 0.9, 0.95, 0.98].map((r) => F.fsrsInterval(W, 100, r));
  ok(ret.every((v, i) => i === 0 || v < ret[i - 1]), "asking for more retention gives shorter intervals");

  // --- the state machine, three grades deep, at four gaps
  const ST = { Learning: "learning", Review: "review", Relearning: "relearn" };
  const cfg = Object.assign({}, SCHED, { mode: "fsrs", retention: 0.9 });
  let sBad = 0, dBad = 0, stBad = 0, stepBad = 0, minBad = 0, worstS = 0, worstD = 0, walked = 0;
  V.cases.forEach((cs) => {
    let c = null, t = T;
    cs.steps.forEach((want, i) => {
      const prev = c;
      c = F.fsrsAnswer(c, want.grade, t, "wh-001", cfg);
      walked++;
      const ds = Math.abs(c.stability - want.stability), dd = Math.abs(c.difficulty - want.difficulty);
      if (ds > 1e-9) { sBad++; worstS = Math.max(worstS, ds); if (sBad < 3) console.error("     S " + cs.seq + " gap" + cs.gap_min + " step" + i + " got " + c.stability + " want " + want.stability); }
      if (dd > 1e-9) { dBad++; worstD = Math.max(worstD, dd); if (dBad < 3) console.error("     D " + cs.seq + " gap" + cs.gap_min + " step" + i + " got " + c.difficulty + " want " + want.difficulty); }
      if (c.status !== ST[want.state]) { stBad++; if (stBad < 3) console.error("     state " + cs.seq + " gap" + cs.gap_min + " step" + i + " got " + c.status + " want " + want.state); }
      /* the step within the ladder, where the reference has one (it uses null in the review state, which is
         Folio's step 0 — the record has to hold a number, so the comparison is only made where it means
         something) */
      if (want.step != null && (c.step | 0) !== want.step) { stepBad++; if (stepBad < 3) console.error("     step " + cs.seq + " gap" + cs.gap_min + " step" + i + " got " + c.step + " want " + want.step); }
      /* A LEARNING delay is compared exactly, in minutes — no fuzz is applied to a sub-day step, so this is
         the one place the whole answer can be checked end to end. A card that has landed in review has been
         fuzzed on purpose and is checked through fsrsInterval above instead. */
      if (want.state !== "Review" && want.due_min != null) {
        const gotMin = (c.due - t) / MIN;
        if (Math.abs(gotMin - want.due_min) > 1e-6) { minBad++; if (minBad < 3) console.error("     due " + cs.seq + " gap" + cs.gap_min + " step" + i + " got " + gotMin + " want " + want.due_min); }
      }
      void prev;
      t += (cs.gap_min || 1) * MIN;
    });
  });
  ok(walked === 768, "walked every step of every case (" + walked + ")");
  ok(sBad === 0, "stability matches the reference at every step (worst " + worstS.toExponential(2) + ")");
  ok(dBad === 0, "difficulty matches the reference at every step (worst " + worstD.toExponential(2) + ")");
  ok(stBad === 0, "the state matches the reference at every step");
  ok(stepBad === 0, "the position in the learning ladder matches at every step");
  ok(minBad === 0, "a learning step's delay matches the reference to the minute");

  // --- the properties FSRS must have that a fixture cannot state
  section("10b. FSRS properties");
  const fresh = () => schedBlank();
  const p = F.fsrsPreviewIvs(fresh(), "wh-001", T, cfg);
  ok(p.again <= p.hard && p.hard <= p.good && p.good <= p.easy,
    "on a new card the four buttons are still in order — " + JSON.stringify(p));
  // a card recalled is never less stable than it was: the guarantee SInc >= 1 encodes
  let grewWrong = 0;
  [1, 5, 30, 200, 2000].forEach((s0) => {
    [1, 5, 9.9].forEach((d0) => {
      ["hard", "good", "easy"].forEach((g) => {
        const card = { status: "review", step: 0, reps: 5, lapses: 0, interval: s0, ease: 2.5,
                       stability: s0, difficulty: d0, due: T, last: T - s0 * DAY };
        const next = F.fsrsAnswer(card, g, T, "wh-001", cfg);
        if (next.stability < s0 - 1e-9) grewWrong++;
      });
    });
  });
  ok(grewWrong === 0, "a recalled card never loses stability (45 combinations)");
  // …and a lapse never gains any, which is the min() in fsrsForgetS
  let lapseWrong = 0;
  [1, 5, 30, 200, 2000].forEach((s0) => {
    [1, 5, 9.9].forEach((d0) => {
      const card = { status: "review", step: 0, reps: 5, lapses: 0, interval: s0, ease: 2.5,
                     stability: s0, difficulty: d0, due: T, last: T - s0 * DAY };
      const next = F.fsrsAnswer(card, "again", T, "wh-001", cfg);
      if (next.stability > s0 + 1e-9) lapseWrong++;
    });
  });
  ok(lapseWrong === 0, "a lapsed card never gains stability (15 combinations)");
  // difficulty stays inside 1..10 however it is driven
  let dOut = 0;
  let c2 = null;
  for (let i = 0; i < 60; i++) {
    c2 = F.fsrsAnswer(c2, i % 7 === 0 ? "easy" : "again", T + i * DAY, "wh-001", cfg);
    if (c2.difficulty < 1 - 1e-12 || c2.difficulty > 10 + 1e-12) dOut++;
  }
  ok(dOut === 0, "difficulty stays within 1–10 over 60 punishing reviews");
  // stability never falls to zero, which would make every later interval NaN or zero
  let sZero = 0;
  let c3 = null;
  for (let i = 0; i < 60; i++) { c3 = F.fsrsAnswer(c3, "again", T + i * DAY, "wh-001", cfg); if (!(c3.stability >= 0.001)) sZero++; }
  ok(sZero === 0, "stability never falls below its floor over 60 straight lapses");
  // nothing is ever scheduled into the past, the same guarantee section 9 makes for SM-2
  let past = 0;
  ["new", "learning", "relearn", "review"].forEach((st) => {
    ["again", "hard", "good", "easy"].forEach((g) => {
      const card = { status: st, step: 0, reps: 3, lapses: 1, interval: 10, ease: 2.5,
                     stability: st === "new" ? 0 : 10, difficulty: st === "new" ? 0 : 5, due: T - 30 * DAY, last: T - 40 * DAY };
      const next = F.fsrsAnswer(st === "new" ? null : card, g, T, "wh-001", cfg);
      if (next.due < T) past++;
    });
  });
  ok(past === 0, "no state x grade is ever scheduled into the past (16 cases)");

  /* SEEDING A CARD THAT WAS STUDIED UNDER SM-2. Stability takes the interval — the two mean the same thing
     — and difficulty is NOT guessed from the ease. A card with no history at all is simply new to FSRS. */
  const seeded = F.fsrsSeed(W, { status: "review", interval: 21, ease: 2.9, reps: 9, lapses: 1 });
  eq(seeded.stability, 21, "an SM-2 card's interval becomes its stability");
  near(seeded.difficulty, F.fsrsInitD(W, 3, true), 1e-12, "…and its difficulty starts neutral rather than guessed from the ease");
  const unseeded = F.fsrsSeed(W, { status: "new", interval: 0, ease: 2.5, reps: 0, lapses: 0 });
  ok(unseeded.stability === undefined, "a card with no interval is left alone — it is new to FSRS");
  const kept = F.fsrsSeed(W, { status: "review", interval: 21, ease: 2.5, stability: 33, difficulty: 4 });
  eq(kept.stability, 33, "a card that already has a memory state is not re-seeded");

  // the two schedulers are chosen by cfg.mode and nothing else — same card, same grade, different answer
  const sm2 = schedAnswer(fresh(), "good", T, "wh-001");
  const fs = schedAnswer(fresh(), "good", T, "wh-001", cfg);
  eq(sm2.stability, undefined, "an SM-2 answer writes no memory state");
  ok(fs.stability > 0, "an FSRS answer does");
  eq(sm2.status, fs.status, "…and both still walk the same learning ladder");
}

console.log("\n" + (fail ? "FAILED" : "PASSED") + " — " + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
