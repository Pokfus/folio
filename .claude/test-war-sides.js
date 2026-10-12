#!/usr/bin/env node
/* test-war-sides.js — the war cards' sides on the BUILT step topology (Atlas v2 Phase 2d; docs/atlas-v2-design.md §7 "Phase 2d — as built").

     node .claude/test-war-sides.js            (Node only, no browser; about a minute: it realises the faces the questions touch)

   WHAT IT PROVES, each a fault the eye would not see on a globe:
     · THE SIDES RESOLVE. Every one of the 56 cards that carry `war` has both sides resolved to entities of history.bin (a series, or an authored/derived extent):
       both sides or neither, no name on both sides in overlapping years, the 8 wars that group others flagged, and the 24 war sides the 2c inventory listed
       each end in the status docs/atlas-v2-coverage.md gives them (built from an open source, an assembly of built entities, kept as the card's own authored
       extent, or unresolved and said so) — so the table and the document cannot disagree.
     · THE `war` BLOCKS ARE UNTOUCHED: the old field is byte-identical to main's (a pinned hash of every card's block) — v1 reads it until Phase 5.
     · THE TABLE IS DERIVED, not typed: atlas/data/wars.js is exactly what the cards, the specs and the history file build; every member is an entity of the file,
       inside the war's years; a member's steps lie inside what the entity has.
     · "INSIDE THE YEARS THE SIDE'S GROUND IS SHADED, OUTSIDE THEM NOTHING": for every war, the roles in the year before it and the year after it are empty, and in
       every year of it each side is tinted exactly where one of its members is alive (a gap draws nothing) — the arithmetic study.js `warRoles` does, the browser draws.
     · THE 1,705 IN/OUT ASSERTIONS OF card-war.js, moved onto the built topology. docs/war-cards.md counts 1,705 once composed per side from the batch that shipped the
       extents; the repo has only the subset pinned in test-war-cards.js `EXTENT_PLACES` (this file reads it): each extent's places inside and outside it, at the war's
       first year (a war card draws each side AS IT STOOD AT THE OUTBREAK), asked of the side's ground on the built data. A side of several entities holds a place
       when any of them does. What fails is listed here with the cause (KNOWN) and is never forced. The count of those pinned and how many hold is printed.
   Re-run after touching atlas/data/history.bin, wars.js, .claude/atlas-build/war-sides.json, war-series.json, war-extents.json or lib/war-resolve.js. */
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const ROOT = path.join(__dirname, "..");
const { loadCards } = require("./card-io.js");
const { loadCardYears } = require("./card-links.js");
const WR = require("./atlas-build/lib/war-resolve.js");
const Wb = require("./atlas-build/build-wars.js");
const AS = require(path.join(ROOT, "atlas", "study.js"));
const Hq = require("./atlas-build/lib/historyq.js");
let pass = 0, fail = 0;
const check = (name, ok, detail) => { if (ok) { pass++; console.log("  ok    " + name + (detail ? "  (" + detail + ")" : "")); } else { fail++; console.log("  FAIL  " + name + (detail ? "  (" + detail + ")" : "")); } };

const { cards } = loadCards();
const cardYears = loadCardYears(fs.readFileSync(path.join(ROOT, "app.js"), "utf8"));
const R = WR.resolveWars({ cards, cardYears });
const T = Wb.tableOf(R.wars, Wb.entityTable());
const warCards = cards.filter((c) => c.war);

console.log("\n1) the sides resolve\n");
check("every war card is resolved (56 cards carry `war`)", warCards.length === 56 && R.wars.length === 56, warCards.length + " cards, " + R.wars.length + " resolved");
check("both sides or neither: no war has an empty side, and the table has all 56", T.problems.length === 0 && Object.keys(T.table).length === 56, T.problems.slice(0, 3).join("; "));
const grouped = R.wars.filter((w) => w.group).map((w) => w.id).sort().join(",");
check("the eight wars that group others are flagged (the owner's rule: they are not drawn on the Personal or Full Atlas)", grouped === "gr-235,gr-521,rm-151,rm-261,wh-330,wh-345,wh-349,ww2-001", grouped);
/* the 24 sides of the 2c inventory, each with the status docs/atlas-v2-coverage.md gives it. Keys are the side's NAME as the cards carry it.
   built = a polity series answers it (Cliopatria, or an assembly of series); derived = an extent made from an open source; authored = kept as the card's own
   extent (no open dataset draws it); unresolved = named in the card's keys and drawn by nothing; existing = resolved to a series the file already had. */
const SIDES_24 = {
  "Athens and its empire": "authored", "British Raj": "built", "Celtiberians": "authored", "Chinese warlords": "unresolved", "Cisalpine Gauls": "authored",
  "Ethiopia (Italy)": "existing", "Gallic tribes": "authored", "Greek allies": "authored+built", "Lusitanians": "authored", "Macedon and the Greek leagues": "built",
  "Messenia": "derived", "Samnium": "authored", "Seneca and Cayuga": "authored", "Sicilian Greeks": "authored", "Sparta": "derived", "Sparta and its allies": "built",
  "Syracuse": "authored", "Umbria and Picenum": "authored", "Union of South Africa": "built", "Western Confederacy": "derived", "Yugoslavia": "built",
  "the Celtiberians and Lusitanians": "authored", "the Yue peoples": "authored", "the allies": "authored",
};
const DERIVED = new Set(["ext_sparta", "ext_messenia", "ext_western_confederacy"]);
{
  const got = {};
  const note = (name, st) => { (got[name] = got[name] || new Set()).add(st); };
  for (const w of R.wars) for (const side of ["victors", "losers"]) {
    const S = w.sides[side];
    if (S.extent) note(S.name, DERIVED.has(S.extent) ? "derived" : "authored");
    if (S.members.length) note(S.name, "built");
    for (const u of S.unresolved) note(u, "unresolved");
  }
  // "Ethiopia (Italy)" and the ww2-001 members are named by keys: map them as the table's rows
  const status = (n) => (got[n] ? [...got[n]].sort().join("+") : "existing");
  const wrong = []; for (const [n, want] of Object.entries(SIDES_24)) { const have = status(n); const w2 = want === "authored+built" ? ["authored", "authored+built", "built+authored"] : [want]; if (!w2.includes(have) && !(want === "authored+built" && /authored/.test(have))) wrong.push(`${n}: ${have} (expected ${want})`); }
  check("each of the 24 war sides of the 2c inventory ends in the status docs/atlas-v2-coverage.md gives it", wrong.length === 0, wrong.join("; ") || "24 sides");
}
const warHash = crypto.createHash("sha256").update(JSON.stringify(warCards.map((c) => [c.id, c.war]))).digest("hex");
const WAR_FIELD_SHA = "6ad97d323deb90e336963c233b1b62271eb3fe36712efbc7f3dad6a6f0c040ce";   // sha256 of JSON.stringify of every war card [id, war] on main at 352d151 (2d changed none)
check("the cards' `war` blocks are byte-identical to main's (v1 reads them until Phase 5)", warHash === WAR_FIELD_SHA, warHash.slice(0, 16));

console.log("\n2) the table is derived\n");
{
  const r = Wb.build({ check: true, log: () => {} });
  check("atlas/data/wars.js is exactly what the cards, the specs and history.bin build", r.ok, r.why || (r.count.wars + " wars, " + r.count.members + " members, " + r.count.extentSides + " sides on an extent"));
  const a = Wb.render(T.table).body, b = Wb.render(Wb.tableOf(R.wars, Wb.entityTable()).table).body;
  check("two builds are byte-identical (a digest, never a clock)", a === b);
}

console.log("\n3) the built topology: inside the years the ground is shaded, outside them nothing\n");
const H = Hq.open();
{
  const ents = new Map(H.header.entities.map((e) => [e.id, e]));
  // every member exists, inside the war's years; a member's window never reaches past the war
  let bad = [];
  for (const [id, w] of Object.entries(T.table)) for (const k of ["v", "l"]) for (const m of w[k].m) { if (!ents.has(m[0])) bad.push(id + " " + m[0]); else if (m[1] < w.y[0] || m[2] > w.y[1]) bad.push(id + " " + m[0] + " window"); }
  check("every member is an entity of the file and stays inside the war's own years (never wider)", bad.length === 0, bad.slice(0, 3).join("; "));
  // the ground of a side: the years inside the war where one of its members has a step
  const groundless = [], gaps = [];
  for (const [id, w] of Object.entries(T.table)) for (const k of ["v", "l"]) {
    const side = w[k]; const ids = side.m.map((m) => [m[0], m[1], m[2]]).concat(side.x ? [[side.x, w.y[0], w.y[1]]] : []);
    let years = 0, total = 0;
    for (let y = w.y[0]; y <= w.y[1]; y++) { total++; if (ids.some(([e, a, b]) => y >= a && y <= b && H.aliveAt(e, y))) years++; }
    if (!years) groundless.push(`${id} ${k} (${side.n})`); else if (years < total) gaps.push(`${id} ${k} ${years}/${total}`);
  }
  check("every side has ground on the map in at least one year of its war (a side drawn nowhere is a war half drawn)", groundless.length === 0, groundless.join("; ") || Object.keys(T.table).length * 2 + " sides");
  console.log("        sides with a gap in their war's years (a gap draws nothing, and the card's place card says so): " + (gaps.length ? gaps.join(", ") : "none"));
  // the arithmetic the renderer uses, year by year
  let outside = 0, inside = 0, wrongRole = [];
  const tbl = T.table;
  for (const [id, w] of Object.entries(tbl)) {
    const one = new Set([id]);
    for (const y of [w.y[0] - 1, w.y[1] + 1]) { if (AS.warRoles(tbl, one, y).size) outside++; }
    const years = []; for (let y = w.y[0]; y <= w.y[1]; y += Math.max(1, Math.floor((w.y[1] - w.y[0]) / 8))) years.push(y); years.push(w.y[1]);
    for (const y of years) {
      const roles = AS.warRoles(tbl, one, y); inside++;
      for (const [k, flag] of [["v", 1], ["l", 2]]) {
        const want = new Set(w[k].m.filter((m) => m[1] <= y && y <= m[2]).map((m) => m[0]).concat(w[k].x ? [w[k].x] : []));
        for (const e of want) { const r = roles.get(e); if (!r || !(r.role & flag)) wrongRole.push(`${id} ${y} ${e}`); }
      }
    }
  }
  check("in the year before a war and the year after it nothing is tinted by it (56 wars × 2)", outside === 0, outside + " tinted");
  check("inside a war's years every member alive in its window is tinted in its side's role (sampled across each war)", wrongRole.length === 0, inside + " years sampled" + (wrongRole.length ? "; " + wrongRole.slice(0, 3).join("; ") : ""));
  // no ground is shaded as both victor and loser in one year — except where the data's own contested faces say it is both
  const both = [];
  for (const [id, w] of Object.entries(tbl)) { const one = new Set([id]); for (let y = w.y[0]; y <= w.y[1]; y += Math.max(1, Math.floor((w.y[1] - w.y[0]) / 12))) for (const [e, r] of AS.warRoles(tbl, one, y)) if (r.role === 3) both.push(id + " " + y + " " + e); }
  check("no entity is a victor and a loser of one war in one year (a name may not stand on both sides)", both.length === 0, both.slice(0, 3).join("; "));
  // two cards' blocks may not contradict each other: an entity a victor in one war and a loser in another whose years overlap
  const clash = [];
  const ids2 = Object.keys(tbl).filter((i) => !tbl[i].g);
  const by = new Map();   // entity → [{war, role, from, to}]
  for (const id of ids2) { const w = tbl[id]; for (const [k, role] of [["v", "victor"], ["l", "loser"]]) { for (const m of w[k].m) { let l = by.get(m[0]); if (!l) by.set(m[0], l = []); l.push({ id, role, from: m[1], to: m[2] }); } if (w[k].x) { let l = by.get(w[k].x); if (!l) by.set(w[k].x, l = []); l.push({ id, role, from: w.y[0], to: w.y[1] }); } } }
  for (const [e, l] of by) for (let i = 0; i < l.length; i++) for (let j = i + 1; j < l.length; j++) if (l[i].role !== l[j].role && l[i].from <= l[j].to && l[j].from <= l[i].to) clash.push(`${e}: ${l[i].id} ${l[i].role} vs ${l[j].id} ${l[j].role}`);
  check("no entity is a victor in one drawn war and a loser in another whose years overlap (the Personal Atlas draws wars together)", clash.length === 0, clash.slice(0, 4).join("; "));
}

console.log("\n4) the in/out assertions of card-war.js on the built topology\n");
{
  const src = fs.readFileSync(path.join(__dirname, "test-war-cards.js"), "utf8");
  const m = /const EXTENT_PLACES = (\{[\s\S]*?\n\});/.exec(src);
  const EXT = m ? new Function("return " + m[1])() : {};   // eslint-disable-line no-new-func
  const KNOWN = require("./test-war-sides-known.js");
  let n = 0, okN = 0, known = 0, offside = 0; const failed = [], knownUsed = [];
  const byCause = {};
  for (const [card, places] of Object.entries(EXT)) {
    const w = T.table[card]; if (!w) { failed.push(card + ": not in the table"); continue; }
    for (const [k, side] of [["v", "victors"], ["l", "losers"]]) {
      if (!places[side]) continue;
      const S = w[k], ents = S.m.map((x) => x[0]).concat(S.x ? [S.x] : []);
      const y = w.y[0];
      const live = ents.filter((e) => H.aliveAt(e, y)); if (!live.length) offside++;
      for (const [want, list] of [["in", places[side].in], ["out", places[side].out]]) for (const [name, lon, lat] of list) {
        n++;
        const found = H.entityAt(lon, lat, y, { layer: "all" });
        const inside = ents.some((e) => H.holds(e, found));
        if (want === "in" ? inside : !inside) { okN++; continue; }
        const key = `${card} ${side} ${name} ${want}`;
        if (KNOWN[key]) { known++; knownUsed.push(key); byCause[KNOWN[key].cause] = (byCause[KNOWN[key].cause] || 0) + 1; }
        else failed.push(`${key} (at ${y}: ${found.map((e) => e.id).join(", ") || "nobody"})`);
      }
    }
  }
  const unusedKnown = Object.keys(KNOWN).filter((k) => !knownUsed.includes(k));
  check(`the pinned in/out assertions (${n}, over ${Object.keys(EXT).length} cards) hold on the built topology, or are listed with their cause`, failed.length === 0, `${okN} hold, ${known} listed${failed.length ? "; " + failed.length + " FAIL: " + failed.slice(0, 6).join("; ") : ""}`);
  check("every listed known fault is still a fault (a fixed one is removed from the list)", unusedKnown.length === 0, unusedKnown.slice(0, 4).join("; "));
  console.log(`        ${okN} of ${n} pass; ${known} are listed known differences (${Object.entries(byCause).map(([c, v]) => c + " " + v).join(", ")}); ${offside} sides had no member alive at the war's first year`);
}

console.log(`\n${pass} ok, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
