#!/usr/bin/env node
/* Folio — THE MARKER'S GESTURE OWNERSHIP: one pointer draws, the rest are not this stroke.
   ======================================================================================
   Written Aug 2026 on a bug report — "sometimes I find myself unable to draw lines for a few seconds …
   other times lines that should be straight end up crooked" — and every fault behind it is silent in the
   worst way: the marker is on, the canvas is there, the pen is moving, nothing throws, and what the reader
   gets is either a line that wanders or no line at all. There is no error to read and no state on screen
   that says which of the two is happening.

   The cause was one omission. Every other pointer surface on the site records the id it started on and
   ignores the rest — the marker's own drag handle, the page swipe, the colour picker, the gloss window —
   and the DRAWING surface, the one place a second pointer is not merely possible but expected, did not.
   A stylus rests a palm on the screen; a phone has two thumbs. The handlers share a single `WB.drawing`,
   `WB.last` and `passScroll`, so a second contact did not begin a second gesture, it walked into the first.

   Each section below is one way that walk was reported:

     · a palm resting beside the pen — with no id test the pen's later moves were handed to the page
       scroll, so the pen scrolled the card it was meant to be marking;
     · a palm LIFTING, or being cancelled by the browser's own rejection — either ran `end()`, which sets
       `WB.drawing = false`, so the stroke the pen was in the middle of was over and the pen went on moving
       across a canvas that had stopped listening;
     · two fingers on a phone — both move streams reached the draw branch and `WB.last` alternated between
       them, sewing one line back and forth between two contacts. That is the crooked line, exactly.

   And one guard in the other direction, because a fix that simply ignores the newcomer breaks the commonest
   case of all: THE PALM USUALLY LANDS FIRST, so a pen must still be able to take the surface off a finger.
   Both directions are asserted; each looks like the feature working when read from the other side.

   The ink is measured as PIXELS IN A ROW BAND rather than by watching state — a straight line across the
   middle of the canvas marks its own row and nothing else, and a line sewn to a second contact marks rows
   up where that contact is. State can be right while the canvas is wrong.

   Run:  NODE_PATH=<playwright>/node_modules node .claude/test-whiteboard.js
   Env:  FOLIO_CHROMIUM=<path to chrome> if Chromium lives outside the playwright package.
   Not part of the site. */

const path = require("path");
const http = require("http");
const fs = require("fs");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");

const ROOT = path.join(__dirname, "..");
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png" };
const PHONE = { width: 390, height: 800 };

let pass = 0, fail = 0;
function check(name, ok, extra) {
  if (ok) { pass++; console.log("ok    " + name + (extra ? "  " + extra : "")); }
  else { fail++; console.log("FAIL  " + name + (extra ? "  " + extra : "")); }
}

function serve() {
  return http.createServer((req, res) => {
    const u = decodeURIComponent(req.url.split("?")[0]);
    const f = path.join(ROOT, u === "/" ? "index.html" : u);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end("not found"); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" });
    fs.createReadStream(f).pipe(res);
  });
}

/* The reader's route to a study card with the pen down. The sizes ARE the pen (there is no Draw button),
   and opening the tools deliberately selects nothing — so it is two presses, not one. */
async function penDownOnACard(page, base) {
  await page.goto(base + "#decks", { waitUntil: "load" });
  await page.waitForTimeout(900);
  await page.evaluate(() => {
    const b = document.querySelector("#collection-list-all .collection-add[data-id]");
    if (b && !b.classList.contains("added")) b.click();
  });
  await page.waitForTimeout(300);
  await page.goto(base + "#home", { waitUntil: "load" });
  await page.waitForTimeout(1300);
  await page.evaluate(() => { const b = document.querySelector(".banner .cta .btn"); if (b) b.click(); });
  await page.waitForTimeout(1500);
  await page.evaluate(() => document.querySelector(".wb-toggle").click());
  await page.waitForTimeout(250);
  await page.evaluate(() => document.querySelector(".wb-size").click());
  await page.waitForTimeout(250);
}

/* The measuring kit, installed in the page. Two contacts are dispatched as raw PointerEvents with
   independent ids: `page.touchscreen` cannot hold two down at once, and a synthetic event is the right
   instrument here anyway — what is under test is the handlers' bookkeeping between two pointers, not the
   browser's gesture arbitration (which is what CDP touch input is for, and which `touch-action:none`
   already takes out of the picture on this canvas). */
async function installInk(page) {
  await page.evaluate(() => {
    window.__ink = {
      send(t, id, type, x, y) {
        document.querySelector(".draw-canvas").dispatchEvent(new PointerEvent(t, {
          pointerId: id, pointerType: type, isPrimary: id === 1, bubbles: true, cancelable: true,
          clientX: x, clientY: y, buttons: (t === "pointerup" || t === "pointercancel") ? 0 : 1 }));
      },
      clear() {
        const c = document.querySelector(".draw-canvas"), x = c.getContext("2d");
        x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, c.width, c.height); x.restore();
      },
      // marked pixels per row of the backing store, sampled on a 4px lattice — enough to say WHERE the ink is
      inkAt(y0, y1) {
        const c = document.querySelector(".draw-canvas"), x = c.getContext("2d");
        const d = x.getImageData(0, 0, c.width, c.height).data;
        let n = 0;
        for (let y = Math.max(0, y0); y <= Math.min(c.height - 1, y1); y += 4)
          for (let px = 0; px < c.width; px += 4) if (d[(y * c.width + px) * 4 + 3] > 12) n++;
        return n;
      },
      total() { const c = document.querySelector(".draw-canvas"); return this.inkAt(0, c.height - 1); },
    };
  });
}

(async () => {
  const server = serve();
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port + "/";
  const browser = await chromium.launch({ executablePath: process.env.FOLIO_CHROMIUM || undefined });
  const errs = [];
  const watch = (p) => {
    p.on("pageerror", (e) => errs.push("pageerror: " + e));
    p.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !isNoise(t)) errs.push("console: " + t.slice(0, 300)); });
  };

  const page = await browser.newPage({ viewport: PHONE, hasTouch: true });
  watch(page);
  await penDownOnACard(page, base);
  check("the pen is down over a study card", await page.evaluate(() => !!document.querySelector(".draw-canvas.on")));
  await installInk(page);

  const rect = await page.evaluate(() => document.querySelector(".draw-canvas").getBoundingClientRect().toJSON());
  const dpr = await page.evaluate(() => window.devicePixelRatio || 1);
  const midY = Math.round(rect.top + rect.height * 0.55);   // the pen's row
  const farY = Math.round(rect.top + rect.height * 0.25);   // where the other contact rests
  const bandOf = (clientY, half) => {
    const y = (clientY - rect.top) * dpr;
    return [Math.round(y - half * dpr), Math.round(y + half * dpr)];
  };
  const band = bandOf(midY, 40), away = bandOf(farY, 40);
  const ev = (t, id, type, x, y) => page.evaluate(([a, b, c, d, e]) => window.__ink.send(a, b, c, d, e), [t, id, type, x, y]);
  const ink = (b) => page.evaluate(([a, c]) => window.__ink.inkAt(a, c), b);
  const all = () => page.evaluate(() => window.__ink.total());
  const clear = () => page.evaluate(() => window.__ink.clear());

  /* ================= 1. a palm RESTING beside the pen =================
     In stylus mode a finger is a scroll, and the scroll branch is the first line of the move handler — so
     with no owner the palm's `passScroll` claimed the PEN's later moves and pushed the card up the screen
     instead of marking it. Measured across the palm's arrival, because the ink laid down BEFORE it is
     there either way: it is the growth after that says the pen is still drawing. */
  console.log("\n1. A palm resting beside the pen");
  await clear();
  await ev("pointerdown", 1, "pen", 60, midY);
  await ev("pointermove", 1, "pen", 100, midY);
  const opened = await ink(band);
  await ev("pointerdown", 2, "touch", 300, farY);
  await ev("pointermove", 2, "touch", 310, farY);
  await ev("pointermove", 1, "pen", 200, midY);
  await ev("pointermove", 2, "touch", 320, farY);
  await ev("pointermove", 1, "pen", 300, midY);
  const drew = await ink(band), stray = await ink(away);
  await ev("pointerup", 2, "touch", 320, farY);
  await ev("pointerup", 1, "pen", 300, midY);
  check("the pen keeps drawing while a palm rests beside it", drew > opened,
    JSON.stringify({ atThePalmsArrival: opened, atTheEnd: drew }));
  check("...and lays no ink where the palm is", stray === 0, JSON.stringify({ upWhereThePalmIs: stray }));

  /* ================= 2. a palm LIFTING, and a palm the browser cancels =================
     Both ran `end()` on a stroke that was not theirs. This is the "unable to draw for a few seconds"
     half exactly: the pen never left the screen, and the only way out was to lift it and press again. */
  console.log("\n2. A palm lifting, and a palm the browser rejects");
  await clear();
  await ev("pointerdown", 1, "pen", 60, midY);
  await ev("pointermove", 1, "pen", 90, midY);
  await ev("pointerdown", 3, "touch", 300, farY);
  await ev("pointerup", 3, "touch", 300, farY);
  const beforeUp = await all();
  await ev("pointermove", 1, "pen", 200, midY);
  await ev("pointermove", 1, "pen", 320, midY);
  const afterUp = await all();
  await ev("pointerup", 1, "pen", 320, midY);
  check("the pen goes on drawing after a palm lifts beside it", afterUp > beforeUp,
    JSON.stringify({ before: beforeUp, after: afterUp }));

  await clear();
  await ev("pointerdown", 1, "pen", 60, midY);
  await ev("pointermove", 1, "pen", 90, midY);
  await ev("pointerdown", 4, "touch", 300, farY);
  await ev("pointercancel", 4, "touch", 300, farY);
  const beforeCx = await all();
  await ev("pointermove", 1, "pen", 240, midY);
  const afterCx = await all();
  await ev("pointerup", 1, "pen", 240, midY);
  check("...and after a palm the browser rejects for us", afterCx > beforeCx,
    JSON.stringify({ before: beforeCx, after: afterCx }));

  /* ================= 3. …but a PEN still takes the surface off a finger =================
     The other direction, and the reason the fix is a preemption rather than a plain first-wins rule: the
     palm usually lands FIRST, so a marker that simply ignored the newcomer would leave a stylus reader
     unable to draw at all — which is the same report from the other end. */
  console.log("\n3. …but a pen still takes the surface off a finger");
  await clear();
  await ev("pointerdown", 5, "touch", 200, farY);
  await ev("pointermove", 5, "touch", 200, farY - 20);
  await ev("pointerdown", 1, "pen", 60, midY);
  await ev("pointermove", 1, "pen", 160, midY);
  await ev("pointermove", 1, "pen", 300, midY);
  const penWon = await ink(band);
  await ev("pointerup", 1, "pen", 300, midY);
  await ev("pointerup", 5, "touch", 200, farY - 20);
  check("a pen draws even when a finger landed first", penWon > 0, JSON.stringify({ ink: penWon }));

  /* ================= 4. two fingers on a phone =================
     No stylus has ever touched this device, so a finger IS the pen and neither contact is diverted to the
     scroll — both reached the draw branch, and `WB.last` alternated between them. This is the crooked
     line in its purest form, and it needs a reader with no stylus at all. */
  console.log("\n4. Two thumbs on a phone");
  await page.evaluate(() => localStorage.removeItem("folio_wb_stylus_v1"));
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(1400);
  await page.evaluate(() => document.querySelector(".wb-toggle").click());
  await page.waitForTimeout(250);
  await page.evaluate(() => document.querySelector(".wb-size").click());
  await page.waitForTimeout(250);
  check("a device that has never seen a stylus still draws with a finger",
    await page.evaluate(() => !!document.querySelector(".draw-canvas.on") && !document.querySelector(".draw-canvas.wb-pen-only")));
  await installInk(page);
  await ev("pointerdown", 10, "touch", 60, midY);
  await ev("pointermove", 10, "touch", 120, midY);
  await ev("pointerdown", 11, "touch", 300, farY);
  await ev("pointermove", 11, "touch", 320, farY);
  await ev("pointermove", 10, "touch", 300, midY);
  const oneLine = await ink(band), zigzag = await ink(away);
  await ev("pointerup", 11, "touch", 320, farY);
  await ev("pointerup", 10, "touch", 300, midY);
  check("two thumbs draw one line, not a zigzag between them", oneLine > 0 && zigzag === 0,
    JSON.stringify({ onTheLine: oneLine, upWhereTheOtherThumbIs: zigzag }));

  check("no console errors anywhere", errs.length === 0, errs.slice(0, 4).join(" | "));

  await page.close();
  await browser.close();
  server.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
