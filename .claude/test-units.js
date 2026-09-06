#!/usr/bin/env node
/* Folio — the two Settings that rewrite what is already on the page.
   ==================================================================
   Both fail SILENTLY, which is why they are worth a file.

     · MEASUREMENTS. The content is authored metric-first with the imperial equivalent in brackets and the
       reader is shown ONE of the two (see the "Measurements: ONE system" bullet in CLAUDE.md). That is a
       regex over every text node on the page, so its two failure modes are a bracket it fails to recognise
       — leaving both systems on screen, which looks like the feature was never built — and a bracket it
       recognises WRONGLY, eating an ordinary parenthesis out of a sentence, which looks like a typo in the
       card. Neither throws. Neither is visible to a syntax check. The corpus sweep at the end is the one
       that matters most: it runs the real transform over all 119 cards and every glossary term and demands
       0 missed and 0 touched-in-error.
     · LIGHT / DARK FROM THE DEVICE. A first-time visitor follows the operating system. The migration is the
       part that can strand someone: an existing reader chose their `night` by hand, and defaulting THEM to
       the system would flip the site under someone who had already decided.

   Run:  NODE_PATH=<playwright>/node_modules node .claude/test-units.js
   Env:  FOLIO_CHROMIUM=<path to chrome> if Chromium lives outside the playwright package. */

const path = require("path");
const http = require("http");
const fs = require("fs");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");

const ROOT = path.join(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png" };

let pass = 0, fail = 0;
function check(name, ok, extra) {
  if (ok) { pass++; console.log("ok    " + name + (extra ? "  " + extra : "")); }
  else { fail++; console.log("FAIL  " + name + (extra ? "  " + extra : "")); }
}

function serve() {
  return http.createServer((req, res) => {
    const u = decodeURIComponent(req.url.split("?")[0]);
    const f = path.join(ROOT, u === "/" ? "index.html" : u);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end("not found"); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" });
    fs.createReadStream(f).pipe(res);
  });
}

// Put a sentence on the live page and read back what the reader would see. The transform runs on text
// NODES from a MutationObserver, so this exercises the real path rather than calling the helper directly.
async function shown(page, html) {
  return page.evaluate(async (h) => {
    const el = document.createElement("p");
    el.innerHTML = h;
    document.querySelector("#view .page").appendChild(el);
    await new Promise((r) => setTimeout(r, 150));
    const t = el.textContent;
    el.remove();
    return t;
  }, html);
}

(async () => {
  const srv = serve();
  await new Promise((r) => srv.listen(0, r));
  const base = "http://127.0.0.1:" + srv.address().port + "/";
  const browser = await chromium.launch(LAUNCH);
  const errs = [];
  const watch = (p) => {
    p.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !isNoise(t)) errs.push(t); });
    p.on("pageerror", (e) => errs.push(String(e)));
  };

  /* ================= 1. measurements, both ways ================= */
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    watch(page);
    await page.goto(base, { waitUntil: "load" });
    await page.waitForTimeout(1000);

    check("metric is the default",
      await page.evaluate(() => document.querySelector('#unitPick [data-units="metric"]') === null || true) &&
      /37 kilometres east/.test(await shown(page, "The gorge runs about 37 kilometres (23 miles) east.")));
    const m = await shown(page, "It stands 130 metres (430 feet) above an area of 18,272 km² (7,055 sq mi).");
    check("...and drops every imperial bracket", /130 metres above/.test(m) && /18,272 km²\.?$/.test(m.trim()) && !/feet|sq mi/.test(m), m);

    await page.evaluate(() => { location.hash = "settings"; });
    await page.waitForTimeout(600);
    check("Settings offers the picker", await page.evaluate(() => document.querySelectorAll("#unitPick [data-units]").length) === 2);
    await page.evaluate(() => document.querySelector('#unitPick [data-units="imperial"]').click());
    await page.waitForTimeout(700);
    check("the choice is stored", await page.evaluate(() => (JSON.parse(localStorage.getItem("folio_v1")).settings || {}).units) === "imperial");

    const i1 = await shown(page, "The gorge runs about 37 kilometres (23 miles) east.");
    check("imperial swaps the figure in, keeping the qualifier", i1.trim() === "The gorge runs about 23 miles east.", i1);
    const i2 = await shown(page, "Males average about 151 centimetres (4 ft 11 in) and females 105 (3 ft 5 in).");
    check("...including a second figure that shares the first's unit", /about 4 ft 11 in and females 3 ft 5 in/.test(i2), i2);
    const i3 = await shown(page, "They stand between roughly 100 and 135 centimetres (3 ft 3 in and 4 ft 5 in).");
    check("...and a range, which converts as one", /between roughly 3 ft 3 in and 4 ft 5 in/.test(i3), i3);
    const i4 = await shown(page, "Greenland is about 2.2 million km² (850,000 sq mi), reached by a 175-metre (574-foot) tunnel.");
    check("...at word scale, and hyphenated before a noun", /about 850,000 sq mi/.test(i4) && /a 574-foot tunnel/.test(i4), i4);

    // the guard: an ordinary bracket is not a measurement
    const keep = await shown(page, "In the 1920s (about 30 years later) he returned to Java (Indonesia), in Sector 4 (in 1892).");
    check("an ordinary parenthesis survives both modes",
      /\(about 30 years later\)/.test(keep) && /\(Indonesia\)/.test(keep) && /\(in 1892\)/.test(keep), keep);
    // a scientific unit has no imperial twin and must be left exactly as written
    const sci = await shown(page, "Its cranial capacity is 940 cubic centimetres, dated to 780,000 years ago.");
    check("a scientific figure is untouched", /940 cubic centimetres/.test(sci) && /780,000 years ago/.test(sci), sci);

    // switching back rebuilds from the source, so nothing is lost by having been converted once
    await page.evaluate(() => document.querySelector('#unitPick [data-units="metric"]').click());
    await page.waitForTimeout(700);
    check("switching back restores the metric figure",
      /37 kilometres east/.test(await shown(page, "The gorge runs about 37 kilometres (23 miles) east.")));

    /* The store must never see it. The editors read the same content through the same accessors, and a card
       whose stored text had lost half its measurement would be saved back that way on the next keystroke —
       which is the whole reason this is a DOM pass and not a hook in glossText()/cardLocalized(). */
    await page.evaluate(() => { const s = JSON.parse(localStorage.getItem("folio_v1")); s.settings.units = "imperial"; localStorage.setItem("folio_v1", JSON.stringify(s)); });
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1200);
    const src = await page.evaluate(() => {
      const c = (window.CARD_DATA || []).find((x) => /\(\s*\d[^()]*(miles|feet|ft|inches|sq mi)/.test(x.abstract || ""));
      return c ? c.abstract.slice(c.abstract.search(/\(\s*\d[^()]*(miles|feet|ft|inches|sq mi)/) - 30, c.abstract.search(/\(\s*\d[^()]*(miles|feet|ft|inches|sq mi)/) + 24) : "";
    });
    check("the shipped data still carries BOTH figures", /\((?:[^()]*)(miles|feet|ft|inches|sq mi)/.test(src), src);

    await page.close();
  }

  /* ================= 2. the corpus sweep =================
     The transform sliced out of the real app.js and run over the real content files. This is the assertion
     that would catch a card or a term written in a shape the regex has never met. */
  {
    const app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
    const from = app.indexOf("const UNIT_SYSTEMS =");
    const to = app.indexOf("function unitizeTree");
    check("the units engine was found in app.js", from > 0 && to > from);
    if (from > 0 && to > from) {
      const src = app.slice(from, to);
      const mk = new Function("S", src + "\n return { unitizeText: unitizeText, isImperialParen: isImperialParen };");
      const U = mk({ settings: { units: "metric" } });
      const win = {};
      const load = (f) => { const g = global.window; global.window = win; delete require.cache[require.resolve(path.join(ROOT, f))]; require(path.join(ROOT, f)); global.window = g; };
      load("data.js"); load("glossary.js");
      const strip = (s) => String(s || "").replace(/<[^>]*>/g, "");
      let fields = 0, missed = [], eaten = [];
      const scan = (s, where) => {
        if (typeof s !== "string" || s.indexOf("(") < 0) return;
        const txt = strip(s);
        const met = U.unitizeText(txt, false), imp = U.unitizeText(txt, true);
        if (met !== txt) fields++;
        // anything still looking like a conversion after the metric pass was never recognised
        (met.match(/\([^()]{1,90}\)/g) || []).forEach((p) => { if (U.isImperialParen(p.slice(1, -1))) missed.push(where + " " + p); });
        // …and anything the guard accepts that carries no imperial unit at all was accepted in error
        (txt.match(/\([^()]{1,90}\)/g) || []).forEach((p) => {
          const inner = p.slice(1, -1);
          if (U.isImperialParen(inner) && !/mile|feet|foot|ft|inch|yard|pound|lb|ounce|oz|acre|ton|gallon|°F|sq/i.test(inner)) eaten.push(where + " " + p);
        });
        if (imp === txt && met !== txt) missed.push(where + " (imperial pass did nothing)");
      };
      (win.CARD_DATA || []).forEach((c) => {
        ["question", "answer", "answerDate", "abstract", "answerText"].forEach((f) => scan(c[f], c.id + "." + f));
        (c.questions || []).forEach((q, i) => scan(q, c.id + ".q" + (i + 2)));
      });
      Object.keys(win.GLOSSARY || {}).forEach((k) => scan(win.GLOSSARY[k], "gloss:" + k));
      check("the whole corpus transforms", fields > 200, fields + " fields");
      check("...with no imperial bracket left behind", missed.length === 0, missed.slice(0, 4).join(" | "));
      check("...and no other bracket taken", eaten.length === 0, eaten.slice(0, 4).join(" | "));

      /* THE INDEPENDENT SWEEP, and it is the only one here that can catch a bracket the engine does not
         RECOGNISE (Aug 2026). Every check above asks isImperialParen, so a bracket it rejects is filed as
         an ordinary bracket correctly left alone and all three pass — which is how `by`, `square` and
         `cubic` shipped unseen across 30 sites. This one decides what a measurement is WITHOUT the engine:
         a bracket holding a digit and a strong imperial unit is one, and the engine must agree. */
      const STRONG = /(?:^|[^A-Za-z])(?:miles?|feet|foot|ft|inch(?:es)?|yards?|yd|pounds?|lbs?|ounces?|oz|acres?|tons?|gallons?|°F)(?![A-Za-z])/i;
      /* AN ANCIENT UNIT IS NOT AN IMPERIAL ONE, THOUGH IT SHARES THE WORD (Sep 2026). Four Rome cards
         state a distance the source gives in ROMAN miles — 1.48 km, not 1.609 — with the metric figure
         first as the house style requires, so the bracket carries the ancient figure rather than a
         conversion. `isImperialParen` refuses it, which is exactly right: converting it would restate a
         Roman mile as an English one. The mask is a NAMED SYSTEM before the unit, never the bare unit,
         so an ordinary "(11 miles)" is still swept. */
      const ANCIENT = /(?:^|[^A-Za-z])(?:Roman|Greek|Egyptian|Attic|Olympic)\s+(?:miles?|feet|foot|inch(?:es)?|yards?|pounds?|ounces?|acres?|tons?)(?![A-Za-z])/i;
      const unknown = [];
      const sweep = (s, where) => {
        if (typeof s !== "string" || s.indexOf("(") < 0) return;
        (strip(s).match(/\([^()]{1,90}\)/g) || []).forEach((p) => {
          const inner = p.slice(1, -1);
          if (/\d/.test(inner) && STRONG.test(inner) && !ANCIENT.test(inner) && !U.isImperialParen(inner)) unknown.push(where + " " + p);
        });
      };
      (win.CARD_DATA || []).forEach((c) => {
        ["question", "answer", "answerDate", "abstract", "answerText"].forEach((f) => sweep(c[f], c.id + "." + f));
        (c.questions || []).forEach((q, i) => sweep(q, c.id + ".q" + (i + 2)));
      });
      Object.keys(win.GLOSSARY || {}).forEach((k) => sweep(win.GLOSSARY[k], "gloss:" + k));
      check("...and every measurement-looking bracket is one the engine RECOGNISES",
        unknown.length === 0, unknown.length ? unknown.length + " unseen: " + unknown.slice(0, 4).join(" | ") : "swept independently of isImperialParen");

      /* The three shapes that were unseen, pinned by hand in BOTH directions — a `by` run especially,
         since without `by` in U_JOIN the match starts at the second number and imperial mode renders
         "54 by 177 by 89 feet", which is worse than not transforming at all. */
      [
        ["a court, joined by `by`", "a central court 54 by 27 metres (177 by 89 feet).", "a central court 54 by 27 metres.", "a central court 177 by 89 feet."],
        ["an area, qualified `square`", "covers some 7,600 square metres (81,800 square feet),", "covers some 7,600 square metres,", "covers some 81,800 square feet,"],
        ["a volume, qualified `cubic`", "may reach 117 to 129 cubic kilometres (28 to 31 cubic miles),", "may reach 117 to 129 cubic kilometres,", "may reach 28 to 31 cubic miles,"],
        ["a `square` abbreviation unit", "reckoned at some 25,000 km² (9,700 square miles) and", "reckoned at some 25,000 km² and", "reckoned at some 9,700 square miles and"],
        // the sign must be CONSUMED, not merely tolerated — left outside the match it survives while the
        // bracket supplies its own, and this rendered "−−129 °F" for an hour while the fix was being made
        ["a signed temperature, once", "a low of −89.2 °C (−129 °F) there", "a low of −89.2 °C there", "a low of −129 °F there"],
        // ...and the sign is U+2212 alone: a dash HERE is a range separator, and swallowing one would take
        // the opening figure of the range with it
        ["a range dash is not a sign", "a hollow 10–7 kilometres (6 by 4 miles) across", "a hollow 10–7 kilometres across", "a hollow 6 by 4 miles across"],
        ["a hyphenated conversion still works", "a 175-metre (574-foot) drop", "a 175-metre drop", "a 574-foot drop"],
        ["the shared-unit pair still works", "averaging 151 centimetres (4 ft 11 in) and females 105 (3 ft 5 in).", "averaging 151 centimetres and females 105.", "averaging 4 ft 11 in and females 3 ft 5 in."],
        ["and an ordinary bracket is still safe", "in the 1920s (about 30 years later)", "in the 1920s (about 30 years later)", "in the 1920s (about 30 years later)"],
        ["...as is a dated aside", "Ephorus (a 4th-century historian) says", "Ephorus (a 4th-century historian) says", "Ephorus (a 4th-century historian) says"],
      ].forEach(([label, input, wantMetric, wantImperial]) => {
        const gotM = U.unitizeText(input, false), gotI = U.unitizeText(input, true);
        check(label, gotM === wantMetric && gotI === wantImperial, gotM === wantMetric && gotI === wantImperial ? "" : "metric=" + gotM + "  imperial=" + gotI);
      });
    }
  }

  /* ================= 3. light / dark from the device ================= */
  for (const scheme of ["dark", "light"]) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, colorScheme: scheme });
    watch(page);
    await page.goto(base + "#settings", { waitUntil: "load" });
    await page.waitForTimeout(1100);
    const r = await page.evaluate(() => ({
      night: document.body.classList.contains("night"),
      auto: document.querySelector("#sw-themeAuto").classList.contains("on"),
      // the manual switch stays on the page while the device decides — dimmed, not removed: a reader has to
      // be able to SEE that the site knows it is dark, and clicking it is the way back to deciding
      manual: !!document.querySelector("#sw-night") && document.querySelector("#sw-night").checkVisibility(),
      shows: document.querySelector("#sw-night").classList.contains("on"),
    }));
    check("[" + scheme + "] a first visit follows the device", r.night === (scheme === "dark"), JSON.stringify(r));
    check("[" + scheme + "] ...with Match my device on", r.auto, JSON.stringify(r));
    check("[" + scheme + "] ...and Night mode still shown, reading true", r.manual && r.shows === (scheme === "dark"), JSON.stringify(r));
    await page.close();
  }
  {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, colorScheme: "dark" });
    watch(page);
    await page.goto(base + "#settings", { waitUntil: "load" });
    await page.waitForTimeout(1100);
    await page.evaluate(() => document.querySelector("#sw-night").click());
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => { const s = JSON.parse(localStorage.getItem("folio_v1")).settings; return { auto: s.themeAuto, night: s.night, body: document.body.classList.contains("night") }; });
    check("flipping Night by hand takes the decision back from the device", after.auto === false && after.night === false && after.body === false, JSON.stringify(after));
    // …and it stays taken across a reload, under a dark system
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(900);
    check("...and it holds across a reload", await page.evaluate(() => !document.body.classList.contains("night")));
    await page.close();
  }
  {
    /* The migration, which is the one way this change could strand somebody: a save made before it existed
       carries a `night` its reader chose, and must NOT be handed to the operating system. */
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, colorScheme: "dark" });
    watch(page);
    await page.goto(base, { waitUntil: "load" });
    await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem("folio_v1") || "{}");
      s.settings = Object.assign({}, s.settings, { night: false, theme: "folio" });
      delete s.settings.themeAuto;                       // an older settings object cannot carry the key
      localStorage.setItem("folio_v1", JSON.stringify(s));
    });
    await page.goto(base + "#settings", { waitUntil: "load" });
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(1100);
    const old = await page.evaluate(() => ({
      night: document.body.classList.contains("night"),
      auto: document.querySelector("#sw-themeAuto").classList.contains("on"),
    }));
    check("an existing save keeps the light/dark it chose, under a dark system", !old.night && !old.auto, JSON.stringify(old));
    await page.close();
  }

  check("no console or page errors", errs.length === 0, errs.slice(0, 3).join(" | "));
  await browser.close();
  srv.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
