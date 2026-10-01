#!/usr/bin/env node
/* facts-echo.js — A MAP CARD'S BACKGROUND MAY NOT RESTATE ITS OWN FACTS GRID.
 *
 *   node .claude/facts-echo.js [--prefix=gru-] [--card=<id>] [--names] [--verbose]
 *
 * The answer box already prints Capital / Population / Largest city / Area two inches above the
 * background, so a background that gives those figures again is asking the reader to read the same
 * number twice (on request, Sep 2026).  Nothing else in the pipeline can see this: every figure is
 * correctly cited, the word count is in range, and the card renders perfectly.
 *
 * TWO TIERS, AND THE SECOND IS A JUDGEMENT.
 *   FIGURES — the subject's population, its area, or the capital's / largest city's population,
 *     written out in the prose in any of the shapes the grid or a writer would use.  An ERROR:
 *     `add-card.js` refuses a new card that does it.
 *   NAMES  — the capital's or largest city's NAME in the prose.  REPORTED with --names and never
 *     failed, because a name is often doing narrative work a number never does: a card about
 *     Astrakhan Oblast cannot tell the story of the khanate without writing "Astrakhan", and the
 *     rule would make such a card unwritable.  Read the list; do not sweep it.
 *
 * WHAT IS NOT AN ECHO, and this is what keeps the rule usable:
 *   - a DENSITY or a RANK derived from those figures.  Neither is in the grid, both vary in a way
 *     the grid cannot show, and they are what the Rosstat and Census citations move onto.
 *   - a HISTORICAL figure for the same quantity — "Reclus counted 26,403 people here in the
 *     eighteen-seventies" is a different fact about a different century.  The test is therefore
 *     against the grid's OWN value and nothing looser.
 *   - a figure for some OTHER city, region or country the card names.
 *
 * THE COMPARISON IS AGAINST THE GRID'S VALUE, EXPANDED INTO EVERY SHAPE IT COULD TAKE IN PROSE —
 * `966k` matches "966,000" and "966 000"; `1.07M` matches "1,070,000", "1.07 million" and
 * "1.1 million"; `34,500 km²` matches "34,500" and its own imperial pair "13,300".  A looser test
 * (any number that appears in both) reports the year in a date line against a four-figure area.
 *
 * Report-only by default, exit 1 on a figure echo, and 0 on --report.  Not part of the site.
 */
const path = require("path");
const ROOT = path.join(__dirname, "..");
const { loadCards } = require(path.join(__dirname, "card-io.js"));

const args = process.argv.slice(2);
const has = f => args.includes(f);
const val = f => { const a = args.find(x => x.startsWith(f + "=")); return a ? a.slice(f.length + 1) : null; };
const PREFIX = val("--prefix") || "";
const ONE = val("--card");
const SHOW_NAMES = has("--names") || has("--verbose");
const REPORT = has("--report");

/* A card whose finding has been read and is the right answer.  Keyed by card AND by the matched
   text, so a NEW echo on an excused card still reports (check-citations.js's CROSSREF_WRONG rule). */
const ADJUDICATED = {
  /* Read one at a time; each is the right answer.  All three are the same shape: a number that
     happens to equal a grid value while measuring something else entirely, which is why the rows
     are keyed by the MATCHED TEXT and not just by the card. */
  "gw-196": ["150"],    // "3,800 mm (150 inches)" of rain, against an area of 150 sq mi
  "gw-571": ["1.8 million"], // "1.8 million cubic feet" of debris, against a capital of 1.8m people
  "gw-707": ["3,000"],  // "3,000 millimetres (118 inches)" of rain, against a town of 3,000 people
};

const strip = h => String(h || "")
  .replace(/<sup[^>]*>[\s\S]*?<\/sup>/g, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const esc = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// digits may be grouped with a comma, a thin space or nothing at all
const loose = d => esc(d).replace(/,/g, "[,\\u00a0\\u2009 ]?");

/* every prose shape a grid figure could take */
function figureShapes(raw) {
  const out = [];
  const v = String(raw).trim();
  if (!v || v === "?") return out;

  // "966k (2023)" / "1.07M (2023)" / "about 23.0M" / "1.46B (2025)"
  const mag = v.match(/(\d[\d.,]*)\s*([kKmMbB])\b/);
  if (mag) out.push(...magnitude(mag[1], mag[2]));

  // "34,500 km² (13,300 sq mi)" — both halves are the grid's
  const km = v.match(/([\d,]{3,})\s*km/);
  if (km) out.push({ what: km[1], re: new RegExp("(?<![\\d,])" + loose(km[1]) + "(?![\\d,])") });
  const mi = v.match(/([\d,]{3,})\s*sq\s*mi/);
  if (mi) out.push({ what: mi[1], re: new RegExp("(?<![\\d,])" + loose(mi[1]) + "(?![\\d,])") });

  return out;
}

function magnitude(digits, unit) {
  const n = parseFloat(String(digits).replace(/,/g, ""));
  if (!isFinite(n)) return [];
  const mult = /b/i.test(unit) ? 1e9 : /m/i.test(unit) ? 1e6 : 1e3;
  const full = n * mult;
  const out = [];
  const grouped = Math.round(full).toLocaleString("en-US");
  out.push({ what: grouped, re: new RegExp("(?<![\\d,])" + loose(grouped) + "(?![\\d,])") });
  // "1.07 million", "1.1 million", "1 million"; likewise billion
  if (full >= 1e6) {
    const word = full >= 1e9 ? "billion" : "million";
    const base = full / (full >= 1e9 ? 1e9 : 1e6);
    /* both the stripped and the unstripped rounding: a writer may set 5.96M as "5.96 million",
       "6.0 million" or "6 million", and dropping the middle form let two cards through. */
    const forms = new Set();
    const floor1 = (Math.floor(base * 10) / 10).toFixed(1);   // 6.25M written down as "6.2 million"
    for (const form of [base.toFixed(2), base.toFixed(1), base.toFixed(0), floor1]) {
      forms.add(form);
      forms.add(form.replace(/\.?0+$/, "") || form);
    }
    for (const t of forms) out.push({ what: t + " " + word, re: new RegExp("(?<![\\d.])" + esc(t) + "\\s*" + word + "\\b") });
  }
  return out;
}

function nameShapes(raw) {
  const v = String(raw).replace(/\s*\([^)]*\)\s*$/, "").trim();
  if (!v || v === "?" || v.length < 4) return [];
  return [{ what: v, re: new RegExp("(?<![\\p{L}\\p{N}_])" + esc(v) + "(?![\\p{L}\\p{N}_])", "u") }];
}

/* THE RULE IS A MODULE BECAUSE TWO TOOLS ENFORCE IT — this file over the shipped corpus and
   add-card.js over one new card — and a second copy of a validation goes stale on a change made in
   a file nobody has reason to open (the scar add-card-tags.js left). */
function figureEchoes(card) {
  if (!card || !card.map || !Array.isArray(card.facts)) return [];
  const prose = strip(card.abstract);
  const okd = ADJUDICATED[card.id] || [];
  const hits = [];
  for (const [label, value] of card.facts)
    for (const sh of figureShapes(value))
      if (sh.re.test(prose) && !okd.includes(sh.what)) hits.push(label + ": " + sh.what);
  return hits;
}
module.exports = { figureEchoes, figureShapes, nameShapes, strip };

if (require.main !== module) return;

const cards = loadCards(ROOT).cards.filter(c => c.map && Array.isArray(c.facts) && c.facts.length);
const pool = cards.filter(c => (ONE ? c.id === ONE : c.id.startsWith(PREFIX)));

const figHits = [], nameHits = [];
for (const c of pool) {
  const prose = strip(c.abstract);
  const okd = ADJUDICATED[c.id] || [];
  for (const [label, value] of c.facts) {
    const isName = /^(capital|largest city|seat|administrative centre|centre)/i.test(label);
    for (const sh of figureShapes(value)) {
      if (sh.re.test(prose) && !okd.includes(sh.what)) figHits.push([c.id, label, sh.what]);
    }
    if (isName) for (const sh of nameShapes(value)) {
      if (sh.re.test(prose) && !okd.includes(sh.what)) nameHits.push([c.id, label, sh.what]);
    }
  }
}

console.log("\nA map card's background against its own facts grid\n");
console.log("  cards checked   " + pool.length + (PREFIX ? "  (prefix " + PREFIX + ")" : ""));
console.log("  figure echoes   " + figHits.length + "  in " + new Set(figHits.map(h => h[0])).size + " card(s)");
console.log("  name echoes     " + nameHits.length + "  in " + new Set(nameHits.map(h => h[0])).size + " card(s)   (read by eye; pass --names)");

if (figHits.length) {
  console.log("\n  the background states a figure the grid already prints:");
  for (const [id, label, what] of figHits) console.log("    " + id.padEnd(10) + label.padEnd(15) + what);
}
if (SHOW_NAMES && nameHits.length) {
  console.log("\n  the background names a city the grid already names (a judgement, never a failure):");
  for (const [id, label, what] of nameHits) console.log("    " + id.padEnd(10) + label.padEnd(15) + what);
}
console.log("");
if (!figHits.length) console.log("no background restates its own grid.\n");
process.exit(REPORT || !figHits.length ? 0 : 1);
