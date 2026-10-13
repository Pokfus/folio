#!/usr/bin/env node
/* build-wars.js — the WARS TABLE: atlas/data/wars.js (Atlas v2 Phase 2d; docs/atlas-v2-design.md §7 "Phase 2d — as built").

     node .claude/atlas-build/build-wars.js [--install] [--dry] [--check]

   WHAT IT IS. For every card that carries `war`, its two sides as the entities of history.bin they name — the `side:victor` / `side:loser` steps of
   the design's §2.8: a member is [entity id, from, to] (the years the entity is on that side), and the renderer tints the entity's own faces in
   those years by the side's role. The card's `war` block is never touched (v1 reads it until Phase 5) and the card's `places` stays the flat sorted list
   of ids Phase 3a settled on: the ROLES and the WINDOWS live only here, in the one table a war card's meaning is read from.

       window.ATLAS_WARS = { format: 1, digest, counts, wars: { "rm-209": { t: "Second Punic War", y: [-218, -201], g: 0,
           v: { n: "Rome",     m: [["pol:rome", -218, -201]], x: "", u: [] },
           l: { n: "Carthage", m: [["pol:carthage", -218, -201]], x: "", u: [] } } } }

   `g` 1 = the card GROUPS other war cards (war.group): such a war is not drawn on the Personal or Full Atlas (the owner's rule of Oct 2026, so
   the same ground is not drawn twice in the same years) — it is drawn when it is chosen, from a place card or a deep link. `x`: the id of the
   side's authored-extent entity (kind `extent`, Folio's own approximation) when no series answers the side; `u`: the names of the card's keys that
   nothing answers (listed on the place card, never drawn). Rules kept from docs/war-cards.md: both sides or neither (a war with an empty side is not
   in the table); a name may not stand on both sides in overlapping years; the years are the card's own (never wider).

   A pure function of the cards, polity-spec.json, war-series.json, war-sides.json and history.bin's entity table, so --check is exact. GENERATED:
   never edit; two builds are byte-identical. Its first line is the `sources` header every generated file carries (build-credits.js): empty, the table
   holds Folio's own words and the registry's ids; the data they point at carries its own sources. Run by migrate-places.js (so it cannot lag the cards)
   and by check-places.js in CI. */
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const HERE = __dirname, ROOT = path.join(HERE, "..", "..");
const TARGET = path.join(ROOT, "atlas", "data", "wars.js");
const HISTORY = path.join(ROOT, "atlas", "data", "history.bin");
const OUT = path.join(HERE, "out");
const BUDGET = 40000;   // bytes, decimal: a table of ~60 wars

function entityTable() {
  if (!fs.existsSync(HISTORY)) return null;
  const F = require(path.join(ROOT, "atlas", "atlas-format.js"));
  const H = F.read(new Uint8Array(fs.readFileSync(HISTORY)), { headerOnly: true }).header;
  return new Map((H.entities || []).map((e) => [e.id, e]));
}

/* the table from the resolver's wars — pure, so the tests can feed it fixtures. `ents` (id → entity) is optional: given, every id must be in it. */
function tableOf(wars, ents) {
  const problems = [], out = {};
  const idOf = (k) => "pol:" + k;
  for (const w of wars) {
    const row = { t: w.term, y: w.y, g: w.group ? 1 : 0 };
    let empty = null;
    for (const [side, k] of [["victors", "v"], ["losers", "l"]]) {
      const S = w.sides[side];
      const m = S.members.map((x) => [idOf(x.key), x.from, x.to]).sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] - b[1]));
      const x = S.extent ? idOf(S.extent) : "";
      if (!m.length && !x) empty = side;
      for (const mm of m) { if (ents && !ents.has(mm[0])) problems.push(`${w.id}: ${side} names ${mm[0]}, which history.bin does not hold`); if (mm[1] < w.y[0] || mm[2] > w.y[1] || mm[1] > mm[2]) problems.push(`${w.id}: ${mm[0]} is a member over ${mm[1]}..${mm[2]}, outside the war's ${w.y[0]}..${w.y[1]}`); }
      if (x && ents && !ents.has(x)) problems.push(`${w.id}: ${side} names the extent ${x}, which history.bin does not hold`);
      row[k] = { n: S.name, m, x, u: S.unresolved.slice() };
    }
    if (empty) { problems.push(`${w.id}: the ${empty} side resolves to nothing — a war with an empty side is not drawn (docs/war-cards.md: both sides or neither)`); continue; }
    // a name may not stand on both sides in overlapping years (war-cards.md, rule 4)
    for (const a of row.v.m.concat(row.v.x ? [[row.v.x, w.y[0], w.y[1]]] : [])) for (const b of row.l.m.concat(row.l.x ? [[row.l.x, w.y[0], w.y[1]]] : [])) if (a[0] === b[0] && a[1] <= b[2] && b[1] <= a[2]) problems.push(`${w.id}: ${a[0]} stands on both sides in ${Math.max(a[1], b[1])}..${Math.min(a[2], b[2])}`);
    out[w.id] = row;
  }
  return { table: out, problems };
}

function render(table) {
  const ids = Object.keys(table).sort();
  const digest = crypto.createHash("sha256").update(JSON.stringify(ids.map((i) => [i, table[i]]))).digest("hex").slice(0, 16);
  const count = { wars: ids.length, group: ids.filter((i) => table[i].g).length, members: ids.reduce((n, i) => n + table[i].v.m.length + table[i].l.m.length, 0), extentSides: ids.reduce((n, i) => n + (table[i].v.x ? 1 : 0) + (table[i].l.x ? 1 : 0), 0), unresolved: ids.reduce((n, i) => n + table[i].v.u.length + table[i].l.u.length, 0) };
  const head = JSON.stringify({ format: 1, digest, counts: count });
  return { digest, count, body: "/* sources: [] */\n" +
    "/* atlas/data/wars.js — GENERATED by .claude/atlas-build/build-wars.js from the war cards, polity-spec.json, war-series.json, war-sides.json and history.bin's\n" +
    "   entity table (docs/atlas-v2-design.md §7 \"Phase 2d — as built\"). Do not edit. Each war card's two sides as the entities they name, with the years each is\n" +
    "   on its side: the `side:victor` / `side:loser` steps. The card's own `war` block is untouched; this holds Folio's own words and registry ids, so `sources` above is empty. */\n" +
    "window.ATLAS_WARS = " + head.slice(0, -1) + ",\"wars\":{\n" + ids.map((i) => JSON.stringify(i) + ":" + JSON.stringify(table[i])).join(",\n") + "\n}};\n" };
}

function build(opts) {
  opts = opts || {};
  const log = opts.log || console.log;
  const cards = opts.cards || require(path.join(ROOT, ".claude", "card-io.js")).loadCards().cards;
  const cardYears = require(path.join(ROOT, ".claude", "card-links.js")).loadCardYears(fs.readFileSync(path.join(ROOT, "app.js"), "utf8"));
  const R = require("./lib/war-resolve.js").resolveWars({ cards, cardYears });
  const ents = opts.ents === undefined ? entityTable() : opts.ents;
  const T = tableOf(R.wars, ents);
  const r = render(T.table), bytes = Buffer.byteLength(r.body, "utf8");
  log(`wars: ${R.wars.length} war cards → ${r.count.wars} in the table (${r.count.group} group wars), ${r.count.members} members, ${r.count.extentSides} sides on an authored extent, ${r.count.unresolved} unresolved names, ${bytes} bytes (budget ${BUDGET / 1e3} KB), digest ${r.digest}`);
  if (T.problems.length) for (const p of T.problems) log("  PROBLEM  " + p);
  if (bytes > BUDGET) throw new Error("wars.js is " + bytes + " bytes, over the " + BUDGET + "-byte budget");
  if (opts.check) { const have = fs.existsSync(TARGET) ? fs.readFileSync(TARGET, "utf8") : ""; const ok = have === r.body && !T.problems.length; return { ok, why: !T.problems.length ? (ok ? "" : have ? "the committed file differs from what the cards and the history file build" : "atlas/data/wars.js is missing") : T.problems.length + " problem(s)", table: T.table, problems: T.problems, count: r.count, bytes }; }
  if (opts.dry) return { ok: !T.problems.length, table: T.table, problems: T.problems, count: r.count, bytes, body: r.body };
  fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, "wars.js"), r.body);
  if (opts.install) {
    const existed = fs.existsSync(TARGET), same = existed && fs.readFileSync(TARGET, "utf8") === r.body;
    if (!same) { fs.writeFileSync(TARGET, r.body); log("installed atlas/data/wars.js"); } else log("atlas/data/wars.js unchanged");
    if (!existed) { require("./build-credits.js").build({ install: true, log: () => {} }); log("regenerated atlas/data/credits.js"); }
  }
  return { ok: !T.problems.length, table: T.table, problems: T.problems, count: r.count, bytes, body: r.body };
}

module.exports = { build, tableOf, render, entityTable, TARGET, BUDGET };
if (require.main === module) {
  const argv = process.argv.slice(2);
  try {
    const r = build({ install: argv.includes("--install"), dry: argv.includes("--dry"), check: argv.includes("--check") });
    if (argv.includes("--check")) { console.log(r.ok ? "atlas/data/wars.js is in step with the cards and the history file" : "STALE: " + r.why + " — run: node .claude/atlas-build/build-wars.js --install"); process.exit(r.ok ? 0 : 1); }
    process.exit(r.problems && r.problems.length ? 1 : 0);
  } catch (e) { console.error(e.message); process.exit(1); }
}
