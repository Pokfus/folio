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

const win = loadWindow(dataPath), cards = win.CARD_DATA;
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

// ---- write data.js back, in the shape serializeCardData emits ---------------------------------------
const FIELDS = ["num", "category", "question", "answer", "answerDate", "traditional", "hanzi", "pinyin", "translations", "abstract", "citation", "answerText"];
const ser = (c) => {
  const o = { id: c.id };
  FIELDS.forEach((f) => { o[f] = c[f] == null ? "" : c[f]; });
  if (Array.isArray(c.questions) && c.questions.length) o.questions = c.questions;
  if (Array.isArray(c.tags) && c.tags.length) o.tags = c.tags;
  if (Array.isArray(c.sources) && c.sources.length) o.sources = c.sources;
  if (typeof c.sourcesBlocked === "string" && c.sourcesBlocked.trim()) o.sourcesBlocked = c.sourcesBlocked;
  if (c.i18n) o.i18n = c.i18n;
  if (c.image && c.image.src) o.image = c.image;
  else if (c.video && c.video.src) o.video = c.video;
  return o;
};
const src = fs.readFileSync(dataPath, "utf8");
const head = src.slice(0, src.indexOf("window.CARD_DATA = ["));
const treeAt = src.indexOf("window.COLLECTION_TREE");
const tail = src.slice(treeAt);
const out = head + "window.CARD_DATA = [\n" + cards.map((c) => JSON.stringify(ser(c))).join(",\n") + "\n];\n\n" + tail;
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
