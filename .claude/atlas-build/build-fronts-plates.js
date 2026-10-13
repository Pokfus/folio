#!/usr/bin/env node
/* build-fronts-plates.js — the Second World War's front plates for the history file (Atlas v2 Phase 2d, task 3; docs/atlas-borders-audit.md §6, §7).

     node .claude/atlas-build/build-fronts-plates.js --fortnight=<fortnight.py's output.json> [--tol=0.03]
     node .claude/atlas-build/build-fronts-plates.js --check

   WHAT IT MAKES: .claude/atlas-build/fronts-plates.json — every plate of the front line the Atlas draws, each dated, with its four sets (Axis-held, Axis-occupied,
   Allied-held, Allied-occupied ground as lists of lon/lat rings, holes nested by depth) and the uncertainty it honestly carries. build-history.js reads it and
   turns the plates into dated event faces; it refuses a file that was not built from the two pinned sources (sources.json: `ww2-atlas-control`,
   `us-army-battlefront-atlas`), as it refuses site-hulls.json.

     · 1939–42, monthly (41 plates, 31 August 1939 – 31 December 1942): the Wikimedia Commons series "Second World War Europe MM YYYY de.svg" by San Jose (public domain),
       vectorised by ww2-atlas (data/territory/control, public domain), Europe only. The control the source shows at the END of each month — a secondary, edited map, not a daily
       front. Every ring of the source's four classes is kept (holes too) and simplified (Douglas–Peucker) at --tol degrees.
     · 1943–45, fortnightly: the plates of the US Army's Atlas of the World Battle Fronts in Semimonthly Phases (public domain), 1 July 1943 – 15 August 1945, read by
       .claude/ww2-plates/fortnight.py (Python, outside the repo) page by page: each georeferenced to its printed projection from its city rings, its fills classified,
       water given the class of the nearest ground, split into held and occupied ground, traced and simplified at 0.06°. A plate whose fit is not trustworthy is listed in
       `skipped` with the reason, never guessed. January – June 1943 has NO plate in either source: it is a gap, said, not filled.

   THE UNCERTAINTY each plate carries (`unc`): its class (always `approximate` — a plate is the situation on its date, redrawn from a map, never a surveyed line), the
   registration error in kilometres (the monthly source's own 0.46 px at 3.2 km/px; each plate's RMS in pixels × the km a pixel spans at that page's scale), and the sentence
   the place card says. A plate stands from its date until the next plate of its theatre, for at most STAND days (a gap draws nothing; "no source" is said). */
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const HERE = __dirname, ROOT = path.join(HERE, "..", "..");
const { ensureSource } = require("./fetch-sources.js");
const OUT_FILE = path.join(HERE, "fronts-plates.json");
const SRC = { control: "ww2-atlas-control", atlas: "us-army-battlefront-atlas" };
const ORDER = ["axis", "axis_occupied", "allied", "allied_occupied"];
const STAND = { monthly: 31, fortnight: 17 };   // days a plate stands after its date, at most: a month-end map to the next month-end (31 days), a fortnight's plate from the 15th to the 1st (17 days)

function dp(pts, tol) {
  if (pts.length < 3) return pts.slice();
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const st = [[0, pts.length - 1]], t2 = tol * tol;
  while (st.length) {
    const [a, b] = st.pop(), ax = pts[a][0], ay = pts[a][1], dx = pts[b][0] - ax, dy = pts[b][1] - ay, L = dx * dx + dy * dy;
    let best = -1, bd = t2;
    for (let i = a + 1; i < b; i++) { let px = pts[i][0] - ax, py = pts[i][1] - ay; if (L) { const t = Math.max(0, Math.min(1, (px * dx + py * dy) / L)); px -= t * dx; py -= t * dy; } const d = px * px + py * py; if (d > bd) { bd = d; best = i; } }
    if (best >= 0) { keep[best] = 1; st.push([a, best], [best, b]); }
  }
  return pts.filter((p, i) => keep[i]);
}
function ring(r, tol) {
  let p = r.map((q) => [Number(q[0]), Number(q[1])]);
  if (p.length > 1 && p[0][0] === p[p.length - 1][0] && p[0][1] === p[p.length - 1][1]) p.pop();
  if (p.length < 3) return null;
  p = dp(p.concat([p[0]]), tol).slice(0, -1).map((q) => [Math.round(q[0] * 100) / 100, Math.round(q[1] * 100) / 100]);
  p = p.filter((q, i) => i === 0 || q[0] !== p[i - 1][0] || q[1] !== p[i - 1][1]);
  return p.length >= 3 ? p : null;
}
const lastDay = (ym) => { const [y, m] = ym.split("-").map(Number); return ym + "-" + String(new Date(Date.UTC(y, m, 0)).getUTCDate()).padStart(2, "0"); };

function build(o) {
  o = o || {};
  const tol = o.tol || 0.03, ftol = o.ftol || 0.1;   // the plates are good to ~13 km (their fit RMS), so 0.1° (11 km) loses nothing the registration holds
  const ctl = ensureSource(SRC.control), atl = ensureSource(SRC.atlas);
  const plates = [], skipped = [];
  const idx = JSON.parse(fs.readFileSync(path.join(ctl.dir, "index.json"), "utf8"));
  for (const e of idx.months) {
    const fc = JSON.parse(fs.readFileSync(path.join(ctl.dir, e.file), "utf8")), sets = ORDER.map(() => []);
    for (const f of fc.features) {
      const k = ORDER.indexOf(f.properties.control); if (k < 0) throw new Error("unknown control value " + f.properties.control + " in " + e.file);
      const polys = f.geometry.type === "MultiPolygon" ? f.geometry.coordinates : [f.geometry.coordinates];
      for (const poly of polys) for (const r of poly) { const q = ring(r, tol); if (q) sets[k].push(q); }
    }
    plates.push({ date: lastDay(e.month), theatre: "eur", src: SRC.control, kind: "monthly", unc: { class: "approximate", rms_km: Math.round((e.rmse_px || 0.5) * 3.2 * 10) / 10, note: "The approximate control at the end of the month, Europe only: the source is a secondary, edited map, not a daily front. Rings simplified to about " + Math.round(tol * 111) + " km." }, sets });
  }
  if (o.fortnight) {
    const F = JSON.parse(fs.readFileSync(o.fortnight, "utf8"));
    for (const p of F.plates) plates.push({ date: p.date, theatre: p.theatre, src: SRC.atlas, kind: "fortnight", page: p.page, unc: { class: "approximate", rms_km: p.fit.rms_km, cities: p.fit.cities, note: "The situation on the plate's date in the US Army atlas (the period ending that day), fitted to the printed projection to an RMS of " + p.fit.rms_px + " px (about " + p.fit.rms_km + " km) from " + p.fit.cities + " city rings; the page's frame cuts a country in a straight line, pockets under about 10,000 km² are absorbed, and the rings are simplified to about " + Math.round(ftol * 111) + " km." }, sets: p.sets.map((st) => st.map((r) => ring(r, ftol)).filter(Boolean)) });
    for (const s of F.skipped || []) skipped.push(s);
  } else if (fs.existsSync(OUT_FILE)) {
    const prev = JSON.parse(fs.readFileSync(OUT_FILE, "utf8"));
    for (const p of prev.plates) if (p.kind === "fortnight") plates.push(p);
    for (const s of prev.skipped || []) skipped.push(s);
  }
  plates.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.theatre < b.theatre ? -1 : 1));
  const out = { _about: "GENERATED by .claude/atlas-build/build-fronts-plates.js (monthly part) and .claude/ww2-plates/fortnight.py (fortnightly part, run by hand) — never edit. Every plate of the Second World War front the Atlas draws: date, theatre, source, the uncertainty it carries and its four sets (axis, axis_occupied, allied, allied_occupied) as lon/lat rings, holes nested by depth. build-history.js reads it and checks the pinned source hashes. `stand`: the days a plate stands after its date, at most, before the next plate of its theatre replaces it (a gap draws nothing). January–June 1943 has no plate in either source.", sources: { [SRC.control]: ctl.sha256, [SRC.atlas]: atl.sha256 }, stand: STAND, order: ORDER, tolerance_deg: { monthly: tol, fortnight: ftol }, skipped, plates };
  const body = "{\n" + ["_about", "sources", "stand", "order", "tolerance_deg", "skipped"].map((k) => JSON.stringify(k) + ":" + JSON.stringify(out[k])).join(",\n") + ",\n\"plates\":[\n" + plates.map((p) => JSON.stringify(p)).join(",\n") + "\n]}\n";
  return { body, plates, skipped };
}
module.exports = { build, OUT_FILE, SRC, STAND, ORDER };
if (require.main === module) {
  const argv = process.argv.slice(2);
  const fort = (argv.find((a) => a.startsWith("--fortnight=")) || "").slice(12) || null, tol = Number((argv.find((a) => a.startsWith("--tol=")) || "").slice(6)) || 0.03;
  try {
    const r = build({ fortnight: fort, tol });
    if (argv.includes("--check")) { const have = fs.existsSync(OUT_FILE) ? fs.readFileSync(OUT_FILE, "utf8") : ""; const ok = have === r.body; console.log(ok ? "fronts-plates.json is what the pinned sources build" : "STALE — run build-fronts-plates.js --fortnight=…"); process.exit(ok ? 0 : 1); }
    fs.writeFileSync(OUT_FILE, r.body);
    const pts = r.plates.reduce((n, p) => n + p.sets.reduce((m, s) => m + s.reduce((k, q) => k + q.length, 0), 0), 0);
    console.log(`${r.plates.length} plates (${r.plates.filter((p) => p.kind === "monthly").length} monthly, ${r.plates.filter((p) => p.kind === "fortnight").length} fortnightly), ${pts} points, ${(Buffer.byteLength(r.body) / 1e6).toFixed(2)} MB; skipped ${r.skipped.length}`);
  } catch (e) { console.error(e.message); process.exit(1); }
}
