/* test-ww2-slice.js — THE SECOND WORLD WAR WINDOW READS ITS OWN SLICE, NOT THE WHOLE HISTORY (2026-10-19; build-ww2-slice.js).

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-ww2-slice.js

   The war windows' timeline made ww2-001 (the only war with a front line: 93 plate dates with months) read atlas/data/history.bin (9.1 MB), because the war slice (history-wars.bin) has no front;
   on file:// it fell back to year steps with no front at all. The window reads atlas/data/history-ww2.bin (and, on file://, its twin) instead.

   WHAT IT PROVES
     1  (Node) the slice exists, is smaller than history.bin, says it is the ww2 slice, carries the header's plates whole and every plate date (93, each with a month); its twin decodes to it
     2  (http) opening ww2-001 requests history-ww2.bin once and never history.bin or history-wars.bin; no file under atlas/data/ that the window loads is larger than the slice; the rail has the
        93 plate dates with months and opens on the last; the front line is drawn (three or four sets standing); the bytes fetched from atlas/data/ are reported against the 9.1 MB it used to be
     3  (file://) the same window runs from history-ww2.bin.js: the 93 plate dates, a month under the pin, the front drawn — it used to fall back to year steps with no front
     4  a war card opened after it (rm-209) gets a hub that began on the war slice (the ww2 hub is not reused for a window it cannot answer) and draws its two sides
   Re-run after touching the ww2 slice's build, `ensureHistory` / `startHistory` (atlas.js), `ensure` or `yearAndWar` (atlas-embed.js) or the war window's history choice (atlas-windows.js). */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");
const F = require("./atlas-build/lib/format.js");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream" };
const PORT = 5673;
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  — " + extra : "")); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [];
const SLICE = path.join(ROOT, "atlas/data/history-ww2.bin"), FULL = path.join(ROOT, "atlas/data/history.bin");
const MB = (n) => (n / 1e6).toFixed(2) + " MB";

async function newPage(browser, o) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await ctx.addInitScript(`localStorage.setItem("folio_tour_v1","1");localStorage.setItem("folio_atlas_tour_v1","1");`);
  const page = await ctx.newPage(), seen = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  page.on("response", async (r) => { const u = r.url(); if (/\/atlas\/data\//.test(u)) { let n = Number(r.headers()["content-length"] || 0); seen.push({ u: u.replace(/^.*\/atlas\/data\//, ""), n }); } });
  page.on("request", (r) => { if (/^file:/.test(r.url())) seen.push({ u: r.url().replace(/^.*\/atlas\/data\//, "").replace(/^.*\//, ""), n: 0, file: true }); });
  return { ctx, page, seen };
}
async function open(page, url, seen) {
  await page.goto(url, { waitUntil: "load" });
  if (!/^file:/.test(url)) { await page.reload({ waitUntil: "load" }); seen.length = 0; await page.reload({ waitUntil: "load" }); }   // (a hash-only goto does not reload; the second reload counts the bytes of ONE cold load)
  await page.waitForSelector(".map-card.map-war", { timeout: 60000 });
  await page.waitForFunction(() => { const h = document.querySelector(".map-card"); return h && h._folioMap && h._folioMap.ready() && !h.classList.contains("mc-loading"); }, null, { timeout: 280000 }).catch(() => {});
  await page.waitForFunction(() => { const h = document.querySelector(".map-card"); return h && h._folioMap && h._folioMap.settled(); }, null, { timeout: 120000 }).catch(() => {});
  await sleep(1500);
}
const tl = (page) => page.evaluate(() => { const t = document.querySelector(".war-tl"), h = document.querySelector(".map-card"); if (!t || !h._folioTimeline) return null; return { n: h._folioTimeline.steps.length, idx: h._folioTimeline.index(), label: t.getAttribute("data-label"), date: t.getAttribute("data-date"), front: h._folioTimeline.steps.filter((s) => s.front).length, months: h._folioTimeline.steps.filter((s) => s.month).length }; });
const fronts = (page) => page.evaluate(() => { const f = AtlasEmbed.hub().ctl.fronts(); return { on: f.on, date: f.date, drawn: f.drawn.length, kind: AtlasEmbed.hub().historyKind() }; });

(async () => {
  console.log("\n\x1b[1m1) the slice (Node)\x1b[0m\n");
  const have = fs.existsSync(SLICE);
  check("atlas/data/history-ww2.bin and its twin exist", have && fs.existsSync(SLICE + ".js"));
  let plateDates = 0;
  if (have) {
    const sliceBytes = fs.statSync(SLICE).size, fullBytes = fs.statSync(FULL).size;
    check("the slice is smaller than history.bin", sliceBytes < fullBytes, `${MB(sliceBytes)} of ${MB(fullBytes)}`);
    const A = F.read(new Uint8Array(fs.readFileSync(SLICE)), { headerOnly: true }).header, B = F.read(new Uint8Array(fs.readFileSync(FULL)), { headerOnly: true }).header;
    check("its header says it is the ww2 slice of this history.bin", A.history && A.history.slice === "ww2" && A.history.cards.join() === "ww2-001");
    check("it carries the plates whole (the same block as history.bin's)", JSON.stringify(A.fronts) === JSON.stringify(B.fronts), `${A.fronts.plates.length} plates`);
    const dates = new Set(A.fronts.plates.map((p) => p.date)); plateDates = dates.size;
    check("every plate date is there, each with a month: 93 dates", dates.size === 93 && [...dates].every((d) => /^\d{4}-(0[1-9]|1[0-2])-\d{2}$/.test(d)), `${dates.size}`);
    const tw = fs.readFileSync(SLICE + ".js", "utf8");
    check("the twin is the gzip of the slice's bytes and declares the slice's size", /enc: "gzip"/.test(tw) && tw.includes("bytes: " + sliceBytes));
  }

  const browser = await chromium.launch(LAUNCH);
  await new Promise((r) => server.listen(PORT, r));

  console.log("\n\x1b[1m2) over http: the window reads history-ww2.bin, never history.bin\x1b[0m\n");
  {
    const { ctx, page, seen } = await newPage(browser);
    await open(page, `http://127.0.0.1:${PORT}/#card/ww2-001`, seen);
    const sliceBytes = have ? fs.statSync(SLICE).size : 0, fullBytes = fs.statSync(FULL).size;
    const names = seen.map((s) => s.u);
    check("history-ww2.bin was requested once", names.filter((u) => u === "history-ww2.bin").length === 1, names.filter((u) => /history/.test(u)).join(", "));
    check("history.bin and history-wars.bin were never requested", !names.some((u) => u === "history.bin" || u === "history-wars.bin"), names.filter((u) => /history/.test(u)).join(", "));
    const biggest = seen.reduce((a, s) => (s.n > a.n ? s : a), { n: 0, u: "" }), total = seen.reduce((a, s) => a + s.n, 0);
    check("no file the window loads from atlas/data/ is larger than the slice", have && biggest.n <= sliceBytes, `largest ${biggest.u} ${MB(biggest.n)}, the slice ${MB(sliceBytes)}`);
    console.log("  \x1b[2m  fetched from atlas/data/: " + seen.slice().sort((a, b) => b.n - a.n).slice(0, 6).map((s) => s.u + " " + MB(s.n)).join(", ") + "\x1b[0m");
    check(`opening the card fetched ${MB(total)} from atlas/data/ (it was ${MB(total - sliceBytes + fullBytes)} with the whole history)`, have && total > 0 && total < total - sliceBytes + fullBytes - 4e6, `saved ${MB(fullBytes - sliceBytes)} on the history file`);
    const t = await tl(page), f = await fronts(page);
    check("the rail has the front's 93 plate dates (each with a month), opening at the last", !!t && t.n === 93 && t.front === 93 && t.months === 93 && t.idx === 92 && /^[A-Z][a-z]{2} \d{4}$/.test(t.label), JSON.stringify(t));
    check("the hub's history is the ww2 slice and the front line is drawn (three or four sets standing)", f.kind === "ww2" && f.on && f.drawn >= 3, JSON.stringify(f));
    // 4) another war after it
    await page.evaluate(() => { location.hash = "#card/rm-209"; });
    await page.waitForFunction(() => { const h = document.querySelector(".map-card"); return h && h.getAttribute("data-map-card") === "rm-209" && h._folioMap && h._folioMap.ready(); }, null, { timeout: 280000 }).catch(() => {});
    await page.waitForFunction(() => { const h = document.querySelector(".map-card"); return h && h.getAttribute("data-map-card") === "rm-209" && h._folioMap && h._folioMap.settled() && h._folioMap.names().length >= 2; }, null, { timeout: 120000 }).catch(() => {});
    const g = await page.evaluate(() => { const h = document.querySelector(".map-card"); return { card: h.getAttribute("data-map-card"), kind: AtlasEmbed.hub() && AtlasEmbed.hub().historyKind(), names: h._folioMap ? h._folioMap.names() : [] }; });
    console.log("\n\x1b[1m4) a war card opened after it\x1b[0m\n");
    check("rm-209 gets a hub on the war slice (not the ww2 hub) and names Rome and Carthage", g.card === "rm-209" && g.kind === "wars" && g.names.join() === "Rome,Carthage", JSON.stringify(g));
    await ctx.close();
  }

  console.log("\n\x1b[1m3) on file://: the same window from history-ww2.bin.js\x1b[0m\n");
  {
    const { ctx, page, seen } = await newPage(browser);
    await open(page, "file://" + path.join(ROOT, "index.html") + "#card/ww2-001", seen);
    const names = seen.map((s) => s.u);
    check("history-ww2.bin.js was read, history.bin(.js) and history-wars.bin(.js) were not", names.some((u) => /history-ww2\.bin\.js$/.test(u)) && !names.some((u) => /^history(-wars)?\.bin(\.js)?$/.test(u)), names.filter((u) => /history/.test(u)).join(", "));
    const t = await tl(page), f = await fronts(page);
    check("the rail has the 93 plate dates with months (it was year steps before)", !!t && t.n === 93 && t.front === 93 && t.months === 93 && /^[A-Z][a-z]{2} \d{4}$/.test(t.label), JSON.stringify(t));
    check("the front line is drawn on file:// (three or four sets standing)", f.kind === "ww2" && f.on && f.drawn >= 3, JSON.stringify(f));
    await ctx.close();
  }

  check("no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  await browser.close(); server.close();
  void plateDates;
  console.log(`\n${pass} ok, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
