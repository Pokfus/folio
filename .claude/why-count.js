/* why-count.js — how many cards carry a `card.why`, over the whole corpus and per collection.
 *
 * WHY THIS EXISTS. The Think-it-through plan and CLAUDE.md both told the reader to run
 * `add-card-links.js --check` for the figure, and that flag has never existed: the tool takes a batch
 * file and reads the first argument as a path, so the documented command dies on ENOENT. A pointer to a
 * command that errors is worse than no pointer, because it reads as a measurement somebody has taken.
 *
 * It prints a COLLECTION breakdown rather than one number, since "the pass is complete" is a claim about
 * sections rather than about the corpus, and the two came apart the moment 300 cards shipped on main
 * while the pass was running.
 *
 * Zero dependencies, reads and never writes. Not part of the site.
 */
"use strict";
global.window = {};
require("../data.js");
const C = window.CARD_DATA, T = window.COLLECTION_TREE;

const col = {};
for (const c of T.collections)
  (function walk(n) {
    (n.cardIds || []).forEach((i) => { col[i] = c.id; });
    (n.children || []).forEach(walk);
  })(c);

const rows = new Map();
for (const c of C) {
  const k = col[c.id] || "(not in the tree)";
  const r = rows.get(k) || [0, 0];
  r[0]++; if (c.why) r[1]++;
  rows.set(k, r);
}

const name = {};
for (const c of T.collections) name[c.id] = c.title || c.id;

console.log("\ncards carrying a `card.why`\n");
for (const k of [...rows.keys()].sort()) {
  const [n, w] = rows.get(k);
  if (!w && !/^(col-|china|bio|psych|ww2|korea|japan|egypt|dino|phil)/.test(k)) continue;
  console.log("  " + (name[k] || k).padEnd(24) + String(w).padStart(5) + " / " + String(n).padEnd(6) +
              (w === n ? "  complete" : ""));
}
const tot = C.length, wy = C.filter((c) => c.why).length;
console.log("\n  " + wy + " of " + tot + " cards in the corpus, Geography and the language decks included\n");
