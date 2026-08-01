#!/usr/bin/env node
// Backfill ONE site language into the existing content, in batches. This is the tool for adding a new
// language to Folio (or topping up a partially-translated one) — add-card.js / add-glossary.js only
// handle a whole NEW entry in every language at once, and both would clobber the languages already on
// an entry if used for a partial update (add-card refuses duplicate ids; update-cards.js replaces the
// whole `i18n` object). Everything here MERGES: a language never touches its neighbours.
//
//   node .claude/add-lang.js <batch.json>
//
// <batch.json>  { "lang": "ja",
//                 "chrome":   { "exact": { "English string": "translation", … },     // -> i18n/ui-<lang>.js  I18N[lang]
//                               "rules": [ ["^Good morning, (.+)$", "…, $1"], … ],   // -> i18n/ui-<lang>.js  I18N_RULES[lang]
//                               "html":  { "<innerHTML>": "<translated innerHTML>" },  // -> i18n/ui-<lang>.js  I18N_HTML[lang]
//                               "remove": ["English string whose source text is gone", …] },  // retire dead rows
//                 "cards":    { "wh-001": { "question": …, "answer": …, "answerDate": …,
//                                           "abstract": …, "answerText": … }, … },   // -> data.js  card.i18n[lang]
//                 "games":    { "truefalse": { "<English q>": { q, why, cat }, … },   // -> i18n/games-<lang>.js
//                               "quotes":    { "<English q>": { q, who, context }, … } },
//                 "tree":     { "col-51": "Eisenzeit", … },                          // -> data.js  node.i18n[lang]
//                 "places":   { "Germany": "Deutschland", … },                        // -> i18n/places-<lang>.js
//                 "glossary": { "Sima_Qian": "<3 sentences>", … } }                  // -> i18n/gloss-<lang>.js
//
// Every section is OPTIONAL — run it once per batch of work. Only the files a batch actually touches
// are rewritten, and each is re-parsed afterwards to confirm it is still valid JS. Translation files are
// per-language (see CLAUDE.md), so a batch only ever writes the one language it names.
//
//   --partial   allow a card entry with fewer than the 5 translated fields (default: all 5 required,
//               so a half-translated card can't quietly ship)
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const glossI18nIO = require("./gloss-i18n-io");   // the per-language i18n/gloss-<lang>.js files
const gamesI18nIO = require("./games-i18n-io");   // the per-language i18n/games-<lang>.js files
const placesIO = require("./places-i18n-io");     // the per-language i18n/places-<lang>.js files
const P = {
  i18nDir: path.join(root, "i18n"),
  data: path.join(root, "data.js"),
  gloss: path.join(root, "glossary.js"),
  world: path.join(root, "world.js"),
  timeline: path.join(root, "timeline.js"),
};
const uiFile = (l) => path.join(P.i18nDir, "ui-" + l + ".js");
// mirrors LANGS in app.js — en is the source language and carries no translation tables
const LANGS = ["es", "fr", "de", "it", "nl", "ru", "ar", "zh", "ja"];
const CARD_I18N_FIELDS = ["question", "answer", "answerDate", "abstract", "answerText"];

function loadWindow(file) { const win = {}; new Function("window", fs.readFileSync(file, "utf8"))(win); return win; }
function die(msg) { console.error("ERROR: " + msg); process.exit(1); }

const args = process.argv.slice(2);
const partial = args.includes("--partial");
const batchFile = args.find((a) => !a.startsWith("--"));
if (!batchFile) die("usage: node .claude/add-lang.js <batch.json> [--partial]");
const batch = JSON.parse(fs.readFileSync(batchFile, "utf8"));
const lang = batch.lang;
if (!LANGS.includes(lang)) die("unknown `lang`: " + JSON.stringify(lang) + " — expected one of " + LANGS.join(", "));

const done = [];

/* ---- chrome -> i18n/ui-<lang>.js (exact strings / regex rules / whole HTML blocks) -------------- */
if (batch.chrome && Object.keys(batch.chrome).length) {
  const c = batch.chrome;
  // load every language's chrome file: the target language to merge into, the rest to validate keys against
  const win = {};
  for (const f of (fs.existsSync(P.i18nDir) ? fs.readdirSync(P.i18nDir) : [])) {
    if (/^ui-[\w-]+\.js$/.test(f)) new Function("window", fs.readFileSync(path.join(P.i18nDir, f), "utf8"))(win);
  }
  const I = win.I18N || {}, R = win.I18N_RULES || {}, H = win.I18N_HTML || {};
  // The English keys must already exist in another language, or the string is one the walker will never
  // look up (a typo, or text that has since changed) and the translation would be dead weight.
  const known = (tbl) => new Set(Object.keys(tbl).flatMap((l) => (Array.isArray(tbl[l]) ? tbl[l].map((r) => r[0]) : Object.keys(tbl[l]))));
  const unknownExact = Object.keys(c.exact || {}).filter((k) => !known(I).has(k));
  const unknownHtml = Object.keys(c.html || {}).filter((k) => !known(H).has(k));
  if (unknownExact.length) console.warn("  ! " + unknownExact.length + " exact key(s) match no other language — check for a changed source string: " + JSON.stringify(unknownExact[0]).slice(0, 90));
  if (unknownHtml.length) console.warn("  ! " + unknownHtml.length + " html block(s) match no other language");

  I[lang] = Object.assign(I[lang] || {}, c.exact || {});
  H[lang] = Object.assign(H[lang] || {}, c.html || {});
  // `remove`: retire translations whose English source string is gone (an item reworded, or several
  // merged into one). Without this the old rows sit in every language file for ever, matching nothing
  // and reading like coverage that exists. Removal is per language, like every other write here.
  for (const k of (c.remove || [])) { delete (I[lang] || {})[k]; delete (H[lang] || {})[k]; }
  if (c.rules && c.rules.length) {   // rules are an ordered array — replace by pattern, else append
    R[lang] = R[lang] || [];
    for (const [pat, repl] of c.rules) {
      const at = R[lang].findIndex((r) => r[0] === pat);
      if (at >= 0) R[lang][at] = [pat, repl]; else R[lang].push([pat, repl]);
    }
  }
  fs.mkdirSync(P.i18nDir, { recursive: true });
  fs.writeFileSync(uiFile(lang),
    "/* Folio site-chrome translations — " + lang + ". Lazy: fetched by the `uiI18n:" + lang + "` data bundle only when the\n" +
    "   site language is " + lang + ", so a reader downloads their own language and nothing else. English is the source\n" +
    "   language and the universal fallback — anything missing here simply stays English on screen.\n" +
    "     window.I18N[" + lang + "]       — exact-match text: { \"English string\": \"translation\" }, keyed by the trimmed text node.\n" +
    "     window.I18N_RULES[" + lang + "] — parameterized text: [ [\"^regex with (groups)$\", \"replacement with $1\"], … ], tried in order.\n" +
    "     window.I18N_HTML[" + lang + "]  — whole prose blocks: an element's exact trimmed innerHTML -> the translated innerHTML.\n" +
    "   Written by .claude/add-lang.js. The walker in app.js (localizeTree/applyLang) does the swapping. */\n" +
    "(function () {\n" +
    "  var L = " + JSON.stringify(lang) + ";\n" +
    "  (window.I18N = window.I18N || {})[L] = " + JSON.stringify(I[lang]) + ";\n" +
    "  (window.I18N_RULES = window.I18N_RULES || {})[L] = " + JSON.stringify(R[lang] || []) + ";\n" +
    "  (window.I18N_HTML = window.I18N_HTML || {})[L] = " + JSON.stringify(H[lang] || {}) + ";\n" +
    "})();\n");
  loadWindow(uiFile(lang));   // re-parse to confirm valid JS
  done.push("i18n/ui-" + lang + ".js: +" + Object.keys(c.exact || {}).length + " exact, +" + ((c.rules || []).length) + " rules, +" + Object.keys(c.html || {}).length + " html" +
    ((c.remove || []).length ? ", −" + c.remove.length + " retired" : "") +
    " (" + lang + " now " + Object.keys(I[lang]).length + " exact / " + (R[lang] || []).length + " rules / " + Object.keys(H[lang] || {}).length + " html)");
}

/* ---- cards -> data.js (card.i18n[lang]) -------------------------------------------------------- */
if (batch.cards && Object.keys(batch.cards).length) {
  const win = loadWindow(P.data), cards = win.CARD_DATA, tree = win.COLLECTION_TREE;
  const byId = new Map(cards.map((c) => [c.id, c]));
  for (const [id, tr] of Object.entries(batch.cards)) {
    const card = byId.get(id);
    if (!card) die("no card with id " + id);
    const missing = CARD_I18N_FIELDS.filter((f) => !(typeof tr[f] === "string" && tr[f].trim()));
    if (missing.length && !partial) die("card " + id + " is missing translated field(s): " + missing.join(", ") + " — pass --partial to allow");
    const extra = Object.keys(tr).filter((f) => !CARD_I18N_FIELDS.includes(f));
    if (extra.length) die("card " + id + " has field(s) that are not translated per language: " + extra.join(", "));
    // never mutate in place across languages: merge this language's fields onto whatever is already there
    card.i18n = card.i18n || {};
    card.i18n[lang] = Object.assign({}, card.i18n[lang] || {}, tr);
  }
  fs.writeFileSync(P.data,   // mirrors add-card.js / update-cards.js serialization exactly
    "/* Card data. Add cards one at a time with `node .claude/add-card.js <card.json> [deckId]` (see CLAUDE.md). */\n" +
    "window.CARD_DATA = [\n" + cards.map((c) => JSON.stringify(c)).join(",\n") + "\n];\n\n" +
    "/* Collection -> deck -> sub-deck tree. Leaf decks carry a `cardIds` array. */\n" +
    "window.COLLECTION_TREE = " + JSON.stringify(tree, null, 2) + ";\n");
  loadWindow(P.data);   // re-parse to confirm valid JS
  const full = cards.filter((c) => CARD_I18N_FIELDS.every((f) => ((c.i18n || {})[lang] || {})[f])).length;
  done.push("data.js: " + Object.keys(batch.cards).length + " card(s) (" + lang + " now complete on " + full + "/" + cards.length + ")");
}

/* ---- games -> i18n/games-<lang>.js (per-language, LAZY) ---------------------------------------- */
// The pools themselves (truefalse.js / quotes.js) are in the EAGER load path, so their translations
// must NOT live inline: nine languages inside quotes.js took it from 27 KB to 312 KB downloaded by
// every visitor. Items are keyed by their ENGLISH `q` (verified unique in both pools) rather than by
// array index, so a batch can't be mis-applied if a pool is ever reordered or an item inserted.
const GAME_POOLS = {
  truefalse: { file: path.join(root, "truefalse.js"), global: "TRUEFALSE", fields: ["q", "why", "cat"] },
  quotes: { file: path.join(root, "quotes.js"), global: "QUOTEGAME", fields: ["q", "who", "context"] },
};
if (batch.games && Object.keys(batch.games).length) {
  const store = gamesI18nIO.read(lang);
  const counts = [];
  for (const [pool, entries] of Object.entries(batch.games)) {
    const G = GAME_POOLS[pool];
    if (!G) die("unknown game pool " + JSON.stringify(pool) + " — expected one of " + Object.keys(GAME_POOLS).join(", "));
    const items = loadWindow(G.file)[G.global];
    const byQ = new Set(items.map((x) => x.q));
    store[pool] = store[pool] || {};
    for (const [q, tr] of Object.entries(entries)) {
      if (!byQ.has(q)) die(pool + ": no item whose English `q` is " + JSON.stringify(q).slice(0, 90));
      const missing = G.fields.filter((f) => !(typeof tr[f] === "string" && tr[f].trim()));
      if (missing.length && !partial) die(pool + " item is missing translated field(s): " + missing.join(", ") + " — pass --partial to allow");
      const extra = Object.keys(tr).filter((f) => !G.fields.includes(f));
      if (extra.length) die(pool + " item has field(s) that are not translated per language: " + extra.join(", "));
      store[pool][q] = Object.assign({}, store[pool][q] || {}, tr);   // merge, never replace
    }
    const full = items.filter((x) => G.fields.every((f) => (store[pool][x.q] || {})[f])).length;
    counts.push(pool + " " + full + "/" + items.length);
  }
  gamesI18nIO.write(lang, store);   // re-parses to confirm valid JS
  done.push("i18n/games-" + lang + ".js: " + counts.join(", "));
}

/* ---- places -> i18n/places-<lang>.js (per-language, LAZY) -------------------------------------- */
// Country names (world.js), era territory names and era capital names (timeline.js), keyed by the
// ENGLISH name. Read by placeName() in app.js — NOT the I18N chrome table, because most of these names
// are also glossary terms and card answers, where a global exact key would override wording the card and
// glossary pipelines already translate. Lazy per language, like the gloss and games tables.
if (batch.places && Object.keys(batch.places).length) {
  const known = new Set();
  const geo = loadWindow(P.world).WORLD_GEO || [];
  geo.forEach((c) => c.n && known.add(c.n));
  const tl = (loadWindow(P.timeline).TIMELINE) || [];
  tl.forEach((e) => {
    (e.geo || []).forEach((g) => g.n && known.add(g.n));
    Object.values(e.groups || {}).forEach((n) => n && known.add(n));
    (e.cities || []).forEach((c) => c.n && known.add(c.n));
  });
  const store = placesIO.read(lang);
  for (const [name, tr] of Object.entries(batch.places)) {
    if (!known.has(name)) die("no country, territory or capital named " + JSON.stringify(name) + " in world.js or timeline.js");
    if (!(typeof tr === "string" && tr.trim())) die("empty translation for " + JSON.stringify(name));
    store[name] = tr.trim();
  }
  placesIO.write(lang, store);   // re-parses to confirm valid JS
  done.push("i18n/places-" + lang + ".js: " + Object.keys(batch.places).length + " name(s) (" + lang + " now " + Object.keys(store).length + "/" + known.size + ")");
}

/* ---- tree -> data.js (collection/deck node.i18n[lang]) ----------------------------------------- */
// Deck and collection titles are data, not chrome: they are read by nodeTitle() in app.js, NOT through
// the I18N exact table, because titles like "Prehistory" or "Bronze Age" also occur as answer terms and
// glossary links inside card prose, where a global key would override the card pipeline's own wording.
if (batch.tree && Object.keys(batch.tree).length) {
  const win = loadWindow(P.data), cards = win.CARD_DATA, tree = win.COLLECTION_TREE;
  const byId = new Map();
  (function walk(a) { (a || []).forEach((n) => { byId.set(n.id, n); walk(n.children); }); })(tree.collections);
  for (const [id, title] of Object.entries(batch.tree)) {
    const node = byId.get(id);
    if (!node) die("no collection/deck node with id " + id);
    if (!(typeof title === "string" && title.trim())) die("empty title translation for node " + id);
    node.i18n = node.i18n || {};           // merge, never replace: a language must not drop its neighbours
    node.i18n[lang] = title.trim();
  }
  fs.writeFileSync(P.data,
    "/* Card data. Add cards one at a time with `node .claude/add-card.js <card.json> [deckId]` (see CLAUDE.md). */\n" +
    "window.CARD_DATA = [\n" + cards.map((c) => JSON.stringify(c)).join(",\n") + "\n];\n\n" +
    "/* Collection -> deck -> sub-deck tree. Leaf decks carry a `cardIds` array. */\n" +
    "window.COLLECTION_TREE = " + JSON.stringify(tree, null, 2) + ";\n");
  loadWindow(P.data);   // re-parse to confirm valid JS
  const have = [...byId.values()].filter((n) => (n.i18n || {})[lang]).length;
  done.push("data.js tree: " + Object.keys(batch.tree).length + " node(s) (" + lang + " now " + have + "/" + byId.size + ")");
}

/* ---- glossary -> i18n/gloss-<lang>.js ---------------------------------------------------------- */
if (batch.glossary && Object.keys(batch.glossary).length) {
  const GLOSS = loadWindow(P.gloss).GLOSSARY || {};
  const G = {};   // just this language: { slug: text } — the other languages live in their own files
  Object.assign(G, glossI18nIO.read(lang));
  // A term's footnote markers must sit on the same claims in every language. A translation that loses
  // them loses the apparatus silently — the fold still renders and only the in-text links disappear —
  // and one that carries a DIFFERENT set points the reader at the wrong work, which is worse than none.
  const markersOf = (html) => [...String(html || "").matchAll(/data-fn="(\d+)"/gi)].map((m) => +m[1]).sort((a, b) => a - b).join(",");
  for (const [slug, text] of Object.entries(batch.glossary)) {
    if (!(slug in GLOSS)) die("no glossary term with slug " + slug + " (add the English entry first with add-glossary.js)");
    if (!(typeof text === "string" && text.trim())) die("empty translation for " + slug);
    const want = markersOf(GLOSS[slug]), got = markersOf(text);
    if (want !== got) console.warn("WARNING: " + slug + " (" + lang + ") carries markers [" + got + "] where the English has [" + want + "] — that language shows the source list but points at the wrong claims, or at none.");
    G[slug] = text;
  }
  glossI18nIO.write(lang, G);   // re-parses to confirm valid JS
  const have = Object.keys(GLOSS).filter((s) => G[s]).length;
  done.push("i18n/gloss-" + lang + ".js: " + Object.keys(batch.glossary).length + " term(s) (" + lang + " now " + have + "/" + Object.keys(GLOSS).length + ")");
}

if (!done.length) die("batch has no `chrome`, `cards`, `games`, `tree`, `places` or `glossary` section — nothing to do");
console.log(lang + " backfill:\n  " + done.join("\n  "));
