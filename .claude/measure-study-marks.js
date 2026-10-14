#!/usr/bin/env node
/* measure-study-marks.js — what the Full Atlas draws at six fixed views, and what drawing it costs (Atlas v2, study layer).

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/measure-study-marks.js [--json]

   Report-only (exit 0). For each fixed view with the Full Atlas on it prints: the names placed (labels with text), how many of
   those are the study layer's, the marks drawn, and the per-frame cost of drawing them — the label canvas's whole pass and, where
   the build records it, the marks' own pass — over 120 frames of a view that moves by a hair each frame (so nothing is cached),
   against the same frames on the plain Map (no study layer), so the study layer's cost is a difference and not a guess.
   The views: the globe (the widest the page allows), Europe at 6 km/px, the Aegean (23 E 38 N, 6 km/px), Rome at 6 km/px, the
   Benelux at city scale (1.5 km/px), and a city (Rome at 1.5 km/px). The same script ran before and after the stacks were
   removed (docs/atlas-v2-design.md §7, "Stacks removed"), which is how the two sets of figures there are comparable. */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream" };
const PORT = 5640 + (process.pid % 50);
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const VIEWS = [["the globe", 0, 20, 90], ["Europe, 6 km/px", 12, 48, 6], ["the Aegean, 6 km/px", 23, 38, 6], ["Rome, 6 km/px", 12.5, 41.9, 6], ["the Benelux, city scale 1.5 km/px", 4.6, 51.2, 1.5], ["Rome, city scale 1.5 km/px", 12.5, 41.9, 1.5]];
const q = (a, p) => { if (!a.length) return 0; const s = a.slice().sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch(LAUNCH);
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${PORT}/#map2`, { waitUntil: "load" });
  await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 120000 });
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.waterSettled() && c.labelsReady() && c.study.ready(); }, null, { timeout: 120000 });
  const A = (fn, arg) => page.evaluate(`(() => { const c = document.querySelector(".atlas2").__atlas2; return (${fn.toString()})(c, ${JSON.stringify(arg === undefined ? null : arg)}); })()`);
  const go = async (lon, lat, k) => {
    await page.evaluate(([a, b, c]) => document.querySelector(".atlas2").__atlas2.setView(a, b, c), [lon, lat, k]);
    await page.waitForFunction(() => document.querySelector(".atlas2").__atlas2.tilesSettled(), null, { timeout: 120000 });
    await A((c) => c.layoutNow()); await sleep(150);
  };
  const frames = (lon, lat, k) => page.evaluate(([lon, lat, k]) => new Promise((res) => {
    const c = document.querySelector(".atlas2").__atlas2, n0 = c.drawSamples().labels.length; let i = 0;
    const m0 = c.drawSamples().marks.length;
    const step = () => { c.setView(lon + (i % 2 ? 1 : -1) * 1e-4 * (i + 1), lat, k); if (++i < 120) requestAnimationFrame(step); else requestAnimationFrame(() => { const s = c.drawSamples(); res({ labels: s.labels.slice(-120), marks: s.marks.slice(-120), n0, m0 }); }); };
    requestAnimationFrame(step);
  }), [lon, lat, k]);
  const out = [];
  for (const mode of ["map", "full"]) {
    await page.click(`.atlas2-study [data-mode="${mode}"]`); await sleep(400);
    for (const [name, lon, lat, k] of VIEWS) {
      await go(lon, lat, k);
      const info = await A((c) => { const ls = c.labels(); return { kmpp: c.view.kmpp, names: ls.filter((p) => p.text).length, studyNames: ls.filter((p) => p.text && p.st).length, marks: c.study.marks().length, placed: ls.length }; });
      const f = await frames(lon, lat, info.kmpp);
      out.push({ mode, view: name, ...info, labelPassMeanMs: mean(f.labels), labelPassP95Ms: q(f.labels, 0.95), marksMeanMs: mean(f.marks), marksP95Ms: q(f.marks, 0.95) });
    }
  }
  await browser.close(); server.close();
  if (process.argv.includes("--json")) { console.log(JSON.stringify(out, null, 1)); return; }
  console.log("mode  view                                  kmpp  names (study)  marks  label pass mean/p95 ms   marks pass mean/p95 ms");
  for (const o of out) console.log(`${o.mode.padEnd(5)} ${o.view.padEnd(36)} ${o.kmpp.toFixed(2).padStart(5)}  ${String(o.names).padStart(5)} (${String(o.studyNames).padStart(3)})  ${String(o.marks).padStart(5)}  ${o.labelPassMeanMs.toFixed(2).padStart(7)} / ${o.labelPassP95Ms.toFixed(2).padEnd(7)}  ${o.marksMeanMs.toFixed(2).padStart(7)} / ${o.marksP95Ms.toFixed(2)}`);
})().catch((e) => { console.error(e); process.exit(1); });
