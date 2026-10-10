/* test-atlas-perf.js — frame-time budgets for the Atlas, v1 (#map) and v2 (#map2) side by side.

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-perf.js
     FOLIO_CHROMIUM=/path/to/chrome  … to pick the browser (otherwise playwright's own)

   WHY (docs/atlas-v2-design.md §2.2, §2.11, §7). The reason v2 exists is a number: dragging the v1
   globe in a headless Chromium measured p50 16.7 ms but p90 150 ms and max 300 ms, because every
   frame re-projects tens of thousands of vertices on the CPU. Phase 0's gate ("p95 ≤ 20 ms on
   software GL") measured the CI runner's SwiftShader, not a phone, so the owner redefined it
   (2026-10-08, §2.2 and §7 Phase 1a) and extended it for Phase 1b. THE GATE, as this suite asserts it:

     1. with relief OFF (rivers and lakes on, the defaults): v2's p95 frame interval is at most 40 % of
        v1's on the same run, for drag, wheel and pinch;
     2. the worst frame during drag and pinch, relief off, is at most 100 ms;
     3. a deterministic primitive budget: `__atlas2.statsNow()` reports the triangles and line
        segments the renderer drew in the last frame — land, rivers, lake shores, lake fills — and
        four fixed views must stay under the budgets below — the globe, Europe, the Aegean, and the
        Aegean at the zoom cap, with the tiles those views need loaded. The budgets are the figures
        measured when the files were built (§7 "Phase 1a — as built" for the land, "Phase 1b — as
        built" for the water), rounded up by a quarter, so a change that doubles what a view draws
        fails here rather than on a phone;
     4. with relief ON: the owner asked for v2's p95 at most 40 % of v1's WITH ITS HEIGHTMAP ON, with the
        worst frame reported, not gated — a full-disc texture shader is slow on software GL for reasons
        that are not a phone's. MEASURED (2026-10-08, §7 "Phase 1b — as built"), v1 is CHEAPER during a
        gesture with its heightmap on than without (drag p95 66.7 ms against 150 ms): it reprojects the
        heightmap at 360 px while moving and only renders it in full once settled, after the measured
        window, so that ratio cannot be met by a renderer that draws every frame in full and the
        comparison says nothing about relief. So the suite PRINTS the v1 ratio and ASSERTS instead that
        relief costs v2 at most half again its own relief-off p95 (RELIEF_FACTOR) for drag, wheel and
        pinch — a deterministic regression gate on the relief passes themselves. The owner can put the
        literal ratio back by setting RELIEF_VS_V1 = true below.

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
     · HEAP: v2's JS heap after its gestures is at most HEAP_RATIO (50 %) of v1's in the same run, the
       absolute value reported; the old absolute ceiling (48 MB) is gone.
     · unchanged: v2 pooled p90 ≤ RATIO of v1's for drag, wheel and pinch; the drag's worst frame ≤ WORST_MS
       with 1 ms of timestamp slack; the primitive budgets.

   The suite also prints the #map2?perf overlay's numbers (mean, p95, max over the last 120 frames,
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
const RATIO = 0.40;             // v2 p95 ≤ 40 % of v1 p95
const WORST_MS = 100;           // worst frame during drag and pinch, relief off (Phase 2a, task 0c: at most WORST_OVER frames over it across the repeats, none over WORST_CAP_MS)
const WORST_OVER = 2;           // the owner's worst-frame rule (2026-10-09, Phase 2a): across the three drag repeats (about 1,200 frames) at most two frames over WORST_MS and none over WORST_CAP_MS; the same for the pinch's during-gesture frames
const WORST_CAP_MS = 200;
const RELIEF_FACTOR = 2.0;      // relief on: v2 pooled p90 ≤ this × v2's own relief-off pooled p90, patches warmed first (Phase 1d; 1.5 before, with the fetch inside the gesture)
const RELIEF_VS_V1 = false;     // true = the owner's literal gate instead: v2 relief-on p95 ≤ RATIO × v1-with-heightmap p95
const REPEATS = 3;              // every gesture runs this many times; the relative gates read the pooled p90 (see the header)
const HEAP_RATIO = 0.5;         // v2's JS heap after its gestures and a forced collection ≤ this × v1's in the same run (Phase 1d; measured 28–82 MB against 228–257 — the absolute 48 MB ceiling is gone)
const RELEASE_MS = 300;         // the first full-screen frame after a pinch's fingers lift (Phase 1d), reported with its primitive count
const RELEASE_WINDOW_MS = 450;  // a frame ending within this of a touchEnd mark is a release frame, not a gesture frame
const RELEASE_SETTLE_MS = 500;  // how long the pinch waits after each release before the next touch (longer than the window)
/* The four fixed views and their primitive budgets (drawn in one frame at 1280×800): land triangles and
   segments measured 2026-10-08 on the Phase 1a build (globe 42,529 / 19,917; Europe 133,348 / 101,049;
   the Aegean 25,892 / 22,750; the Aegean at the cap 20,366 / 18,297); river segments, lake-shore segments
   and lake-fill triangles measured 2026-10-08 on the Phase 1b build (globe 2,674 / 3,002 / 2,612; Europe
   22,173 / 71,465 / 64,628; the Aegean 4,390 / 2,381 / 2,157; the cap 0 / 1,708 / 1,553 — rivers are not
   drawn at the cap), each rounded up by a quarter. A view is (lon, lat, km per pixel). */
const VIEWS = [
  { name: "globe", lon: 10, lat: 20, kmpp: 24.0, tri: 54000, seg: 25000, river: 3400, lakeSeg: 3800, lakeTri: 3300 },
  { name: "Europe", lon: 10, lat: 50, kmpp: 3.0, tri: 167000, seg: 127000, river: 27700, lakeSeg: 69900, lakeTri: 63600 },
  { name: "Aegean", lon: 25, lat: 38, kmpp: 0.5, tri: 33000, seg: 29000, river: 5500, lakeSeg: 3000, lakeTri: 2700 },
  { name: "Aegean at the cap", lon: 25, lat: 38, kmpp: 0.15, tri: 26000, seg: 23000, river: 0, lakeSeg: 2200, lakeTri: 2000 },
  { name: "Mediterranean, 1 CE", lon: 15, lat: 38, kmpp: 6.0, year: 1, tri: 90000, seg: 60000, river: 13000, lakeSeg: 30000, lakeTri: 27000, histTri: 42000, histSeg: 26000 },
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
  // #map2 read 100 ms where the next ones read 50–67) — a wake-up of the browser, not a cost of the
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
    const during = [], release = r.marks.map(() => []);
    r.d.forEach((dt, i) => { const t = r.ts[i]; const k = r.marks.findIndex((m) => t > m && t <= m + RELEASE_WINDOW_MS); if (k < 0) during.push(dt); else release[k].push(dt); });
    s.during = summary(during);
    s.release = release.map((arr, k) => ({ max: arr.length ? Math.max(...arr) : 0, n: arr.length, stats: extra && extra.releases ? extra.releases[k] : null }));
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
async function scrub(page) {
  const pin = await page.$("#tlPin"), track = await page.$("#tlTrack");
  if (!pin || !track) return null;
  const pb = await pin.boundingBox(), tb = await track.boundingBox();
  if (!pb || !tb) return null;
  const y = pb.y + pb.height / 2;
  await page.mouse.move(pb.x + pb.width / 2, y); await page.mouse.down();
  for (let i = 1; i <= 40; i++) { await page.mouse.move(tb.x + tb.width * (0.2 + 0.6 * i / 40), y); await sleep(30); }
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
async function gestures(page, cdp, cx, cy, withScrub, pinchProbe, v2) {
  const r = {};
  r.drag = await repeated(page, () => drag(page, cx, cy), v2 ? () => warmV2(page, () => drag(page, cx, cy)) : null);
  r.wheel = await repeated(page, () => wheel(page, cx, cy), v2 ? () => warmWheelV2(page, cx, cy) : null);
  r.pinch = await repeated(page, () => pinch(page, cdp, cx, cy, pinchProbe), v2 ? () => warmV2(page, () => pinch(page, cdp, cx, cy)) : null);
  r.scrub = withScrub ? await repeated(page, () => scrub(page)) : null;
  if (withScrub && r.scrub && !r.scrub.n) r.scrub = null;
  if (v2) { await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setView(15, 40, 6)); await settle(page); await sleep(200); r.scrub = await repeated(page, () => scrubV2(page), () => warmV2(page, () => scrubV2(page))); if (r.scrub && !r.scrub.n) r.scrub = null; r.yearChange = await page.evaluate(() => { const t = document.querySelector(".atlas2").__atlas2.timeInfo(); return { p95: t.yearChangeP95, n: t.yearChangeN }; }); await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; c.setYear(new Date().getUTCFullYear()); c.setView(10, 20, 24); }); await settle(page); }
  return r;
}
const settle = (page) => page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.tilesSettled() && c.waterSettled(); }, null, { timeout: 90000 }).then(() => true, () => false);
async function fixedViews(page, cx, cy) {
  const views = [];
  for (const V of VIEWS) {
    await page.evaluate((v) => { const c = document.querySelector(".atlas2").__atlas2; c.setYear(v.year != null ? v.year : new Date().getUTCFullYear()); c.setView(v.lon, v.lat, v.kmpp); }, V);
    const settled = await settle(page);
    await page.waitForTimeout(400);
    await page.evaluate(() => document.querySelector(".atlas2").__atlas2.invalidate());
    await page.waitForTimeout(100);
    const still = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.statsNow());
    const frames = await measure(page, async () => { await page.mouse.move(cx, cy); await page.mouse.down(); for (let i = 1; i <= 40; i++) { await page.mouse.move(cx + i * 2, cy + Math.sin(i / 4) * 20); await sleep(16); } await page.mouse.up(); await sleep(300); });
    const overlay = await page.evaluate(() => document.querySelector(".atlas2-perf").textContent);
    views.push({ V, settled, still, frames, overlay });
  }
  await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; c.setYear(new Date().getUTCFullYear()); c.setView(10, 20, 24); });
  await settle(page);
  return views;
}

(async () => {
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

  /* ---------- v1: plain, then with its heightmap on ---------- */
  {
    const t0 = Date.now();
    await page.goto(base + "#map", { waitUntil: "load" });
    await page.waitForSelector("#globe", { timeout: 90000 });
    await page.waitForTimeout(1500);
    const full = await page.$("[data-atlastab=full]");
    if (full) { await full.click(); await page.waitForTimeout(2500); }
    const box = await (await page.$("#globe")).boundingBox();
    const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
    await sampler(page);
    results.v1 = await gestures(page, cdp, cx, cy, true);
    results.v1.ready = Date.now() - t0;
    results.v1.heapMB = await page.evaluate(() => { if (window.gc) window.gc(); return performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : NaN; });
    // the heightmap layer: the legend's checkbox, then its lazy load and the settled reprojection
    const hm = await page.$("#heightmapToggle");
    if (hm) {
      await hm.evaluate((el) => { el.checked = true; el.dispatchEvent(new Event("change", { bubbles: true })); });
      await page.waitForFunction(() => window.__folioHM && window.__folioHM.base && window.__folioHM.base.ready, null, { timeout: 60000 }).catch(() => {});
      await page.waitForTimeout(2500);
      results.v1hm = await gestures(page, cdp, cx, cy, false);
      results.v1hm.on = await page.evaluate(() => !!(window.__folioHM && window.__folioHM.base && window.__folioHM.base.ready));
    } else results.v1hm = null;
    const v1Errors = errors.splice(0);
    if (v1Errors.length) console.log("  v1 page errors (not asserted here): " + v1Errors.slice(0, 3).join(" | "));
  }

  /* ---------- v2 — in a fresh page, so its heap and its errors are its own ---------- */
  await page.close();
  const page2 = await context.newPage();
  page2.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page2.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  const cdp2 = await context.newCDPSession(page2);
  let views = [], viewsRelief = [];
  {
    const page = page2, cdp = cdp2;
    const t0 = Date.now();
    await page.goto(base + "#map2?perf", { waitUntil: "load" });
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
    Object.assign(r, await gestures(page, cdp, cx, cy, false, async () => { zoomDuring = Math.max(zoomDuring, await page.evaluate(() => document.querySelector(".atlas2").__atlas2.view.zoom)); }, true));
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
    views = await fixedViews(page, cx, cy);
    /* relief on: L0 and the view's L1 patches, then the same gestures and views */
    await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setLayers({ relief: true }));
    const reliefReady = await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.renderer.reliefLoaded("0") && c.tilesSettled(); }, null, { timeout: 90000 }).then(() => true, () => false);
    await page.waitForTimeout(400);
    const rr = await gestures(page, cdp, cx, cy, false, null, true);
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
  console.log(`\nFrame intervals, ms (rAF to rAF), pooled over ${REPEATS} repeats of each gesture; v1 = #map Full atlas, v2 = #map2 (rivers and lakes on); +relief = v1 with its heightmap, v2 with relief\n`);
  console.log("  gesture   target        n    mean     p50     p90     p95     p99     max  >50ms   per-repeat p95 (median)");
  const row = (g, name, s) => { if (!s) { console.log(`  ${g.padEnd(9)} ${name.padEnd(9)}  n/a`); return; } console.log(`  ${g.padEnd(9)} ${name.padEnd(9)} ${String(s.n).padStart(4)} ${fmt(s.mean)} ${fmt(s.p50)} ${fmt(s.p90)} ${fmt(s.p95)} ${fmt(s.p99)} ${fmt(s.max)} ${String(s.over50).padStart(6)}   ${(s.p95s || []).map((v) => v.toFixed(1)).join(" / ")} (${s.p95med != null ? s.p95med.toFixed(1) : "n/a"})`); };
  row("drag", "v2 stage0", results.v2.drag0);
  console.log(`  (v2 stage0: the drag with the gesture stage forced to 0 and locked — full resolution, the view's own level — reported, not gated; the learnt stage after the gestures was ${results.v2.stage && results.v2.stage.learnt}, escalations ${results.v2.stage && results.v2.stage.escalations}, stalls ignored ${results.v2.stage && results.v2.stage.stallsIgnored}, GPU timer ${results.v2.stage && results.v2.stage.gpuTimer})`);
  for (const g of ["drag", "wheel", "pinch", "scrub"]) { row(g, "v1", results.v1[g]); row(g, "v2", results.v2[g]); if (g !== "scrub") { row(g, "v1+relief", results.v1hm && results.v1hm[g]); row(g, "v2+relief", results.v2relief[g]); } }
  const relRow = (name, s) => { if (!s || !s.during) return; const w = s.releaseWorst; console.log(`  ${"pinch".padEnd(9)} ${name.padEnd(9)}  during the gesture: n ${s.during.n} p90 ${fmt(s.during.p90)} max ${fmt(s.during.max)};  release frames: ${s.release.map((x) => x.max.toFixed(1)).join(" / ")} ms, worst ${w.max.toFixed(1)} ms${w.stats ? ` at LOD ${w.stats.level}: ${w.stats.triangles} tri + ${w.stats.segments} seg, ${w.stats.riverSegments} river, ${w.stats.lakeSegments} lake seg, ${w.stats.lakeTriangles} lake tri, ${w.stats.draws} draws` : ""}`); };
  relRow("v2", results.v2.pinch); relRow("v2+relief", results.v2relief.pinch);
  { const c = results.v2relief.cost || []; const done = c.filter((x) => x.uploadMs != null); if (done.length) { const med = (k) => { const a = done.map((x) => x[k]).sort((p, q) => p - q); return a[Math.floor(a.length / 2)]; }; const mx = (k) => Math.max(...done.map((x) => x[k])); console.log(`  relief first-use cost per patch (${done.length} patches, ungated): fetch+decode p50 ${Math.round(med("fetchMs"))} ms max ${Math.round(mx("fetchMs"))}; compose p50 ${med("composeMs")} ms max ${mx("composeMs")}; upload p50 ${med("uploadMs")} ms max ${mx("uploadMs")}; ${done.map((x) => `${x.key} ${(x.bytes / 1048576).toFixed(1)} MB ${Math.round(x.fetchMs)}+${x.composeMs}+${x.uploadMs} ms`).join(", ")}`); } }
  console.log(`\n  ready: v1 ${results.v1.ready} ms, v2 ${results.v2.ready} ms (fetch ${results.v2.load.fetchMs} ms, ${results.v2.load.bytes} bytes, first paint ${results.v2.load.firstPaintMs} ms, worker ${results.v2.load.workerMs} ms; water ${results.v2.load.waterBytes} bytes in ${results.v2.load.waterFetchMs} ms)`);
  console.log(`  v2 levels: ${results.v2.load.levels}; uploads ms ${JSON.stringify(results.v2.load.uploads)}; water levels: ${results.v2.load.water}`);
  console.log(`  v2 renderer draw time (CPU side, ms): p50 ${results.v2.draw.p50 && results.v2.draw.p50.toFixed(2)}, max ${results.v2.draw.max && results.v2.draw.max.toFixed(2)}; last frame: level ${results.v2.draw.level}, ${results.v2.draw.triangles} triangles + ${results.v2.draw.segments} segments in ${results.v2.draw.draws} draw calls; gesture stage ${results.v2.draw.stage} (0 none, 1 half resolution, 2 half resolution and one coarser level during a gesture — learnt in the rehearsals)`);
  console.log(`  JS heap: v1 ${results.v1.heapMB} MB, v2 ${results.v2.heapMB} MB; v2 pick at centre: "${results.v2.pick}"; v1 heightmap loaded: ${results.v1hm && results.v1hm.on}; v2 relief loaded: ${results.v2relief.ready} (${results.v2relief.stats.reliefResident} textures, ${(results.v2relief.stats.reliefBytes / 1048576).toFixed(1)} MB)`);
  const printViews = (title, vs) => {
    console.log(`\n${title}\n`);
    console.log("  view                 km/px   LOD  tiles   triangles  segments   rivers  lakeSeg  lakeTri  relief   draws    mean     p95     max   history tri/seg/faces");
    for (const { V, still, frames } of vs) console.log(`  ${V.name.padEnd(20)} ${String(V.kmpp).padStart(5)}   ${String(still.level).padStart(3)}  ${String(still.tilesDrawn).padStart(5)}   ${String(still.triangles).padStart(9)}  ${String(still.segments).padStart(8)}  ${String(still.riverSegments).padStart(7)}  ${String(still.lakeSegments).padStart(7)}  ${String(still.lakeTriangles).padStart(7)}  ${String(still.reliefOn ? still.reliefPatches + "p f" + still.reliefFade.toFixed(1) : "off").padStart(7)} ${String(still.draws).padStart(5)} ${fmt(frames.mean)} ${fmt(frames.p95)} ${fmt(frames.max)}   ${still.historyTriangles || 0}/${still.historySegments || 0}/${still.historyFaces || 0}`);
  };
  printViews("Fixed views (v2, relief off): primitives in a still frame, then frame intervals over a 40-step drag", views);
  printViews("Fixed views (v2, relief on)", viewsRelief);
  console.log("\n  the #map2?perf overlay at the cap, relief on:\n" + viewsRelief[viewsRelief.length - 1].overlay.split("\n").map((l) => "    " + l).join("\n"));

  let fails = 0;
  const check = (name, ok, detail) => { console.log(`  ${ok ? "\x1b[32mok\x1b[0m  " : "\x1b[31mFAIL\x1b[0m"}  ${name}${detail ? "  \x1b[2m" + detail + "\x1b[0m" : ""}`); if (!ok) fails++; };
  console.log(`\nThe gate (owner's redefinition 2026-10-08, extended for Phase 1b, sampled over ${REPEATS} repeats since Phase 1c, the Phase 1d rules of 2026-10-09): relief off — v2 pooled p90 ≤ ${RATIO * 100} % of v1's for drag, wheel, pinch; the drag's worst frame of any repeat ≤ ${WORST_MS} ms; the pinch's worst frame DURING the gesture ≤ ${WORST_MS} ms and its first frame after release ≤ ${RELEASE_MS} ms; primitive budgets per view; relief on, patches warmed — ${RELIEF_VS_V1 ? "v2 pooled p90 ≤ " + RATIO * 100 + " % of v1's with its heightmap on" : "v2 pooled p90 ≤ " + RELIEF_FACTOR + " × its own relief-off pooled p90 (the v1 heightmap ratio is printed; see the header)"}; heap ≤ ${HEAP_RATIO * 100} % of v1's\n`);
  for (const g of ["drag", "wheel", "pinch"]) {
    const a = results.v1[g], b = results.v2[g];
    check(`${g}: v2 pooled p90 ≤ ${RATIO * 100} % of v1 pooled p90`, b.p90 <= a.p90 * RATIO, `v2 ${b.p90.toFixed(1)} ms vs v1 ${a.p90.toFixed(1)} ms (${(100 * b.p90 / a.p90).toFixed(0)} %); per-repeat p95 medians v2 ${b.p95med.toFixed(1)} / v1 ${a.p95med.toFixed(1)}`);
  }
  // rAF timestamps come in multiples of the 60 Hz refresh, 16.68 ms: a six-refresh frame reads 100.0 or
  // 100.1 depending on jitter, and "100 ms" means six refreshes, so a millisecond of timestamp slack is
  // allowed — a seven-refresh frame (116.7) still fails
  // THE WORST-FRAME RULE (owner-approved, Phase 2a task 0c): across the repeats at most WORST_OVER frames over WORST_MS and none over
  // WORST_CAP_MS — a collector's pause on a one-core runner is one frame in 1,263, not a renderer regression
  const overCount = (raw) => raw.filter((x) => x > WORST_MS + 1).length;
  { const d = results.v2.drag;
    check(`drag: across ${REPEATS} repeats (${d.n} frames) at most ${WORST_OVER} frames over ${WORST_MS} ms and none over ${WORST_CAP_MS} ms (relief off)`, overCount(d.raw) <= WORST_OVER && d.max <= WORST_CAP_MS + 1, `${overCount(d.raw)} over ${WORST_MS}, worst ${d.max.toFixed(1)} ms (per repeat ${d.runs.map((s) => s.max.toFixed(1)).join(" / ")})`); }
  { const p = results.v2.pinch, w = p.releaseWorst;
    check(`pinch: DURING the gesture, across ${REPEATS} repeats at most ${WORST_OVER} frames over ${WORST_MS} ms and none over ${WORST_CAP_MS} ms (relief off)`, !!p.during && overCount(p.during.raw) <= WORST_OVER && p.during.max <= WORST_CAP_MS + 1, p.during ? `${overCount(p.during.raw)} over ${WORST_MS}, worst ${p.during.max.toFixed(1)} ms over ${p.during.n} frames (per repeat ${p.runs.map((s) => s.during ? s.during.max.toFixed(1) : "?").join(" / ")})` : "no marks recorded");
    check(`pinch: v2 first full-screen frame after release ≤ ${RELEASE_MS} ms (relief off)`, !!w && w.max <= RELEASE_MS + 1, w ? `${w.max.toFixed(1)} ms (${p.release.map((x) => x.max.toFixed(1)).join(" / ")})${w.stats ? ` — that frame: LOD ${w.stats.level}, ${w.stats.triangles} triangles + ${w.stats.segments} segments, ${w.stats.lakeTriangles} lake triangles, ${w.stats.draws} draw calls` : ""}` : "no release frame recorded"); }
  for (const { V, still, settled } of views) {
    check(`${V.name}: tiles, water and relief settled`, settled, `${still.tilesDrawn} drawn, ${still.pending} pending, water ${still.waterTilesDrawn}/${still.waterWanted}`);
    check(`${V.name}: triangles ≤ ${V.tri}`, still.triangles <= V.tri, `${still.triangles}`);
    check(`${V.name}: segments ≤ ${V.seg}`, still.segments <= V.seg, `${still.segments}`);
    check(`${V.name}: river segments ≤ ${V.river}`, still.riverSegments <= V.river, `${still.riverSegments}`);
    check(`${V.name}: lake-shore segments ≤ ${V.lakeSeg}`, still.lakeSegments <= V.lakeSeg, `${still.lakeSegments}`);
    check(`${V.name}: lake-fill triangles ≤ ${V.lakeTri}`, still.lakeTriangles <= V.lakeTri, `${still.lakeTriangles}`);
    if (V.histTri != null) { check(`${V.name}: historical fill triangles ≤ ${V.histTri}`, still.historyTriangles <= V.histTri, `${still.historyTriangles} in ${still.historyFaces} faces`); check(`${V.name}: historical border segments ≤ ${V.histSeg}`, still.historySegments <= V.histSeg, `${still.historySegments}`); }
  }
  for (const g of ["drag", "wheel", "pinch"]) {
    const a = results.v1hm && results.v1hm.on ? results.v1hm[g] : null, b = results.v2relief[g], off = results.v2[g];
    const vsV1 = a ? `v1 with its heightmap ${a.p90.toFixed(1)} ms (v2 is ${(100 * b.p90 / a.p90).toFixed(0)} % of it)` : "v1 heightmap not measured";
    if (RELIEF_VS_V1) check(`${g}, relief on: v2 pooled p90 ≤ ${RATIO * 100} % of v1 (heightmap) pooled p90`, !!a && b.p90 <= a.p90 * RATIO, `v2 ${b.p90.toFixed(1)} ms; ${vsV1}; v2 worst ${b.max.toFixed(1)} ms (reported, not gated)`);
    else check(`${g}, relief on: v2 pooled p90 ≤ ${RELIEF_FACTOR} × its relief-off pooled p90`, b.p90 <= Math.max(off.p90, 16.7) * RELIEF_FACTOR, `v2 ${b.p90.toFixed(1)} ms on vs ${off.p90.toFixed(1)} ms off (per-repeat p95s on ${b.p95s.map((v) => v.toFixed(1)).join(" / ")}, off ${off.p95s.map((v) => v.toFixed(1)).join(" / ")}); ${vsV1}; v2 worst ${b.max.toFixed(1)} ms (reported, not gated)`);
  }
  check(`v2 JS heap after its gestures ≤ ${HEAP_RATIO * 100} % of v1's`, Number.isFinite(results.v2.heapMB) && Number.isFinite(results.v1.heapMB) && results.v2.heapMB <= results.v1.heapMB * HEAP_RATIO, `v2 ${results.v2.heapMB} MB, v1 ${results.v1.heapMB} MB (${Number.isFinite(results.v1.heapMB) && results.v1.heapMB ? (100 * results.v2.heapMB / results.v1.heapMB).toFixed(0) : "?"} %)`);
  { const c = (results.v2relief.cost || []).filter((x) => x.uploadMs != null); check("relief first-use cost measured (fetch + compose + upload per patch; reported, not gated)", c.length > 0, c.length ? `${c.length} patches, worst ${Math.max(...c.map((x) => x.fetchMs + x.composeMs + x.uploadMs)).toFixed(0)} ms` : "none recorded"); }
  if (!(results.v1hm && results.v1hm.on)) check("v1's heightmap could be switched on for the comparison", false, "no #heightmapToggle, or its data did not load");
  check("v2 relief loaded (L0 and the view's L1 patches)", results.v2relief.ready, `${results.v2relief.stats.reliefResident} textures`);
  for (const { V, settled } of viewsRelief) check(`${V.name}, relief on: tiles and relief settled`, settled);
  check("v2 pinch reached the globe (zoom rose during the spread)", results.v2.pinchZoom.peak > results.v2.pinchZoom.before * 1.5, `zoom ${results.v2.pinchZoom.before} → ${results.v2.pinchZoom.peak && results.v2.pinchZoom.peak.toFixed(2)}`);
  check("v2 names the face under a tap (ID pass)", !!results.v2.pick, results.v2.pick);
  // Phase 2a: the scrub (v1's rail against v2's), and the year change on the main thread
  { const a = results.v1.scrub, b = results.v2.scrub;
    if (a && b) check(`scrub: v2 pooled p90 ≤ ${RATIO * 100} % of v1 pooled p90`, b.p90 <= a.p90 * RATIO, `v2 ${b.p90.toFixed(1)} ms vs v1 ${a.p90.toFixed(1)} ms (${(100 * b.p90 / a.p90).toFixed(0)} %); worst v2 ${b.max.toFixed(1)}`);
    else check("scrub: both rails measured", false, `v1 ${a ? a.n : "none"}, v2 ${b ? b.n : "none"}`);
    const yc = results.v2.yearChange; check("a year change costs at most 5 ms on the main thread at p95", !!yc && yc.p95 <= 5, yc ? `${yc.p95.toFixed(2)} ms over ${yc.n} changes` : "no reading"); }
  check("no page errors on #map2", errors.length === 0, errors.slice(0, 3).join(" | "));
  console.log("");
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
