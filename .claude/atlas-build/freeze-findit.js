#!/usr/bin/env node
/* freeze-findit.js — THE LAST EXTRACTION OF FIND IT'S DATED AREAS FROM polities.js (Atlas v2 Phase 5; docs/atlas-v2-phase5-plan.md §4.1).

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/atlas-build/freeze-findit.js [--rev=<commit>] [--check]

   Find it's area rounds ("Find the Spanish Empire — as it stood in 1544") are dealt from the stacks of cards whose locator is a polity's or a culture's extent, and when a card is linked to a
   Cliopatria series (POLITY_LINKS in polities.js) the round is scored on, and drawn from, that series' rings at the round's year (`fi2PolityRings`). polities.js (7.8 MB) is deleted in Phase 5. This
   script opens the site AS IT WAS (the atlas-windows.js of <commit>, which still reads polities.js; default: the commit before the first change of the phase), asks the page's own pool code for its
   area stacks, and writes the ones that have a series behind them to atlas/data/findit-areas.js:

       window.ATLAS_FINDIT_AREAS = { format: 1, areas: { "<title>|<shown year>": { slugs: [polity slugs], rings: [[[lon, lat], …], …] }, … } }

   A card linked to a series after this phase has no entry; Find it then uses the card's authored extent, as it always did for an area with no series. The numbers it printed on the head it was taken
   on: 104 area stacks, 90 with a series, 22,584 ring points in all. --check compares the committed file with a fresh read of the same commit. The file is deleted with polities.js's builders. */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path"), crypto = require("crypto");
const { spawnSync } = require("child_process");
const { chromium } = require("playwright");
const HERE = __dirname, ROOT = path.join(HERE, "..", ".."), OUT = path.join(ROOT, "atlas", "data", "findit-areas.js");
const { headerSources } = require("./fetch-sources.js");
const ARG = (n, d) => { const a = process.argv.find((x) => x.startsWith("--" + n + "=")); return a ? a.split("=")[1] : d; };
const REV = ARG("rev", "aff237d");
const win = spawnSync("git", ["show", REV + ":atlas/atlas-windows.js"], { cwd: ROOT, maxBuffer: 1 << 26 });
if (win.status !== 0) { console.error("git show " + REV + ":atlas/atlas-windows.js failed"); process.exit(1); }
/* the hook records EVERY area stack's polity lookup, before the size filter: an area whose dated rings are too small (`bbA(rings) <= 20`) is dropped from the pool, and the frozen table must still hold those rings or the area would
   come back on its authored extent and the day's deal would move */
const LOOKUP = 'const slugs = fi2PolityLink({ ids: ids }, "area"), dated = fi2PolityRings(slugs, yr), rings = dated ? dated.rings : first.area;';
let WINDOWS = win.stdout.toString("utf8");
if (WINDOWS.indexOf(LOOKUP) < 0 || WINDOWS.indexOf("const FI2_NAMES = {") < 0) { console.error("could not hook fi2Pools in " + REV); process.exit(1); }
WINDOWS = WINDOWS.replace(LOOKUP, LOOKUP + " (window.__fzAll = window.__fzAll || []).push({ n: first.title, shown: yr, slugs: dated ? slugs : null, rings: dated ? dated.rings : null });").replace("const FI2_NAMES = {", "window.__fi2 = { pools: fi2Pools };\n  const FI2_NAMES = {");
const appjs = spawnSync("git", ["show", REV + ":app.js"], { cwd: ROOT, maxBuffer: 1 << 28 });
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream", ".woff2": "font/woff2" };
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(req.url.split("?")[0]) === "/" ? "/index.html" : decodeURIComponent(req.url.split("?")[0]);
  if (p === "/atlas/atlas-windows.js") { res.writeHead(200, { "Content-Type": "text/javascript" }); res.end(WINDOWS); return; }
  if (p === "/app.js") { res.writeHead(200, { "Content-Type": "text/javascript" }); res.end(appjs.stdout); return; }
  fs.readFile(path.join(ROOT, p), (err, data) => { if (err) { res.writeHead(404); res.end(); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(p)] || "application/octet-stream" }); res.end(data); });
});
(async () => {
  await new Promise((r) => server.listen(0, r));
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}/#findit`, { waitUntil: "load" });
  await page.waitForFunction(() => window.__fi2, null, { timeout: 120000 });
  await page.waitForFunction(() => window.POLITIES && window.POLITY_LINKS, null, { timeout: 120000 });
  const rows = await page.evaluate(() => { window.__fzAll = []; window.__fi2.pools(); return window.__fzAll; });
  await browser.close(); server.close();
  const dated = rows.filter((a) => a.slugs && a.rings);
  const areas = {}; let pts = 0;
  for (const a of dated.sort((x, y) => (x.n + "|" + x.shown < y.n + "|" + y.shown ? -1 : 1))) { areas[a.n + "|" + a.shown] = { slugs: a.slugs, rings: a.rings }; pts += a.rings.reduce((n, r) => n + r.length, 0); }
  const digest = crypto.createHash("sha256").update(JSON.stringify(areas)).digest("hex").slice(0, 16);
  const body = "/* sources: " + JSON.stringify(headerSources(["cliopatria"])) + " */\n" +
    "/* atlas/data/findit-areas.js — FROZEN by .claude/atlas-build/freeze-findit.js from polities.js (Phase 5 deleted that file; docs/atlas-v2-phase5-plan.md §4.1). Do not edit. Find it's area rounds that have a Cliopatria series behind them:\n" +
    "   \"<card title>|<year shown>\" → the series' slugs and the rings it had that year, the geometry a round is scored on and drawn from where the engine's history is not drawn. */\n" +
    "window.ATLAS_FINDIT_AREAS = " + JSON.stringify({ format: 1, digest, areas }).replace(/\},"/g, '},\n"') + ";\n";
  console.log(`area stacks looked up ${rows.length}, with a series ${dated.length}, ring points ${pts}, ${body.length} bytes`);
  if (process.argv.includes("--check")) { const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : ""; if (cur !== body) { console.error("atlas/data/findit-areas.js differs"); process.exit(1); } console.log("freeze-findit --check ok"); return; }
  fs.writeFileSync(OUT, body); console.log("wrote atlas/data/findit-areas.js");
})().catch((e) => { console.error(e); process.exit(1); });
