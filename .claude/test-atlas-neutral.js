/* test-atlas-neutral.js — the history in one neutral fill (2026-10-18; the owner: "historical polities and peoples are still displayed in varying
   colours instead of one shared neutral colour"; docs/atlas.md §2, docs/atlas-v2-design.md §7 "One neutral fill").

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-neutral.js
     FOLIO_CHROMIUM=/path/to/chrome

   WHAT IT PROVES, off the GL canvas's own pixels (names are on their own canvas and are switched off anyway; relief off; wars off):
     1  ONE FILL FOR EVERY STATE: at Europe in 1500 (6 km/px) at least six states of the year, each read at a point the ID pass puts inside it on a flat
        3 × 3 window, sample to the SAME colour (±1 per channel), and that colour is the land's; the controller's own list (`fillAudit`) says every alive
        state's fill is the land colour. A PEOPLE (the Scythians over the Black Sea, 450 BCE) is handed to the renderer in the same neutral ink as every
        other people (`probeAt().peopleFill`), and its pixels are that ink's stipple over the land: the per-channel darkening at every sampled pixel
        agrees across the channels (an achromatic ink multiplied over the land), where a hue would pull one channel apart from the others.
   Before the change the states sampled to sixteen golden-angle hues, and each people had a hue of its own. */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");
const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream", ".woff2": "font/woff2" };
const PORT = 5658;
const requests = [];
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  requests.push(p);
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  — " + extra : "")); } };
const sect = (t) => console.log("\n\x1b[1m" + t + "\x1b[0m\n");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TOURS = `localStorage.setItem("folio_tour_v1","1");localStorage.setItem("folio_atlas_tour_v1","1");localStorage.setItem("folio_library_tour_v1","1");localStorage.setItem("folio_mine_tour_v1","1");`;
const A = (page, fn, arg) => page.evaluate(`(() => { const c = document.querySelector(".atlas2").__atlas2; return (${fn.toString()})(c, ${JSON.stringify(arg === undefined ? null : arg)}); })()`);
const errors = [];

async function openAtlas(browser, vp, night) {
  const ctx = await browser.newContext({ viewport: { width: vp[0], height: vp[1] }, isMobile: vp[0] < 700, hasTouch: vp[0] < 700, deviceScaleFactor: vp[0] < 700 ? 2 : 1 });
  await ctx.addInitScript(TOURS + (night ? `localStorage.setItem("folio_v1", JSON.stringify({ cards: {}, settings: { night: true, themeAuto: false, theme: "folio" } }));` : ""));
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text()) && !/GL_INVALID|WebGL/.test(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  await page.goto(`http://127.0.0.1:${PORT}/#map`, { waitUntil: "load" }); await page.reload({ waitUntil: "load" });
  await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 180000 });
  await A(page, (c) => { c.setLayers({ rivers: false, lakes: false, relief: false, countries: false, places: false, physical: false, cities: false, provinces: false, wars: "off", fronts: false, peoples: "all" }); if (c.study && c.study.setMode) c.study.setMode("map"); c.ensureHistory(); });
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.historyStarted() && c.historyReady(); }, null, { timeout: 180000 });
  return { ctx, page };
}
const settle = (page) => page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.tilesSettled() && c.waterSettled() && c.historySettled(); }, null, { timeout: 120000 }).then(() => true, () => false);
async function viewAt(page, lon, lat, kmpp, year) { await A(page, (c, v) => { c.setView(v[0], v[1], v[2]); c.setYear(v[3]); }, [lon, lat, kmpp, year]); await settle(page); await sleep(600); }
/* the GL canvas's pixels (device px) as an ImageData-like {w, h, d}; the labels are on another canvas */
async function pixels(page) {
  const b64 = (await (await page.$(".atlas2-canvas")).screenshot()).toString("base64");
  return page.evaluate(async (b64) => { const im = new Image(); im.src = "data:image/png;base64," + b64; await im.decode(); const c = document.createElement("canvas"); c.width = im.width; c.height = im.height; const g = c.getContext("2d", { willReadFrequently: true }); g.drawImage(im, 0, 0); window.__px = { w: c.width, h: c.height, d: g.getImageData(0, 0, c.width, c.height).data }; return { w: c.width, h: c.height }; }, b64);
}
/* a grid of CSS points over the frame (clear of the chrome), each with what the ID pass says is there (`probeAt`: one or two ID-pass renders, tens of ms each on
   software GL — so the grid is coarse) and the 3 × 3 device-pixel window around it when that window is one flat colour (±1) */
const scan = (page, step) => page.evaluate((step) => {
  const c = document.querySelector(".atlas2").__atlas2, [W, H] = c.frame(), px = window.__px, k = px.w / W, out = [];
  const chrome = (c.study && c.study.layoutChrome ? c.study.layoutChrome() : []);   // the controls over the canvas (the search box, the study panel, the rail): an element screenshot shows them
  const inChrome = (x, y) => chrome.some((r) => x >= r[0] - 8 && x <= r[2] + 8 && y >= r[1] - 8 && y <= r[3] + 8);
  for (let y = 80; y < H - 120; y += step) for (let x = 20; x < W - 20; x += step) {
    if (inChrome(x, y)) continue;
    const p = c.probeAt(x, y); if (!p || !p.land) continue;
    const cx = Math.round(x * k), cy = Math.round(y * k); if (cx < 2 || cy < 2 || cx >= px.w - 2 || cy >= px.h - 2) continue;
    const i0 = 4 * (cy * px.w + cx), rgb = [px.d[i0], px.d[i0 + 1], px.d[i0 + 2]]; let flat = true;
    for (let dy = -1; dy <= 1 && flat; dy++) for (let dx = -1; dx <= 1; dx++) { const i = 4 * ((cy + dy) * px.w + cx + dx); if (Math.abs(px.d[i] - rgb[0]) > 1 || Math.abs(px.d[i + 1] - rgb[1]) > 1 || Math.abs(px.d[i + 2] - rgb[2]) > 1) { flat = false; break; } }
    out.push(Object.assign({ x, y, rgb, flat }, p));
  }
  return out;
}, step);
const ofKind = (rows, want) => rows.filter((row) => want === "state" ? (row.state && row.kind === "polity" && !row.people) : want === "people" ? (row.people && !row.state) : want === "empty" ? (!row.state && !row.people) : true);
/* the pixels of the blocks between grid points that are INSIDE a people's ground (the point and its four grid neighbours all say that people, no state): thousands of pixels for a handful of probes */
const blocks = (page, rows, step) => page.evaluate(([rows, step]) => {
  const c = document.querySelector(".atlas2").__atlas2, [W] = c.frame(), px = window.__px, k = px.w / W, key = new Map(rows.map((r) => [r.x + "," + r.y, r]));
  const out = [];
  for (const r of rows) {
    const nb = [[step, 0], [-step, 0], [0, step], [0, -step]].map(([dx, dy]) => key.get((r.x + dx) + "," + (r.y + dy)));
    if (!nb.every((q) => q && q.people === r.people && !q.state)) continue;
    const x0 = Math.round((r.x - step / 2) * k), y0 = Math.round((r.y - step / 2) * k), x1 = Math.round((r.x + step / 2) * k), y1 = Math.round((r.y + step / 2) * k);
    for (let y = y0; y < y1; y += 2) for (let x = x0; x < x1; x += 2) { const i = 4 * (y * px.w + x); out.push([px.d[i], px.d[i + 1], px.d[i + 2]]); }
  }
  return out;
}, [rows, step]);
const near = (a, b, t) => a.every((v, i) => Math.abs(v - b[i]) <= t);

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch(LAUNCH);

  sect("1) one neutral fill for every state, and one neutral ink for every people's stipple");
  {
    const { ctx, page } = await openAtlas(browser, [960, 640], false);
    await viewAt(page, 10, 47, 6, 1500);   // 6 km/px: Iberia to Poland, Britain to Sicily — a dozen states of the year
    const land = await A(page, (c) => c.palette().land.map((v) => Math.round(v * 255)));
    await pixels(page);
    const rows = ofKind(await scan(page, 30), "state").filter((r) => r.flat);
    const byState = new Map(); for (const r of rows) if (!byState.has(r.state)) byState.set(r.state, r);
    const states = [...byState.values()];
    check(`Europe in 1500: at least six states of the year read on a flat window (${states.length}: ${states.slice(0, 8).map((s) => s.state).join(", ")})`, states.length >= 6);
    const first = states.length ? states[0].rgb : land;
    const same = states.filter((s) => near(s.rgb, first, 1));
    check(`...and every one samples to the SAME colour (±1 per channel): ${same.length} of ${states.length}`, states.length >= 6 && same.length === states.length, states.map((s) => s.state + " " + s.rgb.join(",")).join("; "));
    check(`...which is the land colour ${land.join(",")} (the fill at its alpha over the land is the land)`, states.length >= 6 && states.every((s) => near(s.rgb, land, 1)), first.join(","));
    const audit = await A(page, (c) => c.fillAudit());
    check(`the controller hands the renderer the land colour for every alive state (${audit.same} of ${audit.entities})`, audit.entities >= 6 && audit.same === audit.entities, audit.differing.slice(0, 5).join(", "));
    // a people: the Scythians over the Black Sea, 450 BCE (peoples "all")
    await viewAt(page, 34, 45, 4, -450);
    await pixels(page);
    const all1 = await scan(page, 24), pplRows = ofKind(all1, "people");
    const byP = new Map(); for (const r of pplRows) { let l = byP.get(r.people); if (!l) byP.set(r.people, l = []); l.push(r); }
    const ppl = await blocks(page, pplRows, 24);
    check(`the Black Sea in 450 BCE: a people's ground is on screen (${[...byP.keys()].join(", ")}; ${pplRows.length} grid points, ${ppl.length} pixels inside)`, ppl.length >= 200);
    const inks = [...new Set(pplRows.map((r) => r.peopleFill.map((v) => Math.round(v * 255)).join(",")))];
    check(`every people is handed to the renderer in ONE neutral ink (${inks.join(" / ")})`, pplRows.length > 0 && inks.length === 1);
    const ink = pplRows.length ? pplRows[0].peopleFill : [0.5, 0.5, 0.5];
    // the stipple is that ink multiplied over the land: px = land · (1 − a·(1 − ink)) per channel, so a = (1 − px/land) / (1 − ink) is one number for the three channels
    const dotted = ppl.filter((q) => q.some((v, i) => v < land[i] - 12));   // the pixels a dot or the wash darkened
    const spread = dotted.map((q) => { const a = q.map((v, i) => (1 - v / land[i]) / Math.max(0.05, 1 - ink[i])); return Math.max(...a) - Math.min(...a); });
    const off = spread.filter((sp) => sp > 0.14).length;
    check(`...and its pixels are that ink over the land, achromatic: the per-channel darkening agrees at ${dotted.length - off} of ${dotted.length} darkened pixels (spread ≤ 0.14)`, dotted.length >= 50 && off <= Math.ceil(dotted.length * 0.05), `worst spread ${spread.length ? Math.max(...spread).toFixed(2) : "-"}`);
    await ctx.close();
  }

  check("no console or page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  await browser.close(); server.close();
  console.log(`\n${pass} ok, ${fail} failed\n`); process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
