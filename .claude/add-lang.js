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
//                 "chrome":   { "exact": { "English string": "translation", … },     // -> i18n.js  window.I18N[lang]
//                               "rules": [ ["^Good morning, (.+)$", "…, $1"], … ],   // -> i18n.js  window.I18N_RULES[lang]
//                               "html":  { "<innerHTML>": "<translated innerHTML>" } },  // -> i18n.js  window.I18N_HTML[lang]
//                 "cards":    { "wh-001": { "question": …, "answer": …, "answerDate": …,
//                                           "abstract": …, "answerText": … }, … },   // -> data.js  card.i18n[lang]
//                 "glossary": { "Sima_Qian": "<3 sentences>", … } }                  // -> glossary-i18n.js  [slug][lang]
//
// Every section is OPTIONAL — run it once per batch of work. Only the files a batch actually touches
// are rewritten, and each is re-parsed afterwards to confirm it is still valid JS.
//
//   --partial   allow a card entry with fewer than the 5 translated fields (default: all 5 required,
//               so a half-translated card can't quietly ship)
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const P = {
  i18n: path.join(root, "i18n.js"),
  data: path.join(root, "data.js"),
  gloss: path.join(root, "glossary.js"),
  glossI18n: path.join(root, "glossary-i18n.js"),
};
// mirrors LANGS in app.js — en is the source language and carries no translation tables
const LANGS = ["es", "fr", "de", "it", "nl", "ru", "ar", "zh", "ja"];
const CARD_I18N_FIELDS = ["question", "answer", "answerDate", "abstract", "answerText"];

function loadWindow(file) { const win = {}; new Function("window", fs.readFileSync(file, "utf8"))(win); return win; }
const obj = (o) => "{\n" + Object.keys(o).map((k) => JSON.stringify(k) + ": " + JSON.stringify(o[k])).join(",\n") + "\n}";
function die(msg) { console.error("ERROR: " + msg); process.exit(1); }

const args = process.argv.slice(2);
const partial = args.includes("--partial");
const batchFile = args.find((a) => !a.startsWith("--"));
if (!batchFile) die("usage: node .claude/add-lang.js <batch.json> [--partial]");
const batch = JSON.parse(fs.readFileSync(batchFile, "utf8"));
const lang = batch.lang;
if (!LANGS.includes(lang)) die("unknown `lang`: " + JSON.stringify(lang) + " — expected one of " + LANGS.join(", "));

const done = [];

/* ---- chrome -> i18n.js (exact strings / regex rules / whole HTML blocks) ------------------------ */
if (batch.chrome && Object.keys(batch.chrome).length) {
  const c = batch.chrome;
  const win = loadWindow(P.i18n);   // loading applies the appended merge block, so we get the full tables
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
  if (c.rules && c.rules.length) {   // rules are an ordered array — replace by pattern, else append
    R[lang] = R[lang] || [];
    for (const [pat, repl] of c.rules) {
      const at = R[lang].findIndex((r) => r[0] === pat);
      if (at >= 0) R[lang][at] = [pat, repl]; else R[lang].push([pat, repl]);
    }
  }
  // Keep the file's explanatory header and drop everything after it: the appended "daily-quote pool"
  // merge block was only ever an append convenience, and loadWindow above has already folded its keys
  // into I18N, so rewriting the three tables whole loses nothing and keeps the file scriptable.
  const head = fs.readFileSync(P.i18n, "utf8").split("window.I18N = ")[0];
  fs.writeFileSync(P.i18n,
    head +
    "window.I18N = " + JSON.stringify(I) + ";\n" +
    "window.I18N_RULES = " + JSON.stringify(R) + ";\n" +
    "window.I18N_HTML = " + JSON.stringify(H) + ";\n");
  loadWindow(P.i18n);   // re-parse to confirm valid JS
  done.push("i18n.js: +" + Object.keys(c.exact || {}).length + " exact, +" + ((c.rules || []).length) + " rules, +" + Object.keys(c.html || {}).length + " html" +
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

/* ---- glossary -> glossary-i18n.js ([slug][lang]) ----------------------------------------------- */
if (batch.glossary && Object.keys(batch.glossary).length) {
  const GLOSS = loadWindow(P.gloss).GLOSSARY || {};
  const G = (fs.existsSync(P.glossI18n) ? (loadWindow(P.glossI18n).GLOSSARY_I18N || {}) : {});
  for (const [slug, text] of Object.entries(batch.glossary)) {
    if (!(slug in GLOSS)) die("no glossary term with slug " + slug + " (add the English entry first with add-glossary.js)");
    if (!(typeof text === "string" && text.trim())) die("empty translation for " + slug);
    G[slug] = G[slug] || {};
    G[slug][lang] = text;
  }
  fs.writeFileSync(P.glossI18n,   // byte-identical header to add-glossary.js + app.js's serializeGlossaryI18n
    "/* Glossary translations — window.GLOSSARY_I18N[slug][lang] = the entry's description translated into that\n" +
    "   language (same three-sentence rules as the English text in glossary.js). Languages: es, fr, de, it, nl,\n" +
    "   ru, ar, zh, ja. Grown alongside glossary.js by .claude/add-glossary.js (the entry JSON's \"translations\"\n" +
    "   field); the gloss popup shows the translation matching the site language, falling back to English.\n" +
    "   Loaded after glossary.js / glossary-wikipedia.js, before app.js. */\n" +
    "window.GLOSSARY_I18N = " + obj(G) + ";\n");
  loadWindow(P.glossI18n);   // re-parse to confirm valid JS
  const have = Object.keys(GLOSS).filter((s) => (G[s] || {})[lang]).length;
  done.push("glossary-i18n.js: " + Object.keys(batch.glossary).length + " term(s) (" + lang + " now " + have + "/" + Object.keys(GLOSS).length + ")");
}

if (!done.length) die("batch has no `chrome`, `cards` or `glossary` section — nothing to do");
console.log(lang + " backfill:\n  " + done.join("\n  "));
