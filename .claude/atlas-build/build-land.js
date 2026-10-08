#!/usr/bin/env node
/* build-land.js — step 1 of the Atlas v2 build: the land/sea partition from the OSM land polygons.

     node build-land.js            → out/coast.bin (every ring, every vertex, with its Visvalingam area)
                                     out/land-log.json (the snap log of this step)
     node build-land.js --census   → only print the vertex census per candidate tolerance (no write)

   PHASE 1a SCOPE (docs/atlas-v2-design.md §2.3, §7 Phase 1): the coastline is OpenStreetMap's land
   polygons (osmdata.openstreetmap.de, ODbL, Q-S1 a) — 833,308 polygons and 79 M vertices in the
   2026-10-08 build. Phase 0 built the same partition from Natural Earth; the structure survives and
   the source changes. The admin conflation that used to live here is build-admin.js now: this step
   knows nothing about countries, it produces the one land/sea partition every later step is
   conflated ONTO.

   WHAT HAPPENS, IN ORDER:

     1. Stream the shapefile one record at a time (lib/shp.js) — never the whole file in memory.
        Quantise to the shared quantum (lib/rings.js), fold +180 onto -180, collapse the poles, drop
        consecutive duplicates and spikes.
     2. Orient every ring LAND ON THE LEFT: an outer ring counter-clockwise, a hole clockwise. The
        source draws outer rings clockwise and (one) hole counter-clockwise; the signed area decides,
        not the convention, and a ring that circles a pole is oriented by its longitude turn.
     3. Join the pieces cut at the antimeridian back into rings on the sphere (x = 180 is x = -180):
        every run of vertices lying on the meridian is a cut edge; the open chains it leaves are joined
        end to end by latitude, and an end with no exact partner is joined to the nearest within the
        source's tolerance — a logged snap.
     4. Visvalingam on every ring, cyclic, monotone (lib/rings.js): every vertex gets the effective
        area at which it is removed, so a level of detail is a threshold on one number and all levels
        are the same lines simplified. Nothing is dropped here; the finest shipped level and the
        crossing repairs are build-admin.js's decisions.
     5. Write out/coast.bin and the census: how many vertices and rings survive each candidate
        tolerance, which is the measurement the LOD 3 and 4 tolerances are chosen against.

   NOTHING IS HAND-EDITED AFTERWARDS. A wrong line is fixed here or in the source pin.
*/
"use strict";
const fs = require("fs"), path = require("path");
const { ensureSource } = require("./fetch-sources.js");
const { SnapLog } = require("./lib/log.js");
const { readShp } = require("./lib/shp.js");
const R = require("./lib/rings.js");
const Coast = require("./lib/coastfile.js");

const HERE = __dirname, OUT = path.join(HERE, "out");
const SOURCE = "osm-land-polygons";
const TOLERANCE_M = { [SOURCE]: 100 };     // the source is metre-scale; the only snaps here are the two sides of the antimeridian cut meeting
const CENSUS_M = [40, 75, 100, 150, 200, 250, 350, 500, 1000, 2500, 8000];
const censusOnly = process.argv.includes("--census");

const t0 = Date.now();
const say = (m) => console.log(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${m}`);

function main() {
  const src = ensureSource(SOURCE);
  const shp = path.join(src.dir, "land-polygons-complete-4326", "land_polygons.shp");
  const readme = path.join(src.dir, "land-polygons-complete-4326", "README.txt");
  const dataDate = (fs.existsSync(readme) && (/Date of the data used is (\S+)/.exec(fs.readFileSync(readme, "utf8")) || [])[1]) || null;
  say(`source ${SOURCE} ${src.sha256.slice(0, 12)}… data date ${dataDate}`);
  const log = new SnapLog("build-land", TOLERANCE_M);
  const qstats = {};

  /* 1–2: rings, quantised and oriented */
  const rings = [];          // closed rings as { xs, ys } (Int32Array — 79 M vertices as JavaScript pairs would be gigabytes of heap); chains cut at the seam go to `chains` as pair lists
  const chains = [];
  const typed = (pts) => { const n = pts.length, xs = new Int32Array(n), ys = new Int32Array(n); for (let i = 0; i < n; i++) { xs[i] = pts[i][0]; ys[i] = pts[i][1]; } return { xs, ys }; };
  let records = 0, parts = 0, degenerate = 0, spikes = 0, flippedOuter = 0, flippedHole = 0, polar = 0, holes = 0;
  for (const rec of readShp(shp)) {
    records++;
    const prepared = [];
    for (const part of rec.parts) {
      parts++;
      const pts = []; let last = null;
      for (let i = 0; i < part.length; i += 2) { const q = R.qpt([part[i], part[i + 1]], qstats, 0); const k = R.pkey(q[0], q[1]); if (k !== last) { pts.push(q); last = k; } }
      if (pts.length > 1 && R.pkey(pts[0][0], pts[0][1]) === R.pkey(pts[pts.length - 1][0], pts[pts.length - 1][1])) pts.pop();
      spikes += R.cutSpikes(pts);
      if (pts.length < 3) { degenerate++; continue; }
      const { area, turn } = R.ringAreaAndTurn(pts);
      prepared.push({ pts, area, turn });
    }
    if (!prepared.length) continue;
    // the part with the largest |area| is the outer ring; the rest are holes (the source has one)
    prepared.sort((a, b) => Math.abs(b.area) - Math.abs(a.area));
    prepared.forEach((P, i) => {
      const hole = i > 0;
      if (hole) holes++;
      let flip;
      if (Math.abs(P.turn) > R.X180) { polar++; const south = P.pts.reduce((s, p) => s + p[1], 0) / P.pts.length < 0; flip = south ? P.turn > 0 : P.turn < 0; }   // land-left round the south pole is westward
      else flip = hole ? P.area > 0 : P.area < 0;
      if (flip) { P.pts.reverse(); if (hole) flippedHole++; else flippedOuter++; }
      // the antimeridian: a ring with an edge lying ON x = -180 was cut there by the source. Every such
      // edge is removed and the chains between them are joined back (step 3); a lone seam vertex is a
      // ring merely touching the meridian and stays as it is.
      const n = P.pts.length;
      const seamEdge = (i) => P.pts[i][0] === -R.X180 && P.pts[(i + 1) % n][0] === -R.X180;
      const E = []; for (let i = 0; i < n; i++) if (seamEdge(i)) E.push(i);
      if (!E.length) { rings.push(typed(P.pts)); return; }
      for (let k = 0; k < E.length; k++) {
        const from = E[k] + 1, to = E[(k + 1) % E.length];   // inclusive, cyclic
        const chain = []; let allSeam = true;
        for (let i = from; ; i = (i + 1) % n) { const p = P.pts[i % n]; chain.push(p); if (p[0] !== -R.X180) allSeam = false; if (i % n === to) break; }
        if (!allSeam && chain.length >= 2) chains.push(chain);
      }
    });
  }
  say(`read ${records} records, ${parts} parts → ${rings.length} closed rings, ${chains.length} chains cut at the antimeridian; ${degenerate} degenerate, ${spikes} spikes, ${holes} holes; ${flippedOuter} outer rings and ${flippedHole} holes reversed to land-left; ${polar} polar`);
  log.event("rings-read", { records, parts, rings: rings.length, chains: chains.length, degenerate, spikes, holes, flippedOuter, flippedHole, polar, seamSnaps: qstats.seamSnaps || 0 });

  /* 3: join the chains at the seam */
  if (chains.length) {
    const endY = (c, w) => (w ? c[c.length - 1] : c[0])[1];
    const ends = []; chains.forEach((c, i) => { ends.push({ i, w: 0, y: endY(c, 0) }, { i, w: 1, y: endY(c, 1) }); });
    // exact partners first, then nearest within tolerance (logged)
    const byY = new Map(); for (const e of ends) { let a = byY.get(e.y); if (!a) byY.set(e.y, a = []); a.push(e); }
    const used = new Uint8Array(chains.length);
    let joined = 0, snapped = 0;
    const chainStart = (c) => c[0], chainEnd = (c) => c[c.length - 1];
    for (let i = 0; i < chains.length; i++) {
      if (used[i]) continue;
      used[i] = 1;
      let chain = chains[i], closed = false;
      for (let guard = 0; guard < 1000; guard++) {
        const e = chainEnd(chain), s = chainStart(chain);
        if (e[0] === s[0] && e[1] === s[1] && chain.length > 2) { chain.pop(); closed = true; break; }
        // a chain's end (on the seam) continues with the chain whose START is at the same latitude
        let next = null;
        const cands = (byY.get(e[1]) || []).filter((q) => !used[q.i] && q.w === 0);
        if (cands.length) next = cands[0];
        else {
          let best = null;
          for (const q of ends) { if (used[q.i] || q.w !== 0) continue; const dy = Math.abs(q.y - e[1]); if (!best || dy < best.dy) best = { q, dy }; }
          if (best) {
            const m = best.dy * R.QUANTUM * (Math.PI / 180) * 6371008.8;
            if (m <= TOLERANCE_M[SOURCE]) { next = best.q; snapped++; log.snap({ source: SOURCE, kind: "seam-end-joined", from: [-180, chains[best.q.i][0][1] * R.QUANTUM], to: [-180, e[1] * R.QUANTUM], metres: m }); chains[best.q.i][0][1] = e[1]; }
            else log.event("seam-end-unmatched", { y: e[1] * R.QUANTUM, nearestMetres: Math.round(m) });
          }
        }
        if (!next) { log.event("seam-chain-open", { vertices: chain.length, at: [e[0] * R.QUANTUM, e[1] * R.QUANTUM] }); break; }
        used[next.i] = 1; joined++;
        chain = chain.concat(chains[next.i]);
      }
      if (!closed) log.event("seam-chain-not-closed", { vertices: chain.length, from: [chainStart(chain)[0] * R.QUANTUM, chainStart(chain)[1] * R.QUANTUM], to: [chainEnd(chain)[0] * R.QUANTUM, chainEnd(chain)[1] * R.QUANTUM] });   // a chain left open closes along the meridian: a sliver the source cut whose other side has no vertices (25 vertices, Fiji, measured)
      R.cutSpikes(chain);
      if (chain.length >= 3) rings.push(typed(chain)); else degenerate++;
    }
    say(`antimeridian: ${chains.length} chains → ${joined} joins (${snapped} by nearest latitude within ${TOLERANCE_M[SOURCE]} m)`);
    log.event("seam-joined", { chains: chains.length, joins: joined, snapped });
  }

  /* 4: Visvalingam per ring */
  let N = 0; for (const r of rings) N += r.xs.length;
  const ringOffset = new Uint32Array(rings.length + 1), X = new Int32Array(N), Y = new Int32Array(N), S = new Float32Array(N);
  let off = 0, biggest = 0;
  const census = CENSUS_M.map(() => ({ vertices: 0, rings: 0 }));
  rings.forEach((r, ri) => {
    const xs = r.xs, ys = r.ys, n = xs.length; ringOffset[ri] = off;
    const area = R.visvalingam(xs, ys, true);
    const surv = new Int32Array(CENSUS_M.length);
    for (let i = 0; i < n; i++) {
      X[off + i] = xs[i]; Y[off + i] = ys[i];
      const sz = area[i] === Infinity ? 1e9 : Math.sqrt(area[i]);
      S[off + i] = sz;
      for (let c = 0; c < CENSUS_M.length; c++) if (sz >= CENSUS_M[c]) surv[c]++;
    }
    for (let c = 0; c < CENSUS_M.length; c++) if (surv[c] >= 3) { census[c].vertices += surv[c]; census[c].rings++; }
    off += n; if (n > biggest) biggest = n;
    rings[ri] = null;   // free as we go
    if (ri % 100000 === 0 && ri) say(`  visvalingam: ${ri} rings`);
  });
  ringOffset[rings.length] = off;
  say(`visvalingam: ${rings.length} rings, ${N} vertices (largest ring ${biggest})`);
  console.log("  census — vertices and rings that survive each tolerance (a ring needs 3 vertices):");
  CENSUS_M.forEach((m, c) => console.log(`    ${String(m).padStart(5)} m   ${String(census[c].vertices).padStart(10)} vertices   ${String(census[c].rings).padStart(7)} rings`));

  if (censusOnly) return;
  /* 5: write */
  fs.mkdirSync(OUT, { recursive: true });
  const header = {
    format: "folio-coast", generated: new Date().toISOString(), generator: "folio atlas-build: build-land.js",
    quantum: R.QUANTUM, rings: rings.length, vertices: N,
    source: { id: SOURCE, sha256: src.sha256, version: src.entry.version, dataDate },
    orientation: "land on the left of every ring",
    census: CENSUS_M.map((m, c) => ({ tolerance_m: m, vertices: census[c].vertices, rings: census[c].rings })),
    stats: { records, parts, degenerate, spikes, holes, polar, chains: chains.length, biggestRing: biggest },
  };
  const bytes = Coast.write(path.join(OUT, "coast.bin"), { header, ringOffset, x: X, y: Y, size: S });
  log.write(path.join(OUT, "land-log.json"));
  log.print();
  log.check();
  say(`wrote out/coast.bin (${(bytes / 1048576).toFixed(1)} MB) and out/land-log.json`);
}

try { main(); } catch (e) { console.error("✗ build-land: " + (e.stack || e.message)); process.exit(1); }
