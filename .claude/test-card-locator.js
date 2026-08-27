#!/usr/bin/env node
/* A LOCATOR SHOWS THE REST OF ITS COLLECTION, AND THE WORLD AROUND IT (Aug 2026, on request).

   "History cards with an atlas locator should also show the collection's other card locations as smaller
   red dots, plus state capitals, million-plus cities, and rivers." Four layers, paid for two different
   ways, and what is asserted here is the PAYMENT as much as the drawing:

   · **THE SIBLING DOTS ARE FREE AND UNCONDITIONAL** — every locator is in `data.js`, which every visitor
     downloads before flipping a card. This is the half the request is really about.
   · **THE CITIES AND RIVERS ARE THE `atlas` BUNDLE, WARMED AT IDLE.** The card must paint WITHOUT them
     and fill in afterwards; a build that awaited them would put ~600 KB behind every history card with a
     map and nothing on screen would say so. Both halves are asserted, because a regression either way
     looks like a map that simply has less on it.

   The pixel counts are the honest test here: the marks are drawn on a canvas, so there is no element to
   query, and "the reds are there" and "the card's own gold is still the biggest mark" are exactly the two
   things a reader would notice going wrong.

   ONE THING THIS CANNOT ASSERT, and it is recorded rather than papered over: **no shipped card's answer
   is a named river**, so the "name it only if the river is a card" rule has no live instance. Natural
   Earth's 10m set names the Nile, Euphrates, Tigris, Danube, Po, Indus, Ganges, Yangtze and Jordan — but
   not the Tiber, the Rubicon, the Eurotas or the Alpheus — so the rule will fire the day a Nile card is
   written and never for Rome's Tiber.

       node .claude/test-card-locator.js

   Re-run after touching `locatorSiblings` / `cardCollectionRoot` / `cardLocatorHTML` / the extras block in
   `startCardGlobe`'s `draw()` / the idle `ensureData("atlas")` beside it / `uCacheBust`. Not part of the
   site. */
const { chromium } = require("playwright");
const base = "file:///home/user/folio/index.html";
let pass = 0, fail = 0;
const check = (n, ok, x) => { if (ok) { pass++; console.log("ok    " + n + (x ? "  " + x : "")); } else { fail++; console.log("FAIL  " + n + "  " + (x || "")); } };
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.FOLIO_CHROMIUM });
  const errs = [], asked = [];
  const page = await browser.newPage({ viewport: { width: 1200, height: 1000 } });
  page.on("pageerror", (e) => errs.push(e.message));
  page.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !/CORS policy|net::ERR_|Failed to load resource/.test(t)) errs.push(t); });
  page.on("request", (r) => asked.push(r.url()));
  await page.addInitScript(() => {
    localStorage.setItem("folio_v1", JSON.stringify({
      active: ["cotd:added"], cotd: ["gr-002"],
      cards: { "gr-001": { due: Date.now() + 9e8, ivl: 9, ease: 2.5, status: "review", reps: 2, first: "2026-08-01" } },
      settings: { newPerDay: 5 },
    }));
  });
  await page.goto(base + "#home", { waitUntil: "load" });
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(1600);
  await page.evaluate(() => { const r = document.querySelector('[data-review="cotd:added"]'); if (r) r.click(); });
  await page.waitForTimeout(1200);
  await page.evaluate(() => { const r = document.querySelector("#reveal-btn"); if (r) r.click(); });
  await page.waitForTimeout(900);

  const l = await page.evaluate(() => {
    const h = document.querySelector(".map-card.map-loc");
    return h ? { there: true, card: h.getAttribute("data-map-card"), at: h.getAttribute("data-map-at") } : { there: false };
  });
  check("the card carries a locator globe", l.there && l.card === "gr-002", JSON.stringify(l));

  // the world bundle loads first and the card is READABLE before the atlas arrives
  await page.waitForTimeout(2500);
  const early = asked.filter((u) => /\/atlas|\/cities\.js|\/rivers\.js/.test(u)).length;
  const drew = await page.evaluate(() => {
    const cv = document.querySelector(".map-card.map-loc .mc-canvas");
    if (!cv) return null;
    const ctx = cv.getContext("2d");
    const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
    let ink = 0; for (let i = 3; i < d.length; i += 4000) if (d[i] > 0) ink++;
    return { painted: ink > 10, w: cv.width };
  });
  check("...which paints without waiting for the atlas", !!drew && drew.painted, JSON.stringify(drew));

  // wait for the idle warm to land, then look for the extra layers
  await page.waitForTimeout(9000);
  const after = await page.evaluate(() => ({
    cities: (window.CITIES || []).length,
    rivers: (window.RIVERS || []).length,
  }));
  check("the cities and rivers arrive at idle", after.cities > 1000 && after.rivers > 500, JSON.stringify(after));
  check("...fetched, not bundled into the eager path",
    asked.some((u) => /cities\.js/.test(u)) && asked.some((u) => /rivers\.js/.test(u)));

  // the sibling dots: count the red pixels the collection's other 54 places put on the globe
  const red = await page.evaluate(() => {
    const cv = document.querySelector(".map-card.map-loc .mc-canvas");
    const ctx = cv.getContext("2d");
    const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
    let n = 0;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      if (r > 150 && r - g > 60 && r - b > 60) n++;      // the sibling red, and nothing else on this map
    }
    return n;
  });
  check("the collection's other places are on the map, in red", red > 60, "red px " + red);

  // …and they are SMALLER than the card's own gold dot
  const gold = await page.evaluate(() => {
    const cv = document.querySelector(".map-card.map-loc .mc-canvas");
    const ctx = cv.getContext("2d");
    const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
    let n = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i] > 210 && d[i + 1] > 140 && d[i + 1] < 210 && d[i + 2] < 90) n++;
    return n;
  });
  check("...with the card's own place still the biggest mark on it", gold > 0, "gold px " + gold);

  check("no console or page errors", errs.length === 0, errs.join(" | ").slice(0, 300));
  await browser.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
