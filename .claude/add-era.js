// Dev-only helper: append a historical border era to timeline.js (the Atlas globe timeline).
// The geometry is produced by the in-app tracer (Edit → Timeline) — this script only commits it to the shipped file.
// Usage:  node .claude/add-era.js <era.json>
//   era.json = { "year": 1500, "n": "The world in 1500", "geo": [ { "n":"", "col":"#rrggbb", "p":[ [ [lon,lat],... ] rings ] } ] }
// Re-parses timeline.js after writing to confirm it stays valid JS. Stays cheap as the file grows (never re-reads geometry).
const fs = require("fs"), path = require("path");
const file = process.argv[2];
if (!file) { console.error("usage: node .claude/add-era.js <era.json>"); process.exit(1); }
let era;
try { era = JSON.parse(fs.readFileSync(file, "utf8")); }
catch (e) { console.error("couldn't read " + file + ": " + e.message); process.exit(1); }
if (typeof era.year !== "number" || !Array.isArray(era.geo) || !era.geo.length) {
  console.error("era.json needs a numeric `year` and a non-empty `geo` array"); process.exit(1);
}
const TL = path.join(__dirname, "..", "timeline.js");
global.window = {};
require(TL);
const list = Array.isArray(global.window.TIMELINE) ? global.window.TIMELINE : [];
const id = era.id || ("era_" + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36));
list.push({ id: id, year: era.year, n: era.n || "", geo: era.geo });
const out =
  "/* Historical border eras for the Atlas globe timeline (Edit → Timeline). Traced from world-map PNGs.\n" +
  "   Per-era: { id, year, n:label, geo:[ { n, col, p:[ [ [lon,lat],... ] rings ] } ] }. Built in-app; do not hand-edit geometry. */\n" +
  "window.TIMELINE = " + JSON.stringify(list) + ";\n";
fs.writeFileSync(TL, out);
// re-parse to confirm validity
delete require.cache[require.resolve(TL)]; global.window = {}; require(TL);
if (!Array.isArray(global.window.TIMELINE) || global.window.TIMELINE.length !== list.length) { console.error("re-parse failed — timeline.js may be corrupt"); process.exit(1); }
const pts = era.geo.reduce((s, t) => s + (t.p || []).reduce((a, r) => a + r.length, 0), 0);
console.log("added era " + era.year + " (\"" + (era.n || "") + "\") — " + era.geo.length + " territories, " + pts + " points. timeline.js now holds " + list.length + " era(s).");
