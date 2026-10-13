#!/usr/bin/env node
/* check-core-cache.js — the gate for CORE_CACHE_REV in atlas/atlas.js (Atlas v2 Phase 4b, Task 2).

     node .claude/atlas-build/check-core-cache.js            check (CI): exit 1 when the constant lags
     node .claude/atlas-build/check-core-cache.js --install  rewrite the constant

   A card window's hub keeps its first level (the worker's own output for LOD 0, and topology.bin's header) in IndexedDB so that a warm first window is a read and a draw (atlas.js, "THE FIRST FRAME OF A
   CARD WINDOW, FROM A CACHE"). What is kept is a function of exactly four things: atlas-worker.js, atlas-format.js, vendor/earcut.js and topology.bin (its build id). `CORE_CACHE_REV` is
   `<first ten hex digits of the sha1 of the three code files, in that order>:<the file's build id>`; change any of them and a reader's old cache is stale, which this check turns into a red build
   instead of a window that quietly draws last month's geometry. Zero dependencies. */
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const ROOT = path.resolve(__dirname, "..", "..");
const rd = (p) => fs.readFileSync(path.join(ROOT, p));
const sha = crypto.createHash("sha1"); for (const f of ["atlas/atlas-worker.js", "atlas/atlas-format.js", "atlas/vendor/earcut.js"]) sha.update(rd(f));
globalThis.window = globalThis;
const F = require(path.join(ROOT, "atlas", "atlas-format.js"));
const T = (F.read || globalThis.AtlasFormat.read)(new Uint8Array(rd("atlas/data/topology.bin")));
const want = sha.digest("hex").slice(0, 10) + ":" + T.header.buildId;
const file = path.join(ROOT, "atlas", "atlas.js"), src = fs.readFileSync(file, "utf8");
const m = /const CORE_CACHE_REV = "([^"]*)";/.exec(src);
if (!m) { console.log("FAIL  CORE_CACHE_REV is not in atlas/atlas.js"); process.exit(1); }
if (process.argv.includes("--install")) { fs.writeFileSync(file, src.replace(m[0], `const CORE_CACHE_REV = "${want}";`)); console.log("CORE_CACHE_REV = " + want); process.exit(0); }
if (m[1] !== want) { console.log(`FAIL  CORE_CACHE_REV is "${m[1]}", the worker, the format reader, earcut and topology.bin make "${want}" — run: node .claude/atlas-build/check-core-cache.js --install`); process.exit(1); }
console.log("ok    CORE_CACHE_REV " + want + " is in step with atlas-worker.js, atlas-format.js, vendor/earcut.js and topology.bin");
