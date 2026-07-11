// Dev-only: add researched capital cities to the historical eras in timeline.js.
// Usage: node .claude/add-era-cities.js <capitals.json>
//   capitals.json = [ { "year": 1900, "capitals": [ { "state", "city", "lon", "lat" }, ... ] }, ... ]
// For each era (matched by year) it sets era.cities to the capitals (cap:true), keeping any existing
// NON-capital cities, deduped by city name. Re-parses timeline.js to confirm valid JS.
const fs = require("fs");
const path = require("path");

const inFile = process.argv[2];
if (!inFile) { console.error("usage: node .claude/add-era-cities.js <capitals.json>"); process.exit(1); }
const data = JSON.parse(fs.readFileSync(inFile, "utf8"));
const byYear = {};
for (const e of data) byYear[e.year] = e.capitals || [];

const TL = path.join(__dirname, "..", "timeline.js");
global.window = {};
require(TL);
const list = Array.isArray(global.window.TIMELINE) ? global.window.TIMELINE : [];

const r2 = (v) => Math.round(v * 100) / 100;
let touched = 0, added = 0;
for (const era of list) {
  const caps = byYear[era.year];
  if (!caps || !caps.length) continue;
  const keep = (era.cities || []).filter((c) => !c.cap);   // preserve any non-capital cities already placed
  const seen = new Set(keep.map((c) => (c.n || "").toLowerCase()));
  for (const c of caps) {
    if (!c || !c.city || typeof c.lon !== "number" || typeof c.lat !== "number") continue;
    const k = c.city.toLowerCase();
    if (seen.has(k)) continue; seen.add(k);
    if (Math.abs(c.lon) > 180 || Math.abs(c.lat) > 90) continue;   // sanity
    keep.push({ n: c.city, lon: r2(c.lon), lat: r2(c.lat), cap: true });
    added++;
  }
  era.cities = keep;
  touched++;
}

const out = "/* Historical border eras for the Atlas globe timeline (Edit -> Timeline).\n" +
  "   Vector eras built by .claude/build-era.js from historical-basemaps (https://github.com/aourednik/historical-basemaps, CC-BY-SA 4.0).\n" +
  "   Per-era EITHER `groups` { presentCountryName: eraTerritoryName } (merger-only eras -> renderer reuses world.js high-res\n" +
  "   geometry, grouping the listed countries) OR `geo` [ { n, p:[rings], c:[per-ring interior/coast mask] } ]. Do not hand-edit. */\n" +
  "window.TIMELINE = " + JSON.stringify(list) + ";\n";
fs.writeFileSync(TL, out);
delete require.cache[require.resolve(TL)];
global.window = {};
require(TL);   // re-parse to confirm valid JS
console.log("added " + added + " capital cities across " + touched + " era(s). timeline.js now " + (fs.statSync(TL).size / 1024 | 0) + " KB.");
for (const era of (global.window.TIMELINE || [])) if (byYear[era.year]) console.log("  " + era.year + ": " + (era.cities || []).filter((c) => c.cap).length + " capitals");
