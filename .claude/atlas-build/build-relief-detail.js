#!/usr/bin/env node
/* build-relief-detail.js — the relief's DETAIL level (2026-10-25): ETOPO 2022 15 arc-second → a hillshade per 2.5° tile.

     NODE_PATH=<dir with sharp> node --max-old-space-size=4000 build-relief-detail.js            → out/relief-detail/
     NODE_PATH=…                node … build-relief-detail.js --install                           …and copy it into atlas/data/relief-detail/
     NODE_PATH=…                node … build-relief-detail.js --only N45E000                     one source tile (a trial; never installed)

   WHY (the owner, 2026-10-25: "when zoomed in, the relief map very quickly becomes blurry and undetailed"). The pyramid of
   build-relief.js stops at L1, 4.9 km a texel, and is drawn to the zoom cap at 0.15 km/px — thirty times magnified. Its
   L2 (2.4 km, 118.7 MB) was refused on size in Phase 1b. This level takes another road: the TINT of the relief (the
   hypsometric ramp) changes slowly and stays with L0/L1's 16-bit heights; only the HILLSHADE, where the detail lives, is
   carried at 15 arc-seconds (about 460 m a texel, ten times L1). One 8-bit plane, lossy JPEG (greyscale, mozjpeg, quality
   80 — indistinguishable from the PNG at three times magnification, measured on the Pyrenees, and a tenth of its size).

   THE SOURCE is the 15 arc-second ETOPO 2022 surface grid: 288 GeoTIFFs of 15° × 15° (3600² Float32 metres each), pinned
   file by file as the fileset `etopo-2022-15s` in sources.json — the same model, publisher and CC0 licence as the 60 arc-
   second grid L0/L1 come from.

   EACH TILE is 600 × 600 texels = 2.5° × 2.5°, named `<x>-<y>.jpg` on a 144 × 72 grid whose rows count from the SOUTH
   (row 0 at 90° S, column 0 at 180° W) — the convention of atlas.js `cellsFor`, so the renderer asks for a key with no
   translation. Image rows run north to south. The hillshade is build-relief.js's own (Horn's 3 × 3 slope on the grid with
   the cell size corrected for latitude, light from azimuth 315° at 45°, level ground = 180), computed over each source
   tile with a one-texel border read from its eight neighbours, so no seam shows at a 15° edge; FLAT (180) wherever the
   height is below zero, as L0/L1 are. A tile is written only when one of its texels is at or above sea level: the sea has
   no detail level (its depth tint stays L0/L1's), so about two thirds of the grid is never a file.

   detail.json beside the tiles carries the sources block (§2.10a; the #credits page reads it) and the list of tiles. */
"use strict";
const fs = require("fs"), path = require("path");
const { ensureSource, headerSources } = require("./fetch-sources.js");

const HERE = __dirname, OUT = path.join(HERE, "out", "relief-detail");
const SITE = path.join(HERE, "..", "..", "atlas", "data", "relief-detail");
const argv = process.argv.slice(2);
const install = argv.includes("--install");
const only = (() => { const i = argv.indexOf("--only"); return i >= 0 ? argv[i + 1] : null; })();
const t0 = Date.now();
const say = (m) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${m}`);

const N = 3600, SRC_DEG = 15, RES = SRC_DEG / N;       // a source tile: 3600² texels of 15″
const TILE = 600, TILE_DEG = TILE * RES;                // an output tile: 600² texels = 2.5°
const COLS = 360 / TILE_DEG, ROWS = 180 / TILE_DEG;     // 144 × 72
const QUALITY = 80;
const SEA_SHADE = 180, AZIMUTH = 315, ALTITUDE = 45;
const R_EARTH = 6371008.8, D2R = Math.PI / 180;

const nameOf = (latN, lonW) => `ETOPO_2022_v1_15s_${latN >= 0 ? "N" : "S"}${String(Math.abs(latN)).padStart(2, "0")}${lonW >= 0 ? "E" : "W"}${String(Math.abs(lonW)).padStart(3, "0")}_surface.tif`;

async function main() {
  const sharp = require("sharp");   // offline only: reached through NODE_PATH, never in the site (CLAUDE.md)
  const { fromFile } = require("geotiff");
  const src = ensureSource("etopo-2022-15s");
  const names = new Set(src.entry.fileset.map((f) => f.name));
  // an LRU of open GeoTIFFs: a tile reads its own raster and a one-texel border from each of its eight neighbours
  const open = new Map();
  async function image(latN, lonW) {
    lonW = ((lonW + 180) % 360 + 360) % 360 - 180;
    const name = nameOf(latN, lonW);
    if (!names.has(name)) return null;
    if (open.has(name)) { const v = open.get(name); open.delete(name); open.set(name, v); return v; }
    const im = await (await fromFile(path.join(src.dir, name))).getImage();
    if (im.getWidth() !== N || im.getHeight() !== N) throw new Error(`${name}: ${im.getWidth()}×${im.getHeight()}, expected ${N}²`);
    const [x0, , , y1] = im.getBoundingBox();
    if (Math.round(x0) !== lonW || Math.round(y1) !== latN) throw new Error(`${name}: bounds ${im.getBoundingBox()} do not match its name`);
    const v = { im, nodata: im.getGDALNoData() };
    open.set(name, v); while (open.size > 16) open.delete(open.keys().next().value);
    return v;
  }
  async function read(latN, lonW, win) {   // win = [x0, y0, x1, y1] in the tile's texels; null when there is no such tile
    const t = await image(latN, lonW); if (!t) return null;
    const r = await t.im.readRasters({ window: win, interleave: true });
    for (let i = 0; i < r.length; i++) if (r[i] === t.nodata || !Number.isFinite(r[i])) r[i] = 0;
    return r;
  }

  const sources = headerSources(["etopo-2022-15s"]);
  const generated = new Date().toISOString();
  fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
  const tiles = []; let bytes = 0, largest = { bytes: 0 }, flatOnly = 0;
  const P = N + 2, pad = new Float32Array(P * P), shade = new Uint8Array(N * N);
  const A = AZIMUTH * D2R, alt = ALTITUDE * D2R;
  const lx = Math.sin(A) * Math.cos(alt), ly = Math.cos(A) * Math.cos(alt), lz = Math.sin(alt);
  const dyM = R_EARTH * RES * D2R;
  const buf = Buffer.alloc(TILE * TILE);
  for (let latN = 90; latN > -90; latN -= SRC_DEG) for (let lonW = -180; lonW < 180; lonW += SRC_DEG) {
    if (only && !nameOf(latN, lonW).includes("_" + only + "_")) continue;
    const centre = await read(latN, lonW, [0, 0, N, N]);
    if (!centre) throw new Error(`${nameOf(latN, lonW)} is not in the fileset`);
    // the padded grid: the tile in the middle, a one-texel border from the neighbours (longitude wraps; at a pole the edge row repeats)
    for (let y = 0; y < N; y++) pad.set(centre.subarray(y * N, (y + 1) * N), (y + 1) * P + 1);
    const north = latN < 90 ? await read(latN + SRC_DEG, lonW, [0, N - 1, N, N]) : null;
    const south = latN - SRC_DEG > -90 ? await read(latN - SRC_DEG, lonW, [0, 0, N, 1]) : null;
    const west = await read(latN, lonW - SRC_DEG, [N - 1, 0, N, N]), east = await read(latN, lonW + SRC_DEG, [0, 0, 1, N]);
    for (let x = 0; x < N; x++) { pad[x + 1] = north ? north[x] : centre[x]; pad[(P - 1) * P + x + 1] = south ? south[x] : centre[(N - 1) * N + x]; }
    for (let y = 0; y < N; y++) { pad[(y + 1) * P] = west[y]; pad[(y + 1) * P + P - 1] = east[y]; }
    const corner = async (dLat, dLon, x, y, fallback) => { const r = (dLat > 0 ? latN < 90 : latN - SRC_DEG > -90) ? await read(latN + dLat, lonW + dLon, [x, y, x + 1, y + 1]) : null; return r ? r[0] : fallback; };
    pad[0] = await corner(SRC_DEG, -SRC_DEG, N - 1, N - 1, pad[1]);
    pad[P - 1] = await corner(SRC_DEG, SRC_DEG, 0, N - 1, pad[P - 2]);
    pad[(P - 1) * P] = await corner(-SRC_DEG, -SRC_DEG, N - 1, 0, pad[(P - 1) * P + 1]);
    pad[P * P - 1] = await corner(-SRC_DEG, SRC_DEG, 0, 0, pad[P * P - 2]);
    // Horn's hillshade, the formula of build-relief.js: p rises eastward, q northward; flat over the sea floor
    for (let y = 0; y < N; y++) {
      const lat = (latN - (y + 0.5) * RES) * D2R, dx = Math.max(1, dyM * Math.cos(lat));
      const ru = y * P, rc = (y + 1) * P, rd = (y + 2) * P;
      for (let x = 0; x < N; x++) {
        const h = pad[rc + x + 1];
        if (h < 0) { shade[y * N + x] = SEA_SHADE; continue; }
        const a = pad[ru + x], b = pad[ru + x + 1], c = pad[ru + x + 2], d = pad[rc + x], f = pad[rc + x + 2], g = pad[rd + x], k = pad[rd + x + 1], i = pad[rd + x + 2];
        const p = ((c + 2 * f + i) - (a + 2 * d + g)) / (8 * dx), q = ((a + 2 * b + c) - (g + 2 * k + i)) / (8 * dyM);
        let v = (-p * lx - q * ly + lz) / Math.sqrt(1 + p * p + q * q); if (v < 0) v = 0;
        shade[y * N + x] = Math.round(v * 255);
      }
    }
    // the 6 × 6 output tiles of this source tile, each only if a texel of it is at or above sea level
    for (let ty = 0; ty < N / TILE; ty++) for (let tx = 0; tx < N / TILE; tx++) {
      let land = false;
      for (let y = 0; y < TILE && !land; y++) { const o = (ty * TILE + y) * N + tx * TILE; for (let x = 0; x < TILE; x++) if (centre[o + x] >= 0) { land = true; break; } }
      if (!land) continue;
      let flat = true;
      for (let y = 0; y < TILE; y++) { const o = (ty * TILE + y) * N + tx * TILE; for (let x = 0; x < TILE; x++) { const v = shade[o + x]; buf[y * TILE + x] = v; if (v !== SEA_SHADE) flat = false; } }
      if (flat) flatOnly++;
      const gx = Math.round((lonW + 180) / TILE_DEG) + tx, gy = ROWS - 1 - (Math.round((90 - latN) / TILE_DEG) + ty);   // rows from the south
      const key = gx + "-" + gy;
      const jpg = await sharp(buf, { raw: { width: TILE, height: TILE, channels: 1 } }).toColourspace("b-w").jpeg({ quality: QUALITY, mozjpeg: true }).toBuffer();
      fs.writeFileSync(path.join(OUT, key + ".jpg"), jpg);
      tiles.push(key); bytes += jpg.length; if (jpg.length > largest.bytes) largest = { bytes: jpg.length, file: key + ".jpg" };
    }
    say(`${nameOf(latN, lonW)}: ${tiles.length} tiles so far, ${(bytes / 1048576).toFixed(1)} MB`);
  }
  tiles.sort((a, b) => { const [ax, ay] = a.split("-").map(Number), [bx, by] = b.split("-").map(Number); return ay - by || ax - bx; });
  const index = {
    format: 1, generated, generator: "folio atlas-build: build-relief-detail.js (" + require("./package.json").version + ")", sources,
    encoding: { plane: "one 8-bit greyscale JPEG per tile (quality " + QUALITY + ", mozjpeg): the hillshade 0–255, azimuth " + AZIMUTH + "°, altitude " + ALTITUDE + "°, " + SEA_SHADE + " = level ground, flat wherever the height is below zero; image rows run north to south", seaShade: SEA_SHADE },
    light: { azimuth: AZIMUTH, altitude: ALTITUDE },
    source: { arcseconds: 15, tile: N, tileDegrees: SRC_DEG },
    grid: { cols: COLS, rows: ROWS, size: TILE, degrees: TILE_DEG, rowsFrom: "south", kmPerTexel: Math.round(2 * Math.PI * R_EARTH / (COLS * TILE) / 10) / 100 },
    count: tiles.length, flatOnly, bytes, largest, tiles,
  };
  fs.writeFileSync(path.join(OUT, "detail.json"), JSON.stringify(index));
  say(`relief detail: ${tiles.length} tiles (${flatOnly} flat), ${(bytes / 1048576).toFixed(2)} MB, largest ${largest.file} ${(largest.bytes / 1024).toFixed(0)} KB`);
  if (install) {
    if (only) throw new Error("--only is a trial and is never installed");
    fs.rmSync(SITE, { recursive: true, force: true });
    fs.cpSync(OUT, SITE, { recursive: true });
    say("installed into atlas/data/relief-detail/");
    require("./build-credits.js").build({ install: true });
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
