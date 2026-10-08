/* lib/segindex.js — a compact grid index over millions of segments, for the conflation and the checker.

   lib/geo.js's Grid files segment ids into a Map of arrays, which is fine for Natural Earth (400k
   segments) and not for OSM (6–80 M): the Map alone would be gigabytes. This index files every
   (cell, segment) pair into two typed arrays, radix-sorted by cell, and answers "which segments touch
   this cell" by binary search over the distinct cells. Everything is quantised integer lon/lat; a
   segment is filed under every cell its bounding box touches (a segment spanning the antimeridian is
   filed under both ends' cells only). Cell keys are 32-bit — the first version packed (cell, id) into
   a double and lost bits above 2^53, which put segments in the wrong cells; never again.

     const idx = SegIndex.build(count, cellUnits, (i) => [x1, y1, x2, y2]);
     idx.cell(cx, cy, fn)             fn(segmentId) for each segment filed under that cell
     idx.near(x, y, radiusUnits, fn)  fn(segmentId) once for each segment filed in a cell within the radius
     idx.pairs(fn)                    fn(a, b) once per unordered pair sharing at least one cell
*/
"use strict";

const X180 = 720000;   // only used to spot a seam-spanning segment (the quantum is 2.5e-4° everywhere)
const CX0 = 9001, CY0 = 4501, CW = 18003;   // cell offsets: cx ∈ [-9001, 9001], cy ∈ [-4501, 4501] for any cell ≥ 80 units
function K(cx, cy) { return (cx + CX0) * (2 * CY0 + 1) + (cy + CY0); }

function build(count, cellU, segOf) {
  if (cellU < 80) throw new Error("segindex: cells narrower than 80 units (0.02°) overflow the 32-bit key");
  const cellsOf = (i, fn) => {
    const s = segOf(i);
    const ax = Math.min(s[0], s[2]), bx = Math.max(s[0], s[2]), ay = Math.min(s[1], s[3]), by = Math.max(s[1], s[3]);
    if (bx - ax > X180) { fn(Math.floor(s[0] / cellU), Math.floor(s[1] / cellU)); fn(Math.floor(s[2] / cellU), Math.floor(s[3] / cellU)); return; }
    const cx0 = Math.floor(ax / cellU), cx1 = Math.floor(bx / cellU), cy0 = Math.floor(ay / cellU), cy1 = Math.floor(by / cellU);
    for (let cx = cx0; cx <= cx1; cx++) for (let cy = cy0; cy <= cy1; cy++) fn(cx, cy);
  };
  // per segment: its cell box (for the pair dedupe) and whether it spans the seam
  const bx0 = new Int32Array(count), bx1 = new Int32Array(count), by0 = new Int32Array(count), by1 = new Int32Array(count), seam = new Uint8Array(count);
  let total = 0;
  for (let i = 0; i < count; i++) {
    const s = segOf(i);
    const ax = Math.min(s[0], s[2]), bx = Math.max(s[0], s[2]);
    if (bx - ax > X180) { seam[i] = 1; total += 2; continue; }
    bx0[i] = Math.floor(ax / cellU); bx1[i] = Math.floor(bx / cellU); by0[i] = Math.floor(Math.min(s[1], s[3]) / cellU); by1[i] = Math.floor(Math.max(s[1], s[3]) / cellU);
    total += (bx1[i] - bx0[i] + 1) * (by1[i] - by0[i] + 1);
  }
  const key = new Uint32Array(total), id = new Uint32Array(total);
  let k = 0;
  for (let i = 0; i < count; i++) cellsOf(i, (cx, cy) => { key[k] = K(cx, cy); id[k] = i; k++; });
  // radix sort (two 16-bit passes) of the entries by key
  const order = radixSort(key);
  const cellKey = new Uint32Array(total), sid = new Uint32Array(total);
  for (let i = 0; i < total; i++) { cellKey[i] = key[order[i]]; sid[i] = id[order[i]]; }
  let nCells = 0; for (let i = 0; i < total; i++) if (i === 0 || cellKey[i] !== cellKey[i - 1]) nCells++;
  const cellStart = new Uint32Array(nCells + 1), cellId = new Uint32Array(nCells);
  let c = 0; for (let i = 0; i < total; i++) { if (i === 0 || cellKey[i] !== cellKey[i - 1]) { cellId[c] = cellKey[i]; cellStart[c] = i; c++; } }
  cellStart[nCells] = total;
  const find = (ck) => { let lo = 0, hi = nCells - 1; while (lo <= hi) { const m = (lo + hi) >> 1; if (cellId[m] < ck) lo = m + 1; else if (cellId[m] > ck) hi = m - 1; else return m; } return -1; };
  return {
    total, nCells, cellU,
    cell(cx, cy, fn) { const c = find(K(cx, cy)); if (c < 0) return; for (let i = cellStart[c]; i < cellStart[c + 1]; i++) fn(sid[i]); },
    near(x, y, rU, fn) {
      const cx0 = Math.floor((x - rU) / cellU), cx1 = Math.floor((x + rU) / cellU), cy0 = Math.floor((y - rU) / cellU), cy1 = Math.floor((y + rU) / cellU);
      const seen = new Set();
      for (let cx = cx0; cx <= cx1; cx++) for (let cy = cy0; cy <= cy1; cy++) this.cell(cx, cy, (s) => { if (!seen.has(s)) { seen.add(s); fn(s); } });
    },
    pairs(fn) {
      // a pair sharing several cells is reported once: from the lowest-keyed cell both bounding boxes
      // cover (no global Set — V8's Set stops at 2^24 entries, and LOD 2 alone has more pairs than that)
      for (let c = 0; c < nCells; c++) {
        const s0 = cellStart[c], e = cellStart[c + 1];
        if (e - s0 < 2) continue;
        const ck = cellId[c];
        for (let i = s0; i < e; i++) {
          const a = sid[i], ax0 = bx0[a], ay0 = by0[a], as = seam[a];
          for (let j = i + 1; j < e; j++) {
            const b = sid[j];
            if (!as && !seam[b]) {
              const cx = ax0 > bx0[b] ? ax0 : bx0[b], cy = ay0 > by0[b] ? ay0 : by0[b];
              if ((cx + CX0) * (2 * CY0 + 1) + (cy + CY0) !== ck) continue;   // not the lowest shared cell
            }   // a seam-spanning segment is filed under its two end cells only: reported from each, harmlessly
            fn(a, b);
          }
        }
      }
    },
  };
}

function radixSort(key) {
  const n = key.length;
  let order = new Uint32Array(n), tmp = new Uint32Array(n);
  for (let i = 0; i < n; i++) order[i] = i;
  for (let shift = 0; shift < 32; shift += 16) {
    const count = new Uint32Array(65537);
    for (let i = 0; i < n; i++) count[((key[order[i]] >>> shift) & 65535) + 1]++;
    for (let b = 0; b < 65536; b++) count[b + 1] += count[b];
    for (let i = 0; i < n; i++) { const b = (key[order[i]] >>> shift) & 65535; tmp[count[b]++] = order[i]; }
    const t = order; order = tmp; tmp = t;
  }
  return order;
}

module.exports = { build, K };
