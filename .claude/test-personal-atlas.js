#!/usr/bin/env node
/* YOUR OWN ATLAS — the second Atlas tab (Sep 2026, on request).

   "On the Atlas page, add a second tab, which will feature the user's own explored Atlas. Opening the
   Atlas page should default to this tab. On this personal atlas, the whole globe should have no borders
   or dots shown at first and be empty (except for landmasses+oceans+rivers etc.) in every year since
   4000 BCE. By studying cards from the curated collections, users unlock these countries and places on
   the atlas in the appropriate years. … The information of the popups … can be directly the answer side
   of the card. … The page doesn't need a legend."

   EVERY FAULT THIS GUARDS IS SILENT, which is the whole reason the file exists. A globe with nothing on
   it looks exactly like a reader who has studied nothing. A place resolved in the wrong year looks like
   a deliberate absence. A popup that has quietly gone back to the world atlas's country panel is a
   perfectly good country panel. And the tab defaulting the wrong way is one press from looking right.

   THE COUNTS ARE PIXELS, because the marks are drawn on a canvas and there is no element to query — and
   because "the globe really is empty" and "the reader's country really is shaded" are exactly the two
   things a reader would notice going wrong. The gold is TINT_SEL's, the one the map cards shade with.

       node .claude/test-personal-atlas.js

   Re-run after touching `atlasTab` / `MINE` / `atlasUnlocks` / `mineShapes` / `mineMarks` / `mineAt` /
   `drawMineShapes` / `drawMineMarks` / `showMinePopup` / `eraIsModern` / `renderStatic`'s MINE branch /
   `updateHoverName` / `snapYear` / `frac2year` / `year2frac` / the `.atlas-tabs` markup / `.atlas-empty`,
   or after changing which cards carry a `map` or a `locator`. Not part of the site. */
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");
const base = require("url").pathToFileURL(require("path").join(__dirname, "..", "index.html")).href;
let pass = 0, fail = 0;
const check = (n, ok, x) => { if (ok) { pass++; console.log("ok    " + n + (x ? "  " + x : "")); } else { fail++; console.log("FAIL  " + n + "  " + (x || "")); } };

/* The reader's own places are drawn in the map's selection gold, rgba(255,178,46) — SOLID on a dot and
   at 0.16 as a country's wash, which over the neutral land is about (226,213,192). So the test is the
   WARM CAST rather than the colour itself: r clearly above b with g between them, which the grey land,
   the blue ocean and the grey coast ink all fail. A first cut asked for the literal gold and counted a
   dot while reporting a shaded China as nothing — the failure a pixel test exists to prevent. */
const GOLD = `(() => {
  const cv = document.getElementById("globe"); if (!cv) return -1;
  const d = cv.getContext("2d").getImageData(0, 0, cv.width, cv.height).data;
  let n = 0;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 8) continue;
    if (d[i] > 150 && d[i] - d[i + 2] > 18 && d[i] - d[i + 1] > 4) n++;
  }
  return n;
})()`;

const seed = (ids) => `localStorage.setItem("folio_v1", JSON.stringify({
  cards: Object.fromEntries(${JSON.stringify(ids)}.map((id) => [id, { due: Date.now() + 9e8, ivl: 9, ease: 2.5, status: "review", reps: 2, first: "2026-08-01" }])),
  settings: { newPerDay: 5 },
}));
localStorage.setItem("folio_mine_tour_v1", "1");
localStorage.setItem("folio_atlas_tour_v1", "1");`;

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.FOLIO_CHROMIUM });
  const errs = [];
  let page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  page.on("pageerror", (e) => errs.push(e.message));
  page.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !isNoise(t)) errs.push(t); });

  /* ---------- 1) an atlas with nothing on it ---------- */
  console.log("\n1) the empty earth");
  await page.addInitScript(seed([]));
  await page.goto(base + "#map", { waitUntil: "load" });
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(4200);

  const tabs = await page.$$eval(".at-tab", (els) => els.map((e) => e.textContent.trim() + (e.classList.contains("on") ? "*" : "")));
  check("the Atlas offers two tabs", tabs.length === 2, tabs.join(" / "));
  check("...and opens on the reader's own", tabs[0] === "Your atlas*", tabs.join(" / "));
  check("no legend on it", await page.$eval("#globeLegend", (e) => e.hidden), "hidden");
  check("...and no search", await page.$eval("#globeSearch", (e) => e.hidden), "hidden");
  check("the rail reaches 4000 BCE", (await page.$$eval(".tl-tick", (els) => els.map((e) => e.textContent)))[0] === "4000 BCE",
    (await page.$$eval(".tl-tick", (els) => els.map((e) => e.textContent))).join(" "));
  check("an empty register says so, in words", await page.evaluate(() => { const e = document.getElementById("atlasEmpty"); return !!e && !e.hidden; }));
  const gold0 = await page.evaluate(GOLD);
  check("...and NOTHING is marked on the globe", gold0 === 0, "gold px " + gold0);
  /* The point of the tab is that the earth is still there — an empty globe and a broken globe look the
     same in a pixel count that only asks about the gold. */
  const land0 = await page.evaluate(`(() => {
    const cv = document.getElementById("globe");
    const d = cv.getContext("2d").getImageData(0, 0, cv.width, cv.height).data;
    let land = 0, water = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 8) continue;
      if (d[i + 2] > 200 && d[i + 2] - d[i] > 40) water++; else land++;
    }
    return { land: land, water: water };
  })()`);
  check("...over an earth that is still drawn", land0.land > 20000 && land0.water > 20000, JSON.stringify(land0));

  /* ---------- 2) studying a card puts its place on the globe ---------- */
  /* A SECOND PAGE, not a second seed on this one: `addInitScript` runs on EVERY navigation in the page it
     was added to, so writing the studied cards and reloading would have the empty seed above put back
     over them a moment later — which reads as "studying unlocks nothing" and is the harness, not the app. */
  console.log("\n2) what studying unlocks");
  await page.close();
  page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  page.on("pageerror", (e) => errs.push(e.message));
  page.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !isNoise(t)) errs.push(t); });
  await page.addInitScript(seed(["gw-002", "gw-013", "cnh-069"]));   // China, Egypt (geography) + Yinxu (a Shang locator)
  await page.goto(base + "#map", { waitUntil: "load" });
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(4200);
  check("the empty note is gone", await page.evaluate(() => { const e = document.getElementById("atlasEmpty"); return !e || e.hidden; }));
  const gold1 = await page.evaluate(GOLD);
  check("the reader's countries are shaded", gold1 > 400, "gold px " + gold1);

  /* ---------- 3) the popup is the card ---------- */
  console.log("\n3) clicking a place opens its card");
  const r = await page.$eval("#globe", (e) => { const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; });
  let title = "";
  for (let dx = -220; dx <= 220 && !title; dx += 28) {
    for (let dy = -180; dy <= 180 && !title; dy += 28) {
      await page.mouse.click(r.x + r.w / 2 + dx, r.y + r.h / 2 + dy);
      await page.waitForTimeout(90);
      title = await page.evaluate(() => { const e = document.getElementById("countryPop"); return e && !e.hidden ? document.getElementById("cpName").textContent : ""; });
    }
  }
  check("a click on an unlocked place opens the panel", !!title, title || "nothing opened");
  check("...headed with the card's own answer", /China|Egypt/.test(title), title);
  check("...showing the card's ANSWER SIDE, not a country description",
    await page.evaluate(() => !!document.querySelector("#cpDesc .cp-cardback .answer .val")));
  check("...with its footnote markers numbered, so the apparatus is live",
    await page.evaluate(() => { const m = document.querySelector("#cpDesc sup.fn"); return !!m && !!m.getAttribute("data-fn"); }));
  const off = await page.evaluate(() => ({
    year: document.getElementById("cpYearSec").hidden,
    stats: document.getElementById("cpStatsSec").hidden,
    tools: getComputedStyle(document.querySelector(".cp-tools")).display,
  }));
  /* The three sections that describe a COUNTRY are off — and the tools row is asserted on its COMPUTED
     display rather than on `hidden`, because an author `display:flex` beats the attribute and that is
     exactly how "Through the ages" survived on a panel showing a card. */
  check("...and the world atlas's own sections are off", off.year && off.stats && off.tools === "none", JSON.stringify(off));

  /* ---------- 4) a place appears in its own years and no others ---------- */
  console.log("\n4) the appropriate years");
  const setYear = async (y) => {
    const b = await page.$eval("#tlTrack", (e) => { const x = e.getBoundingClientRect(); return { x: x.x, y: x.y, w: x.width, h: x.height }; });
    const now = new Date().getFullYear();
    await page.mouse.click(b.x + b.w * ((y + 4000) / (now + 4000)), b.y + b.h / 2);
    await page.waitForTimeout(1100);
  };
  await page.keyboard.press("Escape");
  await setYear(-1200);
  const shown = await page.$eval("#tlTip", (e) => e.textContent);
  check("the rail slides to any year, not just a mapped one", /1200\s*BCE/.test(shown), shown);
  const gold2 = await page.evaluate(GOLD);
  /* Yinxu stood in the 13th–11th centuries BCE, so its mark is there and the modern countries are not:
     a year with no era map has no country shapes at all, which is the empty earth the request asks for. */
  check("...where a Shang capital is marked and no modern state is", gold2 > 0 && gold2 < gold1 / 3, "gold px " + gold2 + " against " + gold1);
  await setYear(-3000);
  const gold3 = await page.evaluate(GOLD);
  check("...and in a century before it stood, nothing of the reader's is drawn", gold3 === 0, "gold px " + gold3);

  /* ---------- 5) the world atlas is still the world atlas ---------- */
  console.log("\n5) the other tab");
  await page.evaluate(() => { document.querySelector('[data-atlastab="world"]').click(); });
  await page.waitForTimeout(3000);
  check("switching tab keeps the reader there rather than resetting", await page.$eval('[data-atlastab="world"]', (e) => e.classList.contains("on")));
  check("...and gives the legend back", await page.evaluate(() => !document.getElementById("globeLegend").hidden));
  check("...and the world rail, which starts at 1000 BCE", (await page.$$eval(".tl-tick", (els) => els.map((e) => e.textContent)))[0] === "1000 BCE");
  /* NAVIGATING to the Atlas resets the tab; a repaint must not. That split is what "opening the page
     defaults to this tab" means, and a setting would have got it wrong in the other direction. */
  await page.evaluate(() => { location.hash = "#home"; });
  await page.waitForTimeout(700);
  await page.evaluate(() => { location.hash = "#map"; });
  await page.waitForTimeout(3500);
  check("...but coming back to the Atlas opens on your own again",
    await page.$eval('[data-atlastab="mine"]', (e) => e.classList.contains("on")));

  check("no console or page errors throughout", errs.length === 0, errs.slice(0, 3).join(" | "));
  await browser.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
