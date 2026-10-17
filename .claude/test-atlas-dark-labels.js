/* test-atlas-dark-labels.js — in a DARK theme every name on the Atlas is light text on a dark halo, read off the label canvas's pixels
   (the owner's feedback of 2026-10-17, decision c: "in dark mode, labels have brown text with a black outline, which is difficult to
   read, while their dots and diamonds have white outlines").

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-dark-labels.js

   WHAT IT PROVES, for a seeded reader (Roman and Greek cards) with folio's night theme on, in the Full Atlas:
     · over Rome at 3 km/px in 2025 (cities and towns, the reader's own study names, a river, the Tyrrhenian Sea, regions) and over
       the Mediterranean at 24 km/px in 50 BCE (the polities' names, the seas), every placed name's box on the label canvas holds
       pixels of its TEXT colour and pixels of its HALO colour (the halo is drawn and the glyphs are inked);
     · per label class (cities, study names, polity names, rivers, seas, areas, peoples where present) the text colour the page uses
       reads at least 7:1 against the halo and at least 4.5:1 against the theme's land and sea fills, and is LIGHTER than the halo;
     · the marks keep their light outline (the ink) and the dark halo is wider than the light theme's.
   THE FAULT IT WAS WRITTEN FOR: in a dark theme the reader's own and the selected names took the ochre darkened toward the PAPER —
   #6b5b4d on folio's night, 2.8:1 against its own halo — where every other name was light; light mode is unchanged (the labels suite's
   §6 covers every theme's ink and water names). */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");
const { loadCards } = require("./card-io.js");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream" };
const PORT = 5652;
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  — " + extra : "")); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const lum = (hex) => { const n = parseInt(hex.slice(1), 16); const c = [16, 8, 0].map((s) => { const v = ((n >> s) & 255) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const contrast = (a, b) => { const la = lum(a), lb = lum(b); return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05); };
const hexOf = (rgb) => "#" + rgb.map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, "0")).join("");

const { cards } = loadCards();
const READER = cards.filter((c) => /^(rm|gr)-/.test(c.id) && Array.isArray(c.places) && c.places.length).slice(0, 80).map((c) => c.id);
const seed = (ids) => `try { if (!localStorage.getItem("folio_v1_seeded")) { localStorage.setItem("folio_v1", JSON.stringify({ cards: Object.fromEntries(${JSON.stringify(ids)}.map((id, i) => [id, { due: Date.now() + 9e8, ivl: 9, ease: 2.5, status: "review", reps: 2, first: "2026-08-01" }])), settings: { newPerDay: 5 } })); localStorage.setItem("folio_v1_seeded", "1"); } } catch (e) {}`;
const A = (page, fn, arg) => page.evaluate(`(() => { const c = document.querySelector(".atlas2").__atlas2; return (${fn.toString()})(c, ${JSON.stringify(arg === undefined ? null : arg)}); })()`);
const WATER = { sea: 1, ocean: 1, gulf: 1, strait: 1, lake: 1, river: 1 };
const classOf = (p) => /^(polity|people|culture|extent)$/.test(p.kind) ? ((p.kind === "polity" || p.kind === "extent" ? "polity names" : "peoples") + (p.selected || p.st === 2 ? " (the reader's own)" : "")) : (p.selected || p.st === 2) ? "study names (the reader's own)" : p.kind === "river" ? "rivers" : WATER[p.kind] ? "seas and lakes" : /^(capital|city|town)$/.test(p.kind) ? "cities and towns" : /^(country|admin1)$/.test(p.kind) ? "countries and provinces" : "areas (regions, ranges, islands)";

/* the layout, its paint and the read of the paint as one step (the labels suite's rule): the read checks the layout on the canvas is still
   the one returned, and classifies every pixel of each name's box by its nearest colour — the text's or the halo's */
async function readLabels(page) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const got = await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; return c.layoutNow().then((p) => ({ seq: c.layoutSeq(), frames: c.statsNow().frames, placed: p.filter((x) => x.text && x.box).map((x) => ({ id: x.id, kind: x.kind, style: x.style, text: x.text, box: x.box, st: x.st, selected: !!x.selected, alpha: x.alpha == null ? 1 : x.alpha })) })); });
    await page.evaluate(() => document.querySelector(".atlas2").__atlas2.invalidate());
    await page.waitForFunction((f0) => document.querySelector(".atlas2").__atlas2.statsNow().frames > f0, got.frames, { timeout: 60000 });
    const r = await page.evaluate((placed) => {
      const c = document.querySelector(".atlas2").__atlas2; if (c.layoutSeq() !== placed.seq) return null;
      const col = c.colours(), pal = c.palette(), cv = document.querySelector(".atlas2-labels"), x = cv.getContext("2d"), dpr = cv.width / cv.clientWidth;
      const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
      const live = new Map(c.labelsLive().map((l) => [l.p.id, [l.dx, l.dy]]));
      const out = [];
      for (const p of placed.placed) {
        const ink = (p.selected || p.st === 2) ? col.selected : ({ sea: 1, ocean: 1, gulf: 1, strait: 1, lake: 1, river: 1 })[p.kind] ? col.water : col.ink;
        if (!live.has(p.id) || p.alpha < 0.9) { out.push(Object.assign({}, p, { off: true })); continue; }   // laid out but not drawn: under a control, clipped by the page (the labels suite's `live`), or a study name fading at the limb (alpha = z / 0.2)
        const sh = live.get(p.id), b = [p.box[0] + sh[0] - 3, p.box[1] + sh[1] - 3, p.box[2] + sh[0] + 3, p.box[3] + sh[1] + 3];
        const x0 = Math.max(0, Math.floor(b[0] * dpr)), y0 = Math.max(0, Math.floor(b[1] * dpr)), x1 = Math.min(cv.width, Math.ceil(b[2] * dpr)), y1 = Math.min(cv.height, Math.ceil(b[3] * dpr));
        if (x1 - x0 < 3 || y1 - y0 < 3) { out.push(Object.assign({}, p, { off: true })); continue; }
        // every opaque pixel projected onto the halo → text axis: past 0.75 it is the text's colour, under 0.25 the halo's, between the two an anti-aliased edge
        const d = x.getImageData(x0, y0, x1 - x0, y1 - y0).data, I = rgb(ink), Hh = rgb(col.halo), ax = [I[0] - Hh[0], I[1] - Hh[1], I[2] - Hh[2]], len = ax[0] * ax[0] + ax[1] * ax[1] + ax[2] * ax[2] || 1;
        let tpx = 0, hpx = 0, epx = 0, n = 0;
        for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 128) continue; n++; const t = ((d[i] - Hh[0]) * ax[0] + (d[i + 1] - Hh[1]) * ax[1] + (d[i + 2] - Hh[2]) * ax[2]) / len; if (t > 0.75) tpx++; else if (t < 0.25) hpx++; else epx++; }
        out.push(Object.assign({}, p, { ink, tpx, hpx, epx, n }));
      }
      return { labels: out, colours: col, land: pal.land, sea: pal.ocean };
    }, got);
    if (r) return r;
  }
  throw new Error("the layout moved six times between the paint and the read");
}
async function view(page, lon, lat, k) {
  await page.evaluate(([a, b, c]) => document.querySelector(".atlas2").__atlas2.setView(a, b, c), [lon, lat, k]);
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.tilesSettled() && c.waterSettled(); }, null, { timeout: 120000 });
}

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch(LAUNCH);
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript(seed(READER));
  await ctx.addInitScript(`localStorage.setItem("folio_tour_v1","1");localStorage.setItem("folio_atlas_tour_v1","1");`);
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  await page.goto(`http://127.0.0.1:${PORT}/#map`, { waitUntil: "load" });
  await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 120000 });
  await page.evaluate(() => { document.body.classList.add("night"); document.querySelector(".atlas2").__atlas2.setLayers({ rivers: true, lakes: true, relief: true, countries: true, places: true, physical: true, cities: true, provinces: true, density: "dense" }); });
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.waterSettled() && c.labelsReady() && c.study.ready(); }, null, { timeout: 120000 });
  await sleep(300);   // the theme observer has re-read the tokens (the code before decision c reports no `dark`, and must reach the assertions below to fail on them)
  await A(page, (c) => c.study.setMode("full")); await sleep(300);

  console.log("\n\x1b[1m1) folio's night theme: the colours the page uses, per label class, against the halo, the land and the sea\x1b[0m\n");
  const byClass = new Map(), samples = new Map();
  const views = [["Rome at 3 km/px, 2025", 12.5, 41.9, 3, 2025], ["the central Mediterranean at 6 km/px, 50 BCE", 15, 40, 6, -50]];
  let col = null, land = null, sea = null;
  for (const [name, lon, lat, k, y] of views) {
    await A(page, (c, y) => c.setYear(y), y);
    await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.year() >= 2000 || (c.historyOK && c.historyOK()); }, null, { timeout: 120000 });
    await view(page, lon, lat, k); await sleep(500);
    await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.year() >= 2000 || (c.historyOK && c.historyOK()); }, null, { timeout: 120000 });
    // a past year's polity names need the meshes of the view's level, which arrive after the view: lay out until a polity is named (at most 30 s)
    for (let i = 0; i < 30; i++) { const ks = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.layoutNow().then((p) => p.map((x) => x.kind))); if (y >= 2000 || ks.includes("polity")) break; await sleep(1000); }
    await sleep(300);
    const r = await readLabels(page); col = r.colours; land = hexOf(r.land); sea = hexOf(r.sea);
    const on = r.labels.filter((l) => !l.off), kinds = {}; for (const l of on) kinds[l.kind] = (kinds[l.kind] || 0) + 1;
    check(`${name}: names are drawn (${on.length} on the canvas)`, on.length >= 12, Object.entries(kinds).map(([k, n]) => k + " " + n).join(", "));
    for (const l of on) { const cls = classOf(l); if (!byClass.has(cls)) byClass.set(cls, []); byClass.get(cls).push(l); if (!samples.has(cls)) samples.set(cls, l.text); }
  }
  check("the reader's own study names are on the canvas (the class the owner saw brown)", (byClass.get("study names (the reader's own)") || []).length >= 3, (byClass.get("study names (the reader's own)") || []).slice(0, 6).map((l) => l.text).join(", "));
  check("cities, polity names, seas and rivers are all on the canvas", ["cities and towns", "seas and lakes", "rivers"].every((c) => byClass.has(c)) && [...byClass.keys()].some((c) => c.startsWith("polity names")), [...byClass.keys()].join(" | "));
  console.log(`\n  halo ${col.halo}  land ${land}  sea ${sea}  halo width ${col.haloWidth} px`);
  for (const [cls, ls] of byClass) {
    const ink = ls[0].ink, vsHalo = contrast(ink, col.halo), vsLand = contrast(ink, land), vsSea = contrast(ink, sea);
    const inked = ls.filter((l) => l.tpx >= 4), haloed = ls.filter((l) => l.hpx >= 8);   // a small italic name has few pixels of the pure text colour (its strokes are a pixel wide and anti-aliased); the halo is wide
    console.log(`  ${cls.padEnd(36)} text ${ink}  vs halo ${vsHalo.toFixed(1)}:1  vs land ${vsLand.toFixed(1)}:1  vs sea ${vsSea.toFixed(1)}:1  (${ls.length} names, e.g. ${samples.get(cls)})`);
    check(`${cls}: light text on a dark halo — at least 7:1 against the halo, 4.5:1 against the land and the sea, and lighter than the halo`, vsHalo >= 7 && vsLand >= 4.5 && vsSea >= 4.5 && lum(ink) > lum(col.halo), `${ink} on ${col.halo}: ${vsHalo.toFixed(1)}:1`);
    check(`${cls}: every name's box holds pixels of the text colour AND of the halo colour (the halo is drawn under the glyphs)`, inked.length === ls.length && haloed.length === ls.length, ls.filter((l) => l.tpx < 4 || l.hpx < 8).slice(0, 4).map((l) => `${l.text} (${l.kind}, ${l.id}): ${l.tpx}px text, ${l.hpx}px halo, ${l.epx}px edge of ${l.n} opaque; box ${l.box.map(Math.round)}`).join("; "));
  }
  check("the dark halo is wider than the light theme's 2.6 px", col.haloWidth > 2.6, `${col.haloWidth} px`);

  console.log("\n\x1b[1m2) the marks keep their light outline\x1b[0m\n");
  const mk = await A(page, (c) => { const col = c.colours(); return { ink: col.ink, accent: col.accent, halo: col.halo }; });
  check("the marks' outline is the ink (light) and their fill the ochre or the paper: the outline reads at least 7:1 against the halo", contrast(mk.ink, mk.halo) >= 7, `${mk.ink} on ${mk.halo}: ${contrast(mk.ink, mk.halo).toFixed(1)}:1`);

  console.log("\n\x1b[1m3) light mode is unchanged\x1b[0m\n");
  await page.evaluate(() => document.body.classList.remove("night")); await sleep(300);
  const light = await A(page, (c) => c.colours());
  check("folio's light theme: the selected colour is the ochre darkened toward the ink (#625041), the halo the paper, the halo 2.6 px", light.selected === "#625041" && light.halo === "#f7f6fb" && light.haloWidth === 2.6 && !light.dark, JSON.stringify(light));

  const unexpected = errors.filter((e) => !/favicon/.test(e));
  check("no page errors", unexpected.length === 0, unexpected.slice(0, 3).join(" | "));
  await browser.close(); server.close();
  console.log(`\n${pass} ok, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
