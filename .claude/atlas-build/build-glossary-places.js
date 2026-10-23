#!/usr/bin/env node
/* build-glossary-places.js — which glossary terms the popup can show on the Atlas, and the WINDOW each gets: atlas/data/glossary-places.js
   (Atlas v2 Phase 3c, task 2 — the pin; 2026-10-23 — the glossary Atlas windows, docs/glossary-atlas-windows.md; docs/atlas-v2-design.md §2.8).

     node .claude/atlas-build/build-glossary-places.js [--install] [--dry] [--check]

   WHAT IT IS. Two tables, one file (format 2):

       window.ATLAS_GLOSSARY_PLACES = { format: 2, digest, counts,
         ids:     { "Lascaux": "pl:q172125", "France": "adm0:fra", … },                       the PIN: term slug → registry id, what "show on the Atlas" opens
         windows: { "Lascaux": [lon, lat, kind, face, year, zoom], … } }                        the WINDOW: the small map in the popup — where it is centred, what it marks

   THE PIN (`ids`, Phase 3c, unchanged in meaning): a term that names a place the Atlas's registry holds opens `#map` at that place.
   · a point term of glossary-places-input.json resolves through places-spec.json's `glossary` (written by migrate-places.js, which resolves each coordinate against the gazetteer and Wikidata exactly
     as it resolves a card's locator: the item's own coordinate must agree, nothing is guessed; a term that does not resolve is left out and the migration's report says why);
   · a country term resolves by the name the map uses (the input's `countries` value) to the gazetteer's ONE `country` row of that name or alias; a name with no such row, or two, is left out and listed;
   · (2026-10-23) a term that IS A LOCATION (see THE RULE) and is the ANSWER of a card — or the name of a card's locator — whose heavy `places` carry a registry row NAMED for the term (its name or an alias folds to
     the term's title or an alias) gets that row: the card's own research, no guess. A polity is never a pin (the place route opens registry places); it is a window only.

   THE WINDOW (`windows`, 2026-10-23, the owner's rules): a glossary popup shows a small Atlas window — no buttons, pannable and zoomable — with the term's place as THE ONLY thing marked, and opening it
   never touches the Personal Atlas (the window writes no `placesSeen`). Each row is [lon, lat, kind, face, year, zoom]:
   · a POINT (a site, a city, a cave, a mountain…): its registry coordinate, the row's kind, no face (0), no year (0), no zoom (0 = the locator's default) — drawn as the gold square and the name;
   · an AREA with no face (a region, a sea, a range, an island group): the same row, drawn as the name alone at its label point;
   · a PRESENT-DAY COUNTRY or PROVINCE (`adm0:` / `adm1:` rows): `face` is the row's id, the highlight the engine tints today (as a map card does); the centre and the zoom frame its bounding box
     (atlas/data/card-faces.js's, the same box a map card frames; the row's own `at` when the layer has no box);
   · a STATE, AN EMPIRE, A PEOPLE OR A CULTURE (`pol:` entities of history.bin): `face` is the entity id, `year` THE YEAR OF ITS GREATEST EXTENT — the first year of its span in which the area of its faces is
     largest (its own faces in full, a `contested:` face it shares at half, a `nested:` face it owns in full; the areas are history.bin's own `faceKm2`), the centre the area-weighted mean of those faces'
     anchors (`faceAnchor`) and the zoom the frame of their vertices (a far outlier under 2 % of the total, an island, does not widen it) — the window asks the engine for the whole history at that year.
   THE RULE (the owner, 2026-10-23): ONLY A TERM THAT IS SPECIFICALLY ABOUT THAT LOCATION gets a window — the town of Versailles, never the Treaty of Versailles. The glossary's tags decide: a term tagged a place
   (`place`, `city`, `capital`, `building`, `site`, `region`, `river`, `island`, `mountain`, `sea`, `lake`, `strait`, `province`, `cave`, `temple`, `port`, `country`, `continent`, `ocean`, `valley`,
   `peninsula`, `landform`, `desert`, `fortress`, `colony`) is a location; a term tagged a state or a people (`state`, `people`, `dynasty`, `empire`, `kingdom`, `polity`, `culture`) is one when it joins an
   entity or a country (a people with no face gets nothing: a dot is not a people); and a term tagged an event, a person or a thing (`event`, `war`, `treaty`, `battle`, `person`, `ruler`, `deity`, `concept`,
   `practice`, `object`, `text`, `institution`, `fossil`, `hominin`, `title`, `law`, `theory`, `industry`) NEVER gets one, whatever its other tags — a tag to fix, not a rule to bend. The pin's own 211 terms
   (the points and the countries of the input file) keep their pin and get a window regardless: they are places by construction.
   A term the cards place by a locator COORDINATE only (no registry row; every such card within 25 km) gets a window at that coordinate, kind "coord", and no pin.
   NOTHING IS GUESSED: a term whose cards disagree (two rows named for it farther than 25 km apart, or coordinates that disagree) is left out and listed.

   A pure function of glossary.js (keys, tags, aliases), the cards (data.js + data-extra/, through card-io.js: answers, locators, places), the input file, places-spec.json, the registry, card-faces.js and history.bin —
   byte-identical on every run. Terms do NOT contribute to the Personal Atlas (Q-P3 c) and nothing is written to a term.

   SOURCES. The first line is the `sources` header every generated file under atlas/data/ carries. Every number here is read off a row of gazetteer.js, places.js or history.bin, whose own headers carry the
   sources (Natural Earth, Wikidata, Cliopatria, OSM); the file adds no third-party data of its own, so the list is empty.

   --check  regenerate in memory and compare with the committed file; exit 1 when it lags. Run by migrate-places.js and CI's check-places.js. */
"use strict";
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const HERE = __dirname, ROOT = path.join(HERE, "..", "..");
const TARGET = path.join(ROOT, "atlas", "data", "glossary-places.js");
const SPEC = path.join(HERE, "places-spec.json");

const PLACE_TAGS = ["place", "city", "capital", "building", "site", "region", "river", "island", "mountain", "sea", "lake", "desert", "strait", "province", "cave", "temple", "fortress", "port", "country", "continent", "ocean", "valley", "peninsula", "colony", "landform"];
const GROUP_TAGS = ["state", "people", "dynasty", "empire", "kingdom", "polity", "culture"];
const EXCLUDE_TAGS = ["event", "war", "treaty", "battle", "person", "ruler", "deity", "concept", "practice", "object", "text", "institution", "fossil", "hominin", "theory", "industry", "title", "law"];
const POINT_KINDS = ["capital", "city", "town", "site", "mountain", "cape", "hill", "lake", "island"];   // drawn as the gold square; the other registry kinds (region, sea, range, river…) as the name alone
const FACE_KINDS = ["country", "admin1"];
const ENTITY_KINDS = ["polity", "people", "culture"];
const NEAR_KM = 25, DEG = Math.PI / 180, ZMIN = 0.85, ZFACE_MAX = 40;   // a face is framed at most at zoom 40 (about 1.3 km/px in a 260 px window): a city-state is still a place on a map, not a tile

/* the class of a term by its tags: "place", "group" or null (an excluding tag wins over every other) */
function locationClass(tags) {
  const t = (tags || []).map((x) => String(x).toLowerCase());
  if (t.some((x) => EXCLUDE_TAGS.includes(x))) return null;
  if (t.some((x) => PLACE_TAGS.includes(x))) return "place";
  if (t.some((x) => GROUP_TAGS.includes(x))) return "group";
  return null;
}
const km = (a, b) => { const dl = (b[0] - a[0]) * DEG, dp = (b[1] - a[1]) * DEG, h = Math.sin(dp / 2) ** 2 + Math.cos(a[1] * DEG) * Math.cos(b[1] * DEG) * Math.sin(dl / 2) ** 2; return 2 * 6371 * Math.asin(Math.sqrt(Math.min(1, h))); };
const slugTitle = (k) => String(k || "").replace(/_\([^)]*\)$/, "").replace(/_/g, " ").trim();   // app.js glossKeyTitle
const strip = (s) => String(s || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
/* the zoom that frames a lon/lat box in a window, as atlas-windows.js `fit` frames a map card's box (0.55 of the short side) */
function zoomFor(box) {
  const lat = (box[1] + box[3]) / 2, span = Math.max(box[3] - box[1], (box[2] - box[0]) * Math.cos(lat * DEG), 0.2);
  return Math.max(ZMIN, Math.min(ZFACE_MAX, 0.55 / (0.46 * DEG * span)));
}

/* pure: the pin table (Phase 3c) and what could not be joined, from the glossary's two input tables, the spec's resolutions and a registry */
function tableOf({ points, countries, resolved, reg, fold, isDeckKey }) {
  const ids = {}, left = [];
  for (const slug of Object.keys(points || {}).sort()) {
    const id = (resolved || {})[slug];
    if (id && reg.rows.has(id)) ids[slug] = id; else left.push({ slug, via: "point", why: id ? "the spec's id " + id + " is not in the registry" : "the migration did not resolve its coordinate to a place (see docs/atlas-places-report.md)" });
  }
  for (const slug of Object.keys(countries || {}).sort()) {
    if (isDeckKey && isDeckKey(slug)) continue;
    const name = countries[slug];
    const rows = (reg.byName.get(fold(name)) || []).filter((r) => r.kind === "country");
    if (rows.length === 1) ids[slug] = rows[0].id;
    else left.push({ slug, via: "country", why: rows.length ? name + " names " + rows.length + " country rows" : "no country row is named " + JSON.stringify(name) });
  }
  return { ids, left };
}

/* pure: the cards' joins (2026-10-23). For every term that is a location: the registry row named for it on a card it answers (or whose locator it names), else those cards' one locator coordinate.
   `terms` is { slug: { tags, aliases } }; `cards` the merged light+heavy cards; returns { ids: slug → registry id (never an entity for a place term), coords: slug → [lon, lat], left: [{ slug, via, why }] } */
function joinCards({ terms, cards, reg, fold, pinned }) {
  const ids = {}, coords = {}, left = [];
  const byAnswer = new Map(), byLoc = new Map();
  for (const c of cards || []) {
    const a = fold(strip(c.answerText || c.answer || "")); if (a) { if (!byAnswer.has(a)) byAnswer.set(a, []); byAnswer.get(a).push(c); }
    if (c.locator && c.locator.name) { const n = fold(c.locator.name); if (!byLoc.has(n)) byLoc.set(n, []); byLoc.get(n).push(c); }
  }
  for (const slug of Object.keys(terms).sort()) {
    if (pinned && pinned[slug]) continue;
    const cls = locationClass(terms[slug].tags); if (!cls) continue;
    const surfaces = new Set([slugTitle(slug)].concat(terms[slug].aliases || []).map(fold).filter(Boolean));
    const cs = new Set(); for (const s of surfaces) { for (const c of byAnswer.get(s) || []) cs.add(c); for (const c of byLoc.get(s) || []) cs.add(c); }
    if (!cs.size) continue;
    const named = new Map();
    for (const c of cs) for (const id of c.places || []) {
      const r = reg.rows.get(id); if (!r) continue;
      if (!(surfaces.has(fold(r.name)) || (r.aliases || []).some((al) => surfaces.has(fold(al))))) continue;
      const isEnt = ENTITY_KINDS.includes(r.kind);
      if (cls === "group" ? !(isEnt || FACE_KINDS.includes(r.kind)) : isEnt) continue;   // a people or a state wants a face; a place never an entity
      named.set(id, (named.get(id) || 0) + 1);
    }
    if (named.size) {
      const list = [...named.keys()].sort((a, b) => named.get(b) - named.get(a) || a.localeCompare(b));
      const at = (id) => reg.rows.get(id).at;
      const agree = list.every((id) => { const p = at(id), q = at(list[0]); return list[0] === id || (p && q && km(p, q) < NEAR_KM); });
      if (list.length === 1 || agree) { ids[slug] = list[0]; continue; }
      /* a city and the province or country of its name (Beijing the city and the municipality; Saratov; New York) are two rows: the slug's own parenthetical decides — "(state)", "(province)", "(region)" is the area,
         else the term is the city. Any other disagreement is left out. */
      const area = /_\((state|province|region|oblast|territory|county)\)$/i.test(slug);
      const pts = list.filter((id) => POINT_KINDS.includes(reg.rows.get(id).kind)), ars = list.filter((id) => FACE_KINDS.includes(reg.rows.get(id).kind));
      if (pts.length + ars.length === list.length && pts.length === 1 && ars.length >= 1 && (area ? ars.length === 1 : true)) { ids[slug] = area ? ars[0] : pts[0]; continue; }
      left.push({ slug, via: "cards", why: "the cards name " + list.length + " rows for it farther than " + NEAR_KM + " km apart: " + list.join(", ") }); continue;
    }
    if (cls !== "place") continue;   // a state or a people with no face gets no window
    const locs = []; for (const c of cs) if (c.locator && Array.isArray(c.locator.at) && c.locator.at.length === 2) locs.push(c.locator.at);
    if (!locs.length) continue;
    if (locs.every((p) => km(p, locs[0]) < NEAR_KM)) coords[slug] = [locs[0][0], locs[0][1]];
    else left.push({ slug, via: "cards", why: "the cards' locators disagree by more than " + NEAR_KM + " km" });
  }
  return { ids, coords, left };
}

/* pure: an entity's year of greatest extent and its frame, from history.bin's header (entities, steps [entity, from, to, face], faceKm2, faceAnchor) and the file's vertices (lon/lat quantised by `quantum`,
   arcOffset per arc, faces[].rings of signed arc refs). Returns { year, lon, lat, zoom, km2 } or null when the entity has no step. */
function entityExtent(T, id) {
  const H = T.header, ei = H.entities.findIndex((e) => e.id === id); if (ei < 0) return null;
  const e = H.entities[ei];
  const share = (st) => { const o = H.entities[st[0]]; if (o.id === id) return 1; if (o.kind === "contested" && (o.partners || []).includes(id)) return 0.5; if (o.kind === "nested" && (o.partners || [])[0] === id) return 1; return 0; };
  const steps = H.steps.map((st, i) => ({ st, i, s: share(st) })).filter((q) => q.s > 0);
  if (!steps.length) return null;
  const years = new Set(); for (const q of steps) { years.add(q.st[1]); years.add(q.st[2] + 1); }
  let best = null, bestA = -1;
  for (const y of [...years].sort((a, b) => a - b)) {   // the area changes only at a step's first year or the year after its last: those are the candidate years
    if (e.span && (y < e.span[0] || y > e.span[1])) continue;
    let A = 0; for (const q of steps) if (q.st[1] <= y && y <= q.st[2]) A += (H.faceKm2[q.st[3]] || 0) * q.s;
    if (A > bestA + 1e-9) { bestA = A; best = y; }
  }
  if (best == null) return null;
  const alive = steps.filter((q) => q.st[1] <= best && best <= q.st[2]);
  // the centre: the area-weighted mean of the faces' anchors (as unit vectors, so the dateline is no seam)
  let vx = 0, vy = 0, vz = 0;
  for (const q of alive) { const p = H.faceAnchor[q.st[3]]; if (!p) continue; const w = (H.faceKm2[q.st[3]] || 1) * q.s, lo = p[0] * DEG, la = p[1] * DEG; vx += Math.cos(la) * Math.cos(lo) * w; vy += Math.cos(la) * Math.sin(lo) * w; vz += Math.sin(la) * w; }
  const lon = Math.atan2(vy, vx) / DEG, lat = Math.atan2(vz, Math.hypot(vx, vy)) / DEG;
  // the frame: the box of the vertices of every face worth 2 % of the whole (an outlying island does not frame the planet), in longitudes unwrapped about the centre
  const Q = T.quantum; let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const q of alive) {
    if ((H.faceKm2[q.st[3]] || 0) * q.s < bestA * 0.02 && alive.length > 1) continue;
    for (const ring of T.faces[q.st[3]].rings) for (const ref of ring) {
      const a = Math.abs(ref) - 1, s = T.arcOffset[a], en = T.arcOffset[a + 1];
      for (let i = s; i < en; i++) { let x = T.lon[i] * Q; const y = T.lat[i] * Q; x = x - lon; x = ((x + 180) % 360 + 360) % 360 - 180; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
  }
  const zoom = isFinite(x0) ? zoomFor([x0 + lon, y0, x1 + lon, y1]) : 4;
  return { year: best, lon, lat, zoom, km2: Math.round(bestA) };
}

/* pure: the window rows from the pins, the card joins and the frames. `faces` is card-faces.js's layers (name → [id, cx, cy, x0, y0, x1, y1]) and `extent(id)` the entity frame */
function windowsOf({ ids, coords, reg, faces, extent }) {
  const out = {}, left = [];
  const faceBox = new Map(); for (const L of Object.values(faces || {})) for (const row of Object.values(L)) if (row && row[0]) faceBox.set(row[0], row);
  const r3 = (v) => Math.round(v * 1000) / 1000, r2 = (v) => Math.round(v * 100) / 100;
  for (const slug of Object.keys(ids).sort()) {
    const r = reg.rows.get(ids[slug]); if (!r) continue;
    if (ENTITY_KINDS.includes(r.kind)) {
      const x = extent(r.id); if (!x) { left.push({ slug, via: "window", why: r.id + " has no step in history.bin" }); continue; }
      out[slug] = [r3(x.lon), r3(x.lat), r.kind, r.id, x.year, r2(x.zoom)]; continue;
    }
    if (FACE_KINDS.includes(r.kind)) {
      const b = faceBox.get(r.id);
      if (b) out[slug] = [r3(b[1]), r3(b[2]), r.kind, r.id, 0, r2(zoomFor([b[3], b[4], b[5], b[6]]))];
      else if (r.at) out[slug] = [r3(r.at[0]), r3(r.at[1]), r.kind, r.id, 0, 0];
      else left.push({ slug, via: "window", why: r.id + " has neither a box nor a coordinate" });
      continue;
    }
    if (!r.at) { left.push({ slug, via: "window", why: r.id + " (" + r.kind + ") has no coordinate" }); continue; }
    out[slug] = [r3(r.at[0]), r3(r.at[1]), r.kind, 0, 0, 0];
  }
  for (const slug of Object.keys(coords || {}).sort()) if (!out[slug]) out[slug] = [r3(coords[slug][0]), r3(coords[slug][1]), "coord", 0, 0, 0];
  return { windows: out, left };
}

function render(ids, windows) {
  windows = windows || {};
  const digest = crypto.createHash("sha256").update(JSON.stringify([ids, windows])).digest("hex").slice(0, 16);
  const keys = Object.keys(ids).sort(), wkeys = Object.keys(windows).sort();
  const nCountry = keys.filter((k) => /^adm0:/.test(ids[k])).length;
  const nFace = wkeys.filter((k) => windows[k][3] && !windows[k][4]).length, nYear = wkeys.filter((k) => windows[k][4]).length;
  const head = JSON.stringify({ format: 2, digest, counts: { terms: keys.length, points: keys.length - nCountry, countries: nCountry, windows: wkeys.length, faces: nFace, years: nYear } });
  return "/* sources: [] */\n" +
    "/* atlas/data/glossary-places.js — GENERATED by .claude/atlas-build/build-glossary-places.js (docs/atlas-v2-design.md §2.8, §7\n" +
    "   \"Phase 3c — as built\"; docs/glossary-atlas-windows.md). Do not edit. `ids`: which glossary terms the popup's \"show on the Atlas\" button can open\n" +
    "   on #map (term slug → registry id). `windows` (format 2, 2026-10-23): the popup's own Atlas window per term — [lon, lat, kind, face, year, zoom]: the\n" +
    "   centre, the registry kind (\"coord\" for a card locator's coordinate), the face to tint (a country's or province's registry id, or a history.bin entity),\n" +
    "   the year of a state's or people's greatest extent (0 = today), the zoom (0 = the locator's default). Terms do not contribute to the Personal Atlas\n" +
    "   (Q-P3 c); every number is read off a registry row or history.bin, whose headers carry the sources, so `sources` above is empty. */\n" +
    "window.ATLAS_GLOSSARY_PLACES = " + head.slice(0, -1) + ",\"ids\":{\n" + keys.map((k) => JSON.stringify(k) + ":" + JSON.stringify(ids[k])).join(",\n") + "\n},\"windows\":{\n" +
    wkeys.map((k) => JSON.stringify(k) + ":" + JSON.stringify(windows[k])).join(",\n") + "\n}};\n";
}
function build(opts) {
  opts = opts || {};
  const log = opts.log || console.log;
  const R = require(path.join(ROOT, ".claude", "places-registry.js"));
  const reg = R.loadRegistry();
  /* the two input tables: since Phase 5 an offline file (glossary-places-input.json), no longer shipped at the foot of glossary.js */
  const w = JSON.parse(fs.readFileSync(path.join(HERE, "glossary-places-input.json"), "utf8")); w.GLOSSARY_PLACES = w.points; w.GLOSSARY_MAP_COUNTRY = w.countries;
  const spec = JSON.parse(fs.readFileSync(SPEC, "utf8"));
  const T = tableOf({ points: w.GLOSSARY_PLACES, countries: w.GLOSSARY_MAP_COUNTRY, resolved: spec.glossary, reg, fold: R.fold });
  /* the cards' joins (2026-10-23): the glossary's tags and aliases, the cards' answers, locators and places */
  const GW = require(path.join(ROOT, ".claude", "gloss-io.js")).loadGlossary();
  const terms = {}; for (const k of Object.keys(GW.GLOSSARY || {})) terms[k] = { tags: [].concat((GW.GLOSSARY_TAGS || {})[k] || []), aliases: [].concat((GW.GLOSSARY_ALIASES || {})[k] || []) };
  const cards = require(path.join(ROOT, ".claude", "card-io.js")).loadCards();
  const J = joinCards({ terms, cards: Array.isArray(cards) ? cards : cards.cards || [], reg, fold: R.fold, pinned: T.ids });
  const ids = Object.assign({}, T.ids);
  for (const k of Object.keys(J.ids)) if (!ENTITY_KINDS.includes(reg.rows.get(J.ids[k]).kind)) ids[k] = J.ids[k];   // a polity is a window, never a pin
  const allIds = Object.assign({}, J.ids, T.ids);
  /* the frames: card-faces.js's boxes for a present-day face, history.bin for an entity at its greatest extent */
  const cfw = {}; new Function("window", fs.readFileSync(path.join(ROOT, "atlas", "data", "card-faces.js"), "utf8"))(cfw);
  const F = require(path.join(ROOT, "atlas", "atlas-format.js"));
  const HT = F.read(new Uint8Array(fs.readFileSync(path.join(ROOT, "atlas", "data", "history.bin"))));
  const cache = new Map(); const extent = (id) => { if (!cache.has(id)) cache.set(id, entityExtent(HT, id)); return cache.get(id); };
  const Wn = windowsOf({ ids: allIds, coords: J.coords, reg, faces: cfw.ATLAS_CARD_FACES && cfw.ATLAS_CARD_FACES.layers, extent });
  const body = render(ids, Wn.windows);
  const left = T.left.concat(J.left, Wn.left);
  const wk = Object.keys(Wn.windows);
  log(`glossary-places: ${Object.keys(ids).length} terms get a pin (${Object.keys(w.GLOSSARY_PLACES || {}).length - T.left.filter((l) => l.via === "point").length} of ${Object.keys(w.GLOSSARY_PLACES || {}).length} points, ${Object.keys(w.GLOSSARY_MAP_COUNTRY || {}).length - T.left.filter((l) => l.via === "country").length} of ${Object.keys(w.GLOSSARY_MAP_COUNTRY || {}).length} countries, ${Object.keys(J.ids).length} through the cards); ${wk.length} get a window (${wk.filter((k) => Wn.windows[k][4]).length} at a year of greatest extent, ${wk.filter((k) => Wn.windows[k][3] && !Wn.windows[k][4]).length} present-day faces, ${Object.keys(J.coords).length} coordinates); ${Buffer.byteLength(body, "utf8")} bytes; ${left.length} left out`);
  for (const l of left) log(`  left out: ${l.slug} (${l.via}) — ${l.why}`);
  const table = { ids, windows: Wn.windows, left };
  if (opts.check) { const have = fs.existsSync(TARGET) ? fs.readFileSync(TARGET, "utf8") : ""; const ok = have === body; return { ok, why: ok ? "" : have ? "the committed file differs from what the glossary, the cards and the registry build" : "atlas/data/glossary-places.js does not exist", table, body }; }
  if (opts.dry) return { ok: true, table, body };
  if (opts.install) {
    const existed = fs.existsSync(TARGET), same = existed && fs.readFileSync(TARGET, "utf8") === body;
    if (!same) { fs.writeFileSync(TARGET, body); log("installed atlas/data/glossary-places.js"); } else log("atlas/data/glossary-places.js unchanged");
    if (!existed) { require("./build-credits.js").build({ install: true, log: () => {} }); log("regenerated atlas/data/credits.js"); }
  }
  return { ok: true, table, body };
}
module.exports = { build, tableOf, joinCards, entityExtent, windowsOf, locationClass, render, TARGET, PLACE_TAGS, GROUP_TAGS, EXCLUDE_TAGS };
if (require.main === module) {
  const argv = process.argv.slice(2);
  try {
    const r = build({ install: argv.includes("--install"), dry: argv.includes("--dry"), check: argv.includes("--check") });
    if (argv.includes("--check")) { console.log(r.ok ? "atlas/data/glossary-places.js is in step" : "STALE: " + r.why + " — run: node .claude/atlas-build/build-glossary-places.js --install"); process.exit(r.ok ? 0 : 1); }
  } catch (e) { console.error(e.message); process.exit(1); }
}
