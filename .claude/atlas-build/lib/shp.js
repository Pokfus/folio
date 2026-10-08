/* lib/shp.js — a streaming ESRI shapefile reader (polygons and polylines), zero dependencies.

   WHY NOT MAPSHAPER HERE. The OSM land polygons are ~1 GB of .shp with ~50 M vertices; mapshaper (and
   every GeoJSON route) materialises the whole file as JavaScript objects before any processing can
   start, which is several GB of heap for one landmass. This reader hands over ONE RECORD AT A TIME
   from a file descriptor, so the caller can quantise and simplify each ring and drop the raw
   coordinates before the next record is read. Memory is bounded by the largest single record
   (Eurasia–Africa, tens of millions of doubles) rather than by the file.

     const { readShp, readDbf } = require("./lib/shp.js");
     for (const rec of readShp(file)) {            // a generator; rec = { n, type, parts: [Float64Array xy…] }
       for (const part of rec.parts) …             // part = Float64Array [x0, y0, x1, y1, …]
     }
     const rows = readDbf(file.replace(/\.shp$/, ".dbf"));   // attributes, one object per record (small tables only)

   FORMAT (ESRI Shapefile Technical Description, 1998): a 100-byte main header (big-endian file length in
   16-bit words at byte 24, little-endian shape type at 32), then records: 8-byte header (big-endian
   record number and content length in words), then the content (little-endian): shape type, bounding
   box (4 doubles), numParts, numPoints, parts[] (int32 start indices), points[] (doubles xy).
   Shape types handled: 3 PolyLine, 5 Polygon, 13 PolyLineZ, 15 PolygonZ, 23/25 the M variants (Z and M
   values are skipped). Null shapes (0) are yielded with no parts.

   .dbf: dBASE III — a 32-byte header (record count at 4, header size at 8, record size at 10), field
   descriptors of 32 bytes until 0x0D, then fixed-width records; values are decoded as latin1 unless
   the caller passes an encoding (Natural Earth is UTF-8). Numeric fields (N, F) become numbers.
*/
"use strict";
const fs = require("fs");

function* readShp(file) {
  const fd = fs.openSync(file, "r");
  try {
    const head = Buffer.alloc(100);
    if (fs.readSync(fd, head, 0, 100, 0) !== 100) throw new Error("shp: short header");
    if (head.readInt32BE(0) !== 9994) throw new Error("shp: bad magic");
    const fileLen = head.readInt32BE(24) * 2;
    let pos = 100;
    const rh = Buffer.alloc(8);
    let buf = Buffer.alloc(1 << 20);
    while (pos + 8 <= fileLen) {
      if (fs.readSync(fd, rh, 0, 8, pos) !== 8) break;
      const n = rh.readInt32BE(0), len = rh.readInt32BE(4) * 2;
      pos += 8;
      if (buf.length < len) buf = Buffer.alloc(Math.max(len, buf.length * 2));
      if (fs.readSync(fd, buf, 0, len, pos) !== len) throw new Error("shp: short record " + n);
      pos += len;
      const type = buf.readInt32LE(0);
      if (type === 0) { yield { n, type, parts: [] }; continue; }
      if (![3, 5, 13, 15, 23, 25].includes(type)) throw new Error("shp: unsupported shape type " + type + " in record " + n);
      const numParts = buf.readInt32LE(36), numPoints = buf.readInt32LE(40);
      const parts = new Array(numParts);
      const partsAt = 44, pointsAt = partsAt + 4 * numParts;
      for (let p = 0; p < numParts; p++) {
        const s = buf.readInt32LE(partsAt + 4 * p), e = p + 1 < numParts ? buf.readInt32LE(partsAt + 4 * (p + 1)) : numPoints;
        const xy = new Float64Array((e - s) * 2);
        for (let i = 0; i < e - s; i++) { xy[2 * i] = buf.readDoubleLE(pointsAt + 16 * (s + i)); xy[2 * i + 1] = buf.readDoubleLE(pointsAt + 16 * (s + i) + 8); }
        parts[p] = xy;
      }
      yield { n, type, parts, box: [buf.readDoubleLE(4), buf.readDoubleLE(12), buf.readDoubleLE(20), buf.readDoubleLE(28)] };
    }
  } finally { fs.closeSync(fd); }
}

function readDbf(file, encoding) {
  const b = fs.readFileSync(file);
  const count = b.readUInt32LE(4), headLen = b.readUInt16LE(8), recLen = b.readUInt16LE(10);
  const fields = [];
  for (let p = 32; p < headLen && b[p] !== 0x0d; p += 32) {
    let name = b.toString("latin1", p, p + 11); name = name.slice(0, name.indexOf("\0") >= 0 ? name.indexOf("\0") : 11);
    fields.push({ name, type: String.fromCharCode(b[p + 11]), len: b[p + 16], dec: b[p + 17] });
  }
  const enc = encoding || "latin1";
  const rows = new Array(count);
  for (let r = 0; r < count; r++) {
    const base = headLen + r * recLen;
    const row = { _deleted: b[base] === 0x2a };
    let off = base + 1;
    for (const f of fields) {
      const raw = b.toString(enc, off, off + f.len).replace(/\0+$/, "").trim();
      off += f.len;
      if (f.type === "N" || f.type === "F") row[f.name] = raw === "" ? null : Number(raw);
      else if (f.type === "L") row[f.name] = /^[YyTt]$/.test(raw);
      else row[f.name] = raw;
    }
    rows[r] = row;
  }
  return { fields, rows };
}

module.exports = { readShp, readDbf };
