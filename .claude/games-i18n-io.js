// Shared reader/writer for the per-language daily-game translation files, i18n/games-<lang>.js.
// Used by add-lang.js. These live OUTSIDE truefalse.js / quotes.js on purpose: both pools are in the
// EAGER load path (index.html loads them before app.js), so carrying nine translations inline took
// quotes.js from 27 KB to 312 KB that every visitor downloads to flip a card — exactly what the lazy
// data-bundle split exists to prevent. Keyed by the item's ENGLISH `q`, which is unique in both pools.
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "i18n");

function loadWindow(file) { const win = {}; new Function("window", fs.readFileSync(file, "utf8"))(win); return win; }
const obj = (o) => "{\n" + Object.keys(o).map((k) => JSON.stringify(k) + ": " + JSON.stringify(o[k])).join(",\n") + "\n}";

const POOLS = ["truefalse", "quotes"];
const fileFor = (lang) => path.join(DIR, "games-" + lang + ".js");

function langs() {
  if (!fs.existsSync(DIR)) return [];
  return fs.readdirSync(DIR).filter((f) => /^games-[\w-]+\.js$/.test(f)).map((f) => f.slice(6, -3)).sort();
}

// one language's { truefalse: { "<en q>": {q,why,cat} }, quotes: { "<en q>": {q,who,context} } }
function read(lang) {
  const f = fileFor(lang);
  const empty = { truefalse: {}, quotes: {} };
  if (!fs.existsSync(f)) return empty;
  const q = loadWindow(f).GAMES_I18N_IN || [];
  const hit = q.find((x) => x.lang === lang) || q[0];
  if (!hit) return empty;
  return { truefalse: hit.truefalse || {}, quotes: hit.quotes || {} };
}

function write(lang, data) {
  fs.mkdirSync(DIR, { recursive: true });
  const out =
    "/* Daily-game pools translated into " + lang + ", keyed by each item's ENGLISH `q` (unique in both pools).\n" +
    "   Lazy: fetched by the `gamesI18n:" + lang + "` data bundle only when the site language is " + lang + " — the pools\n" +
    "   themselves (truefalse.js / quotes.js) are in the eager load path, so their translations must not be.\n" +
    "   The bundle's `after` hook in app.js drains window.GAMES_I18N_IN into window.GAMES_I18N, which is what\n" +
    "   tfLocalized() / quoteLocalized() read. Grown by .claude/add-lang.js. */\n" +
    "(function () {\n" +
    "  var tf = " + obj(data.truefalse || {}) + ";\n" +
    "  var q = " + obj(data.quotes || {}) + ";\n" +
    "  (window.GAMES_I18N_IN = window.GAMES_I18N_IN || []).push({ lang: " + JSON.stringify(lang) + ", truefalse: tf, quotes: q });\n" +
    "})();\n";
  fs.writeFileSync(fileFor(lang), out);
  loadWindow(fileFor(lang));   // re-parse to confirm valid JS
}

module.exports = { DIR, POOLS, langs, read, write, fileFor };
