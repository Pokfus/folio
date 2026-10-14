#!/usr/bin/env node
/* build-war-slice.js — the WAR-WINDOW SLICE of the history file: atlas/data/history-wars.bin and its file:// twin (Phase 4c, the owner's decision 3).

     node .claude/atlas-build/build-war-slice.js [--install] [--dry] [--check] [--roundtrip]      (from the repo root)

   WHY. A war card's window (atlas/atlas-windows.js) draws ONE year of ONE war — the middle of the war's years — and needs the file's faces for that year, and the faces of the war's own sides
   for the frame and the names. It waited for all of atlas/data/history.bin (9.1 MB, parsed by the worker before the first frame: 67 s on the phone profile of Phase 4b). The Atlas page, Find it's
   area round and the Personal Atlas still read the whole file; a war window reads this one.

   WHAT IT KEEPS (from the committed history.bin and atlas/data/wars.js; nothing is recomputed and nothing is invented):
     A  every step alive in a war's display year — the middle year, `Math.round((y0 + y1) / 2)`, the one atlas-windows.js uses — of every war in the table, except the presence layer (peoples,
        cultures, authored extents: a window draws them only as a war's own side) and the Second World War front (a window never draws it): the other states a window draws plain;
     B  every step that overlaps a war's years, of each entity either side names (`m` members and the authored extent `x`): the frame (`warFrame`) and the names (`warSidesOf`) read the FIRST
        step of a side in those years, so all of them are here, whole;
   and the faces those steps stand on, the arcs those faces walk and — the one subtle thing — the arcs that give a kept own arc's endpoint its junction: an own arc whose endpoint lies on a coast
   junction is moved with the level (atlas-format.js `historyJunctions` finds the junction by POSITION among every core-referencing arc of the file), so the arc that holds that junction is kept
   too, even when no kept face walks it. Entities are kept in the file's own order, so ids and the entity index order are as in the full file.

   HOW IT IS CUT. `lib/history-model.js` turns the reader's output back into the writer's model (`--roundtrip` proves, on the committed history.bin, that writing it again is byte-identical), the
   sub-model is indexed anew (entities, faces, arcs, vertices; the header's per-face and per-arc tables and the capitals follow), and `atlas-format.js` writes it. The header says what it is
   (`history.slice: "wars"`, the full file's sha256, the wars and the years). The build is deterministic.

   WHAT --check PROVES (CI's fast job, offline): the installed slice is byte-identical to a fresh cut of the committed history.bin; its twin decodes to it; it was built on the same core
   (topology.bin's build id); for EVERY war in the table, the states alive in its display year are exactly the full file's (entity ids and the geometry of every face at all three
   levels, own arcs' moved junctions included), and each side's first step in the war's years is the full file's; the window's display-year formula is the one this file uses; and the slice
   is inside its budget (BUDGET_BYTES; the four twins together stay under TWINS_MAX: 13.25 MB today against the owner's 12 MB rule for the first three — his decision). The credits page lists it (build-credits.js reads its header). */
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const F = require("./lib/format.js");
const { fromRead } = require("./lib/history-model.js");
const Tw = require("./lib/twin.js");

const HERE = __dirname, ROOT = path.join(HERE, "..", ".."), DATA = path.join(ROOT, "atlas", "data"), OUT = path.join(HERE, "out");
const argv = process.argv.slice(2), has = (f) => argv.includes(f);
const FULL = path.join(DATA, "history.bin"), SLICE = path.join(DATA, "history-wars.bin"), CORE = path.join(DATA, "topology.bin");
const BUDGET_BYTES = 2.5e6;   // the slice file; its twin is base64 of it
const TWINS_MAX = 13.5e6;   // every twin together (topology, water, the pilot history, this slice); the owner's Phase 1d rule was 12 MB for the first three (10.9 MB now) — see the header's last paragraph
const sha = (b) => crypto.createHash("sha256").update(b).digest("hex");
const say = (m) => console.log(m);
const NOT_DRAWN = new Set(["people", "culture", "front", "extent"]);

/* the display year of a war window: the one expression atlas-windows.js uses */
const displayYear = (w) => Math.round((w.y[0] + w.y[1]) / 2);

function loadWars() {
  const sandbox = { window: {} }; const src = fs.readFileSync(path.join(DATA, "wars.js"), "utf8");
  new Function("window", src)(sandbox.window);
  return sandbox.window.ATLAS_WARS;
}

/* the cut: the committed history file's bytes → { bytes, report } */
function cut(fullBytes, wars) {
  const R = F.read(new Uint8Array(fullBytes)), H = R.header, M = fromRead(R);
  const nA = M.arcs.length, ents = H.entities, entIx = new Map(ents.map((e, i) => [e.id, i]));
  const years = new Set(), sides = [];
  for (const [id, w] of Object.entries(wars.wars)) {
    years.add(displayYear(w));
    for (const k of ["v", "l"]) for (const eid of (w[k].m || []).map((m) => m[0]).concat(w[k].x ? [w[k].x] : [])) {
      if (!entIx.has(eid)) throw new Error(`war ${id}: side ${k} names ${eid}, which history.bin does not carry`);
      sides.push({ ei: entIx.get(eid), y0: w.y[0], y1: w.y[1] });
    }
  }
  const yearList = [...years];
  const stepKeep = new Array(M.steps.length).fill(false);
  M.steps.forEach((st, i) => {
    const [ei, from, to] = st;
    if (!NOT_DRAWN.has(ents[ei].kind) && yearList.some((y) => from <= y && y <= to)) stepKeep[i] = true;
    for (const s of sides) if (s.ei === ei && to >= s.y0 && from <= s.y1) stepKeep[i] = true;
  });
  const keptSteps = M.steps.filter((_, i) => stepKeep[i]);
  const faceKeep = new Set(keptSteps.map((st) => st[3]));
  const arcKeep = new Set();
  M.faces.forEach((f, i) => { if (faceKeep.has(i)) for (const r of f.rings) for (const ref of r) arcKeep.add(Math.abs(ref) - 1); });
  // the junctions of own arcs' endpoints: the full file's table by position, last writer wins as in historyJunctions; keep the arc that wrote each one a kept own arc's endpoint needs
  const junctionArc = new Map();
  for (let i = 0; i < nA; i++) { if (R.coreArc[i] < 0) continue; const s = R.arcOffset[i], e = R.arcOffset[i + 1]; if (R.coreSegA && R.coreSegA[i]) junctionArc.set(R.lon[s] + "," + R.lat[s], i); if (R.coreSegB && R.coreSegB[i]) junctionArc.set(R.lon[e - 1] + "," + R.lat[e - 1], i); }
  let junctionArcs = 0;
  for (const a of [...arcKeep]) { if (R.coreArc[a] >= 0) continue; const s = R.arcOffset[a], e = R.arcOffset[a + 1]; for (const v of [s, e - 1]) { const j = junctionArc.get(R.lon[v] + "," + R.lat[v]); if (j != null && !arcKeep.has(j)) { arcKeep.add(j); junctionArcs++; } } }
  // entities: those the kept steps and faces name, and their partners (a contested or nested face names the entities it is made of)
  const entKeep = new Set(keptSteps.map((st) => st[0]));
  M.faces.forEach((f, i) => { if (faceKeep.has(i)) entKeep.add(f.entity); });
  for (const e of [...entKeep]) for (const p of ents[e].partners || []) if (entIx.has(p)) entKeep.add(entIx.get(p));
  const entMap = new Map(), entities = []; ents.forEach((e, i) => { if (entKeep.has(i)) { entMap.set(i, entities.length); entities.push(e); } });
  const faceMap = new Map(), faces = [], faceOld = []; M.faces.forEach((f, i) => { if (faceKeep.has(i)) { faceMap.set(i, faces.length); faceOld.push(i); faces.push(f); } });
  const arcMap = new Map(), arcOld = []; for (let i = 0; i < nA; i++) if (arcKeep.has(i)) { arcMap.set(i, arcOld.length); arcOld.push(i); }
  let nV = 0; for (const i of arcOld) nV += M.arcs[i].count;
  const lon = new Int32Array(nV), lat = new Int32Array(nV), rank = new Uint8Array(nV), arcs = [], coreRef = [], jpos = M.jpos ? [] : null;
  let off = 0;
  for (const i of arcOld) { const a = M.arcs[i]; for (let k = 0; k < a.count; k++) { lon[off + k] = M.vertices.lon[a.offset + k]; lat[off + k] = M.vertices.lat[a.offset + k]; rank[off + k] = M.rank[a.offset + k]; } arcs.push(Object.assign({}, a, { offset: off })); off += a.count; coreRef.push(M.coreRef[i]); if (jpos) jpos.push(M.jpos[i]); }
  const stepsOut = keptSteps.map((st) => [entMap.get(st[0]), st[1], st[2], faceMap.get(st[3])]);
  const facesOut = faces.map((f) => ({ entity: entMap.get(f.entity), source: f.source, rings: f.rings.map((r) => Int32Array.from(r, (ref) => { const j = arcMap.get(Math.abs(ref) - 1); return ref > 0 ? j + 1 : -(j + 1); })) }));
  const keptIds = new Set(entities.map((e) => e.id));
  const extra = Object.assign({}, H);
  delete extra.fronts;   // the Second World War front is not drawn in a window; its plates are the largest block of the header
  extra.history = Object.assign({}, H.history, {
    slice: "wars",
    sliceNote: "This is the war-window slice of atlas/data/history.bin: the states alive in each war's display year (the middle of its years) and the sides of each war in the war's years — what a card window needs, not the whole history. The Atlas page reads the full file.",
    sliceOf: { file: "atlas/data/history.bin", sha256: sha(fullBytes), bytes: fullBytes.length, steps: M.steps.length, faces: M.faces.length, arcs: nA }, wars: Object.keys(wars.wars).length, warYears: yearList.sort((a, b) => a - b),
  });
  extra.faceClass = faceOld.map((i) => H.faceClass[i]); extra.faceKm2 = faceOld.map((i) => H.faceKm2[i]); extra.faceAnchor = faceOld.map((i) => H.faceAnchor[i]);
  extra.arcClass = arcOld.map((i) => H.arcClass[i]); extra.arcEmpty = arcOld.map((i) => H.arcEmpty[i]);
  extra.cities = H.cities.filter((c) => keptIds.has(c.entity));
  const model = { quantum: M.quantum, lod: M.lod, generated: null, generator: "folio atlas-build: build-war-slice.js (" + require("./package.json").version + ")", sources: M.sources, entities, steps: stepsOut, faceDelta: M.faceDelta, vertices: { lon, lat }, rank, arcs, faces: facesOut, coreRef, jpos, extra };
  const bytes = F.write(model);
  return { bytes, report: { steps: stepsOut.length, of: M.steps.length, faces: faces.length, facesOf: M.faces.length, arcs: arcOld.length, arcsOf: nA, vertices: nV, verticesOf: M.vertices.lon.length, entities: entities.length, entitiesOf: ents.length, junctionArcs, years: yearList.length, wars: Object.keys(wars.wars).length } };
}

/* the faithful-subset proof */
function proof(fullBytes, sliceBytes, wars) {
  const fails = [];
  const A = F.read(new Uint8Array(fullBytes)), B = F.read(new Uint8Array(sliceBytes)), C = F.read(new Uint8Array(fs.readFileSync(CORE)));
  if (!B.header.history || B.header.history.slice !== "wars") fails.push("the slice's header does not say it is the war slice");
  if (B.header.core.buildId !== C.header.buildId || A.header.core.buildId !== C.header.buildId) fails.push(`built on core ${B.header.core.buildId}, topology.bin is ${C.header.buildId}`);
  if (B.header.history.sliceOf.sha256 !== sha(fullBytes)) fails.push("the slice was cut from another history.bin than the committed one");
  if (JSON.stringify(B.header.sources) !== JSON.stringify(A.header.sources)) fails.push("the sources header differs from history.bin's");
  const jA = F.historyJunctions(A, C), jB = F.historyJunctions(B, C);
  const geom = (R, arcEmpty, J, arc, L) => F.historyArcGeometry(R, C, arc, L, J, arcEmpty);
  const faceGeom = (R, arcEmpty, J, fi) => { let s = ""; for (let L = 0; L < R.lodCount; L++) { s += "|L" + L; for (const ring of R.faces[fi].rings) { s += "/"; for (const ref of ring) s += (ref > 0 ? "+" : "-") + JSON.stringify(geom(R, arcEmpty, J, Math.abs(ref) - 1, L)); } } return s; };
  const idA = A.header.entities.map((e) => e.id), idB = B.header.entities.map((e) => e.id);
  const stepsA = new Map(), stepsB = new Map();
  for (const st of A.header.steps) { const id = idA[st[0]]; (stepsA.get(id) || stepsA.set(id, []).get(id)).push(st); }
  for (const st of B.header.steps) { const id = idB[st[0]]; (stepsB.get(id) || stepsB.set(id, []).get(id)).push(st); }
  const emptyA = A.header.arcEmpty, emptyB = B.header.arcEmpty; void emptyA; void emptyB;
  const cacheA = new Map(), cacheB = new Map();
  const gA = (fi) => { let v = cacheA.get(fi); if (v == null) cacheA.set(fi, v = faceGeom(A, A.header.arcEmpty, jA, fi)); return v; };
  const gB = (fi) => { let v = cacheB.get(fi); if (v == null) cacheB.set(fi, v = faceGeom(B, B.header.arcEmpty, jB, fi)); return v; };
  let checkedFaces = 0, checkedSides = 0;
  for (const [id, w] of Object.entries(wars.wars)) {
    const y = displayYear(w);
    // A: the states alive in the display year are exactly the full file's
    for (const [eid, list] of stepsA) {
      const kind = A.header.entities[idA.indexOf(eid)].kind; if (NOT_DRAWN.has(kind)) continue;
      const a = list.filter((st) => st[1] <= y && y <= st[2]), b = (stepsB.get(eid) || []).filter((st) => st[1] <= y && y <= st[2]);
      if (a.length !== b.length) { fails.push(`${id} @${y}: ${eid} has ${a.length} steps alive in the full file, ${b.length} in the slice`); continue; }
      a.forEach((st, i) => { checkedFaces++; if (st[1] !== b[i][1] || st[2] !== b[i][2]) fails.push(`${id} @${y}: ${eid}'s step years differ`); else if (gA(st[3]) !== gB(b[i][3])) fails.push(`${id} @${y}: ${eid}'s face differs at some level`); else if (A.header.faceClass[st[3]] !== B.header.faceClass[b[i][3]]) fails.push(`${id}: ${eid}'s face class differs`); });
    }
    // B: each side's steps over the war's years, the first of them being what the frame and the names read
    for (const k of ["v", "l"]) for (const eid of (w[k].m || []).map((m) => m[0]).concat(w[k].x ? [w[k].x] : [])) {
      const a = (stepsA.get(eid) || []).filter((st) => st[2] >= w.y[0] && st[1] <= w.y[1]), b = (stepsB.get(eid) || []).filter((st) => st[2] >= w.y[0] && st[1] <= w.y[1]);
      if (a.length !== b.length) { fails.push(`${id}: side ${k} ${eid} has ${a.length} steps in the war's years, the slice ${b.length}`); continue; }
      a.forEach((st, i) => { checkedSides++; if (st[1] !== b[i][1] || st[2] !== b[i][2] || gA(st[3]) !== gB(b[i][3])) fails.push(`${id}: side ${k} ${eid}'s step ${i} differs`); });
    }
  }
  // the window's own formula for the display year is this file's
  const aw = fs.readFileSync(path.join(ROOT, "atlas", "atlas-windows.js"), "utf8");
  if (!aw.includes("warYear = Math.round((WT.y[0] + WT.y[1]) / 2)")) fails.push("atlas-windows.js no longer computes the display year as Math.round((y0 + y1) / 2)");
  if (B.header.entities.some((e) => e.kind === "front")) fails.push("the slice carries a front entity");
  return { fails, checkedFaces, checkedSides };
}

function writeAll(bytes) {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, "history-wars.bin"), bytes);
  fs.writeFileSync(SLICE, bytes);
  const tw = Tw.writeTwin(SLICE, { name: "history-wars.bin" });
  return tw;
}

(function main() {
  const fullBytes = fs.readFileSync(FULL);
  if (has("--roundtrip")) {
    const out = F.write(fromRead(F.read(new Uint8Array(fullBytes))));
    const same = sha(out) === sha(fullBytes);
    say(`round trip of history.bin (${fullBytes.length} bytes): ${same ? "byte-identical" : "DIFFERENT"}`); process.exit(same ? 0 : 1);
  }
  const wars = loadWars();
  const { bytes, report } = cut(fullBytes, wars);
  say(`war slice: ${bytes.length} bytes (${(bytes.length / 1e6).toFixed(3)} MB) of ${fullBytes.length} (${(100 * bytes.length / fullBytes.length).toFixed(1)} %), sha256 ${sha(bytes)}`);
  say(`  steps ${report.steps}/${report.of}, faces ${report.faces}/${report.facesOf}, arcs ${report.arcs}/${report.arcsOf} (${report.junctionArcs} kept for a junction only), vertices ${report.vertices}/${report.verticesOf}, entities ${report.entities}/${report.entitiesOf}; ${report.wars} wars, ${report.years} display years`);
  const p = proof(fullBytes, bytes, wars);
  say(`  proof: ${p.checkedFaces} state faces and ${p.checkedSides} side steps compared with the full file at three levels — ${p.fails.length ? p.fails.length + " FAILED" : "all equal"}`);
  const problems = p.fails.slice(0, 12);
  if (bytes.length > BUDGET_BYTES) problems.push(`the slice is ${bytes.length} bytes, over its ${BUDGET_BYTES} budget`);
  if (has("--check")) {
    if (!fs.existsSync(SLICE)) problems.push("atlas/data/history-wars.bin is missing — run: node .claude/atlas-build/build-war-slice.js --install");
    else if (sha(fs.readFileSync(SLICE)) !== sha(bytes)) problems.push("atlas/data/history-wars.bin lags history.bin or wars.js — run: node .claude/atlas-build/build-war-slice.js --install");
    const t = Tw.checkTwin(SLICE); if (!t.ok) problems.push("the twin of the slice: " + t.reason);
    else say(`  twin: ${t.twinBytes} bytes, identical to the slice`);
    const full = ["topology.bin.js", "water.bin.js", "history.bin.js", "history-wars.bin.js"].map((f) => { try { return fs.statSync(path.join(DATA, f)).size; } catch (e) { return 0; } }).reduce((a, b) => a + b, 0);
    say(`  the file:// twins together: ${(full / 1e6).toFixed(2)} MB (the owner's rule of Phase 1d was 12 MB for the three twins that existed then; this fourth, the slice's, takes the total past it — reported for the owner's decision, held here at ${TWINS_MAX / 1e6} MB)`);
    if (full > TWINS_MAX) problems.push(`the four twins together are ${(full / 1e6).toFixed(2)} MB, over ${TWINS_MAX / 1e6} MB`);
    if (problems.length) { for (const m of problems) console.error("FAIL " + m); process.exit(1); }
    say("ok"); return;
  }
  if (problems.length) { for (const m of problems) console.error("FAIL " + m); process.exit(1); }
  if (has("--dry")) return;
  if (has("--install")) { const tw = writeAll(bytes); say(`installed atlas/data/history-wars.bin and its twin (${tw.twinBytes} bytes)`); try { require("./build-credits.js").build({ install: true }); } catch (e) { say("credits: " + e.message); } }
  else { fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, "history-wars.bin"), bytes); say("wrote out/history-wars.bin (--install copies it into atlas/data/ with its twin)"); }
})();
