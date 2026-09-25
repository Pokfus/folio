#!/usr/bin/env node
// Regression test for DRAW CARDS — the Flags deck run backwards, where the reader draws the flag from
// memory on a pad with its own tools (Sep 2026, on request).
//
//   node .claude/test-draw-cards.js [--data-only]
//
// Re-run after touching cardDrawSpec / cardDrawHTML / cardDrawReveal / mountDrawCard / DP / DP_COLORS /
// DP_SIZE_MIN / DP_SIZE_MAX / DP_BTNS / .dp-size-range / setupWhiteboard's padUnder / _dpFwd / DP_ICON / dpStop / cardFrontHTML's draw branch / showAnswer's draw reveal and its
// answer-box drop / gameCardIdSet / IMG_OPEN_SEL / TIP_SEL / serializeCardData / revertCard / whyExempt /
// the .draw-pad, .dp-tools, .dp-frame, .dp-canvas and .dp-answer styles / add-card.js's drawCard guards /
// check-questions.js's exemptions / add-draw-cards.js, or after a batch of draw cards.
//
// WHY THIS FILE EXISTS. Every fault this format can have LOOKS FINE ON THE PAGE:
//  · THE CANVAS NOT SIZED FROM LAYOUT. `getBoundingClientRect` is transform-aware and the page's entrance
//    animation SCALES `.page` for its first third of a second, so a canvas sized from a rect at mount
//    comes out several pixels narrow and STAYS that way — a transform changes no layout box, so the
//    ResizeObserver never fires to correct it. Measured before the fix: 349px of canvas inside a 355.6px
//    frame, a white strip down the right of every pad, on a card that otherwise works perfectly.
//  · THE INK NOT BOUNDED. "Only be used within that canvas" is the whole of what separates this from the
//    floating marker, and a stroke that escaped would look like the marker working.
//  · FILL NOT FILLING, OR NOT BEING UNDOABLE. A fill that covers the canvas and cannot be taken back is
//    one mis-press away from destroying a drawing, and the card would look fine having done it.
//  · THE FLOATING MARKER DRAGGED INTO THIS. It is deliberately separate: not pinned, and its pen NOT put
//    down for the reader, since the card has a tool of its own. A pen forced down here would lay the
//    page-wide ink canvas over the pad and make the pad unreachable.
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
  /* THE WHOLE FUNCTION, not a fixed window. `slice` caps at 2,600 characters, which is fine for the small
     accessors and silently truncates `mountDrawCard` — so assertions about its second half passed or
     failed on whether the function happened to be short, which is not a fact about the code. */
  const fn = (name) => {
    const i = src.indexOf("function " + name + "(");
    if (i < 0) return "";
    const j = src.indexOf("\n  }", i);
    return j < 0 ? src.slice(i) : src.slice(i, j);
  };
  const body = (name) => fn(name) || slice(name).split("\n  }")[0];

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

  /* THE PAD IS ITS OWN CANVAS WITH ITS OWN MENU, and the floating marker is not involved at all — see
     the DRAW CARDS block for why the first cut (a frame over the page-wide whiteboard) could not answer
     "only be used within that canvas" or hold a fill. */
  ok("mountDrawCard builds the pad's own canvas", /getContext\("2d"\)/.test(body("mountDrawCard")));
  ok("…sized from LAYOUT, never from a transform-aware rect",
     /frame\.clientWidth/.test(body("mountDrawCard")) && /frame\.clientHeight/.test(body("mountDrawCard")));
  ok("…and in device pixels, with the context scaled", /devicePixelRatio/.test(body("mountDrawCard")) && /setTransform\(dpr, 0, 0, dpr, 0, 0\)/.test(body("mountDrawCard")));
  ok("…with a fill that covers the whole canvas in the chosen colour",
     /ctx\.fillStyle = DP\.color; ctx\.fillRect\(0, 0, w, h\)/.test(body("mountDrawCard")));
  ok("…an eraser that erases rather than painting the paper",
     /destination-out/.test(body("mountDrawCard")));
  ok("…and an undo stack with a blank base to return to",
     /DP_HIST_MAX/.test(src) && /if \(!hist\.length\) snap\(\)/.test(body("mountDrawCard")));
  ok("…and it is torn down when the next card mounts", /if \(dpStop\) \{ dpStop\(\); dpStop = null; \}/.test(body("mountDrawCard")));
  ok("…and is called from renderCard", /mountDrawCard\(cardRoot, c\);/.test(src));
  /* THE FLOATING MARKER IS LEFT ALONE, which is the request. Asserted as an ABSENCE in the source as
     well as in the browser below: a pin or a forced pen-down added back would be invisible in review. */
  /* ANY COLOUR. The site has already decided against `<input type="color">` — its platform dialog on a
     phone is a full-screen sheet of sliders over the very card being answered — and `test-layout.js` has
     asserted for a month that none is left in the marker's panel. This is the same refusal one surface
     on, so it is asserted in the source AND in the rendered card below. */
  ok("the menu carries a colour picker rather than a platform dialog",
     /class="dp-pick"/.test(body("cardDrawHTML")) && !/input type="color"/.test(body("cardDrawHTML")));
  ok("…built on the marker's own HSV helpers rather than a second copy",
     /hexToHSV\(dpReadCustom\(\)\)/.test(body("mountDrawCard")) && /hsvToHex\(pickHSV\.h/.test(body("mountDrawCard")));
  /* THE PICKER KEEPS ITS OWN HSV rather than re-deriving it from the hex on each move: at v=0 or s=0 a
     colour has NO recoverable hue, so a reader dragging into the black corner and back out would come
     back red however they arrived. */
  ok("…keeping its own HSV, never re-derived from the hex mid-drag",
     /let pickHSV = hexToHSV/.test(body("mountDrawCard")) && !/pickHSV = hexToHSV\(DP\.color\)/.test(body("mountDrawCard")));
  ok("…and the mixed colour is remembered between sessions", /localStorage\.setItem\(DP_CUSTOM_KEY/.test(src));
  /* IT IS POINTER-ONLY, unlike the marker's, which takes arrow keys because the control it replaced was
     a real `<input>`. Here the whole menu is `aria-hidden` with `tabindex="-1"`, so a focusable field
     would be the tab-stop-that-leads-nowhere fault that pairing exists to avoid. */
  ok("…and adds no focusable field to an aria-hidden menu", !/setAttribute\("tabindex", "0"\)/.test(body("mountDrawCard")));
  ok("the floating marker is not pinned to anything", !/wbPinTo|wbPinApply|wbPinFrame|wbUnpin/.test(src));
  ok("…and the pen is not put down for the reader", !/wbSetEnabled\(true\)/.test(body("mountDrawCard")));

  ok("showAnswer reveals the flag", /cardDrawReveal\(cardRoot, c\);/.test(src));
  ok("…and drops the answer box's duplicate copy",
     /if \(cardDrawSpec\(c\)\) \{ const dup = inner\.querySelector\("\.answer \.av-flag"\); if \(dup\) dup\.remove\(\); \}/.test(src));
  ok("gameCardIdSet keeps draw cards out of the text-only games", /&& !cardDrawSpec\(c\)/.test(src));
  ok("serializeCardData carries `drawCard` through", /o\.drawCard = true/.test(slice("serializeCardData")));
  ok("revertCard restores it", /\.drawCard = p\.drawCard/.test(src));

  const css = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
  /* THE CANVAS TAKES THE GESTURE. Without `touch-action:none` the browser claims a finger's drag as a
     scroll the moment it passes its own slop and fires `pointercancel` — the fault this stylesheet
     records against every horizontal swipe on the site, here wanted rather than avoided. */
  ok("the canvas takes a finger's gesture rather than the page's scroll", /\.dp-canvas\{[^}]*touch-action:none/.test(css));
  ok("…and the frame clips what is drawn in it", /\.dp-frame\{[^}]*overflow:hidden/.test(css));
  ok("…and the menu sits on the canvas's top edge", /\.dp-tools\{[^}]*border-radius:10px 10px 0 0/.test(css));
  ok("…and the writing band stands down on a draw card", /body\.wb-down \.study-card\.draw-card \.scratch\{display:none;\}/.test(css));
  ok("…and no rule is left pinning the marker", !/wb-pinned/.test(css));
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
    const fr = document.querySelector(".dp-frame");
    const cv = document.querySelector(".dp-canvas"), cr = cv.getBoundingClientRect();
    const t = document.querySelector(".wb-tools");
    return { padWidth: pad.width,
             cardW: document.querySelector(".study-card").getBoundingClientRect().width,
             cvW: Math.round(cr.width), frW: fr.clientWidth,
             bitmapW: cv.width, dpr: window.devicePixelRatio || 1,
             tools: document.querySelectorAll(".dp-tools .dp-btn").length,
             cols: document.querySelectorAll(".dp-tools .dp-col").length,
             hasFill: !!document.querySelector('[data-dp="fill"]'),
             white: !!document.querySelector('.dp-tools [data-dpcol="#FFFFFF"]'),
             slider: !!document.querySelector('.dp-tools input.dp-size-range[type="range"]'),
             brushBtn: !!document.querySelector('[data-dp="brush"]'),
             undoOff: document.querySelector('[data-dp="undo"]').disabled,
             markerShown: !!t && t.classList.contains("show"),
             markerPinned: !!t && t.classList.contains("wb-pinned"),
             penDown: document.body.classList.contains("wb-down"),
             pageInk: !!document.querySelector(".draw-canvas.on"),   // the canvas exists either way; `.on` is the pen
             menuHidden: document.querySelector(".dp-tools").getAttribute("aria-hidden") === "true",
             tabbable: [...document.querySelectorAll(".dp-tools button, .dp-pick *")].filter((b) => b.tabIndex >= 0).length,
             swatch: (document.querySelector(".dp-custom") || {}).dataset && document.querySelector(".dp-custom").dataset.dpcol,
             pickShut: document.querySelector(".dp-pick").hidden,
             platformDialogs: document.querySelectorAll('input[type="color"]').length,
             scratch: getComputedStyle(document.querySelector("#scratch")).display };
  });
  /* THE PAD FITS THE CARD. `aspect-ratio` beside a `min-height` inflated the used WIDTH past the card's
     own edge, which took the card's border off the screen with it. */
  ok("the pad fits inside the card", geo.padWidth <= geo.cardW, [geo.padWidth, geo.cardW]);
  /* AND THE CANVAS FILLS THE FRAME. Sized from a transform-aware rect at mount it came out several px
     narrow and stayed that way — see the header. Compared against the frame's own LAYOUT width. */
  ok("…and the canvas fills its frame", Math.abs(geo.cvW - geo.frW) <= 1, [geo.cvW, geo.frW]);
  ok("…with a bitmap in device pixels", geo.bitmapW >= Math.round(geo.cvW * Math.min(geo.dpr, 3)) - 2,
     [geo.bitmapW, geo.cvW, geo.dpr]);
  ok("the menu carries its colours and its five tools", geo.cols >= 4 && geo.tools === 5, [geo.cols, geo.tools]);
  ok("…white among the default colours", geo.white);
  ok("…and a brush-size slider in place of the two fixed pens", geo.slider && !geo.brushBtn, [geo.slider, geo.brushBtn]);
  ok("…including a fill", geo.hasFill);
  ok("…and a sixth swatch that is the reader's own colour", /^#[0-9a-f]{6}$/i.test(geo.swatch || ""), geo.swatch);
  ok("…whose field is shut until it is asked for", geo.pickShut);
  ok("…and is the site's own picker, not a platform dialog", geo.platformDialogs === 0);
  ok("…and Undo is dead until there is something to undo", geo.undoOff);
  /* AN `aria-hidden` CONTAINER WHOSE CHILDREN ARE STILL FOCUSABLE is the one arrangement worse than
     either choice: a keyboard reader tabs onto a control their screen reader has been told does not
     exist, and lands on it silently. Hidden and out of the tab order is one statement. */
  ok("…and the menu is hidden from assistive tech AND out of the tab order",
     geo.menuHidden && geo.tabbable === 0, [geo.menuHidden, geo.tabbable]);
  /* THE FLOATING MARKER IS SEPARATE, which is the request: it is still offered, it is NOT pinned to the
     pad, and its pen is NOT put down — a pen forced down here would lay the page-wide ink canvas over
     the pad and make the pad itself unreachable. */
  ok("the floating marker is offered and left alone", geo.markerShown && !geo.markerPinned, geo);
  ok("…with its pen up, so the pad is reachable", !geo.penDown && !geo.pageInk);
  ok("…and the writing band stands down", geo.scratch === "none", geo.scratch);

  /* A STROKE INSIDE THE PAD LANDS AS INK ON THE PAD'S OWN CANVAS. Drawing is the whole of this format,
     so "it did not draw" is the one failure that makes the card useless — and it says nothing on the
     page. The counts are read off the pad's canvas, never the marker's. */
  const read = () => page.evaluate(() => {
    const c = document.querySelector(".dp-canvas");
    const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
    let any = 0, dark = 0, green = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] <= 8) continue;
      any++;
      if (d[i] < 80 && d[i + 1] < 80 && d[i + 2] < 80) dark++;
      if (d[i] < 120 && d[i + 1] > 130 && d[i + 2] < 130) green++;
    }
    /* `px` is ANY ink and is what a stroke is counted by: the pad opens on the marker's own first colour,
       which is a red, so a check for DARK pixels measures which swatch was pressed rather than whether
       anything was drawn. */
    return { pct: Math.round((100 * any) / (c.width * c.height)), px: any, dark, green };
  });
  ok("the pad is blank before anything is drawn", (await read()).pct === 0);
  /* THE BOX IS RE-READ ON EVERY STROKE, not captured once. Opening the colour picker inserts a row
     between the menu and the canvas and pushes the canvas DOWN — which is free for the drawing, the ink
     being on the canvas rather than in page coordinates, and is not free for a fixture holding a stale
     rect: the stroke lands on the menu instead and the canvas reads back empty, which looks exactly like
     drawing having stopped working. */
  const drawStroke = async () => {
    const cbox = await page.locator(".dp-canvas").boundingBox();
    await page.mouse.move(cbox.x + 30, cbox.y + 40);
    await page.mouse.down();
    await page.mouse.move(cbox.x + cbox.width - 40, cbox.y + 70, { steps: 14 });
    await page.mouse.up();
    await page.waitForTimeout(150);
  };
  await drawStroke();
  const drew = await read();
  ok("…and a stroke drawn in it is ink on the PAD's canvas", drew.px > 200, drew);
  ok("…and the hint gets out of its way",
     (await page.evaluate(() => getComputedStyle(document.querySelector(".dp-hint")).opacity)) === "0");

  /* FILL COVERS THE WHOLE CANVAS IN THE CHOSEN COLOUR, and is undoable — "fill the whole canvas a
     particular color" is literal, so a mis-press has to cost one press rather than a drawing. */
  await page.click('[data-dpcol="#4F9D67"]');
  await page.click('[data-dp="fill"]');
  await page.waitForTimeout(150);
  const filled = await read();
  ok("fill covers the whole canvas", filled.pct === 100, filled);
  ok("…in the colour chosen", filled.green > 1000, filled.green);
  await page.click('[data-dp="undo"]');
  await page.waitForTimeout(150);
  const unfilled = await read();
  ok("…and undo takes the fill back, leaving the stroke", unfilled.pct < 100 && unfilled.px > 200, unfilled);
  await page.click('[data-dp="clear"]');
  await page.waitForTimeout(150);
  ok("…and clear empties it", (await read()).pct === 0);

  /* WHITE IS A COLOUR, NOT AN ERASER: a white fill is paint on every pixel, where the eraser leaves the
     canvas transparent — the difference between a white field and a hole. */
  await page.click('[data-dpcol="#FFFFFF"]');
  await page.click('[data-dp="fill"]');
  await page.waitForTimeout(150);
  const whiteFill = await page.evaluate(() => {
    const c = document.querySelector(".dp-canvas");
    const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
    let white = 0, n = 0;
    for (let i = 0; i < d.length; i += 4) { n++; if (d[i + 3] > 250 && d[i] > 250 && d[i + 1] > 250 && d[i + 2] > 250) white++; }
    return Math.round((100 * white) / n);
  });
  ok("a white fill paints every pixel white", whiteFill === 100, whiteFill);
  await page.click('[data-dp="clear"]');
  await page.click('[data-dpcol="#1B1A17"]');
  await page.waitForTimeout(100);

  /* THE SLIDER REALLY CHANGES THE STROKE, and widely. The same stroke is drawn at the two ends of the
     range and its ink is counted: a slider that moved its thumb and not `DP.size` would read equal. */
  const setSize = (v) => page.evaluate((v) => {
    const r = document.querySelector(".dp-size-range");
    r.value = String(v); r.dispatchEvent(new Event("input", { bubbles: true }));
  }, v);
  await setSize(1);
  await drawStroke();
  const thin = (await read()).px;
  await page.click('[data-dp="clear"]');
  await setSize(60);
  await drawStroke();
  const thick = (await read()).px;
  await page.click('[data-dp="clear"]');
  ok("the size slider takes the stroke from a hairline to a broad band", thick > thin * 15, [thin, thick]);
  await setSize(4);
  await page.waitForTimeout(100);

  /* ANY COLOUR, END TO END. The picker is what makes "any color can be used" true rather than intended,
     and every step of it fails quietly: a field that does not move the hex, a hex that does not reach
     `DP.color`, or a colour that is not what the pen then draws with. The last is checked by counting
     the stroke's own pixels against the hex the field settled on. */
  await page.click(".dp-custom");
  await page.waitForTimeout(250);
  const opened = await page.evaluate(() => ({ shut: document.querySelector(".dp-pick").hidden,
    picking: document.querySelector(".draw-pad").classList.contains("dp-picking"),
    sel: document.querySelector(".dp-custom").classList.contains("on") }));
  ok("pressing the sixth swatch opens the field and selects the colour", !opened.shut && opened.picking && opened.sel, opened);
  const hue = await page.locator(".dp-pick .wb-hue").boundingBox();
  await page.mouse.move(hue.x + hue.width * 0.55, hue.y + hue.height / 2);
  await page.mouse.down(); await page.mouse.up();
  await page.waitForTimeout(120);
  const svBox = await page.locator(".dp-pick .wb-sv").boundingBox();
  await page.mouse.move(svBox.x + svBox.width * 0.85, svBox.y + svBox.height * 0.2);
  await page.mouse.down();
  await page.mouse.move(svBox.x + svBox.width * 0.9, svBox.y + svBox.height * 0.15, { steps: 6 });
  await page.mouse.up();
  await page.waitForTimeout(200);
  const mixed = await page.evaluate(() => ({ hex: document.querySelector(".wb-hex").textContent,
    swatch: document.querySelector(".dp-custom").dataset.dpcol,
    stored: localStorage.getItem("folio_dp_custom_v1") }));
  ok("…dragging its fields mixes a colour none of the five is",
     /^#[0-9A-F]{6}$/.test(mixed.hex) && !["#D9544C", "#4F74C2", "#1B1A17", "#4F9D67", "#DB8B3A"].includes(mixed.hex), mixed);
  ok("…which the swatch and the store both follow",
     mixed.swatch.toLowerCase() === mixed.hex.toLowerCase() && (mixed.stored || "").toLowerCase() === mixed.hex.toLowerCase(), mixed);
  await drawStroke();
  const inColour = await page.evaluate((want) => {
    const c = document.querySelector(".dp-canvas");
    const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
    const n = parseInt(want.slice(1), 16), R = (n >> 16) & 255, G = (n >> 8) & 255, B = n & 255;
    let hit = 0, any = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 200) continue;
      any++;
      if (Math.abs(d[i] - R) < 12 && Math.abs(d[i + 1] - G) < 12 && Math.abs(d[i + 2] - B) < 12) hit++;
    }
    return { any, hit };
  }, mixed.hex.toLowerCase());
  ok("…and the pen then draws in it", inColour.any > 200 && inColour.hit === inColour.any, inColour);
  await page.click(".dp-custom");   // shut the field again
  await page.waitForTimeout(150);
  ok("…and pressing the swatch again shuts the field, keeping the colour",
     await page.evaluate(() => document.querySelector(".dp-pick").hidden && document.querySelector(".dp-custom").classList.contains("on")));
  await page.click('[data-dp="clear"]');
  await page.waitForTimeout(150);

  /* THE PAD'S MENU GOES ON WORKING WITH THE FLOATING PEN DOWN, which is the claim that makes "the two do
     not interfere" true rather than merely intended. With the pen down the marker's canvas covers the
     whole visible page, so the only thing keeping these buttons pressable is that they are real
     `<button>`s and `CTL_SEL` hit-tests through to them — asserted by PRESSING one, not by reading the
     selector. Driven as a real press, since Playwright's actionability check reads the ink canvas as the
     button being obscured, which is exactly the state that hit-test is written for. */
  await page.locator(".wb-tools .wb-toggle").click();          // open the panel
  await page.waitForTimeout(300);
  await page.locator(".wb-panel .wb-size").first().click();    // choosing a tool is what puts the pen down
  await page.waitForTimeout(300);
  const penDown = await page.evaluate(() => ({
    down: document.body.classList.contains("wb-down"),
    ink: !!document.querySelector(".draw-canvas.on") }));
  ok("the floating pen can still be put down over a draw card", penDown.down && penDown.ink, penDown);
  const fillBtn = await page.locator('[data-dp="fill"]').boundingBox();
  await page.mouse.move(fillBtn.x + fillBtn.width / 2, fillBtn.y + fillBtn.height / 2);
  await page.mouse.down(); await page.mouse.up();
  await page.waitForTimeout(250);
  ok("…and the pad's own menu still answers a press through the ink layer", (await read()).pct === 100);
  await page.mouse.move(fillBtn.x + fillBtn.width / 2, fillBtn.y + fillBtn.height / 2);
  const clr = await page.locator('[data-dp="clear"]').boundingBox();
  await page.mouse.move(clr.x + clr.width / 2, clr.y + clr.height / 2);
  await page.mouse.down(); await page.mouse.up();
  await page.waitForTimeout(150);
  /* …AND THE FLOATING MARKER DOES NOT DRAW INSIDE THE PAD (Sep 2026, on request). With the pen down a
     stroke over the pad is forwarded to the PAD's canvas, and the page-wide ink layer stays empty. */
  const inkPx = () => page.evaluate(() => {
    const c = document.querySelector(".draw-canvas");
    if (!c || !c.width || !c.height) return 0;
    const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
    let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 8) n++;
    return n;
  });
  const floatBefore = await inkPx();
  await drawStroke();
  const padAfter = await read(), floatAfter = await inkPx();
  ok("with the floating pen down, a stroke over the pad lands on the PAD", padAfter.px > 200, padAfter);
  ok("…and the floating marker's own ink layer takes none of it", floatAfter === floatBefore, [floatBefore, floatAfter]);
  const clr2 = await page.locator('[data-dp="clear"]').boundingBox();
  await page.mouse.move(clr2.x + clr2.width / 2, clr2.y + clr2.height / 2);
  await page.mouse.down(); await page.mouse.up();
  await page.waitForTimeout(150);
  /* …and the pen goes back up the way a reader puts it up: pressing the SELECTED tool again, which is
     the panel's own rule now that closing it no longer does. Closing the panel is not enough — that was
     the first attempt, and every press after it timed out against an ink canvas still covering the page,
     which is the behaviour working rather than a fault. */
  await page.locator(".wb-panel .wb-size").first().click({ force: true });
  await page.waitForTimeout(250);
  ok("…and putting it back up leaves the pad to its own tools again",
     !(await page.evaluate(() => document.body.classList.contains("wb-down"))));
  await page.locator(".wb-tools .wb-toggle").click();   // shut the panel
  await page.waitForTimeout(250);
  await page.click('[data-dp="clear"]');
  await page.waitForTimeout(150);

  await drawStroke();   // something to still be there after the reveal

  /* ---------- 4. the reveal ----------------------------------------------------------------- */
  sect("4. the reveal");
  const padTopBefore = await page.evaluate(() => document.querySelector(".draw-pad").getBoundingClientRect().top + window.scrollY);
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
  const inkAfter = await read();
  ok("…and the ink is still there", inkAfter.px > 200, inkAfter);
  ok("…and the pad says which frame is which now that there are two",
     (await page.evaluate(() => {
       const h = document.querySelector(".dp-hint");
       return { text: h.textContent, op: getComputedStyle(h).opacity };
     })).text === "What you drew");

  /* ---------- 5. and the pin is dropped when the card is ------------------------------------ */
  sect("5. one pad per card");
  /* THE NEXT CARD GETS A BLANK PAD, and the previous card's drawing must not survive into it — a canvas
     carried over would show the reader their answer to the card before. `mountDrawCard` tears the old
     pad's listeners down (`dpStop`) and the element itself dies with the card, so what is asserted here
     is the OUTCOME rather than either mechanism. Two draw cards in one QUEUE, the first graded: a
     navigation away and back would go through `hideWBTools` and prove nothing about a session. */
  const plainId = CARDS.filter((c) => c.drawCard !== true && c.flagCard !== true && !c.map && c.artwork !== true && c.question)[0].id;
  /* THE RECORD IS WRITTEN AFTER LANDING ON HOME, NEVER BEFORE. `route()` clears the study session on
     every navigation whose page is not `study` — one choke point, by design — so a record written before
     the hop is wiped by the hop, and the study page then goes home for want of one. */
  await page.evaluate(() => { location.hash = "#home"; });
  await page.waitForTimeout(500);
  await page.evaluate((ids) => {
    sessionStorage.setItem("folio_study_v1", JSON.stringify({ scope: { type: "ids", ids: ids }, queue: ids, id: ids[0], qi: 0, rev: false, studied: 0 }));
    location.hash = "#study";
  }, [draws[0].id, draws[1].id, plainId]);
  await page.waitForSelector(".dp-canvas", { timeout: 20000 });
  await page.waitForTimeout(800);

  const box2 = await page.locator(".dp-canvas").boundingBox();
  await page.mouse.move(box2.x + 30, box2.y + 40);
  await page.mouse.down();
  await page.mouse.move(box2.x + box2.width - 40, box2.y + 70, { steps: 14 });
  await page.mouse.up();
  await page.waitForTimeout(150);
  ok("the first card of the session takes ink", (await read()).px > 200);

  const press = async (re) => {
    const b = await page.getByRole("button", { name: re }).first().boundingBox();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
    await page.mouse.down(); await page.mouse.up();
  };
  await press(/reveal/i);
  await page.waitForTimeout(600);
  await press(/^good/i);
  await page.waitForTimeout(1000);
  const second = await page.evaluate(() => ({ pad: !!document.querySelector(".dp-canvas"),
    undoOff: (document.querySelector('[data-dp="undo"]') || {}).disabled }));
  ok("the next draw card has a pad of its own", second.pad, second);
  ok("…and its undo starts dead, so nothing was carried over", second.undoOff === true, second);
  ok("…and its canvas is blank", (await read()).pct === 0);

  await press(/reveal/i);
  await page.waitForTimeout(600);
  await press(/^good/i);
  await page.waitForTimeout(1000);
  const third = await page.evaluate(() => ({ pad: !!document.querySelector(".draw-pad"),
    penDown: document.body.classList.contains("wb-down"),
    scratch: getComputedStyle(document.querySelector("#scratch") || document.body).display }));
  ok("…and an ordinary card after them carries no pad", !third.pad, third);
  ok("…and the floating marker's pen was never put down by any of it", !third.penDown);

  ok("no console errors", errs.length === 0, errs.slice(0, 4));
  await browser.close();
  finish();

  function finish() {
    server.close();
    console.log(`\n${pass} passed, ${fail} failed`);
    process.exit(fail ? 1 : 0);
  }
})().catch((e) => { console.error(e); process.exit(1); });
