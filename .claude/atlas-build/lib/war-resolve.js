/* lib/war-resolve.js — which entities each war card's two sides name (Atlas v2 Phase 2d; docs/atlas-v2-design.md §7 "Phase 2d — as built").

   A PURE function of four things, so the history builder (which needs the authored extents before any file exists), the wars table
   builder, the migration and the tests all agree: the cards (their `war` blocks, untouched), .claude/polity-spec.json (`polities`, `links`),
   .claude/atlas-build/war-series.json (the series 2d adds, same shape) and .claude/atlas-build/war-sides.json (`keyMap`, `sides`).

       const { resolveWars } = require("./lib/war-resolve.js");
       const r = resolveWars({ cards, cardYears });   // cardYears: app.js's parser, for a war with no `years` of its own
       r.wars   → [{ id, term, y: [from, to], group, zoom, sides: { victors: SIDE, losers: SIDE } }]
       r.extents → [{ key, name, rings, cards: [{ id, side, y }], rows: [[from, to]…] }]   // authored extents (kind `extent`)
       SIDE = { name, members: [{ key, from, to, by, why? }], extent: key | null, unresolved: [names] }

   A side resolves, the first rule that answers winning: an explicit entry in war-sides.json `sides`; the card's link in the specs (`links` v / l);
   the side's NAME being the label of one series; its `keys` through `keyMap`; its authored `area` kept as an authored extent. A side with
   members AND an `area` draws its members (the Cliopatria shape supersedes the hand-drawn one) unless the entry says `keepExtent`. A name no
   rule resolves is listed in `unresolved` — never guessed. Nothing here reads history.bin, so it can run before the file exists. */
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const ROOT = path.join(__dirname, "..", "..", "..");
const fold = (x) => String(x == null ? "" : x).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
const slug = (x) => fold(x).replace(/^the /, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

function specs() {
  const a = JSON.parse(fs.readFileSync(path.join(ROOT, ".claude", "polity-spec.json"), "utf8"));
  const b = JSON.parse(fs.readFileSync(path.join(ROOT, ".claude", "atlas-build", "war-series.json"), "utf8"));
  const c = JSON.parse(fs.readFileSync(path.join(ROOT, ".claude", "atlas-build", "war-sides.json"), "utf8"));
  const polities = Object.assign({}, a.polities, b.polities);
  const links = {};
  for (const src of [a.links || {}, b.links || {}]) for (const [card, l] of Object.entries(src)) {
    const o = links[card] || (links[card] = {});
    for (const k of ["v", "l", "area"]) if (l[k]) o[k] = [...new Set((o[k] || []).concat(l[k]))];
  }
  return { polities, links, keyMap: c.keyMap || {}, sides: c.sides || {} };
}

function warYearsOf(card, cardYears) {
  const w = card.war;
  if (w && Array.isArray(w.years) && w.years.length === 2 && isFinite(Number(w.years[0])) && isFinite(Number(w.years[1]))) return [Number(w.years[0]), Number(w.years[1])];
  const ys = cardYears ? cardYears(card) : [];
  if (!ys || !ys.length) return null;
  return [Math.min.apply(null, ys), Math.max.apply(null, ys)];
}

function resolveWars(o) {
  const S = o.specs || specs();
  const cards = o.cards.filter((c) => c && c.war && c.war.victors && c.war.losers);
  const byLabel = new Map(), byKey = new Map();
  for (const [key, p] of Object.entries(S.polities)) { byKey.set(key, key); byLabel.set(fold(p.label), key); }
  const hash = (v) => crypto.createHash("sha256").update(JSON.stringify(v)).digest("hex").slice(0, 8);
  const wars = [], extentBy = new Map();   // extent identity (name + shape) → entry
  for (const c of cards.slice().sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))) {
    const y = warYearsOf(c, o.cardYears); if (!y) continue;
    const link = S.links[c.id] || {}, expl = S.sides[c.id] || {};
    const sides = {};
    for (const side of ["victors", "losers"]) {
      const d = c.war[side], members = [], unresolved = [];
      const add = (key, from, to, by, why) => { if (!S.polities[key]) throw new Error(`war ${c.id} ${side}: "${key}" is not a series in polity-spec.json or war-series.json`); if (!members.some((m) => m.key === key)) members.push(Object.assign({ key, from: from == null ? y[0] : Math.max(from, y[0]), to: to == null ? y[1] : Math.min(to, y[1]), by }, why ? { why } : {})); };
      const e = expl[side];
      const ign = new Set((e && e.ignoreKeys) || []);   // present-day names of the card's window that name the same ground as a period key already resolved (Russia beside the Soviet Union)
      let keepExtent = false, extentOnly = !!(e && e.extentOnly);
      if (e && e.members) { for (const m of e.members) add(m.e, m.from, m.to, "war-sides", m.why); keepExtent = !!e.keepExtent; }
      const slugs = extentOnly ? [] : (side === "victors" ? link.v : link.l) || [];
      for (const k of slugs) add(k, null, null, "link");
      if (!members.length && !extentOnly && byLabel.has(fold(d.name))) add(byLabel.get(fold(d.name)), null, null, "name");
      if (!members.length && !extentOnly && Array.isArray(d.keys)) {
        for (const k of d.keys) {
          if (ign.has(k)) continue;
          const m = S.keyMap[k] || (byKey.has(slug(k)) ? [slug(k)] : byLabel.has(fold(k)) ? [byLabel.get(fold(k))] : null);
          if (m) for (const s of m) add(s, null, null, "keys"); else if (!unresolved.includes(k)) unresolved.push(k);
        }
      }
      // a named side whose keys the keyMap answered in part: the keys nobody answers are listed (a side of several nations)
      if (members.length && Array.isArray(d.keys) && !(e && e.members)) for (const k of d.keys) { if (ign.has(k)) continue; const m = S.keyMap[k] || (byKey.has(slug(k)) ? [slug(k)] : null); if (!m && !unresolved.includes(k) && !members.some((x) => fold(S.polities[x.key].label) === fold(k))) unresolved.push(k); }
      if (e && e.members && Array.isArray(d.keys)) for (const k of d.keys) { if (ign.has(k)) continue; const m = S.keyMap[k] || (byKey.has(slug(k)) ? [slug(k)] : null); if (!m && !unresolved.includes(k)) unresolved.push(k); }
      let extent = null;
      if ((!members.length || keepExtent || extentOnly) && d.area) {
        const rings = Array.isArray(d.area[0][0]) ? d.area : [d.area];
        const id = slug(d.name) + ":" + hash(rings);
        let x = extentBy.get(id);
        if (!x) extentBy.set(id, x = { id, base: slug(d.name), name: d.name, rings, cards: [] });
        x.cards.push({ id: c.id, side, y });
        extent = id;
      }
      sides[side] = { name: d.name, members, extent, unresolved };
    }
    wars.push({ id: c.id, term: c.answerText || c.id, y, group: !!c.war.group, zoom: c.war.zoom || null, sides });
  }
  // extent keys: `ext_<slug>`, with a _2, _3 when one name has several shapes (the Greek allies of 479 and of 323, say)
  const extents = [], used = new Map();
  for (const x of [...extentBy.values()].sort((a, b) => (a.id < b.id ? -1 : 1))) {
    const n = (used.get(x.base) || 0) + 1; used.set(x.base, n);
    x.key = "ext_" + x.base + (n > 1 ? "_" + n : "");
    // the rows: the union of the years its cards are at war, joined where they touch or overlap
    const rs = x.cards.map((c) => c.y.slice()).sort((a, b) => a[0] - b[0]);
    const rows = []; for (const r of rs) { const last = rows[rows.length - 1]; if (last && r[0] <= last[1] + 1) last[1] = Math.max(last[1], r[1]); else rows.push(r); }
    x.rows = rows; extents.push(x);
  }
  const keyOf = new Map(extents.map((x) => [x.id, x.key]));
  for (const w of wars) for (const side of ["victors", "losers"]) if (w.sides[side].extent) w.sides[side].extent = keyOf.get(w.sides[side].extent);
  return { wars, extents, specs: S };
}

module.exports = { resolveWars, specs, warYearsOf, fold, slug };
