#!/usr/bin/env node
/*
  ACTING ON CARDS — flags, Set due date, Forget, and the card browser (Aug 2026).

  Every one of these fails SILENTLY, which is why they are worth a file. A flag that is written but never
  drawn looks exactly like a flag nobody set. A Set-due-date that moves the due stamp and leaves the card in
  `learning` looks fine until the next grade walks the steps and overwrites the date. A Forget that DELETES
  the record rather than resetting it silently takes back a level, Folio's XP being the number of distinct
  cards studied. And a browser whose search quietly ANDs nothing at all returns the whole collection, which
  reads as a search that found everything rather than one that parsed nothing.

  The pure half — schedSetDue / schedForget / parseSetDue / the search parser — is sliced out of app.js by
  text and run as arithmetic, the technique test-scheduler.js uses, because a scheduling rule reads far
  better as a failed comparison than as a screenshot. The browser half is driven through a real browser.

    node .claude/test-cards.js
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

const APP = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const DAY = 864e5;

/* ---------------------------------------------------------------------------------------------------
   1. the PURE half: schedSetDue, schedForget, parseSetDue
   Sliced by text so it can never drift from what ships. The slice ends at the SRS marker for the reason
   test-scheduler.js's does — everything past it reads S.
--------------------------------------------------------------------------------------------------- */
function slice(from, to, what) {
  const a = APP.indexOf(from), b = APP.indexOf(to, a + 1);
  if (a < 0 || b < 0) { console.log("FAIL  could not slice " + what + " out of app.js"); process.exit(1); }
  return APP.slice(a, b);
}
const pure = (() => {
  const body = slice("const SCHED = {", "/* ---------- SRS ---------- */", "the scheduler");
  const src = "const DAY = 864e5;\n" + body +
    "\nreturn { SCHED, schedSetDue, schedForget, schedBlank, schedAnswer, schedFuzzRand, schedIsLearning };";
  return new Function(src)();
})();
const parse = (() => {
  const body = slice("const SETDUE_RX =", "function openSetDueSheet", "parseSetDue");
  return new Function(body + "\nreturn parseSetDue;")();
})();

{
  console.log("--- Set due date and Forget (pure) ---");
  const t = 1770000000000;
  const rec = (o) => Object.assign(pure.schedBlank(), { due: t, last: t - 3 * DAY }, o);

  // --- schedSetDue
  const a = pure.schedSetDue(rec({ status: "review", interval: 30, ease: 2.6, reps: 9, lapses: 2 }), 7, t, false);
  check("a plain number moves the due date and nothing else", a.due === t + 7 * DAY && a.interval === 30, JSON.stringify({ d: (a.due - t) / DAY, iv: a.interval }));
  check("…keeping the ease, the reps and the lapses", a.ease === 2.6 && a.reps === 9 && a.lapses === 2);
  const b = pure.schedSetDue(rec({ status: "review", interval: 30 }), 7, t, true);
  check("`!` moves the interval to match", b.interval === 7 && b.due === t + 7 * DAY, String(b.interval));
  const z = pure.schedSetDue(rec({ status: "review", interval: 30 }), 0, t, false);
  check("0 days means due now", z.due === t, String((z.due - t) / DAY));

  /* A NEW or LEARNING card must come out as a REVIEW card. Left in learning, the date the reader has just
     chosen is overwritten by the very next grade, which walks the steps — and nothing on screen says so. */
  const n = pure.schedSetDue(null, 5, t, false);
  check("a card with no record at all can be given a due date", !!n && n.due === t + 5 * DAY);
  check("…and comes out as a review card", n.status === "review", n.status);
  check("…with an interval, since a review card scheduled by nothing is not one", n.interval === 5, String(n.interval));
  const lrn = pure.schedSetDue(rec({ status: "learning", step: 1, interval: 0 }), 3, t, false);
  check("a learning card becomes a review card", lrn.status === "review" && lrn.step === 0, lrn.status);
  const rel = pure.schedSetDue(rec({ status: "relearn", step: 0, interval: 12, lapseIv: 6 }), 4, t, false);
  check("a relearning card keeps its interval and loses its return-to", rel.interval === 12 && rel.lapseIv === undefined);
  check("nothing is ever scheduled into the past", pure.schedSetDue(rec({ status: "review", interval: 5 }), -3, t, false).due >= t);
  check("…and never past the ceiling", pure.schedSetDue(rec({ status: "review" }), 99999999, t, true).interval <= pure.SCHED.maxIv);
  const src0 = rec({ status: "review", interval: 30 });
  pure.schedSetDue(src0, 7, t, true);
  check("the caller's own record is never mutated", src0.interval === 30 && src0.due === t);

  // --- schedForget
  const f = pure.schedForget(rec({ status: "review", interval: 40, ease: 1.9, reps: 12, lapses: 5, stability: 33, difficulty: 8.1, leech: true }), false, t);
  check("forgetting puts the card back to new", f.status === "new" && f.interval === 0 && f.step === 0, f.status);
  check("…due now, so it is dealt as a new card", f.due === t);
  check("…and the ease goes back to the deck's starting ease", f.ease === pure.SCHED.startEase, String(f.ease));
  check("the FSRS memory state GOES — forgetting is the claim that it was wrong", f.stability === undefined && f.difficulty === undefined);
  check("the reps and lapses stay by default: those reviews happened", f.reps === 12 && f.lapses === 5, JSON.stringify({ r: f.reps, l: f.lapses }));
  const f2 = pure.schedForget(rec({ status: "review", reps: 12, lapses: 5, leech: true }), true, t);
  check("…and go when the reader asks", f2.reps === 0 && f2.lapses === 0 && f2.leech === undefined);
  const f3 = pure.schedForget(rec({ status: "review", first: "2026-01-02", last: t - DAY }), false, t);
  check("`first` survives, since every per-deck new count is derived from it", f3.first === "2026-01-02");
  const src1 = rec({ status: "review", interval: 40 });
  pure.schedForget(src1, false, t);
  check("the caller's record is not mutated here either", src1.status === "review" && src1.interval === 40);

  /* A forgotten card must go back through the LEARNING STEPS, not straight to a day — that is the whole of
     what "back to new" is worth, and it is a property of the pair rather than of either function. */
  const after = pure.schedAnswer(f, "good", t, "x", pure.SCHED);
  check("a forgotten card walks the learning steps again", pure.schedIsLearning(after.status), after.status);

  // --- parseSetDue
  const ok = (s, lo, hi, si) => { const p = parse(s); return p && p.lo === lo && p.hi === hi && p.setInterval === si; };
  check('parse "7"', ok("7", 7, 7, false));
  check('parse "7!"', ok("7!", 7, 7, true));
  check('parse "0"', ok("0", 0, 0, false));
  check('parse "4-7"', ok("4-7", 4, 7, false));
  check('parse "4-7!"', ok("4-7!", 4, 7, true));
  check('parse "7-4" the other way round', ok("7-4", 4, 7, false));
  check("whitespace is forgiven", ok("  4 - 7 ! ", 4, 7, true));
  ["", "x", "-3", "7!!", "1-2-3", "7d", "1e3", "!7"].forEach((s) =>
    check('refuses "' + s + '"', parse(s) === null, JSON.stringify(parse(s))));
}

/* ---------------------------------------------------------------------------------------------------
   2. the search parser, also pure
--------------------------------------------------------------------------------------------------- */
const parseQuery = (() => {
  // from the cap and the operator table (browseTerm reads both) to the first impure line
  const body = slice("const BROWSE_CAP =", "function browseRowData(", "the browse search");
  return new Function(body + "\nreturn { browseTokens, browsePredicate };")();
})();

{
  console.log("\n--- the browser's search (pure) ---");
  const T = parseQuery.browseTokens;
  check("bare words are terms", T("stone age").length === 2, JSON.stringify(T("stone age")));
  check("a quoted phrase is ONE term", T('"stone age"').length === 1 && T('"stone age"')[0].text === "stone age", JSON.stringify(T('"stone age"')));
  check("a leading - negates", T("-is:new")[0].neg === true);
  check("an operator is split at the colon", T("flag:3")[0].op === "flag" && T("flag:3")[0].text === "3", JSON.stringify(T("flag:3")));
  check("a bare word carries no operator", T("hello")[0].op === "", JSON.stringify(T("hello")));
  check("an empty query is no terms at all", T("   ").length === 0);
  /* AN EMPTY QUERY MUST MATCH EVERYTHING AND A NONSENSE ONE MUST NOT MATCH BY ACCIDENT — the two failure
     modes are opposite and both look like "the search is broken" from one side only. */
  const card = { id: "wh-001", title: "Stone Age", deck: "World History · Prehistory", tags: ["era", "prehistory"], flag: 3, state: "review", due: 0, ivl: 21, reps: 5, lapses: 4, ease: 2.3, suspended: false, buried: false, leech: false, introduced: 3, rated: 2, ratedG: 1 };
  const m = (q) => parseQuery.browsePredicate(T(q))(card);
  check("an empty search matches every card", m("") === true);
  check("free text matches the title", m("stone") === true);
  check("…case-insensitively", m("STONE") === true);
  check("free text matches the deck", m("prehistor") === true);
  check("free text matches a tag", m("era") === true);
  check("a word that is nowhere does not match", m("banana") === false);
  check("every term must match — this one does not", m("stone banana") === false);
  check("flag:3 matches", m("flag:3") === true);
  check("flag:4 does not", m("flag:4") === false);
  check("flag:none does not match a flagged card", m("flag:none") === false);
  check("-flag:none does", m("-flag:none") === true);
  check("is:review matches", m("is:review") === true);
  check("is:new does not", m("is:new") === false);
  check("is:suspended does not", m("is:suspended") === false);
  check("is:flagged does", m("is:flagged") === true);
  check("prop:lapses>3 matches a card with 4", m("prop:lapses>3") === true);
  check("prop:lapses>4 does not", m("prop:lapses>4") === false);
  check("prop:ivl>=21 matches", m("prop:ivl>=21") === true);
  check("prop:reps<5 does not match a card with 5", m("prop:reps<5") === false);
  check("prop:ease<2.5 matches", m("prop:ease<2.5") === true);
  check("an unparseable prop matches nothing rather than everything", m("prop:nonsense") === false);
  check("introduced:7 matches a card first studied 3 days ago", m("introduced:7") === true);
  check("introduced:2 does not", m("introduced:2") === false);
  check("rated:7 matches", m("rated:7") === true);
  check("rated:7:1 matches the button it was rated with", m("rated:7:1") === true);
  check("rated:7:4 does not", m("rated:7:4") === false);
  check("deck: matches part of the path", m("deck:World") === true);
  check("tag:era matches", m("tag:era") === true);
  check("tag:none does not match a tagged card", m("tag:none") === false);
  check("an UNKNOWN operator is treated as free text, not silently dropped", m("wibble:xyz") === false);
}

/* ---------------------------------------------------------------------------------------------------
   3. the browser and the sheets, in a real browser
--------------------------------------------------------------------------------------------------- */
const done = (o) => Object.assign({ reps: 1, lapses: 0, ease: 2.5, interval: 9, due: Date.now() + 9 * DAY, status: "review", last: Date.now() - DAY, first: "2026-01-01" }, o || {});
const SETTINGS = {
  night: false, theme: "folio", fontSize: "medium", newPerDay: 5, bgCollapsed: false, trCollapsed: true,
  srcCollapsed: false, adminMode: true, reviewRandom: false, lang: "en", sfx: false, tts: false,
  ttsMuted: false, ttsNarrator: "us-male", home: { name: "Netherlands", lon: 5.32, lat: 52.1 }, animations: false,
};

(async () => {
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port + "/";
  const browser = await chromium.launch(LAUNCH);
  const errs = [];

  // the leaf decks that actually hold cards, read off the shipped tree rather than hard-coded
  const probe = await browser.newPage();
  await probe.goto(base, { waitUntil: "load" });
  await probe.waitForTimeout(1200);
  const info = await probe.evaluate(() => {
    const out = [];
    (window.COLLECTION_TREE.collections || []).forEach(function walk(n) {
      (n.children || []).forEach(walk);
      if (!(n.children || []).length && (n.cardIds || []).length) out.push({ id: n.id, cards: n.cardIds.slice(0, 12) });
    });
    return out;
  });
  await probe.close();
  if (!info.length) { console.log("FAIL  the tree has no leaf deck with cards"); process.exit(1); }
  const deckA = info[0].id, someCards = info[0].cards;

  const newPage = async (state, vp) => {
    const page = await browser.newPage({ viewport: vp || { width: 1280, height: 950 } });
    page.on("pageerror", (e) => errs.push(e.message));
    page.on("console", (m) => { if (m.type() === "error" && !/favicon|ERR_CONNECTION/.test(m.text())) errs.push(m.text()); });
    await page.addInitScript((st) => { try { localStorage.setItem("folio_v1", JSON.stringify(st)); } catch (e) {} }, state);
    await page.addInitScript(() => {
      ["folio_tour_v1", "folio_library_tour_v1", "folio_book_tour_v1", "folio_atlas_tour_v1"].forEach((k) => {
        try { localStorage.setItem(k, "1"); } catch (e) {}
      });
    });
    return page;
  };
  const seeded = () => ({
    active: [deckA], settings: SETTINGS,
    cards: { [someCards[0]]: done(), [someCards[1]]: done({ lapses: 6, reps: 11 }), [someCards[2]]: done() },
    flags: { [someCards[1]]: 5 },
  });

  /* ================= 3a. flags in a study session ================= */
  {
    console.log("\n--- flags in a session ---");
    const page = await newPage(seeded());
    await page.goto(base + "#home", { waitUntil: "load" });
    await page.waitForTimeout(1200);
    await page.evaluate(() => { const b = document.querySelector(".review-group .banner .cta .btn"); if (b) b.click(); });
    await page.waitForTimeout(1200);
    check("a study session starts", (await page.locator(".study-card").count()) > 0);
    check("the study bar carries a Flag button", (await page.locator("#flagBtn").count()) === 1);
    const before = await page.evaluate(() => (document.querySelector("#flagBtn") || {}).innerText || "");
    // the study bar uppercases its labels in CSS, so innerText comes back "FLAG" — the assertion is about
    // the word, not the casing, and matching the casing would break on a restyle that changed nothing
    check("…reading 'Flag' while the card has none", /^\s*flag\s*$/i.test(before), JSON.stringify(before));

    await page.keyboard.press("Control+3");
    await page.waitForTimeout(500);
    const after = await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem("folio_v1") || "{}"), b = document.querySelector("#flagBtn");
      const own = Object.keys(s.flags || {}).filter((k) => s.flags[k] === 3);
      return { green: own.length, label: (b && b.innerText || "").trim(), on: !!(b && b.classList.contains("on")), col: b ? getComputedStyle(b).color : "" };
    });
    check("Ctrl+3 writes a green flag", after.green === 1, JSON.stringify(after.green));
    check("…and the bar says which colour", /Green/i.test(after.label) && after.on, JSON.stringify(after.label));
    check("…in a colour of its own", /^rgb/.test(after.col) && after.col !== "rgb(0, 0, 0)", after.col);
    /* Pressing the SAME flag again clears it — without that, the only way back to no flag would be a
       different control, and the sheet and the shortcut would disagree about what red twice means. */
    await page.keyboard.press("Control+3");
    await page.waitForTimeout(450);
    check("Ctrl+3 again takes it off", (await page.evaluate(() => Object.values(JSON.parse(localStorage.getItem("folio_v1") || "{}").flags || {}).filter((v) => v === 3).length)) === 0);
    await page.keyboard.press("Control+2");
    await page.waitForTimeout(400);
    await page.keyboard.press("Control+0");
    await page.waitForTimeout(400);
    check("Ctrl+0 clears whatever was there", (await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem("folio_v1") || "{}").flags || {}).length)) === 1, "the seeded card keeps its own");

    /* THE FLAG MUST NOT COST THE REVEAL. Flagging repaints the card, and a repaint through render() would
       rebuild the page from the stored session and take a revealed answer away — which is the one thing a
       reader mid-card would never forgive. */
    await page.evaluate(() => { const b = document.querySelector("#reveal-btn"); if (b) b.click(); });
    await page.waitForTimeout(600);
    const revealed = await page.evaluate(() => !!document.querySelector("#gradebar"));
    await page.keyboard.press("Control+4");
    await page.waitForTimeout(600);
    const still = await page.evaluate(() => ({ bar: !!document.querySelector("#gradebar"), flag: (document.querySelector("#flagBtn") || {}).innerText || "" }));
    check("flagging a REVEALED card leaves it revealed", revealed && still.bar, JSON.stringify(still));
    check("…and still applies the flag", /Blue/i.test(still.flag), JSON.stringify(still.flag));
    await page.close();
  }

  /* ================= 3b. Card info's actions ================= */
  {
    console.log("\n--- Card info: flag, set due, forget, suspend ---");
    const page = await newPage(seeded());
    await page.goto(base + "#home", { waitUntil: "load" });
    await page.waitForTimeout(1200);
    await page.evaluate(() => { const b = document.querySelector(".review-group .banner .cta .btn"); if (b) b.click(); });
    await page.waitForTimeout(1200);
    await page.evaluate(() => document.querySelector("#cardInfo").click());
    await page.waitForTimeout(700);
    const acts = await page.evaluate(() => [...document.querySelectorAll(".ci-acts .btn")].map((b) => b.textContent.trim()));
    check("four actions are offered", acts.length === 4, JSON.stringify(acts));
    check("…Flag, Set due date, Forget and Suspend", /Flag/.test(acts[0]) && acts[1] === "Set due date" && acts[2] === "Forget" && /Suspend/.test(acts[3]), JSON.stringify(acts));

    // Set due date, with the interval moved too
    const studying = await page.evaluate(() => {
      const rec = JSON.parse(sessionStorage.getItem("folio_study_v1") || "{}");
      return rec.id || "";
    });
    await page.evaluate(() => [...document.querySelectorAll(".ci-acts .btn")].find((b) => b.textContent.trim() === "Set due date").click());
    await page.waitForTimeout(700);
    check("the Set due date sheet opens on a box", (await page.locator("#sdDays").count()) === 1);
    await page.fill("#sdDays", "9!");
    await page.evaluate(() => [...document.querySelectorAll(".dm-actions .btn")].find((b) => /Set the date/.test(b.textContent)).click());
    await page.waitForTimeout(800);
    const due = await page.evaluate((id) => {
      const c = (JSON.parse(localStorage.getItem("folio_v1") || "{}").cards || {})[id];
      return c ? { st: c.status, iv: c.interval, days: Math.round((c.due - Date.now()) / 864e5) } : null;
    }, studying);
    check("9! puts the card nine days out", due && due.days === 9, JSON.stringify(due));
    check("…as a review card with an interval of nine", due && due.st === "review" && due.iv === 9, JSON.stringify(due));
    /* THE PANEL MUST COME BACK SHOWING THE CHANGE. A sheet that closes onto the old numbers is a sheet that
       reads as having done nothing, which is what makes the reader press it twice. */
    await page.waitForTimeout(400);
    const backOpen = await page.evaluate(() => {
      const ks = [...document.querySelectorAll(".ci-grid .ci-k")].map((k) => k.textContent.trim());
      const i = ks.indexOf("Interval");
      return { open: !!document.querySelector(".ci-sheet"), iv: i < 0 ? null : document.querySelectorAll(".ci-grid .ci-v")[i].textContent.trim() };
    });
    check("Card info re-opens on the state it has just changed", backOpen.open && /9/.test(backOpen.iv || ""), JSON.stringify(backOpen));

    // Forget. The BEFORE state is read rather than assumed: the card the session dealt is a new one, so
    // Set-due-date has just created its record and its reps are 0 — asserting a literal here would be
    // asserting which card the scheduler happened to deal.
    const pre = await page.evaluate((id) => {
      const s2 = JSON.parse(localStorage.getItem("folio_v1") || "{}");
      return { xp: Object.keys(s2.cards || {}).length, reps: ((s2.cards || {})[id] || {}).reps || 0 };
    }, studying);
    await page.evaluate(() => [...document.querySelectorAll(".ci-acts .btn")].find((b) => b.textContent.trim() === "Forget").click());
    await page.waitForTimeout(700);
    check("the Forget sheet names what it will do", /back to new/i.test(await page.evaluate(() => document.body.innerText)));
    check("…and offers the count reset, off", (await page.evaluate(() => { const s = document.querySelector("#fgReset"); return s && s.getAttribute("aria-checked"); })) === "false");
    await page.evaluate(() => [...document.querySelectorAll(".dm-actions .btn")].find((b) => /^Forget/.test(b.textContent.trim())).click());
    await page.waitForTimeout(800);
    const forgot = await page.evaluate((id) => {
      const s = JSON.parse(localStorage.getItem("folio_v1") || "{}");
      const c = (s.cards || {})[id];
      return { has: !!c, st: c && c.status, iv: c && c.interval, reps: c && c.reps, xp: Object.keys(s.cards || {}).length };
    }, studying);
    /* THE RECORD MUST SURVIVE. Deleting it would put the card back to new just as well and would silently
       take back a level, Folio's XP being the number of distinct cards studied — which is the one failure
       here that no screen would ever report. */
    check("the record is KEPT, not deleted — the XP was earned", forgot.has && forgot.xp === pre.xp, JSON.stringify({ forgot: forgot.xp, pre: pre.xp }));
    check("…and put back to new", forgot.st === "new" && forgot.iv === 0, JSON.stringify(forgot));
    check("…with its review count untouched by default", forgot.reps === pre.reps, JSON.stringify({ after: forgot.reps, before: pre.reps }));
    await page.close();
  }

  /* ================= 3c. the browser ================= */
  {
    console.log("\n--- the card browser ---");
    const page = await newPage(seeded());
    await page.goto(base + "#browse", { waitUntil: "load" });
    await page.waitForTimeout(1500);
    check("#browse is a real route", (await page.locator("#bwTable").count()) === 1);
    const n = await page.evaluate(() => document.querySelectorAll(".bw-row").length);
    check("it lists cards", n > 10, String(n));
    const total = await page.evaluate(() => (document.querySelector("#bwCount") || {}).textContent || "");
    check("…and says how many there are", /\d/.test(total), JSON.stringify(total));
    /* setActiveTab has no tab for this route, like #glossary — it must light the ACCOUNT tab rather than
       leaving the bar with nothing marked, which reads as a page outside the site. */
    check("the Account tab is lit under it", (await page.evaluate(() => { const a = document.querySelector(".tab.active"); return a && a.dataset.route; })) === "account", "");

    // search
    await page.fill("#bwQ", "is:flagged");
    await page.waitForTimeout(500);
    const flagged = await page.evaluate(() => document.querySelectorAll(".bw-row").length);
    check("is:flagged narrows to the flagged card", flagged === 1, String(flagged));
    check("…and its row shows the flag", (await page.locator(".bw-row .flag-dot").count()) === 1);
    await page.fill("#bwQ", "prop:lapses>3");
    await page.waitForTimeout(500);
    check("prop:lapses>3 finds the card that keeps failing", (await page.evaluate(() => document.querySelectorAll(".bw-row").length)) === 1);
    await page.fill("#bwQ", "is:new");
    await page.waitForTimeout(500);
    const news = await page.evaluate(() => document.querySelectorAll(".bw-row").length);
    check("is:new finds the unstudied ones", news > 5, String(news));
    await page.fill("#bwQ", "zzzznothing");
    await page.waitForTimeout(500);
    check("nothing matching says so rather than drawing an empty table", (await page.locator(".bw-none").count()) === 1);
    await page.fill("#bwQ", "");
    await page.waitForTimeout(500);
    check("clearing the box brings them all back", (await page.evaluate(() => document.querySelectorAll(".bw-row").length)) === n);

    // sorting
    const firstBefore = await page.evaluate(() => (document.querySelector(".bw-row .bw-name") || {}).textContent || "");
    await page.evaluate(() => document.querySelector('.bw-th[data-sort="lapses"]').click());
    await page.waitForTimeout(500);
    const firstAfter = await page.evaluate(() => (document.querySelector(".bw-row .bw-name") || {}).textContent || "");
    check("a column head re-sorts the table", firstBefore !== firstAfter, JSON.stringify([firstBefore, firstAfter]));
    await page.evaluate(() => document.querySelector('.bw-th[data-sort="lapses"]').click());
    await page.waitForTimeout(500);
    check("…and clicking it again reverses", (await page.evaluate(() => (document.querySelector(".bw-row .bw-name") || {}).textContent || "")) !== firstAfter);

    // selection and a bulk action
    await page.evaluate(() => { document.querySelector("#bwQ").value = "is:flagged"; document.querySelector("#bwQ").dispatchEvent(new Event("input", { bubbles: true })); });
    await page.waitForTimeout(500);
    await page.evaluate(() => document.querySelector(".bw-row .bw-check").click());
    await page.waitForTimeout(400);
    check("a row can be selected", (await page.locator(".bw-bulk").count()) === 1, "the bulk bar appears");
    // uppercased in CSS, like the study bar's labels — the assertion is about the figure, not the casing
    check("…and the bar says how many", /1 card/i.test(await page.evaluate(() => (document.querySelector(".bw-bulk") || {}).innerText || "")));
    await page.evaluate(() => [...document.querySelectorAll(".bw-bulk .btn")].find((b) => /Set due/.test(b.textContent)).click());
    await page.waitForTimeout(600);
    await page.fill("#sdDays", "3");
    await page.evaluate(() => [...document.querySelectorAll(".dm-actions .btn")].find((b) => /Set the date/.test(b.textContent)).click());
    await page.waitForTimeout(800);
    const bulk = await page.evaluate((id) => {
      const c = (JSON.parse(localStorage.getItem("folio_v1") || "{}").cards || {})[id];
      return c ? Math.round((c.due - Date.now()) / 864e5) : null;
    }, someCards[1]);
    check("a bulk Set due date reaches the selected card", bulk === 3, String(bulk));

    // a row opens Card info
    await page.evaluate(() => document.querySelector(".bw-row .bw-name").click());
    await page.waitForTimeout(700);
    check("clicking a row opens Card info", (await page.locator(".ci-sheet").count()) === 1);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);

    check("no console or page errors on the browser", errs.length === 0, errs.slice(0, 3).join(" | "));
    await page.close();
  }

  /* ================= 3d. the two ways in =================
     BOTH are asserted, because they serve different readers and fail differently. The account page is where
     the rest of a reader's record lives — and it must work SIGNED OUT, which is the case that was missing:
     everything else on that page is behind the sign-in wall because it is about an account, where the
     browser is about the cards on this device, so a guest would have had no route to it at all. The deck
     sheet is the everyday path, one press from any deck a reader is looking at. */
  {
    const page = await newPage(seeded());
    await page.goto(base + "#account", { waitUntil: "load" });
    await page.waitForTimeout(1400);
    check("a SIGNED-OUT account page offers a way into the browser",
      await page.evaluate(() => !!document.querySelector('[data-exgo="browse"]')));
    await page.evaluate(() => document.querySelector('[data-exgo="browse"]').click());
    await page.waitForTimeout(900);
    check("…and it goes there", (await page.evaluate(() => location.hash)) === "#browse" && (await page.locator("#bwTable").count()) === 1);
    await page.close();
  }
  {
    const page = await newPage(seeded());
    await page.goto(base + "#home", { waitUntil: "load" });
    await page.waitForTimeout(1300);
    await page.evaluate(() => {
      const r = document.querySelector(".active-deck[data-review]") || document.querySelector(".review-group .banner");
      r.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true }));
    });
    await page.waitForTimeout(700);
    const row = await page.evaluate(() => !!document.querySelector('.deck-menu [data-act="browse"], [data-act="browse"]'));
    check("a deck's options sheet offers it too", row);
    if (row) {
      await page.evaluate(() => document.querySelector('[data-act="browse"]').click());
      await page.waitForTimeout(900);
      check("…and it goes there as well", (await page.locator("#bwTable").count()) === 1);
    }
    await page.close();
  }

  console.log("\n" + pass + " passed, " + fail + " failed");
  if (errs.length) console.log("page errors: " + errs.slice(0, 5).join(" | "));
  await browser.close();
  server.close();
  process.exit(fail ? 1 : 0);
})();
