/* test-atlas-admin1-page.js — THE LAZY ADMIN-1 LAYER ON THE ATLAS PAGE (step 3, 2026-11-15; docs/atlas-v2-admin1-layer.md §8).

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-admin1-page.js
     FOLIO_SHOTS=/dir   … also writes a screenshot per view

   India's 36 states and union territories (atlas/data/admin1.bin) are drawn on the page by the legend's ONE Provinces switch, as the core's US, Chinese,
   Russian and British states are: their inner lines in the core's admin-1 line, at the present day, below ADMIN1_KM_PER_PX (4 km/px), their names in the
   admin-1 style; the Personal Atlas draws only a DISCOVERED unit (flag 2 of a studied card's `places`, or its country's). The file is lazy: fetched the
   first time the lines are on over India (or a Personal Atlas holds a studied Indian unit), never at boot, never over another country.

   WHAT IT PROVES (desktop, 1280 × 800, WebGL2):
     1  the page at boot and zoomed in over Europe (Provinces on, the present) never fetches admin1.bin
     2  Map, over India at 2 km/px, Provinces on: the file is fetched once; the renderer draws the file's inner lines (admin1Segments > 0) and no fill pass
        (admin1Faces 0); the green-painted admin-1 line shows on the canvas; Indian states are named (`adm1:ind:` labels); the search finds Uttar Pradesh
     3  …the Provinces switch off: no line segment, no Indian state's name; on again and zoomed out to 8 km/px: no line, no name; a past year (1900): none
     4  Full at the same view draws them as Map does
     5  Personal, a reader whose studied card names Uttar Pradesh (adm1:ind:in-up; the index is extended for the test, as no card names an Indian unit
        yet): the file is fetched without zooming in; the keep set is Uttar Pradesh alone; at the view over it, the canvas is PLAIN land inside Uttar
        Pradesh and the darker EMPTY land in Madhya Pradesh (India itself undiscovered); the only Indian name placed is Uttar Pradesh's; the only
        admin-1 line segments drawn are Uttar Pradesh's own (fewer than Map's); its border with Nepal is drawn and no border pixel lies away from its plain land; a past year draws none of it
     6  Personal, a reader with no Indian card: the file's lines are not drawn at all, though the view is over India and zoomed in
     7  no console error
   Re-run after touching the page's admin-1 slot in atlas.js (`overAdmin1File`, `adm1Draw`, `adm1Style`, `adm1GRows`, the slot's part of
   `refreshPersonalPresent`), atlas-gl.js's `drawHistoryFills` / `drawHistoryBorders` slot path or the draw order, the worker's `adm1Rows` or the
   slot's reference table (`refTable`, `setAdmin1RefTable`). Then `test-atlas-undiscovered.js`, `test-atlas-personal.js` and `test-atlas-perf.js`. */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const SHOTS = process.env.FOLIO_SHOTS || "";
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream" };
const PORT = 5649;
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const UP = "adm1:ind:in-up", STUDY_CARD = "gr-001";   // the reader's card, linked to Uttar Pradesh in the served index (below)
// the card → places index with one more link: gr-001 also names Uttar Pradesh
const cardPlacesWithUP = () => {
  const src = fs.readFileSync(path.join(ROOT, "atlas/data/card-places.js"), "utf8"), w = {}; new Function("window", src)(w);
  const T = w.ATLAS_CARD_PLACES; let i = T.ids.indexOf(UP); if (i < 0) { T.ids.push(UP); i = T.ids.length - 1; }
  T.cards[STUDY_CARD] = (T.cards[STUDY_CARD] || []).concat([i]);
  return "/* sources: [] */\nwindow.ATLAS_CARD_PLACES = " + JSON.stringify(T) + ";\n";
};

const seed = (ids) => `try { if (!localStorage.getItem("folio_v1_seeded")) { localStorage.setItem("folio_v1", JSON.stringify({ cards: Object.fromEntries(${JSON.stringify(ids)}.map((id) => [id, { due: Date.now() + 9e8, ivl: 9, ease: 2.5, status: "review", reps: 2, first: "2026-08-01" }])), settings: { newPerDay: 5 } })); localStorage.setItem("folio_v1_seeded", "1"); } } catch (e) {}`;
const A = (page, fn, arg) => page.evaluate(`(() => { const c = document.querySelector(".atlas2").__atlas2; return (${fn.toString()})(c, ${JSON.stringify(arg === undefined ? null : arg)}); })()`);
async function open(browser, ids, withUP) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  await ctx.addInitScript(seed(ids));
  await ctx.addInitScript(`localStorage.setItem("folio_tour_v1","1");localStorage.setItem("folio_atlas_tour_v1","1");localStorage.setItem("folio.atlas2.intro","1");`);
  if (withUP) { const body = cardPlacesWithUP(); await ctx.route(/atlas\/data\/card-places\.js/, (r) => r.fulfill({ status: 200, contentType: "text/javascript", body })); }
  const page = await ctx.newPage();
  const errors = [], fetched = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  page.on("request", (r) => { if (/admin1\.bin/.test(r.url())) fetched.push(r.url()); });
  await page.goto(`http://127.0.0.1:${PORT}/#map`, { waitUntil: "load" });
  await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 120000 });
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.waterSettled() && c.labelsReady() && c.study.ready(); }, null, { timeout: 120000 });
  await A(page, (c) => c.setLayers({ rivers: false, lakes: true, countries: true, places: true, physical: true, cities: true, provinces: true, relief: false }));
  return { ctx, page, errors, fetched };
}
async function settle(page) {
  await page.waitForFunction(() => document.querySelector(".atlas2").__atlas2.tilesSettled(), null, { timeout: 120000 });
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.year() >= 2000 || !c.historyOK || c.historyOK(); }, null, { timeout: 120000 });
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.layoutNow()); await sleep(1200);
}
async function go(page, y, lon, lat, k) { await A(page, (c, v) => { c.setYear(v[0]); c.setView(v[1], v[2], v[3]); }, [y, lon, lat, k]); await settle(page); }
async function mode(page, m) { await A(page, (c, m) => c.study.setMode(m), m); await sleep(500); await settle(page); }
const waitAdmin1 = (page) => page.waitForFunction(() => { const i = document.querySelector(".atlas2").__atlas2.admin1Info(); return i.failed || (i.ready && i.faces > 0); }, null, { timeout: 60000 });
const shot = async (page, name) => { if (!SHOTS) return; fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, name + ".png") }); };
// one render with the admin-1 line painted green, the rest as the theme has it: the green pixels, and the renderer's counters of that render
const frame = (page) => A(page, (c) => {
  const g = c.renderer.gl, [W, H] = c.frame();
  c.renderer.setPalette({ admin1: "#00ff00" }); c.renderer.render(c.view);
  const w = g.drawingBufferWidth, h = g.drawingBufferHeight, buf = new Uint8Array(w * h * 4); g.readPixels(0, 0, w, h, g.RGBA, g.UNSIGNED_BYTE, buf);
  let green = 0; for (let i = 0; i < buf.length; i += 16) if (buf[i + 1] - buf[i] > 80 && buf[i + 1] - buf[i + 2] > 80) green++;
  const s = c.statsNow();
  return { green, segs: s.admin1Segments || 0, faces: s.admin1Faces || 0, W, H };
});
const indNames = (page) => A(page, (c) => c.labels().filter((p) => /^adm1:ind:/.test(p.id)).map((p) => p.id));
// the canvas at a lon/lat: plain land (the palette's), the darker empty land (HIST_DIM 0.5), or other
const groundAt = (page, pts) => A(page, (c, pts) => {
  const g = c.renderer.gl, [W, H] = c.frame(), pal = c.palette(), land = pal.land.map((v) => v * 255), dim = land.map((v) => v * 0.5);
  c.renderer.render(c.view);
  const w = g.drawingBufferWidth, h = g.drawingBufferHeight, d = w / W, buf = new Uint8Array(w * h * 4); g.readPixels(0, 0, w, h, g.RGBA, g.UNSIGNED_BYTE, buf);
  const close = (p, q) => Math.abs(p[0] - q[0]) <= 10 && Math.abs(p[1] - q[1]) <= 10 && Math.abs(p[2] - q[2]) <= 10;
  const rot = c.view.rot, R = c.view.radius, cx = c.view.cx, cy = c.view.cy, D = Math.PI / 180;
  return pts.map(([lon, lat]) => {
    const v = [Math.cos(lat * D) * Math.cos(lon * D), Math.cos(lat * D) * Math.sin(lon * D), Math.sin(lat * D)];
    const x = cx + (rot[0] * v[0] + rot[1] * v[1] + rot[2] * v[2]) * R, y = cy - (rot[3] * v[0] + rot[4] * v[1] + rot[5] * v[2]) * R;
    const counts = { plain: 0, empty: 0, other: 0 };
    for (let dy = -6; dy <= 6; dy += 3) for (let dx = -6; dx <= 6; dx += 3) { const i = ((h - 1 - Math.round((y + dy) * d)) * w + Math.round((x + dx) * d)) * 4, p = [buf[i], buf[i + 1], buf[i + 2]]; counts[close(p, land) ? "plain" : close(p, dim) ? "empty" : "other"]++; }
    return counts.plain >= counts.empty && counts.plain >= counts.other ? "plain" : counts.empty >= counts.other ? "empty" : "other";
  });
}, pts);

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch(LAUNCH);
  const allErrors = [];
  const INDIA = [80, 25, 2], LUCKNOW = [80.9, 26.85], BHOPAL_EAST = [78.6, 23.3];   // Uttar Pradesh's interior; Madhya Pradesh's

  /* ------------------------------------------------------------------ 1–4  Map and Full */
  {
    const { ctx, page, errors, fetched } = await open(browser, []);
    await mode(page, "map");
    console.log("\n\x1b[1m1) never at boot, never over another country\x1b[0m\n");
    check("the page at boot has not fetched admin1.bin", fetched.length === 0, fetched.join(" "));
    await go(page, 2026, 10, 48, 2);
    check("Map over Europe at 2 km/px, Provinces on: admin1.bin is still not fetched", fetched.length === 0 && !(await A(page, (c) => c.admin1Info().started)), fetched.join(" "));

    console.log("\n\x1b[1m2) Map over India at 2 km/px: the file's inner lines and names\x1b[0m\n");
    await go(page, 2026, INDIA[0], INDIA[1], INDIA[2]); await waitAdmin1(page); await settle(page);
    const info = await A(page, (c) => c.admin1Info());
    check("the file is fetched once and read (36 faces)", fetched.length === 1 && info.ready && !info.failed && info.faces === 36, JSON.stringify(info) + " " + fetched.length);
    const m = await frame(page);
    check(`the renderer draws the file's inner lines and no fill pass (${m.segs} segments, ${m.faces} faces filled)`, m.segs > 50 && m.faces === 0);
    check(`the admin-1 line shows on the canvas (${m.green} green pixels, sampled 1 in 4)`, m.green > 40);
    const names = await indNames(page);
    check(`Indian states are named in the admin-1 style (${names.length}: ${names.slice(0, 5).join(", ")})`, names.length >= 3 && (await A(page, (c) => c.labels().filter((p) => /^adm1:ind:/.test(p.id)).every((p) => p.style === "admin1"))));
    check("Uttar Pradesh, the view's centre, is among them", names.includes(UP), names.join(", "));
    await shot(page, "admin1-map-india");
    const hits = await A(page, (c) => c.search("Uttar Pra"));
    check("the search finds Uttar Pradesh once the file is in", hits.includes(UP), hits.join(", "));
    await A(page, (c) => c.closeResults && c.closeResults());

    console.log("\n\x1b[1m3) the Provinces switch, the zoom and the year rule it\x1b[0m\n");
    await A(page, (c) => c.setLayers({ provinces: false })); await settle(page);
    let f = await frame(page), n = await indNames(page);
    check(`Provinces off: no line segment (${f.segs}), no Indian state's name (${n.length})`, f.segs === 0 && n.length === 0);
    await A(page, (c) => c.setLayers({ provinces: true })); await go(page, 2026, INDIA[0], INDIA[1], 8);
    f = await frame(page); n = await indNames(page);
    check(`Provinces on, zoomed out to 8 km/px: no line segment (${f.segs}), no name (${n.length})`, f.segs === 0 && n.length === 0);
    await go(page, 1900, INDIA[0], INDIA[1], INDIA[2]);
    f = await frame(page); n = await indNames(page);
    check(`1900 at 2 km/px: no line segment (${f.segs}), no name (${n.length}) — the file is the present day's`, f.segs === 0 && n.length === 0);

    console.log("\n\x1b[1m4) the Full Atlas draws them as Map does\x1b[0m\n");
    await mode(page, "full"); await go(page, 2026, INDIA[0], INDIA[1], INDIA[2]);
    f = await frame(page);
    check(`Full over India at 2 km/px: the inner lines drawn (${f.segs} segments, ${f.green} green)`, f.segs > 50 && f.green > 40);
    allErrors.push(...errors); await ctx.close();
  }

  /* ------------------------------------------------------------------ 5  Personal, Uttar Pradesh discovered */
  {
    console.log("\n\x1b[1m5) Personal: a studied card discovers Uttar Pradesh, and only it is drawn\x1b[0m\n");
    const { ctx, page, errors, fetched } = await open(browser, [STUDY_CARD], true);
    await mode(page, "personal");
    const fl = await A(page, (c, id) => c.study.flags().find(([k]) => k === id), UP);
    check("the studied card flags Uttar Pradesh (flag 2)", fl && fl[1] === 2, JSON.stringify(fl));
    await waitAdmin1(page);
    check("the file is fetched at the globe's zoom, for the studied unit alone", fetched.length === 1, String(fetched.length));
    await go(page, 2026, INDIA[0], INDIA[1], INDIA[2]);
    const info = await A(page, (c) => c.admin1Info());
    check("the keep set is Uttar Pradesh alone", info.keep.length === 1 && info.keep[0] === UP && info.layer && info.layer.faces === 1 && info.layer.beforeDim, JSON.stringify(info));
    const [up, mp] = await groundAt(page, [LUCKNOW, BHOPAL_EAST]);
    check(`inside Uttar Pradesh the ground is plain land (${up}); in Madhya Pradesh the darker empty land (${mp})`, up === "plain" && mp === "empty");
    const names = await indNames(page);
    check(`the only Indian name placed is Uttar Pradesh's (${names.join(", ") || "none"})`, names.length === 1 && names[0] === UP);
    const p = await frame(page);
    await mode(page, "map"); const m = await frame(page); await mode(page, "personal");
    check(`the admin-1 segments drawn are Uttar Pradesh's own: some (${p.segs}), fewer than Map's (${m.segs})`, p.segs > 0 && p.segs < m.segs);
    // the international border: Uttar Pradesh's share with Nepal is drawn, and no border pixel lies away from its plain land (the India–Nepal arc runs on past it)
    const red = await A(page, (c) => {
      const g = c.renderer.gl, [W, H] = c.frame(), land = c.palette().land.map((v) => v * 255);
      c.renderer.setPalette({ border: "#ff0000", admin1: "#00ff00" }); c.renderer.setHistoryBorderColor("#ff0000"); c.renderer.render(c.view);
      const w = g.drawingBufferWidth, h = g.drawingBufferHeight, d = w / W, buf = new Uint8Array(w * h * 4); g.readPixels(0, 0, w, h, g.RGBA, g.UNSIGNED_BYTE, buf);
      const px = (x, y) => { const i = ((h - 1 - Math.round(y * d)) * w + Math.round(x * d)) * 4; return [buf[i], buf[i + 1], buf[i + 2]]; };
      const isRed = (p) => p[0] - p[1] > 80 && p[0] - p[2] > 80, isPlain = (p) => Math.abs(p[0] - land[0]) <= 10 && Math.abs(p[1] - land[1]) <= 10 && Math.abs(p[2] - land[2]) <= 10;
      let n = 0, away = 0;
      for (let y = 8; y < H - 8; y += 2) for (let x = 8; x < W - 8; x += 2) { if (!isRed(px(x, y))) continue; n++; let near = false; for (let dy = -8; dy <= 8 && !near; dy += 2) for (let dx = -8; dx <= 8; dx += 2) if (isPlain(px(x + dx, y + dy))) { near = true; break; } if (!near) away++; }
      return { n, away };
    });
    check(`Uttar Pradesh's border with Nepal is drawn (${red.n} border pixels) and none lies away from its plain land (${red.away})`, red.n > 40 && red.away === 0);
    await shot(page, "admin1-personal-up");
    await go(page, 1900, INDIA[0], INDIA[1], INDIA[2]);
    const past = await A(page, (c) => c.admin1Info());
    check("1900: the Personal Atlas draws none of the file", !past.layer, JSON.stringify(past.layer));
    allErrors.push(...errors); await ctx.close();
  }

  /* ------------------------------------------------------------------ 6  Personal, no Indian card */
  {
    console.log("\n\x1b[1m6) Personal: a reader with no Indian card sees none of the file\x1b[0m\n");
    const { ctx, page, errors } = await open(browser, [STUDY_CARD]);
    await mode(page, "personal"); await go(page, 2026, INDIA[0], INDIA[1], INDIA[2]); await waitAdmin1(page); await settle(page);
    const f = await frame(page), n = await indNames(page), info = await A(page, (c) => c.admin1Info());
    check(`over India at 2 km/px: the file is in (the Provinces lines asked for it) but nothing of it is drawn (${f.segs} segments, ${n.length} names, layer ${JSON.stringify(info.layer)})`, info.ready && f.segs === 0 && n.length === 0 && !info.layer);
    allErrors.push(...errors); await ctx.close();
  }

  console.log("");
  check("no console error", allErrors.length === 0, allErrors.slice(0, 3).join(" | "));
  console.log("\n" + pass + " ok, " + fail + " failed");
  await browser.close(); server.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); server.close(); process.exit(1); });
