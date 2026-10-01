#!/usr/bin/env node
/* build-country-series.js — batch 7 of docs/atlas-borders-audit.md: a country's border YEAR BY YEAR between
   the era maps, from Cliopatria. Writes `country-series.js` (DATA_BUNDLES.countrysteps).

     node .claude/build-country-series.js <cliopatria_polities_only.geojson> [--dry]

   THE PROBLEM. The personal atlas draws a country the reader has unlocked in the shape the ERA MAP for the
   year gives it, and there are thirteen era maps: 1500, 1600, 1700, 1800, 1900, 1920, 1938, 1960, 1994,
   2000, 2010 and the present. Poland is one shape from 1700 to 1799 through three partitions; Germany is
   one shape from 1960 to 1993 — and, in the 1960 map, the unified one. Borders did not move with the year.

   THE RULE, AND WHY IT KEEPS EVERYTHING ELSE AS IT WAS. WHEN a country is on the globe stays what the era
   maps say (a name on that era's map, `mineFounded` for the founding year) — that is a judgement about what
   counts as "Germany" in 1900, and Folio's maps already make it. Only the SHAPE between two maps changes:
     1. for every country name a card resolves through the era maps (a geography card's `map.key`, a war
        side's `keys`), and every era from 1700 on that carries it, the era's shape is matched against the
        Cliopatria polities alive in the era's year — the best overlap (IoU on a 0.1° grid) wins, and only
        at IoU ≥ MATCH;
     2. for each year until the next era map, that polity's own row is used — but ONLY where it really
        differs from the era shape (IoU < SAME). Where they agree the era shape stays, because it is
        coast-matched to world.js and Cliopatria's coast is not; where they disagree wildly (IoU < SANE) the
        row is distrusted and the era shape stays too;
     3. if the matched polity ENDS before the next era map and that map no longer carries the name, the
        country is HIDDEN from the year after it ended (the USSR, 1992–1993) — a `null` step.
   Rows that agree with the era map cost nothing; the bundle holds only real, year-dated differences.

   DRAWING. A step carries its rings (fill, clipped to land by the atlas) and its EDGES as runs of coast and
   land border (geo-util's `edgeRuns`): the atlas strokes the borders only, so Cliopatria's coarser coast is
   never drawn beside world.js's, and paints a band of fill along the coasts, which closes the sliver of
   unclaimed shore a coast drawn inland leaves (Oct 2026; a coast drawn inland used to read as land on both
   sides and was stroked as a border — the gold line inside Estonia's shore).

   LICENCE. Cliopatria is CC BY 4.0 (credited in the bundle header and the Atlas help card); world.js is
   Natural Earth (public domain); timeline.js is the era maps already shipped. Open and free sources only —
   see the audit's §3.

   Zero dependencies. Not part of the site. */
"use strict";
const fs = require("fs"), path = require("path");
const { simplifyRing, outerRings, Mask, landTester, edgeRuns, landGrid, coastSnap, ccw, RES } = require("./geo-util.js");
const { loadCards } = require("./card-io.js");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "country-series.js");
const FROM = 1700, TOL = 0.04, MIN_BOX = 0.01;
const MATCH = 0.5, SAME = 0.9, SANE = 0.35, MOVE = 0.95, FAR = 0.75, INSIDE = 0.85;
const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const src = args.find((a) => !a.startsWith("--"));
if (!src || !fs.existsSync(src)) { console.error("usage: node .claude/build-country-series.js <cliopatria_polities_only.geojson> [--dry] (see build-polities.js for where to fetch it)"); process.exit(1); }

const load = (f) => { const w = {}; new Function("window", fs.readFileSync(path.join(ROOT, f), "utf8"))(w); return w; };   // eslint-disable-line no-new-func
const WORLD = load("world.js").WORLD_GEO;
const ERAS = load("timeline.js").TIMELINE.filter((e) => e && typeof e.year === "number").sort((a, b) => a.year - b.year);
const onLand = landTester(WORLD);
const GRID = landGrid(WORLD, 0.05);
/* OVERLAP IS MEASURED ON LAND ONLY. Cliopatria's coast and its islands are not world.js's, so a whole-mask
   IoU called Canada's Arctic, Norway's skerries and Chile's fjords "a different border" and replaced a
   precise, coast-matched shape with a coarser one for decades in which nothing moved. A cell counts only
   if its centre is on world.js land — cached, since the same cells come up in every era. */
const landCell = new Map();
const isLand = (c) => { let v = landCell.get(c); if (v === undefined) { const gy = Math.floor(c / 100000), gx = c - gy * 100000; v = onLand((gx + 0.5) * RES, (gy + 0.5) * RES); landCell.set(c, v); } return v; };
/* …AND ON 0.5° CELLS, not the mask's 0.1°: at the fine grid two sources' islands land in different cells and
   an unchanged archipelago (the Philippines) scored 0.71 against itself, where a real change — East Germany
   leaving the shape — is a contiguous block that survives any grid. A coarse cell counts when it holds land
   of the shape. */
const COARSE = 5;
const coarseCache = new WeakMap();
function coarse(m) {
  let s = coarseCache.get(m); if (s) return s;
  s = new Set();
  for (const c of m.cells) if (isLand(c)) { const gy = Math.floor(c / 100000), gx = c - gy * 100000; s.add(Math.floor(gy / COARSE) * 100000 + Math.floor(gx / COARSE)); }
  coarseCache.set(m, s); return s;
}
// how much of b lies inside a — on the same coarse land cells
function inside(a, b) {
  const A = coarse(a), B = coarse(b);
  let inter = 0; for (const c of B) if (A.has(c)) inter++;
  return B.size ? inter / B.size : 0;
}
function landIou(a, b) {
  if (a.bb[2] < b.bb[0] || b.bb[2] < a.bb[0] || a.bb[3] < b.bb[1] || b.bb[3] < a.bb[1]) return 0;
  const A = coarse(a), B = coarse(b);
  let inter = 0; for (const c of A) if (B.has(c)) inter++;
  const uni = A.size + B.size - inter;
  return uni ? inter / uni : 0;
}

// the names a card resolves through the era maps
const NAMES = new Set();
for (const c of loadCards().cards) {
  if (c.map && c.map.key && (c.map.layer || "world") === "world") [].concat(c.map.key).forEach((k) => NAMES.add(String(k).toLowerCase()));
  if (c.war && !c.war.group) for (const s of [c.war.victors, c.war.losers]) for (const k of (s && s.keys) || []) NAMES.add(String(k).toLowerCase());
}

// an era's shape for every name it carries: its own territories, or (a grouping era) world.js merged by group
function eraShapes(e) {
  const m = new Map();
  const add = (n, rings) => { const k = String(n || "").toLowerCase(); if (!k) return; if (!m.has(k)) m.set(k, []); m.get(k).push(...rings); };
  if (e.geo && e.geo.length) e.geo.forEach((t) => add(t.n, t.p || []));
  else WORLD.forEach((g) => add((e.groups || {})[g.n] || g.n, g.p || []));
  return m;
}

console.log("reading Cliopatria …");
const rows = JSON.parse(fs.readFileSync(src, "utf8")).features.filter((f) => f.properties && f.properties.Type === "POLITY" && f.properties.ToYear >= FROM);
const byName = new Map();
rows.forEach((f) => { const n = f.properties.Name; if (!byName.has(n)) byName.set(n, []); byName.get(n).push(f); });
byName.forEach((l) => l.sort((a, b) => a.properties.FromYear - b.properties.FromYear));
const maskCache = new Map();
const maskOf = (f) => { if (!maskCache.has(f)) maskCache.set(f, Mask(outerRings(f.geometry))); return maskCache.get(f); };

const out = {};
let steps = 0, hidden = 0, pts = 0, matched = 0, kept = 0;
const eras = ERAS.filter((e) => e.year >= FROM && !e.present && e.year < ERAS[ERAS.length - 1].year);
for (let ei = 0; ei < eras.length; ei++) {
  const e = eras[ei], next = ERAS[ERAS.indexOf(e) + 1];
  if (!next) continue;
  const end = next.year - 1, here = eraShapes(e), there = eraShapes(next);
  const alive = rows.filter((f) => f.properties.FromYear <= e.year && f.properties.ToYear >= e.year);
  for (const [name, rings] of here) {
    if (!NAMES.has(name)) continue;
    const S = Mask(rings);
    /* ONLY THE PART OF A ROW NEAR THIS COUNTRY. Cliopatria draws a colonial power as one polity, so the row
       that holds the 1900 Philippines also holds Hawaii, Guam and Puerto Rico. A row is cut to the rings whose
       box meets this country's own box widened by a quarter of its size (at least 5°): a conquest next door
       (Germany into Poland, 1939) is kept, a colony an ocean away is not. Masks are per country and era. */
    const sb = S.bb, padX = Math.max(5, (sb[2] - sb[0]) / 4), padY = Math.max(5, (sb[3] - sb[1]) / 4);
    const near = [sb[0] - padX, sb[1] - padY, sb[2] + padX, sb[3] + padY];
    const nearCache = new Map();
    const nearRings = (f) => outerRings(f.geometry).filter((r) => { let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity; for (const p of r) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; } return !(x1 < near[0] || x0 > near[2] || y1 < near[1] || y0 > near[3]); });
    const nearMask = (f) => { if (!nearCache.has(f)) nearCache.set(f, Mask(nearRings(f))); return nearCache.get(f); };
    let best = null, bi = 0;
    for (const f of alive) {
      const m = nearMask(f);
      if (m.bb[2] < S.bb[0] || S.bb[2] < m.bb[0] || m.bb[3] < S.bb[1] || S.bb[3] < m.bb[1]) continue;
      const v = landIou(S, m); if (v > bi) { bi = v; best = f; }
    }
    if (!best || bi < MATCH) continue;
    matched++;
    const series = byName.get(best.properties.Name).filter((f) => f.properties.ToYear >= e.year && f.properties.FromYear <= end);
    const list = out[name] = out[name] || [];
    /* A CHANGE, NOT A DISAGREEMENT. Use Cliopatria's rows for this stretch only if its shape actually MOVES
       inside it (two rows under MOVE of each other) or its first row is far from the era map (under FAR).
       Otherwise Cliopatria and the era map simply draw the same unchanging country differently — the
       Philippines' islands, Chile's coast — and replacing a coast-matched shape with a coarser one for
       forty years in which nothing moved would be a loss dressed as an improvement. */
    // only rows that ARE this country's shape: Cliopatria files a power's colonies under its own name, so
    // "United States of America" also holds the Philippines — rows far from the era shape belong elsewhere
    const inRange = series.filter((f) => Math.max(e.year, f.properties.FromYear) <= Math.min(end, f.properties.ToYear) && landIou(S, nearMask(f)) >= SANE);
    let moves = false;
    for (let i = 1; i < inRange.length && !moves; i++) if (landIou(nearMask(inRange[i - 1]), nearMask(inRange[i])) < MOVE) moves = true;
    /* …and FAR only where the era map OVER-CLAIMS — the row lies (≥ INSIDE) within the era shape, as West
       Germany lies within the unified Germany the 1960 map draws. A row that ADDS land elsewhere (Cliopatria's
       "United States of America" carrying Hawaii and Puerto Rico beside the Philippines) is a different
       claim about a different thing, not a correction, and is never drawn under this name. */
    const far = inRange.length && landIou(S, nearMask(inRange[0])) < FAR && inside(S, nearMask(inRange[0])) >= INSIDE;
    // (the ending check runs whatever is decided about the shape — see below)
    const last = series.length ? series[series.length - 1].properties.ToYear : end;
    const ended = last < end && !there.has(name);
    if (process.env.DEBUG_NAME === name) console.log("  DEBUG", name, e.year, best.properties.Name, bi.toFixed(2), inRange.map((f) => f.properties.FromYear + ":" + landIou(S, nearMask(f)).toFixed(2)).join(" "));
    if (!moves && !far) {
      kept += inRange.length;
      if (ended) { list.push([last + 1, end, null, null]); hidden++; }
      if (!list.length) delete out[name];
      continue;
    }
    for (const f of series) {
      const a = Math.max(e.year, f.properties.FromYear), b = Math.min(end, f.properties.ToYear);
      if (a > b) continue;
      const v = landIou(S, nearMask(f));
      if (v >= SAME || v < SANE) { kept++; continue; }   // the era shape already says this, or the row cannot be trusted
      if (inside(S, nearMask(f)) < 0.5) { kept++; continue; }   // most of the row is somewhere the era shape is not — another claim (colonies), not this border
      const rs = nearRings(f).map((r) => simplifyRing(r, TOL, MIN_BOX)).filter(Boolean);
      if (!rs.length) continue;
      const prev = list[list.length - 1];
      if (prev && prev[2] && prev[1] + 1 === a && JSON.stringify(prev[2]) === JSON.stringify(rs.map(ccw))) { prev[1] = b; continue; }
      // CCW, and each edge classed coast or land border — a coast drawn inland is not a border (geo-util's
      // `coastSnap` / `edgeRuns`; the atlas strokes the borders and paints a band of fill along the coasts)
      const rc = rs.map(ccw), edges = edgeRuns(rc, GRID.at, 0.06, coastSnap(rc, GRID).inSnap);
      rc.forEach((r) => { pts += r.length; });
      list.push([a, b, rc, edges]); steps++;
    }
    // the polity ENDED before the next map, and that map no longer carries the name: gone from the year after
    if (ended) { list.push([last + 1, end, null, null]); hidden++; }
    if (!list.length) delete out[name];
  }
}
for (const k of Object.keys(out)) out[k].sort((x, y) => x[0] - y[0]);

const head = `/* country-series.js — GENERATED by .claude/build-country-series.js. Do not edit.
   Batch 7 of docs/atlas-borders-audit.md: where a country's border moved BETWEEN two of the Atlas's era
   maps, the year-dated shape, keyed by the lowercased name the era maps use. A step is [from, to, rings,
   edges] — "edges" is each ring's edges as runs of coast and land border (geo-util's edgeRuns) — or [from, to, null, null] where the state had ended before the next map. A year with no
   step draws the era map's own shape, unchanged.
   SOURCE: Cliopatria v0.2.0, Seshat Global History Databank (Ed Chalstrey, James Bennett et al.),
   https://github.com/Seshat-Global-History-Databank/cliopatria — doi:10.5281/zenodo.20274630.
   LICENCE: CC BY 4.0, https://creativecommons.org/licenses/by/4.0/
   CHANGES MADE: each country matched to the Cliopatria polity that best overlaps its era-map shape; only
   rows that differ from that shape kept; outer rings only, simplified (Douglas–Peucker, ${TOL}°), rounded to
   0.01°; turned counter-clockwise; each edge classed as coast or land border against world.js (Natural Earth,
   public domain), a coast drawn inland of world.js's counting as coast. */
`;
const body = head + "window.COUNTRY_STEPS = {\n" + Object.keys(out).sort().map((k) => "  " + JSON.stringify(k) + ": " + JSON.stringify(out[k])).join(",\n") + "\n};\n";
console.log(matched + " country-eras matched, " + Object.keys(out).length + " countries with steps, " + steps + " steps (" + hidden + " endings), " + kept + " rows agreeing with the era map, " + pts + " points, " + (body.length / 1024).toFixed(0) + " KB");
if (DRY) { const sz = Object.keys(out).map((k) => [k, JSON.stringify(out[k]).length, out[k].map((s) => s[0] + "-" + s[1] + (s[2] ? "" : "(gone)")).join(" ")]).sort((x, y) => y[1] - x[1]); sz.slice(0, 15).forEach((x) => console.log("  " + x[0] + " " + (x[1] / 1024).toFixed(0) + "KB  " + x[2].slice(0, 160))); for (const k of ["poland", "germany", "ussr", "france", "united states of america", "russia"]) if (out[k]) console.log("  [" + k + "] " + out[k].map((s) => s[0] + "-" + s[1] + (s[2] ? "" : "(gone)")).join(" ")); process.exit(0); }
fs.writeFileSync(OUT, body);
console.log("wrote country-series.js");
