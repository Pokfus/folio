#!/usr/bin/env node
/* check-topology.js — the build-time gate for Atlas v2's topology (docs/atlas-v2-design.md §2.11).

     node .claude/atlas-build/check-topology.js [file] [--max-bytes N] [--tiles] [--quiet]

   Default file: atlas/data/topology.bin. Exit 1 on any failure. ZERO DEPENDENCIES — it reads the
   file with the same atlas/atlas-format.js the browser uses and the geometry in lib/geo.js, so CI
   runs it without `npm ci` and the renderer can never disagree with it about a byte.

   WHAT IT PROVES on the core file (the §2.11 table):

     licences        every arc and face traces to a source in the file's own header, and every header
                     source carries id, name, version, url, licence, licenceUrl, attribution, retrieved
     well-formed     ranks within the LOD count, endpoints rank 0, arc lengths sane, refs name arcs
     rings close     consecutive arcs of a ring meet end to start, and the ring returns to its start
     shared borders  every admin-0 border arc is used exactly twice, once each way, by two DIFFERENT
                     entities (a seam left in would be the same entity twice; a border used once has a
                     gap) — a single-sided one is allowed only when flagged DISPUTED (one source's own
                     line) or WATER (a line over sea or lake, no face on either side); admin-1 arcs are
                     used twice by two units of one country
     coast           every coast arc is used by at most one face per layer, and forward (land on its
                     left); unreferenced coast is "unmapped land" and is counted, not failed
     planar          at every LOD, no two segments of the drawn arcs properly cross
     areas           Σ admin-0 face areas ≤ land area; the difference is the unmapped land, in km²; the
                     admin-1 faces of a country do not exceed the country
     steps           per entity sorted and non-overlapping; every step names a real face
     points          about 40 Natural Earth populated places well inland are inside a face, and about
                     20 open-ocean points inside none, AT EVERY LEVEL — an independent source's answer
                     to "is this land", so an orientation or labelling fault cannot pass unnoticed
     size            the file is within --max-bytes

   WITH --tiles it also opens every tile the core's index names (atlas/data/tiles/<z>/<x>-<y>.bin) and
   proves: the header names the core's buildId and its sources; every tile arc with a core reference is
   a piece of that core arc with the same kind, source and flags, and its outer ends coincide with the
   core arc's endpoints; the pieces of one core arc across tiles chain end to start (so the union of the
   tile strokes is the level's line); every EDGE chord lies on the tile boundary, is never stroked
   (kind EDGE), and is matched by the same chord reversed, for the same face, in the neighbouring tile
   (so the union of a face's tile pieces is the face); every tile is planar; every face piece names a
   core face whose entity it carries; the point assertions hold in the tiles too; and the tile index
   is exact (every present tile exists, no tile exists that the index omits).

   It prints every count it measured, because a green run that says nothing is one nobody reads.
*/
"use strict";
const fs = require("fs"), path = require("path");
const F = require("./lib/format.js");
const G = require("./lib/geo.js");
const SegIndex = require("./lib/segindex.js");

const argv = process.argv.slice(2);
const flag = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const quiet = argv.includes("--quiet"), withTiles = argv.includes("--tiles");
const file = argv.find((a) => !a.startsWith("--") && !/^\d+$/.test(a) && argv[argv.indexOf(a) - 1] !== "--max-bytes") || path.join(__dirname, "..", "..", "atlas", "data", "topology.bin");
const maxBytes = Number(flag("--max-bytes", 3 * 1024 * 1024));

let pass = 0, fail = 0;
const ok = (m, d) => { pass++; if (!quiet) console.log(`  \x1b[32mok\x1b[0m    ${m}${d ? "  \x1b[2m" + d + "\x1b[0m" : ""}`); };
const bad = (m, d) => { fail++; console.log(`  \x1b[31mFAIL\x1b[0m  ${m}${d ? "  \x1b[2m" + d + "\x1b[0m" : ""}`); };
const note = (m) => { if (!quiet) console.log(`        \x1b[2m${m}\x1b[0m`); };

/* ---------- the independent point assertions ----------
   Inland places from Natural Earth 10m populated places (PD), chosen ≥ 60 km from any coast so no
   level's simplification can move the shore over them; open-ocean points chosen ≥ 300 km from land.
   Coordinates are NE's own (lon, lat), rounded to 2 decimals; the country is what the face must say.
   The water points avoid lakes: the OSM land polygons draw coastline round the Caspian but not the Great
   Lakes or Lake Victoria, which are land to this partition (see the note under SEA). */
const LAND = [
  ["Madrid", -3.69, 40.40, "adm0:esp"], ["Moscow", 37.61, 55.75, "adm0:rus"], ["Ulaanbaatar", 106.91, 47.92, "adm0:mng"],
  ["Nairobi", 36.81, -1.28, "adm0:ken"], ["Kampala", 32.58, 0.32, "adm0:uga"], ["Lusaka", 28.28, -15.41, "adm0:zmb"],
  ["Bamako", -8.00, 12.65, "adm0:mli"], ["Niamey", 2.11, 13.52, "adm0:ner"], ["N'Djamena", 15.05, 12.11, "adm0:tcd"],
  ["Khartoum", 32.53, 15.59, "adm0:sdn"], ["Addis Ababa", 38.70, 9.03, "adm0:eth"], ["Ouagadougou", -1.53, 12.37, "adm0:bfa"],
  ["Kabul", 69.18, 34.52, "adm0:afg"], ["Tehran", 51.42, 35.70, "adm0:irn"], ["Ankara", 32.86, 39.93, "adm0:tur"],
  ["Riyadh", 46.77, 24.64, "adm0:sau"], ["New Delhi", 77.20, 28.60, "adm0:ind"], ["Lahore", 74.35, 31.56, "adm0:pak"],
  ["Kathmandu", 85.32, 27.71, "adm0:npl"], ["Lhasa", 91.10, 29.65, "adm0:chn"], ["Xi'an", 108.89, 34.28, "adm0:chn"],
  ["Novosibirsk", 82.93, 55.03, "adm0:rus"], ["Yakutsk", 129.73, 62.03, "adm0:rus"], ["Astana", 71.43, 51.18, "adm0:kaz"],
  ["Tashkent", 69.29, 41.31, "adm0:uzb"], ["Minsk", 27.57, 53.90, "adm0:blr"], ["Kyiv", 30.51, 50.43, "adm0:ukr"],
  ["Warsaw", 21.02, 52.26, "adm0:pol"], ["Prague", 14.46, 50.08, "adm0:cze"], ["Vienna", 16.36, 48.20, "adm0:aut"],
  ["Bern", 7.47, 46.92, "adm0:che"], ["Paris", 2.33, 48.87, "adm0:fra"], ["Lyon", 4.84, 45.75, "adm0:fra"],
  ["Mexico City", -99.13, 19.44, "adm0:mex"], ["Denver", -104.98, 39.74, "adm0:usa"], ["Kansas City", -94.58, 39.10, "adm0:usa"],
  ["Winnipeg", -97.17, 49.88, "adm0:can"], ["Edmonton", -113.49, 53.55, "adm0:can"], ["Bogotá", -74.08, 4.60, "adm0:col"],
  ["La Paz", -68.15, -16.50, "adm0:bol"], ["Brasília", -47.92, -15.78, "adm0:bra"], ["Córdoba", -64.18, -31.40, "adm0:arg"],
  ["Canberra", 149.13, -35.28, "adm0:aus"], ["Alice Springs", 133.88, -23.70, "adm0:aus"], ["Maseru", 27.48, -29.32, "adm0:lso"],
  ["Lesotho interior", 28.50, -29.60, "adm0:lso"], ["Adygea (Maykop)", 40.10, 44.60, "adm0:rus"], ["South Pole", 0, -89.99, "adm0:ata"],
];
const SEA = [
  ["mid Atlantic", -30, 30], ["mid Atlantic S", -20, -30], ["mid Pacific", -150, 10], ["mid Pacific S", -120, -40],
  ["N Pacific", -170, 40], ["Indian Ocean", 80, -20], ["S Indian", 60, -45], ["Southern Ocean", 120, -60],
  ["Arabian Sea", 62, 15], ["Bay of Bengal", 88, 12], ["Caribbean", -73, 15], ["Gulf of Mexico", -90, 25],
  ["Coral Sea", 155, -18], ["Tasman Sea", 160, -38], ["Bering Sea", -177, 57], ["Norwegian Sea", 0, 68],
  ["N Atlantic", -40, 50], ["Guinea Gulf", 0, 0], ["Mozambique Ch.", 42, -20], ["Caspian centre", 50.5, 42],
  ["Hudson Bay", -85, 60], ["Black Sea", 34, 43],
];
// The Great Lakes and Lake Victoria are NOT in this partition: the OSM land polygons carry no coastline
// there (measured 2026-10-08: no coast vertex within 250 km of their centres), so they are land to this
// topology and a border runs through them as over land. Only the Caspian is coastline among the lakes.

function run() {
  const bytes = fs.readFileSync(file);
  console.log(`\ncheck-topology: ${path.relative(process.cwd(), file)} (${bytes.length} bytes)\n`);
  let T;
  try { T = F.read(new Uint8Array(bytes)); ok("file parses", `format ${T.header.format}, ${T.header.counts.vertices} vertices, ${T.header.counts.arcs} arcs, ${T.header.counts.faces} faces`); }
  catch (e) { bad("file parses", e.message); return; }
  const H = T.header, Q = T.quantum, LODS = T.lodCount;
  const nA = T.arcOffset.length - 1, nV = T.lon.length;
  const KIND = F.KIND;
  const layerOf = (fi) => (H.entities[T.faces[fi].entity] && H.entities[T.faces[fi].entity].parent ? 1 : 0);

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
    const odbl = H.sources.filter((s) => /ODbL/i.test(s.licence));
    if (odbl.length) ok("share-alike sources are credited in this file's own header", odbl.map((s) => s.id).join(", "));
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
    let badParent = 0; for (const e of H.entities) if (e.parent && !H.entities.some((p) => p.id === e.parent)) badParent++;
    badParent ? bad("every admin-1 entity names an existing parent", `${badParent}`) : ok("every admin-1 entity names an existing parent", `${H.entities.filter((e) => e.parent).length} admin-1 entities`);
    const kinds = {}; for (let i = 0; i < nA; i++) kinds[F.KIND_NAME[T.arcKind[i]] || T.arcKind[i]] = (kinds[F.KIND_NAME[T.arcKind[i]] || T.arcKind[i]] || 0) + 1;
    note(`arcs by kind: ${Object.entries(kinds).map(([k, v]) => k + " " + v).join(", ")}`);
  }

  /* rings close */
  const startOf = (ref) => { const a = Math.abs(ref) - 1; const i = ref > 0 ? T.arcOffset[a] : T.arcOffset[a + 1] - 1; return [T.lon[i], T.lat[i]]; };
  const endOf = (ref) => { const a = Math.abs(ref) - 1; const i = ref > 0 ? T.arcOffset[a + 1] - 1 : T.arcOffset[a]; return [T.lon[i], T.lat[i]]; };
  {
    let open = 0, empty = 0, rings = 0, emptyFaces = 0;
    for (const f of T.faces) { if (!f.rings.length) emptyFaces++; for (const r of f.rings) {
      rings++;
      if (!r.length) { empty++; continue; }
      for (let k = 0; k < r.length; k++) { const e = endOf(r[k]), s = startOf(r[(k + 1) % r.length]); if (e[0] !== s[0] || e[1] !== s[1]) { open++; break; } }
    } }
    open ? bad("rings close (arc ends meet the next arc's start)", `${open} of ${rings} rings`) : ok("rings close", `${rings} rings`);
    empty ? bad("no empty rings", `${empty}`) : ok("no empty rings");
    if (emptyFaces) note(`faces with no ring at these levels (all their land is below the finest resident level): ${emptyFaces}`);
  }

  /* shared borders and coast usage, per layer */
  const vec = (i) => G.vec(T.lon[i], T.lat[i], Q);
  const uses = [new Array(nA).fill(null).map(() => []), new Array(nA).fill(null).map(() => [])];
  T.faces.forEach((f, fi) => f.rings.forEach((r) => r.forEach((ref) => uses[layerOf(fi)][Math.abs(ref) - 1].push({ face: fi, sign: Math.sign(ref) }))));
  const arcKm = (i) => { let km = 0; for (let j = T.arcOffset[i] + 1; j < T.arcOffset[i + 1]; j++) km += G.chordMetres(vec(j - 1), vec(j)) / 1000; return km; };
  {
    const SLIVER_KM = 25;
    let borderNone = 0, borderOnceOk = 0, borderOnceBad = 0, borderMany = 0, sameSide = 0, sameEntity = 0, waterOk = 0, waterBad = 0, disputedKm = 0, longestOnce = 0;
    let coastTwice = 0, coastBack = 0, unmapped = 0, coastUsed = 0, nCoast = 0, nBorder = 0, nAdmin1 = 0, coastSlivers = 0, coastSliverKm = 0, edgeArcs = 0;
    let adm1None = 0, adm1Once = 0, adm1Many = 0, adm1SameSide = 0, adm1Diff = 0, adm1Layer0 = 0, borderLayer1Bad = 0;
    for (let i = 0; i < nA; i++) {
      const u0 = uses[0][i], u1 = uses[1][i], k = T.arcKind[i];
      if (k === KIND.BORDER) {
        nBorder++;
        const water = T.arcFlags[i] & F.FLAG.WATER, disputed = T.arcFlags[i] & F.FLAG.DISPUTED;
        if (u0.length === 0) { if (water) waterOk++; else borderNone++; }
        else if (u0.length === 1) { if (water) waterBad++; else if (disputed) { borderOnceOk++; const km = arcKm(i); disputedKm += km; if (km > longestOnce) longestOnce = km; } else borderOnceBad++; }
        else if (u0.length > 2) borderMany++;
        else { if (u0[0].sign === u0[1].sign) sameSide++; if (T.faces[u0[0].face].entity === T.faces[u0[1].face].entity) sameEntity++; }
        // at layer 1 a border may carry up to one unit per side
        if (u1.length > 2) borderLayer1Bad++; else if (u1.length === 2 && u1[0].sign === u1[1].sign) borderLayer1Bad++;
      } else if (k === KIND.ADMIN1) {
        nAdmin1++;
        if (u0.length) adm1Layer0++;
        if (u1.length === 0) { if (!(T.arcFlags[i] & F.FLAG.WATER)) adm1None++; }   // a state line through a bay or a lake has no unit on either side
        else if (u1.length === 1) adm1Once++;
        else if (u1.length > 2) adm1Many++;
        else { if (u1[0].sign === u1[1].sign) adm1SameSide++; const a = H.entities[T.faces[u1[0].face].entity], b = H.entities[T.faces[u1[1].face].entity]; if (a === b) adm1SameSide++; else if (a.parent !== b.parent) adm1Diff++; }
      } else if (k === KIND.COAST) {
        nCoast++;
        if (u0.length === 0) unmapped++;
        else {
          coastUsed++;
          for (const u of [u0, u1]) { const twice = u.length > 1, back = u.some((x) => x.sign < 0); if (twice || back) { const km = arcKm(i); if (km > SLIVER_KM) { if (twice) coastTwice++; if (back) coastBack++; } else { coastSlivers++; coastSliverKm += km; } } }
        }
      } else if (k === KIND.EDGE) edgeArcs++;
    }
    borderNone ? bad("every border arc belongs to a face, or is flagged WATER", `${borderNone} of ${nBorder} unused and unflagged`) : ok("every border arc belongs to a face, or is flagged WATER", `${nBorder} border arcs, ${waterOk} over water`);
    waterBad ? bad("a WATER border has no face", `${waterBad} have one`) : ok("a WATER border has no face");
    borderOnceBad ? bad("every single-sided border is flagged DISPUTED", `${borderOnceBad} are not — a gap`) : ok("every single-sided border is flagged DISPUTED", `${borderOnceOk} one-sided arcs, ${disputedKm.toFixed(1)} km in all, longest ${longestOnce.toFixed(1)} km`);
    borderMany ? bad("no border arc is used more than twice per layer", `${borderMany}`) : ok("no border arc is used more than twice per layer");
    sameSide ? bad("the two faces of a border walk it in opposite directions", `${sameSide} arcs`) : ok("the two faces of a border walk it in opposite directions");
    sameEntity ? bad("no border separates an entity from itself", `${sameEntity} arcs`) : ok("no border separates an entity from itself");
    borderLayer1Bad ? bad("a border carries at most one admin-1 unit per side", `${borderLayer1Bad}`) : ok("a border carries at most one admin-1 unit per side");
    if (nAdmin1) {
      adm1None + adm1Once ? bad("every admin-1 arc is used twice at layer 1", `${adm1None} unused, ${adm1Once} once`) : ok("every admin-1 arc is used twice at layer 1", `${nAdmin1} admin-1 arcs`);
      adm1Many || adm1SameSide ? bad("the two units of an admin-1 arc walk it in opposite directions", `${adm1Many} used > 2, ${adm1SameSide} same side/unit`) : ok("the two units of an admin-1 arc walk it in opposite directions");
      adm1Diff ? bad("an admin-1 arc separates two units of ONE country", `${adm1Diff} separate countries`) : ok("an admin-1 arc separates two units of one country");
      adm1Layer0 ? bad("no admin-0 face uses an admin-1 arc", `${adm1Layer0}`) : ok("no admin-0 face uses an admin-1 arc");
    }
    coastTwice ? bad(`a coast arc longer than ${SLIVER_KM} km belongs to at most one face per layer`, `${coastTwice} arcs`) : ok(`a coast arc longer than ${SLIVER_KM} km belongs to at most one face per layer`, `${coastUsed} of ${nCoast} coast arcs used`);
    coastBack ? bad(`every coast arc longer than ${SLIVER_KM} km is walked with land on its left`, `${coastBack} arcs walked backward`) : ok(`every coast arc longer than ${SLIVER_KM} km is walked with land on its left`);
    note(`coast slivers (a short coast arc two faces claim, or walked against the land): ${coastSlivers}, ${coastSliverKm.toFixed(1)} km in all`);
    note(`unmapped coast arcs (land no face claims): ${unmapped}`);
    if (edgeArcs) note(`tile-edge chords: ${edgeArcs}`);
  }

  /* planarity per LOD */
  const planar = (label, drawable, segOf) => {
    const segs = [];
    for (let a = 0; a < nA; a++) {
      if (!drawable(a)) continue;
      let last = T.arcOffset[a];
      for (let i = T.arcOffset[a] + 1; i < T.arcOffset[a + 1]; i++) if (segOf(i)) { segs.push([a, last, i]); last = i; }
    }
    const cell = Math.max(80, Math.round((segs.length > 2e6 ? 0.02 : segs.length > 3e5 ? 0.1 : 0.5) / Q));
    const grid = SegIndex.build(segs.length, cell, (si) => { const s = segs[si]; return [T.lon[s[1]], T.lat[s[1]], T.lon[s[2]], T.lat[s[2]]]; });
    let crossings = 0; const sample = [];
    const same = (i, j) => T.lon[i] === T.lon[j] && T.lat[i] === T.lat[j];
    grid.pairs((p, q) => {
      const s = segs[p], t = segs[q];
      if (same(s[1], t[1]) || same(s[1], t[2]) || same(s[2], t[1]) || same(s[2], t[2])) return;
      if (G.segmentsCross(vec(s[1]), vec(s[2]), vec(t[1]), vec(t[2]))) { crossings++; if (sample.length < 3) sample.push(`${F.KIND_NAME[T.arcKind[s[0]]]}#${s[0]}×${F.KIND_NAME[T.arcKind[t[0]]]}#${t[0]} at ${(T.lon[s[1]] * Q).toFixed(3)},${(T.lat[s[1]] * Q).toFixed(3)}`); }
    });
    crossings ? bad(`planar ${label}: no two drawn segments cross`, `${crossings} crossings among ${segs.length} segments — ${sample.join("; ")}`) : ok(`planar ${label}: no two drawn segments cross`, `${segs.length} segments`);
    return crossings;
  };
  for (let L = 0; L < LODS; L++) planar(`at LOD ${L}`, (a) => T.arcMinLod[a] <= L, (i) => T.rank[i] <= L);

  /* areas: Σ faces vs land (spherical, at the finest LOD) */
  const P = [0, 0, 1];
  const tri = (a, b) => { const num = G.dot(P, G.cross(a, b)); const den = 1 + G.dot(P, a) + G.dot(a, b) + G.dot(b, P); return 2 * Math.atan2(num, den); };
  const R2 = G.R_EARTH_M * G.R_EARTH_M / 1e6;
  const norm4 = (x) => { const w = 4 * Math.PI; x = x % w; if (x < 0) x += w; return x; };
  {
    const arcArea = new Float64Array(nA);
    for (let a = 0; a < nA; a++) { let s = 0; for (let i = T.arcOffset[a] + 1; i < T.arcOffset[a + 1]; i++) s += tri(vec(i - 1), vec(i)); arcArea[a] = s; }
    let land = 0; for (let a = 0; a < nA; a++) if (T.arcKind[a] === KIND.COAST) land += arcArea[a];
    land = norm4(land) * R2;
    let facesTotal = 0, negative = 0; const faceArea = [];
    T.faces.forEach((f, fi) => { let s = 0; for (const r of f.rings) for (const ref of r) s += ref > 0 ? arcArea[ref - 1] : -arcArea[-ref - 1]; const A = f.rings.length ? norm4(s) * R2 : 0; if (A > 2 * Math.PI * R2) negative++; faceArea.push(A); if (layerOf(fi) === 0) facesTotal += A; });
    const unmappedKm2 = land - facesTotal;
    note(`land ${Math.round(land).toLocaleString("en")} km² (literature ~148.9 M km² incl. Antarctica); admin-0 faces Σ ${Math.round(facesTotal).toLocaleString("en")} km²; land − faces = ${Math.round(unmappedKm2).toLocaleString("en")} km²`);
    negative ? bad("no face encloses more than a hemisphere (orientation)", `${negative} faces`) : ok("no face encloses more than a hemisphere");
    unmappedKm2 < -1 ? bad("faces do not exceed the land (area sum)", `faces exceed land by ${Math.round(-unmappedKm2)} km²`) : ok("faces do not exceed the land (area sum)", `unmapped ${Math.round(unmappedKm2)} km²`);
    const big = faceArea.map((A, i) => [A, i]).filter(([, i]) => layerOf(i) === 0).sort((a, b) => b[0] - a[0]).slice(0, 3).map(([A, i]) => `${H.entities[T.faces[i].entity].name} ${Math.round(A / 1e3).toLocaleString("en")}k`);
    note(`largest faces: ${big.join(", ")} km²`);
    // admin-1: the units of a country sum to at most the country
    const byParent = new Map();
    T.faces.forEach((f, fi) => { if (layerOf(fi) !== 1) return; const p = H.entities[f.entity].parent; byParent.set(p, (byParent.get(p) || 0) + faceArea[fi]); });
    let over = 0; const rows = [];
    for (const [p, sum] of byParent) { const pi = T.faces.findIndex((f) => H.entities[f.entity].id === p); const A = pi >= 0 ? faceArea[pi] : 0; rows.push(`${p} ${Math.round(sum / 1e3)}k of ${Math.round(A / 1e3)}k`); if (sum > A * 1.001 + 1) over++; }
    if (byParent.size) { over ? bad("a country's admin-1 units do not exceed the country", rows.join("; ")) : ok("a country's admin-1 units do not exceed the country", rows.join("; ")); }
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

  /* points: inside a face / inside none, at every level — planar even-odd on each face's rings at that level */
  const X180 = Math.round(180 / Q), Y90 = Math.round(90 / Q);
  function faceRingsAt(fi, L, Tf) {
    Tf = Tf || T;
    const out = [];
    for (const ring of Tf.faces[fi].rings) {
      const vs = []; let skip = false;
      for (const ref of ring) { const a = Math.abs(ref) - 1; if (Tf.arcMinLod[a] > L) { skip = true; break; } const s = Tf.arcOffset[a], e = Tf.arcOffset[a + 1]; if (ref > 0) { for (let i = s; i < e - 1; i++) if (Tf.rank[i] <= L) vs.push(i); } else { for (let i = e - 1; i > s; i--) if (Tf.rank[i] <= L) vs.push(i); } }
      if (!skip && vs.length >= 3) out.push(vs);
    }
    return out;
  }
  function inRings(rings, px, py, Tf) {
    Tf = Tf || T;
    let inside = false;
    for (const vs of rings) {
      const n = vs.length;
      let X = new Float64Array(n), Y = new Float64Array(n), cum = Tf.lon[vs[0]], turn = 0; X[0] = cum; Y[0] = Tf.lat[vs[0]];
      for (let i = 1; i < n; i++) { let dx = Tf.lon[vs[i]] - Tf.lon[vs[i - 1]]; if (dx > X180) dx -= 2 * X180; else if (dx < -X180) dx += 2 * X180; cum += dx; turn += dx; X[i] = cum; Y[i] = Tf.lat[vs[i]]; }
      { let dx = Tf.lon[vs[0]] - Tf.lon[vs[n - 1]]; if (dx > X180) dx -= 2 * X180; else if (dx < -X180) dx += 2 * X180; turn += dx; }
      let m = n;
      if (Math.abs(turn) > X180) { const pole = Y.reduce((s, y) => s + y, 0) / n < 0 ? -Y90 : Y90; const X2 = new Float64Array(n + 3), Y2 = new Float64Array(n + 3); X2.set(X); Y2.set(Y); X2[n] = X[0] + turn; Y2[n] = Y[0]; X2[n + 1] = X[0] + turn; Y2[n + 1] = pole; X2[n + 2] = X[0]; Y2[n + 2] = pole; X = X2; Y = Y2; m = n + 3; }   // close the turn at the first vertex one lap on, then down to the pole and back along it: the pole edge spans the full 360°, not the lap minus the closing edge (measured: the pole corner of the antimeridian cell tested outside Antarctica)
      for (const qx of [px, px + 2 * X180, px - 2 * X180]) {
        let c = false;
        for (let i = 0, j = m - 1; i < m; j = i++) if ((Y[i] > py) !== (Y[j] > py) && qx < (X[j] - X[i]) * (py - Y[i]) / (Y[j] - Y[i]) + X[i]) c = !c;
        if (c) { inside = !inside; break; }
      }
    }
    return inside;
  }
  const faceBox = T.faces.map((f, fi) => { let y0 = Infinity, y1 = -Infinity; for (const vs of faceRingsAt(fi, LODS - 1)) { let turn = 0, sum = 0; for (let i = 0; i < vs.length; i++) { let dx = T.lon[vs[(i + 1) % vs.length]] - T.lon[vs[i]]; if (dx > X180) dx -= 2 * X180; else if (dx < -X180) dx += 2 * X180; turn += dx; sum += T.lat[vs[i]]; } for (const v of vs) { if (T.lat[v] < y0) y0 = T.lat[v]; if (T.lat[v] > y1) y1 = T.lat[v]; } if (Math.abs(turn) > X180) { if (sum < 0) y0 = -Y90; else y1 = Y90; } }   // a ring that circles a pole reaches it
    return [y0, y1]; });
  function faceAt(px, py, L) {
    for (let fi = 0; fi < T.faces.length; fi++) { if (layerOf(fi) !== 0) continue; const b = faceBox[fi]; if (py < b[0] || py > b[1]) continue; if (inRings(faceRingsAt(fi, L), px, py)) return fi; }
    return -1;
  }
  for (let L = 0; L < LODS; L++) {
    let landBad = [], seaBad = [];
    for (const [name, lon, lat, ent] of LAND) { const fi = faceAt(Math.round(lon / Q), Math.round(lat / Q), L); const got = fi >= 0 ? H.entities[T.faces[fi].entity].id : "sea"; if (got !== ent) landBad.push(`${name}: ${got}`); }
    for (const [name, lon, lat] of SEA) { const fi = faceAt(Math.round(lon / Q), Math.round(lat / Q), L); if (fi >= 0) seaBad.push(`${name}: ${H.entities[T.faces[fi].entity].id}`); }
    landBad.length ? bad(`LOD ${L}: ${LAND.length} inland places are in the right country`, landBad.join("; ")) : ok(`LOD ${L}: ${LAND.length} inland places are in the right country`);
    seaBad.length ? bad(`LOD ${L}: ${SEA.length} open-water points are in no face`, seaBad.join("; ")) : ok(`LOD ${L}: ${SEA.length} open-water points are in no face`);
  }

  /* size */
  bytes.length > maxBytes ? bad(`file within ${maxBytes} bytes`, `${bytes.length} (${(bytes.length / 1048576).toFixed(3)} MB)`) : ok(`file within ${maxBytes} bytes`, `${(bytes.length / 1048576).toFixed(3)} MB of ${(maxBytes / 1048576).toFixed(2)} MB`);

  /* ---------- tiles ---------- */
  if (withTiles) checkTiles(T, H, path.join(path.dirname(file), "tiles"));
}

function checkTiles(T, H, dir) {
  const Q = T.quantum, KIND = F.KIND, X180 = Math.round(180 / Q), Y90 = Math.round(90 / Q);
  const index = H.tiles;
  if (!index) { bad("core header carries a tile index"); return; }
  ok("core header carries a tile index", Object.values(index).map((t) => `z=${t.z}: ${t.present.length} of ${t.cols * t.rows}`).join(", "));
  const coreEnd = (a) => [[T.lon[T.arcOffset[a]], T.lat[T.arcOffset[a]]], [T.lon[T.arcOffset[a + 1] - 1], T.lat[T.arcOffset[a + 1] - 1]]];
  const layerOf = (fi) => (H.entities[T.faces[fi].entity].parent ? 1 : 0);
  let totalBytes = 0, totalFiles = 0, largest = 0;
  for (const z of Object.keys(index)) {
    const idx = index[z];
    const W = (2 * X180) / idx.cols, Hh = (2 * Y90) / idx.rows;
    const present = new Set(idx.present);
    // the directory agrees with the index
    const onDisk = fs.existsSync(path.join(dir, z)) ? fs.readdirSync(path.join(dir, z)).filter((f) => /\.bin$/.test(f)).map((f) => f.replace(/\.bin$/, "")) : [];
    const missing = idx.present.filter((k) => !onDisk.includes(k)), extra = onDisk.filter((k) => !present.has(k));
    missing.length || extra.length ? bad(`z=${z}: the tile index matches the directory`, `${missing.length} missing (${missing.slice(0, 5)}), ${extra.length} unlisted (${extra.slice(0, 5)})`) : ok(`z=${z}: the tile index matches the directory`, `${onDisk.length} files`);
    // per-tile checks, with cross-tile bookkeeping
    const pieces = new Map();      // core arc → [{ key, start: [x,y], end: [x,y], bits }]
    // "face|h|y|col" or "face|v|x|row" → { a: [[lo, hi]…], b: [[lo, hi]…] }: the intervals a face's chords cover
    // along one tile line, from the tile on each side (a = south / west of the line). Two chords of one tile
    // may overlap on a line (a face pinched to a point one quantum off the line, where two coast arcs share
    // a vertex — measured on Cuba's north coast), so the invariant is on the UNION: what a face covers along
    // the shared line is the same seen from either tile.
    const chords = new Map();
    let tiles = 0, chordDiag = 0, arcsTotal = 0, facesTotal = 0, edgeOff = 0, edgeStroked = 0, badRef = 0, badKind = 0, badEnds = 0, badBuild = 0, badSrc = 0, badFace = 0, crossings = 0, badEntity = 0, vertsTotal = 0; const crossSample = [];
    const pointHits = { land: [], sea: [] };
    for (const key of idx.present) {
      const file = path.join(dir, z, key + ".bin");
      if (!fs.existsSync(file)) continue;
      const bytes = fs.readFileSync(file); totalBytes += bytes.length; totalFiles++; if (bytes.length > largest) largest = bytes.length;
      let Tt; try { Tt = F.read(new Uint8Array(bytes)); } catch (e) { bad(`z=${z} ${key} parses`, e.message); continue; }
      tiles++;
      const th = Tt.header, tile = th.tile;
      if (!tile || String(tile.z) !== z || `${tile.x}-${tile.y}` !== key) badRef++;
      if (!th.buildId || th.buildId !== H.buildId) badBuild++;
      if (!th.sources || th.sources.length !== H.sources.length || th.sources.some((s, i) => s.id !== H.sources[i].id)) badSrc++;
      const nA = Tt.arcOffset.length - 1, x0 = Math.round(tile.lon0 / Q), y0 = Math.round(tile.lat0 / Q), x1 = x0 + W, y1 = y0 + Hh;
      arcsTotal += nA; vertsTotal += Tt.lon.length;
      const onEdge = (x, y) => { let X = x; if (X - x0 > X180) X -= 2 * X180; else if (x0 - X > X180) X += 2 * X180; return y === y0 || y === y1 || X === x0 || X === x1; };
      // arcs
      for (let a = 0; a < nA; a++) {
        const s = Tt.arcOffset[a], e = Tt.arcOffset[a + 1];
        if (Tt.arcKind[a] === KIND.EDGE) { for (let i = s; i < e; i++) if (!onEdge(Tt.lon[i], Tt.lat[i])) { edgeOff++; break; } continue; }
        const core = Tt.arcRef ? Tt.arcRef[a] : -1;
        if (core < 0) continue;   // a tile-only islet
        if (core >= T.arcOffset.length - 1) { badRef++; continue; }
        if (Tt.arcKind[a] !== T.arcKind[core] || Tt.arcSource[a] !== T.arcSource[core] || Tt.arcFlags[a] !== T.arcFlags[core]) badKind++;
        const bits = Tt.arcRefBits[a], ce = coreEnd(core);
        const st = [Tt.lon[s], Tt.lat[s]], en = [Tt.lon[e - 1], Tt.lat[e - 1]];
        if ((bits & 1) && (st[0] !== ce[0][0] || st[1] !== ce[0][1])) badEnds++;
        if ((bits & 2) && (en[0] !== ce[1][0] || en[1] !== ce[1][1])) badEnds++;
        if (!(bits & 1) && !onEdge(st[0], st[1])) badEnds++;
        if (!(bits & 2) && !onEdge(en[0], en[1])) badEnds++;
        let l = pieces.get(core); if (!l) pieces.set(core, l = []); l.push({ key, st, en, bits });
      }
      // faces: core reference, entity, chords
      Tt.faces.forEach((f, i) => {
        facesTotal++;
        const cf = Tt.faceRef ? Tt.faceRef[i] : -1;
        if (cf < 0 || cf >= T.faces.length) { badFace++; return; }
        if (T.faces[cf].entity !== f.entity) badEntity++;
        for (const ring of f.rings) for (const ref of ring) {
          const a = Math.abs(ref) - 1;
          if (Tt.arcKind[a] !== KIND.EDGE) continue;
          const s = Tt.arcOffset[a], e = Tt.arcOffset[a + 1];
          const vs = []; if (ref > 0) for (let k = s; k < e; k++) vs.push(k); else for (let k = e - 1; k >= s; k--) vs.push(k);
          // a chord along the pole row's edge (lat ±90) has no neighbour; a chord on the antimeridian is keyed with lon 180 folded to -180 so the two sides match
          const fold = (x) => (x === X180 ? -X180 : x);
          for (let k = 1; k < vs.length; k++) {
            const ya = Tt.lat[vs[k - 1]], yb = Tt.lat[vs[k]], xa = fold(Tt.lon[vs[k - 1]]), xb = fold(Tt.lon[vs[k]]);
            if ((ya === -Y90 && yb === -Y90) || (ya === Y90 && yb === Y90)) continue;
            if (xa === xb && ya === yb) continue;   // a zero-length chord covers nothing
            let fk, side, lo, hi;
            if (ya === yb) { fk = `${cf}|h|${ya}|${tile.x}`; side = ya === y0 ? "b" : "a"; lo = Math.min(xa, xb); hi = Math.max(xa, xb); if (hi - lo > X180) { const t = lo; lo = hi; hi = t + 2 * X180; } }   // along a parallel: the tile north of it is side b
            else if (xa === xb) { const col = xa === x0 ? tile.x : tile.x + 1; fk = `${cf}|v|${col % idx.cols}|${tile.y}`; side = xa === x0 ? "b" : "a"; lo = Math.min(ya, yb); hi = Math.max(ya, yb); }   // along a meridian: the tile east of it is side b
            else { chordDiag++; continue; }
            let e = chords.get(fk); if (!e) chords.set(fk, e = { a: [], b: [] });
            e[side].push([lo, hi]);
          }
        }
      });
      // EDGE arcs must not be in any segment the renderer strokes: they are, by kind, skipped — count stroked kinds on the edge instead
      for (let a = 0; a < nA; a++) if (Tt.arcKind[a] !== KIND.EDGE) { const s = Tt.arcOffset[a], e = Tt.arcOffset[a + 1]; if (e - s < 2) continue; const ux = (x) => { let X = x; if (X - x0 > X180) X -= 2 * X180; else if (x0 - X > X180) X += 2 * X180; return X; }; let south = true, north = true, west = true, east = true; for (let i = s; i < e; i++) { if (Tt.lat[i] !== y0) south = false; if (Tt.lat[i] !== y1) north = false; if (ux(Tt.lon[i]) !== x0) west = false; if (ux(Tt.lon[i]) !== x1) east = false; } if (south || north || west || east) edgeStroked++; }   // along ONE edge line, not merely with every vertex on some edge (a chord cutting a corner)
      // planar per tile
      { const segs = []; for (let a = 0; a < nA; a++) for (let i = Tt.arcOffset[a] + 1; i < Tt.arcOffset[a + 1]; i++) segs.push([a, i - 1, i]);
        const grid = SegIndex.build(segs.length, Math.max(80, Math.round(0.02 / Q)), (si) => { const s = segs[si]; return [Tt.lon[s[1]], Tt.lat[s[1]], Tt.lon[s[2]], Tt.lat[s[2]]]; }); const vec = (i) => G.vec(Tt.lon[i], Tt.lat[i], Q);
        const same = (i, j) => Tt.lon[i] === Tt.lon[j] && Tt.lat[i] === Tt.lat[j];
        // a tile is cut in the lon/lat plane (its edges are parallels and meridians, its chords run along
        // them), so a tile is planar in that plane: on the sphere a chord along a parallel is a great
        // circle that sags poleward (measured: 0.004° over 2° of longitude at 56° N) and would "cross" a
        // coast that hugs the edge. The renderer subdivides chords before projecting, so the plane is right.
        const crossPlanar = (i1, i2, j1, j2) => {
          const x1 = Tt.lon[i1], y1 = Tt.lat[i1]; let x2 = Tt.lon[i2], y2 = Tt.lat[i2], x3 = Tt.lon[j1], y3 = Tt.lat[j1], x4 = Tt.lon[j2], y4 = Tt.lat[j2];
          if (x2 - x1 > X180) x2 -= 2 * X180; else if (x1 - x2 > X180) x2 += 2 * X180;
          if (x3 - x1 > X180) { x3 -= 2 * X180; x4 -= 2 * X180; } else if (x1 - x3 > X180) { x3 += 2 * X180; x4 += 2 * X180; }
          if (x4 - x3 > X180) x4 -= 2 * X180; else if (x3 - x4 > X180) x4 += 2 * X180;
          const d = (x2 - x1) * (y4 - y3) - (y2 - y1) * (x4 - x3); if (d === 0) return false;
          const t = ((x3 - x1) * (y4 - y3) - (y3 - y1) * (x4 - x3)) / d, u = ((x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1)) / d;
          return t > 0 && t < 1 && u > 0 && u < 1;
        };
        grid.pairs((p, q) => { const s = segs[p], t = segs[q]; if (same(s[1], t[1]) || same(s[1], t[2]) || same(s[2], t[1]) || same(s[2], t[2])) return; if (crossPlanar(s[1], s[2], t[1], t[2])) { crossings++; if (crossSample.length < 4) crossSample.push(`${key}: ${F.KIND_NAME[Tt.arcKind[s[0]]]}#${Tt.arcRef ? Tt.arcRef[s[0]] : s[0]}×${F.KIND_NAME[Tt.arcKind[t[0]]]}#${Tt.arcRef ? Tt.arcRef[t[0]] : t[0]} at ${(Tt.lon[s[1]] * Q).toFixed(4)},${(Tt.lat[s[1]] * Q).toFixed(4)}`); } }); }
      // points in this tile
      const inTile = (lon, lat) => { let x = Math.round(lon / Q), y = Math.round(lat / Q); let X = x; if (X - x0 > X180) X -= 2 * X180; else if (x0 - X > X180) X += 2 * X180; return X >= x0 && X < x1 && y >= y0 && y < y1; };
      const faceAt = (px, py) => { for (let i = 0; i < Tt.faces.length; i++) { const cf = Tt.faceRef[i]; if (layerOf(cf) !== 0) continue; if (inRingsT(Tt, Tt.faces[i], px, py)) return cf; } return -1; };
      for (const [name, lon, lat, ent] of LAND) if (inTile(lon, lat)) { const fi = faceAt(Math.round(lon / Q), Math.round(lat / Q)); const got = fi >= 0 ? H.entities[T.faces[fi].entity].id : "sea"; pointHits.land.push([name, got === ent, got]); }
      for (const [name, lon, lat] of SEA) if (inTile(lon, lat)) { const fi = faceAt(Math.round(lon / Q), Math.round(lat / Q)); pointHits.sea.push([name, fi < 0, fi >= 0 ? H.entities[T.faces[fi].entity].id : "sea"]); }
    }
    // cross-tile: pieces chain, chords pair
    let chainBad = 0, chainArcs = 0;
    for (const [core, l] of pieces) {
      chainArcs++;
      const starts = l.filter((p) => p.bits & 1).length, ends = l.filter((p) => p.bits & 2).length;
      const closed = T.lon[T.arcOffset[core]] === T.lon[T.arcOffset[core + 1] - 1] && T.lat[T.arcOffset[core]] === T.lat[T.arcOffset[core + 1] - 1];
      if (starts !== 1 || ends !== 1) { chainBad++; continue; }
      // every piece's end is another piece's start, except the one that ends at the core's end
      const byStart = new Map(); for (const p of l) byStart.set(p.st.join(","), (byStart.get(p.st.join(",")) || 0) + 1);
      for (const p of l) { if (p.bits & 2) continue; if (!byStart.get(p.en.join(","))) { chainBad++; break; } }
      void closed;
    }
    let chordBad = 0, chordTotal = 0;
    const chordSample = [];
    const union = (iv) => { const s = iv.slice().sort((p, q) => p[0] - q[0]); const out = []; for (const [lo, hi] of s) { const last = out[out.length - 1]; if (last && lo <= last[1]) { if (hi > last[1]) last[1] = hi; } else out.push([lo, hi]); } return out; };
    for (const [k, e] of chords) {
      chordTotal++;
      const ua = union(e.a), ub = union(e.b);
      const same = ua.length === ub.length && ua.every((iv, i) => iv[0] === ub[i][0] && iv[1] === ub[i][1]);
      if (!same) { chordBad++; if (chordSample.length < 4) { const [f, kind, line] = k.split("|"); const fmt = (u) => u.map(([lo, hi]) => `${(lo * Q).toFixed(3)}..${(hi * Q).toFixed(3)}`).join(" "); chordSample.push(`${H.entities[T.faces[f].entity].id} ${kind === "h" ? "lat" : "lon"} ${(line * Q).toFixed(3)}: ${fmt(ua) || "nothing"} vs ${fmt(ub) || "nothing"}`); } }
    }
    const tileLandBad = pointHits.land.filter((h) => !h[1]), tileSeaBad = pointHits.sea.filter((h) => !h[1]);
    badBuild ? bad(`z=${z}: every tile names the core's buildId`, `${badBuild}`) : ok(`z=${z}: every tile names the core's buildId`, H.buildId);
    badSrc ? bad(`z=${z}: every tile header carries the core's sources`, `${badSrc}`) : ok(`z=${z}: every tile header carries the core's sources`);
    badRef ? bad(`z=${z}: tile headers and arc references are sound`, `${badRef}`) : ok(`z=${z}: tile headers and arc references are sound`, `${arcsTotal} tile arcs in ${tiles} tiles`);
    badKind ? bad(`z=${z}: a tile arc has its core arc's kind, source and flags`, `${badKind}`) : ok(`z=${z}: a tile arc has its core arc's kind, source and flags`);
    badEnds ? bad(`z=${z}: a tile arc's ends are the core arc's endpoints or lie on the tile edge`, `${badEnds}`) : ok(`z=${z}: a tile arc's ends are the core arc's endpoints or lie on the tile edge`);
    chainBad ? bad(`z=${z}: the pieces of each core arc chain across tiles`, `${chainBad} of ${chainArcs} arcs`) : ok(`z=${z}: the pieces of each core arc chain across tiles`, `${chainArcs} core arcs in pieces`);
    edgeOff ? bad(`z=${z}: every EDGE chord lies on its tile's boundary`, `${edgeOff}`) : ok(`z=${z}: every EDGE chord lies on its tile's boundary`);
    edgeStroked ? bad(`z=${z}: no stroked arc lies along a tile edge`, `${edgeStroked}`) : ok(`z=${z}: no stroked arc lies along a tile edge`);
    chordBad ? bad(`z=${z}: what a face's chords cover along a tile line is the same from both tiles`, `${chordBad} of ${chordTotal} face×line pairs — ${chordSample.join("; ")}`) : ok(`z=${z}: what a face's chords cover along a tile line is the same from both tiles`, `${chordTotal} face×line pairs${chordDiag ? ", " + chordDiag + " diagonal chord segments" : ""}`);
    badFace || badEntity ? bad(`z=${z}: every face piece names a core face and carries its entity`, `${badFace} bad refs, ${badEntity} wrong entities`) : ok(`z=${z}: every face piece names a core face and carries its entity`, `${facesTotal} face pieces`);
    crossings ? bad(`z=${z}: planar per tile`, `${crossings} crossings — ${crossSample.join("; ")}`) : ok(`z=${z}: planar per tile`);
    tileLandBad.length ? bad(`z=${z}: inland places are in the right country in their tile`, tileLandBad.map((h) => `${h[0]}: ${h[2]}`).join("; ")) : ok(`z=${z}: inland places are in the right country in their tile`, `${pointHits.land.length} places`);
    tileSeaBad.length ? bad(`z=${z}: open-water points are in no face in their tile`, tileSeaBad.map((h) => `${h[0]}: ${h[2]}`).join("; ")) : ok(`z=${z}: open-water points are in no face in their tile`, `${pointHits.sea.length} points`);
    note(`z=${z}: ${vertsTotal} vertices in ${tiles} tiles`);
  }
  note(`tiles: ${totalFiles} files, ${(totalBytes / 1048576).toFixed(2)} MB, largest ${(largest / 1024).toFixed(1)} KB`);
  function inRingsT(Tt, f, px, py) {
    let inside = false;
    for (const ring of f.rings) {
      const vs = [];
      for (const ref of ring) { const a = Math.abs(ref) - 1; const s = Tt.arcOffset[a], e = Tt.arcOffset[a + 1]; if (ref > 0) { for (let i = s; i < e - 1; i++) vs.push(i); } else { for (let i = e - 1; i > s; i--) vs.push(i); } }
      if (vs.length < 3) continue;
      const n = vs.length; const X = new Float64Array(n), Y = new Float64Array(n); let cum = Tt.lon[vs[0]]; X[0] = cum; Y[0] = Tt.lat[vs[0]];
      for (let i = 1; i < n; i++) { let dx = Tt.lon[vs[i]] - Tt.lon[vs[i - 1]]; if (dx > X180) dx -= 2 * X180; else if (dx < -X180) dx += 2 * X180; cum += dx; X[i] = cum; Y[i] = Tt.lat[vs[i]]; }
      for (const qx of [px, px + 2 * X180, px - 2 * X180]) { let c = false; for (let i = 0, j = n - 1; i < n; j = i++) if ((Y[i] > py) !== (Y[j] > py) && qx < (X[j] - X[i]) * (py - Y[i]) / (Y[j] - Y[i]) + X[i]) c = !c; if (c) { inside = !inside; break; } }
    }
    return inside;
  }
}

run();
/* the file:// twin (Phase 1d, lib/twin.js): the same bytes as base64 in a script, checked by sha256 */
if (file.endsWith("topology.bin")) {
  const tw = require("./lib/twin.js").checkTwin(file);
  tw.ok ? ok("the .js twin decodes to the same bytes (sha256)", `${(tw.twinBytes / 1e6).toFixed(2)} MB for ${(tw.bytes / 1e6).toFixed(2)}; ${tw.sha256.slice(0, 16)}…`) : bad("the .js twin decodes to the same bytes (sha256)", tw.reason + " — run: node .claude/atlas-build/pack.js --twin");
}
console.log(`\n${pass} ok, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
