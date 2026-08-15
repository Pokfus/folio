// Split a combined multi-language deck file into one deck per language — and, where a language's levels
// live in separate files instead, fold those in. Standalone Node, zero dependencies, not part of the site.
//
//   node .claude/split-decks.js <combined.folio-deck.json> [outDir]
//        [--drop=<Language>]                       drop that language's cards from the combined file
//        [--add=<Language>/<Subdeck>=<file>]       add a whole deck file as one subdeck of that language
//        [--add=<Language>=<file>]                 …or keeping the file's OWN subdeck tree, for a deck
//                                                  already divided into levels
//
// WHY THIS EXISTS, and it is NO LONGER "the combined file will not import" (Aug 2026). It was: at 94 MB and
// 39,830 notes the reader's all-languages file was over both caps as they then stood, and `uDeckImportFile`
// refused it at the file read. `combine-decks.py` then raised them to 44,000 notes and 128 MB for a
// combined file of its own, so that one now fits — and the reason to split is the one the reader gave,
// which the caps never answered: a language per deck, so the languages you study are the ones you add.
// The size argument survives it and is worth keeping in mind rather than treating as settled. app.js's own
// note beside UDECK_MAX_BYTES says the file is read to a string and then JSON.parse'd, so a phone briefly
// holds several times it in heap; the cap is a guard against a hostile file, not a promise that anything
// under it imports on the device the reader actually studies on. Five files of 17–57 MB are a far safer
// thing to hand a phone than one of 94.
//
// THE CAPS ARE READ OUT OF app.js (`appConst`), never restated here — combine-decks.py's rule, and the
// same reason: this tool refuses exactly what the app refuses, and a cap raised in one place cannot leave
// the other quietly wrong. Both were, in the hours between that raise and this line being written.
//
// THREE THINGS IT HAS TO GET RIGHT, and each is silent if it does not:
//
//   CARD IDS ARE RENUMBERED PER DECK. A file import keeps the file's own card ids whenever the DECK id is
//   free (uDeckImportText), and card ids are the scheduling key in the shared UCARDS store — so a German
//   deck emitted with the `u_goethea1_…` ids of the file it was built from would collide with an installed
//   Goethe A1, two decks claiming one card. Renumbering to the new deck's own id makes that impossible.
//
//   ONLY THE TYPES A DECK ACTUALLY USES TRAVEL WITH IT. The combined file declares six card types for five
//   languages; carrying all six into each deck would ship four unreachable templates per file and invite an
//   id clash on any later merge. A type is kept when one of the deck's own cards names it.
//
//   THE LANGUAGE PREFIX COMES OFF THE SUBDECK PATH. `sub` is a `::` path, so `Mandarin::HSK 3.0::Level 1`
//   inside a Mandarin deck would draw a redundant "Mandarin" container above every level. The first segment
//   is the language and is dropped; what is left is the deck's own tree.
//
// It writes nothing it has not checked: every deck is re-parsed, measured against both caps, and its notes
// counted back against the source before it is kept.

const fs = require("fs");
const path = require("path");

const SEP = "::";
const ROOT = path.resolve(__dirname, "..");

/* A cap READ off app.js, so this tool cannot drift from what will actually import. A renamed constant is
   fatal rather than assumed: silently falling back to a figure written here is how a deck gets built to a
   size the app turns away. */
function appConst(name, src) {
  const m = new RegExp("\\b" + name + "\\s*=\\s*([0-9*\\s]+?)[,;]").exec(src);
  if (!m) die(name + " is not in app.js under that name — it has been renamed, and this tool would "
    + "otherwise write decks to a size the app refuses.");
  return Function("return (" + m[1] + ")")();
}
const APP = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const MAX_CARDS = appConst("UDECK_MAX_CARDS", APP);
const MAX_BYTES = appConst("UDECK_MAX_BYTES", APP);

/* A deck file may carry only the fields UDECK_META_KEYS names: uDeckNormalize copies that list and drops
   the rest, so a field written here and not listed there is written, imported, and silently gone. That is
   invisible from both ends — the file is valid, the deck imports, and the only symptom is a shelf that
   never appears — so the two are checked against each other rather than assumed to agree. */
(function checkMetaKeys() {
  const m = /UDECK_META_KEYS\s*=\s*\[([^\]]*)\]/.exec(APP);
  if (!m) die("UDECK_META_KEYS is not in app.js — a deck file's fields cannot be checked against it.");
  const known = m[1].split(",").map((s) => s.trim().replace(/^["']|["']$/g, ""));
  ["shelf", "icon", "color"].forEach((f) => {
    if (known.indexOf(f) < 0) die("app.js's UDECK_META_KEYS does not carry `" + f + "`, so an imported deck "
      + "would drop it. Add it there, or stop writing it here.");
  });
})();

/* Per language: the deck id it is written under, its BCP-47 code, how the deck names itself, and the colour
   it arrives in. The id must match [a-z0-9]{4,16} (uDeckSanitizeMeta) and should not collide with a deck the
   reader may already hold — these are deliberately not `goethea1`, `itall` and the rest, which are the ids
   of the parts.

   THE COLOURS ARE FIVE OF THE CURATED EIGHT the Studio offers (GROUP_COLORS in app.js), not new ones. The
   store accepts any six-digit hex, so a new palette was available and is not worth having: a deck ships in
   a colour the reader could have chosen for it themselves, which is the rule the Studio's own picker was
   built on, and five distinct hues out of eight is separation enough for a shelf of five. It is a DEFAULT —
   recolouring the row on the home page still wins — so nothing here overrides a choice already made. */
const SHELF = "Languages";
const LANGS = {
  French:   { id: "frenchvocab",   code: "fr", color: "#2E6E8E", what: "DELF A1–C2 and expressions" },
  German:   { id: "germanvocab",   code: "de", color: "#664C9A", what: "Goethe A1–C2, vocabulary and phrases" },
  Italian:  { id: "italianvocab",  code: "it", color: "#1F6F5C", what: "CILS A1–C2, core vocabulary and phrases" },
  Mandarin: { id: "mandarinvocab", code: "zh", color: "#9E2B25", what: "HSK 1–2 and HSK 3.0, with phrases and idioms" },
  Spanish:  { id: "spanishvocab",  code: "es", color: "#C2701E", what: "DELE A1–C2 and phrases, both directions" },
};

function die(msg) { console.error("split-decks: " + msg); process.exit(1); }
function readDeck(p) {
  let raw;
  try { raw = JSON.parse(fs.readFileSync(p, "utf8")); } catch (e) { die("couldn't read " + p + " — " + e.message); }
  if (!raw || !raw.folioDeck) die(p + " isn't a Folio deck file.");
  return raw;
}
// how many CARDS a note of this type makes — a type may declare several templates, and the legacy
// front/back shape (which uTypeSanitize folds into cards[0]) is one
function tplCount(type) {
  if (!type) return 1;
  const n = (type.cards || []).length;
  return n || 1;
}

const args = process.argv.slice(2);
const src = args.find((a) => !a.startsWith("--"));
if (!src) die("usage: node .claude/split-decks.js <combined.folio-deck.json> [outDir] [--drop=Lang] [--add=Lang/Sub=file]");
const outDir = args.filter((a) => !a.startsWith("--"))[1] || "decks";
const drops = args.filter((a) => a.startsWith("--drop=")).map((a) => a.slice(7));
const adds = args.filter((a) => a.startsWith("--add=")).map((a) => {
  const body = a.slice(6);
  const eq = body.indexOf("=");
  if (eq < 0) die("--add wants Language/Subdeck=file, got " + body);
  const where = body.slice(0, eq), file = body.slice(eq + 1);
  const slash = where.indexOf("/");
  // no subdeck named ⇒ the added deck is already divided into levels and keeps its own tree
  if (slash < 0) return { lang: where, sub: null, file };
  return { lang: where.slice(0, slash), sub: where.slice(slash + 1), file };
});

const combined = readDeck(src);
console.log("source   " + path.basename(src) + "  " + (fs.statSync(src).size / 1048576).toFixed(1) + " MB  "
  + (combined.cards || []).length.toLocaleString() + " notes");

/* Gather every language's notes. A note's language is the FIRST segment of its subdeck path; the combined
   file puts every note under one, and a note without one would have nowhere to go, so it is reported rather
   than quietly dropped into whichever deck happened to be first. */
const langs = new Map();   // Language -> [{ card, sub }]
/* When each language was last touched, taken from the files that actually fed it rather than from the
   clock — so re-running this reproduces its decks BYTE FOR BYTE, which is the standing check on every
   generator here and the only way to tell a deliberate change from a rebuild. */
const stamps = new Map();
const stamp = (lang, meta) => stamps.set(lang, Math.max(stamps.get(lang) || 0, Number(meta.updatedAt) || Number(meta.createdAt) || 0));
const orphans = [];
for (const c of combined.cards || []) {
  const parts = String(c.sub || "").split(SEP);
  if (parts.length < 2 || !parts[0]) { orphans.push(c); continue; }
  const lang = parts[0];
  if (drops.includes(lang)) continue;
  if (!langs.has(lang)) langs.set(lang, []);
  stamp(lang, combined.meta);
  langs.get(lang).push({ card: c, sub: parts.slice(1).join(SEP), types: combined.meta.types || {} });
}
if (orphans.length) console.log("WARNING  " + orphans.length + " notes carry no language prefix and are not in any deck");
drops.forEach((d) => console.log("dropped  " + d + " from the combined file (rebuilt from --add below)"));

// …then the whole deck files folded in as single subdecks
for (const a of adds) {
  const deck = readDeck(a.file);
  const cards = deck.cards || [];
  if (!cards.length) die(a.file + " has no cards.");
  if (!langs.has(a.lang)) langs.set(a.lang, []);
  stamp(a.lang, deck.meta);
  cards.forEach((c) => langs.get(a.lang).push({
    card: c, sub: a.sub === null ? String(c.sub || "") : a.sub, types: deck.meta.types || {},
  }));
  console.log("added    " + a.lang + (a.sub === null ? " (its own subdecks)" : SEP + a.sub)
    + "  " + cards.length.toLocaleString() + " notes  <- " + path.basename(a.file));
}

fs.mkdirSync(outDir, { recursive: true });
let wrote = 0, refused = 0, totalNotes = 0;
for (const [lang, items] of [...langs.entries()].sort()) {
  const info = LANGS[lang] || { id: lang.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 16) || "deck", code: "", what: "" };

  /* The types the deck's own cards name, taken from whichever file each card came from — a merged language
     draws its cards from several files, and two of them could in principle declare the same type id with
     different templates. That would render half the deck with the other half's card, so it is refused. */
  const types = {};
  for (const it of items) {
    const t = it.card.type;
    if (!t) continue;
    const def = it.types[t];
    if (!def) die(lang + ": a card names card type \"" + t + "\" that its own file does not declare.");
    const seen = types[t];
    if (seen && JSON.stringify(seen) !== JSON.stringify(def)) {
      die(lang + ": card type \"" + t + "\" is declared two different ways in the files being merged.");
    }
    types[t] = def;
  }

  const cards = items.map((it, i) => {
    const c = Object.assign({}, it.card);
    c.id = "u_" + info.id + "_" + (i + 1);
    if (it.sub) c.sub = it.sub; else delete c.sub;
    return c;
  });
  const nCards = items.reduce((n, it) => n + tplCount(types[it.card.type]), 0);

  const subs = [...new Set(items.map((it) => it.sub).filter(Boolean))];
  const top = [...new Set(subs.map((s) => s.split(SEP)[0]))];
  const meta = {
    id: info.id,
    /* The title is the LANGUAGE and nothing else, with what the deck actually holds moved into the
       subtitle underneath (Aug 2026). On a shelf these read as five subjects the way a collection's name
       does; carrying the syllabus in the title gave "Mandarin — HSK 1–2 and HSK 3.0, with phrases and
       idioms", which wraps to two lines on a desktop row and buries the one word being looked for. */
    title: lang,
    subtitle: (info.what ? info.what + " · " : "") + cards.length.toLocaleString() + " words and expressions",
    desc: "Every " + lang + " deck on this shelf in one file: " + top.join(", ") + ".\n\n"
      + "One subdeck per level, so adding the deck brings the levels and a level can be added on its own. "
      + "Each word is asked in both directions, and each direction keeps a schedule of its own.\n\n"
      + "Split out of the combined all-languages deck, so the languages you study are the ones you add.",
    author: combined.meta.author || "",
    language: info.code,
    tags: ["vocabulary", "languages", lang.toLowerCase()],
    /* The shelf these five are drawn on together, above the undivided "Your decks" list, and the icon they
       wear there. Both travel in the file and neither is sent when a deck is published — see the note on
       `shelf` in uDeckSanitizeMeta for why a shelf is the reader's own arrangement rather than the
       author's. `language` is a key into COLLECTION_ICON, resolved at render and ignored if unknown. */
    shelf: SHELF,
    icon: "language",
    color: info.color || combined.meta.color || "",
    glossMode: combined.meta.glossMode || "off",
    types: types,
    version: 1,
    createdAt: combined.meta.createdAt || 0,
    updatedAt: stamps.get(lang) || combined.meta.createdAt || 0,
    forkedFrom: null,
  };
  // exactly what downloadDeckFile writes — and NOTHING from UDECK_PUBLISH_KEYS, which a deck file may
  // never carry: it would let the file claim somebody else's slug or masquerade as installed
  const out = { folioDeck: 1, exportedAt: new Date(0).toISOString(), meta: meta, cards: cards, gloss: {} };
  const file = path.join(outDir, lang + "-All-Levels.folio-deck.json");
  fs.writeFileSync(file, JSON.stringify(out, null, 2));

  // …then check what was actually written, rather than what was meant to be
  const bytes = fs.statSync(file).size;
  const back = JSON.parse(fs.readFileSync(file, "utf8"));
  const ids = new Set(back.cards.map((c) => c.id));
  const problems = [];
  if (back.cards.length !== items.length) problems.push("lost notes");
  if (ids.size !== back.cards.length) problems.push("duplicate card ids");
  if (back.cards.length > MAX_CARDS) problems.push("over the " + MAX_CARDS.toLocaleString() + "-card cap");
  if (bytes > MAX_BYTES) problems.push("over the " + Math.round(MAX_BYTES / 1048576) + " MB cap");
  if (!/^[a-z0-9]{4,16}$/.test(back.meta.id)) problems.push("deck id " + back.meta.id + " is not [a-z0-9]{4,16}");
  if (back.cards.some((c) => String(c.sub || "").startsWith(lang + SEP))) problems.push("language prefix left on a subdeck");
  if (back.meta.shelf !== SHELF) problems.push("shelf missing");

  totalNotes += items.length;
  if (problems.length) { refused++; console.log("FAIL     " + file + "  " + problems.join(", ")); }
  else {
    wrote++;
    console.log("wrote    " + path.basename(file).padEnd(34) + (bytes / 1048576).toFixed(1).padStart(6) + " MB  "
      + String(items.length).padStart(6) + " notes  " + String(nCards).padStart(6) + " cards  "
      + subs.length + " subdecks  types=" + Object.keys(types).join(","));
  }
}
const accounted = totalNotes + orphans.length;
console.log("\n" + wrote + " deck" + (wrote === 1 ? "" : "s") + " written to " + outDir + "/"
  + (refused ? ", " + refused + " REFUSED" : "") + "  —  " + totalNotes.toLocaleString() + " notes out"
  + "  (caps read from app.js: " + MAX_CARDS.toLocaleString() + " notes, " + Math.round(MAX_BYTES / 1048576) + " MB)");
if (!adds.length && !drops.length && accounted !== (combined.cards || []).length) {
  console.log("WARNING  " + (combined.cards || []).length.toLocaleString() + " notes in, " + accounted.toLocaleString() + " accounted for");
}
process.exit(refused ? 1 : 0);
