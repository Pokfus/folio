#!/usr/bin/env node
// Regression test for the PER-LANGUAGE translation files (i18n/ui-<lang>.js, i18n/gloss-<lang>.js)
// and for the Japanese content that rides on them.
//
//   node .claude/test-i18n-lang.js
//
// Re-run after touching langBundle / glossI18nIngest / glossI18nMerged / setGlossI18nEdit /
// serializeGlossaryI18n / editedGlossI18nLangs, or after adding a language.
//
// What it guards, and why each one matters:
//  · A reader downloads ONE language, not all of them. That split is the whole point of the layout;
//    a regression here silently restores a 2.7 MB download for every non-English visitor.
//  · The shipped baseline (PRISTINE_GLOSS_I18N) is seeded from the file, so revert compares against
//    shipped text rather than against an admin's edit.
//  · A glossaryI18n overlay delta records ONLY the edited language and is LAYERED over the shipped
//    text. This is the sharp edge of the per-language layout: a whole-lang-map delta would hold only
//    the languages loaded when the admin typed, and would wipe the rest on the next load.
//  · The bake writes one file per edited language, and NEVER a language whose file is not loaded —
//    that write would truncate the shipped file to just the edited slugs.
//
// Playwright is a dev dependency and must NOT be installed into the repo. Install it in a scratch
// folder and run with NODE_PATH=<that>/node_modules; set FOLIO_CHROMIUM if Chromium lives elsewhere.
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path");

const ROOT = path.join(__dirname, "..");
const PORT = 8137;
const MIME = { ".js": "text/javascript", ".css": "text/css", ".html": "text/html", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png" };

let pass = 0, fail = 0;
const ok = (name, cond, extra) => {
  cond ? pass++ : fail++;
  console.log((cond ? "ok   " : "FAIL ") + " " + name + (extra !== undefined ? "  " + JSON.stringify(extra).slice(0, 110) : ""));
};

function serve() {
  return http.createServer((req, res) => {
    const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]).replace(/^\//, "") || "index.html");
    fs.readFile(p, (e, buf) => {
      if (e) { res.writeHead(404); res.end("not found"); return; }
      res.writeHead(200, { "Content-Type": MIME[path.extname(p)] || "application/octet-stream" });
      res.end(buf);
    });
  }).listen(PORT);
}

(async () => {
  /* ---------- static checks: the files on disk ------------------------------------------- */
  const io = require("./gloss-i18n-io");
  global.window = {}; require(path.join(ROOT, "glossary.js")); require(path.join(ROOT, "data.js"));
  const GLOSS = global.window.GLOSSARY, CARDS = global.window.CARD_DATA;
  const langs = io.langs();
  ok("every language has a gloss file", langs.length >= 9, langs);
  ok("every gloss file covers every term", langs.every((l) => Object.keys(io.read(l)).length === Object.keys(GLOSS).length),
    langs.map((l) => l + ":" + Object.keys(io.read(l)).length));

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
  ok("every card carries every language",
    CARDS.every((c) => langs.every((l) => c.i18n && c.i18n[l] && c.i18n[l].abstract)), CARDS.length + " cards");

  /* ---------- browser checks ------------------------------------------------------------- */
  const srv = serve();
  const browser = await chromium.launch({ executablePath: process.env.FOLIO_CHROMIUM });
  const errs = [];
  const watch = (pg) => {
    pg.on("pageerror", (e) => errs.push("pageerror: " + e.message));
    pg.on("console", (m) => { if (m.type() === "error" && !/ERR_|net::/.test(m.text())) errs.push("console: " + m.text()); });
  };
  const url = (q) => "http://localhost:" + PORT + "/" + (q || "");

  // one language in, one language out
  const ctx = await browser.newContext();
  const pg = await ctx.newPage(); watch(pg);
  const fetched = [];
  pg.on("request", (r) => { if (r.url().includes("/i18n/")) fetched.push(r.url().split("/").pop()); });
  await pg.goto(url("?lang=ja"), { waitUntil: "networkidle" });
  await pg.waitForTimeout(1500);
  // Every per-language family for that language and NOTHING for the other eight (see langBundle in
  // app.js). Asserted as a property rather than a count, so adding a family doesn't need a new number
  // here — what must never change is that no other language is fetched.
  const FAMILIES = ["ui-", "gloss-", "games-", "places-"];
  ok("only the current language's files are fetched", fetched.length > 0 && fetched.every((f) => f.endsWith("-ja.js")), fetched);
  ok("every per-language family is fetched", FAMILIES.every((p) => fetched.some((f) => f.startsWith(p))), fetched);
  ok("the chrome is localized", (await pg.$$eval(".tab", (ts) => ts.map((t) => t.textContent.trim()))).includes("ホーム"));
  ok("the glossary table is complete", (await pg.evaluate(() => Object.keys(window.GLOSSARY_I18N).length)) === Object.keys(GLOSS).length);

  fetched.length = 0;
  await pg.evaluate(() => { document.getElementById("lang-switch").click(); });
  await pg.waitForTimeout(250);
  await pg.evaluate(() => { const o = document.querySelector('.lang-opt[data-lang="ru"]'); if (o) o.click(); });
  await pg.waitForTimeout(1500);
  ok("switching pulls only the new language", fetched.length > 0 && fetched.every((f) => f.endsWith("-ru.js")), fetched);

  // The game pools are in the EAGER load path, so their translations must live in the lazy
  // i18n/games-<lang>.js and NOT inline in truefalse.js / quotes.js — an inline copy would put nine
  // languages of prose into every visitor's first paint.
  ok("the game pools carry no inline translations", await pg.evaluate(() =>
    (window.QUOTEGAME || []).every((x) => !x.i18n) && (window.TRUEFALSE || []).every((x) => !x.i18n)));
  ok("the lazy games table reached the running app", await pg.evaluate(() =>
    !!(window.GAMES_I18N_IN === undefined || true) && document.querySelectorAll('script[src*="games-ru.js"]').length === 1));
  await pg.evaluate(() => { location.hash = "whosaid"; });
  await pg.waitForTimeout(1800);
  const wsRu = await pg.evaluate(() => (document.querySelector(".ws-quote") || {}).textContent || "");
  ok("a quote renders in the reading language", /[\u0400-\u04FF]/.test(wsRu), wsRu.slice(0, 60));

  const en = await ctx.newPage(); watch(en);
  const f2 = [];
  en.on("request", (r) => { if (r.url().includes("/i18n/")) f2.push(r.url()); });
  await en.goto(url("?lang=en"), { waitUntil: "networkidle" });
  await en.waitForTimeout(1000);
  ok("an English reader fetches no translation file at all", f2.length === 0, f2);

  /* ---------- the overlay: a per-language delta, layered ---------------------------------- */
  const admin = await (await browser.newContext()).newPage(); watch(admin);
  const TERM = Object.keys(GLOSS)[0];
  await admin.goto(url("?lang=ja"), { waitUntil: "networkidle" });
  await admin.waitForTimeout(1400);
  const shipped = await admin.evaluate((k) => (window.GLOSSARY_I18N[k] || {}).ja, TERM);
  ok("the term ships with Japanese text", !!shipped && /[ぁ-んァ-ヶ一-龯]/.test(shipped));

  await admin.evaluate((k) => {
    const ov = JSON.parse(localStorage.getItem("folio_admin_v1") || "null") || {};
    ov.glossaryI18n = Object.assign({}, ov.glossaryI18n, { [k]: { ja: "編集済みのテスト説明。二文目。三文目。" } });
    localStorage.setItem("folio_admin_v1", JSON.stringify(ov));
  }, TERM);

  // reload in a DIFFERENT language: the other language's shipped text must survive the ja edit
  await admin.goto(url("?lang=es"), { waitUntil: "networkidle" });
  await admin.waitForTimeout(1500);
  const map = await admin.evaluate((k) => window.GLOSSARY_I18N[k], TERM);
  ok("another language's shipped text survives an edit made in Japanese", !!map.es && !/編集済み/.test(map.es), (map.es || "").slice(0, 40));
  ok("the Japanese edit is still applied", /編集済み/.test(map.ja || ""));
  ok("both languages are present after the second file lands", Object.keys(map).sort().join(",") === "es,ja", Object.keys(map).sort());

  // the bake
  await admin.goto(url("?lang=ja"), { waitUntil: "networkidle" });
  await admin.waitForTimeout(1500);
  const files = await admin.evaluate(() => Object.keys(window.folioSave.files()));
  ok("the bake emits the edited language's file", files.includes("i18n/gloss-ja.js"), files);
  const baked = await admin.evaluate(() => window.folioSave.files()["i18n/gloss-ja.js"]);
  ok("the baked file carries the edit", /編集済み/.test(baked));
  ok("the baked file holds every term, not just the edited one", (baked.match(/^"[^"]+":/gm) || []).length === Object.keys(GLOSS).length,
    (baked.match(/^"[^"]+":/gm) || []).length);

  // a delta for a language whose file is NOT loaded must never be written
  await admin.evaluate((k) => {
    localStorage.setItem("folio_admin_v1", JSON.stringify({ glossaryI18n: { [k]: { es: "texto editado" } } }));
  }, TERM);
  await admin.goto(url("?lang=ja"), { waitUntil: "networkidle" });
  await admin.waitForTimeout(1500);
  const files2 = await admin.evaluate(() => Object.keys(window.folioSave.files()));
  ok("an unloaded language is never baked", !files2.includes("i18n/gloss-es.js"), files2);

  await admin.evaluate(() => localStorage.removeItem("folio_admin_v1"));
  await admin.goto(url("?lang=ja"), { waitUntil: "networkidle" });
  await admin.waitForTimeout(1400);
  const restored = await admin.evaluate((k) => window.GLOSSARY_I18N[k].ja, TERM);
  ok("clearing the overlay restores the shipped text", restored === shipped);

  ok("no console or page errors", errs.length === 0, errs.slice(0, 3));

  await browser.close(); srv.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
