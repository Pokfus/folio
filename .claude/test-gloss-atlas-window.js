/* test-gloss-atlas-window.js — the glossary popup's own Atlas window (2026-10-23, the owner; docs/glossary-atlas-windows.md).

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-gloss-atlas-window.js
     FOLIO_CHROMIUM=/path/to/chrome  … to pick the browser (otherwise playwright's own)

   THE RULES IT PROVES. A term that IS a location (the town, never the treaty) shows a small map in its popup: NO buttons in it, a drag and the wheel move and zoom it, the term's place the ONLY thing marked, a state or a
   people shaded at the year of its greatest extent, and opening it never touches the Personal Atlas (`placesSeen` stays as it was). The table that says which terms and where is `atlas/data/glossary-places.js` `windows`,
   a pure function of the glossary, the cards, the registry and history.bin (build-glossary-places.js --check).
     1  the table: in step; no window for a term tagged an event, a person or a thing (unless it is one of the input file's own pins); a year only on an entity; the pin's ids resolve and never name a polity;
        Rome's greatest extent is 117 (Trajan: the data's own answer, pinned so a drift in the arithmetic is seen).
     2  a COUNTRY (Tanzania, on wh-016): engine "v2", no button in the block, the highlight is adm0:tza, the name is drawn, the wheel raises the zoom, a drag moves the view; the pin is still in the bar; placesSeen stays empty.
     3  a POINT (Olduvai Gorge): the gold square and its name, no highlight, no "Discovered!" chip; a term with no window (Louis Leakey, a person) shows no block.
     4  a STATE (the Byzantine Empire, on wh-498): the spec's year is the table's (561), the whole history lands (settled), the highlight is pol:byzantium drawn `exact`, other states neutral, and the selection gold is on the
        pixels; a PEOPLE (the Yangshao culture, on cnh-046): peoples "all" with peopleOnly pol:yangshao at −4000.
     5  the PHONE (390 × 844): a drag on the map pans the map and does not move the sheet (--gs-dy unchanged); a drag on the title still does.
     6  NO WebGL2 (Chromium's own flags): a point term's window runs on the still renderer ("v2-2d"), still buttonless; a state's window is dropped (the block is empty and hidden), the popup otherwise whole.
     7  no console or page errors anywhere. */
"use strict";
const path = require("path"), fs = require("fs");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");
const WE = require("./test-window-env.js");
const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
let pass = 0, fail = 0, base = "";
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const allErrors = [];
const SEL = (k) => `.gloss-win[data-k="${k}"]`;

async function openPopup(ctx, card, key, vp) {
  const page = await ctx.newPage(); const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 300)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 300)); });
  await page.goto(base + "#card/" + card, { waitUntil: "load" });
  await page.waitForSelector(`[data-k="${key}"]`, { timeout: 90000 });
  await page.click(`[data-k="${key}"]`);
  await page.waitForSelector(SEL(key), { timeout: 30000 });
  void vp;
  return { page, errors };
}
/* the window's host once the engine has answered (mounted, failed or dropped) */
async function hostState(page, key, timeout) {
  await page.waitForFunction((k) => { const w = document.querySelector(`.gloss-win[data-k="${k}"]`); if (!w) return false; const slot = w.querySelector(".gloss-atlas"), h = slot && slot.querySelector(".map-card"); if (!h) return !!slot && slot.hidden; return !!(h.getAttribute("data-map-engine") || h.classList.contains("mc-failed")); }, key, { timeout: timeout || 120000 }).catch(() => {});
  return page.evaluate((k) => {
    const w = document.querySelector(`.gloss-win[data-k="${k}"]`), slot = w && w.querySelector(".gloss-atlas"), h = slot && slot.querySelector(".map-card");
    const M = h && h._folioMap;
    return { slotHidden: slot ? slot.hidden : null, slotEmpty: slot ? !slot.firstChild : null, host: !!h, engine: h ? h.getAttribute("data-map-engine") : null, failed: !!(h && h.classList.contains("mc-failed")), buttons: slot ? slot.querySelectorAll("button, .mc-btn, .mc-zoom").length : null,
      chip: !!(w && w.querySelector(".mc-new")), pin: !!(w && w.querySelector(".gloss-map")), ready: M ? M.ready() : null, settled: M ? M.settled() : null, view: M ? M.view() : null, boxes: M ? M.boxes() : null, probe: M && M.probe() ? { year: M.probe().spec.year, hl: M.probe().spec.highlights, layers: M.probe().spec.layers } : null };
  }, key);
}
const progress = (page) => page.evaluate(() => { const p = JSON.parse(localStorage.getItem("folio_v1") || "{}"); return { placesSeen: Object.keys(p.placesSeen || {}), cards: Object.keys(p.cards || {}) }; });
const settle = (page, key, ms) => page.waitForFunction((k) => { const h = document.querySelector(`.gloss-win[data-k="${k}"] .gloss-atlas .map-card`); return !!(h && h._folioMap && h._folioMap.settled()); }, key, { timeout: ms || 180000 }).then(() => true).catch(() => false);
/* the share of the canvas's pixels that carry the selection gold (a warm tint over the land: red well above blue) */
async function goldShare(page, key) {
  return page.evaluate((k) => {
    const cv = document.querySelector(`.gloss-win[data-k="${k}"] .gloss-atlas .mc-canvas`), c = cv.getContext("2d"), d = c.getImageData(0, 0, cv.width, cv.height).data;
    let gold = 0, n = 0; for (let i = 0; i < d.length; i += 16) { n++; const r = d[i], g = d[i + 1], b = d[i + 2]; if (r > 180 && r - b > 45 && g > b + 20 && r >= g) gold++; }
    return gold / n;
  }, key);
}

(async () => {
  const srv = await WE.serve(ROOT); base = srv.base;
  const GPw = {}; new Function("window", fs.readFileSync(path.join(ROOT, "atlas/data/glossary-places.js"), "utf8"))(GPw); const GP = GPw.ATLAS_GLOSSARY_PLACES;

  console.log("\n\x1b[1m1) the table\x1b[0m\n");
  {
    const G = require("./atlas-build/build-glossary-places.js");
    const st = G.build({ check: true, log: () => {} });
    check("atlas/data/glossary-places.js is in step with the glossary, the cards, the registry and history.bin", st.ok, st.why);
    check("format 2 with ids and windows", GP.format === 2 && GP.ids && GP.windows && Object.keys(GP.windows).length > 900, Object.keys(GP.windows).length + " windows");
    const GW = require("./gloss-io.js").loadGlossary(); const T = GW.GLOSSARY_TAGS || {};
    const input = JSON.parse(fs.readFileSync(path.join(__dirname, "atlas-build/glossary-places-input.json"), "utf8"));
    const pinned = Object.assign({}, input.points, input.countries);
    const badTag = Object.keys(GP.windows).filter((k) => !pinned[k] && G.locationClass([].concat(T[k] || [])) == null);
    check("no window for a term tagged an event, a person or a thing (the town, never the treaty)", badTag.length === 0, badTag.slice(0, 8).join(", "));
    check("the Treaty of Versailles has no window; Lascaux, France and Texas have one", !GP.windows.Treaty_of_Versailles && !!GP.windows.Lascaux && !!GP.windows.France && !!GP.windows.Texas);
    const reg = require("./places-registry.js").loadRegistry();
    const yearBad = Object.keys(GP.windows).filter((k) => { const w = GP.windows[k]; const r = w[3] && reg.rows.get(String(w[3])); return w[4] ? !(r && /^(polity|people|culture)$/.test(r.kind)) : !!(r && /^(polity|people|culture)$/.test(r.kind)); });
    check("a year stands on an entity's window and on nothing else", yearBad.length === 0, yearBad.slice(0, 6).join(", "));
    const idBad = Object.keys(GP.ids).filter((k) => { const r = reg.rows.get(GP.ids[k]); return !r || /^(polity|people|culture)$/.test(r.kind); });
    check("every pin resolves in the registry and none names a polity (the place route opens places)", idBad.length === 0, idBad.slice(0, 6).join(", "));
    const F = require(path.join(ROOT, "atlas/atlas-format.js")); const HT = F.read(new Uint8Array(fs.readFileSync(path.join(ROOT, "atlas/data/history.bin"))));
    const rome = G.entityExtent(HT, "pol:rome");
    check("Rome's greatest extent is the year 117 (Trajan), read off history.bin's own areas", rome && rome.year === 117, JSON.stringify(rome));
    const w0 = GP.windows.Byzantine_Empire;
    check("the Byzantine Empire's window: pol:byzantium at 561 (Justinian), framed", w0 && w0[3] === "pol:byzantium" && w0[4] === 561 && w0[5] > 0, JSON.stringify(w0));
  }

  const browser = await WE.launch(chromium, LAUNCH);
  console.log("\n\x1b[1m2) a country: Tanzania on wh-016\x1b[0m\n");
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const { page, errors } = await openPopup(ctx, "wh-016", "Tanzania");
    const s = await hostState(page, "Tanzania");
    check("the popup carries a window on the engine", s.host && s.engine === "v2", s.engine);
    check("no button in the block", s.buttons === 0, String(s.buttons));
    check("the highlight is Tanzania's face and nothing else", s.probe && s.probe.hl.length === 1 && s.probe.hl[0].ids.join() === "adm0:tza" && !s.probe.year, JSON.stringify(s.probe && s.probe.hl.map((h) => h.ids)));
    check("the name is drawn, and only the name", s.boxes && s.boxes.names.length === 1 && s.boxes.names[0].text === "Tanzania" && s.boxes.marks.length === 0, JSON.stringify(s.boxes && s.boxes.names.map((n) => n.text)));
    check("the bar keeps the Atlas pin", s.pin);
    const cv = await page.$(SEL("Tanzania") + " .gloss-atlas .mc-canvas"); await cv.scrollIntoViewIfNeeded(); await sleep(200); const bb = await cv.boundingBox();   // the window sits below the description: the body scrolls to it
    await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await page.mouse.wheel(0, -240); await sleep(350);
    const v1 = (await hostState(page, "Tanzania")).view;
    check("the wheel zooms in", v1.zoom > s.view.zoom, s.view.zoom.toFixed(2) + " → " + v1.zoom.toFixed(2));
    await page.mouse.down(); await page.mouse.move(bb.x + bb.width / 2 + 70, bb.y + bb.height / 2 + 24, { steps: 8 }); await page.mouse.up(); await sleep(350);
    const v2 = (await hostState(page, "Tanzania")).view;
    check("a drag moves the view", Math.abs(v2.lon - v1.lon) > 0.3 && Math.abs(v2.lat - v1.lat) > 0.1, v1.lon.toFixed(2) + "," + v1.lat.toFixed(2) + " → " + v2.lon.toFixed(2) + "," + v2.lat.toFixed(2));
    check("the popup is still open after the gestures (a drag is not a tap, a wheel not a scroll of the page)", await page.$(SEL("Tanzania")) != null);
    await page.click(SEL("Tanzania") + " .gloss-close"); await sleep(400);
    const pr = await progress(page);
    check("opening and closing the window wrote no placesSeen and no card record", pr.placesSeen.length === 0 && pr.cards.length === 0, JSON.stringify(pr));
    allErrors.push(...errors); await ctx.close();
  }

  console.log("\n\x1b[1m3) a point, and a term with no window\x1b[0m\n");
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const { page, errors } = await openPopup(ctx, "wh-016", "Olduvai_Gorge");
    const s = await hostState(page, "Olduvai_Gorge");
    check("Olduvai Gorge: a window, no button, no highlight", s.host && s.engine === "v2" && s.buttons === 0 && s.probe && s.probe.hl.length === 0, s.engine);
    check("the gold square and its name, nothing else", s.boxes && s.boxes.marks.length === 1 && s.boxes.names.length === 1 && s.boxes.names[0].text === "Olduvai Gorge", JSON.stringify(s.boxes && { m: s.boxes.marks.length, n: s.boxes.names.map((n) => n.text) }));
    check("no \"Discovered!\" chip", !s.chip);
    await page.click(SEL("Olduvai_Gorge") + " .gloss-close"); await sleep(300);
    await page.click(`[data-k="Louis_Leakey"]`); await page.waitForSelector(SEL("Louis_Leakey"), { timeout: 30000 }); await sleep(600);
    const t = await page.evaluate(() => { const w = document.querySelector('.gloss-win[data-k="Louis_Leakey"]'), slot = w && w.querySelector(".gloss-atlas"); return { hidden: slot ? slot.hidden : null, empty: slot ? !slot.firstChild : null, win: !!(GPw => true) }; });
    check("Louis Leakey (a person): no window block", t.hidden === true && t.empty === true, JSON.stringify(t));
    check("…and the table has no window for him", !GP.windows.Louis_Leakey);
    allErrors.push(...errors); await ctx.close();
  }

  console.log("\n\x1b[1m4) a state at its greatest extent, and a people\x1b[0m\n");
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const { page, errors } = await openPopup(ctx, "wh-498", "Byzantine_Empire");
    const s0 = await hostState(page, "Byzantine_Empire");
    check("the Byzantine Empire: a window on the engine, no button", s0.host && s0.engine === "v2" && s0.buttons === 0, s0.engine);
    const ok = await settle(page, "Byzantine_Empire", 240000);
    const s = await hostState(page, "Byzantine_Empire");
    check("the whole history lands and the window settles", ok && s.settled);
    check("drawn at 561, the year of its greatest extent, the one highlight pol:byzantium, exact, other states neutral", s.probe && s.probe.year === 561 && s.probe.hl.length === 1 && s.probe.hl[0].ids.join() === "pol:byzantium" && s.probe.hl[0].exact === true && s.probe.layers.neutral === true, JSON.stringify(s.probe && { y: s.probe.year, hl: s.probe.hl.map((h) => h.ids), n: s.probe.layers.neutral }));
    await sleep(800);
    const g = await goldShare(page, "Byzantine_Empire");
    check("the selection gold is on the pixels (the empire's faces are shaded)", g > 0.01, (g * 100).toFixed(1) + " % of the canvas");
    check("its name is drawn, and only its name", s.boxes && s.boxes.names.length === 1 && s.boxes.names[0].text === "Byzantine Empire" && s.boxes.marks.length === 0, JSON.stringify(s.boxes && s.boxes.names.map((n) => n.text)));
    const pr = await progress(page);
    check("no placesSeen", pr.placesSeen.length === 0, JSON.stringify(pr.placesSeen));
    allErrors.push(...errors); await ctx.close();
    const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const r2 = await openPopup(ctx2, "cnh-046", "Yangshao_culture");
    const ok2 = await settle(r2.page, "Yangshao_culture", 240000);
    const s2 = await hostState(r2.page, "Yangshao_culture");
    check("the Yangshao culture: at −4000, its presence alone (peoples all, peopleOnly pol:yangshao), settled", ok2 && s2.probe && s2.probe.year === -4000 && s2.probe.layers.peoples === "all" && s2.probe.layers.peopleOnly === "pol:yangshao" && s2.buttons === 0, JSON.stringify(s2.probe && s2.probe.layers));
    allErrors.push(...r2.errors); await ctx2.close();
  }

  console.log("\n\x1b[1m5) the phone: a drag on the map pans the map, not the sheet\x1b[0m\n");
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    const { page, errors } = await openPopup(ctx, "wh-016", "Tanzania");
    const s = await hostState(page, "Tanzania");
    check("the sheet carries the window, buttonless", s.host && s.engine === "v2" && s.buttons === 0, s.engine);
    const dy0 = await page.evaluate(() => document.querySelector('.gloss-win[data-k="Tanzania"]').style.getPropertyValue("--gs-dy") || "0px");
    const cv = await page.$(SEL("Tanzania") + " .gloss-atlas .mc-canvas"); await cv.scrollIntoViewIfNeeded(); await sleep(200); const bb = await cv.boundingBox();   // the window sits below the description: the body scrolls to it
    await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await page.mouse.down(); await page.mouse.move(bb.x + bb.width / 2 + 10, bb.y + bb.height / 2 + 60, { steps: 8 }); await page.mouse.up(); await sleep(400);
    const dy1 = await page.evaluate(() => document.querySelector('.gloss-win[data-k="Tanzania"]').style.getPropertyValue("--gs-dy") || "0px");
    const v = (await hostState(page, "Tanzania")).view;
    check("the map moved", Math.abs(v.lat - s.view.lat) > 0.2, s.view.lat.toFixed(2) + " → " + v.lat.toFixed(2));
    check("the sheet did not", dy0 === dy1, dy0 + " → " + dy1);
    check("the popup is still open (two pointer-ups on the map are not a double tap)", await page.$(SEL("Tanzania")) != null);
    const bar = await page.$(SEL("Tanzania") + " .gloss-bar"); const bb2 = await bar.boundingBox();
    await page.mouse.move(bb2.x + 40, bb2.y + bb2.height / 2); await page.mouse.down(); await page.mouse.move(bb2.x + 40, bb2.y + bb2.height / 2 + 80, { steps: 8 }); await page.mouse.up(); await sleep(300);
    const dy2 = await page.evaluate(() => document.querySelector('.gloss-win[data-k="Tanzania"]').style.getPropertyValue("--gs-dy") || "0px");
    check("a drag on the title still moves the sheet (the control)", dy2 !== dy1, dy1 + " → " + dy2);
    allErrors.push(...errors); await ctx.close();
  }
  await browser.close();

  console.log("\n\x1b[1m6) no WebGL2\x1b[0m\n");
  {
    const b2 = await WE.launch(chromium, Object.assign({}, LAUNCH, { args: ["--disable-webgl", "--disable-3d-apis"] }));
    const ctx = await b2.newContext({ viewport: { width: 1280, height: 800 } });
    const { page, errors } = await openPopup(ctx, "wh-016", "Olduvai_Gorge");
    const s = await hostState(page, "Olduvai_Gorge");
    check("a point term's window runs on the still renderer, buttonless", s.host && s.engine === "v2-2d" && s.buttons === 0, s.engine);
    await page.click(SEL("Olduvai_Gorge") + " .gloss-close"); await sleep(300);
    allErrors.push(...errors);
    const r2 = await openPopup(ctx, "wh-498", "Byzantine_Empire");
    await r2.page.waitForFunction(() => { const w = document.querySelector('.gloss-win[data-k="Byzantine_Empire"]'), slot = w && w.querySelector(".gloss-atlas"); return !!slot && slot.hidden && !slot.firstChild; }, null, { timeout: 60000 }).catch(() => {});
    const s2 = await hostState(r2.page, "Byzantine_Empire");
    const whole = await r2.page.evaluate(() => { const w = document.querySelector('.gloss-win[data-k="Byzantine_Empire"]'); return !!(w && w.querySelector(".gloss-desc") && w.querySelector(".gloss-desc").textContent.length > 40); });
    check("a state's window is dropped (no history on the still renderer): the block is empty and hidden, no sentence", s2.slotHidden === true && s2.slotEmpty === true && !s2.host, JSON.stringify({ hidden: s2.slotHidden, empty: s2.slotEmpty }));
    check("the popup is otherwise whole", whole);
    allErrors.push(...r2.errors); await ctx.close(); await b2.close();
  }

  console.log("\n\x1b[1m7) errors\x1b[0m\n");
  check("no console or page errors", allErrors.length === 0, allErrors.slice(0, 6).join(" | "));
  srv.close();
  console.log(`\n${pass} passed, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
