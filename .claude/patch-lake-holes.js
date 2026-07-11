// One-time patch: in every GEO era, reclassify LAKE-ring edges from '0' (drawn border) to '1' (coast → skipped; the app's
// coastEdges then draws the present-day coast there, which it drops for lakes → clean). A ring is a LAKE iff its interior is
// WATER — i.e. inside NO territory (even-odd). This catches both holes cut into a territory AND standalone lake polygons.
// ENCLAVES (interior inside another territory, e.g. Kandy in Ceylon, Lesotho in South Africa) and real land polygons keep '0'.
const fs = require('fs');
const path = require('path');
const SRC = path.join(__dirname, '..', 'timeline.js');
const BACKUP = path.join(__dirname, 'backup', 'pre-1800', 'timeline-pre-lakefix.js');
// always start from the pre-fix backup if present, so this patch is the single source of truth
if (fs.existsSync(BACKUP)) fs.copyFileSync(BACKUP, SRC);
const txt = fs.readFileSync(SRC, 'utf8');
const head = txt.slice(0, txt.indexOf('window.TIMELINE'));
global.window = {};
require('../timeline.js');
const TL = window.TIMELINE;

const rb = (ring) => { let x0 = 180, y0 = 90, x1 = -180, y1 = -90; for (const p of ring) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; } return { x0, y0, x1, y1, mx: (x0 + x1) / 2, my: (y0 + y1) / 2, sp: Math.max(x1 - x0, y1 - y0) }; };
const inR = (lo, la, ring) => { let c = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1]; if (((yi > la) !== (yj > la)) && (lo < (xj - xi) * (la - yi) / (yj - yi) + xi)) c = !c; } return c; };
// point inside a territory's FILLED area (even-odd across all its rings)
const inTerr = (lo, la, T) => { let inside = false; for (const ring of T.p) if (inR(lo, la, ring)) inside = !inside; return inside; };

let changedRings = 0, changedEdges = 0; const report = [];
for (const e of TL) {
  if (!e.geo) continue;
  const terrs = e.geo.map((t) => ({ t, bb: rb(t.p[0] || []), rings: t.p.map(rb) }));
  // full-territory bbox for a quick reject
  for (const o of terrs) { let x0 = 180, y0 = 90, x1 = -180, y1 = -90; for (const r of o.rings) { if (r.x0 < x0) x0 = r.x0; if (r.x1 > x1) x1 = r.x1; if (r.y0 < y0) y0 = r.y0; if (r.y1 > y1) y1 = r.y1; } o.fbb = { x0, y0, x1, y1 }; }
  for (let ti = 0; ti < terrs.length; ti++) {
    const { t, rings } = terrs[ti];
    if (!t.c) continue;
    for (let ri = 0; ri < t.p.length; ri++) {
      const mask = t.c[ri] || ''; if (!mask.includes('0')) continue;   // already coast — nothing to change
      const bb = rings[ri]; if (bb.sp >= 9) continue;                  // a lake is never continent-sized → skip big outer rings cheaply
      const ring = t.p[ri];
      // sample the ring interior; how many sample points fall inside SOME territory (land) vs none (water)?
      let samp = 0, land = 0;
      for (let s = 1; s < 12; s++) for (let u = 1; u < 12; u++) {
        const x = bb.x0 + (bb.x1 - bb.x0) * s / 12, y = bb.y0 + (bb.y1 - bb.y0) * u / 12;
        if (!inR(x, y, ring)) continue; samp++;
        let onLand = false;
        for (let oj = 0; oj < terrs.length; oj++) { const O = terrs[oj]; if (x < O.fbb.x0 || x > O.fbb.x1 || y < O.fbb.y0 || y > O.fbb.y1) continue; if (inTerr(x, y, O.t)) { onLand = true; break; } }
        if (onLand) land++;
      }
      if (samp === 0 || land >= samp * 0.15) continue;   // interior is land (own territory / an enclave) → keep border '0'
      const zeros = (mask.match(/0/g) || []).length;
      t.c[ri] = '1'.repeat(mask.length);
      changedRings++; changedEdges += zeros;
      report.push(`  ${e.year}  ${t.n.slice(0, 24).padEnd(25)} @[${bb.mx.toFixed(1)},${bb.my.toFixed(1)}] sp${bb.sp.toFixed(2)}  ${zeros} edges 0→1  (land ${land}/${samp})`);
    }
  }
}
console.log('Reclassified LAKE rings:', changedRings, ' edges:', changedEdges);
report.forEach((r) => console.log(r));

if (process.argv[2] === '--write') {
  fs.writeFileSync(SRC, head + 'window.TIMELINE = ' + JSON.stringify(TL) + ';\n');
  console.log('WROTE timeline.js (backup preserved: .claude/backup/pre-1800/timeline-pre-lakefix.js)');
} else {
  fs.writeFileSync(SRC, txt);   // restore original (dry run leaves file untouched)
  console.log('(dry run — pass --write to save)');
}
