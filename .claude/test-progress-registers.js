/* test-progress-registers.js — a reader who had explored with v1 loses no mark to the swap (Atlas v2 Phase 5, owner decision 4; docs/atlas-v2-phase5-plan.md §5).

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-progress-registers.js
     FOLIO_CHROMIUM=/path/to/chrome  … to pick the browser (otherwise playwright's own)

   v1 recorded a place in `placesSeen` under the name of its panel; for 55 present-day countries that name is not the new Atlas's (atlas/data/country-names.js `v1` maps old → new: "S. Sudan" → "South Sudan"). The
   boot migration (`atlasPlacesSeenMigrate` in app.js) ADDS the new key with the old key's first-seen time, keeps the old key (an older tab or another device still reads it), never removes or rewrites anything,
   never pushes the register over SEEN_CAP, and is idempotent. A reader is seeded here with every old spelling, historical territories, a glossary register and a spread of other progress fields, then the page is
   booted twice. Asserted:

     · every seeded `placesSeen` key is still there with the SAME timestamp, and every one of the 55 new names is there with its old name's timestamp;
     · `glossSeen` and every other progress field are byte-identical after the boots (the migration touches `placesSeen` and nothing else);
     · the second boot changes nothing (idempotent), and a register 1 below SEEN_CAP gains exactly one key, one AT the cap gains none;
     · `PROGRESS_FIELDS` is the list sync has always PATCHed (no field added or dropped by the swap) and `placesSeen` / `glossSeen` are in it;
     · the countries meter counts a reader who had seen every country under v1's names as having seen every country;
     · no console error. */
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

/* the truth: the table the migration reads, and the field list sync has always sent (pinned here on purpose: a field added to or dropped from this list is a change to sync and needs its own decision) */
global.window = {}; require(path.join(ROOT, "atlas", "data", "country-names.js"));
const C = global.window.ATLAS_COUNTRIES, V1 = C.v1;
const PINNED_FIELDS = ["cards", "suspended", "buried", "flags", "notes", "handoff", "daily", "chrono", "games", "intro", "deckOpts", "deckDay", "confused", "pretest", "orderPicked", "reviewLog", "reviewDay", "studyTime", "studyTotal", "streak", "active", "deckOrder", "deckGroups", "deckNest", "cotd", "achievements", "glossSeen", "placesSeen", "gameLog", "reading", "bookFavs", "collAdded", "artefacts", "chests", "levelChests", "showcase", "sweepChest", "playChest", "streakChest", "chestsOpened", "themes", "published", "publishedIds", "theme", "friendCount"];

(async () => {
  await new Promise((r) => server.listen(0, r));
  const base = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch(LAUNCH);
  const oldNames = Object.keys(V1);
  check("the table maps 55 old spellings to new names (the audit's figure)", oldNames.length === 55, String(oldNames.length));

  /* a reader: every old spelling seen, the other countries, two historical territories, glossary terms, and other progress of every shape */
  const T0 = 1750000000000;
  const placesSeen = {}; let i = 0;
  for (const o of oldNames) placesSeen[o] = T0 + 1000 * i++;
  for (const n of C.countries.map((c) => c[0]).slice(0, 40)) if (!(n in placesSeen)) placesSeen[n] = T0 + 1000 * i++;
  placesSeen["Kingdom of Prussia"] = T0 + 5; placesSeen["Ottoman Empire"] = T0 + 6;
  const other = {
    glossSeen: { Feudalism: T0 + 1, Mercantilism: T0 + 2, Satrap: T0 + 3 },
    cards: { "wh-001": { due: 1, s: 4.2, d: 5.1, r: 3, l: 0, rep: 2, last: T0 } },
    streak: { n: 7, best: 12, last: "2026-10-13" },
    daily: { "2026-10-13": { done: 3 } },
    games: { chrono: { date: "2026-10-13", played: true, won: true } },
    studyTotal: 12345,
    flags: { "wh-001": 1 },
  };
  const settings = { sfx: false, home: "Narnia" };   // merged over the defaults on load, so asserted key by key rather than byte for byte
  const seed = Object.assign({}, other, { placesSeen, settings });

  async function boot(stateObj, hash, wait) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errs = [];
    page.on("pageerror", (e) => errs.push(String(e.message || e)));
    page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errs.push(m.text().slice(0, 200)); });
    await page.goto(base, { waitUntil: "load" });
    if (stateObj) await page.evaluate((s) => { localStorage.setItem("folio_v1", JSON.stringify(s)); localStorage.setItem("folio_atlas_tour_v1", "1"); localStorage.setItem("folio_mine_tour_v1", "1"); }, stateObj);
    await page.goto(base + (hash || "#account"), { waitUntil: "load" });
    await page.reload({ waitUntil: "load" });
    await page.waitForFunction(() => !!window.ATLAS_COUNTRIES, null, { timeout: 90000 }).catch(() => {});
    await page.waitForTimeout(wait || 2500);
    const out = await page.evaluate(() => ({ stored: JSON.parse(localStorage.getItem("folio_v1") || "{}"), loaded: !!window.ATLAS_COUNTRIES }));
    out.errs = errs;
    await page.close();
    return out;
  }
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  /* ---- 1. a seeded reader, first boot ---- */
  console.log("\n1. a seeded reader keeps every mark");
  const one = await boot(seed, "#map");
  check("the new Atlas loads country-names.js on its own", one.loaded);
  const ps1 = one.stored.placesSeen || {};
  const lostOld = Object.keys(placesSeen).filter((k) => ps1[k] !== placesSeen[k]);
  check("every seeded place is still there with the same time", lostOld.length === 0, lostOld.slice(0, 5).join(", "));
  /* a new name the reader already had (Bosnia and Herzegovina is among the first forty seeded) keeps ITS time: the migration never rewrites a key that exists */
  const want = (o) => (V1[o] in placesSeen ? placesSeen[V1[o]] : placesSeen[o]);
  const missingNew = oldNames.filter((o) => ps1[V1[o]] !== want(o));
  check("...and each of the 55 new names is there with its old name's time (or its own, where the reader already had it)", missingNew.length === 0, missingNew.slice(0, 5).map((o) => o + " → " + V1[o]).join(", "));
  const extra = Object.keys(ps1).filter((k) => !(k in placesSeen) && !oldNames.some((o) => V1[o] === k));
  check("...and nothing else was added", extra.length === 0, extra.slice(0, 5).join(", "));
  const changed = Object.keys(other).filter((k) => !same(one.stored[k], other[k]));
  check("glossSeen and every other progress field are byte-identical", changed.length === 0, changed.join(", "));
  check("the register's own count is the seeded one plus the 55", Object.keys(ps1).length === Object.keys(placesSeen).length + oldNames.filter((o) => !(V1[o] in placesSeen)).length, String(Object.keys(ps1).length));
  check("...settings the reader chose are kept", one.stored.settings && one.stored.settings.sfx === false && one.stored.settings.home === "Narnia", JSON.stringify(one.stored.settings && { sfx: one.stored.settings.sfx, home: one.stored.settings.home }));
  check("no console error", one.errs.length === 0, one.errs.join(" | "));

  /* ---- 2. a second boot changes nothing ---- */
  console.log("\n2. idempotent");
  const two = await boot(one.stored, "#map");
  check("a second boot leaves placesSeen exactly as it was", same(two.stored.placesSeen, ps1));
  check("...and every other field", Object.keys(other).every((k) => same(two.stored[k], other[k])));
  check("no console error", two.errs.length === 0, two.errs.join(" | "));

  /* ---- 3. the cap ---- */
  console.log("\n3. SEEN_CAP");
  const cap = 9000;
  const junk = (n) => { const o = {}; for (let k = 0; k < n; k++) o["Nowhere " + k] = T0 + k; return o; };
  const two_old = oldNames.slice(0, 2);
  const atCap = Object.assign(junk(cap - 2), { [two_old[0]]: T0, [two_old[1]]: T0 + 1 });
  const rA = await boot({ placesSeen: atCap }, "#map");
  const nA = Object.keys(rA.stored.placesSeen || {}).length;
  check("a register AT the cap gains nothing and loses nothing", nA === cap && Object.keys(atCap).every((k) => rA.stored.placesSeen[k] === atCap[k]), String(nA));
  const belowCap = Object.assign(junk(cap - 3), { [two_old[0]]: T0, [two_old[1]]: T0 + 1 });
  const rB = await boot({ placesSeen: belowCap }, "#map");
  const nB = Object.keys(rB.stored.placesSeen || {}).length;
  check("one place BELOW the cap gains exactly one key (the cap is not passed)", nB === cap && Object.keys(belowCap).every((k) => rB.stored.placesSeen[k] === belowCap[k]), String(nB));
  check("no console error", rA.errs.length === 0 && rB.errs.length === 0, rA.errs.concat(rB.errs).join(" | "));

  /* ---- 4. sync's field list and the meter ---- */
  console.log("\n4. sync is unchanged, and the meter counts the old spellings");
  const src = fs.readFileSync(path.join(ROOT, "app.js"), "latin1");
  const m = /const PROGRESS_FIELDS = (\[[^\]]*\])/.exec(src);
  const fields = m ? JSON.parse(m[1]) : null;
  check("PROGRESS_FIELDS is the list sync has always sent", !!fields && same(fields, PINNED_FIELDS), fields ? fields.filter((f) => !PINNED_FIELDS.includes(f)).concat(PINNED_FIELDS.filter((f) => !fields.includes(f))).join(", ") : "not found");
  check("...with placesSeen and glossSeen in it", !!fields && fields.includes("placesSeen") && fields.includes("glossSeen"));
  const full = {}; oldNames.forEach((o, k) => (full[o] = T0 + k)); C.countries.map((c) => c[0]).forEach((n) => { if (!oldNames.some((o) => V1[o] === n) && !(n in full)) full[n] = T0; });
  const meter = await (async () => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(base, { waitUntil: "load" });
    await page.evaluate((s) => localStorage.setItem("folio_v1", JSON.stringify(s)), { placesSeen: full });
    await page.goto(base + "#map", { waitUntil: "load" });
    await page.reload({ waitUntil: "load" });
    await page.waitForFunction(() => !!window.ATLAS_COUNTRIES, null, { timeout: 90000 }).catch(() => {});
    await page.waitForTimeout(2500);
    const r = await page.evaluate(() => { const st = JSON.parse(localStorage.getItem("folio_v1") || "{}").placesSeen || {}, C = window.ATLAS_COUNTRIES; return { names: C.countries.length, seen: C.countries.map((c) => c[0]).filter((n) => n in st).length }; });
    await page.close();
    return r;
  })();
  check("a reader who had seen every country under v1's spellings has seen every country", meter.names > 200 && meter.seen === meter.names, JSON.stringify(meter));

  await browser.close(); server.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
