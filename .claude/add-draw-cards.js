#!/usr/bin/env node
/*
 * add-draw-cards.js — build a DRAW card from its Flags twin.
 *
 *   node .claude/add-draw-cards.js <batch.json> [--dry]
 *
 * The batch is `{ "cards": { "fd-001": {}, "fd-002": { "question": "…" } } }`, keyed by the DRAW card's
 * id. Almost every entry is empty: the card is derived.
 *
 * WHAT A DRAW CARD IS. `fl-NNN` shows a flag and asks whose it is; `fd-NNN` is the same entity asked
 * backwards — it names the country and the reader draws the flag from memory on a pad, reveals it, and
 * grades themselves. It is the reverse direction of a language deck's vocabulary note, built as a card
 * of its own because curated cards have no note layer to hang a second template on. See
 * docs/flags-card-plan.md and the DRAW CARDS block in app.js.
 *
 * THE NUMBER IS THE ENTITY AND THE PREFIX IS THE QUESTION, which is what settles the numbering. `gw-007`,
 * `fl-007` and `fd-007` are all Brazil: the shape, the flag named, and the flag drawn. The +500 pairing
 * the geography section uses elsewhere (`gw-507` is Brasília, `geo-501` is Alabama's capital) means a
 * DIFFERENT entity at the same number, so reusing it here would have made `fl-507` mean Brazil while
 * `gw-507` meant Brasília — and `check-flag-twins.js`, which pairs `fl-NNN` with `gw-NNN` by arithmetic,
 * would have compared a drawing card against a capital. A prefix of its own costs one row in
 * `test-card-plans.js` and leaves `fl-501`+ free for the subnational flags that plan reserves it for.
 *
 * IT DOES NOT WRITE `data.js` ITSELF — it hands each finished card to `add-card.js`, exactly as
 * `add-flag-cards.js` does and for that tool's stated reason: every guard `add-card.js` carries then runs
 * on every card built here, including the `drawCard` block itself, rather than being re-implemented in a
 * second, weaker copy that goes stale the first time one of them changes.
 *
 * WHAT IT COPIES: answer, answerText, answerDate, abstract, sources, facts, difficulty, category and the
 * credited `answerFlag` — the whole answer side of its twin, which is itself the whole answer side of the
 * `gw-` card, on the standing request that the flags decks reuse World Geography's. It copies the flag's
 * `alt` UNCHANGED: on a flag card that description is the question for a reader who cannot see the
 * picture and may not name the country, and here it describes a picture that only appears once the answer
 * is already out — so the flag card's own rule is the stricter of the two and there is nothing to relax.
 * `tags` gains `drawing`; tag 1 stays `place`, the kind its twin and 233 others lead with.
 *
 * Not part of the site.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const os = require("os");

const ROOT = path.join(__dirname, "..");
const DECK = "flags-draw";
const COPY = ["answer", "answerText", "answerDate", "abstract", "sources", "facts", "difficulty", "category"];
/* THE NAME LEADS AND TAKES NO ARTICLE, which is a rule rather than a preference. `answerText` carries no
   article anywhere on this site ("United States", "Netherlands", "Gambia", "Bahamas"), so any prompt of
   the shape "the flag of <name>" is wrong on about thirty of the 229 and right on the rest — and the only
   fix for that is a hand-kept table of which names take "the", which is a table that can be wrong.
   Leading with the name and an em dash needs no table and cannot be wrong on any of them; it also puts
   the thing being asked about at the front of the card, which is where a reader looks first.
   It is 10 words plus the country's own, and the longest answer term in the deck is five words
   ("Democratic Republic of the Congo", "Saint Vincent and the Grenadines"), so it runs 11-15 against the
   5-20 a picture card's prompt is held to. Measured rather than assumed; re-measure if it is reworded. */
const prompt = (name) => name + " \u2014 draw the flag from memory, then reveal it to compare.";

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const file = args.find((a) => !a.startsWith("--"));
if (!file) { console.error("usage: node .claude/add-draw-cards.js <batch.json> [--dry]"); process.exit(1); }

const batch = JSON.parse(fs.readFileSync(file, "utf8"));
const want = batch && batch.cards;
if (!want || typeof want !== "object" || Array.isArray(want)) {
  console.error('ERROR: the batch is { "cards": { "fd-001": {}, … } }, keyed by the DRAW card id.');
  process.exit(1);
}

global.window = {};
const { loadCards } = require("./card-io.js");
const cards = loadCards().cards;
const byId = new Map(cards.map((c) => [c.id, c]));

/* THE WHOLE BATCH IS VALIDATED BEFORE ANYTHING IS WRITTEN — the rule every batch helper here follows:
   a half-applied batch is worse than a refused one, because the half that landed looks finished. */
const built = [];
const bad = [];
for (const [id, spec] of Object.entries(want)) {
  const m = /^fd-(\d{3})$/.exec(id);
  if (!m) { bad.push(`${id}: not an fd-NNN id`); continue; }
  if (byId.has(id)) { bad.push(`${id}: already in data.js`); continue; }
  const twinId = "fl-" + m[1];
  const twin = byId.get(twinId);
  if (!twin) { bad.push(`${id}: its twin ${twinId} is not in data.js — a draw card is that card run backwards`); continue; }
  if (twin.flagCard !== true) { bad.push(`${id}: ${twinId} is not a flag card`); continue; }

  const fl = twin.answerFlag;
  if (!fl || !String(fl.src || "").trim() || !String(fl.credit || "").trim()) {
    bad.push(`${id}: ${twinId} carries no credited answerFlag — the flag IS this card's answer`);
    continue;
  }
  const ansT = String(twin.answerText || "").trim();
  if (!ansT) { bad.push(`${id}: ${twinId} has no answerText, so the prompt cannot name what to draw`); continue; }

  const q = String((spec && spec.question) || "").trim() || prompt(ansT);
  const card = { id: id, num: Number(m[1]), drawCard: true, question: q, questions: [] };
  for (const f of COPY) if (twin[f] != null) card[f] = twin[f];
  for (const f of ["traditional", "hanzi", "pinyin", "translations", "citation"]) card[f] = twin[f] == null ? "" : twin[f];
  card.answerFlag = { src: fl.src, credit: fl.credit, alt: fl.alt };
  /* `drawing` joins the subject areas; tag 1 stays the twin's KIND, which 233 other cards also lead
     with. IT REFUSES RATHER THAN TRUNCATING when the twin is already at the cap: dropping a tag is a
     judgement about which of them groups least, and a tool that made it silently would lose a country
     or a region from one card in a way nothing downstream could report. Supply the whole list in the
     batch entry instead. Measured when this was written: exactly ONE of the 229 twins was at 8 —
     `fl-223` Wallis and Futuna, whose list carries the kind twice (`state` … `place`). */
  let tags = Array.isArray(spec && spec.tags) ? spec.tags.slice() : null;
  if (!tags) {
    tags = Array.isArray(twin.tags) ? twin.tags.slice() : [];
    if (!tags.includes("drawing")) tags.splice(1, 0, "drawing");
  }
  if (tags.length > 8) {
    bad.push(`${id}: ${twinId} already carries ${twin.tags.length} tags, so adding "drawing" is ${tags.length} ` +
      `and the cap is 8. Give this entry its own \`tags\` list: [${twin.tags.map((t) => JSON.stringify(t)).join(", ")}]`);
    continue;
  }
  card.tags = tags;

  built.push({ id, card, twinId, q });
}

if (bad.length) {
  console.error(`REFUSED — ${bad.length} of ${Object.keys(want).length} entries could not be built:`);
  bad.forEach((b) => console.error("  " + b));
  process.exit(1);
}

built.sort((a, b) => a.id.localeCompare(b.id));
console.log(`${built.length} draw card${built.length === 1 ? "" : "s"} built from their twins:\n`);
for (const b of built) console.log(`  ${b.id}  (from ${b.twinId})  ${b.q}`);
if (dry) { console.log("\n--dry: nothing written."); process.exit(0); }

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "drawcards-"));
let wrote = 0;
for (const b of built) {
  const f = path.join(tmp, b.id + ".json");
  fs.writeFileSync(f, JSON.stringify(b.card, null, 1));
  try {
    execFileSync(process.execPath, [path.join(__dirname, "add-card.js"), f, DECK, "--no-image"], { cwd: ROOT, encoding: "utf8" });
    wrote++;
  } catch (e) {
    console.error(`\nADD-CARD REFUSED ${b.id} — ${wrote} card${wrote === 1 ? "" : "s"} of ${built.length} were written before it:`);
    console.error((e.stdout || "") + (e.stderr || ""));
    process.exit(1);
  }
}
console.log(`\n${wrote} card${wrote === 1 ? "" : "s"} added to ${DECK}. Now run:`);
console.log("  node .claude/test-draw-cards.js");
console.log("  node .claude/check-questions.js && node .claude/check-style.js && node .claude/test-card-plans.js");
