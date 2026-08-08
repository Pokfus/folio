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

const ROOT = path.join(__dirname, "..");
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
    p.on("console", (m) => { if (m.type() === "error" && !/ERR_|net::|Failed to load|favicon/.test(m.text())) errs.push("console: " + m.text()); });
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
        first: banners && banners.firstElementChild === el,
        // …and nothing is covering the page it sits on
        overlay: !!document.querySelector(".folio-tour, .page-help"),
      } : null;
    });
    check("a first-time reader is offered the walkthrough", !!(o && o.vis), o ? "" : "no .tour-offer");
    check("...it says how long it takes", !!(o && /three-minute|3-minute/i.test(o.text)), o && o.text.slice(0, 60));
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
  console.log("\n2. The walk — ten steps, two navigations, nothing off screen");
  {
    const page = await browser.newPage({ viewport: DESKTOP });
    watch(page);
    await page.goto(base, { waitUntil: "load" });
    await page.waitForTimeout(800);
    await page.click("#b-tour");
    await page.waitForTimeout(700);

    const seen = [];
    let offScreen = 0, nextOff = 0, routed = 0, illustrated = 0, pointed = 0;
    for (let i = 1; ; i++) {
      const st = await page.evaluate(CARD);
      if (!st) { check("the walkthrough is still open at step " + i, false); break; }
      seen.push(st);
      if (!st.onScreen) offScreen++;
      if (!st.nextOnScreen) nextOff++;
      if (st.hash === "#decks") routed++;
      if (st.demo) illustrated++;
      if (st.arrow && st.ring) pointed++;
      if (st.nextLabel === "Done") break;
      await page.click(".tour-next");
      await page.waitForTimeout(620);
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
    check("...it teaches revealing a card", /show answer/i.test(prose));
    const grades = (seen.find((s) => s.grades.length) || {}).grades || [];
    check("...and grading it, all four buttons named",
      grades.map((g) => g.split(":")[0]).join(",") === "Again,Hard,Good,Easy", grades.join(" "));
    /* The four figures are read from the real scheduler (schedPreview), so the tour cannot teach a
       schedule the site has not got — and the four must DIFFER, which is what the old grade bar got wrong
       (three of them read "<10m") and what a hard-coded illustration would hide for ever. */
    const iv = grades.map((g) => g.split(":")[1]);
    check("...with intervals from the real scheduler, all four different",
      iv.length === 4 && iv.every((v) => /^\d/.test(v)) && new Set(iv).size === 4, iv.join(" "));

    check("A STEP THAT NEEDS ANOTHER PAGE GOES THERE — the tour survives its own navigation", routed >= 1, routed + " step(s) on #decks");
    check("...and comes back", seen[seen.length - 1].hash !== "#decks", seen[seen.length - 1].hash || "(home)");
    check("several steps point at something, with an arrow and a ring", pointed >= 4, pointed + " pointed");
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
    check("...leaving the reader on the home page", done.hash === "" || done.hash === "#home", done.hash);
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
    const h = await page.evaluate(() => {
      const ov = document.querySelector(".page-help");
      if (!ov) return null;
      const c = ov.querySelector(".ah-card"), r = c.getBoundingClientRect();
      return {
        onBody: ov.parentElement === document.body,
        tips: ov.querySelectorAll(".ah-tip").length,
        text: ov.textContent,
        // THE BUG: written into .page it centres itself in the SHELF and lands below the fold
        onScreen: r.top >= 0 && r.bottom <= innerHeight + 1 && r.width > 120,
      };
    });
    check("a first visit to the Library explains it", !!h, h ? "" : "no .page-help");
    check("...ON THE BODY, so it is fixed to the viewport and not to the shelf", !!(h && h.onBody));
    check("...and is actually on the screen", !!(h && h.onScreen));
    /* THE CARD IS TWO CARDS (Aug 2026, on request), and the split is what these assert — in BOTH
       directions, since a tip in the wrong half is invisible from either side on its own. The SHELF's
       half says what is here and how to find it; everything about the inside of a book moved to a card
       shown the first time one is opened, beside the furniture it is describing. */
    check("...covering what the shelf itself offers", !!(h && h.tips >= 3), h && h.tips + " tips");
    check("...the search and the sort among them", !!(h && /search/i.test(h.text)));
    check("...and the reading position it keeps", !!(h && /remember/i.test(h.text)));
    check("...but NOT the marker, which belongs to the book half", !!(h && !/marker/i.test(h.text)));

    await page.click(".page-help .ah-go");
    await page.waitForTimeout(300);
    check("dismissing it clears the shelf", await page.evaluate(() => !document.querySelector(".page-help")));
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

  /* ================= 5b. the Collections page's own card ================= */
  /* Aug 2026, on request, and of the three page cards this is the one doing the most work: the home
     page's first press now sends a brand-new reader HERE rather than choosing a subject for them, so
     this is the first real page they meet and the card is the only thing on it that says pressing a +
     is what starts the daily study. Both halves are asserted — the route and the card — because they
     fail in opposite directions and either alone looks deliberate: a hero that still deals a card
     bypasses the page, and a page with no card leaves a first-time reader on a list of things to look
     at with nothing telling them what to do with one. */
  console.log("\n5b. The Collections page explains how to add one");
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

    const h = await page.evaluate(() => {
      const ov = document.querySelector(".page-help");
      if (!ov) return null;
      const r = ov.querySelector(".ah-card").getBoundingClientRect();
      return {
        onBody: ov.parentElement === document.body,
        onScreen: r.top >= 0 && r.bottom <= innerHeight + 1 && r.width > 120,
        tips: ov.querySelectorAll(".ah-tip").length,
        text: ov.textContent,
      };
    });
    check("...where a card explains what a collection is", !!h, h ? "" : "no .page-help");
    check("...on the body and on the screen, like the Library's", !!(h && h.onBody && h.onScreen));
    check("...naming the + as the way to add one", !!(h && /\+/.test(h.text) && /add/i.test(h.text)));
    check("...and saying what adding one DOES", !!(h && /daily study/i.test(h.text)), h && h.text.slice(0, 0));
    check("...three tips, like its siblings", !!(h && h.tips >= 3), h && h.tips + " tips");

    await page.click(".page-help .ah-go");
    await page.waitForTimeout(300);
    check("dismissing it clears the page", await page.evaluate(() => !document.querySelector(".page-help")));
    // a scrim left hit-testing would leave the whole page dead — and this is the page a first visit lands on
    await page.click("#collection-list-all .collection-add");
    await page.waitForTimeout(400);
    check("...and a collection can be added straight afterwards",
      await page.evaluate(() => !!document.querySelector("#collection-list-all .collection-add.added")));

    await page.goto(base + "#decks", { waitUntil: "load" });
    await page.waitForTimeout(900);
    check("it is not shown again on the next visit", await page.evaluate(() => !document.querySelector(".page-help")));
    await page.click("#collHelpBtn");
    await page.waitForTimeout(300);
    check("...but the ? brings it back", await page.evaluate(() => !!document.querySelector(".page-help")));
    await page.evaluate(() => { location.hash = "home"; });
    await page.waitForTimeout(600);
    check("...and it cannot outlive the page it explains", await page.evaluate(() => !document.querySelector(".page-help")));
    /* THE LOOP THIS CLOSES: the deck list under the banner only appears once a card has been graded, so
       while the hero is still the banner its button is the ONLY way into a session. Routing it to the
       collections unconditionally left a reader who had just added one with nowhere to go but back to the
       page they came from. */
    await page.waitForTimeout(700);
    await page.evaluate(() => document.querySelector(".banner .cta .btn").click());
    await page.waitForTimeout(1400);
    check("...and with a collection added the hero deals a card after all",
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
    let off = 0, wide = 0;
    for (let i = 0; i < 10; i++) {
      const st = await page.evaluate(() => {
        const c = document.querySelector(".tour-card");
        if (!c) return null;
        const r = c.getBoundingClientRect();
        return {
          fits: r.top >= 0 && r.bottom <= innerHeight + 1 && r.left >= 0 && r.right <= innerWidth + 1,
          docW: document.documentElement.scrollWidth,
          last: document.querySelector(".tour-next").textContent === "Done",
        };
      });
      if (!st) break;
      if (!st.fits) off++;
      if (st.docW > 390) wide++;
      if (st.last) break;
      await page.click(".tour-next");
      await page.waitForTimeout(600);
    }
    check("every step fits a 390px phone", off === 0, off + " step(s) overflowing");
    check("...and none of them widens the document", wide === 0, wide + " step(s) wider than the screen");
    await page.close();
  }

  check("no console errors anywhere", errs.length === 0, errs.slice(0, 4).join(" | "));

  await browser.close();
  server.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
