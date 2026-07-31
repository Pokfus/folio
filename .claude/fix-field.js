#!/usr/bin/env node
/*
  Surgical field patcher for data.js — for the fields add-sources.js deliberately does not touch.

  add-sources.js merges `sources` and the abstract the markers live in, and nothing else; update-cards.js
  ASSIGNS whole fields, so handing it an `i18n` patch replaces the card's entire i18n object and silently
  drops the other languages. Neither can fix a wrong figure sitting in `answerDate` — which is where a
  citation pass keeps finding them, because the date line repeats the abstract's numbers.

  This does find/replace INSIDE a named field, per language, and refuses to write unless every `find`
  string is actually present. That refusal is the point: a silent no-op would leave a corrected card still
  showing the wrong number on its date line.

    node .claude/fix-field.js <batch.json>

    { "cards": {
        "wh-061": {
          "field": "answerDate",
          "sub": {
            "en": [["about 1,000 kilometres wide", "hundreds of kilometres wide"]],
            "es": [["unos 1.000 kilómetros de ancho", "cientos de kilómetros de ancho"]],
            ...                                  // every language the card carries
          }
        }
    } }

  Languages present in `sub` are patched; a language absent from `sub` is left alone (and reported), so a
  figure that only exists in some translations doesn't force empty entries.
*/
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DATA = path.join(ROOT, "data.js");
const LANGS = ["es", "fr", "de", "it", "nl", "ru", "ar", "zh", "ja"];

function die(msg) { console.error("ERROR: " + msg); process.exit(1); }

const batchPath = process.argv[2];
if (!batchPath) die("usage: node .claude/fix-field.js <batch.json>");
let batch;
try { batch = JSON.parse(fs.readFileSync(batchPath, "utf8")); }
catch (e) { die("could not read " + batchPath + ": " + e.message); }
if (!batch || typeof batch.cards !== "object") die("batch needs a `cards` object");

global.window = {};
require(DATA);
const CARDS = global.window.CARD_DATA;
if (!Array.isArray(CARDS)) die("data.js did not yield window.CARD_DATA");
const byId = new Map(CARDS.map((c) => [c.id, c]));

// ---- validate everything BEFORE writing anything -------------------------------------------------
const edits = [];
for (const [id, spec] of Object.entries(batch.cards)) {
  const card = byId.get(id);
  if (!card) die("no card " + id + " in data.js");
  const field = spec.field;
  if (typeof field !== "string" || !field) die(id + ": `field` is required");
  if (!spec.sub || typeof spec.sub !== "object") die(id + ": `sub` is required");

  for (const [lang, pairs] of Object.entries(spec.sub)) {
    if (lang !== "en" && !LANGS.includes(lang)) die(id + ": unknown language " + lang);
    if (!Array.isArray(pairs) || !pairs.length) die(id + " [" + lang + "]: sub must be a non-empty array of [find, replace]");
    const holder = lang === "en" ? card : (card.i18n && card.i18n[lang]);
    if (!holder) die(id + ": no " + lang + " translation to patch");
    let text = holder[field];
    if (typeof text !== "string") die(id + " [" + lang + "]: field `" + field + "` is missing or not a string");
    for (const pair of pairs) {
      if (!Array.isArray(pair) || pair.length !== 2) die(id + " [" + lang + "]: each sub must be [find, replace]");
      const [find, repl] = pair;
      if (!text.includes(find)) die(id + " [" + lang + "] " + field + ": find string not present: «" + find + "»");
      text = text.replace(find, repl);
    }
    edits.push({ id, lang, field, holder, text });
  }
}

// ---- apply --------------------------------------------------------------------------------------
for (const e of edits) e.holder[e.field] = e.text;

// ---- serialize, mirroring the other helpers' formatting -------------------------------------------
const src = fs.readFileSync(DATA, "utf8");
const startMark = "window.CARD_DATA = ";
const start = src.indexOf(startMark);
if (start < 0) die("could not find `window.CARD_DATA = ` in data.js");
// find the end of the array literal by matching brackets from the first '['
const arrStart = src.indexOf("[", start);
let depth = 0, arrEnd = -1, inStr = null, esc = false;
for (let i = arrStart; i < src.length; i++) {
  const ch = src[i];
  if (inStr) {
    if (esc) { esc = false; continue; }
    if (ch === "\\") { esc = true; continue; }
    if (ch === inStr) inStr = null;
    continue;
  }
  if (ch === '"' || ch === "'" || ch === "`") { inStr = ch; continue; }
  if (ch === "[") depth++;
  else if (ch === "]") { depth--; if (!depth) { arrEnd = i; break; } }
}
if (arrEnd < 0) die("could not find the end of the CARD_DATA array");

const out = src.slice(0, arrStart) + JSON.stringify(CARDS, null, 2) + src.slice(arrEnd + 1);
fs.writeFileSync(DATA, out);

// re-parse to confirm we did not corrupt the file
delete require.cache[require.resolve(DATA)];
global.window = {};
try { require(DATA); }
catch (e) { die("data.js no longer parses after the write: " + e.message); }
if (!Array.isArray(global.window.CARD_DATA)) die("data.js no longer yields CARD_DATA");

const byCard = {};
for (const e of edits) (byCard[e.id] = byCard[e.id] || []).push(e.lang);
console.log("patched " + Object.keys(byCard).length + " card(s):");
for (const [id, langs] of Object.entries(byCard)) {
  const spec = batch.cards[id];
  const missing = ["en", ...LANGS].filter((l) => !langs.includes(l));
  console.log("  " + id + " " + spec.field + ": " + langs.join(", ") +
    (missing.length ? "   (left alone: " + missing.join(", ") + ")" : ""));
}
