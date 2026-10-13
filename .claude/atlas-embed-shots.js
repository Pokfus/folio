/* atlas-embed-shots.js — before / after screenshots of the card windows (Atlas v2 Phase 4): the same card with the preview switch OFF (v1's window) and ON (the engine), at a desktop and a phone size.

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/atlas-embed-shots.js <outDir> [--cards=id,id] [--tag=name] [--engine-only]

   Phase 4b: `--cards` takes the cards to shoot (default: the Phase 4 set), `--tag` names the engine's files <card>-<desktop|phone>-<tag>.png (default v2; V1's are <card>-…-v1.png), `--engine-only` skips V1's.
   A war card's picture includes the legend beneath its window.

   Writes <outDir>/<card>-<desktop|phone>-<v1|v2>.png of the window (and the war key beside it) for a representative card of each window type, plus the Find it board. A tool for the owner's review, not a gate. */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream", ".woff2": "font/woff2" };
const server = http.createServer((req, res) => { const p = decodeURIComponent(req.url.split("?")[0]) === "/" ? "/index.html" : decodeURIComponent(req.url.split("?")[0]); fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { res.writeHead(404); res.end(); } else { res.writeHead(200, { "Content-Type": TYPES[path.extname(p)] || "application/octet-stream" }); res.end(d); } }); });
const ARGS = process.argv.slice(2), FLAG = (n, d) => { const a = ARGS.find((x) => x.startsWith("--" + n + "=")); return a ? a.split("=")[1] : d; };
const OUT = ARGS.find((x) => !x.startsWith("--")) || path.join(ROOT, "docs", "atlas-v2-phase4-shots"), TAG = FLAG("tag", "v2"), ONLY_V2 = ARGS.includes("--engine-only");
const CARDS0 = [["geo-002", "a map card (a US state)"], ["geo-504", "a map card with a capital"], ["gw-503", "a map card (a country)"], ["rm-003", "a locator: a river"], ["wh-059", "a locator: a region"], ["gr-271", "a locator: a battle"], ["rm-209", "a war window"]];
const CARDS = FLAG("cards", "") ? FLAG("cards", "").split(",").map((id) => [id]) : CARDS0;
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  await new Promise((r) => server.listen(5623, r));
  const browser = await chromium.launch(LAUNCH);
  for (const [dev, vp] of [["desktop", { width: 1100, height: 900 }], ["phone", { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }]]) {
    for (const on of (ONLY_V2 ? [true] : [false, true])) {
      const ctx = await browser.newContext({ viewport: vp });
      await ctx.addInitScript((on) => { try { if (on) localStorage.setItem("folio.atlas2.preview", "1"); } catch (e) {} }, on);
      const page = await ctx.newPage();
      for (const [id] of CARDS) {
        await page.goto("http://127.0.0.1:5623/#card/" + id, { waitUntil: "load" }); await page.reload({ waitUntil: "load" });
        await page.waitForSelector(".map-card", { timeout: 60000 });
        await page.waitForFunction(() => { const h = document.querySelector(".map-card"); return h && h._folioMap && h._folioMap.ready() && !h.classList.contains("mc-loading"); }, null, { timeout: 180000 }).catch(() => {});
        const hasSettled = on && await page.evaluate(() => { const h = document.querySelector(".map-card"); return !!(h && h._folioMap && h._folioMap.settled); });
        if (hasSettled) { await page.waitForFunction(() => { const h = document.querySelector(".map-card"); return h && h._folioMap && h._folioMap.settled(); }, null, { timeout: 240000 }).catch(() => {}); await new Promise((r) => setTimeout(r, 1500)); }
        else await new Promise((r) => setTimeout(r, on ? (id === "rm-209" ? 20000 : 9000) : 3500));
        const el = await page.$(".card-loc, .map-card"), key = await page.$(".war-key");
        if (el && key) { const a = await el.boundingBox(), b = await key.boundingBox(); const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y); await page.screenshot({ fullPage: true, path: path.join(OUT, `${id}-${dev}-${on ? TAG : "v1"}.png`), clip: { x, y, width: Math.max(a.x + a.width, b.x + b.width) - x, height: Math.max(a.y + a.height, b.y + b.height) - y } }); }
        else if (el) await el.screenshot({ path: path.join(OUT, `${id}-${dev}-${on ? TAG : "v1"}.png`) });
      }
      if (on && dev === "desktop" && !FLAG("cards", "")) {
        await page.goto("http://127.0.0.1:5623/#findit", { waitUntil: "load" }); await page.reload({ waitUntil: "load" });
        await page.waitForSelector("#findit2", { timeout: 120000 }).catch(() => {}); await new Promise((r) => setTimeout(r, 8000));
        await page.screenshot({ path: path.join(OUT, `findit-desktop-v2.png`) });
      }
      await ctx.close();
    }
  }
  await browser.close(); server.close();
  console.log("wrote", fs.readdirSync(OUT).length, "files to", OUT);
})().catch((e) => { console.error(e); process.exit(1); });
