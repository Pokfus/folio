#!/usr/bin/env node
/* test-atlas-review.js — the regressions of the Phase 2a review, held (Phase 2b, Oct 2026; playwright, headless Chromium).

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-review.js

   What it proves (docs/atlas-v2-design.md §7 "Phase 2b — as built", Task 0):
     · THE COAST STROKE STAYS AT THE COAST. At the two views the review found — Tuscany and Latium at the zoom cap in 1 CE, Sicily
       and Calabria at 0.6 km/px in 250 BCE — no pixel of a polity's own full colour (the colour its coast stroke is drawn in) lies
       further than the stroke's width from a water pixel. The 2a worker packed the stroke's segments as seven floats where the
       renderer reads eight, so every segment after the first joined unrelated points: a thick chord across Latium and a fan over
       Sicily. This fails on that worker and passes on the fixed one.
     · A FILL IS DRAWN ONCE. At two views without the coast stroke (the Mongol Empire of 1245 about the Ob at 6 km/px, the Russian
       Empire of 1900 over Europe at 3 km/px — faces with lake holes), no pixel lies beyond the fill's tone towards a polity's full
       colour in a run of two or more, and no run of plain-land pixels lies inside a fill: a fill drawn twice reads darker, and
       only the stroke (off at these zooms) or a fold in the mesh can get there; a crack in the mesh shows the land through. Until
       2b the worker projected a face azimuthally, which bends great circles; earcut's hole bridges make needle triangles thinner
       than that bend, and lifted to the sphere a needle folded over its neighbour — a darker line from the Volga to Lake Baikal.
       The gnomonic projection keeps planar and spherical triangles the same (atlas-worker.js, triangulateFace).
     · THE RAIL ON NARROW SCREENS. At 360, 390 and 430 px wide — with the phone flag (a coarse pointer) and WITHOUT it (the owner's
       phone took one clipped line: the flag had missed it) — every rail control is wholly inside the rail's row and the atlas, the
       row does not overflow, and a card open does not squeeze the rail away. AND THE TICKS DO NOT MERGE INTO A BAR (Phase 3a, task 0c):
       the track draws NO ticks (2026-10-18, decision c: no tick canvas, no DOM tick, no vertical ink along the track but the pin's),
       while the change years stay as data and [ and ] still jump between them.
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
  await page.goto(`http://127.0.0.1:${PORT}/${hash || "#map"}`, { waitUntil: "load" });
  await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 120000 });
  await C(page, () => { const c = document.querySelector(".atlas2").__atlas2; c.setLayers({ rivers: true, lakes: true, relief: false, density: "normal", countries: true, places: true, physical: true, cities: true, provinces: true }); c.ensureHistory(); });
  await page.waitForFunction((f) => { const c = document.querySelector(".atlas2").__atlas2; return c.waterSettled() && c.labelsReady() && c.historyStarted() && c.historyReady() && (!f || (c.tilesSettled() && c.historySettled())); }, !!full, { timeout: 120000 });
  await sleep(300);
  return { page, errors };
}

/* the stroke test: a screenshot of the atlas, read back in the page; the alive polities' full colours; water by the palette */
async function strokePixelsFarFromWater(page) {
  /* (2026-10-19: the Atlas page draws no war, so there is no green or red tint over the state's own hue to switch off any more) */
  /* 2026-10-17, decision a: the rivers are drawn to the cap now, and a river's blue under a blue polity's tint sits on that polity's colour line (what §1b
     below already says of rivers and lake shores) — the coast stroke is what this measures, so the rivers are off for the shot; the lakes stay (they are water) */
  /* 2026-10-18: every state is drawn in the land colour (one neutral fill; docs/atlas.md §2), so a fold or a crack in a mesh is invisible by construction — the fill over the land is the land.
     The measurement keeps its meaning through `debugFill`, the controller's test-only override: one visible blue stands in for the neutral while the shot is taken, and is cleared after */
  await C(page, () => { const c = document.querySelector(".atlas2").__atlas2; c.debugFill([0.22, 0.32, 0.78]); c.setLayers({ rivers: false }); c.invalidate(); }); await sleep(500);
  await page.waitForFunction(() => document.querySelector(".atlas2").__atlas2.tilesSettled(), null, { timeout: 60000 }).catch(() => {}); await sleep(300);
  const png = (await page.locator(".atlas2").screenshot()).toString("base64");
  await C(page, () => document.querySelector(".atlas2").__atlas2.debugFill(null));
  return C(page, async (b64) => {
    const c = document.querySelector(".atlas2").__atlas2;
    const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
    const cv = document.createElement("canvas"); cv.width = img.naturalWidth; cv.height = img.naturalHeight;
    const g = cv.getContext("2d", { willReadFrequently: true }); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, cv.width, cv.height).data, W = cv.width, H = cv.height;
    const dpr = cv.width / c.view.cx / 2;   // device pixels per CSS pixel in the shot (the view's centre is half the width)
    // the polities' full colours (the stroke's colour), contested faces left out (their hatch is the partner's colour)
    const faces = c.alive(), seen = new Set(), cols = [];
    const dbg = [0.22, 0.32, 0.78].map((v) => Math.round(v * 255));   // the override the shot was taken with (histColour reads the live fill, which is the land again by now)
    for (const a of faces) { if (seen.has(a.entity) || a.entity.startsWith("contested:")) continue; seen.add(a.entity); cols.push(dbg); }
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
    const stroke8 = new Uint8Array(W * H);
    for (let y = top; y < bottom; y++) for (let x = 0; x < W; x++) {
      const i = 4 * (y * W + x); if (!isStroke(i)) continue; strokey++; stroke8[y * W + x] = 1;
      let near = false;
      for (let yy = Math.max(0, y - R); yy <= Math.min(H - 1, y + R) && !near; yy++) for (let xx = Math.max(0, x - R); xx <= Math.min(W - 1, x + R); xx++) if (water8[yy * W + xx]) { near = true; break; }
      if (!near) { far++; if (sample.length < 6) sample.push([Math.round(x / dpr), Math.round(y / dpr)]); }
    }
    /* THE FILL DRAWN TWICE, OR NOT AT ALL, ALONG A LINE (2b, section 1b). With the coast stroke off nothing legitimate reaches
       beyond the fill's tone, and nothing inside a fill is the plain land: a mesh folded over itself reads darker along the
       fold, a crack in it reads as land. Lone pixels are the data's own sub-pixel spikes at ring vertices (a coast doubling
       back within a pixel) and are let through: what counts is a RUN — a stroke-tinted pixel with a stroke-tinted neighbour
       (8-connected), or a land-toned pixel with the fill's tone two pixels away on both sides, vertically or horizontally,
       and another such pixel beside it. */
    const tOf = (i) => { let best = -1; for (const { v, l2 } of axes) { if (l2 < 400) continue; const p = [d[i] - land[0], d[i + 1] - land[1], d[i + 2] - land[2]]; const t = (p[0] * v[0] + p[1] * v[1] + p[2] * v[2]) / l2; const off = Math.hypot(p[0] - v[0] * t, p[1] - v[1] * t, p[2] - v[2] * t); if (off <= 24 && t > best) best = t; } return best; };
    const isFill = (x, y) => { if (x < 0 || y < 0 || x >= W || y >= H) return false; const t = tOf(4 * (y * W + x)); return t >= 0.3 && t <= 0.58; };
    const isLand = (i) => Math.abs(d[i] - land[0]) <= 10 && Math.abs(d[i + 1] - land[1]) <= 10 && Math.abs(d[i + 2] - land[2]) <= 10;
    const crack8 = new Uint8Array(W * H);
    for (let y = top; y < bottom; y++) for (let x = 0; x < W; x++) {
      const i = 4 * (y * W + x); if (!isLand(i)) continue;
      if ((isFill(x, y - 2) && isFill(x, y + 2)) || (isFill(x - 2, y) && isFill(x + 2, y))) crack8[y * W + x] = 1;
    }
    const runs = (m) => { let n = 0; const at = []; for (let y = top; y < bottom; y++) for (let x = 0; x < W; x++) { if (!m[y * W + x]) continue; let nb = 0; for (let yy = y - 1; yy <= y + 1; yy++) for (let xx = x - 1; xx <= x + 1; xx++) if ((yy !== y || xx !== x) && yy >= 0 && yy < H && xx >= 0 && xx < W && m[yy * W + xx]) nb++; if (nb) { n++; if (at.length < 6) at.push([Math.round(x / dpr), Math.round(y / dpr)]); } } return { n, at }; };
    const dark = runs(stroke8), light = runs(crack8);
    return { W, H, dpr, strokePx, R, colours: cols.length, strokey, far, sample, kmPerPx: s.kmPerPx, level: s.level, faces: s.historyFaces, darkRuns: dark.n, darkAt: dark.at, crackRuns: light.n, crackAt: light.at };
  }, png);
}

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch(LAUNCH);
  const errorsAll = [];

  console.log("\n\x1b[1m1) the coast stroke stays at the coast (the 2a review's two artefact views)\x1b[0m\n");
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    await context.addInitScript(() => { try { localStorage.setItem("folio.atlas2.study", "map"); } catch (e) {} });   // the plain Map: this suite reads the base map's names and faces with no cards seeded, and the Atlas opens on Personal by default since Oct 2026, where nothing undiscovered is drawn (decision a, 2026-10-18)
    for (const v of [{ name: "Tuscany and Latium at the cap, 1 CE", hash: "#map/12.5/41.9/12?y=1" }, { name: "Sicily and Calabria at 0.6 km/px, 250 BCE", hash: "#map/14/37.5/8?y=-250" }]) {
      const { page, errors } = await open(context, v.hash, true);
      await C(page, () => document.querySelector(".atlas2").__atlas2.invalidate()); await sleep(300);
      const r = await strokePixelsFarFromWater(page);
      check(`${v.name}: polities drawn, their stroke on`, r.faces > 0 && r.strokePx > 0 && r.colours > 0, `${r.faces} faces, stroke ${r.strokePx.toFixed(1)} px, ${r.colours} colours, ${r.kmPerPx.toFixed(2)} km/px`);
      check(`${v.name}: no pixel of a polity's full colour further than the stroke from water`, r.far <= 8, `${r.far} of ${r.strokey} full-colour pixels beyond ${r.R} device px of water` + (r.sample.length ? "; at " + r.sample.map((p) => p.join(",")).join(" ") : ""));
      errorsAll.push(...errors); await page.close();
    }
    await context.close();
  }

  console.log("\n\x1b[1m1b) a fill is drawn once: no pixel beyond the fill's tone where the coast stroke is off\x1b[0m\n");
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    await context.addInitScript(() => { try { localStorage.setItem("folio.atlas2.study", "map"); } catch (e) {} });   // the plain Map: this suite reads the base map's names and faces with no cards seeded, and the Atlas opens on Personal by default since Oct 2026, where nothing undiscovered is drawn (decision a, 2026-10-18)
    // the ceiling is 24, not 8 (border audit, 2026-10-16): Cliopatria's Mongol Empire of 1245 has three 4-vertex squares 7 km across (two side by side at 53.0–53.2°E 45.9–46.0°N, one at
    // 29.6°E 45.4°N) that the 15 km coast snap used to collapse onto the coast and drop, as it dropped Carthage's; the capped snap keeps them, and at 6 km/px each is a pixel or two of
    // border ink, about 5 pixels in runs. A fold is hundreds of pixels long (the 2a worker's thick chord across Latium).
    for (const v of [{ name: "the Mongol Empire about the Ob, 1245, 6 km/px", hash: "#map/72/62/4.71?y=1245" }, { name: "the Russian Empire over Europe, 1900, 3 km/px", hash: "#map/30/52/5.71?y=1900" }]) {
      const { page, errors } = await open(context, v.hash, true);
      // only the fills, the borders and the polity names: a river or a lake shore is a blue stroke, and a blue polity's axis passes through it
      await C(page, () => { const c = document.querySelector(".atlas2").__atlas2; c.setLayers({ rivers: false, lakes: false, relief: false, density: "normal", countries: false, places: false, physical: false, cities: false, provinces: false }); c.invalidate(); });
      await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.labelsReady() && c.tilesSettled() && c.historySettled(); }, null, { timeout: 60000 }); await sleep(300);
      const r = await strokePixelsFarFromWater(page);
      check(`${v.name}: polities drawn, the coast stroke off`, r.faces > 0 && r.strokePx === 0 && r.colours > 0, `${r.faces} faces, ${r.colours} colours, ${r.kmPerPx.toFixed(2)} km/px`);
      check(`${v.name}: no run of pixels beyond the fill's tone (a fold in the mesh)`, r.darkRuns <= 24, `${r.darkRuns} pixels in runs of ${r.strokey} beyond the tone` + (r.darkAt.length ? "; at " + r.darkAt.map((p) => p.join(",")).join(" ") : ""));
      check(`${v.name}: no run of land pixels inside a fill (a crack in the mesh)`, r.crackRuns <= 8, `${r.crackRuns} pixels in runs` + (r.crackAt.length ? "; at " + r.crackAt.map((p) => p.join(",")).join(" ") : ""));
      errorsAll.push(...errors); await page.close();
    }
    await context.close();
  }

  console.log("\n\x1b[1m2) the rail on narrow screens: every control inside its row, with and without the phone flag, with and without a card\x1b[0m\n");
  for (const W of [360, 390, 430]) for (const mobile of [true, false]) {
    const context = await browser.newContext({ viewport: { width: W, height: 844 }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 2 });
    await context.addInitScript(() => { try { localStorage.setItem("folio.atlas2.study", "map"); } catch (e) {} });   // the plain Map: this suite reads the base map's names and faces with no cards seeded, and the Atlas opens on Personal by default since Oct 2026, where nothing undiscovered is drawn (decision a, 2026-10-18)
    const { page, errors } = await open(context, "#map/12.5/41.9/5?y=1", false);
    const measure = () => C(page, () => {
      const el = document.querySelector(".atlas2"), row = el.querySelector(".atlas2-rail-row");
      const R = (e) => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, r: r.right, b: r.bottom }; };
      const host = R(el), rowR = R(row);
      const isPhone = el.classList.contains("atlas2-phone"), sels = isPhone ? [".atlas2-rail-track", ".atlas2-rail-year", ".atlas2-rail-play", ".atlas2-rail-more"] : [".atlas2-rail-prev", ".atlas2-rail-track", ".atlas2-rail-next", ".atlas2-rail-year", ".atlas2-rail-play", ".atlas2-rail-speed"];   // Oct 2026: on a phone the rail is one row and the arrows and speed are behind "more"
      const ctrls = sels.map((s) => Object.assign({ sel: s }, R(el.querySelector(s))));
      return { phone: el.classList.contains("atlas2-phone"), narrow: el.classList.contains("atlas2-narrow"), host, row: rowR, overflow: row.scrollWidth - row.clientWidth, lines: new Set(ctrls.map((c) => Math.round((c.y + c.b) / 20))).size, ctrls, year: el.querySelector(".atlas2-rail-year").value, railH: getComputedStyle(el).getPropertyValue("--atlas2-rail-h").trim() };
    });
    const inside = (c, box) => c.x >= box.x - 1 && c.y >= box.y - 1 && c.r <= box.r + 1 && c.b <= box.b + 1;
    const tag = `${W} px, ${mobile ? "phone flag" : "no phone flag"}`;
    const m0 = await measure();
    const bad0 = m0.ctrls.filter((c) => !inside(c, m0.row) || !inside(c, m0.host));
    check(`${tag}: the rail takes ${m0.phone ? "one row (scrubber, year, play, more; the arrows and the speed behind \"more\")" : "two lines"} and no control leaves its row`, m0.narrow && m0.lines === (m0.phone ? 1 : 2) && bad0.length === 0 && m0.overflow <= 0, `phone ${m0.phone}, narrow ${m0.narrow}, lines ${m0.lines}, overflow ${m0.overflow}` + (bad0.length ? "; outside: " + bad0.map((c) => c.sel).join(" ") : ""));
    check(`${tag}: the year box reads "1 CE"`, m0.year === "1 CE", JSON.stringify(m0.year));
    // NO TICKS (2026-10-18, decision c; until then task 0c of Phase 3a thinned the change-year ticks to the width): the track holds the pin
    // and the magnifier only — no canvas, no tick element, and no vertical ink along the track but the pin's own
    const tk = await C(page, () => {
      const c = document.querySelector(".atlas2").__atlas2, track = document.querySelector(".atlas2-rail-track"), pin = track.querySelector(".atlas2-rail-pin");
      const kids = [...track.children].map((e) => e.className).filter((k) => !/atlas2-rail-(pin|mag)/.test(k));
      const canvases = track.querySelectorAll("canvas").length, ticks = document.querySelectorAll(".atlas2-rail-ticks, .atlas2-rail-tick, [class*='rail-tick']").length;
      const cs = getComputedStyle(track, "::before"), line = cs.content !== "none" && cs.borderTopWidth !== "0px";
      const ys = c.changeYears(); const y0 = c.year();
      return { kids, canvases, ticks, api: typeof c.railTicks, line, years: ys.length, pinW: pin.getBoundingClientRect().width, year: y0 };
    });
    check(`${tag}: the rail draws no ticks — no canvas and no tick element in the track, nothing but the pin and the magnifier, the track a plain line`, tk.canvases === 0 && tk.ticks === 0 && tk.kids.length === 0 && tk.api === "undefined" && tk.line, JSON.stringify(tk));
    // the ink along the track, read off a screenshot of it: every column with a dark pixel lies within the pin's own width (the line is lighter than the ink)
    const strip = await page.$eval(".atlas2-rail-track", (e) => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
    const png = await page.screenshot({ clip: { x: strip.x, y: strip.y, width: strip.w, height: strip.h } });
    const dark = await C(page, async ({ b64, w0, h0 }) => { const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode(); const cv = document.createElement("canvas"); cv.width = img.width; cv.height = img.height; const x = cv.getContext("2d"); x.drawImage(img, 0, 0); const d = x.getImageData(0, 0, cv.width, cv.height).data; const cols = []; for (let i = 0; i < cv.width; i++) { let dk = 0; for (let j = 0; j < cv.height; j++) { const o = (j * cv.width + i) * 4; if (d[o] + d[o + 1] + d[o + 2] < 3 * 140 && d[o + 3] > 200) dk++; } if (dk >= 3) cols.push(i / (cv.width / w0)); } return { cols, w: w0, h: h0 }; }, { b64: png.toString("base64"), w0: strip.w, h0: strip.h });
    const pinX = await page.$eval(".atlas2-rail-pin", (e, sx) => { const r = e.getBoundingClientRect(); return [r.left - sx, r.right - sx]; }, strip.x);
    const stray = dark.cols.filter((x) => x < pinX[0] - 1 || x > pinX[1] + 1);
    check(`${tag}: no vertical ink along the track outside the pin (${dark.cols.length} dark columns, all within the pin at ${pinX.map(Math.round).join("–")} px)`, stray.length === 0, stray.length ? "stray dark columns at " + stray.slice(0, 12).map(Math.round).join(", ") + " px" : "");
    // the change years are still data: [ and ] jump between them
    const jump = await (async () => { await page.focus(".atlas2-rail-pin"); const y0 = await C(page, () => document.querySelector(".atlas2").__atlas2.year()); const ys = await C(page, () => document.querySelector(".atlas2").__atlas2.changeYears()); await page.keyboard.press("]"); const y1 = await C(page, () => document.querySelector(".atlas2").__atlas2.year()); await page.keyboard.press("["); const y2 = await C(page, () => document.querySelector(".atlas2").__atlas2.year()); const next = ys.find((y) => y > y0); return { y0, y1, y2, next, n: ys.length }; })();
    check(`${tag}: the change years stay as data (${jump.n} on screen) and ] and [ still jump to the next and back`, jump.n > 5 && jump.y1 === jump.next && jump.y2 < jump.y1 && jump.y2 <= jump.y0, JSON.stringify(jump));
    await C(page, (y) => document.querySelector(".atlas2").__atlas2.setYear(y), 1);
    await C(page, () => document.querySelector(".atlas2").__atlas2.select("pol:rome")); await sleep(300);
    const m1 = await measure();
    const bad1 = m1.ctrls.filter((c) => !inside(c, m1.row) || !inside(c, m1.host));
    check(`${tag}: with Rome's card open the rail keeps its width and every control`, bad1.length === 0 && m1.overflow <= 0 && (m1.row.r - m1.row.x) >= (m0.row.r - m0.row.x) - 2, `row ${Math.round(m1.row.r - m1.row.x)} px (was ${Math.round(m0.row.r - m0.row.x)})` + (bad1.length ? "; outside: " + bad1.map((c) => c.sel).join(" ") : ""));
    errorsAll.push(...errors); await page.close(); await context.close();
  }

  console.log("\n\x1b[1m3) every year carries its era\x1b[0m\n");
  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    await context.addInitScript(() => { try { localStorage.setItem("folio.atlas2.study", "map"); } catch (e) {} });   // the plain Map: this suite reads the base map's names and faces with no cards seeded, and the Atlas opens on Personal by default since Oct 2026, where nothing undiscovered is drawn (decision a, 2026-10-18)
    const { page, errors } = await open(context, "#map/12.5/41.9/5?y=1", false);
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
