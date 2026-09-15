#!/usr/bin/env node
/*
  Rewrite a MAP CARD's or an ARTWORK CARD's `facts` grid, in batches.

    node .claude/set-facts.js <batch.json> [--check]

    { "cards": { "gw-001": [["Capital","New Delhi"], ["Population","1.46B (2025)"],
                            ["Largest city","Mumbai"], ["Area","3,287,263 km² (1,269,219 sq mi)"]] } }

  WHY A TOOL RATHER THAN AN EDIT. `facts` is an ARRAY of pairs, so none of the existing helpers can
  touch it: `add-sources.js` writes only `sources` and the abstract, `fix-field.js` does find/replace
  inside a STRING field and refuses anything else, and `update-cards.js` assigns whole fields, which on
  a batch this size is a rewrite of data.js with no validation in front of it. And the grid is READ BY
  POSITION — `cardFacts` draws it two to a row — so "Capital | Population / Largest city | Area" is an
  ORDER as much as a set of labels, which is the one thing a hand edit gets wrong without anything
  saying so.

  IT VALIDATES THE WHOLE BATCH BEFORE WRITING ANYTHING, for the reason add-card-difficulty.js does: a
  half-applied batch is worse than a refused one, because the half that landed looks finished.

  `--check` reports every map card's grid and writes nothing — which is how a batch is reviewed by eye
  before it is applied, the grid being four short strings that no test can judge.

  A CELL MAY BE "?" AND THAT IS DELIBERATE (Sep 2026, on request: "if you cannot find data for any
  particular one, just put a questionmark there"). It is not a placeholder to be filled in later by a
  guess — it is the card saying the figure was looked for and not found, which is the honest state and
  the one thing a fabricated number destroys.
*/
const fs = require("fs"), path = require("path");
const DATA = path.join(__dirname, "..", "data.js");
const die = (m) => { console.error("ERROR: " + m); process.exit(1); };

/* THE ROW BOUNDS ARE `add-card.js`'s, SLICED OUT BY TEXT RATHER THAN COPIED, and the run STOPS if the
   slice fails (Sep 2026). Two tools write a `facts` grid — that one for a NEW card, this one for a card
   already shipped — and a second copy of a bound goes stale on a change made in a file nobody editing a
   grid has reason to open, which is the scar `add-card-tags.js` left. */
const AC = fs.readFileSync(path.join(__dirname, "add-card.js"), "utf8");
const sliceNum = (name) => {
  const m = AC.match(new RegExp("\\b" + name + "\\s*=\\s*(\\d+)"));
  if (!m) die("could not read " + name + " out of add-card.js — the two tools would disagree about how many rows a grid may carry");
  return Number(m[1]);
};
const MAP_FACTS_MIN = sliceNum("MAP_FACTS_MIN"), MAP_FACTS_MAX = sliceNum("MAP_FACTS_MAX");
const ART_FACTS_MIN = sliceNum("ART_FACTS_MIN");
const LABEL_MAX = 24;
const VALUE_MAX = 64;

global.window = {};
require(DATA);
const CARDS = global.window.CARD_DATA;
if (!Array.isArray(CARDS)) die("data.js did not yield window.CARD_DATA");
const byId = new Map(CARDS.map((c) => [c.id, c]));

if (process.argv.includes("--check")) {
  const grids = CARDS.filter((c) => c.map || c.artwork === true);
  console.log(grids.length + " cards with a facts grid (" + grids.filter((c) => c.map).length + " map, " +
    grids.filter((c) => !c.map).length + " artwork)");
  grids.forEach((c) => console.log("  " + c.id + "  [" + (c.map ? "map" : "artwork") + "]  " + (c.answerText || "") + "\n      " +
    (c.facts || []).map((f) => f[0] + " = " + f[1]).join("\n      ")));
  process.exit(0);
}

const batchPath = process.argv[2];
if (!batchPath) die("usage: node .claude/set-facts.js <batch.json> [--check]");
let batch;
try { batch = JSON.parse(fs.readFileSync(batchPath, "utf8")); }
catch (e) { die("could not read " + batchPath + ": " + e.message); }
if (!batch || typeof batch.cards !== "object") die("batch needs a `cards` object");

// ---- validate the WHOLE batch first ---------------------------------------------------------------
const edits = [];
for (const [id, facts] of Object.entries(batch.cards)) {
  const card = byId.get(id);
  if (!card) die("no card " + id + " in data.js");
  /* AN ARTWORK CARD CARRIES A `facts` GRID TOO, and this tool refused one for a fortnight after that
     format shipped — so the only field the artwork format adds had no sanctioned writer at all and the
     next hand edit of it would have gone straight into data.js. The two kinds take different MINIMA
     (a map card states capital/population/area; an artwork states artist/date/medium/size/where), so the
     bound is chosen by the card rather than shared. */
  const kind = card.map ? "map" : (card.artwork === true ? "artwork" : null);
  if (!kind) die(id + ": neither a map card nor an artwork card — `facts` is those two formats' figures grid");
  if (!Array.isArray(facts) || !facts.length) die(id + ": facts must be a non-empty array of [label, value]");
  const min = kind === "map" ? MAP_FACTS_MIN : ART_FACTS_MIN;
  if (facts.length < min || facts.length > MAP_FACTS_MAX) {
    die(id + ": a" + (kind === "map" ? " map" : "n artwork") + " card carries " + min + "\u2013" + MAP_FACTS_MAX + " `facts` rows — this one has " + facts.length);
  }
  facts.forEach((row, i) => {
    if (!Array.isArray(row) || row.length !== 2) die(id + " row " + (i + 1) + ": each row is [label, value]");
    const [label, value] = row.map((x) => String(x == null ? "" : x).trim());
    if (!label) die(id + " row " + (i + 1) + ": the label is empty");
    if (!value) die(id + " row " + (i + 1) + ": the value is empty — write \"?\" where the figure could not be found");
    if (/[<>]/.test(label + value)) die(id + " row " + (i + 1) + ": no markup in a facts grid");
    if (label.length > LABEL_MAX) die(id + " row " + (i + 1) + ": label “" + label + "” is " + label.length + " characters — at most " + LABEL_MAX);
    if (value.length > VALUE_MAX) die(id + " row " + (i + 1) + ": value “" + value + "” is " + value.length + " characters — at most " + VALUE_MAX);
    row[0] = label; row[1] = value;
  });
  edits.push([card, facts]);
}

// ---- apply ----------------------------------------------------------------------------------------
edits.forEach(([card, facts]) => { card.facts = facts; });

// ---- serialize, in the ONE-CARD-PER-LINE shape every other helper writes ---------------------------
const src = fs.readFileSync(DATA, "utf8");
const start = src.indexOf("window.CARD_DATA = ");
if (start < 0) die("could not find `window.CARD_DATA = ` in data.js");
const arrStart = src.indexOf("[", start);
let depth = 0, arrEnd = -1, inStr = null, esc = false;
for (let i = arrStart; i < src.length; i++) {
  const ch = src[i];
  if (inStr) { if (esc) { esc = false; continue; } if (ch === "\\") { esc = true; continue; } if (ch === inStr) inStr = null; continue; }
  if (ch === '"' || ch === "'" || ch === "`") { inStr = ch; continue; }
  if (ch === "[") depth++;
  else if (ch === "]") { depth--; if (!depth) { arrEnd = i; break; } }
}
if (arrEnd < 0) die("could not find the end of the CARD_DATA array");
fs.writeFileSync(DATA, src.slice(0, arrStart) + "[\n" + CARDS.map((c) => JSON.stringify(c)).join(",\n") + "\n]" + src.slice(arrEnd + 1));
/* data.js is the LIGHT half of the corpus. This helper splices its change straight into that
   file, so a heavy field (abstract / sources / why / quote / image) lands there fat and has to
   be moved back out — otherwise data.js re-fattens one card at a time and the eager load path
   grows back in silence. See .claude/card-io.js. */
require("./card-io").resplit();

delete require.cache[require.resolve(DATA)];
global.window = {};
try { require(DATA); } catch (e) { die("data.js no longer parses after the write: " + e.message); }
if (!Array.isArray(global.window.CARD_DATA)) die("data.js no longer yields CARD_DATA");

const qs = edits.reduce((n, [, f]) => n + f.filter((r) => r[1] === "?").length, 0);
console.log("set the facts grid on " + edits.length + " card(s)" + (qs ? "; " + qs + " cell(s) left as “?”" : ""));
