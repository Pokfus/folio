/* test-atlas-windows.js — the card windows on the Atlas v2 engine, Phase 4b: fast, legible, at parity (docs/atlas-v2-design.md §7 "Phase 4b — as built"; docs/atlas-v2-card-windows.md has the mapping of every V1 window assertion to its engine counterpart).

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-windows.js
     FOLIO_CHROMIUM=/path/to/chrome

   Every section runs with the per-viewer preview switch ON (localStorage `folio.atlas2.preview`); the switch is OFF by default and nothing here changes what a reader of the live site sees.
     1  A WINDOW IS A BLOCK OF ITS FINAL SIZE AT ONCE (Task 2): within 300 ms of the card's mount the window's host is its final height with the "Loading the map…" placeholder, and the card's own text is
        already on the page — it never waits for the engine; when the engine paints, the block does not move (no layout shift).
     2  TAPS AND BACK (decision 3): before the reveal a tap on a map card does nothing, and nothing on it answers; the go button always opens the Atlas; after the reveal a tap does; Back (the browser's
        and the Atlas's own "Back to studying" button) returns to the same card with its reveal state as it was.
     3  THE SELECTED STATE IS WHOLE (Task 6): a state highlighted on a window, and a state selected on the Atlas page, are filled edge to edge — no holes where the country's own triangles overdraw it.
     4  WAR WINDOWS NAME THEIR SIDES (decision 2): the Second Punic War's window names Rome and Carthage on the map and in a one-line legend drawn from the card's own sides; a side that is only an authored
        extent says so ("approximate extent") and is drawn apart from a state; no side is named that the card does not name.
     5  RIVERS (decision 4): a window with rivers draws the engine's own at the Atlas's density for its zoom; Texas, which drew none, now has them.
     6  THE FIT SWEEP (Task 7): the fifty-one states each open framed on themselves (neither a speck nor cut off), Alaska ignores the rings across the antimeridian, Rhode Island opens zoomed in and centred.
     7  THE FINE FRAMES (Task 7): the Italian and the Russian locator frames open on a level finer than the resident coarsest, and settle (their tiles in) — the engine's counterpart of V1's hi-res coast bundles.
     8  SIBLING REDS (Task 7): with studied cards, a locator window shows the collection's other studied places in red and names them; with none it shows none; the collection's home square is always there.
     9  No console or page errors. */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");
const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream", ".woff2": "font/woff2" };
const PORT = 5624;
const requests = [];
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  requests.push(p);
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  " + extra : "")); } };
const sect = (t) => console.log("\n\x1b[1m" + t + "\x1b[0m\n");
const errors = [];
const TOURS = `localStorage.setItem("folio_tour_v1","1");localStorage.setItem("folio_atlas_tour_v1","1");localStorage.setItem("folio_library_tour_v1","1");localStorage.setItem("folio_mine_tour_v1","1");`;

/* a page with the switch ON, the tours dismissed, and (optionally) a study session on one card and/or a profile that has studied some cards */
async function newPage(browser, o) {
  o = o || {};
  const ctx = await browser.newContext({ viewport: o.viewport || { width: 1100, height: 900 }, deviceScaleFactor: o.dpr || 1, isMobile: !!o.mobile, hasTouch: !!o.mobile });
  await ctx.addInitScript(({ studied, session, tours }) => {
    try { localStorage.setItem("folio.atlas2.preview", "1"); } catch (e) {}
    try { if (tours) { localStorage.setItem("folio_tour_v1", "1"); localStorage.setItem("folio_atlas_tour_v1", "1"); localStorage.setItem("folio_library_tour_v1", "1"); localStorage.setItem("folio_mine_tour_v1", "1"); } } catch (e) {}
    try { if (studied) { const cards = {}; for (const id of studied) cards[id] = { due: Date.now() + 864e5 * 5, ivl: 5, ease: 2.5, reps: 3, lapses: 0, state: "review", lastReview: Date.now() - 864e5 }; localStorage.setItem("folio_v1", JSON.stringify({ active: [], cards, settings: { marker: false } })); } } catch (e) {}
    try { if (session && !sessionStorage.getItem("folio_study_v1")) sessionStorage.setItem("folio_study_v1", JSON.stringify(session)); } catch (e) {}
  }, { studied: o.studied || null, session: o.session || null, tours: o.tours !== false });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text()) && !/GL_INVALID|WebGL/.test(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  return { ctx, page };
}
const sessionFor = (id, rev) => ({ scope: { type: "card", id }, queue: [id], id, qi: 0, rev: !!rev, studied: 0 });
const url = (hash) => `http://127.0.0.1:${PORT}/${hash || ""}`;
const windowReady = (page, sel) => page.waitForFunction((s) => { const h = document.querySelector(s || ".map-card"); return h && h.getAttribute("data-map-engine") === "v2" && h._folioMap && h._folioMap.ready() && !h.classList.contains("mc-loading"); }, sel, { timeout: 120000 });
const windowSettled = (page, sel) => page.waitForFunction((s) => { const h = document.querySelector(s || ".map-card"); return h && h._folioMap && h._folioMap.settled && h._folioMap.settled(); }, sel, { timeout: 180000 });
/* the pixels of a window's canvas, counted by a predicate on (r, g, b, a) — the same device the other suites use */
const count = (page, sel, fnSrc, box) => page.evaluate(([s, src, b]) => { const c = document.querySelector(s), x = c.getContext("2d"); const f = new Function("r", "g", "b", "a", "return (" + src + ");"); const x0 = Math.round(c.width * (b ? b[0] : 0)), y0 = Math.round(c.height * (b ? b[1] : 0)), x1 = Math.round(c.width * (b ? b[2] : 1)), y1 = Math.round(c.height * (b ? b[3] : 1)); const d = x.getImageData(x0, y0, x1 - x0, y1 - y0).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (f(d[i], d[i + 1], d[i + 2], d[i + 3])) n++; return n; }, [sel, fnSrc, box || null]);

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch(LAUNCH);
  const only = (process.argv.find((a) => a.startsWith("--only=")) || "").slice(7).split(",").filter(Boolean);
  const want = (n) => !only.length || only.includes(String(n));

  /* ---------------- 1) the placeholder ---------------- */
  if (want(1)) {
    sect("1) a window is a block of its final size at once");
    const { ctx, page } = await newPage(browser, { session: sessionFor("geo-002") });
    // the mount, stamped by a MutationObserver (a microtask after the card is inserted); the first look at the window is taken in the next frame
    await ctx.addInitScript(() => {
      window.__w = {};
      const look = (tag) => { const h = document.querySelector(".map-card"); if (!h || window.__w[tag]) return; const q = document.querySelector(".question"); const after = getComputedStyle(h, "::after"); window.__w[tag] = { t: performance.now(), h: h.offsetHeight, w: h.offsetWidth, loading: h.classList.contains("mc-loading"), after: after.content, engine: h.getAttribute("data-map-engine"), text: q ? q.textContent.replace(/\s+/g, " ").trim() : "", canvasH: h.querySelector(".mc-canvas").offsetHeight }; };
      new MutationObserver(() => { const h = document.querySelector(".map-card"); if (h && window.__w.mount == null) { window.__w.mount = performance.now(); requestAnimationFrame(() => requestAnimationFrame(() => look("first"))); } }).observe(document, { childList: true, subtree: true });
    });
    await page.goto(url("#study"), { waitUntil: "load" });
    await windowReady(page); await windowSettled(page).catch(() => {});
    const w = await page.evaluate(() => Object.assign({}, window.__w, { final: (() => { const h = document.querySelector(".map-card"); return { h: h.offsetHeight, w: h.offsetWidth, canvasH: h.querySelector(".mc-canvas").offsetHeight }; })() }));
    const first = w.first || {};
    check("the window is on the page and has a block at its final size at the first look (within 300 ms of the card's mount)", !!first.t && first.t - w.mount < 300 && first.h === w.final.h && first.canvasH === w.final.canvasH && first.h > 150, JSON.stringify({ afterMountMs: first.t && Math.round(first.t - w.mount), first: [first.w, first.h], final: [w.final.w, w.final.h] }));
    check("...and says it is loading (the placeholder, not an empty box)", first.loading === true && /Loading the map/.test(first.after || ""), JSON.stringify([first.loading, first.after]));
    check("...with the card's own text already on the page — it did not wait for the engine", /shaded on the map/.test(first.text || "") && first.engine !== "v2", JSON.stringify([first.engine, (first.text || "").slice(0, 60)]));
    check("when the engine paints, the block has not moved or resized (no layout shift)", w.final.h === first.h && w.final.w === first.w && w.final.canvasH === first.canvasH, JSON.stringify([first.h, w.final.h]));
    await ctx.close();
  }


  /* ---------------- 2) taps and Back ---------------- */
  if (want(2)) {
    sect("2) taps and Back");
    const { ctx, page } = await newPage(browser, { session: sessionFor("geo-002") });
    await page.goto(url("#study"), { waitUntil: "load" });
    await windowReady(page); await windowSettled(page).catch(() => {});
    const box = () => page.$eval(".map-card .mc-canvas", (e) => { const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; });
    const hash = () => page.evaluate(() => location.hash);
    const aria = await page.$eval(".map-card .mc-canvas", (e) => e.getAttribute("aria-label") || "");
    const hostText = await page.$eval(".map-card", (e) => e.textContent);
    check("before the reveal nothing on the window can answer the card: its words and its aria text do not name the state", !/texas/i.test(aria) && !/texas/i.test(hostText), JSON.stringify([aria.slice(0, 80), hostText.replace(/\s+/g, " ").slice(0, 60)]));
    let b = await box();
    await page.mouse.click(b.x + b.w / 2, b.y + b.h / 2); await page.waitForTimeout(700);
    check("...and a tap on it before the reveal does nothing (still the study page, the card unrevealed)", (await hash()) === "#study" && (await page.$("#reveal-btn")) !== null, await hash());
    // reveal, then a tap opens the Atlas
    await page.click("#reveal-btn"); await page.waitForTimeout(900);
    check("revealed, the card shows its answer", (await page.evaluate(() => (document.body.textContent || "").includes("Texas") && !document.querySelector("#reveal-btn"))));
    await windowSettled(page).catch(() => {});
    b = await box();
    await page.mouse.click(b.x + b.w / 2, b.y + b.h / 2);
    await page.waitForFunction(() => /^#map2\//.test(location.hash), null, { timeout: 15000 }).catch(() => {});
    check("after the reveal a tap on the window opens the Atlas at the window's view", /^#map2\/-?\d+(\.\d+)?\/-?\d+(\.\d+)?\/\d+(\.\d+)?/.test(await hash()), await hash());
    await page.waitForSelector(".atlas2-back", { timeout: 60000 });
    await page.click(".atlas2-back");
    await page.waitForSelector(".map-card", { timeout: 20000 });
    const st2 = await page.evaluate(() => ({ hash: location.hash, reveal: !!document.querySelector("#reveal-btn"), shown: (document.body.textContent || "").includes("Texas"), rec: JSON.parse(sessionStorage.getItem("folio_study_v1") || "null") }));
    check("\"Back to studying\" returns to the same card with its answer still showing", st2.hash === "#study" && !st2.reveal && st2.shown && st2.rec && st2.rec.id === "geo-002" && st2.rec.rev === true, JSON.stringify({ h: st2.hash, reveal: st2.reveal, shown: st2.shown, rev: st2.rec && st2.rec.rev }));
    await windowReady(page).catch(() => {}); await windowSettled(page).catch(() => {});
    b = await box();
    await page.mouse.click(b.x + b.w / 2, b.y + b.h / 2);
    await page.waitForFunction(() => /^#map2\//.test(location.hash), null, { timeout: 15000 }).catch(() => {});
    await page.waitForSelector(".atlas2", { timeout: 60000 });
    await page.goBack();
    await page.waitForSelector(".map-card", { timeout: 20000 });
    const st3 = await page.evaluate(() => ({ hash: location.hash, reveal: !!document.querySelector("#reveal-btn"), shown: (document.body.textContent || "").includes("Texas"), rec: JSON.parse(sessionStorage.getItem("folio_study_v1") || "null") }));
    check("the browser's Back from a revealed card's Atlas also lands on the same card, answer showing", st3.hash === "#study" && !st3.reveal && st3.shown && st3.rec && st3.rec.rev === true, JSON.stringify({ h: st3.hash, reveal: st3.reveal, shown: st3.shown }));
    await ctx.close();
    // a locator window carries the go button — the way through to the Atlas, always (a map card has none: its only way is the tap, and only after the reveal)
    {
      const L = await newPage(browser, { session: sessionFor("rm-003", true) });
      await L.page.goto(url("#study"), { waitUntil: "load" });
      await L.page.waitForSelector(".card-loc .map-card", { timeout: 60000 });
      await windowReady(L.page, ".card-loc .map-card"); await windowSettled(L.page, ".card-loc .map-card").catch(() => {});
      check("a locator window has the go button, and the card's answer is showing", (await L.page.$('.card-loc .map-card [data-mc="go"]')) !== null && (await L.page.$("#reveal-btn")) === null);
      await L.page.click('.card-loc .map-card [data-mc="go"]');
      await L.page.waitForFunction(() => /^#map2\//.test(location.hash), null, { timeout: 15000 }).catch(() => {});
      check("the go button opens the Atlas at the window's view", /^#map2\/-?\d+(\.\d+)?\/-?\d+(\.\d+)?\/\d+(\.\d+)?/.test(await L.page.evaluate(() => location.hash)), await L.page.evaluate(() => location.hash));
      await L.page.waitForSelector(".atlas2", { timeout: 60000 });
      await L.page.goBack();
      await L.page.waitForSelector(".card-loc .map-card", { timeout: 30000 });
      const sb = await L.page.evaluate(() => ({ hash: location.hash, reveal: !!document.querySelector("#reveal-btn"), rec: JSON.parse(sessionStorage.getItem("folio_study_v1") || "null") }));
      check("the browser's Back returns to the same card with its answer showing", sb.hash === "#study" && !sb.reveal && sb.rec && sb.rec.id === "rm-003" && sb.rec.rev === true, JSON.stringify({ h: sb.hash, reveal: sb.reveal, id: sb.rec && sb.rec.id }));
      await L.ctx.close();
    }
  }


  /* ---------------- 3) the selected state is whole ---------------- */
  if (want(3)) {
    sect("3) a selected state is whole (no holes where the country's triangles overdraw it)");
    const { ctx, page } = await newPage(browser, { viewport: { width: 900, height: 700 } });
    await page.route("**/__harness", (r) => r.fulfill({ contentType: "text/html", body: `<!doctype html><meta charset=utf-8><link rel=stylesheet href=/styles.css><body style="margin:10px"><div id=host></div>${["atlas/atlas-format.js", "atlas/study.js", "atlas/atlas-gl.js", "atlas/atlas-canvas.js", "atlas/atlas.js", "atlas/atlas-embed.js", "atlas/data/card-faces.js", "us-states.js"].map((f) => `<script src=/${f}></script>`).join("")}` }));
    await page.goto(url("__harness"), { waitUntil: "load" });
    // render one state, tinted by a window's highlight or selected the way the Atlas selects a face, and measure how much of its interior is the tint
    const coverage = (state, how) => page.evaluate(async ([st, mode]) => {
      const hub = await AtlasEmbed.ensure({ host: {} });
      await new Promise((res) => { const t = setInterval(() => { if ((hub.done || hub.ready)()) { clearInterval(t); res(); } }, 100); });
      const T = ATLAS_CARD_FACES.layers["us-states"][st], id = T[0], b = T[3] != null ? [T[3], T[4], T[5], T[6]] : null;
      const rings = (window.US_STATES.find((s) => s.n === st) || {}).p || [];
      const cw = 560, ch = 440, cv = document.createElement("canvas"); cv.width = cw; cv.height = ch; const c2 = cv.getContext("2d");
      const lon = (b[0] + b[2]) / 2, lat = (b[1] + b[3]) / 2, span = Math.max(b[3] - b[1], (b[2] - b[0]) * Math.cos(lat * Math.PI / 180));
      const zoom = 0.62 / (0.46 * Math.PI / 180 * span);
      const R = hub.ctl.renderer, faces = hub.facesOf(id), landRGB = hub.landRGB(), pal = hub.ctl.palette();
      const gold = [1, 0.78, 0.16], a = 0.24, tint = [0, 1, 2].map((k) => landRGB[k] + (gold[k] - landRGB[k]) * a);
      const spec = { w: cw, h: ch, lon, lat, zoom, layers: { borders: true, provinces: true, admin1Max: 60 }, highlights: mode === "highlight" ? [{ ids: [id], rgb: [255, 200, 40], a, line: null, glow: null }] : [] };
      if (mode === "select") R.select(faces[0]); else R.select(null);
      const r = hub.draw(spec, c2, { dpr: 1, fast: true }); void r;
      for (let i = 0; i < 3; i++) hub.draw(spec, c2, { dpr: 1, fast: true });
      const L = hub.last, D = Math.PI / 180, rot = L.rot;
      const proj = (lo, la) => { const x = Math.cos(la * D) * Math.cos(lo * D), y = Math.cos(la * D) * Math.sin(lo * D), z = Math.sin(la * D); return [L.cx + L.radius * (rot[0] * x + rot[1] * y + rot[2] * z), L.cy - L.radius * (rot[3] * x + rot[4] * y + rot[5] * z)]; };
      const inside = (lo, la) => { let in_ = false; for (const ring of rings) for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const yi = ring[i][1], yj = ring[j][1]; if ((yi > la) !== (yj > la) && lo < (ring[j][0] - ring[i][0]) * (la - yi) / (yj - yi) + ring[i][0]) in_ = !in_; } return in_; };
      const edgeD = (lo, la) => { let m = 1e9; for (const ring of rings) for (let i = 1; i < ring.length; i++) { const x0 = ring[i - 1][0], y0 = ring[i - 1][1], x1 = ring[i][0], y1 = ring[i][1]; const dx = x1 - x0, dy = y1 - y0, t = Math.max(0, Math.min(1, ((lo - x0) * dx + (la - y0) * dy) / (dx * dx + dy * dy || 1))); m = Math.min(m, Math.hypot(lo - (x0 + t * dx), la - (y0 + t * dy))); } return m; };
      const want = mode === "select" ? pal.selected : tint, d = c2.getImageData(0, 0, cw, ch).data;
      let n = 0, hit = 0;
      for (let k = 0; k < 4000; k++) {
        const lo = b[0] + (b[2] - b[0]) * ((k * 0.6180339887) % 1), la = b[1] + (b[3] - b[1]) * ((k * 0.7548776662) % 1);
        if (!inside(lo, la) || edgeD(lo, la) < 0.3) continue;
        const p = proj(lo, la), x = Math.round(p[0]), y = Math.round(p[1]); if (x < 1 || y < 1 || x >= cw - 1 || y >= ch - 1) continue;
        n++; const o = 4 * (y * cw + x), dd = Math.max(Math.abs(d[o] / 255 - want[0]), Math.abs(d[o + 1] / 255 - want[1]), Math.abs(d[o + 2] / 255 - want[2]));
        if (dd < 0.06) hit++;
      }
      return { n, hit, frac: n ? hit / n : 0, level: L.level };
    }, [state, how]);
    for (const [state, how] of [["Colorado", "select"], ["Texas", "select"], ["Colorado", "highlight"], ["Texas", "highlight"]]) {
      const r = await coverage(state, how);
      check(state + (how === "select" ? " selected the way the Atlas selects a face" : " highlighted by a card window") + ": every sampled interior point is the selection colour (no holes)", r.n > 200 && r.frac > 0.995, JSON.stringify(r));
    }
    await ctx.close();
  }


  /* ---------------- 4) war windows name their sides ---------------- */
  if (want(4)) {
    sect("4) war windows name their sides");
    for (const [id, vw, label] of [["rm-209", { width: 1100, height: 900 }, "desktop"], ["rm-209", { width: 390, height: 844 }, "phone"], ["rm-153", { width: 1100, height: 900 }, "desktop"], ["gr-552", { width: 390, height: 844 }, "phone"], ["ww2-096", { width: 1100, height: 900 }, "desktop"], ["ww2-096", { width: 390, height: 844 }, "phone"]]) {
      const { ctx, page } = await newPage(browser, { viewport: vw, dpr: label === "phone" ? 2 : 1, mobile: label === "phone" });
      await page.goto(url("#card/" + id), { waitUntil: "load" });
      await page.reload({ waitUntil: "load" });
      await windowReady(page); await windowSettled(page).catch(() => {});
      await page.waitForTimeout(600);
      const info = await page.evaluate((cid) => { const h = document.querySelector(".map-card"), W = window.ATLAS_WARS.wars[cid]; return { legend: h._folioMap.legend(), names: h._folioMap.names(), sides: [W.v.n, W.l.n], extent: [!W.v.m.length && !!W.v.x, !W.l.m.length && !!W.l.x], year: h.getAttribute("data-map-year"), w: h.querySelector(".mc-canvas").clientWidth }; }, id);
      const tag = id + " " + label;
      check(tag + ": the window names the war's two principal sides on the map (the card's own names)", info.names.length === 2 && info.names[0] === info.sides[0] && info.names[1] === info.sides[1], JSON.stringify(info.names));
      /* the legend keeps "— victors / — defeated" while it fits; on a narrow window with long names it drops those words (the swatch colour and the legend under the window say it) and then shortens "approximate extent", never the order or the names */
      const wordsKept = info.legend.length === 2 && /— victors$/.test(info.legend[0]) && /— defeated$/.test(info.legend[1]);
      check(tag + ": a one-line legend is drawn from the card's own sides, victors then defeated" + (id === "rm-209" ? ", with the words" : ""), info.legend.length === 2 && info.legend[0].indexOf(info.sides[0]) === 0 && info.legend[1].indexOf(info.sides[1]) === 0 && (id !== "rm-209" || wordsKept), JSON.stringify(info.legend));
      check(tag + ": no side is named that the card does not name (its own name, then a count of states wherever the table tints several for a side)", info.legend.every((t, i) => { const base = t.replace(/ \((approximate extent|approx\.)\)/, "").replace(/ — (victors|defeated)$/, ""); return base === info.sides[i] || new RegExp("^" + info.sides[i].replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + " · \\d+ states$").test(base); }), JSON.stringify(info.legend));
      check(tag + ": the legend never says or implies allies", info.legend.every((t) => !/allies|allied/i.test(t)), JSON.stringify(info.legend));
      if (id === "ww2-096") check(tag + ": the Second Sino-Japanese War's China reads \"China · 2 states\" in the card's own name and the table's count", /^China · 2 states/.test(info.legend[0]), JSON.stringify(info.legend));
      const green = await count(page, ".map-card .mc-canvas", "g > r + 40 && g > b + 25", [0, 0.82, 0.7, 1]), red = await count(page, ".map-card .mc-canvas", "r > g + 60 && r > b + 50", [0, 0.82, 0.7, 1]);
      check(tag + ": the legend's swatches are the engine's own victor green and loser red, in the pill at the foot", green > 20 && red > 20, JSON.stringify({ green, red }));
      if (info.extent.some(Boolean)) check(tag + ": a side that is only an authored extent says so, with a hatched swatch, and is not drawn as a state", info.legend.some((t, i) => info.extent[i] && /\((approximate extent|approx\.)\)/.test(t)) && info.legend.every((t, i) => !!info.extent[i] === /\((approximate extent|approx\.)\)/.test(t)), JSON.stringify(info.legend));
      else check(tag + ": a side that is a state is not called an extent", info.legend.every((t) => !/approx/.test(t)), JSON.stringify(info.legend));
      await ctx.close();
    }
  }

  /* ---------------- 4b) a window that is still waiting holds the hub ---------------- */
  if (want(4)) {
    sect("4b) a war window waiting for its history file keeps the hub alive (the idle timer must not dispose it)");
    const { ctx, page } = await newPage(browser, { viewport: { width: 1100, height: 900 } });
    // the history file arrives after 5 s; meanwhile the idle warm-up's release (here forced to 300 ms) keeps arming its dispose timer
    await page.route("**/atlas/data/history.bin", async (route) => { await new Promise((r) => setTimeout(r, 5000)); route.continue(); });
    await page.goto(url("#card/rm-209"), { waitUntil: "load" });
    await page.waitForFunction(() => window.AtlasEmbed && AtlasEmbed.hub(), null, { timeout: 120000 });
    for (let i = 0; i < 10; i++) { await page.evaluate(() => AtlasEmbed.release(300)); await new Promise((r) => setTimeout(r, 500)); }
    await windowReady(page); await windowSettled(page);
    const st = await page.evaluate(() => ({ stats: AtlasEmbed.stats(), engine: document.querySelector(".map-card").getAttribute("data-map-engine") }));
    check("the window is the engine's, and settled, though the hub's dispose timer was re-armed all the while it waited", st.engine === "v2" && st.stats.created === 1 && st.stats.disposed === 0, JSON.stringify(st));
    await ctx.close();
  }

  /* ---------------- 5) rivers ---------------- */
  if (want(5)) {
    sect("5) rivers: the engine's own, at the Atlas's density for the window's zoom");
    for (const [id, what, bias] of [["geo-002", "the Texas map card (which drew none in Phase 4)", 0], ["rm-003", "the Tiber's locator (a river card: one level finer where one exists)", 1], ["wh-064", "Lake Toba's locator (a water card)", 1]]) {
      const reqs0 = requests.length;
      const { ctx, page } = await newPage(browser, id === "geo-002" ? { session: sessionFor("geo-002") } : {});
      await page.goto(url(id === "geo-002" ? "#study" : "#card/" + id), { waitUntil: "load" });
      await windowReady(page); await windowSettled(page).catch(() => {});
      await page.waitForTimeout(500);
      const info = await page.evaluate(() => { const hub = AtlasEmbed.hub(); const rv = hub.ctl.palette().river, l = hub.last; return { bias: hub.ctl.view.riverLevelBias, river: rv.map((v) => Math.round(v * 255)), level: l && l.level, kmpp: l && l.kmpp, stats: hub.ctl.renderer.stats ? hub.ctl.renderer.stats().riverSegments : null }; });
      const n = await count(page, ".map-card .mc-canvas", `Math.abs(r - ${info.river[0]}) < 26 && Math.abs(g - ${info.river[1]}) < 26 && Math.abs(b - ${info.river[2]}) < 26 && a > 200`);
      check(what + " draws rivers (pixels in the engine's river colour; Texas at the Atlas's own density for its zoom: 719 px, against 3,077 one level finer)", n > (id === "geo-002" ? 400 : 150), JSON.stringify({ px: n, level: info.level, kmpp: info.kmpp && +info.kmpp.toFixed(2), riverSegmentsDrawn: info.stats }));
      check("...from the engine's water file, fetched after the land (water.bin was requested)", requests.slice(reqs0).some((u) => /water\.bin/.test(u)));
      check("...at " + (bias ? "one resident level finer (the card's subject is water)" : "the Atlas's own density (the card's subject is not water)"), info.bias === bias, "riverLevelBias " + info.bias);
      await ctx.close();
    }
    {   // WHICH cards get the finer level: the registry's kind of the locator's place, not the card's name (Phase 4c)
      const F = {}; new Function("window", fs.readFileSync(path.join(ROOT, "atlas/data/card-faces.js"), "utf8"))(F);
      const W = F.ATLAS_CARD_FACES.water;
      check("the water-subject list is built from the registry: 23 cards by their place's kind, 2 by a declared river/sea kind with no place, 5 by the name fallback", W.cards.length === 30 && W.declared.length === 2 && W.byName.length === 5, JSON.stringify({ cards: W.cards.length, declared: W.declared, byName: W.byName }));
      check("...a site named for a river (wh-096) and a town named for a bay (pea-172) are NOT on it; a lake, a strait and a river are (wh-064, gga-161, eg-002)", !W.cards.includes("wh-096") && !W.cards.includes("pea-172") && ["wh-064", "gga-161", "eg-002"].every((id) => W.cards.includes(id)));
      for (const [id, what, bias] of [["wh-096", "Mal'ta, Belaya River (a site: the name says river, the registry says site)", 0], ["rm-043", "the Gulf of Tarentum (no resolved place: the name fallback)", 1]]) {
        const { ctx, page } = await newPage(browser, {});
        await page.goto(url("#card/" + id), { waitUntil: "load" });
        await windowReady(page); await windowSettled(page).catch(() => {}); await page.waitForTimeout(400);
        check(what + ": riverLevelBias " + bias, (await page.evaluate(() => AtlasEmbed.hub().ctl.view.riverLevelBias)) === bias);
        await ctx.close();
      }
    }
    {   // the reader's data saver: no water file at all (the finer level is in the same file as the coarse one), and the card's own gold river still draws
      const reqs0 = requests.length;
      const { ctx, page } = await newPage(browser, {});
      await ctx.addInitScript(() => { try { Object.defineProperty(navigator, "connection", { value: { saveData: true }, configurable: true }); } catch (e) {} });
      await page.goto(url("#card/rm-003"), { waitUntil: "load" });
      await windowReady(page); await windowSettled(page).catch(() => {}); await page.waitForTimeout(800);
      check("under the data saver a river locator fetches no water file and draws on the engine all the same", !requests.slice(reqs0).some((u) => /water\.bin|atlas\/data\/water\//.test(u)) && await page.evaluate(() => document.querySelector(".map-card").getAttribute("data-map-engine") === "v2"), requests.slice(reqs0).filter((u) => /water/.test(u)).join(" "));
      await ctx.close();
    }
  }


  /* ---------------- 6) the fit sweep ---------------- */
  if (want(6)) {
    sect("6) the fit: every state frames itself (the engine's windows, mounted through the real code, one per state)");
    const { ctx, page } = await newPage(browser, { session: sessionFor("geo-001"), viewport: { width: 1100, height: 900 } });
    await page.goto(url("#study"), { waitUntil: "load" });
    await windowReady(page);
    const res = await page.evaluate(async () => {
      const X = AtlasWindows.lastCtx, L = ATLAS_CARD_FACES.layers["us-states"], keys = Object.keys(L), out = [];
      const line = (X.TINT_SEL.line.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
      for (const key of keys) {
        const host = document.createElement("div"); host.className = "map-card"; host.setAttribute("data-map-layer", "us-states"); host.setAttribute("data-map-key", key);
        host.style.cssText = "position:absolute;left:0;top:0;width:735px;height:343px"; host.innerHTML = '<canvas class="mc-canvas" style="display:block;width:735px;height:343px"></canvas><div class="mc-zoom"></div>';
        document.body.appendChild(host);
        AtlasWindows.startCardWindow(host, X);
        const t0 = performance.now();
        while (performance.now() - t0 < 90000 && !(host._folioMap && host._folioMap.ready() && host._folioMap.settled && host._folioMap.settled())) await new Promise((r) => setTimeout(r, 50));
        await new Promise((r) => setTimeout(r, 120));
        const cv = host.querySelector(".mc-canvas"), d = cv.getContext("2d").getImageData(0, 0, cv.width, cv.height).data;
        let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, n = 0;
        for (let i = 0; i < d.length; i += 4) if (Math.abs(d[i] - line[0]) < 36 && Math.abs(d[i + 1] - line[1]) < 36 && Math.abs(d[i + 2] - line[2]) < 40 && d[i + 3] > 200) { const p = i / 4, x = p % cv.width, y = (p / cv.width) | 0; n++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
        const v = host._folioMap.view(), b = L[key], D = Math.PI / 180;   // b = [id, label lon, label lat, west, south, east, north]: the box of the rings near the label point
        const span = Math.max(b[6] - b[4], (b[5] - b[3]) * Math.cos(b[2] * D), 0.2);
        out.push({ key, zoom: v.zoom, lon: v.lon, lat: v.lat, n, w: (x1 - x0) / cv.width, h: (y1 - y0) / cv.height, box: [x0, y0, x1, y1], cw: cv.width, ch: cv.height, span, fill: 0.46 * D * span * v.zoom / 0.55, settledMs: Math.round(performance.now() - t0) });
        host._folioMap.stop(); host.remove();
      }
      return out;
    });
    check("the fit was computed for all 51 states", res.length === 51, String(res.length));
    const bad = res.filter((r) => !isFinite(r.zoom) || r.zoom <= 0);
    check("every state fits to a finite positive zoom", !bad.length, bad.map((b) => b.key).join(", "));
    const seen = res.filter((r) => r.n > 30);
    check("every state's gold outline is on its window", seen.length === 51, res.filter((r) => r.n <= 30).map((b) => b.key + ":" + b.n).join(", "));
    /* V1's own measure: how much of the window's half-height the state's frame takes at the zoom the window opened at (1.0 would exactly fill it) — here with the engine window's ACTUAL zoom and the card-faces box;
       and what V1's sweep could not see, the drawn outline itself (Hawaii's chain is framed whole, so its main islands are small on screen, as in V1) */
    const tiny = res.filter((r) => r.fill < 0.45), big = res.filter((r) => r.fill > 1.02), speck = seen.filter((r) => Math.max(r.w * r.cw / r.ch, r.h) < 0.05), cut = seen.filter((r) => r.box[0] <= 0 || r.box[1] <= 0 || r.box[2] >= r.cw - 1 || r.box[3] >= r.ch - 1);
    check("no state opens too small to see (a speck on a globe): its frame takes at least 0.45 of the window's half-height", !tiny.length, tiny.map((b) => b.key + " " + b.fill.toFixed(2)).join(", "));
    check("...none opens too large for its window (at most 1.02)", !big.length, big.map((b) => b.key + " " + b.fill.toFixed(2)).join(", "));
    const capped = res.filter((r) => r.zoom >= 399.999).map((r) => r.key);
    console.log("  (at the zoom ceiling: " + (capped.join(", ") || "none") + ")");
    check("...at most one entry needs more zoom than the engine's ceiling allows (V1's rule: DC)", capped.length <= 1, capped.join(", "));
    check("...and what is drawn is visible and whole: every outline spans at least 5 % of the short side and none runs off the window's edge", !speck.length && !cut.length, JSON.stringify({ speck: speck.map((b) => b.key), cut: cut.map((b) => b.key) }));
    const ak = res.find((r) => r.key === "Alaska");
    check("Alaska's fit ignores the rings across the antimeridian (its frame spans under 40°, and the state is drawn at a size you can see)", ak && ak.span < 40 && ak.w > 0.2, JSON.stringify(ak && { span: ak.span, w: +ak.w.toFixed(2) }));
    const ri = res.find((r) => r.key === "Rhode Island");
    check("Rhode Island opens zoomed in on itself (zoom above 20) and centred on it", ri && ri.zoom > 20 && Math.abs(ri.lon + 71.5) < 1 && Math.abs(ri.lat - 41.6) < 1, JSON.stringify(ri && { zoom: Math.round(ri.zoom), lon: ri.lon, lat: ri.lat }));
    await ctx.close();
  }


  /* ---------------- 7) the fine frames and the frame's own rivers (V1's hi-res bundles, on the engine) ---------------- */
  if (want(7)) {
    sect("7) the Italian and the Russian frames on the engine: a fine level, the Atlas's rivers, no V1 bundles");
    // 7a: the Italian hi-res river file is DATA the card's own river still reads (rivers/italy.js supersedes rivers.js entries); V1's assertions about it, run in Node with no page
    {
      global.window = global.window || {}; window.RIVERS = undefined; window.HIRES_RIVER_IN = [];
      require(path.join(ROOT, "rivers.js")); require(path.join(ROOT, "rivers", "italy.js"));
      const e = window.HIRES_RIVER_IN[0], low = new Set(window.RIVERS.map((r) => String(r.n))), sup = new Set((e.supersede || []).map(String)), named = e.rivers.filter((r) => r.n);
      const pts = e.rivers.reduce((a, r) => a + r.p.reduce((b, l) => b + l.length, 0), 0), doubled = named.filter((r) => low.has(String(r.n)) && !sup.has(String(r.n))).map((r) => r.n);
      check("the Italian hi-res river file carries its own rivers, and more of them than rivers.js has there", e.rivers.length >= 40 && named.length >= 40 && sup.size >= 15, JSON.stringify({ rivers: e.rivers.length, named: named.length, supersedes: sup.size }));
      check("...at a resolution rivers.js has not got", pts / e.rivers.length > 40, "points " + pts);
      check("...every one it supersedes is really in rivers.js", [...sup].every((n) => low.has(n)));
      check("...and no river is drawn over itself", doubled.length === 0, doubled.join(", "));
    }
    // 7b: the Italian frame (rm-002, the Apennines) and the Russian frame (ru-002) on the engine
    for (const [id, what, riverMin] of [["rm-002", "the Italian frame (the Apennines)", 150], ["ru-002", "the Russian frame", 60]]) {
      const reqs0 = requests.length;
      const { ctx, page } = await newPage(browser, { viewport: { width: 1200, height: 1000 } });
      await page.goto(url("#card/" + id), { waitUntil: "load" });
      await windowReady(page); await windowSettled(page);
      await page.waitForTimeout(600);
      const info = await page.evaluate(() => { const hub = AtlasEmbed.hub(), l = hub.last, st = hub.ctl.statsNow(), rv = hub.ctl.palette().river.map((v) => Math.round(v * 255)); return { level: l.level, kmpp: l.kmpp, tiles: st.tilesDrawn, labels: st.labelsPlaced, river: rv }; });
      const n = await count(page, ".map-card .mc-canvas", `Math.abs(r - ${info.river[0]}) < 26 && Math.abs(g - ${info.river[1]}) < 26 && Math.abs(b - ${info.river[2]}) < 26 && a > 200`);
      const got = requests.slice(reqs0);
      const TOL_M = [10000, 2500, 500, 250, 75];   // the levels' simplification tolerances (design §2.3): a level is used while its tolerance is at most half a pixel
      check(what + " opens on a level whose coast is never coarser than half a pixel (V1's hi-res coast frames' counterpart, by the engine's own rule) and settles with its tiles in", info.level >= 1 && TOL_M[info.level] <= 0.5 * info.kmpp * 1000 + 1 && (info.level < 3 || info.tiles > 0), JSON.stringify({ level: info.level, toleranceM: TOL_M[info.level], halfPixelM: Math.round(0.5 * info.kmpp * 1000), kmPerPx: +info.kmpp.toFixed(2), tilesDrawn: info.tiles }));
      check(what + " draws the Atlas's rivers (the engine's, from water.bin), and not one of them is named (no label layer in a window)", n > riverMin && info.labels === 0, JSON.stringify({ riverPx: n, labelsPlaced: info.labels }));
      check(what + " fetched none of V1's hi-res coast bundles or its city layer", !got.some((u) => /\/coast\/|\/cities\.js/.test(u)), got.filter((u) => /coast|cities/.test(u)).join(","));
      await ctx.close();
    }
  }

  /* ---------------- 8) sibling reds ---------------- */
  if (want(8)) {
    sect("8) the collection's other places: red where studied, none where not, the home city always");
    const rec = (n) => n;
    const studied = ["gr-001", "gr-004", "gr-008", "gr-011", "gr-012", "gr-013", "gr-042", "gr-049", "gr-058", "gr-067", "gr-069", "gr-163", "gr-164", "gr-189", "gr-119"];
    const redOf = (page, id) => count(page, ".map-card.map-loc .mc-canvas", "r > 150 && r - g > 60 && r - b > 60");
    {   // a reader who has studied fourteen Greek cards, on the Cyclades
      const { ctx, page } = await newPage(browser, { viewport: { width: 1200, height: 1000 }, studied });
      await page.goto(url("#card/gr-002"), { waitUntil: "load" }); await page.reload({ waitUntil: "load" });
      await windowReady(page, ".map-card.map-loc"); await windowSettled(page, ".map-card.map-loc"); await page.waitForTimeout(600);
      const red = await redOf(page), ink = await count(page, ".map-card.map-loc .mc-canvas", "r < 90 && g < 90 && b < 90 && a > 200"), gold = await count(page, ".map-card.map-loc .mc-canvas", "r > 200 && g > 180 && r - b > 30");
      check("the collection's other studied places are on the map, in red", red > 60, "red px " + red);
      check("...with the card's own place still marked in the answer's gold", gold > 30, "gold/tint px " + gold);
      check("...and named, not left as bare dots", ink > 250, "ink px " + ink);
      await ctx.close();
    }
    {   // a reader who has studied nothing, on the Apennines: no earned place, but Rome as a small red square
      const { ctx, page } = await newPage(browser, { viewport: { width: 1200, height: 1000 } });
      await page.goto(url("#card/rm-002"), { waitUntil: "load" }); await page.reload({ waitUntil: "load" });
      await windowReady(page, ".map-card.map-loc"); await windowSettled(page, ".map-card.map-loc"); await page.waitForTimeout(600);
      const r = await page.evaluate(() => { const cv = document.querySelector(".map-card.map-loc .mc-canvas"), d = cv.getContext("2d").getImageData(0, 0, cv.width, cv.height).data; let n = 0, x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (let i = 0; i < d.length; i += 4) { const R = d[i], G = d[i + 1], B = d[i + 2]; if (R > 150 && R - G > 60 && R - B > 60) { n++; const p = i / 4, x = p % cv.width, y = (p / cv.width) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } } return { n, w: x1 - x0, h: y1 - y0, dpr: cv.width / cv.getBoundingClientRect().width }; });
      check("a reader who has studied nothing sees none of the collection's EARNED places (the only red is one compact mark)", r.w < 16 * r.dpr && r.h < 16 * r.dpr, JSON.stringify(r));
      check("...but the collection's home city is always on the map, as a square", r.n > 30 && r.n < 130, JSON.stringify(r));
      await ctx.close();
    }
  }

  /* ---------------- 9) the war-window slice (Phase 4c, decision 3) ---------------- */
  if (want(9)) {
    sect("9) a war window reads the war-window slice, not the whole history; Find it still reads the whole; file:// works");
    {
      const reqs0 = requests.length;
      const { ctx, page } = await newPage(browser, {});
      await page.goto(url("#card/rm-209"), { waitUntil: "load" });
      await windowReady(page); await windowSettled(page).catch(() => {}); await page.waitForTimeout(600);
      const got = requests.slice(reqs0);
      const sliceBytes = fs.statSync(path.join(ROOT, "atlas/data/history-wars.bin")).size, fullBytes = fs.statSync(path.join(ROOT, "atlas/data/history.bin")).size;
      check("a war window requests atlas/data/history-wars.bin and never atlas/data/history.bin", got.some((u) => /atlas\/data\/history-wars\.bin$/.test(u)) && !got.some((u) => /atlas\/data\/history\.bin/.test(u)), `${(sliceBytes / 1e6).toFixed(2)} MB instead of ${(fullBytes / 1e6).toFixed(2)} MB`);
      const info = await page.evaluate(() => { const h = document.querySelector(".map-card"); return { engine: h.getAttribute("data-map-engine"), kind: AtlasEmbed.hub().E.historyKind(), legend: h._folioMap.legend(), names: h._folioMap.names() }; });
      check("...and it is the engine's window, named and legended as before (Rome — victors, Carthage — defeated)", info.engine === "v2" && info.kind === "wars" && info.names.join() === "Rome,Carthage" && /^Rome/.test(info.legend[0]) && /^Carthage/.test(info.legend[1]), JSON.stringify(info));
      const green = await count(page, ".map-card .mc-canvas", "g > r + 40 && g > b + 25", [0, 0, 1, 0.8]), red = await count(page, ".map-card .mc-canvas", "r > g + 60 && r > b + 50", [0, 0, 1, 0.8]);
      check("...with the victors in green and the defeated in red on the map", green > 300 && red > 300, JSON.stringify({ green, red }));
      // leave for Find it: the hub that began on the slice is disposed and the next one reads the whole history
      await page.evaluate(() => { location.hash = "#findit"; });
      await page.waitForFunction(() => { const m = document.querySelector("#mapGame"); return m && !m.hidden && document.querySelector("#findit2"); }, null, { timeout: 180000 });
      await page.waitForTimeout(1500);
      const fi = await page.evaluate(() => ({ stats: AtlasEmbed.stats(), kind: AtlasEmbed.hub() && AtlasEmbed.hub().E.historyKind() }));
      check("Find it, opened after a war window, gets a hub that has not read the slice (the first was disposed, a second created)", fi.kind !== "wars" && fi.stats.created >= 2 && fi.stats.disposed >= 1, JSON.stringify(fi));
      await page.evaluate(() => AtlasEmbed.hub().startHistory("full"));   // the area round's year
      await page.evaluate(() => AtlasEmbed.hub().startHistory("wars"));   // a late war request cannot swap the file under the board
      await page.waitForFunction(() => AtlasEmbed.hub().E.historyKind() === "full" && AtlasEmbed.hub().historyOK(), null, { timeout: 120000 });
      check("...which reads the whole history when the area round asks for a year", await page.evaluate(() => AtlasEmbed.hub().E.historyKind() === "full"));
      await ctx.close();
    }
    {   // file://: the slice's own small twin; the war's sides have faces there (the pilot slice had 11 entities and no war window)
      const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 } });
      await ctx.addInitScript(() => { try { localStorage.setItem("folio.atlas2.preview", "1"); localStorage.setItem("folio_tour_v1", "1"); localStorage.setItem("folio_atlas_tour_v1", "1"); } catch (e) {} });
      const page = await ctx.newPage(), seen = [];
      page.on("request", (r) => seen.push(r.url()));
      page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
      await page.goto("file://" + path.join(ROOT, "index.html") + "#card/rm-209", { waitUntil: "load" });
      await windowReady(page); await windowSettled(page).catch(() => {}); await page.waitForTimeout(800);
      const info = await page.evaluate(() => { const h = document.querySelector(".map-card"); return { engine: h.getAttribute("data-map-engine"), kind: AtlasEmbed.hub().E.historyKind(), legend: h._folioMap.legend(), names: h._folioMap.names() }; });
      check("on file:// a war card's window is the engine's, drawn from history-wars.bin.js (and not the 11-entity pilot twin)", info.engine === "v2" && info.kind === "wars" && info.names.join() === "Rome,Carthage" && seen.some((u) => /history-wars\.bin\.js$/.test(u)) && !seen.some((u) => /\/history\.bin\.js$/.test(u)), JSON.stringify(info));
      const g2 = await count(page, ".map-card .mc-canvas", "g > r + 40 && g > b + 25", [0, 0, 1, 0.8]), r2 = await count(page, ".map-card .mc-canvas", "r > g + 60 && r > b + 50", [0, 0, 1, 0.8]);
      check("...with both sides tinted", g2 > 300 && r2 > 300, JSON.stringify({ green: g2, red: r2 }));
      await ctx.close();
    }
  }

  sect("errors");
  check("no console or page errors anywhere in this suite", errors.length === 0, errors.slice(0, 3).join(" | "));
  await browser.close(); server.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
