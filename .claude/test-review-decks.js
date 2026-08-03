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
    · the Folio level caps how many decks may sit in the review at once

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
    check("...and the review's own pile is the global allowance, not their sum",
      home.banner[0] === 5, JSON.stringify({ banner: home.banner, rows: home.rows.map((r) => r.counts[0]) }));
    check("the bin at the end of each row is gone", home.trash === 0);
    check("the banner carries no big numeral", !home.badge);
    check("...and no line describing the counts under it", !/scheduled/i.test(home.desc), home.desc);
    /* The numeral used to sit ABOVE the title on a phone and push it clear of the Ordered / Random toggle,
       which is absolutely positioned at the group's top right. With the numeral gone the title moved up
       into it — so this measures the TITLE'S TEXT (a Range, since the h2 spans the column whatever its
       words do) against the toggle, at both widths, and checks it is still one line. */
    for (const w of [390, 1280]) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.waitForTimeout(500);
      const t = await page.evaluate(() => {
        const h = document.querySelector(".review-title"), o = document.querySelector(".review-order");
        const r = document.createRange(); r.selectNodeContents(h);
        const tb = r.getBoundingClientRect(), ob = o.getBoundingClientRect(), hb = h.getBoundingClientRect();
        return { clash: tb.right > ob.left, lines: Math.round(hb.height / parseFloat(getComputedStyle(h).fontSize)) };
      });
      check("[" + w + "px] the review title clears the Ordered / Random toggle", !t.clash, JSON.stringify(t));
      check("[" + w + "px] ...on one line", t.lines === 1, JSON.stringify(t));
    }
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
      const today = new Date().toISOString().slice(0, 10);
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
    check("holding a deck's row opens its options",
      menu.open && JSON.stringify(menu.items) === JSON.stringify(["Custom study", "Daily limits", "Skip today", "Remove"]),
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
      const out = { n: btns.length, added: [] };
      for (const b of btns) { b.click(); await new Promise((r) => setTimeout(r, 250)); }
      out.added = JSON.parse(localStorage.getItem("folio_v1")).active;
      out.toast = (document.querySelector("#toast") || {}).textContent || "";
      return out;
    });
    check("at level 1 the review takes one deck", capped.added.length === 1, JSON.stringify(capped.added));
    check("...and says so rather than doing nothing", /level/i.test(capped.toast), capped.toast);
    await page.close();
  }

  console.log("");
  if (errs.length) { console.log("page errors:"); errs.forEach((e) => console.log("  " + e)); fail += errs.length; }
  console.log(pass + " passed, " + fail + " failed");
  await browser.close();
  server.close();
  process.exit(fail ? 1 : 0);
})();
