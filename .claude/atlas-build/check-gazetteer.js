#!/usr/bin/env node
/* check-gazetteer.js — the gate for atlas/data/gazetteer.js (Phase 1c, docs/atlas-v2-design.md §2.6, §2.8, §2.11).

     node --max-old-space-size=8000 .claude/atlas-build/check-gazetteer.js [--quiet]

   Reads the committed gazetteer the way the browser does (a script assigning window.ATLAS_GAZETTEER), the
   core and water headers, and the z=4 land tiles through lib/landindex.js. Zero dependencies. Exit 1 on any
   failure. WHAT IT PROVES:

     header        the first line carries `sources` with every field §2.10a asks for and an accepted licence
     table         `cols` and `rows` as build-gazetteer.js writes them; every id unique; every kind in the
                   taxonomy; counts per kind match; every `within` names a country or admin-1 row; every
                   `geom` names a face, lake entity or river that exists in the data files
     anchors       the label anchor of EVERY country and admin-1 unit falls inside its own face in the z=4
                   land partition — and by name, the ten v1 got wrong or could get wrong: the United States,
                   Russia, Indonesia, Japan, Chile, Norway, Fiji, Kiribati, Canada, Denmark; every point of a
                   country's label path too. A lake's anchor is on land (inland water is land to the OSM
                   partition); a sea's, ocean's, gulf's or strait's anchor is NOT on land (counted, with a
                   tolerance for Natural Earth's 1:10M marine polygons against the OSM shore)
     titles        a Wikipedia title appears only on a row with a QID and only as the cached sitelink
                   wiki-sitelinks.json holds for that QID — none was written from memory
     prose         every `v1` key exists in countries.js; the countries without one are listed
     size          the file is within the owner's 0.6 MB
*/
"use strict";
const fs = require("fs"), path = require("path");
const F = require("./lib/format.js");
const LandIndex = require("./lib/landindex.js");
const { LICENCES } = require("./fetch-sources.js");

const argv = process.argv.slice(2);
const quiet = argv.includes("--quiet");
const ROOT = path.join(__dirname, "..", "..");
const DATA = path.join(ROOT, "atlas", "data");
const FILE = path.join(DATA, "gazetteer.js");
const BUDGET = 0.6 * 1024 * 1024;
const KINDS = ["country", "admin1", "capital", "city", "town", "sea", "ocean", "strait", "gulf", "lake", "river", "island", "island-group", "range", "region"];
const NAMED = ["United States of America", "Russia", "Indonesia", "Japan", "Chile", "Norway", "Fiji", "Kiribati", "Canada", "Denmark"];

let pass = 0, fail = 0;
const ok = (m, d) => { pass++; if (!quiet) console.log(`  \x1b[32mok\x1b[0m    ${m}${d ? "  \x1b[2m" + d + "\x1b[0m" : ""}`); };
const bad = (m, d) => { fail++; console.log(`  \x1b[31mFAIL\x1b[0m  ${m}${d ? "  \x1b[2m" + d + "\x1b[0m" : ""}`); };
const note = (m) => { if (!quiet) console.log(`        \x1b[2m${m}\x1b[0m`); };

console.log("\n\x1b[1mgazetteer\x1b[0m " + FILE + "\n");
const text = fs.readFileSync(FILE, "utf8");
ok("size " + text.length + " bytes ≤ " + BUDGET, undefined); if (Buffer.byteLength(text) > BUDGET) bad("size over the 0.6 MB budget", Buffer.byteLength(text) + " bytes");

/* header */
const first = text.split("\n")[0];
const hm = /^\/\* sources: (\[.*\]) \*\/$/.exec(first);
if (!hm) bad("first line carries a sources header"); else {
  let sources = null; try { sources = JSON.parse(hm[1]); } catch (e) { bad("sources header is JSON", e.message); }
  if (sources) {
    const need = ["id", "name", "version", "url", "licence", "licenceUrl", "attribution", "retrieved"];
    const faults = [];
    for (const s of sources) { for (const k of need) if (!s[k]) faults.push(s.id + " lacks " + k); if (!Object.prototype.hasOwnProperty.call(LICENCES, s.licence)) faults.push(s.id + " licence " + s.licence); }
    if (faults.length) bad("every source complete with an accepted licence", faults.join("; ")); else ok("sources header: " + sources.length + " sources, licences " + [...new Set(sources.map((s) => s.licence))].join(", "));
    for (const id of ["ne-10m-populated-places", "ne-10m-marine-polys", "ne-10m-regions-polys", "ne-10m-regions-points", "hydrolakes", "ne-10m-rivers", "wikidata-sitelinks", "osm-land-polygons"]) if (!sources.find((s) => s.id === id)) bad("source named: " + id);
  }
}

/* the table, as the browser reads it */
global.window = {};
require(FILE);
const G = global.window.ATLAS_GAZETTEER;
if (!G || !Array.isArray(G.rows) || !Array.isArray(G.cols)) { bad("window.ATLAS_GAZETTEER with cols and rows"); console.log(`\n${pass} ok, ${fail} failed\n`); process.exit(1); }
const col = Object.fromEntries(G.cols.map((c, i) => [c, i]));
const rows = G.rows.map((r) => { const o = {}; G.cols.forEach((c, i) => { o[c] = r[i] == null ? 0 : r[i]; }); if (o.qid) o.qid = "Q" + o.qid; return o; });
for (const o of rows) if (typeof o.within === "number") o.within = o.within > 0 && rows[o.within - 1] ? rows[o.within - 1].id : 0;   // the container's row index + 1, as the browser reads it
ok("rows: " + rows.length + ", cols: " + G.cols.join(" "));
const ids = new Map();
let dup = 0, badKind = 0, badName = 0;
for (const r of rows) { if (ids.has(r.id)) dup++; ids.set(r.id, r); if (!KINDS.includes(r.kind)) badKind++; if (!r.name || /[<>]/.test(r.name) || r.name.length > 90) badName++; }
if (dup) bad("ids unique", dup + " duplicates"); else ok("ids unique");
if (badKind) bad("every kind in the taxonomy", badKind); else ok("every kind in the taxonomy (" + KINDS.length + " kinds)");
if (badName) bad("every name plain and short", badName); else ok("every name plain and short");
const counts = {}; for (const r of rows) counts[r.kind] = (counts[r.kind] || 0) + 1;
const cm = KINDS.filter((k) => (G.counts || {})[k] !== (counts[k] || 0));
if (cm.length) bad("counts per kind match the header", cm.join(", ")); else ok("counts per kind: " + KINDS.map((k) => k + " " + (counts[k] || 0)).join(", "));
let badWithin = 0; const within = [];
for (const r of rows) { if (!r.within) continue; const w = ids.get(r.within); if (!w || (w.kind !== "country" && w.kind !== "admin1")) { badWithin++; within.push(r.id + "→" + r.within); } }
if (badWithin) bad("every `within` names a country or admin-1 row", within.slice(0, 5).join(", ")); else ok("every `within` names a country or admin-1 row (" + rows.filter((r) => r.within).length + " set)");

/* geometry references against the data files */
const core = F.readFile(path.join(DATA, "topology.bin"));
const water = F.readFile(path.join(DATA, "water.bin"), { headerOnly: true });
let badGeom = 0; const geomF = [];
for (const r of rows) {
  if (!r.geom) continue;
  const m = /^([flr])(\d+)$/.exec(String(r.geom)); if (!m) { badGeom++; geomF.push(r.id); continue; }
  const n = Number(m[2]);
  if (m[1] === "f") { const f = core.faces[n]; if (!f || core.header.entities[f.entity].id !== r.id) { badGeom++; geomF.push(r.id); } }
  else if (m[1] === "l") { const e = water.header.entities[n]; if (!e || e.kind !== "lake" || e.id !== r.id) { badGeom++; geomF.push(r.id); } }
  else if (m[1] === "r") { const e = water.header.entities[n]; if (!e || e.kind !== "river" || (e.id !== r.id && e.id + ":" + n !== r.id) || !(water.header.rivers || []).some((rv) => rv.entity === n)) { badGeom++; geomF.push(r.id); } }
}
if (badGeom) bad("every `geom` names its own face, lake or river", geomF.slice(0, 5).join(", ")); else ok("every `geom` names its own face, lake or river");
// every country and admin-1 unit of the core is a row, and the reverse
const coreIds = new Set(core.header.entities.filter((e, i) => core.faces.some((f) => f.entity === i)).map((e) => e.id));
const missingRows = [...coreIds].filter((id) => !ids.has(id));
if (missingRows.length) bad("every face-bearing core entity is a row", missingRows.slice(0, 5).join(", ")); else ok("every face-bearing core entity is a row (" + coreIds.size + ")");

/* anchors against the z=4 land partition */
note("loading the z=4 land tiles…");
const land = LandIndex.load(DATA);
const Q = land.quantum;
function countryAt(lon, lat) {
  const x = Math.round(lon / Q), y = Math.round(lat / Q);
  const t = land.tileOf(x, y); if (!t) return null;
  const byFace = new Map();
  for (const f of t.faces) {
    if (y < f.by0 || y > f.by1) continue;
    const X = f.X, Y = f.Y, m = X.length; let hit = false;
    for (const qx of [x, x + 2 * land.X180, x - 2 * land.X180]) {
      if (qx < f.bx0 || qx > f.bx1) continue;
      let c = false; for (let i = 0, j = m - 1; i < m; j = i++) if ((Y[i] > y) !== (Y[j] > y) && qx < (X[j] - X[i]) * (y - Y[i]) / (Y[j] - Y[i]) + X[i]) c = !c;
      if (c) { hit = true; break; }
    }
    if (hit) byFace.set(f.face, !byFace.get(f.face));
  }
  for (const [fi, inside] of byFace) if (inside) return core.header.entities[t.T.faces[fi].entity].id;
  return null;
}
// admin-1 faces: the tiles carry layer-1 faces too but landindex keeps layer 0 only; test admin-1 anchors
// against their PARENT's land and against the resident LOD 2 face of the core (even-odd in the azimuthal plane)
const Lb = require("./lib/label.js");
function coreFaceRings(face, level) {
  const out = [];
  for (const refs of face.rings) {
    const ring = []; let skip = false;
    for (const ref of refs) { const a = Math.abs(ref) - 1; if (core.arcMinLod[a] > level) { skip = true; break; } const s = core.arcOffset[a], e = core.arcOffset[a + 1]; if (ref > 0) { for (let i = s; i < e; i++) if (core.rank[i] <= level) ring.push(i); } else { for (let i = e - 1; i >= s; i--) if (core.rank[i] <= level) ring.push(i); } }
    if (!skip && ring.length >= 3) out.push(ring.map((i) => [core.lon[i] * core.quantum, core.lat[i] * core.quantum]));
  }
  return out;
}
let anchorFail = [], pathFail = [], a1Fail = [];
for (const r of rows) {
  if (r.kind === "country") {
    const at = countryAt(r.at[0], r.at[1]);
    if (at !== r.id) anchorFail.push(r.name + " → " + (at || "sea"));
    for (const p of r.path || []) { const c = countryAt(p[0], p[1]); if (c !== r.id) { pathFail.push(r.name + " path point → " + (c || "sea")); break; } }
  } else if (r.kind === "admin1") {
    const at = countryAt(r.at[0], r.at[1]);
    if (at !== r.within) { a1Fail.push(r.name + " → " + (at || "sea")); continue; }
    const fi = Number(String(r.geom).slice(1));
    const parts = []; for (const f of core.faces.map((f, i) => [f, i]).filter(([f]) => core.header.entities[f.entity].id === r.id)) parts.push(...coreFaceRings(f[0], 2));
    if (!Lb.insideRings(parts, r.at[0], r.at[1])) a1Fail.push(r.name + " not inside its own LOD 2 face");
  }
}
if (anchorFail.length) bad("every country's label anchor lies in its own land", anchorFail.slice(0, 8).join("; ")); else ok("every country's label anchor lies in its own land (" + counts.country + ")");
if (pathFail.length) bad("every point of every country's label path lies in its own land", pathFail.slice(0, 8).join("; ")); else ok("every point of every country's label path lies in its own land");
if (a1Fail.length) bad("every admin-1 anchor lies in its parent's land and inside its own face", a1Fail.slice(0, 8).join("; ")); else ok("every admin-1 anchor lies in its parent's land and inside its own face (" + counts.admin1 + ")");
for (const name of NAMED) {
  const r = rows.find((x) => x.kind === "country" && x.name === name);
  if (!r) { bad("named country present: " + name); continue; }
  const at = countryAt(r.at[0], r.at[1]);
  if (at === r.id) ok(`${name}: anchor (${r.at.join(", ")}) is in ${name}`, "path " + (r.path || []).map((p) => p.join(",")).join(" → ") + ", " + r.len + " km"); else bad(`${name}: anchor (${r.at.join(", ")}) is in ${name}`, "it is in " + (at || "the sea"));
}
// lakes on land, seas off it
let lakeOff = [], seaOn = [], islOff = [];
for (const r of rows) {
  if (r.kind === "lake") { if (!land.isLand(Math.round(r.at[0] / Q), Math.round(r.at[1] / Q))) lakeOff.push(r.name); }
  else if (/^(sea|ocean|gulf|strait)$/.test(r.kind)) { if (land.isLand(Math.round(r.at[0] / Q), Math.round(r.at[1] / Q))) seaOn.push(r.name); }
  else if (r.kind === "island" && r.geom === 0 && r.len > 0) { if (!land.isLand(Math.round(r.at[0] / Q), Math.round(r.at[1] / Q))) islOff.push(r.name); }
}
const pct = (n, d) => (100 * n / Math.max(1, d)).toFixed(1) + " %";
if (lakeOff.length > 0.01 * counts.lake) bad("lake anchors on land (inland water is land to the partition)", lakeOff.length + " off: " + lakeOff.slice(0, 6).join(", ")); else ok("lake anchors on land", lakeOff.length + " of " + counts.lake + " off (" + pct(lakeOff.length, counts.lake) + "): " + lakeOff.slice(0, 4).join(", "));
const seaN = rows.filter((r) => /^(sea|ocean|gulf|strait)$/.test(r.kind)).length;
if (seaOn.length > 0.03 * seaN) bad("sea, ocean, gulf and strait anchors off the land", seaOn.length + " on land: " + seaOn.slice(0, 8).join(", ")); else ok("sea, ocean, gulf and strait anchors off the land", seaOn.length + " of " + seaN + " on land (" + pct(seaOn.length, seaN) + "): " + seaOn.slice(0, 4).join(", "));
const islN = rows.filter((r) => r.kind === "island" && r.geom === 0 && r.len > 0).length;
if (islOff.length > 0.05 * islN) bad("island polygon anchors on land", islOff.length + " off: " + islOff.slice(0, 8).join(", ")); else ok("island polygon anchors on land", islOff.length + " of " + islN + " off (" + pct(islOff.length, islN) + "): " + islOff.slice(0, 4).join(", "));

/* titles only from the cache */
let cache = null; try { cache = JSON.parse(fs.readFileSync(path.join(__dirname, "wiki-sitelinks.json"), "utf8")); } catch (e) {}
if (!cache) bad("wiki-sitelinks.json (the fetched sitelinks) exists beside the builder"); else {
  let fromMemory = [], noQid = 0, titles = 0;
  for (const r of rows) {
    if (!r.wiki) continue; titles++;
    if (!r.qid) { noQid++; continue; }
    const want = r.wiki === 1 ? r.name : r.wiki;
    if (cache.titles[r.qid] !== want) fromMemory.push(r.id + " " + want);
  }
  if (noQid) bad("a Wikipedia title only on a row with a QID", noQid); else ok("a Wikipedia title only on a row with a QID");
  if (fromMemory.length) bad("every title is the cached enwiki sitelink of its QID", fromMemory.slice(0, 5).join("; ")); else ok("every title is the cached enwiki sitelink of its QID", titles + " titles, cache of " + Object.keys(cache.titles).length + " items retrieved " + cache.retrieved);
}

/* prose keys */
global.window.COUNTRY_INFO = undefined; require(path.join(ROOT, "countries.js"));
const info = global.window.COUNTRY_INFO || {};
const badV1 = rows.filter((r) => r.kind === "country" && r.v1 && !info[r.v1]).map((r) => r.name);
if (badV1.length) bad("every v1 key exists in countries.js", badV1.join(", ")); else ok("every v1 key exists in countries.js", rows.filter((r) => r.kind === "country" && r.v1).length + " of " + counts.country + " countries have prose; without: " + rows.filter((r) => r.kind === "country" && !r.v1).map((r) => r.name).join(", "));

console.log(`\n${pass} ok, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
