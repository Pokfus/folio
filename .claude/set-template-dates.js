#!/usr/bin/env node
/*
  Write a WAR, BATTLE or CITY card's date line in its template (Nov 2026, on request). The person
  template has its own writer, `set-person-dates.js`; `template-cards.js` lists the cards of each kind.

      WAR                                   BATTLE                          CITY
      Start       28 July 1914              Date        2 August 216 BCE    Founding    c. 753 BCE, by tradition
                  Austria-Hungary on Serbia Location    Cannae, Apulia      Peak        c. 100 – 200 CE
      End         11 November 1918          Casualties  c. 55,000 – 75,000  Population  c. 1,000,000
                  Armistice of Compiègne    Result      Carthaginian victory
      Casualties  c. 40,000,000
      Result      Allied victory

    node .claude/set-template-dates.js <batch.json> [--dry]

    { "cards": {
        "wh-871": { "start": ["28 July 1914", "Austria-Hungary on Serbia"], "end": ["11 November 1918", "Armistice of Compiègne"],
                    "casualties": "c. 40,000,000", "result": "Allied victory" },
        "rm-218": { "date": "2 August 216 BCE", "location": "Cannae, Apulia", "casualties": "c. 55,000 – 75,000", "result": "Carthaginian victory" },
        "rm-020": { "founding": "c. 753 BCE, by tradition", "peak": "c. 100 – 200 CE", "population": "c. 1,000,000" }
    } }

  The KIND is read off the keys: `start` makes a war, `date` a battle, `founding` a city, and only that
  kind's keys are accepted. The opening part is required (it is what marks the line as its template);
  every other part may be left out where the sources give nothing — a missing figure is a missing row,
  never a guess. `results` in place of `result` labels the row "Results" (more than one outcome). A
  war's opening event and peace treaty are the dimmed continuation lines under its two dates: give
  ["date"] alone where there is none.

  WHAT IT CHECKS, and why each check is here:
  - every date parses (the same reader as the person writer: "8 July 1851", "c. 271 – 273 CE",
    "1 July – 18 November 1916", a qualifier after a comma) and a war does not end before it starts;
  - a casualty or population figure carries a number, and every number of four digits or more is
    GROUPED with commas ("1,500", never "1500"). That last is not style: the site reads a card's sort
    year off its whole date line (`cardYears` in app.js), and a bare "1500 killed" would date the card
    to 1500 CE;
  - no brackets in a place, as on the person lines;
  - then the rows go through `set-date-line.js`, the one writer of the field, so `date-line.js` holds
    them to its limits (labels ≤16 characters, values ≤64 characters and ≤10 words, no semicolons).
  `--dry` prints the rows and writes nothing.
*/
const fs = require("fs"), path = require("path"), os = require("os");
const { spawnSync } = require("child_process");
const { parseDate } = require("./set-person-dates.js");
const die = (m) => { console.error("ERROR: " + m); process.exit(1); };
const cmp = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

const KINDS = {
  war: { first: "start", keys: ["start", "end", "casualties", "result", "results"] },
  battle: { first: "date", keys: ["date", "location", "casualties", "result", "results"] },
  city: { first: "founding", keys: ["founding", "peak", "population"] },
};
const str = (v) => String(v == null ? "" : v).trim();
function figure(id, what, v) {
  if (!/\d/.test(v)) die(id + " " + what + ": \"" + v + "\" has no number — leave the part out instead");
  if (/(?<![\d,.])\d{4,}(?![\d,])/.test(v.replace(/\b(1\d{3}|20\d{2})\s*(BCE|CE)?\b(?=\))/g, ""))) die(id + " " + what + ": \"" + v + "\" — group every number of four digits or more with commas (\"1,500\"), or the site reads it as a year");
}

function rowsFor(id, spec) {
  if (!spec || typeof spec !== "object") die(id + ": value must be an object");
  const kind = Object.keys(KINDS).find((k) => KINDS[k].first in spec);
  if (!kind) die(id + ": give \"start\" (a war), \"date\" (a battle) or \"founding\" (a city)");
  for (const k of Object.keys(spec)) if (!KINDS[kind].keys.includes(k)) die(id + ": \"" + k + "\" is not part of the " + kind + " template");
  if (spec.result != null && spec.results != null) die(id + ": give \"result\" or \"results\", not both");
  const resLabel = spec.results != null ? "Results" : "Result", res = str(spec.results != null ? spec.results : spec.result);
  const rows = [];
  if (kind === "war") {
    const pair = (k) => { const v = spec[k]; if (v == null) return null; if (!Array.isArray(v) || !v.length || v.length > 2) die(id + " " + k + ": give [date, event]"); return v.map(str); };
    const s = pair("start"), e = pair("end");
    const S = parseDate(id, "start", s[0]), E = e ? parseDate(id, "end", e[0]) : null;
    if (E && cmp(E.hi, S.lo) < 0) die(id + ": the war ends (" + e[0] + ") before it starts (" + s[0] + ")");
    for (const v of [s, e]) if (v && v[1] && /[()]/.test(v[1])) die(id + ": no brackets in \"" + v[1] + "\"");
    rows.push(["Start", s[0]]); if (s[1]) rows.push(["", s[1]]);
    if (e) { rows.push(["End", e[0]]); if (e[1]) rows.push(["", e[1]]); }
    if (spec.casualties != null) { figure(id, "casualties", str(spec.casualties)); rows.push(["Casualties", str(spec.casualties)]); }
    if (res) rows.push([resLabel, res]);
  } else if (kind === "battle") {
    parseDate(id, "date", str(spec.date));
    rows.push(["Date", str(spec.date)]);
    if (spec.location != null) { if (/[()]/.test(spec.location)) die(id + ": no brackets in the location"); rows.push(["Location", str(spec.location)]); }
    if (spec.casualties != null) { figure(id, "casualties", str(spec.casualties)); rows.push(["Casualties", str(spec.casualties)]); }
    if (res) rows.push([resLabel, res]);
  } else {
    parseDate(id, "founding", str(spec.founding));
    rows.push(["Founding", str(spec.founding)]);
    if (spec.peak != null) rows.push(["Peak", str(spec.peak)]);
    if (spec.population != null) { figure(id, "population", str(spec.population)); rows.push(["Population", str(spec.population)]); }
  }
  return rows;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith("--"));
  if (!file) die("usage: node .claude/set-template-dates.js <batch.json> [--dry]");
  let batch;
  try { batch = JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) { die("could not read " + file + ": " + e.message); }
  if (!batch || typeof batch.cards !== "object") die("batch needs a `cards` object");
  const { buildDateLine } = require("./date-line.js");
  const out = { cards: {} };
  for (const [id, spec] of Object.entries(batch.cards)) { out.cards[id] = rowsFor(id, spec); buildDateLine(id, out.cards[id], die); }
  for (const [id, rows] of Object.entries(out.cards)) { console.log(id); rows.forEach(([k, v]) => console.log("  " + (k || "").padEnd(12) + v)); }
  if (args.includes("--dry")) process.exit(0);
  const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "template-dates-")), "batch.json");
  fs.writeFileSync(tmp, JSON.stringify(out));
  const r = spawnSync(process.execPath, [path.join(__dirname, "set-date-line.js"), tmp], { stdio: "inherit" });
  process.exit(r.status == null ? 1 : r.status);
}

module.exports = { rowsFor };
