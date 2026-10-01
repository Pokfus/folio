#!/usr/bin/env node
/*
 * add-flag-cards.js — build a FLAG card from its World Geography twin.
 *
 *   node .claude/add-flag-cards.js <batch.json> [--dry]
 *
 * The batch is `{ "cards": { "fl-001": { "alt": "…" }, "fl-002": {} } }`, keyed by the FLAG card's id.
 *
 * WHY THIS IS A TOOL AND NOT AN EDIT. The Flags collection is World Geography's twin id for id —
 * `fl-NNN` is the same entity as `gw-NNN` and its whole answer side is `gw-NNN`'s, on request ("the
 * answer side of the card can be directly the same as the ones in the World geography collection"). So
 * a card here is a COPY of nine fields plus a prompt, a boolean and a description of the flag, and doing
 * that by hand 233 times is 233 chances to copy eight of the nine. See docs/flags-card-plan.md.
 *
 * IT DOES NOT WRITE `data.js` ITSELF — it hands each finished card to `add-card.js`, which is what
 * appends it, registers it in the deck, bumps the collection total and re-parses the file. That is
 * deliberate: every guard that tool carries then runs on every card here — the article rule, the tags
 * bounds, the difficulty refusal, the abstract's length and shape, the citation bar, the marker rules
 * and the `flagCard` block itself. A builder that wrote `data.js` directly would be a second, weaker
 * copy of all of them, and the copy that goes stale is the one nobody editing a flag has reason to open.
 *
 * THE ALT IS THE ONE FIELD IT WILL NOT INVENT, AND IT IS ALSO THE ONE IT CAN USUALLY DERIVE. 115 of the
 * 233 `gw-` twins already carry a written description, and every one of them opens "The flag of
 * <country>: " — which is right beside an answer already on screen and hands the answer over on a front.
 * So an entry with no `alt` takes the twin's with that prefix CUT and its first letter capitalised, and
 * the derived text is PRINTED for reading. Where the cut leaves the answer term standing in the body the
 * tool REFUSES rather than trimming further: `gw-074` Zimbabwe's names the Zimbabwe Bird, which is the
 * emblem's own name, and one case in 115 is the reason to look at all rather than a licence to skip
 * looking.
 *
 * WHAT IT COPIES, and the plan argues each: answer, answerText, answerDate, abstract, sources, facts,
 * tags, difficulty, category. NOT `image` (the flag is this card's picture, and copying 233 photographs
 * across two collections would make 233 deliberate duplicate pairs), NOT `map` (a `map` block makes a
 * MAP card, whose window goes on the front and shades the answer), NOT `questions` (the flag is the
 * clue). `tags` gains `flag`; tag 1 stays `place`, the kind the twin leads with.
 *
 * Not part of the site.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const os = require("os");

const ROOT = path.join(__dirname, "..");
const DECK = "flags-world";
const PROMPT = 'The country or territory whose flag is shown is <span class="blank">_____</span>.';
const COPY = ["answer", "answerText", "answerDate", "abstract", "sources", "facts", "difficulty", "category"];

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const file = args.find((a) => !a.startsWith("--"));
if (!file) { console.error("usage: node .claude/add-flag-cards.js <batch.json> [--dry]"); process.exit(1); }

const batch = JSON.parse(fs.readFileSync(file, "utf8"));
const want = batch && batch.cards;
if (!want || typeof want !== "object" || Array.isArray(want)) {
  console.error('ERROR: the batch is { "cards": { "fl-001": { "alt": "…" }, … } }, keyed by the FLAG card id.');
  process.exit(1);
}

global.window = {};
const { loadCards } = require("./card-io.js");
const cards = loadCards().cards;
const byId = new Map(cards.map((c) => [c.id, c]));

/* THE WHOLE BATCH IS VALIDATED BEFORE ANYTHING IS WRITTEN, which is the rule every batch helper here
   follows: a half-applied batch is worse than a refused one, because the half that landed looks
   finished. */
const built = [];
const bad = [];
for (const [id, spec] of Object.entries(want)) {
  const m = /^fl-(\d{3})$/.exec(id);
  if (!m) { bad.push(`${id}: not an fl-NNN id`); continue; }
  if (byId.has(id)) { bad.push(`${id}: already in data.js`); continue; }
  const twinId = "gw-" + m[1];
  const twin = byId.get(twinId);
  if (!twin) { bad.push(`${id}: its twin ${twinId} is not in data.js — a flag card's answer side IS its twin's`); continue; }

  const fl = twin.answerFlag;
  if (!fl || !String(fl.src || "").trim() || !String(fl.credit || "").trim()) {
    bad.push(`${id}: ${twinId} carries no credited answerFlag — fetch the flag onto the twin first (see the plan's per-batch order)`);
    continue;
  }

  const ansT = String(twin.answerText || "").trim();
  let alt = String((spec && spec.alt) || "").trim();
  let derived = false;
  if (!alt) {
    const src = String(fl.alt || "").trim();
    if (!src) { bad.push(`${id}: ${twinId} has no flag description to derive from, and the batch supplies no \`alt\``); continue; }
    /* The prefix is cut and the first letter capitalised. `The flag of Bosnia and Herzegovina: a blue
       field…` -> `A blue field…`. Anything that is not that shape is left alone and checked below. */
    const cut = src.replace(/^the flag of [^:]{1,60}:\s*/i, "");
    alt = cut.charAt(0).toUpperCase() + cut.slice(1);
    derived = true;
  }
  if (ansT && alt.toLowerCase().indexOf(ansT.toLowerCase()) >= 0) {
    bad.push(`${id}: the ${derived ? "derived" : "supplied"} alt still names ${JSON.stringify(ansT)} — ` +
      `describe the flag instead. Derived from: ${JSON.stringify(String(fl.alt || "").slice(0, 110))}`);
    continue;
  }

  const card = { id: id, num: Number(m[1]), flagCard: true, question: PROMPT, questions: [] };
  for (const f of COPY) if (twin[f] != null) card[f] = twin[f];
  // the empty strings every card carries, so the shape matches what `serializeCardData` writes
  for (const f of ["traditional", "hanzi", "pinyin", "translations", "citation"]) card[f] = twin[f] == null ? "" : twin[f];
  card.answerFlag = { src: fl.src, credit: fl.credit, alt: alt };
  /* `flag` joins the subject areas; tag 1 stays the twin's KIND (`place`), which 233 other cards also
     lead with — `tagKinship` caps a card whose leading kind is unique at 2 against everything in the
     corpus, which is the exact failure tags exist to prevent. */
  const tags = Array.isArray(twin.tags) ? twin.tags.slice() : [];
  if (!tags.includes("flag")) tags.splice(1, 0, "flag");
  card.tags = tags;

  built.push({ id, card, derived, alt, twinId });
}

if (bad.length) {
  console.error(`REFUSED — ${bad.length} of ${Object.keys(want).length} entries could not be built:`);
  bad.forEach((b) => console.error("  " + b));
  process.exit(1);
}

built.sort((a, b) => a.id.localeCompare(b.id));
console.log(`${built.length} flag card${built.length === 1 ? "" : "s"} built from their twins:\n`);
for (const b of built) {
  console.log(`  ${b.id}  ${b.card.answerText}  (from ${b.twinId}, ${b.card.sources.length} sources, difficulty ${b.card.difficulty})`);
  console.log(`      alt${b.derived ? " [derived — READ IT]" : ""}: ${b.alt}`);
}
if (dry) { console.log("\n--dry: nothing written."); process.exit(0); }

/* Handed to add-card.js one at a time, with --no-image (a flag card's picture is its flag, and that tool
   already knows it — the flag is a belt-and-braces against a network round trip nobody wants here). */
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "flagcards-"));
let wrote = 0;
for (const b of built) {
  const f = path.join(tmp, b.id + ".json");
  fs.writeFileSync(f, JSON.stringify(b.card, null, 1));
  try {
    const out = execFileSync(process.execPath, [path.join(__dirname, "add-card.js"), f, DECK, "--no-image"], { cwd: ROOT, encoding: "utf8" });
    process.stdout.write(out.split("\n").filter((l) => l.trim()).map((l) => "  " + l).join("\n") + "\n");
    wrote++;
  } catch (e) {
    console.error(`\nADD-CARD REFUSED ${b.id} — ${wrote} card${wrote === 1 ? "" : "s"} of ${built.length} were written before it:`);
    console.error((e.stdout || "") + (e.stderr || ""));
    process.exit(1);
  }
}
console.log(`\n${wrote} card${wrote === 1 ? "" : "s"} added to ${DECK}. Now run:`);
console.log("  node .claude/check-flag-twins.js");
console.log("  node .claude/test-flag-cards.js");
console.log("  node .claude/check-questions.js && node .claude/check-style.js && node .claude/test-card-plans.js");
