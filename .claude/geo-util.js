/* geo-util.js — small geometry helpers shared by the border builders (build-polities.js,
   build-country-series.js). Zero dependencies. Not part of the site.

   · `dp(points, tol)`            Douglas–Peucker on an open polyline.
   · `simplifyRing(ring, tol)`    a closed ring simplified and rounded to 0.01°, or null if it collapses.
   · `outerRings(geometry)`       the outer rings of a GeoJSON Polygon / MultiPolygon.
   · `Mask` / `iou(a, b)`         rings rasterised onto a 0.1° grid, and the overlap of two such masks —
                                  how "the same shape" is judged without a polygon-clipping library.
   · `landTester(worldGeo)`       is a point on land? (world.js's own rings, gridded for speed)
   · `interiorLines(rings, onLand)` the edges of a shape that run over LAND on both sides — its land
                                  borders — chained into polylines. A shape drawn from a source whose
                                  coast is not world.js's would otherwise stroke a second, coarser
                                  coastline beside the real one; this is the `c` bitmask build-era.js
                                  writes for the era maps, computed the same way (`landAcross`): probe
                                  both sides of each edge's midpoint. */
"use strict";

function dp(pts, tol) {
  if (pts.length < 3) return pts.slice();
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const st = [[0, pts.length - 1]], t2 = tol * tol;
  while (st.length) {
    const [a, b] = st.pop(), ax = pts[a][0], ay = pts[a][1], dx = pts[b][0] - ax, dy = pts[b][1] - ay, L = dx * dx + dy * dy;
    let best = -1, bd = t2;
    for (let i = a + 1; i < b; i++) {
      let px = pts[i][0] - ax, py = pts[i][1] - ay;
      if (L) { const t = Math.max(0, Math.min(1, (px * dx + py * dy) / L)); px -= t * dx; py -= t * dy; }
      const d = px * px + py * py; if (d > bd) { bd = d; best = i; }
    }
    if (best >= 0) { keep[best] = 1; st.push([a, best], [best, b]); }
  }
  return pts.filter((p, i) => keep[i]);
}

function simplifyRing(ring, tol, minBox) {
  let pts = ring.map((p) => [Number(p[0]), Number(p[1])]);
  if (pts.length > 1 && pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1]) pts.pop();
  if (pts.length < 4) return null;
  let far = 0, fd = -1;
  for (let i = 1; i < pts.length; i++) { const d = (pts[i][0] - pts[0][0]) ** 2 + (pts[i][1] - pts[0][1]) ** 2; if (d > fd) { fd = d; far = i; } }
  const a = dp(pts.slice(0, far + 1), tol), b = dp(pts.slice(far).concat([pts[0]]), tol);
  let out = a.concat(b.slice(1, -1)).map((p) => [Math.round(p[0] * 100) / 100, Math.round(p[1] * 100) / 100]);
  out = out.filter((p, i) => i === 0 || p[0] !== out[i - 1][0] || p[1] !== out[i - 1][1]);
  if (out.length < 4) return null;
  let x0 = 180, y0 = 90, x1 = -180, y1 = -90;
  for (const p of out) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
  if (minBox && (x1 - x0) * (y1 - y0) < minBox) return null;
  return out;
}

function outerRings(g) {
  if (!g) return [];
  if (g.type === "Polygon") return [g.coordinates[0]];
  if (g.type === "MultiPolygon") return g.coordinates.map((poly) => poly[0]);
  return [];
}

function bbox(rings) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const r of rings) for (const p of r) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
  return [x0, y0, x1, y1];
}

/* A shape as a set of 0.1° cells (cell centres inside, even-odd over all rings — a multipolygon's rings
   are disjoint, so even-odd and nonzero agree). Scanline: for each cell row, the crossings of every edge
   with the row's centre line, sorted and filled in pairs. */
const RES = 0.1;
function Mask(rings0) {
  /* A ring spanning more than 180° of longitude crosses the antimeridian (the Aleutians, Chukotka, Fiji):
     scanned as it stands it fills a band round the whole globe, which corrupted the United States' mask
     and matched the 1900 Philippines to it. Such rings are left out of the MASK — they are slivers, and the
     overlap a mask measures is not moved by them; the drawn rings are untouched. */
  const rings = rings0.filter((r) => { let x0 = Infinity, x1 = -Infinity; for (const p of r) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; } return x1 - x0 <= 180; });
  if (!rings.length) return { cells: new Set(), bb: [0, 0, 0, 0] };
  const b = bbox(rings);
  const gx0 = Math.floor(b[0] / RES), gy0 = Math.floor(b[1] / RES), gx1 = Math.ceil(b[2] / RES), gy1 = Math.ceil(b[3] / RES);
  const W = Math.max(1, gx1 - gx0), H = Math.max(1, gy1 - gy0);
  const cells = new Set();
  for (let j = 0; j < H; j++) {
    const y = (gy0 + j + 0.5) * RES, xs = [];
    for (const r of rings) for (let i = 0, k = r.length - 1; i < r.length; k = i++) {
      const a = r[i], c = r[k];
      if ((a[1] > y) !== (c[1] > y)) xs.push(a[0] + (y - a[1]) * (c[0] - a[0]) / (c[1] - a[1]));
    }
    xs.sort((p, q) => p - q);
    for (let t = 0; t + 1 < xs.length; t += 2) {
      const c0 = Math.ceil(xs[t] / RES - 0.5), c1 = Math.floor(xs[t + 1] / RES - 0.5);
      for (let c = c0; c <= c1; c++) cells.add((gy0 + j) * 100000 + c);
    }
  }
  return { cells: cells, bb: b };
}
function iou(a, b) {
  if (a.bb[2] < b.bb[0] || b.bb[2] < a.bb[0] || a.bb[3] < b.bb[1] || b.bb[3] < a.bb[1]) return 0;
  let inter = 0; const [s, l] = a.cells.size < b.cells.size ? [a.cells, b.cells] : [b.cells, a.cells];
  for (const c of s) if (l.has(c)) inter++;
  const uni = a.cells.size + b.cells.size - inter;
  return uni ? inter / uni : 0;
}

function landTester(geo) {
  const G = 2, idx = new Map();   // 2° buckets of ring indices
  const rings = [];
  for (const c of geo) for (const r of c.p || []) {
    const b = bbox([r]), id = rings.length; rings.push({ r: r, b: b });
    for (let gx = Math.floor(b[0] / G); gx <= Math.floor(b[2] / G); gx++) for (let gy = Math.floor(b[1] / G); gy <= Math.floor(b[3] / G); gy++) {
      const k = gx + "," + gy; if (!idx.has(k)) idx.set(k, []); idx.get(k).push(id);
    }
  }
  return function onLand(x, y) {
    const list = idx.get(Math.floor(x / G) + "," + Math.floor(y / G)); if (!list) return false;
    for (const id of list) {
      const { r, b } = rings[id];
      if (x < b[0] || x > b[2] || y < b[1] || y > b[3]) continue;
      let inside = false;
      for (let i = 0, k = r.length - 1; i < r.length; k = i++) { const a = r[i], c = r[k]; if ((a[1] > y) !== (c[1] > y) && x < (c[0] - a[0]) * (y - a[1]) / (c[1] - a[1]) + a[0]) inside = !inside; }
      if (inside) return true;
    }
    return false;
  };
}

// the edges with land on BOTH sides, chained into polylines (an edge is probed 0.06° either side of its midpoint)
function interiorLines(rings, onLand, off) {
  const d = off || 0.06, out = [];
  for (const r of rings) {
    const n = r.length, inner = new Array(n);
    for (let i = 0; i < n; i++) {
      const a = r[i], b = r[(i + 1) % n], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      let nx = -(b[1] - a[1]), ny = b[0] - a[0]; const L = Math.hypot(nx, ny) || 1; nx = nx / L * d; ny = ny / L * d;
      inner[i] = onLand(mx + nx, my + ny) && onLand(mx - nx, my - ny);
    }
    if (inner.every(Boolean)) { out.push(r.concat([r[0]])); continue; }
    if (!inner.some(Boolean)) continue;
    // start just after a coastal edge so a run never wraps across the ring's seam
    let s = inner.findIndex((v) => !v);
    let cur = null;
    for (let t = 1; t <= n; t++) {
      const i = (s + t) % n;
      if (inner[i]) { if (!cur) cur = [r[i]]; cur.push(r[(i + 1) % n]); }
      else if (cur) { out.push(cur); cur = null; }
    }
    if (cur) out.push(cur);
  }
  return out;
}

module.exports = { dp, simplifyRing, outerRings, bbox, Mask, iou, landTester, interiorLines, RES };
