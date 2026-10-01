#!/usr/bin/env node
/* prep.js — the inputs compose.py reads besides the plates, written into its work dir.

     node .claude/ww2-plates/prep.js <ww2-atlas/data/territory/control> <workdir>

   · world-rings.json   world.js's land rings (the coast every plate's water is read against)
   · lakes.json         lakes.js's rings
   · base-1942-12.json  the vector source's December 1942 map, the four sets exactly as build-fronts.js
                        writes them — the map 1943 carries on from outside the plates' frames
   · homes-eur.json     whose ground is whose own: the Axis set of December 1942, and every month's Allied
                        set (so France, Poland and Norway count as Allied ground they were driven from)
   · homes-pac.json     the Empire of Japan's own ground: Japan, Korea and Taiwan from world.js, and boxes
                        for Karafuto (south of 50°N on Sakhalin) and the Kurils — land clips them

   Zero dependencies. Not part of the site. */
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..", "..");
const [dir, work] = process.argv.slice(2);
if (!dir || !work || !fs.existsSync(path.join(dir, "index.json"))) { console.error("usage: node .claude/ww2-plates/prep.js <control-dir> <workdir>"); process.exit(1); }
const { frontRing, ORDER } = require("../build-fronts.js");
const load = (f) => { const w = {}; new Function("window", fs.readFileSync(path.join(ROOT, f), "utf8"))(w); return w; };   // eslint-disable-line no-new-func
const geo = load("world.js").WORLD_GEO, lakes = load("lakes.js").LAKES;
const idx = JSON.parse(fs.readFileSync(path.join(dir, "index.json"), "utf8"));
const months = {};
for (const e of idx.months) {
  const fc = JSON.parse(fs.readFileSync(path.join(dir, e.file), "utf8")), sets = ORDER.map(() => []);
  for (const f of fc.features) {
    const polys = f.geometry.type === "MultiPolygon" ? f.geometry.coordinates : [f.geometry.coordinates];
    for (const poly of polys) { const r = frontRing(poly[0]); if (r) sets[ORDER.indexOf(f.properties.control)].push(r); }
  }
  months[e.month] = sets;
}
const by = (n) => (geo.find((c) => String(c.n).toLowerCase() === n) || { p: [] }).p;
const jp = [].concat(...["japan", "south korea", "north korea", "taiwan"].map(by),
  [[[141, 45.8], [145, 45.8], [145, 50], [141, 50]], [[145, 43.4], [157, 43.4], [157, 50.7], [145, 50.7]]]);
const out = {
  "world-rings.json": geo.map((c) => c.p),
  "lakes.json": [].concat(...lakes),
  "base-1942-12.json": months["1942-12"],
  "homes-eur.json": { axis: months["1942-12"][0], allied: [].concat(...Object.values(months).map((s) => s[2])) },
  "homes-pac.json": { axis: jp, allied: null },
};
fs.mkdirSync(work, { recursive: true });
for (const f of Object.keys(out)) fs.writeFileSync(path.join(work, f), JSON.stringify(out[f]));
console.log("wrote " + Object.keys(out).join(", ") + " to " + work);
