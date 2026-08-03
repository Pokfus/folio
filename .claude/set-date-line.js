#!/usr/bin/env node
/*
  Set a card's DATE LINE (the `answerDate` field under the answer term) — the key/value list of the
  dates worth memorising alongside the term.

    node .claude/set-date-line.js <batch.json> [--keep-i18n]

    { "cards": {
        "wh-012": [["Era", "115,000 – 11,700 BP"]],
        "wh-013": [["Lived", "c. 4.2 – 2 Mya"], ["Named", "1925, by Raymond Dart"]],
        "wh-016": [["Named", "1964"], ["", "Leakey, Tobias and Napier"]],
        "wh-080": []
    } }

  Rows are [label, value] pairs and the script builds the markup, so the shape can never drift card to
  card. A row with an EMPTY label is a continuation line sitting under the value above it (the place
  under a birth date). An empty array is an empty date line — for a card with no date worth stating,
  which is what the section is supposed to look like rather than a sentence apologising for itself.

  It refuses anything that is not a date list: too many rows, a label that is a phrase, a value that
  runs to a sentence, a keyed value with no digit in it. That refusal is the point — this field grew
  into a paragraph once, one card at a time, and nothing was checking.

  It also CLEARS the field from every translation the card carries (--keep-i18n opts out), so the nine
  languages fall back to the English line rather than each keeping the paragraph this replaces. The
  line is numerals plus a one-word label; the site is English-only (MULTILANG in app.js).
*/
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DATA = path.join(ROOT, "data.js");
const LANGS = ["es", "fr", "de", "it", "nl", "ru", "ar", "zh", "ja"];

const { buildDateLine, isDateList } = require("./date-line.js");

function die(msg) { console.error("ERROR: " + msg); process.exit(1); }

const args = process.argv.slice(2);
const keepI18n = args.includes("--keep-i18n");
const batchPath = args.filter((a) => !a.startsWith("--"))[0];
if (!batchPath) die("usage: node .claude/set-date-line.js <batch.json> [--keep-i18n]");
let batch;
try { batch = JSON.parse(fs.readFileSync(batchPath, "utf8")); }
catch (e) { die("could not read " + batchPath + ": " + e.message); }
if (!batch || typeof batch.cards !== "object") die("batch needs a `cards` object");

global.window = {};
require(DATA);
const CARDS = global.window.CARD_DATA;
if (!Array.isArray(CARDS)) die("data.js did not yield window.CARD_DATA");
const byId = new Map(CARDS.map((c) => [c.id, c]));

// ---- validate + build, BEFORE writing anything ---------------------------------------------------
const edits = [];
for (const [id, rows] of Object.entries(batch.cards)) {
  const card = byId.get(id);
  if (!card) die("no card " + id + " in data.js");
  edits.push({ id, card, html: buildDateLine(id, rows, die), rows });
}

// ---- apply --------------------------------------------------------------------------------------
let cleared = 0;
for (const e of edits) {
  e.card.answerDate = e.html;
  if (!keepI18n && e.card.i18n) {
    for (const l of LANGS) {
      if (e.card.i18n[l] && "answerDate" in e.card.i18n[l]) { delete e.card.i18n[l].answerDate; cleared++; }
    }
  }
}

// ---- serialize, mirroring the other helpers' formatting -------------------------------------------
const src = fs.readFileSync(DATA, "utf8");
const startMark = "window.CARD_DATA = ";
const start = src.indexOf(startMark);
if (start < 0) die("could not find `window.CARD_DATA = ` in data.js");
const arrStart = src.indexOf("[", start);
let depth = 0, arrEnd = -1, inStr = null, esc2 = false;
for (let i = arrStart; i < src.length; i++) {
  const ch = src[i];
  if (inStr) {
    if (esc2) { esc2 = false; continue; }
    if (ch === "\\") { esc2 = true; continue; }
    if (ch === inStr) inStr = null;
    continue;
  }
  if (ch === '"' || ch === "'" || ch === "`") { inStr = ch; continue; }
  if (ch === "[") depth++;
  else if (ch === "]") { depth--; if (!depth) { arrEnd = i; break; } }
}
if (arrEnd < 0) die("could not find the end of the CARD_DATA array");
// ONE card per line, the shape every other helper writes — otherwise data.js flip-flops between
// 1.4k and 15k lines depending on which tool wrote last, and every batch's diff is the whole file.
fs.writeFileSync(DATA, src.slice(0, arrStart) + "[\n" + CARDS.map((c) => JSON.stringify(c)).join(",\n") + "\n]" + src.slice(arrEnd + 1));

// re-parse to confirm we did not corrupt the file
delete require.cache[require.resolve(DATA)];
global.window = {};
try { require(DATA); }
catch (e) { die("data.js no longer parses after the write: " + e.message); }
const AFTER = global.window.CARD_DATA;
if (!Array.isArray(AFTER)) die("data.js no longer yields CARD_DATA");

// ---- report -------------------------------------------------------------------------------------
for (const e of edits) {
  console.log("  " + e.id + "  " + (e.rows.length
    ? e.rows.map((r) => (r[0] ? r[0] + ": " : "↳ ") + r[1]).join("   |   ")
    : "(no date line)"));
}
console.log("set " + edits.length + " date line(s)" + (cleared ? ", cleared " + cleared + " translated one(s)" : ""));

// running coverage, so a multi-batch pass knows where it had got to (isDateList in date-line.js)
const done = AFTER.filter((c) => isDateList(c.answerDate)).length;
const stale = AFTER.filter((c) => !isDateList(c.answerDate)).map((c) => c.id);
console.log("date lines converted: " + done + "/" + AFTER.length + (stale.length ? "   still long: " + stale.slice(0, 12).join(", ") + (stale.length > 12 ? " … +" + (stale.length - 12) : "") : ""));
