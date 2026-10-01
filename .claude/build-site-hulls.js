#!/usr/bin/env node
/* build-site-hulls.js — outline an archaeological CULTURE from its dated sites, per phase, and write
   `.claude/site-hulls.json` for build-polities.js to ship.

     node .claude/build-site-hulls.js --hosner=<hosner_2016.tab> [--dry]

   WHY (Oct 2026; docs/atlas-borders-audit.md, batch 4). A culture is not a polity, so Cliopatria has none
   of them, and a hand-drawn blob of nine points was all the atlas had. What open data DOES have is sites:
   Hosner et al. 2016 lists 51,074 Chinese Neolithic and Bronze Age sites with a culture label and, for
   some, a phase. The outline of where a culture's sites are is a defensible extent — it is what a
   distribution map in the literature draws — and a phase's sites, outlined separately, make it MOVE.

   SOURCE AND LICENCE. Hosner, D., Wagner, M., Tarasov, P. E., Chen, X. & Leipe, C. (2016): Archaeological
   sites in China during the Neolithic and Bronze Age [dataset]. PANGAEA, doi:10.1594/PANGAEA.860072 —
   CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/). Download the tab-delimited file once:
       curl -sL "https://doi.pangaea.de/10.1594/PANGAEA.860072?format=textfile" -o hosner_2016.tab
   and never put it in the repo. Only the derived outlines are committed, with the credit, and the
   polity bundle's header repeats it. Open and free sources only (see the audit's §3).

   THE METHOD, and every step is a choice that changes the shape:
     1. sites → a 0.2° grid (about 20 km);
     2. CLOSING — dilate the occupied cells by 2 and erode by 2 — so two clusters a valley apart join and a
        bay between them does not;
     3. a component holding under 3% of the phase's sites is DROPPED — an outlier is a site, not territory;
     4. the cells' outline traced (edges between filled and empty cells, chained into rings), rounded off
        by two passes of Chaikin corner-cutting (a grid outline is a staircase), then Douglas–Peucker at
        0.08° and rounded to 0.01°. Holes are dropped.
   A phase with fewer than 40 sites is not outlined at all: an outline of a handful of sites is a claim
   about where the excavators were.

   Zero dependencies. Not part of the site. */
"use strict";
const fs = require("fs"), path = require("path");
const OUT = path.join(__dirname, "site-hulls.json");
const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const arg = (k) => { const a = args.find((x) => x.startsWith("--" + k + "=")); return a ? a.slice(k.length + 3) : null; };
const die = (m) => { console.error("ERROR: " + m); process.exit(1); };

const CELL = 0.2, CLOSE = 2, MIN_SHARE = 0.03, MIN_SITES = 40, TOL = 0.08;

/* WHAT IS OUTLINED. A step names the culture labels that make it up, exactly as Hosner writes them. */
const SPEC = {
  yangshao: {
    label: "Yangshao culture",
    steps: [
      { from: -5000, to: -4001, labels: ["early Yangshao culture", "early + middle Yangshao cultures"] },
      { from: -4000, to: -3501, labels: ["middle Yangshao culture", "early + middle Yangshao cultures"] },
      { from: -3500, to: -3000, labels: ["late Yangshao culture"] },
    ],
  },
  longshan: {
    label: "Longshan culture",
    steps: [{ from: -3000, to: -1900, labels: ["Longshan culture"] }],
  },
};

const src = arg("hosner");
if (!src || !fs.existsSync(src)) die("pass --hosner=<path to the PANGAEA tab file> (see this file's header)");
const lines = fs.readFileSync(src, "utf8").split("\n");
const start = lines.findIndex((l) => l.startsWith("*/"));
const head = lines[start + 1].split("\t");
const iCult = head.indexOf("Cult age"), iLon = head.indexOf("Longitude"), iLat = head.indexOf("Latitude");
if (iCult < 0 || iLon < 0 || iLat < 0) die("the file has no Cult age / Longitude / Latitude columns");
const sites = [];
for (const l of lines.slice(start + 2)) {
  const f = l.split("\t"); if (f.length <= iLat) continue;
  const lon = Number(f[iLon]), lat = Number(f[iLat]);
  if (isFinite(lon) && isFinite(lat)) sites.push({ c: f[iCult], lon, lat });
}
console.log(sites.length + " sites read");

function dp(pts, tol) {
  if (pts.length < 3) return pts.slice();
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const st = [[0, pts.length - 1]], t2 = tol * tol;
  while (st.length) {
    const [a, b] = st.pop(), ax = pts[a][0], ay = pts[a][1], dx = pts[b][0] - ax, dy = pts[b][1] - ay, L = dx * dx + dy * dy;
    let best = -1, bd = t2;
    for (let i = a + 1; i < b; i++) {
      let px = pts[i][0] - ax, py = pts[i][1] - ay;
      if (L) { const t = Math.max(0, Math.min(1, (px * dx + py * dy) / L)); px -= t * dx; py -= t * dy; }
      const d = px * px + py * py; if (d > bd) { bd = d; best = i; }
    }
    if (best >= 0) { keep[best] = 1; st.push([a, best], [best, b]); }
  }
  return pts.filter((p, i) => keep[i]);
}

// corner-cutting on a closed ring: a grid outline is a staircase, and two passes round it into a coastline-like edge
function chaikin(r) {
  const o = [];
  for (let i = 0; i < r.length; i++) { const a = r[i], b = r[(i + 1) % r.length];
    o.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]); }
  return o;
}
function outline(pts) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of pts) { x0 = Math.min(x0, p.lon); x1 = Math.max(x1, p.lon); y0 = Math.min(y0, p.lat); y1 = Math.max(y1, p.lat); }
  const pad = CLOSE + 2, ox = Math.floor(x0 / CELL) - pad, oy = Math.floor(y0 / CELL) - pad;
  const W = Math.ceil(x1 / CELL) - ox + pad + 1, H = Math.ceil(y1 / CELL) - oy + pad + 1;
  const cnt = new Int32Array(W * H);
  for (const p of pts) cnt[(Math.floor(p.lat / CELL) - oy) * W + (Math.floor(p.lon / CELL) - ox)]++;
  let g = new Uint8Array(W * H); for (let i = 0; i < g.length; i++) g[i] = cnt[i] ? 1 : 0;
  const morph = (src, on) => { const out = new Uint8Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let v = on ? 0 : 1;
      for (let dy = -1; dy <= 1 && v !== (on ? 1 : 0); dy++) for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx, yy = y + dy, s = xx < 0 || yy < 0 || xx >= W || yy >= H ? 0 : src[yy * W + xx];
        if (on && s) { v = 1; break; } if (!on && !s) { v = 0; break; }
      }
      out[y * W + x] = v;
    } return out; };
  for (let i = 0; i < CLOSE; i++) g = morph(g, true);
  for (let i = 0; i < CLOSE; i++) g = morph(g, false);
  // components, weighted by the sites they hold
  const comp = new Int32Array(W * H).fill(-1), weight = [];
  for (let i = 0; i < g.length; i++) {
    if (!g[i] || comp[i] >= 0) continue;
    const id = weight.length; let w = 0; const q = [i]; comp[i] = id;
    while (q.length) { const k = q.pop(); w += cnt[k]; const x = k % W, y = (k / W) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue; const kk = yy * W + xx; if (g[kk] && comp[kk] < 0) { comp[kk] = id; q.push(kk); } } }
    weight.push(w);
  }
  const keep = weight.map((w) => w >= pts.length * MIN_SHARE);
  for (let i = 0; i < g.length; i++) if (g[i] && !keep[comp[i]]) g[i] = 0;
  // boundary edges, directed with the filled cell on the left, chained into rings
  const fill = (x, y) => x >= 0 && y >= 0 && x < W && y < H && g[y * W + x];
  const next = new Map(), key = (x, y) => x + "," + y;
  const edge = (ax, ay, bx, by) => next.set(key(ax, ay), [bx, by]);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!fill(x, y)) continue;
    if (!fill(x, y - 1)) edge(x, y, x + 1, y);
    if (!fill(x + 1, y)) edge(x + 1, y, x + 1, y + 1);
    if (!fill(x, y + 1)) edge(x + 1, y + 1, x, y + 1);
    if (!fill(x - 1, y)) edge(x, y + 1, x, y);
  }
  const rings = [], seen = new Set();
  for (const k0 of next.keys()) {
    if (seen.has(k0)) continue;
    const ring = []; let k = k0, guard = 0;
    while (!seen.has(k) && guard++ < 1e6) { seen.add(k); const [x, y] = k.split(",").map(Number); ring.push([(x + ox) * CELL, (y + oy) * CELL]); const n = next.get(k); if (!n) break; k = key(n[0], n[1]); }
    if (ring.length < 4) continue;
    // shoelace: grid y runs north, so an outer ring traced filled-on-left comes out counter-clockwise
    let a = 0; for (let i = 0; i < ring.length; i++) { const p = ring[i], q = ring[(i + 1) % ring.length]; a += p[0] * q[1] - q[0] * p[1]; }
    if (a <= 0) continue;   // a hole — dropped
    const s = dp(chaikin(chaikin(ring)).concat([ring[0]]), TOL).slice(0, -1).map((p) => [Math.round(p[0] * 100) / 100, Math.round(p[1] * 100) / 100]);
    if (s.length >= 4) rings.push(s);
  }
  return rings;
}

const out = { _about: "GENERATED by .claude/build-site-hulls.js — outlines of archaeological cultures from their dated sites, merged into polities.js by build-polities.js (spec: `sites: \"<key>\"`). SOURCE: Hosner, Wagner, Tarasov, Chen & Leipe (2016), Archaeological sites in China during the Neolithic and Bronze Age, PANGAEA, doi:10.1594/PANGAEA.860072. LICENCE: CC BY 3.0, https://creativecommons.org/licenses/by/3.0/. CHANGES: sites gridded at " + CELL + "°, closed by " + CLOSE + " cells, components under " + MIN_SHARE * 100 + "% of a phase's sites dropped, outlines simplified at " + TOL + "°.", hulls: {} };
for (const k of Object.keys(SPEC)) {
  const steps = [];
  for (const st of SPEC[k].steps) {
    const pts = sites.filter((s) => st.labels.indexOf(s.c) >= 0);
    if (pts.length < MIN_SITES) { console.warn("  " + k + " " + st.from + "…" + st.to + ": only " + pts.length + " sites — not outlined"); continue; }
    const rings = outline(pts);
    console.log("  " + k.padEnd(10) + st.from + "…" + st.to + ": " + pts.length + " sites → " + rings.length + " ring(s), " + rings.reduce((a, r) => a + r.length, 0) + " points");
    if (rings.length) steps.push([st.from, st.to, rings]);
  }
  out.hulls[k] = { n: SPEC[k].label, s: steps };
}
if (DRY) { console.log("dry run"); process.exit(0); }
fs.writeFileSync(OUT, JSON.stringify(out) + "\n");
console.log("wrote " + path.relative(path.join(__dirname, ".."), OUT));
