/* test-atlas-perf.js — frame-time budgets for the Atlas, v1 (#map) and v2 (#map2) side by side.

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-perf.js
     FOLIO_CHROMIUM=/path/to/chrome  … to pick the browser (otherwise playwright's own)

   WHY (docs/atlas-v2-design.md §2.2, §2.11, §7 Phase 0). The reason v2 exists is a number: dragging
   the v1 globe in a headless Chromium measured p50 16.7 ms but p90 150 ms and max 300 ms, because
   every frame re-projects tens of thousands of vertices on the CPU. The design's bet is that a
   WebGL2 renderer with the geometry resident on the GPU holds p95 ≤ 20 ms and max ≤ 100 ms on the
   CI runner's SOFTWARE GL. This suite is that bet, scripted: it drives the same gestures at both
   globes and prints both, so the comparison is on the record every run, and it FAILS on v2's
   budget only — v1's figures are the baseline, not a test.

   WHAT IT MEASURES. A requestAnimationFrame loop injected into the page records the interval
   between consecutive frames while a gesture runs; that is what a reader feels (a 30 ms frame of
   work shows as a 33 ms interval at 60 Hz). Gestures: a drag (120 pointer moves), a wheel zoom in
   and out, a two-finger pinch in and out through CDP touch events, and — v1 only until Phase 2
   ships a timeline — a scrub of the year pin. Percentiles are over the frames of that gesture.

   The budgets are the design's and are not loosened for a slow runner: a miss is the signal the
   Phase 0 gate exists to produce ("the design is revisited here, not patched later").
*/
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream" };
const BUDGET = { p95: 20, max: 100 };
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
async function pinch(page, cdp, cx, cy) {
  const pts = (d) => [{ x: cx - d, y: cy, id: 1 }, { x: cx + d, y: cy, id: 2 }];
  const send = (type, touchPoints) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints });
  await send("touchStart", pts(60));
  for (let i = 1; i <= 30; i++) { await send("touchMove", pts(60 + i * 5)); await sleep(16); }
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

  /* ---------- v2 ---------- */
  {
    const t0 = Date.now();
    await page.goto(base + "#map2", { waitUntil: "load" });
    await page.reload();   // a hash-only change does not reload; make sure #map2 boots from scratch
    await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 90000 });
    const box = await (await page.$(".atlas2-canvas")).boundingBox();
    const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
    await sampler(page);
    const r = {};
    r.ready = Date.now() - t0;
    r.load = await page.evaluate(() => { const s = document.querySelector(".atlas2").__atlas2.stats; return { fetchMs: s.fetchMs, bytes: s.bytes, firstPaintMs: s.firstPaintMs, workerMs: s.worker && s.worker.totalMs, uploads: s.uploads, levels: s.worker && s.worker.levels.map((l) => l.level + ":" + l.triangles + "tri/" + l.segments + "seg/" + l.ms + "ms").join(" ") }; });
    r.drag = await measure(page, () => drag(page, cx, cy));
    r.wheel = await measure(page, () => wheel(page, cx, cy));
    r.pinch = await measure(page, () => pinch(page, cdp, cx, cy));
    r.scrub = null;   // no timeline until Phase 2
    r.draw = await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2, s = c.stats; const d = s.draw.slice(-200).sort((a, b) => a - b); return { p50: d[Math.floor(d.length / 2)], max: d[d.length - 1], level: s.level, tri: c.renderer.stats.trianglesDrawn, seg: c.renderer.stats.segmentsDrawn, draws: c.renderer.stats.draws }; });
    r.heapMB = await page.evaluate(() => performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : NaN);
    // the ID pass: a tap on the globe's centre must name a face
    await page.mouse.click(cx, cy); await page.waitForTimeout(300);
    r.pick = await page.evaluate(() => document.querySelector(".atlas2-caption").textContent);
    results.v2 = r;
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
  console.log(`  v2 renderer draw time (CPU side, ms): p50 ${results.v2.draw.p50 && results.v2.draw.p50.toFixed(2)}, max ${results.v2.draw.max && results.v2.draw.max.toFixed(2)}; last frame: level ${results.v2.draw.level}, ${results.v2.draw.tri} triangles + ${results.v2.draw.seg} segments in ${results.v2.draw.draws} draw calls`);
  console.log(`  JS heap: v1 ${results.v1.heapMB} MB, v2 ${results.v2.heapMB} MB; v2 pick at centre: "${results.v2.pick}"`);

  let fails = 0;
  const check = (name, ok, detail) => { console.log(`  ${ok ? "\x1b[32mok\x1b[0m  " : "\x1b[31mFAIL\x1b[0m"}  ${name}${detail ? "  \x1b[2m" + detail + "\x1b[0m" : ""}`); if (!ok) fails++; };
  console.log("\nBudgets (v2 only; §2.2: p95 ≤ 20 ms, max ≤ 100 ms during drag and pinch)\n");
  for (const g of ["drag", "pinch"]) {
    const s = results.v2[g];
    check(`v2 ${g} p95 ≤ ${BUDGET.p95} ms`, s.p95 <= BUDGET.p95, `${s.p95.toFixed(1)} ms over ${s.n} frames`);
    check(`v2 ${g} max ≤ ${BUDGET.max} ms`, s.max <= BUDGET.max, `${s.max.toFixed(1)} ms`);
  }
  check("v2 names the face under a tap (ID pass)", !!results.v2.pick, results.v2.pick);
  check("no page errors on #map2", errors.length === 0, errors.slice(0, 3).join(" | "));
  console.log("");
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
