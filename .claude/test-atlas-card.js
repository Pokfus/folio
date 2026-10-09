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
  await page.goto(`http://127.0.0.1:${PORT}/#map2`, { waitUntil: "load" });
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
  const bundles = await page.evaluate(() => ({ timeline: typeof window.TIMELINE, info: typeof window.COUNTRY_INFO, cities: typeof window.CITIES, world: typeof window.WORLD }));
  check("the prose came through its own bundle: countries.js loaded, timeline.js not", bundles.info === "object" && bundles.timeline === "undefined", JSON.stringify(bundles));
  const sel = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.selectedId());
  check("the country is the selection", sel === "adm0:fra", sel);
  const hash = await page.evaluate(() => location.hash);
  check("the deep link carries the place", /^#map2\/-?[\d.]+\/-?[\d.]+\/-?[\d.]+\/adm0(%3A|:)fra$/.test(hash), hash);

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

  console.log("\n\x1b[1m4) the phone sheet\x1b[0m\n");
  await page.close();
  const P = await open(await browser.newContext({ viewport: { width: 390, height: 700 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }));
  await P.page.evaluate(() => document.querySelector(".atlas2").__atlas2.select("adm0:fra", { open: true }));
  await waitProse(P.page); await sleep(200);
  const sheet = await P.page.evaluate(() => { const el = document.querySelector(".atlas2-card"), r = el.getBoundingClientRect(), host = document.querySelector(".atlas2").getBoundingClientRect(); const grip = el.querySelector(".atlas2-grip"); const g = grip.getBoundingClientRect(); return { shut: el.classList.contains("atlas2-card-shut"), bottom: Math.abs(r.bottom - host.bottom) < 2, width: r.width, hostW: host.width, height: r.height, grip: g.height > 0 && g.width > 0, bodyShown: getComputedStyle(el.querySelector(".atlas2-card-body")).display !== "none", phone: document.querySelector(".atlas2").classList.contains("atlas2-phone") }; });
  check("at 390 px the card is a bottom sheet with a grip, opening shut", sheet.phone && sheet.bottom && sheet.width === sheet.hostW && sheet.grip && sheet.shut && !sheet.bodyShown, JSON.stringify(sheet));
  await P.page.click(".atlas2-grip"); await sleep(150);
  const up = await P.page.evaluate(() => { const el = document.querySelector(".atlas2-card"); return { shut: el.classList.contains("atlas2-card-shut"), bodyShown: getComputedStyle(el.querySelector(".atlas2-card-body")).display !== "none", h: el.getBoundingClientRect().height }; });
  check("the grip expands it", !up.shut && up.bodyShown && up.h > 200, JSON.stringify(up));
  const legend = await P.page.evaluate(() => { const b = document.querySelector(".atlas2-layers-btn"); return b.textContent.trim(); });
  check("the legend is a chip on a phone", legend === "Legend", legend);
  await P.page.click(".atlas2-layers-btn"); await sleep(100);
  const sheetOpen = await P.page.evaluate(() => { const s = document.querySelector(".atlas2-sheet"); const r = s.getBoundingClientRect(); return { hidden: s.hidden, fixed: getComputedStyle(s).position === "fixed", bottom: Math.abs(r.bottom - innerHeight) < 2, density: s.querySelectorAll('[data-layer="density"]').length }; });
  check("…which opens the legend as a sheet with the density stops", !sheetOpen.hidden && sheetOpen.fixed && sheetOpen.density === 3, JSON.stringify(sheetOpen));
  check("no page errors on #map2 (desktop)", errors.length === 0, errors.slice(0, 3).join(" | "));
  check("no page errors on #map2 (phone)", P.errors.length === 0, P.errors.slice(0, 3).join(" | "));
  await browser.close(); server.close();
  console.log(`\n${pass} ok, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
