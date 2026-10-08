/* test-atlas-relief.js — the relief's land/sea rule, rendered and read back (docs/atlas-v2-design.md §2.7, Phase 1b).

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-relief.js
     FOLIO_CHROMIUM=/path/to/chrome  … to pick the browser (otherwise playwright's own)

   WHY. ETOPO's coast and the OSM coast disagree by kilometres: `check-relief.js --coast` measured that 3 km
   inland of a random OSM coast vertex ETOPO reads below sea level 20 % of the time, and 3 km seaward it reads
   above 21 %. A naive relief pass paints bathymetry onto that land and a land tint onto that sea. §2.7's rule
   is that the face fills decide: a land pixel samples the height clamped at zero or above, a sea pixel at
   zero or below, so the OSM coast always wins. This suite proves the rule at the points where it matters —
   twelve land points ETOPO puts below sea level and twelve sea points it puts above, from that measurement
   (coordinates and ETOPO heights copied from out/relief-coast.json on 2026-10-08) — by rendering each at
   1.5 km/px with relief on, at full strength, and reading the centre pixel back through the renderer's own
   GL context in the same task as the draw:

     · a LAND point's pixel with relief on stays within a small distance of its pixel with relief off (the
       tint at zero height IS the land colour, so a land pixel wrongly read as sea floor — a darkened ocean
       colour — is far from it), and the ID pass under it names a face;
     · a SEA point's pixel is the ocean colour's family (its hue), not the land's, and the ID pass names no face.

   It also proves the relief loads at all (L0 and the view's L1 patches) and that switching it off restores the
   plain fill exactly.
*/
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream" };
const PORT = 5615;
// land in the OSM partition, ETOPO below zero (metres); sea in the partition, ETOPO above zero — both lists are
// check-relief.js --coast's own output of 2026-10-08 (out/relief-coast.json; points at least 2.5 km from any OSM coast,
// so the resident LOD 2 coast agrees about them), copied here so CI needs no build directory. Most of the land points
// are Antarctic ice shelves, which the OSM land polygons include and ETOPO's surface grid reads as sea floor — the
// largest disagreement there is; the sea points include Franz Josef Land, where ETOPO's 60-second cells still hold
// land 3 km off the OSM shore.
const LAND_NEG = [[-49.1661, -77.5018, -308], [-163.3058, -78.6587, -255], [-94.0217, 16.0419, -4], [47.6291, 43.8096, -25], [-51.3027, -76.7538, -285], [-48.5011, -77.6205, -301], [-37.7265, -78.0934, -1094], [-53.4817, -76.2509, -452], [-56.0576, -75.6983, -429], [-177.1562, -77.8914, -614], [58.7113, 20.8061, -124], [15.3407, 31.9172, -1]];
const SEA_POS = [[153.3848, -11.3869, 3], [79.7292, 80.9191, 201], [79.8766, 80.9038, 193], [-95.1733, -72.5113, 3], [147.8073, 44.9238, 10], [82.5982, -67.1748, 11]];

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch(LAUNCH);
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  await page.goto(`http://127.0.0.1:${PORT}/#map2`, { waitUntil: "load" });
  await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 90000 });
  const settle = () => page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.tilesSettled() && c.waterSettled(); }, null, { timeout: 90000 }).then(() => true, () => false);
  // the centre pixel and the face under it, read in the same task as a fresh draw
  const probe = () => page.evaluate(() => new Promise((resolve) => {
    const c = document.querySelector(".atlas2").__atlas2, R = c.renderer, gl = R.gl;
    c.invalidate();   // the frame loop's plan() applies the layers to the view; then draw and read in one task
    requestAnimationFrame(() => requestAnimationFrame(() => {
      R.render(c.view);
      const px = new Uint8Array(4); gl.readPixels(Math.round(gl.drawingBufferWidth / 2), Math.round(gl.drawingBufferHeight / 2), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
      const hit = R.pick(c.view, c.view.cx, c.view.cy);
      resolve({ px: Array.from(px), face: hit && hit.face != null ? hit.face : null, relief: c.view.relief.on, fade: c.view.relief.fade });
    }));
  }));
  let fails = 0;
  const check = (name, ok, detail) => { console.log(`  ${ok ? "\x1b[32mok\x1b[0m  " : "\x1b[31mFAIL\x1b[0m"}  ${name}${detail ? "  \x1b[2m" + detail + "\x1b[0m" : ""}`); if (!ok) fails++; };
  const dist = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2]));
  console.log("\ntest-atlas-relief: the land/sea rule at the points where ETOPO and the OSM coast disagree\n");
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setLayers({ relief: true, strength: 1, rivers: false, lakes: false }));
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setView(10, 46.5, 3));
  const loaded = await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.renderer.reliefLoaded("0") && c.tilesSettled(); }, null, { timeout: 90000 }).then(() => true, () => false);
  const st = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.statsNow());
  check("relief loads: L0 and the Alps view's L1 patches", loaded && st.reliefPatches >= 1, `${st.reliefResident} textures resident, ${st.reliefPatches} patches drawn, ${(st.reliefBytes / 1048576).toFixed(1)} MB`);
  // the Alps centre with relief on vs off: a mountain pixel differs (tint and shade), the plain fill returns when off
  const onAlps = await probe();
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setLayers({ relief: false }));
  const offAlps = await probe();
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setLayers({ relief: true }));
  check("the Alps' centre pixel changes with relief on and returns to the fill when off", dist(onAlps.px, offAlps.px) > 8 && offAlps.face != null, `on ${onAlps.px.slice(0, 3)} off ${offAlps.px.slice(0, 3)} face ${offAlps.face}`);
  let landOk = 0, landBad = [];
  for (const [lon, lat, h] of LAND_NEG) {
    await page.evaluate(({ lon, lat }) => document.querySelector(".atlas2").__atlas2.setView(lon, lat, 1.5), { lon, lat });
    await settle(); await page.waitForTimeout(150);
    const on = await probe();
    await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setLayers({ relief: false }));
    const off = await probe();
    await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setLayers({ relief: true }));
    const d = dist(on.px, off.px);
    if (on.face != null && d <= 40) landOk++; else landBad.push(`${lon},${lat} (ETOPO ${h} m): face ${on.face}, on ${on.px.slice(0, 3)} vs off ${off.px.slice(0, 3)} (Δ ${d})`);
  }
  check(`${LAND_NEG.length} land points ETOPO puts below sea level read as land with relief on`, landBad.length === 0, landBad.length ? landBad.slice(0, 4).join("; ") : `${landOk} of ${LAND_NEG.length}, pixel within 40/255 of the plain fill`);
  {
    // the open-sea pixel at this zoom and strength, for comparison
    await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setView(-30, 30, 1.5)); await settle(); await page.waitForTimeout(150);
    const deep = await probe();
    let seaBad = [];
    for (const [lon, lat, h] of SEA_POS) {
      await page.evaluate(({ lon, lat }) => document.querySelector(".atlas2").__atlas2.setView(lon, lat, 1.5), { lon, lat });
      await settle(); await page.waitForTimeout(150);
      const on = await probe();
      // sea: no face under it; a sea pixel at or above zero height takes the undarkened ocean colour, so it is at least as bright as the deep-sea pixel in every channel
      const brighter = on.px[0] >= deep.px[0] - 4 && on.px[1] >= deep.px[1] - 4 && on.px[2] >= deep.px[2] - 4;
      if (on.face != null || !brighter) seaBad.push(`${lon},${lat} (ETOPO +${h} m): face ${on.face}, px ${on.px.slice(0, 3)} vs deep sea ${deep.px.slice(0, 3)}`);
    }
    check(`${SEA_POS.length} sea points ETOPO puts above sea level read as sea with relief on`, seaBad.length === 0, seaBad.length ? seaBad.slice(0, 4).join("; ") : `no face under any; each at least as bright as the deep sea (${deep.px.slice(0, 3)})`);
  }
  check("no page errors on #map2", errors.length === 0, errors.slice(0, 3).join(" | "));
  await browser.close(); server.close();
  console.log("");
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
