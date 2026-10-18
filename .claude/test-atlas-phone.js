/* test-atlas-phone.js — Atlas v2 on phones and a tablet (Phase 1d; docs/atlas-v2-design.md §2.9 "Phone").

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-phone.js [shotsDir]
     FOLIO_CHROMIUM=/path/to/chrome  … to pick the browser (otherwise playwright's own)

   Five viewports (360×640, 390×844, 430×932, 768×1024, landscape 844×390), three themes (folio, folio night, synth); a
   screenshot of each for the eye (written to shotsDir, default $SCRATCH/atlas-phone), and these assertions:
     · no two visible controls overlap — search, zoom stack, Legend chip, About chip, caption, stack chip, the card sheet
       shut and expanded, the legend sheet — and none sits under the site's bottom tab bar;
     · every button, the search box and every result row is at least 44 px tall on a coarse pointer (the tablet, a fine
       pointer by Playwright's isMobile rules at 768 px, takes the desktop layout and is held to 34);
     · a two-finger pinch zooms about the fingers' midpoint: the place under the midpoint stays under it;
     · a double tap zooms in about the tap;
     · the soft keyboard: with the search focused, a viewport that loses 300 px of height (the keyboard's share) leaves the
       map's centre where it was and the search box and its result list inside the visible part;
     · the phone rules carry the safe-area insets (a static check of the stylesheet: env(safe-area-inset-*) on the
       chips, the sheets and the notes);
     · THE PHONE, DECLUTTERED (Oct 2026, the owner's phone): at 640 px and under the Atlas is full-bleed (no padding, no gap above the tab bar, no scroll while
       the map is dragged); the controls are one search button, one menu button (its sheet holds the Map / Personal / Full switch, the count line, the layers
       and the legend, the help), one zoom pill, and a one-row time control with "more"; they cover at most half the area the old layout did (OVERLAY_BEFORE_390,
       measured on the previous layout); they fade to ~35 % while the map is dragged and come back 1.5 s after; at the largest Text size nothing leaves the frame;
     · THE 28 PX RULE (§ "label drift" at the end): across six drags and two pinches on a 390×844 phone, in EVERY frame, no drawn label is farther from its anchor
       than its own half-height plus 28 px, and every label is drawn exactly where its layout put it moved by its anchor's own motion (the sprite-cache bug of
       PR #476 painted a name at the corner of the layout that first drew it: that is the "stale" count, which must be 0).
     FOLIO_PHONE_ONLY=drift runs only that last section.
*/
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium, devices } = require("playwright");
const { isNoise } = require("./test-noise.js");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream" };
const PORT = 5623;
const OUT = process.argv[2] || path.join(process.env.SCRATCH || "/tmp", "atlas-phone");
const ALL_VIEWPORTS = [{ name: "360x640", width: 360, height: 640 }, { name: "390x844", width: 390, height: 844 }, { name: "430x932", width: 430, height: 932 }, { name: "768x1024", width: 768, height: 1024, tablet: true }, { name: "844x390", width: 844, height: 390 }];
const VIEWPORTS = process.env.FOLIO_PHONE_ONLY === "drift" ? [] : process.env.FOLIO_VIEWPORTS ? ALL_VIEWPORTS.filter((v) => process.env.FOLIO_VIEWPORTS.split(",").includes(v.name)) : ALL_VIEWPORTS;   // FOLIO_VIEWPORTS=360x640,844x390 for a quick look
const THEMES = [{ name: "folio", theme: "folio", night: false }, { name: "folio-night", theme: "folio", night: true }, { name: "synth", theme: "synth", night: false }];
const CONTROLS = [".atlas2-search", ".atlas2-study", ".atlas2-zoom", ".atlas2-menu-btn", ".atlas2-layers-btn", ".atlas2-about-btn", ".atlas2-caption", ".atlas2-stack", ".atlas2-card", ".atlas2-sheet", ".atlas2-about", ".atlas2-status", ".atlas2-mode", ".atlas2-rail"];   // the year rail joined the list with the decluttered phone (Oct 2026): one row, it can overlap nothing
const DESK_CONTROLS = CONTROLS.filter((c) => c !== ".atlas2-rail");   // the tablet's desktop layout is unchanged and was never held to the rail (its legend sheet reaches the rail at 768×1024: not this change's)
const MENU_CONTROLS = [".atlas2-search", ".atlas2-menu-btn", ".atlas2-zoom", ".atlas2-menu"];   // with the menu's sheet open it stands over the year rail by design: what it must clear is the buttons and the zoom pill
const ONLY_DRIFT = process.env.FOLIO_PHONE_ONLY === "drift";
const OVERLAY_BEFORE_390 = 73704;   // px² the controls covered at 390×844 in the default state BEFORE the decluttered layout (search, study panel, five buttons, two-row rail), measured 2026-10-16 as the union of their boxes
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rectsOf = (page, sels) => page.evaluate((sels) => {
  const out = [];
  const seen = new Set();
  for (const s of sels) for (const e of document.querySelectorAll(s)) { if (seen.has(e)) continue; seen.add(e); if (e.hidden || e.closest("[hidden]")) continue; const cs = getComputedStyle(e); if (cs.display === "none" || cs.visibility === "hidden") continue; const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue; out.push({ sel: s, x: r.left, y: r.top, w: r.width, h: r.height, r: r.right, b: r.bottom }); }
  const tb = document.querySelector(".tabbar"); const tr = tb && getComputedStyle(tb).display !== "none" ? tb.getBoundingClientRect() : null;
  const at = document.querySelector(".atlas2").getBoundingClientRect();
  return { rects: out, tabbar: tr ? { x: tr.left, y: tr.top, w: tr.width, h: tr.height, r: tr.right, b: tr.bottom } : null, atlas: { x: at.left, y: at.top, w: at.width, h: at.height, r: at.right, b: at.bottom }, vw: innerWidth, vh: innerHeight };
}, sels);
const overlaps = (a, b) => a.x < b.r - 1 && b.x < a.r - 1 && a.y < b.b - 1 && b.y < a.b - 1;
const pairs = (rects) => { const out = []; for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) if (overlaps(rects[i], rects[j])) out.push(rects[i].sel + " × " + rects[j].sel); return out; };

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  fs.mkdirSync(OUT, { recursive: true });
  const base = `http://127.0.0.1:${PORT}/`;
  const browser = await chromium.launch(LAUNCH);
  const css = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
  console.log("\n\x1b[1m0) the stylesheet's phone rules carry the safe-area insets\x1b[0m\n");
  const phoneRules = css.split("\n").filter((l) => l.startsWith(".atlas2-phone") || l.startsWith(".atlas2.atlas2-phone")).join("\n");
  // since the decluttered phone (Oct 2026) the side insets are two custom properties on .atlas2-phone (--atlas2-sl, --atlas2-sr), written against env(); a rule that reads them is written against the insets too
  const insetVars = /--atlas2-sl:max\(12px, env\(safe-area-inset-left\)\)/.test(phoneRules) && /--atlas2-sr:max\(12px, env\(safe-area-inset-right\)\)/.test(phoneRules);
  check("the phone's side insets are defined once, against env(safe-area-inset-left / right)", insetVars);
  for (const what of [".atlas2-zoom", ".atlas2-status", ".atlas2-card", ".atlas2-menu", ".atlas2-mode", ".atlas2-search", ".atlas2-rail"]) check(`${what} on a phone is written against env(safe-area-inset-*) (directly or through --atlas2-sl / --atlas2-sr)`, phoneRules.split("\n").some((l) => l.includes(what) && (/env\(safe-area-inset-(left|right|bottom)\)/.test(l) || /var\(--atlas2-(sl|sr|tl)\)/.test(l))) || css.split("\n").some((l) => l.includes(what + "-body") && /env\(safe-area-inset-/.test(l)));

  for (const V of VIEWPORTS) {
    const mobile = !V.tablet;
    const context = await browser.newContext({ viewport: { width: V.width, height: V.height }, isMobile: mobile, hasTouch: true, deviceScaleFactor: 2 });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
    page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
    const cdp = await context.newCDPSession(page);
    await page.goto(base + "#map", { waitUntil: "load" });
    await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 180000 });
    await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.waterSettled() && c.labelsReady() && c.labels().length > 0; }, null, { timeout: 120000 });
    const phoneClass = await page.evaluate(() => document.querySelector(".atlas2").classList.contains("atlas2-phone"));
    console.log(`\n\x1b[1m${V.name}${mobile ? " (phone layout " + phoneClass + ")" : " (tablet: desktop layout)"}\x1b[0m\n`);
    check("the layout matches the pointer", mobile ? phoneClass : !phoneClass);
    const minTarget = phoneClass ? 44 : 34;
    for (const T of THEMES) {
      await page.evaluate((T) => { document.body.dataset.theme = T.theme; document.body.classList.toggle("night", T.night); }, T);
      await sleep(150);
      await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; c.clearSelection(); c.setView(10, 50, 3); });
      await page.waitForFunction(() => document.querySelector(".atlas2").__atlas2.tilesSettled(), null, { timeout: 60000 });
      await page.evaluate(() => document.querySelector(".atlas2").__atlas2.layoutNow()); await sleep(150);
      // state 1: the globe with its chrome
      let R = await rectsOf(page, phoneClass ? CONTROLS : DESK_CONTROLS);
      let bad = pairs(R.rects);
      const underBar = (rects, tb) => (tb ? rects.filter((r) => overlaps(r, tb)).map((r) => r.sel) : []);
      check(`${T.name}: globe — no control overlaps another`, bad.length === 0, bad.join("; ") || `${R.rects.length} controls`);
      check(`${T.name}: globe — no control under the bottom tab bar`, underBar(R.rects, R.tabbar).length === 0, underBar(R.rects, R.tabbar).join(", ") || (R.tabbar ? "tab bar at y " + Math.round(R.tabbar.y) : "no tab bar at this width"));
      check(`${T.name}: every control inside the viewport`, R.rects.every((r) => r.x >= -1 && r.y >= -1 && r.r <= R.vw + 1 && r.b <= R.vh + 1), R.rects.filter((r) => !(r.x >= -1 && r.y >= -1 && r.r <= R.vw + 1 && r.b <= R.vh + 1)).map((r) => r.sel + " " + Math.round(r.x) + "," + Math.round(r.y) + " " + Math.round(r.w) + "×" + Math.round(r.h)).join("; "));
      await page.screenshot({ path: path.join(OUT, `${V.name}-${T.name}-globe.png`) });
      // state 2: the card open (shut sheet on a phone), then expanded
      await page.evaluate(() => document.querySelector(".atlas2").__atlas2.select("adm0:fra", { open: true, fly: false, push: false })); await sleep(300);
      R = await rectsOf(page, phoneClass ? CONTROLS : DESK_CONTROLS); bad = pairs(R.rects);
      check(`${T.name}: card open — no overlap, nothing under the bar`, bad.length === 0 && underBar(R.rects, R.tabbar).length === 0, bad.concat(underBar(R.rects, R.tabbar)).join("; "));
      await page.screenshot({ path: path.join(OUT, `${V.name}-${T.name}-card.png`) });
      if (phoneClass) {
        await page.click(".atlas2-grip"); await sleep(300);
        R = await rectsOf(page, phoneClass ? CONTROLS : DESK_CONTROLS); bad = pairs(R.rects);
        check(`${T.name}: card expanded — no overlap, nothing under the bar`, bad.length === 0 && underBar(R.rects, R.tabbar).length === 0, bad.concat(underBar(R.rects, R.tabbar)).join("; "));
        await page.screenshot({ path: path.join(OUT, `${V.name}-${T.name}-card-expanded.png`) });
      }
      await page.evaluate(() => document.querySelector(".atlas2").__atlas2.clearSelection()); await sleep(200);
      // state 3: the legend open; state 4: About open
      if (phoneClass) { await page.click(".atlas2-menu-btn"); await sleep(250); await page.click('[data-sec="layers"] .atlas2-menu-row'); }
      else await page.click(".atlas2-layers-btn");
      await sleep(250);
      R = await rectsOf(page, phoneClass ? MENU_CONTROLS : DESK_CONTROLS); bad = pairs(R.rects);
      check(`${T.name}: legend open${phoneClass ? " (in the menu)" : ""} — no overlap, nothing under the bar, sheet inside the viewport`, bad.length === 0 && underBar(R.rects, R.tabbar).length === 0 && R.rects.every((r) => r.b <= R.vh + 1), bad.concat(underBar(R.rects, R.tabbar), R.rects.filter((r) => r.b > R.vh + 1).map((r) => `${r.sel} bottom ${Math.round(r.b)} > ${R.vh}`)).join("; "));
      await page.screenshot({ path: path.join(OUT, `${V.name}-${T.name}-legend.png`) });
      if (phoneClass) { await page.click('[data-sec="help"] .atlas2-menu-row'); }
      else { await page.click("#atlas2-sheet .atlas2-sheet-close"); await sleep(150); await page.click(".atlas2-about-btn"); }
      await sleep(250);
      R = await rectsOf(page, phoneClass ? MENU_CONTROLS : DESK_CONTROLS); bad = pairs(R.rects);
      check(`${T.name}: About open${phoneClass ? " (in the menu)" : ""} — no overlap, nothing under the bar`, bad.length === 0 && underBar(R.rects, R.tabbar).length === 0, bad.concat(underBar(R.rects, R.tabbar)).join("; "));
      await page.screenshot({ path: path.join(OUT, `${V.name}-${T.name}-about.png`) });
      if (phoneClass) { await page.click(".atlas2-menu-close"); await sleep(250); } else { await page.click(".atlas2-about-close"); await sleep(150); }
    }
    // 44 px targets
    if (phoneClass) { await page.click(".atlas2-search-btn"); await sleep(200); }   // the input opens from its button on a phone
    await page.fill(".atlas2-search-in", "par"); await sleep(300);
    const targets = await page.evaluate(() => [...document.querySelectorAll(".atlas2 button, .atlas2 input[type=search], .atlas2-results li")].filter((e) => !e.closest("[hidden]") && !e.closest(".atlas2-keys") && getComputedStyle(e).display !== "none").map((e) => { const r = e.getBoundingClientRect(); return { what: e.className || e.tagName, w: r.width, h: r.height }; }).filter((t) => t.w > 0));
    const small = targets.filter((t) => t.h < minTarget - 0.5 || (t.w < minTarget - 0.5 && !/atlas2-search-in|atlas2-results|atlas2-layers-btn|atlas2-stack|atlas2-grip/.test(t.what)));
    check(`every visible target is at least ${minTarget} px`, small.length === 0, small.map((t) => `${t.what} ${Math.round(t.w)}×${Math.round(t.h)}`).join("; ") || `${targets.length} targets`);
    await page.screenshot({ path: path.join(OUT, `${V.name}-search.png`) });
    // the soft keyboard: the search focused, then the viewport loses 300 px (the keyboard's share)
    await page.focus(".atlas2-search-in");
    const before = await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; return { lon: c.view.lon, lat: c.view.lat, zoom: c.view.zoom }; });
    await page.setViewportSize({ width: V.width, height: Math.max(300, V.height - 300) }); await sleep(400);
    const kbd = await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; const s = document.querySelector(".atlas2-search-in").getBoundingClientRect(); const le = document.querySelector(".atlas2-results"), l = le.getBoundingClientRect(); return { lon: c.view.lon, lat: c.view.lat, zoom: c.view.zoom, searchVisible: s.top >= 0 && s.bottom <= innerHeight, listVisible: l.height === 0 || l.bottom <= innerHeight + 1, focus: document.activeElement === document.querySelector(".atlas2-search-in"), listTop: Math.round(l.top), listBottom: Math.round(l.bottom), vh: innerHeight, maxH: getComputedStyle(le).maxHeight, room: document.querySelector(".atlas2").style.getPropertyValue("--atlas2-list-max"), scrollY: Math.round(scrollY) }; });
    check("with the keyboard up the map's centre stays and the search box and its list stay visible", kbd.lon === before.lon && kbd.lat === before.lat && kbd.searchVisible && kbd.listVisible && kbd.focus, JSON.stringify(kbd));
    await page.setViewportSize({ width: V.width, height: V.height }); await sleep(300);
    await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; c.clearSelection(); const s = document.querySelector(".atlas2-search-in"); s.value = ""; s.dispatchEvent(new Event("input")); s.blur(); c.setView(10, 20, 24); }); await sleep(300);
    if (phoneClass) { await page.click(".atlas2-search-btn"); await sleep(250); }   // shut the phone's search box again   // the input event closes the result list (a row left under a finger would be chosen)
    // the pinch about the midpoint
    const box = await (await page.$(".atlas2-canvas")).boundingBox();
    const mx = box.x + box.width * 0.35, my = box.y + box.height * 0.6;
    const under = (px, py) => page.evaluate(([x, y]) => { const c = document.querySelector(".atlas2").__atlas2; return c.stackAt(x, y)[0] || null; }, [px - box.x, py - box.y]);
    const geoBefore = await page.evaluate(([x, y]) => { const c = document.querySelector(".atlas2").__atlas2; const r = c.view.radius, dx = (x - c.view.cx) / r, dy = -(y - c.view.cy) / r; const z = Math.sqrt(Math.max(0, 1 - dx * dx - dy * dy)), m = c.view.rot; const X = m[0] * dx + m[3] * dy + m[6] * z, Y = m[1] * dx + m[4] * dy + m[7] * z, W = m[2] * dx + m[5] * dy + m[8] * z; return { lon: Math.atan2(Y, X) * 180 / Math.PI, lat: Math.asin(W) * 180 / Math.PI }; }, [mx - box.x, my - box.y]);
    const send = (type, touchPoints) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints });
    const pts = (d) => [{ x: mx - d, y: my, id: 1 }, { x: mx + d, y: my, id: 2 }];
    await send("touchStart", pts(40)); for (let i = 1; i <= 20; i++) { await send("touchMove", pts(40 + i * 4)); await sleep(16); } await send("touchEnd", []); await sleep(500);
    const geoAfter = await page.evaluate(([x, y]) => { const c = document.querySelector(".atlas2").__atlas2; const r = c.view.radius, dx = (x - c.view.cx) / r, dy = -(y - c.view.cy) / r; const z = Math.sqrt(Math.max(0, 1 - dx * dx - dy * dy)), m = c.view.rot; const X = m[0] * dx + m[3] * dy + m[6] * z, Y = m[1] * dx + m[4] * dy + m[7] * z, W = m[2] * dx + m[5] * dy + m[8] * z; return { lon: Math.atan2(Y, X) * 180 / Math.PI, lat: Math.asin(W) * 180 / Math.PI, zoom: c.view.zoom }; }, [mx - box.x, my - box.y]);
    const drift = Math.hypot(geoAfter.lon - geoBefore.lon, geoAfter.lat - geoBefore.lat);
    check("a two-finger pinch zooms about the fingers' midpoint (the place under it stays under it)", geoAfter.zoom > 1.5 && drift < 1.0, `zoom → ${geoAfter.zoom.toFixed(2)}, the midpoint moved ${drift.toFixed(2)}° on the ground`);
    void under;
    // the double tap
    await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setView(10, 20, 24)); await sleep(300);
    const z0 = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.view.zoom);
    const tx = box.x + box.width * 0.5, ty = box.y + box.height * 0.45;
    for (let k = 0; k < 2; k++) { await send("touchStart", [{ x: tx, y: ty, id: 1 }]); await sleep(40); await send("touchEnd", []); await sleep(k ? 400 : 120); }
    const z1 = await page.evaluate(() => document.querySelector(".atlas2").__atlas2.view.zoom);
    check("a double tap zooms in about the tap", z1 > z0 * 1.8 && z1 < z0 * 2.2, `zoom ${z0.toFixed(2)} → ${z1.toFixed(2)}`);
    // Phase 4c, task 0a: a label is whole and clear of every control WHILE the map moves (the owner's phone: "ille" for Lille, "Essen" under the ? button),
    // in the light and the dark theme: six drags, every live label read mid-gesture and at release, before the layout the release asks for
    for (const night of [false, true]) {
      await page.evaluate((n) => { document.body.dataset.theme = "folio"; document.body.classList.toggle("night", n); }, night); await sleep(200);
      const drawn = () => page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2, b = document.querySelector(".atlas2-canvas").getBoundingClientRect(), ch = c.chromeRects(), bad = []; let n = 0;
        for (const e of c.labelsLive()) { n++; for (const q of e.p.rects) { const r = [q[0] + e.dx, q[1] + e.dy, q[2] + e.dx, q[3] + e.dy];
          if (r[0] < 0 || r[1] < 0 || r[2] > b.width || r[3] > b.height) bad.push((e.p.text || e.p.id) + " leaves the frame"); else if (ch.some((k) => r[0] < k[2] && r[2] > k[0] && r[1] < k[3] && r[3] > k[1])) bad.push((e.p.text || e.p.id) + " under a control"); } }
        return { n, bad, lon: c.view.lon }; });
      const gx = box.x + box.width / 2, gy = box.y + box.height / 2; let total = 0, moved = false; const bad = [];
      for (const [mx, my] of [[-90, 0], [90, 0], [0, -120], [0, 120], [-60, 80], [70, -90]]) {
        await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setView(5.67, 51.2, 1.2)); await sleep(300);
        await page.evaluate(() => document.querySelector(".atlas2").__atlas2.layoutNow()); await sleep(100);
        const lon0 = (await drawn()).lon;
        await send("touchStart", [{ x: gx, y: gy, id: 1 }]);
        for (let i = 1; i <= 8; i++) { await send("touchMove", [{ x: gx + mx * i / 8, y: gy + my * i / 8, id: 1 }]); await sleep(16); }
        const mid = await drawn(); await send("touchEnd", []); const end = await drawn();
        if (Math.abs(mid.lon - lon0) > 1e-6) moved = true; total += mid.n + end.n; bad.push(...mid.bad, ...end.bad); await sleep(300);
      }
      check(`${V.name}, ${night ? "dark" : "light"}: six drags over the Benelux — ${total} live labels, none leaves the frame or lies under a control`, moved && total > 40 && bad.length === 0, bad.slice(0, 4).join("; ") || `${total} read`);
    }
    check("no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
    await context.close();
  }

  /* ---------- the study panel on every viewport (Phase 3c): collapsed on a phone, the count line never cut mid-word, clear of the controls ---------- */
  console.log("\n\x1b[1mthe study panel — collapsed on a phone, expandable to the collection chips\x1b[0m\n");
  {
    const w = {}; new Function("window", fs.readFileSync(path.join(ROOT, "atlas/data/card-places.js"), "utf8"))(w);
    const ids = Object.keys(w.ATLAS_CARD_PLACES.cards);
    const READER = [...ids.filter((i) => /^gr-/.test(i)).slice(0, 6), ...ids.filter((i) => /^gw-/.test(i)).slice(0, 3), ...ids.filter((i) => /^rm-/.test(i)).slice(0, 3)];
    const seed = `try { if (!localStorage.getItem("folio_v1_seeded")) { localStorage.setItem("folio_v1", JSON.stringify({ cards: Object.fromEntries(${JSON.stringify(READER)}.map((id) => [id, { due: Date.now() + 9e8, ivl: 9, ease: 2.5, status: "review", reps: 2, first: "2026-08-01" }])), settings: { newPerDay: 5 } })); localStorage.setItem("folio_v1_seeded", "1"); } } catch (e) {}`;
    const OTHERS = [".atlas2-search", ".atlas2-zoom", ".atlas2-layers-btn", ".atlas2-about-btn", ".atlas2-status", ".atlas2-mode", ".atlas2-rail", ".atlas2-caption"];
    const OTHERS_PHONE = [".atlas2-search-btn", ".atlas2-menu-btn", ".atlas2-zoom", ".atlas2-status", ".atlas2-mode", ".atlas2-caption"];   // on a phone the panel is in the menu's sheet, which stands over the year rail by design
    const probe = (page, others) => page.evaluate((others) => {
      const rect = (e) => { const b = e.getBoundingClientRect(); return { x: b.left, y: b.top, r: b.right, b: b.bottom }; };
      const P = document.querySelector(".atlas2-study"), F = document.querySelector(".atlas2").getBoundingClientRect(), sum = P.querySelector(".atlas2-study-sum"), tg = P.querySelector(".atlas2-study-toggle");
      const shown = (e) => !!e && !e.hidden && !e.closest("[hidden]") && getComputedStyle(e).display !== "none";
      // the distance from the panel to the nearest edge of every other visible control (0 where they touch or overlap)
      const pr = rect(P), gaps = {};
      for (const s of others) for (const e of document.querySelectorAll(s)) { if (!shown(e)) continue; const o = rect(e); const dx = Math.max(0, o.x - pr.r, pr.x - o.r), dy = Math.max(0, o.y - pr.b, pr.y - o.b); const d = Math.hypot(dx, dy); if (gaps[s] === undefined || d < gaps[s]) gaps[s] = d; }
      // every word of the count line on ONE line box: a word cut across two lines would have two client rects
      const words = []; const tn = sum.firstChild; let cut = [];
      if (tn && tn.nodeType === 3) { const t = tn.data; const re = /\S+/g; let m; while ((m = re.exec(t))) { const r = document.createRange(); r.setStart(tn, m.index); r.setEnd(tn, m.index + m[0].length); words.push(m[0]); if (r.getClientRects().length > 1) cut.push(m[0]); } }
      const cs = getComputedStyle(sum);
      return { open: P.getAttribute("data-open"), mode: P.getAttribute("data-mode"), ready: P.getAttribute("data-ready"), panel: pr, frame: { x: F.left, y: F.top, r: F.right, b: F.bottom }, gaps,
        modes: shown(P.querySelector(".atlas2-study-modes")), sum: shown(sum), sumText: sum.textContent, sumClipped: sum.scrollWidth > sum.clientWidth + 1, ellipsis: cs.textOverflow === "ellipsis", nowrap: cs.whiteSpace === "nowrap", wordsCut: cut, words: words.length,
        toggle: shown(tg), toggleExpanded: tg && tg.getAttribute("aria-expanded"), toggleSize: tg && shown(tg) ? [Math.round(tg.getBoundingClientRect().width), Math.round(tg.getBoundingClientRect().height)] : null,
        colls: shown(P.querySelector(".atlas2-study-colls")), chips: P.querySelectorAll("[data-coll]").length, h: Math.round(pr.b - pr.y) };
    }, others);
    for (const V of VIEWPORTS) {
      const mobile = !V.tablet;
      const context = await browser.newContext({ viewport: { width: V.width, height: V.height }, isMobile: mobile, hasTouch: true, deviceScaleFactor: 2 });
      await context.addInitScript(seed);
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
      page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
      await page.goto(base + "#map", { waitUntil: "load" });
      await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 180000 });
      await page.waitForFunction(() => document.querySelector(".atlas2").__atlas2.study.ready(), null, { timeout: 120000 });
      await sleep(300);
      const phone = await page.evaluate(() => document.querySelector(".atlas2").classList.contains("atlas2-phone"));
      console.log(`\n\x1b[1m${V.name} (${phone ? "phone" : "desktop"} layout)\x1b[0m\n`);
      const oth = phone ? OTHERS_PHONE : OTHERS;
      if (phone) { await page.tap(".atlas2-menu-btn"); await sleep(300); }   // Oct 2026: on a phone the study panel lives in the menu's sheet
      let a = await probe(page, oth);
      check("the panel is " + (phone ? "collapsed" : "open") + " by default", phone ? (a.open === "0" && a.toggleExpanded === "false" && !a.colls) : (a.open === "1" && a.toggleExpanded === "true" && a.colls), `data-open ${a.open}, ${a.chips} chips, ${a.h} px high`);
      check("the Map / Personal / Full switch and the count line are always there", a.modes && a.sum && /places?/.test(a.sumText), JSON.stringify(a.sumText));
      check("the count line wraps at spaces: no ellipsis, no clipping, no word cut across two lines", !a.ellipsis && !a.nowrap && !a.sumClipped && a.wordsCut.length === 0 && a.words > 2, a.words + " words, cut: " + (a.wordsCut.join(",") || "none"));
      check("the disclosure is there" + (phone ? ", a 44 px target" : ""), a.toggle && (!phone || (a.toggleSize[0] >= 44 && a.toggleSize[1] >= 44)), JSON.stringify(a.toggleSize));
      const inside = (q) => q.panel.x >= q.frame.x - 0.5 && q.panel.r <= q.frame.r + 0.5 && q.panel.y >= q.frame.y - 0.5 && q.panel.b <= q.frame.b + 0.5;
      const minGap = (q) => Math.min(...Object.values(q.gaps));
      check("collapsed or open, the panel is inside the frame and keeps at least 6 px from every other control (the Legend pill included)", inside(a) && minGap(a) >= 6, `nearest control ${minGap(a).toFixed(1)} px; ` + Object.entries(a.gaps).map(([k, v]) => k.replace(".atlas2-", "") + " " + Math.round(v)).join(", "));
      const h0 = a.h;
      await page.click(".atlas2-study-toggle"); await sleep(300);
      a = await probe(page, oth);
      const wasOpen = !phone;
      check(wasOpen ? "the disclosure collapses the chips" : "the disclosure opens the collection chips", wasOpen ? (a.open === "0" && !a.colls && a.h < h0) : (a.open === "1" && a.colls && a.chips > 0 && a.h > h0), `${h0} → ${a.h} px, ${a.chips} chips`);
      check("…the panel still keeps 6 px from every control and the sum is not cut", inside(a) && minGap(a) >= 6 && !a.sumClipped && a.wordsCut.length === 0, `nearest ${minGap(a).toFixed(1)} px`);
      await page.reload({ waitUntil: "load" }); await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 180000 }); await page.waitForFunction(() => document.querySelector(".atlas2").__atlas2.study.ready(), null, { timeout: 120000 }); await sleep(300);
      const b = await probe(page, oth);
      check("the reader's choice is remembered across a reload (a stored choice wins over the phone default)", b.open === a.open, `data-open ${a.open} → ${b.open}`);
      await page.screenshot({ path: path.join(OUT, `${V.name}-study-${b.open === "1" ? "open" : "collapsed"}.png`) });
      check("no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
      await context.close();
    }
  }

  /* ---------- THE PHONE, DECLUTTERED (Oct 2026): full-bleed, the compact controls, the area they cover, the fade, the largest text ---------- */
  if (!ONLY_DRIFT) {
  console.log("\n\x1b[1mthe phone, decluttered — full-bleed frame, one search button, one menu button, one zoom pill, a one-row time control\x1b[0m\n");
  const OVERLAY = [".atlas2-search", ".atlas2-search-btn", ".atlas2-study", ".atlas2-zoom", ".atlas2-menu-btn", ".atlas2-menu", ".atlas2-layers-btn", ".atlas2-about-btn", ".atlas2-rail", ".atlas2-status", ".atlas2-caption", ".atlas2-mode", ".atlas2-back"];
  const unionArea = (page) => page.evaluate((SEL) => {
    const rects = []; for (const s of SEL) for (const e of document.querySelectorAll(s)) { if (e.hidden || e.closest("[hidden]")) continue; const cs = getComputedStyle(e); if (cs.display === "none" || cs.visibility === "hidden") continue; const q = e.getBoundingClientRect(); if (q.width < 2 || q.height < 2) continue; rects.push(q); }
    const W = innerWidth, H = innerHeight, g = new Uint8Array(W * H);
    for (const q of rects) for (let y = Math.max(0, Math.floor(q.top)); y < Math.min(H, Math.ceil(q.bottom)); y++) for (let x = Math.max(0, Math.floor(q.left)); x < Math.min(W, Math.ceil(q.right)); x++) g[y * W + x] = 1;
    let a = 0; for (const v of g) a += v; return a;
  }, OVERLAY);
  const vis = (page, sel) => page.evaluate((sel) => { const e = document.querySelector(sel); if (!e || e.hidden || e.closest("[hidden]")) return false; const cs = getComputedStyle(e); if (cs.display === "none" || cs.visibility === "hidden") return false; const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1; }, sel);
  const box = (page, sel) => page.evaluate((sel) => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, r: r.right, b: r.bottom }; }, sel);
  const seeded = (fontSize) => `try { if (!localStorage.getItem("folio_v1_seeded")) { localStorage.setItem("folio_v1", JSON.stringify({ cards: Object.fromEntries(["wh-023","wh-001","wh-002","gr-001","gr-002","rm-001"].map((id) => [id, { due: Date.now() + 9e8, ivl: 9, ease: 2.5, status: "review", reps: 2, first: "2026-08-01" }])), settings: { newPerDay: 5${fontSize ? ', fontSize: "' + fontSize + '"' : ""} } })); localStorage.setItem("folio_v1_seeded", "1"); } } catch (e) {}`;
  for (const V of VIEWPORTS.filter((v) => !v.tablet && v.width <= 640 && v.height > v.width)) {
    const context = await browser.newContext({ viewport: { width: V.width, height: V.height }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await context.addInitScript(seeded());
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
    page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
    const cdp = await context.newCDPSession(page);
    await page.goto(base + "#map", { waitUntil: "load" });
    await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 180000 });
    await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.waterSettled() && c.labelsReady() && c.labels().length > 0 && c.study.ready(); }, null, { timeout: 120000 });
    await sleep(600);
    console.log(`\n\x1b[1m${V.name}\x1b[0m\n`);
    // (a) the frame
    const F = await page.evaluate(() => { const a = document.querySelector(".atlas2").getBoundingClientRect(), tb = document.querySelector(".tabbar").getBoundingClientRect(), cs = getComputedStyle(document.querySelector(".atlas2")); return { x: a.left, y: a.top, r: a.right, b: a.bottom, w: a.width, tabTop: tb.top, vw: innerWidth, vh: innerHeight, radius: cs.borderTopLeftRadius, scrollH: document.documentElement.scrollHeight, scrollW: document.documentElement.scrollWidth }; });
    check("full-bleed: the frame is edge to edge, from the top of the screen to the top edge of the tab bar, with no rounded corner", Math.abs(F.x) < 0.5 && Math.abs(F.r - F.vw) < 0.5 && Math.abs(F.y) < 0.5 && Math.abs(F.b - F.tabTop) < 0.5 && F.radius === "0px", `frame ${F.x},${F.y} → ${F.r},${F.b}; tab bar top ${F.tabTop}; radius ${F.radius}`);
    check("…and the page does not scroll (the document is no taller or wider than the screen)", F.scrollH <= F.vh && F.scrollW <= F.vw, `${F.scrollW}×${F.scrollH} in ${F.vw}×${F.vh}`);
    // the area the controls cover (the previous layout: 73,704 px² at 390×844)
    const area = await unionArea(page);
    if (V.name === "390x844") check(`the controls cover at most half of what the old layout did: ${area} px² against ${OVERLAY_BEFORE_390} (limit ${OVERLAY_BEFORE_390 / 2})`, area <= OVERLAY_BEFORE_390 / 2, `${(100 * area / (F.w * (F.b - F.y))).toFixed(1)} % of the frame (the old layout: ${(100 * OVERLAY_BEFORE_390 / (358 * 694)).toFixed(1)} % of a 358×694 frame)`);
    else console.log(`        ${V.name}: the controls cover ${area} px² (${(100 * area / (F.w * (F.b - F.y))).toFixed(1)} % of the frame)`);
    // the controls by default
    const S = await box(page, ".atlas2-search-btn"), M = await box(page, ".atlas2-menu-btn"), P = await box(page, ".atlas2-zoom");
    check("top left one search button, top right one menu button, both at least 44 px", !!S && !!M && S.w >= 44 && S.h >= 44 && M.w >= 44 && M.h >= 44 && S.x < F.vw / 2 && M.x > F.vw / 2 && S.y < 20 && M.y < 20, `search ${Math.round(S.w)}×${Math.round(S.h)} at ${Math.round(S.x)},${Math.round(S.y)}; menu ${Math.round(M.w)}×${Math.round(M.h)} at ${Math.round(M.x)},${Math.round(M.y)}`);
    const zb = await page.evaluate(() => [...document.querySelectorAll(".atlas2-zoom button")].map((b) => { const r = b.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height), b.getAttribute("aria-label")]; }));
    check("the zoom stack is one vertical pill on the right edge: +, −, home — each at least 44 × 44", zb.length === 3 && zb.every((b) => b[0] >= 44 && b[1] >= 44) && P.r > F.vw - 20 && P.w <= 50, JSON.stringify(zb) + ` pill ${Math.round(P.w)}×${Math.round(P.h)} at ${Math.round(P.x)},${Math.round(P.y)}`);
    check("the Map / Personal / Full switch, its count line, the Legend and the ? button are not on the map by default (they are in the menu)", !(await vis(page, ".atlas2-study")) && !(await vis(page, ".atlas2-layers-btn")) && !(await vis(page, ".atlas2-about-btn")) && !(await vis(page, ".atlas2-search-in")));
    const R1 = await page.evaluate(() => { const rail = document.querySelector(".atlas2-rail-row").getBoundingClientRect(), v = (s) => { const e = document.querySelector(s); return !!e && getComputedStyle(e).display !== "none"; }; const t = document.querySelector(".atlas2-rail-track").getBoundingClientRect(), y = document.querySelector(".atlas2-rail-year").getBoundingClientRect(), pl = document.querySelector(".atlas2-rail-play").getBoundingClientRect(), mo = document.querySelector(".atlas2-rail-more").getBoundingClientRect(); return { h: rail.height, track: v(".atlas2-rail-track"), year: v(".atlas2-rail-year"), play: v(".atlas2-rail-play"), more: v(".atlas2-rail-more"), prev: v(".atlas2-rail-prev"), next: v(".atlas2-rail-next"), speed: v(".atlas2-rail-speed"), oneLine: Math.abs(t.top + t.height / 2 - (y.top + y.height / 2)) < 2 && Math.abs(pl.top + pl.height / 2 - (mo.top + mo.height / 2)) < 2, sizes: { year: [Math.round(y.width), Math.round(y.height)], play: [Math.round(pl.width), Math.round(pl.height)], more: [Math.round(mo.width), Math.round(mo.height)], track: [Math.round(t.width), Math.round(t.height)] } }; });
    check("the time control is ONE row — scrubber, year, play, more — and the step arrows and the speed are not shown", R1.track && R1.year && R1.play && R1.more && !R1.prev && !R1.next && !R1.speed && R1.oneLine && R1.h <= 56, JSON.stringify(R1.sizes) + ` row ${Math.round(R1.h)} px`);
    check("year, play and more are at least 44 px, the scrubber at least 44 px tall", R1.sizes.year[1] >= 44 && R1.sizes.play[0] >= 44 && R1.sizes.play[1] >= 44 && R1.sizes.more[0] >= 44 && R1.sizes.more[1] >= 44 && R1.sizes.track[1] >= 44 && R1.sizes.track[0] >= 56);
    await page.screenshot({ path: path.join(OUT, `${V.name}-declutter-default.png`) });
    // "more": the arrows and the speed
    await page.click(".atlas2-rail-more"); await sleep(200);
    const R2 = await page.evaluate(() => { const v = (s) => { const e = document.querySelector(s); return !!e && getComputedStyle(e).display !== "none"; }; const rr = document.querySelector(".atlas2-rail-row").getBoundingClientRect(); return { prev: v(".atlas2-rail-prev"), next: v(".atlas2-rail-next"), speed: v(".atlas2-rail-speed"), expanded: document.querySelector(".atlas2-rail-more").getAttribute("aria-expanded"), b: rr.bottom, h: rr.height, tabTop: document.querySelector(".tabbar").getBoundingClientRect().top }; });
    check("the more toggle shows the step arrows and the speed (aria-expanded), inside the frame", R2.prev && R2.next && R2.speed && R2.expanded === "true" && R2.b <= R2.tabTop, `row ${Math.round(R2.h)} px`);
    await page.screenshot({ path: path.join(OUT, `${V.name}-declutter-more.png`) });
    await page.click(".atlas2-rail-more"); await sleep(150);
    check("…and shuts them again", !(await vis(page, ".atlas2-rail-speed")) && (await page.getAttribute(".atlas2-rail-more", "aria-expanded")) === "false");
    // the year: tap to type
    await page.tap(".atlas2-rail-year"); await sleep(150);
    const yf = await page.evaluate(() => ({ focused: document.activeElement === document.querySelector(".atlas2-rail-year"), sel: document.querySelector(".atlas2-rail-year").selectionEnd - document.querySelector(".atlas2-rail-year").selectionStart }));
    check("a tap on the year focuses it with its text selected, so typing replaces it", yf.focused && yf.sel > 3, JSON.stringify(yf));
    await page.keyboard.type("1500"); await page.keyboard.press("Enter"); await sleep(800);
    check("…and Enter sets the year", (await page.evaluate(() => document.querySelector(".atlas2").__atlas2.year())) === 1500);
    await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setYear(new Date().getUTCFullYear())); await sleep(500);
    // the search button opens into the input
    await page.tap(".atlas2-search-btn"); await sleep(250);
    const sa = await page.evaluate(() => { const i = document.querySelector(".atlas2-search-in").getBoundingClientRect(), m = document.querySelector(".atlas2-menu-btn").getBoundingClientRect(); return { shown: i.width > 40, focused: document.activeElement === document.querySelector(".atlas2-search-in"), expanded: document.querySelector(".atlas2-search-btn").getAttribute("aria-expanded"), clearOfMenu: i.right <= m.left + 0.5, h: i.height }; });
    check("a tap on the search button opens the input, focused, clear of the menu button, at least 44 px high", sa.shown && sa.focused && sa.expanded === "true" && sa.clearOfMenu && sa.h >= 43.5, JSON.stringify(sa));
    await page.keyboard.type("par"); await sleep(400);
    check("typing lists places", (await page.locator(".atlas2-results li").count()) > 0);
    await page.screenshot({ path: path.join(OUT, `${V.name}-declutter-search.png`) });
    await page.keyboard.press("Escape"); await sleep(100); await page.keyboard.press("Escape"); await sleep(200);
    check("Escape closes the list, then the box (back to the button)", !(await vis(page, ".atlas2-search-in")) && (await page.getAttribute(".atlas2-search-btn", "aria-expanded")) === "false");
    // the menu: Map / Personal / Full, the count line, the layers and the legend, the help
    await page.tap(".atlas2-menu-btn"); await sleep(300);
    const mn = await page.evaluate(() => { const m = document.querySelector(".atlas2-menu").getBoundingClientRect(), b = (s) => { const e = document.querySelector(s); return e ? e.getBoundingClientRect() : null; }, sh = (e) => !!e && e.width > 1; return { open: !document.querySelector(".atlas2-menu").hidden, expanded: document.querySelector(".atlas2-menu-btn").getAttribute("aria-expanded"), modes: sh(b(".atlas2-study-modes")), sum: sh(b(".atlas2-study-sum")), sumText: document.querySelector(".atlas2-study-sum").textContent, layers: sh(b('[data-sec="layers"] .atlas2-menu-row')), help: sh(b('[data-sec="help"] .atlas2-menu-row')), top: m.top, b: m.bottom, tabTop: document.querySelector(".tabbar").getBoundingClientRect().top, focus: document.activeElement && document.activeElement.className, radios: [...document.querySelectorAll(".atlas2-study-modes button")].map((x) => Math.round(x.getBoundingClientRect().height)) }; });
    check("the menu button opens a sheet holding the Map / Personal / Full switch, its count line, the layers and legend, and the help", mn.open && mn.expanded === "true" && mn.modes && mn.sum && /place/.test(mn.sumText) && mn.layers && mn.help && mn.b <= mn.tabTop + 0.5 && mn.radios.every((h) => h >= 44), `${JSON.stringify(mn.sumText)}; sheet ${Math.round(mn.top)}–${Math.round(mn.b)} (tab bar ${Math.round(mn.tabTop)}); focus on ${mn.focus}`);
    await page.screenshot({ path: path.join(OUT, `${V.name}-declutter-menu.png`) });
    await page.click('[data-mode="personal"]'); await sleep(900);
    check("the switch in the menu works: Personal marks the reader's places", (await page.evaluate(() => document.querySelector(".atlas2").__atlas2.study.mode())) === "personal" && (await page.evaluate(() => document.querySelector(".atlas2").__atlas2.study.marks().length)) > 0);
    await page.tap('[data-sec="layers"] .atlas2-menu-row'); await sleep(300);
    const lg = await page.evaluate(() => { const r = document.querySelector('input[data-layer="rivers"]'); const rb = r && r.getBoundingClientRect(); const body = document.querySelector(".atlas2-menu-body"); return { rivers: !!rb && rb.width > 0, scrolls: body.scrollHeight > body.clientHeight, expanded: document.querySelector('[data-sec="layers"] .atlas2-menu-row').getAttribute("aria-expanded"), menuTop: document.querySelector(".atlas2-menu").getBoundingClientRect().top }; });
    check("\"Layers and legend\" opens the layer switches inside the sheet (and the sheet scrolls inside itself)", lg.rivers && lg.expanded === "true" && lg.scrolls && lg.menuTop >= 60, JSON.stringify(lg));
    await page.screenshot({ path: path.join(OUT, `${V.name}-declutter-layers.png`) });
    await page.tap('input[data-layer="rivers"]'); await sleep(200);
    check("a layer switch in the menu changes the map's layers", (await page.evaluate(() => document.querySelector('input[data-layer="rivers"]').checked)) === false);
    await page.tap('input[data-layer="rivers"]'); await sleep(200);
    await page.tap('[data-sec="help"] .atlas2-menu-row'); await sleep(300);
    check("\"Help\" opens the About text inside the sheet, and the legend closes (one at a time)", (await vis(page, ".atlas2-about")) && !(await vis(page, "#atlas2-sheet")));
    await page.keyboard.press("Escape"); await sleep(150);
    check("Escape closes the help section first, then the menu", !(await vis(page, ".atlas2-about")) && (await vis(page, ".atlas2-menu")));
    await page.keyboard.press("Escape"); await sleep(250);
    check("…and the menu, with focus back on its button", !(await vis(page, ".atlas2-menu")) && (await page.evaluate(() => document.activeElement && document.activeElement.classList.contains("atlas2-menu-btn"))));
    await page.evaluate(() => document.querySelector(".atlas2").__atlas2.study.setMode("map")); await sleep(300);
    // a drag of the map: the page does not scroll, the controls fade to about 35 % and come back 1.5 s after the last finger
    const cvs = await box(page, ".atlas2-canvas");
    const send = (type, touchPoints) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints });
    const op = () => page.evaluate(() => ["atlas2-rail", "atlas2-zoom", "atlas2-menu-btn", "atlas2-search"].map((c) => +getComputedStyle(document.querySelector("." + c)).opacity));
    const gx = cvs.x + cvs.w / 2, gy = cvs.y + cvs.h / 2;
    check("before a gesture every control is fully opaque", (await op()).every((o) => o === 1));
    await send("touchStart", [{ x: gx, y: gy, id: 1 }]);
    for (let i = 1; i <= 12; i++) { await send("touchMove", [{ x: gx + i * 6, y: gy + i * 8, id: 1 }]); await sleep(16); }
    await sleep(300);
    const during = await op();
    check("while the map is dragged the controls fade to about 35 %", during.every((o) => o > 0.3 && o < 0.42), JSON.stringify(during.map((o) => +o.toFixed(2))));
    await page.screenshot({ path: path.join(OUT, `${V.name}-declutter-faded.png`) });
    await send("touchEnd", []); const t0 = Date.now(); await sleep(900);
    const soon = await op();
    check("…they are still faded 0.9 s after the finger lifts", soon.every((o) => o < 0.5), JSON.stringify(soon.map((o) => +o.toFixed(2))));
    await sleep(Math.max(0, 1500 + 600 - (Date.now() - t0)));
    const later = await op();
    check("…and are back (fully opaque) about 1.5 s after it lifts", later.every((o) => o > 0.97), `${Date.now() - t0} ms after, ${JSON.stringify(later.map((o) => +o.toFixed(2)))}`);
    const sc = await page.evaluate(() => ({ y: scrollY, x: scrollX, h: document.documentElement.scrollHeight, vh: innerHeight }));
    check("the page did not scroll while the map was dragged", sc.y === 0 && sc.x === 0 && sc.h <= sc.vh, JSON.stringify(sc));
    check("no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
    await context.close();
    // the largest Text size: nothing leaves the frame, the targets stay, the menu scrolls inside itself
    const ctx2 = await browser.newContext({ viewport: { width: V.width, height: V.height }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await ctx2.addInitScript(seeded("huge"));
    const pg = await ctx2.newPage();
    await pg.goto(base + "#map", { waitUntil: "load" });
    await pg.waitForSelector(".atlas2[data-ready='1']", { timeout: 180000 });
    await pg.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.labelsReady() && c.study.ready(); }, null, { timeout: 120000 });
    await sleep(500);
    const fsv = await pg.evaluate(() => document.body.dataset.fs + " " + getComputedStyle(document.body).getPropertyValue("--fs"));
    const inFrame = (page) => page.evaluate(() => { const a = document.querySelector(".atlas2").getBoundingClientRect(), out = []; for (const e of document.querySelectorAll(".atlas2-search-btn,.atlas2-menu-btn,.atlas2-zoom,.atlas2-rail,.atlas2-menu:not([hidden]),.atlas2-card:not([hidden])")) { const r = e.getBoundingClientRect(); if (r.width < 2) continue; if (r.left < a.left - 0.5 || r.right > a.right + 0.5 || r.top < a.top - 0.5 || r.bottom > a.bottom + 0.5) out.push(e.className + " " + [r.left, r.top, r.right, r.bottom].map(Math.round)); } return out; });
    const out1 = await inFrame(pg);
    const tg = await pg.evaluate(() => [...document.querySelectorAll(".atlas2-search-btn,.atlas2-menu-btn,.atlas2-zoom button,.atlas2-rail-play,.atlas2-rail-more,.atlas2-rail-year")].map((e) => { const r = e.getBoundingClientRect(); return [e.className, Math.round(r.width), Math.round(r.height)]; }).filter((t) => t[1] < 44 || t[2] < 44));
    check(`largest Text size (${fsv}): every control is inside the frame and at least 44 px`, out1.length === 0 && tg.length === 0, out1.concat(tg.map((t) => t.join(" "))).join("; ") || "ok");
    await pg.tap(".atlas2-menu-btn"); await sleep(300); await pg.tap('[data-sec="layers"] .atlas2-menu-row'); await sleep(300);
    const m2 = await pg.evaluate(() => { const m = document.querySelector(".atlas2-menu").getBoundingClientRect(), a = document.querySelector(".atlas2").getBoundingClientRect(), body = document.querySelector(".atlas2-menu-body"); return { top: m.top - a.top, b: m.bottom - a.bottom, scrolls: body.scrollHeight > body.clientHeight, sumFits: document.querySelector(".atlas2-study-sum").scrollWidth <= document.querySelector(".atlas2-study-sum").clientWidth + 1 }; });
    check("…the menu stays inside the frame, with its own scroll, the count line not cut", m2.top >= 0 && m2.b <= 0.5 && m2.scrolls && m2.sumFits, JSON.stringify(m2));
    await pg.screenshot({ path: path.join(OUT, `${V.name}-declutter-huge-menu.png`) });
    await pg.keyboard.press("Escape"); await pg.keyboard.press("Escape"); await sleep(200);
    await pg.screenshot({ path: path.join(OUT, `${V.name}-declutter-huge.png`) });
    await ctx2.close();
  }
  }


  /* ---------- LABEL DRIFT (2026-10-16; the owner's phone: Dmanisi's name drawn over the Ottoman Empire, far from its marker) ----------
     A label is drawn at its layout position moved by its anchor's own motion since (drawLabels), so the distance between a name and its anchor is whatever the
     layout chose, in every frame of a gesture. Two things are measured here, in EVERY label draw of six drags and two pinches on a 390×844 phone, by hooking the
     label canvas's own drawImage (so what is read is what was painted, not what the code means to paint):
       · THE 28 PX RULE: the distance from the anchor (the label's unit vector projected through the view of that very draw) to the nearest rectangle of the name's
         text is at most the name's half-height plus 28 px — no name is drawn farther from its place (before the rule: rivers 40–120 px off at their layout, the
         Ottoman Empire 121 px, Georgia 69 px, in every scenario below but the first);
       · NO STALE DRAW: the sprite lands at the corner of ITS OWN layout moved by the anchor's motion — PR #476's bug painted a cached name at the corner of the
         layout that first drew it. `stale` counts draws that are more than 1.5 px from where they must be; it must be 0. */
  console.log("\n\x1b[1mlabel drift — every label draw of six drags and two pinches, 390×844\x1b[0m\n");
  {
    const HOOK = `(() => {
      const proto = CanvasRenderingContext2D.prototype, oc = proto.clearRect, od = proto.drawImage;
      window.__drift = { frames: [], cur: null, on: false, map: new Map(), c: null };
      const cls = (ctx) => ctx.canvas && ctx.canvas.className === "atlas2-labels";
      proto.clearRect = function (...a) { const D = window.__drift; if (D.on && cls(this)) { D.cur = { n: 0, worst: -1e9, who: null, stale: 0, staleWho: null }; D.frames.push(D.cur); const c = document.querySelector(".atlas2") && document.querySelector(".atlas2").__atlas2; D.map = new Map(); if (c) for (const p of c.labels()) if (p.sprite) D.map.set(p.sprite.c, p); D.c = c; } return oc.apply(this, a); };
      proto.drawImage = function (img, x, y) {
        const D = window.__drift;
        if (D.on && D.cur && D.c && cls(this)) {
          const p = D.map.get(img);
          if (p) {
            const v = D.c.view, rot = v.rot, a = p.a;
            const sx = v.cx + (rot[0] * a[0] + rot[1] * a[1] + rot[2] * a[2]) * v.radius, sy = v.cy - (rot[3] * a[0] + rot[4] * a[1] + rot[5] * a[2]) * v.radius;
            const shx = x - (Math.floor(p.box[0]) - 4), shy = y - (Math.floor(p.box[1]) - 4);
            const rs = p.marker ? [p.rects[0]] : p.rects; let dmin = 1e9, hh = 0;
            for (const q of rs) { const x0 = q[0] + shx, y0 = q[1] + shy, x1 = q[2] + shx, y1 = q[3] + shy; dmin = Math.min(dmin, Math.hypot(Math.max(x0 - sx, 0, sx - x1), Math.max(y0 - sy, 0, sy - y1))); hh = Math.max(hh, (y1 - y0) / 2); }
            const excess = dmin - (hh + 28), ex = (Math.floor(p.box[0]) - 4) + (sx - p.sx), ey = (Math.floor(p.box[1]) - 4) + (sy - p.sy), miss = Math.hypot(x - ex, y - ey);
            D.cur.n++; if (miss > 1.5) { D.cur.stale++; if (!D.cur.staleWho) D.cur.staleWho = { id: p.id, text: p.text, miss: Math.round(miss) }; }
            if (excess > D.cur.worst) { D.cur.worst = excess; D.cur.who = { id: p.id, text: p.text, kind: p.kind, dist: Math.round(dmin), limit: Math.round(hh + 28) }; }
          }
        }
        return od.apply(this, arguments);
      };
    })();`;
    const cardsFor = ["wh-023", "wh-001", "wh-002", "wh-003", "wh-010", "wh-020", "wh-025", "wh-030", "wh-040", "wh-050", "wh-100", "wh-200", "wh-300", "wh-400", "wh-500"];
    const seed = `try { if (!localStorage.getItem("folio_v1_seeded")) { localStorage.setItem("folio_v1", JSON.stringify({ cards: Object.fromEntries(${JSON.stringify(cardsFor)}.map((id) => [id, { due: Date.now() + 9e8, ivl: 9, ease: 2.5, status: "review", reps: 2, first: "2026-08-01" }])), settings: { newPerDay: 5 } })); localStorage.setItem("folio_v1_seeded", "1"); } } catch (e) {}`;
    const SCENARIOS = [
      { name: "the Caucasus at 6×, today", view: [44.2, 41.3, 6] },
      { name: "the Black Sea at 4×, in 1700 (the Ottoman Empire, the Crimean Khanate, the Mughals)", view: [38, 42, 4], year: 1700 },
      { name: "Personal Atlas, the Caucasus at 8× (Dmanisi is a studied place)", view: [44.2, 41.3, 8], mode: "personal", seed: true },
    ];
    const DRAGS = [[-90, 0], [90, 0], [0, -120], [0, 120], [-60, 80], [70, -90]];
    for (const sc of SCENARIOS) {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
      await context.addInitScript(HOOK);
      if (sc.seed) await context.addInitScript(seed);
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
      const cdp = await context.newCDPSession(page);
      await page.goto(base + "#map", { waitUntil: "load" });
      await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 180000 });
      await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.waterSettled() && c.labelsReady() && c.labels().length > 0; }, null, { timeout: 120000 });
      if (sc.mode) { await page.waitForFunction(() => document.querySelector(".atlas2").__atlas2.study.ready(), null, { timeout: 120000 }); await page.evaluate((m) => document.querySelector(".atlas2").__atlas2.study.setMode(m), sc.mode); await sleep(800); }
      if (sc.year != null) { await page.evaluate((y) => document.querySelector(".atlas2").__atlas2.setYear(y), sc.year); await sleep(1500); }
      const cv = await (await page.$(".atlas2-canvas")).boundingBox(); const gx = cv.x + cv.width / 2, gy = cv.y + cv.height / 2;
      const send = (type, touchPoints) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints });
      const reset = async () => { await page.evaluate((v) => document.querySelector(".atlas2").__atlas2.setView(v[0], v[1], v[2]), sc.view); await sleep(400); await page.evaluate(() => document.querySelector(".atlas2").__atlas2.layoutNow()); await sleep(200); };
      const take = () => page.evaluate(() => { const D = window.__drift, f = D.frames.filter((x) => x.n); D.frames = []; let worst = -1e9, who = null, n = 0, stale = 0, staleWho = null; for (const x of f) { n += x.n; stale += x.stale; if (x.stale && !staleWho) staleWho = x.staleWho; if (x.worst > worst) { worst = x.worst; who = x.who; } } return { frames: f.length, labels: n, worst, who, stale, staleWho }; });
      await page.evaluate(() => { window.__drift.on = true; });
      const runs = [];
      for (const [mx, my] of DRAGS) {
        await reset(); await take();
        await send("touchStart", [{ x: gx, y: gy, id: 1 }]);
        for (let i = 1; i <= 16; i++) { await send("touchMove", [{ x: gx + mx * i / 16, y: gy + my * i / 16, id: 1 }]); await sleep(16); }
        await send("touchEnd", []); await sleep(900);
        runs.push(Object.assign({ g: "drag " + mx + "," + my }, await take()));
      }
      for (const [d0, d1] of [[30, 150], [150, 30]]) {
        await reset(); await take();
        const pts = (d) => [{ x: gx - d, y: gy, id: 1 }, { x: gx + d, y: gy, id: 2 }];
        await send("touchStart", pts(d0)); for (let i = 1; i <= 20; i++) { await send("touchMove", pts(d0 + (d1 - d0) * i / 20)); await sleep(16); } await send("touchEnd", []); await sleep(900);
        runs.push(Object.assign({ g: "pinch " + d0 + "→" + d1 }, await take()));
      }
      const frames = runs.reduce((a, r) => a + r.frames, 0), labels = runs.reduce((a, r) => a + r.labels, 0), stale = runs.reduce((a, r) => a + r.stale, 0);
      const w = runs.reduce((a, r) => (r.worst > a.worst ? r : a), runs[0]);
      // the Personal scenario draws the reader's names alone since 2026-10-18 (decision a of the owner's sixth look: nothing undiscovered is named — Dmanisi and
      // little else at this view), so its floor is one draw per frame where the plain Map's is 500 draws; the rule on every draw is the same
      check(`${sc.name}: ${labels} label draws in ${frames} frames of 6 drags and 2 pinches — none farther from its anchor than its half-height + 28 px`, frames > 100 && labels > (sc.mode === "personal" ? frames * 0.9 : 500) && w.worst <= 0.5, `worst: ${w.who ? w.who.text + " (" + w.who.kind + ") " + w.who.dist + " px against a limit of " + w.who.limit : "none"}, ${w.worst > -1e8 ? w.worst.toFixed(1) : "?"} px over, in ${w.g}`);
      check(`${sc.name}: every draw lands at its own layout's corner moved by its anchor's motion (no stale sprite)`, stale === 0, stale ? `${stale} stale: ${runs.filter((r) => r.stale).map((r) => r.g + " " + r.stale + " " + JSON.stringify(r.staleWho)).join("; ")}` : `0 of ${labels}`);
      check(`${sc.name}: no page errors`, errors.length === 0, errors.slice(0, 2).join(" | "));
      await context.close();
    }
  }

  await browser.close(); server.close();
  console.log(`\nscreenshots in ${OUT}\n${pass} ok, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
