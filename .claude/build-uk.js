// Dev-only: build uk.js (window.UK_SUBUNITS) = the UK's constituent countries (England, Scotland, Wales, Northern
// Ireland) + Ireland (the whole island, for the pre-1922 all-Ireland UK), from Natural Earth admin-0 map subunits.
// window.UK_SUBUNITS = [ { n, p:[rings], c:[per-ring mask: '0' internal land border (drawn light), '1' coast (skipped)] } ].
// The Atlas draws the '0' internal borders within the UK and lets you double-click a constituent. Run: node .claude/build-uk.js
const fs = require("fs"), path = require("path");
const URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_map_subunits.geojson";
const WANT_A3 = ["ENG", "SCT", "WLS", "NIR", "IRL"];   // subunit codes: England, Scotland, Wales, Northern Ireland, Ireland (whole island, for the pre-1922 UK)
const TOL = 0.012, GRID = 1000, PROBE = 0.05;
const Q = (v) => Math.round(v * GRID) / GRID, K = (p) => Q(p[0]) + "," + Q(p[1]);
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
function dp(pts, tol) {
  const n = pts.length; if (n < 3) return pts.slice();
  const keep = new Uint8Array(n); keep[0] = 1; keep[n - 1] = 1; const t2 = tol * tol, st = [[0, n - 1]];
  while (st.length) { const s = st.pop(), a = s[0], b = s[1], ax = pts[a][0], ay = pts[a][1], dx = pts[b][0] - ax, dy = pts[b][1] - ay, L2 = dx * dx + dy * dy || 1e-12;
    let md = -1, mi = -1; for (let i = a + 1; i < b; i++) { const px = pts[i][0], py = pts[i][1], t = clamp(((px - ax) * dx + (py - ay) * dy) / L2, 0, 1), qx = ax + t * dx, qy = ay + t * dy, d = (px - qx) ** 2 + (py - qy) ** 2; if (d > md) { md = d; mi = i; } }
    if (md > t2 && mi > 0) { keep[mi] = 1; st.push([a, mi]); st.push([mi, b]); } }
  const o = []; for (let i = 0; i < n; i++) if (keep[i]) o.push(pts[i]); return o;
}
function ringsOf(g) { const o = []; const polys = g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : []; for (const poly of polys) for (const r of poly) { const s = dp(r, TOL).map((p) => [Q(p[0]), Q(p[1])]); if (s.length >= 4) { if (s[0][0] !== s[s.length - 1][0] || s[0][1] !== s[s.length - 1][1]) s.push([s[0][0], s[0][1]]); o.push(s); } } return o; }
function inRing(lo, la, r) { let c = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const xi = r[i][0], yi = r[i][1], xj = r[j][0], yj = r[j][1]; if (((yi > la) !== (yj > la)) && (lo < (xj - xi) * (la - yi) / (yj - yi) + xi)) c = !c; } return c; }
function inPoly(lo, la, rings) { let c = false; for (const r of rings) if (inRing(lo, la, r)) c = !c; return c; }

(async () => {
  console.log("fetching", URL);
  const r = await fetch(URL); if (!r.ok) { console.error("HTTP " + r.status); process.exit(1); }
  const gj = JSON.parse(Buffer.from(await r.arrayBuffer()).toString("utf8"));
  const subs = [];
  for (const f of gj.features) { const p = f.properties || {}; if (!WANT_A3.includes(p.SU_A3)) continue; if (!f.geometry) continue; const nm = p.SUBUNIT || p.NAME || p.SU_A3; const rings = ringsOf(f.geometry); if (rings.length) subs.push({ n: nm, p: rings }); }
  console.log("found:", subs.map((s) => s.n + "(" + s.p.length + " rings)").join(", "));
  const bb = subs.map((s) => { let x0 = 180, y0 = 90, x1 = -180, y1 = -90; for (const r of s.p) for (const pt of r) { if (pt[0] < x0) x0 = pt[0]; if (pt[0] > x1) x1 = pt[0]; if (pt[1] < y0) y0 = pt[1]; if (pt[1] > y1) y1 = pt[1]; } return [x0, y0, x1, y1]; });
  // classify each edge: '0' = internal land border (another constituent lies just across it), '1' = coast
  let internalN = 0;
  for (let si = 0; si < subs.length; si++) {
    subs[si].c = subs[si].p.map((ring) => { let s = ""; for (let i = 0; i + 1 < ring.length; i++) {
      const a = ring[i], b = ring[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, ox = -dy / L * PROBE, oy = dx / L * PROBE, mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      let internal = false;
      // only England/Scotland/Wales are joined by LAND borders (England–Scotland, England–Wales). Ireland & N. Ireland are
      // separate islands whose edges are coast or the UK–Ireland international border (drawn by world.js) — never UK-internal.
      for (const qp of [[mx + ox, my + oy], [mx - ox, my - oy]]) { for (let j = 0; j < subs.length; j++) { if (j === si) continue; if (subs[j].n === "Ireland" || subs[j].n === "Northern Ireland") continue; const bx = bb[j]; if (qp[0] < bx[0] || qp[0] > bx[2] || qp[1] < bx[1] || qp[1] > bx[3]) continue; if (inPoly(qp[0], qp[1], subs[j].p)) { internal = true; break; } } if (internal) break; }
      s += internal ? "0" : "1"; if (internal) internalN++;
    } return s; });
  }
  const out = "/* UK constituent countries + Ireland (Natural Earth 10m admin-0 subunits, DP " + TOL + "). For the Atlas globe:\n" +
    "   double-click the UK to drill into a constituent; '0' mask edges are the internal land borders (England–Scotland,\n" +
    "   England–Wales), drawn light. Built by .claude/build-uk.js. Do not hand-edit. */\nwindow.UK_SUBUNITS = " + JSON.stringify(subs) + ";\n";
  fs.writeFileSync(path.join(__dirname, "..", "uk.js"), out);
  console.log("wrote uk.js: " + subs.length + " subunits, " + internalN + " internal-border edges, " + (Buffer.byteLength(out) / 1024 | 0) + " KB.");
})().catch((e) => { console.error("ERR", e.stack || e.message); process.exit(1); });
