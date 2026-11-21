#!/usr/bin/env node
/* add-border.js — add a state's borders to the card windows WITHOUT rebuilding history.bin (docs/atlas-v2-border-packs.md "The recipe").

     node .claude/atlas-build/add-border.js --list "<Cliopatria name>"
         every Cliopatria v0.2.0 row of that name: its years and area, the largest marked — to choose the years a card needs
     node .claude/atlas-build/add-border.js <key> --cliopatria "<Name>[|<Name2>…]" --years A[,B…] [--label "<Label>"] [--pack <name>] [--card <id>[,<id>…]] [--why "<reason>"]
         writes (or extends) the state's row in border-packs.json, builds its pack — build-history.js --pack <pack> --extract --install — and runs
         check-border-packs.js. The card then names the state as any other: members.groups[].ids: ["pol:<key>"] with members.year one of the years.

   The key becomes the entity id `pol:<key>` (lowercase, digits, underscores) and must not be a series of polity-spec.json (history.bin carries those).
   An existing key keeps its row and gains the years, names and cards given; the pack defaults to the key with hyphens. Needs the pinned Cliopatria file
   (node .claude/atlas-build/fetch-sources.js cliopatria). Never touches history.bin, its slices or anything generated from them. */
"use strict";
const fs = require("fs"), path = require("path"), cp = require("child_process");
const BP = require("./lib/border-packs.js");

const HERE = __dirname, argv = process.argv.slice(2);
const opt = (k) => { const i = argv.indexOf(k); return i < 0 ? null : argv[i + 1]; };
const CLIO = path.join(HERE, "src", "cliopatria", "cliopatria_polities_only.geojson");
const readClio = () => { if (!fs.existsSync(CLIO)) { console.error("✗ the pinned Cliopatria file is not here: node .claude/atlas-build/fetch-sources.js cliopatria"); process.exit(1); } return JSON.parse(fs.readFileSync(CLIO, "utf8")).features; };

if (opt("--list")) {
  const name = opt("--list"), rows = readClio().filter((f) => f.properties.Name === name).map((f) => f.properties).sort((a, b) => a.FromYear - b.FromYear);
  if (!rows.length) { console.error(`✗ no Cliopatria row is named "${name}"`); process.exit(1); }
  const max = Math.max(...rows.map((r) => r.Area));
  for (const r of rows) console.log(`  ${String(r.FromYear).padStart(6)} … ${String(r.ToYear).padEnd(6)} ${Math.round(r.Area).toLocaleString("en-GB").padStart(12)} km²${r.Area === max ? "   ← largest" : ""}`);
  process.exit(0);
}

const key = argv[0];
if (!key || /^--/.test(key) || !opt("--years") || (!opt("--cliopatria"))) { console.error('usage: add-border.js <key> --cliopatria "<Name>" --years A,B [--label L] [--pack P] [--card id,id] [--why "…"]   (or --list "<Name>")'); process.exit(1); }
const years = opt("--years").split(",").map((y) => Number(y.trim()));
if (!years.every(Number.isInteger)) { console.error("✗ --years: integers, comma-separated (BCE negative)"); process.exit(1); }
const names = opt("--cliopatria").split("|").map((s) => s.trim()).filter(Boolean);
const cards = (opt("--card") || "").split(",").map((s) => s.trim()).filter(Boolean);

// each year must find exactly one row among the names (build-history.js's rowsAt rule), checked before anything is written
const feats = readClio();
for (const y of years) {
  const hits = feats.filter((f) => names.includes(f.properties.Name) && f.properties.FromYear <= y && f.properties.ToYear >= y);
  if (hits.length !== 1) { console.error(`✗ ${y}: ${hits.length} Cliopatria rows of ${names.join(" / ")} are alive in that year (exactly one is needed; --list "<Name>" shows the rows)`); process.exit(1); }
  console.log(`  ${y}: ${hits[0].properties.Name} ${hits[0].properties.FromYear}…${hits[0].properties.ToYear}, ${Math.round(hits[0].properties.Area).toLocaleString("en-GB")} km²`);
}

const spec = BP.readSpec();
let pack = null; for (const [n, p] of Object.entries(spec.packs)) if (p.states[key]) pack = n;
if (pack && opt("--pack") && opt("--pack") !== pack) { console.error(`✗ ${key} is already in pack ${pack}`); process.exit(1); }
pack = pack || opt("--pack") || key.replace(/_/g, "-");
const P = spec.packs[pack] || (spec.packs[pack] = { states: {} });
const old = P.states[key];
const row = old ? Object.assign({}, old) : { label: opt("--label") || names[0], cliopatria: [], years: [], cards: [], why: "" };
if (opt("--label")) row.label = opt("--label");
row.cliopatria = [...new Set(row.cliopatria.concat(names))];
row.years = [...new Set(row.years.concat(years))].sort((a, b) => a - b);
row.cards = [...new Set((row.cards || []).concat(cards))].sort();
if (opt("--why")) row.why = old && old.why ? old.why + " " + opt("--why") : opt("--why");
P.states[key] = row;
BP.allStates(spec);   // validates before writing: the key, the names, the years, no clash with history.bin's spec or another pack

// written in the file's own layout: one line per state
const lines = ["{", `  "_about": ${JSON.stringify(spec._about)},`, `  "packs": {`];
const packNames = Object.keys(spec.packs).sort();
packNames.forEach((n, i) => {
  lines.push(`    ${JSON.stringify(n)}: {`, `      "states": {`);
  const ks = Object.keys(spec.packs[n].states).sort();
  ks.forEach((k, j) => { const s = spec.packs[n].states[k]; lines.push(`        ${JSON.stringify(k)}: { "label": ${JSON.stringify(s.label)}, "cliopatria": ${JSON.stringify(s.cliopatria)}, "years": ${JSON.stringify(s.years)}, "cards": ${JSON.stringify(s.cards || [])}, "why": ${JSON.stringify(s.why || "")} }${j + 1 < ks.length ? "," : ""}`); });
  lines.push(`      }`, `    }${i + 1 < packNames.length ? "," : ""}`);
});
lines.push("  }", "}", "");
fs.writeFileSync(BP.SPEC_FILE, lines.join("\n"));
console.log(`✓ border-packs.json: pol:${key} in pack ${pack}, years ${row.years.join(", ")}`);

const run = (args) => { const r = cp.spawnSync(process.execPath, args, { stdio: "inherit" }); return r.status === 0; };
if (!run(["--max-old-space-size=6000", path.join(HERE, "build-history.js"), "--pack", pack, "--extract", "--install"])) { console.error("✗ the pack did not build (its row is in border-packs.json: fix it and re-run, or remove it)"); process.exit(1); }
const checked = run([path.join(HERE, "check-border-packs.js"), "--quiet"]);
console.log(`\nNext: give each card its window — members: { label: "Realm", name: ${JSON.stringify(row.label)}, note: "borders as the Cliopatria dataset maps them", keys: [<present-day countries of the "world" layer, the fallback>], year: <one of ${row.years.join(", ")}>, groups: [{ name: ${JSON.stringify(row.label)}, note: "in <year>, …", ids: ["pol:${key}"] }] }` + (checked ? "" : "\n(check-border-packs.js fails until every card listed with --card names pol:" + key + " in one of the pack's years)"));
