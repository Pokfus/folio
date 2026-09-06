#!/usr/bin/env node
/*
  Rewrite a MAP CARD's `facts` grid, in batches.

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

const MAX_ROWS = 6;          // the grid is drawn two to a row; more than three rows is a table, not a glance
const LABEL_MAX = 24;
const VALUE_MAX = 64;

global.window = {};
require(DATA);
const CARDS = global.window.CARD_DATA;
if (!Array.isArray(CARDS)) die("data.js did not yield window.CARD_DATA");
const byId = new Map(CARDS.map((c) => [c.id, c]));

if (process.argv.includes("--check")) {
  const maps = CARDS.filter((c) => c.map);
  console.log(maps.length + " map cards");
  maps.forEach((c) => console.log("  " + c.id + "  " + (c.answerText || "") + "\n      " +
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
  if (!card.map) die(id + ": not a map card — `facts` is the map card's own figures grid");
  if (!Array.isArray(facts) || !facts.length) die(id + ": facts must be a non-empty array of [label, value]");
  if (facts.length > MAX_ROWS) die(id + ": " + facts.length + " rows — at most " + MAX_ROWS);
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

delete require.cache[require.resolve(DATA)];
global.window = {};
try { require(DATA); } catch (e) { die("data.js no longer parses after the write: " + e.message); }
if (!Array.isArray(global.window.CARD_DATA)) die("data.js no longer yields CARD_DATA");

const qs = edits.reduce((n, [, f]) => n + f.filter((r) => r[1] === "?").length, 0);
console.log("set the facts grid on " + edits.length + " card(s)" + (qs ? "; " + qs + " cell(s) left as “?”" : ""));
