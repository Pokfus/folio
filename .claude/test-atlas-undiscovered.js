/* test-atlas-undiscovered.js — THE PERSONAL ATLAS DRAWS A STATE, A COUNTRY AND ITS BORDER ONLY WHEN A STUDIED CARD DISCOVERED IT, IN EVERY YEAR, 2026 INCLUDED (2026-10-18, the owner's seventh look).

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-undiscovered.js
     FOLIO_SHOTS=/dir   … also writes a 390 × 844 screenshot per view

   THE OWNER'S REPORT (a real phone): (1) "state borders for states that were not studied in any card: Chinese state borders in 859 CE"; (2) "on the 2026 map in the Personal Atlas I still see the borders …
   of every modern-day capital and country, not only the ones I have studied"; (3) "for a state that has been studied, e.g. the Roman Republic, clicking anywhere in its land should select it and
   open its popup, not only clicking the polity name".
   THE DECISIONS: (a) in Personal a state's border line, fill and name are drawn only if a studied card discovered it (the study.js definition); a border shared by a discovered and an undiscovered state is
   drawn as the discovered state's edge only; the undiscovered ground is the darker EMPTY land. (b) The same holds at 2026: modern countries are states like any other. (c) A tap on any land inside a
   discovered state, on no mark and no name, selects it and opens its popup; inside an undiscovered one it does nothing.

   WHAT IT PROVES (phone, WebGL2, light theme — the pixels are read off the page's own canvas):
     1  859 CE, East Asia, a reader with no card at all: no history face, no history border segment, and EVERY land pixel in the frame is the darker empty land or a river (not one border pixel);
        a reader of Khmer, Chola and Abbasid cards (states alive in 859, none Chinese): the same over China; a reader of the Tang card: the Tang face is drawn (plain land), the land outside it is the empty
        land, and every border-coloured pixel lies within 4 px of the Tang's plain land (its edge, never a line through the dark)
     2  2026, the world, Europe and East Asia for a reader of three cards (India, China, California): a pixel is plain land exactly where a discovered country (or California) lies, every other land
        pixel is the darker empty land, no border-coloured pixel lies away from a discovered country's edge, and every name placed is the reader's; the reader with no card sees empty land, no border at all
        (the plain Map and the Full Atlas at the same views draw the borders and the plain land: the check is not vacuous)
     3  a tap on five interior points of the Roman Republic (200 BCE), a Greek polity (Macedon), a Chinese dynasty (Han) and a modern country (India, 2026) selects it and opens its popup, in the Personal Atlas
        and in the plain Map; a tap on an interior point of an undiscovered state (Carthage; China for the India reader) does nothing in Personal
     4  no console error
   Re-run after touching `aliveShown`, `refreshPersonalPresent`, atlas-gl.js's `setPersonalPresent` / the keep pass / the arc mask, the worker's `arc-faces`, or `stackAt`. */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const SHOTS = process.env.FOLIO_SHOTS || "";
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream" };
const PORT = 5642;
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const seed = (ids) => `try { if (!localStorage.getItem("folio_v1_seeded")) { localStorage.setItem("folio_v1", JSON.stringify({ cards: Object.fromEntries(${JSON.stringify(ids)}.map((id) => [id, { due: Date.now() + 9e8, ivl: 9, ease: 2.5, status: "review", reps: 2, first: "2026-08-01" }])), settings: { newPerDay: 5 } })); localStorage.setItem("folio_v1_seeded", "1"); } } catch (e) {}`;
async function open(browser, ids) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  await ctx.addInitScript(seed(ids));
  await ctx.addInitScript(`localStorage.setItem("folio_tour_v1","1");localStorage.setItem("folio_atlas_tour_v1","1");localStorage.setItem("folio.atlas2.intro","1");`);
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  await page.goto(`http://127.0.0.1:${PORT}/#map`, { waitUntil: "load" });
  await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 120000 });
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.waterSettled() && c.labelsReady() && c.study.ready(); }, null, { timeout: 120000 });
  await A(page, (c) => c.setLayers({ rivers: true, lakes: true, countries: true, places: true, physical: true, cities: true, provinces: true, relief: false }));
  return { ctx, page, errors };
}
const A = (page, fn, arg) => page.evaluate(`(() => { const c = document.querySelector(".atlas2").__atlas2; return (${fn.toString()})(c, ${JSON.stringify(arg === undefined ? null : arg)}); })()`);
async function settle(page) {
  await page.waitForFunction(() => document.querySelector(".atlas2").__atlas2.tilesSettled(), null, { timeout: 120000 });
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.year() >= 2000 || !c.historyOK || c.historyOK(); }, null, { timeout: 120000 });
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.layoutNow()); await sleep(1400);
}
async function go(page, y, lon, lat, k) { await A(page, (c, v) => { c.setYear(v[0]); c.setView(v[1], v[2], v[3]); }, [y, lon, lat, k]); await settle(page); }
async function mode(page, m) { await A(page, (c, m) => c.study.setMode(m), m); await sleep(500); await settle(page); }
const shot = async (page, name) => { if (!SHOTS) return; fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, name + ".png") }); };
const box = (page) => page.$eval(".atlas2", (e) => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top }; });

/* ---------- reading the frame ---------- */
/* ONE render and one readPixels of the whole GL canvas (`pixelAt` renders on every call). The theme's border ink is nearly the empty land's own grey, so the borders are PAINTED for the read: the renderer's
   palette gets a red border and a green admin-1 line (`setPalette`, `setHistoryBorderColor`), then every grid pixel is one of: WATER (blue-ish: sea, lake, river), PLAIN land (a discovered state's: the palette's
   land), EMPTY land (the plain land at HIST_DIM = 0.5), a BORDER (red or green: a country's, an admin-1 line or a past year's), or other (a coast, antialiasing, space). A border pixel is excused within 6 px
   of plain land (a discovered state's edge, 6 px for the line's width and the antialiasing); any other is a border drawn through the empty land or the sea (`borderAway`). The names and marks are on the label canvas, not here. */
const scan = (page) => A(page, (c) => {
  const [W, H] = c.frame(), ch = c.chromeRects(), pal = c.palette(), land = pal.land.map((v) => v * 255), dim = land.map((v) => v * 0.5), g = c.renderer.gl;
  c.renderer.setPalette({ border: "#ff0000", admin1: "#00ff00" }); c.renderer.setHistoryBorderColor("#ff0000");
  c.renderer.render(c.view);
  const w = g.drawingBufferWidth, h = g.drawingBufferHeight, buf = new Uint8Array(w * h * 4); g.readPixels(0, 0, w, h, g.RGBA, g.UNSIGNED_BYTE, buf);
  const d = w / W, px = (x, y) => { const i = ((h - 1 - Math.round(y * d)) * w + Math.round(x * d)) * 4; return [buf[i], buf[i + 1], buf[i + 2]]; };
  const inChrome = (x, y) => ch.some((r) => x >= r[0] - 6 && x <= r[2] + 6 && y >= r[1] - 6 && y <= r[3] + 6);
  const close = (p, q, t) => Math.abs(p[0] - q[0]) <= t && Math.abs(p[1] - q[1]) <= t && Math.abs(p[2] - q[2]) <= t;
  const cls = (p) => p[2] - p[0] > 22 ? "water" : p[0] - p[1] > 50 || p[1] - p[0] > 50 ? "border" : close(p, land, 9) ? "plain" : close(p, dim, 9) ? "empty" : "other";
  const STEP = 3, grid = new Map();
  const at = (x, y) => { const k = x + "," + y; let v = grid.get(k); if (v === undefined) { v = cls(px(x, y)); grid.set(k, v); } return v; };
  const out = { plain: 0, empty: 0, water: 0, border: 0, other: 0, borderAway: [], n: 0, plainPts: [], emptyPts: [] };
  for (let y = 9; y < H - 8; y += STEP) for (let x = 6; x < W - 6; x += STEP) {
    if (inChrome(x, y)) continue;
    const k = at(x, y); out.n++; out[k]++;
    if (k === "plain" && x % 18 === 0 && y % 18 === 0) out.plainPts.push([x, y]);
    if (k === "empty" && x % 18 === 0 && y % 18 === 0) out.emptyPts.push([x, y]);
    if (k !== "border") continue;
    let nearPlain = false;
    for (let dy = -6; dy <= 6 && !nearPlain; dy += STEP) for (let dx = -6; dx <= 6; dx += STEP) if (at(x + dx, y + dy) === "plain") { nearPlain = true; break; }
    if (!nearPlain) out.borderAway.push([x, y]);
  }
  out.borderAwayN = out.borderAway.length; out.borderAway = out.borderAway.slice(0, 6);
  return out;
});
const counts = (s) => `${s.plain} plain, ${s.empty} empty, ${s.water} water, ${s.border} border pixels (${s.borderAwayN} away from any plain land)`;
const awayN = (s) => s.borderAwayN;
const stats = (page) => A(page, (c) => { const s = c.statsNow(); return { faces: s.historyFaces, segs: s.historySegments }; });

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch(LAUNCH);
  const allErrors = [];

  /* ------------------------------------------------------------------ 1  859 CE */
  console.log("\n\x1b[1m1) 859 CE: a reader with no Tang card sees no Chinese state border at all; a reader of the Tang card sees only the Tang's edge\x1b[0m\n");
  {
    const V = [108, 33, 5];
    for (const [who, ids, wantFaces] of [["no card at all", [], 0], ["Khmer, Chola and Abbasid cards (none Chinese)", ["wh-556", "wh-547", "wh-469"], null], ["the Tang card (wh-523)", ["wh-523"], 1]]) {
      const { ctx, page, errors } = await open(browser, ids);
      await mode(page, "personal"); await go(page, 859, V[0], V[1], V[2]);
      const st = await stats(page), s = await scan(page);
      await shot(page, "859-" + who.split(" ")[0].toLowerCase());
      if (wantFaces === 0) check(`${who}: no history face and no history border segment is drawn (${st.faces} faces, ${st.segs} segments)`, st.faces === 0 && st.segs === 0);
      if (wantFaces === 1) check(`${who}: the Tang's face is drawn, and only it (${st.faces} face, ${st.segs} border segments)`, st.faces === 1 && st.segs > 0);
      if (wantFaces === 0 || wantFaces === null) check(`${who}: every land pixel is the empty land — no border pixel at all (${counts(s)})`, s.plain === 0 && s.border === 0, counts(s));
      else check(`${who}: plain land inside the Tang, the empty land outside it, and no border-coloured pixel away from the Tang's edge (${counts(s)})`, s.plain > 200 && s.empty > 200 && awayN(s) === 0, counts(s) + " " + JSON.stringify(s.borderAway.slice(0, 4)));
      if (wantFaces === 1) {
        const ids2 = await A(page, (c, pts) => pts.slice(0, 12).map((p) => c.stackAt(p[0], p[1])), s.plainPts);
        check("the plain land is the Tang's alone: every sampled plain pixel lies in pol:tang", ids2.length > 0 && ids2.every((l) => l.includes("pol:tang")), JSON.stringify(ids2.slice(0, 3)));
      }
      allErrors.push(...errors); await ctx.close();
    }
  }

  console.log("\n" + pass + " ok, " + fail + " failed");
  check("no console error", allErrors.length === 0, allErrors.slice(0, 3).join(" | "));
  await browser.close(); server.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); server.close(); process.exit(1); });
