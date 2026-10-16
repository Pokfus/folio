/* lib/seats.js — "is a polity's own seat inside its faces?" on the BUILT step topology (Atlas v2, border audit of 2026-10-16;
   docs/atlas-v2-border-audit.md).

   A SEAT is where a state sat, by two named sources and nothing else:
     · its CAPITAL in the registry — the Wikidata P36 statements of state-capitals.js, carried in history.bin's header `cities`
       (entity, name, lon, lat, from, to), true for their dated range;
     · the CARD'S OWN PLACE — the `at` of a map card's locator (kind "region") whose polity-spec link names the series (`area`),
       true at each year the card dates itself (card-links.js `cardYears`), and only for a polity the registry holds no capital for. A seat is never moved to fit a border and never invented.

   THE RULE (check-history.js "seats"): at every step of a card-linked polity whose years meet a seat's, the seat lies inside the
   step's face — or inside a contested or nested face the polity is a partner of in those years — or within SEAT_TOL_M (2 km) of its
   edge. The face is constant across a step, so one year of the overlap stands for it.

       const S = require("./lib/seats.js");
       const facts = S.seatFacts(H.header, { cards, spec, cardYears });
       const rows = S.audit(Hq, facts);          // Hq = lib/historyq.js open(); every failing (entity, step, seat) with the numbers

   Pure of the raw source: the CAUSE of a failure (source, clip, snap, other) is classed by .claude/atlas-build/audit-seats.js, which
   needs Cliopatria; this file needs history.bin and the core only. */
"use strict";

const SEAT_TOL_M = 2000;
const M_PER_DEG = 111195;   // mean-sphere metres per degree of latitude

function seatFacts(H, ctx) {
  const facts = [];
  // polities only: a people or a culture is a presence, an extent a war side nobody draws, a front a line — none has a seat
  const ents = new Map(H.entities.filter((e) => e.kind === "polity").map((e) => [e.id, e]));
  for (const c of H.cities || []) if (ents.has(c.entity)) facts.push({ entity: c.entity, name: c.name, lon: c.lon, lat: c.lat, from: c.from, to: c.to, src: "capital", card: c.card });
  /* the card's own place stands in only for a polity the registry holds NO capital for, and only for a card that is a map of that one polity,
     at the years the card dates itself (each a point: a card dated 1453 names Constantinople in 1453, not through 1299–1922) */
  if (ctx && ctx.cards) {
    const haveCap = new Set(facts.map((f) => f.entity));
    for (const [card, link] of Object.entries((ctx.spec && ctx.spec.links) || {})) {
      const c = ctx.cards.get(card); if (!c || !c.locator || !c.locator.at || (link.area || []).length !== 1) continue;
      const ent = "pol:" + link.area[0]; if (!ents.has(ent) || haveCap.has(ent)) continue;
      const ys = [...new Set((ctx.cardYears && ctx.cardYears(c)) || [])].sort((a, b) => a - b);
      for (const y of ys) facts.push({ entity: ent, name: c.locator.name || link.area[0], lon: c.locator.at[0], lat: c.locator.at[1], from: y, to: y, src: "card", card });
    }
  }
  return facts;
}

/* the distance in metres from (lon, lat) to the nearest edge of the rings (degree lists, possibly unwrapped past 180) */
function distToRings(rings, lon, lat) {
  const k = Math.cos(lat * Math.PI / 180); let best = Infinity;
  for (const ring of rings) for (const off of [0, 360, -360]) {
    const px = lon + off;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const ax = (ring[j][0] - px) * k, ay = ring[j][1] - lat, bx = (ring[i][0] - px) * k, by = ring[i][1] - lat;
      const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
      let t = l2 ? -(ax * dx + ay * dy) / l2 : 0; t = Math.max(0, Math.min(1, t));
      const d = Math.hypot(ax + t * dx, ay + t * dy); if (d < best) best = d;
    }
  }
  return best * M_PER_DEG;
}
function inRings(rings, lon, lat) {
  let inside = false;
  for (const ring of rings) for (const off of [0, 360, -360]) {
    const px = lon + off; let c = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) if ((ring[i][1] > lat) !== (ring[j][1] > lat) && px < (ring[j][0] - ring[i][0]) * (lat - ring[i][1]) / (ring[j][1] - ring[i][1]) + ring[i][0]) c = !c;
    if (c) { inside = !inside; break; }
  }
  return inside;
}

/* every failing (entity, step, seat): { fact, step: [from, to, face], from, to (the overlap), dist (m to the nearest of the faces that could hold the seat; 0 inside), found (the entities holding the point that year) } */
function audit(Hq, facts, opts) {
  const tol = (opts && opts.tol) || SEAT_TOL_M, L = Hq.lodCount - 1, H = Hq.header;
  const partnersOf = new Map();   // polity id → contested / nested entities it is a partner of
  for (const e of H.entities) if (e.partners) for (const p of e.partners) { let l = partnersOf.get(p); if (!l) partnersOf.set(p, l = []); l.push(e.id); }
  const ringsCache = new Map(), ringsOfFace = (fi) => { let r = ringsCache.get(fi); if (!r) ringsCache.set(fi, r = Hq.ringsAtLevel(fi, L)); return r; };
  const out = [];
  for (const f of facts) {
    for (const st of Hq.stepsOf(f.entity)) {
      const from = Math.max(st[0], f.from), to = Math.min(st[1], f.to); if (from > to) continue;
      const faces = [st[2]];
      for (const pid of partnersOf.get(f.entity) || []) for (const ps of Hq.stepsOf(pid)) if (ps[0] <= to && ps[1] >= from) faces.push(ps[2]);
      let best = Infinity;
      for (const fi of faces) { const r = ringsOfFace(fi); const d = inRings(r, f.lon, f.lat) ? 0 : distToRings(r, f.lon, f.lat); if (d < best) best = d; if (d === 0) break; }
      if (best <= tol) continue;
      out.push({ fact: f, step: st, from, to, dist: best, found: Hq.entityAt(f.lon, f.lat, from).map((e) => e.id) });
    }
  }
  return out;
}

/* the failing rows of one (entity, seat) as maximal year intervals, independent of where the steps happen to break:
   [[from, to], …] merged when adjacent. Keyed `${entity}|${seat name}|${source}` — the key of seats-known.json */
const keyOf = (f) => `${f.entity}|${f.name}|${f.src}`;
function intervals(rows) {
  const by = new Map();
  for (const r of rows) { const k = keyOf(r.fact); let l = by.get(k); if (!l) by.set(k, l = []); l.push([r.from, r.to]); }
  for (const [k, l] of by) { l.sort((a, b) => a[0] - b[0] || a[1] - b[1]); const out = []; for (const iv of l) { const last = out[out.length - 1]; if (last && iv[0] <= last[1] + 1) last[1] = Math.max(last[1], iv[1]); else out.push([iv[0], iv[1]]); } by.set(k, out); }
  return by;
}
const CAUSES = ["source", "clip", "snap", "other"];

/* everything seatFacts reads beyond the header: the cards (through card-io.js), polity-spec.json with war-series.json's links merged in the
   way build-history.js merges them, the card-years reader out of app.js */
function loadContext(root) {
  const fs = require("fs"), path = require("path");
  const spec = JSON.parse(fs.readFileSync(path.join(root, ".claude", "polity-spec.json"), "utf8"));
  const WAR = JSON.parse(fs.readFileSync(path.join(root, ".claude", "atlas-build", "war-series.json"), "utf8"));
  for (const [k, p] of Object.entries(WAR.polities)) spec.polities[k] = p;
  for (const [card, l] of Object.entries(WAR.links || {})) { const o = spec.links[card] || (spec.links[card] = {}); for (const k of ["v", "l", "area"]) if (l[k]) o[k] = [...new Set((o[k] || []).concat(l[k]))]; }
  const cards = new Map(require(path.join(root, ".claude", "card-io.js")).loadCards().cards.map((c) => [c.id, c]));
  const cardYears = require(path.join(root, ".claude", "card-links.js")).loadCardYears(fs.readFileSync(path.join(root, "app.js"), "utf8"));
  return { spec, cards, cardYears };
}

module.exports = { SEAT_TOL_M, CAUSES, loadContext, seatFacts, audit, distToRings, inRings, keyOf, intervals };
