#!/usr/bin/env node
/* check-sizes.js — what Folio actually weighs, measured rather than quoted.
 *
 * WHY THIS EXISTS. CLAUDE.md used to STATE the eager path's size, app.js's size and
 * glossary.js's composition, with a note beside the first saying "re-measure it rather
 * than quoting it". A warning cannot measure. Every one of those figures drifted 2-4x
 * out of date anyway (app.js was written as ~684 KB and was 2.70 MB; the eager path as
 * 5.90 MB and was 8.80 MB) -- and a figure that is quietly four times wrong is worse
 * than no figure, because it is used to decide whether a change is affordable.
 *
 * So the numbers live HERE, where they are read off the files, and CLAUDE.md points at
 * this instead of restating them.
 *
 *   node .claude/check-sizes.js            the eager path, the lazy bundles, the big globals
 *   node .claude/check-sizes.js --json     the same as JSON, for a script
 *
 * Zero dependencies. Not part of the site.
 */
"use strict";
const fs = require("fs"), path = require("path"), zlib = require("zlib");
const ROOT = path.join(__dirname, "..");
const JSON_OUT = process.argv.includes("--json");

/* The eager path, in load order. It is READ OUT OF index.html rather than listed here:
   a hand-kept copy is the same failure this script exists to stop. */
function eagerPath() {
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const out = [];
  const rx = /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
  let m;
  while ((m = rx.exec(html))) {
    const tag = m[0], src = m[1];
    if (/\bdefer\b|\basync\b|\btype=["']module["']/i.test(tag)) continue;
    if (/^(https?:)?\/\//.test(src)) continue;               // not ours
    if (fs.existsSync(path.join(ROOT, src))) out.push(src);
  }
  return out;
}

function sizes(rel) {
  const buf = fs.readFileSync(path.join(ROOT, rel));
  return { file: rel, raw: buf.length, gz: zlib.gzipSync(buf, { level: 9 }).length };
}
const MB = (n) => (n / 1048576).toFixed(2) + " MB";
const KB = (n) => Math.round(n / 1024).toLocaleString() + " KB";

/* ---------- the eager path ---------- */
const eager = eagerPath().map(sizes);
const eRaw = eager.reduce((a, f) => a + f.raw, 0);
const eGz = eager.reduce((a, f) => a + f.gz, 0);

/* ---------- everything else in the repo root that ships ---------- */
const eagerSet = new Set(eager.map((f) => f.file));
const others = fs.readdirSync(ROOT)
  .filter((f) => /\.(js|css)$/.test(f) && !eagerSet.has(f))
  .map(sizes).sort((a, b) => b.raw - a.raw);

/* ---------- what is inside the two biggest data files ---------- */
function globals(rel) {
  const g = {};
  const sandbox = { window: g };
  try {
    const code = fs.readFileSync(path.join(ROOT, rel), "utf8");
    require("vm").runInNewContext(code, sandbox, { timeout: 20000 });
  } catch (e) { return null; }
  return Object.keys(g).map((k) => {
    let n = 0;
    try { n = JSON.stringify(g[k]).length; } catch (e) { n = 0; }
    return { name: k, bytes: n };
  }).filter((x) => x.bytes > 1024).sort((a, b) => b.bytes - a.bytes);
}

const breakdown = {};
for (const f of ["glossary.js", "data.js", "artefacts.js"]) {
  if (fs.existsSync(path.join(ROOT, f))) breakdown[f] = globals(f);
}

if (JSON_OUT) {
  console.log(JSON.stringify({ eager, eagerRaw: eRaw, eagerGz: eGz, others, breakdown }, null, 2));
  process.exit(0);
}

console.log("\n\x1b[1mTHE EAGER LOAD PATH\x1b[0m  (every visitor downloads all of this before flipping a card)\n");
for (const f of eager)
  console.log(`  ${MB(f.raw).padStart(8)}  ${MB(f.gz).padStart(8)} gz   ${f.file}`);
console.log(`  ${"-".repeat(34)}`);
console.log(`  \x1b[1m${MB(eRaw).padStart(8)}  ${MB(eGz).padStart(8)} gz   TOTAL (${eager.length} files)\x1b[0m\n`);

console.log("\x1b[1mLAZY / NOT ON THAT PATH\x1b[0m  (top 12 by raw size)\n");
for (const f of others.slice(0, 12))
  console.log(`  ${MB(f.raw).padStart(8)}  ${MB(f.gz).padStart(8)} gz   ${f.file}`);

for (const [file, list] of Object.entries(breakdown)) {
  if (!list || !list.length) continue;
  const tot = list.reduce((a, x) => a + x.bytes, 0);
  console.log(`\n\x1b[1mINSIDE ${file}\x1b[0m  (JSON size of each global, largest first)\n`);
  for (const x of list)
    console.log(`  ${KB(x.bytes).padStart(10)}  ${String(Math.round((x.bytes / tot) * 100)).padStart(3)}%   ${x.name}`);
}

console.log("\nQuote none of this in prose -- run it. That is the whole point of the file.\n");
