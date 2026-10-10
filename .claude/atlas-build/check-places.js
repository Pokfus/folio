#!/usr/bin/env node
/* check-places.js — the gate for atlas/data/places.js (Atlas v2 Phase 3a; docs/atlas-v2-design.md §2.8, §2.11).

     node .claude/atlas-build/check-places.js [--quiet]

   Reads the committed file the way the browser will (a script assigning window.ATLAS_PLACES), the gazetteer beside it, the
   history entity table and the Wikidata cache. Zero dependencies. Exit 1 on any failure. WHAT IT PROVES:
     header     the first line carries `sources` with every field §2.10a asks for and an accepted licence (CC0)
     in step    the file is what places-spec.json builds (build-places.js --check)
     table      `cols` as build-places.js writes them; every id `pl:q<number>` with its `qid`; every kind in the taxonomy; counts
                per kind match; no id and no QID shared with the gazetteer or the entity table (one row per item across the
                registry); every `within` resolves to a registry row that is a city, a town, a capital, a site, a country or a
                province; aliases distinct and never the name; names plain (no markup)
     Wikidata   every row's item is in the cache (places-wikidata.json `items`) with a coordinate within 1 km of the row's `at`
                and with classes — the row was checked against the service, never typed; a manual row the same
     size       the file is under 0.3 MB (decimal), so the registry's two files stay under 0.9 MB together */
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..", "..");
const R = require(path.join(ROOT, ".claude", "places-registry.js"));
const B = require("./build-places.js");
const { LICENCES } = require("./fetch-sources.js");
const quiet = process.argv.includes("--quiet");
const BUDGET = 300000;
let pass = 0, fail = 0;
const ok = (m, d) => { pass++; if (!quiet) console.log(`  \x1b[32mok\x1b[0m    ${m}${d ? "  \x1b[2m" + d + "\x1b[0m" : ""}`); };
const bad = (m, d) => { fail++; console.log(`  \x1b[31mFAIL\x1b[0m  ${m}${d ? "  \x1b[2m" + d + "\x1b[0m" : ""}`); };

console.log("\n\x1b[1mplaces\x1b[0m " + path.relative(ROOT, B.TARGET) + "\n");
if (!fs.existsSync(B.TARGET)) { bad("atlas/data/places.js exists", "run: node .claude/atlas-build/build-places.js --install"); console.log(`\n${pass} ok, ${fail} failed\n`); process.exit(1); }
const text = fs.readFileSync(B.TARGET, "utf8");
const first = text.split("\n")[0];
const m = /^\/\* sources: (\[.*\]) \*\/$/.exec(first);
if (!m) bad("first line carries `sources`"); else {
  const src = JSON.parse(m[1]); const faults = [];
  for (const s of src) { for (const k of ["id", "name", "version", "url", "licence", "licenceUrl", "attribution", "retrieved"]) if (!s[k]) faults.push(s.id + " lacks " + k); if (!Object.prototype.hasOwnProperty.call(LICENCES, s.licence)) faults.push(s.id + " licence " + s.licence); }
  faults.length ? bad("header sources complete with accepted licences", faults.join("; ")) : ok("header sources complete with accepted licences", src.map((s) => s.id + " (" + s.licence + ")").join(", "));
}
const step = B.build({ check: true, log: () => {} });
step.ok ? ok("in step with places-spec.json", step.rows.length + " rows") : bad("in step with places-spec.json", step.why);
const bytes = Buffer.byteLength(text, "utf8");
bytes <= BUDGET ? ok("size " + bytes + " bytes ≤ " + BUDGET) : bad("size over the 0.3 MB budget", bytes + " bytes");
let P;
try { P = R.readTable(B.TARGET, "ATLAS_PLACES"); } catch (e) { bad("the file parses as a table", e.message); console.log(`\n${pass} ok, ${fail} failed\n`); process.exit(1); }
P.table.cols.join() === B.COLS.join() ? ok("cols as build-places.js writes them") : bad("cols", P.table.cols.join());
const rows = P.rows;
const reg = R.loadRegistry();
const gz = R.readTable(R.GAZETTEER, "ATLAS_GAZETTEER").rows;
const gzQ = new Map(gz.filter((r) => r.qid).map((r) => [r.qid, r.id])), gzId = new Set(gz.map((r) => r.id));
const entQ = new Map(reg.entities.filter((e) => e.qid).map((e) => [e.qid, e.id]));
let badId = 0, badKind = 0, badName = 0, dupId = 0, sharedQ = [], badWithin = [], badAlias = 0;
const seen = new Set(), seenQ = new Set(), counts = {};
for (const r of rows) {
  if (!/^pl:q\d+$/.test(r.id) || "pl:q" + String(r.qid).slice(1) !== r.id) badId++;
  if (seen.has(r.id)) dupId++; seen.add(r.id);
  if (seenQ.has(r.qid)) dupId++; seenQ.add(r.qid);
  if (!R.PLACE_KINDS.includes(r.kind)) badKind++;
  counts[r.kind] = (counts[r.kind] || 0) + 1;
  if (!r.name || /[<>]/.test(r.name) || r.name.length > 90) badName++;
  if (gzId.has(r.id) || gzQ.has(r.qid)) sharedQ.push(r.id + " ~ " + (gzQ.get(r.qid) || "id")); if (entQ.has(r.qid)) sharedQ.push(r.id + " ~ " + entQ.get(r.qid));
  if (r.within) { const w = reg.rows.get(r.within); if (!w || !/^(capital|city|town|site|country|admin1|region|island)$/.test(w.kind)) badWithin.push(r.id + " within " + r.within); }
  const fa = new Set([R.fold(r.name)]); for (const a of r.aliases) { if (fa.has(R.fold(a))) badAlias++; fa.add(R.fold(a)); }
}
badId ? bad("every id is pl:q<number> matching its qid", badId) : ok("every id is pl:q<number> matching its qid");
dupId ? bad("no id or QID twice", dupId) : ok("no id or QID twice");
badKind ? bad("every kind in the taxonomy", badKind) : ok("every kind in the taxonomy (" + R.PLACE_KINDS.length + " kinds)");
const cm = Object.keys(Object.assign({}, counts, P.table.counts || {})).filter((k) => (P.table.counts || {})[k] !== (counts[k] || 0));
cm.length ? bad("counts per kind match the header", cm.join(", ")) : ok("counts per kind: " + Object.entries(counts).map(([k, n]) => k + " " + n).join(", "));
badName ? bad("names plain and under 90 characters", badName) : ok("names plain and under 90 characters");
sharedQ.length ? bad("no row duplicates a gazetteer row or an entity (by id or QID)", sharedQ.slice(0, 6).join("; ")) : ok("no row duplicates a gazetteer row or an entity (by id or QID)");
badWithin.length ? bad("every `within` resolves to a containing row of a fitting kind", badWithin.slice(0, 6).join("; ")) : ok("every `within` resolves to a containing row of a fitting kind", rows.filter((r) => r.within).length + " rows within another");
badAlias ? bad("aliases distinct and never the name", badAlias) : ok("aliases distinct and never the name");
/* the Wikidata check, offline: the cache holds the item with its coordinate and classes */
const cache = B.loadCache(); const items = cache.items || {};
const unchecked = [], far = [], noClass = [];
for (const r of rows) { const it = items[r.qid]; if (!it) { unchecked.push(r.id); continue; } if (!it.coord) { far.push(r.id + " (no coordinate)"); continue; } const d = R.km(it.coord, r.at); if (d > 1) far.push(r.id + " " + d.toFixed(1) + " km"); if (!it.classes || !it.classes.length) noClass.push(r.id); }
unchecked.length ? bad("every row's item is in the Wikidata cache", unchecked.length + ": " + unchecked.slice(0, 5).join(", ")) : ok("every row's item is in the Wikidata cache", rows.length + " items, retrieved " + (cache.retrieved || "never"));
far.length ? bad("every row's `at` is the item's coordinate (within 1 km)", far.slice(0, 5).join("; ")) : ok("every row's `at` is the item's coordinate (within 1 km)");
noClass.length ? bad("every row's item carries classes", noClass.slice(0, 5).join(", ")) : ok("every row's item carries classes");
console.log(`\n${pass} ok, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
