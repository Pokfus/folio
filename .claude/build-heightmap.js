// Dev-only: build heightmap.js (window.HEIGHTMAP) — a global elevation raster for the Atlas globe's terrain layer.
// Source: the AWS open "Terrain Tiles" terrarium dataset (key-free; the same data behind tangrams.github.io/heightmapper).
//   elevation(m) = (R*256 + G + B/256) - 32768, Web Mercator (EPSG:3857).
// Fetches z=Z tiles, decodes them (minimal built-in PNG codec — no deps), resamples Web-Mercator -> equirectangular,
// and writes a grayscale PNG data-URI: window.HEIGHTMAP = { w, h, lo, hi, png } where pixel 0..255 maps to [lo,hi] metres.
// Runtime decodes the PNG natively (Image -> canvas) — zero runtime deps, works from file://. Run: node .claude/build-heightmap.js
const fs = require("fs"), path = require("path"), zlib = require("zlib");
// Args: node build-heightmap.js [Z] [OUTW] [OUTH] [outFile] [varName]
// Defaults build the base level (z=5, 6144x3072 -> heightmap.js / window.HEIGHTMAP). For the deep-zoom "ultra" level:
//   node build-heightmap.js 6 10240 5120 heightmap-ultra.js HEIGHTMAP_ULTRA
const Z = +(process.argv[2] || 5);                       // 2^Z x 2^Z tiles; z=5 -> 1024 tiles (8192px merc), z=6 -> 4096 tiles (16384px)
const OUTW = +(process.argv[3] || 6144), OUTH = +(process.argv[4] || 3072);   // equirectangular output
const OUTFILE = process.argv[5] || "heightmap.js";
const VARNAME = process.argv[6] || "HEIGHTMAP";
const LO = -500, HI = 8848;           // metres mapped to pixel 0..255 (full land range incl. depressions; ocean clipped at render)
const URL = (z, x, y) => `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`;

// ---- minimal PNG decode (8-bit, non-interlaced; colour types 0/2/4/6) ----
function decodePNG(buf) {
  let p = 8, w = 0, h = 0, bitDepth = 0, colorType = 0, interlace = 0; const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), type = buf.toString("ascii", p + 4, p + 8), data = buf.slice(p + 8, p + 8 + len); p += 12 + len;
    if (type === "IHDR") { w = data.readUInt32BE(0); h = data.readUInt32BE(4); bitDepth = data[8]; colorType = data[9]; interlace = data[12]; }
    else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
  }
  if (bitDepth !== 8) throw new Error("bitDepth " + bitDepth + " unsupported");
  if (interlace) throw new Error("interlaced PNG unsupported");
  const channels = colorType === 2 ? 3 : colorType === 6 ? 4 : colorType === 0 ? 1 : colorType === 4 ? 2 : 0;
  if (!channels) throw new Error("colorType " + colorType + " unsupported");
  const raw = zlib.inflateSync(Buffer.concat(idat)), bpp = channels, stride = w * bpp, out = Buffer.alloc(h * stride);
  let rp = 0;
  for (let y = 0; y < h; y++) {
    const f = raw[rp++], ro = y * stride, po = (y - 1) * stride;
    for (let x = 0; x < stride; x++) {
      const rv = raw[rp++], a = x >= bpp ? out[ro + x - bpp] : 0, b = y > 0 ? out[po + x] : 0, c = (y > 0 && x >= bpp) ? out[po + x - bpp] : 0;
      let v;
      if (f === 0) v = rv; else if (f === 1) v = rv + a; else if (f === 2) v = rv + b; else if (f === 3) v = rv + ((a + b) >> 1);
      else if (f === 4) { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); v = rv + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c); }
      else throw new Error("filter " + f);
      out[ro + x] = v & 255;
    }
  }
  return { w, h, channels, pixels: out };
}

// ---- minimal grayscale PNG encode ----
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); t[n] = c >>> 0; } return t; })();
function crc32(buf) { let c = 0xFFFFFFFF; for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
function chunk(type, data) { const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0); const t = Buffer.from(type, "ascii"), crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0); return Buffer.concat([len, t, data, crc]); }
function encodeGray(w, h, gray) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]); const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 0;
  const raw = Buffer.alloc(h * (w + 1)); for (let y = 0; y < h; y++) { raw[y * (w + 1)] = 0; gray.copy(raw, y * (w + 1) + 1, y * w, y * w + w); }
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}

async function fetchTile(z, x, y, tries) {
  for (let a = 0; a < (tries || 4); a++) {
    try { const r = await fetch(URL(z, x, y)); if (r.ok) return Buffer.from(await r.arrayBuffer()); } catch (e) {}
    await new Promise((res) => setTimeout(res, 250 * (a + 1)));
  }
  return null;
}

(async () => {
  const N = 1 << Z, SIZE = 256 * N, tiles = Array.from({ length: N }, () => new Array(N));
  const jobs = []; for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) jobs.push([x, y]);
  let i = 0, ok = 0, fail = 0;
  console.log(`fetching ${jobs.length} terrarium tiles at z=${Z} ...`);
  async function worker() {
    while (i < jobs.length) {
      const [x, y] = jobs[i++], buf = await fetchTile(Z, x, y);
      if (!buf) { fail++; tiles[y][x] = null; continue; }
      try {
        const png = decodePNG(buf), ch = png.channels, el = new Int16Array(256 * 256);
        for (let k = 0; k < 256 * 256; k++) { const o = k * ch; el[k] = Math.round((png.pixels[o] * 256 + png.pixels[o + 1] + png.pixels[o + 2] / 256) - 32768); }
        tiles[y][x] = el; ok++;
      } catch (e) { fail++; tiles[y][x] = null; console.warn("decode fail", x, y, e.message); }
    }
  }
  await Promise.all(Array.from({ length: 16 }, () => worker()));
  console.log(`tiles: ${ok} ok, ${fail} failed`);
  if (ok < jobs.length * 0.8) throw new Error("too many tile failures — aborting");

  const elevAt = (gx, gy) => { gx = gx < 0 ? 0 : gx > SIZE - 1 ? SIZE - 1 : gx; gy = gy < 0 ? 0 : gy > SIZE - 1 ? SIZE - 1 : gy; const t = tiles[gy >> 8][gx >> 8]; return t ? t[(gy & 255) * 256 + (gx & 255)] : 0; };
  const gray = Buffer.alloc(OUTW * OUTH); let mn = 1e9, mx = -1e9;
  for (let oy = 0; oy < OUTH; oy++) {
    let lat = 90 - (oy + 0.5) / OUTH * 180; if (lat > 85.05) lat = 85.05; if (lat < -85.05) lat = -85.05;
    const ymerc = (1 - Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)) / Math.PI) / 2, gy = ymerc * SIZE;
    for (let ox = 0; ox < OUTW; ox++) {
      const lon = -180 + (ox + 0.5) / OUTW * 360, gx = (lon + 180) / 360 * SIZE;
      const x0 = Math.floor(gx - 0.5), y0 = Math.floor(gy - 0.5), fx = gx - 0.5 - x0, fy = gy - 0.5 - y0;
      const e = (elevAt(x0, y0) * (1 - fx) + elevAt(x0 + 1, y0) * fx) * (1 - fy) + (elevAt(x0, y0 + 1) * (1 - fx) + elevAt(x0 + 1, y0 + 1) * fx) * fy;
      if (e < mn) mn = e; if (e > mx) mx = e;
      let v = Math.round((e - LO) / (HI - LO) * 255); gray[oy * OUTW + ox] = v < 0 ? 0 : v > 255 ? 255 : v;
    }
  }
  const png = encodeGray(OUTW, OUTH, gray), b64 = png.toString("base64");
  const js = `/* Global heightmap for the Atlas globe terrain layer. AWS open Terrain Tiles (terrarium, z=${Z}), resampled to a\n   ${OUTW}x${OUTH} equirectangular grayscale PNG; pixel 0..255 maps linearly to elevation [${LO},${HI}] metres. The same\n   data behind tangrams.github.io/heightmapper. Built by .claude/build-heightmap.js — do not hand-edit. */\nwindow.${VARNAME} = { w: ${OUTW}, h: ${OUTH}, lo: ${LO}, hi: ${HI}, png: "data:image/png;base64,${b64}" };\n`;
  fs.writeFileSync(path.join(__dirname, "..", OUTFILE), js);
  console.log(`elevation range observed: ${mn | 0}..${mx | 0} m. wrote heightmap.js: ${(js.length / 1024) | 0} KB (png ${(png.length / 1024) | 0} KB).`);
})().catch((e) => { console.error("ERR", e.stack || e.message); process.exit(1); });
