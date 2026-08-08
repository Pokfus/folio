#!/usr/bin/env node
/* Append artefacts to ../artefacts.js — the pool a level-up chest draws from.
   ==========================================================================
     node .claude/add-artefacts.js <batch.json>

   <batch.json>  { "artefacts": [ { id, name, rarity, date, origin, desc, image? }, … ] }

   It exists for the reason every other content pipeline here has one: the rules in artefacts.js's own
   header (five sentences, ~200 words, a source line on every picture) are invisible to the eye at scale,
   and the file is rewritten wholesale by Admin → Artefacts, so a hand edit that drifts from
   `serializeArtefacts`'s output format is a diff nobody can read the next time an editor saves. This
   writes the file in EXACTLY that format, so the two can never come apart.

   Checks, all of them refusals rather than warnings:
     · a duplicate or malformed id — an id is what the reader's own inventory is keyed by, so a collision
       silently hands two different objects to one slot
     · a rarity outside the four
     · a desc that is not exactly FIVE sentences, or outside 180–220 words
     · an `image` with a `src` and no `credit` — the same rule add-card.js and add-glossary.js enforce
     · a metric unit with no imperial equivalent beside it (warned, not refused — some units have none
       worth giving)
   The word count STRIPS the imperial parenthetical first, exactly as add-card.js does: the conversion is
   a courtesy to the reader and must not eat the prose budget. */
const fs = require("fs"), path = require("path");
const { pieces } = require("./split-abstract.js");
const file = path.join(__dirname, "..", "artefacts.js");
const RARITIES = ["common", "rare", "epic", "legendary"];
const SENTENCES = 5, WORD_MIN = 180, WORD_MAX = 220;
/* add-card.js's own pattern — an imperial conversion is not charged against the prose budget.
   It gains VOLUME here (gallons, pints, quarts), which the card corpus never needed: an artefact is a
   physical object and a jar, a cauldron or a drinking cup is measured in litres. The exemption's reason
   is unchanged — a conversion is a courtesy to the reader, not prose — so the unit list follows the
   measurements this corpus actually takes rather than being copied for its own sake. */
const IMPERIAL_PAREN = /\s*\((?=[^)]*\d)[^)]*\b(?:miles?|foot|feet|ft|inch(?:es)?|in|yards?|pounds?|lbs?|ounces?|oz|tons?|acres?|gallons?|pints?|quarts?|sq\s?mi|°F)\b[^)]*\)/gi;
const METRIC = /\b\d[\d.,]*\s?(?:millimetres?|centimetres?|metres?|kilometres?|kilograms?|grams?|tonnes?|litres?|km|cm|mm)\b/i;

const arg = process.argv[2];
if (!arg) { console.error("usage: node .claude/add-artefacts.js <batch.json>"); process.exit(1); }
const batch = JSON.parse(fs.readFileSync(arg, "utf8"));
const list = Array.isArray(batch) ? batch : batch.artefacts;
if (!Array.isArray(list) || !list.length) { console.error("ERROR: batch holds no artefacts."); process.exit(1); }

/* Load what is already shipped. The file assigns a global, so a bare window stands in for the browser —
   the same trick every checker in .claude/ uses on the data files. */
global.window = {};
require(file);
const have = global.window.ARTEFACTS || [];
const seen = new Set(have.map((a) => a.id));

const errs = [], warns = [];
list.forEach((a, i) => {
  const at = "artefact " + (i + 1) + " (" + (a.id || "no id") + ")";
  if (!a.id || !/^[a-z0-9][a-z0-9-]*$/.test(a.id)) errs.push(at + ": id must be a lowercase slug.");
  else if (seen.has(a.id)) errs.push(at + ": id already exists — an id is never reused.");
  seen.add(a.id);
  if (!a.name) errs.push(at + ": no name.");
  if (!RARITIES.includes(a.rarity)) errs.push(at + ': rarity must be one of "' + RARITIES.join('", "') + '".');
  if (!a.date) errs.push(at + ": no date line.");
  if (!a.origin) errs.push(at + ": no origin.");
  if (a.image && a.image.src && !a.image.credit) errs.push(at + ": an image with a src needs a credit.");

  const desc = String(a.desc || "");
  if (!desc) { errs.push(at + ": no desc."); return; }
  const n = pieces(desc).length;
  if (n !== SENTENCES) errs.push(at + ": desc is " + n + " sentences — it must be exactly " + SENTENCES + ".");
  const words = desc.replace(/<[^>]+>/g, "").replace(IMPERIAL_PAREN, "").trim().split(/\s+/).length;
  if (words < WORD_MIN || words > WORD_MAX) errs.push(at + ": desc is " + words + " words — the bar is " + WORD_MIN + "–" + WORD_MAX + " (~200 ±10%).");
  if (!/<b>/.test(desc)) errs.push(at + ": the object's own name is bolded at its first mention.");
  if (METRIC.test(desc) && !IMPERIAL_PAREN.test(desc)) warns.push(at + ": a metric figure with no imperial equivalent beside it — check it is one that wants none.");
  IMPERIAL_PAREN.lastIndex = 0;
});
if (errs.length) { errs.forEach((e) => console.error("ERROR: " + e)); process.exit(1); }
warns.forEach((w) => console.warn("warn: " + w));

/* Rewrite the file in serializeArtefacts()'s exact output format — head comment and all. That comment is
   the only copy of the shape's documentation once the file has been round-tripped through the editor, so
   it is written out here rather than preserved from disk, which is what the editor itself does. */
const s = (v) => JSON.stringify(String(v == null ? "" : v));
const HEAD = fs.readFileSync(file, "utf8").split("window.ARTEFACTS")[0];
const all = have.concat(list);
const body = all.map((a) => {
  let out = "  {\n    id: " + s(a.id) + ",\n    name: " + s(a.name) + ",\n    rarity: " + s(a.rarity) + ",\n";
  if (a.date) out += "    date: " + s(a.date) + ",\n";
  if (a.origin) out += "    origin: " + s(a.origin) + ",\n";
  if (a.image && a.image.src) out += "    image: { src: " + s(a.image.src) + ", credit: " + s(a.image.credit) + ", alt: " + s(a.image.alt) + " },\n";
  return out + "    desc: " + s(a.desc) + ",\n  },";
}).join("\n");
fs.writeFileSync(file, HEAD + "window.ARTEFACTS = [\n" + body + "\n];\n");

// re-parse, so a malformed write is caught here rather than by a reader with a blank chest
delete require.cache[require.resolve(file)];
global.window = {};
require(file);
if ((global.window.ARTEFACTS || []).length !== all.length) { console.error("ERROR: re-parse returned the wrong count."); process.exit(1); }

const byRar = {};
all.forEach((a) => { byRar[a.rarity] = (byRar[a.rarity] || 0) + 1; });
console.log("added " + list.length + " — the pool is now " + all.length + ": " +
  RARITIES.map((r) => (byRar[r] || 0) + " " + r).join(", ") + ".");
