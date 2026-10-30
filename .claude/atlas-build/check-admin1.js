#!/usr/bin/env node
/* check-admin1.js — the CI gate for atlas/data/admin1.bin, the lazy admin-1 layer (docs/atlas-v2-admin1-layer.md §3.1).

     node .claude/atlas-build/check-admin1.js [file] [--quiet]

   Zero dependencies: the same atlas/atlas-format.js the browser reads, the core file beside it. Exit 1 on any failure.
   (That the file is what its inputs build is build-admin1.js --check, the step beside this one in the fast job.)

   WHAT IT PROVES:
     header        kindOf "admin1"; the core's buildId is the committed core's; every source complete; the ODbL source named
     spec          the entities are admin1-spec.json's units, in its order: ids adm1:<a3>:<iso>, names, kinds, codes, items,
                   parents that exist in the core and have no admin-1 children there (two sources for one state, §5); ids unique;
                   admin1-source.json built from the pinned Natural Earth file
     steps         one step per entity, [the core's present year, null], naming that entity's face; every face named once
     well-formed   ranks, endpoints rank 0, refs name arcs; an own arc is an admin-1 line; a core reference names an arc of its
                   parent's face, of the same kind, a vertex range inside it, and junctions on the core's LOD 2 segment they name
     rings close   at every level, consecutive arcs of a ring meet end to start and the ring returns to its start
     tiled         every outline piece is used once, forward, every line twice (once each way); the pieces of each core arc chain
                   from its head to its tail; the units' area at LOD 2 is the core face's; every line vertex inside the parent
     planar        no two drawn segments cross, at every level
     points        26 units' capitals (every one the gazetteer carries) and large cities (coordinates from atlas/data/gazetteer.js, by Wikidata item) inside
                   the unit's face at LOD 2
     budget        the file under BUDGET_BYTES; the twin decodes to the file; the five file:// twins under 12 MB together
   It prints every count, because a green run that says nothing is one nobody reads. */
"use strict";
const fs = require("fs"), path = require("path");
const F = require("./lib/format.js");
const G = require("./lib/geo.js");
const R = require("./lib/rings.js");
const SegIndex = require("./lib/segindex.js");
const Twin = require("./lib/twin.js");

const argv = process.argv.slice(2);
const quiet = argv.includes("--quiet");
const HERE = __dirname, ROOT = path.join(HERE, "..", ".."), DATA = path.join(ROOT, "atlas", "data");
const file = argv.find((a) => !a.startsWith("--")) || path.join(DATA, "admin1.bin");
const BUDGET_BYTES = 512 * 1024;   // India alone is 54 KB (2026-10-30); a country costs tens of KB, so this holds several before it is raised deliberately
const TWINS_MAX = 12e6;            // every file:// twin together — the owner's rule of Phase 5 (build-war-slice.js, build-ww2-slice.js)
const JUNCTION_M = 30;             // a junction lies on its core segment within about a quantum (28 m at the equator): it is a rounded point of it

let pass = 0, fail = 0;
const ok = (m, d) => { pass++; if (!quiet) console.log(`  \x1b[32mok\x1b[0m    ${m}${d ? "  \x1b[2m" + d + "\x1b[0m" : ""}`); };
const bad = (m, d) => { fail++; console.log(`  \x1b[31mFAIL\x1b[0m  ${m}${d ? "  \x1b[2m" + d + "\x1b[0m" : ""}`); };
const note = (m) => { if (!quiet) console.log(`        \x1b[2m${m}\x1b[0m`); };
const check = (cond, m, d) => (cond ? ok(m, d) : bad(m, d));
const deg = (p) => `${(p[0] * R.QUANTUM).toFixed(4)},${(p[1] * R.QUANTUM).toFixed(4)}`;

/* ---------- the independent point assertions ----------
   The claim is the plain fact — the city is in that state or territory — checked against the built faces; the coordinates are the
   gazetteer's (Natural Earth populated places), found by name AND Wikidata item so a namesake elsewhere (Hyderabad, Sindh) is never
   taken. The capitals the gazetteer carries (26: not Itanagar, Dispur, Panaji, Gangtok, Kohima, Leh, Kavaratti or Daman), and large cities. */
const POINTS = [
  // [gazetteer name, Wikidata item, unit]
  ["New Delhi", "Q987", "IN-DL"], ["Delhi", "Q1353", "IN-DL"], ["Mumbai", "Q1156", "IN-MH"], ["Kolkata", "Q1348", "IN-WB"], ["Bengaluru", "Q1355", "IN-KA"],
  ["Chennai", "Q1352", "IN-TN"], ["Hyderabad", "Q1361", "IN-TS"], ["Amaravati", "Q19881964", "IN-AP"], ["Jaipur", "Q66485", "IN-RJ"], ["Lucknow", "Q47916", "IN-UP"],
  ["Patna", "Q80484", "IN-BR"], ["Bhopal", "Q80989", "IN-MP"], ["Ranchi", "Q174461", "IN-JH"], ["Raipur", "Q372773", "IN-CG"], ["Bhubaneswar", "Q171771", "IN-OD"],
  ["Thiruvananthapuram", "Q167715", "IN-KL"], ["Gandhinagar", "Q11910", "IN-GJ"], ["Shimla", "Q83786", "IN-HP"], ["Dehradun", "Q199528", "IN-UK"],
  ["Chandigarh", "Q43433", "IN-CH"], ["Srinagar", "Q170115", "IN-JK"], ["Imphal", "Q208097", "IN-MN"], ["Agartala", "Q170454", "IN-TR"], ["Aizawl", "Q192379", "IN-MZ"],
  ["Shillong", "Q207752", "IN-ML"], ["Pondicherry", "Q639421", "IN-PY"], ["Port Blair", "Q203476", "IN-AN"],
  ["Ahmedabad", "Q1070", "IN-GJ"], ["Surat", "Q4629", "IN-GJ"], ["Pune", "Q1538", "IN-MH"], ["Nagpur", "Q1513", "IN-MH"], ["Kanpur", "Q66568", "IN-UP"],
  ["Varanasi", "Q79980", "IN-UP"], ["Agra", "Q42941", "IN-UP"], ["Amritsar", "Q48403", "IN-PB"], ["Ludhiana", "Q200123", "IN-PB"], ["Coimbatore", "Q9885", "IN-TN"],
  ["Madurai", "Q228405", "IN-TN"], ["Kochi", "Q1800", "IN-KL"], ["Indore", "Q66616", "IN-MP"], ["Visakhapatnam", "Q200016", "IN-AP"], ["Vijayawada", "Q200017", "IN-AP"],
  ["Jamshedpur", "Q200054", "IN-JH"], ["Dhanbad", "Q244159", "IN-JH"], ["Asansol", "Q202139", "IN-WB"],
];

console.log(`check-admin1: ${path.relative(ROOT, file)}`);
if (!fs.existsSync(file)) { bad("the file exists"); process.exit(1); }
const bytes = fs.readFileSync(file);
const T = F.read(new Uint8Array(bytes)), H = T.header;
const core = F.readFile(path.join(path.dirname(file), "topology.bin")), CH = core.header;
const spec = JSON.parse(fs.readFileSync(path.join(HERE, "admin1-spec.json"), "utf8"));
const nA = T.arcOffset.length - 1, levels = T.lodCount;

/* ---------- header ---------- */
console.log("header");
check(H.kindOf === "admin1", "kindOf is admin1", H.kindOf);
check(H.core && H.core.buildId === CH.buildId && H.core.arcs === core.arcOffset.length - 1, "built on the committed core", `${H.core && H.core.buildId} / ${CH.buildId}`);
check(JSON.stringify(H.lod.intervals_m) === JSON.stringify(CH.lod.intervals_m), "the levels are the core's resident levels", H.lod.intervals_m.join(" / "));
{ const keys = ["id", "name", "version", "url", "licence", "licenceUrl", "attribution", "retrieved", "sha256"]; const incomplete = H.sources.filter((s) => keys.some((k) => !s[k])); check(!incomplete.length && H.sources.length === 3, "three sources, every field present", H.sources.map((s) => s.id).join(", ") + (incomplete.length ? "; incomplete: " + incomplete.map((s) => s.id).join(", ") : "")); }
check(H.sources.some((s) => s.id === "osm-land-polygons" && s.licence === "ODbL-1.0") && /ODbL/.test((H.admin1 || {}).licence || ""), "the OSM coast it references is credited and the file says it is ODbL as a whole");
check(!H.generated, "no clock in the file (two builds give one sha256)");

/* ---------- spec ---------- */
console.log("spec");
const units = []; for (const c of spec.countries) for (const u of c.units) units.push(Object.assign({ a3: c.a3, parent: c.parent }, u));
check(H.entities.length === units.length, `${units.length} entities, as admin1-spec.json`, `${H.entities.length} in the file`);
{
  const wrong = [];
  units.forEach((u, i) => { const e = H.entities[i] || {}; const want = { id: `adm1:${u.a3.toLowerCase()}:${u.iso.toLowerCase()}`, name: u.name, kind: "admin1", parent: u.parent, qid: u.qid, iso: u.iso, type: u.kind === "state" ? "State" : "Union territory" }; for (const k of Object.keys(want)) if (e[k] !== want[k]) wrong.push(`${want.id}.${k}: ${e[k]} ≠ ${want[k]}`); });
  check(!wrong.length, "every entity is its spec row (id, name, kind, parent, item, code)", wrong.slice(0, 5).join("; "));
}
check(new Set(H.entities.map((e) => e.id)).size === H.entities.length, "entity ids unique");
check(new Set(units.map((u) => u.qid)).size === units.length && units.every((u) => /^Q\d+$/.test(u.qid)) && units.every((u) => /^[A-Z]{2}-[A-Z0-9]{1,3}$/.test(u.iso)), "Wikidata items and ISO 3166-2 codes well-formed and unique");
for (const c of spec.countries) {
  const pe = CH.entities.findIndex((e) => e.id === c.parent);
  check(pe >= 0 && CH.entities[pe].a3 === c.a3, `${c.a3}: the parent ${c.parent} is a core entity`);
  check(!CH.entities.some((e) => e.parent === c.parent), `${c.a3}: the core carries no admin-1 unit of ${c.parent} (two sources for one state would be two entities with one id)`);
  note(`${c.a3}: ${c.units.length} units (${c.units.filter((u) => u.kind === "state").length} states, ${c.units.filter((u) => u.kind !== "state").length} others), ${(c.corrections || []).length} recorded correction(s) of the source`);
}
{ const cache = JSON.parse(fs.readFileSync(path.join(HERE, "admin1-source.json"), "utf8")), pin = JSON.parse(fs.readFileSync(path.join(HERE, "sources.json"), "utf8")).sources.find((s) => s.id === "ne-10m-admin1");
  check(cache.source.sha256 === pin.sha256 && H.sources[0].sha256 === pin.sha256, "admin1-source.json and the header name the pinned Natural Earth file", pin.sha256.slice(0, 12) + "…"); }

/* ---------- steps ---------- */
console.log("steps");
const PRESENT = CH.steps[0][1];
{
  const byEnt = new Map(); for (const s of H.steps) { let l = byEnt.get(s[0]); if (!l) byEnt.set(s[0], l = []); l.push(s); }
  const wrong = H.entities.map((e, i) => i).filter((i) => { const l = byEnt.get(i) || []; return l.length !== 1 || l[0][1] !== PRESENT || l[0][2] != null || !T.faces[l[0][3]] || T.faces[l[0][3]].entity !== i; });
  check(!wrong.length && H.steps.length === H.entities.length, `one step per entity, [${PRESENT}, open], naming the entity's own face`, wrong.map((i) => H.entities[i].id).join(", "));
  const named = new Set(H.steps.map((s) => s[3]));
  check(named.size === T.faces.length, `every face named by one step (${T.faces.length} faces)`);
}

/* ---------- well-formed and the core references ---------- */
console.log("well-formed");
{ let badRank = 0; for (let a = 0; a < nA; a++) { if (T.rank[T.arcOffset[a]] !== 0 || T.rank[T.arcOffset[a + 1] - 1] !== 0) badRank++; } check(!badRank, "every arc's endpoints rank 0", badRank + " bad"); }
const parentArcs = new Map();   // core arc → { dir, country }
for (const c of spec.countries) { const pe = CH.entities.findIndex((e) => e.id === c.parent); for (const f of core.faces) if (f.entity === pe) for (const ring of f.rings) for (const r of ring) parentArcs.set(Math.abs(r) - 1, { dir: r > 0 ? 1 : -1, country: c.a3 }); }
{
  const problems = []; let refs = 0, own = 0, worstJ = 0;
  const segM = (p, a, b) => { const c = Math.cos(p[1] * R.QUANTUM * Math.PI / 180), ux = (x) => { let d = x - p[0]; if (d > R.X180) d -= 2 * R.X180; if (d < -R.X180) d += 2 * R.X180; return d * c; }; const ax = ux(a[0]), ay = a[1] - p[1], bx = ux(b[0]), by = b[1] - p[1], dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy; let t = l2 ? -(ax * dx + ay * dy) / l2 : 0; t = Math.max(0, Math.min(1, t)); return Math.hypot(ax + dx * t, ay + dy * t) * R.QUANTUM * Math.PI / 180 * G.R_EARTH_M; };
  for (let a = 0; a < nA; a++) {
    const s = T.arcOffset[a], e = T.arcOffset[a + 1];
    if (T.coreArc[a] < 0) { own++; if (T.arcKind[a] !== F.KIND.ADMIN1) problems.push(`own arc ${a} is not an admin-1 line`); continue; }
    refs++;
    const ca = T.coreArc[a], cs = core.arcOffset[ca], ce = core.arcOffset[ca + 1], n = ce - cs;
    if (!parentArcs.has(ca)) { problems.push(`arc ${a} names core arc ${ca}, not of a parent face`); continue; }
    if (T.arcKind[a] !== core.arcKind[ca]) problems.push(`arc ${a}: kind ${T.arcKind[a]}, core arc ${ca} is ${core.arcKind[ca]}`);
    if (e - s !== 2) problems.push(`arc ${a} stores ${e - s} vertices, not its two junctions`);
    if (!H.arcEmpty[a] && (T.coreFrom[a] < 0 || T.coreFrom[a] >= n || T.coreTo[a] < 0 || T.coreTo[a] >= n)) problems.push(`arc ${a}: range ${T.coreFrom[a]}..${T.coreTo[a]} outside core arc ${ca} (${n})`);
    if (!H.arcEmpty[a] && (T.coreTo[a] - T.coreFrom[a]) * parentArcs.get(ca).dir < 0) problems.push(`arc ${a} walks core arc ${ca} against the parent face's direction`);
    for (const [vi, seg] of [[s, T.coreSegA[a]], [e - 1, T.coreSegB[a]]]) {
      const p = [T.lon[vi], T.lat[vi]];
      if (!seg) { const ends = [[core.lon[cs], core.lat[cs]], [core.lon[ce - 1], core.lat[ce - 1]]]; if (!ends.some((q) => q[0] === p[0] && q[1] === p[1])) problems.push(`arc ${a}: a junction with segment 0 at ${deg(p)} is not an end of core arc ${ca}`); continue; }
      if (seg < 1 || seg >= n) { problems.push(`arc ${a}: segment ${seg} outside core arc ${ca}`); continue; }
      const d = segM(p, [core.lon[cs + seg - 1], core.lat[cs + seg - 1]], [core.lon[cs + seg], core.lat[cs + seg]]); if (d > worstJ) worstJ = d;
      if (d > JUNCTION_M) problems.push(`arc ${a}: the junction at ${deg(p)} is ${Math.round(d)} m off its core segment`);
    }
  }
  check(!problems.length, `${refs} core references valid (arc, kind, range, direction, junctions on their LOD 2 segments) and ${own} own admin-1 lines`, problems.length ? problems.slice(0, 6).join("; ") : `the farthest junction ${worstJ.toFixed(1)} m from its segment`);
}

/* ---------- rings close, at every level; the tiling ---------- */
console.log("rings and tiling");
const J = F.historyJunctions(T, core);
const geomAt = []; for (let L = 0; L < levels; L++) { const g = new Array(nA); for (let a = 0; a < nA; a++) g[a] = F.historyArcGeometry(T, core, a, L, J, H.arcEmpty); geomAt.push(g); }
const ringPts = (refs, L) => { const pts = []; for (const r of refs) { const g = geomAt[L][Math.abs(r) - 1], seq = r > 0 ? g : g.slice().reverse(); for (const p of seq) if (!pts.length || pts[pts.length - 1][0] !== p[0] || pts[pts.length - 1][1] !== p[1]) pts.push(p); } if (pts.length > 1 && pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1]) pts.pop(); return pts; };
for (let L = 0; L < levels; L++) {
  let open = 0, nR = 0;
  for (const f of T.faces) for (const refs of f.rings) { nR++; for (let k = 0; k < refs.length; k++) { const g1 = geomAt[L][Math.abs(refs[k]) - 1], g2 = geomAt[L][Math.abs(refs[(k + 1) % refs.length]) - 1]; const end = refs[k] > 0 ? g1[g1.length - 1] : g1[0], start = refs[(k + 1) % refs.length] > 0 ? g2[0] : g2[g2.length - 1]; if (end[0] !== start[0] || end[1] !== start[1]) { open++; break; } } }
  check(!open, `level ${L}: all ${nR} rings close`, open + " open");
}
{
  const use = new Int32Array(nA), fwd = new Int32Array(nA), back = new Int32Array(nA);
  for (const f of T.faces) for (const refs of f.rings) for (const r of refs) { const a = Math.abs(r) - 1; use[a]++; if (r > 0) fwd[a]++; else back[a]++; }
  const badRef = [], badOwn = [];
  for (let a = 0; a < nA; a++) { if (T.coreArc[a] >= 0) { if (use[a] !== 1 || fwd[a] !== 1) badRef.push(a); } else if (fwd[a] !== 1 || back[a] !== 1) badOwn.push(a); }
  check(!badRef.length, "every outline piece used once, forward (the parent's side)", badRef.slice(0, 8).join(", "));
  check(!badOwn.length, "every admin-1 line used twice, once each way (a unit on each side)", badOwn.slice(0, 8).join(", "));
  // the pieces of each core arc chain from its head to its tail in the parent's direction (a ring the core leaves with no area may be left out)
  const byCore = new Map(); for (let a = 0; a < nA; a++) if (T.coreArc[a] >= 0) { let l = byCore.get(T.coreArc[a]); if (!l) byCore.set(T.coreArc[a], l = []); l.push(a); }
  const gaps = [], skipped = [];
  for (const [ca, { dir }] of parentArcs) {
    const cs = core.arcOffset[ca], ce = core.arcOffset[ca + 1];
    const head = dir > 0 ? [core.lon[cs], core.lat[cs]] : [core.lon[ce - 1], core.lat[ce - 1]], tail = dir > 0 ? [core.lon[ce - 1], core.lat[ce - 1]] : [core.lon[cs], core.lat[cs]];
    const ps = byCore.get(ca) || [];
    if (!ps.length) { skipped.push(ca); continue; }
    const startAt = new Map(); for (const a of ps) startAt.set(T.lon[T.arcOffset[a]] + "," + T.lat[T.arcOffset[a]], a);
    let p = head, n = 0; const seen = new Set();
    while (!(p[0] === tail[0] && p[1] === tail[1] && n > 0) && n <= ps.length) { const a = startAt.get(p[0] + "," + p[1]); if (a == null || seen.has(a)) break; seen.add(a); p = [T.lon[T.arcOffset[a] + 1], T.lat[T.arcOffset[a] + 1]]; n++; }
    if (seen.size !== ps.length || p[0] !== tail[0] || p[1] !== tail[1]) gaps.push(ca);
  }
  // a core arc no piece names must lie on a ring of no area (the core's two-arc rings at Sir Creek)
  const zeroRing = new Set(); for (const c of spec.countries) { const pe = CH.entities.findIndex((e) => e.id === c.parent); for (const f of core.faces) if (f.entity === pe) for (const ring of f.rings) { const pts = []; for (const r of ring) { const a = Math.abs(r) - 1, s = core.arcOffset[a], e = core.arcOffset[a + 1]; const idx = []; for (let i = s; i < e; i++) idx.push(i); if (r < 0) idx.reverse(); for (const i of idx) pts.push([core.lon[i], core.lat[i]]); } const ar = pts.length >= 3 ? R.ringAreaAndTurn(R.dedupeRing(pts)).area : 0; if (ar === 0) for (const r of ring) zeroRing.add(Math.abs(r) - 1); } }
  const badSkip = skipped.filter((ca) => !zeroRing.has(ca));
  check(!gaps.length && !badSkip.length, `the pieces of each of the parent faces' ${parentArcs.size} core arcs chain from head to tail`, gaps.length || badSkip.length ? `broken: ${gaps.slice(0, 6).join(", ")}; unused with area: ${badSkip.join(", ")}` : `${skipped.length} arcs of rings with no area left out (${skipped.join(", ")})`);
}
// the area: the units together are the parent face, at every level (exactly at LOD 2; at a coarser level the core drops islands under its minLod, which the history format does not carry)
// km² of a ring on the sphere, by the edge sum Σ Δλ (2 + sin φ1 + sin φ2) / 2 · R² — additive, so a face split into pieces sums to the whole
const km2 = (pts) => { if (pts.length < 3) return 0; const q = R.QUANTUM * Math.PI / 180; let s = 0; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; let d = b[0] - a[0]; if (d > R.X180) d -= 2 * R.X180; if (d < -R.X180) d += 2 * R.X180; s += d * q * (2 + Math.sin(a[1] * q) + Math.sin(b[1] * q)); } return -s / 2 * (G.R_EARTH_M / 1000) * (G.R_EARTH_M / 1000); };   // counter-clockwise positive
for (const c of spec.countries) {
  const pe = CH.entities.findIndex((e) => e.id === c.parent);
  const ents = new Set(H.entities.map((e, i) => (e.parent === c.parent ? i : -1)).filter((i) => i >= 0));
  for (let L = 0; L < levels; L++) {
    let coreA = 0, ours = 0;
    for (const f of core.faces) if (f.entity === pe) for (const ring of f.rings) { if (Array.from(ring).some((r) => core.arcMinLod[Math.abs(r) - 1] > L)) continue; const pts = []; for (const r of ring) { const a = Math.abs(r) - 1, s = core.arcOffset[a], e = core.arcOffset[a + 1]; const idx = []; for (let i = s; i < e; i++) if (core.rank[i] <= L) idx.push(i); if (r < 0) idx.reverse(); for (const i of idx) if (!pts.length || pts[pts.length - 1][0] !== core.lon[i] || pts[pts.length - 1][1] !== core.lat[i]) pts.push([core.lon[i], core.lat[i]]); } if (pts.length > 1 && pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1]) pts.pop(); coreA += km2(pts); }
    T.faces.forEach((f) => { if (!ents.has(f.entity)) return; for (const refs of f.rings) ours += km2(ringPts(refs, L)); });
    const diff = ours - coreA, rel = Math.abs(diff) / coreA;
    if (L === levels - 1) check(rel < 1e-6, `${c.a3}: the units tile the parent face at LOD 2 (area)`, `${Math.round(ours)} km² against ${Math.round(coreA)} km² (${diff >= 0 ? "+" : ""}${diff.toFixed(2)} km²)`);
    else note(`${c.a3} level ${L}: the units ${Math.round(ours)} km², the core face ${Math.round(coreA)} km² (${diff >= 0 ? "+" : ""}${diff.toFixed(1)} km²: the core's islands under their minLod)`);
  }
}
{
  // every line vertex inside the parent face (LOD 2), or on its outline
  let outside = 0, n = 0; const where = [];
  const segs = []; for (const [ca] of parentArcs) for (let i = core.arcOffset[ca] + 1; i < core.arcOffset[ca + 1]; i++) segs.push(i);
  const CELL = Math.round(0.05 / R.QUANTUM), strips = new Map();
  segs.forEach((i, k) => { const x0 = Math.min(core.lon[i - 1], core.lon[i]), x1 = Math.max(core.lon[i - 1], core.lon[i]); for (let st = Math.floor(x0 / CELL); st <= Math.floor(x1 / CELL); st++) { let l = strips.get(st); if (!l) strips.set(st, l = []); l.push(k); } });
  const inParent = (x, y) => { let c = false, on = false; for (const k of strips.get(Math.floor(x / CELL)) || []) { const i = segs[k], x0 = core.lon[i - 1], y0 = core.lat[i - 1], x1 = core.lon[i], y1 = core.lat[i]; if ((x === x0 && y === y0) || (x === x1 && y === y1)) on = true; if ((x0 > x) === (x1 > x)) continue; if (y0 + (x - x0) * (y1 - y0) / (x1 - x0) > y) c = !c; } return c || on; };
  for (let a = 0; a < nA; a++) { if (T.coreArc[a] >= 0) continue; for (let i = T.arcOffset[a] + 1; i < T.arcOffset[a + 1] - 1; i++) { n++; if (!inParent(T.lon[i], T.lat[i])) { outside++; if (where.length < 5) where.push(deg([T.lon[i], T.lat[i]])); } } }
  check(!outside, `every inner vertex of every line (${n}) inside its parent face`, where.join("; "));
}

/* ---------- planar, at every level ---------- */
console.log("planar");
for (let L = 0; L < levels; L++) {
  const segs = []; for (let a = 0; a < nA; a++) { const g = geomAt[L][a]; for (let i = 1; i < g.length; i++) segs.push([g[i - 1], g[i]]); }
  const idx = SegIndex.build(segs.length, Math.round(0.05 / R.QUANTUM), (k) => [segs[k][0][0], segs[k][0][1], segs[k][1][0], segs[k][1][1]]);
  const V = (p) => G.vec(p[0], p[1], R.QUANTUM), eq = (p, q) => p[0] === q[0] && p[1] === q[1];
  let x = 0; const where = [];
  idx.pairs((i, j) => { const s = segs[i], t = segs[j]; if (eq(s[0], t[0]) || eq(s[0], t[1]) || eq(s[1], t[0]) || eq(s[1], t[1])) return; if (G.segmentsCross(V(s[0]), V(s[1]), V(t[0]), V(t[1]))) { x++; if (where.length < 4) where.push(deg(s[0])); } });
  check(!x, `level ${L}: no two of the ${segs.length} drawn segments cross`, where.join("; "));
}

/* ---------- points ---------- */
console.log("points");
{
  global.window = global.window || {};
  require(path.join(DATA, "gazetteer.js"));
  const Gz = window.ATLAS_GAZETTEER, ci = (n) => Gz.cols.indexOf(n);
  const inFace = (f, x, y) => { let c = false; for (const refs of f.rings) { const ring = ringPts(refs, levels - 1); for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1]; if ((yi > y) !== (yj > y) && x < xi + (y - yi) * (xj - xi) / (yj - yi)) c = !c; } } return c; };
  const failed = [], missing = [];
  for (const [name, qid, iso] of POINTS) {
    const row = Gz.rows.find((r) => r[ci("name")] === name && "Q" + r[ci("qid")] === qid);
    if (!row) { missing.push(name + " " + qid); continue; }
    const at = row[ci("at")], x = R.U(at[0]), y = R.U(at[1]);
    const ei = H.entities.findIndex((e) => e.iso === iso), f = T.faces[H.steps.find((s) => s[0] === ei)[3]];
    if (!inFace(f, x, y)) { const inside = T.faces.find((g) => inFace(g, x, y)); failed.push(`${name} (${at}) is not in ${iso}${inside ? ", but in " + H.entities[inside.entity].iso : ", in no unit"}`); }
  }
  check(!missing.length, `every assertion's city found in the gazetteer by name and Wikidata item (${POINTS.length})`, missing.join(", "));
  check(!failed.length, `${POINTS.length - failed.length - missing.length} cities inside their own unit at LOD 2 (${new Set(POINTS.map((p) => p[2])).size} units; the 26 capitals the gazetteer carries among them)`, failed.join("; "));
  // the spec's corrections, on the built faces: a dropped ring's check point is not in that unit; an island's point is in its unit
  const unitAt = (lonlat) => { const x = R.U(lonlat[0]), y = R.U(lonlat[1]); const f = T.faces.find((g) => inFace(g, x, y)); return f ? H.entities[f.entity].iso : null; };
  for (const c of spec.countries) for (const fx of c.corrections || []) {
    if (fx.drop) { const u = unitAt(fx.check.outside), v = unitAt(fx.at); check(u !== fx.iso && v !== fx.iso, `${fx.iso}: the dropped ring is gone (its point and the check point are not ${fx.iso})`, `${fx.at} in ${v}, ${fx.check.outside} in ${u}`); }
    if (fx.island) { const u = unitAt(fx.island); check(u === fx.iso, `${fx.iso}: the island at ${fx.island} is ${fx.iso}'s`, `in ${u}`); }
    if (fx.join) { const ends = fx.ends.map((p) => [R.U(p[0]), R.U(p[1])]); let found = false; for (let a = 0; a < nA && !found; a++) { if (T.coreArc[a] >= 0) continue; const has = (q) => { for (let i = T.arcOffset[a]; i < T.arcOffset[a + 1]; i++) if (T.lon[i] === q[0] && T.lat[i] === q[1]) return i; return -1; }; const i = has(ends[0]), j = has(ends[1]); if (i >= 0 && j >= 0 && Math.abs(i - j) === 1) found = true; } check(found, `${fx.join.join("|")}: the joined line runs straight from ${JSON.stringify(fx.ends[0])} to ${JSON.stringify(fx.ends[1])}`); }
  }
}

/* ---------- budget and the twin ---------- */
console.log("budget");
check(bytes.length <= BUDGET_BYTES, `the file under its budget`, `${bytes.length} bytes of ${BUDGET_BYTES}`);
{ const tw = Twin.checkTwin(file); check(tw.ok, "admin1.bin.js, the file:// twin, decodes to the file", tw.ok ? `${tw.twinBytes} bytes` : tw.reason); }
{ const twins = fs.readdirSync(DATA).filter((f) => f.endsWith(".bin.js")); const total = twins.reduce((s, f) => s + fs.statSync(path.join(DATA, f)).size, 0); check(total <= TWINS_MAX, `the ${twins.length} file:// twins together under ${TWINS_MAX / 1e6} MB`, `${(total / 1e6).toFixed(2)} MB: ${twins.join(", ")}`); }

console.log(`\n${pass} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);
