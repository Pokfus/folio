#!/usr/bin/env node
/* build-land-changes.js — the DATED LAND-CHANGE LAYER (2026-10-18; docs/atlas-v2-historical-coastlines.md §1,
   docs/atlas-v2-build.md step 5b).

     node .claude/atlas-build/build-land-changes.js [--fetch] [--install] [--dry] [--check]     (from the repo root)

   WHAT IT IS. The Atlas draws ONE present-day coast (OSM) at every year of its range. land-changes.json lists areas that
   were WATER until a sourced year (the Zuiderzee polders first): each is a patch the renderer lays over the land, in the
   lake colour with a shore, in every year from `from` to `to`. This script turns the spec into atlas/data/land-changes.js
   (`window.ATLAS_LAND_CHANGES`: the rows with their years, sources and rings — quantised lon/lat like topology.bin, outer
   rings counter-clockwise and holes clockwise in the lon/lat plane, so the worker's signed-area rule classes them).

   THE GEOMETRY. A row's `geometry.units` names CBS 2024 districts (wijken) or neighbourhoods (buurten) by municipality and
   name — "all-land" for every unit whose `water` flag is NEE, with `except` names — on PDOK's WFS (CC0, the licence text is
   quoted in the spec). `--fetch` asks the service (one bbox query per layer, EPSG:4326), unions each row's units at full
   resolution (polygon-clipping) and writes land-changes-source.json: the unioned rings per row, the unit codes and land
   areas used, the request URLs, the retrieval date and the sha256 of each raw answer. That cache IS COMMITTED, so the
   build is reproducible offline and `--check` is exact (CI's fast job). Without `--fetch` the cache is read as it is.

   THE SIMPLIFICATION. The union's rings are quantised (lib/rings.js, 2.5e-4°) and simplified by Visvalingam at the tile
   levels' finest tolerance, 75 m (`TOL_M`: half a pixel at the 0.15 km/px cap), then rings under `MIN_RING_KM2` are dropped
   (a sliver the union left between two units). A row's area is measured after that and written on the row.
   WHERE EACH STEP RUNS. Everything that needs polygon-clipping — the union, the filters, the simplification and the lake-side
   extension (below) — runs at --fetch and its result, the finished quantised rings per row, is what the cache holds; the build
   proper (and CI's --check, which runs without the build's node_modules) only classes the cached rings' edges and writes the file.

   --install copies the file to atlas/data/land-changes.js and regenerates credits.js; --dry prints the sizes; --check
   regenerates in memory and compares with the committed file (exit 1 when it lags the spec or the cache). */
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const { spawnSync } = require("child_process");
const R = require("./lib/rings.js");

const HERE = __dirname, ROOT = path.resolve(HERE, "..", "..");
const SPEC = path.join(HERE, "land-changes.json"), CACHE = path.join(HERE, "land-changes-source.json");
const TARGET = path.join(ROOT, "atlas", "data", "land-changes.js");
const TOL_M = 75, MIN_RING_KM2 = 0.05;
/* THE STRAY LINES OF THE IJSSELMEER (2026-10-18, the owner's phone: "stray lines and double outlines in the sea" at 1660 CE). The strips that push a row's lake-side edges out to the drawn
   shore are unioned into the row at --fetch, and the union left what the first MIN_RING_KM2 filter (before the union) had already removed: 20 of the 34 rings of the rows were
   under 0.05 km², three of them single triangles — each a speck of present-day LAND inside a water patch (a hole) or a speck of water (an outer ring), drawn at 1660 as a stray dot or
   line with its own outline; a further hole, the strip between the Noordoostpolder's Ketelmeer dyke and the water, is 99 m wide. Three rules, applied to the cached rings here and after
   the union at --fetch (cleanRings, trimShoreRuns), each a stated number:
     · every ring is at least MIN_RING_KM2 (0.05 km²) — a hole smaller than that is a speck, not an island of the old sea;
     · a HOLE (land left inside a water patch) is at least MIN_ISLAND_WIDTH_M (150 m) wide on average (2 × area ÷ perimeter): the dykes of the Zuiderzee works are under that (the
       Afsluitdijk is 90 m, the Noordoostpolder's Ketelmeer dyke 99 m), the islands the old sea had are over it (Schokland 394 m, Urk beyond the row's edge). A thin OUTER ring is
       kept: it is the Houtribdijk, a strip of land the patch turns to water in the years the dyke did not exist;
     · a run of shore edges (edges against old land or against another row, the only ones stroked) shorter than MIN_SHORE_RUN_M (1.5 km, ten pixels at the zoom cap) is not stroked — an isolated edge is a stray line, not a coast: the fragments are the notches the CBS polygon leaves between the polder and the drawn lake shore (the combs at Ketelhaven, the commas off Elburg).
   An outer ring dropped takes its holes with it. docs/atlas-v2-historical-coastlines.md §1.3. */
const MIN_ISLAND_WIDTH_M = 150, MIN_SHORE_RUN_M = 1500;
const BBOX = "52.2,4.6,53.1,6.2,EPSG:4326";   // the Zuiderzee and its shores (lat,lon order: the WFS's EPSG:4326 axis order)
const UA = "folio-atlas-build/1.0 (https://folio.study)";
const PAGE = 1000;

const spec = JSON.parse(fs.readFileSync(SPEC, "utf8"));

/* ---------- --fetch: the units from PDOK, unioned per row ---------- */
function wfsUrl(layer) {
  const q = { request: "GetFeature", service: "WFS", version: "2.0.0", typeName: "wijkenbuurten:" + layer, outputFormat: "json", srsName: "EPSG:4326", count: String(PAGE),
    propertyName: (layer === "wijken" ? "wijkcode,wijknaam" : "buurtcode,buurtnaam") + ",gemeentecode,gemeentenaam,water,oppervlakteLandInHa,geom", bbox: BBOX };
  return spec.geometrySource.url + "?" + Object.entries(q).map(([k, v]) => k + "=" + encodeURIComponent(v)).join("&");
}
function fetchLayer(layer) {
    const features = [], pages = [], seen = new Set(), codeKey = layer === "wijken" ? "wijkcode" : "buurtcode"; let start = 0, url0 = null;
  for (;;) {
    const url = wfsUrl(layer) + "&startIndex=" + start; if (url0 == null) url0 = url;
    const r = spawnSync("curl", ["-sS", "-m", "180", "-A", UA, url], { encoding: "buffer", maxBuffer: 1 << 28 });
    if (r.status !== 0) throw new Error("curl failed for " + layer + ": " + (r.stderr || "").toString());
    const fc = JSON.parse(r.stdout.toString("utf8"));
    pages.push({ startIndex: start, sha256: crypto.createHash("sha256").update(r.stdout).digest("hex"), bytes: r.stdout.length, features: (fc.features || []).length });
    // the service's pages hold up to 1,000 features but not exactly (988, 999 … measured 2026-10-18) and its numberMatched counts
    // the pages so far, so the walk ends at the first EMPTY page; a feature met twice is kept once
    for (const f of fc.features || []) if (!seen.has(f.properties[codeKey])) { seen.add(f.properties[codeKey]); features.push(f); }
    if (!fc.features || !fc.features.length) break;
    start += PAGE;
  }
  if (!features.length) throw new Error("no features for " + layer);
  return { url: url0, pages, sha256: pages.map((p) => p.sha256).join(","), bytes: pages.reduce((s, p) => s + p.bytes, 0), features };
}
const polysOf = (f) => f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.type === "MultiPolygon" ? f.geometry.coordinates : [];
function selectUnits(unit, features) {
  const nameKey = unit.layer === "wijken" ? "wijknaam" : "buurtnaam", codeKey = unit.layer === "wijken" ? "wijkcode" : "buurtcode";
  const except = new Set(unit.except || []);
  const pick = features.filter((f) => f.properties.gemeentenaam === unit.gemeentenaam && (unit.names === "all-land" ? f.properties.water === "NEE" && !except.has(f.properties[nameKey]) : unit.names.includes(f.properties[nameKey])));
  if (unit.names !== "all-land") for (const n of unit.names) if (!pick.some((f) => f.properties[nameKey] === n)) throw new Error(unit.gemeentenaam + ": no " + unit.layer.slice(0, -1) + " named " + JSON.stringify(n));
  if (!pick.length) throw new Error(unit.gemeentenaam + ": no units selected");
  return pick.map((f) => ({ code: f.properties[codeKey], name: f.properties[nameKey], water: f.properties.water, land_ha: f.properties.oppervlakteLandInHa, polys: polysOf(f) }));
}
function doFetch() {
  const pc = require("polygon-clipping");
  const retrieved = new Date().toISOString().slice(0, 10);
  const layers = {};
  for (const layer of ["wijken", "buurten"]) { layers[layer] = fetchLayer(layer); console.log(`  ${layer}: ${layers[layer].features.length} features, ${layers[layer].bytes} bytes, sha256 ${layers[layer].sha256.slice(0, 12)}…`); }
  const rows = {}, rawUnion = {};
  for (const row of spec.rows) {
    if (row.geometry.from) continue;   // another row's union, filtered below
    const units = [], geoms = [];
    for (const u of row.geometry.units) for (const s of selectUnits(u, layers[u.layer].features)) { units.push({ layer: u.layer, code: s.code, name: s.name, gemeentenaam: u.gemeentenaam, land_ha: s.land_ha }); geoms.push(s.polys); }
    const union = pc.union(...geoms);   // MultiPolygon: [ [outer, hole…], … ], exterior counter-clockwise, holes clockwise
    rawUnion[row.id] = union;
    rows[row.id] = { units, land_ha: units.reduce((s, u) => s + (u.land_ha > 0 ? u.land_ha : 0), 0) };
    console.log(`  ${row.id}: ${units.length} units, ${rows[row.id].land_ha} ha of land, ${union.length} polygon(s), ${union.reduce((s, p) => s + p.reduce((t, r) => t + r.length, 0), 0)} vertices`);
  }
  for (const row of spec.rows) if (row.geometry.from) { if (!rawUnion[row.geometry.from]) throw new Error(row.id + ": `from` names no unit row"); rows[row.id] = { units: [], land_ha: 0, from: row.geometry.from }; }
  // the CBS WATER units ("Groot water", water = JA) of every municipality a row draws on: what lies outside a dyke is water by the
  // source's own partition, which is how the build tells a lake-side edge (no shore, pushed out to the drawn lake) from the old coast
  // (every municipality's in the box, since a randmeer's far half is the neighbour's water; simplified like the rows, 75 m, so the cache stays small)
  const water = {}; let wv = 0;
  for (const g of new Set(layers.wijken.features.map((f) => f.properties.gemeentenaam))) {
    const w = layers.wijken.features.filter((f) => f.properties.gemeentenaam === g && f.properties.water === "JA");
    if (!w.length) continue;
    const union = pc.union(...w.map(polysOf));
    const polygons = union.map((poly) => poly.map((ring) => simplifyRing(ring)).filter(Boolean)).filter((poly) => poly.length);
    if (!polygons.length) continue;
    water[g] = { units: w.map((f) => ({ code: f.properties.wijkcode, name: f.properties.wijknaam })), polygons };
    wv += polygons.reduce((s, p) => s + p.reduce((t, r) => t + r.length, 0), 0);
  }
  console.log(`  water units: ${Object.keys(water).length} municipalities, ${wv} vertices after simplification`);
  /* THE RINGS, FINISHED HERE (so the offline build and CI's --check need no library): each row's polygons (the `from` / polygonsWithin /
     polygonsOutside filters applied), simplified at TOL_M and quantised, classed edge by edge against the drawn lake and the CBS water,
     its lake-side edges pushed out to the drawn shore (polygon-clipping), and the result stored as quantised rings. */
  const built = spec.rows.map((row) => { const base = rawUnion[row.geometry.from || row.id]; const r = { id: row.id, rings: ringsFromUnion(row, base) }; return r; });
  const lakes = lakeRingsNear(built);
  const first = classifyEdges(built, lakes, water);
  extendRows(built, first.strips);
  for (const r of built) r.rings = cleanRings(r.rings).map((x) => x.slice());   // the strips' union leaves specks: the same rules as the build's
  for (const r of built) { rows[r.id].rings = r.rings; rows[r.id].extendedEdges = (first.strips[r.id] || []).length; console.log(`  ${r.id}: ${r.rings.length} ring(s), ${r.rings.reduce((t, x) => t + x.length / 2, 0)} vertices, ${(first.strips[r.id] || []).length} lake-side edges pushed out`); }
  const cache = { _about: "GENERATED by build-land-changes.js --fetch: each row's units of land-changes.json, fetched from PDOK and unioned at full resolution. Committed so the build is reproducible offline. Re-run --fetch to refresh (a new CBS edition changes the URL in land-changes.json first).",
    source: spec.geometrySource.id, retrieved, requests: Object.fromEntries(Object.entries(layers).map(([k, v]) => [k, { url: v.url, pages: v.pages, bytes: v.bytes, features: v.features.length }])), rows, water };
  fs.writeFileSync(CACHE, JSON.stringify(cache));
  console.log(`wrote ${path.relative(ROOT, CACHE)} (${fs.statSync(CACHE).size} bytes)`);
}

/* ---------- the build: cache → simplified, quantised rings ---------- */
function simplifyRing(ring) {
  let pts = ring.map((p) => R.qpt(p, null, 0));
  if (pts.length > 1 && R.eqPt(pts[0], pts[pts.length - 1])) pts.pop();
  pts = R.dedupeRing(pts); R.cutSpikes(pts);
  if (pts.length < 3) return null;
  const ar = R.visvalingam(pts.map((p) => p[0]), pts.map((p) => p[1]), true);
  const keep = pts.filter((p, i) => ar[i] >= TOL_M * TOL_M);
  if (keep.length < 3) return null;
  const out = R.dedupeRing(keep); if (out.length < 3) return null;
  return out;
}
/* ---------- the shore, by edge: what lies OUTSIDE each edge of a row's rings ----------
   The renderer strokes a patch's boundary only where the Zuiderzee had a coast in that year: against the old land. Against the
   present-day lake (the IJsselmeer, the Markermeer, the randmeren, the Ketelmeer — the lake faces of the committed water tile at
   250 m, the finest shoreline that ships) there is no line, and against another row there is one only in a year that row is dry
   (the Knardijk, 1957–1967). Each edge is classed by a point OUT_M to its right (outside: outer rings run counter-clockwise, holes
   clockwise): inside another row → 2 + that row's index; inside a drawn lake face or inside a CBS WATER unit ("Groot water", the
   source's own land/water partition, cached with the rows) → 0; else 1 (old land).
   THE GAP. HydroLAKES draws the IJsselmeer's shore 0.3–1.1 km inside the dykes (measured 2026-10-18 against the CBS lines), so
   between a patch and the drawn lake a rim of present-day land would show in a water year — up to six pixels at the zoom cap.
   So every lake-side edge whose outside point is NOT yet inside the drawn lake is pushed out: a strip as long as the edge and
   as deep as the gap to the nearest drawn shore plus GAP_PAD_M (at most GAP_MAX_M) is unioned into the row, and the edges are
   classed again. The strip lies over the lake's own water in the renderer, so it changes nothing but the rim. A sea outside
   (OSM's partition) is not tested: no row of the spec borders the sea; a row that does would need lib/landindex.js here. */
const OUT_M = 120, GAP_PAD_M = 120, GAP_MAX_M = 1300;
const Z4 = { cols: 32, rows: 16, deg: 11.25 };
function lakeRingsNear(rows) {
  const F = require("./lib/format.js");
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const r of rows) for (const ring of r.rings) for (let i = 0; i < ring.length; i += 2) { x0 = Math.min(x0, ring[i]); x1 = Math.max(x1, ring[i]); y0 = Math.min(y0, ring[i + 1]); y1 = Math.max(y1, ring[i + 1]); }
  const pad = Math.round(0.05 / R.QUANTUM); x0 -= pad; y0 -= pad; x1 += pad; y1 += pad;
  const tiles = new Set(); const q = R.QUANTUM;
  for (const [x, y] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1]]) tiles.add(Math.floor((x * q + 180) / Z4.deg) + "-" + Math.floor((y * q + 90) / Z4.deg));
  const faces = [];
  for (const key of tiles) {
    const file = path.join(ROOT, "atlas", "data", "water", key + ".bin"); if (!fs.existsSync(file)) continue;
    const W = F.readFile(file); if (W.quantum !== q) throw new Error("water tile quantum " + W.quantum);
    for (const f of W.faces) {
      const rings = []; let bx0 = 1e9, by0 = 1e9, bx1 = -1e9, by1 = -1e9;
      for (const refs of f.rings) { const pts = []; for (const ref of refs) { const a = Math.abs(ref) - 1; if (W.arcKind[a] === 6) { /* a tile-edge chord closes the ring, never a shore */ } for (let i = W.arcOffset[a]; i < W.arcOffset[a + 1]; i++) { pts.push([W.lon[i], W.lat[i], W.arcKind[a] === 6 ? 1 : 0]); bx0 = Math.min(bx0, W.lon[i]); bx1 = Math.max(bx1, W.lon[i]); by0 = Math.min(by0, W.lat[i]); by1 = Math.max(by1, W.lat[i]); } } rings.push(pts); }
      if (bx1 < x0 || bx0 > x1 || by1 < y0 || by0 > y1) continue;
      faces.push(rings);
    }
  }
  return { faces, tiles: [...tiles] };
}
const insideRings = (x, y, rings) => { let c = false; for (const r of rings) for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const xi = r[i][0], yi = r[i][1], xj = r[j][0], yj = r[j][1]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
const toRings = (row) => row.rings.map((f) => { const pts = []; for (let i = 0; i < f.length; i += 2) pts.push([f[i], f[i + 1]]); return pts; });
function classifyEdges(rows, lakes, cbsWater) {
  const faces = lakes.faces;
  // the CBS water units as quantised rings (every municipality's, together), for "is the outside water by the source's own partition"
  const waterRings = []; for (const g of Object.keys(cbsWater || {})) for (const poly of cbsWater[g].polygons) for (const ring of poly) waterRings.push(ring);   // quantised at --fetch
  const mPerUnitY = 111320 * R.QUANTUM, cosLat = Math.cos(52.6 * Math.PI / 180), mPerUnitX = mPerUnitY * cosLat;
  const rowRings = rows.map(toRings);
  // metres from (x, y) to the nearest drawn shore (a tile-edge chord is not a shore), or Infinity
  const shoreDist = (x, y, within) => { const rx = within / mPerUnitX, ry = within / mPerUnitY; let best = Infinity; for (const rings of faces) for (const r of rings) for (let i = 0, j = r.length - 1; i < r.length; j = i++) { if (r[i][2] && r[j][2]) continue; const ax = r[j][0], ay = r[j][1], bx = r[i][0], by = r[i][1]; if (Math.max(ax, bx) < x - rx || Math.min(ax, bx) > x + rx || Math.max(ay, by) < y - ry || Math.min(ay, by) > y + ry) continue; const dx = (bx - ax) * mPerUnitX, dy = (by - ay) * mPerUnitY, px = (x - ax) * mPerUnitX, py = (y - ay) * mPerUnitY; const t = Math.max(0, Math.min(1, (px * dx + py * dy) / (dx * dx + dy * dy || 1))); const d = Math.hypot(px - t * dx, py - t * dy); if (d < best) best = d; } return best; };
  const counts = {}, strips = {};
  rows.forEach((row, ri) => {
    row.edges = rowRings[ri].map((pts) => pts.map((a, i) => {
      const b = pts[(i + 1) % pts.length];
      const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      let dx = (b[0] - a[0]) * mPerUnitX, dy = (b[1] - a[1]) * mPerUnitY; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      const nx = dy / mPerUnitX, ny = -dx / mPerUnitY;   // the outward normal (to the right of a → b), in units per metre
      const ox = mx + nx * OUT_M, oy = my + ny * OUT_M;
      let code = 1;
      for (let k = 0; k < rows.length; k++) if (k !== ri && insideRings(ox, oy, rowRings[k])) { code = 2 + k; break; }
      if (code === 1) {
        const inLake = faces.some((rings) => insideRings(ox, oy, rings)), inWater = inLake || insideRings(ox, oy, waterRings);
        if (inWater) code = 0;
        if (inWater && !inLake) { const gap = shoreDist(ox, oy, GAP_MAX_M); if (isFinite(gap)) { const D = Math.min(GAP_MAX_M, gap + OUT_M + GAP_PAD_M); (strips[row.id] = strips[row.id] || []).push([[a, b, [b[0] + nx * D, b[1] + ny * D], [a[0] + nx * D, a[1] + ny * D], a]]); } }
      }
      counts[row.id] = counts[row.id] || {}; counts[row.id][code] = (counts[row.id][code] || 0) + 1;
      return code;
    }));
  });
  return { counts, strips };
}
// the strips unioned into the row (polygon-clipping, in quantised units), the rings re-oriented and re-flattened; returns the count of strips
function extendRows(rows, strips) {
  const pc = require("polygon-clipping");
  let n = 0;
  for (const row of rows) {
    const S = strips[row.id]; if (!S || !S.length) continue;
    n += S.length;
    const poly = []; let cur = null;
    for (const pts of toRings(row)) { const { area } = R.ringAreaAndTurn(pts); const closed = pts.concat([pts[0]]); if (area > 0) { cur = [closed]; poly.push(cur); } else if (cur) cur.push(closed); }
    const u = pc.union(poly, ...S);
    const rings = [];
    for (const p of u) p.forEach((ring, ri) => { const pts = ring.slice(0, -1).map((v) => [Math.round(v[0]), Math.round(v[1])]); const out = R.dedupeRing(pts); if (out.length < 3) return; const { area } = R.ringAreaAndTurn(out); if ((ri === 0) !== (area > 0)) out.reverse(); rings.push(out); });
    row.rings = rings.map((r) => r.flat());
    let area = 0; for (const r of rings) area += km2(r); row.area_km2 = Math.round(area * 10) / 10;
  }
  return n;
}
// a row's quantised, simplified, oriented rings from a raw union (lon/lat MultiPolygon), with the spec's polygon filters applied
function ringsFromUnion(row, union) {
  const inBox = (poly, b) => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const p of poly[0]) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); } return x0 >= b[0] && y0 >= b[1] && x1 <= b[2] && y1 <= b[3]; };
  const g = row.geometry;
  const polygons = union.filter((poly) => (!g.polygonsWithin || inBox(poly, g.polygonsWithin.bbox)) && !(g.polygonsOutside && inBox(poly, g.polygonsOutside.bbox)));
  if (g.polygonsWithin && !polygons.length) throw new Error(row.id + ": no polygon of " + (g.from || row.id) + " lies within " + JSON.stringify(g.polygonsWithin.bbox));
  const rings = [];
  for (const poly of polygons) {
    const outer = simplifyRing(poly[0]); if (!outer) continue;
    let a = km2(outer); if (a < 0) { outer.reverse(); a = -a; }
    if (a < MIN_RING_KM2) continue;
    rings.push(outer.flat());
    for (const h of poly.slice(1)) { const hole = simplifyRing(h); if (!hole) continue; let ha = km2(hole); if (ha > 0) { hole.reverse(); ha = -ha; } if (-ha < MIN_RING_KM2) continue; rings.push(hole.flat()); }
  }
  if (!rings.length) throw new Error(row.id + ": no ring survived");
  return rings;
}
const metresOf = (pts) => { const lat = pts.reduce((t, p) => t + p[1], 0) / pts.length * R.QUANTUM, kx = 111320 * Math.cos(lat * Math.PI / 180) * R.QUANTUM, ky = 111320 * R.QUANTUM; let per = 0; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; per += Math.hypot((b[0] - a[0]) * kx, (b[1] - a[1]) * ky); } return per; };
/* the rings of one row (flat quantised, an outer ring then its holes) without its specks and dykes (the rules above); returns the kept rings and a count of what went */
function cleanRings(flat) {
  const out = []; const gone = { small: 0, thin: 0 }; let outerKept = true;
  for (const f of flat) {
    const pts = []; for (let i = 0; i < f.length; i += 2) pts.push([f[i], f[i + 1]]);
    const a = km2(pts), hole = a < 0, area = Math.abs(a);
    if (!hole) { outerKept = area >= MIN_RING_KM2; if (!outerKept) { gone.small++; continue; } out.push(f); continue; }
    if (!outerKept) { gone.small++; continue; }
    if (area < MIN_RING_KM2) { gone.small++; continue; }
    if ((2 * area * 1e6) / metresOf(pts) < MIN_ISLAND_WIDTH_M) { gone.thin++; continue; }
    out.push(f);
  }
  out.gone = gone; return out;
}
/* an isolated run of shore edges is no shore: `row.edges[ring][edge]` → 0 for every maximal (cyclic) run of one non-zero code shorter than MIN_SHORE_RUN_M on a ring that has other edges too */
function trimShoreRuns(row) {
  const rings = toRings(row); let trimmed = 0;
  rings.forEach((pts, ri) => {
    const codes = row.edges[ri], n = codes.length; if (codes.every((c) => c === codes[0] && c !== 0)) return;   // a ring with one shore all round (an island) is kept whole
    const len = pts.map((a, i) => metresOf([a, pts[(i + 1) % n]]) / 2);
    const start = codes.findIndex((c, i) => c !== codes[(i + n - 1) % n]); if (start < 0) return;   // the first edge whose code differs from the one before it: every maximal run starts at or after it
    for (let k = 0; k < n;) {
      const c = codes[(start + k) % n]; let j = k, m = 0; const run = [];
      while (j < n && codes[(start + j) % n] === c) { run.push((start + j) % n); m += len[(start + j) % n]; j++; }
      if (c !== 0 && m < MIN_SHORE_RUN_M) { for (const e of run) codes[e] = 0; trimmed += run.length; }
      k = j;
    }
  });
  return trimmed;
}
const km2 = (pts) => { const { area } = R.ringAreaAndTurn(pts); const lat = pts.reduce((s, p) => s + p[1], 0) / pts.length * R.QUANTUM; return area * R.QUANTUM * R.QUANTUM * 111.32 * 111.32 * Math.cos(lat * Math.PI / 180); };
function build(opts) {
  if (!fs.existsSync(CACHE)) throw new Error("land-changes-source.json is missing — run with --fetch first");
  const cache = JSON.parse(fs.readFileSync(CACHE, "utf8"));
  if (cache.source !== spec.geometrySource.id) throw new Error("the cache was fetched from " + cache.source + ", the spec names " + spec.geometrySource.id + " — run --fetch");
  const rows = [], gone = { small: 0, thin: 0, trimmed: 0 };
  let vertices = 0;
  for (const row of spec.rows) {
    const c0 = cache.rows[row.id]; if (!c0 || !c0.rings) throw new Error(row.id + " is not in the cache (or the cache predates the rings) — run --fetch");
    const kept = cleanRings(c0.rings), c = Object.assign({}, c0, { rings: kept }); gone.small += kept.gone.small; gone.thin += kept.gone.thin;
    let area = 0; for (const f of c.rings) { const pts = []; for (let i = 0; i < f.length; i += 2) pts.push([f[i], f[i + 1]]); area += km2(pts); vertices += pts.length; }
    rows.push({ id: row.id, name: row.name, qid: row.qid, kind: row.kind, state: row.state, from: row.from, to: row.to, dry: row.dry, area_km2: Math.round(area * 10) / 10, units: c.units.length, land_ha: c.land_ha, dateSource: row.dateSource, accuracy: row.accuracy, rings: c.rings.map((r) => r.slice()), extended: c.extendedEdges || 0 });
  }
  const lakes = lakeRingsNear(rows);
  const edgeCounts = classifyEdges(rows, lakes, cache.water).counts;
  for (const row of rows) { const t = trimShoreRuns(row); gone.trimmed += t; if (t) { const c = {}; for (const ring of row.edges) for (const code of ring) c[code] = (c[code] || 0) + 1; edgeCounts[row.id] = c; } }   // the cached rings' lake-side edges already lie inside the drawn lake: no strip is made here
  const gs = spec.geometrySource;
  const sources = [
    { id: gs.id, name: gs.name, version: "2024 edition, fetched " + cache.retrieved + " (land-changes-source.json)", url: gs.url, licence: gs.licence, licenceUrl: gs.licenceUrl, attribution: gs.attribution, retrieved: cache.retrieved, sha256: cache.requests.wijken.pages.map((p) => p.sha256).join(",") },
    { id: "wikidata-land-changes", name: "Wikidata — the polders', the dam's, the lake's and the province's items (Q428517, Q69262, Q2482369, Q2199768, Q3073667, Q240960, Q4121, Q707, Q2547295): their dates and the Knardijk's coordinate", version: "read " + cache.retrieved + " through query.wikidata.org", url: "https://query.wikidata.org/", licence: "CC0", licenceUrl: "https://creativecommons.org/publicdomain/zero/1.0/", attribution: "Wikidata, CC0 1.0", retrieved: cache.retrieved, sha256: null },
  ];
  const table = { format: spec.format, generated: cache.retrieved, generator: "folio atlas-build: build-land-changes.js (" + require("./package.json").version + ")", quantum: R.QUANTUM, tolerance_m: TOL_M,
    note: "Dated patches over the present-day coast: each row is WATER (drawn in the lake colour, over the land) in every year from `from` (null = the Atlas's first year) to `to` inclusive; it fell dry in `dry`. Rings are quantised lon/lat pairs (× quantum), outer rings counter-clockwise and holes clockwise. `edges` gives one code per edge of each ring: 0 = the present-day lake lies outside (no shore drawn), 1 = old land (the shore of the day, drawn), 2 + k = row k of this table lies outside (drawn only in a year row k is dry). The years' sources are on the rows; the polders' dykes are the CBS units' land outlines (see each row's `accuracy`).",
    notDrawn: spec.notDrawn, rows };
  const body = "/* sources: " + JSON.stringify(sources) + " */\n" +
    "/* atlas/data/land-changes.js — GENERATED by .claude/atlas-build/build-land-changes.js from land-changes.json and land-changes-source.json\n" +
    "   (docs/atlas-v2-historical-coastlines.md §1). Do not edit. The dated land-change layer: areas that were water until a sourced year —\n" +
    "   the Zuiderzee polders — drawn over the present-day coast in the years before they fell dry. */\n" +
    "window.ATLAS_LAND_CHANGES = " + JSON.stringify(table) + ";\n";
  const bytes = Buffer.byteLength(body);
  if (opts.check) { const have = fs.existsSync(TARGET) ? fs.readFileSync(TARGET, "utf8") : ""; const ok = have === body; return { ok, why: ok ? "" : have ? "the committed file differs from what the spec and the cache build" : "atlas/data/land-changes.js is missing", rows, bytes, vertices, edgeCounts, gone }; }
  if (opts.install) {
    const same = fs.existsSync(TARGET) && fs.readFileSync(TARGET, "utf8") === body;
    if (!same) { fs.writeFileSync(TARGET, body); console.log("installed atlas/data/land-changes.js"); require("./build-credits.js").build({ install: true, log: () => {} }); console.log("regenerated atlas/data/credits.js"); } else console.log("atlas/data/land-changes.js unchanged");
  }
  return { ok: true, rows, bytes, vertices, edgeCounts, gone };
}

if (require.main === module) {
  const argv = process.argv.slice(2);
  try {
    if (argv.includes("--fetch")) doFetch();
    const r = build({ install: argv.includes("--install"), check: argv.includes("--check") });
    for (const row of r.rows) console.log(`  ${row.id.padEnd(24)} water to ${row.to}, dry ${row.dry}: ${row.rings.length} ring(s), ${row.rings.reduce((s, x) => s + x.length / 2, 0)} vertices, ${row.area_km2} km² (${row.units} CBS units, ${row.land_ha} ha of land)`);
    for (const row of r.rows) { const c = r.edgeCounts[row.id] || {}; console.log(`  ${row.id.padEnd(24)} edges: ${c[0] || 0} on the lake, ${c[1] || 0} on old land, ${Object.keys(c).filter((k) => k >= 2).map((k) => (c[k] || 0) + " on " + r.rows[k - 2].id).join(", ") || "none on another row"}`); }
    console.log(`  cleaned: ${r.gone.small} rings under ${MIN_RING_KM2} km², ${r.gone.thin} holes under ${MIN_ISLAND_WIDTH_M} m wide, ${r.gone.trimmed} shore edges in runs under ${MIN_SHORE_RUN_M} m`);
    console.log(`land-changes.js: ${r.rows.length} rows, ${r.vertices} vertices (${r.rows.reduce((t, row) => t + (row.extended || 0), 0)} lake-side edges pushed out to the drawn shore at --fetch), ${r.bytes} bytes`);
    if (argv.includes("--check")) { console.log(r.ok ? "atlas/data/land-changes.js is in step with land-changes.json and its cache" : "STALE: " + r.why + " — run: node .claude/atlas-build/build-land-changes.js --install"); process.exit(r.ok ? 0 : 1); }
  } catch (e) { console.error("build-land-changes: " + (e && e.message || e)); process.exit(1); }
}
module.exports = { build, cleanRings, trimShoreRuns, MIN_RING_KM2, MIN_ISLAND_WIDTH_M, MIN_SHORE_RUN_M };
