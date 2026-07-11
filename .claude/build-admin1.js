// Dev-only: build admin1.js (window.ADMIN1) from Natural Earth 10m admin-1 BOUNDARY LINES.
// The lines dataset deduplicates shared province borders (each drawn once), so the dotted lines on the globe
// don't double up into a solid line the way the polygon outlines did. { b:[ polyline,... ] } (l kept empty).
const fs = require("fs"); const path = require("path");
const URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces_lines.geojson";
const round = (n) => Math.round(n * 100) / 100;
function dp(pts, tol) {
  const n = pts.length; if (n < 3) return pts;
  const keep = new Uint8Array(n); keep[0] = 1; keep[n - 1] = 1; const t2 = tol * tol, st = [[0, n - 1]];
  while (st.length) { const [a, b] = st.pop(); let md = -1, mi = -1; const ax = pts[a][0], ay = pts[a][1], dx = pts[b][0] - ax, dy = pts[b][1] - ay, L = dx * dx + dy * dy || 1e-12;
    for (let i = a + 1; i < b; i++) { const px = pts[i][0] - ax, py = pts[i][1] - ay; let t = (px * dx + py * dy) / L; t = t < 0 ? 0 : t > 1 ? 1 : t; const cx = px - t * dx, cy = py - t * dy, d = cx * cx + cy * cy; if (d > md) { md = d; mi = i; } }
    if (md > t2) { keep[mi] = 1; st.push([a, mi], [mi, b]); } }
  const out = []; for (let i = 0; i < n; i++) if (keep[i]) out.push([round(pts[i][0]), round(pts[i][1])]); return out;
}
(async () => {
  console.log("fetching", URL); const r = await fetch(URL); console.log("HTTP", r.status); if (!r.ok) process.exit(1);
  const gj = JSON.parse(Buffer.from(await r.arrayBuffer()).toString("utf8")); console.log("features", gj.features.length);
  // include every admin-1 boundary class (boundary, statistical, region, meta, indicator, unrecognized) so no
  // province borders go missing; skip only the rare "indicator" class which is tick-marks, not real lines
  const SKIP = new Set(["Admin-1 boundary indicator"]);
  const TOL = 0.04; const b = []; const seenFcla = {};
  for (const f of gj.features) {
    const fcla = (f.properties && (f.properties.FEATURECLA || f.properties.featurecla)) || "";
    seenFcla[fcla] = (seenFcla[fcla] || 0) + 1;
    if (SKIP.has(fcla)) continue;
    const g = f.geometry; if (!g) continue;
    const lines = g.type === "MultiLineString" ? g.coordinates : g.type === "LineString" ? [g.coordinates] : [];
    for (const ln of lines) { const s = dp(ln, TOL); if (s.length >= 2) b.push(s); }
  }
  const js = "/* Admin-1 (province/state) boundary LINES — deduplicated (Natural Earth 10m, DP " + TOL + "). { b:[polyline,...] }. */\nwindow.ADMIN1 = " + JSON.stringify({ b, l: [] }) + ";\n";
  fs.writeFileSync(path.join(__dirname, "..", "admin1.js"), js);
  console.log("segments", b.length, "bytes", Buffer.byteLength(js), "| featurecla:", JSON.stringify(seenFcla));
})().catch((e) => { console.log("ERR", e.stack || e.message); process.exit(1); });
