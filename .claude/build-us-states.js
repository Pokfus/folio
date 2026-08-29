// Dev-only: build us-states.js = the 50 US states + the District of Columbia, and the 50 state capitals,
// from Natural Earth 10m. Run: node .claude/build-us-states.js
//
//   window.US_STATES   = [ { n, a, c:[labelLon,labelLat], p:[rings of [lon,lat]] } ]
//   window.US_CAPITALS = { "<city>": { s: "<state>", c: [lon, lat] } }
//
// THE CAPITALS ARE GENERATED, NOT TYPED, and that is the whole reason they are here rather than in each
// card's `map` block. A capital card's answer is a CITY, so its map has to put a dot on that city — which
// needs a coordinate, and fifty hand-entered coordinates are fifty chances to be quietly wrong about a
// place nobody will check. Natural Earth's populated-places layer marks an admin-1 capital as its own
// FEATURECLA, so the fifty come out of one filter with no list of names anywhere: exactly 50, one per
// state, no duplicate name. `s` rides along so the join can be CHECKED rather than assumed — a card
// naming Providence and shading Rhode Island is verified against the point's own state (test-map-cards).
//
// `cities.js` was the obvious source and is the wrong one twice over: it is in the ~9.9 MB `atlas` bundle,
// which a map card must never pull in, and it drops an admin-1 capital under 100k people — so Juneau,
// Pierre, Montpelier and the rest of the small ones are simply not in it.
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
/* THE _lakes VARIANT, AND THAT IS THE WHOLE OF WHY MICHIGAN HAS A MITTEN (Aug 2026, found by looking at
   `geo-007`). Natural Earth publishes this layer twice: `ne_10m_admin_1_states_provinces` gives a Great
   Lakes state its share of the LAKE as well as its land, and `..._lakes` clips the lakes out. The first
   cut of this file took the plain one, which is right for a choropleth and catastrophic for a card whose
   whole question is a SHAPE — Michigan came out as ONE ring spanning both peninsulas and the water
   between them, a blob with no Straits of Mackinac and no mitten, and Wisconsin, Minnesota, Illinois,
   Indiana, Ohio, Pennsylvania and New York all carried a lake lobe they do not have on land. Nothing
   threw, every fit framed its state, and no count could see it. */
const URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces_lakes.geojson";
const PLACES_URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_populated_places.geojson";
const CACHE_DIR = path.join(__dirname, "ne-cache");
const CACHE = path.join(CACHE_DIR, "ne_10m_admin_1_lakes.geojson");
const PLACES_CACHE = path.join(CACHE_DIR, "ne_10m_populated_places.geojson");
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

async function cached(url, file) {
  if (process.argv.includes("--refetch")) { try { fs.unlinkSync(file); } catch (e) {} }
  if (fs.existsSync(file)) { console.log("using cached " + path.relative(process.cwd(), file) + " (--refetch to replace)"); return; }
  console.log("fetching", url);
  const r = await fetch(url);
  if (!r.ok) { console.error("HTTP " + r.status); process.exit(1); }
  const buf = Buffer.from(await r.arrayBuffer());
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(file, buf);
  console.log("cached " + (buf.length / 1048576).toFixed(1) + " MB -> " + path.relative(process.cwd(), file));
}

(async () => {
  await cached(URL, CACHE);
  await cached(PLACES_URL, PLACES_CACHE);

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

  /* THE CAPITALS, off the SAME dataset family and by one field rather than by a list of names. Natural
     Earth marks an admin-1 capital in FEATURECLA; `ADM1CAP` exists in some vintages of this layer and not
     in the current one, so both are read — testing only the flag returns ZERO capitals and would ship a
     deck of dotless capital cards without a word (it did, on the first run).
     The coordinate is the FEATURE's own geometry rather than the LATITUDE/LONGITUDE columns beside it:
     they agree here, and the geometry is the thing the file is actually indexed on. Kept at 4dp, which is
     ~11 m — a dot, not a polygon, so the state's 3dp grid does not apply. */
  const places = JSON.parse(fs.readFileSync(PLACES_CACHE, "utf8"));
  const Q4 = (v) => Math.round(v * 1e4) / 1e4;
  const caps = {};
  const capStates = new Set();
  for (const f of places.features) {
    const p = f.properties || {};
    if ((p.ADM0NAME || p.adm0name) !== "United States of America") continue;
    const isCap = /^Admin-1 (region )?capital$/i.test(String(p.FEATURECLA || p.featurecla || "")) || +(p.ADM1CAP || p.adm1cap) === 1;
    if (!isCap || !f.geometry || f.geometry.type !== "Point") continue;
    /* Internal whitespace is COLLAPSED and the repair is reported, because the source has one: Minnesota's
       capital is spelled "St.  Paul" with two spaces. A card addresses a dot by name, so left alone that
       name is one no card would ever write correctly — and a double space is a transcription artefact
       rather than a different name, which is the only kind of repair worth making to somebody's data. */
    const raw = String(p.NAME || p.name || "").trim();
    const name = raw.replace(/\s+/g, " "), st = String(p.ADM1NAME || p.adm1name || "").trim().replace(/\s+/g, " ");
    if (name !== raw) console.log("  · collapsed whitespace in a capital's name: " + JSON.stringify(raw) + " -> " + JSON.stringify(name));
    const g = f.geometry.coordinates;
    if (!name || !st || !Number.isFinite(g[0]) || !Number.isFinite(g[1])) { console.warn("  ! unusable capital:", name || "(unnamed)"); continue; }
    if (caps[name]) { console.error("ERROR: two capitals named " + name + " (" + caps[name].s + ", " + st + ") — a card addresses a dot by name."); process.exit(1); }
    caps[name] = { s: st, c: [Q4(g[0]), Q4(g[1])] };
    capStates.add(st);
  }
  /* Fifty, one per state, and asserted rather than counted afterwards: this table is what puts the dot on
     a capital card, and a capital quietly missing from it is a card that draws no dot at all. DC is not
     among them — Natural Earth files Washington as the Admin-0 capital, which is correct and which is why
     the count is 50 against the states' 51. */
  if (Object.keys(caps).length !== 50 || capStates.size !== 50) {
    console.error("ERROR: got " + Object.keys(caps).length + " capitals across " + capStates.size + " states, expected 50 and 50");
    process.exit(1);
  }
  for (const [city, v] of Object.entries(caps)) {
    if (!names.has(v.s)) { console.error("ERROR: " + city + " is filed under " + v.s + ", which is not one of the states"); process.exit(1); }
  }
  const capOut = Object.fromEntries(Object.keys(caps).sort().map((k) => [k, caps[k]]));

  const body = "/* The 50 US states + the District of Columbia (Natural Earth 10m admin-1, Douglas-Peucker tol=" + TOL + ", " + DP + "dp).\n" +
    "   Each entry: n=name, a=postal abbreviation, c=[labelLon,labelLat] (Natural Earth's own published label\n" +
    "   point), p=[rings of [lon,lat]] (even-odd). Same SHAPE as world.js, so the card map draws a state with\n" +
    "   the code that draws a country — but traced ten times finer, because a card opens at whatever zoom frames\n" +
    "   its state and world.js's tolerance was chosen for a world map. See the builder for that arithmetic.\n" +
    "   LAZY — loaded by the `usstates` bundle when a map card is rendered, never at boot.\n" +
    "   Built by .claude/build-us-states.js. Do not hand-edit. */\n" +
    "window.US_STATES = [" + out.map((s) => JSON.stringify(s)).join(",\n") + "];\n\n" +
    "/* The 50 state capitals (Natural Earth 10m populated places, FEATURECLA \"Admin-1 capital\"), keyed by\n" +
    "   city: s=the state it stands in, c=[lon,lat] at 4dp. A capital card puts a dot here — see `map.dot`\n" +
    "   in the MAP CARDS block. Washington is Natural Earth's Admin-0 capital and is not among them. */\n" +
    "window.US_CAPITALS = " + JSON.stringify(capOut) + ";\n";
  const dest = path.join(__dirname, "..", "us-states.js");
  fs.writeFileSync(dest, body);
  // re-parse, exactly as add-card.js does, to confirm the written file is valid JS before anyone ships it
  const win = {}; new Function("window", fs.readFileSync(dest, "utf8"))(win);
  if (!Array.isArray(win.US_STATES) || win.US_STATES.length !== out.length) { console.error("ERROR: the written file did not re-parse to " + out.length + " states"); process.exit(1); }
  if (!win.US_CAPITALS || Object.keys(win.US_CAPITALS).length !== 50) { console.error("ERROR: the written file did not re-parse to 50 capitals"); process.exit(1); }
  console.log("wrote us-states.js: " + out.length + " states, " + rings + " rings, " + verts + " vertices, " + Object.keys(capOut).length + " capitals, " + (Buffer.byteLength(body) / 1024 | 0) + " KB.");
})().catch((e) => { console.error("ERR", e.stack || e.message); process.exit(1); });
