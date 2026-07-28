// Shared reader/writer for the per-language place-name files, i18n/places-<lang>.js.
// Used by add-lang.js. These cover country names (world.js) plus era territory and capital names
// (timeline.js), keyed by the ENGLISH name and read at draw time by placeName() in app.js.
// They live outside world.js / timeline.js because those are multi-megabyte geometry files: a reader
// should download their own language's ~1,700 short strings, not nine languages' worth inside the map.
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "i18n");

function loadWindow(file) { const win = {}; new Function("window", fs.readFileSync(file, "utf8"))(win); return win; }
const obj = (o) => "{\n" + Object.keys(o).sort().map((k) => JSON.stringify(k) + ": " + JSON.stringify(o[k])).join(",\n") + "\n}";
const fileFor = (lang) => path.join(DIR, "places-" + lang + ".js");

function langs() {
  if (!fs.existsSync(DIR)) return [];
  return fs.readdirSync(DIR).filter((f) => /^places-[\w-]+\.js$/.test(f)).map((f) => f.slice(7, -3)).sort();
}

function read(lang) {
  const f = fileFor(lang);
  if (!fs.existsSync(f)) return {};
  const q = loadWindow(f).PLACE_I18N_IN || [];
  const hit = q.find((x) => x.lang === lang) || q[0];
  return (hit && hit.data) || {};
}

function write(lang, flat) {
  fs.mkdirSync(DIR, { recursive: true });
  const out =
    "/* Place names translated into " + lang + " (English name -> local name): countries from world.js, plus\n" +
    "   era territories and era capitals from timeline.js. Lazy: fetched by the `placeI18n:" + lang + "` data bundle\n" +
    "   only when the site language is " + lang + ". The bundle's `after` hook in app.js drains window.PLACE_I18N_IN\n" +
    "   into window.PLACE_I18N, which placeName() reads — including at canvas draw time, where the DOM\n" +
    "   localisation walker cannot reach. Grown by .claude/add-lang.js. */\n" +
    "(function () {\n" +
    "  var d = " + obj(flat) + ";\n" +
    "  (window.PLACE_I18N_IN = window.PLACE_I18N_IN || []).push({ lang: " + JSON.stringify(lang) + ", data: d });\n" +
    "})();\n";
  fs.writeFileSync(fileFor(lang), out);
  loadWindow(fileFor(lang));   // re-parse to confirm valid JS
}

module.exports = { DIR, langs, read, write, fileFor };
