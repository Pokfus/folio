/* test-atlas-relief-detail.js — the relief's DETAIL level (2026-10-25: "when zoomed in, the relief map very quickly becomes
   blurry and undetailed"): the 15 arc-second hillshade tiles of atlas/data/relief-detail/ over the L1 tint.

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-relief-detail.js [--report] [--shots DIR]
     FOLIO_CHROMIUM=/path/to/chrome  … to pick the browser (otherwise playwright's own)

   WHAT IT PROVES, for a desktop (1280 × 800) and a phone (390 × 844, touch) profile, relief on at full strength:
     1. at 3 km/px (above RELIEF_DETAIL_KM_PER_PX) no detail tile is wanted or drawn — the L1 wash as before;
     2. at the Alps, the Himalaya and the Grand Canyon at 1, 0.5 and the zoom cap, the view's land tiles are wanted, all arrive,
        every one is drawn (renderer `reliefDetail`), the shade has fully faded in (detailMix 1) and the count stays under the cap;
     3. the detail ADDS DETAIL: the mean absolute difference between neighbouring pixels (a central crop, the renderer's own
        context read in the same task as the draw) is at least 1.5 × the same frame drawn with the detail switched off
        (`renderer.debug.detail`), at every one of those views;
     4. over open sea (the North Atlantic at 1 km/px) no tile is wanted: the sea has no detail level;
     5. the cost: the mean of 20 back-to-back R.render calls with the detail against without, at the Alps at 0.5 km/px,
        is reported and must stay under 1.6 × (software GL; the frame gate test-atlas-perf.js remains the gate);
     6. no page errors.
   --shots DIR writes before/after PNGs of every view. */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const REPORT = process.argv.includes("--report");
const SHOTS = (() => { const i = process.argv.indexOf("--shots"); return i >= 0 ? process.argv[i + 1] : null; })();
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".bin": "application/octet-stream" };
const PORT = 5657;
const PLACES = [["the Alps", 7.0, 45.9], ["the Himalaya", 86.9, 27.98], ["the Grand Canyon", -112.1, 36.1]];
const ZOOMS = [1, 0.5, 0.01];   // the last is past the cap and reads back as the cap
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

async function open(browser, profile) {
  const ctx = await browser.newContext(profile.ctx);
  await ctx.addInitScript(`localStorage.setItem("folio_tour_v1","1");localStorage.setItem("folio_atlas_tour_v1","1");`);
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  await page.goto(`http://127.0.0.1:${PORT}/#map`, { waitUntil: "load" });
  await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 120000 });
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setLayers({ relief: true, strength: 1, rivers: false, lakes: true, borders: true }));
  await page.waitForFunction(() => document.querySelector(".atlas2").__atlas2.statsNow().detailIndex, null, { timeout: 60000 });
  return { ctx, page, errors };
}
// every land tile, relief patch and detail tile the view wants is resident
const settled = (page) => page.waitForFunction(() => {
  const c = document.querySelector(".atlas2").__atlas2, s = c.statsNow();
  return c.tilesSettled() && s.reliefPending === 0 && s.detailPending === 0 && c.renderer.reliefLoaded("0") && c.view.relief.detail.every((k) => c.renderer.reliefDetailLoaded(k));
}, null, { timeout: 120000 }).then(() => true, () => false);
const state = (page) => page.evaluate(() => new Promise((resolve) => { const c = document.querySelector(".atlas2").__atlas2; c.invalidate(); requestAnimationFrame(() => requestAnimationFrame(() => { const s = c.statsNow(), r = c.renderer.stats(); resolve({ k: c.kmPerPx(), wanted: s.detailWanted, drawn: r.reliefDetail, resident: r.reliefDetailResident, mix: s.detailMix, patches: r.reliefPatches, bytes: s.detailBytes }); })); }));
/* the mean |Δ| between horizontal and vertical neighbours over the central half of the frame, with the detail on and off,
   each read from the renderer's own context right after its draw; optionally the two frames as PNG data */
const texture = (page, wantPng) => page.evaluate((wantPng) => {
  const c = document.querySelector(".atlas2").__atlas2, R = c.renderer, gl = R.gl;
  const w = gl.drawingBufferWidth, h = gl.drawingBufferHeight;
  const grab = () => { R.render(c.view); const px = new Uint8Array(w * h * 4); gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px); return px; };
  const energy = (px) => { let s = 0, n = 0; const L = (i) => 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]; for (let y = h >> 2; y < (3 * h) >> 2; y++) for (let x = w >> 2; x < (3 * w) >> 2; x++) { const i = (y * w + x) * 4; s += Math.abs(L(i) - L(i + 4)) + Math.abs(L(i) - L(i + 4 * w)); n += 2; } return s / n; };
  const png = (px) => { const cv = document.createElement("canvas"); cv.width = w; cv.height = h; const x = cv.getContext("2d"); const im = x.createImageData(w, h); for (let y = 0; y < h; y++) im.data.set(px.subarray((h - 1 - y) * w * 4, (h - y) * w * 4), y * w * 4); x.putImageData(im, 0, 0); return cv.toDataURL("image/png"); };
  const on = grab(); R.debug.detail = false; const off = grab(); R.debug.detail = true; R.render(c.view);
  return { on: energy(on), off: energy(off), pngOn: wantPng ? png(on) : null, pngOff: wantPng ? png(off) : null };
}, wantPng);
const cost = (page) => page.evaluate(() => {
  const c = document.querySelector(".atlas2").__atlas2, R = c.renderer, gl = R.gl, px = new Uint8Array(4);
  const time = () => { R.render(c.view); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); const t0 = performance.now(); for (let i = 0; i < 20; i++) { R.render(c.view); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); } return (performance.now() - t0) / 20; };
  const off0 = (R.debug.detail = false, time()); const on = (R.debug.detail = true, time()); const off1 = (R.debug.detail = false, time()); R.debug.detail = true;
  return { on, off: (off0 + off1) / 2 };
});

async function run(browser, profile) {
  const { ctx, page, errors } = await open(browser, profile);
  const rows = [];
  const go = async (lon, lat, z) => { await page.evaluate((v) => document.querySelector(".atlas2").__atlas2.setView(v[0], v[1], v[2]), [lon, lat, z]); const ok = await settled(page); return Object.assign({ settled: ok }, await state(page)); };
  // 1. above the threshold: the L1 wash alone
  { const st = await go(7.0, 45.9, 3); check(`${profile.name}: no detail at ${st.k.toFixed(2)} km/px`, st.wanted === 0 && st.drawn === 0, `wanted ${st.wanted}, drawn ${st.drawn}, L1 patches ${st.patches}`); }
  // 2–3. the mountains
  for (const [name, lon, lat] of PLACES) {
    let lastK = null;
    for (const z of ZOOMS) {
      const st = await go(lon, lat, z);
      if (lastK != null && Math.abs(st.k - lastK) < 1e-6) continue; lastK = st.k;
      const where = `${profile.name}, ${name}, ${st.k.toFixed(2)} km/px${z === ZOOMS[ZOOMS.length - 1] ? " (the cap)" : ""}`;
      check(`detail tiles wanted, arrived and drawn at ${where}`, st.settled && st.wanted > 0 && st.drawn === st.wanted && st.mix === 1 && st.wanted <= 40, `wanted ${st.wanted}, drawn ${st.drawn}, resident ${st.resident}, mix ${st.mix}, ${(st.bytes / 1024).toFixed(0)} KB fetched so far${st.settled ? "" : ", NOT settled"}`);
      const tx = await texture(page, !!SHOTS);
      check(`the detail adds detail at ${where}`, tx.on >= 1.5 * tx.off, `neighbour |Δ| ${tx.on.toFixed(2)} with, ${tx.off.toFixed(2)} without (×${(tx.on / tx.off).toFixed(2)})`);
      if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); const base = path.join(SHOTS, `${profile.name.split(" ")[0]}-${name.replace(/\W+/g, "-")}-${st.k.toFixed(2)}`); fs.writeFileSync(base + "-detail.png", Buffer.from(tx.pngOn.split(",")[1], "base64")); fs.writeFileSync(base + "-l1.png", Buffer.from(tx.pngOff.split(",")[1], "base64")); }
      rows.push({ where, st, tx });
    }
  }
  // 4. the open sea
  { const st = await go(-40, 35, 1); check(`${profile.name}: no detail tile over the open sea`, st.wanted === 0, `wanted ${st.wanted}`); }
  // 5. the cost
  { await go(7.0, 45.9, 0.5); const c = await cost(page); check(`${profile.name}: a frame with the detail costs under 1.6 × one without`, c.on <= 1.6 * c.off, `${c.on.toFixed(1)} ms with, ${c.off.toFixed(1)} ms without (×${(c.on / c.off).toFixed(2)})`); }
  if (REPORT) for (const r of rows) console.log(`  ${r.where} | wanted ${r.st.wanted} | |Δ| ${r.tx.on.toFixed(2)} / ${r.tx.off.toFixed(2)}`);
  const unexpected = errors.filter((e) => !/favicon/.test(e));
  check(`${profile.name}: no page errors`, unexpected.length === 0, unexpected.slice(0, 3).join(" | "));
  await ctx.close();
}

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  console.log("\n\x1b[1mThe relief's detail level (15 arc-second hillshade)\x1b[0m\n");
  const browser = await chromium.launch(LAUNCH);
  for (const p of PROFILES) await run(browser, p);
  await browser.close();
  server.close();
  console.log(`\n${pass} ok, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
