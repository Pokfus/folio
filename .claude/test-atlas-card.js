/* test-atlas-card.js — the place card of Atlas v2 (Phase 1c; docs/atlas-v2-design.md §1.5, §2.8).

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-card.js
     FOLIO_CHROMIUM=/path/to/chrome  … to pick the browser (otherwise playwright's own)

   CHANGED 2026-10-19 (the owner's phone: a popup is its name and the cards set there, nothing else — docs/atlas-v2-design.md §7 "The popup, simplified"). What it
   used to prove and no longer can: a country's official name as its title, the description with its wired footnotes, the four-tile figures grid, the Wikipedia link, a river's kind
   line, "No description for …", and (§3b) that every polity, people, culture, extent and front card names its source and licence — all of that content is gone from the popup. The
   sources of the history file are named on the #credits page (generated from the data files' own headers; check-credits.js), and §3b keeps the checks that survive: every source id
   has a wording and every history entity still opens as a card.

   WHAT IT PROVES:
     · a COUNTRY card (France) is its name ("France", not the official name) and nothing else but the cards set there: no kind line, no description, no footnote, no figures grid, no
       Wikipedia link; the lazy `atlas2prose` bundle is NOT loaded for it (countries.js stays for Find it; the stats, spans and sources files are no longer fetched at all);
     · a RIVER card (the Danube) is its name alone;
     · a country WITH no card says only its name — no "No description for …" sentence;
     · the PHONE SHEET: at 390 px the card is a bottom sheet with a grip, opening at a peek that fits its content, expanding on the grip, and the legend is a chip that opens a sheet;
     · Escape closes the card and clears the selection; a second tap at the same spot keeps the country.
*/
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream" };
const PORT = 5617;
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function open(context) {
  await context.addInitScript(() => { try { localStorage.setItem("folio.atlas2.study", "map"); } catch (e) {} });   // the Map view: this suite taps places with no cards seeded, and the Atlas opens on Personal by default since Oct 2026
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  await page.goto(`http://127.0.0.1:${PORT}/#map`, { waitUntil: "load" });
  await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 120000 });
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setLayers({ rivers: true, lakes: true, relief: false }));
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.waterSettled() && c.labelsReady(); }, null, { timeout: 120000 });
  return { page, errors };
}
const cardState = (page) => page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; const el = document.querySelector(".atlas2-card"), body = el.querySelector(".atlas2-card-body"); return Object.assign(c.card(), { hidden: el.hidden, kind: (el.querySelector(".atlas2-card-kind") || {}).textContent || "", text: body.textContent, html: body.innerHTML, kids: [...body.children].map((x) => x.className), extras: el.querySelectorAll("sup.fn, .src-item, .atlas2-stat, .atlas2-card-desc, .atlas2-card-link, .atlas2-card-facts, .atlas2-card-sources, .atlas2-card-chip, .atlas2-card-kind, .atlas2-card-within, details, dl, a[href^='http']").length }); });
const waitProse = (page) => page.waitForFunction(() => !document.querySelector(".atlas2-card-loading"), null, { timeout: 60000 }).catch(() => {});

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch(LAUNCH);
  const { page, errors } = await open(await browser.newContext({ viewport: { width: 1280, height: 800 } }));

  console.log("\n\x1b[1m1) a country card is its name and its cards\x1b[0m\n");
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.select("adm0:fra", { open: true }));
  await sleep(300);
  let c = await cardState(page);
  check("the card is open on France", c.open && c.id === "adm0:fra" && !c.hidden, c.title);
  check("its title is the name, \"France\" (CHANGED: it was the official name, \"French Republic\")", c.title === "France", c.title);
  check("it holds nothing but the cards set there: no kind line, description, footnote, figures grid, Wikipedia link, folded section (CHANGED: all of them were there)", c.extras === 0 && c.kids.every((k) => k === "atlas2-study-cards"), JSON.stringify({ extras: c.extras, kids: c.kids }));
  const bundles = await page.evaluate(() => ({ timelineEras: Array.isArray(window.TIMELINE) ? window.TIMELINE.length : (window.TIMELINE === undefined ? 0 : -1), info: typeof window.COUNTRY_INFO, stats: typeof window.COUNTRY_STATS, spans: typeof window.COUNTRY_SPANS, sources: typeof window.COUNTRY_SOURCES, cities: typeof window.CITIES }));
  check("no prose was fetched for it: the country files (countries.js, country-stats.js, country-spans.js, country-sources.js) are not loaded by a popup, and v1's timeline.js and cities.js are not either (CHANGED: it asserted the prose arrived)", bundles.info === "undefined" && bundles.stats === "undefined" && bundles.spans === "undefined" && bundles.sources === "undefined" && bundles.timelineEras === 0 && bundles.cities === "undefined", JSON.stringify(bundles));
  const sel = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.selectedId());
  check("the country is the selection", sel === "adm0:fra", sel);
  const hash = await page.evaluate(() => location.hash);
  check("the deep link carries the place", /^#map\/-?[\d.]+\/-?[\d.]+\/-?[\d.]+\/adm0(%3A|:)fra(\?y=-?\d+)?$/.test(hash), hash);

  console.log("\n\x1b[1m2) a river card, and a country with no card\x1b[0m\n");
  const danube = await page.evaluate(() => { const g = document.querySelector(".atlas2").__atlas2.gazetteer(); const r = g.rows.find((x) => x.kind === "river" && x.name === "Danube"); return r ? r.id : null; });
  await page.evaluate((id) => document.querySelector(".atlas2").__atlas2.select(id, { open: true }), danube);
  await sleep(150);
  c = await cardState(page);
  check("the Danube's card is its name alone (CHANGED: it had its kind and a Wikipedia link)", c.title === "Danube" && c.extras === 0 && !/Wikipedia|River/.test(c.text), c.text.slice(0, 80));
  const noProse = await page.evaluate(() => { const g = document.querySelector(".atlas2").__atlas2.gazetteer(); const r = g.rows.find((x) => x.kind === "country" && !x.v1); return r ? r.id : null; });
  if (noProse) {
    await page.evaluate((id) => document.querySelector(".atlas2").__atlas2.select(id, { open: true }), noProse);
    await sleep(150);
    c = await cardState(page);
    check(`a country with no card (${noProse}) says only its name — no "No description for" sentence (CHANGED)`, c.extras === 0 && !/No description/.test(c.text), c.text.slice(0, 80));
  }

  console.log("\n\x1b[1m3) the stack chip, Escape\x1b[0m\n");
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setView(33.06, -1.26, 3));
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.tilesSettled() && c.waterSettled(); }, null, { timeout: 120000 });
  await sleep(300);
  const box = await (await page.$(".atlas2-canvas")).boundingBox(); const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  await page.mouse.click(cx, cy); await sleep(400);
  const chip = await page.evaluate(() => { const b = document.querySelector(".atlas2-stack"); return { hidden: b.hidden, text: b.textContent }; });
  const stack1 = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.stack());
  // since 2026-10-17 (the tap rules) a face answers only when a card is about it: Lake Victoria has none, so the tap names the country under it alone — no stack, no chip
  check("a tap on Lake Victoria (no card is about the lake) names the country under it alone: no stack, no chip", stack1.length === 1 && /^adm0:/.test(stack1[0]) && chip.hidden, `${stack1.join(" > ")}; "${chip.text}"`);
  await page.mouse.click(cx, cy); await sleep(300);
  const sel2 = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.selectedId());
  check("a second tap at the same spot keeps the country (there is nothing to cycle to)", sel2 === stack1[0], sel2);
  await page.keyboard.press("Escape"); await sleep(150);
  c = await cardState(page);
  const sel3 = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.selectedId());
  check("Escape closes the card and clears the selection", c.hidden && !c.open && sel3 === null);

  /* ---- Oct 2026, owner decision 3: v1 showed a year's sources on a country; v2 does not (a provenance view is a later phase). What the owner asked instead is that every polity's and people's card NAMES ITS SOURCE ---- */
  console.log("\n\x1b[1m3b) every history entity opens as a card, and every source id has its wording\x1b[0m\n");
  {
    global.window = global; require(path.join(ROOT, "atlas/atlas-format.js"));
    const HH = global.AtlasFormat.read(new Uint8Array(fs.readFileSync(path.join(ROOT, "atlas/data/history.bin"))), { headerOnly: true }).header;
    const have = new Set(HH.sources.map((x) => x.id));
    /* what the card must say for a source id: a row per id in the built file (a new source is a new row — the test fails until it has one, so a card can never go to a reader unattributed) */
    const SAYS = { cliopatria: /Cliopatria/, "hosner-2016": /Hosner/, "osm-land-polygons": /OpenStreetMap/, "folio-authored-extents": /authored extent/i, "ohm-lacedaemon": /OpenHistoricalMap/, "usfs-royce-cessions": /Royce/, "ww2-atlas-control": /Wikimedia Commons/ };
    const LICENCE = /CC BY|ODbL|CC0|public domain/i;
    const ents = HH.entities.filter((e) => e.kind !== "capital");
    const usedSrc = new Set(ents.map((e) => ((e.kind === "people" || e.kind === "culture" || e.kind === "extent" || e.kind === "front") && e.src) || "cliopatria"));
    const unknownSrc = [...usedSrc].filter((id) => !SAYS[id] || !have.has(id));
    check(`every source id the ${ents.length} history entities use is in the file's source list and has an expected wording here`, unknownSrc.length === 0, unknownSrc.join(", ") || [...usedSrc].join(", "));
    await page.evaluate(() => document.querySelector(".atlas2").__atlas2.ensureHistory());
    await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.historyStarted() && c.historyReady(); }, null, { timeout: 180000 });
    // CHANGED 2026-10-19: a card no longer names its source and licence (the popup is its name and its cards); the sources are on #credits. What survives: every entity opens, and its popup holds nothing out of place.
    const bad = [], unreachable = [];
    for (const e of ents) {
      const ok = await page.evaluate((id) => document.querySelector(".atlas2").__atlas2.select(id, { open: true, push: false }), e.id);
      if (!ok) { unreachable.push(e.id); continue; }
      const extras = await page.evaluate(() => document.querySelector(".atlas2-card").querySelectorAll("sup.fn, .src-item, .atlas2-stat, .atlas2-card-desc, .atlas2-card-link, .atlas2-card-facts, .atlas2-card-sources, .atlas2-card-chip, .atlas2-card-kind, details, dl, a[href^='http']").length);
      if (extras) bad.push(e.id);
    }
    check(`all ${ents.length - unreachable.length} entity cards hold only their name and cards (no source line, no facts, no link out)`, bad.length === 0, bad.slice(0, 5).join("; ") || "none");
    check("every history entity can be opened as a card", unreachable.length === 0, unreachable.slice(0, 8).join(", "));
    await page.keyboard.press("Escape"); await sleep(100);
  }

  console.log("\n\x1b[1m4) the phone sheet\x1b[0m\n");
  await page.close();
  const P = await open(await browser.newContext({ viewport: { width: 390, height: 700 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }));
  await P.page.evaluate(() => document.querySelector(".atlas2").__atlas2.select("adm0:fra", { open: true }));
  await waitProse(P.page); await sleep(200);
  /* 2026-10-18: the sheet opens at its PEEK (about 28 % of the frame, the body showing, docked on the frame's bottom edge) — it used to open shut, the title strip
     alone, above the year rail; the grip now goes to the next snap height (half), not "up" */
  const sheet = await P.page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2, el = document.querySelector(".atlas2-card"), r = el.getBoundingClientRect(), host = document.querySelector(".atlas2").getBoundingClientRect(); const grip = el.querySelector(".atlas2-grip"); const g = grip.getBoundingClientRect(); return { snap: c.card().snap, docked: Math.abs(r.bottom - host.bottom) <= 1, width: r.width, hostW: host.width, height: r.height, frameH: c.frame()[1], grip: g.height > 0 && g.width > 0, bodyShown: getComputedStyle(el.querySelector(".atlas2-card-body")).display !== "none", phone: document.querySelector(".atlas2").classList.contains("atlas2-phone") }; });
  check("at 390 px the card is a bottom sheet with a grip, opening at its peek (about 28 % of the frame, docked on its bottom edge, the body showing)", sheet.phone && sheet.docked && sheet.width === sheet.hostW && sheet.grip && sheet.snap === "peek" && sheet.bodyShown && sheet.height >= sheet.frameH * 0.27 && sheet.height <= sheet.frameH * 0.34, JSON.stringify(sheet));
  await P.page.click(".atlas2-grip"); await sleep(400);
  const up = await P.page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2, el = document.querySelector(".atlas2-card"); return { snap: c.card().snap, bodyShown: getComputedStyle(el.querySelector(".atlas2-card-body")).display !== "none", h: el.getBoundingClientRect().height, frameH: c.frame()[1] }; });
  check("the grip raises it to half", up.snap === "half" && up.bodyShown && Math.abs(up.h - up.frameH * 0.5) <= 2, JSON.stringify(up));
  /* Oct 2026, the decluttered phone: the Legend and ? chips are gone from the map (hidden, their handlers kept); one menu button opens a sheet holding the legend
     and the help. The menu button stays while a card sheet is open; a card opening shuts an open menu (one bottom sheet at a time). */
  const legend = await P.page.evaluate(() => { const b = document.querySelector(".atlas2-layers-btn"), m = document.querySelector(".atlas2-menu-btn"); const r = m.getBoundingClientRect(); return { text: b.textContent.trim(), chipShown: getComputedStyle(b.closest(".atlas2-layers")).display !== "none", menuBtn: r.width >= 44 && r.height >= 44 }; });
  check("on a phone the Legend chip is not on the map: one menu button (44 px) stands in its place", legend.text === "Legend" && !legend.chipShown && legend.menuBtn, JSON.stringify(legend));
  await P.page.click(".atlas2-card-close"); await sleep(150);
  await P.page.click(".atlas2-menu-btn"); await sleep(150); await P.page.click('[data-sec="layers"] .atlas2-menu-row'); await sleep(150);
  const sheetOpen = await P.page.evaluate(() => { const s = document.querySelector(".atlas2-sheet"); const r = s.getBoundingClientRect(), m = document.querySelector(".atlas2-menu").getBoundingClientRect(); return { hidden: s.hidden, inMenu: !!s.closest(".atlas2-menu"), inside: r.bottom <= m.bottom + 1 && r.top >= m.top - 1 || s.scrollHeight > 0, density: s.querySelectorAll('[data-layer="density"]').length }; });
  check("…which opens the legend inside the menu's sheet, with the density stops", !sheetOpen.hidden && sheetOpen.inMenu && sheetOpen.density === 3, JSON.stringify(sheetOpen));
  await P.page.evaluate(() => document.querySelector(".atlas2").__atlas2.select("adm0:fra", { open: true })); await sleep(250);
  check("…and a place card opening shuts the menu (one sheet at a time)", await P.page.evaluate(() => document.querySelector(".atlas2-menu").hidden && !document.querySelector(".atlas2-card").hidden));
  check("no page errors on #map (desktop)", errors.length === 0, errors.slice(0, 3).join(" | "));
  check("no page errors on #map (phone)", P.errors.length === 0, P.errors.slice(0, 3).join(" | "));
  await browser.close(); server.close();
  console.log(`\n${pass} ok, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
