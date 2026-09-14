#!/usr/bin/env node
/* card-war.js — the rules for `card.war`, shared by every tool that writes one.
 *
 *     const { checkWar, mapNames, warYears } = require("./card-war.js");
 *
 * WHY IT IS A MODULE. Two tools enforce these rules — `add-card.js` for a card being written and
 * `add-card-wars.js` for the ones already shipped — and a copy of a validation goes stale on a change
 * made in the other file by somebody with no reason to look here. This repo has the scar:
 * `add-card-tags.js` kept its own copy of a field list and stripped two fields from all 500 cards in one
 * run, and nothing threw.
 *
 * WHAT A WAR BLOCK IS (see `cardWar` in app.js, which is the reader's half of this):
 *
 *     "war": {
 *       "victors": { "name": "Rome",     "area": [[lon,lat], …] },
 *       "losers":  { "name": "Carthage", "area": [[lon,lat], …] },
 *       "years":   [-218, -201]
 *     }
 *
 * A SIDE IS EITHER NAMED ON A MAP FOLIO HAS OR DRAWN AS AN AUTHORED EXTENT, NEVER BOTH. `keys` is the
 * list of names that belligerent goes by across Folio's maps — `world.js` for the card's own window and
 * the thirteen era maps for the personal atlas, which call Japan the Empire of Japan and Russia the
 * USSR — and `area` is a hand-drawn approximation for the ancient sides no map holds at all.
 *
 * THE FOUR CHECKS THAT CANNOT BE SEEN ON THE PAGE, which is why they are here rather than left to the eye:
 *
 *  1. A KEY NO MAP CARRIES draws nothing, on every surface, for ever. `Carthage` and `Prussia` are the
 *     shapes of names that feel like they should resolve and do not; a typo (`Untied Kingdom`) is the
 *     same failure wearing less. Checked against `world.js` AND every era in `timeline.js`.
 *  2. A SIDE THAT RESOLVES NOTHING ON `world.js` draws on the personal atlas and not on the card's own
 *     window, which is the one surface the author is looking at while writing it. So a `keys` side must
 *     name at least one present-day shape as well — usually the modern country beside the period one.
 *  3. A NAME ON BOTH SIDES is a shape asked to be two colours. Italy changed sides in 1943 and Japan's
 *     co-belligerents did too; which side such a country is filed under is an editorial judgement, so it
 *     is refused at the point of writing rather than resolved at the draw.
 *  4. A WAR WITH NO DERIVABLE YEARS is invisible on the personal atlas, which draws it in the years it
 *     ran and in no others. The date line answers for nearly every card; `years` is the override for the
 *     ones whose line counts something else — `wh-345` "Punic Wars" names one treaty year, and without
 *     the override a 118-year subject would appear for a single year.
 *
 * WHAT IT DELIBERATELY DOES NOT CHECK is WHO WON, which no file in this repository knows. The block is a
 * historical claim like any other on the card, and it rests on the card's own cited prose.
 *
 * Zero dependencies. Not part of the site.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

const isPt = (q) => Array.isArray(q) && q.length === 2 && isFinite(q[0]) && isFinite(q[1]) && Math.abs(q[0]) <= 180 && Math.abs(q[1]) <= 90;

/* An authored `area` is a flat ring or a list of rings, exactly as a locator's is — `locRings` in app.js
   is the reader's half of this and normalises the same two shapes. Hands back rings, or a string saying
   what is wrong with them. */
function readRings(v, where) {
  if (!Array.isArray(v) || !v.length) return where + " is not a list of [lon, lat] points";
  const nested = Array.isArray(v[0]) && Array.isArray(v[0][0]);
  const rings = nested ? v : [v];
  for (let i = 0; i < rings.length; i++) {
    const r = rings[i];
    if (!Array.isArray(r) || r.length < 3) return where + (nested ? "[" + i + "]" : "") + " needs at least three points";
    const bad = r.findIndex((q) => !isPt(q));
    if (bad >= 0) return where + (nested ? "[" + i + "]" : "") + "[" + bad + "] is not a [lon, lat] pair within the globe: " + JSON.stringify(r[bad]);
  }
  return rings;
}

/* EVERY NAME EVERY MAP FOLIO SHIPS CARRIES, so a key can be checked against the real thing rather than
   against a list somebody typed. `world` is the present-day file — the one a card's own atlas window
   draws — and `all` adds the thirteen eras. A merger-only era names its territories by the GROUP a
   present-day country falls into (`synthGroups` in app.js), so its names are the group values plus every
   country the group table does not mention. */
let _names = null;
function mapNames() {
  if (_names) return _names;
  const win = {};
  new Function("window", fs.readFileSync(path.join(ROOT, "world.js"), "utf8"))(win);
  new Function("window", fs.readFileSync(path.join(ROOT, "timeline.js"), "utf8"))(win);
  const geo = win.WORLD_GEO || [];
  const world = new Set();
  geo.forEach((g) => { if (g.n) world.add(String(g.n).toLowerCase()); if (g.a) world.add(String(g.a).toLowerCase()); });
  const all = new Set(world);
  const eras = new Map();
  (win.TIMELINE || []).forEach((e) => {
    const set = new Set();
    if (e.geo) e.geo.forEach((t) => { if (t.n) set.add(String(t.n).toLowerCase()); });
    else geo.forEach((g) => { const nm = (e.groups || {})[g.n] || g.n; if (nm) set.add(String(nm).toLowerCase()); });
    set.forEach((n) => all.add(n));
    eras.set(e.year, set);
  });
  _names = { world: world, all: all, eras: eras };
  return _names;
}

/* `cardYears` is app.js's own, sliced out by text rather than re-implemented — the date line's parsing
   is eleven rules deep and a second copy would answer differently on exactly the deep-time forms a war
   card in the Bronze Age needs. `card-links.js` already owns that slice, so this borrows it. */
function warYears(card, cardYears) {
  const w = card && card.war;
  if (w && Array.isArray(w.years) && w.years.length === 2 && isFinite(Number(w.years[0])) && isFinite(Number(w.years[1]))) {
    const a = Number(w.years[0]), b = Number(w.years[1]);
    return a <= b ? { y0: a, y1: b, from: "years" } : null;
  }
  const ys = cardYears ? cardYears(card) : [];
  if (!ys || !ys.length) return null;
  return { y0: Math.min.apply(null, ys), y1: Math.max.apply(null, ys), from: "date line" };
}

/* The whole check. Returns null when the card is fine, or a sentence saying what is wrong with it.
   `cardYears` is app.js's own parser (see above); pass it or the years check is skipped. */
function checkWar(card, cardYears) {
  const w = card && card.war;
  if (w == null) return null;
  if (typeof w !== "object" || Array.isArray(w)) return "card.war must be an object with `victors` and `losers`.";
  const extra = Object.keys(w).filter((k) => ["victors", "losers", "years", "zoom"].indexOf(k) < 0);
  if (extra.length) return "card.war carries " + extra.join(", ") + " — it takes `victors`, `losers` and an optional `years` and `zoom`.";
  if (w.zoom != null && (!isFinite(Number(w.zoom)) || Number(w.zoom) <= 0)) return "card.war.zoom must be a positive number — it overrides the frame the two sides would otherwise choose.";
  const N = mapNames();
  const seen = new Map();
  for (const which of ["victors", "losers"]) {
    const side = w[which];
    if (!side || typeof side !== "object" || Array.isArray(side)) {
      return "card.war." + which + " is missing — a war block says who won AND who lost, so a war whose outcome is disputed or undecided carries no block at all rather than half a one.";
    }
    const bad = Object.keys(side).filter((k) => ["name", "keys", "area"].indexOf(k) < 0);
    if (bad.length) return "card.war." + which + " carries " + bad.join(", ") + " — a side takes `name` and one of `keys` / `area`.";
    if (!String(side.name || "").trim()) return "card.war." + which + " has no `name` — the legend under the map names each side, so an unnamed one is a colour with nothing to say.";
    const hasKeys = Array.isArray(side.keys) && side.keys.length;
    const hasArea = side.area != null;
    if (hasKeys && hasArea) {
      return "card.war." + which + " has both `keys` and `area` — a side is either named on a map Folio has or drawn as an authored extent, and carrying both would shade the same belligerent twice, once from a real border and once from an approximation.";
    }
    if (!hasKeys && !hasArea) {
      return "card.war." + which + ' needs `keys` (names on Folio\'s maps, e.g. ["Germany"]) or an `area` of [lon, lat] points — a side with neither draws nothing.';
    }
    if (hasArea) {
      const rings = readRings(side.area, "card.war." + which + ".area");
      if (typeof rings === "string") return "ERROR: " + rings + ".";
      continue;
    }
    let inWorld = 0;
    for (const raw of side.keys) {
      const k = String(raw || "").trim();
      if (!k) return "card.war." + which + ".keys carries an empty name.";
      const lk = k.toLowerCase();
      if (!N.all.has(lk)) {
        return 'card.war.' + which + '.keys names "' + k + '", which is on none of Folio\'s maps — not world.js and not any of the thirteen eras in timeline.js. A name no map carries shades nothing, on every surface, for ever. Check the spelling against the era the war falls in (`node .claude/add-card-wars.js --names=<year>`).';
      }
      if (N.world.has(lk)) inWorld++;
      if (seen.has(lk)) {
        return 'card.war names "' + k + '" on both sides — a shape cannot be two colours. A belligerent that changed sides mid-war belongs on the side its card is about, which is a judgement rather than something the draw can resolve.';
      }
      seen.set(lk, which);
    }
    if (!inWorld) {
      return "card.war." + which + ' resolves nothing on world.js — every one of its names belongs to an era map alone, so the side would shade on the personal atlas and be invisible on the card\'s own window. Add the present-day name beside the period one (e.g. "Empire of Japan" AND "Japan").';
    }
  }
  if (cardYears) {
    const y = warYears(card, cardYears);
    if (!y) {
      return "card.war has no years to draw in — the personal atlas shows a war in the years it ran and in no others, and this card's date line yields none. Give the block its own `years: [from, to]` (negative for BCE).";
    }
  }
  return null;
}


/* ---------- A HAND-DRAWN EXTENT IS CHECKED, NEVER LOOKED AT ----------
   A ring whose interior is on the wrong side of an edge draws a beautiful map of somewhere else, and
   nothing downstream can tell: the file parses, the window paints, the pixels are the right colour. The
   only thing that catches it is asserting what the shape COVERS — "Rome inside, Palermo outside, Milan
   outside" — against places whose coordinates are known.
   SO THE ASSERTIONS TRAVEL WITH THE BATCH. A batch entry may carry a `places` block beside its `war`,
   and `add-card-wars.js` REFUSES the batch if any of them is wrong. It was advice in a document for
   exactly one afternoon; a rule with a checker is the house form, and this one costs the author nothing
   they were not going to do anyway.

       "places": { "victors": { "in": [["Rome", 12.48, 41.9]], "out": [["Palermo", 13.36, 38.12]] },
                   "losers":  { "in": […], "out": […] } }

   `places` is a check on the BATCH and is never written to the card. */
function inRing(ring, lon, lat) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
    if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function inArea(area, lon, lat) {
  const rings = Array.isArray(area[0][0]) ? area : [area];
  return rings.some((r) => inRing(r, lon, lat));
}
/* Returns a list of sentences — one per wrong assertion — or an empty list when every one holds. A side
   named with `keys` has no authored shape to check, so a `places` block on one is itself the error: it
   would pass without testing anything, which is the worst state a check can be in. */
function checkPlaces(card, places) {
  const out = [];
  if (!places || typeof places !== "object") return out;
  const w = card && card.war;
  if (!w) return ["`places` was given for a card with no `war` block."];
  for (const which of Object.keys(places)) {
    if (["victors", "losers"].indexOf(which) < 0) { out.push("`places." + which + "` is not a side."); continue; }
    const side = w[which], want = places[which] || {};
    if (!side || !side.area) { out.push("`places." + which + "` names a side drawn from `keys`, which has no authored shape to check — the assertions would pass without testing anything."); continue; }
    for (const [label, pts] of [["inside", want.in], ["outside", want.out]]) {
      for (const p of pts || []) {
        if (!Array.isArray(p) || p.length !== 3 || !isFinite(p[1]) || !isFinite(p[2])) { out.push("`places." + which + "` has a malformed entry: " + JSON.stringify(p) + " — each is [\"name\", lon, lat]."); continue; }
        const hit = inArea(side.area, Number(p[1]), Number(p[2]));
        if (hit !== (label === "inside")) out.push(which + ": " + p[0] + " should be " + label + " " + side.name + "'s extent, and is not.");
      }
    }
  }
  return out;
}

module.exports = { checkWar, checkPlaces, mapNames, warYears, readRings };
