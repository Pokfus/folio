/* test-atlas-stages.js — the adaptive gesture stages of Atlas v2 recover, ignore main-thread stalls, and are visible
   (Phase 2a, task 0b of the brief; docs/atlas-v2-design.md §7 "Phase 1d — as built" for the stages, "Phase 2a — as built"
   for the rules asserted here).

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-stages.js
     FOLIO_CHROMIUM=/path/to/chrome  … to pick the browser (otherwise playwright's own)

   WHAT IT PROVES:
     · AN INJECTED 150 ms MAIN-THREAD STALL DOES NOT ESCALATE: on a viewport small enough that every real frame is fast, a drag
       with a bracketed busy-wait of 150 ms every few moves leaves the stage at 0 and counts the stalls as ignored;
     · SOFTWARE GL ESCALATES AS BEFORE: at 1280×800 a drag on a software renderer still reaches stage 1 or 2 (asserted only
       when the renderer string says software; reported otherwise);
     · A LIGHTER LOAD RECOVERS WITHIN TWO GESTURES: with stage 2 learnt, two drags on a small viewport bring the learnt stage
       down — the first runs at the learnt stage and proves twenty fast frames, the second starts one stage lower;
     · ?perf SURVIVES A PAN AND A RELOAD, with a mouse on a desktop viewport and with a touch drag on a 390 px phone;
     · THE ABOUT SHEET'S "Show frame statistics" SWITCH turns the overlay on without any address, is remembered across a
       reload (localStorage), and the overlay's first line names the gesture stage, the escalation count and the heap.
*/
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");

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
const info = (page) => page.evaluate(() => document.querySelector(".atlas2").__atlas2.stageInfo());
async function open(context, hash) {
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  await page.goto(`http://127.0.0.1:${PORT}/${hash || "#map2"}`, { waitUntil: "load" });
  await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 120000 });
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setLayers({ rivers: true, lakes: true, relief: false }));
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.waterSettled() && c.labelsReady(); }, null, { timeout: 120000 });
  await sleep(300);
  return { page, errors };
}
async function drag(page, steps, stallEvery) {
  // the drag keeps clear of the rail (which on a 200 px viewport covers the lower half of the map)
  const box = await (await page.$(".atlas2-canvas")).boundingBox(); const rail = await (await page.$(".atlas2-rail")).boundingBox(); const search = await (await page.$(".atlas2-search")).boundingBox();
  const top = search ? Math.max(box.y, search.y + search.height + 4) : box.y, free = rail ? Math.min(box.y + box.height, rail.y - 4) : box.y + box.height;
  const cx = box.x + box.width / 2, cy = (top + free) / 2, wob = Math.max(4, Math.min(30, (free - top) / 2 - 6));
  await page.mouse.move(cx, cy); await page.mouse.down();
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(cx + Math.sin(i / 12) * 60 + i * 0.3, cy + Math.cos(i / 12) * wob);
    if (stallEvery && i % stallEvery === 0) await page.evaluate(() => document.querySelector(".atlas2").__atlas2.stall(150));
    await sleep(2);   // the CDP round trip is the cadence (about 30 ms a move); a longer pause would read as slow frames on any GPU
  }
  await page.mouse.up(); await sleep(700);
}
async function touchDrag(page, cdp, steps) {
  const box = await (await page.$(".atlas2-canvas")).boundingBox(); const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  const send = (type, touchPoints) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints });
  await send("touchStart", [{ x: cx, y: cy, id: 1 }]);
  for (let i = 1; i <= steps; i++) { await send("touchMove", [{ x: cx + i * 3, y: cy + Math.sin(i / 6) * 10, id: 1 }]); await sleep(16); }
  await send("touchEnd", []); await sleep(900);
}

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch(LAUNCH);
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const { page, errors } = await open(context, "#map2?perf");
  const gl = await page.evaluate(() => { const c = document.createElement("canvas"); const g = c.getContext("webgl2"); if (!g) return "none"; const d = g.getExtension("WEBGL_debug_renderer_info"); return d ? g.getParameter(d.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER); }).catch(() => "?");
  const software = /swiftshader|llvmpipe|software/i.test(gl);
  console.log("WebGL2 renderer: " + gl + (software ? " (software)" : ""));
  const i0 = await info(page);
  console.log(`  long-task observer ${i0.longObs}, GPU timer ${i0.gpuTimer}`);

  console.log("\n\x1b[1m1) software GL escalates as before\x1b[0m\n");
  await drag(page, 80);
  const i1 = await info(page);
  if (software) check("a drag at 1280×800 on software GL reaches stage 1 or 2", i1.learnt >= 1 && i1.escalations >= 1, JSON.stringify(i1));
  else check("a drag at 1280×800 (hardware GL: the stage is reported, not asserted)", true, JSON.stringify(i1));

  console.log("\n\x1b[1m2) an injected 150 ms main-thread stall does not escalate\x1b[0m\n");
  await page.setViewportSize({ width: 320, height: 420 });
  await sleep(500);
  await drag(page, 30);   // a warm-up after the resize: the first frames at a new size lay out labels and fetch tiles, and may be slow on any GPU
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.forceStage(0, false));
  await drag(page, 40);   // a plain drag first: on this viewport the real frames must be fast
  const quiet = await info(page);
  await drag(page, 60, 6);   // ten stalls of 150 ms inside the gesture
  const i2 = await info(page);
  check("a plain drag at 320×420 stays at stage 0 (every real frame is fast here)", quiet.stage === 0 && quiet.escalations === i1.escalations, JSON.stringify(quiet));
  check("ten injected 150 ms stalls during a drag leave the stage at 0 and are counted as ignored", i2.stage === 0 && i2.escalations === quiet.escalations && i2.stallsIgnored >= 5, `stage ${i2.stage}, escalations ${i2.escalations} (was ${quiet.escalations}), stalls ignored ${i2.stallsIgnored}, long tasks ${i2.longTasks}`);

  console.log("\n\x1b[1m3) a lighter load recovers within two gestures\x1b[0m\n");
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.forceStage(2, false));
  const before = await info(page);
  await drag(page, 60);
  const mid = await info(page);
  await drag(page, 60);
  const after = await info(page);
  check("with stage 2 learnt, the first drag on a light load runs twenty fast frames at the learnt stage", mid.fastRun >= 20 || mid.learnt < 2, `fastRun ${mid.fastRun}, learnt ${mid.learnt}`);
  check("the second drag starts a stage lower and the learnt stage comes down", after.learnt < before.learnt && after.recoveries >= 1, `learnt ${before.learnt} → ${after.learnt}, recoveries ${after.recoveries}, stage ${after.stage}`);
  await page.setViewportSize({ width: 1280, height: 800 });
  await sleep(400);

  console.log("\n\x1b[1m4) ?perf survives a pan and a reload\x1b[0m\n");
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.setView(10, 20, 24));
  await drag(page, 30);
  const h1 = await page.evaluate(() => location.hash);
  check("desktop: after a mouse pan the address carries the view and ?perf", /^#map2\/-?[\d.]+\/-?[\d.]+\/[\d.]+(\?y=-?\d+&perf|\?perf)$/.test(h1), h1);
  await page.reload({ waitUntil: "load" }); await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 120000 }); await sleep(300);
  const h2 = await page.evaluate(() => ({ hash: location.hash, on: !document.querySelector(".atlas2-perf").hidden, first: document.querySelector(".atlas2-perf").textContent.split("\n")[0] }));
  check("desktop: after a reload the address still carries ?perf and the overlay is on", /(\?|&)perf$/.test(h2.hash) && h2.on, h2.hash);
  check("the overlay's first line names the gesture stage, the escalation count and the heap", /^gesture stage \d \(learnt \d(, locked)?\)\s+escalations \d+/.test(h2.first) && /heap /.test(h2.first), h2.first);
  check("no page errors (desktop)", errors.length === 0, errors.slice(0, 3).join(" | "));
  await page.close();
  {
    const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    const P = await open(phone, "#map2?perf");
    const cdp = await phone.newCDPSession(P.page);
    await touchDrag(P.page, cdp, 30);
    const ph1 = await P.page.evaluate(() => location.hash);
    check("phone: after a touch pan the address carries the view and ?perf", /^#map2\/-?[\d.]+\/-?[\d.]+\/[\d.]+(\?y=-?\d+&perf|\?perf)$/.test(ph1), ph1);
    await P.page.reload({ waitUntil: "load" }); await P.page.waitForSelector(".atlas2[data-ready='1']", { timeout: 120000 }); await sleep(300);
    const ph2 = await P.page.evaluate(() => ({ hash: location.hash, on: !document.querySelector(".atlas2-perf").hidden }));
    check("phone: after a reload ?perf is still in the address and the overlay is on", /(\?|&)perf$/.test(ph2.hash) && ph2.on, ph2.hash);
    check("no page errors (phone)", P.errors.length === 0, P.errors.slice(0, 3).join(" | "));
    await phone.close();
  }

  console.log("\n\x1b[1m5) the About sheet's switch\x1b[0m\n");
  {
    const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const S = await open(ctx2, "#map2");
    const off = await S.page.evaluate(() => ({ hidden: document.querySelector(".atlas2-perf").hidden, hash: location.hash }));
    check("without ?perf and no preference the overlay is off", off.hidden, off.hash);
    await S.page.click(".atlas2-about-btn"); await sleep(150);
    const sw = await S.page.$(".atlas2-about .atlas2-perf-switch");
    check("the About sheet carries a \"Show frame statistics\" switch", !!sw);
    if (sw) { await sw.check(); await sleep(150); }
    const on = await S.page.evaluate(() => ({ hidden: document.querySelector(".atlas2-perf").hidden, hash: location.hash, stored: (() => { try { return localStorage.getItem("folio_atlas2_perf"); } catch (e) { return "?"; } })() }));
    check("checking it shows the overlay, stores the preference and adds nothing to the address", !on.hidden && on.stored === "1" && !/perf/.test(on.hash), JSON.stringify(on));
    await S.page.reload({ waitUntil: "load" }); await S.page.waitForSelector(".atlas2[data-ready='1']", { timeout: 120000 }); await sleep(300);
    const again = await S.page.evaluate(() => ({ hidden: document.querySelector(".atlas2-perf").hidden, checked: document.querySelector(".atlas2-perf-switch").checked, hash: location.hash }));
    check("after a reload without ?perf the overlay is on from the stored preference and the switch reads checked", !again.hidden && again.checked && !/perf/.test(again.hash), JSON.stringify(again));
    await S.page.click(".atlas2-about-btn"); await sleep(150);
    await (await S.page.$(".atlas2-about .atlas2-perf-switch")).uncheck(); await sleep(150);
    const offAgain = await S.page.evaluate(() => ({ hidden: document.querySelector(".atlas2-perf").hidden, stored: (() => { try { return localStorage.getItem("folio_atlas2_perf"); } catch (e) { return "?"; } })() }));
    check("unchecking it hides the overlay and stores that", offAgain.hidden && offAgain.stored === "0", JSON.stringify(offAgain));
    check("no page errors (switch)", S.errors.length === 0, S.errors.slice(0, 3).join(" | "));
    await ctx2.close();
  }
  await browser.close(); server.close();
  console.log(`\n${pass} ok, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
