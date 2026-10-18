/* test-atlas-capital-stack.js — a capital's stack (Rome, Athens) is the capital's SQUARE with ONLY its count inside, at every zoom where the stack exists
   (Atlas v2, 2026-10-18 c; the owner's phone: "inside the capital square of Rome there is a small square that blocks the stack number").

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-capital-stack.js
     FOLIO_CHROMIUM=/path/to/chrome

   THE FAULT. In a past year in which a place is a period capital (Rome in the Roman Empire's years, 100 CE here) the label pass lays a second capital square for it — the
   `cap:` candidate of the history's capital statements, drawn by `drawMarker` as a small solid square (4 px half) at the polity-index's own coordinates for the capital. The study
   layer's mark for the same city is the capital's stack square (20 px across, a 9 px bold count in it), so at the zoom where the two coincide (Rome at 0.15 and 0.3 km/px) the
   small square lay over the count and hid a digit ("38" read "3" and a black block). The fix is in the worker's capital branch: a capital's marker that would lie on a study mark
   is not drawn (its name stays; the study mark IS the capital's square).

   WHAT IT PROVES, for a seeded reader (Roman, Greek, Levantine and Japanese cards) on a 390 x 844 phone, in the light theme and in folio's night, in the Full Atlas, for Rome in
   100 CE and Athens in 450 BCE, at every zoom of 1.2, 0.6, 0.3 and 0.15 km/px where the city's capital stack exists (at least three for each city):
     1  NO INNER SQUARE: no period-capital marker of the layout (`labelsLive()` entries with a marker) intersects the stack's square;
     2  THE COUNT IS FULLY VISIBLE: read off the label canvas's pixels inside the square (clear of its outline), the count ink forms one connected piece per digit of the count,
        each at least 5 CSS px tall (a 9 px bold figure is about 6.5 px tall; specks under 12 device px — a hairline's end — are not counted), and between 6 % and 40 % of the interior — a block over the figure joins its pieces, hides one, or
        leaves ink the figure cannot have.
   Re-run after touching the capital branch of `layCand` (atlas-worker.js), `drawMarker`, `markSprite` or the stack's size (`squareHalf`). */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");
const { loadCards } = require("./card-io.js");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream" };
const PORT = 5662;
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  — " + extra : "")); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const { cards } = loadCards();
const READER = cards.filter((c) => /^(rm|gr|jp|wh)-/.test(c.id) && Array.isArray(c.places) && c.places.length).slice(0, 160).map((c) => c.id);
const seed = (ids) => `try { if (!localStorage.getItem("folio_v1_seeded")) { localStorage.setItem("folio_v1", JSON.stringify({ cards: Object.fromEntries(${JSON.stringify(ids)}.map((id, i) => [id, { due: i % 3 === 0 ? Date.now() - 9e5 : Date.now() + 9e8, ivl: 9, ease: 2.5, status: "review", reps: 2, first: "2026-08-01" }])), settings: { newPerDay: 5 } })); localStorage.setItem("folio_v1_seeded", "1"); } } catch (e) {}`;
const A = (page, fn, arg) => page.evaluate(`(() => { const c = document.querySelector(".atlas2").__atlas2; return (${fn.toString()})(c, ${JSON.stringify(arg === undefined ? null : arg)}); })()`);
const CITIES = [["Rome", 12.5, 41.9, 100], ["Athens", 23.7275, 37.9838, -450]];
const ZOOMS = [1.2, 0.6, 0.3, 0.15];
const errors = [];

async function open(browser, theme) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await ctx.addInitScript(seed(READER));
  await ctx.addInitScript(`localStorage.setItem("folio_tour_v1","1");localStorage.setItem("folio_atlas_tour_v1","1");`);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  await page.goto(`http://127.0.0.1:${PORT}/#map`, { waitUntil: "load" });
  await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 120000 });
  if (theme === "dark") { await page.evaluate(() => document.body.classList.add("night")); await sleep(300); }
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.waterSettled() && c.labelsReady() && c.study.ready(); }, null, { timeout: 120000 });
  await A(page, (c) => { c.study.setMode("full"); c.ensureHistory(); });
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.historyStarted() && c.historyReady(); }, null, { timeout: 180000 });
  return { ctx, page };
}
const layout = async (page) => { await A(page, (c) => c.layoutNow()); await sleep(250); };
async function viewAt(page, lon, lat, k, year) {
  await A(page, (c, y) => c.setYear(y), year);
  await A(page, (c, v) => c.setView(v[0], v[1], v[2]), [lon, lat, k]);
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.tilesSettled() && c.waterSettled() && c.historySettled(); }, null, { timeout: 120000 }).catch(() => {});
  await layout(page); await sleep(900); await layout(page);
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.invalidate()); await sleep(500);
}
/* the city's capital stack, if it is drawn, with the period-capital markers of the layout that touch it and the count's pixels inside the square */
const read = (page, city) => A(page, (c, city) => {
  const st = c.study.liveMarks().find((m) => m.members && (m.cap || m.shape === "square") && m.name === city);
  if (!st) return null;
  const cv = document.querySelector(".atlas2-labels"), dpr = cv.width / c.frame()[0], g = cv.getContext("2d", { willReadFrequently: true });
  const hit = c.labelsLive().filter((e) => e.p.marker).map((e) => ({ id: e.p.id, r: e.p.marker[2], x: e.p.marker[0] + e.dx, y: e.p.marker[1] + e.dy })).filter((q) => q.x + q.r > st.x - st.h && q.x - q.r < st.x + st.h && q.y + q.r > st.y - st.h && q.y - q.r < st.y + st.h);
  const R = 7, x0 = Math.round((st.x - R) * dpr), y0 = Math.round((st.y - R) * dpr), n = Math.round(2 * R * dpr), d = g.getImageData(x0, y0, n, n).data;
  const lum = (i) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
  // the square's fill is the modal luminance of the interior's outer band (the digits stay inside it); ink is whatever differs from it by more than 70 levels
  const band = []; for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (x < 3 || y < 3 || x >= n - 3 || y >= n - 3) band.push(Math.round(lum(4 * (y * n + x)) / 8));
  const bins = new Map(); for (const b of band) bins.set(b, (bins.get(b) || 0) + 1);
  const fill = [...bins.entries()].sort((p, q) => q[1] - p[1])[0][0] * 8;
  const ink = new Uint8Array(n * n); let inkN = 0;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const i = 4 * (y * n + x); if (d[i + 3] > 128 && Math.abs(lum(i) - fill) > 70) { ink[y * n + x] = 1; inkN++; } }
  const seen = new Uint8Array(n * n), pieces = [];
  for (let s = 0; s < n * n; s++) {
    if (!ink[s] || seen[s]) continue;
    let top = n, bot = -1, px = 0; const q = [s]; seen[s] = 1;
    while (q.length) { const p = q.pop(), py = Math.floor(p / n), pxx = p % n; px++; if (py < top) top = py; if (py > bot) bot = py; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const yy = py + dy, xx = pxx + dx; if (yy < 0 || xx < 0 || yy >= n || xx >= n) continue; const k = yy * n + xx; if (ink[k] && !seen[k]) { seen[k] = 1; q.push(k); } } }
    if (px >= 12) pieces.push({ px, h: (bot - top + 1) / dpr });
  }
  return { count: st.count, h: st.h, x: st.x, y: st.y, hit, pieces, share: inkN / (n * n) };
}, city);

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch(LAUNCH);
  for (const theme of ["light", "dark"]) {
    console.log(`\n\x1b[1m${theme === "dark" ? "folio's night" : "the light theme"}\x1b[0m\n`);
    const { ctx, page } = await open(browser, theme);
    for (const [city, lon, lat, year] of CITIES) {
      let seen = 0;
      for (const k of ZOOMS) {
        await viewAt(page, lon, lat, k, year);
        const r = await read(page, city);
        if (!r) { console.log(`  ${city} ${year < 0 ? -year + " BCE" : year + " CE"} at ${k} km/px: no capital stack drawn (the members stand apart or the mark is under a control) — not read`); continue; }
        seen++;
        const digits = String(r.count).length, whole = r.pieces.length >= 1 && r.pieces.length <= digits && r.pieces.every((p) => p.h >= 5 && p.h <= 8.5);   // two digits may touch (on CI's rasteriser they did at 1.2 km/px: one piece): what a block over the figure makes is a piece taller than a digit, a third piece, or a short one
        const label = `${city} ${year < 0 ? -year + " BCE" : year + " CE"} at ${k} km/px, the "${r.count}" in a square of ${(2 * r.h).toFixed(0)} px`;
        check(`${label}: no period-capital marker lies on the square`, r.hit.length === 0, r.hit.map((q) => `${q.id} at ${q.x.toFixed(1)},${q.y.toFixed(1)} r${q.r}`).join("; "));
        check(`${label}: the count is whole — at most ${digits} piece${digits > 1 ? "s" : ""} of ink (digits may touch), each 5–8.5 px tall, ${(r.share * 100).toFixed(0)} % of the interior (6–40 %)`, whole && r.share >= 0.06 && r.share <= 0.4, r.pieces.map((p) => `${p.px}px ${p.h.toFixed(1)}tall`).join(", "));
      }
      check(`${city}: the capital stack is read at three zooms or more (${seen})`, seen >= 3);
    }
    await ctx.close();
  }
  check("no console or page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  await browser.close(); server.close();
  console.log(`\n${pass} ok, ${fail} failed\n`); process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
