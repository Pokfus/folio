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
   `mineSel` / `drawMineShapes` / `drawMineMarks` / `mineCoastSkip` / `landDim` / `showMinePopup` /
   `eraIsModern` / `renderStatic`'s MINE branch /
   `updateHoverName` / `snapYear` / `frac2year` / `year2frac` / the `.atlas-tabs` markup / `.atlas-empty` /
   `.cp-mine`, or after changing which cards carry a `map` or a `locator`. Not part of the site. */
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");
const base = require("url").pathToFileURL(require("path").join(__dirname, "..", "index.html")).href;
let pass = 0, fail = 0;
const check = (n, ok, x) => { if (ok) { pass++; console.log("ok    " + n + (x ? "  " + x : "")); } else { fail++; console.log("FAIL  " + n + "  " + (x || "")); } };

/* WHAT THE PIXELS ARE ASKED (rewritten Sep 2026, when the tab stopped washing the reader's countries in
   gold — see the request behind `landDim`). There are two claims to measure and they are now different
   colours. A COUNTRY the reader has unlocked is drawn in the map's own light land shade while everything
   else is a step darker, so "shaded" is a count of pixels at exactly that light shade — zero on an empty
   globe, because there every pixel of land is the dark one. A PLACE is a red dot, `rgba(200,69,60)`, which
   nothing else on this globe is: the land shades are grey, the ocean is cyan and the selection gold has
   its red and green close together. The light shade is COMPUTED here from the same two CSS variables and
   the same formula `readColors` uses, rather than sampled, so a theme change moves both together. */
const PX = `(() => {
  const cs = getComputedStyle(document.body);
  const hex = (h) => { h = h.replace("#", ""); if (h.length === 3) h = h.split("").map((c) => c + c).join(""); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const P = hex(cs.getPropertyValue("--paper").trim() || "#ffffff"), I = hex(cs.getPropertyValue("--ink").trim() || "#000000");
  const L = P.map((v, i) => Math.round(v + (I[i] - v) * 0.10));
  const cv = document.getElementById("globe"); if (!cv) return null;
  const d = cv.getContext("2d").getImageData(0, 0, cv.width, cv.height).data;
  let mine = 0, marks = 0;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 8) continue;
    if (Math.abs(d[i] - L[0]) <= 3 && Math.abs(d[i + 1] - L[1]) <= 3 && Math.abs(d[i + 2] - L[2]) <= 3) mine++;
    if (d[i] > 140 && d[i] - d[i + 1] > 45 && d[i] - d[i + 2] > 45) marks++;
  }
  return { mine: mine, marks: marks };
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
  const px0 = await page.evaluate(PX);
  check("...and NOTHING is marked on the globe", px0.mine === 0 && px0.marks === 0, JSON.stringify(px0));
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
  const px1 = await page.evaluate(PX);
  check("the reader's countries are in the light land shade", px1.mine > 400, JSON.stringify(px1));

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
  /* AND NOTHING ON IT IS SAID TWICE (Sep 2026, on request). The card back carries the answer term as its
     own heading and its dates on its own date line, so the panel's "Answer" label, its "From your card"
     section head, its title bar and its dating are four repetitions — each hidden by `.cp-mine` rather
     than by a write, since the title bar has to come back when the sheet is collapsed. Asserted on the
     COMPUTED display, the trap the tools row above already carries. */
  const dup = await page.evaluate(() => {
    const g = (sel) => { const e = document.querySelector(sel); return e ? getComputedStyle(e).display : "absent"; };
    return { label: g("#cpDesc .cp-cardback .answer .label"), head: g("#cpDescSec > .cp-sec-head"), title: g(".cp-titlemain"), span: g(".cp-span"), mine: document.getElementById("countryPop").classList.contains("cp-mine") };
  });
  check("...and says nothing the card already says", dup.mine && dup.label === "none" && dup.head === "none" && dup.title === "none" && dup.span === "none", JSON.stringify(dup));

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
  const px2 = await page.evaluate(PX);
  /* Yinxu stood in the 13th–11th centuries BCE, so its mark is there and the modern countries are not:
     a year with no era map has no country shapes at all, which is the empty earth the request asks for. */
  /* A HANDFUL of light-shade pixels survives here and is not a country: an antialiased edge between the
     red dot, its white label halo and the dark land lands on that shade by arithmetic. A country is four
     figures of them, so the bar is a bar rather than a zero. */
  check("...where a Shang capital is marked and no modern state is", px2.marks > 0 && px2.mine < 50, JSON.stringify(px2));
  await setYear(-3000);
  const px3 = await page.evaluate(PX);
  check("...and in a century before it stood, nothing of the reader's is drawn", px3.marks === 0 && px3.mine === 0, JSON.stringify(px3));

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
