/* test-atlas-search.js — the search box and the deep links of Atlas v2 (Phase 1c; docs/atlas-v2-design.md §2.8, §2.9).

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-search.js
     FOLIO_CHROMIUM=/path/to/chrome  … to pick the browser (otherwise playwright's own)

   WHAT IT PROVES:
     · typing matches by DIACRITIC-FOLDED prefix first, then substring, over names and aliases: "zur" finds
       Zürich, "Zürich" finds it too, "parana" finds the Paraná, "ngland" finds England by substring;
     · results carry a KIND CHIP; ArrowDown moves the active option; Enter FLIES to the place (an eased move;
       instant under prefers-reduced-motion), selects it and opens its card;
     · DEEP LINKS: #map2/<lon>/<lat>/<zoom>/<place> is parsed at load — the view lands there and the place
       opens; the hash is rewritten with replaceState on settle and pushed on a selection; Back restores the
       previous place; #map2?perf keeps the overlay; v1's #map route is untouched.
*/
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream" };
const PORT = 5618;
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function open(context, hash) {
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  await page.goto(`http://127.0.0.1:${PORT}/${hash}`, { waitUntil: "load" });
  await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 120000 });
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.gazetteer().ready && c.labelsReady(); }, null, { timeout: 120000 });
  return { page, errors };
}
const results = (page) => page.evaluate(() => [...document.querySelectorAll(".atlas2-results li")].map((li) => ({ name: li.querySelector(".atlas2-res-name").textContent, chip: li.querySelector(".atlas2-chip").textContent, active: li.classList.contains("active") })));

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch(LAUNCH);
  const { page, errors } = await open(await browser.newContext({ viewport: { width: 1280, height: 800 } }), "#map2");

  console.log("\n\x1b[1m1) matching\x1b[0m\n");
  await page.fill(".atlas2-search-in", "zur"); await sleep(80);
  let r = await results(page);
  check('"zur" finds Zürich by folded prefix, with a kind chip', r.some((x) => /^Z[uü]rich$/.test(x.name)) && r.every((x) => x.chip), r.slice(0, 3).map((x) => x.name + " [" + x.chip + "]").join(", "));
  await page.fill(".atlas2-search-in", "Zürich"); await sleep(80);
  r = await results(page);
  check('"Zürich" with its umlaut finds it too', r.some((x) => /^Z[uü]rich$/.test(x.name)), r.slice(0, 2).map((x) => x.name).join(", "));
  await page.fill(".atlas2-search-in", "parana"); await sleep(80);
  r = await results(page);
  check('"parana" finds the Paraná', r.some((x) => /^Paran[aá]/.test(x.name)), r.slice(0, 3).map((x) => x.name).join(", "));
  await page.fill(".atlas2-search-in", "ngland"); await sleep(80);
  r = await results(page);
  check('"ngland" finds England by substring', r.some((x) => x.name === "England"), r.slice(0, 3).map((x) => x.name).join(", "));
  await page.fill(".atlas2-search-in", "fra"); await sleep(80);
  r = await results(page);
  check('"fra": France first (a country outranks a town), the first option active', r[0] && r[0].name === "France" && r[0].active, r.slice(0, 3).map((x) => x.name).join(", "));
  await page.keyboard.press("ArrowDown"); await sleep(40);
  r = await results(page);
  check("ArrowDown moves the active option", r[1] && r[1].active && !r[0].active, r.filter((x) => x.active).map((x) => x.name).join(","));
  await page.keyboard.press("ArrowUp"); await sleep(40);

  console.log("\n\x1b[1m2) Enter flies to the place, selects it and opens its card\x1b[0m\n");
  const before = await page.evaluate(() => ({ lon: document.querySelector(".atlas2").__atlas2.view.lon, lat: document.querySelector(".atlas2").__atlas2.view.lat }));
  await page.keyboard.press("Enter"); await sleep(120);
  const mid = await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; return { flying: c.flying(), lon: c.view.lon }; });
  check("the move is eased (still flying 120 ms in)", mid.flying, `lon ${before.lon.toFixed(1)} → ${mid.lon.toFixed(1)}`);
  await page.waitForFunction(() => !document.querySelector(".atlas2").__atlas2.flying(), null, { timeout: 5000 });
  await page.waitForFunction(() => !document.querySelector(".atlas2-card-loading"), null, { timeout: 60000 }).catch(() => {});
  await sleep(200);
  const after = await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; return { lon: c.view.lon, lat: c.view.lat, k: c.kmPerPx(), sel: c.selectedId(), card: c.card() }; });
  check("it lands on France, selected, card open", Math.abs(after.lon - 2.2) < 4 && Math.abs(after.lat - 46.6) < 4 && after.sel === "adm0:fra" && after.card.open && after.card.id === "adm0:fra", `${after.lon.toFixed(1)}, ${after.lat.toFixed(1)} at ${after.k.toFixed(2)} km/px; ${after.card.title}`);
  const hash1 = await page.evaluate(() => location.hash);
  check("the hash carries the view and the place", /^#map2\/-?[\d.]+\/-?[\d.]+\/[\d.]+\/adm0(%3A|:)fra(\?y=-?\d+)?$/.test(hash1), hash1);

  console.log("\n\x1b[1m3) deep links\x1b[0m\n");
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.select("adm0:deu", { open: true })); await sleep(200);
  const hash2 = await page.evaluate(() => location.hash);
  check("a selection pushes a new entry", /adm0(%3A|:)deu(\?y=-?\d+)?$/.test(hash2), hash2);
  await page.goBack(); await sleep(400);
  const back = await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; return { sel: c.selectedId(), hash: location.hash, card: c.card().id }; });
  check("Back restores the previous place", back.sel === "adm0:fra" && back.card === "adm0:fra", back.hash);
  await page.goForward(); await sleep(400);
  const fwd = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.selectedId());
  check("Forward restores the next", fwd === "adm0:deu", fwd);
  const P2 = await open(browser.contexts()[0], "#map2/139.69/35.69/9/city:1159151479");
  await sleep(300);
  const link = await P2.page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; return { lon: c.view.lon, lat: c.view.lat, z: c.statsNow().zoomLevel }; });
  check("a deep link sets the view at load", Math.abs(link.lon - 139.69) < 0.05 && Math.abs(link.lat - 35.69) < 0.05 && Math.abs(link.z - 9) < 0.1, JSON.stringify(link));
  await P2.page.close();
  const P3 = await open(browser.contexts()[0], "#map2/2.5/46.6/5/adm0:fra");
  await P3.page.waitForFunction(() => document.querySelector(".atlas2").__atlas2.selectedId() === "adm0:fra", null, { timeout: 30000 }).catch(() => {});
  const p3 = await P3.page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; return { sel: c.selectedId(), card: c.card().open }; });
  check("…and opens the place it names", p3.sel === "adm0:fra" && p3.card, JSON.stringify(p3));
  await P3.page.close();
  const P4 = await open(browser.contexts()[0], "#map2?perf");
  const perf = await P4.page.evaluate(() => !document.querySelector(".atlas2-perf").hidden);
  await P4.page.evaluate(() => document.querySelector(".atlas2").__atlas2.setView(10, 50, 3)); await sleep(500);
  const hash4 = await P4.page.evaluate(() => location.hash);
  check("#map2?perf keeps the overlay, and the settle writes the view with ?perf kept", perf && /^#map2\/10\.00\/50\.00\/[\d.]+\?(y=-?\d+&)?perf$/.test(hash4), hash4);
  await P4.page.close();
  const v1 = await browser.contexts()[0].newPage();
  await v1.goto(`http://127.0.0.1:${PORT}/#map`, { waitUntil: "load" });
  const g = await v1.waitForSelector("#globe", { timeout: 90000 }).then(() => true, () => false);
  check("v1's #map still renders its globe", g);
  await v1.close();

  console.log("\n\x1b[1m4) reduced motion: an instant move\x1b[0m\n");
  const rm = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
  const R = await open(rm, "#map2");
  await R.page.fill(".atlas2-search-in", "Japan"); await sleep(80); await R.page.keyboard.press("Enter"); await sleep(50);
  const inst = await R.page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; return { flying: c.flying(), lon: c.view.lon, sel: c.selectedId() }; });
  check("under prefers-reduced-motion the view jumps and the place is selected at once", !inst.flying && Math.abs(inst.lon - 138) < 6 && inst.sel === "adm0:jpn", JSON.stringify(inst));
  check("no page errors", errors.length === 0 && R.errors.length === 0, errors.concat(R.errors).slice(0, 3).join(" | "));
  await browser.close(); server.close();
  console.log(`\n${pass} ok, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
