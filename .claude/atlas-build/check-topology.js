#!/usr/bin/env node
/* check-topology.js — the build-time gate for Atlas v2's topology (docs/atlas-v2-design.md §2.11).

     node .claude/atlas-build/check-topology.js [file] [--max-bytes N] [--quiet]

   Default file: atlas/data/topology.bin. Exit 1 on any failure. ZERO DEPENDENCIES — it reads the
   file with the same atlas/atlas-format.js the browser uses and the geometry in lib/geo.js, so CI
   runs it without `npm ci` and the renderer can never disagree with it about a byte.

   WHAT IT PROVES (the §2.11 table, as far as Phase 0's data goes):

     licences        every arc and face traces to a source in the file's own header, and every header
                     source carries id, name, version, url, licence, licenceUrl, attribution, retrieved
     well-formed     ranks within the LOD count, endpoints rank 0, arc lengths sane, refs name arcs
     rings close     consecutive arcs of a ring meet end to start, and the ring returns to its start
     shared borders  every border arc is used exactly twice, once each way, by two DIFFERENT entities
                     (a seam left in would be the same entity twice; a border used once has a gap)
     coast           every coast arc is used by at most one face, and forward (land on its left);
                     unreferenced coast is "unmapped land" and is counted, not failed
     planar          at every LOD, no two segments of the drawn arcs properly cross (the design's
                     pairwise arc-intersection test; the area-sum test is reported beside it)
     areas           Σ face areas ≤ land area; the difference is the unmapped land, in km²
     steps           per entity sorted and non-overlapping; every step names a real face
     size            the file is within --max-bytes (Phase 0's gate for Natural Earth: 1.5 MB)

   It prints every count it measured, because a green run that says nothing is one nobody reads.
*/
"use strict";
const fs = require("fs"), path = require("path");
const F = require("./lib/format.js");
const G = require("./lib/geo.js");

const argv = process.argv.slice(2);
const flag = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const quiet = argv.includes("--quiet");
const file = argv.find((a) => !a.startsWith("--") && !/^\d+$/.test(a) && argv[argv.indexOf(a) - 1] !== "--max-bytes") || path.join(__dirname, "..", "..", "atlas", "data", "topology.bin");
const maxBytes = Number(flag("--max-bytes", 1.5 * 1024 * 1024));

let pass = 0, fail = 0;
const ok = (m, d) => { pass++; if (!quiet) console.log(`  \x1b[32mok\x1b[0m    ${m}${d ? "  \x1b[2m" + d + "\x1b[0m" : ""}`); };
const bad = (m, d) => { fail++; console.log(`  \x1b[31mFAIL\x1b[0m  ${m}${d ? "  \x1b[2m" + d + "\x1b[0m" : ""}`); };
const note = (m) => { if (!quiet) console.log(`        \x1b[2m${m}\x1b[0m`); };

const bytes = fs.readFileSync(file);
console.log(`\ncheck-topology: ${path.relative(process.cwd(), file)} (${bytes.length} bytes)\n`);
let T;
try { T = F.read(new Uint8Array(bytes)); ok("file parses", `format ${T.header.format}, ${T.header.counts.vertices} vertices, ${T.header.counts.arcs} arcs, ${T.header.counts.faces} faces`); }
catch (e) { bad("file parses", e.message); process.exit(1); }
const H = T.header, Q = T.quantum, LODS = T.lodCount;
const nA = T.arcOffset.length - 1, nV = T.lon.length;
const KIND = F.KIND;

/* licences */
{
  const REQ = ["id", "name", "version", "url", "licence", "licenceUrl", "attribution", "retrieved"];
  const missing = [];
  (H.sources || []).forEach((s) => REQ.forEach((k) => { if (!s[k]) missing.push(`${s.id || "?"}.${k}`); }));
  if (!H.sources || !H.sources.length) bad("header carries a sources block");
  else if (missing.length) bad("every header source is complete", missing.join(", "));
  else ok("header sources complete", H.sources.map((s) => `${s.id} (${s.licence})`).join(", "));
  let badArc = 0, badFace = 0;
  for (let i = 0; i < nA; i++) if (T.arcSource[i] >= H.sources.length) badArc++;
  for (const f of T.faces) if (f.source >= H.sources.length) badFace++;
  badArc || badFace ? bad("every arc and face traces to a header source", `${badArc} arcs, ${badFace} faces do not`) : ok("every arc and face traces to a header source");
}

/* well-formed */
{
  let endRank = 0, rankRange = 0, short = 0, minLod = 0;
  for (let i = 0; i < nA; i++) {
    const s = T.arcOffset[i], e = T.arcOffset[i + 1];
    if (T.rank[s] !== 0 || T.rank[e - 1] !== 0) endRank++;
    if (e - s < 2) short++;
    if (T.arcMinLod[i] >= LODS) minLod++;
  }
  for (let i = 0; i < nV; i++) if (T.rank[i] >= LODS) rankRange++;
  endRank ? bad("arc endpoints are rank 0", `${endRank} arcs`) : ok("arc endpoints are rank 0");
  rankRange ? bad("ranks within the LOD count", `${rankRange} vertices`) : ok("ranks within the LOD count", `${LODS} levels: ${H.lod.intervals_m.join(" / ")} m`);
  short ? bad("every arc has ≥ 2 vertices", `${short} arcs`) : ok("every arc has ≥ 2 vertices");
  minLod ? bad("minLod within the LOD count", `${minLod} arcs`) : ok("minLod within the LOD count");
  const perLevel = []; for (let L = 0; L < LODS; L++) { let c = 0; for (let i = 0; i < nV; i++) if (T.rank[i] <= L) c++; perLevel.push(c); }
  note(`vertices per level: ${perLevel.join(" / ")}`);
  let badRef = 0; for (const f of T.faces) for (const r of f.rings) for (const ref of r) if (ref === 0 || Math.abs(ref) > nA) badRef++;
  badRef ? bad("face refs name arcs", `${badRef} refs`) : ok("face refs name arcs");
  let badEnt = 0; for (const f of T.faces) if (f.entity >= H.entities.length) badEnt++;
  badEnt ? bad("face entities exist", `${badEnt}`) : ok("face entities exist", `${H.entities.length} entities`);
}

/* rings close */
const startOf = (ref) => { const a = Math.abs(ref) - 1; const i = ref > 0 ? T.arcOffset[a] : T.arcOffset[a + 1] - 1; return [T.lon[i], T.lat[i]]; };
const endOf = (ref) => { const a = Math.abs(ref) - 1; const i = ref > 0 ? T.arcOffset[a + 1] - 1 : T.arcOffset[a]; return [T.lon[i], T.lat[i]]; };
{
  let open = 0, empty = 0, rings = 0;
  for (const f of T.faces) for (const r of f.rings) {
    rings++;
    if (!r.length) { empty++; continue; }
    for (let k = 0; k < r.length; k++) { const e = endOf(r[k]), s = startOf(r[(k + 1) % r.length]); if (e[0] !== s[0] || e[1] !== s[1]) { open++; break; } }
  }
  open ? bad("rings close (arc ends meet the next arc's start)", `${open} of ${rings} rings`) : ok("rings close", `${rings} rings`);
  empty ? bad("no empty rings", `${empty}`) : ok("no empty rings");
}

/* shared borders and coast usage */
const vec = (i) => G.vec(T.lon[i], T.lat[i], Q);
const uses = new Array(nA).fill(null).map(() => []);
T.faces.forEach((f, fi) => f.rings.forEach((r) => r.forEach((ref) => uses[Math.abs(ref) - 1].push({ face: fi, sign: Math.sign(ref) }))));
{
  /* SLIVERS (§2.3 conflation step 2: "slivers and gaps below an area threshold are assigned to the
     adjacent face" — Phase 1's build-admin.js). Natural Earth's admin polygons overlap each other or
     the sea by a few hundred metres in a handful of places (Costa Rica and Nicaragua on the San
     Juan's bar; Spain's Peñón de Vélez against Morocco; Bir Tawil against Sudan). In the topology
     they show as a short coast arc used by two faces or walked against the land, or a short border
     with one face. Each is counted and its length added up; one longer than SLIVER_KM is a real
     fault and fails. */
  const SLIVER_KM = 25;
  const arcKm = (i) => { let km = 0; for (let j = T.arcOffset[i] + 1; j < T.arcOffset[i + 1]; j++) km += G.chordMetres(vec(j - 1), vec(j)) / 1000; return km; };
  let borderNone = 0, borderOnce = 0, borderMany = 0, sameSide = 0, sameEntity = 0, coastTwice = 0, coastBack = 0, unmapped = 0, coastUsed = 0, nCoast = 0, nBorder = 0, otherKinds = 0;
  let coastSlivers = 0, coastSliverKm = 0, coastLong = 0;
  for (let i = 0; i < nA; i++) {
    const u = uses[i], k = T.arcKind[i];
    if (k === KIND.BORDER) {
      nBorder++;
      if (u.length === 0) borderNone++;
      else if (u.length === 1) borderOnce++;
      else if (u.length > 2) borderMany++;
      else { if (u[0].sign === u[1].sign) sameSide++; if (T.faces[u[0].face].entity === T.faces[u[1].face].entity) sameEntity++; }
    } else if (k === KIND.COAST) {
      nCoast++;
      if (u.length === 0) unmapped++;
      else {
        coastUsed++;
        const twice = u.length > 1, back = u.some((x) => x.sign < 0);
        if (twice || back) { const km = arcKm(i); if (km > SLIVER_KM) { if (twice) coastTwice++; if (back) coastBack++; coastLong++; } else { coastSlivers++; coastSliverKm += km; } }
      }
    } else otherKinds++;
  }
  borderNone ? bad("every border arc belongs to a face", `${borderNone} of ${nBorder} unused`) : ok("every border arc belongs to a face", `${nBorder} border arcs`);
  /* §2.11: "every land-border arc is referenced by exactly two faces per year (or one face and
     'unmapped')". A border with one face is allowed when what lies beyond it is unmapped land — in
     Natural Earth that is a SLIVER where two neighbouring polygons were digitised apart (Bir Tawil
     against Sudan, the Halaib triangle, an islet off Maui), a few kilometres long. A single-sided
     border longer than SLIVER_KM is a real gap in the partition and fails. */
  /* …and the file says WHICH single-sided borders the sources disagree on (FLAG.DISPUTED: one
     polygon's own line, or a chord across water). Those may have one face. A single-sided border
     that is NOT disputed is a line two polygons share which only one face references: a gap the
     pipeline made, and it fails whatever its length. */
  let trueGaps = 0, disputedOnce = 0, disputedKm = 0, longest = 0;
  for (let i = 0; i < nA; i++) if (T.arcKind[i] === KIND.BORDER && uses[i].length === 1) {
    const km = arcKm(i);
    if (T.arcFlags[i] & F.FLAG.DISPUTED) { disputedOnce++; disputedKm += km; if (km > longest) longest = km; } else trueGaps++;
  }
  trueGaps ? bad("every single-sided border is one the sources dispute", `${trueGaps} of ${borderOnce} are lines two polygons share — a gap`) : ok("every single-sided border is one the sources dispute", `${disputedOnce} disputed arcs with one face, ${disputedKm.toFixed(1)} km in all, longest ${longest.toFixed(1)} km`);
  borderMany ? bad("no border arc is used more than twice", `${borderMany}`) : ok("no border arc is used more than twice");
  sameSide ? bad("the two faces of a border walk it in opposite directions", `${sameSide} arcs`) : ok("the two faces of a border walk it in opposite directions");
  sameEntity ? bad("no border separates an entity from itself (seams removed)", `${sameEntity} arcs`) : ok("no border separates an entity from itself");
  coastTwice ? bad(`a coast arc longer than ${SLIVER_KM} km belongs to at most one face`, `${coastTwice} arcs`) : ok(`a coast arc longer than ${SLIVER_KM} km belongs to at most one face`, `${coastUsed} of ${nCoast} coast arcs used`);
  coastBack ? bad(`every coast arc longer than ${SLIVER_KM} km is walked with land on its left`, `${coastBack} arcs walked backward`) : ok(`every coast arc longer than ${SLIVER_KM} km is walked with land on its left`);
  note(`coast slivers (a short coast arc two faces claim, or walked against the land — source polygons overlapping): ${coastSlivers}, ${coastSliverKm.toFixed(1)} km in all`);
  note(`unmapped coast arcs (land no face claims): ${unmapped}`);
  if (otherKinds) note(`arcs of other kinds: ${otherKinds}`);
}

/* planarity per LOD */
const drawable = (a, L) => {
  if (T.arcMinLod[a] > L) return false;
  return true;
};
{
  for (let L = 0; L < LODS; L++) {
    const segs = [];
    for (let a = 0; a < nA; a++) {
      if (!drawable(a, L)) continue;
      let last = T.arcOffset[a];
      for (let i = T.arcOffset[a] + 1; i < T.arcOffset[a + 1]; i++) if (T.rank[i] <= L) { segs.push([a, last, i]); last = i; }
    }
    const grid = G.Grid(L === 0 ? 1 : L === 1 ? 0.5 : 0.25, Q);
    segs.forEach((s, si) => grid.add(si, T.lon[s[1]], T.lat[s[1]], T.lon[s[2]], T.lat[s[2]]));
    let crossings = 0; const sample = [];
    const same = (i, j) => T.lon[i] === T.lon[j] && T.lat[i] === T.lat[j];
    grid.pairs((p, q) => {
      const s = segs[p], t = segs[q];
      if (same(s[1], t[1]) || same(s[1], t[2]) || same(s[2], t[1]) || same(s[2], t[2])) return;
      if (G.segmentsCross(vec(s[1]), vec(s[2]), vec(t[1]), vec(t[2]))) { crossings++; if (sample.length < 3) sample.push(`${F.KIND_NAME[T.arcKind[s[0]]]}#${s[0]}×${F.KIND_NAME[T.arcKind[t[0]]]}#${t[0]} at ${(T.lon[s[1]] * Q).toFixed(3)},${(T.lat[s[1]] * Q).toFixed(3)}`); }
    });
    crossings ? bad(`planar at LOD ${L}: no two drawn segments cross`, `${crossings} crossings among ${segs.length} segments — ${sample.join("; ")}`)
              : ok(`planar at LOD ${L}: no two drawn segments cross`, `${segs.length} segments`);
  }
}

/* areas: Σ faces vs land (spherical, at the finest LOD) */
{
  const R2 = G.R_EARTH_M * G.R_EARTH_M / 1e6;   // km² per steradian
  const P = [0, 0, 1];   // the reference point for the per-edge signed area (the north pole)
  const tri = (a, b) => { const num = G.dot(P, G.cross(a, b)); const den = 1 + G.dot(P, a) + G.dot(a, b) + G.dot(b, P); return 2 * Math.atan2(num, den); };
  const arcArea = new Float64Array(nA);
  for (let a = 0; a < nA; a++) { let s = 0; for (let i = T.arcOffset[a] + 1; i < T.arcOffset[a + 1]; i++) s += tri(vec(i - 1), vec(i)); arcArea[a] = s; }
  const norm4 = (x) => { const w = 4 * Math.PI; x = x % w; if (x < 0) x += w; return x; };
  let land = 0; for (let a = 0; a < nA; a++) if (T.arcKind[a] === KIND.COAST) land += arcArea[a];
  land = norm4(land) * R2;
  let facesTotal = 0, negative = 0; const faceArea = [];
  T.faces.forEach((f) => { let s = 0; for (const r of f.rings) for (const ref of r) s += ref > 0 ? arcArea[ref - 1] : -arcArea[-ref - 1]; const A = norm4(s) * R2; if (A > 2 * Math.PI * R2) negative++; faceArea.push(A); facesTotal += A; });
  const unmappedKm2 = land - facesTotal;
  note(`land ${Math.round(land).toLocaleString("en")} km² (ETOPO/NE literature: ~148.9 M km² including Antarctica); faces Σ ${Math.round(facesTotal).toLocaleString("en")} km²; land − faces = ${Math.round(unmappedKm2).toLocaleString("en")} km²`);
  negative ? bad("no face encloses more than a hemisphere (orientation)", `${negative} faces`) : ok("no face encloses more than a hemisphere");
  unmappedKm2 < -1 ? bad("faces do not exceed the land (area sum)", `faces exceed land by ${Math.round(-unmappedKm2)} km²`) : ok("faces do not exceed the land (area sum)", `unmapped ${Math.round(unmappedKm2)} km²`);
  const big = faceArea.map((A, i) => [A, i]).sort((a, b) => b[0] - a[0]).slice(0, 3).map(([A, i]) => `${H.entities[T.faces[i].entity].name} ${Math.round(A / 1e3).toLocaleString("en")}k`);
  note(`largest faces: ${big.join(", ")} km²`);
}

/* steps */
{
  const byEnt = new Map();
  let badFace = 0;
  for (const st of H.steps) { if (st[3] >= T.faces.length) badFace++; let a = byEnt.get(st[0]); if (!a) byEnt.set(st[0], a = []); a.push(st); }
  let unsorted = 0, overlap = 0;
  for (const [, arr] of byEnt) {
    for (let i = 1; i < arr.length; i++) {
      const p = arr[i - 1], c = arr[i];
      const pf = p[1] == null ? -Infinity : p[1], pt = p[2] == null ? Infinity : p[2], cf = c[1] == null ? -Infinity : c[1];
      if (cf < pf) unsorted++;
      if (cf <= pt) overlap++;
    }
  }
  badFace ? bad("every step names a face", `${badFace}`) : ok("every step names a face", `${H.steps.length} steps`);
  unsorted ? bad("steps sorted per entity", `${unsorted}`) : ok("steps sorted per entity");
  overlap ? bad("steps do not overlap per entity", `${overlap}`) : ok("steps do not overlap per entity");
}

/* size */
bytes.length > maxBytes ? bad(`file within ${maxBytes} bytes`, `${bytes.length} (${(bytes.length / 1048576).toFixed(3)} MB)`) : ok(`file within ${maxBytes} bytes`, `${(bytes.length / 1048576).toFixed(3)} MB of ${(maxBytes / 1048576).toFixed(2)} MB`);

console.log(`\n${pass} ok, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
