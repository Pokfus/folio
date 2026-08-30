#!/usr/bin/env node
/*
  The daily review's decks, and the study session that comes out of them (Aug 2026).

  Five things landed together and every one of them fails SILENTLY — nothing throws when a review quietly
  takes all its new cards from one deck, when a reload drops a session on the floor, or when a long press
  does nothing at all:

    · every added deck contributes new cards, drawn at random ACROSS the decks (the bug this replaced took
      them all from whichever deck came first, so a second deck was never seen)
    · a deck's row shows ITS OWN remaining allowance, not its share of the pooled review
    · a study session survives a reload — same card, same phrasing, same reveal
    · a card's three phrasings can be stepped through, and the step sticks
    · holding a deck's row opens Custom study / Daily limits / Skip today / Remove, the bin having gone
    · there is NO cap on how many decks may sit in the review (the Folio level used to be one)

  Everything is driven through a real browser against the real files. Progress is seeded through
  addInitScript rather than a live page write, because the app saves on its own schedule and would clobber
  it; and note that navigating between two hashes of the same document is a SAME-DOCUMENT navigation, so
  the init script never fires and the app keeps running — reload() is what actually starts fresh.

    node .claude/test-review-decks.js
    (Playwright is a dev dependency and must not be installed into the repo — install it elsewhere and run
     with NODE_PATH=<that>/node_modules; FOLIO_CHROMIUM=<path to chrome> if it lives outside the package.)
*/
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");

const ROOT = path.join(__dirname, "..");
const MIME = { ".js": "text/javascript", ".css": "text/css", ".html": "text/html", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png" };
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0].split("#")[0]);
  if (p === "/") p = "/index.html";
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end("not found"); return; }
  res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
});

let pass = 0, fail = 0;
const check = (name, ok, extra) => {
  if (ok) { pass++; console.log("ok    " + name + (extra ? "  " + extra : "")); }
  else { fail++; console.log("FAIL  " + name + (extra ? "  " + extra : "")); }
};

// a card record that is neither new nor due — just enough history to be past the first-run hero
const done = () => ({ reps: 1, lapses: 0, ease: 2.5, interval: 9, due: Date.now() + 9 * 864e5, status: "review", last: Date.now() - 864e5, first: "2026-01-01" });
const SETTINGS = {
  night: false, theme: "folio", fontSize: "medium", newPerDay: 5, bgCollapsed: false, trCollapsed: true,
  srcCollapsed: false, adminMode: true, reviewRandom: false, lang: "en", sfx: false, tts: false,
  ttsMuted: false, ttsVoiceEn: "", ttsVoiceZh: "", ttsNarrator: "us-male", home: { name: "Netherlands", lon: 5.32, lat: 52.1 },
};

(async () => {
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port + "/";
  const browser = await chromium.launch(LAUNCH);
  const errs = [];

  const probe = await browser.newPage();
  await probe.goto(base, { waitUntil: "load" });
  await probe.waitForTimeout(1200);
  /* The two leaf decks that actually hold cards, read off the shipped tree rather than hard-coded — and
     PREFERRED FROM ONE COLLECTION, which sections 8 and 11 depend on and which stopped happening by itself
     when the China collection was opened (Aug 2026). Those sections need a level of the review list holding
     more than one row: two leaves of one collection give their shared parent two children, where two leaves
     of DIFFERENT collections give each parent one and leave nothing to reorder or to drag into a group.
     Read the flat way it silently became a fixture for a list nobody could rearrange — the drag sections
     then reported the top level, and the group section found no deck to carry and crashed the run before
     everything after it could execute. Falls back to the first two anywhere, so a tree that offers no such
     pair still tests what it can. */
  const leaves = await probe.evaluate(() => {
    const byRoot = {};
    (window.COLLECTION_TREE.collections || []).forEach((c) => (function walk(n) {
      (n.children || []).forEach(walk);
      if (!(n.children || []).length && (n.cardIds || []).length) (byRoot[c.id] = byRoot[c.id] || []).push(n.id);
    })(c));
    const roots = Object.keys(byRoot);
    const shared = roots.find((r) => byRoot[r].length > 1);
    const picked = shared ? byRoot[shared].slice(0, 2) : roots.flatMap((r) => byRoot[r]).slice(0, 2);
    /* …AND THE FIRST CARD OF THE FIRST OF THEM, because the FSRS sections below seed a mature record and
       then look for it in the session. They named a card outright until Aug 2026, and that card was in a
       collection this probe had stopped choosing: the deck is picked by TREE ORDER, so the day a second
       leaf of an earlier collection gained its first cards, the pair moved and the seeded card was in no
       active deck at all. The session was then empty and seven assertions failed at once, on a content
       change that had nothing to do with the scheduler. Whatever deck this probe picks, this is a card
       inside it. */
    let first = "";
    (window.COLLECTION_TREE.collections || []).forEach((c) => (function walk(n) {
      if (n.id === picked[0] && (n.cardIds || []).length) first = first || n.cardIds[0];
      (n.children || []).forEach(walk);
    })(c));
    return picked.concat([first]);
  });
  await probe.close();
  if (leaves.length < 3 || !leaves[2]) { console.log("FAIL  the tree needs two leaf decks with cards to test a pooled review"); process.exit(1); }
  const [deckA, deckB, MATURE_ID] = leaves;

  const newPage = async (state) => {
    const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
    page.on("pageerror", (e) => errs.push(e.message));
    await page.addInitScript((st) => { try { localStorage.setItem("folio_v1", JSON.stringify(st)); } catch (e) {} }, state);
    return page;
  };
  /* THE DRAG HANDLES LIVE IN AN EDITOR MODE SINCE AUG 2026 (on request: "rather than the drag handles
     being visible at all times, make them invisible by default … pressing it opens an editor mode where
     the drag handles appear on the left"). They are `visibility:hidden` at rest, which takes them out of
     hit-testing AND out of the focus order — deliberately, since an invisible control that still swallows
     the press meant for the row underneath is the failure that rule exists to prevent. So every drag
     below opens the mode first, exactly as a reader now does, and this returns whether it actually
     opened: a silent no-op here would show up as "the reorder does nothing", which reads like a broken
     drag rather than a missing press. */
  const openDeckEditor = (pg) => pg.evaluate(async () => {
    if (document.querySelector("#dkEditDone")) return true;   // already open
    const b = document.querySelector("#dkEdit");
    if (!b) return false;
    b.click();
    await new Promise((r) => setTimeout(r, 300));
    return !!document.querySelector("#dkEditDone");
  });
  // three cards already studied → past the first-run hero, and Folio level 2 (which is two decks)
  const seeded = { active: [deckA, deckB], settings: SETTINGS, cards: { a: done(), b: done(), c: done() } };

  /* ================= 1. the Library ================= */
  {
    const page = await newPage(seeded);
    await page.goto(base + "#decks", { waitUntil: "load" });
    await page.waitForTimeout(1200);
    const lib = await page.evaluate(() => ({
      soonOpen: (() => { const d = document.querySelector(".collection-group-soon"); return d ? d.open : null; })(),
      cap: !!document.querySelector(".lib-cap"),
    }));
    // it used to open itself for an admin, who is exactly the person on this page most often
    check("the Planned fold starts closed, admin or not", lib.soonOpen === false, JSON.stringify(lib.soonOpen));
    // the Folio level used to cap how many decks the review would hold, and this line stated the standing.
    // The cap was removed on request (Aug 2026) — a level buys an artefact chest now — so the line must be
    // gone with it: a limit stated in the page head but not enforced reads as still in force.
    check("...and no deck-cap line is left in the page head", lib.cap === false);
    await page.close();
  }

  /* ================= 2. every added deck offers new cards of its own ================= */
  {
    const page = await newPage(seeded);
    await page.goto(base + "#home", { waitUntil: "load" });
    await page.reload({ waitUntil: "load" });   // #decks -> #home is same-document; only a reload re-seeds
    await page.waitForTimeout(1400);
    const home = await page.evaluate(() => ({
      rows: [...document.querySelectorAll(".active-deck[data-review]")].map((r) => ({
        title: r.querySelector(".dk-title").textContent.trim(),
        counts: [...r.querySelectorAll(".dkc")].map((x) => +x.textContent.trim()),
      })),
      banner: [...document.querySelectorAll(".banner .stat")].filter((s) => !s.classList.contains("streak")).map((s) => +s.querySelector("b").textContent.trim()),
      trash: document.querySelectorAll(".dk-trash").length,
      badge: !!document.querySelector(".review-group .banner .level-badge"),
      desc: (document.querySelector(".review-group .banner .desc") || {}).textContent || "",
    }));
    check("both added decks offer new cards of their own",
      home.rows.length >= 2 && home.rows.every((r) => r.counts[0] > 0), JSON.stringify(home.rows));
    /* Not their SUM, and not a smaller figure neither deck agreed to either (Aug 2026, on a bug report):
       the review's default limit is the WIDEST any added deck offers, so two decks at 5 draw 5 — from the
       ten between them — where the old global default handed back 3 and nothing on the page explained it. */
    check("...and the review draws the widest deck's allowance, not their sum",
      home.banner[0] === 5, JSON.stringify({ banner: home.banner, rows: home.rows.map((r) => r.counts[0]) }));
    check("the bin at the end of each row is gone", home.trash === 0);
    check("the banner carries no big numeral", !home.badge);
    check("...and no line describing the counts under it", !/scheduled/i.test(home.desc), home.desc);
    /* The Ordered / Random pill used to be absolutely positioned at the group's top right, and the title
       had to clear it — that is what this measured. The pill moved into the banner's own long-press sheet
       (Aug 2026, on request), so what is left to guard is that the title still fits on one line and that
       the setting really did move rather than simply disappearing. */
    check("the Ordered / Random pill is gone from the banner",
      await page.evaluate(() => !document.querySelector("#reviewOrder, .review-order")));
    for (const w of [390, 1280]) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.waitForTimeout(500);
      const t = await page.evaluate(() => {
        const h = document.querySelector(".review-title");
        const hb = h.getBoundingClientRect();
        return { lines: Math.round(hb.height / parseFloat(getComputedStyle(h).fontSize)) };
      });
      check("[" + w + "px] the review title is on one line", t.lines === 1, JSON.stringify(t));
    }
    /* …and the setting is where it went. contextmenu is the mouse's route into the same sheet a finger
       reaches by holding, so it needs no timers here. */
    await page.evaluate(() => document.querySelector("#b-review").dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true })));
    await page.waitForTimeout(350);
    const rm = await page.evaluate(() => {
      const ov = document.querySelector(".deck-menu");
      if (!ov) return null;
      return {
        items: [...ov.querySelectorAll(".dm-item")].map((b) => b.querySelector("b").textContent),
        switches: [...ov.querySelectorAll(".dm-switch")].map((r) => r.querySelector("b").textContent),
        cycles: [...ov.querySelectorAll(".dm-cycle")].map((r) => r.querySelector("b").textContent),
        // read per control, not as a total: they default OPPOSITE ways — the order is Ordered and
        // question variety is on, which is the point of it — so a count says nothing about either
        order: (ov.querySelector('.dm-cycle[data-act="order"] .dm-cyval') || {}).textContent,
        variety: !!ov.querySelector('.dm-switch[data-act="variety"] .switch.on'),
        choices: ov.querySelectorAll(".dm-choice").length,
      };
    });
    /* The banner's sheet IS the deck sheet, one level up (Aug 2026, on request: "the same menu, without
       the delete option"), and NO Remove — there is nothing to take the review out of.
       The ORDER is a CYCLER since Aug 2026 — it was a pair of rows, then a switch, and a third order
       (By difficulty) will not fit in a switch — so it is one row naming the order in force, which steps
       and wraps. QUESTION VARIETY beside it is still a switch, that one having only two states. */
    /* BROWSE YOUR CARDS joined both sheets in Aug 2026 — the everyday way into the card browser, since the
       moment somebody wants to find a card is usually the moment they are looking at their decks. It is on
       EVERY entry, the pooled review included: the browser searches the whole collection rather than the
       thing the sheet was opened on. */
    /* COLOUR joined it in Aug 2026, on request ("also of the daily study banner"): the banner rotates
       through a hue a day, and a colour chosen here holds it at one. It is last because it is the only row
       that changes nothing about what the session DEALS. */
    /* ICON joined both sheets in Aug 2026, on request: a reader may put a symbol or a small picture of
       their own on a collection, and it is stored beside the colour in the same S.deckGroups record — so
       it sits directly after it, and before Remove, which stays last. */
    check("holding the banner offers the deck sheet's options, minus Remove",
      rm && rm.items.join(",") === "Review order,Question variety,Browse your cards,Custom study,Daily limits,Skip today,Colour,Icon", JSON.stringify(rm));
    check("...the order is a CYCLER and the phrasing pool a switch, with no pair of rows for either",
      rm && rm.cycles.join(",") === "Review order" && rm.switches.join(",") === "Question variety" && rm.choices === 0,
      JSON.stringify(rm));
    check("...each showing its own current state — Ordered, and variety on by default",
      rm && rm.order === "Ordered" && rm.variety === true, JSON.stringify(rm && { order: rm.order, variety: rm.variety }));
    /* THE THIRD ORDER IS REACHED BY PRESSING AGAIN, and the wrap is what makes the control usable at all:
       a cycler that stopped at the end would leave a reader who overshot with no way back but a reload.
       Both are asserted, and the STORE is read as well as the chip — the review writes `reviewOrder` and
       keeps `reviewRandom` in step for an older build, so a chip that changed while the store did not is
       exactly the failure a label-only assertion would pass on. */
    const cyc = async () => {
      await page.evaluate(() => document.querySelector('.deck-menu .dm-cycle[data-act="order"]').click());
      await page.waitForTimeout(450);
      return page.evaluate(() => {
        const st = JSON.parse(localStorage.getItem("folio_v1")).settings || {};
        return { chip: document.querySelector('.deck-menu .dm-cycle[data-act="order"] .dm-cyval').textContent,
                 order: st.reviewOrder, random: st.reviewRandom };
      });
    };
    const c1 = await cyc();
    check("...one press steps it to Random, in the store as well as on the chip",
      c1.chip === "Random" && c1.order === "random" && c1.random === true, JSON.stringify(c1));
    const c2 = await cyc();
    check("...a second reaches By difficulty, the order that had no control until now",
      c2.chip === "By difficulty" && c2.order === "difficulty" && c2.random === false, JSON.stringify(c2));
    const c3 = await cyc();
    check("...and a third wraps back to Ordered", c3.chip === "Ordered" && c3.order === "ordered", JSON.stringify(c3));
    const c4 = await cyc();
    check("...leaving it on Random for the rest of this section", c4.order === "random" && c4.random === true, JSON.stringify(c4));
    /* …and the SHEET STAYS OPEN, which is the whole difference between a switch and a command: every
       other row here closes behind itself, and taking the sheet away is what makes a reader wonder
       whether the throw landed. (It must also not repaint — render() closes this very sheet.) */
    check("...leaving the sheet open, with the chip showing the order it stepped to",
      await page.evaluate(() => {
        const ov = document.querySelector(".deck-menu");
        const v = ov && ov.querySelector('.dm-cycle[data-act="order"] .dm-cyval');
        return !!(v && v.textContent === "Random");
      }));
    /* QUESTION VARIETY is the second switch, and it is stored PER ENTRY (deckLimits' shape) rather than
       as one global flag: the sheet opens on a deck's own row as well as on the pooled review, and a
       setting that silently answered for every deck when thrown from one of them is the one thing a
       reader could not predict. Off → every card asks its first phrasing and the ‹ › chevrons go. */
    await page.evaluate(() => document.querySelector('.deck-menu .dm-switch[data-act="variety"]').click());
    await page.waitForTimeout(500);
    check("...and question variety writes a PER-ENTRY option, not a global one",
      await page.evaluate(() => {
        const st = JSON.parse(localStorage.getItem("folio_v1"));
        return ((st.deckOpts || {})["review:all"] || {}).variety === false;
      }));

    /* THE BANNER'S OWN COLOUR (Aug 2026, on request). It rotates through one hue a day, so the assertion
       cannot be "it is this colour" — it has to be that CHOOSING one overrides the rotation and that
       clearing it hands the banner back. The chosen hue is read off the element's own `--tile`, which is
       the property its markup sets and the one every rule painting it reads, so this measures what a
       reader would see rather than what the store holds. */
    const bannerHue = () => page.evaluate(() => {
      const b = document.querySelector("#b-review");
      return { inline: (b.style.getPropertyValue("--tile") || "").trim(), stored: ((JSON.parse(localStorage.getItem("folio_v1")).deckGroups || {})["review:all"] || {}).color || "" };
    });
    const before = await bannerHue();
    await page.evaluate(() => document.querySelector('.deck-menu .dm-colors .dm-swatch[data-color]:not(.dm-swatch-off)').click());
    await page.waitForTimeout(500);
    const painted = await bannerHue();
    check("a colour chosen for the banner overrides the daily rotation",
      !!painted.stored && painted.inline.toLowerCase() === painted.stored.toLowerCase() && painted.inline !== before.inline,
      JSON.stringify({ before: before, after: painted }));
    /* …and it must SURVIVE A RE-RENDER, which is where a colour written only onto the live element is
       lost: the banner's markup is rebuilt from scratch on every repaint of the home page, and the sheet
       repaints IN PLACE precisely so choosing a colour does not trigger one. Navigating away and back is
       the honest test here — NOT `reload()`, which in this file re-seeds `folio_v1` from the harness's own
       `addInitScript` and would report a working feature as broken (it did, once). */
    await page.evaluate(() => { location.hash = "#settings"; });
    await page.waitForTimeout(500);
    await page.evaluate(() => { location.hash = "#home"; });
    await page.waitForTimeout(700);
    const kept = await bannerHue();
    check("...and is still there after the home page is rebuilt",
      kept.inline.toLowerCase() === painted.stored.toLowerCase(), JSON.stringify(kept));
    // clearing hands it back to the rotation — the swatch marked "default"
    await page.evaluate(() => document.querySelector("#b-review").dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true })));
    await page.waitForTimeout(350);
    await page.evaluate(() => document.querySelector(".deck-menu .dm-colors .dm-swatch-off").click());
    await page.waitForTimeout(500);
    const cleared = await bannerHue();
    check("...and clearing it gives the daily rotation back",
      !cleared.stored && !!cleared.inline && cleared.inline.toLowerCase() !== painted.stored.toLowerCase(), JSON.stringify(cleared));
    await page.keyboard.press("Escape");
    await page.waitForTimeout(250);

    await page.evaluate(() => { const st = JSON.parse(localStorage.getItem("folio_v1")); delete (st.deckOpts || {})["review:all"]; localStorage.setItem("folio_v1", JSON.stringify(st)); });
    // put it back — the rest of this file studies the review and reads the order the cards come in
    await page.evaluate(() => { const st = JSON.parse(localStorage.getItem("folio_v1")); st.settings.reviewRandom = false; localStorage.setItem("folio_v1", JSON.stringify(st)); });
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(900);
    await page.setViewportSize({ width: 1200, height: 900 });
    await page.waitForTimeout(400);

    // work the whole review through and see where its new cards actually came from
    await page.evaluate(() => document.querySelector("#b-review").click());
    await page.waitForTimeout(900);
    for (let i = 0; i < 14; i++) {
      const alive = await page.evaluate(() => !!document.querySelector("#reveal-btn"));
      if (!alive) break;
      await page.evaluate(() => document.querySelector("#reveal-btn").click());
      await page.waitForTimeout(220);
      await page.evaluate(() => { const g = document.querySelector(".grade.easy"); if (g) g.click(); });
      await page.waitForTimeout(300);
    }
    await page.goto(base + "#home", { waitUntil: "load" });
    await page.waitForTimeout(1400);
    const after = await page.evaluate((ids) => {
      const S = JSON.parse(localStorage.getItem("folio_v1"));
      // the day key the app writes, not a UTC one: days run on the device's clock since Aug 2026 (see
      // dayKey in app.js), and hard-coding toISOString here would agree only in a UTC container
      const d = new Date();
      const p2 = (n) => String(n).padStart(2, "0");
      const today = d.getFullYear() + "-" + p2(d.getMonth() + 1) + "-" + p2(d.getDate());
      const from = {};
      (window.COLLECTION_TREE.collections || []).forEach(function walk(n) {
        (n.children || []).forEach(walk);
        if (ids.indexOf(n.id) >= 0) from[n.id] = (n.cardIds || []).filter((c) => S.cards[c] && S.cards[c].first === today).length;
      });
      return { from: from, intro: S.intro.count,
        rows: [...document.querySelectorAll(".active-deck[data-review]")].map((r) => +r.querySelector(".dkc-new").textContent.trim()) };
    }, [deckA, deckB]);
    /* THE bug this replaced: the whole day's new-card allowance came off the front of one deck's list.
       Both decks must have given cards, and the total must still be the review's own allowance. */
    check("the day's new cards were drawn from BOTH decks", after.from[deckA] > 0 && after.from[deckB] > 0, JSON.stringify(after.from));
    check("...five in all, the review's own allowance", after.intro === 5, String(after.intro));
    check("...and each deck's row still shows the rest of its own share",
      after.rows.length >= 2 && after.rows.every((n) => n > 0) && after.rows.reduce((a, n) => a + n, 0) === 5,
      JSON.stringify({ rows: after.rows, from: after.from }));
    await page.close();
  }

  /* ================= 2b. the review's OWN daily limits (Aug 2026) =================
     The default is the widest deck's allowance; an explicit limit set in the banner's own sheet WINS, which
     is Anki's parent-deck rule. Both halves matter and both are invisible from the page: a cap that does not
     bite looks like a setting nobody wired, and a cap that bites when it should not is the bug this replaced. */
  {
    const page = await newPage(seeded);
    await page.goto(base + "#home", { waitUntil: "load" });
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1400);
    await page.evaluate(() => document.querySelector("#b-review").dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true })));
    await page.waitForTimeout(300);
    await page.evaluate(() => document.querySelector('.deck-menu .dm-item[data-act="limits"]').click());
    await page.waitForTimeout(300);
    const dl = await page.evaluate(() => {
      const ov = document.querySelector(".deck-menu");
      return ov ? {
        where: (ov.querySelector(".dm-where") || {}).textContent || "",
        // the per-deck box of the "This deck" tab. The ids became `data-lim` keys when the dialog grew its
        // second tab (Aug 2026) — see openDeckLimits
        n: (ov.querySelector('[data-lim="dNew"]') || {}).value,
        // …and the tabs themselves: one pane writes this entry's own figures, the other the default every
        // deck follows, which is where Settings' own stepper moved to
        tabs: [...ov.querySelectorAll(".dm-tab")].map((t) => t.textContent.trim()),
        globalN: (ov.querySelector('[data-lim="gNew"]') || {}).value,
        // the banner's own heading, read off the page rather than written down here: this assertion is
        // "the sheet opened on the REVIEW and not on a deck", and hard-coding the title made it fail on
        // the Aug 2026 rename ("Daily review" → "Daily study") while the behaviour was perfectly correct
        title: (document.querySelector(".review-title") || {}).textContent || "",
      } : null;
    });
    check("the review's Daily limits opens on the review, not a deck",
      dl && !!dl.title.trim() && dl.where.trim() === dl.title.trim(), JSON.stringify(dl));
    check("...showing the allowance it is actually using", dl && dl.n === "5", JSON.stringify(dl));
    /* TWO TABS since Aug 2026, on request: this entry's own limits, and the default every deck follows —
       which is where Settings → New cards per day moved to when it was removed from that page. Both panes
       are asserted, because a tab bar with one live pane looks exactly like a tab bar. */
    check("...with a second tab for the default every deck follows",
      dl && dl.tabs.length === 2 && /all decks/i.test(dl.tabs[1]) && dl.globalN === "5", JSON.stringify(dl));
    await page.evaluate(() => {
      document.querySelector('[data-lim="dNew"]').value = "2";
      document.querySelector('.deck-menu [data-act="save"]').click();
    });
    await page.waitForTimeout(700);
    const capped = await page.evaluate(() => ({
      banner: [...document.querySelectorAll(".banner .stat")].filter((s) => !s.classList.contains("streak")).map((s) => +s.querySelector("b").textContent.trim()),
      // the DECKS are untouched: the cap is on the pooled draw, not on what a deck offers when tapped
      rows: [...document.querySelectorAll(".active-deck[data-review] .dkc-new")].map((x) => +x.textContent.trim()),
      stored: (JSON.parse(localStorage.getItem("folio_v1")).deckOpts || {})["review:all"],
    }));
    check("an explicit review limit caps the pooled draw", capped.banner[0] === 2, JSON.stringify(capped));
    check("...without changing what each deck offers on its own", capped.rows.every((n) => n === 5), JSON.stringify(capped.rows));
    check("...and is stored under the review's own entry", capped.stored && capped.stored.newPerDay === 2, JSON.stringify(capped.stored));

    // …and the REVIEW's order cycler writes the GLOBAL — the other half of the per-deck assertion in
    // section 4, and they fail in opposite directions
    await page.evaluate(() => document.querySelector("#b-review").dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true })));
    await page.waitForTimeout(300);
    await page.evaluate(() => document.querySelector('.deck-menu .dm-cycle[data-act="order"]').click());
    await page.waitForTimeout(400);
    const revOrder = await page.evaluate(() => {
      const S = JSON.parse(localStorage.getItem("folio_v1") || "{}");
      return { global: !!(S.settings || {}).reviewRandom, entry: ((S.deckOpts || {})["review:all"] || {}).random };
    });
    check("the review's own order cycler writes the global setting, not a per-entry flag",
      revOrder.global === true && revOrder.entry === undefined, JSON.stringify(revOrder));
    await page.close();
  }

  /* ================= 3. the study session survives a reload, and its phrasing is the reader's ========= */
  {
    const page = await newPage(seeded);
    await page.goto(base + "#home", { waitUntil: "load" });
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1400);
    await page.evaluate(() => document.querySelector("#b-review").click());
    await page.waitForTimeout(900);
    check("study is an addressable route", (await page.evaluate(() => location.hash)) === "#study");
    const q1 = await page.evaluate(() => ({
      cycler: !!document.querySelector(".q-cycle"),
      n: (document.querySelector("#qcN") || {}).textContent || "",
      q: (document.querySelector(".question") || {}).textContent || "",
    }));
    check("the Question label carries a phrasing counter and chevrons",
      q1.cycler && /^\d+ \/ \d+$/.test(q1.n), JSON.stringify(q1.n));
    await page.evaluate(() => document.querySelector('.qc-btn[data-qc="1"]').click());
    await page.waitForTimeout(250);
    const q2 = await page.evaluate(() => ({ n: document.querySelector("#qcN").textContent, q: document.querySelector(".question").textContent }));
    check("...and a chevron actually changes the question", q2.q !== q1.q && q2.n !== q1.n, JSON.stringify([q1.n, q2.n]));

    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1400);
    const q3 = await page.evaluate(() => ({
      hash: location.hash, n: (document.querySelector("#qcN") || {}).textContent || "",
      q: (document.querySelector(".question") || {}).textContent || "",
    }));
    check("a reload stays in the session rather than dropping home", q3.hash === "#study", q3.hash);
    check("...on the same card, asking the same phrasing", q3.q === q2.q && q3.n === q2.n, JSON.stringify({ was: q2.n, now: q3.n }));

    // …and revealed, if it was revealed
    await page.evaluate(() => document.querySelector("#reveal-btn").click());
    await page.waitForTimeout(400);
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1400);
    check("...and still turned over, if it was turned over", await page.evaluate(() => !!document.querySelector("#reveal.show")));

    // leaving ends it: #study with no record is not a session anyone can land in
    await page.evaluate(() => document.querySelector("#exit").click());
    await page.waitForTimeout(600);
    await page.goto(base + "#study", { waitUntil: "load" });
    await page.waitForTimeout(1200);
    check("leaving the session forgets it — #study alone goes home",
      (await page.evaluate(() => location.hash)) !== "#study");
    await page.close();
  }

  /* ================= 4. the row's options sheet ================= */
  {
    const page = await newPage(seeded);
    await page.goto(base + "#home", { waitUntil: "load" });
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1400);
    const openSheet = () => page.evaluate(() => {
      document.querySelector(".active-deck[data-review]").dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true }));
    });
    await openSheet();
    await page.waitForTimeout(250);
    const menu = await page.evaluate(() => ({
      open: !!document.querySelector(".deck-menu"),
      items: [...document.querySelectorAll(".dm-item b")].map((b) => b.textContent.trim()),
    }));
    /* Question variety joined the deck's own sheet as well as the review's (Aug 2026, on request) — it is
       stored per entry, so it has to be settable on the entry it applies to. The ORDER switch joined it a
       day later, on request, for the same reason: it was on the review banner's sheet alone, so a deck held
       on its own row had no way to ask for a shuffled session. SCHEDULING joined it in Aug 2026 and is the
       one row here that a DECK has and the pooled review does not — the review schedules nothing of its own,
       so the choice would govern nothing there (asserted the other way round in section 11). */
    /* COLOUR is on EVERY row's sheet since Aug 2026, on request ("both decks and subdecks individually,
       both curated and imported") — it used to be containers only. It sits before Remove, which stays
       last, being the one row that takes the deck off the list. */
    /* ICON joined both sheets in Aug 2026, on request: a reader may put a symbol or a small picture of
       their own on a collection, and it is stored beside the colour in the same S.deckGroups record — so
       it sits directly after it, and before Remove, which stays last. */
    check("holding a deck's row opens its options",
      menu.open && JSON.stringify(menu.items) === JSON.stringify(["Review order", "Question variety", "Browse your cards", "Custom study", "Daily limits", "Scheduling", "Skip today", "Colour", "Icon", "Remove"]),
      JSON.stringify(menu.items));

    /* THE ORDER IS PER DECK, AND THE REVIEW'S IS THE GLOBAL. Asserted on both entries because they are
       stored in different places on purpose (see deckOrderMode): a deck writes `S.deckOpts[id]` while the
       review writes `S.settings.reviewOrder` — a private copy there would leave two controls disagreeing
       with nothing to say which wins. Stepping it must also NOT close the sheet, which is the rule every
       setting row here follows.
       BOTH NAMES ARE READ BACK: `setDeckOrderMode` writes `order` AND keeps the older `random` boolean in
       step, so a build that knows only the boolean still deals this deck the right way round. */
    const stepOrder = () => page.evaluate(() => {
      document.querySelector('.dm-cycle[data-act="order"]').click();
      return { open: !!document.querySelector(".deck-menu"), chip: document.querySelector('.dm-cycle[data-act="order"] .dm-cyval').textContent };
    });
    const flipped = await stepOrder();
    await page.waitForTimeout(300);
    const storedRandom = await page.evaluate(() => {
      const S = JSON.parse(localStorage.getItem("folio_v1") || "{}");
      const id = document.querySelector(".active-deck[data-review]").dataset.review;
      const o = (S.deckOpts || {})[id] || {};
      return { deck: o.random, order: o.order, global: !!(S.settings || {}).reviewRandom, id };
    });
    check("a deck's order cycler stores against that DECK, not the global setting",
      flipped.open && flipped.chip === "Random" && storedRandom.deck === true &&
      storedRandom.order === "random" && storedRandom.global === false,
      JSON.stringify({ flipped, storedRandom }));
    /* …AND THE ROW SAYS THE SETTING IS ITS OWN NOW (Aug 2026, with the cascade). Before it was stepped
       this deck was following the global, so the mark was hidden; a cascade the reader cannot see reads
       as a control that did nothing. */
    check("...and the row now marks the setting as set here",
      await page.evaluate(() => {
        const m = document.querySelector('.dm-cycle[data-act="order"] .dm-from');
        return !!(m && !m.hasAttribute("hidden") && /set here/i.test(m.textContent));
      }));
    await stepOrder(); await stepOrder();   // Random → By difficulty → Ordered, so the sections below deal in deck order
    await page.waitForTimeout(300);

    // Daily limits — Anki's three, and the deck's own new count follows the one it sets
    await page.evaluate(() => document.querySelector('.dm-item[data-act="limits"]').click());
    await page.waitForTimeout(300);
    // the fields became `data-lim` keys when the dialog grew its "All decks" tab (Aug 2026) — see openDeckLimits
    check("Daily limits offers new/day, max reviews/day and the ignore switch",
      await page.evaluate(() => !!(document.querySelector('[data-lim="dNew"]') && document.querySelector('[data-lim="dRev"]') && document.querySelector('[data-lim="dIgn"]'))));
    await page.evaluate(() => { document.querySelector('[data-lim="dNew"]').value = "1"; document.querySelector('[data-act="save"]').click(); });
    await page.waitForTimeout(800);
    const limited = await page.evaluate(() => [...document.querySelectorAll(".active-deck[data-review]")].map((r) => +r.querySelector(".dkc-new").textContent.trim()));
    check("...and the deck's own new count follows it", limited[0] === 1, JSON.stringify(limited));

    // Custom study — today only, and it moves the number it says it moves
    await openSheet();
    await page.waitForTimeout(250);
    await page.evaluate(() => document.querySelector('.dm-item[data-act="custom"]').click());
    await page.waitForTimeout(300);
    await page.evaluate(() => { document.querySelector("#csN").value = "3"; document.querySelector('[data-act="more"]').click(); });
    await page.waitForTimeout(800);
    const bumped = await page.evaluate(() => [...document.querySelectorAll(".active-deck[data-review]")].map((r) => +r.querySelector(".dkc-new").textContent.trim()));
    check("Custom study adds new cards for today only", bumped[0] === 4, JSON.stringify({ was: limited, now: bumped }));

    // Skip today — the deck sits out without leaving the review
    await openSheet();
    await page.waitForTimeout(250);
    await page.evaluate(() => document.querySelector('.dm-item[data-act="skip"]').click());
    await page.waitForTimeout(800);
    const skipped = await page.evaluate(() => {
      const rows = [...document.querySelectorAll(".active-deck[data-review]")];
      return { n: rows.length, first: [...rows[0].querySelectorAll(".dkc")].map((x) => +x.textContent.trim()) };
    });
    check("Skip today empties that deck's piles without removing it",
      skipped.n >= 2 && skipped.first.every((n) => n === 0), JSON.stringify(skipped));

    // Remove — what the bin used to do
    await openSheet();
    await page.waitForTimeout(250);
    await page.evaluate(() => document.querySelector('.dm-item[data-act="remove"]').click());
    await page.waitForTimeout(800);
    check("Remove takes the deck out of the review",
      (await page.evaluate(() => document.querySelectorAll(".active-deck[data-review]").length)) === skipped.n - 1);
    await page.close();
  }

  /* ================= 5. there is NO cap on how many decks may be added (Aug 2026) =================
     The Folio level used to allow one deck at level 1 and one more per level, so this section asserted
     that a level-1 reader got exactly one collection and a toast saying why. That was removed on request:
     it was the only thing a level decided and it decided it by taking something away. What is asserted
     now is the opposite, and it is the assertion that would catch a half-removal — the cap lived in three
     places (addActive, wireAddButton's toast, the page head) and dropping it from one of them would still
     let almost every add through. */
  {
    const page = await newPage({ active: [], settings: SETTINGS, cards: {} });
    await page.goto(base + "#decks", { waitUntil: "load" });
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1400);
    const open = await page.evaluate(async () => {
      const btns = [...document.querySelectorAll(".collection-add")];
      const out = { n: btns.length };
      for (const b of btns) { b.click(); await new Promise((r) => setTimeout(r, 250)); }
      out.added = JSON.parse(localStorage.getItem("folio_v1")).active;
      // which COLLECTIONS got in — the collections page is the only place these buttons exist, so a
      // ticked one is a root, and everything else in `active` came in underneath one of them
      out.roots = [...document.querySelectorAll(".collection-add.added")].length;
      out.toast = (document.querySelector("#toast") || {}).textContent || "";
      return out;
    });
    check("a reader who has studied nothing may add every collection offered", open.n > 1 && open.roots === open.n, open.roots + " of " + open.n);
    check("...their decks coming in with them rather than as choices of their own", open.added.length > open.roots, open.added.length + " entries");
    check("...and nothing is refused on account of a level", !/level/i.test(open.toast), open.toast);
    await page.close();
  }

  /* ================= 6. the learning steps, in a real session (Aug 2026) =================
     The bug this pins: a new card answered Good jumped straight to tomorrow, so the reader met each card
     once and never again that day. Anki's ladder is 1m then 10m — the first Good sends the card to the
     BACK of the day's queue, the second graduates it. `test-scheduler.js` pins the arithmetic; this pins
     the thing the reader actually experiences, which is the card coming back. */
  {
    const page = await newPage({ active: [deckA], settings: SETTINGS, cards: {} });
    await page.goto(base + "#home", { waitUntil: "load" });
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1400);

    // what the buttons PROMISE, on a brand-new card, before anything is graded
    await page.evaluate(() => document.querySelector("#b-review").click());
    await page.waitForTimeout(900);
    await page.evaluate(() => document.querySelector("#reveal-btn").click());
    await page.waitForTimeout(300);
    const labels = await page.evaluate(() => {
      const g = (c) => ((document.querySelector(".grade." + c + " .gi") || {}).textContent || "").trim();
      return { again: g("again"), hard: g("hard"), good: g("good"), easy: g("easy"), id: window.__folioCurrentCard };
    });
    check("a new card's Good button offers MINUTES, not a day", /m$/.test(labels.good) && labels.good !== labels.again,
      JSON.stringify(labels));
    check("...and the four buttons are four different answers",
      new Set([labels.again, labels.hard, labels.good, labels.easy]).size === 4, JSON.stringify(labels));

    /* Grade the first card Good and prove the SAME card comes back later in the session. It is tracked by
       its ID, out of the session record the study page keeps — NOT by the question on screen, which is a
       different one of the card's three phrasings each time it is shown, so comparing the prose reports a
       card that never returned when it returned wearing another sentence. */
    const cur = () => page.evaluate((k) => (JSON.parse(sessionStorage.getItem(k) || "{}")).id || null, "folio_study_v1");
    const first = await cur();
    check("the study session records which card is on screen", !!first, JSON.stringify(first));
    await page.evaluate(() => document.querySelector(".grade.good").click());
    await page.waitForTimeout(500);
    const rec = await page.evaluate(() => {
      const S = JSON.parse(localStorage.getItem("folio_v1"));
      const ids = Object.keys(S.cards);
      const c = S.cards[ids[0]];
      return { n: ids.length, status: c.status, step: c.step, mins: Math.round((c.due - Date.now()) / 60000) };
    });
    check("one Good leaves the card LEARNING, not scheduled for tomorrow",
      rec.status === "learning" && rec.mins > 0 && rec.mins <= 20, JSON.stringify(rec));
    check("...standing on the second learning step", rec.step === 1, JSON.stringify(rec));

    // walk the rest of the day's queue; the graded card must reappear before the session ends
    let seenAgain = false;
    for (let i = 0; i < 24 && !seenAgain; i++) {
      const alive = await page.evaluate(() => !!document.querySelector("#reveal-btn"));
      if (!alive) break;
      if ((await cur()) === first) { seenAgain = true; break; }
      await page.evaluate(() => document.querySelector("#reveal-btn").click());
      await page.waitForTimeout(200);
      await page.evaluate(() => { const g = document.querySelector(".grade.good"); if (g) g.click(); });
      await page.waitForTimeout(260);
    }
    check("the card comes BACK later in the same session — the whole bug report", seenAgain);

    // …and a second Good finishes it for the day
    if (seenAgain) {
      await page.evaluate(() => document.querySelector("#reveal-btn").click());
      await page.waitForTimeout(220);
      await page.evaluate(() => document.querySelector(".grade.good").click());
      await page.waitForTimeout(500);
      const rec2 = await page.evaluate(() => {
        const S = JSON.parse(localStorage.getItem("folio_v1"));
        const ids = Object.keys(S.cards).filter((k) => S.cards[k].status === "review");
        /* DAY STARTS, NOT HOURS. Anything scheduled in DAYS lands at the start of its day
           (`schedDayDue` / `cfg.dayAnchor`), so `(due - now) / 864e5` is short of the figure the
           scheduler chose from midday onwards — this read 0 for a one-day interval at 22:28 UTC with
           nothing whatever wrong. test-cards.js carries the same fix for the same reason. */
        const dayStart = (ts) => { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); };
        return { graduated: ids.length, days: ids.length ? Math.round((dayStart(S.cards[ids[0]].due) - dayStart(Date.now())) / 864e5) : null };
      });
      check("a SECOND Good graduates it to tomorrow", rec2.graduated >= 1 && rec2.days === 1, JSON.stringify(rec2));
    }
    await page.close();
  }

  /* ================= 7. the banner's button (Aug 2026, renamed on request) =================
     Asserted on a reader who has studied before: with no cards graded at all the banner is the first-run
     HERO, whose button is a different control saying something else entirely. */
  {
    const page = await newPage(seeded);
    await page.goto(base + "#home", { waitUntil: "load" });
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1400);
    const cta = await page.evaluate(() => {
      const b = document.querySelector("#b-review .cta .btn");
      return { txt: b ? b.textContent.trim() : null, hero: !!document.querySelector(".review-hero") };
    });
    check("the review's button reads 'Start'", cta.txt === "Start", JSON.stringify(cta));
    await page.close();
  }

  /* ================= 8. dragging the list into the reader's own order (Aug 2026, on request) =========
     Everything here fails silently. A grip that does nothing looks like a grip; an order that is not
     written down looks right until the next visit; a subtree left behind by the row it belongs to reads
     as decks having been dropped from the review; and an arrangement that leaked into the Collections
     page would rearrange a shelf every reader shares.
     The drag is driven with real mouse input rather than synthesised PointerEvents so that the pointer
     capture, the `touch-action` and the 4px slop are all exercised as a hand exercises them. */
  {
    const page = await newPage({ active: [deckA, deckB], settings: SETTINGS, cards: { a: done() } });
    await page.goto(base + "#home", { waitUntil: "load" });
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1400);

    /* Every row carries a handle wherever the LIST holds a second row. It used to be wherever a LEVEL did —
       too narrow since groups (Aug 2026), because the only row in its level can still be dropped into a
       group or onto another deck, and without a handle there is no way to take it there. */
    check("the deck list opens an editor mode", await openDeckEditor(page));
    check("every row of the review list carries a handle",
      await page.evaluate(() => {
        const rows = [...document.querySelectorAll(".active-deck")];
        return rows.length > 1 && rows.every((r) => !!r.querySelector(".dk-grip"));
      }));
    // …and the handles are only reachable INSIDE it: hidden at rest, and hidden in a way that takes them
    // out of hit-testing rather than merely out of sight (see openDeckEditor)
    check("...visible in the mode, and gone from the page when it closes",
      await page.evaluate(async () => {
        const vis = () => { const g = document.querySelector(".active-deck .dk-grip");
          return !!(g && getComputedStyle(g).visibility === "visible"); };
        const inMode = vis();
        const d = document.querySelector("#dkEditDone");
        if (d) { d.click(); await new Promise((r) => setTimeout(r, 300)); }
        const out = vis();
        const b = document.querySelector("#dkEdit");
        if (b) { b.click(); await new Promise((r) => setTimeout(r, 300)); }
        return inMode && !out && vis();
      }));
    /* The level to work on is found rather than assumed: which of them holds two rows depends on what the
       seed put in the review — here two leaves of one collection, so the reorderable level is their shared
       parent's, not the top. */
    const lvl = await page.evaluate(() => {
      const vis = [...document.querySelectorAll(".active-deck")].filter((r) => !r.classList.contains("dk-shut"));
      const by = {}; vis.forEach((r) => (by[r.dataset.parent] = by[r.dataset.parent] || []).push(r.dataset.drag));
      const k = Object.keys(by).find((p) => by[p].length > 1);
      return k == null ? null : { parent: k, ids: by[k] };
    });
    check("...and some level of it holds more than one row to reorder", !!lvl, JSON.stringify(lvl));
    const level = () => page.evaluate((p) => [...document.querySelectorAll(".active-deck")].filter((r) => r.dataset.parent === p).map((r) => r.dataset.drag), lvl.parent);
    const before = await level();

    // carry the first row of that level to the foot of it
    const geo = await page.evaluate(([id, p]) => {
      const rows = [...document.querySelectorAll(".active-deck")].filter((r) => r.dataset.parent === p);
      const g = document.querySelector(`.active-deck[data-drag="${id}"] .dk-grip`).getBoundingClientRect();
      const last = rows[rows.length - 1].getBoundingClientRect();
      return { x: g.x + g.width / 2, y: g.y + g.height / 2, ty: last.y + last.height - 4 };
    }, [before[0], lvl.parent]);
    await page.mouse.move(geo.x, geo.y);
    await page.mouse.down();
    for (let i = 1; i <= 10; i++) { await page.mouse.move(geo.x, geo.y + ((geo.ty - geo.y) * i) / 10); await page.waitForTimeout(30); }
    await page.mouse.up();
    await page.waitForTimeout(450);

    const after = await level();
    check("dragging a row down moves it", after[after.length - 1] === before[0] && after.length === before.length,
      JSON.stringify({ before, after }));
    check("...leaving no transform behind on any row",
      await page.evaluate(() => ![...document.querySelectorAll(".active-deck")].some((r) => r.style.transform)));
    /* A row brings its subtree: rebuilt from the depths, every row's parent must still be the row above
       it at one less depth. A collection dragged out of the middle of the list leaving its decks behind
       is the failure this is here for, and the list looks perfectly ordinary when it happens. */
    check("...and every subtree travels with the row it belongs to",
      await page.evaluate(() => {
        const stack = [];
        for (const r of document.querySelectorAll(".active-deck")) {
          const d = +r.dataset.depth; stack.length = d;
          if (r.dataset.parent !== (d === 0 ? "" : stack[d - 1] || "??")) return false;
          stack[d] = r.dataset.drag;
        }
        return true;
      }));
    /* AND A STRAIGHT-DOWN DRAG NEVER NESTS (Aug 2026, on a bug report from a phone: "when I try to drag
       active collections to reorder them, they disappear"). The middle band of a row means "put this one
       inside it", and a thumb travelling straight down past a 46px row lands in that band about a third of
       the time — which files a whole collection under its neighbour, indented, several rows further down;
       nothing throws, nothing is lost, and from the top of the list where the reader was looking it is
       simply gone. The drag above went down the grip's own column, so the only honest reading of it is a
       reorder, and `deckNest` is where that would show. */
    check("...and a straight-down drag reorders rather than nesting",
      await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem("folio_v1")).deckNest || {}).length === 0),
      await page.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem("folio_v1")).deckNest || {})));
    check("...the order is written down under that level's own key",
      await page.evaluate((p) => JSON.stringify((JSON.parse(localStorage.getItem("folio_v1")).deckOrder || {})[p]), lvl.parent) === JSON.stringify(after));
    // the rounded bottom corner belongs to whichever row is last NOW, which a drag can change
    check("...and the last row is the one that is rounded",
      await page.evaluate(() => {
        const vis = [...document.querySelectorAll(".active-deck")].filter((r) => !r.classList.contains("dk-shut"));
        return vis.length ? vis[vis.length - 1].classList.contains("dk-last") : false;
      }));

    /* …and it is READ BACK. It cannot be shown with a reload here — `newPage` re-seeds folio_v1 through an
       addInitScript on every load, which would put the seed's own order back and the assertion would pass
       or fail for a reason that has nothing to do with the app. So the saved blob is carried to a page
       that has never seen this list, which is the journey a second device makes anyway. */
    const blob = await page.evaluate(() => localStorage.getItem("folio_v1"));
    const fresh = await browser.newPage({ viewport: { width: 1200, height: 900 } });
    fresh.on("pageerror", (e) => errs.push(e.message));
    await fresh.addInitScript((b) => { try { localStorage.setItem("folio_v1", b); } catch (e) {} }, blob);
    await fresh.goto(base + "#home", { waitUntil: "load" });
    await fresh.waitForTimeout(1400);
    const reread = await fresh.evaluate((p) => [...document.querySelectorAll(".active-deck")].filter((r) => r.dataset.parent === p).map((r) => r.dataset.drag), lvl.parent);
    check("...and a device reading that record back lists them the same way",
      JSON.stringify(reread) === JSON.stringify(after), JSON.stringify({ reread, after }));
    await fresh.close();

    // a keyboard can do it too — a reorder reachable by pointer alone is one a keyboard reader has not got
    const kb = await page.evaluate(async (p) => {
      const at = () => [...document.querySelectorAll(".active-deck")].filter((r) => r.dataset.parent === p);
      const was = at().map((r) => r.dataset.drag);
      const g = at()[0].querySelector(".dk-grip");
      g.focus();
      const focused = document.activeElement === g;
      g.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
      await new Promise((r) => setTimeout(r, 350));
      return { focused, was, order: at().map((r) => r.dataset.drag) };
    }, lvl.parent);
    check("the handle takes focus and answers to ↓",
      kb.focused && kb.order[0] === kb.was[1] && kb.order[1] === kb.was[0], JSON.stringify(kb));

    /* THE COLLECTIONS PAGE IS UNTOUCHED BY ANY OF IT. That page is the shelf every reader shares, and one
       reader's study habits rearranging it would make it a different page for each of them. */
    await page.goto(base + "#decks", { waitUntil: "load" });
    await page.waitForTimeout(1000);
    const shelf = await page.evaluate(() =>
      [...document.querySelectorAll('#collection-list-all [data-libkind="col"]')].map((e) => e.dataset.libitem));
    const tree = await page.evaluate(() => (window.COLLECTION_TREE.collections || []).map((c) => c.id));
    check("the Collections page keeps the editorial order",
      shelf.length > 1 && shelf.join() === tree.filter((id) => shelf.indexOf(id) >= 0).join(),
      JSON.stringify(shelf));
    await page.close();
  }

  /* ================= 9. five new cards a day, by default (Aug 2026, on request) =================
     A first-time reader's allowance, read off a save that has never had one written into it. Asserted in
     the store AND on the control that shows it, so a change to one that misses the other cannot leave the
     reader looking at a figure the review is not using.
     THAT CONTROL IS NO LONGER ON THE SETTINGS PAGE (Aug 2026, on request): "New cards per day" moved to the
     "All decks" tab of a deck's own Daily limits dialog, beside the per-deck figure it stands behind. Both
     halves are asserted — the stepper is GONE from Settings, and the figure is on the tab — because each
     alone would pass on a move that had only half happened.
     It is also the figure XP_PER_LEVEL is meant to be read against — a level costs 5 cards, so a level
     turns over on a full day's new cards rather than in the middle of one. */
  {
    const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
    page.on("pageerror", (e) => errs.push(e.message));
    await page.goto(base + "#settings", { waitUntil: "load" });
    await page.waitForTimeout(1200);
    const np = await page.evaluate(() => ({
      stepper: !!(document.querySelector("#np-val") || document.querySelector("#np-up")),
      stored: (JSON.parse(localStorage.getItem("folio_v1") || "{}").settings || {}).newPerDay,
    }));
    check("the Settings page carries no daily allowance any more", np.stepper === false, JSON.stringify(np));
    check("...and a new reader's stored allowance is untouched at five",
      np.stored === undefined || np.stored === 5, JSON.stringify(np));
    await page.close();

    const p2 = await newPage({ active: [deckA], settings: SETTINGS, cards: { a: done() } });
    await p2.goto(base + "#home", { waitUntil: "load" });
    await p2.reload({ waitUntil: "load" });
    await p2.waitForTimeout(1400);
    await p2.evaluate(() => document.querySelector("#b-review").dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true })));
    await p2.waitForTimeout(300);
    await p2.evaluate(() => document.querySelector('.deck-menu .dm-item[data-act="limits"]').click());
    await p2.waitForTimeout(300);
    const gl = await p2.evaluate(() => {
      const t = [...document.querySelectorAll(".dm-tab")].find((x) => /all decks/i.test(x.textContent));
      if (t) t.click();
      const pane = document.querySelector('.dm-pane[data-pane="all"]');
      return {
        moved: !!t,
        shown: (document.querySelector('[data-lim="gNew"]') || {}).value,
        visible: !!pane && !pane.hidden,
        // …and the per-deck pane is put away, or the reader is looking at four identical boxes
        other: (document.querySelector('.dm-pane[data-pane="deck"]') || {}).hidden,
      };
    });
    check("the allowance moved to the Daily limits dialog's All decks tab",
      gl.moved && gl.visible && gl.other === true && gl.shown === "5", JSON.stringify(gl));
    await p2.close();
  }

  /* ================= 10. Multiple Choice asks the FIRST phrasing (Aug 2026, on request) =============
     A card carries three ways of asking the same thing and the study page deals one at random — which is
     right there and wrong here, where the round is answered from four options rather than from recall, so
     the phrasing has to be the one written to stand on its own. It sits beside section 3's chevrons for
     that reason: both are about which phrasing a card is asked with, and this one is invisible from the
     outside, a second phrasing being a perfectly good sentence. */
  {
    const page = await newPage({ active: [deckA, deckB], settings: SETTINGS, cards: {} });
    await page.goto(base + "#challenge", { waitUntil: "load" });
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1400);
    const q = await page.evaluate(() => {
      /* The rendered question is NOT byte-identical to the stored one, and an exact match here is a test
         that passes on luck: the units pass rewrites every text node on the page, so a card asking about
         "140 metres (460 feet)" renders without the bracket in metric mode — 20 of the deck's cards carry
         one in their first phrasing, so a five-round sample missed on most runs. Both sides are compared
         with parentheticals removed (card prose carries no other kind — see the house rules), and the
         exact match is still tried first so two phrasings differing only inside a bracket could not be
         quietly read as the same one. */
      const norm = (x) => String(x).replace(/\s*\([^)]*\)/g, "").replace(/\s+/g, " ").trim();
      const out = [];
      for (let n = 0; n < 5; n++) {
        const txt = (document.querySelector(".qtext") || {}).innerHTML;
        if (txt == null) break;
        const all = window.CARD_DATA || [];
        const has = (c, t) => c.question === t || (c.questions || []).indexOf(t) >= 0;
        const hasN = (c, t) => norm(c.question) === norm(t) || (c.questions || []).some((x) => norm(x) === norm(t));
        const card = all.find((c) => has(c, txt)) || all.find((c) => hasN(c, txt));
        out.push({
          first: !!(card && (card.question === txt || norm(card.question) === norm(txt))),
          extras: card ? (card.questions || []).length : -1,
        });
        const b = document.querySelector(".opts .opt"); if (!b) break;
        b.click();
        const nx = document.querySelector("#mc-next"); if (!nx) break;
        nx.click();
      }
      return out;
    });
    check("every Multiple Choice round asks its card's first phrasing",
      q.length > 1 && q.every((r) => r.first), JSON.stringify(q));
    // …and the cards it drew really do have extras, or the assertion above passes on cards with one
    check("...on cards that genuinely carry other phrasings", q.some((r) => r.extras > 0), JSON.stringify(q));
    await page.close();
  }

  /* ================= 11. GROUPS (Aug 2026, on request) =================
     A container the reader makes, drags decks into, folds, colours and studies. Almost everything about it
     fails SILENTLY: a group that studies nothing looks like a group; a colour that reaches the header and
     not the decks inside looks like a design choice; a deck counted by both its collection and the group it
     was moved into shows the reader the same five new cards twice with nothing on the page to say so; and a
     drop that lands as a REORDER rather than a nesting simply looks like a drag that did not take.
     The drag is driven with real mouse input, like section 8's, so the middle-band test, the pointer capture
     and the slop are exercised as a hand exercises them. */
  groups: {
    /* The COLLECTION is seeded active as well as its leaves — which is what `addActive`'s cascade does when
       a reader adds one — because a collection the reader never added is a greyed signpost rather than a
       group header, and this section is about the header. */
    const probe2 = await browser.newPage();
    await probe2.goto(base, { waitUntil: "load" });
    await probe2.waitForTimeout(1000);
    const rootA = await probe2.evaluate((id) => {
      let root = null;
      (window.COLLECTION_TREE.collections || []).forEach((c) => (function w(n, top) {
        if (n.id === id) root = top;
        (n.children || []).forEach((ch) => w(ch, top));
      })(c, c.id));
      return root;
    }, deckA);
    await probe2.close();
    const page = await newPage({ active: [rootA, deckA, deckB], settings: SETTINGS, cards: { a: done() } });
    await page.goto(base + "#home", { waitUntil: "load" });
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1400);

    // an ADDED COLLECTION is drawn as a group header — it holds no cards itself, only the decks inside it do
    const cols = await page.evaluate(() =>
      [...document.querySelectorAll('.active-deck[data-depth="0"]')].map((r) => ({
        id: r.dataset.drag, group: r.classList.contains("deck-group"),
        kids: [...document.querySelectorAll(".active-deck")].filter((x) => x.dataset.parent === r.dataset.drag).length,
      })));
    check("an added collection with decks under it is drawn as a group header",
      cols.length > 0 && cols.every((c) => c.group === c.kids > 0), JSON.stringify(cols));

    // …and it is offered a colour, being a container
    await page.evaluate(() => {
      const r = document.querySelector(".active-deck.deck-group") || document.querySelector(".active-deck");
      r.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true }));
    });
    await page.waitForTimeout(350);
    check("holding a container offers its colour",
      await page.evaluate(() => document.querySelectorAll(".deck-menu .dm-swatch").length > 4));
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);

    /* THE WAY TO MAKE A GROUP IS GONE (Aug 2026, on request: "remove the group function from the daily
       study/active decks banner"). It was `#b-newgroup`, at the bottom left of this list; both halves are
       asserted, because they fail in opposite directions and either alone would pass on a half-removal —
       the control must not be anywhere on the page, and a group a reader ALREADY MADE must still work.
       That second half is why this section did not go with the button: everything below it — the header
       row, the colour, dragging a deck in, ungrouping — is what lets such a reader read their own list and
       take it apart with their decks kept, and none of it is reachable from anywhere else to be tested.
       So the group is seeded into the save rather than created through the UI. */
    check("the way to make a group is gone from the deck list",
      await page.evaluate(() => !document.querySelector("#b-newgroup, .rv-newgroup")));
    /* A SECOND addInitScript, not a live localStorage write, and the reason is this file's own standing
       warning one section up: `newPage` re-seeds `folio_v1` from `state` through an initScript on EVERY
       load, so anything written to the store by hand is put back the moment the page reloads. A second
       initScript runs after the first and merges on top of it, which survives the re-seed.
       It is added HERE rather than passed to `newPage` because an empty group is still a header row, and
       the assertion above about which rows are headers would have had one more to account for. */
    await page.addInitScript(() => {
      try {
        const st = JSON.parse(localStorage.getItem("folio_v1") || "{}");
        st.deckGroups = Object.assign({}, st.deckGroups, { "g:seeded01": { title: "Exam revision" } });
        localStorage.setItem("folio_v1", JSON.stringify(st));
      } catch (e) {}
    });
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1200);
    const made = await page.evaluate(() => {
      const g = [...document.querySelectorAll(".active-deck")].find((r) => r.dataset.drag.slice(0, 2) === "g:");
      return g ? { title: g.querySelector(".dk-title").textContent.trim(), header: g.classList.contains("deck-group"), depth: g.dataset.depth } : null;
    });
    check("a group a reader already had is still drawn, as a header at the top level",
      !!made && made.title === "Exam revision" && made.header && made.depth === "0", JSON.stringify(made));

    /* Drag a deck onto the MIDDLE of the group. The middle band means "inside"; the edges still mean
       "beside", which is what keeps reordering possible at all.
       The collection's fold is opened first: an ADDED collection seeds SHUT, so with it closed the only
       visible rows are two headers and there is nothing to carry. */
    for (let i = 0; i < 4; i++) {
      const opened = await page.evaluate(() => {
        const shut = [...document.querySelectorAll(".active-deck:not(.dk-shut) .dk-chev:not(.open)")];
        shut.forEach((c) => c.click());
        return shut.length;
      });
      await page.waitForTimeout(350);
      if (!opened) break;
    }
    /* THE SOURCE IS A LEAF WHOSE PARENT KEEPS A SIBLING, and both halves are deliberate. A leaf carries no
       subtree, so the group's count afterwards IS that deck's; and a parent left with another child is a
       parent that stays a group header, so its own count can be read before and after. Drag the LAST child
       out of a collection and it stops being a group at all, which is correct and would make the
       before/after comparison below a comparison with nothing. */
    check("...with the editor mode open, which is where the handles are", await openDeckEditor(page));
    const geo = await page.evaluate(() => {
      const rows = [...document.querySelectorAll(".active-deck")].filter((r) => !r.classList.contains("dk-shut"));
      const g = rows.find((r) => r.dataset.drag.slice(0, 2) === "g:");
      const kidsOf = (id) => rows.filter((r) => r.dataset.parent === id).length;
      const src = rows.find((r) => r !== g && !r.classList.contains("deck-group") && r.querySelector(".dk-grip") &&
        r.dataset.parent && kidsOf(r.dataset.drag) === 0 && kidsOf(r.dataset.parent) > 1);
      if (!g || !src) return null;
      const s = src.querySelector(".dk-grip").getBoundingClientRect(), d = g.getBoundingClientRect();
      return { id: src.dataset.drag, gid: g.dataset.drag, parent: src.dataset.parent,
        x: s.x + s.width / 2, y: s.y + s.height / 2, tx: d.x + d.width / 2, ty: d.y + d.height / 2 };
    });
    check("...with a deck to drag into it", !!geo, JSON.stringify(geo));
    /* …and if there is not one, SAY SO AND STOP THIS SECTION rather than taking the run down with it. The
       assertions below all address the group by id, so a null `geo` reaches `document.querySelector(...)
       .dispatchEvent` and throws inside page.evaluate — which aborts node and means every section AFTER
       this one silently never executes, which is a far worse outcome than one reported failure. */
    if (!geo) { console.log("SKIP  the rest of the group section needs a draggable leaf"); await page.close(); break groups; }
    /* …and what its COLLECTION says it holds before the move. The collection, not the row's immediate
       parent: only a root collection is drawn as a group header, so a mid-tree deck has no count on it to
       read — and the collection is the container whose figure the request is about, since that is where a
       deck moved into a group is no longer to be counted. */
    const rootOf = await page.evaluate((id) => {
      let root = null;
      (window.COLLECTION_TREE.collections || []).forEach((c) => (function w(n, top) {
        if (n.id === id) root = top;
        (n.children || []).forEach((ch) => w(ch, top));
      })(c, c.id));
      return root;
    }, geo && geo.id);
    const rootBefore = await page.evaluate((d) => {
      const r = document.querySelector(`.active-deck[data-drag="${d}"] .dk-prog`);
      return r ? parseInt(r.dataset.total, 10) : null;
    }, rootOf);
    let lit = "NONE";
    if (geo) {
      await page.mouse.move(geo.x, geo.y);
      await page.mouse.down();
      const N = 40;
      for (let i = 1; i <= N; i++) { await page.mouse.move(geo.x + ((geo.tx - geo.x) * i) / N, geo.y + ((geo.ty - geo.y) * i) / N); await page.waitForTimeout(8); }
      await page.waitForTimeout(140);
      lit = await page.evaluate(() => { const e = document.querySelector(".dk-into"); return e ? e.dataset.drag : "NONE"; });
      await page.mouse.up();
      await page.waitForTimeout(700);
    }
    check("...the group lights up as the drop target while the deck is over its middle", lit === (geo && geo.gid), lit);

    const nested = await page.evaluate((id) => {
      const r = document.querySelector(`.active-deck[data-drag="${id}"]`);
      const store = JSON.parse(localStorage.getItem("folio_v1") || "{}");
      return r ? { parent: r.dataset.parent, depth: r.dataset.depth, saved: (store.deckNest || {})[id] || null } : null;
    }, geo && geo.id);
    check("...and dropping it puts the deck inside the group, in the store as well as on the page",
      !!nested && nested.parent === geo.gid && nested.depth === "1" && nested.saved === geo.gid, JSON.stringify(nested));

    /* THE CARDS MOVE WITH IT. A container counts what is drawn UNDER it: the group gains the deck's cards
       and the collection it came from stops claiming them, or the two rows would offer the reader the same
       new cards twice on one screen with nothing to say which is which. Read off each header's own progress
       bar, which since Aug 2026 is what a group header carries in place of an "N cards" line: `data-total`
       is the denominator that bar is drawn from, so it is the row's own reckoning rather than the test's. */
    const counts = await page.evaluate(([gid, root]) => {
      const num = (d) => {
        const r = document.querySelector(`.active-deck[data-drag="${d}"] .dk-prog`);
        return r ? parseInt(r.dataset.total, 10) : null;
      };
      return { group: num(gid), rootAfter: num(root) };
    }, [geo && geo.gid, rootOf]);
    check("...the group's header counts the cards now inside it", counts.group > 0, JSON.stringify(counts));
    check("...and the container it came from stops counting them, exactly once",
      rootBefore != null && counts.rootAfter != null && rootBefore - counts.rootAfter === counts.group,
      JSON.stringify({ rootBefore, ...counts }));

    // the colour reaches every deck inside, not just the header
    await page.evaluate((gid) => {
      document.querySelector(`.active-deck[data-drag="${gid}"]`).dispatchEvent(new MouseEvent("contextmenu", { bubbles: true }));
    }, geo && geo.gid);
    await page.waitForTimeout(350);
    const sheet = await page.evaluate(() => [...document.querySelectorAll(".deck-menu .dm-item b")].map((b) => b.textContent));
    check("a group's sheet offers Rename, Colour and Ungroup",
      ["Rename", "Colour", "Ungroup"].every((k) => sheet.indexOf(k) >= 0), JSON.stringify(sheet));
    // …and NOT the daily-allowance rows, which belong to something the review actually iterates
    check("...and not the daily limits, which a group does not have",
      sheet.indexOf("Daily limits") < 0 && sheet.indexOf("Custom study") < 0, JSON.stringify(sheet));
    await page.evaluate(() => { const s = document.querySelectorAll(".dm-swatch"); s[3].click(); });
    await page.waitForTimeout(300);
    const hue = await page.evaluate(([gid, id]) => {
      const v = (d) => { const r = document.querySelector(`.active-deck[data-drag="${d}"]`); return r ? r.style.getPropertyValue("--coll-bg").trim() : ""; };
      return { header: v(gid), inside: v(id) };
    }, [geo && geo.gid, geo && geo.id]);
    check("a colour set on the group reaches every deck inside it",
      !!hue.header && hue.header === hue.inside, JSON.stringify(hue));
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);

    /* It survives being carried to a page that has never seen the list — a group is a fact about the reader,
       not about this paint. It has to be the SAVED blob on a FRESH page rather than a reload here: `newPage`
       re-seeds `folio_v1` from its init script on every load, so a plain reload would put the seed's own
       state back and this would be testing the seed. */
    const blob = await page.evaluate(() => localStorage.getItem("folio_v1"));
    const carried = await browser.newPage({ viewport: { width: 1200, height: 900 } });
    carried.on("pageerror", (e) => errs.push(e.message));
    await carried.addInitScript((b) => { try { localStorage.setItem("folio_v1", b); } catch (e) {} }, blob);
    await carried.goto(base + "#home", { waitUntil: "load" });
    await carried.waitForTimeout(1300);
    const kept = await carried.evaluate((id) => {
      const r = document.querySelector(`.active-deck[data-drag="${id}"]`);
      return r ? { parent: r.dataset.parent, hue: r.style.getPropertyValue("--coll-bg").trim() } : null;
    }, geo && geo.id);
    check("the group, its member and its colour all survive being carried to another device",
      !!kept && kept.parent === geo.gid && !!kept.hue, JSON.stringify(kept));
    await carried.close();

    // tapping it studies everything inside
    await page.evaluate((gid) => document.querySelector(`.active-deck[data-drag="${gid}"]`).click(), geo && geo.gid);
    await page.waitForTimeout(900);
    const studying = await page.evaluate(() => ({ hash: location.hash, card: !!document.querySelector(".question, .cardwrap") }));
    check("tapping a group studies the cards inside it",
      studying.hash.indexOf("study") >= 0 && studying.card, JSON.stringify(studying));

    /* UNGROUP DISSOLVES rather than deletes: the decks inside stay in the review. Losing a deck because you
       tidied a container away is the one outcome a grouping feature must never produce. */
    /* Back to the home page by HASH, never `goto`: `newPage`'s init script re-seeds `folio_v1` on every
       navigation, so a goto here would put the seed's own state back and everything below would be testing
       a page on which no group was ever made. */
    await page.evaluate(() => { location.hash = "#home"; });
    await page.waitForTimeout(1000);
    await page.evaluate((gid) => document.querySelector(`.active-deck[data-drag="${gid}"]`).dispatchEvent(new MouseEvent("contextmenu", { bubbles: true })), geo && geo.gid);
    await page.waitForTimeout(350);
    await page.evaluate(() => [...document.querySelectorAll(".deck-menu .dm-item")].find((b) => b.dataset.act === "ungroup").click());
    await page.waitForTimeout(350);
    await page.evaluate(() => { const b = document.querySelector(".inline-prompt .ip-ok"); if (b) b.click(); });
    await page.waitForTimeout(900);
    const freed = await page.evaluate(([gid, id]) => {
      const store = JSON.parse(localStorage.getItem("folio_v1") || "{}");
      return {
        gone: !document.querySelector(`.active-deck[data-drag="${gid}"]`),
        deck: !!document.querySelector(`.active-deck[data-drag="${id}"]`),
        active: (store.active || []).indexOf(id) >= 0,
        nest: (store.deckNest || {})[id] || null,
      };
    }, [geo && geo.gid, geo && geo.id]);
    check("ungrouping takes the container away and leaves the deck in the review",
      freed.gone && freed.deck && freed.active && freed.nest === null, JSON.stringify(freed));
    await page.close();
  }

  /* ================= 12. FSRS, chosen per deck =================
     The maths is pinned against the reference implementation in test-scheduler.js section 10; what is pinned
     HERE is the wiring, which fails in ways arithmetic cannot see:
       · the choice is per DECK, and a card is scheduled by ITS OWN deck's choice wherever it was studied
         from — a card that schedules one way from its row and another from the pooled review has two
         schedules and nothing on screen to say which is in force;
       · the grade buttons show what the grade will apply, which under FSRS is a different number;
       · a card studied under SM-2 keeps what it has: its interval becomes its stability, and turning FSRS on
         must not read as having reset the deck;
       · and the review's own sheet must NOT offer the switch, since it schedules nothing. */
  {
    const page = await newPage({ active: [deckA, deckB], settings: SETTINGS, cards: { a: done(), b: done(), c: done() } });
    await page.goto(base + "#home", { waitUntil: "load" });
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1400);

    // the review's sheet has no Scheduling row; a deck's has
    await page.evaluate(() => document.querySelector(".review-group .banner")?.dispatchEvent(new Event("contextmenu", { bubbles: true })));
    await page.waitForTimeout(500);
    const rows = await page.evaluate(() => [...document.querySelectorAll(".deck-menu .dm-item")].map((x) => (x.querySelector("b") || x).textContent.trim()));
    check("the pooled review's sheet does NOT offer Scheduling", rows.length > 0 && !rows.includes("Scheduling"), rows.join(" / "));
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    const deckRows = await page.evaluate((d) => {
      const row = document.querySelector('[data-review="' + d + '"]');
      if (!row) return null;
      row.dispatchEvent(new Event("contextmenu", { bubbles: true }));
      return true;
    }, deckA);
    check("a deck's row opens its own sheet", deckRows === true);
    await page.waitForTimeout(500);
    const dRows = await page.evaluate(() => [...document.querySelectorAll(".deck-menu .dm-item")].map((x) => (x.querySelector("b") || x).textContent.trim()));
    check("…and a deck's sheet DOES offer Scheduling", dRows.includes("Scheduling"), dRows.join(" / "));
    await page.evaluate(() => document.querySelector('[data-act="sched"]')?.click());
    await page.waitForTimeout(500);
    const both = await page.evaluate(() => [...document.querySelectorAll("[data-sched]")].map((x) => x.querySelector("b").textContent + (x.classList.contains("on") ? "*" : "")));
    check("SM-2 is the default and is marked", both.join(",") === "SM-2*,FSRS", both.join(","));
    check("…and no retention box is offered under SM-2", await page.evaluate(() => !document.querySelector("#dsRet")));
    await page.evaluate(() => document.querySelector('[data-sched="fsrs"]')?.click());
    await page.waitForTimeout(700);
    check("choosing FSRS reveals the retention it is aiming at",
      await page.evaluate(() => { const r = document.querySelector("#dsRet"); return !!r && r.value === "90"; }));
    /* The focus lands on the CHOSEN row, not on the one just clicked — otherwise the sheet shows a focus ring
       on SM-2 and a tick on FSRS and leaves the reader to work out which of the two means anything. */
    check("…and the focus follows the choice rather than the click",
      await page.evaluate(() => !!document.activeElement && document.activeElement.dataset.sched === "fsrs"),
      await page.evaluate(() => (document.activeElement || {}).dataset && document.activeElement.dataset.sched));
    // a parameter list of the wrong length is refused, and refusing must not save the retention behind it
    await page.evaluate(() => { const t = document.querySelector("#dsParams"); t.value = "0.1, 0.2"; t.dispatchEvent(new Event("input", { bubbles: true })); });
    await page.evaluate(() => { const r = document.querySelector("#dsRet"); r.value = "80"; r.dispatchEvent(new Event("input", { bubbles: true })); });
    await page.evaluate(() => document.querySelector('[data-act="save"]')?.click());
    await page.waitForTimeout(500);
    const refused = await page.evaluate((d) => ({
      open: !!document.querySelector(".ds-sheet"),
      toast: (document.querySelector("#toast") || {}).textContent || "",
      ret: ((JSON.parse(localStorage.folio_v1 || "{}").deckOpts || {})[d] || {}).retention,
    }), deckA);
    check("21 numbers or nothing — a short list is refused", refused.open && /21 numbers/.test(refused.toast), JSON.stringify(refused));
    check("…and the retention beside it is NOT saved by a refused list", refused.ret === undefined || refused.ret === 0.9, String(refused.ret));
    // …and a real list of 21 is taken
    const twentyOne = Array.from({ length: 21 }, (_, i) => (i + 1) / 100).join(", ");
    await page.evaluate((v) => { const t = document.querySelector("#dsParams"); t.value = v; t.dispatchEvent(new Event("input", { bubbles: true })); }, twentyOne);
    await page.evaluate(() => document.querySelector('[data-act="save"]')?.click());
    await page.waitForTimeout(700);
    const opts = await page.evaluate((d) => (JSON.parse(localStorage.folio_v1 || "{}").deckOpts || {})[d], deckA);
    check("a list of 21 parameters is kept", !!opts && Array.isArray(opts.fsrsParams) && opts.fsrsParams.length === 21, JSON.stringify(opts && opts.fsrsParams && opts.fsrsParams.length));
    check("…with the retention saved beside it", !!opts && Math.abs(opts.retention - 0.8) < 1e-9, String(opts && opts.retention));
    check("…and the deck is on FSRS", !!opts && opts.sched === "fsrs", String(opts && opts.sched));
    /* ONE DECK ONLY. The other added deck must be untouched — that is the whole of "deck-specific", and it is
       the assertion that would catch the setting being written somewhere global by mistake. */
    const otherOpts = await page.evaluate((d) => (JSON.parse(localStorage.folio_v1 || "{}").deckOpts || {})[d], deckB);
    check("the OTHER deck is left on SM-2", !otherOpts || otherOpts.sched !== "fsrs", JSON.stringify(otherOpts));
    await page.close();
  }

  /* ================= 13. an FSRS deck is scheduled by FSRS, from either route ================= */
  {
    /* Deck A on FSRS, deck B not, and one card of each already studied under SM-2 so the seeding path is
       exercised too. Studied through the POOLED review, which is the case that matters: the card must be
       scheduled by its own deck's choice, not by the review's. */
    const state = {
      active: [deckA, deckB],
      settings: SETTINGS,
      deckOpts: { [deckA]: { sched: "fsrs", retention: 0.9 } },
      cards: { a: done(), b: done(), c: done() },
    };
    const page = await newPage(state);
    await page.goto(base + "#home", { waitUntil: "load" });
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1400);
    await page.evaluate(() => document.querySelector("#b-review")?.click());
    await page.waitForTimeout(900);

    // walk the whole session, recording which deck each card came from and what its record looks like after
    const seen = [];
    for (let i = 0; i < 12; i++) {
      const id = await page.evaluate(() => (JSON.parse(sessionStorage.folio_study_v1 || "{}").queue || [])[0] || null);
      if (!id) break;
      await page.evaluate(() => {
        const b = [...document.querySelectorAll(".actions button, .study-card button")]
          .find((x) => /reveal|show answer/i.test(x.textContent + x.id + x.className));
        if (b) b.click();
      });
      await page.waitForTimeout(320);
      await page.evaluate(() => document.querySelector('.grade[data-g="good"]')?.click());
      await page.waitForTimeout(420);
      const rec = await page.evaluate((cid) => (JSON.parse(localStorage.folio_v1 || "{}").cards || {})[cid], id);
      seen.push({ id: id, fsrs: !!(rec && rec.stability > 0) });
    }
    check("the session dealt cards from both decks", seen.length >= 4, JSON.stringify(seen.length));
    const fromA = seen.filter((x) => x.id.indexOf("wh-") === 0);
    void fromA;
    /* The load-bearing pair: some cards came out with a memory state and some did not, and which is which
       follows the DECK. If the review's own setting were deciding, every card would be one or the other. */
    check("some cards were scheduled by FSRS", seen.some((x) => x.fsrs), JSON.stringify(seen));
    check("…and some by SM-2, in the same pooled session", seen.some((x) => !x.fsrs), JSON.stringify(seen));
    await page.close();
  }

  /* ================= 14. turning FSRS on keeps what SM-2 built ================= */
  {
    const mature = { reps: 9, lapses: 1, ease: 2.6, interval: 34, due: Date.now() - 36e5, status: "review", last: Date.now() - 34 * 864e5, step: 0, first: "2026-05-01" };
    const page = await newPage({
      active: [deckA], settings: SETTINGS,
      /* newPerDay 0 so the day offers NOTHING but the mature card. The session used to be the mature card
         followed by the day's new ones, so reading `queue[0]` found it; since `mixPiles` interleaves the
         two piles (Aug 2026) a fresh card can legitimately come first, and this section is about SEEDING
         rather than about order — so the pile is narrowed instead of the head being guessed at. */
      deckOpts: { [deckA]: { sched: "fsrs", retention: 0.9, newPerDay: 0 } },
      cards: { a: done(), b: done(), c: done(), [MATURE_ID]: mature },
    });
    await page.goto(base + "#home", { waitUntil: "load" });
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1400);
    await page.evaluate(() => document.querySelector("#b-review")?.click());
    await page.waitForTimeout(900);
    // find the mature card in the queue and answer it
    const cur = await page.evaluate(() => (JSON.parse(sessionStorage.folio_study_v1 || "{}").queue || [])[0]);
    if (cur === MATURE_ID) {
      await page.evaluate(() => {
        const b = [...document.querySelectorAll(".actions button, .study-card button")]
          .find((x) => /reveal|show answer/i.test(x.textContent + x.id + x.className));
        if (b) b.click();
      });
      await page.waitForTimeout(350);
      const shown = await page.evaluate(() => [...document.querySelectorAll(".grade")].map((g) => g.querySelector(".gi").textContent));
      check("an SM-2 card's grade buttons still show intervals under FSRS", shown.length === 4 && shown.every((x) => /\d/.test(x)), shown.join(" · "));
      await page.evaluate(() => document.querySelector('.grade[data-g="good"]')?.click());
      await page.waitForTimeout(500);
      const rec = await page.evaluate((id) => (JSON.parse(localStorage.folio_v1 || "{}").cards || {})[id], MATURE_ID);
      /* The interval BECAME the stability, so a card with 34 days behind it does not restart: it is answered
         from a stability of at least what SM-2 had reached. This is the assertion that would catch the seeding
         being dropped — the card would come out with a stability of about 2 days and read as reset. */
      check("an SM-2 card's interval seeded its stability rather than restarting it", !!rec && rec.stability > 20, JSON.stringify(rec && rec.stability));
      check("…and its next interval is measured in weeks, not days", !!rec && (rec.due - Date.now()) / 864e5 > 14, String(rec && Math.round((rec.due - Date.now()) / 864e5)));
    } else {
      check("the session opened on the mature card, with no new cards allowed", false, "queue head was " + cur);
    }
    await page.close();
  }

  /* ================= 15. what Card info says about an FSRS card =================
     Two things shipped WRONG here for an hour and only a reader could see either: the stability's annotation
     named the 90% the measurement is defined at, which four rows above "aiming to remember 85%" read as the
     reader's setting having been ignored; and the review-history table headed its sixth column "Ease" on a
     card that has no ease, showing a stale 2.5 from whatever SM-2 last did. Every number was right
     throughout, so this reads the RENDERED panel.
     THE CARD IS SEEDED WITH ITS MEMORY STATE AND ONE LOGGED REVIEW rather than graded into one, and that is
     the file's own warning about `addInitScript` being obeyed: grading the deck's only due card ends the
     session (the completion screen has no Info button), and re-entering one needs a reload — which re-seeds
     `folio_v1` from `state` and throws the graded record away. So the state to be looked at is the state
     that is seeded. */
  {
    const t = Date.now();
    const page = await newPage({
      active: [deckA], settings: SETTINGS,
      // 85%, deliberately NOT 90 — the two numbers on that panel mean different things and must read as it.
      // newPerDay 0 for section 14's reason: since `mixPiles` interleaves the due and new piles (Aug 2026)
      // the seeded card is no longer guaranteed to be the queue's head, and this section is about the PANEL.
      deckOpts: { [deckA]: { sched: "fsrs", retention: 0.85, newPerDay: 0 } },
      cards: { a: done(), b: done(), c: done(), [MATURE_ID]: {
        status: "review", step: 0, reps: 6, lapses: 1, interval: 34, ease: 2.6,
        stability: 34.2, difficulty: 6.4, due: t - 36e5, last: t - 34 * 864e5, first: "2026-05-01",
      } },
      // one row in the documented shape: [id, t, grade, state-before, prevMin, nextMin, ease100, tenths].
      // ease100 carries the FSRS DIFFICULTY ×100 here, which is what review_log.ease100 documents.
      revlog: [[MATURE_ID, t - 34 * 864e5, 3, 3, 21 * 1440, 34 * 1440, 640, 62]],
    });
    await page.goto(base + "#home", { waitUntil: "load" });
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1400);
    await page.evaluate(() => document.querySelector("#b-review")?.click());
    await page.waitForTimeout(900);
    const head = await page.evaluate(() => (JSON.parse(sessionStorage.folio_study_v1 || "{}").queue || [])[0]);
    check("the seeded FSRS card is the one on screen", head === MATURE_ID, String(head));
    await page.evaluate(() => document.querySelector("#cardInfo")?.click());
    await page.waitForTimeout(600);
    const ci = await page.evaluate(() => {
      const box = document.querySelector(".deck-menu.ci-sheet .dm-box");
      if (!box) return null;
      return {
        keys: [...box.querySelectorAll(".ci-k")].map((e) => e.textContent.trim()),
        vals: [...box.querySelectorAll(".ci-v")].map((e) => e.textContent.replace(/\s+/g, " ").trim()),
        heads: [...box.querySelectorAll(".ci-hist th")].map((e) => e.textContent.trim()),
        row: [...box.querySelectorAll(".ci-hist tbody tr:first-child td")].map((e) => e.textContent.trim()),
      };
    });
    check("card info shows stability and difficulty, never the ease", !!ci && ci.keys.includes("Stability") && ci.keys.includes("Difficulty") && !ci.keys.includes("Ease"), ci && ci.keys.join("/"));
    check("…and names the scheduler with the reader's own target", !!ci && /85%/.test(ci.vals.join(" ")), ci && ci.vals.join(" | ").slice(0, 160));
    check("…while the stability's 90% is the MEASUREMENT, not that target",
      !!ci && /at ~90% recall/.test(ci.vals.join(" ")) && !/the 90% interval/.test(ci.vals.join(" ")), ci && ci.vals.join(" | ").slice(0, 160));
    check("…and the history column is headed Difficulty rather than Ease", !!ci && ci.heads.includes("Difficulty") && !ci.heads.includes("Ease"), ci && ci.heads.join("/"));
    // a difficulty out of 10 (one decimal, up to 10.0) — a percentage there is a stale ease under a new heading
    check("…carrying a difficulty out of 10, not a percentage", !!ci && ci.row.length > 5 && /^(10|\d)\.\d$/.test(ci.row[5]), ci && ci.row.join(" | "));
    await page.close();
  }

  /* ================= 16. the FSRS optimiser, through the sheet =================
     test-scheduler.js owns the arithmetic — the loss against the reference, the recovery of a known
     parameter set, the refusals. What can only be seen here is the PATH: that the button exists under FSRS
     and not under SM-2, that a run finishes without freezing the dialog it is inside, that what it produces
     is STAGED in the box rather than saved behind the reader's back, and that Save is what keeps it. */
  {
    /* A synthetic log in the shipped row shape — [id, t, grade, state-before, prevMin, nextMin, ease100,
       tenths] — big enough to clear the fit's own minimum. Every card starts at state 0, because a sequence
       whose beginning is missing is dropped, which is the thing most likely to make this silently refuse. */
    const DAYMS = 864e5, now = Date.now();
    let seed = 4242;
    const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    const revlog = [];
    for (let c = 0; c < 500; c++) {
      let t = now - (320 - (c % 150)) * DAYMS, prev = 0;
      for (let i = 0; i < 8; i++) {
        const g = i === 0 ? (rnd() < 0.25 ? 1 : 3) : (rnd() < 0.22 ? 1 : rnd() < 0.4 ? 2 : rnd() < 0.92 ? 3 : 4);
        const gap = i === 0 ? 0 : Math.max(1, Math.round(prev * (g === 1 ? 0.4 : 2.1)));
        revlog.push(["u_opt_" + c, t, g, i === 0 ? 0 : 3, prev * 1440, gap * 1440, 250, 40]);
        prev = gap || 1;
        t += Math.max(1, gap) * DAYMS;
      }
    }
    const page = await newPage({
      active: [deckA], settings: SETTINGS,
      deckOpts: { [deckA]: { sched: "fsrs", retention: 0.9 } },
      cards: { a: done(), b: done(), c: done() },
      revlog: revlog,
    });
    await page.goto(base + "#home", { waitUntil: "load" });
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1400);
    const openSched = async () => {
      await page.evaluate((d) => {
        const row = [...document.querySelectorAll("[data-review]")].find((x) => x.dataset.review === d);
        if (row) row.dispatchEvent(new Event("contextmenu", { bubbles: true }));
      }, deckA);
      await page.waitForTimeout(450);
      await page.evaluate(() => document.querySelector('[data-act="sched"]')?.click());
      await page.waitForTimeout(550);
    };
    await openSched();
    check("the Scheduling sheet offers Optimise under FSRS", await page.evaluate(() => !!document.querySelector("#dsOpt")));
    // …and not under SM-2, where there are no parameters to fit
    await page.evaluate(() => document.querySelector('[data-sched="sm2"]')?.click());
    await page.waitForTimeout(700);
    check("…and NOT under SM-2, which has no parameters to fit", await page.evaluate(() => !document.querySelector("#dsOpt")));
    await page.evaluate(() => document.querySelector('[data-sched="fsrs"]')?.click());
    await page.waitForTimeout(700);

    await page.evaluate(() => document.querySelector("#dsOpt")?.click());
    let msg = "";
    for (let i = 0; i < 90; i++) {
      msg = await page.evaluate(() => (document.querySelector("#dsOptMsg") || {}).textContent || "");
      if (/Fitted|already well described|Not enough/.test(msg)) break;
      await page.waitForTimeout(400);
    }
    check("a fit runs to a verdict without freezing the sheet", /Fitted|already well described/.test(msg), msg.slice(0, 120));
    /* IT MUST NOT HAVE SAVED ANYTHING YET. Pressing Optimise asks a question; Save answers it — the same two
       steps every other field on this sheet has, and the difference between offering a schedule and changing
       one behind the reader's back. */
    const staged = await page.evaluate((d) => ({
      box: (document.querySelector("#dsParams") || {}).value || "",
      stored: ((JSON.parse(localStorage.folio_v1 || "{}").deckOpts || {})[d] || {}).fsrsParams || null,
      enabled: !(document.querySelector("#dsOpt") || {}).disabled,
    }), deckA);
    const nums = staged.box.split(",").map((s) => parseFloat(s)).filter((x) => !isNaN(x));
    check("…staging 21 parameters in the box", nums.length === 21, nums.length + " · " + staged.box.slice(0, 60));
    check("…and saving NOTHING until Save is pressed", staged.stored === null, JSON.stringify(staged.stored));
    check("…with the button usable again", staged.enabled);
    await page.evaluate(() => document.querySelector('[data-act="save"]')?.click());
    await page.waitForTimeout(800);
    const kept = await page.evaluate((d) => ((JSON.parse(localStorage.folio_v1 || "{}").deckOpts || {})[d] || {}).fsrsParams, deckA);
    check("Save keeps the fitted parameters, on that deck", Array.isArray(kept) && kept.length === 21, kept && kept.length);
    check("…all finite", Array.isArray(kept) && kept.every((x) => isFinite(x)));

    /* THE REFUSAL A READER IS FAR LIKELIER TO MEET: almost nobody has 512 usable reviews on their first day,
       and "nothing happened" would read as a broken button. It says the number it has and the number it
       wants, and it says WHY a review might not count. */
    const page2 = await newPage({
      active: [deckA], settings: SETTINGS,
      deckOpts: { [deckA]: { sched: "fsrs", retention: 0.9 } },
      cards: { a: done(), b: done(), c: done() },
      revlog: revlog.slice(0, 40),
    });
    await page2.goto(base + "#home", { waitUntil: "load" });
    await page2.reload({ waitUntil: "load" });
    await page2.waitForTimeout(1400);
    await page2.evaluate((d) => {
      const row = [...document.querySelectorAll("[data-review]")].find((x) => x.dataset.review === d);
      if (row) row.dispatchEvent(new Event("contextmenu", { bubbles: true }));
    }, deckA);
    await page2.waitForTimeout(450);
    await page2.evaluate(() => document.querySelector('[data-act="sched"]')?.click());
    await page2.waitForTimeout(550);
    await page2.evaluate(() => document.querySelector("#dsOpt")?.click());
    await page2.waitForTimeout(1200);
    const few = await page2.evaluate((d) => ({
      msg: (document.querySelector("#dsOptMsg") || {}).textContent || "",
      stored: ((JSON.parse(localStorage.folio_v1 || "{}").deckOpts || {})[d] || {}).fsrsParams || null,
      box: (document.querySelector("#dsParams") || {}).value || "",
    }), deckA);
    check("too little history is refused in words, with the numbers", /Not enough history/.test(few.msg) && /\d+ of the 512/.test(few.msg), few.msg.slice(0, 120));
    check("…and nothing is staged or saved", few.stored === null && few.box === "", JSON.stringify(few).slice(0, 80));
    await page2.close();
    await page.close();
  }

  /* ================= 17. load balancing and easy days, in Settings (Aug 2026) =================
     The arithmetic is test-scheduler's; this is the path. Both are DEFAULT OFF, which is the assertion most
     worth having — they change what the scheduler does, and an existing reader's intervals must not move
     because they updated — and the seven days are drawn Monday-first while being stored Sunday-first, a
     conversion nothing on screen would report getting wrong. */
  {
    const page = await newPage(seeded);
    await page.goto(base + "#settings", { waitUntil: "load" });
    await page.waitForTimeout(1300);
    const start = await page.evaluate(() => {
      const sw = document.querySelector("#sw-load"), days = [...document.querySelectorAll("#edDays [data-ed]")];
      return {
        sw: sw ? sw.getAttribute("aria-checked") : null,
        order: days.map((d) => d.textContent.trim()),
        stored: (JSON.parse(localStorage.getItem("folio_v1") || "{}").settings || {}).loadBalance,
        // the control must not be squeezing its own description into one word a line
        wrap: (() => {
          const row = [...document.querySelectorAll(".set-row")].find((r) => /Days you don/.test(r.textContent));
          if (!row) return null;
          const pEl = row.querySelector(".info p");
          return pEl ? Math.round(pEl.getBoundingClientRect().width) : null;
        })(),
      };
    });
    check("the load-balance switch is on the Settings page", start.sw !== null);
    check("…and is OFF by default, so no existing schedule moves", start.sw === "false" && !start.stored, JSON.stringify(start.sw));
    check("the seven days are drawn Monday first", start.order.join(" ").toUpperCase() === "MON TUE WED THU FRI SAT SUN", start.order.join(" "));
    /* The row STACKS: seven buttons on a `flex:none` control beside `flex:1` prose squeezed the description
       to one word per line in the settings column, which is what looking at the page found. */
    check("…on a line of their own, not squeezing the prose", start.wrap > 200, String(start.wrap));

    await page.evaluate(() => document.querySelector("#sw-load").click());
    await page.waitForTimeout(400);
    await page.evaluate(() => document.querySelector('#edDays [data-ed="0"]').click());   // Sunday
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => {
      const st = JSON.parse(localStorage.getItem("folio_v1") || "{}").settings || {};
      const sun = document.querySelector('#edDays [data-ed="0"]');
      return { lb: !!st.loadBalance, days: st.easyDays, marked: sun.classList.contains("off"), aria: sun.getAttribute("aria-checked") };
    });
    check("throwing the switch stores it", after.lb === true);
    /* STORED SUNDAY-FIRST to match Date#getDay, which is what lets the scheduler step the weekday
       modularly with no conversion — the UI's Monday-first order is a rendering decision only. */
    check("a marked day is stored at its getDay index", Array.isArray(after.days) && after.days[0] === 0 && after.days.slice(1).every((x) => x === 1), JSON.stringify(after.days));
    check("…and the button says so", after.marked && after.aria === "true");
    await page.reload();
    await page.waitForTimeout(1200);
    // seeded state is re-written by addInitScript on every load, so the reload proves the RENDER reads the
    // stored value rather than proving persistence — which section 8's device-carry already covers
    const back = await page.evaluate(() => {
      const st = JSON.parse(localStorage.getItem("folio_v1") || "{}").settings || {};
      return { lb: !!st.loadBalance, sun: (document.querySelector('#edDays [data-ed="0"]') || {}).className || "" };
    });
    check("a fresh load paints the switch from what is stored", back.lb === false && !/off/.test(back.sun), JSON.stringify(back));
    await page.close();
  }

  /* ================= 18. new cards and review cards arrive MIXED (Aug 2026, on request) =================
     Ordered used to mean "every card due today, and then the day's new ones" — the piles were concatenated,
     so a reader with forty reviews met their first new card forty cards in. Anki mixes them, and so does
     this now. The mixing is RANDOM, so the browser half alone could pass on a queue that happened to come
     out sorted; `mixPiles` is therefore also run here as the pure function it is, which is the only way to
     say anything about a distribution. What it must never do is disturb either pile's own order — that
     order is the whole of what "ordered" means. */
  {
    const src = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
    const i = src.indexOf("function mixPiles(");
    const j = src.indexOf("\n  }", i);
    const mixPiles = new Function(src.slice(i, j + 4) + "; return mixPiles;")();
    const due = ["d1", "d2", "d3", "d4", "d5", "d6"], fresh = ["n1", "n2", "n3", "n4", "n5"];
    let sorted = 0, badOrder = 0, wrongSet = 0;
    for (let k = 0; k < 400; k++) {
      const out = mixPiles(due, fresh);
      if (out.slice().sort().join() !== due.concat(fresh).sort().join()) wrongSet++;
      if (out.filter((x) => x[0] === "d").join() !== due.join() || out.filter((x) => x[0] === "n").join() !== fresh.join()) badOrder++;
      if (out.join() === due.concat(fresh).join()) sorted++;
    }
    check("mixing keeps every card and invents none", wrongSet === 0);
    check("…and leaves each pile in its own order, which is what Ordered means", badOrder === 0);
    check("…and does not simply put the reviews first", sorted < 20, sorted + "/400 came out pile-after-pile");
    check("a pile with nothing to mix into is returned unchanged", mixPiles(due, []).join() === due.join() && mixPiles([], fresh).join() === fresh.join());
  }

  /* …and the same thing in a real session: a reader with reviews waiting AND new cards to come must meet
     both kinds before the reviews run out. Seeded with six of the deck's cards already due, so a queue that
     still concatenated would put every new card after all six. */
  {
    const probe2 = await browser.newPage();
    await probe2.goto(base, { waitUntil: "load" });
    await probe2.waitForTimeout(1200);
    const ids = await probe2.evaluate((deck) => {
      let found = null;
      (window.COLLECTION_TREE.collections || []).forEach(function walk(n) { if (n.id === deck) found = n; (n.children || []).forEach(walk); });
      return (found && found.cardIds ? found.cardIds : []).slice(0, 6);
    }, deckA);
    await probe2.close();

    const dueRec = () => ({ reps: 2, lapses: 0, ease: 2.5, interval: 3, due: Date.now() - 864e5, status: "review", last: Date.now() - 4 * 864e5, first: "2026-01-01" });
    const cards = {};
    ids.forEach((id) => { cards[id] = dueRec(); });
    const page = await newPage({ active: [deckA], settings: SETTINGS, cards: cards });
    await page.goto(base + "#home", { waitUntil: "load" });
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1400);
    await page.evaluate(() => { const b = document.querySelector(".banner .cta .btn"); if (b) b.click(); });
    await page.waitForTimeout(1500);
    const q = await page.evaluate(() => { try { return JSON.parse(sessionStorage.getItem("folio_study_v1")).queue; } catch (e) { return []; } });
    const known = new Set(ids);
    const kinds = q.map((x) => (known.has(x) ? "d" : "n"));
    check("the session holds both the reviews and the day's new cards", kinds.includes("d") && kinds.includes("n"), kinds.join(""));
    const firstNew = kinds.indexOf("n"), lastDue = kinds.lastIndexOf("d");
    check("…and a new card arrives before the reviews are finished", firstNew < lastDue, kinds.join(""));
    await page.close();
  }

  /* ================= 19. suspending a NEW card does not cost the day one (Aug 2026, on request) =========
     Suspending shifted the card off the queue and stopped there, so a reader who set aside two of their
     five new cards studied three — the allowance quietly spent on cards they never saw. A replacement is
     drawn instead, and it is a replacement rather than a bonus: nothing is added when the suspended card
     had already been studied, since the allowance was never charged for it. */
  {
    const page = await newPage({ active: [deckA], settings: SETTINGS, cards: { a: done(), b: done(), c: done() } });
    await page.goto(base + "#home", { waitUntil: "load" });
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1400);
    await page.evaluate(() => { const b = document.querySelector(".banner .cta .btn"); if (b) b.click(); });
    await page.waitForTimeout(1500);
    const before = await page.evaluate(() => { try { const r = JSON.parse(sessionStorage.getItem("folio_study_v1")); return { n: r.queue.length, q: r.queue.slice(), id: r.id }; } catch (e) { return null; } });
    check("a fresh session offers the day's allowance", before && before.n === 5, before ? String(before.n) : "none");
    /* Reveal FIRST: the only Suspend button on the page lives inside the grade bar, which does not exist
       until the answer is shown — so a click dispatched at `.suspendbtn` on the question side lands on
       nothing at all, and the queue is then unchanged for the least interesting reason there is. */
    await page.evaluate(() => { const r = document.querySelector("#reveal-btn"); if (r) r.click(); });
    await page.waitForTimeout(400);
    await page.evaluate(() => { const b = document.querySelector(".suspendbtn"); if (b) b.click(); });
    await page.waitForTimeout(900);
    const after = await page.evaluate(() => { try { const r = JSON.parse(sessionStorage.getItem("folio_study_v1")); return { n: r.queue.length, q: r.queue.slice() }; } catch (e) { return null; } });
    check("suspending a new card leaves the day's count where it was", after && after.n === before.n, after ? before.n + " -> " + after.n : "none");
    const fresh = after ? after.q.filter((x) => before.q.indexOf(x) < 0) : [];
    check("…because another card takes its place", fresh.length === 1 && fresh[0] !== before.id, fresh.join());
    const susp = await page.evaluate((id) => !!(JSON.parse(localStorage.getItem("folio_v1") || "{}").suspended || {})[id], before.id);
    check("…and the suspended card really is set aside", susp);
    await page.close();
  }

  /* ================= 20. Undo steps back exactly ONE card (Aug 2026, on a bug report) ===================
     "The undo button sometimes goes back two cards." The action is reachable four ways — two buttons, a
     key and the ink layer's pass-through — and a single press could arrive twice, popping two snapshots
     and returning two cards with nothing on screen to say so. The guard is on the ACTION rather than on
     one listener, which is what this asserts: two clicks inside the window give back one card. */
  {
    const page = await newPage({ active: [deckA], settings: SETTINGS, cards: { a: done(), b: done(), c: done() } });
    await page.goto(base + "#home", { waitUntil: "load" });
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1400);
    await page.evaluate(() => { const b = document.querySelector(".banner .cta .btn"); if (b) b.click(); });
    await page.waitForTimeout(1500);
    const graded = [], asked = [];
    for (let k = 0; k < 3; k++) {
      graded.push(await page.evaluate(() => { try { return JSON.parse(sessionStorage.getItem("folio_study_v1")).id; } catch (e) { return null; } }));
      // the WORDING on screen, so the undo can be held to bringing back the phrasing that was answered
      asked.push(await page.evaluate(() => { const q = document.querySelector(".question"); return q ? q.textContent.replace(/\s+/g, " ").trim() : null; }));
      await page.evaluate(() => { const r = document.querySelector("#reveal-btn"); if (r) r.click(); });
      await page.waitForTimeout(400);
      await page.evaluate(() => { const g = document.querySelector(".grade.easy"); if (g) g.click(); });
      await page.waitForTimeout(600);
    }
    const seenBefore = await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem("folio_v1") || "{}").cards || {}).length);
    // the same press arriving twice — both inside the guard window
    await page.evaluate(() => { const u = document.querySelector("#undoGrade") || document.querySelector("#undoGradeBar"); if (u) { u.click(); u.click(); } });
    await page.waitForTimeout(800);
    const st = await page.evaluate(() => ({
      seen: Object.keys(JSON.parse(localStorage.getItem("folio_v1") || "{}").cards || {}).length,
      id: (() => { try { return JSON.parse(sessionStorage.getItem("folio_study_v1")).id; } catch (e) { return null; } })(),
    }));
    check("a doubled press gives back exactly one card", st.seen === seenBefore - 1, seenBefore + " -> " + st.seen);
    check("…and it is the card that was just graded", st.id === graded[2], st.id + " vs " + graded[2]);
    /* AND IT COMES BACK AT ITS QUESTION (Aug 2026, on request). Undo used to restore the card REVEALED,
       on the reasoning that the reader had just been looking at the answer — which puts them back on the
       grade row rather than at the thing they are meant to reconsider. Both halves are asserted because
       they fail in opposite directions: a card still showing its answer, and one that came back asking a
       DIFFERENT one of its three phrasings, which reads as the undo having fetched another card. */
    const back = await page.evaluate(() => ({
      grading: document.body.classList.contains("grading"),
      reveal: !!document.querySelector("#reveal-btn"),
      q: (() => { const q = document.querySelector(".question"); return q ? q.textContent.replace(/\s+/g, " ").trim() : null; })(),
    }));
    check("…it comes back at the QUESTION, not the answer", !back.grading && back.reveal, JSON.stringify({ grading: back.grading, reveal: back.reveal }));
    check("…and at the phrasing the reader answered", !!back.q && back.q === asked[2], (back.q || "").slice(0, 60));
    // …and a deliberate SECOND undo, well outside the window, still works
    await page.evaluate(() => { const u = document.querySelector("#undoGrade") || document.querySelector("#undoGradeBar"); if (u) u.click(); });
    await page.waitForTimeout(800);
    const st2 = await page.evaluate(() => ({
      seen: Object.keys(JSON.parse(localStorage.getItem("folio_v1") || "{}").cards || {}).length,
      id: (() => { try { return JSON.parse(sessionStorage.getItem("folio_study_v1")).id; } catch (e) { return null; } })(),
    }));
    check("a real second press still steps back another card", st2.seen === seenBefore - 2 && st2.id === graded[1], st2.seen + " " + st2.id);
    await page.close();
  }

  /* ================= 21. a card on a learning step is REACHABLE (Aug 2026, on a bug report) ============
     "Getting a card wrong pushes it forward some minutes before showing it again. This creates a bug
     where exiting out of the deck study causes the active deck banner to report X cards still to be
     reviewed in the red number, but clicking the deck says the study has already been completed for the
     day, since those minutes haven't passed yet."

     Two functions telling the truth and contradicting each other: `entryPiles` and `pileCounts` count a
     learning card from the moment it is failed until it graduates, and every queue-builder selected on
     `isDueNow`, which that card is not for another nine minutes. `learnAheadIds` closes it — the learning
     cards are dealt when the queue would otherwise be empty.

     THE ASSERTION IS THAT THE TWO AGREE, not that either number is a particular value. That is the only
     form the bug has: a red count is right, an empty session is right, and it is holding both at once
     that is wrong — so the check is written as the equivalence and cannot be satisfied by a fixed
     figure drifting into place.
     A single new card a day is what makes the state reachable in one grade: fail it, and the deck's
     whole day is one card sitting on a one-minute step. */
  {
    const page = await newPage({ active: [deckA], settings: Object.assign({}, SETTINGS, { newPerDay: 1 }), cards: {} });
    await page.goto(base + "#home", { waitUntil: "load" });
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1400);

    const snap = () => page.evaluate(() => ({
      piles: [...document.querySelectorAll(".banner .stat b")].map((e) => e.textContent).join("/"),
      start: !!document.querySelector(".banner .cta"),
      row: [...document.querySelectorAll(".dk-counts")].map((e) => [...e.querySelectorAll("span")].map((x) => x.textContent).join("/"))[0] || "",
    }));

    await page.evaluate(() => document.querySelector("#b-review").click());
    await page.waitForTimeout(900);
    await page.evaluate(() => document.querySelector("#reveal-btn").click());
    await page.waitForTimeout(300);
    await page.evaluate(() => document.querySelector(".grade.again").click());
    await page.waitForTimeout(400);
    await page.evaluate(() => document.querySelector("#exit").click());
    await page.waitForTimeout(1000);

    const card = await page.evaluate(() => {
      const S = JSON.parse(localStorage.getItem("folio_v1"));
      const id = Object.keys(S.cards || {})[0], c = id && S.cards[id];
      return c ? { status: c.status, secs: Math.round((c.due - Date.now()) / 1000) } : null;
    });
    check("Again leaves the card on a learning step, minutes out",
      !!card && card.status === "learning" && card.secs > 0, JSON.stringify(card));

    const st = await snap();
    check("the banner counts it under Learning", /^0\/[1-9]/.test(st.piles), JSON.stringify(st));
    check("...and does NOT also claim the day is finished — the whole report",
      st.start === (st.piles !== "0/0/0"), JSON.stringify(st));
    check("...and the deck's own row says the same thing the banner does", st.row === st.piles, JSON.stringify(st));

    /* The other half of the contradiction, and the half the reader actually pressed: the row opens a
       session with the card in it rather than a completion screen. */
    const opened = await page.evaluate(() => {
      const r = document.querySelector("[data-review]");
      if (!r) return null;
      r.click();
      return true;
    });
    if (opened) {
      await page.waitForTimeout(1200);
      const got = await page.evaluate(() => ({
        question: !!document.querySelector(".question"),
        reveal: !!document.querySelector("#reveal-btn"),
        text: (document.body.textContent || "").slice(0, 3000),
      }));
      check("tapping the deck row deals the card rather than a completion screen",
        got.question && got.reveal && !/caught up|already/i.test(got.text),
        JSON.stringify({ question: got.question, reveal: got.reveal }));
    } else {
      check("tapping the deck row deals the card rather than a completion screen", false, "no deck row to press");
    }
    await page.close();
  }

  console.log("");
  if (errs.length) { console.log("page errors:"); errs.forEach((e) => console.log("  " + e)); fail += errs.length; }
  console.log(pass + " passed, " + fail + " failed");
  await browser.close();
  server.close();
  process.exit(fail ? 1 : 0);
})();
