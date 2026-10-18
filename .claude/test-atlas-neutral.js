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
     2  THE EMPTY LAND IS HALF AS BRIGHT (the owner: "areas of the map that do not have any states or peoples or anything should be 50 % darker, like in
        Atlas v1"): at Europe in 1500, light theme and folio's night, every flat window of land the ID pass puts under NO state and NO people reads at
        half the land's luminance (HIST_DIM = 0.5, ±3 %) while a state's reads at the land's; under a people (the Scythians, 450 BCE) the ground
        between the dots is NOT darkened (the brightest quarter of its pixels is the land); in the present day nothing darkens (every land window, the
        Antarctic included, is the land); and in every light theme a name over the darker land keeps its contrast — the ink on its paper halo ≥ 7:1, the halo on the
        darker land ≥ 3:1 (`contrastAudit`; the ink against the darker land itself is reported: 2.9–3.7:1 at half the luminance).
     3  RELIEF IN THE CARD WINDOWS FOLLOWS THE ATLAS (the owner: "if relief is turned on in the personal Atlas, it should also be on in the Atlas windows, at the
        opacity the user set"): with the Atlas's saved layers saying relief on, a map card's window (geo-002) fetches the relief files and its land pixels carry the
        hillshade (they differ from the same window drawn with relief off); with it off nothing of the relief is requested and the two draws are the same; at strength
        1 the shade is stronger than at 0.4; a window that is open when the setting changes (the `atlas2:layers` event the Atlas sends) redraws with relief; Find it
        never fetches the relief, whatever the setting says.
   Before the change the states sampled to sixteen golden-angle hues, each people had a hue of its own, empty land was the land, and a window had no relief. */
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
  if (typeof c.probeAt !== "function") return out;   // a build before 2026-10-18 has no probe: every check below then fails on an empty scan instead of throwing
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
    const audit = await A(page, (c) => (c.fillAudit ? c.fillAudit() : { entities: 0, same: 0, differing: [] }));
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

  sect("2) the land no state or people covers is half as bright; a state's, a people's and the present day's are not");
  for (const night of [false, true]) {
    const th = night ? "folio night" : "folio light";
    const { ctx, page } = await openAtlas(browser, [960, 640], night);
    const land = await A(page, (c) => c.palette().land.map((v) => Math.round(v * 255)));
    const lum = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2], landL = lum(land);
    await viewAt(page, 10, 50, 3, 1500);
    await pixels(page);
    const all2 = await scan(page, 30), empty = ofKind(all2, "empty").filter((r) => r.flat), states = ofKind(all2, "state").filter((r) => r.flat);
    const ratios = empty.map((r) => lum(r.rgb) / landL), offE = ratios.filter((q) => Math.abs(q - 0.5) > 0.03).length;
    check(`${th}, Europe in 1500: ${empty.length} flat windows of empty land (≥ 20)`, empty.length >= 20);
    check(`${th}: every one reads at half the land's luminance (0.5 ± 0.03): ${empty.length - offE} of ${empty.length}`, empty.length >= 20 && offE === 0, ratios.length ? `min ${Math.min(...ratios).toFixed(3)} max ${Math.max(...ratios).toFixed(3)}` : "");
    const offS = states.filter((r) => !near(r.rgb, land, 1)).length;
    check(`${th}: a state's ground is still the land colour (${states.length - offS} of ${states.length} windows)`, states.length >= 6 && offS === 0);
    // under a people: the land between the dots
    await viewAt(page, 34, 45, 4, -450); await pixels(page);
    const pplRows2 = ofKind(await scan(page, 24), "people"), ppl = await blocks(page, pplRows2, 24);
    // the ground between the dots is the quarter the stipple touched least: the BRIGHTEST on a light theme (the pass multiplies: the wash alone, alpha 0.14 of the ink, takes
    // it to about 0.92 of the land) and the DARKEST on a dark one (the pass screens: nothing under a presence is darker than the land). The darkening pass would take it to 0.5.
    const sorted = ppl.map((q) => lum(q)).sort((a, b) => (night ? a - b : b - a)), quarter = sorted.slice(0, Math.max(1, Math.ceil(sorted.length / 4)));
    const qMean = quarter.reduce((p, q) => p + q, 0) / quarter.length;
    check(`${th}, the Scythians in 450 BCE: the ground between the stipple's dots is the land under its wash, not the darkened land (${night ? "darkest" : "brightest"} quarter of ${ppl.length} pixels at ${(qMean / landL).toFixed(3)} of the land; the darkening would give 0.5)`, ppl.length >= 200 && qMean / landL > (night ? 0.97 : 0.85) && qMean / landL <= (night ? 1.6 : 1.01));
    // the present day: nothing darkens, the Antarctic included
    for (const [name, lon, lat, k] of [["Europe", 10, 50, 3], ["the Antarctic", 0, -78, 12]]) {
      await viewAt(page, lon, lat, k, 2026); await pixels(page);
      const now = ofKind(await scan(page, 40), "empty").filter((r) => r.flat), offN = now.filter((r) => !near(r.rgb, land, 1)).length;
      check(`${th}, ${name} today: every flat land window is the land colour (${now.length - offN} of ${now.length})`, now.length >= 10 && offN === 0, offN ? now.filter((r) => !near(r.rgb, land, 1)).slice(0, 3).map((r) => r.rgb.join(",")).join(" ") : "");
    }
    if (!night) {
      const THEMES = ["academy", "amber", "amethyst", "aquamarine", "arcade", "bloodstone", "carnelian", "diamond", "emerald", "folio", "gazette", "jade", "marble", "ruby", "synth"];
      /* the names in a light theme are the ink on a PAPER halo (labelColours), so what a name reads against is its halo first and the ground second: the ink on the halo
         ≥ 7:1 and the halo on the darker land ≥ 3:1 (WCAG's floor for a text's own outline) in every theme. The ink against the darker land itself is REPORTED, not
         gated: at half the land's luminance it is 2.9–3.7:1 in the light themes (it would need the factor at about 0.65 to reach 4.5:1), which is the owner's call. */
      const contrast = await A(page, (c, ths) => { const out = []; for (const t of ths) { document.body.dataset.theme = t; const r = c.contrastAudit(); out.push({ theme: t, dim: r.dim, fill: r.fill, haloDim: r.haloDim, inkHalo: r.inkHalo }); } delete document.body.dataset.theme; return out; }, THEMES);
      const low = contrast.filter((r) => !(r.inkHalo >= 7) || !(r.haloDim >= 3) || !(r.fill >= 4.5));   // a missing figure (a build without the audit) fails, never passes
      check(`in every light theme a name over the darker land keeps its contrast: the ink on its halo ≥ 7:1 (lowest ${Math.min(...contrast.map((r) => r.inkHalo)).toFixed(2)}), the halo on the darker land ≥ 3:1 (lowest ${Math.min(...contrast.map((r) => r.haloDim)).toFixed(2)}), the ink on the fill ≥ 4.5:1 (lowest ${Math.min(...contrast.map((r) => r.fill)).toFixed(2)})`, low.length === 0, low.map((r) => `${r.theme} ${r.inkHalo.toFixed(2)} / ${r.haloDim.toFixed(2)}`).join("; "));
      console.log(`        reported, not gated: the ink against the darker land itself, ${Math.min(...contrast.map((r) => r.dim)).toFixed(2)}–${Math.max(...contrast.map((r) => r.dim)).toFixed(2)}:1 over the ${contrast.length} light themes`);
    }
    await ctx.close();
  }

  sect("3) relief in a card window follows the Atlas's switch and strength; Find it never draws it");
  {
    const LAYERS = (on, strength) => `localStorage.setItem("folio_atlas2_layers_v2", JSON.stringify({ relief: ${on}, strength: ${strength} }));`;
    const openCard = async (id, on, strength) => {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      await ctx.addInitScript(TOURS + LAYERS(on, strength));
      const page = await ctx.newPage();
      page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
      page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text()) && !/GL_INVALID|WebGL/.test(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
      const from = requests.length;
      await page.goto(`http://127.0.0.1:${PORT}/#card/${id}`, { waitUntil: "load" }); await page.reload({ waitUntil: "load" });
      await page.waitForFunction(() => { const h = document.querySelector(".map-card"); return h && h.getAttribute("data-map-engine") === "v2" && h._folioMap && h._folioMap.settled && h._folioMap.settled(); }, null, { timeout: 180000 }).catch(() => {});
      await sleep(800);
      return { ctx, page, from };
    };
    const winPixels = (page) => page.evaluate(() => { const c = document.querySelector(".map-card .mc-canvas"), d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; return { w: c.width, h: c.height, d: Array.from(d) }; });
    const reliefReqs = (from) => requests.slice(from).filter((u) => /atlas\/data\/relief\//.test(u));
    const differ = (a, b) => { let n = 0, sum = 0, tot = 0; for (let i = 0; i < a.d.length; i += 4) { if (a.d[i + 3] < 200 || b.d[i + 3] < 200) continue; tot++; const dd = Math.max(Math.abs(a.d[i] - b.d[i]), Math.abs(a.d[i + 1] - b.d[i + 1]), Math.abs(a.d[i + 2] - b.d[i + 2])); sum += dd; if (dd > 6) n++; } return { share: tot ? n / tot : 0, mean: tot ? sum / tot : 0, tot }; };
    const off1 = await openCard("geo-002", false, 0.7); const pOff1 = await winPixels(off1.page); const rOff1 = reliefReqs(off1.from);
    check(`relief off: the map card's window asks for none of the relief (${rOff1.length} requests under atlas/data/relief/)`, rOff1.length === 0, rOff1.slice(0, 3).join(" "));
    const off2 = await openCard("geo-002", false, 0.7); const pOff2 = await winPixels(off2.page); await off2.ctx.close();
    const same = differ(pOff1, pOff2);
    check(`...and two draws of it are the same picture (${(same.share * 100).toFixed(2)} % of pixels differ by more than 6)`, same.tot > 1000 && same.share < 0.005);
    const on = await openCard("geo-002", true, 1); const pOn = await winPixels(on.page); const rOn = reliefReqs(on.from);
    check(`relief on at strength 1: the window fetched the relief (${rOn.length} requests: ${rOn.slice(0, 4).map((u) => u.replace(/^.*relief\//, "")).join(", ")}${rOn.length > 4 ? "…" : ""})`, rOn.length >= 4 && rOn.some((u) => /relief\.json$/.test(u)) && rOn.some((u) => /L0\./.test(u)));
    const dOn = differ(pOff1, pOn);
    check(`...and its pixels carry the shade: ${(dOn.share * 100).toFixed(1)} % of the window differs from the relief-off draw by more than 6 (mean difference ${dOn.mean.toFixed(1)})`, dOn.share > 0.1);
    const on4 = await openCard("geo-002", true, 0.4); const pOn4 = await winPixels(on4.page); await on4.ctx.close();
    const dOn4 = differ(pOff1, pOn4);
    check(`at strength 0.4 the shade is weaker (mean difference ${dOn4.mean.toFixed(1)} against ${dOn.mean.toFixed(1)} at 1)`, dOn4.mean > 0.5 && dOn4.mean < dOn.mean * 0.8);
    await on.ctx.close();
    // a window that is open when the Atlas's setting changes follows it
    const fromLive = requests.length;
    await off1.page.evaluate((js) => { eval(js); window.dispatchEvent(new Event("atlas2:layers")); }, LAYERS(true, 0.8));
    await off1.page.waitForFunction(() => { const h = document.querySelector(".map-card"); return h && h._folioMap && h._folioMap.settled && h._folioMap.settled(); }, null, { timeout: 120000 }).catch(() => {});
    await sleep(1500);
    const pLive = await winPixels(off1.page); const dLive = differ(pOff1, pLive), rLive = reliefReqs(fromLive);
    check(`an open window follows the switch: after the Atlas's layers event it fetched the relief (${rLive.length} requests) and ${(dLive.share * 100).toFixed(1)} % of its pixels changed`, rLive.length >= 4 && dLive.share > 0.1);
    await off1.ctx.close();
    // Find it: never
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      await ctx.addInitScript(TOURS + LAYERS(true, 1));
      const page = await ctx.newPage(); const from = requests.length;
      await page.goto(`http://127.0.0.1:${PORT}/#findit`, { waitUntil: "load" }); await page.reload({ waitUntil: "load" });
      await page.waitForFunction(() => { const m = document.querySelector("#mapGame"); return m && !m.hidden && document.querySelector("#findit2") && document.querySelector("#mgQ").textContent.length > 3; }, null, { timeout: 180000 }).catch(() => {});
      await page.waitForFunction(() => { const h = [...document.querySelectorAll("*")].find((e) => e._finditApi); const w = h && h._finditApi.win(); return w && w.isSettled(); }, null, { timeout: 60000 }).catch(() => {});
      await sleep(1000);
      const r = reliefReqs(from);
      check(`Find it, with the Atlas's relief on: the board asks for none of the relief (${r.length} requests)`, r.length === 0, r.slice(0, 3).join(" "));
      await ctx.close();
    }
  }

  check("no console or page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  await browser.close(); server.close();
  console.log(`\n${pass} ok, ${fail} failed\n`); process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
