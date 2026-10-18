/* test-land-changes.js — the dated land-change layer: the Zuiderzee polders are water before they fell dry and land after
   (the owner's phone, 2026-10-18: "Flevoland is displayed only as a thin outline with no fill"; docs/atlas-v2-historical-coastlines.md §1).

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-land-changes.js [--report]
     FOLIO_CHROMIUM=/path/to/chrome  … to pick the browser (otherwise playwright's own)

   WHAT IT PROVES, on a 390 × 844 phone profile, WebGL2 and then the Canvas 2D fallback (`--disable-webgl`):
     · atlas/data/land-changes.js loads and every row's mesh arrives (statsNow().landChanges.ready = rows);
     · at THREE YEARS the pixel at the middle of each polder is what the sources say — 1900: the Wieringermeer, the Noordoostpolder
       and both Flevoland polders are water; 1950: the Wieringermeer (dry 1930) and the Noordoostpolder (1942) are land, the two
       Flevoland polders (1957, 1968) still water; 2026 (today): all four are land — read from the renderer's own buffer in the same
       task as the draw, against a lake pixel (the middle of the IJsselmeer) and a land pixel (Friesland) of the same frame;
     · the FAULT it was written for is gone: at today's year the Flevopolder's middle is the LAND colour, not the lake's — until this
       fix build-water.js left every lake island wound like an outer ring, so the worker filled all 16,699 of them as lake and the
       Flevopolder (HydroLAKES 117's hole) drew as IJsselmeer water with a shore round it; Manitoulin Island in Lake Huron is the
       same fault's largest case and is asserted too;
     · the alive set follows the year (landChangesAlive()), and a reader's lakes switch does not remove a patch.
   The still view's zoom cap is coarse (LOD 0, 5 km/px); the probes are the polders' middles, at least 4 px from any shore there.
   --report prints every probe's pixel. */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const REPORT = process.argv.includes("--report");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream" };
const PORT = 5672;
const PROBES = {   // lon, lat — the middle of each polder, a lake, an old land, and the largest lake island
  wieringermeer: [5.02, 52.84], noordoostpolder: [5.78, 52.72], oostelijk: [5.62, 52.52], zuidelijk: [5.36, 52.36],
  ijsselmeer: [5.35, 52.75], friesland: [5.85, 53.10], manitoulin: [-82.106, 45.675],
};
const YEARS = { 1900: { wieringermeer: "water", noordoostpolder: "water", oostelijk: "water", zuidelijk: "water" }, 1950: { wieringermeer: "land", noordoostpolder: "land", oostelijk: "water", zuidelijk: "water" }, today: { wieringermeer: "land", noordoostpolder: "land", oostelijk: "land", zuidelijk: "land" } };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  — " + extra : "")); } };
const same = (a, b, tol) => a && b && Math.abs(a[0] - b[0]) <= tol && Math.abs(a[1] - b[1]) <= tol && Math.abs(a[2] - b[2]) <= tol;

// the pixel at the view's centre, read from the renderer's own buffer right after a draw (WebGL2: readPixels; the still view: getImageData)
const centrePixel = (page) => page.evaluate(() => new Promise((resolve) => {
  const c = document.querySelector(".atlas2").__atlas2;
  requestAnimationFrame(() => {
    c.invalidate();
    requestAnimationFrame(() => {
      const v = c.view; const x = v.cx, y = v.cy;
      if (c.renderer.gl) { resolve(c.pixelAt(x, y)); return; }
      const cv = document.querySelector(".atlas2-canvas"); const d = Math.min(2, window.devicePixelRatio || 1);
      c.renderer.render(v);
      const px = cv.getContext("2d").getImageData(Math.round(x * d), Math.round(y * d), 1, 1).data; resolve([px[0], px[1], px[2], px[3]]);
    });
  });
}));
// the land, the water and the layer (not the history: the still view draws none, and a past year's borders are not what is probed)
const settled = (page) => page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.tilesSettled() && c.waterSettled() && c.landChangesSettled(); }, null, { timeout: 60000 }).catch(() => {});

async function probe(page, name, year, kmpp) {
  const [lon, lat] = PROBES[name];
  await page.evaluate(({ lon, lat, kmpp, year }) => { const c = document.querySelector(".atlas2").__atlas2; if (c.year() !== year) c.setYear(year); c.setView(lon, lat, kmpp); }, { lon, lat, kmpp, year });
  await settled(page); await page.waitForTimeout(150);
  return centrePixel(page);
}

async function run(browser, mode) {
  console.log(`\n${mode}:`);
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await ctx.addInitScript(`localStorage.setItem("folio_tour_v1","1");localStorage.setItem("folio_atlas_tour_v1","1");`);
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  await page.goto(`http://127.0.0.1:${PORT}/#map`, { waitUntil: "load" });
  await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 120000 });
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setLayers({ rivers: true, lakes: true, relief: false, borders: true }));
  const s0 = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.statsNow());
  check(`${mode}: the renderer is ${mode}`, s0.mode === (mode === "WebGL2" ? "webgl2" : "canvas2d"), s0.mode);
  const kmpp = mode === "WebGL2" ? 0.5 : 5;   // the still view is capped at LOD 0
  const today = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.year());
  // the layer loads
  await page.evaluate(({ lon, lat, kmpp }) => document.querySelector(".atlas2").__atlas2.setView(lon, lat, kmpp), { lon: 5.5, lat: 52.6, kmpp });
  await settled(page);
  const lc = (await page.evaluate(() => document.querySelector(".atlas2").__atlas2.statsNow())).landChanges;
  check(`${mode}: land-changes.js loaded and every row's mesh arrived`, lc && lc.started && !lc.failed && lc.rows >= 5 && lc.ready === lc.rows, JSON.stringify({ rows: lc && lc.rows, ready: lc && lc.ready, failed: lc && lc.failed }));
  for (const key of Object.keys(YEARS)) {
    const year = key === "today" ? today : Number(key);
    const lake = await probe(page, "ijsselmeer", year, kmpp), land = await probe(page, "friesland", year, kmpp);
    check(`${mode} ${year}: the reference pixels differ (lake ${lake} / land ${land})`, lake && land && !same(lake, land, 8));
    const alive = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.landChangesAlive());
    const want = Object.entries(YEARS[key]).filter(([, v]) => v === "water").length;
    check(`${mode} ${year}: ${want} polder row(s) alive`, alive.filter((id) => /wieringermeer|noordoostpolder|flevoland/.test(id)).length === want, alive.join(", ") || "none");
    for (const [name, state] of Object.entries(YEARS[key])) {
      const px = await probe(page, name, year, kmpp);
      const isWater = same(px, lake, 8), isLand = same(px, land, 8);
      check(`${mode} ${year}: ${name} is ${state}`, state === "water" ? isWater && !isLand : isLand && !isWater, `${px} (lake ${lake}, land ${land})`);
      if (REPORT) console.log(`      ${name} ${year}: ${px}`);
    }
  }
  // the island fault (the hole winding): Manitoulin is land today
  { const lake = await probe(page, "ijsselmeer", today, kmpp), land = await probe(page, "friesland", today, kmpp), px = await probe(page, "manitoulin", today, kmpp); check(`${mode}: Manitoulin Island (Lake Huron's largest island) is land, not lake`, same(px, land, 8) && !same(px, lake, 8), `${px}`); }
  // the lakes switch does not take a patch away
  { await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setLayers({ lakes: false })); const lake = await probe(page, "ijsselmeer", 1900, kmpp); const px = await probe(page, "oostelijk", 1900, kmpp); const land = await probe(page, "friesland", 1900, kmpp); check(`${mode}: with the lakes layer off the 1900 polder is still water`, same(px, lake, 8) || !same(px, land, 8), `${px} (lake ${lake}, land ${land})`); await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setLayers({ lakes: true })); }
  check(`${mode}: no page errors`, errors.length === 0, errors.slice(0, 3).join(" | "));
  await ctx.close();
}

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const b1 = await chromium.launch(LAUNCH); await run(b1, "WebGL2"); await b1.close();
  const b2 = await chromium.launch(Object.assign({}, LAUNCH, { args: ["--disable-webgl", "--disable-webgl2"] })); await run(b2, "Canvas 2D"); await b2.close();
  server.close();
  console.log(`\n${pass} ok, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
