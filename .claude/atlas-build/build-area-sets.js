#!/usr/bin/env node
/* build-area-sets.js — a card window's SET OF AREAS, shaded in two tints (2026-11-20, on request for us-084: "an atlas window
   depicting the areas of all current Indian reservations and a second shade for former Indian reservations").

     node .claude/atlas-build/build-area-sets.js [--install] [--dry] [--check]     (from the repo root)

   WHAT IT WRITES: atlas/data/us-reservations.js — `window.ATLAS_AREA_SETS["us-reservations"]`, two PARTS of plain lon/lat rings that
   a members window (app.js cardMembers `areas`, atlas-windows.js `areaSet`) paints on its own canvas, cut by the engine's land mask, the
   way it paints a locator's authored area. No engine primitive, no history entity, nothing conflated onto the core: the rings are drawn,
   not tapped, and a window is their only reader. Lazy: the bundle `area:us-reservations` (app.js DATA_BUNDLES), fetched by the window.

   THE SOURCE (pinned in sources.json: `census-cb-2023-aiannh`, US federal, public domain): the Census Bureau's 2023 cartographic boundary
   file of American Indian / Alaska Native / Native Hawaiian areas, 1:500,000. Its MTFCC classes, as the Census Bureau defines them:
     · part "current" — G2100 (federally and state-recognised American Indian reservations and off-reservation trust land; the cartographic
       file merges a reservation with its trust land into one shape) and the LEGAL joint-use areas of reservations (G2170 with LSAD 83).
     · part "former"  — G2140, the Oklahoma tribal statistical areas, and the OTSA joint-use areas (G2170 with LSAD 90). The Census
       glossary: "The boundary of an OTSA is intended to be that of the former reservation in Oklahoma, except where modified by
       agreements with neighboring tribes only for statistical data presentation purposes." Census areas never overlap, so the two parts
       do not either. THIS IS THE ONLY FORMER-RESERVATION OUTLINE AN OPEN SOURCE DRAWS: the former reservations elsewhere (the Great Sioux
       Reservation's ceded lands and the rest) have no open, classified dataset — the USFS digitisation of Royce (1899) draws cessions and
       reservations without saying which is which — so the window's legend says "in Oklahoma". Since McGirt v. Oklahoma (2020) courts have held
       that several of these reservations were never disestablished; the card's note says so.
     · left out: Hawaiian home lands (G2120), Alaska Native village statistical areas (G2130), state and tribal designated statistical areas
       (G2150, G2160) — none is a reservation.

   THE SIMPLIFICATION: mapshaper (an offline-generator library that never ships), Visvalingam at SIMPLIFY_M (500 m, a window's pixel at the
   whole-country zoom is ~5 km) with keep-shapes, then quantised to 1/Q degree and delta-coded per ring ([x0, y0, dx1, dy1, …]). A shape
   smaller than the quantum (a trust land of a few thousand m²) is dropped and counted.

   --install writes the file and regenerates credits.js; --dry prints the sizes; --check (CI's fast job, no node_modules, no source cache)
   reads the committed file: the first-line `sources` equal to sources.json's entry, both parts present and non-empty, every ring decoding
   inside the box of the United States, the size under BUDGET — and, when the source is cached here, regenerates it and compares byte for byte. */
"use strict";
const fs = require("fs"), path = require("path");
const { spawnSync } = require("child_process");

const HERE = __dirname, ROOT = path.resolve(HERE, "..", "..");
const TARGET = path.join(ROOT, "atlas", "data", "us-reservations.js");
const SOURCE_ID = "census-cb-2023-aiannh", SET = "us-reservations";
const SIMPLIFY_M = 500, Q = 1000, BUDGET = 200 * 1024;
const FRAME = [-125, 24.5, -66.9, 49.4];   // the contiguous United States: the window opens on it (Annette Island, Alaska's one reservation, is in the file, off the frame)
const US_BOX = [-180, 18, -60, 72];        // every vertex must fall inside this (the check)
const PARTS = [
  { id: "current", where: "MTFCC=='G2100'||(MTFCC=='G2170'&&LSAD=='83')", what: "reservations and off-reservation trust land (MTFCC G2100) and legal joint-use areas (G2170, LSAD 83)" },
  { id: "former", where: "MTFCC=='G2140'||(MTFCC=='G2170'&&LSAD=='90')", what: "Oklahoma tribal statistical areas (MTFCC G2140) and their joint-use areas (G2170, LSAD 90): the Census Bureau's outlines of the former reservations in Oklahoma" },
];

function sourcesHeader() { return require("./fetch-sources.js").headerSources([SOURCE_ID]); }
function sourcesFromManifest() {   // the same block without requiring fetch-sources.js's download path (the check runs anywhere)
  const m = JSON.parse(fs.readFileSync(path.join(HERE, "sources.json"), "utf8")).sources.find((s) => s.id === SOURCE_ID);
  if (!m) throw new Error("no " + SOURCE_ID + " in sources.json");
  const { id, name, version, url, licence, licenceUrl, attribution, retrieved, sha256 } = m;
  return [{ id, name, version, url, licence, licenceUrl, attribution, retrieved, sha256 }];
}

function readPart(dir, part, tmp) {
  const ms = path.join(HERE, "node_modules", ".bin", "mapshaper");
  if (!fs.existsSync(ms)) throw new Error("mapshaper is not installed: run `npm ci` in .claude/atlas-build");
  const out = path.join(tmp, part.id + ".json");
  const r = spawnSync(ms, ["-i", path.join(dir, "cb_2023_us_aiannh_500k.shp"), "-filter", part.where, "-simplify", "interval=" + SIMPLIFY_M, "keep-shapes", "-o", "format=geojson", "precision=0.000001", out], { encoding: "utf8" });
  if (r.status !== 0) throw new Error("mapshaper failed: " + r.stderr);
  return JSON.parse(fs.readFileSync(out, "utf8"));
}
function encodePart(gj) {
  const rings = []; let entities = 0, dropped = 0, verts = 0;
  const feats = gj.features.slice().sort((a, b) => (a.properties.GEOID < b.properties.GEOID ? -1 : a.properties.GEOID > b.properties.GEOID ? 1 : 0));
  for (const f of feats) {
    if (!f.geometry) { dropped++; continue; }
    const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
    let kept = 0;
    for (const poly of polys) for (const ring of poly) {
      const pts = [];
      for (const q of ring) { const x = Math.round(q[0] * Q), y = Math.round(q[1] * Q); const l = pts[pts.length - 1]; if (!l || l[0] !== x || l[1] !== y) pts.push([x, y]); }
      if (pts.length > 1 && pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1]) pts.pop();   // implicit close
      if (pts.length < 3) continue;
      const enc = [pts[0][0], pts[0][1]];
      for (let i = 1; i < pts.length; i++) enc.push(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      rings.push(enc); verts += pts.length; kept++;
    }
    if (kept) entities++; else dropped++;
  }
  return { rings, entities, dropped, verts };
}
function generate() {
  const { ensureSource } = require("./fetch-sources.js");
  const src = ensureSource(SOURCE_ID);
  const tmp = fs.mkdtempSync(path.join(require("os").tmpdir(), "area-sets-"));
  const parts = PARTS.map((p) => Object.assign({ id: p.id, what: p.what }, encodePart(readPart(src.dir, p, tmp))));
  fs.rmSync(tmp, { recursive: true, force: true });
  const body = { set: SET, q: Q, frame: FRAME, simplifyM: SIMPLIFY_M, parts: parts.map((p) => ({ id: p.id, what: p.what, entities: p.entities, rings: p.rings })) };
  const text = "/* sources: " + JSON.stringify(sourcesHeader()) + " */\n" +
    "/* atlas/data/us-reservations.js — GENERATED by .claude/atlas-build/build-area-sets.js from the Census Bureau's 2023 AIANNH cartographic boundary file. Do not edit.\n" +
    "   Two parts of lon/lat rings, quantised to 1/q degree and delta-coded per ring ([x0, y0, dx1, dy1, …]), painted by a members window (app.js cardMembers `areas`,\n" +
    "   atlas-windows.js): \"current\" — reservations and off-reservation trust land today; \"former\" — the Oklahoma tribal statistical areas, the Census Bureau's outlines of the\n" +
    "   former reservations in Oklahoma. Simplified at " + SIMPLIFY_M + " m. */\n" +
    "(window.ATLAS_AREA_SETS = window.ATLAS_AREA_SETS || {})[" + JSON.stringify(SET) + "] = " + JSON.stringify(body) + ";\n";
  return { text, parts };
}

function decodeRing(enc, q) { const out = []; let x = 0, y = 0; for (let i = 0; i < enc.length; i += 2) { x = i ? x + enc[i] : enc[0]; y = i ? y + enc[i + 1] : enc[1]; out.push([x / q, y / q]); } return out; }
function checkCommitted() {
  const fails = [];
  if (!fs.existsSync(TARGET)) return ["atlas/data/us-reservations.js is missing"];
  const text = fs.readFileSync(TARGET, "utf8");
  if (text.length > BUDGET) fails.push("size " + text.length + " B over the budget " + BUDGET);
  const m = /^\/\* sources: (\[.*\]) \*\/\n/.exec(text);
  if (!m) fails.push("the first line is not the sources header");
  else if (JSON.stringify(JSON.parse(m[1])) !== JSON.stringify(sourcesFromManifest())) fails.push("the sources header differs from sources.json's " + SOURCE_ID);
  const W = {}; new Function("window", text)(W);
  const s = W.ATLAS_AREA_SETS && W.ATLAS_AREA_SETS[SET];
  if (!s) return fails.concat(["the file does not define ATLAS_AREA_SETS['" + SET + "']"]);
  if (s.parts.map((p) => p.id).join(",") !== PARTS.map((p) => p.id).join(",")) fails.push("parts are not " + PARTS.map((p) => p.id).join(", "));
  let rings = 0;
  for (const p of s.parts) {
    if (!p.rings.length || !(p.entities > 0)) fails.push("part " + p.id + " is empty");
    for (const r of p.rings) {
      rings++;
      if (r.length < 6 || r.length % 2) { fails.push("part " + p.id + ": a ring of " + r.length + " numbers"); continue; }
      for (const [x, y] of decodeRing(r, s.q)) if (x < US_BOX[0] || x > US_BOX[2] || y < US_BOX[1] || y > US_BOX[3]) { fails.push("part " + p.id + ": a vertex at " + x + "," + y + " outside the United States"); break; }
    }
  }
  return { fails, text, set: s, rings };
}

if (require.main === module) {
  const args = new Set(process.argv.slice(2));
  if (args.has("--check")) {
    const r = checkCommitted();
    const fails = Array.isArray(r) ? r : r.fails;
    let regen = "skipped (source not cached or mapshaper not installed)";
    const cached = fs.existsSync(path.join(HERE, "src", SOURCE_ID, "cb_2023_us_aiannh_500k.shp")) && fs.existsSync(path.join(HERE, "node_modules", ".bin", "mapshaper"));
    if (cached && !fails.length) { const g = generate(); if (g.text !== r.text) fails.push("the committed file lags the source (run build-area-sets.js --install)"); regen = g.text === r.text ? "byte-identical" : "DIFFERS"; }
    if (fails.length) { console.error("build-area-sets --check: FAIL\n  " + fails.join("\n  ")); process.exit(1); }
    console.log("build-area-sets --check: ok — " + r.set.parts.map((p) => p.id + " " + p.entities + " areas / " + p.rings.length + " rings").join(", ") + "; " + r.text.length + " B (budget " + BUDGET + "); regeneration " + regen);
  } else {
    const g = generate();
    for (const p of g.parts) console.log("  " + p.id + ": " + p.entities + " areas, " + p.rings.length + " rings, " + p.verts + " vertices, " + p.dropped + " dropped (smaller than the 1/" + Q + "° quantum or empty after simplification)");
    console.log("  " + path.relative(ROOT, TARGET) + ": " + g.text.length + " B (budget " + BUDGET + ")");
    if (g.text.length > BUDGET) { console.error("over budget"); process.exit(1); }
    if (args.has("--install")) {
      fs.writeFileSync(TARGET, g.text);
      const r = spawnSync(process.execPath, [path.join(HERE, "build-credits.js"), "--install"], { stdio: "inherit" });
      if (r.status !== 0) process.exit(r.status);
    }
  }
}
module.exports = { checkCommitted, decodeRing, SET, PARTS };
