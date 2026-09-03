#!/usr/bin/env node
"use strict";
/*
  build-hires-coasts.js — the COASTLINES of Italy, Greece and China at Natural Earth's full 10m detail, for
  the map window on a history card (Sep 2026, on request: "significantly increase the resolution of the
  coastlines of Italy / Greece / China" in the card Atlas windows of the Rome, Greece and China
  collections). Standalone Node helper, zero deps. Not part of the site.

    node .claude/build-hires-coasts.js [--src=<ne_10m_admin_0_countries.geojson>] [--tol=0.0015] [--region=italy]

  Writes coast/<region>.js, one file per region, each pushing onto `window.HIRES_COAST_IN` — a QUEUE
  rather than an assignment, for the reason the i18n files push: two regions may land in one session and
  the second must not overwrite the first. app.js drains it (`hiresCoastIngest`) into `window.HIRES_COAST`.
  An entry is `{ n: <world.js name>, r: { <ring index>: [points…] } }` — a SPARSE patch over that
  country's world.js rings, so a ring the frame never reaches (Russia's Arctic, France's overseas
  departments) costs nothing and the window substitutes ring by ring.

  WHAT IT WRITES IS A SPLICE, NOT A SECOND WORLD MAP, and that is the whole design. world.js is Natural
  Earth 10m simplified to 0.02° and rounded to two decimals — right for a globe, and on a card zoomed to
  one gulf a coast of 1 km chords. The obvious fix, a hi-res copy of each country drawn over the low-res
  one, doubles every LAND border: the Alps traced twice, a little apart, because the simplified chain and
  the full one sag differently. So a country keeps world.js's own vertex chain wherever an edge is shared
  with a neighbour (which is exactly the edges the Atlas's `worldEdgeOwners` calls interior), and only
  the runs that no neighbour owns — the coast — are replaced by the 10m chain between the same two
  endpoints. The result tiles with its low-res neighbours vertex for vertex, so nothing doubles, and the
  card window draws it INSTEAD of the world.js shape rather than on top.

  IT CAN DO THAT BECAUSE EVERY world.js VERTEX IS A 10m VERTEX. gen-world.js is a Douglas-Peucker pass,
  which drops points and never moves them, followed by rounding — so each low-res vertex sits within
  0.0071° of exactly one point of the same 10m ring, and the splice finds it by rounding the 10m ring the
  same way (measured before this was written: 645 of 645 for Italy, 1,101 of 1,101 for Greece, 2,911 of
  2,911 for China). A vertex that does not match is reported and its ring is left low-res; there were none.

  WHICH EDGES ARE COAST IS READ OFF THE 10m DATA, NOT OFF world.js. The obvious test — an edge of
  world.js that no second country carries — is wrong, because gen-world.js simplifies each country on its
  own and two neighbours keep different subsets of a shared border, so most of a land border reads as
  unshared (measured: landlocked North Macedonia came out with five "coast" runs). Natural Earth's own
  polygons DO share their border vertices exactly, so every 10m edge is classified there, and a low-res
  edge is coast when the 10m chain it stands for is mostly single-owner. The one residue is a junction the
  simplifier dropped, where a low-res edge straddles the end of a coast: the border half of its chain is
  upgraded with the coast half, a few hundred metres of true border beside a neighbour's straight one.

  THE NEIGHBOURS' COASTS COME TOO, where they share the frame. A hi-res Sicily beside a low-res Malta, or
  a hi-res Peloponnese opposite a low-res Ionian coast of Turkey, reads as two maps in one window, so each
  region lists the countries whose shore lies in its frame and a BBOX: a coast EDGE is upgraded only where
  one of its ends falls inside the box, edge by edge rather than run by run — a mainland's coast is one
  run from border to border, and upgrading Vietnam's whole shore for the Gulf of Tonkin would be most of
  the bundle for none of the frame. Russia is left out of the China frame for the same arithmetic: its
  mainland ring is the largest in world.js, and a per-ring patch of it would carry five thousand low-res
  points to upgrade the hundred kilometres past Vladivostok. The Vatican is left out on purpose — see the
  card window, which never draws it.

  THE TOLERANCE IS 0.002°, about 200 m, four decimals (0.003° for China, whose coast and islands are
  three times Italy's). At CMAP_ZMAX a window paints about 960 px per degree, so the residual is two or
  three pixels at the deepest zoom and nothing at any zoom a card opens at; full 10m detail would be a
  third again as many points for a difference no reader could see. What matters is the size a locator can
  warm at idle (see DATA_BUNDLES): gzipped, Italy is ~30 KB, Greece ~50 KB and China ~130 KB.
*/
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = /^--([^=]+)(?:=(.*))?$/.exec(a); return m ? [m[1], m[2] == null ? true : m[2]] : [a, true]; }));
const SRC = args.src || path.join(__dirname, "ne_10m_admin_0_countries.geojson");
const TOL_DEFAULT = Number(args.tol) || 0.002;
const ONLY = args.region ? String(args.region) : null;
const die = (m) => { console.error("ERROR: " + m); process.exit(1); };
if (!fs.existsSync(SRC)) die("no Natural Earth file at " + SRC + " — run `node .claude/dl-ne10.js` first, or pass --src=");

/* The regions. `bbox` is [west, south, east, north]; `countries` are world.js names (NE names where
   they differ are listed under `ne`). A run of coast is upgraded where any of its vertices is in the
   box, and an island ring where its bbox meets the box. */
const REGIONS = {
  italy: {
    bbox: [5.5, 35.0, 20.5, 47.5],
    countries: ["Italy", "France", "Monaco", "Slovenia", "Croatia", "Bosnia and Herz.", "Montenegro", "Albania", "Malta", "Tunisia"],
  },
  greece: {
    bbox: [19.0, 33.5, 30.5, 42.5],
    countries: ["Greece", "Turkey", "Albania", "Bulgaria"],
  },
  /* The box stops short of Sakhalin and the Sea of Okhotsk: Russia's shore inside it is the stretch from
     the Tumen mouth past Vladivostok, which is what a card framing Manchuria can see, and the rest of the
     Pacific coast is ten thousand points a China card would never look at. */
  china: {
    tol: 0.003,
    bbox: [73.0, 17.0, 132.0, 50.0],
    countries: ["China", "Taiwan", "Hong Kong", "Macao", "North Korea", "South Korea", "Vietnam"],
  },
};

// ---- load ----
const gj = JSON.parse(fs.readFileSync(SRC, "utf8"));
const win = {}; new Function("window", fs.readFileSync(path.join(ROOT, "world.js"), "utf8"))(win);
const GEO = win.WORLD_GEO || [];
if (!GEO.length) die("world.js loaded empty");
const byName = new Map(GEO.map((c) => [c.n, c]));
const key2 = (p) => (Math.round(p[0] * 100) / 100) + "," + (Math.round(p[1] * 100) / 100);
const ekey = (a, b) => { const ka = key2(a), kb = key2(b); return ka < kb ? ka + "|" + kb : kb + "|" + ka; };

// every edge of every 10m ring, and who owns it: a 10m edge with one owner is coast
const owners = new Map();
const xkey = (a, b) => { const ka = a[0] + "," + a[1], kb = b[0] + "," + b[1]; return ka < kb ? ka + "|" + kb : kb + "|" + ka; };
gj.features.forEach((f, fi) => {
  const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  for (const poly of polys) for (const ring of poly) {
    for (let i = 0; i + 1 < ring.length; i++) {
      const k = xkey(ring[i], ring[i + 1]);
      let s = owners.get(k); if (!s) { s = new Set(); owners.set(k, s); }
      s.add(fi);
    }
  }
});
const edgeShared = (a, b) => { const s = owners.get(xkey(a, b)); return !!s && s.size > 1; };

function neRings(name) {
  const f = gj.features.find((f) => f.properties.NAME === name || f.properties.NAME_LONG === name || f.properties.ADMIN === name ||
    f.properties.NAME_EN === name || (name === "Bosnia and Herz." && /Bosnia/.test(f.properties.NAME)) ||
    (name === "Macao" && /Maca/.test(f.properties.NAME)) || (name === "North Macedonia" && /Macedonia/.test(f.properties.NAME)));
  if (!f) return null;
  const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  const rings = [];
  for (const poly of polys) for (const r of poly) rings.push(r);
  return rings;
}

// Douglas-Peucker, endpoints kept (the same pass gen-world.js runs, at a finer tolerance)
function dp(points, tol) {
  const n = points.length;
  if (n < 3) return points.slice();
  const keep = new Uint8Array(n); keep[0] = 1; keep[n - 1] = 1;
  const tol2 = tol * tol, stack = [[0, n - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const ax = points[a][0], ay = points[a][1], bx = points[b][0], by = points[b][1];
    const dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy || 1e-12;
    let maxD = -1, idx = -1;
    for (let i = a + 1; i < b; i++) {
      const px = points[i][0], py = points[i][1];
      const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
      const qx = ax + t * dx, qy = ay + t * dy;
      const d = (px - qx) * (px - qx) + (py - qy) * (py - qy);
      if (d > maxD) { maxD = d; idx = i; }
    }
    if (maxD > tol2 && idx > 0) { keep[idx] = 1; stack.push([a, idx]); stack.push([idx, b]); }
  }
  const out = [];
  for (let i = 0; i < n; i++) if (keep[i]) out.push(points[i]);
  return out;
}
const r4 = (p) => [Math.round(p[0] * 1e4) / 1e4, Math.round(p[1] * 1e4) / 1e4];
const inBox = (p, bb) => p[0] >= bb[0] && p[0] <= bb[2] && p[1] >= bb[1] && p[1] <= bb[3];
const ringBox = (r) => { let x0 = 180, y0 = 90, x1 = -180, y1 = -90; for (const p of r) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; } return [x0, y0, x1, y1]; };
const boxesMeet = (a, b) => a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1];

// the 10m sub-chain from index i to index j of `ring`, walking in direction `dir` (+1 / -1), wrapping
function subChain(ring, i, j, dir) {
  const n = ring.length, out = [];
  // a closed 10m ring repeats its first point last; walk the n-1 distinct ones
  const m = (ring[0][0] === ring[n - 1][0] && ring[0][1] === ring[n - 1][1]) ? n - 1 : n;
  let k = i, guard = 0;
  out.push(ring[k]);
  while (k !== j && guard++ < m + 1) { k = (k + dir + m) % m; out.push(ring[k]); }
  return out;
}

function spliceCountry(name, region, log) {
  const TOL = region.tol || TOL_DEFAULT;
  const lo = byName.get(name);
  if (!lo) { log.push("  " + name + ": not in world.js — skipped"); return null; }
  const hi = neRings(name);
  if (!hi) { log.push("  " + name + ": not in the Natural Earth file — skipped"); return null; }
  // where each rounded 10m vertex is
  const idx = new Map();
  hi.forEach((r, ri) => r.forEach((p, pi) => { const k = key2(p); let a = idx.get(k); if (!a) { a = []; idx.set(k, a); } a.push([ri, pi]); }));
  const out = [], patch = {};
  let runs = 0, ringsWhole = 0, kept = 0, misses = 0, hiPts = 0, loPts = 0;
  for (let ringIdx = 0; ringIdx < lo.p.length; ringIdx++) {
    const ring = lo.p[ringIdx];
    loPts += ring.length;
    // the 10m ring this one came from: the ring most of its vertices map to
    const votes = new Map();
    ring.forEach((p) => { const a = idx.get(key2(p)); if (a) for (const [ri] of a) votes.set(ri, (votes.get(ri) || 0) + 1); });
    let best = -1, bestN = 0;
    votes.forEach((n, ri) => { if (n > bestN) { bestN = n; best = ri; } });
    const closed = ring.length > 2 && ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1];
    const pts = closed ? ring.slice(0, -1) : ring;
    const n = pts.length;
    const HR = best >= 0 ? hi[best] : null;
    // each vertex's index in the 10m ring
    const at = HR ? pts.map((p) => { const a = (idx.get(key2(p)) || []).filter((q) => q[0] === best); return a.length ? a[0][1] : -1; }) : [];
    const touches = boxesMeet(ringBox(pts), region.bbox);
    if (!HR || bestN < n || !touches) {
      if (touches && HR && bestN < n) misses++;
      out.push(ring); kept++;
      continue;
    }
    // direction: do the 10m indices grow along this ring?
    let fwd = 0, back = 0;
    for (let i = 0; i < n; i++) { const d = at[(i + 1) % n] - at[i]; if (d > 0) fwd++; else if (d < 0) back++; }
    const dir = fwd >= back ? 1 : -1;
    // coast edges: a low-res edge is coast when the 10m chain it stands for is mostly unshared
    const coast = pts.map((p, i) => {
      const chain = subChain(HR, at[i], at[(i + 1) % n], dir);
      let shared = 0;
      for (let q = 0; q + 1 < chain.length; q++) if (edgeShared(chain[q], chain[q + 1])) shared++;
      return shared * 2 < Math.max(1, chain.length - 1);
    });
    if (coast.every(Boolean)) {
      // an island: the whole 10m ring, simplified, starting where the low-res one starts
      const whole = subChain(HR, at[0], at[0] === 0 ? (HR.length - 2) : at[0] - dir < 0 ? HR.length - 2 : at[0] - dir, dir);
      const simp = dp(whole, TOL).map(r4);
      simp.push(simp[0]);
      out.push(simp); patch[ringIdx] = simp; ringsWhole++; hiPts += simp.length;
      continue;
    }
    // runs of consecutive coast edges, walked from a vertex that opens one
    let start = 0;
    while (start < n && !(coast[start] && !coast[(start - 1 + n) % n])) start++;
    if (start === n) start = 0;
    const res = [], runsBefore = runs;
    let i = start, steps = 0;
    while (steps < n) {
      const p = pts[i];
      if (coast[i]) {
        // a coast edge p[i] -> p[i+1]: the 10m chain between the same two vertices, where the frame reaches it
        const j = (i + 1) % n;
        if (inBox(p, region.bbox) || inBox(pts[j], region.bbox)) {
          const chain = dp(subChain(HR, at[i], at[j], dir), TOL).map(r4);
          for (let q = 0; q < chain.length - 1; q++) res.push(chain[q]);   // the edge's last vertex is the next edge's first
          runs++; hiPts += chain.length - 1;
        } else res.push(p);
        i = j; steps++;
      } else {
        res.push(p); i = (i + 1) % n; steps++;
      }
    }
    res.push(res[0]);
    out.push(res);
    if (runs > runsBefore) patch[ringIdx] = res;
  }
  log.push("  " + name + ": " + lo.p.length + " rings, " + loPts + " pts -> " + out.reduce((a, r) => a + r.length, 0) + " pts; " +
    runs + " coast edges and " + ringsWhole + " islands upgraded, " + kept + " rings kept" + (misses ? ", " + misses + " rings with unmatched vertices" : "") +
    (Object.keys(patch).length ? "" : " — nothing in the frame, omitted"));
  return Object.keys(patch).length ? { n: name, r: patch } : null;
}

const regions = ONLY ? [ONLY] : Object.keys(REGIONS);
for (const rid of regions) {
  const region = REGIONS[rid];
  if (!region) die("no region " + rid);
  const log = [], shapes = [];
  for (const name of region.countries) { const s = spliceCountry(name, region, log); if (s) shapes.push(s); }
  const head = "/* Hi-res coastlines for the " + rid + " frame: Natural Earth 10m coast chains (tol " + (region.tol || TOL_DEFAULT) + "°, 4dp) spliced into world.js's own\n" +
    "   rings, whose land borders are kept vertex for vertex so nothing doubles. GENERATED by .claude/build-hires-coasts.js — never\n" +
    "   hand-edited. Pushes onto a queue: two regions may land in one session (see hiresCoastIngest in app.js). */\n";
  const body = "window.HIRES_COAST_IN = window.HIRES_COAST_IN || [];\nwindow.HIRES_COAST_IN.push({region:" + JSON.stringify(rid) + ",shapes:[" +
    shapes.map((s) => JSON.stringify(s)).join(",\n") + "]});\n";
  const file = path.join(ROOT, "coast", rid + ".js");
  fs.writeFileSync(file, head + body);
  // re-parse: a file that does not load is worse than none
  const w = {}; new Function("window", fs.readFileSync(file, "utf8"))(w);
  console.log(rid + " -> coast/" + rid + ".js  " + (fs.statSync(file).size / 1024).toFixed(0) + " KB, " + w.HIRES_COAST_IN[0].shapes.length + " countries");
  log.forEach((l) => console.log(l));
}
