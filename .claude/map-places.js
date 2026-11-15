/* ============================================================================
   map-places.js — A MAP CARD'S SHAPE, READ OFF ITS `places` (2026-11-15: the old fields' later phase).

     const MP = require("./map-places.js");
     const J = MP.loadJoin();                  // the card-faces join, inverted, and the places registry's ids
     MP.mapKeys(card, J)                       // the keys the card shades: its authored `map.key`, else its places through the join
     MP.placeIdsOfKeys(card, J)                // the registry ids its authored keys ARE (null: a key with no registry row)
     MP.finishCard(card, J)                    // add those ids to `places`; drop `map.key` when the places say exactly the same

   WHY. A map card used to name its shape twice: `map.key` ("California", a name in the layer's own list) and the
   heavy `places` ("adm1:usa:us-ca", the registry id). atlas/data/card-faces.js is the join between the two —
   layer → key → [entity id, …] — and that entity id IS the registry id, one to one within a layer (every one of
   the 793 resolved map cards' places equalled its keys' entity ids, measured 2026-11-15). So the key is dropped
   and the windows read the card's places through the join (app.js `cardMapKeys`, the same rule as `mapKeys` here).

   WHAT STAYS ON `map`: `layer` (the question's words — "which state", "which federal subject" — and which join),
   `dot` (the city the question asks about, a row of the layer's dot table; no card's `places` carries it) and
   `zoom` (the frame). `key` STAYS where the places cannot say it: a layer whose entities are not registry rows
   (India's `india-states`, docs/atlas-v2-admin1-layer.md step 3 unbuilt) and an ordered key LIST whose order the
   sorted `places` would lose (Cyprus: three polygons as one). `finishCard` drops a key only when `mapKeys` of the
   card without it gives back the same keys in the same order — so it is idempotent, and safe to run on new cards.

   THE ORDER is the places' own (sorted ids), in Node and in the browser alike.
   ============================================================================ */
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const FACES = path.join(ROOT, "atlas", "data", "card-faces.js");

function loadJoin(opts) {
  const w = {};
  new Function("window", fs.readFileSync(FACES, "utf8"))(w);
  const F = w.ATLAS_CARD_FACES;
  if (!F || !F.layers) throw new Error("map-places: atlas/data/card-faces.js carries no layers (run .claude/atlas-build/build-card-faces.js --install)");
  const inv = {};
  for (const [layer, L] of Object.entries(F.layers)) { const m = inv[layer] = new Map(); for (const [k, row] of Object.entries(L)) m.set(row[0], k); }
  const reg = (opts && opts.registry) || require("./places-registry.js").loadRegistry();
  return { F, inv, has: (id) => reg.rows.has(id) };
}
const authored = (m) => (m && m.key != null ? (Array.isArray(m.key) ? m.key : [m.key]).map((k) => String(k)).filter(Boolean) : null);
/* the keys a map card shades — the authored list where it has one, else every id of its places that is an entity of the layer, by its key there, in the places' (sorted) order */
function mapKeys(card, J) {
  const m = card && card.map; if (!m) return [];
  const a = authored(m); if (a) return a;
  const inv = J.inv[m.layer]; if (!inv) return [];
  return (Array.isArray(card.places) ? card.places.slice().sort() : []).filter((id) => inv.has(id)).map((id) => inv.get(id));
}
/* the registry ids the authored keys are; null when any key has no entity, or its entity no registry row (the India layer) */
function placeIdsOfKeys(card, J) {
  const m = card && card.map, a = authored(m), L = m && J.F.layers[m.layer];
  if (!a || !a.length || !L) return null;
  const ids = a.map((k) => (L[k] ? L[k][0] : null));
  return ids.every((id) => id && J.has(id)) ? ids : null;
}
/* the card in the new shape: the key's ids added to `places` (sorted, distinct), then `map.key` dropped if the places now say the same keys in the same order. Returns what it did. */
function finishCard(card, J) {
  const ids = placeIdsOfKeys(card, J);
  if (!ids) return { added: [], stripped: false };
  const have = Array.isArray(card.places) ? card.places : [];
  const next = [...new Set(have.concat(ids))].sort();
  const added = next.filter((id) => have.indexOf(id) < 0);
  if (added.length || (have.length && next.join() !== have.join())) card.places = next;
  const before = authored(card.map), probe = Object.assign({}, card, { map: Object.assign({}, card.map) });
  delete probe.map.key;
  const after = mapKeys(probe, J);
  if (after.join("|") !== before.join("|")) return { added, stripped: false };
  delete card.map.key;
  return { added, stripped: true };
}
module.exports = { loadJoin, mapKeys, placeIdsOfKeys, finishCard, FACES };
