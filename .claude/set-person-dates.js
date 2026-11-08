#!/usr/bin/env node
/*
  Write a PERSON CARD's date line in the person template (Nov 2026, on request):

      Birth     8 July 1851
                Nash Mills, Hertfordshire        <- the place, a continuation line at lowered opacity
      Keeper    1884 – 1908                       <- the term / career
      Knossos   1900 (age 48–49)                  <- the biggest moment, with the age
      Death     11 July 1941 (age 90)
                Youlbury, Berkshire              <- the place

    node .claude/set-person-dates.js <batch.json> [--dry]

    { "cards": { "gr-007": {
        "birth":  ["8 July 1851", "Nash Mills, Hertfordshire"],
        "career": ["Keeper", "1884 – 1908"],
        "moment": ["Knossos dig", "1900"],
        "death":  ["11 July 1941", "Youlbury, Berkshire"]
    } } }

  Every part is optional — a person whose birth no source dates gets no Birth row, never an estimate,
  and the line then opens with the term (at most 4 rows, as every other line) — and a place may be left out ("" or a one-item array) where the
  sources do not give one — an unknown birthplace is a missing line, never a guess. A place is written
  "Town, Region" with commas, never brackets (the writer refuses brackets). `career` and
  `moment` are [label, date]; the label says WHAT the date is (Reigned, In office, Consul, Knossos dig)
  in at most 16 characters. A date may carry a qualifier after a comma ("390 BCE, by tradition",
  "46 BCE, disputed"): it stays on the line and only the part before the comma is read.

  WHY A TOOL. Two things in the template are arithmetic a hand edit gets wrong without anything saying
  so: the AGES, and the ORDER ("All dates should be in chronological order"). This script computes the
  age at the moment and at death from the dates themselves — exact when both carry a day and a month,
  a range ("age 48–49") when either is a bare year, "c." when either is circa (the middle of a
  circa range wider than two years) — counting BCE years with
  no year 0. It sorts the career and moment rows by their opening date, so a moment that came before the
  career stands above it, and it REFUSES a line whose dates run backwards (a death before a birth, a
  moment after the death). Dates before 1000 must carry BCE or CE, as on every date line.

  The rows then go through `set-date-line.js` — the one writer of the field — so `date-line.js` holds
  them to its limits (six rows for a line opening with "Birth", a label ≤16 characters, a value ≤64).
  `--dry` prints the rows and writes nothing.

  Research the dates on the person's Wikipedia page (the request asked for "the most complete dates")
  and check them against the card's own sources; where the two disagree, say so in the commit.
*/
const fs = require("fs"), path = require("path"), os = require("os");
const { spawnSync } = require("child_process");
const die = (m) => { console.error("ERROR: " + m); process.exit(1); };

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const MDAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/* A date as written on a date line -> { lo, hi, circa }, where lo / hi are [astronomicalYear, month, day]
   bounds. "8 July 1851", "July 1851", "1851", "c. 271 – 273 CE", "95 BCE", "15 March 44 BCE". */
function parseDate(id, what, s) {
  // a qualifier after a comma is kept on the line and not read ("390 BCE, by tradition")
  const t = String(s || "").trim().replace(/\s*\(age[^)]*\)$/i, "").split(",")[0].trim().replace(/[‐-―−]/g, "-");
  const m = t.match(/^(c\.\s*)?(?:(\d{1,2})\s+)?(?:([A-Za-z]+)\s+)?(\d{1,4})(?:\s*(BCE|CE))?(?:\s*-\s*(?:(\d{1,2})\s+)?(?:([A-Za-z]+)\s+)?(\d{1,4})(?:\s*(BCE|CE))?)?$/);
  if (!m) die(id + " " + what + ": cannot read the date \"" + s + "\" — write \"8 July 1851\", \"1851\", \"c. 271 – 273 CE\" or \"95 BCE\"");
  const [, circa, d1, mo1, y1, e1, d2, mo2, y2, e2] = m;
  const era2 = e2 || e1, era1 = e1 || (y2 ? e2 : null);
  const part = (d, mo, y, era) => {
    const yr = Number(y);
    if (yr < 1000 && !era) die(id + " " + what + ": \"" + s + "\" — a year before 1000 carries BCE or CE");
    let mi = null;
    if (mo) { mi = MONTHS.indexOf(mo.toLowerCase()); if (mi < 0) die(id + " " + what + ": \"" + mo + "\" is not a month"); }
    if (d && mi == null) die(id + " " + what + ": a day with no month in \"" + s + "\"");
    if (d && (Number(d) < 1 || Number(d) > MDAYS[mi])) die(id + " " + what + ": no day " + d + " in " + MONTHS[mi]);
    const ay = era === "BCE" ? 1 - yr : yr;                 // 1 BCE = year 0 astronomically, so no year 0 is counted
    return { lo: [ay, mi == null ? 0 : mi, d ? Number(d) : 1], hi: [ay, mi == null ? 11 : mi, d ? Number(d) : MDAYS[mi == null ? 11 : mi]] };
  };
  const a = part(d1, mo1, y1, era1);
  const b = y2 ? part(d2, mo2, y2, era2) : a;
  if (cmp(b.hi, a.lo) < 0) die(id + " " + what + ": \"" + s + "\" runs backwards");
  return { lo: a.lo, hi: b.hi, circa: !!circa, text: String(s).trim() };
}
const cmp = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
const completed = (b, e) => e[0] - b[0] - (e[1] < b[1] || (e[1] === b[1] && e[2] < b[2]) ? 1 : 0);
function ageText(birth, at) {
  const min = completed(birth.hi, at.lo), max = completed(birth.lo, at.hi);
  if (max < 0) return null;
  const lo = Math.max(min, 0), c = birth.circa || at.circa ? "c. " : "";
  if (lo === max) return "age " + c + max;
  if (max - lo <= 2 || !c) return "age " + c + lo + "–" + max;       // Wikipedia's "(aged 18–19)"
  return "age c. " + Math.round((lo + max) / 2);                     // a wide circa range: its middle
}

function rowsFor(id, spec) {
  if (!spec || typeof spec !== "object") die(id + ": value must be { birth, career?, moment?, death? }");
  for (const k of Object.keys(spec)) if (!["birth", "career", "moment", "death"].includes(k)) die(id + ": unknown part \"" + k + "\"");
  const pair = (k) => { const v = spec[k]; if (v == null) return null; if (!Array.isArray(v) || !v.length || v.length > 2) die(id + " " + k + ": give [date, place] or [label, date]"); return v.map((x) => String(x == null ? "" : x).trim()); };
  const birth = pair("birth"), death = pair("death"), career = pair("career"), moment = pair("moment");
  if (career && career.length !== 2) die(id + " career: [label, \"from – to\"]");
  if (moment && moment.length !== 2) die(id + " moment: [label, date]");
  // a place is "Town, Region" — commas, never brackets, so every card reads the same (Nov 2026, on request)
  for (const [k, v] of [["birth", birth], ["death", death]]) if (v && v[1] && /[()]/.test(v[1])) die(id + " " + k + ": write the place as \"Town, Region\" with commas, not brackets: \"" + v[1] + "\"");
  const B = birth ? parseDate(id, "birth", birth[0]) : null;
  const D = death ? parseDate(id, "death", death[0]) : null;
  const mid = [];
  if (career) mid.push({ label: career[0], d: parseDate(id, "career", career[1]), value: career[1] });
  if (moment) { const d = parseDate(id, "moment", moment[1]); const a = B && ageText(B, d); mid.push({ label: moment[0], d, value: moment[1] + (a ? " (" + a + ")" : "") }); }
  // chronological order: nothing before the birth, nothing after the death
  for (const r of mid) {
    if (B && cmp(r.d.hi, B.lo) < 0) die(id + ": \"" + r.label + "\" (" + r.d.text + ") is before the birth (" + B.text + ")");
    if (D && cmp(r.d.lo, D.hi) > 0) die(id + ": \"" + r.label + "\" (" + r.d.text + ") is after the death (" + D.text + ")");
  }
  if (B && D && cmp(D.hi, B.lo) < 0) die(id + ": the death (" + D.text + ") is before the birth (" + B.text + ")");
  mid.sort((a, b) => cmp(a.d.lo, b.d.lo));
  const rows = [];
  if (birth) { rows.push(["Birth", birth[0]]); if (birth[1]) rows.push(["", birth[1]]); }
  mid.forEach((r) => rows.push([r.label, r.value]));
  if (death) {
    const a = B && ageText(B, D);
    rows.push(["Death", death[0] + (a ? " (" + a + ")" : "")]);
    if (death[1]) rows.push(["", death[1]]);
  }
  return rows;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith("--"));
  if (!file) die("usage: node .claude/set-person-dates.js <batch.json> [--dry]");
  let batch;
  try { batch = JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) { die("could not read " + file + ": " + e.message); }
  if (!batch || typeof batch.cards !== "object") die("batch needs a `cards` object");
  const out = { cards: {} };
  for (const [id, spec] of Object.entries(batch.cards)) out.cards[id] = rowsFor(id, spec);
  for (const [id, rows] of Object.entries(out.cards)) {
    console.log(id);
    rows.forEach(([k, v]) => console.log("  " + (k || "").padEnd(17) + v));
  }
  if (args.includes("--dry")) process.exit(0);
  const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "person-dates-")), "batch.json");
  fs.writeFileSync(tmp, JSON.stringify(out));
  const r = spawnSync(process.execPath, [path.join(__dirname, "set-date-line.js"), tmp], { stdio: "inherit" });
  process.exit(r.status == null ? 1 : r.status);
}

module.exports = { parseDate, ageText, rowsFor };
