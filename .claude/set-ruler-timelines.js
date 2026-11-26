#!/usr/bin/env node
/* SET EVERY RULER'S TIMELINE FROM THE REIGN ROW OF ITS DATE LINE (2026-11-20, on request: "We have a rule that
   cards about individuals should not have timeline sections. Make an exception for rulers (emperors, kings,
   presidents, prime ministers etc). The dates of their reign should be shown as periods on the timeline and
   they should have a timeline section.")

     node .claude/set-ruler-timelines.js            dry run: what would be written, and every card skipped and why
     node .claude/set-ruler-timelines.js --write    write `timeline: { from, to }` onto each ruler card that lacks one
     node .claude/set-ruler-timelines.js --check    exit 1 if a ruler card with a readable reign row has no timeline

   A RULER is a card whose kind (first tag) is `person` or `ruler` and that is tagged `ruler`, or a `person` card
   whose date line has a head-of-state or head-of-government row (President, Prime Minister, Chancellor, In power).
   The span is read from the FIRST reign row the date line carries (REIGN_KEYS, in that order) and only when it is a
   plain range: "1762 – 1796", "c. 520 – 489 BCE", "22 April 1509 – 28 January 1547", "31 BCE – 14 CE". A trailing
   ", or …" / ", long chronology" keeps the first reading. Skipped and listed, never guessed: a single year, an open
   end ("to date"), a reign "in tradition", a card marked undatable, two reigns ("…, and …") and anything that does
   not parse. A card that already carries a timeline is left as it is (set it by hand with set-timeline.js).
   The precision is the row's own (a year, a month, a day), written as set-timeline.js writes it ("-0520" for 520 BCE).
   Goes through card-io like every writer. */
"use strict";
const { loadCards, writeCards } = require("./card-io");
const args = process.argv.slice(2), WRITE = args.includes("--write"), CHECK = args.includes("--check");
const REIGN_KEYS = ["Reigned", "Ruled", "Sole ruler", "Sole emperor", "Emperor", "Empress", "King", "Queen", "Tsar", "Khan", "Pharaoh",
  "Grand prince", "Prince of Moscow", "Ruled Kyiv", "President", "Prime Minister", "Chancellor", "In power"];
const OFFICE_KEYS = new Set(["President", "Prime Minister", "Chancellor", "In power"]);   // these make a person card a ruler without the tag
// a head-of-office row that is not a head of state or government
const NOT_RULERS = { "cnh-605": "Chancellor of Peking University, not of a state" };
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function rows(dl) {
  const out = []; const rx = /<span class="dt-k">([^<]*)<\/span><span class="dt-v">([^<]*)<\/span>/g; let m;
  while ((m = rx.exec(dl || ""))) out.push([m[1].trim(), m[2].trim()]);
  return out;
}
// one end of a range: "c. 22 April 1509 CE" → { y, m, d, era }
function end(s) {
  const t = s.replace(/^c\.\s*/, "").trim();
  const m = t.match(/^(?:(\d{1,2})\s+)?(?:([A-Z][a-z]+)\s+)?(\d{1,5})(?:\s+(BCE|CE))?$/);
  if (!m) return null;
  if (m[2] && MONTHS.indexOf(m[2]) < 0) return null;
  if (m[1] && !m[2]) return null;
  return { d: m[1] ? +m[1] : 0, m: m[2] ? MONTHS.indexOf(m[2]) + 1 : 0, y: +m[3], era: m[4] || "" };
}
const pad = (n, w) => String(n).padStart(w, "0");
const fmt = (e, bce) => (bce ? "-" + pad(e.y, 4) : String(e.y)) + (e.m ? "-" + pad(e.m, 2) + (e.d ? "-" + pad(e.d, 2) : "") : "");
function span(v) {
  if (/tradition|to date|present|\band\b|broken/i.test(v)) return { why: "not a plain range: " + v };
  const main = v.replace(/,\s*(or\b.*|long chronology.*|short chronology.*)$/i, "").trim();
  const parts = main.split(/\s+–\s+/);
  if (parts.length !== 2) return { why: "not a range: " + v };
  const a = end(parts[0]), b = end(parts[1]);
  if (!a || !b) return { why: "does not parse: " + v };
  const bBce = b.era === "BCE", aBce = a.era ? a.era === "BCE" : bBce;
  const sa = aBce ? -a.y : a.y, sb = bBce ? -b.y : b.y;
  if (sb < sa || (sa === sb && (b.m || 13) < (a.m || 0))) return { why: "ends before it starts: " + v };
  return { from: fmt(a, aBce), to: fmt(b, bBce) };
}

const { cards, tree } = loadCards();
const out = [], skipped = [];
for (const c of cards) {
  const tags = c.tags || [], kind = tags[0] || "";
  if (kind !== "person" && kind !== "ruler") continue;
  const R = rows(c.answerDate);
  const tagged = tags.includes("ruler"), office = R.some(([k]) => OFFICE_KEYS.has(k));
  if (!tagged && !office) continue;
  if (c.timeline) continue;
  if (NOT_RULERS[c.id]) { skipped.push([c.id, NOT_RULERS[c.id]]); continue; }
  if (c.undatable) { skipped.push([c.id, "marked undatable"]); continue; }
  if (R.some(([k]) => /^Traditional/.test(k))) { skipped.push([c.id, "a traditional date"]); continue; }
  let row = null; for (const k of REIGN_KEYS) { row = R.find(([rk]) => rk === k); if (row) break; }
  if (!row) { skipped.push([c.id, "no reign row (" + R.map(([k]) => k).join(", ") + ")"]); continue; }
  const s = span(row[1]);
  if (!s.from) { skipped.push([c.id, row[0] + ": " + s.why]); continue; }
  out.push([c, s, row]);
}
for (const [c, s, row] of out) console.log((WRITE ? "write " : "would ") + c.id.padEnd(9) + " " + String(c.answerText).padEnd(34) + " " + row[0] + ": " + row[1] + "  →  " + s.from + " … " + s.to);
for (const [id, why] of skipped) console.log("skip  " + id.padEnd(9) + " " + why);
console.log(out.length + " ruler card(s) " + (WRITE ? "given" : "to give") + " a timeline; " + skipped.length + " skipped.");
if (CHECK) process.exit(out.length ? 1 : 0);
if (WRITE && out.length) { for (const [c, s] of out) c.timeline = { from: s.from, to: s.to }; writeCards(cards, tree); }
