#!/usr/bin/env node
// Regression test for the ENGLISH-ONLY gate and for the per-language translation files that remain
// (i18n/ui-<lang>.js, i18n/games-<lang>.js, i18n/places-<lang>.js).
//
//   node .claude/test-i18n-lang.js
//
// Re-run after touching MULTILANG / langBundle / loadLangData / DATA_BUNDLES, or after adding a language.
//
// WHAT CHANGED ON 2026-08-08: the card `i18n` blocks and every i18n/gloss-<lang>.js were REMOVED on
// request — the site ships in English and the translations were 2.06 MB of the eager path that no
// reader could reach. So the assertions that used to check gloss-file parity, card-translation parity,
// and the per-language glossary overlay/bake are gone with the data they described. What is left is
// what still has teeth:
//  · The gate itself, served UNPATCHED: ?lang= does not switch, Settings offers no picker, a stored
//    non-English language is migrated back, and NOT ONE translation file is fetched.
//  · The removal STAYS removed. A batch script that re-inlines card translations would put megabytes
//    back into every visitor's first paint without anything else noticing — that is the quotes.js
//    mistake, and this is the only thing watching for its return.
//  · One language in, one language out, for the families that still ship. That split is the whole
//    point of the layout; a regression restores a multi-megabyte download for every non-English reader.
//  · The game pools carry no INLINE translations. They are in the eager path, so an inline copy would
//    put nine languages of prose into every first paint (quotes.js went 27 KB -> 312 KB that way).
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
  const glossFiles = fs.readdirSync(path.join(ROOT, "i18n")).filter((f) => /^gloss-[\w-]+\.js$/.test(f));
  ok("...and no glossary translation file is on disk", glossFiles.length === 0, glossFiles);
  ok("...while the English glossary and cards are untouched", Object.keys(GLOSS).length > 700 && CARDS.length > 300,
    { terms: Object.keys(GLOSS).length, cards: CARDS.length });

  /* The chrome files DO still ship (they were not part of the removal), and none of the nine may fall
     behind the others — a batch that translated one and forgot the rest fails here. */
  const ui = {};
  for (const f of fs.readdirSync(path.join(ROOT, "i18n"))) {
    if (/^ui-[\w-]+\.js$/.test(f)) new Function("window", fs.readFileSync(path.join(ROOT, "i18n", f), "utf8"))(ui);
  }
  ok("Japanese chrome is at parity with Spanish",
    Math.abs(Object.keys(ui.I18N.ja).length - Object.keys(ui.I18N.es).length) <= 8 &&
    ui.I18N_RULES.ja.length === ui.I18N_RULES.es.length &&
    Object.keys(ui.I18N_HTML.ja).length === Object.keys(ui.I18N_HTML.es).length,
    { exact: Object.keys(ui.I18N.ja).length, rules: ui.I18N_RULES.ja.length, html: Object.keys(ui.I18N_HTML.ja).length });
  ok("rule patterns match across languages in the same order",
    JSON.stringify(ui.I18N_RULES.ja.map((r) => r[0])) === JSON.stringify(ui.I18N_RULES.es.map((r) => r[0])));

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

  /* ---------- the loader behind the flag, served WITH it flipped -------------------------- */
  const srv = serve(true);

  // one language in, one language out
  const ctx = await browser.newContext();
  const pg = await ctx.newPage(); watch(pg);
  const fetched = [];
  pg.on("request", (r) => { if (r.url().includes("/i18n/")) fetched.push(r.url().split("/").pop()); });
  await pg.goto(url("?lang=ja"), { waitUntil: "networkidle" });
  await pg.waitForTimeout(1500);
  // Every per-language family that still SHIPS, for that language, and nothing for the other eight (see
  // langBundle in app.js). Asserted as a property rather than a count, so adding a family doesn't need a
  // new number here — what must never change is that no other language is fetched. `gloss-` is no longer
  // in this list because the files were removed; the bundle entry is inert and never resolves.
  const FAMILIES = ["ui-", "games-", "places-"];
  ok("only the current language's files are fetched", fetched.length > 0 && fetched.every((f) => f.endsWith("-ja.js")), fetched);
  ok("every per-language family that still ships is fetched", FAMILIES.every((p) => fetched.some((f) => f.startsWith(p))), fetched);
  ok("...and no glossary translation is requested", !fetched.some((f) => f.startsWith("gloss-")), fetched);
  ok("the chrome is localized", (await pg.$$eval(".tab", (ts) => ts.map((t) => t.textContent.trim()))).includes("ホーム"));
  // the English glossary is what every reader now sees, in every language
  ok("a glossary description falls back to the English", await pg.evaluate(() => {
    const k = Object.keys(window.GLOSSARY)[0];
    return !(window.GLOSSARY_I18N && window.GLOSSARY_I18N[k] && window.GLOSSARY_I18N[k].ja);
  }));

  fetched.length = 0;
  // the picker lives on the Settings page (Aug 2026 — it was a top-bar dropdown before that)
  await pg.evaluate(() => { location.hash = "settings"; });
  await pg.waitForTimeout(400);
  await pg.evaluate(() => { const o = document.querySelector('.lang-opt[data-lang="ru"]'); if (o) o.click(); });
  await pg.waitForTimeout(1500);
  ok("switching pulls only the new language", fetched.length > 0 && fetched.every((f) => f.endsWith("-ru.js")), fetched);

  // The game pools are in the EAGER load path, so their translations must live in the lazy
  // i18n/games-<lang>.js and NOT inline in truefalse.js / quotes.js — an inline copy would put nine
  // languages of prose into every visitor's first paint.
  ok("the game pools carry no inline translations", await pg.evaluate(() =>
    (window.QUOTEGAME || []).every((x) => !x.i18n) && (window.TRUEFALSE || []).every((x) => !x.i18n)));
  ok("the lazy games table reached the running app", await pg.evaluate(() =>
    document.querySelectorAll('script[src*="games-ru.js"]').length === 1));
  await pg.evaluate(() => { location.hash = "whosaid"; });
  await pg.waitForTimeout(1800);
  const wsRu = await pg.evaluate(() => (document.querySelector(".ws-quote") || {}).textContent || "");
  ok("a quote renders in the reading language", /[Ѐ-ӿ]/.test(wsRu), wsRu.slice(0, 60));

  // a card's prose is English now whatever the reading language — cardLocalized falls back
  await pg.evaluate(() => { location.hash = "home"; });
  await pg.waitForTimeout(600);
  ok("a card's prose falls back to English", await pg.evaluate(() => {
    const c = (window.CARD_DATA || [])[0];
    return !!c && !c.i18n;
  }));

  const en = await ctx.newPage(); watch(en);
  const f2 = [];
  en.on("request", (r) => { if (r.url().includes("/i18n/")) f2.push(r.url()); });
  await en.goto(url("?lang=en"), { waitUntil: "networkidle" });
  await en.waitForTimeout(1000);
  ok("an English reader fetches no translation file at all", f2.length === 0, f2);

  ok("the MULTILANG flag was found and flipped for these checks", patchedApp);
  ok("no console or page errors", errs.length === 0, errs.slice(0, 3));

  await browser.close(); srv.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
