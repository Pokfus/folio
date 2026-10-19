/* compare-ww2-slice.js — THE SECOND WORLD WAR SLICE DRAWS WHAT THE WHOLE HISTORY DREW (2026-10-19; build-ww2-slice.js).

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/compare-ww2-slice.js [--out DIR] [--only N] [--tol PIXELS] [--baseline]

   Renders every plate of the front (93 dates) twice with the engine's own window — the OLD way (the whole atlas/data/history.bin, served in place of the slice) and the NEW way (atlas/data/history-ww2.bin) —
   at two views, and prints the pixel difference per plate:
     default   the window's own home view on its phone canvas (318 × 253 CSS px at 390 px wide; 1×)
     closest   zoom 400 on a 420 × 340 canvas (340 px is the tallest a window can be: `.mc-canvas`'s clamp; 0.1018 km per px, the finest the window can show) at a point ON the plate's front line (the middle vertex
               of the plate's longest soft arc), so the front, the coast and the wash are all in the frame
   A pixel DIFFERS when any channel differs; it differs VISIBLY when the sum of its three channel differences is over 24 (of 765). The worst three plates (most visible pixels, either view) are written as
   old | new | difference PNGs into --out (default: the OS temp directory). Exit 1 when any plate is over --tol visible pixels at either view (default 0: the run fails on the first visible difference
   and says where). The simplification is bounded by half a pixel at the closest zoom, so a line can sit half a pixel off in a few places: that is what this measures. */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path"), os = require("os");
const { chromium } = require("playwright");
const F = require("./atlas-build/lib/format.js");

const ROOT = path.resolve(__dirname, "..");
const argv = process.argv.slice(2), arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const BASELINE = argv.includes("--baseline");
const OUT = arg("--out", path.join(os.tmpdir(), "ww2-compare")), ONLY = Number(arg("--only", 0)), TOL = Number(arg("--tol", 0));
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream" };
const PORT = 5674;
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});

/* the plate dates and, for each, a point on its front line (from the committed history.bin: the middle vertex of the plate's longest soft arc) */
function plates() {
  const R = F.read(new Uint8Array(fs.readFileSync(path.join(ROOT, "atlas/data/history.bin")))), H = R.header, q = H.quantum;
  const fronts = H.entities.map((e, i) => (e.kind === "front" ? i : -1)).filter((i) => i >= 0), fset = new Set(fronts);
  const dates = [...new Set(H.fronts.plates.map((p) => Number(String(p.date).replace(/-/g, ""))))].sort((a, b) => a - b);
  const steps = H.steps.filter((s) => fset.has(s[0]));
  return dates.map((d) => {
    let best = null;
    for (const s of steps) { if (!(s[1] <= d && d <= s[2])) continue; for (const ring of R.faces[s[3]].rings) for (const ref of ring) { const a = Math.abs(ref) - 1; if (R.coreArc[a] >= 0 || R.arcKind[a] !== 4) continue; const n = R.arcOffset[a + 1] - R.arcOffset[a]; if (!best || n > best.n) best = { n, a }; } }
    if (!best) return { date: d, lon: 15, lat: 50 };
    const mid = R.arcOffset[best.a] + (best.n >> 1);
    return { date: d, lon: R.lon[mid] * q, lat: R.lat[mid] * q };
  });
}

/* in the page: mount a window of our own on a canvas of a given size (beside the card's own, which is then stopped), render every plate there and hand the pixels back one at a time */
const PAGE_SETUP = () => {
  window.__w = null;
  window.__mount = (cssW, cssH, zmax) => {
    const h = document.querySelector(".map-card"), probe = h._folioMap.probe(), home = h._folioMap.view().home;
    const cv = document.createElement("canvas"); cv.style.cssText = `position:fixed;left:-9999px;top:0;width:${cssW}px;height:${cssH}px;`; document.body.appendChild(cv);
    const cur = (window.__cur = window.__cur || { date: 0, year: 0 });   // one date for both windows: the hub has ONE year and front date, so two windows asking for different ones would fight over it
    const spec = Object.assign({}, probe.spec);
    const w = AtlasEmbed.view(cv, { zmin: 0.85, zmax, spec: () => Object.assign({}, spec, { year: cur.year, front: true, frontDate: cur.date, war: "ww2-001", history: "ww2", highlights: [] }), draw: () => {} });
    return { cv, w, cur, home };
  };
};

async function run(browser, label, full) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await ctx.addInitScript(`localStorage.setItem("folio_tour_v1","1");localStorage.setItem("folio_atlas_tour_v1","1");`);
  const page = await ctx.newPage(), reqs = [];
  page.on("pageerror", (e) => console.log("  pageerror:", String(e).slice(0, 160)));
  page.on("request", (r) => { if (/atlas\/data\/history/.test(r.url())) reqs.push(r.url().replace(/^.*\/atlas\/data\//, "")); });
  if (full) await page.route("**/atlas/data/history-ww2.bin", (route) => route.fulfill({ status: 200, contentType: "application/octet-stream", body: fs.readFileSync(path.join(ROOT, "atlas/data/history.bin")) }));
  await page.goto(`http://127.0.0.1:${PORT}/#card/ww2-001`, { waitUntil: "load" });
  await page.reload({ waitUntil: "load" });
  await page.waitForSelector(".map-card.map-war", { timeout: 60000 });
  await page.waitForFunction(() => { const h = document.querySelector(".map-card"); return h && h._folioMap && h._folioMap.ready() && !h.classList.contains("mc-loading") && h._folioTimeline; }, null, { timeout: 280000 });
  await page.waitForFunction(() => document.querySelector(".map-card")._folioMap.settled(), null, { timeout: 120000 }).catch(() => {});
  await page.evaluate(PAGE_SETUP);
  const info = await page.evaluate(() => { const h = document.querySelector(".map-card"), c = h.querySelector("canvas"), r = c.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), kind: AtlasEmbed.hub().historyKind(), home: h._folioMap.view().home }; });
  console.log(`  ${label}: hub history ${info.kind}, requested ${[...new Set(reqs)].join(", ")}; default canvas ${info.w}×${info.h}`);
  // two windows of ours: the default view on the card's own size, the closest view on the tallest canvas
  await page.evaluate(([w, h]) => { window.__A = __mount(w, h, 400); window.__B = __mount(420, 340, 400); }, [info.w, info.h]);
  await page.evaluate(() => document.querySelector(".map-card")._folioMap.stop());   // the card's own window goes; ours keep the hub
  return { page, ctx, info };
}
const renderOne = (page, which, date, lon, lat, zoom) => page.evaluate(async ([which, date, lon, lat, zoom]) => {
  const M = which === "A" ? window.__A : window.__B, c = M.cur; c.date = date; c.year = Math.floor(date / 10000); (which === "A" ? window.__B : window.__A).w.schedule();
  const d0 = AtlasEmbed.stats().draws;
  M.w.setView(lon, lat, zoom);
  const t0 = performance.now();
  for (;;) { await new Promise((r) => setTimeout(r, 120)); if (AtlasEmbed.stats().draws > d0 + 1 && M.w.isSettled()) break; if (performance.now() - t0 > 90000) return { err: "not settled" }; }
  await new Promise((r) => setTimeout(r, 150));   // one more full frame, then read
  const cv = M.cv, ctx = cv.getContext("2d"), px = ctx.getImageData(0, 0, cv.width, cv.height).data;
  let bin = ""; const CH = 0x8000; for (let i = 0; i < px.length; i += CH) bin += String.fromCharCode.apply(null, px.subarray(i, i + CH));
  return { w: cv.width, h: cv.height, b64: btoa(bin) };
}, [which, date, lon, lat, zoom]);

function diff(a, b) {
  let any = 0, vis = 0, max = 0;
  for (let i = 0; i < a.length; i += 4) { const d0 = Math.abs(a[i] - b[i]), d1 = Math.abs(a[i + 1] - b[i + 1]), d2 = Math.abs(a[i + 2] - b[i + 2]), s = d0 + d1 + d2; if (s) any++; if (s > 24) vis++; if (d0 > max) max = d0; if (d1 > max) max = d1; if (d2 > max) max = d2; }
  return { any, vis, max };
}

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch(LAUNCH);
  let list = plates(); if (ONLY) list = list.filter((_, i) => i % Math.ceil(list.length / ONLY) === 0);
  console.log(`${list.length} plate dates; rendering each at the default view and at zoom 400 on its front line, old (whole history) and new (slice)`);
  const results = new Map(); const t0 = Date.now();
  const frames = { old: [], neu: [] };
  for (const [label, full] of [["old", true], ["neu", BASELINE]]) {   // --baseline: the whole history twice, to show the run-to-run noise of the renderer (it should be none)
    const { page, ctx, info } = await run(browser, label === "old" ? "OLD (history.bin)" : "NEW (history-ww2.bin)", full);
    for (const p of list) {
      const a = await renderOne(page, "A", p.date, info.home[0], info.home[1], info.home[2]);
      const b = await renderOne(page, "B", p.date, p.lon, p.lat, 400);
      if (a.err || b.err) throw new Error(`${label} ${p.date}: ${a.err || b.err}`);
      frames[label].push({ a, b });
      if (frames[label].length % 10 === 0) console.log(`  ${label}: ${frames[label].length}/${list.length} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    }
    await ctx.close();
  }
  await browser.close(); server.close();
  const rows = list.map((p, i) => {
    const o = frames.old[i], n = frames.neu[i], dA = diff(Buffer.from(o.a.b64, "base64"), Buffer.from(n.a.b64, "base64")), dB = diff(Buffer.from(o.b.b64, "base64"), Buffer.from(n.b.b64, "base64"));
    return { date: p.date, lon: p.lon, lat: p.lat, A: dA, B: dB, aPx: o.a.w * o.a.h, bPx: o.b.w * o.b.h, i };
  });
  const pad = (s, n) => String(s).padStart(n);
  console.log("\n  date      | default view (318×253): differ / visible / max  | closest zoom 400 (420×340): differ / visible / max");
  for (const r of rows) console.log(`  ${r.date} | ${pad(r.A.any, 7)} ${pad(r.A.vis, 7)} ${pad(r.A.max, 4)}                         | ${pad(r.B.any, 7)} ${pad(r.B.vis, 7)} ${pad(r.B.max, 4)}`);
  const sum = (f) => rows.reduce((a, r) => a + f(r), 0), mx = (f) => rows.reduce((a, r) => Math.max(a, f(r)), 0);
  console.log(`\n  default view: ${rows.filter((r) => r.A.any === 0).length}/${rows.length} plates pixel-identical; most differing pixels ${mx((r) => r.A.any)} of ${rows[0].aPx} (${(100 * mx((r) => r.A.any) / rows[0].aPx).toFixed(3)} %), most visible ${mx((r) => r.A.vis)}, largest channel step ${mx((r) => r.A.max)}`);
  console.log(`  closest zoom: ${rows.filter((r) => r.B.any === 0).length}/${rows.length} plates pixel-identical; most differing pixels ${mx((r) => r.B.any)} of ${rows[0].bPx} (${(100 * mx((r) => r.B.any) / rows[0].bPx).toFixed(3)} %), most visible ${mx((r) => r.B.vis)}, largest channel step ${mx((r) => r.B.max)}`);
  void sum;
  // the three worst, side by side
  fs.mkdirSync(OUT, { recursive: true });
  const worst = rows.slice().sort((x, y) => Math.max(y.A.vis, y.B.vis) - Math.max(x.A.vis, x.B.vis) || Math.max(y.A.any, y.B.any) - Math.max(x.A.any, x.B.any)).slice(0, 3);
  const b2 = await chromium.launch(LAUNCH), pg = await b2.newPage();
  for (const r of worst) {
    for (const [view, k] of [["default", "a"], ["closest", "b"]]) {
      const o = frames.old[r.i][k], n = frames.neu[r.i][k];
      const png = await pg.evaluate(([ob, nb, w, h]) => {
        const dec = (b) => Uint8ClampedArray.from(atob(b), (c) => c.charCodeAt(0)), O = dec(ob), N = dec(nb), D = new Uint8ClampedArray(O.length);
        for (let i = 0; i < O.length; i += 4) { const s = Math.abs(O[i] - N[i]) + Math.abs(O[i + 1] - N[i + 1]) + Math.abs(O[i + 2] - N[i + 2]); if (s) { D[i] = 255; D[i + 1] = 0; D[i + 2] = 0; D[i + 3] = 255; } else { D[i] = D[i + 1] = D[i + 2] = 255; D[i + 3] = 255; } }
        const c = document.createElement("canvas"); c.width = w * 3 + 20; c.height = h; const x = c.getContext("2d"); x.fillStyle = "#888"; x.fillRect(0, 0, c.width, c.height);
        [O, N, D].forEach((arr, j) => x.putImageData(new ImageData(arr, w, h), j * (w + 10), 0));
        return c.toDataURL("image/png").split(",")[1];
      }, [o.b64, n.b64, o.w, o.h]);
      fs.writeFileSync(path.join(OUT, `ww2-plate-${r.date}-${view}.png`), Buffer.from(png, "base64"));
    }
    console.log(`  worst: ${r.date}: default ${r.A.any}/${r.A.vis}/${r.A.max}, closest ${r.B.any}/${r.B.vis}/${r.B.max} (at ${r.lat.toFixed(3)}N ${r.lon.toFixed(3)}E) — ${OUT}/ww2-plate-${r.date}-{default,closest}.png (old | new | difference in red)`);
  }
  await b2.close();
  const over = rows.filter((r) => r.A.vis > TOL || r.B.vis > TOL);
  console.log(over.length ? `\n  ${over.length} plate(s) over the tolerance of ${TOL} visible pixels` : `\n  every plate within ${TOL} visible pixels at both views`);
  process.exit(over.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
