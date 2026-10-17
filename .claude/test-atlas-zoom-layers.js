/* test-atlas-zoom-layers.js — rivers and relief are drawn at EVERY zoom the Atlas allows, down to its cap (the owner's
   feedback of 2026-10-17, decision a: "when zoomed in all the way, rivers turn invisible; the same goes for the relief map").

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-zoom-layers.js [--report]
     FOLIO_CHROMIUM=/path/to/chrome  … to pick the browser (otherwise playwright's own)

   WHAT IT PROVES. For a phone (390 × 844, touch) and a desktop (1280 × 800) profile, at the Tiber by Rome, the Nile at Cairo and
   the Rhine at Koblenz, at every zoom from 3 km/px down to the cap (`kmPerPx()` after a setView past it — the controller clamps),
   with rivers, lakes and relief on and every tile, water level and relief patch settled:
     · the RIVER layer draws pixels: the frame with rivers on differs from the frame with rivers off (the renderer's own
       context, read back in the same task as the draw, as test-atlas-relief.js reads it);
     · the RELIEF layer draws pixels: the frame with relief on differs from the frame with relief off;
   and the same for the Canvas 2D fallback (`--disable-webgl`), whose zoom cap is coarser (the still view stays at LOD 0, 5 km/px)
   and which draws rivers but no relief (atlas-canvas.js declines it): there only the rivers are asserted.
   THE CAUSE IT WAS WRITTEN FOR: `RIVER_MIN_KM_PER_PX` (0.35) switched the rivers off below it, and `RELIEF_FADE` ([2.5, 1.0])
   faded the relief to nothing below 1 km/px, while the zoom cap is 0.15 km/px — so the last two zoom steps drew neither.
   --report prints the table (profile × place × zoom: river pixels, relief pixels, the renderer's own counts) and still asserts. */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const REPORT = process.argv.includes("--report");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream" };
const PORT = 5651;
const PLACES = [["the Tiber at Rome", 12.47, 41.90], ["the Nile at Cairo", 31.23, 30.05], ["the Rhine at Koblenz", 7.60, 50.36]];
const ZOOMS = [3, 2, 1.5, 1, 0.7, 0.5, 0.35, 0.3, 0.2, 0.01];   // km/px asked for; the last is past the cap and reads back as the cap
const PROFILES = [
  { name: "desktop 1280×800", ctx: { viewport: { width: 1280, height: 800 } } },
  { name: "phone 390×844", ctx: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
];
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  — " + extra : "")); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function open(browser, profile) {
  const ctx = await browser.newContext(profile.ctx);
  await ctx.addInitScript(`localStorage.setItem("folio_tour_v1","1");localStorage.setItem("folio_atlas_tour_v1","1");`);
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  await page.goto(`http://127.0.0.1:${PORT}/#map`, { waitUntil: "load" });
  await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 120000 });
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setLayers({ rivers: true, lakes: true, relief: true, strength: 1, borders: true }));
  return { ctx, page, errors };
}
// every tile, water level and relief patch the view wants is resident
const settled = (page) => page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2, s = c.statsNow(); return c.tilesSettled() && c.waterSettled() && s.reliefPending === 0 && s.waterPending === 0 && (s.mode === "canvas2d" || !s.reliefOn || s.reliefWanted === 0 || c.renderer.reliefLoaded("0")); }, null, { timeout: 120000 }).then(() => true, () => false);
/* the frame with a layer on against the frame with it off, read from the renderer's own context in the same task as each draw:
   the count of pixels that differ (WebGL2 through readPixels; the still view through getImageData on its canvas) */
const diff = (page, layer) => page.evaluate((layer) => new Promise((resolve) => {
  const c = document.querySelector(".atlas2").__atlas2, R = c.renderer, cv = document.querySelector(".atlas2-canvas");
  const read = () => {
    if (R.gl) { const w = R.gl.drawingBufferWidth, h = R.gl.drawingBufferHeight, px = new Uint8Array(w * h * 4); R.gl.readPixels(0, 0, w, h, R.gl.RGBA, R.gl.UNSIGNED_BYTE, px); return px; }
    const x = cv.getContext("2d"); return x.getImageData(0, 0, cv.width, cv.height).data;
  };
  const frame = (on, cb) => { c.setLayers({ [layer]: on }); c.invalidate(); requestAnimationFrame(() => requestAnimationFrame(() => { R.render(c.view); cb(read()); })); };
  frame(true, (a) => frame(false, (b) => { let n = 0; for (let i = 0; i < a.length; i += 4) if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2]) n++; c.setLayers({ [layer]: true }); resolve(n); }));
}), layer);
const state = (page) => page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2, s = c.statsNow(), r = c.renderer.stats(); return { k: c.kmPerPx(), level: c.view.level, mode: s.mode, riversOn: s.riversOn, reliefOn: s.reliefOn, fade: c.view.relief.fade, riverSegments: r.riverSegments, reliefPatches: r.reliefPatches, reliefL0: r.reliefL0 }; });

async function run(browser, profile, still) {
  const { ctx, page, errors } = await open(browser, profile);
  const rows = [];
  for (const [name, lon, lat] of PLACES) {
    let lastK = null;
    for (const z of ZOOMS) {
      await page.evaluate((v) => document.querySelector(".atlas2").__atlas2.setView(v[0], v[1], v[2]), [lon, lat, z]);
      const ok = await settled(page);
      const st = await state(page);
      if (lastK != null && Math.abs(st.k - lastK) < 1e-6) continue;   // past the cap: the same view again
      lastK = st.k;
      const rivers = await diff(page, "rivers");
      const relief = still ? null : await diff(page, "relief");
      rows.push({ profile: profile.name, place: name, asked: z, k: st.k, settled: ok, st, rivers, relief });
      const where = `${profile.name}, ${name}, ${st.k.toFixed(3)} km/px${z === ZOOMS[ZOOMS.length - 1] ? " (the cap)" : ""}`;
      check(`rivers drawn at ${where}`, rivers > 0, `${rivers} px differ with rivers on; renderer ${st.riverSegments} river segments, riversOn ${st.riversOn}, level ${st.level}${ok ? "" : ", NOT settled"}`);
      if (!still) check(`relief drawn at ${where}`, relief > 0, `${relief} px differ with relief on; ${st.reliefPatches} patches, fade ${st.fade.toFixed(2)}, L0 ${st.reliefL0}${ok ? "" : ", NOT settled"}`);
    }
  }
  if (REPORT) {
    console.log(`\n  ${profile.name}${still ? " (Canvas 2D)" : ""}: place | km/px | level | river px | river segs | riversOn | relief px | patches | fade`);
    for (const r of rows) console.log(`  ${r.place} | ${r.k.toFixed(3)} | ${r.st.level} | ${r.rivers} | ${r.st.riverSegments} | ${r.st.riversOn} | ${r.relief == null ? "-" : r.relief} | ${r.st.reliefPatches} | ${r.st.fade.toFixed(2)}`);
  }
  const unexpected = errors.filter((e) => !/favicon/.test(e));
  check(`${profile.name}${still ? " (Canvas 2D)" : ""}: no page errors`, unexpected.length === 0, unexpected.slice(0, 3).join(" | "));
  await ctx.close();
}

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  console.log("\n\x1b[1m1) WebGL2: rivers and relief draw pixels at every zoom down to the cap\x1b[0m\n");
  const browser = await chromium.launch(LAUNCH);
  for (const p of PROFILES) await run(browser, p, false);
  await browser.close();
  console.log("\n\x1b[1m2) Canvas 2D (no WebGL2): the rivers draw down to the still view's own cap\x1b[0m\n");
  const b2 = await chromium.launch(Object.assign({}, LAUNCH, { args: ["--disable-webgl", "--disable-3d-apis"] }));
  await run(b2, PROFILES[0], true);
  await b2.close();
  server.close();
  console.log(`\n${pass} ok, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
