// Dev-only: build forests.js (window.FORESTS) — the ~30 largest forests/forest regions on Earth, each filled with a
// dense scatter of tree points that fall ONLY on land (never ocean, lakes, or the Caspian). Points spread across the
// whole region; where two forest boxes overlap, the earlier forest claims the shared ground (cross-forest de-dup) so
// trees never double up. Output entry: { n:name, c:[lon,lat] label, t:type (conifer|broadleaf|tropical), k:[[lon,lat],...] }.
// Land/water tests use world.js (countries) and lakes.js (inland water), so it needs no network. Run: node .claude/build-forests.js
const fs = require("fs"), path = require("path");
global.window = {};
require("../world.js");
require("../lakes.js");
const GEO = global.window.WORLD_GEO || [];
const LAKES = global.window.LAKES || [];
const round = (n) => Math.round(n * 100) / 100;

// the 30 largest forest regions: box = [lonMin, latMin, lonMax, latMax] rough extent; c = label anchor; t = tree type.
const FORESTS = [
  { n: "Russian Taiga",                   t: "conifer",   c: [92, 61],    box: [45, 52, 138, 68] },
  { n: "Canadian Boreal Forest",          t: "conifer",   c: [-96, 56],   box: [-132, 50, -58, 60] },
  { n: "Amazon Rainforest",               t: "tropical",  c: [-62, -4],   box: [-74, -12, -50, 4] },
  { n: "Congo Rainforest",                t: "tropical",  c: [21, -1],    box: [11, -6, 29, 5] },
  { n: "Scandinavian & Finnish Taiga",    t: "conifer",   c: [18, 63],    box: [5, 58, 33, 69] },
  { n: "Alaskan Boreal Forest",           t: "conifer",   c: [-150, 64],  box: [-162, 60, -132, 68] },
  { n: "Eastern North American Forest",   t: "broadleaf", c: [-81, 39],   box: [-94, 31, -68, 47] },
  { n: "Miombo Woodlands",                t: "broadleaf", c: [27, -11],   box: [16, -17, 39, -6] },
  { n: "Borneo Rainforest",               t: "tropical",  c: [114, 1],    box: [109, -4, 119, 7] },
  { n: "New Guinea Rainforest",           t: "tropical",  c: [141, -5],   box: [131, -10, 151, -1] },
  { n: "Sumatran Rainforest",             t: "tropical",  c: [101, 0],    box: [95, -6, 107, 6] },
  { n: "Atlantic Forest",                 t: "tropical",  c: [-46, -20],  box: [-56, -30, -39, -7] },
  { n: "Pacific Temperate Rainforest",    t: "conifer",   c: [-128, 52],  box: [-138, 41, -120, 61] },
  { n: "Guinean Forests",                 t: "tropical",  c: [-2, 6],     box: [-13, 4, 11, 9] },
  { n: "Western Ghats",                   t: "tropical",  c: [75, 14],    box: [72, 8, 78, 21] },
  { n: "Manchurian Mixed Forest",         t: "broadleaf", c: [128, 46],   box: [120, 40, 137, 51] },
  { n: "Valdivian Rainforest",            t: "broadleaf", c: [-72, -41],  box: [-74, -46, -70, -36] },
  { n: "Carpathian Forests",              t: "broadleaf", c: [23, 47],    box: [18, 44, 27, 50] },
  { n: "Central American Rainforest",     t: "tropical",  c: [-88, 14],   box: [-92, 8, -82, 18] },
  { n: "Madagascar Forests",              t: "tropical",  c: [48, -19],   box: [46, -25, 51, -12] },
  { n: "Japanese Forests",                t: "broadleaf", c: [138, 37],   box: [129, 31, 146, 45] },
  { n: "Australian Eucalyptus Forest",    t: "broadleaf", c: [149, -35],  box: [144, -43, 154, -28] },
  { n: "Russian Far East Forest",         t: "conifer",   c: [135, 49],   box: [130, 43, 141, 54] },
  { n: "Ethiopian Highland Forest",       t: "broadleaf", c: [38, 8],     box: [34, 5, 40, 13] },
  { n: "Chocó Rainforest",                t: "tropical",  c: [-77, 5],    box: [-79, 1, -76, 9] },
  { n: "Baltic & Central European Forest", t: "broadleaf", c: [20, 54],   box: [9, 49, 30, 60] },
  { n: "Cerrado Woodlands",               t: "broadleaf", c: [-50, -13],  box: [-60, -22, -43, -5] },
  { n: "Indochina Rainforest",            t: "tropical",  c: [104, 16],   box: [97, 9, 109, 23] },
  { n: "Hyrcanian Forest",                t: "broadleaf", c: [51, 36.8],  box: [47.5, 36.2, 54.2, 38.2] },
  { n: "Sub-Himalayan Forest",            t: "tropical",  c: [85, 27],    box: [80, 26, 96, 30] },
];

// the Caspian is rendered as water but Natural Earth's country polygons cover it, so it is not caught by the land test
// and it is absent from lakes.js — reject it explicitly. South edge ~37.2 keeps the Hyrcanian coast (lat <= 37.1).
const CASPIAN = [[47, 47], [51, 47.5], [53, 46], [53.6, 43], [53.8, 40.5], [53, 38.5], [51.5, 37.4], [50, 37.1], [49, 37.2], [48.6, 38.5], [48.2, 41], [47.5, 44], [47, 47]];

// per-country bounding boxes for a fast land test
const POLYS = GEO.map((g) => {
  let x0 = 180, y0 = 90, x1 = -180, y1 = -90;
  g.p.forEach((ring) => ring.forEach((pt) => { if (pt[0] < x0) x0 = pt[0]; if (pt[0] > x1) x1 = pt[0]; if (pt[1] < y0) y0 = pt[1]; if (pt[1] > y1) y1 = pt[1]; }));
  return { p: g.p, bb: [x0, y0, x1, y1] };
});
function inRing(lon, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
    if (((yi > lat) !== (yj > lat)) && (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}
function inRings(lon, lat, rings) { let inside = false; for (let r = 0; r < rings.length; r++) if (inRing(lon, lat, rings[r])) inside = !inside; return inside; }
function onLand(lon, lat) {
  for (let c = 0; c < POLYS.length; c++) {
    const b = POLYS[c].bb;
    if (lon < b[0] || lon > b[2] || lat < b[1] || lat > b[3]) continue;
    if (inRings(lon, lat, POLYS[c].p)) return true;
  }
  return false;
}
function inLake(lon, lat) { for (let i = 0; i < LAKES.length; i++) if (inRings(lon, lat, LAKES[i])) return true; return false; }
function inCaspian(lon, lat) { return inRing(lon, lat, CASPIAN); }
// a tree point is valid only if it is on land and not on any inland water body
function isLand(lon, lat) { return onLand(lon, lat) && !inLake(lon, lat) && !inCaspian(lon, lat); }

// deterministic PRNG so the build is reproducible
let seed = 1337;
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

// cross-forest de-dup: a coarse occupancy grid so that where two forest boxes overlap, only the first forest's trees
// are kept in the shared cells (no doubled density / mixed glyphs). Same-forest points never block each other.
const CELL = 0.6, claimed = new Map();
function claimFree(lon, lat, fi) {
  const cx = Math.round(lon / CELL), cy = Math.round(lat / CELL);
  for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
    const owner = claimed.get((cx + dx) + "," + (cy + dy));
    if (owner != null && owner !== fi) return false;   // a different forest already owns ground here
  }
  claimed.set(cx + "," + cy, fi);
  return true;
}

let total = 0;
const out = FORESTS.map((f, fi) => {
  const [x0, y0, x1, y1] = f.box, area = (x1 - x0) * (y1 - y0);
  const step = Math.min(2.2, Math.max(0.7, Math.sqrt(area) / 14));   // coarser grid for huge regions so all forests read at similar density
  const k = [];
  for (let gx = x0 + step * 0.5; gx < x1; gx += step)
    for (let gy = y0 + step * 0.5; gy < y1; gy += step) {
      const lon = gx + (rnd() - 0.5) * step * 0.9, lat = gy + (rnd() - 0.5) * step * 0.9;   // jitter so it isn't a visible grid
      if (lon < x0 || lon > x1 || lat < y0 || lat > y1) continue;
      if (!isLand(lon, lat)) continue;          // skip ocean / lake / Caspian
      if (!claimFree(lon, lat, fi)) continue;   // skip ground already owned by an earlier forest
      k.push([round(lon), round(lat)]);
    }
  // cap the very biggest so the loop stays cheap, but keep them dense
  if (k.length > 360) { const keep = []; const stride = k.length / 360; for (let i = 0; i < k.length; i += stride) keep.push(k[Math.floor(i)]); k.length = 0; k.push(...keep); }
  total += k.length;
  return { n: f.n, c: f.c, t: f.t, k };
});

const js = "/* Major forests for the Atlas globe — the ~30 largest forest regions, each filled with a scatter of tree points\n" +
  "   that fall only on land (never ocean, lakes, or the Caspian). { n:name, c:[lon,lat] label, t:type (conifer|broadleaf|tropical), k:[[lon,lat],...] trees }.\n" +
  "   Built by .claude/build-forests.js from world.js + lakes.js (do not hand-edit). */\n" +
  "window.FORESTS = " + JSON.stringify(out) + ";\n";
fs.writeFileSync(path.join(__dirname, "..", "forests.js"), js);
console.log("forests:", out.length, "| total trees:", total, "| bytes:", Buffer.byteLength(js));
console.log(out.map((f) => f.n + ": " + f.k.length).join("\n"));
