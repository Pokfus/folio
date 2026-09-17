#!/usr/bin/env node
// Regression test for TRUE OR FALSE's explanations — the gloss links, the citations, and the two
// reader-settings passes that reach them (Sep 2026, on request: "'True or False' minigame explanations
// should have gloss terms, source citations and metric/imperial uk/us versions").
//
//   node .claude/test-truefalse.js
//
// Re-run after touching tfWhyHTML / tfWireWhy / PAGES.truefalse's reveal and summary / sourcesHTML's
// `shut` and `compact` options / wireFootnotes / autoLinkGlossary / unitizeTree / spellTree, or
// .claude/add-truefalse.js and .claude/check-truefalse.js.
//
// WHY IT SERVES A POOL OF ITS OWN. The day's five statements are drawn from 220 by `dayPick`, and only
// some of them carry a source — so a suite run against the real pool would assert nothing on most days
// and would be a coin toss on the rest, which is the shape of a test that passes while the feature is
// broken. The server substitutes a five-statement pool in which every statement is cited, one carries a
// measurement and one an American-convertible spelling, so the draw cannot avoid them. The SHIPPED pool
// is still checked, in Node, for the things a fixture cannot see: that it parses, that its citations
// carry URLs, and that its own checker passes.
//
// EVERY ONE OF THESE FAILS SILENTLY. An escaped `why` prints its own tags and drops its markers; a
// marker with no entry behind it is REMOVED by `wireFootnotes`, so the sentence merely loses a number;
// an unlinked glossary term looks like a term Folio does not have; and a figure with no bracket is
// simply shown in metric to a reader who asked for feet.
"use strict";
const http = require("http"), fs = require("fs"), path = require("path"), cp = require("child_process");
const { chromium } = require("playwright");
const ROOT = path.join(__dirname, "..");
const { isNoise } = require("./test-noise.js");
let pass = 0, fail = 0;
const ok = (n, c, x) => { if (c) { pass++; console.log("  ok    " + n); } else { fail++; console.log("FAIL  " + n + (x ? "  " + String(x).slice(0, 220) : "")); } };
const sect = (s) => console.log("\n" + s);
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png" };

/* The fixture pool. EVERY statement carries the same three things — a glossary term, an element that an
   escaped `why` would print as tags, and a citation with a marker — because `dayPick` decides which round
   is dealt FIRST and an assertion that reads only that round is a coin toss on the fixture's own order.
   #2 additionally carries a measurement with its imperial bracket and a British spelling, which section 3
   walks to rather than assumes. */
const TERM = "the <b>Bronze Age</b>";
const FIX = [
  { q: "Fixture one: the first statement is true.", a: true,
    why: "The first fixture statement is true, and it names " + TERM + " in <i>a work with a title</i>.<sup class=\"fn\" data-fn=\"1\"></sup>",
    cat: "Fixture", src: ["A. Author, \u201cFirst Fixture,\u201d <i>Journal of Fixtures</i> 1 (2026): 1\u20132, https://example.org/one. [Open access]"] },
  { q: "Fixture two: this one is false.", a: false,
    why: "It is false: in " + TERM + " the wall of <i>a work with a title</i> ran 100 metres (330 feet), and its colour is grey.<sup class=\"fn\" data-fn=\"1\"></sup><sup class=\"fn\" data-fn=\"2\"></sup>",
    cat: "Fixture", src: ["B. Author, \u201cSecond Fixture,\u201d <i>Journal of Fixtures</i> 2 (2026): 3\u20134, https://example.org/two. [Open access]",
                          "C. Author, \u201cThird Fixture,\u201d <i>Journal of Fixtures</i> 3 (2026): 5\u20136, https://example.org/three. [Paywalled]"] },
  { q: "Fixture three: also true.", a: true,
    why: "True of " + TERM + ", and it cites <i>a work with a title</i>.<sup class=\"fn\" data-fn=\"1\"></sup>",
    cat: "Fixture", src: ["D. Author, \u201cFourth Fixture,\u201d <i>Journal of Fixtures</i> 4 (2026): 7\u20138, https://example.org/four. [Open access]"] },
  { q: "Fixture four: false again.", a: false,
    why: "False of " + TERM + ", says <i>a work with a title</i>.<sup class=\"fn\" data-fn=\"1\"></sup>",
    cat: "Fixture", src: ["E. Author, \u201cFifth Fixture,\u201d <i>Journal of Fixtures</i> 5 (2026): 9\u201310, https://example.org/five. [Open access]"] },
  { q: "Fixture five: true once more.", a: true,
    why: "True of " + TERM + ", says <i>a work with a title</i>.<sup class=\"fn\" data-fn=\"1\"></sup>",
    cat: "Fixture", src: ["F. Author, \u201cSixth Fixture,\u201d <i>Journal of Fixtures</i> 6 (2026): 11\u201312, https://example.org/six. [Open access]"] },
];
const FIXTURE_JS = "window.TRUEFALSE = " + JSON.stringify(FIX) + ";";

const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split("?")[0]).replace(/^\//, "") || "index.html";
  if (rel === "truefalse.js") {
    res.writeHead(200, { "Content-Type": "text/javascript" });
    return res.end(FIXTURE_JS);
  }
  const p = path.join(ROOT, rel);
  fs.readFile(p, (e, buf) => {
    if (e) { res.writeHead(404); res.end("not found"); return; }
    res.writeHead(200, { "Content-Type": MIME[path.extname(p)] || "application/octet-stream" });
    res.end(buf);
  });
});

(async () => {
  server.listen(0);
  const base = "http://127.0.0.1:" + server.address().port + "/";

  /* ---------- 1. the shipped pool, with no browser ---------------------------------------- */
  sect("1. the pool on disk");
  const win = {};
  new Function("window", fs.readFileSync(path.join(ROOT, "truefalse.js"), "utf8"))(win);
  const POOL = win.TRUEFALSE || [];
  ok("the shipped pool parses", Array.isArray(POOL) && POOL.length > 150, POOL.length + " statements");
  const cited = POOL.filter((x) => Array.isArray(x.src) && x.src.length);
  ok("some of it is cited", cited.length > 0, cited.length + " of " + POOL.length);
  const badUrl = cited.filter((x) => x.src.some((s) => !/https?:\/\/[^\s<>"']+/.test(s)));
  ok("...and every citation carries a URL a reader can open", badUrl.length === 0, badUrl.map((x) => x.q).slice(0, 2).join(" | "));
  const badMark = cited.filter((x) => {
    const ns = [...String(x.why).matchAll(/data-fn="(\d+)"/g)].map((m) => +m[1]);
    return !ns.length || ns.some((n) => n < 1 || n > x.src.length);
  });
  ok("...and every marker points at a source that exists", badMark.length === 0, badMark.map((x) => x.q).slice(0, 2).join(" | "));
  /* The pool's own checker has the last word — it is what holds the prose to British spelling and to
     metric-first, which no assertion here could see. */
  const chk = cp.spawnSync(process.execPath, [path.join(__dirname, "check-truefalse.js")], { encoding: "utf8" });
  ok("check-truefalse.js passes over the shipped pool", chk.status === 0, (chk.stdout || "").split("\n").slice(-3).join(" "));

  /* ---------- 2. the explanation on screen ------------------------------------------------ */
  sect("2. the reveal: links, citations and a numbered marker");
  const browser = await chromium.launch(process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {});
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !isNoise(t)) errs.push(t); });
  page.on("pageerror", (e) => errs.push("PAGEERROR " + e.message));
  await page.addInitScript(() => { try { localStorage.setItem("folio_tour_v1", "1"); } catch (e) {} });
  await page.goto(base + "#truefalse", { waitUntil: "load" });
  await page.waitForTimeout(1500);
  ok("the fixture pool is what was dealt", /Fixture/.test(await page.evaluate(() => (document.querySelector(".qtext") || {}).textContent || "")));

  await page.click("#tfopts .opt[data-v='1']");
  await page.waitForTimeout(500);
  const rev = await page.evaluate(() => {
    const r = document.querySelector("#tfreveal");
    if (!r) return null;
    const sup = r.querySelector("sup.fn");
    return {
      why: (r.querySelector(".tf-why") || {}).innerHTML || "",
      whyText: (r.querySelector(".tf-why") || {}).textContent || "",
      note: !!r.querySelector(".src-note"),
      items: r.querySelectorAll(".src-item").length,
      shut: !!r.querySelector(".src-collapse.collapsed"),
      nopref: !!r.querySelector(".src-note.src-nopref"),
      supText: sup ? sup.textContent : null,
      supRole: sup ? sup.getAttribute("role") : null,
      links: r.querySelectorAll(".src-item a").length,
      tips: r.querySelectorAll(".tf-why .ttip").length,
    };
  });
  ok("the explanation renders", !!rev && rev.whyText.length > 5, rev && rev.whyText.slice(0, 60));
  ok("...as HTML rather than escaped — no printed tags", !!rev && rev.whyText.indexOf("<sup") < 0 && /<b>|<i>/.test(rev.why), rev && rev.whyText.slice(0, 80));
  ok("...with a Sources fold under it", !!rev && rev.note && rev.items > 0, rev && JSON.stringify({ note: rev.note, items: rev.items }));
  /* SHUT, and WITHOUT writing the reader's own preference — `src-nopref` is what keeps a fold opened in a
     game from opening every card the reader studies afterwards. */
  ok("...collapsed, and not touching the reader's card preference", !!rev && rev.shut && rev.nopref, rev && JSON.stringify({ shut: rev.shut, nopref: rev.nopref }));
  ok("...the marker is NUMBERED and is a control", !!rev && rev.supText === "1" && rev.supRole === "button", rev && JSON.stringify({ t: rev.supText, r: rev.supRole }));
  ok("...the citation's URL is a link", !!rev && rev.links > 0, rev && rev.links);
  ok("...and a glossary term in the prose is linked", !!rev && rev.tips > 0, rev && rev.tips);

  /* ---------- 3. the units and the spelling reach it -------------------------------------- */
  sect("3. the reader's own measurements and spelling");
  const readRound2 = async (settings) => {
    const c2 = await browser.newContext({ viewport: { width: 1200, height: 900 } });
    const p2 = await c2.newPage();
    await p2.addInitScript((s) => {
      try { localStorage.setItem("folio_v1", JSON.stringify({ settings: s })); } catch (e) {}
    }, settings);
    await p2.goto(base + "#truefalse", { waitUntil: "load" });
    await p2.waitForTimeout(1400);
    // walk to the round whose statement carries the measurement
    for (let i = 0; i < 5; i++) {
      const q = await p2.evaluate(() => (document.querySelector(".qtext") || {}).textContent || "");
      await p2.click("#tfopts .opt[data-v='1']");
      await p2.waitForTimeout(350);
      const t = await p2.evaluate(() => (document.querySelector(".tf-why") || {}).textContent || "");
      if (/metres|feet/.test(t)) { await c2.close(); return t; }
      const nx = await p2.$("#tf-next");
      if (!nx) break;
      await nx.click();
      await p2.waitForTimeout(350);
    }
    await c2.close();
    return "";
  };
  const metric = await readRound2({ units: "metric", spelling: "en-GB", sfx: false });
  const imperial = await readRound2({ units: "imperial", spelling: "en-US", sfx: false });
  ok("a metric reader is shown metres and no brackets", /100 metres/.test(metric) && !/330 feet/.test(metric), metric.slice(0, 120));
  ok("an imperial reader is shown feet instead", /330 feet/.test(imperial) && !/100 metres/.test(imperial), imperial.slice(0, 120));
  ok("...and their American spelling with it", /color/.test(imperial) && /colour/.test(metric), JSON.stringify({ us: /color/.test(imperial), gb: /colour/.test(metric) }));

  /* ---------- 4. the summary ------------------------------------------------------------- */
  sect("4. the results screen carries the same apparatus");
  for (let i = 0; i < 6; i++) {
    const nx = await page.$("#tf-next");
    if (!nx) break;
    await nx.click();
    await page.waitForTimeout(300);
    const o = await page.$("#tfopts .opt[data-v='1']");
    if (o) { await o.click(); await page.waitForTimeout(300); }
  }
  await page.waitForTimeout(400);
  const sum = await page.evaluate(() => {
    const s = document.querySelector(".tf-summary");
    if (!s) return null;
    return {
      rows: s.querySelectorAll(".tf-sum-row").length,
      notes: s.querySelectorAll(".src-note").length,
      compact: s.querySelectorAll(".src-note.src-compact").length,
      numbered: [...s.querySelectorAll("sup.fn")].map((x) => x.textContent).join(","),
      tips: s.querySelectorAll(".ttip").length,
    };
  });
  ok("the summary lists all five", !!sum && sum.rows === 5, sum && sum.rows);
  ok("...each with its own Sources fold", !!sum && sum.notes === 5, sum && JSON.stringify({ notes: sum.notes }));
  ok("...drawn compact, which is what a five-row list has room for", !!sum && sum.compact === 5, sum && sum.compact);
  /* PER ROW, so each list is numbered from 1 rather than 1..7 down the page — `wireFootnotes` finds one
     `.src-note` per scope, which is why the summary wires rows and not the page. */
  ok("...and numbered per row rather than down the page", !!sum && /^1(,[12])*$/.test(sum.numbered), sum && sum.numbered);
  ok("...with the glossary still linked", !!sum && sum.tips > 0, sum && sum.tips);

  ok("no console errors anywhere", errs.length === 0, errs.slice(0, 2).join(" | "));
  await browser.close();
  server.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
