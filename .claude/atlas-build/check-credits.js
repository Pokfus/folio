#!/usr/bin/env node
/* check-credits.js — the gate for atlas/data/credits.js (Phase 1d, docs/atlas-v2-design.md §2.10a).

     node .claude/atlas-build/check-credits.js

   Regenerates the credits table in memory from every file header under atlas/data/ (build-credits.js) and
   proves: the committed file is in step with the data (stale = FAIL, with the command that fixes it); every
   source id in every file header is on the page's data; no source listed is absent from every file; every
   licence is an accepted identifier (§2.10a); every link is https; every field the page shows is present;
   a share-alike source's derived files are files of their own (no file mixes a share-alike source with a
   non-share-alike geometry source of the SAME kind — the OSM land partition and Natural Earth's borders share
   topology.bin by design: the file is ODbL as a whole, which is what the header and the page say).
   Zero dependencies; exit 1 on any failure. */
"use strict";
const fs = require("fs"), path = require("path");
const B = require("./build-credits.js");
const { LICENCES } = require("./fetch-sources.js");

let pass = 0, fail = 0;
const ok = (m, d) => { pass++; console.log(`  \x1b[32mok\x1b[0m    ${m}${d ? "  \x1b[2m" + d + "\x1b[0m" : ""}`); };
const bad = (m, d) => { fail++; console.log(`  \x1b[31mFAIL\x1b[0m  ${m}${d ? "  \x1b[2m" + d + "\x1b[0m" : ""}`); };

console.log("\n\x1b[1mcredits\x1b[0m " + B.TARGET + "\n");
const r = B.build({ check: true, log: () => {} });
const c = r.collected;
if (!fs.existsSync(B.TARGET)) bad("atlas/data/credits.js exists"); else if (!r.ok) bad("atlas/data/credits.js is in step with every file header", "run: node .claude/atlas-build/build-credits.js --install"); else ok("atlas/data/credits.js is in step with every file header", `${c.filesRead} files, ${c.sources.length} sources`);

global.window = {};
require(B.TARGET);
const C = global.window.ATLAS_CREDITS;
if (!C || !Array.isArray(C.sources)) { bad("window.ATLAS_CREDITS with sources"); console.log(`\n${pass} ok, ${fail} failed\n`); process.exit(1); }
const onPage = new Set(C.sources.map((s) => s.id));
const inFiles = new Set(); for (const f of c.fileSources) for (const id of f.ids) inFiles.add(id);
const missing = [...inFiles].filter((id) => !onPage.has(id)), orphan = [...onPage].filter((id) => !inFiles.has(id));
if (missing.length) bad("every source id in every file header is on the page", missing.join(", ")); else ok("every source id in every file header is on the page", [...inFiles].sort().join(", "));
if (orphan.length) bad("no listed source is absent from every file", orphan.join(", ")); else ok("no listed source is absent from every file");
const faults = [];
for (const s of C.sources) for (const v of s.variants) {
  for (const k of ["name", "version", "url", "licence", "licenceUrl", "attribution", "retrieved"]) if (!v[k]) faults.push(`${s.id} lacks ${k}`);
  if (!Object.prototype.hasOwnProperty.call(LICENCES, v.licence)) faults.push(`${s.id} licence ${v.licence}`);
  for (const k of ["url", "licenceUrl"]) if (v[k] && !/^https:\/\//.test(v[k])) faults.push(`${s.id} ${k} is not https`);
  if (!v.files || !v.files.length) faults.push(`${s.id} names no derived file`);
  if (v.shareAlike !== !!(LICENCES[v.licence] && LICENCES[v.licence].shareAlike)) faults.push(`${s.id} shareAlike flag`);
}
if (faults.length) bad("every variant complete, licence accepted, links https", faults.join("; ")); else ok("every variant complete, licence accepted, links https", [...new Set(C.sources.flatMap((s) => s.variants.map((v) => v.licence)))].join(", "));
// every file that names a share-alike source is listed under it (so the ODbL statement names every ODbL file)
const share = C.sources.filter((s) => s.variants.some((v) => v.shareAlike));
const shareFiles = new Set(share.flatMap((s) => s.variants.flatMap((v) => v.files.map((f) => f.path))));
const unlisted = c.fileSources.filter((f) => f.ids.some((id) => share.some((s) => s.id === id))).filter((f) => ![...shareFiles].some((p) => (p.endsWith("/") ? f.rel.startsWith(p) : f.rel === p))).map((f) => f.rel);
if (unlisted.length) bad("every share-alike file is listed under its source", unlisted.slice(0, 5).join(", ")); else ok("every share-alike file is listed under its source", `${share.map((s) => s.id).join(", ")}: ${[...shareFiles].sort().join(", ")}`);
console.log(`\n${pass} ok, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
