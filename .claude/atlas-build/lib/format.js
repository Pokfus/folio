/* lib/format.js — the `.bin` topology writer and reader, for the build scripts.

   The format itself lives in atlas/atlas-format.js, ONE file loaded by the browser, the worker, the
   checker and the Playwright suites (docs/atlas-v2-design.md §7 Phase 0: "a zero-dependency reader
   shared with the checker and the runtime"). This module re-exports it and adds the two things only
   Node needs: writing a file to disk with its size reported, and reading one back.
*/
"use strict";
const fs = require("fs"), path = require("path");
const Format = require(path.join(__dirname, "..", "..", "..", "atlas", "atlas-format.js"));

function writeFile(file, topology) {
  const bytes = Format.write(topology);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, bytes);
  return bytes.length;
}

function readFile(file, opts) {
  return Format.read(new Uint8Array(fs.readFileSync(file)), opts);
}

module.exports = Object.assign({}, Format, { writeFile, readFile });
