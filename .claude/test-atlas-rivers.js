/* test-atlas-rivers.js — THE RIVERS ARE VISIBLE IN A DARK THEME: drawn at every zoom when the layer is on, in a colour that stands out against the
   land and the sea (2026-10-18, the owner's sixth look at the Atlas on a phone; the owner's later word: "never mind about the river thickness,
   return it to what it was previously; instead, make rivers in dark mode a somewhat lighter colour to help them stand out").

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-rivers.js [--report] [--palette-only]

   THE FAULT IT WAS WRITTEN FOR: in a dark theme a river was the ocean mixed a quarter toward the paper — 1.17:1 against the land and 1.18:1 against
   the sea on folio's night (measured off the palette on 2026-10-18 before the change), so the lines were there and could not be seen. Now the dark
   river is THE COLOUR OF ITS OWN NAME — the water names' pale blue (`waterInk` in readPalette; #7eb6e4 on folio's night: 6.7:1 against the land,
   4.8:1 against the sea, 115 RGB units from the border grey), the owner's third word after "a somewhat lighter colour" and "still light blue, not
   indistinguishable from country borders" (a lightening toward white, and then the sea's hue pulled to the accent, came before it). The width
   is the renderer's 0.8 CSS px in both themes, as before; the light theme's colour (v1's deeper blue) is unchanged.

   HOW IT MEASURES (nothing read from the page's own palette): the frame with rivers on against the frame with them off, read from the renderer's own
   context in one task (as test-atlas-zoom-layers.js reads them), at device scale 2. Along every row and every column, a run of pixels the river changed
   is a crossing; a crossing is kept where the line is steep against that row (the vertical run at least three times the horizontal; the symmetric rule
   for columns), its peak is the river's own colour (half the frame's largest difference — a sliver from under a lake shore or a coast stroke, a line
   fading into the limb, is not one) and the ground under it is one colour with the layer off (a border drawn over a river's middle where it follows
   one, a coast or a shore under it, are not). The contrast is the WCAG ratio between the river's pixel at the crossing's peak and the ground pixel under
   it with the layer off; the 5th percentile must reach 3:1 in a dark theme (a crossing over a stroke is the ground's own low) and 2.5:1 in a light one
   (v1's blue reads 3.6:1 on folio and 2.74:1 on gazette's grey-cream land, both unchanged). The widths are measured the same way (the run's width at half
   its peak, over the five rows around it, times the sine of the line's angle) and REPORTED, not gated: the owner withdrew the width rule.

   WHAT IT PROVES
     1  WebGL2, light and night, at the globe (24 km/px), Europe (3 km/px) and the cap (0.15 km/px): rivers draw pixels at all three and the contrast
        meets the rule
     2  Canvas 2D (--disable-webgl), light and night, at the globe and its own cap: the same
     3  no console error
   Re-run after touching the river colour (atlas.js readPalette) or the river draw (atlas-gl.js arcUniforms, atlas-canvas.js). */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const REPORT = process.argv.includes("--report");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream" };
const PORT = 5652;
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  — " + extra : "")); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const MIN_CONTRAST = { light: 2.5, night: 3 };
const VIEWS = [["the globe", 10, 20, 24], ["Europe", 10, 50, 3], ["the cap, the Danube at Vienna", 16.37, 48.2, 0.15]];

async function open(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  await ctx.addInitScript(`localStorage.setItem("folio_tour_v1","1");localStorage.setItem("folio_atlas_tour_v1","1");`);
  await ctx.addInitScript(() => { try { localStorage.setItem("folio.atlas2.study", "map"); } catch (e) {} });   // the plain Map: the river is measured against the plain land; in the Personal Atlas (the default since Oct 2026) an undiscovered country is the darker empty land, present day included (2026-10-18)
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  await page.goto(`http://127.0.0.1:${PORT}/#map`, { waitUntil: "load" });
  await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 120000 });
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setLayers({ rivers: true, lakes: true, relief: false, borders: true, countries: false, places: false, physical: false, cities: false }));
  return { ctx, page, errors };
}
const settled = (page) => page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2, s = c.statsNow(); return c.tilesSettled() && c.waterSettled() && s.waterPending === 0; }, null, { timeout: 120000 }).then(() => true, () => false);
const theme = async (page, night) => { await page.evaluate((n) => document.body.classList.toggle("night", n), night); await sleep(400); };
const state = (page) => page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2, s = c.statsNow(); return { k: c.kmPerPx(), level: s.level, mode: s.mode, riversOn: s.riversOn, riverSegments: c.renderer.stats().riverSegments }; });

/* the measurement, in the page: { changed, n, w: [p10, p20, p50, p90], c: [p5, p50], dpr } */
const measure = (page) => page.evaluate(() => new Promise((resolve) => {
  const c = document.querySelector(".atlas2").__atlas2, R = c.renderer, cv = document.querySelector(".atlas2-canvas");
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  let W = 0, H = 0;
  const read = () => {
    if (R.gl) { W = R.gl.drawingBufferWidth; H = R.gl.drawingBufferHeight; const px = new Uint8Array(W * H * 4); R.gl.readPixels(0, 0, W, H, R.gl.RGBA, R.gl.UNSIGNED_BYTE, px); return px; }
    const x = cv.getContext("2d"); W = cv.width; H = cv.height; return x.getImageData(0, 0, W, H).data;
  };
  const frame = (on, cb) => { c.setLayers({ rivers: on }); c.invalidate(); requestAnimationFrame(() => requestAnimationFrame(() => { R.render(c.view); cb(read()); })); };
  frame(true, (a) => frame(false, (b) => {
    c.setLayers({ rivers: true });
    const n = W * H, d = new Uint8Array(n); let changed = 0, dmax = 0;
    for (let i = 0; i < n; i++) { const j = 4 * i; const v = Math.max(Math.abs(a[j] - b[j]), Math.abs(a[j + 1] - b[j + 1]), Math.abs(a[j + 2] - b[j + 2])); d[i] = v; if (v) changed++; if (v > dmax) dmax = v; }
    const lo = Math.max(6, dmax * 0.1);   // a pixel the river touched at all
    const core = dmax * 0.5;   // a crossing whose peak is the river's own colour over the ground: a sliver poking from under a lake's shore or a coast stroke, or a line fading into the limb, peaks lower and is not a crossing of the line
    const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    const L = (p, j) => 0.2126 * lin(p[j]) + 0.7152 * lin(p[j + 1]) + 0.0722 * lin(p[j + 2]);
    const widths = [], contrasts = [];
    /* the width of the run through pixel i along `step` (1: this row; W: this column) at half the run's own peak — and the LINE's width at a crossing is the
       largest such width over the five neighbouring rows (or columns) along it: a row where a lake's edge, a dash gap or a line's rounded end cuts the run short
       reads its neighbours' full width, as a genuinely thin line cannot */
    const fwhm = (i, step) => { const rowStart = step === 1 ? i - (i % W) : i % W, rowEnd = step === 1 ? rowStart + W : rowStart + W * H; let s0 = i; while (s0 - step >= rowStart && d[s0 - step] >= lo) s0 -= step; let e0 = i; while (e0 + step < rowEnd && d[e0 + step] >= lo) e0 += step; let pk = 0; for (let t = s0; t <= e0; t += step) if (d[t] > pk) pk = d[t]; let f = 0; for (let t = s0; t <= e0; t += step) if (d[t] >= pk * 0.5) f++; return (e0 - s0) / step > 12 ? 0 : f; };
    const lineWidth = (pi, step, across) => { let best = 0; for (let k = -2; k <= 2; k++) { const t = pi + k * across; if (t < 0 || t >= n || d[t] < lo) continue; best = Math.max(best, fwhm(t, step)); } return best; };
    // the ground under a crossing must be ONE colour with the layer off: where a border follows a river (the Oder, the lower Danube) the border is drawn
    // over the river's middle in both frames and the diff shows two slivers; a coast or a lake shore under the crossing is the same. Such a crossing is not one
    const uniform = (i0, step, count) => { let mn = [255, 255, 255], mx = [0, 0, 0]; for (let k = 0; k < count; k++) { const j = 4 * (i0 + k * step); if (j < 0 || j >= b.length) return false; for (let ch = 0; ch < 3; ch++) { if (b[j + ch] < mn[ch]) mn[ch] = b[j + ch]; if (b[j + ch] > mx[ch]) mx[ch] = b[j + ch]; } } return mx[0] - mn[0] <= 24 && mx[1] - mn[1] <= 24 && mx[2] - mn[2] <= 24; };
    // horizontal runs (rows): a crossing of a steep line
    for (let y = 1; y < H - 1; y++) for (let x = 0; x < W;) {
      const i = y * W + x; if (d[i] < lo) { x++; continue; }
      let e = x; while (e < W && d[y * W + e] >= lo) e++;
      const raw = e - x; if (raw <= 12) {
        let peak = 0, pi = i; for (let t = x; t < e; t++) { const v = d[y * W + t]; if (v > peak) { peak = v; pi = y * W + t; } }
        let up = 0, down = 0; for (let t = pi - W; t >= 0 && d[t] >= lo && up < 40; t -= W) up++; for (let t = pi + W; t < n && d[t] >= lo && down < 40; t += W) down++;
        const rv = up + down + 1;
        if (rv >= 3 * raw && peak >= core && uniform(y * W + x - 1, 1, raw + 2)) {
          const f = lineWidth(pi, 1, W);
          const sin = rv / Math.hypot(rv, raw);
          widths.push(f * sin / dpr);
          const cr = (L(a, 4 * pi) + 0.05) / (L(b, 4 * pi) + 0.05); contrasts.push(cr >= 1 ? cr : 1 / cr);
        }
      }
      x = e;
    }
    // vertical runs (columns): a crossing of a flat line
    for (let x = 1; x < W - 1; x++) for (let y = 0; y < H;) {
      const i = y * W + x; if (d[i] < lo) { y++; continue; }
      let e = y; while (e < H && d[e * W + x] >= lo) e++;
      const raw = e - y; if (raw <= 12) {
        let peak = 0, pi = i; for (let t = y; t < e; t++) { const v = d[t * W + x]; if (v > peak) { peak = v; pi = t * W + x; } }
        let left = 0, right = 0; for (let t = pi - 1; t % W !== W - 1 && t >= 0 && d[t] >= lo && left < 40; t--) left++; for (let t = pi + 1; t % W !== 0 && t < n && d[t] >= lo && right < 40; t++) right++;
        const rh = left + right + 1;
        if (rh >= 3 * raw && peak >= core && uniform((y - 1) * W + x, W, raw + 2)) {
          const f = lineWidth(pi, W, 1);
          const cos = rh / Math.hypot(rh, raw);
          widths.push(f * cos / dpr);
          const cr = (L(a, 4 * pi) + 0.05) / (L(b, 4 * pi) + 0.05); contrasts.push(cr >= 1 ? cr : 1 / cr);
        }
      }
      y = e;
    }
    const pct = (arr, p) => { if (!arr.length) return 0; const s = arr.slice().sort((u, v) => u - v); return s[Math.min(s.length - 1, Math.floor(p / 100 * s.length))]; };
    resolve({ changed, n: widths.length, dpr, w: [pct(widths, 10), pct(widths, 20), pct(widths, 50), pct(widths, 90)], c: [pct(contrasts, 5), pct(contrasts, 50)] });
  }));
}));

async function run(browser, still) {
  const { ctx, page, errors } = await open(browser);
  const rows = [];
  for (const night of [false, true]) {
    const th = night ? "night" : "light";
    await theme(page, night);
    for (const [name, lon, lat, k] of VIEWS) {
      await page.evaluate((v) => document.querySelector(".atlas2").__atlas2.setView(v[0], v[1], v[2]), [lon, lat, k]);
      const ok = await settled(page); await sleep(200);
      const st = await state(page);
      if (still && rows.some((r) => r.th === th && Math.abs(r.st.k - st.k) < 1e-6)) continue;   // the still view's cap is coarser: the same view again
      const m = await measure(page);
      rows.push({ th, name, st, m, ok });
      const where = `${still ? "Canvas 2D" : "WebGL2"}, ${th}, ${name} (${st.k.toFixed(3)} km/px, level ${st.level})`;
      check(`${where}: rivers drawn`, m.changed > 0 && st.riversOn && st.riverSegments > 0, `${m.changed} px changed, ${st.riverSegments} segments${ok ? "" : ", NOT settled"}`);
      check(`${where}: at least ${MIN_CONTRAST[th]}:1 against the ground (5th percentile of ${m.n} crossings ${m.c[0].toFixed(2)}, median ${m.c[1].toFixed(2)}; width p20 / p50 ${m.w[1].toFixed(2)} / ${m.w[2].toFixed(2)} CSS px, reported)`, m.n >= 30 && m.c[0] >= MIN_CONTRAST[th]);
    }
  }
  if (REPORT) { console.log(`\n  ${still ? "Canvas 2D" : "WebGL2"}: theme | view | km/px | level | segments | px changed | crossings | width p10 p20 p50 p90 (CSS px) | contrast p5 p50`); for (const r of rows) console.log(`  ${r.th} | ${r.name} | ${r.st.k.toFixed(3)} | ${r.st.level} | ${r.st.riverSegments} | ${r.m.changed} | ${r.m.n} | ${r.m.w.map((v) => v.toFixed(2)).join(" ")} | ${r.m.c.map((v) => v.toFixed(2)).join(" ")}`); }
  const unexpected = errors.filter((e) => !/favicon/.test(e));
  check(`${still ? "Canvas 2D" : "WebGL2"}: no page errors`, unexpected.length === 0, unexpected.slice(0, 3).join(" | "));
  await ctx.close();
}

/* 3) THE NIGHT RIVER'S COLOUR (2026-10-19, the owner: "in dark mode, reduce the brightness of the rivers somewhat; they are a little too light blue now"): from the palette the page
   draws with, not from pixels. The river is the water names' pale blue (#7eb6e4, 6.7:1 against the land) scaled to 80 % of its relative luminance with its hue kept (every linear-light
   channel times the same factor), and still at least 3:1 against the dark land and the dark sea; the names keep #7eb6e4; the light theme's river is unchanged. */
const lin = (v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
const lum = (c) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
const cr = (a, b) => { const x = lum(a) + 0.05, y = lum(b) + 0.05; return x > y ? x / y : y / x; };
const hex = (c) => "#" + c.map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("");
async function palettes(browser) {
  const { ctx, page, errors } = await open(browser);
  const out = {};
  for (const night of [false, true]) {
    await theme(page, night);
    out[night ? "night" : "light"] = await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2, p = c.palette(); return { river: Array.from(p.river), waterInk: Array.from(p.waterInk), ocean: Array.from(p.ocean), land: Array.from(p.land), water: c.colours().water }; });
  }
  await ctx.close();
  const n = out.night, l = out.light, ratio = lum(n.river) / lum(n.waterInk);
  const hue = [0, 1, 2].map((k) => lin(n.river[k]) / lin(n.waterInk[k]));
  console.log(`  night river ${hex(n.river)} (was ${hex(n.waterInk)}): luminance ${lum(n.river).toFixed(4)} against ${lum(n.waterInk).toFixed(4)}, x${ratio.toFixed(3)}; against the land ${cr(n.river, n.land).toFixed(2)}:1, against the sea ${cr(n.river, n.ocean).toFixed(2)}:1`);
  check("night: the river has about 80 % of the names' luminance (0.78 to 0.82 of #7eb6e4's)", ratio > 0.78 && ratio < 0.82, `x${ratio.toFixed(3)}`);
  check("night: the hue is kept (the three linear channels scale by one factor)", Math.max.apply(null, hue) - Math.min.apply(null, hue) < 0.01, hue.map((v) => v.toFixed(3)).join(" "));
  check("night: the river is at least 3:1 against the dark land and the dark sea", cr(n.river, n.land) >= 3 && cr(n.river, n.ocean) >= 3, `land ${cr(n.river, n.land).toFixed(2)}, sea ${cr(n.river, n.ocean).toFixed(2)}`);
  check("night: the river names' own colour is unchanged (#7eb6e4)", n.water === "#7eb6e4" && hex(n.waterInk) === "#7eb6e4", n.water + " / " + hex(n.waterInk));
  check("light: the river is unchanged (#1f7aaa) and not the names' ink", hex(l.river) === "#1f7aaa" && hex(l.waterInk) !== "#1f7aaa", hex(l.river));
  const unexpected = errors.filter((e) => !/favicon/.test(e));
  check("palette: no page errors", unexpected.length === 0, unexpected.slice(0, 3).join(" | "));
}

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  if (!process.argv.includes("--palette-only")) {
    console.log("\n\x1b[1m1) WebGL2: the rivers at the globe, Europe and the cap, light and night\x1b[0m\n");
    const browser = await chromium.launch(LAUNCH);
    await run(browser, false);
    await browser.close();
    console.log("\n\x1b[1m2) Canvas 2D (no WebGL2): the same at the still view's own zooms\x1b[0m\n");
    const b2 = await chromium.launch(Object.assign({}, LAUNCH, { args: ["--disable-webgl"] }));
    await run(b2, true);
    await b2.close();
  }
  console.log("\n\x1b[1m3) The night river's colour against the names' pale blue\x1b[0m\n");
  const b3 = await chromium.launch(LAUNCH);
  await palettes(b3);
  await b3.close();
  server.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
