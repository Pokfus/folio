// Dev-only: fetch curated historical world borders for a year and add it as an era to timeline.js (Atlas globe timeline).
// Source: historical-basemaps by N. Ourednik — https://github.com/aourednik/historical-basemaps (CC-BY-SA 4.0).
// Usage:  node .claude/build-era.js <year> ["label"]
//   <year>: 1900, -500, "500bce", "1914ce" … picks the NEAREST available snapshot (re-running a snapshot replaces it).
//
// TOPOLOGY-PRESERVING build (so past-year borders look as clean as the present-day map):
//  - Quantize every vertex to a shared grid, so a border shared by two countries stays IDENTICAL in both
//    rings — drawn twice it overlaps exactly instead of doubling (the old per-ring Douglas–Peucker made the
//    two copies diverge, which is what produced the "double border" artifacts).
//  - Classify each edge interior-vs-coast TOPOLOGICALLY (an edge is interior iff its reverse exists in another
//    territory; an unshared edge is the outer coastline) — exact, replacing the old midpoint ocean-probe that
//    mis-tagged long edges and left strays/gaps.
//  - Thin with a LOCAL collinear test that is symmetric under reversal and keeps junctions, so shared edges stay
//    matched. Interior borders (which are drawn) are kept detailed; coasts (hit-test/fill only — the crisp coast
//    is drawn from world.js at render time) are thinned more.
const fs = require("fs"), path = require("path");
const RAW = "https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/";
// signed years that exist in the repo's geojson/ dir (BC negative)
const SNAPSHOTS = [-123000, -10000, -8000, -5000, -4000, -3000, -2000, -1500, -1000, -700, -500, -400, -323, -300, -200, -100, -1,
  100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1279, 1300, 1400, 1492, 1500, 1530, 1600, 1650, 1700, 1715,
  1783, 1800, 1815, 1880, 1900, 1914, 1920, 1930, 1938, 1945, 1960, 1994, 2000, 2010];
const fileFor = (y) => "world_" + (y < 0 ? "bc" + (-y) : "" + y) + ".geojson";
// Some snapshots are sparsely DIGITIZED in a region (gaps, not real history). Supplement that region from a better-digitized
// nearby snapshot. world_1900 maps Africa only ~20% (huge gaps), but the Scramble for Africa was settled by 1900, so fill the
// African continent from the complete 1914 snapshot — 1900 is kept everywhere else (incl. the pre-Balkan-Wars Balkans).
const SUPPLEMENT = {
  1900: { src: 1914, inRegion: (lon, lat) => {
    if (lon < -19 || lon > 52 || lat < -36 || lat > 38) return false;                  // Africa's bounding box
    if (lat >= 12.5 && lat <= 30 && lon > 33 + 10 * (30 - lat) / 17.5) return false;    // east of the Red Sea → Arabia
    if (lat > 30 && lon > 35) return false;                                             // north of Suez, east of Sinai → Levant/Arabia
    return true;
  } },
};
const GRID = 1000;        // 3dp quantization grid (~110m) — matches world.js coordinate precision; keeps shared borders bit-identical
const TOL_INT = 0.0025;   // interior borders are DRAWN → keep them detailed
const TOL_COAST = 0.02;   // coasts are hit-test/fill only (the coast itself is drawn from world.js) → thin more to save size
const Q = (v) => Math.round(v * GRID) / GRID;
const K = (p) => p[0] + "," + p[1];

function parseYear(s) { s = String(s == null ? "" : s).trim().toLowerCase().replace(/[,\s]/g, ""); const m = /^-?\d+/.exec(s); if (!m) return null; let y = parseInt(m[0], 10); if (isNaN(y)) return null; if (/bce|bc/.test(s) && y > 0) y = -y; return y; }
// quantize a ring to the grid, drop consecutive duplicates, keep it closed (first == last)
function quantRing(r) {
  const o = []; let px, py;
  for (const p of r) { const x = Q(p[0]), y = Q(p[1]); if (x !== px || y !== py) { o.push([x, y]); px = x; py = y; } }
  if (o.length && (o[0][0] !== o[o.length - 1][0] || o[0][1] !== o[o.length - 1][1])) o.push([o[0][0], o[0][1]]);
  return o;
}
function featRings(geom) {
  const out = [], add = (poly) => { for (const r of poly) { const q = quantRing(r); if (q.length >= 4) out.push(q); } };
  if (geom.type === "Polygon") add(geom.coordinates);
  else if (geom.type === "MultiPolygon") for (const poly of geom.coordinates) add(poly);
  return out;
}
function perp(v, a, c) { const dx = c[0] - a[0], dy = c[1] - a[1], L = Math.hypot(dx, dy) || 1; return Math.abs((v[0] - a[0]) * dy - (v[1] - a[1]) * dx) / L; }

// The historical-basemaps source occasionally leaves STALE / ANACHRONISTIC / DUPLICATE features that overlap the
// correct territories (e.g. world_1938 ships "Israel" + leftover "Hejaz"/"Hail"/"Emirate of Bin Shal'an" + duplicate
// "Qatar"/"Yemen" on top of Saudi Arabia + Mandatory Palestine) → overlapping polygons → DOUBLE borders + desert strays.
// Drop unnamed blobs, then greedily drop whichever remaining feature is most contained inside a SINGLE other feature
// (the spurious overlapper — a real base territory is never mostly inside one neighbour), keeping one of any duplicate pair.
function removeOverlaps(feats) {
  function inRing(lon, lat, ring) { let c = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1]; if (((yi > lat) !== (yj > lat)) && (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi)) c = !c; } return c; }
  function inPoly(lon, lat, rings) { let c = false; for (const r of rings) if (inRing(lon, lat, r)) c = !c; return c; }
  const list = feats.filter((f) => f.n && String(f.n).trim());
  const meta = list.map((f) => {
    let x0 = 180, y0 = 90, x1 = -180, y1 = -90;
    for (const r of f.rings) for (const p of r) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
    const samples = []; for (let s = 0; s < 300 && samples.length < 24; s++) { const lon = x0 + (x1 - x0) * ((s * 0.131 + 0.05) % 1), lat = y0 + (y1 - y0) * ((s * 0.077 + 0.3) % 1); if (inPoly(lon, lat, f.rings)) samples.push([lon, lat]); }
    return { bb: [x0, y0, x1, y1], samples };
  });
  const removed = new Set();
  while (true) {
    let worst = -1, worstCov = 0;
    for (let i = 0; i < list.length; i++) {
      if (removed.has(i) || !meta[i].samples.length) continue;
      let best = 0;
      for (let j = 0; j < list.length; j++) {
        if (j === i || removed.has(j)) continue;
        const b = meta[j].bb; let inside = 0;
        for (const pt of meta[i].samples) { if (pt[0] < b[0] || pt[0] > b[2] || pt[1] < b[1] || pt[1] > b[3]) continue; if (inPoly(pt[0], pt[1], list[j].rings)) inside++; }
        const frac = inside / meta[i].samples.length; if (frac > best) best = frac;
      }
      if (best > worstCov) { worstCov = best; worst = i; }
    }
    if (worst >= 0 && worstCov >= 0.6) removed.add(worst); else break;
  }
  return list.filter((_, i) => !removed.has(i));
}

(async () => {
  const req = parseYear(process.argv[2]), label = process.argv[3] || "";
  if (req == null) { console.error("usage: node .claude/build-era.js <year> [label]   (e.g. 1900, -500, 500bce)"); process.exit(1); }
  // only snapshots within the timeline's floor (1000 BCE) are usable — deeper ones would all clamp to -1000 and collide
  const snap = SNAPSHOTS.filter((s) => s >= -1000).reduce((a, b) => Math.abs(b - req) < Math.abs(a - req) ? b : a);
  const url = RAW + fileFor(snap);
  console.log("requested " + req + " → nearest snapshot " + snap + " (" + fileFor(snap) + ")");
  let gj;
  try { const r = await fetch(url); if (!r.ok) { console.error("fetch failed " + r.status + " " + url); process.exit(1); } gj = JSON.parse(await r.text()); }
  catch (e) { console.error("fetch error: " + e.message); process.exit(1); }

  // region supplement: replace a sparsely-digitized region's features with a better snapshot's (e.g. 1900 Africa ← 1914)
  const sup = SUPPLEMENT[snap];
  if (sup) {
    const cen = (g) => { const polys = g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : []; let x = 0, y = 0, n = 0; for (const poly of polys) for (const ring of poly) for (const p of ring) { x += p[0]; y += p[1]; n++; } return n ? [x / n, y / n] : null; };
    try {
      const r2 = await fetch(RAW + fileFor(sup.src)); const gj2 = JSON.parse(await r2.text());
      const keep = (gj.features || []).filter((f) => { const c = f.geometry && cen(f.geometry); return !(c && sup.inRegion(c[0], c[1])); });
      const add = (gj2.features || []).filter((f) => { const c = f.geometry && cen(f.geometry); return c && sup.inRegion(c[0], c[1]); });
      gj = { type: "FeatureCollection", features: keep.concat(add) };
      console.log("supplemented region from " + fileFor(sup.src) + ": kept " + keep.length + " + added " + add.length + " features");
    } catch (e) { console.error("supplement fetch error: " + e.message); }
  }

  // 1) quantized rings per feature
  let feats = [];
  for (const f of (gj.features || [])) {
    if (!f || !f.geometry) continue;
    const rings = featRings(f.geometry); if (!rings.length) continue;
    feats.push({ n: (f.properties && (f.properties.NAME || f.properties.name)) || "", rings });
  }
  if (!feats.length) { console.error("no polygons converted"); process.exit(1); }
  const rawN = feats.length; feats = removeOverlaps(feats);   // drop the source's stale/duplicate/anachronistic overlapping features (→ no double borders)
  if (feats.length < rawN) console.log("cleaned " + (rawN - feats.length) + " overlapping/unnamed/stale feature(s) from the snapshot");

  // 2) global directed-edge set + per-vertex neighbour set, across ALL rings (used to detect shared edges + junctions)
  const E = new Set(), nbr = new Map();
  const link = (a, b) => { let s = nbr.get(a); if (!s) { s = new Set(); nbr.set(a, s); } s.add(b); };
  for (const ft of feats) for (const r of ft.rings) for (let i = 0; i + 1 < r.length; i++) { const a = K(r[i]), b = K(r[i + 1]); E.add(a + "|" + b); link(a, b); link(b, a); }
  const shared = (a, b) => E.has(K(b) + "|" + K(a));   // edge a→b is an interior border iff its reverse exists in another territory

  // 3) topology-safe simplification (cyclic, single-pass, symmetric under reversal so shared edges thin identically)
  const EMPTY = { size: 0 };
  function simp(r) {
    const m = r.length - 1;   // unique vertices (r is closed: r[0]==r[m])
    if (m < 3) return r;
    const keep = new Array(m).fill(false);
    for (let i = 0; i < m; i++) {
      const v = r[i], a = r[(i - 1 + m) % m], c = r[(i + 1) % m];
      const pe = shared(a, v), ne = shared(v, c);
      if (pe !== ne) { keep[i] = true; continue; }                 // interior↔coast transition → keep (anchors the shared arc)
      if ((nbr.get(K(v)) || EMPTY).size > 2) { keep[i] = true; continue; }   // T-junction (3+ territories meet) → keep
      const tol = pe ? TOL_INT : TOL_COAST;
      if (perp(v, a, c) >= tol) keep[i] = true;                     // genuine corner → keep
    }
    const o = []; for (let i = 0; i < m; i++) if (keep[i]) o.push(r[i]);
    if (o.length < 3) return r;
    o.push([o[0][0], o[0][1]]);   // re-close
    return o;
  }
  const simpFeats = [];
  for (const ft of feats) { const rs = ft.rings.map(simp).filter((r) => r.length >= 4); if (rs.length) simpFeats.push({ n: ft.n, rings: rs }); }

  // point-in-polygon + territory bboxes (used by the non-tiling land-border probe below AND the merger detection later)
  function inRing(lon, lat, ring) { let c = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1]; if (((yi > lat) !== (yj > lat)) && (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi)) c = !c; } return c; }
  function inPoly(lon, lat, rings) { let c = false; for (const r of rings) if (inRing(lon, lat, r)) c = !c; return c; }
  const TBB = simpFeats.map((ft) => { let x0 = 180, y0 = 90, x1 = -180, y1 = -90; for (const r of ft.rings) for (const p of r) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; } return [x0, y0, x1, y1]; });
  // FALLBACK for non-tiling sources (e.g. 1900 Africa, whose colonial/tribal polygons don't share exact edges): an UNSHARED
  // edge is still a LAND border (not coast) if another territory lies just across it. Probe a point ~0.06deg off each side of
  // the edge midpoint; if it falls inside a DIFFERENT territory, the edge is interior. (A true coastline has only ocean across.)
  const PDELTA = 0.06;
  function landAcross(a, b, self) {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, ox = -dy / L * PDELTA, oy = dx / L * PDELTA, mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    for (const q of [[mx + ox, my + oy], [mx - ox, my - oy]]) {
      for (let j = 0; j < simpFeats.length; j++) { if (j === self) continue; const bb = TBB[j]; if (q[0] < bb[0] || q[0] > bb[2] || q[1] < bb[1] || q[1] > bb[3]) continue; if (inPoly(q[0], q[1], simpFeats[j].rings)) return true; }
    }
    return false;
  }

  // 4) per-edge mask from the SIMPLIFIED topology: '0' = interior (drawn), '1' = coastal (skipped — world.js draws the coast)
  const E2 = new Set();
  for (const ft of simpFeats) for (const r of ft.rings) for (let i = 0; i + 1 < r.length; i++) E2.add(K(r[i]) + "|" + K(r[i + 1]));
  const shared2 = (a, b) => E2.has(K(b) + "|" + K(a));
  const geo = []; let edgeN = 0, coastN = 0, pts = 0, recovered = 0;
  for (let fi = 0; fi < simpFeats.length; fi++) {
    const ft = simpFeats[fi];
    const masks = ft.rings.map((r) => { let s = ""; for (let i = 0; i + 1 < r.length; i++) { let it = shared2(r[i], r[i + 1]); if (!it && landAcross(r[i], r[i + 1], fi)) { it = true; recovered++; } s += it ? "0" : "1"; edgeN++; if (!it) coastN++; } pts += r.length; return s; });
    geo.push({ n: ft.n, p: ft.rings, c: masks });
  }
  if (recovered) console.log("recovered " + recovered + " non-tiling land-border edges (probe across)");

  // 4.5) MERGER-ONLY detection: if this era differs from today ONLY by merged/split countries (no MOVED borders),
  // store just a present-country → era-territory grouping and let the renderer reuse world.js's own high-res geometry,
  // so unchanged borders are pixel-identical to the present-day map with ZERO source-mixing (no "double border" where
  // the two datasets vectorize the same border slightly differently). Older eras with genuinely moved borders keep `geo`.
  global.window = {}; require(path.join(__dirname, "..", "world.js")); const WGEO = global.window.WORLD_GEO || [];   // inRing/inPoly/TBB defined above (before the mask step)
  const eraTerr = simpFeats.map((ft, i) => ({ n: ft.n, rings: ft.rings, bb: TBB[i] }));
  function eraAt(lon, lat) { let best = -1, ba = Infinity; for (let i = 0; i < eraTerr.length; i++) { const b = eraTerr[i].bb; if (lon < b[0] || lon > b[2] || lat < b[1] || lat > b[3]) continue; if (inPoly(lon, lat, eraTerr[i].rings)) { const a = (b[2] - b[0]) * (b[3] - b[1]); if (a < ba) { ba = a; best = i; } } } return best; }
  const wbb = WGEO.map((g) => { let x0 = 180, y0 = 90, x1 = -180, y1 = -90; for (const r of g.p) for (const p of r) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; } return [x0, y0, x1, y1]; });
  function presAt(lon, lat) { for (let i = 0; i < WGEO.length; i++) { const b = wbb[i]; if (lon < b[0] || lon > b[2] || lat < b[1] || lat > b[3]) continue; if (inPoly(lon, lat, WGEO[i].p)) return i; } return -1; }
  // assign each present-day country to the era territory it sits in (centroid + interior samples → majority vote, robust for islands)
  const grp = WGEO.map((g, i) => {
    const b = wbb[i], votes = {}; const cand = [g.c];
    for (let s = 0; s < 60 && cand.length < 16; s++) { const lon = b[0] + (b[2] - b[0]) * ((s * 0.137 + 0.05) % 1), lat = b[1] + (b[3] - b[1]) * ((s * 0.071 + 0.3) % 1); if (inPoly(lon, lat, g.p)) cand.push([lon, lat]); }
    for (const pt of cand) { if (!inPoly(pt[0], pt[1], g.p)) continue; const t = eraAt(pt[0], pt[1]); if (t >= 0) votes[t] = (votes[t] || 0) + 1; }
    let bt = -1, bv = 0; for (const k in votes) if (votes[k] > bv) { bv = votes[k]; bt = +k; } return bt;
  });
  // a clean merger-only era has eraAt(p) == grp[presAt(p)] almost everywhere (coastline-resolution mismatches are ignored: skip p where either side is ocean)
  let cons = 0, incons = 0, seed = 98765; const rnd2 = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  for (let k = 0; k < 9000; k++) { const lon = -180 + rnd2() * 360, lat = -58 + rnd2() * 130; const P = presAt(lon, lat); if (P < 0) continue; const T = eraAt(lon, lat); if (T < 0) continue; if (grp[P] === T) cons++; else incons++; }
  const consistency = (cons + incons) ? cons / (cons + incons) : 0;
  const mergerOnly = consistency >= 0.97 && (cons + incons) > 1000;

  // 4.6) WELD coast-junctions to the present-day coastline. A geo era draws only its INTERIOR borders and lets world.js draw
  // the coast (coastEdges), so where an interior border meets the sea it terminates at the era's OWN (offset/historical) shore
  // — leaving the border end floating off the drawn present-day coast ("stray lines that don't connect"). Snap each junction
  // vertex (where a drawn '0' edge meets a skipped '1' coast edge on a ring) onto the nearest present-day coast vertex within
  // EPS, so the interior border ends exactly on the drawn coastline. No doubles: coast edges stay skipped — only junctions move;
  // shared junctions snap by quantized key so both neighbours move identically (the shared interior edge stays bit-identical).
  // (Junctions with NO present coast within EPS — e.g. the dried Aral Sea, a sea that became land — are left as-is.)
  if (!mergerOnly) {
    const wdir = new Set();
    for (const g of WGEO) for (const r of g.p) for (let i = 0; i + 1 < r.length; i++) wdir.add(K(r[i]) + "|" + K(r[i + 1]));
    const cellsC = new Map(), ckC = (x, y) => Math.floor(x * 2) + "," + Math.floor(y * 2);
    for (const g of WGEO) for (const r of g.p) for (let i = 0; i + 1 < r.length; i++) { if (!wdir.has(K(r[i + 1]) + "|" + K(r[i]))) { const p = r[i], c = ckC(p[0], p[1]); let a = cellsC.get(c); if (!a) { a = []; cellsC.set(c, a); } a.push(p); } }
    const EPS = 0.6, EPS2 = EPS * EPS;
    const nearestCoast = (p) => { let best = null, bd = EPS2; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const arr = cellsC.get((Math.floor(p[0] * 2) + a) + "," + (Math.floor(p[1] * 2) + b)); if (!arr) continue; for (const q of arr) { const d = (q[0] - p[0]) * (q[0] - p[0]) + (q[1] - p[1]) * (q[1] - p[1]); if (d < bd) { bd = d; best = q; } } } return best; };
    const snapTo = new Map();
    for (const t of geo) for (let ri = 0; ri < t.p.length; ri++) { const r = t.p[ri], m = t.c[ri] || "", n = r.length - 1; if (n < 2) continue;
      for (let i = 0; i < n; i++) { if ((m.charCodeAt((i - 1 + n) % n) === 49) === (m.charCodeAt(i) === 49)) continue;   // not an interior↔coast transition
        const key = K(r[i]); if (snapTo.has(key)) continue; const tgt = nearestCoast(r[i]); if (tgt) snapTo.set(key, tgt); } }
    let welded = 0;
    for (const t of geo) for (const r of t.p) for (let i = 0; i < r.length; i++) { const tgt = snapTo.get(K(r[i])); if (tgt) { r[i][0] = tgt[0]; r[i][1] = tgt[1]; welded++; } }
    if (welded) console.log("welded " + welded + " coast-junction vertices onto the present-day coastline");
  }

  // 5) merge into timeline.js (replace a prior import of this snapshot), keep sorted by year
  const TL = path.join(__dirname, "..", "timeline.js");
  global.window = {}; require(TL);
  let list = Array.isArray(global.window.TIMELINE) ? global.window.TIMELINE : [];
  const yr = Math.min(new Date().getFullYear(), snap);   // snap is already ≥ -1000 (filtered above), so no floor-clamp collision
  list = list.filter((e) => !(e && e.src === "historical-basemaps" && e.year === yr));
  const id = "era_" + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);
  const label2 = label || ("The world in " + (snap < 0 ? (-snap + " BCE") : snap));
  let era;
  if (mergerOnly) {   // store the grouping (present-country name → group name); the renderer reuses world.js geometry
    const members = {};   // era territory index → present-day countries that fall in it
    for (let i = 0; i < WGEO.length; i++) { if (!WGEO[i].n) continue; const t = grp[i]; if (t >= 0) (members[t] = members[t] || []).push(i); }
    const groups = {};
    for (let i = 0; i < WGEO.length; i++) {
      if (!WGEO[i].n) continue;
      const t = grp[i];
      // genuine merger (2+ present countries in one era territory) → use the era-territory name; otherwise (self-map / ungrouped)
      // KEEP the present-day name, so the click popup shows the familiar name AND finds its description (countries.js is keyed by world.js names).
      groups[WGEO[i].n] = (t >= 0 && eraTerr[t] && eraTerr[t].n && members[t] && members[t].length > 1) ? eraTerr[t].n : WGEO[i].n;
    }
    era = { id: id, year: yr, n: label2, src: "historical-basemaps", groups: groups };
  } else {
    era = { id: id, year: yr, n: label2, src: "historical-basemaps", geo: geo };
  }
  list.push(era);
  list.sort((a, b) => a.year - b.year);
  const out = "/* Historical border eras for the Atlas globe timeline (Edit → Timeline).\n" +
    "   Vector eras built by .claude/build-era.js from historical-basemaps (https://github.com/aourednik/historical-basemaps, CC-BY-SA 4.0).\n" +
    "   Per-era EITHER `groups` { presentCountryName: eraTerritoryName } (merger-only eras → renderer reuses world.js high-res\n" +
    "   geometry, grouping the listed countries) OR `geo` [ { n, p:[rings], c:[per-ring interior/coast mask] } ]. Do not hand-edit. */\n" +
    "window.TIMELINE = " + JSON.stringify(list) + ";\n";
  fs.writeFileSync(TL, out);
  delete require.cache[require.resolve(TL)]; global.window = {}; require(TL);
  const intPct = edgeN ? (edgeN - coastN) / edgeN : 0;
  if (mergerOnly) {
    console.log("era " + yr + ": MERGER-ONLY (vs today consistency " + (100 * consistency).toFixed(1) + "%) → stored as a grouping of " + Object.keys(era.groups).length + " present-day countries; borders render from world.js at full 2026 resolution. timeline.js now holds " + global.window.TIMELINE.length + " era(s), " + (fs.statSync(TL).size / 1024 | 0) + " KB.");
  } else {
    if (intPct < 0.08) console.warn("⚠ only " + (100 * intPct).toFixed(1) + "% interior edges — this snapshot may not be topologically clean; interior borders could be gappy. Eyeball it.");
    console.log("era " + yr + ": " + geo.length + " territories, " + pts + " points (vs-today consistency " + (100 * consistency).toFixed(1) + "% → kept own geometry), edges " + edgeN + " (" + coastN + " coastal, " + (edgeN - coastN) + " interior). timeline.js now holds " + global.window.TIMELINE.length + " era(s), " + (fs.statSync(TL).size / 1024 | 0) + " KB.");
  }
})();
