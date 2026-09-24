#!/usr/bin/env node
// Regression test for DRAW CARDS — the Flags deck run backwards, where the reader draws the flag from
// memory on a pad and the marker is pinned to its corner (Sep 2026, on request).
//
//   node .claude/test-draw-cards.js [--data-only]
//
// Re-run after touching cardDrawSpec / cardDrawHTML / cardDrawReveal / mountDrawCard / cardFrontHTML's
// draw branch / showAnswer's draw reveal and its answer-box drop / wbPinTo / wbUnpin / wbPinApply /
// wbPinFrame / wbApplyPos / wbMakeDraggable's pinned bail / setupWhiteboard's teardown / hideWBTools /
// gameCardIdSet / IMG_OPEN_SEL / TIP_SEL / serializeCardData / revertCard / whyExempt / the .draw-pad,
// .dp-frame, .dp-answer and .wb-pinned styles / add-card.js's drawCard guards /
// check-questions.js's exemptions / add-draw-cards.js, or after a batch of draw cards.
//
// WHY THIS FILE EXISTS. Every fault this format can have LOOKS FINE ON THE PAGE:
//  · THE MARKER NOT PINNED. A draw card whose marker sat in its usual screen corner is a card that
//    works — you can still draw — and is simply missing the whole of what was asked for. Worse, the pin
//    is applied at MOUNT, when the page's entrance animation still has a third of a second to run, so a
//    pin that is computed once anchors to a rect 32px from where the pad settles. That shipped for an
//    hour and the only symptom was the marker sitting inside the pad instead of above it.
//  · THE PEN NOT DOWN. The reader then has to find the marker, open it and choose a tool before the card
//    can be answered at all — and nothing says so, because the card is drawn correctly.
//  · THE FLAG ON THE FRONT. `drawCard` and `flagCard` say OPPOSITE things about the same `answerFlag`,
//    so a card carrying both, or a front that renders the picture, shows the reader the answer while
//    looking exactly like a working card.
//  · THE PAD MOVING AT THE REVEAL. The ink is on the page-wide whiteboard canvas in PAGE coordinates and
//    is not owned by the pad, so anything that shifts the pad slides the drawing out from under the frame
//    it was drawn in — which reads as the drawing having been corrupted.
//  · THE TWINNING. `fd-NNN` copies `fl-NNN`, which copies `gw-NNN`. A correction made to one of the three
//    and not the others leaves all three rendering perfectly while saying different things.
//  · A BLANK IN THE PROMPT. There is nothing to type here, so a blank would put an ungradeable field on
//    the card and, under the "Answer before revealing" policy, a gate the reader can never pass.
//
// Sections 1 and 2 need no browser (`--data-only`). Playwright is a dev dependency and must NOT be
// installed into the repo: install it in a scratch folder and run with NODE_PATH=<that>/node_modules;
// set FOLIO_CHROMIUM if Chromium lives elsewhere.
const http = require("http"), fs = require("fs"), path = require("path");

const ROOT = path.join(__dirname, "..");
const PORT = 8159;
const MIME = { ".js": "text/javascript", ".css": "text/css", ".html": "text/html", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png" };
const DATA_ONLY = process.argv.includes("--data-only");

let pass = 0, fail = 0;
const ok = (name, cond, extra) => {
  cond ? pass++ : fail++;
  console.log((cond ? "ok   " : "FAIL ") + " " + name + (extra !== undefined ? "  " + JSON.stringify(extra).slice(0, 170) : ""));
};
const sect = (s) => console.log("\n== " + s);

/* A 2:1 PNG, so `load` fires on the LIVE path and the frame holds a picture whose shape is not the
   frame's — the flag suite's own fixture, and for its reason: a draw card's `src` is a Commons URL, so
   without this the suite is a test of whether Wikimedia is reachable. */
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAQAAAACCAIAAADwyuo0AAAAFklEQVR4nGP8//8/AzpgYkAHRIkCAJ0hA/ivbYWlAAAAAElFTkSuQmCC",
  "base64");

const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]).replace(/^\//, "") || "index.html");
  fs.readFile(p, (e, buf) => {
    if (e) { res.writeHead(404); res.end("not found"); return; }
    res.writeHead(200, { "Content-Type": MIME[path.extname(p)] || "application/octet-stream" });
    res.end(buf);
  });
});

(async () => {
  /* ---------- 1. the cards on disk ---------------------------------------------------------- */
  sect("1. the cards on disk");
  global.window = {};
  const { loadCards } = require("./card-io.js");
  const CARDS = loadCards().cards;
  const byId = new Map(CARDS.map((c) => [c.id, c]));
  const draws = CARDS.filter((c) => c.drawCard === true).sort((a, b) => a.id.localeCompare(b.id));
  ok("cards carry `drawCard: true`", draws.length > 0, draws.length + " of " + CARDS.length);
  ok("…and every one of them is an fd- card", draws.every((c) => /^fd-\d{3}$/.test(c.id)),
     draws.filter((c) => !/^fd-\d{3}$/.test(c.id)).map((c) => c.id));

  /* ONE PROMPT SHAPE FOR THE WHOLE DECK, read off the cards rather than restated here. The country's own
     name varies, so what is asserted is the sentence AROUND it: two wordings for one question is the
     reader being asked two questions. */
  const shapes = [...new Set(draws.map((c) => String(c.question || "").replace(/^.*?—/, "—")))];
  ok("…all asking one question, word for word after the name", shapes.length === 1, shapes);

  draws.forEach((c) => {
    const fl = c.answerFlag || {};
    const ansT = String(c.answerText || "~~~");
    ok(c.id + ": the flag is there and is a link", !!fl.src && /^https?:/.test(String(fl.src)));
    ok(c.id + ": …and is credited", String(fl.credit || "").trim().length > 0);
    /* THE PROMPT NAMES WHAT TO DRAW. The whole question is "draw THIS flag", so a prompt that does not
       say whose asks for nothing — and it is exactly what a copy-and-paste from the card above makes. */
    ok(c.id + ": the prompt names the country", String(c.question || "").indexOf(ansT) >= 0, String(c.question || "").slice(0, 60));
    ok(c.id + ": …and carries NO cloze blank", !/class="blank"/.test(String(c.question || "")));
    ok(c.id + ": …and offers no extra phrasings", !Array.isArray(c.questions) || c.questions.length === 0);
    /* ONE FORMAT AT A TIME, and `flagCard` is the one that matters: it would put this card's answer on
       its own question side. */
    ok(c.id + ": …and is one format, not two", !c.map && c.artwork !== true && c.flagCard !== true);
    /* the answer side, which is the Flags twin's, which is World Geography's */
    const t = byId.get("fl-" + c.id.slice(3));
    ok(c.id + ": its Flags twin exists", !!t, "fl-" + c.id.slice(3));
    if (t) {
      ok(c.id + ": …and the background is the twin's, word for word", String(c.abstract || "") === String(t.abstract || ""));
      ok(c.id + ": …and so are the citations", JSON.stringify(c.sources || []) === JSON.stringify(t.sources || []));
      ok(c.id + ": …and the figures grid", JSON.stringify(c.facts || []) === JSON.stringify(t.facts || []));
      ok(c.id + ": …and the date line", String(c.answerDate || "") === String(t.answerDate || ""));
      ok(c.id + ": …and the answer term", String(c.answerText || "") === String(t.answerText || ""));
      ok(c.id + ": …and the same flag file", String(fl.src) === String((t.answerFlag || {}).src || ""));
      ok(c.id + ": …and the same difficulty rating", c.difficulty === t.difficulty, [c.difficulty, t.difficulty]);
      ok(c.id + ": …with the twin's leading kind tag", (c.tags || [])[0] === (t.tags || [])[0], [(c.tags || [])[0], (t.tags || [])[0]]);
    }
    ok(c.id + ": …and a `drawing` tag to group on", (c.tags || []).includes("drawing"), c.tags);
  });

  /* THE THREE DECKS COVER THE SAME ENTITIES AT THE SAME NUMBERS, which is the whole of what "the number
     is the entity and the prefix is the question" means — and the one thing a per-card check cannot see,
     knowing only one card. A draw card shipped at a number its Flags twin does not hold is a card the
     plan and the deck disagree about, and both render. */
  const flagNums = new Set(CARDS.filter((c) => c.flagCard === true).map((c) => c.id.slice(3)));
  const drawNums = new Set(draws.map((c) => c.id.slice(3)));
  const onlyFlag = [...flagNums].filter((n) => !drawNums.has(n));
  const onlyDraw = [...drawNums].filter((n) => !flagNums.has(n));
  ok("every Flags card has a Draw card at its own number", !onlyFlag.length, onlyFlag);
  ok("…and no Draw card stands at a number Flags has not got", !onlyDraw.length, onlyDraw);

  /* ---------- 2. the code that reads them --------------------------------------------------- */
  sect("2. the code that reads them");
  const src = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  const slice = (name) => { const i = src.indexOf("function " + name + "("); return i < 0 ? "" : src.slice(i, i + 2600); };
  const body = (name) => slice(name).split("\n  }")[0];

  ok("cardDrawSpec keys on `drawCard` and reuses answerFlag",
     /function cardDrawSpec\(c\) \{[\s\S]{0,200}c\.drawCard !== true[\s\S]{0,120}answerFlag\(c\)/.test(src));
  ok("cardFrontHTML draws the prompt ABOVE the pad",
     /return cardDrawSpec\(c\) \? q \+ cardDrawHTML\(\) : q;/.test(slice("cardFrontHTML")));
  /* THE FRONT HOLDS THE PICTURE BACK, AS A STRING. The browser half below reads the rendered card and
     this reads the builder, so a leak added at either end is caught by the other. */
  const built = body("cardDrawHTML");
  ok("…and the pad's markup carries no src", !/src/.test(built), built.slice(0, 200));
  ok("…nor a credit", !/credit/.test(built));
  ok("…nor a data-img-* attribute to open the viewer with", !/data-img-/.test(built));
  ok("…and its answer figure ships hidden", /class="dp-answer" hidden/.test(built));
  ok("cardDrawReveal is what creates the image", /createElement\("img"\)/.test(body("cardDrawReveal")) && /img\.src = spec\.src/.test(body("cardDrawReveal")));
  ok("…and credits it there", /data-img-credit/.test(body("cardDrawReveal")));
  const openSel = (src.match(/const IMG_OPEN_SEL = [^\n]+/) || [""])[0];
  ok("…and it opens the viewer only once revealed",
     /\.dp-answer\.revealed/.test(openSel) && !/[^.]\.dp-answer[,"]/.test(openSel), openSel.slice(24));
  const tipSel = (src.match(/const TIP_SEL = [^\n]+/) || [""])[0];
  ok("…and is reachable with the pen down", /\.dp-answer/.test(tipSel), tipSel.slice(16));

  ok("mountDrawCard puts the pen down", /wbSetEnabled\(true\)/.test(body("mountDrawCard")));
  ok("…and pins the marker to the pad", /wbPinTo\(pad\)/.test(body("mountDrawCard")));
  ok("…and says so when the marker is switched off", /markerOn\(\)/.test(body("mountDrawCard")) && /dp-off/.test(body("mountDrawCard")));
  ok("…and is called from renderCard", /mountDrawCard\(cardRoot, c\);/.test(src));
  /* THE PIN FOLLOWS ON A FRAME LOOP. Scroll and resize listeners are not enough and the reason is in the
     header: the page's own entrance animation moves the pad after the pin is applied, and nothing fires
     afterwards to correct it. */
  ok("the pin follows on a frame loop rather than on listeners",
     /requestAnimationFrame\(wbPinFrame\)/.test(src) && /function wbPinFrame\(\)/.test(src));
  ok("…and the loop stops when the pin is dropped", /cancelAnimationFrame\(wbPinRAF\)/.test(body("wbUnpin")));
  ok("…and writes only when the numbers move", /Math\.abs\(wbPinAt\.r - right\) > 0\.5/.test(body("wbPinApply")));
  ok("wbApplyPos gives the pin priority over the stored position",
     /if \(wbPinEl && wbPinEl\.isConnected\) return wbPinApply\(el\);/.test(slice("wbApplyPos")));
  ok("…and clears the class when there is no pin", /el\.classList\.remove\("wb-pinned"\)/.test(slice("wbApplyPos")));
  ok("a pinned marker does not drag", /if \(wbPinEl\) return;/.test(slice("wbMakeDraggable")));
  ok("leaving the card drops the pin", /wbUnpin\(\);/.test(slice("setupWhiteboard")) && /wbUnpin\(\);/.test(slice("hideWBTools")));
  /* AND THE PEN GOES BACK THE WAY IT WAS FOUND. `WB.enabled` persists from card to card, so without this
     the pen the reader never asked for stays down on the ORDINARY card after a draw card — the page under
     an ink canvas and a writing band opened under the question, neither of which they chose. */
  ok("…and the pen state a draw card overrode is restored",
     /if \(wbDrawPrev !== null\) \{ wbSetEnabled\(wbDrawPrev\); wbDrawPrev = null; \}/.test(body("mountDrawCard")) &&
     /if \(wbDrawPrev === null\) wbDrawPrev = WB\.enabled;/.test(body("mountDrawCard")));
  ok("…and dropped when the page is left", /wbDrawForget\(\);/.test(slice("hideWBTools")));

  ok("showAnswer reveals the flag", /cardDrawReveal\(cardRoot, c\);/.test(src));
  ok("…and drops the answer box's duplicate copy",
     /if \(cardDrawSpec\(c\)\) \{ const dup = inner\.querySelector\("\.answer \.av-flag"\); if \(dup\) dup\.remove\(\); \}/.test(src));
  ok("gameCardIdSet keeps draw cards out of the text-only games", /&& !cardDrawSpec\(c\)/.test(src));
  ok("serializeCardData carries `drawCard` through", /o\.drawCard = true/.test(slice("serializeCardData")));
  ok("revertCard restores it", /\.drawCard = p\.drawCard/.test(src));

  const css = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
  /* THE PAD RESERVES THE STRIP ABOVE ITSELF FOR THE MARKER. Without it the 46px button lies over the last
     line of the prompt, which is the sentence naming what to draw. */
  ok("the pad reserves room above itself for the marker", /\.draw-pad\{margin:5\d+px/.test(css) || /\.draw-pad\{margin:\s*\d\dpx/.test(css), (css.match(/\.draw-pad\{[^}]*\}/) || [""])[0]);
  ok("…and the writing band stands down on a draw card", /body\.wb-down \.study-card\.draw-card \.scratch\{display:none;\}/.test(css));
  ok("…and a pinned marker does not ease towards the grade bar", /\.wb-tools\.wb-pinned\{transition:none;\}/.test(css));
  ok("…and the answer figure is hidden until the reveal", /\.dp-answer\[hidden\]\{display:none;\}/.test(css));
  /* THE FLAG IS CONTAINED AND NEVER CROPPED — the flag card's own rule, and the same reason: ratios run
     1:1 to 11:28 and Nepal's is not a rectangle. */
  ok("…and the revealed flag is contained, never cropped", /\.dp-answer img\{[^}]*object-fit:contain/.test(css));

  const links = fs.readFileSync(path.join(__dirname, "card-links.js"), "utf8");
  ok("whyExempt covers a draw card", /card\.drawCard === true/.test(links));
  const cq = fs.readFileSync(path.join(__dirname, "check-questions.js"), "utf8");
  ok("check-questions exempts it from the blank rule", /if \(!isDraw && !BLANK_RX\.test\(q\)\)/.test(cq));
  ok("…and fails one that carries a blank anyway", /if \(isDraw && BLANK_RX\.test\(q\)\)/.test(cq));
  const ac = fs.readFileSync(path.join(__dirname, "add-card.js"), "utf8");
  ok("add-card refuses a card that is both a draw card and a flag card", /a draw card, a flag card, a map card or an artwork card/.test(ac));
  ok("…and one whose prompt carries a blank", /a draw card's prompt carries NO cloze blank/.test(ac));
  ok("…and one whose prompt does not name the country", /the whole question is/.test(ac));

  if (DATA_ONLY) { finish(); return; }

  /* ---------- 3. the card in a browser ------------------------------------------------------ */
  sect("3. the card in a browser");
  const { chromium } = require("playwright");
  const { isNoise } = require("./test-noise.js");
  server.listen(PORT);
  const browser = await chromium.launch(process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 430, height: 950 } });
  await ctx.route(/wikimedia\.org/, (r) => r.fulfill({ status: 200, contentType: "image/png", body: PNG }));
  const id = draws[0].id;
  await ctx.addInitScript((cid) => {
    localStorage.setItem("folio_tour_v1", "1");
    localStorage.setItem("folio_marker_tour_v1", "1");
    sessionStorage.setItem("folio_study_v1", JSON.stringify({ scope: { type: "card", id: cid }, queue: [cid], id: cid, qi: 0, rev: false, studied: 0 }));
  }, id);
  const page = await ctx.newPage();
  const errs = [];
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errs.push(m.text()); });
  page.on("pageerror", (e) => { if (!isNoise(e.message)) errs.push("PAGEERROR " + e.message); });
  await page.goto(`http://127.0.0.1:${PORT}/#study`, { waitUntil: "load" });
  await page.waitForSelector(".draw-pad", { timeout: 20000 });
  await page.waitForTimeout(900);   // past the page's entrance animation — see the header

  const front = await page.evaluate(() => {
    const q = document.querySelector(".question");
    return { html: q.innerHTML, text: q.textContent, imgs: q.querySelectorAll("img").length,
             answerBox: !!document.querySelector("#revealInner .answer") };
  });
  const ansT = draws[0].answerText;
  ok("the front carries no picture at all", front.imgs === 0);
  ok("…and no credit", front.html.indexOf("Wikimedia") < 0 && front.html.indexOf("data-img-") < 0);
  ok("…and the prompt names the country", front.text.indexOf(ansT) >= 0, front.text.trim().slice(0, 70));
  ok("…and nothing has revealed the answer box", !front.answerBox);

  const geo = await page.evaluate(() => {
    const pad = document.querySelector(".draw-pad").getBoundingClientRect();
    const t = document.querySelector(".wb-tools"), r = t.getBoundingClientRect();
    return { padTop: pad.top, padRight: pad.right, padWidth: pad.width,
             mBottom: r.bottom, mRight: r.right,
             pinned: t.classList.contains("wb-pinned"), shown: t.classList.contains("show"),
             penDown: document.body.classList.contains("wb-down"),
             canvas: !!document.querySelector(".draw-canvas.on"),
             scratch: getComputedStyle(document.querySelector("#scratch")).display,
             cardW: document.querySelector(".study-card").getBoundingClientRect().width };
  });
  ok("the marker is showing and pinned", geo.shown && geo.pinned, geo);
  ok("…at the pad's right edge", Math.abs(geo.mRight - geo.padRight) < 2, [geo.mRight, geo.padRight]);
  ok("…and ABOVE the pad, not inside it", geo.mBottom <= geo.padTop && geo.padTop - geo.mBottom < 12,
     [geo.mBottom, geo.padTop]);
  ok("the pen is down without the reader choosing a tool", geo.penDown && geo.canvas);
  ok("…and the writing band stands down", geo.scratch === "none", geo.scratch);
  /* THE PAD FITS THE CARD. `aspect-ratio` beside a `min-height` inflated the used WIDTH past the card's
     own edge, which took the card's border off the screen with it. */
  ok("the pad fits inside the card", geo.padWidth <= geo.cardW, [geo.padWidth, geo.cardW]);

  /* A STROKE INSIDE THE PAD LANDS AS INK. Drawing is the whole of this format, so "it did not draw" is
     the one failure that makes the card useless — and it says nothing on the page. */
  const pad = await page.locator(".draw-pad .dp-frame").boundingBox();
  const inkAt = () => page.evaluate(() => {
    const c = document.querySelector(".draw-canvas");
    const x = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
    let n = 0; for (let i = 3; i < x.length; i += 4) if (x[i] > 8) n++;
    return n;
  });
  ok("the pad is blank before anything is drawn", (await inkAt()) === 0);
  await page.mouse.move(pad.x + 30, pad.y + 40);
  await page.mouse.down();
  await page.mouse.move(pad.x + 220, pad.y + 60, { steps: 14 });
  await page.mouse.up();
  await page.waitForTimeout(200);
  const ink = await inkAt();
  ok("…and a stroke drawn in it is ink", ink > 200, ink);

  /* ---------- 4. the reveal ----------------------------------------------------------------- */
  sect("4. the reveal");
  const padTopBefore = await page.evaluate(() => document.querySelector(".draw-pad").getBoundingClientRect().top + window.scrollY);
  /* The ink canvas covers the page with the pen down, and Playwright's actionability check reads that as
     the button being obscured — which is exactly the state the app's own pass-through hit-test is written
     for. So drive a real press rather than click(). */
  const rb = await page.getByRole("button", { name: /reveal/i }).first().boundingBox();
  await page.mouse.move(rb.x + rb.width / 2, rb.y + rb.height / 2);
  await page.mouse.down(); await page.mouse.up();
  await page.waitForTimeout(500);
  /* WAIT FOR THE PICTURE, DO NOT SLEEP AT IT. It is created at the reveal rather than being in the
     markup, so a fixed pause races a decode and reports `naturalWidth: 0` — which reads exactly like a
     dead file, the one thing this section is here to tell apart. */
  await page.waitForFunction(() => {
    const i = document.querySelector(".dp-answer img");
    return i && i.complete && i.naturalWidth > 0;
  }, null, { timeout: 10000 }).catch(() => {});

  const after = await page.evaluate(() => {
    const f = document.querySelector(".dp-answer"), img = f && f.querySelector("img");
    return { revealed: !!f && f.classList.contains("revealed"), hidden: !!f && f.hidden,
             natural: img ? img.naturalWidth : 0, credit: f ? f.getAttribute("data-img-credit") : null,
             role: f ? f.getAttribute("role") : null,
             dup: !!document.querySelector("#revealInner .answer .av-flag"),
             answerBox: !!document.querySelector("#revealInner .answer"),
             padTop: document.querySelector(".draw-pad").getBoundingClientRect().top + window.scrollY,
             gradeBar: !!document.querySelector("#gradebar") };
  });
  ok("the flag is drawn, and is a real file rather than a broken one", after.revealed && !after.hidden && after.natural > 0, after);
  ok("…and is credited, in the viewer", !!after.credit && after.credit.indexOf("Wikimedia") >= 0);
  ok("…and can be opened", after.role === "button");
  ok("…and the answer box carries no second copy of it", !after.dup);
  ok("…while the answer box itself is there", after.answerBox);
  ok("…and the reader grades themselves on the ordinary bar", after.gradeBar);
  /* THE PAD DOES NOT MOVE. The ink is in page coordinates, so a pad that shifted would slide the
     drawing out from under the frame it was drawn in. */
  ok("the pad has not moved, so the drawing still sits in it", Math.abs(after.padTop - padTopBefore) < 1,
     [padTopBefore, after.padTop]);
  const inkAfter = await inkAt();
  ok("…and the ink is still there", inkAfter > 200, inkAfter);

  /* ---------- 5. and the pin is dropped when the card is ------------------------------------ */
  sect("5. and the pin is dropped when the card is");
  await page.evaluate(() => { location.hash = "#settings"; });
  await page.waitForTimeout(700);
  const gone = await page.evaluate(() => {
    const t = document.querySelector(".wb-tools");
    return { pinned: !!t && t.classList.contains("wb-pinned"), shown: !!t && t.classList.contains("show"),
             penDown: document.body.classList.contains("wb-down") };
  });
  ok("the marker is unpinned once the card is gone", !gone.pinned, gone);
  ok("…and the pen is back up", !gone.penDown);

  /* AND AN ORDINARY CARD AFTER A DRAW CARD GETS THE PEN BACK UP — which is the case `hideWBTools` does
     NOT cover, and the one this is really about: within ONE session `WB.enabled` persists from card to
     card, so the pen the reader never asked for would stay down on whatever comes next. The two cards
     have to be in one QUEUE and the first GRADED; navigating away and back goes through `hideWBTools`,
     which puts the pen up for its own reasons and would pass whether or not the restore works. */
  const plainId = CARDS.filter((c) => c.drawCard !== true && c.flagCard !== true && !c.map && c.artwork !== true && c.question)[0].id;
  /* THE RECORD IS WRITTEN AFTER LANDING ON HOME, NEVER BEFORE. `route()` clears the study session on
     every navigation whose page is not `study` — one choke point, by design — so a record written before
     the hop is wiped by the hop, and the study page then goes home for want of one. */
  await page.evaluate(() => { location.hash = "#home"; });
  await page.waitForTimeout(500);
  await page.evaluate((ids) => {
    sessionStorage.setItem("folio_study_v1", JSON.stringify({ scope: { type: "ids", ids: ids }, queue: ids, id: ids[0], qi: 0, rev: false, studied: 0 }));
    location.hash = "#study";
  }, [draws[0].id, plainId]);
  await page.waitForSelector(".draw-pad", { timeout: 20000 });
  await page.waitForTimeout(800);
  ok("a draw card puts the pen down again on the way back in",
     await page.evaluate(() => document.body.classList.contains("wb-down")));

  const press = async (re) => {
    const b = await page.getByRole("button", { name: re }).first().boundingBox();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
    await page.mouse.down(); await page.mouse.up();
  };
  await press(/reveal/i);
  await page.waitForTimeout(600);
  await press(/^good/i);
  await page.waitForTimeout(900);
  const next = await page.evaluate(() => ({
    pad: !!document.querySelector(".draw-pad"),
    penDown: document.body.classList.contains("wb-down"),
    pinned: !!document.querySelector(".wb-tools.wb-pinned"),
    scratch: (document.querySelector("#scratch") || {}) && getComputedStyle(document.querySelector("#scratch") || document.body).display }));
  ok("…and the next card in the SAME session has the pen back up", !next.pad && !next.penDown && !next.pinned, next);

  ok("no console errors", errs.length === 0, errs.slice(0, 4));
  await browser.close();
  finish();

  function finish() {
    server.close();
    console.log(`\n${pass} passed, ${fail} failed`);
    process.exit(fail ? 1 : 0);
  }
})().catch((e) => { console.error(e); process.exit(1); });
