/* test-atlas-no-wars.js — THE ATLAS PAGE (#map) DRAWS NO WAR (2026-10-19, the owner: "for the foreseeable future, remove wars from the Atlas. They should only be shown, with their green and red
   overlays, in the relevant card Atlas windows").

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-no-wars.js [--report]

   THE READER IT BUILDS: one who studied two war cards (the Second Punic War, rm-209; the Second World War, ww2-001), whose legend still has Wars "On everywhere" and the front line on from before
   (the saved layers `folio_atlas2_layers_v2` carry `wars: "on", fronts: true`), opened in Cannae's year (216 BCE) and in 1942, and on an address that still carries `&war=rm-209`.

   WHAT IT PROVES
     1  on the wire: a cold load of #map, the Personal, the Map and the Full Atlas in 216 BCE and 1942, and a deep link with `&war=` fetch no war file — not atlas/data/wars.js, not
        atlas/data/history-wars.bin or its twin (`--report` prints the bytes the page fetched)
     2  on the pixels: no war tint — in 216 BCE the ground of Latium and of Carthage is the plain neutral land (no green victor, no red loser: the chroma of the pixel stays under 12 of 255) in all
        three modes; in November 1942 the ground of Moscow and Kyiv is as neutral too (no Allied green, no Axis red, no occupied tint), and the engine's own report says no war and no front is shown
     3  in the Legend: no Wars switch, no front-line switch, no key of victors, losers or washes, no "open a war from a card" sentence; no front stepper in the page; the saved layers lose their `wars`
        and `fronts` the first time the legend is saved
     4  the address `#map/12/38.5/6.00?y=-216&war=rm-209` still opens the Atlas at that view and year (old links never break) and draws no war
   Re-run after touching a war path of atlas.js or the legend. */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const REPORT = process.argv.includes("--report");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream" };
const PORT = 5671;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  — " + extra : "")); } };

const served = [];   // every file the server was asked for
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } served.push({ p, bytes: data.length }); res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});
const WAR_FILE = /\/atlas\/data\/(wars\.js|history-wars\.bin(\.js)?)$/;
const warBytes = () => served.filter((s) => WAR_FILE.test(s.p));

const READER = ["rm-209", "ww2-001"];
const seed = `try { if (!localStorage.getItem("folio_v1_seeded")) { localStorage.setItem("folio_v1", JSON.stringify({ cards: Object.fromEntries(${JSON.stringify(READER)}.map((id) => [id, { due: Date.now() + 9e8, ivl: 9, ease: 2.5, status: "review", reps: 2, first: "2026-08-01" }])), settings: { newPerDay: 5 } })); localStorage.setItem("folio_v1_seeded", "1"); }
  localStorage.setItem("folio_tour_v1", "1"); localStorage.setItem("folio_atlas_tour_v1", "1");
  if (!localStorage.getItem("folio_layers_seeded")) { localStorage.setItem("folio_atlas2_layers_v2", JSON.stringify({ borders: true, provinces: true, countries: false, places: false, physical: false, cities: false, rivers: false, lakes: false, relief: false, strength: 0.7, graticule: false, density: "normal", peoples: "linked", wars: "on", fronts: true })); localStorage.setItem("folio_layers_seeded", "1"); } } catch (e) {}`;

const A = (page, fn, arg) => page.evaluate(`(() => { const c = document.querySelector(".atlas2").__atlas2; return (${fn.toString()})(c, ${JSON.stringify(arg === undefined ? null : arg)}); })()`);
const settle = (page) => page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.tilesSettled() && c.waterSettled() && c.historySettled(); }, null, { timeout: 120000 }).then(() => true, () => false);
async function viewAt(page, lon, lat, kmpp, year) {
  await A(page, (c, v) => { c.setView(v[0], v[1], v[2]); c.setYear(v[3]); }, [lon, lat, kmpp, year]);
  await settle(page); await sleep(500);
}
const pixelAtLonLat = (page, lon, lat) => A(page, (c, p) => { const v = c.view, lo = p[0] * Math.PI / 180, la = p[1] * Math.PI / 180; const w = [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)], m = v.rot; const x = v.cx + v.radius * (m[0] * w[0] + m[1] * w[1] + m[2] * w[2]), y = v.cy - v.radius * (m[3] * w[0] + m[4] * w[1] + m[5] * w[2]); return c.pixelAt(x, y); }, [lon, lat]);
const chroma = (c) => Math.max(c[0], c[1], c[2]) - Math.min(c[0], c[1], c[2]);

async function open(browser, hash) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript(seed);
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  await page.goto(`http://127.0.0.1:${PORT}/${hash || "#map"}`, { waitUntil: "load" });
  await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 120000 });
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.waterSettled() && c.labelsReady() && c.study.ready(); }, null, { timeout: 120000 });
  return { ctx, page, errors };
}

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch(LAUNCH);
  const { ctx, page, errors } = await open(browser);
  const stored0 = await page.evaluate(() => localStorage.getItem("folio_atlas2_layers_v2"));
  console.log("\n\x1b[1m1) the reader: two war cards studied, Wars \"On everywhere\" and the front line saved on\x1b[0m\n");
  check("the Personal Atlas is on, with the war cards studied", (await A(page, (c) => c.study.mode())) === "personal" && (await A(page, (c) => c.study.flags().length)) > 0, "saved layers: " + stored0.replace(/.*"(wars":"?\w+"?).*/, "$1"));

  console.log("\n\x1b[1m2) the pixels: Cannae in the Personal, Map and Full Atlas, and the Eastern Front in 1942\x1b[0m\n");
  const modes = [];
  for (const mode of ["personal", "map", "full"]) {
    await A(page, (c, m) => c.study.setMode(m), mode); await settle(page);
    await viewAt(page, 12, 38.5, 6, -216);
    const rome = await pixelAtLonLat(page, 12.5, 41.9), carth = await pixelAtLonLat(page, 10.2, 35.9);
    const w = await A(page, (c) => ({ wars: c.wars(), fronts: c.fronts() }));
    modes.push([mode, rome, carth]);
    check(`216 BCE, ${mode}: Latium and the Carthaginian homeland are neutral ground — no green victor, no red loser (chroma ${chroma(rome)} and ${chroma(carth)} of 255, rgb ${rome.slice(0, 3)} / ${carth.slice(0, 3)})`, chroma(rome) < 12 && chroma(carth) < 12 && w.wars.shown.length === 0 && w.wars.roles.length === 0 && w.wars.tinted === 0 && !w.wars.ready, JSON.stringify([w.wars.shown, w.wars.roles.length, w.wars.ready]));
  }
  await A(page, (c, m) => c.study.setMode(m), "map"); await settle(page);
  await viewAt(page, 40, 52, 12, 1942);
  const moscow = await pixelAtLonLat(page, 37.6, 55.75), kyiv = await pixelAtLonLat(page, 30.5, 50.45), berlin = await pixelAtLonLat(page, 13.4, 52.5);
  const f = await A(page, (c) => c.fronts());
  check(`1942: Moscow, Kyiv and Berlin are neutral ground — no Allied green, no occupied tint, no Axis red (chroma ${chroma(moscow)}, ${chroma(kyiv)}, ${chroma(berlin)})`, chroma(moscow) < 12 && chroma(kyiv) < 12 && chroma(berlin) < 12 && f.shown.length === 0 && f.drawn.length === 0, JSON.stringify([f.shown.length, f.drawn.length, f.visible]));

  console.log("\n\x1b[1m3) the Legend and the page\x1b[0m\n");
  await page.evaluate(() => document.querySelector(".atlas2-layers-btn").click()); await sleep(300);
  const sheet = await page.evaluate(() => { const s = document.querySelector(".atlas2-sheet"); return { text: s.textContent.replace(/\s+/g, " "), wars: s.querySelectorAll(".atlas2-wars, [data-layer=wars], [data-layer=fronts], .atlas2-wars-key, .atlas2-wars-sw").length, stepper: document.querySelectorAll(".atlas2-front, .atlas2-front-prev, .atlas2-front-next").length, layerKeys: [...s.querySelectorAll("[data-layer]")].map((i) => i.getAttribute("data-layer")) }; });
  check("the Legend has no Wars switch, no front-line switch and no key of victors, losers, washes or the front", sheet.wars === 0 && !/\bWars\b|front line|Victors|Losers|authored extent|Axis-held|Allied-held|open a war|not tinted/i.test(sheet.text), `${sheet.layerKeys.join(",")}`);
  check("the page has no front-line stepper", sheet.stepper === 0, String(sheet.stepper));
  await page.evaluate(() => { const i = document.querySelector('.atlas2-sheet [data-layer="graticule"]'); i.click(); i.click(); }); await sleep(200);
  const stored = JSON.parse(await page.evaluate(() => localStorage.getItem("folio_atlas2_layers_v2")));
  check("the saved layers lose `wars` and `fronts` the first time the Legend is used", !("wars" in stored) && !("fronts" in stored), Object.keys(stored).join(","));
  check("no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  await ctx.close();

  console.log("\n\x1b[1m4) an old address that carries &war=\x1b[0m\n");
  {
    const o = await open(browser, "#map/12/38.5/6.00?y=-216&war=rm-209");
    await settle(o.page); await sleep(600);
    const st = await A(o.page, (c) => ({ year: c.timeInfo().year, wars: c.wars(), lon: c.view.lon, hash: location.hash }));
    check("the Atlas opens at that view and year (the address stays valid) and draws no war", st.year === -216 && Math.abs(st.lon - 12) < 0.5 && st.wars.shown.length === 0 && st.wars.focus === null && !/war=/.test(st.hash), JSON.stringify([st.year, st.lon, st.wars.focus, st.hash]));
    check("no page errors", o.errors.length === 0, o.errors.slice(0, 3).join(" | "));
    await o.ctx.close();
  }

  console.log("\n\x1b[1m5) the wire\x1b[0m\n");
  const wb = warBytes();
  check("no war file was fetched by any of the loads above (wars.js, history-wars.bin, history-wars.bin.js)", wb.length === 0, wb.length ? wb.map((s) => s.p + " " + s.bytes).join(", ") : "none");
  if (REPORT) { console.log(`\n  files served in all: ${served.length}, ${served.reduce((a, b) => a + b.bytes, 0)} bytes; war files: ${wb.length ? wb.map((s) => s.p + " " + s.bytes + " B").join(", ") : "none"}`); }
  await browser.close(); server.close();
  console.log(`\n${pass} ok, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
