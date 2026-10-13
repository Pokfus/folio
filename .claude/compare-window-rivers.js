#!/usr/bin/env node
/* compare-window-rivers.js — V1's rivers against the engine's, in the very same view, for three card windows (Atlas v2 Phase 4b, Task 4). A tool, not a gate.

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/compare-window-rivers.js [cardId …]      (default: geo-002 rm-003 ru-002)

   For each card it opens the window on the ENGINE (the preview switch on), waits for it to settle and reads its opening view (centre, zoom, size) and the level the engine drew it at. Then, in Node and
   with no browser, it counts what each renderer would draw inside that view:
     V1      rivers.js's polylines (and the hi-res file of the card's frame, which supersedes the entries it names) — every segment with both ends on the near side and inside the window;
     ENGINE  water.bin's river arcs at the resident water level the view uses (min(level, 2)): exactly the segments atlas-worker.js's `buildSegments` hands the renderer for kind RIVER (an arc whose minimum
             level is above the level is skipped, a vertex whose rank is above the level is skipped).
   and prints segments, kilometres, the number of distinct rivers and the named ones for both, with the ratio. The two datasets differ by construction (rivers.js: 1,073 chains traced at two decimals;
   water.bin: Natural Earth 10m scale-rank edition, one record per river per rank, smoothed only from the tile zooms), so the comparison is of DENSITY in the view, not of identity. */
"use strict";
const fs = require("fs"), path = require("path"), http = require("http");
const ROOT = path.resolve(__dirname, "..");
const cards = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const CARDS = cards.length ? cards : ["geo-002", "rm-003", "ru-002"];
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream", ".woff2": "font/woff2" };
const PORT = 5630;
const D = Math.PI / 180, R_KM = 6371.0088;

/* ---- the geometry, shared by both sides ---- */
function viewer(v) {
  const base = 0.46 * Math.min(v.w, v.h), radius = base * v.zoom, lo0 = v.lon * D, la0 = v.lat * D;
  // orthographic about (lon, lat): the standard rotation
  const sl = Math.sin(la0), cl = Math.cos(la0);
  return (lon, lat) => {
    const lo = lon * D - lo0, la = lat * D, cla = Math.cos(la), x = cla * Math.sin(lo), y = Math.cos(la0) * Math.sin(la) - Math.sin(la0) * cla * Math.cos(lo), z = sl * Math.sin(la) + cl * cla * Math.cos(lo);
    return z < 0 ? null : [v.w / 2 + radius * x, v.h / 2 - radius * y];
  };
}
const inside = (p, w, h) => p && p[0] >= 0 && p[1] >= 0 && p[0] <= w && p[1] <= h;
const hav = (a, b) => { const dLa = (b[1] - a[1]) * D, dLo = (b[0] - a[0]) * D, s = Math.sin(dLa / 2) ** 2 + Math.cos(a[1] * D) * Math.cos(b[1] * D) * Math.sin(dLo / 2) ** 2; return 2 * R_KM * Math.asin(Math.sqrt(s)); };

function v1Rivers(v, region) {
  global.window = global.window || {};
  delete require.cache[require.resolve(path.join(ROOT, "rivers.js"))]; require(path.join(ROOT, "rivers.js"));
  let list = window.RIVERS.slice();
  if (region) {
    const f = path.join(ROOT, "rivers", region + ".js");
    if (fs.existsSync(f)) {
      window.HIRES_RIVER_IN = []; delete require.cache[require.resolve(f)]; require(f);
      const e = (window.HIRES_RIVER_IN || [])[0];
      if (e && e.rivers) { const sup = new Set((e.supersede || []).map(String)); list = list.filter((r) => !sup.has(String(r.n))).concat(e.rivers); }
    }
  }
  const P = viewer(v); let segs = 0, km = 0; const seen = new Set(), named = new Set();
  for (const r of list) for (const line of r.p) for (let i = 1; i < line.length; i++) {
    const a = P(line[i - 1][0], line[i - 1][1]), b = P(line[i][0], line[i][1]);
    if (inside(a, v.w, v.h) && inside(b, v.w, v.h)) { segs++; km += hav(line[i - 1], line[i]); seen.add(r.n + "/" + list.indexOf(r)); if (r.n) named.add(r.n); }
  }
  return { segs, km: Math.round(km), rivers: seen.size, named: named.size, source: list.length + " chains" + (region ? " (hi-res " + region + ")" : "") };
}

let WATER = null;
function engineRivers(v, level) {
  global.window = global.window || globalThis; globalThis.window = globalThis;
  if (!WATER) {
    const F = require(path.join(ROOT, "atlas", "atlas-format.js")); globalThis.AtlasFormat = F;
    require(path.join(ROOT, "atlas", "vendor", "earcut.js")); if (typeof globalThis.earcut !== "function" && globalThis.window.earcut) globalThis.earcut = globalThis.window.earcut;
    try { require(path.join(ROOT, "atlas", "study.js")); } catch (e) { /* only a Worker needs it */ }
    require(path.join(ROOT, "atlas", "atlas-worker.js"));
    const buf = fs.readFileSync(path.join(ROOT, "atlas", "data", "water.bin"));
    const T = F.read(new Uint8Array(buf));
    WATER = { T, W: globalThis.AtlasWorkerMain._debug };
    return null;
  }
  return null;
}
async function engineSegs(v, level) {
  engineRivers(v, level);
  const { T, W } = WATER;
  if (!WATER.pos) WATER.pos = await W.unitVectors(T);
  const segs = W.buildSegments(T, WATER.pos, level, null, 2);   // kind RIVER = 2
  const P = viewer(v), ll = (x, y, z) => [Math.atan2(y, x) / D, Math.asin(Math.max(-1, Math.min(1, z))) / D];
  let n = 0, km = 0; const tags = new Set();
  for (let i = 0; i < segs.length; i += 7) {
    const a = ll(segs[i], segs[i + 1], segs[i + 2]), b = ll(segs[i + 3], segs[i + 4], segs[i + 5]);
    if (inside(P(a[0], a[1]), v.w, v.h) && inside(P(b[0], b[1]), v.w, v.h)) { n++; km += hav(a, b); tags.add(Math.floor(segs[i + 6] / 64)); }
  }
  return { segs: n, km: Math.round(km), arcs: tags.size, source: "water.bin level " + level + ", " + (segs.length / 7) + " river segments in the world at that level" };
}

(async () => {
  const { chromium } = require("playwright");
  const server = http.createServer((req, res) => { const p = decodeURIComponent(req.url.split("?")[0]) === "/" ? "/index.html" : decodeURIComponent(req.url.split("?")[0]); fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { res.writeHead(404); res.end(); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(p)] || "application/octet-stream", "Content-Length": d.length }); res.end(d); }); });
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch(process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {});
  const out = [];
  for (const id of CARDS) {
    const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 } });
    await ctx.addInitScript((cid) => { try { localStorage.setItem("folio.atlas2.preview", "1"); localStorage.setItem("folio_tour_v1", "1"); localStorage.setItem("folio_atlas_tour_v1", "1"); } catch (e) {} if (/^geo-/.test(cid)) sessionStorage.setItem("folio_study_v1", JSON.stringify({ scope: { type: "card", id: cid }, queue: [cid], id: cid, qi: 0, rev: false, studied: 0 })); }, id);
    const page = await ctx.newPage();
    await page.goto(`http://127.0.0.1:${PORT}/#${/^geo-/.test(id) ? "study" : "card/" + id}`, { waitUntil: "load" });
    await page.waitForFunction(() => { const h = document.querySelector(".map-card"); return h && h.getAttribute("data-map-engine") === "v2" && h._folioMap && h._folioMap.ready() && h._folioMap.settled && h._folioMap.settled(); }, null, { timeout: 240000 });
    await page.waitForTimeout(800);
    const info = await page.evaluate(() => { const h = document.querySelector(".map-card"), c = h.querySelector(".mc-canvas"), v = h._folioMap.view(), l = AtlasEmbed.hub().last; return { lon: v.lon, lat: v.lat, zoom: v.zoom, w: c.clientWidth, h: c.clientHeight, level: l.level, kmpp: l.kmpp, region: h.getAttribute("data-map-card") || "", layer: h.getAttribute("data-map-layer") || "" }; });
    await ctx.close();
    const v = { lon: info.lon, lat: info.lat, zoom: info.zoom, w: info.w, h: info.h };
    // V1's frame: italy / greece hi-res rivers for those collections (CMAP_HIRES), none for the layers whose hi-res row has no river file here
    const region = /^rm-/.test(id) ? "italy" : /^gr-/.test(id) ? "greece" : "";
    const a = v1Rivers(v, region), lvl = Math.min(info.level, 2), b = await engineSegs(v, lvl), b2 = lvl < 2 ? await engineSegs(v, lvl + 1) : null;   // b2: the next finer resident water level, for the owner's question "how much more would one level finer draw"
    out.push({ id, finer: b2 && { level: lvl + 1, segs: b2.segs, km: b2.km, kmRatio: a.km ? +(b2.km / a.km).toFixed(2) : null }, view: { lon: +v.lon.toFixed(2), lat: +v.lat.toFixed(2), zoom: +v.zoom.toFixed(2), size: v.w + "×" + v.h, kmPerPx: +info.kmpp.toFixed(2), engineLevel: info.level }, v1: a, engine: b, kmRatio: a.km ? +(b.km / a.km).toFixed(2) : null, segRatio: a.segs ? +(b.segs / a.segs).toFixed(2) : null });
  }
  await browser.close(); server.close();
  for (const o of out) {
    console.log(`\n${o.id}  view ${o.view.lon}°, ${o.view.lat}°  zoom ${o.view.zoom}  ${o.view.size} px  ${o.view.kmPerPx} km/px  (engine level ${o.view.engineLevel})`);
    console.log(`  V1      ${String(o.v1.segs).padStart(6)} segments  ${String(o.v1.km).padStart(7)} km  ${o.v1.rivers} rivers (${o.v1.named} named)   ${o.v1.source}`);
    console.log(`  ENGINE  ${String(o.engine.segs).padStart(6)} segments  ${String(o.engine.km).padStart(7)} km  ${o.engine.arcs} arcs               ${o.engine.source}`);
    console.log(`  engine / V1: ${o.kmRatio} of the kilometres, ${o.segRatio} of the segments`);
    if (o.finer) console.log(`  one level finer (water level ${o.finer.level}): ${o.finer.segs} segments, ${o.finer.km} km = ${o.finer.kmRatio} of V1's kilometres`);
  }
  if (process.argv.includes("--json")) console.log(JSON.stringify(out));
})().catch((e) => { console.error(e); process.exit(1); });
