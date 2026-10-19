/* test-quotes-verbatim.js — A QUOTATION REACHES THE READER EXACTLY AS STORED (2026-10-19).

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-quotes-verbatim.js

   THE FAULT. The spelling pass (British / American) and the units pass are text-node passes over everything rendered; they are for prose Folio authored. Who said it?'s quotations were marked `.verbatim` in
   October (the spelling pass skips it) after King's "color of their skin" and Du Bois's "color line" were printed in a British reader's "colour". But every OTHER place a quotation is shown was not marked, and the
   units pass did not know `.verbatim` at all. A quotation is the speaker's words — or a published translator's, transcribed rather than edited — and must be printed as stored.

   EVERY PLACE A QUOTATION IS SHOWN (the audit of 2026-10-19; `app.js`), and what each does now:
     1  the Home daily quote — `dailyQuoteHTML`, `<blockquote>` holding `.dq-live` (and the `.dq-orig` original, already `.notranslate`)           was UNMARKED  → `.verbatim`
     2  a card's quote block — `cardQuoteHTML`, `figure.card-quote blockquote`, a passage of a Library translation (Legge, Haines…)                  was UNMARKED  → `.verbatim`
     3  Who said it? — the round's `blockquote.ws-quote`                                                                                              was marked (October) — kept
     4  Who said it? — the results screen's `.tf-sum-q`                                                                                              was marked (October) — kept
     5  the admin's Who said it? list — `.q-text` of each entry of quotes.js                                                                         was UNMARKED  → `.verbatim`
     6  the admin's daily-quote list — `.q-text` of each quote of the pool                                                                           was UNMARKED  → `.verbatim`
     7  the Library's pages — `.bk-page`                                                                                                              already skipped by the spelling pass (`spellSkip`) and, a book being a translation, by nothing else needed
   NOT quotations, so not marked: True or False's statements and results (claims Folio wrote), Find it, What year, the crossword's clues, a card's own abstract, and the quotation marks inside Folio's prose.
   AND THE UNITS PASS now honours `.verbatim` (`unitSkip`): it skipped only `.notranslate`, so "10 km (6 miles)" inside a quotation lost its brackets for a metric reader.

   WHAT THE PASSES DO (read off `render`, `applySpelling`, `unitizeTree`): the content is authored in BRITISH spelling and metric-first. `render()` runs both passes over the page for EVERY reader: a British reader's pass turns an American
   spelling into the British one ("color" → "colour"; the standing observer for later DOM is installed only for an American reader), an American reader's the other way ("labour" → "labor"); the units pass drops an imperial bracket for a metric
   reader ("10 km (6 miles)" → "10 km") and swaps it for an imperial one. So a quotation by an American speaker was printed in a British reader's spelling, and a translator's British one in an American reader's — and its brackets rewritten.
   ONE CONSEQUENCE TO KNOW: the daily pool's quotations are mostly FOLIO'S OWN TRANSLATIONS (Confucius, Laozi, Ashoka…) authored in British spelling; marked `.verbatim` they no longer follow an American reader's spelling ("labour lost").

   WHAT IT PROVES, for a BRITISH reader (the default, en-GB) with metric units:
     A  (static) each of the displays above carries `verbatim` in its template, and `unitizeTree` / `spellSkip` both skip it
     B  Home, on a fixed clock, with the daily pool reduced to King's and Du Bois's quotations (the overlay `ADMIN_EDITS.quotes`, their texts read from quotes.js): over two consecutive days the daily quote reads "color of their skin"
        and "color line" — not "colour" — and each is the day's `.dq-live`
     C  a card's quote block (wh-399, Legge's Confucius, its text rewritten in flight to carry "color" and "10 km (6 miles)"): the block reads "color" and keeps "(6 miles)" — and the card's own prose beside it is still converted
     D  the passes themselves are live in the same page (a control: a `<div>` of "color" becomes "colour" and "10 km (6 miles)" loses its brackets; the same text inside `.verbatim` is untouched)
   AND for an AMERICAN reader with imperial units: Home's daily quote (the pool reduced to Confucius's "labour lost") and the card's quote block keep "labour" and "10 km (6 miles)" as stored; the control converts. Re-run after touching `spellSkip`, `unitSkip`,
   `dailyQuoteHTML`, `cardQuoteHTML` or any quotation's markup. */
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
  check("the Home daily quote's blockquote is `.verbatim`", has("function dailyQuoteHTML", 1600) && /<blockquote class="verbatim">' \+ pair\(q\.t/.test(APP));
  check("a card's quote block's blockquote is `.verbatim`", /<blockquote class="verbatim">' \+ q\.text/.test(APP));
  check("Who said it?'s round and its results are `.verbatim` (as since October)", /<blockquote class="ws-quote verbatim">/.test(APP) && /<p class="tf-sum-q verbatim">/.test(APP));
  check("the admin's two quotation lists are `.verbatim`", (APP.match(/<span class="q-text verbatim">/g) || []).length === 2);
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
      if (day.startsWith("2026-03-10")) { const c = await control(page); check("D) the units pass is live in this page (control, added after render: a British reader's spelling observer is not installed): plain text loses its imperial bracket, `.verbatim` keeps it", c.plain === "The color of 10 km and a labour of honor." && c.verbatim === "The color of 10 km (6 miles) and a labour of honor.", JSON.stringify(c)); }
      await ctx.close();
    }
    check("over the two days King's and Du Bois's quotations were both the daily quote", seen.includes(KING.q) && seen.includes(DUBOIS.q), seen.map((s) => s.slice(0, 30)).join(" | "));
  }

  /* ---- B2: Home, an American reader, the pool is Confucius's "labour lost" ---- */
  console.log("\n\x1b[1mB2) Home: the daily quote, American reader\x1b[0m\n");
  {
    const keep = SHIPPED.find((q) => /labour lost/.test(q.t)), overlay = { quotes: {} };
    for (const q of SHIPPED) if (q !== keep) overlay.quotes[q.t] = null;
    const { ctx, page } = await newPage(`localStorage.setItem("folio_tour_v1","1"); localStorage.setItem("folio_admin_v1", ${JSON.stringify(JSON.stringify(overlay))}); localStorage.setItem("folio_v1", JSON.stringify({ cards: {}, settings: { spelling: "en-US", units: "imperial", newPerDay: 5 } }));`);
    await page.goto(`http://127.0.0.1:${PORT}/#home`, { waitUntil: "load" }); await page.reload({ waitUntil: "load" });
    await page.waitForSelector(".daily-quote .dq-live", { timeout: 60000 }); await sleep(1200);
    const t = await page.evaluate(() => document.querySelector(".daily-quote .dq-live").textContent);
    check("the American reader's daily quote is Confucius's, printed as stored (\"labour\", not \"labor\")", t === keep.t && /labour lost/.test(t), t.slice(0, 80));
    const c = await control(page);
    check("the American reader's passes are live in the page (control): \"labour\" → \"labor\" and the bracket swapped", c.plain === "The color of 6 miles and a labor of honor." && c.verbatim === "The color of 10 km (6 miles) and a labour of honor.", JSON.stringify(c));
    await ctx.close();
  }

  /* ---- C: a card's quote block, a British reader and an American one ---- */
  for (const [who, settings, expect] of [
    ["British, metric", { spelling: "en-GB", units: "metric", newPerDay: 5 }, { word: "color", quote: "color lost, ten stages, 10 km (6 miles) apart; thought without learning is perilous" }],
    ["American, imperial", { spelling: "en-US", units: "imperial", newPerDay: 5 }, { word: "labour", quote: "labour lost, ten stages, 10 km (6 miles) apart; thought without learning is perilous" }],
  ]) {
    console.log(`\n\x1b[1mC) a card's quote block: the ${who} reader (wh-399, Legge's Confucius)\x1b[0m\n`);
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
