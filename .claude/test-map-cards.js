/* MAP CARDS — the geography format's regression test.
 *
 *   node .claude/test-map-cards.js
 *
 * Playwright, one browser. Everything here fails SILENTLY on the page, which is why it is a file rather
 * than a few lines appended to test-layout.js:
 *
 *   · A map that does not FRAME its state still draws a globe. The reader gets an ocean, or a continent
 *     with a speck in it, and no error anywhere. That is why section 3 sweeps all 51 states and asserts
 *     the fit ARITHMETIC rather than looking at one card.
 *   · A map that becomes CLICKABLE still looks right. The whole point of the format is that the shape is
 *     the question, so a reader who can tap the shaded state and be told its name is not studying — and
 *     nothing on screen distinguishes the two.
 *   · A map card that reaches the MINIGAMES is dealt cold, with no map beside it, and asks "the state
 *     shaded on the map is ____" of somebody looking at four options. Excluded by construction rather
 *     than by editorial judgement, so it can regress the moment gameCardIdSet is touched.
 *   · A serializer that drops `map` or `facts` strips them from every card in data.js on the next admin
 *     keystroke — the documented whitelist trap, and the reason those two are asserted in the file rather
 *     than on the page.
 *
 * ASSERT THE VIEW, NOT PIXELS. An earlier version of the drag check compared two sampled pixels and
 * reported "the drag did nothing" on a map that had turned four degrees — both samples happened to sit on
 * the same flat fill. `_folioMap.view()` exists for this, and reads the numbers the renderer is using.
 */
const path = require("path"), fs = require("fs"), http = require("http");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");
const ROOT = path.join(__dirname, "..");
const PORT = 8123;
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png" };

let pass = 0, fail = 0;
const ok = (cond, what, extra) => { if (cond) { pass++; } else { fail++; console.log("  FAIL: " + what + (extra === undefined ? "" : "  [" + extra + "]")); } };
const sect = (s) => console.log("\n== " + s);

function serve() {
  const server = http.createServer((req, res) => {
    const p = decodeURIComponent(req.url.split("?")[0]);
    const f = path.join(ROOT, p === "/" ? "index.html" : p);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end("nope"); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise((r) => server.listen(PORT, () => r(server)));
}

/* ---- 1. the data and the wiring, with no browser ---- */
function staticChecks() {
  sect("1. data.js, us-states.js and the serializer");
  const win = {};
  new Function("window", fs.readFileSync(path.join(ROOT, "us-states.js"), "utf8"))(win);
  const ST = win.US_STATES || [];
  ok(ST.length === 51, "us-states.js carries 51 states (50 + DC)", ST.length);
  ok(new Set(ST.map((s) => s.n)).size === 51, "state names are unique");
  ok(new Set(ST.map((s) => s.a)).size === 51, "postal abbreviations are unique");
  ok(ST.every((s) => Array.isArray(s.c) && s.c.length === 2 && isFinite(s.c[0]) && isFinite(s.c[1])), "every state has a finite label point");
  ok(ST.every((s) => Array.isArray(s.p) && s.p.length && s.p.every((r) => r.length >= 4)), "every state has rings of at least four points");
  // rings are stored CLOSED, which is what lets the renderer stroke the closing edge without a modular index
  ok(ST.every((s) => s.p.every((r) => r[0][0] === r[r.length - 1][0] && r[0][1] === r[r.length - 1][1])), "every ring is closed");
  /* THE TOLERANCE IS THE POINT OF THIS FILE AND IS EASY TO LOSE. It was copied from world.js at first, and
     at 0.02/2dp Rhode Island was 49 points — the bay three spikes, Block Island a triangle — which is not
     an error any count can see, only a shape. The floor here is well under what the builder produces and
     well over what world.js's tolerance would: it fails if somebody re-coarsens the file. */
  const ri = ST.find((s) => s.a === "RI");
  ok(ri && ri.p.reduce((n, r) => n + r.length, 0) >= 120, "Rhode Island is traced finely enough to read as a coastline", ri && ri.p.reduce((n, r) => n + r.length, 0));
  const verts = ST.reduce((n, s) => n + s.p.reduce((m, r) => m + r.length, 0), 0);
  ok(verts >= 25000, "the layer as a whole is finely traced", verts);

  /* THE CAPITALS ARE GENERATED, NEVER TYPED, and this is what says so. Fifty hand-entered coordinates are
     fifty chances to put a city in the wrong state, and a dot a degree out still draws — inside the shaded
     state, on a card that looks entirely correct. They are keyed by city and carry the state they are IN,
     so the card's claim is machine-checkable, which is the whole reason the table has an `s` at all. */
  const CAP = win.US_CAPITALS || {};
  const capNames = Object.keys(CAP);
  ok(capNames.length === 50, "us-states.js carries the 50 state capitals", capNames.length);
  ok(capNames.every((n) => CAP[n] && Array.isArray(CAP[n].c) && CAP[n].c.length === 2 && isFinite(CAP[n].c[0]) && isFinite(CAP[n].c[1])), "every capital has a finite coordinate");
  ok(new Set(capNames.map((n) => CAP[n].s)).size === 50, "one capital per state, and fifty states", new Set(capNames.map((n) => CAP[n].s)).size);
  const stByName = new Map(ST.map((s) => [s.n, s]));
  ok(capNames.every((n) => stByName.has(CAP[n].s)), "every capital names a state the layer actually has");
  /* AND EACH ONE FALLS INSIDE ITS OWN STATE'S BOX. A capital keyed to the wrong state paints its dot
     somewhere else entirely on the globe — off the shaded shape, or off the visible hemisphere — so this
     is the cheap check that catches a source whose fields have moved under the builder. A bounding box
     rather than a point-in-polygon: it is enough to separate fifty states and needs no geometry. */
  const outside = capNames.filter((n) => {
    const st = stByName.get(CAP[n].s); if (!st) return true;
    let lo0 = Infinity, hi0 = -Infinity, lo1 = Infinity, hi1 = -Infinity;
    st.p.forEach((r) => r.forEach((p) => { if (p[0] < lo0) lo0 = p[0]; if (p[0] > hi0) hi0 = p[0]; if (p[1] < lo1) lo1 = p[1]; if (p[1] > hi1) hi1 = p[1]; }));
    const c = CAP[n].c;
    return c[0] < lo0 - 0.3 || c[0] > hi0 + 0.3 || c[1] < lo1 - 0.3 || c[1] > hi1 + 0.3;
  });
  ok(outside.length === 0, "every capital sits inside its own state", outside.join(", "));

  const dwin = {};
  new Function("window", fs.readFileSync(path.join(ROOT, "data.js"), "utf8"))(dwin);
  const cards = dwin.CARD_DATA || [];
  const maps = cards.filter((c) => c.map);
  ok(maps.length > 0, "data.js carries map cards", maps.length);
  const names = new Set(ST.map((s) => s.n));
  maps.forEach((c) => {
    ok(c.map.layer === "us-states", c.id + ": names a known layer", c.map.layer);
    ok(names.has(c.map.key), c.id + ": its key is a state the layer actually has", c.map.key);
    /* A map card carries NO extra phrasings. The other two would have to describe the same shape in two
       more ways, which is either the same sentence or a different question about a different thing. */
    ok(!c.questions || !c.questions.length, c.id + ": carries no extra phrasings");
    /* A CAPITAL CARD NAMES ITS DOT, and the dot must be in the state the same card shades — otherwise the
       card shades one state and points at a city in another, which is a wrong answer rather than a broken
       one. The third assertion is the one nothing else can make: the ANSWER has to be the dot, or the card
       lights up a city and asks about the state around it. */
    if (c.map.dot) {
      ok(!!CAP[c.map.dot], c.id + ": its dot is a capital the layer actually has", c.map.dot);
      ok(CAP[c.map.dot] && CAP[c.map.dot].s === c.map.key, c.id + ": …in the state the card shades", CAP[c.map.dot] && CAP[c.map.dot].s);
      ok((c.answerText || "").trim() === c.map.dot, c.id + ": …and the answer is that city", c.answerText);
    }
  });
  const dotted = maps.filter((c) => c.map.dot);
  ok(dotted.length > 0, "the deck carries at least one capital card", dotted.length);
  // a state card must NOT carry one: the shape is the whole question there, and a dot would answer it
  ok(maps.filter((c) => !c.map.dot).length > 0, "…and at least one card whose question is the shape alone");
  const withFacts = cards.filter((c) => c.facts && c.facts.length);
  ok(withFacts.length > 0, "map cards carry a facts box", withFacts.length);
  withFacts.forEach((c) => {
    ok(c.facts.every((f) => Array.isArray(f) && f.length === 2 && typeof f[0] === "string" && typeof f[1] === "string"), c.id + ": facts are [label, value] string pairs");
    ok(c.facts.every((f) => !/[<>]/.test(f[0] + f[1])), c.id + ": facts are plain text");
  });

  /* THE SERIALIZER'S WHITELIST. data.js is rewritten in full by an admin edit, so a field the serializer
     does not name is stripped from every card at once — which is how `difficulty` and `undatable` were
     lost for a run. Read out of app.js by text, so it cannot drift from what ships. */
  sect("2. serializeCardData and the game filter");
  const app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  const ser = app.slice(app.indexOf("function serializeCardData"), app.indexOf("function serializeCardData") + 3000);
  ok(/o\.map\s*=\s*c\.map/.test(ser), "serializeCardData carries `map` through");
  ok(/o\.facts\s*=\s*c\.facts/.test(ser), "serializeCardData carries `facts` through");
  const rev = app.slice(app.indexOf("function revertCard"), app.indexOf("function revertCard") + 1600);
  ok(/\.map\s*=\s*p\.map/.test(rev), "revertCard restores `map`");
  ok(/\.facts\s*=\s*p\.facts/.test(rev), "revertCard restores `facts`");
  const gset = app.slice(app.indexOf("function gameCardIdSet"), app.indexOf("function gameCardIdSet") + 900);
  ok(/!cardMapSpec\(/.test(gset), "gameCardIdSet excludes map cards");
  // and the bundle really is lazy — a 600 KB file in the eager path would slow the site for every visitor
  ok(!/<script[^>]+us-states\.js/.test(fs.readFileSync(path.join(ROOT, "index.html"), "utf8")), "us-states.js is NOT in index.html's eager path");
  ok(/usstates:\s*\{\s*files:\s*\["us-states\.js"\]/.test(app), "us-states.js is registered as a lazy bundle");

  /* THE LOCATOR'S DATA (Aug 2026, on request). A globe at the FOOT of a card whose answer is a place. It
     rides in the same whitelist and is lost the same way — a field the serializer does not name is
     stripped from every card on the next admin keystroke. The coordinate is FETCHED by
     .claude/add-locators.js and never typed, so what is checked here is that what shipped is a coordinate
     at all: a `[0, 0]` is what a failed fetch leaves behind, and it draws a perfectly good globe with a
     dot in the Gulf of Guinea. */
  const withLoc = cards.filter((c) => c.locator);
  ok(withLoc.length > 20, "cards carry a locator", withLoc.length + " of " + cards.length);
  withLoc.forEach((c) => {
    const l = c.locator;
    ok(Array.isArray(l.at) && l.at.length === 2 && isFinite(l.at[0]) && isFinite(l.at[1]) &&
      Math.abs(l.at[0]) <= 180 && Math.abs(l.at[1]) <= 90 && (l.at[0] !== 0 || l.at[1] !== 0),
      c.id + ": the locator is a real coordinate", JSON.stringify(l.at));
    ok(String(l.name || "").trim().length > 0, c.id + ": …and names the place it marks", l.name);
  });
  ok(/o\.locator\s*=\s*c\.locator/.test(ser), "serializeCardData carries `locator` through");
  ok(/\.locator\s*=\s*p\.locator/.test(rev), "revertCard restores `locator`");
}

/* ---- the browser half ---- */
async function browserChecks(page) {
  const errs = [];
  page.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !isNoise(t)) errs.push(t); });
  page.on("pageerror", (e) => errs.push("PAGEERROR " + e.message));

  /* Land on one card, by seeding the study session record the way a reload restores one. `n` is a cache
     buster in the QUERY and it is load-bearing: a goto differing only in the #fragment is a same-document
     navigation, so boot never runs, the seeded record is never read and the second call in this file
     silently studies the first call's card. The app ignores unknown query parameters. */
  let visit = 0;
  const study = async (id) => {
    await page.addInitScript((cid) => {
      localStorage.setItem("folio_tour_v1", "1");
      localStorage.setItem("folio_atlas_tour_v1", "1");
      localStorage.setItem("folio_library_tour_v1", "1");
      sessionStorage.setItem("folio_study_v1", JSON.stringify({ scope: { type: "card", id: cid }, queue: [cid], id: cid, qi: 0, rev: false, studied: 0 }));
    }, id);
    await page.goto("http://localhost:" + PORT + "/?c=" + (++visit) + "#study");
    await page.waitForFunction(() => { const h = document.querySelector(".map-card"); return h && h._folioMap && h._folioMap.ready(); }, null, { timeout: 20000 });
    await page.waitForTimeout(250);
  };
  /* A LOCATOR CARD HAS NO WINDOW ON ITS FRONT, so `study` above — which waits for a mounted `.map-card` —
     times out on one. This lands on the card, reveals it, and waits for the window the ANSWER carries. */
  const studyReveal = async (id) => {
    await page.addInitScript((cid) => {
      localStorage.setItem("folio_tour_v1", "1");
      localStorage.setItem("folio_atlas_tour_v1", "1");
      localStorage.setItem("folio_library_tour_v1", "1");
      sessionStorage.setItem("folio_study_v1", JSON.stringify({ scope: { type: "card", id: cid }, queue: [cid], id: cid, qi: 0, rev: false, studied: 0 }));
    }, id);
    await page.goto("http://localhost:" + PORT + "/?c=" + (++visit) + "#study");
    await page.waitForSelector("#reveal-btn", { timeout: 20000 });
    await page.evaluate(() => document.querySelector("#reveal-btn").click());
    await page.waitForFunction(() => { const h = document.querySelector(".card-loc .map-card"); return h && h._folioMap && h._folioMap.ready(); }, null, { timeout: 20000 });
    await page.waitForTimeout(250);
  };

  sect("3. the fit: every state frames itself");
  await study("geo-001");
  /* THE SWEEP. A card opens at whatever zoom frames its own state, so the fifty-one states are fifty-one
     different views and only four of them have cards today. What a wrong fit produces is a globe with a
     speck on it, or a state running off both edges — neither of which throws, and neither of which anybody
     sees until that card is written.
     The formula is re-run here rather than driven through the renderer, because the renderer's fit lives
     inside startCardGlobe's closure with no way in from outside. A copy is exactly the thing this file's
     own header warns about, so the copy is PINNED: the three expressions it depends on are grepped out of
     app.js first, and a change to any of them fails here instead of leaving a stale formula passing. */
  const appSrc = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  const pin = (re, what) => { ok(re.test(appSrc), "the fit sweep is still pinned to app.js: " + what); };
  pin(/const span = Math\.max\(y1 - y0, \(x1 - x0\) \* Math\.cos\(homeLat \* CMAP_DEG\), 0\.2\);/, "the span");
  pin(/z = 0\.55 \/ \(0\.46 \* CMAP_DEG \* span\);/, "the zoom");
  pin(/Math\.abs\(b\[4\] - st\.c\[0\]\) < 25 && Math\.abs\(b\[5\] - st\.c\[1\]\) < 25/, "the near-ring test");
  pin(/baseR = Math\.min\(W, H\) \* 0\.46/, "the disk radius");
  const ZMIN = Number((appSrc.match(/CMAP_ZMIN = ([\d.]+)/) || [])[1]);
  const ZMAX = Number((appSrc.match(/CMAP_ZMAX = ([\d.]+)/) || [])[1]);
  ok(isFinite(ZMIN) && isFinite(ZMAX) && ZMAX > ZMIN, "the zoom limits were read out of app.js", ZMIN + ".." + ZMAX);

  const calc = await page.evaluate(({ ZMIN, ZMAX }) => {
    const DEG = Math.PI / 180;
    const bb = (r) => { let x0 = 180, y0 = 90, x1 = -180, y1 = -90; for (const p of r) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; } return [x0, y0, x1, y1, (x0 + x1) / 2, (y0 + y1) / 2]; };
    return window.US_STATES.map((s) => {
      // the fit is taken from the rings NEAR the label point — Alaska crosses the antimeridian
      let near = s.p.filter((r) => { const b = bb(r); return Math.abs(b[4] - s.c[0]) < 25 && Math.abs(b[5] - s.c[1]) < 25; });
      if (!near.length) near = s.p;
      let x0 = 180, y0 = 90, x1 = -180, y1 = -90;
      for (const r of near) { const b = bb(r); if (b[0] < x0) x0 = b[0]; if (b[1] < y0) y0 = b[1]; if (b[2] > x1) x1 = b[2]; if (b[3] > y1) y1 = b[3]; }
      const span = Math.max(y1 - y0, (x1 - x0) * Math.cos(s.c[1] * DEG), 0.2);
      const z = Math.min(Math.max(0.55 / (0.46 * DEG * span), ZMIN), ZMAX);
      // how much of the window's half-height the state takes at that zoom; 1.0 would exactly fill it
      return { n: s.n, span, zoom: z, fill: (0.46 * DEG * span * z) / 0.55 };
    });
  }, { ZMIN, ZMAX });

  ok(calc.length === 51, "the fit was computed for all 51 states", calc.length);
  const bad = calc.filter((c) => !isFinite(c.zoom) || c.zoom <= 0);
  ok(!bad.length, "every state fits to a finite positive zoom", bad.map((b) => b.n).join(", "));
  const tiny = calc.filter((c) => c.fill < 0.45);
  ok(!tiny.length, "no state opens too small to see (a speck on a globe)", tiny.map((b) => b.n + " " + b.fill.toFixed(2)).join(", "));
  const cut = calc.filter((c) => c.fill > 1.02);
  ok(!cut.length, "no state opens too large for its window", cut.map((b) => b.n + " " + b.fill.toFixed(2)).join(", "));
  /* Alaska is the one the near-ring rule exists for: read across the raw longitude of all its rings its
     span is nearly the globe, and it would open on the whole planet. */
  const ak = calc.find((c) => c.n === "Alaska");
  ok(ak && ak.span < 40, "Alaska's fit ignores the rings across the antimeridian", ak && ak.span.toFixed(1));
  /* The ceiling is a real limit rather than a formality — the District of Columbia is 0.15 degrees across
     and wants roughly twice what the polygons support. Reported BY NAME instead of asserted away, so a
     second one joining it is noticed rather than absorbed. */
  const capped = calc.filter((c) => c.zoom >= ZMAX - 1e-9).map((c) => c.n);
  console.log("  (at the zoom ceiling: " + (capped.join(", ") || "none") + ")");
  ok(capped.length <= 1, "at most one entry needs more zoom than the polygons support", capped.join(", "));

  sect("4. the map is a map: it turns, it zooms, and it selects nothing");
  await study("geo-004");   // Rhode Island — the deepest ordinary zoom in the deck
  const v0 = await page.evaluate(() => document.querySelector(".map-card")._folioMap.view());
  ok(v0.zoom > 20, "Rhode Island opens zoomed in on itself", Math.round(v0.zoom));
  ok(Math.abs(v0.lon + 71.5) < 1 && Math.abs(v0.lat - 41.6) < 1, "…and centred on it", v0.lon + " " + v0.lat);

  const box = await page.locator(".mc-canvas").boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 70, box.y + box.height / 2 + 30, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(200);
  const v1 = await page.evaluate(() => document.querySelector(".map-card")._folioMap.view());
  ok(v1.lon !== v0.lon || v1.lat !== v0.lat, "dragging turns the globe", JSON.stringify(v1));
  ok(Math.abs(v1.zoom - v0.zoom) < 1e-6, "…and does not zoom it");

  await page.click('.mc-btn[data-mc="in"]');
  await page.waitForTimeout(150);
  const v2 = await page.evaluate(() => document.querySelector(".map-card")._folioMap.view());
  ok(v2.zoom > v1.zoom, "the + button zooms in", Math.round(v2.zoom));
  await page.click('.mc-btn[data-mc="out"]');
  await page.click('.mc-btn[data-mc="out"]');
  await page.waitForTimeout(150);
  const v3 = await page.evaluate(() => document.querySelector(".map-card")._folioMap.view());
  ok(v3.zoom < v2.zoom, "the − button zooms out", Math.round(v3.zoom));
  await page.click('.mc-btn[data-mc="home"]');
  await page.waitForTimeout(150);
  const v4 = await page.evaluate(() => document.querySelector(".map-card")._folioMap.view());
  ok(Math.abs(v4.lon - v0.lon) < 1e-6 && Math.abs(v4.lat - v0.lat) < 1e-6 && Math.abs(v4.zoom - v0.zoom) < 1e-6, "recentre puts it back exactly where it opened", JSON.stringify(v4));

  /* NOTHING IS SELECTABLE. A plain click on the map must open no country panel and shade nothing extra —
     the Atlas's own behaviour is precisely what this window must not have. */
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(200);
  ok(!(await page.$(".country-pop:not([hidden])")), "clicking the map opens no place panel");
  ok(!(await page.$(".gloss-win")), "clicking the map opens no popup of any kind");

  // touch-action:none is what lets a finger drag the globe instead of scrolling the card away
  ok((await page.evaluate(() => getComputedStyle(document.querySelector(".mc-canvas")).touchAction)) === "none", "the canvas claims its own touches");

  /* THE SHADED PLACE IS THE ATLAS'S OWN GOLD, and this is the assertion that keeps it so. `TINT_SEL` was
     inside the Atlas's closure and the card had a gold of its own; hoisting it to module scope is what
     makes them one colour, and nothing on screen would report the two drifting apart again — a card and
     the Atlas are never on screen together, so a second copy would simply be a slightly different gold
     nobody could see was wrong. The expected value is read out of app.js rather than written down here,
     for the reason test-tour.js reads a button's label out of app.js: a literal in a test pins today's
     value instead of the rule. Both halves are needed — one TINT_SEL (a re-copied local inside the
     Atlas closure would shadow the module one silently) and the canvas actually painting it. */
  const APP = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  const tints = APP.match(/const TINT_SEL = \{[^}]*\}/g) || [];
  ok(tints.length === 1, "app.js defines the selection gold exactly once", tints.length);
  const tintM = /const TINT_SEL = \{\s*rgb:\s*"([\d,]+)",\s*fillA:\s*([\d.]+),\s*line:\s*"rgba\((\d+),(\d+),(\d+)/.exec(APP);
  ok(!!tintM, "…as a triple, a fill alpha and an outline colour");
  if (tintM) {
    const RGB = tintM[1].split(",").map(Number), FILL_A = Number(tintM[2]), LINE = [+tintM[3], +tintM[4], +tintM[5]];
    /* Every colour covering a real area, commonest first — plus the pixel at the CENTRE of the window,
       which on a fitted map card is inside the shaded shape by construction: `fitTarget` centres the view
       on the target's own label point, and Natural Earth's label point is inside its polygon. That is
       what makes the fill readable exactly, with no guessing at which histogram entry it is. */
    const shot = await page.evaluate(() => {
      const cv = document.querySelector(".mc-canvas"), g = cv.getContext("2d");
      const d = g.getImageData(0, 0, cv.width, cv.height).data, seen = new Map();
      for (let i = 0; i < d.length; i += 4) { const k = d[i] + "," + d[i + 1] + "," + d[i + 2]; seen.set(k, (seen.get(k) || 0) + 1); }
      const mid = g.getImageData((cv.width / 2) | 0, (cv.height / 2) | 0, 1, 1).data;
      return {
        bulk: [...seen].filter(([, n]) => n > 300).map(([k, n]) => ({ c: k.split(",").map(Number), n: n })).sort((a, b) => b.n - a.n),
        mid: [mid[0], mid[1], mid[2]],
      };
    });
    const bulk = shot.bulk;

    /* THE OUTLINE IS THE EXACT COLOUR `TINT_SEL.line` NAMES. It is painted at full opacity over the tint,
       so it is the one part of the treatment comparable against app.js as a literal triple — and it is
       what goes if somebody replaces the Atlas's brighter stroke with a darkened edge of the card's own,
       which is precisely what this card did for a day. */
    const line = bulk.find((e) => e.c[0] === LINE[0] && e.c[1] === LINE[1] && e.c[2] === LINE[2]);
    ok(!!line, "the shaded place is outlined in the Atlas's own stroke colour", bulk.slice(0, 6).map((e) => e.c.join(",")).join(" / "));
    ok(line && line.n > 300, "…over a real edge rather than a few stray pixels", line && line.n);

    /* AND THE FILL IS A TINT RATHER THAN A SOLID, which is the half a colour check alone cannot see: a
       solid fill is the right HUE and the wrong treatment, and that is exactly the difference the reader
       reported. It cannot be asserted as a literal, since the tint is composited over the land under it
       and that IS a theme token — so the land is SOLVED for out of the blend and then required to be a
       real bulk colour on this canvas.
       TWO EARLIER VERSIONS OF THIS PASSED ON A SOLID FILL and both are worth not repeating. Picking the
       fill out by how WARM it is skips it entirely — a 24% tint is nothing like as saturated as the solid
       gold it replaced (`r - b` falls from 209 to 54) — so the check measured an antialiased fringe.
       SEARCHING the histogram for any pair satisfying the blend is worse: the outline's `shadowBlur` glow
       lays the same gold over the land at every alpha there is, so some pair always satisfies it. The
       centre pixel is the shaded shape itself and admits neither. */
    const fill = shot.mid;
    ok(!fill.every((v, i) => v === RGB[i]), "the shaded place is a translucent tint, not a solid fill", fill.join(","));
    const under = fill.map((v, i) => (v - FILL_A * RGB[i]) / (1 - FILL_A));
    const land = bulk.find((e) => e.c.every((v, i) => Math.abs(v - under[i]) <= 2));
    ok(!!land, "…of exactly TINT_SEL.rgb at TINT_SEL.fillA over the map's own land colour",
      fill.join(",") + " ⇒ under " + under.map((v) => Math.round(v)).join(",") + (land ? " = land " + land.c.join(",") : " — no such colour on the canvas"));
    const area = bulk.find((e) => e.c.every((v, i) => v === fill[i]));
    ok(area && area.n > 500, "…over a real area of the window rather than a hairline", area && area.n);
  }

  sect("5. the answer: the name, the facts box and the citations");
  const before = await page.evaluate(() => document.querySelector(".map-card canvas").toDataURL().length);
  await page.evaluate(() => { const b = document.querySelector("#reveal-btn"); if (b) b.click(); });
  await page.waitForTimeout(500);
  const back = await page.evaluate(() => ({
    answer: (document.querySelector(".answer .val") || {}).textContent,
    mapKept: !!document.querySelector(".map-card"),
    facts: [...document.querySelectorAll(".cf-tile")].map((t) => t.querySelector(".cf-k").textContent),
    factVals: [...document.querySelectorAll(".cf-tile")].map((t) => t.querySelector(".cf-v").textContent),
    sources: document.querySelectorAll(".src-item").length,
    markers: [...document.querySelectorAll("sup.fn")].map((s) => s.textContent),
    canvas: document.querySelector(".map-card canvas").toDataURL().length,
  }));
  ok(/Rhode Island/i.test(back.answer || ""), "the answer names the state", back.answer);
  ok(back.mapKept, "the map stays on the back of the card");
  ok(back.canvas !== before, "revealing repaints the map (it names what it was shading)");
  ok(back.facts.length >= 3, "the facts box has tiles", back.facts.join(" / "));
  ok(back.factVals.every((v) => v && v.trim()), "every fact tile has a value");
  ok(back.sources >= 5, "the card meets the five-source bar", back.sources);
  ok(back.markers.length >= 5, "the abstract carries footnote markers", back.markers.length);
  ok(back.markers.every((m) => /^\d+$/.test(m)), "every marker was numbered by wireFootnotes", back.markers.join(","));
  ok(Math.max(...back.markers.map(Number)) <= back.sources, "no marker points past the end of the source list");

  sect("6. the collection");
  await page.goto("http://localhost:" + PORT + "/#decks");
  await page.waitForTimeout(900);
  /* GEOGRAPHY IS A SECTION, NOT A COLLECTION — and this looked for a collection called "Geography" until
     Aug 2026, when the wrapper node of that name was PROMOTED on request: the heading is Geography and the
     collection under it is "United States" (`geo-us`), with its two decks directly inside. So the row is
     found through the section's own slot, `#collection-list-geo`, which is where `COLLECTION_SECTIONS`
     puts it and which cannot drift the way a text match on a title can. */
  const coll = await page.evaluate(() => {
    const slot = document.querySelector("#collection-list-geo");
    const g = slot && slot.querySelector(".collection");
    if (!g) return { found: false, slot: !!slot };
    return {
      found: true,
      title: (g.querySelector(".collection-title, .coll-title, h3") || {}).textContent || g.textContent.slice(0, 40),
      hue: getComputedStyle(g).getPropertyValue("--coll-bg").trim(),
      icon: !!g.querySelector(".coll-ic svg"),
      decks: [...g.querySelectorAll(".node-title, .deck-title")].map((n) => n.textContent.trim()).filter(Boolean),
    };
  });
  ok(coll.found, "the Geography SECTION holds a collection", JSON.stringify({ slot: coll.slot, title: coll.title }));
  ok(coll.icon, "…with an icon of its own");
  ok(/^#/.test(coll.hue || ""), "…and a hue of its own", coll.hue);

  /* 7. A CAPITAL IS A DOT. Shading Rhode Island and asking for Providence says only which state, which is
     what was reported — and the failure is silent twice over: a dot that never resolves leaves a card that
     is a perfectly good STATE card under a city's question, and a dot drawn but never named on the reveal
     leaves the reader looking at a gold speck nobody accounted for. So both ends are asserted, and the
     resolution is asserted as `mc-failed` NOT being set, since a missing capital table is exactly what
     would take the dot away without a word. */
  sect("7. a capital card puts a dot on its city");
  await study("geo-504");
  const dotState = await page.evaluate(() => ({
    failed: document.querySelector(".map-card").classList.contains("mc-failed"),
    attr: document.querySelector(".map-card").getAttribute("data-map-dot"),
    said: document.querySelector(".mc-canvas").getAttribute("aria-label") || "",
  }));
  ok(!dotState.failed, "the capital resolved against the layer's own table");
  ok(dotState.attr === "Providence", "the card carries its city", dotState.attr);
  ok(/providence/i.test(dotState.said) === false && /city|capital/i.test(dotState.said), "the canvas asks about a city without naming it", dotState.said);

  /* The dot is the Atlas's focus mark: the gold at FULL strength, where the shape around it is a tint. So
     the pure triple appearing in a small, round quantity is the dot and nothing else on the card — the
     outline is `TINT_SEL.line`, a different colour, and the fill is a blend of this one. */
  const dotPx = await page.evaluate((rgb) => {
    const cv = document.querySelector(".mc-canvas"), g = cv.getContext("2d");
    const d = g.getImageData(0, 0, cv.width, cv.height).data;
    const want = rgb.split(",").map(Number);
    let n = 0, minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i] === want[0] && d[i + 1] === want[1] && d[i + 2] === want[2]) {
        const p = i / 4, x = p % cv.width, y = (p / cv.width) | 0;
        n++; if (x < minx) minx = x; if (x > maxx) maxx = x; if (y < miny) miny = y; if (y > maxy) maxy = y;
      }
    }
    return { n: n, w: maxx - minx, h: maxy - miny, dpr: cv.width / cv.getBoundingClientRect().width };
  }, /const TINT_SEL = \{\s*rgb:\s*"([\d,]+)"/.exec(APP)[1]);
  ok(dotPx.n > 30, "the city is painted on the globe at full strength", dotPx.n);
  ok(dotPx.w > 0 && dotPx.w <= Math.ceil(14 * dotPx.dpr) && dotPx.h <= Math.ceil(14 * dotPx.dpr), "…as a dot rather than a region", dotPx.w + "×" + dotPx.h);

  const dotBefore = await page.evaluate(() => document.querySelector(".mc-canvas").toDataURL().length);
  await page.evaluate(() => document.querySelector("#reveal-btn").click());
  await page.waitForTimeout(500);
  const dotBack = await page.evaluate(() => ({
    answer: (document.querySelector(".answer .val") || {}).textContent || "",
    png: document.querySelector(".mc-canvas").toDataURL().length,
  }));
  ok(/Providence/i.test(dotBack.answer), "the answer names the city, not the state", dotBack.answer);
  /* THE LABEL NAMES THE DOT AND NOT THE SHAPE. Reading a word back off a canvas means re-drawing it and
     comparing pixels, which is more machinery than the claim is worth; what is asserted instead is that
     the reveal repainted at all, plus the rule that decides WHICH name it writes — read out of app.js, so
     it cannot quietly go back to labelling the state on a card whose answer is the city. */
  ok(dotBack.png !== dotBefore, "the reveal repainted the map");
  ok(/const nm = dot \? dot\.n : target \? target\.n : ""/.test(APP), "the revealed label names the dot where there is one");

  /* 8. THE LOCATOR (Aug 2026, on request). A globe at the FOOT of a card whose answer is a place, saying
     where it is. It is not a map card — it has no shape to shade and no question to hold back — and the
     ways it can fail are all silent. A card whose `locator` the serializer forgot renders as a card that
     never had one. A canvas nobody mounted is a card that never had one. A window that resolved no place
     is a card that never had one. And the fault this section was written after is worse than any of them:
     `answerFlag` called `sanitizeUrl` with one argument, which throws the moment a URL has a scheme, so
     `buildBack` died and the whole BACK of every geography card came back blank — the front perfect, the
     Reveal button doing nothing at all, and no count anywhere able to see it. Hence the assertions run on
     a real REVEALED card and read what is painted. */
  sect("8. the locator: a place card says where it is");
  await studyReveal("gr-008");   // Knossos — the card the request names
  const loc = await page.evaluate(() => {
    const l = document.querySelector(".card-loc");
    if (!l) return { found: false, revealed: !!document.querySelector(".answer .val") };
    const map = l.querySelector(".map-card"), cv = l.querySelector("canvas");
    const bg = document.querySelector(".bg-collapse"), src = document.querySelector(".src-note");
    let shades = 0;
    try {
      const d = cv.getContext("2d").getImageData(0, 0, cv.width, cv.height).data, seen = new Set();
      for (let i = 0; i < d.length; i += 4 * 97) seen.add(d[i] + "," + d[i + 1] + "," + d[i + 2]);
      shades = seen.size;
    } catch (e) { shades = -1; }
    return {
      found: true, revealed: !!document.querySelector(".answer .val"),
      failed: map.classList.contains("mc-failed"),
      ready: !!(map._folioMap && map._folioMap.ready()),
      shades: shades, btns: l.querySelectorAll(".mc-btn").length,
      said: cv.getAttribute("aria-label") || "",
      afterBg: !!(bg && (l.compareDocumentPosition(bg) & Node.DOCUMENT_POSITION_PRECEDING)),
      beforeSrc: !!(src && (l.compareDocumentPosition(src) & Node.DOCUMENT_POSITION_FOLLOWING)),
    };
  });
  ok(loc.revealed, "revealing a card with a locator still builds the back at all");
  ok(loc.found, "…and the back carries the locator window");
  if (loc.found) {
    ok(!loc.failed, "the locator resolved its coordinate");
    /* `ready()` is `!!(target || dot)`: a locator has a dot and NO target, so a rule testing `target`
       alone reports every one of them as a window that never loaded. */
    ok(loc.ready, "…and the globe reports itself mounted");
    ok(loc.shades > 40, "…and really painted a globe rather than a blank rectangle", loc.shades);
    ok(loc.btns === 3, "it carries the same three zoom controls a map card has", loc.btns);
    /* A locator is an ANNOTATION on a card whose answer is already showing, so unlike a map card's window
       it NAMES the place from the start — holding it back would be asking a question nobody was asked. */
    ok(/knossos/i.test(loc.said), "the canvas names the place, this being the back of the card", loc.said);
    /* Below the prose and above the citations: it is not prose, so it does not belong inside the Background
       fold, and a reader who shut that fold to see only the answer has not asked to lose it. */
    ok(loc.afterBg, "it sits after the background fold rather than inside it");
    ok(loc.beforeSrc, "…and before the citations, which stay last");
  }

  ok(!errs.length, "no console errors", errs.join(" | "));
}

(async () => {
  staticChecks();
  const server = await serve();
  const browser = await chromium.launch({ executablePath: process.env.FOLIO_CHROMIUM || undefined });
  const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
  try { await browserChecks(page); } finally {
    await browser.close();
    server.close();
  }
  console.log("\n" + pass + " passed, " + fail + " failed.");
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error("ERR", e.stack || e.message); process.exit(1); });
