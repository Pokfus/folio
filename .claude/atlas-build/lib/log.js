/* lib/log.js — the snap log (docs/atlas-v2-design.md §2.3, conflation step 4).

   "Every snap is logged; the build fails if a snap moves a vertex by more than the source's
   tolerance." This is that log. A build step creates one, records every vertex it moved, merged
   or re-added, and at the end either writes the log beside its output or throws. Nothing here is
   clever: the value is that a conflation decision is never silent.

     const log = new SnapLog("build-land", { "ne-10m-admin0": 1000 });   // tolerance in metres per source
     log.snap({ source: "ne-10m-admin0", kind: "vertex→coast-vertex", from: [lon, lat], to: [lon, lat], metres, note });
     log.event("seam-removed", { entity, arcs: 2 });          // anything worth a line that is not a move
     log.check();                                             // throws if any snap exceeded its tolerance
     log.write("out/snap-log.json");                          // the full record, plus a summary
     log.summary()                                            // { snaps, bySource, byKind, maxMetres, events }

   Distances are great-circle metres (haversine) so a tolerance means the same thing at every latitude.
*/
"use strict";
const fs = require("fs"), path = require("path");

const R_EARTH_M = 6371008.8;
function metresBetween(a, b) {
  const toR = Math.PI / 180;
  const dLat = (b[1] - a[1]) * toR, dLon = (b[0] - a[0]) * toR;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * toR) * Math.cos(b[1] * toR) * Math.sin(dLon / 2) ** 2;
  return 2 * R_EARTH_M * Math.asin(Math.min(1, Math.sqrt(s)));
}

class SnapLog {
  constructor(step, tolerances) {
    this.step = step;
    this.tolerances = tolerances || {};
    this.snaps = [];
    this.events = [];
    this.started = new Date().toISOString();
  }
  tolerance(source) {
    const t = this.tolerances[source];
    if (t == null) throw new Error(`snap log: no tolerance declared for source "${source}" — every source that is conflated must state its precision`);
    return t;
  }
  snap(rec) {
    if (!rec || !rec.source || !rec.kind || !rec.from || !rec.to) throw new Error("snap log: a snap needs source, kind, from, to");
    const metres = rec.metres != null ? rec.metres : metresBetween(rec.from, rec.to);
    const tol = this.tolerance(rec.source);
    this.snaps.push(Object.assign({}, rec, { metres: Math.round(metres * 100) / 100, tolerance: tol, over: metres > tol }));
  }
  event(kind, detail) { this.events.push(Object.assign({ kind }, detail || {})); }
  summary() {
    const bySource = {}, byKind = {};
    let max = 0, over = 0;
    for (const s of this.snaps) {
      bySource[s.source] = (bySource[s.source] || 0) + 1;
      byKind[s.kind] = (byKind[s.kind] || 0) + 1;
      if (s.metres > max) max = s.metres;
      if (s.over) over++;
    }
    const eventsByKind = {};
    for (const e of this.events) eventsByKind[e.kind] = (eventsByKind[e.kind] || 0) + 1;
    return { step: this.step, snaps: this.snaps.length, over, maxMetres: max, bySource, byKind, events: eventsByKind, tolerances: this.tolerances };
  }
  check() {
    const bad = this.snaps.filter((s) => s.over);
    if (bad.length) {
      const b = bad[0];
      throw new Error(`${this.step}: ${bad.length} snap(s) exceed the source tolerance — first: ${b.kind} from ${b.from} to ${b.to}, ${b.metres} m > ${b.tolerance} m (${b.source})`);
    }
  }
  write(file) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify({ started: this.started, finished: new Date().toISOString(), summary: this.summary(), snaps: this.snaps, events: this.events }, null, 1));
  }
  print() {
    const s = this.summary();
    console.log(`  snap log (${s.step}): ${s.snaps} snaps, max ${s.maxMetres} m, ${s.over} over tolerance`);
    for (const k of Object.keys(s.byKind)) console.log(`    ${k.padEnd(34)} ${s.byKind[k]}`);
    for (const k of Object.keys(s.events)) console.log(`    event ${k.padEnd(28)} ${s.events[k]}`);
  }
}

module.exports = { SnapLog, metresBetween, R_EARTH_M };
