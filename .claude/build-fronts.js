#!/usr/bin/env node
/* build-fronts.js — the Second World War's FRONTS, one map a year from 1939 to 1945, for the personal atlas.

     node .claude/build-fronts.js <ww2-atlas/data/territory/control> <plates-years.json> [--dry]

   WHY (Oct 2026, on request: "Add front line border maps for World War 2 if that's the only one you can
   find", then "use the plates, but remember we only need year by year border changes, not month by month").
   The Second World War card GROUPS other war cards (`war.group`), so it is not shaded as two sides on the
   atlas; what it gets instead is who held what — Axis, Axis-occupied, Allied, Allied-occupied — and the line
   where the two meet is the front. The atlas's rail moves by years, so there is one map a year.

   TWO PUBLIC-DOMAIN SOURCES, checked at both ends (open and free sources only — docs/atlas-borders-audit.md §3):
   · 1939–1942: the `data/territory/control` files of ww2-atlas (https://github.com/tanimutomo/ww2-atlas), whose
     data/LICENSE lists them as public domain — a machine conversion of the Wikimedia Commons series "Second
     World War Europe MM YYYY de.svg" by the user San Jose, each file PD-self on Commons (checked 2026-10-01).
     The DECEMBER map of each year, the situation at its end. EUROPE ONLY; North Africa essentially absent.
   · 1943–1945: the US Army's "Atlas of the World Battle Fronts in Semimonthly Phases to August 15, 1945"
     (PD-USGov-Military-Army), Europe AND the Pacific, georeferenced and read by .claude/ww2-plates/compose.py
     into <plates-years.json>. 1943 and 1944 are the plates nearest the year's end (1 Jan 1944; 15 Nov 1944 under
     1 Jan 1945); 1945 is the last plates, the fronts at the surrenders (1 May in Europe, 15 Aug in the Pacific).
   Fetch the control folder from that repository (raw.githubusercontent.com works where github.com does not)
   and pass its path; never commit it, nor the plates.

   OUTPUT: `fronts.js`, a lazy bundle (`DATA_BUNDLES.fronts`):
     window.WW2_FRONTS = { card: "ww2-001", y: { "1939": [axis, axisOccupied, allied, alliedOccupied], … },
                           at: { "1939": ["1939-12"], "1943": ["1944-01-01", "1944-01-01"], … } }
   each set a list of rings, Douglas–Peucker at TOL° and rounded to 0.01°. The 1939–42 sets are outer rings
   only; the plate years' sets carry HOLES (a pocket of one side inside the other), so the atlas fills every
   set even-odd. `at` is the date of each map a year is drawn from.

   Zero dependencies. Not part of the site. */
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "fronts.js");
const TOL = 0.02;

function dp(pts, tol) {
  if (pts.length < 3) return pts.slice();
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const st = [[0, pts.length - 1]], t2 = tol * tol;
  while (st.length) {
    const [a, b] = st.pop(), ax = pts[a][0], ay = pts[a][1], dx = pts[b][0] - ax, dy = pts[b][1] - ay, L = dx * dx + dy * dy;
    let best = -1, bd = t2;
    for (let i = a + 1; i < b; i++) {
      let px = pts[i][0] - ax, py = pts[i][1] - ay;
      if (L) { const t = Math.max(0, Math.min(1, (px * dx + py * dy) / L)); px -= t * dx; py -= t * dy; }
      const d = px * px + py * py; if (d > bd) { bd = d; best = i; }
    }
    if (best >= 0) { keep[best] = 1; st.push([a, best], [best, b]); }
  }
  return pts.filter((p, i) => keep[i]);
}
function frontRing(r) {
  let p = r.map((q) => [Number(q[0]), Number(q[1])]);
  if (p.length > 1 && p[0][0] === p[p.length - 1][0] && p[0][1] === p[p.length - 1][1]) p.pop();
  if (p.length < 3) return null;
  p = dp(p.concat([p[0]]), TOL).slice(0, -1).map((q) => [Math.round(q[0] * 100) / 100, Math.round(q[1] * 100) / 100]);
  p = p.filter((q, i) => i === 0 || q[0] !== p[i - 1][0] || q[1] !== p[i - 1][1]);
  return p.length >= 3 ? p : null;
}
const ORDER = ["axis", "axis_occupied", "allied", "allied_occupied"];
module.exports = { frontRing, ORDER };
if (require.main !== module) return;

const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const [dir, platesFile] = args.filter((a) => !a.startsWith("--"));
if (!dir || !fs.existsSync(path.join(dir, "index.json")) || !platesFile || !fs.existsSync(platesFile)) {
  console.error("usage: node .claude/build-fronts.js <ww2-atlas/data/territory/control> <plates-years.json> [--dry]"); process.exit(1);
}
const idx = JSON.parse(fs.readFileSync(path.join(dir, "index.json"), "utf8"));
const y = {}, at = {};
let pts = 0;
// 1939–1942: each year's DECEMBER map from the vector source
for (const e of idx.months) {
  if (!/^\d{4}-12$/.test(e.month)) continue;
  const fc = JSON.parse(fs.readFileSync(path.join(dir, e.file), "utf8"));
  const sets = ORDER.map(() => []);
  for (const f of fc.features) {
    const k = ORDER.indexOf(f.properties.control);
    if (k < 0) { console.error("unknown control value " + f.properties.control + " in " + e.file); process.exit(1); }
    const polys = f.geometry.type === "MultiPolygon" ? f.geometry.coordinates : [f.geometry.coordinates];
    for (const poly of polys) { const r = frontRing(poly[0]); if (r) { sets[k].push(r); pts += r.length; } }
  }
  y[e.month.slice(0, 4)] = sets; at[e.month.slice(0, 4)] = [e.month];
}
// 1943–1945: the plates, as compose.py wrote them (rings already traced, simplified and rounded)
const plates = JSON.parse(fs.readFileSync(platesFile, "utf8"));
for (const yr of Object.keys(plates)) {
  if (!/^\d{4}$/.test(yr)) continue;
  if (y[yr]) { console.error("year " + yr + " is in both sources"); process.exit(1); }
  const sets = plates[yr].map((set) => set.map((r) => r.map((q) => [Math.round(q[0] * 100) / 100, Math.round(q[1] * 100) / 100])).filter((r) => r.length >= 3));
  if (sets.length !== 4) { console.error("year " + yr + " has " + sets.length + " sets, not 4"); process.exit(1); }
  sets.forEach((st) => st.forEach((r) => { pts += r.length; }));
  y[yr] = sets; at[yr] = (plates._dates || {})[yr] || [];
}
const years = Object.keys(y).sort();
const head = `/* fronts.js — GENERATED by .claude/build-fronts.js. Do not edit.
   The Second World War, one map a year (${years[0]} … ${years[years.length - 1]}): for each year, the ground held by the
   Axis, occupied by the Axis, held by the Allies and occupied by the Allies — the approximate situation on
   the dates in \`at\`, not a daily front. 1939–42 is Europe only (North Africa and Asia are not in that source);
   1943–45 adds the Pacific. SOURCES, both public domain: Wikimedia Commons, "Second World War Europe MM YYYY
   de.svg" by San Jose (PD-self), vectorised by ww2-atlas (https://github.com/tanimutomo/ww2-atlas,
   data/territory/control, public domain); and the US Army's "Atlas of the World Battle Fronts in Semimonthly
   Phases to August 15, 1945" (PD-USGov-Military-Army), georeferenced and read by .claude/ww2-plates/.
   CHANGES MADE: 1939–42 outer rings only; 1943–45 traced from the plates on a 0.1° grid, with holes (fill
   even-odd), split into held and occupied ground; all simplified (Douglas–Peucker) and rounded to 0.01°. */
`;
const body = head + "window.WW2_FRONTS = { card: \"ww2-001\", at: " + JSON.stringify(at) + ", y: {\n" + years.map((k) => "  " + JSON.stringify(k) + ": " + JSON.stringify(y[k])).join(",\n") + "\n} };\n";
console.log(years.length + " years, " + pts + " points, " + (body.length / 1024).toFixed(0) + " KB");
if (DRY) process.exit(0);
fs.writeFileSync(OUT, body);
console.log("wrote fronts.js");
