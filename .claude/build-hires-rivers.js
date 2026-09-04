#!/usr/bin/env node
"use strict";
/*
  build-hires-rivers.js — the RIVERS of Italy and Greece at Natural Earth's full 10m detail, and many more
  of them, for the map window on a history card (Sep 2026, on request: "Rivers in Italy in the Roman deck
  and Greek rivers in the Greek deck should have a much higher resolution on the atlas windows, and there
  should be more of them"). Standalone Node helper, zero deps. Not part of the site.

    node .claude/build-hires-rivers.js [--tol=0.0015] [--region=italy] [--src=<dir holding the two geojsons>]

  Writes rivers/<region>.js, one file per region, each pushing onto `window.HIRES_RIVER_IN` — a QUEUE
  rather than an assignment, for the reason coast/<region>.js pushes: two regions may land in one session
  and the second must not overwrite the first. app.js drains it (`hiresRiverIngest`) into
  `window.HIRES_RIVER`, and the locator window then draws that region's rivers INSTEAD of the rivers.js
  entries it supersedes, plus the ones rivers.js has not got at all.

  WHY THE COAST'S SPLICE IS THE WRONG SHAPE HERE. A coastline is spliced ring by ring because a country's
  land borders are shared with its neighbours and a hi-res copy laid over the low-res one doubles them. A
  river shares nothing: it is a polyline of its own, so the fix is simply to REPLACE it — and the only way
  the two can double is if both versions are drawn, which is what `supersede` prevents.

  IT REPLACES A RIVER WHOLE, NEVER CLIPS ONE TO THE BOX, and that is the decision the format turns on. The
  obvious build — hi-res inside the box, low-res outside — leaves a SEAM wherever a river crosses the
  edge: the two chains are up to 5 km apart there (rivers.js is simplified at 0.05°), and the box is well
  inside a card's opening ~50° view, so the jog would be on screen. So a river with any point in the box
  is taken at hi-res over its WHOLE course, Danube and Rhône included, and its rivers.js entry is dropped.
  That is affordable because a river is a thin thing: the Danube is 547 points at full 10m detail, and the
  two files come to ~88 KB and ~46 KB — the size of coast/italy.js, and lazy on the same bargain.

  WHERE THE EXTRA RIVERS COME FROM. rivers.js is built from ne_10m_rivers_lake_centerlines alone, which is
  the world set and carries 21 named rivers in the Italian box and 8 in the Greek one — the Po and the
  Tiber and not much else. Natural Earth publishes a SUPPLEMENT, ne_10m_rivers_europe, with the smaller
  European rivers the world file leaves out; together they give 53 named rivers for Italy (the Arno, the
  Adige, the Volturno, the Ofanto, the Simeto, the Sacco, the Salto) and 30 for Greece (the Acheloos, the
  Haliacmon, the Strymon, the Evros, the Aoos, the Enipefs). An UNNAMED feature is taken only when it
  touches the box, and it is never a duplicate: rivers.js has no unnamed rivers at all.

  THE TOLERANCE IS 0.0015°, about 150 m, four decimals — the coast file's arithmetic (see its header): at
  CMAP_ZMAX a card's window paints about 960 px per degree, so the residual is under two pixels at the
  deepest zoom a card can reach and nothing at any zoom one opens at. Against rivers.js's 0.05° / 2dp that
  is roughly thirty times finer, which is the "much higher resolution" the request asks for.
*/
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = /^--([^=]+)(?:=(.*))?$/.exec(a); return m ? [m[1], m[2] == null ? true : m[2]] : [a, true]; }));
const SRCDIR = args.src ? String(args.src) : __dirname;
const TOL = Number(args.tol) || 0.0015;
const ONLY = args.region ? String(args.region) : null;
const die = (m) => { console.error("ERROR: " + m); process.exit(1); };

/* The two Natural Earth files, cached beside this script (gitignored — the rivers/<region>.js they
   produce IS committed). Fetched on demand rather than by a download helper of their own, there being
   nothing else in the repo that wants them. */
const SOURCES = [
  ["ne_10m_rivers_lake_centerlines.geojson", "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_rivers_lake_centerlines.geojson"],
  ["ne_10m_rivers_europe.geojson", "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_rivers_europe.geojson"],
];

/* [west, south, east, north]. The box decides which rivers a region CARRIES, never where they are cut —
   see the header. Italy's takes the whole peninsula with Sicily, Sardinia and the head of the Adriatic;
   Greece's the mainland, the Aegean, Crete and the Anatolian shore opposite, which is where the Greek
   collection's Ionia cards look. */
const REGIONS = {
  italy: { bbox: [5.8, 35.4, 19.2, 47.6] },
  greece: { bbox: [18.8, 33.8, 29.4, 42.6] },
};

const round = (n) => Math.round(n * 1e4) / 1e4;
function dp(pts, tol) {                                    // Douglas-Peucker on a polyline
  const n = pts.length; if (n < 3) return pts.map((p) => [round(p[0]), round(p[1])]);
  const keep = new Uint8Array(n); keep[0] = 1; keep[n - 1] = 1; const t2 = tol * tol, st = [[0, n - 1]];
  while (st.length) {
    const [a, b] = st.pop(); let md = -1, mi = -1;
    const ax = pts[a][0], ay = pts[a][1], dx = pts[b][0] - ax, dy = pts[b][1] - ay, L = dx * dx + dy * dy || 1e-12;
    for (let i = a + 1; i < b; i++) {
      const px = pts[i][0] - ax, py = pts[i][1] - ay;
      let t = (px * dx + py * dy) / L; t = t < 0 ? 0 : t > 1 ? 1 : t;
      const cx = px - t * dx, cy = py - t * dy, d = cx * cx + cy * cy;
      if (d > md) { md = d; mi = i; }
    }
    if (md > t2) { keep[mi] = 1; st.push([a, mi], [mi, b]); }
  }
  const out = []; for (let i = 0; i < n; i++) if (keep[i]) out.push([round(pts[i][0]), round(pts[i][1])]);
  return out;
}

(async () => {
  // ---- sources ----
  const feats = [];
  for (const [file, url] of SOURCES) {
    const p = path.join(SRCDIR, file);
    if (!fs.existsSync(p)) {
      console.log("fetching", file);
      const r = await fetch(url);
      if (!r.ok) die("HTTP " + r.status + " for " + url);
      fs.writeFileSync(p, Buffer.from(await r.arrayBuffer()));
    }
    const gj = JSON.parse(fs.readFileSync(p, "utf8"));
    for (const f of gj.features) {
      const pr = f.properties || {}, g = f.geometry;
      if (!g) continue;
      const name = String(pr.name || pr.name_en || "").trim();
      const segs = g.type === "MultiLineString" ? g.coordinates : g.type === "LineString" ? [g.coordinates] : null;
      if (!segs) continue;
      feats.push({ name: name, segs: segs });
    }
    console.log(file, "features", gj.features.length);
  }
  if (!feats.length) die("no river features loaded");

  // the names rivers.js already carries, so the file can say which of them it takes over
  const win = {}; new Function("window", fs.readFileSync(path.join(ROOT, "rivers.js"), "utf8"))(win);
  const LOW = new Set((win.RIVERS || []).map((r) => String(r.n)));
  if (!LOW.size) die("rivers.js loaded empty");

  for (const [region, cfg] of Object.entries(REGIONS)) {
    if (ONLY && ONLY !== region) continue;
    const b = cfg.bbox;
    const touches = (segs) => { for (const s of segs) for (const c of s) if (c[0] >= b[0] && c[0] <= b[2] && c[1] >= b[1] && c[1] <= b[3]) return true; return false; };
    // pass 1: which NAMES have any point in the box. A named river is then taken WHOLE, wherever it runs.
    const names = new Set();
    for (const f of feats) if (f.name && touches(f.segs)) names.add(f.name);
    // pass 2: collect, grouping by name exactly as rivers.js does (an unnamed feature is its own group)
    const out = new Map(); let anon = 0;
    for (const f of feats) {
      const take = f.name ? names.has(f.name) : touches(f.segs);
      if (!take) continue;
      const key = f.name || "~" + anon++;
      let e = out.get(key); if (!e) { e = { n: f.name, p: [] }; out.set(key, e); }
      for (const s of f.segs) { const d = dp(s, TOL); if (d.length >= 2) e.p.push(d); }
    }
    const rivers = [...out.values()].filter((r) => r.p.length);
    /* A name rivers.js does NOT carry needs no supersede row — it is a river the low-res set never had —
       and listing it would say this file takes over something that was never there. */
    const supersede = [...names].filter((n) => LOW.has(n)).sort();
    let pts = 0; rivers.forEach((r) => r.p.forEach((l) => (pts += l.length)));
    const head = "/* Hi-res rivers for the " + region + " frame: Natural Earth 10m centerlines (world set + the European\n" +
      "   supplement) at tol " + TOL + "°, 4dp — about thirty times finer than rivers.js, and " + rivers.length + " rivers where it\n" +
      "   carries " + supersede.length + " here. `supersede` names the rivers.js entries this file REPLACES, so the two can never\n" +
      "   be drawn one over the other. GENERATED by .claude/build-hires-rivers.js — never hand-edited. Pushes onto a\n" +
      "   queue: two regions may land in one session (see hiresRiverIngest in app.js). */\n";
    const js = head +
      "window.HIRES_RIVER_IN = window.HIRES_RIVER_IN || [];\n" +
      "window.HIRES_RIVER_IN.push({region:" + JSON.stringify(region) + ",supersede:" + JSON.stringify(supersede) + ",rivers:" + JSON.stringify(rivers) + "});\n";
    const dir = path.join(ROOT, "rivers");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    const dest = path.join(dir, region + ".js");
    fs.writeFileSync(dest, js);
    // re-parse, the way every generator here does: a file that does not run is worse than none
    try { new Function("window", js)({}); } catch (e) { die("generated " + dest + " does not parse: " + e.message); }
    console.log(region, "→", path.relative(ROOT, dest), "| rivers", rivers.length, "(named " + rivers.filter((r) => r.n).length + ")",
      "| points", pts, "| supersedes", supersede.length, "| bytes", Buffer.byteLength(js), "(" + (Buffer.byteLength(js) / 1024).toFixed(0) + " KB)");
    console.log("   named:", rivers.filter((r) => r.n).map((r) => r.n).sort().join(", "));
  }
})().catch((e) => { console.error("ERR", e.stack || e.message); process.exit(1); });
