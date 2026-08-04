#!/usr/bin/env node
// Add (or update / delete) a glossary term in ../glossary.js. Parses + rewrites the objects
// programmatically. See CLAUDE.md.
//
//   node .claude/add-glossary.js <entry.json>
//
// <entry.json>  { "slug": "Wikipedia_Article_Slug", "description": "<3 sentences>",
//                 "date": "<optional>", "aliases": ["<optional alternative background spellings>"],
//                 "tags": ["person", "ruler", "han dynasty"],   // REQUIRED for new terms: >=3 lowercase category tags (admin tag filter)
//                 "translations": { "es": "…", "fr": "…", "de": "…", "it": "…", "nl": "…", "ru": "…", "ar": "…", "zh": "…", "ja": "…" },
//                                              // OPTIONAL while the site is English-only (see REQUIRE_TRANSLATIONS below):
//                                              // the description in all 9 site languages (-> i18n/gloss-<lang>.js)
//                 "sources": ["Michael Loewe, <i>A Biographical Dictionary</i> (Leiden: Brill, 2000), 487."],
//                                              // REQUIRED for new terms: Chicago note-form citations for the description
//                                              // (-> window.GLOSSARY_SOURCES, a numbered fold at the foot of the popup).
//                                              // Pass "skipSources": true only for a maintenance edit of an older term.
//                 "caseSensitive": true,   // optional: only auto-link when the surface matches the term's capitalization
//                 "image": { "src": "https://…", "title": "…", "desc": "…", "credit": "…" },
//                 "video": { "src": "https://www.youtube.com/watch?v=… | https://…/clip.mp4", "title": …, "desc": …, "credit": … } }
//                                              // optional illustration, shown at the foot of the term's popup (click = fullscreen viewer)
//   delete:     { "slug": "Some_Slug", "delete": true }
const fs = require("fs"), path = require("path");
const glossPath = path.join(__dirname, "..", "glossary.js");
const glossI18nIO = require("./gloss-i18n-io");   // the per-language i18n/gloss-<lang>.js files
const I18N_LANGS = ["es", "fr", "de", "it", "nl", "ru", "ar", "zh", "ja"];
/* ENGLISH ONLY (Aug 2026, on request): the site ships in English while the work is on the English, so a
   new term no longer has to arrive with its nine translations. This is the content-pipeline half of
   MULTILANG in app.js — flip it back to true when translations resume, and new terms are held to all
   nine again. Translations that ARE supplied are still written and still checked (marker parity below):
   the requirement is lifted, the machinery is not. */
const REQUIRE_TRANSLATIONS = false;

function loadWindow(file) { const win = {}; new Function("window", fs.readFileSync(file, "utf8"))(win); return win; }
const obj = (o) => "{\n" + Object.keys(o).map(k => JSON.stringify(k) + ": " + JSON.stringify(o[k])).join(",\n") + "\n}";

const entryFile = process.argv[2];
if (!entryFile) { console.error("usage: node .claude/add-glossary.js <entry.json>"); process.exit(1); }
const e = JSON.parse(fs.readFileSync(entryFile, "utf8"));
if (!e.slug) { console.error("ERROR: entry needs `slug`"); process.exit(1); }

const win = loadWindow(glossPath);
const GLOSS = win.GLOSSARY || {}, DATES = win.GLOSSARY_DATES || {}, ALIASES = win.GLOSSARY_ALIASES || {}, CASE = win.GLOSSARY_CASESENSITIVE || {}, TAGS = win.GLOSSARY_TAGS || {}, IMAGES = win.GLOSSARY_IMAGES || {}, VIDEOS = win.GLOSSARY_VIDEOS || {}, SOURCES = win.GLOSSARY_SOURCES || {};
// The Atlas tables, written by .claude/fetch-place-coords.js. This script rebuilds glossary.js from a FIXED
// list of tables, so any table it does not carry is silently dropped on the next write. Carry every one.
const PLACES = win.GLOSSARY_PLACES || {}, MAPC = win.GLOSSARY_MAP_COUNTRY || {};
const SRC_MAX = 24;   // mirrors SRC_MAX in app.js
const SRC_URL = /https?:\/\/[^\s<>"']+/;   // every citation carries a link the reader can follow
const I18N = glossI18nIO.readAll();   // { slug: { lang: text } }, merged from every i18n/gloss-<lang>.js

let action;
if (e.delete) {
  action = (e.slug in GLOSS) ? "deleted" : "absent";
  delete GLOSS[e.slug]; delete DATES[e.slug]; delete ALIASES[e.slug]; delete CASE[e.slug]; delete TAGS[e.slug]; delete IMAGES[e.slug]; delete VIDEOS[e.slug]; delete SOURCES[e.slug]; delete I18N[e.slug];
} else {
  if (!e.description) { console.error("ERROR: entry needs `description` (or `delete: true`)"); process.exit(1); }
  const isNew = !(e.slug in GLOSS);
  if (isNew && !(Array.isArray(e.tags) && e.tags.length >= 3)) { console.error("ERROR: a new term needs `tags` — at least 3 lowercase category tags (they drive the admin tag filter; reuse existing tags where possible)"); process.exit(1); }
  /* A gloss popup states three sentences of fact. Where they came from is part of the entry, not an
     extra — so a new term names its sources, in the same Chicago note style the cards use, and points at
     them from the prose with an empty <sup class="fn" data-fn="2"></sup>. Markers were optional here
     through batches G1–G4 and are REQUIRED as of 2026-08-01, on the same footing as a card's: a list of
     five or six works that no sentence points into has stopped explaining itself, and a reader arriving
     from a fully-marked card reads the missing numbers as the apparatus giving up. */
  if (isNew && !e.skipSources) {
    if (!Array.isArray(e.sources) || !e.sources.length || e.sources.some((s) => typeof s !== "string" || !s.trim())) {
      console.error("ERROR: a new term needs `sources` — Chicago note-form citations for its description (see CLAUDE.md). Pass skipSources:true only for a maintenance edit of a term written before citations existed.");
      process.exit(1);
    }
  }
  if (Array.isArray(e.sources) && e.sources.length > SRC_MAX) { console.error("ERROR: " + e.slug + " has " + e.sources.length + " sources — at most " + SRC_MAX + "."); process.exit(1); }
  if (Array.isArray(e.sources)) {
    const unlinked = e.sources.filter((s) => !SRC_URL.test(s));
    if (unlinked.length) { console.error("ERROR: " + e.slug + ": every citation ends in a link the reader can follow — " + JSON.stringify(unlinked[0].slice(0, 80)) + " has none. Put the DOI or permalink last, as plain text; the site links it."); process.exit(1); }
  }
  if (Array.isArray(e.sources) && e.sources.length) {
    const marks = [...String(e.description || "").matchAll(/data-fn="(\d+)"/gi)].map((m) => +m[1]);
    // a marker with no entry behind it is dropped at render time — catch it here instead
    const bad = marks.filter((n) => n < 1 || n > e.sources.length);
    if (bad.length) { console.error("ERROR: " + e.slug + " points at source " + bad[0] + ", but only has " + e.sources.length + "."); process.exit(1); }
    if (!e.skipSources) {
      if (!marks.length) { console.error("ERROR: " + e.slug + " has no footnote marker in its description. Point its claims at the sources with <sup class=\"fn\" data-fn=\"1\"></sup> (written empty — the digit is drawn from the list at render time)."); process.exit(1); }
      const unused = e.sources.map((_, i) => i + 1).filter((n) => marks.indexOf(n) < 0);
      if (unused.length) { console.error("ERROR: " + e.slug + ": source " + unused.join(", ") + " is never referenced from the description. Every citation is a footnote to a specific claim — add a marker, or drop the source."); process.exit(1); }
      // the same markers must sit on the same claims in every language, or that language shows the fold
      // with no in-text links (or worse, points the reader at a different work)
      const want = marks.slice().sort((x, y) => x - y).join(",");
      for (const [lang, text] of Object.entries(e.translations || {})) {
        const got = [...String(text).matchAll(/data-fn="(\d+)"/gi)].map((m) => +m[1]).sort((x, y) => x - y).join(",");
        if (got !== want) console.warn("WARNING: " + e.slug + " (" + lang + ") carries markers [" + got + "] where the English has [" + want + "].");
      }
    }
  }
  if (isNew && REQUIRE_TRANSLATIONS && !e.skipTranslations) {
    const tr = e.translations || {};
    const missing = I18N_LANGS.filter((l) => !(typeof tr[l] === "string" && tr[l].trim()));
    if (missing.length) { console.error("ERROR: a new term needs `translations` for all 9 site languages (missing: " + missing.join(", ") + ") — or pass skipTranslations:true for a deliberate English-only maintenance edit"); process.exit(1); }
  }
  // MERGE, never replace: an update that carries only some languages (e.g. backfilling a newly added
  // site language into an old term) must not drop the translations already on the entry.
  if (e.translations && Object.keys(e.translations).length) {
    I18N[e.slug] = I18N[e.slug] || {};
    I18N_LANGS.forEach((l) => { if (typeof e.translations[l] === "string" && e.translations[l].trim()) I18N[e.slug][l] = e.translations[l]; });
  }
  action = isNew ? "added" : "updated";
  GLOSS[e.slug] = e.description;
  if (e.date) DATES[e.slug] = e.date;
  if (Array.isArray(e.aliases) && e.aliases.length) ALIASES[e.slug] = e.aliases;
  else if ("aliases" in e) delete ALIASES[e.slug];
  if (Array.isArray(e.tags) && e.tags.length) TAGS[e.slug] = e.tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean);
  else if ("tags" in e) delete TAGS[e.slug];
  if (Array.isArray(e.sources) && e.sources.length) SOURCES[e.slug] = e.sources.map((s) => String(s).trim()).filter(Boolean);
  else if ("sources" in e) delete SOURCES[e.slug];
  if (e.caseSensitive) CASE[e.slug] = true;
  else if ("caseSensitive" in e) delete CASE[e.slug];
  // nothing Folio shows is uncredited — the glossary editors gate this too (wireMediaSource in app.js)
  for (const m of ["image", "video"]) {
    if (e[m] && String(e[m].src || "").trim() && !String(e[m].credit || "").trim()) {
      console.error("ERROR: " + e.slug + "." + m + " has a src but no `credit` — every picture and clip carries its source (see CLAUDE.md).");
      process.exit(1);
    }
  }
  // optional illustration ({ src, title, desc, credit }) — same shape as a card image, shown at the foot of the popup
  if (e.image && e.image.src) {
    const im = { src: String(e.image.src) };
    // `alt` joined the three in Aug 2026: what the picture SHOWS, for a reader who cannot see it, which is
    // a different sentence from its title. Warned about rather than required — most shipped images predate it.
    ["title", "desc", "credit", "alt"].forEach((f) => { if (e.image[f]) im[f] = String(e.image[f]); });
    if (!im.alt) console.warn("WARNING: " + e.slug + ".image has no `alt` — a screen reader will fall back to its title.");
    IMAGES[e.slug] = im;
  } else if ("image" in e) delete IMAGES[e.slug];
  // optional video ({ src, title, desc, credit }) — LINKS ONLY: a YouTube/Vimeo page URL or a direct
  // .mp4/.webm/.ogv URL. Shown in the popup in the same frame as the illustration (see videoSource in app.js).
  if (e.video && e.video.src) {
    const vd = { src: String(e.video.src) };
    ["title", "desc", "credit"].forEach((f) => { if (e.video[f]) vd[f] = String(e.video[f]); });
    VIDEOS[e.slug] = vd;
  } else if ("video" in e) delete VIDEOS[e.slug];
}

let out =
  "/* Glossary tooltip descriptions, keyed by Wikipedia article slug (decoded). Add terms one at a time with\n" +
  "   `node .claude/add-glossary.js <entry.json>` (see CLAUDE.md). Missing terms fall back to the slug name. */\n" +
  "window.GLOSSARY = " + obj(GLOSS) + ";\n\n" +
  "/* Optional date shown next to a term (e.g. \"c. 145-86 BCE\", \"1644-1912\"). Keyed by the same slug. */\n" +
  "window.GLOSSARY_DATES = Object.assign(window.GLOSSARY_DATES || {}, " + obj(DATES) + ");\n";
if (Object.keys(ALIASES).length) {
  out +=
    "\n/* Optional alternative background spellings that also open a term's popup (slug -> [forms]); plurals auto-link. */\n" +
    "window.GLOSSARY_ALIASES = Object.assign(window.GLOSSARY_ALIASES || {}, " + obj(ALIASES) + ");\n";
}
if (Object.keys(CASE).length) {
  out +=
    "\n/* Slugs that only auto-link when the surface matches the term's own capitalization (e.g. Heaven, not heaven). */\n" +
    "window.GLOSSARY_CASESENSITIVE = Object.assign(window.GLOSSARY_CASESENSITIVE || {}, " + obj(CASE) + ");\n";
}
if (Object.keys(TAGS).length) {
  out +=
    "\n/* Category tags per term (slug -> [tags]) — shown in the admin glossary list and filterable from its left bar. */\n" +
    "window.GLOSSARY_TAGS = Object.assign(window.GLOSSARY_TAGS || {}, " + obj(TAGS) + ");\n";
}
if (Object.keys(IMAGES).length) {
  out +=
    "\n/* Optional illustration per term (slug -> { src, title, desc, credit }) — shown at the foot of the term's popup. */\n" +
    "window.GLOSSARY_IMAGES = Object.assign(window.GLOSSARY_IMAGES || {}, " + obj(IMAGES) + ");\n";
}
if (Object.keys(VIDEOS).length) {
  out +=
    "\n/* Optional video per term (slug -> { src, title, desc, credit }) — a YouTube/Vimeo or direct file link, shown in the term's popup. */\n" +
    "window.GLOSSARY_VIDEOS = Object.assign(window.GLOSSARY_VIDEOS || {}, " + obj(VIDEOS) + ");\n";
}
if (Object.keys(SOURCES).length) {
  out +=
    "\n/* Source footnotes per term (slug -> [Chicago note-form citations]) — a numbered fold at the foot of the popup.\n" +
    "   Not translated: a citation names an edition that exists in one language. */\n" +
    "window.GLOSSARY_SOURCES = Object.assign(window.GLOSSARY_SOURCES || {}, " + obj(SOURCES) + ");\n";
}
if (Object.keys(PLACES).length) {
  out +=
    "\n/* Point-locations for the gloss popup's map-marker button: slug -> [lon, lat], fetched from Wikipedia's\n" +
    "   own primary coordinates by .claude/fetch-place-coords.js. Never hand-written. */\n" +
    "window.GLOSSARY_PLACES = Object.assign(window.GLOSSARY_PLACES || {}, " + obj(PLACES) + ");\n";
}
if (Object.keys(MAPC).length) {
  out +=
    "\n/* Glossary terms that name a country the Atlas draws: slug -> the name world.js uses. Joined at build\n" +
    "   time by the same script, because world.js is lazy and the popup must decide without it. */\n" +
    "window.GLOSSARY_MAP_COUNTRY = Object.assign(window.GLOSSARY_MAP_COUNTRY || {}, " + obj(MAPC) + ");\n";
}
fs.writeFileSync(glossPath, out);
loadWindow(glossPath);   // re-parse to confirm valid JS

// i18n/gloss-<lang>.js — one file per language, so a reader only downloads their own (see gloss-i18n-io.js).
// Every language is rewritten: a term can be added to or deleted from any of them.
glossI18nIO.writeAll(I18N);
const extra = e.delete ? "" : ((e.date ? " (" + e.date + ")" : "") + (Array.isArray(e.aliases) && e.aliases.length ? " [aliases: " + e.aliases.join(", ") + "]" : ""));
console.log(action + " glossary term " + e.slug + extra + " | total terms: " + Object.keys(GLOSS).length);
