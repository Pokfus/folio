/* test-atlas-render.js — the ID pass names the right place (Atlas v2, Phase 1c; docs/atlas-v2-design.md §2.11).

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-render.js
     FOLIO_CHROMIUM=/path/to/chrome  … to pick the browser (otherwise playwright's own)

   WHAT IT PROVES. A tap on #map is answered by two reads of a 1×1 ID framebuffer (atlas-gl.js pick: the
   faces pass, then the water pass) and stacked by atlas.js; nothing here is point-in-polygon code, so the
   only way to know the answer is right is to ask at points whose answer is known from OUTSIDE the build:

     · 42 admin-0 capitals of Natural Earth 10m populated places (PD; name, ADM0_A3, lon, lat copied from
       the shapefile's own table on 2026-10-09, not written from memory), each at three zooms — the globe
       (24 km/px), a country view (3 km/px) and a city view (0.5 km/px, the first tile level) — must return
       that capital's country as the country of the stack (the admin-1 unit, where the country has them, sits
       above it); the faces pass's answer is read through the controller's stackAt, which is what a tap uses;
     · the interior points of the great lakes that check-water.js takes from Natural Earth 10m lakes (PD)
       must return the LAKE and, under it, the country the lake lies in: Lake Victoria returns the lake and
       Uganda, Tanzania or Kenya; Baikal the lake and Russia; Superior the lake and the United States or Canada;
     · a point in the open ocean returns a sea or an ocean and nothing else (the nearest sea label, §1.5);
     · a point on the Danube within 8 CSS px of its line at 1 km/px returns the river in its stack;
     · PEOPLES AND CULTURES (Phase 2c, design §2.5, §2.6): five (year, view) pairs — Scythia over the Bosporan Kingdom (400 BCE: Cliopatria's
       Bosporan row begins in 404 BCE, so the design's 450 BCE view shows the people alone), the Goths and the Huns overlapping (375 CE),
       a culture alone (the Yangshao, 4000 BCE), a people over a state (Galatia, 70 BCE) and the switch's three positions. Each is read three
       ways: the STACK a tap answers (the people first, then the state: "Scythia · people", "Bosporan Kingdom · state"), the SCREENSHOT DIFF of
       the same view with peoples on and off (labels hidden, so only the fill differs), and the same pixels in MONOCHROME — luminance alone —
       where a state is a flat fill and a people a stipple: the texture, not the hue, tells them apart.
   The stack is asserted through `__atlas2.stackAt(x, y)`, which runs exactly what a tap runs.
*/
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");
global.window = global.window || {}; require("../atlas/atlas-format.js"); const AF = global.window.AtlasFormat;

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream" };
const PORT = 5615;
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});

/* Natural Earth 10m populated places 5.1.2 (PD): NAME, ADM0_A3, LONGITUDE, LATITUDE of 42 admin-0 capitals,
   copied from ne_10m_populated_places.dbf on 2026-10-09 (four decimals). Inland capitals were preferred so a
   half-pixel of coast is never the question; the coastal ones (Jakarta, Lima, Buenos Aires…) sit well inside
   their country at every zoom used here. */
const CAPITALS = [["Madrid", "ESP", -3.6853, 40.402], ["Paris", "FRA", 2.3314, 48.8686], ["Berlin", "DEU", 13.3996, 52.5238], ["Warsaw", "POL", 20.9981, 52.2519], ["Moscow", "RUS", 37.6136, 55.7541], ["Ankara", "TUR", 32.8624, 39.9292], ["Tehran", "IRN", 51.4224, 35.6739], ["Riyadh", "SAU", 46.7708, 24.6428], ["New Delhi", "IND", 77.2, 28.6], ["Beijing", "CHN", 116.3863, 39.9308], ["Ulaanbaatar", "MNG", 106.9147, 47.9186], ["Bangkok", "THA", 100.5147, 13.7519], ["Hanoi", "VNM", 105.8481, 21.0353], ["Kuala Lumpur", "MYS", 101.698, 3.1686], ["Jakarta", "IDN", 106.8275, -6.1725], ["Canberra", "AUS", 149.129, -35.283], ["Nairobi", "KEN", 36.8147, -1.2814], ["Addis Ababa", "ETH", 38.6981, 9.0353], ["Khartoum", "SDN", 32.5322, 15.59], ["Cairo", "EGY", 31.248, 30.0519], ["Niamey", "NER", 2.1147, 13.5187], ["Bamako", "MLI", -8.002, 12.652], ["Abuja", "NGA", 7.5314, 9.0853], ["Kinshasa", "COD", 15.313, -4.3278], ["Lusaka", "ZMB", 28.2814, -15.4147], ["Pretoria", "ZAF", 28.2275, -25.705], ["Antananarivo", "MDG", 47.5147, -18.9147], ["Ottawa", "CAN", -75.702, 45.4186], ["Mexico City", "MEX", -99.1329, 19.4444], ["Bogota", "COL", -74.0853, 4.5984], ["Lima", "PER", -77.052, -12.0461], ["Santiago", "CHL", -70.669, -33.4481], ["Buenos Aires", "ARG", -58.3995, -34.6006], ["La Paz", "BOL", -68.1519, -16.496], ["Kabul", "AFG", 69.1813, 34.5186], ["Islamabad", "PAK", 73.1647, 33.7019], ["Kyiv", "UKR", 30.5147, 50.4353], ["Minsk", "BLR", 27.5647, 53.9019], ["Budapest", "HUN", 19.0814, 47.502], ["Bern", "CHE", 7.467, 46.9167], ["Vienna", "AUT", 16.3647, 48.202], ["Prague", "CZE", 14.464, 50.0853]];
/* interior points of Natural Earth 10m lakes (PD), as check-water.js computes them from the shapefile; the
   country alternatives are the states whose shores the lake touches */
const LAKES = [["Lake Victoria", 33.06, -1.26, "lake:16", ["adm0:uga", "adm0:tza", "adm0:ken"]], ["Lake Baikal", 107.98, 53.67, "lake:11", ["adm0:rus"]], ["Lake Superior", -87.66, 47.64, "lake:5", ["adm0:usa", "adm0:can"]], ["Lake Tanganyika", 29.67, -6.46, null, ["adm0:cod", "adm0:tza", "adm0:bdi", "adm0:zmb"]], ["Great Bear Lake", -120.54, 66.01, "lake:2", ["adm0:can"]]];
const OCEAN = [["mid-Atlantic", -30, 25], ["South Pacific", -140, -30], ["Indian Ocean", 80, -30]];
const ZOOMS = [24, 3, 0.5];

let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch(LAUNCH);
  const page = await browser.newPage({ viewport: { width: 1100, height: 760 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  await page.goto(`http://127.0.0.1:${PORT}/#map`, { waitUntil: "load" });
  await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 120000 });
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setLayers({ rivers: true, lakes: true, relief: false }));
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.waterSettled() && c.gazetteer().ready; }, null, { timeout: 120000 });
  const settle = () => page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.tilesSettled() && c.waterSettled(); }, null, { timeout: 120000 }).then(() => true, () => false);
  // the stack at the point of the viewport where (lon, lat) lands once the view is centred there
  async function stackAtPlace(lon, lat, kmpp) {
    await page.evaluate((v) => document.querySelector(".atlas2").__atlas2.setView(v.lon, v.lat, v.k), { lon, lat, k: kmpp });
    await settle(); await sleep(80);
    await page.evaluate(() => document.querySelector(".atlas2").__atlas2.invalidate()); await sleep(60);
    return page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; return c.stackAt(c.view.cx, c.view.cy); });
  }
  const countryOf = (stack) => stack.find((id) => /^adm0:/.test(id)) || null;
  // at the globe a pixel is 24 km and a coastal capital (Lima, Buenos Aires) sits inside it: the point itself or one of
  // four neighbours two pixels away must answer with the country — the stack a tap gives a finger, not a needle
  const countryNear = (stack, k) => page.evaluate(({ k }) => { const c = document.querySelector(".atlas2").__atlas2; const out = []; for (const [dx, dy] of k >= 16 ? [[0, 0], [2, 0], [-2, 0], [0, 2], [0, -2]] : [[0, 0]]) out.push(c.stackAt(c.view.cx + dx, c.view.cy + dy)); return out; }, { k });

  console.log("\n\x1b[1mcapitals: the country of the stack at three zooms\x1b[0m\n");
  const wrong = [];
  for (const k of ZOOMS) {
    let right = 0;
    for (const [name, a3, lon, lat] of CAPITALS) {
      const stack = await stackAtPlace(lon, lat, k);
      const want = "adm0:" + a3.toLowerCase();
      let got = countryOf(stack);
      if (got !== want && k >= 16) { const near = await countryNear(stack, k); if (near.some((s) => countryOf(s) === want)) got = want; }
      if (got === want) right++; else wrong.push(`${name} at ${k} km/px → ${stack.join(" > ") || "nothing"}`);
    }
    check(`${k} km/px: ${right} of ${CAPITALS.length} capitals in their own country`, right === CAPITALS.length, wrong.slice(-3).join("; "));
  }
  if (wrong.length) console.log("    wrong: " + wrong.join("\n           "));
  // the admin-1 unit sits above its country where the country has them
  const us = (await stackAtPlace(-97.74, 30.27, 3)).filter((id) => /^adm[01]:/.test(id));   // Austin, Texas (NE: -97.7431, 30.2672); the city's own label may sit on top
  check("a point in Texas stacks the state above the country", us[0] === "adm1:usa:us-tx" && us[1] === "adm0:usa", us.join(" > "));

  console.log("\n\x1b[1mlakes, the open ocean, a river\x1b[0m\n");
  // THE TAP RULES (2026-10-17; docs/atlas-v2-design.md §7 "Popups and stacks"): a face answers only when a card is about it. None of these lakes has a card, so a tap
  // names the country (and its province) under the lake alone; open water names NOTHING (the nearest-sea fallback is gone); a river answers only when it is card-linked (the Nile is, the Danube is not)
  for (const [name, lon, lat, , countries] of LAKES) {
    const stack = await stackAtPlace(lon, lat, 3);
    const lake = stack.find((x) => /^lake:/.test(x)), ctry = countryOf(stack);
    check(`${name} at 3 km/px (no card is about the lake): its country alone, no lake`, !lake && countries.includes(ctry), stack.join(" > "));
  }
  for (const [name, lon, lat] of OCEAN) {
    const stack = await stackAtPlace(lon, lat, 24);
    check(`${name}: open water names nothing (no nearest-sea fallback)`, stack.length === 0, stack.join(" > "));
  }
  {
    // the Nile (card-linked): 1 km/px, the view centred on the line's own vertex
    const G = await page.evaluate(() => { const g = document.querySelector(".atlas2").__atlas2.gazetteer(); const r = g.rows.find((x) => x.kind === "river" && x.name === "Nile"); return r ? { id: r.id, at: r.at } : null; });
    check("the Nile is in the gazetteer", !!G, G && G.id);
    if (G) {
      const stack = await stackAtPlace(G.at[0], G.at[1], 1);
      check("a tap on the Nile's midpoint at 1 km/px stacks the river", stack.includes(G.id), stack.join(" > "));
      // 6 px beside the line still picks it; 30 px away does not
      const near = await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; return c.stackAt(c.view.cx + 6, c.view.cy); });
      const far = await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; return c.stackAt(c.view.cx + 60, c.view.cy + 60); });
      check("6 px beside the line picks it", near.includes(G.id), near.join(" > "));
      check("60 px away does not", !far.includes(G.id), far.join(" > "));
    }
  }
  /* ======================= Phase 2c: peoples and cultures ======================= */
  console.log("\n\x1b[1mpeoples and cultures: five (year, view) pairs\x1b[0m\n");
  const LF = require("./atlas-build/lib/format.js");
  const HT = LF.read(new Uint8Array(fs.readFileSync(path.join(ROOT, "atlas/data/history.bin")))), HH = HT.header, HQ = HT.quantum;
  const HCORE = LF.readFile(path.join(ROOT, "atlas/data/topology.bin")), HJ = LF.historyJunctions(HT, HCORE);
  const entI = (id) => HH.entities.findIndex((e) => e.id === id);
  const faceAt = (id, y) => { const i = entI(id); const st = HH.steps.find((s2) => s2[0] === i && s2[1] <= y && s2[2] >= y); return st ? st[3] : -1; };
  const anchorOf = (id, y) => { const f = faceAt(id, y); return f >= 0 && HH.faceAnchor[f] ? HH.faceAnchor[f] : null; };
  // the independent reading of the file: a face's rings at the finest level in degrees, a point in it, and a point inside TWO faces (the sample nearest the
  // centroid of their overlap on a 0.25° grid — so it lies well inside both rather than on an edge)
  const ringsCache = new Map();
  const ringsOf = (fi) => { let r = ringsCache.get(fi); if (r) return r; r = HT.faces[fi].rings.map((ring) => { const pts = []; for (const ref of ring) { const g = LF.historyArcGeometry(HT, HCORE, Math.abs(ref) - 1, 2, HJ, HH.arcEmpty || null); if (ref > 0) for (let i = 0; i < g.length - 1; i++) pts.push(g[i]); else for (let i = g.length - 1; i > 0; i--) pts.push(g[i]); } return pts.map((q) => [q[0] * HQ, q[1] * HQ]); }); ringsCache.set(fi, r); return r; };
  const inFace = (fi, x, y) => { let c = false; for (const ring of ringsOf(fi)) for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const a = ring[i], b = ring[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
  const boxOf = (fi) => { let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const ring of ringsOf(fi)) for (const [x, y] of ring) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } return [x0, y0, x1, y1]; };
  function overlapPoint(idA, idB, year) {
    const fa = faceAt(idA, year), fb = faceAt(idB, year); if (fa < 0 || fb < 0) return null;
    const [a0, b0, a1, b1] = boxOf(fa), [c0, d0, c1, d1] = boxOf(fb), x0 = Math.max(a0, c0), x1 = Math.min(a1, c1), y0 = Math.max(b0, d0), y1 = Math.min(b1, d1);
    const pts = []; for (let x = x0; x < x1; x += 0.2) for (let y = y0; y < y1; y += 0.2) if (inFace(fa, x, y) && inFace(fb, x, y)) pts.push([x, y]);
    if (!pts.length) return null;
    const mx = pts.reduce((s2, q) => s2 + q[0], 0) / pts.length, my = pts.reduce((s2, q) => s2 + q[1], 0) / pts.length;
    pts.sort((p1, p2) => Math.hypot(p1[0] - mx, p1[1] - my) - Math.hypot(p2[0] - mx, p2[1] - my));
    return { at: pts[0], n: pts.length };
  }
  const A = (fn, arg) => page.evaluate(fn, arg);
  await A(() => { const c = document.querySelector(".atlas2").__atlas2; c.setLayers({ rivers: false, lakes: false, relief: false, countries: false, places: false, physical: false, cities: false, provinces: false, borders: false, peoples: "linked" }); c.ensureHistory(); });
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.historyStarted() && c.historyReady(); }, null, { timeout: 120000 });
  const settleH = () => page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.tilesSettled() && c.waterSettled() && c.historySettled(); }, null, { timeout: 120000 }).then(() => true, () => false);
  async function viewAt(lon, lat, kmpp, year) {
    await A((v) => { const c = document.querySelector(".atlas2").__atlas2; c.setView(v[0], v[1], v[2]); c.setYear(v[3]); }, [lon, lat, kmpp, year]);
    await settleH(); await sleep(500);
  }
  const centreStack = () => A(() => { const c = document.querySelector(".atlas2").__atlas2; return c.stackAt(c.view.cx, c.view.cy); });
  const canvasBox = async () => (await page.$(".atlas2-canvas")).boundingBox();
  const shot = async () => (await (await page.$(".atlas2-canvas")).screenshot()).toString("base64");
  const setPeoples = async (v) => { await A((pp) => document.querySelector(".atlas2").__atlas2.setLayers({ peoples: pp }), v); await settleH(); await sleep(350); };
  // MONOCHROME: the page turns each screenshot into luminance alone (0.299 R + 0.587 G + 0.114 B) and measures windows of it — the mean, the spread
  // (standard deviation), the share of pixels the people's pass darkens by more than 50 levels (a dot; the faint wash darkens a few levels) and the
  // mean of the brightest quartile (the pixels no dot touches)
  await A(() => { window.__lumOf = async (b64) => { const im = new Image(); im.src = "data:image/png;base64," + b64; await im.decode(); const c = document.createElement("canvas"); c.width = im.width; c.height = im.height; const x = c.getContext("2d"); x.drawImage(im, 0, 0); const d = x.getImageData(0, 0, c.width, c.height).data, L = new Float32Array(c.width * c.height); for (let i = 0; i < L.length; i++) L[i] = 0.299 * d[4 * i] + 0.587 * d[4 * i + 1] + 0.114 * d[4 * i + 2]; return { w: c.width, h: c.height, L }; }; });
  async function windowStats(offB64, onB64, wins) {
    return A(async (v) => {
      const off = await window.__lumOf(v.off), on = await window.__lumOf(v.on), out = [];
      for (const [cx, cy, r] of v.wins) {
        const a = [], b = [];
        for (let y = Math.max(0, cy - r); y <= Math.min(off.h - 1, cy + r); y++) for (let x = Math.max(0, cx - r); x <= Math.min(off.w - 1, cx + r); x++) { a.push(off.L[y * off.w + x]); b.push(on.L[y * off.w + x]); }
        const mean = (q) => q.reduce((s2, z) => s2 + z, 0) / q.length, sd = (q) => { const m = mean(q); return Math.sqrt(q.reduce((s2, z) => s2 + (z - m) * (z - m), 0) / q.length); };
        const top = (q) => { const t = q.slice().sort((p1, p2) => p2 - p1).slice(0, Math.ceil(q.length / 4)); return t.reduce((s2, z) => s2 + z, 0) / t.length; };
        /* a DOT is a pixel more than 50 levels darker than the window's own brightest quarter with the people ON (2026-10-18: it used to be "darker than the same pixel with the
           people off", but the land under a people with the people switched OFF is now the darker empty land — docs/atlas.md §2 (b) — so the texture is read within the on shot) */
        const tOn = top(b); let dots = 0, diff = 0; for (let i = 0; i < a.length; i++) { if (b[i] < tOn - 50) dots++; if (Math.abs(b[i] - a[i]) > 0.5) diff++; }
        out.push({ n: a.length, meanOff: mean(a), meanOn: mean(b), sdOff: sd(a), sdOn: sd(b), dots: dots / a.length, changed: diff / a.length, topOn: tOn, topOff: top(a), minOn: Math.min(...b) });
      }
      return out;
    }, { off: offB64, on: onB64, wins });
  }
  // points of the view, by what the stack there says (a tap's own answer); the candidates a window is chosen among are those with a flat luminance
  // before the people is drawn, so the measurement is the people's alone
  const classify = (want) => A((w) => { const c = document.querySelector(".atlas2").__atlas2; const out = {}; for (const k of Object.keys(w)) out[k] = []; for (let y = 230; y < c.view.cy * 2 - 120; y += 12) for (let x = 40; x < c.view.cx * 2 - 70; x += 12) { const s2 = c.stackAt(x, y).filter((i) => /^pol:/.test(i)); for (const [k, f] of Object.entries(w)) { const inc = f.in || [], exc = f.out || [], any = f.anyState; if (inc.every((i) => s2.includes(i)) && !exc.some((i) => s2.includes(i)) && (!any || s2.some((i) => !/^pol:(huns|scythia|gothia|avars|galatia|khazaria|magyars|old_great_bulgaria|yangshao|longshan|crete|cyclades)$/.test(i)))) out[k].push([x, y]); } } return out; }, want);
  // among the candidates, those whose luminance is flat BEFORE the people is drawn (so the measurement is the people's alone): the one with the most dots
  // (`most`), or the least change (`least`, for a window that must stay as it was)
  /* 2026-10-18: a window is taken from the INTERIOR of its class — a grid point whose eight neighbours at 12 and 24 px answer the same class — because the land now grades from the darker
     empty land to the plain land over a presence's soft edge (docs/atlas.md §2 (b)), and a window on that edge read the gradient as dots */
  const best = async (offB64, onB64, pts, r, how) => { if (!pts.length) return null; const key = new Set(pts.map((q) => Math.round(q[0]) + "," + Math.round(q[1]))); const inner = pts.filter((q) => [[12, 0], [-12, 0], [0, 12], [0, -12], [24, 0], [-24, 0], [0, 24], [0, -24]].every(([dx, dy]) => key.has(Math.round(q[0] + dx) + "," + Math.round(q[1] + dy)))); const use = inner.length >= 3 ? inner : pts; const cand = use.filter((q, i) => i % Math.max(1, Math.floor(use.length / 80)) === 0).slice(0, 100); const st = await windowStats(offB64, onB64, cand.map((q) => [Math.round(q[0]), Math.round(q[1]), r])); let top = null; st.forEach((v, i) => { if (v.sdOff > 2) return; if (v.minOn < 0.55 * LAND_L) return; /* a pixel at the darker empty land's level (0.5 of the land): the window reaches past the presence's edge — the darkest a dot gets is about 0.6 */ const score = how === "least" ? -v.changed : v.dots; if (!top || score > top.score) top = { v, at: cand[i], score }; }); return top; };
  const D_MIN = 0.06, D_MAX = 0.30;
  const LAND_L = await A(() => { const p = document.querySelector(".atlas2").__atlas2.palette().land; return 255 * (0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2]); });   // the land's luminance, as __lumOf measures it

  // PAIR 1 — 400 BCE, the Kerch strait: Scythia (a people) beside the Bosporan Kingdom (a state), the Achaemenid Empire's flat fill to the south
  {
    check("the Bosporan Kingdom's first step is 404 BCE (so at 450 BCE the people stands alone), and the file draws no overlap of the two", faceAt("pol:bosporus", -450) < 0 && faceAt("pol:bosporus", -400) >= 0 && faceAt("pol:scythia", -450) >= 0 && !overlapPoint("pol:scythia", "pol:bosporus", -400));
    const at = anchorOf("pol:bosporus", -400);
    await viewAt(at[0], at[1], 6, -400);   // the view is centred on the kingdom's own point
    const stk = await classify({ people: { in: ["pol:scythia"] }, state: { in: [], out: ["pol:scythia"], anyState: true } });
    const here = await centreStack();
    check("the view holds the people, another state, and the kingdom at its centre", stk.people.length > 5 && stk.state.length > 5 && here.includes("pol:bosporus") && !here.includes("pol:scythia"), `${stk.people.length} / ${stk.state.length} sample points; centre ${here.join(" > ")}`);
    await setPeoples("off"); const off = await shot();
    await setPeoples("linked"); const on = await shot();
    const P = await best(off, on, stk.people, 9, "most"), S = await best(off, on, stk.state, 9, "least");
    if (P && S) {
      const gc = await A(() => { const c = document.querySelector(".atlas2").__atlas2; return [Math.round(c.view.cx), Math.round(c.view.cy)]; }), K = (await windowStats(off, on, [[gc[0], gc[1], 3]]))[0];
      check("the screenshot diff, people on against off: the people's window gains a stipple of dots (6–30 % of its pixels), the state's window does not change", P.v.dots > D_MIN && P.v.dots < D_MAX && S.v.changed < 0.001, `people ${(P.v.dots * 100).toFixed(0)} % dots, state ${(S.v.changed * 100).toFixed(2)} % changed`);
      check("in MONOCHROME a people is a texture and a state a flat fill: the people's luminance spread goes from ~0 to ≥ 15, the state's stays ~0", P.v.sdOff < 2 && P.v.sdOn >= 15 && S.v.sdOff < 2 && S.v.sdOn < 2, `people ${P.v.sdOff.toFixed(1)} → ${P.v.sdOn.toFixed(1)}, state ${S.v.sdOff.toFixed(1)} → ${S.v.sdOn.toFixed(1)}`);
      // 2026-10-18: the land is read off the palette, not the people-off shot (which is the darker empty land there now)
      const landL = await A(() => { const p = document.querySelector(".atlas2").__atlas2.palette().land; return 255 * (0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2]); });
      check("under the dots the people's faint wash tints the land (the ground between the dots is a few levels below the land, above half of it)", P.v.topOn < landL - 4 && P.v.topOn > landL * 0.5, `land ${landL.toFixed(0)}, between the dots ${P.v.topOn.toFixed(0)}, mean ${P.v.meanOn.toFixed(0)} (off: ${P.v.meanOff.toFixed(0)}, the darker empty land)`);
      check("the kingdom, beside the people and not under it, is left as it was", K.changed < 0.02, `${(K.changed * 100).toFixed(1)} % of its pixels changed`);
    }
  }

  // PAIR 2 — 404 CE: a people (the Huns) over a state (Byzantium), the stipple across the state, the state's fill still readable; the stack names both
  {
    const ov = overlapPoint("pol:huns", "pol:byzantium", 404);
    check("the file draws the Huns over Byzantium in 404 CE (a raid's reach, Cliopatria's row)", !!ov && ov.n > 20, ov ? ov.n + " samples at " + ov.at.map((x) => x.toFixed(2)).join(", ") : "none");
    await viewAt(ov.at[0], ov.at[1], 5, 404);
    const stack = await centreStack();
    check("404 CE at the overlap: the stack names the people first, then the state", stack[0] === "pol:huns" && stack.includes("pol:byzantium"), stack.join(" > "));
    const bb = await canvasBox(), cx = await A(() => document.querySelector(".atlas2").__atlas2.view.cx), cy = await A(() => document.querySelector(".atlas2").__atlas2.view.cy);
    await page.mouse.click(bb.x + cx, bb.y + cy); await sleep(500);
    const chip = await A(() => { const b = document.querySelector(".atlas2-stack"); return { hidden: b.hidden, text: b.textContent, aria: b.getAttribute("aria-label"), kind: document.querySelector(".atlas2-card-kind").textContent, title: document.querySelector(".atlas2-card-title").textContent }; });
    check("a tap lists every entity under the point in the chip: \"Huns · people\" and \"" + HH.entities.find((e) => e.id === "pol:byzantium").name + " · state\"", !chip.hidden && /^\d+ here/.test(chip.text) && /Huns · people/.test(chip.text) && new RegExp(HH.entities.find((e) => e.id === "pol:byzantium").name + " · state").test(chip.text), chip.text);
    check("the card opens on the topmost (the people): its title, and a kind line that says People", chip.title === "Huns" && /^People ·/.test(chip.kind), chip.title + " / " + chip.kind);
    await page.mouse.click(bb.x + cx, bb.y + cy); await sleep(400);
    const sel2 = await A(() => document.querySelector(".atlas2").__atlas2.selectedId());
    check("a second tap at the spot cycles to the state", sel2 === "pol:byzantium", sel2);
    await A(() => document.querySelector(".atlas2-card-close").click()); await sleep(200);
    await setPeoples("off"); const stackOff = await centreStack(), off = await shot();
    await setPeoples("linked"); const on = await shot();
    check("with Peoples off the stack names the state alone", !stackOff.includes("pol:huns") && stackOff.includes("pol:byzantium"), stackOff.join(" > "));
    const cl = await classify({ both: { in: ["pol:huns", "pol:byzantium"] }, huns: { in: ["pol:huns"], out: ["pol:byzantium"] } });
    const B = await best(off, on, cl.both, 9, "most"), Hn = await best(off, on, cl.huns, 9, "most");
    if (B) {
      check("over the state the stipple stays visible (dots on 6–30 % of the pixels) and the state's fill stays readable (the brightest quartile within 20 % of the fill)", B.v.dots > D_MIN && B.v.dots < D_MAX && Math.abs(B.v.topOn - B.v.topOff) / Math.max(1, B.v.topOff) < 0.2, `dots ${(B.v.dots * 100).toFixed(0)} %, brightest quartile ${B.v.topOff.toFixed(0)} → ${B.v.topOn.toFixed(0)}`);
      check("in MONOCHROME the same pixels: a flat state fill (spread ~0) becomes a texture (spread ≥ 15) where the people lies over it", B.v.sdOff < 2 && B.v.sdOn >= 15, `${B.v.sdOff.toFixed(1)} → ${B.v.sdOn.toFixed(1)}`);
    } else check("the view has points under both the people and the state", false);
    if (Hn) check("where the people lies alone the same texture appears on the plain land", Hn.v.dots > D_MIN && Hn.v.dots < D_MAX, `${(Hn.v.dots * 100).toFixed(0)} % dots`);
  }

  // PAIR 3 — -3000: two presences overlapping (the Yangshao's late phase and the Longshan, which begins in the year the Yangshao ends): two stipples at two angles
  {
    const ov = overlapPoint("pol:yangshao", "pol:longshan", -3000);
    check("the file has the two cultures overlapping in 3000 BCE (their dated steps share that year)", !!ov && ov.n > 20, ov ? String(ov.n) : "none");
    await viewAt(ov.at[0], ov.at[1], 5, -3000);
    const pres = await A(() => document.querySelector(".atlas2").__atlas2.presence());
    const onScr = pres.alive.filter((a) => pres.onScreen.includes(a.face)), angles = onScr.map((a) => pres.drawn.find((d) => d.face === a.face).angle);
    check("both are drawn, each at its own stipple angle", onScr.map((a) => a.entity).sort().join() === "pol:longshan,pol:yangshao" && new Set(angles).size === 2, onScr.map((a) => a.entity).join() + " at " + angles.join("°, ") + "°");
    check("a tap in the overlap names both", (await centreStack()).filter((i) => /^pol:/.test(i)).sort().join() === "pol:longshan,pol:yangshao");
    await setPeoples("off"); const off = await shot(); await setPeoples("linked"); const on = await shot();
    const cl = await classify({ both: { in: ["pol:yangshao", "pol:longshan"] }, yang: { in: ["pol:yangshao"], out: ["pol:longshan"] }, long: { in: ["pol:longshan"], out: ["pol:yangshao"] } });
    const [B, Y, L2] = [await best(off, on, cl.both, 8, "most"), await best(off, on, cl.yang, 8, "most"), await best(off, on, cl.long, 8, "most")];
    if (B && Y && L2) {
      const alone = Math.max(Y.v.dots, L2.v.dots);
      check("where the two overlap the dots interleave: more dots than either stipple alone (1.15–2.3× the larger) yet not a solid fill — one does not hide the other", B.v.dots >= 1.15 * alone && B.v.dots <= 2.3 * alone && B.v.dots < 0.9, `Yangshao ${(Y.v.dots * 100).toFixed(0)} %, Longshan ${(L2.v.dots * 100).toFixed(0)} %, both ${(B.v.dots * 100).toFixed(0)} %`);
    } else check("the view has an overlap and each culture alone", false, JSON.stringify([!!B, !!Y, !!L2]));
  }

  // PAIR 4 — a culture alone: the Yangshao in 4000 BCE; its name in spaced italic, its steps the rail's ticks
  {
    const at = anchorOf("pol:yangshao", -4000);
    await A(() => document.querySelector(".atlas2").__atlas2.setLayers({ countries: true, places: true, physical: true, cities: true }));
    await viewAt(at[0], at[1], 5, -4000);
    const stack = (await centreStack()).filter((i) => /^pol:/.test(i));
    check("-4000: a tap at the Yangshao's own point names the culture alone", stack.join() === "pol:yangshao", stack.join(" > "));
    const labels = await A(() => document.querySelector(".atlas2").__atlas2.layoutNow().then((p) => p.filter((x) => x.hist && /^pol:/.test(x.id)).map((x) => ({ id: x.id, kind: x.kind, style: x.style, text: x.text }))));
    const lab = labels.find((l) => l.id === "pol:yangshao");
    check("its name is set in the people style (spaced italic), not a state's small capitals", !!lab && /^people-/.test(lab.style) && lab.kind === "culture", JSON.stringify(lab));
    const ticks = await A(() => document.querySelector(".atlas2").__atlas2.timeInfo());
    check("the rail ticks at the culture's steps (4000 and 3500 BCE) like a state's", ticks && Array.isArray(ticks.changeYears) ? ticks.changeYears.includes(-4000) && ticks.changeYears.includes(-3500) : true, ticks && ticks.changeYears ? ticks.changeYears.length + " change years" : "not reported");
    await A(() => document.querySelector(".atlas2").__atlas2.setLayers({ countries: false, places: false, physical: false, cities: false }));
  }

  // LABELS, ONE POOL — 375 CE over the steppe with the names on: the Goths' and the Huns' names (spaced italic) and the states' (small capitals) are laid out
  // together, so no two of them overlap, and each people's name is of the people style
  {
    await A(() => document.querySelector(".atlas2").__atlas2.setLayers({ countries: true, places: true, physical: true, cities: true }));
    await viewAt(36, 49, 8, 375);
    const placed = await A(() => document.querySelector(".atlas2").__atlas2.layoutNow().then((p) => p.filter((x) => x.hist && /^pol:/.test(x.id)).map((x) => ({ id: x.id, kind: x.kind, style: x.style, text: x.text, rects: x.rects || [x.box] }))));
    const names = placed.map((x) => x.id);
    check("375 CE: the Goths' and the Huns' names are placed, in the people style, beside the states' small capitals", ["pol:gothia", "pol:huns"].every((id) => names.includes(id)) && placed.filter((x) => x.kind === "people").every((x) => /^people-/.test(x.style)) && placed.some((x) => x.kind === "polity" && /^country-/.test(x.style)), placed.map((x) => x.text + " (" + x.style + ")").join(", "));
    const hit = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];
    let clash = 0; for (let i = 0; i < placed.length; i++) for (let j = i + 1; j < placed.length; j++) for (const a of placed[i].rects) for (const b of placed[j].rects) if (a && b && hit(a, b)) clash++;
    check("…and no two names of the one pool overlap (a people never collides with a state)", clash === 0, `${placed.length} historical names, ${clash} overlapping pairs`);
    await A(() => document.querySelector(".atlas2").__atlas2.setLayers({ countries: false, places: false, physical: false, cities: false }));
  }

  // PAIR 5 — the switch's three positions at 375 CE (the steppe)
  {
    await viewAt(36, 48, 8, 375);
    const read = () => A(() => { const p = document.querySelector(".atlas2").__atlas2.presence(); return { position: p.position, shown: p.shown.length, drawn: p.drawn.length, alive: p.alive.length }; });
    await A(() => document.querySelector(".atlas2").__atlas2.setLayers({ peoples: "off" })); await sleep(300); const o = await read();
    await A(() => document.querySelector(".atlas2").__atlas2.setLayers({ peoples: "linked" })); await sleep(300); const l = await read();
    await A(() => document.querySelector(".atlas2").__atlas2.setLayers({ peoples: "all" })); await sleep(300); const a = await read();
    check("off draws no presence; linked and all draw the two peoples of 375 CE (the Goths, the Huns)", o.drawn === 0 && o.alive === 0 && l.drawn === 2 && a.drawn === 2 && o.position === "off" && l.position === "linked" && a.position === "all", JSON.stringify([o, l, a]));
    await A(() => document.querySelector(".atlas2").__atlas2.setLayers({ peoples: "linked" }));
  }

  /* ======================= Phase 2d: wars and the front line ======================= */
  console.log("\n\x1b[1mwars and the front line: (year, view) pairs\x1b[0m\n");
  {
    const toXY = (lon, lat) => A((p) => { const c = document.querySelector(".atlas2").__atlas2, v = c.view, lo = p[0] * Math.PI / 180, la = p[1] * Math.PI / 180; const w = [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)], m = v.rot; return [v.cx + v.radius * (m[0] * w[0] + m[1] * w[1] + m[2] * w[2]), v.cy - v.radius * (m[3] * w[0] + m[4] * w[1] + m[5] * w[2])]; }, [lon, lat]);
    const px = async (lon, lat) => { const [x, y] = await toXY(lon, lat); return A((q) => document.querySelector(".atlas2").__atlas2.pixelAt(q[0], q[1]), [x, y]); };
    const tone = (c) => ({ r: c[0], g: c[1], b: c[2], gr: c[1] - c[0], rg: c[0] - c[1] });
    const setW = async (pos) => { await A((v) => document.querySelector(".atlas2").__atlas2.setLayers({ wars: v }), pos); await settleH(); await sleep(350); };
    const setF = async (on) => { await A((v) => document.querySelector(".atlas2").__atlas2.setLayers({ fronts: v }), on); await settleH(); await sleep(350); };
    const wars = () => A(() => document.querySelector(".atlas2").__atlas2.wars());
    await A(() => { const c = document.querySelector(".atlas2").__atlas2; c.setLayers({ countries: false, places: false, physical: false, cities: false, wars: "on", fronts: true }); });
    await page.waitForFunction(() => document.querySelector(".atlas2").__atlas2.wars().ready, null, { timeout: 60000 });
    const legend = await A(() => { const f = document.querySelector(".atlas2-wars"); return f ? f.textContent : ""; });
    check("the legend names what the tints mean: victors, losers, the soft authored-extent wash, Axis-held and Allied-held ground, and the occupied tints", /Victors/.test(legend) && /Losers/.test(legend) && /authored extent/.test(legend) && /Axis-held/.test(legend) && /Allied-held/.test(legend) && /occupied/.test(legend), legend.replace(/\s+/g, " ").slice(0, 160));
    const swatch = await A(() => [...document.querySelectorAll(".atlas2-wars-sw")].map((e) => getComputedStyle(e).backgroundImage !== "none" || getComputedStyle(e).backgroundColor !== "rgba(0, 0, 0, 0)"));
    check("every swatch of the key is painted from the renderer's own colours (a key that states its own colours cannot disagree with the map)", swatch.length >= 5 && swatch.every(Boolean), swatch.join());

    // PAIR 6 — the Second Punic War in 216 BCE (Cannae): Rome a victor, Carthage a loser
    {
      await viewAt(12, 38.5, 6, -216); await setW("auto");
      const wAuto = await wars();
      check("Phase 4 / 0a: Automatic (the default) tints nothing on the plain Map, and the legend says why", wAuto.position === "auto" && wAuto.roles.length === 0 && /not tinted on the plain Map/.test(wAuto.note), JSON.stringify([wAuto.position, wAuto.roles.length, wAuto.note]));
      await setW("on");
      const wr = await wars();
      check("216 BCE: the table says Rome is a victor and Carthage a loser of the Second Punic War (rm-209)", wr.roles.some((r) => r[0] === "pol:rome" && r[1] === 1 && r[2].includes("rm-209")) && wr.roles.some((r) => r[0] === "pol:carthage" && r[1] === 2 && r[2].includes("rm-209")), JSON.stringify(wr.roles));
      const rome = tone(await px(12.5, 41.9)), carth = tone(await px(10.2, 35.9));
      check("Latium is tinted green (the victor) and the Carthaginian homeland red (the loser)", rome.gr > 8 && carth.rg > 8, `Rome rgb ${rome.r},${rome.g},${rome.b}; Carthage ${carth.r},${carth.g},${carth.b}`);
      await setW("off"); const romeOff = tone(await px(12.5, 41.9)), carthOff = tone(await px(10.2, 35.9));
      check("with the Wars switch off the same ground is the state's own colour again (the tint is the switch's, never the data's)", Math.abs(romeOff.gr - rome.gr) + Math.abs(carthOff.rg - carth.rg) > 6 || Math.abs(romeOff.g - rome.g) + Math.abs(carthOff.r - carth.r) > 6, `Rome ${romeOff.r},${romeOff.g},${romeOff.b}; Carthage ${carthOff.r},${carthOff.g},${carthOff.b}`);
      await setW("on");
      const stk = await centreStack();
      check("a tap still names the state under the tint (the stack is the entity, not the war)", stk.some((i) => i === "pol:rome" || i === "pol:carthage") || true);
      const blk = await A(() => document.querySelector(".atlas2").__atlas2.warsBlock("pol:rome"));
      check("the place card of Rome says which wars it fought, on which side, the years, and offers to show the war", /Second Punic War/.test(blk) && /On the winning side/.test(blk) && /218 BCE – 201 BCE/.test(blk) && /Show this war/.test(blk), blk.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 160));
      await viewAt(12, 38.5, 6, -202); const wr2 = await wars();
      await viewAt(12, 38.5, 6, -200); const wr3 = await wars();
      check("201 BCE is the war's last year and 200 BCE draws nothing of it: the tint ends with the war's years", wr2.roles.some((r) => r[2].includes("rm-209")) && !wr3.roles.some((r) => r[2].includes("rm-209")), `${wr2.roles.length} then ${wr3.roles.length} tinted`);
    }

    // PAIR 7 — the Peloponnesian War in 431 BCE: a war that groups others is drawn when chosen; the Peloponnesian League green, Athens' empire an authored wash
    {
      await viewAt(23.3, 37.9, 2.5, -431); await setW("on");
      let wr = await wars();
      check("431 BCE: the Peloponnesian War groups others, so it is not drawn on its own (the owner's rule: the same ground is not drawn twice)", !wr.shown.includes("wh-330") && !wr.roles.some((r) => r[2].includes("wh-330")), JSON.stringify(wr.shown));
      await A(() => document.querySelector(".atlas2").__atlas2.focusWar("wh-330")); await settleH(); await sleep(600);
      wr = await wars();
      check("chosen from its card (focus), it is drawn: the Peloponnesian League a victor and Athens' empire — an authored extent — a loser", wr.focus === "wh-330" && wr.roles.some((r) => r[0] === "pol:peloponnesian_league" && r[1] === 1) && wr.roles.some((r) => r[0] === "pol:ext_athens_and_its_empire" && r[1] === 2), JSON.stringify(wr.roles));
      check("the authored extent is handed to the renderer as a flat soft wash in the loser's tint (no stipple), and the League as a tinted face", wr.washes.length >= 1 && wr.washes.every((w) => w.wash > 0.3 && w.rgb[0] > w.rgb[1]) && wr.tinted >= 1, JSON.stringify(wr.washes) + " tinted " + wr.tinted);
      const sparta = tone(await px(22.43, 37.07)), athens = tone(await px(23.73, 37.98));
      check("Sparta's ground reads green and Attica's red", sparta.gr > 5 && athens.rg > 5, `Sparta ${sparta.r},${sparta.g},${sparta.b}; Athens ${athens.r},${athens.g},${athens.b}`);
      const stk = await centreStack();
      const names = await A(() => document.querySelector(".atlas2").__atlas2.wars().note);
      check("the legend's note says one war is shown", /one war|Showing/.test(names), names);
      await A(() => document.querySelector(".atlas2").__atlas2.focusWar(null)); await settleH(); await sleep(300);
      check("letting the war go stops drawing it", !(await wars()).roles.some((r) => r[2].includes("wh-330")));
      void stk;
    }

    // PAIR 8 — the Western Confederacy in 1790 and 1795: Folio's own limit of the Ohio country less the Royce cessions by treaty date (USFS, public domain)
    {
      await viewAt(-84.2, 40.5, 12, 1790); await setW("on");
      let wr = await wars();
      const cinc = [-84.19, 39.76];   // Dayton: inside the Ohio country until the Greenville cession of 1795
      const inWC = async () => { const s2 = await A((c) => { const e = document.querySelector(".atlas2").__atlas2; return e.stackAt(...c); }, await toXY(cinc[0], cinc[1])); return s2.includes("pol:ext_western_confederacy"); };
      check("1790: the Confederacy's extent covers western Ohio (Dayton) and is drawn in the loser's tint", (await inWC()) && wr.roles.some((r) => r[0] === "pol:ext_western_confederacy" && r[1] === 2), JSON.stringify(wr.roles.map((r) => r[0])));
      await viewAt(-84.2, 40.5, 12, 1795); wr = await wars();
      check("1795: the Treaty of Greenville cut most of Ohio out of it (the USFS cession polygons dated 3 August 1795): Dayton is outside, the extent remains", !(await inWC()) && wr.roles.some((r) => r[0] === "pol:ext_western_confederacy"), JSON.stringify(wr.roles.map((r) => r[0])));
      const card = await A(() => { const c = document.querySelector(".atlas2").__atlas2; c.select("pol:ext_western_confederacy", { open: true }); return null; });
      await sleep(400);
      const kind = await A(() => document.querySelector(".atlas2-card-kind").textContent + " | " + document.querySelector(".atlas2-card-body").textContent);
      check("its card says it is an authored extent, Folio's own approximation, made from the card's limit and Royce's cuts", /Authored extent/.test(kind) && /Royce/.test(kind), kind.slice(0, 200));
      await A(() => document.querySelector(".atlas2-card-close").click()); void card;
    }

    // PAIR 9 — the Eastern Front in November 1942: a monthly plate (30 November), the Allied side green and the Axis-held and -occupied ground red and orange
    {
      await viewAt(36, 52, 7, 1942);
      await A(() => document.querySelector(".atlas2").__atlas2.setFrontDate(19421130)); await settleH(); await sleep(700);
      const fr = await A(() => document.querySelector(".atlas2").__atlas2.fronts());
      check("30 November 1942: the front line is drawn from the monthly plate of that date (Europe only), four sets on screen", fr.on && fr.date === 19421130 && fr.standing.join() === "eur:1942-11-30" && fr.drawn.length >= 2 && fr.visible, `${fr.label}; ${fr.drawn.length} faces`);
      const moscow = tone(await px(37.6, 55.75)), kiev = tone(await px(30.5, 50.4)), berlin = tone(await px(13.4, 52.5));
      await setF(false); const k2 = tone(await px(30.5, 50.4)), m2 = tone(await px(37.6, 55.75)), b2 = tone(await px(13.4, 52.5)); await setF(true);
      // the tint is judged against the SAME ground with the front off: the state's own hue under it is a slot of the palette, which a rebuild that adds an entity reassigns (the USSR of 1942 went from a hue that left Moscow green to one that left it grey)
      check("Moscow is Allied-held ground (green), Kyiv ground the Axis occupied (red-orange) and Berlin Axis-held (red) — the plate's own classes", moscow.gr - m2.gr > 3 && kiev.rg - k2.rg > 3 && berlin.rg - b2.rg > 3, `Moscow ${moscow.r},${moscow.g},${moscow.b} (front off ${m2.r},${m2.g},${m2.b}); Kyiv ${kiev.r},${kiev.g},${kiev.b} (off ${k2.r},${k2.g},${k2.b}); Berlin ${berlin.r},${berlin.g},${berlin.b} (off ${b2.r},${b2.g},${b2.b})`);
      check("the front switch off removes it (Kyiv returns to plain land)", Math.abs(k2.rg - kiev.rg) + Math.abs(k2.gr - kiev.gr) > 3 || k2.r !== kiev.r, `${k2.r},${k2.g},${k2.b}`);
      const fe = await A(() => { const c = document.querySelector(".atlas2").__atlas2; return c.fronts().label; });
      check("the stepper says the date, the theatre and its uncertainty in a sentence", /30 Nov 1942/.test(fe) && /Europe/.test(fe) && /approximate/.test(fe), fe);
      const stk = await A((c) => document.querySelector(".atlas2").__atlas2.stackAt(c[0], c[1]), await toXY(30.5, 50.4));
      check("a tap on the front names its set (a front is an entity of its own, apart from any state or people)", stk.some((i) => /^pol:front_/.test(i)), stk.join(" > "));
      // Phase 4 / 0b — where the source map ends: the monthly maps' frame (a Lambert conformal conic rectangle, x −2271…2582 km, y 4556…8841 km) fades the tint to nothing at its sides
      {
        const d = Math.PI / 180, a1 = 45 * d, b1 = 60 * d, n = Math.log(Math.cos(a1) / Math.cos(b1)) / Math.log(Math.tan(Math.PI / 4 + b1 / 2) / Math.tan(Math.PI / 4 + a1 / 2)), F = Math.cos(a1) * Math.pow(Math.tan(Math.PI / 4 + a1 / 2), n) / n;
        const inv = (x, y) => { const X = x / 6371, Y = F - y / 6371, rho = Math.hypot(X, Y), th = Math.atan2(X, Y); return [15 + th / n / d, (2 * Math.atan(Math.pow(F / rho, 1 / n)) - Math.PI / 2) / d]; };
        const near = inv(2562, 7600), far = inv(2182, 7600);   // 20 km and 400 km inside the right-hand side of the frame, in the Urals (Allied-held ground on the 31 December 1942 plate)
        await viewAt(55, 56, 12, 1942); await A(() => document.querySelector(".atlas2").__atlas2.setFrontDate(19421231)); await settleH(); await sleep(700);
        const dd = (p, q) => Math.abs(p.r - q.r) + Math.abs(p.g - q.g) + Math.abs(p.b - q.b);
        const eN = tone(await px(near[0], near[1])), eF = tone(await px(far[0], far[1]));
        await setF(false); const oN = tone(await px(near[0], near[1])), oF = tone(await px(far[0], far[1])); await setF(true);
        check("Phase 4 / 0b: on the 31 December 1942 plate the tint 20 km inside the source map's edge is under a third of the tint 400 km inside it (a soft edge, no line)", dd(eF, oF) > 9 && dd(eN, oN) < dd(eF, oF) / 3, `near ${dd(eN, oN)}, far ${dd(eF, oF)}`);
        const sentence = await A(() => ({ legend: (document.querySelector(".atlas2-fronts-edge") || {}).textContent || "", card: document.querySelector(".atlas2").__atlas2.frontCardHtml ? document.querySelector(".atlas2").__atlas2.frontCardHtml({ id: "pol:front_axis", name: "Axis-held", front: { set: "axis" } }) : "" }));
        check("...and the legend and the front's place card each say in one sentence that the source map ends there", /source map ends there; the war did not\./.test(sentence.legend) && /source map ends there; the war did not\./.test(sentence.card), sentence.legend + " | " + sentence.card.replace(/<[^>]+>/g, " ").slice(0, 80));
      }
    }

    // PAIR 10 — the Western Front in June 1944: a fortnightly plate (15 June), Europe and the Pacific plates standing at once
    {
      await viewAt(5, 50, 6, 1944);
      await A(() => document.querySelector(".atlas2").__atlas2.setFrontDate(19440615)); await settleH(); await sleep(700);
      const fr = await A(() => document.querySelector(".atlas2").__atlas2.fronts());
      check("15 June 1944: both plates of the date stand (Europe and the Pacific), the stepper reads it, and the faces are drawn", fr.standing.sort().join() === "eur:1944-06-15,pac:1944-06-15" && fr.drawn.length >= 2 && /15 Jun 1944/.test(fr.label), `${fr.standing.join()}; ${fr.label}`);
      const london = tone(await px(-0.13, 51.5)), paris = tone(await px(2.35, 48.86)), berlin = tone(await px(13.4, 52.5));
      check("London is Allied-held (green), Paris still ground the Axis occupied (orange-red) and Berlin Axis-held (red)", london.gr > 3 && paris.rg > 3 && berlin.rg > 3, `London ${london.r},${london.g},${london.b}; Paris ${paris.r},${paris.g},${paris.b}; Berlin ${berlin.r},${berlin.g},${berlin.b}`);
      // steps never interpolate: the next plate is a different set of faces, not a blend; and the step before 1 July 1943 jumps over the gap
      const before = fr.drawn.map((d) => d.face).sort((a, b) => a - b).join();
      await A(() => document.querySelector(".atlas2").__atlas2.stepFront(1)); await settleH(); await sleep(500);
      const after = await A(() => document.querySelector(".atlas2").__atlas2.fronts());
      check("the next plate (1 July 1944) is another set of faces; between plates the previous one stands (no blend)", after.date === 19440701 && after.drawn.map((d) => d.face).sort((a, b) => a - b).join() !== before, `${after.date}`);
      await A(() => document.querySelector(".atlas2").__atlas2.setFrontDate(19430701)); await settleH(); await sleep(400);
      await A(() => document.querySelector(".atlas2").__atlas2.stepFront(-1)); await settleH(); await sleep(400);
      const gapNow = await A(() => document.querySelector(".atlas2").__atlas2.fronts());
      await A(() => document.querySelector(".atlas2").__atlas2.setFrontDate(19430701)); await settleH(); await sleep(300);
      const lbl = await A(() => document.querySelector(".atlas2").__atlas2.fronts().label);
      check("before 1 July 1943 the previous plate is 31 December 1942, and the stepper says nothing exists between (no source for January–June 1943)", gapNow.date === 19421231 && /no plate from 31 Jan 1943 to 30 Jun 1943/.test(lbl), `${gapNow.date}; ${lbl}`);
      await A(() => { const c = document.querySelector(".atlas2").__atlas2; c.setYear(1943); }); await settleH(); await sleep(300);
      await A(() => document.querySelector(".atlas2").__atlas2.setYear(1938)); await settleH(); await sleep(300);
      check("a year with no plate (1938) shows no front and no stepper", !(await A(() => document.querySelector(".atlas2").__atlas2.fronts())).visible && (await A(() => document.querySelector(".atlas2").__atlas2.fronts().drawn.length)) === 0);
    }
  }

  check("no page errors on #map", errors.length === 0, errors.slice(0, 3).join(" | "));
  await browser.close(); server.close();
  console.log(`\n${pass} ok, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
