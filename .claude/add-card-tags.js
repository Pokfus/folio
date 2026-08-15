#!/usr/bin/env node
/*
  Give cards their categorising TAGS — the card-side sibling of the glossary's `GLOSSARY_TAGS`.

  A card's tags live on the card itself (`card.tags`), in the SAME vocabulary the glossary uses: tag 1 is the
  KIND (era, hominin, place, industry, object, practice, concept, fossil, culture, event, person, people,
  animal, building, theory), then the subject areas (archaeology, palaeontology, geology, science, history,
  prehistory, evolution, genetics, technology, art, geography, nature, climate, migration), then whatever
  specifics apply (a country, a region, a period). Reuse what is already in use — check
  `window.GLOSSARY_TAGS` and the cards already tagged before coining a near-synonym.

  What they are FOR: the Multiple Choice game draws its three wrong answers from cards sharing the most tags
  with the right one, so a question about a stone industry is answered against other stone industries rather
  than against a cave, a climate phase and a fossil — which made the answer obvious.

    node .claude/add-card-tags.js <batch.json>

    { "cards": { "wh-016": ["hominin", "palaeontology", "evolution", "prehistory"], … } }

  It merges surgically: only `tags` is written, and only on the cards named. Re-running with a different
  list REPLACES that card's tags (they are a small closed set, not a growing one).
*/
const fs = require("fs"), path = require("path");
const dataPath = path.join(__dirname, "..", "data.js");
const MIN_TAGS = 3, MAX_TAGS = 8;
const TAG_RX = /^[a-z0-9][a-z0-9 '–-]{1,28}$/;   // lowercase, as the glossary's are

function loadWindow(file) { const win = {}; new Function("window", fs.readFileSync(file, "utf8"))(win); return win; }
function die(m) { console.error("ERROR: " + m); process.exit(1); }

const batchFile = process.argv[2];
if (!batchFile) die("usage: node .claude/add-card-tags.js <batch.json>");
let batch;
try { batch = JSON.parse(fs.readFileSync(batchFile, "utf8")); } catch (e) { die("could not read " + batchFile + ": " + e.message); }
if (!batch || typeof batch.cards !== "object") die("batch file needs a `cards` object");

const win = loadWindow(dataPath), cards = win.CARD_DATA, tree = win.COLLECTION_TREE;
if (!Array.isArray(cards)) die("data.js did not yield window.CARD_DATA");
const byId = new Map(cards.map((c) => [c.id, c]));

// ---- validate the whole batch BEFORE writing anything ------------------------------------------------
const edits = [];
for (const id of Object.keys(batch.cards)) {
  const card = byId.get(id);
  if (!card) die("no card with id " + id + " in data.js");
  const tags = batch.cards[id];
  if (!Array.isArray(tags)) die(id + ": tags must be an array");
  if (tags.length < MIN_TAGS) die(id + ": " + tags.length + " tag(s) — at least " + MIN_TAGS + " (kind, then subject areas, then specifics)");
  if (tags.length > MAX_TAGS) die(id + ": " + tags.length + " tags — the cap is " + MAX_TAGS + "; a tag every card carries sorts nothing");
  const seen = new Set();
  for (const t of tags) {
    if (typeof t !== "string" || !TAG_RX.test(t)) die(id + ': "' + t + '" is not a tag — lowercase words, 2–29 characters');
    if (seen.has(t)) die(id + ': "' + t + '" is listed twice');
    seen.add(t);
  }
  edits.push([card, tags]);
}
edits.forEach(([card, tags]) => { card.tags = tags; });

/* ---- write data.js back ------------------------------------------------------------------------------
   THE WHOLE CARD IS RE-SERIALIZED, never a list of fields (fixed Aug 2026, after this tool stripped every
   card's rating). It used to keep a private copy of `serializeCardData`'s field list and emit only what
   that copy named — which was written before `difficulty` existed and knew nothing about `undatable`, so
   ONE run of it silently removed both from all 500 cards. Nothing threw, the tags were written correctly,
   the file parsed, and the only symptom was every minigame's pool quietly emptying.
   A whitelist here can only ever be a copy of app.js's, and a copy is a thing that goes stale on a change
   made somewhere else, by someone who has no reason to look in this file. `JSON.stringify(c)` cannot:
   the cards are loaded from data.js and written back with their own keys in their own order, so a field
   added later rides through untouched. It is what add-sources.js and add-questions.js already do.
   The two comment lines are written out in full for the same reason: this used to keep the file's own
   head and splice a `tail` starting at `window.COLLECTION_TREE`, which quietly dropped the comment
   standing above the tree on every single run. */
const out =
  "/* Card data. Add cards one at a time with `node .claude/add-card.js <card.json> [deckId]` (see CLAUDE.md). */\n" +
  "window.CARD_DATA = [\n" + cards.map((c) => JSON.stringify(c)).join(",\n") + "\n];\n\n" +
  "/* Collection -> deck -> sub-deck tree. Leaf decks carry a `cardIds` array. */\n" +
  "window.COLLECTION_TREE = " + JSON.stringify(tree, null, 2) + ";\n";
fs.writeFileSync(dataPath, out);
try { loadWindow(dataPath); } catch (e) { die("data.js no longer parses after the write: " + e.message); }

// ---- report ------------------------------------------------------------------------------------------
const tagged = cards.filter((c) => Array.isArray(c.tags) && c.tags.length).length;
console.log("tagged " + edits.length + " card(s): " + edits.map(([c]) => c.id).join(", "));
console.log("cards with tags: " + tagged + "/" + cards.length);
const counts = {};
cards.forEach((c) => (c.tags || []).forEach((t) => (counts[t] = (counts[t] || 0) + 1)));
const rare = Object.entries(counts).filter(([, n]) => n === 1).map(([t]) => t);
if (rare.length) console.warn("note: " + rare.length + " tag(s) used by exactly one card — " + rare.join(", ") +
  "\n      (a tag no other card shares can never group a distractor; keep it only if it is genuinely the card's kind)");
