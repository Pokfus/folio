/* lib/historyq.js — "what is at (lon, lat) in year y" on the BUILT step topology (atlas/data/history.bin), for the Node tests (Atlas v2 Phase 2d).

   check-history.js has this machinery inline for its own assertions; the war-side assertions of test-war-sides.js need the same question asked of
   a different set of entities (the presence layer's authored extents too), so it lives here once:

       const H = require("./lib/historyq.js").open();           // reads atlas/data/history.bin and the committed core
       H.entityAt(lon, lat, year, { layer: "states" | "presence" | "all" })  → [header entity…] whose face holds the point in that year
       H.holds(entityId, found)       → does one of `found` hold `entityId` (a contested or nested face holds its partners' land)
       H.aliveYears(entityId)         → the [from, to] of every step of an entity

   A point is tested against the finest level's rings (the coast references walked, the own arcs in their rank order), with the longitude wrapped, as
   the checker does. Slow to open (the arcs of every face the question touches are realised on demand and kept). */
"use strict";
const fs = require("fs"), path = require("path");
const F = require("./format.js");
const ROOT = path.join(__dirname, "..", "..", "..");

function open(opts) {
  opts = opts || {};
  const file = opts.file || path.join(ROOT, "atlas", "data", "history.bin");
  const T = F.read(new Uint8Array(fs.readFileSync(file)));
  const C = F.readFile(opts.core || path.join(ROOT, "atlas", "data", "topology.bin"));
  const H = T.header, Q = T.quantum, LODS = T.lodCount, X180 = Math.round(180 / Q);
  const JUNC = F.historyJunctions(T, C);
  const geom = (a, L) => F.historyArcGeometry(T, C, a, L, JUNC, H.arcEmpty);
  const PRES = new Set(["people", "culture", "extent"]);
  const isPres = (ei) => { const e = H.entities[ei]; return !!e && PRES.has(e.kind); };
  const stepsByEntity = new Map();
  for (const st of H.steps) { let l = stepsByEntity.get(st[0]); if (!l) stepsByEntity.set(st[0], l = []); l.push(st); }
  const entIndex = new Map(H.entities.map((e, i) => [e.id, i]));
  const unwrap = (pts) => { const n = pts.length, X = new Float64Array(n), Y = new Float64Array(n); let cum = pts[0][0]; X[0] = cum; Y[0] = pts[0][1]; for (let i = 1; i < n; i++) { let dx = pts[i][0] - pts[i - 1][0]; if (dx > X180) dx -= 2 * X180; else if (dx < -X180) dx += 2 * X180; cum += dx; X[i] = cum; Y[i] = pts[i][1]; } return { X, Y, n }; };
  const faceRings = new Map();
  const ringsOf = (fi) => {
    let r = faceRings.get(fi); if (r) return r;
    r = T.faces[fi].rings.map((ring) => { const pts = []; for (const ref of ring) { const g = geom(Math.abs(ref) - 1, LODS - 1); if (ref > 0) for (let i = 0; i < g.length - 1; i++) pts.push(g[i]); else for (let i = g.length - 1; i > 0; i--) pts.push(g[i]); } return unwrap(pts); });
    faceRings.set(fi, r); return r;
  };
  const inFace = (fi, px, py) => { let inside = false; for (const { X, Y, n } of ringsOf(fi)) { for (const qx of [px, px + 2 * X180, px - 2 * X180]) { let c = false; for (let i = 0, j = n - 1; i < n; j = i++) if ((Y[i] > py) !== (Y[j] > py) && qx < (X[j] - X[i]) * (py - Y[i]) / (Y[j] - Y[i]) + X[i]) c = !c; if (c) { inside = !inside; break; } } } return inside; };
  const aliveFaces = (y, layer) => H.steps.filter((s) => s[1] <= y && s[2] >= y && (layer === "all" || (layer === "presence") === isPres(s[0]))).map((s) => s[3]);
  const entityAt = (lon, lat, y, o) => { const layer = (o && o.layer) || "states"; const px = Math.round(lon / Q), py = Math.round(lat / Q); const out = []; for (const fi of aliveFaces(y, layer)) if (inFace(fi, px, py)) out.push(H.entities[T.faces[fi].entity]); return out; };
  const holds = (entId, found) => found.some((e) => e.id === entId || ((e.kind === "contested" || e.kind === "nested") && e.partners.includes(entId)));
  const stepsOf = (id) => { const i = entIndex.get(id); return i == null ? [] : (stepsByEntity.get(i) || []).map((s) => [s[1], s[2], s[3]]); };
  const aliveAt = (id, y) => stepsOf(id).some((s) => s[0] <= y && y <= s[1]);
  return { header: H, T, C, Q, entityAt, holds, stepsOf, aliveAt, entIndex, isPres, bytes: fs.statSync(file).size };
}

module.exports = { open };
