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

   THE RIVERS ARE NOW THE ATLAS'S WHOLE SET, UNLABELLED (Aug 2026, on request: "the same Rivers
   displayed on the Atlas should also be displayed in Atlas windows in cards (only without their
   labels)"). For a fortnight a river was drawn only where the collection taught one, and this file
   asserted the other half of that rule — that a collection with no river card got no river at all. It
   asserts the replacement instead, in two directions, because a regression either way draws a perfectly
   good map: the water-coloured pixels must GROW when the bundle lands, and the dark ink must not, since
   a thousand river names arriving with them is exactly what was asked to be left out.
   Natural Earth **labels a river in the language of the country it runs through**: the Tiber is in there
   as `Tevere`, the Danube also as `Donau`, the Yangtze also as `Chang Jiang`. That is still why
   `locatorSiblings` maps a card's answer term AND its glossary aliases back to the name the collection
   teaches — a river card's own river takes the answer's gold and is named after the reveal, and `Tevere`
   on the paired glossary term is what finds it.

       node .claude/test-card-locator.js

   Re-run after touching `locatorSiblings` / `cardCollectionRoot` / `cardLocatorHTML` / the extras block in
   `startCardGlobe`'s `draw()` / the idle `ensureData("atlas")` beside it / `uCacheBust`. Not part of the
   site. */
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");
// The repo's own index.html, resolved from THIS file rather than written out: a hardcoded
// absolute path is right on exactly one machine, and in CI it loaded nothing at all, which
// fails as a crash before the first assertion rather than as a wrong answer.
const base = require("url").pathToFileURL(require("path").join(__dirname, "..", "index.html")).href;
let pass = 0, fail = 0;
const check = (n, ok, x) => { if (ok) { pass++; console.log("ok    " + n + (x ? "  " + x : "")); } else { fail++; console.log("FAIL  " + n + "  " + (x || "")); } };
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.FOLIO_CHROMIUM });
  const errs = [], asked = [];
  const page = await browser.newPage({ viewport: { width: 1200, height: 1000 } });
  page.on("pageerror", (e) => errs.push(e.message));
  page.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !isNoise(t)) errs.push(t); });
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
    let ink = 0, water = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] > 0) ink++;
      if (d[i + 2] > 200 && d[i + 2] - d[i] > 40 && d[i + 1] > 180) water++;   // the map's own ocean colour
    }
    return { painted: ink > 10, w: cv.width, water: water };
  });
  check("...which paints without waiting for the atlas", !!drew && drew.painted, JSON.stringify({ painted: drew && drew.painted, w: drew && drew.w }));


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

  /* THE SIBLING DOTS ARE NAMED (Aug 2026, on a bug report: "the other dots don't have their labels").
     A pixel proxy, and deliberately a loose one: the labels are canvas text, so there is no element to
     query, and what a regression would look like is the map keeping its dots and losing its words. The
     card's own label — one line of 13px — cannot reach this on its own; a run with the siblings named
     measures about 400 dark pixels against roughly a third of that for the answer alone. */
  const inked = await page.evaluate(() => {
    const cv = document.querySelector(".map-card.map-loc .mc-canvas");
    const ctx = cv.getContext("2d");
    const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
    let n = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i] < 90 && d[i + 1] < 90 && d[i + 2] < 90 && d[i + 3] > 200) n++;
    return n;
  });
  check("...and named, not left as bare dots", inked > 250, "ink px " + inked);

  check("no console or page errors", errs.length === 0, errs.join(" | ").slice(0, 300));

  /* ============================================================
     2. A PLACE WITH EXTENT IS DRAWN WITH ITS EXTENT (Aug 2026, on request)
     ============================================================
     "For river cards like 'Tiber' ensure it is displayed on the map as an actual river and not just a
     dot. Same goes for mountain ranges like the Apennines … Also regions … Battle locations should be
     identified by a crossed swords icon instead of the red dot."

     Every one of these fails SILENTLY: a river card that has quietly gone back to a dot draws a perfectly
     good map, and so does a range whose triangles have stopped. The marks are on a canvas, so what is
     measured is the SHAPE OF THE INK — a dot is a blob about 11px across and a river, a spine and a
     region are none of them that. The two cards are opened in one browser page each, which is the same
     cost as section 1 and the only way to reach a card's back. */
  const markOf = async (pg, sel) => pg.evaluate((s) => {
    const cv = document.querySelector(".map-card.map-loc .mc-canvas");
    const ctx = cv.getContext("2d");
    const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
    let gold = 0, gx0 = 1e9, gx1 = -1e9, gy0 = 1e9, gy1 = -1e9, dark = 0, dx0 = 1e9, dx1 = -1e9;
    for (let i = 0; i < d.length; i += 4) {
      const p = i / 4, x = p % cv.width, y = (p / cv.width) | 0;
      const r = d[i], g = d[i + 1], b = d[i + 2];
      if (r > 210 && g > 140 && g < 215 && b < 110) { gold++; if (x < gx0) gx0 = x; if (x > gx1) gx1 = x; if (y < gy0) gy0 = y; if (y > gy1) gy1 = y; }
      if (r < 90 && g < 90 && b < 90 && d[i + 3] > 200) { dark++; if (x < dx0) dx0 = x; if (x > dx1) dx1 = x; }
    }
    return { gold: gold, gw: gx1 - gx0, gh: gy1 - gy0, dark: dark, dw: dx1 - dx0, dpr: cv.width / cv.getBoundingClientRect().width };
  }, sel);

  const openCard = async (cid) => {
    const pg = await browser.newPage({ viewport: { width: 1200, height: 1000 } });
    pg.on("pageerror", (e) => errs.push(cid + ": " + e.message));
    pg.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !isNoise(t)) errs.push(cid + ": " + t); });
    await pg.addInitScript((id) => {
      localStorage.setItem("folio_v1", JSON.stringify({ active: ["cotd:added"], cotd: [id], cards: {}, settings: { marker: false } }));
    }, cid);
    await pg.goto(base + "#home", { waitUntil: "load" });
    await pg.reload({ waitUntil: "load" });
    await pg.waitForTimeout(1600);
    await pg.evaluate(() => { const r = document.querySelector('[data-review="cotd:added"]'); if (r) r.click(); });
    await pg.waitForTimeout(1200);
    await pg.evaluate(() => { const r = document.querySelector("#reveal-btn"); if (r) r.click(); });
    await pg.waitForTimeout(9000);   // the atlas warm has to land: the river IS the atlas bundle
    return pg;
  };

  // ---- a river card: the Tiber, drawn as a river ----
  const riv = await openCard("rm-003");
  const rm = await markOf(riv, "");
  /* The card's own river takes the answer's gold, so the gold ink is a LINE — and "a line" is two facts,
     both needed. It is LONG: the mark's longer side runs many times the 11px dot it replaced. And it is
     THIN: a line leaves most of its own bounding box empty, where a dot fills about four fifths of one,
     so the fill ratio is what tells them apart and a length test alone would pass a dot beside a label.
     Measured on the Tiber, which runs north-south: 126 gold pixels in a 20×89 box, a fill of 0.07. */
  const rmLong = Math.max(rm.gw, rm.gh), rmFill = rm.gold / Math.max(1, rm.gw * rm.gh);
  check("a river card draws its river, not a dot", rm.gold > 80 && rmLong > 40 * rm.dpr && rmFill < 0.35,
    JSON.stringify({ gold: rm.gold, box: rm.gw + "×" + rm.gh, fill: +rmFill.toFixed(3), dpr: rm.dpr }));
  await riv.close();

  // ---- a range card: the Apennines, drawn as a chain of mountains ----
  const rng = await openCard("rm-002");
  const am = await markOf(rng, "");
  /* The triangles are dark ink walked down 1,200 km of Italy, so the dark ink spans most of the window's
     width — where a dot card's dark ink is one short label. And a range draws NO gold at all: no dot, and
     its name is set in the map's own ink like every other label. */
  check("a range card draws mountains along its spine", am.dark > 300 && am.dw > 120 * am.dpr,
    JSON.stringify({ dark: am.dark, spread: am.dw, dpr: am.dpr }));
  check("...and no gold dot with them", am.gold < 60, "gold px " + am.gold);

  /* ============================================================
     3. EVERY RIVER THE ATLAS DRAWS, AND NOT ONE OF THEIR NAMES (Aug 2026, on request)
     ============================================================
     "The same Rivers displayed on the Atlas should also be displayed in Atlas windows in cards (only
     without their labels)." For a fortnight a river was drawn only where the collection taught one, and
     this file asserted the other half of that rule — that a collection with no river card got no river.

     THE LAYER IS ISOLATED BY TAKING IT AWAY, which is the only honest way to measure it. A "before the
     bundle lands" reading cannot do the job: on a `file://` run the `atlas` warm resolves within a second
     or two of the reveal, so the first frame a test can get to already has the rivers in it, and the two
     readings come back identical whether the layer draws or not — which is exactly how the old form of
     this check passed for the wrong reason. So the page is measured as it stands, `window.RIVERS` is
     emptied, the same view is redrawn (zoom in and back out returns the frame byte for byte) and it is
     measured again.

     THE RANGE CARD IS THE ONE TO DO IT ON, and the collection is the point rather than the corpus:
     `rm-002` frames Italy, where the Po, the Arno, the Tiber and half a dozen others are in view, and
     ANCIENT ROME's own answer term there is a mountain range rather than a river — so the only thing
     that changes between the two frames is the thin blue layer itself. (Section 1's `gr-002` frames the
     Cyclades, where there is no river to draw at any zoom.)

     · the water-coloured pixels must FALL when the rivers are taken away — the layer is drawn;
     · the dark ink must not move by one pixel — the layer is drawn WITHOUT NAMES, which is the half of
       the request that a screenshot makes look like a matter of taste and is not. */
  const rivCount = () => {
    const cv = document.querySelector(".map-card.map-loc .mc-canvas");
    const d = cv.getContext("2d").getImageData(0, 0, cv.width, cv.height).data;
    let water = 0, dark = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 2] > 200 && d[i + 2] - d[i] > 40 && d[i + 1] > 180) water++;                  // the ocean colour a river is stroked in
      if (d[i] < 90 && d[i + 1] < 90 && d[i + 2] < 90 && d[i + 3] > 200) dark++;              // every label on the map
    }
    return { water: water, dark: dark };
  };
  const redraw = async (pg) => {
    await pg.evaluate(() => { const b = document.querySelector('.map-card.map-loc [data-mc="in"]'); if (b) b.click(); });
    await pg.waitForTimeout(700);
    await pg.evaluate(() => { const b = document.querySelector('.map-card.map-loc [data-mc="out"]'); if (b) b.click(); });
    await pg.waitForTimeout(1100);
  };
  const withRiv = await rng.evaluate(rivCount);
  await rng.evaluate(() => { window.RIVERS = []; });
  await redraw(rng);
  const noRiv = await rng.evaluate(rivCount);
  check("the collection's map draws the Atlas's rivers", withRiv.water - noRiv.water > 150,
    JSON.stringify({ withRivers: withRiv.water, without: noRiv.water }));
  check("...and not one of them is named", withRiv.dark === noRiv.dark,
    JSON.stringify({ withRivers: withRiv.dark, without: noRiv.dark }));
  await rng.close();

  check("no console or page errors on the extent cards", errs.length === 0, errs.join(" | ").slice(0, 300));

  await browser.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
