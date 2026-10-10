#!/usr/bin/env node
/* test-atlas-review.js — the regressions of the Phase 2a review, held (Phase 2b, Oct 2026; playwright, headless Chromium).

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-review.js

   What it proves (docs/atlas-v2-design.md §7 "Phase 2b — as built", Task 0):
     · THE COAST STROKE STAYS AT THE COAST. At the two views the review found — Tuscany and Latium at the zoom cap in 1 CE, Sicily
       and Calabria at 0.6 km/px in 250 BCE — no pixel of a polity's own full colour (the colour its coast stroke is drawn in) lies
       further than the stroke's width from a water pixel. The 2a worker packed the stroke's segments as seven floats where the
       renderer reads eight, so every segment after the first joined unrelated points: a thick chord across Latium and a fan over
       Sicily. This fails on that worker and passes on the fixed one.
     · THE RAIL ON NARROW SCREENS. At 360, 390 and 430 px wide — with the phone flag (a coarse pointer) and WITHOUT it (the owner's
       phone took one clipped line: the flag had missed it) — every rail control is wholly inside the rail's row and the atlas, the
       row does not overflow, and a card open does not squeeze the rail away.
     · EVERY YEAR CARRIES ITS ERA: "1 CE", "300 BCE", "2026 CE" in the year box, the pin's text and fmtYear; parseYear reads them back.

   Exit 1 on any failure. */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");
const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream" };
const PORT = 5641;
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const C = (page, fn, arg) => page.evaluate(fn, arg);

async function open(context, hash, full) {
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  await page.goto(`http://127.0.0.1:${PORT}/${hash || "#map2"}`, { waitUntil: "load" });
  await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 120000 });
  await C(page, () => { const c = document.querySelector(".atlas2").__atlas2; c.setLayers({ rivers: true, lakes: true, relief: false, density: "normal", countries: true, places: true, physical: true, cities: true, provinces: true }); c.ensureHistory(); });
  await page.waitForFunction((f) => { const c = document.querySelector(".atlas2").__atlas2; return c.waterSettled() && c.labelsReady() && c.historyStarted() && c.historyReady() && (!f || (c.tilesSettled() && c.historySettled())); }, !!full, { timeout: 120000 });
  await sleep(300);
  return { page, errors };
}

/* the stroke test: a screenshot of the atlas, read back in the page; the alive polities' full colours; water by the palette */
async function strokePixelsFarFromWater(page) {
  const png = (await page.locator(".atlas2").screenshot()).toString("base64");
  return C(page, async (b64) => {
    const c = document.querySelector(".atlas2").__atlas2;
    const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
    const cv = document.createElement("canvas"); cv.width = img.naturalWidth; cv.height = img.naturalHeight;
    const g = cv.getContext("2d", { willReadFrequently: true }); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, cv.width, cv.height).data, W = cv.width, H = cv.height;
    const dpr = cv.width / c.view.cx / 2;   // device pixels per CSS pixel in the shot (the view's centre is half the width)
    // the polities' full colours (the stroke's colour), contested faces left out (their hatch is the partner's colour)
    const faces = c.alive(), seen = new Set(), cols = [];
    for (const a of faces) { if (seen.has(a.entity) || a.entity.startsWith("contested:")) continue; seen.add(a.entity); const rgb = c.histColour(a.entity); if (rgb) cols.push(rgb.map((v) => Math.round(v * 255))); }
    // water and plain land by the palette, as the renderer draws them (relief off). A fill is the polity's colour at its alpha over
    // the land; the stroke is the colour at full strength; an antialiased thin stroke lands between. A pixel counts as STROKE-TINTED
    // when it sits on the line from the land colour to the polity's colour (within 24 of it) at least 0.62 of the way along — the
    // fill reads about 0.42 (its alpha), so this is the fill plus a fifth of the way to the pure colour, which a thin line's
    // antialiasing reaches and a fill never does.
    const pal = c.palette(); const water = (pal.ocean || pal.water || [0.7, 0.92, 1.0]).map((v) => Math.round(v * 255)), land = (pal.land || [0.9, 0.9, 0.88]).map((v) => Math.round(v * 255));
    const isWater = (i) => Math.abs(d[i] - water[0]) <= 14 && Math.abs(d[i + 1] - water[1]) <= 14 && Math.abs(d[i + 2] - water[2]) <= 14;
    const axes = cols.map((k) => { const v = [k[0] - land[0], k[1] - land[1], k[2] - land[2]]; const l2 = v[0] * v[0] + v[1] * v[1] + v[2] * v[2]; return { v, l2 }; });
    const isStroke = (i) => { for (const { v, l2 } of axes) { if (l2 < 400) continue; const p = [d[i] - land[0], d[i + 1] - land[1], d[i + 2] - land[2]]; const t = (p[0] * v[0] + p[1] * v[1] + p[2] * v[2]) / l2; if (t < 0.62 || t > 1.1) continue; const off = Math.hypot(p[0] - v[0] * t, p[1] - v[1] * t, p[2] - v[2] * t); if (off <= 24) return true; } return false; };
    const s = c.statsNow(); const strokePx = c.view.history ? c.view.history.strokePx : 0;
    const R = Math.ceil((strokePx + 3) * dpr) + 2;   // the stroke's half width is strokePx/2 CSS px each side; margin for the line's antialiasing and the coast's own width
    const water8 = new Uint8Array(W * H); for (let i = 0; i < W * H; i++) water8[i] = isWater(4 * i) ? 1 : 0;
    let strokey = 0, far = 0; const sample = [];
    const top = Math.round(60 * dpr), bottom = H - Math.round(90 * dpr);   // skip the search box and the rail
    for (let y = top; y < bottom; y++) for (let x = 0; x < W; x++) {
      const i = 4 * (y * W + x); if (!isStroke(i)) continue; strokey++;
      let near = false;
      for (let yy = Math.max(0, y - R); yy <= Math.min(H - 1, y + R) && !near; yy++) for (let xx = Math.max(0, x - R); xx <= Math.min(W - 1, x + R); xx++) if (water8[yy * W + xx]) { near = true; break; }
      if (!near) { far++; if (sample.length < 6) sample.push([Math.round(x / dpr), Math.round(y / dpr)]); }
    }
    return { W, H, dpr, strokePx, R, colours: cols.length, strokey, far, sample, kmPerPx: s.kmPerPx, level: s.level, faces: s.historyFaces };
  }, png);
}

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch(LAUNCH);
  const errorsAll = [];

  console.log("\n\x1b[1m1) the coast stroke stays at the coast (the 2a review's two artefact views)\x1b[0m\n");
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    for (const v of [{ name: "Tuscany and Latium at the cap, 1 CE", hash: "#map2/12.5/41.9/12?y=1" }, { name: "Sicily and Calabria at 0.6 km/px, 250 BCE", hash: "#map2/14/37.5/8?y=-250" }]) {
      const { page, errors } = await open(context, v.hash, true);
      await C(page, () => document.querySelector(".atlas2").__atlas2.invalidate()); await sleep(300);
      const r = await strokePixelsFarFromWater(page);
      check(`${v.name}: polities drawn, their stroke on`, r.faces > 0 && r.strokePx > 0 && r.colours > 0, `${r.faces} faces, stroke ${r.strokePx.toFixed(1)} px, ${r.colours} colours, ${r.kmPerPx.toFixed(2)} km/px`);
      check(`${v.name}: no pixel of a polity's full colour further than the stroke from water`, r.far <= 8, `${r.far} of ${r.strokey} full-colour pixels beyond ${r.R} device px of water` + (r.sample.length ? "; at " + r.sample.map((p) => p.join(",")).join(" ") : ""));
      errorsAll.push(...errors); await page.close();
    }
    await context.close();
  }

  console.log("\n\x1b[1m2) the rail on narrow screens: every control inside its row, with and without the phone flag, with and without a card\x1b[0m\n");
  for (const W of [360, 390, 430]) for (const mobile of [true, false]) {
    const context = await browser.newContext({ viewport: { width: W, height: 844 }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 2 });
    const { page, errors } = await open(context, "#map2/12.5/41.9/5?y=1", false);
    const measure = () => C(page, () => {
      const el = document.querySelector(".atlas2"), row = el.querySelector(".atlas2-rail-row");
      const R = (e) => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, r: r.right, b: r.bottom }; };
      const host = R(el), rowR = R(row);
      const ctrls = [".atlas2-rail-prev", ".atlas2-rail-track", ".atlas2-rail-next", ".atlas2-rail-year", ".atlas2-rail-play", ".atlas2-rail-speed"].map((s) => Object.assign({ sel: s }, R(el.querySelector(s))));
      return { phone: el.classList.contains("atlas2-phone"), narrow: el.classList.contains("atlas2-narrow"), host, row: rowR, overflow: row.scrollWidth - row.clientWidth, lines: new Set(ctrls.map((c) => Math.round((c.y + c.b) / 20))).size, ctrls, year: el.querySelector(".atlas2-rail-year").value, railH: getComputedStyle(el).getPropertyValue("--atlas2-rail-h").trim() };
    });
    const inside = (c, box) => c.x >= box.x - 1 && c.y >= box.y - 1 && c.r <= box.r + 1 && c.b <= box.b + 1;
    const tag = `${W} px, ${mobile ? "phone flag" : "no phone flag"}`;
    const m0 = await measure();
    const bad0 = m0.ctrls.filter((c) => !inside(c, m0.row) || !inside(c, m0.host));
    check(`${tag}: the rail takes two lines and no control leaves its row`, m0.narrow && m0.lines === 2 && bad0.length === 0 && m0.overflow <= 0, `phone ${m0.phone}, narrow ${m0.narrow}, lines ${m0.lines}, overflow ${m0.overflow}` + (bad0.length ? "; outside: " + bad0.map((c) => c.sel).join(" ") : ""));
    check(`${tag}: the year box reads "1 CE"`, m0.year === "1 CE", JSON.stringify(m0.year));
    await C(page, () => document.querySelector(".atlas2").__atlas2.select("pol:rome")); await sleep(300);
    const m1 = await measure();
    const bad1 = m1.ctrls.filter((c) => !inside(c, m1.row) || !inside(c, m1.host));
    check(`${tag}: with Rome's card open the rail keeps its width and every control`, bad1.length === 0 && m1.overflow <= 0 && (m1.row.r - m1.row.x) >= (m0.row.r - m0.row.x) - 2, `row ${Math.round(m1.row.r - m1.row.x)} px (was ${Math.round(m0.row.r - m0.row.x)})` + (bad1.length ? "; outside: " + bad1.map((c) => c.sel).join(" ") : ""));
    errorsAll.push(...errors); await page.close(); await context.close();
  }

  console.log("\n\x1b[1m3) every year carries its era\x1b[0m\n");
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const { page, errors } = await open(context, "#map2/12.5/41.9/5?y=1", false);
    const r = await C(page, () => { const c = document.querySelector(".atlas2").__atlas2; return { f: [1, -300, 2026, 0, 1066].map((y) => c.fmtYear(y)), p: ["1 CE", "300 BCE", "2026 CE", "1066 CE", "AD 1066", "1066"].map((t) => c.parseYear(t)), box: document.querySelector(".atlas2-rail-year").value, pin: document.querySelector(".atlas2-rail-pin").getAttribute("aria-valuetext") }; });
    check("fmtYear: 1 → \"1 CE\", −300 → \"300 BCE\", 2026 → \"2026 CE\", 0 → \"1 BCE\", 1066 → \"1066 CE\"", r.f.join("|") === "1 CE|300 BCE|2026 CE|1 BCE|1066 CE", r.f.join("|"));
    check("parseYear reads them back (and a bare number, AD 1066)", r.p.join() === "1,-300,2026,1066,1066,1066", r.p.join());
    check("the year box and the pin say \"1 CE\" at year 1", r.box === "1 CE" && r.pin === "1 CE", `${r.box} / ${r.pin}`);
    errorsAll.push(...errors); await page.close(); await context.close();
  }

  check("no page errors", errorsAll.length === 0, errorsAll.slice(0, 3).join(" | "));
  await browser.close(); server.close();
  console.log(`\n${pass} passed, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); server.close(); process.exit(1); });
