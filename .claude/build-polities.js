#!/usr/bin/env node
/* build-polities.js — cut Folio's DATED POLITY SERIES out of Cliopatria and write `polities.js`.

     node .claude/build-polities.js <cliopatria_polities_only.geojson> [--dry]

   WHAT IT IS FOR (Oct 2026; docs/atlas-borders-audit.md §5). A state or a war side on the personal atlas
   was ONE hand-drawn polygon of a dozen points for its whole span, so its borders were rough and did not
   move as the reader slid the year. Cliopatria (Seshat Global History Databank) gives each polity as a
   run of rows, each a shape with `FromYear`/`ToYear`, so "the shape in year y" is a lookup — and that is
   the whole of a border that changes with the slider. This script turns the rows a card needs into a
   lazy bundle (`polities.js`, `DATA_BUNDLES.polities` in app.js) and writes, beside them, which card
   draws which series.

   WHERE THE INPUT COMES FROM. Cliopatria is not vendored (it is 165 MB). Fetch it once:
       curl -sLO https://raw.githubusercontent.com/Seshat-Global-History-Databank/cliopatria/main/cliopatria.geojson.zip
       unzip cliopatria.geojson.zip      # → cliopatria_polities_only.geojson
   and pass the path. Never put it in the repo.

   LICENCE — AND WHY ONLY OPEN SOURCES ARE ACCEPTED HERE. Cliopatria is CC BY 4.0
   (https://creativecommons.org/licenses/by/4.0/): free to reuse commercially, on condition of credit, a
   licence link and a note of changes. The bundle's header carries all three, and the Atlas's help card
   carries the credit a reader sees. Folio takes border data ONLY from sources free for commercial reuse —
   public domain, CC0, CC BY, CC BY-SA, ODbL (Oct 2026, on request: "Ensure we only use open source/free
   info sources so we never have commercial rights problems"). A source marked non-commercial, "academic
   use", "no redistribution", paid or unlicensed is never an input to this script. See the audit's §3.

   WHAT IS CHANGED, so the "note of changes" is true:
     · OUTER RINGS ONLY. Holes (enclaves) are dropped; the atlas fills nonzero and draws at globe scale.
     · SIMPLIFIED, per ring, by Douglas–Peucker at `TOL` degrees, then rounded to 2 decimals. Per-ring
       simplification is wrong for the ERA maps, whose territories share borders that must stay
       bit-identical (build-era.js), and acceptable here: each series is drawn on its own, and two series
       that meet (Rome and Carthage in Sicily) may differ by a hair at the join.
     · SLIVERS DROPPED: a ring left with under 4 points, or a bounding box under `MIN_BOX` square degrees.
     · CLIPPED IN TIME to the spec's `years` AND to the years its linked cards are shown in (a step no card
       can show is dropped), and consecutive rows identical after simplification are joined into one step.

   THE SPEC is `.claude/polity-spec.json` — read its `_about`. A link names a card and either an `area`
   (the card's locator extent is drawn from the series) or `v` / `l` (a war side is). Every link is
   checked against the cards: a link to a card with no such side, or to a slug the spec does not define,
   is refused, because a link that resolves nothing draws the old polygon and looks like success.

   OUTPUT FORMAT, one series per line so a rebuild diffs per polity:
     window.POLITIES = { "<slug>": { n: label, s: [[from, to, rings], …] }, … };
     window.POLITY_LINKS = { "<card id>": { area|v|l: [slugs] }, … };
   A step's `rings` is a list of [[lon, lat], …]; steps are sorted and do not overlap.

   Zero dependencies. Not part of the site. */
"use strict";
const fs = require("fs"), path = require("path");
const { loadCards } = require("./card-io.js");

const ROOT = path.join(__dirname, "..");
const SPEC = path.join(__dirname, "polity-spec.json");
const OUT = path.join(ROOT, "polities.js");
const TOL = 0.03;          // degrees — about 3 km, finer than a pixel at any zoom a whole polity is seen at
const MIN_BOX = 0.0025;    // square degrees — a ring smaller than about 5 km across is a sliver at this scale

const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const src = args.find((a) => !a.startsWith("--"));
if (!src || !fs.existsSync(src)) {
  console.error("usage: node .claude/build-polities.js <cliopatria_polities_only.geojson> [--dry]\n(see this file's header for where to fetch it)");
  process.exit(1);
}
const die = (m) => { console.error("ERROR: " + m); process.exit(1); };

const spec = JSON.parse(fs.readFileSync(SPEC, "utf8"));
const P = spec.polities || {}, L = spec.links || {};

/* ---- the links are checked against the cards before anything is read from the 165 MB file ---- */
/* …and each series' NEEDED YEARS are gathered from the cards that link it: a step no linked card can
   show is never drawn, and France from 990 or Byzantium to 1474 for wars of a few decades was most of
   the bundle. A war's years are its `war.years` or its date line; an extent's are its date line — the
   same spans the atlas shows the mark in (app.js's `cardWarYears` / `cardSpanYears`, whose parser is
   sliced out of app.js here so the two cannot disagree). */
const cardYears = require("./card-links.js").loadCardYears(fs.readFileSync(path.join(ROOT, "app.js"), "utf8"));
const need = {};   // slug → [[from, to], …]
{
  const cards = new Map(loadCards().cards.map((c) => [c.id, c]));
  for (const id of Object.keys(L)) {
    const c = cards.get(id);
    if (!c) die("polity-spec links " + id + ", which is not a card");
    for (const k of Object.keys(L[id])) {
      if (["area", "v", "l"].indexOf(k) < 0) die(id + ": a link takes `area`, `v` or `l`, not `" + k + "`");
      const slugs = L[id][k];
      if (!Array.isArray(slugs) || !slugs.length) die(id + "." + k + " must be a non-empty list of slugs");
      for (const s of slugs) if (!P[s]) die(id + "." + k + " names \"" + s + "\", which the spec's `polities` does not define");
      if (k === "area" && !(c.locator && c.locator.area)) die(id + " has no locator `area` for a series to replace");
      if ((k === "v" || k === "l") && !c.war) die(id + " has no war block, so it has no `" + k + "` side");
      if ((k === "v" || k === "l") && c.war && c.war.group) die(id + " is a war that GROUPS other wars (`war.group`) and is not drawn on the atlas — link its parts instead");
      const ys = k !== "area" && c.war && Array.isArray(c.war.years) ? c.war.years.map(Number) : cardYears(c);
      if (!ys || !ys.length) die(id + " has no years, so nothing of a series could ever be drawn for it");
      // an extent's mark has no end year when its card gives one date — it then stands to the present
      const span = [Math.min.apply(null, ys), k === "area" && ys.length < 2 ? Infinity : Math.max.apply(null, ys)];
      for (const sl of slugs) (need[sl] = need[sl] || []).push(span);
    }
  }
}

/* ---- geometry ---- */
function dp(pts, tol) {   // Douglas–Peucker on an open polyline; the ring's closing point is handled by the caller
  if (pts.length < 3) return pts.slice();
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]], t2 = tol * tol;
  while (stack.length) {
    const [a, b] = stack.pop();
    const ax = pts[a][0], ay = pts[a][1], bx = pts[b][0], by = pts[b][1];
    const dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy;
    let best = -1, bd = t2;
    for (let i = a + 1; i < b; i++) {
      let px = pts[i][0] - ax, py = pts[i][1] - ay, d;
      if (len2 === 0) d = px * px + py * py;
      else { const t = Math.max(0, Math.min(1, (px * dx + py * dy) / len2)); px -= t * dx; py -= t * dy; d = px * px + py * py; }
      if (d > bd) { bd = d; best = i; }
    }
    if (best >= 0) { keep[best] = 1; stack.push([a, best], [best, b]); }
  }
  return pts.filter((p, i) => keep[i]);
}
function cleanRing(ring) {
  let pts = ring.map((p) => [Number(p[0]), Number(p[1])]);
  if (pts.length > 1 && pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1]) pts.pop();
  if (pts.length < 4) return null;
  // split at the point farthest from the first, so the closing edge is simplified too
  let far = 0, fd = -1;
  for (let i = 1; i < pts.length; i++) { const d = (pts[i][0] - pts[0][0]) ** 2 + (pts[i][1] - pts[0][1]) ** 2; if (d > fd) { fd = d; far = i; } }
  const a = dp(pts.slice(0, far + 1), TOL), b = dp(pts.slice(far).concat([pts[0]]), TOL);
  let out = a.concat(b.slice(1, -1)).map((p) => [Math.round(p[0] * 100) / 100, Math.round(p[1] * 100) / 100]);
  out = out.filter((p, i) => i === 0 || p[0] !== out[i - 1][0] || p[1] !== out[i - 1][1]);
  if (out.length < 4) return null;
  let x0 = 180, y0 = 90, x1 = -180, y1 = -90;
  for (const p of out) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
  if ((x1 - x0) * (y1 - y0) < MIN_BOX) return null;
  return out;
}
function outerRings(g) {
  if (!g) return [];
  if (g.type === "Polygon") return [g.coordinates[0]];
  if (g.type === "MultiPolygon") return g.coordinates.map((poly) => poly[0]);
  return [];
}

/* ---- read Cliopatria and cut each series ---- */
console.log("reading " + src + " …");
const fc = JSON.parse(fs.readFileSync(src, "utf8"));
const byName = new Map();
for (const f of fc.features || []) {
  const p = f.properties || {};
  if (p.Type && p.Type !== "POLITY") continue;
  if (!byName.has(p.Name)) byName.set(p.Name, []);
  byName.get(p.Name).push(f);
}
const out = {};
let pts = 0;
/* A COASTLINE SERIES (Oct 2026): a people whose extent IS a set of islands — the Cyclades, Crete — is drawn
   as those islands' own land rings, not as a blob round them. `coast: { country, points }` takes every ring
   of that world.js country holding one of the points (or, for a point just offshore, the ring with a vertex
   nearest it, within 0.25°), as ONE step spanning the years its cards are shown in. world.js is Natural
   Earth, public domain. The atlas clips a people's wash to the land it draws, so the ring only has to say
   WHICH land; the coast's precision is the land layer's. */
let WORLD = null;
function coastRings(def, slug) {
  if (!WORLD) { const w = {}; new Function("window", fs.readFileSync(path.join(ROOT, "world.js"), "utf8"))(w); WORLD = w.WORLD_GEO || []; }   // eslint-disable-line no-new-func
  const c = WORLD.find((x) => x.n === def.coast.country);
  if (!c) die(slug + ": world.js has no country \"" + def.coast.country + "\"");
  const pip = (r, x, y) => { let k = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const a = r[i], b = r[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) k = !k; } return k; };
  const picked = new Set();
  for (const [x, y] of def.coast.points) {
    let i = c.p.findIndex((r) => pip(r, x, y));
    if (i < 0) {
      let bd = 0.25 * 0.25;
      c.p.forEach((r, ri) => r.forEach((q) => { const d = (q[0] - x) ** 2 + (q[1] - y) ** 2; if (d < bd) { bd = d; i = ri; } }));
    }
    if (i < 0) die(slug + ": no " + def.coast.country + " ring at or near " + x + ", " + y);
    picked.add(i);
  }
  return [...picked].map((i) => c.p[i].map((q) => [Math.round(q[0] * 100) / 100, Math.round(q[1] * 100) / 100]));
}
for (const slug of Object.keys(P)) {
  const def = P[slug], lo = def.years ? def.years[0] : -Infinity, hi = def.years ? def.years[1] : Infinity;
  if (def.coast) {
    const n = need[slug] || [];
    if (!n.length) { console.warn("  " + slug.padEnd(14) + "WARNING: no card links it — skipped"); continue; }
    const a = Math.min.apply(null, n.map((x) => x[0])), b = Math.max.apply(null, n.map((x) => isFinite(x[1]) ? x[1] : x[0]));
    const rings = coastRings(def, slug);
    rings.forEach((r) => { pts += r.length; });
    out[slug] = { n: def.label || slug, s: [[a, b, rings]] };
    console.log("  " + slug.padEnd(14) + rings.length + " island rings (Natural Earth), " + a + " … " + b);
    continue;
  }
  const rows = [];
  for (const nm of def.cliopatria || []) {
    const r = byName.get(nm);
    if (!r) die(slug + ": Cliopatria has no polity named \"" + nm + "\"");
    rows.push(...r);
  }
  rows.sort((a, b) => a.properties.FromYear - b.properties.FromYear);
  const steps = [];
  for (const f of rows) {
    const a = Math.max(lo, f.properties.FromYear), b = Math.min(hi, f.properties.ToYear);
    if (a > b) continue;
    if (!(need[slug] || []).some((n) => a <= n[1] && b >= n[0])) continue;   // no linked card shows these years
    if (steps.length && a <= steps[steps.length - 1][1]) die(slug + ": rows overlap in time at " + a + " (" + f.properties.Name + ") — a series must be one shape per year");
    const rings = outerRings(f.geometry).map(cleanRing).filter(Boolean);
    if (!rings.length) continue;
    // consecutive rows that come out IDENTICAL after simplification are one step — same border, fewer bytes
    const prev = steps[steps.length - 1];
    if (prev && prev[1] + 1 === a && JSON.stringify(prev[2]) === JSON.stringify(rings)) { prev[1] = b; continue; }
    rings.forEach((r) => { pts += r.length; });
    steps.push([a, b, rings]);
  }
  /* A series with no step any linked card can show is dropped, WITH A WARNING, and taken out of the links:
     Han, the first of the six states Qin annexed, has no row inside the war's 230–221 BCE because it fell
     in 230 — which is history, not a fault, and the other five still draw. */
  if (!steps.length) {
    console.warn("  " + slug.padEnd(14) + "WARNING: no row overlaps the years its cards are shown in — dropped from the links");
    for (const id of Object.keys(L)) for (const k of Object.keys(L[id])) {
      L[id][k] = L[id][k].filter((x) => x !== slug);
      if (!L[id][k].length) delete L[id][k];
    }
    continue;
  }
  out[slug] = { n: def.label || slug, s: steps };
  console.log("  " + slug.padEnd(14) + steps.length + " steps, " + steps[0][0] + " … " + steps[steps.length - 1][1]);
}

const head = `/* polities.js — GENERATED by .claude/build-polities.js from .claude/polity-spec.json. Do not edit.
   Dated borders for the personal atlas: each series is a run of steps [from, to, rings], one shape per
   year, so a state or a war side changes as the reader slides the year. See docs/atlas-borders-audit.md.
   SOURCE: Cliopatria v0.2.0, Seshat Global History Databank (Ed Chalstrey, James Bennett et al.),
   https://github.com/Seshat-Global-History-Databank/cliopatria — doi:10.5281/zenodo.20274630.
   LICENCE: CC BY 4.0, https://creativecommons.org/licenses/by/4.0/
   …EXCEPT the coastline series (an island people drawn as its islands), whose rings are world.js's —
   Natural Earth, public domain.
   CHANGES MADE: outer rings only (holes dropped); each ring simplified (Douglas–Peucker, ${TOL}°) and
   rounded to 0.01°; slivers under ${MIN_BOX} square degrees dropped; consecutive identical rows joined;
   series clipped in time to the years
   Folio's cards need; several Cliopatria names joined into one series where they are one polity in
   succession (e.g. Roman Republic → Empire → Western Empire). */
`;
let body = head + "window.POLITIES = {\n";
body += Object.keys(out).map((s) => "  " + JSON.stringify(s) + ": " + JSON.stringify(out[s])).join(",\n");
body += "\n};\nwindow.POLITY_LINKS = {\n";
body += Object.keys(L).filter((id) => Object.keys(L[id]).length).sort().map((id) => "  " + JSON.stringify(id) + ": " + JSON.stringify(L[id])).join(",\n");
body += "\n};\n";
console.log(Object.keys(out).length + " series, " + pts + " points, " + (body.length / 1024).toFixed(0) + " KB, " + Object.keys(L).length + " card links");
if (DRY) { console.log("dry run — nothing written"); process.exit(0); }
fs.writeFileSync(OUT, body);
console.log("wrote " + path.relative(ROOT, OUT));
