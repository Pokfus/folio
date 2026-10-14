/* measure-atlas-embed.js — what the FIRST card window costs on the engine (Atlas v2 Phase 4, Task 2). A tool, not a gate: it prints bytes and times for the owner's report and for docs/atlas-v2-design.md §7.

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/measure-atlas-embed.js [cardId] [--engine=v1|v2] [--profile=desktop|phone] [--after=ms] [--json]
        (default geo-002, a map card; rm-003 is a locator with water, rm-209 a war; --engine=v1 leaves the preview switch OFF and times V1's window)
     FOLIO_CHROMIUM=/path/to/chrome

   `--after=4000` is the realistic reader: the page opens on #home, sits there for that long (the idle warm-up runs), THEN the card is opened — the time is from the window's mount as before.

   Phase 4b: the bytes now include the WORKER's own requests (atlas-worker.js, earcut, and anything the worker fetches) — Phase 4's tool listened on the page and so missed them — and count everything requested after the page's own shell (the shell, the pictures and the two idle-warmed -extra files are not the window's cost), the lazy data V1 loads (world.js, the layer bundles) included. Time is from the window's mount; `firstSinceNavMs` is from the navigation. `--engine=v1` times V1's window the same way.

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
const ARGS = process.argv.slice(2), FLAG = (n, d) => { const a = ARGS.find((x) => x.startsWith("--" + n + "=")); return a ? a.split("=")[1] : d; };
const PORT = 5622 + Math.floor(Math.random() * 300), CARD = ARGS.find((x) => !x.startsWith("--")) || "geo-002", ENGINE = FLAG("engine", "v2"), AFTER = Number(FLAG("after", "0")), ONLY = FLAG("profile", ""), JSONOUT = ARGS.includes("--json");
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(req.url.split("?")[0]) === "/" ? "/index.html" : decodeURIComponent(req.url.split("?")[0]);
  const file = path.join(ROOT, p);
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end(); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length, "Cache-Control": "max-age=3600" }); res.end(data); });
});
const kind = (u) => /atlas-worker|earcut/.test(u) ? "worker" : /atlas\/(atlas|study|atlas-gl|atlas-canvas|atlas-format|atlas-embed|atlas-windows)\.js|card-faces\.js|wars\.js|rivers\.js/.test(u) ? "code" : /topology\.bin/.test(u) ? "topology" : /tiles\//.test(u) ? "tiles" : /water/.test(u) ? "water" : /atlas\//.test(u) ? "atlas other" : /^\/(wikipedia.*|glossary-extra\.js|artefacts-extra\.js|index\.html|app\.js|styles\.css|data\.js|truefalse\.js|quotes\.js|whatyear\.js|crossword\.js|changelog\.js|mission\.js|glossary\.js|artefacts\.js|lang-decks\.js|manifest\.json|favicon.*|icon.*|sw\.js|fonts\/.*|data-extra\/.*)$/.test(u) ? "page" : "other lazy data";
const gz = (u) => { try { return zlib.gzipSync(fs.readFileSync(path.join(ROOT, u)), { level: 9 }).length; } catch (e) { return 0; } };

async function run(browser, profile, throttle) {
  const ctx = await browser.newContext(profile);
  await ctx.addInitScript((engine) => {
    try { if (engine === "v2") localStorage.setItem("folio.atlas2.preview", "1"); else localStorage.setItem("folio.atlas2.preview", "0");   // Stage B: "0" is the way back to v1 } catch (e) {}
    window.__t = {};
    /* the mount is stamped by a MutationObserver (a microtask after the card is inserted), not by the 20 ms poll: V1's window parses its data on the main thread and a poll only runs after that, which read as a first paint at 0 ms */
    const stamp = () => { if (window.__t.mount == null && document.querySelector(".map-card")) { window.__t.mount = performance.now(); window.__t.mountEpoch = Date.now(); } };
    new MutationObserver(stamp).observe(document, { childList: true, subtree: true }); stamp();
    const check = () => {
      stamp();
      const h = document.querySelector(".map-card"); if (!h) return;
      const c = h.querySelector(".mc-canvas");
      const eng = h.getAttribute("data-map-engine");
      if (window.__t.first == null && c && c.width > 1 && (engine === "v2" ? eng === "v2" : (eng !== "v2" && h._folioMap && h._folioMap.ready() && Array.isArray(window.WORLD_GEO)))) {   // V1: the map is drawn once world.js has landed and the window is fitted (before that its canvas holds an empty globe; a war window reports ready() at once, with no data at all)
         try { const d = c.getContext("2d").getImageData(c.width >> 1, c.height >> 1, 1, 1).data; if (d[3] > 0) window.__t.first = performance.now(); } catch (e) {} }
      if (window.__t.first != null && window.__t.settled == null) {
        try {
          if (engine === "v2") { if (h._folioMap && h._folioMap.settled && h._folioMap.settled()) window.__t.settled = performance.now(); else if (!(h._folioMap && h._folioMap.settled) && window.AtlasEmbed && AtlasEmbed.hub()) { const x = AtlasEmbed.hub(); if (x.ctl.tilesSettled() && x.ctl.waterSettled() && h._folioMap && h._folioMap.ready()) window.__t.settled = performance.now(); } }
          else if (h._folioMap && h._folioMap.ready()) window.__t.settled = performance.now();
        } catch (e) {}
      }
    };
    setInterval(check, 20);
  }, ENGINE);
  const out = {};
  for (const pass of ["cold", "warm"]) {
    const page = await ctx.newPage(), cdp = await ctx.newCDPSession(page);
    if (throttle) { await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 }); await cdp.send("Network.enable"); await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 }); }
    /* the CONTEXT's request events, which include a dedicated worker's own requests (the page's do not) */
    const rec = [], sizes = new Map(), when = new Map();
    const onReq = (rq) => { const u = new URL(rq.url()).pathname; if (!when.has(u)) when.set(u, Date.now()); rec.push(u); };
    ctx.on("request", onReq);
    ctx.on("requestfinished", async (rq) => { try { const sz = await rq.sizes(); sizes.set(new URL(rq.url()).pathname, sz.responseBodySize + sz.responseHeadersSize); } catch (e) {} });
    // the first navigation of a fresh context IS the cold load: no reload, so nothing is in the cache
    await page.goto(`http://127.0.0.1:${PORT}/${AFTER ? "#home" : "#card/" + CARD}`, { waitUntil: "load", timeout: 900000 });
    if (AFTER) { await new Promise((r) => setTimeout(r, AFTER)); await page.evaluate((c) => { location.hash = "#card/" + c; }, CARD); }
    try { await page.waitForFunction(() => window.__t && window.__t.settled != null, null, { timeout: 600000 }); }
    catch (e) { const d = await page.evaluate(() => { const h = document.querySelector(".map-card"), hub = window.AtlasEmbed && AtlasEmbed.hub(); return JSON.stringify({ t: window.__t, engine: h && h.getAttribute("data-map-engine"), ready: h && h._folioMap && h._folioMap.ready(), settled: h && h._folioMap && h._folioMap.settled && h._folioMap.settled(), hub: !!hub, hist: hub && hub.historyOK(), land: hub && hub.E.landSettled(), tiles: hub && hub.ctl.tilesSettled(), water: hub && hub.ctl.waterSettled() }); }).catch(() => "no page state"); out[pass] = { failed: "the window never settled: " + d, firstPaintMs: null, settledMs: null, files: 0, raw: 0, gz: 0, wire: 0, by: {}, list: [] }; await page.close(); continue; }   // a war window that fell back to V1 after the engine's history did not arrive in 150 s (V1's window then drew): reported, not fatal
    await new Promise((r) => setTimeout(r, 600));
    const t = await page.evaluate(() => window.__t);
    ctx.off("request", onReq);
    const got = rec.filter((u, i, a) => a.indexOf(u) === i).filter((u) => kind(u) !== "page");   // everything the page requested after its shell, from NAVIGATION start: the engine's idle warm-up fetches its bytes before the window mounts, and a window that mounts later would otherwise look free
    const by = {}; let raw = 0, gzb = 0, wire = 0; for (const u of got) { const k = kind(u); const sz = sizes.get(u) || 0; const full = fs.existsSync(path.join(ROOT, u)) ? fs.statSync(path.join(ROOT, u)).size : sz; wire += sz; by[k] = (by[k] || 0) + full; raw += full; gzb += gz(u) || full; }
    out[pass] = { firstPaintMs: Math.round(t.first - t.mount), firstSinceNavMs: Math.round(t.first), settledMs: Math.round(t.settled - t.mount), files: got.length, raw, gz: gzb, wire, by, list: got };
    await page.close();
  }
  await ctx.close();
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
    const kb = (n) => (n / 1024).toFixed(0) + " KB";
    console.log(`\n${name} — card ${CARD}, engine ${ENGINE}`);
    if (r.cold.failed || r.warm.failed) console.log(`  FAILED: ${r.cold.failed || ""} ${r.warm.failed || ""}`);
    console.log(`  cold cache : first paint ${r.cold.firstPaintMs} ms after the window mounted (${r.cold.firstSinceNavMs} ms after navigation), settled ${r.cold.settledMs} ms; ${r.cold.files} files, ${kb(r.cold.raw)} as served, ${kb(r.cold.gz)} gzip -9 — ` + Object.entries(r.cold.by).map(([k, v]) => k + " " + kb(v)).join(", "));
    console.log(`  warm cache : first paint ${r.warm.firstPaintMs} ms, settled ${r.warm.settledMs} ms; ${r.warm.files} files requested, ${kb(r.warm.wire)} on the wire`);
  }
  if (JSONOUT) console.log(JSON.stringify({ card: CARD, engine: ENGINE, ...all }));
  await browser.close(); server.close();
})().catch((e) => { console.error(e); process.exit(1); });
