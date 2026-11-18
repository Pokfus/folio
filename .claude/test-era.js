#!/usr/bin/env node
/* test-era.js — Settings → Dates: BCE / CE (as authored) or BC / AD (2026-11-18, on request: "add the option to switch between
   BC/AD and BCE/CE. This should automatically apply across the entire website"). Guards `eraText`, `eraTree`, `applyEra`, `setEra`
   in app.js and the Atlas's `fmtYear` / atlas-windows `yearText`. Uses playwright (NODE_PATH, as CI). */
"use strict";
const fs = require("fs"), path = require("path"), http = require("http");
const ROOT = path.join(__dirname, "..");
let pass = 0, fail = 0;
const check = (name, ok, info) => { if (ok) { pass++; console.log("  ok    " + name); } else { fail++; console.log("  FAIL  " + name + (info ? "  " + info : "")); } };
const SRC = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
check("app.js defines the era pass", /function eraText\(/.test(SRC) && /function eraTree\(/.test(SRC) && /function setEra\(/.test(SRC));
check("render() runs the era pass after spelling", /spellTree\(root\);[\s\S]{0,200}eraTree\(root\);/.test(SRC));
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png" };
const srv = http.createServer((rq, rs) => {
  let p = decodeURIComponent(rq.url.split("?")[0]); if (p === "/") p = "/index.html";
  const f = path.join(ROOT, p);
  fs.readFile(f, (e, d) => { if (e) { rs.writeHead(404); rs.end(); return; } rs.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" }); rs.end(d); });
});
(async () => {
  let chromium;
  try { chromium = require("playwright").chromium; }
  catch (e) { console.log("\n(playwright not on NODE_PATH — the browser half was skipped)\n" + pass + " passed, " + fail + " failed"); process.exit(fail ? 1 : 0); }
  await new Promise((r) => srv.listen(8813, r));
  const b = await chromium.launch({ executablePath: process.env.FOLIO_CHROMIUM });
  const page = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = []; page.on("pageerror", (e) => errs.push(e.message));
  await page.goto("http://127.0.0.1:8813/#settings"); await page.waitForTimeout(1800);
  const row = await page.evaluate(() => { const g = document.querySelector("#eraPick"); if (!g) return null; const bs = [...g.querySelectorAll("button")]; return { vals: bs.map((x) => x.dataset.era), on: bs.filter((x) => x.classList.contains("on")).map((x) => x.dataset.era), text: bs.map((x) => x.textContent) }; });
  check("Settings offers the two date labels, BCE / CE first and on", !!row && row.vals.join() === "ce,ad" && row.on.join() === "ce", JSON.stringify(row));
  // the pure text rule, read off the page
  const cases = await page.evaluate(() => {
    const set = (v) => { document.querySelector('#eraPick [data-era="' + v + '"]').click(); };
    set("ad");
    const T = window.FolioEraText;
    return ["c. 800 BCE – 50 CE", "c. 200 – 900 CE", "the conquest of 43 CE.", "the 1st century CE", "3rd millennium BCE", "a CE mark"].map(T);
  });
  check("BCE becomes BC and a CE year becomes AD before it", JSON.stringify(cases) === JSON.stringify(["c. 800 BC – AD 50", "c. AD 200 – 900", "the conquest of AD 43.", "the 1st century AD", "3rd millennium BC", "a CE mark"]), JSON.stringify(cases));
  await page.waitForTimeout(600);
  const row2 = await page.evaluate(() => ({ on: [...document.querySelectorAll("#eraPick button.on")].map((x) => x.dataset.era), text: [...document.querySelectorAll("#eraPick button")].map((x) => x.textContent), stored: (JSON.parse(localStorage.getItem("folio_v1") || "{}").settings || {}).era }));
  check("the choice is stored and the specimens keep their own labels", row2.on.join() === "ad" && row2.stored === "ad" && row2.text.join("|") === "500 BCEBCE / CE|500 BCBC / AD", JSON.stringify(row2));
  await page.goto("http://127.0.0.1:8813/#card/wh-281"); await page.reload(); await page.waitForTimeout(2500);
  const card = await page.evaluate(() => document.body.innerText);
  check("a card's question and date line read BC / AD", /1200 BC\b/.test(card) && !/\bBCE\b/.test(card.replace(/\n/g, " ").replace(/\[.*?\]/g, "")) , (card.match(/.{20}B?CE?\b.{10}/g) || []).slice(0, 5).join(" | "));
  const late = await page.evaluate(async () => { const d = document.createElement("p"); d.textContent = "Built in 120 CE and lost in 300 BCE."; document.body.appendChild(d); await new Promise((r) => setTimeout(r, 50)); const t = d.textContent; d.remove(); return t; });
  check("text added after the render is relabelled too", late === "Built in AD 120 and lost in 300 BC.", late);
  await page.goto("http://127.0.0.1:8813/#settings"); await page.waitForTimeout(1200);
  await page.click('#eraPick [data-era="ce"]'); await page.goto("http://127.0.0.1:8813/#card/wh-281"); await page.reload(); await page.waitForTimeout(2500);
  const back = await page.evaluate(() => document.body.innerText);
  check("BCE / CE again shows the authored labels", /1200 BCE\b/.test(back));
  check("no page errors", !errs.length, errs.join(" | "));
  await b.close(); srv.close();
  console.log("\n" + pass + " passed, " + fail + " failed"); process.exit(fail ? 1 : 0);
})();
