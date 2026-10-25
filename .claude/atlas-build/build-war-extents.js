#!/usr/bin/env node
/* build-war-extents.js — the war extents DERIVED from an open source (Atlas v2 Phase 2d, task 2; docs/atlas-borders-audit.md §6 batches 5 and 6, §7).

     node .claude/atlas-build/build-war-extents.js [--check]

   WHAT IT MAKES: .claude/atlas-build/war-extents.json — rows [from, to, rings] for the three war sides whose audit row names an open source, keyed by the
   extent they replace (`ext_<slug>`, as lib/war-resolve.js names them). build-history.js reads it in place of the card's authored ring for those keys and
   refuses it when it was not built from the pinned bytes (as it does site-hulls.json); the entity says what it is made of.

     · ext_western_confederacy (us-072, the Northwest Indian War, 1785–95) — "the Ohio country minus the Royce cessions, by treaty date" (the audit's
       own definition, §4.D and §6b). The USFS "Indian Land Cessions in the United States" (Royce 1899, digitised; US federal, public domain), the cession
       polygons that meet the card's authored ring, and the Schedule's treaty dates: a year's shape is the card's own authored ring — the EDITORIAL northern
       and western limit of "the Ohio country" the audit says a source cannot draw — less every cession whose treaty date is on or before the end of that year.
       The rows: the ring whole until 1788 (the three tracts granted to the "Christian Indians" are cessions 4–6, dated 1788-09-03), less those from 1788, and
       from 1795 (the Treaty of Greenville, 3 August) less the seventeen cessions of the Greenville schedule too.
     · ext_sparta and ext_messenia (gr-235, gr-236, gr-237, gr-461) — "Lacedaemon split at Taygetos (OHM, CC0)" (batch 5). OpenHistoricalMap's one Lacedaemon
       polygon (relation 2849727, -900…-371, CC0; its own tags say "needs source for boundary lines") already INCLUDES Messenia, so it cannot serve a war between the
       two: the split is the card's own authored Messenia ring, the Taygetos line Folio drew. Messenia is the OHM polygon inside that ring, Sparta the OHM polygon
       outside it. The OUTER limit is OHM's; the LINE BETWEEN THEM is Folio's, and both are said on the entity's card.

   Both inputs are pinned in sources.json (url, sha256, licence) and verified by ensureSource before a byte is read. Planar clipping in lon/lat
   (polygon-clipping, an offline-generator library that never ships): the regions are a few degrees across. */
"use strict";
const fs = require("fs"), path = require("path");
const HERE = __dirname, ROOT = path.join(HERE, "..", "..");
const { ensureSource } = require("./fetch-sources.js");
const OUT_FILE = path.join(HERE, "war-extents.json");
const SRC = { ohm: "ohm-lacedaemon", usfs: "usfs-royce-cessions", sched: "usfs-royce-schedule", pleiades: "pleiades-places" };
const POLEIS_FILE = path.join(HERE, "war-poleis.json");

const closeRing = (r) => { const a = r[0], b = r[r.length - 1]; return a[0] === b[0] && a[1] === b[1] ? r : r.concat([a]); };
const r5 = (v) => Math.round(v * 1e5) / 1e5;
const flat = (mp) => mp.flatMap((poly) => poly.map((ring) => ring.slice(0, -1).map((q) => [r5(q[0]), r5(q[1])])));   // polygon-clipping's MultiPolygon → a flat list of rings (the builder nests holes by depth)

function cardRing(cards, id, side) {
  const c = cards.find((x) => x.id === id); if (!c || !c.war || !c.war[side] || !c.war[side].area) throw new Error(`${id} carries no authored area for ${side}`);
  const a = c.war[side].area; return (Array.isArray(a[0][0]) ? a : [a]).map(closeRing);
}

/* OHM's relation → closed outer rings: the `outer` ways chained end to end by shared endpoints */
function ohmRings(json) {
  const rel = json.elements.find((e) => e.type === "relation"); if (!rel) throw new Error("no relation in the OHM file");
  const ways = rel.members.filter((m) => m.role === "outer" && m.geometry && m.geometry.length > 1).map((m) => m.geometry.map((p) => [p.lon, p.lat]));
  const key = (p) => p[0].toFixed(7) + "," + p[1].toFixed(7);
  const rings = []; const left = ways.slice();
  while (left.length) {
    let cur = left.shift().slice();
    for (let guard = 0; guard < 1000; guard++) {
      if (key(cur[0]) === key(cur[cur.length - 1]) && cur.length > 3) break;
      const end = key(cur[cur.length - 1]); let found = -1, rev = false;
      for (let i = 0; i < left.length; i++) { if (key(left[i][0]) === end) { found = i; break; } if (key(left[i][left[i].length - 1]) === end) { found = i; rev = true; break; } }
      if (found < 0) break;
      const w = left.splice(found, 1)[0]; if (rev) w.reverse(); cur = cur.concat(w.slice(1));
    }
    if (key(cur[0]) !== key(cur[cur.length - 1])) throw new Error("OHM relation's outer ways do not close into a ring (open at " + key(cur[cur.length - 1]) + ")");
    rings.push(cur);
  }
  return { rel, rings };
}

function build(o) {
  o = o || {};
  const PC = require("polygon-clipping");
  const cards = require(path.join(ROOT, ".claude", "card-io.js")).loadCards().cards;
  const out = { _about: "GENERATED by .claude/atlas-build/build-war-extents.js — never edit. Rows of the war extents derived from open sources (see that script's header): [from, to, rings] per extent key, rings as flat lon/lat lists (holes nest by depth). build-history.js reads it in place of the card's own authored ring for these keys and checks every source hash against sources.json.", sources: {}, extents: {} };
  // ---- the Western Confederacy ----
  {
    const g = ensureSource(SRC.usfs), t = ensureSource(SRC.sched);
    out.sources[SRC.usfs] = g.sha256; out.sources[SRC.sched] = t.sha256;
    const geo = JSON.parse(fs.readFileSync(g.archive, "utf8")), tab = JSON.parse(fs.readFileSync(t.archive, "utf8"));
    const ring = cardRing(cards, "us-072", "losers");
    const dateOf = new Map();   // cession number → its earliest Schedule date (ms → "YYYY-MM-DD"); a cession with several dates takes the first, the treaty that made it
    for (const f of tab.features) { const a = f.attributes; const ds = [1, 2, 3, 4, 5].map((i) => a["cessdate" + i]).filter((v) => v != null).sort((x, y) => x - y); if (!ds.length) continue; const d = new Date(ds[0]).toISOString().slice(0, 10); const cur = dateOf.get(a.cessnum); if (!cur || d < cur) dateOf.set(a.cessnum, d); }
    const bbox = ring.flat().reduce((b, q) => [Math.min(b[0], q[0]), Math.min(b[1], q[1]), Math.max(b[2], q[0]), Math.max(b[3], q[1])], [1e9, 1e9, -1e9, -1e9]);
    const cess = [];
    for (const f of geo.features) {
      const n = f.properties.cessnum, d = dateOf.get(n); if (!d) throw new Error("cession " + n + " has no Schedule date in the pinned table");
      const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const p of polys) for (const q of p[0]) { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); }
      if (x1 < bbox[0] || x0 > bbox[2] || y1 < bbox[1] || y0 > bbox[3]) continue;
      cess.push({ n, date: d, polys });
    }
    const years = []; for (let y = 1785; y <= 1795; y++) years.push(y);
    const rows = []; let last = null;
    for (const y of years) {
      const eff = cess.filter((c) => c.date <= y + "-12-31"), sig = eff.map((c) => c.n).sort().join(",");
      let shape;
      if (!eff.length) shape = [ring.map((r) => r.slice())];
      else { const sub = eff.flatMap((c) => c.polys); shape = PC.difference([ring], ...sub.map((p) => [p])); }
      if (last && last.sig === sig) { last.to = y; continue; }
      last = { from: y, to: y, sig, rings: flat(shape), cessions: eff.map((c) => c.n + "@" + c.date).sort() }; rows.push(last);
    }
    out.extents.ext_western_confederacy = { src: [SRC.usfs, SRC.sched], rows: rows.map((r) => ({ from: r.from, to: r.to, cessions: r.cessions, rings: r.rings })), note: "The Confederacy’s ground is the card’s own authored limit of the Ohio country less the cessions the Royce Schedule dates by the end of each year (USFS digitisation of Royce 1899, public domain): the outer limit is Folio’s, the cuts are Royce’s." };
  }
  // ---- Sparta and Messenia ----
  {
    const s = ensureSource(SRC.ohm); out.sources[SRC.ohm] = s.sha256;
    const { rel, rings } = ohmRings(JSON.parse(fs.readFileSync(s.archive, "utf8")));
    const lac = rings.map((r) => [closeRing(r)]);
    const mess = cardRing(cards, "gr-235", "losers");
    const inside = PC.intersection(lac, [mess]), outside = PC.difference(lac, [mess]);
    const w = { from: -743, to: -455 };   // the rows are cut to the years the wars use them by build-history (the union of the cards' war years)
    out.extents.ext_messenia = { src: [SRC.ohm], rows: [{ from: w.from, to: w.to, rings: flat(inside) }], note: "Messenia is the part of OpenHistoricalMap’s Lacedaemon polygon (relation " + rel.id + ", CC0; its own tags say “needs source for boundary lines”) that lies inside the Taygetos line Folio drew on the card: the outer limit is OHM’s, the line is Folio’s." };
    out.extents.ext_sparta = { src: [SRC.ohm], rows: [{ from: w.from, to: w.to, rings: flat(outside) }], note: "Sparta (Laconia) is OpenHistoricalMap’s Lacedaemon polygon (relation " + rel.id + ", CC0; its own tags say “needs source for boundary lines”) outside the Taygetos line Folio drew on the card: the outer limit is OHM’s, the line is Folio’s." };
  }
  // ---- the Peloponnesian War's two sides, year by year (2026-10-25, on request) ----
  if (fs.existsSync(POLEIS_FILE)) Object.assign(out.extents, poleisExtents(PC, out));
  const body = JSON.stringify(out, null, 1) + "\n";
  if (o.check) { const have = fs.existsSync(OUT_FILE) ? fs.readFileSync(OUT_FILE, "utf8") : ""; return { ok: have === body, body }; }
  fs.writeFileSync(OUT_FILE, body);
  return { ok: true, body };
}
/* THE PELOPONNESIAN WAR, YEAR BY YEAR (2026-10-25, on request: "make the borders in the atlas window more accurate and show more/better yearly border and alliance
   changes"). Batch 6 of the border audit deferred "Athens and its empire" because no open dataset draws a scatter of tribute-paying coasts whose membership changed
   year by year. This derives both sides from a TABLE instead of a polygon: war-poleis.json (committed, authored) lists every polis, island and region with the
   years it stood with each side and the ancient passage that says so (Thucydides, Xenophon, the Athenian Tribute Lists). The geometry is mechanical and open:
     · a polis is the land within its radius (default 12 km) of its town's representative point in Pleiades (the pinned places.csv, CC BY 3.0) — on an island that
       is not wholly its own, that circle within the island's coast ring;
     · an island is its whole coast ring from the committed core (topology.bin, the OSM coast);
     · "Lacedaemon" is OpenHistoricalMap's Lacedaemon polygon (the pinned relation, CC0), Laconia and Messenia together, as Sparta held both in these years.
   A year's side is the union of its members. Where the two sides' shapes meet, an entry marked `enclave` (Pylos, Cythera, Methana, Nisaea, Decelea …) keeps its own
   ground, and any other overlap goes piece by piece to the side whose nearest member town is closer. Consecutive years with the same members are one row.
   The shapes say "these towns' lands", not a frontier: the entity's note says so. */
function poleisExtents(PC, out) {
  const T = JSON.parse(fs.readFileSync(POLEIS_FILE, "utf8"));
  const pl = ensureSource(SRC.pleiades); out.sources[SRC.pleiades] = pl.sha256;
  const ohm = ensureSource(SRC.ohm); out.sources[SRC.ohm] = ohm.sha256;
  const lacRings = ohmRings(JSON.parse(fs.readFileSync(ohm.archive, "utf8"))).rings.map((r) => [closeRing(r)]);
  // Pleiades: id → [lon, lat] (the representative point), read from the pinned CSV (RFC 4180: quoted fields may hold commas, quotes and newlines)
  const want = new Set(T.entries.map((e) => String(e.pleiades || "")).filter(Boolean));
  const pt = new Map();
  { const txt = fs.readFileSync(pl.archive, "utf8").replace(/^﻿/, ""); let i = 0, row = [], f = "", q = false, head = null; const N = txt.length;
    const endRow = () => { row.push(f); f = ""; if (!head) head = row; else { const id = row[head.indexOf("id")]; if (want.has(id)) { const la = Number(row[head.indexOf("representative_latitude")]), lo = Number(row[head.indexOf("representative_longitude")]); if (isFinite(la) && isFinite(lo) && (la || lo)) pt.set(id, [lo, la]); } } row = []; };
    for (; i < N; i++) { const c = txt[i]; if (q) { if (c === '"') { if (txt[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; } else if (c === '"') q = true; else if (c === ",") { row.push(f); f = ""; } else if (c === "\n") endRow(); else if (c !== "\r") f += c; }
    if (f || row.length) endRow(); }
  for (const e of T.entries) if (e.pleiades && !pt.has(String(e.pleiades))) throw new Error(`war-poleis.json: ${e.name}: Pleiades ${e.pleiades} has no representative point in the pinned places.csv`);
  // the committed core's coast rings (land on the left), for the islands
  const F = require("./lib/format.js"), core = F.readFile(path.join(ROOT, "atlas", "data", "topology.bin")), Q = core.quantum, K = F.KIND, nCA = core.arcOffset.length - 1;
  const dir = new Int8Array(nCA).fill(1);
  { const l0 = core.header.entities.map((e) => !e.parent); for (const fc of core.faces) { if (!l0[fc.entity]) continue; for (const ring of fc.rings) for (const ref of ring) { const a = Math.abs(ref) - 1; if (core.arcKind[a] === K.COAST) dir[a] = ref > 0 ? 1 : -1; } } }
  const head = (a) => (dir[a] > 0 ? core.arcOffset[a] : core.arcOffset[a + 1] - 1), tail = (a) => (dir[a] > 0 ? core.arcOffset[a + 1] - 1 : core.arcOffset[a]);
  const pk = (i) => core.lon[i] * 4000000 + core.lat[i];
  const coast = [];
  { const byHead = new Map(); for (let a = 0; a < nCA; a++) if (core.arcKind[a] === K.COAST) { const k = pk(head(a)); let l = byHead.get(k); if (!l) byHead.set(k, l = []); l.push(a); }
    const used = new Uint8Array(nCA);
    for (let a0 = 0; a0 < nCA; a0++) { if (core.arcKind[a0] !== K.COAST || used[a0]) continue; const pts = []; let a = a0, g = 0;
      while (!used[a] && g++ < 1e6) { used[a] = 1; const idx = []; for (let i = core.arcOffset[a]; i < core.arcOffset[a + 1]; i++) idx.push(i); if (dir[a] < 0) idx.reverse(); for (let k = pts.length ? 1 : 0; k < idx.length; k++) pts.push([core.lon[idx[k]] * Q, core.lat[idx[k]] * Q]); const l = (byHead.get(pk(tail(a))) || []).filter((b) => !used[b]); if (!l.length) break; a = l[0]; }
      if (pts.length < 4) continue; let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, ar = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q2 = pts[(i + 1) % pts.length]; x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); ar += p[0] * q2[1] - q2[0] * p[1]; }
      if (ar > 0 && x1 - x0 < 6 && y1 - y0 < 6) coast.push({ pts, bb: [x0, y0, x1, y1], area: ar / 2 }); } }
  const pip = (poly, x, y) => { let k = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) k = !k; } return k; };
  // the smallest coast ring holding the point, else the one with a vertex nearest it within 3 km (a town's point may sit on the shore)
  const islandAt = (lon, lat, name) => {
    let best = null; for (const r of coast) { const b = r.bb; if (lon < b[0] || lon > b[2] || lat < b[1] || lat > b[3]) continue; if (pip(r.pts, lon, lat) && (!best || r.area < best.area)) best = r; }
    if (!best) { let bd = 3 / 111.2; for (const r of coast) { const b = r.bb; if (lon < b[0] - bd || lon > b[2] + bd || lat < b[1] - bd || lat > b[3] + bd) continue; for (const p of r.pts) { const d = Math.hypot((p[0] - lon) * Math.cos(lat * Math.PI / 180), p[1] - lat); if (d < bd) { bd = d; best = r; } } } }
    if (!best) throw new Error(`war-poleis.json: ${name}: no island coast ring at or within 3 km of ${lon}, ${lat}`);
    return [closeRing(best.pts.map((p) => [r5(p[0]), r5(p[1])]))];
  };
  const circle = (lon, lat, km) => { const out2 = [], dl = km / 111.2, c = Math.cos(lat * Math.PI / 180); for (let k = 0; k < 40; k++) { const t = (k / 40) * 2 * Math.PI; out2.push([r5(lon + (dl / c) * Math.cos(t)), r5(lat + dl * Math.sin(t))]); } return [closeRing(out2)]; };
  // each entry's ground, once
  const ground = new Map();
  for (const e of T.entries) {
    if (e.name === "Lacedaemon") { ground.set(e, lacRings); continue; }
    const p = pt.get(String(e.pleiades)), at = e.at || p;   // `at`: a point the table gives where Pleiades' point is not the town's (said in its `why`)
    if (e.kind === "island") ground.set(e, [islandAt(at[0], at[1], e.name)]);
    else { const c = circle(at[0], at[1], e.radiusKm || T.radiusKm || 12); ground.set(e, e.island ? PC.intersection([c], [islandAt((e.islandAt || at)[0], (e.islandAt || at)[1], e.island)]) : [c]); }
  }
  const y0 = T.years[0], y1 = T.years[1], res = {};
  const sideOf = (e, y) => { for (const sp of e.spans || []) if (y >= sp.from && y <= sp.to) return sp.side; return null; };
  const rowsBy = {}; for (const k of Object.keys(T.sides)) rowsBy[k] = [];
  let last = null;
  for (let y = y0; y <= y1; y++) {
    const mem = {}; for (const s of Object.values(T.sides)) mem[s] = []; for (const e of T.entries) { const s = sideOf(e, y); if (s && mem[s]) mem[s].push(e); }
    const sig = Object.values(T.sides).map((s) => mem[s].map((e) => e.name).sort().join(",")).join("|");
    if (last && last.sig === sig) { for (const k of Object.keys(T.sides)) rowsBy[k][rowsBy[k].length - 1].to = y; continue; }
    const shapes = {}; for (const s of Object.values(T.sides)) shapes[s] = mem[s].length ? PC.union(...mem[s].map((e) => ground.get(e))) : [];
    const [sa, sb] = Object.values(T.sides);
    const encl = (s) => mem[s].filter((e) => e.enclave).map((e) => ground.get(e));
    if (shapes[sa].length && encl(sb).length) shapes[sa] = PC.difference(shapes[sa], ...encl(sb));
    if (shapes[sb].length && encl(sa).length) shapes[sb] = PC.difference(shapes[sb], ...encl(sa));
    if (shapes[sa].length && shapes[sb].length) {
      const over = PC.intersection(shapes[sa], shapes[sb]);
      if (over.length) {
        const town = (e) => (e.name === "Lacedaemon" ? [22.43, 37.08] : e.at || pt.get(String(e.pleiades)));
        const near = (s, x, yy) => Math.min(...mem[s].map((e) => { const t = town(e); return Math.hypot((t[0] - x) * Math.cos(yy * Math.PI / 180), t[1] - yy); }));
        const toA = [], toB = [];
        for (const poly of over) { const r = poly[0]; let cx = 0, cy = 0; for (const q2 of r) { cx += q2[0]; cy += q2[1]; } cx /= r.length; cy /= r.length; (near(sa, cx, cy) <= near(sb, cx, cy) ? toB : toA).push(poly); }
        if (toA.length) shapes[sa] = PC.difference(shapes[sa], toA);   // pieces nearer B's towns leave A
        if (toB.length) shapes[sb] = PC.difference(shapes[sb], toB);
      }
    }
    for (const [k, s] of Object.entries(T.sides)) rowsBy[k].push({ from: y, to: y, members: mem[s].map((e) => e.name).sort(), rings: flat(shapes[s]) });
    last = { sig };
  }
  for (const [k, s] of Object.entries(T.sides)) res[k] = { src: [SRC.pleiades, SRC.ohm], rows: rowsBy[k].filter((r) => r.rings.length), note: T.notes[s] };
  return res;
}
module.exports = { build, OUT_FILE, SRC, ohmRings };
if (require.main === module) {
  const check = process.argv.includes("--check");
  try {
    const r = build({ check });
    const j = JSON.parse(r.body);
    for (const [k, e] of Object.entries(j.extents)) console.log(`${k}: ${e.rows.length} row(s), ${e.rows.reduce((n, x) => n + x.rings.length, 0)} ring(s), ${e.rows.reduce((n, x) => n + x.rings.reduce((m, q) => m + q.length, 0), 0)} points`);
    if (check) { console.log(r.ok ? "war-extents.json is what the pinned sources build" : "STALE — run: node .claude/atlas-build/build-war-extents.js"); process.exit(r.ok ? 0 : 1); }
    console.log("wrote " + path.relative(ROOT, OUT_FILE));
  } catch (e) { console.error(e.message); process.exit(1); }
}
