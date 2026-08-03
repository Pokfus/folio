#!/usr/bin/env node
/* Folio — the discovered-terms page, and the page transition.
   ===========================================================
   Two things that break quietly.

     · PAGES.glossary lists what `glossSeen` holds, and that register outlives the glossary: a term retired
       since it was read would open a popup onto nothing, and a deck's own term was never part of what the
       account's meter counts. Both filters are invisible until they are wrong.
     · The page GHOST — the outgoing page, cloned and left to fade while the new one renders underneath.
       Its whole risk is that the dead copy is in the document for a quarter of a second: an `id` there can
       be found by the new page's wiring, and a control `name` there joins the new page's radio group, so a
       click that had just landed reads back as never having happened (which is exactly how it was found —
       test-deck-glossary, whose Studio radios are that shape). Neither throws.

   Run:  NODE_PATH=<playwright>/node_modules node .claude/test-glossary-page.js
   Env:  FOLIO_CHROMIUM=<path to chrome> if Chromium lives outside the playwright package. */

const path = require("path");
const http = require("http");
const fs = require("fs");
const { chromium } = require("playwright");

const ROOT = path.join(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png" };

let pass = 0, fail = 0;
function check(name, ok, extra) {
  if (ok) { pass++; console.log("ok    " + name + (extra ? "  " + extra : "")); }
  else { fail++; console.log("FAIL  " + name + (extra ? "  " + extra : "")); }
}

function serve() {
  return http.createServer((req, res) => {
    const u = decodeURIComponent(req.url.split("?")[0]);
    const f = path.join(ROOT, u === "/" ? "index.html" : u);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end("not found"); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" });
    fs.createReadStream(f).pipe(res);
  });
}

(async () => {
  const srv = serve();
  await new Promise((r) => srv.listen(0, r));
  const base = "http://127.0.0.1:" + srv.address().port + "/";
  const browser = await chromium.launch(LAUNCH);
  const errs = [];
  const watch = (p) => {
    p.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !/net::ERR_|favicon|manifest/.test(t)) errs.push(t); });
    p.on("pageerror", (e) => errs.push(String(e)));
  };

  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  watch(page);

  /* ================= 1. nothing read yet ================= */
  await page.goto(base + "#glossary", { waitUntil: "load" });
  await page.waitForTimeout(1100);
  check("an empty register says so rather than showing an empty box",
    await page.evaluate(() => !!document.querySelector(".gl-empty") && /Nothing opened yet/.test(document.querySelector(".gl-empty").textContent)));
  check("...and offers a way to start", await page.evaluate(() => !!document.querySelector("#glStudy")));
  check("...with no filter box over an empty list", await page.evaluate(() => { const s = document.querySelector(".gl-search"); return !s || s.hidden; }));

  /* ================= 2. three read terms, one retired, one from a deck ================= */
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("folio_v1") || "{}");
    const keys = Object.keys(window.GLOSSARY || {}).slice(0, 3);
    s.glossSeen = {};
    keys.forEach((k, i) => { s.glossSeen[k] = Date.now() - i * 86400000; });
    s.glossSeen.A_Term_Retired_Since = Date.now();          // no longer in the glossary
    s.glossSeen["u:abcd1234:Widgetstone"] = Date.now();     // a stranger's deck term, never part of the count
    localStorage.setItem("folio_v1", JSON.stringify(s));
  });
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(1200);
  const g = await page.evaluate(() => ({
    rows: document.querySelectorAll(".gl-row").length,
    head: (document.querySelector(".gl-meter-head") || {}).textContent.trim(),
    total: Object.keys(window.GLOSSARY || {}).length,
    names: [...document.querySelectorAll(".gl-name")].map((n) => n.firstChild.textContent),
    dates: [...document.querySelectorAll(".gl-when")].map((n) => n.textContent).filter(Boolean).length,
  }));
  check("a retired term and a deck's own term are both dropped", g.rows === 3, JSON.stringify(g));
  check("the meter counts what the list shows, against the whole glossary", g.head === "3 of " + g.total + " terms · " + Math.round((3 / g.total) * 100) + "%", g.head);
  check("every row carries the day it was met", g.dates === 3, String(g.dates));
  check("newest first", g.names.length === 3);

  check("the Account tab stays lit under it", await page.evaluate(() => !!document.querySelector('.tab.active[data-route="account"]')));

  await page.evaluate(() => document.querySelector(".gl-row").click());
  await page.waitForTimeout(500);
  check("clicking a term opens its popup", await page.evaluate(() => document.querySelectorAll(".gloss-win").length === 1));
  await page.evaluate(() => { const c = document.querySelector(".gloss-win .gloss-close"); if (c) c.click(); });

  const filtered = await page.evaluate(async () => {
    const f = document.querySelector("#glFilter");
    const first = document.querySelector(".gl-name").firstChild.textContent;
    f.value = first.slice(0, 4); f.dispatchEvent(new Event("input", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 200));
    const some = document.querySelectorAll(".gl-row").length;
    f.value = "zzzznotaterm"; f.dispatchEvent(new Event("input", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 200));
    return { some, none: document.querySelectorAll(".gl-row").length, empty: !!document.querySelector(".gl-empty") };
  });
  check("the filter narrows the list", filtered.some >= 1 && filtered.some <= 3, JSON.stringify(filtered));
  check("...and says so when nothing matches", filtered.none === 0 && filtered.empty, JSON.stringify(filtered));

  /* ================= 3. the page transition ================= */
  const ghost = await page.evaluate(async () => {
    location.hash = "settings";
    await new Promise((r) => setTimeout(r, 40));
    const gh = document.querySelector(".page-ghost");
    return {
      present: !!gh,
      pages: document.querySelectorAll("#view .page").length,
      ids: gh ? gh.querySelectorAll("[id]").length : -1,
      names: gh ? gh.querySelectorAll("[name]").length : -1,
      hidden: gh ? gh.getAttribute("aria-hidden") : "",
      clicks: gh ? getComputedStyle(gh).pointerEvents : "",
    };
  });
  check("a navigation leaves a fading copy of the old page", ghost.present && ghost.pages === 2, JSON.stringify(ghost));
  check("...carrying no id that the new page's wiring could find", ghost.ids === 0, JSON.stringify(ghost));
  check("...and no control name that could join the new page's radio groups", ghost.names === 0, JSON.stringify(ghost));
  check("...out of the accessibility tree and out of the way of a click", ghost.hidden === "true" && ghost.clicks === "none", JSON.stringify(ghost));
  await page.waitForTimeout(800);
  check("...and gone a moment later", await page.evaluate(() => !document.querySelector(".page-ghost")));

  /* The Atlas opts out in BOTH directions: its stage is full-bleed, and the globe's teardown has already
     run under any copy of it. A ghost there reads as a rendering fault, not a transition. */
  await page.evaluate(() => localStorage.setItem("folio_atlas_tour_v1", "1"));
  const toAtlas = await page.evaluate(async () => {
    location.hash = "map";
    await new Promise((r) => setTimeout(r, 40));
    return !!document.querySelector(".page-ghost");
  });
  check("arriving at the Atlas leaves no ghost over the globe", !toAtlas);
  await page.waitForTimeout(2500);
  const fromAtlas = await page.evaluate(async () => {
    location.hash = "settings";
    await new Promise((r) => setTimeout(r, 40));
    return !!document.querySelector(".page-ghost");
  });
  check("...and leaving it makes no copy of a live canvas", !fromAtlas);

  check("no console or page errors", errs.length === 0, errs.slice(0, 3).join(" | "));
  await page.close();
  await browser.close();
  srv.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
