#!/usr/bin/env node
/* check-relief-detail.js — the gate for the relief's detail level (2026-10-25; build-relief-detail.js).

     node .claude/atlas-build/check-relief-detail.js [dir] [--max-bytes N]      zero-dependency, what CI runs

   detail.json parses and names complete sources (§2.10a); its grid is the 144 × 72 grid of 2.5° tiles of 600² texels; every
   listed tile is on disk as a baseline 8-bit greyscale JPEG of 600 × 600 (read from its SOF marker), with a key inside the grid;
   nothing is on disk that the index omits; the byte count matches the index; and the level stays within its budget
   (110 MB by default: the measured build, with room for a re-encode — the owner's figure goes here when there is one). */
"use strict";
const fs = require("fs"), path = require("path");

const HERE = __dirname;
const argv = process.argv.slice(2);
const flag = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const DIR = argv.find((a, i) => !a.startsWith("--") && argv[i - 1] !== "--max-bytes") || path.join(HERE, "..", "..", "atlas", "data", "relief-detail");
const maxBytes = Number(flag("--max-bytes", 110 * 1024 * 1024));

let pass = 0, fail = 0;
const ok = (m, d) => { pass++; console.log(`  \x1b[32mok\x1b[0m    ${m}${d ? "  \x1b[2m" + d + "\x1b[0m" : ""}`); };
const bad = (m, d) => { fail++; console.log(`  \x1b[31mFAIL\x1b[0m  ${m}${d ? "  \x1b[2m" + d + "\x1b[0m" : ""}`); };

/* a JPEG's frame header: width, height, components, precision and the SOF type */
function jpegInfo(b) {
  if (b[0] !== 0xff || b[1] !== 0xd8) return null;
  let p = 2;
  while (p + 4 <= b.length) {
    if (b[p] !== 0xff) return null;
    const m = b[p + 1], len = b.readUInt16BE(p + 2);
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { sof: m, precision: b[p + 4], height: b.readUInt16BE(p + 5), width: b.readUInt16BE(p + 7), components: b[p + 9] };
    p += 2 + len;
  }
  return null;
}

console.log(`\ncheck-relief-detail: ${path.relative(process.cwd(), DIR)}\n`);
const index = JSON.parse(fs.readFileSync(path.join(DIR, "detail.json"), "utf8"));
{
  const REQ = ["id", "name", "version", "url", "licence", "licenceUrl", "attribution", "retrieved", "sha256"];
  const missing = []; (index.sources || []).forEach((s) => REQ.forEach((k) => { if (!s[k]) missing.push(`${s.id || "?"}.${k}`); }));
  !index.sources || !index.sources.length ? bad("detail.json carries a sources block") : missing.length ? bad("every source is complete", missing.join(", ")) : ok("detail.json sources complete", index.sources.map((s) => `${s.id} (${s.licence})`).join(", "));
}
const g = index.grid || {};
g.cols === 144 && g.rows === 72 && g.size === 600 && g.degrees === 2.5 && g.rowsFrom === "south" ? ok("the grid is 144 × 72 tiles of 2.5°, 600² texels, rows from the south") : bad("the grid is 144 × 72 tiles of 2.5°, 600² texels, rows from the south", JSON.stringify(g));
const listed = new Set(index.tiles || []);
listed.size === (index.tiles || []).length && listed.size === index.count ? ok("the tile list has no duplicate and matches its count", `${listed.size} tiles`) : bad("the tile list has no duplicate and matches its count", `${listed.size} distinct of ${(index.tiles || []).length}, count ${index.count}`);
let outside = 0, missing = 0, badJpeg = 0, total = 0, largest = { bytes: 0 };
for (const k of listed) {
  const m = /^(\d+)-(\d+)$/.exec(k);
  if (!m || +m[1] >= g.cols || +m[2] >= g.rows) { outside++; continue; }
  const file = path.join(DIR, k + ".jpg");
  if (!fs.existsSync(file)) { missing++; continue; }
  const b = fs.readFileSync(file); total += b.length; if (b.length > largest.bytes) largest = { bytes: b.length, file: k + ".jpg" };
  const j = jpegInfo(b);
  if (!j || j.width !== g.size || j.height !== g.size || j.components !== 1 || j.precision !== 8 || (j.sof !== 0xc0 && j.sof !== 0xc2)) badJpeg++;
}
outside ? bad("every key lies inside the grid", `${outside} outside`) : ok("every key lies inside the grid");
missing ? bad("every listed tile is on disk", `${missing} missing`) : ok("every listed tile is on disk");
badJpeg ? bad("every tile is an 8-bit greyscale JPEG of 600 × 600", `${badJpeg} not`) : ok("every tile is an 8-bit greyscale JPEG of 600 × 600");
const extra = fs.readdirSync(DIR).filter((f) => f !== "detail.json" && !(f.endsWith(".jpg") && listed.has(f.slice(0, -4))));
extra.length ? bad("nothing is on disk that the index omits", extra.slice(0, 5).join(", ")) : ok("nothing is on disk that the index omits");
total === index.bytes ? ok("the bytes on disk are the index's", `${(total / 1048576).toFixed(2)} MB`) : bad("the bytes on disk are the index's", `${total} on disk, ${index.bytes} in the index`);
total > maxBytes ? bad(`the level within ${(maxBytes / 1048576).toFixed(0)} MB`, `${(total / 1048576).toFixed(2)} MB`) : ok(`the level within ${(maxBytes / 1048576).toFixed(0)} MB`, `${(total / 1048576).toFixed(2)} MB in ${listed.size} files, largest ${largest.file} ${(largest.bytes / 1024).toFixed(0)} KB`);
console.log(`\n${pass} ok, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
