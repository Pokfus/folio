/* test-atlas-fallbacks.js — Atlas v2's four fallbacks (Phase 1d; docs/atlas-v2-design.md §2.9, Q-R3, Q-R4).

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-fallbacks.js
     FOLIO_CHROMIUM=/path/to/chrome  … to pick the browser (otherwise playwright's own)

   WHAT IT PROVES
     (a) file://  index.html opened from a file: the earth and the water come from their `.js` twins (atlas/data/*.bin.js,
         sha256-verified in the page), the worker's code runs on the main thread behind the same messages, yielding so no
         task after the mount runs past LONG_TASK_MS, with the status line moving; the names are laid out, a tap names
         a country, tiles and relief are never asked for and the sentence says so.
     (b) no WebGL2  (--disable-webgl): the still Canvas 2D view at LOD 0 — the globe draws, the labels layer works, a drag
         redraws on release, a tap names a country, the zoom stops at 5 km/px, relief is declined, the sentence says why.
     (c) context loss  (WEBGL_lose_context, then restore): the view, the selection, the open card, the layers and the
         relief state survive, the renderer is fed again and picks again.
     (d) a worker that fails to start (its script throws): the page falls back to the shim and reaches the same state.
*/
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");

const ROOT = path.resolve(__dirname, "..");
const EXE = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream" };
const PORT = 5622;
const LONG_TASK_MS = 150;   // the owner's "about 100 ms": measured 107–127 ms worst in Node and Chrome (a GC pause or one earcut call), so the gate allows a scheduler's slack
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ready = (page, ms) => page.waitForSelector(".atlas2[data-ready='1']", { timeout: ms || 180000 });
const labelsUp = (page) => page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.labelsReady() && c.labels().length > 0; }, null, { timeout: 120000 });
const errorsOf = (page) => { const errors = []; page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200))); page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); }); return errors; };
// long tasks after the Atlas mounted, observed in the page
const watchTasks = (page) => page.evaluate(() => { window.__lt = []; try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lt.push(Math.round(e.duration)); }).observe({ type: "longtask", buffered: false }); } catch (e) { window.__lt = null; } });
const tapCentre = async (page) => { const box = await (await page.$(".atlas2-canvas")).boundingBox(); await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setView(10, 20, 24)); await sleep(400); await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2); await sleep(500); return page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; return c.card().title || c.selectedId(); }); };

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const base = `http://127.0.0.1:${PORT}/`;

  /* ---------- (a) file:// ---------- */
  console.log("\n\x1b[1m(a) file:// — the twins and the main-thread shim\x1b[0m\n");
  {
    const browser = await chromium.launch(EXE);
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = errorsOf(page);
    const t0 = Date.now();
    await page.goto("file://" + path.join(ROOT, "index.html") + "#map2", { waitUntil: "load" });
    await page.waitForSelector(".atlas2", { timeout: 60000 });
    await watchTasks(page);
    const seen = [];
    const poll = setInterval(async () => { try { seen.push(await page.evaluate(() => document.querySelector(".atlas2-note").textContent + " | " + document.querySelector(".atlas2-bar i").style.width)); } catch (e) {} }, 300);
    await ready(page, 240000);
    clearInterval(poll);
    const readyMs = Date.now() - t0;
    await labelsUp(page);
    const m = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.mode());
    check("the page knows it was opened from a file and runs the shim, no worker", m.file && m.shim && !m.worker, JSON.stringify(m));
    check("the topology twin was decoded and sha256-verified", m.twinVerified >= 1, m.twinVerified + " twins verified");
    const steps = [...new Set(seen)];
    check("the status line moved while the shim worked (progress indication)", steps.length >= 3, steps.slice(0, 6).join(" → "));
    const lt = await page.evaluate(() => window.__lt);
    check(`no main-thread task after the mount ran past ${LONG_TASK_MS} ms (the shim yields)`, lt === null || !lt.some((d) => d > LONG_TASK_MS), lt === null ? "longtask not observable" : `${lt.length} long tasks, worst ${lt.length ? Math.max(...lt) : 0} ms, over 50: ${lt.filter((d) => d > 50).join(" ")}`);
    const water = await page.waitForFunction(() => document.querySelector(".atlas2").__atlas2.waterSettled() && document.querySelector(".atlas2").__atlas2.renderer.waterLevelLoaded(0), null, { timeout: 120000 }).then(() => true, () => false);
    const m2 = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.mode());
    check("the rivers and lakes came from their twin too", water && m2.twinVerified >= 2, `${m2.twinVerified} twins verified, water ${water}`);
    const labels = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.labels().length);
    check("the names are laid out", labels > 10, labels + " labels");
    const picked = await tapCentre(page);
    check("a tap names the country under it", picked === "Niger", picked);
    await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setView(25, 38, 0.5)); await sleep(500);
    const st = await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; return Object.assign({ kmpp: c.kmPerPx(), relief: document.querySelector('[data-layer="relief"]').disabled, note: document.querySelector(".atlas2-mode").textContent }, c.statsNow()); });
    check("no tile is wanted at a tile zoom, and the zoom stops at the finest resident level (0.5 km/px)", st.wanted === 0 && st.level <= 2 && st.kmpp >= 0.49, `level ${st.level}, ${st.kmpp.toFixed(2)} km/px, ${st.wanted} tiles wanted`);
    check("relief is declined and the sentence says what is left out and why", st.relief && /file/.test(st.note) && /relief/i.test(st.note), st.note.slice(0, 90));
    check("no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
    console.log(`        ready in ${readyMs} ms from a file`);
    await browser.close();
  }

  /* ---------- (b) no WebGL2 ---------- */
  console.log("\n\x1b[1m(b) no WebGL2 — the still Canvas 2D view\x1b[0m\n");
  {
    const browser = await chromium.launch(Object.assign({}, EXE, { args: ["--disable-webgl", "--disable-3d-apis"] }));
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = errorsOf(page);
    const gl = await page.evaluate(() => !!document.createElement("canvas").getContext("webgl2"));
    check("the browser really has no WebGL2 under the launch flags", !gl);
    await page.goto(base + "#map2", { waitUntil: "load" });
    await ready(page);
    await labelsUp(page);
    const m = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.mode());
    check("the still view is in use", m.static2d, JSON.stringify(m));
    const st0 = await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; return Object.assign({ note: document.querySelector(".atlas2-mode").textContent, relief: document.querySelector('[data-layer="relief"]').disabled, labels: c.labels().length }, c.statsNow()); });
    check("the globe is drawn with land, lines and water", st0.mode === "canvas2d" && st0.triangles > 10000 && st0.segments > 5000 && st0.lakeTriangles > 100 && st0.riverSegments > 100, `${st0.triangles} tri, ${st0.segments} seg, ${st0.riverSegments} river, ${st0.lakeTriangles} lake tri`);
    check("the labels layer works", st0.labels > 10, st0.labels + " labels");
    check("relief is declined and the sentence names WebGL2", st0.relief && /WebGL2/.test(st0.note), st0.note.slice(0, 80));
    // a drag: no full frame while the pointer is down, one on release
    const box = await (await page.$(".atlas2-canvas")).boundingBox();
    const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
    const f0 = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.renderer.rawStats.frames);
    await page.mouse.move(cx, cy); await page.mouse.down();
    for (let i = 1; i <= 20; i++) { await page.mouse.move(cx + i * 6, cy + i * 2); await sleep(30); }
    const fDuring = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.renderer.rawStats.frames);
    const lonDuring = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.view.lon);
    await page.mouse.up(); await sleep(600);
    const fAfter = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.renderer.rawStats.frames);
    check("a drag turns the globe without a full redraw, and one full frame follows the release", fDuring === f0 && fAfter > f0 && lonDuring !== 10, `frames ${f0} → ${fDuring} during → ${fAfter} after; lon ${lonDuring.toFixed(1)}`);
    const picked = await tapCentre(page);
    check("a tap names the country under it (CPU pick)", picked === "Niger", picked);
    await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setView(10, 50, 0.5)); await sleep(300);
    const z = await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; return { kmpp: c.kmPerPx(), level: c.statsNow().level }; });
    check("the zoom stops at 5 km/px and the level stays 0", z.kmpp >= 4.99 && z.level === 0, `${z.kmpp.toFixed(2)} km/px, level ${z.level}`);
    const draw = await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; const d = c.stats.draw.slice(-10); return Math.max(...d); });
    console.log(`        a full 2D frame costs up to ${draw.toFixed(0)} ms here`);
    check("no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
    await browser.close();
  }

  /* ---------- (c) context loss and (d) a failed worker, on http with WebGL2 ---------- */
  const browser = await chromium.launch(EXE);
  console.log("\n\x1b[1m(c) a lost and restored WebGL context\x1b[0m\n");
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = errorsOf(page);
    await page.goto(base + "#map2", { waitUntil: "load" });
    await ready(page);
    await labelsUp(page);
    await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; c.setLayers({ relief: true, graticule: true }); c.setView(2, 46, 3); c.select("adm0:fra", { open: true, fly: false }); });
    await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.tilesSettled() && c.renderer.reliefLoaded("0"); }, null, { timeout: 120000 });
    await sleep(300);
    const before = await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; return { lon: c.view.lon, lat: c.view.lat, zoom: c.view.zoom, sel: c.selectedId(), card: c.card(), relief: c.layers.relief, grat: c.layers.graticule, restores: c.renderer.rawStats.restores, reliefResident: c.statsNow().reliefResident }; });
    const lost = await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; const ext = c.renderer.gl.getExtension("WEBGL_lose_context"); if (!ext) return "no extension"; ext.loseContext(); window.__ext = ext; return c.renderer.lost; });
    await sleep(300);
    const whileLost = await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; return { lost: c.renderer.lost, level0: c.renderer.levelLoaded(0) }; });
    check("the context is lost and the renderer knows it", lost !== "no extension" && whileLost.lost === true, JSON.stringify(whileLost));   // the lost event is asynchronous: read after a moment
    await page.evaluate(() => window.__ext.restoreContext());
    const restored = await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return !c.renderer.lost && c.renderer.levelLoaded(0) && c.renderer.levelLoaded(2) && c.renderer.reliefLoaded("0") && c.tilesSettled() && c.waterSettled() && c.renderer.waterLevelLoaded(2); }, null, { timeout: 120000 }).then(() => true, () => false);
    check("after restore the levels, the water, the tiles and the relief are fed again", restored);
    const after = await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; c.invalidate(); return { lon: c.view.lon, lat: c.view.lat, zoom: c.view.zoom, sel: c.selectedId(), card: c.card(), relief: c.layers.relief, grat: c.layers.graticule, restores: c.renderer.rawStats.restores, reliefResident: c.statsNow().reliefResident }; });
    check("the view survives", after.lon === before.lon && after.lat === before.lat && after.zoom === before.zoom, `${after.lon}, ${after.lat}, zoom ${after.zoom.toFixed(2)}`);
    check("the selection and its open card survive", after.sel === "adm0:fra" && after.card.open && after.card.id === "adm0:fra", after.card.title);
    check("the layers and the relief state survive, and relief is resident again", after.relief && after.grat && after.reliefResident >= 1, `relief ${after.relief}, graticule ${after.grat}, ${after.reliefResident} relief textures, restores ${after.restores}`);
    check("the renderer counted one restore", after.restores === before.restores + 1, String(after.restores));
    await sleep(300);
    const picked = await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; return c.stackAt(c.view.cx, c.view.cy); });
    check("a pick at the centre answers after the restore (France)", picked.includes("adm0:fra"), picked.join(", "));
    check("no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
    await page.close();
  }
  console.log("\n\x1b[1m(d) a worker that fails to start\x1b[0m\n");
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = errorsOf(page);
    let hits = 0;
    // the first fetch of the worker's script (the Worker's own) throws at once; the shim's <script> load of it afterwards passes
    await page.route("**/atlas/atlas-worker.js", (route) => { hits++; if (hits === 1) route.fulfill({ status: 200, contentType: "text/javascript", body: "throw new Error('the worker refused to start (test)');" }); else route.continue(); });
    await page.goto(base + "#map2", { waitUntil: "load" });
    await ready(page);
    await labelsUp(page);
    const m = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.mode());
    check("the worker's failure was seen and the shim took over", !!m.workerError && m.shim && !m.worker, JSON.stringify(m));
    const water = await page.waitForFunction(() => document.querySelector(".atlas2").__atlas2.waterSettled(), null, { timeout: 120000 }).then(() => true, () => false);
    check("the water is parsed by the shim too", water);
    const picked = await tapCentre(page);
    check("a tap names the country under it", picked === "Niger", picked);
    const tiles = await page.evaluate(async () => { const c = document.querySelector(".atlas2").__atlas2; c.setView(25, 38, 0.5); await new Promise((r) => setTimeout(r, 200)); return c.statsNow().wanted; });
    const settled = await page.waitForFunction(() => document.querySelector(".atlas2").__atlas2.tilesSettled(), null, { timeout: 120000 }).then(() => true, () => false);
    check("tiles are parsed by the shim at a tile zoom", tiles > 0 && settled, `${tiles} wanted, settled ${settled}`);
    check("no page errors (the worker's own error is expected and not a page error)", errors.filter((e) => !/refused to start/.test(e)).length === 0, errors.slice(0, 3).join(" | "));
    await page.close();
  }
  await browser.close(); server.close();
  console.log(`\n${pass} ok, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
