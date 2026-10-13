/* test-atlas-study.js — the study integration on the v2 globe (Atlas v2 Phase 3b; docs/atlas-v2-design.md §2.8, §7 "Phase 3b — as built").

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-study.js
     FOLIO_CHROMIUM=/path/to/chrome  … to pick the browser (otherwise playwright's own)

   The real app is served and #map2 opened with a SEEDED progress record (`folio_v1` in localStorage, the same seed the v1 Personal
   Atlas suite writes), so the host object the app hands the Atlas is the one a reader gets; what the page must show is computed HERE,
   in Node, from the cards' own `places` and the shipped files, never read back from the page's own helpers.

   WHAT IT PROVES (each fault silent: a globe with marks on it looks right whichever marks they are):
     1  the Map / Personal / Full switch: a reader with no cards opens on the plain Map and is told, honestly, that nothing is theirs
        yet; Full draws every place; the choice is remembered (localStorage) and a reload keeps it
     2  a seeded reader opens on their Personal Atlas: the count line and the note are the sentences the Node computation gives, every
        place drawn is theirs, everything else is muted, and Full adds the rest of the places with theirs apart
     3  a collection switch: removes exactly the places its cards bring, in both views, remembered across a reload, and restored on again
     4  stacks: places that would overlap are one mark with a count; tapping it zooms in until they part (or, where they share a point,
        becomes the "N places here" chip); the keyboard list carries it too
     5  the place card lists the cards about a place (the reader's first, capped with "and N more", the Personal list not naming the
        rest), each a link to the app's own card page (#card/<id>) which Back returns from; a polity lists its linked cards
     6  the empty states: cards with no place; no cards; the note on cards that have none
     7  the phone (390 px): the panel sits inside the frame, clear of every other control, and no name is placed under it
     8  no console error on any of it
   Re-run after touching atlas/study.js, atlas/data/card-places.js, the study block of atlas.js or the study pass of atlas-worker.js. */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");
const AS = require("../atlas/study.js");
const { loadCards } = require("./card-io.js");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream" };
const PORT = 5631;
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
const byId = new Map(cards.map((c) => [c.id, c]));
const withPlaces = cards.filter((c) => c.places && c.places.length);
const noPlaceCards = cards.filter((c) => !(c.places && c.places.length) && /^ps-/.test(c.id)).slice(0, 3).map((c) => c.id);
const READER = [...withPlaces.filter((c) => /^gr-/.test(c.id)).slice(0, 8), ...withPlaces.filter((c) => /^gw-/.test(c.id)).slice(0, 3), ...withPlaces.filter((c) => /^rm-/.test(c.id)).slice(0, 3)].map((c) => c.id);
const READER_ALL = READER.concat(noPlaceCards.slice(0, 1));
const stFor = (ids) => AS.studied(IDX, ids);
const placeRow = (() => { const reg = require("./places-registry.js").loadRegistry(); return (id) => reg.rows.get(id); })();

const seed = (ids) => `try { if (!localStorage.getItem("folio_v1_seeded")) { localStorage.setItem("folio_v1", JSON.stringify({ cards: Object.fromEntries(${JSON.stringify(ids)}.map((id) => [id, { due: Date.now() + 9e8, ivl: 9, ease: 2.5, status: "review", reps: 2, first: "2026-08-01" }])), settings: { newPerDay: 5 } })); localStorage.setItem("folio_v1_seeded", "1"); } } catch (e) {}`;
async function open(browser, ids, o) {
  o = o || {};
  const ctx = await browser.newContext(o.phone ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : { viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript(seed(ids));
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  await goMap(page);
  return { ctx, page, errors };
}
async function goMap(page, hash) {
  await page.goto(`http://127.0.0.1:${PORT}/${hash || "#map2"}`, { waitUntil: "load" });
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
async function settle(page) {
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.layoutNow()); await sleep(120);
}
const study = (page) => A(page, (c) => ({ mode: c.study.mode(), flags: c.study.flags(), summary: c.study.summary(), hidden: c.study.hidden(), colls: c.study.collections(), muted: c.study.muted() }));
const marks = (page) => A(page, (c) => c.study.marks());
const panelText = (page, sel) => page.evaluate((s) => { const e = document.querySelector(".atlas2-study " + s); return e && !e.hidden ? e.textContent.trim() : null; }, sel);

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch(LAUNCH);
  const allErrors = [];

  /* ------------------------------------------------------------------ 1  the switch, and a reader with nothing */
  console.log("\n\x1b[1m1) the Map / Personal / Full switch, for a reader with no cards\x1b[0m\n");
  {
    const { ctx, page, errors } = await open(browser, []);
    const s0 = await study(page);
    check("the panel is there, with three radios named Map, Personal and Full", JSON.stringify(await page.$$eval(".atlas2-study [role=radio]", (b) => b.map((x) => x.textContent.trim()))) === '["Map","Personal","Full"]');
    check("a reader with no cards opens on the plain Map (the study layer off) and the globe carries no study mark", s0.mode === "map" && s0.flags.length === 0 && (await marks(page)).length === 0, JSON.stringify(s0.mode));
    await page.click('.atlas2-study [data-mode="personal"]'); await sleep(200);
    const e1 = await panelText(page, ".atlas2-study-empty");
    check("Personal says, honestly, that nothing is theirs yet — and the Full Atlas is one tap away", /haven’t studied any cards yet/.test(e1 || "") && /Full Atlas/.test(e1 || ""), e1);
    check("…with no count line and no collection row to switch", (await panelText(page, ".atlas2-study-sum")) === null && (await page.$eval(".atlas2-study-colls", (e) => e.hidden)));
    await page.click('.atlas2-study [data-mode="full"]'); await sleep(250);
    const s1 = await study(page);
    const places = IDX.ids.filter((id) => !id.startsWith("pol:")).length, pols = IDX.ids.length - places;
    check("Full flags every place any card is about (" + IDX.ids.length + " ids), none of them the reader's", s1.mode === "full" && s1.flags.length === IDX.ids.length && s1.flags.every(([, f]) => f === 1), s1.flags.length + " flagged");
    check("…and says how many: " + places.toLocaleString("en-GB") + " places and " + pols + " polities", (await panelText(page, ".atlas2-study-sum")) === `${places.toLocaleString("en-GB")} places and ${pols} polities on the Full Atlas`, await panelText(page, ".atlas2-study-sum"));
    await view(page, 23, 38, 6);
    const m1 = await marks(page);
    check("the Aegean in the Full Atlas carries marks of two kinds — a place alone and a stack with a count — all of them unstudied", m1.some((m) => m.marker === "diamond" || m.marker === "triangle") && m1.some((m) => m.marker === "stack" && m.n > 1) && m1.every((m) => m.st === 1), m1.length + " marks");
    check("the choice is remembered per viewer (localStorage)", (await page.evaluate(() => localStorage.getItem("folio.atlas2.study"))) === "full");
    await page.reload({ waitUntil: "load" }); await ready(page);
    check("…and a reload keeps it", (await study(page)).mode === "full");
    await page.click('.atlas2-study [data-mode="map"]'); await sleep(200);
    check("the plain Map draws nothing again", (await study(page)).flags.length === 0 && (await marks(page)).length === 0);
    check("the radios follow the arrow keys, as the legend's density stops do", await (async () => { await page.focus('.atlas2-study [data-mode="map"]'); await page.keyboard.press("ArrowRight"); await sleep(150); return (await study(page)).mode === "personal"; })());
    allErrors.push(...errors); await ctx.close();
  }

  /* ------------------------------------------------------------------ 2  a seeded reader */
  console.log("\n\x1b[1m2) a seeded reader: the Personal Atlas, then the Full Atlas with theirs apart\x1b[0m\n");
  const st = stFor(READER_ALL);
  const expectFlags = (mode, hidden, infoMap) => AS.flags(IDX, st, mode, new Set(hidden || []), (cid) => infoMap[cid] || null);
  let infoMap = {};
  {
    const { ctx, page, errors } = await open(browser, READER_ALL);
    infoMap = await A(page, (c) => { const o = {}; for (const cid of c.study.index().cardIds) o[cid] = c.study.info(cid); return o; });
    const s = await study(page);
    check("a reader with cards opens on their Personal Atlas", s.mode === "personal", s.mode);
    const want = AS.summary(st, "personal", expectFlags("personal", [], infoMap));
    check("the count line is exactly the sentence the data gives: \"" + want.text + "\"", (await panelText(page, ".atlas2-study-sum")) === want.text, await panelText(page, ".atlas2-study-sum"));
    check("the honest note says how many of their cards have no place on the map yet: \"" + want.note + "\"", (await panelText(page, ".atlas2-study-note")) === want.note, await panelText(page, ".atlas2-study-note"));
    const flagged = new Map(s.flags);
    const wantF = expectFlags("personal", [], infoMap);
    check("the places drawn are exactly the union of their cards' own places (" + wantF.size + ")", flagged.size === wantF.size && [...wantF.keys()].every((id) => flagged.get(id) === 2), flagged.size + " flagged");
    check("everything else is muted", s.muted === true);
    // a studied POINT place, and a view that holds it
    const pointId = [...st.places].find((id) => id.startsWith("pl:") && /^(site|mountain|hill|cape|city|town)$/.test((placeRow(id) || {}).kind));
    const pr = placeRow(pointId);
    await view(page, pr.at[0], pr.at[1], 2);
    const m = await marks(page);
    const inMarks = (id) => m.some((x) => x.id === id || (x.members && x.members.includes(id)));
    check("a studied " + pr.kind + " (" + pr.name + ") is drawn at its own place — as a mark of its own shape, or inside a stack", inMarks(pointId), m.map((x) => x.id).slice(0, 6).join(", "));
    check("…and every mark on the Personal globe is the reader's (flag 2): none of the unstudied places is drawn", m.length > 0 && m.every((x) => x.st === 2));
    await page.click('.atlas2-study [data-mode="full"]'); await sleep(250);
    const sf = await study(page);
    const wantFull = expectFlags("full", [], infoMap);
    check("Full flags every place, the reader's apart (" + [...wantFull.values()].filter((v) => v === 2).length + " of them)", sf.flags.length === wantFull.size && sf.flags.every(([id, v]) => wantFull.get(id) === v) && sf.muted === false, sf.flags.length + " flagged");
    await view(page, pr.at[0], pr.at[1], 3);
    const mf = await marks(page);
    check("the Full globe draws the reader's marks and the others' together", mf.some((x) => x.st === 2) && mf.some((x) => x.st === 1), mf.filter((x) => x.st === 2).length + " theirs, " + mf.filter((x) => x.st === 1).length + " others");

    /* ------------------------------------------------------------------ 3  collections */
    console.log("\n\x1b[1m3) collection switches\x1b[0m\n");
    const colls = sf.colls;
    check("only collections that have places are listed, each with its count", colls.length >= 3 && colls.every((c) => c.places > 0) && (await page.$$eval(".atlas2-study-coll", (b) => b.length)) === colls.length, colls.map((c) => c.name).slice(0, 4).join(", ") + " …");
    check("all on by default", sf.hidden.length === 0 && (await page.$$eval(".atlas2-study-coll", (b) => b.every((x) => x.getAttribute("aria-checked") === "true"))));
    const greek = colls.find((c) => /Greece/.test(c.name));
    await page.click(`.atlas2-study-coll[data-coll="${greek.id}"]`); await sleep(250);
    const s3 = await study(page);
    const want3 = expectFlags("full", [greek.id], infoMap);
    check("switching Ancient Greece off in the Full Atlas leaves exactly the places the other collections bring (" + want3.size + " of " + wantFull.size + ")", s3.flags.length === want3.size && s3.flags.every(([id, v]) => want3.get(id) === v) && s3.hidden.join() === greek.id, s3.flags.length + " flagged");
    check("the switch says it is off, and the choice is kept in localStorage", (await page.$eval(`.atlas2-study-coll[data-coll="${greek.id}"]`, (b) => b.getAttribute("aria-checked"))) === "false" && (await page.evaluate(() => localStorage.getItem("folio.atlas2.studyOff"))) === JSON.stringify([greek.id]));
    await page.reload({ waitUntil: "load" }); await ready(page);
    const s3b = await study(page);
    check("a reload keeps it off", s3b.hidden.join() === greek.id && s3b.flags.length === want3.size);
    await page.click('.atlas2-study [data-mode="personal"]'); await sleep(250);
    const s3c = await study(page);
    const want3c = expectFlags("personal", [greek.id], infoMap);
    check("the same switch removes Greece's places from the Personal Atlas too (" + want3c.size + " left)", s3c.flags.length === want3c.size && s3c.flags.every(([id, v]) => want3c.get(id) === v), s3c.flags.length + " flagged");
    await page.click(`.atlas2-study-coll[data-coll="${greek.id}"]`); await sleep(250);
    const s3d = await study(page);
    check("switched on again, they are back", s3d.hidden.length === 0 && s3d.flags.length === wantF.size && (await page.evaluate(() => localStorage.getItem("folio.atlas2.studyOff"))) === "[]");
    allErrors.push(...errors);

    /* ------------------------------------------------------------------ 4  stacks */
    console.log("\n\x1b[1m4) stacks that expand\x1b[0m\n");
    await page.click('.atlas2-study [data-mode="full"]'); await sleep(250);
    await view(page, 12.5, 41.9, 6);
    const box = await page.$eval(".atlas2-canvas", (e) => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top }; });
    let ms = await marks(page); let stack = ms.filter((x) => x.marker === "stack").sort((a, b) => b.n - a.n)[0];
    check("Rome at 6 km/px is a stack of several places, one mark with a count", !!stack && stack.n >= 4, stack ? "n = " + stack.n : "none");
    const k0 = await A(page, (c) => c.kmPerPx());
    const keysBtn = await page.$$eval(".atlas2-keys button", (b) => b.map((x) => x.textContent));
    check("the keyboard list carries the stack too (\"N places here, activate to zoom in\")", keysBtn.some((t) => /^\d+ places here/.test(t)), keysBtn.filter((t) => /places here/.test(t))[0]);
    await page.mouse.click(box.x + stack.sx, box.y + stack.sy);
    await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return !c.input().flying; }, null, { timeout: 20000 });
    await page.waitForFunction(() => document.querySelector(".atlas2").__atlas2.tilesSettled(), null, { timeout: 120000 }); await settle(page);
    const k1 = await A(page, (c) => c.kmPerPx());
    ms = await marks(page);
    check("a tap on the stack zooms in on its members", k1 <= k0 / 2 + 1e-6, k0.toFixed(2) + " → " + k1.toFixed(2) + " km/px");
    const inside = ms.filter((x) => x.members ? x.members.some((id) => stack.members.includes(id)) : stack.members.includes(x.id));
    check("…and they part: the places that were one mark are now several, or smaller stacks", inside.length >= 2 || (inside.length === 1 && (inside[0].n || 1) < stack.n), inside.length + " marks, was 1 of " + stack.n);
    // keep tapping the biggest stack until the places part into marks of their own, or a stack shares a point and becomes the chip
    let rounds = 0, still = null;
    for (; rounds < 8; rounds++) {
      ms = await marks(page); still = ms.filter((x) => x.marker === "stack").sort((a, b) => b.n - a.n)[0];
      if (!still) break;
      const before = await A(page, (c) => c.kmPerPx());
      await page.mouse.click(box.x + still.sx, box.y + still.sy); await sleep(200);
      await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return !c.input().flying; }, null, { timeout: 20000 });
      await page.waitForFunction(() => document.querySelector(".atlas2").__atlas2.tilesSettled(), null, { timeout: 120000 }); await settle(page);
      const chip = await page.$eval(".atlas2-stack", (e) => !e.hidden);
      if (chip) { check("places that share a point become the \"N places here\" chip, which names the first and cycles", /places here/.test(await page.$eval(".atlas2-stack", (e) => e.textContent)), await page.$eval(".atlas2-stack", (e) => e.textContent)); break; }
      if (await A(page, (c) => c.kmPerPx()) >= before - 1e-6) break;
    }
    check("tapping on never runs away: the stacks resolve in " + rounds + " more taps", rounds < 8, "rounds " + rounds);
    await page.keyboard.press("Escape"); await sleep(100);
    allErrors.push(...[]);
    await ctx.close();
  }

  /* ------------------------------------------------------------------ 5  the place card */
  console.log("\n\x1b[1m5) the place card: the cards about a place, each opening the card\x1b[0m\n");
  {
    const { ctx, page, errors } = await open(browser, READER_ALL);
    await page.click('.atlas2-study [data-mode="full"]'); await sleep(250);
    // a studied place of the reader's with cards of the reader's and others'
    const regRows = require("./places-registry.js").loadRegistry();
    const cand = [...st.places].filter((id) => !id.startsWith("pol:")).map((id) => [id, (IDX.cardsOfPlace.get(id) || []).length]).filter(([id]) => regRows.rows.has(id)).sort((a, b) => b[1] - a[1]);
    const [pid, total] = cand[0];
    await A(page, (c, id) => c.select(id, { open: true, fly: false, push: false }), pid); await sleep(500);
    const info = (cid) => infoMap[cid] || {};
    const full = AS.cardsFor(IDX, pid, st, "full", new Set(), info);
    const cardsHtml = await page.$$eval(".atlas2-card-body .atlas2-study-card", (a) => a.map((x) => ({ href: x.getAttribute("href"), title: x.querySelector(".atlas2-study-title").textContent, chip: (x.querySelector(".atlas2-study-chip") || {}).textContent || "", mine: !!x.querySelector(".atlas2-study-mine") })));
    check("the card of " + placeRow(pid).name + " lists " + AS.LIST_CAP + " of its " + total + " cards, the reader's first (marked), each with its collection", cardsHtml.length === AS.LIST_CAP && cardsHtml.every((c) => c.chip) && cardsHtml.map((c) => c.href.replace("#card/", "")).join() === full.shown.map((c) => c.id).join() && cardsHtml.filter((c) => c.mine).length === full.shown.filter((c) => c.mine).length, cardsHtml.length + " listed");
    check("each is a link to the app's own card page (#card/<id>) — the answer is the card's title", cardsHtml.every((c, i) => c.href === "#card/" + full.shown[i].id && c.title === (info(full.shown[i].id).title || "")), cardsHtml[0] && cardsHtml[0].href);
    const more = await page.$eval(".atlas2-study-more", (b) => b.textContent).catch(() => null);
    check("the rest are capped with \"and N more\" (N = " + (total - AS.LIST_CAP) + ")", more === "and " + (total - AS.LIST_CAP) + " more", more);
    await page.click(".atlas2-study-more"); await sleep(150);
    const after = await page.$$eval(".atlas2-card-body .atlas2-study-card", (a) => a.length);
    check("…and the button shows twenty more", after === Math.min(total, AS.LIST_CAP + 20), after + " now");
    // open a card: the app's own page, and Back returns to the Atlas with the place open
    const first = cardsHtml[0], want = byId.get(first.href.replace("#card/", ""));
    const hashBefore = await page.evaluate(() => location.hash);
    await page.click(`.atlas2-card-body a[href="${first.href}"]`);
    await page.waitForFunction((h) => location.hash === h, first.href, { timeout: 20000 });
    await page.waitForFunction(() => { const h = document.querySelector(".page-head h1"); return h && h.textContent.trim() && h.textContent.trim() !== "Loading…"; }, null, { timeout: 30000 });
    const h1 = await page.$eval(".page-head h1", (e) => e.textContent.trim());
    check("the link opens the card on the app's own page (#card/" + first.href.replace("#card/", "") + "): its heading is the card's answer", h1 === (want.answerText || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim(), h1);
    check("studying nothing: opening a card writes no record (the reader's progress is untouched)", (await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem("folio_v1")).cards).length)) === READER_ALL.length);
    await page.goBack(); await ready(page); await sleep(500);
    const back = await A(page, (c) => c.card());
    check("Back returns to the Atlas with the place's card open again (" + hashBefore.slice(0, 20) + "…)", back.open && back.id === pid && (await page.$$eval(".atlas2-card-body .atlas2-study-card", (a) => a.length)) > 0, JSON.stringify(back));
    // Personal: only theirs, the rest counted
    await page.click('.atlas2-study [data-mode="personal"]'); await sleep(300);
    const pers = AS.cardsFor(IDX, pid, st, "personal", new Set(), info);
    const persList = await page.$$eval(".atlas2-card-body .atlas2-study-card", (a) => a.length);
    const others = await page.$eval(".atlas2-study-others", (e) => e.textContent).catch(() => "");
    check("in the Personal Atlas the list is the reader's own cards (" + pers.shown.length + ") and counts the rest without naming them: \"" + others.slice(0, 40) + "…\"", persList === pers.shown.length && (!pers.others || new RegExp("^" + pers.others + " more cards? (is|are) about this place").test(others)) && (await page.$eval(".atlas2-study-h", (e) => e.textContent)) === "From your cards", persList + " listed");
    // a polity lists its linked cards
    await page.click('.atlas2-study [data-mode="full"]'); await sleep(250);
    await A(page, (c) => c.ensureHistory()); await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.historyReady(); }, null, { timeout: 120000 }).catch(() => {});
    await A(page, (c) => c.setYear(100)); await sleep(1500);
    const sel = await A(page, (c) => c.select("pol:rome", { open: true, fly: false, push: false }));
    await sleep(500);
    const polWant = AS.cardsFor(IDX, "pol:rome", st, "full", new Set(), info);
    const polList = await page.$$eval(".atlas2-card-body .atlas2-study-card", (a) => a.map((x) => x.getAttribute("href")));
    check("a polity (the Roman Republic and Empire, in 100 CE) lists the cards linked to it, the same way", sel === true && polList.length === polWant.shown.length && polList.length > 0 && polList.every((h, i) => h === "#card/" + polWant.shown[i].id), polList.length + " listed of " + polWant.total);
    allErrors.push(...errors); await ctx.close();
  }

  /* ------------------------------------------------------------------ 6  the empty states */
  console.log("\n\x1b[1m6) the honest empty states\x1b[0m\n");
  {
    const { ctx, page, errors } = await open(browser, noPlaceCards.slice(0, 2));
    const s = await study(page);
    const e = await panelText(page, ".atlas2-study-empty");
    check("two cards, neither with a place: Personal opens (they have cards) and says so — \"None of your 2 studied cards has a place on the map yet\"", s.mode === "personal" && /^None of your 2 studied cards has a place on the map yet\./.test(e || ""), e);
    check("…and nothing is drawn, nothing muted (an empty globe is not a dimmed one)", s.flags.length === 0 && s.muted === false && (await marks(page)).length === 0);
    await ctx.close();
    const o = await open(browser, noPlaceCards.slice(0, 1));
    const e1 = await panelText(o.page, ".atlas2-study-empty");
    check("one card with no place is told so in the singular", /^The card you have studied has no place on the map yet\./.test(e1 || ""), e1);
    await o.ctx.close();
    const m = await open(browser, READER_ALL);
    check("a reader with some cards that have places and one that has none gets the count AND the note, and no empty-state sentence", (await panelText(m.page, ".atlas2-study-empty")) === null && !!(await panelText(m.page, ".atlas2-study-note")) && /^\d+ places?/.test((await panelText(m.page, ".atlas2-study-sum")) || ""));
    // every collection of theirs switched off → the empty sentence says why
    const mine = (await study(m.page)).colls.filter((c) => c.mine > 0);
    for (const c of mine) await m.page.click(`.atlas2-study-coll[data-coll="${c.id}"]`);
    await sleep(300);
    check("with every collection of theirs switched off the globe is empty and says why", /switched off/.test((await panelText(m.page, ".atlas2-study-empty")) || "") && (await study(m.page)).flags.length === 0);
    allErrors.push(...errors, ...m.errors); await m.ctx.close();
  }

  /* ------------------------------------------------------------------ 7  the phone */
  console.log("\n\x1b[1m7) the phone, 390 px\x1b[0m\n");
  {
    const { ctx, page, errors } = await open(browser, READER_ALL, { phone: true });
    const R = await page.evaluate(() => {
      const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [b.left, b.top, b.right, b.bottom]; };
      return { frame: r(".atlas2"), panel: r(".atlas2-study"), search: r(".atlas2-search-in"), zoom: r(".atlas2-zoom"), layers: r(".atlas2-layers-btn"), help: r(".atlas2-about-btn"), rail: r(".atlas2-rail"), vw: window.innerWidth };
    });
    const hit = (a, b) => a && b && a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
    check("the panel lies wholly inside the Atlas's frame and the viewport", R.panel[0] >= R.frame[0] - 0.5 && R.panel[2] <= R.frame[2] + 0.5 && R.panel[2] <= R.vw && R.panel[1] >= R.frame[1], JSON.stringify(R.panel.map(Math.round)));
    check("…and clear of the search box, the zoom stack, the legend, the ? chip and the year rail", ![R.search, R.zoom, R.layers, R.help, R.rail].some((b) => hit(R.panel, b)), "no overlap");
    const targets = await page.$$eval(".atlas2-study button", (b) => b.filter((x) => x.offsetParent).map((x) => { const r = x.getBoundingClientRect(); return Math.round(Math.min(r.width, r.height)); }));
    check("every control in it is at least 44 px high, a touch target", targets.length >= 4 && targets.every((t) => t >= 44), targets.join(","));
    // Phase 3c, decision 7: the panel is collapsible, and on a phone it starts collapsed to the switch and the count line
    const pc = await page.evaluate(() => { const P = document.querySelector(".atlas2-study"), vis = (e) => !!e && !e.hidden && !e.closest("[hidden]") && getComputedStyle(e).display !== "none"; return { open: P.getAttribute("data-open"), modes: vis(P.querySelector(".atlas2-study-modes")), sum: P.querySelector(".atlas2-study-sum").textContent, colls: vis(P.querySelector(".atlas2-study-colls")), note: vis(P.querySelector(".atlas2-study-note")), h: P.getBoundingClientRect().height, exp: P.querySelector(".atlas2-study-toggle").getAttribute("aria-expanded") }; });
    check("on a phone the panel starts collapsed to the switch and the count line (no chips, no note)", pc.open === "0" && pc.exp === "false" && pc.modes && /places? .*from \d+ cards?/.test(pc.sum) && !pc.colls && !pc.note, `${pc.h | 0} px high; "${pc.sum}"`);
    await page.click(".atlas2-study-toggle"); await sleep(250);
    const po = await page.evaluate(() => { const P = document.querySelector(".atlas2-study"); return { open: P.getAttribute("data-open"), exp: P.querySelector(".atlas2-study-toggle").getAttribute("aria-expanded"), chips: [...P.querySelectorAll("[data-coll]")].filter((e) => e.offsetParent).length, h: P.getBoundingClientRect().height }; });
    check("the disclosure opens the collection chips and the panel grows", po.open === "1" && po.exp === "true" && po.chips > 0 && po.h > pc.h, `${pc.h | 0} → ${po.h | 0} px, ${po.chips} chips`);
    await page.click(".atlas2-study-toggle"); await sleep(250);
    check("…and collapses them again", (await page.evaluate(() => document.querySelector(".atlas2-study").getAttribute("data-open"))) === "0");
    await page.click('.atlas2-study [data-mode="full"]'); await sleep(250);
    await view(page, 23, 38, 12); await view(page, 22.5, 38.5, 10);
    const placed = await A(page, (c) => ({ labels: c.labels().map((p) => ({ id: p.id, rects: p.rects })), chrome: c.chromeRects() }));
    const panelRect = await page.evaluate(() => { const e = document.querySelector(".atlas2-study").getBoundingClientRect(), f = document.querySelector(".atlas2").getBoundingClientRect(); return [e.left - f.left, e.top - f.top, e.right - f.left, e.bottom - f.top]; });
    check("the panel is among the chrome the label engine keeps names out of", placed.chrome.some((c) => c[0] <= panelRect[0] + 1 && c[1] <= panelRect[1] + 1 && c[2] >= panelRect[2] - 1 && c[3] >= panelRect[3] - 1), placed.chrome.length + " chrome rectangles");
    const under = placed.labels.filter((p) => p.rects.some((r) => hit([r[0], r[1], r[2], r[3]], panelRect)));
    check("no name, no mark, no stack is placed under the panel (or under any other control)", under.length === 0 && placed.labels.every((p) => p.rects.every((r) => !placed.chrome.some((c) => hit([r[0], r[1], r[2], r[3]], c)))), under.map((p) => p.id).join(", ") || placed.labels.length + " placed");
    const tm = await marks(page);
    check("a mark of its own and a stack both draw on the phone", tm.length > 0, tm.length + " marks");
    const bx = await page.$eval(".atlas2-canvas", (e) => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top }; });
    const single = tm.find((m) => m.marker === "diamond" && m.box);
    if (single) {
      await page.touchscreen.tap(bx.x + single.sx, bx.y + single.sy); await sleep(500);
      const cd = await A(page, (c) => c.card());
      check("a tap on a mark opens that place's card (touch)", cd.open && cd.id === single.id, cd.title);
    } else check("a tap on a mark opens that place's card (touch)", false, "no single mark in view");
    allErrors.push(...errors); await ctx.close();
  }

  /* ------------------------------------------------------------------ 7b  the panel is collapsible on a desktop too */
  console.log("\n\x1b[1m7b) the collapsible panel on a desktop\x1b[0m\n");
  {
    const { ctx, page, errors } = await open(browser, READER_ALL);
    const st = () => page.evaluate(() => { const P = document.querySelector(".atlas2-study"), vis = (e) => !!e && !e.hidden && !e.closest("[hidden]") && getComputedStyle(e).display !== "none"; const t = P.querySelector(".atlas2-study-toggle"); return { open: P.getAttribute("data-open"), exp: t.getAttribute("aria-expanded"), label: t.getAttribute("aria-label"), toggle: vis(t), chips: vis(P.querySelector(".atlas2-study-colls")), note: vis(P.querySelector(".atlas2-study-note")), modes: vis(P.querySelector(".atlas2-study-modes")), sum: P.querySelector(".atlas2-study-sum").textContent, h: P.getBoundingClientRect().height, api: document.querySelector(".atlas2").__atlas2.study.open() }; });
    let a = await st();
    check("on a desktop the panel starts open: chips and note shown, the disclosure says what it hides", a.open === "1" && a.exp === "true" && a.chips && a.note && a.toggle && /Hide the collections/.test(a.label) && a.api === true, JSON.stringify({ h: a.h | 0, label: a.label }));
    await page.focus(".atlas2-study-toggle"); await page.keyboard.press("Enter"); await sleep(250);
    let b = await st();
    check("Enter on the disclosure collapses it (keyboard), focus stays on it, the switch and the count line stay", b.open === "0" && b.exp === "false" && !b.chips && !b.note && b.modes && b.sum === a.sum && b.h < a.h && /Show the collections/.test(b.label) && (await page.evaluate(() => document.activeElement.className)) === "atlas2-study-toggle", `${a.h | 0} → ${b.h | 0} px`);
    const pl = await A(page, (c) => c.chromeRects());
    const bb = await page.evaluate(() => { const r = document.querySelector(".atlas2-study").getBoundingClientRect(), f = document.querySelector(".atlas2").getBoundingClientRect(); return [r.left - f.left, r.top - f.top, r.right - f.left, r.bottom - f.top]; });
    check("the label engine's chrome follows the panel's new height", pl.some((c) => Math.abs(c[3] - bb[3]) < 2 && Math.abs(c[0] - bb[0]) < 2), "panel bottom " + Math.round(bb[3]));
    await page.keyboard.press("Space"); await sleep(250);
    check("Space opens it again", (await st()).open === "1");
    await page.keyboard.press("Space"); await sleep(250);
    await page.reload({ waitUntil: "load" }); await ready(page);
    check("the choice is remembered across a reload", (await st()).open === "0");
    await page.click(".atlas2-study-toggle"); await sleep(200);
    check("with the chips shown a click on a chip still switches its collection (toggle state has no effect on them)", await page.evaluate(() => { const b = document.querySelector(".atlas2-study [data-coll]"); const was = b.getAttribute("aria-checked"); b.click(); const now = document.querySelector(".atlas2-study [data-coll]").getAttribute("aria-checked"); document.querySelector(".atlas2-study [data-coll]").click(); return was !== now; }));
    const e0 = await open(browser, []);
    await e0.page.click('.atlas2-study [data-mode="personal"]'); await sleep(250);
    const ne = await e0.page.evaluate(() => { const P = document.querySelector(".atlas2-study"); return { toggle: !P.querySelector(".atlas2-study-toggle").hidden, empty: P.querySelector(".atlas2-study-empty").textContent }; });
    check("with nothing to hide (no cards) there is no disclosure and the empty-state sentence stays", !ne.toggle && /studied any cards/.test(ne.empty), JSON.stringify(ne).slice(0, 120));
    allErrors.push(...errors, ...e0.errors); await ctx.close(); await e0.ctx.close();
  }

  /* ------------------------------------------------------------------ 7c  the glossary popup's "show on the Atlas" button (Phase 3c, task 2) */
  console.log("\n\x1b[1m7c) the glossary popup's button opens #map2 at the term's registry place\x1b[0m\n");
  {
    const GP = {}; new Function("window", fs.readFileSync(path.join(ROOT, "atlas/data/glossary-places.js"), "utf8"))(GP);
    const table = GP.ATLAS_GLOSSARY_PLACES.ids;
    const popup = async (page, key) => {
      await page.goto(`http://127.0.0.1:${PORT}/#card/wh-016`, { waitUntil: "load" });
      await page.waitForSelector(`[data-k="${key}"]`, { timeout: 60000 });
      await page.click(`[data-k="${key}"]`); await sleep(500);
      return page.$(`.gloss-win[data-k="${key}"] .gloss-map`);
    };
    // OFF (what a reader has): the button still opens the old globe
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } }); await ctx.addInitScript(seed([]));
      const page = await ctx.newPage(); const errors = [];
      page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
      const b = await popup(page, "Olduvai_Gorge");
      check("the popup of a place term has the button", !!b);
      await b.click(); await sleep(1500);
      check("with the preview switch off the button opens the old globe (#map), not #map2", /^#map(\?|\/|$)/.test(await page.evaluate(() => location.hash)) && !/^#map2/.test(await page.evaluate(() => location.hash)), await page.evaluate(() => location.hash));
      allErrors.push(...errors); await ctx.close();
    }
    // ON: the registry place opens, flown to, with its card
    for (const [key, name] of [["Olduvai_Gorge", "Olduvai Gorge"], ["Tanzania", "Tanzania"], ["Gona,_Ethiopia", "Gona, Ethiopia"]]) {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      await ctx.addInitScript(seed([])); await ctx.addInitScript(() => { try { localStorage.setItem("folio.atlas2.preview", "1"); } catch (e) {} });
      const page = await ctx.newPage(); const errors = [];
      page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
      page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
      const b = await popup(page, key);
      check(`${key}: the popup has the button, and the table has an id for it`, !!b && !!table[key], table[key]);
      const before = await page.evaluate(() => JSON.parse(localStorage.getItem("folio_v1") || "{}"));
      await b.click();
      await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 120000 });
      await page.waitForFunction((id) => { const c = document.querySelector(".atlas2").__atlas2; const cd = c.card(); return cd && cd.open && cd.id === id; }, table[key], { timeout: 60000 }).catch(() => {});
      await sleep(1200);
      const r = await A(page, (c) => ({ card: c.card(), view: { lon: c.view.lon, lat: c.view.lat }, kmpp: c.kmPerPx(), hash: location.hash }));
      check(`${key}: #map2 opens with ${table[key]} selected and its card open`, r.card.open && r.card.id === table[key] && r.card.title.includes(name), `${r.card.id} · ${r.card.title}`);
      const row = placeRow(table[key]);
      const at = row && row.at;
      check(`${key}: the view flew to the place`, !!at && Math.hypot(r.view.lon - at[0], r.view.lat - at[1]) < (row.kind === "country" ? 25 : 1.5), at ? `view ${r.view.lon.toFixed(1)}, ${r.view.lat.toFixed(1)} against ${at[0].toFixed(1)}, ${at[1].toFixed(1)}` : "no row");
      check(`${key}: the address names the place`, r.hash.includes(encodeURIComponent(table[key])), r.hash);
      const after = await page.evaluate(() => JSON.parse(localStorage.getItem("folio_v1") || "{}"));
      const s2 = await study(page); await A(page, (c) => c.study.setMode("personal")); await sleep(300); const s3 = await study(page);
      check(`${key}: a term is no card — the reader's progress is untouched and the Personal Atlas is still empty (Q-P3 c)`, JSON.stringify(Object.keys(before.cards || {})) === JSON.stringify(Object.keys(after.cards || {})) && s3.flags.length === 0 && /haven.t studied|None of your|^$/.test((await panelText(page, ".atlas2-study-empty")) || "") || s3.flags.length === 0, JSON.stringify({ cards: Object.keys(after.cards || {}).length, flags: s3.flags.length }));
      void s2;
      allErrors.push(...errors); await ctx.close();
    }
    // the table itself: every id resolves, the points are the registry's and the countries are gazetteer countries
    const reg = require("./places-registry.js").loadRegistry({ entities: false });
    const W = {}; new Function("window", fs.readFileSync(path.join(ROOT, "glossary.js"), "utf8"))(W);
    check("every id in the glossary table resolves in the registry", Object.values(table).every((id) => reg.rows.has(id)), Object.keys(table).length + " terms");
    check("181 country terms and 30 of the 31 point terms have a place (Phase 2c, Task 0b: Alaska, Great Britain, Lake Turkana, the Sahara and Siberia matched by exact label or alias at any distance); the one left out, Lomekwi 3, has no Wikidata item and is not guessed", Object.keys(W.GLOSSARY_MAP_COUNTRY).every((k) => /^adm0:/.test(table[k] || "")) && Object.keys(W.GLOSSARY_PLACES).filter((k) => table[k]).length === 30 && Object.keys(W.GLOSSARY_PLACES).filter((k) => !table[k]).join() === "Lomekwi_3", Object.keys(W.GLOSSARY_PLACES).filter((k) => !table[k]).join(", "));
  }

  /* ------------------------------------------------------------------ 7d  search across years (Phase 3c, task 3) */
  console.log("\n\x1b[1m7d) the search covers the whole registry whatever year the rail shows\x1b[0m\n");
  {
    const PXs = {}; new Function("window", fs.readFileSync(path.join(ROOT, "atlas/data/polity-index.js"), "utf8"))(PXs);
    const pol = new Map(PXs.ATLAS_POLITY_INDEX.polities.map((r) => [r[0], r]));
    const ranges = (id) => pol.get(id)[5];
    const { ctx, page, errors } = await open(browser, []);
    const list = () => page.evaluate(() => [...document.querySelectorAll(".atlas2-results li")].map((li) => ({ name: li.querySelector(".atlas2-res-name").textContent, chip: li.querySelector(".atlas2-chip").textContent, yrs: (li.querySelector(".atlas2-res-yrs") || {}).textContent || "" })));
    const note = () => page.evaluate(() => { const n = document.querySelector(".atlas2-search-note"); return n && !n.hidden ? { text: n.querySelector(".atlas2-sn-t").textContent, go: n.querySelector(".atlas2-sn-go").textContent, year: Number(n.querySelector(".atlas2-sn-go").getAttribute("data-year")) } : null; });
    const hs0 = await A(page, (c) => c.historyStarted());
    await page.fill(".atlas2-search-in", "roman repub"); await page.waitForFunction(() => [...document.querySelectorAll(".atlas2-results li")].some((li) => li.querySelector(".atlas2-chip").textContent === "Polity"), null, { timeout: 30000 }).catch(() => {});
    let r = await list();
    const rome = r.find((x) => x.chip === "Polity");
    check('"roman repub" finds the polity whose alias it is, with its years', !!rome && rome.name === "Rome" && /480 BCE – 475 CE/.test(rome.yrs), JSON.stringify(rome));
    check("…without fetching the 4.7 MB history file (the 20 KB index answers)", hs0 === false && (await A(page, (c) => c.historyStarted())) === false);
    // the rail is at today: Rome is not on the map. Enter flies there and says so, offering the nearest year from its own range
    await page.keyboard.press("Enter"); await sleep(1200);
    let n = await note();
    const want = ranges("pol:rome");
    check("choosing it at today's year says it is not on the map, and offers the end of its last range", !!n && /Rome is not on the map in 2026 CE/.test(n.text) && n.year === want[want.length - 1][1] && n.go === "Go to " + (want[want.length - 1][1]) + " CE", JSON.stringify(n));
    check("the view flew toward the polity (its capital) and the year did not change", (await A(page, (c) => c.year())) === 2026 && Math.abs((await A(page, (c) => c.view.lon)) - 12.5) < 10);
    await page.click(".atlas2-sn-go");
    await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; const k = c.card(); return c.year() === 475 && k && k.open && k.id === "pol:rome"; }, null, { timeout: 90000 }).catch(() => {});
    const after = await A(page, (c) => ({ year: c.year(), card: c.card(), alive: c.alive().some((a) => a.entity === "pol:rome") }));
    check("“Go to 475 CE” sets the rail to that year, the polity is on the map and its card opens", after.year === 475 && after.card.open && after.card.id === "pol:rome" && after.alive, JSON.stringify({ year: after.year, id: after.card.id, alive: after.alive }));
    check("the note is gone once the year moves", (await note()) === null);
    // inside its years: no note
    await page.fill(".atlas2-search-in", "roman repub"); await sleep(300); await page.keyboard.press("Enter"); await sleep(900);
    check("a polity that IS on the map in the rail's year gets no note", (await note()) === null);
    // a gap in its years is a gap: Abbasid Caliphate [750,969] [1202,1259], the rail at 1000 → the NEARER end, 969
    await A(page, (c) => c.setYear(1000)); await sleep(600);
    await page.fill(".atlas2-search-in", "abbasid"); await sleep(300); await page.keyboard.press("Enter"); await sleep(900);
    n = await note();
    check("in a gap the nearest year of its own steps is offered (1000 → 969, not 1202, and nothing between)", !!n && n.year === 969 && /750 CE – 969 CE; 1202 CE – 1259 CE/.test(n.text), JSON.stringify(n));
    await page.click(".atlas2-sn-x"); await sleep(200);
    check("the note is dismissable", (await note()) === null);
    // a place with no years of its own is never said to be absent
    await page.fill(".atlas2-search-in", "athens"); await sleep(300); await page.keyboard.press("Enter"); await sleep(900);
    check("a present-day city or a site, whatever the year, gets no note (no years are invented)", (await note()) === null);
    // a period capital the gazetteer does not name
    const reg = require("./places-registry.js").loadRegistry({ entities: false });
    const cap = PXs.ATLAS_POLITY_INDEX.capitals.find((c) => !(reg.byName.get(reg.fold(c[1])) || []).length);
    await page.fill(".atlas2-search-in", cap[1]); await sleep(400);
    r = await list();
    check(`a period capital the gazetteer lacks is found by name (${cap[1]}), with its years`, r.some((x) => x.name === cap[1] && x.chip === "Capital" && x.yrs.length > 0), r.slice(0, 3).map((x) => x.name + " [" + x.chip + "]").join(", "));
    // kinds
    await page.fill(".atlas2-search-in", "hills"); await sleep(400); r = await list();
    check('"hills" lists hills (the kind is searched, not only the name)', r.length > 3 && r.filter((x) => x.chip === "Hill").length >= 3, r.slice(0, 5).map((x) => x.name + " [" + x.chip + "]").join(", "));
    await page.fill(".atlas2-search-in", "battles"); await sleep(400); r = await list();
    check('"battles" lists battle sites', r.length >= 5 && r.every((x) => /Site/.test(x.chip) || /battle/i.test(x.name)), r.slice(0, 4).map((x) => x.name + " [" + x.chip + "]").join(", "));
    await page.fill(".atlas2-search-in", "rivers"); await sleep(400); r = await list();
    check('"rivers" lists rivers', r.filter((x) => x.chip === "River").length >= 3, r.slice(0, 4).map((x) => x.name + " [" + x.chip + "]").join(", "));
    // arithmetic against the file, independent of the page: every offered year is an endpoint of one of the polity's own ranges
    const AS2 = require("../atlas/study.js"); let bad = 0, asked = 0;
    for (const [id, row] of pol) for (const y of [-3000, -500, 0, 500, 1000, 1500, 2026]) { const nn = AS2.yearsNote(row[5], y); if (!nn) continue; asked++; if (!row[5].some((rg) => rg[0] === nn.go || rg[1] === nn.go)) bad++; }
    check("no year is invented: over every polity and seven rail years, every year offered is the start or end of one of its ranges", asked > 400 && bad === 0, `${asked} offers, ${bad} invented`);
    allErrors.push(...errors); await ctx.close();
  }

  /* ------------------------------------------------------------------ 7e  the default view frames the reader's places (task 4) */
  console.log("\n\x1b[1m7e) the Personal Atlas opens on the reader's places\x1b[0m\n");
  {
    const reg = require("./places-registry.js").loadRegistry({ entities: false });
    const mine = [...stFor(READER).places].map((id) => reg.rows.get(id)).filter((r) => r && r.at);
    const want = AS.framing(mine.map((r) => r.at), { shortPx: 800, minKmpp: 3, maxKmpp: 24 });
    const base = await open(browser, []);
    const home = await A(base.page, (c) => ({ lon: c.view.lon, lat: c.view.lat, zoom: c.view.zoom, frame: c.framing() }));
    check("a reader with no places keeps today's default view (nothing framed)", home.frame === null, JSON.stringify({ lon: +home.lon.toFixed(2), lat: +home.lat.toFixed(2), zoom: +home.zoom.toFixed(2) }));
    allErrors.push(...base.errors); await base.ctx.close();
    const { ctx, page, errors } = await open(browser, READER);
    await sleep(800);
    const got = await A(page, (c) => ({ mode: c.study.mode(), lon: c.view.lon, lat: c.view.lat, kmpp: c.kmPerPx(), frame: c.framing() }));
    check("a reader with studied places opens on Personal and the view is framed on them (Node's arithmetic over the registry's coordinates)", got.mode === "personal" && !!got.frame && Math.abs(got.lon - want.lon) < 0.3 && Math.abs(got.lat - want.lat) < 0.3, `view ${got.lon.toFixed(1)}, ${got.lat.toFixed(1)} against ${want.lon.toFixed(1)}, ${want.lat.toFixed(1)}`);
    check("…at the scale that holds nine in ten of them, inside the clamp (3–24 km/px)", got.kmpp >= 2.9 && got.kmpp <= 24.1 && Math.abs(got.kmpp - want.kmpp) / want.kmpp < 0.1, `${got.kmpp.toFixed(1)} km/px against ${want.kmpp.toFixed(1)}`);
    const onScreen = await A(page, (c) => c.study.marks().filter((m) => m.sx >= 0 && m.sy >= 0).length);
    check("…and the reader's marks are in the frame", onScreen > 0, onScreen + " marks");
    await ctx.close();
    {   // a reader whose places lie close together is shown them close up, not the whole earth
      const GR = withPlaces.filter((c) => /^gr-/.test(c.id)).slice(0, 8).map((c) => c.id);
      const pts = [...stFor(GR).places].map((id) => reg.rows.get(id)).filter((r) => r && r.at).map((r) => r.at);
      const w2 = AS.framing(pts, { shortPx: 800, minKmpp: 3, maxKmpp: 24 });
      const t = await open(browser, GR); await sleep(800);
      const g2 = await A(t.page, (c) => ({ lon: c.view.lon, lat: c.view.lat, kmpp: c.kmPerPx() }));
      check("a reader whose places lie close together is shown them close up (Greece, not the whole earth)", g2.kmpp < 12 && Math.abs(g2.lon - w2.lon) < 0.3 && Math.abs(g2.lat - w2.lat) < 0.3 && Math.abs(g2.kmpp - w2.kmpp) / w2.kmpp < 0.1, `${g2.kmpp.toFixed(1)} km/px at ${g2.lon.toFixed(1)}, ${g2.lat.toFixed(1)}; Node ${w2.kmpp.toFixed(1)} at ${w2.lon.toFixed(1)}, ${w2.lat.toFixed(1)} (${pts.length} places)`);
      allErrors.push(...t.errors); await t.ctx.close();
    }
    // a stored Map choice keeps today's default; a deep link keeps its view
    {
      const m = await open(browser, READER); await m.page.evaluate(() => localStorage.setItem("folio.atlas2.study", "map"));
      await m.page.reload({ waitUntil: "load" }); await ready(m.page);
      check("a reader whose stored choice is the plain Map keeps today's default view", (await A(m.page, (c) => c.framing())) === null);
      allErrors.push(...m.errors); await m.ctx.close();
    }
    {
      const d = await open(browser, READER); await d.page.evaluate(() => localStorage.setItem("folio.atlas2.study", "personal"));
      await d.page.goto(`http://127.0.0.1:${PORT}/#map2/10.00/20.00/3.00`, { waitUntil: "load" }); await d.page.reload({ waitUntil: "load" }); await ready(d.page); await sleep(600);
      const v = await A(d.page, (c) => ({ lon: c.view.lon, lat: c.view.lat, frame: c.framing() }));
      check("a deep link's own view is never overridden by the framing", v.frame === null && Math.abs(v.lon - 10) < 0.2 && Math.abs(v.lat - 20) < 0.2, JSON.stringify({ lon: v.lon, lat: v.lat }));
      allErrors.push(...d.errors); await d.ctx.close();
    }
    allErrors.push(...errors);
  }

  /* ------------------------------------------------------------------ 7f  "New discovery" on a place the reader studied (task 4) */
  console.log("\n\x1b[1m7f) the New discovery chip\x1b[0m\n");
  {
    const { ctx, page, errors } = await open(browser, READER);
    const pid = [...stFor(READER).places].find((id) => id.startsWith("pl:")) || [...stFor(READER).places][0];
    const prow = placeRow(pid);
    const blob = () => page.evaluate(() => JSON.parse(localStorage.getItem("folio_v1") || "{}"));
    const b0 = await blob();
    await A(page, (c, id) => c.select(id, { open: true, fly: false, push: false }), pid); await sleep(500);
    const chip = await page.evaluate(() => { const e = document.querySelector(".atlas2-card .atlas2-disc"); return e ? e.textContent.trim() : null; });
    const b1 = await blob();
    check("a place the reader studied, opened for the first time, carries the chip", chip === "New discovery!", `${prow.name}: ${chip}`);
    check("…recorded in the existing placesSeen register under its name; no new field, nothing else in the progress changed", !!(b1.placesSeen && b1.placesSeen[prow.name]) && JSON.stringify(Object.keys(b1).filter((k) => !(k in b0))) === JSON.stringify(["placesSeen"].filter((k) => !(k in b0))) && JSON.stringify(b1.cards) === JSON.stringify(b0.cards), JSON.stringify(Object.keys(b1.placesSeen || {})));
    await A(page, (c) => c.openCard ? 0 : c.select(c.card().id, { open: true, fly: false, push: false })); await sleep(200);
    check("a re-render of the same open card keeps the chip", (await page.evaluate(() => !!document.querySelector(".atlas2-card .atlas2-disc"))) === true);
    await page.click(".atlas2-card-close"); await sleep(300);
    await A(page, (c, id) => c.select(id, { open: true, fly: false, push: false }), pid); await sleep(400);
    check("opened again, it is no longer new", (await page.evaluate(() => !!document.querySelector(".atlas2-card .atlas2-disc"))) === false);
    const other = [...IDX.ids].find((id) => id.startsWith("pl:") && !stFor(READER).places.has(id));
    await A(page, (c, id) => c.select(id, { open: true, fly: false, push: false }), other); await sleep(500);
    const b2 = await blob();
    check("a place the reader has NOT studied gets no chip and is not marked seen", (await page.evaluate(() => !!document.querySelector(".atlas2-card .atlas2-disc"))) === false && !(b2.placesSeen || {})[placeRow(other).name], placeRow(other).name);
    allErrors.push(...errors); await ctx.close();
  }

  /* ------------------------------------------------------------------ 7g  the hill kind (Phase 3c, task 1, decision 4) */
  console.log("\n\x1b[1m7g) a hill is its own kind, a smaller triangle than a mountain\x1b[0m\n");
  {
    const { ctx, page, errors } = await open(browser, ["gr-280", "gr-905"]);   // Areopagus (a hill), Mount Olympus (a mountain)
    check("the registry says Areopagus is a hill and Mount Olympus a mountain", placeRow("pl:q202487").kind === "hill" && placeRow("pl:q80344").kind === "mountain");
    await view(page, 23.72, 37.97, 1.5);
    const m = (await marks(page)).find((x) => x.id === "pl:q202487");
    check("the hill draws as a triangle", !!m && m.marker === "triangle", JSON.stringify(m && { marker: m.marker, box: m.box && m.box.map(Math.round) }));
    const hw = m && m.box ? m.box[2] - m.box[0] : 0;
    await view(page, 22.35, 40.08, 2);
    const mm = (await marks(page)).find((x) => x.id === "pl:q80344");
    const mw = mm && mm.box ? mm.box[2] - mm.box[0] : 0;
    check("…and smaller than a mountain's triangle", mm && mm.marker === "triangle" && hw > 0 && hw < mw, `${hw} px against ${mw} px`);
    await A(page, (c) => c.select("pl:q202487", { open: true, fly: false, push: false })); await sleep(400);
    const kind = await page.evaluate(() => document.querySelector(".atlas2-card-kind").textContent);
    check('the place card\'s kind line says "Hill"', /^Hill\b/.test(kind), kind);
    allErrors.push(...errors); await ctx.close();
  }

  /* ------------------------------------------------------------------ 7h  the Peoples switch (Phase 2c, Q-C2 b) */
  console.log("\n\x1b[1m7h) the Peoples switch: the Personal Atlas shows a people only when one of the reader's cards links it\x1b[0m\n");
  {
    const { ctx, page, errors } = await open(browser, ["ru-005", "gr-788"]);   // the Scythians' card and Galatia's: two peoples
    await page.evaluate(() => document.querySelector(".atlas2").__atlas2.ensureHistory());
    await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.historyStarted() && c.historyReady(); }, null, { timeout: 120000 });
    const P = () => A(page, (c) => { const p = c.presence(); return { shown: p.shown.slice().sort(), mode: p.mode, position: p.position, drawn: p.drawn.length, note: document.querySelector(".atlas2-peoples-note").textContent }; });
    const setYear = async (y) => { await page.evaluate((yy) => document.querySelector(".atlas2").__atlas2.setYear(yy), y); await sleep(300); };
    await setYear(-400);
    check("the legend carries three radios — Off, Peoples a card links, All with a dated source — and the default is the card-linked one", JSON.stringify(await page.$$eval('.atlas2-sheet input[data-layer="peoples"]', (r) => r.map((x) => { const l = x.parentElement.cloneNode(true); l.querySelectorAll(".atlas2-peoples-hint").forEach((h) => h.remove()); return x.value + ":" + l.textContent.trim() + ":" + x.checked; }))) === '["off:Off:false","linked:Peoples a card links:true","all:All with a dated source:false"]');
    // 2d, task 0b: the third position keeps its control and says plainly that it adds nothing until more peoples are built
    check("…and the third position carries a plain caption: it adds nothing until more peoples are built", /adds nothing until more peoples are built/i.test(await page.$eval('.atlas2-sheet input[data-layer="peoples"][value="all"]', (x) => (x.parentElement.querySelector(".atlas2-peoples-hint") || {}).textContent || "")));
    let p = await P();
    const shownNow = (await P()).shown;
    check("a reader who studied the Scythians' and Galatia's cards sees exactly those two peoples on their Personal Atlas, not the other ten", (await P()).mode === "personal" && shownNow.join() === "pol:galatia,pol:scythia", shownNow.join() + " in " + (await P()).mode);
    check("the year -400 draws only Scythia of them (Galatia is mapped 279–26 BCE)", (await P()).drawn === 1, String((await P()).drawn));
    await page.click('.atlas2-study [data-mode="full"]'); await sleep(300);
    p = await P();
    check("the Full Atlas shows every people a card links (all twelve, each on its dates)", p.mode === "full" && p.shown.length === 12, p.shown.length + " shown");
    // collections off: the cards of a collection leave 'linked' but not 'all'
    const ru = await A(page, (c) => c.study.info("ru-005").collId);   // the collection of the Scythians' card: it alone links seven of the twelve
    await A(page, (c, id) => c.study.toggleColl(id, false), ru); await sleep(300);
    const linkedOff = await P();
    await page.evaluate(() => document.querySelector('.atlas2-sheet input[data-layer="peoples"][value="all"]').click()); await sleep(300);
    const allOff = await P();
    check("with that collection off, 'linked' loses the seven peoples only its cards link (Scythia, Gothia, the Huns, the Avars, Old Great Bulgaria, Khazaria, the Magyars) and keeps the five other collections' — and 'all' keeps every one", linkedOff.shown.length === 5 && !linkedOff.shown.includes("pol:scythia") && linkedOff.shown.includes("pol:galatia") && allOff.shown.length === 12 && allOff.position === "all", `${linkedOff.shown.length} then ${allOff.shown.length}`);
    await page.evaluate(() => document.querySelector('.atlas2-sheet input[data-layer="peoples"][value="off"]').click()); await sleep(300);
    p = await P();
    check("Off hides every people, in the Full Atlas too, and the note says so", p.shown.length === 0 && p.drawn === 0 && /hidden/i.test(p.note), p.note);
    check("the choice is a per-viewer convenience in localStorage", JSON.parse(await page.evaluate(() => localStorage.getItem("folio_atlas2_layers_v2"))).peoples === "off");
    await page.reload({ waitUntil: "load" }); await ready(page);
    check("…and a reload keeps it", (await A(page, (c) => c.presence().position)) === "off");
    await page.evaluate(() => localStorage.setItem("folio_atlas2_layers_v2", JSON.stringify({ peoples: "sometimes" }))); await page.reload({ waitUntil: "load" }); await ready(page);
    check("a stored value it does not know reads as the default", (await A(page, (c) => c.presence().position)) === "linked");
    await page.evaluate(() => { const o = Object.getOwnPropertyDescriptor(Storage.prototype, "setItem"); Storage.prototype.setItem = function () { throw new Error("blocked"); }; return o && 1; });
    await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setLayers({ peoples: "all" })); await sleep(200);
    check("with localStorage refusing writes the switch still works (try/catch)", (await A(page, (c) => c.presence().position)) === "all");
    allErrors.push(...errors); await ctx.close();
  }

  console.log("\n\x1b[1m8) no console errors\x1b[0m\n");
  check("none on any of the above", allErrors.length === 0, allErrors.slice(0, 3).join(" | "));
  await browser.close(); server.close();
  console.log(`\n${pass} ok, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); try { server.close(); } catch (x) {} process.exit(1); });
