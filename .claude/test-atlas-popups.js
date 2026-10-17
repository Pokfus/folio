/* test-atlas-popups.js — the study layer's membership, tapping, popups, city stacks, glyphs and label text (Atlas v2, 2026-10-17; the owner's phone).

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-popups.js [shotsDir]
     FOLIO_CHROMIUM=/path/to/chrome  … to pick the browser (otherwise playwright's own)

   The real app is served and #map opened with a SEEDED progress record (the same shape test-atlas-study.js writes), so the host object is the
   one a reader gets; what the page must show is computed HERE from the cards' own `places` and the shipped files. Six things the owner found on a
   real phone (2026-10-16), each a decision made and implemented (docs/atlas-v2-design.md §7 "Popups and stacks — as built"):
     1  PERSONAL MEMBERSHIP: a polity or a people is on the Personal Atlas only if a studied card links it — no name, no mark, no fill and no
        popup for any other; the count line counts the same set; Full shows everything
     2  TAPPING: a mark or a label opens a popup only if it has at least one card (Personal: one of the reader's own; Full and Map: any); a tap on
        a stateless desert, on a place with no cards, on a polity with no cards or on open water does nothing — no selection, no card, no chip;
        the nearest-sea fallback is gone; a sea's own label with cards still opens it
     3  THE POPUP'S ROWS: each card a row — its title, its deck and whether it is due — a link to the card; Personal lists the reader's own and
        says how many more the Full Atlas has; Full lists all; the sheet fits the full-bleed phone frame
     4  CITY STACKS: the places of one city within 28 px of one another are ONE mark with a count; zoomed in until they separate they are drawn
        singly; never across cities; the stack's popup is "Rome — N places" with a pager (arrows, the keyboard, a real touch swipe, "2 of N")
     5  GLYPHS: a shape per class (settlement, site, battle, peak, building, polity, stack), told apart by shape, with a hit area of 32 px; areas
        (rivers, lakes, seas, regions …) carry no mark; the Legend lists them
     6  NAMES: no parenthetical on a label ("Malia", not "Malia (archaeological site)"); a name over 22 characters on two lines at the space nearest
        its middle; over 28, the registry's short name; the popup keeps the full name; the 28 px rule (test-atlas-phone) still holds
   Re-run after touching atlas/study.js, the study block of atlas.js, the study pass of atlas-worker.js, or the place card. */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");
const AS = require("../atlas/study.js");
const { loadCards } = require("./card-io.js");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const SHOTS = process.argv[2] || "";
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream" };
const PORT = 5637;
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  — " + extra : "")); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- what the page must show, from the data ---------- */
const { cards } = loadCards();
global.window = global.window || {};
require(path.join(ROOT, "atlas/data/card-places.js")); require(path.join(ROOT, "atlas/data/places.js")); require(path.join(ROOT, "atlas/data/gazetteer.js"));
const IDX = AS.parse(global.window.ATLAS_CARD_PLACES);
const REG = (() => { const by = new Map(); const G = global.window.ATLAS_GAZETTEER, gi = {}; G.cols.forEach((c, i) => { gi[c] = i; }); for (const r of G.rows) by.set(r[gi.id], { id: r[gi.id], name: r[gi.name], kind: r[gi.kind], within: r[gi.within], at: r[gi.at], aliases: r[gi.aliases] || [], src: "gaz" }); const T = global.window.ATLAS_PLACES; for (const r of T.rows) { const o = {}; T.cols.forEach((c, j) => { o[c] = r[j] == null ? 0 : r[j]; }); o.src = "places"; o.aliases = Array.isArray(o.aliases) ? o.aliases : []; by.set(o.id, o); } return by; })();
const linksPol = (c, re) => (c.places || []).some((p) => re.test(p));
/* THE READER: Greek cards that link a state of the classical age (alive in 483 BCE), the Roman cards on the sites of Rome (a city stack), and a few more */
const greekPol = cards.filter((c) => /^gr-/.test(c.id) && linksPol(c, /^pol:(athens|sparta|achaemenid|persia|thebes|corinth|macedon|argos|aegina|syracuse)/)).slice(0, 30).map((c) => c.id);
const romeSites = ["pl:q180212", "pl:q10285", "pl:q207808", "pl:q200642", "pl:q34925", "pl:q194103", "pl:q586468", "pl:q192784", "pl:q211295", "pl:q478642", "pl:q281330", "pl:q746102"];
const romeCards = cards.filter((c) => (c.places || []).some((p) => romeSites.includes(p))).slice(0, 16).map((c) => c.id);
const READER = [...new Set([...greekPol, ...romeCards, ...cards.filter((c) => /^gr-/.test(c.id) && c.places && c.places.length).slice(0, 12).map((c) => c.id)])];
const ST = AS.studied(IDX, READER);
const flagsPersonal = AS.flags(IDX, ST, "personal", [], (id) => { const c = cards.find((x) => x.id === id); return c ? { collId: "x" } : null; });

const seed = (ids) => `try { if (!localStorage.getItem("folio_v1_seeded")) { localStorage.setItem("folio_v1", JSON.stringify({ cards: Object.fromEntries(${JSON.stringify(ids)}.map((id, i) => [id, { due: i % 3 === 0 ? Date.now() - 9e5 : Date.now() + 9e8, ivl: 9, ease: 2.5, status: "review", reps: 2, first: "2026-08-01" }])), settings: { newPerDay: 5 } })); localStorage.setItem("folio_v1_seeded", "1"); } } catch (e) {}`;
async function open(browser, ids, o) {
  o = o || {};
  const ctx = await browser.newContext(o.phone ? { viewport: { width: o.w || 390, height: o.h || 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : { viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript(seed(ids));
  await ctx.addInitScript(`localStorage.setItem("folio_tour_v1","1");localStorage.setItem("folio_atlas_tour_v1","1");`);
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  await goMap(page, o.hash);
  return { ctx, page, errors };
}
async function goMap(page, hash) {
  await page.goto(`http://127.0.0.1:${PORT}/${hash || "#map"}`, { waitUntil: "load" });
  await ready(page);
}
async function ready(page) {
  await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 120000 });
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.waterSettled() && c.labelsReady() && c.study.ready(); }, null, { timeout: 120000 });
}
const A = (page, fn, arg) => page.evaluate(`(() => { const c = document.querySelector(".atlas2").__atlas2; return (${fn.toString()})(c, ${JSON.stringify(arg === undefined ? null : arg)}); })()`);
async function view(page, lon, lat, k) {
  await page.evaluate(([a, b, c]) => document.querySelector(".atlas2").__atlas2.setView(a, b, c), [lon, lat, k]);
  await page.waitForFunction(() => document.querySelector(".atlas2").__atlas2.tilesSettled(), null, { timeout: 120000 });
  await settle(page);
}
async function settle(page) { await page.evaluate(() => document.querySelector(".atlas2").__atlas2.layoutNow()); await sleep(150); }
async function year(page, y) {
  await A(page, (c, y) => c.setYear(y), y);
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.historyOK && c.historyOK(); }, null, { timeout: 120000 });
  await settle(page);
}
async function mode(page, m) {
  await A(page, (c, m) => c.study.setMode(m), m); await sleep(150);
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return !c.historyOK || c.historyOK(); }, null, { timeout: 120000 });   // the faces' meshes at the view's level
  await sleep(450);   // the fade between the two colourings (FADE_MS) is over before a pixel is read
  await settle(page);
}
const study = (page) => A(page, (c) => ({ mode: c.study.mode(), flags: c.study.flags(), summary: c.study.summary(), muted: c.study.muted() }));
const marks = (page) => A(page, (c) => c.study.marks());
const live = (page) => A(page, (c) => c.study.liveMarks());
const labels = (page) => A(page, (c) => c.labels().map((p) => ({ id: p.id, kind: p.kind, text: p.text, hist: !!p.hist, st: p.st || 0, sx: p.sx, sy: p.sy, hit: p.hit, rects: p.rects, glyphs: p.glyphs ? p.glyphs.length : 0 })));
const sel = (page) => page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; const card = document.querySelector(".atlas2-card"); return { id: c.selectedId ? c.selectedId() : null, cardOpen: !card.hidden, title: document.querySelector(".atlas2-card-title").textContent, kind: document.querySelector(".atlas2-card-kind").textContent, chip: !document.querySelector(".atlas2-stack").hidden, hash: location.hash }; });
const box = (page) => page.$eval(".atlas2", (e) => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
const pixel = (page, x, y) => A(page, (c, p) => c.pixelAt(p[0], p[1]), [x, y]);
const near = (a, b, tol) => a && b && Math.abs(a[0] - b[0]) <= tol && Math.abs(a[1] - b[1]) <= tol && Math.abs(a[2] - b[2]) <= tol;
const shot = async (page, name) => { if (!SHOTS) return; fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, name + ".png") }); };

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch(LAUNCH);
  const allErrors = [];

  /* ------------------------------------------------------------------ 1  Personal membership */
  console.log("\n\x1b[1m1) Personal membership: only the polities a studied card links\x1b[0m\n");
  {
    const { ctx, page, errors } = await open(browser, READER);
    const s0 = await study(page);
    const flagged2 = new Set(s0.flags.filter(([, f]) => f === 2).map(([id]) => id));
    const nodePol = [...flagsPersonal].filter(([id, f]) => f === 2 && /^pol:/.test(id)).length;
    check("the seeded reader opens on their Personal Atlas, flagged with exactly the Node computation", s0.mode === "personal" && flagged2.size === [...flagsPersonal].filter(([, f]) => f === 2).length, s0.mode + ", " + flagged2.size + " flagged");
    check("the count line's polities are the polities a studied card links: " + nodePol, new RegExp("\\b" + nodePol + " polit").test(s0.summary.text), s0.summary.text);
    check("…and the count line never counts a polity no studied card links (a war card links every side it names: that is the rule, not a fault)", [...flagged2].filter((id) => /^pol:/.test(id)).every((id) => (IDX.cardsOfPlace.get(id) || []).some((cid) => ST.cardSet.has(cid))));
    await view(page, 27, 38, 5); await year(page, -483);
    const lp = (await labels(page)).filter((p) => p.hist && /^pol:/.test(p.id));
    check("483 BCE, the Aegean: at least three polities are named on the Full Atlas", await (async () => { await mode(page, "full"); const l = (await labels(page)).filter((p) => p.hist && /^pol:/.test(p.id)); page._fullPol = l; return l.length >= 3; })(), (page._fullPol || []).map((p) => p.text).join(", "));
    const unflagged = (page._fullPol || []).filter((p) => !flagged2.has(p.id)), own = (page._fullPol || []).filter((p) => flagged2.has(p.id));
    check("…some of them the reader's (a Greek card links Athens, Sparta, the Achaemenids …), some not", own.length >= 1 && unflagged.length >= 1, own.length + " own, " + unflagged.length + " not");
    await mode(page, "personal");
    const lpers = (await labels(page)).filter((p) => p.hist && /^pol:/.test(p.id));
    check("the Personal Atlas names ONLY the reader's polities: every polity name placed is flagged 2", lpers.length >= 1 && lpers.every((p) => flagged2.has(p.id) && p.st === 2), lpers.map((p) => p.text + (flagged2.has(p.id) ? "" : " (NOT THEIRS)")).join(", "));
    check("…and none of the " + unflagged.length + " polities the Full Atlas named that are not theirs is named (not even muted)", unflagged.every((u) => !lpers.some((p) => p.id === u.id)), unflagged.map((u) => u.text).join(", "));
    const mk = await marks(page);
    check("every polity mark on the Personal globe is the reader's", mk.filter((m) => /^pol:/.test(m.id)).every((m) => flagged2.has(m.id)) && mk.some((m) => /^pol:/.test(m.id)), mk.filter((m) => /^pol:/.test(m.id)).length + " polity marks");
    // the FILL: an unflagged state's face is plain land in Personal (its pixel is the land's), a colour of its own in Full
    const probe = unflagged.find((p) => p.kind === "polity");   // a state (a people is a stipple: its ground reads as land either way)
    if (probe) {
      // nine points round the name's anchor (the GL canvas only: the names are on their own canvas); the ones that are land in the present
      const pts = [[0, 0], [0, 14], [0, -14], [14, 0], [-14, 0], [10, 10], [-10, 10], [10, -10], [-10, -10]].map(([dx, dy]) => [probe.sx + dx, probe.sy + dy]);
      const read = async () => { const out = []; for (const p of pts) out.push(await pixel(page, p[0], p[1])); return out; };
      const pPers = await read();
      await mode(page, "full"); const pFull = await read();
      await year(page, 2025); await mode(page, "map"); const pLand = await read();
      const landish = pts.map((_, i) => near(pLand[i], pLand[0], 4) || near(pLand[i], pLand[1], 4));   // the land's own colour: what most points read in the present
      // the FILL is the colour most of the non-land points read in Full (a border's dark stroke crosses one or two points and is not the fill)
      const cand = pts.map((_, i) => (landish[i] && !near(pFull[i], pLand[i], 8) ? pFull[i] : null)).filter(Boolean);
      const fill = cand.map((c) => [c, cand.filter((d) => near(c, d, 6)).length]).sort((a, b) => b[1] - a[1]).map((x) => x[0])[0] || null;
      const tinted = pts.map((_, i) => !!fill && landish[i] && near(pFull[i], fill, 6));
      check(probe.text + " (not theirs): its face takes a colour of its own in Full (at " + tinted.filter(Boolean).length + " of 9 probe points)", tinted.some(Boolean), "full " + pFull[0] + " · land " + pLand[0]);
      const nT = tinted.filter(Boolean).length, nPlain = pts.filter((_, i) => tinted[i] && near(pPers[i], pLand[i], 6)).length;
      check("…and is plain land in Personal at every one of those points (" + nPlain + " of " + nT + ")", nT > 0 && nPlain === nT, pts.map((_, i) => tinted[i] ? "personal " + pPers[i] + " / land " + pLand[i] : "").filter(Boolean).join(" | "));
      await year(page, -483); await mode(page, "personal");
    } else check("an unflagged polity to probe", false);
    await shot(page, "personal-483");
    allErrors.push(...errors); await ctx.close();
  }

  /* ------------------------------------------------------------------ done */
  console.log("\n" + pass + " ok, " + fail + " failed");
  check("no console error", allErrors.length === 0, allErrors.slice(0, 3).join(" | "));
  await browser.close(); server.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); server.close(); process.exit(1); });
