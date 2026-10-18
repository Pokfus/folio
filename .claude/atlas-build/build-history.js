#!/usr/bin/env node
/* build-history.js — step 3 of the Atlas v2 build (Phase 2a, at full scale since 2b): the STEP TOPOLOGY of the historical
   polities, conflated onto the committed land partition and written as atlas/data/history.bin, a file of its own.

     node --max-old-space-size=8000 build-history.js [--measure] [--install] [--dry] [--years A,B] [--no-cache] [--force]

   WHAT IT MAKES (docs/atlas-v2-design.md §2.3 "The step topology file", §2.4, §7 "Phase 2b"). Cliopatria's rows for EVERY
   card-linked polity series of polity-spec.json — the states Folio's cards teach, the owner's scope of 2026-10-10 — minus the
   series the audit keeps as PEOPLES (the steppe khaganates and the like, Phase 2c; PEOPLES below) and the coastline and
   site-hull series (2c too), over the whole globe and Cliopatria's whole span to YEAR_MAX, are cut into
   EPOCHS — maximal intervals over which the alive set and every shape are constant — and each epoch is conflated onto the
   core's LOD 2 land partition (atlas/data/topology.bin, the finest resident level), in this order:
     d1  a vertex within D1 of the OSM coast is projected onto it (a junction on the coast segment); a chord between two
         consecutive coast junctions that follows the coast (the short way along it is at most RUN_FACTOR × the chord) is
         DROPPED, so the face walk closes the face along the coast itself — the result references the core's coast arcs by id
         (coreRef), never a second line beside the shore;
     d3  a vertex within D3 of a present-day border (the core's BORDER arcs) is projected onto it, and a chord between two
         consecutive junctions on one border arc that follows it becomes a reference to that arc (border inheritance);
     d2  a vertex of one polity within D2 of a neighbour's line is projected onto the neighbour's segment, which gains the
         point, so the two lines share their vertices and their arcs;
     then every crossing becomes a junction, the planar graph of coast pieces and line pieces is walked into cycles, the land
     pieces are LABELLED by the polities whose (snapped) polygons contain an interior point, a piece claimed by nobody or by
     two polities below SLIVER_KM2 goes to the neighbour with the longest shared edge, a larger overlap becomes a CONTESTED
     face owned by both, and land no polity claims stays unmapped.
   Arcs are given ONE identity across epochs by exact key (the vertex sequence, or the core arc and the junction pair), so a
   border that does not move is one arc shared by every step that uses it; faces with identical rings are one face; a step
   is (entity, from, to, face) with consecutive epochs on one face merged.

   MEASURE FIRST (--measure): prints the distance distributions behind D1, D2 and D3 — every pilot vertex to the nearest
   coast, to the nearest neighbour line in its own epoch, to the nearest present-day border — and the area distribution of
   the pieces claimed by nobody or by two, then exits without writing. The thresholds below were chosen from those tables
   (the figures are in §7 "Phase 2a — as built").

   Every snap is logged (lib/log.js) and the build FAILS on a snap beyond the source's tolerance. The build is deterministic:
   no clock in the output, every table sorted — two runs give one sha256. Licence: the file embeds junctions snapped onto
   OSM geometry and references the OSM coast, so it is an ODbL derivative with Cliopatria's CC BY 4.0 attribution kept; the
   header says so and the credits page lists it under the ODbL statement (flagged for counsel in the report).

   Known source faults are left as the source draws them and classed approximate; the assertions in check-history.js list
   them rather than force them. The ONE exception is a dated, documented geometry correction in geometry-fixes.json (2026-10-18:
   the Roman Kingdom's polygon, which left Rome 2.8 km outside the kingdom named after it — docs/atlas-v2-border-audit.md §7),
   applied where the row is read, verified there, and named as Folio's adaptation of CC BY data in the header's sources.

   AT FULL SCALE (Phase 2b). An epoch conflates only the rings its alive rows can touch (a ring's box against the rows' boxes
   grown by D1), so the Pacific costs a Mediterranean epoch nothing; the global registries (arcs, faces, entities) are keyed and
   grow across epochs as before. RESUMABLE: every finished epoch's contribution — the new arcs and faces, the entity ids, the
   owner rows, the stat and snap-count deltas — is written to out/history-cache/<hash>/ (the hash covers the core's buildId,
   Cliopatria's sha, the spec and every constant here); a rerun replays the cached epochs in order into the same registries
   and conflates only the rest, so a crash an hour in costs the minutes since. The replay registers the same records in the
   same order, so a cached and a fresh build give one sha256 (--determinism in check-history.js proves it). MEMORY: the snap
   log keeps the 2,000 largest snaps and the counts; a ring's arc positions are a table, never indexOf. NESTED polities (the
   owner's default, to confirm): where two alive rows overlap and one is almost wholly inside the other (NEST_SHARE of the
   smaller's area, the larger at least NEST_RATIO times it), the overlap is a NESTED face — drawn as the member's, with the
   overlord named — not a contested one; a mutual overlap stays contested. --years A,B builds a band only (the measurement
   the stop rule reads). The file:// twin carries the pilot slice only (SLICE below), with a sentence in its header. */
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const { ensureSource, headerSources } = require("./fetch-sources.js");
const { SnapLog } = require("./lib/log.js");
const R = require("./lib/rings.js");
const G = require("./lib/geo.js");
const SegIndex = require("./lib/segindex.js");
const F = require("./lib/format.js");

const HERE = __dirname, OUT = path.join(HERE, "out"), ROOT = path.join(HERE, "..", ".."), DATA = path.join(ROOT, "atlas", "data");
const argv = process.argv.slice(2);
const MEASURE = argv.includes("--measure"), INSTALL = argv.includes("--install"), DRY = argv.includes("--dry");
const Q = R.QUANTUM, X180 = R.X180, Y90 = R.Y90;
const KIND = F.KIND, FLAG = F.FLAG;
const D2R = Math.PI / 180;
const t0 = Date.now();
const say = (m) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${m}`);
const deg = (x, y) => [+(x * Q).toFixed(5), +(y * Q).toFixed(5)];

/* ---------- the scope (the owner's decision of 2026-10-10, recorded in §2.3 and §7 "Phase 2b") ---------- */
const YEAR_MIN = -3400, YEAR_MAX = 2021;   // Cliopatria begins at 3400 BCE; the present-day faces hold 2022 onward (§2.4)
// the series the audit keeps as PEOPLES (docs/atlas-borders-audit.md §4 C28–C41, "the khaganates and confederations stay peoples"):
// their Cliopatria rows are the WHERE of a soft face in Phase 2c, never a state's border here
const PEOPLES = ["scythia", "galatia", "gothia", "huns", "avars", "old_great_bulgaria", "khazaria", "magyars"];
// Phase 2c: the PRESENCE layer. Peoples (kind "people": Cliopatria's rows as soft faces) and cultures (kind "culture": the coastline series
// cyclades and crete — the island itself — and the site-hull series yangshao and longshan — an outline of dated sites) are drawn as a
// presence, not a territory (design §2.5): no border line, so each is conflated ALONE (an overlap with a state or another people is the
// point, not a contest), onto the coast (d1) and nothing else (no d2, no d3), its own arcs are the soft edge (KIND.SOFT) and its faces
// are class SOFT.
const CULTURES = ["cyclades", "crete", "yangshao", "longshan"];
const isPresenceKind = (k) => k === "people" || k === "culture" || k === "extent" || k === "front";   // 2d: an authored war extent is a soft face alone too (it overlays the states)
const isSeriesKind = (k) => k === "polity" || isPresenceKind(k);
/* what a reader is told about WHERE each presence lay, in the audit's own words (docs/atlas-borders-audit.md §4.C, the rows C3, C4,
   C17, C18, C25, C29, C32–C38) — never more than the audit says; the place card prints it under the uncertainty sentence */
const PRESENCE_NOTES = {
  scythia: "The seventh-century row is maximalist: it includes the Near-Eastern raids. The audit reads the row of 550–451 BCE as the Scythians' dominant range; every shape here is a presence, not a border.",
  galatia: "The earlier shapes are the Galatians' settlement and the shape of 27 BCE is the Roman province; the audit rates the source high-confidence.",
  gothia: "The audit takes the rows of 270–372 CE as the steppe-era Gothia; the shape is a presence north of the Black Sea, not a territory with a border.",
  huns: "Cliopatria draws the Huns at their maximal hegemony, not where they settled; the audit rates the rows of 371–469 CE moderate-confidence.",
  avars: "The audit rates the Carpathian Basin core rows high-confidence; the shape is a presence, not a border.",
  old_great_bulgaria: "The core row of 633–655 CE and the later Volga and Danube branches are drawn; the source covers a small share (14 %) of the span.",
  khazaria: "The shape is the khaganate at its height; its archaeological correlate (the Saltovo–Mayaki culture) is narrower.",
  magyars: "Where Etelköz lay is disputed; the shape is Cliopatria's reading of it, drawn soft.",
  cyclades: "The islands themselves, as the present coastline draws them; Cycladic traits reaching Attica and Euboea are said in text, not drawn.",
  crete: "The island itself, as the present coastline draws it; the years are those of the cards that link it.",
  yangshao: "An outline of where recorded Yangshao sites lie, phase by phase (Hosner et al. 2016): a distribution of sites, not a border.",
  longshan: "An outline of where recorded Longshan sites lie (Hosner et al. 2016), one phase: the source gives no earlier and later Longshan split.",
};
/* THE 24 WAR SIDES THAT RESOLVED TO NO ENTITY (docs/atlas-places-report.md "War sides that resolve to nothing"; the 3a and 2b notes, item 7; the 2c inventory).
   Phase 2d's answer, side by side: BUILT (a polity series answers it — Cliopatria's rows, or an assembly of series — membership by date over entities, never a new
   shape), DERIVED (an extent made from a pinned open source), AUTHORED (kept as the card's own authored extent, drawn soft and said to be Folio's own approximation,
   because no open dataset draws it — DEFERRED, with the reason), UNRESOLVED (named by the card's keys and drawn by nothing). test-war-sides.js holds the same table, so
   the document and the data cannot disagree. Each row: side, cards, status, what draws it, the reason or the audit batch that names the work. */
const WAR_SIDES_2D = [
  ["Athens and its empire", "wh-330, gr-521, gr-552, gr-561", "authored (deferred)", "the card's own extent: Attica, Euboea and the Aegean", "batch 6: Shepherd's plate of c. 450 BCE is public domain but a raster page — an outline of a scatter of tribute-paying coasts and islands whose membership changed year by year (431, 421, 413–404) can be checked only against hand-picked places, and the Athenian Tribute Lists that would fix the members are fragmentary: left as the card's own extent, said so"],
  ["British Raj", "ww2-001", "built", "Cliopatria's \"British Raj\", 1939–45 (the Viceroy declared war on 3 September 1939)", "batch 3"],
  ["Celtiberians", "rm-262, rm-265", "authored (deferred)", "the card's own extent", "batch 6: an Iberian people with no open dataset (OHM's Lusitania is the Augustan province of 27 BCE; historical-basemaps is GPL and static)"],
  ["Chinese warlords", "ww2-001, ww2-096, cnh-631", "unresolved (deferred)", "nothing: the side's other names (the Republic of China and the Communist base areas) are drawn", "none: no open source draws the warlords' territories — said on the place card, never guessed"],
  ["Cisalpine Gauls", "rm-162", "authored (deferred)", "the card's own extent", "batch 6: Cliopatria has no Gallic people and historical-basemaps has the Boii only"],
  ["Ethiopia (Italy)", "ww2-042", "built (already in the file)", "the Ethiopian Empire (Cliopatria, to 1935); 1936 is a gap — Cliopatria draws no Ethiopia between 1936 and 1941, and a gap draws nothing", "batch 3"],
  ["Gallic tribes", "wh-354, rm-350", "authored (deferred)", "the card's own extent", "batch 6: no open polygons for the Gallic civitates; the war moved campaign by campaign (58–51 BCE), recorded only in Caesar's text"],
  ["Greek allies", "wh-319, gr-755", "built (gr-755) / authored (wh-319)", "gr-755: Cliopatria's \"Athenian Coalition\" (323–319 BCE, the Lamian War's alliance); wh-319: the card's own extent", "batch 6: the Hellenic League of 481 BCE is a coalition of 31 poleis (the Serpent Column's list) with no polygon; Cliopatria's \"Greek City-States\" blob over-claims it (Thebes and Thessaly stood with Persia)"],
  ["Lusitanians", "rm-263", "authored (deferred)", "the card's own extent", "batch 6: an Iberian people with no open dataset"],
  ["Macedon and the Greek leagues", "wh-349", "built", "an assembly of Macedon, the Achaean League and the Aetolian League (Cliopatria), by date", "batch 5"],
  ["Messenia", "gr-235, gr-236, gr-237, gr-461", "derived", "OpenHistoricalMap's Lacedaemon (CC0) inside the Taygetos line the card drew", "batch 5; the outer limit is OHM's (whose own tags say \"needs source for boundary lines\"), the line between Laconia and Messenia is Folio's"],
  ["Samnium", "rm-151, rm-152, rm-153, rm-156", "authored (deferred)", "the card's own extent", "batch 6: not in Cliopatria; historical-basemaps' Samnites are GPL and static; Pleiades/AWMC give label lines, not borders"],
  ["Seneca and Cayuga", "us-071", "authored (deferred)", "the card's own extent", "none: Cliopatria's Haudenosaunee is the whole confederacy (an over-claim for two nations) and the Royce cessions begin in 1784, after the 1779 expedition"],
  ["Sicilian Greeks", "gr-448", "authored (deferred)", "the card's own extent", "batch 6: Cliopatria draws one \"Greek City-States\" blob; OHM has Carthaginian Sicily but not Akragas or Gela"],
  ["Sparta", "gr-235, gr-236, gr-237, gr-461", "derived", "OpenHistoricalMap's Lacedaemon (CC0) outside the Taygetos line the card drew", "batch 5; as Messenia"],
  ["Sparta and its allies", "wh-330, gr-521", "built", "Cliopatria's Peloponnesian League (gr-561's series), by date", "batch 5"],
  ["Syracuse", "gr-552", "authored (deferred)", "the card's own extent", "batch 6: Cliopatria draws one \"Greek City-States\" blob; OHM has no Syracuse of 415 BCE"],
  ["Umbria and Picenum", "rm-159", "authored (deferred)", "the card's own extent", "batch 8: the earlier, larger range is text-only; OHM has only the Augustan regiones of 7 CE"],
  ["Union of South Africa", "ww2-001", "built", "Cliopatria's \"South Africa\", 1939–45 (declared war on Germany on 6 September 1939)", "batch 3"],
  ["Western Confederacy", "us-072", "derived", "the card's own limit of the Ohio country less the cessions the Royce Schedule dates by each year (USFS, public domain)", "batch 6: the outer limit is Folio's editorial line (the audit says no source draws it), the cuts are Royce's"],
  ["Yugoslavia", "ww2-001", "built", "Cliopatria's \"Yugoslavia\" (1937–40, 1945; the state's own rows, with a gap while it was occupied), on the Allied side from 1941", "batch 3"],
  ["the Celtiberians and Lusitanians", "rm-261", "authored (deferred)", "the card's own extent", "batch 6: two Iberian peoples with no open dataset"],
  ["the Yue peoples", "cnh-205", "authored (deferred)", "the card's own extent", "none: Cliopatria's Minyue lies in Fujian; the conquest of 214 BCE was in Lingnan"],
  ["the allies", "gr-676", "authored (deferred)", "the card's own extent: three islands and Byzantium", "batch 6: the islands could be OSM coast rings (as the Cyclades are) but Byzantium is a city on a strait with no ring; left as one authored side rather than half-built"],
];
const SRC_IDX = { clio: 0, coast: 1, adm0: 2, wd: 3, hosner: 4, authored: 5, ohm: 6, usfs: 7, sched: 8, control: 9, atlas: 10 };   // the index of each source in the header's list (arcs and faces name theirs by it)
const NEST_SHARE = 0.8, NEST_RATIO = 2;   // nested, not contested: the overlap holds ≥ 80 % of the smaller claimant and the larger is ≥ 2× it
// the pilot slice (2a; the file:// twin carries this much, with a sentence): the Mediterranean and Near East, 550 BCE – 650 CE
const SLICE = { years: [-550, 650], region: { lon0: -25, lat0: 5, lon1: 95, lat1: 62 }, series: ["rome", "carthage", "achaemenid", "macedon", "ptolemaic", "seleucid", "byzantium", "sasanian"] };
const BAND = (() => { const i = argv.indexOf("--years"); if (i < 0) return null; const [a, b] = argv[i + 1].split(",").map(Number); if (!(a < b)) throw new Error("--years A,B"); return [a, b]; })();
const USE_CACHE = !argv.includes("--no-cache");
/* ---------- the tolerances, chosen from --measure (§7 "Phase 2a — as built") ---------- */
const SRC = { clio: "cliopatria", coast: "osm-land-polygons", adm0: "ne-10m-admin0", wd: "wikidata-capitals", hosner: "hosner-2016", authored: "folio-authored-extents", ohm: "ohm-lacedaemon", usfs: "usfs-royce-cessions", sched: "usfs-royce-schedule", control: "ww2-atlas-control", atlas: "us-army-battlefront-atlas" };
const TOLERANCE_M = { [SRC.clio]: 15000 };    // Cliopatria's stated precision class (§2.3 step 4): no snap may exceed it
/* Phase 2d: a front is not Cliopatria's. Its rings reach the coast by the same snap rule (D1_M), so the reach is the tolerance — D1 plus one quantum of rounding (the 15,001 m of a Pacific plate's China coast) —
   while the plate's OWN registration error (6–39 km, per plate) is carried on the plate (`unc`), not hidden in a snap. It is kept out of TOLERANCE_M so the epoch caches' key is unchanged. */
const FRONT_SNAP = "ww2-fronts", TOLERANCE_SNAP = Object.assign({ [FRONT_SNAP]: 16000 }, TOLERANCE_M);
/* MEASURED 2026-10-09 (out/history-measure.json, 267,932 pilot vertices): vertex → OSM coast has NO knee — 4,856 within 250 m,
   then a hump from 2 to 10 km (the coast-following vertices of a 10 km source sit 5 km off the shore) thinning past 15 km
   (2,945 in 15–20 km, 93,540 beyond 60 km: the inland ones); vertex → a neighbour's line in the same epoch is bimodal —
   37,865 within 250 m (Cliopatria's neighbours share their borders exactly where they share them at all) and a second
   cluster at 6–8 km (3,524: two lines drawn twice, a source's width apart); vertex → a present-day border has no cluster at
   all (792 within 250 m, 5,635 within 2 km, of 267,932). So a vertex snaps to a coast or a neighbour only when it is SURELY
   on it (within D*_SURE) or when it and a neighbouring vertex of its own line both lie within D* of the same line and the
   walk along that line between their projections is a run (≤ RUN_FACTOR × the chord, or under RUN_MIN_M): a border running
   12 km inland parallel to the coast is not a coastline, a border 7 km from a neighbour's drawn twice is one border. */
const D1_M = 15000, D1_SURE_M = 4000;   // vertex → OSM coast
const D2_M = 8000, D2_SURE_M = 1000;    // vertex → a neighbour's line in the same epoch
/* RING_SNAP_FRAC and SMALL_RING_M (border audit of 2026-10-16, docs/atlas-v2-border-audit.md §3): a vertex of a SMALL ring — one whose scale (the square root of
   its area) is under SMALL_RING_M, 40 km, a polygon of under 1,600 km² — may travel to the coast (D1), a present-day border (D3) or a neighbour's line (D2) no farther
   than RING_SNAP_FRAC (a fifth) of that scale; a hole takes its parent's scale. D1's 15 km and D2's 8 km fit a Cliopatria polygon hundreds of km across and ruin one
   30 km across: the Roman Kingdom's 859 km² pentagon had two corners carried 8.8 and 12.4 km onto the coast (Rome 2.8 km outside the source, 6.5 km after the snap),
   and Carthage's 7 km square — like three squares of the Mongol Empire of 1245 — had its corners snapped onto the coast and vanished. A vertex over the cap stays
   where the source put it; the land clip and the sea-chord rule treat it as they treat any vertex farther than D1 from the coast. Rings of 40 km and over are not
   touched, and neither are a presence (peoples, cultures: no seat, a soft cover) or the Second World War fronts (test-peoples.js pins their meshes). Capping every
   ring instead (tried) refused 51,000 snaps and changed no more of the audit; this refuses far fewer. */
const RING_SNAP_FRAC = 0.2, SMALL_RING_M = 40000;
const SEA_M = 120000;    // a sea chord's middle is judged against the nearest coast within this distance (the Adriatic is under 200 km wide)
const D3_M = 2000;                      // vertex → a present-day border: runs only, never a lone vertex
const RUN_FACTOR = 3;     // a chord between two junctions on one line follows that line when the short way along it is ≤ this × the chord
const RUN_MIN_M = 3000;   // …or when the short way is under this, whatever the chord
const SLIVER_KM2 = 120;   // a piece claimed by nobody or by two below this merges into its longest-edge neighbour; above it an overlap is contested
const SLIVER_WIDTH_M = 4000;   // …or thinner than this
const LOD_M = [10000, 2500, 500];
const DUP_U = 2;          // two points within this many quanta are one point

/* ================= 0. the core: the land partition at LOD 2, the coast rings, the present-day borders ================= */
const core = F.readFile(path.join(DATA, "topology.bin"));
const CH = core.header;
const buildId = CH.buildId;
say(`core ${buildId}: ${core.lon.length} vertices, ${core.arcOffset.length - 1} arcs, ${core.faces.length} faces`);
const nCA = core.arcOffset.length - 1;
const coreVec = (i) => G.vec(core.lon[i], core.lat[i], Q);
// land-left orientation of every coast arc from the admin-0 faces (every arc the land references forward has land on its left)
const coastDir = new Int8Array(nCA).fill(1);
{ const layer0 = CH.entities.map((e) => !e.parent); for (const f of core.faces) { if (!layer0[f.entity]) continue; for (const ring of f.rings) for (const ref of ring) { const a = Math.abs(ref) - 1; if (core.arcKind[a] === KIND.COAST) coastDir[a] = ref > 0 ? 1 : -1; } } }
const pkey = (x, y) => x * 4000000 + y;
// the core vertex of an arc end in the land-left direction
const arcHead = (a) => (coastDir[a] > 0 ? core.arcOffset[a] : core.arcOffset[a + 1] - 1), arcTail = (a) => (coastDir[a] > 0 ? core.arcOffset[a + 1] - 1 : core.arcOffset[a]);
// coast rings: chain the coast arcs head→tail in the land-left direction
const rings = [];   // { arcs: [a…], bbox, lenM, cum: [per arc, metres at its head], polar }
{
  const byHead = new Map();
  for (let a = 0; a < nCA; a++) if (core.arcKind[a] === KIND.COAST) { const k = pkey(core.lon[arcHead(a)], core.lat[arcHead(a)]); let l = byHead.get(k); if (!l) byHead.set(k, l = []); l.push(a); }
  const used = new Uint8Array(nCA);
  for (let a0 = 0; a0 < nCA; a0++) {
    if (core.arcKind[a0] !== KIND.COAST || used[a0]) continue;
    const arcs = []; let a = a0, guard = 0;
    while (!used[a] && guard++ < 1e6) {
      used[a] = 1; arcs.push(a);
      const k = pkey(core.lon[arcTail(a)], core.lat[arcTail(a)]);
      const l = (byHead.get(k) || []).filter((b) => !used[b] && b !== a);
      if (!l.length) break;
      a = l[0];
    }
    rings.push({ arcs });
  }
  for (const r of rings) {
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const a of r.arcs) for (let i = core.arcOffset[a]; i < core.arcOffset[a + 1]; i++) { const x = core.lon[i], y = core.lat[i]; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    r.bbox = [x0, y0, x1, y1];
  }
  say(`coast rings: ${rings.length} from ${rings.reduce((s, r) => s + r.arcs.length, 0)} coast arcs`);
}
const regionRings = rings;   // the whole globe (2b); an epoch takes the rings its rows can touch (conflate)
const ringOfArc = new Int32Array(nCA).fill(-1), arcAtRing = new Int32Array(nCA).fill(-1);   // arcAtRing: the arc's position in its ring's list (indexOf over Eurasia's thousands of arcs was most of ringPos)
regionRings.forEach((r, ri) => { r.index = ri; r.arcs.forEach((a, k) => { ringOfArc[a] = ri; arcAtRing[a] = k; }); });
say(`rings: ${regionRings.length}`);
// coast segments of the region in one index: segment k = core vertex segV[k]-1 → segV[k] (within arc segA[k])
const segA = [], segV = [];
for (const r of regionRings) for (const a of r.arcs) for (let i = core.arcOffset[a] + 1; i < core.arcOffset[a + 1]; i++) { segA.push(a); segV.push(i); }
const nCS = segA.length;
const CELL = Math.round(0.05 / Q);
const coastIdx = SegIndex.build(nCS, CELL, (k) => [core.lon[segV[k] - 1], core.lat[segV[k] - 1], core.lon[segV[k]], core.lat[segV[k]]]);
say(`coast segments in the region: ${nCS}`);
// land or sea at a point: the parity of a ray NORTH to the pole against the coast rings (whole rings, so the parity is exact);
// the segments are bucketed by longitude strip so a query touches a few dozen of them. The 2a test cast the ray EAST and unwrapped
// every segment about the point, so at global scale (2b) the ray ran half round the globe and ended on the far side — on land for
// most of Eurasia — and the parity inverted: chords across the Mongol Empire read as sea chords and were dropped, its ring opened
// and its interior belonged to nobody (measured: 24,543 km² for 1241–1249). The North Pole is sea in the OSM partition, so a ray
// to it ends at sea from every point. (The earlier test — the side of the nearest segment — misjudged the mouth of the Argolic
// Gulf, a chord across it at the vertex of a headland, in every epoch.)
const STRIP = CELL; const strips = new Map();
const NSTRIP = Math.round(2 * X180 / STRIP);
for (let k = 0; k < nCS; k++) { let x0 = core.lon[segV[k] - 1], x1 = core.lon[segV[k]]; if (x1 - x0 > X180) x1 -= 2 * X180; else if (x0 - x1 > X180) x1 += 2 * X180; const s0 = Math.floor(Math.min(x0, x1) / STRIP), s1 = Math.floor(Math.max(x0, x1) / STRIP); for (let st = s0; st <= s1; st++) { const key = ((st % NSTRIP) + NSTRIP) % NSTRIP; let l = strips.get(key); if (!l) strips.set(key, l = []); l.push(k); } }
for (const [st, l] of strips) strips.set(st, Int32Array.from(l));
const landAt = (x, y) => {
  const l = strips.get(((Math.floor(x / STRIP) % NSTRIP) + NSTRIP) % NSTRIP); if (!l) return false; let c = 0;
  for (let i = 0; i < l.length; i++) { const k = l[i]; let x0 = core.lon[segV[k] - 1], x1 = core.lon[segV[k]]; const y0 = core.lat[segV[k] - 1], y1 = core.lat[segV[k]]; if (x0 - x > X180) x0 -= 2 * X180; else if (x - x0 > X180) x0 += 2 * X180; if (x1 - x0 > X180) x1 -= 2 * X180; else if (x0 - x1 > X180) x1 += 2 * X180; if ((x0 > x) === (x1 > x)) continue; const yi = y0 + (x - x0) * (y1 - y0) / (x1 - x0); if (yi > y) c++; }
  return (c & 1) === 1;
};
if (process.env.DEBUG_LAND) { for (const p of process.env.DEBUG_LAND.split(";")) { const [lon, lat] = p.split(",").map(Number); const x = R.U(lon), y = R.U(lat); const l = strips.get(Math.floor(y / STRIP)); console.log(`DEBUG_LAND ${lon},${lat}: land ${landAt(x, y)} (strip has ${l ? l.length : 0} segments)`); } process.exit(0); }
// present-day border arcs (land borders, not over water) of the region
const bordA = [], bordV = [];
for (let a = 0; a < nCA; a++) { if (core.arcKind[a] !== KIND.BORDER || (core.arcFlags[a] & FLAG.WATER)) continue; const s = core.arcOffset[a], e = core.arcOffset[a + 1]; let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity; for (let i = s; i < e; i++) { if (core.lon[i] < x0) x0 = core.lon[i]; if (core.lon[i] > x1) x1 = core.lon[i]; if (core.lat[i] < y0) y0 = core.lat[i]; if (core.lat[i] > y1) y1 = core.lat[i]; }  for (let i = s + 1; i < e; i++) { bordA.push(a); bordV.push(i); } }
const bordIdx = SegIndex.build(bordA.length, CELL, (k) => [core.lon[bordV[k] - 1], core.lat[bordV[k] - 1], core.lon[bordV[k]], core.lat[bordV[k]]]);
say(`present-day border segments in the region: ${bordA.length}`);

/* nearest segment of an index to a point, metric within the planar error over a few kilometres */
function nearest(x, y, maxM, idx, segOf, skip) {
  const mLat = Q * D2R * G.R_EARTH_M, c = Math.cos(y * Q * D2R), mLon = mLat * c;
  const rU = Math.ceil(maxM / Math.min(mLat, mLon || mLat));
  let best = null, bestD2 = maxM * maxM;
  idx.near(x, y, rU, (k) => {
    if (skip && skip(k)) return;
    const s = segOf(k);
    let x1 = s[0], x2 = s[2]; const y1 = s[1], y2 = s[3];
    if (x1 - x > X180) x1 -= 2 * X180; else if (x - x1 > X180) x1 += 2 * X180;
    if (x2 - x1 > X180) x2 -= 2 * X180; else if (x1 - x2 > X180) x2 += 2 * X180;
    const ax = (x1 - x) * mLon, ay = (y1 - y) * mLat, bx = (x2 - x) * mLon, by = (y2 - y) * mLat;
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
    let t = l2 > 0 ? -(ax * dx + ay * dy) / l2 : 0; if (t < 0) t = 0; else if (t > 1) t = 1;
    const px = ax + dx * t, py = ay + dy * t, d2 = px * px + py * py;
    if (d2 < bestD2) { bestD2 = d2; let qx = Math.round(x1 + (x2 - x1) * t); if (qx >= X180) qx -= 2 * X180; if (qx < -X180) qx += 2 * X180; best = { metres: Math.sqrt(d2), px: qx, py: Math.round(y1 + (y2 - y1) * t), k, t }; }
  });
  return best;
}
const coastSeg = (k) => [core.lon[segV[k] - 1], core.lat[segV[k] - 1], core.lon[segV[k]], core.lat[segV[k]]];
const bordSeg = (k) => [core.lon[bordV[k] - 1], core.lat[bordV[k] - 1], core.lon[bordV[k]], core.lat[bordV[k]]];
const metresU = (x1, y1, x2, y2) => R.metres(x1, y1, x2, y2);
// the position of a coast junction (arc a, segment ending at core vertex i, parameter t along it) as metres along the arc in the LAND-LEFT direction
const arcCum = new Map();   // arc → Float64Array of cumulative metres at each vertex (file order)
function cumOf(a) { let c = arcCum.get(a); if (c) return c; const s = core.arcOffset[a], e = core.arcOffset[a + 1]; c = new Float64Array(e - s); for (let i = s + 1; i < e; i++) c[i - s] = c[i - s - 1] + metresU(core.lon[i - 1], core.lat[i - 1], core.lon[i], core.lat[i]); arcCum.set(a, c); return c; }
const arcLenM = (a) => { const c = cumOf(a); return c[c.length - 1]; };
for (const r of regionRings) { r.cum = []; let m = 0; for (const a of r.arcs) { r.cum.push(m); m += arcLenM(a); } r.lenM = m; }
// a junction on segment k of the coast index at parameter t → its position along the ring (metres, land-left direction)
function ringPos(k, t) {
  const a = segA[k], i = segV[k], s = core.arcOffset[a], c = cumOf(a);
  const along = c[i - 1 - s] + (c[i - s] - c[i - 1 - s]) * t;   // metres from the arc's file-order start
  const r = regionRings[ringOfArc[a]];
  const inArc = coastDir[a] > 0 ? along : arcLenM(a) - along;
  return { ring: r, pos: r.cum[arcAtRing[a]] + inArc, arc: a, i, t };
}

/* ================= 1. the sources: Cliopatria's rows for every card-linked series, the capitals ================= */
const spec = JSON.parse(fs.readFileSync(path.join(ROOT, ".claude", "polity-spec.json"), "utf8"));
/* Phase 2d: the series the war sides add live in war-series.json (same shape), so v1's polity builder and its tests, which read polity-spec.json, are untouched */
const WAR_SPEC = JSON.parse(fs.readFileSync(path.join(HERE, "war-series.json"), "utf8"));
for (const [k, p] of Object.entries(WAR_SPEC.polities)) { if (spec.polities[k]) throw new Error(`war-series.json redefines ${k}, which polity-spec.json holds`); spec.polities[k] = p; }
for (const [card, l] of Object.entries(WAR_SPEC.links || {})) { const o = spec.links[card] || (spec.links[card] = {}); for (const k of ["v", "l", "area"]) if (l[k]) o[k] = [...new Set((o[k] || []).concat(l[k]))]; }
ensureSource(SRC.clio, { verifyOnly: true });
const clioSrc = headerSources([SRC.clio])[0];
// the coast and the present-day borders are referenced, not re-read: their source records are the core's own header entries
const coastSrc = CH.sources.find((s) => s.id === SRC.coast), adm0Src = CH.sources.find((s) => s.id === SRC.adm0);
if (!coastSrc || !adm0Src) throw new Error("the core header lacks the OSM or the Natural Earth admin-0 source entry");
const clioFile = path.join(HERE, "src", SRC.clio, "cliopatria_polities_only.geojson");
if (!fs.existsSync(clioFile)) throw new Error("run fetch-sources.js cliopatria first (" + clioFile + ")");
say("reading Cliopatria…");
const GJ = JSON.parse(fs.readFileSync(clioFile, "utf8"));
const byName = new Map();
for (const f of GJ.features) { const n = f.properties.Name; let l = byName.get(n); if (!l) byName.set(n, l = []); l.push(f); }
say(`Cliopatria: ${GJ.features.length} rows, ${byName.size} names`);
// every spec series with Cliopatria rows, less the peoples; the cards that link each series travel with it (spec.links: a
// locator's { area } or a war's { v, l } name series by key) — Phase 3's `places` field reads them, nothing draws from them yet
const [Y0, Y1] = BAND || [YEAR_MIN, YEAR_MAX];
const cardsOf = new Map(); for (const [card, l] of Object.entries(spec.links || {})) for (const k of [].concat(l.area || [], l.v || [], l.l || [])) { let c = cardsOf.get(k); if (!c) cardsOf.set(k, c = []); if (!c.includes(card)) c.push(card); }
const series = [], presenceSeries = [], deferred = [];
for (const [key, p] of Object.entries(spec.polities)) {
  if (!p.cliopatria) { if (!CULTURES.includes(key)) deferred.push({ key, why: "no source" }); continue; }   // the coastline and site-hull series are the presence layer's, built below
  const presence = PEOPLES.includes(key);
  const rows = [];
  for (const name of p.cliopatria) for (const f of byName.get(name) || []) {
    let from = f.properties.FromYear, to = f.properties.ToYear;
    if (p.years) { from = Math.max(from, p.years[0]); to = Math.min(to, p.years[1]); }
    from = Math.max(from, Y0); to = Math.min(to, Y1);
    if (from > to) continue;
    rows.push({ f, from, to, name });
  }
  if (!rows.length) { if (!BAND) deferred.push({ key, why: "no Cliopatria row for " + p.cliopatria.join(" / ") }); continue; }
  rows.sort((a, b) => a.from - b.from || a.name.localeCompare(b.name));
  for (let i = 1; i < rows.length; i++) if (rows[i].from <= rows[i - 1].to) throw new Error(`series ${key}: rows overlap in time (${rows[i - 1].name} ${rows[i - 1].from}–${rows[i - 1].to} and ${rows[i].name} ${rows[i].from}–${rows[i].to})`);
  (presence ? presenceSeries : series).push(Object.assign({ key, label: p.label, rows, cards: (cardsOf.get(key) || []).slice().sort() }, presence ? { kind: "people", presence: true, src: SRC_IDX.clio, srcId: SRC.clio } : { kind: "polity", src: SRC_IDX.clio, srcId: SRC.clio }));
}
say(`series: ${series.length} with rows in ${Y0}..${Y1} (${series.reduce((n, s) => n + s.rows.length, 0)} rows); deferred ${deferred.length}: ${deferred.map((d) => d.key + " (" + d.why + ")").join(", ")}`);

/* a row's polygon: rings quantised, deduped, spikes cut, long edges densified along the great circle; holes by nesting depth */
// MAX_CHORD_M (2b): a source edge longer than this is split into great-circle pieces of at most this length. Everything downstream
// reads a straight edge two ways — the face walk's angles and the noding's crossing point in the unwrapped lon/lat plane, the
// crossing GATE, the level repair, the checker and the renderer on the sphere — and the two differ by the chord's bow,
// L²/8R: 4.6 km for the Tang border's 281 km edge leaving Laizhou Bay (623 CE), which the sphere crossed on one coast segment
// and the plane on its neighbour, so neither test split it and the walk carried the ocean into the empire (118 epochs of the
// first 2b build leaked that way). At 50 km the bow is 50 m, under two quanta of the plane's rounding
const MAX_CHORD_M = 50000; let densifiedN = 0;
const unitsOfVec = (v) => { const lon = Math.atan2(v[1], v[0]) / D2R, lat = Math.asin(Math.max(-1, Math.min(1, v[2]))) / D2R; let x = Math.round(lon / Q); if (x >= X180) x -= 2 * X180; if (x < -X180) x += 2 * X180; return [x, Math.round(lat / Q)]; };
function densify(pts) {
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length]; out.push(a);
    const m = metresU(a[0], a[1], b[0], b[1]); if (m <= MAX_CHORD_M) continue;
    const n = Math.ceil(m / MAX_CHORD_M), va = G.vec(a[0], a[1], Q), vb = G.vec(b[0], b[1], Q);
    for (let k = 1; k < n; k++) { const t = k / n; const v = [va[0] * (1 - t) + vb[0] * t, va[1] * (1 - t) + vb[1] * t, va[2] * (1 - t) + vb[2] * t]; const l = Math.hypot(v[0], v[1], v[2]) || 1; const p = unitsOfVec([v[0] / l, v[1] / l, v[2] / l]); if (p[0] !== out[out.length - 1][0] || p[1] !== out[out.length - 1][1]) { out.push(p); densifiedN++; } }
  }
  return out;
}
const allRows = [];
/* a row's rings, box and vertex count; `r.rings` already set (the island and site-hull rows) is kept as given */
/* Cliopatria's `Wikidata` / `Wikipedia` pair is wrong on some rows (Han dynasty -> Chauhan, Numidia -> the man Jugurtha). polity-qids.json `fixes` replaces one (series, wd, wiki) pair with another HERE, where the row is read, so
   the pair the entity takes below (the rows covering the most years) and the secondary pairs are the corrected ones. A fix that matches no row stops the build: a stale fix is a silent fault. Geometry is untouched. */
const QID_FIXES = new Map();
for (const f of JSON.parse(fs.readFileSync(path.join(HERE, "polity-qids.json"), "utf8")).fixes) { const k = f.series + "|" + f.from.qid + "|" + f.from.wiki; if (QID_FIXES.has(k)) throw new Error("polity-qids.json: two fixes for " + k); QID_FIXES.set(k, { to: f.to, used: 0 }); }
/* GEOMETRY FIXES (border audit, 2026-10-18; docs/atlas-v2-border-audit.md §7): geometry-fixes.json replaces one row's polygon — every Cliopatria row of `series`
   named `name` — with `ring`, HERE, where the row is read, and only while the source's ring is still `from` (rounded to 4 decimals): a changed source makes the fix
   stale and stops the build, as a stale QID fix does. Each fix is checked before it is used (`check`: the point lies at least minInsideM inside the corrected ring,
   the area is within maxAreaChange of the source's, both on the raw ring) and the build fails otherwise. `over` names the series whose overlapping row yields to the
   fixed one in the labelling (the Roman Kingdom over the Etruscans: an overlap under SLIVER_KM2 would otherwise go to the neighbour with the longest shared edge,
   which handed Rome to the Etruscans for 750–551 BCE). A fix is Folio's adaptation of CC BY 4.0 data and the header's sources entry for Cliopatria names it
   (`adaptations`), so the credits page does. Nothing else is bent by hand: one fix, one polity, the smallest edit that meets its check. */
const GEOM_FIXES = JSON.parse(fs.readFileSync(path.join(HERE, "geometry-fixes.json"), "utf8")).fixes.map((f) => Object.assign({ used: 0 }, f));
const GEOM_FIXES_SHA = crypto.createHash("sha256").update(fs.readFileSync(path.join(HERE, "geometry-fixes.json"))).digest("hex");
const ringKm2Deg = (ring) => { let a = 0; const lat0 = ring.reduce((t, p) => t + p[1], 0) / ring.length, k = Math.cos(lat0 * D2R); for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += (ring[j][0] - ring[i][0]) * k * (ring[j][1] + ring[i][1]) / 2; return Math.abs(a) * 111195 * 111195 / 1e6; };
const ringHoldsDeg = (ring, p) => { let c = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) if ((ring[i][1] > p[1]) !== (ring[j][1] > p[1]) && p[0] < (ring[j][0] - ring[i][0]) * (p[1] - ring[i][1]) / (ring[j][1] - ring[i][1]) + ring[i][0]) c = !c; return c; };
const ringEdgeM = (ring, p) => { const k = Math.cos(p[1] * D2R); let best = Infinity; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const ax = (ring[i][0] - p[0]) * k, ay = ring[i][1] - p[1], bx = (ring[j][0] - p[0]) * k, by = ring[j][1] - p[1]; const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy; let t = L ? -(ax * dx + ay * dy) / L : 0; t = Math.max(0, Math.min(1, t)); best = Math.min(best, Math.hypot(ax + t * dx, ay + t * dy)); } return best * 111195; };
for (const fx of GEOM_FIXES) {
  if (!spec.polities[fx.series] || !(spec.polities[fx.series].cliopatria || []).includes(fx.name)) throw new Error(`geometry-fixes.json: ${fx.series} has no Cliopatria row named "${fx.name}" in polity-spec.json`);
  const c = fx.check, km2 = ringKm2Deg(fx.ring), km2From = ringKm2Deg(fx.from), inside = ringHoldsDeg(fx.ring, c.point), edge = ringEdgeM(fx.ring, c.point);
  if (!inside || edge < c.minInsideM) throw new Error(`geometry-fixes.json: ${fx.series}: ${c.name} is ${inside ? "" : "NOT "}inside the corrected ring, ${(edge / 1000).toFixed(2)} km from its edge (at least ${c.minInsideM / 1000} km asked)`);
  if (Math.abs(km2 - km2From) / km2From > c.maxAreaChange) throw new Error(`geometry-fixes.json: ${fx.series}: the corrected ring is ${km2.toFixed(1)} km² against the source's ${km2From.toFixed(1)} (over ${c.maxAreaChange * 100} %)`);
  fx.km2 = km2; fx.km2From = km2From; fx.edgeM = edge;
  say(`geometry fix ${fx.series} (${fx.name}, ${fx.date}): ${km2From.toFixed(1)} → ${km2.toFixed(1)} km² (${(100 * (km2 - km2From) / km2From).toFixed(1)} %), ${c.name} ${(edge / 1000).toFixed(2)} km inside`);
}
const r4 = (p) => [Math.round(p[0] * 1e4) / 1e4, Math.round(p[1] * 1e4) / 1e4];
const sameRing4 = (a, b) => a.length === b.length && a.every((p, i) => { const q = r4(p), w = r4(b[i]); return q[0] === w[0] && q[1] === w[1]; });
function prepareRow(s, r) {
  let rs = r.rings;
  if (!rs) {
    const g = r.f.geometry; let polys = g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : [];
    const fx = GEOM_FIXES.find((x) => x.series === s.key && x.name === r.name);
    if (fx) {
      if (polys.length !== 1 || polys[0].length !== 1) throw new Error(`geometry-fixes.json: ${fx.series}: the row ${r.from}..${r.to} is not one ring (stale fix)`);
      const src = polys[0][0].slice(); if (src.length > 1 && src[0][0] === src[src.length - 1][0] && src[0][1] === src[src.length - 1][1]) src.pop();
      if (!sameRing4(src, fx.from)) throw new Error(`geometry-fixes.json: ${fx.series}: the source's ring of ${r.from}..${r.to} is no longer \`from\` (stale fix): ${JSON.stringify(src.map(r4))}`);
      polys = [[fx.ring.concat([fx.ring[0]])]]; r.fix = fx; r.over = fx.over || []; fx.used++;
    }
    rs = [];
    for (const poly of polys) for (const ring of poly) {
      let pts = ring.map((p) => R.qpt(p));
      pts = R.dedupeRing(pts); R.cutSpikes(pts, R.eqPt);   // in place
      if (pts.length < 3) continue;
      rs.push(densify(pts));
    }
  }
  r.series = s; r.rings = rs;
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, nv = 0;
  for (const ring of rs) for (const [x, y] of ring) { nv++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  r.bbox = [x0, y0, x1, y1]; r.nv = nv;
  r.wd = (r.f && r.f.properties.Wikidata) || null; r.wiki = (r.f && r.f.properties.Wikipedia) || null;
  const qfix = QID_FIXES.get(s.key + "|" + r.wd + "|" + r.wiki); if (qfix) { r.wd = qfix.to.qid; r.wiki = qfix.to.wiki; qfix.used++; }
}
for (const s of series) for (const r of s.rows) { prepareRow(s, r); allRows.push(r); }
for (const fx of GEOM_FIXES) if (!fx.used && !BAND) throw new Error("geometry-fixes.json: the fix for " + fx.series + " (" + fx.name + ") matches no row of Cliopatria (stale, or the name is wrong)");
/* ---- the coastline series (cyclades, crete) and the site-hull series (yangshao, longshan): the presence layer's cultures (2c) ----
   COASTLINE (docs/atlas-borders-audit.md C3, C4, C25): "a multipolygon of the islands instead of a blob — no tracing". Each spec point
   (`coast.points`) names an island: the closed OSM coast ring that CONTAINS the point (land on its left, counter-clockwise), else the
   ring with a coast vertex nearest it within 0.25° — v1's rule, on the committed OSM partition instead of Natural Earth. The row is that
   ring's own vertices, so every vertex snaps to the coast at 0 m and the face is the coast arcs and nothing else. Its one step spans the
   years its linked cards are shown in (v1's rule: the cards' date lines, through card-links.js — `loadCardYears` — the same spans
   polities.js shipped), so no date is invented here.
   SITE HULLS (C17, C18): .claude/site-hulls.json, built by build-site-hulls.js from the pinned Hosner et al. (2016) file (CC BY 3.0);
   the file records the sha256 of the bytes it was built from and this build refuses it when that is not sources.json's pin. */
/* a culture's years are NOT bounded below by Cliopatria's 3400 BCE (the states' floor, YEAR_MIN): the Yangshao outlines begin in 5000 BCE and the
   rail runs to 10,000 BCE. The floor of a culture is the rail's own, or the band a --years run asks for. */
const CULT_Y0 = BAND ? BAND[0] : -10000;
{
  const cardYears = require("../card-links.js").loadCardYears(fs.readFileSync(path.join(ROOT, "app.js"), "utf8"));
  const cardsById = new Map(require("../card-io.js").loadCards().cards.map((c) => [c.id, c]));
  const spanOf = (key) => {   // v1's `need` rule: an extent's years from the cards that link it
    const spans = [];
    for (const [card, l] of Object.entries(spec.links || {})) { if (!(l.area || []).includes(key)) continue; const c = cardsById.get(card); if (!c) throw new Error(`polity-spec links ${card}, which is not a card`); const ys = cardYears(c); if (!ys || !ys.length) throw new Error(`${card} has no years`); spans.push([Math.min(...ys), ys.length < 2 ? Infinity : Math.max(...ys)]); }
    if (!spans.length) return null;
    return [Math.min(...spans.map((x) => x[0])), Math.max(...spans.map((x) => (isFinite(x[1]) ? x[1] : x[0])))];
  };
  const ringPoly = (ri) => {   // a coast ring's vertices in the land-left direction, closed ring without the repeated first point
    const out = [];
    for (const a of regionRings[ri].arcs) { const s0 = core.arcOffset[a], e0 = core.arcOffset[a + 1]; const idx = []; for (let i = s0; i < e0; i++) idx.push(i); if (coastDir[a] < 0) idx.reverse(); for (let k = out.length ? 1 : 0; k < idx.length; k++) out.push([core.lon[idx[k]], core.lat[idx[k]]]); }
    if (out.length > 1 && out[0][0] === out[out.length - 1][0] && out[0][1] === out[out.length - 1][1]) out.pop();
    return out;
  };
  const areaOf = (poly) => { let a = 0; for (let i = 0; i < poly.length; i++) { const p = poly[i], q = poly[(i + 1) % poly.length]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; };
  const pip = (poly, x, y) => { let k = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) k = !k; } return k; };
  for (const key of CULTURES) {
    const p = spec.polities[key]; if (!p) throw new Error("polity-spec.json lacks " + key);
    const cards = (cardsOf.get(key) || []).slice().sort();
    if (p.coast) {
      const span = spanOf(key);
      if (!span) { deferred.push({ key, why: "no card links it" }); continue; }
      let from = Math.max(span[0], CULT_Y0), to = Math.min(span[1], Y1); if (from > to) { if (!BAND) deferred.push({ key, why: "outside the build's years" }); continue; }
      const picked = new Map(), notes = [];
      for (const [lon, lat] of p.coast.points) {
        const x = R.U(lon), y = R.U(lat); let ri = -1, how = "";
        let best = Infinity;
        for (const r of regionRings) { const b = r.bbox; if (x < b[0] || x > b[2] || y < b[1] || y > b[3]) continue; if (r.poly === undefined) { const poly = ringPoly(r.index); r.poly = areaOf(poly) > 0 ? poly : null; } if (r.poly && pip(r.poly, x, y)) { const ar = (b[2] - b[0]) * (b[3] - b[1]); if (ar < best) { best = ar; ri = r.index; how = "contains the point"; } } }
        if (ri < 0) { const n = nearest(x, y, 28000, coastIdx, coastSeg); if (n) { ri = ringOfArc[segA[n.k]]; how = "nearest coast " + Math.round(n.metres) + " m from the point"; } }
        if (ri < 0) throw new Error(`${key}: no coast ring at or near ${lon}, ${lat}`);
        if (!picked.has(ri)) picked.set(ri, how); notes.push(`${lon},${lat} → ring ${ri} (${how})`);
      }
      const rings = [...picked.keys()].sort((a, b) => a - b).map((ri) => ringPoly(ri));
      if (rings.some((q) => areaOf(q) <= 0)) throw new Error(`${key}: a picked ring is not counter-clockwise (land on its left)`);
      const row = { f: null, from, to, name: p.label, rings };
      presenceSeries.push({ key, label: p.label, rows: [row], cards, kind: "culture", presence: true, src: SRC_IDX.coast, srcId: SRC.coast, islands: rings.length, pickNotes: notes });
      say(`culture ${key}: ${rings.length} island ring(s) of ${p.coast.points.length} point(s), ${rings.reduce((n, q) => n + q.length, 0)} vertices, ${from}..${to}`);
    } else if (p.sites) {
      const SH = JSON.parse(fs.readFileSync(path.join(ROOT, ".claude", "site-hulls.json"), "utf8"));
      const pin = headerSources([SRC.hosner])[0];
      if (!SH.source || SH.source.id !== SRC.hosner || SH.source.sha256 !== pin.sha256) throw new Error(`site-hulls.json was not built from the pinned ${SRC.hosner} file (${SH.source ? SH.source.sha256 : "no source recorded"} against ${pin.sha256}): run build-site-hulls.js --hosner=<src/${SRC.hosner}/PANGAEA.860072>`);
      const H = SH.hulls[p.sites]; if (!H || !H.s.length) throw new Error(`site-hulls.json has no outline "${p.sites}"`);
      const rows = [];
      for (const st of H.s) {
        const from = Math.max(st[0], CULT_Y0), to = Math.min(st[1], Y1); if (from > to) continue;
        const rings = st[2].map((ring) => { let pts = ring.map((q) => R.qpt(q)); pts = R.dedupeRing(pts); R.cutSpikes(pts, R.eqPt); return pts.length >= 3 ? densify(pts) : null; }).filter(Boolean);
        if (rings.length) rows.push({ f: null, from, to, name: p.label, rings });
      }
      if (!rows.length) { if (!BAND) deferred.push({ key, why: "no outline in the build's years" }); continue; }
      presenceSeries.push({ key, label: p.label, rows, cards, kind: "culture", presence: true, src: SRC_IDX.hosner, srcId: SRC.hosner });
      say(`culture ${key}: ${rows.length} phase outline(s) from ${pin.id} ${pin.sha256.slice(0, 12)}…, ${rows.reduce((n, r) => n + r.rings.length, 0)} ring(s)`);
    }
  }
}
/* ---- the war extents (2d): a war side no entity answers keeps the card's own authored area ----
   WHY. The war cards carry hand-drawn extents (docs/war-cards.md) for sides no open dataset draws: the Samnites, the Gallic tribes, Messenia ...
   v1 shows them dashed. Phase 2d keeps them, as what they are: ENTITIES OF KIND `extent`, one per (name, shape), each a soft face conflated alone onto
   the coast like a people (an approximation has no border line), with Folio's own authoring as its "source" (header source `folio-authored-extents`,
   flagged `authored`, not a third-party dataset) and a note saying so. Their years are the years the cards that use them are at war (lib/war-resolve.js);
   a side that a series answers (the card's link, its name, its keys) is NOT an extent. Nothing is invented here: the rings are the cards' own. */
{
  const WR = require("./lib/war-resolve.js").resolveWars({ cards: require("../card-io.js").loadCards().cards, cardYears: require("../card-links.js").loadCardYears(fs.readFileSync(path.join(ROOT, "app.js"), "utf8")) });
  /* the extents DERIVED from an open source (build-war-extents.js → war-extents.json, built from pins this build re-checks): the Western Confederacy from the USFS
     Royce cessions and Sparta and Messenia from OpenHistoricalMap's Lacedaemon. They replace the card's authored ring for their key; the entity says what it is made of */
  const WE = JSON.parse(fs.readFileSync(path.join(HERE, "war-extents.json"), "utf8"));
  for (const [id, sha] of Object.entries(WE.sources)) { const pin = headerSources([id])[0]; if (pin.sha256 !== sha) throw new Error(`war-extents.json was built from ${id} ${sha}, not the pinned ${pin.sha256}: run build-war-extents.js`); }
  const SRC_OF = { [SRC.ohm]: SRC_IDX.ohm, [SRC.usfs]: SRC_IDX.usfs };
  for (const x of WR.extents) {
    const rows = [];
    const D = WE.extents[x.key];
    const prep = (ringsIn) => ringsIn.map((ring) => { let pts = ring.map((q) => R.qpt(q)); pts = R.dedupeRing(pts); R.cutSpikes(pts, R.eqPt); return pts.length >= 3 ? densify(pts) : null; }).filter(Boolean);
    if (D) {
      for (const [a, b] of x.rows) for (const dr of D.rows) {
        const from = Math.max(a, dr.from, BAND ? BAND[0] : -10000), to = Math.min(b, dr.to, Y1); if (from > to) continue;
        const rings = prep(dr.rings); if (rings.length) rows.push({ f: null, from, to, name: x.name, rings });
      }
      if (rows.length) presenceSeries.push({ key: x.key, label: x.name, rows, cards: [...new Set(x.cards.map((c) => c.id))].sort(), kind: "extent", presence: true, src: SRC_OF[D.src[0]], srcId: D.src[0], derived: D });
      continue;
    }
    for (const [a, b] of x.rows) {
      const from = Math.max(a, BAND ? BAND[0] : -10000), to = Math.min(b, Y1); if (from > to) continue;
      const rings = x.rings.map((ring) => { let pts = ring.map((q) => R.qpt(q)); pts = R.dedupeRing(pts); R.cutSpikes(pts, R.eqPt); return pts.length >= 3 ? densify(pts) : null; }).filter(Boolean);
      if (rings.length) rows.push({ f: null, from, to, name: x.name, rings });
    }
    if (!rows.length) continue;
    presenceSeries.push({ key: x.key, label: x.name, rows, cards: [...new Set(x.cards.map((c) => c.id))].sort(), kind: "extent", presence: true, src: SRC_IDX.authored, srcId: SRC.authored, authored: true });
  }
  say(`war extents: ${WR.extents.length} authored extent(s) for the sides no series answers`);
}
/* ---- the Second World War's fronts (2d, task 3): dated EVENT FACES ----
   Four entities of kind `front` — Axis-held, Axis-occupied, Allied-held and Allied-occupied ground — each a series of steps, one per plate-standing interval of
   the front line. The time unit of a front's steps is the DATE (an integer YYYYMMDD, `unit: "date"` on the entity and in `H.fronts`): the monthly maps of 1939–42 and
   the fortnightly plates of 1943–45 are dated, and a step is never interpolated — a plate stands from its date until the next plate of its theatre replaces it, for
   at most `stand` days (monthly 31, fortnightly 16), and what no plate stands for is a GAP that draws nothing (January–June 1943 has no plate in either source).
   Each plate's sets come from .claude/atlas-build/fronts-plates.json (build-fronts-plates.js and ww2-plates/fortnight.py, each plate with the uncertainty it
   carries); a Europe plate and a Pacific plate standing at once are UNIONED per set (polygon-clipping: even-odd rings first, then the union), so a face is one
   planar region; every face is conflated alone onto the coast like a people (the plate's frame, and the coast, are its only edges; its own edge is a soft arc
   whose face class is APPROXIMATE, never FIRM — a front is a redrawn map, not a surveyed line). */
const FRONTS = { sets: [], plates: [], skipped: [], steps: 0 };
{
  const FP = JSON.parse(fs.readFileSync(path.join(HERE, "fronts-plates.json"), "utf8"));
  for (const [id, sha] of Object.entries(FP.sources)) { const pin = headerSources([id])[0]; if (pin.sha256 !== sha) throw new Error(`fronts-plates.json was built from ${id} ${sha}, not the pinned ${pin.sha256}: run build-fronts-plates.js`); }
  const PC = require("polygon-clipping");
  const addDays = (d, n) => { const t = new Date(d + "T00:00:00Z"); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };
  const di = (d) => Number(d.replace(/-/g, ""));
  const plates = FP.plates.slice().sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.theatre < b.theatre ? -1 : 1));
  for (const th of ["eur", "pac"]) {
    const l = plates.filter((p) => p.theatre === th);
    l.forEach((p, i) => { let end = addDays(p.date, FP.stand[p.kind] - 1); const nx = l[i + 1]; if (nx && nx.date <= end) end = addDays(nx.date, -1); p.end = end; });
  }
  const bps = [...new Set(plates.flatMap((p) => [p.date, addDays(p.end, 1)]))].sort();
  const ivs = [];
  for (let i = 0; i + 1 < bps.length; i++) {
    const a = bps[i], b = addDays(bps[i + 1], -1);
    const act = plates.filter((p) => p.date <= a && a <= p.end); if (!act.length) continue;
    const sig = act.map((p) => p.theatre + p.date).join(",");
    const prev = ivs[ivs.length - 1];
    if (prev && prev.sig === sig && addDays(prev.b, 1) === a) prev.b = b; else ivs.push({ a, b, sig, act });
  }
  const NAMES = ["Axis-held ground", "Axis-occupied ground", "Allied-held ground", "Allied-occupied ground"];
  const closeR = (r) => { const f = r[0], l = r[r.length - 1]; return f[0] === l[0] && f[1] === l[1] ? r : r.concat([f]); };
  const regionOf = (rings) => { let acc = null; for (const r of rings) { const poly = [[closeR(r)]]; acc = acc ? PC.xor(acc, poly) : poly; } return acc || []; };   // even-odd: a ring inside a ring is a hole
  const flatPC = (mp) => mp.flatMap((poly) => poly.map((ring) => ring.slice(0, -1)));
  const regionCache = new Map();
  const plateRegion = (p, k) => { const key = p.theatre + p.date + ":" + k; let r = regionCache.get(key); if (!r) regionCache.set(key, r = regionOf(p.sets[k])); return r; };
  const t0f = Date.now();
  for (let k = 0; k < 4; k++) {
    const rows = [];
    for (const iv of ivs) {
      let reg = null; for (const p of iv.act) { const r = plateRegion(p, k); if (!r.length) continue; reg = reg ? PC.union(reg, r) : r; }
      if (!reg || !reg.length) continue;
      const rings = flatPC(reg).map((ring) => { let pts = ring.map((q) => R.qpt(q)); pts = R.dedupeRing(pts); R.cutSpikes(pts, R.eqPt); return pts.length >= 3 ? densify(pts) : null; }).filter(Boolean);
      if (!rings.length) continue;
      const src = iv.act.every((p) => p.src === SRC.atlas) ? SRC_IDX.atlas : SRC_IDX.control;
      rows.push({ f: null, from: di(iv.a), to: di(iv.b), name: NAMES[k], rings, src, plates: iv.act.map((p) => p.theatre + ":" + p.date) });
    }
    if (!rows.length) continue;
    FRONTS.steps += rows.length;
    presenceSeries.push({ key: "front_" + FP.order[k], label: NAMES[k], rows, cards: ["ww2-001"], kind: "front", presence: true, src: SRC_IDX.control, srcId: SRC.control, fronts: { set: FP.order[k] } });
  }
  FRONTS.plates = plates.map((p) => ({ date: p.date, theatre: p.theatre, end: p.end, src: p.src, rms_km: p.unc.rms_km, cities: p.unc.cities || null, note: p.unc.note, page: p.page || null }));
  FRONTS.skipped = FP.skipped || []; FRONTS.stand = FP.stand; FRONTS.intervals = ivs.length;
  say(`fronts: ${plates.length} plates (${plates.filter((p) => p.kind === "monthly").length} monthly, ${plates.filter((p) => p.kind === "fortnight").length} fortnightly) → ${ivs.length} standing intervals, ${FRONTS.steps} steps over 4 sets (${((Date.now() - t0f) / 1000).toFixed(1)} s)`);
}
for (const s of presenceSeries) s.rows.sort((a, b) => a.from - b.from);
presenceSeries.sort((a, b) => a.key.localeCompare(b.key));
const presenceRows = [];
for (const s of presenceSeries) for (const r of s.rows) { prepareRow(s, r); presenceRows.push(r); }
for (const [k, v] of QID_FIXES) if (!v.used && !BAND) throw new Error("polity-qids.json: the fix for " + k + " matches no row of Cliopatria (stale, or the key is wrong)");
allRows.sort((a, b) => a.series.key.localeCompare(b.series.key) || a.from - b.from);
allRows.forEach((r, i) => { r.id = i; });
presenceRows.forEach((r, i) => { r.id = allRows.length + i; });
say(`rows: ${allRows.length}, vertices ${allRows.reduce((s, r) => s + r.nv, 0)} (${densifiedN} added along great circles on edges over ${MAX_CHORD_M / 1000} km)`);

/* ================= 2. --measure: the distributions behind D1, D2, D3 ================= */
const hist = (vals, bins) => { const out = {}; let lo = 0; const sorted = vals.slice().sort((a, b) => a - b); for (const b of bins) { out[(b === Infinity ? "beyond" : lo + "–" + b) + " m"] = sorted.filter((v) => v >= lo && v < b).length; lo = b; } const p = (q) => sorted.length ? Math.round(sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))]) : null; return { n: sorted.length, p50: p(0.5), p75: p(0.75), p90: p(0.9), p95: p(0.95), p99: p(0.99), bins: out }; };
const BINS = [250, 500, 1000, 2000, 3000, 4000, 6000, 8000, 10000, 15000, 20000, 30000, 50000, Infinity];
const report = { scope: { years: [Y0, Y1], band: BAND, peoples: PEOPLES, nest: { share: NEST_SHARE, ratio: NEST_RATIO } }, slice: SLICE, tolerances_m: TOLERANCE_M, d1_m: D1_M, ring_snap_frac: RING_SNAP_FRAC, small_ring_m: SMALL_RING_M, d2_m: D2_M, d3_m: D3_M, run_factor: RUN_FACTOR, sliver_km2: SLIVER_KM2, sliver_width_m: SLIVER_WIDTH_M, lod_m: LOD_M };
/* epochs: the change years of every row; alive sets keyed so identical sets are conflated once */
const years = new Set();
for (const r of allRows) { years.add(r.from); years.add(r.to + 1); }
const yearList = [...years].sort((a, b) => a - b);
const epochs = [];
for (let i = 0; i + 1 < yearList.length; i++) {
  const from = yearList[i], to = yearList[i + 1] - 1;
  const alive = allRows.filter((r) => r.from <= from && r.to >= to);
  if (!alive.length) continue;
  const key = alive.map((r) => r.id).join(",");
  const last = epochs[epochs.length - 1];
  if (last && last.key === key && last.to + 1 === from) { last.to = to; continue; }
  epochs.push({ from, to, alive, key });
}
say(`epochs: ${epochs.length} over ${yearList[0]}–${yearList[yearList.length - 1] - 1}; distinct alive sets ${new Set(epochs.map((e) => e.key)).size}`);
report.epochs = epochs.length; report.densified = densifiedN;
if (MEASURE) {
  const d1 = [], d3 = [], d2 = [], pairs = {};
  for (const r of allRows) for (const ring of r.rings) for (const [x, y] of ring) { const n = nearest(x, y, 60000, coastIdx, coastSeg); d1.push(n ? n.metres : 60000); const b = nearest(x, y, 60000, bordIdx, bordSeg); d3.push(b ? b.metres : 60000); }
  // d2: within each distinct alive set, every vertex of a row to the nearest segment of another row
  const seen = new Set();
  for (const e of epochs) {
    if (seen.has(e.key)) continue; seen.add(e.key);
    const segs = []; for (const r of e.alive) for (const ring of r.rings) for (let i = 0; i < ring.length; i++) { const j = (i + 1) % ring.length; segs.push([r.id, ring[i][0], ring[i][1], ring[j][0], ring[j][1]]); }
    const idx = SegIndex.build(segs.length, CELL, (k) => segs[k].slice(1));
    for (const r of e.alive) for (const ring of r.rings) for (const [x, y] of ring) { const n = nearest(x, y, 60000, idx, (k) => segs[k].slice(1), (k) => segs[k][0] === r.id); d2.push(n ? n.metres : 60000); if (n && n.metres < 10000) { const other = allRows[segs[n.k][0]].series.key; const pk = [r.series.key, other].sort().join("+"); const band = n.metres < 250 ? "<250" : n.metres < 2000 ? "<2k" : n.metres < 6000 ? "<6k" : "<10k"; pairs[pk] = pairs[pk] || {}; pairs[pk][band] = (pairs[pk][band] || 0) + 1; } }
  }
  report.d2pairs = Object.fromEntries(Object.entries(pairs).sort((a, b) => Object.values(b[1]).reduce((x, y) => x + y, 0) - Object.values(a[1]).reduce((x, y) => x + y, 0)).slice(0, 40));
  console.log("d2 by pair (vertices within 10 km of the other's line, by band): " + Object.entries(report.d2pairs).map(([k, v]) => k + " " + JSON.stringify(v)).join("; "));
  report.measure = { d1_vertex_to_coast: hist(d1, BINS), d3_vertex_to_present_border: hist(d3, BINS), d2_vertex_to_neighbour_line: hist(d2, BINS) };
  console.log(JSON.stringify(report.measure, null, 1));
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, "history-measure.json"), JSON.stringify(report, null, 1));
  say("--measure: written out/history-measure.json; nothing else written");
  process.exit(0);
}

/* ================= 3. the global registries: arcs, vertices, faces across epochs ================= */
const log = new SnapLog("build-history", TOLERANCE_SNAP);
const ARCS = [];               // { key, kind, source, flags, own: [[x,y]…] | null, core: { arc, from, to }, va: [x,y], vb: [x,y] }
const arcByKey = new Map();
const FACES = [];              // { key, entity, cls, rings: [[signed global ref]…] }
const faceByKey = new Map();
const ENT = [];                // entity table rows
const entIndex = new Map();
const STEPS = [];              // [entityIndex, from, to, faceIndex]
const entityOf = (s) => { let i = entIndex.get(s.key); if (i == null) { i = ENT.length; entIndex.set(s.key, i); ENT.push({ id: "pol:" + s.key, name: s.label, kind: s.kind || "polity", key: s.key }); } return i; };
const contestedOf = (keys) => { const id = "contested:" + keys.join("+"); let i = entIndex.get(id); if (i == null) { i = ENT.length; entIndex.set(id, i); ENT.push({ id, name: keys.map((k) => spec.polities[k].label).join(" and "), kind: "contested", partners: keys.map((k) => "pol:" + k) }); } return i; };
// a member inside its overlord (2b, the owner's default to confirm): partners [member, overlord]; drawn as the member's face, the overlord named
const nestedOf = (member, overlord) => { const id = "nested:" + member + "+" + overlord; let i = entIndex.get(id); if (i == null) { i = ENT.length; entIndex.set(id, i); ENT.push({ id, name: spec.polities[member].label, kind: "nested", partners: ["pol:" + member, "pol:" + overlord] }); } return i; };   // named as the member: the label is the member's, the card says "within"
const CLS = { FIRM: 0, APPROX: 1, SOFT: 2, DISPUTED: 3, CONTESTED: 4, NESTED: 5 };
const stat = { near: new Set(), arcsOwn: 0, arcsCoast: 0, arcsBorderRef: 0, contestedFaces: 0, unmappedKm2: 0, unmappedPieces: 0, slivers: 0, sliverKm2: 0, runsDropped: 0, runsBorder: 0, crossings: 0, d1: 0, d1Capped: 0, d2: 0, d2Capped: 0, d3: 0, d3Capped: 0, open: 0, touches: new Map() };

const followsRingPos = (pa, pb) => { const L = pa.ring.lenM; const dF = ((pb.pos - pa.pos) % L + L) % L, dB = L - dF; return Math.min(dF, dB); };
/* The scale of each of a row's rings, in metres: the square root of its area (a planar sum on the quantised plane, longitudes unwrapped and scaled by cos φ);
   a HOLE (a ring inside an odd number of the row's other rings) takes its parent's scale. Cached on the row: a row's rings are the same in every epoch it lives. */
function ringScalesOf(r) {
  if (r.ringScaleM) return r.ringScaleM;
  const info = r.rings.map((ring) => {
    const n = ring.length, xs = new Array(n), ys = new Array(n); let cx = ring[0][0], ym = 0, area = 0, x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (let i = 0; i < n; i++) { if (i) { let dx = ring[i][0] - ring[i - 1][0]; if (dx > X180) dx -= 2 * X180; else if (dx < -X180) dx += 2 * X180; cx += dx; } xs[i] = cx; ys[i] = ring[i][1]; ym += ys[i]; if (cx < x0) x0 = cx; if (cx > x1) x1 = cx; if (ys[i] < y0) y0 = ys[i]; if (ys[i] > y1) y1 = ys[i]; }
    for (let i = 0, j = n - 1; i < n; j = i++) area += (xs[j] - xs[i]) * (ys[j] + ys[i]) / 2;
    const k = Math.cos((ym / n) * Q * D2R) * Q * Q * 111195 * 111195;
    return { xs, ys, n, x0, x1, y0, y1, area: Math.abs(area), own: n < 3 ? 0 : Math.sqrt(Math.abs(area) * k) };
  });
  const inside = (P, px, py) => { for (const off of [0, 2 * X180, -2 * X180]) { const qx = px + off; if (qx < P.x0 || qx > P.x1 || py < P.y0 || py > P.y1) continue; let c = false; for (let i = 0, j = P.n - 1; i < P.n; j = i++) if ((P.ys[i] > py) !== (P.ys[j] > py) && qx < (P.xs[j] - P.xs[i]) * (py - P.ys[i]) / (P.ys[j] - P.ys[i]) + P.xs[i]) c = !c; if (c) return true; } return false; };
  r.ringScaleM = info.map((a, i) => {
    if (info.length < 2) return a.own;
    let depth = 0, parent = -1, pa = Infinity;
    // five sample vertices, a majority: a hole may share a vertex with its parent's line
    const pick = [0, 1, 2, 3, 4].map((t) => Math.min(a.n - 1, Math.floor(t * a.n / 5)));
    for (let j = 0; j < info.length; j++) { if (j === i || info[j].area <= a.area) continue; let votes = 0; for (const t of pick) if (inside(info[j], a.xs[t], a.ys[t])) votes++; if (votes * 2 > pick.length) { depth++; if (info[j].area < pa) { pa = info[j].area; parent = j; } } }
    return depth % 2 && parent >= 0 ? info[parent].own : a.own;
  });
  return r.ringScaleM;
}
/* ================= 4. one epoch ================= */
function conflate(alive, label) {
  /* ---- the rings this epoch can touch: a ring whose box meets an alive row's box grown by D1 (an island inside a polity, a coast a
     border reaches); every other ring is land no alive polity reaches and draws plain — it costs the epoch nothing (2b) ---- */
  const PRES = alive.length > 0 && alive.every((r) => r.series.presence);   // 2c: a presence is conflated alone, onto the coast only
  const GROW = Math.round(D1_M / 111000 / Q) + 2 * CELL;
  const boxes = alive.map((r) => [r.bbox[0] - GROW, r.bbox[1] - GROW, r.bbox[2] + GROW, r.bbox[3] + GROW]);
  const epochRings = regionRings.filter((r) => { const b = r.bbox; for (const q of boxes) if (b[2] >= q[0] && b[0] <= q[2] && b[3] >= q[1] && b[1] <= q[3]) return true; return false; });
  const ringOn = new Uint8Array(regionRings.length); for (const r of epochRings) ringOn[r.index] = 1;
  /* ---- vertices of the epoch: own points, deduped by position ---- */
  const VX = [], VY = [], vkey = new Map(), VON = [];   // VON[v]: null | { coast: { k, t } } | { bord: { k, t } } (a junction on a core line)
  const vertAt = (x, y) => { const k = pkey(x, y); let v = vkey.get(k); if (v == null) { v = VX.length; vkey.set(k, v); VX.push(x); VY.push(y); VON.push(null); } return v; };
  const lines = [];   // { row, ring, v: [vertex…] (closed: last === first is NOT repeated), ownerRow }
  for (const r of alive) r.rings.forEach((ring, idx) => lines.push({ row: r, idx, v: ring.map(([x, y]) => vertAt(x, y)) }));
  for (const L of lines) { const out = []; for (const v of L.v) if (!out.length || out[out.length - 1] !== v) out.push(v); if (out.length > 1 && out[0] === out[out.length - 1]) out.pop(); L.v = out; }
  const rowOfLine = new Map(); lines.forEach((L, i) => rowOfLine.set(i, L.row));
  /* ---- the scale cap of D1, D2 and D3: RING_SNAP_FRAC × the scale (√area, metres) of the ring a vertex belongs to — a hole's scale is its parent's:
     a lake hole in a polygon 2,000 km across is not a polygon 5 km across ---- */
  const capM = new Map();   // vertex → metres; empty for a presence (peoples, cultures: a soft cover that has no seat and is conflated alone) and for a front
  const capped = !PRES && !(alive.length && alive.every((r) => r.series.kind === "front"));
  if (capped) for (const L of lines) { const sc = ringScalesOf(L.row)[L.idx]; if (sc >= SMALL_RING_M) continue; const c = RING_SNAP_FRAC * sc; for (const v of L.v) { const o = capM.get(v); if (o == null || c < o) capM.set(v, c); } }
  // a CORRECTED ring (geometry-fixes.json) is not drawn onto a neighbour's line: D2 carried the Roman Kingdom's notch corner 4 km west onto the Etruscan line, tilting the
  // notch that exists to hold Rome and leaving a spike of the wedge below it. Its vertices keep D1 and D3 (the coast and the present-day borders are not what the fix disputes); the overlap with the neighbour is the fix's `over` to decide
  const noD2 = new Set(); for (const L of lines) if (L.row.fix) for (const v of L.v) noD2.add(v);
  /* ---- d1: coast junctions ---- */
  const snapTo = (v, px, py, kind, src0) => {
    const src = alive.length && alive.every((r) => r.series.kind === "front") ? FRONT_SNAP : src0;
    const from = deg(VX[v], VY[v]), to = deg(px, py);
    log.snap({ source: src, kind, from, to, metres: metresU(VX[v], VY[v], px, py) });
    const k2 = pkey(px, py); const w = vkey.get(k2);
    if (w != null && w !== v) return w;   // another vertex already sits there: the two become one
    vkey.delete(pkey(VX[v], VY[v])); VX[v] = px; VY[v] = py; vkey.set(k2, v); return v;
  };
  const moved = new Map();   // v → the vertex it became (after merges)
  // the run rule (measured, above): a vertex within D1_SURE snaps; one within D1 only beside a neighbour of its own line whose
  // projection it reaches along the coast as a run
  const near1 = new Map();
  const offRing = (k) => !ringOn[ringOfArc[segA[k]]];
  for (const L of lines) for (const v of L.v) if (!near1.has(v) && !VON[v]) { const n = nearest(VX[v], VY[v], D1_M, coastIdx, coastSeg, offRing); if (n) near1.set(v, n); }
  const runOK = (va, nb, pa, pb) => { if (pa.ring !== pb.ring) return false; const d = followsRingPos(pa, pb), c = metresU(VX[va[0]], VY[va[0]], VX[va[1]], VY[va[1]]); void nb; return d <= Math.max(RUN_FACTOR * c, RUN_MIN_M); };
  const snap1 = new Set();
  for (const L of lines) for (let i = 0; i < L.v.length; i++) {
    const v = L.v[i], n = near1.get(v); if (!n) continue;
    if (n.metres > (capM.get(v) ?? Infinity)) { stat.d1Capped++; continue; }
    if (n.metres <= D1_SURE_M) { snap1.add(v); continue; }
    const pv = ringPos(n.k, n.t);
    for (const j of [i - 1, i + 1]) { const u = L.v[(j + L.v.length) % L.v.length], m = near1.get(u); if (!m) continue; if (runOK([v, u], null, pv, ringPos(m.k, m.t))) { snap1.add(v); break; } }
  }
  const seen1 = new Set();
  for (const L of lines) for (let i = 0; i < L.v.length; i++) {
    const v = L.v[i]; if (seen1.has(v) || VON[v] || !snap1.has(v)) continue; seen1.add(v);
    const n = near1.get(v);
    if (!n) continue;
    // a junction on a core vertex itself when the projection falls within a quantum of one
    let px = n.px, py = n.py, t = n.t;
    const i1 = segV[n.k], i0 = i1 - 1;
    if (Math.abs(px - core.lon[i0]) <= DUP_U && Math.abs(py - core.lat[i0]) <= DUP_U) { px = core.lon[i0]; py = core.lat[i0]; t = 0; }
    else if (Math.abs(px - core.lon[i1]) <= DUP_U && Math.abs(py - core.lat[i1]) <= DUP_U) { px = core.lon[i1]; py = core.lat[i1]; t = 1; }
    const w = snapTo(v, px, py, "d1-vertex-to-coast", SRC.clio);
    if (w !== v) moved.set(v, w);
    VON[w] = { coast: { k: n.k, t } }; stat.d1++;
  }
  for (const L of lines) L.v = L.v.map((v) => moved.get(v) ?? v);
  /* ---- d3: present-day border junctions (a vertex not on the coast) ---- */
  const near3 = new Map();
  for (const L of lines) for (const v of L.v) if (!PRES && !near3.has(v) && !VON[v]) { const n = nearest(VX[v], VY[v], D3_M, bordIdx, bordSeg); if (n) near3.set(v, n); }
  const bordPos = (n) => { const arc = bordA[n.k], c = cumOf(arc), s = core.arcOffset[arc], i = bordV[n.k]; return c[i - 1 - s] + (c[i - s] - c[i - 1 - s]) * n.t; };
  const snap3 = new Set();
  for (const L of lines) for (let i = 0; i < L.v.length; i++) {
    const v = L.v[i], n = near3.get(v); if (!n) continue;
    if (n.metres > (capM.get(v) ?? Infinity)) { stat.d3Capped++; continue; }
    for (const j of [i - 1, i + 1]) { const u = L.v[(j + L.v.length) % L.v.length], m = near3.get(u); if (!m || bordA[m.k] !== bordA[n.k]) continue; const d = Math.abs(bordPos(n) - bordPos(m)), c = metresU(VX[v], VY[v], VX[u], VY[u]); if (d <= Math.max(RUN_FACTOR * c, RUN_MIN_M)) { snap3.add(v); break; } }
  }
  const seen3 = new Set();
  for (const L of lines) for (let i = 0; i < L.v.length; i++) {
    const v = L.v[i]; if (seen3.has(v) || VON[v] || !snap3.has(v)) continue; seen3.add(v);
    const n = near3.get(v);
    if (!n) continue;
    let px = n.px, py = n.py, t = n.t;
    const i1 = bordV[n.k], i0 = i1 - 1;
    if (Math.abs(px - core.lon[i0]) <= DUP_U && Math.abs(py - core.lat[i0]) <= DUP_U) { px = core.lon[i0]; py = core.lat[i0]; t = 0; }
    else if (Math.abs(px - core.lon[i1]) <= DUP_U && Math.abs(py - core.lat[i1]) <= DUP_U) { px = core.lon[i1]; py = core.lat[i1]; t = 1; }
    const w = snapTo(v, px, py, "d3-vertex-to-present-border", SRC.clio);
    if (w !== v) moved.set(v, w);
    VON[w] = { bord: { k: n.k, t } }; stat.d3++;
  }
  for (const L of lines) L.v = L.v.map((v) => moved.get(v) ?? v);
  /* ---- d2: a vertex of one row onto a neighbour's segment, which gains the point ---- */
  {
    // segments of every line, with the line and the position, for the index; rebuilt after each row's insertions
    for (let pass = 0; pass < 2; pass++) {
      const segs = []; lines.forEach((L, li) => { for (let i = 0; i < L.v.length; i++) segs.push([li, i]); });
      const segOf = (k) => { const [li, i] = segs[k]; const L = lines[li], a = L.v[i], b = L.v[(i + 1) % L.v.length]; return [VX[a], VY[a], VX[b], VY[b]]; };
      const idx = SegIndex.build(segs.length, CELL, segOf);
      const inserts = new Map();   // "li:i" → [{ t, v }]
      const near2 = new Map();
      for (const L of lines) for (const v of L.v) if (!near2.has(v) && !VON[v]) { const n = nearest(VX[v], VY[v], D2_M, idx, segOf, (k) => lines[segs[k][0]].row === L.row); if (n) near2.set(v, n); }   // 0 m included: Cliopatria neighbours share edges, and a vertex ON the other's chord is a T-junction the noding cannot see (measured: the Ptolemaic western border started on Carthage's at the Gulf of Sidra, 200 BCE, and the two faces walked as one)
      const snap2 = new Set();
      for (const L of lines) for (let i = 0; i < L.v.length; i++) {
        const v = L.v[i], n = near2.get(v); if (!n) continue;
        if (n.metres > (capM.get(v) ?? Infinity)) { stat.d2Capped++; continue; }
        if (noD2.has(v)) { stat.d2Fixed = (stat.d2Fixed || 0) + 1; continue; }   // a corrected ring's own vertex stays where the fix put it
        if (n.metres <= D2_SURE_M) { snap2.add(v); continue; }
        for (const j of [i - 1, i + 1]) { const u = L.v[(j + L.v.length) % L.v.length], m = near2.get(u); if (!m || lines[segs[m.k][0]] !== lines[segs[n.k][0]]) continue; const T = lines[segs[n.k][0]]; const pos = (q) => q.k === m.k && false ? 0 : (() => { const si = segs[q.k][1], a = T.v[si], b = T.v[(si + 1) % T.v.length]; return si * 1e9 + metresU(VX[a], VY[a], VX[b], VY[b]) * q.t; })(); void pos; const c = metresU(VX[v], VY[v], VX[u], VY[u]); const d = Math.abs(segs[n.k][1] - segs[m.k][1]) <= 1 ? c : c * 1.0001; if (d <= Math.max(RUN_FACTOR * c, RUN_MIN_M)) { snap2.add(v); break; } }
      }
      const seen2 = new Set();
      for (const L of lines) for (let i = 0; i < L.v.length; i++) {
        const v = L.v[i]; if (seen2.has(v) || VON[v] || !snap2.has(v)) continue; seen2.add(v);
        const n = near2.get(v);
        if (!n) continue;
        const [li, si] = segs[n.k]; const T = lines[li]; const a = T.v[si], b = T.v[(si + 1) % T.v.length];
        let px = n.px, py = n.py, t = n.t;
        if (Math.abs(px - VX[a]) <= DUP_U && Math.abs(py - VY[a]) <= DUP_U) { px = VX[a]; py = VY[a]; t = 0; } else if (Math.abs(px - VX[b]) <= DUP_U && Math.abs(py - VY[b]) <= DUP_U) { px = VX[b]; py = VY[b]; t = 1; }
        const w = n.metres < 1 && px === VX[v] && py === VY[v] ? v : snapTo(v, px, py, "d2-vertex-to-neighbour-line", SRC.clio);
        if (w !== v) moved.set(v, w);
        VON[w] = { shared: true }; stat.d2++;
        if (t > 0 && t < 1) { const key = li + ":" + si; let l = inserts.get(key); if (!l) inserts.set(key, l = []); l.push({ t, v: w }); }
      }
      for (const L of lines) L.v = L.v.map((v) => moved.get(v) ?? v);
      lines.forEach((L, li) => { if (![...inserts.keys()].some((k) => k.startsWith(li + ":"))) return; const out = []; for (let i = 0; i < L.v.length; i++) { out.push(L.v[i]); const l = inserts.get(li + ":" + i); if (l) { l.sort((p, q) => p.t - q.t); for (const ins of l) if (out[out.length - 1] !== ins.v) out.push(ins.v); } } L.v = out; });
      for (const L of lines) { const out = []; for (const v of L.v) if (!out.length || out[out.length - 1] !== v) out.push(v); if (out.length > 1 && out[0] === out[out.length - 1]) out.pop(); L.v = out; }
      if (!inserts.size) break;
    }
  }
  /* ---- runs along the coast and along a present-day border: a chord between two junctions on one line ---- */
  // every chord of every line is an EDGE: { a, b, drop, ref: null | { arc, from, to } (a core border reference) }
  const edges = []; const edgeOfLine = [];
  for (const L of lines) { const el = []; for (let i = 0; i < L.v.length; i++) { const a = L.v[i], b = L.v[(i + 1) % L.v.length]; if (a === b) continue; el.push(edges.length); edges.push({ a, b, L, drop: false, ref: null }); } edgeOfLine.push(el); }
  const chordM = (a, b) => metresU(VX[a], VY[a], VX[b], VY[b]);
  // a run's chord stays within the source's tolerance of the coast: its middle has a coast within D1_M (a chord under RUN_MIN_M
  // trivially does). Without this, Carthage's border across western Sicily at 300 BCE — shore to shore, with a coast path under
  // three times its length round the island's west — was dropped as a run and western Sicily merged with the rest of the island
  const hugsCoast = (a, b, c) => { if (c <= RUN_MIN_M) return true; let x2 = VX[b]; if (x2 - VX[a] > X180) x2 -= 2 * X180; else if (VX[a] - x2 > X180) x2 += 2 * X180; let mx = Math.round((VX[a] + x2) / 2); if (mx >= X180) mx -= 2 * X180; if (mx < -X180) mx += 2 * X180; return !!nearest(mx, Math.round((VY[a] + VY[b]) / 2), D1_M, coastIdx, coastSeg, offRing); };
  const followsRing = followsRingPos;
  for (const e of edges) {
    const A = VON[e.a], B = VON[e.b];
    if (A && B && A.coast && B.coast) {
      const pa = ringPos(A.coast.k, A.coast.t), pb = ringPos(B.coast.k, B.coast.t);
      if (pa.ring === pb.ring) { const d = followsRing(pa, pb), c = chordM(e.a, e.b); if (d <= Math.max(RUN_FACTOR * c, RUN_MIN_M) && hugsCoast(e.a, e.b, c)) { e.drop = true; stat.runsDropped++; continue; } }
    }
    if (A && B && A.bord && B.bord && bordA[A.bord.k] === bordA[B.bord.k]) {
      const arc = bordA[A.bord.k], c = cumOf(arc), s = core.arcOffset[arc];
      const pos = (j) => c[bordV[j.k] - 1 - s] + (c[bordV[j.k] - s] - c[bordV[j.k] - 1 - s]) * j.t;
      const d = Math.abs(pos(A.bord) - pos(B.bord)), ch = chordM(e.a, e.b);
      if (d <= Math.max(RUN_FACTOR * ch, RUN_MIN_M)) { e.ref = { arc, ia: bordV[A.bord.k], ta: A.bord.t, ib: bordV[B.bord.k], tb: B.bord.t }; stat.runsBorder++; }
    }
  }
  /* ---- crossings: every live chord against the coast, the referenced borders and every other chord ---- */
  // a chord's geometry: own [a→b], or the core border's vertices between its two junctions (a reference)
  const refPath = (e) => { const r = e.ref, s = core.arcOffset[r.arc]; const fa = r.ta >= 1 ? r.ia : r.ia - 1, fb = r.tb >= 1 ? r.ib : r.ib - 1; const pts = [[VX[e.a], VY[e.a]]]; if (fa <= fb) { for (let i = (r.ta > 0 ? r.ia : r.ia - 1); i <= (r.tb > 0 ? r.ib - 1 : r.ib - 1); i++) { if (i < s + 1) continue; pts.push([core.lon[i], core.lat[i]]); } } else { for (let i = (r.ta < 1 ? r.ia - 1 : r.ia); i >= (r.tb < 1 ? r.ib : r.ib); i--) pts.push([core.lon[i], core.lat[i]]); } pts.push([VX[e.b], VY[e.b]]); return pts.filter((p, i) => i === 0 || p[0] !== pts[i - 1][0] || p[1] !== pts[i - 1][1]); };
  const coastJunctions = [];   // { k, t, v } every junction on the coast (projected vertices and crossings)
  for (let v = 0; v < VX.length; v++) if (VON[v] && VON[v].coast) coastJunctions.push({ k: VON[v].coast.k, t: VON[v].coast.t, v });
  const vecU = (x, y) => G.vec(x, y, Q);
  const crossPoint = (x1, y1, x2, y2, x3, y3, x4, y4) => {
    // planar intersection in the unwrapped frame about x1 (the segments are a few km at most)
    const ux = (x) => { if (x - x1 > X180) return x - 2 * X180; if (x1 - x > X180) return x + 2 * X180; return x; };
    const ax = x1, ay = y1, bx = ux(x2), by = y2, cx = ux(x3), cy = y3, dx = ux(x4), dy = y4;
    const den = (bx - ax) * (dy - cy) - (by - ay) * (dx - cx); if (Math.abs(den) < 1e-9) return null;
    const t = ((cx - ax) * (dy - cy) - (cy - ay) * (dx - cx)) / den, u = ((cx - ax) * (by - ay) - (cy - ay) * (bx - ax)) / den;
    if (t <= 0 || t >= 1 || u <= 0 || u >= 1) return null;
    let x = Math.round(ax + (bx - ax) * t); if (x >= X180) x -= 2 * X180; if (x < -X180) x += 2 * X180;
    return { x, y: Math.round(ay + (by - ay) * t), t, u };
  };
  // the parameter of (x, y) along chord h when it lies strictly inside h within DUP_U quanta, else null
  const onChord = (x, y, h) => {
    const ax = VX[h.a], ay = VY[h.a]; const ux = (q) => { if (q - ax > X180) return q - 2 * X180; if (ax - q > X180) return q + 2 * X180; return q; };
    const bx = ux(VX[h.b]), by = VY[h.b], qx = ux(x); const dx = bx - ax, dy = by - ay; const L2 = dx * dx + dy * dy; if (!L2) return null;
    const t = ((qx - ax) * dx + (y - ay) * dy) / L2; if (t <= 0 || t >= 1) return null;
    if (Math.abs(ax + dx * t - qx) > DUP_U || Math.abs(ay + dy * t - y) > DUP_U) return null; return t;
  };
  for (let round = 0; round < 6; round++) {
    let found = 0;
    const live = edges.filter((e) => !e.drop && !e.ref);
    // chord × coast
    const splitsEdge = new Map();   // edge → [{ t, v }]
    for (const e of live) {
      const x1 = VX[e.a], y1 = VY[e.a], x2 = VX[e.b], y2 = VY[e.b];
      const cx = Math.round((x1 + x2) / 2), cy = Math.round((y1 + y2) / 2), rU = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) / 2 + 2;
      const pa = vecU(x1, y1), pb = vecU(x2, y2);
      coastIdx.near(cx, cy, Math.min(rU, 400 * CELL), (k) => {
        if (offRing(k)) return;
        const i1 = segV[k], i0 = i1 - 1;
        // the chord starts or ends on this segment: its own junction is no crossing, but a chord that leaves a junction on the sea side
        // of a long, nearly straight shore and cuts back over THE SAME segment a few kilometres on is one — skipping the segment
        // altogether let such a chord (the Tang border leaving Laizhou Bay at 623, 281 km inland) walk the face into the sea and
        // merge land and ocean into one cycle (118 epochs of the first 2b build). The crossing counts when it lies more than
        // SAME_SEG_U from the chord's junction on that segment
        const SAME_SEG_U = 8 * DUP_U;
        const ownA = VON[e.a] && VON[e.a].coast && VON[e.a].coast.k === k, ownB = VON[e.b] && VON[e.b].coast && VON[e.b].coast.k === k;
        // through a coast vertex: a crossing AT the vertex is outside crossPoint's open interval and the walk then sees a chord on the
        // sea side of the coast's tangent (measured: the Argolid at 100 CE, a chord ending 50 m past a coast vertex); split there
        for (const [i, t] of [[i1, 1]]) { const tc = onChord(core.lon[i], core.lat[i], e); if (tc == null) continue; const v = vertAt(core.lon[i], core.lat[i]); if (v === e.a || v === e.b) continue; if (!VON[v]) { VON[v] = { coast: { k, t } }; coastJunctions.push({ k, t, v }); } let l = splitsEdge.get(e); if (!l) splitsEdge.set(e, l = []); if (!l.some((o) => o.v === v)) { l.push({ t: tc, v }); found++; stat.throughVertex = (stat.throughVertex || 0) + 1; } return; }
        if (!G.segmentsCross(pa, pb, coreVec(i0), coreVec(i1))) return;
        const X = crossPoint(x1, y1, x2, y2, core.lon[i0], core.lat[i0], core.lon[i1], core.lat[i1]); if (!X) return;
        if ((ownA && Math.abs(X.x - x1) <= SAME_SEG_U && Math.abs(X.y - y1) <= SAME_SEG_U) || (ownB && Math.abs(X.x - x2) <= SAME_SEG_U && Math.abs(X.y - y2) <= SAME_SEG_U)) return;   // the junction itself
        if (ownA || ownB) stat.sameSegCross = (stat.sameSegCross || 0) + 1;
        const twin = coastJunctions.find((j) => j.k === k && Math.abs(VX[j.v] - X.x) <= DUP_U && Math.abs(VY[j.v] - X.y) <= DUP_U);
        const v = twin ? twin.v : vertAt(X.x, X.y); if (!twin && VON[v]) return; if (twin && (twin.v === e.a || twin.v === e.b)) return;
        if (!twin) { VON[v] = { coast: { k, t: X.u } }; coastJunctions.push({ k, t: X.u, v }); }
        let l = splitsEdge.get(e); if (!l) splitsEdge.set(e, l = []); l.push({ t: X.t, v }); found++;
      });
    }
    // chord × chord (other lines and the same line's non-adjacent chords)
    {
      const segOf = (k) => { const e = live[k]; return [VX[e.a], VY[e.a], VX[e.b], VY[e.b]]; };
      const idx = SegIndex.build(live.length, CELL, segOf);
      idx.pairs((p, q) => {
        const e = live[p], f = live[q];
        // a T-junction: an endpoint of one chord within DUP_U of the other's interior splits the other there (no new vertex) —
        // checked before the shared-endpoint rule, because a line folding back along its own chord (a collinear spike in a
        // Cliopatria polygon: the Seleucid border at 31.3°E 39.97°N, 197 BCE) has the spike's chords sharing an end with the chord they lie on
        let tee = false;
        for (const [g, h] of [[e, f], [f, e]]) for (const v of [g.a, g.b]) { if (v === h.a || v === h.b) continue; const t = onChord(VX[v], VY[v], h); if (t == null) continue; let l = splitsEdge.get(h); if (!l) splitsEdge.set(h, l = []); if (!l.some((o) => o.v === v)) { l.push({ t, v }); found++; stat.tees = (stat.tees || 0) + 1; } tee = true; }
        if (tee) return;
        if (e.a === f.a || e.a === f.b || e.b === f.a || e.b === f.b) return;
        if (!G.segmentsCross(vecU(VX[e.a], VY[e.a]), vecU(VX[e.b], VY[e.b]), vecU(VX[f.a], VY[f.a]), vecU(VX[f.b], VY[f.b]))) return;
        const X = crossPoint(VX[e.a], VY[e.a], VX[e.b], VY[e.b], VX[f.a], VY[f.a], VX[f.b], VY[f.b]); if (!X) return;
        const v = vertAt(X.x, X.y);
        let l = splitsEdge.get(e); if (!l) splitsEdge.set(e, l = []); l.push({ t: X.t, v });
        l = splitsEdge.get(f); if (!l) splitsEdge.set(f, l = []); l.push({ t: X.u, v }); found++;
      });
    }
    // chord × a referenced border piece: the chord gets a junction and the reference is cut there (the piece loses its reference on that side: kept simple — it is split into two references)
    const refs = edges.filter((e) => e.ref);
    if (refs.length) {
      const refSegs = []; refs.forEach((e, ri) => { const p = refPath(e); for (let i = 0; i + 1 < p.length; i++) refSegs.push([ri, i, p]); });
      const idx = SegIndex.build(refSegs.length, CELL, (k) => { const [, i, p] = refSegs[k]; return [p[i][0], p[i][1], p[i + 1][0], p[i + 1][1]]; });
      for (const e of live) {
        const x1 = VX[e.a], y1 = VY[e.a], x2 = VX[e.b], y2 = VY[e.b];
        const cx = Math.round((x1 + x2) / 2), cy = Math.round((y1 + y2) / 2), rU = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) / 2 + 2;
        idx.near(cx, cy, Math.min(rU, 400 * CELL), (k) => {
          const [ri, i, p] = refSegs[k]; const f = refs[ri];
          // only the reference's segments touching the chord's own endpoint are exempt: a border leaving a present-day border's
          // junction can cut back across that border's bends (measured: the Rhine at Eglisau, 14 BCE–68 CE, Rome's Raetia line)
          const touches = (v) => (VX[v] === p[i][0] && VY[v] === p[i][1]) || (VX[v] === p[i + 1][0] && VY[v] === p[i + 1][1]);
          if (touches(e.a) || touches(e.b)) return;
          if (!G.segmentsCross(vecU(x1, y1), vecU(x2, y2), vecU(p[i][0], p[i][1]), vecU(p[i + 1][0], p[i + 1][1]))) return;
          const X = crossPoint(x1, y1, x2, y2, p[i][0], p[i][1], p[i + 1][0], p[i + 1][1]); if (!X) return;
          const v = vertAt(X.x, X.y);
          let l = splitsEdge.get(e); if (!l) splitsEdge.set(e, l = []); l.push({ t: X.t, v });
          // the reference loses its claim: it becomes an own-vertex path through the crossing (rare; counted)
          f.ref = null; f.ownPath = p; (f.pathSplits = f.pathSplits || []).push({ i, t: X.u, v }); found++; stat.refCut = (stat.refCut || 0) + 1;
        });
      }
    }
    if (!found) break;
    stat.crossings += found;
    // apply the splits: an edge with junctions becomes several edges
    const next = [];
    for (const e of edges) {
      const l = splitsEdge.get(e);
      if (e.ownPath) {   // a cut reference expanded to its core vertices (with the crossing points inserted)
        const p = e.ownPath, splits = e.pathSplits || []; const vs = [e.a]; for (let i = 0; i + 1 < p.length; i++) { for (const s of splits.filter((s) => s.i === i).sort((p, q) => p.t - q.t)) vs.push(s.v); if (i + 1 < p.length - 1) vs.push(vertAt(p[i + 1][0], p[i + 1][1])); } vs.push(e.b);
        for (let i = 0; i + 1 < vs.length; i++) if (vs[i] !== vs[i + 1]) next.push({ a: vs[i], b: vs[i + 1], L: e.L, drop: false, ref: null });
        continue;
      }
      if (!l) { next.push(e); continue; }
      l.sort((p, q) => p.t - q.t);
      const vs = [e.a]; for (const s of l) if (vs[vs.length - 1] !== s.v) vs.push(s.v); if (vs[vs.length - 1] !== e.b) vs.push(e.b);
      for (let i = 0; i + 1 < vs.length; i++) next.push({ a: vs[i], b: vs[i + 1], L: e.L, drop: false, ref: null });
    }
    edges.length = 0; edges.push(...next);
  }
  // sea chords: a polygon that spans a strait or a gulf (Pontus across the Sea of Marmara at 87 BCE, Rome across the Adriatic
  // at 215 BCE) keeps chords whose both ends are shore junctions and whose middle is at sea; such a chord would close a face
  // round the WATER, walking the far shore's coast with the sea on its left (the checker's coast invariant). After the noding
  // every chord lies wholly on land or wholly at sea, so the midpoint decides: at sea, the chord is dropped and each shore's
  // land closes along its own coast. "At sea" = outside every coast ring (landAt).
  const seaCache = new Map();
  const seaAt = (x, y) => { const key = x + "," + y; let v = seaCache.get(key); if (v === undefined) { v = !landAt(x, y); seaCache.set(key, v); } return v; };
  for (const e of edges) {
    if (e.drop || e.ref) continue; const A = VON[e.a], B = VON[e.b];
    const shoreA = (A && A.coast) || seaAt(VX[e.a], VY[e.a]), shoreB = (B && B.coast) || seaAt(VX[e.b], VY[e.b]); if (!shoreA || !shoreB) continue;
    let x2 = VX[e.b]; if (x2 - VX[e.a] > X180) x2 -= 2 * X180; else if (VX[e.a] - x2 > X180) x2 += 2 * X180;
    let mx = Math.round((VX[e.a] + x2) / 2); if (mx >= X180) mx -= 2 * X180; if (mx < -X180) mx += 2 * X180;
    if (seaAt(mx, Math.round((VY[e.a] + VY[e.b]) / 2))) { e.drop = true; stat.seaChords = (stat.seaChords || 0) + 1; }
  }
  // the run rule again, for the chords the noding made: a crossing junction a few metres from a snapped vertex left a chord
  // between two coast junctions that duplicated the coast piece between them — collinear twins the face walk cannot order
  // (measured: a 22 m chord at the Corfu strait at 100 BCE put both sides of Italy's coast into one face and left Rome owned
  // by nobody); such a chord is dropped and the coast piece carries the boundary
  for (const e of edges) {
    if (e.drop || e.ref) continue; const A = VON[e.a], B = VON[e.b]; if (!A || !B || !A.coast || !B.coast) continue;
    const pa = ringPos(A.coast.k, A.coast.t), pb = ringPos(B.coast.k, B.coast.t); if (pa.ring !== pb.ring) continue;
    const d = followsRing(pa, pb), c = chordM(e.a, e.b); if (d <= Math.max(RUN_FACTOR * c, RUN_MIN_M) && hugsCoast(e.a, e.b, c)) { e.drop = true; stat.runsDropped++; stat.runsDroppedLate = (stat.runsDroppedLate || 0) + 1; }
  }
  /* ---- the graph: coast pieces (core references), own chords, border references ---- */
  // every coast junction splits its ring; the pieces between consecutive junctions, per core arc
  const jByRing = new Map();
  for (const j of coastJunctions) { const p = ringPos(j.k, j.t); let l = jByRing.get(p.ring.index); if (!l) jByRing.set(p.ring.index, l = []); l.push({ pos: p.pos, arc: p.arc, i: p.i, t: p.t, v: j.v }); }
  const arcs = [];   // epoch arcs: { global: index into ARCS, va, vb (epoch vertices), kind, geom(level) }
  const arcLocal = new Map();   // global index → local index
  const addArc = (rec, va, vb) => {
    let gi = arcByKey.get(rec.key);
    if (gi == null) { gi = ARCS.length; arcByKey.set(rec.key, gi); ARCS.push(rec); if (rec.core) { if (rec.kind === KIND.COAST) stat.arcsCoast++; else stat.arcsBorderRef++; } else stat.arcsOwn++; }
    let li = arcLocal.get(gi); if (li != null) return li;
    li = arcs.length; arcLocal.set(gi, li); arcs.push({ global: gi, va, vb, kind: ARCS[gi].kind }); return li;
  };
  // the epoch's own vertex for a core vertex position (so coast pieces meet the lines at shared nodes)
  const coreVert = (i) => vertAt(core.lon[i], core.lat[i]);
  // a coast piece of core arc `a` from position (ia, ta) to (ib, tb) in the land-left direction: junction vertices va, vb;
  // `from`/`to` are vertex offsets within the arc (file order) of the core vertices strictly inside the piece
  const coastPiece = (a, ia, ta, va, ib, tb, vb) => {
    const s = core.arcOffset[a], e = core.arcOffset[a + 1];
    // core vertices strictly between the two junctions along the file order
    let lo, hi;   // file-order inclusive range of inner core vertices
    const posA = ta <= 0 ? ia - 1 : ta >= 1 ? ia : ia - 0.5, posB = tb <= 0 ? ib - 1 : tb >= 1 ? ib : ib - 0.5;
    if (coastDir[a] > 0) { lo = Math.floor(posA) + 1; hi = Math.ceil(posB) - 1; } else { lo = Math.floor(posB) + 1; hi = Math.ceil(posA) - 1; }
    lo = Math.max(lo, s); hi = Math.min(hi, e - 1);
    let from = coastDir[a] > 0 ? lo - s : hi - s, to = coastDir[a] > 0 ? hi - s : lo - s;   // walked in the land-left direction; from > to when backwards
    const step = coastDir[a] > 0 ? 1 : -1;
    let empty = lo > hi;
    // a junction that IS a core vertex (a piece from an arc's head, a junction at t = 1 on the segment before the next arc's first vertex)
    // must not list that vertex among the inner ones too: the piece's first segment was then zero-length and its outgoing angle
    // atan2(0, 0) = 0, which put the piece out of order at the junction and let the face walk cross from land into the sea (2b,
    // measured: the Seljuk border at Kuwait's coast in 1056–1071, a two-arc islet off Venezuela in 1516–1804)
    while (!empty && core.lon[s + from] === VX[va] && core.lat[s + from] === VY[va]) { from += step; empty = step > 0 ? from > to : from < to; }
    while (!empty && core.lon[s + to] === VX[vb] && core.lat[s + to] === VY[vb]) { to -= step; empty = step > 0 ? from > to : from < to; }
    const key = `c:${a}:${empty ? "-" : from + ":" + to}:${VX[va]},${VY[va]}:${VX[vb]},${VY[vb]}`;
    // the junctions' segments (the END vertex's offset within the arc; 0 at the arc's own endpoint)
    const segOf = (i, t) => (t <= 0 && i - 1 === s) || (t >= 1 && i === e - 1) ? 0 : (t >= 1 ? Math.min(e - 1, i + 1) - s : i - s);
    if (va === vb && empty) { stat.emptyLoops = (stat.emptyLoops || 0) + 1; return -1; }   // two junctions at one vertex: a zero-length self-loop (measured: it put both sides of the Albanian coast in one face at 218 BCE)
    return addArc({ key, kind: KIND.COAST, source: 1, flags: 0, core: { arc: a, from: empty ? -1 : from, to: empty ? -1 : to, segA: segOf(ia, ta), segB: segOf(ib, tb) }, va: [VX[va], VY[va]], vb: [VX[vb], VY[vb]], cls: CLS.FIRM }, va, vb);
  };
  // a whole coast arc in the land-left direction
  const wholeArc = (a) => { const h = arcHead(a), t = arcTail(a); const s = core.arcOffset[a], e = core.arcOffset[a + 1]; const from = coastDir[a] > 0 ? 1 : e - s - 2, to = coastDir[a] > 0 ? e - s - 2 : 1; const empty = e - s < 3; return coastPiece(a, h, coastDir[a] > 0 ? 0 : 1, coreVert(h), t, coastDir[a] > 0 ? 1 : 0, coreVert(t)); void from; void to; void empty; };
  for (const r of epochRings) {
    const js = (jByRing.get(r.index) || []).slice().sort((p, q) => p.pos - q.pos);
    // merge junctions at one position (two vertices snapped to one point are one vertex already)
    const uniq = []; for (const j of js) if (!uniq.length || uniq[uniq.length - 1].v !== j.v) uniq.push(j);
    if (!uniq.length) { for (const a of r.arcs) wholeArc(a); continue; }
    // walk the ring from junction to junction: within one arc a piece; across arcs, a piece to the arc's tail, whole arcs, a piece from the head
    const n = uniq.length;
    for (let k = 0; k < n; k++) {
      const A = uniq[k], B = uniq[(k + 1) % n];
      const ai = arcAtRing[A.arc], bi = arcAtRing[B.arc];
      if (A.arc === B.arc && (n === 1 || (bi === ai && (B.pos >= A.pos)))) { coastPiece(A.arc, A.i, A.t, A.v, B.i, B.t, B.v); continue; }
      // A to the tail of its arc
      const ta = arcTail(A.arc); coastPiece(A.arc, A.i, A.t, A.v, ta, coastDir[A.arc] > 0 ? 1 : 0, coreVert(ta));
      // whole arcs between
      let i = (ai + 1) % r.arcs.length; let guard = 0;
      while (i !== bi && guard++ < r.arcs.length + 1) { wholeArc(r.arcs[i]); i = (i + 1) % r.arcs.length; }
      // the head of B's arc to B
      const hb = arcHead(B.arc); coastPiece(B.arc, hb, coastDir[B.arc] > 0 ? 0 : 1, coreVert(hb), B.i, B.t, B.v);
    }
  }
  // own chords and border references: chained into arcs between nodes
  const vertDeg = new Map(); for (const e of edges) { if (e.drop) continue; vertDeg.set(e.a, (vertDeg.get(e.a) || 0) + 1); vertDeg.set(e.b, (vertDeg.get(e.b) || 0) + 1); }
  const isNode = (v) => (vertDeg.get(v) || 0) !== 2 || !!(VON[v] && VON[v].coast);
  // every live edge keyed by its start; walk chains from nodes
  const liveEdges = edges.filter((e) => !e.drop);
  const outOf = new Map(); for (const e of liveEdges) { for (const [p, q, dir] of [[e.a, e.b, 1], [e.b, e.a, -1]]) { let l = outOf.get(p); if (!l) outOf.set(p, l = []); l.push({ e, to: q, dir }); } }
  const edgeUsed = new Set();
  const chainFrom = (start, first) => {
    const seq = [start]; let cur = first, v = first.to; const refs = [];
    for (;;) {
      edgeUsed.add(cur.e); seq.push(v); refs.push(cur);
      if (isNode(v) || v === start) break;
      const l = (outOf.get(v) || []).filter((o) => !edgeUsed.has(o.e)); if (!l.length) break;
      cur = l[0]; v = cur.to;
    }
    return { seq, refs };
  };
  const registerChain = (seq, refs) => {
    // a chain is one arc when it is all own chords; a reference chord is an arc of its own
    const pieces = []; let cur = [];
    for (let i = 0; i < refs.length; i++) { const o = refs[i]; if (o.e.ref) { if (cur.length > 1) pieces.push({ own: cur }); cur = []; pieces.push({ ref: o }); cur = [seq[i + 1]]; } else { if (!cur.length) cur.push(seq[i]); cur.push(seq[i + 1]); } }
    if (cur.length > 1) pieces.push({ own: cur });
    for (const p of pieces) {
      if (p.own) {
        const vs = p.own; const pts = vs.map((v) => [VX[v], VY[v]]);
        const pre = PRES ? "s:" : "", fk = pre + pts.map((q) => q.join(",")).join(";"), bk = pre + pts.slice().reverse().map((q) => q.join(",")).join(";");
        if (arcByKey.has(bk) && !arcByKey.has(fk)) { addArc(ARCS[arcByKey.get(bk)], vs[vs.length - 1], vs[0]); continue; }
        // a presence's own arc is its SOFT edge (KIND.SOFT, class SOFT, the series' source): the renderer strokes none
        addArc({ key: fk, kind: PRES ? KIND.SOFT : KIND.BORDER, source: PRES ? (alive[0].src != null ? alive[0].src : alive[0].series.src) : 0, flags: 0, own: pts, core: null, cls: PRES ? CLS.SOFT : CLS.APPROX }, vs[0], vs[vs.length - 1]);
      } else {
        const o = p.ref, e = o.e, r = e.ref; const forward = o.dir > 0;
        const va = forward ? e.a : e.b, vb = forward ? e.b : e.a;
        const s = core.arcOffset[r.arc];
        // inner core vertices between the two junctions, in walk order
        const ja = forward ? r : { ia: r.ib, ta: r.tb }, jb = forward ? { ib: r.ib, tb: r.tb } : { ib: r.ia, tb: r.ta };
        const posA = ja.ta <= 0 ? ja.ia - 1 : ja.ta >= 1 ? ja.ia : ja.ia - 0.5, posB = jb.tb <= 0 ? jb.ib - 1 : jb.tb >= 1 ? jb.ib : jb.ib - 0.5;
        let lo = Math.floor(Math.min(posA, posB)) + 1, hi = Math.ceil(Math.max(posA, posB)) - 1; lo = Math.max(lo, s); hi = Math.min(hi, core.arcOffset[r.arc + 1] - 1);
        const empty = lo > hi; const from = posA <= posB ? lo - s : hi - s, to = posA <= posB ? hi - s : lo - s;
        const key = `b:${r.arc}:${empty ? "-" : from + ":" + to}:${VX[va]},${VY[va]}:${VX[vb]},${VY[vb]}`;
        const bkey = `b:${r.arc}:${empty ? "-" : to + ":" + from}:${VX[vb]},${VY[vb]}:${VX[va]},${VY[va]}`;
        if (arcByKey.has(bkey) && !arcByKey.has(key)) { addArc(ARCS[arcByKey.get(bkey)], vb, va); continue; }
        const eArc = core.arcOffset[r.arc + 1];
        const segOfB = (i, t) => (t <= 0 && i - 1 === s) || (t >= 1 && i === eArc - 1) ? 0 : (t >= 1 ? Math.min(eArc - 1, i + 1) - s : i - s);
        addArc({ key, kind: KIND.BORDER, source: 2, flags: 0, core: { arc: r.arc, from: empty ? -1 : from, to: empty ? -1 : to, segA: segOfB(ja.ia, ja.ta), segB: segOfB(jb.ib, jb.tb) }, va: [VX[va], VY[va]], vb: [VX[vb], VY[vb]], cls: CLS.FIRM }, va, vb);
      }
    }
  };
  for (const [v, l] of outOf) { if (!isNode(v)) continue; for (const o of l) { if (edgeUsed.has(o.e)) continue; const { seq, refs } = chainFrom(v, o); registerChain(seq, refs); } }
  for (const e of liveEdges) { if (edgeUsed.has(e)) continue; const { seq, refs } = chainFrom(e.a, { e, to: e.b, dir: 1 }); registerChain(seq, refs); }   // a closed loop with no node
  /* ---- geometry of an epoch arc at LOD 2, for angles and areas ---- */
  const geomOf = (li) => { const A = ARCS[arcs[li].global]; if (A.own) return A.own; const c = A.core, pts = [A.va]; if (c.from >= 0) { const s = core.arcOffset[c.arc]; if (c.from <= c.to) for (let i = c.from; i <= c.to; i++) pts.push([core.lon[s + i], core.lat[s + i]]); else for (let i = c.from; i >= c.to; i--) pts.push([core.lon[s + i], core.lat[s + i]]); } pts.push(A.vb); return pts; };
  /* ---- the face walk ---- */
  const nA = arcs.length;
  const incident = new Map();
  const addInc = (v, arc, dir) => { let l = incident.get(v); if (!l) incident.set(v, l = []); l.push({ arc, dir }); };
  arcs.forEach((a, i) => { addInc(a.va, i, 1); addInc(a.vb, i, -1); });
  const angleOut = (li, dir) => { const g = geomOf(li); const p0 = dir > 0 ? g[0] : g[g.length - 1], p1 = dir > 0 ? g[1] : g[g.length - 2]; let dx = p1[0] - p0[0]; if (dx > X180) dx -= 2 * X180; else if (dx < -X180) dx += 2 * X180; return Math.atan2(p1[1] - p0[1], dx * Math.cos(p0[1] * Q * D2R)); };
  for (const [, l] of incident) { for (const h of l) h.ang = angleOut(h.arc, h.dir); l.sort((p, q) => p.ang - q.ang || p.arc - q.arc); }
  // the sea wedge at a coast junction: walking out along the land-left half the land lies on the left, so the land spans the angles
  // from the land-left half counter-clockwise to the sea-left half; an own chord between two coast junctions that leaves either
  // junction outside that span runs over water (a strait, a gulf, an inlet 300 m wide the midpoint test could not see) and would
  // close a face round the water — it is dropped and each shore's land closes along its own coast
  const deadArc = new Uint8Array(nA); { const TAU = 2 * Math.PI;
    for (const [v, l] of incident) {
      const coastH = l.filter((h) => arcs[h.arc].kind === KIND.COAST); if (coastH.length !== 2) continue;
      const plus = coastH.find((h) => h.dir > 0), minus = coastH.find((h) => h.dir < 0); if (!plus || !minus) continue;
      const span = ((minus.ang - plus.ang) % TAU + TAU) % TAU;
      for (const h of l) { if (arcs[h.arc].kind === KIND.COAST || deadArc[h.arc]) continue; const A = ARCS[arcs[h.arc].global]; if (A.core) continue; const other = h.dir > 0 ? arcs[h.arc].vb : arcs[h.arc].va; if (!(VON[other] && VON[other].coast)) continue; const off = ((h.ang - plus.ang) % TAU + TAU) % TAU; if (off >= span) { deadArc[h.arc] = 1; stat.seaChords = (stat.seaChords || 0) + 1; const g = geomOf(h.arc); let lm = 0; for (let k = 1; k < g.length; k++) lm += G.chordMetres(vecU(g[k - 1][0], g[k - 1][1]), vecU(g[k][0], g[k][1])); log.event("sea-chord", { epoch: label, at: deg(VX[v], VY[v]).join(","), km: +(lm / 1000).toFixed(1), to: deg(VX[other], VY[other]).join(","), pts: g.length }); } }
    }
    if (stat.seaChords) for (const [v, l] of incident) { const k = l.filter((h) => !deadArc[h.arc]); if (k.length !== l.length) incident.set(v, k); }
  }
  const nextHalf = (arc, dir) => { const end = dir > 0 ? arcs[arc].vb : arcs[arc].va; const l = incident.get(end); const rev = l.findIndex((h) => h.arc === arc && h.dir === -dir); return l[(rev - 1 + l.length) % l.length]; };
  const halfKey = (arc, dir) => arc * 2 + (dir > 0 ? 0 : 1);
  const cycleOf = new Int32Array(nA * 2).fill(-1); const cycles = [];
  for (let a = 0; a < nA; a++) for (const dir of [1, -1]) {
    if (deadArc[a] || cycleOf[halfKey(a, dir)] >= 0) continue;
    const halves = []; let cur = { arc: a, dir }, guard = 0;
    while (cycleOf[halfKey(cur.arc, cur.dir)] < 0 && guard++ < 1e7) { cycleOf[halfKey(cur.arc, cur.dir)] = cycles.length; halves.push([cur.arc, cur.dir]); cur = nextHalf(cur.arc, cur.dir); }
    cycles.push({ halves });
  }
  const P = [0, 0, 1];
  const tri = (a, b) => { const num = G.dot(P, G.cross(a, b)); const den = 1 + G.dot(P, a) + G.dot(a, b) + G.dot(b, P); return 2 * Math.atan2(num, den); };
  const arcArea = new Float64Array(nA), arcLen = new Float64Array(nA);
  for (let i = 0; i < nA; i++) { const g = geomOf(i); let s = 0, m = 0; for (let k = 1; k < g.length; k++) { const p = vecU(g[k - 1][0], g[k - 1][1]), q = vecU(g[k][0], g[k][1]); s += tri(p, q); m += G.chordMetres(p, q); } arcArea[i] = s; arcLen[i] = m; }
  const R2 = G.R_EARTH_M * G.R_EARTH_M / 1e6;
  let mixed = 0;
  for (const c of cycles) {
    let land = 0, sea = 0, area = 0;
    for (const [a, d] of c.halves) { if (arcs[a].kind === KIND.COAST) { if (d > 0) land++; else sea++; } area += d > 0 ? arcArea[a] : -arcArea[a]; }
    c.land = sea === 0; if (land && sea) { mixed++; c.mixed = true; c.land = land >= sea; }
    let A = area % (4 * Math.PI); if (A < 0) A += 4 * Math.PI; c.km2 = A * R2; c.outer = A < 2 * Math.PI;
    if (A * R2 < 1e-6 || (4 * Math.PI - A) * R2 < 1e-6) { c.land = false; c.degenerate = true; }   // a zero-area walk (a dangling arc both ways)
  }
  for (const c of cycles) { if (!c.mixed) continue; const H = c.halves; let lastDir = 0, lastI = -1; for (let i = 0; i < H.length * 2; i++) { const [a, d] = H[i % H.length]; if (arcs[a].kind !== KIND.COAST) continue; if (lastDir && d !== lastDir && i >= H.length) { const own = []; for (let j = lastI + 1; j < i; j++) { const b = H[j % H.length][0]; if (!ARCS[arcs[b].global].core) { const g = geomOf(b); own.push(deg(...g[0]).join(",") + "→" + deg(...g[g.length - 1]).join(",") + " " + Math.round(arcLen[b] / 1000) + "km"); } } const [la, ld] = H[lastI % H.length], [na, nd] = H[i % H.length]; const vJ = ld > 0 ? arcs[la].vb : arcs[la].va; const inc = (incident.get(vJ) || []).map((h) => { const A = ARCS[arcs[h.arc].global]; return `${h.arc}${A.core ? (arcs[h.arc].kind === KIND.COAST ? "c" : "b") : "o"}d${h.dir > 0 ? "+" : "-"}@${h.ang.toFixed(3)}${A.core ? "[" + A.core.arc + ":" + A.core.from + ".." + A.core.to + "]" : "(" + A.own.length + "pts)"}`; }).join(" ");
          log.event("leak", { epoch: label, via: own.join(" | ") || "(coast to coast)", at: deg(VX[vJ], VY[vJ]).join(","), von: JSON.stringify(VON[vJ]), incident: inc, last: `${la}${ld > 0 ? "+" : "-"}`, next: `${na}${nd > 0 ? "+" : "-"}` }); } lastDir = d; lastI = i; } }
  if (mixed) { const at = []; for (const c of cycles) if (c.mixed && at.length < 3) { const g = geomOf(c.halves[0][0]); at.push({ at: deg(g[0][0], g[0][1]), halves: c.halves.length, coastHalves: c.halves.filter(([a]) => arcs[a].kind === KIND.COAST).length }); } log.event("mixed-cycle", { epoch: label, count: mixed, at }); }
  const landCycles = cycles.filter((c) => c.land), outers = landCycles.filter((c) => c.outer), holes = landCycles.filter((c) => !c.outer);
  const cycleVerts = (c) => { const out = []; for (const [a, d] of c.halves) { const g = geomOf(a); if (d > 0) for (let i = 0; i < g.length - 1; i++) out.push(g[i]); else for (let i = g.length - 1; i > 0; i--) out.push(g[i]); } return out; };
  const unwrapRing = (pts) => { const n = pts.length, X = new Float64Array(n), Y = new Float64Array(n); let cum = pts[0][0]; X[0] = cum; Y[0] = pts[0][1]; for (let i = 1; i < n; i++) { let dx = pts[i][0] - pts[i - 1][0]; if (dx > X180) dx -= 2 * X180; else if (dx < -X180) dx += 2 * X180; cum += dx; X[i] = cum; Y[i] = pts[i][1]; } return { X, Y, n }; };
  const pointIn = (ring, px, py) => { const { X, Y, n } = ring; for (const qx of [px, px + 2 * X180, px - 2 * X180]) { let c = false; for (let i = 0, j = n - 1; i < n; j = i++) if ((Y[i] > py) !== (Y[j] > py) && qx < (X[j] - X[i]) * (py - Y[i]) / (Y[j] - Y[i]) + X[i]) c = !c; if (c) return true; } return false; };
  for (const c of landCycles) { c.pts = cycleVerts(c); c.ring = unwrapRing(c.pts); }
  // sample points of a cycle: left of the middle segment of up to eight of its half-arcs, spread round the cycle, each at the
  // largest offset (3.4 km down to 28 m) that is still inside — one sample 28 m inland of the coast fell outside the polygon's
  // chord across a bay and left Rome's main piece unowned (measured: Rome at 300 BCE was one small ring); a MAJORITY of samples
  // decides the owners
  const sampleOf = (c, n) => {
    const picks = []; const H = c.halves; const step = Math.max(1, Math.floor(H.length / (n || 1)));
    for (let k = 0; k < H.length && picks.length < (n || 1); k += step) {
      const [a, d] = H[k]; const g = geomOf(a); if (g.length < 2) continue;
      const m = Math.floor((g.length - 1) / 2); const p0 = d > 0 ? g[m] : g[m + 1], p1 = d > 0 ? g[m + 1] : g[m];
      let dx = p1[0] - p0[0]; if (dx > X180) dx -= 2 * X180; else if (dx < -X180) dx += 2 * X180; const dy = p1[1] - p0[1]; const L = Math.hypot(dx, dy) || 1;
      for (const off of [120, 40, 12, 4]) { const px = Math.round((p0[0] + p1[0]) / 2 - dy / L * off), py = Math.round((p0[1] + p1[1]) / 2 + dx / L * off); if (pointIn(c.ring, px, py) && !(c.holes || []).some((h) => pointIn(h.ring, px, py))) { picks.push([px, py]); break; } }
    }
    return n ? picks : picks[0] || null;
  };
  for (const h of holes) {
    const s = sampleOf(h, 1)[0] || [h.pts[0][0], h.pts[0][1]];
    let best = null;
    for (const o of outers) { if (best && o.km2 >= best.km2) continue; if (o.halves.some((x) => h.halves.some((y) => y[0] === x[0]))) continue; if (pointIn(o.ring, s[0], s[1])) best = o; }
    if (best) (best.holes || (best.holes = [])).push(h); else log.event("hole-without-outer", { epoch: label, km2: Math.round(h.km2) });
  }
  const pieces = outers;
  /* ---- labelling: which rows contain a sample point of the piece ---- */
  const rowRings = new Map();   // row → [{ ring (unwrapped), hole }] of the row's final lines
  for (const L of lines) { const pts = L.v.map((v) => [VX[v], VY[v]]); if (pts.length < 3) continue; let l = rowRings.get(L.row); if (!l) rowRings.set(L.row, l = []); l.push(unwrapRing(pts)); }
  // a row holds a point by the NON-ZERO rule over its rings, holes (odd nesting depth) counting against: Cliopatria draws some
  // polygons as figure-eights (Carthage's Sicily at 301 BCE), whose even-odd interior leaves one lobe outside its own polity
  for (const [, l] of rowRings) for (const ring of l) { let depth = 0; for (const o of l) if (o !== ring && pointIn(o, ring.X[0], ring.Y[0])) depth++; ring.sign = depth % 2 ? -1 : 1; }
  const windIn = (ring, px, py) => { const { X, Y, n } = ring; for (const qx of [px, px + 2 * X180, px - 2 * X180]) { let w = 0; for (let i = 0, j = n - 1; i < n; j = i++) { if (Y[i] <= py) { if (Y[j] > py && (X[j] - X[i]) * (py - Y[i]) - (qx - X[i]) * (Y[j] - Y[i]) > 0) w++; } else if (Y[j] <= py && (X[j] - X[i]) * (py - Y[i]) - (qx - X[i]) * (Y[j] - Y[i]) < 0) w--; } if (w) return true; } return false; };
  const rowContains = (r, px, py) => { let n = 0; for (const ring of rowRings.get(r) || []) if (windIn(ring, px, py)) n += ring.sign; return n > 0; };
  // interior samples on a grid over the piece's box (inside the ring, outside its holes): the edge samples lie within 3 km of
  // the boundary, and a boundary that is a coast may sit 15 km from where the source drew it, so a coastal piece's edge samples
  // fell outside its own polity's raw ring (measured: Carthage's western Sicily at 300 BCE, 2 votes of 8, owned by nobody)
  const gridOf = (p, N) => {
    const { X, Y, n } = p.ring; let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity; for (let i = 0; i < n; i++) { if (X[i] < x0) x0 = X[i]; if (X[i] > x1) x1 = X[i]; if (Y[i] < y0) y0 = Y[i]; if (Y[i] > y1) y1 = Y[i]; }
    const out = []; const k = Math.ceil(Math.sqrt(N));
    for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) { let px = Math.round(x0 + (x1 - x0) * (i + 0.5) / k); const py = Math.round(y0 + (y1 - y0) * (j + 0.5) / k); if (px >= X180) px -= 2 * X180; if (px < -X180) px += 2 * X180; if (pointIn(p.ring, px, py) && !(p.holes || []).some((h) => pointIn(h.ring, px, py))) out.push([px, py]); }
    return out;
  };
  for (const p of pieces) {
    const edgeSamples = sampleOf(p, 8); p.sample = edgeSamples[0] || null;
    const grid = p.km2 > 50 ? gridOf(p, 64) : []; const samples = grid.length >= 4 ? grid : edgeSamples;
    p.samples = samples; p.gridN = grid.length;
    // the piece's anchor: the grid sample nearest the mean of the grid samples (the most interior one, roughly) — an edge sample sits
    // 3 km from the boundary, which at the globe zoom is inside the coast tolerance and reads as sea
    if (grid.length >= 4) { let mx = 0, my = 0; for (const q of grid) { mx += q[0]; my += q[1]; } mx /= grid.length; my /= grid.length; let best = null, bd = Infinity; for (const q of grid) { const d = (q[0] - mx) * (q[0] - mx) + (q[1] - my) * (q[1] - my); if (d < bd) { bd = d; best = q; } } p.anchor = best; } else p.anchor = edgeSamples[0] || null;
    if (!samples.length) { p.owners = []; log.event("piece-without-sample", { epoch: label, km2: Math.round(p.km2) }); continue; }
    p.owners = alive.filter((r) => { let n = 0; for (const q of samples) if (rowContains(r, q[0], q[1])) n++; return n * 2 >= samples.length && n > 0; });
    // a geometry fix's `over`: where the fixed row and the named row both claim a piece, the piece is the fixed row's (geometry-fixes.json; the Roman Kingdom over the Etruscans, 750–551 BCE)
    if (p.owners.length > 1) for (const r of p.owners) { if (!r.over || !r.over.length) continue; const drop = p.owners.filter((o) => o !== r && r.over.includes(o.series.key)); if (drop.length) { p.owners = p.owners.filter((o) => !drop.includes(o)); stat.fixPrevails = (stat.fixPrevails || 0) + 1; stat.fixPrevailsKm2 = (stat.fixPrevailsKm2 || 0) + p.km2; log.event("geometry-fix-prevails", { epoch: label, series: r.series.key, over: drop.map((o) => o.series.key), km2: +p.km2.toFixed(2) }); } }
  }
  // DEBUG_POINT="lon,lat,year": the piece holding the point in that year, its owners, its samples, every alive row's verdict
  if (process.env.DEBUG_POINT) { const [dlon, dlat, dy] = process.env.DEBUG_POINT.split(",").map(Number); const [y0, y1] = label.split("..").map(Number); if (dy >= y0 && dy <= y1) {
    const px = R.U(dlon), py = R.U(dlat);
    console.log(`  DEBUG epoch ${label}: cycles ${cycles.length}, land ${landCycles.length}, outers ${outers.length}, holes ${holes.length}, degenerate ${cycles.filter((c) => c.degenerate).length}; pieces 1e3–1e6 km²: ${outers.filter((c) => c.km2 > 1e3 && c.km2 < 1e6).length}`);
    { let near = 0, minD = Infinity, at = null; for (let i = 0; i < nA; i++) for (const g of geomOf(i)) { const d = Math.hypot(g[0] - px, (g[1] - py)); if (d < minD) { minD = d; at = deg(g[0], g[1]); } if (d < R.U(1)) near++; } console.log(`  DEBUG vertices within 1 degree of the point: ${near}; nearest arc vertex ${at} (${Math.round(minD)} units); point units ${px},${py}; VX range ${Math.min(...Array.from(VX).filter(Number.isFinite))}..${Math.max(...Array.from(VX).filter(Number.isFinite))}`); }
    { // ray east from the point: the nearest arc segment it crosses, and the cycle on the point side of that segment
      let best = null;
      for (let i = 0; i < nA; i++) { const g = geomOf(i); for (let k = 1; k < g.length; k++) { const [x0, y0] = g[k - 1], [x1, y1] = g[k]; if ((y0 > py) !== (y1 > py)) { const xi = x0 + (py - y0) * (x1 - x0) / (y1 - y0); if (xi >= px && (!best || xi < best.xi)) best = { xi, arc: i, k, down: y1 < y0 }; } } }
      if (best) { const dir = best.down ? 1 : -1; // segment heading south has the point (west of it) on its right; the left-face half is the reverse
        for (const d of [1, -1]) { const ci = cycleOf[halfKey(best.arc, d)]; const c = cycles[ci]; const ring = c.ring || unwrapRing(cycleVerts(c)); console.log(`  DEBUG ray hits arc ${best.arc} kind ${arcs[best.arc].kind} at ${deg(best.xi, py)} heading ${best.down ? "south" : "north"}; half dir ${d} → cycle ${ci}: land ${c.land} outer ${c.outer} km2 ${Math.round(c.km2)} halves ${c.halves.length} ring n ${ring.n} pointIn ${pointIn(ring, px, py)} X range ${Math.min(...ring.X)}..${Math.max(...ring.X)} Y range ${Math.min(...ring.Y)}..${Math.max(...ring.Y)}`); }
      } else console.log("  DEBUG ray hits nothing");
    }
    { const dang = []; for (const [v, l] of incident) if (l.length === 1) dang.push({ v, arc: l[0].arc, dir: l[0].dir }); console.log(`  DEBUG dangling ends (degree 1): ${dang.length}`); for (const d of dang.slice(0, 40)) { const A = ARCS[arcs[d.arc].global]; const g = geomOf(d.arc); console.log(`   at ${deg(VX[d.v], VY[d.v])} arc ${d.arc} kind ${arcs[d.arc].kind} core ${A.core ? A.core.arc + ":" + A.core.from + ".." + A.core.to + " segs " + A.core.segA + "/" + A.core.segB : "own"} key ${A.key.slice(0, 60)} len ${Math.round(arcLen[d.arc])} m pts ${g.length} other end ${deg(...(d.dir > 0 ? g[g.length - 1] : g[0]))}`); }
      const odd = []; for (const [v, l] of incident) if (l.length === 2) { const kinds = l.map((h) => arcs[h.arc].kind); if (kinds[0] !== kinds[1]) odd.push([v, kinds]); } console.log(`  DEBUG degree-2 vertices joining different kinds: ${odd.length}`); for (const [v, k] of odd.slice(0, 10)) console.log(`   at ${deg(VX[v], VY[v])} kinds ${k}`);
    }
    { let bestArc = -1, bx = Infinity; for (let i = 0; i < nA; i++) { const g = geomOf(i); for (let k = 1; k < g.length; k++) { const [x0, y0] = g[k - 1], [x1, y1] = g[k]; if ((y0 > py) !== (y1 > py)) { const xi = x0 + (py - y0) * (x1 - x0) / (y1 - y0); if (xi >= px && xi < bx) { bx = xi; bestArc = i; } } } }
      const c = cycles[cycleOf[halfKey(bestArc, 1)]]; const H = c.halves; const desc = (a, d) => { const A = ARCS[arcs[a].global]; const g = geomOf(a); const st = d > 0 ? g[0] : g[g.length - 1], en = d > 0 ? g[g.length - 1] : g[0]; const endV = d > 0 ? arcs[a].vb : arcs[a].va; return `arc ${a} k${arcs[a].kind} d${d} ${A.core ? "core" + A.core.arc + "[" + A.core.from + ".." + A.core.to + "]" : "own"} ${deg(...st)}→${deg(...en)} len ${Math.round(arcLen[a] / 1000)}km deg(end) ${incident.get(endV).length}`; };
      for (let i = 0; i < H.length; i++) if (H[i][0] === bestArc) { console.log(`  DEBUG cycle walk around arc ${bestArc} occurrence at ${i}/${H.length}:`); for (let j = Math.max(0, i - 8); j < Math.min(H.length, i + 9); j++) console.log("   " + (j === i ? "* " : "  ") + desc(H[j][0], H[j][1])); }
      // land-left coast halves in this cycle vs sea-side: where do the transitions happen?
      let trans = 0; for (let i = 0; i < H.length; i++) { const [a, d] = H[i], [b, e] = H[(i + 1) % H.length]; if (arcs[a].kind === KIND.COAST && arcs[b].kind === KIND.COAST && d !== e) { trans++; if (trans <= 6) { console.log(`  DEBUG coast side flip at ${i}: ${desc(a, d)}  THEN  ${desc(b, e)}`); const endV = d > 0 ? arcs[a].vb : arcs[a].va; console.log("     incident at junction: " + incident.get(endV).map((h) => `(${h.arc} k${arcs[h.arc].kind} d${h.dir} ang ${h.ang.toFixed(3)})`).join(" ")); } } } console.log(`  DEBUG coast side flips in the cycle: ${trans}`);
    }
    { let bestArc = -1, bx = Infinity; for (let i = 0; i < nA; i++) { const g = geomOf(i); for (let k = 1; k < g.length; k++) { const [x0, y0] = g[k - 1], [x1, y1] = g[k]; if ((y0 > py) !== (y1 > py)) { const xi = x0 + (py - y0) * (x1 - x0) / (y1 - y0); if (xi >= px && xi < bx) { bx = xi; bestArc = i; } } } }
      const c = cycles[cycleOf[halfKey(bestArc, 1)]]; const H = c.halves; const occ = []; H.forEach(([a], i) => { if (a === bestArc) occ.push(i); });
      const same = []; for (let i = 0; i < H.length; i++) { const [a, d] = H[i], [b, e] = H[(i + 1) % H.length]; if (a === b) same.push(i); } console.log("  DEBUG immediate reversals (same arc twice in a row): " + same.length + " at " + same.slice(0, 10));
      const desc = (a, d) => { const A = ARCS[arcs[a].global]; const g = geomOf(a); const en = d > 0 ? g[g.length - 1] : g[0]; const endV = d > 0 ? arcs[a].vb : arcs[a].va; return `${a}k${arcs[a].kind}d${d > 0 ? "+" : "-"}${A.core ? "c" + A.core.arc : "own"}→${deg(...en)}°${incident.get(endV).length}`; };
      const lines = []; for (let j = occ[0] + 17; j < occ[1] - 8; j++) lines.push(desc(H[j][0], H[j][1])); console.log("  DEBUG between the passes (" + lines.length + "): " + lines.join(" | "));
      for (const i of same.slice(0, 3)) { const [a, d] = H[i]; const endV = d > 0 ? arcs[a].vb : arcs[a].va; console.log(`   reversal at ${deg(VX[endV], VY[endV])}: incident ${incident.get(endV).map((h) => "(" + h.arc + " d" + h.dir + " ang " + h.ang.toFixed(3) + ")").join(" ")} ; arc ${a} va ${arcs[a].va} vb ${arcs[a].vb} pts ${geomOf(a).length}`); }
    }
    for (const r of alive) { if (!rowContains(r, px, py)) continue; console.log(`  DEBUG row ${r.series.key} ${r.from}..${r.to} contains the point: lines ${lines.filter((L) => L.row === r).map((L) => L.v.length + "v/" + L.v.filter((v) => VON[v] && VON[v].coast).length + "coast/" + L.v.filter((v) => VON[v] && VON[v].bord).length + "bord/" + L.v.filter((v) => VON[v] && VON[v].shared).length + "shared").join(" ")}`);
      const el = edges.filter((e) => e.L.row === r); console.log(`   edges ${el.length}: dropped ${el.filter((e) => e.drop).length}, refs ${el.filter((e) => e.ref).length}, live own ${el.filter((e) => !e.drop && !e.ref).length}`);
      // the epoch arcs whose own geometry starts at one of the row's vertices: both halves in one cycle = a dead end
      const vs = new Set(); for (const L of lines) if (L.row === r) for (const v of L.v) vs.add(v);
      const mine = []; for (let i = 0; i < nA; i++) if (!ARCS[arcs[i].global].core && (vs.has(arcs[i].va) || vs.has(arcs[i].vb))) mine.push(i);
      const dead = mine.filter((i) => cycleOf[halfKey(i, 1)] === cycleOf[halfKey(i, -1)]);
      console.log(`   own arcs touching the row's vertices: ${mine.length}, of which both sides in one cycle: ${dead.length}`);
      for (const di of dead.slice(0, 1)) { for (const end of [arcs[di].va, arcs[di].vb]) for (const h of incident.get(end)) { const g = geomOf(h.arc); const pts = h.dir > 0 ? g.slice(0, 4) : g.slice(-4).reverse(); console.log(`    arc ${h.arc} k${arcs[h.arc].kind} from ${deg(VX[end], VY[end])}: ` + pts.map((p) => deg(...p).join(",")).join(" → ") + ` (${g.length} pts, row ${(ARCS[arcs[h.arc].global].rows || []).join("/")})`); }
        // every own arc within 30 km of the dead arc's ends, and whether its first segments cross the dead arc's
        const g0 = geomOf(di); for (let i = 0; i < nA; i++) { if (i === di || ARCS[arcs[i].global].core) continue; const g = geomOf(i); let hit = null; for (let p = 1; p < g0.length && !hit; p++) for (let q = 1; q < g.length; q++) if (G.segmentsCross(vecU(...g0[p - 1]), vecU(...g0[p]), vecU(...g[q - 1]), vecU(...g[q]))) { hit = [p, q]; break; } if (hit) console.log(`    own arc ${i} crosses the dead arc: segs ${hit} near ${deg(...g0[hit[0]])} / ${deg(...g[hit[1] - 1])}→${deg(...g[hit[1]])}`); }
      }
      for (const di of dead.slice(0, 2)) { const c = cycles[cycleOf[halfKey(di, 1)]]; const H = c.halves; const desc = (a, d) => { const A = ARCS[arcs[a].global]; const g = geomOf(a); const en = d > 0 ? g[g.length - 1] : g[0]; const endV = d > 0 ? arcs[a].vb : arcs[a].va; return `${a}k${arcs[a].kind}d${d > 0 ? "+" : "-"}${A.core ? "c" : "own"}→${deg(...en)}°${incident.get(endV).length}`; }; H.forEach(([a, d], i) => { if (a !== di) return; const l = []; for (let j = Math.max(0, i - 12); j < Math.min(H.length, i + 13); j++) l.push((j === i ? "*" : "") + desc(H[j][0], H[j][1])); console.log(`    walk around dead arc ${di} at ${i}/${H.length}: ` + l.join(" | ")); }); }
      for (const i of dead.slice(0, 8)) { const g = geomOf(i); console.log(`    dead arc ${i} ${deg(...g[0])}→${deg(...g[g.length - 1])} len ${Math.round(arcLen[i])} m pts ${g.length} deg(va) ${incident.get(arcs[i].va).length} deg(vb) ${incident.get(arcs[i].vb).length}`); for (const v of [arcs[i].va, arcs[i].vb]) console.log("      at " + deg(VX[v], VY[v]) + " VON " + JSON.stringify(VON[v]) + " incident " + incident.get(v).map((h) => h.arc + "k" + arcs[h.arc].kind + "d" + h.dir + "@" + h.ang.toFixed(3) + "→" + cycleOf[halfKey(h.arc, h.dir)]).join(" ")); }
    }
    for (const c of cycles) { if (!c.mixed) continue; const H = c.halves; let lastDir = 0, lastI = -1, shown = 0; const desc = (a, d) => { const A = ARCS[arcs[a].global]; const g = geomOf(a); const en = d > 0 ? g[g.length - 1] : g[0]; return `${a}k${arcs[a].kind}d${d > 0 ? "+" : "-"}${A.core ? "c" : "own"}→${deg(...en)}°${incident.get(d > 0 ? arcs[a].vb : arcs[a].va).length}`; };
      let land = 0, sea = 0; for (const [a, d] of H) if (arcs[a].kind === KIND.COAST) { if (d > 0) land++; else sea++; }
      console.log(`  DEBUG mixed cycle: ${H.length} halves, coast land ${land} sea ${sea}, km2 ${Math.round(c.km2)}`);
      for (let i = 0; i < H.length * 2; i++) { const [a, d] = H[i % H.length]; if (arcs[a].kind !== KIND.COAST) continue; if (lastDir && d !== lastDir && shown < 6 && i >= H.length) { shown++; const run = []; for (let j = lastI; j <= i; j++) run.push(desc(H[j % H.length][0], H[j % H.length][1])); console.log("   flip: " + run.join(" | ")); for (let j = lastI; j <= i; j++) { const [a] = H[j % H.length]; if (ARCS[arcs[a].global].core) continue; const g = geomOf(a); for (let k = 1; k < g.length; k++) { const mx = Math.round((g[k - 1][0] + g[k][0]) / 2), my = Math.round((g[k - 1][1] + g[k][1]) / 2); const n = nearest(mx, my, SEA_M, coastIdx, coastSeg); console.log(`     own arc ${a} seg ${k} mid ${deg(mx, my)} seaAt ${seaAt(mx, my)} nearest ${n ? Math.round(n.metres) + " m t=" + n.t.toFixed(3) + " arc " + segA[n.k] + " coastDir " + coastDir[segA[n.k]] : "none"}; ends seaAt ${seaAt(g[k - 1][0], g[k - 1][1])}/${seaAt(g[k][0], g[k][1])} VON ${JSON.stringify(VON[arcs[a].va])} ${JSON.stringify(VON[arcs[a].vb])}`); } } } lastDir = d; lastI = i; }
    }
    for (let ci = 0; ci < cycles.length; ci++) { const c = cycles[ci]; const ring = c.ring || unwrapRing(cycleVerts(c)); if (!pointIn(ring, px, py)) continue; let land = 0, sea = 0; for (const [a, d] of c.halves) if (arcs[a].kind === KIND.COAST) { if (d > 0) land++; else sea++; } const g = geomOf(c.halves[0][0]); console.log(`  DEBUG cycle ${ci} contains: land ${c.land} outer ${c.outer} degenerate ${!!c.degenerate} km2 ${Math.round(c.km2)} halves ${c.halves.length} coast votes land ${land} sea ${sea} first half at ${deg(g[0][0], g[0][1])} kinds ${[...new Set(c.halves.map(([a]) => arcs[a].kind))]}`); }
    for (let i = 0; i < pieces.length; i++) { const p = pieces[i]; if (!pointIn(p.ring, px, py)) continue; const inHole = (p.holes || []).some((h) => pointIn(h.ring, px, py)); console.log(`  DEBUG ring-contains piece ${i} km2 ${Math.round(p.km2)} inHole ${inHole}`); if (inHole) continue;
      console.log(`  DEBUG piece ${i} km2 ${Math.round(p.km2)} halves ${p.halves.length} holes ${(p.holes || []).length} owners ${p.owners.map((r) => r.series.key).join("+") || "-"}`);
      console.log('   halves: ' + p.halves.map(([a, d]) => { const A = ARCS[arcs[a].global]; const g = geomOf(a); const st = d > 0 ? g[0] : g[g.length - 1], en = d > 0 ? g[g.length - 1] : g[0]; return `${a}${A.core ? (arcs[a].kind === KIND.COAST ? 'c' : 'b') : 'o'}${d > 0 ? '+' : '-'} ${deg(...st)}→${deg(...en)} ${Math.round(arcLen[a] / 1000)}km${A.core ? '' : ' rows:' + [...new Set(edges.filter((e) => !e.drop && !e.ref && ((e.a === arcs[a].va && e.b === arcs[a].vb) || (e.b === arcs[a].va && e.a === arcs[a].vb) || A.own.some((q) => q[0] === VX[e.a] && q[1] === VY[e.a]))).map((e) => e.L.row.series.key))].join('/')}`; }).join(' | '));
      const samples = p.samples; console.log(`   samples ${samples.length} (grid ${p.gridN}) ` + samples.slice(0, 12).map((q) => deg(q[0], q[1]).join(",")).join(" "));
      for (const r of alive) { if (!rowContains(r, px, py)) continue; for (const ring of rowRings.get(r) || []) { let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity; for (let i = 0; i < ring.n; i++) { x0 = Math.min(x0, ring.X[i]); x1 = Math.max(x1, ring.X[i]); y0 = Math.min(y0, ring.Y[i]); y1 = Math.max(y1, ring.Y[i]); } const hits = p.samples.filter((q) => pointIn(ring, q[0], q[1])).length; console.log(`   ring of ${r.series.key}: n ${ring.n} bbox ${deg(x0, y0)}..${deg(x1, y1)} holds point ${pointIn(ring, px, py)} grid hits ${hits}/${p.samples.length}`); } }
      for (const r of alive) { const atPoint = rowContains(r, px, py); const votes = samples.filter((q) => rowContains(r, q[0], q[1])).length; if (atPoint || votes) console.log(`   row ${r.series.key} ${r.from}..${r.to}: contains the point ${atPoint}, votes ${votes}/${samples.length}, rings ${(rowRings.get(r) || []).map((g) => g.n).join("/")}`); }
      const pr = pieces.filter((q) => q.owners.some((r) => r.series.key === "rome")); console.log("   rome owns " + pr.length + " pieces: " + pr.map((q) => Math.round(q.km2)).join(","));
    }
  } }
  /* ---- slivers: a piece claimed by nobody or by several, small or thin, goes to its longest-edge neighbour ---- */
  const pieceOfCycle = new Map(); pieces.forEach((p, i) => { pieceOfCycle.set(p, i); for (const h of p.holes || []) pieceOfCycle.set(h, i); });
  const sideOf = (a, d) => { const c = cycles[cycleOf[halfKey(a, d)]]; const p = pieceOfCycle.get(c); return p == null ? -1 : p; };
  const ownerKey = (p) => p.owners.map((r) => r.series.key).sort().join("+");
  for (let round = 0; round < 4; round++) {
    let changed = 0;
    for (let i = 0; i < pieces.length; i++) {
      const p = pieces[i]; if (p.owners.length === 1 || p.merged) continue;
      let perim = 0; const shared = new Map();
      for (const c of [p].concat(p.holes || [])) for (const [a, d] of c.halves) { perim += arcLen[a]; const o = sideOf(a, -d); if (o >= 0 && o !== i && pieces[o].owners.length === 1 && !pieces[o].merged) shared.set(o, (shared.get(o) || 0) + arcLen[a]); }
      const width = p.km2 * 1e6 / Math.max(1, perim / 2);
      if (!shared.size) continue;
      (stat.pieceDist = stat.pieceDist || []).push([p.owners.length, +p.km2.toFixed(2), Math.round(width)]);
      if (!(p.km2 < SLIVER_KM2 || width < SLIVER_WIDTH_M)) continue;
      // among the neighbours, prefer one of the claimants (an overlap sliver goes to one of its two), else the longest edge
      const cands = [...shared.entries()].sort((x, y) => y[1] - x[1] || x[0] - y[0]);
      const pick = cands.find(([o]) => p.owners.includes(pieces[o].owners[0])) || cands[0];
      p.owners = [pieces[pick[0]].owners[0]]; p.merged = true; changed++; stat.slivers++; stat.sliverKm2 += p.km2;
    }
    if (!changed) break;
  }
  /* ---- faces: per owner set ---- */
  const dropArc = new Uint8Array(nA);
  const leftKey = new Array(nA), rightKey = new Array(nA);
  for (let a = 0; a < nA; a++) { const l = sideOf(a, 1), r = sideOf(a, -1); leftKey[a] = l >= 0 && pieces[l].owners.length ? ownerKey(pieces[l]) : ""; rightKey[a] = r >= 0 && pieces[r].owners.length ? ownerKey(pieces[r]) : ""; }
  for (let a = 0; a < nA; a++) {
    if (arcs[a].kind === KIND.COAST) continue;
    if (cycleOf[halfKey(a, 1)] === cycleOf[halfKey(a, -1)]) { dropArc[a] = 1; continue; }   // dangling into one piece
    if (leftKey[a] === rightKey[a]) { dropArc[a] = 1; continue; }                            // the same owners both sides (or none)
    if (!leftKey[a] || !rightKey[a]) { ARCS[arcs[a].global].flags |= FLAG.OPEN; }
  }
  const byOwner = new Map();
  pieces.forEach((p, i) => {
    if (!p.owners.length) {
      let touches = false; for (const c of [p].concat(p.holes || [])) for (const [a, d] of c.halves) { const o = sideOf(a, -d); if (o >= 0 && o !== i && pieces[o].owners.length) { touches = true; break; } }
      if (touches && p.km2 < 50000) { stat.unmappedPieces++; stat.unmappedKm2 += p.km2; } else if (touches) { stat.remainderPieces = (stat.remainderPieces || 0) + 1; }
      return;
    }
    const k = ownerKey(p); let l = byOwner.get(k); if (!l) byOwner.set(k, l = []); l.push(i);
  });
  const chainRings = (refs) => {
    const startV = (ref) => { const a = arcs[Math.abs(ref) - 1]; return ref > 0 ? a.va : a.vb; }, endV = (ref) => { const a = arcs[Math.abs(ref) - 1]; return ref > 0 ? a.vb : a.va; };
    const byStart = new Map(); for (const r of refs) { let l = byStart.get(startV(r)); if (!l) byStart.set(startV(r), l = []); l.push(r); }
    const used = new Set(); const out = [];
    for (const r0 of refs) {
      if (used.has(r0)) continue;
      const ring = [r0]; used.add(r0); let cur = r0, guard = 0;
      while (endV(cur) !== startV(r0) && guard++ < 1e6) { const l = (byStart.get(endV(cur)) || []).filter((r) => !used.has(r)); if (!l.length) break; cur = l[0]; used.add(cur); ring.push(cur); }
      if (endV(cur) !== startV(r0)) log.event("face-ring-open", { epoch: label });
      out.push(ring);
    }
    return out;
  };
  // nested or contested: for a piece set claimed by two, the overlap against each claimant's whole area this epoch
  const areaOfRow = new Map(); for (const p of pieces) for (const r of p.owners) areaOfRow.set(r, (areaOfRow.get(r) || 0) + p.km2);
  const areaOfKey = new Map(); for (const p of pieces) if (p.owners.length) { const k = ownerKey(p); areaOfKey.set(k, (areaOfKey.get(k) || 0) + p.km2); }
  const nestOf = (owners) => {   // [member, overlord] rows, or null
    if (owners.length !== 2) return null;
    const [A, B] = owners; const a = areaOfRow.get(A) || 0, b = areaOfRow.get(B) || 0, ov = areaOfKey.get(ownerKey({ owners })) || 0;
    const small = Math.min(a, b), big = Math.max(a, b); if (!(small > 0) || ov < NEST_SHARE * small || big < NEST_RATIO * small) return null;
    return a <= b ? [A, B] : [B, A];
  };
  const result = [];   // { entity, faceIndex, ownerKeys }
  let nested = 0;
  for (const [k, ids] of [...byOwner.entries()].sort((x, y) => x[0].localeCompare(y[0]))) {
    const count = new Map();
    for (const i of ids) for (const c of [pieces[i]].concat(pieces[i].holes || [])) for (const [a, d] of c.halves) { if (dropArc[a]) continue; const ref = d > 0 ? a + 1 : -(a + 1); count.set(ref, (count.get(ref) || 0) + 1); }
    const refs = []; for (const [ref, n] of count) { if (count.has(-ref)) continue; for (let m = 0; m < n; m++) refs.push(ref); }
    // to GLOBAL signed refs, canonical ring order
    const rings = chainRings(refs).map((ring) => ring.map((ref) => { const li = Math.abs(ref) - 1, gi = arcs[li].global; return ref > 0 ? gi + 1 : -(gi + 1); }));
    const canon = rings.map((ring) => { let m = 0; for (let i = 1; i < ring.length; i++) if (Math.abs(ring[i]) < Math.abs(ring[m])) m = i; return ring.slice(m).concat(ring.slice(0, m)); }).sort((p, q) => Math.abs(p[0]) - Math.abs(q[0]));
    const owners = pieces[ids[0]].owners; const nest = nestOf(owners);
    const entity = owners.length === 1 ? entityOf(owners[0].series) : nest ? nestedOf(nest[0].series.key, nest[1].series.key) : contestedOf(owners.map((r) => r.series.key).sort());
    const cls = owners.length === 1 ? (PRES ? (owners[0].series.kind === "front" ? CLS.APPROX : CLS.SOFT) : CLS.APPROX) : nest ? CLS.NESTED : CLS.CONTESTED;
    if (nest) nested++;
    const fkey = entity + "|" + canon.map((r) => r.join(",")).join("|");
    let fi = faceByKey.get(fkey);
    if (fi == null) { fi = FACES.length; faceByKey.set(fkey, fi); const big = ids.slice().sort((p, q) => pieces[q].km2 - pieces[p].km2)[0]; FACES.push({ key: fkey, entity, cls, src: PRES ? (owners[0].src != null ? owners[0].src : owners[0].series.src) : 0, rings: canon, km2: ids.reduce((s, i) => s + pieces[i].km2, 0), anchor: pieces[big].anchor || pieces[big].sample || null }); if (owners.length > 1 && !nest) stat.contestedFaces++; if (nest) stat.nestedFaces = (stat.nestedFaces || 0) + 1; }
    result.push({ entity, faceIndex: fi, ownerKeys: owners.map((r) => r.series.key) });
    void k;
  }
  for (let a = 0; a < nA; a++) { if (dropArc[a] || arcs[a].kind === KIND.COAST) continue; const l = leftKey[a], r = rightKey[a]; if (!l || !r) continue; for (const x of l.split("+")) for (const y of r.split("+")) if (x !== y) { stat.touches.set(x + "|" + y, 1); stat.touches.set(y + "|" + x, 1); } }
  return { result, vertices: VX.length, arcs: nA, pieces: pieces.length, contested: result.filter((r) => ENT[r.entity].kind === "contested").length, nested, unmapped: pieces.filter((p) => !p.owners.length).length };
}

/* ================= 5. every epoch ================= */
/* the epoch cache (resumable builds): one JSON per distinct alive set under out/history-cache/<hash>/, holding what the epoch
   added to the registries — replayed in epoch order, it rebuilds them identically (every record is keyed and registered through
   the same functions in the same order) */
const CACHE_DIR = (() => {
  const h = crypto.createHash("sha256");
  h.update(JSON.stringify({ buildId, clio: clioSrc.sha256, spec: crypto.createHash("sha256").update(fs.readFileSync(path.join(ROOT, ".claude", "polity-spec.json"))).update(fs.readFileSync(path.join(HERE, "war-series.json"))).digest("hex"), years: [Y0, Y1], PEOPLES, D1_M, D1_SURE_M, RING_SNAP_FRAC, SMALL_RING_M, D2_M, D2_SURE_M, D3_M, SEA_M, RUN_FACTOR, RUN_MIN_M, SLIVER_KM2, SLIVER_WIDTH_M, LOD_M, DUP_U, NEST_SHARE, NEST_RATIO, TOLERANCE_M, MAX_CHORD_M, fixes: GEOM_FIXES_SHA, v: 9 }));
  return path.join(OUT, "history-cache", h.digest("hex").slice(0, 16));
})();
if (USE_CACHE) { fs.mkdirSync(CACHE_DIR, { recursive: true }); say(`epoch cache: ${path.relative(HERE, CACHE_DIR)} (${fs.readdirSync(CACHE_DIR).length} epochs cached)`); }
const epochFile = (e, dir) => path.join(dir || CACHE_DIR, crypto.createHash("sha256").update(e.alive.map((r) => [r.series.key, r.name, r.from, r.to, r.nv].join("|")).join("\n")).digest("hex").slice(0, 24) + ".json");
const statSnap = () => Object.fromEntries(Object.keys(stat).filter((k) => typeof stat[k] === "number").map((k) => [k, stat[k]]));
const logSnap = () => JSON.parse(JSON.stringify(log.counts));
/* conflate one alive set, recording its contribution; or replay it from the cache */
function conflateCached(e, dir) {
  const file = USE_CACHE ? epochFile(e, dir) : null;
  if (file && fs.existsSync(file)) {
    const c = JSON.parse(fs.readFileSync(file, "utf8"));
    if (c.arcsBefore !== ARCS.length || c.facesBefore !== FACES.length || c.entsBefore !== ENT.length) throw new Error(`epoch cache out of order at ${e.from}..${e.to}: delete ${path.relative(HERE, CACHE_DIR)} and rebuild`);
    for (const a of c.newArcs) { arcByKey.set(a.key, ARCS.length); ARCS.push(a); }
    for (const en of c.newEnts) { entIndex.set(isSeriesKind(en.kind) ? en.key : en.id, ENT.length); ENT.push(en); }
    for (const f of c.newFaces) { faceByKey.set(f.key, FACES.length); FACES.push(f); }
    for (const [k, v] of Object.entries(c.stat)) stat[k] = (stat[k] || 0) + v;
    for (const k of c.touches) stat.touches.set(k, 1);
    for (const k of c.near) stat.near.add(k);
    if (c.pieceDist.length) (stat.pieceDist = stat.pieceDist || []).push(...c.pieceDist);
    log.addCounts(c.log);
    return { result: c.result, arcs: c.summary.arcs, pieces: c.summary.pieces, contested: c.summary.contested, nested: c.summary.nested, unmapped: c.summary.unmapped, cached: true };
  }
  const arcs0 = ARCS.length, faces0 = FACES.length, ents0 = ENT.length, stat0 = statSnap(), log0 = logSnap(), ev0 = log.events.length, pd0 = (stat.pieceDist || []).length, touch0 = new Set(stat.touches.keys()), near0 = new Set(stat.near);
  const r = conflate(e.alive, `${e.from}..${e.to}`);
  if (file) {
    const stat1 = statSnap(), log1 = logSnap();
    const dStat = {}; for (const k of Object.keys(stat1)) { const d = stat1[k] - (stat0[k] || 0); if (d) dStat[k] = d; }
    const dLog = { n: log1.n - log0.n, over: log1.over - log0.over, max: log1.max, bySource: {}, byKind: {}, events: log.events.slice(ev0) };
    for (const k of Object.keys(log1.bySource)) { const d = log1.bySource[k] - (log0.bySource[k] || 0); if (d) dLog.bySource[k] = d; }
    for (const k of Object.keys(log1.byKind)) { const d = log1.byKind[k] - (log0.byKind[k] || 0); if (d) dLog.byKind[k] = d; }
    const rec = { from: e.from, to: e.to, arcsBefore: arcs0, facesBefore: faces0, entsBefore: ents0, newArcs: ARCS.slice(arcs0), newEnts: ENT.slice(ents0), newFaces: FACES.slice(faces0), result: r.result, stat: dStat, touches: [...stat.touches.keys()].filter((k) => !touch0.has(k)), near: [...stat.near].filter((k) => !near0.has(k)), pieceDist: (stat.pieceDist || []).slice(pd0), log: dLog, summary: { arcs: r.arcs, pieces: r.pieces, contested: r.contested, nested: r.nested, unmapped: r.unmapped } };
    const tmp = file + ".tmp"; fs.writeFileSync(tmp, JSON.stringify(rec)); fs.renameSync(tmp, file);
  }
  return r;
}
const epochCache = new Map();
let done = 0, replayed = 0;
for (const e of epochs) {
  let r = epochCache.get(e.key);
  if (!r) { r = conflateCached(e); epochCache.set(e.key, r); if (r.cached) replayed++; }
  for (const x of r.result) {
    const prev = STEPS.find((s) => s[0] === x.entity && s[3] === x.faceIndex && s[2] + 1 === e.from);
    if (prev) prev[2] = e.to; else STEPS.push([x.entity, e.from, e.to, x.faceIndex]);
  }
  if (++done % 25 === 0 || done === epochs.length) say(`epoch ${done}/${epochs.length} (${e.from}..${e.to}): ${r.arcs} arcs, ${r.pieces} pieces, ${r.contested} contested, ${r.nested || 0} nested, ${r.unmapped} unmapped; arcs so far ${ARCS.length}, faces ${FACES.length}${replayed ? "; replayed from the cache " + replayed : ""}`);
}
/* ---- the presence layer (2c): every row of every people and culture, conflated ALONE after the states, in series-key order ----
   The state layer's registries are final here, so the states' epoch cache replays exactly as before; the presence rows have a cache of
   their own whose hash covers the state layer's size (a changed state layer invalidates it) and the rows themselves. */
const statesDone = { arcs: ARCS.length, faces: FACES.length, ents: ENT.length, steps: STEPS.length };
const statStates = statSnap();
const CACHE_DIR_P = path.join(OUT, "history-cache", "presence-" + crypto.createHash("sha256").update(JSON.stringify({ CACHE: path.basename(CACHE_DIR), statesDone, rows: presenceRows.map((r) => [r.series.key, r.name, r.from, r.to, r.nv, r.series.src]), D1_M, D1_SURE_M, RING_SNAP_FRAC, SMALL_RING_M, RUN_FACTOR, RUN_MIN_M, SLIVER_KM2, SLIVER_WIDTH_M, LOD_M, DUP_U, SEA_M, MAX_CHORD_M, v: 2 })).digest("hex").slice(0, 16));
if (USE_CACHE) fs.mkdirSync(CACHE_DIR_P, { recursive: true });
{
  let n = 0, replayedP = 0;
  for (const r of presenceRows) {
    const e = { from: r.from, to: r.to, alive: [r], key: "presence:" + r.id };
    const x = conflateCached(e, CACHE_DIR_P); if (x.cached) replayedP++;
    for (const y of x.result) {
      const prev = STEPS.find((st) => st[0] === y.entity && st[3] === y.faceIndex && st[2] + 1 === e.from);
      if (prev) prev[2] = e.to; else STEPS.push([y.entity, e.from, e.to, y.faceIndex]);
    }
    n++;
  }
  say(`presence layer: ${n} row(s) of ${presenceSeries.length} series conflated alone${replayedP ? " (" + replayedP + " replayed from the cache)" : ""}; arcs ${ARCS.length - statesDone.arcs} new, faces ${FACES.length - statesDone.faces}, entities ${ENT.length - statesDone.ents}`);
}
report.presence = { series: presenceSeries.map((s) => ({ key: s.key, kind: s.kind, rows: s.rows.length, src: s.srcId, islands: s.islands || undefined, picks: s.pickNotes || undefined })), rows: presenceRows.length, newArcs: ARCS.length - statesDone.arcs, newFaces: FACES.length - statesDone.faces, statesEntities: statesDone.ents };
log.check();
report.epochsReplayed = replayed;
const keptSeries = series, droppedSeries = [];
const entKeep = ENT.map(() => true);
const stepsKept = STEPS.filter((s) => entKeep[s[0]]);
const faceUsed = new Set(stepsKept.map((s) => s[3]));
const faceMap = new Map(); const facesOut = []; FACES.forEach((f, i) => { if (faceUsed.has(i)) { faceMap.set(i, facesOut.length); facesOut.push(f); } });
const arcUsed = new Set(); for (const f of facesOut) for (const r of f.rings) for (const ref of r) arcUsed.add(Math.abs(ref) - 1);
const arcMap = new Map(); const arcsOut = []; ARCS.forEach((a, i) => { if (arcUsed.has(i)) { arcMap.set(i, arcsOut.length); arcsOut.push(a); } });
for (const f of facesOut) f.rings = f.rings.map((r) => r.map((ref) => { const i = arcMap.get(Math.abs(ref) - 1); return ref > 0 ? i + 1 : -(i + 1); }));
// a border between a kept polity and a dropped one is one-sided now: OPEN (every alive set, every non-coast arc used once)
{ const stateSteps = stepsKept.filter((st) => !isPresenceKind(ENT[st[0]].kind));   // a presence has no neighbour and no border: its soft edge is not "open"
  const byYear = new Set(); for (const st of stateSteps) { byYear.add(st[1]); byYear.add(st[2] + 1); } const seen = new Set(); let opened = 0;
  for (const y of [...byYear].sort((a, b) => a - b)) { const faces = stateSteps.filter((st) => st[1] <= y && st[2] >= y).map((st) => faceMap.get(st[3])); if (!faces.length) continue; const key = faces.join(","); if (seen.has(key)) continue; seen.add(key); const uses = new Map(); for (const fi of faces) for (const r of facesOut[fi].rings) for (const ref of r) { const a = Math.abs(ref) - 1; uses.set(a, (uses.get(a) || 0) + 1); } for (const [a, n] of uses) if (n === 1 && arcsOut[a].kind !== KIND.COAST && !(arcsOut[a].flags & FLAG.OPEN)) { arcsOut[a].flags |= FLAG.OPEN; opened++; } }
  stat.openedAfterDrop = opened; }
const entMap = new Map(); const entsOut = []; ENT.forEach((e, i) => { if (entKeep[i]) { entMap.set(i, entsOut.length); entsOut.push(e); } });
const stepsOut = stepsKept.map((s) => [entMap.get(s[0]), s[1], s[2], faceMap.get(s[3])]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
for (const f of facesOut) f.entity = entMap.get(f.entity);
// entity spans, Wikidata and Wikipedia from the rows' own properties
for (const e of entsOut) {
  const st = stepsOut.filter((s) => s[0] === entMap.get(ENT.indexOf(e)));
  e.span = st.length ? [Math.min(...st.map((s) => s[1])), Math.max(...st.map((s) => s[2]))] : null;
  if (isSeriesKind(e.kind)) {
    const s = series.concat(presenceSeries).find((x) => x.key === e.key); const rows = s.rows;
    // the Wikidata id and Wikipedia title of the row covering the most years (the rows of one series may differ: recorded)
    const byQ = new Map(); for (const r of rows) { const k = (r.wd || "") + "|" + (r.wiki || ""); byQ.set(k, (byQ.get(k) || 0) + (r.to - r.from + 1)); }
    const best = [...byQ.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0].split("|");
    e.qid = best[0] || null; e.wiki = best[1] || null;
    if (byQ.size > 1) e.alsoWiki = [...byQ.keys()].filter((k) => k !== best.join("|")).map((k) => k.split("|")).map(([q, w]) => ({ qid: q || null, wiki: w || null }));
    e.sourceNames = [...new Set(rows.map((r) => r.name))];
    if (isPresenceKind(e.kind)) { e.src = s.srcId; if (PRESENCE_NOTES[s.key]) e.note = PRESENCE_NOTES[s.key]; if (e.kind === "front") { e.unit = "date"; e.front = s.fronts; e.srcs = [SRC.control, SRC.atlas]; e.note = "A front is the line of a redrawn map: the Atlas shows each plate of the Second World War as its source drew it, standing from its date until the next plate replaces it — monthly to 1942, fortnightly from July 1943, nothing for January–June 1943 (no source). Every plate carries its own uncertainty on the place card."; delete e.sourceNames; delete e.qid; delete e.wiki; } else if (e.kind === "extent" && s.derived) { e.authored = false; e.derived = true; e.srcs = s.derived.src.slice(); e.note = s.derived.note; delete e.qid; delete e.wiki; delete e.sourceNames; } else if (e.kind === "extent") { e.authored = true; e.note = "An authored extent: Folio’s own approximation of where this side’s ground lay in the war’s years, drawn from no dataset and without a border line. No open source draws it (docs/atlas-v2-coverage.md)."; delete e.qid; delete e.wiki; delete e.sourceNames; } }
    e.cards = s.cards;   // the cards that link this polity (polity-spec.json links): Phase 3's `places` field, nothing drawn from them yet
    delete e.key;
  }
}
say(`kept: ${entsOut.length} entities, ${stepsOut.length} steps, ${facesOut.length} faces (${facesOut.filter((f) => f.cls === CLS.CONTESTED).length} contested, ${facesOut.filter((f) => f.cls === CLS.NESTED).length} nested), ${arcsOut.length} arcs (${arcsOut.filter((a) => a.core && a.kind === KIND.COAST).length} coast references, ${arcsOut.filter((a) => a.core && a.kind === KIND.BORDER).length} present-day border references, ${arcsOut.filter((a) => !a.core).length} own)`);

/* ================= 6. ranks for the own arcs, then the planarity repair per level ================= */
for (const a of arcsOut) {
  if (a.core) { a.rank = [0, 0]; continue; }
  const xs = a.own.map((p) => p[0]), ys = a.own.map((p) => p[1]);
  const area = R.visvalingam(xs, ys, false);
  a.rank = a.own.map((p, i) => { const sz = Math.sqrt(area[i]); let r = LOD_M.length - 1; for (let L = 0; L < LOD_M.length; L++) if (sz >= LOD_M[L]) { r = L; break; } return i === 0 || i === a.own.length - 1 ? 0 : r; });
}
let JPOS_OUT = null;
/* the simplified levels must stay planar among themselves and against the coast at the SAME level: a crossing at a level
   re-adds the removed vertex of largest area between the crossing segment's ends (both arcs), pass after pass */
{
  // a junction at a coarser level sits on that level's core line (atlas-format.js junctionAt): the coast stays the core's line
  // exactly, and a border starting at the junction starts on it — measured against keeping the LOD 2 range ends instead,
  // which crossed the coarse coast elsewhere (2,879 crossings at LOD 0)
  const JUNC = new Map(); for (const a of arcsOut) if (a.core) { const cs = core.arcOffset[a.core.arc]; if (a.core.segA) JUNC.set(a.va.join(","), { a: a.core.arc, seg: cs + a.core.segA }); if (a.core.segB) JUNC.set(a.vb.join(","), { a: a.core.arc, seg: cs + a.core.segB }); }
  const JPOS = new Map();   // junction key → per coarser level [x, y, segEnd]: the default is junctionAt's fraction placement on the LOD 2 segment's level segment
  const levelSeg = (j, L) => { const a = j.a, s = core.arcOffset[a], e = core.arcOffset[a + 1], seg = j.seg; if (!seg || seg <= s || seg >= e) return null; let lo = seg - 1; while (lo > s && core.rank[lo] > L) lo--; let hi = seg; while (hi < e - 1 && core.rank[hi] > L) hi++; return [lo, hi]; };
  for (const [k, j] of JUNC) { const [x, y] = k.split(",").map(Number); const l = []; for (let L = 0; L + 1 < LOD_M.length; L++) { const p = F.junctionAt(core, j.a, j.seg, x, y, L); const ls = levelSeg(j, L); l.push([p[0], p[1], ls ? ls[1] - core.arcOffset[j.a] : j.seg - core.arcOffset[j.a]]); } JPOS.set(k, l); }
  const jAt = (p, L) => { if (L + 1 >= LOD_M.length) return p; const l = JPOS.get(p.join(",")); return l ? [l[L][0], l[L][1]] : p; };
  const jSeg = (p, L) => { const l = JPOS.get(p.join(",")); return l ? l[L][2] : 0; };
  // where a border leaves the coast at a coarser level, the level's coast line may have cut off the land the border's first
  // vertices stand on (a bay drawn as its chord, a fold of the shore straightened): the border then crosses the coast line.
  // Rule, per junction and level: walk the border's drawn vertices from the junction; the first segment that crosses the level's
  // coast line near the junction gives the new junction (the crossing, on the coast segment it crosses) and the vertices before
  // it are hidden at that level (pinned, so the repair never re-adds them). Junctions on one level segment keep their order along
  // the coast, else the whole segment's junctions fall back to the fraction placement.
  { const ux = (x, ref) => { if (x - ref > X180) return x - 2 * X180; if (ref - x > X180) return x + 2 * X180; return x; };
    let moved = 0, hiddenAtSea = 0, reverted = 0, noCross = 0, tooFar = 0;
    const placed = new Map();   // "arc:L" → [{ key, seg, t }]
    const cross2 = (p, q, r, w) => {   // planar crossing of p→q with r→w (unwrapped about p): [u along p→q, t along r→w] or null
      const px = p[0], qx = ux(q[0], px), rx = ux(r[0], px), wx = ux(w[0], px);
      const den = (qx - px) * (w[1] - r[1]) - (q[1] - p[1]) * (wx - rx); if (Math.abs(den) < 1e-9) return null;
      const u = ((rx - px) * (w[1] - r[1]) - (r[1] - p[1]) * (wx - rx)) / den, t = ((rx - px) * (q[1] - p[1]) - (r[1] - p[1]) * (qx - px)) / den;
      return u > 0 && u < 1 && t > 0 && t < 1 ? [u, t] : null;
    };
    for (let L = 0; L + 1 < LOD_M.length; L++) for (const a of arcsOut) {
      if (a.core) continue; const n = a.own.length;
      for (const end of [0, 1]) {
        const key = (end ? a.own[n - 1] : a.own[0]).join(","); const j = JUNC.get(key); if (!j) continue; const ls = levelSeg(j, L); if (!ls) continue;
        const as = core.arcOffset[j.a], ae = core.arcOffset[j.a + 1];
        // the level's coast vertices around the junction: up to 10 drawn vertices either side
        const lv = []; { let i = ls[0]; const back = []; while (i >= as && back.length < 3) { if (core.rank[i] <= L) back.push(i); i--; } back.reverse(); lv.push(...back); i = ls[1]; let fwd = 0; while (i < ae && fwd < 3) { if (core.rank[i] <= L) { lv.push(i); fwd++; } i++; } }   // the level segment and two neighbours either side: a junction moves a little, never along the coast (measured: a delta junction wandered twelve segments and its piece crossed its neighbour)
        const idx = []; if (end) { for (let i = n - 2; i >= 1; i--) if (a.rank[i] <= L) idx.push(i); } else { for (let i = 1; i <= n - 2; i++) if (a.rank[i] <= L) idx.push(i); }
        let cur = JPOS.get(key)[L].slice(0, 2), curSeg = JPOS.get(key)[L][2]; let hid = 0, found = null;
        for (let k = 0; k < idx.length && !found; k++) {
          const P = k === 0 ? cur : a.own[idx[k - 1]], Q = a.own[idx[k]];
          for (let m = 1; m < lv.length; m++) { const r = [core.lon[lv[m - 1]], core.lat[lv[m - 1]]], w = [core.lon[lv[m]], core.lat[lv[m]]]; if (k === 0 && (lv[m] === ls[1] || lv[m - 1] === ls[0]) && lv[m - 1] === ls[0] && lv[m] === ls[1]) continue;   // the first segment starts on its own level segment
            const c = cross2(P, Q, r, w); if (!c) continue; found = { k, m, t: c[1], r, w }; break; }
        }
        if (!found) { noCross++; continue; }
        { const d = JPOS.get(key)[L]; const nx0 = found.r[0] + (ux(found.w[0], found.r[0]) - found.r[0]) * found.t, ny0 = found.r[1] + (found.w[1] - found.r[1]) * found.t; if (metresU(d[0], d[1], Math.round(nx0), Math.round(ny0)) > 3 * LOD_M[L]) { tooFar++; continue; } }   // within three tolerances of the fraction placement
        // the crossing: on level segment lv[m-1]→lv[m]; hide the vertices before it
        for (let q = 0; q < found.k; q++) { const vi = idx[q]; if (a.rank[vi] <= L) { a.rank[vi] = L + 1; (a.pinned || (a.pinned = new Set())).add(vi); hid++; } }
        let nx = Math.round(ux(found.r[0], found.r[0]) + (ux(found.w[0], found.r[0]) - found.r[0]) * found.t); if (nx >= X180) nx -= 2 * X180; if (nx < -X180) nx += 2 * X180;
        const ny = Math.round(found.r[1] + (found.w[1] - found.r[1]) * found.t);
        JPOS.get(key)[L] = [nx, ny, lv[found.m] - as]; moved++; hiddenAtSea += hid; void cur; void curSeg;
        const gk = j.a + ":" + L; let g = placed.get(gk); if (!g) placed.set(gk, g = []); g.push({ key, seg: lv[found.m] - as, t: found.t });
      }
    }
    // order along the arc: every moved junction against every junction of the same arc at that level, by (segment, t) against the LOD 2 order
    for (const [gk, l] of placed) { const [arcId, Ls] = gk.split(":").map(Number); const L = Ls; const all = []; for (const [k, j] of JUNC) if (j.a === arcId) { const e = JPOS.get(k)[L]; const seg = e[2]; const r = [core.lon[arcId === j.a ? core.arcOffset[j.a] + seg - 1 : 0], core.lat[core.arcOffset[j.a] + seg - 1]]; const w = [core.lon[core.arcOffset[j.a] + seg], core.lat[core.arcOffset[j.a] + seg]]; const t = Math.abs(w[0] - r[0]) > Math.abs(w[1] - r[1]) ? (ux(e[0], r[0]) - r[0]) / (ux(w[0], r[0]) - r[0]) : (e[1] - r[1]) / (w[1] - r[1]); all.push({ key: k, lod2: j.seg + (0), pos: seg + Math.max(0, Math.min(1, t)) , seg2: j.seg - core.arcOffset[j.a], t2: 0 }); }
      // LOD 2 order: by (seg, position along the LOD 2 segment)
      for (const o of all) { const j = JUNC.get(o.key); const [x, y] = o.key.split(",").map(Number); const s0 = j.seg - 1, s1 = j.seg; const r = [core.lon[s0], core.lat[s0]], w = [core.lon[s1], core.lat[s1]]; const t = Math.abs(w[0] - r[0]) > Math.abs(w[1] - r[1]) ? (ux(x, r[0]) - r[0]) / (ux(w[0], r[0]) - r[0]) : (y - r[1]) / (w[1] - r[1]); o.lod2 = o.seg2 + Math.max(0, Math.min(1, t)); }
      const byL = all.slice().sort((p, q) => p.pos - q.pos || p.lod2 - q.lod2), by2 = all.slice().sort((p, q) => p.lod2 - q.lod2);
      if (byL.some((o, i) => o !== by2[i])) { for (const o of l) { const j = JUNC.get(o.key); const [x, y] = o.key.split(",").map(Number); const p = F.junctionAt(core, j.a, j.seg, x, y, L); const ls = levelSeg(j, L); JPOS.get(o.key)[L] = [p[0], p[1], ls ? ls[1] - core.arcOffset[j.a] : j.seg - core.arcOffset[j.a]]; reverted++; } }
    }
    // a piece whose two junctions' level segments ended up out of order (one moved past the other) would draw as a chord across
    // the coast's bends: both junctions fall back to the fraction placement; twice, since a junction belongs to two pieces
    let outOfOrder = 0;
    for (let round = 0; round < 2; round++) for (const a of arcsOut) { if (!a.core || !a.core.segA || !a.core.segB || a.core.from < 0) continue; for (let L = 0; L + 1 < LOD_M.length; L++) { const sa = jSeg(a.va, L), sb = jSeg(a.vb, L); const fwd = a.core.from <= a.core.to; if (fwd ? sa <= sb : sa >= sb) continue; for (const [p] of [[a.va], [a.vb]]) { const key = p.join(","); const j = JUNC.get(key); if (!j) continue; const q = F.junctionAt(core, j.a, j.seg, p[0], p[1], L); const ls = levelSeg(j, L); JPOS.get(key)[L] = [q[0], q[1], ls ? ls[1] - core.arcOffset[j.a] : j.seg - core.arcOffset[j.a]]; } outOfOrder++; } }
    report.junctionPlacement = { moved, hiddenAtSea, noCrossing: noCross, tooFar, reverted, outOfOrder };
    say(`junctions at coarser levels: ${moved} moved to where the border crosses the level's coast, ${hiddenAtSea} border vertices hidden there, ${tooFar} left (crossing over three tolerances away), ${reverted} reverted for order, ${outOfOrder} piece ends reverted (out of order)`);
  }
  const coreGeom = (a, L) => { const c = a.core, s = core.arcOffset[c.arc], pts = [jAt(a.va, L)]; if (c.from >= 0) { let f = c.from, t = c.to; const step = f <= t ? 1 : -1; if (L + 1 < LOD_M.length && c.segA && c.segB) { const sa = jSeg(a.va, L), sb = jSeg(a.vb, L); if (step > 0) { f = Math.max(f, sa); t = Math.min(t, sb - 1); } else { f = Math.min(f, sa - 1); t = Math.max(t, sb); } } for (let i = f; step > 0 ? i <= t : i >= t; i += step) if (core.rank[s + i] <= L) pts.push([core.lon[s + i], core.lat[s + i]]); } pts.push(jAt(a.vb, L)); return pts; };
  const ownGeom = (a, L) => a.own.map((p, i) => (i === 0 || i === a.own.length - 1 ? jAt(p, L) : p)).filter((p, i) => a.rank[i] <= L);
  const repairs = [];
  // the arcs of every distinct alive set (faces → arcs), so arcs of different epochs are never tested against each other
  const faceArcsOut = facesOut.map((f) => { const set = new Set(); for (const r of f.rings) for (const ref of r) set.add(Math.abs(ref) - 1); return [...set]; });
  /* the LAYERS: the states are one planar set per distinct alive set; every presence face is a set of its own (a presence overlaps the
     states and other presences by design, so only its own rings are tested against each other and the coast) */
  const presenceEnt = entsOut.map((e) => isPresenceKind(e.kind));
  const setArcs = []; { const seen = new Set(); const stateSteps = stepsOut.filter((st) => !presenceEnt[st[0]]); const byYear = new Map(); for (const st of stateSteps) { for (const y of [st[1], st[2] + 1]) { if (!byYear.has(y)) byYear.set(y, []); } } const ys = [...byYear.keys()].sort((a, b) => a - b); for (const y of ys) { const faces = stateSteps.filter((st) => st[1] <= y && st[2] >= y).map((st) => st[3]); if (!faces.length) continue; const key = faces.join(","); if (seen.has(key)) continue; seen.add(key); const arcs = new Set(); for (const fi of faces) for (const a of faceArcsOut[fi]) arcs.add(a); setArcs.push([...arcs]); }
    const pf = new Set(); for (const st of stepsOut) if (presenceEnt[st[0]]) pf.add(st[3]); for (const fi of [...pf].sort((a, b) => a - b)) setArcs.push(faceArcsOut[fi].slice()); }
  for (let L = 0; L < LOD_M.length; L++) {
    let passes = 0, readded = 0, residual = 0, hidden = 0;
    for (let pass = 0; pass < 12; pass++) {
      passes++;
      let fixedAll = 0, crossAll = 0;
      for (const arcList of setArcs) {
      const segs = [];   // [arcIndex, ownIndexA, ownIndexB] for own arcs; core arcs as [arcIndex, -1, k]
      for (const ai of arcList) { const a = arcsOut[ai]; if (a.core) { const g = coreGeom(a, L); for (let k = 0; k + 1 < g.length; k++) segs.push([ai, -1, k, g]); } else { const idx = []; a.rank.forEach((r, i) => { if (r <= L) idx.push(i); }); for (let k = 0; k + 1 < idx.length; k++) segs.push([ai, idx[k], idx[k + 1], null]); } }
      const segPts = (s) => { const a = arcsOut[s[0]]; if (s[1] < 0) return [s[3][s[2]], s[3][s[2] + 1]]; const n = a.own.length; return [s[1] === 0 ? jAt(a.own[0], L) : a.own[s[1]], s[2] === n - 1 ? jAt(a.own[n - 1], L) : a.own[s[2]]]; };
      const idx = SegIndex.build(segs.length, CELL, (k) => { const [p, q] = segPts(segs[k]); return [p[0], p[1], q[0], q[1]]; });
      const crossing = [];
      idx.pairs((p, q) => { const [a, b] = segPts(segs[p]), [c, d] = segPts(segs[q]); if ((a[0] === c[0] && a[1] === c[1]) || (a[0] === d[0] && a[1] === d[1]) || (b[0] === c[0] && b[1] === c[1]) || (b[0] === d[0] && b[1] === d[1])) return; if (G.segmentsCross(vecQ(a), vecQ(b), vecQ(c), vecQ(d))) crossing.push([p, q]); });
      crossAll += crossing.length;
      for (const [p, q] of crossing) for (const s of [segs[p], segs[q]]) { if (s[1] < 0) continue; const a = arcsOut[s[0]]; let best = -1, bestSz = -1; for (let i = s[1] + 1; i < s[2]; i++) { const sz = a.rank[i]; if (sz > L && !(a.pinned && a.pinned.has(i)) && (best < 0 || a.rank[i] < bestSz)) { best = i; bestSz = a.rank[i]; } } if (best >= 0) { a.rank[best] = L; fixedAll++; continue; }
      }
      }
      readded += fixedAll;
      residual = crossAll;
      if (!crossAll) break;
      if (!fixedAll) break;
    }
    repairs.push({ level: L, passes, readded, hidden, residual });
  }
  report.planarityRepair = repairs;
  JPOS_OUT = JPOS;
  say(`planarity repair per level: ${repairs.map((r) => `L${r.level} ${r.readded} re-added, ${r.hidden} hidden over ${r.passes} passes, ${r.residual} residual`).join("; ")}`);
}
function vecQ(p) { return G.vec(p[0], p[1], Q); }

/* ================= 7. the period capitals (frozen/state-capitals.json — the retired state-capitals.js — by card → polity) ================= */
const FROZEN_CAPS = JSON.parse(fs.readFileSync(path.join(HERE, "frozen", "state-capitals.json"), "utf8"));
const cities = [];
{
  const capSpec = JSON.parse(fs.readFileSync(path.join(ROOT, ".claude", "state-capitals-spec.json"), "utf8"));
  const SC = FROZEN_CAPS.table || {};
  const ALIAS = { "ancient carthage": "carthage", "antigonid dynasty": "macedon" };
  const byTitle = new Map();
  for (const s of keptSeries) { byTitle.set(s.label.toLowerCase(), s.key); for (const n of s.rows.map((r) => r.name)) byTitle.set(n.toLowerCase(), s.key); }
  for (const [a, k] of Object.entries(ALIAS)) if (keptSeries.find((s) => s.key === k)) byTitle.set(a, k);
  const seen = new Set();
  const mapping = [];
  for (const [card, titles] of Object.entries(capSpec.cards)) {
    if (titles.length !== 1) continue;
    const key = byTitle.get(titles[0].toLowerCase()); if (!key) continue;
    const rows = SC[card]; if (!rows) continue;
    const s = keptSeries.find((x) => x.key === key); const span = [Math.min(...s.rows.map((r) => r.from)), Math.max(...s.rows.map((r) => r.to))];
    mapping.push({ card, title: titles[0], polity: key, rows: rows.length });
    for (const row of rows) {
      const [f0, t0r, name, lon, lat] = row;
      const from = Math.max(f0 == null ? span[0] : f0, span[0]), to = Math.min(t0r == null ? span[1] : t0r, span[1]);
      if (from > to) continue;
      const k = [key, name, from, to, lon, lat].join("|"); if (seen.has(k)) continue; seen.add(k);
      cities.push({ entity: "pol:" + key, name, lon, lat, from, to, card });
    }
  }
  cities.sort((a, b) => a.entity.localeCompare(b.entity) || a.from - b.from || a.name.localeCompare(b.name));
  report.capitals = { mapping, rows: cities.length };
  say(`period capitals: ${cities.length} rows from ${mapping.length} cards (${mapping.map((m) => m.card + "→" + m.polity).join(", ")})`);
}

/* ================= 8. write ================= */
const lon = [], lat = [], rank = [], arcRecs = [], coreRef = [];
for (const a of arcsOut) {
  const off = lon.length;
  if (a.core) { lon.push(a.va[0], a.vb[0]); lat.push(a.va[1], a.vb[1]); rank.push(0, 0); coreRef.push({ core: a.core.arc, from: a.core.from < 0 ? 0 : a.core.from, to: a.core.from < 0 ? 0 : a.core.to, segA: a.core.segA || 0, segB: a.core.segB || 0, empty: a.core.from < 0 }); }
  else { for (let i = 0; i < a.own.length; i++) { lon.push(a.own[i][0]); lat.push(a.own[i][1]); rank.push(a.rank[i]); } coreRef.push({ core: -1 }); }
  arcRecs.push({ offset: off, count: lon.length - off, kind: a.kind, source: a.source, minLod: 0, flags: a.flags || 0 });
}
// an empty core range (two junctions on one core segment) is written as from = to = 0 with the EMPTY bit in extra.arcEmpty
const arcEmpty = coreRef.map((r) => (r.empty ? 1 : 0));
const same = (p, seg) => { const l = []; for (let L = 0; L + 1 < LOD_M.length; L++) l.push([p[0], p[1], seg || 0]); return l; };   // a junction at a core arc's own endpoint never moves
const jpos = arcsOut.map((a) => (a.core ? { a: JPOS_OUT.get(a.va.join(",")) || same(a.va, a.core.segA), b: JPOS_OUT.get(a.vb.join(",")) || same(a.vb, a.core.segB) } : null));
const sources = [clioSrc, coastSrc, adm0Src].map((s) => ({ id: s.id, name: s.name, version: s.version, url: s.url, licence: s.licence, licenceUrl: s.licenceUrl, attribution: s.attribution, retrieved: s.retrieved, sha256: s.sha256 }));
// Folio's adaptations of Cliopatria's CC BY 4.0 rows (geometry-fixes.json): named here so the credits page, which reads only the files' headers, says so too
if (GEOM_FIXES.length) sources[0].adaptations = GEOM_FIXES.map((fx) => ({ series: fx.series, date: fx.date, what: fx.what, doc: "docs/atlas-v2-border-audit.md §7" }));
// the retrieval date of the capitals: the day the generated state-capitals.js was last committed, frozen with the table (Phase 5 deleted the file; docs/atlas-v2-phase5-plan.md §4.6)
const scRetrieved = FROZEN_CAPS.retrieved; if (!/^\d{4}-\d{2}-\d{2}$/.test(scRetrieved || "")) throw new Error("frozen/state-capitals.json has no retrieval date");
sources.push({ id: SRC.wd, name: "Wikidata — the period capitals of the pilot polities (each state's P36 statements with their qualifiers, via state-capitals.js)", version: "state-capitals.js as committed", url: "https://www.wikidata.org/", licence: "CC0", licenceUrl: "https://creativecommons.org/publicdomain/zero/1.0/", attribution: "Wikidata, CC0 1.0 (https://creativecommons.org/publicdomain/zero/1.0/).", retrieved: scRetrieved });
sources.push(headerSources([SRC.hosner])[0]);   // index 4 (SRC_IDX): the Yangshao and Longshan outlines
// index 5: Folio's own authored war extents. Not a third-party dataset: no url, no hash, no licence to honour beyond Folio's own; `authored` tells the credits page and the checker so
sources.push({ id: SRC.authored, name: "Folio’s own authored war extents (the `war.area` of the war cards — a dozen hand-placed points each, approximate by construction)", version: "as committed on the cards", url: "", licence: "Folio’s own content", licenceUrl: "", attribution: "Folio", retrieved: "", sha256: "", authored: true });
sources.push(headerSources([SRC.ohm])[0]);     // index 6: Lacedaemon (Sparta and Messenia)
sources.push(headerSources([SRC.usfs])[0]);    // index 7: the Royce cession polygons (the Western Confederacy)
sources.push(headerSources([SRC.sched])[0]);   // index 8: the Royce Schedule's treaty dates
sources.push(headerSources([SRC.control])[0]);   // index 9: the monthly maps of 1939–42 (the front line)
sources.push(headerSources([SRC.atlas])[0]);     // index 10: the fortnightly plates of 1943–45 (the front line)
if (sources.length !== 11 || sources[SRC_IDX.hosner].id !== SRC.hosner || sources[SRC_IDX.wd].id !== SRC.wd || sources[SRC_IDX.coast].id !== SRC.coast) throw new Error("the header source order no longer matches SRC_IDX");
const topology = {
  quantum: Q, lod: { intervals_m: LOD_M, note: "the core's three resident levels; a core-referencing arc takes the core's ranks" },
  generated: null, generator: "folio atlas-build: build-history.js (" + require("./package.json").version + ")", sources,
  entities: entsOut, steps: stepsOut, faceDelta: true,   // the face table delta-coded (atlas-format.js): a ring's consecutive coast pieces cost a byte each
  vertices: { lon, lat }, rank, arcs: arcRecs, faces: facesOut.map((f) => ({ entity: f.entity, source: f.src || 0, rings: f.rings })), coreRef, jpos,
  extra: {
    kindOf: "history", core: { file: "atlas/data/topology.bin", buildId, arcs: nCA },
    fronts: { unit: "date", note: "Dates are integers YYYYMMDD. A plate stands from its date until the next plate of its theatre, at most `stand` days; no source covers January–June 1943.", stand: FRONTS.stand, plates: FRONTS.plates, skipped: FRONTS.skipped, intervals: FRONTS.intervals, steps: FRONTS.steps },
    history: { scope: "The states Folio's cards teach — every card-linked polity series of polity-spec.json with Cliopatria rows, less the series the audit keeps as peoples — not every state of the period; and, as a PRESENCE layer drawn over them (no border, a soft edge), the peoples and cultures the cards teach: eight Cliopatria peoples, the Cyclades and Crete as their islands, the Yangshao and Longshan as outlines of dated sites.", presence: presenceSeries.map((x) => ({ key: x.key, kind: x.kind, source: x.srcId })), years: [Y0, Y1], band: BAND, series: keptSeries.map((s) => s.key), deferred, peoples: PEOPLES, nest: { share: NEST_SHARE, ratio: NEST_RATIO }, epochs: epochs.length, tolerances_m: TOLERANCE_M, d1_m: D1_M, d2_m: D2_M, d3_m: D3_M, run_factor: RUN_FACTOR, sliver_km2: SLIVER_KM2, sliver_width_m: SLIVER_WIDTH_M, classes: CLS, licence: "ODbL-1.0 as a whole: the file embeds junctions snapped onto OpenStreetMap geometry and references the OSM coast by arc id; Cliopatria's rows (CC BY 4.0) are the borders, with the attribution above kept; flagged for counsel (Phase 2a)." },
    faceClass: facesOut.map((f) => f.cls), arcClass: arcsOut.map((a) => a.cls), arcEmpty, cities,
    faceKm2: facesOut.map((f) => Math.round(f.km2)),
    faceAnchor: facesOut.map((f) => (f.anchor ? deg(f.anchor[0], f.anchor[1]) : null)),   // a point inside the face (the piece's first interior sample), for cards, tests and the fly-to
  },
};
const bytes = F.write(topology);
const sha = crypto.createHash("sha256").update(bytes).digest("hex");
say(`history.bin: ${bytes.length} bytes (${(bytes.length / 1e6).toFixed(3)} MB decimal), sha256 ${sha}`);
{ const h = F.read(bytes, { headerOnly: true }).header; console.log(`  header ${(JSON.stringify(h).length / 1024).toFixed(1)} KB; ` + Object.entries(h.sections).map(([k, v]) => `${k} ${(v.length / 1024).toFixed(1)} KB`).join(", ")); }
// the forecast: bytes per step × the steps of every Cliopatria series this build takes (rows in the spec's own years, YEAR_MIN..YEAR_MAX, the peoples now in)
let allSteps = 0, allNames = 0;
for (const [key, p] of Object.entries(spec.polities)) { if (!p.cliopatria) continue; for (const n of p.cliopatria) { const rows = byName.get(n) || []; allNames += rows.length ? 1 : 0; for (const f of rows) { let from = f.properties.FromYear, to = f.properties.ToYear; if (p.years) { from = Math.max(from, p.years[0]); to = Math.min(to, p.years[1]); } from = Math.max(from, YEAR_MIN); to = Math.min(to, YEAR_MAX); if (from <= to) allSteps++; } } }
const perStep = bytes.length / Math.max(1, stepsOut.length), forecast = perStep * allSteps;
const sourceSteps = allRows.length;
report.result = { entities: entsOut.length, steps: stepsOut.length, sourceRows: sourceSteps, faces: facesOut.length, contestedFaces: facesOut.filter((f) => f.cls === CLS.CONTESTED).length, nestedFaces: facesOut.filter((f) => f.cls === CLS.NESTED).length, arcs: arcsOut.length, arcsCoastRef: arcsOut.filter((a) => a.core && a.kind === KIND.COAST).length, arcsBorderRef: arcsOut.filter((a) => a.core && a.kind === KIND.BORDER).length, arcsOwn: arcsOut.filter((a) => !a.core).length, ownVertices: arcsOut.filter((a) => !a.core).reduce((s, a) => s + a.own.length, 0), bytes: bytes.length, sha256: sha, snaps: log.summary(), d1: stat.d1, d1Capped: stat.d1Capped, d2Capped: stat.d2Capped, d3Capped: stat.d3Capped, d2: stat.d2, d3: stat.d3, runsDropped: stat.runsDropped, runsBorder: stat.runsBorder, crossings: stat.crossings, slivers: stat.slivers, sliverKm2: Math.round(stat.sliverKm2), geometryFixes: GEOM_FIXES.map((fx) => ({ series: fx.series, name: fx.name, date: fx.date, rows: fx.used, km2From: +fx.km2From.toFixed(1), km2: +fx.km2.toFixed(1), insideM: Math.round(fx.edgeM), prevails: stat.fixPrevails || 0, prevailsKm2: Math.round(stat.fixPrevailsKm2 || 0), d2Refused: stat.d2Fixed || 0 })), unmappedGapPiecesOverEpochs: stat.unmappedPieces, unmappedGapKm2OverEpochs: Math.round(stat.unmappedKm2), continentRemainderPiecesOverEpochs: stat.remainderPieces || 0, refCut: stat.refCut || 0, series: keptSeries.map((s) => s.key), droppedSeries: droppedSeries.map((s) => s.key) };
{ const pd = stat.pieceDist || []; const gaps = pd.filter((p) => p[0] === 0), overlaps = pd.filter((p) => p[0] > 1); const h = (vals) => { const bins = [1, 5, 20, 50, 120, 300, 1000, 5000, Infinity]; const out = {}; let lo = 0; for (const b of bins) { out[(b === Infinity ? "beyond" : lo + "–" + b) + " km²"] = vals.filter((v) => v >= lo && v < b).length; lo = b; } return out; }; report.pieces = { gapsByArea: h(gaps.map((p) => p[1])), overlapsByArea: h(overlaps.map((p) => p[1])), overlapsOver120: overlaps.filter((p) => p[1] >= 120).length, gapsOver120: gaps.filter((p) => p[1] >= 120).length }; console.log("gap pieces by area: " + JSON.stringify(report.pieces.gapsByArea)); console.log("overlap pieces by area: " + JSON.stringify(report.pieces.overlapsByArea)); }
report.forecast = { bytesPerStep: Math.round(perStep), stepsPilot: stepsOut.length, sourceRowsPilot: sourceSteps, stepsAllSeries: allSteps, seriesWithRows: allNames, bytes: Math.round(forecast), mb: +(forecast / 1e6).toFixed(2), stop: forecast > 12e6 };
say(`forecast: ${Math.round(perStep)} bytes/step × ${allSteps} steps of every spec series = ${(forecast / 1e6).toFixed(2)} MB decimal${forecast > 12e6 ? " — OVER 12 MB: STOP RULE" : ""}`);
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "history-report.json"), JSON.stringify(report, null, 1));
log.write(path.join(OUT, "history-log.json"));
log.print();
if (!DRY) {
  fs.writeFileSync(path.join(OUT, "history.bin"), bytes);
  say("wrote out/history.bin");
  if (INSTALL) {
    if ((forecast > 12e6 || bytes.length > 12e6) && !argv.includes("--force")) { say(`the ${bytes.length > 12e6 ? "FILE is " + (bytes.length / 1e6).toFixed(2) + " MB" : "forecast exceeds 12 MB"}: not installed (the stop rule: propose windows before building further; --force overrides)`); process.exit(2); }   // 2d: the file itself, not only the forecast, is held to the owner's 12 MB
    fs.writeFileSync(path.join(DATA, "history.bin"), bytes);
    say("installed atlas/data/history.bin");
    // (Phase 5: the file:// twin of the 2b PILOT SLICE, atlas/data/history.bin.js, is gone; the war slice's twin is build-war-slice.js's)
    try { writeCoverage(topology, path.join(ROOT, "docs", "atlas-v2-coverage.md")); say("wrote docs/atlas-v2-coverage.md"); } catch (e) { say("coverage: " + e.message); }
    try { require("./build-credits.js").build({ install: true }); } catch (e) { say("credits: " + e.message); }
  }
}

/* ================= 9. the pilot slice (the file:// twin) and the coverage report ================= */
// the sub-file of the pilot's series inside the pilot's years and region (SLICE): steps → faces → arcs → vertices, reindexed; the
// header keeps everything but says what it is
function sliceOf(T) {
  const ents = new Set(SLICE.series.map((k) => "pol:" + k));
  const entOK = (e) => isSeriesKind(e.kind) ? ents.has(e.id) : e.partners.every((p) => ents.has(p));
  const steps = T.steps.filter((st) => entOK(T.entities[st[0]]) && st[2] >= SLICE.years[0] && st[1] <= SLICE.years[1]).map((st) => [st[0], Math.max(st[1], SLICE.years[0]), Math.min(st[2], SLICE.years[1]), st[3]]);
  const faceKeep = new Set(steps.map((st) => st[3])), faceMap = new Map(); const faces = []; T.faces.forEach((f, i) => { if (faceKeep.has(i)) { faceMap.set(i, faces.length); faces.push(f); } });
  const arcKeep = new Set(); for (const f of faces) for (const r of f.rings) for (const ref of r) arcKeep.add(Math.abs(ref) - 1);
  const arcMap = new Map(); const arcs = [], lon = [], lat = [], rank = [], coreRef = [], jpos = [], arcClass = [], arcEmpty = [];
  T.arcs.forEach((a, i) => { if (!arcKeep.has(i)) return; arcMap.set(i, arcs.length); const off = lon.length; for (let k = a.offset; k < a.offset + a.count; k++) { lon.push(T.vertices.lon[k]); lat.push(T.vertices.lat[k]); rank.push(T.rank[k]); } arcs.push(Object.assign({}, a, { offset: off })); coreRef.push(T.coreRef[i]); jpos.push(T.jpos[i]); arcClass.push(T.extra.arcClass[i]); arcEmpty.push(T.extra.arcEmpty[i]); });
  const entKeep = new Set(steps.map((st) => st[0])), entMap = new Map(); const entities = []; T.entities.forEach((e, i) => { if (entKeep.has(i)) { entMap.set(i, entities.length); entities.push(e); } });
  const extra = Object.assign({}, T.extra, { history: Object.assign({}, T.extra.history, { slice: "pilot", sliceNote: "This copy carries the pilot slice only — the Mediterranean and Near East, 550 BCE to 650 CE — because the full history file's file:// twin would pass the budget; open the Atlas over http for every state." }), faceClass: faces.map((f) => T.extra.faceClass[T.faces.indexOf(f)]), arcClass, arcEmpty, cities: T.extra.cities.filter((c) => ents.has(c.entity) && c.to >= SLICE.years[0] && c.from <= SLICE.years[1]), faceKm2: faces.map((f) => T.extra.faceKm2[T.faces.indexOf(f)]), faceAnchor: faces.map((f) => T.extra.faceAnchor[T.faces.indexOf(f)]) });
  return Object.assign({}, T, { entities, steps: steps.map((st) => [entMap.get(st[0]), st[1], st[2], faceMap.get(st[3])]).sort((a, b) => a[0] - b[0] || a[1] - b[1]), vertices: { lon, lat }, rank, arcs, faces: faces.map((f) => ({ entity: entMap.get(f.entity), source: f.source, rings: f.rings.map((r) => r.map((ref) => { const i = arcMap.get(Math.abs(ref) - 1); return ref > 0 ? i + 1 : -(i + 1); })) })), coreRef, jpos, extra });
}
// docs/atlas-v2-coverage.md: per century, the polities alive, the share of land outside Antarctica they cover, the unmapped
// remainder, the contested and nested shares — from the faces' own areas (faceKm2) and the core's land faces
function writeCoverage(T, file) {
  const R2 = G.R_EARTH_M * G.R_EARTH_M / 1e6, P = [0, 0, 1];
  const tri = (a, b) => { const num = G.dot(P, G.cross(a, b)); const den = 1 + G.dot(P, a) + G.dot(a, b) + G.dot(b, P); return 2 * Math.atan2(num, den); };
  const faceArea = (f) => { let A = 0; for (const ring of f.rings) for (const ref of ring) { const a = Math.abs(ref) - 1, s = core.arcOffset[a], e = core.arcOffset[a + 1]; let sum = 0; for (let i = s + 1; i < e; i++) sum += tri(coreVec(i - 1), coreVec(i)); A += ref > 0 ? sum : -sum; } A %= 4 * Math.PI; if (A < 0) A += 4 * Math.PI; return A * R2; };
  let landKm2 = 0, antKm2 = 0; const layer0 = CH.entities.map((e) => !e.parent);
  for (const f of core.faces) { if (!layer0[f.entity]) continue; const km2 = faceArea(f); if (CH.entities[f.entity].id === "adm0:ata") antKm2 += km2; else landKm2 += km2; }
  const rows = [];
  const ents = T.entities, km2 = T.extra.faceKm2;
  for (let c = Math.floor(Y0 / 100) * 100; c <= Y1; c += 100) {
    const y = c === 0 ? 1 : c;   // the year read: the century's first year (1 CE for the first century)
    const aliveAll = T.steps.filter((st) => st[1] <= y && st[2] >= y);
    const alive = aliveAll.filter((st) => !isPresenceKind(ents[st[0]].kind));   // a presence overlaps the states: it is not part of the land share
    const presentNames = [...new Set(aliveAll.filter((st) => ents[st[0]].kind === "people" || ents[st[0]].kind === "culture").map((st) => ents[st[0]].name))].sort();   // peoples and cultures only: an authored extent or a front is neither
    let covered = 0, contested = 0, nested = 0; const names = new Set();
    for (const st of alive) { const e = ents[st[0]], a = km2[st[3]] || 0; covered += a; if (e.kind === "contested") { contested += a; for (const p of e.partners) names.add(p); } else if (e.kind === "nested") { nested += a; names.add(e.partners[0]); names.add(e.partners[1]); } else names.add(e.id); }
    rows.push({ year: y, polities: [...names].map((id) => { const e = ents.find((x) => x.id === id); return e ? e.name : id; }).sort(), presences: presentNames, covered, contested, nested });
  }
  const fmtY = (y) => (y < 0 ? (-y) + " BCE" : y + " CE");
  const pct = (v) => (100 * v / landKm2).toFixed(1) + " %";
  const thin = rows.filter((r) => r.covered / landKm2 < 0.02).map((r) => r.year);
  const runs = []; for (const y of thin) { const last = runs[runs.length - 1]; if (last && last[1] === y - 100) last[1] = y; else runs.push([y, y]); }
  const peak = rows.reduce((p, r) => (r.covered > p.covered ? r : p), rows[0]);
  const lines = [
    "# Atlas v2 — what the historical layer covers, century by century",
    "",
    "GENERATED by `.claude/atlas-build/build-history.js --install` (Phase 2b; the presence layer, Phase 2c) from `atlas/data/history.bin` — never edit by hand; rebuild instead.",
    "",
    "The historical layer draws **the states Folio's cards teach** — the card-linked polity series of `.claude/polity-spec.json` that Cliopatria v0.2.0 carries, " + T.entities.filter((e) => e.kind === "polity").length + " of them — not every state of the period. **Peoples and cultures (Phase 2c)** — " + T.entities.filter((e) => isPresenceKind(e.kind)).length + " series: eight Cliopatria peoples, the Cyclades and Crete as their islands, the Yangshao and Longshan as outlines of dated sites — are a presence drawn over the states (no border, a soft edge), so they are named in the last column and are NOT counted in the land share. The table reads each century at its first year (1 CE for the first century CE) and measures the land the alive faces cover against the land outside Antarctica in the core partition (" + Math.round(landKm2 / 1e6 * 10) / 10 + " million km²; Antarctica's " + Math.round(antKm2 / 1e6 * 10) / 10 + " million km² left out). \"Contested\" is land two polities claim in that year; \"nested\" is a member drawn inside its overlord.",
    "",
    "**Where the layer is thin.** " + (runs.length ? "Under 2 % of the land is mapped in " + runs.map(([a, b]) => (a === b ? fmtY(a) : fmtY(a) + " – " + fmtY(b))).join(", ") + ": the cards' states are few and small there, or Cliopatria has no row for them." : "No century falls under 2 % of the land.") + " The fullest century is " + fmtY(peak.year) + " (" + pct(peak.covered) + " of the land, " + peak.polities.length + " polities). Everywhere else the plain land is not \"no state\": it is a state no card teaches yet, or one Cliopatria does not draw.",
    "",
    "| century begins | polities alive | land covered | contested | nested | who | peoples and cultures (a presence over the states) |",
    "|---|---|---|---|---|---|---|",
  ];
  for (const r of rows) lines.push(`| ${fmtY(r.year)} | ${r.polities.length} | ${pct(r.covered)} | ${pct(r.contested)} | ${pct(r.nested)} | ${r.polities.join(", ") || "—"} | ${r.presences.join(", ") || "—"} |`);
  lines.push("", "Deferred to later phases (not in this file): " + deferred.map((d) => "`" + d.key + "` (" + d.why + ")").join(", ") + ".", "");
  // the inventory (Phase 2b, deliverable 1): every series of polity-spec.json — its kind, its years in the file, its cards, built or deferred
  lines.push("## The inventory: every series of `polity-spec.json`", "", "| series | kind | Cliopatria names | years in the file | steps | cards | state |", "|---|---|---|---|---|---|---|");
  const entByKey = new Map(T.entities.filter((e) => isSeriesKind(e.kind)).map((e) => [e.id.slice(4), e]));
  for (const [key, p] of Object.entries(spec.polities)) {
    const d = deferred.find((x) => x.key === key); const e = entByKey.get(key);
    const kind = p.cliopatria ? (p.cliopatria.length > 1 ? "assembled from " + p.cliopatria.length + " Cliopatria series" : "Cliopatria state") : p.coast ? "coastline" : p.sites ? "site hull" : "—";
    const steps = e ? T.steps.filter((st) => T.entities[st[0]] === e).length : 0;
    lines.push(`| \`${key}\` | ${kind}${PEOPLES.includes(key) ? " (a people: drawn as a presence)" : CULTURES.includes(key) ? " (a culture: drawn as a presence)" : ""} | ${(p.cliopatria || []).join(", ") || "—"} | ${e && e.span ? fmtY(e.span[0]) + " – " + fmtY(e.span[1]) : "—"} | ${steps || "—"} | ${(cardsOf.get(key) || []).join(", ") || "—"} | ${d ? "deferred: " + d.why : "built"} |`);
  }
  lines.push("");
  lines.push("## The 24 war sides that resolved to no entity (Phase 2c's inventory) and what Phase 2d did with each", "", "The places registry's migration (`docs/atlas-places-report.md`) listed 24 war sides — an authored extent or a named side of a war card — that named no entity of this file. Phase 2d resolved each as far as an open source allows and **built nothing from a source that is not clearly open**: a side is **built** (a polity series answers it: Cliopatria's rows, or an assembly of series — membership by date over entities, never a new shape), **derived** (an extent made from a pinned open source: `.claude/atlas-build/war-extents.json`, hashes held against `sources.json`), **authored** (kept as the war card's own hand-drawn extent — an entity of kind `extent`, drawn as a soft, borderless wash in the side's tint and said on its card to be Folio's own approximation — and **deferred**, with the reason) or **unresolved** (named by the card's keys and drawn by nothing, said on the place card). The same table is held by `.claude/test-war-sides.js`.", "", "| war side | cards | status | what draws it | reason / audit batch |", "|---|---|---|---|---|");
  for (const [side, cards, status, how, why] of WAR_SIDES_2D) lines.push(`| ${side} | ${cards} | ${status} | ${how} | ${why} |`);lines.push("");
  fs.writeFileSync(file, lines.join("\n"));
}
