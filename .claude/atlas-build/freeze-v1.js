#!/usr/bin/env node
/* freeze-v1.js — THE LAST EXTRACTION OF DATA FROM THE RETIRED v1 FILES (Atlas v2 Phase 5; docs/atlas-v2-phase5-plan.md §4).

     node .claude/atlas-build/freeze-v1.js [--check]

   Phase 5 deletes world.js, us-states.js, china-provinces.js, russia-subjects.js, world-capitals.js, us-cities.js, state-capitals.js, timeline.js, polities.js and their builders. A few scripts
   that REMAIN used them as inputs — build-card-faces.js (the join of a map card's key to an engine entity), build-history.js and check-history.js (the pilot polities' period capitals), card-war.js
   (the names an old `war` field is checked against), add-card.js (a map card's key and dot) — and so did two things the readers keep: the map cards' "describe the map" sentence and Find it's country
   pool. This script reads the files ONE LAST TIME and writes what those need, small and committed, under .claude/atlas-build/frozen/:

     layers.json         per layer (us-states, china-provinces, russia-subjects, world): the card-facing words (`what`, `plural`, `cell`), every shape's name `n`, its short code `a`, its label
                         point `c`, the bounding box of the rings NEAR that point (the opening view's fit), for the world the largest ring's bounding-box area (Find it's size filter), the layer's
                         dot tables exactly as the old files held them, and the NEIGHBOURS of every single shape and of every key-list a card uses (the same grid-proximity rule as app.js's old
                         `mapNeighbours`, two cells to count, so the "describe the map" sentence is what it was)
     v1-names.json       every name the old maps carried: the world's, and each of the thirteen eras' (card-war.js checks an old `war` field against them)
     state-capitals.json the table STATE_CAPITALS (build-history.js reads it for the pilot polities' period capitals)

   `--check` re-reads the shape files (while they still exist) and says whether the frozen files are what they would write. After Phase 5 the shape files are gone from the tree: this script then
   only documents how the tables were made (`git show <the last commit with them>:world.js`). It is deleted with them. */
"use strict";
const fs = require("fs"), path = require("path");
const HERE = __dirname, ROOT = path.join(HERE, "..", ".."), FROZEN = path.join(HERE, "frozen");
const { loadCards } = require("../card-io.js");
const r3 = (v) => Math.round(v * 1000) / 1000;
const loadWin = (file) => { const p = path.join(ROOT, file); delete require.cache[require.resolve(p)]; global.window = {}; require(p); return global.window; };
const bbox = (ring) => { let x0 = 180, y0 = 90, x1 = -180, y1 = -90; for (const p of ring) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; } return [x0, y0, x1, y1, (x0 + x1) / 2, (y0 + y1) / 2]; };

/* the words and sizes app.js's CARD_MAP_LAYERS gave each layer (what the card windows and the "describe the map" sentence read) */
const LAYERS = [
  { layer: "us-states", file: "us-states.js", global: "US_STATES", what: "state", plural: "states", cell: 0.05, dots: [["US_CAPITALS", "us-states.js"], ["US_CITIES", "us-cities.js"]] },
  { layer: "china-provinces", file: "china-provinces.js", global: "CHINA_PROVINCES", what: "province", plural: "provinces", cell: 0.05, dots: [["CHINA_CAPITALS", "china-provinces.js"]] },
  { layer: "russia-subjects", file: "russia-subjects.js", global: "RUSSIA_SUBJECTS", what: "federal subject", plural: "federal subjects", cell: 0.05, dots: [["RUSSIA_CENTRES", "russia-subjects.js"]] },
  { layer: "world", file: "world.js", global: "WORLD_GEO", what: "country", plural: "countries", cell: 0.06, dots: [["WORLD_CAPITALS", "world-capitals.js"]] },
];

/* app.js's mapNeighbourCells / mapNeighbours, verbatim in rule: every ring segment is walked in steps of half a cell and each cell it passes is stamped with the shape's name; two shapes stamping a cell are
   neighbours there, and a neighbour counts when it shares at least NBR_MIN_CELLS cells with the own shapes (the Four Corners rule: 107 pairs of US states). */
const NBR_MIN_CELLS = 2;
function cellsOf(list, g) {
  const by = new Map(), step = g / 2;
  list.forEach((c) => (c.p || []).forEach((r) => {
    for (let i = 0; i + 1 < r.length; i++) {
      const x1 = r[i][0], y1 = r[i][1], x2 = r[i + 1][0], y2 = r[i + 1][1];
      const n = Math.max(1, Math.ceil(Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) / step));
      if (n > 4000) continue;   // the antimeridian seam is not a border
      for (let k = 0; k <= n; k++) {
        const key = Math.round((x1 + ((x2 - x1) * k) / n) / g) + ":" + Math.round((y1 + ((y2 - y1) * k) / n) / g);
        let set = by.get(key); if (!set) by.set(key, (set = new Set()));
        set.add(c.n);
      }
    }
  }));
  return by;
}
function neighboursOf(by, keys) {
  const own = new Set(keys), hits = new Map();
  by.forEach((set) => {
    let mine = false; set.forEach((n) => { if (own.has(n)) mine = true; });
    if (!mine) return;
    set.forEach((n) => { if (!own.has(n)) hits.set(n, (hits.get(n) || 0) + 1); });
  });
  const out = []; hits.forEach((n, name) => { if (n >= NBR_MIN_CELLS) out.push(name); });
  return out.sort((a, b) => a.localeCompare(b));
}

function build() {
  const cards = loadCards().cards || loadCards();
  const keySets = {};   // layer → Set of the "|"-joined key lists the cards use
  for (const c of cards) if (c.map && c.map.layer) { (keySets[c.map.layer] = keySets[c.map.layer] || new Set()).add([].concat(c.map.key).map(String).join("|")); }
  const layers = {}, problems = [];
  for (const L of LAYERS) {
    const list = loadWin(L.file)[L.global];
    if (!Array.isArray(list)) { problems.push(L.layer + ": no " + L.global); continue; }
    const keys = list.map((st) => {
      const near = st.p.filter((ring) => { const b = bbox(ring); return Math.abs(b[4] - st.c[0]) < 25 && Math.abs(b[5] - st.c[1]) < 25; });
      const rings = near.length ? near : st.p;
      let x0 = 180, y0 = 90, x1 = -180, y1 = -90; for (const ring of rings) { const b = bbox(ring); if (b[0] < x0) x0 = b[0]; if (b[1] < y0) y0 = b[1]; if (b[2] > x1) x1 = b[2]; if (b[3] > y1) y1 = b[3]; }
      const row = { n: st.n, a: st.a || null, c: [r3(st.c[0]), r3(st.c[1])], box: [r3(x0), r3(y0), r3(x1), r3(y1)] };
      if (L.layer === "world") { let best = 0; for (const ring of st.p) { const b = bbox(ring); const a = (b[2] - b[0]) * (b[3] - b[1]); if (a > best) best = a; } row.area = Math.round(best * 1000) / 1000; if (Math.abs(best - 30) < 0.01) problems.push("world: " + st.n + " has a largest-ring box area " + best + ", within 0.01 of Find it's threshold"); }
      return row;
    });
    const dots = {};
    for (const [g, file] of L.dots) { const T = loadWin(file)[g]; if (!T) { problems.push(`${L.layer}: ${file} does not define ${g}`); continue; } for (const [name, v] of Object.entries(T)) if (!dots[name]) dots[name] = v.n ? [v.c[0], v.c[1], v.s || "", v.n] : [v.c[0], v.c[1], v.s || ""]; }
    const by = cellsOf(list, L.cell), neighbours = {};
    for (const st of list) neighbours[st.n] = neighboursOf(by, [st.n]);
    for (const k of (keySets[L.layer] || [])) if (!(k in neighbours)) {
      const names = k.split("|").map((x) => { const t = list.find((s) => s.n === x) || list.find((s) => s.a === x); return t ? t.n : null; });
      if (names.some((x) => !x)) { problems.push(`${L.layer}: a card's key "${k}" is not in the layer`); continue; }
      neighbours[k] = neighboursOf(by, names);
    }
    layers[L.layer] = { what: L.what, plural: L.plural, cell: L.cell, keys, dots, neighbours };
  }
  // every name every map carried
  const w = loadWin("world.js"); const geo = w.WORLD_GEO || [];
  const world = new Set(); geo.forEach((g) => { if (g.n) world.add(String(g.n).toLowerCase()); if (g.a) world.add(String(g.a).toLowerCase()); });
  const eras = {};
  loadWin("world.js"); const tw = loadWin("timeline.js"); const TL = tw.TIMELINE || [];
  const geo2 = loadWin("world.js").WORLD_GEO || [];
  TL.forEach((e) => {
    const set = new Set();
    if (e.geo) e.geo.forEach((t) => { if (t.n) set.add(String(t.n).toLowerCase()); });
    else geo2.forEach((g) => { const nm = (e.groups || {})[g.n] || g.n; if (nm) set.add(String(nm).toLowerCase()); });
    eras[e.year] = [...set].sort();
  });
  const names = { format: 1, world: [...world].sort(), eras };
  const caps = loadWin("state-capitals.js").STATE_CAPITALS || {};
  return { layers: { format: 1, layers }, names, caps, problems };
}
const stable = (o) => JSON.stringify(o, null, 0).replace(/\},\{/g, "},\n{");
function main() {
  const r = build();
  if (r.problems.length) { console.error("freeze-v1: " + r.problems.length + " problems\n  " + r.problems.slice(0, 20).join("\n  ")); process.exit(1); }
  const files = { "layers.json": stable(r.layers), "v1-names.json": stable(r.names), "state-capitals.json": stable(r.caps) };
  if (process.argv.includes("--check")) {
    let bad = 0; for (const [f, t] of Object.entries(files)) { const cur = fs.existsSync(path.join(FROZEN, f)) ? fs.readFileSync(path.join(FROZEN, f), "utf8") : ""; if (cur.trimEnd() !== t.trimEnd()) { console.error("frozen/" + f + " differs"); bad++; } }
    if (bad) process.exit(1); console.log("freeze-v1 --check ok"); return;
  }
  fs.mkdirSync(FROZEN, { recursive: true });
  for (const [f, t] of Object.entries(files)) { fs.writeFileSync(path.join(FROZEN, f), t + "\n"); console.log("wrote frozen/" + f + " (" + t.length + " bytes)"); }
  const L = r.layers.layers;
  for (const k of Object.keys(L)) console.log(`  ${k}: ${L[k].keys.length} shapes, ${Object.keys(L[k].dots).length} dots, ${Object.keys(L[k].neighbours).length} neighbour lists`);
}
main();
