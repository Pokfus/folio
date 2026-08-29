#!/usr/bin/env node
/* Card plans ↔ data.js — the check that keeps "generate the next <collection> card" working.
 *
 * Sixteen collections are grown from a running order in docs/<name>-card-plan.md: the next card is the
 * lowest id not yet in data.js, and its deck comes from the plan. That workflow rests on agreements
 * nothing else verifies, and every one of them fails SILENTLY:
 *
 *   · a plan naming a deck id that is not in data.js  → add-card.js files the card in the FIRST leaf
 *     of the whole tree, which is cn-myth, in China. Nothing throws; the card is simply in the wrong
 *     collection, and stays there until somebody notices.
 *   · a leaf deck in data.js that no plan names       → cards can never be routed to it.
 *   · a duplicate id in a running order               → looking the number up finds two entries.
 *   · a gap in a running order                        → the "next id" command hands back a number the
 *     plan cannot explain.
 *   · a plan with no CLAUDE.md bullet                  → a fresh session does not know it exists.
 *
 * No browser and no dependencies — this is arithmetic over two files.
 *
 * TWO THINGS THIS FILE LEARNED THE HARD WAY, both of which made a first draft report faults that
 * were not there:
 *   1. A DECK CAN BE A LEAF. `leafDecks()` treats any node with a `cardIds` array as a leaf, so a
 *      collection may carry a "flat deck" — a top-level deck with no subdecks, named at `##` in its
 *      plan rather than `###` (gr-iron, ru-federation, cn-myth). Read both heading levels.
 *   2. A PLAN MAY CARRY AN APPENDIX. docs/world-history-card-plan.md ends with the 2026-08-04
 *      renumbering record, which lists 109 ids in the OLD numbering under its own `#`-level heading.
 *      Those are history, not the running order. Stop reading the list at the next `# ` heading.
 *
 * ONE ASSERTION WAS DELIBERATELY NARROWED (Aug 2026, when CLAUDE.md's eleven per-collection
 * write-ups were split out to the plan files). It used to demand the literal string
 * `const id='<prefix>'+String(i).padStart(3,'0')` for EVERY collection — eleven near-identical copies
 * of one shell line — which is the fault this repo already records twice (test-tour.js pinning a stale
 * button label, test-layout.js a stale heading): a hard-coded copy in a test is not an assertion about
 * the thing, it is a copy of it that nothing keeps in step. The RULE is "there is a working way to
 * compute the next id for every collection", and that is command SHAPE plus PREFIX. The shape is now
 * asserted once, and must be a working command; the prefix is asserted per collection against the
 * index table. Nothing is lost and a mistyped prefix still fails.
 *
 * Run: node .claude/test-card-plans.js
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
global.window = {};
require(path.join(ROOT, "data.js"));
const TREE = window.COLLECTION_TREE;
const CARDS = window.CARD_DATA;
const CLAUDE = fs.readFileSync(path.join(ROOT, "CLAUDE.md"), "utf8");
const APP = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");

/* collection id → [plan slug, card prefix, numbering].
   NUMBERING is the set of card numbers the plan is expected to cover, and it exists because a collection
   need not be a thousand cards. Ten of them are: the planned histories all run 1–1000, which is written
   here as the number 1000. Geography is not — its United States deck is fifty states and their fifty
   capitals, and the capitals are numbered 500 higher than their own state so the two subdecks pair by
   number. A missing number is still a hole either way; what differs is which numbers are expected. */
const PLANS = {
  "col-13": ["greece", "gr-", 1000],
  "col-8": ["world-history", "wh-", 1000],
  "col-40": ["rome", "rm-", 1000],
  "col-41": ["us", "us-", 1000],
  "col-42": ["russia", "ru-", 1000],
  "col-43": ["india", "in-", 1000],
  china: ["china", "cnh-", 1000],
  egypt: ["egypt", "eg-", 1000],
  ww2: ["ww2", "ww2-", 1000],
  japan: ["japan", "jp-", 1000],
  psych: ["psychology", "ps-", 1000],
  phil: ["philosophy", "ph-", 1000],
  bio: ["biology", "bio-", 1000],
  dino: ["dinosaurs", "dino-", 1000],
  korea: ["korea", "ko-", 1000],
  /* keyed by the COLLECTION id, which for Geography is the country: Geography is a section heading on
     the Collections page rather than a node in the tree (see `COLLECTION_SECTION` in app.js), so the
     plan slug and the collection id differ here where they coincide everywhere else. */
  "geo-us": ["geography", "geo-", [[1, 50], [501, 550]]],
  /* The world: 233 countries and territories, and 226 capitals rather than 233. The seven missing
     numbers are not gaps to be filled — each is a capital card that would ask nothing, and each is
     argued in the plan: 604 Hong Kong, 614 Singapore, 667 Macau, 713 Gibraltar, 714 Monaco and
     732 Vatican City are city-states whose capital IS the whole territory, and 671 is Western Sahara,
     whose two claimed capitals are each one side's answer to the disputed question. Written out as
     ranges so that a number quietly going missing still fails here. 751-761 is the supplementary band:
     ten countries have more than one seat and each seat is its own card, so the first keeps the paired
     number (country + 500) and the extras take the next free band rather than renumbering the deck. */
  "geo-world": ["world-geography", "gw-", [[1, 233], [501, 603], [605, 613], [615, 666], [668, 670], [672, 712], [715, 731], [733, 733], [751, 761]]],
};
// a numbering as a flat list of the numbers it expects, in order
const expand = (num) => {
  const out = [];
  if (typeof num === "number") { for (let i = 1; i <= num; i++) out.push(i); return out; }
  for (const [a, b] of num) for (let i = a; i <= b; i++) out.push(i);
  return out;
};
const numLabel = (num) => (typeof num === "number" ? "1–" + num : num.map(([a, b]) => a + "–" + b).join(" and "));

let pass = 0, fail = 0;
const ok = (m, extra) => { pass++; console.log("ok    " + m + (extra ? "  " + extra : "")); };
const no = (m, extra) => { fail++; console.log("FAIL  " + m + (extra ? "  " + extra : "")); };
const is = (cond, m, extra) => (cond ? ok(m, extra) : no(m, extra));

/* ---- the tree ---- */
const leafOf = new Map();   // leaf id → collection id
const nodeOf = new Map();   // any node id → collection id
for (const col of TREE.collections) {
  (function walk(n) {
    nodeOf.set(n.id, col.id);
    if (n.children) n.children.forEach(walk);
    else leafOf.set(n.id, col.id);
  })(col);
}

/* ---- read a plan ---- */
function readPlan(slug, prefix) {
  const file = path.join(ROOT, "docs", slug + "-card-plan.md");
  if (!fs.existsSync(file)) return null;
  const lines = fs.readFileSync(file, "utf8").split("\n");

  // The running order begins at "# The list" and ends at the next `# ` heading (an appendix).
  let from = lines.findIndex((l) => /^#\s+The list\s*$/.test(l));
  if (from < 0) from = 0; else from += 1;
  let to = lines.length;
  for (let i = from; i < lines.length; i++) if (/^#\s+(?!#)/.test(lines[i])) { to = i; break; }
  const body = lines.slice(from, to);

  // A deck heading is `## Title — \`id\`` or `### Title — \`id\`` — a flat deck uses the shallower one.
  const decks = [];
  for (const ln of body) {
    const m = ln.match(/^#{2,3}\s+(.+?)\s+—\s+`([a-z0-9-]+)`\s*$/);
    if (m) decks.push({ id: m[2], title: m[1], n: 0 });
  }
  const rx = new RegExp("^\\s{2,}" + prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(\\d{3,4})\\s+(\\S.*?)\\s*$");
  const cards = [];
  for (const ln of body) {
    const m = ln.match(rx);
    if (m) { cards.push({ n: +m[1], topic: m[2] }); if (decks.length) decks[decks.length - 1].n++; }
  }
  return { file, decks, cards, lines };
}

console.log("Card plans ↔ data.js\n");

for (const [colId, [slug, prefix, numbering]] of Object.entries(PLANS)) {
  const col = TREE.collections.find((c) => c.id === colId);
  const label = `${slug} (${colId})`;
  console.log(`— ${label}`);
  if (!col) { no(`${label}: collection is in data.js`); continue; }

  const plan = readPlan(slug, prefix);
  if (!plan) { no(`${label}: plan file exists`); continue; }

  /* every id the plan names must be a node of THIS collection.
     Deliberately NOT "must be a leaf": a `##` heading names a branch deck in most plans and a flat
     deck (a leaf) in some, and only the tree knows which. What must hold is that the id exists here
     and that no LEAF goes unnamed — asserted next. */
  const unknown = plan.decks.filter((d) => !nodeOf.has(d.id));
  const foreign = plan.decks.filter((d) => nodeOf.has(d.id) && nodeOf.get(d.id) !== colId);
  is(!unknown.length, `${label}: every deck the plan names is in data.js`,
     unknown.length ? "missing: " + unknown.map((d) => d.id).join(", ") : `${plan.decks.length} named`);
  is(!foreign.length, `${label}: ...and all of them belong to this collection`,
     foreign.length ? "elsewhere: " + foreign.map((d) => d.id + "→" + nodeOf.get(d.id)).join(", ") : "");

  /* and every leaf of this collection must be named by the plan */
  const treeLeaves = [];
  (function walk(n) { if (n.children) n.children.forEach(walk); else treeLeaves.push(n.id); })(col);
  const named = new Set(plan.decks.map((d) => d.id));
  const unnamed = treeLeaves.filter((d) => !named.has(d));
  is(!unnamed.length, `${label}: every leaf deck in data.js is named by the plan`,
     unnamed.length ? "unnamed: " + unnamed.join(", ") : `${treeLeaves.length} leaves`);

  /* the running order: exactly the numbers this collection declares, contiguous, no duplicates */
  const ns = plan.cards.map((c) => c.n);
  const uniq = new Set(ns);
  const dupes = ns.filter((n, i) => ns.indexOf(n) !== i);
  is(!dupes.length, `${label}: no duplicate ids in the running order`,
     dupes.length ? "dupes: " + [...new Set(dupes)].slice(0, 8).join(", ") : `${ns.length} cards`);
  const want = expand(numbering), wantSet = new Set(want);
  const gaps = want.filter((n) => !uniq.has(n));
  is(!gaps.length, `${label}: the running order covers ${numLabel(numbering)} with no gaps`,
     gaps.length ? `${gaps.length} missing, first ${gaps.slice(0, 5).join(",")}` : "");
  // …and nothing OUTSIDE it, or a mistyped number reads as a card the plan does not have
  const stray = ns.filter((n) => !wantSet.has(n));
  is(!stray.length, `${label}: the running order names no number outside ${numLabel(numbering)}`,
     stray.slice(0, 8).join(", "));

  /* topics: no two cards in one plan naming the same subject */
  const seen = new Map(); const same = [];
  for (const c of plan.cards) {
    const k = c.topic.toLowerCase();
    if (seen.has(k)) same.push(`${prefix}${seen.get(k)}/${prefix}${c.n} "${c.topic}"`);
    else seen.set(k, c.n);
  }
  is(!same.length, `${label}: no two cards name the same topic`, same.slice(0, 3).join("; "));

  /* CLAUDE.md must carry the plan. The "next id" COMMAND is asserted once, below, as a template:
     it used to be pinned per collection, which was eleven near-identical copies of one shell line and
     is the "a hard-coded label in a test is not an assertion about the label" fault this repo already
     records twice (test-tour.js, test-layout.js). The rule — "there is a working way to compute the
     next id for every collection" — is command shape + prefix, and the prefix is asserted per
     collection against the index table at "index table: <name> prefix is right". */
  is(CLAUDE.includes(`docs/${slug}-card-plan.md`), `${label}: CLAUDE.md names the plan file`);

  /* the collection has a hue. An id that is a valid JS identifier is written bare in COLL_THEME
     (china, egypt, ww2, japan — note ww2 contains a digit and is still bare); one with a hyphen
     (col-8, col-41) has to be quoted. */
  const bare = /^[A-Za-z_$][\w$]*$/.test(colId);
  const key = bare ? `${colId}:` : `"${colId}":`;
  is(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*\\{\\s*bg").test(APP),
     `${label}: COLL_THEME has a hue`);

  /* shipped cards, if any, sit in this collection */
  const shipped = CARDS.filter((c) => c.id.startsWith(prefix));
  if (shipped.length) {
    const ids = new Set(shipped.map((c) => c.id));
    const placed = new Set();
    (function walk(n) { (n.cardIds || []).forEach((i) => placed.add(i)); (n.children || []).forEach(walk); })(col);
    const stray = [...ids].filter((i) => !placed.has(i));
    is(!stray.length, `${label}: every shipped card sits in this collection's tree`,
       stray.length ? "stray: " + stray.slice(0, 5).join(", ") : `${shipped.length} cards`);
  }
  console.log("");
}

/* ---- CLAUDE.md's index table must match the tree ----
   The table is the lookup a fresh session reads before anything else, so a stale deck count there is
   worse than no table. Note the plan filename may contain a DIGIT (ww2-card-plan.md) — a `[a-z-]+`
   pattern silently skips that row, which is how a first draft of this check "passed" on nine of ten. */
const rows = [...CLAUDE.matchAll(/^\| ([^|]+?) \| `([a-z0-9-]+)` \| `([a-z0-9-]+)` \| `(docs\/[a-z0-9-]+\.md)` \| (\d+) \/ (\d+) \|/gm)];
is(rows.length === Object.keys(PLANS).length, "CLAUDE.md's index table has a row per collection",
   `${rows.length} rows for ${Object.keys(PLANS).length} collections`);
for (const [, name, id, prefix, planFile, decks, leaves] of rows) {
  const col = TREE.collections.find((c) => c.id === id);
  if (!col) { no(`index table: ${id} is a collection in data.js`); continue; }
  const lv = []; (function w(n) { n.children ? n.children.forEach(w) : lv.push(n.id); })(col);
  const nd = col.children ? col.children.length : 0;
  is(+decks === nd && +leaves === lv.length, `index table: ${name.trim()} deck counts match the tree`,
     `table ${decks}/${leaves}, tree ${nd}/${lv.length}`);
  is(fs.existsSync(path.join(ROOT, planFile)), `index table: ${name.trim()} plan file exists`, planFile);
  is(PLANS[id] && PLANS[id][1] === prefix, `index table: ${name.trim()} prefix is right`, prefix);
}

/* ---- the "next id" command ----
   Asserted ONCE, as a template, and only because the prefix is checked per collection above: the
   command is shape + prefix, so pinning eleven copies of the shape guards nothing the pair does not.
   It must still be a WORKING command — it loads data.js, reads CARD_DATA, pads to three digits, and
   its worked example uses a prefix some collection actually has (an example naming a prefix nothing
   uses is a command nobody can substitute into). */
const nextCmd = (CLAUDE.match(/^ {4}node -e "global\.window=\{\};require\('\.\/data\.js'\);.*$/m) || [""])[0];
is(/window\.CARD_DATA/.test(nextCmd) && /padStart\(3,'0'\)/.test(nextCmd) && /!h\.has\(id\)/.test(nextCmd),
   'CLAUDE.md carries a working "next id" command', nextCmd ? "found" : "no command block");
const eg = (nextCmd.match(/const id='([a-z0-9-]+)'/) || [])[1];
is(Object.values(PLANS).some(([, p]) => p === eg),
   'the "next id" command\'s example prefix is a real one', eg || "none");

/* ---- cross-plan: a card prefix must belong to exactly one plan ---- */
const prefixes = Object.values(PLANS).map(([, p]) => p);
const clash = prefixes.filter((p, i) => prefixes.some((q, j) => i !== j && (p.startsWith(q) || q.startsWith(p))));
is(!clash.length, "no card prefix is a prefix of another", clash.join(", "));

/* ---- every leaf in the whole tree belongs to a planned collection ---- */
const planned = new Set(Object.keys(PLANS));
const orphan = [...leafOf.entries()].filter(([, c]) => !planned.has(c)).map(([l]) => l);
is(!orphan.length, "every leaf deck in data.js belongs to a collection with a plan",
   orphan.length ? orphan.slice(0, 6).join(", ") : `${leafOf.size} leaves across ${TREE.collections.length} collections`);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
