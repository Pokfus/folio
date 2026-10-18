/* test-atlas-halos.js — the width of the halo every label style paints on the Atlas, measured off the label canvas, per theme: no style's halo is
   wider than the ordinary place names' widest (Atlas v2, 2026-10-18, the owner's fifth look, decision b).

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-halos.js

   WHAT IT PROVES, in the light theme and in folio's night, at 2 device px per CSS px (a desktop 1280 × 800 at deviceScaleFactor 2), for a seeded
   reader in the Full Atlas:
     · for every label STYLE that is on the canvas (the capital / city / town, the water and river italics, the region and range capitals, the island,
       the country sizes and the polity names that share them, the people styles over the steppe in 375 CE with every people shown) the halo's visible width — the
       least horizontal reach of the opaque halo beyond the glyph's ink, over the rows of a name clear of other names and marks — is at most half of
       HALO_W_MAX (3.2 px: 1.6 px showing) plus an anti-aliased pixel, and at least 0.8 px (a halo IS painted);
     · the people styles' halo is the same as the city style's (±0.5 px) — the thick halo the owner saw was PEOPLE_HALO's 5.4 px, 2.7 showing;
     · the page's own table of widths (`haloWidths`) has every style and the selected name at or under the cap, at Medium and at the Huge Text size
       (the cap scales with the names).
   THE FAULT IT WAS WRITTEN FOR: "text labels for peoples have an unreasonably thick dark outline" — PEOPLE_HALO (5.4 px) against 2.6 / 3.2 for every
   other name; the selected name's 3.4 / 4 px also stood over the cap. On the code before, the people styles measure about 2.7–3.3 px and fail.
   Re-run after touching renderSprite, haloWidthFor, HALO_W / HALO_W_DARK / HALO_W_MAX, or a label style. */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");
const { loadCards } = require("./card-io.js");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream" };
const PORT = 5661;
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  — " + extra : "")); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const HALO_MAX = 3.2, AA = 0.75;   // the cap (CSS px of stroke) and the anti-aliased pixel a measurement may add at 2 device px per CSS px

const { cards } = loadCards();
const READER = cards.filter((c) => /^(rm|gr|wh)-/.test(c.id) && Array.isArray(c.places) && c.places.length).slice(0, 120).map((c) => c.id);
const seed = (ids) => `try { if (!localStorage.getItem("folio_v1_seeded")) { localStorage.setItem("folio_v1", JSON.stringify({ cards: Object.fromEntries(${JSON.stringify(ids)}.map((id, i) => [id, { due: Date.now() + 9e8, ivl: 9, ease: 2.5, status: "review", reps: 2, first: "2026-08-01" }])), settings: { newPerDay: 5 } })); localStorage.setItem("folio_v1_seeded", "1"); } } catch (e) {}`;
const A = (page, fn, arg) => page.evaluate(`(() => { const c = document.querySelector(".atlas2").__atlas2; return (${fn.toString()})(c, ${JSON.stringify(arg === undefined ? null : arg)}); })()`);
async function open(browser, theme) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  await ctx.addInitScript(seed(READER));
  await ctx.addInitScript(`localStorage.setItem("folio_tour_v1","1");localStorage.setItem("folio_atlas_tour_v1","1");`);
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  await page.goto(`http://127.0.0.1:${PORT}/#map`, { waitUntil: "load" });
  await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 120000 });
  if (theme === "dark") { await page.evaluate(() => document.body.classList.add("night")); await sleep(300); }
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.waterSettled() && c.labelsReady() && c.study.ready(); }, null, { timeout: 120000 });
  await A(page, (c) => c.study.setMode("full")); await sleep(300);
  return { ctx, page, errors };
}
async function view(page, lon, lat, k, year) {
  if (year != null) { await A(page, (c, y) => c.setYear(y), year); await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.year() >= 2000 || (c.historyOK && c.historyOK()); }, null, { timeout: 120000 }); }
  await page.evaluate(([a, b, c]) => document.querySelector(".atlas2").__atlas2.setView(a, b, c), [lon, lat, k]);
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.tilesSettled() && c.waterSettled(); }, null, { timeout: 120000 });
  for (let i = 0; i < 20; i++) { await page.evaluate(() => document.querySelector(".atlas2").__atlas2.layoutNow()); await sleep(300); if (year == null || year >= 2000 || (await A(page, (c) => c.historySettled && c.historySettled()))) break; }
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.layoutNow()); await sleep(400);
}
/* THE MEASUREMENT. For each drawn name clear of every other name and mark (their boxes grown by 8 px): over the rows of its box (grown by 6 px for the
   halo), the leftmost opaque pixel and the leftmost pixel of the TEXT colour (past 0.6 on the halo → text axis), and the same from the right; the halo's
   width is the reach at the 20th percentile of those rows — the least, less one odd row (where the glyph's edge is vertical the halo reaches exactly
   half the stroke beyond it; a slanted edge reaches farther) — in CSS px; a curved name is read the same way over its box. The style is the layout's own. */
const measure = (page) => A(page, (c) => {
  const col = c.colours(), cv = document.querySelector(".atlas2-labels"), x = cv.getContext("2d"), dpr = cv.width / c.frame()[0];   // device px per CSS px of the page's own frame width (the bitmap is cssW × the resolution; the element can be a few px wider)
  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const WATER = { sea: 1, ocean: 1, gulf: 1, strait: 1, lake: 1, river: 1 };
  const all = c.labelsLive().map((e) => ({ p: e.p, box: e.p.box ? [e.p.box[0] + e.dx, e.p.box[1] + e.dy, e.p.box[2] + e.dx, e.p.box[3] + e.dy] : null, rects: (e.p.rects || []).slice(0, e.p.marker ? -1 : undefined).map((q) => [q[0] + e.dx, q[1] + e.dy, q[2] + e.dx, q[3] + e.dy]), marker: e.p.marker ? [e.p.marker[0] + e.dx, e.p.marker[1] + e.dy, e.p.marker[2]] : null }));
  const live = all.filter((e) => e.p.text && e.rects.length && e.box);
  // everything else on the label canvas: the study marks and every ordinary dot (a marker-only capital has no text but a dot), grown by 2 px
  const marks = c.study.liveMarks().map((m) => ({ id: m.id, box: [m.x - m.h - 1, m.y - m.h - 1, m.x + m.h + 1, m.y + m.h + 1] })).concat(all.filter((e) => e.marker).map((e) => ({ id: e.p.id, box: [e.marker[0] - e.marker[2] - 1, e.marker[1] - e.marker[2] - 1, e.marker[0] + e.marker[2] + 1, e.marker[1] + e.marker[2] + 1] })));
  const meets = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
  const out = [];
  for (const e of live) {
    const r = e.box, g = [r[0] - 4, r[1] - 4, r[2] + 4, r[3] + 4];   // the region read: the name's box and the halo's reach round it (at most 2.7 px before the change) — nothing else may lie in it
    if (live.some((o) => o !== e && o.rects.some((s) => meets(g, s))) || marks.some((m) => m.id !== e.p.id && meets(g, m.box))) continue;
    // a name's OWN dot or mark stands 3 px off its box, inside the region read: only the side away from it is measured (an ink dot would read as the text's edge)
    const own = marks.find((m) => m.id === e.p.id && meets(g, m.box)), useL = !own || own.box[0] >= r[2], useR = !own || own.box[2] <= r[0];
    if (!useL && !useR) continue;
    if (g[0] < 0 || g[1] < 0 || g[2] * dpr > cv.width || g[3] * dpr > cv.height) continue;
    const ink = hex(e.p.selected || e.p.st === 2 ? col.selected : WATER[e.p.kind] ? col.water : col.ink), Hh = hex(col.halo);
    const ax = [ink[0] - Hh[0], ink[1] - Hh[1], ink[2] - Hh[2]], len = ax[0] * ax[0] + ax[1] * ax[1] + ax[2] * ax[2] || 1;
    const x0 = Math.floor((r[0] - 4) * dpr), y0 = Math.floor((r[1] - 4) * dpr), w = Math.ceil((r[2] + 4) * dpr) - x0, h = Math.ceil((r[3] + 4) * dpr) - y0;
    const d = x.getImageData(x0, y0, w, h).data;
    const reaches = [];
    for (let yy = 0; yy < h; yy++) {
      let op0 = -1, op1 = -1, ink0 = -1, ink1 = -1;
      for (let xx = 0; xx < w; xx++) {
        const i = (yy * w + xx) * 4; if (d[i + 3] < 48) continue;   // any visible pixel is the halo's reach; a text pixel is one past 0.6 on the axis that is also solid
        if (op0 < 0) op0 = xx; op1 = xx;
        const t = ((d[i] - Hh[0]) * ax[0] + (d[i + 1] - Hh[1]) * ax[1] + (d[i + 2] - Hh[2]) * ax[2]) / len;
        if (t > 0.6 && d[i + 3] >= 128) { if (ink0 < 0) ink0 = xx; ink1 = xx; }
      }
      if (ink0 < 0) continue;
      if (useL) reaches.push(ink0 - op0); if (useR) reaches.push(op1 - ink1);
    }
    if (reaches.length < 6) continue;
    reaches.sort((p, q) => p - q);
    out.push({ id: e.p.id, text: e.p.text, style: e.p.style, kind: e.p.kind, st: e.p.st || 0, halo: reaches[Math.floor(reaches.length * 0.2)] / dpr, rows: reaches.length });   // the reach at the 20th percentile of the rows: the least, less one odd row
  }
  return { dpr, out };
});

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch(LAUNCH);
  const allErrors = [];
  const table = new Map();   // theme → style → [widths]
  for (const theme of ["light", "dark"]) {
    console.log(`\n\x1b[1m${theme}: the halo each style paints, measured off the label canvas\x1b[0m\n`);
    const { ctx, page, errors } = await open(browser, theme);
    const byStyle = new Map(), eg = new Map();
    const views = [["the central Mediterranean at 6 km/px, 2025", 15, 40, 6, 2025], ["the globe at 24 km/px", 15, 35, 24, null], ["the steppe in 375 CE at 8 km/px (every people shown)", 36, 49, 8, 375]];
    await A(page, (c) => c.setLayers({ peoples: "all", countries: true, places: true, physical: true, cities: true }));
    for (const [name, lon, lat, k, year] of views) {
      await view(page, lon, lat, k, year);
      const m = await measure(page);
      for (const r of m.out) { if (!byStyle.has(r.style)) byStyle.set(r.style, []); byStyle.get(r.style).push(r.halo); if (!eg.has(r.style)) eg.set(r.style, r.text); }
      check(`${name}: names measured (${m.out.length}, at ${m.dpr} device px per CSS px)`, m.out.length >= 5 && m.dpr >= 1.9, m.out.slice(0, 5).map((r) => r.text + " " + r.style + " " + r.halo.toFixed(2)).join(", "));
    }
    const widths = await A(page, (c) => (c.haloWidths ? c.haloWidths() : null));
    const med = (a) => { const s = a.slice().sort((p, q) => p - q); return s[Math.floor(s.length / 2)]; };
    console.log("\n  style        n   min    median  painted   e.g.");
    for (const [st, ws] of [...byStyle].sort()) console.log(`  ${st.padEnd(12)} ${String(ws.length).padStart(2)}  ${Math.min(...ws).toFixed(2).padStart(5)}  ${med(ws).toFixed(2).padStart(6)}  ${widths ? String(widths.byStyle[st]).padStart(7) : "      ?"}   ${eg.get(st)}`);
    table.set(theme, byStyle);
    check("a settlement style, a water style, a country size and a people style are all measured", ["capital", "city", "town"].some((s) => byStyle.has(s)) && [...byStyle.keys()].some((s) => s.startsWith("water") || s === "river") && [...byStyle.keys()].some((s) => s.startsWith("country")) && ["people-l", "people-m", "people-s"].some((s) => byStyle.has(s)) && byStyle.size >= 6, [...byStyle.keys()].join(", "));
    const cap = HALO_MAX / 2 + AA;
    for (const [st, ws] of [...byStyle].sort()) check(`${st}: the halo shows at most ${cap.toFixed(2)} px beyond the ink (half of ${HALO_MAX} px, an anti-aliased pixel allowed) and at least 0.8 — the median reach over ${ws.length} names is ${med(ws).toFixed(2)} (the least ${Math.min(...ws).toFixed(2)})`, med(ws) >= 0.8 && med(ws) <= cap, ws.map((w) => w.toFixed(2)).join(" "));
    const city = byStyle.get("city") || byStyle.get("town") || byStyle.get("capital") || [];
    for (const st of ["people-l", "people-m", "people-s"]) if (byStyle.has(st) && city.length) check(`${st}: the same halo as the city style's (${med(city).toFixed(2)} px), within 0.5 px`, Math.abs(med(byStyle.get(st)) - med(city)) <= 0.5, `${med(byStyle.get(st)).toFixed(2)} px`);
    check("the page's own table: every style's halo and the selected name's are at or under the cap, " + (widths ? (widths.max).toFixed(2) + " px at this Text size" : "no haloWidths API"), !!widths && Object.values(widths.byStyle).every((w) => w <= widths.max + 1e-9) && widths.selected <= widths.max + 1e-9 && widths.max === HALO_MAX * widths.scale, widths ? JSON.stringify(widths.byStyle) + " selected " + widths.selected : "");
    // the cap scales with Text size: at Huge every width is still at or under 3.2 × the scale, and larger than at Medium
    await page.evaluate(() => { document.body.dataset.fs = "huge"; }); await sleep(400);
    await page.evaluate(() => document.querySelector(".atlas2").__atlas2.layoutNow()); await sleep(300);
    const huge = await A(page, (c) => (c.haloWidths ? c.haloWidths() : null));
    check("at the Huge Text size the widths grow with the names and stay at or under 3.2 × the scale", !!huge && huge.scale > (widths ? widths.scale : 1) && huge.max === HALO_MAX * huge.scale && Object.values(huge.byStyle).every((w) => w <= huge.max + 1e-9) && huge.selected <= huge.max + 1e-9, huge ? `scale ${huge.scale}, max ${huge.max.toFixed(2)}, selected ${huge.selected.toFixed(2)}` : "no haloWidths API");
    await page.evaluate(() => { delete document.body.dataset.fs; });
    allErrors.push(...errors); await ctx.close();
  }
  console.log("\n\x1b[1mThe halo each style shows beyond its ink (median CSS px), light and dark\x1b[0m\n");
  const styles = new Set(); for (const m of table.values()) for (const k of m.keys()) styles.add(k);
  const med = (a) => { if (!a) return null; const s = a.slice().sort((p, q) => p - q); return s[Math.floor(s.length / 2)]; };
  for (const st of [...styles].sort()) console.log(`  ${st.padEnd(12)} light ${(med(table.get("light").get(st)) ?? NaN).toFixed(2)}   dark ${(med(table.get("dark").get(st)) ?? NaN).toFixed(2)}`);
  check("no page errors", allErrors.length === 0, allErrors.slice(0, 3).join(" | "));
  await browser.close(); server.close();
  console.log(`\n${pass} ok, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
