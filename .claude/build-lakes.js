// Dev-only: build lakes.js (window.LAKES) = major inland seas/lakes from Natural Earth 10m lakes.
// window.LAKES = [ [ ring, ... ], ... ] where ring = [[lon,lat],...]. Rendered as water on the globe.
const fs = require("fs");
const path = require("path");
const URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_lakes.geojson";
const DP_PREC = 2, TOL = 0.03;
// well-known lakes we always keep even if small / high scalerank (their NE name contains one of these)
const FAMOUS = /\b(geneva|l[ée]man|constance|bodensee|garda|como|maggiore|lucerne|z[üu]rich|neuch[âa]tel|balaton|neusiedl|dead sea|kinneret|galilee|tiberias|kivu|edward|kyoga|george|abaya|toba|tahoe|salton|poop[óo]|inle|neagh|sevan|nam ?co|namtso|siling|tonle sap|maracaibo|managua|atitl[áa]n|chapala|champlain|winnebago|mono|pyramid|walker|okanagan|sevier|mead|powell|sap)\b/i;
const f10 = Math.pow(10, DP_PREC), round = (n) => Math.round(n * f10) / f10;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

function dp(points, tol) {
  const n = points.length; if (n < 3) return points.slice();
  const keep = new Uint8Array(n); keep[0] = 1; keep[n - 1] = 1; const t2 = tol * tol, st = [[0, n - 1]];
  while (st.length) {
    const s = st.pop(), a = s[0], b = s[1], ax = points[a][0], ay = points[a][1], dx = points[b][0] - ax, dy = points[b][1] - ay, L2 = dx * dx + dy * dy || 1e-12;
    let md = -1, mi = -1;
    for (let i = a + 1; i < b; i++) { const px = points[i][0], py = points[i][1], t = clamp(((px - ax) * dx + (py - ay) * dy) / L2, 0, 1), qx = ax + t * dx, qy = ay + t * dy, d = (px - qx) * (px - qx) + (py - qy) * (py - qy); if (d > md) { md = d; mi = i; } }
    if (md > t2 && mi > 0) { keep[mi] = 1; st.push([a, mi]); st.push([mi, b]); }
  }
  const out = []; for (let i = 0; i < n; i++) if (keep[i]) out.push(points[i]); return out;
}
function processRing(ring) {
  const r = dp(ring, TOL), out = []; let px = null, py = null;
  for (const p of r) { const x = round(p[0]), y = round(p[1]); if (x === px && y === py) continue; out.push([x, y]); px = x; py = y; }
  if (out.length && (out[0][0] !== out[out.length - 1][0] || out[0][1] !== out[out.length - 1][1])) out.push([out[0][0], out[0][1]]);
  return out.length >= 4 ? out : null;
}
function ringArea(ring) { let a = 0; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += (ring[j][0] + ring[i][0]) * (ring[j][1] - ring[i][1]); return Math.abs(a) / 2; }

(async () => {
  console.log("fetching", URL);
  const r = await fetch(URL); console.log("HTTP", r.status); if (!r.ok) process.exit(1);
  const gj = JSON.parse(Buffer.from(await r.arrayBuffer()).toString("utf8"));
  console.log("features", gj.features.length, "prop keys:", Object.keys(gj.features[0].properties).join(","));
  const lakes = []; const kept = [];
  for (const feat of gj.features) {
    const p = feat.properties || {};
    const sr = (p.scalerank != null ? p.scalerank : (p.SCALERANK != null ? p.SCALERANK : 99));
    const name = p.name || p.NAME || p.name_alt || "";
    const geom = feat.geometry; if (!geom) continue;
    const polys = geom.type === "Polygon" ? [geom.coordinates] : geom.type === "MultiPolygon" ? geom.coordinates : [];
    // area of the largest ring (deg^2) as a size proxy
    let area = 0; for (const poly of polys) for (const ring of poly) { const a = ringArea(ring); if (a > area) area = a; }
    // keep major inland seas/lakes: important (low scalerank) OR sizeable OR a well-known named lake
    if (!(sr <= 4 || area >= 0.1 || FAMOUS.test(name))) continue;
    const rings = [];
    for (const poly of polys) { const rr = processRing(poly[0]); if (rr) rings.push(rr); }   // outer ring of each part only — drop island holes so every lake fills solid (an island-heavy lake like Manicouagan would otherwise render as a confusing thin "ring")
    if (rings.length) { lakes.push(rings); kept.push(name + "(" + area.toFixed(2) + ")"); }
  }
  const js = "/* Major inland seas & lakes (Natural Earth 10m, DP tol=" + TOL + "). window.LAKES = [ [rings of [lon,lat]], ... ]. */\nwindow.LAKES = " + JSON.stringify(lakes) + ";\n";
  fs.writeFileSync(path.join(__dirname, "..", "lakes.js"), js);
  console.log("lakes kept:", lakes.length, "bytes", Buffer.byteLength(js));
  console.log(kept.sort().join(", "));
})().catch((e) => { console.log("ERR", e.stack || e.message); process.exit(1); });
