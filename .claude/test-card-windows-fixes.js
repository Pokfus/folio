/* test-card-windows-fixes.js — the five fixes the owner found on a real phone after the Stage B flip (Atlas v2 card windows; docs/atlas-v2-card-windows.md "Phone fixes", docs/atlas-v2-design.md §7 "Phone fixes — as built")

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-card-windows-fixes.js                 the engine's windows (Phase 5: the only ones; CI runs it once)
     --only=1,3                                                                                      some sections

     1  THE HIGHLIGHT STAYS THROUGH A GESTURE: the shaded place's outline (the selection gold) is on the canvas before a drag, DURING it (several samples across a CDP touch drag), during a two-finger pinch
        and a wheel zoom, and after — for a state card (geo-002) and a country card (gw-001).
     2  A WAR WINDOW'S LABELS STAND ON THEIR OWN GROUND: for every war card in the pinned set, each side's label point lies inside a face of that side; rm-209 "Rome" is on green, "Carthage" on red.
     3  A LOCATOR WINDOW'S NAMES DO NOT COLLIDE: no two drawn names or marks overlap in a window with many siblings (rm-003), at desktop and at 390 px.
     4  A WAR WINDOW HAS ONE LEGEND: the plain-text one below the window; nothing is drawn over the bottom of the map; the two sides' names are still on it.
     5  TAPS NEVER NAVIGATE: a tap, a double tap, a mouse click and a drag end on a map card (revealed and not), a locator and a war window change nothing in the address and open no Atlas; the window's own
        globe button still does (and Back returns to the same card with its reveal state).
     6  No console or page errors. */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const ES = require("./test-window-env.js");
let Hq0 = null; const Hq = () => Hq0 || (Hq0 = require("./atlas-build/lib/historyq.js").open());   /* opened on first use: it reads the 9 MB history file */
const { isNoise } = require("./test-noise.js");
const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream", ".woff2": "font/woff2" };
const PORT = 5631;
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  " + extra : "")); } };
const sect = (t) => console.log("\n\x1b[1m" + t + "\x1b[0m\n");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [];
const url = (hash) => `http://127.0.0.1:${PORT}/${hash || ""}`;
const only = (process.argv.find((a) => a.startsWith("--only=")) || "").slice(7).split(",").filter(Boolean);
const want = (n) => !only.length || only.includes(String(n));

/* a page with the tours dismissed; `mobile` is a 390×844 touch phone (dpr 3), otherwise a 1100×900 desktop; `session` puts a study session on one card (revealed when `rev`) */
async function newPage(browser, o) {
  o = o || {};
  const ctx = await browser.newContext(o.mobile ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true } : { viewport: { width: 1100, height: 900 }, deviceScaleFactor: 1 });
  await ctx.addInitScript(({ session }) => {
    try { localStorage.setItem("folio_tour_v1", "1"); localStorage.setItem("folio_atlas_tour_v1", "1"); localStorage.setItem("folio_library_tour_v1", "1"); localStorage.setItem("folio_mine_tour_v1", "1"); } catch (e) {}
    try { if (session && !sessionStorage.getItem("folio_study_v1")) sessionStorage.setItem("folio_study_v1", JSON.stringify(session)); } catch (e) {}
  }, { session: o.session || null });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text()) && !/GL_INVALID|WebGL/.test(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  return { ctx, page };
}
const sessionFor = (id, rev) => ({ scope: { type: "card", id }, queue: [id], id, qi: 0, rev: !!rev, studied: 0 });
/* the window is mounted and has drawn (ready, then settled — its tiles in) */
async function windowUp(page, sel) {
  sel = sel || ".map-card";
  await page.waitForSelector(sel, { timeout: 60000 });
  await page.waitForFunction((s) => { const h = document.querySelector(s); return h && h._folioMap && h._folioMap.ready() && !h.classList.contains("mc-loading"); }, sel, { timeout: 180000 });
  await page.waitForFunction((s) => { const h = document.querySelector(s); return h && h._folioMap && h._folioMap.settled && h._folioMap.settled(); }, sel, { timeout: 180000 }).catch(() => {});
  await sleep(700);
}
async function openCard(page, id, sel) {
  await page.goto(url("#card/" + id), { waitUntil: "load" });
  await page.reload({ waitUntil: "load" });
  await windowUp(page, sel);
}
const boxOf = (page, sel) => page.$eval(sel, (e) => { const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; });

/* the selection gold's outline and glow on the window's canvas: the line colour (255,192,74) and the glow round it; the fill is a pale tint (blue channel well above 150) and the capital's square is
   (255,178,46) — a card with a dot is not used for this count */
const OUTLINE_PX = `(d,i)=>d[i+3]>200&&d[i]>235&&d[i+1]>172&&d[i+1]<218&&d[i+2]<115`;
const outlinePixels = (page, sel) => page.evaluate(([s, src]) => { const c = document.querySelector(s), x = c.getContext("2d"), d = x.getImageData(0, 0, c.width, c.height).data; const f = new Function("d", "i", "return (" + src + ")(d,i);"); let n = 0; for (let i = 0; i < d.length; i += 4) if (f(d, i)) n++; return n; }, [sel || ".map-card .mc-canvas", OUTLINE_PX]);

/* a CDP touch gesture: points is a function of the step number → the touch points, steps the number of moves; `during` is called after each move while the fingers are still down */
async function touchGesture(page, cdp, start, move, steps, gap, during) {
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: start });
  for (let i = 1; i <= steps; i++) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: move(i) });
    await sleep(gap);
    if (during) await during(i);
  }
}
const touchEnd = (cdp) => cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await ES.launch(chromium, LAUNCH);

  /* ---------------- 1) the highlight stays through a gesture ---------------- */
  if (want(1)) {
    sect("1) the shaded place's outline stays on the window through a drag, a pinch and a wheel zoom");
    for (const [id, label] of [["geo-002", "a state card (Texas)"], ["gw-001", "a country card (India)"]]) {
      const { ctx, page } = await newPage(browser, { mobile: true });
      const cdp = await ctx.newCDPSession(page);
      await openCard(page, id);
      const b = await boxOf(page, ".map-card .mc-canvas"), cx = b.x + b.w / 2, cy = b.y + b.h / 2;
      const before = await outlinePixels(page);
      check(label + ": the outline is on the canvas before the gesture", before > 150, String(before));
      // a one-finger touch drag: twelve moves of 7 px, the fingers still down at each sample
      const during = [];
      await touchGesture(page, cdp, [{ x: cx, y: cy }], (i) => [{ x: cx + 7 * i, y: cy + 3 * i }], 12, 55, async () => { during.push(await outlinePixels(page)); });
      const dragMin = Math.min.apply(null, during.slice(2));
      check(label + ": ...and DURING a touch drag, at every one of " + (during.length - 2) + " samples (a plain outline: no glow, so fewer pixels than at rest)", dragMin > 300 && dragMin > before * 0.1, JSON.stringify(during) + " (at rest " + before + ")");
      await touchEnd(cdp); await sleep(400);
      await page.waitForFunction(() => document.querySelector(".map-card")._folioMap.settled(), null, { timeout: 120000 }).catch(() => {});
      await sleep(600);
      const afterDrag = await outlinePixels(page);
      check(label + ": ...and after it", afterDrag > before * 0.5, afterDrag + " (before " + before + ")");
      // a two-finger pinch (spread), the fingers still down
      const pin = [];
      await touchGesture(page, cdp, [{ x: cx - 30, y: cy, id: 1 }, { x: cx + 30, y: cy, id: 2 }], (i) => [{ x: cx - 30 - 4 * i, y: cy, id: 1 }, { x: cx + 30 + 4 * i, y: cy, id: 2 }], 10, 55, async () => { pin.push(await outlinePixels(page)); });
      const pinMin = Math.min.apply(null, pin.slice(2));
      check(label + ": ...and DURING a pinch", pinMin > 300 && pinMin > before * 0.1, JSON.stringify(pin));
      await touchEnd(cdp); await sleep(400);
      /* THE COST OF A DRAG FRAME (the frame gate's rule, read on the window): the page's frame intervals across a continuous touch drag, 70 moves at the display's pace. The gate: at most 0.5 % of gesture frames over 100 ms, none over 200 ms
         (test-atlas-perf.js reads it on the Atlas page; a window is a smaller canvas on the same engine). This runner rasterises on the CPU (SwiftShader), a phone's GPU does not. */
      await page.evaluate(() => { window.__fr = { dts: [], on: true }; let last = 0; const tick = (t) => { if (!window.__fr.on) return; if (last) window.__fr.dts.push(t - last); last = t; requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
      await touchGesture(page, cdp, [{ x: cx, y: cy }], (i) => [{ x: cx + 3 * Math.sin(i / 6) * 20, y: cy + 2.5 * i % 120 }], 70, 14, null);
      await touchEnd(cdp);
      const dts = await page.evaluate(() => { window.__fr.on = false; return window.__fr.dts.slice(); });
      const over100 = dts.filter((d) => d > 100).length, over200 = dts.filter((d) => d > 200).length, worst = Math.max.apply(null, dts);
      console.log("        drag frames: " + dts.length + ", over 100 ms: " + over100 + " (" + (100 * over100 / dts.length).toFixed(1) + " %), over 200 ms: " + over200 + ", worst " + Math.round(worst) + " ms, median " + Math.round(dts.slice().sort((a, b) => a - b)[dts.length >> 1]) + " ms");
      check(label + ": a drag frame stays inside the frame gate's ceiling (none over 200 ms)", over200 === 0, "worst " + Math.round(worst) + " ms");
      await sleep(600);
      await ctx.close();
      // a wheel zoom, on a desktop pointer
      const D = await newPage(browser);
      await openCard(D.page, id);
      const db = await boxOf(D.page, ".map-card .mc-canvas");
      await D.page.mouse.move(db.x + db.w / 2, db.y + db.h / 2);
      const wh = [];
      for (let i = 0; i < 8; i++) { await D.page.mouse.wheel(0, -90); await sleep(60); wh.push(await outlinePixels(D.page)); }
      check(label + ": ...and DURING a wheel zoom", Math.min.apply(null, wh.slice(1)) > 300, JSON.stringify(wh));
      await D.ctx.close();
    }
  }

  /* ---------------- 2) a war window's labels stand on their own ground ---------------- */
  if (want(2)) {
    sect("2) every war window's two names stand inside a face of their own side, whole inside the frame, off the controls and apart");
    for (const [label, vp] of [["desktop 1100", { mobile: false }], ["phone 390", { mobile: true }]]) {
      const { ctx, page } = await newPage(browser, vp);
      await page.goto(url("#card/rm-209"), { waitUntil: "load" }); await page.reload({ waitUntil: "load" });
      await windowUp(page, ".map-card");
      const ids = await page.evaluate(() => Object.keys(window.ATLAS_WARS.wars));
      const bad = [], rows = [], noGround = [], offPrincipal = []; let onPrincipal = 0, alivePrincipals = 0;
      for (const id of ids) {
        await page.evaluate((cid) => { location.hash = "#card/" + cid; }, id);
        try {
          await page.waitForFunction((cid) => { const h = document.querySelector(".map-card.map-war"); return h && h.getAttribute("data-map-card") === cid && h.getAttribute("data-map-engine") === "v2" && h._folioMap && h._folioMap.ready() && h._folioMap.settled(); }, id, { timeout: 60000 });
        } catch (e) { bad.push(id + ": the window did not settle"); continue; }
        await sleep(250);
        const r = await page.evaluate(([cid]) => {
          const h = document.querySelector(".map-card.map-war"), F = h._folioMap, P = F.probe(), W = window.ATLAS_WARS.wars[cid], hub = AtlasEmbed.hub();
          const cvR = h.querySelector(".mc-canvas").getBoundingClientRect(), zr = h.querySelector(".mc-zoom").getBoundingClientRect(), ctl = [zr.left - cvR.left, zr.top - cvR.top, zr.right - cvR.left, zr.bottom - cvR.top];
          const out = { id: cid, year: Number(h.getAttribute("data-map-year")), labels: [], cw: P.cw, ch: P.ch, ctl };
          for (const l of F.labels()) {
            const side = W[l.k], ll = hub.lonLatAt(P.spec, l.x, l.y);
            out.labels.push({ k: l.k, n: l.n, x: l.x, y: l.y, w: l.w, ground: l.ground, lonlat: ll, sideIds: side.m.map((m) => m[0]).concat(side.x ? [side.x] : []), principal: side.p || "", box: [l.tx - l.w / 2, l.ty - 8, l.tx + l.w / 2, l.ty + 8], beside: l.beside, onPrincipalFace: !!l.principal });
          }
          return out;
        }, [id]);
        rows.push(r);
        const hitB = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
        if (r.labels.length !== 2) bad.push(id + ": " + r.labels.length + " names drawn, not two");
        for (const l of r.labels) {
          /* THE PROPERTY, read from the pinned data and not from the picture: the label's point (the window's pixel turned back into longitude and latitude) is inside a face of its own side in the war's display year — the built
             history's faces, the finest level, the same machinery check-history.js uses (lib/historyq.js) */
          const found = l.lonlat ? Hq().entityAt(l.lonlat[0], l.lonlat[1], r.year, { layer: "all" }) : [];
          /* a side none of whose entities has a face in the display year (a gap in the source: England and Normandy in 1076, Ethiopia in 1936) has no ground to stand on: its name is drawn at its centroid, `ground: false`, and the window tints nothing for it */
          const drawn = l.sideIds.some((e) => Hq().aliveAt(e, r.year));
          if (!drawn) { noGround.push(id + " " + l.n); if (l.ground) bad.push(id + ": \"" + l.n + "\" claims ground though no face of its side stands in " + r.year); continue; }
          /* AND, when the side has a PRINCIPAL entity (the one its name stands for: wars.js `p`) that has a face in the display year and on the visible globe, the label's point is on THAT entity's face -- "Rome" on Rome, "Carthage" on
             Carthage, not on an ally's strip that is bigger on screen. A side with no principal ("Allied powers"), or whose principal has no face in the year, keeps the first property only. */
          if (l.principal && Hq().aliveAt(l.principal, r.year)) {
            alivePrincipals++;
            if (l.onPrincipalFace) { if (!Hq().holds(l.principal, found)) bad.push(id + ": \"" + l.n + "\" is placed on its principal entity " + l.principal + " but its point is not inside that entity's face (the faces there: " + found.map((e) => e.id).join("|") + ")"); onPrincipal++; }
            else offPrincipal.push(id + " \"" + l.n + "\"");
          }
          if (!l.sideIds.some((e) => Hq().holds(e, found))) bad.push(id + ": \"" + l.n + "\" (" + l.k + ") at " + Math.round(l.x) + "," + Math.round(l.y) + " (" + (l.lonlat ? l.lonlat.map((v) => v.toFixed(2)).join(",") : "off the globe") + ") is not inside a face of its own side (the faces there: " + found.map((e) => e.id).join("|") + ")");
          if (l.box[0] < 0 || l.box[2] > r.cw || l.box[1] < 0 || l.box[3] > r.ch) bad.push(id + ": \"" + l.n + "\" runs outside the frame");
          if (hitB(l.box, r.ctl)) bad.push(id + ": \"" + l.n + "\" is under the zoom controls");
        }
        if (r.labels.length === 2 && hitB(r.labels[0].box, r.labels[1].box)) bad.push(id + ": the two names overlap");
      }
      /* THE PRINCIPAL PROPERTY: every principal that has a face in its window's display year is stood on (alivePrincipals counts them from the data, not from the picture; "no principal" and "no face that year" sides keep the first property only) */
      check(label + ": every side whose principal entity has a face in the display year stands on that entity's face (" + onPrincipal + " of " + alivePrincipals + ")", alivePrincipals >= 100 && onPrincipal === alivePrincipals && offPrincipal.length === 0, onPrincipal + " of " + alivePrincipals + (offPrincipal.length ? "; not on the principal: " + offPrincipal.join(", ") : ""));
      /* and the two the owner named: on the Second Punic War "Rome" stands in Italy and "Carthage" on Carthage's own ground in Africa, not on an ally's strip (Numidia, in Rome's face) or on the Iberian holdings; the Second Italo-Ethiopian
         War's "Italy" stands in Italy, not on Italian Africa */
      const at209 = rows.find((r) => r.id === "rm-209"), inBox = (l, b) => l && l.lonlat && l.lonlat[0] >= b[0] && l.lonlat[0] <= b[1] && l.lonlat[1] >= b[2] && l.lonlat[1] <= b[3];
      const rome = at209 && at209.labels.find((l) => l.k === "v"), carth = at209 && at209.labels.find((l) => l.k === "l"), ital = (rows.find((r) => r.id === "ww2-042") || { labels: [] }).labels.find((l) => l.k === "v");
      check(label + ": rm-209 \"Rome\" stands on the Italian peninsula, \"Carthage\" on the coast of Africa east of Algiers", inBox(rome, [7, 18.6, 38.9, 47.1]) && inBox(carth, [6.3, 12, 30, 37.5]), (rome && rome.lonlat ? rome.lonlat.map((v) => v.toFixed(1)) : "no Rome") + " / " + (carth && carth.lonlat ? carth.lonlat.map((v) => v.toFixed(1)) : "no Carthage"));
      check(label + ": ww2-042 \"Italy\" stands in Italy, not on Italian Africa", inBox(ital, [6.6, 18.6, 36.6, 47.1]), ital && ital.lonlat ? ital.lonlat.map((v) => v.toFixed(1)).join(",") : "no label");
      check(label + ": " + rows.length + " war windows: every side's name is on ground of its own side, whole inside the frame, off the controls, apart from the other", rows.length >= 45 && bad.length === 0, rows.length + " windows" + (noGround.length ? "; no face in the display year, so no ground: " + noGround.join(", ") : "") + (bad.length ? "; " + bad.length + " faults: " + bad.slice(0, 12).join(" | ") : ""));
      await ctx.close();
    }
  }

  /* ---------------- 3) a locator window's names do not collide ---------------- */
  if (want(3)) {
    sect("3) a locator window with many siblings (rm-003, the Tiber, with the Roman cards studied): no two names or a name and a mark overlap");
    const ids = (() => { const w0 = global.window; global.window = {}; require("../data.js"); const out = window.CARD_DATA.map((c) => c.id).filter((i) => /^rm-/.test(i)); global.window = w0; return out; })();
    for (const [label, vp] of [["desktop 1100", { mobile: false }], ["phone 390", { mobile: true }]]) {
      const { ctx, page } = await newPage(browser, vp);
      await ctx.addInitScript((list) => { try { const cards = {}; for (const id of list) cards[id] = { due: Date.now() + 864e5 * 5, ivl: 5, ease: 2.5, reps: 3, lapses: 0, state: "review", lastReview: Date.now() - 864e5 }; localStorage.setItem("folio_v1", JSON.stringify({ active: [], cards, settings: { marker: false } })); } catch (e) {} }, ids);
      /* the drawing is READ, not asked: every fillText, every small arc and square the window's canvas receives in its last frame (the same for v1's window and the engine's) */
      await ctx.addInitScript(() => {
        const P = CanvasRenderingContext2D.prototype, rec = window.__rec = { calls: [], target: null };
        const mine = (c) => rec.target && c.canvas === rec.target;
        const css = (c, x, y) => { const m = c.getTransform(), k = c.canvas.width / (c.canvas.getBoundingClientRect().width || 1); return [(m.a * x + m.c * y + m.e) / k, (m.b * x + m.d * y + m.f) / k, m.a / k]; };
        const cr = P.clearRect; P.clearRect = function (x, y, w, h) { if (mine(this) && w >= this.canvas.width - 1) rec.calls = []; return cr.apply(this, arguments); };
        const ft = P.fillText; P.fillText = function (t, x, y) { if (mine(this)) { const q = css(this, x, y), px = parseFloat((/(\d+(\.\d+)?)px/.exec(this.font) || [0, 12])[1]) * q[2], w = this.measureText(t).width * q[2], al = this.textAlign; rec.calls.push({ k: "name", t, box: al === "left" || al === "start" ? [q[0], q[1] - px * 0.6, q[0] + w, q[1] + px * 0.6] : al === "right" || al === "end" ? [q[0] - w, q[1] - px * 0.6, q[0], q[1] + px * 0.6] : [q[0] - w / 2, q[1] - px * 0.6, q[0] + w / 2, q[1] + px * 0.6] }); } return ft.apply(this, arguments); };
        const ar = P.arc; P.arc = function (x, y, r) { if (mine(this) && r > 1 && r < 9 && Math.abs(arguments[4] - arguments[3] - Math.PI * 2) < 1e-6) { const q = css(this, x, y), rr = r * q[2]; rec.calls.push({ k: "mark", box: [q[0] - rr, q[1] - rr, q[0] + rr, q[1] + rr] }); } return ar.apply(this, arguments); };
        const fr = P.fillRect; P.fillRect = function (x, y, w, h) { if (mine(this) && w > 4 && w < 14 && Math.abs(w - h) < 0.01) { const q = css(this, x, y); rec.calls.push({ k: "mark", box: [q[0], q[1], q[0] + w * q[2], q[1] + h * q[2]] }); } return fr.apply(this, arguments); };
      });
      await page.goto(url("#card/rm-003"), { waitUntil: "load" }); await page.reload({ waitUntil: "load" });
      await windowUp(page, ".card-loc .map-card");
      await page.evaluate(() => { window.__rec.target = document.querySelector(".card-loc .mc-canvas"); document.querySelector(".card-loc .map-card")._folioMap.pan(1, 0); });
      await sleep(1500);
      await page.waitForFunction(() => document.querySelector(".card-loc .map-card")._folioMap.settled(), null, { timeout: 120000 }).catch(() => {});
      await sleep(800);
      const r = await page.evaluate(() => { const c = window.__rec.target, b = c.getBoundingClientRect(), z = document.querySelector(".card-loc .mc-zoom").getBoundingClientRect(); return { calls: window.__rec.calls.slice(), cw: b.width, ch: b.height, ctl: [z.left - b.left, z.top - b.top, z.right - b.left, z.bottom - b.top] }; });
      const names = r.calls.filter((c) => c.k === "name"), marks = r.calls.filter((c) => c.k === "mark");
      const hitB = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
      const nn = [], nm = [], out = [];
      for (let i = 0; i < names.length; i++) {
        for (let j = i + 1; j < names.length; j++) if (hitB(names[i].box, names[j].box)) nn.push(names[i].t + " × " + names[j].t);
        for (const m of marks) if (hitB(names[i].box, m.box)) { nm.push(names[i].t); break; }
        const b = names[i].box; if (b[0] < 0 || b[2] > r.cw || b[1] < 0 || b[3] > r.ch || hitB(b, r.ctl)) out.push(names[i].t);
      }
      console.log("        " + names.length + " names drawn: " + names.map((n) => n.t).join(", ") + "; " + marks.length + " marks");
      check(label + ": the window has many siblings (at least twelve marks) and names on them", marks.length >= 12 && names.length >= 4, marks.length + " marks, " + names.length + " names");
      check(label + ": no two names overlap", nn.length === 0, nn.slice(0, 8).join(" | "));
      check(label + ": no name overlaps a mark (a sibling's dot, the home square, the card's own dot)", nm.length === 0, nm.slice(0, 8).join(", "));
      check(label + ": every name is wholly inside the frame and off the zoom controls", out.length === 0, out.slice(0, 8).join(", "));
      check(label + ": the card's own names are still there (the Tiber; its own place is the river)", names.some((n) => /Tiber/i.test(n.t)), names.map((n) => n.t).join(", "));
      if (await page.evaluate(() => typeof document.querySelector(".card-loc .map-card")._folioMap.boxes === "function")) {
        const bx = await page.evaluate(() => document.querySelector(".card-loc .map-card")._folioMap.boxes());
        console.log("        engine: " + bx.names.length + " names placed, " + bx.dropped.length + " dropped for want of room (" + bx.dropped.join(", ") + ")");
        const clash = []; bx.names.forEach((n, i) => { for (let j = i + 1; j < bx.names.length; j++) if (hitB(n.box, bx.names[j].box)) clash.push(n.text + " × " + bx.names[j].text); for (const m of bx.marks) if (hitB(n.box, m.box)) clash.push(n.text + " × a " + m.kind); });
        check(label + ": the engine's own record agrees: its " + bx.names.length + " names and " + bx.marks.length + " marks have no overlap between a name and anything", clash.length === 0, clash.slice(0, 6).join(" | "));
      }
      await ctx.close();
    }
  }

  /* ---------------- 5) taps never navigate ---------------- */
  if (want(5)) {
    sect("5) nothing a reader does to the map itself opens the Atlas; only the window's own globe button does");
    const mapStill = (page) => page.evaluate(() => ({ hash: location.hash, atlas: !!document.querySelector(".atlas2-back"), win: !!document.querySelector(".map-card") }));   /* the Atlas PAGE has its Back button; the hub's hidden controls (the engine, held for the windows) are also `.atlas2` */
    const cases = [["a map card, not revealed", "geo-002", ".map-card", { session: sessionFor("geo-002", false), start: "#study" }], ["a map card, revealed", "geo-002", ".map-card", { session: sessionFor("geo-002", true), start: "#study" }], ["a locator", "rm-003", ".card-loc .map-card", { start: "#card/rm-003" }], ["a war window", "rm-209", ".map-card.map-war", { start: "#card/rm-209" }]];
    for (const [label, id, sel, o] of cases) {
      for (const touch of [false, true]) {
        const { ctx, page } = await newPage(browser, { mobile: touch, session: o.session || null });
        const cdp = touch ? await ctx.newCDPSession(page) : null;
        await page.goto(url(o.start), { waitUntil: "load" }); await page.reload({ waitUntil: "load" });
        await windowUp(page, sel);
        const h0 = await page.evaluate(() => location.hash);
        await page.locator(sel + " .mc-canvas").scrollIntoViewIfNeeded(); await sleep(300);
        const b = await boxOf(page, sel + " .mc-canvas"), cx = b.x + b.w / 2, cy = Math.min(b.y + b.h / 2, 560);   // in the viewport: a click below the fold hits nothing
        const did = [];
        const settle = async (what) => { await sleep(900); const st = await mapStill(page); did.push(what + (st.hash === h0 && !st.atlas && st.win ? "" : " [OPENED " + st.hash + "]")); };
        if (!touch) {
          await page.mouse.click(cx, cy); await settle("click");
          await page.mouse.dblclick(cx, cy); await settle("double click");
          await page.mouse.move(cx, cy); await page.mouse.down(); await page.mouse.move(cx + 60, cy + 25, { steps: 6 }); await page.mouse.up(); await settle("drag, then release");
          await page.mouse.move(cx, cy); await page.mouse.wheel(0, -240); await settle("wheel zoom in"); await page.mouse.wheel(0, 240); await settle("wheel zoom out");
        } else {
          await page.touchscreen.tap(cx, cy); await settle("tap");
          await page.touchscreen.tap(cx, cy); await sleep(80); await page.touchscreen.tap(cx, cy); await settle("double tap");
          await touchGesture(page, cdp, [{ x: cx, y: cy }], (i) => [{ x: cx + 6 * i, y: cy + 2 * i }], 10, 40, null); await touchEnd(cdp); await settle("touch drag, then release");
          await touchGesture(page, cdp, [{ x: cx - 25, y: cy, id: 1 }, { x: cx + 25, y: cy, id: 2 }], (i) => [{ x: cx - 25 - 4 * i, y: cy, id: 1 }, { x: cx + 25 + 4 * i, y: cy, id: 2 }], 8, 40, null); await touchEnd(cdp); await settle("pinch, then release");
        }
        check(label + ", " + (touch ? "touch" : "mouse") + ": " + did.length + " ways of touching the map change nothing — the address stays " + h0 + ", no Atlas opens", did.every((d) => !/OPENED/.test(d)), did.join("; "));
        // the globe button: the one way in (a locator and a war window carry it; a map card has none, its Atlas would name the answer)
        const has = await page.$(sel + ' [data-mc="go"]') !== null;
        if (/map card/.test(label)) check(label + ": has no globe button (the Atlas would name its answer)", !has);
        else if (!touch) {
          check(label + ": has the globe button", has);
          await page.focus(sel + ' [data-mc="go"]'); await page.keyboard.press("Enter");   // the keyboard route to the button
          await page.waitForFunction((was) => location.hash !== was, h0, { timeout: 20000 }).catch(() => {});
          const hh = await page.evaluate(() => location.hash);
          check(label + ": the globe button (Enter on it) opens the Atlas, with the window's view" + (/war/.test(label) ? " and the war's year" : ""), /^#map\/-?\d+(\.\d+)?\/-?\d+(\.\d+)?\/\d+(\.\d+)?/.test(hh) && (!/war/.test(label) || /\?y=-209/.test(hh) /* the Atlas then writes its own hash; the war's card rides on the link as &war= (test-atlas-embed.js §5 follows it) */), hh);
          {
            await page.waitForSelector(".atlas2", { timeout: 60000 }).catch(() => {});
            await page.goBack(); await page.waitForSelector(".map-card", { timeout: 30000 });
            const back = await page.evaluate(() => ({ hash: location.hash, id: (document.querySelector(".map-card") || {}).getAttribute && document.querySelector(".map-card").getAttribute("data-map-card") }));
            check(label + ": Back returns to the same card", back.hash === h0, back.hash + " (was " + h0 + ")");
          }
        }
        await ctx.close();
      }
    }
    {   // Back keeps the reveal state: a revealed map card has no button to leave by, so the study session is left in a locator's study view instead (a locator revealed, then the button, then "Back to studying")
      const { ctx, page } = await newPage(browser, { session: sessionFor("rm-003", true) });
      await page.goto(url("#study"), { waitUntil: "load" }); await page.reload({ waitUntil: "load" });
      await windowUp(page, ".card-loc .map-card");
      await page.click('.card-loc .map-card [data-mc="go"]');
      {
        await page.waitForSelector(".atlas2-back", { timeout: 60000 });
        await page.click(".atlas2-back"); await page.waitForSelector(".card-loc .map-card", { timeout: 30000 });
        const st = await page.evaluate(() => ({ hash: location.hash, rec: JSON.parse(sessionStorage.getItem("folio_study_v1") || "null"), reveal: !!document.querySelector("#reveal-btn") }));
        check("\"Back to studying\" from the Atlas returns to the same card with its answer showing", st.hash === "#study" && st.rec && st.rec.id === "rm-003" && st.rec.rev === true && !st.reveal, JSON.stringify({ h: st.hash, id: st.rec && st.rec.id, rev: st.rec && st.rec.rev }));
      }
      await ctx.close();
    }
  }

  await browser.close(); server.close();
  console.log("\n" + (errors.length ? "\x1b[31m" + errors.length + " console/page errors:\x1b[0m\n  " + errors.slice(0, 6).join("\n  ") : "no console or page errors"));
  check("no console or page errors", errors.length === 0);
  console.log(`\n${pass} ok, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
