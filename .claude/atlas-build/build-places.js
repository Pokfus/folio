#!/usr/bin/env node
/* build-places.js — the Phase 3 places file: atlas/data/places.js from places-spec.json (Atlas v2 Phase 3a;
   docs/atlas-v2-design.md §2.8, §7 "Phase 3a — as built").

     node .claude/atlas-build/build-places.js [--install] [--dry] [--check]

   WHAT IT WRITES: out/places.js (and with --install, atlas/data/places.js, then credits.js through build-credits.js) —
   `window.ATLAS_PLACES`, a table in the gazetteer's shape (rows under `cols`, trailing zeros trimmed) of the places the
   CARDS need that the v0 gazetteer does not carry: ancient cities and sites, caves, battlefields, temples, mountains,
   historical regions. One row per Wikidata item, id `pl:q<number>`; the display name is the item's English Wikipedia title
   (CC0 sitelink) where it has one, else its English label; the card's own spelling is an alias; `at` is the item's
   coordinate (P625) — never a typed pair; `kind` is the taxonomy kind the item's classes (P31, through subclass-of) give
   and `sub` the finer kind (battle, cave, building); `within` the registry id of the containing city where the card said so.

   WHY A FILE OF ITS OWN. The gazetteer is 0.59 MB of the owner's 0.6 MB budget (decimal), and the cards need some 1,100
   places more; they are lazy together with the gazetteer and read as ONE registry by .claude/places-registry.js (Node) and,
   in Phase 3b, by the worker. The rows come from the cards' locators through .claude/migrate-places.js (`by: migration`,
   with the evidence) or from the owner through add-place.js (`manual: true`, with a reason); both write places-spec.json
   and this script is the only writer of the file. Sources: Wikidata (CC0) alone — every coordinate, class, label and
   title; the header says so, and check-credits.js carries it onto the credits page.

   --check  regenerate in memory and compare with atlas/data/places.js; exit 1 when the committed file lags the spec. */
"use strict";
const fs = require("fs"), path = require("path");
const HERE = __dirname, ROOT = path.join(HERE, "..", "..");
const DATA = path.join(ROOT, "atlas", "data");
const OUT = path.join(HERE, "out");
const SPEC = path.join(HERE, "places-spec.json");
const CACHE = path.join(HERE, "places-wikidata.json");
const TARGET = path.join(DATA, "places.js");
const R = require(path.join(ROOT, ".claude", "places-registry.js"));
const COLS = ["id", "name", "kind", "sub", "qid", "within", "at", "aliases", "wiki"];
const KINDS = R.PLACE_KINDS;

function loadSpec() { return fs.existsSync(SPEC) ? JSON.parse(fs.readFileSync(SPEC, "utf8")) : { _about: "", rows: {} }; }
function loadCache() { try { return JSON.parse(fs.readFileSync(CACHE, "utf8")); } catch (e) { return { retrieved: null, items: {} }; } }

/* validate one spec row; returns the faults (none = valid) */
function faults(id, r) {
  const f = [];
  if (!/^pl:q\d+$/.test(id)) f.push("id is not pl:q<number>");
  if (!r || typeof r !== "object") return ["not an object"];
  if (!r.name || typeof r.name !== "string" || /[<>]/.test(r.name) || r.name.length > 90) f.push("name");
  if (!KINDS.includes(r.kind)) f.push("kind " + r.kind + " is not in the taxonomy (" + KINDS.join(", ") + ")");
  if (r.sub && typeof r.sub !== "string") f.push("sub");
  if (!/^Q\d+$/.test(String(r.qid)) || "pl:q" + String(r.qid).slice(1) !== id) f.push("qid " + r.qid + " does not match the id");
  if (!Array.isArray(r.at) || r.at.length !== 2 || !isFinite(r.at[0]) || !isFinite(r.at[1]) || Math.abs(r.at[0]) > 180 || Math.abs(r.at[1]) > 90) f.push("at is not [lon, lat]");
  if (r.within && !R.validId(r.within)) f.push("within is not a place id");
  if (r.aliases && (!Array.isArray(r.aliases) || r.aliases.some((a) => typeof a !== "string"))) f.push("aliases");
  if (r.wiki && typeof r.wiki !== "string") f.push("wiki");
  if (r.manual && !r.reason) f.push("a manual row needs a reason");
  return f;
}

function build(opts) {
  opts = opts || {};
  const log = opts.log || console.log;
  const spec = loadSpec(), cache = loadCache();
  const rows = [];
  for (const [id, r] of Object.entries(spec.rows || {})) { const f = faults(id, r); if (f.length) throw new Error("places-spec.json " + id + ": " + f.join("; ")); rows.push(Object.assign({ id }, r)); }
  rows.sort((a, b) => KINDS.indexOf(a.kind) - KINDS.indexOf(b.kind) || (a.name < b.name ? -1 : a.name > b.name ? 1 : a.id < b.id ? -1 : 1));
  const seenQ = new Set(); for (const r of rows) { if (seenQ.has(r.qid)) throw new Error("places-spec.json: two rows for " + r.qid); seenQ.add(r.qid); }
  const encode = (r) => { const out = COLS.map((c) => { let v = r[c]; if (c === "qid") v = Number(String(v).slice(1)); if (c === "at") v = [Math.round(v[0] * 1e4) / 1e4, Math.round(v[1] * 1e4) / 1e4]; if (c === "aliases") v = (v || []).slice(0, 6); if (c === "wiki" && v && v === r.name) v = 1; return v == null || v === false || v === "" || (Array.isArray(v) && !v.length) ? 0 : v; }); while (out.length > 3 && out[out.length - 1] === 0) out.pop(); return out; };
  const counts = {}; for (const r of rows) counts[r.kind] = (counts[r.kind] || 0) + 1;
  const retrieved = cache.retrieved || "never";
  const sources = [{ id: "wikidata-places", name: "Wikidata — the items behind the places Folio's cards point at: each one's coordinate (P625), classes (P31, through subclass-of), English label and English Wikipedia title", version: "fetched " + retrieved + " through query.wikidata.org", url: "https://query.wikidata.org/", licence: "CC0", licenceUrl: "https://creativecommons.org/publicdomain/zero/1.0/", attribution: "Wikidata, CC0 1.0", retrieved, sha256: null }];
  const table = { format: 1, generated: retrieved, generator: "folio atlas-build: build-places.js (" + require("./package.json").version + ")", kinds: KINDS, cols: COLS, counts, rows: rows.map(encode) };
  const body = "/* sources: " + JSON.stringify(sources) + " */\n" +
    "/* atlas/data/places.js — GENERATED by .claude/atlas-build/build-places.js from places-spec.json (docs/atlas-v2-design.md §2.8,\n" +
    "   §7 \"Phase 3a — as built\"). Do not edit. The places the cards need that gazetteer.js does not carry — one row per Wikidata\n" +
    "   item, id pl:q<number>, read with the gazetteer as one registry (.claude/places-registry.js; the worker in Phase 3b). Rows\n" +
    "   under `cols` (trailing zeros trimmed; 0 = none): `qid` the item's number, `within` the containing row's id, `at` the item's\n" +
    "   coordinate (lon, lat), `sub` the finer kind (battle, cave, building), `wiki` the enwiki title (1 = the name itself). */\n" +
    "window.ATLAS_PLACES = " + JSON.stringify(table).replace(/\],\[/g, "],\n[") + ";\n";
  const bytes = Buffer.byteLength(body, "utf8");
  log(`places: ${rows.length} rows (${Object.entries(counts).map(([k, n]) => k + " " + n).join(", ")}), ${bytes} bytes (${(bytes / 1e6).toFixed(3)} MB decimal); Wikidata retrieved ${retrieved}`);
  if (opts.check) { const have = fs.existsSync(TARGET) ? fs.readFileSync(TARGET, "utf8") : ""; const ok = have === body; return { ok, why: ok ? "" : have ? "the committed file differs from what the spec builds" : "atlas/data/places.js is missing", rows, bytes }; }
  if (opts.dry) return { ok: true, rows, bytes, body };
  fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, "places.js"), body);
  if (opts.install) { fs.writeFileSync(TARGET, body); log("installed atlas/data/places.js"); require("./build-credits.js").build({ install: true, log: () => {} }); log("regenerated atlas/data/credits.js"); } else log("wrote out/places.js (--install copies it into atlas/data/ and regenerates credits.js)");
  return { ok: true, rows, bytes, body };
}

module.exports = { build, faults, loadSpec, loadCache, SPEC, CACHE, TARGET, COLS, KINDS };
if (require.main === module) {
  const argv = process.argv.slice(2);
  try {
    const r = build({ install: argv.includes("--install"), dry: argv.includes("--dry"), check: argv.includes("--check") });
    if (argv.includes("--check")) { console.log(r.ok ? "atlas/data/places.js is in step with places-spec.json" : "STALE: " + r.why + " — run: node .claude/atlas-build/build-places.js --install"); process.exit(r.ok ? 0 : 1); }
  } catch (e) { console.error(e.message); process.exit(1); }
}
