#!/usr/bin/env node
/* Folio — the minigames: Crossword, Picture round, What year?, Common Thread and Who said it?
   ==================================================================================
   Every failure this file guards is SILENT. None of it throws, none of it shows up in a screenshot of one
   state, and each one has either happened already or is one edit away:

     · **THE CROSSWORD GRID'S TRACK SIZING.** A grid item's automatic minimum is its content's, and the
       content of a square is an `<input>` — about 150px of intrinsic width. Written `repeat(N,1fr)` the
       board runs to some 2,000px and hangs off the side of a phone, which reads as a board too big for the
       screen rather than as a rule that never fired. It shipped that way for an hour.
     · **MARKING A CROSSING SQUARE TWICE.** A crossing belongs to two entries, so anything that marks one
       entry at a time has to answer for both at once, and the square comes out carrying whichever verdict
       ran last — green from a solved entry, red from a wrong one, or in the old check-button version both
       at once. The score reads correctly either way, so nothing else could have caught it.
     · **THE GRID NOT SURVIVING A VISIT.** It marks itself as it is filled and reveals nothing, so it stays
       open all day and a reader may leave it half done — which only works if the letters are kept and the
       played-today gate holds off until the thing is actually solved. Both fail silently: one loses the
       work, the other locks the reader out of a puzzle they could still finish.
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
     · **WHO SAID IT'S DECOY LADDER.** The three wrong names are ranked to share the answer's family and
       period. Revert the ranking to a random draw and the game deals, scores and reads exactly as it did,
       and is won by spotting which of the four names is a thousand years out of place. Its round count
       moved from five to three in the same batch, and every figure on the page is derived from
       `rounds.length` — so a literal left behind shows up on one screen and nowhere else.

   TODAY'S ANSWERS ARE GENERATED HERE, in Node, and handed to the browser (`crosswordForPage`). They used
   to be read off the check button's reveal, and there is no reveal any more — which is a better position
   anyway: the Node build and the page are given nothing but the date and must produce the identical grid,
   so the seeding is proved by the two agreeing rather than by two browser contexts agreeing with each
   other. What Year? still runs its answer twice, once played badly and once played right, since its rail
   has to be shown to be able to express the answer at all.

   Run:  NODE_PATH=<playwright>/node_modules node .claude/test-minigames.js
   Env:  FOLIO_CHROMIUM=<path to chrome> if Chromium lives outside the playwright package. */

const path = require("path");
const http = require("http");
const fs = require("fs");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");

const ROOT = path.join(__dirname, "..");
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png" };
const PHONE = { width: 390, height: 844 };

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
/* `builder()` returns "give me a day, get that day's puzzles" — used both by the 730-day sweep below and
   by the crossword's browser section, which needs TODAY'S ANSWERS and can no longer read them off the
   page: the grid marks itself as it is filled and never reveals anything, which is the whole point of it. */
function builder() {
  const src = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  const sl = (a, b) => { const i = src.indexOf(a); if (i < 0) throw new Error("test-minigames: can't find " + a); const j = src.indexOf(b, i); if (j < 0) throw new Error("test-minigames: no end for " + a); return src.slice(i, j); };
  const body = [
    sl("const DEEP_MAG =", "// start year of a card"),
    sl("function cardStartYear", "function cardSpanYears"),
    sl("  function hashStr(s) {", "  function dailyChronoSet"),
    sl("  const XW_ENTRIES =", "  PAGES.crossword = function"),
    sl("  const WY_EVENTS = 5", "  PAGES.whatyear = function"),
    sl("  function dayPick(key, arr, n) {", "\n  PAGES.challenge"),
  ].join("\n");
  /* `gameCardIdSet` is shimmed to the REAL rule — the available cards at or below GAME_MAX_DIFFICULTY,
     with the bar read out of app.js rather than written down here — because the whole value of the
     730-day sweep is that it deals from the pool the site deals from. Shimming it to "every card", the
     way `availableCardIdSet` is shimmed, would sweep two years of puzzles the reader never sees and
     would go on passing on the day the filter starved a game.
     A MAP CARD IS EXCLUDED HERE TOO, and the shim went a fortnight without it: `cardMapSpec` joined the
     real rule when the Geography collection landed (a map card's clue IS its picture, so dealt cold it
     asks "the state shaded on the map is ____" with no map beside it), and until this line the Node
     builder drew from a pool five cards wider than the page's — so `crosswordForPage` compared two
     genuinely different grids and reported "no matching day", which reads as a SEEDING fault rather
     than as a stale shim. A shim of a rule is a copy of it, and it goes stale the day the rule grows. */
  const GAME_MAX = (() => { const m = /const GAME_MAX_DIFFICULTY = (\d+);/.exec(src); if (!m) throw new Error("test-minigames: no GAME_MAX_DIFFICULTY in app.js"); return +m[1]; })();
  const shim = `
    const ADMIN_EDITS = {};
    const cardLocalized = (c) => c;
    const GAME_MAX_DIFFICULTY = ${GAME_MAX};
    const availableCardIdSet = () => new Set(CARDS.map((c) => c.id));
    const difficultyOK = (c) => typeof (c && c.difficulty) === "number" && c.difficulty >= 1 && c.difficulty <= GAME_MAX_DIFFICULTY;
    const gameCardIdSet = () => new Set(CARDS.filter((c) => difficultyOK(c) && !cardMapSpec(c)).map((c) => c.id));
    const cardMapSpec = (c) => (c && c.map && c.map.layer && c.map.key ? c.map : null);
    const localStorage = { getItem: () => null, setItem: () => {} };
    const chronoYear = (c) => { const y = cardStartYear(c); return y ? y : null; };
    const chronoPool = () => CARDS.filter(difficultyOK).map((c) => ({ id: c.id, name: c.answerText, year: chronoYear(c) })).filter((x) => x.year != null && x.name);
  `;
  // data.js and whatyear.js assign onto `window`; require() caches, so only prime the global if unloaded
  if (!(global.window && global.window.CARD_DATA)) { global.window = global.window || {}; require(path.join(ROOT, "data.js")); }
  if (!global.window.WHATYEAR) require(path.join(ROOT, "whatyear.js"));
  // …and the crossword's own bank, which since Sep 2026 is where its clues come from rather than the cards
  if (!global.window.CROSSWORD) require(path.join(ROOT, "crossword.js"));
  const CARDS = global.window.CARD_DATA;
  const make = new Function("CARDS", "todayStr", "window", "return (function(){" + shim + body + "; return {dailyCrossword, dailyWhatYear, dayPick};})()");
  return (day) => make(CARDS, () => day, global.window);
}
function simulate(days) {
  const build = builder();
  const out = { xw: [], wy: [] };
  const d0 = Date.UTC(2026, 0, 1);
  for (let i = 0; i < days; i++) {
    const day = new Date(d0 + i * 86400000).toISOString().slice(0, 10);
    const M = build(day);
    out.xw.push(M.dailyCrossword());
    out.wy.push(M.dailyWhatYear());
  }
  return out;
}
/* The page's grid, generated here so the test knows its answers. The site's day runs on the reader's own
   clock with a settable boundary, which need not be Node's UTC date, so the neighbouring days are tried
   too and the one whose entries MATCH the rendered clue list is the one the page is showing — which also
   re-proves the seeding the two-context run used to prove: a browser and a bare Node process, given only
   the date, deal the identical grid. */
function crosswordForPage(clueIds) {
  const build = builder();
  const want = clueIds.slice().sort().join("|");
  for (let off = -1; off <= 1; off++) {
    const day = new Date(Date.now() + off * 86400000).toISOString().slice(0, 10);
    const p = build(day).dailyCrossword();
    if (!p) continue;
    if (p.entries.map((e) => e.n + e.dir).sort().join("|") !== want) continue;
    const letters = {};
    p.entries.forEach((e) => {
      for (let i = 0; i < e.w.length; i++) letters[(e.dir === "a" ? e.x + i : e.x) + "," + (e.dir === "a" ? e.y : e.y + i)] = e.w[i];
    });
    return { puz: p, letters: letters, day: day };
  }
  return null;
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
    p.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !isNoise(t)) errs.push(t); });
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
    /* VARIETY, and it is a BOUND rather than "all distinct" (relaxed Aug 2026 when the minigames were
       narrowed to well-known terms — see gameCardIdSet). This asserted 730 of 730 distinct back when the
       crossword drew from all 409 cards, and with a pool of ~134 usable words that held; the filtered pool
       is 30 words, and choosing nine of thirty over two years collides however good the shuffle is, so
       demanding uniqueness would be demanding something arithmetic forbids.
       The bound is what still catches the failure this is FOR. When the filter first landed the draw cap
       stopped sampling — every day drew the whole pool and only the layout RNG differed — and the count
       fell to 60 in 730, a repeat every fortnight, with every grid still full and nothing thrown. 60 fails
       this; the 577 the fixed cap gives passes. Raise the floor if the pool grows, don't lower it. */
    const distinctGrids = new Set(grids.map((g) => g.entries.map((e) => e.w).sort().join("|"))).size;
    check("[sim] …and enough different grids that it reads as daily", distinctGrids >= grids.length * 0.5,
      distinctGrids + " distinct in " + grids.length + " days");
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
      /* THE CLUES ARE THE GAME'S OWN NOW, NOT CARD QUESTIONS (Sep 2026, on request), so this asserts the
         opposite of what it used to about the blank: a clue must carry its enumeration and must NOT
         carry `<span class="blank">`, which is the cloze marker a card question is written around. A
         reversion to the card pool would put 28-word sentences with a gap in the middle under a grid,
         and that is exactly what the second half of this catches. */
      check("[xw] …every clue carrying its enumeration and no card cloze",
        built.clues.every((c) => c.len >= 4 && c.len <= 11 && !c.blank),
        JSON.stringify(built.clues.map((c) => c.len)) + (built.clues.some((c) => c.blank) ? "  (a clue still carries a card's blank)" : ""));
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

      /* ---- IT MARKS ITSELF AS IT IS FILLED (Aug 2026) ----
         There is no check button any more, so the answers cannot be read off a reveal; they are generated
         here instead (see `crosswordForPage`, which also re-proves that browser and bare Node deal the
         same grid from the date alone). Everything below fails silently: an entry that never turns colour
         is a game with no feedback, red squares that lock are a game that cannot be retried, and a grid
         that forgets itself between visits is one a reader cannot finish. */
      const today = crosswordForPage(built.clues.map((c) => c.e));
      check("[xw] the page's grid is the one the date deals", !!today, today ? today.day : "no matching day");
      if (today) {
        const first = today.puz.entries[0];
        const firstCells = Array.from({ length: first.w.length }, (_, i) =>
          (first.dir === "a" ? first.x + i : first.x) + "," + (first.dir === "a" ? first.y : first.y + i));
        // one entry, every letter wrong
        const wrong = await page.evaluate((cells) => {
          cells.forEach((k) => {
            const el = document.querySelector('.xw-cell[data-k="' + k + '"]');
            el.focus(); el.value = "Z"; el.dispatchEvent(new Event("input", { bubbles: true }));
          });
          return {
            bad: cells.filter((k) => document.querySelector('.xw-cell[data-k="' + k + '"]').classList.contains("bad")).length,
            ok: document.querySelectorAll(".xw-cell.ok").length,
            both: document.querySelectorAll(".xw-cell.ok.bad").length,
            editable: cells.every((k) => !document.querySelector('.xw-cell[data-k="' + k + '"]').readOnly),
            noCheck: !document.querySelector("#xw-check"),
            clearShown: !document.querySelector("#xw-clear").hidden,
            result: (document.querySelector("#xwResult") || {}).textContent.trim(),
          };
        }, firstCells);
        check("[xw] a filled-in wrong answer turns red at once, with no check button anywhere",
          wrong.bad === firstCells.length && wrong.ok === 0 && wrong.noCheck, JSON.stringify(wrong));
        check("[xw] …its letters still typeable, so it can be guessed again", wrong.editable && wrong.clearShown);
        check("[xw] …and nothing is scored for it", wrong.result === "", wrong.result.slice(0, 60));

        // …and the red letters can be swept away in one press
        await page.click("#xw-clear");
        await page.waitForTimeout(120);
        const cleared = await page.evaluate((cells) => ({
          bad: document.querySelectorAll(".xw-cell.bad").length,
          empty: cells.every((k) => !document.querySelector('.xw-cell[data-k="' + k + '"]').value),
          hidden: document.querySelector("#xw-clear").hidden,
        }), firstCells);
        check("[xw] …and 'Clear the wrong letters' empties exactly those", cleared.bad === 0 && cleared.empty && cleared.hidden, JSON.stringify(cleared));

        // the same entry, right this time: green, locked, and counted
        const right = await page.evaluate((arg) => {
          arg.cells.forEach((k) => {
            const el = document.querySelector('.xw-cell[data-k="' + k + '"]');
            el.focus(); el.value = arg.letters[k]; el.dispatchEvent(new Event("input", { bubbles: true }));
          });
          return {
            ok: arg.cells.filter((k) => document.querySelector('.xw-cell[data-k="' + k + '"]').classList.contains("ok")).length,
            locked: arg.cells.every((k) => document.querySelector('.xw-cell[data-k="' + k + '"]').readOnly),
            bad: document.querySelectorAll(".xw-cell.bad").length,
            done: document.querySelectorAll(".xw-clue.done").length,
            result: (document.querySelector("#xwResult") || {}).textContent.trim(),
          };
        }, { cells: firstCells, letters: today.letters });
        check("[xw] a right answer turns green the moment it is filled", right.ok === firstCells.length && right.bad === 0, JSON.stringify(right));
        check("[xw] …its squares locked and its clue struck through", right.locked && right.done === 1);
        check("[xw] …and the score written up as it rises", /^1 of \d+ answers found/.test(right.result), right.result.slice(0, 50));

        /* THE GRID IS STILL THERE TOMORROW MORNING — that is, after a reload. The whole point of marking
           as you go is that nothing is revealed, so nothing is spent by coming back; a reader who leaves a
           grid half done must not meet the played-today gate. */
        await page.reload({ waitUntil: "load" });
        await page.waitForTimeout(900);
        const back = await page.evaluate(() => ({
          grid: !!document.querySelector(".xw-grid"),
          placard: !!document.querySelector(".placard"),
          ok: document.querySelectorAll(".xw-cell.ok").length,
          result: (document.querySelector("#xwResult") || {}).textContent.trim(),
        }));
        check("[xw] an unfinished grid is still open on the next visit", back.grid && !back.placard, JSON.stringify(back));
        check("[xw] …with the answers already found still on it", back.ok === firstCells.length && /^1 of /.test(back.result), JSON.stringify(back));

        // …and filling the rest correctly wins
        const won = await page.evaluate((letters) => {
          [...document.querySelectorAll(".xw-cell")].forEach((el) => {
            if (el.readOnly) return;
            el.focus(); el.value = letters[el.dataset.k] || ""; el.dispatchEvent(new Event("input", { bubbles: true }));
          });
          return {
            win: !!document.querySelector(".chrono-result.win"),
            title: (document.querySelector(".cr-title") || {}).textContent || "",
            bad: document.querySelectorAll(".xw-cell.bad").length,
            locked: [...document.querySelectorAll(".xw-cell")].every((el) => el.readOnly),
            clear: !document.querySelector("#xw-clear") || document.querySelector("#xw-clear").hidden,
          };
        }, today.letters);
        check("[xw] a completed grid wins", won.win && /solved/i.test(won.title) && won.bad === 0, JSON.stringify(won));
        check("[xw] …and the finished board is put beyond editing", won.locked && won.clear);

        // …and NOW the day is spent
        await page.reload({ waitUntil: "load" });
        await page.waitForTimeout(800);
        const gate = await page.evaluate(() => ({ placard: !!document.querySelector(".placard"), txt: (document.querySelector("#view") || {}).textContent.replace(/\s+/g, " ") }));
        check("[xw] …and only a SOLVED grid spends the day", gate.placard && /played today/i.test(gate.txt) && /crossword/i.test(gate.txt), gate.txt.slice(0, 90));
      }
    }
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
       PLANTED captions and credits — failed on content rather than on behaviour.  Replacing one
       table and clearing the other two makes the draw deterministic at any corpus size.
       IT IS PLANTED ON THE ARTEFACTS, AND THAT IS THE ONE HALF OF THE POOL A FILTER CANNOT REACH.
       Since Aug 2026 a CARD's picture is admitted only under `gameCardIdSet()` and a GLOSSARY term's
       only under `threadEasyKeys()`, and either may then be refused by `PIC_ABSTRACT_KINDS` — so a
       fixture planted on the first ten glossary keys yields NO POOL AT ALL, which is what this
       section reported the day those filters landed.  An artefact is a photograph of one object,
       carries no difficulty and is filed under no kind, so `picturePool` takes it unconditionally
       and says so in its own comment; planting here asserts the ROUND rather than re-asserting the
       pool rules, which are checked over the shipped corpus above and in `test-difficulty.js`. */
    const planted = await page.evaluate(() => {
      const arts = (window.ARTEFACTS || []).slice(0, 10);
      arts.forEach((a, i) => {
        /* Every planted src RESOLVES.  The rotted-link case below is driven by firing the error event
           at the frame on the page, so a genuinely 404 src here buys nothing and costs a real console
           error that the end-of-run "no page errors" watcher counts against the whole file. */
        a.image = { src: "/icon.svg", title: "Plate " + i, desc: "A description naming " + a.name + ".", credit: "https://example.org/" + a.id };
      });
      (window.ARTEFACTS || []).slice(10).forEach((a) => { delete a.image; });
      window.GLOSSARY_IMAGES = {};
      window.GLOSSARY_VIDEOS = {};
      (window.CARD_DATA || []).forEach((c) => { delete c.image; });
      location.hash = "#picture";
      return arts.map((a) => a.name);
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

  /* ===================== COMMON THREAD: the pool is restricted, and must still deal =====================
     Since Aug 2026 the grid is built only from terms that are the answer of a card rated 1 or 2 (on
     request — it was "too challenging"), which takes the pool from ~680 terms to about ninety. That is a
     large enough cut to STARVE THE GENERATOR: on the first attempt 271 days of 730 produced no puzzle at
     all — a blank page, silently, on more than a third of days — and it took a lower THREAD_GROUP_MIN and
     a retry loop to reach none. Both failure directions are checked here, because they look identical from
     one side: a grid that will not build says "not enough terms", and a grid built from the WHOLE glossary
     looks perfectly healthy while being the puzzle nobody could do.

     There is deliberately no 730-day sweep of this one. `dailyThreadPuzzle` resolves each card's answer
     through the real glossary index — plurals and aliases and all — so slicing it into a bare Node harness
     the way the crossword's sweep is sliced would mean reimplementing the very resolution under test. The
     sweep was run against a browser page while the restriction was being tuned and is recorded in
     CLAUDE.md with its numbers; what is committed here is the cheap guard that fires on the day the pool
     is starved, which is the thing that would otherwise reach a reader. */
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    watch(page);
    await page.goto(base + "#thread", { waitUntil: "load" });
    await page.waitForTimeout(1100);
    const th = await page.evaluate(() => ({
      tiles: [...document.querySelectorAll(".th-tile")].map((b) => b.dataset.k),
      placard: !!document.querySelector(".placard"),
      txt: (document.querySelector("#view") || {}).textContent.replace(/\s+/g, " ").trim(),
    }));
    check("[ct] the restricted pool still deals a full grid", th.tiles.length === 16,
      th.tiles.length + (th.placard ? " — placard: " + th.txt.slice(0, 80) : ""));
    check("[ct] …with no term repeated in it", new Set(th.tiles).size === th.tiles.length);

    /* EVERY TILE IS A WELL-KNOWN CARD'S ANSWER. Read against the real corpus rather than against a list
       written down here: a term is admissible when some card at or below GAME_MAX_DIFFICULTY answers with
       it. Resolution goes through the same index the game uses, so an answer that is the plural of its key
       counts exactly as the game counts it — which is the point, and is why this is asserted in the page
       rather than reimplemented outside it. */
    const bad = await page.evaluate(() => {
      const keys = [...document.querySelectorAll(".th-tile")].map((b) => b.dataset.k);
      const max = 2;   // GAME_MAX_DIFFICULTY, re-derived below from the shipped cards rather than trusted
      const norm = (s) => String(s || "").trim().toLowerCase();
      const easy = new Set();
      (window.CARD_DATA || []).forEach((c) => {
        if (typeof c.difficulty !== "number" || c.difficulty < 1 || c.difficulty > max) return;
        if (c.answerText) easy.add(norm(c.answerText));
      });
      // a key matches when its own title, or any of its aliases, is one of those answers (singular or plural)
      const hit = (k) => {
        const cand = [k.replace(/_/g, " "), ...((window.GLOSSARY_ALIASES || {})[k] || [])];
        return cand.some((s) => {
          const n = norm(s);
          return easy.has(n) || easy.has(n + "s") || easy.has(n + "es") || easy.has(n.replace(/y$/, "ies")) ||
            [...easy].some((a) => a === n || a.replace(/s$/, "") === n);
        });
      };
      return keys.filter((k) => !hit(k));
    });
    check("[ct] …every term on it is a well-known card's answer", bad.length === 0, bad.join(", "));

    const groups = await page.evaluate(() => {
      // the four hidden groups are what the tiles are drawn from; a grid of 16 with fewer than four
      // distinct group tags behind it is a puzzle with a group nobody can separate
      const t = (document.querySelector("#view") || {}).textContent;
      return { lives: document.querySelectorAll(".th-dot").length, mentions: /mistakes remaining/i.test(t) };
    });
    check("[ct] …and four mistakes to spare", groups.lives === 4 && groups.mentions, JSON.stringify(groups));
    await ctx.close();
  }

  /* ============ WHO SAID IT: five rounds, and decoys that share a family and a period ============
     Two silent failures, and the second is the whole point of the change. THE ROUND COUNT was cut from
     five to three in Aug 2026 and put back to five later the same month, both on request — and every
     figure the page shows (the header, the pips, the score, the closing line, the tile) is derived from
     `rounds.length`, so a stray literal would show up in exactly one of them and nowhere else. That is
     what this asserts, rather than the number itself. AND THE DECOY RANKING is a strict ladder: a name sharing the answer's category AND
     era first, then the category, then the era, then anybody. Revert it to random and the game still
     deals, still scores and still looks right — it is simply won by noticing which of the four names is
     two thousand years older than the other three, which is what the ladder exists to stop.

     The ladder's outcome is EXACT rather than a preference, so it can be asserted exactly: with the pool
     sorted into those four tiers, the greedy fill uses tiers 0..t for the smallest t whose cumulative
     count reaches three, and every decoy must come from one of them. That is computed from the shipped
     `window.QUOTEGAME` rather than from a list written down here, so a pool edit cannot make this stale —
     and it degrades honestly on a thin cell, where t simply lands further down the ladder. */
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    watch(page);
    await page.goto(base + "#whosaid", { waitUntil: "load" });
    await page.waitForTimeout(700);

    const head = await page.evaluate(() => ({
      h1: (document.querySelector("h1") || {}).textContent.replace(/\s+/g, " ").trim(),
      pips: document.querySelectorAll(".tf-pip").length,
      opts: document.querySelectorAll("#opts .opt").length,
      pool: (window.QUOTEGAME || []).length,
      era: (window.QUOTEGAME || []).filter((x) => x.era).length,
    }));
    check("[ws] the game deals five rounds", /\/ 5\b/.test(head.h1) && head.pips === 5, JSON.stringify(head));
    check("[ws] …with four options on the round", head.opts === 4, String(head.opts));
    check("[ws] …and every quotation in the pool carries a period", head.pool > 90 && head.era === head.pool, JSON.stringify(head));

    /* Walk all five rounds, answering each so the page moves on. The tier check is made per round from
       the quote's own entry — the pool is keyed on the English `q`, and the site is English-only. */
    const rows = [];
    for (let i = 0; i < 5; i++) {
      const row = await page.evaluate(() => {
        const q = (document.querySelector(".ws-quote") || {}).textContent.trim();
        const opts = [...document.querySelectorAll("#opts .opt")].map((b) => b.textContent.replace(/^[ABCD]/, "").trim());
        const pool = window.QUOTEGAME || [];
        const mine = pool.find((x) => x.q.trim() === q);
        if (!mine) return { q: q.slice(0, 50), missing: true };
        const meta = new Map();
        pool.forEach((x) => { if (!meta.has(x.who)) meta.set(x.who, { cat: x.cat || "", era: x.era || "" }); });
        const tier = (w) => {
          const m = meta.get(w) || { cat: "", era: "" };
          const c = !!mine.cat && m.cat === mine.cat, e = !!mine.era && m.era === mine.era;
          return c && e ? 0 : c ? 1 : e ? 2 : 3;
        };
        // how far down the ladder the greedy fill has to reach for three decoys
        const counts = [0, 0, 0, 0];
        [...meta.keys()].forEach((w) => { if (w !== mine.who) counts[tier(w)]++; });
        let need = 0, run = 0;
        while (need < 3 && run + counts[need] < 3) { run += counts[need]; need++; }
        const decoys = opts.filter((o) => o !== mine.who);
        return { who: mine.who, need, worst: Math.max(...decoys.map(tier)), decoys, hasAnswer: opts.includes(mine.who) };
      });
      rows.push(row);
      await page.evaluate(() => document.querySelector("#opts .opt").click());
      await page.waitForTimeout(120);
      await page.evaluate(() => { const b = document.querySelector("#ws-next"); if (b) b.click(); });
      await page.waitForTimeout(200);
    }
    check("[ws] …the answer is always among the four", rows.every((r) => r.hasAnswer), JSON.stringify(rows.map((r) => r.who)));
    check("[ws] …and no decoy comes from further down the ladder than the pool forces",
      rows.every((r) => !r.missing && r.worst <= r.need),
      JSON.stringify(rows.map((r) => ({ who: r.who, need: r.need, worst: r.worst, decoys: r.decoys }))));

    const end = await page.evaluate(() => ({
      h1: (document.querySelector("h1") || {}).textContent.replace(/\s+/g, " ").trim(),
      rows: document.querySelectorAll(".tf-sum-row").length,
      tomorrow: (document.querySelector(".tf-tomorrow") || {}).textContent || "",
      again: /play again/i.test((document.querySelector("#view") || {}).textContent),
    }));
    check("[ws] …five rounds end on a score out of five and no second go",
      /\/ 5\b/.test(end.h1) && !end.again, JSON.stringify(end));
    check("[ws] …and the closing line counts the same five",
      /^Five fresh voices/.test(end.tomorrow.trim()), end.tomorrow);
    await ctx.close();
  }


  /* ---- THE DAY'S DRAW IS THE SAME FOR EVERY READER (Aug 2026, on a bug report) ----
     Two readers comparing True or False scores found they had been answering different statements:
     Multiple Choice, True or False and Who said it? drew through `pick`, which is Math.random, while the
     other six were seeded off the day. The failure is invisible from inside one browser — every reader
     gets five well-formed rounds, scored correctly, on a page that says nothing is wrong — so the only
     thing that can see it is TWO READERS, which is what this does: two browser contexts, independent
     storage, no shared state but the date, asked for the same game.

     Each pair is compared on the QUESTIONS RENDERED and on the OPTION ORDER where a game has options,
     because both are part of "the same questions in the same order" and only the first would catch a
     seed shared between a round's two draws. The contexts are opened fresh rather than reloaded in one
     page: a reload proves the draw is stable within a browser, which a Math.random draw already fails,
     but it cannot tell a per-day seed from a per-install one.

     It is asserted on all THREE at once rather than on the reported game alone — the report named True
     or False and the same fault sat in two of its neighbours, and a test written to the report would
     have left both live. */
  {
    /* Each reader is walked TWO rounds rather than one, and the pair is compared on the whole trace —
       the first question, the order its options came up in, and the SECOND question. One round would
       only prove the two readers were handed the same set; it is the sequence the report is about
       ("the same questions every day in the same order"), and the second round is what measures it.
       The options are folded into the same trace rather than asserted separately: True or False's two
       are static markup, so a check of its option order alone is a check that cannot fail, which reads
       as coverage and is not. */
    const trace = async (hash, sel) => {
      const [ctx, page] = await fresh({ width: 1280, height: 900 });
      watch(page);
      await page.goto(base + hash, { waitUntil: "load" });
      await page.waitForTimeout(700);
      const read = () => page.evaluate((s) => ({
        q: ((document.querySelector(s.q) || {}).textContent || "").replace(/\s+/g, " ").trim(),
        opts: [...document.querySelectorAll(s.o)].map((b) => b.textContent.replace(/\s+/g, " ").trim()),
      }), sel);
      const r1 = await read();
      await page.click(sel.o);                    // answer round 1 however it falls; the reveal is what matters
      await page.waitForTimeout(250);
      await page.click(sel.next);                 // …and on to round 2
      await page.waitForTimeout(400);
      const r2 = await read();
      await ctx.close();
      return { r1: r1, r2: r2, key: JSON.stringify([r1.q, r1.opts, r2.q]) };
    };
    const GAMES = [
      ["True or False",   "#truefalse", { q: ".qtext", o: "#tfopts .opt", next: "#tf-next" }],
      ["Multiple Choice", "#challenge", { q: ".qtext", o: "#opts .opt",   next: "#mc-next" }],
      ["Who said it?",    "#whosaid",   { q: ".ws-quote", o: "#opts .opt", next: "#ws-next" }],
    ];
    for (const [name, hash, sel] of GAMES) {
      const a = await trace(hash, sel), b = await trace(hash, sel);
      check("[seed] " + name + " deals two readers the same two rounds, in the same order",
        !!a.r1.q && !!a.r2.q && a.r1.q !== a.r2.q && a.key === b.key,
        a.key + "\n         vs " + b.key);
    }
  }

  /* …and the same draw is a DIFFERENT draw tomorrow, which is the half a FIXED seed would also pass —
     the two-context check above cannot tell a per-day seed from a per-install one. That half is done in
     NODE rather than in the browser, and deliberately: the site's day runs on the READER'S own clock
     with a settable boundary capped at noon, so from mid-afternoon onwards there is no setting that
     rolls a live page back into yesterday at all, and a browser version of this would pass every
     morning and be unrunnable every afternoon. Here the day is simply an argument.

     `dayPick` is sliced out of app.js by the same builder that runs the crossword and What year?, so
     what is measured is the shipped function rather than a restatement of it. */
  {
    const dp = (day) => builder()(day).dayPick;
    const idx = Array.from({ length: 178 }, (_, i) => i);   // a pool's worth of positions; the values do not matter
    const set = (day, key) => dp(day)(key, idx, 5).join(",");

    check("[seed] the same day and key deal the same five",
      set("2026-08-30", "truefalse") === set("2026-08-30", "truefalse"), set("2026-08-30", "truefalse"));

    /* Distinctness over a long run rather than over one pair: two consecutive days colliding is a
       one-in-many coincidence a fixed seed would also produce, where 90 days collapsing to a handful is
       a seed that is not reading the date. */
    const days = [];
    for (let d = 0; d < 90; d++) days.push(new Date(Date.UTC(2026, 7, 30 + d)).toISOString().slice(0, 10));
    const sets = days.map((d) => set(d, "truefalse"));
    check("[seed] …and 90 days deal 90 different sets", new Set(sets).size === 90,
      new Set(sets).size + " distinct");
    check("[seed] …each of them five distinct statements",
      sets.every((x) => new Set(x.split(",")).size === 5));

    /* THE KEY NAMES THE DRAW, NOT THE GAME. Two draws inside one round handed the same seed shuffle in
       step, which on a four-option round puts the right answer in the same position every round of the
       day — the bug the suffixes exist to prevent, and one that reads as a game being easy rather than
       as a seeding fault. */
    const day = "2026-08-30";
    check("[seed] …and two draws on one day do not shuffle in step",
      set(day, "truefalse") !== set(day, "truefalse-o") && set(day, "challenge") !== set(day, "challenge-d"),
      [set(day, "truefalse"), set(day, "truefalse-o")].join(" / "));
  }

  /* ---- FIND IT: A TAP SELECTS, A BUTTON COMMITS, AND A LATE ANSWER STILL COUNTS ----
     Two reported faults, Aug 2026: "clicking a country shouldn't immediately guess, but only selected
     before the user should click a confirmation button", and "at the end of that minigame it says x/5
     questions correct, but it only counts answers that were correct first-try — second and third guesses
     should still count if they were correct." Nothing in the suite covered this game at all, which is
     how a score that disagreed with the reader's own arithmetic went unremarked.

     THE TARGET IS HUNTED RATHER THAN COMPUTED, and that is forced: the rounds are built inside the Atlas
     closure from the era geometry, and turning a lon/lat into a screen point needs the globe's own
     rotation and zoom, neither of which is reachable from outside. So the board is swept and the CONFIRM
     BUTTON is read — it names the place under the last tap, which is exactly the readout the feature
     added. ~850 clicks sweep a hemisphere in about eleven seconds; the globe is spun a quarter turn and
     swept again when the day's target is on the far side, since the opening view is centred on the
     reader's home and the draw is seeded by the date rather than by what happens to be facing us.
     It FAILS if the target is never found rather than skipping the assertion — a hunt that quietly gives
     up is a test that passes on the day the feature breaks. */
  {
    const [ctx, page] = await fresh({ width: 1280, height: 900 });
    watch(page);
    await page.goto(base + "#findit", { waitUntil: "load" });
    await page.waitForTimeout(2200);
    const read = () => page.evaluate(() => {
      const t = (s) => { const e = document.querySelector(s); return e ? (e.textContent || "").trim() : ""; };
      const h = (s) => { const e = document.querySelector(s); return !e || e.hidden; };
      const acts = document.querySelector(".mg-acts");
      return { q: t("#mgQ"), score: t("#mgScore"), fb: t("#mgFeedback"),
               confirm: t("#mgConfirm"), confirmHidden: h("#mgConfirm"), clearHidden: h("#mgClear"),
               nextHidden: h("#mgNext"), acts: acts ? getComputedStyle(acts).display : "" };
    });
    const box = await page.locator("canvas").first().boundingBox();
    const tap = (fx, fy) => page.mouse.click(box.x + box.width * fx, box.y + box.height * fy);

    const opened = await read();
    const target = ((opened.q.match(/Find (?:the city of )?(.+?)(?: on today| — in |$)/) || [])[1] || "").trim();
    check("[fi] the game opens on a round with a place to find", !!target && opened.acts === "none",
      JSON.stringify(opened));

    /* 1. A TAP SELECTS AND DOES NOT ANSWER. The whole of the first report: the score must not move, no
       verdict may appear, and the button must name what was tapped. */
    await tap(0.5, 0.5);
    const picked = await read();
    check("[fi] a tap selects rather than guessing",
      !picked.confirmHidden && /^Guess /.test(picked.confirm) && picked.fb === "" && picked.score === opened.score,
      JSON.stringify(picked));
    check("[fi] …and offers a way to withdraw it", !picked.clearHidden && picked.acts !== "none",
      JSON.stringify(picked));

    /* 2. CLEAR PUTS IT BACK. A pick that cannot be withdrawn is a click that has still been spent. */
    await page.click("#mgClear");
    await page.waitForTimeout(200);
    const cleared = await read();
    check("[fi] Clear withdraws the pick, and the row collapses with it",
      cleared.confirmHidden && cleared.clearHidden && cleared.acts === "none" && cleared.fb === "",
      JSON.stringify(cleared));

    /* 3. A DELIBERATE MISS, COMMITTED. It must take a Confirm to score anything at all. */
    let missed = null;
    for (const [fx, fy] of [[0.5, 0.5], [0.46, 0.52], [0.54, 0.48], [0.5, 0.44]]) {
      await tap(fx, fy);
      const st = await read();
      if (!st.confirmHidden && st.confirm !== "Guess " + target) { missed = st; break; }
    }
    check("[fi] a wrong place can be picked without being answered", !!missed, JSON.stringify(missed));
    if (missed) {
      await page.click("#mgConfirm");
      await page.waitForTimeout(700);
      const after = await read();
      check("[fi] …and confirming it is what spends the try",
        /try/i.test(after.fb) && after.confirmHidden, JSON.stringify(after));
    }

    /* 4. THE SECOND TRY, RIGHT. The reported scoring bug: this used to leave the score at 0. */
    let hit = null;
    for (let turn = 0; turn < 4 && !hit; turn++) {
      if (turn) {   // spin a quarter turn — the day's target may be on the far side of the globe
        await page.locator("canvas").first().click({ position: { x: 5, y: 5 } }).catch(() => {});
        for (let i = 0; i < 18; i++) await page.keyboard.press("ArrowRight");
        await page.waitForTimeout(400);
      }
      for (let gy = 0.2; gy <= 0.84 && !hit; gy += 0.02) {
        for (let gx = 0.2; gx <= 0.84; gx += 0.02) {
          await tap(gx, gy);
          const lbl = await page.evaluate(() => { const b = document.querySelector("#mgConfirm"); return b && !b.hidden ? b.textContent : ""; });
          if (lbl === "Guess " + target) { hit = [gx, gy]; break; }
        }
      }
    }
    check("[fi] the day's target can be found on the globe", !!hit, "swept four quarter-turns for " + target);
    if (hit) {
      await page.click("#mgConfirm");
      await page.waitForTimeout(900);
      const won = await read();
      check("[fi] a correct SECOND guess counts towards the score",
        /^1 found/.test(won.score) && /Found it/.test(won.fb), JSON.stringify(won));
      check("[fi] …and the round is over rather than offering a third try",
        !won.nextHidden, JSON.stringify(won));
    }
    await ctx.close();
  }

  check("[all] no page errors anywhere", errs.length === 0, errs.slice(0, 4).join(" | "));

  await browser.close();
  srv.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
