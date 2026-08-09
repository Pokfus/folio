#!/usr/bin/env node
/* Append artefacts to ../artefacts.js — the pool a level-up chest draws from.
   ==========================================================================
     node .claude/add-artefacts.js <batch.json>

   <batch.json>  { "artefacts": [ { id, name, rarity, date, origin, desc, sources, image? }, … ] }

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
     · fewer than ARTEFACT_SRC_TARGET citations, a citation with no URL, a source no marker points at, or a
       marker pointing past the end of the list. The bar is read out of app.js rather than written down
       here, so it cannot be raised in one place and left standing in another; see
       .claude/add-artefact-sources.js, which is how an artefact ALREADY in the file is cited.
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
const URL_RX = /https?:\/\/[^\s<>"')\]]+/;
// the citation bar, sliced out of app.js so the site and the pipeline cannot disagree about it
const BAR = (() => {
  const src = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
  const m = src.match(/const\s+ARTEFACT_SRC_TARGET\s*=\s*(\d+)/);
  if (!m) { console.error("ERROR: ARTEFACT_SRC_TARGET not found in app.js."); process.exit(1); }
  return parseInt(m[1], 10);
})();
// which entries a description points at — a marker with no data-fn takes the next number in reading order
function markersOf(desc) {
  const out = [];
  let seq = 0;
  String(desc || "").replace(/<sup[^>]*class="[^"]*\bfn\b[^"]*"[^>]*>/gi, (tag) => {
    const m = tag.match(/data-fn="(\d+)"/i);
    const n = m ? parseInt(m[1], 10) : ++seq;
    if (m) seq = Math.max(seq, n);
    out.push(n);
    return tag;
  });
  return out;
}

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

  const src = Array.isArray(a.sources) ? a.sources.map((x) => String(x).replace(/\s+/g, " ").trim()).filter(Boolean) : [];
  if (src.length < BAR) errs.push(at + ": " + src.length + " sources — the bar is " + BAR + ".");
  src.forEach((x, j) => { if (!URL_RX.test(x)) errs.push(at + ": source " + (j + 1) + " carries no URL a reader can open."); });
  if (new Set(src).size !== src.length) errs.push(at + ": the same citation appears twice.");
  const marks = markersOf(desc);
  if (!marks.length) errs.push(at + ": the description points at nothing — every source needs a marker.");
  marks.forEach((n) => { if (n > src.length) errs.push(at + ": a marker points at source " + n + " and the list has " + src.length + "."); });
  for (let j = 1; j <= src.length; j++) if (marks.indexOf(j) < 0) errs.push(at + ": source " + j + " is not referenced by any marker.");
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
  out += "    desc: " + s(a.desc) + ",\n";
  const src = Array.isArray(a.sources) ? a.sources.map((x) => String(x).replace(/\s+/g, " ").trim()).filter(Boolean) : [];
  if (src.length) out += "    sources: [\n" + src.map((x) => "      " + s(x) + ",").join("\n") + "\n    ],\n";
  return out + "  },";
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

/* Each new artefact looks for its picture here — see the same block in add-card.js for why.  The
   search term is the artefact's NAME, which for half the reliquary is a KIND ("Acheulean hand
   axe", "Flint scraper") rather than a thing: a kind is hard to search and almost impossible to
   get wrong, since any real Acheulean hand axe IS one.  A named object is the opposite, and is
   where the review matters. */
if (!process.argv.includes("--no-image")) {
  const want = list.filter((a) => !(a.image && a.image.src));
  const { report } = require("./suggest-image.js");
  (async () => {
    for (const a of want) { console.log("\n" + a.id + ":"); await report("artefacts", a.id, a.name); }
  })().catch((e) => console.log("  (no picture looked for: " + e.message + ")"));
}
