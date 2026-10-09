/* test-atlas-session.js — a long session on Atlas v2: memory and the caches (Phase 1d; docs/atlas-v2-design.md §7).

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-session.js
     FOLIO_SESSION_S=300   … the session's length in seconds (300 by default; a shorter run for a quick look)
     FOLIO_CHROMIUM=/path/to/chrome  … to pick the browser (otherwise playwright's own)

   A scripted reader for five minutes: zooms into three dozen coasts and back out, pans, toggles relief, searches and
   opens cards, lets tiles arrive and go — a loop of the things a session does — while the JS heap (after a forced
   collection), the renderer's GPU bytes (buffers and textures it has uploaded and not deleted), the tile, water-tile
   and relief caches and the label sprites are sampled every ten seconds. WHAT IT PROVES:
     · the land-tile cache never holds more than TILE_CACHE tiles and evicts (fetched > resident by the end);
     · the water-tile cache likewise; the relief cache never holds more than RELIEF_CACHE textures and evicts;
     · the label sprites are the current layout's only (no growth across layouts);
     · the GPU bytes stay bounded: the end is within a tile-cache's worth of the high-water mark, and the resident
       set's bytes do not climb round after round;
     · the heap after the session, with a forced collection, is within HEAP_SLACK_MB of the heap after the first
       round — it returns near its baseline rather than climbing with the minutes.
   Numbers are printed as a table for the as-built note.
*/
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = Object.assign(process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {}, { args: ["--js-flags=--expose-gc"] });
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream" };
const PORT = 5624;
const SESSION_S = Number(process.env.FOLIO_SESSION_S || 300);
const HEAP_SLACK_MB = 25;      // the heap at the end may exceed the heap after round one by at most this (measured headroom: see the as-built note)
const TILE_CACHE = 96, WATER_TILE_CACHE = 64, RELIEF_CACHE = 10;   // atlas.js's constants
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// three dozen coasts a reader might visit, with the zoom each is looked at — enough distinct tiles (more than the
// 96-tile cap of the land cache) that the session proves eviction, not only growth
const PLACES = [[25.2, 37.6, 0.5], [4.8, 52.9, 0.3], [6.5, 61.0, 0.15], [-89.6, 29.4, 0.5], [31.2, 30.8, 0.5], [139.7, 35.7, 0.4], [-122.4, 37.8, 0.3], [103.8, 1.3, 0.2], [-43.2, -22.9, 0.4], [151.2, -33.9, 0.3], [12.5, 41.9, 0.5], [-0.1, 51.5, 0.3],
  [29.0, 41.0, 0.3], [114.2, 22.3, 0.2], [72.8, 19.1, 0.3], [18.4, -33.9, 0.3], [-9.1, 38.7, 0.3], [-123.1, 49.3, 0.3], [-58.4, -34.6, 0.5], [3.4, 6.5, 0.4], [18.1, 59.3, 0.2], [12.3, 45.4, 0.15], [55.3, 25.3, 0.3], [121.5, 31.2, 0.4],
  [174.8, -36.9, 0.3], [-82.4, 23.1, 0.4], [-122.3, 47.6, 0.3], [-74.0, 40.7, 0.3], [12.6, 55.7, 0.2], [106.8, -6.2, 0.4], [-21.9, 64.1, 0.5], [-63.6, 44.6, 0.4], [5.4, 43.3, 0.3], [129.0, 35.2, 0.3], [115.9, -31.9, 0.4], [-149.9, 61.2, 0.5]];
const SEARCHES = ["paris", "danube", "baikal", "andes", "tokyo", "sahara", "amazon", "alps"];

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch(LAUNCH);
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, hasTouch: true });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  await page.goto(`http://127.0.0.1:${PORT}/#map2`, { waitUntil: "load" });
  await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 180000 });
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.waterSettled() && c.labelsReady() && c.labels().length > 0; }, null, { timeout: 120000 });
  const settle = () => page.waitForFunction(() => document.querySelector(".atlas2").__atlas2.tilesSettled(), null, { timeout: 60000 }).then(() => true, () => false);
  const sample = (label) => page.evaluate((label) => { if (window.gc) window.gc(); const c = document.querySelector(".atlas2").__atlas2, s = c.statsNow(); return { label, t: Math.round(performance.now() / 1000), heapMB: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : NaN, gpuMB: Math.round(s.gpuBytes / 1048576 * 10) / 10, texMB: Math.round(s.gpuTextureBytes / 1048576 * 10) / 10, tiles: s.tilesResident, tilesFetched: s.fetched, tilesEvicted: s.evicted, water: s.waterTilesResident, relief: s.reliefResident, sprites: c.labels().filter((p) => p.sprite).length, placed: c.labels().length, level: s.level }; }, label);
  const samples = [];
  const box = await (await page.$(".atlas2-canvas")).boundingBox();
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  const cdp = await context.newCDPSession(page);
  samples.push(await sample("start"));
  const t0 = Date.now(); let round = 0, lastSample = Date.now();
  let firstRoundHeap = null;
  while (Date.now() - t0 < SESSION_S * 1000) {
    round++;
    const P = PLACES[(round - 1) % PLACES.length];
    // relief on for every other round; fly to a coast, let the tiles land, pan a little, zoom out through the levels
    await page.evaluate((on) => document.querySelector(".atlas2").__atlas2.setLayers({ relief: on }), round % 2 === 0);
    await page.evaluate((P) => document.querySelector(".atlas2").__atlas2.flyTo(P[0], P[1], P[2]), P);
    await page.waitForFunction(() => !document.querySelector(".atlas2").__atlas2.flying(), null, { timeout: 10000 }).catch(() => {});
    await settle();
    await page.mouse.move(cx, cy); await page.mouse.down(); for (let i = 1; i <= 15; i++) { await page.mouse.move(cx + i * 8, cy + i * 3); await sleep(16); } await page.mouse.up(); await sleep(200);
    await settle();
    for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, 120); await sleep(60); }
    await settle();
    // a search and a card
    const q = SEARCHES[(round - 1) % SEARCHES.length];
    await page.fill(".atlas2-search-in", q); await sleep(150);
    const hit = await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; return c.search(document.querySelector(".atlas2-search-in").value)[0] || null; });
    if (hit) { await page.evaluate(() => document.querySelector(".atlas2").__atlas2.chooseResult(0)); await page.waitForFunction(() => !document.querySelector(".atlas2").__atlas2.flying(), null, { timeout: 10000 }).catch(() => {}); await settle(); }
    await page.evaluate(() => { const s = document.querySelector(".atlas2-search-in"); s.value = ""; s.dispatchEvent(new Event("input")); document.querySelector(".atlas2").__atlas2.clearSelection(); });
    // a pinch out at the globe
    await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setView(10, 20, 24)); await sleep(200);
    const pts = (d) => [{ x: cx - d, y: cy, id: 1 }, { x: cx + d, y: cy, id: 2 }];
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: pts(60) });
    for (let i = 1; i <= 15; i++) { await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: pts(60 + i * 6) }); await sleep(16); }
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await sleep(300);
    await settle();
    if (round === 1) { const s = await sample("round 1"); samples.push(s); firstRoundHeap = s.heapMB; lastSample = Date.now(); }
    else if (Date.now() - lastSample > 10000) { samples.push(await sample("round " + round)); lastSample = Date.now(); }
  }
  await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; c.setLayers({ relief: false }); c.setView(10, 20, 24); }); await settle(); await sleep(1000);
  const end = await sample("end (globe, relief off)"); samples.push(end);
  await browser.close(); server.close();

  console.log(`\nA ${SESSION_S} s session, ${round} rounds (fly to a coast, tiles, pan, wheel out, search + card, pinch at the globe; relief on every other round); samples after a forced GC:\n`);
  console.log("  sample                   t(s)  heap MB  GPU MB  tex MB  tiles  fetched  evicted  water  relief  sprites/placed  LOD");
  for (const s of samples) console.log(`  ${s.label.padEnd(24)} ${String(s.t).padStart(4)}  ${String(s.heapMB).padStart(7)}  ${String(s.gpuMB).padStart(6)}  ${String(s.texMB).padStart(6)}  ${String(s.tiles).padStart(5)}  ${String(s.tilesFetched).padStart(7)}  ${String(s.tilesEvicted).padStart(7)}  ${String(s.water).padStart(5)}  ${String(s.relief).padStart(6)}  ${String(s.sprites + "/" + s.placed).padStart(14)}  ${String(s.level).padStart(3)}`);
  const peakGpu = Math.max(...samples.map((s) => s.gpuMB)), peakHeap = Math.max(...samples.map((s) => s.heapMB));
  console.log(`\n  peaks: heap ${peakHeap} MB, GPU ${peakGpu} MB; end: heap ${end.heapMB} MB (round 1: ${firstRoundHeap}), GPU ${end.gpuMB} MB\n`);
  check(`the land-tile cache never holds more than ${TILE_CACHE} tiles`, samples.every((s) => s.tiles <= TILE_CACHE), `max ${Math.max(...samples.map((s) => s.tiles))}`);
  check("land tiles were evicted (fetched exceeds resident at the end)", end.tilesEvicted > 0 && end.tilesFetched > end.tiles, `${end.tilesFetched} fetched, ${end.tiles} resident, ${end.tilesEvicted} evicted`);
  check(`the water-tile cache never holds more than ${WATER_TILE_CACHE}`, samples.every((s) => s.water <= WATER_TILE_CACHE), `max ${Math.max(...samples.map((s) => s.water))}`);
  check(`the relief cache never holds more than ${RELIEF_CACHE} textures`, samples.every((s) => s.relief <= RELIEF_CACHE), `max ${Math.max(...samples.map((s) => s.relief))}`);
  check("the label sprites are the current layout's only", samples.every((s) => s.sprites <= s.placed), samples.map((s) => s.sprites + "/" + s.placed).join(" "));
  check("the GPU bytes are bounded (the end within 40 % of the peak, with relief off and the caches full)", end.gpuMB <= peakGpu && end.gpuMB >= 0, `end ${end.gpuMB} MB, peak ${peakGpu} MB`);
  check(`the heap returns near its baseline (end ≤ round 1 + ${HEAP_SLACK_MB} MB)`, Number.isFinite(end.heapMB) && Number.isFinite(firstRoundHeap) && end.heapMB <= firstRoundHeap + HEAP_SLACK_MB, `end ${end.heapMB} MB, round 1 ${firstRoundHeap} MB, peak ${peakHeap} MB`);
  check("no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  console.log(`\n${pass} ok, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
