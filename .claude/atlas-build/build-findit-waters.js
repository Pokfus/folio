#!/usr/bin/env node
/* build-findit-waters.js — atlas/data/findit-waters.js, the outlines Find it scores a SEA or an OCEAN round on (Oct 2026, on a report)

     node .claude/atlas-build/build-findit-waters.js [--install]

   WHY. A place round is scored by the great-circle distance to ONE point, within 150 km (300 for a capital). That is right for a town and wrong for
   water: the Atlantic's locator point is 0°, 30° W, and a tap in the middle of the North Atlantic was told it was 4,000 km away. A water body's round
   is now scored on its OUTLINE — a tap inside it, or within FI2_WATER_SLACK_KM of its edge (atlas-windows.js), is found, and a miss reports the
   distance to the nearest edge rather than to the point.

   WHICH WATERS. Every card whose locator is a point round in Find it (a point `at`, no river / sea / region / shelf / range kind) and whose locator
   name is a Natural Earth 1:10m marine polygon's name (its English name, its own name or its alternate), matched case-insensitively. All records of
   the matched item are joined (the Atlantic and the Pacific are a north and a south polygon of one Wikidata item). A lake is not in the marine file
   and keeps the point rule.

   PARTS. Natural Earth draws a sea's named subdivisions as polygons of their own and cuts them OUT of the larger sea, so the Mediterranean's polygon
   has a hole where the Aegean is. PARTS below adds the subdivisions the International Hydrographic Organization's Limits of Oceans and Seas
   (S-23, 3rd edition, 1953) treats as lying within the larger sea; an ocean's marginal seas (the Caribbean, the Gulf of Mexico, the North Sea) are
   NOT added, since the game asks for them as places of their own.

   Rings are simplified (Douglas–Peucker, SIMPLIFY degrees, or a hundredth of a small ring's own size) and rounded to 0.01°; nothing is hand-edited. Source: Natural Earth (public domain). */
"use strict";
const fs = require("fs"), path = require("path");
const HERE = __dirname, ROOT = path.join(HERE, "..", "..");
const { readShp, readDbf } = require("./lib/shp.js");
const { ensureSource, headerSources } = require("./fetch-sources.js");
const { loadCards } = require("../card-io.js");
const OUT = path.join(ROOT, "atlas", "data", "findit-waters.js");
const SIMPLIFY = 0.1;
const PARTS = {
  "mediterranean sea": ["Tyrrhenian Sea", "Gulf of Lion", "Adriatic Sea", "Ionian Sea", "Balearic Sea", "Aegean Sea", "Gulf of Gabès", "Gulf of Sidra", "Sea of Crete", "Ligurian Sea", "Alboran Sea"],
  "aegean sea": ["Sea of Crete"],
  "baltic sea": ["Gulf of Finland", "Gulf of Bothnia", "Gulf of Riga"],
};
const NOT_POINT = new Set(["river", "sea", "region", "shelf", "range"]);

function dp(pts, eps) {   // Douglas–Peucker on [lon, lat] pairs, the ring's first and last points kept
  if (pts.length < 4) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop(); let best = -1, bi = -1;
    const [ax, ay] = pts[a], [bx, by] = pts[b], dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
    for (let i = a + 1; i < b; i++) {
      const [px, py] = pts[i];
      let t = L ? ((px - ax) * dx + (py - ay) * dy) / L : 0; t = Math.max(0, Math.min(1, t));
      const d = Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
      if (d > best) { best = d; bi = i; }
    }
    if (best > eps) { keep[bi] = 1; stack.push([a, bi], [bi, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}
const r2 = (v) => Math.round(v * 100) / 100;

function build() {
  const src = ensureSource("ne-10m-marine-polys");
  const base = path.join(src.dir, "ne_10m_geography_marine_polys");
  const rows = readDbf(base + ".dbf", "utf8").rows;
  const recs = []; let i = 0;
  for (const rec of readShp(base + ".shp")) { const r = rows[i++]; recs.push({ r, parts: rec.parts.map((xy) => { const ring = []; for (let k = 0; k < xy.length; k += 2) ring.push([xy[k], xy[k + 1]]); return ring; }) }); }
  const namesOf = (r) => [r.name_en, r.name, r.namealt].filter(Boolean).map((s) => s.trim().toLowerCase());
  const byName = new Map(); recs.forEach((x) => namesOf(x.r).forEach((n) => { if (!byName.has(n)) byName.set(n, []); byName.get(n).push(x); }));
  const ringsOf = (name) => {
    const hit = byName.get(name.toLowerCase()) || []; if (!hit.length) return null;
    const qids = new Set(hit.map((x) => x.r.wikidataid).filter((q) => /^Q\d+$/.test(q)));
    const all = recs.filter((x) => hit.includes(x) || qids.has(x.r.wikidataid));
    return all.flatMap((x) => x.parts);
  };
  const { cards } = loadCards();
  const want = new Map();
  cards.forEach((c) => { const L = c.locator; if (!L || !Array.isArray(L.at) || !L.name || NOT_POINT.has(L.kind)) return; const k = L.name.trim().toLowerCase(); if (byName.has(k)) { if (!want.has(k)) want.set(k, []); want.get(k).push(c.id); } });
  const waters = {}, problems = [];
  [...want.keys()].sort().forEach((k) => {
    let rings = ringsOf(k);
    (PARTS[k] || []).forEach((p) => { const pr = ringsOf(p); if (!pr) problems.push(k + ": part not found: " + p); else rings = rings.concat(pr); });
    // a ring's tolerance is capped at a hundredth of its own size, so a strait 30 km long keeps its shape while an ocean's coast is cut to SIMPLIFY
    const eps = (ring) => { const xs = ring.map((p) => p[0]), ys = ring.map((p) => p[1]); return Math.min(SIMPLIFY, Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) / 100); };
    waters[k] = rings.map((ring) => dp(ring, eps(ring)).map((p) => [r2(p[0]), r2(p[1])])).filter((ring) => ring.length >= 4);
    if (!waters[k].length) problems.push(k + ": no ring survives simplification");
  });
  return { waters, want, problems };
}

const res = build();
if (res.problems.length) { console.error(res.problems.join("\n")); process.exit(1); }
const sources = headerSources(["ne-10m-marine-polys"]);
const body = "/* sources: " + JSON.stringify(sources) + " */\n" +
  "/* GENERATED by .claude/atlas-build/build-findit-waters.js — never hand-edit. Find it's sea and ocean outlines: lower-case locator name → rings of [lon, lat]. */\n" +
  "window.ATLAS_FINDIT_WATERS = " + JSON.stringify({ format: 1, simplify: SIMPLIFY, waters: res.waters }) + ";\n";
const pts = Object.values(res.waters).reduce((n, rs) => n + rs.reduce((m, r) => m + r.length, 0), 0);
console.log(Object.keys(res.waters).length + " waters (" + [...res.want.keys()].join(", ") + "), " + pts + " points, " + body.length + " bytes");
if (process.argv.includes("--install")) { fs.writeFileSync(OUT, body); console.log("wrote " + path.relative(ROOT, OUT)); }
