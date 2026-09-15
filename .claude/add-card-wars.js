#!/usr/bin/env node
/* add-card-wars.js — write `card.war` onto cards that already exist.
 *
 *     node .claude/add-card-wars.js <batch.json> [--dry]
 *     node .claude/add-card-wars.js --check            # what the corpus carries now
 *     node .claude/add-card-wars.js --names=1938       # every territory name that era's map has
 *
 *     { "cards": {
 *         "rm-209": { "war": {
 *           "victors": { "name": "Rome",     "area": [[12.4,41.9], …] },
 *           "losers":  { "name": "Carthage", "area": [[10.3,36.8], …] }
 *         } },
 *         "ww2-096": { "war": {
 *           "victors": { "name": "China", "keys": ["China"] },
 *           "losers":  { "name": "Japan", "keys": ["Japan", "Empire of Japan"] }
 *         } }
 *     } }
 *
 * WHY THIS EXISTS. `add-card.js` only ever adds a WHOLE new card, and no other helper can reach the
 * field: `add-sources.js` touches only `sources` and the abstract, `fix-field.js` does find-and-replace
 * inside a STRING field, and `set-facts.js` writes the figures grid. Without this the feature could only
 * ever appear on a card written after today, which on a corpus carrying sixty-odd wars already means it
 * appears nowhere.
 *
 * THE VALIDATION IS `card-war.js`, THE SAME MODULE `add-card.js` CALLS — not a copy.
 *
 * AN ENTRY MAY CARRY A `places` BLOCK BESIDE ITS `war`, AND THE BATCH IS REFUSED IF ANY OF IT IS WRONG.
 * A hand-drawn extent renders perfectly while covering somewhere else, and the only thing that catches
 * that is asserting what the shape covers against places whose coordinates are known:
 *
 *     "places": { "victors": { "in": [["Rome", 12.48, 41.9]], "out": [["Palermo", 13.36, 38.12]] } }
 *
 * It is a check on the BATCH and is never written to the card.
 *
 * IT SPLICES LINES RATHER THAN REWRITING THE FILE, for `add-card-links.js`'s reason: `data.js` is one
 * JSON object per line, and re-serialising the array normalises every card's key order, which turns a
 * ten-card change into a 3,000-line diff nobody can review.
 *
 * THE WHOLE BATCH IS VALIDATED BEFORE ANYTHING IS WRITTEN. A half-applied batch is worse than a refused
 * one — the corpus is then in a state no file describes.
 *
 * `"war": null` REMOVES the block, which is how a card whose outcome turns out to be disputed gets the
 * shading taken off again.
 *
 * Zero dependencies. Not part of the site.
 */
"use strict";
const fs = require("fs"), path = require("path");
const { checkWar, checkPlaces, checkClashes, mapNames, warYears } = require("./card-war.js");
const { loadCardYears } = require("./card-links.js");

const ROOT = path.join(__dirname, "..");
const DATA = path.join(ROOT, "data.js");
const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const file = args.find((a) => !a.startsWith("--"));

/* ---- `--names=<year>`: what that era's map actually calls its territories.
   The commonest way to write a war block that draws nothing is to name a belligerent as the history
   books do rather than as the map does — the 1938 map has no "Nazi Germany" and no "Soviet Union", it
   has "Germany" and "USSR" — so the answer is a command rather than a guess. */
const namesArg = args.find((a) => a.startsWith("--names="));
if (namesArg) {
  const y = Number(namesArg.slice(8));
  const N = mapNames();
  if (!N.eras.has(y)) {
    console.error("no era map for " + y + " — Folio's maps are " + Array.from(N.eras.keys()).join(", ") + ".");
    process.exit(1);
  }
  const list = Array.from(N.eras.get(y)).sort();
  console.log("the world in " + y + " — " + list.length + " territories:");
  console.log("  " + list.join(" · "));
  process.exit(0);
}

const cardYears = loadCardYears(fs.readFileSync(path.join(ROOT, "app.js"), "utf8"));
const { cards } = require("./card-io").loadCards();
const byId = {}; for (const c of cards) byId[c.id] = c;

/* ---- `--check`: every war block the corpus carries, and the years each will draw in. */
if (args.includes("--check")) {
  const have = cards.filter((c) => c && c.war);
  console.log(have.length + " card" + (have.length === 1 ? "" : "s") + " carry a war block\n");
  have.forEach((c) => {
    const y = warYears(c, cardYears);
    const side = (s) => s.name + (s.keys ? " [" + s.keys.join(", ") + "]" : " (authored extent)");
    console.log("  " + c.id + "  " + c.answerText);
    console.log("      victors  " + side(c.war.victors));
    console.log("      defeated " + side(c.war.losers));
    console.log("      years    " + (y ? y.y0 + " .. " + y.y1 + "  (" + y.from + ")" : "NONE — it will not draw on the personal atlas"));
  });
  /* …and what no per-card check can see: two blocks that put one piece of ground in two colours in the
     same year on the personal atlas. Reported rather than refused — see `checkClashes`. */
  const clash = checkClashes(cards, cardYears);
  console.log("");
  if (!clash.length) console.log("no two blocks contradict each other");
  else {
    console.log(clash.length + " pair" + (clash.length === 1 ? "" : "s") + " of blocks CONTRADICT each other on the personal atlas:");
    const role = { v: "victors", l: "defeated" };
    clash.forEach((k) => {
      console.log("  " + k.a.id + " (" + k.a.term + ") " + role[k.sa] + " vs " + k.b.id + " (" + k.b.term + ") " + role[k.sb]);
      console.log("      " + k.why + ", and both draw in " + k.y0 + " .. " + k.y1);
    });
  }
  process.exit(0);
}

if (!file) { console.error("usage: node .claude/add-card-wars.js <batch.json> [--dry] | --check | --names=<year>"); process.exit(1); }
const batch = JSON.parse(fs.readFileSync(file, "utf8"));
const want = batch.cards || {};
if (!Object.keys(want).length) { console.error("ERROR: batch has no `cards`."); process.exit(1); }

// ---- validate the whole batch first
const errs = [];
const merged = {};
let placed = 0;
for (const id of Object.keys(want)) {
  const cur = byId[id];
  if (!cur) { errs.push(id + ": no such card"); continue; }
  const patch = want[id] || {};
  const extra = Object.keys(patch).filter((k) => k !== "war" && k !== "places");
  if (extra.length) { errs.push(id + ": this tool writes only `war` (got " + extra.join(", ") + ")"); continue; }
  if (!("war" in patch)) { errs.push(id + ": nothing to write — give it a `war`, or `\"war\": null` to remove one"); continue; }
  // the card as it WOULD be, so the years check reads the date line it will actually have
  const next = Object.assign({}, cur);
  if (patch.war === null) delete next.war; else next.war = patch.war;
  const e = checkWar(next, cardYears);
  if (e) { errs.push(id + ": " + e.replace(/^ERROR:\s*/, "")); continue; }
  /* AND THE AUTHORED SHAPES ARE CHECKED AGAINST WHAT THEY ARE SUPPOSED TO COVER (see `checkPlaces`).
     `places` is a check on the batch and is never written to the card — which is why it is filtered out
     of the merge below rather than carried through. */
  const ep = checkPlaces(next, patch.places);
  if (ep.length) { ep.forEach((m) => errs.push(id + ": " + m)); continue; }
  placed += patch.places ? Object.keys(patch.places).reduce((n, k) => n + ((patch.places[k].in || []).length + (patch.places[k].out || []).length), 0) : 0;
  merged[id] = next;
}
if (errs.length) {
  console.error("ERROR: the batch was NOT applied — " + errs.length + " problem" + (errs.length === 1 ? "" : "s") + ":");
  errs.forEach((e) => console.error("  · " + e));
  process.exit(1);
}

/* ---- …AND THE BATCH IS CHECKED AGAINST THE BLOCKS ALREADY SHIPPED, which `checkWar` cannot do,
   knowing only one card. Two blocks whose years overlap and whose opposing sides claim one piece of
   ground shade it green and red at once on the personal atlas. REPORTED rather than refused: the fix is
   a judgement about which of the two to narrow, and a batch is sometimes the thing that CORRECTS one
   (the Punic Wars card carried Carthage's 264 extent across a 118-year span). See `checkClashes`. */
{
  const clash = checkClashes(cards.map((c) => merged[c.id] || c), cardYears);
  if (clash.length) {
    const role = { v: "victors", l: "defeated" };
    console.log("NOTE: " + clash.length + " pair" + (clash.length === 1 ? "" : "s") +
      " of blocks would contradict each other on the personal atlas:");
    clash.forEach((k) => {
      console.log("  · " + k.a.id + " " + role[k.sa] + " vs " + k.b.id + " " + role[k.sb] +
        " — " + k.why + ", both drawing in " + k.y0 + " .. " + k.y1);
    });
    console.log("");
  }
}

// ---- splice the changed lines
const lines = fs.readFileSync(DATA, "utf8").split("\n");
let touched = 0;
for (let i = 0; i < lines.length; i++) {
  const raw = lines[i];
  const body = raw.replace(/,\s*$/, "");
  if (!body.startsWith("{")) continue;
  let obj;
  try { obj = JSON.parse(body); } catch (err) { continue; }
  if (!obj || !merged[obj.id]) continue;
  lines[i] = JSON.stringify(merged[obj.id]) + (raw.endsWith(",") ? "," : "");
  touched++;
}
if (touched !== Object.keys(merged).length) {
  console.error("ERROR: matched " + touched + " lines for " + Object.keys(merged).length +
    " cards — data.js is not one card per line as expected. Nothing written.");
  process.exit(1);
}
const placeNote = placed ? "  |  " + placed + " place assertion" + (placed === 1 ? "" : "s") + " on the authored extents, all holding" : "";
if (DRY) { console.log("dry run: " + touched + " card" + (touched === 1 ? "" : "s") + " would change" + placeNote); process.exit(0); }
fs.writeFileSync(DATA, lines.join("\n"));
/* data.js is the LIGHT half of the corpus, and the merge above handed this tool whole cards — so a
   heavy field (abstract / sources / why / quote / image) has just landed back in it fat and has to be
   moved out again, or the eager load path grows back one card at a time in silence. See card-io.js. */
require("./card-io").resplit();
{ const win = {}; new Function("window", fs.readFileSync(DATA, "utf8"))(win); }   // re-parse to confirm valid JS

const after = require("./card-io").loadCards().cards.filter((c) => c && c.war);
console.log("wrote " + touched + " card" + (touched === 1 ? "" : "s") + " | corpus now: " + after.length + " with a war block" + placeNote);
