#!/usr/bin/env node
/* Folio — the three minigames added in Aug 2026: Crossword, Picture round, What year?
   ==================================================================================
   Every failure this file guards is SILENT. None of it throws, none of it shows up in a screenshot of one
   state, and each one has either happened already or is one edit away:

     · **THE CROSSWORD GRID'S TRACK SIZING.** A grid item's automatic minimum is its content's, and the
       content of a square is an `<input>` — about 150px of intrinsic width. Written `repeat(N,1fr)` the
       board runs to some 2,000px and hangs off the side of a phone, which reads as a board too big for the
       screen rather than as a rule that never fired. It shipped that way for an hour.
     · **MARKING A CROSSING SQUARE TWICE.** A crossing belongs to two entries, so a loop that marks and
       fills in one pass reaches it again and compares the letter it wrote itself against the letter it
       wanted. Every crossing came out marked wrong AND right at once — on a grid whose whole point is its
       crossings, and with the score still reading correctly, so nothing else could have caught it.
     · **A GRID THAT MAKES WORDS NOBODY CLUED.** The adjacency rule in the layout search is what stops two
       parallel entries touching down their whole length. Relax it and the board fills with unclued
       two-letter runs; it still renders, still checks, and is simply not a crossword.
     · **THE YEAR RAIL'S SPAN.** The first cut took the largest step that left four ticks, which for a Late
       Bronze Age puzzle meant a rail running 1600 BCE to 1600 CE. Half the rail was the Renaissance and
       the guess was trivial in one direction.
     · **THE ANSWER NOT BEING ON A TICK.** The rail is a lattice precisely so a guess can be exactly right.
       Change how the step is derived and the puzzle silently becomes unwinnable — the reader just loses
       every day and cannot tell why.
     · **THE PICTURE ROUND LEAKING ITS OWN ANSWER.** The picture's title, description and credit all name
       the subject, and the credit is a URL that often spells it out. They are held back until the guess is
       in. Put any of them on the page early and the game still works perfectly and teaches nothing.
     · **A NEW GAME NOT JOINING THE SWEEP.** DAILY_GAMES drives the Clean Sweep badge and the daily chest.
       A game on the grid but not in that list means a sweep claiming something it never measured.

   Two of the harder assertions are made by running the SAME DAY in two fresh browser contexts: the first
   plays badly and reads the answer off the result, the second is handed that answer and must win. That
   proves three things at once — the puzzle is seeded (both contexts get the same one), the answer is
   reachable (the crossword's letters fit its own grid; the year sits on a tick), and the check scores a
   correct solve as correct rather than only scoring a wrong one as wrong.

   Run:  NODE_PATH=<playwright>/node_modules node .claude/test-minigames.js
   Env:  FOLIO_CHROMIUM=<path to chrome> if Chromium lives outside the playwright package. */

const path = require("path");
const http = require("http");
const fs = require("fs");
const { chromium } = require("playwright");

const ROOT = path.join(__dirname, "..");
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png" };
const PHONE = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 900 };

let pass = 0, fail = 0;
function check(name, ok, extra) {
  if (ok) { pass++; console.log("ok    " + name + (extra ? "  " + extra : "")); }
  else { fail++; console.log("FAIL  " + name + (extra ? "  " + extra : "")); }
}

function serve() {
  const s = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p === "/") p = "/index.html";
    const f = path.join(ROOT, p);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end("not found"); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise((r) => s.listen(0, () => r([s, "http://127.0.0.1:" + s.address().port])));
}

/* ---------- the registry, read out of app.js by text ----------
   The three games are wired in five places and a miss in any one of them is invisible: a route not in
   `valid` is a deep link that goes home, a missing PAGE_META row inherits the home page's title into the
   browser tab and every link preview, and a game missing from DAILY_GAMES is one the sweep does not
   measure. Sliced rather than re-listed here so this cannot drift from what ships. */
function registry() {
  const src = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  const daily = /const DAILY_GAMES = \[([^\]]*)\]/.exec(src);
  const valid = /const valid = \[([^\]]*)\]/.exec(src);
  const list = (m) => (m ? m[1].split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean) : []);
  return {
    daily: list(daily),
    valid: list(valid),
    meta: ["crossword", "picture", "whatyear"].filter((k) => new RegExp("\\n\\s*" + k + ":\\s*\\[\"[^\"]+ — Folio\"").test(src)),
    names: ["crossword", "picture", "whatyear"].filter((k) => new RegExp(k + ": \\[\"[^\"]+\", ICON\\." + k).test(src)),
  };
}

const NEW_GAMES = [
  { key: "crossword", title: "Crossword", id: "g-crossword" },
  { key: "picture", title: "Picture round", id: "g-picture" },
  { key: "whatyear", title: "What year?", id: "g-whatyear" },
];

/* ---------- two years of puzzles, generated in Node ----------
   The browser sections below play ONE day. A generator can be perfect on the day it was written and
   degenerate on a date nobody tried, and both of this file's real bugs were of that kind: the year rail
   spanning 3,200 years, and the answer clumping twice into one week. So the two daily builders are sliced
   out of app.js by text — the technique `test-daily-quote.js` uses on `quoteRunningOrder` — stood on the
   real `data.js`, and walked over 730 days with no browser at all.
   The shims are the smallest thing that will do: no admin overlay, every card available, and the localiser
   an identity, which is what the site does anyway while MULTILANG is off. */
function simulate(days) {
  const src = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  const sl = (a, b) => { const i = src.indexOf(a); if (i < 0) throw new Error("test-minigames: can't find " + a); const j = src.indexOf(b, i); if (j < 0) throw new Error("test-minigames: no end for " + a); return src.slice(i, j); };
  const body = [
    sl("const DEEP_MAG =", "// start year of a card"),
    sl("function cardStartYear", "function cardSpanYears"),
    sl("  function hashStr(s) {", "  function dailyChronoSet"),
    sl("  const XW_ENTRIES =", "  PAGES.crossword = function"),
    sl("  const WY_EVENTS = 5", "  PAGES.whatyear = function"),
  ].join("\n");
  const shim = `
    const ADMIN_EDITS = {};
    const cardLocalized = (c) => c;
    const availableCardIdSet = () => new Set(CARDS.map((c) => c.id));
    const chronoYear = (c) => { const y = cardStartYear(c); return y ? y : null; };
    const chronoPool = () => CARDS.map((c) => ({ id: c.id, name: c.answerText, year: chronoYear(c) })).filter((x) => x.year != null && x.name);
  `;
  // data.js assigns onto `window`; require() caches, so only prime the global if it has not been loaded yet
  if (!(global.window && global.window.CARD_DATA)) { global.window = global.window || {}; require(path.join(ROOT, "data.js")); }
  const CARDS = global.window.CARD_DATA;
  const build = new Function("CARDS", "todayStr", "return (function(){" + shim + body + "; return {dailyCrossword, dailyWhatYear};})()");
  const out = { xw: [], wy: [] };
  const d0 = Date.UTC(2026, 0, 1);
  for (let i = 0; i < days; i++) {
    const day = new Date(d0 + i * 86400000).toISOString().slice(0, 10);
    const M = build(CARDS, () => day);
    out.xw.push(M.dailyCrossword());
    out.wy.push(M.dailyWhatYear());
  }
  return out;
}

(async () => {
  const [srv, base] = await serve();
  const browser = await chromium.launch({ executablePath: process.env.FOLIO_CHROMIUM || undefined });
  const errs = [];
  const watch = (p, tag) => {
    p.on("pageerror", (e) => errs.push(tag + " pageerror: " + e.message));
    /* `net::ERR_*` is the TRANSPORT failing — DNS, TLS, a refused connection — which in a sandbox means
       the webfont host and Supabase are simply unreachable, and says nothing about the site. Everything
       that matters still fails this: a JS error arrives on `pageerror`, and a same-origin file that is
       missing reports "the server responded with a status of 404", which carries no `net::` at all. */
    p.on("console", (m) => { if (m.type() === "error" && !/net::ERR_/.test(m.text())) errs.push(tag + " console: " + m.text()); });
  };
  // a fresh browser context each time, so "played today" from one section cannot gate the next
  const fresh = async (viewport) => { const c = await browser.newContext({ viewport: viewport || PHONE }); const p = await c.newPage(); return [c, p]; };

  /* ============================ 0. two years of puzzles ============================ */
  {
    const DAYS = 730;
    // read the target off app.js rather than writing 9 here, so raising it is one edit and not two
    const XW_TARGET = +(/const XW_ENTRIES = (\d+)/.exec(fs.readFileSync(path.join(ROOT, "app.js"), "utf8")) || [])[1];
    check("[sim] the crossword names how many entries it aims for", XW_TARGET >= 5, String(XW_TARGET));
    const sim = simulate(DAYS);
    // the crossword must deal a full grid EVERY day, not merely on the day this was written
    const nulls = sim.xw.filter((x) => !x).length;
    const grids = sim.xw.filter(Boolean);
    check("[sim] the crossword deals a grid on every one of " + DAYS + " days", nulls === 0, nulls + " blank days");
    check("[sim] …always the full set of entries", grids.every((g) => g.entries.length === XW_TARGET),
      "min " + Math.min(...grids.map((g) => g.entries.length)));
    check("[sim] …never outgrowing the board cap", grids.every((g) => g.w <= 13 && g.h <= 13),
      "max side " + Math.max(...grids.map((g) => Math.max(g.w, g.h))));
    check("[sim] …and a different grid each day", new Set(grids.map((g) => g.entries.map((e) => e.w).sort().join("|"))).size === grids.length);
    // …and no run of squares anywhere in two years that no clue accounts for
    let bad = 0;
    grids.forEach((g) => {
      let runs = 0;
      for (let y = 0; y < g.h; y++) { let n = 0; for (let x = 0; x <= g.w; x++) { if (x < g.w && g.filled.has(x + "," + y)) n++; else { if (n > 1) runs++; n = 0; } } }
      for (let x = 0; x < g.w; x++) { let n = 0; for (let y = 0; y <= g.h; y++) { if (y < g.h && g.filled.has(x + "," + y)) n++; else { if (n > 1) runs++; n = 0; } } }
      if (runs !== g.entries.length || g.entries.some((e) => e.n == null)) bad++;
    });
    check("[sim] …with no unclued run and no unnumbered entry in " + DAYS + " grids", bad === 0, bad + " bad grids");

    const wys = sim.wy.filter(Boolean);
    check("[sim] What year? deals a puzzle every day", wys.length === DAYS, wys.length + " of " + DAYS);
    /* THE ANSWER MUST BE ON A TICK — off the lattice the rail cannot express it and the puzzle is
       unwinnable every day, with nothing on screen to say so. */
    check("[sim] …the answer always on a tick of its own rail",
      wys.every((p) => p.from + p.at * p.step === p.year));
    /* THE RAIL MUST NOT SPAN THE WHOLE OF HISTORY (the bug: 1600 BCE → 1600 CE for a Bronze Age set), and
       a BCE answer's rail must not reach across year 0, which the calendar has not got. */
    const ratios = wys.map((p) => (p.step * (p.ticks - 1)) / Math.abs(p.year));
    check("[sim] …its span kept to about the answer's own age", Math.max(...ratios) <= 1.001,
      "worst " + Math.max(...ratios).toFixed(2) + "×");
    check("[sim] …and never reaching across year 0",
      wys.every((p) => p.year >= 0 || p.from + (p.ticks - 1) * p.step < 0));
    check("[sim] …five distinct things every time", wys.every((p) => p.events.length === 5 && new Set(p.events.map((e) => e.id)).size === 5));
    /* THE ROTATION'S WHOLE POINT: no answer may come round again inside half a cycle. Random selection put
       two of them two days apart, and a guard on the cycle JOIN alone did not fix it — see wyRotation. */
    const seq = wys.map((p) => p.year), pool = new Set(seq).size;
    let closest = Infinity;
    for (let i = 1; i < seq.length; i++) for (let j = i - 1; j >= 0 && i - j < pool; j--) if (seq[j] === seq[i]) { closest = Math.min(closest, i - j); break; }
    check("[sim] …and no answer repeating inside half a cycle", closest >= Math.ceil(pool / 2),
      "closest repeat " + closest + " days apart over a pool of " + pool);
    // …spread evenly over the pool rather than clumping: the busiest year within a couple of turns of the quietest
    const hits = {};
    seq.forEach((y) => { hits[y] = (hits[y] || 0) + 1; });
    const counts = Object.values(hits);
    check("[sim] …and every answer taking roughly its share", Math.max(...counts) - Math.min(...counts) <= 2,
      Math.min(...counts) + "–" + Math.max(...counts) + " turns each");
  }

  /* ============================ 1. the registry ============================ */
  {
    const r = registry();
    NEW_GAMES.forEach((g) => {
      check("[wiring] " + g.key + " is a route", r.valid.indexOf(g.key) >= 0);
      check("[wiring] " + g.key + " has its own page title", r.meta.indexOf(g.key) >= 0);
      check("[wiring] " + g.key + " has a played-today placard name and mark", r.names.indexOf(g.key) >= 0);
    });
    /* The sweep must name every game ON THE GRID — asserted against the tiles the home page actually
       paints rather than against a list copied into this file, so a tenth game added later fails on the
       RULE and not on a stale copy of it. */
    const [ctx, page] = await fresh();
    watch(page, "[home]");
    await page.goto(base, { waitUntil: "load" });
    await page.waitForTimeout(1400);
    const home = await page.evaluate(() => ({
      tiles: [...document.querySelectorAll(".game-tile")].map((t) => ({
        id: t.id, title: (t.querySelector(".gt-title") || {}).textContent, sub: !!t.querySelector(".gt-sub"),
        colour: getComputedStyle(t).getPropertyValue("--tile").trim(),
      })),
      cols: getComputedStyle(document.querySelector(".game-grid")).gridTemplateColumns.split(/\s+/).length,
      docW: document.documentElement.scrollWidth, winW: innerWidth,
    }));
    const titles = home.tiles.map((t) => t.title);
    NEW_GAMES.forEach((g) => check("[home] a tile for " + g.title, titles.indexOf(g.title) >= 0, titles.join(" | ")));
    check("[home] the sweep names every game on the grid",
      home.tiles.length === r.daily.length && home.tiles.every((t) => r.daily.indexOf(t.id.replace(/^g-/, "")) >= 0),
      home.tiles.length + " tiles vs " + r.daily.length + " in DAILY_GAMES");
    // nine tiles must not turn the grid into a scrolling strip, and must not grow taglines the row gave up
    check("[home] …still three to a row, no taglines, nothing overflowing",
      home.cols === 3 && !home.tiles.some((t) => t.sub) && home.docW <= home.winW,
      JSON.stringify({ cols: home.cols, subs: home.tiles.filter((t) => t.sub).length, docW: home.docW, winW: home.winW }));
    // one colour per tile: two games washing the same hue read as one game the reader has already played
    const cols = home.tiles.map((t) => t.colour.toLowerCase());
    check("[home] …and no two tiles share a colour", new Set(cols).size === cols.length, cols.join(","));
    for (const g of NEW_GAMES) {
      await page.click("#" + g.id);
      await page.waitForTimeout(700);
      const at = await page.evaluate(() => location.hash);
      check("[home] the " + g.title + " tile routes to its page", at === "#" + g.key, at);
      await page.goBack(); await page.waitForTimeout(500);
    }
    await ctx.close();
  }

  /* ============================ 2. the crossword ============================ */
  let xwAnswers = null;
  {
    const [ctx, page] = await fresh();
    watch(page, "[xw]");
    await page.goto(base + "#crossword", { waitUntil: "load" });
    await page.waitForTimeout(1200);

    const built = await page.evaluate(() => {
      const g = document.querySelector(".xw-grid");
      if (!g) return { none: true, text: document.querySelector("#view").textContent.slice(0, 160) };
      const sq = [...document.querySelectorAll(".xw-sq")].map((s) => s.dataset.k);
      const clues = [...document.querySelectorAll(".xw-clue")].map((li) => ({
        e: li.dataset.e,
        len: +(/\((\d+)\)\s*$/.exec(li.querySelector(".xw-len").textContent) || [])[1],
        text: li.querySelector(".xw-ct").textContent.trim(),
        blank: !!li.querySelector(".blank"),
      }));
      return {
        cells: sq, clues: clues,
        cols: getComputedStyle(g).gridTemplateColumns.split(/\s+/).length,
        gridW: Math.round(g.getBoundingClientRect().width),
        pageW: Math.round(document.querySelector(".page").getBoundingClientRect().width),
        docW: document.documentElement.scrollWidth, winW: innerWidth,
        nums: [...document.querySelectorAll(".xw-n")].map((n) => +n.textContent),
        across: document.querySelectorAll("#xwAcross .xw-clue").length,
        down: document.querySelectorAll("#xwDown .xw-clue").length,
        cur: (document.querySelector("#xwCur") || {}).textContent.trim(),
      };
    });
    check("[xw] the deck deals a grid", !built.none, built.none ? built.text : "");
    if (!built.none) {
      check("[xw] …of at least five entries, across and down", built.clues.length >= 5 && built.across > 0 && built.down > 0,
        built.across + " across, " + built.down + " down");
      check("[xw] …fitting its column at 390px, with no sideways scroll",
        built.gridW <= built.pageW + 1 && built.docW <= built.winW,
        JSON.stringify({ grid: built.gridW, page: built.pageW, doc: built.docW, win: built.winW }));
      check("[xw] …with a numbered square for every entry and none spare",
        built.nums.length === new Set(built.nums).size && built.nums.length > 0 && built.nums.length <= built.clues.length,
        built.nums.join(","));
      check("[xw] …every clue carrying its enumeration and the card's own blank",
        built.clues.every((c) => c.len >= 4 && c.len <= 11 && c.blank), JSON.stringify(built.clues.map((c) => c.len)));
      check("[xw] …and the clue being typed pinned above the grid", /across|down/i.test(built.cur), built.cur.slice(0, 40));

      /* THE GRID MUST CONTAIN NO WORD NOBODY CLUED. Every maximal run of two or more filled squares, in
         both directions, has to be an entry with a clue — which is what the layout's adjacency rule buys
         and the only check that can see it going. */
      const set = new Set(built.cells);
      const xy = built.cells.map((k) => k.split(",").map(Number));
      const W = Math.max(...xy.map((p) => p[0])) + 1, H = Math.max(...xy.map((p) => p[1])) + 1;
      const runs = [];
      for (let y = 0; y < H; y++) { let n = 0; for (let x = 0; x <= W; x++) { if (x < W && set.has(x + "," + y)) n++; else { if (n > 1) runs.push(["a", x - n, y, n]); n = 0; } } }
      for (let x = 0; x < W; x++) { let n = 0; for (let y = 0; y <= H; y++) { if (y < H && set.has(x + "," + y)) n++; else { if (n > 1) runs.push(["d", x, y - n, n]); n = 0; } } }
      const lens = built.clues.map((c) => c.len).sort((a, b) => a - b).join(",");
      check("[xw] …and no run of squares that no clue accounts for",
        runs.length === built.clues.length && runs.map((r) => r[3]).sort((a, b) => a - b).join(",") === lens,
        runs.length + " runs vs " + built.clues.length + " clues");
      // a chain of words meeting end to end is a word list; the crossings are the game
      check("[xw] …the entries genuinely crossing", built.cells.length < built.clues.reduce((s, c) => s + c.len, 0),
        built.cells.length + " squares for " + built.clues.reduce((s, c) => s + c.len, 0) + " letters");

      /* A DELIBERATELY WRONG GRID: nothing right, every square marked wrong and NONE marked both — which
         is the crossing-square bug, invisible in the score, which is correct either way. */
      await page.evaluate(() => document.querySelectorAll(".xw-cell").forEach((el) => {
        el.focus(); el.value = "Z"; el.dispatchEvent(new Event("input", { bubbles: true }));
      }));
      await page.click("#xw-check");
      await page.waitForTimeout(300);
      const marked = await page.evaluate(() => ({
        title: (document.querySelector(".cr-title") || {}).textContent || "",
        bad: document.querySelectorAll(".xw-cell.bad").length,
        both: document.querySelectorAll(".xw-cell.ok.bad").length,
        cells: document.querySelectorAll(".xw-cell").length,
        revealed: [...document.querySelectorAll(".xw-cell")].every((el) => /^[A-Z]$/.test(el.value)),
        locked: [...document.querySelectorAll(".xw-cell")].every((el) => el.readOnly),
        checkGone: !document.querySelector("#xw-check"),
        letters: [...document.querySelectorAll(".xw-cell")].map((el) => [el.dataset.k, el.value]),
      }));
      xwAnswers = marked.letters;
      check("[xw] a wrong grid scores nothing", /^0 \//.test(marked.title), marked.title);
      check("[xw] …every square marked wrong", marked.bad === marked.cells, marked.bad + " of " + marked.cells);
      check("[xw] …and NO square marked wrong and right at once", marked.both === 0, marked.both + " doubly marked");
      check("[xw] …the answers filled in and the grid locked", marked.revealed && marked.locked && marked.checkGone);

      // one check a day: a reload lands on the played-today gate rather than a fresh grid
      await page.reload({ waitUntil: "load" });
      await page.waitForTimeout(800);
      const gate = await page.evaluate(() => ({ placard: !!document.querySelector(".placard"), txt: (document.querySelector("#view") || {}).textContent.replace(/\s+/g, " ") }));
      check("[xw] …and the day is spent", gate.placard && /played today/i.test(gate.txt) && /crossword/i.test(gate.txt), gate.txt.slice(0, 90));
    }
    await ctx.close();
  }
  /* THE SAME DAY, A FRESH READER, THE RIGHT LETTERS. This proves what the wrong-run cannot: that the
     puzzle is seeded (this context is dealt the same grid), that its answers fit their own squares, and
     that a correct solve is scored as correct and wins. */
  if (xwAnswers) {
    const [ctx, page] = await fresh(DESKTOP);
    watch(page, "[xw2]");
    await page.goto(base + "#crossword", { waitUntil: "load" });
    await page.waitForTimeout(1200);
    const won = await page.evaluate((letters) => {
      const map = new Map(letters);
      const cells = [...document.querySelectorAll(".xw-cell")];
      if (cells.length !== map.size) return { mismatch: cells.length + " vs " + map.size };
      cells.forEach((el) => { el.value = map.get(el.dataset.k) || ""; });
      document.querySelector("#xw-check").click();
      return {
        title: (document.querySelector(".cr-title") || {}).textContent || "",
        win: !!document.querySelector(".chrono-result.win"),
        bad: document.querySelectorAll(".xw-cell.bad").length,
      };
    }, xwAnswers);
    check("[xw] the same day deals the same grid to a fresh reader", !won.mismatch, won.mismatch || "");
    check("[xw] …and a correct solve wins", !won.mismatch && won.win && won.bad === 0 && /solved/i.test(won.title), JSON.stringify(won));
    await ctx.close();
  }

  /* ============================ 3. what year? ============================ */
  let wyYear = null, wyRail = null;
  {
    const [ctx, page] = await fresh();
    watch(page, "[wy]");
    await page.goto(base + "#whatyear", { waitUntil: "load" });
    await page.waitForTimeout(1200);
    const start = await page.evaluate(() => {
      const r = document.querySelector("#wyRange");
      if (!r) return { none: true, text: document.querySelector("#view").textContent.slice(0, 160) };
      return {
        events: [...document.querySelectorAll(".wy-events li")].map((l) => l.textContent.trim()),
        min: +r.min, max: +r.max, val: +r.value,
        lo: (document.querySelector("#wyLo") || {}).textContent, hi: (document.querySelector("#wyHi") || {}).textContent,
        dots: document.querySelectorAll("#wyTries .th-dot").length,
        answerMark: !!document.querySelector(".wy-answer"),
        docW: document.documentElement.scrollWidth, winW: innerWidth,
      };
    });
    check("[wy] the deck deals a puzzle", !start.none, start.none ? start.text : "");
    if (!start.none) {
      check("[wy] …of five distinct things", start.events.length === 5 && new Set(start.events).size === 5, start.events.join(" | "));
      /* The rail marks where the answer was — but only once the puzzle is OVER. Drawn a moment early it is
         the same failure as the picture round showing its caption: the game still works and asks nothing. */
      check("[wy] …and the rail does not show where the answer is", !start.answerMark, "answer mark on screen before a guess");
      check("[wy] …on a rail of three guesses that fits the phone", start.dots === 3 && start.docW <= start.winW, JSON.stringify({ dots: start.dots, docW: start.docW }));
      /* THE RAIL MUST NOT SPAN THE WHOLE OF HISTORY. Both ends in the same era is the readable form of
         "the span is capped at about the answer's own age", and a BCE puzzle whose rail reaches into CE
         would also be offering a tick reading "0 CE", a year the calendar has not got. */
      const era = (s) => (/BCE/.test(s) ? "BCE" : /Mya|kya|Gya/.test(s) ? "deep" : "CE");
      check("[wy] …ruled in one era rather than across the whole of history", era(start.lo) === era(start.hi),
        start.lo + " → " + start.hi);

      // three wrong guesses at the low end: each must narrow the rail upwards and mark where it was tried
      const state = () => page.evaluate(() => {
        const r = document.querySelector("#wyRange");
        return { min: +r.min, max: +r.max, marks: document.querySelectorAll(".wy-mark").length, answerMark: !!document.querySelector(".wy-answer"),
                 res: (document.querySelector("#wyResult") || {}).textContent || "", disabled: r.disabled };
      });
      let prev = { min: start.min };
      let narrowed = true;
      for (let i = 0; i < 3; i++) {
        await page.evaluate(() => { const r = document.querySelector("#wyRange"); r.value = r.min; r.dispatchEvent(new Event("input", { bubbles: true })); });
        const b = await page.$("#wy-guess"); if (!b) break;
        await b.click(); await page.waitForTimeout(220);
        const s = await state();
        if (i < 2 && s.min <= prev.min) narrowed = false;
        prev = s;
      }
      const end = await state();
      check("[wy] a guess that is too early rules out everything at or below it", narrowed, "min ended at " + end.min);
      check("[wy] …three misses end the puzzle and name the year", end.disabled && /it was/i.test(end.res) && end.marks === 3, end.res.slice(0, 60));
      check("[wy] …and only THEN does the rail show where it was", end.answerMark);
      wyYear = (/It was ([^A-Z]*[\d.,]+\s*(?:BCE|CE|kya|Mya|Gya))/.exec(end.res) || [])[1];
      wyRail = { lo: start.lo, hi: start.hi, max: start.max };
      check("[wy] …and the answer is a readable year", !!wyYear, String(wyYear));
    }
    await ctx.close();
  }
  /* THE ANSWER MUST BE ON A TICK. If it is not, the rail cannot express it and the puzzle is unwinnable
     every day with nothing on screen to say so. Handed yesterday's answer, a fresh reader must be able to
     land on it exactly — and win on the first guess. */
  if (wyYear) {
    const [ctx, page] = await fresh();
    watch(page, "[wy2]");
    await page.goto(base + "#whatyear", { waitUntil: "load" });
    await page.waitForTimeout(1200);
    const hit = await page.evaluate((want) => {
      const r = document.querySelector("#wyRange"), read = document.querySelector("#wyRead");
      const norm = (s) => String(s).replace(/\s+/g, " ").trim();
      for (let i = +r.min; i <= +r.max; i++) {
        r.value = i; r.dispatchEvent(new Event("input", { bubbles: true }));
        if (norm(read.textContent) === norm(want)) return { found: i, ticks: +r.max + 1 };
      }
      return { found: -1, ticks: +r.max + 1 };
    }, wyYear);
    check("[wy] the answer sits ON a tick of its own rail", hit.found >= 0, wyYear + " over " + hit.ticks + " ticks");
    if (hit.found >= 0) {
      await page.click("#wy-guess");
      await page.waitForTimeout(300);
      const res = await page.evaluate(() => ({ txt: (document.querySelector("#wyResult") || {}).textContent || "", win: !!document.querySelector(".chrono-result.win") }));
      check("[wy] …and landing on it first go is a win", res.win && /first guess/i.test(res.txt), res.txt.slice(0, 70));
    }
    await ctx.close();
  }

  /* ============================ 4. the picture round ============================ */
  {
    /* The shipped corpus carried ONE picture when this game was written and now carries hundreds, so
       this asserts the PAIR rather than either state — see the check's own comment below. */
    const [ctx, page] = await fresh();
    watch(page, "[pic]");
    await page.goto(base + "#picture", { waitUntil: "load" });
    await page.waitForTimeout(1000);
    const shipped = await page.evaluate(() => ({
      placard: !!document.querySelector(".placard"),
      round: !!document.querySelector(".pic-frame"),
      txt: (document.querySelector("#view") || {}).textContent.replace(/\s+/g, " ").trim(),
    }));
    /* Either state is correct and which one shows is a fact about the CONTENT, so this asserts the pair
       rather than one of them: with pictures it deals a round, without them it says so. What must never
       happen is a round with no picture in it. */
    check("[pic] the shipped corpus either deals a round or says why not",
      shipped.round || (shipped.placard && /picture|illustrat/i.test(shipped.txt)), shipped.txt.slice(0, 90));

    // …and with a pool planted the way an admin batch would, it deals
    await page.goto(base, { waitUntil: "load" });
    await page.waitForTimeout(900);
    /* THE PLANTED POOL MUST BE THE WHOLE POOL, not ten entries added on top of it.  `picturePool`
       gathers every card, glossary and artefact picture, so once the corpus gained real pictures a
       seeded draw of five reached the real ones and every assertion below — which is about the
       PLANTED captions and credits — failed on content rather than on behaviour.  Replacing the
       table and clearing the cards' pictures makes the draw deterministic at any corpus size. */
    const planted = await page.evaluate(() => {
      const keys = Object.keys(window.GLOSSARY).slice(0, 10);
      window.GLOSSARY_IMAGES = {};
      keys.forEach((k, i) => {
        /* Every planted src RESOLVES.  The rotted-link case below is driven by firing the error event
           at the frame on the page, so a genuinely 404 src here buys nothing and costs a real console
           error that the end-of-run "no page errors" watcher counts against the whole file. */
        window.GLOSSARY_IMAGES[k] = { src: "/icon.svg", title: "Plate " + i, desc: "A description naming " + k + ".", credit: "https://example.org/" + k };
      });
      (window.CARD_DATA || []).forEach((c) => { delete c.image; });
      (window.ARTEFACTS || []).forEach((a) => { delete a.image; });
      location.hash = "#picture";
      return keys.map((k) => k.replace(/_/g, " "));
    });
    await page.waitForTimeout(1000);
    const round = await page.evaluate(() => ({
      opts: [...document.querySelectorAll("#picOpts .opt")].map((b) => b.textContent.replace(/^[ABCD]/, "").trim()),
      img: (document.querySelector(".pic-img") || {}).getAttribute ? document.querySelector(".pic-img").getAttribute("src") : null,
      alt: (document.querySelector(".pic-img") || {}).alt,
      body: (document.querySelector("#view") || {}).textContent.replace(/\s+/g, " "),
      html: (document.querySelector("#view") || {}).innerHTML,
      pips: document.querySelectorAll(".tf-pip").length,
    }));
    check("[pic] a planted pool deals five rounds of four", round.opts.length === 4 && round.pips === 5, round.opts.join(" | "));
    check("[pic] …with a picture and a text alternative that does not name it", !!round.img && !!round.alt && !/plate/i.test(round.alt), round.alt);
    /* THE ANSWER MUST NOT BE ON THE PAGE BEFORE THE GUESS. The title, the description and the credit URL
       all name the subject; showing any of them early leaves a game that works perfectly and teaches
       nothing, which is the one failure here that nobody would report. */
    check("[pic] …and nothing on the page names the subject yet",
      !/Plate \d/.test(round.body) && !/A description naming/.test(round.body) && !/example\.org/.test(round.html),
      round.body.slice(0, 80));

    await page.click("#picOpts .opt");
    await page.waitForTimeout(300);
    const rev = await page.evaluate(() => ({
      verdict: (document.querySelector(".tf-verdict") || {}).textContent || "",
      cap: (document.querySelector(".pic-cap") || {}).textContent || "",
      credit: (document.querySelector(".pic-credit a") || {}).getAttribute ? document.querySelector(".pic-credit a").getAttribute("href") : "",
      marked: document.querySelectorAll("#picOpts .opt.correct").length,
      dead: !!document.querySelector(".pic-frame.pic-dead"),
    }));
    check("[pic] …the guess reveals the answer, its caption and its credit as a link",
      /correct|not quite/i.test(rev.verdict) && /Plate \d/.test(rev.cap) && /^https:\/\/example\.org\//.test(rev.credit) && rev.marked === 1,
      JSON.stringify({ cap: rev.cap, credit: rev.credit }));
    /* A LINK THAT HAS ROTTED. There is no upload path here — every picture is somebody else's URL — so a
       404 is a certainty rather than an edge case, and it must read as a broken link rather than as an
       empty frame the reader is being asked to name. Driven by firing the event at the frame on the page
       rather than by hoping the seeded draw deals the dead one: a check that only fires on a lucky deal
       passes on days it was never made. */
    const dead = await page.evaluate(() => {
      const img = document.querySelector(".pic-img");
      if (!img) return { none: true };
      img.dispatchEvent(new Event("error"));
      const f = img.closest(".pic-frame");
      return { marked: f.classList.contains("pic-dead"), hidden: getComputedStyle(img).display === "none" };
    });
    check("[pic] …and a picture that will not load says so rather than showing an empty frame",
      dead.marked && dead.hidden, JSON.stringify(dead));

    // play it out: five rounds, a score, and a summary row per round
    for (let i = 0; i < 5; i++) {
      const n = await page.$("#pic-next"); if (!n) break;
      await n.click(); await page.waitForTimeout(250);
      const o = await page.$("#picOpts .opt"); if (!o) break;
      await o.click(); await page.waitForTimeout(200);
    }
    const done = await page.evaluate(() => ({
      h1: (document.querySelector("h1") || {}).textContent.replace(/\s+/g, " ").trim(),
      rows: document.querySelectorAll(".tf-sum-row").length,
      tomorrow: !!document.querySelector(".tf-tomorrow"),
      again: /play again/i.test((document.querySelector("#view") || {}).textContent),
    }));
    check("[pic] …five rounds end on a score, a summary and no second go",
      /\/ 5/.test(done.h1) && done.rows === 5 && done.tomorrow && !done.again, JSON.stringify(done));
    await ctx.close();
  }

  check("[all] no page errors anywhere", errs.length === 0, errs.slice(0, 4).join(" | "));

  await browser.close();
  srv.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
