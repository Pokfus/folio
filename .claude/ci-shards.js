/* ci-shards.js — splits CI's Playwright suites into three shards of about the same measured duration, and runs one shard.

     node .claude/ci-shards.js --plan            the three shards, their suites and their predicted minutes
     node .claude/ci-shards.js --check           the gate (fast job): every Playwright suite is in exactly one shard, the plan fits the cap
     node .claude/ci-shards.js --list N          shard N's units, one per line (N = 1..3)
     node .claude/ci-shards.js --run N           run shard N, name every failure, exit 1 if any failed

   WHY (Oct 2026). The one shared Playwright job took 75-85 of its 90 minutes and the card-window phone-fix suite had to be split off just to stay under the cap. The job is now a matrix of three shards
   (.github/workflows/checks.yml, `browser`), each well under SHARD_CAP_MIN, so a new suite or a slower runner has room before the cap and a red shard is a smaller thing to read.

   WHAT RUNS. Exactly what the single loop ran: every .claude/test-*.js that mentions playwright, except test-atlas-perf.js (the frame gate's job) and test-card-windows-fixes.js (its own job). (Until Phase 5 the three
   suites written against V1's windows also ran a second time with FOLIO_ENGINE=v1; v1's windows are deleted and so is that pass.) Each is a UNIT; a suite is found by scanning the directory, so a NEW suite
   is in a shard the day it is written without anyone editing this file. The plan is deterministic (longest first onto the lightest shard), so the three jobs agree on it without talking to one another.

   WEIGHTS. MEASURED is the seconds each unit took in a real CI run (see MEASURED_FROM). A unit not in it (a new suite) weighs DEFAULT_SEC until someone adds its row; --check says so but does not fail, because the
   plan is still sound -- only less well balanced. Re-measure from the per-shard summary a run writes (the "Shard N" table in the run's job summary, and the PASS lines in each shard's log).

   A FAILURE FAILS THE JOB AND NAMES THE SUITE. --run does not stop at the first red suite (a later one may be red for its own reason), prints `FAIL <suite>` as the old loop did, an `::error title=Playwright suite failed::`
   annotation per failed unit, the list in the job summary, and exits 1. */
"use strict";
const fs = require("fs"), path = require("path"), cp = require("child_process");
const DIR = __dirname;
const SHARDS = 3, SHARD_CAP_MIN = 35, SETUP_MIN = 3, DEFAULT_SEC = 120;   // SETUP_MIN: checkout + the Playwright and Chromium install, measured 0.7-1.5 min; 3 is generous
const EXCLUDE = new Set(["test-atlas-perf.js", "test-card-windows-fixes.js"]);   // each has a job of its own
const MEASURED_FROM = "run 3705 (checks.yml, 2026-10-17), the three shards' own PASS lines (seconds per suite on a GitHub runner; run 3560 of 2026-10-14 before)";
const MEASURED = {   // seconds
  "test-a11y": 47, "test-account-page": 11, "test-account-switch": 97, "test-admin-editor": 18, "test-artefacts": 44, "test-artwork-cards": 13, "test-atlas-a11y": 8, "test-atlas-capital-stack": 45, "test-atlas-card": 22,
  "test-atlas-credits": 6, "test-atlas-dark-labels": 11, "test-atlas-embed": 129, "test-atlas-fallbacks": 67, "test-atlas-first-globe": 32, "test-atlas-labels": 128, "test-atlas-mark-outline": 60, "test-atlas-neutral": 115,
  "test-atlas-overlaps": 60, "test-atlas-phone": 312, "test-atlas-popups": 102, "test-atlas-redirects": 73, "test-atlas-relief": 11, "test-atlas-render": 93, "test-atlas-review": 93,
  "test-atlas-search": 26, "test-atlas-session": 310, "test-atlas-stages": 62, "test-atlas-study": 184, "test-atlas-time": 33, "test-atlas-windows": 295, "test-atlas-zoom-layers": 196,
  "test-avatar": 5, "test-card-locator": 44, "test-card-quote": 11, "test-card-types": 73, "test-cards": 35, "test-char-network": 28, "test-community": 21, "test-csp": 31,
  "test-deck-glossary": 43, "test-deck-lazy": 34, "test-deck-trust": 7, "test-deck-update": 51, "test-deck-ux": 22, "test-draw-cards": 14, "test-feedback": 9, "test-findit-learn": 41,
  "test-findit-pick": 89, "test-flag-cards": 16, "test-gloss-image": 27, "test-glossary-page": 9, "test-i18n-lang": 10, "test-lang-decks": 44, "test-layout": 358, "test-learning": 203,
  "test-library": 128, "test-map-cards": 16, "test-media-source": 29, "test-minigames": 52, "test-progress-registers": 18, "test-publish": 178, "test-reset": 10, "test-review-decks": 183,
  "test-revlog": 28, "test-sanitize": 1, "test-sources": 36, "test-speak": 61, "test-spelling": 22, "test-subdecks": 45, "test-tour": 58, "test-truefalse": 19, "test-units": 18,
  "test-video": 58, "test-war-cards": 23, "test-whiteboard": 10, "test-why-markers": 1, "test-window-fallbacks": 217,
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
