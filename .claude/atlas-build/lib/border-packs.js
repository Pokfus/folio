/* lib/border-packs.js — the BORDER PACKS of Atlas v2 (2026-11-20; docs/atlas-v2-border-packs.md): small lazy files in history.bin's format, each
   holding one or a few states in the years their cards need, conflated onto the committed core by build-history.js itself (`--pack <name>`) and
   against nothing else, so adding a state's borders never rebuilds history.bin.

   This module is the pack's half of build-history.js — the spec, the extract, the header, the file and its index — and the shared reader of the
   packs for check-border-packs.js and add-border.js:
     packSpec(name)            border-packs.json's pack → the polity-spec shape build-history.js reads (each year a one-year `rowsAt` step)
     packRows(name, clio, sha) the pack's Cliopatria rows from the committed extract border-packs-source.json; with `clio` (the pinned GeoJSON's
                               path) the extract's entry for the pack is rewritten first (`--extract`)
     finish(o)                 the header made a pack's, the bytes written; `check` compares them with the committed file instead
     indexText()               atlas/data/border-packs.js, a pure function of the committed pack files: id → pack, name, years
   Deterministic: no clock anywhere (`generated: null`), every table sorted — two runs give one sha256. */
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const F = require("./format.js");

const HERE = path.join(__dirname, ".."), ROOT = path.join(HERE, "..", ".."), DATA = path.join(ROOT, "atlas", "data"), OUT = path.join(HERE, "out");
const SPEC_FILE = path.join(HERE, "border-packs.json"), SRC_FILE = path.join(HERE, "border-packs-source.json");
const PACK_DIR = path.join(DATA, "borders"), INDEX_FILE = path.join(DATA, "border-packs.js");
const PACK_MAX_BYTES = 600 * 1024;     // one pack (the Russian Empire in two years, the largest of the first four, is printed by its build)
const PACKS_MAX_BYTES = 12e6;          // every pack together: what a reader could ever fetch for windows, history.bin's own stop rule
const YEAR_MIN = -3400, YEAR_MAX = 2021;   // Cliopatria's span, build-history.js's own
const KEY_RE = /^[a-z0-9_]+$/, NAME_RE = /^[a-z0-9][a-z0-9-]*$/;

const sha256 = (b) => crypto.createHash("sha256").update(b).digest("hex");
function readSpec() {
  const s = JSON.parse(fs.readFileSync(SPEC_FILE, "utf8"));
  if (!s || typeof s.packs !== "object") throw new Error("border-packs.json: no `packs`");
  return s;
}
/* every state of every pack, validated: a key no other source of entities carries (history.bin's spec, the war series, another pack) */
function allStates(spec) {
  spec = spec || readSpec();
  const main = new Set(Object.keys(JSON.parse(fs.readFileSync(path.join(ROOT, ".claude", "polity-spec.json"), "utf8")).polities).concat(Object.keys(JSON.parse(fs.readFileSync(path.join(HERE, "war-series.json"), "utf8")).polities)));
  const out = [], seen = new Map();
  for (const name of Object.keys(spec.packs).sort()) {
    if (!NAME_RE.test(name)) throw new Error(`border-packs.json: pack "${name}" — lowercase letters, digits and hyphens`);
    const p = spec.packs[name]; if (!p || typeof p.states !== "object" || !Object.keys(p.states).length) throw new Error(`border-packs.json: pack ${name} has no states`);
    for (const key of Object.keys(p.states)) {
      const st = p.states[key];
      if (!KEY_RE.test(key)) throw new Error(`border-packs.json: ${name}: state key "${key}" — lowercase letters, digits and underscores (the entity id is pol:<key>)`);
      if (main.has(key)) throw new Error(`border-packs.json: ${name}: "${key}" is a series of polity-spec.json or war-series.json — history.bin carries pol:${key}, so a pack must not (one id, one source)`);
      if (seen.has(key)) throw new Error(`border-packs.json: "${key}" is in packs ${seen.get(key)} and ${name}`);
      seen.set(key, name);
      if (typeof st.label !== "string" || !st.label.trim()) throw new Error(`border-packs.json: ${key}: no label`);
      if (!Array.isArray(st.cliopatria) || !st.cliopatria.length || !st.cliopatria.every((n) => typeof n === "string" && n)) throw new Error(`border-packs.json: ${key}: \`cliopatria\` must list Cliopatria names`);
      if (!Array.isArray(st.years) || !st.years.length || !st.years.every((y) => Number.isInteger(y) && y >= YEAR_MIN && y <= YEAR_MAX)) throw new Error(`border-packs.json: ${key}: \`years\` must be integers in ${YEAR_MIN}..${YEAR_MAX}`);
      for (let i = 1; i < st.years.length; i++) if (st.years[i] <= st.years[i - 1]) throw new Error(`border-packs.json: ${key}: \`years\` must ascend without repeats`);
      if (st.cards && !(Array.isArray(st.cards) && st.cards.every((c) => typeof c === "string"))) throw new Error(`border-packs.json: ${key}: \`cards\` must list card ids`);
      /* `rowYears` (2026-11-26, rm-343: the Republic BEFORE Caesar's conquests drawn in the window's year of his death, so the
         Republic of that year, in the same pack, keeps only what he added): { "<year>": <the year whose row draws it> } — build-history.js
         `rowsAt`'s third element. The row must be alive in that year, exactly as for a plain year. */
      const ry = st.rowYears || {};
      if (typeof ry !== "object" || Array.isArray(ry) || !Object.entries(ry).every(([y, r]) => st.years.includes(Number(y)) && Number.isInteger(r) && r >= YEAR_MIN && r <= YEAR_MAX)) throw new Error(`border-packs.json: ${key}: \`rowYears\` maps one of its years to an integer year`);
      out.push({ pack: name, key, id: "pol:" + key, label: st.label, cliopatria: st.cliopatria.slice(), years: st.years.slice(), rowYears: Object.assign({}, ry), cards: (st.cards || []).slice().sort(), why: st.why || "" });
    }
  }
  return out;
}
function packSpec(name) {
  const spec = readSpec();
  if (!spec.packs[name]) throw new Error(`border-packs.json has no pack "${name}" (add-border.js writes one)`);
  const states = allStates(spec).filter((s) => s.pack === name);
  const polities = {}, links = {};
  for (const s of states) {
    // each year is a one-year step drawn by the Cliopatria row alive in it (build-history.js `rowsAt`, which stops the build unless exactly one row is)
    polities[s.key] = { label: s.label, cliopatria: s.cliopatria, rowsAt: s.years.map((y) => (s.rowYears && s.rowYears[y] != null ? [y, y, s.rowYears[y]] : [y, y])) };
    for (const c of s.cards) { const o = links[c] || (links[c] = {}); (o.area || (o.area = [])).push(s.key); }
  }
  return { polities, links };
}
/* the extract: for each pack, the Cliopatria rows of its states' names alive in one of the state's years, exactly as the pinned GeoJSON has them
   (properties trimmed to what build-history.js reads; a coordinate round-trips through JSON unchanged) */
function packRows(name, clioFile, clioSha, spec) {
  let X = fs.existsSync(SRC_FILE) ? JSON.parse(fs.readFileSync(SRC_FILE, "utf8")) : null;
  if (clioFile) {
    const GJ = JSON.parse(fs.readFileSync(clioFile, "utf8"));
    const feats = [];
    for (const f of GJ.features) {
      const p = f.properties;
      for (const [key, pol] of Object.entries(spec.polities)) {
        if (!pol.cliopatria.includes(p.Name)) continue;
        if (!pol.rowsAt.some(([y, , r]) => p.FromYear <= (r == null ? y : r) && p.ToYear >= (r == null ? y : r))) continue;
        feats.push({ type: "Feature", properties: { Name: p.Name, FromYear: p.FromYear, ToYear: p.ToYear, Wikidata: p.Wikidata || null, Wikipedia: p.Wikipedia || null, Area: p.Area }, geometry: f.geometry });
        break;
      }
    }
    feats.sort((a, b) => (a.properties.Name < b.properties.Name ? -1 : a.properties.Name > b.properties.Name ? 1 : a.properties.FromYear - b.properties.FromYear));
    if (!X || !X.source || X.source.sha256 !== clioSha) X = { _about: X && X._about, source: { id: "cliopatria", sha256: clioSha }, packs: {} };
    X._about = "GENERATED by `build-history.js --pack <name> --extract` (lib/border-packs.js) from the pinned Cliopatria v0.2.0 file: for each border pack, the rows of its states alive in the years border-packs.json asks for, as the source has them. build-history.js --pack reads this, never the source, so `--check` runs offline. Never edit by hand.";
    X.packs[name] = { features: feats };
    const names = Object.keys(X.packs).sort(), lines = ["{", `"_about": ${JSON.stringify(X._about)},`, `"source": ${JSON.stringify(X.source)},`, `"packs": {`];
    names.forEach((n, i) => { lines.push(`${JSON.stringify(n)}: {"features": [`); const fs_ = X.packs[n].features; fs_.forEach((f, j) => lines.push(JSON.stringify(f) + (j + 1 < fs_.length ? "," : ""))); lines.push("]}" + (i + 1 < names.length ? "," : "")); });
    lines.push("}", "}", "");
    fs.writeFileSync(SRC_FILE, lines.join("\n"));
    console.log(`  extract: ${feats.length} Cliopatria row(s) for pack ${name} written to border-packs-source.json`);
  }
  if (!X) throw new Error("border-packs-source.json is missing: run build-history.js --pack " + name + " --extract (needs fetch-sources.js cliopatria)");
  if (!X.source || X.source.sha256 !== clioSha) throw new Error(`border-packs-source.json was extracted from Cliopatria ${X.source && X.source.sha256}, not the pinned ${clioSha}: re-run --extract for every pack`);
  if (!X.packs[name]) throw new Error(`border-packs-source.json has no rows for pack ${name}: run build-history.js --pack ${name} --extract`);
  return { features: X.packs[name].features };
}

const packFile = (name) => path.join(PACK_DIR, name + ".bin");
/* the header made a pack's, then the bytes: written to out/packs/, installed, or compared with the committed file */
function finish(o) {
  const { pack, topology: T, say } = o;
  const states = allStates().filter((s) => s.pack === pack);
  const h = T.extra.history || {};
  T.sources = T.sources.slice(0, 3);   // Cliopatria, the OSM coast and Natural Earth's admin-0: the only sources a pack's faces and arcs name (SRC_IDX 0..2)
  if (T.sources.map((s) => s.id).join(",") !== "cliopatria,osm-land-polygons,ne-10m-admin0") throw new Error("a pack's sources are not Cliopatria, the OSM coast and admin-0");
  T.generator = T.generator + " --pack " + pack;
  const extra = {
    kindOf: "border-pack", core: T.extra.core,
    pack: {
      name: pack,
      note: "A BORDER PACK (docs/atlas-v2-border-packs.md): states drawn only in the years the cards that name them need, for the card windows. Conflated onto the core by build-history.js's own rules but against no other state, so a pack's borders are not snapped to history.bin's neighbours of the same year. Not drawn on the Atlas page, the Personal Atlas, the past-states layer, the search or the glossary.",
      states: states.map((s) => ({ id: s.id, label: s.label, cliopatria: s.cliopatria, years: s.years, cards: s.cards })),
      tolerances_m: h.tolerances_m, d1_m: h.d1_m, d2_m: h.d2_m, d3_m: h.d3_m, run_factor: h.run_factor, sliver_km2: h.sliver_km2, sliver_width_m: h.sliver_width_m, classes: h.classes,
      licence: "ODbL-1.0 as a whole, as history.bin: junctions snapped onto OpenStreetMap geometry and the OSM coast referenced by arc id; Cliopatria's rows (CC BY 4.0) are the borders.",
    },
    faceClass: T.extra.faceClass, arcClass: T.extra.arcClass, arcEmpty: T.extra.arcEmpty, faceKm2: T.extra.faceKm2, faceAnchor: T.extra.faceAnchor,
  };
  T.extra = extra;
  const bytes = F.write(T), sha = sha256(bytes);
  // every state has a face in every year it asks for (a row the coast swallows whole would leave a year with nothing to draw)
  const ents = T.entities;
  for (const s of states) { const ei = ents.findIndex((e) => e.id === s.id); if (ei < 0) throw new Error(`pack ${pack}: ${s.id} has no entity (no face survived the conflation)`); for (const y of s.years) if (!T.steps.some((st) => st[0] === ei && st[1] <= y && st[2] >= y)) throw new Error(`pack ${pack}: ${s.id} has no face in ${y}`); }
  say(`pack ${pack}: ${bytes.length} bytes (${(bytes.length / 1024).toFixed(1)} KB), sha256 ${sha}; ${ents.length} entities, ${T.steps.length} steps, ${T.faces.length} faces, ${T.arcs.length} arcs (${T.coreRef.filter((r) => r.core >= 0).length} core references)`);
  for (const s of states) { const ei = ents.findIndex((e) => e.id === s.id); for (const y of s.years) { const km2 = T.steps.filter((st) => st[0] === ei && st[1] <= y && st[2] >= y).reduce((t, st) => t + (T.extra.faceKm2[st[3]] || 0), 0); say(`  ${s.id} in ${y}: ${km2.toLocaleString("en-GB")} km² of land`); } }
  if (bytes.length > PACK_MAX_BYTES) throw new Error(`pack ${pack} is ${bytes.length} bytes, over its ${PACK_MAX_BYTES} budget: split it`);
  if (o.check) {
    const f = packFile(pack);
    if (!fs.existsSync(f)) { console.error(`✗ atlas/data/borders/${pack}.bin is missing`); process.exit(1); }
    const old = fs.readFileSync(f);
    if (sha256(old) !== sha) { console.error(`✗ atlas/data/borders/${pack}.bin is not what its inputs build (committed ${sha256(old).slice(0, 16)}…, built ${sha.slice(0, 16)}…): run build-history.js --pack ${pack} --install`); process.exit(1); }
    console.log(`✓ atlas/data/borders/${pack}.bin is exactly what border-packs.json, its extract and the core build`);
    return;
  }
  fs.mkdirSync(path.join(OUT, "packs"), { recursive: true });
  fs.writeFileSync(path.join(OUT, "packs", pack + "-report.json"), JSON.stringify({ pack, bytes: bytes.length, sha256: sha, snaps: o.log.summary(), result: o.report.result || null }, null, 1));
  if (o.dry) return;
  fs.writeFileSync(path.join(OUT, "packs", pack + ".bin"), bytes);
  say(`wrote out/packs/${pack}.bin`);
  if (o.install) {
    fs.mkdirSync(PACK_DIR, { recursive: true });
    fs.writeFileSync(packFile(pack), bytes);
    fs.writeFileSync(INDEX_FILE, indexText());
    say(`installed atlas/data/borders/${pack}.bin and regenerated atlas/data/border-packs.js`);
    try { require("../build-credits.js").build({ install: true }); } catch (e) { say("credits: " + e.message); }
  }
}
/* the committed packs, read */
function committedPacks() {
  if (!fs.existsSync(PACK_DIR)) return [];
  return fs.readdirSync(PACK_DIR).filter((n) => /\.bin$/.test(n)).sort().map((n) => { const bytes = fs.readFileSync(path.join(PACK_DIR, n)); return { name: n.slice(0, -4), bytes, T: F.read(new Uint8Array(bytes)) }; });
}
/* atlas/data/border-packs.js: what a card window needs to know before it fetches a pack — which pack holds an id, its name and the years it has */
function indexText() {
  const packs = {}, ids = {};
  for (const p of committedPacks()) {
    packs[p.name] = { file: "borders/" + p.name + ".bin", bytes: p.bytes.length, sha256: sha256(p.bytes) };
    const H = p.T.header;
    H.entities.forEach((e, i) => {
      const steps = H.steps.filter((st) => st[0] === i).map((st) => [st[1], st[2]]).sort((a, b) => a[0] - b[0]);
      ids[e.id] = { pack: p.name, name: e.name, steps };
    });
  }
  const sortObj = (o) => Object.fromEntries(Object.keys(o).sort().map((k) => [k, o[k]]));
  return "/* sources: [] */\n"
    + "/* atlas/data/border-packs.js — GENERATED by .claude/atlas-build/lib/border-packs.js (build-history.js --pack <name> --install) from the committed\n"
    + "   atlas/data/borders/*.bin. Do not edit. Which border pack holds a state's id, and the years it is drawn: a card window's members group names\n"
    + "   `pol:<key>` exactly as for history.bin, and the window fetches the pack named here (docs/atlas-v2-border-packs.md). The packs' sources are in\n"
    + "   their own headers. */\n"
    + "window.ATLAS_BORDER_PACKS = " + JSON.stringify({ format: 1, packs: sortObj(packs), ids: sortObj(ids) }) + ";\n";
}

module.exports = { SPEC_FILE, SRC_FILE, PACK_DIR, INDEX_FILE, PACK_MAX_BYTES, PACKS_MAX_BYTES, readSpec, allStates, packSpec, packRows, finish, committedPacks, indexText, packFile };
