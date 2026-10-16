/* test-atlas-card.js — the place card of Atlas v2 (Phase 1c; docs/atlas-v2-design.md §1.5, §2.8).

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-card.js
     FOLIO_CHROMIUM=/path/to/chrome  … to pick the browser (otherwise playwright's own)

   WHAT IT PROVES:
     · a COUNTRY card (France, picked through the gazetteer) carries the official name as its title (v1's
       officialName rule: "French Republic"), a description with WIRED footnotes — every `sup.fn` numbered and
       pointing at an entry of the sources list — a figures grid of four tiles, and NO sentence that quotes a
       figure the grid shows (v1's stripInfoNoise); the prose came through the lazy `atlas2prose` bundle
       (countries.js and its siblings) and NOT through v1's `atlas` bundle: window.TIMELINE stays undefined;
     · a RIVER card (the Danube) shows its kind, its Wikipedia link from the gazetteer's sitelink, and nothing
       invented: no figures grid, no description;
     · a country WITHOUT a prose entry says so rather than inventing one;
     · the PHONE SHEET: at 390 px the card is a bottom sheet with a grip that opens SHUT (the title strip
       alone), expands on the grip, and the legend is a chip that opens a sheet;
     · Escape closes the card and clears the selection; the stack chip reads "N here" where two places share
       a tap (Lake Victoria over Uganda) and a second tap cycles.
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
const cardState = (page) => page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; const el = document.querySelector(".atlas2-card"), body = el.querySelector(".atlas2-card-body"); return Object.assign(c.card(), { hidden: el.hidden, kind: el.querySelector(".atlas2-card-kind").textContent, text: body.textContent, html: body.innerHTML, fn: [...body.querySelectorAll("sup.fn")].map((s) => s.textContent), items: body.querySelectorAll(".src-item").length, stats: body.querySelectorAll(".atlas2-stat").length, desc: (body.querySelector(".atlas2-card-desc") || {}).textContent || "", wiki: (body.querySelector(".atlas2-card-link a") || {}).href || "", within: (body.querySelector(".atlas2-card-within") || {}).textContent || "" }); });
const waitProse = (page) => page.waitForFunction(() => !document.querySelector(".atlas2-card-loading"), null, { timeout: 60000 }).catch(() => {});

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch(LAUNCH);
  const { page, errors } = await open(await browser.newContext({ viewport: { width: 1280, height: 800 } }));

  console.log("\n\x1b[1m1) a country card\x1b[0m\n");
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.select("adm0:fra", { open: true }));
  await waitProse(page); await sleep(150);
  let c = await cardState(page);
  check("the card is open on France", c.open && c.id === "adm0:fra" && !c.hidden, c.title);
  check("its title is the official name (v1's rule)", /French Republic/i.test(c.title), c.title);
  check("its kind line says Country", /^Country/.test(c.kind), c.kind);
  check("the description is there and carries footnote markers", c.desc.length > 200 && c.fn.length >= 3, `${c.desc.length} chars, markers ${c.fn.join(",")}`);
  check("every marker is numbered and points at a listed source", c.fn.length > 0 && c.fn.every((t) => /^\d+$/.test(t) && Number(t) >= 1 && Number(t) <= c.items), `${c.items} sources`);
  check("a figures grid of four tiles", c.stats === 4);
  const grid = /[$€£]\s?\d|\d[\d.,]*\s*(?:million|billion|trillion)\b|\d[\d.,]*\s*(?:km²|km2|sq\.?\s?mi|square\s?kilomet)/i;
  check("no sentence of the description quotes a grid figure", !grid.test(c.desc), (c.desc.match(grid) || [""])[0]);
  check("a Wikipedia link from the gazetteer's sitelink", /^https:\/\/en\.wikipedia\.org\/wiki\//.test(c.wiki), c.wiki);
  // app.js assigns an empty window.TIMELINE at boot (applyAdminEdits); timeline.js is what fills it, and cities.js (the same v1 bundle) what defines CITIES
  const bundles = await page.evaluate(() => ({ timelineEras: Array.isArray(window.TIMELINE) ? window.TIMELINE.length : (window.TIMELINE === undefined ? 0 : -1), info: typeof window.COUNTRY_INFO, cities: typeof window.CITIES, uk: typeof window.UK }));
  check("the prose came through its own bundle: countries.js loaded, timeline.js and cities.js not", bundles.info === "object" && bundles.timelineEras === 0 && bundles.cities === "undefined", JSON.stringify(bundles));
  const sel = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.selectedId());
  check("the country is the selection", sel === "adm0:fra", sel);
  const hash = await page.evaluate(() => location.hash);
  check("the deep link carries the place", /^#map\/-?[\d.]+\/-?[\d.]+\/-?[\d.]+\/adm0(%3A|:)fra(\?y=-?\d+)?$/.test(hash), hash);

  console.log("\n\x1b[1m2) a river card, and a country without prose\x1b[0m\n");
  const danube = await page.evaluate(() => { const g = document.querySelector(".atlas2").__atlas2.gazetteer(); const r = g.rows.find((x) => x.kind === "river" && x.name === "Danube"); return r ? r.id : null; });
  await page.evaluate((id) => document.querySelector(".atlas2").__atlas2.select(id, { open: true }), danube);
  await sleep(150);
  c = await cardState(page);
  check("the Danube's card: title, kind River", c.title === "Danube" && /^River/.test(c.kind), c.kind);
  check("a Wikipedia link, no figures grid, no description", /en\.wikipedia\.org\/wiki\/Danube/.test(c.wiki) && c.stats === 0 && !c.desc, c.wiki);
  const noProse = await page.evaluate(() => { const g = document.querySelector(".atlas2").__atlas2.gazetteer(); const r = g.rows.find((x) => x.kind === "country" && !x.v1); return r ? r.id : null; });
  if (noProse) {
    await page.evaluate((id) => document.querySelector(".atlas2").__atlas2.select(id, { open: true }), noProse);
    await waitProse(page); await sleep(150);
    c = await cardState(page);
    check(`a country without a prose entry (${noProse}) says so`, /No description for/.test(c.text) && c.fn.length === 0, c.text.slice(0, 80));
  }

  console.log("\n\x1b[1m3) the stack chip, Escape\x1b[0m\n");
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setView(33.06, -1.26, 3));
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.tilesSettled() && c.waterSettled(); }, null, { timeout: 120000 });
  await sleep(300);
  const box = await (await page.$(".atlas2-canvas")).boundingBox(); const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  await page.mouse.click(cx, cy); await sleep(400);
  const chip = await page.evaluate(() => { const b = document.querySelector(".atlas2-stack"); return { hidden: b.hidden, text: b.textContent }; });
  const stack1 = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.stack());
  check("a tap on Lake Victoria stacks the lake and a country, and the chip says so", stack1.length >= 2 && /^lake:/.test(stack1[0]) && !chip.hidden && /^\d+ here/.test(chip.text), `${stack1.join(" > ")}; "${chip.text}"`);
  await page.mouse.click(cx, cy); await sleep(300);
  const sel2 = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.selectedId());
  check("a second tap at the same spot cycles to the next of the stack", sel2 === stack1[1], sel2);
  await page.keyboard.press("Escape"); await sleep(150);
  c = await cardState(page);
  const sel3 = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.selectedId());
  check("Escape closes the card and clears the selection", c.hidden && !c.open && sel3 === null);

  /* ---- Oct 2026, owner decision 3: v1 showed a year's sources on a country; v2 does not (a provenance view is a later phase). What the owner asked instead is that every polity's and people's card NAMES ITS SOURCE ---- */
  console.log("\n\x1b[1m3b) every polity, people, culture, extent and front card names its source\x1b[0m\n");
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
    const bad = [], unreachable = [];
    const byKind = {};
    for (const e of ents) {
      const ok = await page.evaluate((id) => document.querySelector(".atlas2").__atlas2.select(id, { open: true, push: false }), e.id);
      if (!ok) { unreachable.push(e.id); continue; }
      await page.waitForFunction((id) => { const c = document.querySelector(".atlas2").__atlas2; return c.card().id === id; }, e.id, { timeout: 10000 }).catch(() => {});
      const text = await page.evaluate(() => document.querySelector(".atlas2-card-body").textContent.replace(/\s+/g, " "));
      const src = ((e.kind === "people" || e.kind === "culture" || e.kind === "extent" || e.kind === "front") && e.src) || "cliopatria";
      const named = SAYS[src] && SAYS[src].test(text), licensed = e.kind === "extent" || e.kind === "front" || LICENCE.test(text);
      byKind[e.kind] = (byKind[e.kind] || 0) + 1;
      if (!named || !licensed) bad.push(`${e.id} (${e.kind}, ${src}${named ? "" : ", source not named"}${licensed ? "" : ", no licence"})`);
    }
    check(`all ${ents.length - unreachable.length} entity cards name their source (${Object.entries(byKind).map(([k, n]) => n + " " + k).join(", ")}); polities, peoples and cultures also say its licence`, bad.length === 0, bad.slice(0, 5).join("; ") || "none missing");
    check("every history entity can be opened as a card", unreachable.length === 0, unreachable.slice(0, 8).join(", "));
    await page.keyboard.press("Escape"); await sleep(100);
  }

  console.log("\n\x1b[1m4) the phone sheet\x1b[0m\n");
  await page.close();
  const P = await open(await browser.newContext({ viewport: { width: 390, height: 700 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }));
  await P.page.evaluate(() => document.querySelector(".atlas2").__atlas2.select("adm0:fra", { open: true }));
  await waitProse(P.page); await sleep(200);
  const sheet = await P.page.evaluate(() => { const el = document.querySelector(".atlas2-card"), r = el.getBoundingClientRect(), host = document.querySelector(".atlas2").getBoundingClientRect(); const grip = el.querySelector(".atlas2-grip"); const g = grip.getBoundingClientRect(); return { shut: el.classList.contains("atlas2-card-shut"), bottom: (() => { const rail = document.querySelector(".atlas2-rail").getBoundingClientRect(); return r.bottom <= rail.top + 1 && rail.top - r.bottom < 16; })(), width: r.width, hostW: host.width, height: r.height, grip: g.height > 0 && g.width > 0, bodyShown: getComputedStyle(el.querySelector(".atlas2-card-body")).display !== "none", phone: document.querySelector(".atlas2").classList.contains("atlas2-phone") }; });
  check("at 390 px the card is a bottom sheet with a grip, opening shut (sitting on the rail since Phase 2a)", sheet.phone && sheet.bottom && sheet.width === sheet.hostW && sheet.grip && sheet.shut && !sheet.bodyShown, JSON.stringify(sheet));
  await P.page.click(".atlas2-grip"); await sleep(150);
  const up = await P.page.evaluate(() => { const el = document.querySelector(".atlas2-card"); return { shut: el.classList.contains("atlas2-card-shut"), bodyShown: getComputedStyle(el.querySelector(".atlas2-card-body")).display !== "none", h: el.getBoundingClientRect().height }; });
  check("the grip expands it", !up.shut && up.bodyShown && up.h > 200, JSON.stringify(up));
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
