/* ci-shards.js — splits CI's Playwright suites into four shards of about the same measured duration, and runs one shard.

     node .claude/ci-shards.js --plan            the four shards, their suites and their predicted minutes
     node .claude/ci-shards.js --check           the gate (fast job): every Playwright suite is in exactly one shard, the plan fits the cap
     node .claude/ci-shards.js --list N          shard N's units, one per line (N = 1..4)
     node .claude/ci-shards.js --run N           run shard N, name every failure, exit 1 if any failed

   WHY (Oct 2026). The one shared Playwright job took 75-85 of its 90 minutes and the card-window phone-fix suite had to be split off just to stay under the cap. It became a matrix of three shards, and then the Atlas threads
   kept adding suites (undiscovered, mark-outline, capital-stack, neutral, halos, overlaps, rivers, relief, land-changes at six minutes): by 2026-10-18 the plan, re-measured piecemeal, predicted 35.5 minutes for its heaviest shard
   against a 35-minute cap, shard 3 of run 3785 ran to the job's 40-minute limit, and shard 2 of run 3775 had been cancelled there before it. The plan is now FOUR shards (.github/workflows/checks.yml, `browser`), re-measured in one piece
   from the PASS lines of the last full runs (3784, 3785 and, once the plan existed, 3787: the mean for each suite), each predicted at no more than SHARD_CAP_MIN = 28 minutes with its setup, so a new suite or a slow runner has twelve minutes of room
   before the job's 40-minute ceiling instead of five and a red shard is a smaller thing to read. The cost is one more runner per push (see docs/reference.md "Testing").

   WHAT RUNS. Exactly what the single loop ran: every .claude/test-*.js that mentions playwright, except test-atlas-perf.js (the frame gate's job), test-card-windows-fixes.js (its own job) and, in that same job, test-war-timeline.js, test-atlas-no-wars.js, test-ww2-slice.js, test-atlas-capital-names.js and test-quotes-verbatim.js (2026-10-19: the four shards were within 0.1 minute of their 28-minute cap, so new suites could not go in them). (Until Phase 5 the three
   suites written against V1's windows also ran a second time with FOLIO_ENGINE=v1; v1's windows are deleted and so is that pass.) Each is a UNIT; a suite is found by scanning the directory, so a NEW suite
   is in a shard the day it is written without anyone editing this file. The plan is deterministic (longest first onto the lightest shard), so the four jobs agree on it without talking to one another.

   WEIGHTS. MEASURED is the seconds each unit took in a real CI run (see MEASURED_FROM). A unit not in it (a new suite) weighs DEFAULT_SEC until someone adds its row; --check says so but does not fail, because the
   plan is still sound -- only less well balanced. Re-measure from the per-shard summary a run writes (the "Shard N" table in the run's job summary, and the PASS lines in each shard's log).

   A FAILURE FAILS THE JOB AND NAMES THE SUITE. --run does not stop at the first red suite (a later one may be red for its own reason), prints `FAIL <suite>` as the old loop did, an `::error title=Playwright suite failed::`
   annotation per failed unit, the list in the job summary, and exits 1. */
"use strict";
const fs = require("fs"), path = require("path"), cp = require("child_process");
const DIR = __dirname;
const SHARDS = 4, SHARD_CAP_MIN = 28, SETUP_MIN = 1.2, DEFAULT_SEC = 120;   // SETUP_MIN: checkout + the Playwright and Chromium install, 55-67 s (1.1 min at most) in the twenty shard jobs of runs 3774, 3784, 3785 and 3787; 1.2 min is the longest seen, rounded up
const EXCLUDE = new Set(["test-atlas-perf.js", "test-card-windows-fixes.js", "test-war-timeline.js", "test-atlas-no-wars.js", "test-ww2-slice.js", "test-atlas-capital-names.js", "test-quotes-verbatim.js", "test-atlas-relief-detail.js"]);   // each has a job of its own (the last six ride in the card-window job, 2026-10-19: the shards had 0.1 minute of room each, and two more suites put the heaviest one over its 28-minute cap)
const MEASURED_FROM = "runs 3784, 3785 and 3787 (checks.yml, 2026-10-18 and 19), the mean of each suite's PASS lines on a GitHub runner (one suite varies by 30-70 % from runner to runner: zoom-layers 192-330 s, findit-pick 105-286 s); test-land-changes from run 3787 alone, the first on its faster code; test-tour from run 3774, its last PASS (it is red on main, and its 60 s wait for a passage that never arrives is not its weight); test-minigames from runs 3784 and 3785 (red since 2026-10-19)";
const MEASURED = {   // seconds
  "test-a11y": 49, "test-account-page": 12, "test-account-switch": 94, "test-admin-editor": 21, "test-artefacts": 46, "test-artwork-cards": 15, "test-atlas-a11y": 11,
  "test-atlas-capital-stack": 52, "test-atlas-card": 20, "test-atlas-credits": 7, "test-atlas-dark-labels": 14, "test-atlas-embed": 134, "test-atlas-fallbacks": 69,
  "test-atlas-first-globe": 39, "test-atlas-halos": 25, "test-atlas-labels": 157, "test-atlas-mark-outline": 42, "test-atlas-neutral": 161, "test-atlas-overlaps": 55,
  "test-atlas-personal": 47, "test-atlas-phone": 391, "test-atlas-popups": 212, "test-atlas-redirects": 87, "test-atlas-relief": 16, "test-atlas-render": 104,
  "test-atlas-review": 89, "test-atlas-rivers": 151, "test-atlas-search": 25, "test-atlas-session": 312, "test-atlas-stages": 59, "test-atlas-study": 211,
  "test-atlas-time": 46, "test-atlas-undiscovered": 168, "test-atlas-windows": 321, "test-atlas-zoom-layers": 238, "test-avatar": 6, "test-card-locator": 45,
  "test-card-quote": 11, "test-card-types": 78, "test-cards": 38, "test-char-network": 29, "test-community": 20, "test-csp": 31, "test-deck-glossary": 44,
  "test-deck-lazy": 35, "test-deck-trust": 7, "test-deck-update": 52, "test-deck-ux": 23, "test-draw-cards": 16, "test-feedback": 10, 
  "test-findit-pick": 226, "test-howfar": 40 /* 24 s on a cloud session, 2026-10-30, not yet a CI run */, "test-pie": 20 /* estimated, 2026-10-31, not yet a CI run */, "test-flag-cards": 15, "test-gloss-image": 29, "test-glossary-page": 10, "test-i18n-lang": 11, "test-land-changes": 244,
  "test-lang-decks": 44, "test-layout": 350, "test-learning": 203, "test-library": 137, "test-map-cards": 15, "test-media-source": 32, "test-minigames": 57,
  "test-polity-names": 22, "test-progress-registers": 23, "test-publish": 193, "test-reset": 9, "test-review-decks": 176, "test-revlog": 28, "test-sanitize": 1,
  "test-sources": 38, "test-speak": 63, "test-spelling": 23, "test-subdecks": 45, "test-tour": 65, "test-truefalse": 20, "test-units": 19, "test-video": 64,
  "test-war-cards": 22, "test-whiteboard": 10, "test-why-markers": 1, "test-window-fallbacks": 218,
};

function units() {
  const out = [];
  for (const f of fs.readdirSync(DIR).filter((n) => /^test-.*\.js$/.test(n) && !EXCLUDE.has(n)).sort()) {
    if (!/playwright/.test(fs.readFileSync(path.join(DIR, f), "utf8"))) continue;   // the old loop's `grep -l playwright`
    const id = f.replace(/\.js$/, "");
    out.push({ id, file: f, env: {} });
  }
  for (const u of out) { u.sec = MEASURED[u.id]; u.measured = u.sec != null; if (u.sec == null) u.sec = DEFAULT_SEC; }
  return out;
}
// longest first onto the lightest shard (ties: by name), then each shard in name order -- the same on every runner
function plan(us) {
  const shards = Array.from({ length: SHARDS }, () => ({ units: [], sec: 0 }));
  for (const u of us.slice().sort((a, b) => b.sec - a.sec || (a.id < b.id ? -1 : 1))) { const s = shards.reduce((m, x) => (x.sec < m.sec ? x : m), shards[0]); s.units.push(u); s.sec += u.sec; }
  for (const s of shards) s.units.sort((a, b) => (a.id < b.id ? -1 : 1));
  return shards;
}
const min = (s) => (s / 60).toFixed(1);
const args = process.argv.slice(2), mode = args[0], N = Number(args[1]);

if (mode === "--plan" || mode === "--check") {
  const us = units(), sh = plan(us);
  sh.forEach((s, i) => console.log(`shard ${i + 1}: ${s.units.length} units, predicted ${min(s.sec)} min of suites (+ up to ${SETUP_MIN} min setup)\n   ${s.units.map((u) => u.id.replace(/^test-/, "") + (u.measured ? "" : "?")).join(" ")}`));
  const names = new Set(), dup = [], missing = Object.keys(MEASURED).filter((k) => !us.some((u) => u.id === k)), unweighed = us.filter((u) => !u.measured).map((u) => u.id);
  for (const s of sh) for (const u of s.units) { if (names.has(u.id)) dup.push(u.id); names.add(u.id); }
  const all = us.filter((u) => !names.has(u.id)).map((u) => u.id);
  const worst = Math.max.apply(null, sh.map((s) => s.sec)) / 60 + SETUP_MIN;
  const bad = [];
  if (all.length) bad.push("not in any shard: " + all.join(", "));
  if (dup.length) bad.push("in two shards: " + dup.join(", "));
  if (worst > SHARD_CAP_MIN) bad.push(`the heaviest shard is predicted at ${worst.toFixed(1)} min with setup, over the ${SHARD_CAP_MIN}-minute cap`);
  if (unweighed.length) console.log("note: no measured duration yet for " + unweighed.join(", ") + ` (counted as ${DEFAULT_SEC} s; add a row to MEASURED after a CI run)`);
  if (missing.length) console.log("note: MEASURED has rows for suites that no longer exist: " + missing.join(", ") + " (harmless; remove them)");
  console.log(`${us.length} units over ${SHARDS} shards; measured from ${MEASURED_FROM}`);
  if (mode === "--check" && bad.length) { console.error("FAIL " + bad.join(" | ")); process.exit(1); }
  if (mode === "--check") console.log("ok: every Playwright suite is in exactly one shard and the heaviest is predicted at " + worst.toFixed(1) + " min");
} else if (mode === "--list" && N >= 1 && N <= SHARDS) {
  for (const u of plan(units())[N - 1].units) console.log(u.id);
} else if (mode === "--run" && N >= 1 && N <= SHARDS) {
  const us = process.env.FOLIO_SHARD_UNITS ? JSON.parse(process.env.FOLIO_SHARD_UNITS) : plan(units())[N - 1].units;   // FOLIO_SHARD_UNITS: a test hook ([{id,file,env}]; a file is relative to .claude/ or absolute)
  const rows = [], t0 = Date.now();
  for (const u of us) {
    console.log(`::group::${u.id}`);
    const t = Date.now(), r = cp.spawnSync(process.execPath, [path.resolve(DIR, u.file)], { stdio: "inherit", env: Object.assign({}, process.env, u.env) });
    const sec = Math.round((Date.now() - t) / 1000), ok = r.status === 0;
    console.log(`${ok ? "PASS" : "FAIL"} ${u.id} (${sec}s${r.status === null ? ", killed by " + (r.signal || "a signal") : ok ? "" : ", exit " + r.status})`);
    console.log("::endgroup::");
    if (!ok) console.log(`::error title=Playwright suite failed::${u.id} failed (exit ${r.status === null ? r.signal : r.status}), shard ${N} of ${SHARDS}`);
    rows.push({ id: u.id, ok, sec });
  }
  const failed = rows.filter((r) => !r.ok), total = Math.round((Date.now() - t0) / 1000);
  console.log("----\nshard " + N + " of " + SHARDS + ": " + rows.length + " units in " + min(total) + " min (predicted " + min(us.reduce((a, u) => a + (u.sec || 0), 0)) + ")");
  if (process.env.GITHUB_STEP_SUMMARY) {
    const md = [`### Shard ${N} of ${SHARDS}: ${rows.length} units in ${min(total)} min${failed.length ? ", **" + failed.length + " failed**" : ""}`, "", "| unit | result | seconds |", "|---|---|---|"].concat(rows.map((r) => `| ${r.id} | ${r.ok ? "pass" : "**FAIL**"} | ${r.sec} |`));
    try { fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, md.join("\n") + "\n\n"); } catch (e) {}
  }
  if (failed.length) { console.log(`${failed.length} browser suite(s) failed in shard ${N}: ${failed.map((r) => r.id).join(", ")}`); process.exit(1); }
  console.log("all browser suites in shard " + N + " passed");
} else { console.error("usage: ci-shards.js --plan | --check | --list N | --run N   (N = 1.." + SHARDS + ")"); process.exit(2); }
