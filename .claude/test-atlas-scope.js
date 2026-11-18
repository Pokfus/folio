#!/usr/bin/env node
/* test-atlas-scope.js — the card windows' scope switch, top-left (2026-11-18, on request: "a switch to depict either all the locations within the
   collection (current system) or all unlocked locations in all history/science/philosophy collections"). Guards `mountScope` / `sibFor` in
   atlas/atlas-windows.js and `locatorSiblingsAll` in app.js. Also checks a person's birth and death places (`locator.also` with a role) are drawn
   and named on wh-380. Uses playwright (NODE_PATH, as CI). */
"use strict";
const fs = require("fs"), path = require("path"), http = require("http");
const ROOT = path.join(__dirname, "..");
let pass = 0, fail = 0;
const check = (name, ok, info) => { if (ok) { pass++; console.log("  ok    " + name); } else { fail++; console.log("  FAIL  " + name + (info ? "  " + info : "")); } };
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".bin": "application/octet-stream" };
const srv = http.createServer((rq, rs) => {
  let p = decodeURIComponent(rq.url.split("?")[0]); if (p === "/") p = "/index.html";
  const f = path.join(ROOT, p);
  fs.readFile(f, (e, d) => { if (e) { rs.writeHead(404); rs.end(); return; } rs.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" }); rs.end(d); });
});
(async () => {
  let chromium;
  try { chromium = require("playwright").chromium; }
  catch (e) { console.log("(playwright not on NODE_PATH — skipped)\n0 passed, 0 failed"); process.exit(0); }
  await new Promise((r) => srv.listen(8823, r));
  const b = await chromium.launch(process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {});
  const page = await b.newPage({ viewport: { width: 900, height: 1000 } });
  const errs = []; page.on("pageerror", (e) => errs.push(e.message));
  // a reader who has studied Rome's Ostia and Greece's palaces and sanctuaries
  await page.addInitScript(() => {
    const rec = { due: Date.now() + 9e8, ivl: 9, ease: 2.5, status: "review", reps: 2, first: "2026-08-01" }, cards = {};
    ["gr-004", "gr-008", "gr-011", "gr-012", "gr-013", "gr-042", "gr-049", "gr-058", "gr-067", "gr-069", "rm-003"].forEach((id) => { cards[id] = rec; });
    if (!sessionStorage.getItem("seeded")) { localStorage.setItem("folio_v1", JSON.stringify({ cards, settings: { newPerDay: 5 } })); localStorage.removeItem("folio.atlasWinScope"); sessionStorage.setItem("seeded", "1"); }
  });
  const up = async (id) => {
    await page.goto("http://127.0.0.1:8823/#card/" + id); await page.reload();
    await page.waitForFunction(() => { const h = document.querySelector(".card-loc .map-card"); return h && h._folioMap && h._folioMap.ready && h._folioMap.ready(); }, null, { timeout: 120000 });
    await page.waitForFunction(() => { const h = document.querySelector(".card-loc .map-card"); return h._folioMap.settled(); }, null, { timeout: 120000 }).catch(() => {});
    await page.waitForTimeout(800);
  };
  const state = () => page.evaluate(() => { const h = document.querySelector(".card-loc .map-card"), sc = h.querySelector(".mc-scope"); return { scope: sc ? [...sc.querySelectorAll("button")].map((x) => x.dataset.scope + (x.classList.contains("on") ? "*" : "")) : null, marks: h._folioMap.boxes().marks.length, names: h._folioMap.boxes().names.map((n) => n.text) }; });
  await up("rm-008");
  for (let i = 0; i < 3; i++) { await page.click('.card-loc [data-mc="out"]'); await page.waitForTimeout(400); }   // out to the whole of Italy and Greece
  await page.waitForTimeout(1500);
  const a = await state();
  check("a card window carries the scope switch, Collection on", !!a.scope && a.scope.join() === "col*,all", JSON.stringify(a.scope));
  await page.click(".card-loc .mc-scope [data-scope=all]"); await page.waitForTimeout(1500);
  await page.evaluate(() => { const h = document.querySelector(".card-loc .map-card"); h._folioMap.pan(0, 0); });
  await page.waitForTimeout(1500);
  const bAll = await state();
  check("All shows more studied places than Collection (Greece's on a Roman card)", bAll.marks > a.marks, a.marks + " → " + bAll.marks);
  check("…and the choice is remembered", await page.evaluate(() => localStorage.getItem("folio.atlasWinScope")) === "all");
  await page.click(".card-loc .mc-scope [data-scope=col]"); await page.waitForTimeout(1500);
  const c = await state();
  check("Collection again shows the collection's places only", c.marks === a.marks, a.marks + " vs " + c.marks);
  await up("wh-380");
  const d = await state();
  check("a person's window names the birth and the death places", d.names.indexOf("Lumbini") >= 0 && d.names.indexOf("Kushinagar") >= 0, d.names.join(", "));
  const ws = await page.evaluate(() => { const h = document.querySelector(".card-loc .map-card"), zc = h.querySelector(".mc-scope").getBoundingClientRect(), cv = h.querySelector(".mc-canvas").getBoundingClientRect(); return { left: zc.left - cv.left, top: zc.top - cv.top }; });
  check("the switch sits in the top-left corner", ws.left < 20 && ws.top < 20, JSON.stringify(ws));
  check("no page errors", !errs.length, errs.join(" | "));
  await b.close(); srv.close();
  console.log("\n" + pass + " passed, " + fail + " failed"); process.exit(fail ? 1 : 0);
})();
