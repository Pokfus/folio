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
       chips, the sheets and the notes).
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
const VIEWPORTS = process.env.FOLIO_VIEWPORTS ? ALL_VIEWPORTS.filter((v) => process.env.FOLIO_VIEWPORTS.split(",").includes(v.name)) : ALL_VIEWPORTS;   // FOLIO_VIEWPORTS=360x640,844x390 for a quick look
const THEMES = [{ name: "folio", theme: "folio", night: false }, { name: "folio-night", theme: "folio", night: true }, { name: "synth", theme: "synth", night: false }];
const CONTROLS = [".atlas2-search", ".atlas2-zoom", ".atlas2-layers-btn", ".atlas2-about-btn", ".atlas2-caption", ".atlas2-stack", ".atlas2-card", ".atlas2-sheet", ".atlas2-about", ".atlas2-status", ".atlas2-mode"];
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
  const phoneRules = css.split("\n").filter((l) => l.startsWith(".atlas2-phone")).join("\n");
  for (const what of [".atlas2-zoom", ".atlas2-status", ".atlas2-card", ".atlas2-sheet", ".atlas2-mode", ".atlas2-search"]) check(`${what} on a phone is written against env(safe-area-inset-*)`, phoneRules.split("\n").some((l) => l.includes(what) && /env\(safe-area-inset-(left|right|bottom)\)/.test(l)));

  for (const V of VIEWPORTS) {
    const mobile = !V.tablet;
    const context = await browser.newContext({ viewport: { width: V.width, height: V.height }, isMobile: mobile, hasTouch: true, deviceScaleFactor: 2 });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
    page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
    const cdp = await context.newCDPSession(page);
    await page.goto(base + "#map2", { waitUntil: "load" });
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
      let R = await rectsOf(page, CONTROLS);
      let bad = pairs(R.rects);
      const underBar = (rects, tb) => (tb ? rects.filter((r) => overlaps(r, tb)).map((r) => r.sel) : []);
      check(`${T.name}: globe — no control overlaps another`, bad.length === 0, bad.join("; ") || `${R.rects.length} controls`);
      check(`${T.name}: globe — no control under the bottom tab bar`, underBar(R.rects, R.tabbar).length === 0, underBar(R.rects, R.tabbar).join(", ") || (R.tabbar ? "tab bar at y " + Math.round(R.tabbar.y) : "no tab bar at this width"));
      check(`${T.name}: every control inside the viewport`, R.rects.every((r) => r.x >= -1 && r.y >= -1 && r.r <= R.vw + 1 && r.b <= R.vh + 1), R.rects.filter((r) => !(r.x >= -1 && r.y >= -1 && r.r <= R.vw + 1 && r.b <= R.vh + 1)).map((r) => r.sel + " " + Math.round(r.x) + "," + Math.round(r.y) + " " + Math.round(r.w) + "×" + Math.round(r.h)).join("; "));
      await page.screenshot({ path: path.join(OUT, `${V.name}-${T.name}-globe.png`) });
      // state 2: the card open (shut sheet on a phone), then expanded
      await page.evaluate(() => document.querySelector(".atlas2").__atlas2.select("adm0:fra", { open: true, fly: false, push: false })); await sleep(300);
      R = await rectsOf(page, CONTROLS); bad = pairs(R.rects);
      check(`${T.name}: card open — no overlap, nothing under the bar`, bad.length === 0 && underBar(R.rects, R.tabbar).length === 0, bad.concat(underBar(R.rects, R.tabbar)).join("; "));
      await page.screenshot({ path: path.join(OUT, `${V.name}-${T.name}-card.png`) });
      if (phoneClass) {
        await page.click(".atlas2-grip"); await sleep(300);
        R = await rectsOf(page, CONTROLS); bad = pairs(R.rects);
        check(`${T.name}: card expanded — no overlap, nothing under the bar`, bad.length === 0 && underBar(R.rects, R.tabbar).length === 0, bad.concat(underBar(R.rects, R.tabbar)).join("; "));
        await page.screenshot({ path: path.join(OUT, `${V.name}-${T.name}-card-expanded.png`) });
      }
      await page.evaluate(() => document.querySelector(".atlas2").__atlas2.clearSelection()); await sleep(200);
      // state 3: the legend open; state 4: About open
      await page.click(".atlas2-layers-btn"); await sleep(250);
      R = await rectsOf(page, CONTROLS); bad = pairs(R.rects);
      check(`${T.name}: legend open — no overlap, nothing under the bar, sheet inside the viewport`, bad.length === 0 && underBar(R.rects, R.tabbar).length === 0 && R.rects.every((r) => r.b <= R.vh + 1), bad.concat(underBar(R.rects, R.tabbar), R.rects.filter((r) => r.b > R.vh + 1).map((r) => `${r.sel} bottom ${Math.round(r.b)} > ${R.vh}`)).join("; "));
      await page.screenshot({ path: path.join(OUT, `${V.name}-${T.name}-legend.png`) });
      await page.click("#atlas2-sheet .atlas2-sheet-close"); await sleep(150);
      await page.click(".atlas2-about-btn"); await sleep(250);
      R = await rectsOf(page, CONTROLS); bad = pairs(R.rects);
      check(`${T.name}: About open — no overlap, nothing under the bar`, bad.length === 0 && underBar(R.rects, R.tabbar).length === 0, bad.concat(underBar(R.rects, R.tabbar)).join("; "));
      await page.screenshot({ path: path.join(OUT, `${V.name}-${T.name}-about.png`) });
      await page.click(".atlas2-about-close"); await sleep(150);
    }
    // 44 px targets
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
    await page.evaluate(() => { const c = document.querySelector(".atlas2").__atlas2; c.clearSelection(); const s = document.querySelector(".atlas2-search-in"); s.value = ""; s.dispatchEvent(new Event("input")); s.blur(); c.setView(10, 20, 24); }); await sleep(300);   // the input event closes the result list (a row left under a finger would be chosen)
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
    check("no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
    await context.close();
  }
  await browser.close(); server.close();
  console.log(`\nscreenshots in ${OUT}\n${pass} ok, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
