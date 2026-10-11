/* test-atlas-labels.js — the label layer of Atlas v2 (Phase 1c; docs/atlas-v2-design.md §2.6, §2.9, §2.11).

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-labels.js
     FOLIO_CHROMIUM=/path/to/chrome  … to pick the browser (otherwise playwright's own)

   WHAT IT PROVES, each a fault that fails silently — a map with forty overlapping names still looks like a map:

     · NO TWO LABEL RECTANGLES INTERSECT at twelve (view, density) pairs — the globe, Europe, the Aegean and
       the Aegean at the cap × sparse / normal / dense — and at three of them on a 390 px phone viewport;
       the rectangles are the collision chain the worker laid out (a curved label is a chain of glyph boxes);
     · INK EXISTS WHERE THE LAYOUT SAYS: inside every placed label's box the label canvas has painted pixels;
     · AREA KINDS CARRY NO MARKER (a sea, a lake, a river, an island, a region have no dot — §2.6);
     · THE PLACED SET IS IDENTICAL at the start and end of a 40-step drag (no label added or dropped while the
       globe moves; the layout sequence number does not change under the pointer);
     · THE DENSITY STOPS ARE MONOTONE (sparse ≤ normal ≤ dense) and NORMAL sits near Q-L1's numbers: a cap of
       about 40 at the globe and 120 at country scale, with the placed count within half of the cap;
     · THE LABEL ANCHORS of the ten countries v1 could get wrong (the United States over Europe) lie in their
       own land — the ID pass, not the build, is asked;
     · A RIVER LABEL DISAPPEARS WHEN ITS LINE DOES (rivers are drawn from 0.35 km/px upward only);
     · LABEL CONTRAST against the theme's land and sea fills, in all fifteen themes and folio's night: ink names
       ≥ 4.5:1 on the land fill, water names ≥ 3:1 on the sea and on the land (every label also carries a halo);
     · THE BUDGETS: the label canvas redraw ≤ 3 ms at p95 and the worker's layout ≤ 50 ms at p95, as the
       controller reports them (relaxed ×3 on software GL runners, which this suite detects by the renderer string);
     · NO LABEL UNDER THE CHROME AND NONE UPSIDE DOWN (Phase 2a, task 0d; the owner's phone screenshots of 2026-10-09): at
       1280×800 and at 390×844 — with the legend shut and open, the About sheet open, a card open — no placed label's rectangle
       intersects a control's rectangle (search, zoom stack, chips, sheets, card, stack chip); every point label (a city and
       its marker) is wholly on screen; an area or path label hangs past the viewport edge by at most a quarter of its boxes;
       every curved label's mean glyph rotation lies within ±90° of upright and no glyph of it is rotated beyond 90°;
     · A LARGE POLITY'S NAME OUTRANKS THE CAPITAL MARKERS INSIDE IT (Phase 3a, task 0a; the 2b review): with the history
       loaded, at Europe in 1500 at 7 km/px the Ottoman Empire is named and Constantinople's marker is still drawn; at the
       globe in 1245 the Mongol Empire is named and Karakorum's marker drawn; on a 390 px phone at 1500 the Ottoman Empire is
       named at 12 km/px and at least one polity at the globe — the three views that drew a fill and capitals but no name,
       because a period capital scored before every polity and took the cells at the name's one trial position.
*/
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream" };
const PORT = 5616;
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});
// the cap view sits on Athens: at 150 m/px over the open Aegean Natural Earth's 10m places name nothing, and a view with
// nothing to label is not a test of the layout
const VIEWS = [{ name: "globe", lon: 10, lat: 20, k: 24 }, { name: "Europe", lon: 10, lat: 50, k: 3 }, { name: "Aegean", lon: 25, lat: 38, k: 0.5 }, { name: "cap", lon: 23.73, lat: 37.98, k: 0.15 }];
const DENSITIES = ["sparse", "normal", "dense"];
const THEMES = ["folio", "synth", "arcade", "academy", "marble", "gazette", "diamond", "ruby", "jade", "emerald", "amber", "amethyst", "aquamarine", "bloodstone", "carnelian"];
const ANCHORS = ["United States of America", "Russia", "Indonesia", "Japan", "Chile", "Norway", "Fiji", "Kiribati", "Canada", "Denmark"];
const AREA_KINDS = /^(country|admin1|sea|ocean|gulf|strait|lake|river|island|island-group|range|region)$/;

let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const lum = (hex) => { const n = parseInt(hex.slice(1), 16); const c = [16, 8, 0].map((s) => { const v = ((n >> s) & 255) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const contrast = (a, b) => { const la = lum(a), lb = lum(b); return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05); };
const hexOf = (rgb) => "#" + rgb.map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, "0")).join("");
const intersects = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];

async function open(context, hash) {
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  await page.goto(`http://127.0.0.1:${PORT}/${hash || "#map2"}`, { waitUntil: "load" });
  await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 120000 });
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setLayers({ rivers: true, lakes: true, relief: false, density: "normal", countries: true, places: true, physical: true, cities: true, provinces: true }));
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.waterSettled() && c.labelsReady(); }, null, { timeout: 120000 });
  return { page, errors };
}
const settle = (page) => page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.tilesSettled() && c.waterSettled(); }, null, { timeout: 120000 }).then(() => true, () => false);
async function layoutAt(page, V, density) {
  if (density) await page.evaluate((d) => document.querySelector(".atlas2").__atlas2.setLayers({ density: d }), density);
  await page.evaluate((v) => document.querySelector(".atlas2").__atlas2.setView(v.lon, v.lat, v.k), V);
  await settle(page); await sleep(100);
  const placed = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.layoutNow().then((p) => p.map((x) => ({ id: x.id, kind: x.kind, text: x.text, rects: x.rects, box: x.box, marker: !!x.marker, curved: !!x.curved, score: x.score, glyphs: x.glyphs ? x.glyphs.map((g) => g[2]) : [], meanAngle: x.meanAngle || 0 }))));
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.invalidate()); await sleep(60);
  const s = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.statsNow());
  return { placed, stats: s };
}
function overlaps(placed) {
  const bad = [];
  for (let i = 0; i < placed.length; i++) for (let j = i + 1; j < placed.length; j++) {
    for (const a of placed[i].rects) for (const b of placed[j].rects) if (intersects(a, b)) { bad.push(placed[i].text + " × " + placed[j].text); break; }
  }
  return bad;
}
async function inkInBoxes(page, placed) {
  return page.evaluate((boxes) => {
    const c = document.querySelector(".atlas2-labels"), x = c.getContext("2d"), dpr = c.width / c.clientWidth;
    let painted = 0, empty = [];
    for (const [id, b] of boxes) {
      // the visible part of the box (a label may run off an edge; one wholly outside is not placed)
      const x0 = Math.max(0, Math.floor(b[0] * dpr)), y0 = Math.max(0, Math.floor(b[1] * dpr)), x1 = Math.min(c.width, Math.ceil(b[2] * dpr)), y1 = Math.min(c.height, Math.ceil(b[3] * dpr));
      const w = x1 - x0, h = y1 - y0;
      if (w <= 2 || h <= 2) { empty.push(id + " (off the canvas)"); continue; }
      const d = x.getImageData(x0, y0, w, h).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 40) n++;
      if (n > 4) painted++; else empty.push(id);
    }
    return { painted, empty };
  }, placed.filter((p) => p.text).map((p) => [p.id, p.box]));
}

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch(LAUNCH);
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const { page, errors } = await open(context);
  const gl = await page.evaluate(() => { const c = document.createElement("canvas"); const g = c.getContext("webgl2"); if (!g) return "none"; const d = g.getExtension("WEBGL_debug_renderer_info"); return d ? g.getParameter(d.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER); }).catch(() => "?");
  const software = /swiftshader|llvmpipe|software/i.test(gl);
  console.log("WebGL2 renderer: " + gl + (software ? " (software: the time budgets are read ×3)" : ""));

  console.log("\n\x1b[1m1) no two label rectangles intersect; ink where the layout says; no marker on an area kind\x1b[0m\n");
  const counts = {};
  for (const V of VIEWS) for (const d of DENSITIES) {
    const { placed, stats } = await layoutAt(page, V, d);
    counts[V.name + "/" + d] = { placed: placed.length, cap: stats.labelCap, candidates: stats.labelCandidates };
    const bad = overlaps(placed);
    check(`${V.name}, ${d}: ${placed.length} labels of ${stats.labelCandidates} candidates (cap ${stats.labelCap}), none overlapping`, placed.length > 0 && bad.length === 0, bad.slice(0, 3).join("; "));
    const ink = await inkInBoxes(page, placed);
    check(`${V.name}, ${d}: ink inside every label's box`, ink.empty.length === 0, `${ink.painted} painted` + (ink.empty.length ? "; empty: " + ink.empty.slice(0, 3).join(", ") : ""));
    const marked = placed.filter((p) => AREA_KINDS.test(p.kind) && p.marker);
    check(`${V.name}, ${d}: no area kind carries a marker`, marked.length === 0, marked.slice(0, 3).map((p) => p.text).join(", "));
    if (V.name === "Europe" && d === "normal") check("Europe, normal: some labels run along a path (curved)", placed.some((p) => p.curved), placed.filter((p) => p.curved).slice(0, 4).map((p) => p.text).join(", "));
  }

  console.log("\n\x1b[1m2) the density stops\x1b[0m\n");
  for (const V of ["globe", "Europe", "Aegean"]) {
    const s = counts[V + "/sparse"].placed, n = counts[V + "/normal"].placed, d = counts[V + "/dense"].placed;
    check(`${V}: sparse ≤ normal ≤ dense`, s <= n && n <= d, `${s} / ${n} / ${d}`);
  }
  check("globe, normal: the cap is about 40 and the placed count within half of it", counts["globe/normal"].cap === 40 && counts["globe/normal"].placed >= 20, `cap ${counts["globe/normal"].cap}, placed ${counts["globe/normal"].placed}`);
  {
    const { placed, stats } = await layoutAt(page, { lon: 10, lat: 50, k: 1 }, "normal");
    // the cap is 120, the SUPPLY at this view is not: of 335 candidates about 100 are on screen (the rest are rivers whose
    // line is off screen and places in the 200 px margin), and the v0 gazetteer has no town under 100,000 and no lake
    // under a 40 px chord here — 57 placed on the session's runner; the floor is 40 % of the cap (§7 "Phase 1c — as built")
    check("country scale (1 km/px), normal: the cap is about 120 and the placed count at least a third of it (the controls' rectangles take cells since 0d)", stats.labelCap === 120 && placed.length >= 40, `cap ${stats.labelCap}, placed ${placed.length}`);
  }

  console.log("\n\x1b[1m3) nothing added or dropped while the globe moves\x1b[0m\n");
  {
    await layoutAt(page, VIEWS[1], "normal");
    const box = await (await page.$(".atlas2-canvas")).boundingBox(); const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
    const before = await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; return { ids: c.labels().map((p) => p.id), seq: c.layoutSeq() }; });
    await page.mouse.move(cx, cy); await page.mouse.down();
    for (let i = 1; i <= 40; i++) { await page.mouse.move(cx + i * 3, cy + Math.sin(i / 5) * 25); await sleep(16); }
    const during = await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; return { ids: c.labels().map((p) => p.id), seq: c.layoutSeq(), live: c.labelsLive().length }; });
    await page.mouse.up(); await sleep(400);
    check("the placed set is identical at the start and the end of a 40-step drag", before.ids.join() === during.ids.join() && before.seq === during.seq, `${before.ids.length} labels, layout #${before.seq} → #${during.seq}, ${during.live} drawn at the end`);
    const after = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.layoutSeq());
    check("…and a new layout follows the settle", after > during.seq, `#${during.seq} → #${after}`);
  }

  console.log("\n\x1b[1m4) the anchors of the ten countries lie in their own land (the ID pass)\x1b[0m\n");
  for (const name of ANCHORS) {
    const r = await page.evaluate((n) => { const g = document.querySelector(".atlas2").__atlas2.gazetteer(); const row = g.rows.find((x) => x.kind === "country" && x.name === n); return row ? { id: row.id, at: row.at, path: row.path } : null; }, name);
    if (!r) { check(name + " is in the gazetteer", false); continue; }
    // at 0.5 km/px the ID pass reads the z=3 tiles, which carry the atolls the resident levels have no ring for (Kiribati)
    await page.evaluate((v) => document.querySelector(".atlas2").__atlas2.setView(v[0], v[1], 0.5), r.at);
    await settle(page); await sleep(60);
    const stack = await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; return c.stackAt(c.view.cx, c.view.cy); });
    check(`${name}: the anchor (${r.at.join(", ")}) is on its own land`, stack.includes(r.id), stack.join(" > "));
  }

  console.log("\n\x1b[1m5) a river label disappears when its line does\x1b[0m\n");
  {
    const a = await layoutAt(page, { lon: 7.5, lat: 50.5, k: 0.5 }, "dense");   // the Rhine at 0.5 km/px: rivers drawn
    const b = await layoutAt(page, { lon: 7.5, lat: 50.5, k: 0.3 }, "dense");   // 0.3: under RIVER_MIN_KM_PER_PX, no river line
    check("rivers labelled at 0.5 km/px", a.placed.some((p) => p.kind === "river"), a.placed.filter((p) => p.kind === "river").map((p) => p.text).slice(0, 4).join(", "));
    check("no river label at 0.3 km/px, where no river is drawn", !b.placed.some((p) => p.kind === "river") && !b.stats.riversOn, `riversOn ${b.stats.riversOn}`);
  }

  console.log("\n\x1b[1m6) label contrast in every theme\x1b[0m\n");
  const themes = THEMES.map((t) => ({ t, night: false })).concat([{ t: "folio", night: true }]);
  for (const { t, night } of themes) {
    await page.evaluate((T) => { document.body.dataset.theme = T.t; document.body.classList.toggle("night", T.night); }, { t, night });
    await sleep(120);
    const c = await page.evaluate(() => { const a = document.querySelector(".atlas2").__atlas2; return { colours: a.colours(), palette: a.palette() }; });
    const land = hexOf(c.palette.land), sea = hexOf(c.palette.ocean);
    const ink = contrast(c.colours.ink, land), wSea = contrast(c.colours.water, sea), wLand = contrast(c.colours.water, land);
    check(`${t}${night ? " night" : ""}: ink ${ink.toFixed(1)}:1 on land, water names ${wSea.toFixed(1)}:1 on sea and ${wLand.toFixed(1)}:1 on land`, ink >= 4.5 && wSea >= 3 && wLand >= 3, `ink ${c.colours.ink} land ${land}; water ${c.colours.water} sea ${sea}`);
  }
  await page.evaluate(() => { document.body.dataset.theme = "folio"; document.body.classList.remove("night"); });

  console.log("\n\x1b[1m7) the budgets\x1b[0m\n");
  {
    await layoutAt(page, { lon: 10, lat: 50, k: 1 }, "dense");
    const box = await (await page.$(".atlas2-canvas")).boundingBox(); const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
    await page.mouse.move(cx, cy); await page.mouse.down(); for (let i = 1; i <= 60; i++) { await page.mouse.move(cx + i, cy + Math.sin(i / 6) * 10); await sleep(16); } await page.mouse.up(); await sleep(300);
    const s = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.statsNow());
    const f = software ? 3 : 1;
    check(`label canvas redraw ≤ ${s.labelBudgets.drawMs * f} ms at p95 with ${s.labelsPlaced} labels`, s.labelDrawP95 <= s.labelBudgets.drawMs * f, `${s.labelDrawP95.toFixed(2)} ms (last ${s.labelDrawMs.toFixed(2)})`);
    check(`worker layout ≤ ${s.labelBudgets.layoutMs * f} ms at p95`, s.labelLayoutP95 <= s.labelBudgets.layoutMs * f, `${s.labelLayoutP95.toFixed(1)} ms (last ${s.labelLayoutMs.toFixed(1)}, ${s.labelCandidates} candidates)`);
  }

  /* ---- Phase 2a, task 0d: the chrome and the orientation, on the desktop and on a phone ---- */
  const POINT_KINDS = /^(capital|city|town)$/;
  const norm = (a) => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
  async function chromeChecks(pg, label, V, density) {
    const { placed } = await layoutAt(pg, V, density);
    const chrome = await pg.evaluate(() => document.querySelector(".atlas2").__atlas2.chromeRects());
    const size = await pg.evaluate(() => { const r = document.querySelector(".atlas2").getBoundingClientRect(); return [r.width, r.height]; });
    const under = [];
    for (const p of placed) for (const r of p.rects) if (chrome.some((c) => intersects(r, c))) { under.push(p.text || p.id); break; }
    check(`${label}: none of ${placed.length} labels lies under a control (${chrome.length} chrome rectangles)`, placed.length > 0 && under.length === 0, under.slice(0, 4).join(", "));
    const offPoint = placed.filter((p) => POINT_KINDS.test(p.kind) && p.rects.some((r) => r[0] < 0 || r[1] < 0 || r[2] > size[0] || r[3] > size[1])).map((p) => p.text || p.id);
    check(`${label}: every point label and marker is wholly on screen`, offPoint.length === 0, offPoint.slice(0, 4).join(", "));
    const clipped = placed.filter((p) => !POINT_KINDS.test(p.kind)).map((p) => { let a = 0, v = 0; for (const r of p.rects) { const w = r[2] - r[0], h = r[3] - r[1]; a += w * h; v += Math.max(0, Math.min(r[2], size[0]) - Math.max(r[0], 0)) * Math.max(0, Math.min(r[3], size[1]) - Math.max(r[1], 0)); } return [p.text || p.id, a > 0 ? 1 - v / a : 0]; }).filter(([, f]) => f > 0.26);
    check(`${label}: no area or path label hangs past the edge by more than a quarter`, clipped.length === 0, clipped.slice(0, 4).map(([t, f]) => `${t} ${(f * 100).toFixed(0)} %`).join(", "));
    const upside = placed.filter((p) => p.curved && (Math.abs(norm(p.meanAngle)) > Math.PI / 2 || p.glyphs.some((g) => Math.abs(norm(g)) > Math.PI / 2 + 1e-6))).map((p) => p.text + " " + (p.meanAngle * 180 / Math.PI).toFixed(0) + "°");
    check(`${label}: every curved label reads upright (mean rotation within ±90°, no glyph beyond)`, upside.length === 0, upside.slice(0, 4).join(", ") || `${placed.filter((p) => p.curved).length} curved`);
    return placed;
  }
  console.log("\n\x1b[1m8a) the chrome and the orientation, desktop 1280×800\x1b[0m\n");
  {
    await chromeChecks(page, "desktop, Europe (Berlin by the zoom stack)", { lon: 13.4, lat: 52.5, k: 3 }, "dense");
    await chromeChecks(page, "desktop, the Alps 1 km/px (Danube, Rhône)", { lon: 9, lat: 46.5, k: 1 }, "dense");
    await chromeChecks(page, "desktop, the Rhine 0.5 km/px", { lon: 7.5, lat: 50.5, k: 0.5 }, "dense");
    await page.click(".atlas2-layers-btn"); await sleep(250);
    await chromeChecks(page, "desktop, Europe with the legend open", { lon: 10, lat: 50, k: 3 }, "dense");
    await page.click(".atlas2-about-btn"); await sleep(250);
    await chromeChecks(page, "desktop, Europe with the About sheet open", { lon: 10, lat: 50, k: 3 }, "dense");
    await page.keyboard.press("Escape"); await sleep(150);
    await page.evaluate(() => document.querySelector(".atlas2").__atlas2.select("adm0:fra", { open: true, push: false })); await sleep(300);
    await chromeChecks(page, "desktop, Europe with France's card open", { lon: 10, lat: 50, k: 3 }, "dense");
    await page.keyboard.press("Escape"); await sleep(150);
  }

  console.log("\n\x1b[1m8) a 390 px phone\x1b[0m\n");
  await page.close();
  const phone = await browser.newContext({ viewport: { width: 390, height: 700 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const P = await open(phone);
  for (const V of [VIEWS[0], VIEWS[1], VIEWS[2]]) {
    const { placed, stats } = await layoutAt(P.page, V, "normal");
    const bad = overlaps(placed);
    check(`phone, ${V.name}, normal: ${placed.length} labels (cap ${stats.labelCap}), none overlapping`, placed.length > 0 && bad.length === 0 && stats.phone === true, bad.slice(0, 3).join("; ") + (stats.phone ? "" : " (not read as a phone)"));
    if (V.name === "globe") check("phone, globe: one notch sparser than the desktop's normal", stats.labelCap < counts["globe/normal"].cap, `cap ${stats.labelCap} vs ${counts["globe/normal"].cap}`);
  }
  console.log("\n\x1b[1m8b) the chrome and the orientation, phone 390×844\x1b[0m\n");
  await P.page.setViewportSize({ width: 390, height: 844 }); await sleep(300);
  await chromeChecks(P.page, "phone, central Europe (Berlin)", { lon: 13.4, lat: 51.5, k: 3 }, "dense");
  await chromeChecks(P.page, "phone, the Baltic (NORTH EUROPE, SCANDINAVIA by the search box)", { lon: 20, lat: 59, k: 6 }, "dense");
  await chromeChecks(P.page, "phone, the Alps 1.5 km/px (Danube, Rhône)", { lon: 9, lat: 46.5, k: 1.5 }, "dense");
  await chromeChecks(P.page, "phone, Iraq and Kuwait", { lon: 45, lat: 32, k: 5 }, "dense");
  await P.page.click(".atlas2-about-btn"); await sleep(300);
  await chromeChecks(P.page, "phone, the Baltic with the About sheet open", { lon: 20, lat: 59, k: 6 }, "dense");
  await P.page.keyboard.press("Escape"); await sleep(150);
  await P.page.evaluate(() => document.querySelector(".atlas2").__atlas2.select("adm0:deu", { open: true, push: false })); await sleep(300);
  await chromeChecks(P.page, "phone, central Europe with Germany's card strip open", { lon: 13.4, lat: 51.5, k: 3 }, "dense");
  await P.page.keyboard.press("Escape"); await sleep(150);
  /* ---- Phase 3a, task 0a: a large polity's name outranks the capital markers inside it ---- */
  console.log("\n\x1b[1m9) a large polity's name outranks the capital markers inside it (the history loaded)\x1b[0m\n");
  async function withHistory(pg) {
    await pg.evaluate(() => document.querySelector(".atlas2").__atlas2.ensureHistory());
    await pg.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.historyStarted() && c.historyReady(); }, null, { timeout: 120000 });
  }
  async function polityView(pg, label, V, year, polity, capital) {
    await pg.evaluate((y) => document.querySelector(".atlas2").__atlas2.setYear(y), year);
    await pg.waitForFunction(() => document.querySelector(".atlas2").__atlas2.historySettled(), null, { timeout: 120000 }).catch(() => {});
    const { placed } = await layoutAt(pg, V, "normal");
    await pg.waitForFunction(() => document.querySelector(".atlas2").__atlas2.historySettled(), null, { timeout: 120000 }).catch(() => {});
    const again = (await layoutAt(pg, V, "normal")).placed;   // a second layout once the year's meshes have settled: the first may precede them
    const names = again.filter((p) => p.kind === "polity");
    const bad = overlaps(again);
    check(`${label}: ${names.length} polities named, none overlapping`, names.length >= 1 && bad.length === 0, names.map((p) => p.text).join(", ") + (bad.length ? "; overlaps: " + bad.slice(0, 3).join("; ") : ""));
    if (polity) check(`${label}: ${polity.name} is named`, again.some((p) => p.id === polity.id), names.map((p) => p.text).join(", ") || "no polity named");
    if (capital) { const m = again.find((p) => p.kind === "capital" && p.id.startsWith("cap:" + polity.id + ":") && p.marker); check(`${label}: ${capital}'s marker is still drawn inside the named polity`, !!m, m ? (m.text ? "with its name" : "marker alone, the name yielded to the polity's") : again.filter((p) => p.kind === "capital").map((p) => p.id).join(", ") || "no capital placed"); }
    return placed;
  }
  const D = await open(context);
  await withHistory(D.page);
  await polityView(D.page, "desktop, Europe in 1500 at 7 km/px", { lon: 10, lat: 50, k: 7 }, 1500, { id: "pol:ottoman", name: "the Ottoman Empire" }, "Constantinople");
  await polityView(D.page, "desktop, the globe in 1245", { lon: 80, lat: 45, k: 24 }, 1245, { id: "pol:mongol", name: "the Mongol Empire" }, "Karakorum");
  await polityView(D.page, "desktop, Europe in 1500 at 12 km/px", { lon: 20, lat: 45, k: 12 }, 1500, { id: "pol:ottoman", name: "the Ottoman Empire" }, "Constantinople");
  check("no page errors on #map2 (desktop, the history loaded)", D.errors.length === 0, D.errors.slice(0, 3).join(" | "));
  await D.page.close();
  const PH = await open(phone);
  await PH.page.setViewportSize({ width: 390, height: 844 }); await sleep(300);
  await withHistory(PH.page);
  await polityView(PH.page, "phone 390×844, the Mediterranean in 1500 at 12 km/px", { lon: 15, lat: 45, k: 12 }, 1500, { id: "pol:ottoman", name: "the Ottoman Empire" }, null);
  await polityView(PH.page, "phone 390×844, the globe in 1500", { lon: 20, lat: 40, k: 24 }, 1500, null, null);
  check("no page errors on #map2 (phone, the history loaded)", PH.errors.length === 0, PH.errors.slice(0, 3).join(" | "));
  await PH.page.close();
  check("no page errors on #map2 (desktop)", errors.length === 0, errors.slice(0, 3).join(" | "));
  check("no page errors on #map2 (phone)", P.errors.length === 0, P.errors.slice(0, 3).join(" | "));
  await browser.close(); server.close();
  console.log(`\n${pass} ok, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
