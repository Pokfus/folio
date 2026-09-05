/* test-char-network.js — TAPPING A CHARACTER ON A MANDARIN CARD (Sep 2026).

     NODE_PATH=<scratch>/node_modules node .claude/test-char-network.js
     FOLIO_CHROMIUM=<path to chrome>   if Chromium lives outside the playwright package

   WHAT IT GUARDS. A Mandarin card breaks its word into characters and glosses each one; tapping one
   now lists the other words in the same deck built on it. Every way that can break is quiet:
   · The listener is DELEGATED, because a card type's HTML is sanitized and can carry no handler of its
     own — so it depends on `data-ucdeck`, written by cardTypeSideHTML. Drop that attribute and the
     panel simply never opens, which looks exactly like a character that has no other words.
   · Boot mounts a note as a STUB WITH NO FIELDS. Searching what happens to be warm answers "no other
     words" for a deck holding eleven, and the answer is a plausible one — so the panel warms the deck
     first, and the test asserts a count it takes a warmed deck to reach.
   · An empty result is a real answer (爱 really is the only Level 1 word using 爱), so the test asserts
     BOTH: a character with neighbours lists them, and one without says so rather than showing nothing.

   IT BUILDS ITS OWN CARD ELEMENT rather than studying to one. The deck's queue is date-seeded, so
   which card comes up is not the test's to choose, and grading forty cards to reach a particular one
   would be testing the scheduler. What is under test is the listener, the search and the panel — all
   of which act on a `.uc-card[data-ucdeck]` in the document, however it got there. The attribute IS
   asserted on a real study card separately, which is what keeps the shortcut honest. */
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end("not found"); return; }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  });
});

let pass = 0, fail = 0;
const check = (name, ok, extra) => {
  if (ok) { pass++; console.log("ok    " + name + (extra ? "  " + extra : "")); }
  else { fail++; console.log("FAIL  " + name + (extra ? "  " + extra : "")); }
};

/* The expectation comes from the DECK FILE, so it is what actually ships rather than a number typed
   here — a word added to or removed from Level 1 changes what is expected without anyone remembering. */
const DECK = JSON.parse(fs.readFileSync(path.join(ROOT, "decks", "Mandarin-HSK-3.0-Level-1.folio-deck.json"), "utf8"));
const wordsWith = (ch, self) => DECK.cards
  .map((c) => c.fields.Simplified)
  .filter((w) => w !== self && w.indexOf(ch) >= 0);

(async () => {
  const port = 8600 + Math.floor(Math.random() * 300);
  await new Promise((r) => server.listen(port, r));
  const base = "http://127.0.0.1:" + port + "/";
  const browser = await chromium.launch(LAUNCH);
  const page = await browser.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));

  // add and download HSK 3.0 Level 1, which is the smallest deck with a rich character network
  await page.goto(base + "#decks", { waitUntil: "load" });
  await page.waitForTimeout(1800);
  await page.evaluate(() => {
    const el = document.querySelector('#langDecks .node-add[data-id="u:hsk30l1"]');
    if (!el) return;
    const coll = el.closest(".lang-coll"), kids = coll.querySelector(".node-children");
    if (!kids.classList.contains("open")) coll.querySelector(".collection-actions > .chev").click();
    el.click();
  });
  await page.waitForTimeout(1200);
  await page.goto(base + "#home", { waitUntil: "load" });
  await page.waitForTimeout(1200);
  await page.evaluate(() => { const b = document.querySelector("[data-langdl]"); if (b) b.click(); });
  await page.waitForTimeout(10000);

  const openOn = async (word, ch) => {
    await page.evaluate((args) => {
      document.querySelectorAll(".charwin").forEach((n) => n.remove());
      document.querySelectorAll("[data-testcard]").forEach((n) => n.remove());
      const d = document.createElement("div");
      d.className = "uc-card uc-back";
      d.dataset.ucdeck = "hsk30l1";
      d.dataset.testcard = "1";
      d.innerHTML = '<div class="uc-simp">' + args[0] + '</div>' +
        '<div class="uc-ch"><span class="uc-chc">' + args[1] + "</span></div>";
      document.querySelector("#view").appendChild(d);
    }, [word, ch]);
    await page.evaluate(() => document.querySelector("[data-testcard] .uc-chc").click());
    await page.waitForTimeout(3500);
    return page.evaluate(() => {
      const m = document.querySelector(".charwin");
      if (!m) return null;
      return {
        ch: (m.querySelector(".cw-ch") || {}).textContent || "",
        note: (m.querySelector(".cw-n") || {}).textContent || "",
        rows: [...m.querySelectorAll(".cw-row")].map((r) => ({
          w: (r.querySelector(".cw-w") || {}).textContent || "",
          p: (r.querySelector(".cw-p") || {}).textContent || "",
          g: (r.querySelector(".cw-g") || {}).textContent || "",
        })),
        more: (m.querySelector(".cw-more") || {}).textContent || "",
        closes: !!m.querySelector(".cw-x"),
      };
    });
  };

  console.log("\n1) a character the deck builds many words on\n");
  const want = wordsWith("学", "学习");   // 学, from a card for 学习
  const got = await openOn("学习", "学");
  check("the panel opens on the character tapped", !!got && got.ch === "学", got && got.ch);
  /* THE COUNT IS THE WHOLE ASSERTION FOR THE WARMING. Level 1 holds eleven other words using 学, and
     none of them is in memory until the deck is read back out of IndexedDB — a panel that searched
     only warmed notes would answer with a handful and look perfectly correct. */
  check("…and lists every other Level 1 word built on it",
    !!got && got.rows.length === want.length, (got && got.rows.length) + " vs " + want.length);
  check("…the right ones", !!got && got.rows.map((r) => r.w).sort().join(" ") === want.slice().sort().join(" "),
    got && got.rows.map((r) => r.w).join(" "));
  // shortest first: the two-character words a learner actually meets the character in
  check("…shortest first", !!got && got.rows.every((r, i, a) => !i || a[i - 1].w.length <= r.w.length),
    got && got.rows.map((r) => r.w).join(" "));
  check("…each with its reading and its gloss",
    !!got && got.rows.every((r) => r.p && r.g), JSON.stringify(got && got.rows[0]));
  /* The `not <other word>` disambiguator belongs to the reverse card and reads as part of the gloss in
     a list of words — "to go to school not 就读". */
  check("…and no reverse-card disambiguator leaking into the gloss",
    !!got && got.rows.every((r) => r.g.indexOf("not ") !== 0 && r.g.indexOf("就读") < 0),
    got && (got.rows.find((r) => /not /.test(r.g)) || {}).g);
  check("…and it can be closed", !!got && got.closes);

  console.log("\n2) a character no other word in the deck uses\n");
  const none = await openOn("爱", "爱");   // 爱 is the only Level 1 word using 爱
  check("Level 1 really does hold only one 爱 word", wordsWith("爱", "爱").length === 0);
  /* AN EMPTY ANSWER IS AN ANSWER. Showing an empty panel would be indistinguishable from a panel that
     failed to search, which is the whole failure family this suite exists for. */
  check("the panel says so rather than showing an empty list",
    !!none && none.rows.length === 0 && /No other word/i.test(none.more), none && none.more);

  console.log("\n3) the attribute the whole feature hangs on\n");
  /* Section 1 builds its own card, so this is what keeps that shortcut honest: a REAL study card must
     carry `data-ucdeck`, or the delegated listener never fires and the panel looks like a character
     with no neighbours. */
  await page.goto(base + "#home", { waitUntil: "load" });
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    const r = [...document.querySelectorAll(".active-deck[data-review]")]
      .find((e) => e.dataset.review.indexOf("u:hsk30l1") === 0);
    if (r) r.click();
  });
  await page.waitForTimeout(2500);
  // `#reveal` is the study page's own button — the front of a Mandarin card carries the word alone, so
  // the character block only exists once the answer is showing
  /* `#reveal` is the study page's reveal CONTAINER, not the button — the button lives in `#actions` and
     is found by its own words, which the walkthrough already insists the page really says. */
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("#actions button, .actions button")]
      .find((x) => /reveal answer/i.test(x.textContent || ""));
    if (b) b.click();
  });
  await page.waitForTimeout(1600);
  const real = await page.evaluate(() => {
    const all = [...document.querySelectorAll(".uc-card[data-ucdeck]")];
    const back = all.find((e) => e.classList.contains("uc-back")) || all[0];
    return back ? {
      deck: back.dataset.ucdeck, chars: back.querySelectorAll(".uc-chc").length,
      cards: all.length, cls: back.className, reveal: !!document.querySelector("#reveal"),
    } : { none: true, reveal: !!document.querySelector("#reveal"), hash: location.hash };
  });
  check("a real study card names its deck on the wrapper", !!real && real.deck === "hsk30l1",
    JSON.stringify(real));
  check("…and its characters are there to be tapped", !!real && real.chars > 0, JSON.stringify(real));

  check("no uncaught page errors", errs.length === 0, errs.join(" | "));

  console.log("");
  console.log(pass + " passed, " + fail + " failed");
  await browser.close();
  server.close();
  process.exit(fail ? 1 : 0);
})();
