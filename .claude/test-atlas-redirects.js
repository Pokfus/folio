/* test-atlas-redirects.js — every address the Atlas has ever had still lands on it (Atlas v2 Phase 5; docs/atlas-v2-phase5-plan.md §3).

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-redirects.js
     FOLIO_CHROMIUM=/path/to/chrome  … to pick the browser (otherwise playwright's own)

   Before Phase 5 two pages answered to two addresses: v1 at `#map` (and `#map/<year>[/<name-slug>]`, the form readers copied and shared) and the engine at `#map2` (an unlinked preview, with its own
   `#map2/<lon>/<lat>/<zoom>[/<place>][?y=<year>]`). Now the Atlas is `#map`, and this suite opens each old form on a fresh page and asserts:

     · `#map2`, with or without a view, a place and a year, is rewritten in the address bar to the same thing at `#map` (the view, the year and the place intact), without a new history entry;
     · `#map/<year>` and `#map/<year>/<name-slug>` (the four shapes test-layout.js had: france 2026 and 1938, spain, united-states-of-america) open the Atlas at that year and, with a slug, on that place;
     · a slug that names nothing still lands on the Atlas at that year (no card, no error);
     · the new address form `#map/<lon>/<lat>/<zoom>/<place>?y=<year>` is not mistaken for an old one (three numbers after `map/`);
     · `#map2?preview=0` — the way back from the engine — does nothing any more: the engine page loads, and a stored `folio.atlas2.preview` = "0" does not turn the windows' engine off;
     · an old link whose data arrives late (topology.bin held 26 s) still opens its place: the lookup waits for the data, not for a count of tries (the file:// report of Oct 2026);
     · every one of them with no console error. */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream", ".woff2": "font/woff2" };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  " + extra : "")); } };

(async () => {
  await new Promise((r) => server.listen(0, r));
  const base = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch(LAUNCH);

  /* open `hash` on a fresh page (coach marks dismissed), wait for the Atlas, report what it shows */
  async function open(hash, opts) {
    opts = opts || {};
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errs = [];
    page.on("pageerror", (e) => errs.push(String(e.message || e)));
    page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errs.push(m.text().slice(0, 200)); });
    await page.goto(base, { waitUntil: "load" });
    await page.evaluate((extra) => { try { localStorage.setItem("folio_atlas_tour_v1", "1"); localStorage.setItem("folio_mine_tour_v1", "1"); for (const k in extra) localStorage.setItem(k, extra[k]); } catch (e) {} }, opts.storage || {});
    const hist0 = await page.evaluate(() => history.length);
    await page.goto(base + hash, { waitUntil: "load" });
    await page.waitForSelector('.atlas2[data-ready="1"]', { timeout: 90000 }).catch(() => {});
    if (opts.card) await page.waitForFunction(() => { const c = document.querySelector(".atlas2-card"); return c && !c.hidden && ((c.querySelector(".atlas2-card-title") || {}).textContent || "").trim(); }, null, { timeout: 60000 }).catch(() => {});
    else await page.waitForTimeout(1500);
    const s = await page.evaluate(() => {
      const a = document.querySelector(".atlas2"), c = a && a.__atlas2, card = document.querySelector(".atlas2-card");
      return { hash: location.hash, atlas: !!a, ready: !!a && a.getAttribute("data-ready") === "1", year: c ? c.year() : null, lon: c ? c.view.lon : null, lat: c ? c.view.lat : null, card: !!card && !card.hidden, title: card && !card.hidden ? ((card.querySelector(".atlas2-card-title") || {}).textContent || "") : "", hist: history.length };
    });
    s.hist0 = hist0; s.errs = errs;
    await page.close();
    return s;
  }
  const clean = (s) => s.errs.length === 0;

  /* ---- 1. #map2 is #map ---- */
  console.log("\n1. #map2 is rewritten to #map");
  {
    const s = await open("#map2");
    check("#map2 opens the Atlas", s.atlas && s.ready, JSON.stringify({ atlas: s.atlas, ready: s.ready }));
    check("...and the address bar says #map", /^#map(\/|\?|$)/.test(s.hash) && !/map2/.test(s.hash), s.hash);
    check("...with no console error", clean(s), s.errs.join(" | "));
  }
  {
    const s = await open("#map2/10/20/3?y=1500");
    check("#map2 with a view and a year keeps both", s.atlas && Math.abs(s.lon - 10) < 0.5 && Math.abs(s.lat - 20) < 0.5 && s.year === 1500, JSON.stringify({ lon: s.lon, lat: s.lat, year: s.year }));
    check("...and is written back as #map/10.00/20.00/3.00?y=1500", s.hash === "#map/10.00/20.00/3.00?y=1500", s.hash);
    check("...in the same history entry (no extra step for Back to undo)", s.hist - s.hist0 <= 1, s.hist0 + " -> " + s.hist);
    check("...with no console error", clean(s), s.errs.join(" | "));
  }
  {
    const s = await open("#map2/2.35/48.86/5.00/adm0:fra", { card: true });
    check("#map2 with a place opens that place's card", s.card && /fran|french/i.test(s.title), JSON.stringify({ card: s.card, title: s.title }));
    check("...and the address is #map/…/adm0:fra", /^#map\/[\d.]+\/[\d.]+\/[\d.]+\/adm0(:|%3A)fra/.test(s.hash), s.hash);
    check("...with no console error", clean(s), s.errs.join(" | "));
  }

  /* ---- 2. v1's #map/<year>[/<slug>] ---- */
  console.log("\n2. an old #map/<year>/<name> link");
  for (const [hash, year, name] of [["#map/2026/france", 2026, /fran|french/i], ["#map/1938/france", 1938, /fran|french/i], ["#map/2026/spain", 2026, /spain/i], ["#map/2026/united-states-of-america", 2026, /united states/i]]) {
    const s = await open(hash, { card: true });
    check(hash + " opens the Atlas on that place", s.atlas && s.card && name.test(s.title), JSON.stringify({ card: s.card, title: s.title }));
    check("...at that year", s.year === year, String(s.year));
    check("...and is rewritten to the new address form", /^#map\/-?[\d.]+\/-?[\d.]+\/-?[\d.]+\//.test(s.hash), s.hash);
    check("...with no console error", clean(s), s.errs.join(" | "));
  }
  {
    const s = await open("#map/1500");
    check("#map/<year> alone opens the Atlas at that year, no card", s.atlas && s.year === 1500 && !s.card, JSON.stringify({ year: s.year, card: s.card }));
    check("...with no console error", clean(s), s.errs.join(" | "));
  }
  {
    const s = await open("#map/1938/no-such-place-anywhere");
    check("a slug that names nothing still lands on the Atlas at that year", s.atlas && s.ready && s.year === 1938 && !s.card, JSON.stringify({ ready: s.ready, year: s.year, card: s.card }));
    check("...with no console error", clean(s), s.errs.join(" | "));
  }

  /* ---- 3. the new form is not an old one ---- */
  console.log("\n3. the new form");
  {
    const s = await open("#map/2.35/48.86/5.00/adm0:fra?y=1914", { card: true });
    check("#map/<lon>/<lat>/<zoom>/<place>?y=<year> opens the place", s.card && /fran|french/i.test(s.title), JSON.stringify({ card: s.card, title: s.title }));
    check("...at that year, not read as an old link (a year of 2.35)", s.year === 1914, String(s.year));
    check("...with no console error", clean(s), s.errs.join(" | "));
  }

  /* ---- 4. the preview switch is gone ---- */
  console.log("\n4. the way back is gone");
  {
    const s = await open("#map2?preview=0", { storage: { "folio.atlas2.preview": "0" } });
    check("#map2?preview=0 opens the Atlas anyway (there is no v1 to go back to)", s.atlas && s.ready, JSON.stringify({ atlas: s.atlas, ready: s.ready }));
    check("...and the address bar says #map", /^#map(\/|\?|$)/.test(s.hash) && !/map2/.test(s.hash), s.hash);
    check("...with no console error", clean(s), s.errs.join(" | "));
  }
  {
    // the switch is not read anywhere any more (a stored "0" used to turn the card windows' engine off)
    check("app.js no longer reads folio.atlas2.preview", !/folio\.atlas2\.preview/.test(fs.readFileSync(path.join(ROOT, "app.js"), "latin1")));
    check("...nor does the engine's own page", !/folio\.atlas2\.preview/.test(fs.readFileSync(path.join(ROOT, "atlas", "atlas.js"), "utf8")));
    check("...nor atlas-windows.js", !/folio\.atlas2\.preview/.test(fs.readFileSync(path.join(ROOT, "atlas", "atlas-windows.js"), "utf8")));
  }

  /* ---- 5. an old link opens its place however late the data is (Oct 2026, owner's file:// report) ---- */
  console.log("\n5. an old link waits for slow data (topology.bin held 26 s)");
  {
    /* `#map/1/Rome` opened the year and not the place from a file:// copy. Root cause: the lookup waited for the Atlas to be ready in 200 tries of 100 ms and gave up silently, and a main-thread shim on a slow device
       is ready much later (a CPU slowed 8× opens the link after 90 s). Held here on http so the cause, not the file, is what is tested; test-atlas-fallbacks.js opens the same link from a file. */
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errs = [];
    page.on("pageerror", (e) => errs.push(String(e.message || e)));
    page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errs.push(m.text().slice(0, 200)); });
    await page.route("**/atlas/data/topology.bin", async (route) => { await new Promise((r) => setTimeout(r, 26000)); try { await route.continue(); } catch (e) { /* the page closed */ } });
    await page.goto(base, { waitUntil: "load" });
    await page.evaluate(() => { try { localStorage.setItem("folio_atlas_tour_v1", "1"); localStorage.setItem("folio_mine_tour_v1", "1"); } catch (e) {} });
    await page.goto(base + "#map/1/Rome", { waitUntil: "load" });
    const got = await page.waitForFunction(() => { const a = document.querySelector(".atlas2"), c = a && a.__atlas2; return c && c.selectedId() ? { id: c.selectedId(), title: c.card().title, year: c.year() } : false; }, null, { timeout: 150000 }).then((h) => h.jsonValue(), () => null);
    check("#map/1/Rome opens the place although the data arrives 26 s after the page (the wait used to end at about 20 s)", !!got && /rome/i.test(got.title) && got.year === 1, JSON.stringify(got));
    check("...with no console error", errs.length === 0, errs.join(" | "));
    await page.close();
  }

  await browser.close(); server.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
