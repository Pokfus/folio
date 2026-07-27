// Shared reader/writer for the per-language glossary translation files, i18n/gloss-<lang>.js.
// Used by add-glossary.js and add-lang.js. The file text produced here is byte-for-byte what app.js's
// serializeGlossaryI18n() writes when an admin bakes live edits — KEEP THE TWO IN STEP, or a save from
// the browser and a save from a script will churn the same file back and forth.
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "i18n");

function loadWindow(file) { const win = {}; new Function("window", fs.readFileSync(file, "utf8"))(win); return win; }
const obj = (o) => "{\n" + Object.keys(o).map((k) => JSON.stringify(k) + ": " + JSON.stringify(o[k])).join(",\n") + "\n}";

// every shipped gloss language on disk
function langs() {
  if (!fs.existsSync(DIR)) return [];
  return fs.readdirSync(DIR).filter((f) => /^gloss-[\w-]+\.js$/.test(f)).map((f) => f.slice(6, -3)).sort();
}
const fileFor = (lang) => path.join(DIR, "gloss-" + lang + ".js");

// one language's { slug: text }
function read(lang) {
  const f = fileFor(lang);
  if (!fs.existsSync(f)) return {};
  const q = loadWindow(f).GLOSSARY_I18N_IN || [];
  const hit = q.find((x) => x.lang === lang) || q[0];
  return (hit && hit.data) || {};
}

// all languages, as the nested { slug: { lang: text } } shape the site and the helpers think in
function readAll() {
  const out = {};
  for (const l of langs()) {
    const d = read(l);
    for (const slug of Object.keys(d)) (out[slug] = out[slug] || {})[l] = d[slug];
  }
  return out;
}

function write(lang, flat) {
  fs.mkdirSync(DIR, { recursive: true });
  const out =
    "/* Glossary descriptions translated into " + lang + " (slug -> text; same three-sentence rules as the English in\n" +
    "   glossary.js). Lazy: fetched by the `glossI18n:" + lang + "` data bundle only when the site language is " + lang + ".\n" +
    "   The bundle's `after` hook in app.js drains window.GLOSSARY_I18N_IN into the shipped baseline\n" +
    "   (PRISTINE_GLOSS_I18N) and layers any admin edits on top, producing window.GLOSSARY_I18N[slug][lang] —\n" +
    "   which is what glossText() reads. Grown by .claude/add-glossary.js / .claude/add-lang.js. */\n" +
    "(function () {\n" +
    "  var d = " + obj(flat) + ";\n" +
    "  (window.GLOSSARY_I18N_IN = window.GLOSSARY_I18N_IN || []).push({ lang: " + JSON.stringify(lang) + ", data: d });\n" +
    "})();\n";
  fs.writeFileSync(fileFor(lang), out);
  loadWindow(fileFor(lang));   // re-parse to confirm valid JS
}

// write back the nested shape, one file per language it mentions
function writeAll(nested) {
  const byLang = {};
  for (const slug of Object.keys(nested)) {
    for (const l of Object.keys(nested[slug] || {})) {
      if (nested[slug][l]) (byLang[l] = byLang[l] || {})[slug] = nested[slug][l];
    }
  }
  for (const l of Object.keys(byLang)) write(l, byLang[l]);
  return Object.keys(byLang);
}

module.exports = { DIR, langs, read, readAll, write, writeAll, fileFor };
