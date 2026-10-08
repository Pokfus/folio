/* test-atlas-perf.js — frame-time budgets for the Atlas, v1 (#map) and v2 (#map2) side by side.

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-perf.js
     FOLIO_CHROMIUM=/path/to/chrome  … to pick the browser (otherwise playwright's own)

   WHY (docs/atlas-v2-design.md §2.2, §2.11, §7). The reason v2 exists is a number: dragging the v1
   globe in a headless Chromium measured p50 16.7 ms but p90 150 ms and max 300 ms, because every
   frame re-projects tens of thousands of vertices on the CPU. Phase 0's gate ("p95 ≤ 20 ms on
   software GL") measured the CI runner's SwiftShader, not a phone, so the owner redefined it
   (2026-10-08, §2.2 and §7 Phase 1a). THE GATE, as this suite asserts it:

     1. v2's p95 frame interval is at most 40 % of v1's on the same run, for drag, wheel and pinch;
     2. the worst frame during drag and pinch is at most 100 ms;
     3. a deterministic primitive budget: `__atlas2.statsNow()` reports the triangles and line
        segments the renderer drew in the last frame, and four fixed views must stay under the
        budgets below — the globe, Europe, the Aegean, and the Aegean at the zoom cap, with the
        tiles those views need loaded. The budgets are the figures measured when the tiles were
        built (§7 "Phase 1a — as built"), rounded up by a quarter, so a change that doubles what a
        view draws fails here rather than on a phone.

   The suite also prints the #map2?perf overlay's numbers (mean, p95, max over the last 120 frames,
   primitives, LOD, tiles) for each fixed view, which is what the owner reads on a real phone.

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
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream" };
const RATIO = 0.40;             // v2 p95 ≤ 40 % of v1 p95
const WORST_MS = 100;           // worst frame during drag and pinch
/* The four fixed views and their primitive budgets (triangles, segments drawn in one frame at
   1280×800). Measured 2026-10-08 on the Phase 1a build (docs/atlas-v2-design.md §7 "Phase 1a — as
   built": globe 42,529 / 19,917; Europe 133,348 / 101,049; the Aegean 25,892 / 22,750; the Aegean
   at the cap 20,366 / 18,297), each rounded up by a quarter. A view is (lon, lat, km per pixel). */
const VIEWS = [
  { name: "globe", lon: 10, lat: 20, kmpp: 24.0, tri: 54000, seg: 25000 },
  { name: "Europe", lon: 10, lat: 50, kmpp: 3.0, tri: 167000, seg: 127000 },
  { name: "Aegean", lon: 25, lat: 38, kmpp: 0.5, tri: 33000, seg: 29000 },
  { name: "Aegean at the cap", lon: 25, lat: 38, kmpp: 0.15, tri: 26000, seg: 23000 },
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
const summary = (d) => ({ n: d.length, mean: d.length ? d.reduce((a, b) => a + b, 0) / d.length : NaN, p50: pct(d, 50), p90: pct(d, 90), p95: pct(d, 95), p99: pct(d, 99), max: d.length ? Math.max(...d) : NaN, over50: d.filter((x) => x > 50).length });
const fmt = (v) => (Number.isFinite(v) ? v.toFixed(1).padStart(7) : "    n/a");

async function sampler(page) {
  await page.evaluate(() => {
    if (window.__ft) return;
    window.__ft = { on: false, d: [] };
    let last = 0;
    const loop = (t) => { if (window.__ft.on && last) window.__ft.d.push(t - last); last = t; requestAnimationFrame(loop); };
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
  await page.evaluate(() => { window.__ft.d = []; window.__ft.on = true; });
  await fn();
  const d = await page.evaluate(() => { window.__ft.on = false; return window.__ft.d.slice(); });
  return summary(d);
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
  await send("touchStart", pts(60));
  for (let i = 1; i <= 30; i++) { await send("touchMove", pts(60 + i * 5)); await sleep(16); }
  if (probe) await probe();
  await send("touchEnd", []);
  await sleep(200);
  await send("touchStart", pts(210));
  for (let i = 1; i <= 30; i++) { await send("touchMove", pts(210 - i * 5)); await sleep(16); }
  await send("touchEnd", []);
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

  /* ---------- v1 ---------- */
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
    const r = {};
    r.ready = Date.now() - t0;
    r.drag = await measure(page, () => drag(page, cx, cy));
    r.wheel = await measure(page, () => wheel(page, cx, cy));
    r.pinch = await measure(page, () => pinch(page, cdp, cx, cy));
    r.scrub = await measure(page, () => scrub(page));
    r.heapMB = await page.evaluate(() => performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : NaN);
    results.v1 = r;
    const v1Errors = errors.splice(0);
    if (v1Errors.length) console.log("  v1 page errors (not asserted here): " + v1Errors.slice(0, 3).join(" | "));
  }

  /* ---------- v2 — in a fresh page, so its heap and its errors are its own ---------- */
  await page.close();
  const page2 = await context.newPage();
  page2.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page2.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  const cdp2 = await context.newCDPSession(page2);
  const views = [];
  {
    const page = page2, cdp = cdp2;
    const t0 = Date.now();
    await page.goto(base + "#map2?perf", { waitUntil: "load" });
    await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 90000 });
    const box = await (await page.$(".atlas2-canvas")).boundingBox();
    const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
    await sampler(page);
    const r = {};
    r.ready = Date.now() - t0;
    r.load = await page.evaluate(() => { const s = document.querySelector(".atlas2").__atlas2.stats; return { fetchMs: s.fetchMs, bytes: s.bytes, firstPaintMs: s.firstPaintMs, workerMs: s.worker && s.worker.totalMs, uploads: s.uploads, levels: s.worker && s.worker.levels.map((l) => l.level + ":" + l.triangles + "tri/" + l.segments + "seg/" + l.ms + "ms").join(" ") }; });
    r.drag = await measure(page, () => drag(page, cx, cy));
    r.wheel = await measure(page, () => wheel(page, cx, cy));
    const zoomBefore = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.view.zoom);
    let zoomDuring = 0;
    r.pinch = await measure(page, async () => { await pinch(page, cdp, cx, cy, async () => { zoomDuring = Math.max(zoomDuring, await page.evaluate(() => document.querySelector(".atlas2").__atlas2.view.zoom)); }); });
    r.pinchZoom = { before: zoomBefore, peak: zoomDuring };
    r.scrub = null;   // no timeline until Phase 2
    r.draw = await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2, s = c.stats; const d = s.draw.slice(-200).sort((a, b) => a - b); return Object.assign({ p50: d[Math.floor(d.length / 2)], max: d[d.length - 1] }, c.statsNow()); });
    r.heapMB = await page.evaluate(() => performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : NaN);
    // the ID pass: a tap on the globe's centre must name a face
    await page.mouse.click(cx, cy); await page.waitForTimeout(300);
    r.pick = await page.evaluate(() => document.querySelector(".atlas2-caption").textContent);
    results.v2 = r;
    /* the four fixed views: set, wait for the tiles, measure a still frame and a short drag */
    for (const V of VIEWS) {
      await page.evaluate((v) => document.querySelector(".atlas2").__atlas2.setView(v.lon, v.lat, v.kmpp), V);
      const settled = await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.tilesSettled(); }, null, { timeout: 60000 }).then(() => true, () => false);
      await page.waitForTimeout(400);
      await page.evaluate(() => document.querySelector(".atlas2").__atlas2.invalidate());
      await page.waitForTimeout(100);
      const still = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.statsNow());
      const frames = await measure(page, async () => { await page.mouse.move(cx, cy); await page.mouse.down(); for (let i = 1; i <= 40; i++) { await page.mouse.move(cx + i * 2, cy + Math.sin(i / 4) * 20); await sleep(16); } await page.mouse.up(); await sleep(300); });
      const overlay = await page.evaluate(() => document.querySelector(".atlas2-perf").textContent);
      views.push({ V, settled, still, frames, overlay });
    }
  }

  await browser.close();
  server.close();

  /* ---------- report ---------- */
  console.log("\nFrame intervals, ms (rAF to rAF), v1 = #map Full atlas, v2 = #map2\n");
  console.log("  gesture   target      n    mean     p50     p90     p95     p99     max  >50ms");
  for (const g of ["drag", "wheel", "pinch", "scrub"]) for (const v of ["v1", "v2"]) {
    const s = results[v][g];
    if (!s) { console.log(`  ${g.padEnd(9)} ${v.padEnd(6)}    n/a (no timeline until Phase 2)`); continue; }
    console.log(`  ${g.padEnd(9)} ${v.padEnd(6)} ${String(s.n).padStart(4)} ${fmt(s.mean)} ${fmt(s.p50)} ${fmt(s.p90)} ${fmt(s.p95)} ${fmt(s.p99)} ${fmt(s.max)} ${String(s.over50).padStart(6)}`);
  }
  console.log(`\n  ready: v1 ${results.v1.ready} ms, v2 ${results.v2.ready} ms (fetch ${results.v2.load.fetchMs} ms, ${results.v2.load.bytes} bytes, first paint ${results.v2.load.firstPaintMs} ms, worker ${results.v2.load.workerMs} ms)`);
  console.log(`  v2 levels: ${results.v2.load.levels}; uploads ms ${JSON.stringify(results.v2.load.uploads)}`);
  console.log(`  v2 renderer draw time (CPU side, ms): p50 ${results.v2.draw.p50 && results.v2.draw.p50.toFixed(2)}, max ${results.v2.draw.max && results.v2.draw.max.toFixed(2)}; last frame: level ${results.v2.draw.level}, ${results.v2.draw.triangles} triangles + ${results.v2.draw.segments} segments in ${results.v2.draw.draws} draw calls`);
  console.log(`  JS heap: v1 ${results.v1.heapMB} MB, v2 ${results.v2.heapMB} MB; v2 pick at centre: "${results.v2.pick}"`);
  console.log("\nFixed views (v2): primitives in a still frame, then frame intervals over a 40-step drag\n");
  console.log("  view                 km/px   LOD  tiles   triangles  segments   draws    mean     p95     max");
  for (const { V, still, frames } of views) console.log(`  ${V.name.padEnd(20)} ${String(V.kmpp).padStart(5)}   ${String(still.level).padStart(3)}  ${String(still.tilesDrawn).padStart(5)}   ${String(still.triangles).padStart(9)}  ${String(still.segments).padStart(8)}   ${String(still.draws).padStart(5)} ${fmt(frames.mean)} ${fmt(frames.p95)} ${fmt(frames.max)}`);
  console.log("\n  the #map2?perf overlay at the cap:\n" + views[views.length - 1].overlay.split("\n").map((l) => "    " + l).join("\n"));

  let fails = 0;
  const check = (name, ok, detail) => { console.log(`  ${ok ? "\x1b[32mok\x1b[0m  " : "\x1b[31mFAIL\x1b[0m"}  ${name}${detail ? "  \x1b[2m" + detail + "\x1b[0m" : ""}`); if (!ok) fails++; };
  console.log(`\nThe gate (owner's redefinition 2026-10-08): v2 p95 ≤ ${RATIO * 100} % of v1's for drag, wheel, pinch; worst frame ≤ ${WORST_MS} ms for drag and pinch; primitive budgets per view\n`);
  for (const g of ["drag", "wheel", "pinch"]) {
    const a = results.v1[g], b = results.v2[g];
    check(`${g}: v2 p95 ≤ ${RATIO * 100} % of v1 p95`, b.p95 <= a.p95 * RATIO, `v2 ${b.p95.toFixed(1)} ms vs v1 ${a.p95.toFixed(1)} ms (${(100 * b.p95 / a.p95).toFixed(0)} %)`);
  }
  for (const g of ["drag", "pinch"]) check(`${g}: v2 worst frame ≤ ${WORST_MS} ms`, results.v2[g].max <= WORST_MS, `${results.v2[g].max.toFixed(1)} ms`);
  for (const { V, still, settled } of views) {
    check(`${V.name}: tiles settled`, settled, `${still.tilesDrawn} drawn, ${still.pending} pending`);
    check(`${V.name}: triangles ≤ ${V.tri}`, still.triangles <= V.tri, `${still.triangles}`);
    check(`${V.name}: segments ≤ ${V.seg}`, still.segments <= V.seg, `${still.segments}`);
  }
  check("v2 pinch reached the globe (zoom rose during the spread)", results.v2.pinchZoom.peak > results.v2.pinchZoom.before * 1.5, `zoom ${results.v2.pinchZoom.before} → ${results.v2.pinchZoom.peak && results.v2.pinchZoom.peak.toFixed(2)}`);
  check("v2 names the face under a tap (ID pass)", !!results.v2.pick, results.v2.pick);
  check("no page errors on #map2", errors.length === 0, errors.slice(0, 3).join(" | "));
  console.log("");
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
