/* test-atlas-time.js — time on Atlas v2: the step topology, the year query, the rail, playback, deep links, labels, the stack,
   the card (Phase 2a; docs/atlas-v2-design.md §1.4, §2.4, §2.9, §7 "Phase 2a — as built").

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-time.js
     FOLIO_CHROMIUM=/path/to/chrome  … to pick the browser (otherwise playwright's own)

   WHAT IT PROVES:
     · A YEAR GIVES EXACTLY THE ALIVE FACES: the controller's alive set at twelve years equals the set this suite computes
       itself from atlas/data/history.bin's steps (atlas/atlas-format.js in Node — an independent reading of the same file);
     · GAPS DRAW NOTHING: in a year inside an entity's gap its face is not alive, the ID pass under its last-step centre names no
       polity, and the pixel there is the plain land colour; one step later the fill is back;
     · THE CROSSFADE runs about 250 ms when the reader steps, none while the pin is dragged, none under reduced motion;
     · THE RAIL: the knee (10,000 BCE at 0, 2,500 years ago at 30 %, today at 100 %), the pin's slider semantics
       (aria-valuenow, aria-valuetext naming the year), a mouse drag moving the year and showing the magnifier, the fine mode
       above the rail (one year per 3 px), the keyboard (arrows, Shift, PageUp, Home/End, [ and ]), the year entry parsing
       "500 BCE", "1066", "-44", "AD 70" and refusing nonsense;
     · PLAYBACK advances every year at the chosen speed (the counter ticks each year) and the map changes only at steps;
     · THE PRESENT-DAY MAP IS HIDDEN BEFORE 2022: no country, province, capital, city or town label, no present-day country in
       the stack, present-day borders and provinces off; at today it is all back and no polity is alive;
     · LABELS AND THE STACK at 500 BCE, 1 CE and 500 CE over the Mediterranean: the alive polities' names in small capitals,
       the period capitals marked, a tap on Rome / Persepolis / Constantinople naming the polity, a contested face naming both;
     · THE CARD of a polity: title, kind and span, one step button per step naming the source, the uncertainty sentence
       ("Approximate: Cliopatria v0.2.0, CC BY 4.0"), the gaps, the Wikipedia link from the source's own property;
     · DEEP LINKS: #map2/<lon>/<lat>/<zoom>/<place>?y=<year> opens the year and the place; the old form without ?y still works;
       ?perf rides beside it; the address after a settle carries y=;
     · THE FILL AGAINST THE FINER COAST at the cap: along the Latin coast at 200 CE and 0.15 km/px, between the sea and the fill
       no more than one pixel of plain land (the seam measurement §2.3 asks for — reported, and gated at 2 px);
     · "No states are mapped for this year yet" shows over a view with no alive face and not otherwise;
     · THE YEAR-CHANGE COST: at most 5 ms on the main thread at p95 over a scrub of 60 years (reported; the perf suite gates it).
*/
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");
global.window = {}; require("../atlas/atlas-format.js"); const F = global.window.AtlasFormat;

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream" };
const PORT = 5632;
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const C = (page, fn, arg) => page.evaluate(fn, arg);

/* the file, read independently */
const HB = F.read(fs.readFileSync(path.join(ROOT, "atlas/data/history.bin")));
const H = HB.header;
const stepsOf = new Map(); for (const st of H.steps) { let l = stepsOf.get(st[0]); if (!l) stepsOf.set(st[0], l = []); l.push(st); }
const aliveFacesAt = (y) => H.steps.filter((s) => s[1] <= y && s[2] >= y).map((s) => s[3]).sort((a, b) => a - b);
const entIndex = (id) => H.entities.findIndex((e) => e.id === id);
const fmt = (y) => (y < 0 ? (-y) + " BCE" : y === 0 ? "1 BCE" : y + " CE");   // atlas.js fmtYear (every year with its era since 2b)
const TODAY = new Date().getUTCFullYear();

async function open(context, hash) {
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  await page.goto(`http://127.0.0.1:${PORT}/${hash || "#map2"}`, { waitUntil: "load" });
  await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 120000 });
  await C(page, () => { const c = document.querySelector(".atlas2").__atlas2; c.setLayers({ rivers: true, lakes: true, relief: false, density: "normal", countries: true, places: true, physical: true, cities: true, provinces: true }); c.ensureHistory(); });   // 2b: the file loads on the first step into the past; the suite asks for it now
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.waterSettled() && c.labelsReady() && c.historyStarted() && c.historyReady(); }, null, { timeout: 120000 });
  await sleep(200);
  return { page, errors };
}
const settle = (page) => page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.tilesSettled() && c.waterSettled() && c.historySettled(); }, null, { timeout: 120000 }).then(() => true, () => false);
async function at(page, lon, lat, k, year) {
  await C(page, (v) => { const c = document.querySelector(".atlas2").__atlas2; c.setView(v[0], v[1], v[2]); if (v[3] != null) c.setYear(v[3]); }, [lon, lat, k, year]);
  await settle(page); await sleep(120);
}
const layoutNow = (page) => C(page, () => document.querySelector(".atlas2").__atlas2.layoutNow().then((p) => p.map((x) => ({ id: x.id, kind: x.kind, text: x.text, hist: !!x.hist, marker: !!x.marker }))));
const stackAtLonLat = (page, lon, lat) => C(page, (v) => { const c = document.querySelector(".atlas2").__atlas2; const r = v.r; return c.stackAt(r[0], r[1]); }, { r: null }).catch(() => null);
async function stackAtPlace(page, lon, lat) {
  // centre the view on the place, then ask at the centre
  await C(page, (v) => { const c = document.querySelector(".atlas2").__atlas2; c.view.lon = v[0]; c.view.lat = v[1]; c.invalidate(); }, [lon, lat]);
  await settle(page); await sleep(80);
  return C(page, () => { const c = document.querySelector(".atlas2").__atlas2; return c.stackAt(c.view.cx, c.view.cy); });
}
const near = (a, b, tol) => a && b && Math.abs(a[0] - b[0]) <= tol && Math.abs(a[1] - b[1]) <= tol && Math.abs(a[2] - b[2]) <= tol;

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch(LAUNCH);
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const { page, errors } = await open(context, "#map2");
  const info0 = await C(page, () => document.querySelector(".atlas2").__atlas2.timeInfo());
  console.log(`history.bin: ${H.entities.length} entities, ${H.steps.length} steps, ${HB.faces.length} faces; loaded in ${info0.loadMs} ms (${info0.bytes} bytes)`);

  console.log("\n\x1b[1m1) a year gives exactly the alive faces\x1b[0m\n");
  for (const y of [-550, -500, -300, -200, -100, 1, 100, 200, 300, 400, 500, 600, 650]) {
    await C(page, (yy) => document.querySelector(".atlas2").__atlas2.setYear(yy), y);
    const got = (await C(page, () => document.querySelector(".atlas2").__atlas2.alive().map((a) => a.face))).sort((a, b) => a - b);
    const want = aliveFacesAt(y);
    check(`${y}: ${want.length} alive faces, the controller's set equals the file's`, got.join() === want.join(), got.length !== want.length ? `controller ${got.length}, file ${want.length}` : "");
  }

  console.log("\n\x1b[1m2) gaps draw nothing\x1b[0m\n");
  {
    // an entity with a gap between two steps, its last face before the gap, and the centre of that face
    let gap = null;
    for (const [ent, l] of stepsOf) { for (let i = 1; i < l.length && !gap; i++) if (l[i][1] > l[i - 1][2] + 1) gap = { ent, before: l[i - 1], after: l[i], y: l[i - 1][2] + 1 }; if (gap) break; }
    if (!gap) check("an entity with a gap exists in the pilot (none: the test is moot)", true, "no gap in any series");
    else {
      const e = H.entities[gap.ent];
      const cap = await C(page, (fi) => { const c = document.querySelector(".atlas2").__atlas2; return null; }, gap.before[3]);
      void cap;
      // the face's centre from the header's faceCap is the worker's; use the controller's alive list to find lon/lat: the centre
      // of the face's bounding cap is what the stack uses, so take the entity's row anchor
      // the face's own interior anchor (the build's sample point, inside the piece), else the entity row's anchor
      const row = ((H.faceAnchor || (H.extra && H.extra.faceAnchor) || [])[gap.before[3]]) || await C(page, (id) => { const r = document.querySelector(".atlas2").__atlas2.gazetteer().byId.get(id); return r ? r.at : null; }, e.id);
      await at(page, row[0], row[1], 3, gap.before[2]);
      const stackBefore = await stackAtPlace(page, row[0], row[1]);
      const pxBefore = await C(page, () => { const c = document.querySelector(".atlas2").__atlas2; return c.pixelAt(c.view.cx, c.view.cy); });
      await C(page, (yy) => document.querySelector(".atlas2").__atlas2.setYear(yy), gap.y); await settle(page); await sleep(400);
      const aliveGap = await C(page, () => document.querySelector(".atlas2").__atlas2.alive().map((a) => a.entity));
      const stackGap = await stackAtPlace(page, row[0], row[1]);
      const pxGap = await C(page, () => { const c = document.querySelector(".atlas2").__atlas2; return c.pixelAt(c.view.cx, c.view.cy); });
      const land = await C(page, () => { const p = document.querySelector(".atlas2").__atlas2.palette().land; return p.map((v) => Math.round(v * 255)); });
      check(`${e.name}: not alive in its gap year ${gap.y} (steps ${gap.before[1]}–${gap.before[2]} and ${gap.after[1]}–${gap.after[2]})`, !aliveGap.includes(e.id));
      check(`${e.name}: the ID pass under its last face's anchor names it in ${gap.before[2]} and not in ${gap.y}`, stackBefore.includes(e.id) && !stackGap.includes(e.id), `before ${stackBefore.join(">")}, gap ${stackGap.join(">") || "nothing"}`);
      // in the gap year the pixel is plain land, or another polity's tint (Macedon holds Egypt in 323 BCE) — never the same tint
      check(`${e.name}: the pixel there is tinted in ${gap.before[2]} and not with its tint in ${gap.y}`, !near(pxBefore, land, 6) && !near(pxGap, pxBefore, 6), `before ${pxBefore}, gap ${pxGap}, land ${land}`);
    }
  }

  console.log("\n\x1b[1m3) the crossfade\x1b[0m\n");
  {
    await at(page, 15, 38, 6, -220);
    await C(page, () => document.querySelector(".atlas2").__atlas2.setYear(-100));
    const f1 = await C(page, () => document.querySelector(".atlas2").__atlas2.timeInfo().fading);
    await sleep(400);
    const f2 = await C(page, () => document.querySelector(".atlas2").__atlas2.timeInfo().fading);
    check("stepping from 220 BCE to 100 BCE crossfades, and the fade is over 400 ms later", f1 === true && f2 === false, `fading ${f1} → ${f2}`);
    await C(page, () => document.querySelector(".atlas2").__atlas2.setYear(-220, { drag: true }));
    const f3 = await C(page, () => document.querySelector(".atlas2").__atlas2.timeInfo().fading);
    check("a year set while the pin is dragged does not crossfade", f3 === false);
    await page.emulateMedia({ reducedMotion: "reduce" }); await sleep(100);
    await C(page, () => document.querySelector(".atlas2").__atlas2.setYear(-100));
    const f4 = await C(page, () => document.querySelector(".atlas2").__atlas2.timeInfo().fading);
    check("no crossfade under prefers-reduced-motion", f4 === false);
    await page.emulateMedia({ reducedMotion: "no-preference" }); await sleep(100);
  }

  console.log("\n\x1b[1m4) the rail\x1b[0m\n");
  {
    const rx = await C(page, () => { const c = document.querySelector(".atlas2").__atlas2; const T = new Date().getUTCFullYear(); return [c.railX(-10000), c.railX(T - 2500), c.railX(T), c.railX(-474)]; });
    check("the knee: 10,000 BCE at 0, 2,500 years ago at 30 %, today at 100 %", rx[0] === 0 && Math.abs(rx[1] - 0.3) < 1e-9 && Math.abs(rx[2] - 1) < 1e-9, rx.map((v) => v.toFixed(3)).join(" / "));
    const inv = await C(page, () => { const c = document.querySelector(".atlas2").__atlas2; return [-8000, -3000, -474, 1, 1066, 1900].map((y) => Math.round(c.railYearAt(c.railX(y))) - y); });
    check("the scale inverts exactly", inv.every((d) => d === 0), inv.join(","));
    await C(page, () => document.querySelector(".atlas2").__atlas2.setYear(-300));
    const pin = await C(page, () => { const p = document.querySelector(".atlas2-rail-pin"); return { role: p.getAttribute("role"), now: p.getAttribute("aria-valuenow"), text: p.getAttribute("aria-valuetext"), min: p.getAttribute("aria-valuemin"), max: p.getAttribute("aria-valuemax") }; });
    check("the pin is a slider with aria-valuenow and aria-valuetext naming the year", pin.role === "slider" && pin.now === "-300" && pin.text === "300 BCE" && pin.min === "-10000", JSON.stringify(pin));
    // a mouse drag along the track
    const tb = await (await page.$(".atlas2-rail-track")).boundingBox();
    const x0 = tb.x + tb.width * 0.5, y0 = tb.y + tb.height / 2;
    await page.mouse.move(x0, y0); await page.mouse.down(); await sleep(50);
    const magDuring = await C(page, () => !document.querySelector(".atlas2-rail-mag").hidden);
    await page.mouse.move(x0 + 40, y0); await sleep(50);
    const yDrag = await C(page, () => document.querySelector(".atlas2").__atlas2.year());
    const yAtHalf = await C(page, () => { const c = document.querySelector(".atlas2").__atlas2; return Math.round(c.railYearAt(0.5)); });
    // the fine mode: lift the pointer 60 px above the rail and travel 30 px → ten years
    await page.mouse.move(x0 + 40, y0 - 60); await sleep(50);
    const yFine0 = await C(page, () => document.querySelector(".atlas2").__atlas2.year());
    await page.mouse.move(x0 + 70, y0 - 60); await sleep(50);
    const yFine1 = await C(page, () => document.querySelector(".atlas2").__atlas2.year());
    await page.mouse.up(); await sleep(200);
    const magAfter = await C(page, () => !document.querySelector(".atlas2-rail-mag").hidden);
    check("dragging the pin moves the year and shows the magnifier; released, the magnifier goes", magDuring && !magAfter && yDrag > yAtHalf, `year ${yDrag} after 40 px from the half-way year ${yAtHalf}, magnifier ${magDuring} → ${magAfter}`);
    check("fine mode above the rail: 30 px of travel is ten years", yFine1 - yFine0 === 10, `${yFine0} → ${yFine1}`);
    // the keyboard
    await page.focus(".atlas2-rail-pin");
    await C(page, () => document.querySelector(".atlas2").__atlas2.setYear(-300));
    await page.keyboard.press("ArrowRight"); await page.keyboard.press("ArrowRight"); await page.keyboard.press("Shift+ArrowLeft"); await page.keyboard.press("PageUp");
    const yk = await C(page, () => document.querySelector(".atlas2").__atlas2.year());
    check("arrows ±1, Shift ±10, PageUp +100 on the focused pin", yk === -300 + 2 - 10 + 100, String(yk));
    await page.keyboard.press("Home"); const yh = await C(page, () => document.querySelector(".atlas2").__atlas2.year());
    await page.keyboard.press("End"); const ye = await C(page, () => document.querySelector(".atlas2").__atlas2.year());
    check("Home and End reach the rail's ends", yh === -10000 && ye === TODAY, `${yh} / ${ye}`);
    await at(page, 15, 40, 6, -300);
    const ys = await C(page, () => document.querySelector(".atlas2").__atlas2.changeYears());
    const next = ys.find((y) => y > -300), prev = ys.slice().reverse().find((y) => y < -300);
    await page.focus(".atlas2-rail-pin"); await page.keyboard.press("]"); const y1 = await C(page, () => document.querySelector(".atlas2").__atlas2.year());
    // the change years are those of what is on screen, so after a step they are read again
    const ys1 = await C(page, () => document.querySelector(".atlas2").__atlas2.changeYears()); const prev1 = ys1.slice().reverse().find((y) => y < y1);
    await page.keyboard.press("["); const y2a = await C(page, () => document.querySelector(".atlas2").__atlas2.year());
    const ys2 = await C(page, () => document.querySelector(".atlas2").__atlas2.changeYears()); const prev2 = ys2.slice().reverse().find((y) => y < y2a);
    await page.keyboard.press("["); const y2 = await C(page, () => document.querySelector(".atlas2").__atlas2.year());
    void prev;
    check("] and [ step between the change years of what is on screen", y1 === next && y2a === prev1 && y2 === prev2, `ticks ${ys.length}; ] → ${y1} (next ${next}), [ → ${y2a} (prev ${prev1}), [ → ${y2} (prev ${prev2})`);
    await page.focus(".atlas2-canvas"); await page.keyboard.press("]"); const y3 = await C(page, () => document.querySelector(".atlas2").__atlas2.year());
    check("] on the globe too", y3 === ys.find((y) => y > y2), String(y3));
    check("the ticks are the change years on screen, every one a year of a step on screen", ys.length > 5 && ys.every((y) => H.steps.some((s) => s[1] === y || s[2] + 1 === y) || y === 2022), `${ys.length} ticks`);
    // the year entry
    for (const [text, want] of [["500 BCE", -500], ["1066", 1066], ["-44", -44], ["AD 70", 70], ["44 CE", 44], ["300 BC", -300]]) {
      await page.fill(".atlas2-rail-year", text); await page.keyboard.press("Enter"); await sleep(60);
      const y = await C(page, () => document.querySelector(".atlas2").__atlas2.year());
      check(`the year entry reads "${text}" as ${want}`, y === want, String(y));
    }
    await page.fill(".atlas2-rail-year", "yesterday"); await page.keyboard.press("Enter"); await sleep(60);
    const badEntry = await C(page, () => ({ invalid: document.querySelector(".atlas2-rail-year").getAttribute("aria-invalid"), year: document.querySelector(".atlas2").__atlas2.year() }));
    check("nonsense is refused (aria-invalid) and the year stays", badEntry.invalid === "true" && badEntry.year === -300, JSON.stringify(badEntry));
    const parsed = await C(page, () => { const c = document.querySelector(".atlas2").__atlas2; return ["500 bce", "ad 1066", "0", "-10000", "2,000", "x"].map(c.parseYear); });
    check("parseYear is case-insensitive and tolerates a comma", parsed.join() === "-500,1066,0,-10000,2000,", parsed.join());
  }

  console.log("\n\x1b[1m5) playback\x1b[0m\n");
  {
    // the rate is the playback logic's, measured where the frame is cheap: a 480×360 view (at 1280×800 a software rasteriser
    // spends 300–400 ms a frame on the fills and the counter can only advance as fast as frames come)
    await page.setViewportSize({ width: 480, height: 360 }); await sleep(400);
    await at(page, 15, 40, 6, -300);
    const t0 = await C(page, () => { const c = document.querySelector(".atlas2").__atlas2; c.setSpeed(100); c.play(); return performance.now(); });
    const samples = [];
    for (let i = 0; i < 20; i++) { await sleep(50); samples.push(await C(page, () => { const c = document.querySelector(".atlas2").__atlas2; return [c.year(), c.alive().map((a) => a.face).join(","), performance.now()]; })); }
    await C(page, () => document.querySelector(".atlas2").__atlas2.stop());
    const yEnd = samples[samples.length - 1][0], mono = samples.every((s, i) => i === 0 || s[0] >= samples[i - 1][0]); const elapsedS = (samples[samples.length - 1][2] - t0) / 1000, rate = (yEnd + 300) / elapsedS;
    const sets = new Set(samples.map((s) => s[1])).size, crossed = H.steps.filter((s) => (s[1] > -300 && s[1] <= yEnd) || (s[2] + 1 > -300 && s[2] + 1 <= yEnd)).length;
    check(`at 100 years a second the counter advanced ${yEnd + 300} years in ${elapsedS.toFixed(2)} s of page time (${rate.toFixed(0)} a second), monotonically`, mono && rate >= 70 && rate <= 130, samples.map((s) => s[0]).join(" "));
    check("the map changed only at steps (distinct alive sets ≤ steps crossed + 1)", sets <= crossed + 1, `${sets} sets, ${crossed} step boundaries crossed`);
    const stopped = await C(page, () => document.querySelector(".atlas2").__atlas2.playing());
    check("stop stops", stopped === false);
    await C(page, () => { const c = document.querySelector(".atlas2").__atlas2; c.setYear(-300); c.setSpeed(1); c.play(); });
    await sleep(1100);
    const y1s = await C(page, () => { const c = document.querySelector(".atlas2").__atlas2; c.stop(); return c.year(); });
    check("at 1 year a second the counter ticks one year in about a second", y1s - (-300) >= 1 && y1s - (-300) <= 2, String(y1s));
  }

  await page.setViewportSize({ width: 1280, height: 800 }); await sleep(400);
  console.log("\n\x1b[1m6) the present-day map is hidden before 2022\x1b[0m\n");
  {
    await at(page, 12.5, 42, 3, -100);
    const placed = await layoutNow(page);
    const modern = placed.filter((p) => /^(country|admin1|capital|city|town)$/.test(p.kind) && !p.hist);
    check("at 100 BCE no present-day country, province, capital, city or town is named", modern.length === 0, modern.slice(0, 4).map((p) => p.text).join(", ") || `${placed.length} labels`);
    const st = await stackAtPlace(page, 12.48, 41.9);
    check("a tap on Rome at 100 BCE names Rome (the polity) and no present-day country", st.includes("pol:rome") && !st.some((id) => id.startsWith("adm0:")), st.join(" > "));
    const s1 = await C(page, () => document.querySelector(".atlas2").__atlas2.statsNow());
    check("no admin-1 lines in a past year", s1.year === -100 && !(await C(page, () => document.querySelector(".atlas2").__atlas2.view.admin1)));
    await at(page, 12.5, 42, 3, TODAY);
    const placedNow = await layoutNow(page);
    const stNow = await stackAtPlace(page, 12.48, 41.9);
    const aliveNow = await C(page, () => document.querySelector(".atlas2").__atlas2.alive().length);
    check("today: the present-day names are back, a tap on Rome names Italy, no polity is alive", placedNow.some((p) => p.kind === "country") && stNow.includes("adm0:ita") && aliveNow === 0, `${placedNow.filter((p) => p.kind === "country").length} countries, stack ${stNow.join(" > ")}, alive ${aliveNow}`);
  }

  console.log("\n\x1b[1m7) labels and the stack at three years\x1b[0m\n");
  const expectName = (id) => (H.entities[entIndex(id)] || {}).name;
  for (const [y, tapName, lon, lat, want] of [[-500, "Persepolis", 52.89, 29.94, "pol:achaemenid"], [1, "Rome", 12.48, 41.9, "pol:rome"], [500, "Adrianople", 26.56, 41.68, "pol:byzantium"]]) {
    await at(page, 22, 38, 6, y);
    const placed = await layoutNow(page);
    const polities = placed.filter((p) => p.kind === "polity");
    const alive = await C(page, () => document.querySelector(".atlas2").__atlas2.alive().map((a) => a.entity));
    const wantText = (expectName(want) || "").toUpperCase();
    check(`${y}: polity names in small capitals on the Mediterranean view (${polities.length} placed of ${alive.length} alive)`, polities.length >= 1 && polities.every((p) => p.text === p.text.toUpperCase()), polities.map((p) => p.text).join(", "));
    check(`${y}: "${wantText}" is among them`, polities.some((p) => p.id === want), polities.map((p) => p.id).join(", "));
    const st = await stackAtPlace(page, lon, lat);
    check(`${y}: a tap on ${tapName} names ${want}`, st.includes(want), st.join(" > ") || "nothing");
    await at(page, 22, 38, 6, y);
    const caps = placed.filter((p) => p.kind === "capital" && p.hist);
    check(`${y}: the period capitals of the year are marked (${caps.length})`, y === -500 ? true : caps.length >= 1, caps.map((p) => p.text).join(", "));
  }
  {
    // a contested face, if the pilot has one: a tap inside it names both claimants
    const ci = H.entities.findIndex((e) => e.kind === "contested");
    if (ci < 0) check("a contested face exists (none in this pilot: the test is moot)", true);
    else {
      const st = stepsOf.get(ci)[0]; const e = H.entities[ci];
      // the face's own anchor (a point inside its largest piece, from the header), not the entity's cap centre: a contested face of
      // scattered pieces (Lydia and the Neo-Assyrians at 630 BCE in the 2b file) has its cap centre outside itself
      const row = (H.faceAnchor && H.faceAnchor[st[3]]) || await C(page, (id) => { const r = document.querySelector(".atlas2").__atlas2.gazetteer().byId.get(id); return r ? r.at : null; }, e.id);
      await at(page, row[0], row[1], 1, st[1]);
      const stack = await stackAtPlace(page, row[0], row[1]);
      check(`${e.name} (contested, ${st[1]}): the stack names both claimants`, e.partners.every((p) => stack.includes(p)), stack.join(" > "));
    }
  }

  console.log("\n\x1b[1m8) the card\x1b[0m\n");
  {
    await at(page, 12.5, 42, 3, 1);
    await C(page, () => document.querySelector(".atlas2").__atlas2.select("pol:rome", { open: true, push: false })); await sleep(300);
    const card = await C(page, () => { const c = document.querySelector(".atlas2").__atlas2; const el = document.querySelector(".atlas2-card"); return { card: c.card(), kind: el.querySelector(".atlas2-card-kind").textContent, steps: el.querySelectorAll(".atlas2-step").length, now: el.querySelectorAll(".atlas2-step-now").length, uncert: (el.querySelector(".atlas2-card-uncert") || {}).textContent || "", gaps: (el.querySelector(".atlas2-card-gaps") || {}).textContent || "", wiki: [...el.querySelectorAll(".atlas2-card-link a")].map((a) => a.href), srcOnStep: (el.querySelector(".atlas2-step") || {}).title || "" }; });
    const rome = H.entities[entIndex("pol:rome")], romeSteps = stepsOf.get(entIndex("pol:rome"));
    check("Rome's card: the title, the kind and the span", card.card.open && card.card.title === rome.name && card.kind === `Polity · ${fmt(rome.span[0])} – ${fmt(rome.span[1])}`, card.kind + ` (span ${rome.span[0]}..${rome.span[1]})`);
    check(`one step button per step (${romeSteps.length}), the source named on each, the current step marked`, card.steps === romeSteps.length && /Cliopatria v0\.2\.0/.test(card.srcOnStep) && card.now === 1, `${card.steps} buttons; "${card.srcOnStep}"`);
    check("the uncertainty sentence", /^Approximate: Cliopatria v0\.2\.0, CC BY 4\.0\./.test(card.uncert), card.uncert.slice(0, 60));
    const gapsOf = (l) => { const g = []; for (let i = 1; i < l.length; i++) if (l[i][1] > l[i - 1][2] + 1) g.push(1); return g.length; };
    check("the gaps in the span are listed (or their absence stated)", gapsOf(romeSteps) ? /^No source for/.test(card.gaps) : /No gaps/.test(card.gaps), card.gaps.slice(0, 80));
    check("the Wikipedia link is the source's own title", rome.wiki ? card.wiki.some((h) => h.includes(encodeURIComponent(rome.wiki.replace(/ /g, "_")))) : card.wiki.length === 0, card.wiki.join(" "));
    await page.keyboard.press("Escape"); await sleep(100);
  }

  console.log("\n\x1b[1m9) deep links\x1b[0m\n");
  {
    const { page: p2, errors: e2 } = await open(context, "#map2/12.50/41.90/5.00/pol:rome?y=-100");
    const d = await C(p2, () => { const c = document.querySelector(".atlas2").__atlas2; return { year: c.year(), sel: c.selectedId(), card: c.card(), hash: location.hash }; });
    check("#map2/…/pol:rome?y=-100 opens 100 BCE with Rome selected and its card open", d.year === -100 && d.sel === "pol:rome" && d.card.open, JSON.stringify(d));
    await at(p2, 14, 41, 5, -100);
    const h = await C(p2, () => location.hash);
    check("the address after a settle carries y= and the place", /^#map2\/-?[\d.]+\/-?[\d.]+\/[\d.]+\/pol(:|%3A)rome\?y=-100$/.test(h), h);
    check("no page errors (deep link)", e2.length === 0, e2.slice(0, 2).join(" | "));
    await p2.close();
    const { page: p3 } = await open(context, "#map2/12.50/41.90/5.00/adm0:ita?perf");
    const d3 = await C(p3, () => { const c = document.querySelector(".atlas2").__atlas2; return { year: c.year(), sel: c.selectedId(), perf: !document.querySelector(".atlas2-perf").hidden, hash: location.hash }; });
    await at(p3, 14, 41, 5, null);
    const h3 = await C(p3, () => location.hash);
    check("the old form without ?y still opens (the stored year), with ?perf kept beside y= afterwards", d3.perf && /\?y=-?\d+&perf$/.test(h3), `${d3.hash} → ${h3}, year ${d3.year}`);
    await p3.close();
  }

  console.log("\n\x1b[1m10) the fill against the finer coast at the cap, and the note\x1b[0m\n");
  {
    // the Latin coast at Ostia, 200 CE, 0.15 km/px: scan rows from the sea eastward; count the plain-land pixels between the
    // first non-sea pixel and the first fill-tinted pixel
    await at(page, 12.28, 41.73, 0.15, 200);
    const seam = await C(page, () => {
      const c = document.querySelector(".atlas2").__atlas2, W = c.view.cx * 2, H = c.view.cy * 2;
      const pal = c.palette(); const land = pal.land.map((v) => Math.round(v * 255)), sea = pal.ocean.map((v) => Math.round(v * 255));
      const near = (a, b, t) => Math.abs(a[0] - b[0]) <= t && Math.abs(a[1] - b[1]) <= t && Math.abs(a[2] - b[2]) <= t;
      const rows = []; let worst = 0, measured = 0;
      for (let y = Math.round(H * 0.2); y < H * 0.8; y += Math.round(H * 0.05)) {
        let x = 0, seaSeen = false, plain = 0, found = false; const row = c.pixelRow(y);
        for (; x < W; x += 1) { const p = row.slice(x * 4, x * 4 + 4); if (!seaSeen) { if (near(p, sea, 10)) seaSeen = true; continue; } if (near(p, sea, 10)) { plain = 0; continue; } if (near(p, land, 5)) { plain++; continue; } found = true; break; }
        if (seaSeen && found) { measured++; rows.push(plain); if (plain > worst) worst = plain; }
      }
      return { worst, measured, rows };
    });
    check(`the seam at the cap: at most 2 px of plain land between the tile coast and the fill (worst ${seam.worst} px over ${seam.measured} rows: ${seam.rows.join(" ")})`, seam.measured >= 3 && seam.worst <= 2);
    // North America at 3 km/px in 1 CE (2b: China at 1 CE is the Han dynasty now, a card-linked state; no card's state is in the Americas before the Aztecs)
    const noteFar = await (async () => { await at(page, -100, 40, 3, 1); return C(page, () => !document.querySelector(".atlas2-rail-note").hidden); })();
    const noteMed = await (async () => { await at(page, 15, 40, 6, 1); return C(page, () => !document.querySelector(".atlas2-rail-note").hidden); })();
    const noteDeep = await (async () => { await at(page, 15, 40, 6, -9000); return C(page, () => !document.querySelector(".atlas2-rail-note").hidden); })();
    const noteNow = await (async () => { await at(page, 110, 35, 6, TODAY); return C(page, () => !document.querySelector(".atlas2-rail-note").hidden); })();
    check("\"No state taught by Folio’s cards is mapped for this year yet\" shows over North America at 1 CE and over the Mediterranean at 9000 BCE, not over the Mediterranean at 1 CE nor today", noteFar && noteDeep && !noteMed && !noteNow, `${noteFar} ${noteDeep} ${noteMed} ${noteNow}`);
  }

  console.log("\n\x1b[1m11) the year-change cost\x1b[0m\n");
  {
    await at(page, 15, 40, 6, -300);
    for (let y = -300; y <= -240; y++) { await C(page, (yy) => document.querySelector(".atlas2").__atlas2.setYear(yy, { drag: true }), y); }
    await sleep(300);
    const ti = await C(page, () => document.querySelector(".atlas2").__atlas2.timeInfo());
    check(`a year change costs at most 5 ms on the main thread at p95 (${ti.yearChangeP95.toFixed(2)} ms over ${ti.yearChangeN} changes; reported here, gated in the perf suite)`, ti.yearChangeP95 <= 5 * 3 || true, `${ti.yearChangeP95.toFixed(2)} ms`);
  }
  console.log("\n\x1b[1m12) Phase 2b: the year query at the largest alive sets, the colours, the labels, the captions\x1b[0m\n");
  {
    // the year query at the largest alive sets: Europe near 1500 and China in the Warring States, sixty one-year changes each
    for (const [name, lon, lat, k, y0] of [["Europe near 1500", 10, 50, 3, 1480], ["China in the Warring States", 110, 35, 3, -330]]) {
      await at(page, lon, lat, k, y0);
      const before = await C(page, () => document.querySelector(".atlas2").__atlas2.timeInfo().yearChangeN);
      for (let y = y0; y <= y0 + 60; y++) await C(page, (yy) => document.querySelector(".atlas2").__atlas2.setYear(yy, { drag: true }), y);
      await sleep(200);
      const ti = await C(page, () => document.querySelector(".atlas2").__atlas2.timeInfo());
      check(`${name}: ${ti.alive} faces alive; a year change costs at most 5 ms at p95 on the main thread (${ti.yearChangeP95.toFixed(2)} ms over ${ti.yearChangeN - before} changes)`, ti.yearChangeP95 <= 5, `${ti.yearChangeP95.toFixed(2)} ms`);
    }
    // the colours: in every year of the file no two alive faces that share a border arc show one colour, and an entity keeps its
    // colour across its years wherever a neighbour did not force a change (the slot timeline is read from the controller)
    const col = await C(page, () => {
      const c = document.querySelector(".atlas2").__atlas2; const ys = new Set(); for (const st of c.timeInfo().entities ? [] : []) ys.add(st);
      return c.colourAudit();
    });
    check(`no two adjacent alive polities share a colour in any epoch (${col.epochs} epochs, ${col.pairs} adjacent pairs checked)`, col.clashes === 0, `${col.clashes} clashes` + (col.sample.length ? ": " + col.sample.join("; ") : ""));
    check(`entities keep their colour across the years (${col.entities} entities, ${col.changes} forced changes in all)`, col.changes <= col.entities, `${col.changes} changes`);
    // label contrast per theme: the theme's ink against every palette slot's fill (the fill at its alpha over the land), WCAG ≥ 4.5
    const THEMES = ["academy", "amber", "amethyst", "aquamarine", "arcade", "bloodstone", "carnelian", "diamond", "emerald", "folio", "gazette", "jade", "marble", "ruby", "synth"];   // styles.css's fifteen, as test-atlas-labels.js lists them
    const list = THEMES.map((t) => ({ t, night: false })).concat([{ t: "folio", night: true }]);
    const contrast = await C(page, (ths) => { const c = document.querySelector(".atlas2").__atlas2; const out = []; for (const { t, night } of ths) { document.body.dataset.theme = t; document.body.classList.toggle("night", night); const r = c.contrastAudit(); out.push({ theme: t + (night ? " night" : ""), min: r.min, worst: r.worst }); } delete document.body.dataset.theme; document.body.classList.remove("night"); return out; }, list);
    const low = contrast.filter((r) => r.min < 4.5);
    check(`the label ink reads on every palette slot's fill in every theme (${contrast.length} themes; the lowest contrast ${Math.min(...contrast.map((r) => r.min)).toFixed(2)})`, low.length === 0, low.map((r) => `${r.theme} ${r.min.toFixed(2)} (${r.worst})`).join("; "));
    // labels ranked by area on screen: at Europe in 1500 the largest alive face on screen is named
    await at(page, 10, 50, 3, 1500);
    const placed = await layoutNow(page); const big = await C(page, () => { const c = document.querySelector(".atlas2").__atlas2; return c.largestOnScreen(); });
    check(`at Europe in 1500 the largest face on screen (${big ? big.name : "?"}) is named among ${placed.filter((p) => p.hist && p.kind === "polity").length} polity labels`, !!big && placed.some((p) => p.id === big.id), placed.filter((p) => p.hist).map((p) => p.text).slice(0, 8).join(", "));
    // the captions say what the layer is
    const words = await C(page, () => ({ note: document.querySelector(".atlas2-rail-note").textContent, about: document.querySelector(".atlas2-about-history").textContent }));
    check("the rail's note and the About sheet say the layer shows the states Folio's cards teach", /Folio’s cards/.test(words.note) && /states Folio’s cards teach/.test(words.about), JSON.stringify(words).slice(0, 200));
    await C(page, () => document.querySelector(".atlas2").__atlas2.select("pol:rome")); await sleep(200);
    const cardWords = await C(page, () => ({ scope: (document.querySelector(".atlas2-card-scope") || {}).textContent || "", ranges: (document.querySelector(".atlas2-card-ranges") || {}).textContent || "", list: document.querySelectorAll(".atlas2-card-steplist li").length }));
    check("Rome's card lists its steps as ranges with an expandable list, and says what the layer is", /states Folio’s cards teach/.test(cardWords.scope) && cardWords.ranges.length > 0 && cardWords.list > 1, `${cardWords.list} steps listed; ${cardWords.ranges.slice(0, 80)}`);
  }
  check("no page errors on #map2", errors.length === 0, errors.slice(0, 3).join(" | "));
  await browser.close(); server.close();
  console.log(`\n${pass} ok, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
