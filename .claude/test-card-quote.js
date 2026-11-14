#!/usr/bin/env node
/* A CARD QUOTES THE BOOK IT CITES (Aug 2026, on request) — and every part of this fails SILENTLY.

   The feature joins two halves of the site that had never been joined: a card's citations and the
   Library's own shelf. What is asserted here is the JOIN and the placement, because both are invisible
   when they break:

   · **THE PLACEMENT.** The request is "between sentences 5 and 6", and the abstract is two blocks of five
     split by ` <br><br> ` — so the quotation is a SIBLING BETWEEN the two `.abstract` paragraphs, not
     appended after them. A build that lost the split renders a perfectly good card with the passage at
     the bottom, which reads as a design rather than as a fault.
   · **`clear:both`.** The illustration is floated right out of the first paragraph. A quotation that
     wrapped around it would be set in a column half the card wide and would still look deliberate.
   · **THE ATTRIBUTION.** A quotation whose source is a button the reader has not pressed is an
     unattributed quotation, so the book's title and its translator have to be ON the card.
   · **THE ADDRESS.** `#book/<id>/<n>` is new; `#book/<id>` is not, and every link ever shared points at
     the second. Both are asserted, in both directions.
   · **AND THE PARAGRAPH (2026-11-14, on request).** A reader arriving from a quotation has asked for that
     passage, not for wherever they were in this book last week, nor for the top of a 140,000-character
     book — so the button lands on the PARAGRAPH the quotation stands in (`bookParaFind`), marked, and
     writes it into the address as `#book/<id>/<n>/<p>`. The attribution is two lines with a book button
     BESIDE them (the third line, "Read it in the Library", is now the button's name and tooltip).
   · **AND THE WAY BACK.** The reader then shows "Back to card" (`bookHold`), which returns to the same
     study session on the same card, answer showing; a book opened any other way shows no such button.

   The card it drives is `gr-254` (Spartan austerity), which quotes Thucydides 1.10 out of the Library's
   own Crawley translation — the same edition its citation names. It is reached through the
   Card-of-the-day pseudo-entry, which is the one way to study exactly one named card: `S.cotd` holds the
   id and `S.active` has to hold `cotd:added` for the row to be drawn at all.

       node .claude/test-card-quote.js

   Re-run after touching `cardQuote` / `cardQuoteHTML` / `buildBack`'s abstract split / the `.cq-go`
   delegated listener / `PAGES.book`'s `params.n` / the `#book` branches in boot and hashchange /
   `serializeCardData` / `revertCard`, or `add-card.js`'s quote guard. Not part of the site. */
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");
// The repo's own index.html, resolved from THIS file rather than written out: a hardcoded
// absolute path is right on exactly one machine, and in CI it loaded nothing at all, which
// fails as a crash before the first assertion rather than as a wrong answer.
const base = require("url").pathToFileURL(require("path").join(__dirname, "..", "index.html")).href;
let pass = 0, fail = 0;
const check = (n, ok, x) => { if (ok) { pass++; console.log("ok    " + n + (x ? "  " + x : "")); } else { fail++; console.log("FAIL  " + n + "  " + (x || "")); } };
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.FOLIO_CHROMIUM });
  const errs = [];
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  page.on("pageerror", (e) => errs.push(e.message));
  page.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !isNoise(t)) errs.push(t); });
  await page.addInitScript(() => {
    localStorage.setItem("folio_v1", JSON.stringify({
      active: ["cotd:added"],
      cotd: ["gr-254"],
      cards: { "gr-001": { due: Date.now() + 9e8, ivl: 9, ease: 2.5, status: "review", reps: 2, first: "2026-08-01" } },
      settings: { newPerDay: 5 },
    }));
  });
  await page.goto(base + "#home", { waitUntil: "load" });
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(1600);

  const row = await page.evaluate(() => {
    const r = document.querySelector('[data-review="cotd:added"]');
    if (!r) return false;
    r.click();
    return true;
  });
  check("the Card-of-the-day row studies just that card", row);
  await page.waitForTimeout(1200);
  await page.evaluate(() => { const r = document.querySelector("#reveal-btn"); if (r) r.click(); });
  await page.waitForTimeout(700);

  const q = await page.evaluate(() => {
    const fig = document.querySelector(".card-quote");
    if (!fig) return { there: false, answer: (document.querySelector(".answer .val") || {}).textContent || "" };
    const paras = [...document.querySelectorAll(".bg-collapse-inner .abstract")];
    const kids = [...fig.parentElement.children].map((e) => e.className || e.tagName);
    return {
      there: true,
      answer: (document.querySelector(".answer .val") || {}).textContent || "",
      quote: (fig.querySelector("blockquote") || {}).textContent || "",
      cite: (fig.querySelector("cite") || {}).textContent || "",
      who: (fig.querySelector(".cq-who") || {}).textContent || "",
      when: (fig.querySelector(".cq-when") || {}).textContent || "",
      where: (fig.querySelector(".cq-where") || {}).textContent || "",
      btn: ((fig.querySelector(".cq-go") || { getAttribute: () => "" }).getAttribute("aria-label")) || "",
      btnText: ((fig.querySelector(".cq-go") || {}).textContent || "").trim(),
      btnIcon: !!fig.querySelector(".cq-go svg"),
      captionText: (fig.querySelector("figcaption") || {}).textContent || "",
      beside: (() => {
        const a = fig.querySelector(".cq-attr"), g = fig.querySelector(".cq-go");
        if (!a || !g) return null;
        const ra = a.getBoundingClientRect(), rg = g.getBoundingClientRect();
        return { right: rg.left >= ra.right - 0.5, centred: Math.abs((ra.top + ra.bottom) / 2 - (rg.top + rg.bottom) / 2) <= 3 };
      })(),
      paras: paras.length,
      // between the two blocks: the figure's previous and next siblings are the two abstract paragraphs
      between: !!(fig.previousElementSibling && fig.previousElementSibling.classList.contains("abstract") &&
                  fig.nextElementSibling && fig.nextElementSibling.classList.contains("abstract")),
      order: kids.join(" | ").slice(0, 120),
      clears: getComputedStyle(fig).clear,
    };
  });
  check("the card shows the passage it cites", q.there, JSON.stringify({ answer: q.answer }));
  if (q.there) {
    check("...quoted from the Library's own edition", /Lacedaemon were to become desolate/.test(q.quote), q.quote.slice(0, 60));
    check("...attributed to the book and its author, not its translator", /Peloponnesian War/i.test(q.cite) && /Thucydides/i.test(q.who) && !/Crawley/i.test(q.who), JSON.stringify({ cite: q.cite, who: q.who }));
    check("...and dated by when the book was written", /BCE/.test(q.when) && /\d/.test(q.when), q.when);
    check("...and to the passage", /1\.10/.test(q.where), q.where);
    check("...sitting BETWEEN the two blocks of the background", q.between && q.paras === 2, JSON.stringify({ between: q.between, paras: q.paras, order: q.order }));
    check("...clear of the floated illustration", q.clears === "both", q.clears);
    check("...with a way through to it: a book button named for the Library", /Read it in the Library/i.test(q.btn) && q.btnIcon && q.btnText === "", JSON.stringify({ label: q.btn, icon: q.btnIcon, text: q.btnText }));
    check("...and no third line of words", !/Read it in the Library/i.test(q.captionText), q.captionText);
    check("...standing to the right of the two lines, centred on them", !!q.beside && q.beside.right && q.beside.centred, JSON.stringify(q.beside));
  }

  // the button opens the book AT the paragraph the quotation stands in
  const went = await page.evaluate(async () => {
    const b = document.querySelector(".cq-go");
    if (!b) return null;
    b.click();
    let t = null;
    for (let i = 0; i < 60 && !t; i++) { await new Promise((r) => setTimeout(r, 100)); t = document.querySelector(".bk-target"); }
    const r = t ? t.getBoundingClientRect() : null;
    return {
      hash: location.hash,
      head: (document.querySelector(".bk-head h1") || {}).textContent || "",
      marked: t ? t.textContent.slice(0, 2000) : "",
      inView: !!r && r.top >= 0 && r.top < innerHeight - 40,
      scrolled: Math.round(window.scrollY),
      back: !!document.querySelector("#bkToCard"),
    };
  });
  check("pressing it opens the book at that section and paragraph", !!went && /^#book\/thucydides-peloponnesian-war\/1\/\d+$/.test(went.hash), JSON.stringify(went && { hash: went.hash, scrolled: went.scrolled }));
  check("...the paragraph holding the quotation, marked and in view", !!went && /Lacedaemon were to become desolate/.test(went.marked) && went.inView && went.scrolled > 200, JSON.stringify(went && { marked: went.marked.slice(0, 80), inView: went.inView, scrolled: went.scrolled }));
  check("...with a Back to card button", !!went && went.back);

  // Back returns to the same card in the same session, its answer showing
  const back = await page.evaluate(async () => {
    const b = document.querySelector("#bkToCard");
    if (!b) return null;
    b.click();
    await new Promise((r) => setTimeout(r, 1200));
    return { hash: location.hash, answer: (document.querySelector(".answer .val") || {}).textContent || "", quote: !!document.querySelector(".card-quote") };
  });
  check("Back to card returns to the study session on the same card, answer showing", !!back && back.hash === "#study" && back.answer === q.answer && back.quote, JSON.stringify(back));

  // a book opened from the Library has no Back to card button
  await page.evaluate(() => { location.hash = "book/thucydides-peloponnesian-war/2"; });
  await page.waitForTimeout(1800);
  check("a book opened any other way shows no Back to card", await page.evaluate(() => !!document.querySelector(".bk-page") && !document.querySelector("#bkToCard")));

  // a pasted address with a section resolves
  await page.evaluate(() => { location.hash = "book/thucydides-peloponnesian-war/3"; });
  await page.waitForTimeout(1800);
  const three = await page.evaluate(() => ({ hash: location.hash, body: (document.querySelector(".bk-page") || {}).textContent || "" }));
  check("a shared #book/<id>/<n> address resolves", /\/3$/.test(three.hash) && three.body.length > 200, JSON.stringify({ hash: three.hash, len: three.body.length }));

  // …and a plain #book/<id> still resumes as it always did
  await page.evaluate(() => { location.hash = "book/thucydides-peloponnesian-war"; });
  await page.waitForTimeout(1500);
  const plain = await page.evaluate(() => location.hash);
  check("a plain #book/<id> address is untouched", plain === "#book/thucydides-peloponnesian-war", plain);

  check("no console or page errors", errs.length === 0, errs.join(" | ").slice(0, 300));
  await browser.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
