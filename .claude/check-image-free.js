#!/usr/bin/env node
/* IS THIS PICTURE ALREADY ON SOMETHING? — run BEFORE fetching a replacement, never after.
 *
 * `check-cards.js` reports which cards SHARE a picture, and a session repairing those pairs naturally
 * checks its candidate against the pair in hand. That is not enough: the corpus is 2,895 cards, 3,434
 * glossary terms and 200 artefacts, and a candidate can already be sitting on any of them. It happened
 * on the first batch — the Gracchi bronze chosen for `rm-283` was already `wh-350`'s, so repairing one
 * duplicate created another, and the only thing that caught it was re-running the duplicate count.
 *
 * The comparison is `check-cards.js`'s, widened: the FILE NAME with any `\d+px-` prefix stripped,
 * since the same file at two widths is two different `src` strings, AND with Commons' derivation
 * suffixes folded away, since the same file re-cropped is two different names (see `DERIV_RX`).
 * Measured over the shipped corpus when the fold was added: it changes ONE group, and that group is
 * a card and its own glossary term, which is the sanctioned pairing — so this half is prophylactic
 * rather than a repair, and the fault it caught was a candidate, not something already live.
 *
 *   node .claude/check-image-free.js "Loewenmensch2.jpg" "Temple of Hera (Paestum), East view.jpg"
 *   node .claude/check-image-free.js --batch=<batch.json>     (every src in a fetch batch)
 *
 * Exit 1 if any name is already used, so it can gate a batch.
 */
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");

/* A RE-CROP IS THE SAME PICTURE, AND THE HEADER'S OWN EXAMPLE ESCAPED THIS CHECK BECAUSE OF IT
   (Sep 2026). Commons' convention for a derivative is the original's name plus a parenthetical, so
   `Eugene Guillaume - the Gracchi (cropped).jpg` IS `Eugene Guillaume - the Gracchi.jpg` cut down —
   and `rm-281` took it while `wh-350` already carried the original, which is precisely the pair this
   tool exists to prevent and precisely the pair its header cites. The `\d+px-` rule is the same
   insight one derivation earlier; this is the rest of it.

   THE LIST IS DECLARED AND DELIBERATELY SHORT. Each of these words means *a derivative of this
   photograph*, so folding it cannot merge two pictures a reader would tell apart. `detail` is NOT
   among them, and that is the line: a detail of one figure out of a sculpture group is a different
   picture on the page, which is why `Eugene Guillaume - the Gracchi (cropped) Gaius.jpg` still
   reports free and stays a judgement rather than a refusal. Nor is `photo` or `version N`, which say
   nothing about what was done. The fold is REPORTED when it fires, so a reader can see the match was
   made across a suffix rather than on the bare name. */
const DERIV_RX = /\s*\((?:\d+(?:[x.]\d+)*\s*)?(?:cropped|crop|retouched|restored|edited)\)/gi;

function bare(src) {
  const f = decodeURIComponent(String(src || "").split("/").pop() || "");
  /* SPACE AND UNDERSCORE ARE THE SAME CHARACTER ON COMMONS, and forgetting it makes this checker
     answer "free" about a file that is already on a card — which is the one answer it must never get
     wrong. A card's `src` carries underscores; a name typed from a search result carries spaces. */
  return f.replace(/^\d+px-/, "").replace(/_/g, " ").toLowerCase();
}
function key(src) {
  return bare(src).replace(DERIV_RX, "").replace(/\s{2,}/g, " ").trim();
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
  const raw = bare(n.replace(/^File:/i, ""));
  const k = key(n.replace(/^File:/i, ""));
  const where = used.get(k);
  if (where) {
    taken++;
    const note = k === raw ? "" : "  (same picture as a derivative: " + raw + ")";
    console.log("  TAKEN  " + k + "  →  " + where.join(", ") + note);
  } else console.log("  free   " + raw);
});
console.log("");
process.exit(taken ? 1 : 0);
