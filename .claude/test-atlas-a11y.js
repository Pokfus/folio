/* test-atlas-a11y.js — the keyboard on Atlas v2 (Phase 1c, the start; docs/atlas-v2-design.md §2.9).

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-a11y.js
     FOLIO_CHROMIUM=/path/to/chrome  … to pick the browser (otherwise playwright's own)

   WHAT IT PROVES (Phase 1c's share of §2.9; announcements and the reduced-motion audit are Phase 1d):
     · a VISUALLY HIDDEN LIST OF BUTTONS mirrors the visible labels in rank order, at most 60, each named
       "<place>, <kind>", so Tab walks the names on the map;
     · Tab from the globe reaches the first of them, Enter opens the place's card, the focused label draws a
       ring on the label layer, Escape clears the selection and shuts the card;
     · the list is refreshed by a layout without losing the focused button;
     · the search box, the legend's controls and the card's close button are reachable and labelled;
     · the globe keeps its role and name, and the hidden list stays out of sight (1 px, clipped).
*/
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream" };
const PORT = 5619;
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch(LAUNCH);
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  await page.goto(`http://127.0.0.1:${PORT}/#map2`, { waitUntil: "load" });
  await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 120000 });
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.waterSettled() && c.labelsReady(); }, null, { timeout: 120000 });
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setView(10, 50, 3));
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.tilesSettled(); }, null, { timeout: 120000 });
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.layoutNow()); await sleep(100);

  console.log("\n\x1b[1m1) the hidden list mirrors the labels\x1b[0m\n");
  const list = await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; const placed = c.labels().filter((p) => p.text).slice().sort((a, b) => a.score - b.score).map((p) => p.id); const btns = [...document.querySelectorAll(".atlas2-keys button")]; const box = document.querySelector(".atlas2-keys").getBoundingClientRect(); return { placed, btns: btns.map((b) => ({ id: b.getAttribute("data-id"), text: b.textContent })), w: box.width, h: box.height, clip: getComputedStyle(document.querySelector(".atlas2-keys")).clip }; });
  check("one button per visible label in rank order, at most 60", list.btns.length === Math.min(60, list.placed.length) && list.btns.every((b, i) => b.id === list.placed[i]), `${list.btns.length} buttons for ${list.placed.length} labels`);
  check('each button is named "<place>, <kind>"', list.btns.every((b) => /^.+, .+$/.test(b.text)), list.btns.slice(0, 2).map((b) => b.text).join(" | "));
  check("the list is visually hidden (1 px, clipped)", list.w <= 1 && list.h <= 1, `${list.w}×${list.h} ${list.clip}`);

  console.log("\n\x1b[1m2) Tab, Enter, Escape\x1b[0m\n");
  await page.focus(".atlas2-canvas");
  const globe = await page.evaluate(() => { const c = document.querySelector(".atlas2-canvas"); return { role: c.getAttribute("role"), label: c.getAttribute("aria-label") }; });
  check("the globe has a role and a name", globe.role === "application" && /globe/i.test(globe.label), globe.label);
  // Tab walks the controls after the globe until it reaches the first place button
  let reached = null;
  for (let i = 0; i < 12 && !reached; i++) {
    await page.keyboard.press("Tab"); await sleep(30);
    reached = await page.evaluate(() => { const a = document.activeElement; return a && a.closest(".atlas2-keys") ? a.getAttribute("data-id") : null; });
  }
  check("Tab reaches the first place button", !!reached && reached === list.btns[0].id, reached);
  const ring = await page.evaluate(() => { const c = document.querySelector(".atlas2-labels"), x = c.getContext("2d"); const d = x.getImageData(0, 0, c.width, c.height).data; let indigo = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200 && d[i] < 90 && d[i + 1] < 110 && d[i + 2] > 130) indigo++; return indigo; });
  check("the focused label draws a focus ring on the label layer", ring > 40, ring + " ring pixels");
  await page.keyboard.press("Enter"); await sleep(200);
  const opened = await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; return { sel: c.selectedId(), card: c.card() }; });
  check("Enter opens the place's card", opened.sel === list.btns[0].id && opened.card.open && opened.card.id === list.btns[0].id, opened.card.title);
  // a layout keeps the focused button
  await page.focus(`.atlas2-keys button[data-id="${list.btns[1].id.replace(/"/g, '\\"')}"]`);
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.layoutNow()); await sleep(100);
  const kept = await page.evaluate(() => { const a = document.activeElement; return a && a.closest(".atlas2-keys") ? a.getAttribute("data-id") : null; });
  check("a new layout keeps the focused button", kept === list.btns[1].id, kept);
  await page.keyboard.press("Escape"); await sleep(150);
  const cleared = await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; return { sel: c.selectedId(), card: c.card().open, focus: document.activeElement === document.querySelector(".atlas2-canvas") }; });
  check("Escape clears the selection, shuts the card and returns focus to the globe", cleared.sel === null && !cleared.card && cleared.focus, JSON.stringify(cleared));

  console.log("\n\x1b[1m3) the controls are reachable and labelled\x1b[0m\n");
  const ctl = await page.evaluate(() => ({ search: document.querySelector(".atlas2-search-in").getAttribute("aria-label"), combobox: document.querySelector(".atlas2-search-in").getAttribute("role"), legendBtn: document.querySelector(".atlas2-layers-btn").getAttribute("aria-controls"), close: document.querySelector(".atlas2-card-close").getAttribute("aria-label"), grip: document.querySelector(".atlas2-grip").getAttribute("aria-label"), strength: document.querySelector('[data-layer="strength"]').getAttribute("aria-label"), density: [...document.querySelectorAll('[data-layer="density"]')].every((r) => r.closest("label") && r.closest("label").textContent.trim()) }));
  check("the search box is a labelled combobox", ctl.search && ctl.combobox === "combobox", ctl.search);
  check("the legend button controls its sheet; the card's close and grip are labelled; the slider and the density stops too", ctl.legendBtn === "atlas2-sheet" && ctl.close && ctl.grip && ctl.strength && ctl.density);
  check("no page errors on #map2", errors.length === 0, errors.slice(0, 3).join(" | "));
  await browser.close(); server.close();
  console.log(`\n${pass} ok, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
