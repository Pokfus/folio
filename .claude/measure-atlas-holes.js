#!/usr/bin/env node
/* measure-atlas-holes.js — the primitive budgets of the Atlas's fixed views WITH A STATE SELECTED, and whether the selected state is whole (Atlas v2 Phase 4b, Task 6). A tool, not a gate.

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/measure-atlas-holes.js [--json]

   The core holds a country's face AND its admin-1 children's, overlapping; with no depth buffer the later triangle won and a selected state drew with holes. Phase 4 fixed the windows with a second face pass
   (which doubled the primitives of a view with a face selected and so was not applied to the Atlas page); Phase 4b orders the faces in the worker instead — the children are a second bucketed list drawn after
   the parents (atlas-worker.js `bucketFaces`, atlas-gl.js `drawFaces`). Run from a tree, this prints for each view of test-atlas-perf.js's table (1280×800, the same centres and km per pixel) with one state selected:
   the land triangles, segments and draws the renderer reports, and the fraction of the state's interior that is the selection colour. Run it in two trees (before / after) and compare: the rule is that the
   triangles and segments do not grow by more than 5 %. It drives the engine's hub, whose renderer is the Atlas page's. */
"use strict";
const fs = require("fs"), path = require("path"), http = require("http");
const ROOT = path.resolve(__dirname, "..");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream", ".woff2": "font/woff2" };
const PORT = 5631;
// the gate's views (test-atlas-perf.js VIEWS) and the state selected in each: one that is on screen where there is one
const VIEWS = [
  { name: "globe", lon: 10, lat: 20, kmpp: 24.0, state: "Texas" },
  { name: "Europe", lon: 10, lat: 50, kmpp: 3.0, state: "Kaliningrad Oblast" },
  { name: "Aegean", lon: 25, lat: 38, kmpp: 0.5, state: null },
  { name: "Aegean at the cap", lon: 25, lat: 38, kmpp: 0.15, state: null },
  { name: "Colorado, 3 km/px", lon: -105.5, lat: 39, kmpp: 3.0, state: "Colorado" },
  { name: "Texas, 6 km/px", lon: -99, lat: 31, kmpp: 6.0, state: "Texas" },
  { name: "Texas, 1 km/px", lon: -99, lat: 31, kmpp: 1.0, state: "Texas" },
  { name: "Siberia, 12 km/px", lon: 100, lat: 62, kmpp: 12.0, state: "Sakha (Yakutia)" },
];
(async () => {
  const { chromium } = require("playwright");
  const server = http.createServer((req, res) => { const p = decodeURIComponent(req.url.split("?")[0]); fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { res.writeHead(404); res.end(); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(p)] || "application/octet-stream", "Content-Length": d.length }); res.end(d); }); });
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch(process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {});
  const page = await browser.newPage({ viewport: { width: 1300, height: 900 } });
  await page.route("**/__harness", (r) => r.fulfill({ contentType: "text/html", body: `<!doctype html><meta charset=utf-8><body><div id=host></div>${["atlas/atlas-format.js", "atlas/study.js", "atlas/atlas-gl.js", "atlas/atlas-canvas.js", "atlas/atlas.js", "atlas/atlas-embed.js", "atlas/data/card-faces.js", "us-states.js", "russia-subjects.js"].map((f) => `<script src=/${f}></script>`).join("")}` }));
  await page.goto(`http://127.0.0.1:${PORT}/__harness`, { waitUntil: "load" });
  const rows = [];
  for (const v of VIEWS) {
    const r = await page.evaluate(async (vw) => {
      const hub = await AtlasEmbed.ensure({ host: {} });
      await new Promise((res) => { const t = setInterval(() => { if (hub.ready() && (!hub.done || hub.done())) { clearInterval(t); res(); } }, 100); });
      const R = hub.ctl.renderer, E = hub.E;
      const w = 1280, h = 800, cv = document.createElement("canvas"); cv.width = w; cv.height = h; const c2 = cv.getContext("2d");
      const zoom = 6371.0088 / (vw.kmpp * 0.46 * Math.min(w, h));
      let id = null, rings = null, b = null;
      if (vw.state) {
        const US = ATLAS_CARD_FACES.layers["us-states"][vw.state], RU = (ATLAS_CARD_FACES.layers["russia-subjects"] || {})[vw.state], T = US || RU;
        if (T) { id = T[0]; b = [T[3], T[4], T[5], T[6]]; const src = US ? window.US_STATES : window.RUSSIA_SUBJECTS; rings = ((src || []).find((s) => s.n === vw.state) || {}).p || null; }
      }
      const faces = id ? hub.facesOf(id) : [];
      R.select(faces.length ? faces[0] : null);
      const spec = { w, h, lon: vw.lon, lat: vw.lat, zoom, layers: { borders: true, provinces: false }, highlights: [] };
      for (let i = 0; i < 6; i++) { hub.draw(spec, c2, { dpr: 1, fast: true }); await new Promise((r) => setTimeout(r, 120)); }
      // wait for this view's tiles
      const t0 = performance.now(); while (performance.now() - t0 < 90000) { const d = hub.draw(spec, c2, { dpr: 1, fast: true }); if (d.settled) break; await new Promise((r) => setTimeout(r, 200)); }
      hub.draw(spec, c2, { dpr: 1, fast: true });
      const s = R.stats(), L = hub.last, D = Math.PI / 180, rot = L.rot, pal = hub.ctl.palette();
      let cov = null;
      if (rings && b) {
        const proj = (lo, la) => { const x = Math.cos(la * D) * Math.cos(lo * D), y = Math.cos(la * D) * Math.sin(lo * D), z = Math.sin(la * D); if (rot[6] * x + rot[7] * y + rot[8] * z < 0.02) return [-1, -1]; return [L.cx + L.radius * (rot[0] * x + rot[1] * y + rot[2] * z), L.cy - L.radius * (rot[3] * x + rot[4] * y + rot[5] * z)]; };   // a point behind the limb is not sampled
        const inside = (lo, la) => { let q = false; for (const ring of rings) for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const yi = ring[i][1], yj = ring[j][1]; if ((yi > la) !== (yj > la) && lo < (ring[j][0] - ring[i][0]) * (la - yi) / (yj - yi) + ring[i][0]) q = !q; } return q; };
        const edge = (lo, la) => { let m = 1e9; for (const ring of rings) for (let i = 1; i < ring.length; i++) { const x0 = ring[i - 1][0], y0 = ring[i - 1][1], dx = ring[i][0] - x0, dy = ring[i][1] - y0, t = Math.max(0, Math.min(1, ((lo - x0) * dx + (la - y0) * dy) / (dx * dx + dy * dy || 1))); m = Math.min(m, Math.hypot(lo - (x0 + t * dx), la - (y0 + t * dy))); } return m; };
        const d = c2.getImageData(0, 0, w, h).data, want = pal.selected; let n = 0, hit = 0;
        const keep = (b[2] - b[0]) * 0.06;
        for (let k = 0; k < 6000; k++) {
          const lo = b[0] + (b[2] - b[0]) * ((k * 0.6180339887) % 1), la = b[1] + (b[3] - b[1]) * ((k * 0.7548776662) % 1);
          if (!inside(lo, la) || edge(lo, la) < keep) continue;
          const p = proj(lo, la), x = Math.round(p[0]), y = Math.round(p[1]); if (x < 1 || y < 1 || x >= w - 1 || y >= h - 1) continue;
          n++; const o = 4 * (y * w + x); if (Math.max(Math.abs(d[o] / 255 - want[0]), Math.abs(d[o + 1] / 255 - want[1]), Math.abs(d[o + 2] / 255 - want[2])) < 0.06) hit++;
        }
        cov = { sampled: n, whole: n ? +(hit / n).toFixed(4) : null };
      }
      return { level: L.level, triangles: s.triangles, segments: s.segments, riverSegments: s.riverSegments, draws: s.draws, tilesDrawn: s.tilesDrawn, cov };
    }, v);
    rows.push(Object.assign({ view: v.name, state: v.state || "—" }, r));
  }
  await browser.close(); server.close();
  if (process.argv.includes("--json")) { console.log(JSON.stringify(rows)); return; }
  console.log("view".padEnd(22) + "state".padEnd(16) + "level  triangles  segments  draws   interior of the selected state in the selection colour");
  for (const r of rows) console.log(r.view.padEnd(22) + r.state.padEnd(16) + String(r.level).padEnd(7) + String(r.triangles).padStart(9) + String(r.segments).padStart(10) + String(r.draws).padStart(7) + "   " + (r.cov ? (r.cov.whole * 100).toFixed(1) + " % of " + r.cov.sampled + " points" : "n/a"));
})().catch((e) => { console.error(e); process.exit(1); });
