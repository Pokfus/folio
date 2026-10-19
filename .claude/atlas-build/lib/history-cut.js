/* lib/history-cut.js — cut a history file down to the steps a caller keeps (build-war-slice.js, build-ww2-slice.js).

   `cutModel(R, M, stepKeep, opts)`: R is `atlas-format.js` read of the committed history.bin, M its `fromRead` model, `stepKeep` a boolean per step of M.steps. It keeps the faces those steps
   stand on, the arcs those faces walk and — the one subtle thing — the arcs that give a kept own arc's endpoint its junction: an own arc whose endpoint lies on a coast junction is moved with the level
   (atlas-format.js `historyJunctions` finds the junction by POSITION among every core-referencing arc of the file), so the arc that holds that junction is kept too, even when no kept face walks it.
   Entities are kept in the file's own order, so ids and the entity index order are as in the full file. The header's per-face and per-arc tables, the cities and the capitals follow the cut;
   `opts.header(extra, info)` lays the slice's own fields over the copy of the full header (`info` has the kept faces', arcs' and entities' old indices); `opts.generator` names the script.
   `opts.arcVertices(oldArc)` may return the local indices (ascending, endpoints included) of the vertices of an OWN arc to keep, or null for all of them (build-ww2-slice.js simplifies the front's soft arcs). */
"use strict";
const F = require("./format.js");

function cutModel(R, M, stepKeep, opts) {
  const H = R.header, nA = M.arcs.length, ents = H.entities, entIx = new Map(ents.map((e, i) => [e.id, i]));
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
  const vkeep = arcOld.map((i) => (opts.arcVertices ? opts.arcVertices(i) : null));   // null: every vertex
  let nV = 0; arcOld.forEach((i, k) => { nV += vkeep[k] ? vkeep[k].length : M.arcs[i].count; });
  const lon = new Int32Array(nV), lat = new Int32Array(nV), rank = new Uint8Array(nV), arcs = [], coreRef = [], jpos = M.jpos ? [] : null;
  let off = 0;
  arcOld.forEach((i, ai) => {
    const a = M.arcs[i], keep = vkeep[ai], n = keep ? keep.length : a.count;
    for (let k = 0; k < n; k++) { const src = a.offset + (keep ? keep[k] : k); lon[off + k] = M.vertices.lon[src]; lat[off + k] = M.vertices.lat[src]; rank[off + k] = M.rank[src]; }
    arcs.push(Object.assign({}, a, { offset: off, count: n })); off += n; coreRef.push(M.coreRef[i]); if (jpos) jpos.push(M.jpos[i]);
  });
  const stepsOut = keptSteps.map((st) => [entMap.get(st[0]), st[1], st[2], faceMap.get(st[3])]);
  const facesOut = faces.map((f) => ({ entity: entMap.get(f.entity), source: f.source, rings: f.rings.map((r) => Int32Array.from(r, (ref) => { const j = arcMap.get(Math.abs(ref) - 1); return ref > 0 ? j + 1 : -(j + 1); })) }));
  const keptIds = new Set(entities.map((e) => e.id));
  const extra = Object.assign({}, H);
  extra.faceClass = faceOld.map((i) => H.faceClass[i]); extra.faceKm2 = faceOld.map((i) => H.faceKm2[i]); extra.faceAnchor = faceOld.map((i) => H.faceAnchor[i]);
  extra.arcClass = arcOld.map((i) => H.arcClass[i]); extra.arcEmpty = arcOld.map((i) => H.arcEmpty[i]);
  extra.cities = H.cities.filter((c) => keptIds.has(c.entity));
  if (opts.header) opts.header(extra, { faceOld, arcOld, entities });
  const model = { quantum: M.quantum, lod: M.lod, generated: null, generator: opts.generator, sources: M.sources, entities, steps: stepsOut, faceDelta: M.faceDelta, vertices: { lon, lat }, rank, arcs, faces: facesOut, coreRef, jpos, extra };
  const bytes = F.write(model);
  return { bytes, report: { steps: stepsOut.length, of: M.steps.length, faces: faces.length, facesOf: M.faces.length, arcs: arcOld.length, arcsOf: nA, vertices: nV, verticesOf: M.vertices.lon.length, entities: entities.length, entitiesOf: ents.length, junctionArcs } };
}
module.exports = { cutModel };
