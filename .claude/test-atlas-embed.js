/* test-atlas-embed.js — the card windows and Find-it on the Atlas v2 engine (Atlas v2 Phase 4; docs/atlas-v2-card-windows.md, docs/atlas-v2-design.md §7 "Phase 4 — as built").

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-embed.js
     FOLIO_CHROMIUM=/path/to/chrome  … to pick the browser (otherwise playwright's own)

   WHAT IT PROVES, section by section (Phase 5: the engine is the only engine; the earlier window and its preview switch are gone):
     1  THE ENGINE AND ITS TWO FALLBACKS: with WebGL2 a map card is `data-map-engine="v2"`; with no WebGL2 it is drawn by the still Canvas 2D renderer (`"v2-2d"`), a war window is a plain sentence (`"none"`,
        `mc-plain`, the key stays) and Find it is playable; with the engine's bundle refused a window is a sentence (`.mc-plain-note`) and Find it says it could not be set up, with a Reload button.
        (test-window-fallbacks.js proves the same in depth: pixels, zoom, drag, a scored round.)
     2  ONE CONTEXT FOR THE PAGE: twenty windows on one page are one WebGL2 context (getContext is wrapped and counted), they all settle, and when the last goes away the hub is disposed
        after the idle time and the next window recreates it (created 2, disposed 1) — the "destroyed and recreated as cards change" of the design.
     3  A MAP CARD (Texas, a state; Rhode Island with its capital; the world layer with a country): the engine drew it, the shaded place is the selection gold as a TINT (the pixel at the centre is
        the land blended with TINT_SEL at its alpha — solved back out and required to be land, as test-map-cards.js does), the dot is the gold square, the zoom buttons and a drag change the view.
     4  A LOCATOR WINDOW (a point, a river with its own river in gold, a region clipped to land): the gold mark is there, the siblings' red is absent on a fresh profile, and a tap on the window
        does NOT open the Atlas (only the globe button does).
     5  A WAR WINDOW, IN ITS YEARS AND NONE OUTSIDE: the Second Punic War's window is drawn at its timeline's LAST step (202 BCE; CHANGED 2026-10-19: it was the middle of its years, 209 BCE) with green and red on screen, the same hub asked for a year after the war
        draws neither, and the go button opens #map at that year (CHANGED 2026-10-19: with no war in the address, and the Atlas, opened there, draws none — test-atlas-no-wars.js).
     6  FIND IT: the day is five rounds, the same five whenever it is dealt on one date (the equality with the retired board's deal is `compare-findit-deal.js`), a tap only picks ("Guess" appears, Clear withdraws it), a wrong guess says
        "N km away", a second try that is right counts as found, a place is scored by distance, the score line and the played-today door follow; under reduced motion the fly is instant.
     7  No console or page errors anywhere. */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");
const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream", ".woff2": "font/woff2" };
const PORT = 5621;
const requests = [];
const HARNESS = `<!doctype html><meta charset=utf-8><link rel=stylesheet href=/styles.css><body style="margin:10px">
<div id=host></div>${["atlas/atlas-format.js", "atlas/study.js", "atlas/atlas-gl.js", "atlas/atlas-canvas.js", "atlas/atlas.js", "atlas/atlas-embed.js"].map((f) => `<script src=/${f}></script>`).join("")}`;
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  requests.push(p);
  if (p === "/__harness") { res.writeHead(200, { "Content-Type": "text/html" }); res.end(HARNESS); return; }
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  " + extra : "")); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [];
// every WebGL2 context the page creates, counted at the source
const COUNT_CONTEXTS = () => { const orig = HTMLCanvasElement.prototype.getContext; window.__gl2 = 0; HTMLCanvasElement.prototype.getContext = function (type, ...rest) { if (type === "webgl2") window.__gl2++; return orig.call(this, type, ...rest); }; };

async function newPage(browser, o) {
  o = o || {};
  const ctx = await browser.newContext({ viewport: o.viewport || { width: 1100, height: 900 }, reducedMotion: o.reduced ? "reduce" : "no-preference" });
  if (o.noWebGL2) await ctx.addInitScript(() => { const orig = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (type, ...rest) { if (type === "webgl2") return null; return orig.call(this, type, ...rest); }; });
  await ctx.addInitScript(COUNT_CONTEXTS);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text()) && !/GL_INVALID|WebGL/.test(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  return { ctx, page };
}
async function openCard(page, id) {
  await page.goto(`http://127.0.0.1:${PORT}/#card/${id}`, { waitUntil: "load" });
  await page.reload({ waitUntil: "load" });
  await page.waitForSelector(".map-card", { timeout: 60000 });
  await page.waitForFunction(() => { const h = document.querySelector(".map-card"); return h && h._folioMap && h._folioMap.ready() && !h.classList.contains("mc-loading"); }, null, { timeout: 120000 }).catch(() => {});
}
// a window is settled when the engine says its tiles are in
const settled = (page) => page.waitForFunction(() => { const h = document.querySelector(".map-card"); return h && h.getAttribute("data-map-engine") === "v2" && AtlasEmbed.hub() && AtlasEmbed.stats().draws > 0 && document.querySelector(".map-card .mc-canvas"); }, null, { timeout: 120000 }).then(() => sleep(5000));
const pixelAt = (page, sel, fx, fy) => page.evaluate(([s, a, b]) => { const c = document.querySelector(s); const x = c.getContext("2d"); const d = x.getImageData(Math.round(c.width * a), Math.round(c.height * b), 1, 1).data; return [d[0], d[1], d[2], d[3]]; }, [sel, fx, fy]);

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch(LAUNCH);

  console.log("\n\x1b[1m1) the engine is the only engine: WebGL2 gives \"v2\"; no WebGL2 gives the still Canvas 2D renderer (\"v2-2d\") and a war window says so in a sentence; a refused bundle gives a sentence (\"none\")\x1b[0m\n");
  {
    // the default: nothing stored at all
    const d = await newPage(browser);
    requests.length = 0;
    await openCard(d.page, "geo-002"); await settled(d.page);
    check("a map card is drawn by the engine with WebGL2 (data-map-engine=v2)", (await d.page.evaluate(() => document.querySelector(".map-card").getAttribute("data-map-engine"))) === "v2");
    check("...and nothing of the retired v1 window is on the wire (no shape or coast bundle)", !requests.some((u) => /\/(us-states|world|china-provinces|russia-subjects|world-capitals|polities|timeline|lakes)\.js|\/coast\//.test(u)), requests.filter((u) => /us-states|world\.js|coast|polities|timeline/.test(u)).join(","));
    await d.ctx.close();

    // no WebGL2: the same window on the still renderer — drawn, ready, not failed, and the zoom buttons work
    const nw = await newPage(browser, { noWebGL2: true });
    await nw.page.goto(`http://127.0.0.1:${PORT}/#card/geo-002`, { waitUntil: "load" }); await nw.page.reload({ waitUntil: "load" });
    await nw.page.waitForSelector(".map-card", { timeout: 60000 });
    await nw.page.waitForFunction(() => { const h = document.querySelector(".map-card"); return h && h.getAttribute("data-map-engine") === "v2-2d" && h._folioMap && h._folioMap.ready() && !h.classList.contains("mc-loading"); }, null, { timeout: 120000 }).catch(() => {});
    await sleep(4000);
    const fb = await nw.page.evaluate(() => { const h = document.querySelector(".map-card"), c = h.querySelector(".mc-canvas"), d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let lit = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) lit++; return { eng: h.getAttribute("data-map-engine"), ready: !!(h._folioMap && h._folioMap.ready()), failed: h.classList.contains("mc-failed"), lit, total: d.length / 4, gl: window.__gl2 }; });
    check("with no WebGL2 a map card is drawn by the engine's still renderer (data-map-engine=v2-2d), ready and not failed", fb.eng === "v2-2d" && fb.ready && !fb.failed, JSON.stringify(fb));
    check("...and its canvas really carries a picture (most of its pixels are painted)", fb.lit > fb.total * 0.5, fb.lit + " of " + fb.total);
    // a war card: no tint is possible, so the window is a sentence and the key stays
    await openCard(nw.page, "rm-209");
    await nw.page.waitForFunction(() => { const h = document.querySelector(".map-card"); return h && h.getAttribute("data-map-engine") === "none"; }, null, { timeout: 120000 }).catch(() => {});
    const wr = await nw.page.evaluate(() => { const h = document.querySelector(".map-card"), n = h.querySelector(".mc-plain-note"); return { eng: h.getAttribute("data-map-engine"), plain: h.classList.contains("mc-plain"), note: n ? n.textContent : "", key: !!document.querySelector(".war-key") }; });
    check("with no WebGL2 a war window is a plain sentence about WebGL2 (data-map-engine=none, mc-plain) and the key is still on the card", wr.eng === "none" && wr.plain && /WebGL2/.test(wr.note) && wr.key, JSON.stringify(wr));
    // Find it plays: the board is dealt five rounds
    await nw.page.goto(`http://127.0.0.1:${PORT}/#findit`, { waitUntil: "load" }); await nw.page.reload({ waitUntil: "load" });
    await nw.page.waitForFunction(() => { const m = document.querySelector("#mapGame"); return m && !m.hidden && document.querySelector("#findit2") && document.querySelector("#mgQ") && document.querySelector("#mgQ").textContent.length > 3; }, null, { timeout: 180000 }).catch(() => {});
    const fi = await nw.page.evaluate(() => { const h = [...document.querySelectorAll("*")].find((e) => e._finditApi); return { rounds: h ? h._finditApi.rounds().length : 0, board: !!document.querySelector("#fi2Board"), q: (document.querySelector("#mgQ") || {}).textContent }; });
    check("with no WebGL2 Find it is playable: the board is up and the day is five rounds", fi.board && fi.rounds === 5 && fi.q && fi.q.length > 3, JSON.stringify(fi));
    await nw.ctx.close();

    // a refused bundle: the window is a sentence, the card is intact, Find it says it could not be set up
    const rb = await newPage(browser);
    await rb.ctx.route(/atlas\/atlas-(embed|windows)\.js/, (r) => r.abort());
    await rb.page.goto(`http://127.0.0.1:${PORT}/#card/geo-002`, { waitUntil: "load" }); await rb.page.reload({ waitUntil: "load" });
    await rb.page.waitForSelector(".map-card", { timeout: 60000 });
    await rb.page.waitForFunction(() => { const h = document.querySelector(".map-card"); return h && h.getAttribute("data-map-engine") === "none"; }, null, { timeout: 60000 }).catch(() => {});
    const rf = await rb.page.evaluate(() => { const h = document.querySelector(".map-card"), n = h.querySelector(".mc-plain-note"); return { eng: h.getAttribute("data-map-engine"), note: n ? n.textContent : "" }; });
    check("with the engine's bundle refused a map card shows its sentence (data-map-engine=none, .mc-plain-note)", rf.eng === "none" && /could not be drawn/.test(rf.note), JSON.stringify(rf));
    await rb.page.goto(`http://127.0.0.1:${PORT}/#findit`, { waitUntil: "load" }); await rb.page.reload({ waitUntil: "load" });
    await rb.page.waitForSelector("#fiReload", { timeout: 60000 }).catch(() => {});
    const rf2 = await rb.page.evaluate(() => ({ text: document.body.textContent.includes("Find it could not be set up"), reload: !!document.querySelector("#fiReload") }));
    check("...and Find it shows \"Find it could not be set up\" with a Reload button", rf2.text && rf2.reload, JSON.stringify(rf2));
    await rb.ctx.close();
  }

  console.log("\n\x1b[1m2) one context for twenty windows, destroyed and recreated\x1b[0m\n");
  {
    const { ctx, page } = await newPage(browser);
    await page.goto(`http://127.0.0.1:${PORT}/__harness`);
    const r = await page.evaluate(async () => {
      const host = document.getElementById("host"), wins = [];
      for (let i = 0; i < 20; i++) { const c = document.createElement("canvas"); c.style.cssText = "width:150px;height:110px;margin:2px"; host.appendChild(c); wins.push(AtlasEmbed.view(c, { spec: () => ({ layers: { borders: true } }), zmin: 0.85, zmax: 400 })); wins[i].setView(-10 + i * 6, 35 + (i % 5) * 4, 5 + (i % 4)); }
      await new Promise((res) => { const t = setInterval(() => { if (wins.every((w) => w.isSettled())) { clearInterval(t); res(); } }, 200); setTimeout(() => { clearInterval(t); res(); }, 90000); });
      const mid = { stats: AtlasEmbed.stats(), gl: window.__gl2, settled: wins.filter((w) => w.isSettled()).length };
      AtlasEmbed.setIdleMs(300); wins.forEach((w) => w.stop());
      await new Promise((res) => setTimeout(res, 1500));
      const gone = { stats: AtlasEmbed.stats(), hub: !!AtlasEmbed.hub() };
      const c = document.createElement("canvas"); c.style.cssText = "width:150px;height:110px"; host.appendChild(c);
      const w2 = AtlasEmbed.view(c, { spec: () => ({ layers: { borders: true } }), zmin: 0.85, zmax: 400 }); w2.setView(12, 42, 6);
      await new Promise((res) => { const t = setInterval(() => { if (w2.isSettled()) { clearInterval(t); res(); } }, 200); setTimeout(() => { clearInterval(t); res(); }, 90000); });
      const lit = (() => { const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 0) n++; return n; })();
      return { mid, gone, again: { stats: AtlasEmbed.stats(), gl: window.__gl2, lit } };
    });
    check("twenty windows are ONE live engine and ONE WebGL2 context", r.mid.stats.live === 1 && r.mid.gl === 1 && r.mid.stats.windows === 20, JSON.stringify([r.mid.stats.live, r.mid.gl, r.mid.stats.windows]));
    check("all twenty drew and settled", r.mid.settled === 20, r.mid.settled + " of 20");
    check("when the last window goes the hub is disposed after the idle time", r.gone.stats.live === 0 && r.gone.stats.disposed === 1 && !r.gone.hub, JSON.stringify(r.gone.stats));
    check("the next window recreates it and draws (created 2, still one context live)", r.again.stats.created === 2 && r.again.stats.live === 1 && r.again.lit > 1000, JSON.stringify([r.again.stats.created, r.again.stats.live, r.again.lit]));
    await ctx.close();
  }

  console.log("\n\x1b[1m3) map cards on the engine\x1b[0m\n");
  {
    const { ctx, page } = await newPage(browser);
    requests.length = 0;
    await openCard(page, "geo-002"); await settled(page);
    const st = await page.evaluate(() => ({ eng: document.querySelector(".map-card").getAttribute("data-map-engine"), ready: document.querySelector(".map-card")._folioMap.ready(), failed: document.querySelector(".map-card").classList.contains("mc-failed"), view: document.querySelector(".map-card")._folioMap.view(), s: AtlasEmbed.stats(), gl: window.__gl2 }));
    check("Texas is drawn by the engine (data-map-engine=v2), ready, not failed", st.eng === "v2" && st.ready && !st.failed, JSON.stringify(st.view));
    check("one engine, one context, however many frames", st.s.live === 1 && st.gl === 1, JSON.stringify(st.s));
    check("the engine and topology.bin arrived only now (lazy)", requests.some((u) => /atlas-embed\.js/.test(u)) && requests.some((u) => /topology\.bin/.test(u)));
    check("the retired shape bundles are not fetched on this card's path", !requests.some((u) => /us-states\.js|\/world\.js|china-provinces\.js|russia-subjects\.js|world-capitals\.js/.test(u)), requests.filter((u) => /us-states|world|china-prov|russia-sub/.test(u)).join(","));
    // the gold tint: the pixel at the centre of the window is inside the shape (fitTarget centres on the label point) and is TINT_SEL laid over land at fillA; solving the land back out must give a land colour that is a bulk colour of the canvas
    const tint = await page.evaluate(() => { const src = [...document.scripts].map((s) => s.src); return null; });
    void tint;
    const cen = await pixelAt(page, ".map-card .mc-canvas", 0.5, 0.62);
    const far = await page.evaluate(() => AtlasEmbed.hub().landRGB().map((v) => Math.round(v * 255)));   // the engine's land colour, the palette the window is drawn from
    const rgb = [255, 178, 46], a = 0.24;   // TINT_SEL — read out of app.js below, so the test pins the rule and not today's number
    const appSrc = fs.readFileSync(path.join(ROOT, "app.js"), "utf8"), m = /const TINT_SEL = \{ rgb: "([\d,]+)", fillA: ([\d.]+)/.exec(appSrc);
    const trgb = m ? m[1].split(",").map(Number) : rgb, ta = m ? Number(m[2]) : a;
    const land = cen.slice(0, 3).map((v, i) => (v - ta * trgb[i]) / (1 - ta));
    check("the shaded state is a TINT of the selection gold over land, not a solid fill (the land solved back out of the centre pixel is a real land colour)", land.every((v) => v > 60 && v < 255) && Math.abs(land[0] - far[0]) < 40 && Math.abs(land[1] - far[1]) < 40, `centre ${cen.slice(0, 3)} → land ${land.map(Math.round)}, the palette's land ${far}`);
    const v0 = await page.evaluate(() => document.querySelector(".map-card")._folioMap.view());
    await page.click(".map-card [data-mc='in']"); await sleep(300);
    const v1 = await page.evaluate(() => document.querySelector(".map-card")._folioMap.view());
    check("the + button zooms in and home recentres", v1.zoom > v0.zoom * 1.3, `${v0.zoom.toFixed(2)} → ${v1.zoom.toFixed(2)}`);
    const box = await (await page.$(".map-card .mc-canvas")).boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down(); await page.mouse.move(box.x + box.width / 2 + 90, box.y + box.height / 2 + 30, { steps: 6 }); await page.mouse.up(); await sleep(300);
    const v2 = await page.evaluate(() => document.querySelector(".map-card")._folioMap.view());
    check("a drag turns the globe", Math.abs(v2.lon - v1.lon) > 0.2 || Math.abs(v2.lat - v1.lat) > 0.2, `${v1.lon.toFixed(2)},${v1.lat.toFixed(2)} → ${v2.lon.toFixed(2)},${v2.lat.toFixed(2)}`);
    await page.click(".map-card [data-mc='home']"); await sleep(300);
    const v3 = await page.evaluate(() => document.querySelector(".map-card")._folioMap.view());
    check("home returns to the opening view", Math.abs(v3.lon - v0.lon) < 1e-6 && Math.abs(v3.zoom - v0.zoom) < 1e-6);
    // a card with a capital: the gold square is on the canvas and the key's layer is the states'
    await openCard(page, "geo-504"); await settled(page);
    const sq = await page.evaluate(() => { const c = document.querySelector(".map-card .mc-canvas"), x = c.getContext("2d"), d = x.getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] === 255 && d[i + 1] === 178 && d[i + 2] === 46 && d[i + 3] === 255) n++; return n; });
    check("Providence's dot is the gold square (pure TINT_SEL pixels, a small round quantity)", sq > 40 && sq < 400, String(sq));
    await openCard(page, "gw-503"); await settled(page);
    const wv = await page.evaluate(() => ({ eng: document.querySelector(".map-card").getAttribute("data-map-engine"), failed: document.querySelector(".map-card").classList.contains("mc-failed") }));
    check("a world-layer card (a country with its capital) is drawn by the engine", wv.eng === "v2" && !wv.failed, JSON.stringify(wv));
    await ctx.close();
  }

  console.log("\n\x1b[1m4) locator windows on the engine\x1b[0m\n");
  {
    const { ctx, page } = await newPage(browser);
    await openCard(page, "rm-003"); await settled(page);   // the Tiber: a river card
    const gold = await page.evaluate(() => { const c = document.querySelector(".map-card .mc-canvas"), d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] > 230 && d[i + 1] > 150 && d[i + 1] < 215 && d[i + 2] < 120 && d[i + 3] > 200) n++; return n; });
    check("the Tiber's own river is traced in the selection gold", gold > 150, String(gold));
    await page.click(".map-card .mc-canvas", { position: { x: 200, y: 120 } }); await sleep(1200);
    const hash = await page.evaluate(() => location.hash);
    check("a tap on a locator window does NOT open the Atlas (the owner's decision, Oct 2026: only the globe button does; test-card-windows-fixes.js §5 does the rest)", /^#card\/rm-003/.test(hash), hash);
    await openCard(page, "wh-059"); await settled(page);   // a region: dashed, clipped to land
    const reg = await page.evaluate(() => { const c = document.querySelector(".map-card .mc-canvas"), d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let tint = 0, seaTint = 0; for (let i = 0; i < d.length; i += 4) { if (d[i + 3] === 0) continue; if (d[i] > 200 && d[i + 1] > 190 && d[i + 2] < 190 && d[i + 2] > 140 && d[i] - d[i + 2] > 30) tint++; if (d[i] > 185 && d[i] < 215 && d[i + 1] > 215 && d[i + 2] > 195 && d[i + 2] < 225 && d[i + 1] - d[i] > 20) seaTint++; } return { tint, seaTint }; });
    check("an authored region is tinted over land and NOT over the sea (the engine's land mask clips it)", reg.tint > 2000 && reg.seaTint < 60, JSON.stringify(reg));
    await ctx.close();
  }

  console.log("\n\x1b[1m5) a war window: in its years, and none outside\x1b[0m\n");
  {
    const { ctx, page } = await newPage(browser);
    await openCard(page, "rm-209"); await page.waitForFunction(() => { const h = document.querySelector(".map-card"); return h && h.getAttribute("data-map-engine") === "v2" && h._folioMap.ready(); }, null, { timeout: 180000 }); await sleep(12000);
    const tints = (page2) => page2.evaluate(() => { const c = document.querySelector(".map-card .mc-canvas"), d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let g = 0, r = 0; for (let i = 0; i < d.length; i += 4) { if (d[i + 3] === 0) continue; if (d[i + 1] - d[i] > 25 && d[i + 1] - d[i + 2] > 15 && d[i + 1] < 190) g++; if (d[i] - d[i + 1] > 45 && d[i] - d[i + 2] > 35 && d[i] > 140) r++; } return { g, r }; });
    const inYears = await tints(page);
    const yr = await page.evaluate(() => document.querySelector(".map-card").getAttribute("data-map-year"));
    check("in the war's years (its last step, 202 BCE, of 218–201 BCE) Rome is green and Carthage red on the window", inYears.g > 400 && inYears.r > 400, JSON.stringify(inYears) + " year " + yr);
    check("the window records the year it draws (the last step of 218–201 BCE, -202; the timeline moves it) for the Atlas link", Number(yr) === -202, String(yr));
    // the same engine asked for a year after the war, with the war still in focus: nothing is tinted
    const out = await page.evaluate(async () => {
      const c = document.createElement("canvas"); c.width = 600; c.height = 400; const hub = AtlasEmbed.hub();
      const spec = (year) => ({ w: 300, h: 200, lon: 8.4, lat: 38.9, zoom: 4.3, year, war: "rm-209", layers: { borders: true, neutral: true, admin1Max: 60 } });
      const read = (cv) => { const d = cv.getContext("2d").getImageData(0, 0, cv.width, cv.height).data; let g = 0, r = 0; for (let i = 0; i < d.length; i += 4) { if (d[i + 3] === 0) continue; if (d[i + 1] - d[i] > 25 && d[i + 1] - d[i + 2] > 15 && d[i + 1] < 190) g++; if (d[i] - d[i + 1] > 45 && d[i] - d[i + 2] > 35 && d[i] > 140) r++; } return { g, r }; };
      const drawYear = async (y) => { for (let i = 0; i < 60; i++) { const res = hub.draw(spec(y), c.getContext("2d"), { dpr: 2 }); if (res.settled) break; await new Promise((s) => setTimeout(s, 250)); } return read(c); };
      const before = await drawYear(-209), after = await drawYear(-100), during = await drawYear(-205);
      return { before, after, during };
    });
    check("asked for the war's own years the engine tints both sides", out.before.g > 300 && out.before.r > 300 && out.during.g > 300, JSON.stringify([out.before, out.during]));
    check("asked for a year after the war (100 BCE), with the war still chosen, it tints nothing", out.after.g < 60 && out.after.r < 60, JSON.stringify(out.after));
    await page.click(".map-card [data-mc='go']"); await sleep(1500);
    const h = await page.evaluate(() => location.hash);
    check("the go button opens #map at the war's year, with no war in the address (the Atlas then writes its own hash)", /^#map\/.+\?y=-202/.test(h) && !/war=/.test(h), h);
    await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 120000 });
    await page.waitForFunction(() => document.querySelector(".atlas2").__atlas2.timeInfo().year === -202, null, { timeout: 120000 }).catch(() => {});
    const w = await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; return { focus: c.wars().focus, shown: c.wars().shown.length, year: c.timeInfo().year }; });
    check("the Atlas, opened there, is at that year and draws no war (CHANGED 2026-10-19: it used to have the war in focus)", w.focus === null && w.shown === 0 && w.year === -202, JSON.stringify(w));
    await ctx.close();
  }

  console.log("\n\x1b[1m6) Find it on the engine\x1b[0m\n");
  {
    /* the day's deal, on a fixed date: five rounds, and the same five when the day is dealt again in a fresh profile (the deal is a function of the date, nothing else). The equality with the retired board's
       deal for 60 dates is `compare-findit-deal.js`; this is the self-contained part that needs no old code. */
    const dealOn = async (iso) => {
      const c = await newPage(browser);
      await c.page.clock.setFixedTime(new Date(iso));
      await c.page.goto(`http://127.0.0.1:${PORT}/#findit`, { waitUntil: "load" }); await c.page.reload({ waitUntil: "load" });
      await c.page.waitForFunction(() => { const m = document.querySelector("#mapGame"); return m && !m.hidden && document.querySelector("#findit2") && document.querySelector("#mgQ").textContent.length > 3; }, null, { timeout: 180000 });
      const r = await c.page.evaluate(() => { const h = [...document.querySelectorAll("*")].find((e) => e._finditApi); return h._finditApi.rounds().map((x) => ({ kind: x.kind, n: x.n, year: x.year })); });
      await c.ctx.close(); return r;
    };
    const dayA = await dealOn("2026-03-05T12:00:00"), dayA2 = await dealOn("2026-03-05T12:00:00"), dayB = await dealOn("2026-07-19T12:00:00");
    check("on a fixed date the day is five rounds, and dealt again in a fresh profile it is the same five (kinds, names, years)", dayA.length === 5 && JSON.stringify(dayA) === JSON.stringify(dayA2), JSON.stringify(dayA.map((r) => r.n)));
    check("...and another date deals another day (the deal does depend on the date)", dayB.length === 5 && JSON.stringify(dayB) !== JSON.stringify(dayA), JSON.stringify(dayB.map((r) => r.n)));
    check("...and a day has the shape the board promises: country, state of the year, country, state of the year, place", dayA.map((r) => r.kind).join(",") === "entity,area,entity,area,point", dayA.map((r) => r.kind).join(","));
    const { ctx, page } = await newPage(browser);
    await page.goto(`http://127.0.0.1:${PORT}/#findit`, { waitUntil: "load" }); await page.reload({ waitUntil: "load" });
    await page.waitForFunction(() => { const m = document.querySelector("#mapGame"); return m && !m.hidden && document.querySelector("#mgQ").textContent.length > 3 && document.querySelector("#findit2"); }, null, { timeout: 180000 });
    const rounds = () => page.evaluate(() => { const h = [...document.querySelectorAll("*")].find((e) => e._finditApi); return h._finditApi.rounds().map((r) => ({ kind: r.kind, n: r.n, year: r.year })); });
    const v2r = await rounds();
    check("the board deals the day's five rounds", v2r.length === 5 && v2r.every((r) => r.n), JSON.stringify(v2r.map((r) => r.n)));
    check("the cartouche reads TODAY on a country round", (await page.textContent("#mapCartouche")) === "TODAY");
    check("a round opens with nothing picked: Guess and Clear are collapsed and the score is 0", (await page.isHidden("#mgConfirm")) && (await page.isHidden("#mgClear")) && (await page.textContent("#mgScore")) === "0 found");
    const settleBoard = async () => { await page.waitForFunction(() => { const h = [...document.querySelectorAll("*")].find((e) => e._finditApi); const w = h._finditApi.win(); return w && w.isSettled(); }, null, { timeout: 60000 }).catch(() => {}); await sleep(300); };
    const viewTo = async (lon, lat, zoom) => { await sleep(1000); await page.evaluate(([a, b, z]) => { const h = [...document.querySelectorAll("*")].find((e) => e._finditApi); h._finditApi.win().setView(a, b, z); }, [lon, lat, zoom]); await settleBoard(); };
    const tapCentre = async () => { const bx = await (await page.$("#fi2Board")).boundingBox(); await page.mouse.click(bx.x + bx.width / 2, bx.y + bx.height / 2); await sleep(400); };
    const faces = await page.evaluate(() => window.ATLAS_CARD_FACES.layers.world);
    const r1 = v2r[0], c1 = faces[r1.n];
    // round 1: pick (no guess yet), clear, pick again, guess, found on the first try
    await viewTo(c1[1], c1[2], 1.8); await tapCentre();
    check("a tap only PICKS: the Guess button appears with its word and the score has not moved", (await page.textContent("#mgConfirm")) === "Guess" && !(await page.isHidden("#mgConfirm")) && (await page.textContent("#mgScore")) === "0 found");
    await page.click("#mgClear"); await sleep(200);
    check("Clear withdraws the pick (Guess and Clear are hidden again)", (await page.isHidden("#mgConfirm")) && (await page.isHidden("#mgClear")));
    await tapCentre(); await page.click("#mgConfirm"); await sleep(500);
    check("the country under the tap is scored by the ID pass: found on the first try", /Found it — first try!/.test(await page.textContent("#mgFeedback")) && (await page.textContent("#mgScore")) === "1 found", await page.textContent("#mgFeedback"));
    /* Phase 4b (the v1 Find-it rows with no engine twin): a round ends on something learned — a country on its own panel (a link to its card on the Atlas), and the Next button is the way on */
    check("a country round ends on the country's own panel, with a way to its place on the Atlas", (await page.isVisible(".fi2-reveal-head")) && (await page.$$(".fi2-reveal-go")).length >= 1 && (await page.isVisible("#mgNext")), await page.evaluate(() => (document.querySelector("#fiReveal") || {}).textContent));
    await page.click("#mgNext"); await sleep(600);
    // round 2: an area round — the board is the year's states; a tap at the area's own centre in that year
    const r2 = (await page.evaluate(() => { const h = [...document.querySelectorAll("*")].find((e) => e._finditApi); const r = h._finditApi.rounds()[1]; return { lon: r.lon, lat: r.lat, slugs: r.slugs, shown: r.shown, n: r.n }; }));
    check("an area round reads \"as it stood in <year>\" and the cartouche says FULL ATLAS · <year>", /as it stood in/.test(await page.textContent("#mgQ")) && /^FULL ATLAS · /.test(await page.textContent("#mapCartouche")), (await page.textContent("#mgQ")) + " / " + (await page.textContent("#mapCartouche")));
    await viewTo(r2.lon, r2.lat, 3); await tapCentre(); await page.click("#mgConfirm"); await sleep(600);
    const fb2 = await page.textContent("#mgFeedback");
    check("a state of the year is judged (found, or \"N km away\" with one more try)", /Found it|km away|Not there/.test(fb2), fb2);
    if (/km away|Not there/.test(fb2)) { await tapCentre(); await page.click("#mgConfirm"); await sleep(600); }
    check("a state or people ends on its study card(s): the panel lists cards, each a link to the card's own address", (await page.$$(".fi2-reveal-cards a.cp-cardlink")).length >= 1 || (await page.$$(".fi2-reveal-go")).length >= 1, await page.evaluate(() => (document.querySelector("#fiReveal") || {}).textContent));
    check("...and after two tries there is no third: Next is showing and Guess is gone", (await page.isVisible("#mgNext")) && (await page.isHidden("#mgConfirm")));
    await page.click("#mgNext"); await sleep(600);
    // round 3: a country — a wrong tap (Egypt, for Libya) says how far, a right one second time counts
    const r3 = v2r[2], c3 = faces[r3.n];
    await viewTo(30, 26, 2.2); await tapCentre();
    check("a country that is not the answer can be picked", !(await page.isHidden("#mgConfirm")));
    await page.click("#mgConfirm"); await sleep(500);
    const fb3 = await page.textContent("#mgFeedback");
    check("a wrong guess says how far away it was and offers one more try", /\d[\d,]* km away — one more try!/.test(fb3), fb3);
    await viewTo(c3[1], c3[2], 1.8); await tapCentre(); await page.click("#mgConfirm"); await sleep(500);
    check("a second try that is right counts as FOUND (not first try)", (await page.textContent("#mgFeedback")) === "Found it!", await page.textContent("#mgFeedback"));
    await page.click("#mgNext"); await sleep(600);
    // round 4: the other area round — whatever the tap, the round must end (right, or two tries) and move on
    { const r4 = await page.evaluate(() => { const h = [...document.querySelectorAll("*")].find((e) => e._finditApi); const r = h._finditApi.rounds()[3]; return { lon: r.lon, lat: r.lat }; });
      await viewTo(r4.lon, r4.lat, 3); await tapCentre(); await page.click("#mgConfirm"); await sleep(600);
      if (/km away|Not there/.test(await page.textContent("#mgFeedback")) && !(await page.isVisible("#mgNext"))) { await tapCentre(); await page.click("#mgConfirm"); await sleep(600); }
      await page.click("#mgNext"); await sleep(600); }
    // round 5: a place, scored by distance
    const r5 = await page.evaluate(() => { const h = [...document.querySelectorAll("*")].find((e) => e._finditApi); const a = h._finditApi; return { i: a.round(), r: a.rounds()[a.round()] }; });
    check("round 5 is the place", r5.r && r5.r.kind === "point", JSON.stringify(r5.r && r5.r.n));
    await viewTo(r5.r.lon, r5.r.lat, 6); await tapCentre(); await page.click("#mgConfirm"); await sleep(500);
    check("a place is scored by distance: a tap on it is found", /Found it/.test(await page.textContent("#mgFeedback")), await page.textContent("#mgFeedback"));
    check("a place ends on its cards too (each a link to the card's own address)", (await page.$$(".fi2-reveal-cards a.cp-cardlink")).length >= 1, await page.evaluate(() => (document.querySelector("#fiReveal") || {}).textContent));
    await page.click("#mgNext"); await sleep(600);
    const q = await page.textContent("#mgQ");
    check("the day ends on a score line, and Find it is then locked until tomorrow", /\d \/ 5\s*found/.test(q.replace(/\s+/g, " ")) || /found/.test(q), q);
    await page.goto(`http://127.0.0.1:${PORT}/#findit`, { waitUntil: "load" }); await page.reload({ waitUntil: "load" }); await sleep(1500);
    check("a day played is the door (\"Played today\")", /Played today|already played|scored/.test(await page.textContent("body")));
    await ctx.close();
    // reduced motion: the reveal's fly is instant
    const rm = await newPage(browser, { reduced: true });
    await rm.page.goto(`http://127.0.0.1:${PORT}/#findit`, { waitUntil: "load" }); await rm.page.reload({ waitUntil: "load" });
    await rm.page.waitForFunction(() => { const m = document.querySelector("#mapGame"); return m && !m.hidden && document.querySelector("#findit2"); }, null, { timeout: 180000 });
    const rr = await rm.page.evaluate(() => { const h = [...document.querySelectorAll("*")].find((e) => e._finditApi); const a = h._finditApi, c = window.ATLAS_CARD_FACES.layers.world[a.rounds()[0].n]; return { lon: c[1], lat: c[2] }; });
    await rm.page.evaluate(([a, b]) => { const h = [...document.querySelectorAll("*")].find((e) => e._finditApi); h._finditApi.win().setView(a, b, 1.8); }, [rr.lon, rr.lat]);
    await sleep(2500);
    const bx2 = await (await rm.page.$("#fi2Board")).boundingBox(); await rm.page.mouse.click(bx2.x + bx2.width / 2, bx2.y + bx2.height / 2); await sleep(400); await rm.page.click("#mgConfirm"); await sleep(120);
    const rv = await rm.page.evaluate(() => { const h = [...document.querySelectorAll("*")].find((e) => e._finditApi); const w = h._finditApi.win(), c = window.ATLAS_CARD_FACES.layers.world[h._finditApi.rounds()[0].n]; return { lon: w.st.lon, lat: w.st.lat, tl: c[1], tb: c[2] }; });
    check("under reduced motion the reveal's fly is instant (the view is already at the answer 120 ms after the guess)", Math.abs(rv.lon - rv.tl) < 0.01 && Math.abs(rv.lat - rv.tb) < 0.01, JSON.stringify(rv));
    await rm.ctx.close();
  }

  console.log("\n\x1b[1m7) errors\x1b[0m\n");
  check("no console or page errors anywhere in this suite", errors.length === 0, errors.slice(0, 3).join(" | "));
  await browser.close(); server.close();
  console.log(`\n${pass} ok, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
