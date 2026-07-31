#!/usr/bin/env node
// Merge Atlas source footnotes into ../country-sources.js. See CLAUDE.md.
//
//   node .claude/add-country-sources.js <batch.json>
//
// <batch.json>  {
//   "general": {                          // the works behind a state's GENERAL description (countries.js)
//     "france": ["Colin Jones, <i>The Cambridge Illustrated History of France</i> (Cambridge: Cambridge University Press, 1994), 12–14."],
//     "british raj": [ … ]
//   },
//   "years": {                            // the works behind a specific map-year's paragraph (country-years.js)
//     "france": { "1938": ["Julian Jackson, <i>The Fall of France</i> (Oxford: Oxford University Press, 2003), 21."] }
//   },
//   "delete": ["some place"]              // optional: drop a place from both tables
// }
//
// Keys are the place name AS IT APPEARS ON THE MAP, lowercased and whitespace-collapsed — exactly how
// countries.js / country-years.js are keyed. A name not present in either of those is refused: a citation
// filed under a name the panel never looks up is a citation nobody will ever see.
//
// MERGES, never replaces: a batch covering ten places leaves the other entries alone, and a batch adding
// 1938 to a place leaves its 1900 sources standing.
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const outPath = path.join(root, "country-sources.js");
const SRC_MAX = 24;   // mirrors SRC_MAX in app.js
const SRC_URL = /https?:\/\/[^\s<>"']+/;   // every citation carries a link the reader can follow

function loadWindow(file) { const win = {}; new Function("window", fs.readFileSync(file, "utf8"))(win); return win; }
const obj = (o) => "{\n" + Object.keys(o).sort().map((k) => JSON.stringify(k) + ": " + JSON.stringify(o[k])).join(",\n") + "\n}";
const key = (s) => String(s || "").trim().toLowerCase().replace(/\s+/g, " ");

const batchFile = process.argv[2];
if (!batchFile) { console.error("usage: node .claude/add-country-sources.js <batch.json>"); process.exit(1); }
const batch = JSON.parse(fs.readFileSync(batchFile, "utf8"));

const cur = fs.existsSync(outPath) ? loadWindow(outPath) : {};
const GEN = cur.COUNTRY_SOURCES || {}, YRS = cur.COUNTRY_YEAR_SOURCES || {};

// the names the Atlas panel can actually look up
const known = new Set();
Object.keys(loadWindow(path.join(root, "countries.js")).COUNTRY_INFO || {}).forEach((k) => known.add(key(k)));
const YEARDATA = loadWindow(path.join(root, "country-years.js")).COUNTRY_YEARS || {};
Object.keys(YEARDATA).forEach((k) => known.add(key(k)));

function clean(list, where) {
  if (!Array.isArray(list) || !list.length || list.some((s) => typeof s !== "string" || !s.trim())) {
    console.error("ERROR: " + where + " needs a non-empty array of citation strings."); process.exit(1);
  }
  if (list.length > SRC_MAX) { console.error("ERROR: " + where + " has " + list.length + " sources — at most " + SRC_MAX + "."); process.exit(1); }
  const unlinked = list.filter((s) => !SRC_URL.test(s));
  if (unlinked.length) { console.error("ERROR: " + where + ": every citation ends in a link the reader can follow — " + JSON.stringify(unlinked[0].slice(0, 80)) + " has none."); process.exit(1); }
  const out = [];
  list.forEach((s) => { const t = String(s).replace(/\s+/g, " ").trim(); if (t && out.indexOf(t) < 0) out.push(t); });
  return out;
}

let nGen = 0, nYr = 0;
(batch.delete || []).forEach((n) => { delete GEN[key(n)]; delete YRS[key(n)]; });
Object.keys(batch.general || {}).forEach((n) => {
  const k = key(n);
  if (!known.has(k)) { console.error("ERROR: no place named \"" + n + "\" in countries.js or country-years.js — the panel would never show these citations. Check the name as it appears on the map."); process.exit(1); }
  GEN[k] = clean(batch.general[n], "general[" + n + "]"); nGen++;
});
Object.keys(batch.years || {}).forEach((n) => {
  const k = key(n);
  if (!known.has(k)) { console.error("ERROR: no place named \"" + n + "\" in countries.js or country-years.js."); process.exit(1); }
  const byYear = batch.years[n] || {};
  YRS[k] = YRS[k] || {};
  Object.keys(byYear).forEach((y) => {
    if (!/^-?\d{1,5}$/.test(String(y))) { console.error("ERROR: \"" + y + "\" is not a map-year (e.g. 1900, 1938, -500)."); process.exit(1); }
    // a year the place has no paragraph for would file the citations under a panel section that never opens
    if (!(YEARDATA[k] && YEARDATA[k][String(y)])) console.warn("WARNING: " + n + " has no country-years.js paragraph for " + y + " — these citations will show under an otherwise empty year.");
    YRS[k][String(y)] = clean(byYear[y], "years[" + n + "][" + y + "]"); nYr++;
  });
});

/* The header is re-emitted from here rather than preserved from the file: it names the two globals in its
   own prose, so any "split on the first assignment" trick cuts the comment in half. */
const HEAD =
  "/* Atlas source footnotes — the scholarship behind the place panel's prose.\n" +
  "\n" +
  "   COUNTRY_SOURCES       <lowercased place name> -> [ \"<Chicago note-form citation>\", … ]\n" +
  "                         the works behind the state's GENERAL description (countries.js), which is\n" +
  "                         constant across map-years.\n" +
  "   COUNTRY_YEAR_SOURCES  <lowercased place name> -> { \"<map-year>\": [ … ] }\n" +
  "                         the works behind that year's paragraph (country-years.js).\n" +
  "\n" +
  "   The panel merges the two into ONE numbered list, general first, de-duplicated — a work behind both\n" +
  "   paragraphs is one footnote, not two. A place with no entry simply shows no Sources fold; a missing\n" +
  "   citation is never invented.\n" +
  "\n" +
  "   Keyed exactly like countries.js / country-years.js: the name as it appears on the map, lowercased and\n" +
  "   whitespace-collapsed (present-day name, or the era iteration's name).\n" +
  "\n" +
  "   Citations are NOT translated — a citation names an edition that exists in one language.\n" +
  "\n" +
  "   Lazy: part of the `atlas` data bundle (see DATA_BUNDLES in app.js).\n" +
  "   Written by `node .claude/add-country-sources.js <batch.json>` — see CLAUDE.md. */\n";
fs.writeFileSync(outPath,
  HEAD +
  "window.COUNTRY_SOURCES = Object.assign(window.COUNTRY_SOURCES || {}, " + obj(GEN) + ");\n\n" +
  "window.COUNTRY_YEAR_SOURCES = Object.assign(window.COUNTRY_YEAR_SOURCES || {}, " + obj(YRS) + ");\n");
loadWindow(outPath);   // re-parse to confirm the written file is valid JS
console.log("country-sources.js: " + nGen + " general + " + nYr + " year entries written | " +
  Object.keys(GEN).length + " places with general sources, " + Object.keys(YRS).length + " with year sources");
