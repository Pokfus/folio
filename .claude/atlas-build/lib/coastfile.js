/* lib/coastfile.js — the intermediate `out/coast.bin` between build-land.js and build-admin.js.

   One land/sea partition at full resolution: every ring of the coastline source, quantised, oriented
   land-left, with the Visvalingam effective area of EVERY vertex (as √area in metres, "size"). Nothing
   is thrown away here: build-admin.js decides which vertices a level keeps, and the crossing repair
   can reach for any vertex the source had. Not a shipped format — a scratch file in out/ (git-ignored).

     layout   "FOLIOCST" u32 version u32 headerLen  JSON header  then, 4-byte aligned:
              ringOffset Uint32(rings+1), x Int32(N), y Int32(N), size Float32(N)
     header   { quantum, rings, vertices, source: {…}, census, generated, … }

     write(file, { header, ringOffset, x, y, size })
     read(file) → { header, ringOffset, x, y, size }
*/
"use strict";
const fs = require("fs");
const MAGIC = "FOLIOCST", VERSION = 1;

function write(file, T) {
  const h = Buffer.from(JSON.stringify(T.header), "utf8");
  const parts = [["ringOffset", T.ringOffset], ["x", T.x], ["y", T.y], ["size", T.size]];
  let off = 16 + h.length; off += (4 - off % 4) % 4;
  const sections = {};
  for (const [name, arr] of parts) { sections[name] = { offset: off, length: arr.byteLength }; off += arr.byteLength; off += (4 - off % 4) % 4; }
  const header = Object.assign({}, T.header, { sections });
  const hb = Buffer.from(JSON.stringify(header), "utf8");
  if (hb.length !== h.length) return write(file, Object.assign({}, T, { header: Object.assign({}, T.header, { sections }) }));   // the offsets changed the header's length: once more with them in
  const fd = fs.openSync(file, "w");
  const head = Buffer.alloc(16); head.write(MAGIC, 0, "ascii"); head.writeUInt32LE(VERSION, 8); head.writeUInt32LE(hb.length, 12);
  fs.writeSync(fd, head); fs.writeSync(fd, hb);
  let pos = 16 + hb.length;
  for (const [name, arr] of parts) {
    const s = sections[name];
    if (pos < s.offset) { fs.writeSync(fd, Buffer.alloc(s.offset - pos)); pos = s.offset; }
    fs.writeSync(fd, Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength)); pos += arr.byteLength;
  }
  fs.closeSync(fd);
  return pos;
}

function read(file) {
  const fd = fs.openSync(file, "r");
  const head = Buffer.alloc(16); fs.readSync(fd, head, 0, 16, 0);
  if (head.toString("ascii", 0, 8) !== MAGIC) throw new Error("not a coast file");
  if (head.readUInt32LE(8) !== VERSION) throw new Error("coast file version");
  const hl = head.readUInt32LE(12); const hb = Buffer.alloc(hl); fs.readSync(fd, hb, 0, hl, 16);
  const header = JSON.parse(hb.toString("utf8"));
  const sec = (name, Ctor) => { const s = header.sections[name]; const b = Buffer.alloc(s.length); fs.readSync(fd, b, 0, s.length, s.offset); return new Ctor(b.buffer, b.byteOffset, s.length / Ctor.BYTES_PER_ELEMENT); };
  const out = { header, ringOffset: sec("ringOffset", Uint32Array), x: sec("x", Int32Array), y: sec("y", Int32Array), size: sec("size", Float32Array) };
  fs.closeSync(fd);
  return out;
}

module.exports = { write, read };
