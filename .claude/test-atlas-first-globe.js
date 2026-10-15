/* test-atlas-first-globe.js — the cold load of #map: the globe before the prose, the land before the water, and the coarse globe from the cache on a return visit (Oct 2026; owner decisions 2a and 2b).

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-first-globe.js
     FOLIO_CHROMIUM=/path/to/chrome  … to pick the browser

   WHAT IT PROVES, each a fault that fails silently — a page that loads 11.6 MB of prose beside its own globe still draws, only later, and nothing throws:

     · THE IDLE PRE-LOADING WAITS FOR THE GLOBE. Booted on #map with topology.bin held back three seconds (so the first frame cannot come before the idle callback's 2.5 s timeout would have fired the warm), the glossary's
       citations, the artefacts and the card extras (glossary-extra.js, artefacts-extra.js, data-extra/art.js) are requested only AFTER the first painted frame, and they ARE then requested (the warm is delayed, not lost);
     · THE WATER WAITS FOR THE LAND: water.bin (4.3 MB) starts once topology.bin (3 MB) has arrived, not beside it;
     · A READER WHO LEAVES BEFORE THE GLOBE DRAWS still gets the warm: with topology.bin never answered, nothing is requested on the Atlas, and going to the home page releases the held warms;
     · THE EXISTING RULES STAND: with the browser's Save-Data hint on, nothing of the prose is requested even after the globe has drawn; and a page booted on any OTHER route (#home) warms at idle exactly as it always did,
       with no Atlas in sight;
     · THE COARSE GLOBE COMES FROM THE CACHE ON A RETURN VISIT: the first visit stores the coarse level (IndexedDB, keyed by CORE_CACHE_REV) and a second visit in the same browser paints it while topology.bin is still
       on its way (held four seconds), then goes on to be ready with every level, the names laid out, and a stored past year's history loaded (a request made before the worker existed is kept, not dropped). */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream", ".woff2": "font/woff2" };
const PORT = 5647;
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } };
const PROSE = /\/(glossary-extra|artefacts-extra)\.js$|\/data-extra\/art\.js$/;
const BASE = `http://127.0.0.1:${PORT}/`;

/* the page's own clock: the instant the controller noted its first painted frame (polled every 10 ms; the same clock as the resource timing entries) */
const WATCH = () => {
  window.__first = null;
  try { localStorage.setItem("folio_atlas_tour_v1", "1"); } catch (e) {}
  setInterval(() => {
    if (window.__first != null) return;
    const a = document.querySelector(".atlas2");
    if (a && a.__atlas2 && a.__atlas2.stats && a.__atlas2.stats.firstPaintMs > 0 && a.__atlas2.statsNow().frames > 0) window.__first = performance.now();
  }, 10);
};
const delay = (ms) => async (route) => { await sleep(ms); try { await route.continue(); } catch (e) { /* the page closed */ } };
const resources = (page) => page.evaluate(() => performance.getEntriesByType("resource").map((e) => ({ n: e.name.replace(location.origin + "/", ""), start: e.startTime, end: e.responseEnd })));
async function openPage(context, hash, opts) {
  opts = opts || {};
  const page = await context.newPage(), errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  if (opts.topology) await page.route("**/atlas/data/topology.bin", opts.topology);
  await page.goto(BASE + hash, { waitUntil: "load" });
  return { page, errors };
}

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch(LAUNCH);

  /* ---------- 1) a cold #map: the globe, then the prose; the land, then the water ---------- */
  console.log("\n\x1b[1m1) a cold #map — the prose waits for the globe, the water for the land\x1b[0m\n");
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    await ctx.addInitScript(WATCH);
    const { page, errors } = await openPage(ctx, "#map", { topology: delay(3000) });
    await page.waitForFunction(() => window.__first != null, null, { timeout: 120000 });
    const first = await page.evaluate(() => window.__first);
    await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 120000 });
    // the warm is delayed, not lost: the three files are requested once the globe is up
    await page.waitForFunction((re) => performance.getEntriesByType("resource").filter((e) => new RegExp(re).test(e.name)).length >= 3, PROSE.source, { timeout: 60000 }).catch(() => {});
    const rs = await resources(page);
    const prose = rs.filter((r) => PROSE.test("/" + r.n));
    check("the first globe is painted after topology.bin was held back (the premise: the idle callback's 2.5 s timeout has passed by then)", first > 3000, first.toFixed(0) + " ms");
    check("glossary-extra.js, artefacts-extra.js and data-extra/art.js are all requested", prose.length >= 3, prose.map((r) => r.n).join(", ") || "none");
    const early = prose.filter((r) => r.start < first - 30);
    check("…and every one of them is requested only AFTER the first painted frame", prose.length >= 3 && early.length === 0, early.length ? "before it: " + early.map((r) => r.n + " at " + r.start.toFixed(0) + " ms (globe at " + first.toFixed(0) + ")").join("; ") : "earliest " + Math.min(...prose.map((r) => r.start)).toFixed(0) + " ms, globe at " + first.toFixed(0) + " ms");
    const topo = rs.find((r) => /atlas\/data\/topology\.bin$/.test(r.n)), water = rs.find((r) => /atlas\/data\/water\.bin$/.test(r.n));
    check("water.bin is requested once topology.bin has arrived, not beside it", !!topo && !!water && water.start >= topo.end - 5, topo && water ? `topology ended ${topo.end.toFixed(0)} ms, water started ${water.start.toFixed(0)} ms` : "a file is missing from the entries");
    const watered = await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.waterSettled() && c.renderer.waterLevelLoaded(0); }, null, { timeout: 120000 }).then(() => true, () => false);
    check("the Atlas reached ready with its rivers and lakes in, and no page errors", watered && errors.length === 0, errors.slice(0, 2).join(" | ") || (watered ? "" : "the water never settled"));
    await ctx.close();
  }

  /* ---------- 2) leaving the Atlas before it draws releases the held warms ---------- */
  console.log("\n\x1b[1m2) a reader who leaves before the globe draws still gets the warm\x1b[0m\n");
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    await ctx.addInitScript(WATCH);
    // topology.bin is never answered: the globe cannot draw
    const { page } = await openPage(ctx, "#map", { topology: () => new Promise(() => {}) });
    await sleep(6500);   // past the idle callback's 2.5 s timeout, with room
    let rs = await resources(page);
    check("on the Atlas, with no globe yet, none of the prose has been requested after 6.5 s", rs.filter((r) => PROSE.test("/" + r.n)).length === 0, rs.filter((r) => PROSE.test("/" + r.n)).map((r) => r.n).join(", "));
    await page.evaluate(() => { location.hash = ""; });
    await page.waitForFunction((re) => performance.getEntriesByType("resource").filter((e) => new RegExp(re).test(e.name)).length >= 3, PROSE.source, { timeout: 30000 }).catch(() => {});
    rs = await resources(page);
    check("going to the home page releases them (all three are requested)", rs.filter((r) => PROSE.test("/" + r.n)).length >= 3, rs.filter((r) => PROSE.test("/" + r.n)).map((r) => r.n).join(", ") || "none");
    await ctx.close();
  }

  /* ---------- 3) the rules that were there stay ---------- */
  console.log("\n\x1b[1m3) Save-Data and other routes\x1b[0m\n");
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    await ctx.addInitScript(WATCH);
    await ctx.addInitScript(() => { try { Object.defineProperty(navigator, "connection", { value: { saveData: true, effectiveType: "4g" }, configurable: true }); } catch (e) {} });
    const { page } = await openPage(ctx, "#map");
    await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 120000 });
    await sleep(6000);
    const rs = await resources(page);
    check("with the Save-Data hint on, the globe draws and none of the prose is requested", rs.some((r) => /topology\.bin$/.test(r.n)) && rs.filter((r) => PROSE.test("/" + r.n)).length === 0, rs.filter((r) => PROSE.test("/" + r.n)).map((r) => r.n).join(", "));
    await ctx.close();
  }
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const { page, errors } = await openPage(ctx, "");
    await page.waitForFunction((re) => performance.getEntriesByType("resource").filter((e) => new RegExp(re).test(e.name)).length >= 3, PROSE.source, { timeout: 30000 }).catch(() => {});
    const rs = await resources(page);
    check("booted on the home page the warm runs at idle as it always did (no Atlas on screen, so nothing to wait for)", rs.filter((r) => PROSE.test("/" + r.n)).length >= 3, rs.filter((r) => PROSE.test("/" + r.n)).map((r) => r.n + " " + r.start.toFixed(0)).join(", ") || "none");
    check("no page errors on the home page", errors.length === 0, errors.slice(0, 2).join(" | "));
    await ctx.close();
  }

  /* ---------- 4) a return visit paints the coarse globe from the cache ---------- */
  console.log("\n\x1b[1m4) a return visit paints the coarse globe before the file arrives\x1b[0m\n");
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    await ctx.addInitScript(WATCH);
    const v1 = await openPage(ctx, "#map");
    await v1.page.waitForSelector(".atlas2[data-ready='1']", { timeout: 120000 });
    const stored = await v1.page.waitForFunction(() => new Promise((res) => { const r = indexedDB.open("folio-atlas2", 1); r.onsuccess = () => { try { const q = r.result.transaction("core").objectStore("core").get("core0"); q.onsuccess = () => { r.result.close(); res(!!(q.result && q.result.lod0)); }; q.onerror = () => res(false); } catch (e) { res(false); } }; r.onerror = () => res(false); }), null, { timeout: 30000, polling: 500 }).then(() => true, () => false);
    check("the first visit stores the coarse level (IndexedDB core0 with a lod0)", stored);
    const v1stats = await v1.page.evaluate(() => ({ fromCache: !!document.querySelector(".atlas2").__atlas2.stats.fromCache }));
    check("…and drew from the worker, not a cache", v1stats.fromCache === false, JSON.stringify(v1stats));
    await v1.page.close();
    // a stored past year: its history request is made before the worker exists on the cached path, and must not be dropped
    await ctx.addInitScript(() => { try { if (!sessionStorage.getItem("__y")) { sessionStorage.setItem("__y", "1"); localStorage.setItem("folio_atlas2_year", "1500"); } } catch (e) {} });
    const v2 = await openPage(ctx, "#map", { topology: delay(4000) });
    const t = await v2.page.waitForFunction(() => { const a = document.querySelector(".atlas2"); return a && a.__atlas2 && a.__atlas2.stats.firstPaintMs > 0 && a.__atlas2.statsNow().frames > 0 ? performance.now() : 0; }, null, { timeout: 60000, polling: 20 }).then((h) => h.jsonValue(), () => 0);
    const mid = await v2.page.evaluate(() => ({ fromCache: !!document.querySelector(".atlas2").__atlas2.stats.fromCache, ready: document.querySelector(".atlas2").getAttribute("data-ready") }));
    check("the second visit paints the coarse globe from the cache while topology.bin is still held back", t > 0 && t < 3800 && mid.fromCache && mid.ready !== "1", `first globe at ${t.toFixed(0)} ms (the file was held 4000 ms), fromCache ${mid.fromCache}, ready ${mid.ready}`);
    await v2.page.waitForSelector(".atlas2[data-ready='1']", { timeout: 120000 });
    const end = await v2.page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.labelsReady() && c.historyStarted() && c.historyReady() ? { levels: Object.keys(c.stats.uploads).length, year: c.timeInfo().year } : false; }, null, { timeout: 120000 }).then((h) => h.jsonValue(), () => false);
    check("…then reaches ready with every level (0, 1, 2 uploaded), the names laid out and the stored year's history loaded", !!end && end.levels >= 3 && end.year === 1500, JSON.stringify(end));
    check("no page errors on the return visit", v2.errors.length === 0, v2.errors.slice(0, 2).join(" | "));
    await ctx.close();
  }

  await browser.close(); server.close();
  console.log(`\n${pass} ok, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
