#!/usr/bin/env node
/* Folio — the WALKTHROUGH and the two pages that explain themselves.
   ==================================================================
   A first visitor is offered a walkthrough of the cards; the Atlas and the Library each carry their own
   first-visit card instead. Everything asserted here fails SILENTLY, and most of it has already broken once:

     · THE OFFER IS INLINE. It would be one line to raise the tour over the home page unasked, and a modal
       on first paint is exactly what this design refuses. A regression to one would look like a feature.
     · THE TOUR NAVIGATES, and the overlay is deliberately NOT in render()'s close list. Add it to that list
       — which is what every other overlay on document.body wants — and the tour dismisses itself at the
       moment it does its job, on the one step that teaches adding a deck.
     · THE CARD IS NUDGED off its own target so the arrow has somewhere to go, and the nudge is computed
       from a rect that no transform can touch. Measure it instead and the base is a card mid-transition,
       every later step shifts an already-shifted card, and on a long step it walks off the side of the
       screen taking its own Next button with it. That is how this was found, and nothing on screen says
       "the button is outside the viewport" — the tour simply stops working.
     · THE LIBRARY'S CARD IS ON document.body. Written into the page it inherits `.page` as its containing
       block (a filling animation on transform), so `position:fixed; inset:0` resolves to the SHELF — several
       screens tall — and the card centres itself a screen and a half below the fold. The page dims and
       nothing appears. It shipped that way for an hour.
     · EITHER ANSWER RETIRES THE OFFER, and the coach marks are shown once. A card that returns on every
       visit is the most annoying thing a site can do, and only a second visit can catch it.

   Run:  NODE_PATH=<playwright>/node_modules node .claude/test-tour.js
   Env:  FOLIO_CHROMIUM=<path to chrome> if Chromium lives outside the playwright package. */

const path = require("path");
const http = require("http");
const fs = require("fs");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");

const ROOT = path.join(__dirname, "..");
// the shipped source, so an expectation about a CONTROL'S LABEL can be read from the thing that renders it
const APP_SRC = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png" };
const DESKTOP = { width: 1440, height: 950 };
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

// the state of the walkthrough card, read the way a reader meets it
const CARD = () => {
  const ov = document.querySelector(".folio-tour");
  if (!ov) return null;
  const c = ov.querySelector(".tour-card"), r = c.getBoundingClientRect();
  const next = c.querySelector(".tour-next"), nr = next.getBoundingClientRect();
  return {
    step: c.querySelector(".tour-count").textContent,
    title: c.querySelector("h3").textContent,
    text: c.textContent.replace(/\s+/g, " "),
    // the illustrated grade row, read structurally — its cells concatenate into "Again1mHard6m…", so a
    // word-boundary regex over the text finds neither the labels nor the figures
    grades: [...c.querySelectorAll(".td-g")].map((g) => ((g.querySelector("b") || {}).textContent || "") + ":" + ((g.querySelector("i") || {}).textContent || "")),
    hash: location.hash,
    arrow: ((ov.querySelector(".tour-line").getAttribute("d")) || "").length > 0,
    ring: ((ov.querySelector(".tour-ring").getAttribute("d")) || "").length > 0,
    demo: !ov.querySelector(".tour-demo").hidden,
    nextLabel: next.textContent,
    nextShown: !next.hidden,
    html: c.querySelector(".tour-body").innerHTML,
    curve: !!ov.querySelector(".tour-demo .msn-curve svg"),
    // THE TARGET IS LEFT UNDARKENED (Sep 2026): with a target the overlay's own wash is off and the hole casts it
    hole: !ov.querySelector(".tour-hole").hidden && getComputedStyle(ov).backgroundColor === "rgba(0, 0, 0, 0)",
    // the whole card, and the button that advances it, inside the viewport
    onScreen: r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight + 1 && r.right <= innerWidth + 1,
    nextOnScreen: nr.top >= 0 && nr.bottom <= innerHeight + 1 && nr.left >= 0 && nr.right <= innerWidth + 1,
  };
};

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

  /* ================= 1. the offer ================= */
  console.log("\n1. The offer — inline, and answered once");
  {
    const page = await browser.newPage({ viewport: DESKTOP });
    watch(page);
    await page.goto(base, { waitUntil: "load" });
    await page.waitForTimeout(900);
    const o = await page.evaluate(() => {
      const el = document.querySelector(".tour-offer");
      const banners = document.querySelector(".banners");
      return el ? {
        vis: el.checkVisibility(),
        text: el.textContent.replace(/\s+/g, " ").trim(),
        // it is a card in the page, not a layer over it — that is the whole design decision
        pos: getComputedStyle(el).position,
        // first — or directly under the signed-out notice, which leads the day's work for a guest (Sep 2026)
        first: banners && (banners.firstElementChild === el ||
          (banners.firstElementChild.classList.contains("guest-notice") && banners.firstElementChild.nextElementSibling === el)),
        // …and nothing is covering the page it sits on
        overlay: !!document.querySelector(".folio-tour, .page-help"),
      } : null;
    });
    check("a first-time reader is offered the walkthrough", !!(o && o.vis), o ? "" : "no .tour-offer");
    check("...it says how long it takes", !!(o && /few minutes|three-minute|3-minute/i.test(o.text)), o && o.text.slice(0, 60));
    check("...INLINE, never a modal over the first paint", !!(o && o.pos === "static" && !o.overlay), o && o.pos);
    check("...at the head of the day's work", !!(o && o.first));
    // the page's OWN first element is still the version line — the test-layout assertion this must not break
    check("...and the version line is still the page's first child",
      await page.evaluate(() => { const p = document.querySelector(".page"); const v = document.querySelector(".site-ver"); return !!v && p.firstElementChild === v; }));

    // "No thanks" retires it — and a reload is the only way to catch a card that comes back
    await page.click("#b-tour-no");
    await page.waitForTimeout(400);
    check("declining removes it at once", await page.evaluate(() => !document.querySelector(".tour-offer")));
    await page.goto(base, { waitUntil: "load" });
    await page.waitForTimeout(700);
    check("...and it does not come back on the next visit", await page.evaluate(() => !document.querySelector(".tour-offer")));
    check("...the tour is still reachable from Settings",
      await page.evaluate(async () => { location.hash = "settings"; await new Promise((r) => setTimeout(r, 500)); return !!document.querySelector("#replayTour"); }));
    await page.close();
  }

  /* ================= 2. the walk ================= */
  console.log("\n2. The walk — from the offer to a real first card, nothing off screen");
  {
    const page = await browser.newPage({ viewport: DESKTOP });
    watch(page);
    await page.goto(base, { waitUntil: "load" });
    await page.waitForTimeout(800);
    await page.click("#b-tour");
    await page.waitForTimeout(700);

    /* THE WALK IS DONE, NOT DESCRIBED (Sep 2026, on request): six steps wait for the reader to DO the thing
       rather than press Next, so the loop does it — adds the first collection, taps its row, reveals the
       card, grades it Good, turns the badge over and opens the chest — exactly as a reader would. A step
       that waits is recognised by its hidden Next and acted on by its title; an unknown one fails loudly. */
    const seen = [];
    let offScreen = 0, nextOff = 0, routed = 0, illustrated = 0, pointed = 0, holes = 0, studied = 0;
    let achTile = false, chestItem = "";
    for (let i = 1; ; i++) {
      const st = await page.evaluate(CARD);
      if (!st) { check("the walkthrough is still open at step " + i, false); break; }
      seen.push(st);
      if (!st.onScreen) offScreen++;
      if (st.nextShown && !st.nextOnScreen) nextOff++;
      if (st.hash === "#decks") routed++;
      if (st.hash === "#study") studied++;
      if (st.demo) illustrated++;
      if (st.hole) holes++;
      if (st.arrow && st.ring) pointed++;
      if (st.nextLabel === "Done") break;
      if (st.nextShown && st.title !== "Your first badge") await page.click(".tour-next");
      else if (/Pick a subject/.test(st.title)) await page.click(".collection-add");
      else if (/Study your new deck/.test(st.title)) {
        const xy = await page.evaluate(() => { const e = document.querySelector(".active-decks .active-deck[data-review]"); const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
        await page.mouse.click(xy[0], xy[1]);   // a REAL pointer, so the blocks round the hole are tested too
      }
      else if (/Your first card/.test(st.title)) await page.click("#reveal-btn");
      else if (/Grade yourself/.test(st.title)) await page.click("#gradebar .grade.good");
      else if (/Your first badge/.test(st.title)) {
        await page.click(".tour-next");
        await page.waitForTimeout(500);
        achTile = await page.evaluate(() => !!document.querySelector(".ach-pop .badge.ach-tile") && document.querySelector(".folio-tour").hidden);
        await page.click(".ach-tile");
        await page.waitForTimeout(1100);
        await page.click("#chestBtn");
        await page.waitForSelector("#chestReveal:not([hidden])", { timeout: 8000 });
        chestItem = await page.evaluate(() => document.querySelector("#chestReveal .ar-chip").textContent);
        await page.click("#chestActs .btn:last-child");
      }
      else { check("a waiting step this test knows how to answer", false, st.title); break; }
      await page.waitForTimeout(900);
      if (i > 30) { check("the walkthrough terminates", false, "ran past 30 steps"); break; }
    }
    check("it runs a walkthrough of several minutes", seen.length >= 8 && seen.length <= 16, seen.length + " steps");
    check("...numbered, so a reader knows how far in they are", /^Step 1 of \d+$/.test(seen[0].step), seen[0].step);
    check("...the first step cannot go Back",
      await page.evaluate(() => { const b = document.querySelector(".tour-back"); return b !== null; }));

    /* THE THREE SUBJECTS THE REQUEST NAMES, read off the prose the reader is actually shown. A tour can
       lose a subject to an edit without anything erroring, and the whole point of it is these three. */
    const prose = seen.map((s) => s.text).join(" \n ");
    check("...it teaches spaced repetition by name", /spaced repetition/i.test(prose));
    check("...and what it means — that a card returns before you forget it", /forget|fade/i.test(prose) && /return|comes? back/i.test(prose));
    check("...it teaches adding a deck to the daily study", /add/i.test(prose) && /deck/i.test(prose) && /daily study|daily review/i.test(prose));
    /* THE LABEL IS READ OFF app.js, NEVER WRITTEN DOWN HERE. This assertion was `/show answer/i` — the
       words the button carried when the tour was written — and it went on passing for months after the
       control was renamed "Reveal answer", which is to say the test was what held the wrong label in
       place. A tutorial naming a control by a label the page has not got is the exact failure this file
       exists to catch, so the expectation now comes from the same source the button does and drifts with
       it. If the id ever changes, the check below fails loudly rather than quietly matching nothing. */
    /* …AND THE LABEL IS NOT ALWAYS A LITERAL (Sep 2026). The button gained a second wording when
       "Recall in full" shipped — the markup now reads `>" + (recallOn ? "Reveal and compare" : "Reveal
       answer") + "<` — so the slice captured a fragment of JavaScript and this check failed against it,
       which is the check being wrong rather than the tour. What is read off app.js is therefore every
       LABEL the expression can produce, and the tour has to name one of them: a literal capture yields a
       single candidate and behaves exactly as before. The glue between the strings is dropped by asking
       for a candidate that carries a letter, no operator and no outer spaces — and an EMPTY candidate
       list still fails loudly, which is the property the paragraph above promises. */
    const revealRaw = (/id="reveal-btn"[^>]*>([^<]+)</.exec(APP_SRC) || [])[1] || "";
    /* The capture OPENS AND CLOSES on the string-concatenation's own quote when the label is an
       expression, so the quoted runs inside it are the JavaScript glue and not the words — strip that
       outer pair first and the pairing lands on the labels. */
    const inner = revealRaw.replace(/^"/, "").replace(/"$/, "");
    const quoted = inner.match(/"[^"]*"/g);
    const revealLabels = (quoted ? quoted.map((t) => t.slice(1, -1)) : [inner])
      .filter((t) => /[A-Za-z]/.test(t) && t.trim() === t);
    check("the reveal control's label was found in app.js", revealLabels.length > 0, revealLabels.join(" | ") || "(none)");
    check("...it teaches revealing a card, by the button's real name",
      revealLabels.some((l) => prose.toLowerCase().includes(l.toLowerCase())), JSON.stringify(revealLabels));
    check("...and grading it, by the buttons' real names", /\bEasy\b/.test(prose) && /\bAgain\b/.test(prose));
    check("THE READER STUDIES A REAL CARD: the walk reaches the study page", studied >= 3, studied + " step(s) on #study");
    check("...the badge is announced as the account page's own tile, over a hidden tour", achTile);
    check("...and the first chest holds an ARTEFACT, never a theme", !!chestItem && chestItem !== "Theme", chestItem || "(none)");
    check("THE FORGETTING CURVE is drawn on the spaced-repetition step", seen.some((x) => /Why the cards come back/.test(x.title) && x.curve));
    check("THE PILES ARE PAINTED in their own colours",
      /tour-pile-new[^>]*>New</.test(prose.replace(/\s+/g, " ")) || seen.some((x) => /tour-pile-new">New/.test(x.html) && /tour-pile-learn">Learning/.test(x.html) && /tour-pile-rev">Review/.test(x.html)));
    check("NO LONG DASHES in what the walkthrough says", !seen.some((x) => /—/.test(x.text)), (seen.find((x) => /—/.test(x.text)) || {}).title || "");
    check("...and it no longer calls the Collections button the only way in", !/only route/i.test(prose));
    check("A TARGET IS LEFT UNDARKENED on the steps that point at one", holes >= 5, holes + " step(s)");
    check("A STEP THAT NEEDS ANOTHER PAGE GOES THERE — the tour survives its own navigation", routed >= 1, routed + " step(s) on #decks");
    check("...and comes back", seen[seen.length - 1].hash !== "#decks", seen[seen.length - 1].hash || "(home)");
    /* THREE, not four, since Aug 2026 — and the step that stopped counting never drew a visible arrow.
       Step 10 rings the whole games grid and the card sits INSIDE that ring, so the line was drawn
       underneath the card and nothing of it reached the screen; `tourPlace` now declines to draw one at
       all in that case (an arrow from a box to the box it is already in), so this counts arrows a reader
       can actually see rather than `d` attributes that have been set. Verified against HEAD before the
       number was moved: the two builds render step 10 identically. */
    check("several steps point at something, with an arrow and a ring", pointed >= 3, pointed + " pointed");
    check("...and the ones with nothing to point at are illustrated instead", illustrated >= 2, illustrated + " illustrated");
    check("THE CARD NEVER LEAVES THE VIEWPORT", offScreen === 0, offScreen + " step(s) off screen");
    check("...nor does the button that advances it", nextOff === 0, nextOff + " step(s) with Next off screen");

    // the marker has to be in it — asked for by name
    check("the whiteboard marker is taught", /marker/i.test(prose));
    check("...including that it works on the Atlas and in a book", /atlas|globe/i.test(prose) && /book/i.test(prose));

    // finishing
    await page.click(".tour-next");
    await page.waitForTimeout(500);
    const done = await page.evaluate(() => ({
      gone: !document.querySelector(".folio-tour"),
      offer: !!document.querySelector(".tour-offer"),
      hash: location.hash,
    }));
    check("Done closes it", done.gone);
    check("...and takes the offer with it", !done.offer);
    check("...leaving the reader where they are studying", done.hash === "#study", done.hash);
    // …and the goodbye waits for their next visit to the home page (tourFinish / tourFarewellMaybe)
    await page.evaluate(() => { location.hash = "home"; });
    await page.waitForTimeout(900);
    check("THE FIRST RETURN HOME CONGRATULATES THEM", await page.evaluate(() => !!document.querySelector(".tour-bye") && /tomorrow/i.test(document.querySelector(".tour-bye").textContent)));
    await page.click(".tour-bye .ah-go");
    await page.evaluate(() => { location.hash = "decks"; });
    await page.waitForTimeout(500);
    await page.evaluate(() => { location.hash = "home"; });
    await page.waitForTimeout(900);
    check("...once", await page.evaluate(() => !document.querySelector(".tour-bye")));
    await page.close();
  }

  /* ================= 3. the ways out ================= */
  console.log("\n3. The ways out");
  {
    const page = await browser.newPage({ viewport: DESKTOP });
    watch(page);
    await page.goto(base, { waitUntil: "load" });
    await page.waitForTimeout(800);
    await page.click("#b-tour");
    await page.waitForTimeout(600);
    // a stray tap on a dimmed page must NOT lose the tour — the backdrop deliberately does not dismiss
    await page.mouse.click(40, 40);
    await page.waitForTimeout(300);
    check("a click on the backdrop does not dismiss it", await page.evaluate(() => !!document.querySelector(".folio-tour")));
    // …and while it is up, the phone's page swipe is inert (swipeEnabled's overlay list)
    check("the page swipe is blocked while it is open",
      await page.evaluate(() => !!document.querySelector(".deck-menu, .inline-prompt, .img-viewer, .levelup-pop, .gloss-win, .ctx-menu, .folio-tour")));
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(500);
    check("the arrow keys step through it", await page.evaluate(() => /Step 2 /.test(document.querySelector(".tour-count").textContent)));
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);
    check("Escape closes it", await page.evaluate(() => !document.querySelector(".folio-tour")));
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(700);
    check("...and leaving early still counts as answered", await page.evaluate(() => !document.querySelector(".tour-offer")));
    await page.close();
  }

  /* ================= 4. a reader who has already studied ================= */
  console.log("\n4. Not offered to a reader who is not new");
  {
    const page = await browser.newPage({ viewport: DESKTOP });
    watch(page);
    await page.addInitScript(() => {
      try {
        const raw = localStorage.getItem("folio_v1");
        const s = raw ? JSON.parse(raw) : {};
        s.cards = Object.assign({}, s.cards, { "wh-001": { status: "review", iv: 3, ease: 2.5, due: Date.now() + 8.64e7, last: Date.now(), reps: 1, lapses: 0 } });
        localStorage.setItem("folio_v1", JSON.stringify(s));
      } catch (e) {}
    });
    await page.goto(base, { waitUntil: "load" });
    await page.waitForTimeout(800);
    check("a reader with study history is not offered a beginners' tour",
      await page.evaluate(() => !document.querySelector(".tour-offer")));
    await page.close();
  }

  /* ================= 5. the Library's own card ================= */
  console.log("\n5. The Library explains itself, once");
  {
    const page = await browser.newPage({ viewport: DESKTOP });
    watch(page);
    await page.goto(base + "#library", { waitUntil: "load" });
    await page.waitForTimeout(1400);
    /* A FIRST VISIT GETS THE QUIET STRIP, NOT THE MODAL (Sep 2026 — see pageHelp's `opts.quiet`).
       A reader who opened Folio, then the Atlas, then the Library, then the marker met four explainers
       before doing anything, so the Library's and the Atlas's became a dismissible strip at the head of
       the page with the first tip in it and a control that unfolds the rest. Pressing "?" still gets
       the full modal, which is what the block below this one asserts.
       The strip is IN THE PAGE rather than on the body, which reverses the old assertion here — and
       correctly: the modal had to be on the body because `.page` carries a filled animation and would
       become the containing block for anything fixed inside it, centring the card a screen and a half
       down a long shelf. A strip is in the flow, scrolls away with the page, and dies with it. */
    const h = await page.evaluate(() => {
      const ov = document.querySelector(".page-help-quiet");
      if (!ov) return null;
      const r = ov.getBoundingClientRect();
      const rest = ov.querySelector(".phq-rest");
      return {
        inPage: !!ov.closest("#view .page"),
        // the rest of the tips are present and folded — nothing is cut, the reader chooses when to read
        tips: ov.querySelectorAll(".ah-tip").length + (ov.querySelector(".phq-first") ? 1 : 0),
        folded: !!(rest && rest.hidden),
        hasMore: !!ov.querySelector(".phq-more"),
        text: ov.textContent,
        onScreen: r.top >= 0 && r.bottom <= innerHeight + 1 && r.width > 120,
      };
    });
    check("a first visit to the Library explains it", !!h, h ? "" : "no .page-help-quiet");
    check("...as a strip IN the page, which scrolls away and dies with it", !!(h && h.inPage));
    check("...with the rest folded behind a control rather than cut", !!(h && h.folded && h.hasMore));
    check("...and is actually on the screen", !!(h && h.onScreen));
    /* THE CARD IS TWO CARDS (Aug 2026, on request), and the split is what these assert — in BOTH
       directions, since a tip in the wrong half is invisible from either side on its own. The SHELF's
       half says what is here and how to find it; everything about the inside of a book moved to a card
       shown the first time one is opened, beside the furniture it is describing. */
    check("...covering what the shelf itself offers", !!(h && h.tips >= 3), h && h.tips + " tips");
    check("...the search and the sort among them", !!(h && /search/i.test(h.text)));
    check("...and the reading position it keeps", !!(h && /remember/i.test(h.text)));
    check("...but NOT the marker, which belongs to the book half", !!(h && !/marker/i.test(h.text)));

    /* The strip is dismissed by its own ×, not by the modal's "Start reading" button — the quiet form
       has no go button, because there is nothing to go past: the page is already usable underneath it. */
    await page.click(".page-help-quiet .phq-close");
    await page.waitForTimeout(300);
    check("dismissing it clears the shelf", await page.evaluate(() => !document.querySelector(".page-help-quiet, .page-help")));
    // a book still opens — a scrim left hit-testing would make the whole shelf dead to the touch
    await page.click(".book-tile");
    await page.waitForTimeout(2500);
    check("...and a book opens straight afterwards", await page.evaluate(() => location.hash.startsWith("#book/")), await page.evaluate(() => location.hash));

    // …and the book half arrives with it, on the first book ever opened
    const bk = await page.evaluate(() => {
      const ov = document.querySelector(".page-help");
      if (!ov) return null;
      const r = ov.querySelector(".ah-card").getBoundingClientRect();
      return { tips: ov.querySelectorAll(".ah-tip").length, text: ov.textContent,
               onBody: ov.parentElement === document.body,
               onScreen: r.top >= 0 && r.bottom <= innerHeight + 1 && r.width > 120 };
    });
    check("opening a book explains the READING", !!bk, bk ? "" : "no .page-help on the book");
    check("...on the body and on the screen, like the shelf's", !!(bk && bk.onBody && bk.onScreen));
    check("...the marker is here, where a page exists to draw on", !!(bk && /marker/i.test(bk.text)));
    check("...with the chapter bar and the facing original", !!(bk && /chapters/i.test(bk.text) && /original/i.test(bk.text)));
    /* Opening a first book earns a badge, and since Sep 2026 a badge is a centred overlay rather than a toast
       (openAchPop) — it sits over this card, so it is answered first, as a reader would. */
    if (await page.evaluate(() => !!document.querySelector(".ach-pop"))) { await page.click('.ach-pop [data-act="later"]'); await page.waitForTimeout(300); }
    await page.click(".page-help .ah-go");
    await page.waitForTimeout(300);
    check("dismissing it clears the book", await page.evaluate(() => !document.querySelector(".page-help")));
    // its own key, so the shelf's answer cannot retire it and vice versa
    check("...the two halves are remembered apart", await page.evaluate(() =>
      !!localStorage.getItem("folio_library_tour_v1") && !!localStorage.getItem("folio_book_tour_v1")));
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(2500);
    check("...and the book half is not shown again", await page.evaluate(() => !document.querySelector(".page-help")));
    await page.click("#bkHelp");
    await page.waitForTimeout(300);
    check("...but the book's ? brings it back", await page.evaluate(() =>
      !!document.querySelector(".page-help") && /marker/i.test(document.querySelector(".page-help").textContent)));

    await page.goto(base + "#library", { waitUntil: "load" });
    await page.waitForTimeout(1000);
    check("it is not shown again on the next visit", await page.evaluate(() => !document.querySelector(".page-help")));
    await page.click("#libHelpBtn");
    await page.waitForTimeout(300);
    check("...but the ? brings it back", await page.evaluate(() => !!document.querySelector(".page-help")));
    // it is render()'s to close, like every other overlay on document.body
    await page.evaluate(() => { location.hash = "home"; });
    await page.waitForTimeout(600);
    check("...and it cannot outlive the page it explains", await page.evaluate(() => !document.querySelector(".page-help")));
    await page.close();
  }

  /* ================= 5b. where the first-run hero sends a reader ================= */
  /* Aug 2026, on request: the hero used to pick the first live collection, add it on the reader's behalf
     and deal them a card; it takes them to the collections to choose their own. Both ends are asserted
     because they fail in opposite directions and either alone looks deliberate — a hero that still deals
     a card bypasses the page, and one that never deals a card strands a reader who has just added a
     collection on the page they came from. */
  console.log("\n5b. The first-run hero sends a new reader to the collections");
  {
    const page = await browser.newPage({ viewport: DESKTOP });
    watch(page);
    await page.goto(base + "#home", { waitUntil: "load" });
    await page.waitForTimeout(1300);
    const hero = await page.evaluate(() => {
      const b = document.querySelector(".banner.hero");
      return b ? (b.querySelector(".cta .btn") || {}).textContent : null;
    });
    check("a first-time reader meets the hero", !!hero, String(hero));
    await page.evaluate(() => document.querySelector(".banner.hero").click());
    await page.waitForTimeout(900);
    check("...and its first press goes to the collections, not into a session",
      await page.evaluate(() => location.hash === "#decks"), await page.evaluate(() => location.hash));

    check("...and the page is live, with collections to add", await page.evaluate(() =>
      document.querySelectorAll("#collection-list-all .collection-add[data-id]").length > 0));
    await page.click("#collection-list-all .collection-add");
    await page.waitForTimeout(400);
    check("...one of which can be added", await page.evaluate(() =>
      !!document.querySelector("#collection-list-all .collection-add.added")));
    /* THE LOOP THIS CLOSES: the deck list under the banner is not drawn while the hero IS the banner, so
       that button is the only way into a session. `fresh` is an empty schedule AND an empty review, so a
       reader who has just added a collection meets the ordinary banner and its Start — and a version of
       this that sent every press to the collections would leave them going round in a circle. */
    await page.evaluate(() => { location.hash = "home"; });
    await page.waitForTimeout(1300);
    await page.evaluate(() => document.querySelector(".banner .cta .btn").click());
    await page.waitForTimeout(1400);
    check("...and with a collection added the banner deals a card after all",
      await page.evaluate(() => location.hash === "#study" && !!document.querySelector("#reveal-btn")),
      await page.evaluate(() => location.hash));
    await page.close();
  }

  /* ================= 6. the Atlas's card ================= */
  console.log("\n6. The Atlas says the marker works there too");
  {
    const page = await browser.newPage({ viewport: DESKTOP });
    watch(page);
    await page.goto(base + "#map", { waitUntil: "load" });
    await page.waitForTimeout(4500);
    const a = await page.evaluate(() => {
      const h = document.querySelector("#atlasHelp");
      return h ? { shown: !h.hidden, tips: h.querySelectorAll(".ah-tip").length, text: h.textContent } : null;
    });
    check("a first visit to the Atlas still explains it", !!(a && a.shown));
    check("...and now says the marker draws on the globe", !!(a && /marker/i.test(a.text)));
    check("...pinned to the map rather than to the screen", !!(a && /pinned to the map|turn with it/i.test(a.text)));
    await page.close();
  }

  /* ================= 7. the phone ================= */
  console.log("\n7. On a phone");
  {
    const page = await browser.newPage({ viewport: PHONE });
    watch(page);
    await page.goto(base, { waitUntil: "load" });
    await page.waitForTimeout(800);
    const w0 = await page.evaluate(() => document.documentElement.scrollWidth);
    check("the offer does not widen the page", w0 <= 390, w0 + "px");
    await page.click("#b-tour");
    await page.waitForTimeout(700);
    let off = 0, wide = 0, floating = 0, ringOff = 0, ringHidden = 0, rings = 0;
    for (let i = 0; i < 10; i++) {
      const st = await page.evaluate(() => {
        const c = document.querySelector(".tour-card");
        if (!c) return null;
        const r = c.getBoundingClientRect();
        /* The ring is a path in a full-screen SVG with no viewBox, so its own user units ARE CSS pixels
           and getBBox needs no conversion — the same fact tourPlace is written on. An empty `d` gives a
           zero box, which is how "no ring on this step" is told from one that is drawn. */
        const rg = document.querySelector(".tour-ring");
        let box = null;
        try { const b = rg.getBBox(); if (b.width > 1 && b.height > 1) box = b; } catch (e) {}
        return {
          fits: r.top >= 0 && r.bottom <= innerHeight + 1 && r.left >= 0 && r.right <= innerWidth + 1,
          docW: document.documentElement.scrollWidth,
          last: document.querySelector(".tour-next").textContent === "Done" || document.querySelector(".tour-next").hidden,
          // DOCKED: the card's foot is at the foot of the screen, within the overlay's own padding
          docked: innerHeight - r.bottom <= 20,
          cardTop: r.top,
          ring: box ? { x: box.x, y: box.y, w: box.width, h: box.height } : null,
          vw: innerWidth, vh: innerHeight,
        };
      });
      if (!st) break;
      if (!st.fits) off++;
      if (st.docW > 390) wide++;
      if (!st.docked) floating++;
      if (st.ring) {
        rings++;
        if (st.ring.x < -1 || st.ring.y < -1 || st.ring.x + st.ring.w > st.vw + 1 || st.ring.y + st.ring.h > st.vh + 1) ringOff++;
        if (st.ring.y >= st.cardTop) ringHidden++;
      }
      if (st.last) break;
      await page.click(".tour-next");
      await page.waitForTimeout(600);
    }
    check("every step fits a 390px phone", off === 0, off + " step(s) overflowing");
    check("...and none of them widens the document", wide === 0, wide + " step(s) wider than the screen");
    /* THE THREE THINGS THE PHONE FIX IS (Aug 2026, on a bug report that the walkthrough "doesn't display
       properly" there). Each fails silently and each fails differently, so each is asserted on its own:
         · the card is DOCKED to the foot of the screen. Centred, it takes half a small screen and the
           nudge has nowhere to move it, so the target spent most of the tour underneath it;
         · no ring runs OFF the screen. A target taller than the viewport used to draw a rectangle whose
           four corners were all outside it, leaving two dashed rules down the edges — which reads as a
           rendering fault rather than as a highlight;
         · and no ring is drawn entirely BEHIND the card, which is the same failure seen from the reader's
           side: something is being pointed at and none of it is in view. */
    check("the walkthrough is docked to the foot of a phone screen", floating === 0, floating + " step(s) floating");
    check("...and no ring runs off the screen", ringOff === 0, ringOff + " of " + rings + " ring(s) clipped");
    check("...nor sits entirely behind the card", ringHidden === 0, ringHidden + " of " + rings + " ring(s) hidden");
    await page.close();
  }

  check("no console errors anywhere", errs.length === 0, errs.slice(0, 4).join(" | "));

  await browser.close();
  server.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
