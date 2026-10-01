#!/usr/bin/env node
/* check-coast-fit.js — where do the generated borders still miss the coast? (report only)

     node .claude/check-coast-fit.js [--top=25]

   WHAT IT IS FOR (Oct 2026, on request: "implement the border fixes that you recommend" — the third of
   them was an automatic check). The Atlas now strokes a dated step's land borders only and paints a band
   of the fill `SNAP_KM` (7 km) along its coasts (app.js's `stepEdges` / `snapBand`; geo-util's `edgeRuns`),
   which closes the sliver a coast drawn a few km inland leaves. A coast drawn FURTHER inland than the band
   still leaves dark shore, and this script finds where: for every step of `polities.js` and
   `country-series.js` it walks each COAST edge and probes world.js's land at the band's reach on the
   outward side. Land there means the shore beyond the band is unclaimed. It ranks the steps by the length
   of such edges, so the worst offenders can be fixed first (a `coast` series, a hand-traced outline, or a
   wider band for that polity).

   Zero dependencies. Not part of the site. */
"use strict";
const fs = require("fs"), path = require("path");
const { landGrid, ccw } = require("./geo-util.js");
const ROOT = path.join(__dirname, "..");
const TOP = Number((process.argv.find((a) => a.startsWith("--top=")) || "--top=25").slice(6));
const BAND = 7 / 111;   // the atlas's SNAP_KM in degrees of latitude

const win = {};
for (const f of ["world.js", "polities.js", "country-series.js"]) new Function("window", fs.readFileSync(path.join(ROOT, f), "utf8"))(win);   // eslint-disable-line no-new-func
const grid = landGrid(win.WORLD_GEO, 0.05);

function audit(rings, runs) {
  let coastKm = 0, missKm = 0;
  rings.forEach((r0, k) => {
    const r = ccw(r0), rr = runs[k] || [r.length];
    let e = 0, coast = true;
    for (const cnt of rr) {
      for (let t = 0; t < cnt && e < r.length; t++, e++) {
        if (!coast) continue;
        const a = r[e], b = r[(e + 1) % r.length];
        const km = Math.hypot((b[0] - a[0]) * Math.cos((a[1] + b[1]) / 2 * Math.PI / 180), b[1] - a[1]) * 111;
        coastKm += km;
        // a CCW ring has its outside on the RIGHT of each edge
        const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = (b[1] - a[1]) / L, ny = -(b[0] - a[0]) / L;
        const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        if (grid.at(mx + nx * BAND * 1.2, my + ny * BAND * 1.2)) missKm += km;
      }
      coast = !coast;
    }
  });
  return { coastKm, missKm };
}

const rows = [];
for (const [slug, ser] of Object.entries(win.POLITIES || {})) for (const st of ser.s) {
  if (!Array.isArray(st[3])) continue;
  const a = audit(st[2], st[3]);
  rows.push({ what: "polity " + slug, years: st[0] + "…" + st[1], ...a });
}
for (const [name, steps] of Object.entries(win.COUNTRY_STEPS || {})) for (const st of steps) {
  if (!st[2] || !Array.isArray(st[3])) continue;
  const a = audit(st[2], st[3]);
  rows.push({ what: "country " + name, years: st[0] + "…" + st[1], ...a });
}
rows.sort((x, y) => y.missKm - x.missKm);
const tot = rows.reduce((s, r) => ({ c: s.c + r.coastKm, m: s.m + r.missKm }), { c: 0, m: 0 });
console.log(rows.length + " steps; coast " + Math.round(tot.c) + " km, of which " + Math.round(tot.m) + " km (" + (100 * tot.m / (tot.c || 1)).toFixed(1) + "%) still misses the shore by more than the band");
console.log("\nworst " + TOP + " steps (km of coast drawn further inland than the band):");
rows.slice(0, TOP).forEach((r) => console.log("  " + String(Math.round(r.missKm)).padStart(6) + " km  of " + String(Math.round(r.coastKm)).padStart(6) + "  " + r.what + "  " + r.years));
