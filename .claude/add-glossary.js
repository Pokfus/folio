#!/usr/bin/env node
// Add (or update / delete) a glossary term in ../glossary.js. Parses + rewrites the objects
// programmatically. See CLAUDE.md.
//
//   node .claude/add-glossary.js <entry.json>
//
// <entry.json>  { "slug": "Wikipedia_Article_Slug", "description": "<3 sentences>",
//                 "date": "<optional>", "aliases": ["<optional alternative background spellings>"],
//                 "tags": ["person", "ruler", "han dynasty"],   // REQUIRED for new terms: >=3 lowercase category tags (admin tag filter)
//                 "caseSensitive": true }   // optional: only auto-link when the surface matches the term's capitalization
//   delete:     { "slug": "Some_Slug", "delete": true }
const fs = require("fs"), path = require("path");
const glossPath = path.join(__dirname, "..", "glossary.js");

function loadWindow(file) { const win = {}; new Function("window", fs.readFileSync(file, "utf8"))(win); return win; }
const obj = (o) => "{\n" + Object.keys(o).map(k => JSON.stringify(k) + ": " + JSON.stringify(o[k])).join(",\n") + "\n}";

const entryFile = process.argv[2];
if (!entryFile) { console.error("usage: node .claude/add-glossary.js <entry.json>"); process.exit(1); }
const e = JSON.parse(fs.readFileSync(entryFile, "utf8"));
if (!e.slug) { console.error("ERROR: entry needs `slug`"); process.exit(1); }

const win = loadWindow(glossPath);
const GLOSS = win.GLOSSARY || {}, DATES = win.GLOSSARY_DATES || {}, ALIASES = win.GLOSSARY_ALIASES || {}, CASE = win.GLOSSARY_CASESENSITIVE || {}, TAGS = win.GLOSSARY_TAGS || {};

let action;
if (e.delete) {
  action = (e.slug in GLOSS) ? "deleted" : "absent";
  delete GLOSS[e.slug]; delete DATES[e.slug]; delete ALIASES[e.slug]; delete CASE[e.slug]; delete TAGS[e.slug];
} else {
  if (!e.description) { console.error("ERROR: entry needs `description` (or `delete: true`)"); process.exit(1); }
  const isNew = !(e.slug in GLOSS);
  if (isNew && !(Array.isArray(e.tags) && e.tags.length >= 3)) { console.error("ERROR: a new term needs `tags` — at least 3 lowercase category tags (they drive the admin tag filter; reuse existing tags where possible)"); process.exit(1); }
  action = isNew ? "added" : "updated";
  GLOSS[e.slug] = e.description;
  if (e.date) DATES[e.slug] = e.date;
  if (Array.isArray(e.aliases) && e.aliases.length) ALIASES[e.slug] = e.aliases;
  else if ("aliases" in e) delete ALIASES[e.slug];
  if (Array.isArray(e.tags) && e.tags.length) TAGS[e.slug] = e.tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean);
  else if ("tags" in e) delete TAGS[e.slug];
  if (e.caseSensitive) CASE[e.slug] = true;
  else if ("caseSensitive" in e) delete CASE[e.slug];
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
fs.writeFileSync(glossPath, out);
loadWindow(glossPath);   // re-parse to confirm valid JS
const extra = e.delete ? "" : ((e.date ? " (" + e.date + ")" : "") + (Array.isArray(e.aliases) && e.aliases.length ? " [aliases: " + e.aliases.join(", ") + "]" : ""));
console.log(action + " glossary term " + e.slug + extra + " | total terms: " + Object.keys(GLOSS).length);
