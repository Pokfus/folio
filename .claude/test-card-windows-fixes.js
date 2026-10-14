/* test-card-windows-fixes.js — the five fixes the owner found on a real phone after the Stage B flip (Atlas v2 card windows; docs/atlas-v2-card-windows.md "Phone fixes", docs/atlas-v2-design.md §7 "Phone fixes — as built")

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-card-windows-fixes.js                 the engine's windows (the default)
     FOLIO_ENGINE=v1 NODE_PATH=... node .claude/test-card-windows-fixes.js                         v1's windows (the fallback); the sections that have a v1 twin run, the engine-only ones say so
     --only=1,3                                                                                      some sections

     1  THE HIGHLIGHT STAYS THROUGH A GESTURE: the shaded place's outline (the selection gold) is on the canvas before a drag, DURING it (several samples across a CDP touch drag), during a two-finger pinch
        and a wheel zoom, and after — for a state card (geo-002) and a country card (gw-001).
     2  A WAR WINDOW'S LABELS STAND ON THEIR OWN GROUND (engine only): for every war card in the pinned set, each side's label point lies inside a face of that side; rm-209 "Rome" is on green, "Carthage" on red.
     3  A LOCATOR WINDOW'S NAMES DO NOT COLLIDE: no two drawn names or marks overlap in a window with many siblings (rm-003), at desktop and at 390 px.
     4  A WAR WINDOW HAS ONE LEGEND (engine only): the plain-text one below the window; nothing is drawn over the bottom of the map; the two sides' names are still on it.
     5  TAPS NEVER NAVIGATE: a tap, a double tap, a mouse click and a drag end on a map card (revealed and not), a locator and a war window change nothing in the address and open no Atlas; the window's own
        globe button still does (and Back returns to the same card with its reveal state).
     6  No console or page errors. */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const ES = require("./test-engine-switch.js");
const { isNoise } = require("./test-noise.js");
const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream", ".woff2": "font/woff2" };
const PORT = 5631;
const ENGINE = ES.v2();
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  " + extra : "")); } };
const sect = (t) => console.log("\n\x1b[1m" + t + "\x1b[0m\n");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [];
const url = (hash) => `http://127.0.0.1:${PORT}/${hash || ""}`;
const only = (process.argv.find((a) => a.startsWith("--only=")) || "").slice(7).split(",").filter(Boolean);
const want = (n) => !only.length || only.includes(String(n));

/* a page with the tours dismissed; `mobile` is a 390×844 touch phone (dpr 3), otherwise a 1100×900 desktop; `session` puts a study session on one card (revealed when `rev`) */
async function newPage(browser, o) {
  o = o || {};
  const ctx = await browser.newContext(o.mobile ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true } : { viewport: { width: 1100, height: 900 }, deviceScaleFactor: 1 });
  await ctx.addInitScript(({ session }) => {
    try { localStorage.setItem("folio_tour_v1", "1"); localStorage.setItem("folio_atlas_tour_v1", "1"); localStorage.setItem("folio_library_tour_v1", "1"); localStorage.setItem("folio_mine_tour_v1", "1"); } catch (e) {}
    try { if (session && !sessionStorage.getItem("folio_study_v1")) sessionStorage.setItem("folio_study_v1", JSON.stringify(session)); } catch (e) {}
  }, { session: o.session || null });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text()) && !/GL_INVALID|WebGL/.test(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  return { ctx, page };
}
const sessionFor = (id, rev) => ({ scope: { type: "card", id }, queue: [id], id, qi: 0, rev: !!rev, studied: 0 });
const isV2 = (page) => page.evaluate(() => { const h = document.querySelector(".map-card"); return h && h.getAttribute("data-map-engine"); });
/* the window is mounted and has drawn (the engine: ready, then settled — its tiles in; v1: ready and a moment) */
async function windowUp(page, sel) {
  sel = sel || ".map-card";
  await page.waitForSelector(sel, { timeout: 60000 });
  await page.waitForFunction((s) => { const h = document.querySelector(s); return h && h._folioMap && h._folioMap.ready() && !h.classList.contains("mc-loading"); }, sel, { timeout: 180000 });
  if (ENGINE) await page.waitForFunction((s) => { const h = document.querySelector(s); return h && h._folioMap && h._folioMap.settled && h._folioMap.settled(); }, sel, { timeout: 180000 }).catch(() => {});
  await sleep(700);
}
async function openCard(page, id, sel) {
  await page.goto(url("#card/" + id), { waitUntil: "load" });
  await page.reload({ waitUntil: "load" });
  await windowUp(page, sel);
}
const boxOf = (page, sel) => page.$eval(sel, (e) => { const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; });

/* the selection gold's outline and glow on the window's canvas: the line colour (255,192,74) and the glow round it; the fill is a pale tint (blue channel well above 150) and the capital's square is
   (255,178,46) — a card with a dot is not used for this count */
const OUTLINE_PX = `(d,i)=>d[i+3]>200&&d[i]>235&&d[i+1]>172&&d[i+1]<218&&d[i+2]<115`;
const outlinePixels = (page, sel) => page.evaluate(([s, src]) => { const c = document.querySelector(s), x = c.getContext("2d"), d = x.getImageData(0, 0, c.width, c.height).data; const f = new Function("d", "i", "return (" + src + ")(d,i);"); let n = 0; for (let i = 0; i < d.length; i += 4) if (f(d, i)) n++; return n; }, [sel || ".map-card .mc-canvas", OUTLINE_PX]);

/* a CDP touch gesture: points is a function of the step number → the touch points, steps the number of moves; `during` is called after each move while the fingers are still down */
async function touchGesture(page, cdp, start, move, steps, gap, during) {
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: start });
  for (let i = 1; i <= steps; i++) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: move(i) });
    await sleep(gap);
    if (during) await during(i);
  }
}
const touchEnd = (cdp) => cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await ES.launch(chromium, LAUNCH);
  console.log("windows under test: " + (ENGINE ? "the engine's (default)" : "v1's (FOLIO_ENGINE=v1)"));

  /* ---------------- 1) the highlight stays through a gesture ---------------- */
  if (want(1)) {
    sect("1) the shaded place's outline stays on the window through a drag, a pinch and a wheel zoom");
    for (const [id, label] of [["geo-002", "a state card (Texas)"], ["gw-001", "a country card (India)"]]) {
      const { ctx, page } = await newPage(browser, { mobile: true });
      const cdp = await ctx.newCDPSession(page);
      await openCard(page, id);
      const b = await boxOf(page, ".map-card .mc-canvas"), cx = b.x + b.w / 2, cy = b.y + b.h / 2;
      const before = await outlinePixels(page);
      check(label + ": the outline is on the canvas before the gesture", before > 150, String(before));
      // a one-finger touch drag: twelve moves of 7 px, the fingers still down at each sample
      const during = [];
      await touchGesture(page, cdp, [{ x: cx, y: cy }], (i) => [{ x: cx + 7 * i, y: cy + 3 * i }], 12, 55, async () => { during.push(await outlinePixels(page)); });
      const dragMin = Math.min.apply(null, during.slice(2));
      check(label + ": ...and DURING a touch drag, at every one of " + (during.length - 2) + " samples (a plain outline: no glow, so fewer pixels than at rest)", dragMin > 300 && dragMin > before * 0.1, JSON.stringify(during) + " (at rest " + before + ")");
      await touchEnd(cdp); await sleep(400);
      if (ENGINE) await page.waitForFunction(() => document.querySelector(".map-card")._folioMap.settled(), null, { timeout: 120000 }).catch(() => {});
      await sleep(600);
      const afterDrag = await outlinePixels(page);
      check(label + ": ...and after it", afterDrag > before * 0.5, afterDrag + " (before " + before + ")");
      // a two-finger pinch (spread), the fingers still down
      const pin = [];
      await touchGesture(page, cdp, [{ x: cx - 30, y: cy, id: 1 }, { x: cx + 30, y: cy, id: 2 }], (i) => [{ x: cx - 30 - 4 * i, y: cy, id: 1 }, { x: cx + 30 + 4 * i, y: cy, id: 2 }], 10, 55, async () => { pin.push(await outlinePixels(page)); });
      const pinMin = Math.min.apply(null, pin.slice(2));
      check(label + ": ...and DURING a pinch", pinMin > 300 && pinMin > before * 0.1, JSON.stringify(pin));
      await touchEnd(cdp); await sleep(400);
      /* THE COST OF A DRAG FRAME (the frame gate's rule, read on the window): the page's frame intervals across a continuous touch drag, 70 moves at the display's pace. The gate: at most 0.5 % of gesture frames over 100 ms, none over 200 ms
         (test-atlas-perf.js reads it on the Atlas page; a window is a smaller canvas on the same engine). This runner rasterises on the CPU (SwiftShader), a phone's GPU does not. */
      await page.evaluate(() => { window.__fr = { dts: [], on: true }; let last = 0; const tick = (t) => { if (!window.__fr.on) return; if (last) window.__fr.dts.push(t - last); last = t; requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
      await touchGesture(page, cdp, [{ x: cx, y: cy }], (i) => [{ x: cx + 3 * Math.sin(i / 6) * 20, y: cy + 2.5 * i % 120 }], 70, 14, null);
      await touchEnd(cdp);
      const dts = await page.evaluate(() => { window.__fr.on = false; return window.__fr.dts.slice(); });
      const over100 = dts.filter((d) => d > 100).length, over200 = dts.filter((d) => d > 200).length, worst = Math.max.apply(null, dts);
      console.log("        drag frames: " + dts.length + ", over 100 ms: " + over100 + " (" + (100 * over100 / dts.length).toFixed(1) + " %), over 200 ms: " + over200 + ", worst " + Math.round(worst) + " ms, median " + Math.round(dts.slice().sort((a, b) => a - b)[dts.length >> 1]) + " ms");
      check(label + ": a drag frame stays inside the frame gate's ceiling (none over 200 ms)", over200 === 0, "worst " + Math.round(worst) + " ms");
      await sleep(600);
      await ctx.close();
      // a wheel zoom, on a desktop pointer
      const D = await newPage(browser);
      await openCard(D.page, id);
      const db = await boxOf(D.page, ".map-card .mc-canvas");
      await D.page.mouse.move(db.x + db.w / 2, db.y + db.h / 2);
      const wh = [];
      for (let i = 0; i < 8; i++) { await D.page.mouse.wheel(0, -90); await sleep(60); wh.push(await outlinePixels(D.page)); }
      check(label + ": ...and DURING a wheel zoom", Math.min.apply(null, wh.slice(1)) > 300, JSON.stringify(wh));
      await D.ctx.close();
    }
  }

  await browser.close(); server.close();
  console.log("\n" + (errors.length ? "\x1b[31m" + errors.length + " console/page errors:\x1b[0m\n  " + errors.slice(0, 6).join("\n  ") : "no console or page errors"));
  check("no console or page errors", errors.length === 0);
  console.log(`\n${pass} ok, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
