/* measure-atlas-cold.js — what a COLD LOAD of the Atlas page costs: the bytes the page and its worker request, and the time from navigation to a DRAWN globe (Atlas v2 Phase 5, Task 6). A tool, not a gate:
   it prints the numbers for the owner's report and for docs/atlas-v2-phase5-plan.md.

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/measure-atlas-cold.js [--route=map|map2] [--profile=desktop|phone] [--json]
        (default route: map; before Phase 5 `--route=map` is v1's page and `--route=map2` the engine's, after it `map` is the engine's and map2 redirects to it)
     FOLIO_CHROMIUM=/path/to/chrome

   Two profiles, as .claude/measure-atlas-embed.js has them: a desktop (1280×800) and a phone (390×844 at 3×, touch, the CPU slowed 4× and the network held to "slow 4G": 1.6 Mbit/s, 150 ms). Each opens the
   route in a fresh context (nothing cached: the first navigation IS the cold load) and records every response the CONTEXT sees (a dedicated worker's own requests included), as the local server sent it
   (raw) and gzip -9 of the same file (what a compressing host sends). "A drawn globe" is v1: #globe holds a painted pixel at its centre with the data landed; v2: `.atlas2[data-ready="1"]` and a painted
   frame (the controller's first-paint stat). The software GL of a headless runner (SwiftShader) draws; the numbers are that machine's, not a phone's GPU. */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path"), zlib = require("zlib");
const { chromium } = require("playwright");
const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream", ".woff2": "font/woff2", ".webmanifest": "application/manifest+json" };
const ARGS = process.argv.slice(2), FLAG = (n, d) => { const a = ARGS.find((x) => x.startsWith("--" + n + "=")); return a ? a.split("=")[1] : d; };
const ROUTE = FLAG("route", "map"), ONLY = FLAG("profile", ""), JSONOUT = ARGS.includes("--json");
const PORT = 5922 + Math.floor(Math.random() * 300);
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(req.url.split("?")[0]) === "/" ? "/index.html" : decodeURIComponent(req.url.split("?")[0]);
  const file = path.join(ROOT, p);
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end(); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});
const gzSize = (u) => { try { return zlib.gzipSync(fs.readFileSync(path.join(ROOT, u)), { level: 9 }).length; } catch (e) { return 0; } };
const kind = (u) => /^\/(index\.html|)$/.test(u) ? "page" : /atlas-worker|earcut/.test(u) ? "worker" : /^\/atlas\/.*\.(bin|bin\.js)$|^\/atlas\/data\/(tiles|water|relief)\//.test(u) ? "atlas data" : /^\/atlas\//.test(u) ? "atlas code and tables" : /^\/(data|glossary|truefalse|quotes|whatyear|crossword|changelog|mission|artefacts|lang-decks)\.js$|^\/data-extra\//.test(u) ? "eager data" : u === "/app.js" ? "app.js" : /\.(css|woff2?)$/.test(u) ? "css and fonts" : /\.(png|svg|ico|json)$/.test(u) ? "images and manifest" : "v1 and other lazy data";

async function run(browser, profile, throttle) {
  const ctx = await browser.newContext(profile);
  await ctx.addInitScript((route) => {
    window.__t = {};
    try { localStorage.setItem("folio_atlas_tour_v1", "1"); } catch (e) {}
    const check = () => {
      if (window.__t.drawn != null) return;
      try {
        if (route === "map" && document.querySelector("#globe") && !document.querySelector(".atlas2")) {
          const c = document.querySelector("#globe");
          if (window.WORLD_GEO && c && c.width > 1 && !document.querySelector("#globeStage .data-loading")) { const d = c.getContext("2d").getImageData(c.width >> 1, c.height >> 1, 1, 1).data; if (d[3] > 0) window.__t.drawn = performance.now(); }
          return;
        }
        const a = document.querySelector(".atlas2");
        if (a && a.getAttribute("data-ready") === "1" && a.__atlas2 && a.__atlas2.stats && a.__atlas2.stats.frames && a.__atlas2.stats.frames.length > 0) window.__t.drawn = performance.now();
      } catch (e) {}
    };
    setInterval(check, 20);
  }, ROUTE);
  const out = {};
  const page = await ctx.newPage(), cdp = await ctx.newCDPSession(page);
  if (throttle) { await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 }); await cdp.send("Network.enable"); await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (0.75 * 1024 * 1024) / 8 }); }
  const rec = [], errors = [];
  ctx.on("request", (rq) => rec.push(new URL(rq.url()).pathname));
  page.on("pageerror", (e) => errors.push(String(e.message || e)));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto(`http://127.0.0.1:${PORT}/#${ROUTE}`, { waitUntil: "load", timeout: 900000 });
  try { await page.waitForFunction(() => window.__t && window.__t.drawn != null, null, { timeout: 600000 }); } catch (e) { out.failed = "no drawn globe within the limit"; }
  await new Promise((r) => setTimeout(r, 800));
  const t = await page.evaluate(() => window.__t);
  const got = rec.filter((u, i, a) => a.indexOf(u) === i);
  const by = {}; let raw = 0, gz = 0;
  for (const u of got) { const k = kind(u); const full = fs.existsSync(path.join(ROOT, u)) && fs.statSync(path.join(ROOT, u)).isFile() ? fs.statSync(path.join(ROOT, u)).size : 0; raw += full; gz += gzSize(u); by[k] = (by[k] || 0) + full; }
  out.drawnMs = t.drawn != null ? Math.round(t.drawn) : null; out.files = got.length; out.raw = raw; out.gz = gz; out.by = by; out.errors = errors.filter((e) => !/Failed to load resource/.test(e)); out.list = got;
  await page.close(); await ctx.close();
  return out;
}
(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch(LAUNCH);
  const profiles = [["desktop 1280×800", "desktop", { viewport: { width: 1280, height: 800 } }, false], ["phone 390×844 @3x, CPU ×4, slow 4G", "phone", { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }, true]].filter((p) => !ONLY || p[1] === ONLY);
  const all = {};
  for (const [name, key, p, th] of profiles) {
    const r = await run(browser, p, th);
    all[key] = r;
    if (JSONOUT) continue;
    const kb = (n) => (n / 1024).toFixed(0) + " KB", mb = (n) => (n / 1048576).toFixed(2) + " MB";
    console.log(`\n${name} — #${ROUTE}, cold cache`);
    if (r.failed) console.log("  FAILED: " + r.failed);
    console.log(`  a drawn globe ${r.drawnMs} ms after navigation; ${r.files} files, ${mb(r.raw)} as served, ${mb(r.gz)} gzip -9`);
    console.log("  by kind: " + Object.keys(r.by).sort((a, b) => r.by[b] - r.by[a]).map((k) => `${k} ${kb(r.by[k])}`).join(" · "));
    if (r.errors.length) console.log("  console errors: " + r.errors.slice(0, 5).join(" | "));
  }
  if (JSONOUT) console.log(JSON.stringify({ route: ROUTE, ...all }));
  await browser.close(); server.close();
})().catch((e) => { console.error(e); process.exit(1); });
