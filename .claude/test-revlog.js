#!/usr/bin/env node
/* Folio — THE PER-REVIEW LOG, Card info, and the Answer-buttons statistics card.
   ============================================================================
   Everything here fails SILENTLY, which is why it is a file rather than a few lines appended elsewhere.
   A log that stops being written throws nothing and looks exactly like a reader who has not studied; a
   duration that stops being measured leaves a card of dashes that reads as a reader who answers instantly;
   and an undo that forgets to take its row back leaves the reader's own history permanently one review
   wrong, in a panel nobody checks against anything.

   It also guards the one thing about this feature that CANNOT be fixed later. The log is the only record of
   what happened to a card, and it is written as it happens — so a day on which it silently stops is a day
   whose detail no later release can reconstruct. That is the whole argument for the feature and it is the
   assertion worth having most.

   What it covers:
     · THE ROW. Eight fields, the documented order, the documented units — minutes for both intervals,
       tenths of a second for the duration, ease ×100. Read off the SHIPPED save rather than from a function
       sliced out of app.js, because an encoding that only the writer and the reader agree about is exactly
       the thing that drifts.
     · THE PRE-GRADE STATE, which is the field a naive implementation gets wrong: it must say what the card
       WAS when the button was pressed, not what the grade turned it into. A row that records "review" for a
       new card would make every retention figure built on the log wrong in the same direction.
     · THE DURATION IS CAPPED. A card left open over lunch must not claim two hours of study — the cap is
       the difference between a time figure and a fiction.
     · UNDO TAKES BACK ITS OWN ROW, BY IDENTITY. Asserted twice over: once for the row count, and once for
       the row's CONTENT, because "remove the last row" passes the count test while taking somebody else's
       review off. The second grade of the same card is what makes the two distinguishable.
     · CARD INFO IN BOTH ITS STATES. A card with history shows the table; a card without shows the honest
       note and its state anyway. Both halves matter and they fail in opposite directions — a panel that
       always shows the note reads as a log that is not being written, and one that never shows it reads as
       a reader with no past at all.
     · THE ANSWER-BUTTONS CARD renders nothing on an empty log and four correctly-labelled, four-coloured
       bars on a full one. It needs a SESSION (the statistics live on the signed-in account page), so
       Supabase is the same page.route stand-in test-account-page.js uses, and for the same reason: the
       publishable key in app.js points at the real project.
     · IT FITS. The sheet is a seven-column table inside a centred box; it is measured at 1280px and at
       390px, where it must scroll inside itself rather than widen the document.

   Run:  NODE_PATH=<playwright>/node_modules node .claude/test-revlog.js
   Env:  FOLIO_CHROMIUM=<path to chrome> if Chromium lives outside the playwright package. */
const path = require("path"), http = require("http"), fs = require("fs");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");
const ROOT = path.join(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };
let pass = 0, fail = 0;
const check = (n, ok, extra) => { if (ok) { pass++; console.log("ok    " + n + (extra ? "  " + extra : "")); } else { fail++; console.log("FAIL  " + n + (extra ? "  " + extra : "")); } };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); return res.end("nf"); }
  res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" });
  res.end(fs.readFileSync(f));
});

/* A deck that really has cards, read off data.js rather than named from memory: a renamed deck would leave
   this test studying nothing and reporting a log that is not being written. */
function seedDeck() {
  const g = global.window; global.window = {};
  try {
    delete require.cache[require.resolve(path.join(ROOT, "data.js"))];
    require(path.join(ROOT, "data.js"));
    const out = [];
    (function walk(n) {
      if (!n || typeof n !== "object") return;
      const kids = n.children || n.collections || n.decks;
      if (Array.isArray(kids)) kids.forEach(walk);
      if (Array.isArray(n.cardIds) && n.cardIds.length >= 3) out.push({ id: n.id, cards: n.cardIds.slice(0, 4) });
    })(global.window.COLLECTION_TREE);
    return out[0] || null;
  } finally { global.window = g; }
}

const UID = "00000000-0000-4000-8000-100000000001";
const PROFILE = { id: UID, username: "scholar", name: "Scholar", role: "user", joined: "2026-01-01T00:00:00Z" };

(async () => {
  const found = seedDeck();
  if (!found) { console.log("FAIL  no deck in data.js has three cards to study"); process.exit(1); }
  const DECK = found.id, CARDS = found.cards;
  console.log("(studying deck " + DECK + " — " + CARDS.join(", ") + ")\n");

  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port + "/";
  const browser = await chromium.launch(LAUNCH);
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = [];
  page.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !isNoise(t)) errs.push(t); });
  page.on("pageerror", (e) => errs.push(String(e)));

  // Supabase is never reached for the study half; the account half needs it (see the header).
  await page.route(/supabase\.co/, async (route) => {
    const p = new URL(route.request().url()).pathname;
    const json = (body) => route.fulfill({ status: 200, contentType: "application/json", headers: { "content-range": "0-0/1", "access-control-expose-headers": "content-range" }, body: JSON.stringify(body) });
    if (p === "/auth/v1/token") return json({ access_token: "tok", refresh_token: "ref", expires_in: 3600, user: { id: UID, email: "a@b.c" } });
    if (p === "/auth/v1/user") return json({ id: UID, email: "a@b.c" });
    if (p === "/rest/v1/profiles") return json([PROFILE]);
    if (p === "/rest/v1/progress") return json([{ user_id: UID, data: {}, updated_at: "2026-01-02T00:00:00Z" }]);
    return json([]);
  });

  const revlog = () => page.evaluate(() => JSON.parse(localStorage.folio_v1 || "{}").revlog || []);
  const reveal = async () => {
    await page.evaluate(() => {
      const b = [...document.querySelectorAll(".actions button, .study-card button")]
        .find((x) => /reveal|show answer/i.test(x.textContent + " " + x.id + " " + x.className));
      if (b) b.click();
    });
    await page.waitForTimeout(320);
    if (!(await page.evaluate(() => !!document.querySelector('.grade[data-g="good"]')))) {
      await page.keyboard.press("Space"); await page.waitForTimeout(360);
    }
  };
  const gradeGood = async (ms) => {
    await reveal();
    if (ms) await page.waitForTimeout(ms);   // …so the duration is a measurable figure rather than a rounding
    await page.evaluate(() => document.querySelector('.grade[data-g="good"]')?.click());
    await page.waitForTimeout(420);
  };
  /* Start a session. `#study` is deliberately NOT a restorable hash (a pasted study link goes home), so the
     only way in is the review banner — which is also the route a reader takes. `newPerDay: 1` is what makes
     the run deterministic: one new card is offered, so its 10-minute learning step requeues THE SAME card
     and the second grade lands on a card that already has a logged review. */
  const startSession = async (extra) => {
    await page.goto(base, { waitUntil: "load" });
    await page.waitForTimeout(500);
    await page.evaluate((a) => {
      const S = JSON.parse(localStorage.folio_v1 || "{}");
      S.active = [a.deck];
      S.settings = Object.assign({}, S.settings, { animations: false, newPerDay: 1 });
      Object.assign(S, a.extra || {});
      localStorage.folio_v1 = JSON.stringify(S);
      localStorage.folio_tour_v1 = "no";                 // the walkthrough offer is not what this measures
    }, { deck: DECK, extra: extra });
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(700);
    await page.evaluate(() => document.querySelector("#b-review")?.click());
    await page.waitForTimeout(700);
  };

  // ---------------------------------------------------------------- 1. the row
  console.log("-- 1. the row --");
  await startSession();
  check("a session started", await page.evaluate(() => !!document.querySelector(".study-card")));
  check("the log starts empty", (await revlog()).length === 0);
  await gradeGood(900);
  let log = await revlog();
  check("one grade writes exactly one row", log.length === 1, "(" + log.length + ")");
  const r = log[0] || [];
  check("the row has the documented eight fields", Array.isArray(r) && r.length === 8, JSON.stringify(r));
  check("field 0 is a card id present in the deck", typeof r[0] === "string" && /^[a-z]+-\d+$/i.test(r[0]), String(r[0]));
  check("field 1 is a plausible ms timestamp", r[1] > 1.7e12 && r[1] <= Date.now() + 5000, String(r[1]));
  check("field 2 is Good (3)", r[2] === 3, String(r[2]));
  // the field a naive implementation gets wrong — see the header
  check("field 3 is the state BEFORE the grade (new = 0)", r[3] === 0, String(r[3]));
  check("field 4 is 0 — a new card was on no interval", r[4] === 0, String(r[4]));
  check("field 5 is the delay in MINUTES (the 10m step)", r[5] === 10, String(r[5]));
  /* ×100 of whatever the card is scheduled BY — its ease here, since this is a curated deck and those are on
     SM-2, and its FSRS difficulty on a deck that has been switched (which `test-review-decks.js` covers). */
  check("field 6 is the ease ×100, an integer", Number.isInteger(r[6]) && r[6] >= 130 && r[6] <= 400, String(r[6]));
  check("field 7 is a measured duration in tenths", r[7] >= 5, String(r[7]) + " tenths");
  check("the duration is capped at 60s", log.every((x) => x[7] <= 600));

  // ---------------------------------------------------------------- 2. undo takes back ITS OWN row
  console.log("\n-- 2. undo --");
  /* The card is still in the session: its 10-minute learning step requeues it, which is what makes an undo
     testable from the study page at all. Undo is pressed with the KEY here — the shortcut is the half a
     reader reaches for mid-session, and the completion screen's button is exercised below. */
  await page.keyboard.press("Control+z");
  await page.waitForTimeout(500);
  check("undo removes the row it wrote", (await revlog()).length === 0, "(" + (await revlog()).length + ")");
  check("…and the card comes back to be answered again", await page.evaluate(() => !!document.querySelector(".study-card")));

  // ---------------------------------------------------------------- 3. a second review of the same card
  console.log("\n-- 3. a second review of the same card --");
  await gradeGood(500);                     // row A — new -> learning, requeued
  await gradeGood(400);                     // row B — learning -> review, graduates, so the session ends
  let log2 = await revlog();
  check("two rows for two answers", log2.length === 2, "(" + log2.length + ")");
  check("both rows are the same card", log2[0][0] === log2[1][0], log2.map((x) => x[0]).join(" / "));
  check("row A's pre-state is New (0)", log2[0][3] === 0, String(log2[0][3]));
  check("row B's pre-state is Learning (1)", log2[1][3] === 1, String(log2[1][3]));
  /* GRADUATION IS ABOUT A DAY, NOT 1,440 MINUTES, and reading it as minutes made this assertion fail for
     twenty-three hours of every day. Anything the scheduler measures in DAYS lands at the START of its day
     (`schedDayDue` / `cfg.dayAnchor`), so the delay a one-day interval actually buys is however much of
     today is left — 1,347 minutes when this was found at 01:22 UTC, and 1,440 only for a card graded in
     the first minute after midnight. A BAND is what can honestly be asked of it: the floor separates a
     graduated card from the ten-minute step it left, and the ceiling from a card that has jumped to weeks.
     "The due lands on a later date" was tried first and is ALSO wrong, because `nextMin` is whole minutes:
     a due at exactly midnight reconstructs a fraction of a minute short of it and reads as the same day.
     Same fault as `test-cards.js`'s due-date checks — a test that reads a clock has to read it the way the
     code does. */
  const graduated = await page.evaluate((id) => (JSON.parse(localStorage.folio_v1 || "{}").cards || {})[id]?.status, log2[1][0]);
  check("row B graduates the card out of learning", graduated === "review", String(graduated));
  /* AND THE BAND IS READ OFF THE CLOCK, NOT WRITTEN DOWN. A fixed 12–36 hour floor was the second wrong
     form of this assertion and failed for the whole AFTERNOON of every UTC day: the delay a one-day
     interval buys is however much of today is left, so it is 1,347 minutes at 01:22 and 78 at 22:42 —
     the CI run that found it read 91. What is constant is not the SIZE of the gap but where it LANDS,
     which is the next day boundary; the minute of tolerance is `logReviewEntry` rounding the span to
     whole minutes, which can reconstruct a due at exactly midnight a fraction short of it. */
  const boundary = await page.evaluate(() => { const d = new Date(); d.setHours(24, 0, 0, 0); return d.getTime(); });
  const due = log2[1][1] + log2[1][5] * 60000;
  check("…and the next sight of it is a later day, not a ten-minute step",
    due + 60000 >= boundary && log2[1][5] <= 36 * 60,
    log2[1][5] + " min, due " + new Date(due).toISOString());
  /* THE ASSERTION A COUNT CANNOT MAKE. Undo from the completion screen and the row that must survive is
     row A: an implementation that pops the LAST row passes a count check and fails this one. */
  const rowA = JSON.stringify(log2[0]);
  check("the session finished", await page.evaluate(() => !!document.querySelector("#undoLast")));
  await page.evaluate(() => document.querySelector("#undoLast")?.click());
  await page.waitForTimeout(500);
  log2 = await revlog();
  check("undoing from the completion screen removes one row", log2.length === 1, "(" + log2.length + ")");
  check("…and it is row B that went, not row A", JSON.stringify(log2[0]) === rowA, JSON.stringify(log2[0]));

  // ---------------------------------------------------------------- 4. Card info, with history
  console.log("\n-- 4. card info, on a card that has been reviewed --");
  /* Both card-info sections seed a DUE review card so the session has something to offer, and seed the log
     to match, because what is being measured is the panel rather than the scheduler: a run of real grades
     would put whatever the ladder happens to produce in the table and assert almost nothing about it. */
  const seedCard = async (rows) => {
    /* Seeded for EVERY card the deck might deal rather than for the one the queue happens to open on: the
       session's first card is the scheduler's business, and a test that fishes it out of sessionStorage and
       then rewrites its record is a test that depends on the order those two things happen in. */
    await page.goto(base, { waitUntil: "load" });
    await page.waitForTimeout(450);
    await page.evaluate((a) => {
      const S = JSON.parse(localStorage.folio_v1 || "{}");
      const t = Date.now();
      S.active = [a.deck];
      /* NO NEW CARDS. What is measured here is the PANEL, and the review interleaves the day's new cards
         among the due ones (`mixPiles`), so at one a day the session opens on a card this seed knows
         nothing about roughly as often as not — the sheet then honestly reports "New — not studied yet"
         while every assertion below asks about a mature record, and a coin toss reads as a broken panel. */
      S.settings = Object.assign({}, S.settings, { animations: false, newPerDay: 0 });
      S.cards = {};
      S.revlog = [];
      a.ids.forEach((id) => {
        // a mature card, DUE, so the session offers it rather than finishing empty
        S.cards[id] = { status: "review", interval: 21, ease: 2.5, reps: 9, lapses: 2, due: t - 36e5, last: t - 21 * 864e5, first: "2026-02-01", step: 0 };
        (a.rows || []).forEach((r, i) => S.revlog.push([id, t - (a.rows.length - i) * 864e5, r[0], r[1], r[2], r[3], 250, 62]));
      });
      localStorage.folio_v1 = JSON.stringify(S);
      localStorage.folio_tour_v1 = "no";
      sessionStorage.removeItem("folio_study_v1");   // …or the reload resumes a queue built against the old records
    }, { deck: DECK, ids: CARDS, rows: rows });
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(850);
    await page.evaluate(() => document.querySelector("#b-review")?.click());
    await page.waitForTimeout(750);
    const live = await page.evaluate(() => !!document.querySelector("#cardInfo"));
    await page.evaluate(() => document.querySelector("#cardInfo")?.click());
    await page.waitForTimeout(480);
    return live;
  };
  //                 grade, pre-state, prevMin, nextMin
  check("a session offering the seeded card", await seedCard([[3, 3, 14400, 30240], [1, 3, 30240, 10]]));
  let ci = await page.evaluate(() => {
    const box = document.querySelector(".deck-menu.ci-sheet .dm-box");
    if (!box) return null;
    const rect = box.getBoundingClientRect(), wrap = box.querySelector(".ci-histwrap");
    const trs = [...box.querySelectorAll("table.ci-hist tbody tr")];
    return {
      keys: [...box.querySelectorAll(".ci-k")].map((e) => e.textContent.trim()),
      vals: [...box.querySelectorAll(".ci-v")].map((e) => e.textContent.trim()),
      rows: trs.length,
      cells: trs.map((tr) => [...tr.children].map((td) => td.textContent.trim())),
      none: !!box.querySelector(".ci-none"),
      sum: (box.querySelector(".ci-sum") || {}).textContent || "",
      onScreen: rect.left >= -1 && rect.right <= innerWidth + 1 && rect.top >= -1 && rect.bottom <= innerHeight + 1,
      scrollsInside: wrap ? getComputedStyle(wrap).overflowX === "auto" : false,
      docWide: document.documentElement.scrollWidth > innerWidth + 1,
    };
  });
  check("the sheet opens", !!ci);
  if (ci) {
    check("the state block names the state, the deck and the id", ["State", "Deck", "Card id"].every((k) => ci.keys.includes(k)), ci.keys.join(" / "));
    check("…and the interval, ease, reviews and lapses", ["Interval", "Ease", "Reviews", "Lapses"].every((k) => ci.keys.includes(k)), ci.keys.join(" / "));
    check("the interval comes from the card record", /21d/.test(ci.vals.join(" ")), ci.vals.join(" | "));
    check("a due card says so", /now/.test(ci.vals.join(" ")), ci.vals.join(" | "));
    check("a card past the leech threshold is NOT called one at 2 lapses", !/leech/i.test(ci.vals.join(" ")));
    check("both logged reviews are in the table", ci.rows === 2, ci.rows + " rows");
    // newest first, which is the order a reader reads a history in
    check("the table is newest first", /Again/.test((ci.cells[0] || []).join(" ")) && /Good/.test((ci.cells[1] || []).join(" ")), (ci.cells[0] || []).join("|") + "  //  " + (ci.cells[1] || []).join("|"));
    /* The whole point of a row: the newest is a lapse, and it has to read "was on 21 days, dropped to a
       10-minute step". A row that shows only one of the two intervals says nothing about what the button did. */
    check("a row states the interval it came FROM and went TO", /21d/.test((ci.cells[0] || [])[3] || "") && /10m/.test((ci.cells[0] || [])[4] || ""), (ci.cells[0] || []).join(" | "));
    check("…and the row before it shows the growth that preceded the lapse", /10d/.test((ci.cells[1] || [])[3] || "") && /21d/.test((ci.cells[1] || [])[4] || ""), (ci.cells[1] || []).join(" | "));
    check("…and the ease and the time it took", /250%|%/.test((ci.cells[0] || []).join(" ")) && /6\.2s/.test((ci.cells[0] || []).join(" ")), (ci.cells[0] || []).join(" | "));
    check("the honest 'no reviews' note is ABSENT here", !ci.none);
    check("the summary counts them, and what was remembered", /2 reviews/.test(ci.sum) && /1 of 2 remembered/.test(ci.sum), ci.sum.trim());
    check("the sheet fits the viewport", ci.onScreen);
    check("the wide table scrolls inside the sheet rather than widening the page", ci.scrollsInside && !ci.docWide);
  }
  /* THE SHEET OWNS THE KEYBOARD WHILE IT IS OPEN, and this is the failure the panel itself introduces: every
     study shortcut acts on the card UNDERNEATH, so a reader who opens Card info mid-card and presses 3 would
     grade the card they are reading about — invisibly, since the sheet is over it. Asserted on the grade keys
     AND on Ctrl+Z, which would otherwise undo a grade the reader cannot see. */
  const beforeKeys = (await revlog()).length;
  await page.keyboard.press("3");
  await page.waitForTimeout(300);
  await page.keyboard.press("Control+z");
  await page.waitForTimeout(300);
  check("a grade key over the sheet does not grade the card behind it", (await revlog()).length === beforeKeys, beforeKeys + " -> " + (await revlog()).length);
  check("…and the sheet is still open", await page.evaluate(() => !!document.querySelector(".deck-menu.ci-sheet")));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(350);
  const narrow = await page.evaluate(() => {
    const box = document.querySelector(".deck-menu.ci-sheet .dm-box");
    if (!box) return null;
    const rect = box.getBoundingClientRect();
    return { fits: rect.left >= -1 && rect.right <= innerWidth + 1, docWide: document.documentElement.scrollWidth > innerWidth + 1 };
  });
  check("it fits a 390px phone without widening the page", !!narrow && narrow.fits && !narrow.docWide, JSON.stringify(narrow));
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);

  // ---------------------------------------------------------------- 5. Card info, with no history
  console.log("\n-- 5. …and on a card the log has never seen --");
  /* The other half, and it fails the opposite way: every card studied before August 2026 is in exactly this
     shape — a real state with no rows behind it — and the panel must say which rather than reading as a
     card with no past. A panel that always shows the note reads as a log that has stopped being written. */
  check("a session offering the seeded card", await seedCard([]));
  ci = await page.evaluate(() => {
    const box = document.querySelector(".deck-menu.ci-sheet .dm-box");
    if (!box) return null;
    return {
      keys: [...box.querySelectorAll(".ci-k")].map((e) => e.textContent.trim()),
      vals: [...box.querySelectorAll(".ci-v")].map((e) => e.textContent.trim()),
      rows: box.querySelectorAll("table.ci-hist tbody tr").length,
      none: (box.querySelector(".ci-none") || {}).textContent || "",
    };
  });
  check("the sheet opens on a card with no logged reviews", !!ci);
  if (ci) {
    check("the state is still reported in full", ci.keys.includes("Interval") && ci.keys.includes("Lapses"), ci.keys.join(" / "));
    check("…from the card record, not the log", /21d/.test(ci.vals.join(" ")), ci.vals.join(" | "));
    check("no history table is drawn", ci.rows === 0);
    check("and it says WHY rather than reading as a card with no past", /never written down|began keeping/i.test(ci.none), ci.none.slice(0, 60).trim() + "…");
  }
  await page.keyboard.press("Escape");
  await page.waitForTimeout(250);

  // ---------------------------------------------------------------- 6. the Answer-buttons card
  console.log("\n-- 6. the answer-buttons statistics card --");
  /* The statistics live on the SIGNED-IN account page, so this half needs the session the mock provides.
     The log is seeded rather than ground out one card at a time: what is being measured is the reading of
     a full log, and forty real grades would measure the study page instead. */
  await page.goto(base, { waitUntil: "load" });
  await page.evaluate((uid) => {
    localStorage.setItem("folio_supa_v1", JSON.stringify({ access_token: "tok", refresh_token: "ref", expires_at: Date.now() + 3600000, user: { id: uid, email: "a@b.c" } }));
    const S = JSON.parse(localStorage.folio_v1 || "{}");
    S.revlog = [];
    localStorage.folio_v1 = JSON.stringify(S);
  }, UID);
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(1100);
  await page.evaluate(() => { location.hash = "#account"; });
  await page.waitForTimeout(1100);
  check("with an empty log the card renders NOTHING", await page.evaluate(() => !document.querySelector(".rs-ab")));

  await page.evaluate(() => {
    const S = JSON.parse(localStorage.folio_v1 || "{}");
    const t = Date.now(), rows = [];
    // 20 rows: 4 Again, 3 Hard, 10 Good, 3 Easy — counts chosen so no two bars can be confused for each other
    const plan = [[1, 4], [2, 3], [3, 10], [4, 3]];
    let k = 0;
    plan.forEach(([g, n]) => { for (let i = 0; i < n; i++) rows.push(["wh-001", t - (++k) * 36e5, g, 3, 1440, 4320, 250, 55]); });
    S.revlog = rows;
    localStorage.folio_v1 = JSON.stringify(S);
  });
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(1100);
  await page.evaluate(() => { location.hash = "#account"; });
  await page.waitForTimeout(1200);
  const ab = await page.evaluate(() => {
    const card = document.querySelector(".rs-ab");
    if (!card) return null;
    return {
      meta: card.querySelector(".rs-meta").textContent.trim(),
      sub: card.querySelector(".rs-sub").textContent.trim(),
      bars: [...card.querySelectorAll(".ab-bar")].map((b) => ({
        label: b.querySelector("em").textContent.trim(),
        pct: b.querySelector("b").textContent.trim(),
        col: getComputedStyle(b.querySelector("i")).backgroundColor,
        h: Math.round(b.querySelector("i").getBoundingClientRect().height),
      })),
    };
  });
  check("with rows the card renders", !!ab);
  if (ab) {
    check("four bars, in the grade order", ab.bars.map((b) => b.label).join(",") === "Again,Hard,Good,Easy", ab.bars.map((b) => b.label).join(","));
    check("the percentages are the seeded ones", ab.bars.map((b) => b.pct).join(" ") === "20% 15% 50% 15%", ab.bars.map((b) => b.pct).join(" "));
    // a bar chart whose bars are all one colour says nothing the labels did not already say
    check("no two grades share a colour", new Set(ab.bars.map((b) => b.col)).size === 4, ab.bars.map((b) => b.col).join(" "));
    check("the tallest bar is Good", Math.max(...ab.bars.map((b) => b.h)) === ab.bars[2].h, ab.bars.map((b) => b.label + ":" + b.h).join(" "));
    check("the summary counts remembered against forgotten", /16 remembered, 4 forgotten/.test(ab.sub), ab.sub);
    check("…and reports the time the log measured", /a card on average/.test(ab.sub) && /studied/.test(ab.sub), ab.sub);
    /* The log is younger than the window it is asked about, and must say so rather than reporting a quiet
       month as a quiet thirty days — the seeded rows span under a day. */
    check("the window names the log's own age, not a flat 30 days", /^Since /.test(ab.meta), ab.meta);
  }

  console.log("");
  check("no console errors anywhere", errs.length === 0, errs.slice(0, 3).join(" | "));
  console.log("\n" + pass + " passed, " + fail + " failed");
  await browser.close();
  server.close();
  process.exit(fail ? 1 : 0);
})();
