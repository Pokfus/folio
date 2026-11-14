#!/usr/bin/env node
/* test-chest-sources.js — the chest's source register, the finished-deck chest and the reveal's first
   sentence (Nov 2026). Node only, no browser: every function here is pure arithmetic over `S`, lifted out
   of app.js by name exactly as test-streak-chest.js does, so a rename fails loudly here rather than
   quietly in a reader's account.

   What fails SILENTLY without it:
   · a chest drawn from the wrong share — the level bar's lit chest and the banner both claiming one level,
     or a gilded chest opening as an ordinary one with its gold border on;
   · the shares outgrowing the count after a sync, so a "why" line names a chest the reader does not hold;
   · a deck paying twice, or a ten-card leaf paying at all;
   · a first sentence cut at "c." — the reveal would read "It was made c." and stop.

   Run: node .claude/test-chest-sources.js   (re-run after touching any chestSrc* function, nextChestSrc,
   grantChest, spendChest, maybeDeckChest, deckChestNode or artefactLede) */
const fs = require("fs"), path = require("path");
const src = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");

function grab(name) {
  const i = src.indexOf("function " + name + "(");
  if (i < 0) throw new Error("cannot find " + name + " in app.js — has it been renamed?");
  let depth = 0;
  for (let k = src.indexOf("{", i); k < src.length; k++) {
    if (src[k] === "{") depth++;
    else if (src[k] === "}") { depth--; if (!depth) return src.slice(i, k + 1); }
  }
  throw new Error("unbalanced braces reading " + name);
}
const orderM = /const CHEST_SRC_ORDER = (\[[^\]]*\]);/.exec(src);
if (!orderM) throw new Error("cannot find CHEST_SRC_ORDER in app.js");
const minM = /const DECK_CHEST_MIN = (\d+);/.exec(src);
if (!minM) throw new Error("cannot find DECK_CHEST_MIN in app.js");
const MIN = +minM[1];

const make = new Function("S", "NODE_BY_ID", "LEAVES", "toasts",
  "const CHEST_SRC_ORDER = " + orderM[1] + ";\nconst DECK_CHEST_MIN = " + MIN + ";\n" +
  "function save() {}\nfunction checkAchievements() {}\nfunction toast(t) { toasts.push(t); }\n" +
  "function nodeTitle(n) { return n.title; }\n" +
  "function chestCount() { return Math.max(0, (S.chests | 0)); }\n" +
  "function levelChestCount() { return Math.min(Math.max(0, (S.levelChests | 0)), chestCount()); }\n" +
  "function subtreeCardIds(n) { return n.children ? [...new Set(n.children.flatMap(subtreeCardIds))] : (n.cardIds || []); }\n" +
  "function cardLeaves(id) { return LEAVES.filter((l) => l.cardIds.includes(id)); }\n" +
  ["chestSrcMap", "chestSrcCount", "chestSrcRank", "chestSrcTrim", "nextChestSrc", "chestSrcDeck", "grantChest", "spendChest",
    "deckChestNode", "maybeDeckChest", "artefactLede"].map(grab).join("\n") +
  "\nreturn { grantChest, spendChest, nextChestSrc, chestSrcTrim, maybeDeckChest, artefactLede };");

let pass = 0, fail = 0;
function check(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) pass++; else fail++;
  console.log((ok ? "ok    " : "FAIL  ") + name + "  " + JSON.stringify(got) + (ok ? "" : "   want " + JSON.stringify(want)));
}
function world() {
  const S = { chests: 0, levelChests: 0, chestSrc: {}, cards: {}, deckChests: {} };
  const leaf = (id, n, from) => ({ id, cardIds: Array.from({ length: n }, (_, i) => "c" + (from + i)) });
  const L1 = leaf("L1", 8, 0), L2 = leaf("L2", 8, 8), L3 = leaf("L3", 4, 100);
  const D = { id: "D", title: "The big deck", children: [L1, L2] }, small = { id: "small", title: "A small deck", children: [L3] };
  const C = { id: "C", title: "A collection", children: [D, small] };
  const NODE_BY_ID = {};
  const reg = (n, parent) => { NODE_BY_ID[n.id] = n; n.parentId = parent ? parent.id : null; (n.children || []).forEach((c) => reg(c, n)); };
  reg(C, null);
  const toasts = [];
  return { S, toasts, api: make(S, NODE_BY_ID, [L1, L2, L3], toasts) };
}

console.log("--- the register ---");
{
  const { S, api } = world();
  api.grantChest(1, "badge"); api.grantChest(2, "streak"); api.grantChest(1, "gilded");
  check("grants add to the count and to their share", [S.chests, S.chestSrc], [4, { badge: 1, streak: 2, gilded: 1 }]);
  check("the most special share is drawn first", api.nextChestSrc(), "gilded");
  check("…unless one is asked for", api.nextChestSrc("badge"), "badge");
  api.spendChest("gilded");
  check("spending takes it from its share", [S.chests, S.chestSrc], [3, { badge: 1, streak: 2 }]);
  check("…and the next is the streak's", api.nextChestSrc(), "streak");
  api.grantChest(1);
  check("a chest granted with no source is counted but not shared", [S.chests, S.chestSrc], [4, { badge: 1, streak: 2 }]);
}
console.log("\n--- a level's chest stays on the bar until it is collected ---");
{
  const { S, api } = world();
  api.grantChest(1, "level"); S.levelChests = 1;
  check("the banner draws no level share while the bar holds it", api.nextChestSrc(), "");
  S.levelChests = 0;   // collectLevelChest
  check("…and draws it once the bar has let it go", api.nextChestSrc(), "level");
  check("the level bar's own press asks for it by name", (S.levelChests = 1, api.nextChestSrc("level")), "level");
}
console.log("\n--- a sync can only make the shares too large, and they are trimmed ---");
{
  const { S, api } = world();
  S.chests = 2; S.chestSrc = { level: 2, gilded: 1, badge: 1, junk: 0 };
  api.chestSrcTrim();
  check("trimmed to the count, the least special first", S.chestSrc, { gilded: 1, badge: 1 });
  S.chests = 0; api.chestSrcTrim();
  check("…and to nothing when nothing is held", S.chestSrc, {});
}
console.log("\n--- a finished deck pays one chest ---");
{
  const { S, api, toasts } = world();
  for (let i = 0; i < 15; i++) { S.cards["c" + i] = {}; api.maybeDeckChest("c" + i); }
  check("fifteen of sixteen cards studied pays nothing", S.chests, 0);
  S.cards.c15 = {}; api.maybeDeckChest("c15");
  check("the sixteenth pays one chest, from the deck's share", [S.chests, S.chestSrc], [1, { "deck:D": 1 }]);
  check("…recorded, so it is never paid again", Object.keys(S.deckChests), ["D"]);
  check("…and announced by name", toasts.length === 1 && /The big deck/.test(toasts[0]), true);
  api.maybeDeckChest("c3");
  check("studying a card of a paid deck again pays nothing", S.chests, 1);
  for (let i = 100; i < 104; i++) { S.cards["c" + i] = {}; api.maybeDeckChest("c" + i); }
  check("a deck under " + MIN + " cards pays nothing", S.chests, 1);
}
console.log("\n--- the reveal's first sentence ---");
{
  const { api } = world();
  check("cut at the first full stop", api.artefactLede({ desc: "<b>A gladius</b> is a sword. It was used by Rome." }), "A gladius is a sword.");
  check("…never at c.", api.artefactLede({ desc: "It was made c. 300 BCE in Athens. It survives." }), "It was made c. 300 BCE in Athens.");
  check("…nor at an initial", api.artefactLede({ desc: "Found by J. Smith in 1901. Later lost." }), "Found by J. Smith in 1901.");
  check("…nor inside a number", api.artefactLede({ desc: "It is 2.5 m long. Nothing else." }), "It is 2.5 m long.");
  check("an unbroken description is returned whole", api.artefactLede({ desc: "One sentence only" }), "One sentence only");
  check("…and nothing for nothing", api.artefactLede({}), "");
}
console.log("\n" + (fail ? "FAILED — " + fail + " failed" : "PASSED — all " + pass + " checks passed"));
process.exit(fail ? 1 : 0);
