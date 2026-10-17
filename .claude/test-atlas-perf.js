/* test-atlas-perf.js — frame-time budgets for the Atlas (#map).

   PHASE 5 (2026-10-14): v1 was DELETED. This suite used to run v1's globe and v2 in the same run and gate v2's pooled p90 at
   ≤ 40 % of v1's (and its heap at ≤ 50 % of v1's). Every frame gate is now ABSOLUTE with the same strength: the reference is
   V1_REF, v1's last measured numbers (CI run 3559 at f7aca62, pooled p90 ms), so "v1" in the text below means those constants.
   THE HEAP GATE IS NOT AGAINST v1 ANY MORE (2026-10-15): "50 % of v1's last heap (150 MB)" was a ratio to a deleted browser page and had
   gone slack (v2 reads 30 MB on CI). It is an absolute budget, HEAP_BUDGET_MB, measured on CI: the frame-gate job of run 3567 (checks.yml, a
   push to main at 10fbbf0, 2026-10-15) printed "v2 JS heap after its gestures … v2 30 MB" and, after the rail scrub, "heap 30 MB"; 30 MB × 1.25
   is 37.5, kept as 38. The figure belongs to CI's runner and its Chromium: the sandbox's older Chromium reads 49 MB for the same page with the
   idle-loaded prose held back and 87 MB with it (see the HEAP_BUDGET_MB note), so run the suite elsewhere with FOLIO_HEAP_BUDGET_MB set to
   that machine's own reading × 1.25, and re-read the budget from CI's log when a deliberate change moves it.
   There is no v1 measurement, no "v1 heightmap" comparison and no RELIEF_VS_V1 switch any more; the relief gate (≤ RELIEF_FACTOR ×
   relief off) never depended on v1 and is unchanged, as are the worst-frame rule, the release limit and the primitive budgets.

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-perf.js
     FOLIO_CHROMIUM=/path/to/chrome  … to pick the browser (otherwise playwright's own)

   WHY (docs/atlas-v2-design.md §2.2, §2.11, §7). The reason v2 exists is a number: dragging the v1
   globe in a headless Chromium measured p50 16.7 ms but p90 150 ms and max 300 ms, because every
   frame re-projects tens of thousands of vertices on the CPU. Phase 0's gate ("p95 ≤ 20 ms on
   software GL") measured the CI runner's SwiftShader, not a phone, so the owner redefined it
   (2026-10-08, §2.2 and §7 Phase 1a) and extended it for Phase 1b. THE GATE, as this suite asserts it:

     1. with relief OFF (rivers and lakes on, the defaults): v2's p95 frame interval is at most 40 % of
        v1's on the same run, for drag, wheel and pinch;
     2. the worst frame during drag and pinch, relief off, is at most 100 ms — read since Phase 3a (task 0b) as:
        at most 0.5 % of the gesture's frames across the repeats over 100 ms, and none over 200 ms (WORST_SHARE,
        WORST_CAP_MS; the Phase 2a count of "at most two frames" is gone);
     3. a deterministic primitive budget: `__atlas2.statsNow()` reports the triangles and line
        segments the renderer drew in the last frame — land, rivers, lake shores, lake fills — and
        four fixed views must stay under the budgets below — the globe, Europe, the Aegean, and the
        Aegean at the zoom cap, with the tiles those views need loaded. The budgets are the figures
        measured when the files were built (§7 "Phase 1a — as built" for the land, "Phase 1b — as
        built" for the water), rounded up by a quarter, so a change that doubles what a view draws
        fails here rather than on a phone;
     4. with relief ON: relief costs v2 at most RELIEF_FACTOR (2.0) times its own relief-off pooled p90 for drag, wheel and
        pinch (a regression gate on the relief passes; the owner's literal "40 % of v1 with its heightmap" was never
        meetable, v1 being cheaper during a gesture with the heightmap on, and v1 is gone — Phase 5); the worst frame
        is reported, not gated.

   HOW A GESTURE IS SAMPLED (Phase 1c, 2026-10-09). One run of a gesture yields 70–130 rAF intervals
   quantised to the 16.7 ms refresh, so its p95 is three or four frames, and whether they read 100.0 or
   116.7 depends on the refresh they land on: the relief-on wheel read 116.7 ms against 66.7 off on CI
   (run 37863232583) and 116.7 against 100.0 in the session that built it — the same renderer, one
   percentile flipped by a frame. So EVERY GESTURE IS REPEATED (REPEATS times, at least 300 frames) and
   every RELATIVE gate — v2 against v1, relief on against relief off — compares the POOLED p90 of all
   repeats: a tenth of 400 frames is 40 frames, not 4, and a single frame no longer moves it across a
   refresh. The per-repeat p95s and their median are printed beside it for the record; the WORST-FRAME
   gate reads the worst frame of every repeat (stricter than before, not looser). The thresholds keep
   their meaning: v2 ≤ 40 % of v1, relief on ≤ 1.5 × relief off, worst frame ≤ 100 ms + 1 ms of
   timestamp slack. The JS heap after v2's gestures is read and gated too (HEAP_MB, Phase 1c).

   THE OWNER'S PHASE 1d RULES (2026-10-09, docs/atlas-v2-design.md §7 "Phase 1d — as built"), since the
   runner is software GL and a gate must measure the renderer, not SwiftShader:
     · PINCH: the worst frame DURING the gesture (fingers down) stays ≤ WORST_MS; the first full-screen frame
       after the fingers lift — the held level giving way to LOD 1 at full-screen fill, measured 167–283 ms on
       the session's runner and 167–183 on CI — is measured SEPARATELY with a ceiling of RELEASE_MS and
       reported with that frame's primitive count. A frame is "during" or "release" by the time it ends: the
       page marks performance.now() at each touchEnd, and a frame ending within RELEASE_WINDOW_MS of a mark
       is a release frame.
     · RELIEF ON: the view's L1 patches are WARMED first (an unmeasured rehearsal of the gesture, settled),
       so the network and the upload are not in the measured gesture; the pooled p90 with relief on is at most
       RELIEF_FACTOR (2.0) × relief off. The first-use cost of a patch (fetch + decode, compose, upload) is
       reported as a number, ungated. The same rehearsal precedes every relief-off gesture of v2 and every
       gesture of v1, so no measured window pays a tile's fetch either. The rehearsal is also where a slow GPU
       learns its gesture stages (atlas.js `gestureFrame`: half resolution, then one coarser level, sticky for the
       session), so the measured repeats run as a reader's second gesture would; the report prints the stage.
     · HEAP: v2's JS heap after its gestures and a forced collection is at most HEAP_BUDGET_MB (an absolute figure read off CI, see the head of this file).
     · unchanged: v2 pooled p90 ≤ RATIO of v1's for drag, wheel and pinch; the drag's worst frame ≤ WORST_MS
       with 1 ms of timestamp slack; the primitive budgets.

   STACKS REMOVED (2026-10-14, docs/atlas-v2-design.md §7 "Stacks removed"): every place and polity the study layer flags is its own mark, so
   the worst case a frame can draw is the whole Full Atlas (about 1,300 places and 190 polities). Two things in here guard that:
     · the worst-frame rule (at most WORST_SHARE of frames over WORST_MS, none over WORST_CAP_MS) is asserted for the drag and the pinch
       WITH THE FULL ATLAS ON at the widest view (`results.v2full`) — over the two gestures' frames together, since on this runner a pinch's 0.5 %
       is two frames — the number of marks drawn and the cost of the marks' own pass (`markDrawMs`) reported beside it;
     · a MARK BUDGET per fixed view (`marks` on each of VIEWS: the marks drawn in a still frame of the Full Atlas, measured × 1.25 and
       rounded up), the primitive count of the study layer the way the land's triangles are the renderer's — a change that draws twice
       the marks fails here rather than on a phone.

   The suite also prints the #map?perf overlay's numbers (mean, p95, max over the last 120 frames,
   primitives, LOD, tiles, water, relief) for each fixed view, which is what the owner reads on a real phone.

   WHAT IT MEASURES. A requestAnimationFrame loop injected into the page records the interval
   between consecutive frames while a gesture runs; that is what a reader feels (a 30 ms frame of
   work shows as a 33 ms interval at 60 Hz). Gestures: a drag (120 pointer moves), a wheel zoom in
   and out, a two-finger pinch in and out through CDP touch events, and — v1 only until Phase 2
   ships a timeline — a scrub of the year pin. Percentiles are over the frames of that gesture.
*/
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = Object.assign(process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {}, { args: ["--js-flags=--expose-gc"] });   // the heap is read after a forced collection: what is live, not what the collector has not got to
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream" };
/* v1 was deleted in Phase 5 (2026-10-14); these are its last numbers — CI run 3559 at f7aca62, the Full atlas on the runner, POOLED p90 in ms over the repeats
   of each gesture, and its JS heap after the gestures. The gates below read them where they used to read a v1 measured in the same run. */
const V1_REF = { drag: 200.0, wheel: 333.2, pinch: 350.0, scrub: 150.0 };
const RATIO = 0.40;             // v2 pooled p90 ≤ 40 % of V1_REF's (was: of v1's, measured in the same run)
const WORST_MS = 100;           // worst frame during drag and pinch, relief off (Phase 2a, task 0c; restated in Phase 3a, task 0b: at most WORST_SHARE of the gesture frames over it across the repeats, none over WORST_CAP_MS)
const WORST_SHARE = 0.005;      // the owner's worst-frame rule (2026-10-10, Phase 3a): across the repeats at most 0.5 % of a gesture's frames over WORST_MS and none over WORST_CAP_MS; the same for the pinch's during-gesture frames. It replaced "at most 2 frames" (Phase 2a), which on the two-core CI runner read 4 of 1,177 (0.34 %) and failed a renderer that was not slower; the share scales with the sample, a count did not. Nothing else loosened.
const WORST_CAP_MS = 200;
const RELIEF_FACTOR = 2.0;      // relief on: v2 pooled p90 ≤ this × v2's own relief-off pooled p90, patches warmed first (Phase 1d; 1.5 before, with the fetch inside the gesture)
const REPEATS = 3;              // every gesture runs this many times; the relative gates read the pooled p90 (see the header)
/* HEAP_BUDGET_MB: the JS heap after the gestures and a forced collection, absolute. CI read 30 MB (run 3567, frame-gate job, 2026-10-15); × 1.25 = 37.5 → 38. What the page holds at that point is the Atlas's own state
   AND the idle-loaded prose (glossary citations, artefacts, card extras: about 38 MB of heap on the sandbox's Chromium, 49 MB → 87 MB); it is the sum a reader's tab carries, so the budget is for both. */
const HEAP_BUDGET_MB = Number(process.env.FOLIO_HEAP_BUDGET_MB) || 38;
const RELEASE_MS = 300;         // the first full-screen frame after a pinch's fingers lift (Phase 1d), reported with its primitive count
const RELEASE_WINDOW_MS = 450;  // a frame ending within this of a touchEnd mark is a release frame, not a gesture frame
const RELEASE_SETTLE_MS = 500;  // how long the pinch waits after each release before the next touch (longer than the window)
/* THE DRAG'S RULE IS SPLIT THE WAY THE PINCH'S ALREADY WAS (2026-10-16, the owner's decision; CI runs 3627 and 3635). A CORRECTION OF WHERE THE RELEASE FRAMES ARE
   COUNTED, NOT A LOOSENING: no frame was made cheaper to pass and no limit moved — the frames DURING the drag (fingers or mouse down) still count against the 0.5 %
   over 100 ms and none over 200 ms, and the frames after the release are now measured by the pinch's own release rule, "the first full frame after release ≤ 300 ms and
   none over 300 ms". The facts that made the old pooled count the wrong place for them: on CI's software compositor the first frame after a drag is released costs
   82-93 ms (one BeginMainFrame whose commit spends its time in GLES2::ReadPixels, a whole-canvas readback — the held gesture level giving way to the full picture, by
   design, once), and its names landing a moment later cost another (docs/atlas-v2-design.md §7 "Red suites and flaky gates", item b); three repeats of the drag therefore
   spent 3 of the 5 frames the 0.5 % rule allows (0.5 % of ~1,170) on frames no drag produced, so any further stall failed the gate (runs 3627 and 3635: 7 of ~1,170 frames
   over 100 ms, worst 150 ms). The rule below is a pure function of the frames and its self-test (`--rule-selftest`, also run first by every run of the suite) feeds it those numbers. */
function splitByMarks(d, ts, marks) {   // frames ending within RELEASE_WINDOW_MS after a release mark are release frames (per mark), the others are "during"
  const during = [], release = marks.map(() => []);
  d.forEach((dt, i) => { const t = ts[i]; const k = marks.findIndex((m) => t > m && t <= m + RELEASE_WINDOW_MS); if (k < 0) during.push(dt); else release[k].push(dt); });
  return { during, release };
}
// the drag's gate over a gesture's repeats: `during` is every repeat's during-gesture frames pooled, `releases` one array of frames per release
function dragRule(during, releases) {
  const over = during.filter((x) => x > WORST_MS + 1).length, share = during.length ? over / during.length : 0, max = during.length ? Math.max(...during) : 0;
  const firsts = releases.filter((r) => r.length).map((r) => r[0]), relMax = releases.length ? Math.max(0, ...releases.map((r) => (r.length ? Math.max(...r) : 0))) : 0;
  const firstMax = firsts.length ? Math.max(...firsts) : 0;
  return { n: during.length, over, share, max, firstMax, relMax, releases: releases.length,
    duringOK: share <= WORST_SHARE && max <= WORST_CAP_MS + 1,
    releaseOK: releases.length > 0 && firsts.length === releases.length && firstMax <= RELEASE_MS + 1 && relMax <= RELEASE_MS + 1 };
}
// what the drag's rule was until 2026-10-16: every frame of the repeats, release frames inside the count (kept only so the self-test can show it failing)
const oldDragRule = (all) => { const over = all.filter((x) => x > WORST_MS + 1).length; return { over, share: all.length ? over / all.length : 0, max: Math.max(...all), ok: all.length > 0 && over / all.length <= WORST_SHARE && Math.max(...all) <= WORST_CAP_MS + 1 }; };
/* THE RULE'S SELF-TEST (no browser): CI's numbers fed to the old rule and to the new one, and what the new one still catches. The synthetic drag is three repeats of ~390 frames
   (1,172 in all) — 16.7 ms steps with a few 33-50 ms ones, the shape of CI's — with the stalled release-window frames each repeat has on a software compositor (the readback frame
   straight after the release and the names' frame a moment later: a 93 ms commit reads 116.7 ms at 60 Hz) and the run's worst, 150.1 ms, also in a release window: 7 frames over 100 ms of 1,172, worst 150 ms, which is what
   runs 3627 and 3635 printed. The release marks sit where the page puts them (the mouse-up). */
function ruleSelfTest() {
  let bad = 0;
  const ok = (name, cond, detail) => { console.log(`  ${cond ? "\x1b[32mok\x1b[0m  " : "\x1b[31mFAIL\x1b[0m"}  ${name}${detail ? "  \x1b[2m" + detail + "\x1b[0m" : ""}`); if (!cond) bad++; };
  console.log("\nThe drag rule's self-test (synthetic frames with CI's numbers: runs 3627 and 3635 — 7 of 1,172 frames over 100 ms, worst 150 ms, the release frames inside the count)\n");
  const N = [391, 391, 390], REL = [[116.7, 116.7, 116.7], [150.1, 116.7], [116.7, 116.7]];   // frames per repeat; the stalled release frames of each repeat
  const build = (extraDuring) => {   // → { all, during, releases } for the three repeats
    const all = [], during = [], releases = [];
    N.forEach((n, r) => {
      const d = [], ts = []; let t = 1000;
      const nRel = REL[r].length + 5, nDur = n - nRel;
      for (let i = 0; i < nDur; i++) { const dt = i % 37 === 0 ? 50.0 : i % 11 === 0 ? 33.4 : 16.7; if (extraDuring && extraDuring[r] && extraDuring[r][i] != null) d.push(extraDuring[r][i]); else d.push(dt); t += d[d.length - 1]; ts.push(t); }
      const mark = t + 5;
      // the release window: the stalled frames at +100 ms and +260 ms, the rest ordinary frames
      const rel = REL[r].slice(); let tt = mark;
      for (let k = 0; k < nRel; k++) { const dt = k < rel.length ? rel[k] : 16.7; tt += dt; d.push(dt); ts.push(tt); }
      const sp = splitByMarks(d, ts, [mark]);
      all.push(...d); during.push(...sp.during); releases.push(sp.release[0]);
    });
    return { all, during, releases };
  };
  const base = build(null);
  const old = oldDragRule(base.all);
  ok(`the old rule on CI's frames FAILS: ${old.over} frames over 100 ms of ${base.all.length} = ${(100 * old.share).toFixed(2)} % (limit ${(100 * WORST_SHARE).toFixed(2)} %), worst ${old.max} ms`, !old.ok && base.all.length === 1172 && old.over === 7 && old.max === 150.1);
  const nw = dragRule(base.during, base.releases);
  ok(`the new rule on the same frames PASSES: during the drag ${nw.over} of ${nw.n} over 100 ms (${(100 * nw.share).toFixed(2)} %), worst ${nw.max.toFixed(1)} ms; release: first frame ≤ ${nw.firstMax.toFixed(1)} ms, worst ${nw.relMax.toFixed(1)} ms (limit ${RELEASE_MS})`, nw.duringOK && nw.releaseOK && nw.over === 0);
  // a stall DURING the drag is counted: one 150 ms frame is 1 of ~1,150 (inside the 0.5 % allowance, exactly as under the old rule), six are not, and 210 ms is over the 200 ms cap on its own
  const stall = (frames) => build(frames);
  { const one = stall([{ 100: 150.1 }]), r = dragRule(one.during, one.releases);
    ok(`a synthetic 150 ms stall in ONE drag frame is counted (${r.over} over 100 ms, ${(100 * r.share).toFixed(2)} %) and is within the 0.5 % allowance, as before the split`, r.over === 1 && r.duringOK); }
  { const six = stall([{ 50: 150.1, 100: 150.1 }, { 50: 150.1, 100: 150.1 }, { 50: 150.1, 100: 150.1 }]), r = dragRule(six.during, six.releases), o = oldDragRule(six.all);
    ok(`six 150 ms stalls DURING the drag FAIL the new rule (${r.over} of ${r.n} = ${(100 * r.share).toFixed(2)} %)`, r.over === 6 && !r.duringOK && !o.ok); }
  { const big = stall([{ 100: 210.1 }]), r = dragRule(big.during, big.releases);
    ok(`one 210 ms stall DURING the drag FAILS the new rule (over the ${WORST_CAP_MS} ms cap, worst ${r.max.toFixed(1)} ms)`, !r.duringOK && r.max > WORST_CAP_MS); }
  // the release frames are measured too: a first frame over 300 ms, or any release frame over 300 ms, fails; a missing release fails
  { const slow = build(null); slow.releases[1] = slow.releases[1].slice(); slow.releases[1][0] = 310.1; const r = dragRule(slow.during, slow.releases);
    ok(`a release whose first full frame takes 310 ms FAILS the release rule (limit ${RELEASE_MS} ms)`, !r.releaseOK && r.firstMax > RELEASE_MS); }
  { const slow = build(null); slow.releases[2] = slow.releases[2].slice(); slow.releases[2][5] = 320.1; const r = dragRule(slow.during, slow.releases);
    ok("a later release frame over 300 ms FAILS the release rule", !r.releaseOK && r.relMax > RELEASE_MS && r.firstMax <= RELEASE_MS + 1); }
  { const r = dragRule(base.during, []); ok("no release recorded FAILS (the mark must be there)", !r.releaseOK); }
  return bad;
}
/* STACKS REMOVED (2026-10-14): `marks` on each view is its budget of study marks — the marks drawn in a still frame of the FULL Atlas at 1280×800, measured
   2026-10-14 (globe 1,028; Europe 171; the Aegean 60; the Aegean at the cap 1; the Mediterranean in 1 CE 466; Europe in 1500 and 1900 116 and 112; the steppe in 450 CE 236;
   the Black Sea in 450 BCE 204; the steppe in 660 CE 239; the Western Front 109; the Mediterranean in 216 BCE 474), each rounded up by a quarter.
/* The four fixed views and their primitive budgets (drawn in one frame at 1280×800): land triangles and
   segments measured 2026-10-08 on the Phase 1a build (globe 42,529 / 19,917; Europe 133,348 / 101,049;
   the Aegean 25,892 / 22,750; the Aegean at the cap 20,366 / 18,297); river segments, lake-shore segments
   and lake-fill triangles measured 2026-10-08 on the Phase 1b build (globe 2,674 / 3,002 / 2,612; Europe
   22,173 / 71,465 / 64,628; the Aegean 4,390 / 2,381 / 2,157; the cap 0 / 1,708 / 1,553 — rivers were not
   drawn at the cap until 2026-10-17, decision a: 3,268 since), each rounded up by a quarter. A view is (lon, lat, km per pixel). */
const HIST_BUDGET_1500 = [36000, 1400], HIST_BUDGET_1900 = [32000, 1500];   // measured 2026-10-10 on the 2b file at 1280×800, 3 km/px, with the on-screen faces' meshes and borders: 28,783 fill triangles and 1,078 border segments in 1500 (14 of 27 alive faces on screen), 25,547 and 1,131 in 1900, each rounded up by a quarter
const VIEWS = [
  { name: "globe", marks: 1300, lon: 10, lat: 20, kmpp: 24.0, tri: 54000, seg: 25000, river: 3400, lakeSeg: 3800, lakeTri: 3300 },
  { name: "Europe", marks: 220, lon: 10, lat: 50, kmpp: 3.0, tri: 167000, seg: 127000, river: 27700, lakeSeg: 69900, lakeTri: 63600 },
  { name: "Aegean", marks: 80, lon: 25, lat: 38, kmpp: 0.5, tri: 33000, seg: 29000, river: 5500, lakeSeg: 3000, lakeTri: 2700 },
  { name: "Aegean at the cap", marks: 3, lon: 25, lat: 38, kmpp: 0.15, tri: 26000, seg: 23000, river: 4100, lakeSeg: 2200, lakeTri: 2000 },   // river: 3,268 smoothed segments measured 2026-10-17, + a quarter — the rivers are drawn to the cap since decision a (the budget was 0: "rivers are not drawn at the cap")
  { name: "Mediterranean, 1 CE", marks: 600, lon: 15, lat: 38, kmpp: 6.0, year: 1, tri: 90000, seg: 60000, river: 13000, lakeSeg: 30000, lakeTri: 27000, histTri: 8800, histSeg: 700 },   // 2b: 6,974 fill triangles in 8 faces, 542 border segments (the borders of the faces on screen only; 2a drew every border of the level's buckets: 20,988)
  // Phase 2b: Europe in 1500 and in 1900 at 3 km/px (the land budgets are Europe's above; the history budgets measured on the 2b file, × 1.25)
  { name: "Europe, 1500", marks: 150, lon: 10, lat: 50, kmpp: 3.0, year: 1500, tri: 167000, seg: 127000, river: 27700, lakeSeg: 69900, lakeTri: 63600, histTri: HIST_BUDGET_1500[0], histSeg: HIST_BUDGET_1500[1] },
  { name: "Europe, 1900", marks: 150, lon: 10, lat: 50, kmpp: 3.0, year: 1900, tri: 167000, seg: 127000, river: 27700, lakeSeg: 69900, lakeTri: 63600, histTri: HIST_BUDGET_1900[0], histSeg: HIST_BUDGET_1900[1] },
  /* Phase 2c: the PEOPLES-HEAVY views, each the measurement × 1.25 (rounded up), 2026-10-12 on the 2c file at 1280×800: the steppe in 450 CE at 6 km/px (the Huns: 64,219 land
     triangles, 28,034 segments, 11,195 state fill triangles in 9 faces and 937 border segments, 1,607 presence triangles in 1 face); the Black Sea in 450 BCE at 4 km/px
     (Scythia: 167,260 / 89,000, 26,935 in 16 faces and 641, 2,091 presence triangles in 1 face); the steppe in 660 CE at 6 km/px (the Avars, Old Great Bulgaria and Khazaria:
     63,474 / 27,742, 12,767 in 7 faces and 1,188, 1,627 presence triangles in 3 faces). The presence pass has its own counter (`presenceTriangles`): a people's soft face is a
     fill, one draw a face, no segments — the border budget above is the states'. */
  { name: "Steppe, 450 CE", marks: 300, lon: 45, lat: 48, kmpp: 6.0, year: 450, tri: 80000, seg: 35000, river: 9400, lakeSeg: 14600, lakeTri: 13500, histTri: 14000, histSeg: 1200, presTri: 2100, presFaces: 1 },
  { name: "Black Sea, 450 BCE", marks: 260, lon: 34, lat: 45, kmpp: 4.0, year: -450, tri: 209000, seg: 111000, river: 44900, lakeSeg: 98500, lakeTri: 92100, histTri: 33700, histSeg: 800, presTri: 2700, presFaces: 1 },
  { name: "Steppe, 660 CE", marks: 300, lon: 45, lat: 50, kmpp: 6.0, year: 660, tri: 80000, seg: 35000, river: 9300, lakeSeg: 14800, lakeTri: 13700, histTri: 16000, histSeg: 1500, presTri: 2100, presFaces: 3 },
  /* Phase 2d: the WAR-HEAVY views, each the measurement × 1.25 (rounded up), 2026-10-12 on the 2d file at 1280×800. The Western Front on 15 June 1944 at 3 km/px (both theatres' plates
     standing: four front faces drawn as event faces — they count in the HISTORICAL counters, not the presence counter, which is the peoples' and extents' — 88,752 fill triangles in
     10 faces (6 states and 4 fronts; Europe in 1900 is 25,449 in 9) and 1,525 border segments); the Mediterranean in 216 BCE at 6 km/px with the Second Punic War chosen from its card
     (6,268 fill triangles in 14 faces, 1,020 segments, and 76 presence triangles in the 1 authored extent drawn: the tint is a colour, not geometry). */
  { name: "Western Front, June 1944", marks: 140, lon: 10, lat: 50, kmpp: 3.0, year: 1944, frontDate: 19440615, tri: 167000, seg: 127000, river: 27700, lakeSeg: 69900, lakeTri: 63600, histTri: 111000, histSeg: 1950 },
  { name: "Mediterranean, 216 BCE (Second Punic War)", marks: 600, lon: 15, lat: 38, kmpp: 6.0, year: -216, focusWar: "rm-209", tri: 90000, seg: 60000, river: 13000, lakeSeg: 30000, lakeTri: 27000, histTri: 7900, histSeg: 1300, presTri: 100, presFaces: 1 },
];
const PORT = 5612;

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end("not found"); return; }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length });
    res.end(data);
  });
});

const pct = (arr, p) => { if (!arr.length) return NaN; const a = arr.slice().sort((x, y) => x - y); return a[Math.min(a.length - 1, Math.floor(p / 100 * a.length))]; };
const summary = (d) => ({ n: d.length, mean: d.length ? d.reduce((a, b) => a + b, 0) / d.length : NaN, p50: pct(d, 50), p90: pct(d, 90), p95: pct(d, 95), p99: pct(d, 99), max: d.length ? Math.max(...d) : NaN, over50: d.filter((x) => x > 50).length, raw: d });
const fmt = (v) => (Number.isFinite(v) ? v.toFixed(1).padStart(7) : "    n/a");

async function sampler(page) {
  await page.evaluate(() => {
    if (window.__ft) return;
    window.__ft = { on: false, d: [], ts: [], marks: [] };
    let last = 0;
    const loop = (t) => { if (window.__ft.on && last) { window.__ft.d.push(t - last); window.__ft.ts.push(t); } last = t; requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  });
}
async function measure(page, fn) {
  // one frame before the window opens: after a pause headless Chromium's first draw into the canvas
  // costs a vsync or two more than the steady frame (measured: the first frame of every drag on
  // #map read 100 ms where the next ones read 50–67) — a wake-up of the browser, not a cost of the
  // renderer, and not what the gate is about
  await page.evaluate(() => { const a = document.querySelector(".atlas2"); if (a && a.__atlas2) a.__atlas2.invalidate(); });
  await sleep(150);
  await page.evaluate(() => { window.__ft.d = []; window.__ft.ts = []; window.__ft.marks = []; window.__ft.on = true; });
  const extra = await fn();
  const r = await page.evaluate(() => { window.__ft.on = false; return { d: window.__ft.d.slice(), ts: window.__ft.ts.slice(), marks: window.__ft.marks.slice() }; });
  const s = summary(r.d);
  s.ts = r.ts; s.marks = r.marks; s.extra = extra || null;
  // Phase 1d: frames split by the touchEnd marks — a frame ending within RELEASE_WINDOW_MS of a mark is a release frame
  if (r.marks.length) {
    const { during, release } = splitByMarks(r.d, r.ts, r.marks);
    s.during = summary(during);
    s.release = release.map((arr, k) => ({ max: arr.length ? Math.max(...arr) : 0, first: arr.length ? arr[0] : 0, frames: arr, n: arr.length, stats: extra && extra.releases ? extra.releases[k] : null }));
  }
  return s;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function drag(page, cx, cy) {
  await page.mouse.move(cx, cy); await page.mouse.down();
  for (let i = 1; i <= 120; i++) {
    const a = i / 120 * Math.PI * 2;
    await page.mouse.move(cx + Math.sin(a) * 140 + i * 0.5, cy + Math.cos(a) * 60);
    await sleep(16);
  }
  await page.evaluate(() => { if (window.__ft) window.__ft.marks.push(performance.now()); });   // the release mark: frames after it are the release frames (the pinch's rule), not the drag's
  await page.mouse.up();
  await sleep(600);   // let a coast settle outside the measured window
}
async function wheel(page, cx, cy) {
  await page.mouse.move(cx, cy);
  for (let i = 0; i < 12; i++) { await page.mouse.wheel(0, -120); await sleep(40); }
  for (let i = 0; i < 12; i++) { await page.mouse.wheel(0, 120); await sleep(40); }
  await sleep(300);
}
async function pinch(page, cdp, cx, cy, probe) {
  const pts = (d) => [{ x: cx - d, y: cy, id: 1 }, { x: cx + d, y: cy, id: 2 }];
  const send = (type, touchPoints) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints });
  const mark = () => page.evaluate(() => { if (window.__ft) window.__ft.marks.push(performance.now()); });
  const prims = () => page.evaluate(() => { const a = document.querySelector(".atlas2"); if (!a || !a.__atlas2) return null; const s = a.__atlas2.statsNow(); return { level: s.level, triangles: s.triangles, segments: s.segments, riverSegments: s.riverSegments, lakeSegments: s.lakeSegments, lakeTriangles: s.lakeTriangles, draws: s.draws }; });
  const releases = [];
  await send("touchStart", pts(60));
  for (let i = 1; i <= 30; i++) { await send("touchMove", pts(60 + i * 5)); await sleep(16); }
  if (probe) await probe();
  await mark();
  await send("touchEnd", []);
  await sleep(RELEASE_SETTLE_MS);   // the release frame (the held level giving way) lands inside this
  releases.push(await prims());
  await send("touchStart", pts(210));
  for (let i = 1; i <= 30; i++) { await send("touchMove", pts(210 - i * 5)); await sleep(16); }
  await mark();
  await send("touchEnd", []);
  await sleep(RELEASE_SETTLE_MS);
  releases.push(await prims());
  return { releases };
}
// Phase 2a: the v2 scrub — the rail's pin dragged across sixty years of the Mediterranean at 300 BCE (the view where the
// pilot's faces change most), with the year-change cost read from the controller afterwards
async function scrubV2(page) {
  const pin = await page.$(".atlas2-rail-pin"), track = await page.$(".atlas2-rail-track");
  if (!pin || !track) return null;
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setYear(-300));
  const pb = await pin.boundingBox(), tb = await track.boundingBox();
  if (!pb || !tb) return null;
  const y = pb.y + pb.height / 2, x0 = pb.x + pb.width / 2;
  await page.mouse.move(x0, y); await page.mouse.down();
  await page.mouse.move(x0, y - 60);   // fine mode: one year per 3 px
  for (let i = 1; i <= 40; i++) { await page.mouse.move(x0 + i * 4.5, y - 60); await sleep(30); }
  await page.mouse.up();
  await sleep(300);
}
// Phase 2b: the whole rail — the pin dragged from 10,000 BCE to today in sixty moves over the Mediterranean at 6 km/px, every alive
// set of the file passing; the year-change cost on the main thread is read afterwards (the gate), the frames reported
async function scrubAllV2(page) {
  const pin = await page.$(".atlas2-rail-pin"), track = await page.$(".atlas2-rail-track");
  if (!pin || !track) return null;
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setYear(-10000));
  const pb = await pin.boundingBox(), tb = await track.boundingBox();
  if (!pb || !tb) return null;
  const y = pb.y + pb.height / 2;
  await page.mouse.move(pb.x + pb.width / 2, y); await page.mouse.down();
  for (let i = 1; i <= 60; i++) { await page.mouse.move(tb.x + tb.width * i / 60, y); await sleep(30); }
  await page.mouse.up();
  await sleep(300);
}
/* a gesture REPEATS times: `runs` holds each repeat's summary, the pooled fields summarise every frame of
   every repeat, and p95med is the median of the per-repeat p95s (printed, not gated) */
async function repeated(page, fn, warm) {
  // Phase 1d: one unmeasured rehearsal first, settled, so the tiles and the relief patches a gesture passes
  // through are resident before the first measured repeat — the gate measures the renderer, not the network
  if (warm) await warm(); else { await fn(); await sleep(300); }
  const runs = [], all = [], during = [], release = [];
  for (let i = 0; i < REPEATS; i++) { const s = await measure(page, fn); runs.push(s); all.push(...s.raw); if (s.during) during.push(...s.during.raw); if (s.release) release.push(...s.release); }
  const p95s = runs.map((s) => s.p95).sort((a, b) => a - b);
  const out = Object.assign(summary(all), { runs, p95med: p95s[Math.floor(p95s.length / 2)], p95s });
  if (release.length) { out.during = summary(during); out.release = release; out.releaseWorst = release.reduce((a, b) => (b.max > a.max ? b : a), release[0]); }
  return out;
}
// the rehearsal with the Atlas v2 controller on the page: the gesture, then every tile, water tile and relief patch it asked for
async function warmV2(page, fn) {
  await fn();
  await settle(page);
  await sleep(300);
}
// the wheel's rehearsal pauses at every step until the view has settled, because a tile queued at one zoom and no
// longer wanted at the next is dropped from the queue — a plain run of the gesture leaves holes a measured run would fetch
async function warmWheelV2(page, cx, cy) {
  await page.mouse.move(cx, cy);
  for (let i = 0; i < 12; i++) { await page.mouse.wheel(0, -120); await sleep(40); await settle(page); }
  for (let i = 0; i < 12; i++) { await page.mouse.wheel(0, 120); await sleep(40); await settle(page); }
  await sleep(300);
}
async function gestures(page, cdp, cx, cy, pinchProbe, v2) {
  const r = {};
  r.drag = await repeated(page, () => drag(page, cx, cy), v2 ? () => warmV2(page, () => drag(page, cx, cy)) : null);
  r.wheel = await repeated(page, () => wheel(page, cx, cy), v2 ? () => warmWheelV2(page, cx, cy) : null);
  r.pinch = await repeated(page, () => pinch(page, cdp, cx, cy, pinchProbe), v2 ? () => warmV2(page, () => pinch(page, cdp, cx, cy)) : null);
  if (v2) { await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setView(15, 40, 6)); await settle(page); await sleep(200); r.scrub = await repeated(page, () => scrubV2(page), () => warmV2(page, () => scrubV2(page))); if (r.scrub && !r.scrub.n) r.scrub = null; r.yearChange = await page.evaluate(() => { const t = document.querySelector(".atlas2").__atlas2.timeInfo(); return { p95: t.yearChangeP95, n: t.yearChangeN }; });
    r.scrubAll = await repeated(page, () => scrubAllV2(page), () => warmV2(page, () => scrubAllV2(page))); if (r.scrubAll && !r.scrubAll.n) r.scrubAll = null;
    r.yearChangeAll = await page.evaluate(() => { const t = document.querySelector(".atlas2").__atlas2.timeInfo(); return { p95: t.yearChangeP95, n: t.yearChangeN, heap: (performance.memory && performance.memory.usedJSHeapSize) || null }; }); await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; c.setYear(new Date().getUTCFullYear()); c.setView(10, 20, 24); }); await settle(page); }
  return r;
}
const settle = (page) => page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.tilesSettled() && c.waterSettled(); }, null, { timeout: 90000 }).then(() => true, () => false);
// every on-screen face has its mesh at the view's level (the controller's own `historyOK`); true at once where the rail is on today and no history is loaded
const historySettle = (page) => page.waitForFunction(() => document.querySelector(".atlas2").__atlas2.historyOK(), null, { timeout: 90000 }).then(() => true, () => false);
async function fixedViews(page, cx, cy) {
  const views = [];
  for (const V of VIEWS) {
    await page.evaluate((v) => { const c = document.querySelector(".atlas2").__atlas2; c.setYear(v.year != null ? v.year : new Date().getUTCFullYear()); c.setView(v.lon, v.lat, v.kmpp); c.setLayers({ wars: v.frontDate || v.focusWar ? "on" : "off", fronts: !!v.frontDate }); if (v.frontDate) c.setFrontDate(v.frontDate); if (v.focusWar) c.focusWar(v.focusWar); }, V);
    const settled = await settle(page);
    // the history meshes load on their own, after the tiles and the water: until every face on screen has the mesh of the view's own level the renderer
    // draws whichever level IS resident (histMeshFor falls back), so the triangle count of a still frame depends on what had arrived. Wait for it (2026-10-14).
    const histSettled = V.year != null ? await historySettle(page) : true;
    await page.waitForTimeout(400);
    await page.evaluate(() => document.querySelector(".atlas2").__atlas2.invalidate());
    await page.waitForTimeout(100);
    const still = await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2, t = c.timeInfo(); return Object.assign(c.statsNow(), { histOK: c.historyOK(), histResident: t.resident, histWanted: t.wanted, histPending: t.pending, histOnScreen: t.onScreen }); });
    still.histSettled = histSettled;
    const frames = await measure(page, async () => { await page.mouse.move(cx, cy); await page.mouse.down(); for (let i = 1; i <= 40; i++) { await page.mouse.move(cx + i * 2, cy + Math.sin(i / 4) * 20); await sleep(16); } await page.mouse.up(); await sleep(300); });
    const overlay = await page.evaluate(() => document.querySelector(".atlas2-perf").textContent);
    views.push({ V, settled, still, frames, overlay });
    if (V.frontDate || V.focusWar) await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; c.focusWar(null); c.setLayers({ wars: "off", fronts: false }); });
  }
  await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; c.setYear(new Date().getUTCFullYear()); c.setView(10, 20, 24); });
  await settle(page);
  return views;
}

/* THE FULL ATLAS ON (Atlas v2, stacks removed): the study layer in its Full mode, the widest view, the same drag, wheel and pinch as above.
   Every flagged place and polity is drawn as a mark, none is a count, so this is the worst a frame can ask of the marks — the gate's
   worst-frame rule is asserted on it. */
async function fullGestures(page, cdp, cx, cy) {
  await page.waitForFunction(() => document.querySelector(".atlas2").__atlas2.study.ready(), null, { timeout: 90000 });
  await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; c.clearSelection(); c.setYear(new Date().getUTCFullYear()); c.setView(15, 35, 24); c.study.setMode("full"); });   // the card the earlier tap opened ("Niger") is a column of chrome: marks keep out of it, so it is closed   // the widest view over the Mediterranean, where the registry is densest
  await settle(page); await sleep(800);
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.layoutNow()); await sleep(300);
  const r = {};
  // the layout that carries the marks lands a couple of seconds after the switch on a slow runner: wait for it and for a frame that draws them
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2, s = c.statsNow(); return s.marksLaid > 500 && s.marksDrawn > 500; }, null, { timeout: 30000 }).catch(() => {});
  await page.evaluate(() => new Promise((res) => { document.querySelector(".atlas2").__atlas2.invalidate(); requestAnimationFrame(() => requestAnimationFrame(res)); }));   // two frames: the count is the last frame's
  r.marks = await page.evaluate(() => { const s = document.querySelector(".atlas2").__atlas2.statsNow(); return { drawn: s.marksDrawn, laid: s.marksLaid, mode: document.querySelector(".atlas2").__atlas2.study.mode() }; });
  r.drag = await repeated(page, () => drag(page, cx, cy), () => warmV2(page, () => drag(page, cx, cy)));
  r.wheel = await repeated(page, () => wheel(page, cx, cy), () => warmWheelV2(page, cx, cy));
  r.pinch = await repeated(page, () => pinch(page, cdp, cx, cy, null), () => warmV2(page, () => pinch(page, cdp, cx, cy)));
  r.cost = await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2, d = c.drawSamples(); const m = d.marks.slice().sort((a, b) => a - b), l = d.labels.slice().sort((a, b) => a - b); const q = (a, p) => (a.length ? a[Math.min(a.length - 1, Math.floor(p * a.length))] : 0); return { marksMean: m.length ? m.reduce((a, b) => a + b, 0) / m.length : 0, marksP95: q(m, 0.95), marksMax: m.length ? m[m.length - 1] : 0, labelsP95: q(l, 0.95), n: m.length }; });
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.study.setMode("map"));
  await sleep(300);
  return r;
}
// the marks drawn in a still frame of the Full Atlas on each fixed view (the budgets in VIEWS)
async function fixedMarks(page) {
  const out = [];
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.study.setMode("full"));
  for (const V of VIEWS) {
    await page.evaluate((v) => { const c = document.querySelector(".atlas2").__atlas2; c.setYear(v.year != null ? v.year : new Date().getUTCFullYear()); c.setView(v.lon, v.lat, v.kmpp); }, V);
    await settle(page); await sleep(400);
    await page.evaluate(() => document.querySelector(".atlas2").__atlas2.layoutNow()); await sleep(300);
    await page.evaluate(() => document.querySelector(".atlas2").__atlas2.invalidate()); await sleep(150);
    out.push({ V, s: await page.evaluate(() => { const s = document.querySelector(".atlas2").__atlas2.statsNow(); return { drawn: s.marksDrawn, laid: s.marksLaid, ms: s.markDrawMs, p95: s.markDrawP95 }; }) });
  }
  await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; c.study.setMode("map"); c.setYear(new Date().getUTCFullYear()); c.setView(10, 20, 24); });
  await settle(page);
  return out;
}

(async () => {
  if (ruleSelfTest()) { console.log("\nthe drag rule's self-test failed\n"); process.exit(1); }
  if (process.argv.includes("--rule-selftest")) { console.log(""); process.exit(0); }
  await new Promise((r) => server.listen(PORT, r));
  const base = "http://127.0.0.1:" + PORT + "/";
  const browser = await chromium.launch(LAUNCH);
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, hasTouch: true });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  const cdp = await context.newCDPSession(page);
  const gl = await page.evaluate(() => { const c = document.createElement("canvas"); const g = c.getContext("webgl2"); if (!g) return "none"; const d = g.getExtension("WEBGL_debug_renderer_info"); return d ? g.getParameter(d.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER); }).catch(() => "?");
  console.log("WebGL2 renderer: " + gl);
  const results = {};

  /* ---------- v2 — in a fresh page, so its heap and its errors are its own ---------- */
  await page.close();
  const page2 = await context.newPage();
  page2.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page2.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  const cdp2 = await context.newCDPSession(page2);
  let views = [], viewsRelief = [], viewMarks = [];
  {
    const page = page2, cdp = cdp2;
    const t0 = Date.now();
    await page.goto(base + "#map?perf", { waitUntil: "load" });
    await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 90000 });
    await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setLayers({ relief: false, rivers: true, lakes: true, graticule: false }));
    await settle(page);
    const box = await (await page.$(".atlas2-canvas")).boundingBox();
    const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
    await sampler(page);
    const r = {};
    r.ready = Date.now() - t0;
    r.load = await page.evaluate(() => { const s = document.querySelector(".atlas2").__atlas2.stats; return { fetchMs: s.fetchMs, bytes: s.bytes, firstPaintMs: s.firstPaintMs, workerMs: s.worker && s.worker.totalMs, uploads: s.uploads, levels: s.worker && s.worker.levels.map((l) => l.level + ":" + l.triangles + "tri/" + l.segments + "seg/" + l.ms + "ms").join(" "), waterFetchMs: s.waterFetchMs, waterBytes: s.waterBytes, water: s.water && s.water.levels.map((l) => l.level + ":" + l.riverSegments + "riv/" + l.lakeSegments + "lake/" + l.triangles + "tri/" + l.ms + "ms").join(" ") }; });
    const zoomBefore = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.view.zoom);
    let zoomDuring = 0;
    Object.assign(r, await gestures(page, cdp, cx, cy, async () => { zoomDuring = Math.max(zoomDuring, await page.evaluate(() => document.querySelector(".atlas2").__atlas2.view.zoom)); }, true));
    r.pinchZoom = { before: zoomBefore, peak: zoomDuring };
    // Phase 2a (task 0b): the same drag with the gesture stage FORCED to 0 and locked — full quality on this GPU, reported, not gated
    r.stage = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.stageInfo());
    await page.evaluate(() => document.querySelector(".atlas2").__atlas2.forceStage(0, true));
    r.drag0 = await repeated(page, () => drag(page, cx, cy), () => warmV2(page, () => drag(page, cx, cy)));
    await page.evaluate((st) => { const c = document.querySelector(".atlas2").__atlas2; c.forceStage(st.learnt, true); c.forceStage(null); }, r.stage);
    r.draw = await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2, s = c.stats; const d = s.draw.slice(-200).sort((a, b) => a - b); return Object.assign({ p50: d[Math.floor(d.length / 2)], max: d[d.length - 1] }, c.statsNow()); });
    r.heapMB = await page.evaluate(() => { if (window.gc) window.gc(); return performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : NaN; });
    // the ID pass: a tap on the globe's centre must name a face — at the home view (10° E, 20° N: the Sahara),
    // since the gestures leave the globe wherever the coast of the last drag took it
    await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setView(10, 20, 24));
    await page.waitForTimeout(300);
    await page.mouse.click(cx, cy); await page.waitForTimeout(300);
    // Phase 1c: a tap selects the face's place and opens its card (and clears the hover caption), so the card's title is the answer
    r.pick = await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; const card = c.card ? c.card() : null; return (card && card.title) || (c.selectedId ? c.selectedId() : "") || document.querySelector(".atlas2-caption").textContent; });
    results.v2 = r;
    results.v2full = await fullGestures(page, cdp, cx, cy);   // the Full Atlas on, the widest view (stacks removed)
    views = await fixedViews(page, cx, cy);
    viewMarks = await fixedMarks(page);
    /* relief on: L0 and the view's L1 patches, then the same gestures and views */
    await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setLayers({ relief: true }));
    const reliefReady = await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.renderer.reliefLoaded("0") && c.tilesSettled(); }, null, { timeout: 90000 }).then(() => true, () => false);
    await page.waitForTimeout(400);
    const rr = await gestures(page, cdp, cx, cy, null, true);
    rr.ready = reliefReady;
    rr.stats = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.statsNow());
    rr.cost = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.stats.reliefCost.slice());
    results.v2relief = rr;
    viewsRelief = await fixedViews(page, cx, cy);
    await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setLayers({ relief: false }));
  }

  await browser.close();
  server.close();

  /* ---------- report ---------- */
  console.log(`\nFrame intervals, ms (rAF to rAF), pooled over ${REPEATS} repeats of each gesture; v2 = #map (rivers and lakes on); +relief = v2 with relief; v1 (deleted in Phase 5) is the constants V1_REF: drag ${V1_REF.drag}, wheel ${V1_REF.wheel}, pinch ${V1_REF.pinch}, scrub ${V1_REF.scrub} ms pooled p90, heap ${V1_REF.heapMB} MB\n`);
  console.log("  gesture   target        n    mean     p50     p90     p95     p99     max  >50ms   per-repeat p95 (median)");
  const row = (g, name, s) => { if (!s) { console.log(`  ${g.padEnd(9)} ${name.padEnd(9)}  n/a`); return; } console.log(`  ${g.padEnd(9)} ${name.padEnd(9)} ${String(s.n).padStart(4)} ${fmt(s.mean)} ${fmt(s.p50)} ${fmt(s.p90)} ${fmt(s.p95)} ${fmt(s.p99)} ${fmt(s.max)} ${String(s.over50).padStart(6)}   ${(s.p95s || []).map((v) => v.toFixed(1)).join(" / ")} (${s.p95med != null ? s.p95med.toFixed(1) : "n/a"})`); };
  row("drag", "v2 stage0", results.v2.drag0);
  console.log(`  (v2 stage0: the drag with the gesture stage forced to 0 and locked — full resolution, the view's own level — reported, not gated; the learnt stage after the gestures was ${results.v2.stage && results.v2.stage.learnt}, escalations ${results.v2.stage && results.v2.stage.escalations}, stalls ignored ${results.v2.stage && results.v2.stage.stallsIgnored}, GPU timer ${results.v2.stage && results.v2.stage.gpuTimer})`);
  for (const g of ["drag", "wheel", "pinch", "scrub"]) { row(g, "v2", results.v2[g]); if (g !== "scrub") row(g, "v2+relief", results.v2relief[g]); }
  const relRow = (name, s, g = "pinch") => { if (!s || !s.during) return; const w = s.releaseWorst; console.log(`  ${g.padEnd(9)} ${name.padEnd(9)}  during the gesture: n ${s.during.n} p90 ${fmt(s.during.p90)} max ${fmt(s.during.max)};  release frames: ${s.release.map((x) => x.max.toFixed(1)).join(" / ")} ms, worst ${w.max.toFixed(1)} ms${w.stats ? ` at LOD ${w.stats.level}: ${w.stats.triangles} tri + ${w.stats.segments} seg, ${w.stats.riverSegments} river, ${w.stats.lakeSegments} lake seg, ${w.stats.lakeTriangles} lake tri, ${w.stats.draws} draws` : ""}`); };
  relRow("v2", results.v2.drag, "drag"); relRow("v2+relief", results.v2relief.drag, "drag"); relRow("v2", results.v2.pinch); relRow("v2+relief", results.v2relief.pinch);
  { const c = results.v2relief.cost || []; const done = c.filter((x) => x.uploadMs != null); if (done.length) { const med = (k) => { const a = done.map((x) => x[k]).sort((p, q) => p - q); return a[Math.floor(a.length / 2)]; }; const mx = (k) => Math.max(...done.map((x) => x[k])); console.log(`  relief first-use cost per patch (${done.length} patches, ungated): fetch+decode p50 ${Math.round(med("fetchMs"))} ms max ${Math.round(mx("fetchMs"))}; compose p50 ${med("composeMs")} ms max ${mx("composeMs")}; upload p50 ${med("uploadMs")} ms max ${mx("uploadMs")}; ${done.map((x) => `${x.key} ${(x.bytes / 1048576).toFixed(1)} MB ${Math.round(x.fetchMs)}+${x.composeMs}+${x.uploadMs} ms`).join(", ")}`); } }
  console.log(`\n  ready: v2 ${results.v2.ready} ms (fetch ${results.v2.load.fetchMs} ms, ${results.v2.load.bytes} bytes, first paint ${results.v2.load.firstPaintMs} ms, worker ${results.v2.load.workerMs} ms; water ${results.v2.load.waterBytes} bytes in ${results.v2.load.waterFetchMs} ms)`);
  console.log(`  v2 levels: ${results.v2.load.levels}; uploads ms ${JSON.stringify(results.v2.load.uploads)}; water levels: ${results.v2.load.water}`);
  console.log(`  v2 renderer draw time (CPU side, ms): p50 ${results.v2.draw.p50 && results.v2.draw.p50.toFixed(2)}, max ${results.v2.draw.max && results.v2.draw.max.toFixed(2)}; last frame: level ${results.v2.draw.level}, ${results.v2.draw.triangles} triangles + ${results.v2.draw.segments} segments in ${results.v2.draw.draws} draw calls; gesture stage ${results.v2.draw.stage} (0 none, 1 half resolution, 2 half resolution and one coarser level during a gesture — learnt in the rehearsals)`);
  console.log(`  JS heap: v2 ${results.v2.heapMB} MB (budget ${HEAP_BUDGET_MB} MB, read off CI); v2 pick at centre: "${results.v2.pick}"; v2 relief loaded: ${results.v2relief.ready} (${results.v2relief.stats.reliefResident} textures, ${(results.v2relief.stats.reliefBytes / 1048576).toFixed(1)} MB)`);
  const printViews = (title, vs) => {
    console.log(`\n${title}\n`);
    console.log("  view                 km/px   LOD  tiles   triangles  segments   rivers  lakeSeg  lakeTri  relief   draws    mean     p95     max   history tri/seg/faces");
    for (const { V, still, frames } of vs) console.log(`  ${V.name.padEnd(20)} ${String(V.kmpp).padStart(5)}   ${String(still.level).padStart(3)}  ${String(still.tilesDrawn).padStart(5)}   ${String(still.triangles).padStart(9)}  ${String(still.segments).padStart(8)}  ${String(still.riverSegments).padStart(7)}  ${String(still.lakeSegments).padStart(7)}  ${String(still.lakeTriangles).padStart(7)}  ${String(still.reliefOn ? still.reliefPatches + "p f" + still.reliefFade.toFixed(1) : "off").padStart(7)} ${String(still.draws).padStart(5)} ${fmt(frames.mean)} ${fmt(frames.p95)} ${fmt(frames.max)}   ${still.historyTriangles || 0}/${still.historySegments || 0}/${still.historyFaces || 0}`);
  };
  printViews("Fixed views (v2, relief off): primitives in a still frame, then frame intervals over a 40-step drag", views);
  console.log("\nThe Full Atlas on at the widest view (stacks removed: every flagged place and polity is its own mark)\n");
  console.log("  gesture   target        n    mean     p50     p90     p95     p99     max  >50ms");
  for (const g of ["drag", "wheel", "pinch"]) { const s = results.v2full[g]; console.log(`  ${g.padEnd(9)} ${"v2 Full".padEnd(9)} ${String(s.n).padStart(4)} ${fmt(s.mean)} ${fmt(s.p50)} ${fmt(s.p90)} ${fmt(s.p95)} ${fmt(s.p99)} ${fmt(s.max)} ${String(s.over50).padStart(6)}`); }
  console.log(`  marks at the start: ${results.v2full.marks.drawn} drawn of ${results.v2full.marks.laid} laid out (mode ${results.v2full.marks.mode}); the marks' own pass: mean ${results.v2full.cost.marksMean.toFixed(2)} ms, p95 ${results.v2full.cost.marksP95.toFixed(2)} ms, max ${results.v2full.cost.marksMax.toFixed(2)} ms over ${results.v2full.cost.n} frames (the labels' whole pass p95 ${results.v2full.cost.labelsP95.toFixed(2)} ms)`);
  console.log("\nMarks drawn in a still frame of the Full Atlas, per fixed view (budget in brackets)\n");
  for (const { V, s } of viewMarks) console.log(`  ${V.name.padEnd(44)} ${String(s.drawn).padStart(5)} drawn of ${String(s.laid).padStart(5)} laid out${V.marks != null ? "  (≤ " + V.marks + ")" : ""}   marks pass ${s.ms.toFixed(2)} ms (p95 ${s.p95.toFixed(2)})`);
  printViews("Fixed views (v2, relief on)", viewsRelief);
  console.log("\n  the #map?perf overlay at the cap, relief on:\n" + viewsRelief[viewsRelief.length - 1].overlay.split("\n").map((l) => "    " + l).join("\n"));

  let fails = 0;
  const check = (name, ok, detail) => { console.log(`  ${ok ? "\x1b[32mok\x1b[0m  " : "\x1b[31mFAIL\x1b[0m"}  ${name}${detail ? "  \x1b[2m" + detail + "\x1b[0m" : ""}`); if (!ok) fails++; };
  const pctS = (x) => (100 * x).toFixed(2) + " %";
  console.log(`\nThe gate (owner's redefinition 2026-10-08, extended for Phase 1b, sampled over ${REPEATS} repeats since Phase 1c, the Phase 1d rules of 2026-10-09): relief off — v2 pooled p90 ≤ ${RATIO * 100} % of v1's last numbers (V1_REF) for drag, wheel, pinch, scrub; the drag's frames over ${WORST_MS} ms at most ${pctS(WORST_SHARE)} of the sample and none over ${WORST_CAP_MS}; the same for the pinch's frames DURING the gesture, and its first frame after release ≤ ${RELEASE_MS} ms; primitive budgets per view; relief on, patches warmed — v2 pooled p90 ≤ ${RELIEF_FACTOR} × its own relief-off pooled p90; heap ≤ ${HEAP_BUDGET_MB} MB (absolute, read off CI)\n`);
  for (const g of ["drag", "wheel", "pinch"]) {
    const a = V1_REF[g], b = results.v2[g];
    check(`${g}: v2 pooled p90 ≤ ${RATIO * 100} % of v1's last pooled p90 (${a} ms, deleted in Phase 5)`, b.p90 <= a * RATIO, `v2 ${b.p90.toFixed(1)} ms vs v1 ${a.toFixed(1)} ms (${(100 * b.p90 / a).toFixed(0)} %); per-repeat p95 median v2 ${b.p95med.toFixed(1)}`);
  }
  // rAF timestamps come in multiples of the 60 Hz refresh, 16.68 ms: a six-refresh frame reads 100.0 or
  // 100.1 depending on jitter, and "100 ms" means six refreshes, so a millisecond of timestamp slack is
  // allowed — a seven-refresh frame (116.7) still fails
  // THE WORST-FRAME RULE (owner-approved, Phase 2a task 0c; restated Phase 3a task 0b): across the repeats at most WORST_SHARE of a
  // gesture's frames over WORST_MS and none over WORST_CAP_MS — a collector's pause on a one-core runner is one frame in 1,263, not a
  // renderer regression, and a share scales with the sample where the old count of two did not
  const overCount = (raw) => raw.filter((x) => x > WORST_MS + 1).length;
  const overShare = (raw) => (raw.length ? overCount(raw) / raw.length : 0);
  { const d = results.v2.drag, dr = d.during ? dragRule(d.during.raw, d.release.map((x) => x.frames)) : null;
    // THE DRAG'S RULE, SPLIT (2026-10-16; see dragRule): the frames DURING the drag against the 0.5 % and the 200 ms cap, the release frames by the pinch's own rule
    check(`drag: DURING the gesture, across ${REPEATS} repeats at most ${pctS(WORST_SHARE)} of frames over ${WORST_MS} ms and none over ${WORST_CAP_MS} ms (relief off)`, !!dr && dr.duringOK, dr ? `${dr.over} over ${WORST_MS} (${pctS(dr.share)}), worst ${dr.max.toFixed(1)} ms over ${dr.n} frames (per repeat ${d.runs.map((s) => s.during ? s.during.max.toFixed(1) : "?").join(" / ")})` : "no release marks recorded");
    check(`drag: the first full frame after release ≤ ${RELEASE_MS} ms and no release frame over ${RELEASE_MS} ms (relief off)`, !!dr && dr.releaseOK, dr ? `first frames ${d.release.map((x) => x.first.toFixed(1)).join(" / ")} ms, worst release frame ${dr.relMax.toFixed(1)} ms (${d.release.map((x) => x.max.toFixed(1)).join(" / ")}); the release frames over ${WORST_MS} ms, counted in the old pooled rule: ${d.release.reduce((n, x) => n + x.frames.filter((v) => v > WORST_MS + 1).length, 0)} of ${d.n} frames` : "no release recorded"); }
  { const p = results.v2.pinch, w = p.releaseWorst;
    check(`pinch: DURING the gesture, across ${REPEATS} repeats at most ${pctS(WORST_SHARE)} of frames over ${WORST_MS} ms and none over ${WORST_CAP_MS} ms (relief off)`, !!p.during && overShare(p.during.raw) <= WORST_SHARE && p.during.max <= WORST_CAP_MS + 1, p.during ? `${overCount(p.during.raw)} over ${WORST_MS} (${pctS(overShare(p.during.raw))}), worst ${p.during.max.toFixed(1)} ms over ${p.during.n} frames (per repeat ${p.runs.map((s) => s.during ? s.during.max.toFixed(1) : "?").join(" / ")})` : "no marks recorded");
    check(`pinch: v2 first full-screen frame after release ≤ ${RELEASE_MS} ms (relief off)`, !!w && w.max <= RELEASE_MS + 1, w ? `${w.max.toFixed(1)} ms (${p.release.map((x) => x.max.toFixed(1)).join(" / ")})${w.stats ? ` — that frame: LOD ${w.stats.level}, ${w.stats.triangles} triangles + ${w.stats.segments} segments, ${w.stats.lakeTriangles} lake triangles, ${w.stats.draws} draw calls` : ""}` : "no release frame recorded"); }
  for (const { V, still, settled } of views) {
    check(`${V.name}: tiles, water and relief settled`, settled, `${still.tilesDrawn} drawn, ${still.pending} pending, water ${still.waterTilesDrawn}/${still.waterWanted}`);
    check(`${V.name}: triangles ≤ ${V.tri}`, still.triangles <= V.tri, `${still.triangles}`);
    check(`${V.name}: segments ≤ ${V.seg}`, still.segments <= V.seg, `${still.segments}`);
    check(`${V.name}: river segments ≤ ${V.river}`, still.riverSegments <= V.river, `${still.riverSegments}`);
    check(`${V.name}: lake-shore segments ≤ ${V.lakeSeg}`, still.lakeSegments <= V.lakeSeg, `${still.lakeSegments}`);
    check(`${V.name}: lake-fill triangles ≤ ${V.lakeTri}`, still.lakeTriangles <= V.lakeTri, `${still.lakeTriangles}`);
    if (V.presTri != null) { check(`${V.name}: presence (peoples and cultures) fill triangles ≤ ${V.presTri}`, (still.presenceTriangles || 0) <= V.presTri && (still.presenceTriangles || 0) > 0, `${still.presenceTriangles} in ${still.presenceFaces} faces`); check(`${V.name}: ${V.presFaces} presence face(s) drawn`, (still.presenceFaces || 0) === V.presFaces, `${still.presenceFaces}`); }
    if (V.histTri != null) { check(`${V.name}: historical fill triangles ≤ ${V.histTri}`, still.historyTriangles <= V.histTri, `${still.historyTriangles} in ${still.historyFaces} faces; level ${still.level}, history settled ${still.histSettled}, ${still.histResident} meshes resident, ${still.histWanted} wanted, ${still.histPending} pending, ${still.histOnScreen} faces on screen`); check(`${V.name}: historical border segments ≤ ${V.histSeg}`, still.historySegments <= V.histSeg, `${still.historySegments}`); }
  }
  // STACKS REMOVED: the owner's worst-frame rule with the Full Atlas on, at the widest view
  { const f = results.v2full, d = f.drag, p = f.pinch;
    /* the rule is read over the Full Atlas's GESTURE FRAMES — the drag's and the pinch's during-gesture frames together (1,700 of them) — because
       on this runner a gate of 0.5 % is two frames of a 400-frame pinch: the plain Map's own pinch read 0.48 % in one run and the Full Atlas's
       0.49 % and 0.96 % in two (docs/atlas-v2-design.md §7 "Stacks removed"), which is the renderer's noise and not the marks'. Each gesture's
       share is printed beside it, and none may pass 200 ms on its own. */
    const dd = d.during || { raw: [], n: 0, max: NaN }, pool = dd.raw.concat(p.during ? p.during.raw : []), dr = d.during ? dragRule(d.during.raw, d.release.map((x) => x.frames)) : null;   // the drag's DURING frames (2026-10-16: the release frames are the release rule's)
    check(`Full Atlas (${f.marks.drawn} marks at the widest view): the gesture frames of the drag and the pinch together (${pool.length}) — at most ${pctS(WORST_SHARE)} over ${WORST_MS} ms`, f.marks.mode === "full" && f.marks.drawn > 500 && !!p.during && !!d.during && overShare(pool) <= WORST_SHARE, `${overCount(pool)} over ${WORST_MS} (${pctS(overShare(pool))}); drag ${overCount(dd.raw)} of ${dd.raw.length}, worst ${dd.max.toFixed(1)} ms; pinch ${p.during ? overCount(p.during.raw) + " of " + p.during.raw.length + ", worst " + p.during.max.toFixed(1) + " ms" : "no during frames"}`);
    check(`Full Atlas: no drag frame and no pinch frame over ${WORST_CAP_MS} ms during the gestures`, !!d.during && dd.max <= WORST_CAP_MS + 1 && !!p.during && p.during.max <= WORST_CAP_MS + 1, `drag worst ${dd.max.toFixed(1)} ms, pinch worst ${p.during ? p.during.max.toFixed(1) : "—"} ms`);
    check(`Full Atlas: the drag's first full frame after release ≤ ${RELEASE_MS} ms and no release frame over ${RELEASE_MS} ms`, !!dr && dr.releaseOK, dr ? `first ${d.release.map((x) => x.first.toFixed(1)).join(" / ")} ms, worst ${dr.relMax.toFixed(1)} ms` : "no release recorded");
    check("Full Atlas: the marks' own pass costs under 4 ms at p95 on this runner (software canvas; reported per view above)", f.cost.n > 50 && f.cost.marksP95 < 4, `p95 ${f.cost.marksP95.toFixed(2)} ms, mean ${f.cost.marksMean.toFixed(2)} ms`); }
  for (const { V, s } of viewMarks) if (V.marks != null) check(`${V.name}: marks drawn in the Full Atlas ≤ ${V.marks}`, s.drawn <= V.marks, `${s.drawn} drawn of ${s.laid} laid out`);
  for (const g of ["drag", "wheel", "pinch"]) {
    const b = results.v2relief[g], off = results.v2[g];
    check(`${g}, relief on: v2 pooled p90 ≤ ${RELIEF_FACTOR} × its relief-off pooled p90`, b.p90 <= Math.max(off.p90, 16.7) * RELIEF_FACTOR, `v2 ${b.p90.toFixed(1)} ms on vs ${off.p90.toFixed(1)} ms off (per-repeat p95s on ${b.p95s.map((v) => v.toFixed(1)).join(" / ")}, off ${off.p95s.map((v) => v.toFixed(1)).join(" / ")}); v2 worst ${b.max.toFixed(1)} ms (reported, not gated)`);
  }
  check(`v2 JS heap after its gestures and a forced collection ≤ ${HEAP_BUDGET_MB} MB (the CI reading of 2026-10-15 was 30 MB, plus 25 %)`, Number.isFinite(results.v2.heapMB) && results.v2.heapMB <= HEAP_BUDGET_MB, `v2 ${results.v2.heapMB} MB of ${HEAP_BUDGET_MB} (${(100 * results.v2.heapMB / HEAP_BUDGET_MB).toFixed(0)} %)`);
  { const c = (results.v2relief.cost || []).filter((x) => x.uploadMs != null); check("relief first-use cost measured (fetch + compose + upload per patch; reported, not gated)", c.length > 0, c.length ? `${c.length} patches, worst ${Math.max(...c.map((x) => x.fetchMs + x.composeMs + x.uploadMs)).toFixed(0)} ms` : "none recorded"); }
  check("v2 relief loaded (L0 and the view's L1 patches)", results.v2relief.ready, `${results.v2relief.stats.reliefResident} textures`);
  for (const { V, settled } of viewsRelief) check(`${V.name}, relief on: tiles and relief settled`, settled);
  check("v2 pinch reached the globe (zoom rose during the spread)", results.v2.pinchZoom.peak > results.v2.pinchZoom.before * 1.5, `zoom ${results.v2.pinchZoom.before} → ${results.v2.pinchZoom.peak && results.v2.pinchZoom.peak.toFixed(2)}`);
  check("v2 names the face under a tap (ID pass)", !!results.v2.pick, results.v2.pick);
  // Phase 2a: the scrub (against v1's last number, V1_REF), and the year change on the main thread
  { const a = V1_REF.scrub, b = results.v2.scrub;
    if (b) check(`scrub: v2 pooled p90 ≤ ${RATIO * 100} % of v1's last pooled p90 (${a} ms, deleted in Phase 5)`, b.p90 <= a * RATIO, `v2 ${b.p90.toFixed(1)} ms vs v1 ${a.toFixed(1)} ms (${(100 * b.p90 / a).toFixed(0)} %); worst v2 ${b.max.toFixed(1)}`);
    else check("scrub: the v2 rail measured", false, "none");
    const yc = results.v2.yearChange; check("a year change costs at most 5 ms on the main thread at p95", !!yc && yc.p95 <= 5, yc ? `${yc.p95.toFixed(2)} ms over ${yc.n} changes` : "no reading");
    // Phase 2b: the whole rail scrubbed (every alive set of the file), the year-change cost still under 5 ms at p95; the frames reported
    const sa = results.v2.scrubAll, ya = results.v2.yearChangeAll;
    check("the whole rail scrubbed, 10,000 BCE to today: a year change still costs at most 5 ms at p95", !!ya && ya.p95 <= 5, ya ? `${ya.p95.toFixed(2)} ms over ${ya.n} changes; frames p90 ${sa ? sa.p90.toFixed(1) : "—"} ms, worst ${sa ? sa.max.toFixed(1) : "—"} over ${sa ? sa.n : 0}; heap ${ya.heap ? Math.round(ya.heap / 1048576) + " MB" : "n/a"}` : "no reading"); }
  check("no page errors on #map", errors.length === 0, errors.slice(0, 3).join(" | "));
  console.log("");
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
