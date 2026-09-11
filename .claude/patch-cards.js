#!/usr/bin/env node
/* Patch cards in ../data.js IN PLACE, ONE LINE AT A TIME.
 *
 *   node .claude/patch-cards.js <patch.json>
 *
 * WHY THIS EXISTS RATHER THAN `update-cards.js`: that helper re-serialises the whole
 * `CARD_DATA` array, which normalises every card's KEY ORDER and turns a two-card change into a
 * ten-thousand-line diff nobody can review (CLAUDE.md records the same scar under
 * `add-card-tags.js`). `data.js` is one JSON object per line, so a patch that rewrites only the
 * lines it touches leaves every other card byte-for-byte as it was.
 *
 * <patch.json> is { "cards": { "<id>": { "set": {…}, "unset": ["field", …] }, … } }.
 * `set` assigns whole fields; `unset` deletes them. A key order is preserved for fields that
 * already exist, and a new field is appended — so the diff is the change and nothing else.
 *
 * It validates the WHOLE patch before writing anything (a half-applied patch is worse than a
 * refused one) and re-parses the file afterwards to confirm valid JS.
 */
const fs = require("fs"), path = require("path");
const dataPath = path.join(__dirname, "..", "data.js");

const file = process.argv[2];
if (!file) { console.error("usage: node .claude/patch-cards.js <patch.json>"); process.exit(1); }
const patch = JSON.parse(fs.readFileSync(file, "utf8"));
const cards = patch && patch.cards;
if (!cards || typeof cards !== "object") { console.error("ERROR: patch needs a `cards` object"); process.exit(1); }

const text = fs.readFileSync(dataPath, "utf8");
const lines = text.split("\n");

// index every card line by id, so a patch can be validated before a byte is written
const lineOf = new Map();
for (let i = 0; i < lines.length; i++) {
  const m = /^\{"id":"([^"]+)"/.exec(lines[i]);
  if (m) lineOf.set(m[1], i);
}

const ids = Object.keys(cards);
for (const id of ids) {
  if (!lineOf.has(id)) { console.error("ERROR: no card line for id " + id); process.exit(1); }
  const spec = cards[id] || {};
  if (spec.set && typeof spec.set !== "object") { console.error("ERROR: " + id + " `set` must be an object"); process.exit(1); }
  if (spec.unset && !Array.isArray(spec.unset)) { console.error("ERROR: " + id + " `unset` must be an array"); process.exit(1); }
}

let touched = 0;
for (const id of ids) {
  const i = lineOf.get(id), spec = cards[id] || {};
  const raw = lines[i].replace(/,$/, "");
  const obj = JSON.parse(raw);
  (spec.unset || []).forEach((k) => { delete obj[k]; });
  Object.keys(spec.set || {}).forEach((k) => { obj[k] = spec.set[k]; });
  lines[i] = JSON.stringify(obj) + (lines[i].endsWith(",") ? "," : "");
  touched++;
}

fs.writeFileSync(dataPath, lines.join("\n"));
// re-parse, exactly as add-card.js does, so a broken write is caught here rather than in a browser
const win = {};
new Function("window", fs.readFileSync(dataPath, "utf8"))(win);
if (!Array.isArray(win.CARD_DATA)) { console.error("ERROR: data.js no longer parses to a card array"); process.exit(1); }
console.log("patched " + touched + " card" + (touched === 1 ? "" : "s") + "; " + win.CARD_DATA.length + " cards in data.js");
