// Dev-only: build water.js (window.WATER) — label anchors for oceans / seas / gulfs / straits / bays / channels
// (Natural Earth 10m marine polys) plus the major named lakes (NE 10m lakes, low scalerank only).
// { n:name, c:[lon,lat] label anchor, r:rank } where r tracks scalerank (0 = biggest → show first).
const fs = require("fs"); const path = require("path");
const MARINE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_geography_marine_polys.geojson";
const LAKES = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_lakes.geojson";
const round = (n) => Math.round(n * 100) / 100;
const key = (o, ns) => { for (const n of ns) if (o[n] !== undefined && o[n] !== null && o[n] !== "") return o[n]; return undefined; };
// Natural Earth stores some marine names in ALL CAPS (e.g. "INDIAN OCEAN"); title-case those for clean display,
// leaving already mixed-case names ("North Pacific Ocean", "Sea of Japan") untouched.
const SMALL = new Set(["of", "the", "and", "el", "la", "le", "les", "del", "de", "du", "des", "da", "do"]);
function titleCase(s) {
  if (s !== s.toUpperCase()) return s;
  return s.toLowerCase().split(/\s+/).map((w, i) => (i > 0 && SMALL.has(w)) ? w : w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
function ringCentroidArea(ring) {
  let a = 0, cx = 0, cy = 0;
  for (let i = 0, n = ring.length; i < n; i++) { const p = ring[i], q = ring[(i + 1) % n]; const cr = p[0] * q[1] - q[0] * p[1]; a += cr; cx += (p[0] + q[0]) * cr; cy += (p[1] + q[1]) * cr; }
  a *= 0.5; if (Math.abs(a) < 1e-9) { let sx = 0, sy = 0; for (const p of ring) { sx += p[0]; sy += p[1]; } return { c: [sx / ring.length, sy / ring.length], area: 0 }; }
  return { c: [cx / (6 * a), cy / (6 * a)], area: Math.abs(a) };
}
// label anchor = area-weighted centroid of the polygon's largest outer ring
function anchorOf(geom) {
  const polys = geom.type === "MultiPolygon" ? geom.coordinates : geom.type === "Polygon" ? [geom.coordinates] : [];
  let best = null;
  for (const poly of polys) { const ca = ringCentroidArea(poly[0]); if (!best || ca.area > best.area) best = ca; }
  return best ? best.c : null;
}
async function load(url) { console.log("fetching", url); const r = await fetch(url); console.log("HTTP", r.status); if (!r.ok) process.exit(1); return JSON.parse(Buffer.from(await r.arrayBuffer()).toString("utf8")); }
(async () => {
  const out = [], seen = new Set();
  const add = (name, c, r) => { if (!name || !c) return; name = titleCase(name); const k = name.toLowerCase(); if (seen.has(k)) return; seen.add(k); out.push({ n: name, c: [round(c[0]), round(c[1])], r }); };
  // marine features: oceans, seas, gulfs, bays, straits, channels, sounds, …
  const m = await load(MARINE); console.log("marine features", m.features.length);
  for (const f of m.features) { const p = f.properties || {}; const name = key(p, ["name", "name_en", "NAME"]); if (!name || !f.geometry) continue; let r = key(p, ["scalerank", "SCALERANK"]); r = r == null ? 3 : +r; add(name, anchorOf(f.geometry), r); }
  // major named lakes only (Caspian, Superior, Victoria, Baikal, …) — skip the thousands of small lakes
  const lk = await load(LAKES); console.log("lake features", lk.features.length);
  for (const f of lk.features) { const p = f.properties || {}; const name = key(p, ["name", "name_en", "NAME"]); if (!name || !f.geometry) continue; let r = key(p, ["scalerank", "SCALERANK"]); r = r == null ? 9 : +r; if (r > 2) continue; add(name, anchorOf(f.geometry), r + 2); }   // lakes sit a touch below seas of the same rank
  // notable straits/waters Natural Earth's polygons don't name (add only if not already present, via the dedup in add())
  [{ n: "Strait of Hormuz", c: [56.4, 26.6], r: 3 }].forEach((w) => add(w.n, w.c, w.r));
  out.sort((a, b) => a.r - b.r || a.n.localeCompare(b.n));
  const js = "/* Water labels: oceans/seas/gulfs/straits/bays (NE 10m marine polys) + major named lakes. { n:name, c:[lon,lat], r:rank (0=biggest) }. */\nwindow.WATER = " + JSON.stringify(out) + ";\n";
  fs.writeFileSync(path.join(__dirname, "..", "water.js"), js);
  const byR = {}; out.forEach((o) => byR[o.r] = (byR[o.r] || 0) + 1);
  console.log("water", out.length, "bytes", Buffer.byteLength(js), "| byRank", JSON.stringify(byR));
  console.log("oceans/seas (r<=1):", out.filter((o) => o.r <= 1).map((o) => o.n).join(", "));
})().catch((e) => { console.log("ERR", e.stack || e.message); process.exit(1); });
