// Dev-only: build ranges.js (window.RANGES) from Natural Earth 10m geography region polygons.
// Mountain ranges (featurecla "Range/mtn"). Top ~100 by area. Each range stores a label centroid AND a field of
// "peak" points scattered across its actual extent, so the range is drawn onto the map (not just one icon).
// { n:name, c:[lon,lat] label, k:[[lon,lat],...] peaks }.
const fs = require("fs"); const path = require("path");
const URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_geography_regions_polys.geojson";
const round = (n) => Math.round(n * 100) / 100;
function ringCentroidArea(ring) {
  let a = 0, cx = 0, cy = 0;
  for (let i = 0, n = ring.length; i < n; i++) { const p = ring[i], q = ring[(i + 1) % n]; const cr = p[0] * q[1] - q[0] * p[1]; a += cr; cx += (p[0] + q[0]) * cr; cy += (p[1] + q[1]) * cr; }
  a *= 0.5; if (Math.abs(a) < 1e-9) { let sx = 0, sy = 0; for (const p of ring) { sx += p[0]; sy += p[1]; } return { c: [sx / ring.length, sy / ring.length], area: 0 }; }
  return { c: [cx / (6 * a), cy / (6 * a)], area: Math.abs(a) };
}
function inside(x, y, ring) {
  let c = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1]; if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) c = !c; }
  return c;
}
function bbox(ring) { let a = 180, b = 90, d = -180, e = -90; for (const p of ring) { if (p[0] < a) a = p[0]; if (p[0] > d) d = p[0]; if (p[1] < b) b = p[1]; if (p[1] > e) e = p[1]; } return [a, b, d, e]; }
function scatter(outer, peaks, cap) {                      // jittered grid of interior points
  const bb = bbox(outer), w = bb[2] - bb[0], h = bb[3] - bb[1], diag = Math.hypot(w, h);
  const step = Math.min(1.5, Math.max(0.25, diag / 9));
  for (let yy = bb[1] + step * 0.5; yy < bb[3]; yy += step) for (let xx = bb[0] + step * 0.5; xx < bb[2]; xx += step) {
    const jx = xx + (Math.random() - 0.5) * step * 0.7, jy = yy + (Math.random() - 0.5) * step * 0.7;
    if (inside(jx, jy, outer)) peaks.push([round(jx), round(jy)]);
  }
  return cap;
}
(async () => {
  console.log("fetching", URL); const r = await fetch(URL); console.log("HTTP", r.status); if (!r.ok) process.exit(1);
  const gj = JSON.parse(Buffer.from(await r.arrayBuffer()).toString("utf8")); console.log("features", gj.features.length);
  const key = (o, ns) => { for (const n of ns) if (o[n] !== undefined && o[n] !== null) return o[n]; return undefined; };
  const out = [];
  for (const f of gj.features) {
    const p = f.properties || {}, fcla = (key(p, ["featurecla", "FEATURECLA"]) || "") + "";
    if (!/Range\/mtn/i.test(fcla)) continue;
    const name = key(p, ["name", "name_en", "NAME"]); if (!name || !f.geometry) continue;
    const polys = f.geometry.type === "MultiPolygon" ? f.geometry.coordinates : f.geometry.type === "Polygon" ? [f.geometry.coordinates] : [];
    let best = null, peaks = [];
    for (const poly of polys) { const ca = ringCentroidArea(poly[0]); if (!best || ca.area > best.area) best = ca; scatter(poly[0], peaks, 0); }
    if (!best) continue;
    const bb = bbox(polys.reduce((a, poly) => a.concat(poly[0]), [])), cap = Math.round(Math.min(90, Math.max(6, Math.hypot(bb[2] - bb[0], bb[3] - bb[1]) * 5)));
    if (peaks.length > cap) { const st = peaks.length / cap, sub = []; for (let i = 0; i < peaks.length; i += st) sub.push(peaks[Math.floor(i)]); peaks = sub; }   // even subsample
    if (!peaks.length) peaks.push([round(best.c[0]), round(best.c[1])]);
    out.push({ n: name, c: [round(best.c[0]), round(best.c[1])], k: peaks, area: best.area });
  }
  out.sort((a, b) => b.area - a.area);
  const top = out.slice(0, 100).map((m) => ({ n: m.n, c: m.c, k: m.k }));
  const totalPeaks = top.reduce((s, m) => s + m.k.length, 0);
  const js = "/* Top 100 mountain ranges (Natural Earth 10m, Range/mtn). { n:name, c:[lon,lat] label, k:[[lon,lat]] peaks }. */\nwindow.RANGES = " + JSON.stringify(top) + ";\n";
  fs.writeFileSync(path.join(__dirname, "..", "ranges.js"), js);
  console.log("ranges", top.length, "peaks", totalPeaks, "bytes", Buffer.byteLength(js), "| top:", top.slice(0, 12).map((m) => m.n + "(" + m.k.length + ")").join(", "));
})().catch((e) => { console.log("ERR", e.stack || e.message); process.exit(1); });
