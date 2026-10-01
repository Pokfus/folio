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
                                  both sides of each edge's midpoint.
   · `landGrid(worldGeo, res)`    world.js's land as a global raster (scanline, even-odd), for fast lookups.
   · `coastSnap(rings, grid, o)`  a shape's COASTAL FRINGE: the coastal land within `o.k` cells of it, as
                                  merged grid rectangles [gi0, gj0, i, j, w, h, …], plus `inSnap(x, y)` — is
                                  a point inside the shape or its fringe (sea included)? See the function.
   · `interiorLines(rings, onLand, off, inSnap)` with `inSnap` also refuses an edge whose far side is the
                                  shape's own fringe — its own coast, misplaced — rather than a neighbour.
   · `ccw(ring)`                  the ring, turned counter-clockwise if it was not. */
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
// — and, given `inSnap`, NOT with the shape's own snapped ground on both sides (see `coastSnap`)
function interiorLines(rings, onLand, off, inSnap) {
  const d = off || 0.06, out = [];
  for (const r of rings) {
    const n = r.length, inner = new Array(n);
    for (let i = 0; i < n; i++) {
      const a = r[i], b = r[(i + 1) % n], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      let nx = -(b[1] - a[1]), ny = b[0] - a[0]; const L = Math.hypot(nx, ny) || 1; nx = nx / L * d; ny = ny / L * d;
      inner[i] = onLand(mx + nx, my + ny) && onLand(mx - nx, my - ny) && !(inSnap && inSnap(mx + nx, my + ny) && inSnap(mx - nx, my - ny));
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

/* Each ring's edges as RUNS, alternating coast and land border and starting with coast (so a ring whose
   first edge is a border starts with 0): [3, 10, 2] = three coast edges, ten border edges, two coast. Edge i
   runs from point i to point i+1 (the last back to the first). The atlas strokes the borders and snaps the
   coasts (see app.js's `stepEdges`); a run list is a few numbers where the polylines were a copy of the ring. */
function edgeRuns(rings, onLand, off, inSnap) {
  const d = off || 0.06;
  return rings.map((r) => {
    const n = r.length, runs = []; let cur = false, cnt = 0;
    for (let i = 0; i < n; i++) {
      const a = r[i], b = r[(i + 1) % n], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      let nx = -(b[1] - a[1]), ny = b[0] - a[0]; const L = Math.hypot(nx, ny) || 1; nx = nx / L * d; ny = ny / L * d;
      const inner = onLand(mx + nx, my + ny) && onLand(mx - nx, my - ny) && !(inSnap && inSnap(mx + nx, my + ny) && inSnap(mx - nx, my - ny));
      if (inner !== cur) { runs.push(cnt); cnt = 0; cur = inner; }
      cnt++;
    }
    runs.push(cnt);
    return runs;
  });
}

/* ---- COAST SNAPPING (Oct 2026, on request: "implement the border fixes that you recommend") ----
   A border series drawn from Cliopatria has Cliopatria's coast, which is not world.js's: a few km inland in
   one place, offshore in the next, and missing the small islands its simplification dropped. The atlas
   clips a fill to the land, so a coast drawn OFFSHORE costs nothing — but one drawn INLAND leaves a dark
   sliver of unclaimed land along the shore, and an island just off it is left out altogether. And the
   stroke: `interiorLines` keeps an edge whose two sides are both land, so a coast drawn inland is stroked
   as if it were a border, a second coastline a few km inside the real one.
   THE FRINGE fixes both without touching the border itself. It is every cell within `k` cells of the
   shape that is SEA, or LAND within `kc` cells of the sea — so it grows the shape out over its own shore
   and nearby islands, and never across an inland frontier into a neighbour. It is shipped beside the rings
   (the atlas fills rings and fringe as one path, clipped to the land, and hit-tests the rings alone), and
   `inSnap` lets `interiorLines` see that the far side of a misplaced coast is the shape's own fringe. What
   it costs: along a coast, a neighbour's shore within `k` cells of a frontier is claimed by both, and the
   last `kc` cells of that frontier before the sea are not stroked. */
function landGrid(geo, res) {
  const R = res || 0.05, W = Math.round(360 / R), H = Math.round(180 / R), g = new Uint8Array(W * H);
  const rows = new Array(H);
  for (const c of geo) for (const r of c.p || []) {
    for (let i = 0, k = r.length - 1; i < r.length; k = i++) {
      const a = r[i], b = r[k]; if (a[1] === b[1]) continue;
      const y0 = Math.min(a[1], b[1]), y1 = Math.max(a[1], b[1]);
      const j0 = Math.max(0, Math.ceil((y0 + 90) / R - 0.5)), j1 = Math.min(H - 1, Math.floor((y1 + 90) / R - 0.5));
      for (let j = j0; j <= j1; j++) {
        const y = -90 + (j + 0.5) * R; if (y < y0 || y >= y1) continue;
        (rows[j] || (rows[j] = [])).push(a[0] + (y - a[1]) * (b[0] - a[0]) / (b[1] - a[1]));
      }
    }
  }
  for (let j = 0; j < H; j++) {
    const xs = rows[j]; if (!xs) continue;
    xs.sort((p, q) => p - q);
    for (let t = 0; t + 1 < xs.length; t += 2) {
      const c0 = Math.max(0, Math.ceil((xs[t] + 180) / R - 0.5)), c1 = Math.min(W - 1, Math.floor((xs[t + 1] + 180) / R - 0.5));
      for (let c = c0; c <= c1; c++) g[j * W + c] ^= 1;
    }
  }
  return { R: R, W: W, H: H, g: g, at: (x, y) => { const i = Math.floor((x + 180) / R), j = Math.floor((y + 90) / R); return i >= 0 && i < W && j >= 0 && j < H ? g[j * W + i] === 1 : false; } };
}
// signed area > 0 ⇔ counter-clockwise in lon/lat (y up)
function ringArea(r) { let a = 0; for (let i = 0, k = r.length - 1; i < r.length; k = i++) a += (r[k][0] - r[i][0]) * (r[k][1] + r[i][1]); return a / 2; }
function ccw(r) { return ringArea(r) < 0 ? r.slice().reverse() : r; }
// a square max filter of radius k over a W×H Uint8Array, separable (rows, then columns)
function dilate(m, W, H, k) {
  const t = new Uint8Array(W * H), o = new Uint8Array(W * H);
  for (let j = 0; j < H; j++) { let last = -1e9; for (let i = 0; i < W; i++) { if (m[j * W + i]) last = i; if (i - last <= k) t[j * W + i] = 1; } last = 1e9; for (let i = W - 1; i >= 0; i--) { if (m[j * W + i]) last = i; if (last - i <= k) t[j * W + i] = 1; } }
  for (let i = 0; i < W; i++) { let last = -1e9; for (let j = 0; j < H; j++) { if (t[j * W + i]) last = j; if (j - last <= k) o[j * W + i] = 1; } last = 1e9; for (let j = H - 1; j >= 0; j--) { if (t[j * W + i]) last = j; if (last - j <= k) o[j * W + i] = 1; } }
  return o;
}
function coastSnap(rings0, grid, o) {
  o = o || {};
  const k = o.k == null ? 3 : o.k, kc = o.kc == null ? 1 : o.kc;
  const R = grid.R;
  // an antimeridian-crossing ring would fill a band round the globe (see Mask) — it gets no fringe
  const rings = rings0.filter((r) => { let a = Infinity, b = -Infinity; for (const p of r) { if (p[0] < a) a = p[0]; if (p[0] > b) b = p[0]; } return b - a <= 180; });
  const none = { fringe: [], inSnap: () => false };
  if (!rings.length) return none;
  const bb = bbox(rings), pad = k + kc + 2;
  const gi0 = Math.floor((bb[0] + 180) / R) - pad, gj0 = Math.floor((bb[1] + 90) / R) - pad;
  const W = Math.floor((bb[2] + 180) / R) + pad - gi0 + 1, H = Math.floor((bb[3] + 90) / R) + pad - gj0 + 1;
  const x0 = -180 + gi0 * R, y0 = -90 + gj0 * R;
  const raster = (rs) => {
    const M = new Uint8Array(W * H);
    for (let j = 0; j < H; j++) {
      const y = y0 + (j + 0.5) * R, xs = [];
      for (const r of rs) for (let i = 0, q = r.length - 1; i < r.length; q = i++) { const a = r[i], b = r[q]; if ((a[1] > y) !== (b[1] > y)) xs.push(a[0] + (y - a[1]) * (b[0] - a[0]) / (b[1] - a[1])); }
      xs.sort((p, q) => p - q);
      for (let t = 0; t + 1 < xs.length; t += 2) { const c0 = Math.max(0, Math.ceil((xs[t] - x0) / R - 0.5)), c1 = Math.min(W - 1, Math.floor((xs[t + 1] - x0) / R - 0.5)); for (let c = c0; c <= c1; c++) M[j * W + c] = 1; }
    }
    return M;
  };
  const P = raster(rings);
  /* `o.extra`: the source's own unsimplified rings. Where they hold ground the drawn rings do not — a small
     island the simplification dropped as a sliver — that ground is fringe whether or not it is near the
     shape, since the source does claim it. Kept to the window, and only on land (the fill is land-clipped). */
  const Eraw = (o.extra || []).filter((r) => r.length >= 3 && r.every((p) => p[0] >= x0 && p[0] <= x0 + W * R && p[1] >= y0 && p[1] <= y0 + H * R));
  const E = Eraw.length ? raster(Eraw) : null;
  if (E) for (let c = 0; c < W * H; c++) if (E[c] && !P[c]) P[c] = 2;   // 2 = the source's, not the drawn shape's
  const L = new Uint8Array(W * H), S = new Uint8Array(W * H);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const gi = ((gi0 + i) % grid.W + grid.W) % grid.W, gj = gj0 + j;
    const land = gj >= 0 && gj < grid.H && grid.g[gj * grid.W + gi] === 1;
    L[j * W + i] = land ? 1 : 0; S[j * W + i] = land ? 0 : 1;
  }
  const D = dilate(P, W, H, k), C = dilate(S, W, H, kc), F = new Uint8Array(W * H);
  let n = 0;
  for (let c = 0; c < W * H; c++) {
    if (P[c] === 2) { if (L[c]) { F[c] = 1; n++; } P[c] = 0; continue; }
    if (D[c] && !P[c] && (!L[c] || C[c])) { F[c] = 1; n++; }
  }
  if (!n) return { fringe: [], inSnap: (x, y) => { const i = Math.floor((x - x0) / R), j = Math.floor((y - y0) / R); return i >= 0 && j >= 0 && i < W && j < H && P[j * W + i] === 1; } };
  /* ONLY ITS LAND IS SHIPPED. The atlas clips the fill to the land, so the fringe's sea cells would never
     show; they are kept for `inSnap` alone, where they are what tells a misplaced coast from a frontier.
     Shipping them tripled the bundle. */
  /* AS RECTANGLES OF GRID CELLS, not traced rings: the fringe is mostly slivers a cell or two wide, and a
     ring per sliver came to 64,000 rings and 8 MB. Each row's runs are merged with an identical run in the
     row above, and the whole set ships as [gi0, gj0, i, j, w, h, …] in cells of `R` from the grid's origin. */
  const rects = [], open = new Map();   // "i,w" → rect index still growing upward
  for (let j = 0; j < H; j++) {
    const next = new Map();
    for (let i = 0; i < W; i++) {
      if (!(F[j * W + i] && L[j * W + i])) continue;
      let e = i; while (e + 1 < W && F[j * W + e + 1] && L[j * W + e + 1]) e++;
      const key = i + "," + (e - i + 1), ri = open.get(key);
      if (ri != null) { rects[ri][3]++; next.set(key, ri); }
      else { rects.push([i, j, e - i + 1, 1]); next.set(key, rects.length - 1); }
      i = e;
    }
    open.clear(); next.forEach((v, k2) => open.set(k2, v));
  }
  const fringe = rects.length ? [gi0, gj0].concat(...rects) : [];
  return { fringe: fringe, inSnap: (x, y) => { const i = Math.floor((x - x0) / R), j = Math.floor((y - y0) / R); return i >= 0 && j >= 0 && i < W && j < H && (P[j * W + i] === 1 || F[j * W + i] === 1); } };
}

module.exports = { dp, simplifyRing, outerRings, bbox, Mask, iou, landTester, interiorLines, edgeRuns, RES, landGrid, coastSnap, ccw, ringArea };
