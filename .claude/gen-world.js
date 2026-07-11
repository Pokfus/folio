// Dev-only: build world.js (window.WORLD_GEO) from a Natural Earth geojson.
// Source/tolerance/precision via env: SRC (default ne_50m.geojson), TOL, PREC. Shipped build uses SRC=ne_10m.geojson.
// Output per country: { n: name, i: iso2(lowercase), c: [labelLon, labelLat], p: [ ring, ... ] }
// where each ring is an array of [lon,lat]; all rings of a Multipolygon/holes are
// flattened into one group (rendered + hit-tested with the even-odd rule).
const fs = require("fs");
const path = require("path");

const TOL = parseFloat(process.env.TOL || "0.04"); // Douglas-Peucker tolerance (degrees)
const DP_PRECISION = parseInt(process.env.PREC || "2", 10); // coord decimal places
const SRC = process.env.SRC || "ne_50m.geojson";   // Natural Earth source geojson

const src = path.join(__dirname, SRC);
const gj = JSON.parse(fs.readFileSync(src, "utf8"));
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const f = Math.pow(10, DP_PRECISION);
const round = (n) => Math.round(n * f) / f;

// iterative Douglas-Peucker on [lon,lat] (planar in degrees — fine at globe scale)
function dp(points, tol) {
  const n = points.length;
  if (n < 3) return points.slice();
  const keep = new Uint8Array(n); keep[0] = 1; keep[n - 1] = 1;
  const tol2 = tol * tol;
  const stack = [[0, n - 1]];
  while (stack.length) {
    const seg = stack.pop(), a = seg[0], b = seg[1];
    const ax = points[a][0], ay = points[a][1], bx = points[b][0], by = points[b][1];
    const dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy || 1e-12;
    let maxD = -1, idx = -1;
    for (let i = a + 1; i < b; i++) {
      const px = points[i][0], py = points[i][1];
      const t = clamp(((px - ax) * dx + (py - ay) * dy) / len2, 0, 1);
      const qx = ax + t * dx, qy = ay + t * dy;
      const d = (px - qx) * (px - qx) + (py - qy) * (py - qy);
      if (d > maxD) { maxD = d; idx = i; }
    }
    if (maxD > tol2 && idx > 0) { keep[idx] = 1; stack.push([a, idx]); stack.push([idx, b]); }
  }
  const out = [];
  for (let i = 0; i < n; i++) if (keep[i]) out.push(points[i]);
  return out;
}

function processRing(ring, tol) {
  let r = dp(ring, tol);
  const out = []; let px = null, py = null;
  for (const p of r) {
    const x = round(p[0]), y = round(p[1]);
    if (x === px && y === py) continue;
    out.push([x, y]); px = x; py = y;
  }
  if (out.length && (out[0][0] !== out[out.length - 1][0] || out[0][1] !== out[out.length - 1][1])) out.push([out[0][0], out[0][1]]);
  return out.length >= 4 ? out : null;
}

// --- geometry helpers for the no-drop safeguard + label placement ---
function ringArea(ring) { // |shoelace| in deg^2 — a size proxy for "the main landmass"
  let a = 0; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += (ring[j][0] + ring[i][0]) * (ring[j][1] - ring[i][1]);
  return Math.abs(a) / 2;
}
function bboxOf(ring) { let a = 180, b = 90, d = -180, e = -90; for (const p of ring) { if (p[0] < a) a = p[0]; if (p[0] > d) d = p[0]; if (p[1] < b) b = p[1]; if (p[1] > e) e = p[1]; } return [a, b, d, e]; }
function minBox(ring) { // a small valid quad around a sub-grid ring (microstates that round away)
  const bb = bboxOf(ring), mx = (bb[0] + bb[2]) / 2, my = (bb[1] + bb[3]) / 2;
  const hw = Math.max((bb[2] - bb[0]) / 2, 0.03), hh = Math.max((bb[3] - bb[1]) / 2, 0.03);
  return [[round(mx - hw), round(my - hh)], [round(mx + hw), round(my - hh)], [round(mx + hw), round(my + hh)], [round(mx - hw), round(my + hh)], [round(mx - hw), round(my - hh)]];
}
function pip(rings, lon, lat) { // even-odd test, same rule the site uses for hit-testing
  let inside = false;
  for (const ring of rings) for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const yi = ring[i][1], yj = ring[j][1];
    if ((yi > lat) !== (yj > lat)) { const xi = ring[i][0], xj = ring[j][0]; if (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside; }
  }
  return inside;
}
function interiorPoint(ring) { // a point guaranteed inside the ring (for the label anchor)
  let sx = 0, sy = 0; for (const p of ring) { sx += p[0]; sy += p[1]; }
  const mx = sx / ring.length, my = sy / ring.length;
  if (pip([ring], mx, my)) return [round(mx), round(my)];
  const bb = bboxOf(ring);
  for (let gy = 1; gy < 16; gy++) for (let gx = 1; gx < 16; gx++) {
    const lx = bb[0] + (bb[2] - bb[0]) * gx / 16, ly = bb[1] + (bb[3] - bb[1]) * gy / 16;
    if (pip([ring], lx, ly)) return [round(lx), round(ly)];
  }
  return [round(mx), round(my)];
}

const countries = [];
let totalPts = 0, dropped = 0, boxed = 0, labelFixed = 0;
for (const feat of gj.features) {
  const pr = feat.properties || {};
  const name = pr.NAME || pr.ADMIN || pr.NAME_LONG || "?";
  // ISO-2 for joining flag data; prefer the *_EH variant which fills in many "-99" gaps
  const isoRaw = (pr.ISO_A2_EH && pr.ISO_A2_EH !== "-99") ? pr.ISO_A2_EH
    : (pr.ISO_A2 && pr.ISO_A2 !== "-99") ? pr.ISO_A2
    : (pr.WB_A2 && pr.WB_A2 !== "-99") ? pr.WB_A2 : "";
  const iso = String(isoRaw).toLowerCase();
  const geom = feat.geometry; if (!geom) continue;
  const polys = geom.type === "Polygon" ? [geom.coordinates] : geom.type === "MultiPolygon" ? geom.coordinates : [];
  // the main landmass = the largest source ring by area; this must never be dropped
  let largest = null, largestArea = -1;
  for (const poly of polys) for (const ring of poly) { const ar = ringArea(ring); if (ar > largestArea) { largestArea = ar; largest = ring; } }
  if (!largest) continue;
  const rings = [];
  for (const poly of polys) for (const ring of poly) {
    if (ring === largest) continue;                 // the main landmass is added below, never dropped
    const rr = processRing(ring, TOL); if (rr) { rings.push(rr); totalPts += rr.length; } else dropped++;
  }
  // main landmass: simplified normally if sizeable, else a small valid box (microstates that round
  // to a sub-grid sliver, e.g. Vatican/Monaco, so they stay visible, hittable, and label-able)
  const lb = bboxOf(largest);
  let lr;
  if ((lb[2] - lb[0]) < 0.05 && (lb[3] - lb[1]) < 0.05) { lr = minBox(largest); boxed++; }
  else lr = processRing(largest, TOL) || processRing(largest, 0) || minBox(largest);
  rings.push(lr); totalPts += lr.length;
  if (!rings.length) continue;
  // label anchor: keep NE's curated point only if it lands on the country; else an interior point on land
  let c = [round(pr.LABEL_X), round(pr.LABEL_Y)];
  if (!isFinite(c[0]) || !isFinite(c[1]) || !pip(rings, c[0], c[1])) {
    let big = rings[0], bigA = -1; for (const rg of rings) { const ar = ringArea(rg); if (ar > bigA) { bigA = ar; big = rg; } }
    c = interiorPoint(big); labelFixed++;
  }
  countries.push({ n: name, i: iso, c, p: rings });
}

const json = JSON.stringify(countries);
const outjs = "/* World countries (Natural Earth " + SRC.replace(/^ne_|\.geojson$/g, "") + ", Douglas-Peucker tol=" + TOL + "deg, " + DP_PRECISION + "dp). " +
  "Each entry: n=name, i=iso2, c=[labelLon,labelLat], p=[rings of [lon,lat]] (even-odd). */\nwindow.WORLD_GEO = " + json + ";\n";
fs.writeFileSync(path.join(__dirname, "..", "world.js"), outjs);
console.log("countries=", countries.length, "totalPts=", totalPts, "ringsDropped=", dropped, "boxed=", boxed, "labelFixed=", labelFixed, "bytes=", Buffer.byteLength(outjs), "(" + (Buffer.byteLength(outjs) / 1048576).toFixed(2) + " MB)");
