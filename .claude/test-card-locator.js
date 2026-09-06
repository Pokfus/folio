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
   `startCardGlobe`'s `draw()` / the idle `ensureData("atlas")` beside it / `uCacheBust` / `CMAP_ANCHOR` /
   `hiresRiverIngest` / `effRivers` / the `river_*` bundles, or after re-running
   .claude/build-hires-rivers.js. Not part of the site. */
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");
// The repo's own index.html, resolved from THIS file rather than written out: a hardcoded
// absolute path is right on exactly one machine, and in CI it loaded nothing at all, which
// fails as a crash before the first assertion rather than as a wrong answer.
const base = require("url").pathToFileURL(require("path").join(__dirname, "..", "index.html")).href;
/* WHAT COUNTS AS WATER, and why it is not the ocean's colour any more.
   Both counters used to ask for the map's OCEAN colour (`b>200, b-r>40, g>180`), because a river was
   stroked in exactly that — water continuous with the sea. Since Sep 2026 it is not: a river is drawn in
   its own saturated blue by day (`riverInk`), on a report that rivers were nearly invisible on the light
   paper, where they measured 1.03:1 against the land they cross. The old predicate therefore stopped
   counting rivers at all, and section 4's "the map really draws it" — which measures the hi-res layer BY
   TAKING IT AWAY — collapsed from a delta of ~1,100 pixels to ~110 and failed. Nothing was wrong with the
   map: the check had quietly stopped measuring its subject, which is the one way a pixel test lies.
   Blue-DOMINANT rather than any particular blue, so it covers the ocean, both river inks and their
   antialiased edges, and still excludes the grey land, the coast ink and the selection gold. */
/* It is INJECTED rather than written into each counter, because both counters are serialized into the
   page and a second copy of a predicate is the thing that goes stale — which is exactly what happened
   to the ocean-colour test above. `addInitScript` survives the reloads these sections do. */
const IS_WATER = "window.isWater = (d, i) => d[i + 2] - d[i] > 25 && d[i + 2] > 120;";
let pass = 0, fail = 0;
const check = (n, ok, x) => { if (ok) { pass++; console.log("ok    " + n + (x ? "  " + x : "")); } else { fail++; console.log("FAIL  " + n + "  " + (x || "")); } };
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.FOLIO_CHROMIUM });
  const errs = [], asked = [];
  const page = await browser.newPage({ viewport: { width: 1200, height: 1000 } });
  await page.addInitScript(IS_WATER);
  page.on("pageerror", (e) => errs.push(e.message));
  page.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !isNoise(t)) errs.push(t); });
  page.on("request", (r) => asked.push(r.url()));
  /* THE SIBLINGS ARE THE STUDIED ONES (Sep 2026, on request: "the only locations displayed on the map
     should be ones from cards that the user has already studied, so that the map fills up the more they
     study a collection"). So this reader has a record on a dozen of Ancient Greece's placed cards — the
     Cretan palaces, Akrotiri, Mycenae, Tiryns, Thebes, Olympia, Delphi — and it is those that the red
     marks and their names below are counted from. Section 2's reader has studied nothing, and asserts
     the other half: a map with no studied sibling on it. */
  await page.addInitScript(() => {
    const rec = { due: Date.now() + 9e8, ivl: 9, ease: 2.5, status: "review", reps: 2, first: "2026-08-01" };
    const cards = { "gr-001": rec };
    ["gr-004", "gr-008", "gr-011", "gr-012", "gr-013", "gr-042", "gr-049", "gr-058", "gr-067", "gr-069", "gr-163", "gr-164", "gr-189", "gr-119"].forEach((id) => { cards[id] = rec; });
    localStorage.setItem("folio_v1", JSON.stringify({
      active: ["cotd:added"], cotd: ["gr-002"],
      cards: cards,
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
      if (isWater(d, i)) water++;
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

  /* …and the card's own mark is still there in the answer's gold. `gr-002` is a REGION, and since Sep 2026
     a region is clipped to the land: the Cyclades' dashed edge lies at sea and is trimmed away, so what is
     left of the mark is the TINT over each island — the selection gold at 24% over the land colour, which
     is warm where the land is grey and the sea is blue. So the count is of warm pixels: red well above
     blue, and not the sibling red, whose green is low. */
  const gold = await page.evaluate(() => {
    const cv = document.querySelector(".map-card.map-loc .mc-canvas");
    const ctx = cv.getContext("2d");
    const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
    let n = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i] > 200 && d[i + 1] > 180 && d[i] - d[i + 2] > 30) n++;
    return n;
  });
  check("...with the card's own place still marked in the answer's gold", gold > 30, "gold/tint px " + gold);

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
    await pg.addInitScript(IS_WATER);
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
  /* …AND THE ONLY RED IS ROME: this reader has studied nothing, so none of the collection's EARNED places
     is on the map (Sep 2026, on request) — but the collection's home city is drawn whether or not any card
     has taught it (Sep 2026, on request: "Rome should always be visible in the Roman collection, with a
     slightly larger red square as icon"). The two rules pull against each other and the measure is the
     SHAPE of the red: one compact square, ~9px a side, and not the scattered dots of section 1's studied
     reader (292 px spread across the Aegean). A regression either way is visible here — a red mark with a
     wide bounding box is the old map back, and no red at all is the home city gone. */
  const rmRed = await rng.evaluate(() => {
    const cv = document.querySelector(".map-card.map-loc .mc-canvas");
    const d = cv.getContext("2d").getImageData(0, 0, cv.width, cv.height).data;
    let n = 0, x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      if (r > 150 && r - g > 60 && r - b > 60) { n++; const p = i / 4, x = p % cv.width, y = (p / cv.width) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
    return { n: n, w: x1 - x0, h: y1 - y0, dpr: cv.width / cv.getBoundingClientRect().width };
  });
  check("a reader who has studied nothing sees none of the collection's EARNED places",
    rmRed.w < 16 * rmRed.dpr && rmRed.h < 16 * rmRed.dpr, JSON.stringify(rmRed));
  check("...but the collection's home city is always on the map, as a square",
    rmRed.n > 30 && rmRed.n < 130, JSON.stringify(rmRed));

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
      if (isWater(d, i)) water++;
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
  /* The frame's own hi-res set, read BEFORE anything is emptied — section 4 asks about it, and by then
     both river tables have been taken away to measure the layer. */
  const hr = await rng.evaluate(() => {
    const H = (window.HIRES_RIVER || {}).italy;
    if (!H) return null;
    const low = new Set((window.RIVERS || []).map((r) => String(r.n)));
    const named = H.rivers.filter((r) => r.n);
    return {
      rivers: H.rivers.length, named: named.length, sup: H.sup.size,
      supReal: [...H.sup].every((n) => low.has(n)),
      doubled: named.filter((r) => low.has(String(r.n)) && !H.sup.has(String(r.n))).map((r) => r.n),
      pts: H.rivers.reduce((a, r) => a + r.p.reduce((b, l) => b + l.length, 0), 0),
    };
  });
  const withRiv = await rng.evaluate(rivCount);
  /* BOTH river tables, in two steps: since Sep 2026 an Italian or Greek frame draws its own hi-res set as
     well (see hiresRiverIngest), so emptying rivers.js alone would leave the water on screen and report a
     layer that had stopped drawing as one that was still there. Taking the hi-res set away first measures
     it on its own, which is section 4's first check. */
  await rng.evaluate(() => { window.HIRES_RIVER = {}; });
  await redraw(rng);
  const noHi = await rng.evaluate(rivCount);
  await rng.evaluate(() => { window.RIVERS = []; });
  await redraw(rng);
  const noRiv = await rng.evaluate(rivCount);
  check("the collection's map draws the Atlas's rivers", withRiv.water - noRiv.water > 150,
    JSON.stringify({ withRivers: withRiv.water, without: noRiv.water }));
  /* A HANDFUL OF PIXELS EITHER WAY IS THE LABELS' ANTIALIASING, NOT A NAME. It was an equality until
     Sep 2026, when the hi-res set joined rivers.js and taking BOTH away moved the count by five: a
     label's edge pixels blend against whatever is under them, and a stroke of water under a letter puts
     one or two of them the other side of the "dark" threshold. A river NAME is tens of dark pixels and
     there are fifty-odd rivers in this frame, so the gap between a rounding and a regression is three
     orders of magnitude — the tolerance costs the check nothing. */
  check("...and not one of them is named", Math.abs(withRiv.dark - noRiv.dark) < 40,
    JSON.stringify({ withRivers: withRiv.dark, without: noRiv.dark }));

  /* ============================================================
     4. THE FRAME'S OWN RIVERS, AND THE CAPITAL THAT IS A SQUARE AND NOTHING ELSE (Sep 2026, on request)
     ============================================================
     "Rivers in Italy in the Roman deck and Greek rivers in the Greek deck should have a much higher
     resolution … and there should be more of them", and — since Sep 2026 — "modern capitals/cities …
     should not appear at all".

     BOTH FAIL SILENTLY. A hi-res bundle that stops arriving leaves the map drawing rivers.js — a perfectly
     good map, one thirtieth as detailed — and a supersede row that stops being honoured draws the same
     river twice, five kilometres apart, which reads as two rivers rather than as a fault. The city layer
     is the mirror: a layer that comes back looks deliberate.

     The double-draw is checked on the DATA rather than on the ink, because that is where it can actually
     go wrong: the drawn set is rivers.js minus `supersede` plus the region's own, so a name the region
     carries that rivers.js also has and `supersede` does not name is the one way a river can be laid over
     itself. The layer's presence is checked the way section 3 checks rivers.js — by taking it away. */
  check("the Italian frame carries its own rivers, and more of them than rivers.js has there",
    !!hr && hr.rivers >= 40 && hr.named >= 40 && hr.sup >= 15, JSON.stringify(hr && { rivers: hr.rivers, named: hr.named, supersedes: hr.sup }));
  check("...at a resolution rivers.js has not got", !!hr && hr.pts / hr.rivers > 40, hr && "points " + hr.pts);
  check("...every one it supersedes is really in rivers.js", !!hr && hr.supReal);
  check("...and no river is drawn over itself", !!hr && hr.doubled.length === 0, hr && hr.doubled.join(", "));
  check("...and the map really draws it", withRiv.water - noHi.water > 150,
    JSON.stringify({ withHiRes: withRiv.water, without: noHi.water }));
  /* A MODERN CITY IS NOT ON THE MAP AT ALL (Sep 2026, on request: "modern capitals/cities should no
     longer be marked with small black squares, but should not appear at all"). This assertion used to run
     the other way — that the square WAS drawn and its name was not — and it is measured the same way,
     which is what makes the removal checkable rather than assumed: rm-002's page still has both river
     tables emptied from section 3, so a capital dropped into the open Tyrrhenian, under a name long
     enough that a label would be hundreds of dark pixels, is the only thing that could be added there.
     A layer that comes back looks deliberate, which is why it is worth a test at all. */
  await rng.evaluate(() => { window.CITIES = []; });
  await redraw(rng);
  const capBefore = (await rng.evaluate(rivCount)).dark;
  await rng.evaluate(() => { window.CITIES = [{ n: "Mmmmmmmmmmmmmmmmmmmm", c: [12.2, 40.2], r: 0 }]; });
  await redraw(rng);
  const capAfter = (await rng.evaluate(rivCount)).dark;
  const capInk = capAfter - capBefore;
  check("a modern city puts nothing on the map — neither a square nor a name", capInk === 0, "dark px " + capInk);
  await rng.close();

  check("no console or page errors on the extent cards", errs.length === 0, errs.join(" | ").slice(0, 300));

  await browser.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
