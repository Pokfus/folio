#!/usr/bin/env node
/* check-relief.js — the gate for the relief pyramid (Phase 1b, docs/atlas-v2-design.md §2.7, §2.11).

     node .claude/atlas-build/check-relief.js                  structure only: zero-dependency, what CI runs
     node .claude/atlas-build/check-relief.js --source         …plus the round-trip against the ETOPO source
                                                               (needs `npm ci` here and src/etopo-2022-60s/)
     node .claude/atlas-build/check-relief.js --coast N        …plus N coastal points where the land partition
                                                               and ETOPO disagree, written to out/relief-coast.json
                                                               for the browser test of the stencil rule

   STRUCTURE (every run): relief.json parses and names its sources (§2.10a); every level's every tile has
   its three planes on disk and nothing is on disk the index omits; every PNG is an 8-bit greyscale of
   the stated size (IHDR read directly — no library) and carries the `folio` tEXt chunk with the same
   sources and its own geometry; the pyramid's total is within --max-bytes (the owner's 45 MB).

   ROUND-TRIP (--source): at 200 random texels of each level the height decoded from the planes
   (hi·256 + lo − 32768) is compared with the source: L2 (nearest) must match the source cell under
   the texel's centre EXACTLY, to the metre; L0 and L1 (box averages) must lie within the min and max
   of the source cells their footprint covers. The hillshade plane must be 180 (level ground) wherever
   the decoded height is below zero (the sea floor is flat by design) and never 0 on land.

   COAST (--coast N): with the z=4 land partition loaded (lib/landindex.js), walks random coast
   vertices and reports how often ETOPO's L1 height disagrees with the partition within 5 km of the
   shore — the mismatch §2.7's stencil rule exists for — and writes N land-but-negative and N
   sea-but-positive points for .claude/test-atlas-relief.js to render and read back.
*/
"use strict";
const fs = require("fs"), path = require("path"), zlib = require("zlib");

const HERE = __dirname;
const argv = process.argv.slice(2);
const flag = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const DIR = argv.find((a) => !a.startsWith("--") && !/^\d+$/.test(a) && argv[argv.indexOf(a) - 1] !== "--max-bytes" && argv[argv.indexOf(a) - 1] !== "--coast") || path.join(HERE, "..", "..", "atlas", "data", "relief");
const maxBytes = Number(flag("--max-bytes", 45 * 1024 * 1024));
const withSource = argv.includes("--source"), coastN = Number(flag("--coast", 0));

let pass = 0, fail = 0;
const ok = (m, d) => { pass++; console.log(`  \x1b[32mok\x1b[0m    ${m}${d ? "  \x1b[2m" + d + "\x1b[0m" : ""}`); };
const bad = (m, d) => { fail++; console.log(`  \x1b[31mFAIL\x1b[0m  ${m}${d ? "  \x1b[2m" + d + "\x1b[0m" : ""}`); };
const note = (m) => console.log(`        \x1b[2m${m}\x1b[0m`);

/* a PNG's IHDR and tEXt chunks, read directly */
function pngInfo(file) {
  const b = fs.readFileSync(file);
  if (b.toString("latin1", 1, 4) !== "PNG") throw new Error("not a PNG");
  const out = { bytes: b.length, text: {} };
  let p = 8;
  while (p + 8 <= b.length) {
    const len = b.readUInt32BE(p), type = b.toString("latin1", p + 4, p + 8);
    if (type === "IHDR") { out.width = b.readUInt32BE(p + 8); out.height = b.readUInt32BE(p + 12); out.bitDepth = b[p + 16]; out.colorType = b[p + 17]; }
    else if (type === "tEXt") { const d = b.subarray(p + 8, p + 8 + len); const z = d.indexOf(0); out.text[d.toString("latin1", 0, z)] = d.toString("latin1", z + 1); }
    else if (type === "IEND") break;
    p += 12 + len;
  }
  return out;
}
/* decode one 8-bit greyscale plane without a library: inflate, unfilter */
function decodeGrey(file) {
  const b = fs.readFileSync(file);
  let p = 8, w = 0, h = 0; const idat = [];
  while (p + 8 <= b.length) {
    const len = b.readUInt32BE(p), type = b.toString("latin1", p + 4, p + 8);
    if (type === "IHDR") { w = b.readUInt32BE(p + 8); h = b.readUInt32BE(p + 12); if (b[p + 16] !== 8 || b[p + 17] !== 0) throw new Error("not 8-bit greyscale"); }
    else if (type === "IDAT") idat.push(b.subarray(p + 8, p + 8 + len));
    else if (type === "IEND") break;
    p += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const out = new Uint8Array(w * h);
  let prev = new Uint8Array(w);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (w + 1)], row = raw.subarray(y * (w + 1) + 1, (y + 1) * (w + 1)), cur = new Uint8Array(w);
    for (let x = 0; x < w; x++) {
      const a = x ? cur[x - 1] : 0, bb = prev[x], c = x ? prev[x - 1] : 0; let v = row[x];
      if (f === 1) v += a; else if (f === 2) v += bb; else if (f === 3) v += (a + bb) >> 1; else if (f === 4) { const pp = a + bb - c, pa = Math.abs(pp - a), pb = Math.abs(pp - bb), pc = Math.abs(pp - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? bb : c; }
      cur[x] = v & 255;
    }
    out.set(cur, y * w); prev = cur;
  }
  return { w, h, data: out };
}

const index = JSON.parse(fs.readFileSync(path.join(DIR, "relief.json"), "utf8"));
console.log(`\ncheck-relief: ${path.relative(process.cwd(), DIR)}\n`);
{
  const REQ = ["id", "name", "version", "url", "licence", "licenceUrl", "attribution", "retrieved"];
  const missing = []; (index.sources || []).forEach((s) => REQ.forEach((k) => { if (!s[k]) missing.push(`${s.id || "?"}.${k}`); }));
  !index.sources || !index.sources.length ? bad("relief.json carries a sources block") : missing.length ? bad("every source is complete", missing.join(", ")) : ok("relief.json sources complete", index.sources.map((s) => `${s.id} (${s.licence})`).join(", "));
}
let total = 0, files = 0, largest = { bytes: 0 };
const onDisk = new Set();
(function walk(d, rel) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p, rel + f + "/"); else if (/\.png$/.test(f)) onDisk.add(rel + f); } })(DIR, "");
const expected = new Set();
for (const L of index.levels) {
  let badDim = 0, badText = 0, badSrc = 0, missing = 0;
  for (const t of L.tiles) for (const plane of ["hi", "lo", "sh"]) {
    const rel = `${t.base}.${plane}.png`; expected.add(rel);
    const file = path.join(DIR, rel);
    if (!fs.existsSync(file)) { missing++; continue; }
    const info = pngInfo(file); total += info.bytes; files++; if (info.bytes > largest.bytes) largest = { bytes: info.bytes, file: rel };
    const tw = L.tile || L.width, th = L.tile || L.height;
    if (info.width !== tw || info.height !== th || info.bitDepth !== 8 || info.colorType !== 0) badDim++;
    let meta = null; try { meta = JSON.parse(info.text.folio || "null"); } catch (e) {}
    if (!meta || meta.level !== L.level || meta.x !== t.x || meta.y !== t.y || meta.plane !== plane) badText++;
    else if (!meta.sources || meta.sources.length !== index.sources.length || meta.sources.some((s, i) => s.id !== index.sources[i].id)) badSrc++;
  }
  missing ? bad(`L${L.level}: every plane of every tile is on disk`, `${missing} missing`) : ok(`L${L.level}: every plane of every tile is on disk`, `${L.tiles.length} tiles × 3 planes, ${(L.bytes / 1048576).toFixed(2)} MB, ${L.kmPerTexel} km per texel`);
  badDim ? bad(`L${L.level}: every plane is an 8-bit greyscale PNG of the stated size`, `${badDim}`) : ok(`L${L.level}: every plane is an 8-bit greyscale PNG of the stated size`);
  badText || badSrc ? bad(`L${L.level}: every plane carries its folio header with the sources`, `${badText} without or wrong, ${badSrc} with other sources`) : ok(`L${L.level}: every plane carries its folio header with the sources`);
}
const extra = [...onDisk].filter((f) => !expected.has(f));
extra.length ? bad("nothing is on disk that the index omits", extra.slice(0, 5).join(", ")) : ok("nothing is on disk that the index omits", `${files} files`);
total > maxBytes ? bad(`pyramid within ${(maxBytes / 1048576).toFixed(0)} MB`, `${(total / 1048576).toFixed(2)} MB`) : ok(`pyramid within ${(maxBytes / 1048576).toFixed(0)} MB`, `${(total / 1048576).toFixed(2)} MB in ${files} files, largest ${largest.file} ${(largest.bytes / 1048576).toFixed(2)} MB`);

/* ---------- the round-trip against the source ---------- */
if (withSource) (async () => {
  const { fromFile } = require("geotiff");
  const { ensureSource } = require("./fetch-sources.js");
  const src = ensureSource("etopo-2022-60s");
  const tiff = await fromFile(path.join(src.dir, src.entry.files[0]));
  const img = await tiff.getImage(0);
  const SW = img.getWidth(), SH = img.getHeight();
  const cellAt = async (x, y) => (await img.readRasters({ window: [x, y, x + 1, y + 1], interleave: true }))[0];
  const boxAt = async (x0, y0, x1, y1) => Array.from(await img.readRasters({ window: [x0, y0, x1, y1], interleave: true }));
  let seed = 20261008; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const planes = new Map();
  const plane = (L, t, p) => { const k = `${t.base}.${p}`; if (!planes.has(k)) planes.set(k, decodeGrey(path.join(DIR, k + ".png"))); return planes.get(k); };
  for (const L of index.levels) {
    let exact = 0, within = 0, off = 0, seaShadeBad = 0, landShadeZero = 0; const sample = [];
    const N = 200;
    for (let i = 0; i < N; i++) {
      const X = Math.floor(rnd() * L.width), Y = Math.floor(rnd() * L.height);
      const tw = L.tile || L.width, th = L.tile || L.height;
      const t = L.tiles.find((tt) => tt.x === Math.floor(X / tw) && tt.y === Math.floor(Y / th));
      const lx = X - t.x * tw, ly = Y - t.y * th, o = ly * tw + lx;
      const hi = plane(L, t, "hi").data[o], lo = plane(L, t, "lo").data[o], sh = plane(L, t, "sh").data[o];
      const h = hi * 256 + lo - 32768;
      if (h < 0 && sh !== index.encoding.seaShade) seaShadeBad++;
      if (h >= 0 && sh === 0) landShadeZero++;
      if (L.method === "nearest") {
        const v = Math.round(await cellAt(Math.min(SW - 1, Math.floor((X + 0.5) * SW / L.width)), Math.min(SH - 1, Math.floor((Y + 0.5) * SH / L.height))));
        if (v === h) exact++; else { off++; if (sample.length < 5) sample.push(`(${X},${Y}) ${h} vs ${v}`); }
      } else {
        const fx = SW / L.width, fy = SH / L.height;
        const box = await boxAt(Math.floor(X * fx), Math.floor(Y * fy), Math.min(SW, Math.ceil((X + 1) * fx)), Math.min(SH, Math.ceil((Y + 1) * fy)));
        const mn = Math.floor(Math.min(...box)), mx = Math.ceil(Math.max(...box));
        if (h >= mn - 1 && h <= mx + 1) within++; else { off++; if (sample.length < 5) sample.push(`(${X},${Y}) ${h} not in ${mn}..${mx}`); }
      }
    }
    if (L.method === "nearest") off ? bad(`L${L.level}: ${N} random texels match the source cell exactly`, `${off} off — ${sample.join("; ")}`) : ok(`L${L.level}: ${N} random texels match the source cell exactly (to the metre)`);
    else off ? bad(`L${L.level}: ${N} random texels lie within their footprint's min–max`, `${off} off — ${sample.join("; ")}`) : ok(`L${L.level}: ${N} random texels lie within their footprint's min–max (box average)`);
    seaShadeBad ? bad(`L${L.level}: the hillshade is flat (${index.encoding.seaShade}) wherever the height is below zero`, `${seaShadeBad} of ${N}`) : ok(`L${L.level}: the hillshade is flat wherever the height is below zero`);
    landShadeZero ? bad(`L${L.level}: no land texel has a hillshade of 0`, `${landShadeZero}`) : ok(`L${L.level}: no sampled land texel is unlit (hillshade 0)`);
  }
  if (coastN) await coast();
  done();
})().catch((e) => { console.error(e); process.exit(1); });
else if (coastN) coast().then(done); else done();

/* ---------- where the partition and ETOPO disagree along the shore ---------- */
async function coast() {
  const LandIndex = require("./lib/landindex.js");
  const land = LandIndex.load(path.join(HERE, "..", "..", "atlas", "data"));
  const L1 = index.levels.find((l) => l.level === 1) || index.levels[index.levels.length - 1];
  const tw = L1.tile || L1.width, th = L1.tile || L1.height;
  const cache = new Map();
  const heightAt = (lon, lat) => {
    const X = Math.min(L1.width - 1, Math.floor((lon + 180) / 360 * L1.width)), Y = Math.min(L1.height - 1, Math.floor((90 - lat) / 180 * L1.height));
    const t = L1.tiles.find((tt) => tt.x === Math.floor(X / tw) && tt.y === Math.floor(Y / th));
    const k = t.base; if (!cache.has(k)) cache.set(k, { hi: decodeGrey(path.join(DIR, k + ".hi.png")).data, lo: decodeGrey(path.join(DIR, k + ".lo.png")).data });
    const c = cache.get(k), o = (Y - t.y * th) * tw + (X - t.x * tw);
    return c.hi[o] * 256 + c.lo[o] - 32768;
  };
  let seed = 7; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const Q = land.quantum;
  let n = 0, landNeg = 0, seaPos = 0, landOk = 0, seaOk = 0; const landBad = [], seaBad = [];
  // random coast vertices of random z=4 tiles, nudged 3 km inland and 3 km seaward by the local outward normal
  for (let i = 0; i < 4000; i++) {
    const t = land.tiles[Math.floor(rnd() * land.tiles.length)], T = t.T, nA = T.arcOffset.length - 1;
    const a = Math.floor(rnd() * nA); if (T.arcKind[a] !== 0) continue;
    const s = T.arcOffset[a], e = T.arcOffset[a + 1]; if (e - s < 3) continue;
    const j = s + 1 + Math.floor(rnd() * (e - s - 2));
    const lon = T.lon[j] * Q, lat = T.lat[j] * Q, cosLat = Math.max(0.05, Math.cos(lat * Math.PI / 180));
    // the coast is walked land-left: the left normal of the segment j-1 → j points inland. In metres: east = Δlon·cos φ, north = Δlat
    const ex = (T.lon[j] - T.lon[j - 1]) * cosLat, ny0 = T.lat[j] - T.lat[j - 1]; const len = Math.hypot(ex, ny0) || 1;
    const nE = -ny0 / len, nN = ex / len;   // the left normal, (east, north) components
    const km = 3, dLat = km / 111.2, dLon = km / (111.2 * cosLat);
    const inland = [lon + nE * dLon, lat + nN * dLat], seaward = [lon - nE * dLon, lat - nN * dLat];
    const li = land.isLand(Math.round(inland[0] / Q), Math.round(inland[1] / Q)), si = land.isLand(Math.round(seaward[0] / Q), Math.round(seaward[1] / Q));
    if (!li || si) continue;   // the normal did not land as expected (a narrow island, a bay): skip
    // and both points must be well clear of ANY coast, so the resident LOD 2 coast (500 m) agrees with the z=4 one about them
    if (land.nearestCoast(Math.round(inland[0] / Q), Math.round(inland[1] / Q), 2500) || land.nearestCoast(Math.round(seaward[0] / Q), Math.round(seaward[1] / Q), 2500)) continue;
    n++;
    const hl = heightAt(inland[0], inland[1]), hs = heightAt(seaward[0], seaward[1]);
    if (hl < 0) { landNeg++; if (landBad.length < coastN) landBad.push({ lon: +inland[0].toFixed(4), lat: +inland[1].toFixed(4), etopo: hl }); } else landOk++;
    if (hs >= 0) { seaPos++; if (seaBad.length < coastN) seaBad.push({ lon: +seaward[0].toFixed(4), lat: +seaward[1].toFixed(4), etopo: hs }); } else seaOk++;
  }
  note(`coast sample (${n} points 3 km inland and 3 km seaward of random OSM coast vertices, ETOPO L1): land points ETOPO puts below sea level ${landNeg} (${(100 * landNeg / n).toFixed(1)} %), sea points it puts above ${seaPos} (${(100 * seaPos / n).toFixed(1)} %)`);
  const out = path.join(HERE, "out", "relief-coast.json");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify({ sampled: n, landBelowZero: landNeg, seaAboveZero: seaPos, landButNegative: landBad, seaButPositive: seaBad }, null, 1));
  ok(`coast disagreement measured and ${landBad.length} + ${seaBad.length} points written`, path.relative(process.cwd(), out));
}
function done() { console.log(`\n${pass} ok, ${fail} failed\n`); process.exit(fail ? 1 : 0); }
