#!/usr/bin/env node
/* audit-seats.js — the border audit of 2026-10-16 (docs/atlas-v2-border-audit.md): is every card-linked polity's own SEAT inside its
   faces, or within 2 km of their edge, at every step? And when not, WHY?

     node .claude/atlas-build/audit-seats.js [--write-known] [--write-doc] [--json file]       (from the repo root)

   Needs Cliopatria (`node .claude/atlas-build/fetch-sources.js cliopatria`), the committed land partition and history.bin.
   Reads the seats (lib/seats.js: the registry's capitals, else the card's own place), lists every failing (polity, seat, step) as year
   intervals, and CLASSES each against the raw Cliopatria row of the series (its polygon before any conflation):

     source  the raw row itself leaves the seat more than 2 km outside (or has no row alive): Cliopatria's own geometry or dating.
             Not drawn by hand and not bent here — listed, with a proposed sourced remedy, for the owner's decision.
     clip    the raw row holds the seat (inside, or within 2 km), the seat is NOT on the present OSM land, and the built face — land only —
             therefore cannot hold it: a coastal seat on the sea side of the coast ring.
     snap    the raw row holds the seat, the seat is on land, and the built face does not: a vertex moved by the coast (D1), present-day
             border (D3) or neighbour (D2) snap carried the edge across it, or the ring collapsed onto the coast.
     other   a failure that is neither the source's nor the build's: the SEAT STATEMENT is read outside its own dates (OVERRIDES below, each
             argued), an overlap handed to a neighbour, or a sliver merge — read by hand.

   `buildAdds` is how many metres FARTHER the built edge is than the raw one: a source fault the build made worse (the Roman Kingdom: 2.8 km
   in the source, 6.5 km after the D1 snap) is classed `source` and carries the figure.

   --write-known writes seats-known.json (the list check-history.js's "seats" rule reads); --write-doc rewrites the generated table of
   docs/atlas-v2-border-audit.md between its markers. Without either it prints the classed list. */
"use strict";
const fs = require("fs"), path = require("path");
const S = require("./lib/seats.js");

const ROOT = path.join(__dirname, "..", "..");
const argv = process.argv.slice(2);
const KNOWN = path.join(__dirname, "seats-known.json"), DOC = path.join(ROOT, "docs", "atlas-v2-border-audit.md");

const ctx = S.loadContext(ROOT), spec = ctx.spec;
const fi = argv.indexOf("--file"), Hq = require("./lib/historyq.js").open(fi >= 0 ? { file: argv[fi + 1] } : undefined);
const facts = S.seatFacts(Hq.header, ctx);
const rows = S.audit(Hq, facts);
console.log(`seats: ${facts.length} facts (${facts.filter((f) => f.src === "capital").length} capital, ${facts.filter((f) => f.src === "card").length} card place); failing (polity, seat, step) rows: ${rows.length}`);

/* ---- the raw Cliopatria rows ---- */
const clioFile = path.join(__dirname, "src", "cliopatria", "cliopatria_polities_only.geojson");
if (!fs.existsSync(clioFile)) { console.error("run `node .claude/atlas-build/fetch-sources.js cliopatria` first"); process.exit(2); }
const GJ = JSON.parse(fs.readFileSync(clioFile, "utf8"));
const byName = new Map(); for (const f of GJ.features) { const n = f.properties.Name; let l = byName.get(n); if (!l) byName.set(n, l = []); l.push(f); }
const rawRows = (key, y) => { const p = spec.polities[key], out = []; for (const nm of (p && p.cliopatria) || []) for (const f of byName.get(nm) || []) { let a = f.properties.FromYear, b = f.properties.ToYear; if (p.years) { a = Math.max(a, p.years[0]); b = Math.min(b, p.years[1]); } if (a <= y && y <= b) out.push(f); } return out; };
const ringsOfRow = (f) => { const g = f.geometry, polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates, rs = []; for (const pl of polys) for (const r of pl) rs.push(r); return rs; };
/* the raw row's verdict on a seat in a year: { n rows alive, dist (m; 0 inside) } */
const rawVerdict = (key, y, lon, lat) => { const fs_ = rawRows(key, y); let best = Infinity; for (const f of fs_) { const rs = ringsOfRow(f); const d = S.inRings(rs, lon, lat) ? 0 : S.distToRings(rs, lon, lat); if (d < best) best = d; } return { n: fs_.length, dist: fs_.length ? best : Infinity }; };

/* the land test, loaded once and only if a row needs it */
let land = null;
const onLand = (lon, lat) => { if (!land) { land = require("./lib/landindex.js").load(path.join(ROOT, "atlas", "data")); } const Q = 0.00025; return { land: land.isLand(Math.round(lon / Q), Math.round(lat / Q)), coastM: (land.nearestCoast(Math.round(lon / Q), Math.round(lat / Q), 30000) || { metres: null }).metres }; };

/* ---- class each row ---- */
/* The few failures whose cause is the SEAT STATEMENT's dating, not a border: each argued from the registry's own data (state-capitals-spec.json,
   frozen/state-capitals.json), never from outside it. Years are inclusive and must cover the failing step. */
const OVERRIDES = [
  { key: "pol:qin|Xianyang|capital", from: -750, to: -351, cause: "other", why: "the Xianyang row of the Qin-dynasty card (cnh-191) has no start or end qualifier and is read across the whole series (750 BCE on), while the dated Wikidata statement for the Qin state (cnh-155) reads 350–221 BCE: before 350 BCE the registry itself does not say Xianyang was Qin's seat" },
];
const TOL = S.SEAT_TOL_M;
for (const r of rows) {
  const f = r.fact, key = f.entity.replace("pol:", "");
  // the raw row is read at the overlap's two ends (the built face is one face across the step)
  const ys = [...new Set([r.from, r.to])];
  const v = ys.map((y) => rawVerdict(key, y, f.lon, f.lat));
  r.rawDist = Math.min(...v.map((x) => x.dist));
  const rawHolds = v.some((x) => x.n > 0 && x.dist <= TOL);
  if (!rawHolds) { r.cause = "source"; r.why = v.every((x) => x.n === 0) ? "Cliopatria has no row of the series alive" : `the raw row leaves it ${(r.rawDist / 1000).toFixed(1)} km outside`; }
  else {
    const L = onLand(f.lon, f.lat);
    if (!L.land) { r.cause = "clip"; r.why = `the seat is at sea by the OSM coast (${L.coastM == null ? "far from any coast" : (L.coastM / 1000).toFixed(1) + " km from it"}) — the face is land only`; }
    else { r.cause = "snap"; r.why = `the raw row holds it (${(r.rawDist / 1000).toFixed(1)} km from its edge), the built face does not`; }
  }
  const ov = OVERRIDES.find((o) => o.key === S.keyOf(f) && r.from >= o.from && r.to <= o.to); if (ov) { r.cause = ov.cause; r.why = ov.why; }
  r.buildAdds = Math.max(0, r.dist - (isFinite(r.rawDist) ? r.rawDist : r.dist));
}

/* ---- group: one entry per (polity, seat, source, cause) as year intervals ---- */
const groups = new Map();
for (const r of rows) {
  const k = S.keyOf(r.fact) + "|" + r.cause; let g = groups.get(k);
  if (!g) groups.set(k, g = { key: S.keyOf(r.fact), cause: r.cause, fact: r.fact, rows: [], why: new Set() });
  g.rows.push(r); g.why.add(r.why);
}
const entries = [];
for (const g of groups.values()) {
  const iv = S.intervals(g.rows).get(g.key);
  const maxDist = Math.max(...g.rows.map((r) => r.dist)), minDist = Math.min(...g.rows.map((r) => r.dist));
  const adds = Math.max(...g.rows.map((r) => r.buildAdds));
  const found = [...new Set(g.rows.flatMap((r) => r.found))].filter((x) => x !== g.fact.entity);
  entries.push({ key: g.key, entity: g.fact.entity, seat: g.fact.name, src: g.fact.src, card: g.fact.card, cause: g.cause, years: iv, minKm: minDist / 1000, maxKm: maxDist / 1000, buildAddsKm: adds / 1000, heldBy: found, why: [...g.why][0] });
}
entries.sort((a, b) => a.entity.localeCompare(b.entity) || a.seat.localeCompare(b.seat) || a.years[0][0] - b.years[0][0]);
const count = {}; for (const e of entries) count[e.cause] = (count[e.cause] || 0) + 1;
const rowCount = {}; for (const r of rows) rowCount[r.cause] = (rowCount[r.cause] || 0) + 1;
const polities = new Set(entries.map((e) => e.entity));
console.log(`entries (polity × seat × cause): ${entries.length} over ${polities.size} polities; by cause ${JSON.stringify(count)}; rows by cause ${JSON.stringify(rowCount)}`);
for (const e of entries) console.log(`${e.cause.padEnd(7)} ${e.entity} ${e.seat} [${e.src} ${e.card}] ${e.years.map((x) => x[0] === x[1] ? x[0] : x[0] + ".." + x[1]).join(", ")}  ${e.minKm.toFixed(1)}–${e.maxKm.toFixed(1)} km${e.buildAddsKm > 1 ? ` (build adds ${e.buildAddsKm.toFixed(1)})` : ""}${e.heldBy.length ? " held by " + e.heldBy.join("|") : ""}`);

const ji = argv.indexOf("--json"); if (ji >= 0) fs.writeFileSync(argv[ji + 1], JSON.stringify({ count, rowCount, entries }, null, 1));

if (argv.includes("--write-known")) {
  const out = { _about: "The seats of card-linked polities that lie outside their faces (more than 2 km from the edge) at some step, with the cause class of each (source, clip, snap, other) — GENERATED by audit-seats.js --write-known; read by check-history.js's `seats` rule, which fails on a seat/year that is not listed and on a key that no longer fails at all. Key: `polity|seat|source`; one part per cause. docs/atlas-v2-border-audit.md has the reasoning for each.", tolerance_m: TOL, entries: {} };
  for (const e of entries) (out.entries[e.key] || (out.entries[e.key] = [])).push({ cause: e.cause, years: e.years, ...(e.buildAddsKm > 1 ? { buildAddsKm: +e.buildAddsKm.toFixed(1) } : {}), why: e.why });
  fs.writeFileSync(KNOWN, JSON.stringify(out, null, 1) + "\n"); console.log("wrote " + path.relative(ROOT, KNOWN) + " (" + entries.length + " entries)");
}
if (argv.includes("--write-doc")) {
  const yrs = (iv) => iv.map((x) => (x[0] === x[1] ? fmtY(x[0]) : fmtY(x[0]) + "–" + fmtY(x[1]))).join(", ");
  const fmtY = (y) => (y <= 0 ? (1 - y) + " BCE" : y + " CE");
  let md = `<!-- generated:begin (audit-seats.js --write-doc; do not edit by hand) -->\n\n`;
  md += `**${facts.length} seats** (${facts.filter((f) => f.src === "capital").length} capital statements, ${facts.filter((f) => f.src === "card").length} card-place years) over the card-linked polities; **${rows.length} (polity, seat, step) rows fail**, which is **${entries.length} entries over ${polities.size} polities** once steps are merged into year intervals.\n\n`;
  md += `| cause | entries | rows |\n|---|---|---|\n` + S.CAUSES.map((c) => `| ${c} | ${count[c] || 0} | ${rowCount[c] || 0} |`).join("\n") + `\n\n`;
  md += `| polity | seat (source, card) | years | built km from the face | raw km from the row | cause | note |\n|---|---|---|---|---|---|---|\n`;
  for (const e of entries) {
    const rr = rows.filter((r) => S.keyOf(r.fact) === e.key && r.cause === e.cause); const rawMin = Math.min(...rr.map((r) => r.rawDist));
    md += `| ${e.entity.replace("pol:", "")} | ${e.seat} (${e.src}, ${e.card}) | ${yrs(e.years)} | ${e.minKm === e.maxKm ? e.minKm.toFixed(1) : e.minKm.toFixed(1) + "–" + e.maxKm.toFixed(1)} | ${isFinite(rawMin) ? (rawMin / 1000).toFixed(1) : "no row"} | ${e.cause} | ${e.why}${e.heldBy.length ? "; the point lies in " + e.heldBy.join(", ").replace(/pol:/g, "") : ""}${e.buildAddsKm > 1 ? `; **the build adds ${e.buildAddsKm.toFixed(1)} km**` : ""} |\n`;
  }
  md += `\n<!-- generated:end -->\n`;
  let doc = fs.existsSync(DOC) ? fs.readFileSync(DOC, "utf8") : "";
  const a = doc.indexOf("<!-- generated:begin"), b = doc.indexOf("<!-- generated:end -->");
  if (a >= 0 && b > a) doc = doc.slice(0, a) + md.trimEnd() + doc.slice(b + "<!-- generated:end -->".length); else doc += "\n" + md;
  fs.writeFileSync(DOC, doc); console.log("wrote the generated table of " + path.relative(ROOT, DOC));
}
