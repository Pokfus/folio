/* test-land-change-rings.js — no stray line, no sliver and no isolated edge in the land-change layer at any year (2026-10-18; the owner's phone:
   "stray lines and double outlines in the sea", the IJsselmeer at 1660 CE; docs/atlas-v2-historical-coastlines.md §1.3).

     node .claude/test-land-change-rings.js          (Node only; the pixels are test-land-changes.js's)

   THE FAULT. atlas/data/land-changes.js held 34 rings for four polders and a nature reserve; 20 were under 0.05 km² (three single triangles), one hole was the 99 m wide strip of the
   Noordoostpolder's Ketelmeer dyke, and the Houtribdijk (a 68 m dyke built 1963–1976) was the first ring of the Oostelijk Flevoland row, so across the Markermeer there
   was a land hairline from 1957 to the year the dyke was built. Each drew, in a water year, as a dot or a line with an outline of its own. (The Houtribdijk and the Afsluitdijk are
   present-day land in the BASE map, not rows: the first is the first ring of the Oostelijk row, so it is water to 1956 and a hairline from 1957 until a row of its own exists —
   docs/atlas-v2-historical-coastlines.md §1.3 says why it was not made: the dyke joins the polder's polygon by a neck that has to be cut at a stated place.)
   WHAT IT PROVES, for every year in YEARS (1660, a year inside each interval between two reclamations, today):
     · every ring of every row that is WATER that year is at least MIN_RING_KM2 (0.05 km²) and every HOLE of one at least MIN_ISLAND_WIDTH_M (150 m) wide on average
       (2 × area ÷ perimeter) — an island of the old sea (Schokland, 394 m) stays, a dyke or a speck does not;
     · every stroked run of edges — edges against old land (code 1) in a water year, against another row (code ≥ 2) in a year that row is dry — is at least
       MIN_SHORE_RUN_M (1.5 km) long, unless the ring is one shore all round (an island): no isolated edge;
     · the rows' source, the CBS cache, is the one the file is built from (build-land-changes.js --check).
   Re-run after touching build-land-changes.js, land-changes.json or land-changes-source.json. */
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const B = require("./atlas-build/build-land-changes.js");
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  ok    " + name + (extra ? "  (" + extra + ")" : "")); } else { fail++; console.log("  FAIL  " + name + (extra ? "  (" + extra + ")" : "")); } };
const W = {}; new Function("window", fs.readFileSync(path.join(ROOT, "atlas/data/land-changes.js"), "utf8"))(W);
const T = W.ATLAS_LAND_CHANGES, q = T.quantum;
const YEARS = [1660, 1900, 1931, 1935, 1950, 1960, 1970, 1975, 1980, 2000, 2026];
const ptsOf = (f) => { const p = []; for (let i = 0; i < f.length; i += 2) p.push([f[i], f[i + 1]]); return p; };
const metres = (pts) => { const lat = pts[0][1] * q, kx = 111320 * Math.cos(lat * Math.PI / 180) * q, ky = 111320 * q; let per = 0, a = 0; for (let i = 0; i < pts.length; i++) { const u = pts[i], v = pts[(i + 1) % pts.length]; per += Math.hypot((v[0] - u[0]) * kx, (v[1] - u[1]) * ky); a += (u[0] * v[1] - v[0] * u[1]) * kx * ky; } return { per, area: a / 2 }; };
const rowIndex = new Map(T.rows.map((r, i) => [i, r]));
const waterIn = (r, y) => (r.from == null || y >= r.from) && y <= r.to;

console.log("\nthe rings and edges, year by year\n");
const small = [], thin = [], runs = [];
for (const y of YEARS) {
  for (const r of T.rows) {
    if (!waterIn(r, y)) continue;
    r.rings.forEach((f, ri) => {
      const pts = ptsOf(f), { per, area } = metres(pts), a = Math.abs(area) / 1e6;
      if (a < B.MIN_RING_KM2) small.push(`${y} ${r.id} ring ${ri}: ${a.toFixed(3)} km²`);
      if (area < 0 && (2 * Math.abs(area)) / per < B.MIN_ISLAND_WIDTH_M) thin.push(`${y} ${r.id} hole ${ri}: ${Math.round((2 * Math.abs(area)) / per)} m wide`);
      const codes = r.edges[ri], n = codes.length;
      const stroked = codes.map((c) => (c === 1 ? 1 : c >= 2 && !waterIn(rowIndex.get(c - 2), y) ? c : 0));
      if (stroked.every((c) => c === stroked[0] && c !== 0)) return;
      const len = pts.map((u, i) => metres([u, pts[(i + 1) % n]]).per / 2);
      const start = stroked.findIndex((c, i) => c !== stroked[(i + n - 1) % n]); if (start < 0) return;
      for (let k = 0; k < n;) { const c = stroked[(start + k) % n]; let j = k, m = 0; while (j < n && stroked[(start + j) % n] === c) { m += len[(start + j) % n]; j++; } if (c !== 0 && m < B.MIN_SHORE_RUN_M) runs.push(`${y} ${r.id} ring ${ri}: a ${Math.round(m)} m run`); k = j; }
    });
  }
}
check("no ring under 0.05 km² in any water year (" + YEARS.join(", ") + ")", small.length === 0, small.slice(0, 3).join("; "));
check("no hole under 150 m wide in any water year", thin.length === 0, thin.slice(0, 3).join("; "));
check("no stroked run under 1.5 km in any year: no isolated edge", runs.length === 0, runs.slice(0, 3).join("; "));
const tot = T.rows.reduce((s, r) => s + r.rings.length, 0);
check("the layer holds no more than 20 rings (it held 34 with the specks)", tot <= 20, tot + " rings");
check("Schokland (a real island, 394 m wide) is still a hole of the Noordoostpolder row", T.rows.find((r) => r.id === "lc:noordoostpolder").rings.some((f) => { const pts = ptsOf(f), m = metres(pts); return m.area < 0 && pts.every((p) => p[0] * q > 5.74 && p[0] * q < 5.80 && p[1] * q > 52.6 && p[1] * q < 52.68); }));
const st = B.build({ check: true });
check("atlas/data/land-changes.js is what the spec and the cache build", st.ok, st.why);
console.log(`\n${pass} ok, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
