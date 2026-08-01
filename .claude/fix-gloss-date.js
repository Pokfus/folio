#!/usr/bin/env node
/*
  Surgical patcher for window.GLOSSARY_DATES in glossary.js — the date line under a term's title.

  add-sources.js writes a term's `sources` and description and nothing else; add-glossary.js rewrites the
  WHOLE entry and so demands all nine translations back. Neither can change the one short string that a
  citation pass keeps finding wrong, because the date line repeats the description's figures. On the cards
  that job is fix-field.js's `answerDate`; this is its glossary sibling, written after batch G2 needed it
  a second time (G1 had to edit glossary.js by hand and said so in its log).

    node .claude/fix-gloss-date.js <batch.json>

    { "dates": {
        "Mousterian": { "from": "c. 160,000 – 40,000 BP", "to": "c. 300,000 – 40,000 BP" },
        "Some_Term":  { "to": "1644–1912" },          // `from` omitted = the term has no date line yet
        "Other_Term": { "from": "1900", "to": null }  // null removes the line
    } }

  `from` is asserted: the run refuses to write unless the stored value matches exactly. That refusal is
  the point — a silent no-op would leave a corrected description sitting above an uncorrected date.
  Dates are not translated (they are numerals and era abbreviations), so there is no per-language pass.
*/
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const GLOSS = path.join(ROOT, "glossary.js");

function die(msg) { console.error("ERROR: " + msg); process.exit(1); }

const batchPath = process.argv[2];
if (!batchPath) die("usage: node .claude/fix-gloss-date.js <batch.json>");
let batch;
try { batch = JSON.parse(fs.readFileSync(batchPath, "utf8")); }
catch (e) { die("could not read " + batchPath + ": " + e.message); }
if (!batch || typeof batch.dates !== "object" || !batch.dates) die("batch needs a `dates` object");

const win = {};
new Function("window", fs.readFileSync(GLOSS, "utf8"))(win);
const TERMS = win.GLOSSARY || {}, DATES = win.GLOSSARY_DATES || {};

// ---- validate everything BEFORE writing anything ---------------------------------------------------
const edits = [];
for (const [slug, spec] of Object.entries(batch.dates)) {
  if (!(slug in TERMS)) die("no glossary term " + slug + " — a date filed under a slug the popup never looks up is a date nobody will see");
  if (!spec || typeof spec !== "object" || !("to" in spec)) die(slug + ": needs a `to` (the new date, or null to remove the line)");
  const cur = DATES[slug];
  if ("from" in spec) {
    if (cur !== spec.from) die(slug + ": `from` is " + JSON.stringify(spec.from) + " but glossary.js holds " + JSON.stringify(cur));
  } else if (cur !== undefined) {
    die(slug + " already has the date " + JSON.stringify(cur) + " — pass `from` to confirm you mean to replace it");
  }
  const to = spec.to;
  if (to !== null && (typeof to !== "string" || !to.trim())) die(slug + ": `to` must be a non-empty string, or null");
  if (to === cur) die(slug + ": `to` is already the stored value — nothing to do");
  edits.push([slug, cur, to]);
}
if (!edits.length) die("nothing to do");

for (const [slug, , to] of edits) { if (to === null) delete DATES[slug]; else DATES[slug] = to; }

// ---- rewrite ONLY the GLOSSARY_DATES block, in place -----------------------------------------------
const obj = (o) => "{\n" + Object.keys(o).map((k) => JSON.stringify(k) + ": " + JSON.stringify(o[k])).join(",\n") + "\n}";
const src = fs.readFileSync(GLOSS, "utf8");
const head = "window.GLOSSARY_DATES = Object.assign(window.GLOSSARY_DATES || {}, ";
const start = src.indexOf(head);
if (start < 0) die("could not find the window.GLOSSARY_DATES block in glossary.js");
const end = src.indexOf("\n});\n", start);
if (end < 0) die("could not find the end of the window.GLOSSARY_DATES block");
const out = src.slice(0, start) + head + obj(DATES) + ");" + src.slice(end + 4);

fs.writeFileSync(GLOSS, out);
try { new Function("window", fs.readFileSync(GLOSS, "utf8"))({}); }
catch (e) { die("glossary.js no longer parses after the write: " + e.message); }

for (const [slug, from, to] of edits) {
  console.log("  " + slug + ": " + (from === undefined ? "(none)" : JSON.stringify(from)) + " -> " + (to === null ? "(removed)" : JSON.stringify(to)));
}
console.log("patched " + edits.length + " date line(s) in glossary.js");
