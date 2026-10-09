#!/usr/bin/env node
/* build-relief.js — step 7 of the Atlas v2 build: ETOPO 2022 → the relief pyramid (docs/atlas-v2-design.md §2.7).

     node --max-old-space-size=12000 build-relief.js            → out/relief/{L0.{hi,lo,sh}.png, L1/<x>-<y>.{hi,lo,sh}.png, relief.json}
     node … build-relief.js --install                           …and copy them into atlas/data/relief/
     node … build-relief.js --levels 0,1,2                      also L2 (measured 2026-10-08 at 58 MB on its own — over the
                                                                45 MB budget for the whole pyramid, so it is built on request only)

   THE SOURCE is the 60 arc-second ETOPO 2022 surface grid (21600 × 10800, Float32 metres, WGS 84 +
   EGM2008 height; sources.json `etopo-2022-60s`), about 1.85 km per cell at the equator. The owner's
   decision of 2026-10-08 is that this file alone feeds every level: L0 4096 × 2048, L1 8192 × 4096
   and L2 16384 × 8192 (2.4 km per texel) — the 15 arc-second grid is not fetched, so relief is a
   regional-scale wash and not terrain detail at street zoom.

   EACH TEXEL IS THREE 8-BIT PLANES, one greyscale PNG each: `.hi` and `.lo` are the high and low bytes
   of height + 32768 in metres (16 bits, so a hypsometric ramp has no terraces); `.sh` is the hillshade
   (north-west light, azimuth 315°, altitude 45°, Horn's 3 × 3 slope on the level's own grid with the
   cell size corrected for latitude: dx = R·Δλ·cos φ, dy = R·Δφ, so a slope at 60° N is not twice as
   steep as the same slope at the equator), FLAT over the sea floor (a constant 180, the shade of level
   ground): bathymetry is a depth tint (Q-V2 a), not a shaded surface, and the sea floor's noise was a
   third of the file. WHY THREE FILES AND NOT ONE RGB (§2.7's first wording): measured on the L2
   Himalaya tile, 2026-10-08 — R = shade, G·B = height in one RGB PNG is 5.9 MB; the same bytes as
   three greyscale PNGs are 0.22 + 1.19 + 0.31 = 1.7 MB, because DEFLATE cannot predict across
   three interleaved planes with different statistics (a 16-bit greyscale PNG of the height is 2.0 MB
   but browsers decode it to 8 bits). Every phone decodes an 8-bit greyscale PNG natively, so the
   renderer composes the three bitmaps into one RGB texture and samples it with four taps.

   RESAMPLING. L2 is NEAREST: the texel takes the source cell under its centre, so a reader can prove
   every L2 height against the source exactly (check-relief.js does, at 200 random points). L1 and L0
   are BOX AVERAGES of the source cells each texel covers (separable, fractional weights at the edges),
   because decimating a 1.85 km grid 5 × by picking one cell in five aliases coastlines and ridges;
   the checker proves an averaged texel lies within the min–max of its footprint.

   TILES are 2048 × 2048 (every phone GPU takes a 2048² texture): L1 is 4 × 2 tiles, L2 8 × 4; L0 is
   one 4096 × 2048 file. Every PNG carries a `folio` tEXt chunk with the sources block (§2.10a) and the
   level's geometry, and relief.json beside them indexes the pyramid for the renderer and the checker.
   The PNG size is measured, not estimated — §2.7's "~1 MB a tile" is what this script tests.
*/
"use strict";
const fs = require("fs"), path = require("path"), zlib = require("zlib");
const { PNG } = require("pngjs");
const { ensureSource, headerSources } = require("./fetch-sources.js");

const HERE = __dirname, OUT = path.join(HERE, "out", "relief");
const SITE = path.join(HERE, "..", "..", "atlas", "data", "relief");
const argv = process.argv.slice(2);
const install = argv.includes("--install");
const levelsArg = (() => { const i = argv.indexOf("--levels"); return i >= 0 ? argv[i + 1].split(",").map(Number) : [0, 1]; })();
const t0 = Date.now();
const say = (m) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${m}`);

const LEVELS = [
  { level: 0, w: 4096, h: 2048, tile: 0, method: "box" },
  { level: 1, w: 8192, h: 4096, tile: 2048, method: "box" },
  { level: 2, w: 16384, h: 8192, tile: 2048, method: "nearest" },
].filter((L) => levelsArg.includes(L.level));
const SEA_SHADE = 180;   // the hillshade of level ground: sin 45° · 255
const OFFSET = 32768;   // height + OFFSET → 16 bits in G, B
const R_EARTH = 6371008.8, D2R = Math.PI / 180;
const AZIMUTH = 315, ALTITUDE = 45;

/* ---------- PNG text chunk (pngjs writes none) ---------- */
const CRC_T = (() => { const t = new Int32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c; } return t; })();
const CRC = (buf) => { let c = -1; for (let i = 0; i < buf.length; i++) c = CRC_T[(c ^ buf[i]) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
function withText(png, keyword, text) {
  // insert a tEXt chunk right after IHDR (the first chunk, 8 + 25 bytes in); tEXt is Latin-1, so every
  // character beyond it is written as a JSON \u escape (the attribution has an em dash and a degree sign)
  text = text.replace(/[^\x20-\x7e]/g, (c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0"));
  const data = Buffer.concat([Buffer.from(keyword, "latin1"), Buffer.from([0]), Buffer.from(text, "latin1")]);
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const typeAndData = Buffer.concat([Buffer.from("tEXt", "latin1"), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(CRC(typeAndData));
  const chunk = Buffer.concat([len, typeAndData, crc]);
  const at = 8 + 4 + 4 + 13 + 4;
  return Buffer.concat([png.subarray(0, at), chunk, png.subarray(at)]);
}

/* ---------- the source ---------- */
async function main() {
  const { fromFile } = require("geotiff");
  const src = ensureSource("etopo-2022-60s");
  const file = path.join(src.dir, src.entry.files[0]);
  const tiff = await fromFile(file);
  const img = await tiff.getImage(0);
  const SW = img.getWidth(), SH = img.getHeight();
  if (SW !== 21600 || SH !== 10800) throw new Error(`unexpected grid ${SW}×${SH}`);
  const nodata = img.getGDALNoData();
  say(`source ${SW}×${SH} Float32, nodata ${nodata}, ${src.entry.id} ${src.sha256.slice(0, 12)}…`);

  // per level: height grid (Int16) and the resampling tables
  for (const L of LEVELS) {
    L.height = new Int16Array(L.w * L.h);
    if (L.method === "box") {
      // fractional column weights: target column c covers source [c·SW/w, (c+1)·SW/w)
      L.colW = []; const fx = SW / L.w;
      for (let c = 0; c < L.w; c++) { const a = c * fx, b = (c + 1) * fx; const list = []; for (let s = Math.floor(a); s < Math.ceil(b); s++) { const w = Math.min(b, s + 1) - Math.max(a, s); if (w > 1e-9) list.push([s, w / fx]); } L.colW.push(list); }
      L.rowF = SH / L.h;
      L.acc = new Float64Array(L.w); L.accRow = 0; L.accW = 0;   // the target row being accumulated
      L.line = new Float32Array(L.w);
    } else {
      L.colS = new Int32Array(L.w); for (let c = 0; c < L.w; c++) L.colS[c] = Math.min(SW - 1, Math.floor((c + 0.5) * SW / L.w));
      L.rowS = new Int32Array(L.h); for (let r = 0; r < L.h; r++) L.rowS[r] = Math.min(SH - 1, Math.floor((r + 0.5) * SH / L.h));
      L.nextRow = 0;
    }
  }
  let hmin = Infinity, hmax = -Infinity, nodataCount = 0;
  const BAND = 256;
  for (let y0 = 0; y0 < SH; y0 += BAND) {
    const y1 = Math.min(SH, y0 + BAND);
    const band = await img.readRasters({ window: [0, y0, SW, y1], interleave: true });
    for (let y = y0; y < y1; y++) {
      const row = band.subarray((y - y0) * SW, (y - y0 + 1) * SW);
      for (let x = 0; x < SW; x++) { const v = row[x]; if (v === nodata || !Number.isFinite(v)) { nodataCount++; row[x] = 0; } else { if (v < hmin) hmin = v; if (v > hmax) hmax = v; } }
      for (const L of LEVELS) {
        if (L.method === "nearest") {
          while (L.nextRow < L.h && L.rowS[L.nextRow] === y) { const o = L.nextRow * L.w; for (let c = 0; c < L.w; c++) L.height[o + c] = Math.round(row[L.colS[c]]); L.nextRow++; }
          continue;
        }
        // horizontal box resample of this source row
        const line = L.line;
        for (let c = 0; c < L.w; c++) { let s = 0; for (const [sc, w] of L.colW[c]) s += row[sc] * w; line[c] = s; }
        // vertical: this source row's weight into the target rows it overlaps
        const a = y / L.rowF, b = (y + 1) / L.rowF;
        for (let r = Math.floor(a); r < Math.ceil(b) && r < L.h; r++) {
          const frac = Math.min(b, r + 1) - Math.max(a, r);   // in target-row units: Σ over the source rows of a target row = 1
          if (frac <= 1e-9) continue;
          if (r !== L.accRow) { flush(L); L.accRow = r; }
          const acc = L.acc; for (let c = 0; c < L.w; c++) acc[c] += line[c] * frac; L.accW += frac;
        }
      }
    }
    if ((y0 / BAND) % 8 === 0) say(`rows ${y1} / ${SH}`);
  }
  for (const L of LEVELS) if (L.method === "box") flush(L);
  function flush(L) { if (L.accW <= 0) return; const o = L.accRow * L.w, acc = L.acc; for (let c = 0; c < L.w; c++) { L.height[o + c] = Math.round(acc[c] / L.accW); acc[c] = 0; } L.accW = 0; }
  say(`heights ${hmin.toFixed(0)}…${hmax.toFixed(0)} m, ${nodataCount} nodata cells`);
  for (const L of LEVELS) if (L.method === "nearest" && L.nextRow !== L.h) throw new Error(`L${L.level}: ${L.nextRow} of ${L.h} rows sampled`);

  /* ---------- hillshade per level, then the PNGs ---------- */
  const sources = headerSources(["etopo-2022-60s"]);
  const generated = new Date().toISOString();
  const index = { format: 1, generated, generator: "folio atlas-build: build-relief.js (" + require("./package.json").version + ")", sources, encoding: { planes: "three 8-bit greyscale PNGs per tile: <base>.hi.png, <base>.lo.png (height + 32768 = hi·256 + lo, metres), <base>.sh.png (hillshade 0–255, azimuth 315°, altitude 45°, 180 = level ground, flat over the sea floor)", offset: OFFSET, seaShade: SEA_SHADE }, light: { azimuth: AZIMUTH, altitude: ALTITUDE }, source: { width: SW, height: SH, arcseconds: 60 }, levels: [] };
  fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
  let totalBytes = 0, files = 0, largest = { bytes: 0 };
  for (const L of LEVELS) {
    const t1 = Date.now();
    const shade = hillshade(L.height, L.w, L.h);
    say(`L${L.level}: hillshade in ${Date.now() - t1} ms`);
    const tiles = [];
    const tw = L.tile || L.w, th = L.tile || L.h, cols = L.w / tw, rows = L.h / th;
    for (let ty = 0; ty < rows; ty++) for (let tx = 0; tx < cols; tx++) {
      const planes = { hi: new Uint8Array(tw * th), lo: new Uint8Array(tw * th), sh: new Uint8Array(tw * th) };
      for (let y = 0; y < th; y++) { const sy = ty * th + y; for (let x = 0; x < tw; x++) { const sx = tx * tw + x, i = sy * L.w + sx, o = y * tw + x; const hv = L.height[i] + OFFSET; planes.hi[o] = (hv >> 8) & 255; planes.lo[o] = hv & 255; planes.sh[o] = L.height[i] < 0 ? SEA_SHADE : shade[i]; } }
      const base = L.tile ? path.join(`L${L.level}`, `${tx}-${ty}`) : `L${L.level}`;
      const meta = { level: L.level, x: tx, y: ty, cols, rows, width: tw, height: th, lon0: -180 + 360 * tx / cols, lon1: -180 + 360 * (tx + 1) / cols, lat0: 90 - 180 * (ty + 1) / rows, lat1: 90 - 180 * ty / rows, method: L.method, kmPerTexel: Math.round(2 * Math.PI * R_EARTH / L.w / 10) / 100, generated, sources, encoding: index.encoding, light: index.light };
      const t = { x: tx, y: ty, base: base.split(path.sep).join("/"), bytes: {} };
      fs.mkdirSync(path.dirname(path.join(OUT, base)), { recursive: true });
      for (const plane of ["hi", "lo", "sh"]) {
        // pngjs packs from `data` laid out as `inputColorType` says: 0 = one grey byte per pixel. (Its default is
        // RGBA, and a one-byte plane handed to that default fills a quarter of the image and leaves the rest zero —
        // the first build did exactly that, and the round-trip below is what caught it.)
        const png = new PNG({ width: tw, height: th, colorType: 0, bitDepth: 8, inputColorType: 0, inputHasAlpha: false });
        png.data = Buffer.from(planes[plane].buffer);
        let bytes = PNG.sync.write(png, { colorType: 0, bitDepth: 8, inputColorType: 0, inputHasAlpha: false, deflateLevel: 9, filterType: -1 });
        if (tx === 0 && ty === 0) {   // one plane per level is read back whole and compared byte for byte
          const back = PNG.sync.read(bytes); let bad = 0;
          for (let i = 0; i < tw * th; i++) if (back.data[4 * i] !== planes[plane][i]) bad++;
          if (bad) throw new Error(`L${L.level} ${plane}: ${bad} pixels differ after a PNG round-trip`);
        }
        bytes = withText(bytes, "folio", JSON.stringify(Object.assign({ plane }, meta)));
        const rel = `${base}.${plane}.png`;
        fs.writeFileSync(path.join(OUT, rel), bytes);
        totalBytes += bytes.length; files++; if (bytes.length > largest.bytes) largest = { bytes: bytes.length, file: rel };
        t.bytes[plane] = bytes.length;
      }
      t.total = t.bytes.hi + t.bytes.lo + t.bytes.sh;
      tiles.push(t);
    }
    const lb = tiles.reduce((s, t) => s + t.total, 0);
    index.levels.push({ level: L.level, width: L.w, height: L.h, tile: L.tile || null, cols, rows, method: L.method, kmPerTexel: Math.round(2 * Math.PI * R_EARTH / L.w / 10) / 100, bytes: lb, files: tiles.length * 3, largestTile: Math.max(...tiles.map((t) => t.total)), tiles: tiles.map((t) => ({ x: t.x, y: t.y, base: t.base, bytes: t.bytes, total: t.total })) });
    say(`L${L.level}: ${tiles.length} tile(s) × 3 planes, ${(lb / 1048576).toFixed(2)} MB, largest tile ${(Math.max(...tiles.map((t) => t.total)) / 1048576).toFixed(2)} MB`);
    L.height = null; // free
  }
  index.totalBytes = totalBytes; index.files = files + 1; index.largest = largest;
  fs.writeFileSync(path.join(OUT, "relief.json"), JSON.stringify(index, null, 1));
  say(`relief: ${files} PNGs + relief.json, ${(totalBytes / 1048576).toFixed(2)} MB in all, largest file ${largest.file} ${(largest.bytes / 1048576).toFixed(2)} MB`);
  if (install) {
    fs.rmSync(SITE, { recursive: true, force: true });
    fs.cpSync(OUT, SITE, { recursive: true });
    say(`installed into atlas/data/relief/`);
    require("./build-credits.js").build({ install: true });   // the credits page follows every install (Phase 1d)
  }
}

/* Horn's hillshade on an equirectangular grid that wraps in x and clamps in y; the cell size in metres
   depends on the row's latitude. With p = ∂z/∂x (east), q = ∂z/∂y (north), the upward surface normal is
   (−p, −q, 1)/√(1+p²+q²) and the light from azimuth A (clockwise from north) at altitude h is
   (sin A cos h, cos A cos h, sin h); the shade is their dot product, clamped at 0. Returns Uint8 0–255. */
function hillshade(h, w, hh) {
  const out = new Uint8Array(w * hh);
  const A = AZIMUTH * D2R, alt = ALTITUDE * D2R;
  const lx = Math.sin(A) * Math.cos(alt), ly = Math.cos(A) * Math.cos(alt), lz = Math.sin(alt);
  const dlat = Math.PI / hh, dlon = 2 * Math.PI / w;
  for (let y = 0; y < hh; y++) {
    const lat = (90 - (y + 0.5) * 180 / hh) * D2R;
    const dy = R_EARTH * dlat, dx = Math.max(1, R_EARTH * dlon * Math.cos(lat));
    const yu = Math.max(0, y - 1), yd = Math.min(hh - 1, y + 1);   // yu is the row to the NORTH
    for (let x = 0; x < w; x++) {
      const xl = (x + w - 1) % w, xr = (x + 1) % w;
      const a = h[yu * w + xl], b = h[yu * w + x], c = h[yu * w + xr];
      const d = h[y * w + xl], f = h[y * w + xr];
      const g = h[yd * w + xl], k = h[yd * w + x], i = h[yd * w + xr];
      const p = ((c + 2 * f + i) - (a + 2 * d + g)) / (8 * dx);   // rises eastward
      const q = ((a + 2 * b + c) - (g + 2 * k + i)) / (8 * dy);   // rises northward
      let v = (-p * lx - q * ly + lz) / Math.sqrt(1 + p * p + q * q);
      if (v < 0) v = 0;
      out[y * w + x] = Math.round(v * 255);
    }
  }
  return out;
}

main().catch((e) => { console.error(e); process.exit(1); });
