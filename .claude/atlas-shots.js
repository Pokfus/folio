/* atlas-shots.js — the screenshot series of #map2 (docs/atlas-v2-design.md §7 "Phase 1a — as built", "Phase 1b — as built").

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/atlas-shots.js [outDir] [--only land|water|relief|fade]

   LAND (Phase 1a): three places where the coast is hard — the Aegean (islands by the hundred), the Dutch
   coast (dykes, the Wadden, straight polders and water on both sides of the line) and the Norwegian fjords
   (deep, narrow, the LOD seams' worst case) — at three zooms each: 6 km/px (resident LOD 1), 0.6 km/px
   (LOD 3, the first tile level) and the cap, 0.15 km/px (LOD 4); a second shot of each cap view is taken
   mid-load to show the stencil fallback.
   WATER (Phase 1b): the Rhine, the Danube, the Nile with its delta, the Mississippi; the Great Lakes, Lake
   Victoria, Baikal — for stair-stepped or chorded rivers, mouths off the coast, lakes over borders, shores
   at the tile zooms.
   RELIEF (Phase 1b): the globe, the Alps and the Himalaya at three zooms, in three themes (folio light,
   folio night, synth) — for relief spilling past the coast, tile seams, the ramp in a light, a dark and a
   coloured theme.
   FADE: the Alps at 2.5, 1.8, 1.2 and 0.9 km/px — where the relief fades out past L1's texel.
   LABELS (Phase 1c): the globe, Europe, the Aegean and Athens at the cap, at the three density stops, on the
   desktop and on a 390 px phone (its own context, isMobile), in three themes (folio light, folio night,
   synth) — for overlaps, names over the wrong place, curved text, labels near the limb, halo contrast over
   relief (Europe with relief on); plus the stack chip on Lake Victoria, France's country card and the
   phone's bottom sheet. `--only labels` takes this group alone.
   Each shot waits for every tile, water file and relief texture the view wants, so what it shows is the
   finished state. Review by eye; nothing here asserts.
*/
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const argv = process.argv.slice(2);
const only = (() => { const i = argv.indexOf("--only"); return i >= 0 ? argv[i + 1] : null; })();
const OUT = argv.find((a) => !a.startsWith("--") && argv[argv.indexOf(a) - 1] !== "--only") || path.join(process.env.SCRATCH || "/tmp", "atlas-shots");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream" };
const PORT = 5613;
const LAND_PLACES = [{ name: "aegean", lon: 25.2, lat: 37.6 }, { name: "dutch-coast", lon: 4.8, lat: 52.9 }, { name: "fjords", lon: 6.5, lat: 61.0 }];
const LAND_ZOOMS = [{ name: "z6", kmpp: 6 }, { name: "z12", kmpp: 0.6 }, { name: "cap", kmpp: 0.15 }];
const WATER = { rivers: true, lakes: true, relief: false };
const SHOTS = [];
if (!only || only === "land") for (const P of LAND_PLACES) for (const Z of LAND_ZOOMS) SHOTS.push({ group: "land", name: `${P.name}-${Z.name}`, lon: P.lon, lat: P.lat, kmpp: Z.kmpp, layers: { rivers: false, lakes: false, relief: false }, loading: Z.name === "cap" });
if (!only || only === "water") SHOTS.push(
  { group: "water", name: "rhine-1km", lon: 7.5, lat: 50.5, kmpp: 1.0, layers: WATER }, { group: "water", name: "rhine-delta-0.5km", lon: 4.9, lat: 51.9, kmpp: 0.5, layers: WATER },
  { group: "water", name: "danube-3km", lon: 19.5, lat: 45.5, kmpp: 3.0, layers: WATER }, { group: "water", name: "danube-vienna-0.5km", lon: 16.6, lat: 48.1, kmpp: 0.5, layers: WATER },
  { group: "water", name: "nile-6km", lon: 32.0, lat: 26.0, kmpp: 6.0, layers: WATER }, { group: "water", name: "nile-delta-0.5km", lon: 31.2, lat: 30.8, kmpp: 0.5, layers: WATER },
  { group: "water", name: "mississippi-6km", lon: -91.0, lat: 36.0, kmpp: 6.0, layers: WATER }, { group: "water", name: "mississippi-delta-0.5km", lon: -89.6, lat: 29.4, kmpp: 0.5, layers: WATER },
  { group: "water", name: "great-lakes-6km", lon: -84.0, lat: 45.0, kmpp: 6.0, layers: WATER }, { group: "water", name: "great-lakes-huron-0.6km", lon: -82.5, lat: 45.5, kmpp: 0.6, layers: WATER }, { group: "water", name: "great-lakes-cap", lon: -82.9, lat: 45.9, kmpp: 0.15, layers: WATER },
  { group: "water", name: "victoria-3km", lon: 33.0, lat: -1.2, kmpp: 3.0, layers: WATER }, { group: "water", name: "victoria-0.5km", lon: 32.9, lat: -0.4, kmpp: 0.5, layers: WATER },
  { group: "water", name: "baikal-3km", lon: 108.0, lat: 53.5, kmpp: 3.0, layers: WATER }, { group: "water", name: "baikal-0.5km", lon: 107.8, lat: 53.1, kmpp: 0.5, layers: WATER },
  { group: "water", name: "globe-water", lon: 20, lat: 30, kmpp: 24, layers: WATER },
);
const RELIEF = { rivers: true, lakes: true, relief: true };
const THEMES = [{ name: "folio", theme: "folio", night: false }, { name: "folio-night", theme: "folio", night: true }, { name: "synth", theme: "synth", night: false }];
if (!only || only === "relief") for (const T of THEMES) SHOTS.push(
  { group: "relief", name: `relief-globe-${T.name}`, lon: 30, lat: 30, kmpp: 24, layers: RELIEF, theme: T },
  { group: "relief", name: `relief-alps-6km-${T.name}`, lon: 10, lat: 46.5, kmpp: 6, layers: RELIEF, theme: T }, { group: "relief", name: `relief-alps-3km-${T.name}`, lon: 10, lat: 46.5, kmpp: 3, layers: RELIEF, theme: T }, { group: "relief", name: `relief-alps-1.5km-${T.name}`, lon: 10, lat: 46.5, kmpp: 1.5, layers: RELIEF, theme: T },
  { group: "relief", name: `relief-himalaya-6km-${T.name}`, lon: 86, lat: 28, kmpp: 6, layers: RELIEF, theme: T }, { group: "relief", name: `relief-himalaya-3km-${T.name}`, lon: 86, lat: 28, kmpp: 3, layers: RELIEF, theme: T }, { group: "relief", name: `relief-himalaya-1.5km-${T.name}`, lon: 86, lat: 28, kmpp: 1.5, layers: RELIEF, theme: T },
);
if (!only || only === "fade") for (const k of [2.5, 1.8, 1.2, 0.9]) SHOTS.push({ group: "fade", name: `fade-alps-${k}km`, lon: 10, lat: 46.5, kmpp: k, layers: RELIEF });
const LABEL_VIEWS = [{ name: "globe", lon: 10, lat: 20, kmpp: 24 }, { name: "europe", lon: 10, lat: 50, kmpp: 3 }, { name: "aegean", lon: 25, lat: 38, kmpp: 0.5 }, { name: "cap-athens", lon: 23.73, lat: 37.98, kmpp: 0.15 }];
if (!only || only === "labels") {
  for (const T of THEMES) for (const V of LABEL_VIEWS) for (const d of ["sparse", "normal", "dense"]) for (const phone of [false, true]) {
    SHOTS.push({ group: "labels", name: `labels-${V.name}-${d}-${phone ? "phone" : "desktop"}-${T.name}`, lon: V.lon, lat: V.lat, kmpp: V.kmpp, layers: Object.assign({}, WATER, { density: d, relief: V.name === "europe" }), theme: T, phone, labels: true });
  }
  SHOTS.push({ group: "labels", name: "labels-stack-victoria-desktop-folio", lon: 33.06, lat: -1.26, kmpp: 3, layers: WATER, theme: THEMES[0], labels: true, tap: true });
  SHOTS.push({ group: "labels", name: "labels-card-france-desktop-folio", lon: 2.2, lat: 46.6, kmpp: 3, layers: WATER, theme: THEMES[0], labels: true, select: "adm0:fra" });
  SHOTS.push({ group: "labels", name: "labels-card-france-phone-folio", lon: 2.2, lat: 46.6, kmpp: 3, layers: WATER, theme: THEMES[0], labels: true, select: "adm0:fra", phone: true });
  SHOTS.push({ group: "labels", name: "labels-sheet-expanded-phone-folio", lon: 2.2, lat: 46.6, kmpp: 3, layers: WATER, theme: THEMES[0], labels: true, select: "adm0:fra", phone: true, expand: true });
}

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch(LAUNCH);
  const errors = [];
  const pages = {};   // "desktop" and "phone": each its own context and page, opened on first use
  async function pageFor(phone) {
    const key = phone ? "phone" : "desktop";
    if (pages[key]) return pages[key];
    const context = phone ? await browser.newContext({ viewport: { width: 390, height: 700 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }) : await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    page.on("pageerror", (e) => errors.push(key + ": " + String(e).slice(0, 200)));
    await page.goto(`http://127.0.0.1:${PORT}/${phone ? "#map2" : "#map2?perf"}`, { waitUntil: "load" });
    await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 90000 });
    pages[key] = { page, canvas: await page.$(".atlas2"), theme: null };
    return pages[key];
  }
  for (const S of SHOTS) {
    const P = await pageFor(!!S.phone), page = P.page, canvas = P.canvas;
    const t = S.theme || THEMES[0];
    if (!P.theme || P.theme.name !== t.name) { await page.evaluate((T) => { document.body.dataset.theme = T.theme; document.body.classList.toggle("night", T.night); }, t); P.theme = t; await page.waitForTimeout(100); }
    await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; if (c.clearSelection) c.clearSelection(); });
    await page.evaluate((L) => document.querySelector(".atlas2").__atlas2.setLayers(L), S.layers);
    await page.evaluate(({ lon, lat, kmpp }) => document.querySelector(".atlas2").__atlas2.setView(lon, lat, kmpp), S);
    if (S.loading) { await page.waitForTimeout(120); await canvas.screenshot({ path: path.join(OUT, `${S.name}-loading.png`) }); }
    await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.tilesSettled() && c.waterSettled(); }, null, { timeout: 90000 }).catch(() => {});
    await page.waitForTimeout(300);
    if (S.labels) { await page.waitForFunction(() => document.querySelector(".atlas2").__atlas2.labelsReady(), null, { timeout: 60000 }).catch(() => {}); await page.evaluate(() => document.querySelector(".atlas2").__atlas2.layoutNow()); }
    if (S.select) { await page.evaluate((id) => document.querySelector(".atlas2").__atlas2.select(id, { open: true }), S.select); await page.waitForFunction(() => !document.querySelector(".atlas2-card-loading"), null, { timeout: 60000 }).catch(() => {}); if (S.expand) await page.click(".atlas2-grip"); await page.waitForTimeout(200); }
    if (S.tap) { const b = await (await page.$(".atlas2-canvas")).boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(400); }
    await page.evaluate(() => document.querySelector(".atlas2").__atlas2.invalidate());
    await page.waitForTimeout(120);
    const s = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.statsNow());
    await canvas.screenshot({ path: path.join(OUT, `${S.name}.png`) });
    console.log(`${S.name}: LOD ${s.level}, ${s.tilesDrawn} tiles, ${s.triangles} tri, ${s.segments} seg; rivers ${s.riverSegments}, lakes ${s.lakeSegments} seg / ${s.lakeTriangles} tri (${s.lakeCulled} culled), water tiles ${s.waterTilesDrawn}; relief ${s.reliefOn ? "on fade " + s.reliefFade.toFixed(2) + " patches " + s.reliefPatches : "off"}; ${s.draws} draws${S.labels ? `; labels ${s.labelsPlaced}/${s.labelCandidates} (cap ${s.labelCap}, ${s.density}${s.phone ? ", phone" : ""}) layout ${s.labelLayoutMs.toFixed(1)} ms draw ${s.labelDrawMs.toFixed(2)} ms` : ""}`);
  }
  await browser.close(); server.close();
  if (errors.length) console.log("page errors: " + errors.join(" | "));
  console.log(`wrote ${SHOTS.length + SHOTS.filter((s) => s.loading).length} shots to ${OUT}`);
})().catch((e) => { console.error(e); process.exit(1); });
