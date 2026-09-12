#!/usr/bin/env node
// Regression test for the ENGLISH-ONLY gate, and for the fact that NOTHING IS LEFT BEHIND IT.
//
//   node .claude/test-i18n-lang.js
//
// Re-run after touching MULTILANG / loadLangData / gamesI18nPending / glossI18nFiles / DATA_BUNDLES,
// or if anything proposes to restore a translation file.
//
// WHAT CHANGED, IN TWO STEPS. On 2026-08-08 the card `i18n` blocks and every i18n/gloss-<lang>.js
// were removed on request — 2.06 MB of the eager path no reader could reach. In Sep 2026, also on
// request, the REST went: i18n/ui-, games- and places-<lang>.js, the whole i18n/ directory, and the
// 44 tree-node title blocks in data.js. So the half of this suite that drove the lazy per-language
// LOADER is gone with the files it loaded, and what replaces it is the assertion that matters now:
//
//  · The gate itself, served UNPATCHED: ?lang= does not switch, Settings offers no picker, a stored
//    non-English language is migrated back, and no translation file is requested.
//  · THE REMOVAL STAYS REMOVED, checked on disk rather than in the browser — no card `i18n` block,
//    no tree-node `i18n` block, no i18n/ directory at all, and no inline translations in the two
//    eager game pools (the quotes.js mistake: 27 KB -> 312 KB for every visitor).
//  · AND THE ENGINE SURVIVES A FLAG FLIP WITHOUT A TABLE. This is the new one, and it is the fault
//    the removal could actually cause: `langBundle` is deleted, so a leftover call to it would be a
//    ReferenceError the moment MULTILANG moved — invisible until then, because `code === "en"`
//    short-circuits it away. The suite serves an app.js with the flag flipped, switches language,
//    and asserts the page neither throws nor fetches anything: every accessor falls back to English.
//    One such call really was left behind and this is what would have caught it.
//
// Playwright is a dev dependency and must NOT be installed into the repo. Install it in a scratch
// folder and run with NODE_PATH=<that>/node_modules; set FOLIO_CHROMIUM if Chromium lives elsewhere.
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");
const http = require("http"), fs = require("fs"), path = require("path");

const ROOT = path.join(__dirname, "..");
const PORT = 8137;
const MIME = { ".js": "text/javascript", ".css": "text/css", ".html": "text/html", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png" };

let pass = 0, fail = 0;
const ok = (name, cond, extra) => {
  cond ? pass++ : fail++;
  console.log((cond ? "ok   " : "FAIL ") + " " + name + (extra !== undefined ? "  " + JSON.stringify(extra).slice(0, 110) : ""));
};

/* The site is ENGLISH-ONLY (`const MULTILANG = false` in app.js). That gate is asserted below,
   UNPATCHED, and by test-layout.js. The lazy per-language LOADER behind the flag is deliberately kept
   so the remaining languages can be turned back on in one edit, so this server flips the flag as it
   serves app.js to exercise it. `patchApp` asserts the string was actually found: if the flag is
   renamed or removed, the test fails loudly here rather than quietly running against an app that can
   no longer switch language at all. */
const MULTILANG_OFF = "const MULTILANG = false;";
let patchedApp = false;
function patchApp(buf) {
  const src = buf.toString("utf8");
  if (src.indexOf(MULTILANG_OFF) < 0) return null;
  patchedApp = true;
  return Buffer.from(src.replace(MULTILANG_OFF, "const MULTILANG = true;"), "utf8");
}
function serve(patch) {
  return http.createServer((req, res) => {
    const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]).replace(/^\//, "") || "index.html");
    fs.readFile(p, (e, buf) => {
      if (e) { res.writeHead(404); res.end("not found"); return; }
      if (patch && path.basename(p) === "app.js") { const out = patchApp(buf); if (out) buf = out; }
      res.writeHead(200, { "Content-Type": MIME[path.extname(p)] || "application/octet-stream" });
      res.end(buf);
    });
  }).listen(PORT);
}

(async () => {
  /* ---------- static checks: the files on disk ------------------------------------------- */
  global.window = {}; require(path.join(ROOT, "glossary.js")); require(path.join(ROOT, "data.js"));
  const GLOSS = global.window.GLOSSARY, CARDS = global.window.CARD_DATA;

  /* THE REMOVAL STAYS REMOVED. `add-card.js` and `add-lang.js` can both still WRITE an i18n block, and
     a card carrying one costs every visitor its bytes in the eager path whether or not any reader can
     reach it. Nothing else in the suite would notice. */
  const withI18n = CARDS.filter((c) => c.i18n && Object.keys(c.i18n).length).map((c) => c.id);
  ok("no card carries a translation block", withI18n.length === 0,
    withI18n.length + " of " + CARDS.length + (withI18n.length ? ": " + withI18n.slice(0, 5).join(", ") : ""));
  /* THE WHOLE DIRECTORY IS GONE (Sep 2026), which is the cheapest thing to assert and the one a
     tool is most likely to undo by accident: add-lang.js and the three i18n IO modules all called
     `mkdirSync(DIR, { recursive: true })` on the way to writing, so a single run would have put the
     folder back carrying one language's files that nothing loads. add-lang.js now refuses outright
     and the IO modules are deleted; this is what says so. */
  ok("the i18n/ directory is gone", !fs.existsSync(path.join(ROOT, "i18n")));

  /* A TREE NODE'S TITLE TRANSLATIONS WENT WITH THEM, and they are the half nobody would look for:
     they lived INSIDE data.js rather than in i18n/, so the directory check above cannot see them,
     and `nodeTitle()` falls back to the English title so nothing on the page would say they had
     come back. 44 blocks, 14.6 KB, on the EAGER path. */
  const treeI18n = [];
  (function walk(n) {
    if (!n || typeof n !== "object") return;
    if (Array.isArray(n)) return n.forEach(walk);
    if (n.i18n) treeI18n.push(n.id || "?");
    for (const k of ["collections", "children"]) if (n[k]) walk(n[k]);
  })(global.window.COLLECTION_TREE);
  ok("no tree node carries title translations", treeI18n.length === 0, treeI18n.slice(0, 5));

  ok("...while the English glossary and cards are untouched", Object.keys(GLOSS).length > 700 && CARDS.length > 300,
    { terms: Object.keys(GLOSS).length, cards: CARDS.length });

  /* THE TWO GAME POOLS ARE IN THE EAGER PATH, so a translation inlined into either is bytes in every
     visitor's first paint. Checked on disk rather than in the browser: this is the quotes.js mistake
     (27 KB -> 312 KB), and it is the shape a well-meaning restore would take. */
  const gEnv = {}; { const w = global.window; global.window = gEnv; require(path.join(ROOT, "quotes.js")); require(path.join(ROOT, "truefalse.js")); global.window = w; }
  const inlineQ = (gEnv.QUOTEGAME || []).filter((x) => x.i18n).length;
  const inlineT = (gEnv.TRUEFALSE || []).filter((x) => x.i18n).length;
  ok("the eager game pools carry no inline translations", inlineQ === 0 && inlineT === 0, { quotes: inlineQ, truefalse: inlineT });

  /* AND NOTHING IN THE SHIPPED SITE STILL POINTS AT A DELETED FILE. A bundle registration outliving
     its files is a 404 per language, which is exactly what the gloss bundle did for the hour after
     the 2026-08-08 removal. Comments are allowed to mention the path; a string that would be FETCHED
     is not, so this looks for the shapes a loader uses rather than for the word. */
  const appSrc = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  const loaders = (appSrc.match(/files:\s*\[\s*"i18n\//g) || []).concat(appSrc.match(/"i18n\/" \+/g) || []);
  ok("app.js registers no bundle pointing into i18n/", loaders.length === 0, loaders.slice(0, 3));
  ok("...and langBundle is gone rather than left uncalled",
    !/function\s+langBundle\s*\(/.test(appSrc) && !/[^.\w]langBundle\s*\(/.test(appSrc.replace(/\/\/[^\n]*/g, "")));

  /* ---------- browser checks ------------------------------------------------------------- */
  const browser = await chromium.launch({ executablePath: process.env.FOLIO_CHROMIUM });
  const errs = [];
  const watch = (pg) => {
    pg.on("pageerror", (e) => errs.push("pageerror: " + e.message));
    pg.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !isNoise(t)) errs.push("console: " + t.slice(0, 300)); });
  };
  const url = (q) => "http://localhost:" + PORT + "/" + (q || "");

  /* ---------- the ENGLISH-ONLY gate, served UNPATCHED ------------------------------------- */
  {
    const plain = serve(false);
    const g = await (await browser.newContext()).newPage(); watch(g);
    const asked = [];
    g.on("request", (r) => { if (r.url().includes("/i18n/")) asked.push(r.url().split("/").pop()); });
    await g.goto(url("?lang=ja#settings"), { waitUntil: "networkidle" });
    await g.waitForTimeout(1500);
    const st = await g.evaluate(() => ({
      // undefined until something writes the store — a fresh reader is English and has nothing to save
      lang: (JSON.parse(localStorage.getItem("folio_v1") || "{}").settings || {}).lang || "en",
      opts: document.querySelectorAll("#langGrid .lang-opt").length,
      // the visible proof, whatever the store says: the chrome is still in English
      tabs: [...document.querySelectorAll(".tab .tab-label, .tab")].map((t) => t.textContent.trim()).join("|"),
    }));
    ok("english-only: a ?lang= link does not switch the site", st.lang === "en" && !/[ぁ-んァ-ヶ一-龯]/.test(st.tabs), st);
    ok("english-only: the Settings page offers no picker", st.opts === 0, st);
    ok("english-only: and no translation file is fetched", asked.length === 0, asked);
    await g.context().close();
    await new Promise((r) => plain.close(r));
  }

  /* ---------- the flag flipped, with nothing behind it ------------------------------------
     THE FAULT THIS CATCHES IS INVISIBLE UNTIL THE FLAG MOVES. `langBundle` is deleted, and the call
     that survived it sat inside `code === "en" || dataReady(langBundle("uiI18n", code))` — where the
     left operand short-circuits the right away for every reader the site currently has. Flip the flag
     and it is a ReferenceError that takes the language switch, and the render after it, with it.
     So: serve the flipped app, switch to a non-English language through the real picker, and require
     that the page neither throws nor asks for a file. Every accessor falls back to English, which is
     the honest end state now that no table survives. */
  const srv = serve(true);
  const ctx = await browser.newContext();
  const pg = await ctx.newPage(); watch(pg);
  const fetched = [];
  pg.on("request", (r) => { if (r.url().includes("/i18n/")) fetched.push(r.url().split("/").pop()); });
  await pg.goto(url("?lang=ja"), { waitUntil: "networkidle" });
  await pg.waitForTimeout(1200);
  ok("with MULTILANG on, a language switch fetches nothing", fetched.length === 0, fetched);
  ok("...and the site language really did change", await pg.evaluate(() =>
    (JSON.parse(localStorage.getItem("folio_v1") || "{}").settings || {}).lang === "ja"));
  ok("...while the chrome falls back to English rather than to nothing", await pg.evaluate(() => {
    const t = [...document.querySelectorAll(".tab .tab-label, .tab")].map((x) => x.textContent.trim()).join("|");
    return t.length > 0 && !/[ぁ-んァ-ヶ一-龯]/.test(t);
  }));

  // the picker lives on the Settings page; switching again is the path that held the deleted call
  await pg.evaluate(() => { location.hash = "settings"; });
  await pg.waitForTimeout(400);
  const hadPicker = await pg.evaluate(() => !!document.querySelector('.lang-opt[data-lang="ru"]'));
  ok("with the flag on, the Settings picker is offered", hadPicker);
  await pg.evaluate(() => { const o = document.querySelector('.lang-opt[data-lang="ru"]'); if (o) o.click(); });
  await pg.waitForTimeout(1200);
  ok("switching language again neither throws nor fetches", fetched.length === 0 && errs.length === 0, { fetched, errs: errs.slice(0, 2) });
  ok("...and the switch was recorded", await pg.evaluate(() =>
    (JSON.parse(localStorage.getItem("folio_v1") || "{}").settings || {}).lang === "ru"));

  // a card's and a deck's prose are English now whatever the reading language
  await pg.evaluate(() => { location.hash = "home"; });
  await pg.waitForTimeout(600);
  ok("a card carries no translation to fall back from", await pg.evaluate(() => {
    const c = (window.CARD_DATA || [])[0];
    return !!c && !c.i18n;
  }));

  const en = await ctx.newPage(); watch(en);
  const f2 = [];
  en.on("request", (r) => { if (r.url().includes("/i18n/")) f2.push(r.url()); });
  await en.goto(url("?lang=en"), { waitUntil: "networkidle" });
  await en.waitForTimeout(800);
  ok("an English reader fetches no translation file at all", f2.length === 0, f2);

  ok("the MULTILANG flag was found and flipped for these checks", patchedApp);
  ok("no console or page errors", errs.length === 0, errs.slice(0, 3));

  await browser.close(); srv.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
