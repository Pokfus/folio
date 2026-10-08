/* lib/rings.js — ring arithmetic shared by build-land.js and build-admin.js. No dependencies.

   Everything works on QUANTISED integer coordinates: x = round(lon / QUANTUM), y = round(lat / QUANTUM),
   x in [-X180, X180). The quantum is the one constant every build step must agree on, so it lives here.

     QUANTUM, U(deg), X180, Y90
     qpt([lon, lat])                → [x, y] with the antimeridian folded to -X180 and every pole one point
     dedupeRing(pts) / cutSpikes(pts, eq)
     ringAreaAndTurn(pts)           → { area (units², signed, CCW positive), turn (total longitude turn) }
     visvalingam(xs, ys, closed)    → Float64Array of effective areas (m²), monotone, per vertex; for an
                                      open line the endpoints are Infinity; for a closed ring the last
                                      three survivors carry the final triangle's area
     metres(x1, y1, x2, y2)         → great-circle metres between two quantised points
*/
"use strict";
const G = require("./geo.js");

const QUANTUM = 2.5e-4;                     // degrees per unit: 28 m at the equator — 0.19 px at 150 m/px (Q-A6 a), measured in Phase 0 against 1e-4 and 2e-4
const U = (deg) => Math.round(deg / QUANTUM);
const X180 = U(180), Y90 = U(90);
const SEAM_TOL = Math.round(0.0015 / QUANTUM);   // a longitude within 0.0015° of ±180 is ON the antimeridian (Natural Earth cuts at 179.999 as often as 180; measured in Phase 0)

/* `seamTol` (units) overrides SEAM_TOL: Natural Earth needs it, OSM must have 0 — osmcoastline cuts at
   exactly 180 and a vertex dragged onto the meridian from 100 m away extends one side's cut and not the
   other's, so the two sides no longer meet (measured: Fiji's and Chukotka's pieces missed by 4–8 quanta). */
function qpt(p, stats, seamTol) {
  let x = U(p[0]), y = U(p[1]);
  const tol = seamTol == null ? SEAM_TOL : seamTol;
  if (tol && Math.abs(Math.abs(x) - X180) <= tol && Math.abs(x) !== X180) { x = x < 0 ? -X180 : X180; if (stats) stats.seamSnaps = (stats.seamSnaps || 0) + 1; }
  if (x >= X180) x -= 2 * X180; if (x < -X180) x += 2 * X180;
  if (Math.abs(y) >= Y90) { y = y < 0 ? -Y90 : Y90; x = 0; }   // every longitude at a pole is one point
  return [x, y];
}
const eqPt = (a, b) => a[0] === b[0] && a[1] === b[1];
const pkey = (x, y) => x * 4000000 + y;   // unique: |y| ≤ 900000 < 4,000,000

function dedupeRing(r) {
  const out = [];
  for (const p of r) { const q = out[out.length - 1]; if (!q || q[0] !== p[0] || q[1] !== p[1]) out.push(p); }
  while (out.length > 1 && out[0][0] === out[out.length - 1][0] && out[0][1] === out[out.length - 1][1]) out.pop();
  return out;
}
/* spikes (x, y, x → x) and consecutive duplicates, in ONE linear pass over a stack (a splice per
   spike was quadratic on the 7 M-vertex Eurasia ring): pushing p when the stack's second-last entry
   equals p pops the apex between them and retries p, so a spur [a, b, c, b, a] collapses in cascade.
   The wrap-around (the ring's start as an apex or a duplicate of its end) is settled afterwards.
   `eq` compares two entries; returns the count removed. Works in place. */
function cutSpikes(r, eq) {
  eq = eq || eqPt;
  let removed = 0;
  const out = [];
  for (const p of r) {
    for (;;) {
      if (out.length && eq(out[out.length - 1], p)) { removed++; break; }
      if (out.length >= 2 && eq(out[out.length - 2], p)) { out.pop(); removed++; continue; }
      out.push(p); break;
    }
  }
  for (let changed = true; changed && out.length >= 2;) {
    changed = false;
    if (eq(out[0], out[out.length - 1])) { out.pop(); removed++; changed = true; continue; }
    if (out.length >= 3 && eq(out[out.length - 2], out[0])) { out.pop(); removed++; changed = true; continue; }
    if (out.length >= 3 && eq(out[1], out[out.length - 1])) { out.shift(); removed++; changed = true; continue; }
  }
  r.length = 0; for (const p of out) r.push(p);
  return removed;
}

// signed planar area in the unwrapped lon/lat plane (units²); also the total longitude turn
function ringAreaAndTurn(r) {
  let area = 0, turn = 0, px = r[0][0], ux = px;
  const n = r.length;
  const xs = new Array(n);
  for (let i = 0; i < n; i++) {
    let dx = r[i][0] - px; if (dx > X180) dx -= 2 * X180; else if (dx < -X180) dx += 2 * X180;
    ux += dx; xs[i] = ux; turn += dx; px = r[i][0];
  }
  let dxc = r[0][0] - px; if (dxc > X180) dxc -= 2 * X180; else if (dxc < -X180) dxc += 2 * X180; turn += dxc;
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; area += xs[i] * r[j][1] - xs[j] * r[i][1]; }
  return { area: area / 2, turn };
}

function metres(x1, y1, x2, y2) { return G.chordMetres(G.vec(x1, y1, QUANTUM), G.vec(x2, y2, QUANTUM)); }

/* Visvalingam–Whyatt with monotone effective areas (a vertex never ranks above one removed before it),
   on unit vectors so the antimeridian and the poles are nothing special. xs/ys are typed arrays or
   arrays of quantised units. For an open line the two endpoints are never removed (area Infinity).
   For a closed ring every vertex is removable until three remain; those three get the triangle's own
   area (monotone), so "the ring is drawable at tolerance t" is "at least three vertices with area ≥ t²". */
function visvalingam(xs, ys, closed) {
  const n = xs.length;
  const area = new Float64Array(n).fill(Infinity);
  if (n < 3) return area;
  const V = new Float64Array(n * 3);
  const D2R = Math.PI / 180;
  for (let i = 0; i < n; i++) { const lon = xs[i] * QUANTUM * D2R, lat = ys[i] * QUANTUM * D2R, c = Math.cos(lat); V[3 * i] = c * Math.cos(lon); V[3 * i + 1] = c * Math.sin(lon); V[3 * i + 2] = Math.sin(lat); }
  const R2 = G.R_EARTH_M * G.R_EARTH_M;
  const tri = (a, b, c) => {
    const ax = V[3 * b] - V[3 * a], ay = V[3 * b + 1] - V[3 * a + 1], az = V[3 * b + 2] - V[3 * a + 2];
    const bx = V[3 * c] - V[3 * a], by = V[3 * c + 1] - V[3 * a + 1], bz = V[3 * c + 2] - V[3 * a + 2];
    const cx = ay * bz - az * by, cy = az * bx - ax * bz, cz = ax * by - ay * bx;
    return 0.5 * Math.sqrt(cx * cx + cy * cy + cz * cz) * R2;
  };
  const prev = new Int32Array(n), next = new Int32Array(n);
  for (let i = 0; i < n; i++) { prev[i] = i - 1; next[i] = i + 1; }
  if (closed) { prev[0] = n - 1; next[n - 1] = 0; }
  const key = new Float64Array(n);
  const heap = new Int32Array(n); let hn = 0;
  const where = new Int32Array(n).fill(-1);
  const less = (i, j) => key[heap[i]] < key[heap[j]];
  const swap = (i, j) => { const t = heap[i]; heap[i] = heap[j]; heap[j] = t; where[heap[i]] = i; where[heap[j]] = j; };
  const up = (i) => { while (i > 0) { const p = (i - 1) >> 1; if (less(i, p)) { swap(i, p); i = p; } else break; } };
  const down = (i) => { for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < hn && less(l, m)) m = l; if (r < hn && less(r, m)) m = r; if (m === i) break; swap(i, m); i = m; } };
  const push = (v) => { where[v] = hn; heap[hn++] = v; up(where[v]); };
  const pop = () => { const v = heap[0]; const last = heap[--hn]; where[v] = -1; if (hn) { heap[0] = last; where[last] = 0; down(0); } return v; };
  const current = (v) => (prev[v] < 0 || next[v] >= n) ? Infinity : tri(prev[v], v, next[v]);
  const update = (v) => { if (where[v] < 0) return; key[v] = current(v); up(where[v]); down(where[v]); };
  const lo = closed ? 0 : 1, hi = closed ? n : n - 1;
  for (let i = lo; i < hi; i++) { key[i] = current(i); push(i); }
  let remaining = n, lastArea = 0;
  while (hn) {
    if (closed && remaining <= 3) break;
    const v = pop();
    const ar = Math.max(key[v], lastArea);
    lastArea = ar; area[v] = ar;
    next[prev[v]] = next[v]; prev[next[v]] = prev[v];
    remaining--;
    update(prev[v]); update(next[v]);
  }
  if (closed) {
    // the three survivors: the final triangle's area, monotone with what went before
    let a = -1; for (let i = 0; i < n; i++) if (where[i] >= 0) { a = i; break; }
    if (a >= 0) { const b = next[a], c = next[b]; const t = Math.max(lastArea, tri(a, b, c)); area[a] = t; area[b] = t; area[c] = t; }
  }
  return area;
}

module.exports = { QUANTUM, U, X180, Y90, SEAM_TOL, qpt, eqPt, pkey, dedupeRing, cutSpikes, ringAreaAndTurn, metres, visvalingam };
