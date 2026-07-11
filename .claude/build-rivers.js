// Dev-only: build rivers.js (window.RIVERS) from Natural Earth 10m river centerlines.
// Top ~100 major rivers (by scalerank, grouped by name). Each: { n:name, p:[ [ [lon,lat],... ], ... ] }.
const fs = require("fs"); const path = require("path");
const URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_rivers_lake_centerlines.geojson";
const round = (n) => Math.round(n * 100) / 100;
function dp(pts, tol) {                                   // Douglas-Peucker on a polyline
  const n = pts.length; if (n < 3) return pts;
  const keep = new Uint8Array(n); keep[0] = 1; keep[n - 1] = 1; const t2 = tol * tol, st = [[0, n - 1]];
  while (st.length) { const [a, b] = st.pop(); let md = -1, mi = -1; const ax = pts[a][0], ay = pts[a][1], bx = pts[b][0], by = pts[b][1], dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy || 1e-12;
    for (let i = a + 1; i < b; i++) { const px = pts[i][0] - ax, py = pts[i][1] - ay; let t = (px * dx + py * dy) / L; t = t < 0 ? 0 : t > 1 ? 1 : t; const cx = px - t * dx, cy = py - t * dy, d = cx * cx + cy * cy; if (d > md) { md = d; mi = i; } }
    if (md > t2) { keep[mi] = 1; st.push([a, mi], [mi, b]); } }
  const out = []; for (let i = 0; i < n; i++) if (keep[i]) out.push([round(pts[i][0]), round(pts[i][1])]); return out;
}
(async () => {
  console.log("fetching", URL); const r = await fetch(URL); console.log("HTTP", r.status); if (!r.ok) process.exit(1);
  const gj = JSON.parse(Buffer.from(await r.arrayBuffer()).toString("utf8")); console.log("features", gj.features.length);
  const key = (o, ns) => { for (const n of ns) if (o[n] !== undefined && o[n] !== null) return o[n]; return undefined; };
  const byName = new Map();                               // name -> { rank, segs:[...] }
  for (const f of gj.features) {
    const p = f.properties || {}, name = key(p, ["name", "name_en", "NAME"]); if (!name) continue;
    const rank = +(key(p, ["scalerank", "strokeweig"]) ?? 12);
    const segs = f.geometry.type === "MultiLineString" ? f.geometry.coordinates : [f.geometry.coordinates];
    let e = byName.get(name); if (!e) { e = { rank, segs: [], npts: 0 }; byName.set(name, e); }
    if (rank < e.rank) e.rank = rank;
    for (const s of segs) { e.segs.push(s); e.npts += s.length; }
  }
  const rivers = [...byName.entries()].map(([n, e]) => ({ n, rank: e.rank, npts: e.npts, segs: e.segs }));
  rivers.sort((a, b) => a.rank - b.rank || b.npts - a.npts);   // most prominent first
  const top = rivers.map((rv) => ({ n: rv.n, p: rv.segs.map((s) => dp(s, 0.05)).filter((s) => s.length >= 2) })).filter((rv) => rv.p.length);
  const js = "/* All named rivers (Natural Earth 10m centerlines). { n:name, p:[ [ [lon,lat],... ] ] }. */\nwindow.RIVERS = " + JSON.stringify(top) + ";\n";
  fs.writeFileSync(path.join(__dirname, "..", "rivers.js"), js);
  console.log("rivers", top.length, "bytes", Buffer.byteLength(js), "| top:", top.slice(0, 12).map((r) => r.n).join(", "));
})().catch((e) => { console.log("ERR", e.stack || e.message); process.exit(1); });
