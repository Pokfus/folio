#!/usr/bin/env node
/* IS THIS PICTURE ALREADY ON SOMETHING? — run BEFORE fetching a replacement, never after.
 *
 * `check-cards.js` reports which cards SHARE a picture, and a session repairing those pairs naturally
 * checks its candidate against the pair in hand. That is not enough: the corpus is 2,895 cards, 3,434
 * glossary terms and 200 artefacts, and a candidate can already be sitting on any of them. It happened
 * on the first batch — the Gracchi bronze chosen for `rm-283` was already `wh-350`'s, so repairing one
 * duplicate created another, and the only thing that caught it was re-running the duplicate count.
 *
 * The comparison is the same one `check-cards.js` makes: the FILE NAME with any `\d+px-` prefix
 * stripped, since the same file at two widths is two different `src` strings.
 *
 *   node .claude/check-image-free.js "Loewenmensch2.jpg" "Temple of Hera (Paestum), East view.jpg"
 *   node .claude/check-image-free.js --batch=<batch.json>     (every src in a fetch batch)
 *
 * Exit 1 if any name is already used, so it can gate a batch.
 */
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");

function key(src) {
  const f = decodeURIComponent(String(src || "").split("/").pop() || "");
  /* SPACE AND UNDERSCORE ARE THE SAME CHARACTER ON COMMONS, and forgetting it makes this checker
     answer "free" about a file that is already on a card — which is the one answer it must never get
     wrong. A card's `src` carries underscores; a name typed from a search result carries spaces. */
  return f.replace(/^\d+px-/, "").replace(/_/g, " ").toLowerCase();
}
const used = new Map();   // key -> [where, …]
function note(src, where) { if (!src) return; const k = key(src); if (!k) return; (used.get(k) || used.set(k, []).get(k)).push(where); }

const { cards } = require("./card-io.js").loadCards();
cards.forEach((c) => { if (c.image && c.image.src) note(c.image.src, c.id); });
const G = require("./gloss-io.js").loadGlossary();
const gi = (G && (G.GLOSSARY_IMAGES || (G.window && G.window.GLOSSARY_IMAGES))) || {};
Object.keys(gi).forEach((k) => { if (gi[k] && gi[k].src) note(gi[k].src, "glossary:" + k); });
try {
  require("./artefact-io.js").loadArtefacts().forEach((a) => { if (a.image && a.image.src) note(a.image.src, "artefact:" + a.id); });
} catch (e) { console.log("  (artefacts not read: " + e.message + ")"); }

const args = process.argv.slice(2);
const batchArg = (args.find((a) => a.startsWith("--batch=")) || "").slice(8);
let names = args.filter((a) => !a.startsWith("--"));
if (batchArg) {
  const b = JSON.parse(fs.readFileSync(batchArg, "utf8"));
  const rows = b.cards || b;
  Object.keys(rows).forEach((id) => { const v = rows[id]; if (v && (v.src || v.file)) names.push(v.src || v.file); });
}
if (!names.length) { console.log("usage: node .claude/check-image-free.js <file name|url> …  |  --batch=<batch.json>"); process.exit(0); }

let taken = 0;
console.log("\n  " + used.size + " distinct pictures already in the corpus\n");
names.forEach((n) => {
  const k = key(n.replace(/^File:/i, ""));
  const where = used.get(k);
  if (where) { taken++; console.log("  TAKEN  " + k + "  →  " + where.join(", ")); }
  else console.log("  free   " + k);
});
console.log("");
process.exit(taken ? 1 : 0);
