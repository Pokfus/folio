#!/usr/bin/env node
/* check-admin1.js — the CI gate for atlas/data/admin1.bin, the lazy admin-1 layer (docs/atlas-v2-admin1-layer.md §3.1), in check-history.js's style.

     node .claude/atlas-build/check-admin1.js [--quiet]

   Zero dependencies beyond the same atlas/atlas-format.js the browser and the worker read; the committed core beside it. Exit 1 on any failure.

   WHAT IT PROVES:
     header       kindOf "admin1"; the core's buildId and arc count are the committed core's; every source complete (the ODbL source among them,
                  because the file references the OSM coast); the budget
     spec         the entity table is admin1-spec.json, row for row (id `adm1:<a3>:<iso>`, name, kind, type, ISO code, Wikidata item, parent); ids
                  unique and none a core entity's; the parent is a core entity with no admin-1 of its own in the core; one step per unit, [present, null],
                  one face per unit
     references   every core-referencing arc names a core arc of its own kind with a range inside it, consistent with its junction segments, its two
                  stored vertices ON those core segments (or the arc's own endpoints); arcEmpty agrees
     rings close  at every level (0, 1, 2) consecutive arcs of every ring meet end to start, through atlas-format.js historyArcGeometry and
                  historyJunctions — what the worker draws
     tiling       each country is tiled by its units: the core arcs of the parent's face are covered by the file's core references exactly once, in
                  the face's own direction, end to end; every own arc is used by exactly two faces, once each way; no core arc outside the parent's
                  face is referenced; the units' areas sum to the parent's
     inside       every own arc's vertices lie inside the parent's face (no unit outside its parent); each unit's label point inside its own face
     planar       no two segments of the own arcs, or an own arc and the boundary, cross at LOD 2 (the finest level); the crossings at the coarser
                  levels are counted and held under COARSE_MAX
     capitals     the seat of each unit (admin1-capitals.json, coordinates fetched from Wikidata) inside the unit's face — or, where the seat lies in
                  another unit by fact (Chandigarh, the capital of Punjab and Haryana, is a union territory of its own), inside that one
     twin         admin1.bin.js decodes to the file's bytes, and every file:// twin together is within 12 MB */
"use strict";
const fs = require("fs"), path = require("path");
const F = require("./lib/format.js");
const R = require("./lib/rings.js");
const Lbl = require("./lib/label.js");
const T = require("./lib/twin.js");

const argv = process.argv.slice(2), quiet = argv.includes("--quiet");
const HERE = __dirname, ROOT = path.join(HERE, "..", ".."), DATA = path.join(ROOT, "atlas", "data");
const BUDGET_BYTES = 400 * 1024, TWINS_MAX = 12e6, COARSE_MAX = 40;
let pass = 0, fail = 0;
const ok = (m, d) => { pass++; if (!quiet) console.log(`  \x1b[32mok\x1b[0m    ${m}${d ? "  \x1b[2m" + d + "\x1b[0m" : ""}`); };
const bad = (m, d) => { fail++; console.log(`  \x1b[31mFAIL\x1b[0m  ${m}${d ? "  \x1b[2m" + d + "\x1b[0m" : ""}`); };
const Q = R.QUANTUM;
const dg = (x, y) => (x * Q).toFixed(4) + "," + (y * Q).toFixed(4);

console.log("check-admin1: atlas/data/admin1.bin");
const file = path.join(DATA, "admin1.bin");
if (!fs.existsSync(file)) { bad("atlas/data/admin1.bin exists"); process.exit(1); }
const bytes = fs.readFileSync(file);
const A = F.read(new Uint8Array(bytes)), H = A.header;
const C = F.read(new Uint8Array(fs.readFileSync(path.join(DATA, "topology.bin")))), CH = C.header;
const spec = JSON.parse(fs.readFileSync(path.join(HERE, "admin1-spec.json"), "utf8"));
const caps = JSON.parse(fs.readFileSync(path.join(HERE, "admin1-capitals.json"), "utf8"));

/* ---------- header ---------- */
H.kindOf === "admin1" ? ok("kindOf admin1") : bad("kindOf admin1", String(H.kindOf));
H.core && H.core.buildId === CH.buildId ? ok("built on the committed core", CH.buildId) : bad("built on the committed core", (H.core && H.core.buildId) + " ≠ " + CH.buildId);
H.core && H.core.arcs === C.arcOffset.length - 1 ? ok("the core's arc count", String(H.core.arcs)) : bad("the core's arc count");
const need = ["id", "name", "version", "url", "licence", "licenceUrl", "attribution", "retrieved", "sha256"];
const srcOk = (H.sources || []).every((s) => need.every((k) => s[k]));
srcOk && (H.sources || []).length ? ok("every source complete", H.sources.map((s) => s.id + " (" + s.licence + ")").join(", ")) : bad("every source complete");
(H.sources || []).some((s) => s.id === "osm-land-polygons" && /ODbL/.test(s.licence)) ? ok("the ODbL source is credited (the coast is referenced)") : bad("the ODbL source is credited");
for (const s of H.sources || []) { const c = CH.sources.find((x) => x.id === s.id); c && c.sha256 === s.sha256 ? ok("source " + s.id + " is the core's own pin") : bad("source " + s.id + " is the core's own pin"); }
H.generated === null ? ok("no clock in the header (deterministic)") : bad("no clock in the header", String(H.generated));
bytes.length <= BUDGET_BYTES ? ok("within its budget", `${(bytes.length / 1024).toFixed(1)} KB of ${BUDGET_BYTES / 1024}`) : bad("within its budget", `${(bytes.length / 1024).toFixed(1)} KB`);
A.lodCount === CH.lod.intervals_m.length && JSON.stringify(H.lod.intervals_m) === JSON.stringify(CH.lod.intervals_m) ? ok("the core's resident levels", JSON.stringify(H.lod.intervals_m)) : bad("the core's resident levels");

/* ---------- spec ---------- */
const coreIds = new Set(CH.entities.map((e) => e.id));
const want = [];
for (const c of spec.countries) for (const u of c.units) want.push({ id: "adm1:" + c.a3.toLowerCase() + ":" + u.iso.toLowerCase(), name: u.name, kind: "admin1", parent: c.parent, qid: u.qid, iso: u.iso, type: u.kind, wiki: u.wiki, present: c.present });
{
  const probs = [];
  if (H.entities.length !== want.length) probs.push(H.entities.length + " entities, the spec has " + want.length);
  want.forEach((w, i) => { const e = H.entities[i] || {}; for (const k of ["id", "name", "kind", "parent", "qid", "iso", "type", "wiki"]) if (e[k] !== w[k]) probs.push(`row ${i} ${k}: ${e[k]} ≠ ${w[k]}`); });
  probs.length ? bad("the entity table is admin1-spec.json, row for row", probs.slice(0, 5).join("; ")) : ok("the entity table is admin1-spec.json, row for row", want.length + " units");
  const ids = H.entities.map((e) => e.id);
  new Set(ids).size === ids.length ? ok("ids unique") : bad("ids unique");
  const clash = ids.filter((id) => coreIds.has(id));
  clash.length ? bad("no id is a core entity's", clash.join(", ")) : ok("no id is a core entity's");
  for (const c of spec.countries) {
    coreIds.has(c.parent) ? ok("parent " + c.parent + " is a core entity") : bad("parent " + c.parent + " is a core entity");
    CH.entities.some((e) => e.parent === c.parent) ? bad(c.parent + " has no admin-1 units in the core (a country the core carries stays there)") : ok(c.parent + " has no admin-1 units in the core");
    const kinds = {}; for (const u of c.units) kinds[u.kind] = (kinds[u.kind] || 0) + 1;
    ok(c.a3 + ": " + c.units.length + " units", Object.entries(kinds).map(([k, n]) => n + " " + k.toLowerCase() + (n > 1 ? "s" : "")).join(", "));
  }
  const stepProbs = [];
  if (H.steps.length !== want.length) stepProbs.push(H.steps.length + " steps");
  H.steps.forEach((s, i) => { if (s[0] !== i || s[1] !== want[i].present || s[2] !== null || s[3] !== i) stepProbs.push("step " + i + " " + JSON.stringify(s)); });
  A.faces.forEach((f, i) => { if (f.entity !== i) stepProbs.push("face " + i + " names entity " + f.entity); });
  if (A.faces.length !== want.length) stepProbs.push(A.faces.length + " faces");
  stepProbs.length ? bad("one step [present, null] and one face per unit", stepProbs.slice(0, 4).join("; ")) : ok("one step [present, null] and one face per unit");
}

/* ---------- references ---------- */
const nA = A.arcOffset.length - 1;
const empty = H.arcEmpty || [];
const segDist = (x, y, a, k) => { const s = C.arcOffset[a]; const ax = C.lon[s + k - 1], ay = C.lat[s + k - 1], bx = C.lon[s + k], by = C.lat[s + k]; const c = Math.cos(y * Q * Math.PI / 180), vx = (bx - ax) * c, vy = by - ay, L2 = vx * vx + vy * vy; let u = L2 ? ((x - ax) * c * vx + (y - ay) * vy) / L2 : 0; u = Math.max(0, Math.min(1, u)); return R.metres(x, y, Math.round(ax + (bx - ax) * u), Math.round(ay + (by - ay) * u)); };
{
  const probs = []; let nRef = 0, nOwn = 0, worstJ = 0;
  for (let i = 0; i < nA; i++) {
    const a = A.coreArc[i];
    if (a < 0) { nOwn++; if (A.arcKind[i] !== F.KIND.ADMIN1) probs.push("own arc " + i + " is not of kind admin1"); if (empty[i]) probs.push("own arc " + i + " flagged empty"); const s = A.arcOffset[i], e = A.arcOffset[i + 1]; if (A.rank[s] !== 0 || A.rank[e - 1] !== 0) probs.push("own arc " + i + " endpoints not rank 0"); continue; }
    nRef++;
    if (a >= C.arcOffset.length - 1) { probs.push("arc " + i + " names core arc " + a + " (no such arc)"); continue; }
    if (A.arcKind[i] !== C.arcKind[a]) probs.push("arc " + i + " is of kind " + A.arcKind[i] + ", its core arc " + C.arcKind[a]);
    const n = C.arcOffset[a + 1] - C.arcOffset[a], f = A.coreFrom[i], t = A.coreTo[i], sA = A.coreSegA[i], sB = A.coreSegB[i];
    if (A.arcOffset[i + 1] - A.arcOffset[i] !== 2) probs.push("arc " + i + " stores " + (A.arcOffset[i + 1] - A.arcOffset[i]) + " vertices, not its two junctions");
    if (f >= n || t >= n || sA >= n || sB >= n) { probs.push("arc " + i + ": a range or segment past its core arc's " + n + " vertices"); continue; }
    if (!empty[i]) { if (sA && sB && f <= t && !(sA <= f && t <= sB - 1)) probs.push("arc " + i + ": forward range " + f + "–" + t + " outside its junction segments " + sA + "/" + sB); if (sA && sB && f > t && !(sA - 1 >= f && t >= sB)) probs.push("arc " + i + ": backward range " + f + "–" + t + " outside its junction segments " + sA + "/" + sB); }
    else if (f !== 0 || t !== 0) probs.push("arc " + i + ": empty but its range is " + f + "–" + t);
    const s = A.arcOffset[i];
    for (const [vi, sg, end] of [[s, sA, "A"], [s + 1, sB, "B"]]) {
      const x = A.lon[vi], y = A.lat[vi];
      if (sg) { const d = segDist(x, y, a, sg); worstJ = Math.max(worstJ, d); if (d > 40) probs.push(`arc ${i}: junction ${end} ${dg(x, y)} is ${d.toFixed(0)} m off its core segment`); }
      else { const cs = C.arcOffset[a], first = [C.lon[cs], C.lat[cs]], last = [C.lon[cs + n - 1], C.lat[cs + n - 1]]; if (!((x === first[0] && y === first[1]) || (x === last[0] && y === last[1]))) probs.push(`arc ${i}: junction ${end} with no segment is not its core arc's endpoint`); }
    }
  }
  probs.length ? bad("every core reference is well formed", probs.length + ": " + probs.slice(0, 4).join("; ")) : ok("every core reference is well formed", `${nRef} references, ${nOwn} own arcs; every junction within ${worstJ.toFixed(1)} m of its core segment`);
}

/* ---------- rings close at every level (what the worker draws) ---------- */
const junctions = F.historyJunctions(A, C);
const geomAt = new Map();
const geom = (a, L) => { const k = a * 4 + L; let g = geomAt.get(k); if (!g) geomAt.set(k, g = F.historyArcGeometry(A, C, a, L, junctions, empty)); return g; };
const ringPts = (ring, L) => { const pts = []; for (const ref of ring) { const g = geom(Math.abs(ref) - 1, L), seq = ref > 0 ? g : g.slice().reverse(); for (let i = 0; i + 1 < seq.length; i++) pts.push(seq[i]); } return pts; };
for (let L = 0; L < A.lodCount; L++) {
  const probs = []; let rings = 0;
  A.faces.forEach((f, fi) => f.rings.forEach((ring, ri) => {
    rings++;
    for (let k = 0; k < ring.length; k++) {
      const g1 = geom(Math.abs(ring[k]) - 1, L), g2 = geom(Math.abs(ring[(k + 1) % ring.length]) - 1, L);
      const e1 = ring[k] > 0 ? g1[g1.length - 1] : g1[0], s2 = ring[(k + 1) % ring.length] > 0 ? g2[0] : g2[g2.length - 1];
      if (e1[0] !== s2[0] || e1[1] !== s2[1]) { probs.push(`${H.entities[f.entity].name} ring ${ri} breaks at ${dg(e1[0], e1[1])} → ${dg(s2[0], s2[1])}`); break; }
    }
  }));
  probs.length ? bad(`every ring closes at level ${L}`, probs.slice(0, 3).join("; ")) : ok(`every ring closes at level ${L}`, rings + " rings");
}

/* ---------- tiling ---------- */
const area = (pts) => { let s = 0; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) s += pts[j][0] * pts[i][1] - pts[i][0] * pts[j][1]; return s / 2; };
for (const c of spec.countries) {
  const pIdx = CH.entities.findIndex((e) => e.id === c.parent);
  const pFaces = C.faces.filter((f) => f.entity === pIdx);
  // the parent's directed core arcs
  const wantDir = new Map(); for (const f of pFaces) for (const ring of f.rings) for (const ref of ring) { const a = Math.abs(ref) - 1; if (wantDir.has(a)) wantDir.set(a, 0); else wantDir.set(a, ref > 0 ? 1 : -1); }
  const pieces = new Map();   // core arc → [[pA, pB]] in file positions
  const probs = [];
  const fileAt = (i, end) => { const a = A.coreArc[i], n = C.arcOffset[a + 1] - C.arcOffset[a], cs = C.arcOffset[a], vi = A.arcOffset[i] + (end === "A" ? 0 : 1), sg = end === "A" ? A.coreSegA[i] : A.coreSegB[i], x = A.lon[vi], y = A.lat[vi];
    if (!sg) { const closed = C.lon[cs] === C.lon[cs + n - 1] && C.lat[cs] === C.lat[cs + n - 1]; if (closed) { const fwd = empty[i] ? true : A.coreFrom[i] <= A.coreTo[i]; return (end === "A") === fwd ? 0 : n - 1; } return x === C.lon[cs] && y === C.lat[cs] ? 0 : n - 1; }
    const ax = C.lon[cs + sg - 1], ay = C.lat[cs + sg - 1], bx = C.lon[cs + sg], by = C.lat[cs + sg]; const L2 = (bx - ax) ** 2 + (by - ay) ** 2; const u = L2 ? Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / L2)) : 0; return sg - 1 + u; };
  const uses = new Map();   // arc → [{ face, dir }]
  A.faces.forEach((f, fi) => { if (H.entities[f.entity].parent !== c.parent) return; for (const ring of f.rings) for (const ref of ring) { const i = Math.abs(ref) - 1; let l = uses.get(i); if (!l) uses.set(i, l = []); l.push({ fi, dir: ref > 0 ? 1 : -1 }); } });
  for (const [i, l] of uses) {
    if (A.coreArc[i] < 0) { if (l.length !== 2 || l[0].dir === l[1].dir || l[0].fi === l[1].fi) probs.push(`own arc ${i} is used ${l.length}× (${l.map((u) => H.entities[A.faces[u.fi].entity].name + (u.dir > 0 ? "+" : "−")).join(", ")})`); continue; }
    const a = A.coreArc[i];
    if (!wantDir.has(a)) { probs.push(`arc ${i} references core arc ${a}, which is not on ${c.parent}'s face`); continue; }
    if (l.length !== 1) probs.push(`core reference ${i} is used ${l.length}×`);
    let pA = fileAt(i, "A"), pB = fileAt(i, "B"); const d = l[0].dir; if (d < 0) { const t = pA; pA = pB; pB = t; }
    const fwd = pB > pA || (pA === pB && false);
    const dirWanted = wantDir.get(a);
    if (dirWanted !== 0 && (fwd ? 1 : -1) !== dirWanted) probs.push(`core arc ${a} is walked against ${c.parent}'s face`);
    let pl = pieces.get(a); if (!pl) pieces.set(a, pl = []); pl.push([Math.min(pA, pB), Math.max(pA, pB)]);
  }
  for (const [a, dir] of wantDir) {
    const n = C.arcOffset[a + 1] - C.arcOffset[a];
    const pl = (pieces.get(a) || []).sort((p, q) => p[0] - q[0]);
    if (dir === 0) continue;   // an arc the parent walks both ways (a spike inside its own face) — covered by its two references
    let at = 0; for (const [p0, p1] of pl) { if (Math.abs(p0 - at) > 1e-6) { probs.push(`core arc ${a} is covered with a gap or an overlap at ${p0.toFixed(3)} (expected ${at.toFixed(3)})`); break; } at = p1; }
    if (Math.abs(at - (n - 1)) > 1e-6 && !probs.length) probs.push(`core arc ${a} is covered to ${at.toFixed(3)} of ${n - 1}`);
  }
  probs.length ? bad(`${c.a3}: the units tile ${c.parent}'s face`, probs.length + ": " + probs.slice(0, 4).join("; ")) : ok(`${c.a3}: the units tile ${c.parent}'s face`, `${wantDir.size} core arcs covered once, in the face's direction; every own arc used twice, once each way`);
  // areas at LOD 2
  const pArea = pFaces.reduce((s, f) => s + f.rings.reduce((t, ring) => { const pts = []; for (const ref of ring) { const a = Math.abs(ref) - 1, cs = C.arcOffset[a], n = C.arcOffset[a + 1] - cs; for (let j = 0; j + 1 < n; j++) { const o = ref > 0 ? j : n - 1 - j; pts.push([C.lon[cs + o], C.lat[cs + o]]); } } return t + area(pts); }, 0), 0);
  const uArea = A.faces.reduce((s, f) => s + f.rings.reduce((t, ring) => t + area(ringPts(ring, A.lodCount - 1)), 0), 0);
  Math.abs(uArea - pArea) / pArea < 1e-6 ? ok(`${c.a3}: the units' areas sum to ${c.parent}'s`, `at LOD 2, to ${(Math.abs(uArea - pArea) / pArea * 1e6).toFixed(2)} parts per million (the junctions' rounding to the quantum)`) : bad(`${c.a3}: the units' areas sum to ${c.parent}'s`, `${uArea} vs ${pArea}`);
  // inside: every own vertex in the parent's face; each label point in its own face
  const pRings = []; for (const f of pFaces) for (const ring of f.rings) { const pts = []; for (const ref of ring) { const a = Math.abs(ref) - 1, cs = C.arcOffset[a], n = C.arcOffset[a + 1] - cs; for (let j = 0; j + 1 < n; j++) { const o = ref > 0 ? j : n - 1 - j; pts.push([C.lon[cs + o], C.lat[cs + o]]); } } pRings.push(pts); }
  const inRings = (rings, x, y) => { let inside = false; for (const r of rings) for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const p = r[j], q = r[i]; if ((p[1] > y) !== (q[1] > y) && x < p[0] + (y - p[1]) * (q[0] - p[0]) / (q[1] - p[1])) inside = !inside; } return inside; };
  const outside = [];
  for (let i = 0; i < nA; i++) if (A.coreArc[i] < 0) for (let k = A.arcOffset[i] + 1; k < A.arcOffset[i + 1] - 1; k++) if (!inRings(pRings, A.lon[k], A.lat[k])) outside.push(dg(A.lon[k], A.lat[k]));
  outside.length ? bad(`${c.a3}: no unit outside its parent (every inner-line vertex inside ${c.parent})`, outside.length + " outside, e.g. " + outside.slice(0, 3).join(" ")) : ok(`${c.a3}: no unit outside its parent`, "every inner-line vertex inside " + c.parent);
  const offLabel = [];
  A.faces.forEach((f, fi) => { const at = H.faceAnchor[fi]; const rings = f.rings.map((r) => ringPts(r, A.lodCount - 1)); if (!at || !inRings(rings, Math.round(at[0] / Q), Math.round(at[1] / Q))) offLabel.push(H.entities[f.entity].name); });
  offLabel.length ? bad("each unit's label point lies in its own face", offLabel.join(", ")) : ok("each unit's label point lies in its own face");
  // capitals
  const cp = caps.countries[c.a3] || {};
  const capProbs = []; let nCap = 0;
  for (const u of c.units) {
    const row = cp[u.iso]; if (!row) { capProbs.push(u.iso + " has no seat in admin1-capitals.json"); continue; }
    const inIso = row.inUnit || u.iso;
    const fi = H.entities.findIndex((e) => e.iso === inIso); if (fi < 0) { capProbs.push(row.name + ": no unit " + inIso); continue; }
    const rings = A.faces[fi].rings.map((r) => ringPts(r, A.lodCount - 1));
    nCap++;
    if (!inRings(rings, Math.round(row.lon / Q), Math.round(row.lat / Q))) capProbs.push(`${row.name} (${row.lon}, ${row.lat}) is not in ${H.entities[fi].name}`);
  }
  capProbs.length ? bad(`${c.a3}: every seat lies in its unit`, capProbs.join("; ")) : ok(`${c.a3}: every seat lies in its unit`, nCap + " seats (Wikidata's coordinates)");
}

/* ---------- planarity ---------- */
{
  const segsAt = (L) => {   // own segments at level L, and the boundary's (core references) segments
    const own = [], bnd = [];
    for (let i = 0; i < nA; i++) { const g = geom(i, L); const list = A.coreArc[i] < 0 ? own : bnd; for (let k = 0; k + 1 < g.length; k++) if (g[k][0] !== g[k + 1][0] || g[k][1] !== g[k + 1][1]) list.push([g[k][0], g[k][1], g[k + 1][0], g[k + 1][1], i]); }
    return { own, bnd };
  };
  const cross = (s, t) => {
    const share = (s[0] === t[0] && s[1] === t[1]) || (s[0] === t[2] && s[1] === t[3]) || (s[2] === t[0] && s[3] === t[1]) || (s[2] === t[2] && s[3] === t[3]); if (share) return false;
    const o = (ax, ay, bx, by, cx, cy) => Math.sign((bx - ax) * (cy - ay) - (by - ay) * (cx - ax));
    const d1 = o(s[0], s[1], s[2], s[3], t[0], t[1]), d2 = o(s[0], s[1], s[2], s[3], t[2], t[3]), d3 = o(t[0], t[1], t[2], t[3], s[0], s[1]), d4 = o(t[0], t[1], t[2], t[3], s[2], s[3]);
    return d1 * d2 < 0 && d3 * d4 < 0;
  };
  const SegIndex = require("./lib/segindex.js");
  const count = (L) => {
    const { own, bnd } = segsAt(L), all = own.concat(bnd), nOwn = own.length;
    const idx = SegIndex.build(all.length, 400, (i) => all[i]); let n = 0; const at = [];
    idx.pairs((i, j) => { if (i >= nOwn && j >= nOwn) return; if (all[i][4] === all[j][4]) { const a = all[i], b = all[j]; if (!cross(a, b)) return; } if (cross(all[i], all[j])) { n++; if (at.length < 4) at.push(dg(all[i][0], all[i][1]) + " (arcs " + all[i][4] + "/" + all[j][4] + ")"); } });
    return { n, at };
  };
  const fine = count(A.lodCount - 1);
  fine.n ? bad("no inner line crosses another or the boundary at LOD 2", fine.n + " crossings, e.g. " + fine.at.join(" ")) : ok("no inner line crosses another or the boundary at LOD 2");
  for (let L = 0; L < A.lodCount - 1; L++) { const r = count(L); r.n <= COARSE_MAX ? ok(`coarse crossings at level ${L} within ${COARSE_MAX}`, r.n + (r.at.length ? " (e.g. " + r.at.join(" ") + ")" : "")) : bad(`coarse crossings at level ${L} within ${COARSE_MAX}`, r.n + " (e.g. " + r.at.join(" ") + ")"); }
}

/* ---------- twin ---------- */
{
  const tc = T.checkTwin(file);
  tc.ok ? ok("the twin admin1.bin.js decodes to the file", `${(tc.twinBytes / 1024).toFixed(1)} KB, gzip`) : bad("the twin admin1.bin.js decodes to the file", tc.reason);
  const all = ["topology.bin.js", "water.bin.js", "history-wars.bin.js", "history-ww2.bin.js", "admin1.bin.js"].map((f) => { try { return fs.statSync(path.join(DATA, f)).size; } catch (e) { return 0; } }).reduce((a, b) => a + b, 0);
  all <= TWINS_MAX ? ok("every file:// twin together within 12 MB", (all / 1e6).toFixed(2) + " MB") : bad("every file:// twin together within 12 MB", (all / 1e6).toFixed(2) + " MB");
  const cr = fs.readFileSync(path.join(DATA, "credits.js"), "utf8");
  /admin1\.bin/.test(cr) ? ok("the credits page lists admin1.bin") : bad("the credits page lists admin1.bin (run build-credits.js --install)");
}
void Lbl;
console.log(`check-admin1: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
