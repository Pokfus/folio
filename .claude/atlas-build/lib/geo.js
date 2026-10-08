/* lib/geo.js — spherical geometry for the build and the checker. No dependencies.

   Everything works on UNIT VECTORS, not on lon/lat planes, so the antimeridian and the poles are
   not special anywhere here (docs/atlas-v2-design.md §2.3: one planar topology on the sphere).
   Coordinates arrive as quantised integers (units of `quantum` degrees) and leave as such; the
   only floating point is inside a test.

     vec(xUnits, yUnits, quantum)            → [x, y, z] unit vector
     triArea(a, b, c)                         → m², the planar area of the chord triangle (Visvalingam's
                                                effective area; exact enough below a few hundred km)
     segmentsCross(a, b, c, d)                → true if great-circle arcs a–b and c–d properly cross
     chordMetres(a, b)                        → great-circle distance in metres
     Grid(cellDeg)                            → a bucket index over lon/lat cells for segment pairs
*/
"use strict";
const R_EARTH_M = 6371008.8;
const D2R = Math.PI / 180;

function vec(x, y, q) {
  const lon = x * q * D2R, lat = y * q * D2R, c = Math.cos(lat);
  return [c * Math.cos(lon), c * Math.sin(lon), Math.sin(lat)];
}
function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function norm(a) { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
function len(a) { return Math.hypot(a[0], a[1], a[2]); }

function triArea(a, b, c) { return 0.5 * len(cross(sub(b, a), sub(c, a))) * R_EARTH_M * R_EARTH_M; }
function chordMetres(a, b) { return 2 * Math.asin(Math.min(1, len(sub(a, b)) / 2)) * R_EARTH_M; }

/* Proper crossing of two short great-circle arcs. The intersection of the two great circles is
   ±(n1 × n2); the arcs cross if one of those points lies strictly inside both arcs. Arcs that touch
   at an endpoint do not count (the caller excludes pairs sharing a vertex id anyway). Collinear
   overlap returns false — a degenerate case that the junction logic never produces. */
function segmentsCross(a, b, c, d) {
  const n1 = cross(a, b), n2 = cross(c, d);
  const l1 = len(n1), l2 = len(n2);
  if (l1 < 1e-18 || l2 < 1e-18) return false;          // a zero-length segment
  let p = cross(n1, n2); const lp = len(p);
  if (lp < 1e-18) return false;                          // same great circle
  p = [p[0] / lp, p[1] / lp, p[2] / lp];
  const inside = (p, s, e) => {
    // p is inside arc s–e if it lies on the s side of e's normal and the e side of s's normal, with
    // the arc being the short one (< 180°). Use the "between" test via cross products against n.
    const n = cross(s, e);
    const t1 = dot(cross(s, p), n), t2 = dot(cross(p, e), n);
    return t1 > 1e-15 && t2 > 1e-15;
  };
  if (inside(p, a, b) && inside(p, c, d)) return true;
  const q = [-p[0], -p[1], -p[2]];
  return inside(q, a, b) && inside(q, c, d);
}

/* A lon/lat bucket grid for pairing segments. Cells are `cellDeg` wide; a segment is filed under
   every cell its lon/lat bounding box touches (segments crossing the antimeridian are filed under
   both ends' cells, which is enough because a crossing partner must share a cell with the part it
   crosses). Coordinates in quantised units. */
function Grid(cellDeg, quantum) {
  const cellU = Math.round(cellDeg / quantum);
  const cells = new Map();
  const key = (cx, cy) => cx * 100003 + cy;
  return {
    add(id, x1, y1, x2, y2) {
      const ax = Math.min(x1, x2), bx = Math.max(x1, x2), ay = Math.min(y1, y2), by = Math.max(y1, y2);
      if (bx - ax > 180 / quantum) {   // wraps the antimeridian: file both ends separately
        this.add(id, x1, y1, x1, y1); this.add(id, x2, y2, x2, y2); return;
      }
      for (let cx = Math.floor(ax / cellU); cx <= Math.floor(bx / cellU); cx++)
        for (let cy = Math.floor(ay / cellU); cy <= Math.floor(by / cellU); cy++) {
          const k = key(cx, cy); let arr = cells.get(k); if (!arr) cells.set(k, arr = []); arr.push(id);
        }
    },
    cells,
    // iterate unordered pairs (i < j) that share a cell, each pair once
    pairs(fn) {
      const seen = new Set();
      for (const arr of cells.values()) {
        if (arr.length < 2) continue;
        for (let i = 0; i < arr.length; i++) for (let j = i + 1; j < arr.length; j++) {
          const a = arr[i] < arr[j] ? arr[i] : arr[j], b = arr[i] < arr[j] ? arr[j] : arr[i];
          const k = a * 4294967296 + b;
          if (seen.has(k)) continue; seen.add(k);
          fn(a, b);
        }
      }
    },
  };
}

module.exports = { R_EARTH_M, vec, sub, cross, dot, norm, len, triArea, chordMetres, segmentsCross, Grid };
