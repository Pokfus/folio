/* test-war-timeline.js — THE TIMELINE UNDER A WAR WINDOW (2026-10-19, the owner: "below those war windows there should be a timeline with only the years — and, where possible, the months — of the war,
   so users can see the frontline change").

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-war-timeline.js [--no-ww2]

   WHAT IT PROVES
     1  (Node) THE INVENTORY: .claude/war-timeline-inventory.js says which of the 56 wars have two or more dated steps (a timeline) and which do not (no timeline: one static extent, or a picture that never
        changes in the war's years); the Second World War's steps are the front's plate dates, each with a month; the card list the window reads the Second World War slice for equals the front entities' `cards`
     2  a war window with several steps (the Second Punic War, rm-209): a slim rail under the window, inside the card's location block, a slider (role, min, max, now, text) with a play button and two step buttons;
        it opens at the war's LAST step (the card's date line names several years, none one), the label under the pin is the year ("202 BCE": the data has no month), the rail's two ends are the war's own years;
        Home, End, the arrows and the page keys move the pin; the same window redraws (the sides' tint pixels change; the engine's hub is not recreated and the window is the same object); the step
        buttons disable at the ends; play steps on and pause holds; a press on the rail snaps to the nearest step
     3  a war with no changing picture (the Third Punic War, a Messenian war's one static extent) shows no timeline and still draws its window
     4  with no WebGL2 the window is the plain sentence and has no timeline
     5  at 360 px wide and Text size "huge" the timeline fits (no horizontal scroll, the buttons grow with the text, the rail keeps room)
     6  the Second World War's window (the whole history, the front line): the label under the pin is a month and a year ("Jun 1944"), the pin's date is the front's plate date, and moving the pin between two
        plates of ONE year changes the front's pixels while the states stay the same
   Re-run after touching mountTimeline (atlas-windows.js), warTimeline or setWindowFront (atlas.js), the war window's spec (atlas-embed.js yearAndWar) or the timeline's CSS. */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");
const { inventory } = require("./war-timeline-inventory.js");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream" };
const PORT = 5672;
const NO_WW2 = process.argv.includes("--no-ww2");
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  — " + extra : "")); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [];

async function newPage(browser, o) {
  o = o || {};
  const ctx = await browser.newContext({ viewport: o.viewport || { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await ctx.addInitScript(`localStorage.setItem("folio_tour_v1","1");localStorage.setItem("folio_atlas_tour_v1","1");`);
  if (o.noWebGL2) await ctx.addInitScript(() => { const orig = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (type, ...rest) { if (type === "webgl2") return null; return orig.call(this, type, ...rest); }; });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  return { ctx, page };
}
async function openCard(page, id, o) {
  await page.goto(`http://127.0.0.1:${PORT}/#card/${id}`, { waitUntil: "load" });
  await page.reload({ waitUntil: "load" });
  await page.waitForSelector(".map-card.map-war", { timeout: 60000 });
  if (o && o.plain) { await page.waitForSelector(".map-card.mc-plain", { timeout: 120000 }); return; }
  await page.waitForFunction(() => { const h = document.querySelector(".map-card"); return h && h._folioMap && h._folioMap.ready() && !h.classList.contains("mc-loading"); }, null, { timeout: 280000 }).catch(() => {});
  await page.waitForFunction(() => { const h = document.querySelector(".map-card"); return h && h._folioMap && h._folioMap.settled(); }, null, { timeout: 120000 }).catch(() => {});
  await sleep(1500);
}
const draws = (page) => page.evaluate(() => AtlasEmbed.stats().draws);
/* after a move, wait for the window to be asked again (a draw), settled on the step's year, then a beat */
async function afterMove(page, d0) {
  await page.waitForFunction((n) => { const h = document.querySelector(".map-card"); return AtlasEmbed.stats().draws > n && h._folioMap.settled(); }, d0, { timeout: 120000 }).catch(() => {});
  await sleep(500);
}
const tl = (page) => page.evaluate(() => { const t = document.querySelector(".war-tl"), h = document.querySelector(".map-card"); if (!t) return null; const pin = t.querySelector(".wtl-pin"); return { idx: h._folioTimeline.index(), n: h._folioTimeline.steps.length, label: t.getAttribute("data-label"), date: t.getAttribute("data-date"), year: h.getAttribute("data-map-year"), role: pin.getAttribute("role"), min: pin.getAttribute("aria-valuemin"), max: pin.getAttribute("aria-valuemax"), now: pin.getAttribute("aria-valuenow"), text: pin.getAttribute("aria-valuetext"), start: t.querySelector(".wtl-start").textContent, end: t.querySelector(".wtl-end").textContent, prevOff: t.querySelector(".wtl-prev").disabled, nextOff: t.querySelector(".wtl-next").disabled, playing: t.querySelector(".wtl-play").getAttribute("aria-pressed"), under: h.nextElementSibling === t && !!t.closest(".card-loc"), shown: t.querySelector(".wtl-now").textContent }; });
/* the window's own pixels: a snapshot to compare against, the tint counts */
const snap = (page, key) => page.evaluate((k) => { const c = document.querySelector(".map-card .mc-canvas"), d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; (window.__snaps = window.__snaps || {})[k] = new Uint8ClampedArray(d); }, key);
const diff = (page, a, b) => page.evaluate(([x, y]) => { const A = window.__snaps[x], B = window.__snaps[y]; let n = 0; for (let i = 0; i < A.length; i += 4) if (Math.abs(A[i] - B[i]) + Math.abs(A[i + 1] - B[i + 1]) + Math.abs(A[i + 2] - B[i + 2]) > 40) n++; return n; }, [a, b]);
const tints = (page) => page.evaluate(() => { const c = document.querySelector(".map-card .mc-canvas"), d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let g = 0, r = 0; for (let i = 0; i < d.length; i += 4) { if (d[i + 3] === 0) continue; if (d[i + 1] - d[i] > 25 && d[i + 1] - d[i + 2] > 15 && d[i + 1] < 190) g++; if (d[i] - d[i + 1] > 45 && d[i] - d[i + 2] > 35 && d[i] > 140) r++; } return { g, r }; });

(async () => {
  console.log("\n\x1b[1m1) the inventory (Node): which wars get a timeline\x1b[0m\n");
  const inv = inventory(), by = new Map(inv.rows.map((r) => [r.id, r]));
  check("every war of wars.js is in the inventory", inv.rows.length === 56, String(inv.rows.length));
  const yes = inv.rows.filter((r) => r.timeline), no = inv.rows.filter((r) => !r.timeline);
  check(`${yes.length} wars have two or more dated steps and get a timeline; ${no.length} do not (a timeline is a war with a changing picture)`, yes.length > 20 && no.length > 5 && yes.every((r) => r.steps >= 2) && no.every((r) => r.steps < 2), `${yes.length} / ${no.length}`);
  check("the Second World War's steps are the front's plate dates, each with a month (YYYYMMDD)", by.get("ww2-001").front && by.get("ww2-001").months && by.get("ww2-001").steps > 50 && by.get("ww2-001").list.every((d) => d > 19390000 && d < 19460000 && (Math.floor(d / 100) % 100) >= 1), `${by.get("ww2-001").steps} plate dates, ${by.get("ww2-001").first}..${by.get("ww2-001").last}`);
  check("every other war's steps are years (Cliopatria dates a state to the year: no month)", yes.filter((r) => r.id !== "ww2-001").every((r) => !r.months));
  check("the Second Punic War has eight steps; the Third Punic War and the Messenian wars (one static extent) have none worth a rail", by.get("rm-209").steps === 8 && !by.get("rm-234").timeline && !by.get("gr-236").timeline && by.get("gr-236").extentOnly, `${by.get("rm-209").list.join(",")}`);
  { const w = {}; new Function("window", "document", fs.readFileSync(path.join(ROOT, "atlas/atlas-windows.js"), "utf8"))(w, {});
    const has = !!w.AtlasWindows && ["warFrontCards", "timelineSteps", "startStep", "stepText"].every((k) => typeof w.AtlasWindows[k] === "function");
    check("the window code carries the timeline's helpers (warFrontCards, timelineSteps, startStep, stepText)", has);
    if (has) { const mine = w.AtlasWindows.warFrontCards().sort().join(","), theirs = inv.frontCards.join(",");
    check("the cards whose window reads the Second World War slice (WAR_FRONT_CARDS) are exactly the front entities' `cards` in history.bin", mine === theirs, `${mine} / ${theirs}`);
    check("a month and a year read \"Mar 1943\"; a year-only step reads \"202 BCE\"", w.AtlasWindows.stepText({ year: 1943, month: 3 }) === "Mar 1943" && w.AtlasWindows.stepText({ year: -202, month: null }) === "202 BCE" && w.AtlasWindows.stepText({ year: 1356, month: null }) === "1356" && w.AtlasWindows.stepText({ year: 632, month: null }) === "632 CE");
    const st = w.AtlasWindows.timelineSteps({ front: false, years: [-218, -216, -202], plates: [] });
    check("the pin ALWAYS opens at the step nearest the middle of the rail, whatever years the card names (Oct 2026)", w.AtlasWindows.startStep(st, [-218, -201], [-218, -201, -209]) === 1 && w.AtlasWindows.startStep(st, [-218, -201], [-217]) === 1 && w.AtlasWindows.startStep(st, [-218, -201], [-300]) === 1 && w.AtlasWindows.startStep(st, [-218, -201], []) === 1);
    check("a single step is no timeline", w.AtlasWindows.timelineSteps({ front: false, years: [1066], plates: [] }).length === 0); } }

  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch(LAUNCH);

  console.log("\n\x1b[1m2) a war window with several steps: the Second Punic War\x1b[0m\n");
  {
    const { ctx, page } = await newPage(browser);
    await openCard(page, "rm-209");
    const created0 = await page.evaluate(() => AtlasEmbed.stats().created);
    await page.evaluate(() => { window.__host0 = document.querySelector(".map-card"); window.__map0 = window.__host0._folioMap; });
    let t = await tl(page);
    check("a rail stands directly under the window, inside the card's location block", !!t && t.under);
    const want = by.get("rm-209");
    const midIdx = await page.evaluate(() => { const f = document.querySelector(".map-card")._folioTimeline; return f.index(); });
    const midYear = await page.evaluate(() => { const f = document.querySelector(".map-card")._folioTimeline; return f.steps[f.index()].year; });
    check("it has the war's eight steps and opens at the HALFWAY point of the rail (the middle of 218 to 201 BCE is 209 BCE; the step nearest it)", t && t.n === 8 && t.idx === midIdx && Math.abs(midYear - (-209)) <= 2 && t.idx > 0 && t.idx < 7, JSON.stringify(t && [t.n, t.idx, t.year, midYear]));
    check("the label under the pin is that step's year, the rail's ends are the war's own years (218 BCE, 201 BCE)", t && t.label === t.shown && t.start === "218 BCE" && t.end === "201 BCE", JSON.stringify(t && [t.label, t.shown, t.start, t.end]));
    check("the pin is a slider for assistive technology: role, 1 to 8, now the middle step, a text with the date and the step", t && t.role === "slider" && t.min === "1" && t.max === "8" && t.now === String(midIdx + 1) && new RegExp("step " + (midIdx + 1) + " of 8").test(t.text), JSON.stringify(t && [t.role, t.min, t.max, t.now, t.text]));
    check("neither button is disabled in the middle of the rail", t && !t.nextOff && !t.prevOff);
    await snap(page, "last"); const tintLast = await tints(page);
    const d0 = await draws(page);
    await page.focus(".wtl-pin"); await page.keyboard.press("Home"); await afterMove(page, d0);
    t = await tl(page); await snap(page, "first"); const tintFirst = await tints(page);
    check("Home moves the pin to the first step: 218 BCE, the window's year follows (data-map-year), the previous button disables", t && t.idx === 0 && t.label === "218 BCE" && t.year === "-218" && t.prevOff && !t.nextOff && t.now === "1", JSON.stringify(t && [t.idx, t.label, t.year]));
    const dl = await diff(page, "first", "last");
    check("the window redrew its sides for that step: " + dl + " pixels differ, and the green and red counts moved (Rome " + tintLast.g + " → " + tintFirst.g + ", Carthage " + tintLast.r + " → " + tintFirst.r + ")", dl > 800 && (tintLast.g !== tintFirst.g || tintLast.r !== tintFirst.r), JSON.stringify([tintFirst, tintLast]));
    check("it is the SAME window and the same hub: no reload, no new engine", await page.evaluate((c) => window.__host0 === document.querySelector(".map-card") && window.__map0 === window.__host0._folioMap && AtlasEmbed.stats().created === c && window.__host0.getAttribute("data-map-engine") === "v2", created0));
    await page.keyboard.press("ArrowRight"); t = await tl(page);
    check("ArrowRight steps on (216 BCE, step 2 of 8)", t.idx === 1 && t.label === "216 BCE" && /step 2 of 8/.test(t.text), t.label);
    await page.keyboard.press("ArrowLeft"); await page.keyboard.press("ArrowUp"); await page.keyboard.press("ArrowDown"); t = await tl(page);
    check("ArrowLeft, ArrowUp and ArrowDown work too (from step 2: left to 1, up to 2, down to 1)", t.idx === 0, String(t.idx));
    await page.keyboard.press("End"); t = await tl(page);
    check("End goes to the last step", t.idx === 7 && t.nextOff);
    await page.keyboard.press("PageDown"); t = await tl(page);
    check("Page Down jumps back (by a tenth of the steps, at least two)", t.idx === 5, String(t.idx));
    await page.keyboard.press("PageUp"); await page.keyboard.press("Home"); await page.keyboard.press("ArrowLeft"); t = await tl(page);
    check("the pin never leaves the rail (Left at the first step stays there)", t.idx === 0);
    await page.click(".wtl-next"); t = await tl(page);
    check("the next button steps on", t.idx === 1 && t.label === "216 BCE");
    await page.click(".wtl-prev"); t = await tl(page);
    check("the previous button steps back", t.idx === 0);
    // a press on the rail: the nearest step
    const box = await page.evaluate(() => { const r = document.querySelector(".wtl-track").getBoundingClientRect(); return { x: r.left, y: r.top + r.height / 2, w: r.width }; });
    await page.mouse.click(box.x + box.w * 0.5, box.y); t = await tl(page);
    check("a press in the middle of the rail snaps the pin to the step nearest that time (the war ran 218–201 BCE: the middle is 210 or 208 BCE)", /^(212|210|208) BCE$/.test(t.label), t.label);
    // play and pause
    await page.keyboard.press("Home");
    await page.click(".wtl-play"); t = await tl(page);
    check("play: the button says it is pressed", t.playing === "true");
    await page.waitForFunction(() => document.querySelector(".map-card")._folioTimeline.index() >= 2, null, { timeout: 60000 }).catch(() => {});
    t = await tl(page);
    check("play steps the pin on by itself", t.idx >= 2, String(t.idx));
    await page.click(".wtl-play"); const at = (await tl(page)).idx; await sleep(2500); t = await tl(page);
    check("pause holds it", t.playing === "false" && t.idx === at, `${at} → ${t.idx}`);
    await ctx.close();
  }

  console.log("\n\x1b[1m3) a war whose picture never changes: no timeline\x1b[0m\n");
  for (const [id, why] of [["rm-234", "the Third Punic War: Rome and Carthage never change their faces in its years"], ["gr-236", "the First Messenian War: Sparta and Messenia are two static extents"]]) {
    const { ctx, page } = await newPage(browser);
    await openCard(page, id);
    const r = await page.evaluate(() => { const h = document.querySelector(".map-card"); return { tl: !!document.querySelector(".war-tl"), engine: h.getAttribute("data-map-engine"), year: h.getAttribute("data-map-year"), has: !!h._folioTimeline }; });
    check(`${id}: no timeline, and the window still draws (${why})`, !r.tl && !r.has && r.engine === "v2" && /^-?\d+$/.test(r.year || ""), JSON.stringify(r));
    await ctx.close();
  }

  console.log("\n\x1b[1m4) no WebGL2: the window is the plain sentence, with no timeline\x1b[0m\n");
  {
    const { ctx, page } = await newPage(browser, { noWebGL2: true });
    await openCard(page, "rm-209", { plain: true });
    const r = await page.evaluate(() => ({ tl: !!document.querySelector(".war-tl"), note: (document.querySelector(".mc-plain-note") || {}).textContent || "", engine: document.querySelector(".map-card").getAttribute("data-map-engine") }));
    check("the sentence says the browser cannot draw a war's sides, and there is no timeline", !r.tl && /WebGL2/.test(r.note) && r.engine === "none", JSON.stringify(r));
    await ctx.close();
  }

  console.log("\n\x1b[1m5) 360 px wide, Text size huge\x1b[0m\n");
  {
    const { ctx, page } = await newPage(browser, { viewport: { width: 360, height: 740 } });
    await openCard(page, "rm-209");
    const m0 = await page.evaluate(() => { const b = document.querySelector(".wtl-btn").getBoundingClientRect(), r = document.querySelector(".wtl-track").getBoundingClientRect(); return { btn: b.height, track: r.width }; });
    await page.evaluate(() => document.body.setAttribute("data-fs", "huge")); await sleep(500);
    const m = await page.evaluate(() => { const t = document.querySelector(".war-tl"), b = document.querySelector(".wtl-btn").getBoundingClientRect(), r = document.querySelector(".wtl-track").getBoundingClientRect(), now = document.querySelector(".wtl-now").getBoundingClientRect(), pr = t.getBoundingClientRect(); return { doc: document.documentElement.scrollWidth, vw: innerWidth, btn: b.height, track: r.width, tlRight: pr.right, tlOver: t.scrollWidth - t.clientWidth, nowIn: now.left >= r.left - 1 && now.right <= r.right + 1 }; });
    check(`the timeline fits 360 px: no horizontal scroll (${m.doc} of ${m.vw}), nothing wider than its block (${m.tlOver})`, m.doc <= m.vw && m.tlOver <= 1 && m.tlRight <= m.vw + 1, JSON.stringify(m));
    check(`it follows Text size: the buttons grow with it (${m0.btn.toFixed(0)} → ${m.btn.toFixed(0)} px), the rail keeps room (${m.track.toFixed(0)} px) and the label stays inside it`, m.btn > m0.btn * 1.25 && m.track > 90 && m.nowIn, JSON.stringify([m0, m]));
    await ctx.close();
  }

  if (!NO_WW2) {
    console.log("\n\x1b[1m6) the Second World War: the front line, with months\x1b[0m\n");
    const { ctx, page } = await newPage(browser);
    await openCard(page, "ww2-001");
    let t = await tl(page);
    const ww = by.get("ww2-001");
    check(`the window reads the Second World War slice (not the whole history) and the rail has the front's ${ww.steps} plate dates, opening at the halfway point of the rail (1937 to 1945: mid-1941)`, !!t && t.n === ww.steps && t.idx > 0 && t.idx < ww.steps - 1 && /1941/.test(t.label) && (await page.evaluate(() => AtlasEmbed.hub().historyKind())) === "ww2", JSON.stringify(t && [t.n, t.idx]));
    check("the label under the pin is a month and a year (\"Jun 1941\", the middle of the rail); the rail's ends are 1937 and 1945", t && /^[A-Z][a-z]{2} \d{4}$/.test(t.label) && /1941$/.test(t.label) && t.start === "1937" && t.end === "1945", JSON.stringify(t && [t.label, t.start, t.end]));
    const at = (date) => ww.list.indexOf(date);
    const goTo = async (i) => { const d0 = await draws(page); await page.evaluate((k) => document.querySelector(".map-card")._folioTimeline.go(k), i); await afterMove(page, d0); };
    await goTo(at(19440615)); await sleep(1500);
    t = await tl(page); const f1 = await page.evaluate(() => { const f = AtlasEmbed.hub().ctl.fronts(); return { date: f.date, on: f.on, drawn: f.drawn.length, faces: f.drawn.map((x) => x.face).join(",") }; }); await snap(page, "jun44");
    check("15 June 1944: the label reads \"Jun 1944\", the pin's date is that plate's, and the front line is drawn (four sets standing)", t.label === "Jun 1944" && t.date === "19440615" && f1.date === 19440615 && f1.on && f1.drawn >= 2 && /15 Jun 1944/.test(t.text), JSON.stringify([t.label, t.date, f1, t.text]));
    const later = ww.list.filter((d) => d > 19440615 && d < 19450101).pop();
    await goTo(at(later)); await sleep(1500);
    t = await tl(page); const f2 = await page.evaluate(() => { const f = AtlasEmbed.hub().ctl.fronts(); return { date: f.date, drawn: f.drawn.length, faces: f.drawn.map((x) => x.face).join(",") }; }); await snap(page, "dec44");
    const dl = await diff(page, "jun44", "dec44");
    check(`${later}: the label moved on (${t.label}), the same year, and the front's faces and pixels changed (${dl} pixels differ; faces ${f1.faces} → ${f2.faces}) with the states as they were`, f2.date === later && t.year === "1944" && f2.faces !== f1.faces && dl > 200, JSON.stringify([f2, dl]));
    await goTo(at(19420131)); await sleep(1500);
    t = await tl(page);
    check("31 January 1942 reads \"Jan 1942\" and the window's year is 1942", t.label === "Jan 1942" && t.year === "1942", JSON.stringify([t.label, t.year]));
    await ctx.close();
  }

  check("no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  await browser.close(); server.close();
  console.log(`\n${pass} ok, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
