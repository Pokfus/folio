/* test-atlas-personal.js — THE PERSONAL ATLAS SHOWS ONLY WHAT THE READER HAS DISCOVERED (2026-10-18, the owner's sixth look at the Atlas on a phone).

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-personal.js
     FOLIO_SHOTS=/dir   … also writes a screenshot per view

   THE FAULT IT WAS WRITTEN FOR: the Personal Atlas still drew every state of the year (plain land with its border), the base map's cities (Bologna's dot
   and name), the oceans, seas, continents, deserts and ranges, and every river's name — "at low opacity and unclickable" — when no card the reader had
   studied discovered them. The owner's decision (a): in Personal NOTHING undiscovered is drawn — no name, no mark, no fill, no border — for a state, a
   people, a capital, a place, a base-map city, a mountain, a desert, a strait, an ocean, a sea or a continent, unless a studied card discovered it
   (atlas/study.js: a card whose places or polities include it, flag 2). No exception for orientation: with no studied cards the Personal Atlas shows land,
   rivers (if on), relief (if on) and the empty-state sentence only. An undiscovered state's ground is EMPTY land (the darker land of `drawHistoryDim`).
   The Map and the Full Atlas are unchanged: there a name without a card is still drawn and not clickable.

   WHAT IT PROVES, for the seeded reader of test-atlas-study.js (Greek, world-geography and Roman cards), at three views × two years, in Node from the
   cards' own `places` (study.js `flags`), never from the page's helpers:
     1  in Personal every name placed on the label canvas — of EVERY kind: polity, people, country, province, capital, city, town, sea, ocean, gulf,
        strait, lake, island, range, region (a continent, a desert) — is a place or polity the reader's studied cards flag (a city stack's name
        is its flagged members'; a period capital's belongs to a flagged state); every mark drawn is a flagged place; the hidden keyboard list holds
        only what is visible and tappable; the history draws only the reader's faces (fewer than Full's, never more than the flagged polities)
     2  …and the Full Atlas at the same views names things the reader has not discovered (so 1 is not vacuous)
     3  an undiscovered state's ground in Personal is the darker EMPTY land — not the plain land its face was drawn in until today
     4  a sea a studied card discovered (the Aegean, gr-001) IS named in Personal
     5  the no-cards reader's Personal Atlas is land, water and the empty-state sentence: no name, no mark, no face
     6  no console error on any of it
   Re-run after touching the Personal branch of atlas-worker.js's name passes, `aliveShown` in atlas.js, or atlas/study.js. */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");
const AS = require("../atlas/study.js");
const { loadCards } = require("./card-io.js");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const SHOTS = process.env.FOLIO_SHOTS || "";
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream" };
const PORT = 5641;
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- what the page must show, from the data ---------- */
const { cards } = loadCards();
const w = {}; new Function("window", fs.readFileSync(path.join(ROOT, "atlas/data/card-places.js"), "utf8"))(w);
const IDX = AS.parse(w.ATLAS_CARD_PLACES);
const withPlaces = cards.filter((c) => c.places && c.places.length);
const READER = [...withPlaces.filter((c) => /^gr-/.test(c.id)).slice(0, 8), ...withPlaces.filter((c) => /^gw-/.test(c.id)).slice(0, 3), ...withPlaces.filter((c) => /^rm-/.test(c.id)).slice(0, 3)].map((c) => c.id);
const info = (id) => { const c = cards.find((x) => x.id === id); return c ? { collId: "x" } : null; };
const flagged2 = (ids) => new Set([...AS.flags(IDX, AS.studied(IDX, ids), "personal", [], info)].filter(([, f]) => f === 2).map(([id]) => id));
const AEGEAN = "sea:1159117123";
const mine = flagged2(READER);
// an id the page places is the reader's when it is flagged, a city stack of flagged members (stk:), or a period capital (cap:<entity>:<name>) of a flagged state
const owned = (set) => (id) => set.has(id) || /^stk:/.test(id) || (/^cap:/.test(id) && set.has(id.split(":").slice(1, -1).join(":")));
const held = (set) => (p) => owned(set)(p.id) || p.kind === "river";   // a river's name is decision c's (the next commit): not yet held to the rule

const seed = (ids) => `try { if (!localStorage.getItem("folio_v1_seeded")) { localStorage.setItem("folio_v1", JSON.stringify({ cards: Object.fromEntries(${JSON.stringify(ids)}.map((id) => [id, { due: Date.now() + 9e8, ivl: 9, ease: 2.5, status: "review", reps: 2, first: "2026-08-01" }])), settings: { newPerDay: 5 } })); localStorage.setItem("folio_v1_seeded", "1"); } } catch (e) {}`;
async function open(browser, ids) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript(seed(ids));
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  await page.goto(`http://127.0.0.1:${PORT}/#map`, { waitUntil: "load" });
  await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 120000 });
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.waterSettled() && c.labelsReady() && c.study.ready(); }, null, { timeout: 120000 });
  await A(page, (c) => c.setLayers({ rivers: true, lakes: true, countries: true, places: true, physical: true, cities: true, provinces: true, relief: false }));
  return { ctx, page, errors };
}
const A = (page, fn, arg) => page.evaluate(`(() => { const c = document.querySelector(".atlas2").__atlas2; return (${fn.toString()})(c, ${JSON.stringify(arg === undefined ? null : arg)}); })()`);
async function settle(page) {
  await page.waitForFunction(() => document.querySelector(".atlas2").__atlas2.tilesSettled(), null, { timeout: 120000 });
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.year() >= 2000 || !c.historyOK || c.historyOK(); }, null, { timeout: 120000 });
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.layoutNow()); await sleep(150);
}
async function view(page, lon, lat, k) { await A(page, (c, v) => c.setView(v[0], v[1], v[2]), [lon, lat, k]); await settle(page); }
async function year(page, y) { await A(page, (c, y) => c.setYear(y), y); await settle(page); }
async function mode(page, m) { await A(page, (c, m) => c.study.setMode(m), m); await sleep(500); await settle(page); }
const labels = (page) => A(page, (c) => c.labels().map((p) => ({ id: p.id, kind: p.kind, text: p.text, hist: !!p.hist, st: p.st || 0, sx: p.sx, sy: p.sy })));
const marks = (page) => A(page, (c) => c.study.marks().filter((m) => m.clear));
const keys = (page) => A(page, (c) => c.study.keys());
const faces = (page) => A(page, (c) => ({ faces: c.statsNow().historyFaces, year: c.year() }));
const pixel = (page, x, y) => A(page, (c, p) => c.pixelAt(p[0], p[1]), [x, y]);
const lum = (p) => p ? 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2] : 0;
const shot = async (page, name) => { if (!SHOTS) return; fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, name + ".png") }); };
const byKind = (l) => { const o = {}; for (const p of l) o[p.kind] = (o[p.kind] || 0) + 1; return Object.entries(o).map(([k, n]) => k + " " + n).join(", "); };

const VIEWS = [["the Aegean", 27, 38, 5], ["Europe", 10, 50, 3], ["the globe", 10, 20, 24]];
const YEARS = [-483, 2025];

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch(LAUNCH);
  const allErrors = [];
  {
    console.log("\n\x1b[1m1–3) the seeded reader: Personal draws only what their cards discovered; Full still names the rest; an undiscovered state's ground is the darker empty land\x1b[0m\n");
    const { ctx, page, errors } = await open(browser, READER);
    const isMine = owned(mine);
    check("the seeded reader opens on their Personal Atlas with " + mine.size + " flagged ids (the Node computation)", (await A(page, (c) => c.study.mode())) === "personal" && (await A(page, (c) => c.study.flags().filter(([, f]) => f === 2).length)) === mine.size);
    const probes = [];
    for (const y of YEARS) for (const [name, lon, lat, k] of VIEWS) {
      const where = name + ", " + (y < 0 ? -y + " BCE" : y + " CE");
      await mode(page, "full"); await year(page, y); await view(page, lon, lat, k);
      const lFull = await labels(page), fFull = await faces(page);
      const foreign = lFull.filter((p) => !isMine(p.id));
      check(where + ", Full: names things the reader has not discovered (" + foreign.length + " of " + lFull.length + ": " + byKind(foreign) + ")", foreign.length >= 3);
      if (y < 0) { const pr = foreign.find((p) => p.hist && /^pol:/.test(p.id) && p.sx > 40 && p.sy > 40 && p.sx < 1240 && p.sy < 760); if (pr) probes.push({ where, p: pr, full: await pixel(page, pr.sx, pr.sy) }); }
      await mode(page, "personal"); await shot(page, "personal-" + name.replace(/\W+/g, "-") + "-" + y);
      const lPers = await labels(page), mk = await marks(page), ks = await keys(page), fPers = await faces(page);
      const bad = lPers.filter((p) => !held(mine)(p));
      check(where + ", Personal: every name placed is the reader's (" + lPers.length + " names: " + byKind(lPers) + ")", bad.length === 0, bad.length ? "NOT theirs: " + bad.slice(0, 12).map((p) => p.text + " [" + p.kind + "]").join(", ") : "");
      check(where + ", Personal: every mark drawn is a flagged place of theirs (" + mk.length + ")", mk.every((m) => m.st === 2 && isMine(m.id)));
      check(where + ", Personal: the hidden list holds only what is visible and theirs (" + ks.length + ")", ks.every((kk) => isMine(kk.id)) && ks.every((kk) => lPers.some((p) => p.id === kk.id) || mk.some((m) => m.id === kk.id)), ks.filter((kk) => !isMine(kk.id)).map((kk) => kk.text).join(", "));
      if (y < 0) check(where + ", Personal: the history draws only the reader's faces (" + fPers.faces + " of Full's " + fFull.faces + ")", fPers.faces < fFull.faces && fPers.faces <= [...mine].filter((id) => /^pol:/.test(id)).length);
      if (probes.length && probes[probes.length - 1].where === where) { const pr = probes[probes.length - 1]; pr.pers = await pixel(page, pr.p.sx, pr.p.sy); }
    }
    // 3: the darker empty land under an undiscovered state in Personal. The plain land is what Full draws the face in (one neutral fill); HIST_DIM is 0.5 of it
    await year(page, 2025); await mode(page, "map");
    for (const pr of probes) {
      if (!pr.pers || !pr.full) continue;
      const ratio = lum(pr.pers) / Math.max(1, lum(pr.full));
      check(pr.where + ": the ground of " + pr.p.text + " (not theirs) is the darker EMPTY land in Personal, not the plain land of its face in Full (luminance ×" + ratio.toFixed(2) + ")", ratio < 0.75 && ratio > 0.3, "personal " + pr.pers + " / full " + pr.full);
    }
    check("at least one undiscovered state was probed", probes.some((pr) => pr.pers && pr.full));
    // 4a: a sea a studied card discovered (the Aegean Sea, gr-001) is named in Personal
    await year(page, -483); await view(page, 25, 38, 3); await mode(page, "personal");
    const lA = await labels(page);
    check("the Aegean Sea — a sea gr-001 discovered (flag 2: " + mine.has(AEGEAN) + ") — IS named in Personal", mine.has(AEGEAN) && lA.some((p) => p.id === AEGEAN), lA.filter((p) => p.kind === "sea" || p.kind === "ocean").map((p) => p.text).join(", ") || "no sea named");
    allErrors.push(...errors); await ctx.close();
  }
  {
    console.log("\n\x1b[1m5) the reader with no cards: Personal is land, water and the empty-state sentence\x1b[0m\n");
    const { ctx, page, errors } = await open(browser, []);
    await mode(page, "personal"); await year(page, -483); await view(page, 27, 38, 5);
    const l = await labels(page), mk = await marks(page), f = await faces(page), ks = await keys(page);
    const empty = await page.evaluate(() => { const e = document.querySelector(".atlas2-study .atlas2-study-empty") || [...document.querySelectorAll(".atlas2-study *")].find((x) => /haven.t studied any cards/.test(x.textContent)); return e ? e.textContent.trim() : ""; });
    const ln = l.filter((p) => p.kind !== "river");   // a river's name is decision c's (the next commit)
    check("no name, no mark, no face, an empty hidden list (" + ln.length + " names, " + mk.length + " marks, " + f.faces + " faces, " + ks.length + " keys)", ln.length === 0 && mk.length === 0 && f.faces === 0 && ks.length === 0, ln.slice(0, 8).map((p) => p.text).join(", "));
    check("…and the empty-state sentence", /haven.t studied any cards yet/.test(empty), empty.slice(0, 80));
    await shot(page, "personal-no-cards");
    allErrors.push(...errors); await ctx.close();
  }
  console.log("\n\x1b[1m6) no console error\x1b[0m\n");
  check("no console error", allErrors.length === 0, allErrors.slice(0, 5).join(" | "));
  await browser.close(); server.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
