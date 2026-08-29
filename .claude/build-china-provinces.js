// Dev-only: build china-provinces.js = the 31 provincial-level divisions of mainland China, and the 27
// provincial capitals, from Natural Earth 10m. Run: node .claude/build-china-provinces.js
//
//   window.CHINA_PROVINCES = [ { n, a, t, c:[labelLon,labelLat], p:[rings of [lon,lat]] } ]
//   window.CHINA_CAPITALS  = { "<city>": { s: "<province>", c: [lon, lat] } }
//
// The third shape layer a map card can be drawn on, after us-states.js and world.js, and it exists for
// the reason the first one does: `world.js` draws COUNTRIES, so it has one polygon for China and nothing
// inside it, and `admin1.js` is boundary LINES deduplicated between neighbours, so it can stroke the edge
// of a province and can never FILL one. A map card's whole question is which shape is shaded, so polygons
// are the thing, and there was no polygon source on the shelf.
//
// THE SHAPE IS us-states.js's EXACTLY — same key names, same Douglas-Peucker tolerance, same 3dp
// quantisation — so the card map draws a province with the code that draws a state and neither has to
// know which it is holding. `a` is the ISO 3166-2 suffix (CN-GD -> GD), which is a published code rather
// than an abbreviation somebody chose; `c` is Natural Earth's own label point, which is what the card map
// centres on (a bbox centre lands in the sea for Guangdong and in Qinghai for Gansu).
//   `t` is the ONE field us-states.js has no equivalent of, and it is here because every card in this deck
// states it: a division is a Province, an Autonomous Region or a Municipality, and which of the three is
// the fact its question is careful not to assume. A card's own facts box says it in a `Kind` row, so it is
// carried in the data rather than remembered — Natural Earth's `type_en`, which is ISO 3166-2's own
// category for the subdivision, verbatim.
//
// THE _lakes VARIANT IS TAKEN AND FOR CHINA IT CHANGES NOTHING, WHICH IS WORTH KNOWING RATHER THAN
// ASSUMING EITHER WAY. Natural Earth publishes this layer twice — the plain one gives a lakeside division
// its share of the WATER as well as its land, and `..._lakes` clips the lakes out — and taking the plain
// one is what once gave Michigan a shape with no Straits of Mackinac. The obvious inference is that
// Qinghai Lake, Poyang and Dongting are clipped out of their provinces here too. They are NOT: measured,
// all 32 of Natural Earth's China admin-1 features are vertex-for-vertex identical in the two variants,
// and the centre of Qinghai Lake tests as inside Qinghai. The clipping is applied to lakes lying BETWEEN
// divisions, which the Great Lakes do and China's do not. So the variant is taken for one reason only,
// that it is the one us-states.js takes and a difference between the two files should be a decision
// rather than an accident.
//   `lakes.js` still rides in the same bundle, and the reason is the one the usstates bundle records: it
// is about world.js rather than about this layer. That file has no lake holes either, so without it
// Qinghai Lake and Poyang would be drawn as grey land under a province — the card map fills the lakes as
// water after both land layers and before the shaded tint, so they read as water and the answer's tint
// still lies over everything.
//
// WHICH DIVISIONS ARE IN IT IS NOT A JUDGEMENT MADE ENTRY BY ENTRY. It is the set the National Bureau of
// Statistics' own Seventh National Population Census reports — "31 provinces, autonomous regions and
// municipalities directly under the central government of the Chinese mainland" — which is also the
// source the deck's running order is sorted by, so the list and the order come from one work. Natural
// Earth carries a thirty-second China admin-1 feature, the PARACEL ISLANDS, which is not a
// provincial-level division, has no settled resident population and is disputed; it is dropped, with its
// reason, exactly as the world deck's own three rules drop Antarctica. Hong Kong, Macau and Taiwan are
// not here either: each has an ISO 3166-1 code of its own, each is drawn by `world.js`, and each is
// already a card in *The world* (gw-104, gw-167, gw-060) — carding them again would ask one shape twice.
//
// THE NAMES FOLLOW THE CENSUS COMMUNIQUÉ'S OWN ENGLISH, which agrees with Natural Earth on 29 of the 31
// and differs on two (RENAME below). That is the same rule the running order follows and it means the
// name on a card, the name in the sort and the name in the source are one name.
//
// AND NATURAL EARTH'S CHINESE CAPITALS ARE NOT USABLE AS A FILTER, which is where this builder parts
// company with build-us-states.js. There the `Admin-1 capital` class was exactly 50 points, one per
// state, no duplicate name, so the fifty came out of one filter with no list of names anywhere. Here the
// same filter returns 32 points for 31 divisions and is wrong five ways at once: Zhaotong is filed as a
// capital of Yunnan (Kunming is) and Fushun as one of Liaoning (Shenyang is), Xining is filed under
// GANSU rather than Qinghai, Beijing is absent because it is the country's capital and so carries the
// Admin-0 class instead, and two names are misspelt — "Shenyeng" and "Xian". A table built from that
// filter would put four dots in the wrong place on cards that look entirely correct.
//   So the CAPITAL IS DECLARED, city by city, and the COORDINATE is still never typed: each row names a
// city and the point comes from Natural Earth's own record of it. What is declared is a name a reader can
// check against any source; what is computed is the number nobody would check. Every point is then tested
// for falling INSIDE its province's own polygon before it is written — which is what turns the join from
// something trusted into something proved, and is exactly the check Natural Earth's own attribution
// fails. A row whose city is missing from the source, or whose point lands outside, stops the build.
//
// The 41 MB source is cached under .claude/ne-cache/ (gitignored) so a re-run costs no refetch; pass
// --refetch to replace it.
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces_lakes.geojson";
const PLACES_URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_populated_places.geojson";
const CACHE_DIR = path.join(__dirname, "ne-cache");
const CACHE = path.join(CACHE_DIR, "ne_10m_admin_1_lakes.geojson");
const PLACES_CACHE = path.join(CACHE_DIR, "ne_10m_populated_places.geojson");
const OUT = path.join(ROOT, "china-provinces.js");

/* The tolerance and quantisation are us-states.js's, and the arithmetic behind them is in that file's
   header: the card map's zoom ceiling is CMAP_ZMAX = 180, at which one CSS pixel is 0.0041 degrees, so a
   2dp grid is two and a half pixels and a coastline becomes a row of triangles. 0.002 is one device pixel
   at that ceiling on a 2x screen and 3dp is half of one. The two layers are traced identically on
   purpose — they are drawn by the same code into the same window. */
const TOL = 0.002, DP = 3;
const Q = (v) => Math.round(v * Math.pow(10, DP)) / Math.pow(10, DP);
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const CAP_DP = 4;                              // ~11 m, world-capitals.js's own; a dot is a dot
const CQ = (v) => Math.round(v * Math.pow(10, CAP_DP)) / Math.pow(10, CAP_DP);

/* Natural Earth's name on the left, the census communiqué's on the right, and nothing else is renamed.
   The builder refuses a row whose left-hand side is not in the source, so a name Natural Earth later
   corrects fails loudly here rather than leaving a rename that silently matches nothing. */
const RENAME = {
  "Inner Mongol": "Inner Mongolia",   // NE clips the English name short; the census writes it in full
  Xizang: "Tibet",                    // the official romanisation; the census's own English is Tibet
};
/* Not a provincial-level division: an uninhabited disputed island group Natural Earth files under China's
   admin-1 with a placeholder code (CN-X01~). See the header. */
const DROP = new Set(["Paracel Islands"]);

/* province -> its capital, and the reason this is a declared table rather than a filter is in the header.
   The four MUNICIPALITIES are deliberately absent: Beijing, Shanghai, Tianjin and Chongqing are cities
   that are themselves provincial-level divisions, so the shape a card would shade IS the city it would
   ask for, and the question answers itself. The deck's running order leaves their four capital numbers
   unused for the same reason; keeping them out of the table means add-card.js refuses such a card rather
   than the plan merely advising against one. */
const CAPITALS = {
  Hebei: "Shijiazhuang", Shanxi: "Taiyuan", "Inner Mongolia": "Hohhot", Liaoning: "Shenyang",
  Jilin: "Changchun", Heilongjiang: "Harbin", Jiangsu: "Nanjing", Zhejiang: "Hangzhou",
  Anhui: "Hefei", Fujian: "Fuzhou", Jiangxi: "Nanchang", Shandong: "Jinan", Henan: "Zhengzhou",
  Hubei: "Wuhan", Hunan: "Changsha", Guangdong: "Guangzhou", Guangxi: "Nanning", Hainan: "Haikou",
  Sichuan: "Chengdu", Guizhou: "Guiyang", Yunnan: "Kunming", Tibet: "Lhasa", Shaanxi: "Xi'an",
  Gansu: "Lanzhou", Qinghai: "Xining", Ningxia: "Yinchuan", Xinjiang: "Ürümqi",
};
/* Where Natural Earth's spelling of a capital is not the city's name. Both are plain misspellings rather
   than romanisation variants, so the card asks for the name and the point is found under NE's. */
const PLACE_ALIAS = { Shenyang: "Shenyeng", "Xi'an": "Xian" };

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
/* Rings are stored CLOSED (first vertex === last), which is what world.js, the era files and us-states.js
   all do and what lets a caller stroke every edge including the closing one without a modular index. A
   ring that simplifies below four points has no area left and is dropped — at this tolerance those are
   the one-pixel islets off the Fujian and Zhejiang coasts, of which there are hundreds. */
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
// even-odd, over every ring of the division: a point in a lake hole is NOT in the province, which is the
// answer this test should give — a capital that fell in one would be a capital in the middle of a lake
function inRings(lon, lat, rings) {
  let inside = false;
  for (const r of rings) for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const xi = r[i][0], yi = r[i][1], xj = r[j][0], yj = r[j][1];
    if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi || 1e-12) + xi) inside = !inside;
  }
  return inside;
}
async function grab(url, file) {
  if (fs.existsSync(file) && process.argv.indexOf("--refetch") < 0) return JSON.parse(fs.readFileSync(file, "utf8"));
  process.stdout.write("fetching " + path.basename(file) + " …\n");
  const r = await fetch(url); if (!r.ok) throw new Error("fetch " + r.status + " " + url);
  const t = await r.text(); fs.mkdirSync(CACHE_DIR, { recursive: true }); fs.writeFileSync(file, t);
  return JSON.parse(t);
}
const die = (m) => { console.error("ERROR: " + m); process.exit(1); };

(async () => {
  const src = await grab(URL, CACHE);
  const feats = src.features.filter((f) => (f.properties.admin || "") === "China");
  if (!feats.length) die("no China admin-1 features in " + path.basename(CACHE));
  const out = [];
  for (const f of feats) {
    const p = f.properties, raw = p.name || "";
    if (DROP.has(raw)) { console.log("  dropped " + raw + " — not a provincial-level division (see header)"); continue; }
    const n = RENAME[raw] || raw;
    const iso = String(p.iso_3166_2 || "");
    if (!/^CN-[A-Z]{2}$/.test(iso)) die(raw + " has no ISO 3166-2 code (" + iso + ")");
    const rings = ringsOf(f.geometry);
    if (!rings.length) die(n + " simplified to nothing");
    const c = [Q(Number(p.longitude)), Q(Number(p.latitude))];
    if (!isFinite(c[0]) || !isFinite(c[1])) die(n + " has no label point");
    const t = String(p.type_en || "").trim();
    if (!/^(Province|Autonomous Region|Municipality)$/.test(t)) die(n + " has an unexpected division type: " + JSON.stringify(t));
    out.push({ n, a: iso.slice(3), t, c, p: rings });
  }
  for (const k of Object.keys(RENAME)) if (!feats.some((f) => f.properties.name === k)) die("RENAME names " + JSON.stringify(k) + ", which is not in the source any more — check what Natural Earth calls it now");
  if (out.length !== 31) die("expected the census's 31 divisions, got " + out.length + ": " + out.map((s) => s.n).join(", "));

  const places = await grab(PLACES_URL, PLACES_CACHE);
  const cn = places.features.filter((f) => (f.properties.ADM0NAME || "") === "China");
  const caps = {};
  for (const prov of Object.keys(CAPITALS)) {
    const city = CAPITALS[prov], srcName = PLACE_ALIAS[city] || city;
    const shape = out.find((s) => s.n === prov);
    if (!shape) die("CAPITALS names " + JSON.stringify(prov) + ", which is not one of the 31 divisions");
    const hits = cn.filter((f) => (f.properties.NAME || "") === srcName || (f.properties.NAMEASCII || "") === srcName);
    if (!hits.length) die("no Natural Earth point named " + JSON.stringify(srcName) + " in China (the capital of " + prov + ")");
    // where NE carries the name twice, the point inside the province is the one meant — which is the same
    // test everything else here rests on, so it is made once and used for both jobs
    const good = hits.filter((f) => inRings(f.geometry.coordinates[0], f.geometry.coordinates[1], shape.p));
    if (!good.length) die(JSON.stringify(city) + " is Natural Earth's point at " + hits[0].geometry.coordinates.join(",") + ", which does not fall inside " + prov + " — the dot would land outside the shaded shape");
    if (good.length > 1) die("Natural Earth has " + good.length + " points named " + JSON.stringify(srcName) + " inside " + prov);
    const g = good[0].geometry.coordinates;
    if (caps[city]) die("two provinces claim a capital named " + JSON.stringify(city));
    caps[city] = { s: prov, c: [CQ(g[0]), CQ(g[1])] };
  }
  if (Object.keys(caps).length !== 27) die("expected 27 capitals, got " + Object.keys(caps).length);

  const head =
`/* The 31 provincial-level divisions of mainland China — 22 provinces, 5 autonomous regions and 4
   municipalities — and the 27 provincial capitals (Natural Earth 10m admin-1, Douglas-Peucker tol=${TOL},
   ${DP}dp). Each entry: n=name, a=ISO 3166-2 suffix, t=Province | Autonomous Region | Municipality,
   c=[labelLon,labelLat] (Natural Earth's own published label point), p=[rings of [lon,lat]] (even-odd). The same SHAPE as us-states.js and world.js, so the
   card map draws a province with the code that draws a state.
   CHINA_CAPITALS holds the 27 capitals a card may put a gold dot on; \`s\` names the province the city
   stands in, and every point in this file was tested for falling inside that province's own polygon
   before it was written. The four MUNICIPALITIES have no entry, deliberately — Beijing, Shanghai, Tianjin
   and Chongqing are cities that are themselves divisions, so the shape would be the answer.
   GENERATED — never hand-edited. Run: node .claude/build-china-provinces.js
   LAZY — loaded by the \`chinaprov\` bundle when a China map card is rendered, never on the eager path. */
`;
  const body =
    "window.CHINA_PROVINCES = [\n" + out.map((s) => JSON.stringify(s)).join(",\n") + "\n];\n\n" +
    "window.CHINA_CAPITALS = " + JSON.stringify(caps, null, 0) + ";\n";
  fs.writeFileSync(OUT, head + body);
  const verts = out.reduce((a, s) => a + s.p.reduce((b, r) => b + r.length, 0), 0);
  const kinds = out.reduce((m, s) => ((m[s.t] = (m[s.t] || 0) + 1), m), {});
  const PLURAL = { Province: "provinces", "Autonomous Region": "autonomous regions", Municipality: "municipalities" };
  console.log("  " + ["Province", "Autonomous Region", "Municipality"].map((k) => kinds[k] + " " + (kinds[k] === 1 ? k.toLowerCase() : PLURAL[k])).join(", "));
  console.log("wrote china-provinces.js — " + out.length + " divisions, " + Object.keys(caps).length + " capitals, " +
    verts.toLocaleString() + " vertices, " + (fs.statSync(OUT).size / 1024).toFixed(0) + " KB");
})().catch((e) => { console.error(e); process.exit(1); });
