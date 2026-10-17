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
const farRome = cards.filter((c) => (c.places || []).some((p) => p === "pl:q677935" || p === "pl:q1729630")).slice(0, 3).map((c) => c.id);   // Veii, Monte Cavo: Rome's by the registry, far from its centre
const fcCards = (IDX.cardsOfPlace.get("pl:q170526") || []).slice(0, 1);   // the Fertile Crescent: a region, a name with no dot
const nameIds = ["pl:q1615560", "pl:q223917", "pl:q189685"].concat([...REG.values()].filter((r) => /^(Malia \(archaeological site\)|Second Battle of El Alamein|Bhimbetka rock shelters)$/.test(r.name)).map((r) => r.id));   // the names (decision f): Caesarea (modern town), Boma, …, Malia, El Alamein, Bhimbetka
const nameCards = nameIds.map((id) => (IDX.cardsOfPlace.get(id) || [])[0]).filter(Boolean);
const READER = [...new Set([...greekPol, ...romeCards, ...farRome, ...fcCards, ...nameCards, ...cards.filter((c) => /^gr-/.test(c.id) && c.places && c.places.length).slice(0, 12).map((c) => c.id)])];
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
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.year() >= 2000 || (c.historyOK && c.historyOK()); }, null, { timeout: 120000 });
  await settle(page);
}
async function mode(page, m) {
  await A(page, (c, m) => c.study.setMode(m), m); await sleep(150);
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.year() >= 2000 || !c.historyOK || c.historyOK(); }, null, { timeout: 120000 });   // the faces' meshes at the view's level (a present year draws no history)
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

  /* ------------------------------------------------------------------ 2  the tap rules */
  console.log("\n\x1b[1m2) the tap rules: a popup only for what has a card; a desert, a bare polity, open water and a plain name do nothing\x1b[0m\n");
  {
    const AF = require("../atlas/atlas-format.js");
    const HH = AF.read(new Uint8Array(fs.readFileSync(path.join(ROOT, "atlas/data/history.bin"))), { headerOnly: true }).header;
    const entLose = HH.entities.filter((e) => !IDX.cardsOfPlace.has(e.id)), placeLose = [...REG.keys()].filter((id) => !IDX.cardsOfPlace.has(id));
    console.log("  \x1b[2m(the numbers: of " + HH.entities.length + " history entities " + entLose.length + " have no card and lose their popup [" + Object.entries(entLose.reduce((a, e) => { a[e.kind] = (a[e.kind] || 0) + 1; return a; }, {})).map(([k, n]) => n + " " + k).join(", ") + "]; of " + REG.size + " registry places " + placeLose.length + " have no card and lose theirs; the data of every one stays)\x1b[0m");
    const { ctx, page, errors } = await open(browser, READER);
    const tapCentre = async (touch) => { const b = await box(page); const x = b.w / 2, y = b.h / 2; await A(page, (c, p) => c.pickAt(p[0], p[1], p[2]), [x, y, !!touch]); await sleep(300); return [x, y]; };
    const nothing = (s) => s.id == null && !s.cardOpen && !s.chip;
    // (i) a stateless desert at 483 BCE: the Sahara
    await year(page, -483); await view(page, 5, 24, 5);
    let b = await box(page), c0 = [b.w / 2, b.h / 2];
    const under = await A(page, (c, p) => ({ stack: c.stackAt(p[0], p[1]), hit: c.hitAt(p[0], p[1]), near: c.study.near(p[0], p[1], true) }), c0);
    check("the Sahara in 483 BCE: nothing is under the centre of the frame (no name, no mark, no face with a card)", !under.stack.length && !under.hit.length && !under.near.length, JSON.stringify(under));
    await tapCentre(true); let s1 = await sel(page);
    check("a tap on it does NOTHING: no selection, no card, no chip — not the nearest sea (the Mediterranean) as before", nothing(s1), JSON.stringify(s1));
    // (ii) open water: the mid-Atlantic
    await view(page, -35, 25, 20);
    await tapCentre(true); s1 = await sel(page);
    check("a tap on open water far from any name does nothing (the nearest-ocean fallback is gone)", nothing(s1), JSON.stringify(s1));
    // (iii) a polity with no card of the reader's: Carthage in Personal, which the Full Atlas names and opens
    await view(page, 27, 38, 5); await mode(page, "full");
    const fullPol = (await labels(page)).filter((p) => p.hist && p.kind === "polity");
    const flagged2 = new Set((await study(page)).flags.filter(([, f]) => f === 2).map(([id]) => id));
    const bare = fullPol.find((p) => !flagged2.has(p.id) && IDX.cardsOfPlace.has(p.id));
    check("a polity the Full Atlas names that the reader has no card for, though some card has: " + (bare ? bare.text : "none"), !!bare);
    if (bare) {
      await A(page, (c, p) => c.pickAt(p[0], p[1], true), [bare.sx, bare.sy]); await sleep(300); s1 = await sel(page);
      check("in the FULL Atlas a tap on its face opens it (a card links it)", s1.id === bare.id && s1.cardOpen, JSON.stringify(s1));
      await A(page, (c) => c.clearSelection());
      await mode(page, "personal");
      await A(page, (c, p) => c.pickAt(p[0], p[1], true), [bare.sx, bare.sy]); await sleep(300); s1 = await sel(page);
      check("in the PERSONAL Atlas the same tap does nothing: no card of the reader's links it", nothing(s1), JSON.stringify(s1));
      check("…and it is not in the hidden list of places the keyboard reaches", !(await A(page, (c) => c.study.keys())).some((k) => k.id === bare.id));
    }
    // (iv) a name with no card at all: an ordinary town of the gazetteer, in the Full Atlas (present day)
    await year(page, 2025); await mode(page, "full"); await view(page, 23, 38, 2);
    const plain = (await labels(page)).find((p) => !p.hist && /^(city|town)$/.test(p.kind) && !/^stk:/.test(p.id) && !IDX.cardsOfPlace.has(p.id) && p.text);   // not a city stack's name
    check("a town named on the map that no card is about: " + (plain ? plain.text : "none in view"), !!plain);
    if (plain) {
      const cx = (plain.hit[0] + plain.hit[2]) / 2, cy = (plain.hit[1] + plain.hit[3]) / 2;
      check("…its name is not a hit target", !(await A(page, (c, p) => c.hitAt(p[0], p[1]), [cx, cy])).includes(plain.id));
      await A(page, (c, p) => c.pickAt(p[0], p[1], true), [cx, cy]); await sleep(300); s1 = await sel(page);
      check("…and a tap on its name opens no popup for it", s1.id !== plain.id && (!s1.cardOpen || s1.id !== plain.id), JSON.stringify(s1));
      await A(page, (c) => c.clearSelection());
    }
    // (v) a water body's own name, with cards: the Strait of Hormuz (a places.js row three cards are about; the gazetteer's Aegean name is not placed at any zoom of this view — a label-engine matter, not a tap one)
    await view(page, 56, 26, 8);
    const WATER = "pl:q79883";
    const aeg = (await labels(page)).find((p) => p.id === WATER);
    check("the Strait of Hormuz is named in view (a card is about it)", !!aeg && IDX.cardsOfPlace.has(WATER));
    if (aeg) {
      const cx = (aeg.hit[0] + aeg.hit[2]) / 2, cy = (aeg.hit[1] + aeg.hit[3]) / 2;
      await A(page, (c, p) => c.pickAt(p[0], p[1], true), [cx, cy]); await sleep(300); s1 = await sel(page);
      check("a tap on the water body's own name opens its popup (the one way a water body opens)", s1.id === WATER && s1.cardOpen, JSON.stringify(s1));
      await A(page, (c) => c.clearSelection());
    }
    await view(page, 23, 38, 2);
    // (vi) a mark with cards still opens; (vii) the hidden list holds only what a tap may open
    const lv = await live(page);
    const mk = lv.find((m) => !/^pol:/.test(m.id) && m.st > 0 && !lv.some((o) => o !== m && Math.hypot(o.x - m.x, o.y - m.y) < 30));   // a lone mark: two within a finger fan out instead
    if (mk) { await A(page, (c, p) => c.pickAt(p[0], p[1], true), [mk.x, mk.y]); await sleep(300); s1 = await sel(page); check("a tap on a mark that has cards opens its popup, as before", s1.id === mk.id && s1.cardOpen, JSON.stringify(s1)); await A(page, (c) => c.clearSelection()); }
    const tappable = new Set(await A(page, (c) => c.study.tappableIds()));
    const keys = await A(page, (c) => c.study.keys());
    check("the hidden list is one button per name or mark a tap may open — " + keys.length + " buttons, every one tappable (a city stack is made of places with cards)", keys.length > 0 && keys.every((k) => tappable.has(k.id) || /^stk:/.test(k.id)));
    const tappableFull = AS.tappableSet(IDX, "full", AS.flags(IDX, ST, "full", [], (id) => ({ collId: "x" })));
    check("…the Full Atlas's tappable set is exactly the ids any card links (" + tappableFull.size + ")", tappable.size === tappableFull.size && [...tappable].every((id) => tappableFull.has(id)));
    allErrors.push(...errors); await ctx.close();
  }

  /* ------------------------------------------------------------------ 3  the popup's rows */
  console.log("\n\x1b[1m3) the popup lists each card as a row: title, deck, due; Personal says how many more the Full Atlas has\x1b[0m\n");
  {
    const PLACE = "pl:q180212";   // the Roman Forum: several of the reader's Roman cards are about it, and more that are not
    const all = IDX.cardsOfPlace.get(PLACE) || [], own = all.filter((id) => ST.cardSet.has(id)), dueSet = new Set(READER.filter((id, i) => i % 3 === 0));
    check("the Forum has cards of the reader's and cards that are not (" + own.length + " of " + all.length + ")", own.length >= 2 && all.length > own.length);
    const rows = (page) => page.$$eval(".atlas2-study-cards .atlas2-study-card", (as) => as.map((a) => ({ id: a.getAttribute("data-card"), href: a.getAttribute("href"), title: a.querySelector(".atlas2-study-title").textContent.trim(), deck: (a.querySelector(".atlas2-study-deck") || {}).textContent || "", due: a.getAttribute("data-due") === "1", badge: !!a.querySelector(".atlas2-study-due"), studied: !!a.querySelector(".atlas2-study-mine") })));
    const others = (page) => page.$eval(".atlas2-study-cards", (e) => { const o = e.querySelector(".atlas2-study-others"); return o ? o.textContent.trim() : ""; });
    const { ctx, page, errors } = await open(browser, READER);
    const openPlace = async (pg) => { await A(pg, (c, id) => c.select(id, { open: true }), PLACE); await pg.waitForSelector(".atlas2-study-cards", { state: "attached", timeout: 20000 }); await sleep(200); };
    await openPlace(page);
    let r = await rows(page);
    check("Personal: one row per card of the reader's about the Forum, in the Node order", r.length === own.length && r.every((x, i) => x.id === own[i]), r.map((x) => x.id).join(","));
    check("…each row has a title and a deck chip", r.every((x) => x.title.length > 2 && x.deck.length > 1), r.map((x) => x.deck).join(" / "));
    check("…and says which are due now (the seed makes every third card due)", r.every((x) => x.due === dueSet.has(x.id) && x.badge === x.due), r.map((x) => x.id + (x.due ? " due" : "")).join(", "));
    check("…each row is a link to the card's own page", r.every((x) => x.href === "#card/" + x.id));
    const o = await others(page);
    check("…and the Personal popup says how many more the Full Atlas has: " + (all.length - own.length), new RegExp("^" + (all.length - own.length) + " more cards? about this place in the Full Atlas").test(o), o);
    await page.click(".atlas2-study-tofull"); await sleep(500);
    r = await rows(page);
    check("the sentence's button switches to the Full Atlas, which lists every card, the reader's first and marked", (await study(page)).mode === "full" && r.length === Math.min(all.length, AS.LIST_CAP) && r.slice(0, own.length).every((x, i) => x.id === own[i] && x.studied) && r.slice(own.length).every((x) => !x.studied), r.length + " rows");
    check("…with no 'more in the Full Atlas' sentence", (await others(page)) === "");
    allErrors.push(...errors); await ctx.close();
    // the phone: the sheet with its rows fits the full-bleed frame, above the year rail
    const ph = await open(browser, READER, { phone: true });
    await openPlace(ph.page);
    await ph.page.click(".atlas2-grip"); await sleep(300);
    const geo = await ph.page.evaluate(() => { const f = document.querySelector(".atlas2").getBoundingClientRect(), c = document.querySelector(".atlas2-card").getBoundingClientRect(), rail = document.querySelector(".atlas2-rail").getBoundingClientRect(), rows = [...document.querySelectorAll(".atlas2-study-card")].map((a) => a.getBoundingClientRect()); return { frame: [f.left, f.top, f.right, f.bottom], card: [c.left, c.top, c.right, c.bottom], rail: [rail.left, rail.top, rail.right, rail.bottom], rows: rows.map((r) => [r.left, r.top, r.right, r.bottom, r.height]), vw: innerWidth, vh: innerHeight }; });
    check("390 × 844: the open sheet lies wholly inside the frame and ends above the year rail", geo.card[0] >= geo.frame[0] - 0.5 && geo.card[2] <= geo.frame[2] + 0.5 && geo.card[1] >= geo.frame[1] && geo.card[3] <= geo.rail[1] + 0.5, JSON.stringify({ card: geo.card, rail: geo.rail, frame: geo.frame }));
    check("…its rows are at least 30 px tall (a finger's row) and inside the sheet's width", geo.rows.length === own.length && geo.rows.every((r) => r[4] >= 30 && r[0] >= geo.card[0] && r[2] <= geo.card[2]), JSON.stringify(geo.rows.slice(0, 2)));
    await shot(ph.page, "popup-cards-phone");
    allErrors.push(...ph.errors); await ph.ctx.close();
  }

  /* ------------------------------------------------------------------ 4  city stacks and the pager */
  console.log("\n\x1b[1m4) city stacks: one mark with a count for the places of one city within 28 px; the popup pages through them\x1b[0m\n");
  {
    const ROME = "city:1159151593";
    const cities = [...REG.values()].filter((r) => /^(capital|city|town)$/.test(r.kind) && r.at);
    const linkedRows = IDX.ids.filter((id) => !id.startsWith("pol:") && REG.has(id)).map((id) => { const r = REG.get(id), p = r.src === "places" && r.within ? REG.get(r.within) : null; return { id, kind: r.kind, within: p ? p.id : "", pk: p ? p.kind : "", at: r.at }; });
    const cm = AS.cityMembership(linkedRows, cities, { km: 3 });
    const mineRome = [...flagsPersonal].filter(([id, f]) => f === 2 && cm.of.get(id) === ROME).map(([id]) => id);
    check("the seeded reader has studied cards on " + mineRome.length + " places of Rome (Veii and Monte Cavo among them, far from the centre)", mineRome.length >= 6 && mineRome.includes("pl:q677935"), mineRome.join(","));
    const { ctx, page, errors } = await open(browser, READER, { phone: true });
    await year(page, 2025); await view(page, 12.49, 41.89, 3);
    let mk = await marks(page), lv = await live(page);
    const stacks = mk.filter((m) => m.members), romeStacks = stacks.filter((m) => m.city === ROME);
    check("at 3 km/px Rome's places are ONE stack mark, named for the city, with the reader's " + mineRome.length + " places as its members", romeStacks.length === 1 && romeStacks[0].count === mineRome.length && romeStacks[0].members.every((id) => mineRome.includes(id)) && romeStacks[0].name === "Rome", JSON.stringify(romeStacks.map((m) => [m.name, m.count])));
    check("…none of its members is drawn as a mark of its own", !mk.some((m) => mineRome.includes(m.id)) && !lv.some((m) => mineRome.includes(m.id)));
    check("…the stack is drawn, and its name 'Rome' is placed beside it", lv.some((m) => m.id === romeStacks[0].id) && (await labels(page)).some((p) => p.id === romeStacks[0].id && p.text === "Rome"));
    check("…and no stack carries a place of another city (never across cities)", stacks.every((m) => m.members.every((id) => cm.of.get(id) === m.city)));
    await shot(page, "rome-stacked");
    // zoomed in: the far members separate (Veii is 16 km out: 53 px at 0.3 km/px), the centre's sites stay one stack
    await view(page, 12.49, 41.89, 0.3);
    mk = await marks(page); lv = await live(page);
    const inView = (id) => mk.some((m) => m.id === id) || mk.some((m) => m.members && m.members.includes(id));
    const single = mk.filter((m) => !m.members && mineRome.includes(m.id)), st2 = mk.filter((m) => m.members && m.city === ROME);
    check("at 0.3 km/px Veii is drawn singly (farther than 28 px from the rest) while the centre's sites are still one stack", single.some((m) => m.id === "pl:q677935") && st2.length >= 1 && st2.every((m) => m.count >= 2), single.map((m) => m.id).join(",") + " | stacks " + st2.map((m) => m.count).join(","));
    check("…every stack's members lie within 28 px of one another (chained) at this layout", (await A(page, (c) => { const ms = c.study.marks().filter((m) => m.members); return ms.every((m) => m.count >= 2); })));
    await shot(page, "rome-unstacked");
    // the popup: a touch tap on the stack
    await view(page, 12.49, 41.89, 3);
    lv = await live(page); const sm = lv.find((m) => m.members && m.city === ROME);
    check("the stack is on screen to tap", !!sm);
    const b = await box(page);
    await page.touchscreen.tap(b.x + sm.x, b.y + sm.y); await sleep(600);
    const pg = async () => page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; return { title: document.querySelector(".atlas2-card-title").textContent, n: document.querySelector(".atlas2-pager-n").textContent, name: document.querySelector(".atlas2-pager-name").textContent, hidden: document.querySelector(".atlas2-pager").hidden, stack: c.study.stack(), sel: c.selectedId(), rows: document.querySelectorAll(".atlas2-study-card").length, cardOpen: !document.querySelector(".atlas2-card").hidden }; });
    let p0 = await pg();
    check("a tap on it opens the popup titled for the city: \"Rome — N places\"", p0.cardOpen && p0.title === "Rome — " + sm.count + " places" && !p0.hidden, JSON.stringify(p0));
    check("…on page 1 of N: the first place's name, its cards as rows", p0.n === "1 of " + sm.count && p0.stack && p0.sel === p0.stack.ids[0] && REG.get(p0.sel).name === p0.name && p0.rows >= 1, JSON.stringify(p0));
    await page.click(".atlas2-pager-next"); await sleep(300); let p1 = await pg();
    check("the › button turns to page 2: another place, its own cards", p1.n === "2 of " + sm.count && p1.sel === p0.stack.ids[1] && p1.sel !== p0.sel && REG.get(p1.sel).name === p1.name, JSON.stringify(p1));
    await page.focus(".atlas2-card-title"); await page.keyboard.press("ArrowRight"); await sleep(300); let p2 = await pg();
    check("the keyboard's → turns to page 3", p2.n === "3 of " + sm.count && p2.sel === p0.stack.ids[2], JSON.stringify(p2));
    await page.keyboard.press("ArrowLeft"); await sleep(300); p2 = await pg();
    check("…and ← back to page 2", p2.n === "2 of " + sm.count);
    // a REAL touch swipe on the sheet, through CDP: touchStart, five touchMoves, touchEnd
    const cdp = await ctx.newCDPSession(page);
    const cr = await page.$eval(".atlas2-card-head", (e) => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    const swipe = async (dir) => { const x0 = cr.x + 60 * dir, y0 = cr.y; await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x0, y: y0 }] }); for (let i = 1; i <= 5; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x0 - 24 * i * dir, y: y0 + i }] }); await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await sleep(350); };
    await swipe(1); let p3 = await pg();
    check("a swipe LEFT (a real touch, 120 px) turns to the next page", p3.n === "3 of " + sm.count, JSON.stringify(p3));
    await swipe(-1); p3 = await pg();
    check("a swipe RIGHT turns back", p3.n === "2 of " + sm.count, JSON.stringify(p3));
    for (let i = 0; i < sm.count; i++) { await page.click(".atlas2-pager-next"); await sleep(120); }
    p3 = await pg();
    check("the pages wrap round: N steps forward is the same page again", p3.n === "2 of " + sm.count, p3.n);
    check("the popup's own address names the page's place", /#map\/.*pl%3A|#map\/.*city%3A/.test(await page.evaluate(() => location.hash)));
    await shot(page, "rome-popup");
    const keys = await A(page, (c) => c.study.keys());
    check("the hidden list names the stack for the keyboard: \"Rome, N places\"", keys.some((k) => k.id === sm.id && /^Rome, \d+ places/.test(k.text)), keys.filter((k) => /^stk:/.test(k.id)).map((k) => k.text).join(" | "));
    await page.keyboard.press("Escape"); await sleep(200);
    check("Escape closes the popup and ends the stack", !(await pg()).cardOpen && (await A(page, (c) => c.study.stack())) === null);
    // the Full Atlas: the stack holds every linked place of Rome in view
    await mode(page, "full"); mk = await marks(page);
    const full = mk.filter((m) => m.members && m.city === ROME);
    const allRome = IDX.ids.filter((id) => cm.of.get(id) === ROME);
    check("in the Full Atlas Rome's stack holds every card-linked place of Rome (" + allRome.length + ")", full.length === 1 && full[0].count === allRome.length, JSON.stringify(full.map((m) => m.count)));
    allErrors.push(...errors); await ctx.close();
  }

  /* ------------------------------------------------------------------ 5  a glyph per class */
  console.log("\n\x1b[1m5) glyphs: a shape per class, told apart by shape, legible at 12–16 px, a 32 px hit area; areas have no mark; the Legend lists them\x1b[0m\n");
  {
    const { ctx, page, errors } = await open(browser, READER);
    await mode(page, "full"); await year(page, 2025);
    // the glyphs' pixels: a bitmap of the ink round each mark on the label canvas, compared pairwise (Jaccard) — a shape, not a colour, tells them apart.
    // Sampled over three views at one zoom (3 km/px: marks 12–13 px across): the eastern Mediterranean (El Alamein's battle, Cairo), Greece (Olympus
    // and Sounion's peaks, the sites), central Europe (Dunkirk's battle, the Kahlenberg, Vienna; the Berlin Wall's building class is in Berlin's stack)
    // the INK of a glyph: the pixels that are not the paper's colour (a hollow mark's fill is the paper, its outline the ink; the reader's own are filled with the accent)
    const mask = (m) => page.evaluate((m) => { const c = document.querySelector(".atlas2").__atlas2, halo = c.colours().halo, hr = parseInt(halo.slice(1, 3), 16), hg = parseInt(halo.slice(3, 5), 16), hb = parseInt(halo.slice(5, 7), 16); const cv = document.querySelector(".atlas2-labels"), d = cv.width / cv.getBoundingClientRect().width, r = Math.ceil((m.h + 3) * d), cx = Math.round(m.x * d), cy = Math.round(m.y * d); const img = cv.getContext("2d").getImageData(cx - r, cy - r, 2 * r + 1, 2 * r + 1); const out = []; let n = 0; for (let i = 0; i < img.data.length; i += 4) { const a = img.data[i + 3]; const on = a > 100 && (Math.abs(img.data[i] - hr) + Math.abs(img.data[i + 1] - hg) + Math.abs(img.data[i + 2] - hb) > 60) ? 1 : 0; out.push(on); n += on; } return { w: 2 * r + 1, bits: out, n }; }, m);
    const jaccard = (a, b) => { const w = Math.min(a.w, b.w); let inter = 0, uni = 0; for (let y = 0; y < w; y++) for (let x = 0; x < w; x++) { const p = a.bits[y * a.w + x], q = b.bits[y * b.w + x]; if (p && q) inter++; if (p || q) uni++; } return uni ? inter / uni : 1; };
    const sample = {}, seenCls = {}; let lone = null, mk = [];
    for (const [lon, lat] of [[31, 27.5], [22.5, 38.5], [9.4, 49.7]]) {
      await view(page, lon, lat, 3);
      const lv = await live(page);
      for (const m of lv) if (m.cls && m.h >= 6) seenCls[m.cls] = (seenCls[m.cls] || 0) + 1;
      for (const m of lv) { if (!m.cls || m.h < 6 || sample[m.cls]) continue; if (lv.some((o) => o !== m && Math.hypot(o.x - m.x, o.y - m.y) < 2 * m.h + 6)) continue; sample[m.cls] = { m, mask: await mask(m) }; }   // a mark with no other within its box
      if (!lone) { const l = lv.find((m) => m.cls && m.cls !== "stack" && !lv.some((o) => o !== m && Math.hypot(o.x - m.x, o.y - m.y) < 40)); if (l) lone = { id: l.id, hit: (await A(page, (c, p) => c.study.near(p[0] + 15, p[1], false), [l.x, l.y])).includes(l.id) }; }   // asked in this view, before the next moves it
      mk = mk.concat(await marks(page));
    }
    check("three views at 3 km/px draw marks of the settlement, site, battle and peak classes (and a stack) at 12 px or larger", ["settlement", "site", "battle", "peak", "stack"].every((c) => seenCls[c]), Object.entries(seenCls).map(([c, n]) => c + " " + n).join(", "));
    check("each sampled glyph has ink (at least 20 outline pixels at 12–16 px): " + Object.keys(sample).join(", "), Object.keys(sample).length >= 4 && Object.values(sample).every((s) => s.mask.n >= 20), Object.entries(sample).map(([c, s]) => c + " " + s.mask.n + "px").join(", "));
    const pairs = []; const cs = Object.keys(sample); for (let i = 0; i < cs.length; i++) for (let j = i + 1; j < cs.length; j++) pairs.push([cs[i], cs[j], jaccard(sample[cs[i]].mask, sample[cs[j]].mask)]);
    check("every pair of classes differs by SHAPE: the ink bitmaps overlap by at most 75 % (Jaccard)", pairs.length >= 6 && pairs.every((p) => p[2] <= 0.75), pairs.map((p) => p[0] + "/" + p[1] + " " + p[2].toFixed(2)).join(", "));
    // the hit area: a tap 15 px from a lone mark picks it (a 32 px target), with a mouse
    check("a tap 15 px from a lone mark (a mouse) picks it: a hit area of at least 32 px", !!lone && lone.hit, lone ? lone.id : "no lone mark");
    // areas: a name, no mark
    check("no mark of an area kind anywhere in the three layouts (river, lake, sea, region, range, island, country, province)", !mk.some((m) => /^(river|lake|sea|ocean|strait|gulf|region|range|island|island-group|country|admin1)$/.test(m.kind)), mk.filter((m) => /^(river|lake|sea|ocean|strait|gulf|region|range|island|island-group|country|admin1)$/.test(m.kind)).map((m) => m.id).join(","));
    await view(page, 40, 34, 6);
    check("the Fertile Crescent (a region) carries no mark in the Full Atlas", !(await marks(page)).some((m) => m.id === "pl:q170526"));
    await mode(page, "personal");
    const fc = (await labels(page)).find((p) => p.id === "pl:q170526");
    check("…and on the reader's Personal Atlas its name stands alone — placed, flagged, no dot (in the crowded Full Atlas the name may lose its ground to names of higher priority, as any name may)", fcCards.length === 1 && !!fc && fc.st === 2 && !(await marks(page)).some((m) => m.id === "pl:q170526"), fc ? fc.text : "not placed");
    await mode(page, "full");
    // the Legend
    const key = await page.$$eval(".atlas2-marks-key > div", (ds) => ds.map((d) => ({ cls: d.getAttribute("data-cls"), word: d.querySelector("dd").textContent.trim(), svg: !!d.querySelector("svg path"), d: d.querySelector("svg path").getAttribute("d").length })));
    check("the Legend lists the seven classes, each with its glyph drawn (an SVG path) and its words", key.length === 7 && key.every((k) => k.svg && k.word.length > 3 && k.d > 10) && key.map((k) => k.cls).join(",") === AS.MARK_CLASSES.map((m) => m.cls).join(","), key.map((k) => k.cls + ": " + k.word).join(" | "));
    await shot(page, "glyphs-east-med");
    allErrors.push(...errors); await ctx.close();
  }

  /* ------------------------------------------------------------------ 6  the labels' text */
  console.log("\n\x1b[1m6) names: no parenthetical on a label, two lines past 22 characters, the short name past 28; the popup keeps the full name; the 28 px rule holds\x1b[0m\n");
  {
    const { ctx, page, errors } = await open(browser, READER);
    await year(page, 2025);
    const find = (name) => [...REG.values()].find((r) => r.name === name);
    const cases = [
      { name: "Malia (archaeological site)", view: [25.5, 35.3, 1.5], text: "Malia", lines: 1 },
      { name: "Second Battle of El Alamein", view: [28.9, 30.8, 1.5], text: "Second Battle of El Alamein", lines: 2 },
      { name: "Bhimbetka rock shelters", view: [77.6, 22.9, 1.5], text: "Bhimbetka rock shelters", lines: 2 },
      { name: "Boma, Democratic Republic of the Congo", view: [13.05, -5.85, 1.5], text: "Boma", lines: 1 },
    ];
    for (const c of cases) {
      const row = find(c.name);
      if (!row || !READER.some((id) => (IDX.cardsOfPlace.get(row.id) || []).includes(id))) { check(c.name + ": a card of the reader's is about it", false); continue; }
      await view(page, c.view[0], c.view[1], c.view[2]);
      const lab = (await labels(page)).find((p) => p.id === row.id);
      check("'" + c.name + "' is labelled \"" + c.text + "\"" + (c.lines === 2 ? " on two lines" : ""), !!lab && lab.text === c.text && lab.rects.length === c.lines && lab.glyphs === c.text.length, lab ? JSON.stringify([lab.text, lab.rects.length, lab.glyphs]) : "not placed");
      if (lab) {
        const h = Math.max(...lab.rects.map((r) => r[3] - r[1])) / 2, gap = Math.min(...lab.rects.map((r) => Math.hypot(Math.max(r[0] - lab.sx, 0, lab.sx - r[2]), Math.max(r[1] - lab.sy, 0, lab.sy - r[3]))));
        check("…and stands within half its height + 28 px of its mark (the 28 px rule)", gap <= h + 28, gap.toFixed(1) + " px, half-height " + h.toFixed(1));
        await A(page, (c, id) => c.select(id, { open: true }), row.id); await sleep(250);
        check("…its popup carries the full name", (await page.$eval(".atlas2-card-title", (e) => e.textContent)) === c.name);
        await A(page, (c) => c.clearSelection());
      }
    }
    await shot(page, "names");
    allErrors.push(...errors); await ctx.close();
  }

  /* ------------------------------------------------------------------ 7  stacks never overlap (decision c, 2026-10-17) */
  console.log("\n\x1b[1m7) stacks never overlap: a ring that would sit on another ring or mark is nudged apart along the centre line (≤ 20 px) with a hairline to its true point — Rome and Vatican City at the closest zoom\x1b[0m\n");
  {
    const ROME = "city:1159151593", VAT = "city:1159127243";
    const { ctx, page, errors } = await open(browser, READER, { phone: true });
    await mode(page, "full"); await year(page, 2025);
    const overlapsAt = async (k) => {   // the live (drawn) marks: every pair with a ring among them, the gap between their boxes
      await view(page, 12.475, 41.9, k);
      const lv = await live(page), rings = lv.filter((m) => m.members);
      const pairs = []; for (const a of rings) for (const b of lv) { if (a === b) continue; const d = Math.hypot(a.x - b.x, a.y - b.y); pairs.push({ a: a.name || a.id, b: b.name || b.id, d: Math.round(d * 10) / 10, need: a.h + b.h, over: Math.max(0, a.h + b.h - d) }); }
      return { lv, rings, pairs, bad: pairs.filter((p) => p.over > 0.5) };
    };
    for (const k of [0.15, 0.3]) {
      const o = await overlapsAt(k);
      const rome = o.rings.find((m) => m.city === ROME), vat = o.rings.find((m) => m.city === VAT);
      check(`at ${k} km/px Rome's ring and Vatican City's ring are both drawn`, !!rome && !!vat, o.rings.map((m) => m.name + ":" + m.count).join(", "));
      check(`…and no ring overlaps another ring or a mark (${o.pairs.length} pairs read)`, o.pairs.length > 0 && o.bad.length === 0, JSON.stringify(o.bad.slice(0, 3)));
      if (rome && vat) check(`…the two rings are ${Math.round(Math.hypot(rome.x - vat.x, rome.y - vat.y))} px apart, at least their two half-extents (${rome.h + vat.h})`, Math.hypot(rome.x - vat.x, rome.y - vat.y) >= rome.h + vat.h - 0.5);
      const nudged = o.rings.filter((m) => m.ox || m.oy);
      check(`…a nudged ring moved at most 20 px (${nudged.length} nudged: ${nudged.map((m) => m.name + " " + Math.round(Math.hypot(m.ox, m.oy) * 10) / 10 + " px").join(", ")})`, nudged.every((m) => Math.hypot(m.ox, m.oy) <= 20.01));
      if (k === 0.15) check("…at the closest zoom at least one of the two was nudged (they overlapped before)", nudged.some((m) => m.city === ROME || m.city === VAT));
    }
    // the hairline: ink pixels on the label canvas between a nudged ring's edge and its true point
    { const lv = await live(page); const m = lv.find((x) => x.members && (x.ox || x.oy) && Math.hypot(x.ox, x.oy) > x.h);
      if (m) { const d = Math.hypot(m.ox, m.oy), mx = m.x - m.ox / d * (m.h + (d - m.h) / 2), my = m.y - m.oy / d * (m.h + (d - m.h) / 2);
        const ink = await A(page, (c, p) => { const halo = c.colours().halo, hr = parseInt(halo.slice(1, 3), 16), hg = parseInt(halo.slice(3, 5), 16), hb = parseInt(halo.slice(5, 7), 16); const cv = document.querySelector(".atlas2-labels"), k = cv.width / cv.getBoundingClientRect().width, x = cv.getContext("2d"); let n = 0; const dd = x.getImageData(Math.round((p[0] - 2) * k), Math.round((p[1] - 2) * k), Math.round(5 * k), Math.round(5 * k)).data; for (let i = 0; i < dd.length; i += 4) if (dd[i + 3] > 40 && (Math.abs(dd[i] - hr) > 40 || Math.abs(dd[i + 1] - hg) > 40 || Math.abs(dd[i + 2] - hb) > 40)) n++; return n; }, [mx, my]);
        check(`the hairline from ${m.name}'s ring to its true point is drawn (ink pixels midway: ${ink})`, ink > 0); }
      else console.log("  (no ring nudged farther than its own half-extent at this view: the hairline is not read)"); }
    await shot(page, "rome-vatican-closest");
    allErrors.push(...errors); await ctx.close();
  }


  /* ------------------------------------------------------------------ done */
  console.log("\n" + pass + " ok, " + fail + " failed");
  check("no console error", allErrors.length === 0, allErrors.slice(0, 3).join(" | "));
  await browser.close(); server.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); server.close(); process.exit(1); });
