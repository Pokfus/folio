/* test-window-fallbacks.js — the card windows and Find it when the engine cannot run in full (Atlas v2 Phase 5, the owner's decision 3; docs/atlas-v2-phase5-plan.md §1 and §4.5).

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-window-fallbacks.js
     FOLIO_CHROMIUM=/path/to/chrome  … to pick the browser (otherwise playwright's own)

   Phase 5 deleted the earlier window and the earlier Find it, so a browser that cannot run the engine used to be handed to them and now has two fallbacks of the engine's own:
     NO WebGL2   the windows run on the engine's still Canvas 2D renderer (atlas/atlas-canvas.js; host attribute data-map-engine="v2-2d"): land, borders, the tint and the marks, no outline glow, the zoom held at 8,
                 a war window a plain sentence (data-map-engine="none", class mc-plain) with the key under it; Find it is playable (a country or a place by the CPU pick, an area from its rings).
     NO ENGINE   when the bundle (atlas/atlas-embed.js, atlas/atlas-windows.js) is refused — offline, blocked — a window is a sentence (data-map-engine="none", .mc-plain-note) with the card intact around it,
                 and Find it says "Find it could not be set up" with a Reload button.
   WHAT IT PROVES, section by section (no WebGL2 is Chromium's own launch flags, --disable-webgl --disable-3d-apis, so `getContext("webgl2")` really answers null — not a page script pretending):
     a  A MAP CARD (Texas, geo-002) with no WebGL2: "v2-2d", ready, not failed; the canvas carries sea AND land AND the selection gold TINT over the state (read pixels, compared with the tint's expected blend);
        the + button raises view().zoom and it STOPS at 8 (more presses change nothing), − lowers it; a drag changes view(); no console error.
     b  A LOCATOR (rm-003, the Tiber): "v2-2d", the Tiber's own river is traced in the selection gold, no sentence in its place.
     c  A WAR CARD (rm-209): "none" with the sentence about WebGL2, class mc-plain, no canvas and no zoom buttons; the key under it (cardWarKeyHTML: Rome victors, Carthage defeated) is still on the card.
     d  FIND IT: the board renders (land pixels on the board canvas), the day is five rounds, a tap makes "Guess" appear, a wrong country scores "N km away — one more try!", the right one "Found it!" and the
        score moves to "1 found"; an area round is scored from its rings: a point inside them is found.
     e  THE ENGINE REFUSED (a WebGL2 browser whose bundle requests are aborted): a map card is "none" with .mc-plain-note and the card is otherwise intact (the question is there, Reveal still shows the
        answer); a locator is the same on the back; Find it shows "Find it could not be set up" and a Reload button that really reloads.
     f  THE CONTROL: the same map card WITH WebGL2 is "v2", the zoom goes past 8, and its tint covers about the same area as the still renderer's.
     g  No console or page errors anywhere. */
"use strict";
const path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");
const WE = require("./test-window-env.js");
const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
let pass = 0, fail = 0, base = "";
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  " + extra : "")); } };
const sect = (t) => console.log("\n\x1b[1m" + t + "\x1b[0m\n");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [];
const TOURS = `try { localStorage.setItem("folio_tour_v1","1"); localStorage.setItem("folio_atlas_tour_v1","1"); localStorage.setItem("folio_library_tour_v1","1"); localStorage.setItem("folio_mine_tour_v1","1"); } catch (e) {}`;
const url = (hash) => base + (hash || "");

async function newPage(browser, o) {
  o = o || {};
  const ctx = await browser.newContext({ viewport: o.viewport || { width: 1100, height: 900 }, deviceScaleFactor: 1 });
  await ctx.addInitScript(TOURS);
  if (o.session) await ctx.addInitScript((s) => { try { if (!sessionStorage.getItem("folio_study_v1")) sessionStorage.setItem("folio_study_v1", JSON.stringify(s)); } catch (e) {} }, o.session);
  if (o.refuse) await ctx.route(/\/atlas\/atlas-(embed|windows)\.js/, (r) => r.abort());
  const page = await ctx.newPage();
  if (o.date) await page.clock.setFixedTime(new Date(o.date));
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  return { ctx, page };
}
const sessionFor = (id, rev) => ({ scope: { type: "card", id }, queue: [id], id, qi: 0, rev: !!rev, studied: 0 });
const hostState = (page, sel) => page.evaluate((s) => { const h = document.querySelector(s || ".map-card"); if (!h) return null; const n = h.querySelector(".mc-plain-note"), cv = h.querySelector(".mc-canvas"); return { eng: h.getAttribute("data-map-engine"), failed: h.classList.contains("mc-failed"), plain: h.classList.contains("mc-plain"), loading: h.classList.contains("mc-loading"), note: n ? n.textContent : "", canvasHidden: !cv || cv.hidden || getComputedStyle(cv).display === "none", zoomShown: [...h.querySelectorAll(".mc-zoom")].some((z) => !z.hidden && getComputedStyle(z).display !== "none"), ready: !!(h._folioMap && h._folioMap.ready()) }; }, sel);
/* open a card by its address (the suites do goto then reload) and wait until its window has decided what it is: an engine value, or the sentence */
async function openCard(page, id, want, sel) {
  sel = sel || ".map-card";
  await page.goto(url("#card/" + id), { waitUntil: "load" });
  await page.reload({ waitUntil: "load" });
  await page.waitForSelector(sel, { timeout: 60000 });
  await page.waitForFunction(([s, w]) => { const h = document.querySelector(s); return h && h.getAttribute("data-map-engine") === w && h._folioMap && h._folioMap.ready() && !h.classList.contains("mc-loading"); }, [sel, want], { timeout: 150000 }).catch(() => {});
  await page.waitForFunction((s) => { const h = document.querySelector(s); return h && h._folioMap && h._folioMap.settled && h._folioMap.settled(); }, sel, { timeout: 60000 }).catch(() => {});
  await sleep(1200);
}
const view = (page, sel) => page.evaluate((s) => document.querySelector(s || ".map-card")._folioMap.view(), sel);
/* the pixels of a window's canvas, classified: sea (blue-dominant), the engine's land colour, the selection gold tint (a warm pale: red well above blue, green high — land is cool-grey and sea blue, neither is) and the gold line */
const classify = (page, sel) => page.evaluate((s) => {
  const cv = document.querySelector(s || ".map-card .mc-canvas"), d = cv.getContext("2d").getImageData(0, 0, cv.width, cv.height).data;
  const hub = window.AtlasEmbed && window.AtlasEmbed.hub && window.AtlasEmbed.hub(), land = hub && hub.landRGB ? hub.landRGB().map((v) => Math.round(v * 255)) : null;
  let sea = 0, landPx = 0, tint = 0, line = 0, opaque = 0;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 8) continue; opaque++;
    const r = d[i], g = d[i + 1], b = d[i + 2];
    if (r > 215 && g > 195 && g < 235 && r - b > 30) tint++;
    else if (r > 235 && g > 150 && g < 215 && b < 120) line++;
    else if (b - r > 25 && b > 120) sea++;
    else if (land && Math.abs(r - land[0]) < 8 && Math.abs(g - land[1]) < 8 && Math.abs(b - land[2]) < 8) landPx++;
  }
  return { sea, land: landPx, tint, line, opaque, w: cv.width, h: cv.height, landRGB: land };
}, sel);
const zoomTrail = async (page, btn, n) => { const z = []; for (let i = 0; i < n; i++) { await page.click(`.map-card [data-mc="${btn}"]`); await sleep(350); z.push((await view(page)).zoom); } return z; };

(async () => {
  const server = await WE.serve(ROOT);
  base = server.base;
  const noGL = await WE.launch(chromium, Object.assign({}, LAUNCH, { args: ["--disable-webgl", "--disable-3d-apis"] }));
  const withGL = await WE.launch(chromium, LAUNCH);

  /* ---------------- a) a map card without WebGL2 ---------------- */
  sect("a) a map card (Texas) with no WebGL2: the still renderer draws it, and it zooms, turns and stops at 8");
  let tint2d = 0;
  {
    const { ctx, page } = await newPage(noGL);
    const gl = await page.evaluate(() => { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); });
    check("the browser really has no WebGL (its own launch flags, not a page script)", gl === false);
    await openCard(page, "geo-002", "v2-2d");
    const h = await hostState(page);
    check("the window is the engine's still renderer: data-map-engine=v2-2d, ready, not failed, no sentence", h.eng === "v2-2d" && h.ready && !h.failed && !h.plain && h.note === "", JSON.stringify(h));
    check("the page knows it is the Canvas 2D hub (AtlasEmbed.isCanvas2D)", await page.evaluate(() => window.AtlasEmbed && window.AtlasEmbed.isCanvas2D()) === true);
    const px = await classify(page);
    tint2d = px.tint;
    check("the canvas carries sea, land and the selection-gold tint over the state (read pixels)", px.sea > 2000 && px.land > 5000 && px.tint > 3000, JSON.stringify({ sea: px.sea, land: px.land, tint: px.tint, landRGB: px.landRGB }));
    /* the tint is TINT_SEL laid over land at its alpha: the pixel at the centre of the window, with the land solved back out, is a land colour (a solid fill would not be) */
    const cen = await page.evaluate(() => { const c = document.querySelector(".map-card .mc-canvas"), d = c.getContext("2d").getImageData(Math.round(c.width * 0.5), Math.round(c.height * 0.62), 1, 1).data; return [d[0], d[1], d[2]]; });
    const m = /const TINT_SEL = \{ rgb: "([\d,]+)", fillA: ([\d.]+)/.exec(require("fs").readFileSync(path.join(ROOT, "app.js"), "utf8"));
    const trgb = m[1].split(",").map(Number), ta = Number(m[2]);
    const under = cen.map((v, i) => (v - ta * trgb[i]) / (1 - ta));
    check("...and that tint is a TRANSLUCENT blend of TINT_SEL over the land (the land solved back out of the centre pixel is the engine's land colour)", px.landRGB && under.every((v, i) => Math.abs(v - px.landRGB[i]) < 8), `centre ${cen} → under ${under.map(Math.round)} vs land ${px.landRGB}`);
    // zoom: the buttons change view().zoom, and it stops at 8
    const v0 = await view(page);
    const ins = await zoomTrail(page, "in", 7);
    check("the + button raises the zoom", ins[0] > v0.zoom * 1.1, `${v0.zoom.toFixed(2)} → ${ins.map((z) => z.toFixed(2)).join(" → ")}`);
    const top = Math.max.apply(null, ins);
    check("...and the zoom STOPS at 8 on the still renderer (the last presses change nothing)", Math.abs(top - 8) < 1e-6 && Math.abs(ins[ins.length - 1] - ins[ins.length - 2]) < 1e-9, ins.map((z) => z.toFixed(2)).join(","));
    const outs = await zoomTrail(page, "out", 1);
    check("the − button lowers it again", outs[0] < 8 - 0.5, outs[0].toFixed(2));
    await page.click('.map-card [data-mc="home"]'); await sleep(500);
    const home = await view(page);
    check("home returns to the opening view", Math.abs(home.zoom - v0.zoom) < 1e-6 && Math.abs(home.lon - v0.lon) < 1e-6 && Math.abs(home.lat - v0.lat) < 1e-6);
    // a drag turns the globe (and does not zoom it)
    const box = await (await page.$(".map-card .mc-canvas")).boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 90, box.y + box.height / 2 + 30, { steps: 8 }); await page.mouse.up(); await sleep(900);
    const dv = await view(page);
    check("a drag turns the globe and does not zoom it", (Math.abs(dv.lon - home.lon) > 0.2 || Math.abs(dv.lat - home.lat) > 0.2) && Math.abs(dv.zoom - home.zoom) < 1e-6, `${home.lon.toFixed(2)},${home.lat.toFixed(2)} → ${dv.lon.toFixed(2)},${dv.lat.toFixed(2)}`);
    const px2 = await classify(page);
    check("...and the canvas is redrawn after it (still sea, land and tint)", px2.sea > 1000 && px2.land > 3000, JSON.stringify({ sea: px2.sea, land: px2.land, tint: px2.tint }));
    await ctx.close();
  }

  /* ---------------- b) a locator without WebGL2 ---------------- */
  sect("b) a locator (the Tiber) with no WebGL2: drawn by the still renderer, the river in the selection gold");
  {
    const { ctx, page } = await newPage(noGL);
    await openCard(page, "rm-003", "v2-2d");
    const h = await hostState(page);
    check("the locator is data-map-engine=v2-2d, ready, with no sentence", h.eng === "v2-2d" && h.ready && !h.plain && h.note === "" && !h.canvasHidden, JSON.stringify(h));
    const px = await classify(page);
    check("it is drawn: sea and land are on the canvas", px.sea > 1500 && px.land > 3000, JSON.stringify({ sea: px.sea, land: px.land }));
    const gold = await page.evaluate(() => { const c = document.querySelector(".map-card .mc-canvas"), d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] > 230 && d[i + 1] > 150 && d[i + 1] < 215 && d[i + 2] < 120 && d[i + 3] > 200) n++; return n; });
    /* the engine's window counts 263 here (test-card-locator.js: >80); the still renderer draws the same line with no glow pass, so fewer pixels (79 measured): the bar is 40, still far above the 0 of a window with no gold in it */
    check("the Tiber's own river is traced in the selection gold (a line: no glow on the still renderer, so fewer pixels than the full engine's)", gold > 40, String(gold));
    const hash0 = await page.evaluate(() => location.hash);
    await page.click(".map-card .mc-canvas", { position: { x: 200, y: 120 } }); await sleep(800);
    check("a tap on the window opens nothing (the address is unchanged)", (await page.evaluate(() => location.hash)) === hash0);
    await ctx.close();
  }

  /* ---------------- c) a war card without WebGL2 ---------------- */
  sect("c) a war card (the Second Punic War) with no WebGL2: a plain sentence, and the key under it");
  {
    const { ctx, page } = await newPage(noGL);
    await openCard(page, "rm-209", "none");
    const h = await hostState(page);
    check("the window is a sentence: data-map-engine=none, class mc-plain, no canvas, no zoom buttons", h.eng === "none" && h.plain && h.canvasHidden && !h.zoomShown, JSON.stringify(h));
    check("...and the sentence is the honest one about WebGL2 and points at the key", h.note === "This browser cannot draw a war’s sides on the map (it needs WebGL2). The key below says who fought whom.", h.note);
    const key = await page.$$eval(".war-key .wk-side", (els) => els.map((e) => e.textContent.replace(/\s+/g, " ").trim()));
    check("the key under the window (cardWarKeyHTML) still names both sides and says which won", key.length === 2 && /Rome/.test(key[0]) && /victors/.test(key[0]) && /Carthage/.test(key[1]) && /defeated/.test(key[1]), key.join(" | "));
    check("...and it sits outside the window block", await page.evaluate(() => !document.querySelector(".card-loc .war-key") && !!document.querySelector(".war-key")));
    await ctx.close();
  }

  /* ---------------- d) Find it without WebGL2 ---------------- */
  sect("d) Find it with no WebGL2: the board draws, a tap picks, a guess is scored, an area is scored from its rings");
  {
    const { ctx, page } = await newPage(noGL, { date: "2026-03-05T12:00:00" });
    await page.goto(url("#findit"), { waitUntil: "load" }); await page.reload({ waitUntil: "load" });
    await page.waitForFunction(() => { const m = document.querySelector("#mapGame"); return m && !m.hidden && document.querySelector("#findit2") && document.querySelector("#mgQ").textContent.length > 3; }, null, { timeout: 180000 });
    const is2d = await page.evaluate(() => window.AtlasEmbed.isCanvas2D());
    const rounds = await page.evaluate(() => { const h = [...document.querySelectorAll("*")].find((e) => e._finditApi); return h._finditApi.rounds().map((r) => ({ kind: r.kind, n: r.n, lon: r.lon, lat: r.lat, rings: r.rings || null })); });
    check("Find it runs on the still renderer and deals the day: five rounds (country, area, country, area, place)", is2d === true && rounds.length === 5 && rounds.map((r) => r.kind).join(",") === "entity,area,entity,area,point", rounds.map((r) => r.n).join(", "));
    const faces = await page.evaluate(() => window.ATLAS_CARD_FACES.layers.world);
    const settleBoard = async () => { await page.waitForFunction(() => { const h = [...document.querySelectorAll("*")].find((e) => e._finditApi); const w = h._finditApi.win(); return w && w.isSettled(); }, null, { timeout: 90000 }).catch(() => {}); await sleep(400); };
    const viewTo = async (lon, lat, zoom) => { await sleep(500); await page.evaluate(([a, b, z]) => { const h = [...document.querySelectorAll("*")].find((e) => e._finditApi); h._finditApi.win().setView(a, b, z); }, [lon, lat, zoom]); await settleBoard(); };
    const tapCentre = async () => { const bx = await (await page.$("#fi2Board")).boundingBox(); await page.mouse.click(bx.x + bx.width / 2, bx.y + bx.height / 2); await sleep(500); };
    const c1 = faces[rounds[0].n];
    await viewTo(c1[1], c1[2], 1.8);
    const bpx = await page.evaluate(() => { const c = document.getElementById("fi2Board"), d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data, hub = window.AtlasEmbed.hub(), land = hub.landRGB().map((v) => Math.round(v * 255)); let sea = 0, lnd = 0; for (let i = 0; i < d.length; i += 4) { const r = d[i], g = d[i + 1], b = d[i + 2]; if (b - r > 25 && b > 120) sea++; else if (Math.abs(r - land[0]) < 8 && Math.abs(g - land[1]) < 8 && Math.abs(b - land[2]) < 8) lnd++; } return { sea, lnd, w: c.width, h: c.height }; });
    check("the board really draws the country the first round asks for: land on the canvas (read pixels)", bpx.lnd > 5000, JSON.stringify(bpx));
    check("a round opens with nothing picked: Guess and Clear collapsed, score 0", (await page.isHidden("#mgConfirm")) && (await page.isHidden("#mgClear")) && (await page.textContent("#mgScore")) === "0 found");
    // a wrong country first (Egypt for whatever is asked), then the right one
    await viewTo(30, 26, 2.2); await tapCentre();
    check("a tap only PICKS: the Guess button appears and the score has not moved", (await page.textContent("#mgConfirm")) === "Guess" && !(await page.isHidden("#mgConfirm")) && (await page.textContent("#mgScore")) === "0 found");
    await page.click("#mgConfirm"); await sleep(500);
    const fb1 = await page.textContent("#mgFeedback");
    check("a wrong country is scored by distance and offers one more try", /\d[\d,]* km away — one more try!/.test(fb1), fb1);
    await viewTo(c1[1], c1[2], 1.8); await tapCentre(); await page.click("#mgConfirm"); await sleep(600);
    check("the right country on the second try counts as FOUND, and the score moves", (await page.textContent("#mgFeedback")) === "Found it!" && (await page.textContent("#mgScore")) === "1 found", (await page.textContent("#mgFeedback")) + " / " + (await page.textContent("#mgScore")));
    await page.click("#mgNext"); await sleep(700);
    // round 2: an area round, scored from its rings: a point inside them, found by the same controls
    const r2 = rounds[1];
    const inside = await page.evaluate((rings) => {
      const inRing = (ring, x, y) => { let c = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const a = ring[i], b = ring[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
      const inside = (x, y) => { let n = 0; for (const r of rings) if (inRing(r, x, y)) n++; return n % 2 === 1; };
      let x0 = 180, x1 = -180, y0 = 90, y1 = -90; rings.forEach((r) => r.forEach((q) => { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); }));
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2; let best = null, bd = Infinity;
      for (let a = 0; a <= 40; a++) for (let b = 0; b <= 40; b++) { const x = x0 + (x1 - x0) * a / 40, y = y0 + (y1 - y0) * b / 40; if (inside(x, y)) { const d = (x - cx) * (x - cx) + (y - cy) * (y - cy); if (d < bd) { bd = d; best = [x, y]; } } }
      return best;
    }, r2.rings);
    check("the area round is drawn from rings (the still renderer has no history): the round carries them, and a point inside is found", !!r2.rings && r2.rings.length > 0 && !!inside, r2.n + " at " + JSON.stringify(inside));
    if (inside) {
      const q = await page.textContent("#mgQ");
      check("...the question names the area and its year", /as it stood in/.test(q) && q.includes(r2.n), q);
      await viewTo(inside[0], inside[1], 3); await tapCentre();
      check("a tap inside the area picks it (Guess appears)", (await page.textContent("#mgConfirm")) === "Guess" && !(await page.isHidden("#mgConfirm")));
      await page.click("#mgConfirm"); await sleep(700);
      const fb2 = await page.textContent("#mgFeedback");
      check("...and it is scored FOUND from the ring, first try; the score is 2", /Found it — first try!/.test(fb2) && (await page.textContent("#mgScore")) === "2 found", fb2 + " / " + (await page.textContent("#mgScore")));
    }
    await ctx.close();
  }

  /* ---------------- e) the engine refused ---------------- */
  sect("e) the engine's bundle refused: a sentence in the window, the card intact; Find it says it could not be set up");
  {
    const { ctx, page } = await newPage(withGL, { refuse: true, session: sessionFor("geo-002", false) });
    await page.goto(url("#study"), { waitUntil: "load" }); await page.reload({ waitUntil: "load" });
    await page.waitForFunction(() => { const h = document.querySelector(".map-card"); return h && h.getAttribute("data-map-engine") === "none"; }, null, { timeout: 90000 }).catch(() => {});
    const h = await hostState(page);
    check("a map card is a sentence: data-map-engine=none, class mc-plain, .mc-plain-note says it could not be drawn, no canvas, no zoom buttons", h.eng === "none" && h.plain && /could not be drawn here/.test(h.note) && h.canvasHidden && !h.zoomShown, JSON.stringify(h));
    check("...and the engine really was refused: no engine code ran (window.AtlasEmbed and window.AtlasWindows are absent)", await page.evaluate(() => !window.AtlasEmbed && !window.AtlasWindows));
    check("the card is otherwise intact: its Reveal button is there", await page.evaluate(() => !!document.querySelector("#reveal-btn")));
    await page.evaluate(() => document.querySelector("#reveal-btn").click()); await sleep(900);
    const back = await page.evaluate(() => ({ answer: (document.querySelector(".answer .val") || {}).textContent || "", facts: document.querySelectorAll(".cf-tile").length, sources: document.querySelectorAll(".src-item").length }));
    check("...and Reveal still shows the answer (Texas), the facts box and the sources", /Texas/.test(back.answer) && back.facts >= 3 && back.sources >= 5, JSON.stringify(back));
    // a locator on the back of a history card: the same sentence, the answer around it intact
    const L = await newPage(withGL, { refuse: true, session: sessionFor("rm-003", true) });
    await L.page.goto(url("#study"), { waitUntil: "load" }); await L.page.reload({ waitUntil: "load" });
    await L.page.waitForFunction(() => { const h = document.querySelector(".card-loc .map-card"); return h && h.getAttribute("data-map-engine") === "none"; }, null, { timeout: 90000 }).catch(() => {});
    const lh = await hostState(L.page, ".card-loc .map-card");
    const lans = await L.page.evaluate(() => (document.querySelector(".answer .val") || {}).textContent || "");
    check("a locator on a revealed card is the same sentence, with the answer showing", !!lh && lh.eng === "none" && /could not be drawn here/.test(lh.note) && /Tiber/i.test(lans), JSON.stringify({ lh, lans: lans.slice(0, 40) }));
    await L.ctx.close();
    // Find it
    const F = await newPage(withGL, { refuse: true });
    await F.page.goto(url("#findit"), { waitUntil: "load" }); await F.page.reload({ waitUntil: "load" });
    await F.page.waitForSelector("#fiReload", { timeout: 90000 }).catch(() => {});
    const fi = await F.page.evaluate(() => { const a = document.querySelector('[role="alert"]'), b = document.querySelector("#fiReload"); return { text: a ? a.textContent : "", btn: b ? b.textContent : null, board: !!document.querySelector("#fi2Board") }; });
    check("Find it shows \"Find it could not be set up\" with a Reload button, and no board", /Find it could not be set up/.test(fi.text) && fi.btn === "Reload" && !fi.board, JSON.stringify(fi));
    await F.page.evaluate(() => { window.__before_reload = 1; });
    const nav = F.page.waitForEvent("load", { timeout: 30000 }).then(() => true, () => false);
    await F.page.click("#fiReload");
    check("...and the button really reloads the page", (await nav) && (await F.page.evaluate(() => window.__before_reload)) === undefined);
    await F.ctx.close();
    await ctx.close();
  }

  /* ---------------- f) the control ---------------- */
  sect("f) the control: the same map card WITH WebGL2 is the engine's full window");
  {
    const { ctx, page } = await newPage(withGL);
    await openCard(page, "geo-002", "v2");
    const h = await hostState(page);
    check("the window is data-map-engine=v2, ready, not failed", h.eng === "v2" && h.ready && !h.failed && !h.plain, JSON.stringify(h));
    const px = await classify(page);
    check("it draws sea, land and the tint (the same pixel reading as the still renderer's)", px.sea > 2000 && px.land > 5000 && px.tint > 3000, JSON.stringify({ sea: px.sea, land: px.land, tint: px.tint }));
    check("...and its tint covers about the same area as the still renderer's (within 35 %)", tint2d > 0 && Math.abs(px.tint - tint2d) / tint2d < 0.35, `${px.tint} vs ${tint2d} on the still renderer`);
    const ins = await zoomTrail(page, "in", 7);
    check("its zoom goes PAST 8 (the 8 ceiling is the still renderer's alone)", Math.max.apply(null, ins) > 8.5, ins.map((z) => z.toFixed(2)).join(","));
    await ctx.close();
  }

  sect("g) errors");
  check("no console or page errors anywhere in this suite", errors.length === 0, errors.slice(0, 4).join(" | "));
  await noGL.close(); await withGL.close(); server.close();
  console.log(`\n${pass} ok, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
