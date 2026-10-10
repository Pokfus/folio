#!/usr/bin/env node
/* migrate-places.js — the ADDITIVE migration of every card's `locator`, `war` and `map` to the Phase 3 `places` field
   (Atlas v2 Phase 3a; docs/atlas-v2-design.md §2.8, §7 "Phase 3 — deliverable 2" and "Phase 3a — as built").

     node .claude/migrate-places.js             resolve every card's old fields against the registry (offline, from the cache),
                                                write `places` on the cards (through card-io.js), update
                                                .claude/atlas-build/places-spec.json with the rows the cards need, and write
                                                docs/atlas-places-report.md
     node .claude/migrate-places.js --fetch     first ask Wikidata (query.wikidata.org/sparql, through curl) about every toponym the
                                                cache does not hold — titles, then a search around each unresolved coordinate, then the
                                                classes met — writing .claude/atlas-build/places-wikidata.json after every answer; then
                                                run as above. Needs the network; everything else is offline.
     node .claude/migrate-places.js --check     CI (offline): every id in every card's `places` resolves in the registry; every id this
                                                migration derives is on its card (an author may ADD places, never lose the derived ones);
                                                every polity's linked cards carry the polity and the converse; places-spec.json is in step
                                                with atlas/data/places.js (build-places.js --check). Exit 1 on any failure.
     node .claude/migrate-places.js --dry       resolve and print the report, write nothing

   WHAT IT NEVER DOES. It never deletes or changes `locator`, `war`, `map` or anything else on a card (v1 reads them until Phase
   5); it never invents a place or a coordinate — a toponym enters the registry only as a Wikidata item whose coordinate agrees
   with the card's own, whose class maps to a kind of the taxonomy; it never chooses between two candidates (an ambiguity is
   listed in the report for the owner); it never touches a glossary term or a book (Q-P2 c, Q-P3 c). It is idempotent: a second
   run derives the same ids and writes the same bytes.

   HOW A TOPONYM RESOLVES (in this order; the first rule that answers wins, and the report says which did):
     1. the gazetteer by name or alias, kind-compatible and within the radius of the card's own coordinate (25 km for a point or
        a battle, 300 km for a region, a range, a river, a sea — whose anchors are centroids); several rows within the radius =
        AMBIGUOUS, listed, none chosen (Olympia in Washington is 9,961 km from gr-163's Olympia and is not a match);
     2. Wikidata by the English Wikipedia title that is the toponym itself (sitelink → item → P625 and P31), accepted when the
        item's coordinate is within the radius; an item the gazetteer already carries (same QID) resolves to the gazetteer row;
     3. Wikidata by exact English label or alias (one query per 40 names), accepted within the radius; exactly one item resolves,
        several are AMBIGUOUS;
     4. Wikidata around the coordinate (wikibase:around, items with an English article) whose English label or title folds to the
        toponym, or to the toponym's first comma-part ("Willendorf, Lower Austria"); exactly one such item resolves, several are
        AMBIGUOUS;
     5. none of these = UNRESOLVED, with the reason (no item, a disambiguation page, the item too far, a class the taxonomy has no
        kind for — the item's classes are printed so the owner can map or refuse them).
   A map card's key resolves to the gazetteer's country or admin-1 row of the layer's country; a war side's `keys` to the gazetteer's
   countries or to a polity entity by name or key; a war side's authored extent to the polity entity polity-spec.json links it to
   (and so does a locator's extent linked there); the polity entity table's own `cards` are carried back onto the cards, so a polity
   and its cards are connected both ways. The 31 glossary places (GLOSSARY_PLACES) are resolved and reported for Phase 3b's "show
   on the Atlas" button, and NOT written anywhere (terms do not contribute, Q-P3 c).

   Output: a card's `places` is the sorted, distinct list of ids; a heavy field (data-extra/), written only through card-io.js. */
"use strict";
const fs = require("fs"), path = require("path");
const { spawnSync } = require("child_process");
const { loadCards, writeCards } = require("./card-io.js");
const R = require("./places-registry.js");
const ROOT = path.join(__dirname, "..");
const BUILD = path.join(__dirname, "atlas-build");
const CACHE_FILE = path.join(BUILD, "places-wikidata.json");
const SPEC_FILE = path.join(BUILD, "places-spec.json");
const REPORT_FILE = path.join(ROOT, "docs", "atlas-places-report.md");
const POLITY_SPEC = path.join(__dirname, "polity-spec.json");
const argv = process.argv.slice(2);
const FETCH = argv.includes("--fetch"), CHECK = argv.includes("--check"), DRY = argv.includes("--dry"), VERBOSE = argv.includes("--verbose");
const fold = R.fold, km = R.km;
const log = (...a) => console.log(...a);

/* ---------- the taxonomy's kinds from Wikidata's classes: the first row whose top the class reaches (P279*) wins ---------- */
const TOPS = [
  ["site", "battle", ["Q178561"]],                                             // battle
  ["site", "cave", ["Q35509"]],                                                // cave
  ["site", "site", ["Q839954", "Q15661340", "Q1200957", "Q109577"]],            // archaeological site, ancient city, archaeological culture's type site…, ruins
  ["site", "building", ["Q44539", "Q4989906", "Q23413", "Q57821", "Q16970", "Q41176", "Q5003624", "Q1370598", "Q839954"]],   // temple, monument, castle, fortification, church, building, memorial, place of worship
  ["city", "", ["Q515", "Q1549591", "Q5119"]],                                  // city, big city, capital
  ["town", "", ["Q3957", "Q532", "Q486972", "Q15284", "Q123705", "Q702492"]],   // town, village, human settlement, municipality, neighbourhood, urban area
  ["river", "", ["Q4022", "Q47521", "Q355304", "Q1232319"]],                    // river, stream, watercourse, wadi
  ["lake", "", ["Q23397", "Q131681", "Q3215290"]],                              // lake, reservoir, lake group
  ["island-group", "", ["Q1402592"]],                                           // archipelago
  ["island", "", ["Q23442", "Q207524"]],                                        // island, atoll
  ["range", "", ["Q46831", "Q1437459", "Q1061151"]],                            // mountain range, massif, highland
  ["mountain", "", ["Q8502", "Q7944", "Q54050", "Q8072"]],                      // mountain, volcano, hill
  ["cape", "", ["Q185113"]],                                                    // cape
  ["strait", "", ["Q39594"]],
  ["gulf", "", ["Q1322134", "Q39594", "Q37901", "Q47053"]],                     // gulf, bay, fjord
  ["ocean", "", ["Q9430"]],
  ["sea", "", ["Q165", "Q15324", "Q1370598"]],                                  // sea, body of water
  ["region", "", ["Q82794", "Q1620908", "Q8514", "Q39816", "Q34763", "Q188628", "Q107425", "Q190429", "Q1048835", "Q3502482", "Q1970725", "Q4835091", "Q484170", "Q12284", "Q2221906"]],   // geographic region, historical region, desert, valley, peninsula, (continental) shelf, landscape, depression, territorial entity, cultural region, natural region, territory, commune, canal, geographic location
  ["polity", "", ["Q3024240", "Q7275", "Q6256", "Q3624078", "Q1763527", "Q133442", "Q28171280", "Q417175", "Q1048835"]],   // historical country, state, country, sovereign state, confederation, duchy, ancient civilisation, kingdom (reported, never a row: a polity is an entity)
  ["people", "", ["Q41710", "Q2472587", "Q465299", "Q11514315", "Q1792644"]],   // ethnic group, people, archaeological culture, historical period, art style (reported, never a row)
];
const TOP_IDS = [...new Set(TOPS.flatMap((t) => t[2]))];
const RADIUS = { point: 25, battle: 25, river: 300, region: 300, range: 300, sea: 300, shelf: 300 };
const radiusOf = (kind) => RADIUS[kind] || 25;
const DISAMBIG = "Q4167410";

/* ---------- the cache ---------- */
function loadCache() { try { return JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")); } catch (e) { return { retrieved: null, titles: {}, around: {}, classes: {} }; } }
function saveCache(c) { c.retrieved = new Date().toISOString().slice(0, 10); fs.writeFileSync(CACHE_FILE, JSON.stringify(c, null, 1) + "\n"); }
const W = require("./atlas-build/lib/wikidata.js");
function sparqlRetry(q, what) {
  for (let attempt = 0; attempt < 6; attempt++) {
    try { return W.sparql(q); } catch (e) { const wait = [5, 15, 30, 60, 120, 120][attempt]; log("  " + what + " refused (" + e.message.slice(0, 80) + "), waiting " + wait + " s"); spawnSync("sleep", [String(wait)]); }
  }
  throw new Error("Wikidata did not answer for " + what + "; re-run --fetch later (the cache keeps what arrived)");
}
const titleIri = (t) => "<https://en.wikipedia.org/wiki/" + encodeURIComponent(String(t).trim().replace(/ /g, "_")).replace(/%2C/g, ",").replace(/%3A/g, ":").replace(/%21/g, "!").replace(/%2A/g, "*").replace(/'/g, "%27") + ">";
const iriTitle = (iri) => decodeURIComponent(String(iri).split("/wiki/")[1] || "").replace(/_/g, " ");
const wktPoint = (s) => { const m = /Point\(\s*(-?[\d.]+)\s+(-?[\d.]+)\s*\)/.exec(s || ""); return m ? [Math.round(Number(m[1]) * 1e4) / 1e4, Math.round(Number(m[2]) * 1e4) / 1e4] : null; };
/* the items behind a batch of titles: item, coordinate, classes, label */
function fetchTitles(cache, titles) {
  const want = titles.filter((t) => !(t in cache.titles));
  for (let i = 0; i < want.length; i += 40) {
    const batch = want.slice(i, i + 40);
    const q = "SELECT ?article ?item ?coord ?label (GROUP_CONCAT(DISTINCT ?cls; separator=\" \") AS ?classes) WHERE { VALUES ?article { " + batch.map(titleIri).join(" ") + " } ?article schema:about ?item . OPTIONAL { ?item wdt:P625 ?coord } OPTIONAL { ?item wdt:P31 ?cls } OPTIONAL { ?item rdfs:label ?label FILTER(lang(?label) = \"en\") } } GROUP BY ?article ?item ?coord ?label";
    const got = {};
    for (const b of sparqlRetry(q, "titles batch " + (i / 40))) {
      const title = iriTitle(b.article.value); if (got[title]) continue;   // the first coordinate of an item with several
      got[title] = { qid: b.item.value.split("/").pop(), coord: b.coord ? wktPoint(b.coord.value) : null, classes: (b.classes && b.classes.value ? b.classes.value.split(" ") : []).map((x) => x.split("/").pop()).filter(Boolean), label: b.label ? b.label.value : "" };
    }
    for (const t of batch) cache.titles[t] = got[t] || null;
    saveCache(cache); process.stdout.write(`  titles ${Math.min(i + 40, want.length)}/${want.length}\r`); spawnSync("sleep", ["1.5"]);
  }
  if (want.length) log("");
  return want.length;
}
/* the items with an English article within `r` km of a point */
function fetchAround(cache, keys) {
  const want = keys.filter((k) => !(k in cache.around));
  let n = 0;
  for (const k of want) {
    const [lon, lat, r] = k.split(",").map(Number);
    const q = "SELECT ?item ?coord ?label ?article (GROUP_CONCAT(DISTINCT ?cls; separator=\" \") AS ?classes) WHERE { SERVICE wikibase:around { ?item wdt:P625 ?coord . bd:serviceParam wikibase:center \"Point(" + lon + " " + lat + ")\"^^geo:wktLiteral . bd:serviceParam wikibase:radius \"" + r + "\" . } ?article schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> . OPTIONAL { ?item wdt:P31 ?cls } OPTIONAL { ?item rdfs:label ?label FILTER(lang(?label) = \"en\") } } GROUP BY ?item ?coord ?label ?article LIMIT 600";
    const seen = new Set(), list = [];
    for (const b of sparqlRetry(q, "around " + k)) { const qid = b.item.value.split("/").pop(); if (seen.has(qid)) continue; seen.add(qid); list.push({ qid, coord: wktPoint(b.coord.value), label: b.label ? b.label.value : "", title: iriTitle(b.article.value), classes: (b.classes && b.classes.value ? b.classes.value.split(" ") : []).map((x) => x.split("/").pop()).filter(Boolean) }); }
    cache.around[k] = list; n++;
    saveCache(cache); process.stdout.write(`  around ${n}/${want.length}  (${k}: ${list.length} items)        \r`); spawnSync("sleep", ["1.2"]);
  }
  if (want.length) log("");
  return n;
}
/* the items whose English label or alias IS the toponym, with a coordinate (one query per 40 names, where `around` costs one
   per coordinate): the cheap second pass; the search around the coordinate is the third, for what is still open */
function fetchLabels(cache, names) {
  cache.labels = cache.labels || {};
  const want = names.filter((n) => !(n in cache.labels));
  const N = 8;   // a label lookup costs the service about two seconds a name (measured 2026-10-10: 10.7 s for five); forty names passed its 60 s limit and answered 400
  for (let i = 0; i < want.length; i += N) {
    const batch = want.slice(i, i + N);
    const lit = (n) => JSON.stringify(n) + "@en";
    const q = "SELECT ?lbl ?item ?coord ?label ?article (GROUP_CONCAT(DISTINCT ?cls; separator=\" \") AS ?classes) WHERE { VALUES ?lbl { " + batch.map(lit).join(" ") + " } { ?item rdfs:label ?lbl } UNION { ?item skos:altLabel ?lbl } ?item wdt:P625 ?coord . OPTIONAL { ?item wdt:P31 ?cls } OPTIONAL { ?item rdfs:label ?label FILTER(lang(?label) = \"en\") } OPTIONAL { ?article schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> } } GROUP BY ?lbl ?item ?coord ?label ?article LIMIT 2000";
    const got = {};
    for (const b of sparqlRetry(q, "labels batch " + (i / 40))) { const n = b.lbl.value; const qid = b.item.value.split("/").pop(); const l = got[n] || (got[n] = []); if (l.some((x) => x.qid === qid)) continue; l.push({ qid, coord: wktPoint(b.coord.value), label: b.label ? b.label.value : "", title: b.article ? iriTitle(b.article.value) : "", classes: (b.classes && b.classes.value ? b.classes.value.split(" ") : []).map((x) => x.split("/").pop()).filter(Boolean) }); }
    for (const n of batch) cache.labels[n] = got[n] || [];
    saveCache(cache); process.stdout.write(`  labels ${Math.min(i + N, want.length)}/${want.length}\r`); spawnSync("sleep", ["1.5"]);
  }
  if (want.length) log("");
  return want.length;
}
/* which of the taxonomy's tops each class reaches by subclass-of */
function fetchClasses(cache, classes) {
  const want = classes.filter((c) => !(c in cache.classes));
  for (let i = 0; i < want.length; i += 40) {
    const batch = want.slice(i, i + 40);
    const q = "SELECT ?cls ?label (GROUP_CONCAT(DISTINCT ?top; separator=\" \") AS ?tops) WHERE { VALUES ?cls { " + batch.map((c) => "wd:" + c).join(" ") + " } OPTIONAL { VALUES ?top { " + TOP_IDS.map((c) => "wd:" + c).join(" ") + " } ?cls wdt:P279* ?top } OPTIONAL { ?cls rdfs:label ?label FILTER(lang(?label) = \"en\") } } GROUP BY ?cls ?label";
    const got = {};
    for (const b of sparqlRetry(q, "classes batch " + (i / 40))) { const c = b.cls.value.split("/").pop(); got[c] = { label: b.label ? b.label.value : "", tops: (b.tops && b.tops.value ? b.tops.value.split(" ") : []).map((x) => x.split("/").pop()).filter(Boolean) }; }
    for (const c of batch) cache.classes[c] = got[c] || { label: "", tops: [] };
    saveCache(cache); process.stdout.write(`  classes ${Math.min(i + 40, want.length)}/${want.length}\r`); spawnSync("sleep", ["1.5"]);
  }
  if (want.length) log("");
  return want.length;
}
/* the kind (and sub-kind) an item's classes give, or null with the classes named */
function kindOf(cache, classes) {
  const reached = new Set();
  for (const c of classes) { reached.add(c); for (const t of ((cache.classes[c] || {}).tops || [])) reached.add(t); }
  for (const [kind, sub, tops] of TOPS) if (tops.some((t) => reached.has(t))) return { kind, sub };
  return null;
}
const classNames = (cache, classes) => classes.map((c) => c + (cache.classes[c] && cache.classes[c].label ? " (" + cache.classes[c].label + ")" : "")).join(", ") || "no class";

/* ---------- the toponyms the cards carry ---------- */
function collect(cards) {
  const topo = new Map();   // key → { name, label, kind, at, within, cards: [] }
  const keyOf = (name, at) => fold(name) + "@" + (at ? at[0].toFixed(2) + "," + at[1].toFixed(2) : "-");
  for (const c of cards) {
    const L = c.locator; if (!L || !L.name) continue;
    const at = Array.isArray(L.at) && isFinite(L.at[0]) && isFinite(L.at[1]) ? [Number(L.at[0]), Number(L.at[1])] : null;
    const k = keyOf(L.name, at);
    let t = topo.get(k); if (!t) topo.set(k, t = { name: L.name, label: L.label && fold(L.label) !== fold(L.name) ? L.label : "", kind: L.kind || "point", at, within: L.within || "", cards: [] });
    t.cards.push(c.id); if (!t.within && L.within) t.within = L.within;
  }
  return topo;
}
function glossaryPlaces() {
  const w = {}; try { new Function("window", fs.readFileSync(path.join(ROOT, "glossary.js"), "utf8"))(w); } catch (e) { return []; }
  return Object.entries(w.GLOSSARY_PLACES || {}).map(([slug, at]) => ({ slug, name: slug.replace(/_/g, " "), at: [Number(at[0]), Number(at[1])] }));
}

/* ---------- resolution ---------- */
function makeResolver(reg, cache) {
  const byQid = new Map(); for (const r of reg.rows.values()) if (r.qid) byQid.set(r.qid, r);
  const kindOk = (want, have) => {
    if (want === "point" || want === "battle") return !/^(country|admin1|sea|ocean|gulf|strait|lake|river|range|region|island-group|polity|people)$/.test(have);
    if (want === "river") return have === "river"; if (want === "range") return have === "range" || have === "mountain"; if (want === "sea" || want === "shelf") return /^(sea|ocean|gulf|strait|region)$/.test(have);
    if (want === "region") return /^(region|range|island|island-group|admin1|country|sea|gulf|lake)$/.test(have);
    return true;
  };
  const nameParts = (t) => [t.name, t.label].filter(Boolean).concat(t.name.includes(",") ? [t.name.split(",")[0].trim()] : []);
  /* resolve one toponym (name, kind, at): { id, via, row?, item? } | { ambiguous: [...] } | { unresolved: reason, classes? } */
  function resolve(t) {
    const r = radiusOf(t.kind);
    // 1. the gazetteer (and the places already in the registry) by name, kind-compatible, within the radius
    const near = [];
    for (const n of nameParts(t)) for (const row of (reg.byName.get(fold(n)) || [])) { if (row.kind === "polity" || row.kind === "people") continue; if (!kindOk(t.kind, row.kind)) continue; if (!t.at) { near.push({ row, d: null }); continue; } if (!row.at) continue; const d = km(row.at, t.at); if (d <= r && !near.some((x) => x.row === row)) near.push({ row, d }); }
    if (near.length === 1) return { id: near[0].row.id, via: reg.source(near[0].row.id), d: near[0].d };
    if (near.length > 1) return { ambiguous: near.map((x) => x.row.id + " " + x.row.name + " (" + x.row.kind + (x.d != null ? ", " + Math.round(x.d) + " km" : "") + ")") };
    if (!t.at) return { unresolved: "no coordinate to check against" };
    // 2. Wikidata by title
    let farTitle = null, disambig = false;
    for (const n of nameParts(t)) {
      const hit = cache.titles[n]; if (hit === undefined) return { unresolved: "not fetched (run --fetch)" }; if (!hit) continue;
      if (hit.classes.includes(DISAMBIG)) { disambig = true; continue; }
      if (!hit.coord) { farTitle = farTitle || { n, why: "the item has no coordinate" }; continue; }
      const d = km(hit.coord, t.at); if (d > r) { farTitle = farTitle || { n, why: "the item is " + Math.round(d) + " km from the card's coordinate" }; continue; }
      return accept(hit.qid, hit, n, d, "title");
    }
    // 3. Wikidata by exact English label or alias, within the radius (one query per 40 names)
    const wantNames = nameParts(t).map(fold);
    const labelled = []; let labelsAsked = false;
    for (const n of nameParts(t)) { const l = (cache.labels || {})[n]; if (l === undefined) continue; labelsAsked = true; for (const it of l) { if (!it.coord || km(it.coord, t.at) > r) continue; if (it.classes.includes(DISAMBIG)) continue; if (!labelled.some((x) => x.qid === it.qid)) labelled.push(it); } }
    if (labelled.length === 1) return accept(labelled[0].qid, labelled[0], t.name, km(labelled[0].coord, t.at), "label");
    if (labelled.length > 1) return { ambiguous: labelled.map((it) => it.qid + " " + (it.label || it.title) + " [" + classNames(cache, it.classes) + "], " + Math.round(km(it.coord, t.at)) + " km") };
    // 4. Wikidata around the coordinate (items with an English article), by label or title
    const ak = aroundKey(t); const list = cache.around[ak]; if (list === undefined) return { unresolved: labelsAsked ? "not fetched (run --fetch: the search around the coordinate)" : "not fetched (run --fetch)" };
    const cands = list.filter((it) => wantNames.includes(fold(it.label)) || wantNames.includes(fold(it.title)) || wantNames.includes(fold(it.title.replace(/\s*\([^)]*\)\s*$/, ""))));
    if (cands.length === 1) return accept(cands[0].qid, cands[0], t.name, km(cands[0].coord, t.at), "around");
    if (cands.length > 1) return { ambiguous: cands.map((it) => it.qid + " " + (it.label || it.title) + " [" + classNames(cache, it.classes) + "], " + Math.round(km(it.coord, t.at)) + " km") };
    if (farTitle) return { unresolved: "the article \"" + farTitle.n + "\" names an item but " + farTitle.why + "; nothing of that name within " + r + " km" };
    if (disambig) return { unresolved: "the title is a disambiguation page and nothing of that name lies within " + r + " km" };
    return { unresolved: "no Wikidata item of that name within " + r + " km (" + list.length + " items with an article there)" };
  }
  function accept(qid, item, name, d, via) {
    const have = byQid.get(qid); if (have) return { id: have.id, via: reg.source(have.id) + " (by QID through the " + via + ")", d };
    const k = kindOf(cache, item.classes || []);
    if (!k) return { unresolved: "the item " + qid + " (" + (item.label || item.title || name) + ") has no class the taxonomy maps: " + classNames(cache, item.classes || []), qid };
    if (k.kind === "polity") return { unresolved: "the item " + qid + " (" + (item.label || name) + ") is a state, not a place row — link it through polity-spec.json (" + classNames(cache, item.classes) + ")", qid };
    if (k.kind === "people") return { unresolved: "the item " + qid + " (" + (item.label || name) + ") is a people or a culture (Phase 2c), not a place row (" + classNames(cache, item.classes) + ")", qid };
    return { id: "pl:q" + qid.slice(1), via, d, item: { qid, kind: k.kind, sub: k.sub, coord: item.coord, label: item.label || "", title: item.title || (cache.titles[name] && cache.titles[name].qid === qid ? name : ""), classes: item.classes || [] } };
  }
  return { resolve, byQid };
}
const aroundKey = (t) => t.at[0].toFixed(3) + "," + t.at[1].toFixed(3) + "," + radiusOf(t.kind);

/* ---------- the run ---------- */
function run() {
  const { cards, tree } = loadCards();
  const reg = R.loadRegistry();
  const cache = loadCache();
  const topo = collect(cards);
  const gloss = glossaryPlaces();
  const spec = fs.existsSync(SPEC_FILE) ? JSON.parse(fs.readFileSync(SPEC_FILE, "utf8")) : { _about: "", rows: {} };
  const polSpec = JSON.parse(fs.readFileSync(POLITY_SPEC, "utf8"));
  log(`${cards.length} cards; ${topo.size} distinct locator toponyms over ${[...topo.values()].reduce((s, t) => s + t.cards.length, 0)} locators; ${gloss.length} glossary places; registry ${reg.rows.size} rows`);
  const resolver = makeResolver(reg, cache);
  /* --fetch: titles for every toponym the gazetteer does not answer, then around for what is still open, then the classes */
  if (FETCH) {
    const open = [...topo.values()].concat(gloss.map((g) => ({ name: g.name, label: "", kind: "point", at: g.at, cards: [] }))).filter((t) => { const r0 = resolver.resolve(t); return !r0.id && !r0.ambiguous; });
    const titles = [...new Set(open.flatMap((t) => [t.name, t.label].filter(Boolean).concat(t.name.includes(",") ? [t.name.split(",")[0].trim()] : [])))];
    log(`fetch: ${open.length} toponyms open; ${titles.length} titles to ask`);
    fetchTitles(cache, titles);
    fetchClasses(cache, [...new Set(Object.values(cache.titles).filter(Boolean).flatMap((h) => h.classes))]);
    const open2 = open.filter((t) => t.at && !resolver.resolve(t).id && !resolver.resolve(t).ambiguous);
    log(`fetch: ${open2.length} toponyms still open after the titles; asking by exact label`);
    fetchLabels(cache, [...new Set(open2.flatMap((t) => [t.name, t.label].filter(Boolean).concat(t.name.includes(",") ? [t.name.split(",")[0].trim()] : [])))]);
    fetchClasses(cache, [...new Set(Object.values(cache.labels).flat().flatMap((h) => h.classes))]);
    const still = open2.filter((t) => t.at && !resolver.resolve(t).id && !resolver.resolve(t).ambiguous);
    log(`fetch: ${still.length} toponyms still open after the labels; asking around each coordinate`);
    fetchAround(cache, [...new Set(still.map(aroundKey))]);
    fetchClasses(cache, [...new Set(Object.values(cache.around).flat().flatMap((h) => h.classes))]);
  }
  /* resolve every toponym */
  const res = new Map(); for (const [k, t] of topo) res.set(k, resolver.resolve(t));
  const glossRes = gloss.map((g) => ({ g, r: resolver.resolve({ name: g.name, label: "", kind: "point", at: g.at, cards: [] }) }));
  /* the rows the cards need that the registry lacks → the spec */
  const newRows = {};
  const topoById = new Map();
  for (const [k, t] of topo) { const r = res.get(k); if (!r.id) continue; let l = topoById.get(r.id); if (!l) topoById.set(r.id, l = []); l.push(t); if (r.item) { const row = newRows[r.id] || (newRows[r.id] = { name: r.item.title || r.item.label || t.name, kind: r.item.kind, sub: r.item.sub || "", qid: r.item.qid, at: r.item.coord, within: "", aliases: [], wiki: r.item.title || "", by: "migration", evidence: { classes: r.item.classes, via: r.via, km: Math.round((r.d || 0) * 10) / 10 }, cards: 0 }); for (const n of [t.name, t.label]) if (n && fold(n) !== fold(row.name) && !row.aliases.some((a) => fold(a) === fold(n))) row.aliases.push(n); row.cards += t.cards.length; } }
  for (const g of glossRes) if (g.r.item && !newRows[g.r.id] && !reg.rows.has(g.r.id)) newRows[g.r.id] = { name: g.r.item.title || g.r.item.label || g.g.name, kind: g.r.item.kind, sub: g.r.item.sub || "", qid: g.r.item.qid, at: g.r.item.coord, within: "", aliases: fold(g.g.name) === fold(g.r.item.title || g.r.item.label) ? [] : [g.g.name], wiki: g.r.item.title || "", by: "migration (glossary place)", evidence: { classes: g.r.item.classes, via: g.r.via, km: Math.round((g.r.d || 0) * 10) / 10 }, cards: 0 };
  // every accepted item is recorded under cache.items, so check-places.js can prove each row's coordinate and classes offline
  cache.items = cache.items || {}; let cacheGrew = false;
  for (const row of Object.values(newRows)) { const it = row.evidence && row.qid ? { coord: row.at, classes: row.evidence.classes || [], label: "", title: row.wiki || "" } : null; if (it && JSON.stringify(cache.items[row.qid]) !== JSON.stringify(it)) { cache.items[row.qid] = it; cacheGrew = true; } }
  if (cacheGrew && !DRY) saveCache(cache);
  // `within`: a site's city, when the locator says so and the city resolves (the gazetteer's cities, or a new row of this run)
  const withinOf = (t) => { if (!t.within) return ""; const near = []; for (const row of (reg.byName.get(fold(t.within)) || [])) { if (!/^(capital|city|town|site)$/.test(row.kind) || !row.at || !t.at) continue; if (km(row.at, t.at) <= 60) near.push(row); } for (const [id, row] of Object.entries(newRows)) if (fold(row.name) === fold(t.within) && row.at && t.at && km(row.at, t.at) <= 60 && !near.some((r) => r.id === id)) near.push({ id }); return near.length === 1 ? near[0].id : ""; };
  for (const [id, row] of Object.entries(newRows)) { const ts = topoById.get(id) || []; for (const t of ts) { const w = withinOf(t); if (w && w !== id) { row.within = w; break; } } }
  const withinOnly = [];   // a locator whose place is unresolved but whose `within` city resolves: the card gets the city, and the report says so
  /* the cards' places */
  const entByKey = new Map(); for (const e of reg.entities) if (e.kind === "polity") entByKey.set(e.key, e);
  const entByName = new Map(); for (const e of reg.entities) if (e.kind === "polity") entByName.set(fold(e.name), e);
  const linkedCards = new Map(); for (const e of reg.entities) if (e.kind === "polity") for (const c of e.cards || []) { let l = linkedCards.get(c); if (!l) linkedCards.set(c, l = new Set()); l.add(e.id); }
  const per = {};   // per collection prefix
  const bump = (p, k) => { const o = per[p] || (per[p] = { cards: 0, old: 0, placed: 0, none: 0, byLocator: 0, byMap: 0, byWar: 0, byLink: 0, noneOld: [] }); o[k]++; return o; };
  const unresolvedWar = new Map(), unresolvedMap = new Map(), unresolvedLinks = new Set(), noPlaceOld = [];
  const derived = new Map();   // card id → Set of ids
  const countryOf = (name) => { const l = (reg.byName.get(fold(name)) || []).filter((r) => r.kind === "country"); return l.length === 1 ? l[0] : null; };
  const admin1Of = (layer, name) => { const a0 = { "us-states": "adm0:usa", "china-provinces": "adm0:chn", "russia-subjects": "adm0:rus" }[layer]; if (!a0) return null; const variants = [name, name.replace(/\s+(Oblast|Krai|Republic|Autonomous Okrug)$/i, ""), name.replace(/^Republic of\s+/i, "")]; for (const v of variants) { const l = (reg.byName.get(fold(v)) || []).filter((r) => r.kind === "admin1" && r.within === a0); if (l.length === 1) return l[0]; if (l.length > 1) return { ambiguous: l }; } return null; };
  for (const c of cards) {
    const p = c.id.replace(/-\d+$/, ""); bump(p, "cards");
    const ids = new Set(); const had = !!(c.locator || c.war || c.map || linkedCards.has(c.id));
    if (had) bump(p, "old");
    if (c.locator && c.locator.name) {
      const L = c.locator; const at = Array.isArray(L.at) && isFinite(L.at[0]) ? [Number(L.at[0]), Number(L.at[1])] : null;
      const k = fold(L.name) + "@" + (at ? at[0].toFixed(2) + "," + at[1].toFixed(2) : "-"); const r = res.get(k);
      if (r && r.id) { ids.add(r.id); bump(p, "byLocator"); }
      else { const t = topo.get(k); const w = t ? withinOf(t) : ""; if (w) { ids.add(w); withinOnly.push(c.id + " " + L.name + " → within " + L.within + " (" + w + ")"); bump(p, "byLocator"); } }
    }
    if (c.map) { const keys = Array.isArray(c.map.key) ? c.map.key : [c.map.key]; let any = false; for (const key of keys) { let row = c.map.layer === "world" ? countryOf(key) : admin1Of(c.map.layer, key); if (row && row.ambiguous) { unresolvedMap.set(c.map.layer + ":" + key, "ambiguous: " + row.ambiguous.map((r) => r.id).join(", ")); row = null; } if (row) { ids.add(row.id); any = true; } else if (!unresolvedMap.has(c.map.layer + ":" + key)) unresolvedMap.set(c.map.layer + ":" + key, "no " + (c.map.layer === "world" ? "country" : "admin-1 row of the layer's country") + " of that name in the gazetteer"); } if (any) bump(p, "byMap"); }
    if (c.war) { let any = false; const link = polSpec.links[c.id] || {}; for (const side of ["victors", "losers"]) { const d = c.war[side]; if (!d) continue; const slugs = (side === "victors" ? link.v : link.l) || []; for (const s of slugs) { const e = entByKey.get(s); if (e) { ids.add(e.id); any = true; } else unresolvedLinks.add(s); } if (d.keys) for (const key of d.keys) { const row = countryOf(key) || entByName.get(fold(key)) || entByKey.get(fold(key).replace(/\s+/g, "_")); if (row) { ids.add(row.id); any = true; } else { let l = unresolvedWar.get(key); if (!l) unresolvedWar.set(key, l = []); l.push(c.id); } } else if (!slugs.length) { const e = entByName.get(fold(d.name)); if (e) { ids.add(e.id); any = true; } else { const key = d.name + " (authored extent)"; let l = unresolvedWar.get(key); if (!l) unresolvedWar.set(key, l = []); l.push(c.id); } } } if (any) bump(p, "byWar"); }
    if (linkedCards.has(c.id)) { for (const id of linkedCards.get(c.id)) ids.add(id); bump(p, "byLink"); }
    const link = polSpec.links[c.id]; if (link && link.area) for (const s of link.area) { const e = entByKey.get(s); if (e) ids.add(e.id); else unresolvedLinks.add(s); }
    if (ids.size) { bump(p, "placed"); derived.set(c.id, ids); } else { bump(p, "none"); if (had) { noPlaceOld.push(c.id); per[p].noneOld.push(c.id); } }
  }
  /* --check: the cards carry what is derived, every id resolves, the polities both ways, the spec in step */
  let fails = 0; const bad = (m) => { fails++; log("  FAIL  " + m); };
  if (CHECK) {
    const allIds = new Set(reg.rows.keys());
    for (const c of cards) { const have = new Set(Array.isArray(c.places) ? c.places : []); for (const id of have) { if (!R.validId(id)) bad(c.id + ": places carries \"" + id + "\", not a place id"); else if (!allIds.has(id)) bad(c.id + ": places carries " + id + ", which the registry does not resolve"); } const d = derived.get(c.id); if (d) for (const id of d) if (!have.has(id)) bad(c.id + ": the migration derives " + id + " but the card does not carry it (run node .claude/migrate-places.js)"); if (Array.isArray(c.places) && c.places.slice().sort().join() !== c.places.join()) bad(c.id + ": places is not sorted"); if (Array.isArray(c.places) && new Set(c.places).size !== c.places.length) bad(c.id + ": places has a duplicate"); }
    const byId = new Map(cards.map((c) => [c.id, c]));
    for (const e of reg.entities) if (e.kind === "polity") for (const cid of e.cards || []) { const c = byId.get(cid); if (!c) bad(e.id + " links " + cid + ", which is not a card"); else if (!(c.places || []).includes(e.id)) bad(e.id + " links " + cid + " but the card's places lack it"); }
    for (const c of cards) for (const id of c.places || []) if (id.startsWith("pol:") && !(reg.cardsOf(id) || []).includes(c.id)) { /* a card may point at a polity the spec does not link (an author's addition): allowed, reported */ }
    const B = require("./atlas-build/build-places.js"); const r = B.build({ check: true, log: () => {} }); if (!r.ok) bad("places-spec.json and atlas/data/places.js are not in step: " + r.why + " (run node .claude/atlas-build/build-places.js --install)");
    log(fails ? `\n${fails} failed\n` : "\nmigrate-places --check: every place id resolves, every derived id is on its card, every polity's cards carry it, the spec is in step\n");
    process.exit(fails ? 1 : 0);
  }
  /* write: the spec, the cards, the report */
  const resolvedTopo = [...res.values()].filter((r) => r.id).length, ambiguousTopo = [...res.entries()].filter(([, r]) => r.ambiguous), unresolvedTopo = [...res.entries()].filter(([, r]) => r.unresolved);
  if (!DRY) {
    const rows = Object.assign({}, spec.rows || {});
    for (const [id, row] of Object.entries(newRows)) { const old = rows[id]; if (old && old.manual) continue; rows[id] = Object.assign({}, old || {}, row); }
    // a migration row no card needs any more is dropped (a manual row is kept)
    for (const id of Object.keys(rows)) if (!rows[id].manual && !newRows[id]) delete rows[id];
    const out = { _about: "The places the cards need that the v0 gazetteer does not carry (Atlas v2 Phase 3a; docs/atlas-v2-design.md §2.8). GENERATED rows (`by: migration`) are written by .claude/migrate-places.js from the cards' own locators, each a Wikidata item whose coordinate lies within the card's radius and whose class maps to a kind of the taxonomy (`evidence`); MANUAL rows (`manual: true`, with a `reason`) are added by .claude/atlas-build/add-place.js and never overwritten. `node .claude/atlas-build/build-places.js --install` writes atlas/data/places.js from this file. Never edit a coordinate by hand.", rows: Object.fromEntries(Object.entries(rows).sort(([a], [b]) => (a < b ? -1 : 1))) };
    fs.writeFileSync(SPEC_FILE, JSON.stringify(out, null, 1) + "\n");
    const B = require("./atlas-build/build-places.js"); B.build({ install: true, log: VERBOSE ? log : () => {} });
    // the cards: additive — the derived ids are added to what a card already carries (an author's additions stay); unchanged cards stay byte-identical
    const reg2 = R.loadRegistry(); let changed = 0;
    for (const c of cards) { const d = derived.get(c.id); const have = Array.isArray(c.places) ? c.places.filter((id) => reg2.rows.has(id)) : []; const next = [...new Set(have.concat(d ? [...d].filter((id) => reg2.rows.has(id)) : []))].sort(); if (!next.length) { if (c.places !== undefined) { delete c.places; changed++; } continue; } if (JSON.stringify(next) !== JSON.stringify(c.places)) { c.places = next; changed++; } }
    writeCards(cards, tree);
    log(`wrote places on ${changed} cards (${derived.size} carry a derived place); spec ${Object.keys(out.rows).length} rows (${Object.keys(newRows).length} from this migration)`);
  }
  /* the report */
  const lines = [];
  const fmtY = (y) => y;
  lines.push("# Atlas v2 — the places migration report (Phase 3a)", "", "GENERATED by `node .claude/migrate-places.js` on " + new Date().toISOString().slice(0, 10) + " — never edit by hand; re-run the script. What it is: every card's `locator`, `war` and `map` resolved against the places registry (the gazetteer, `atlas/data/places.js`, the polity entity table) into the heavy field `places`; the old fields are untouched (v1 reads them until Phase 5). An unresolved or ambiguous toponym below is a decision for the owner, not a guess the script made. 📖 `docs/atlas-v2-design.md` §2.8 and §7 \"Phase 3a — as built\".", "");
  lines.push("## Counts per collection", "", "| collection | cards | with an old field | with `places` | by locator | by map | by war | by polity link | old field but no place |", "|---|---|---|---|---|---|---|---|---|");
  for (const [p, o] of Object.entries(per).sort()) lines.push(`| \`${p}\` | ${o.cards} | ${o.old} | ${o.placed} | ${o.byLocator} | ${o.byMap} | ${o.byWar} | ${o.byLink} | ${o.noneOld.length} |`);
  const tot = Object.values(per).reduce((s, o) => { for (const k of ["cards", "old", "placed", "byLocator", "byMap", "byWar", "byLink"]) s[k] = (s[k] || 0) + o[k]; s.noneOld = (s.noneOld || 0) + o.noneOld.length; return s; }, {});
  lines.push(`| **all** | ${tot.cards} | ${tot.old} | ${tot.placed} | ${tot.byLocator} | ${tot.byMap} | ${tot.byWar} | ${tot.byLink} | ${tot.noneOld} |`, "");
  lines.push(`Locator toponyms: ${topo.size} distinct (name + coordinate) over ${[...topo.values()].reduce((s, t) => s + t.cards.length, 0)} locators — ${resolvedTopo} resolved (${[...res.values()].filter((r) => r.id && /gazetteer/.test(r.via)).length} to the gazetteer, ${[...res.values()].filter((r) => r.id && /^places/.test(r.via)).length} to places.js rows of an earlier run, ${[...res.values()].filter((r) => r.id && r.item).length} to Wikidata items that became places.js rows: ${[...res.values()].filter((r) => r.id && r.via === "title").length} by article title, ${[...res.values()].filter((r) => r.id && r.via === "label").length} by exact label, ${[...res.values()].filter((r) => r.id && r.via === "around").length} by a search around the coordinate), ${ambiguousTopo.length} ambiguous, ${unresolvedTopo.length} unresolved. ${withinOnly.length} locators resolve only through their \`within\` city (listed below). Wikidata cache: ${Object.keys(cache.titles).length} titles, ${Object.keys(cache.labels || {}).length} labels, ${Object.keys(cache.around).length} searches, ${Object.keys(cache.classes).length} classes (retrieved ${cache.retrieved || "never"}).`, "");
  lines.push("## Unresolved toponyms (locators)", "", unresolvedTopo.length ? "| toponym | kind | coordinate | cards | why |" : "None.", ...(unresolvedTopo.length ? ["|---|---|---|---|---|"] : []));
  for (const [k, r] of unresolvedTopo.sort((a, b) => topo.get(b[0]).cards.length - topo.get(a[0]).cards.length || (a[0] < b[0] ? -1 : 1))) { const t = topo.get(k); lines.push(`| ${t.name}${t.label ? " (" + t.label + ")" : ""}${t.within ? ", within " + t.within : ""} | ${t.kind} | ${t.at ? t.at.join(", ") : "—"} | ${t.cards.slice(0, 6).join(", ")}${t.cards.length > 6 ? " +" + (t.cards.length - 6) : ""} | ${r.unresolved} |`); }
  lines.push("", "## Ambiguous matches (listed, none chosen)", "", ambiguousTopo.length ? "| toponym | kind | cards | candidates |" : "None.", ...(ambiguousTopo.length ? ["|---|---|---|---|"] : []));
  for (const [k, r] of ambiguousTopo) { const t = topo.get(k); lines.push(`| ${t.name} | ${t.kind} | ${t.cards.slice(0, 6).join(", ")}${t.cards.length > 6 ? " +" + (t.cards.length - 6) : ""} | ${r.ambiguous.join("; ")} |`); }
  lines.push("", "## Locators resolved only through their `within` city", "", withinOnly.length ? withinOnly.map((x) => "- " + x).join("\n") : "None.");
  lines.push("", "## War sides that resolve to nothing", "", unresolvedWar.size ? "| side | cards |" : "None.", ...(unresolvedWar.size ? ["|---|---|"] : []));
  for (const [k, l] of [...unresolvedWar].sort()) lines.push(`| ${k} | ${l.join(", ")} |`);
  lines.push("", "## Map keys that resolve to nothing", "", unresolvedMap.size ? "| layer:key | why |" : "None.", ...(unresolvedMap.size ? ["|---|---|"] : []));
  for (const [k, why] of [...unresolvedMap].sort()) lines.push(`| ${k} | ${why} |`);
  lines.push("", "## polity-spec.json links to series the history file does not carry", "", unresolvedLinks.size ? [...unresolvedLinks].sort().map((s) => "- `" + s + "` (deferred or a people: docs/atlas-v2-coverage.md)").join("\n") : "None.");
  lines.push("", "## Cards with an old field but no place at all", "", noPlaceOld.length ? noPlaceOld.join(", ") : "None.");
  lines.push("", "## Glossary places (GLOSSARY_PLACES, 31 coordinates) — resolved for Phase 3b's \"show on the Atlas\" button; terms do not contribute (Q-P3 c) and nothing is written", "", "| term | resolves to | via |", "|---|---|---|");
  for (const { g, r } of glossRes) lines.push(`| ${g.slug} | ${r.id ? r.id + " " + ((reg.rows.get(r.id) || newRows[r.id] || {}).name || "") : r.ambiguous ? "ambiguous: " + r.ambiguous.join("; ") : "— " + r.unresolved} | ${r.id ? r.via : ""} |`);
  const text = lines.join("\n") + "\n";
  if (DRY || VERBOSE) log(text);
  if (!DRY) { fs.writeFileSync(REPORT_FILE, text); log("wrote " + path.relative(ROOT, REPORT_FILE)); }
  log(`resolved ${resolvedTopo}/${topo.size} toponyms, ${ambiguousTopo.length} ambiguous, ${unresolvedTopo.length} unresolved; ${derived.size} cards derive a place; ${noPlaceOld.length} cards with an old field get none`);
}
module.exports = { TOPS, TOP_IDS, RADIUS, collect, makeResolver, loadCache, CACHE_FILE, SPEC_FILE, REPORT_FILE };
if (require.main === module) run();
