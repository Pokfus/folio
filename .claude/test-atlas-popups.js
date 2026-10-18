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
    11 THE SHEET (2026-10-18): on a phone the popup is a bottom sheet docked on the frame's bottom edge with three snap heights (peek ≈ 28 %, half, full), a real
        touch drag between them, a flick down that closes it, 48 px card rows first in the body, a kind chip, the key facts, the sources folded, no sideways
        scroll at 360 px; a 360 px side panel on a desktop (docs/atlas-v2-design.md §7 "The popup as a bottom sheet")
    12 WHOLE-STATE SELECTION (2026-10-18): a tap on empty land inside a state, a people or a culture that has a card selects the whole of it in the card
        windows' gold — the fill (the land blended with gold at 0.24), the outline and the glow — kept through a drag and a year it is alive in; a state with
        no card by the rule gives nothing; marks and names keep priority; the hidden keys list is the keyboard route (docs/atlas-v2-design.md §7 "Whole-state
        selection")
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
    check("no polity carries a mark on the Personal globe (the star is gone, decision b of 2026-10-18): the reader's polities are named and have no mark", !mk.some((m) => /^pol:/.test(m.id) || m.marker === "star" || m.cls === "polity") && lpers.length >= 1, mk.filter((m) => /^pol:/.test(m.id)).length + " polity marks, " + lpers.length + " polity names");
    // the FILL (2026-10-18, one neutral fill): an unflagged state's face is the plain land in Personal AND in Full — nothing paints a state apart from its neighbours but its
    // border (docs/atlas.md §2 (a)); what the Personal Atlas withholds from a state that is not the reader's is its name, its mark and its tap. The probe is the polity's own label
    // anchor (inside its face); the points around it that read as land in the present and are not the darker empty land in Full are the face's, and they read the land in both modes
    const probe = unflagged.find((p) => p.kind === "polity");   // a state (a people is a stipple: its ground reads as land either way)
    if (probe) {
      const pts = [[0, 0], [0, 14], [0, -14], [14, 0], [-14, 0], [10, 10], [-10, 10], [10, -10], [-10, -10]].map(([dx, dy]) => [probe.sx + dx, probe.sy + dy]);
      const read = async () => { const out = []; for (const p of pts) out.push(await pixel(page, p[0], p[1])); return out; };
      const pPers = await read();
      await mode(page, "full"); const pFull = await read();
      await year(page, 2025); await mode(page, "map"); const pLand = await read();
      const landish = pts.map((_, i) => near(pLand[i], pLand[0], 4) || near(pLand[i], pLand[1], 4));   // the land's own colour: what most points read in the present
      const inFace = pts.map((_, i) => landish[i] && near(pFull[i], pLand[i], 6));   // the face's points: the land colour in Full (the darker empty land outside the face, a border's stroke, are not)
      const nF = inFace.filter(Boolean).length;
      check(probe.text + " (not theirs): its face is the plain land in Full (at " + nF + " of 9 probe points)", nF >= 3, "full " + pFull[0] + " · land " + pLand[0]);
      const nPlain = pts.filter((_, i) => inFace[i] && near(pPers[i], pLand[i], 6)).length;
      check("…and the plain land in Personal at every one of those points (" + nPlain + " of " + nF + ")", nF >= 3 && nPlain === nF, pts.map((_, i) => inFace[i] ? "personal " + pPers[i] + " / land " + pLand[i] : "").filter(Boolean).join(" | "));
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
    // 2026-10-18: the sheet is DOCKED on the frame's bottom edge (the year rail steps aside under it, as under the menu) — it used to end above the rail
    check("390 × 844: the open sheet lies wholly inside the frame, docked on its bottom edge, the year rail stepped aside", geo.card[0] >= geo.frame[0] - 0.5 && geo.card[2] <= geo.frame[2] + 0.5 && geo.card[1] >= geo.frame[1] && Math.abs(geo.card[3] - geo.frame[3]) <= 1 && geo.rail[3] - geo.rail[1] < 1, JSON.stringify({ card: geo.card, rail: geo.rail, frame: geo.frame }));
    check("…its rows are at least 48 px tall (a finger's row, 2026-10-18) and inside the sheet's width", geo.rows.length === own.length && geo.rows.every((r) => r[4] >= 48 && r[0] >= geo.card[0] && r[2] <= geo.card[2]), JSON.stringify(geo.rows.slice(0, 2)));
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
    // the keyboard's hidden list, read while the stack is in the clear (its popup's sheet, taller since decision f's list, covers the ring once open: a mark under the chrome is not a key)
    const keys = await A(page, (c) => c.study.keys());
    check("the hidden list names the stack for the keyboard: \"Rome, N places\"", keys.some((k) => k.id === sm.id && /^Rome, \d+ places/.test(k.text)), keys.filter((k) => /^stk:/.test(k.id)).map((k) => k.text).join(" | "));
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
  console.log("\n\x1b[1m5) glyphs: a shape per class, told apart by shape, legible at 8 px (the capital's square at 16), a 32 px hit area; areas have no mark; the Legend lists them\x1b[0m\n");
  {
    const { ctx, page, errors } = await open(browser, READER);
    await mode(page, "full"); await year(page, 2025);
    // the glyphs' pixels: a bitmap of the ink round each mark on the label canvas, compared pairwise (Jaccard) — a shape, not a colour, tells them apart.
    // Sampled over three views at one zoom (1.5 km/px, where markHalf is 8: since decision a of 2026-10-18 the capital's square is 16 px across and every
    // other glyph 8, a hill 6): the eastern Mediterranean (El Alamein's battle, Cairo), Greece (Olympus and Sounion's peaks, the sites), central Europe
    // (Dunkirk's battle, the Kahlenberg, Vienna; the Berlin Wall's building class is in Berlin's stack)
    // the INK of a glyph: the pixels that are not the paper's colour (a hollow mark's fill is the paper, its outline the ink; the reader's own are filled with the accent)
    const mask = (m) => page.evaluate((m) => { const c = document.querySelector(".atlas2").__atlas2, halo = c.colours().halo, hr = parseInt(halo.slice(1, 3), 16), hg = parseInt(halo.slice(3, 5), 16), hb = parseInt(halo.slice(5, 7), 16); const cv = document.querySelector(".atlas2-labels"), d = cv.width / cv.getBoundingClientRect().width, r = Math.ceil((m.h + 3) * d), cx = Math.round(m.x * d), cy = Math.round(m.y * d); const img = cv.getContext("2d").getImageData(cx - r, cy - r, 2 * r + 1, 2 * r + 1); const out = []; let n = 0; for (let i = 0; i < img.data.length; i += 4) { const a = img.data[i + 3]; const on = a > 100 && (Math.abs(img.data[i] - hr) + Math.abs(img.data[i + 1] - hg) + Math.abs(img.data[i + 2] - hb) > 60) ? 1 : 0; out.push(on); n += on; } return { w: 2 * r + 1, bits: out, n }; }, m);
    const jaccard = (a, b) => { const w = Math.min(a.w, b.w); let inter = 0, uni = 0; for (let y = 0; y < w; y++) for (let x = 0; x < w; x++) { const p = a.bits[y * a.w + x], q = b.bits[y * b.w + x]; if (p && q) inter++; if (p || q) uni++; } return uni ? inter / uni : 1; };
    const sample = {}, seenCls = {}; let lone = null, mk = [];
    for (const [lon, lat] of [[31, 27.5], [22.5, 38.5], [9.4, 49.7]]) {
      await view(page, lon, lat, 1.5);
      const lv = await live(page);
      for (const m of lv) if (m.cls && m.h >= 3) seenCls[m.cls] = (seenCls[m.cls] || 0) + 1;
      for (const m of lv) { if (!m.cls || m.h < 3 || sample[m.cls]) continue; if (lv.some((o) => o !== m && Math.hypot(o.x - m.x, o.y - m.y) < 2 * m.h + 6)) continue; sample[m.cls] = { m, mask: await mask(m) }; }   // a mark with no other within its box
      if (!lone) { const l = lv.find((m) => m.cls && m.cls !== "stack" && !lv.some((o) => o !== m && Math.hypot(o.x - m.x, o.y - m.y) < 40)); if (l) lone = { id: l.id, hit: (await A(page, (c, p) => c.study.near(p[0] + 15, p[1], false), [l.x, l.y])).includes(l.id) }; }   // asked in this view, before the next moves it
      mk = mk.concat(await marks(page));
    }
    check("three views at 1.5 km/px draw marks of the settlement, site, battle and peak classes (and a stack) at 6 px or larger", ["settlement", "site", "battle", "peak", "stack"].every((c) => seenCls[c]), Object.entries(seenCls).map(([c, n]) => c + " " + n).join(", "));
    check("each sampled glyph has ink (at least 12 outline pixels at 8 px, 16 for the capital's square): " + Object.keys(sample).join(", "), Object.keys(sample).length >= 4 && Object.values(sample).every((s) => s.mask.n >= 12), Object.entries(sample).map(([c, s]) => c + " " + s.mask.n + "px").join(", "));
    // THE DRAWN SIZES (decision a, 2026-10-18; the owner's phone: "circles, diamonds and every other icon except the capital-city squares should be about
    // 50 % smaller"): the ink's span, read off the canvas — a disc's and a diamond's are about half the capital square's (before: the same 15–16 px)
    const span = (mk) => { let x0 = mk.w, x1 = -1, y0 = mk.w, y1 = -1; for (let y = 0; y < mk.w; y++) for (let x = 0; x < mk.w; x++) if (mk.bits[y * mk.w + x]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } return x1 < 0 ? 0 : Math.max(x1 - x0, y1 - y0) + 1; };
    const spans = Object.fromEntries(Object.entries(sample).map(([c, s]) => [c, span(s.mask)]));
    const ratio = (c) => spans.capital ? spans[c] / spans.capital : NaN;
    check("the capital's square is drawn at its full size (14–17 px across at 1.5 km/px) and a city's disc and a site's diamond at about half of it (0.35–0.65)", spans.capital >= 14 && spans.capital <= 17 && ["settlement", "site"].every((c) => spans[c] > 0 && ratio(c) >= 0.35 && ratio(c) <= 0.65), Object.entries(spans).map(([c, v]) => c + " " + v + "px").join(", ") + "; disc/capital " + ratio("settlement").toFixed(2) + ", diamond/capital " + ratio("site").toFixed(2));
    check("…and the city ring stays large enough for its count: 16–20 px of ink across (a 9.5 px half-extent, its 2 px outline inside it: a 9 px bold two-digit figure needs an inner radius of about 7 px)", spans.stack >= 16 && spans.stack <= 20, spans.stack + " px");
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
    check("the Legend lists the seven classes (a capital's square since decision b, 2026-10-17; no polity row since 2026-10-18), each with its glyph drawn (an SVG path) and its words", key.length === 7 && key.every((k) => k.svg && k.word.length > 3 && k.d > 10) && key.map((k) => k.cls).join(",") === AS.MARK_CLASSES.map((m) => m.cls).join(","), key.map((k) => k.cls + ": " + k.word).join(" | "));
    // NO STAR ANYWHERE (decision b, 2026-10-18; the owner's phone: "remove all star (state) icons"): not drawn, not in the Legend, not in the hit list
    await view(page, 12, 48, 9); await year(page, 1500);
    const eu = await A(page, (c) => { const live = c.study.liveMarks(), all = c.study.marks(); const names = c.labels().filter((p) => p.hist && /^pol:/.test(p.id) && p.text); const hits = []; for (const p of names.slice(0, 12)) for (const id of c.study.near(p.sx, p.sy, true)) hits.push(id); return { live: live.length, stars: live.filter((m) => m.shape === "star" || m.cls === "polity" || /^pol:/.test(m.id)).length, laid: all.filter((m) => m.marker === "star" || m.cls === "polity" || /^pol:/.test(m.id)).length, names: names.length, hits: hits.filter((id) => /^pol:/.test(id)).length, tried: hits.length }; });
    // (in the Full Atlas of 396 marks a state's name that no card links comes after the study names and few find room — one or two here; the names' rules are untouched)
    check("Europe in 1500, the Full Atlas: a state is named (" + eu.names + ") but none has a mark — no star drawn, none in the layout, and a tap at a state's name finds no polity in the marks' hit list", eu.names >= 1 && eu.stars === 0 && eu.laid === 0 && eu.hits === 0 && eu.live > 100, JSON.stringify(eu));
    check("…and the Legend has no state row and no star (every key is one of the seven classes, none a polity, none worded as a state, people or culture)", !key.some((k) => k.cls === "polity" || /state|people|culture/i.test(k.word)) && key.every((k) => ["capital", "settlement", "site", "battle", "peak", "building", "stack"].includes(k.cls)), key.map((k) => k.cls).join(","));
    await year(page, 2025);
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

  /* ------------------------------------------------------------------ 8  the stack's list (decision f, 2026-10-17) */
  console.log("\n\x1b[1m8) a stack of more than 8 places lists its places' names above the pager; a tap jumps to the place; the swipe, the arrows and \"n of N\" stay\x1b[0m\n");
  {
    const ROME = "city:1159151593", VAT = "city:1159127243";
    const { ctx, page, errors } = await open(browser, READER, { phone: true });
    await mode(page, "full"); await year(page, 2025); await view(page, 12.49, 41.89, 3);
    const lv = await live(page), sm = lv.find((m) => m.members && m.city === ROME);
    check("Rome's stack in the Full Atlas holds more than 8 places", !!sm && sm.count > 8, sm ? String(sm.count) : "no stack");
    const b = await box(page);
    await page.touchscreen.tap(b.x + sm.x, b.y + sm.y); await sleep(600);
    const st = async () => page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2, ul = document.querySelector(".atlas2-pager-list"), rows = [...ul.querySelectorAll("button[data-i]")]; return { hidden: ul.hidden, n: rows.length, names: rows.map((r) => r.firstChild.textContent), current: rows.findIndex((r) => r.getAttribute("aria-current") === "true"), scrolls: ul.scrollHeight > ul.clientHeight + 2, h: ul.getBoundingClientRect().height, pagerN: document.querySelector(".atlas2-pager-n").textContent, pagerHidden: document.querySelector(".atlas2-pager").hidden, sel: c.selectedId(), stack: c.study.stack(), listBottom: ul.getBoundingClientRect().bottom, rowTop: document.querySelector(".atlas2-pager-row").getBoundingClientRect().top }; });
    let s = await st();
    check(`the popup shows a list of the stack's ${sm.count} names, the first marked current, above the pager row`, !s.hidden && s.n === sm.count && s.current === 0 && s.listBottom <= s.rowTop + 1, JSON.stringify({ hidden: s.hidden, n: s.n, current: s.current }));
    check("…every row is the place's own full name", s.names.every((n, i) => REG.get(s.stack.ids[i]) && REG.get(s.stack.ids[i]).name === n), s.names.slice(0, 4).join(" | "));
    check("…and the list scrolls (five rows tall) rather than pushing the pager down", s.scrolls && s.h <= 180, `height ${Math.round(s.h)} px`);
    await page.click(".atlas2-pager-list button[data-i='4']"); await sleep(350); s = await st();
    check("a tap on the fifth name jumps to page 5: that place is selected, the row current, \"5 of N\" shown", s.pagerN === "5 of " + sm.count && s.sel === s.stack.ids[4] && s.current === 4, JSON.stringify({ n: s.pagerN, sel: s.sel, current: s.current }));
    await page.click(".atlas2-pager-next"); await sleep(300); s = await st();
    check("the › arrow still turns the page (6 of N) and the list's current row follows", s.pagerN === "6 of " + sm.count && s.current === 5);
    const cdp = await ctx.newCDPSession(page);
    const cr = await page.$eval(".atlas2-card-head", (e) => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    const swipe = async (dir) => { const x0 = cr.x + 60 * dir, y0 = cr.y; await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x0, y: y0 }] }); for (let i = 1; i <= 5; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x0 - 24 * i * dir, y: y0 + i }] }); await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await sleep(350); };
    await swipe(1); s = await st();
    check("a swipe still turns the page (7 of N)", s.pagerN === "7 of " + sm.count && s.current === 6, s.pagerN);
    const last = sm.count - 1; await page.click(`.atlas2-pager-list button[data-i='${last}']`); await sleep(350); s = await st();
    const seen = await page.$eval(".atlas2-pager-list", (ul) => { const b = ul.querySelector("button[aria-current='true']"), r = b.getBoundingClientRect(), u = ul.getBoundingClientRect(); return r.top >= u.top - 1 && r.bottom <= u.bottom + 1; });
    check("the last name, tapped, is page N and the list has scrolled it into view", s.pagerN === sm.count + " of " + sm.count && seen);
    await shot(page, "rome-stack-list");
    await page.keyboard.press("Escape"); await sleep(200);
    // a small stack has no list: Vatican City's (3 places) at 0.3 km/px
    await view(page, 12.455, 41.903, 0.3);
    const lv2 = await live(page), vm = lv2.find((m) => m.members && m.city === VAT);
    check("Vatican City's stack (≤ 8 places) is on screen to tap", !!vm, vm ? String(vm.count) : "none");
    if (vm) { await page.touchscreen.tap(b.x + vm.x, b.y + vm.y); await sleep(600); s = await st(); check("…its popup pages without a list (8 or fewer places)", !s.pagerHidden && s.hidden && s.n === 0 && /^1 of \d+$/.test(s.pagerN), JSON.stringify({ hidden: s.hidden, n: s.n, pagerN: s.pagerN })); }
    allErrors.push(...errors); await ctx.close();
  }

  /* ------------------------------------------------------------------ 9  a name never covers its own mark (decision d, 2026-10-17) */
  console.log("\n\x1b[1m9) a place's name never covers its own mark: in the Full Atlas at Rome, Athens and Jerusalem no label box covers more than 10 % of its own mark's box\x1b[0m\n");
  {
    const { ctx, page, errors } = await open(browser, READER, { phone: true });
    await mode(page, "full"); await year(page, 2025);
    const inter = (r, b) => Math.max(0, Math.min(r[2], b[2]) - Math.max(r[0], b[0])) * Math.max(0, Math.min(r[3], b[3]) - Math.max(r[1], b[1]));
    let pairs = 0; const bad = [];
    for (const [name, lon, lat] of [["Rome", 12.4964, 41.9028], ["Athens", 23.7275, 37.9838], ["Jerusalem", 35.2137, 31.7683]]) for (const k of [3, 0.5, 0.15]) {
      await view(page, lon, lat, k);
      const lv = await live(page), lb = await labels(page), byId = new Map(lv.map((m) => [m.id, m]));
      let here = 0;
      for (const p of lb) {
        const m = byId.get(p.id); if (!m || !p.rects) continue;   // a name whose place has a drawn mark (a single mark or a stack)
        const mb = [m.x - m.h, m.y - m.h, m.x + m.h, m.y + m.h], area = (2 * m.h) * (2 * m.h);
        const cover = p.rects.reduce((s, r) => s + inter(r, mb), 0) / area;
        pairs++; here++;
        if (cover > 0.10) bad.push({ at: name + " " + k, id: p.id, text: p.text, cover: Math.round(cover * 100) + " %" });
      }
      console.log(`  (${name} at ${k} km/px: ${here} names with a mark of their own among ${lb.length} names and ${lv.length} marks)`);
    }
    check(`over ${pairs} name-and-mark pairs no label box covers more than 10 % of its own mark's box`, pairs >= 20 && bad.length === 0, JSON.stringify(bad.slice(0, 5)));
    allErrors.push(...errors); await ctx.close();
  }

  /* ------------------------------------------------------------------ 10  the owner's feedback of 2026-10-17: capitals, the house, bare names, the kinds */
  console.log("\n\x1b[1m10) 2026-10-17: a capital is a square and a building a house (b); a label drops its ', <country>' qualifier, the popup keeps it (d); the kinds decided (e)\x1b[0m\n");
  {
    const { ctx, page, errors } = await open(browser, READER);
    await mode(page, "full"); await year(page, 2025);
    const markOf = async (id) => (await marks(page)).find((m) => m.id === id) || null;
    // (b) Babylon: a site that was a capital (the registry's statements) wears the capital's square; Rome's stack still a ring
    await view(page, 44.42, 32.54, 3);
    const bab = await markOf("pl:q5684");
    check("Babylon (a site, the capital of Babylonia by the registry's statements) is drawn as a SQUARE: the capital class wins over the site's diamond", !!bab && bab.cls === "capital" && bab.marker === "square", JSON.stringify(bab));
    // a building is a house: the Pantheon's region holds buildings — any building mark on screen is a house, and no mark is a building square
    await view(page, 12.5, 41.9, 3);
    const mk = await marks(page);
    const houses = mk.filter((m) => m.cls === "building"), caps = mk.filter((m) => m.cls === "capital");
    check("over Latium every building mark is a HOUSE (a pointed-top pentagon) and every capital mark a square (" + houses.length + " buildings, " + caps.length + " capitals)", houses.length >= 1 && houses.every((m) => m.marker === "house") && caps.length >= 1 && caps.every((m) => m.marker === "square"), houses.slice(0, 3).map((m) => m.id + ":" + m.marker).join(" ") + " | " + caps.slice(0, 3).map((m) => m.id + ":" + m.marker).join(" "));
    const key = await page.evaluate(() => [...document.querySelectorAll(".atlas2-marks-key > div")].map((d) => ({ cls: d.dataset.cls, d: (d.querySelector("path") || {}).getAttribute ? d.querySelector("path").getAttribute("d") : "", word: d.querySelector("dd").textContent })));
    const kc = key.find((k) => k.cls === "capital"), kb = key.find((k) => k.cls === "building");
    check("the Legend lists the capital (a square) and the building (a house) with different glyphs", !!kc && !!kb && kc.d !== kb.d && /capital/i.test(kc.word) && /building/i.test(kb.word), key.map((k) => k.cls).join(","));
    // (d) the bare name on the label, the full name in the popup
    for (const c of [{ id: "pl:q583718", name: "Kirchberg, Luxembourg", text: "Kirchberg", view: [6.1456, 49.6275, 1.5] }, { id: "pl:q1435589", name: "Folsom, New Mexico", text: "Folsom", view: [-103.9181, 36.8481, 1.5] }, { id: "pl:q2246183", name: "Cures, Sabinum", text: "Cures", view: [12.6866, 42.1825, 0.7] }]) {
      await view(page, c.view[0], c.view[1], c.view[2]);
      const lab = (await labels(page)).find((p) => p.id === c.id);
      check("'" + c.name + "' is labelled \"" + c.text + "\"", !!lab && lab.text === c.text, lab ? lab.text : "not placed");
      await A(page, (c, id) => c.select(id, { open: true }), c.id); await sleep(250);
      check("…its popup carries the full name", (await page.$eval(".atlas2-card-title", (e) => e.textContent)) === c.name, await page.$eval(".atlas2-card-title", (e) => e.textContent));
      await A(page, (c) => c.clearSelection());
    }
    // (e) the kinds: Taranto a city (its mark a settlement's or a capital's, never a site's), Isandlwana a battle, Mesa Verde a site
    await view(page, 17.2431, 40.4711, 3);
    const tar = await markOf("pl:q13498");
    check("Taranto is a living city: a disc (or a capital's square), not a site's diamond", !!tar && (tar.cls === "settlement" || tar.cls === "capital") && tar.marker !== "diamond", JSON.stringify(tar));
    await view(page, 30.6528, -28.3589, 3);
    const isa = await markOf("pl:q3782078");
    check("Isandlwana is a battle: a saltire", !!isa && isa.cls === "battle" && isa.marker === "cross", JSON.stringify(isa));
    await view(page, -108.5172, 37.15, 3);
    const mv = await markOf("pl:q49693597");
    check("Mesa Verde is a site: a diamond", !!mv && mv.cls === "site" && mv.marker === "diamond", JSON.stringify(mv));
    allErrors.push(...errors); await ctx.close();
  }

  /* ------------------------------------------------------------------ 11  the popup as a bottom sheet (2026-10-18) */
  console.log("\n\x1b[1m11) the popup is a bottom sheet on a phone: docked on the frame's bottom edge, three snap heights, a touch drag, 48 px rows, no sideways scroll; a 360 px panel on a desktop\x1b[0m\n");
  for (const [w, h] of [[390, 844], [360, 740]]) {
    const { ctx, page, errors } = await open(browser, READER, { phone: true, w, h });
    await mode(page, "full"); await year(page, -100); await view(page, 12.5, 41.9, 40);
    await A(page, (c) => c.select("pol:rome", { open: true })); await page.waitForSelector(".atlas2-study-cards", { state: "attached", timeout: 20000 }); await sleep(400);
    const geo = () => page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2, f = document.querySelector(".atlas2").getBoundingClientRect(), el = document.querySelector(".atlas2-card"), r = el.getBoundingClientRect(), body = el.querySelector(".atlas2-card-body"), rows = [...el.querySelectorAll(".atlas2-study-card")].map((a) => a.getBoundingClientRect().height); const first = body.firstElementChild; const d = el.querySelector(".atlas2-card-sources"); return { card: c.card(), sel: c.selectedId(), frame: [f.left, f.top, f.right, f.bottom], rect: [r.left, r.top, r.right, r.bottom], h: r.height, fh: c.frame()[1], rows, firstIsCards: !!first && first.classList.contains("atlas2-study-cards"), chip: (el.querySelector(".atlas2-card-chip") || {}).textContent || "", years: (el.querySelector(".atlas2-card-years") || {}).textContent || "", kindText: el.querySelector(".atlas2-card-kind").textContent, facts: [...el.querySelectorAll(".atlas2-card-facts dt")].map((x) => x.textContent), sources: d ? { open: d.open, text: d.textContent.length } : null, scrollX: body.scrollWidth - body.clientWidth, docX: document.documentElement.scrollWidth - innerWidth, railShown: getComputedStyle(document.querySelector(".atlas2-rail")).display !== "none", zoomShown: getComputedStyle(document.querySelector(".atlas2-zoom")).display !== "none", heights: c.sheetHeights(), bodyShown: getComputedStyle(body).display !== "none", scrollTop: body.scrollTop }; });
    let g = await geo(); const hs = g.heights;
    check(`${w}×${h}: the sheet opens at its peek — docked on the frame's bottom edge, about 28 % of the frame tall, the body showing`, g.card.snap === "peek" && Math.abs(g.rect[3] - g.frame[3]) <= 1 && g.h >= g.fh * 0.27 && g.h <= g.fh * 0.34 && g.bodyShown, JSON.stringify({ snap: g.card.snap, h: Math.round(g.h), frame: Math.round(g.fh), bottom: [Math.round(g.rect[3]), Math.round(g.frame[3])] }));
    check("…the head: the name, a kind chip and the years, which still read as one line", g.chip === "Polity" && /BCE/.test(g.years) && /^Polity · /.test(g.kindText), JSON.stringify({ chip: g.chip, years: g.years, kindText: g.kindText }));
    check("…the body: the card rows first, each at least 48 px tall, then the key facts (years, the capital) with the sources folded", g.firstIsCards && g.rows.length >= 3 && g.rows.every((x) => x >= 48) && g.facts[0] === "Years" && g.facts.some((f) => /^Capital/.test(f)) && !!g.sources && !g.sources.open && g.sources.text > 40, JSON.stringify({ rows: g.rows.slice(0, 3).map(Math.round), facts: g.facts, sources: g.sources }));
    check("…no sideways scroll in the sheet or the page; the year rail steps aside under the docked sheet; the zoom pill stays at the peek", g.scrollX <= 0 && g.docX <= 0 && !g.railShown && g.zoomShown, JSON.stringify({ scrollX: g.scrollX, docX: g.docX, rail: g.railShown, zoom: g.zoomShown }));
    await A(page, (c) => c.sheetSnap("half")); await sleep(400); g = await geo();
    check("half: about half the frame, still docked", g.card.snap === "half" && Math.abs(g.h - g.fh * 0.5) <= 2 && Math.abs(g.rect[3] - g.frame[3]) <= 1 && !g.zoomShown, `${Math.round(g.h)} of ${Math.round(g.fh)}`);
    await A(page, (c) => c.sheetSnap("full")); await sleep(400); g = await geo();
    check("full: the frame less the 68 px of the search and menu buttons, the zoom pill hidden under it", g.card.snap === "full" && Math.abs(g.h - (g.fh - 68)) <= 2 && !g.zoomShown, `${Math.round(g.h)} of ${Math.round(g.fh)}`);
    // REAL TOUCH DRAGS through CDP (touchStart, touchMoves, touchEnd): on the handle, down from full to half, down again to the peek, then a flick down that closes
    const cdp = await ctx.newCDPSession(page);
    const at = (sel) => page.$eval(sel, (e) => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + Math.min(20, r.height / 2) }; });
    const drag = async (sel, dy, steps, ms) => { const p = await at(sel); await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: p.x, y: p.y }] }); for (let i = 1; i <= steps; i++) { await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: p.x, y: p.y + dy * i / steps }] }); await sleep(ms); } await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await sleep(500); };
    await drag(".atlas2-grip", hs.full - hs.half + 10, 8, 40); g = await geo();
    check("a touch drag of the handle down from full settles at half", g.card.snap === "half", g.card.snap);
    await drag(".atlas2-grip", hs.half - hs.peek + 10, 8, 40); g = await geo();
    check("…and down again at the peek", g.card.snap === "peek", g.card.snap);
    await drag(".atlas2-grip", 90, 3, 8); g = await geo();
    check("a flick down from the peek closes the sheet and clears the selection", !g.card.open && g.sel === null, JSON.stringify({ open: g.card.open, sel: g.sel }));
    // the body: pulled up it raises the sheet; once the sheet is full the body scrolls instead
    await A(page, (c) => c.select("pol:rome", { open: true })); await sleep(400);
    await drag(".atlas2-card-body", -(hs.full - hs.peek + 10), 8, 40); g = await geo();
    check("a pull up on the body raises the sheet to full", g.card.snap === "full", g.card.snap);
    const st0 = g.scrollTop; await drag(".atlas2-card-body", -160, 8, 40); g = await geo();
    check("…and at full the body scrolls (the sheet stays full)", g.card.snap === "full" && g.scrollTop > st0, `scrollTop ${st0} → ${g.scrollTop}`);
    // a city stack keeps its pager and its list, in the head, at the peek
    await A(page, (c) => c.clearSelection()); await year(page, 2025); await view(page, 12.49, 41.89, 3);
    const sm = await A(page, (c) => (c.study.liveMarks().find((m) => m.members && m.count > 8) || {}).id);
    if (sm) {
      await A(page, (c, id) => c.study.openStack(id), sm); await sleep(500);
      const st = await page.evaluate(() => { const el = document.querySelector(".atlas2-card"), r = el.getBoundingClientRect(), p = el.querySelector(".atlas2-pager-row").getBoundingClientRect(), l = el.querySelector(".atlas2-pager-list"); return { snap: document.querySelector(".atlas2").__atlas2.card().snap, pagerIn: p.top >= r.top && p.bottom <= r.bottom + 0.5, list: !l.hidden && l.getBoundingClientRect().height <= 130, n: el.querySelector(".atlas2-pager-n").textContent, h: r.height }; });
      check("a stack's sheet keeps its pager and its list at the peek (the peek grows to show them)", st.snap === "peek" && st.pagerIn && st.list && /^1 of /.test(st.n), JSON.stringify(st));
    } else check("a stack at Rome", false, "no ring found");
    allErrors.push(...errors); await ctx.close();
  }
  {   // the desktop: a 360 px side panel with the same body
    const { ctx, page, errors } = await open(browser, READER); await mode(page, "full"); await year(page, -100); await A(page, (c) => c.select("pol:rome", { open: true })); await sleep(400);
    const d = await page.evaluate(() => { const el = document.querySelector(".atlas2-card"), r = el.getBoundingClientRect(), body = el.querySelector(".atlas2-card-body"); return { w: r.width, snap: document.querySelector(".atlas2").__atlas2.card().snap, firstIsCards: body.firstElementChild.classList.contains("atlas2-study-cards"), chip: el.querySelector(".atlas2-card-chip").textContent, rows: [...el.querySelectorAll(".atlas2-study-card")].map((a) => a.getBoundingClientRect().height) }; });
    check("a desktop shows a 360 px side panel with the same body (the rows first, 48 px each, the kind chip)", Math.abs(d.w - 360) <= 1 && d.snap === null && d.firstIsCards && d.chip === "Polity" && d.rows.every((x) => x >= 48), JSON.stringify(d));
    allErrors.push(...errors); await ctx.close();
  }

  /* ------------------------------------------------------------------ 12  whole-state selection (2026-10-18) */
  console.log("\n\x1b[1m12) a tap on empty land inside a state with a card selects the WHOLE state in gold — the fill, the outline, the glow — kept through a drag and a year change; a state with no card gives nothing; marks and names keep priority; the keyboard route\x1b[0m\n");
  for (const phone of [false, true]) {
    const who = phone ? "phone" : "desktop";
    const { ctx, page, errors } = await open(browser, READER, phone ? { phone: true } : {});
    await mode(page, "full"); await year(page, -100); await view(page, -4, 40.3, 3);   // Roman Spain in 100 BCE: deep inside Rome's face, few marks
    await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.historyOK && c.historyOK(); }, null, { timeout: 120000 }); await settle(page);
    const findClear = (want) => A(page, (c, a) => { const [W, H] = c.frame(), ch = c.chromeRects(); const inChrome = (x, y) => ch.some((r) => x >= r[0] - 8 && x <= r[2] + 8 && y >= r[1] - 8 && y <= r[3] + 8); for (let y = 80; y < H * 0.6; y += 10) for (let x = 20; x < W - 20; x += 10) { if (inChrome(x, y) || c.study.near(x, y, a.touch).length || c.hitAt(x, y).length) continue; const s = c.stackAt(x, y); if (s.length === 1 && s[0] === a.want) return [x, y]; } return null; }, { want, touch: phone });
    const clear = await findClear("pol:rome");
    check(`${who}: a point of empty land inside Rome's face, clear of every mark, name and control`, !!clear, JSON.stringify(clear));
    if (!clear) { allErrors.push(...errors); await ctx.close(); continue; }
    const bb = await box(page);
    const tap = async (x, y) => { if (phone) await page.touchscreen.tap(bb.x + x, bb.y + y); else await page.mouse.click(bb.x + x, bb.y + y); await sleep(900); };
    // the gold line's pixels on the label canvas (the outline; the glow is paler and is not counted)
    const goldInk = () => page.evaluate(() => { const cv = document.querySelector(".atlas2-labels"), d = cv.getContext("2d").getImageData(0, 0, cv.width, cv.height).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200 && d[i] > 240 && d[i + 1] > 170 && d[i + 1] < 215 && d[i + 2] < 110) n++; return n; });
    const tinted = (a, b) => (a[0] - a[2]) - (b[0] - b[2]) >= 20;   // the gold pulls red up and blue down: the land blended with the gold at 0.24
    const before = await pixel(page, clear[0], clear[1]);
    await tap(clear[0], clear[1]);
    const s1 = await A(page, (c, p) => ({ sel: c.selection(), id: c.selectedId(), card: c.card(), px: c.pixelAt(p[0], p[1]), here: document.querySelectorAll(".atlas2-card-here").length }), clear);
    const ink1 = await goldInk();
    check("the tap selects the whole state: Rome, its popup open, the tapped pixel the land blended with gold", s1.id === "pol:rome" && s1.card.open && s1.card.id === "pol:rome" && tinted(s1.px, before), JSON.stringify({ id: s1.id, before, after: s1.px, card: s1.card }));
    check("…its outline is stroked in the gold on the label canvas, from the face's rings at the view's level; one face under the tap, so no \"Also here\"", s1.sel.rings > 0 && s1.sel.points > 100 && ink1 > 200 && s1.here === 0, JSON.stringify({ rings: s1.sel.rings, points: s1.sel.points, level: s1.sel.level, goldPixels: ink1 }));
    // A DRAG keeps it lit: read with the pointer still down (the line alone — the glow waits for the settled frame), then after the release
    const v0 = await A(page, (c) => [c.view.lon, c.view.lat]);
    const d0f = await A(page, (c) => { const [W, H] = c.frame(), ch = c.chromeRects(); const free = (x, y) => !ch.some((r) => x >= r[0] - 8 && x <= r[2] + 8 && y >= r[1] - 8 && y <= r[3] + 8); for (let y = H * 0.3; y < H * 0.75; y += 20) for (let x = 20; x < W - 120; x += 20) if (free(x, y) && free(x + 90, y + 36)) return [x, y]; return null; });   // a start clear of the popup (a desktop's side panel opens over the frame)
    const d0 = [bb.x + d0f[0], bb.y + d0f[1]];
    await page.mouse.move(d0[0], d0[1]); await page.mouse.down(); for (let i = 1; i <= 6; i++) { await page.mouse.move(d0[0] + 15 * i, d0[1] + 6 * i); await sleep(40); }
    await sleep(150); const mid = await A(page, (c) => ({ id: c.selectedId(), v: [c.view.lon, c.view.lat] })), inkMid = await goldInk();
    await page.mouse.up(); await sleep(900);
    const s2 = await A(page, (c) => ({ id: c.selectedId(), card: c.card().open, ent: c.selection().ent })), ink2 = await goldInk();
    check("a drag keeps the selection lit: the view moved, the outline is drawn with the pointer down and after the release, the popup stays open", mid.id === "pol:rome" && (mid.v[0] !== v0[0] || mid.v[1] !== v0[1]) && inkMid > 100 && s2.id === "pol:rome" && s2.ent >= 0 && s2.card && ink2 > 200, JSON.stringify({ mid, v0, inkMid, after: s2, ink2 }));
    // A YEAR CHANGE that keeps the state alive keeps the selection; one that does not draws nothing, and back again it is drawn again
    await year(page, -50); const y1 = await A(page, (c) => ({ id: c.selectedId(), faces: c.selection().faces.length, rings: c.selection().rings })), inkY1 = await goldInk();
    await year(page, 2025); const y2 = await A(page, (c) => ({ id: c.selectedId(), faces: c.selection().faces.length })), inkY2 = await goldInk();
    await year(page, -100); await sleep(600); const y3 = await A(page, (c) => ({ id: c.selectedId(), faces: c.selection().faces.length })), inkY3 = await goldInk();
    check("a year change that keeps Rome alive keeps it selected and outlined (50 BCE); the present day draws no face of it; 100 BCE again draws it again", y1.id === "pol:rome" && y1.faces > 0 && y1.rings > 0 && inkY1 > 200 && y2.id === "pol:rome" && y2.faces === 0 && inkY2 < 20 && y3.faces > 0 && inkY3 > 200, JSON.stringify({ y1, inkY1, y2, inkY2, y3, inkY3 }));
    await view(page, -4, 40.3, 3);   // the view the drag moved, restored: `clear` is the same ground again
    // a tap on empty land ELSEWHERE closes it (a tap on no state, or on land no state covers)
    const sea = await A(page, (c, a) => { const [W, H] = c.frame(), ch = c.chromeRects(); const inChrome = (x, y) => ch.some((r) => x >= r[0] - 8 && x <= r[2] + 8 && y >= r[1] - 8 && y <= r[3] + 8); for (let y = 80; y < H * 0.6; y += 10) for (let x = 20; x < W - 20; x += 10) { if (inChrome(x, y) || c.study.near(x, y, a).length || c.hitAt(x, y).length) continue; if (!c.stackAt(x, y).length) return [x, y]; } return null; }, phone);
    if (sea) { await tap(sea[0], sea[1]); const s3 = await A(page, (c) => ({ id: c.selectedId(), card: c.card().open })), ink3 = await goldInk(); check("a tap where nothing has a card clears it: no selection, no popup, no outline", s3.id === null && !s3.card && ink3 < 20, JSON.stringify({ s3, ink3 })); }
    // PRIORITY: a mark inside the face is picked, not the state under it
    const mk = await A(page, (c, touch) => { for (const m of c.study.liveMarks()) { if (m.members || !c.study.tappable(m.id)) continue; const near = c.study.near(m.x, m.y, touch); if (near.length !== 1 || near[0] !== m.id) continue; const s = c.stackAt(m.x, m.y); if (s.includes("pol:rome")) return { id: m.id, x: m.x, y: m.y }; } return null; }, phone);
    check("a lone mark lying inside Rome's face", !!mk, JSON.stringify(mk));
    if (mk) { await tap(mk.x, mk.y); const s4 = await A(page, (c) => ({ id: c.selectedId(), card: c.card() })), ink4 = await goldInk(); check("a tap on it picks the MARK, not the state under it: the place's popup, no gold outline", s4.id === mk.id && s4.card.open && s4.card.id === mk.id && ink4 < 20, JSON.stringify({ s4, ink4 })); }
    // THE KEYBOARD ROUTE: the hidden list of names holds Rome's; Enter on it makes the same selection
    await A(page, (c) => c.clearSelection()); await sleep(300); await settle(page);
    const key = await page.evaluate(() => { const b = document.querySelector('.atlas2-keys button[data-id="pol:rome"]'); if (!b) return null; b.focus(); return b.textContent; });
    check("the hidden list of names on the map has a button for Rome", /^Rome, /.test(key || ""), key);
    if (key) { await page.keyboard.press("Enter"); await sleep(900); const s5 = await A(page, (c, p) => ({ id: c.selectedId(), card: c.card(), rings: c.selection().rings, px: c.pixelAt(p[0], p[1]) }), clear), ink5 = await goldInk(); check("Enter on it selects the whole state the same way: the gold fill, the outline, the popup", s5.id === "pol:rome" && s5.card.open && s5.rings > 0 && ink5 > 200 && tinted(s5.px, before), JSON.stringify({ id: s5.id, rings: s5.rings, ink5, px: s5.px })); }
    // NO CARD, NO SELECTION: in the Personal Atlas Rome is not the reader's (no studied card links it) — the same tap does nothing
    await A(page, (c) => c.clearSelection()); await sleep(200); await mode(page, "personal");
    const ownPol = (await A(page, (c) => c.study.flags())).filter(([id, f]) => f === 2 && id === "pol:rome").length;
    check("the seeded reader has no studied card linking Rome (so in Personal it has no card by the rule)", ownPol === 0);
    const pBefore = await pixel(page, clear[0], clear[1]); await tap(clear[0], clear[1]);
    const s6 = await A(page, (c, p) => ({ id: c.selectedId(), card: c.card().open, stack: c.stackAt(p[0], p[1]), px: c.pixelAt(p[0], p[1]) }), clear), ink6 = await goldInk();
    check("in the Personal Atlas the same tap inside Rome does nothing: no selection, no popup, no gold, the pixel unchanged", s6.id === null && !s6.card && s6.stack.length === 0 && ink6 < 20 && !tinted(s6.px, pBefore), JSON.stringify({ s6, ink6, pBefore }));
    allErrors.push(...errors); await ctx.close();
  }

  /* ------------------------------------------------------------------ done */
  console.log("\n" + pass + " ok, " + fail + " failed");
  check("no console error", allErrors.length === 0, allErrors.slice(0, 3).join(" | "));
  await browser.close(); server.close();
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); server.close(); process.exit(1); });
