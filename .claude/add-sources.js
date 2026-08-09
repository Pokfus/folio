#!/usr/bin/env node
// Backfill source footnotes onto EXISTING cards and glossary terms, in batches — the tool for citing
// content that shipped before the footnote system existed (see CLAUDE.md "Citing the existing content").
// add-card.js refuses a duplicate id and add-glossary.js rewrites a whole entry, so neither can do this.
//
//   node .claude/add-sources.js <batch.json>
//
// <batch.json> = {
//   "cards": { "<cardId>": {
//       "sources":  ["<Chicago note-form citation>", …],       // REPLACES the card's list
//       "abstract": "<the abstract with <sup class=\"fn\" data-fn=\"N\"></sup> markers inserted>",
//       "i18n": { "es": "<that language's abstract, same markers>", … }   // optional but expected
//   }, … },
//   "glossary": { "<slug>": {
//       "sources":     ["…"],                                  // REPLACES the term's list
//       "description": "<optional: the description with markers inserted>"
//   }, … }
// }
//
// It merges surgically: only `sources` (and, where given, the abstract/description the markers live in)
// are written. Every other field, and every language not named, is left alone.
//
// The markers matter as much as the citations. A card's abstract must reference every source it lists,
// and each translated abstract must carry the SAME markers as the English — a language that loses them
// loses the apparatus silently, since the fold still renders and only the in-text links disappear.
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const dataPath = path.join(root, "data.js");
const glossPath = path.join(root, "glossary.js");
const I18N_LANGS = ["es", "fr", "de", "it", "nl", "ru", "ar", "zh", "ja"];
const SRC_MAX = 24;   // mirrors SRC_MAX in app.js
// the editorial bar, read out of app.js so the two can never disagree about what it is
const APP_SRC = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
const SRC_TARGET = (() => { const m = /const SRC_TARGET = (\d+);/.exec(APP_SRC); return m ? +m[1] : 5; })();
// the same, for a glossary term — a lower bar, for the reason given beside the constant in app.js
const GLOSS_TARGET = (() => { const m = /const GLOSS_SRC_TARGET = (\d+);/.exec(APP_SRC); return m ? +m[1] : 2; })();
// Every citation carries a link, so a reader can check the claim and follow it further — which also means
// only publicly reachable scholarship is citable, and that a cited page number can always be verified.
const SRC_URL = /https?:\/\/[^\s<>"']+/;

function loadWindow(file) { const win = {}; new Function("window", fs.readFileSync(file, "utf8"))(win); return win; }
const obj = (o) => "{\n" + Object.keys(o).map((k) => JSON.stringify(k) + ": " + JSON.stringify(o[k])).join(",\n") + "\n}";
const markersIn = (html) => [...String(html || "").matchAll(/<sup\b[^>]*class="[^"]*\bfn\b[^"]*"[^>]*>/gi)]
  .map((m) => { const d = /data-fn="(\d+)"/i.exec(m[0]); return d ? +d[1] : 0; });

function die(msg) { console.error("ERROR: " + msg); process.exit(1); }
function cleanSources(list, where) {
  if (!Array.isArray(list) || !list.length || list.some((s) => typeof s !== "string" || !s.trim()))
    die(where + " needs a non-empty `sources` array of citation strings.");
  if (list.length > SRC_MAX) die(where + " has " + list.length + " sources — at most " + SRC_MAX + ". More than that is a bibliography, not footnotes.");
  const unlinked = list.filter((s) => !SRC_URL.test(s));
  if (unlinked.length) die(where + ": every citation ends in a link the reader can follow — " + JSON.stringify(unlinked[0].slice(0, 80)) + " has none. Put the DOI or permalink last, as plain text; the site links it.");
  const out = [];
  list.forEach((s) => { const t = String(s).replace(/\s+/g, " ").trim(); if (t && out.indexOf(t) < 0) out.push(t); });
  return out;
}

const batchFile = process.argv[2];
if (!batchFile) die("usage: node .claude/add-sources.js <batch.json>");
const batch = JSON.parse(fs.readFileSync(batchFile, "utf8"));
if (!batch.cards && !batch.glossary) die("batch file needs a `cards` and/or a `glossary` object");

/* ---------------- cards -> data.js ---------------- */
const cardIds = [];
if (batch.cards && Object.keys(batch.cards).length) {
  const win = loadWindow(dataPath), cards = win.CARD_DATA, tree = win.COLLECTION_TREE;
  const byId = new Map(cards.map((c) => [c.id, c]));
  for (const id of Object.keys(batch.cards)) {
    const u = batch.cards[id], card = byId.get(id);
    if (!card) die("no card with id " + id);
    const src = cleanSources(u.sources, "card " + id);
    const abstract = typeof u.abstract === "string" ? u.abstract : card.abstract;
    const marks = markersIn(abstract);
    if (!marks.length) die("card " + id + " has no footnote marker in its abstract. Point its claims at the sources with <sup class=\"fn\" data-fn=\"1\"></sup> (written empty — the digit is drawn from the list at render time).");
    const bad = marks.filter((n) => n < 1 || n > src.length);
    if (bad.length) die("card " + id + " points at source " + bad[0] + ", but lists " + src.length + ". A marker with no entry behind it is dropped at render time.");
    const unused = src.map((_, i) => i + 1).filter((n) => marks.indexOf(n) < 0);
    if (unused.length) die("card " + id + ": source " + unused.join(", ") + " is never referenced from the abstract. Every citation is a footnote to a specific claim — add a marker, or drop the source.");
    card.sources = src;
    // the editorial bar (SRC_TARGET in app.js): under it the Edit page paints the card's chip amber. Not
    // fatal — a maintenance edit is allowed to leave a card short — but it must not pass unremarked.
    if (src.length < SRC_TARGET) console.warn("WARNING: card " + id + " ends with " + src.length + " source(s), under the bar of " + SRC_TARGET + ". It stays flagged in the Edit page's list until it reaches it.");
    // reaching the bar retires a "researched and blocked" flag: the count is the truth, the flag a note
    else if (card.sourcesBlocked) { delete card.sourcesBlocked; console.log("card " + id + " reached the bar — its `sourcesBlocked` flag is retired."); }
    if (typeof u.abstract === "string") card.abstract = u.abstract;
    // each translated abstract must carry the same markers, or that language quietly loses the apparatus
    const tr = u.i18n || {};
    for (const l of I18N_LANGS) {
      const has = card.i18n && card.i18n[l];
      if (typeof tr[l] === "string") {
        if (!has) die("card " + id + " has no existing " + l + " translation block — translate the card first (add-lang.js), then its sources.");
        const tm = markersIn(tr[l]);
        if (tm.length !== marks.length) die("the " + l + " abstract of " + id + " carries " + tm.length + " markers, the English " + marks.length + " — the same claims must carry the same markers.");
        card.i18n[l] = Object.assign({}, card.i18n[l], { abstract: tr[l] });
      } else if (has) {
        const tm = markersIn(card.i18n[l].abstract);
        if (tm.length !== marks.length)
          console.warn("WARNING: the " + l + " abstract of " + id + " has " + tm.length + " markers and the English has " + marks.length + " — that language shows the list but none of the in-text links.");
      }
    }
    cardIds.push(id);
  }
  const out =
    "/* Card data. Add cards one at a time with `node .claude/add-card.js <card.json> [deckId]` (see CLAUDE.md). */\n" +
    "window.CARD_DATA = [\n" + cards.map((c) => JSON.stringify(c)).join(",\n") + "\n];\n\n" +
    "/* Collection -> deck -> sub-deck tree. Leaf decks carry a `cardIds` array. */\n" +
    "window.COLLECTION_TREE = " + JSON.stringify(tree, null, 2) + ";\n";
  fs.writeFileSync(dataPath, out);
  loadWindow(dataPath);   // re-parse to confirm valid JS
}

/* ---------------- glossary -> glossary.js ---------------- */
const slugs = [];
if (batch.glossary && Object.keys(batch.glossary).length) {
  const win = loadWindow(glossPath);
  const GLOSS = win.GLOSSARY || {}, DATES = win.GLOSSARY_DATES || {}, ALIASES = win.GLOSSARY_ALIASES || {},
    CASE = win.GLOSSARY_CASESENSITIVE || {}, TAGS = win.GLOSSARY_TAGS || {}, IMAGES = win.GLOSSARY_IMAGES || {},
    VIDEOS = win.GLOSSARY_VIDEOS || {}, SOURCES = win.GLOSSARY_SOURCES || {},
    // the Atlas tables, written by .claude/fetch-place-coords.js. This writer rebuilds glossary.js from a
    // FIXED list of tables, so a table it does not know about is silently dropped — which is exactly what
    // happened to these two the first time a citation batch ran after they were added. Carry every table.
    PLACES = win.GLOSSARY_PLACES || {}, MAPC = win.GLOSSARY_MAP_COUNTRY || {};
  for (const slug of Object.keys(batch.glossary)) {
    const u = batch.glossary[slug];
    if (!(slug in GLOSS)) die("no glossary term with slug " + slug);
    const src = cleanSources(u.sources, "term " + slug);
    const desc = typeof u.description === "string" ? u.description : GLOSS[slug];
    // Markers are REQUIRED on a term, exactly as on a card (changed 2026-08-01 on request; they were
    // optional through batches G1–G4, on the reasoning that three sentences over two works are described
    // by the list alone). Two things retired that: lists here now run to five and six sources, at which
    // size a reader genuinely cannot tell which work carries which claim; and a reader arriving from a
    // fully-marked card read the vanishing numbers as the apparatus giving up rather than as a choice.
    const marks = markersIn(desc);
    if (!marks.length) die("term " + slug + " has no footnote marker in its description. Point its claims at the sources with <sup class=\"fn\" data-fn=\"1\"></sup> (written empty — the digit is drawn from the list at render time).");
    const bad = marks.filter((n) => n < 1 || n > src.length);
    if (bad.length) die("term " + slug + " points at source " + bad[0] + ", but lists " + src.length + ". A marker with no entry behind it is dropped at render time.");
    const unused = src.map((_, i) => i + 1).filter((n) => marks.indexOf(n) < 0);
    if (unused.length) die("term " + slug + ": source " + unused.join(", ") + " is never referenced from the description. Every citation is a footnote to a specific claim — add a marker, or drop the source.");
    SOURCES[slug] = src;
    // the term bar (GLOSS_SRC_TARGET in app.js). Lower than a card's because a description is three
    // sentences, not ten — but a single work behind three sentences is a reading list, not an apparatus.
    if (src.length < GLOSS_TARGET) console.warn("WARNING: term " + slug + " ends with " + src.length + " source(s), under the bar of " + GLOSS_TARGET + " (docs/glossary-citation-plan.md).");
    if (typeof u.description === "string") GLOSS[slug] = u.description;
    slugs.push(slug);
  }
  let out =
    "/* Glossary tooltip descriptions, keyed by Wikipedia article slug (decoded). Add terms one at a time with\n" +
    "   `node .claude/add-glossary.js <entry.json>` (see CLAUDE.md). Missing terms fall back to the slug name. */\n" +
    "window.GLOSSARY = " + obj(GLOSS) + ";\n\n" +
    "/* Optional date shown next to a term (e.g. \"c. 145-86 BCE\", \"1644-1912\"). Keyed by the same slug. */\n" +
    "window.GLOSSARY_DATES = Object.assign(window.GLOSSARY_DATES || {}, " + obj(DATES) + ");\n";
  const section = (o, comment, name) => {
    if (!Object.keys(o).length) return "";
    return "\n/* " + comment + " */\n" + "window." + name + " = Object.assign(window." + name + " || {}, " + obj(o) + ");\n";
  };
  out += section(ALIASES, "Optional alternative background spellings that also open a term's popup (slug -> [forms]); plurals auto-link.", "GLOSSARY_ALIASES");
  out += section(CASE, "Slugs that only auto-link when the surface matches the term's own capitalization (e.g. Heaven, not heaven).", "GLOSSARY_CASESENSITIVE");
  out += section(TAGS, "Category tags per term (slug -> [tags]) — shown in the admin glossary list and filterable from its left bar.", "GLOSSARY_TAGS");
  out += section(IMAGES, "Optional illustration per term (slug -> { src, title, desc, credit, alt }) — shown at the foot of the term's popup.", "GLOSSARY_IMAGES");
  out += section(VIDEOS, "Optional video per term (slug -> { src, title, desc, credit }) — a YouTube/Vimeo or direct file link, shown in the term's popup.", "GLOSSARY_VIDEOS");
  out += section(SOURCES, "Source footnotes per term (slug -> [Chicago note-form citations]) — a numbered fold at the foot of the popup.\n   Not translated: a citation names an edition that exists in one language.", "GLOSSARY_SOURCES");
  out += section(PLACES, "Point-locations for the gloss popup's map-marker button: slug -> [lon, lat], fetched from Wikipedia's\n   own primary coordinates by .claude/fetch-place-coords.js. Never hand-written.", "GLOSSARY_PLACES");
  out += section(MAPC, "Glossary terms that name a country the Atlas draws: slug -> the name world.js uses. Joined at build\n   time by the same script, because world.js is lazy and the popup must decide without it.", "GLOSSARY_MAP_COUNTRY");
  fs.writeFileSync(glossPath, out);
  loadWindow(glossPath);   // re-parse to confirm valid JS
}

/* ---------------- running coverage, which is how a multi-batch pass is tracked ---------------- */
const allCards = loadWindow(dataPath).CARD_DATA || [];
const citedCards = allCards.filter((c) => Array.isArray(c.sources) && c.sources.length).length;
const atBar = allCards.filter((c) => (Array.isArray(c.sources) ? c.sources.length : 0) >= SRC_TARGET).length;
const g = loadWindow(glossPath);
const gs = g.GLOSSARY_SOURCES || {};
const citedTerms = Object.keys(gs).length, allTerms = Object.keys(g.GLOSSARY || {}).length;
const termsAtBar = Object.keys(gs).filter((k) => (Array.isArray(gs[k]) ? gs[k].length : 0) >= GLOSS_TARGET).length;
if (cardIds.length) console.log("cited " + cardIds.length + " card(s): " + cardIds.join(", "));
if (slugs.length) console.log("cited " + slugs.length + " term(s): " + slugs.join(", "));
console.log("coverage: cards cited " + citedCards + "/" + allCards.length + " · at the " + SRC_TARGET + "-source bar " + atBar + "/" + allCards.length +
  " | glossary cited " + citedTerms + "/" + allTerms + " · at the " + GLOSS_TARGET + "-source bar " + termsAtBar + "/" + allTerms);
