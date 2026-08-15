// Dev-only: build us-states.js (window.US_STATES) = the 50 US states + the District of Columbia, from
// Natural Earth 10m admin-1 states/provinces. Run: node .claude/build-us-states.js
//
//   window.US_STATES = [ { n, a, c:[labelLon,labelLat], p:[rings of [lon,lat]] } ]
//
// The shape is world.js's exactly — same key names, same Douglas-Peucker tolerance, same 2dp rounding —
// so the card map's renderer draws a state with the code that draws a country and neither has to know
// which it is holding. `a` is the two-letter postal abbreviation; `c` is Natural Earth's own published
// label point, which is what the card map centres on (a bbox centre lands in the sea for Michigan and in
// Nevada for California).
//
// WHY THIS FILE EXISTS AT ALL, given admin1.js: that one is boundary LINES, deduplicated between
// neighbours, so it can draw the borders of a state and can never FILL one. A map card's whole question is
// "which state is shaded", so polygons are the thing, and there was no polygon source on the shelf.
//
// The 40 MB source is cached under .claude/ne-cache/ (gitignored) so a re-run costs no refetch; pass
// --refetch to replace it.
const fs = require("fs"), path = require("path");
const URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson";
const CACHE_DIR = path.join(__dirname, "ne-cache");
const CACHE = path.join(CACHE_DIR, "ne_10m_admin_1.geojson");
/* THE TOLERANCE IS DERIVED FROM THE CARD'S OWN ZOOM CEILING, NOT COPIED FROM world.js — and the first cut
   of this file did copy it (tol 0.02, 2dp), on the reasoning that the two are drawn into one canvas and a
   state traced finer than the coastline under it would read as a fault. That reasoning is about a WORLD
   map, and this card is not one: world.js is drawn at zoom 1-10 and a state card opens whatever zoom frames
   its state, which for Rhode Island is 79x and for the District of Columbia hits the 90x ceiling. At 90x the
   disk radius is 0.46*min(W,H)*90, so one CSS pixel is 1/(R*pi/180) = 0.0041 degrees — and 2dp quantisation
   snaps every vertex to a 0.01 grid, two and a half pixels apart. Rhode Island came out as 49 points: the
   bay was three triangular spikes and Block Island was a triangle. Nothing was WRONG with it, which is why
   it took looking at the card to see; it was simply a hexagon where a coastline should be.
   0.002 is one device pixel at that ceiling on a 2x screen, and 3dp is half of one. It costs 596 KB against
   145 — paid only by a reader who actually studies a map card, this file being lazy, where the Atlas bundle
   next door is ~9.9 MB. The disagreement with world.js's coarser shore is real and is answered in the
   RENDERER, which fills the states as land; see the layer pass in startCardGlobe. */
const TOL = 0.002, DP = 3;
const Q = (v) => Math.round(v * Math.pow(10, DP)) / Math.pow(10, DP);
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

function dp(pts, tol) {
  const n = pts.length; if (n < 3) return pts.slice();
  const keep = new Uint8Array(n); keep[0] = 1; keep[n - 1] = 1; const t2 = tol * tol, st = [[0, n - 1]];
  while (st.length) {
    const s = st.pop(), a = s[0], b = s[1], ax = pts[a][0], ay = pts[a][1], dx = pts[b][0] - ax, dy = pts[b][1] - ay, L2 = dx * dx + dy * dy || 1e-12;
    let md = -1, mi = -1;
    for (let i = a + 1; i < b; i++) {
      const px = pts[i][0], py = pts[i][1], t = clamp(((px - ax) * dx + (py - ay) * dy) / L2, 0, 1), qx = ax + t * dx, qy = ay + t * dy, d = (px - qx) ** 2 + (py - qy) ** 2;
      if (d > md) { md = d; mi = i; }
    }
    if (md > t2 && mi > 0) { keep[mi] = 1; st.push([a, mi]); st.push([mi, b]); }
  }
  const o = []; for (let i = 0; i < n; i++) if (keep[i]) o.push(pts[i]); return o;
}
/* Rings are stored CLOSED (first vertex === last), which is what the era files do and what lets a caller
   stroke every edge including the closing one without a modular index. A ring that simplifies below four
   points has no area left and is dropped — at this tolerance those are the one-pixel islets Natural Earth
   carries off the Alaskan and Louisiana coasts, of which there are thousands. */
function ringsOf(g) {
  const o = [];
  const polys = g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : [];
  for (const poly of polys) for (const r of poly) {
    const s = dp(r, TOL).map((p) => [Q(p[0]), Q(p[1])]);
    if (s.length < 4) continue;
    if (s[0][0] !== s[s.length - 1][0] || s[0][1] !== s[s.length - 1][1]) s.push([s[0][0], s[0][1]]);
    o.push(s);
  }
  return o;
}

(async () => {
  if (process.argv.includes("--refetch")) { try { fs.unlinkSync(CACHE); } catch (e) {} }
  if (!fs.existsSync(CACHE)) {
    console.log("fetching", URL);
    const r = await fetch(URL);
    if (!r.ok) { console.error("HTTP " + r.status); process.exit(1); }
    const buf = Buffer.from(await r.arrayBuffer());
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(CACHE, buf);
    console.log("cached " + (buf.length / 1048576).toFixed(1) + " MB -> " + path.relative(process.cwd(), CACHE));
  } else console.log("using cached " + path.relative(process.cwd(), CACHE) + " (--refetch to replace)");

  const gj = JSON.parse(fs.readFileSync(CACHE, "utf8"));
  const out = [];
  for (const f of gj.features) {
    const p = f.properties || {};
    if (p.adm0_a3 !== "USA" || !f.geometry) continue;
    /* Natural Earth files the fifty states as type "State" and the District of Columbia as "Federal
       District"; the same admin-1 layer also carries the inhabited territories (Puerto Rico, Guam, the
       US Virgin Islands, American Samoa, the Northern Marianas). The deck is the states and DC, which is
       the set every "US states" list means, so the type is tested rather than the count — a territory
       promoted or a state renamed upstream should change what ships, loudly, not silently. */
    if (p.type_en !== "State" && p.name !== "District of Columbia") continue;
    const rings = ringsOf(f.geometry);
    if (!rings.length) { console.warn("  ! no usable rings:", p.name); continue; }
    const lon = Number(p.longitude), lat = Number(p.latitude);
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) { console.error("ERROR: " + p.name + " has no published label point"); process.exit(1); }
    out.push({ n: p.name, a: String(p.postal || "").toUpperCase(), c: [Q(lon), Q(lat)], p: rings });
  }
  out.sort((a, b) => a.n.localeCompare(b.n));

  const names = new Set(out.map((s) => s.n)), abbr = new Set(out.map((s) => s.a));
  if (out.length !== 51) { console.error("ERROR: got " + out.length + " states, expected 51 (50 + DC): " + [...names].join(", ")); process.exit(1); }
  if (abbr.size !== 51) { console.error("ERROR: postal abbreviations are not unique — a card's map is addressed by name, but the abbreviation is what the deck prints."); process.exit(1); }
  let verts = 0, rings = 0;
  out.forEach((s) => s.p.forEach((r) => { rings++; verts += r.length; }));

  const body = "/* The 50 US states + the District of Columbia (Natural Earth 10m admin-1, Douglas-Peucker tol=" + TOL + ", " + DP + "dp).\n" +
    "   Each entry: n=name, a=postal abbreviation, c=[labelLon,labelLat] (Natural Earth's own published label\n" +
    "   point), p=[rings of [lon,lat]] (even-odd). Same SHAPE as world.js, so the card map draws a state with\n" +
    "   the code that draws a country — but traced ten times finer, because a card opens at whatever zoom frames\n" +
    "   its state and world.js's tolerance was chosen for a world map. See the builder for that arithmetic.\n" +
    "   LAZY — loaded by the `usstates` bundle when a map card is rendered, never at boot.\n" +
    "   Built by .claude/build-us-states.js. Do not hand-edit. */\n" +
    "window.US_STATES = [" + out.map((s) => JSON.stringify(s)).join(",\n") + "];\n";
  const dest = path.join(__dirname, "..", "us-states.js");
  fs.writeFileSync(dest, body);
  // re-parse, exactly as add-card.js does, to confirm the written file is valid JS before anyone ships it
  const win = {}; new Function("window", fs.readFileSync(dest, "utf8"))(win);
  if (!Array.isArray(win.US_STATES) || win.US_STATES.length !== out.length) { console.error("ERROR: the written file did not re-parse to " + out.length + " states"); process.exit(1); }
  console.log("wrote us-states.js: " + out.length + " states, " + rings + " rings, " + verts + " vertices, " + (Buffer.byteLength(body) / 1024 | 0) + " KB.");
})().catch((e) => { console.error("ERR", e.stack || e.message); process.exit(1); });
