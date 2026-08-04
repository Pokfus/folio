// Card types (Anki-style note types) for community decks, and the XP curve.
//
// Almost everything here fails SILENTLY. A CSS rule that escapes its scope restyles the site and looks like
// a theme bug; a template whose {{Field}} never resolves renders an empty card and looks like a card nobody
// wrote; a type that doesn't travel with its deck turns an installed copy into raw prose. So the assertions
// are about the JOIN between the pieces — template + values + stylesheet — rather than about any one of them.
//
//   NODE_PATH=<scratch>/node_modules node .claude/test-card-types.js
//   FOLIO_CHROMIUM=<path to chrome>   if Chromium lives outside the playwright package
const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end("not found"); return; }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  });
});

let pass = 0, fail = 0;
function check(name, ok, extra) {
  if (ok) { pass++; console.log("ok    " + name + (extra ? "  " + extra : "")); }
  else { fail++; console.log("FAIL  " + name + (extra ? "  " + extra : "")); }
}

/* ---------- part 1: the XP curve, with no browser ----------
   levelFromXP is sliced out of the real app.js by text, the way test-daily-quote.js reads the quote order,
   so this can never drift from what ships. */
function xpChecks() {
  const src = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  const m = /const XP_PER_LEVEL = (\d+);[\s\S]*?function levelFromXP\(xp\) \{[\s\S]*?\n  \}/.exec(src);
  check("levelFromXP found in app.js", !!m);
  if (!m) return;
  check("the step is FIVE, not three", m[1] === "5", "XP_PER_LEVEL=" + m[1]);
  const levelFromXP = new Function(m[0] + "; return levelFromXP;")();
  check("level 1 costs 5 cards", levelFromXP(0).need === 5 && levelFromXP(0).level === 1);
  check("4 cards is still level 1", levelFromXP(4).level === 1 && levelFromXP(4).into === 4);
  check("5 cards reaches level 2", levelFromXP(5).level === 2 && levelFromXP(5).into === 0);
  check("level 2 costs 10 more", levelFromXP(5).need === 10);
  check("15 cards reaches level 3", levelFromXP(15).level === 3 && levelFromXP(15).need === 15);
  check("30 cards reaches level 4", levelFromXP(30).level === 4);
  // the shape of the curve, not just three points: each level costs 5 more than the one before it
  let ok = true;
  for (let lvl = 1; lvl <= 12; lvl++) {
    const total = (5 * lvl * (lvl + 1)) / 2;            // 5 + 10 + … + 5·lvl
    if (levelFromXP(total).level !== lvl + 1) ok = false;
    if (levelFromXP(total - 1).level !== lvl) ok = false;
  }
  check("every threshold through level 13 is 5·level", ok);
  check("no card studied is level 1, empty bar", levelFromXP(0).into === 0 && levelFromXP(0).level === 1);
}

/* ---------- part 2: the CSS scoper and the template engine, still with no browser ----------
   Both are pure string functions, so they are tested directly rather than through the DOM — a scoping bug is
   far easier to read as a failed string comparison than as a screenshot of a restyled page. */
function pureChecks() {
  const src = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  const slice = (re, label) => {
    const m = re.exec(src);
    check("app.js still defines " + label, !!m);
    return m ? m[0] : "";
  };
  const parts = [
    slice(/  const UDECK_MAX_TYPES = [^\n]*UTYPE_CSS_MAX[^\n]*\n/, "the card-type caps"),
    slice(/  function sanitizeCSSText\(raw\) \{[\s\S]*?\n  \}/, "sanitizeCSSText"),
    slice(/  const CSS_AT_NEST = [\s\S]*?\n/, "CSS_AT_NEST"),
    slice(/  function cssScopeSelector\(sel, scope\) \{[\s\S]*?\n  \}/, "cssScopeSelector"),
    slice(/  function cssScoped\(css, scope\) \{[\s\S]*?\n  \}/, "cssScoped"),
    slice(/  function tplRender\(tpl, get\) \{[\s\S]*?\n  \}/, "tplRender"),
  ].join("\n");
  const api = new Function(parts + "; return { sanitizeCSSText, cssScoped, cssScopeSelector, tplRender };")();
  const SCOPE = '.uc-card[data-uct="d1__t1"]';
  const scoped = (css) => api.cssScoped(api.sanitizeCSSText(css), SCOPE);

  // --- scoping ---
  check("a bare selector is scoped", scoped("p{color:red}") === SCOPE + " p{color:red}", scoped("p{color:red}"));
  check(".card means the card itself", scoped(".card{color:red}") === SCOPE + "{color:red}", scoped(".card{color:red}"));
  check("body means the card too", scoped("body{margin:0}") === SCOPE + "{margin:0}");
  check(".card.dark stays one element", scoped(".card.dark{color:red}") === SCOPE + ".dark{color:red}", scoped(".card.dark{color:red}"));
  check(".card p becomes a descendant", scoped(".card p{color:red}") === SCOPE + " p{color:red}");
  check("every selector in a list is scoped", scoped("h3,p{color:red}") === SCOPE + " h3," + SCOPE + " p{color:red}", scoped("h3,p{color:red}"));
  // a `>` must SURVIVE sanitizing: only `<` can spell "</style>", and a stylesheet with no child combinator
  // is missing a third of CSS
  check("a child combinator survives", scoped(".card > b{color:red}") === SCOPE + " > b{color:red}", scoped(".card > b{color:red}"));
  check("a sibling combinator survives", /\+ i/.test(scoped("b + i{color:red}")));
  const media = scoped("@media (max-width:600px){p{color:red}}");
  check("@media is kept and its rules scoped", media === "@media (max-width:600px){" + SCOPE + " p{color:red}}", media);
  const kf = scoped("@keyframes spin{from{opacity:0}to{opacity:1}}");
  check("@keyframes stops are NOT scoped", kf === "@keyframes spin{from{opacity:0}to{opacity:1}}", kf);
  // the assertion the whole scoper exists for
  const escape1 = scoped(".tabbar{display:none}");
  check("a site-chrome selector cannot reach the site", escape1.indexOf(SCOPE) === 0 && !/^\.tabbar/.test(escape1), escape1);
  check("nothing scoped is left unprefixed", scoped("a{color:red}\n.b{color:blue}\nh3 span{color:green}")
    .split("}").filter(Boolean).every((r) => r.indexOf(SCOPE) === 0));

  // --- CSS sanitizing ---
  check("</style> cannot be spelled", api.sanitizeCSSText("p{color:red}</style><script>x()</script>").indexOf("<") < 0);
  check("a backslash escape cannot rebuild a keyword", api.sanitizeCSSText("p{a:expr\\ession(x)}").indexOf("\\") < 0);
  check("@import is dropped", api.sanitizeCSSText('@import url("//evil.example/x.css"); p{color:red}').indexOf("@import") < 0);
  check("@font-face is dropped whole", scoped("@font-face{src:url(https://x/y.woff)} p{color:red}") === SCOPE + " p{color:red}",
    scoped("@font-face{src:url(https://x/y.woff)} p{color:red}"));
  check("expression() is neutralised", !/expression\s*\(/i.test(api.sanitizeCSSText("p{width:expression(alert(1))}")));
  check("-moz-binding is neutralised", !/binding\s*:/i.test(api.sanitizeCSSText("p{-moz-binding:url(x.xml#y)}")));
  check("position:fixed is demoted to absolute", /position:absolute/.test(api.sanitizeCSSText("p{position: FIXED;}")) &&
    !/fixed/i.test(api.sanitizeCSSText("p{position: FIXED;}")));
  check("a javascript: url is dropped", api.sanitizeCSSText("p{background:url(javascript:alert(1))}").indexOf("javascript") < 0);
  check("an https image url survives", /url\(https:\/\/x\.test\/a\.png\)/.test(api.sanitizeCSSText("p{background:url(https://x.test/a.png)}")));
  check("a data: image url survives", /data:image\//.test(api.sanitizeCSSText("p{background:url(data:image/png;base64,AA)}")));
  check("a comment cannot hide a rule", api.sanitizeCSSText("/* .tabbar{display:none} */p{color:red}").indexOf("tabbar") < 0);

  // --- the template engine ---
  const get = (f) => ({ Front: "<b>Q</b>", Back: "A", Empty: "" })[f] || "";
  check("{{Field}} interpolates", api.tplRender("<p>{{Front}}</p>", get) === "<p><b>Q</b></p>");
  check("spaces inside the braces are allowed", api.tplRender("{{ Back }}", get) === "A");
  check("an unknown field renders empty, not literally", api.tplRender("[{{Nope}}]", get) === "[]");
  check("a filled section is kept", api.tplRender("{{#Back}}yes{{/Back}}", get) === "yes");
  check("an empty field's section is dropped", api.tplRender("{{#Empty}}no{{/Empty}}", get) === "");
  check("an inverted section is the mirror", api.tplRender("{{^Empty}}yes{{/Empty}}{{^Back}}no{{/Back}}", get) === "yes");
  check("sections nest", api.tplRender("{{#Back}}a{{#Front}}b{{/Front}}c{{/Back}}", get) === "abc");
  check("a section's own field still interpolates", api.tplRender("{{#Back}}[{{Back}}]{{/Back}}", get) === "[A]");
  check("a value carrying braces is not re-expanded", api.tplRender("{{X}}", (f) => (f === "X" ? "{{Front}}" : "")) === "{{Front}}");
  check("{{FrontSide}} resolves from the getter", api.tplRender("{{FrontSide}}", (f) => (/frontside/i.test(f) ? "FRONT" : "")) === "FRONT");
}

/* ---------- part 3: the browser ---------- */
async function studioChecks(page, base) {
  // build a deck, a type, and a card of that type — through the real UI, not the store
  await page.goto(base + "/#studio");
  await page.waitForTimeout(700);
  await page.click("#stNew");
  await page.waitForTimeout(500);
  await page.click(".studio-settings > summary");
  await page.fill('[data-meta="title"]', "Typed deck");
  await page.waitForTimeout(200);

  check("the Studio offers a Card types tab", await page.$('[data-tab="types"]') !== null);
  await page.click('[data-tab="types"]');
  await page.waitForTimeout(350);
  const basicRow = await page.$eval(".studio-cardrows", (el) => el.textContent);
  check("Basic heads the type list", /Basic/.test(basicRow), basicRow.replace(/\s+/g, " ").slice(0, 60));
  check("Basic is marked as built in", await page.$(".ut-builtin") !== null);
  check("Basic has no delete button", await page.$("#stDelType") === null);

  await page.click("#stAddType");
  await page.waitForTimeout(400);
  check("a new type opens its own form", await page.$('[data-utype="front"]') !== null);
  check("…with a fields box", await page.$("#stTypeFields") !== null);
  check("…and a CSS box", await page.$('[data-utype="css"]') !== null);
  check("…and can be deleted", await page.$("#stDelType") !== null);

  await page.fill('[data-utype="name"]', "Verb");
  await page.waitForTimeout(200);
  await page.fill("#stTypeFields", "Latin, English, Note");
  await page.dispatchEvent("#stTypeFields", "change");
  await page.waitForTimeout(500);

  await page.fill('[data-utype="front"]', '<div class="uc-q">Translate: {{Latin}}</div>');
  await page.waitForTimeout(250);
  await page.fill('[data-utype="back"]', '<div class="uc-a">{{English}}</div>{{#Note}}<p class="uc-n">{{Note}}</p>{{/Note}}');
  await page.waitForTimeout(250);
  // the last rule is the reason the scoper exists: a type may not reach the site around it. `.studio-tab` is
  // chosen because it is on screen at this width — `.tabbar` is display:none above 640px anyway, so a probe
  // there would pass whatever the scoper did.
  await page.fill('[data-utype="css"]', ".card { color: rgb(1, 2, 3); }\n.uc-a { font-weight: 700; }\n.studio-tab { display: none; }");
  await page.waitForTimeout(400);

  const pv = await page.$eval("#stTypePv", (el) => el.innerHTML);
  check("the type preview renders the front template", /Translate:/.test(pv), pv.replace(/\s+/g, " ").slice(0, 90));
  check("the preview stands in a field with its own name", /Latin/.test(pv));

  const tabsVisible = await page.$eval(".studio-tab", (el) => getComputedStyle(el).display !== "none");
  check("a type's CSS cannot reach the site around it", tabsVisible);

  // now a card of that type
  await page.click('[data-tab="cards"]');
  await page.waitForTimeout(350);
  await page.click("#stAddCard");
  await page.waitForTimeout(400);
  check("the card editor offers a type picker", await page.$("#cesCardType") !== null);
  const opts = await page.$$eval("#cesCardType option", (els) => els.map((e) => e.value));
  check("the picker lists Basic first", opts[0] === "basic", JSON.stringify(opts));
  check("…and the deck's own type after it", opts.length === 2 && opts[1] !== "basic", JSON.stringify(opts));
  check("a new card starts as Basic", await page.$eval("#cesCardType", (el) => el.value) === "basic");
  check("a Basic card still shows Folio's own surface", await page.$('[data-field="question"]') !== null);

  await page.selectOption("#cesCardType", opts[1]);
  await page.waitForTimeout(500);
  check("switching type replaces the Basic surface", await page.$('[data-field="question"]') === null);
  const boxes = await page.$$eval("[data-ufield]", (els) => els.map((e) => e.dataset.ufield));
  check("one box per declared field, in order", JSON.stringify(boxes) === JSON.stringify(["Latin", "English", "Note"]), JSON.stringify(boxes));

  await page.fill('[data-ufield="Latin"]', "amare");
  await page.dispatchEvent('[data-ufield="Latin"]', "input");
  await page.waitForTimeout(300);
  await page.fill('[data-ufield="English"]', "to love");
  await page.dispatchEvent('[data-ufield="English"]', "input");
  await page.waitForTimeout(400);

  const cardPv = await page.$eval("#stCardPv", (el) => el.textContent);
  check("the card preview uses the real values", /amare/.test(cardPv) && /to love/.test(cardPv), cardPv.replace(/\s+/g, " ").slice(0, 80));
  check("an empty field's section is left out", !/uc-n/.test(await page.$eval("#stCardPv", (el) => el.innerHTML)));
  const rowTitle = await page.$eval(".studio-cardrow.active .scr-title", (el) => el.textContent);
  check("the card list names a typed card by its first field", rowTitle === "amare", rowTitle);

  // the stylesheet reached the card, scoped
  // switching type must be reversible — a select is one keystroke away from being hit by accident, and losing
  // a card's text to it would be the worst thing this feature could do
  await page.selectOption("#cesCardType", "basic");
  await page.waitForTimeout(500);
  check("switching back to Basic restores Folio's own surface", await page.$('[data-field="question"]') !== null);
  await page.selectOption("#cesCardType", opts[1]);
  await page.waitForTimeout(500);
  const kept = await page.$eval('[data-ufield="Latin"]', (el) => el.value).catch(() => "");
  check("…and the field values are still there afterwards", kept === "amare", kept);

  const colour = await page.$eval("#stCardPv .uc-card", (el) => getComputedStyle(el).color);
  check("the type's CSS applies to its own card", colour === "rgb(1, 2, 3)", colour);
  const weight = await page.$eval("#stCardPv .uc-a", (el) => getComputedStyle(el).fontWeight);
  check("…including a rule for a class inside the template", weight === "700", weight);
  const styleScoped = await page.$$eval("style[data-uct]", (els) => els.map((e) => e.textContent).join("\n"));
  check("the injected stylesheet is scoped to this type", styleScoped.indexOf('.uc-card[data-uct=') === 0, styleScoped.slice(0, 60));
  check("…and one element per type, not one per render", (await page.$$("style[data-uct]")).length === 1);

  return opts[1];
}

async function studyChecks(page, base) {
  // study the deck and confirm the templates are what a learner actually meets
  await page.click("#stStudy");
  await page.waitForTimeout(900);
  const q = await page.$eval(".study-card .question", (el) => el.textContent);
  check("the study card asks the FRONT template", /Translate: amare/.test(q), q.replace(/\s+/g, " ").slice(0, 60));
  check("no phrasing chevrons on a typed card", await page.$(".q-cycle") === null);
  const qColour = await page.$eval(".study-card .question .uc-card", (el) => getComputedStyle(el).color);
  check("the type's CSS applies on the study page too", qColour === "rgb(1, 2, 3)", qColour);

  await page.click("#reveal-btn");
  await page.waitForTimeout(500);
  const a = await page.$eval("#revealInner", (el) => el.textContent);
  check("revealing shows the BACK template", /to love/.test(a), a.replace(/\s+/g, " ").slice(0, 60));
  check("…and not Folio's own Answer/Background chrome", await page.$("#revealInner .bg-head") === null);
}

/* What the deck store actually holds. Both sources are read and merged, because the app treats them as one:
   an unusable IndexedDB silently falls back to localStorage, so a test that knew only one of the two would
   report a storage choice as a missing feature.

   The connection is CLOSED before returning. Leaving it open is not a tidiness point — an idle connection
   blocks the app's own open after a page reload, which pushes it onto the localStorage fallback, and the
   test then goes looking for a deck in the store the app just stopped using. */
function readDecks(page) {
  return page.evaluate(() => new Promise((res) => {
    let ls = [];
    try { ls = JSON.parse(localStorage.getItem("folio_community_v1") || "[]"); } catch (e) { ls = []; }
    const merge = (a) => {
      const seen = new Set((a || []).map((r) => r && r.id));
      return (a || []).concat((ls || []).filter((r) => r && !seen.has(r.id)));
    };
    let req;
    try { req = indexedDB.open("folio-community"); } catch (e) { return res(ls); }
    req.onsuccess = () => {
      const db = req.result;
      let all;
      try { all = db.transaction("decks", "readonly").objectStore("decks").getAll(); }
      catch (e) { db.close(); return res(ls); }
      all.onsuccess = () => { const r = all.result || []; db.close(); res(merge(r)); };
      all.onerror = () => { db.close(); res(ls); };
    };
    req.onerror = () => res(ls);
  }));
}

async function travelChecks(page, base) {
  // A type must survive the round trip through a deck file, or an installed copy renders raw prose.
  const rec = await readDecks(page);
  const deck = rec.find((r) => r.meta && r.meta.title === "Typed deck");
  check("the deck is on disk", !!deck);
  if (!deck) return;
  check("its types are stored on the DECK, not the device", !!(deck.meta.types && Object.keys(deck.meta.types).length === 1));
  const t = deck.meta.types[Object.keys(deck.meta.types)[0]];
  check("the stored type carries its field list", JSON.stringify(t.fields) === JSON.stringify(["Latin", "English", "Note"]), JSON.stringify(t.fields));
  check("the stored type carries both templates", /\{\{Latin\}\}/.test(t.front) && /\{\{English\}\}/.test(t.back));
  check("the stored CSS is already sanitized", t.css.indexOf("<") < 0 && !/position\s*:\s*fixed/i.test(t.css));
  const card = deck.cards.find((c) => c.type);
  check("the card records its type", !!card && card.type === t.id);
  check("…and its field values, not the Basic fields", !!card && card.fields && card.fields.Latin === "amare");
  check("a Basic card in the same deck records NO type key", deck.cards.some((c) => !("type" in c)) || deck.cards.length === 1);
  check("a card that was never typed carries no fields key", deck.cards.every((c) => c.type || !("fields" in c)));

  // import the exported shape back and confirm the type comes with it
  const round = await page.evaluate((rc) => {
    const file = JSON.stringify({ folioDeck: 1, meta: rc.meta, cards: rc.cards, gloss: rc.gloss });
    const parsed = JSON.parse(file);
    return { types: parsed.meta.types, cardType: (parsed.cards.find((c) => c.type) || {}).type };
  }, deck);
  check("the export shape carries the types", !!round.types && Object.keys(round.types).length === 1);
  check("…and the card's type with them", round.cardType === t.id);
}

async function hostileChecks(page, base) {
  /* A deck FILE is untrusted, and it is the one path a type can arrive by without ever having been through
     the Studio. It goes in through the real "Import a deck…" button — the store's own choke point — rather
     than by poking uDeckNormalize, so what is asserted is what an actual import does. */
  const evil = {
    folioDeck: 1,
    meta: {
      title: "Hostile",
      types: {
        bad: {
          id: "bad", name: "Bad", fields: ["A", "<img src=x onerror=alert(1)>"],
          front: '<div onclick="alert(1)">{{A}}</div><script>alert(1)<\/script>',
          back: '<a href="javascript:alert(1)">go</a>',
          css: 'p{background:url(javascript:alert(1))} @import "//evil/x.css"; .card{position:fixed}<\/style><script>alert(1)<\/script>',
        },
        // "basic" is the built-in format's name — a deck must not be able to take it and shadow it
        basic: { id: "basic", name: "Impostor", fields: ["X"], front: "{{X}}", back: "" },
      },
    },
    cards: [{ id: "u_h_1", type: "bad", fields: { A: '<img src=x onerror="alert(1)">ok', "bad name!!": "sneak" } }],
  };
  const tmp = path.join(require("os").tmpdir(), "folio-hostile.folio-deck.json");
  fs.writeFileSync(tmp, JSON.stringify(evil));

  // reload rather than re-navigate: studioState is module state, so without it the Studio comes back on the
  // deck it was last editing and the deck LIST's import button isn't on the page at all
  await page.goto(base + "/#studio");
  await page.reload();
  await page.waitForTimeout(900);
  check("the deck list offers an import", await page.$("#stImport") !== null);
  const chooser = page.waitForEvent("filechooser");
  await page.click("#stImport");
  await (await chooser).setFiles(tmp);
  await page.waitForTimeout(1200);

  const rec = await readDecks(page);
  const h = rec.find((r) => r.meta && r.meta.title === "Hostile");
  check("the hostile deck imported (it must not be silently swallowed)", !!h);
  if (!h) return;
  const types = h.meta.types || {};
  check('a type may not call itself "basic"', !types.basic, JSON.stringify(Object.keys(types)));
  const bad = types.bad;
  check("the hostile type survived, cleaned", !!bad);
  if (bad) {
    check("a field name that is markup is rejected", JSON.stringify(bad.fields) === JSON.stringify(["A"]), JSON.stringify(bad.fields));
    check("an inline handler is stripped from the front template", !/onclick/i.test(bad.front), bad.front);
    check("a <script> is stripped from the front template", !/<script/i.test(bad.front));
    check("{{A}} survives sanitizing", /\{\{A\}\}/.test(bad.front), bad.front);
    check("a javascript: href is stripped from the back template", !/javascript:/i.test(bad.back), bad.back);
    check("the CSS cannot close its <style>", bad.css.indexOf("<") < 0, bad.css.slice(0, 80));
    check("the CSS @import is gone", !/@import/i.test(bad.css));
    check("the CSS javascript: url is gone", !/javascript/i.test(bad.css));
    check("the CSS position:fixed is demoted", !/fixed/i.test(bad.css));
  }
  const card = (h.cards || [])[0];
  check("a hostile field VALUE is sanitized", !!card && !/onerror/i.test(JSON.stringify(card.fields || {})), JSON.stringify(card && card.fields));
  check("…and its text survives", !!card && /ok/.test(String((card.fields || {}).A || "")));
  check("a field name that isn't a field name is dropped", !!card && !("bad name!!" in (card.fields || {})));

  // and nothing executed along the way
  const alerts = await page.evaluate(() => window.__alerted || 0);
  check("nothing in the hostile deck executed", !alerts);
}

(async () => {
  xpChecks();
  pureChecks();

  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port;
  const browser = await chromium.launch(LAUNCH);
  const page = await browser.newPage();
  page.on("dialog", (d) => { page.evaluate(() => { window.__alerted = (window.__alerted || 0) + 1; }); d.dismiss(); });
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e.message || e)));
  await page.addInitScript(() => { window.alert = () => { window.__alerted = (window.__alerted || 0) + 1; }; });

  try {
    await studioChecks(page, base);
    await studyChecks(page, base);
    await travelChecks(page, base);
    await hostileChecks(page, base);
  } catch (e) {
    check("the run completed", false, String(e && e.message).split("\n")[0]);
  }

  check("no uncaught page errors", errs.length === 0, errs.slice(0, 3).join(" | "));
  await browser.close();
  server.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
