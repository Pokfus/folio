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

/* A DECK SHEET SWALLOWS CLICKS FOR ITS FIRST HALF-SECOND (`DECK_SHEET_ARM_MS`), so a preset row pressed
   sooner than that does nothing — and does it SILENTLY, which is how this suite came to abort at its first
   preset click and run only 87 of its assertions while still reporting "82 passed". Wait past the arm,
   reading the constant out of app.js rather than writing 500 down here, or the next change to it puts the
   suite back where it was. */
const ARM_MS = Number((/DECK_SHEET_ARM_MS\s*=\s*(\d+)/.exec(
  fs.readFileSync(path.join(ROOT, "app.js"), "utf8")) || [])[1] || 500);
const sheetArmed = (page) => page.waitForTimeout(ARM_MS + 150);

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
    // tplRender defers to these — a cloze marker is not a field reference — so they are sliced with it
    slice(/  const CLOZE_NAME_RX = [^\n]*\n  const CLOZE_RX = [^\n]*\n/, "the cloze patterns"),
    slice(/  const UTYPE_MAX_CLOZE = [^\n]*\n/, "UTYPE_MAX_CLOZE"),
    slice(/  const clozeOrd = [^\n]*\n/, "clozeOrd"),
    slice(/  function clozeMark\(html, reveal, ord\) \{[\s\S]*?\n  \}/, "clozeMark"),
    slice(/  const SPEECH_LANG_RX = [^\n]*\n/, "SPEECH_LANG_RX"),
  ].join("\n");
  const api = new Function(parts + "; return { sanitizeCSSText, cssScoped, cssScopeSelector, tplRender, clozeMark, SPEECH_LANG_RX };")();
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
  // a field name may contain a space, and the Vocabulary preset's "Word type" section depends on it —
  // the conditional matches its closing tag by BACKREFERENCE, which is the part that could quietly not
  const spaced = (f) => ({ "Word type": "verb", Empty: "" })[f] || "";
  check("a field name with a space interpolates", api.tplRender("{{Word type}}", spaced) === "verb");
  check("...and closes its own section", api.tplRender("{{#Word type}}[{{Word type}}]{{/Word type}}", spaced) === "[verb]");

  /* --- cloze deletions ---
     The failure this guards is silent in the worst way: a marker read as a FIELD name renders as nothing at
     all, so the card would show a sentence with a hole in it on both sides and no sign of what went wrong. */
  const clozeGet = (f) => ({ Text: "Hastings, {{c1::1066}}, won by {{c2::William::which duke?}}." }[f] || "");
  const front = api.clozeMark(api.tplRender("<p>{{Text}}</p>", clozeGet), false);
  const back = api.clozeMark(api.tplRender("<p>{{Text}}</p>", clozeGet), true);
  check("a marker in a field is not swallowed as a field name", /Hastings/.test(front) && front.indexOf("1066") < 0, front);
  check("the front closes every blank on the card", (front.match(/class="uc-cloze"/g) || []).length === 2, front);
  check("a hint stands in for the words it hides", /\[which duke\?\]/.test(front), front);
  check("the back opens them, marked", /uc-cloze-on/.test(back) && /1066/.test(back) && /William/.test(back), back);
  check("…and does not leave the hint behind", back.indexOf("which duke") < 0, back);
  check("a marker written into a TEMPLATE is left for the cloze pass", api.tplRender("{{c1::x}}", get) === "{{c1::x}}");
  check("…and is then closed like any other", /uc-cloze/.test(api.clozeMark(api.tplRender("{{c1::x}}", get), false)));
  check("text with no marker is returned untouched", api.clozeMark("<p>plain</p>", false) === "<p>plain</p>");
  /* ONE CARD PER BLANK (Aug 2026). The fourth argument is WHICH deletion this card asks about; 0 or absent
     is the older behaviour, every blank together, which is what the six assertions above still describe and
     what every type written before this shipped still gets. */
  const f1 = api.clozeMark(api.tplRender("<p>{{Text}}</p>", clozeGet), false, 1);
  const f2 = api.clozeMark(api.tplRender("<p>{{Text}}</p>", clozeGet), false, 2);
  check("asking about blank 1 closes only that one", (f1.match(/class="uc-cloze"/g) || []).length === 1, f1);
  check("…and SHOWS the other in its own words", /William/.test(f1) && f1.indexOf("1066") < 0, f1);
  check("asking about blank 2 is the mirror of it", /1066/.test(f2) && f2.indexOf("William") < 0, f2);
  check("a blank this card is not asking about is marked, so a type can style it", /uc-cloze-other/.test(f1), f1);
  check("…and its HINT is not printed, only the answer", f1.indexOf("which duke") < 0, f1);
  const b1 = api.clozeMark(api.tplRender("<p>{{Text}}</p>", clozeGet), true, 1);
  check("the back opens the one it asked about", /uc-cloze-on/.test(b1) && /1066/.test(b1), b1);
  check("…and leaves the others as they were", (b1.match(/uc-cloze-on/g) || []).length === 1, b1);
  // `{{c::x}}` with no figure is the first deletion — Anki wants the number, and a reader who leaves it out
  // plainly means the only blank they have written rather than a card belonging to nothing
  check("a marker with no number is blank 1", api.clozeMark("{{c::x}}", false, 1).indexOf("uc-cloze-other") < 0, api.clozeMark("{{c::x}}", false, 1));
  check("…and is therefore shown when another blank is asked", /uc-cloze-other/.test(api.clozeMark("{{c::x}}", false, 2)));

  // --- the spoken language a type may declare ---
  check("a language tag is accepted", api.SPEECH_LANG_RX.test("es") && api.SPEECH_LANG_RX.test("pt-BR") && api.SPEECH_LANG_RX.test("zh-CN"));
  check("anything not tag-shaped is refused", !api.SPEECH_LANG_RX.test("Spanish!") && !api.SPEECH_LANG_RX.test("javascript:x") && !api.SPEECH_LANG_RX.test(""));
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

  /* Adding a type starts with a SHAPE (Aug 2026, on request): the button opens a sheet of ready-made types
     with "Start from scratch" last. The presets are covered further down; this is the blank one, which is
     what the rest of this section then programs by hand. */
  check("the ready-made shapes are offered in the pane itself", (await page.$$(".ut-preset")).length === 4,
    String((await page.$$(".ut-preset")).length));
  await page.click("#stAddType");
  await sheetArmed(page);
  check("Add a type offers the same shapes plus a blank one", (await page.$$(".deck-menu [data-preset]")).length === 5,
    String((await page.$$(".deck-menu [data-preset]")).length));
  await page.click('.deck-menu [data-preset=""]');
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

/* ---------- the ready-made shapes (Aug 2026, on request) ----------
   Three of the four things here fail SILENTLY, which is why they are asserted rather than looked at once:
   a preset that ships without its fields renders an empty card, a read-aloud control on a card with no
   language declared speaks the answer in whatever voice the device happens to boot with, and a cloze whose
   marker leaks through tplRender shows a sentence with a hole in it on BOTH sides. Only the last of the
   four — a shape that never appears in the list — is visible without asking. */
async function presetChecks(page, base) {
  /* It runs AFTER the round trip, on the same deck, so travelChecks measures the deck studioChecks built
     rather than one this section has added two more types to — and it therefore has to find its own way
     back to the Studio, since studyChecks left the page on a study session. */
  await page.goto(base + "/#studio");
  await page.waitForTimeout(700);
  // the Studio remembers which deck was open, so it may land on the deck itself rather than on the list
  if (await page.$(".studio-deck-open")) { await page.click(".studio-deck-open"); await page.waitForTimeout(600); }
  check("the Studio came back to the deck", await page.$('[data-tab="types"]') !== null);
  await page.click('[data-tab="types"]');
  await page.waitForTimeout(350);
  // the gallery is the pane shown when no type of the deck's own is selected — Basic's pane
  await page.click('[data-topensel="basic"]');
  await page.waitForTimeout(350);
  const names = await page.$$eval(".ut-preset-name", (els) => els.map((e) => e.textContent));
  check("the pane names all four shapes", JSON.stringify(names) === '["Vocabulary","Picture","Two-way","Fill in the blank"]', JSON.stringify(names));

  // --- vocabulary: the one that reads its answer aloud ---
  await page.click("#stAddType");
  await sheetArmed(page);
  await page.click('.deck-menu [data-preset="vocabulary"]');
  await sheetArmed(page);   // the language sheet arms too, and #dmSpeechOk is a row inside it
  check("the vocabulary shape asks which language before creating anything", await page.$("#dmSpeechLang") !== null);
  await page.selectOption("#dmSpeechLang", "fr");
  await page.click("#dmSpeechOk");
  await page.waitForTimeout(600);
  check("it opens the type it just made", await page.$eval(".admin-ed-title", (el) => el.textContent) === "Vocabulary",
    await page.$eval(".admin-ed-title", (el) => el.textContent).catch(() => "-"));
  check("the language chosen is the language it carries", await page.$eval('[data-utype="speechLang"]', (el) => el.value) === "fr");
  const fieldsVal = await page.$eval("#stTypeFields", (el) => el.value);
  check("it arrives with its fields already named", /^Word, Word type, Translation, Conjugations, Notes$/.test(fieldsVal), fieldsVal);
  const pv = await page.$eval("#stTypePv", (el) => el.innerHTML);
  check("its back carries a read-aloud control", /uc-tts/.test(pv), pv.replace(/\s+/g, " ").slice(0, 140));
  check("…inside a card that declares the language", /lang="fr"/.test(pv), pv.replace(/\s+/g, " ").slice(0, 200));
  // a span is not a button until something says so, and the delegated click handler cannot say it
  check("the control is focusable and named", await page.$eval("#stTypePv .uc-tts",
    (el) => el.getAttribute("role") + "/" + el.getAttribute("tabindex") + "/" + (el.getAttribute("aria-label") ? "named" : "unnamed")) === "button/0/named");
  /* Its back opens on {{FrontSide}}, so the shell must not ALSO draw its own question above the answer —
     reported once, as the word and its part of speech printed twice, one under the other. The count is read
     off innerText rather than the markup because the shell's copy is hidden rather than removed, which is
     what leaves the front intact before the reveal. Asserted on both surfaces: the rule reaches every one of
     them through the stylesheet, so a scoping slip would take them all at once and either alone would
     look deliberate. */
  const vocabPv = await page.$eval("#stTypePv .study-card", (el) => el.innerText);
  // case-insensitively: the shape sets the part of speech in capitals, so innerText reads it back uppercased
  const twice = (s, re) => (String(s).match(re) || []).length;
  check("a back that renders the front does not print it twice", twice(vocabPv, /word type/gi) === 1,
    JSON.stringify(vocabPv.replace(/\s+/g, " ")));
  check("…so the shell's own question block is the one hidden",
    await page.$eval("#stTypePv .study-card > .question", (el) => getComputedStyle(el).display) === "none");
  check("…and the back still says so on its wrapper", await page.$("#stTypePv .uc-back.uc-hasfront") !== null);

  // --- fill in the blank: no language asked for, and the blanks close on the front only ---
  await page.click("#stAddType");
  await sheetArmed(page);
  await page.click('.deck-menu [data-preset="cloze"]');
  await page.waitForTimeout(600);
  check("a shape with nothing to speak does not ask for a language",
    await page.$eval(".admin-ed-title", (el) => el.textContent) === "Fill in the blank",
    await page.$eval(".admin-ed-title", (el) => el.textContent).catch(() => "-"));

  const tabs = await page.$$(".studio-tab");
  for (const t of tabs) if (/^Cards/.test((await t.textContent()).trim())) { await t.click(); break; }
  await page.waitForTimeout(400);
  await page.click("#stAddCard");
  await page.waitForTimeout(400);
  await page.selectOption("#cesCardType", { label: "Fill in the blank" });
  await page.waitForTimeout(500);
  const boxes = await page.$$("[data-ufield]");
  check("a card of it offers one box per field", boxes.length === 3, String(boxes.length));
  await boxes[0].fill("The Battle of Hastings was fought in {{c1::1066}}.");
  await page.waitForTimeout(450);
  const q = await page.$eval("#stCardPv .question", (el) => el.innerHTML);
  const a = await page.$eval("#stCardPv .reveal-inner", (el) => el.innerHTML);
  check("the question closes the blank", q.indexOf("1066") < 0 && /Hastings/.test(q), q.replace(/\s+/g, " ").slice(-120));
  check("the answer opens it, marked", /1066/.test(a) && /uc-cloze-on/.test(a), a.replace(/\s+/g, " ").slice(0, 160));
  /* The other direction, and the reason the vocabulary rule is contingent on the template rather than on
     being typed at all: this back does NOT ask for the front, so the question stays above it — which is what
     leaves a reader's closed blank on the page beside what it should have been. */
  check("a back that does not ask for the front keeps the question above it",
    await page.$eval("#stCardPv .study-card > .question", (el) => getComputedStyle(el).display) !== "none");
  // the templates and CSS a preset ships are nobody's privilege — they pass the same sanitizers
  const injected = await page.$$eval("style[data-uct]", (els) => els.map((e) => e.textContent).join("\n"));
  check("every preset's stylesheet is scoped like anyone else's",
    injected.split("}").filter((r) => r.trim() && r.indexOf("@") < 0).every((r) => r.indexOf(".uc-card[data-uct=") >= 0),
    injected.slice(0, 90));
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
      let tx, all, notes;
      /* Since Aug 2026 a deck's cards live one record per note in a second store, and the deck record holds
         only an index of them — so the two are read together and put back in index order. Every assertion
         below then reads the same `cards` array it always did, which is what keeps this file testing card
         TYPES rather than the store's shape. A localStorage record (the file:// fallback) still carries its
         cards inline, and is passed through untouched. */
      try {
        tx = db.transaction(["decks", "notes"], "readonly");
        all = tx.objectStore("decks").getAll();
        notes = tx.objectStore("notes").getAll();
      } catch (e) { db.close(); return res(ls); }
      tx.oncomplete = () => {
        const byKey = {};
        (notes.result || []).forEach((n) => { if (n && n.c) byKey[n.k] = n.c; });
        const r = (all.result || []).map((d) => Object.assign({}, d, {
          cards: d.cards || (d.index || []).map((e) => byKey[d.id + "/" + e.id]).filter(Boolean),
        }));
        db.close();
        res(merge(r));
      };
      tx.onerror = () => { db.close(); res(ls); };
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
  /* The templates live in the canonical `cards` list — one entry for a one-card type — and the legacy
     top-level front/back are GONE from a stored record, which is what stops the two ever disagreeing. */
  check("the stored type carries its card templates", Array.isArray(t.cards) && t.cards.length === 1, JSON.stringify(t.cards && t.cards.length));
  check("…both sides of the one it has", /\{\{Latin\}\}/.test(t.cards[0].front) && /\{\{English\}\}/.test(t.cards[0].back));
  check("…and no stale top-level front/back beside them", !("front" in t) && !("back" in t), Object.keys(t).join(","));
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
        /* A note may make several cards, so a file can ask for any number of them — capped, or a deck could
           turn one note into hundreds of cards and a reader's daily review with it. */
        many: {
          id: "many", name: "Many", fields: ["A"],
          cards: Array.from({ length: 9 }, (_, i) => ({
            name: i === 3 ? '<img src=x onerror="alert(1)">' : "C" + i,
            front: i === 2 ? '<div onclick="alert(1)">{{A}}</div><script>alert(1)<\/script>' : "{{A}}",
            back: "{{A}}",
          })),
        },
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
  /* A file with no id of its own is given one. It used to mount under the empty string, which addressed the
     whole deck by "" — half working, and only for the first such import. */
  check("a deck file with no id is given one", !!h.id && /^[a-z0-9]{4,16}$/.test(h.id), JSON.stringify(h.id));
  const types = h.meta.types || {};
  check('a type may not call itself "basic"', !types.basic, JSON.stringify(Object.keys(types)));
  const bad = types.bad;
  check("the hostile type survived, cleaned", !!bad);
  if (bad) {
    const bt = (bad.cards || [])[0] || {};
    check("a field name that is markup is rejected", JSON.stringify(bad.fields) === JSON.stringify(["A"]), JSON.stringify(bad.fields));
    check("the legacy front/back folded into one card template", (bad.cards || []).length === 1, JSON.stringify((bad.cards || []).length));
    check("an inline handler is stripped from the front template", !/onclick/i.test(bt.front), bt.front);
    check("a <script> is stripped from the front template", !/<script/i.test(bt.front));
    check("{{A}} survives sanitizing", /\{\{A\}\}/.test(bt.front), bt.front);
    check("a javascript: href is stripped from the back template", !/javascript:/i.test(bt.back), bt.back);
    check("the CSS cannot close its <style>", bad.css.indexOf("<") < 0, bad.css.slice(0, 80));
    check("the CSS @import is gone", !/@import/i.test(bad.css));
    check("the CSS javascript: url is gone", !/javascript/i.test(bad.css));
    check("the CSS position:fixed is demoted", !/fixed/i.test(bad.css));
  }
  /* The card-template cap and the sanitizing of a template arriving in the `cards` list rather than at the
     top level — the same rules, on the new path, since that is the path every deck now travels by. */
  const many = types.many;
  check("a type asking for more card templates than the cap gets the cap", !!many && many.cards.length === 6, String(many && many.cards.length));
  if (many) {
    check("a template inside the list is sanitized too", !/onclick/i.test(many.cards[2].front) && !/<script/i.test(many.cards[2].front), many.cards[2].front);
    check("…and a template NAME that is markup is cleaned", !/</.test(many.cards[3].name), many.cards[3].name);
    check("a template still renders its field", /\{\{A\}\}/.test(many.cards[0].front), many.cards[0].front);
  }
  const card = (h.cards || [])[0];
  check("a hostile field VALUE is sanitized", !!card && !/onerror/i.test(JSON.stringify(card.fields || {})), JSON.stringify(card && card.fields));
  check("…and its text survives", !!card && /ok/.test(String((card.fields || {}).A || "")));
  check("a field name that isn't a field name is dropped", !!card && !("bad name!!" in (card.fields || {})));

  // and nothing executed along the way
  const alerts = await page.evaluate(() => window.__alerted || 0);
  check("nothing in the hostile deck executed", !alerts);
}


/* ---------- ONE NOTE, SEVERAL CARDS (Aug 2026) ----------
   A type may declare a LIST of card templates, and one note then makes one card per template — Anki's
   reverse cards. Nearly everything here fails silently, which is why the section is long:

     · THE FIRST TEMPLATE KEEPS THE BARE NOTE ID. That is the whole promise of the id scheme — adding a
       reverse card to a type must not move the schedule of the card a reader has been studying for a month —
       and nothing on screen would say if it broke.
     · SIBLINGS ARE NOT DEALT BACK TO BACK. The queue is template-major, so answering "water → 水" is not
       immediately followed by "水 → water", which would teach the answer rather than test it. A note-major
       queue is not an error anything reports; it just makes the feature useless.
     · EACH CARD IS SCHEDULED ON ITS OWN. Two ids in the schedule from one note, or the two directions share
       one interval and the reverse card is decoration.
     · REMOVING A TEMPLATE takes its cards' progress and NOTHING ELSE. The ids shift, so a survivor's record
       must still describe the survivor.
   The type is built through the real Studio (it is the new surface) and the notes arrive by an imported deck
   FILE, which exercises the travel of the templates at the same time. */

/* ---------------------------------------------------------------------------------------------------
   ONE CARD PER CLOZE (Aug 2026). Until this month Folio hid and revealed every blank on a card together
   and this file's own help text called it a deliberate simplification — a Folio card was one record, so
   there was nowhere for a second card to live. The note→several-cards machinery removed the reason.

   The sharpest assertions here are the two that no screen would report: that the ordinals may be SPARSE
   (c1, c2, c9 is three cards numbered 1, 2 and 9, not three cards numbered 1, 2 and 3 — building ids by
   position would deal `note~2` and `note~3`, which name deletions that do not exist), and that a type with
   the switch OFF renders exactly as every deck written before this shipped.
--------------------------------------------------------------------------------------------------- */
async function clozeChecks(page, base) {
  const deckFile = {
    folioDeck: 1,
    meta: {
      id: "cloze001",
      title: "Cloze deck",
      types: {
        // sparse ordinals on purpose, and a SECOND type with the switch off — the two must not behave alike
        gap: { id: "gap", name: "Gap", cloze: true, fields: ["Text", "Notes"], cards: [{ name: "Card 1", front: "<p>{{Text}}</p>", back: "{{FrontSide}}<i>{{Notes}}</i>" }] },
        together: { id: "together", name: "Together", fields: ["Text"], cards: [{ name: "Card 1", front: "<p>{{Text}}</p>", back: "{{FrontSide}}" }] },
      },
    },
    cards: [
      { id: "u_cloze001_1", type: "gap", fields: { Text: "The {{c1::Nile}} flows through {{c2::Egypt}} and rises in {{c9::Ethiopia}}.", Notes: "geography" } },
      { id: "u_cloze001_2", type: "gap", fields: { Text: "One blank only: {{c1::alpha}}.", Notes: "" } },
      { id: "u_cloze001_3", type: "gap", fields: { Text: "No markers here yet.", Notes: "" } },
      { id: "u_cloze001_4", type: "together", fields: { Text: "Both {{c1::one}} and {{c2::two}} at once." } },
    ],
  };
  const tmp = path.join(require("os").tmpdir(), "folio-cloze.folio-deck.json");
  fs.writeFileSync(tmp, JSON.stringify(deckFile));
  await page.goto(base + "/#studio");
  await page.reload();
  await page.waitForTimeout(900);
  const chooser = page.waitForEvent("filechooser");
  await page.click("#stImport");
  await (await chooser).setFiles(tmp);
  await page.waitForTimeout(1300);

  const rec = await readDecks(page);
  const deck = rec.find((r) => r.meta && r.meta.title === "Cloze deck");
  check("the cloze deck imported", !!deck);
  if (!deck) return;
  check("the `cloze` flag travels in the deck file", ((deck.meta.types || {}).gap || {}).cloze === true, JSON.stringify((deck.meta.types || {}).gap || {}).slice(0, 90));
  check("…and a type without it is not made one", !((deck.meta.types || {}).together || {}).cloze);

  /* The expansion is asserted through the SCHEDULE, which is the thing that matters: each card must be able
     to hold one. Adding the deck to the review and studying it deals the cards one at a time. */
  await page.evaluate((d) => {
    const s = JSON.parse(localStorage.getItem("folio_v1") || "{}");
    s.active = ["u:" + d];
    s.settings = Object.assign({}, s.settings, { newPerDay: 20, sfx: false, animations: false });
    // burying would put a note's other cards off until tomorrow, and this section is about which cards EXIST
    s.deckOpts = Object.assign({}, s.deckOpts, { ["u:" + d]: { burySiblings: false, newPerDay: 20, maxReviews: 200 } });
    localStorage.setItem("folio_v1", JSON.stringify(s));
  }, deck.id);
  await page.goto(base + "/#home");
  await page.reload();
  await page.waitForTimeout(1200);
  await page.evaluate(() => { const b = document.querySelector(".review-group .banner .cta .btn"); if (b) b.click(); });
  await page.waitForTimeout(1000);

  const seen = [];
  for (let i = 0; i < 8; i++) {
    const cur = await page.evaluate(() => {
      const rec2 = JSON.parse(sessionStorage.getItem("folio_study_v1") || "{}");
      const q2 = document.querySelector(".study-card .question");
      return { id: rec2.id || "", text: q2 ? q2.textContent.replace(/\s+/g, " ").trim() : "" };
    });
    if (!cur.id) break;
    seen.push(cur);
    await page.evaluate(() => { const b = document.querySelector("#reveal-btn"); if (b) b.click(); });
    await page.waitForTimeout(320);
    await page.evaluate(() => { const b = [...document.querySelectorAll("#gradebar .grade")].find((x) => /Easy/i.test(x.textContent)); if (b) b.click(); });
    await page.waitForTimeout(420);
  }

  const idsSeen = seen.map((s) => s.id);
  /* SPARSE ORDINALS. Three blanks numbered 1, 2 and 9 make three cards whose ids carry those numbers —
     `note~2` and `note~9`, never `note~2` and `note~3`. Getting this wrong deals a card that names a
     deletion the note has not got, which renders as a passage with nothing blanked at all. */
  check("a note with c1, c2 and c9 makes THREE cards", idsSeen.filter((i) => i.indexOf("u_cloze001_1") === 0).length === 3, idsSeen.join(" "));
  check("…numbered by the DELETION, not by position", idsSeen.includes("u_cloze001_1") && idsSeen.includes("u_cloze001_1~2") && idsSeen.includes("u_cloze001_1~9"), idsSeen.join(" "));
  check("a note with one blank makes one card", idsSeen.filter((i) => i.indexOf("u_cloze001_2") === 0).length === 1, idsSeen.join(" "));
  /* A note somebody is part-way through writing is still a card. Returning nothing would take it out of its
     own deck with nothing on screen to say why. */
  check("a note with no marker yet is still one card", idsSeen.includes("u_cloze001_3"), idsSeen.join(" "));
  check("a type with the switch OFF is one card however many blanks it has", idsSeen.filter((i) => i.indexOf("u_cloze001_4") === 0).length === 1, idsSeen.join(" "));

  /* THE OTHER BLANKS ARE SHOWN, which is the whole point: the rest of the sentence is what you are recalling
     from. Card 1 hides the Nile and shows Egypt and Ethiopia; card 2 hides Egypt and shows the other two. */
  const c1 = seen.find((s) => s.id === "u_cloze001_1"), c2 = seen.find((s) => s.id === "u_cloze001_1~2"), c9 = seen.find((s) => s.id === "u_cloze001_1~9");
  if (c1 && c2 && c9) {
    check("card 1 hides its own blank", !/Nile/.test(c1.text), c1.text);
    check("…and SHOWS the other two", /Egypt/.test(c1.text) && /Ethiopia/.test(c1.text), c1.text);
    check("card 2 hides the second blank and shows the first", !/Egypt/.test(c2.text) && /Nile/.test(c2.text), c2.text);
    check("card 9 hides the ninth and shows the rest", !/Ethiopia/.test(c9.text) && /Nile/.test(c9.text) && /Egypt/.test(c9.text), c9.text);
  } else {
    check("all three cloze cards were dealt", false, idsSeen.join(" "));
  }
  const both = seen.find((s) => s.id === "u_cloze001_4");
  if (both) check("with the switch off, EVERY blank is hidden together", !/one/.test(both.text) && !/two/.test(both.text), both.text);

  /* NOTE-MAJOR IS THE FAULT, template-major is the rule: a note's own blanks must not arrive back to back,
     or the second card is answered from the first rather than from memory. */
  const firstIdx = idsSeen.indexOf("u_cloze001_1"), secondIdx = idsSeen.indexOf("u_cloze001_1~2");
  check("a note's blanks are not dealt one after the other", firstIdx >= 0 && secondIdx >= 0 && Math.abs(secondIdx - firstIdx) > 1, idsSeen.join(" "));

  // each card carries a schedule of its OWN — the reason for splitting at all
  const sched = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("folio_v1") || "{}");
    return ["u_cloze001_1", "u_cloze001_1~2", "u_cloze001_1~9"].map((k) => !!(s.cards || {})[k]);
  });
  check("each blank has a schedule of its own", sched.every(Boolean), JSON.stringify(sched));
}

async function reverseChecks(page, base) {
  await page.goto(base + "/#studio");
  await page.reload();
  await page.waitForTimeout(900);
  await page.click("#stNew");
  await page.waitForTimeout(500);
  await page.click('[data-tab="types"]');
  await page.waitForTimeout(350);

  // --- the Two-way preset, and the template controls it produces
  await page.click("#stAddType");
  await sheetArmed(page);
  check("Add a type offers the Two-way shape", await page.$('.deck-menu [data-preset="two-way"]') !== null);
  await page.click('.deck-menu [data-preset="two-way"]');
  await page.waitForTimeout(600);
  check("the card-template controls are drawn", await page.$(".ut-cards") !== null);
  const opts = await page.$$eval("#stTplPick option", (o) => o.map((x) => x.textContent));
  check("the preset declares two card templates", opts.length === 2, opts.join(" | "));
  check("…named for their direction", /→/.test(opts[0]) && /→/.test(opts[1]), opts.join(" | "));
  check("the first is open", await page.$eval("#stTplName", (el) => el.value) === opts[0], opts[0]);
  check("a second template can be removed", await page.$("#stTplDel") !== null);
  const front1 = await page.$eval('[data-utype="front"]', (el) => el.value);
  await page.selectOption("#stTplPick", "1");
  await page.waitForTimeout(700);
  const front2 = await page.$eval('[data-utype="front"]', (el) => el.value);
  check("switching template opens the other one's own front", front1 !== front2 && /\{\{Back\}\}/.test(front2), front2.slice(0, 40));
  check("…and the picker says which of how many", /Card 2 of 2/.test(await page.$eval(".ut-cards .af-label", (el) => el.textContent.replace(/\s+/g, " "))));
  /* The preview follows the OPEN template rather than always the first — on a two-way type the card being
     edited is the second one half the time, and a preview that ignores that is answering another question. */
  const pv2 = await page.$eval("#stTypePv", (el) => el.textContent.replace(/\s+/g, " "));
  check("the preview follows the open template", /Back/.test(pv2), pv2.slice(0, 70));

  // --- three notes of a two-template type, arriving as a deck FILE
  const two = {
    folioDeck: 1,
    meta: {
      // an explicit id, as Folio's own export always writes — so the card ids below survive the import and
      // the assertions can name them. The idless case is covered on the hostile deck.
      id: "twoway01",
      title: "Two-way deck",
      types: {
        pair: {
          id: "pair", name: "Pair", fields: ["Word", "Meaning"],
          cards: [
            { name: "Word → Meaning", front: '<div class="uc-q">{{Word}}</div>', back: '{{FrontSide}}<div class="uc-a">{{Meaning}}</div>' },
            { name: "Meaning → Word", front: '<div class="uc-q">{{Meaning}}</div>', back: '{{FrontSide}}<div class="uc-a">{{Word}}</div>' },
          ],
        },
        // a LEGACY type in the same file: the shape every deck published before templates existed carries
        solo: { id: "solo", name: "Solo", fields: ["Q", "A"], front: "{{Q}}", back: "{{A}}" },
      },
    },
    cards: [
      { id: "u_twoway01_1", type: "pair", fields: { Word: "aqua", Meaning: "water" } },
      { id: "u_twoway01_2", type: "pair", fields: { Word: "ignis", Meaning: "fire" } },
      { id: "u_twoway01_3", type: "pair", fields: { Word: "terra", Meaning: "earth" } },
      { id: "u_twoway01_4", type: "solo", fields: { Q: "one way", A: "only" } },
    ],
  };
  const tmp = path.join(require("os").tmpdir(), "folio-twoway.folio-deck.json");
  fs.writeFileSync(tmp, JSON.stringify(two));
  await page.goto(base + "/#studio");
  await page.reload();
  await page.waitForTimeout(900);
  const chooser = page.waitForEvent("filechooser");
  await page.click("#stImport");
  await (await chooser).setFiles(tmp);
  await page.waitForTimeout(1300);

  const rec = await readDecks(page);
  const deck = rec.find((r) => r.meta && r.meta.title === "Two-way deck");
  check("the two-way deck imported", !!deck);
  if (!deck) return;
  const pair = (deck.meta.types || {}).pair, solo = (deck.meta.types || {}).solo;
  check("both card templates travelled in the file", !!pair && pair.cards.length === 2, JSON.stringify(pair && pair.cards.length));
  check("…with their names", !!pair && pair.cards[1].name === "Meaning → Word", pair && pair.cards[1].name);
  check("a LEGACY front/back type migrates to a one-card list", !!solo && solo.cards.length === 1 && /\{\{Q\}\}/.test(solo.cards[0].front), JSON.stringify(solo && solo.cards));

  // --- the ids and the ordering, read off the queue the study page actually builds
  await page.goto(base + "/#decks");
  await page.waitForTimeout(800);
  const added = await page.evaluate((did) => {
    const b = document.querySelector('[data-uadd="' + did + '"]');
    if (!b) return "no [data-uadd] for " + did + " — found: " + [...document.querySelectorAll("[data-uadd]")].map((x) => x.dataset.uadd).join(",") +
      " · rows: " + [...document.querySelectorAll(".udeck .collection-title")].map((x) => x.textContent).join("/");
    b.click();
    return "ok";
  }, deck.id);
  check("the deck can be added to the daily review", added === "ok", String(added).slice(0, 200));
  /* BURYING IS TURNED OFF FOR THIS DECK, deliberately: this section is about the ORDERING and about each
     direction carrying a schedule of its own, and with burying on (the default) the reverse cards are put off
     until tomorrow the moment their siblings are answered, so no session can ever reach both. Burying has a
     deck and a section of its own below. */
  await page.evaluate((did) => {
    const S = JSON.parse(localStorage.folio_v1 || "{}");
    S.settings = Object.assign({}, S.settings, { animations: false, newPerDay: 20, reviewRandom: false });
    S.deckOpts = Object.assign({}, S.deckOpts); S.deckOpts["u:" + did] = Object.assign({}, S.deckOpts["u:" + did], { burySiblings: false });
    localStorage.folio_v1 = JSON.stringify(S); localStorage.folio_tour_v1 = "no";
  }, deck.id);
  await page.goto(base + "/#home");
  await page.reload();
  await page.waitForTimeout(900);
  const pile = await page.$eval(".review-group .banner", (el) => el.textContent.replace(/\s+/g, " "));
  /* Seven cards from four notes: three notes of the two-way type make six, and the one-way note makes one.
     A count of four would mean the notes never expanded; a count of eight would mean the one-way note
     expanded too. */
  check("three two-way notes and one one-way note deal SEVEN cards", /\b7\s*New/.test(pile) || /7New/.test(pile), pile.slice(0, 90));

  await page.evaluate(() => document.querySelector("#b-review")?.click());
  await page.waitForTimeout(900);
  const queue = await page.evaluate(() => (JSON.parse(sessionStorage.folio_study_v1 || "{}").queue || []));
  check("the queue holds seven cards", queue.length === 7, JSON.stringify(queue));
  const bare = queue.filter((x) => x.indexOf("~") < 0), sib = queue.filter((x) => x.indexOf("~") >= 0);
  check("the FIRST template of every note keeps the bare note id", bare.length === 4, JSON.stringify(bare));
  check("…and only the second takes a suffix", sib.length === 3 && sib.every((x) => /~2$/.test(x)), JSON.stringify(sib));
  /* THE ORDERING ASSERTION. Template-major, so no note's two cards are neighbours — which is what makes a
     reverse card a test rather than a prompt WITHIN a session, where burying is what keeps them apart across
     the day. Asserted here with burying off, so it is the ordering being measured and not the burying. */
  let adjacent = 0;
  for (let i = 1; i < queue.length; i++) {
    const a = queue[i - 1].split("~")[0], b = queue[i].split("~")[0];
    if (a === b && queue[i - 1] !== queue[i]) adjacent++;
  }
  check("no note's two cards are dealt back to back", adjacent === 0, JSON.stringify(queue));

  // --- studying it: the two directions render their own template, and are scheduled apart
  const reveal = async () => {
    await page.evaluate(() => { const b = [...document.querySelectorAll(".actions button, .study-card button")].find((x) => /reveal|show answer/i.test(x.textContent + x.id + x.className)); if (b) b.click(); });
    await page.waitForTimeout(400);
  };
  const shown = async () => page.evaluate(() => ({
    q: (document.querySelector(".question") || {}).textContent.replace(/\s+/g, " ").trim(),
    tpl: document.querySelector(".uc-card") ? document.querySelector(".uc-card").dataset.uctpl : null,
  }));
  const first = await shown();
  check("a two-way card renders its own template", first.tpl === "1", JSON.stringify(first));
  await reveal();
  const back = await page.$eval(".reveal-inner", (el) => el.textContent.replace(/\s+/g, " ").trim());
  check("…and its back carries the front and then the answer", /aqua/.test(back) && /water/.test(back), back.slice(0, 60));
  // card info names which of the note's cards this is — the question a reverse card provokes
  await page.evaluate(() => document.querySelector("#cardInfo")?.click());
  await page.waitForTimeout(450);
  const ci = await page.evaluate(() => {
    const box = document.querySelector(".deck-menu.ci-sheet .dm-box");
    if (!box) return null;
    const keys = [...box.querySelectorAll(".ci-k")].map((e) => e.textContent.trim());
    const i = keys.indexOf("Card");
    return { keys: keys, val: i < 0 ? "" : [...box.querySelectorAll(".ci-v")][i].textContent.replace(/\s+/g, " ").trim(), where: (box.querySelector(".dm-where") || {}).textContent };
  });
  check("card info names which card of the note it is", !!ci && ci.keys.indexOf("Card") >= 0, ci ? ci.keys.join("/") : "no sheet");
  check("…by the template's own name, and which of how many", !!ci && /Word → Meaning/.test(ci.val) && /1 of 2/.test(ci.val), ci && ci.val);
  check("…and titles the sheet from a field, since a typed card has no answer", !!ci && /aqua|water/.test(ci.where || ""), ci && ci.where);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);

  await page.evaluate(() => document.querySelector('.grade[data-g="good"]')?.click());
  await page.waitForTimeout(600);
  const second = await shown();
  check("the next card is a DIFFERENT note, not the sibling", second.tpl === "1" && second.q !== first.q, JSON.stringify(second));

  // grade the rest so both directions of note 1 are scheduled
  for (let i = 0; i < 6; i++) {
    await reveal();
    await page.evaluate(() => document.querySelector('.grade[data-g="good"]')?.click());
    await page.waitForTimeout(420);
  }
  const sched = await page.evaluate(() => Object.keys(JSON.parse(localStorage.folio_v1 || "{}").cards || {}));
  check("each direction is scheduled on its own", sched.indexOf("u_twoway01_1") >= 0 && sched.indexOf("u_twoway01_1~2") >= 0, JSON.stringify(sched));
  check("…and the one-way note has exactly one schedule", sched.filter((x) => x.indexOf("u_twoway01_4") === 0).length === 1, JSON.stringify(sched.filter((x) => x.indexOf("u_twoway01_4") === 0)));

  // --- removing a template takes ITS cards' progress and nothing else
  await page.goto(base + "/#studio");
  await page.reload();
  await page.waitForTimeout(900);
  const opened = await page.evaluate((did) => {
    const b = document.querySelector('[data-open="' + did + '"]');
    if (!b) return "no [data-open] for " + did + " — " + [...document.querySelectorAll("[data-open]")].map((x) => x.dataset.open).join(",");
    b.click();
    return "ok";
  }, deck.id);
  check("the deck reopens in the Studio", opened === "ok", String(opened).slice(0, 120));
  await page.waitForTimeout(800);
  await page.click('[data-tab="types"]');
  await page.waitForTimeout(400);
  await page.evaluate(() => { const b = [...document.querySelectorAll("[data-topensel]")].find((x) => /Pair/.test(x.textContent)); if (b) b.click(); });
  await page.waitForTimeout(600);
  await page.selectOption("#stTplPick", "1");
  await page.waitForTimeout(700);
  check("the second template is open, ready to remove", /Card 2 of 2/.test(await page.$eval(".ut-cards .af-label", (el) => el.textContent.replace(/\s+/g, " "))));
  await page.click("#stTplDel");
  await page.waitForTimeout(400);
  // it asks first — this is the only thing in the Studio that destroys a schedule
  const asked = await page.$(".inline-prompt, .ip-box");
  check("removing a card template asks first", asked !== null);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll(".inline-prompt button, .ip-box button")].find((x) => /remove the card/i.test(x.textContent));
    if (b) b.click();
  });
  await page.waitForTimeout(1100);
  const after = await page.evaluate(() => Object.keys(JSON.parse(localStorage.folio_v1 || "{}").cards || {}));
  check("the removed template's cards lose their schedule", after.every((x) => !/~2$/.test(x)), JSON.stringify(after.filter((x) => /~/.test(x))));
  check("…and the surviving card keeps its own", after.indexOf("u_twoway01_1") >= 0, JSON.stringify(after.slice(0, 4)));
  const rec2 = await readDecks(page);
  const d2 = rec2.find((r) => r.meta && r.meta.title === "Two-way deck");
  check("the type is down to one card template", !!d2 && d2.meta.types.pair.cards.length === 1, JSON.stringify(d2 && d2.meta.types.pair.cards.length));
}

/* ---------- BURYING SIBLINGS (Aug 2026, on request) ----------
   Template-major ordering keeps a note's two cards apart WITHIN a session; burying keeps them apart across
   the DAY, which ordering cannot do — a second session, or a deck small enough that the two meet anyway.
   Everything here fails quietly: a register that stops being read means a reader is asked "水 → water" an
   hour after "water → 水", which tests the last hour and not the memory, and nothing reports it.

   The one thing to be careful about in reading this section: burying makes the day's count fall by MORE than
   the number of cards answered, which is exactly what looks like a bug, so the study page says so once. */
async function buryChecks(page, base) {
  const deck = {
    folioDeck: 1,
    meta: {
      id: "burydeck", title: "Bury deck",
      types: {
        pair: {
          id: "pair", name: "Pair", fields: ["Word", "Meaning"],
          cards: [
            { name: "Word → Meaning", front: "{{Word}}", back: "{{Meaning}}" },
            { name: "Meaning → Word", front: "{{Meaning}}", back: "{{Word}}" },
          ],
        },
      },
    },
    cards: [
      { id: "u_burydeck_1", type: "pair", fields: { Word: "unus", Meaning: "one" } },
      { id: "u_burydeck_2", type: "pair", fields: { Word: "duo", Meaning: "two" } },
    ],
  };
  const tmp = path.join(require("os").tmpdir(), "folio-bury.folio-deck.json");
  fs.writeFileSync(tmp, JSON.stringify(deck));
  await page.goto(base + "/#studio");
  await page.reload();
  await page.waitForTimeout(900);
  const chooser = page.waitForEvent("filechooser");
  await page.click("#stImport");
  await (await chooser).setFiles(tmp);
  await page.waitForTimeout(1300);

  await page.goto(base + "/#decks");
  await page.waitForTimeout(800);
  const added = await page.evaluate(() => {
    const b = document.querySelector('[data-uadd="burydeck"]');
    if (!b) return false;
    b.click();
    return true;
  });
  check("the bury deck is added to the review", added);
  /* THE REVIEW IS NARROWED TO THIS DECK, and it has to be: burying is per deck, and the counts below are read
     off the pooled banner, so the two-way deck left over from the section above would be counted too — its
     seven cards reappear the moment `S.cards` is cleared to set up a case here, and the pile assertion then
     measures both decks at once. */
  await page.evaluate(() => {
    const S = JSON.parse(localStorage.folio_v1 || "{}");
    S.active = ["u:burydeck"];
    S.buried = {};
    S.settings = Object.assign({}, S.settings, { animations: false, newPerDay: 20, reviewRandom: false });
    localStorage.folio_v1 = JSON.stringify(S);
    localStorage.folio_tour_v1 = "no";
    sessionStorage.removeItem("folio_study_v1");
  });
  await page.goto(base + "/#home");
  await page.reload();
  await page.waitForTimeout(900);

  /* The switch is offered on a deck that HAS siblings and on no other — the same test the read-aloud switch
     makes, since a control that cannot change anything is worse than none. */
  await page.evaluate(() => {
    const row = [...document.querySelectorAll("[data-review]")].find((x) => /Bury deck/.test(x.textContent));
    if (row) row.dispatchEvent(new Event("contextmenu", { bubbles: true }));
  });
  await page.waitForTimeout(500);
  const rows = await page.evaluate(() => [...document.querySelectorAll(".deck-menu .dm-item")].map((x) => (x.querySelector("b") || x).textContent.trim()));
  check("a deck whose notes make several cards offers Bury siblings", rows.includes("Bury siblings"), rows.join(" / "));
  const on = await page.evaluate(() => {
    const r = [...document.querySelectorAll(".dm-switch")].find((x) => /Bury siblings/.test(x.textContent));
    return r ? r.querySelector(".switch").classList.contains("on") : null;
  });
  // Anki's default, and the behaviour that makes a note with several cards work without being found first
  check("…and it starts ON", on === true, String(on));

  /* BOTH DIRECTIONS TOGETHER sits above it and DERIVES it off (Aug 2026, on request: "I want them
     interleaved"). Two things fail silently: a switch that writes nothing, and a bury row left saying
     "waits until tomorrow" beside a value the pair switch has just turned off — two controls disagreeing
     on one screen. The sheet must not repaint (render() closes it), so the row is re-stated in place. */
  check("…and Both directions together is offered above it", rows.includes("Both directions together"),
        rows.join(" / "));
  await page.evaluate(() => {
    const r = [...document.querySelectorAll(".dm-switch")].find((x) => /Both directions together/.test(x.textContent));
    if (r) r.click();
  });
  await page.waitForTimeout(300);
  const paired = await page.evaluate(() => {
    const row = (re) => [...document.querySelectorAll(".dm-switch")].find((x) => re.test(x.textContent));
    const p = row(/Both directions together/), b = row(/Bury siblings/);
    const S = JSON.parse(localStorage.getItem("folio_v1") || "{}");
    return {
      open: !!document.querySelector(".deck-menu"),
      pairOn: p && p.querySelector(".switch").classList.contains("on"),
      stored: ((S.deckOpts || {})["u:burydeck"] || {}).pairNew,
      buryOn: b && b.querySelector(".switch").classList.contains("on"),
      buryLocked: b && b.classList.contains("row-locked"),
      buryNote: b ? b.querySelector("small").textContent : "",
    };
  });
  check("throwing it writes the setting and leaves the sheet open",
        paired.open && paired.pairOn === true && paired.stored === true, JSON.stringify(paired));
  check("…and the bury row is re-stated in place: off, dimmed, and saying why",
        paired.buryOn === false && paired.buryLocked === true && /both directions/i.test(paired.buryNote),
        JSON.stringify(paired));
  await page.evaluate(() => {          // …and back off, so the rest of this section measures burying
    const r = [...document.querySelectorAll(".dm-switch")].find((x) => /Both directions together/.test(x.textContent));
    if (r) r.click();
  });
  await page.waitForTimeout(300);
  const restored = await page.evaluate(() => {
    const b = [...document.querySelectorAll(".dm-switch")].find((x) => /Bury siblings/.test(x.textContent));
    return b ? { on: b.querySelector(".switch").classList.contains("on"), locked: b.classList.contains("row-locked") } : null;
  });
  check("turning it back off restores burying", restored && restored.on === true && restored.locked === false,
        JSON.stringify(restored));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);

  // four cards from two notes
  const before = await page.evaluate(() => (document.querySelector(".review-group .banner") || {}).textContent.replace(/\s+/g, " "));
  check("two two-way notes deal four cards", /\b4\s*New|4New/.test(before), before.slice(0, 80));

  await page.evaluate(() => document.querySelector("#b-review")?.click());
  await page.waitForTimeout(800);
  const first = await page.evaluate(() => (JSON.parse(sessionStorage.folio_study_v1 || "{}").queue || [])[0]);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll(".actions button, .study-card button")]
      .find((x) => /reveal|show answer/i.test(x.textContent + x.id + x.className));
    if (b) b.click();
  });
  await page.waitForTimeout(350);
  await page.evaluate(() => document.querySelector('.grade[data-g="good"]')?.click());
  await page.waitForTimeout(700);

  const st = await page.evaluate(() => JSON.parse(localStorage.folio_v1 || "{}"));
  const sib = first + "~2";
  check("answering one card buries its sibling", !!(st.buried || {})[sib], JSON.stringify(st.buried));
  /* The register holds the DAY, not `true`, so it expires by being read rather than by anything running at
     midnight — which is what lets the reader's own day boundary decide when a buried card comes back. */
  check("…recorded as the day rather than a flag", /^\d{4}-\d{2}-\d{2}$/.test(String((st.buried || {})[sib])), String((st.buried || {})[sib]));
  check("…and the card just answered is NOT buried", !(st.buried || {})[first], JSON.stringify(st.buried));
  // it leaves the LIVE queue too: the queue in hand was built before the grade
  const q = await page.evaluate(() => (JSON.parse(sessionStorage.folio_study_v1 || "{}").queue || []));
  check("the buried sibling leaves the session in hand", q.indexOf(sib) < 0, JSON.stringify(q));
  // …and it is said once, because the day's count falling by two when one card was answered reads as a bug
  const toast = await page.evaluate(() => (document.querySelector("#toast") || {}).textContent || "");
  check("…and the reader is told why the count fell by two", /put off until tomorrow/i.test(toast), toast.slice(0, 90));

  /* Undo gives it back — a grade that buried a sibling must be undoable whole. Pressed on the VISIBLE control
     rather than with Ctrl+Z, which is the same code path and is already pinned by test-revlog: the key reaches
     the card's handler only while nothing else has the keyboard, and this section has just been through a
     deck sheet and a focus trap. */
  await page.evaluate(() => document.querySelector("#undoGrade")?.click());
  await page.waitForTimeout(600);
  const back = await page.evaluate(() => (JSON.parse(localStorage.folio_v1 || "{}").buried) || {});
  check("undoing the grade un-buries the sibling", !back[sib], JSON.stringify(back));

  /* With the switch OFF the sibling is not buried — asserted because a default-on setting that cannot be
     turned off is indistinguishable from a hard-coded rule. */
  await page.evaluate((d) => {
    const S = JSON.parse(localStorage.folio_v1 || "{}");
    S.deckOpts = S.deckOpts || {};
    S.deckOpts[d] = Object.assign({}, S.deckOpts[d], { burySiblings: false });
    S.buried = {};
    S.cards = {};
    localStorage.folio_v1 = JSON.stringify(S);
    sessionStorage.removeItem("folio_study_v1");
  }, "u:burydeck");
  await page.reload();
  await page.waitForTimeout(900);
  await page.evaluate(() => document.querySelector("#b-review")?.click());
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll(".actions button, .study-card button")]
      .find((x) => /reveal|show answer/i.test(x.textContent + x.id + x.className));
    if (b) b.click();
  });
  await page.waitForTimeout(350);
  await page.evaluate(() => document.querySelector('.grade[data-g="good"]')?.click());
  await page.waitForTimeout(600);
  const off = await page.evaluate(() => (JSON.parse(localStorage.folio_v1 || "{}").buried) || {});
  check("with the switch off nothing is buried", Object.keys(off).length === 0, JSON.stringify(off));

  /* A buried card comes back TOMORROW. Rather than waiting a day, the register is aged by a day — which is
     the same thing from the code's point of view, and is what proves the expiry is read rather than swept. */
  await page.evaluate((d) => {
    const S = JSON.parse(localStorage.folio_v1 || "{}");
    S.deckOpts[d] = Object.assign({}, S.deckOpts[d], { burySiblings: true });
    S.cards = {};
    const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    S.buried = { "u_burydeck_1~2": y, "u_burydeck_2~2": new Date().toISOString().slice(0, 10) };
    localStorage.folio_v1 = JSON.stringify(S);
    sessionStorage.removeItem("folio_study_v1");
  }, "u:burydeck");
  await page.reload();
  await page.waitForTimeout(900);
  const piles = await page.evaluate(() => (document.querySelector(".review-group .banner") || {}).textContent.replace(/\s+/g, " "));
  /* Three of the four: yesterday's burial has expired and today's has not. A count of 4 would mean the
     register is never read; a count of 2 would mean it never expires. */
  check("yesterday's burial has expired and today's has not", /\b3\s*New|3New/.test(piles), piles.slice(0, 80));
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
    await presetChecks(page, base);
    await hostileChecks(page, base);
    await reverseChecks(page, base);
    await buryChecks(page, base);
    await clozeChecks(page, base);
  } catch (e) {
    check("the run completed", false, String(e && e.message).split("\n")[0]);
  }

  check("no uncaught page errors", errs.length === 0, errs.slice(0, 3).join(" | "));
  await browser.close();
  server.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
