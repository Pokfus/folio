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
       its marker) is wholly on screen; an area or path label lies wholly inside the viewport (Phase 3c; it was a quarter hanging over);
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
  /* FOLIO_SLOW_FRAMES=<ms> makes the race of layoutAt (below) happen on any machine: requestAnimationFrame callbacks arrive that many ms late WITHOUT blocking the page's JavaScript, as they do when a software rasteriser's previous frame still holds the compositor (a CI runner: 100+ ms). Unset, nothing changes. */
  if (process.env.FOLIO_SLOW_FRAMES) await page.addInitScript((d) => { const raf = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = (cb) => setTimeout(() => raf(cb), d); }, Number(process.env.FOLIO_SLOW_FRAMES));
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  await page.goto(`http://127.0.0.1:${PORT}/${hash || "#map"}`, { waitUntil: "load" });
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
  /* THE LAYOUT AND ITS PAINT ARE TWO EVENTS, AND THIS HELPER USED TO READ THE SECOND AFTER A TIMER (the Songhai flake, CI 2026-10-14/15). `layoutNow()` resolves inside applyLayout, which sets the new
     placement and only ASKS for a repaint (invalidateLabels → requestAnimationFrame): the label canvas still shows the PREVIOUS layout until a frame has run. The old code waited 60 ms and read the ink; a frame
     with a history year on screen costs well over that on a software rasteriser, so a name the second layout placed and the first did not (Songhai at Europe in 1500) had no ink yet. The read now happens only
     when (1) a frame has completed after the layout was applied and (2) the layout on the canvas is still the one returned (`layoutSeq` unchanged — a later layout, a water or gazetteer one, would be a new
     placement the caller never saw); otherwise the layout is asked for again. No timer decides anything, and nothing about the assertions is loosened. */
  let placed, stats;
  for (let attempt = 0; attempt < 6; attempt++) {
    const got = await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; return c.layoutNow().then((p) => ({ seq: c.layoutSeq(), frames: c.statsNow().frames, placed: p.map((x) => ({ id: x.id, kind: x.kind, style: x.style, text: x.text, rects: x.rects, box: x.box, marker: !!x.marker, curved: !!x.curved, score: x.score, glyphs: x.glyphs ? x.glyphs.map((g) => g[2]) : [], meanAngle: x.meanAngle || 0 })) })); });
    await page.evaluate(() => document.querySelector(".atlas2").__atlas2.invalidate());
    await page.waitForFunction((f0) => document.querySelector(".atlas2").__atlas2.statsNow().frames > f0, got.frames, { timeout: 60000 });
    stats = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.statsNow());
    placed = got.placed;
    if (await page.evaluate((seq) => document.querySelector(".atlas2").__atlas2.layoutSeq() === seq, got.seq)) break;
  }
  return { placed, stats };
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
  /* ---- Phase 3c, decision 3: seas, rivers and regions follow the polities' rule — inside the frame ---- */
  const SWEEP = [{ lon: 25, lat: 36, k: 12 }, { lon: 12, lat: 55, k: 9 }, { lon: -40, lat: 30, k: 30 }, { lon: 60, lat: 25, k: 12 }, { lon: 100, lat: 10, k: 10 }, { lon: -75, lat: 8, k: 8 }, { lon: 2, lat: 41, k: 4 }, { lon: 15, lat: 45, k: 20 }, { lon: 33, lat: 30, k: 6 }];
  async function areaSweep(pg, name) {
    let n = 0, nSea = 0, nRiver = 0; const out = [];
    const size = await pg.evaluate(() => { const r = document.querySelector(".atlas2").getBoundingClientRect(); return [r.width, r.height]; });
    for (const V of SWEEP) {
      const { placed } = await layoutAt(pg, V, "dense");
      for (const p of placed) {
        if (POINT_KINDS.test(p.kind) || !p.rects || !p.rects.length) continue;
        n++; if (/^(sea|ocean|gulf|strait)$/.test(p.kind)) nSea++; if (p.kind === "river") nRiver++;
        if (p.rects.some((r) => r[0] < -0.5 || r[1] < -0.5 || r[2] > size[0] + 0.5 || r[3] > size[1] + 0.5)) out.push(`${p.text || p.id} (${p.kind}) at ${V.lon},${V.lat} ${V.k}`);
      }
    }
    check(`${name}: ${n} area and path names over ${SWEEP.length} views (${nSea} water bodies, ${nRiver} rivers), none outside the frame`, n > 20 && nSea > 0 && out.length === 0, out.slice(0, 4).join("; "));
  }
  async function chromeChecks(pg, label, V, density) {
    const { placed } = await layoutAt(pg, V, density);
    const chrome = await pg.evaluate(() => document.querySelector(".atlas2").__atlas2.chromeRects());
    const size = await pg.evaluate(() => { const r = document.querySelector(".atlas2").getBoundingClientRect(); return [r.width, r.height]; });
    const under = [];
    for (const p of placed) for (const r of p.rects) if (chrome.some((c) => intersects(r, c))) { under.push(p.text || p.id); break; }
    check(`${label}: none of ${placed.length} labels lies under a control (${chrome.length} chrome rectangles)`, placed.length > 0 && under.length === 0, under.slice(0, 4).join(", "));
    const offPoint = placed.filter((p) => POINT_KINDS.test(p.kind) && p.rects.some((r) => r[0] < 0 || r[1] < 0 || r[2] > size[0] || r[3] > size[1])).map((p) => p.text || p.id);
    check(`${label}: every point label and marker is wholly on screen`, offPoint.length === 0, offPoint.slice(0, 4).join(", "));
    // Phase 3c, decision 3: an area or path name (a sea, a river, a region, a polity) lies wholly inside the frame, as a polity's has since 3b
    const clipped = placed.filter((p) => !POINT_KINDS.test(p.kind) && p.rects.some((r) => r[0] < -0.5 || r[1] < -0.5 || r[2] > size[0] + 0.5 || r[3] > size[1] + 0.5)).map((p) => [p.text || p.id, p.kind]);
    check(`${label}: no area or path label leaves the frame at all`, clipped.length === 0, clipped.slice(0, 4).map(([t, k]) => `${t} (${k})`).join(", "));
    const upside = placed.filter((p) => p.curved && (Math.abs(norm(p.meanAngle)) > Math.PI / 2 || p.glyphs.some((g) => Math.abs(norm(g)) > Math.PI / 2 + 1e-6))).map((p) => p.text + " " + (p.meanAngle * 180 / Math.PI).toFixed(0) + "°");
    check(`${label}: every curved label reads upright (mean rotation within ±90°, no glyph beyond)`, upside.length === 0, upside.slice(0, 4).join(", ") || `${placed.filter((p) => p.curved).length} curved`);
    return placed;
  }
  /* ---- Oct 2026, owner decision 1: the names follow the reader's Text size (Settings → Text size, `body[data-fs]` → `--fs`) ---- */
  /* WHAT IT PROVES. At the smallest, the default and the largest stop, on a 1280×800 desktop and a 390×844 phone: (1) the factor the Atlas reads is the stylesheet's own --fs over what Medium is on that device
     (desktop .8 / 1 / 1.32; phone .78 / 1 / 1.27 — the phone's Medium is the default look, so a reader who never touched the slider sees exactly what they saw); (2) the city names' boxes grow with it
     (the rectangle the worker lays out is 1.2 × the style's size × the factor), so the collision arithmetic is scaled with the type; (3) the INK is as wide as its box at every stop — a font that did not follow
     the advances would read 0.76 or 1.25 of it; (4) at every stop no two names overlap, none leaves the frame and none lies under a control (the chrome checks of 8a/8b, run again at each stop). */
  const FS_EXPECT = { desktop: { tiny: 0.8, medium: 1, huge: 1.32 }, phone: { tiny: 0.78, medium: 1, huge: 1.27 } };
  async function textSizeSection(pg, label, kind) {
    console.log(`\n\x1b[1m12) Text size reaches the names — ${label}\x1b[0m\n`);
    const V = { lon: 10, lat: 50, k: 3 };
    await pg.evaluate(() => document.querySelector(".atlas2").__atlas2.setYear(new Date().getUTCFullYear()));
    await pg.waitForFunction(() => document.querySelector(".atlas2").__atlas2.historySettled(), null, { timeout: 120000 }).catch(() => {});
    const CITY_H = 1.2 * 11.5;   // a city name's rectangle at scale 1: the style's 11.5 px × the shaper's 1.2
    const mean = {};
    for (const fs of ["tiny", "medium", "huge"]) {
      const want = FS_EXPECT[kind][fs];
      await pg.evaluate((f) => { document.body.dataset.fs = f; }, fs);
      const got = await pg.waitForFunction((w) => document.querySelector(".atlas2").__atlas2.labelScale() === w, want, { timeout: 15000 }).then(() => want, () => pg.evaluate(() => document.querySelector(".atlas2").__atlas2.labelScale()));
      check(`${label}, ${fs}: the Atlas reads ×${want} off --fs`, got === want, "read ×" + got);
      const placed = await chromeChecks(pg, `${label}, ${fs}`, V, "dense");
      const bad = overlaps(placed);
      check(`${label}, ${fs}: ${placed.length} names, none overlapping`, placed.length > 0 && bad.length === 0, bad.slice(0, 3).join("; "));
      const cities = placed.filter((p) => p.kind === "city" && p.style === "city" && !p.curved && p.text && p.rects.length >= 1);
      const hs = cities.map((p) => p.rects[0][3] - p.rects[0][1]);
      mean[fs] = hs.length ? hs.reduce((a, b) => a + b, 0) / hs.length : 0;
      check(`${label}, ${fs}: the ${cities.length} city names' boxes are ${(CITY_H * want).toFixed(1)} px tall (the style's size × ${want})`, cities.length >= 3 && Math.abs(mean[fs] - CITY_H * want) < 0.15, mean[fs].toFixed(2) + " px");
      const ratios = await pg.evaluate((boxes) => {
        const c = document.querySelector(".atlas2-labels"), x = c.getContext("2d"), dpr = c.width / c.clientWidth, out = [];
        for (const b of boxes) {
          const x0 = Math.max(0, Math.floor((b[0] - 1) * dpr)), y0 = Math.max(0, Math.floor(b[1] * dpr)), x1 = Math.min(c.width, Math.ceil((b[2] + 1) * dpr)), y1 = Math.min(c.height, Math.ceil(b[3] * dpr));
          if (x1 - x0 < 4 || y1 - y0 < 4) continue;
          const d = x.getImageData(x0, y0, x1 - x0, y1 - y0).data, w = x1 - x0; let lo = w, hi = -1;
          for (let i = 3, k = 0; i < d.length; i += 4, k++) if (d[i] > 90) { const col = k % w; if (col < lo) lo = col; if (col > hi) hi = col; }
          if (hi > lo) out.push(((hi - lo + 1) / dpr) / (b[2] - b[0]));
        }
        return out;
      }, cities.slice(0, 8).map((p) => p.rects[0]));
      ratios.sort((a, b) => a - b); const med = ratios.length ? ratios[Math.floor(ratios.length / 2)] : 0;
      check(`${label}, ${fs}: the ink is as wide as its box (median ink ÷ box over ${ratios.length} city names)`, ratios.length >= 3 && med > 0.88 && med < 1.16, med.toFixed(3));
    }
    check(`${label}: the boxes follow the setting (tiny ${mean.tiny.toFixed(1)} < medium ${mean.medium.toFixed(1)} < huge ${mean.huge.toFixed(1)} px)`, mean.tiny < mean.medium && mean.medium < mean.huge && Math.abs(mean.huge / mean.tiny - FS_EXPECT[kind].huge / FS_EXPECT[kind].tiny) < 0.04, (mean.huge / mean.tiny).toFixed(3) + " × between the ends");
    await pg.evaluate(() => { document.body.dataset.fs = "medium"; });
    await pg.waitForFunction(() => document.querySelector(".atlas2").__atlas2.labelScale() === 1, null, { timeout: 15000 }).catch(() => {});
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
  // the Aegean on a phone is centred a little south (37.3°, not 38°): the study panel (Phase 3b) is chrome across the top 120 px of a 700 px
  // frame, and at 0.5 km/px the Aegean Sea's own name sits under it from 38° — the engine rightly keeps every name out from under a control
  for (const V of [VIEWS[0], VIEWS[1], Object.assign({}, VIEWS[2], { lat: 37.3 })]) {
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
  /* ---- Phase 4c, task 0a: a label is whole and clear of the controls WHILE the map moves, not only when it settles ---- */
  console.log("\n\x1b[1m11) labels stay whole and clear of the controls during a drag (the owner's phone: \"ille\" for Lille, \"Essen\" under the ? button)\x1b[0m\n");
  for (const [width, night] of [[390, true], [390, false], [360, true], [360, false]]) {
    const pg = P.page; await pg.setViewportSize({ width, height: 844 }); await sleep(300);
    await pg.evaluate((n) => document.body.classList.toggle("night", n), night); await sleep(200);
    const cdp = await pg.context().newCDPSession(pg);
    const send = (type, touchPoints) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints });
    // what is DRAWN and tappable right now: every live label's rectangles at their present place, against the frame and the controls
    const drawn = () => pg.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2, b = document.querySelector(".atlas2-canvas").getBoundingClientRect(), ch = c.chromeRects(), bad = []; let n = 0;
      for (const e of c.labelsLive()) { n++; for (const q of e.p.rects) { const r = [q[0] + e.dx, q[1] + e.dy, q[2] + e.dx, q[3] + e.dy];
        if (r[0] < 0 || r[1] < 0 || r[2] > b.width || r[3] > b.height) bad.push((e.p.text || e.p.id) + " leaves the frame"); else if (ch.some((k) => r[0] < k[2] && r[2] > k[0] && r[1] < k[3] && r[3] > k[1])) bad.push((e.p.text || e.p.id) + " under a control"); } }
      return { n, bad, lon: c.view.lon }; });
    const label = `phone ${width}×844 ${night ? "dark" : "light"}`;
    for (const V of [{ lon: 5.67, lat: 51.2, k: 1.2 }, { lon: 13.4, lat: 51.5, k: 3 }]) {
      await layoutAt(pg, V, "dense");
      const box = await (await pg.$(".atlas2-canvas")).boundingBox(); const sx = box.x + box.width / 2, sy = box.y + box.height / 2;
      let worst = 0, total = 0, moved = false; const bad = [];
      for (const [mx, my] of [[-90, 0], [90, 0], [0, -120], [0, 120], [-60, 80], [70, -90]]) {
        await layoutAt(pg, V, "dense");
        const lon0 = (await drawn()).lon;
        await send("touchStart", [{ x: sx, y: sy, id: 1 }]);
        for (let i = 1; i <= 8; i++) { await send("touchMove", [{ x: sx + mx * i / 8, y: sy + my * i / 8, id: 1 }]); await sleep(16); }
        const mid = await drawn(); await send("touchEnd", []); const end = await drawn();   // the second read is before the layout the release asks for
        if (Math.abs(mid.lon - lon0) > 1e-6) moved = true;
        total += mid.n + end.n; worst = Math.max(worst, mid.bad.length, end.bad.length); bad.push(...mid.bad, ...end.bad);
        await sleep(400);
      }
      check(`${label}, ${V.lon}°, ${V.lat}° at ${V.k} km/px: six drags — ${total} live labels read mid-gesture and at release, none leaves the frame or lies under a control`, moved && total > 40 && bad.length === 0, bad.slice(0, 4).join("; ") || `${total} read`);
    }
    await cdp.detach();
  }
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
    // task 0c (Phase 3b): a polity's name is never cut by the frame's edge, and a name broken onto two lines keeps its glyphs index for index with its text
    const frame = await pg.evaluate(() => { const r = document.querySelector(".atlas2-canvas").getBoundingClientRect(); return [r.width, r.height]; });
    const out = names.filter((p) => p.rects.some((r) => r[0] < 0 || r[1] < 0 || r[2] > frame[0] || r[3] > frame[1]));
    check(`${label}: every polity name lies wholly inside the ${Math.round(frame[0])}×${Math.round(frame[1])} frame`, out.length === 0, out.map((p) => p.text + " " + JSON.stringify(p.box.map(Math.round))).join("; ") || names.length + " names");
    const skew = names.filter((p) => p.glyphs.length !== [...p.text].length);
    check(`${label}: every polity name has one glyph per character (a name on two lines too)`, skew.length === 0, skew.map((p) => p.text).join(", "));
    if (names.length) { const ink = await inkInBoxes(pg, names); check(`${label}: every polity name is painted where the layout puts it`, ink.empty.length === 0, ink.empty.join(", ") || ink.painted + " painted"); }
    if (polity) check(`${label}: ${polity.name} is named`, again.some((p) => p.id === polity.id), names.map((p) => p.text).join(", ") || "no polity named");
    if (capital) { const m = again.find((p) => p.kind === "capital" && p.id.startsWith("cap:" + polity.id + ":") && p.marker); check(`${label}: ${capital}'s marker is still drawn inside the named polity`, !!m, m ? (m.text ? "with its name" : "marker alone, the name yielded to the polity's") : again.filter((p) => p.kind === "capital").map((p) => p.id).join(", ") || "no capital placed"); }
    return placed;
  }
  const D = await open(context);
  await withHistory(D.page);
  await polityView(D.page, "desktop, Europe in 1500 at 7 km/px", { lon: 10, lat: 50, k: 7 }, 1500, { id: "pol:ottoman", name: "the Ottoman Empire" }, "Constantinople");
  await polityView(D.page, "desktop, the globe in 1245", { lon: 80, lat: 45, k: 24 }, 1245, { id: "pol:mongol", name: "the Mongol Empire" }, "Karakorum");
  await polityView(D.page, "desktop, Europe in 1500 at 12 km/px", { lon: 20, lat: 45, k: 12 }, 1500, { id: "pol:ottoman", name: "the Ottoman Empire" }, "Constantinople");
  /* 2d, task 0b — a people's name stays legible over its own stipple. The people styles are thin italics tracked wide, and the stipple lies under
     them (dots 1.35 px in radius): the halo is wide enough (PEOPLE_HALO) that every solid ink pixel of the name has an opaque pixel (ink or halo) on
     every side for two pixels, so a dot never touches a stroke. Measured on the labels canvas itself, at 1 device px per CSS px. */
  {
    const pg = D.page;
    await pg.evaluate(() => document.querySelector(".atlas2").__atlas2.setLayers({ peoples: "linked", countries: true, places: true, physical: true, cities: true }));
    const placedP = (await layoutAt(pg, { lon: 36, lat: 49, k: 8 }, "normal")).placed;   // placeholder to set the view; the year is set next
    void placedP;
    await pg.evaluate(() => document.querySelector(".atlas2").__atlas2.setYear(375));
    await pg.waitForFunction(() => document.querySelector(".atlas2").__atlas2.historySettled(), null, { timeout: 120000 }).catch(() => {});
    let L = (await layoutAt(pg, { lon: 36, lat: 49, k: 8 }, "normal")).placed;
    await pg.waitForFunction(() => document.querySelector(".atlas2").__atlas2.historySettled(), null, { timeout: 120000 }).catch(() => {});
    L = (await layoutAt(pg, { lon: 36, lat: 49, k: 8 }, "normal")).placed;
    const peoples = L.filter((p) => /^pol:/.test(p.id) && (p.kind === "people" || p.kind === "culture") && p.text);
    check("375 CE over the steppe: the Goths' and the Huns' names are laid out (people style)", peoples.length >= 2, peoples.map((p) => p.text).join(", "));
    const read = await pg.evaluate((boxes) => {
      const c = document.querySelector(".atlas2-labels"), x = c.getContext("2d"), dpr = c.width / c.clientWidth;
      const halo = document.querySelector(".atlas2").__atlas2.colours().halo; const n = parseInt(halo.slice(1), 16), I = [(n >> 16) & 255, (n >> 8) & 255, n & 255];   // the halo's colour: an "ink" pixel is one that differs from it
      const out = [];
      for (const [id, b] of boxes) {
        const x0 = Math.max(0, Math.floor(b[0] * dpr) - 4), y0 = Math.max(0, Math.floor(b[1] * dpr) - 4), x1 = Math.min(c.width, Math.ceil(b[2] * dpr) + 4), y1 = Math.min(c.height, Math.ceil(b[3] * dpr) + 4);
        const w = x1 - x0, h = y1 - y0; if (w < 5 || h < 5) { out.push({ id, solid: 0, bare: 0 }); continue; }
        const d = x.getImageData(x0, y0, w, h).data; let solid = 0, bare = 0;
        for (let yy = 2; yy < h - 2; yy++) for (let xx = 2; xx < w - 2; xx++) {
          const i = (yy * w + xx) * 4; if (d[i + 3] < 128 || Math.abs(d[i] - I[0]) + Math.abs(d[i + 1] - I[1]) + Math.abs(d[i + 2] - I[2]) < 160) continue;
          solid++; let open = false;
          for (let dy = -2; dy <= 2 && !open; dy++) for (let dx = -2; dx <= 2; dx++) if (dx * dx + dy * dy <= 4 && d[((yy + dy) * w + xx + dx) * 4 + 3] < 128) { open = true; break; }
          if (open) bare++;
        }
        out.push({ id, solid, bare });
      }
      return out;
    }, peoples.map((p) => [p.id, p.box]));
    for (const r of read) check(`375 CE: ${r.id.replace("pol:", "")}'s name has an opaque halo two pixels deep round every ink pixel (${r.solid} solid ink pixels, ${r.bare} with a gap within 2 px)`, r.solid > 20 && r.bare <= Math.max(2, Math.round(r.solid * 0.05)), JSON.stringify(r));
  }
  check("no page errors on #map (desktop, the history loaded)", D.errors.length === 0, D.errors.slice(0, 3).join(" | "));
  console.log("\n\x1b[1m10) area and path names stay inside the frame (a sweep of views)\x1b[0m\n");
  await areaSweep(D.page, "desktop 1280×800");
  // Phase 4 / 0c: a dated Wikidata name changes the display name in its years (Kingdom of Hungary 1920–43, Federal State of Austria 1934–37) and the Cliopatria name stands in the others
  for (const [yr, id, want, V] of [[1942, "pol:hungary_1918", "Kingdom of Hungary", { lon: 19.5, lat: 47, k: 2 }], [1919, "pol:hungary_1918", "Hungarian Republic", { lon: 19.5, lat: 47, k: 2 }], [1936, "pol:austria_1918", "Federal State of Austria", { lon: 14, lat: 47.5, k: 2 }], [1925, "pol:austria_1918", "Republic of Austria", { lon: 14, lat: 47.5, k: 2 }]]) {
    await D.page.evaluate((y) => document.querySelector(".atlas2").__atlas2.setYear(y), yr);
    await D.page.waitForFunction(() => document.querySelector(".atlas2").__atlas2.historySettled(), null, { timeout: 120000 }).catch(() => {});
    await layoutAt(D.page, V, "normal"); await D.page.waitForFunction(() => document.querySelector(".atlas2").__atlas2.historySettled(), null, { timeout: 120000 }).catch(() => {});
    const placed = (await layoutAt(D.page, V, "normal")).placed, row = await D.page.evaluate((i) => document.querySelector(".atlas2").__atlas2.rowName(i), id), lab = placed.find((p) => p.id === id);
    check(`${yr}: ${id.replace("pol:", "")} is "${want}" (the place card and stack read "${row}"; the label reads "${lab ? lab.text : "not named"}")`, row === want && (!lab || lab.text.replace(/\s+/g, " ").toLowerCase() === want.toLowerCase()), `${row} / ${lab ? lab.text : "-"}`);
  }
  await textSizeSection(D.page, "desktop 1280×800", "desktop");
  await D.page.close();
  const PH = await open(phone);
  await PH.page.setViewportSize({ width: 390, height: 844 }); await sleep(300);
  await withHistory(PH.page);
  await polityView(PH.page, "phone 390×844, the Mediterranean in 1500 at 12 km/px", { lon: 15, lat: 45, k: 12 }, 1500, { id: "pol:ottoman", name: "the Ottoman Empire" }, null);
  await polityView(PH.page, "phone 390×844, the globe in 1500", { lon: 20, lat: 40, k: 24 }, 1500, { id: "pol:ottoman", name: "the Ottoman Empire" }, null);   // 3a left it unnamed: 97 px of name against a 42 px polity; it now breaks onto two lines
  // the owner's phone: the Mali Empire cut by the frame's edge (task 0c). The same view names it, wholly inside
  {
    const m = (await layoutAt(PH.page, { lon: 20, lat: 40, k: 24 }, "normal")).placed.find((p) => p.id === "pol:mali");
    check("phone 390×844, the globe in 1500: the Mali Empire is named and not cut by the frame", !!m && m.rects.every((r) => r[0] >= 0), m ? JSON.stringify(m.box.map(Math.round)) : "not named");
    const o = (await layoutAt(PH.page, { lon: 20, lat: 40, k: 24 }, "normal")).placed.find((p) => p.id === "pol:ottoman");
    check("phone 390×844, the globe in 1500: the Ottoman Empire's name is on two lines (two rows of glyphs, as wide as its land)", !!o && o.rects.length === 2 && o.rects[0][3] <= o.rects[1][1] + 1, o ? o.rects.length + " rects" : "not named");
  }
  // a sweep of phone views over the 1500 map: no polity name, in any of them, cut by an edge
  for (const V of [{ lon: -5, lat: 15, k: 12 }, { lon: 30, lat: 40, k: 16 }, { lon: 30, lat: 38, k: 12 }, { lon: 10, lat: 50, k: 12 }, { lon: 35, lat: 40, k: 24 }]) await polityView(PH.page, `phone 390×844, 1500 at ${V.lon}°, ${V.lat}°, ${V.k} km/px`, V, 1500, null, null);
  await areaSweep(PH.page, "phone 390×844");
  await textSizeSection(PH.page, "phone 390×844", "phone");
  check("no page errors on #map (phone, the history loaded)", PH.errors.length === 0, PH.errors.slice(0, 3).join(" | "));
  await PH.page.close();
  check("no page errors on #map (desktop)", errors.length === 0, errors.slice(0, 3).join(" | "));
  check("no page errors on #map (phone)", P.errors.length === 0, P.errors.slice(0, 3).join(" | "));
  await browser.close(); server.close();
  console.log(`\n${pass} ok, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
