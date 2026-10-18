#!/usr/bin/env node
/* build-polity-names.js — atlas/data/polity-names.js, the dated display names of the polities (Atlas v2 Phase 4, task 0c; the row names added 2026-10-18)

     node .claude/atlas-build/build-polity-names.js [--install] [--check] [--rows]

   TWO KINDS OF DATED NAME, one table { entityId: [[from, to, name, qid?]…] } the Atlas applies at display time (the label layout, the place card and the stack show `name`
   in the years from–to and the entity's own name in every other; nothing in history.bin changes):
     · ROW NAMES (2026-10-18, the owner's phone: Rome read "ROME" at 18 CE). A series that Cliopatria carries as several rows with different names — Roman Republic, Roman Empire,
       Western Roman Empire; Northern Song and Southern Song; Kanem and Bornu — is labelled by the row alive in the displayed year, with the row's OWN name and the years
       of the row. `--rows` reads Cliopatria (src/cliopatria, fetch-sources.js verifies its sha256) through polity-spec.json and war-series.json exactly as build-history.js
       selects a series' rows (every row of the series' `cliopatria` names, clipped to the series' `years`; rows of one series never overlap) and writes polity-row-names.json,
       the committed cache that makes this build and --check offline. Nothing is typed: a name and a year are a row's `Name`, `FromYear` and `ToYear`. A year the rows give a
       name for and no other source disputes is the row's; the boundary between two rows is Cliopatria's (Rome: the Republic's last year is 32 BCE, the Empire's first 31 BCE).
     · PLACE NAMES (2026-10-18): place-names.json dates the name of a REGISTRY row (a gazetteer or places.js id) — the IJsselmeer's lake is the Zuiderzee to 1931 and the IJsselmeer from 1932 — each
       entry with its Wikidata evidence; the id must be a registry row and the years may not overlap. The table is keyed by id, so the page and the worker apply it to polities and places alike.
     · WIKIDATA OVERRIDES (Phase 4): polity-names.json, written by a person from audit-polity-names.js's report, each naming its Wikidata evidence (Kingdom of Hungary from 1920,
       Federal State of Austria from 1934). An override beats a row name in the years it covers (the row's run is cut around it).
   `sources` is Cliopatria's entry copied from history.bin's header (the row names and years are CC BY 4.0 data); the overrides' evidence is in each entry (Wikidata, CC0).
   --check regenerates in memory and exits 1 when the committed file lags polity-names.json, polity-row-names.json or history.bin (the overrides are verified first by
   audit-polity-names.js --check; the row cache is verified against history.bin's entities, and against Cliopatria itself when src/ holds it). */
"use strict";
const fs = require("fs"), path = require("path"), cp = require("child_process");
const HERE = __dirname, ROOT = path.join(HERE, "..", "..");
const SPEC = JSON.parse(fs.readFileSync(path.join(HERE, "polity-names.json"), "utf8")), OUT = path.join(ROOT, "atlas", "data", "polity-names.js");
const ROWS_FILE = path.join(HERE, "polity-row-names.json"), PLACES_FILE = path.join(HERE, "place-names.json");
const F = require("./lib/format.js");
const header = () => F.read(fs.readFileSync(path.join(ROOT, "atlas", "data", "history.bin")), { headerOnly: true }).header;

/* the rows of every series with Cliopatria rows, as build-history.js reads them: [entityKey, [[from, to, name]…] merged per name], for the series whose rows carry more than one name */
function deriveRows() {
  const { ensureSource } = require("./fetch-sources.js");
  ensureSource("cliopatria", { verifyOnly: true });
  const file = path.join(HERE, "src", "cliopatria", "cliopatria_polities_only.geojson");
  if (!fs.existsSync(file)) throw new Error("run fetch-sources.js cliopatria first (" + file + ")");
  const GJ = JSON.parse(fs.readFileSync(file, "utf8")), byName = new Map();
  for (const f of GJ.features) { const n = f.properties.Name; let l = byName.get(n); if (!l) byName.set(n, l = []); l.push(f); }
  const polities = Object.assign({}, JSON.parse(fs.readFileSync(path.join(ROOT, ".claude", "polity-spec.json"), "utf8")).polities, JSON.parse(fs.readFileSync(path.join(HERE, "war-series.json"), "utf8")).polities);
  const H = header(), ids = new Set(H.entities.map((e) => e.id)), out = {};
  for (const [key, p] of Object.entries(polities)) {
    if (!p.cliopatria || !ids.has("pol:" + key)) continue;
    const rows = [];
    for (const name of p.cliopatria) for (const f of byName.get(name) || []) { let from = f.properties.FromYear, to = f.properties.ToYear; if (p.years) { from = Math.max(from, p.years[0]); to = Math.min(to, p.years[1]); } if (from <= to) rows.push([from, to, name]); }
    if (new Set(rows.map((r) => r[2])).size < 2) continue;
    rows.sort((a, b) => a[0] - b[0] || a[2].localeCompare(b[2]));
    const runs = [];
    for (const r of rows) { const last = runs[runs.length - 1]; if (last && last[2] === r[2] && r[0] <= last[1] + 1) last[1] = Math.max(last[1], r[1]); else runs.push(r.slice()); }
    for (let i = 1; i < runs.length; i++) if (runs[i][0] <= runs[i - 1][1]) throw new Error(`series ${key}: rows ${runs[i - 1][2]} ${runs[i - 1][0]}–${runs[i - 1][1]} and ${runs[i][2]} ${runs[i][0]}–${runs[i][1]} overlap`);
    out["pol:" + key] = runs;
  }
  const clio = (JSON.parse(fs.readFileSync(path.join(HERE, "sources.json"), "utf8")).sources || []).find((s) => s.id === "cliopatria");
  return { _about: "GENERATED by build-polity-names.js --rows from Cliopatria (src/cliopatria, sha256 verified by fetch-sources.js): for every series of polity-spec.json / war-series.json whose rows carry more than one Name, the runs of years each Name is alive (the rows' FromYear and ToYear, clipped to the series' `years`, consecutive rows of one name joined). Committed so the build and its --check are offline; `--rows --check` re-derives it when src/ is present.", source: { id: "cliopatria", sha256: clio.sha256 }, entities: Object.fromEntries(Object.entries(out).sort(([a], [b]) => (a < b ? -1 : 1))) };
}
const rowsText = (o) => JSON.stringify(o, null, 1) + "\n";

/* pure: the table from the overrides, the row runs and history.bin's entities; { names, evidence } */
function tableOf(overrides, rowNames, H, places) {
  const names = {}, evidence = {};
  for (const o of (places || []).slice().sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : a.from - b.from))) { (names[o.id] = names[o.id] || []).push([o.from, o.to, o.name, o.qid]); evidence[o.qid] = o.evidence; }
  for (const o of overrides.slice().sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : a.from - b.from))) { (names[o.id] = names[o.id] || []).push([o.from, o.to, o.name, o.qid]); evidence[o.qid] = o.evidence; }
  const have = new Map(H.entities.map((e) => [e.id, e]));
  for (const [id, runs] of Object.entries(rowNames.entities)) {
    const e = have.get(id); if (!e) throw new Error("polity-row-names.json names " + id + ", which history.bin does not hold: re-run --rows");
    const known = new Set(e.sourceNames || []); for (const r of runs) if (!known.has(r[2])) throw new Error(`${id}: the row name "${r[2]}" is not one of history.bin's source names (${[...known].join(" | ")}): re-run --rows`);
    let pieces = runs.map((r) => [r[0], r[1], r[2]]);
    for (const o of overrides.filter((x) => x.id === id)) pieces = pieces.flatMap((p) => (p[1] < o.from || p[0] > o.to ? [p] : [p[0] < o.from ? [p[0], o.from - 1, p[2]] : null, p[1] > o.to ? [o.to + 1, p[1], p[2]] : null].filter(Boolean)));
    names[id] = (names[id] || []).concat(pieces).sort((a, b) => a[0] - b[0]);
  }
  for (const id of Object.keys(names)) for (let i = 1; i < names[id].length; i++) if (names[id][i][0] <= names[id][i - 1][1]) throw new Error(`${id}: two dated names overlap (${names[id][i - 1].join(",")} / ${names[id][i].join(",")})`);
  return { names: Object.fromEntries(Object.keys(names).sort().map((k) => [k, names[k]])), evidence };
}
function build() {
  const H = header();
  const rowNames = JSON.parse(fs.readFileSync(ROWS_FILE, "utf8"));
  const places = JSON.parse(fs.readFileSync(PLACES_FILE, "utf8")).names;
  const R = require(path.join(ROOT, ".claude", "places-registry.js")), reg = R.loadRegistry({ entities: false });
  for (const o of places) { const row = reg.rows.get(o.id); if (!row) throw new Error("place-names.json: " + o.id + " is not a registry row"); if (!o.evidence || !/^Q\d+$/.test(o.qid) || !(o.from <= o.to) || !o.name) throw new Error("place-names.json: " + o.id + " " + o.name + " needs a name, years, a Wikidata item and its evidence"); }
  const { names, evidence } = tableOf(SPEC.overrides, rowNames, H, places);
  const clio = (H.sources || []).find((s) => s.id === "cliopatria");
  if (!clio) throw new Error("history.bin's header has no cliopatria source");
  const sources = [{ id: clio.id, name: clio.name, version: clio.version, url: clio.url, licence: clio.licence, licenceUrl: clio.licenceUrl, attribution: clio.attribution, retrieved: clio.retrieved, sha256: clio.sha256 }];
  if (rowNames.source.sha256 !== clio.sha256) throw new Error("polity-row-names.json was derived from Cliopatria " + rowNames.source.sha256 + ", history.bin from " + clio.sha256 + ": re-run --rows");
  return `/* sources: ${JSON.stringify(sources)} */
/* atlas/data/polity-names.js — GENERATED by .claude/atlas-build/build-polity-names.js from polity-row-names.json (Cliopatria's rows) and polity-names.json (Wikidata overrides) (docs/atlas-v2-design.md §7 "Phase 4 — as built", "Data faults of 2026-10-18"). Do not edit.
   Display names for polities in the years a row of the series carries a different name (Cliopatria's own Name, FromYear and ToYear: [from, to, name]) or Wikidata dates one ([from, to, name, qid], \`evidence\`); the entity's own name stands in every other year. history.bin is untouched. */
window.ATLAS_POLITY_NAMES = ${JSON.stringify({ format: 1, names, evidence })};
`;
}
if (require.main === module) {
  if (process.argv.includes("--rows")) {
    const body = rowsText(deriveRows());
    if (process.argv.includes("--check")) { const cur = fs.existsSync(ROWS_FILE) ? fs.readFileSync(ROWS_FILE, "utf8") : ""; if (cur !== body) { console.error("polity-row-names.json lags Cliopatria: run build-polity-names.js --rows"); process.exit(1); } console.log("build-polity-names --rows --check ok: " + Object.keys(JSON.parse(body).entities).length + " series with several row names"); }
    else { fs.writeFileSync(ROWS_FILE, body); console.log("wrote polity-row-names.json (" + Object.keys(JSON.parse(body).entities).length + " series)"); }
    process.exit(0);
  }
  const r = cp.spawnSync(process.execPath, [path.join(HERE, "audit-polity-names.js"), "--check"], { encoding: "utf8" });
  if (r.status !== 0) { process.stderr.write(r.stderr || r.stdout); process.exit(1); }
  const body = build();
  if (process.argv.includes("--check")) {
    const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
    if (cur !== body) { console.error("atlas/data/polity-names.js lags polity-names.json / polity-row-names.json / history.bin: run build-polity-names.js --install"); process.exit(1); }
    console.log("build-polity-names --check ok: " + SPEC.overrides.length + " overrides, " + Object.keys(JSON.parse(fs.readFileSync(ROWS_FILE, "utf8")).entities).length + " series with row names");
  } else if (process.argv.includes("--install")) { fs.writeFileSync(OUT, body); console.log("wrote " + path.relative(ROOT, OUT) + " (" + body.length + " bytes)"); }
  else process.stdout.write(body);
}
module.exports = { tableOf, build, deriveRows, ROWS_FILE, OUT };
