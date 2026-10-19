/* test-quotes-verbatim.js — A QUOTATION IS `.verbatim` ONLY WHERE THE TEXT SHOWN IS THE SPEAKER'S OWN ENGLISH (2026-10-19; narrowed the same day).

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-quotes-verbatim.js

   THE RULE. The spelling pass (British / American) and the units pass are text-node passes over everything rendered; they are for prose Folio authored. `.verbatim` exempts a text from BOTH. It is right for a
   quotation in the speaker's own English (King's "color of their skin", Du Bois's "color line") and for a published translator's English (Legge's Confucius in a card's quote block, a Library book): that text is not Folio's.
   It is WRONG for a quotation that is FOLIO'S OWN translation from another language: that is Folio's prose, written in British spelling and metric-first, and an American reader's settings convert it as before.
   The data says which: a Home daily quote with an `o` block (the original-language form behind the flip) is Folio's translation and is NOT `.verbatim`; one with no `o` (Bacon, Vivekananda — they wrote English) is.

   EVERY PLACE A QUOTATION IS SHOWN (`app.js`), and what each does:
     1  the Home daily quote — `dailyQuoteHTML`: the blockquote is `.verbatim` only when the quote has no `o` (the `.dq-orig` original is `.notranslate` either way)       decided per quotation
     2  a card's quote block — `cardQuoteHTML`: a passage of a Library book, a published translator's English (Legge, Haines, Murray…)                                          always `.verbatim`
     3  Who said it? — the round's `blockquote.ws-quote`                                                                                                                       always `.verbatim`
     4  Who said it? — the results screen's `.tf-sum-q`                                                                                                                        always `.verbatim`
     5  the admin's Who said it? list — `.q-text` of each entry of quotes.js                                                                                                  always `.verbatim`
     6  the admin's daily-quote list — `.q-text` of each quote of the pool                                                                                                     `.verbatim` only without `o`
     7  the Library's pages — `.bk-page`                                                                                                                                       skipped by `spellSkip` already
   Who said it?'s pool (quotes.js) has no original-language form at all: an entry is the speaker's English or a published translator's (its `src` names the translator), so all of them stay `.verbatim`.
   NOT quotations, not marked: True or False's statements and results (claims Folio wrote), Find it, What year, the crossword's clues, a card's own abstract.
   THE UNITS PASS honours `.verbatim` (`unitSkip`), like the spelling pass (`spellSkip`).

   WHAT IT PROVES (the daily quote on a FIXED CLOCK, the pool reduced to the quotations under test through the overlay `ADMIN_EDITS.quotes`):
     A  (static) the templates above
     B  a BRITISH reader (en-GB, metric): King's and Du Bois's "color" is printed as stored (no `o`, `.verbatim`) over two consecutive days
     C  the four-way table on one synthetic line ("The color of 10 km (6 miles) and a labour of honor."): with an `o` it is converted for BOTH readers (British: "colour", bracket dropped; American: "labor", "6 miles");
        without an `o` it reaches both exactly as stored
     D  an AMERICAN reader sees the shipped Confucius ("Learning without thought is labour lost…", `o` present) as "labor lost", and the shipped Bacon (no `o`) is `.verbatim`
     E  a card's quote block (wh-399, Legge's Confucius, its text rewritten in flight to carry "color" and "10 km (6 miles)") is `.verbatim` and unconverted for both readers — and the card's own prose beside it is still converted
     F  the passes themselves are live in the same page (a control: a `<div>` of "color" is converted, the same text inside `.verbatim` is not)
   Re-run after touching `spellSkip`, `unitSkip`, `dailyQuoteHTML`, `cardQuoteHTML` or any quotation's markup. */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream" };
const PORT = 5676;
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  — " + extra : "")); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [];
const APP = fs.readFileSync(path.join(ROOT, "app.js")).toString("utf8");

/* the quotations: King's and Du Bois's, as stored in quotes.js */
const QG = (() => { const w = {}; new Function("window", fs.readFileSync(path.join(ROOT, "quotes.js"), "utf8"))(w); return w.QUOTEGAME; })();
const KING = QG.find((x) => /judged by the color of their skin/.test(x.q)), DUBOIS = QG.find((x) => /problem of the color line/.test(x.q));
/* the daily pool's shipped keys (the English text of each quote), read out of app.js */
const SHIPPED = (() => { const i = APP.indexOf("const SHIPPED_QUOTES = ["), j = APP.indexOf("\n  ];", i); return new Function("return " + APP.slice(APP.indexOf("[", i), j + 4))(); })();

(async () => {
  console.log("\n\x1b[1mA) the audit, as the source has it\x1b[0m\n");
  const has = (a, b) => { const i = APP.indexOf(a); return i >= 0 && APP.slice(i, i + (b || 400)).includes("verbatim"); };
  check("the Home daily quote's blockquote is `.verbatim` only where the quote has no `o` (Folio's translations are converted)", has("function dailyQuoteHTML", 1900) && /<blockquote' \+ \(o \? "" : ' class="verbatim"'\) \+ ">" \+ pair\(q\.t/.test(APP));
  check("a card's quote block's blockquote is `.verbatim`", /<blockquote class="verbatim">' \+ q\.text/.test(APP));
  check("Who said it?'s round and its results are `.verbatim` (as since October)", /<blockquote class="ws-quote verbatim">/.test(APP) && /<p class="tf-sum-q verbatim">/.test(APP));
  check("the admin's Who said it? list is `.verbatim`; its daily-quote list only for a quote with no `o`", (APP.match(/<span class="q-text verbatim">/g) || []).length === 1 && /<span class="q-text' \+ \(q\.o \? "" : " verbatim"\) \+ '">/.test(APP));
  check("the units pass skips `.verbatim` (unitSkip) and so does the spelling pass (spellSkip)", /function unitSkip[\s\S]{0,400}\.notranslate, \.verbatim/.test(APP) && /spellSkip[\s\S]{0,2600}closest\("\.verbatim"\)/.test(APP));
  check("the two quotations are in quotes.js and the daily pool has none with 'color'", !!KING && !!DUBOIS && !SHIPPED.some((q) => /\bcolou?r/i.test(q.t)), `${SHIPPED.length} shipped daily quotes`);

  const browser = await chromium.launch(LAUNCH);
  await new Promise((r) => server.listen(PORT, r));
  const newPage = async (setup) => {
    const ctx = await browser.newContext({ viewport: { width: 1000, height: 900 } });
    await ctx.addInitScript(setup);
    const page = await ctx.newPage();
    page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
    page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
    return { ctx, page };
  };
  const control = (page) => page.evaluate(async () => {
    const mk = (cls) => { const d = document.createElement("div"); if (cls) d.className = cls; d.textContent = "The color of 10 km (6 miles) and a labour of honor."; document.body.appendChild(d); return d; };
    const a = mk(""), b = mk("verbatim"); await new Promise((r) => setTimeout(r, 400));
    const o = { plain: a.textContent, verbatim: b.textContent }; a.remove(); b.remove(); return o;
  });

  /* ---- B: Home, a British reader, the daily pool is King's and Du Bois's ---- */
  console.log("\n\x1b[1mB) Home: the daily quote, British reader, fixed clock\x1b[0m\n");
  {
    const overlay = { quotes: {} };
    for (const q of SHIPPED) overlay.quotes[q.t] = null;
    overlay.quotes[KING.q] = { t: KING.q, a: KING.who, s: "I Have a Dream, 28 August 1963" };
    overlay.quotes[DUBOIS.q] = { t: DUBOIS.q, a: DUBOIS.who, s: "The Souls of Black Folk, 1903" };
    const seen = [];
    for (const day of ["2026-03-10T12:00:00Z", "2026-03-11T12:00:00Z"]) {
      const { ctx, page } = await newPage(`localStorage.setItem("folio_tour_v1","1"); localStorage.setItem("folio_admin_v1", ${JSON.stringify(JSON.stringify(overlay))});`);
      await page.clock.setFixedTime(new Date(day));
      await page.goto(`http://127.0.0.1:${PORT}/#home`, { waitUntil: "load" }); await page.reload({ waitUntil: "load" });
      await page.waitForSelector(".daily-quote .dq-live", { timeout: 60000 }); await sleep(1200);
      const t = await page.evaluate(() => ({ live: document.querySelector(".daily-quote .dq-live").textContent, who: (document.querySelector(".daily-quote figcaption") || {}).textContent || "", verbatim: !!document.querySelector(".daily-quote blockquote.verbatim") }));
      seen.push(t.live);
      check(`${day.slice(0, 10)}: the daily quote is one of the two and is printed as stored (no "colour")`, [KING.q, DUBOIS.q].includes(t.live) && !/colour/.test(t.live) && t.verbatim, t.live.slice(0, 90) + " … " + t.who.slice(0, 40));
      if (day.startsWith("2026-03-10")) { const c = await control(page); check("F) the units pass is live in this page (control, added after render: a British reader's spelling observer is not installed): plain text loses its imperial bracket, `.verbatim` keeps it", c.plain === "The color of 10 km and a labour of honor." && c.verbatim === "The color of 10 km (6 miles) and a labour of honor.", JSON.stringify(c)); }
      await ctx.close();
    }
    check("over the two days King's and Du Bois's quotations were both the daily quote", seen.includes(KING.q) && seen.includes(DUBOIS.q), seen.map((s) => s.slice(0, 30)).join(" | "));
  }

  /* ---- C: the four-way table, one synthetic line, fixed clock ---- */
  console.log("\n\x1b[1mC) Home: Folio's translation (has `o`) against a speaker's own English (no `o`), British and American\x1b[0m\n");
  {
    const LINE = "The color of 10 km (6 miles) and a labour of honor.";
    const READERS = [
      ["British, metric", { spelling: "en-GB", units: "metric", newPerDay: 5 }],
      ["American, imperial", { spelling: "en-US", units: "imperial", newPerDay: 5 }],
    ];
    const KINDS = [
      ["Folio's translation (has `o`)", { t: LINE, a: "Test Speaker", s: "Test work", o: { lang: "la", t: "Lorem ipsum.", a: "Test", s: "Test" } }, false],
      ["the speaker's own English (no `o`)", { t: LINE, a: "Test Speaker", s: "Test work" }, true],
    ];
    const EXPECT = {   // [reader][kind]
      "British, metric": ["The colour of 10 km and a labour of honour.", LINE],
      "American, imperial": ["The color of 6 miles and a labor of honor.", LINE],
    };
    for (const [who, settings] of READERS) {
      for (let k = 0; k < KINDS.length; k++) {
        const [kind, quote, verbatim] = KINDS[k];
        const overlay = { quotes: {} };
        for (const q of SHIPPED) overlay.quotes[q.t] = null;
        overlay.quotes[LINE] = quote;
        const { ctx, page } = await newPage(`localStorage.setItem("folio_tour_v1","1"); localStorage.setItem("folio_admin_v1", ${JSON.stringify(JSON.stringify(overlay))}); localStorage.setItem("folio_v1", JSON.stringify({ cards: {}, settings: ${JSON.stringify(settings)} }));`);
        await page.clock.setFixedTime(new Date("2026-03-10T12:00:00Z"));
        await page.goto(`http://127.0.0.1:${PORT}/#home`, { waitUntil: "load" }); await page.reload({ waitUntil: "load" });
        await page.waitForSelector(".daily-quote .dq-live", { timeout: 60000 }); await sleep(1200);
        const t = await page.evaluate(() => ({ live: document.querySelector(".daily-quote .dq-live").textContent, verbatim: !!document.querySelector(".daily-quote blockquote.verbatim") }));
        check(`${who} reader, ${kind}: the blockquote is ${verbatim ? "" : "NOT "}\`.verbatim\``, t.verbatim === verbatim, `verbatim=${t.verbatim}`);
        check(`${who} reader, ${kind}: the daily quote reads ${JSON.stringify(EXPECT[who][k])}`, t.live === EXPECT[who][k], JSON.stringify(t.live));
        if (k === 0) { const c = await control(page); check(`${who}: the passes are live in this page (control)`, c.verbatim === "The color of 10 km (6 miles) and a labour of honor." && c.plain !== c.verbatim, JSON.stringify(c)); }
        await ctx.close();
      }
    }
  }

  /* ---- D: the shipped pool, an American reader: Confucius has an `o`, Bacon has none ---- */
  console.log("\n\x1b[1mD) Home: the shipped Confucius (translation) and Bacon (English), American reader, fixed clock\x1b[0m\n");
  for (const [name, keep, expectText, verbatim] of [
    ["Confucius (has `o`)", SHIPPED.find((q) => /labour lost/.test(q.t)), "Learning without thought is labor lost; thought without learning is perilous.", false],
    ["Bacon (no `o`)", SHIPPED.find((q) => q.a === "Francis Bacon"), "Histories make men wise.", true],
  ]) {
    const overlay = { quotes: {} };
    for (const q of SHIPPED) if (q !== keep) overlay.quotes[q.t] = null;
    const { ctx, page } = await newPage(`localStorage.setItem("folio_tour_v1","1"); localStorage.setItem("folio_admin_v1", ${JSON.stringify(JSON.stringify(overlay))}); localStorage.setItem("folio_v1", JSON.stringify({ cards: {}, settings: { spelling: "en-US", units: "imperial", newPerDay: 5 } }));`);
    await page.clock.setFixedTime(new Date("2026-03-10T12:00:00Z"));
    await page.goto(`http://127.0.0.1:${PORT}/#home`, { waitUntil: "load" }); await page.reload({ waitUntil: "load" });
    await page.waitForSelector(".daily-quote .dq-live", { timeout: 60000 }); await sleep(1200);
    const t = await page.evaluate(() => ({ live: document.querySelector(".daily-quote .dq-live").textContent, verbatim: !!document.querySelector(".daily-quote blockquote.verbatim"), flip: !!document.querySelector(".daily-quote.dq-flip") }));
    check(`${name}: an American reader sees ${JSON.stringify(expectText)}`, t.live === expectText, t.live.slice(0, 80));
    check(`${name}: the blockquote is ${verbatim ? "" : "NOT "}\`.verbatim\` (and ${verbatim ? "has no" : "has an"} original-language flip)`, t.verbatim === verbatim && t.flip === !verbatim, JSON.stringify(t));
    await ctx.close();
  }

  /* ---- E: a card's quote block, a British reader and an American one ---- */
  for (const [who, settings, expect] of [
    ["British, metric", { spelling: "en-GB", units: "metric", newPerDay: 5 }, { word: "color", quote: "color lost, ten stages, 10 km (6 miles) apart; thought without learning is perilous" }],
    ["American, imperial", { spelling: "en-US", units: "imperial", newPerDay: 5 }, { word: "labour", quote: "labour lost, ten stages, 10 km (6 miles) apart; thought without learning is perilous" }],
  ]) {
    console.log(`\n\x1b[1mE) a card's quote block: the ${who} reader (wh-399, Legge's Confucius)\x1b[0m\n`);
    const { ctx, page } = await newPage(`localStorage.setItem("folio_tour_v1","1"); localStorage.setItem("folio_v1", JSON.stringify({ active: ["cotd:added"], cotd: ["wh-399"], cards: {}, settings: ${JSON.stringify(settings)} }));`);
    await page.route("**/data-extra/wh.js", async (route) => {
      const r = await route.fetch(); let body = await r.text();
      body = body.replace("Learning without thought is labour lost; thought without", "Learning without thought is " + expect.quote.replace("; thought without learning is perilous", "; thought without"));
      await route.fulfill({ response: r, body });
    });
    await page.goto(`http://127.0.0.1:${PORT}/#home`, { waitUntil: "load" }); await page.reload({ waitUntil: "load" });
    await sleep(1500);
    await page.evaluate(() => { const r = document.querySelector('[data-review="cotd:added"]'); if (r) r.click(); });
    await sleep(1500);
    await page.evaluate(() => { const r = document.querySelector("#reveal-btn"); if (r) r.click(); });
    await page.waitForSelector(".card-quote blockquote", { timeout: 30000 }).catch(() => {});
    await sleep(900);
    const q = await page.evaluate(() => { const b = document.querySelector(".card-quote blockquote"); return b ? { text: b.textContent, verbatim: b.classList.contains("verbatim") } : null; });
    check(`${who}: the card's quote block is there and is \`.verbatim\``, !!q && q.verbatim, q ? q.text.slice(0, 120) : "no quote block");
    if (q) {
      check(`${who}: the quotation reads as stored ("color", "(6 miles)" kept, whatever the reader's spelling and units)`, q.text.includes(expect.quote), q.text.trim().slice(0, 160));
      check(`${who}: not one converted word in it (no "colour", no "labor", no swapped bracket)`, !/colour|\blabor\b|6 miles \(10 km\)/.test(q.text));
    }
    const c = await control(page);
    check(`${who}: the passes are live in the page (control)`, who.startsWith("British") ? c.plain === "The color of 10 km and a labour of honor." : c.plain === "The color of 6 miles and a labor of honor.", JSON.stringify(c));
    await ctx.close();
  }

  check("no console or page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  await browser.close(); server.close();
  console.log(`\n${pass} ok, ${fail} failed\n`); process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
