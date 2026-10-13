/* measure-atlas-embed.js — what the FIRST card window costs on the engine (Atlas v2 Phase 4, Task 2). A tool, not a gate: it prints bytes and times for the owner's report and for docs/atlas-v2-design.md §7.

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/measure-atlas-embed.js [cardId]        (default geo-002, a map card; rm-003 is a locator with water)
     FOLIO_CHROMIUM=/path/to/chrome

   For each profile (a desktop; a phone: 390×844, device scale 3, touch, the CPU slowed 4× and the network held to "slow 4G", 1.6 Mbit/s and 150 ms) it opens the card page with the preview switch ON in a FRESH browser context
   (a cold cache), then measures from the moment the card page starts rendering the window to (a) the FIRST PAINT (the window's canvas holds the engine's first frame) and (b) SETTLED (the tiles for its view are in), and sums every
   response the page received while it did — split into the engine's code, the worker, topology.bin, the tiles and the water — as the local server sent them (uncompressed) and gzip -9 of the same files (what a host that
   compresses sends). Then a SECOND page in the same context (a warm HTTP cache, a new document) is timed to first paint again. The software GL of a headless runner (SwiftShader) is what draws: the numbers say what the
   code does, not what a phone's GPU would; the real phone is not measured here. */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path"), zlib = require("zlib");
const { chromium } = require("playwright");
const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream", ".woff2": "font/woff2" };
const PORT = 5622, CARD = process.argv[2] || "geo-002";
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(req.url.split("?")[0]) === "/" ? "/index.html" : decodeURIComponent(req.url.split("?")[0]);
  const file = path.join(ROOT, p);
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end(); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length, "Cache-Control": "max-age=3600" }); res.end(data); });
});
const kind = (u) => /atlas-worker|earcut/.test(u) ? "worker" : /atlas\/(atlas|study|atlas-gl|atlas-canvas|atlas-format|atlas-embed|atlas-windows)\.js|card-faces\.js|wars\.js|rivers\.js/.test(u) ? "code" : /topology\.bin/.test(u) ? "topology" : /tiles\//.test(u) ? "tiles" : /water/.test(u) ? "water" : /atlas\//.test(u) ? "atlas other" : "page";
const gz = (u) => { try { return zlib.gzipSync(fs.readFileSync(path.join(ROOT, u)), { level: 9 }).length; } catch (e) { return 0; } };

async function run(browser, profile, throttle) {
  const ctx = await browser.newContext(profile);
  await ctx.addInitScript(() => {
    try { localStorage.setItem("folio.atlas2.preview", "1"); } catch (e) {}
    window.__t = {};
    const check = () => {
      const h = document.querySelector(".map-card"); if (!h) return;
      if (window.__t.mount == null) window.__t.mount = performance.now();
      const c = h.querySelector(".mc-canvas");
      if (window.__t.first == null && c && c.width > 1 && h.getAttribute("data-map-engine") === "v2") { try { const d = c.getContext("2d").getImageData(c.width >> 1, c.height >> 1, 1, 1).data; if (d[3] > 0) window.__t.first = performance.now(); } catch (e) {} }
      if (window.__t.first != null && window.__t.settled == null && window.AtlasEmbed && AtlasEmbed.hub()) { const x = AtlasEmbed.hub(); try { if (x.ctl.tilesSettled() && x.ctl.waterSettled() && h._folioMap && h._folioMap.ready()) window.__t.settled = performance.now(); } catch (e) {} }
    };
    setInterval(check, 20);
  });
  const out = {};
  for (const pass of ["cold", "warm"]) {
    const page = await ctx.newPage(), cdp = await ctx.newCDPSession(page);
    if (throttle) { await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 }); await cdp.send("Network.enable"); await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 }); }
    const rec = [], sizes = new Map();
    page.on("response", (r) => rec.push(new URL(r.url()).pathname));
    page.on("requestfinished", async (rq) => { try { const sz = await rq.sizes(); sizes.set(new URL(rq.url()).pathname, sz.responseBodySize + sz.responseHeadersSize); } catch (e) {} });
    // the first navigation of a fresh context IS the cold load: no reload, so nothing is in the cache
    await page.goto(`http://127.0.0.1:${PORT}/#card/${CARD}`, { waitUntil: "load", timeout: 900000 });
    await page.waitForFunction(() => window.__t && window.__t.settled != null, null, { timeout: 900000 });
    await new Promise((r) => setTimeout(r, 600));
    const t = await page.evaluate(() => window.__t);
    const got = rec.filter((u, i, a) => a.indexOf(u) === i).filter((u) => kind(u) !== "page");
    const by = {}; let raw = 0, gzb = 0; for (const u of got) { const k = kind(u); const sz = sizes.get(u) || (fs.existsSync(path.join(ROOT, u)) ? fs.statSync(path.join(ROOT, u)).size : 0); by[k] = (by[k] || 0) + sz; raw += sz; gzb += gz(u) || sz; }
    out[pass] = { firstPaintMs: Math.round(t.first - t.mount), settledMs: Math.round(t.settled - t.mount), files: got.length, raw, gz: gzb, by };
    await page.close();
  }
  await ctx.close();
  return out;
}
(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch(LAUNCH);
  const profiles = [["desktop 1280×800", { viewport: { width: 1280, height: 800 } }, false], ["phone 390×844 @3x, CPU ×4, slow 4G", { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }, true]];
  for (const [name, p, th] of profiles) {
    const r = await run(browser, p, th);
    const kb = (n) => (n / 1024).toFixed(0) + " KB";
    console.log(`\n${name} — card ${CARD}`);
    console.log(`  cold cache : first paint ${r.cold.firstPaintMs} ms after the window mounted, settled ${r.cold.settledMs} ms; ${r.cold.files} files, ${kb(r.cold.raw)} as served, ${kb(r.cold.gz)} gzip -9 — ` + Object.entries(r.cold.by).map(([k, v]) => k + " " + kb(v)).join(", "));
    console.log(`  warm cache : first paint ${r.warm.firstPaintMs} ms, settled ${r.warm.settledMs} ms; ${r.warm.files} files fetched, ${kb(r.warm.raw)}`);
  }
  await browser.close(); server.close();
})().catch((e) => { console.error(e); process.exit(1); });
