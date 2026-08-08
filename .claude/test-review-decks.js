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
    · holding a deck's row opens Custom study / Daily limits / Skip today / Move / Remove, the bin having gone
    · the Folio level caps how many decks may sit in the review at once
    · (Aug 2026) the reader can reorder that list and group it into FOLDERS of their own — and a folder must
      never reach S.active, since it holds no cards and would sit in the review eating a place against the cap

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

  // the two leaf decks that actually hold cards, read off the shipped tree rather than hard-coded
  const probe = await browser.newPage();
  await probe.goto(base, { waitUntil: "load" });
  await probe.waitForTimeout(1200);
  const leaves = await probe.evaluate(() => {
    const out = [];
    (window.COLLECTION_TREE.collections || []).forEach(function walk(n) {
      (n.children || []).forEach(walk);
      if (!(n.children || []).length && (n.cardIds || []).length) out.push(n.id);
    });
    return out;
  });
  await probe.close();
  if (leaves.length < 2) { console.log("FAIL  the tree needs two leaf decks with cards to test a pooled review"); process.exit(1); }
  const [deckA, deckB] = leaves;

  const newPage = async (state) => {
    const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
    page.on("pageerror", (e) => errs.push(e.message));
    await page.addInitScript((st) => { try { localStorage.setItem("folio_v1", JSON.stringify(st)); } catch (e) {} }, state);
    return page;
  };
  /* …and a seeder that only fires on a FIRST load, for the one section that has to survive a reload. The
     unconditional one above is right everywhere else — it is what stops the app's own save schedule
     clobbering the fixture — and it is exactly wrong for section 8, where what is being tested is that
     something the page just wrote is still there after a reload. */
  const newPageOnce = async (state) => {
    const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
    page.on("pageerror", (e) => errs.push(e.message));
    await page.addInitScript((st) => {
      try { if (!localStorage.getItem("folio_v1")) localStorage.setItem("folio_v1", JSON.stringify(st)); } catch (e) {}
    }, state);
    return page;
  };
  // three cards already studied → past the first-run hero, and Folio level 2 (which is two decks)
  const seeded = { active: [deckA, deckB], settings: SETTINGS, cards: { a: done(), b: done(), c: done() } };

  /* ================= 1. the Library ================= */
  {
    const page = await newPage(seeded);
    await page.goto(base + "#decks", { waitUntil: "load" });
    await page.waitForTimeout(1200);
    const lib = await page.evaluate(() => ({
      soonOpen: (() => { const d = document.querySelector(".collection-group-soon"); return d ? d.open : null; })(),
      cap: (document.querySelector(".lib-cap") || {}).textContent || "",
    }));
    // it used to open itself for an admin, who is exactly the person on this page most often
    check("the Coming soon fold starts closed, admin or not", lib.soonOpen === false, JSON.stringify(lib.soonOpen));
    check("...and the Library says how many decks the level allows", /\d+ of \d+ decks?/.test(lib.cap), lib.cap);
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
        title: r.querySelector(".ad-title").textContent.trim(),
        counts: [...r.querySelectorAll(".adc")].map((x) => +x.textContent.trim()),
      })),
      banner: [...document.querySelectorAll(".banner .stat")].filter((s) => !s.classList.contains("streak")).map((s) => +s.querySelector("b").textContent.trim()),
      trash: document.querySelectorAll(".ad-trash").length,
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
        // read per switch, not as a total: the two default OPPOSITE ways — the order is Ordered (off)
        // and question variety is on, which is the point of it — so a count says nothing about either
        order: !!ov.querySelector('.dm-switch[data-act="order"] .switch.on'),
        variety: !!ov.querySelector('.dm-switch[data-act="variety"] .switch.on'),
        choices: ov.querySelectorAll(".dm-choice").length,
      };
    });
    /* The banner's sheet IS the deck sheet, one level up (Aug 2026, on request: "the same menu, without
       the delete option"), and NO Remove — there is nothing to take the review out of.
       The ORDER is a SWITCH now, not a pair of rows to choose between (Aug 2026, on a second request):
       two rows for one bit of state spent a third of a phone sheet saying what one line says. QUESTION
       VARIETY arrived beside it the same day and takes the same shape. Both start OFF here, since this
       harness boots with reviewRandom false and no per-deck override. */
    /* …and "New folder" at the foot of it (Aug 2026, on request: the reader arranges their own review list).
       The BANNER gets that where a deck's row gets "Move": the review is the list, so it cannot be moved
       inside itself, and this is the only place a reader with no folders yet can make their first one. */
    check("holding the banner offers the deck sheet's options, minus Remove",
      rm && rm.items.join(",") === "Random order,Question variety,Custom study,Daily limits,Skip today,New folder", JSON.stringify(rm));
    check("...the order and the phrasing pool are SWITCHES, not a pair of rows",
      rm && rm.switches.join(",") === "Random order,Question variety" && rm.choices === 0, JSON.stringify(rm));
    check("...each showing its own current state — Ordered, and variety on by default",
      rm && rm.order === false && rm.variety === true, JSON.stringify(rm && { order: rm.order, variety: rm.variety }));
    await page.evaluate(() => document.querySelector('.deck-menu .dm-switch[data-act="order"]').click());
    await page.waitForTimeout(600);
    check("...and throwing it writes the setting",
      await page.evaluate(() => (JSON.parse(localStorage.getItem("folio_v1")).settings || {}).reviewRandom) === true);
    /* …and the SHEET STAYS OPEN, which is the whole difference between a switch and a command: every
       other row here closes behind itself, and taking the sheet away is what makes a reader wonder
       whether the throw landed. (It must also not repaint — render() closes this very sheet.) */
    check("...leaving the sheet open, with the switch now on",
      await page.evaluate(() => {
        const ov = document.querySelector(".deck-menu");
        return !!(ov && ov.querySelector('.dm-switch[data-act="order"] .switch.on'));
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
        rows: [...document.querySelectorAll(".active-deck[data-review]")].map((r) => +r.querySelector(".adc-new").textContent.trim()) };
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
        n: (ov.querySelector("#dlNew") || {}).value,
        // the banner's own heading, read off the page rather than written down here: this assertion is
        // "the sheet opened on the REVIEW and not on a deck", and hard-coding the title made it fail on
        // the Aug 2026 rename ("Daily review" → "Daily study") while the behaviour was perfectly correct
        title: (document.querySelector(".review-title") || {}).textContent || "",
      } : null;
    });
    check("the review's Daily limits opens on the review, not a deck",
      dl && !!dl.title.trim() && dl.where.trim() === dl.title.trim(), JSON.stringify(dl));
    check("...showing the allowance it is actually using", dl && dl.n === "5", JSON.stringify(dl));
    await page.evaluate(() => {
      document.querySelector("#dlNew").value = "2";
      document.querySelector('.deck-menu [data-act="save"]').click();
    });
    await page.waitForTimeout(700);
    const capped = await page.evaluate(() => ({
      banner: [...document.querySelectorAll(".banner .stat")].filter((s) => !s.classList.contains("streak")).map((s) => +s.querySelector("b").textContent.trim()),
      // the DECKS are untouched: the cap is on the pooled draw, not on what a deck offers when tapped
      rows: [...document.querySelectorAll(".active-deck[data-review] .adc-new")].map((x) => +x.textContent.trim()),
      stored: (JSON.parse(localStorage.getItem("folio_v1")).deckOpts || {})["review:all"],
    }));
    check("an explicit review limit caps the pooled draw", capped.banner[0] === 2, JSON.stringify(capped));
    check("...without changing what each deck offers on its own", capped.rows.every((n) => n === 5), JSON.stringify(capped.rows));
    check("...and is stored under the review's own entry", capped.stored && capped.stored.newPerDay === 2, JSON.stringify(capped.stored));
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
       stored per entry, so it has to be settable on the entry it applies to. The order switch is NOT here:
       it is a property of the pooled session and of nothing else. */
    /* MOVE joined it in Aug 2026, on request — one row rather than three, opening a dialog of its own the
       way Custom study and Daily limits do, since the sheet already carries five commands. It sits directly
       above Remove because both are about the row rather than about what it deals out today. */
    check("holding a deck's row opens its options",
      menu.open && JSON.stringify(menu.items) === JSON.stringify(["Question variety", "Custom study", "Daily limits", "Skip today", "Move", "Remove"]),
      JSON.stringify(menu.items));

    // Daily limits — Anki's three, and the deck's own new count follows the one it sets
    await page.evaluate(() => document.querySelector('.dm-item[data-act="limits"]').click());
    await page.waitForTimeout(300);
    check("Daily limits offers new/day, max reviews/day and the ignore switch",
      await page.evaluate(() => !!(document.querySelector("#dlNew") && document.querySelector("#dlRev") && document.querySelector("#dlIgn"))));
    await page.evaluate(() => { document.querySelector("#dlNew").value = "1"; document.querySelector('[data-act="save"]').click(); });
    await page.waitForTimeout(800);
    const limited = await page.evaluate(() => [...document.querySelectorAll(".active-deck[data-review]")].map((r) => +r.querySelector(".adc-new").textContent.trim()));
    check("...and the deck's own new count follows it", limited[0] === 1, JSON.stringify(limited));

    // Custom study — today only, and it moves the number it says it moves
    await openSheet();
    await page.waitForTimeout(250);
    await page.evaluate(() => document.querySelector('.dm-item[data-act="custom"]').click());
    await page.waitForTimeout(300);
    await page.evaluate(() => { document.querySelector("#csN").value = "3"; document.querySelector('[data-act="more"]').click(); });
    await page.waitForTimeout(800);
    const bumped = await page.evaluate(() => [...document.querySelectorAll(".active-deck[data-review]")].map((r) => +r.querySelector(".adc-new").textContent.trim()));
    check("Custom study adds new cards for today only", bumped[0] === 4, JSON.stringify({ was: limited, now: bumped }));

    // Skip today — the deck sits out without leaving the review
    await openSheet();
    await page.waitForTimeout(250);
    await page.evaluate(() => document.querySelector('.dm-item[data-act="skip"]').click());
    await page.waitForTimeout(800);
    const skipped = await page.evaluate(() => {
      const rows = [...document.querySelectorAll(".active-deck[data-review]")];
      return { n: rows.length, first: [...rows[0].querySelectorAll(".adc")].map((x) => +x.textContent.trim()) };
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

  /* ================= 5. the level caps how many decks may be added ================= */
  {
    // no cards studied at all → Folio level 1 → one deck, and the shipped default S.active (a deck of the
    // coming-soon China collection) must NOT be what fills it
    const page = await newPage({ active: [], settings: SETTINGS, cards: {} });
    await page.goto(base + "#decks", { waitUntil: "load" });
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1400);
    const capped = await page.evaluate(async () => {
      const btns = [...document.querySelectorAll(".collection-add")];
      const out = { n: btns.length, added: [], roots: [] };
      for (const b of btns) { b.click(); await new Promise((r) => setTimeout(r, 250)); }
      out.added = JSON.parse(localStorage.getItem("folio_v1")).active;
      // which COLLECTIONS got in — the collections page is the only place these buttons exist, so a
      // ticked one is a root, and everything else in `active` came in underneath one of them
      out.roots = [...document.querySelectorAll(".collection-add.added")].length;
      out.toast = (document.querySelector("#toast") || {}).textContent || "";
      return out;
    });
    /* THE CAP COUNTS CHOICES, NOT ENTRIES (Aug 2026). Adding a collection now brings its whole subtree in
       with it, so `active` holds dozens of ids after one press; what the level limits is how many
       collections/decks the reader may CHOOSE, and countedActiveEntries skips anything with an active
       ancestor precisely so a four-deck collection does not put a level-1 reader five over their cap. */
    check("at level 1 the review takes one collection", capped.roots === 1, JSON.stringify({ roots: capped.roots, active: capped.added.length }));
    check("...and its decks came in with it rather than as choices of their own", capped.added.length > 1, capped.added.length + " entries");
    check("...and says so rather than doing nothing", /level/i.test(capped.toast), capped.toast);
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
        return { graduated: ids.length, days: ids.length ? Math.round((S.cards[ids[0]].due - Date.now()) / 864e5) : null };
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

  /* ================= 8. the reader's own arrangement: reordering and folders (Aug 2026, on request) =====
     Every clause here fails SILENTLY. A folder that renders as an ordinary deck row looks like a deck; a
     "Move up" that does nothing looks like a control; an arrangement lost on reload looks like a page that
     never had one. And the one that would do real damage is invisible from the outside: a folder is not an
     entry, so if one ever reached S.active or the review queue it would be a deck with no cards sitting in
     the reader's review, eating a place against the level cap. */
  {
    const page = await newPageOnce(seeded);   // seeded once, so a reload keeps what the page has written
    await page.goto(base + "#home", { waitUntil: "load" });
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1400);
    const rows = () => page.evaluate(() => [...document.querySelectorAll(".active-deck")].map((el) => ({
      key: el.dataset.adkey, folder: !!el.dataset.adfolder, review: el.dataset.review || null,
      title: (el.querySelector(".ad-title") || {}).textContent, vis: el.offsetParent !== null, depth: el.dataset.depth,
    })));
    const tops = async () => (await rows()).filter((r) => r.vis && r.depth === "0").map((r) => r.key);
    const sheetOn = (sel) => page.evaluate((s) => {
      const el = document.querySelector(s);
      el.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true }));
    }, sel);
    const press = (act) => page.evaluate((a) => {
      const b = [...document.querySelectorAll(".deck-menu .dm-item")].find((x) => x.dataset.act === a);
      if (b) b.click();
    }, act);

    check("every row in the list carries data-adkey — what the fold now keys off",
      (await rows()).every((r) => r.key), JSON.stringify((await rows()).slice(0, 2)));
    check("...and there are no folder rows until one is made", !(await rows()).some((r) => r.folder));

    // make one from the banner's own sheet, which is the only route in for a reader who has none
    await sheetOn("#b-review");
    await page.waitForTimeout(300);
    await press("newfolder");
    /* 800ms, and the reason is a real guard rather than a slow page: wireHoldMenu sets `_holdUntil` for 700ms
       after a hold and a document-level CAPTURE listener swallows the next click outside `.deck-menu`. The
       row press above is inside the sheet and so passes without clearing it — the modal's OK button is not,
       so a faster test has its click eaten and the folder is never made. */
    await page.waitForTimeout(800);
    await page.evaluate(() => {
      document.querySelector(".inline-prompt .ip-input").value = "Mornings";
      document.querySelector(".inline-prompt .ip-ok").click();
    });
    await page.waitForTimeout(800);
    let all = await rows();
    const folder = all.find((r) => r.folder);
    check("the banner's New folder makes one, named by the reader", !!folder && folder.title === "Mornings", JSON.stringify(folder));
    /* NOT tappable into a session, and this is the assertion that matters: a folder holds no cards, so a
       data-review on it would put a scope through buildSession that has nothing to deal out. */
    check("...carrying no data-review, so it taps into no session", folder && !folder.review);
    check("...and landing LAST, so making one never rearranges the list being looked at",
      (await tops()).slice(-1)[0] === folder.key, JSON.stringify(await tops()));
    check("...while never entering S.active or the review's own card set",
      await page.evaluate((k) => {
        const S = JSON.parse(localStorage.getItem("folio_v1") || "{}");
        return (S.active || []).indexOf(k) === -1 && !/^f:/.test((S.active || []).join(","));
      }, folder.key));

    // reorder it: Move up must actually swap it with the row above, and survive a reload
    const before = await tops();
    await sheetOn(`.active-deck[data-adkey="${folder.key}"]`);
    await page.waitForTimeout(300);
    const fsheet = await page.evaluate(() => [...document.querySelectorAll(".deck-menu .dm-item")].map((b) => b.dataset.act));
    /* a folder's sheet is its OWN, not openDeckMenu: every row of that one is about what a deck deals out
       today, and offering a folder Custom study would offer to change a number that decides nothing */
    check("a folder's sheet is rename / move / delete and nothing else",
      JSON.stringify(fsheet) === JSON.stringify(["rename", "move", "delete"]), JSON.stringify(fsheet));
    await press("move");
    await page.waitForTimeout(300);
    await press("up");
    await page.waitForTimeout(800);
    const after = await tops();
    check("Move up reorders the top level", before.length > 1 && after.indexOf(folder.key) === before.indexOf(folder.key) - 1,
      JSON.stringify({ before, after }));
    // it STAYS open, so moving a deck five places is five presses rather than five re-openings
    check("...with the Move dialog still open for a second press",
      await page.evaluate(() => !!document.querySelector('.deck-menu .dm-item[data-act="up"]')));
    await page.evaluate(() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1400);
    check("...and the new order surviving a reload", JSON.stringify(await tops()) === JSON.stringify(after),
      JSON.stringify({ after, now: await tops() }));

    // move a deck into it
    const target = await page.evaluate(() => {
      const el = [...document.querySelectorAll(".active-deck[data-review]")].find((e) => e.offsetParent !== null);
      return el ? el.dataset.adkey : null;
    });
    check("a deck row is reachable to move", !!target, target);
    await sheetOn(`.active-deck[data-adkey="${target}"]`);
    await page.waitForTimeout(300);
    await press("move");
    await page.waitForTimeout(300);
    const msheet = await page.evaluate(() => [...document.querySelectorAll(".deck-menu .dm-item")].map((b) => ({ act: b.dataset.act, dis: b.disabled })));
    check("the Move dialog offers up, down, the folder and a new one",
      msheet.some((r) => r.act === "up") && msheet.some((r) => r.act === "down") &&
      msheet.some((r) => /^into:/.test(r.act || "")) && msheet.some((r) => r.act === "new"), JSON.stringify(msheet));
    // the end it cannot move past is greyed rather than absent, so the sheet does not jump under the finger
    check("...with the end of the run disabled rather than missing",
      msheet.some((r) => (r.act === "up" || r.act === "down") && r.dis === true), JSON.stringify(msheet));
    await page.evaluate(() => {
      const b = [...document.querySelectorAll(".deck-menu .dm-item")].find((x) => /^into:/.test(x.dataset.act || ""));
      if (b) b.click();
    });
    await page.waitForTimeout(800);
    all = await rows();
    const moved = all.find((r) => r.key === target);
    check("the deck now sits inside the folder", moved && +moved.depth === 1 &&
      all.findIndex((r) => r.key === target) > all.findIndex((r) => r.folder), JSON.stringify(moved));
    check("...visible, because a folder the reader just made starts OPEN", moved && moved.vis, JSON.stringify(moved));
    check("...and still tappable into its own session", moved && moved.review === target);
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1400);
    check("...with the whole arrangement surviving a reload",
      await page.evaluate((k) => { const el = document.querySelector(`.active-deck[data-adkey="${k}"]`); return !!el && el.dataset.depth === "1"; }, target));

    /* THE FOLD walks the ARRANGED parents now, not the collection tree — a row inside a folder has an
       ancestor the tree has never heard of, so folding the folder is what proves the new walk. */
    await page.evaluate((k) => document.querySelector(`.active-deck[data-adkey="${k}"] .ad-chev`).click(), folder.key);
    await page.waitForTimeout(600);
    check("folding a folder hides what is inside it",
      !((await rows()).find((r) => r.key === target) || {}).vis);
    check("...and the rounded corner follows the last VISIBLE row",
      await page.evaluate(() => {
        const v = [...document.querySelectorAll(".active-deck")].filter((e) => e.offsetParent !== null);
        const l = v[v.length - 1];
        return !!l && l.classList.contains("ad-last") && parseFloat(getComputedStyle(l).borderBottomLeftRadius) > 0;
      }));

    // the COLLECTIONS page must know nothing about any of this
    await page.goto(base + "#decks", { waitUntil: "load" });
    await page.waitForTimeout(1200);
    check("the Collections page shows no folders and still draws its collections",
      await page.evaluate(() => document.querySelectorAll("[data-adfolder]").length === 0 && document.querySelectorAll(".collection").length > 0));

    // deleting the folder puts its deck back rather than taking it out of the review
    await page.goto(base + "#home", { waitUntil: "load" });
    await page.waitForTimeout(1400);
    await sheetOn(`.active-deck[data-adkey="${folder.key}"]`);
    await page.waitForTimeout(300);
    await press("delete");
    await page.waitForTimeout(800);
    all = await rows();
    check("deleting a folder removes its row", !all.some((r) => r.folder));
    check("...and its deck is still in the review, back where the tree puts it",
      all.some((r) => r.key === target) &&
      await page.evaluate((k) => (JSON.parse(localStorage.getItem("folio_v1") || "{}").active || []).indexOf(k) !== -1, target));
    // …and the layout is cleaned, or a stale key would keep a dead folder looking occupied
    check("...with the layout cleaned of the dead folder",
      await page.evaluate(() => {
        const L = (JSON.parse(localStorage.getItem("folio_v1") || "{}").adLayout) || {};
        return Object.keys(L.folders || {}).length === 0 &&
          !Object.keys(L.parent || {}).some((k) => /^f:/.test(String(L.parent[k] || "")));
      }));
    await page.close();
  }

  console.log("");
  if (errs.length) { console.log("page errors:"); errs.forEach((e) => console.log("  " + e)); fail += errs.length; }
  console.log(pass + " passed, " + fail + " failed");
  await browser.close();
  server.close();
  process.exit(fail ? 1 : 0);
})();
