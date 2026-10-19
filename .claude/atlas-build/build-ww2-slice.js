#!/usr/bin/env node
/* build-ww2-slice.js — the SECOND WORLD WAR WINDOW'S SLICE of the history file: atlas/data/history-ww2.bin and its file:// twin (2026-10-19).

     node .claude/atlas-build/build-ww2-slice.js [--install] [--dry] [--check]      (from the repo root)

   WHY. The war windows' timeline made the Second World War window (ww2-001, the only war with a front line: 93 plate dates with months) read the WHOLE history file (9.1 MB), because the war slice
   (history-wars.bin, build-war-slice.js) carries no front: the front is about 40 % of history.bin's vertices and most of its faces. So opening that one card downloaded about 9 MB, on a phone too, and on file://
   fell back to year steps with no front line. The window reads this slice instead; it is the slice of the history file for `histKind` "ww2" (atlas.js `startHistory`).

   WHAT IT KEEPS (from the committed history.bin and atlas/data/wars.js; nothing is recomputed and nothing is invented):
     A  the front: every step of every `front` entity (all 93 plate dates, months and days in the steps' YYYYMMDD years) and the header's `fronts` block whole (the plates);
     B  every state alive in any YEAR a plate falls in (1939–1945) and in the war's display year — the states the window draws plain around the front (presence layers are not: a window draws them only as a side);
     C  every step that overlaps the war's years, of each entity either side names (`m` members and the authored extent `x`): the frame (`warFrame`) and the names (`warSidesOf`) read them;
   and the faces those steps stand on, the arcs those faces walk and the junction arcs (lib/history-cut.js). Entities are kept in the file's own order.

   WHAT IT SIMPLIFIES, AND ONLY THAT. The front's SOFT arcs (the line a plate drew, which no state shares) are simplified, per level, to HALF A PIXEL AT THE WINDOW'S CLOSEST ZOOM. The window's closest zoom is not the
   Atlas's: its zoom is capped at CMAP_ZMAX (400, app.js), the globe's radius is 0.46 × the canvas's short side × zoom (atlas-embed.js) and the canvas is at most 340 px high (styles.css `.mc-canvas`,
   `clamp(210px, 42vh, 340px)`), so the closest view is 6371.0088 / (0.46 × 340 × 400) = 0.1018 km per CSS pixel — as deep as the Atlas page's own cap (0.15 km/px) and deeper — and half a pixel there is 51 m,
   a little under two of the file's 28 m quanta. Douglas–Peucker runs on each LEVEL's polyline in turn (rank 0, then ranks ≤ 1 with the rank-0 survivors forced, then ≤ 2), so at every level the line
   the window draws is within that tolerance of the line the whole history draws; every arc's endpoints stay (junctions are found by position). Coast pieces (core references), the states' arcs and every
   face's rings are NOT touched. The numbers it removes are in the report.

   WHAT --check PROVES (CI's fast job, offline): the installed slice is byte-identical to a fresh cut of the committed history.bin; its twin decodes to it; it was built on the same core; every plate, every front
   step and every face the front walks has the full file's coast pieces exactly and its soft arcs within the tolerance at all three levels; the states alive in each plate year and each side's steps are exactly the
   full file's; the slice is inside its budget and the four twins together stay under TWINS_MAX = 12 MB (the owner's Phase 5 rule). */
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const F = require("./lib/format.js");
const { fromRead } = require("./lib/history-model.js");
const { cutModel } = require("./lib/history-cut.js");
const Tw = require("./lib/twin.js");

const HERE = __dirname, ROOT = path.join(HERE, "..", ".."), DATA = path.join(ROOT, "atlas", "data"), OUT = path.join(HERE, "out");
const argv = process.argv.slice(2), has = (f) => argv.includes(f);
const FULL = path.join(DATA, "history.bin"), SLICE = path.join(DATA, "history-ww2.bin"), CORE = path.join(DATA, "topology.bin");
const BUDGET_BYTES = 5.2e6;   // the slice file; its twin is the base64 of its gzip
const TWINS_MAX = 12e6;   // every twin together (topology, water, the war slice, this slice) — the owner's rule of Phase 5
const sha = (b) => crypto.createHash("sha256").update(b).digest("hex");
const say = (m) => console.log(m);
const NOT_DRAWN = new Set(["people", "culture", "front", "extent"]);
const SOFT_KIND = 4;
const displayYear = (w) => Math.round((w.y[0] + w.y[1]) / 2);

/* the window's closest zoom, read from the files that fix it (a change to any of them fails the build rather than silently changing the tolerance) */
function windowZoom() {
  const app = fs.readFileSync(path.join(ROOT, "app.js")).toString("latin1"), css = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
  const zmax = /CMAP_ZMAX\s*=\s*(\d+(?:\.\d+)?)/.exec(app), h = /\.mc-canvas\{[^}]*height:\s*clamp\(\s*[\d.]+px\s*,\s*[\d.]+vh\s*,\s*([\d.]+)px\s*\)/.exec(css);
  if (!zmax || !h) throw new Error("cannot read CMAP_ZMAX from app.js or the .mc-canvas height from styles.css");
  const emb = fs.readFileSync(path.join(ROOT, "atlas", "atlas-embed.js"), "utf8");
  if (!/radius = 0\.46 × the short side × zoom/.test(emb)) throw new Error("atlas-embed.js no longer says radius = 0.46 × the short side × zoom");
  const Z = Number(zmax[1]), short = Number(h[1]), kmpp = 6371.0088 / (0.46 * short * Z);
  return { zmax: Z, shortPx: short, kmpp, tolM: 0.5 * kmpp * 1000 };
}
function loadWars() { const sandbox = { window: {} }; new Function("window", fs.readFileSync(path.join(DATA, "wars.js"), "utf8"))(sandbox.window); return sandbox.window.ATLAS_WARS; }

/* ---- the simplification ---- */
const EARTH_M = 6371008.8;
/* a point on the unit sphere from quantised (lon, lat); the distance (m) of a point from the great-circle SEGMENT a–b (the straight line the window's planar frame draws between two vertices) */
const unit = (x, y, q) => { const lo = x * q * Math.PI / 180, la = y * q * Math.PI / 180, c = Math.cos(la); return [c * Math.cos(lo), c * Math.sin(lo), Math.sin(la)]; };
const dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
const cross = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
const angle = (u, v) => Math.atan2(Math.hypot(...cross(u, v)), dot(u, v));
function segDist(p, a, b) {
  const n = cross(a, b), nl = Math.hypot(n[0], n[1], n[2]);
  if (nl < 1e-15) return EARTH_M * Math.min(angle(p, a), angle(p, b));
  const nn = [n[0] / nl, n[1] / nl, n[2] / nl], h = dot(p, nn);   // p's height over the plane of a, b
  const f = [p[0] - h * nn[0], p[1] - h * nn[1], p[2] - h * nn[2]], fl = Math.hypot(f[0], f[1], f[2]);   // its foot on the great circle
  if (fl > 1e-15) { const g = [f[0] / fl, f[1] / fl, f[2] / fl], ab = angle(a, b); if (angle(a, g) <= ab + 1e-12 && angle(g, b) <= ab + 1e-12) return EARTH_M * Math.asin(Math.min(1, Math.abs(h))); }
  return EARTH_M * Math.min(angle(p, a), angle(p, b));
}
/* Douglas–Peucker over the points `idx` (indices into the arc, ascending; V[i] their unit vectors); `force` indices always stay; returns the kept subset */
function dp(V, idx, force, tol) {
  const keep = new Set([idx[0], idx[idx.length - 1]]); for (const i of idx) if (force.has(i)) keep.add(i);
  const pos = new Map(idx.map((v, k) => [v, k])), anchors = [...keep].sort((a, b) => a - b);
  const stack = []; for (let k = 0; k + 1 < anchors.length; k++) stack.push([pos.get(anchors[k]), pos.get(anchors[k + 1])]);
  while (stack.length) {
    const [a, b] = stack.pop(); if (b <= a + 1) continue;
    let md = -1, mk = -1;
    for (let k = a + 1; k < b; k++) { const d = segDist(V[idx[k]], V[idx[a]], V[idx[b]]); if (d > md) { md = d; mk = k; } }
    if (md > tol) { keep.add(idx[mk]); stack.push([a, mk], [mk, b]); }
  }
  return keep;
}
/* an own arc's vertices to keep: per level, coarse to fine, each level's DP forced to keep the coarser level's survivors. The line a level draws has its endpoints MOVED with the level (junctions on the coast),
   so the DP runs on that moved line (atlas-format.js historyArcGeometry), not on the stored vertices; the vertices are the arc's local indices. */
function simplifyArc(R, C, J, arc, tolM, quantum) {
  const s = R.arcOffset[arc], n = R.arcOffset[arc + 1] - s; if (n <= 2) return null;
  let kept = new Set([0, n - 1]);
  for (let L = 0; L <= 2; L++) {
    const idx = []; for (let i = 0; i < n; i++) if (R.rank[s + i] <= L) idx.push(i);
    const pts = F.historyArcGeometry(R, C, arc, L, J, R.header.arcEmpty);
    if (pts.length !== idx.length) throw new Error("arc " + arc + ": level " + L + " has " + pts.length + " points for " + idx.length + " vertices");
    const V = new Array(n); pts.forEach((p, k) => { V[idx[k]] = unit(p[0], p[1], quantum); });
    kept = dp(V, idx, kept, tolM);
  }
  if (kept.size === n) return null;
  return [...kept].sort((a, b) => a - b);
}

/* ---- the cut ---- */
function plan(R, M, wars) {
  const H = R.header, ents = H.entities, entIx = new Map(ents.map((e, i) => [e.id, i]));
  const frontEnts = ents.map((e, i) => (e.kind === "front" ? i : -1)).filter((i) => i >= 0);
  if (!frontEnts.length) throw new Error("history.bin carries no front entity");
  const cards = [...new Set(frontEnts.flatMap((i) => ents[i].cards || []))];
  const years = new Set(), sides = [];
  for (const c of cards) {
    const w = wars.wars[c]; if (!w) throw new Error(`front card ${c} is not in atlas/data/wars.js`);
    years.add(displayYear(w));
    for (const k of ["v", "l"]) for (const eid of (w[k].m || []).map((m) => m[0]).concat(w[k].x ? [w[k].x] : [])) {
      if (!entIx.has(eid)) throw new Error(`war ${c}: side ${k} names ${eid}, which history.bin does not carry`);
      sides.push({ ei: entIx.get(eid), y0: w.y[0], y1: w.y[1] });
    }
  }
  for (const p of H.fronts.plates) years.add(Number(String(p.date).slice(0, 4)));
  const yearList = [...years].sort((a, b) => a - b), frontSet = new Set(frontEnts);
  const stepKeep = M.steps.map((st) => {
    const [ei, from, to] = st;
    if (frontSet.has(ei)) return true;
    if (!NOT_DRAWN.has(ents[ei].kind) && yearList.some((y) => from <= y && y <= to)) return true;
    return sides.some((s) => s.ei === ei && to >= s.y0 && from <= s.y1);
  });
  return { stepKeep, yearList, cards, frontSet, sides };
}

function cut(fullBytes, wars) {
  const R = F.read(new Uint8Array(fullBytes)), H = R.header, M = fromRead(R), nA = M.arcs.length;
  const wz = windowZoom(), P = plan(R, M, wars), C = F.read(new Uint8Array(fs.readFileSync(CORE))), J = F.historyJunctions(R, C);
  // the arcs only the front walks: the soft arcs the simplification may touch (a state's arc is never moved)
  const frontFaces = new Set(), otherFaces = new Set();
  M.steps.forEach((st, i) => { if (P.stepKeep[i]) (P.frontSet.has(st[0]) ? frontFaces : otherFaces).add(st[3]); });
  const frontArcs = new Set(), otherArcs = new Set();
  M.faces.forEach((f, i) => { const into = frontFaces.has(i) ? frontArcs : otherFaces.has(i) ? otherArcs : null; if (into) for (const r of f.rings) for (const ref of r) into.add(Math.abs(ref) - 1); });
  // the simplification first (its counts go into the header), then the one cut
  let before = 0, after = 0, arcsTouched = 0; const simp = new Map();
  for (const a of frontArcs) {
    if (R.coreArc[a] >= 0 || M.arcs[a].kind !== SOFT_KIND || otherArcs.has(a)) continue;
    const n = R.arcOffset[a + 1] - R.arcOffset[a], keep = simplifyArc(R, C, J, a, wz.tolM, H.quantum); before += n; after += keep ? keep.length : n; if (keep) { arcsTouched++; simp.set(a, keep); }
  }
  const { bytes, report } = cutModel(R, M, P.stepKeep, {
    generator: "folio atlas-build: build-ww2-slice.js (" + require("./package.json").version + ")",
    arcVertices: (a) => simp.get(a) || null,
    header: (extra) => {
      extra.history = Object.assign({}, H.history, {
        slice: "ww2",
        sliceNote: "This is the Second World War window's slice of atlas/data/history.bin: the front line's plates (every date), the states alive in the years of the plates and the war's sides — what the window of the card that owns the front draws, not the whole history. The front's soft arcs are simplified to half a pixel at the window's closest zoom. The Atlas page reads the full file.",
        sliceOf: { file: "atlas/data/history.bin", sha256: sha(fullBytes), bytes: fullBytes.length, steps: M.steps.length, faces: M.faces.length, arcs: nA }, cards: P.cards, plateYears: P.yearList,
        simplified: { toleranceM: Math.round(wz.tolM * 10) / 10, closestKmPerPx: Math.round(wz.kmpp * 10000) / 10000, zoomMax: wz.zmax, canvasShortPx: wz.shortPx, frontSoftVerticesBefore: before, frontSoftVerticesAfter: after },
      });
    },
  });
  return { bytes, report: Object.assign(report, { years: P.yearList.length, cards: P.cards, soft: { before, after, arcs: arcsTouched }, wz }), plan: P };
}

/* ---- the faithful-subset proof ---- */
function proof(fullBytes, sliceBytes, wars, wz) {
  const fails = [];
  const A = F.read(new Uint8Array(fullBytes)), B = F.read(new Uint8Array(sliceBytes)), C = F.read(new Uint8Array(fs.readFileSync(CORE)));
  const hb = B.header.history || {};
  if (hb.slice !== "ww2") fails.push("the slice's header does not say it is the ww2 slice");
  if (B.header.core.buildId !== C.header.buildId || A.header.core.buildId !== C.header.buildId) fails.push(`built on core ${B.header.core.buildId}, topology.bin is ${C.header.buildId}`);
  if (!hb.sliceOf || hb.sliceOf.sha256 !== sha(fullBytes)) fails.push("the slice was cut from another history.bin than the committed one");
  if (JSON.stringify(B.header.sources) !== JSON.stringify(A.header.sources)) fails.push("the sources header differs from history.bin's");
  if (JSON.stringify(A.header.fronts) !== JSON.stringify(B.header.fronts)) fails.push("the fronts block (the plates) differs from history.bin's");
  const nPlates = (B.header.fronts.plates || []).length; if (nPlates !== 138) void 0;
  const jA = F.historyJunctions(A, C), jB = F.historyJunctions(B, C);
  const idA = A.header.entities.map((e) => e.id), idB = B.header.entities.map((e) => e.id);
  const stepsA = new Map(), stepsB = new Map();
  for (const st of A.header.steps) { const id = idA[st[0]]; (stepsA.get(id) || stepsA.set(id, []).get(id)).push(st); }
  for (const st of B.header.steps) { const id = idB[st[0]]; (stepsB.get(id) || stepsB.set(id, []).get(id)).push(st); }
  const q = A.header.quantum;
  const geom = (R, J, arc, L) => F.historyArcGeometry(R, C, arc, L, J, R.header.arcEmpty);
  const exact = (R, J, fi) => { let s = ""; for (let L = 0; L < R.lodCount; L++) { s += "|L" + L; for (const ring of R.faces[fi].rings) { s += "/"; for (const ref of ring) s += (ref > 0 ? "+" : "-") + JSON.stringify(geom(R, J, Math.abs(ref) - 1, L)); } } return s; };
  // distance (m) of point p from the polyline g (great-circle segments, as the window draws them)
  const dist = (p, g) => { const u = unit(p[0], p[1], q); if (g.length === 1) return EARTH_M * angle(u, unit(g[0][0], g[0][1], q)); let best = Infinity; for (let i = 0; i + 1 < g.length; i++) best = Math.min(best, segDist(u, unit(g[i][0], g[i][1], q), unit(g[i + 1][0], g[i + 1][1], q))); return best; };
  const cacheA = new Map(), cacheB = new Map();
  const gA = (fi) => { let v = cacheA.get(fi); if (v == null) cacheA.set(fi, v = exact(A, jA, fi)); return v; };
  const gB = (fi) => { let v = cacheB.get(fi); if (v == null) cacheB.set(fi, v = exact(B, jB, fi)); return v; };
  const frontIds = A.header.entities.filter((e) => e.kind === "front").map((e) => e.id);
  let frontFaces = 0, frontArcs = 0, softArcs = 0, maxDev = 0;
  const pairDone = new Set();
  for (const id of frontIds) {
    const a = stepsA.get(id) || [], b = stepsB.get(id) || [];
    if (a.length !== b.length) { fails.push(`front ${id}: ${a.length} steps in the full file, ${b.length} in the slice`); continue; }
    a.forEach((st, i) => {
      if (st[1] !== b[i][1] || st[2] !== b[i][2]) { fails.push(`front ${id}: step ${i}'s dates differ (${st[1]}–${st[2]} vs ${b[i][1]}–${b[i][2]})`); return; }
      frontFaces++;
      const fa = A.faces[st[3]], fb = B.faces[b[i][3]];
      if (fa.rings.length !== fb.rings.length) { fails.push(`front ${id}: step ${i} has ${fa.rings.length} rings, the slice ${fb.rings.length}`); return; }
      fa.rings.forEach((ra, ri) => {
        const rb = fb.rings[ri];
        if (ra.length !== rb.length) { fails.push(`front ${id}: step ${i} ring ${ri} walks ${ra.length} arcs, the slice ${rb.length}`); return; }
        for (let k = 0; k < ra.length; k++) {
          if ((ra[k] > 0) !== (rb[k] > 0)) { fails.push(`front ${id}: step ${i} ring ${ri} ref ${k} turns the other way`); return; }
          const x = Math.abs(ra[k]) - 1, y = Math.abs(rb[k]) - 1, key = x * 1e6 + y;   // (only a pair seen once is compared)
          if (pairDone.has(key)) continue; pairDone.add(key); frontArcs++;
          for (let L = 0; L < A.lodCount; L++) {
            const ga = geom(A, jA, x, L), gb = geom(B, jB, y, L);
            if (A.coreArc[x] >= 0) { if (JSON.stringify(ga) !== JSON.stringify(gb)) { fails.push(`front ${id}: a coast piece differs at level ${L}`); return; } continue; }
            softArcs += L === 0 ? 1 : 0;
            if (ga.length === gb.length && JSON.stringify(ga) === JSON.stringify(gb)) continue;
            let dev = 0; for (const p of ga) dev = Math.max(dev, dist(p, gb));
            maxDev = Math.max(maxDev, dev);
            if (dev > wz.tolM + 1) { fails.push(`front ${id}: a soft arc deviates ${dev.toFixed(1)} m at level ${L}, over the ${wz.tolM.toFixed(1)} m tolerance`); return; }
            if (gb.some((p) => !ga.some((o) => o[0] === p[0] && o[1] === p[1]))) { fails.push(`front ${id}: the slice's soft arc has a vertex the full file's lacks`); return; }
            if (ga[0][0] !== gb[0][0] || ga[0][1] !== gb[0][1] || ga[ga.length - 1][0] !== gb[gb.length - 1][0] || ga[ga.length - 1][1] !== gb[gb.length - 1][1]) { fails.push(`front ${id}: a soft arc's endpoint moved`); return; }
          }
        }
      });
    });
  }
  // every plate date is a step of some front entity, in both
  const datesOf = (steps) => new Set(frontIds.flatMap((id) => (steps.get(id) || []).flatMap((st) => [st[1], st[2]])));
  const dA = datesOf(stepsA), dB = datesOf(stepsB); if (dA.size !== dB.size || [...dA].some((d) => !dB.has(d))) fails.push("the front steps' dates differ");
  // the states alive in every plate year, and each side's steps in the war's years: the full file's, exactly
  let states = 0, sideSteps = 0;
  const yearList = hb.plateYears || [];
  const cards = hb.cards || [];
  const years = new Set(yearList); for (const c of cards) years.add(displayYear(wars.wars[c]));
  for (const y of years) for (const [eid, list] of stepsA) {
    const kind = A.header.entities[idA.indexOf(eid)].kind; if (NOT_DRAWN.has(kind)) continue;
    const a = list.filter((st) => st[1] <= y && y <= st[2]), b = (stepsB.get(eid) || []).filter((st) => st[1] <= y && y <= st[2]);
    if (a.length !== b.length) { fails.push(`@${y}: ${eid} has ${a.length} steps alive in the full file, ${b.length} in the slice`); continue; }
    a.forEach((st, i) => { states++; if (st[1] !== b[i][1] || st[2] !== b[i][2]) fails.push(`@${y}: ${eid}'s step years differ`); else if (gA(st[3]) !== gB(b[i][3])) fails.push(`@${y}: ${eid}'s face differs at some level`); else if (A.header.faceClass[st[3]] !== B.header.faceClass[b[i][3]]) fails.push(`${eid}'s face class differs`); });
  }
  for (const c of cards) { const w = wars.wars[c]; for (const k of ["v", "l"]) for (const eid of (w[k].m || []).map((m) => m[0]).concat(w[k].x ? [w[k].x] : [])) {
    const a = (stepsA.get(eid) || []).filter((st) => st[2] >= w.y[0] && st[1] <= w.y[1]), b = (stepsB.get(eid) || []).filter((st) => st[2] >= w.y[0] && st[1] <= w.y[1]);
    if (a.length !== b.length) { fails.push(`${c}: side ${k} ${eid} has ${a.length} steps in the war's years, the slice ${b.length}`); continue; }
    a.forEach((st, i) => { sideSteps++; if (st[1] !== b[i][1] || st[2] !== b[i][2] || gA(st[3]) !== gB(b[i][3])) fails.push(`${c}: side ${k} ${eid}'s step ${i} differs`); });
  } }
  // the window's own formulas are the ones this file uses
  const aw = fs.readFileSync(path.join(ROOT, "atlas", "atlas-windows.js"), "utf8");
  if (!aw.includes("warYear = Math.round((WT.y[0] + WT.y[1]) / 2)")) fails.push("atlas-windows.js no longer computes the display year as Math.round((y0 + y1) / 2)");
  return { fails, frontFaces, frontArcs, softArcs, maxDev, states, sideSteps, plates: (B.header.fronts.plates || []).length };
}

function writeAll(bytes) {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, "history-ww2.bin"), bytes);
  fs.writeFileSync(SLICE, bytes);
  return Tw.writeTwin(SLICE, { name: "history-ww2.bin", gzip: true });
}

(function main() {
  const fullBytes = fs.readFileSync(FULL), wars = loadWars();
  const t0 = Date.now();
  const { bytes, report } = cut(fullBytes, wars);
  const tCut = Date.now() - t0;
  say(`ww2 slice: ${bytes.length} bytes (${(bytes.length / 1e6).toFixed(3)} MB) of ${fullBytes.length} (${(100 * bytes.length / fullBytes.length).toFixed(1)} %), sha256 ${sha(bytes)} — cut in ${(tCut / 1000).toFixed(1)} s`);
  say(`  steps ${report.steps}/${report.of}, faces ${report.faces}/${report.facesOf}, arcs ${report.arcs}/${report.arcsOf} (${report.junctionArcs} kept for a junction only), vertices ${report.vertices}/${report.verticesOf}, entities ${report.entities}/${report.entitiesOf}; cards ${report.cards.join(", ")}, ${report.years} plate/display years`);
  say(`  window closest zoom: zoom ${report.wz.zmax} on a ${report.wz.shortPx} px canvas = ${report.wz.kmpp.toFixed(4)} km/px; half a pixel = ${report.wz.tolM.toFixed(1)} m; front soft arcs: ${report.soft.before} → ${report.soft.after} vertices (${report.soft.arcs} arcs simplified)`);
  const t1 = Date.now();
  const p = proof(fullBytes, bytes, wars, report.wz);
  say(`  proof (${((Date.now() - t1) / 1000).toFixed(1)} s): ${p.plates} plates, ${p.frontFaces} front faces and ${p.frontArcs} arcs compared with the full file at three levels (coast pieces equal; ${p.softArcs} soft arcs within ${report.wz.tolM.toFixed(1)} m, worst ${p.maxDev.toFixed(1)} m), ${p.states} state faces, ${p.sideSteps} side steps — ${p.fails.length ? p.fails.length + " FAILED" : "all equal"}`);
  const problems = p.fails.slice(0, 12);
  if (bytes.length > BUDGET_BYTES) problems.push(`the slice is ${bytes.length} bytes, over its ${BUDGET_BYTES} budget`);
  if (has("--check")) {
    if (!fs.existsSync(SLICE)) problems.push("atlas/data/history-ww2.bin is missing — run: node .claude/atlas-build/build-ww2-slice.js --install");
    else if (sha(fs.readFileSync(SLICE)) !== sha(bytes)) problems.push("atlas/data/history-ww2.bin lags history.bin, wars.js or the window's zoom — run: node .claude/atlas-build/build-ww2-slice.js --install");
    const t = Tw.checkTwin(SLICE); if (!t.ok) problems.push("the twin of the slice: " + t.reason); else say(`  twin: ${t.twinBytes} bytes, identical to the slice`);
    const full = ["topology.bin.js", "water.bin.js", "history-wars.bin.js", "history-ww2.bin.js"].map((f) => { try { return fs.statSync(path.join(DATA, f)).size; } catch (e) { return 0; } }).reduce((a, b) => a + b, 0);
    say(`  the file:// twins together: ${(full / 1e6).toFixed(2)} MB (the owner's rule: at most ${TWINS_MAX / 1e6} MB)`);
    if (full > TWINS_MAX) problems.push(`the four twins together are ${(full / 1e6).toFixed(2)} MB, over ${TWINS_MAX / 1e6} MB`);
    if (problems.length) { for (const m of problems) console.error("FAIL " + m); process.exit(1); }
    say("ok"); return;
  }
  if (problems.length) { for (const m of problems) console.error("FAIL " + m); process.exit(1); }
  if (has("--dry")) return;
  if (has("--install")) { const tw = writeAll(bytes); say(`installed atlas/data/history-ww2.bin and its twin (${tw.twinBytes} bytes)`); try { require("./build-credits.js").build({ install: true }); } catch (e) { say("credits: " + e.message); } }
  else { fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, "history-ww2.bin"), bytes); say("wrote out/history-ww2.bin (--install copies it into atlas/data/ with its twin)"); }
})();
