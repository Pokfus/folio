#!/usr/bin/env node
/*
  The Atlas's label crowding, its heightmap strength slider, and a glossary term's way onto the map
  (Aug 2026). Every one of these fails silently — a map that quietly writes forty overlapping names looks
  like a map, a slider that does nothing looks like a slider, and a marker that flies you somewhere and
  highlights nothing looks like a flight.

    · city labels THIN OUT with zoom: no two overlap at any zoom, and zooming in reveals more of them
    · the Heightmap row carries a strength slider, shown only while the layer is on, live and remembered
    · a term naming a country or a point shows a map marker in its popup; a term naming neither does not
    · pressing it goes to the Atlas, closes the popup and opens NO info panel (the reader has just read it)
    · a glossary point-location is findable in the Atlas search, and picking it focuses it
    · the reader's TEXT SIZE reaches the canvas: the same view's country names carry more ink at Very
      large than at Medium, and less at Very small (Sep 2026, on request)

    node .claude/test-atlas-places.js
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

(async () => {
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port + "/";
  const browser = await chromium.launch(LAUNCH);
  const errs = [];
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on("pageerror", (e) => errs.push(e.message));
  // the first-visit coach marks would sit over the globe for every measurement below
  await page.addInitScript(() => { try { localStorage.setItem("folio_atlas_tour_v1", "1"); } catch (e) {} });

  /* ================= 1. the tables the whole feature rests on ================= */
  await page.goto(base + "#mission", { waitUntil: "load" });
  await page.waitForTimeout(1400);
  const tables = await page.evaluate(() => ({
    places: Object.keys(window.GLOSSARY_PLACES || {}).length,
    countries: Object.keys(window.GLOSSARY_MAP_COUNTRY || {}).length,
    // every stored coordinate has to be a real one — a [0,0] is what a failed fetch looks like
    bad: Object.keys(window.GLOSSARY_PLACES || {}).filter((k) => {
      const c = (window.GLOSSARY_PLACES || {})[k];
      return !Array.isArray(c) || c.length !== 2 || !isFinite(c[0]) || !isFinite(c[1]) ||
        Math.abs(c[0]) > 180 || Math.abs(c[1]) > 90 || (c[0] === 0 && c[1] === 0);
    }),
  }));
  check("glossary point-locations ship with the site", tables.places >= 25, String(tables.places));
  check("...and every one is a plausible coordinate", tables.bad.length === 0, JSON.stringify(tables.bad));
  check("...and the country join ships too", tables.countries >= 150, String(tables.countries));

  /* ================= 2. the Atlas: crowding, and the heightmap slider ================= */
  await page.goto(base + "#map", { waitUntil: "load" });
  await page.waitForTimeout(4000);
  // Cities on as well as Capitals — the crowded case the rule exists for
  await page.evaluate(() => { const c = document.querySelector("#majorToggle"); if (c && !c.checked) c.click(); });
  await page.waitForTimeout(1400);

  /* The labels are drawn on a CANVAS, so there is nothing in the DOM to measure and no hook that publishes
     the layout. What can be checked without reading pixels is the rule itself: `CITY_SEP` is sliced out of
     app.js by text and run here, the same technique test-daily-quote.js uses for the running order. It is
     the whole of the crowding behaviour — a separation that does not fall with zoom is a map that never
     reveals anything, and one that starts too small is the wall of names this replaced. */
  const sep = await page.evaluate(async () => {
    const src = await (await fetch("app.js")).text();
    const m = src.match(/const CITY_SEP = ([^;]+);/);
    if (!m) return null;
    const f = new Function("clamp", "return " + m[1])((v, a, b) => Math.max(a, Math.min(b, v)));
    return { z1: f(1), z4: f(4), z10: f(10) };
  });
  check("the city-label separation shrinks as the globe is zoomed in",
    !!sep && sep.z1 > sep.z4 && sep.z4 > sep.z10, JSON.stringify(sep));
  check("...from a whole region at the globe to a city block zoomed right in",
    !!sep && sep.z1 >= 60 && sep.z10 <= 30, JSON.stringify(sep));

  const hm = await page.evaluate(async () => {
    const row = document.querySelector("#hmOpacityRow");
    const before = row ? row.hidden : null;
    document.querySelector("#heightmapToggle").click();
    await new Promise((r) => setTimeout(r, 1000));
    const inp = document.querySelector("#hmOpacity");
    inp.value = "40"; inp.dispatchEvent(new Event("input", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 600));
    return { before: before, after: row.hidden, val: (document.querySelector("#hmOpacityVal") || {}).textContent,
      stored: localStorage.getItem("folio_hm_opacity_v1") };
  });
  check("the heightmap strength slider is hidden while the layer is off", hm.before === true, JSON.stringify(hm));
  check("...appears with it, and is live", hm.after === false && /40/.test(hm.val || ""), JSON.stringify(hm));
  check("...and is remembered on the device", hm.stored === "0.4", String(hm.stored));

  /* ================= 3. a glossary place is findable, and focusing it draws it ================= */
  const search = await page.evaluate(async () => {
    const box = document.querySelector("#globeSearch");
    const inp = box.tagName === "INPUT" ? box : box.querySelector("input");
    inp.focus(); inp.value = "Olduvai"; inp.dispatchEvent(new Event("input", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 600));
    return [...document.querySelectorAll(".gs-row")].map((r) => r.textContent);
  });
  check("a glossary point-location is findable in the Atlas search",
    search.some((t) => /Olduvai/i.test(t)), JSON.stringify(search));
  check("...and listed as a Place, not a country or a capital",
    search.some((t) => /Olduvai/i.test(t) && /place/i.test(t)), JSON.stringify(search));

  /* ================= 4. the marker in a gloss popup ================= */
  // popups are wired per render, so they are opened the way a reader opens them: from a study card's
  // background, whose prose is auto-linked
  /* A collection has to be in the review before the hero deals a card — it routes to the collections now
     (Aug 2026, on request) rather than adding one on the reader's behalf. Read off the shipped tree
     rather than named: this seeding used to say `wh-prehistory`, a deck retired in the 2026-08-04
     replan, so it had been putting nothing in the review for months and only the hero's own add was
     keeping the section alive.
     …AND THE COLLECTION IS CHOSEN BY MEASUREMENT RATHER THAN BY BEING FIRST (Aug 2026). "The first live
     collection" was China the day China opened, and a card of Chinese myth links no place term at all —
     so the walk below found a country and an ordinary term and no POINT, and reported a marker that had
     stopped working when nothing had. The collection taken is whichever one's own prose mentions the most
     place terms, which is derived from the shipped data and cannot go stale the next time the shelf grows.
     The day's allowance is raised with it: at five new cards the walk sees five, however many it asks for. */
  await page.evaluate(() => {
    const PLACES = Object.keys(window.GLOSSARY_PLACES || {}).map((k) => k.replace(/_/g, " ").toLowerCase());
    const BY_ID = {}; (window.CARD_DATA || []).forEach((c) => { BY_ID[c.id] = c; });
    const ids = (n) => (n.cardIds || []).concat(...(n.children || []).map(ids));
    const score = (n) => ids(n).reduce((a, id) => {
      const c = BY_ID[id]; if (!c) return a;
      const t = ((c.abstract || "") + " " + (c.answerText || "")).toLowerCase();
      return a + (PLACES.some((p) => p.length > 3 && t.indexOf(p) >= 0) ? 1 : 0);
    }, 0);
    const live = ((window.COLLECTION_TREE || {}).collections || []).filter((c) => !c.placeholder && ids(c).length);
    const best = live.map((c) => ({ c: c, s: score(c) })).sort((a, b) => b.s - a.s)[0];
    const S = JSON.parse(localStorage.getItem("folio_v1") || "{}");
    S.active = best ? [best.c.id] : [];
    S.settings = S.settings || {}; S.settings.newPerDay = 40;
    localStorage.setItem("folio_v1", JSON.stringify(S));
  });
  await page.goto(base + "#home", { waitUntil: "load" });
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(1600);
  await page.evaluate(async () => { const b = document.querySelector("#b-review"); if (b) b.click(); await new Promise((r) => setTimeout(r, 1200)); });
  const marks = await page.evaluate(async () => {
    const out = {}, PL = window.GLOSSARY_PLACES || {}, MC = window.GLOSSARY_MAP_COUNTRY || {};
    for (let n = 0; n < 14 && Object.keys(out).length < 3; n++) {
      const rb = document.querySelector("#reveal-btn"); if (!rb) break;
      rb.click(); await new Promise((r) => setTimeout(r, 420));
      for (const t of [...document.querySelectorAll(".reveal .ttip[data-k]")]) {
        const k = t.dataset.k, kind = PL[k] ? "point" : MC[k] ? "country" : "other";
        if (out[kind]) continue;
        document.querySelectorAll(".gloss-win").forEach((w) => w.remove());
        t.click(); await new Promise((r) => setTimeout(r, 400));
        const w = document.querySelector(".gloss-win");
        if (w) out[kind] = { k: k, marker: !!w.querySelector(".gloss-map") };
        document.querySelectorAll(".gloss-win").forEach((w2) => w2.remove());
        if (Object.keys(out).length >= 3) break;
      }
      const g = document.querySelector(".grade.good"); if (!g) break;
      g.click(); await new Promise((r) => setTimeout(r, 420));
    }
    return out;
  });
  check("a term naming a point shows the map marker", !!marks.point && marks.point.marker === true, JSON.stringify(marks.point));
  check("a term naming a country shows it too", !!marks.country && marks.country.marker === true, JSON.stringify(marks.country));
  check("a term naming neither does not", !!marks.other && marks.other.marker === false, JSON.stringify(marks.other));

  const flown = await page.evaluate(async () => {
    const PL = window.GLOSSARY_PLACES || {}, MC = window.GLOSSARY_MAP_COUNTRY || {};
    let tips = [];
    for (let n = 0; n < 10 && !tips.length; n++) {
      const rb = document.querySelector("#reveal-btn");
      if (rb) { rb.click(); await new Promise((r) => setTimeout(r, 420)); }
      tips = [...document.querySelectorAll(".reveal .ttip[data-k]")].filter((t) => PL[t.dataset.k] || MC[t.dataset.k]);
      if (tips.length) break;
      const g = document.querySelector(".grade.good"); if (!g) break;
      g.click(); await new Promise((r) => setTimeout(r, 420));
    }
    if (!tips.length) return { skip: true };
    tips[0].click(); await new Promise((r) => setTimeout(r, 500));
    const mp = document.querySelector(".gloss-map"); if (!mp) return { skip: true };
    mp.click();
    await new Promise((r) => setTimeout(r, 6500));
    const pop = document.querySelector("#countryPop");
    return { hash: location.hash, gloss: document.querySelectorAll(".gloss-win").length, popup: !!(pop && !pop.hidden) };
  });
  if (flown.skip) check("the marker flies to the Atlas", false, "no place term appeared on any revealed card");
  else {
    check("the marker takes the reader to the Atlas", flown.hash === "#map", flown.hash);
    check("...closing the popup behind it", flown.gloss === 0, String(flown.gloss));
    // the reader has just READ about this place; a second description is not what the marker offered
    check("...and opening no info panel", flown.popup === false, JSON.stringify(flown));
  }

  /* ============================================================
     THE TEXT SIZE REACHES THE CANVAS (Sep 2026, on request)
     ============================================================
     `--fs` multiplies 519 px font-sizes in the stylesheet and reached no label on the globe, those being
     PAINTED rather than laid out — so a reader who had asked for Very large met a map set in the same
     10px it has always been. `mapFs` reads the multiplier off the stylesheet and scales every label
     layer's own size with it.
     IT IS MEASURED AS INK, because the labels are on a canvas and there is nothing to query, and it is
     measured on ONE VIEW with one layer on — the persistent country names, which are the layer with the
     most words on screen at the opening zoom. LBL_TEXT is the day theme's #221808, which nothing else on
     this globe is near: the same probe section 6 of test-personal-atlas.js uses.
     THE BAR IS A DIRECTION, NOT A RATIO. Ink does not scale with the multiplier — at Very small the
     strokes are thin enough that most of their pixels are antialiased out of the colour window, and at
     Very large a bigger name also crowds its neighbours out of the de-collision — so what is asserted is
     that the three sizes come back in order, with enough daylight between them that a redraw's noise
     cannot supply it. A regression here shows as all three being EQUAL, which is the value the check
     existed to rule out. */
  const nameInk = async (size) => {
    const pg = await browser.newPage({ viewport: { width: 1200, height: 900 } });
    await pg.addInitScript((sz) => {
      localStorage.setItem("folio_v1", JSON.stringify({ settings: { fontSize: sz, newPerDay: 5 } }));
    }, size);
    await pg.goto(base + "#map", { waitUntil: "load" });
    await pg.reload({ waitUntil: "load" });
    await pg.waitForTimeout(9000);
    // the page opens on the reader's OWN atlas, which draws no country names at all
    await pg.evaluate(() => { const w = document.querySelector('[data-atlastab="world"]'); if (w) w.click(); });
    await pg.waitForTimeout(4000);
    await pg.evaluate(() => { const t = document.querySelector("#countryToggle"); if (t && !t.checked) t.click(); });
    await pg.waitForTimeout(3000);
    const r = await pg.evaluate(() => {
      const cv = document.getElementById("globe");
      if (!cv) return null;
      const d = cv.getContext("2d").getImageData(0, 0, cv.width, cv.height).data;
      let label = 0;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] < 8) continue;
        if (Math.abs(d[i] - 34) < 14 && Math.abs(d[i + 1] - 24) < 14 && Math.abs(d[i + 2] - 8) < 16) label++;
      }
      return label;
    });
    await pg.close();
    return r;
  };
  const inkTiny = await nameInk("tiny"), inkMed = await nameInk("medium"), inkHuge = await nameInk("huge");
  check("the Atlas writes its country names at all", inkMed > 200, "ink " + inkMed);
  check("...bigger when the reader asks for Very large", inkHuge > inkMed * 1.5, JSON.stringify({ medium: inkMed, huge: inkHuge }));
  check("...and smaller at Very small", inkTiny < inkMed * 0.75, JSON.stringify({ tiny: inkTiny, medium: inkMed }));

  console.log("");
  if (errs.length) { console.log("page errors:"); errs.forEach((e) => console.log("  " + e)); fail += errs.length; }
  console.log(pass + " passed, " + fail + " failed");
  await browser.close();
  server.close();
  process.exit(fail ? 1 : 0);
})();
