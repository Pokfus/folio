/* lib/label.js — label geometry for area features (docs/atlas-v2-design.md §2.6, Phase 1c).

   An area kind (a country, a province, a sea, a lake, an island, a range) is labelled along a LABEL PATH:
   two to five points through the shape's POLE OF INACCESSIBILITY along its PRINCIPAL AXIS, so the name
   sits in the widest part of the shape and runs the way the shape runs (Chile north–south, the
   Mediterranean east–west). v1 labelled the United States over Europe because it took the centre of an
   antimeridian bounding box; everything here is computed in an AZIMUTHAL EQUIDISTANT PROJECTION about the
   shape's own centroid on the sphere, so Russia, Fiji, Kiribati and the Pacific Ocean have no seam and no
   wrap, and a shape cut at ±180° by its source (Natural Earth's marine polygons) is whole again in the
   plane: the two halves rasterise side by side and the cut edge is interior.

   HOW. The shape's rings (outer rings and holes, any number of parts) are projected, then RASTERISED by
   even-odd scanline into a grid of about RES cells across the longer side (a cell is ~1/200 of the shape;
   for the Pacific 80 km, for Malta 150 m). An exact Euclidean distance transform (Felzenszwalb–Huttenlocher,
   two passes) gives every filled cell its distance to the nearest unfilled one; the farthest cell is the
   pole of inaccessibility. The principal axis is the major eigenvector of the filled cells' covariance
   (area-weighted, so a long peninsula does not swing a country's axis); a shape whose axes are within
   ISOTROPY of each other takes the parallel (east–west) instead, because a label that tilts on a round
   shape looks like a mistake. The CHORD runs from the pole along the axis in both directions until it
   leaves the fill (a hole or the boundary), is shortened by MARGIN at each end, and is sampled at 2–5
   points by length. Unprojected, those are the path; the pole is the anchor; the chord length is the
   label's room in kilometres.

   A shape too small for a single cell (an islet under the grid's resolution) falls back to the centroid of
   its largest ring with a zero-length east–west path — the anchor is still inside the ring for anything
   convex, and a label of that size is a point label anyway.

     labelGeometry(parts)                 parts = [[lon, lat] …] rings, degrees; the first ring of a part is its
                                          outer ring by area sign in the plane, holes are negative
       → { at: [lon, lat], path: [[lon, lat] …], lenKm, areaKm2, axisDeg, cells }
     project(centre) / unproject           the azimuthal frame, exported for the checker

   No dependencies. The maths is the worker's (atlas-worker.js triangulateFace): the same tangent frame, the
   same orientation rule, so a label path computed here lies where the renderer's fill lies. */
"use strict";
const D2R = Math.PI / 180, R2D = 180 / Math.PI, R_KM = 6371.0088;
const RES = 200;          // cells across the longer side of the shape
const MIN_RES = 12;       // …but never fewer across the shorter side
const ISOTROPY = 1.35;    // axes closer than this ratio: the label runs east–west
const MARGIN = 0.12;      // of the chord, cut from each end

function unit(lon, lat) { const la = lat * D2R, lo = lon * D2R, c = Math.cos(la); return [c * Math.cos(lo), c * Math.sin(lo), Math.sin(la)]; }
function lonlat(v) { return [Math.atan2(v[1], v[0]) * R2D, Math.asin(Math.max(-1, Math.min(1, v[2]))) * R2D]; }

/* the azimuthal equidistant frame about a centre vector: e1 east, e2 north, so +x is east and +y is north
   in the plane and a counter-clockwise ring on the sphere stays counter-clockwise */
function frame(c) {
  let ux = 0, uy = 0, uz = 1; if (Math.abs(c[2]) > 0.9) { ux = 1; uy = 0; uz = 0; }
  let e1 = [uy * c[2] - uz * c[1], uz * c[0] - ux * c[2], ux * c[1] - uy * c[0]]; const l1 = Math.hypot(e1[0], e1[1], e1[2]); e1 = [e1[0] / l1, e1[1] / l1, e1[2] / l1];
  const e2 = [c[1] * e1[2] - c[2] * e1[1], c[2] * e1[0] - c[0] * e1[2], c[0] * e1[1] - c[1] * e1[0]];
  return { c, e1, e2 };
}
function project(F, v) {
  const d = Math.max(-1, Math.min(1, v[0] * F.c[0] + v[1] * F.c[1] + v[2] * F.c[2])), th = Math.acos(d);
  let tx = v[0] - d * F.c[0], ty = v[1] - d * F.c[1], tz = v[2] - d * F.c[2]; const tl = Math.hypot(tx, ty, tz) || 1;
  return [th * (tx * F.e1[0] + ty * F.e1[1] + tz * F.e1[2]) / tl, th * (tx * F.e2[0] + ty * F.e2[1] + tz * F.e2[2]) / tl];   // radians of arc
}
function unproject(F, x, y) {
  const th = Math.hypot(x, y); if (th < 1e-12) return F.c.slice();
  const dx = x / th, dy = y / th, s = Math.sin(th), co = Math.cos(th);
  return [co * F.c[0] + s * (dx * F.e1[0] + dy * F.e2[0]), co * F.c[1] + s * (dx * F.e1[1] + dy * F.e2[1]), co * F.c[2] + s * (dx * F.e1[2] + dy * F.e2[2])];
}

/* exact Euclidean distance transform of a binary grid (distance from every filled cell to the nearest
   unfilled cell, in cells); the squared-distance form of Felzenszwalb & Huttenlocher 2012 */
function edt1d(f, n, d, v, z) {
  let k = 0; v[0] = 0; z[0] = -Infinity; z[1] = Infinity;
  for (let q = 1; q < n; q++) {
    let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
    while (s <= z[k]) { k--; s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
    k++; v[k] = q; z[k] = s; z[k + 1] = Infinity;
  }
  k = 0;
  for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; d[q] = (q - v[k]) * (q - v[k]) + f[v[k]]; }
}
function distanceTransform(fill, W, H) {
  const INF = 1e12, g = new Float64Array(W * H);
  const n = Math.max(W, H), f = new Float64Array(n), d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1);
  // columns: distance to the nearest unfilled cell along y
  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) f[y] = fill[y * W + x] ? INF : 0;
    edt1d(f, H, d, v, z);
    for (let y = 0; y < H; y++) g[y * W + x] = d[y];
  }
  const out = new Float64Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) f[x] = g[y * W + x];
    edt1d(f, W, d, v, z);
    for (let x = 0; x < W; x++) out[y * W + x] = Math.sqrt(d[x]);
  }
  return out;
}

/* even-odd scanline rasterisation of projected rings into a W×H grid over [x0, x1] × [y0, y1]; a cell is
   filled when its centre is inside */
function rasterise(rings, x0, y0, cw, ch, W, H) {
  const fill = new Uint8Array(W * H);
  const xs = [];
  for (let row = 0; row < H; row++) {
    const yc = y0 + (row + 0.5) * ch;
    xs.length = 0;
    for (const r of rings) {
      for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
        const a = r[i], b = r[j];
        if ((a[1] > yc) !== (b[1] > yc)) xs.push(a[0] + (yc - a[1]) * (b[0] - a[0]) / (b[1] - a[1]));
      }
    }
    if (xs.length < 2) continue;
    xs.sort((p, q) => p - q);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const c0 = Math.max(0, Math.ceil((xs[k] - x0) / cw - 0.5)), c1 = Math.min(W - 1, Math.floor((xs[k + 1] - x0) / cw - 0.5));
      for (let c = c0; c <= c1; c++) fill[row * W + c] = 1;
    }
  }
  return fill;
}

function ringArea(p) { let A = 0; for (let i = 0, j = p.length - 1; i < p.length; j = i++) A += p[j][0] * p[i][1] - p[i][0] * p[j][1]; return A / 2; }

/* parts: an array of rings, each [[lon, lat] …] (closing vertex optional). Returns null for an empty input. */
function labelGeometry(parts, opts) {
  opts = opts || {};
  const rings = parts.map((r) => (r.length > 1 && r[0][0] === r[r.length - 1][0] && r[0][1] === r[r.length - 1][1]) ? r.slice(0, -1) : r).filter((r) => r.length >= 3);
  if (!rings.length) return null;
  // the centroid of every vertex on the sphere (a girdling ring, Antarctica, gives a pole)
  let cx = 0, cy = 0, cz = 0, n = 0;
  const U = rings.map((r) => r.map(([lon, lat]) => { const v = unit(lon, lat); cx += v[0]; cy += v[1]; cz += v[2]; n++; return v; }));
  let cl = Math.hypot(cx, cy, cz); if (cl < 1e-9) { cx = 0; cy = 0; cz = rings[0][0][1] < 0 ? -1 : 1; cl = 1; }
  const F = frame([cx / cl, cy / cl, cz / cl]);
  const P = U.map((r) => r.map((v) => project(F, v)));
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const r of P) for (const [x, y] of r) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const span = Math.max(x1 - x0, y1 - y0) || 1e-9;
  const res = opts.res || RES;
  let cw = span / res, ch = cw;
  let W = Math.max(MIN_RES, Math.ceil((x1 - x0) / cw) + 2), H = Math.max(MIN_RES, Math.ceil((y1 - y0) / ch) + 2);
  if (W > 1200) W = 1200; if (H > 1200) H = 1200;
  cw = (x1 - x0) / (W - 2) || 1e-9; ch = (y1 - y0) / (H - 2) || 1e-9;
  const gx0 = x0 - cw, gy0 = y0 - ch;
  const fill = rasterise(P, gx0, gy0, cw, ch, W, H);
  // area: the plane's ring areas (outer positive, holes negative), in km²
  let area = 0; for (const r of P) area += ringArea(r);
  const areaKm2 = Math.abs(area) * R_KM * R_KM;
  let count = 0, sx = 0, sy = 0;
  for (let i = 0; i < W * H; i++) if (fill[i]) { count++; sx += i % W; sy += (i / W) | 0; }
  if (count === 0) {
    // smaller than a cell: the largest ring's centroid, a point label
    let best = null, bestA = -1;
    for (const r of P) { const a = Math.abs(ringArea(r)); if (a > bestA) { bestA = a; best = r; } }
    let mx = 0, my = 0; for (const [x, y] of best) { mx += x; my += y; } mx /= best.length; my /= best.length;
    const at = lonlat(unproject(F, mx, my));
    return { at, path: [at, at], lenKm: 0, areaKm2, axisDeg: 0, cells: 0 };
  }
  const dist = distanceTransform(fill, W, H);
  const mx = sx / count, my = sy / count;
  // the pole: the farthest cell from the edge — and among cells within half a cell of that distance (a
  // long shape has a whole band of them), the one nearest the fill's centroid, so a box is labelled at
  // its middle rather than at the first cell of the band
  let pd = -1;
  for (let i = 0; i < W * H; i++) if (fill[i] && dist[i] > pd) pd = dist[i];
  let pole = -1, pc = Infinity;
  for (let i = 0; i < W * H; i++) if (fill[i] && dist[i] >= pd - 0.5) { const dx = (i % W) - mx, dy = ((i / W) | 0) - my, d2 = dx * dx + dy * dy; if (d2 < pc) { pc = d2; pole = i; } }
  const px = pole % W, py = (pole / W) | 0;
  // principal axis from the filled cells' covariance
  let cxx = 0, cxy = 0, cyy = 0;
  for (let i = 0; i < W * H; i++) if (fill[i]) { const dx = (i % W) - mx, dy = ((i / W) | 0) - my; cxx += dx * dx; cxy += dx * dy; cyy += dy * dy; }
  cxx *= cw * cw; cxy *= cw * ch; cyy *= ch * ch;
  const tr = cxx + cyy, det = cxx * cyy - cxy * cxy, disc = Math.sqrt(Math.max(0, tr * tr / 4 - det));
  const l1 = tr / 2 + disc, l2 = Math.max(1e-30, tr / 2 - disc);
  let ax = 1, ay = 0;
  if (l1 / l2 >= ISOTROPY * ISOTROPY) {
    if (Math.abs(cxy) > 1e-18) { ax = l1 - cyy; ay = cxy; } else if (cyy > cxx) { ax = 0; ay = 1; }
    const al = Math.hypot(ax, ay) || 1; ax /= al; ay /= al;
    if (ax < 0 || (ax === 0 && ay < 0)) { ax = -ax; ay = -ay; }   // read west to east; a north–south label reads upward
  }
  // the chord: walk from the pole along ±axis while the cell under the step is filled
  const stepX = ax / cw, stepY = ay / ch;   // one unit of plane distance per step… scaled below to a cell per step
  const stepLen = Math.min(cw, ch) * 0.5;
  const walk = (sign) => {
    let t = 0, lastGood = 0;
    for (let k = 1; k < 4000; k++) {
      t = k * stepLen;
      const fx = px + sign * t * stepX, fy = py + sign * t * stepY;
      const ix = Math.round(fx), iy = Math.round(fy);
      if (ix < 0 || iy < 0 || ix >= W || iy >= H || !fill[iy * W + ix]) break;
      lastGood = t;
    }
    return lastGood;
  };
  const tPlus = walk(1), tMinus = walk(-1);
  const total = tPlus + tMinus;
  const a0 = -tMinus + total * MARGIN, a1 = tPlus - total * MARGIN;
  const poleX = gx0 + (px + 0.5) * cw, poleY = gy0 + (py + 0.5) * ch;
  const lenKm = Math.max(0, a1 - a0) * R_KM;
  const nPts = lenKm > 1500 ? 5 : lenKm > 400 ? 3 : 2;
  const path = [];
  for (let i = 0; i < nPts; i++) { const t = a0 + (a1 - a0) * i / (nPts - 1); path.push(lonlat(unproject(F, poleX + t * ax, poleY + t * ay))); }
  const at = lonlat(unproject(F, poleX, poleY));
  return { at, path, lenKm, areaKm2, axisDeg: Math.atan2(ay, ax) * R2D, cells: count, frame: F };
}

/* is (lon, lat) inside the rings (even-odd), tested in the same azimuthal plane — for the checker */
function insideRings(parts, lon, lat) {
  const rings = parts.filter((r) => r.length >= 3);
  if (!rings.length) return false;
  let cx = 0, cy = 0, cz = 0;
  const U = rings.map((r) => r.map(([lo, la]) => { const v = unit(lo, la); cx += v[0]; cy += v[1]; cz += v[2]; return v; }));
  let cl = Math.hypot(cx, cy, cz); if (cl < 1e-9) { cx = 0; cy = 0; cz = rings[0][0][1] < 0 ? -1 : 1; cl = 1; }
  const F = frame([cx / cl, cy / cl, cz / cl]);
  const [qx, qy] = project(F, unit(lon, lat));
  let inside = false;
  for (const r of U) {
    const p = r.map((v) => project(F, v));
    for (let i = 0, j = p.length - 1; i < p.length; j = i++) if ((p[i][1] > qy) !== (p[j][1] > qy) && qx < (p[j][0] - p[i][0]) * (qy - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0]) inside = !inside;
  }
  return inside;
}

module.exports = { labelGeometry, insideRings, frame, project, unproject, unit, lonlat, distanceTransform, rasterise, R_KM };
