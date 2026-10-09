/* test-atlas-a11y.js — the keyboard on Atlas v2 (Phase 1c, the start; docs/atlas-v2-design.md §2.9).

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-a11y.js
     FOLIO_CHROMIUM=/path/to/chrome  … to pick the browser (otherwise playwright's own)

   WHAT IT PROVES (Phase 1c's share of §2.9, then Phase 1d's: the live region that speaks the selection, focus to the
   card's heading and back to its opener, the About dialog's focus, the combobox pattern on the search, no fling and
   an instant fly under prefers-reduced-motion and no CSS transition in the chrome, the forced-colors block, no
   aria-hidden element holding a control, and every control inside the Atlas with the site's text size at 200 %):
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

  /* ---------- Phase 1d: announcements, focus, the combobox, reduced motion, forced colours, text at 200 % ---------- */
  console.log("\n\x1b[1m4) the selection is announced and focus is managed\x1b[0m\n");
  const live = await page.evaluate(() => { const a = document.querySelector(".atlas2-announce"); return a ? { live: a.getAttribute("aria-live"), atomic: a.getAttribute("aria-atomic"), hidden: getComputedStyle(a).width } : null; });
  check("an aria-live region exists for the selection (polite, atomic, visually hidden)", !!live && live.live === "polite" && live.atomic === "true", JSON.stringify(live));
  await page.focus(".atlas2-search-in");
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.select("adm0:fra", { open: true, fly: false }));
  await sleep(300);
  const said = await page.evaluate(() => document.querySelector(".atlas2-announce").textContent);
  check("selecting France speaks \"France, country\"", /^France, country/.test(said), said);
  const focusOnOpen = await page.evaluate(() => document.activeElement === document.querySelector(".atlas2-card-title"));
  check("focus moves to the card's heading when it opens", focusOnOpen);
  await page.keyboard.press("Escape"); await sleep(200);
  const back = await page.evaluate(() => ({ el: document.activeElement && document.activeElement.className, card: document.querySelector(".atlas2").__atlas2.card().open, said: document.querySelector(".atlas2-announce").textContent }));
  check("Escape shuts the card and returns focus to the opener (the search box)", !back.card && /atlas2-search-in/.test(back.el), back.el);
  check("clearing the selection is announced", /Nothing selected/.test(back.said), back.said);
  // the About sheet: focus in, Escape, focus back on its button
  await page.click(".atlas2-about-btn"); await sleep(150);
  const inAbout = await page.evaluate(() => ({ open: !document.querySelector(".atlas2-about").hidden, focusIn: !!document.activeElement.closest(".atlas2-about"), role: document.querySelector(".atlas2-about").getAttribute("role"), labelled: !!document.getElementById(document.querySelector(".atlas2-about").getAttribute("aria-labelledby") || "") }));
  check("the About sheet is a labelled dialog and takes focus", inAbout.open && inAbout.focusIn && inAbout.role === "dialog" && inAbout.labelled, JSON.stringify(inAbout));
  await page.keyboard.press("Escape"); await sleep(150);
  const outAbout = await page.evaluate(() => ({ open: !document.querySelector(".atlas2-about").hidden, focus: document.activeElement.className }));
  check("Escape closes it and focus returns to the ? button", !outAbout.open && /atlas2-about-btn/.test(outAbout.focus), outAbout.focus);

  console.log("\n\x1b[1m5) the search follows the combobox pattern\x1b[0m\n");
  await page.fill(".atlas2-search-in", "par"); await sleep(250);
  const combo = await page.evaluate(() => { const i = document.querySelector(".atlas2-search-in"), l = document.querySelector(".atlas2-results"); return { role: i.getAttribute("role"), expanded: i.getAttribute("aria-expanded"), controls: i.getAttribute("aria-controls") === l.id, auto: i.getAttribute("aria-autocomplete"), active: i.getAttribute("aria-activedescendant"), activeExists: !!document.getElementById(i.getAttribute("aria-activedescendant") || ""), listRole: l.getAttribute("role"), listLabel: l.getAttribute("aria-label"), options: [...l.querySelectorAll("li")].every((o) => o.getAttribute("role") === "option"), selected: l.querySelectorAll('[aria-selected="true"]').length }; });
  check("role=combobox, aria-expanded true while the list shows, aria-controls the listbox, aria-autocomplete list", combo.role === "combobox" && combo.expanded === "true" && combo.controls && combo.auto === "list", JSON.stringify(combo));
  check("aria-activedescendant names the active option, every row is an option, one is selected", !!combo.active && combo.activeExists && combo.options && combo.selected === 1 && combo.listRole === "listbox" && !!combo.listLabel);
  await page.keyboard.press("ArrowDown"); await sleep(50);
  const moved = await page.evaluate(() => document.querySelector(".atlas2-search-in").getAttribute("aria-activedescendant"));
  check("ArrowDown moves aria-activedescendant", moved === "atlas2-opt-1", moved);
  await page.keyboard.press("Escape"); await sleep(100);
  const closed = await page.evaluate(() => ({ expanded: document.querySelector(".atlas2-search-in").getAttribute("aria-expanded"), hidden: document.querySelector(".atlas2-results").hidden, active: document.querySelector(".atlas2-search-in").getAttribute("aria-activedescendant") }));
  check("Escape closes the list: aria-expanded false, no active descendant", closed.expanded === "false" && closed.hidden && !closed.active, JSON.stringify(closed));
  await page.evaluate(() => { const s = document.querySelector(".atlas2-search-in"); s.value = ""; s.dispatchEvent(new Event("input")); s.blur(); });

  console.log("\n\x1b[1m6) reduced motion: no fling, an instant fly, no transition\x1b[0m\n");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await sleep(100);
  const box = await (await page.$(".atlas2-canvas")).boundingBox();
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setView(10, 20, 24)); await sleep(200);
  await page.mouse.move(cx, cy); await page.mouse.down(); for (let i = 1; i <= 8; i++) { await page.mouse.move(cx + i * 25, cy, { steps: 1 }); await sleep(10); } await page.mouse.up();
  await sleep(50);
  const fling = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.input().coasting);
  check("a fast drag does not fling under prefers-reduced-motion", fling === false, "coasting " + fling);
  const flyT = await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; const t0 = performance.now(); c.flyTo(2, 46, 3); return { flying: c.flying(), lon: c.view.lon, ms: performance.now() - t0 }; });
  check("flyTo lands at once under reduced motion", !flyT.flying && Math.abs(flyT.lon - 2) < 0.01, JSON.stringify(flyT));
  // the site keeps its colour transitions (a theme change is not motion); anything that MOVES or fades is what reduced motion forbids
  const transitions = await page.evaluate(() => [...document.querySelectorAll(".atlas2, .atlas2 *")].filter((e) => { const cs = getComputedStyle(e); const props = cs.transitionProperty.split(/,\s*/), durs = cs.transitionDuration.split(/,\s*/); const moving = props.some((p, i) => /^(all|transform|opacity|top|left|right|bottom|width|height|max-height|translate)$/.test(p) && durs[Math.min(i, durs.length - 1)] !== "0s"); return moving || (cs.animationName !== "none" && cs.animationName !== ""); }).map((e) => e.className + ":" + getComputedStyle(e).transitionProperty));
  check("no CSS transition of position, size or opacity and no animation runs in the Atlas under reduced motion", transitions.length === 0, transitions.slice(0, 4).join(", "));
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const css = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
  check("the stylesheet carries a forced-colors block for the Atlas chrome (outlines, system colours)", /@media \(forced-colors:active\)\{[^}]*\.atlas2-canvas:focus-visible\{outline/.test(css.replace(/\s+/g, "")) || /forced-colors:active[\s\S]{0,400}atlas2-canvas:focus-visible/.test(css));
  check("the hidden key list and the announcer are not aria-hidden; no aria-hidden element holds a focusable control", await page.evaluate(() => [...document.querySelectorAll('.atlas2 [aria-hidden="true"]')].every((e) => !e.querySelector("button, input, a, [tabindex]"))));

  console.log("\n\x1b[1m7) text at 200 %: every control reachable\x1b[0m\n");
  await page.evaluate(() => { document.documentElement.style.setProperty("--fs", "2"); document.querySelector(".atlas2").__atlas2.clearSelection(); });
  await sleep(300);
  await page.click(".atlas2-layers-btn"); await sleep(200);
  const big = await page.evaluate(() => { const at = document.querySelector(".atlas2").getBoundingClientRect(); const out = []; for (const e of document.querySelectorAll(".atlas2 button, .atlas2 input, .atlas2 a")) { if (e.closest("[hidden]") || e.closest(".atlas2-keys")) continue; const r = e.getBoundingClientRect(); if (!r.width) continue; out.push({ what: e.className || e.tagName, inside: r.left >= at.left - 1 && r.right <= at.right + 1 && r.top >= at.top - 1 && r.bottom <= at.bottom + 1, scrollable: !!e.closest(".atlas2-sheet") }); } const sheet = document.querySelector("#atlas2-sheet").getBoundingClientRect(); return { out, sheetInside: sheet.bottom <= at.bottom + 1, fs: getComputedStyle(document.querySelector(".atlas2-btn")).fontSize }; });
  const out = big.out.filter((o) => !o.inside && !o.scrollable);
  check("at --fs 2 every control stays inside the Atlas (the legend scrolls inside it)", out.length === 0 && big.sheetInside, `${big.out.length} controls, button font ${big.fs}; outside: ${out.map((o) => o.what).join(", ") || "none"}`);
  await page.evaluate(() => { document.documentElement.style.removeProperty("--fs"); document.querySelector("#atlas2-sheet .atlas2-sheet-close").click(); });

  check("no page errors on #map2", errors.length === 0, errors.slice(0, 3).join(" | "));
  await browser.close(); server.close();
  console.log(`\n${pass} ok, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
