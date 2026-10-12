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
  ["mountain", "", ["Q8502", "Q7944", "Q8072"]],                                // mountain, volcano (and Q7944, kept as 3a wrote it)
  ["hill", "", ["Q54050"]],                                                     // hill (3c, decision 3): AFTER mountain, so an item Wikidata classes as both is the mountain
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
const DIRECT_NATURAL = ["island", "island-group", "range", "mountain", "hill", "cape"];   // the rows whose class lists are clean natural features (a river or a lake that is also a site stays a site: an archaeological site named for its river is the site)
const RADIUS = { point: 25, battle: 25, river: 300, region: 300, range: 300, sea: 300, shelf: 300 };
const radiusOf = (kind) => RADIUS[kind] || 25;
const DISAMBIG = "Q4167410";
/* PHASE 3b, THE OWNER'S DECISION 1 — ONE PLACE PER PHYSICAL SITE, PERIOD NAMES AS ALIASES (Byzantium, Constantinople and Istanbul
   are one place). Two rules, both literal:
     · candidates for ONE toponym are AMBIGUOUS only when some two lie more than SAME_SITE_KM (25 km) apart, or when they are of
       different KINDS; otherwise they are the same site and MERGE into one row, the others' names becoming its aliases;
     · a "kind" for that comparison is the kind FAMILY: a capital, a city, a town, an ancient city or archaeological site (and
       a polis, which is an ancient city) are one family — the settlement — because that is what Byzantium, Constantinople and
       Istanbul are; a battle, a cave, a building, an island, a mountain, a cape, a river, a region, a sea … each stay their own,
       so Thera the island and Ancient Thera the site, or Akrotiri the site and Akrotiri the cape, remain ambiguous.
   Across toponyms the same site is looser evidence (two different names, two different Wikidata items): the migration merges
   only a settlement row IT OWNS into another settlement row within CROSS_SITE_KM (2 km), never touching the gazetteer; period
   names 2–25 km from a modern settlement stay two places UNLESS Wikidata itself links the two items (Phase 3c, decision 2: P1366
   replaced by, P1365 replaces, P460 said to be the same as, or one shared English Wikipedia article — `crossMerge`'s `links`, read
   from the cache; Phase 2c, Task 0a: P460 counts only when the two items are under 25 km apart and in the same kind family), and are otherwise listed in the report with the evidence checked (`merges` in places-spec.json takes the
   owner's decision). Also Phase 3c: an island and the polis of the same name are one site (`islandPolis`), and Wikidata's hill
   (Q54050) is the kind `hill`, read after `mountain` (TOPS). */
const SAME_SITE_KM = 25, CROSS_SITE_KM = 2;
const Q_POLIS = "Q148837", Q_ANCIENT_CITY = "Q15661340";
const PERIOD_CLASSES = [Q_ANCIENT_CITY, Q_POLIS];                                          // an ancient city, a polis
const MODERN_CITY_CLASSES = ["Q515", "Q3957", "Q5119", "Q1549591"];                       // city, town, capital city, big city
const SETTLE_CLASSES = [Q_ANCIENT_CITY, Q_POLIS, "Q515", "Q3957", "Q532", "Q486972", "Q1549591", "Q5119", "Q15284"];   // + city, town, village, human settlement, big city, capital, municipality
const familyOf = (kind, sub) => {
  if (kind === "capital" || kind === "city" || kind === "town") return "settlement";
  if (kind === "site") return sub === "battle" ? "battle" : sub === "cave" ? "cave" : sub === "building" ? "building" : "settlement";
  return kind || "unmapped";
};

/* ---------- the cache ---------- */
function loadCache() { try { return JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")); } catch (e) { return { retrieved: null, titles: {}, around: {}, classes: {} }; } }
function saveCache(c) { c.retrieved = new Date().toISOString().slice(0, 10); fs.writeFileSync(CACHE_FILE, JSON.stringify(c, null, 1) + "\n"); }
const W = require("./atlas-build/lib/wikidata.js");
function sparqlRetry(q, what, tries) {
  for (let attempt = 0; attempt < (tries || 6); attempt++) {
    try { return W.sparql(q); } catch (e) { const wait = [5, 15, 30, 60, 120, 120][attempt]; log("  " + what + " refused (" + e.message.slice(0, 80) + "), waiting " + wait + " s"); spawnSync("sleep", [String(wait)]); }
  }
  throw new Error("Wikidata did not answer for " + what + "; re-run --fetch later (the cache keeps what arrived)");
}
/* a query that may be too heavy for the service: a 429 is waited out like any other (the full back-off), a 400 or 504 (the
   service's own limit) is thrown at once so the caller can shrink the question */
function sparqlHeavy(q, what) {
  for (let attempt = 0; attempt < 6; attempt++) {
    try { return W.sparql(q); } catch (e) { if (/HTTP (400|504)/.test(e.message)) throw e; const wait = [5, 15, 30, 60, 120, 120][attempt]; log("  " + what + " refused (" + e.message.slice(0, 60) + "), waiting " + wait + " s"); spawnSync("sleep", [String(wait)]); }
  }
  throw new Error("HTTP 429: Wikidata did not answer for " + what);
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
    const [lon, lat, r0] = k.split(",").map(Number);
    const seen = new Set(), list = [];
    // a circle the service cannot answer within its limit (504 / 400) is tried again at half the radius, down to 6 km; a failure
    // there is recorded (cache.aroundErrors) and the toponym stays unresolved with that reason — never guessed
    let r = r0, rows = null, err = null;
    while (r >= 6 && !rows) { try { rows = sparqlHeavy("SELECT ?item ?coord ?label ?article (GROUP_CONCAT(DISTINCT ?cls; separator=\" \") AS ?classes) WHERE { SERVICE wikibase:around { ?item wdt:P625 ?coord . bd:serviceParam wikibase:center \"Point(" + lon + " " + lat + ")\"^^geo:wktLiteral . bd:serviceParam wikibase:radius \"" + r + "\" . } ?article schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> . OPTIONAL { ?item wdt:P31 ?cls } OPTIONAL { ?item rdfs:label ?label FILTER(lang(?label) = \"en\") } } GROUP BY ?item ?coord ?label ?article LIMIT 400", "around " + k + " at " + r + " km"); } catch (e) { err = e.message; r = r / 2; } }
    if (!rows) { cache.aroundErrors = cache.aroundErrors || {}; cache.aroundErrors[k] = err; log("  around " + k + ": the service could not answer (" + err.slice(0, 60) + "); recorded"); rows = []; }
    for (const b of rows) { const qid = b.item.value.split("/").pop(); if (seen.has(qid)) continue; seen.add(qid); list.push({ qid, coord: wktPoint(b.coord.value), label: b.label ? b.label.value : "", title: iriTitle(b.article.value), classes: (b.classes && b.classes.value ? b.classes.value.split(" ") : []).map((x) => x.split("/").pop()).filter(Boolean) }); }
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
  const want = names.filter((n) => typeof n === "string" && n && !(n in cache.labels));
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
/* PHASE 3c, DECISION 2: what Wikidata itself says links two items — P1366 replaced by, P1365 replaces, P460 said to be the same as, and the
   English Wikipedia sitelink — from Special:EntityData (the SPARQL service answered 429 "1 req / min" on 2026-10-11; this endpoint
   answered). cache.links[Q] = { enwiki, P1366?, P1365?, P460? } (an empty list is left out); a failed item is NOT recorded, so the
   pair stays "could not check" and the next --fetch asks again. Written after every ten, `retrieved` untouched. */
const UA = "folio-atlas-build/0.1 (https://folio.study) curl";
function fetchLinks(cache, qids) {
  cache.links = cache.links || {};
  const want = qids.filter((q) => /^Q\d+$/.test(q) && !(q in cache.links));
  let n = 0, failed = 0;
  for (const q of want) {
    let e = null, err = "";
    for (let attempt = 0; attempt < 5 && !e; attempt++) {
      const r = spawnSync("curl", ["-sS", "-L", "-m", "60", "-A", UA, "-w", "\n%{http_code}", "https://www.wikidata.org/wiki/Special:EntityData/" + q + ".json"], { encoding: "utf8", maxBuffer: 1 << 27 });
      const nl = (r.stdout || "").lastIndexOf("\n"), code = r.status === 0 ? (r.stdout || "").slice(nl + 1).trim() : "curl";
      if (code === "200") { try { const j = JSON.parse(r.stdout.slice(0, nl)); e = j.entities && (j.entities[q] || Object.values(j.entities)[0]); if (!e) err = "no entity in the answer"; } catch (x) { err = "unparsable answer"; } if (!e) break; }
      else { err = "HTTP " + code; if (code === "404") break; const wait = [5, 15, 30, 60, 120][attempt]; log("  " + q + " refused (" + err + "), waiting " + wait + " s"); spawnSync("sleep", [String(wait)]); }
    }
    if (!e) { failed++; log("  " + q + ": could not be read (" + err + "); not recorded"); continue; }
    const ids = (p) => [...new Set(((e.claims || {})[p] || []).filter((c) => c.rank !== "deprecated" && c.mainsnak && c.mainsnak.datavalue && c.mainsnak.datavalue.value && c.mainsnak.datavalue.value.id).map((c) => c.mainsnak.datavalue.value.id))].sort();
    const rec = { enwiki: (e.sitelinks && e.sitelinks.enwiki && e.sitelinks.enwiki.title) || null };
    for (const p of ["P1366", "P1365", "P460"]) { const l = ids(p); if (l.length) rec[p] = l; }
    cache.links[q] = rec; n++;
    if (n % 10 === 0) { fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 1) + "\n"); }
    process.stdout.write(`  links ${n + failed}/${want.length}\r`); spawnSync("sleep", ["1.5"]);
  }
  if (want.length) { fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 1) + "\n"); log(`  links: ${n} read, ${failed} failed, of ${want.length} asked`); }
  return n;
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
  /* A POLIS is the ancient Greek city (3b, decision 1). Its class reaches site, city and polity at once through subclass-of, so an
     item that is an island AND a polis (Salamis, Ithaca, Thera) was a `site` and the island vanished into the ancient city. The
     polis class is read last: the item's other classes decide first (an island stays an island), and an item that is nothing but a
     polis is the ancient city it is. */
  const reachedOf = (cls) => { const r = new Set(); for (const c of cls) { r.add(c); for (const t of ((cache.classes[c] || {}).tops || [])) r.add(t); } return r; };
  const first = (reached) => { for (const [kind, sub, tops] of TOPS) if (tops.some((t) => reached.has(t))) return { kind, sub }; return null; };
  /* a NATURAL feature named directly by a class decides before anything reached by subclass-of: Santorini is an island AND a tourist
     destination, and the site row's tops hold "tourist destination" (3a read it as a `site`); a mountain that is also a "tourist
     destination" is a mountain. Only the clean natural rows are read this way. */
  for (const [kind, sub, tops] of TOPS) if (DIRECT_NATURAL.includes(kind) && classes.some((c) => tops.includes(c))) return { kind, sub };
  const others = classes.filter((c) => c !== Q_POLIS);
  if (others.length !== classes.length) { const k = first(reachedOf(others)); if (k && k.kind !== "polity" && k.kind !== "people" && k.kind !== "culture") return k; return { kind: "site", sub: "site" }; }
  return first(reachedOf(classes));
}
/* a candidate that is not a place at all (3a's own rule, stated once): every class it has is one of these — a mint, a diocese, a
   titular see, a conservation area, a museum, a railway or metro station */
const NOT_PLACE_CLASSES = new Set(["Q464780", "Q1184788", "Q15217609", "Q1191622", "Q33506", "Q928830", "Q22808403", "Q55485", "Q55488"]);
const notAPlace = (classes) => Array.isArray(classes) && classes.length > 0 && classes.every((c) => NOT_PLACE_CLASSES.has(c));
/* the kind family of an item, for the same-site comparison. A settlement-scale administrative unit or a port (a freguesia, a civil
   parish, a district, a commune, a locality, a municipality seat, a port) reaches `region`, `strait` or `building` only through
   Wikidata's catch-all tops, but it is the town it is named for: its class LABEL says so, and the specific kinds (an island, a
   battle, a mountain, a cape, a river) are never overridden */
const ADMIN_UNIT_LABEL = /\b(commune|comune|municipalit\w*|freguesia|parish|district|town|village|locality|settlement|borough|suburb|frazione|municipium|seat|port|neighbou?rhood)\b/i;
function familyOfItem(cache, item) {
  const k = kindOf(cache, item.classes || []) || { kind: "unmapped", sub: "" };
  const fam = familyOf(k.kind, k.sub);
  if (/^(region|strait|gulf|sea|building|unmapped)$/.test(fam) && (item.classes || []).some((c) => ADMIN_UNIT_LABEL.test((cache.classes[c] || {}).label || ""))) return "settlement";
  return fam;
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
    // a label is taken only as a string (one shipped locator carries a coordinate pair there — a data fault for the owner, reported below)
    let t = topo.get(k); if (!t) topo.set(k, t = { name: L.name, label: typeof L.label === "string" && L.label && fold(L.label) !== fold(L.name) ? L.label : "", kind: L.kind || "point", at, within: typeof L.within === "string" ? L.within : "", cards: [], oddLabel: L.label !== undefined && typeof L.label !== "string" });
    t.cards.push(c.id); if (!t.within && L.within) t.within = L.within;
  }
  return topo;
}
function glossaryPlaces() {
  const w = {}; try { new Function("window", fs.readFileSync(path.join(ROOT, "glossary.js"), "utf8"))(w); } catch (e) { return []; }
  return Object.entries(w.GLOSSARY_PLACES || {}).map(([slug, at]) => ({ slug, name: slug.replace(/_/g, " "), at: [Number(at[0]), Number(at[1])] }));
}

/* ---------- resolution ---------- */
function makeResolver(reg, cache, mergedQ) {
  const byQid = new Map(); for (const r of reg.rows.values()) if (r.qid) byQid.set(r.qid, r);
  // an item an earlier run folded into another place (the same site under another name) resolves to that place (3b, decision 1)
  if (mergedQ) for (const [q, id] of mergedQ) if (!byQid.has(q) && reg.rows.has(id)) byQid.set(q, reg.rows.get(id));
  const kindOk = (want, have) => {
    if (want === "point" || want === "battle") return !/^(country|admin1|sea|ocean|gulf|strait|lake|river|range|region|island-group|polity|people)$/.test(have);
    if (want === "river") return have === "river"; if (want === "range") return have === "range" || have === "mountain" || have === "hill"; if (want === "sea" || want === "shelf") return /^(sea|ocean|gulf|strait|region)$/.test(have);
    if (want === "region") return /^(region|range|island|island-group|admin1|country|sea|gulf|lake)$/.test(have);
    return true;
  };
  const nameParts = (t) => [t.name, t.label].filter(Boolean).concat(t.name.includes(",") ? [t.name.split(",")[0].trim()] : []);
  /* THE SAME-SITE RULE (decision 1). `list`: [{ key, name, kind, sub, d, at, rank }] — registry rows (rank 0 the gazetteer, 1 the
     places already written, 2 an entity) or Wikidata items (rank 3), each with its distance from the card's coordinate.
     Returns { rep, others } when they are one site, or { ambiguous: [...], why } — different kinds, or two more than 25 km apart.
     The representative is the candidate nearest the card's own coordinate (a tie is anything within a kilometre of the nearest),
     then the one whose name or title IS the toponym, then the gazetteer's own row, then the lowest Wikidata number: the card's
     coordinate is the author's statement of where the site is, so the item standing there is the one the card is about. */
  /* PHASE 3c, THE OWNER'S DECISION 1 — AN ISLAND AND THE POLIS OF THE SAME NAME ARE ONE SITE (Thera, Salamis, Ithaca, Seriphos). When
     the candidates are islands and settlements only, within SAME_SITE_KM, and the settlement side is a polis or an ancient city (a
     separate item of that class, or the island's own item carrying the polis class — Ithaca, Salamis Island), they fold into the
     ISLAND row: the toponym names the island, and the polis becomes an alias and a `merged` item. A modern settlement that carries
     the toponym only as an alias (Vathy answers "Ithaca") is not the toponym's place and is SET ASIDE, not folded and not
     reported as a rival; one that bears the name itself (a town called Rhodes beside the island) is a different kind and keeps the
     toponym ambiguous. A palace or a battlefield and the town beside it (Versailles, Waterloo) are not this case and stay ambiguous. */
  const periodCand = (c) => c.it ? (c.it.classes || []).some((x) => PERIOD_CLASSES.includes(x)) : !!(c.row && c.row.kind === "site" && (c.row.sub === "site" || !c.row.sub));
  const ownNameCand = (c, want) => c.it ? [c.it.label, c.it.title, String(c.it.title || "").replace(/\s*\([^)]*\)\s*$/, "")].some((n) => n && want.has(fold(n))) : want.has(fold(c.name));
  function islandPolis(list, want) {
    const fam = (c) => c.fam || familyOf(c.kind, c.sub);
    if (!list.every((c) => fam(c) === "island" || fam(c) === "settlement")) return null;
    const islands = list.filter((c) => fam(c) === "island"), settle = list.filter((c) => fam(c) === "settlement");
    if (!islands.length || !settle.length) return null;
    const period = settle.filter(periodCand), other = settle.filter((c) => !periodCand(c));
    if (other.some((c) => ownNameCand(c, want))) return null;
    if (!period.length && !islands.some((c) => c.it && (c.it.classes || []).includes(Q_POLIS))) return null;
    return { islands, members: islands.concat(period), aside: other };
  }
  function sameSite(list, t, show) {
    const want = new Set(nameParts(t).map(fold));
    let fams = [...new Set(list.map((c) => c.fam || familyOf(c.kind, c.sub)))];
    let pool = list, aside = [], ip = null;
    if (fams.length > 1) { ip = islandPolis(list, want); if (ip) { pool = ip.members; aside = ip.aside; fams = ["island"]; } }
    let span = 0; for (let i = 0; i < pool.length; i++) for (let j = i + 1; j < pool.length; j++) if (pool[i].at && pool[j].at) span = Math.max(span, km(pool[i].at, pool[j].at));
    if (fams.length > 1 || span > SAME_SITE_KM) return { ambiguous: list.map(show), why: fams.length > 1 ? "different kinds (" + fams.join(", ") + ")" : "more than " + SAME_SITE_KM + " km apart (" + Math.round(span) + " km)" };
    const cands = ip ? ip.islands : pool, dmin = Math.min(...cands.map((c) => (c.d == null ? 0 : c.d)));
    const tie = cands.filter((c) => (c.d == null ? 0 : c.d) <= dmin + 1);
    const num = (c) => Number(String(c.key).replace(/\D/g, "")) || 0;
    const pulled = (c) => (c.fam && c.fam !== familyOf(c.kind, c.sub) ? 1 : 0);   // a district or a port that is only a settlement by its class label is the second choice
    tie.sort((a, b) => pulled(a) - pulled(b) || (want.has(fold(b.name)) ? 1 : 0) - (want.has(fold(a.name)) ? 1 : 0) || a.rank - b.rank || num(a) - num(b) || (a.key < b.key ? -1 : 1));
    return { rep: tie[0], others: pool.filter((c) => c !== tie[0]), aside, islandPolis: !!ip };
  }
  /* resolve one toponym (name, kind, at): { id, via, row?, item? } | { ambiguous: [...] } | { unresolved: reason, classes? } */
  function resolve(t) {
    const r = radiusOf(t.kind);
    // 1. the gazetteer (and the places already in the registry) by name, kind-compatible, within the radius
    const near = [];
    for (const n of nameParts(t)) for (const row of (reg.byName.get(fold(n)) || [])) { if (row.kind === "polity" || row.kind === "people" || row.kind === "culture") continue; if (!kindOk(t.kind, row.kind)) continue; if (!t.at) { near.push({ row, d: null }); continue; } if (!row.at) continue; const d = km(row.at, t.at); if (d <= r && !near.some((x) => x.row === row)) near.push({ row, d }); }
    if (near.length === 1) return { id: near[0].row.id, via: reg.source(near[0].row.id), d: near[0].d };
    if (near.length > 1) {
      const rankOf = (id) => { const sName = reg.source(id); return sName === "gazetteer" ? 0 : sName === "places" ? 1 : 2; };
      const g = sameSite(near.map((x) => ({ key: x.row.id, name: x.row.name, kind: x.row.kind, sub: x.row.sub || "", d: x.d, at: x.row.at, rank: rankOf(x.row.id), row: x.row })), t, (c) => c.key + " " + c.name + " (" + c.kind + (c.d != null ? ", " + Math.round(c.d) + " km" : "") + ")");
      if (g.ambiguous) return { ambiguous: g.ambiguous, why: g.why };
      return { id: g.rep.key, via: reg.source(g.rep.key), d: g.rep.d, merged: g.others.map((c) => ({ id: c.key, name: c.name })) };
    }
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
    // a candidate whose classes map to no kind of the taxonomy (a mint, a diocese, a conservation area, a museum) is not a place
    // the registry could hold, so it does not make the match ambiguous — the kind rule, not a choice
    const placeLike = (l) => { const real = l.filter((it) => !notAPlace(it.classes)); const base = real.length ? real : l; const k = base.filter((it) => kindOf(cache, it.classes)); return k.length ? k : base; };
    // candidates are items: one resolves; several are one site (merged, the others' names kept as aliases) or ambiguous (3b, decision 1)
    const fromItems = (l, via) => {
      if (l.length === 1) return accept(l[0].qid, l[0], t.name, km(l[0].coord, t.at), via);
      const entries = l.map((it) => { const k = kindOf(cache, it.classes) || { kind: "unmapped", sub: "" }; return { key: it.qid, name: it.title || it.label || "", kind: k.kind, sub: k.sub, fam: familyOfItem(cache, it), d: km(it.coord, t.at), at: it.coord, rank: 3, it }; });
      const g = sameSite(entries, t, (c) => c.key + " " + (c.it.label || c.it.title) + " [" + classNames(cache, c.it.classes) + "], " + Math.round(c.d) + " km");
      if (g.ambiguous) return { ambiguous: g.ambiguous, why: g.why };
      const out = accept(g.rep.it.qid, g.rep.it, t.name, g.rep.d, via, g.rep.fam && g.rep.fam !== familyOf(g.rep.kind, g.rep.sub) ? { kind: "town", sub: "" } : null);   // a settlement-scale district or port is the town it is named for
      if (out.id) { out.merged = g.others.map((c) => Object.assign({ qid: c.key, name: c.it.title || c.it.label || "", label: c.it.label || "", title: c.it.title || "", kind: c.kind, at: c.at }, g.islandPolis ? { how: "island-polis" } : {})); if (g.aside.length) out.aside = g.aside.map((c) => ({ qid: c.key, name: c.it.title || c.it.label || "" })); }
      return out;
    };
    const lab = placeLike(labelled);
    if (lab.length) return fromItems(lab, "label");
    // 4. Wikidata around the coordinate (items with an English article), by label or title
    const ak = aroundKey(t); const got = cache.around[ak]; if (got === undefined) return { unresolved: labelsAsked ? "not fetched (run --fetch: the search around the coordinate)" : "not fetched (run --fetch)" };
    const list = Array.isArray(got) ? got : got.items, nAround = Array.isArray(got) ? got.length : got.n;   // a fetched list, or one pruned to the names the cards use (with the count it had)
    if (!nAround && cache.aroundErrors && cache.aroundErrors[ak]) return { unresolved: "no item of that name by title or label within " + r + " km, and the search around the coordinate could not be answered by the service (" + String(cache.aroundErrors[ak]).slice(0, 40) + ")" };
    const cands = list.filter((it) => wantNames.includes(fold(it.label)) || wantNames.includes(fold(it.title)) || wantNames.includes(fold(it.title.replace(/\s*\([^)]*\)\s*$/, ""))));
    const cs = placeLike(cands);
    if (cs.length) return fromItems(cs, "around");
    if (farTitle) return { unresolved: "the article \"" + farTitle.n + "\" names an item but " + farTitle.why + "; nothing of that name within " + r + " km" };
    if (disambig) return { unresolved: "the title is a disambiguation page and nothing of that name lies within " + r + " km" };
    return { unresolved: "no Wikidata item of that name within " + r + " km (" + nAround + " items with an article there)" };
  }
  function accept(qid, item, name, d, via, forceKind) {
    const have = byQid.get(qid); if (have) return { id: have.id, via: reg.source(have.id) + " (by QID through the " + via + ")", d };
    const k = forceKind || kindOf(cache, item.classes || []);
    if (!k) return { unresolved: "the item " + qid + " (" + (item.label || item.title || name) + ") has no class the taxonomy maps: " + classNames(cache, item.classes || []), qid };
    if (k.kind === "polity") return { unresolved: "the item " + qid + " (" + (item.label || name) + ") is a state, not a place row — link it through polity-spec.json (" + classNames(cache, item.classes) + ")", qid };
    if (k.kind === "people") return { unresolved: "the item " + qid + " (" + (item.label || name) + ") is a people or a culture (Phase 2c), not a place row (" + classNames(cache, item.classes) + ")", qid };
    return { id: "pl:q" + qid.slice(1), via, d, item: { qid, kind: k.kind, sub: k.sub, forced: !!forceKind, coord: item.coord, label: item.label || "", title: item.title || (cache.titles[name] && cache.titles[name].qid === qid ? name : ""), classes: item.classes || [] } };
  }
  /* PHASE 2c, TASK 0b (owner's decision, 2026-10-12, not to be reopened): a glossary POINT term that the 25 km rule could not place
     (the term names an area — Alaska, Great Britain, Lake Turkana, the Sahara, Siberia — and Wikipedia's primary coordinate is a
     centre that can lie 100 km from the item's own) is matched to a Wikidata item by EXACT English label or alias (the cache's
     `labels`, which the service answers for rdfs:label and skos:altLabel alike, and the enwiki article of that exact title), AT ANY
     DISTANCE, provided the item's kind fits an area of that name: a country subdivision (admin1), an island, a lake, a region (a
     desert, a plateau …). Exactly one fitting item resolves; several, or none, do not (never a guess). The distance from the
     glossary's point is returned so the report can print it for a human to check. */
  /* a kind FITS an area when the item's OWN classes (not those reached by subclass-of, which let a constituency, a street or a townland
     through as "a region") name one: a country subdivision, an island, a lake, a desert or a geographic / historical / natural region */
  const FIT_ADMIN1 = new Set(["Q35657", "Q10864048", "Q107390", "Q1221156", "Q36784", "Q1352230", "Q15304003"]);   // US state, first-level division, federated state, state of Germany, region of France, US territory, state of Australia
  const FIT_ISLAND = new Set(["Q23442", "Q207524"]);                                                              // island, atoll
  const FIT_REGION = new Set(["Q82794", "Q8514", "Q1620908", "Q1970725"]);                                         // geographic region, desert, historical region, natural region
  const fitKind = (classes) => {
    const k = kindOf(cache, classes); if (!k) return null;
    if (k.kind === "lake") return k;
    if (classes.some((c) => FIT_ISLAND.has(c)) && k.kind === "island") return k;
    if (classes.some((c) => FIT_ADMIN1.has(c))) return { kind: "admin1", sub: "" };
    if (classes.some((c) => FIT_REGION.has(c)) && k.kind === "region") return k;
    return null;
  };
  function resolveAnywhere(t) {
    const cands = [];
    const add = (it, how) => { if (it && it.qid) { const have = cands.find((c) => c.it.qid === it.qid); if (have) have.hows.add(how); else cands.push({ it, hows: new Set([how]) }); } };
    const hit = cache.titles[t.name]; if (hit && !hit.classes.includes(DISAMBIG)) add(hit, "article");
    for (const it of (cache.labels || {})[t.name] || []) if (!it.classes.includes(DISAMBIG) && it.coord) add(it, "label or alias");
    const fit = [];
    for (const c of cands) {
      if (!c.it.coord || notAPlace(c.it.classes)) continue;
      const k = fitKind(c.it.classes || []); if (!k) continue;
      fit.push({ qid: c.it.qid, k, it: c.it, d: t.at ? km(c.it.coord, t.at) : null, how: [...c.hows].sort().join(" + ") });
    }
    if (!fit.length) return { unresolved: "no Wikidata item bears the exact label or alias " + JSON.stringify(t.name) + " with a kind that fits an area (a country subdivision, an island, a lake, a desert or a region)" + (cands.length ? "; " + cands.length + " item(s) carry the name, none of a fitting kind" : "") };
    /* several fitting items: the glossary slug IS a Wikipedia title (the points were fetched from that article), so the item whose
       English Wikipedia article bears exactly that title is the term's own; printed, so a human can overrule it */
    let pick = fit.length === 1 ? fit[0] : null, tie = "";
    if (!pick) { const art = fit.filter((f) => f.how.includes("article")); if (art.length === 1) { pick = art[0]; tie = "; the other fitting item(s) of that name (" + fit.filter((f) => f !== pick).map((f) => f.qid + " " + (f.it.label || f.it.title)).join(", ") + ") lose to the item whose English Wikipedia article is exactly \"" + t.name + "\""; } }
    if (!pick) return { ambiguous: fit.map((f) => f.qid + " " + (f.it.label || f.it.title) + " (" + f.k.kind + ", " + Math.round(f.d) + " km)"), why: "several items of a fitting kind bear the name" };
    const out = accept(pick.qid, pick.it, t.name, pick.d, "label or alias, at any distance (Phase 2c, Task 0b)", pick.k);
    if (out.id) out.anywhere = { qid: pick.qid, label: pick.it.label || pick.it.title || t.name, kind: pick.k.kind, km: Math.round(pick.d * 10) / 10, how: pick.how + tie };
    return out;
  }
  return { resolve, resolveAnywhere, byQid };
}
const AROUND_MAX_KM = 50;   // a search around a coordinate is capped here: a 300 km circle over central Europe holds tens of thousands of items and the service answers 504 (measured 2026-10-10); a region whose item lies further than 50 km from the card's own anchor is reported, not guessed
const aroundKey = (t) => t.at[0].toFixed(3) + "," + t.at[1].toFixed(3) + "," + Math.min(radiusOf(t.kind), AROUND_MAX_KM);

/* ---------- the same site under two names, across toponyms (3b, decision 1) ---------- */
/* `results` — every resolution object of the run (a toponym's, a glossary place's), mutated in place: one that resolved to a
   settlement row the migration owns, within CROSS_SITE_KM of a better settlement row, is re-pointed at that row. "Better" is a
   strict order — the gazetteer's own row, then a places.js row that is not an ancient city or polis, then one that is, then the
   lower Wikidata number — so no cycle can form and two runs agree. Returns { into: Map loser → keeper, aliases: Map keeper →
   [names], list: [...], near: [...] } (`near` — period settlements 2–25 km from a settlement, NOT merged, for the owner). */
function crossMerge(results, reg, oldRows, manual, links) {
  const classesOf = (id, item) => (item && item.classes) || ((oldRows[id] && oldRows[id].evidence && oldRows[id].evidence.classes) || []);
  const fresh = new Map(), freshR = new Map(); for (const r of results) if (r.id && r.item && !fresh.has(r.id)) { fresh.set(r.id, r.item); freshR.set(r.id, { item: r.item, via: r.via, d: r.d }); }
  const owned = (id) => /^pl:q\d+$/.test(id) && !(oldRows[id] && oldRows[id].manual);
  const describe = (id) => {
    const it = fresh.get(id), row = reg.rows.get(id);
    if (!it && !row) return null;
    const at = it ? it.coord : row.at, kind = it ? it.kind : row.kind, sub = it ? it.sub : (row.sub || "");
    const cls = classesOf(id, it);
    const src = id.startsWith("pl:") ? "places" : "gazetteer";
    const settle = /^(capital|city|town)$/.test(kind) || cls.some((c) => SETTLE_CLASSES.includes(c));
    const modernClass = cls.some((c) => MODERN_CITY_CLASSES.includes(c));
    const period = cls.some((c) => PERIOD_CLASSES.includes(c)) && !modernClass && !cls.some((c) => ["Q532", "Q486972", "Q15284"].includes(c));
    // a modern city: the gazetteer's own city, capital or town, or a places row that is a city, a town or a capital by its class
    // (a village, a frazione, a necropolis, a neighbourhood is not one — it never takes a period name in)
    const modern = src === "gazetteer" ? /^(capital|city|town)$/.test(kind) : modernClass;
    const tier = src === "gazetteer" ? 0 : period ? 2 : 1;
    const qid = (it && it.qid) || (row && row.qid) || (/^pl:q\d+$/.test(id) ? "Q" + id.slice(4) : "");
    return { id, qid, name: it ? (it.title || it.label || id) : row.name, at, kind, sub, settle: settle && familyOf(kind, sub) === "settlement" && !!at, period, modern, tier, num: Number(id.replace(/\D/g, "")) || 0, owned: owned(id) };
  };
  const better = (b, a) => b.tier !== a.tier ? b.tier < a.tier : b.num !== a.num ? b.num < a.num : b.id < a.id;
  /* PHASE 3c, DECISION 2 — a period settlement 2-25 km from a modern city folds ONLY where Wikidata itself links the two items:
     P1366 "replaced by" or P1365 "replaces" in either direction, P460 "said to be the same as" (the owner wrote P1705, which is
     "native label" and links nothing), or both items sharing one English Wikipedia article. Never on distance alone. The facts are
     the cache's `links` (fetched by --fetch from Special:EntityData); a pair whose items are not in it is "not checked", never a guess. */
  /* PHASE 2c, TASK 0a (owner's decision, 2026-10-12, not to be reopened): P460 "said to be the same as" counts as fold evidence,
     together with replaces / replaced by and a shared Wikipedia article, ONLY when the two items are UNDER 25 km apart (SAME_SITE_KM,
     strictly) AND in the same kind family (familyOf: both settlements) — the test is written out here, not left to the pool's
     construction. Nothing else about the folds changes: the 36 settlements without a Wikidata link stay two places each. */
  const linkEvidence = (a, b) => {
    if (!(km(a.at, b.at) < SAME_SITE_KM) || familyOf(a.kind, a.sub) !== familyOf(b.kind, b.sub)) return { state: "none" };
    const la = links && a.qid && links[a.qid], lb = links && b.qid && links[b.qid];
    if (!la || !lb) return { state: "unchecked" };
    for (const [p, what] of [["P1366", "replaced by"], ["P1365", "replaces"], ["P460", "said to be the same as"]]) {
      if ((la[p] || []).includes(b.qid)) return { state: "linked", how: p + " " + what + ": " + a.qid + " " + a.name + " \u2192 " + b.qid + " " + b.name };
      if ((lb[p] || []).includes(a.qid)) return { state: "linked", how: p + " " + what + ": " + b.qid + " " + b.name + " \u2192 " + a.qid + " " + a.name };
    }
    if (la.enwiki && la.enwiki === lb.enwiki) return { state: "linked", how: "the same English Wikipedia article \"" + la.enwiki + "\" (" + a.qid + " and " + b.qid + ")" };
    return { state: "none" };
  };
  const pool = []; const seen = new Set();
  for (const id of reg.rows.keys()) { if (id.startsWith("pol:")) continue; const d = describe(id); if (d && d.settle) { pool.push(d); seen.add(id); } }
  for (const id of fresh.keys()) if (!seen.has(id)) { const d = describe(id); if (d && d.settle) pool.push(d); }
  const into = new Map(), list = [], near = [], wanted = new Set();
  for (const [loser, v] of Object.entries(manual || {})) if (v && v.into) into.set(loser, v.into);
  const used = [...new Set(results.filter((r) => r.id).map((r) => r.id))].sort();
  for (const id of used) {
    if (into.has(id) || !owned(id)) continue;
    const a = describe(id); if (!a || !a.settle) continue;
    if (!a.period) continue;   // only a period name (an ancient city, a polis) is folded into another place; a modern town, a neighbourhood, a district stays itself
    let best = null, nearest = null, linked = null, unchecked = 0, checked = 0;
    for (const b of pool) {
      if (b.id === a.id) continue;
      const d = km(a.at, b.at);
      // a modern city within 2 km takes the period name in; another period name of the same ancient city (one site, two Wikidata items)
      // is folded into the better of the two within 1 km — never into a village, a frazione, a necropolis or a neighbourhood
      const fits = (b.modern && d <= CROSS_SITE_KM) || (b.period && better(b, a) && d <= 1);
      if (fits) { if (!best || d < best.d - 1e-9 || (Math.abs(d - best.d) <= 1e-9 && better(b, best.b))) best = { b, d }; }
      else if (b.modern && d > CROSS_SITE_KM && d < SAME_SITE_KM) {
        if (!nearest || d < nearest.d) nearest = { b, d };
        wanted.add(a.qid); wanted.add(b.qid);
        const ev = linkEvidence(a, b);
        if (ev.state === "unchecked") unchecked++; else checked++;
        if (ev.state === "linked" && (!linked || d < linked.d - 1e-9 || (Math.abs(d - linked.d) <= 1e-9 && better(b, linked.b)))) linked = { b, d, ev: ev.how };
      }
    }
    if (!best && linked) best = linked;
    if (best) { into.set(id, best.b.id); list.push(Object.assign({ id, name: a.name, into: best.b.id, intoName: best.b.name, km: Math.round(best.d * 10) / 10 }, best.ev ? { evidence: best.ev } : {})); }
    else if (nearest) near.push({ id, name: a.name, into: nearest.b.id, intoName: nearest.b.name, km: Math.round(nearest.d * 10) / 10, evidence: unchecked ? "could not check: Wikidata's links for " + (unchecked === 1 && !checked ? "this pair" : unchecked + " of " + (unchecked + checked) + " nearby settlements") + " are not in the cache (run migrate-places.js --fetch)" : "no Wikidata link found (P1366, P1365, P460 or a shared English article, against " + checked + " settlement(s) within " + SAME_SITE_KM + " km)" });
  }
  const keeperOf = (id) => { let x = id; const guard = new Set(); while (into.has(x) && !guard.has(x)) { guard.add(x); x = into.get(x); } return x; };
  const final = new Map(); for (const id of into.keys()) final.set(id, keeperOf(id));
  const aliases = new Map(), folded = new Map();   // keeper → names; the folded set stops a name entering twice
  const addAlias = (k, n) => { if (!n) return; let l = aliases.get(k), f = folded.get(k); if (!l) { aliases.set(k, l = []); folded.set(k, f = new Set()); } if (!f.has(fold(n))) { f.add(fold(n)); l.push(n); } };
  for (const r of results) {
    if (!r.id || !final.has(r.id)) continue;
    const loser = r.id, keeper = final.get(loser), d = describe(loser);
    r.mergedFrom = { id: loser, name: d ? d.name : loser };
    addAlias(keeper, d ? d.name : ""); if (r.item) { addAlias(keeper, r.item.title); addAlias(keeper, r.item.label); }
    for (const m of r.merged || []) { addAlias(keeper, m.name); addAlias(keeper, m.label); addAlias(keeper, m.title); }
    const kr = freshR.get(keeper);
    r.id = keeper; r.item = kr ? kr.item : undefined; if (!r.item) delete r.item;
    r.via = kr ? kr.via : (keeper.startsWith("pl:") ? "places" : "gazetteer") + " (same site as " + r.mergedFrom.name + ")";
    if (kr) r.d = kr.d;
  }
  return { into: final, aliases, list, near, fresh, wanted: [...wanted].filter(Boolean).sort() };
}

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
  const mergedQ = new Map();   // an item folded into another place by an earlier run → that place (3b)
  for (const [id, row] of Object.entries(spec.rows || {})) for (const m of row.merged || []) mergedQ.set(m.qid, id);
  for (const [id, o] of Object.entries(spec.overlay || {})) for (const m of o.merged || []) mergedQ.set(m.qid, id);
  for (const [loser, v] of Object.entries(spec.merges || {})) if (v && v.into && /^pl:q\d+$/.test(loser)) mergedQ.set("Q" + loser.slice(4), v.into);
  const resolver = makeResolver(reg, cache, mergedQ);
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
    fetchClasses(cache, [...new Set(Object.values(cache.around).flatMap((v) => (Array.isArray(v) ? v : v.items)).flatMap((h) => h.classes))]);
  }
  /* resolve every toponym */
  const res = new Map(); for (const [k, t] of topo) res.set(k, resolver.resolve(t));
  const glossRes = gloss.map((g) => {
    const t = { name: g.name, label: "", kind: "point", at: g.at, cards: [] };
    let r = resolver.resolve(t);
    if (!r.id && !(r.ambiguous && r.ambiguous.length)) { const w = resolver.resolveAnywhere(t); r = w.id || w.ambiguous ? w : Object.assign(r, { unresolvedAnywhere: w.unresolved }); }   // 2c, task 0b
    return { g, r };
  });
  /* 3b, decision 1: the same site under two names (Byzantium and Constantinople) is one place */
  if (FETCH) {   // 3c, decision 2: ask Wikidata whether it links each period settlement to the modern city 2-25 km away
    const probe = crossMerge([...res.values(), ...glossRes.map((g) => g.r)].map((r) => Object.assign({}, r)), reg, spec.rows || {}, spec.merges || {}, cache.links);
    log(`fetch: ${probe.wanted.length} items to read for the period-settlement pairs 2-${SAME_SITE_KM} km apart`);
    fetchLinks(cache, probe.wanted);
  }
  const X = crossMerge([...res.values(), ...glossRes.map((g) => g.r)], reg, spec.rows || {}, spec.merges || {}, cache.links);
  const pushAlias = (keeper, n) => { if (!n) return; let l = X.aliases.get(keeper); if (!l) X.aliases.set(keeper, l = []); if (!l.some((a) => fold(a) === fold(n))) l.push(n); };
  for (const [k, t] of topo) { const r = res.get(k); if (r.mergedFrom) { pushAlias(r.id, t.name); pushAlias(r.id, t.label); } else if (r.id && (r.merged || []).some((m) => m.how === "island-polis")) { pushAlias(r.id, t.name); pushAlias(r.id, t.label); } }   // 3c: the toponym names the island, so the island answers to it
  for (const g of glossRes) if (g.r.mergedFrom) pushAlias(g.r.id, g.g.name);
  // every place a toponym's candidates folded into the one it resolved to (same-site candidates of ONE toponym), as names and as items
  const foldedItems = new Map();   // keeper → [{ qid, name }]
  const noteMerged = (keeper, m) => { let l = foldedItems.get(keeper); if (!l) foldedItems.set(keeper, l = []); if (m.qid && !l.some((x) => x.qid === m.qid)) l.push(Object.assign({ qid: m.qid, name: m.name || "" }, m.how ? { how: m.how } : {}, m.km != null ? { km: m.km } : {}, m.evidence ? { evidence: m.evidence } : {})); };
  for (const r of [...res.values(), ...glossRes.map((g) => g.r)]) {
    if (!r.id) continue;
    for (const m of r.merged || []) { if (m.qid) { noteMerged(r.id, Object.assign({}, m, { how: m.how || "toponym" })); pushAlias(r.id, m.name); pushAlias(r.id, m.label); pushAlias(r.id, m.title); } }
  }
  for (const [loser, keeper] of X.into) if (/^pl:q\d+$/.test(loser)) { const m = X.list.find((x) => x.id === loser); noteMerged(keeper, Object.assign({ qid: "Q" + loser.slice(4), name: (X.fresh.get(loser) && (X.fresh.get(loser).title || X.fresh.get(loser).label)) || (reg.rows.get(loser) || {}).name || "", how: m && m.evidence ? "wikidata" : "site", km: m ? m.km : null }, m && m.evidence ? { evidence: m.evidence } : {})); }
  const mapId = (id) => X.into.get(id) || (/^pl:q\d+$/.test(id) && mergedQ.get("Q" + id.slice(4))) || id;   // a place folded into another, by this run or an earlier one
  /* the rows the cards need that the registry lacks → the spec */
  const newRows = {};
  const topoById = new Map();
  for (const [k, t] of topo) { const r = res.get(k); if (!r.id) continue; let l = topoById.get(r.id); if (!l) topoById.set(r.id, l = []); l.push(t); if (r.item) { const row = newRows[r.id] || (newRows[r.id] = Object.assign({ name: r.item.title || r.item.label || t.name, kind: r.item.kind, sub: r.item.sub || "", qid: r.item.qid, at: r.item.coord, within: "", aliases: [], wiki: r.item.title || "", by: "migration", evidence: { classes: r.item.classes, via: r.via, km: Math.round((r.d || 0) * 10) / 10 }, cards: 0 }, r.item.forced ? { forced: true } : {})); for (const n of [t.name, t.label]) if (n && fold(n) !== fold(row.name) && !row.aliases.some((a) => fold(a) === fold(n))) row.aliases.push(n); row.cards += t.cards.length; } }
  for (const g of glossRes) if (g.r.item && !newRows[g.r.id] && !reg.rows.has(g.r.id)) newRows[g.r.id] = { name: g.r.item.title || g.r.item.label || g.g.name, kind: g.r.item.kind, sub: g.r.item.sub || "", qid: g.r.item.qid, at: g.r.item.coord, within: "", aliases: fold(g.g.name) === fold(g.r.item.title || g.r.item.label) ? [] : [g.g.name], wiki: g.r.item.title || "", by: "migration (glossary place)", evidence: { classes: g.r.item.classes, via: g.r.via, km: Math.round((g.r.d || 0) * 10) / 10 }, cards: 0 };
  for (const [id, names] of X.aliases) if (newRows[id]) for (const n of names) if (n && fold(n) !== fold(newRows[id].name) && !newRows[id].aliases.some((a) => fold(a) === fold(n))) newRows[id].aliases.push(n);
  for (const [id, l] of foldedItems) if (newRows[id]) newRows[id].merged = l.slice().sort((a, b) => (a.qid < b.qid ? -1 : 1));
  for (const r of [...res.values(), ...glossRes.map((g) => g.r)]) if (r.id && r.aside && r.aside.length && newRows[r.id]) { const have = newRows[r.id].setAside || []; for (const a of r.aside) if (!have.some((x) => x.qid === a.qid)) have.push(a); newRows[r.id].setAside = have.sort((a, b) => (a.qid < b.qid ? -1 : 1)); }
  // the lists around each coordinate are pruned to the items whose label or title is a name a card uses (the only ones the
  // resolver can match), with the count the list had: the fetched lists are 12 MB of items the migration never reads
  const useNames = new Set(); for (const t of topo.values()) for (const n of [t.name, t.label].concat(t.name.includes(",") ? [t.name.split(",")[0].trim()] : [])) if (n) useNames.add(fold(n)); for (const g of gloss) useNames.add(fold(g.name));
  let pruned = 0;
  for (const [k, v] of Object.entries(cache.around)) { if (!Array.isArray(v)) continue; cache.around[k] = { n: v.length, items: v.filter((it) => useNames.has(fold(it.label)) || useNames.has(fold(it.title)) || useNames.has(fold(it.title.replace(/\s*\([^)]*\)\s*$/, "")))) }; pruned++; }
  // every accepted item is recorded under cache.items, so check-places.js can prove each row's coordinate and classes offline
  cache.items = cache.items || {}; let cacheGrew = pruned > 0;
  for (const row of Object.values(newRows)) { const it = row.evidence && row.qid ? { coord: row.at, classes: row.evidence.classes || [], label: "", title: row.wiki || "" } : null; if (it && JSON.stringify(cache.items[row.qid]) !== JSON.stringify(it)) { cache.items[row.qid] = it; cacheGrew = true; } }
  if (cacheGrew && !DRY) saveCache(cache);
  // `within`: a site's city, when the locator says so and the city resolves (the gazetteer's cities, or a new row of this run)
  const withinOf = (t) => { if (!t.within) return ""; const near = []; for (const row of (reg.byName.get(fold(t.within)) || [])) { if (!/^(capital|city|town|site)$/.test(row.kind) || !row.at || !t.at) continue; if (km(row.at, t.at) <= 60) near.push(row); } for (const [id, row] of Object.entries(newRows)) if (fold(row.name) === fold(t.within) && row.at && t.at && km(row.at, t.at) <= 60 && !near.some((r) => r.id === id)) near.push({ id }); return near.length === 1 ? near[0].id : ""; };
  for (const [id, row] of Object.entries(newRows)) { const ts = topoById.get(id) || []; for (const t of ts) { const w = mapId(withinOf(t)); if (w && w !== id) { row.within = w; break; } } }
  const withinOnly = [];   // a locator whose place is unresolved but whose `within` city resolves: the card gets the city, and the report says so
  /* the cards' places */
  const entByKey = new Map(); for (const e of reg.entities) if ((e.kind === "polity" || e.kind === "people" || e.kind === "culture")) entByKey.set(e.key, e);
  const entByName = new Map(); for (const e of reg.entities) if ((e.kind === "polity" || e.kind === "people" || e.kind === "culture")) entByName.set(fold(e.name), e);
  const linkedCards = new Map(); for (const e of reg.entities) if ((e.kind === "polity" || e.kind === "people" || e.kind === "culture")) for (const c of e.cards || []) { let l = linkedCards.get(c); if (!l) linkedCards.set(c, l = new Set()); l.add(e.id); }
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
      else { const t = topo.get(k); const w = t ? mapId(withinOf(t)) : ""; if (w) { ids.add(w); withinOnly.push(c.id + " " + L.name + " → within " + t.within + " (" + w + ")"); bump(p, "byLocator"); } }
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
    for (const e of reg.entities) if ((e.kind === "polity" || e.kind === "people" || e.kind === "culture")) for (const cid of e.cards || []) { const c = byId.get(cid); if (!c) bad(e.id + " links " + cid + ", which is not a card"); else if (!(c.places || []).includes(e.id)) bad(e.id + " links " + cid + " but the card's places lack it"); }
    for (const c of cards) for (const id of c.places || []) if (id.startsWith("pol:") && !(reg.cardsOf(id) || []).includes(c.id)) { /* a card may point at a polity the spec does not link (an author's addition): allowed, reported */ }
    { const rest = crossMerge([...new Set(cards.flatMap((c) => c.places || []))].filter((id) => !id.startsWith("pol:")).map((id) => ({ id })), reg, spec.rows || {}, spec.merges || {}, cache.links); for (const m of rest.list) bad("two places of one site: " + m.id + " " + m.name + " lies " + m.km + " km from " + m.into + " " + m.intoName + " (run node .claude/migrate-places.js, which folds it in)"); }
    const B = require("./atlas-build/build-places.js"); const r = B.build({ check: true, log: () => {} }); if (!r.ok) bad("places-spec.json and atlas/data/places.js are not in step: " + r.why + " (run node .claude/atlas-build/build-places.js --install)");
    { const G = require("./atlas-build/build-glossary-places.js").build({ check: true, log: () => {} }); if (!G.ok) bad("atlas/data/glossary-places.js is not in step: " + G.why + " (run node .claude/atlas-build/build-glossary-places.js --install)"); }
    { const C = require("./atlas-build/build-card-places.js").build({ cards, check: true, log: () => {} }); if (!C.ok) bad("atlas/data/card-places.js is not in step with the cards: " + C.why + " (run node .claude/atlas-build/build-card-places.js --install)"); }
    log(fails ? `\n${fails} failed\n` : "\nmigrate-places --check: every place id resolves, every derived id is on its card, every polity's cards carry it, the spec is in step\n");
    process.exit(fails ? 1 : 0);
  }
  /* write: the spec, the cards, the report */
  const resolvedTopo = [...res.values()].filter((r) => r.id).length, ambiguousTopo = [...res.entries()].filter(([, r]) => r.ambiguous), unresolvedTopo = [...res.entries()].filter(([, r]) => r.unresolved);
  if (!DRY) {
    const rows = Object.assign({}, spec.rows || {});
    for (const [id, row] of Object.entries(newRows)) { const old = rows[id]; if (old && old.manual) continue; rows[id] = Object.assign({}, old || {}, row); }
    // a migration row no toponym resolves to any more is dropped (a manual row is kept). A row of an earlier run that a toponym
    // now resolves to THROUGH THE REGISTRY (step 1, `via: places`) is still needed — without this the second run dropped every
    // row the first had written and the file oscillated (measured 2026-10-11: idempotence is this line)
    const needed = new Set([...topoById.keys()].concat(glossRes.filter((g) => g.r.id).map((g) => g.r.id)));
    for (const id of Object.keys(rows)) if (!rows[id].manual && !newRows[id] && !needed.has(id)) delete rows[id];
    /* 3b, decision 2 and the polis rule: a row's kind is what its classes give, recomputed every run — a row written by 3a from
       the first-match rule (an island that is also a tourist destination was a `site`) is corrected, and the old kind is kept as
       `kindWas` so the report can say so. A row whose kind was forced (a settlement-scale district or port, a town) or entered by hand
       is left alone. */
    for (const [id, row] of Object.entries(rows)) {
      if (row.manual || row.forced || !row.evidence || !row.evidence.classes || !row.evidence.classes.length) continue;
      const k = kindOf(cache, row.evidence.classes);
      if (!k || k.kind === "polity" || k.kind === "people" || k.kind === "culture" || !R.PLACE_KINDS.includes(k.kind)) continue;
      if (k.kind === "region" && /^(town|city|site)$/.test(row.kind)) continue;   // never degrade a settlement to a generic region
      if (k.kind !== row.kind || (k.sub || "") !== (row.sub || "")) { if (k.kind === "hill" && row.kind === "mountain") { if (!row.kindWas3c) row.kindWas3c = "mountain"; } else if (!row.kindWas) row.kindWas = row.kind + (row.sub ? "/" + row.sub : ""); row.kind = k.kind; row.sub = k.sub || ""; }
    }
    // 3b: the names and items folded into a place. An owned row carries them itself; a gazetteer row (never edited) carries them
    // as an OVERLAY in the spec, which build-places.js writes into places.js and the registry reads back as aliases.
    const unionNames = (have, add) => { const l = (have || []).slice(); for (const n of add || []) if (n && !l.some((a) => fold(a) === fold(n))) l.push(n); return l.slice(0, 12); };
    const unionItems = (have, add) => { const l = (have || []).slice(); for (const m of add || []) if (m.qid && !l.some((x) => x.qid === m.qid)) l.push(Object.assign({ qid: m.qid, name: m.name || "" }, m.how ? { how: m.how } : {}, m.km != null ? { km: m.km } : {}, m.evidence ? { evidence: m.evidence } : {})); return l.sort((a, b) => (a.qid < b.qid ? -1 : 1)); };
    const overlay = {};
    for (const [id, o] of Object.entries(spec.overlay || {})) if (needed.has(id)) overlay[id] = o;
    for (const [id, names] of X.aliases) {
      const row = rows[id];
      if (row) { row.aliases = unionNames(row.aliases, names.filter((n) => fold(n) !== fold(row.name))); if (foldedItems.get(id)) row.merged = unionItems(row.merged, foldedItems.get(id)); }
      else { const o = overlay[id] || (overlay[id] = { aliases: [], merged: [] }); o.aliases = unionNames(o.aliases, names.filter((n) => fold(n) !== fold(((reg.rows.get(id) || {}).name) || ""))); o.merged = unionItems(o.merged, foldedItems.get(id)); }
    }
    for (const id of Object.keys(rows)) if (rows[id].within) rows[id].within = mapId(rows[id].within);
    const out = { _about: "The places the cards need that the v0 gazetteer does not carry (Atlas v2 Phase 3a; docs/atlas-v2-design.md §2.8). GENERATED rows (`by: migration`) are written by .claude/migrate-places.js from the cards' own locators, each a Wikidata item whose coordinate lies within the card's radius and whose class maps to a kind of the taxonomy (`evidence`); MANUAL rows (`manual: true`, with a `reason`) are added by .claude/atlas-build/add-place.js and never overwritten. `node .claude/atlas-build/build-places.js --install` writes atlas/data/places.js from this file. Never edit a coordinate by hand.", rows: Object.fromEntries(Object.entries(rows).sort(([a], [b]) => (a < b ? -1 : 1))), overlay: Object.fromEntries(Object.entries(overlay).filter(([, o]) => (o.aliases || []).length || (o.merged || []).length).sort(([a], [b]) => (a < b ? -1 : 1))), merges: spec.merges || {}, glossary: Object.fromEntries(glossRes.filter((g) => g.r.id).map((g) => [g.g.slug, mapId(g.r.id)]).sort(([a], [b]) => (a < b ? -1 : 1))) };
    fs.writeFileSync(SPEC_FILE, JSON.stringify(out, null, 1) + "\n");
    const B = require("./atlas-build/build-places.js"); B.build({ install: true, log: VERBOSE ? log : () => {} });
    require("./atlas-build/build-glossary-places.js").build({ install: true, log: VERBOSE ? log : () => {} });   // 3c: the glossary's "show on the Atlas" table follows the registry
    // the cards: additive — the derived ids are added to what a card already carries (an author's additions stay); unchanged cards stay byte-identical
    const reg2 = R.loadRegistry(); let changed = 0;
    for (const c of cards) { const d = derived.get(c.id); const have = Array.isArray(c.places) ? c.places.map(mapId).filter((id) => reg2.rows.has(id)) : []; const next = [...new Set(have.concat(d ? [...d].filter((id) => reg2.rows.has(id)) : []))].sort(); if (!next.length) { if (c.places !== undefined) { delete c.places; changed++; } continue; } if (JSON.stringify(next) !== JSON.stringify(c.places)) { c.places = next; changed++; } }
    writeCards(cards, tree);
    require("./atlas-build/build-card-places.js").build({ cards, install: true, log: VERBOSE ? log : () => {} });   // the light index follows the cards (3b, decision 4)
    log(`wrote places on ${changed} cards (${derived.size} carry a derived place); spec ${Object.keys(out.rows).length} rows (${Object.keys(newRows).length} from this migration)`);
  }
  /* the report */
  const lines = [];
  const fmtY = (y) => y;
  lines.push("# Atlas v2 — the places migration report (Phases 3a, 3b and 3c)", "", "GENERATED by `node .claude/migrate-places.js` on " + new Date().toISOString().slice(0, 10) + " — never edit by hand; re-run the script. What it is: every card's `locator`, `war` and `map` resolved against the places registry (the gazetteer, `atlas/data/places.js`, the polity entity table) into the heavy field `places`; the old fields are untouched (v1 reads them until Phase 5). An unresolved or ambiguous toponym below is a decision for the owner, not a guess the script made. 📖 `docs/atlas-v2-design.md` §2.8 and §7 \"Phase 3a — as built\".", "");
  lines.push("## Counts per collection", "", "| collection | cards | with an old field | with `places` | by locator | by map | by war | by polity link | old field but no place |", "|---|---|---|---|---|---|---|---|---|");
  for (const [p, o] of Object.entries(per).sort()) lines.push(`| \`${p}\` | ${o.cards} | ${o.old} | ${o.placed} | ${o.byLocator} | ${o.byMap} | ${o.byWar} | ${o.byLink} | ${o.noneOld.length} |`);
  const tot = Object.values(per).reduce((s, o) => { for (const k of ["cards", "old", "placed", "byLocator", "byMap", "byWar", "byLink"]) s[k] = (s[k] || 0) + o[k]; s.noneOld = (s.noneOld || 0) + o.noneOld.length; return s; }, {});
  lines.push(`| **all** | ${tot.cards} | ${tot.old} | ${tot.placed} | ${tot.byLocator} | ${tot.byMap} | ${tot.byWar} | ${tot.byLink} | ${tot.noneOld} |`, "");
  const specRows = (DRY ? spec.rows : JSON.parse(fs.readFileSync(SPEC_FILE, "utf8")).rows) || {};
  const viaOf = (r) => (r.item ? r.via : (specRows[r.id] && specRows[r.id].evidence && specRows[r.id].evidence.via) || "");   // how a places.js row was found, whether this run or an earlier one wrote it
  const nVia = (v) => [...res.values()].filter((r) => r.id && r.id.startsWith("pl:") && viaOf(r) === v).length;
  lines.push(`Locator toponyms: ${topo.size} distinct (name + coordinate) over ${[...topo.values()].reduce((s, t) => s + t.cards.length, 0)} locators — ${resolvedTopo} resolved (${[...res.values()].filter((r) => r.id && /gazetteer/.test(r.via)).length} to the gazetteer; ${[...res.values()].filter((r) => r.id && r.id.startsWith("pl:")).length} to places.js rows, each a Wikidata item checked against the card's coordinate: ${nVia("title")} found by article title, ${nVia("label")} by exact label, ${nVia("around")} by a search around the coordinate, ${nVia("add-place")} added by hand), ${ambiguousTopo.length} ambiguous, ${unresolvedTopo.length} unresolved. ${withinOnly.length} locators resolve only through their \`within\` city (listed below). Wikidata cache: ${Object.keys(cache.titles).length} titles, ${Object.keys(cache.labels || {}).length} labels, ${Object.keys(cache.around).length} searches, ${Object.keys(cache.classes).length} classes (retrieved ${cache.retrieved || "never"}).`, "");
  lines.push("## Unresolved toponyms (locators)", "", unresolvedTopo.length ? "| toponym | kind | coordinate | cards | why |" : "None.", ...(unresolvedTopo.length ? ["|---|---|---|---|---|"] : []));
  for (const [k, r] of unresolvedTopo.sort((a, b) => topo.get(b[0]).cards.length - topo.get(a[0]).cards.length || (a[0] < b[0] ? -1 : 1))) { const t = topo.get(k); lines.push(`| ${t.name}${t.label ? " (" + t.label + ")" : ""}${t.within ? ", within " + t.within : ""} | ${t.kind} | ${t.at ? t.at.join(", ") : "—"} | ${t.cards.slice(0, 6).join(", ")}${t.cards.length > 6 ? " +" + (t.cards.length - 6) : ""} | ${r.unresolved} |`); }
  lines.push("", "## Ambiguous matches (listed, none chosen)", "", "A toponym is ambiguous only when its candidates are of different kinds or lie more than " + SAME_SITE_KM + " km apart (the owner's decision 1, 2026-10-11); candidates of one kind family within " + SAME_SITE_KM + " km are one site and merge (next section).", "", ambiguousTopo.length ? "| toponym | kind | cards | why | candidates |" : "None.", ...(ambiguousTopo.length ? ["|---|---|---|---|---|"] : []));
  for (const [k, r] of ambiguousTopo) { const t = topo.get(k); lines.push(`| ${t.name} | ${t.kind} | ${t.cards.slice(0, 6).join(", ")}${t.cards.length > 6 ? " +" + (t.cards.length - 6) : ""} | ${r.why || ""} | ${r.ambiguous.join("; ")} |`); }
  /* the places that absorbed a same-site item or a period name: read from what the spec PERSISTS (rows and overlay), so a run that
     resolves the same toponyms through the registry — the second run — writes the same report as the first */
  const absorbed = new Map();
  const specNow = DRY ? spec : JSON.parse(fs.readFileSync(SPEC_FILE, "utf8"));
  for (const [id, row] of Object.entries(specNow.rows || {})) if ((row.merged || []).length) absorbed.set(id, { name: row.name, items: row.merged });
  for (const [id, o] of Object.entries(specNow.overlay || {})) if ((o.merged || []).length) absorbed.set(id, { name: (reg.rows.get(id) || {}).name || id, items: o.merged });
  if (DRY) for (const [id, l] of foldedItems) { const have = absorbed.get(id) || { name: (reg.rows.get(id) || newRows[id] || {}).name || id, items: [] }; for (const m of l) if (!have.items.some((x) => x.qid === m.qid)) have.items = have.items.concat([m]); absorbed.set(id, have); }
  lines.push("", "## Same-site items and period names folded into one place (decision 1)", "", absorbed.size ? "One place per physical site. Two ways, both from the owner's decision 1: **toponym** — several Wikidata items within " + SAME_SITE_KM + " km of one another and of one kind family answered one toponym, and the nearest to the card's own coordinate is the place (a tie within a kilometre goes to the item whose title is the toponym, then the gazetteer's own row, then the lowest Wikidata number); **site** — a period name (an ancient city, a polis) this migration owns lay within " + CROSS_SITE_KM + " km of a modern city (or within 1 km of another period name of the same city) and was folded into it. The absorbed names are the place's aliases; the gazetteer is never edited (its aliases are the overlay in places-spec.json, `alias` in places.js)." : "None.", ...(absorbed.size ? ["", "| the place | absorbed |", "|---|---|"] : []));
  for (const [id, a] of [...absorbed].sort((x, y) => (x[1].name < y[1].name ? -1 : x[1].name > y[1].name ? 1 : x[0] < y[0] ? -1 : 1))) lines.push(`| ${id} ${a.name} | ${a.items.map((m) => m.qid + " " + m.name + (m.how === "site" ? " (site" + (m.km != null ? ", " + m.km + " km" : "") + ")" : m.how === "wikidata" ? " (Wikidata link" + (m.km != null ? ", " + m.km + " km" : "") + ")" : m.how === "island-polis" ? " (island and polis)" : m.how === "toponym" ? " (toponym)" : "")).join("; ")} |`);
  { const fixed = Object.entries(specNow.rows || {}).filter(([, r]) => r.kindWas && !r.manual);
    lines.push("", "## Kinds corrected by the 3b class rules", "", fixed.length ? "A row's kind is what its classes give (a natural feature named directly by a class — an island, a mountain, a cape, a river, a lake — decides before anything reached by subclass-of; a polis is read last, so an island that is also a polis stays an island). 3a read the first row of the table that any class reached, so these rows had another kind:" : "None.", ...(fixed.length ? ["", "| the place | kind in 3a | kind now |", "|---|---|---|"] : []));
    for (const [id, r] of fixed.sort(([a], [b]) => (a < b ? -1 : 1))) lines.push(`| ${id} ${r.name} | ${r.kindWas} | ${r.kind}${r.sub ? "/" + r.sub : ""} |`); }
  /* 3c, decision 1: an island and the polis of the same name; read from what the spec persists, so a second run writes the same text */
  const ipRows = Object.entries(specNow.rows || {}).filter(([, r]) => ((r.merged || []).some((m) => m.how === "island-polis") || (r.setAside || []).length) && !r.manual);
  lines.push("", "## An island and the polis of the same name, one place (3c, decision 1)", "", ipRows.length ? "Candidates of one toponym that are islands and settlements only, within " + SAME_SITE_KM + " km, where the settlement side is a polis or an ancient city (a separate item, or the island's own item carrying the polis class), are ONE site: the island row survives (the toponym names the island) and the polis is its alias and a `merged` item. A modern settlement that carries the toponym only as an alias is set aside (named below), not folded. A palace or a battlefield and the town beside it (Versailles, Waterloo) are NOT this case and stay in the ambiguous list." : "None.", ...(ipRows.length ? ["", "| the place (island) | the polis folded in | a settlement set aside (alias only) |", "|---|---|---|"] : []));
  for (const [id, r] of ipRows.sort(([a], [b]) => (a < b ? -1 : 1))) lines.push(`| ${id} ${r.name} | ${(r.merged || []).filter((m) => m.how === "island-polis").map((m) => m.qid + " " + m.name).join("; ") || (((r.evidence && r.evidence.classes) || []).includes(Q_POLIS) ? "— (the island's own item is also a polis)" : "—")} | ${(r.setAside || []).map((m) => m.qid + " " + m.name).join("; ") || "—"} |`);
  /* 3c, decision 2: Wikidata-linked pairs folded, and every pair left alone, each with its evidence */
  const wdFolded = [];
  for (const [id, row] of Object.entries(specNow.rows || {})) for (const m of row.merged || []) if (m.how === "wikidata") wdFolded.push({ into: id, intoName: row.name, m });
  for (const [id, o] of Object.entries(specNow.overlay || {})) for (const m of o.merged || []) if (m.how === "wikidata") wdFolded.push({ into: id, intoName: (reg.rows.get(id) || {}).name || id, m });
  if (DRY) for (const m of X.list) if (m.evidence && !wdFolded.some((w) => w.m.qid === "Q" + m.id.slice(4))) wdFolded.push({ into: m.into, intoName: m.intoName, m: { qid: "Q" + m.id.slice(4), name: m.name, km: m.km, evidence: m.evidence } });
  lines.push("", "## Period settlements folded into a modern city because Wikidata links them (3c, decision 2)", "", wdFolded.length ? "A period settlement 2–" + SAME_SITE_KM + " km from a modern city folds only where Wikidata itself links the two items — P1366 replaced by, P1365 replaces, P460 said to be the same as, or one shared English Wikipedia article (the cache's `links`, fetched from Special:EntityData). **P460 counts only when the two items are under " + SAME_SITE_KM + " km apart and in the same kind family (both settlements)** — the owner's decision of 2026-10-12 (Phase 2c, Task 0a); the evidence is the same for P1366, P1365 and a shared article. Never on distance alone. The period name becomes the city's alias." : "None: no Wikidata link was found for any pair (or the links are not in the cache — see the next section).", ...(wdFolded.length ? ["", "| the period settlement | folded into | km | the evidence |", "|---|---|---|---|"] : []));
  for (const w of wdFolded.sort((x, y) => (x.m.qid < y.m.qid ? -1 : 1))) lines.push(`| ${w.m.qid} ${w.m.name} | ${w.into} ${w.intoName} | ${w.m.km != null ? w.m.km : "—"} | ${w.m.evidence || ""} |`);
  lines.push("", "## Period settlements 2–25 km from another settlement, NOT merged (for the owner)", "", X.near.length ? "Too far apart to be the same site on coordinates alone, and Wikidata does not link them (the evidence column says what was checked). Each pair is the owner's to decide — add `\"<id>\": { \"into\": \"<id>\", \"reason\": \"…\" }` under `merges` in places-spec.json and re-run. (Knossos and Heraklion are 4 km apart and are different places.)" : "None.", ...(X.near.length ? ["", "| the period settlement | the nearest settlement | km | Wikidata evidence |", "|---|---|---|---|"] : []));
  for (const m of X.near.sort((a, b) => a.km - b.km || (a.id < b.id ? -1 : 1))) lines.push(`| ${m.id} ${m.name} | ${m.into} ${m.intoName} | ${m.km} | ${m.evidence} |`);
  /* 3c, decision 3: hills */
  const hills = Object.entries(specNow.rows || {}).filter(([, r]) => r.kind === "hill");
  lines.push("", "## Hills — a kind of their own (3c, decision 3)", "", hills.length ? "Wikidata's hill (Q54050 and its subclasses) is the kind `hill`, no longer `mountain`. A natural feature named directly by a class decides before subclass-of; an item Wikidata classes as BOTH a mountain and a hill is the mountain (the mountain rule is read first), so \"Mount X\" that is a mountain stays one. Rows of this kind, and the kind each had before:" : "None.", ...(hills.length ? ["", "| the place | kind before 3c | classes |", "|---|---|---|"] : []));
  for (const [id, r] of hills.sort(([a], [b]) => (a < b ? -1 : 1))) lines.push(`| ${id} ${r.name} | ${r.kindWas3c || "hill"} | ${((r.evidence && r.evidence.classes) || []).map((c) => c + (cache.classes[c] && cache.classes[c].label ? " (" + cache.classes[c].label + ")" : "")).join(", ")} |`);
  lines.push("", "## Locators resolved only through their `within` city", "", withinOnly.length ? withinOnly.map((x) => "- " + x).join("\n") : "None.");
  lines.push("", "## War sides that resolve to nothing", "", unresolvedWar.size ? "| side | cards |" : "None.", ...(unresolvedWar.size ? ["|---|---|"] : []));
  for (const [k, l] of [...unresolvedWar].sort()) lines.push(`| ${k} | ${l.join(", ")} |`);
  lines.push("", "## Map keys that resolve to nothing", "", unresolvedMap.size ? "| layer:key | why |" : "None.", ...(unresolvedMap.size ? ["|---|---|"] : []));
  for (const [k, why] of [...unresolvedMap].sort()) lines.push(`| ${k} | ${why} |`);
  lines.push("", "## polity-spec.json links to series the history file does not carry", "", unresolvedLinks.size ? [...unresolvedLinks].sort().map((s) => "- `" + s + "` (deferred or a people: docs/atlas-v2-coverage.md)").join("\n") : "None.");
  lines.push("", "## Cards with an old field but no place at all", "", noPlaceOld.length ? noPlaceOld.join(", ") : "None.");
  const odd = [...topo.values()].filter((t) => t.oddLabel);
  lines.push("", "## Locators whose `label` is not a string (a data fault; the label was ignored)", "", odd.length ? odd.map((t) => "- " + t.name + " — " + t.cards.join(", ")).join("\n") : "None.");
  lines.push("", "## Glossary places (GLOSSARY_PLACES, 31 coordinates) — resolved for Phase 3b's \"show on the Atlas\" button; terms do not contribute (Q-P3 c) and nothing is written", "", "| term | resolves to | via |", "|---|---|---|");
  for (const { g, r } of glossRes) lines.push(`| ${g.slug} | ${r.id ? r.id + " " + ((reg.rows.get(r.id) || newRows[r.id] || {}).name || "") : r.ambiguous ? "ambiguous: " + r.ambiguous.join("; ") : "— " + r.unresolved + (r.unresolvedAnywhere ? "; at any distance: " + r.unresolvedAnywhere : "")} | ${r.id ? r.via : ""} |`);
  /* 2c, task 0b: the terms matched at any distance, each with the item, its kind and its distance from the glossary's point, for a human to check */
  const anyW = glossRes.filter(({ r }) => r.anywhere);
  lines.push("", "## Glossary point terms matched by exact label or alias at any distance (Phase 2c, Task 0b — for a human to check)", "", "A glossary point term the 25 km rule could not place is matched to a Wikidata item by EXACT English label or alias, at any distance, when the item's kind fits an area of that name (a country subdivision, an island, a lake, a desert or a region). Several fitting items, or none, leave the term unresolved. The distance is from the glossary's own hand-given point to the item's coordinate.", "", "| term | item | kind | distance from the glossary point | matched by |", "|---|---|---|---|---|");
  for (const { g, r } of anyW) lines.push(`| ${g.slug} | ${r.anywhere.qid} ${r.anywhere.label} | ${r.anywhere.kind} | ${r.anywhere.km} km (point ${g.at[0]}, ${g.at[1]}) | ${r.anywhere.how} |`);
  for (const { g, r } of glossRes) if (!r.id && g.slug in { Alaska: 1, Great_Britain: 1, Lake_Turkana: 1, Sahara: 1, Siberia: 1, Lomekwi_3: 1 }) lines.push(`| ${g.slug} | — unresolved | | | ${r.ambiguous ? "ambiguous: " + r.ambiguous.join("; ") : (r.unresolvedAnywhere || r.unresolved)} |`);
  const text = lines.join("\n") + "\n";
  if (DRY || VERBOSE) log(text);
  if (!DRY) { fs.writeFileSync(REPORT_FILE, text); log("wrote " + path.relative(ROOT, REPORT_FILE)); }
  /* 3c: the decisions, stated with their evidence (from what the spec persists, so every run prints the same) */
  log(`\nisland and polis folded (decision 1): ${ipRows.length}` + ipRows.map(([id, r]) => `\n  ${r.name} (${id}) <- ` + (r.merged || []).filter((m) => m.how === "island-polis").map((m) => m.qid + " " + m.name).join("; ") + (!(r.merged || []).some((m) => m.how === "island-polis") ? "(the island's own item is also a polis)" : "") + ((r.setAside || []).length ? "   [set aside, alias only: " + r.setAside.map((m) => m.qid + " " + m.name).join("; ") + "]" : "")).join(""));
  log(`period settlements folded because Wikidata links them (decision 2): ${wdFolded.length}` + wdFolded.map((w) => `\n  ${w.m.qid} ${w.m.name} -> ${w.into} ${w.intoName} (${w.m.km} km): ${w.m.evidence}`).join(""));
  log(`period settlements 2-${SAME_SITE_KM} km from a modern city left unfolded: ${X.near.length}` + X.near.sort((a, b) => a.km - b.km || (a.id < b.id ? -1 : 1)).map((m) => `\n  ${m.id} ${m.name} -> ${m.into} ${m.intoName} (${m.km} km): ${m.evidence}`).join(""));
  log(`hills (decision 3): ${hills.length} rows of kind hill, ${hills.filter(([, r]) => r.kindWas3c).length} reclassified from mountain: ${hills.map(([, r]) => r.name + (r.kindWas3c ? "" : " (new)")).join(", ")}`);
  log(`resolved ${resolvedTopo}/${topo.size} toponyms, ${ambiguousTopo.length} ambiguous, ${unresolvedTopo.length} unresolved; ${derived.size} cards derive a place; ${noPlaceOld.length} cards with an old field get none`);
}
module.exports = { TOPS, TOP_IDS, RADIUS, SAME_SITE_KM, CROSS_SITE_KM, familyOf, kindOf, crossMerge, fetchLinks, collect, makeResolver, loadCache, CACHE_FILE, SPEC_FILE, REPORT_FILE };
if (require.main === module) run();
