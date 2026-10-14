/* compare-findit-deal.js — does Find it deal the same five rounds as it did? (Atlas v2 Phase 5, Task 6). A tool, not a gate: the pool is the corpus, so the day's rounds move whenever a
   card batch adds a locator, a war or a map; the record is only comparable to the tree it was taken on.

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/compare-findit-deal.js --record out.json [--days=60] [--from=2026-10-14]
     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/compare-findit-deal.js --check out.json

   For each of N consecutive dates the page's clock is fixed to that day, the Find it page is opened, and the rounds the board dealt are read off its test hook (`_finditApi.rounds()`): kind, name, year, the
   shown year, the point, the tolerance, the card ids, the polity slugs and a hash of the rings (the geometry an area round is scored on). `--check` re-reads the same dates and lists every difference. Phase 5
   took the record on the last head that still carried v1's data (world.js, polities.js, the capitals tables) and checked it on the head that reads the frozen tables instead: docs/atlas-v2-phase5-plan.md §4.1. */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path"), crypto = require("crypto");
const { chromium } = require("playwright");
const ROOT = path.resolve(__dirname, "..");
const ARGS = process.argv.slice(2), FLAG = (n, d) => { const a = ARGS.find((x) => x.startsWith("--" + n + "=")); return a ? a.split("=")[1] : d; };
const RECORD = ARGS.includes("--record") ? ARGS[ARGS.indexOf("--record") + 1] : null, CHECK = ARGS.includes("--check") ? ARGS[ARGS.indexOf("--check") + 1] : null;
if (!RECORD && !CHECK) { console.error("usage: compare-findit-deal.js --record out.json | --check out.json [--days=60] [--from=2026-10-14]"); process.exit(2); }
const DAYS = Number(FLAG("days", "60")), FROM = FLAG("from", "2026-10-14");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream", ".woff2": "font/woff2" };
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(req.url.split("?")[0]) === "/" ? "/index.html" : decodeURIComponent(req.url.split("?")[0]);
  fs.readFile(path.join(ROOT, p), (err, data) => { if (err) { res.writeHead(404); res.end(); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(p)] || "application/octet-stream" }); res.end(data); });
});
const sha = (s) => crypto.createHash("sha1").update(s).digest("hex").slice(0, 12);

async function take(page, date) {
  await page.clock.setFixedTime(new Date(date + "T12:00:00"));
  await page.evaluate(() => { location.hash = "#home"; });
  await page.waitForTimeout(150);
  await page.evaluate(() => { location.hash = "#findit"; });
  await page.waitForFunction(() => { const h = [...document.querySelectorAll("*")].find((e) => e._finditApi); return !!(h && h._finditApi.rounds().length); }, null, { timeout: 120000 });
  const rounds = await page.evaluate(() => {
    const h = [...document.querySelectorAll("*")].find((e) => e._finditApi);
    const hash = (s) => { let x = 0; for (let i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) | 0; return x; };
    return h._finditApi.rounds().map((r) => ({ kind: r.kind, n: r.n, year: r.year, shown: r.shown == null ? null : r.shown, lon: r.lon == null ? null : Math.round(r.lon * 1000) / 1000, lat: r.lat == null ? null : Math.round(r.lat * 1000) / 1000, tol: r.tol == null ? null : r.tol, cap: r.cap == null ? null : r.cap, ids: r.ids || null, slugs: r.slugs || null, rings: r.rings ? r.rings.length : 0, ringPts: r.rings ? r.rings.reduce((n, g) => n + g.length, 0) : 0, ringHash: r.rings ? hash(JSON.stringify(r.rings)) : 0 }));
  });
  return rounds;
}
(async () => {
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const browser = await chromium.launch(process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {});
  const page = await browser.newPage({ viewport: { width: 1100, height: 800 } });
  const errs = []; page.on("pageerror", (e) => errs.push(String(e.message || e)));
  await page.clock.install({ time: new Date(FROM + "T12:00:00") });
  await page.goto(`http://127.0.0.1:${port}/#home`, { waitUntil: "load" });
  await page.waitForTimeout(500);
  const out = {};
  const d0 = new Date(FROM + "T12:00:00Z");
  for (let i = 0; i < DAYS; i++) { const d = new Date(d0.getTime() + i * 864e5).toISOString().slice(0, 10); out[d] = await take(page, d); process.stdout.write("."); }
  console.log();
  await browser.close(); server.close();
  if (errs.length) console.log("page errors: " + errs.slice(0, 3).join(" | "));
  if (RECORD) { fs.writeFileSync(RECORD, JSON.stringify(out)); const rounds = Object.values(out).reduce((n, r) => n + r.length, 0); console.log(`recorded ${Object.keys(out).length} days, ${rounds} rounds -> ${RECORD}`); return; }
  const gold = JSON.parse(fs.readFileSync(CHECK, "utf8")); let bad = 0, n = 0;
  for (const d of Object.keys(gold)) {
    const a = JSON.stringify(gold[d]), b = JSON.stringify(out[d] || []); n++;
    if (a === b) continue; bad++;
    const A = gold[d], B = out[d] || [];
    for (let i = 0; i < Math.max(A.length, B.length); i++) if (JSON.stringify(A[i]) !== JSON.stringify(B[i])) console.log(`  ${d} round ${i + 1}: was ${JSON.stringify(A[i])}\n      now ${JSON.stringify(B[i])}`);
  }
  console.log(bad ? `${bad} of ${n} days differ` : `all ${n} days dealt the same five rounds`);
  process.exit(bad ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
