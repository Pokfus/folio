#!/usr/bin/env node
/* Card plans ↔ data.js — the check that keeps "generate the next <collection> card" working.
 *
 * Thirty collections are grown from a running order in docs/<name>-card-plan.md: the next card is the
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

/* plan slug → [collection id, card prefix, numbering].
   NUMBERING is the set of card numbers the plan is expected to cover, and it exists because a collection
   need not be a thousand cards. Ten of them are: the planned histories all run 1–1000, which is written
   here as the number 1000. Geography is not — its United States deck is fifty states and their fifty
   capitals, and the capitals are numbered 500 higher than their own state so the two subdecks pair by
   number. A missing number is still a hole either way; what differs is which numbers are expected.

   IT IS KEYED BY THE PLAN AND NOT BY THE COLLECTION, which it was until Sep 2026, because a collection
   can carry MORE THAN ONE PLAN: Flags became a third deck of World Geography on request, and its 233
   cards have their own running order, their own numbering and their own format in a file of their own.
   Keyed the old way the two plans could not both be declared, and the leaf check read each plan against
   the WHOLE collection's leaves — so whichever was listed would have reported the other's deck as
   unnamed. What is per COLLECTION is now computed (`plansFor`) rather than assumed. */
const PLANS = {
  greece: ["col-13", "gr-", 1000],
  "world-history": ["col-8", "wh-", 1000],
  rome: ["col-40", "rm-", 1000],
  us: ["col-41", "us-", 1000],
  russia: ["col-42", "ru-", 1000],
  india: ["col-43", "in-", 1000],
  china: ["china", "cnh-", 1000],
  egypt: ["egypt", "eg-", 1000],
  ww2: ["ww2", "ww2-", 1000],
  ww1: ["ww1", "ww1-", 1000],
  architecture: ["arch", "arch-", 1000],
  middleearth: ["middleearth", "mid-", 1000],
  westeros: ["westeros", "wes-", 1000],
  coldwar: ["coldwar", "cw-", 1000],
  vikingage: ["vikingage", "vk-", 1000],
  japan: ["japan", "jp-", 1000],
  psychology: ["psych", "ps-", 1000],
  philosophy: ["phil", "ph-", 1000],
  biology: ["bio", "bio-", 1000],
  dinosaurs: ["dino", "dino-", 1000],
  astronomy: ["astro", "astro-", 1000],
  economics: ["econ", "ec-", 1000],
  mesopotamia: ["mesopotamia", "me-", 1000],
  korea: ["korea", "ko-", 1000],
  france: ["france", "fr-", 1000],
  art: ["art", "art-", 1000],
  /* Politics: East Asia is a COURSE rather than a subject shelf, so its running order cannot be
     written ahead of the lectures it covers — the slides arrive one at a time. The numbering is what
     has been supplied so far, sequential in the order the lectures were covered (30 cards a lecture,
     10 for each set reading), and it is widened as a lecture lands rather than declared at 480 and
     left full of holes. A hole inside the declared range still fails here, which is the point. */
  "politics-east-asia": ["pea", "pea-", [[1, 100]]],
  /* keyed by the COLLECTION id, which for Geography is the country: Geography is a section heading on
     the Collections page rather than a node in the tree (see `COLLECTION_SECTION` in app.js), so the
     plan slug and the collection id differ here where they coincide everywhere else. */
  geography: ["geo-us", "geo-", [[1, 50], [501, 550]]],
  /* The world: 233 countries and territories, and 226 capitals rather than 233. The seven missing
     numbers are not gaps to be filled — each is a capital card that would ask nothing, and each is
     argued in the plan: 604 Hong Kong, 614 Singapore, 667 Macau, 713 Gibraltar, 714 Monaco and
     732 Vatican City are city-states whose capital IS the whole territory, and 671 is Western Sahara,
     whose two claimed capitals are each one side's answer to the disputed question. Written out as
     ranges so that a number quietly going missing still fails here. 751-762 is the supplementary band:
     eleven countries have more than one seat and each seat is its own card, so the first keeps the paired
     number (country + 500) and the extras take the next free band rather than renumbering the deck.
     762 Bujumbura joined it in Sep 2026, when UNdata was found to name Gitega as Burundi's capital. */
  /* Russia: 83 federal subjects, and 80 centres rather than 83. The three missing numbers are not gaps
     to be filled and are not the same refusal — 501 Moscow and 504 Saint Petersburg are cities that are
     themselves federal subjects, so the shape IS the answer (China's four municipalities exactly), while
     570 Khakassia is a DATA refusal: Natural Earth draws Abakan four to five kilometres outside the
     republic and all three published coordinates fall in Krasnoyarsk Krai, so no coordinate reaches a
     shape containing the city and the dot is not snapped. Written out as ranges so that a number quietly
     going missing still fails here. */
  "russia-geography": ["geo-russia", "gru-", [[1, 83], [502, 503], [505, 569], [571, 583]]],
  "world-geography": ["geo-world", "gw-", [[1, 233], [501, 603], [605, 613], [615, 666], [668, 670], [672, 712], [715, 731], [733, 733], [751, 762]]],
  /* China: 31 provincial-level divisions and 27 capitals rather than 31. The four missing numbers are
     not gaps to be filled — 519 Chongqing, 523 Shanghai, 526 Beijing and 527 Tianjin are municipalities,
     cities that are themselves divisions, so a capital card there would shade its own answer. Written
     out as ranges so that a number quietly going missing still fails here. */
  "china-geography": ["geo-china", "gc-", [[1, 31], [501, 518], [520, 522], [524, 525], [528, 531]]],
  /* Flags: 233 cards, one per World Geography COUNTRY card and numbered to match it, so `fl-NNN` is the
     same entity as `gw-NNN`. IT IS THE SECOND PLAN OF `geo-world` — a third DECK of that collection
     rather than one of its own, on request (Sep 2026) — which is why this table is keyed by plan; see
     the note above it. The range is unbroken even though `fl-036` Afghanistan is deferred: a deferred
     card is one the plan LISTS and has not shipped, exactly as `gw-596` Jerusalem is, and leaving the
     number out of the range here would stop this suite ever noticing if it did ship. The natural
     extension (subnational flags at `fl-501`+) is deliberately NOT declared until it lands, on the
     Politics rule — widen a numbering as work arrives rather than declaring it full of holes. */
  flags: ["geo-world", "fl-", [[1, 233]]],
  /* Draw the flags: the Flags deck run backwards, and the FOURTH deck of `geo-world` — so this is the
     collection's third plan, which is the arrangement the keying note above exists for. `fd-NNN` is the
     same entity as `fl-NNN` and as `gw-NNN`: in this collection the NUMBER is the entity and the PREFIX
     is the question asked about it, which is why it is not numbered +500 like the capitals (there the
     number means a DIFFERENT entity). The range is unbroken even though the same four deferrals apply
     — 036, 171, 180 and 218, each of which has no flag Folio can show and so nothing to draw. */
  "flags-draw": ["geo-world", "fd-", [[1, 233]]],
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

/* ---- data.js's own card array ---- */
/* A HOLE IN `CARD_DATA` IS INVISIBLE TO EVERY OTHER CHECK AND BREAKS THE WHOLE SITE (Sep 2026).
 * A stray second comma in the array literal — `…}, ,{…}` — is VALID JavaScript: it makes a sparse
 * array, so `node --check` passes, and `map`/`forEach`/`filter` all SKIP holes, so the card count,
 * the citation audits and every suite here went on reporting healthy figures. app.js builds
 * `CARD_BY_ID` with an iterator, which does NOT skip a hole: it yields `undefined`, `new Map` throws
 * "Iterator value undefined is not an entry object" at boot, and the reader gets a page with nothing
 * on it but the nav bar. Found when add-images.js threw the same error; it had shipped in a commit
 * whose browser check had been run BEFORE the diff was tidied. Iterate with a plain index — a `for
 * … of` here would skip nothing but a `.map` would, which is the whole point. */
{
  const n = CARDS.length;
  const holes = [];
  for (let i = 0; i < n; i++) if (!(i in CARDS)) holes.push(i);
  is(holes.length === 0, "CARD_DATA has no holes  (a stray comma makes a sparse array and breaks boot)",
     holes.length ? holes.length + " at index " + holes.slice(0, 5).join(", ") : n + " entries");
  const ids = [];
  for (let i = 0; i < n; i++) if (i in CARDS) ids.push(CARDS[i].id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  is(dupes.length === 0, "every card id in data.js is unique",
     dupes.length ? [...new Set(dupes)].slice(0, 5).join(", ") : ids.length + " ids");
}

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

/* the plans of one collection — computed rather than assumed, since a collection may carry more than
   one (World Geography carries `world-geography` and `flags`). */
const plansFor = (colId) => Object.entries(PLANS).filter(([, v]) => v[0] === colId);

for (const [slug, [colId, prefix, numbering]] of Object.entries(PLANS)) {
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

  /* and every leaf of this collection must be named by ONE OF ITS PLANS. The union is what makes a
     collection with two plans checkable: read against this plan alone, `flags-world` would report as
     unnamed by `world-geography` and the two World Geography decks as unnamed by `flags`, and the
     only way to pass would be to stop declaring one of them. A leaf named by NO plan still fails,
     which is the fault this check exists for. */
  const treeLeaves = [];
  (function walk(n) { if (n.children) n.children.forEach(walk); else treeLeaves.push(n.id); })(col);
  const siblings = plansFor(colId);
  const named = new Set();
  for (const [s2, [, p2]] of siblings) { const pl = readPlan(s2, p2); if (pl) pl.decks.forEach((d) => named.add(d.id)); }
  const unnamed = treeLeaves.filter((d) => !named.has(d));
  is(!unnamed.length, `${label}: every leaf deck in data.js is named by a plan of this collection`,
     unnamed.length ? "unnamed: " + unnamed.join(", ")
       : `${treeLeaves.length} leaves, ${siblings.length} plan${siblings.length === 1 ? "" : "s"}`);

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

    /* ...at a number the running order actually names, and — where the plan names the ANSWER
       rather than a subject to research — as the city the plan put there.

       Both halves exist because they failed silently in Sep 2026: eight capitals were written from
       a "next card is" line at the head of the plan instead of from the running order, so Asmara
       shipped at `gw-613` (Brazzaville's slot), Vilnius at `gw-615` (Copenhagen's), and Zagreb at
       `gw-614` — one of the SEVEN NUMBERS THE PLAN DELIBERATELY LEAVES UNUSED. Nothing complained:
       every card was correct in itself, cited, at the bar and filed in the right deck, and the only
       symptom was that the plan and the deck had quietly stopped describing the same thing. A card
       id is a permanent address, so the drift is unrecoverable once a reader holds the card.

       The number check is general to all nineteen collections. The name check applies only where a
       plan line reads `Name  [Country]`, which is the three GEOGRAPHY plans: elsewhere a topic is a
       subject to research and deliberately is not the answer term. A DEFERRED slot holds no card. */
    const byNum = new Map(plan.cards.map((c) => [c.n, c.topic]));
    const offPlan = shipped.filter((c) => !byNum.has(+c.id.slice(prefix.length)));
    is(!offPlan.length, `${label}: every shipped card's number is in the running order`,
       offPlan.length ? "not planned: " + offPlan.map((c) => c.id).slice(0, 6).join(", ") : "");

    const fold = (x) => x.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    const wrong = [];
    for (const c of shipped) {
      const topic = byNum.get(+c.id.slice(prefix.length));
      if (topic === undefined) continue;
      const m = topic.match(/^(.+?)\s+\[(.+)\]$/);
      if (!m) continue;
      if (/^DEFERRED$/i.test(m[1])) { wrong.push(`${c.id} is DEFERRED in the plan`); continue; }
      if (fold(m[1]) !== fold(c.answerText || c.answer || "")) {
        wrong.push(`${c.id} is "${c.answerText || c.answer}", the plan says "${m[1]}"`);
      }
    }
    is(!wrong.length, `${label}: every shipped card is the one the plan puts at that number`,
       wrong.length ? wrong.slice(0, 6).join("; ") : `${shipped.length} checked`);
  }
  console.log("");
}

/* ---- CLAUDE.md's index table must match the tree ----
   The table is the lookup a fresh session reads before anything else, so a stale deck count there is
   worse than no table. Note the plan filename may contain a DIGIT (ww2-card-plan.md) — a `[a-z-]+`
   pattern silently skips that row, which is how a first draft of this check "passed" on nine of ten. */
const rows = [...CLAUDE.matchAll(/^\| ([^|]+?) \| `([a-z0-9-]+)` \| `([a-z0-9-]+)` \| `(docs\/[a-z0-9-]+\.md)` \| (\d+) \/ (\d+) \|/gm)];
/* A ROW PER PLAN, not per collection: World Geography has two rows because it has two plans, and the
   `id` column repeats for both, which is the truth about it rather than a duplicate. */
is(rows.length === Object.keys(PLANS).length, "CLAUDE.md's index table has a row per plan",
   `${rows.length} rows for ${Object.keys(PLANS).length} plans`);
for (const [, name, id, prefix, planFile, decks, leaves] of rows) {
  const col = TREE.collections.find((c) => c.id === id);
  if (!col) { no(`index table: ${id} is a collection in data.js`); continue; }
  const lv = []; (function w(n) { n.children ? n.children.forEach(w) : lv.push(n.id); })(col);
  const nd = col.children ? col.children.length : 0;
  is(+decks === nd && +leaves === lv.length, `index table: ${name.trim()} deck counts match the tree`,
     `table ${decks}/${leaves}, tree ${nd}/${lv.length}`);
  is(fs.existsSync(path.join(ROOT, planFile)), `index table: ${name.trim()} plan file exists`, planFile);
  /* the row is joined to its PLAN by the file name it names, since a collection may have two rows */
  const rowSlug = planFile.replace(/^docs\/|-card-plan\.md$/g, "");
  is(PLANS[rowSlug] && PLANS[rowSlug][0] === id && PLANS[rowSlug][1] === prefix,
     `index table: ${name.trim()} names its own plan, collection and prefix`, `${rowSlug} ${id} ${prefix}`);
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
const prefixes = Object.values(PLANS).map(([, p]) => p);   // [colId, prefix, numbering]
const clash = prefixes.filter((p, i) => prefixes.some((q, j) => i !== j && (p.startsWith(q) || q.startsWith(p))));
is(!clash.length, "no card prefix is a prefix of another", clash.join(", "));

/* ---- every leaf in the whole tree belongs to a planned collection ----
   The set is of COLLECTION ids, read out of the values: the table is keyed by plan slug (see its own
   note), and reading the keys here made every World History deck an orphan the moment it was rekeyed. */
const planned = new Set(Object.values(PLANS).map(([c]) => c));
const orphan = [...leafOf.entries()].filter(([, c]) => !planned.has(c)).map(([l]) => l);
is(!orphan.length, "every leaf deck in data.js belongs to a collection with a plan",
   orphan.length ? orphan.slice(0, 6).join(", ") : `${leafOf.size} leaves across ${TREE.collections.length} collections`);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
