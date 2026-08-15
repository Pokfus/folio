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
  });
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
}

/* ---- the browser half ---- */
async function browserChecks(page) {
  const errs = [];
  page.on("console", (m) => { if (m.type() === "error" && !/fonts\.googleapis|ERR_CONNECTION_RESET/.test(m.text())) errs.push(m.text()); });
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
  const coll = await page.evaluate(() => {
    const rows = [...document.querySelectorAll(".collection")];
    const g = rows.find((r) => /Geography/.test(r.textContent));
    if (!g) return { found: false };
    return {
      found: true,
      hue: getComputedStyle(g).getPropertyValue("--coll-bg").trim(),
      icon: !!g.querySelector(".coll-ic svg"),
      decks: [...g.querySelectorAll(".node-title, .deck-title")].map((n) => n.textContent.trim()).filter(Boolean),
    };
  });
  ok(coll.found, "the Geography collection is on the collections page");
  ok(coll.icon, "…with an icon of its own");
  ok(/^#/.test(coll.hue || ""), "…and a hue of its own", coll.hue);

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
