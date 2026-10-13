/* lib/history-model.js — the READER's output of a history file turned back into the WRITER's model (atlas-format.js `write`), so a file can be read, cut and written again
   without the 923 MB of sources the build needs (Phase 4c: build-war-slice.js). Identity is the test: `fromRead(read(bytes))` written again is `bytes`, byte for byte
   (build-war-slice.js --roundtrip proves it on the committed history.bin before it cuts anything). */
"use strict";
function fromRead(R) {
  const H = R.header, nA = R.arcOffset.length - 1, levels = R.lodCount - 1;
  const arcs = new Array(nA), coreRef = new Array(nA), jpos = R.jposA ? new Array(nA) : null;
  for (let i = 0; i < nA; i++) {
    arcs[i] = { offset: R.arcOffset[i], count: R.arcOffset[i + 1] - R.arcOffset[i], kind: R.arcKind[i], source: R.arcSource[i], minLod: R.arcMinLod[i], flags: R.arcFlags[i] };
    coreRef[i] = R.coreArc[i] < 0 ? { core: -1 } : { core: R.coreArc[i], from: R.coreFrom[i], to: R.coreTo[i], segA: R.coreSegA[i], segB: R.coreSegB[i] };
    if (jpos && R.coreArc[i] >= 0) {
      const a = [], b = [];
      for (let L = 0; L < levels; L++) { const k = i * levels + L; a.push([R.jposA[2 * k], R.jposA[2 * k + 1], R.jsegA[k]]); b.push([R.jposB[2 * k], R.jposB[2 * k + 1], R.jsegB[k]]); }
      jpos[i] = { a, b };
    }
  }
  return {
    quantum: H.quantum, lod: H.lod, generated: H.generated, generator: H.generator, sources: H.sources,
    entities: H.entities, steps: H.steps, faceDelta: H.faceRefs === "delta",
    vertices: { lon: R.lon, lat: R.lat }, rank: R.rank, arcs,
    faces: R.faces.map((f) => ({ entity: f.entity, source: f.source, rings: f.rings })), coreRef, jpos,
    extra: H,   // the whole header: `write` lays its own fields over it in place, so the key order is the file's
  };
}
module.exports = { fromRead };
