/* place-anchors.js — is an AREA place's label anchor where the area is? (Atlas v2, task of 2026-10-18; docs/atlas-v2-design.md §7 "Data faults of 2026-10-18")

   The Atlas lays an area's name (a region, an island, a sea, a lake, a strait …) at the registry row's `at`: for a places.js row that is the
   coordinate of the Wikidata item the migration matched to the card's locator NAME. A homonym passes the migration (a region's radius is 300 km:
   `migrate-places.js` RADIUS) and then the name stands in the wrong country — "Messapia" stood in Calabria, 260 km from the Messapia the card teaches.
   This is the guard. For every area-kind row that a card links, and for every locator of those cards that bears the row's name or an alias:
     · the extent is the locator's own `area` ring(s) (what the card window draws); the anchor must lie INSIDE it or within ANCHOR_KM of its outline;
     · where the locator has no `area`, the anchor must lie within ANCHOR_KM of the locator's own coordinate `at`;
   one passing locator is enough (a place several cards teach is right if any one agrees; the others may teach a part of it). A row that fails every
   locator is an OFFENDER unless place-anchors.json `allow`s it with a reason (a decision of the owner's, not a default).
   Only places.js rows are gated: a gazetteer row's anchor is Natural Earth's label point for a country, a river or a range, inside its own geometry by
   construction, and a card's locator for it often names a part (the Nile at its delta); those are listed, never failed (`gazetteerBeyond`). */
"use strict";
const AREA_KINDS = new Set(["region", "range", "island", "island-group", "lake", "sea", "ocean", "gulf", "strait", "river"]);
const ANCHOR_KM = 25;
const km = (a, b) => { const R = 6371, d = Math.PI / 180; const dLat = (b[1] - a[1]) * d, dLon = (b[0] - a[0]) * d; const s = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * d) * Math.cos(b[1] * d) * Math.sin(dLon / 2) ** 2; return 2 * R * Math.asin(Math.min(1, Math.sqrt(s))); };
const fold = (x) => String(x == null ? "" : x).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[’‘`]/g, "'").replace(/\s+/g, " ").trim();
function inRing(p, ring) { let c = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const a = ring[i], b = ring[j]; if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) c = !c; } return c; }
/* km from a point to a segment, on a local equirectangular plane (a locator's area is a few degrees across at most) */
function segKm(p, a, b) { const k = Math.cos((p[1] * Math.PI) / 180) * 111.195, m = 111.195; const ax = (a[0] - p[0]) * k, ay = (a[1] - p[1]) * m, bx = (b[0] - p[0]) * k, by = (b[1] - p[1]) * m; const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy; const t = l2 ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / l2)) : 0; return Math.hypot(ax + t * dx, ay + t * dy); }
const ringsOf = (area) => { if (!Array.isArray(area) || area.length < 3) return null; return Array.isArray(area[0][0]) ? area : [area]; };
/* does `at` agree with one locator? { ok, inside, km } — km is the distance to the area's outline (or to the locator's point) */
function agrees(at, L) {
  const rings = ringsOf(L.area); let best = Infinity;
  if (rings) {
    if (rings.some((r) => inRing(at, r))) return { ok: true, inside: true, km: 0 };
    for (const r of rings) for (let i = 0; i < r.length; i++) best = Math.min(best, segKm(at, r[i], r[(i + 1) % r.length]));
  }
  if (Array.isArray(L.at) && isFinite(L.at[0]) && isFinite(L.at[1])) best = Math.min(best, km(at, L.at));
  return { ok: best <= ANCHOR_KM, inside: false, km: best };
}
/* rows: the registry's rows (id, name, aliases, kind, at); linked: id → [{ card, locator }]; returns { checked, offenders[], gazetteerBeyond[] } */
function audit(reg, cards, allow) {
  allow = allow || {};
  const linked = new Map();
  for (const c of cards) { const L = c.locator; if (!L || !L.name) continue; for (const id of c.places || []) { const r = reg.rows.get(id); if (!r || !AREA_KINDS.has(r.kind)) continue; const names = [r.name].concat(r.aliases || []).map(fold); const ln = [L.name, L.label].filter((x) => typeof x === "string").map(fold); if (!ln.concat(ln.map((x) => x.split(",")[0].trim())).some((x) => names.includes(x))) continue; let l = linked.get(id); if (!l) linked.set(id, l = []); l.push({ card: c.id, locator: L }); } }
  const offenders = [], gazetteerBeyond = []; let checked = 0;
  for (const [id, l] of linked) {
    const r = reg.rows.get(id); if (!r.at || !isFinite(r.at[0])) continue;
    const src = reg.source(id); if (src !== "places") { const best = l.map((x) => agrees(r.at, x.locator)); if (!best.some((b) => b.ok)) gazetteerBeyond.push({ id, name: r.name, kind: r.kind, km: Math.min(...best.map((b) => b.km)), card: l[0].card }); continue; }
    checked++;
    const res = l.map((x) => Object.assign({ card: x.card }, agrees(r.at, x.locator)));
    if (res.some((b) => b.ok)) continue;
    const nearest = res.reduce((a, b) => (b.km < a.km ? b : a));
    offenders.push({ id, name: r.name, kind: r.kind, at: r.at, km: nearest.km, card: nearest.card, allowed: allow[id] || "" });
  }
  offenders.sort((a, b) => b.km - a.km);
  return { checked, linked: linked.size, offenders, gazetteerBeyond: gazetteerBeyond.sort((a, b) => b.km - a.km) };
}
module.exports = { audit, agrees, inRing, AREA_KINDS, ANCHOR_KM };
