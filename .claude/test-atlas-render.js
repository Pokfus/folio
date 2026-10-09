/* test-atlas-render.js — the ID pass names the right place (Atlas v2, Phase 1c; docs/atlas-v2-design.md §2.11).

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-render.js
     FOLIO_CHROMIUM=/path/to/chrome  … to pick the browser (otherwise playwright's own)

   WHAT IT PROVES. A tap on #map2 is answered by two reads of a 1×1 ID framebuffer (atlas-gl.js pick: the
   faces pass, then the water pass) and stacked by atlas.js; nothing here is point-in-polygon code, so the
   only way to know the answer is right is to ask at points whose answer is known from OUTSIDE the build:

     · 42 admin-0 capitals of Natural Earth 10m populated places (PD; name, ADM0_A3, lon, lat copied from
       the shapefile's own table on 2026-10-09, not written from memory), each at three zooms — the globe
       (24 km/px), a country view (3 km/px) and a city view (0.5 km/px, the first tile level) — must return
       that capital's country as the country of the stack (the admin-1 unit, where the country has them, sits
       above it); the faces pass's answer is read through the controller's stackAt, which is what a tap uses;
     · the interior points of the great lakes that check-water.js takes from Natural Earth 10m lakes (PD)
       must return the LAKE and, under it, the country the lake lies in: Lake Victoria returns the lake and
       Uganda, Tanzania or Kenya; Baikal the lake and Russia; Superior the lake and the United States or Canada;
     · a point in the open ocean returns a sea or an ocean and nothing else (the nearest sea label, §1.5);
     · a point on the Danube within 8 CSS px of its line at 1 km/px returns the river in its stack.
   The stack is asserted through `__atlas2.stackAt(x, y)`, which runs exactly what a tap runs.
*/
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream" };
const PORT = 5615;
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});

/* Natural Earth 10m populated places 5.1.2 (PD): NAME, ADM0_A3, LONGITUDE, LATITUDE of 42 admin-0 capitals,
   copied from ne_10m_populated_places.dbf on 2026-10-09 (four decimals). Inland capitals were preferred so a
   half-pixel of coast is never the question; the coastal ones (Jakarta, Lima, Buenos Aires…) sit well inside
   their country at every zoom used here. */
const CAPITALS = [["Madrid", "ESP", -3.6853, 40.402], ["Paris", "FRA", 2.3314, 48.8686], ["Berlin", "DEU", 13.3996, 52.5238], ["Warsaw", "POL", 20.9981, 52.2519], ["Moscow", "RUS", 37.6136, 55.7541], ["Ankara", "TUR", 32.8624, 39.9292], ["Tehran", "IRN", 51.4224, 35.6739], ["Riyadh", "SAU", 46.7708, 24.6428], ["New Delhi", "IND", 77.2, 28.6], ["Beijing", "CHN", 116.3863, 39.9308], ["Ulaanbaatar", "MNG", 106.9147, 47.9186], ["Bangkok", "THA", 100.5147, 13.7519], ["Hanoi", "VNM", 105.8481, 21.0353], ["Kuala Lumpur", "MYS", 101.698, 3.1686], ["Jakarta", "IDN", 106.8275, -6.1725], ["Canberra", "AUS", 149.129, -35.283], ["Nairobi", "KEN", 36.8147, -1.2814], ["Addis Ababa", "ETH", 38.6981, 9.0353], ["Khartoum", "SDN", 32.5322, 15.59], ["Cairo", "EGY", 31.248, 30.0519], ["Niamey", "NER", 2.1147, 13.5187], ["Bamako", "MLI", -8.002, 12.652], ["Abuja", "NGA", 7.5314, 9.0853], ["Kinshasa", "COD", 15.313, -4.3278], ["Lusaka", "ZMB", 28.2814, -15.4147], ["Pretoria", "ZAF", 28.2275, -25.705], ["Antananarivo", "MDG", 47.5147, -18.9147], ["Ottawa", "CAN", -75.702, 45.4186], ["Mexico City", "MEX", -99.1329, 19.4444], ["Bogota", "COL", -74.0853, 4.5984], ["Lima", "PER", -77.052, -12.0461], ["Santiago", "CHL", -70.669, -33.4481], ["Buenos Aires", "ARG", -58.3995, -34.6006], ["La Paz", "BOL", -68.1519, -16.496], ["Kabul", "AFG", 69.1813, 34.5186], ["Islamabad", "PAK", 73.1647, 33.7019], ["Kyiv", "UKR", 30.5147, 50.4353], ["Minsk", "BLR", 27.5647, 53.9019], ["Budapest", "HUN", 19.0814, 47.502], ["Bern", "CHE", 7.467, 46.9167], ["Vienna", "AUT", 16.3647, 48.202], ["Prague", "CZE", 14.464, 50.0853]];
/* interior points of Natural Earth 10m lakes (PD), as check-water.js computes them from the shapefile; the
   country alternatives are the states whose shores the lake touches */
const LAKES = [["Lake Victoria", 33.06, -1.26, "lake:16", ["adm0:uga", "adm0:tza", "adm0:ken"]], ["Lake Baikal", 107.98, 53.67, "lake:11", ["adm0:rus"]], ["Lake Superior", -87.66, 47.64, "lake:5", ["adm0:usa", "adm0:can"]], ["Lake Tanganyika", 29.67, -6.46, null, ["adm0:cod", "adm0:tza", "adm0:bdi", "adm0:zmb"]], ["Great Bear Lake", -120.54, 66.01, "lake:2", ["adm0:can"]]];
const OCEAN = [["mid-Atlantic", -30, 25], ["South Pacific", -140, -30], ["Indian Ocean", 80, -30]];
const ZOOMS = [24, 3, 0.5];

let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch(LAUNCH);
  const page = await browser.newPage({ viewport: { width: 1100, height: 760 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  await page.goto(`http://127.0.0.1:${PORT}/#map2`, { waitUntil: "load" });
  await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 120000 });
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setLayers({ rivers: true, lakes: true, relief: false }));
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.waterSettled() && c.gazetteer().ready; }, null, { timeout: 120000 });
  const settle = () => page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.tilesSettled() && c.waterSettled(); }, null, { timeout: 120000 }).then(() => true, () => false);
  // the stack at the point of the viewport where (lon, lat) lands once the view is centred there
  async function stackAtPlace(lon, lat, kmpp) {
    await page.evaluate((v) => document.querySelector(".atlas2").__atlas2.setView(v.lon, v.lat, v.k), { lon, lat, k: kmpp });
    await settle(); await sleep(80);
    await page.evaluate(() => document.querySelector(".atlas2").__atlas2.invalidate()); await sleep(60);
    return page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; return c.stackAt(c.view.cx, c.view.cy); });
  }
  const countryOf = (stack) => stack.find((id) => /^adm0:/.test(id)) || null;

  console.log("\n\x1b[1mcapitals: the country of the stack at three zooms\x1b[0m\n");
  const wrong = [];
  for (const k of ZOOMS) {
    let right = 0;
    for (const [name, a3, lon, lat] of CAPITALS) {
      const stack = await stackAtPlace(lon, lat, k);
      const got = countryOf(stack);
      if (got === "adm0:" + a3.toLowerCase()) right++; else wrong.push(`${name} at ${k} km/px → ${stack.join(" > ") || "nothing"}`);
    }
    check(`${k} km/px: ${right} of ${CAPITALS.length} capitals in their own country`, right === CAPITALS.length, wrong.slice(-3).join("; "));
  }
  if (wrong.length) console.log("    wrong: " + wrong.join("\n           "));
  // the admin-1 unit sits above its country where the country has them
  const us = await stackAtPlace(-97.74, 30.27, 3);   // Austin, Texas (NE: -97.7431, 30.2672)
  check("a point in Texas stacks the state above the country", us[0] === "adm1:usa:us-tx" && us[1] === "adm0:usa", us.join(" > "));

  console.log("\n\x1b[1mlakes, the open ocean, a river\x1b[0m\n");
  for (const [name, lon, lat, id, countries] of LAKES) {
    const stack = await stackAtPlace(lon, lat, 3);
    const lake = stack.find((x) => /^lake:/.test(x)), ctry = countryOf(stack);
    check(`${name} at 3 km/px: a lake, then its country`, !!lake && (!id || lake === id) && countries.includes(ctry), stack.join(" > "));
  }
  for (const [name, lon, lat] of OCEAN) {
    const stack = await stackAtPlace(lon, lat, 24);
    check(`${name}: a sea or ocean alone`, stack.length === 1 && /^sea:/.test(stack[0]), stack.join(" > "));
  }
  {
    // the Danube at Vienna: NE 10m rivers' line passes the city; 1 km/px, the view centred on the line's own vertex
    const G = await page.evaluate(() => { const g = document.querySelector(".atlas2").__atlas2.gazetteer(); const r = g.rows.find((x) => x.kind === "river" && x.name === "Danube"); return r ? { id: r.id, at: r.at } : null; });
    check("the Danube is in the gazetteer", !!G, G && G.id);
    if (G) {
      const stack = await stackAtPlace(G.at[0], G.at[1], 1);
      check("a tap on the Danube's midpoint at 1 km/px stacks the river", stack.includes(G.id), stack.join(" > "));
      // 6 px beside the line still picks it; 30 px away does not
      const near = await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; return c.stackAt(c.view.cx + 6, c.view.cy); });
      const far = await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; return c.stackAt(c.view.cx + 60, c.view.cy + 60); });
      check("6 px beside the line picks it", near.includes(G.id), near.join(" > "));
      check("60 px away does not", !far.includes(G.id), far.join(" > "));
    }
  }
  check("no page errors on #map2", errors.length === 0, errors.slice(0, 3).join(" | "));
  await browser.close(); server.close();
  console.log(`\n${pass} ok, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
