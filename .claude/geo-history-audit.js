#!/usr/bin/env node
/* geo-history-audit.js — RULE 5 of docs/geography-background-plan.md, measured rather than asserted:
   does a geography card's SECOND block summarise the whole history of its answer term, or one
   moment of it?
     node .claude/geo-history-audit.js [--prefix=gw-|geo-|gc-] [--list=nodate|span|reach] [--card=<id>]
   Report-only; it exits 0 whatever it finds, like gw-audit.js beside it, because every one of its
   three questions is a judgement at the level of the single card and only a count at the level of
   the collection.

   IT IS A SEPARATE SCRIPT FROM `gw-audit.js` AND THAT IS DELIBERATE. Rules 1-4 are about a
   background written from an American source, so rule 1 (no United States) is nonsense on the
   United States collection and rule 4's vocabulary is the world deck's own answer terms. Rule 5
   binds on ALL THREE geography collections — `gw-` the world, `geo-` the United States, `gc-`
   China — so running gw-audit.js at `--prefix=geo-` to reach it would report 100 legitimate
   mentions of the United States as violations. A check that reports the house style is a check
   nobody runs.

   IT IS A PROXY AND IT SAYS SO, in three named ways:
   · A block that reaches back by NAMED ERA rather than by date ("under the Ottomans", "the Tang")
     is telling a reader the same thing and carries no year for this to read. Such a finding is a
     false one; the list marks it `era:` with the words it found, so it can be read rather than
     swept, and the ones read are DECLARED below.
   · A span is measured between the earliest and the latest date the block names, so a block naming
     one date has a span of zero whether it covers a millennium or an afternoon.
   · A BARE THREE-DIGIT YEAR IS NOT READ. `years()` takes a plain number as a year only in the
     1000-2029 band, because this reads PROSE rather than a date line and a bare 712 or 730 in a
     background is as often a rainfall figure, a page or a count of rivers. So a block whose deep
     end is "invaded Sindh in 712" or "chose Gopala as its king about 730" reports its earliest
     date as the next one up. It under-reports and never over-reports, which is the safe direction
     for a measure whose findings are read one at a time.
   · The bars are set from the collection's own measured distribution (below), not from a principle.
     They separate "most of these" from "the best of these"; they cannot separate a good paragraph
     from a bad one.
   READ THE LIST; DO NOT SWEEP IT.

   THE BARS, and where they come from. Measured 2026-09-14, over the 626 shipped geography cards,
   before the first rule-5 batch: the median gw- history block spans 52 years and its median
   earliest date is 1950 — that is, half the world deck's history paragraphs begin after the
   country was already independent. 300 years is a fifth of the gw- deck's spans and a tenth of
   geo-'s; 1800 is where a country's own record of itself reliably begins. Both are ROUND NUMBERS
   CHOSEN TO BE READABLE, and a card just under either is not thereby wrong.
   Not part of the site. */
"use strict";
const path = require("path");
global.window = {};
require(path.join(__dirname, "..", "data.js"));

const args = process.argv.slice(2);
const arg = (k, d) => { const a = args.find((x) => x.startsWith("--" + k + "=")); return a ? a.slice(k.length + 3) : d; };
const PREFIX = arg("prefix", "");
const LIST = arg("list", "");
const CARD = arg("card", "");

const SPAN_BAR = 300;   // years between the earliest and latest date the history block names
const REACH_BAR = 1800; // the latest a whole history may begin

/* Period words that place a sentence before the modern state without naming a year. DECLARED, never
   patterned, for `CROSSREF_WRONG`'s reason: "any capitalised word before 'dynasty'" also matches a
   modern political party, and "colonial" is as often an adjective about the present. These are only
   ever used to MARK a finding for reading — nothing here excuses a card by itself. */
const ERA = new RegExp("\\b(prehistor\\w+|antiquity|ancient|medieval|mediaeval|classical era|" +
  "Stone Age|Bronze Age|Iron Age|Neolithic|Palaeolithic|Paleolithic|" +
  "Roman|Byzantine|Ottoman|Mughal|Achaemenid|Sassanid|Sasanian|Umayyad|Abbasid|Safavid|Timurid|" +
  "Han|Tang|Song|Yuan|Ming|Qing|Zhou|Qin|Sui|Five Dynasties|Warring States|" +
  "Inca|Aztec|Maya|Olmec|Nubian|Aksumite|Swahili|Mali Empire|Songhai|Kanem|Benin Empire|" +
  "Khmer|Srivijaya|Majapahit|Joseon|Goryeo|Silla|Heian|Edo|Tokugawa|" +
  "caliphate|sultanate|khanate|dynast\\w+|kingdom of|empire of|" +
  "pre-colonial|precolonial|before the colonial|for centuries|for millennia|" +
  "first settled|earliest inhabitants|indigenous|aboriginal)\\b", "i");

/* ADJUDICATED — findings that have been READ and are the right answer, declared with the reason
   beside each, on `gw-audit.js`'s and `check-cards.js`'s model. A ROW MATCHES ONLY WHEN THE CARD,
   THE RULE AND THE READING ALL AGREE: a card excused for a short span still reports the day its
   earliest date moves forward. ADD A ROW ONLY AFTER READING THE CARD, and record why in the plan's
   batch log. */
const ADJUDICATED = {
  nodate: {},
  span: {},
  reach: {},
};

const plain = (s) => String(s || "").replace(/<sup[^>]*><\/sup>/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

/* Years, in the forms a background actually writes them. It is NOT `cardYears`: that reads a DATE
   LINE, whose whole content is dates, where this reads prose and must not take a page number, a
   population or a height above sea level for a year. So a bare number is a year only in the 1000-2029
   band, and everything older has to carry its era word or its ordinal. */
function years(text) {
  const out = [];
  let s = " " + text + " ";
  const eat = (re, fn) => { s = s.replace(re, (...m) => { const v = fn(...m); if (v !== null) out.push(v); return " ".repeat(m[0].length); }); };
  eat(/(\d+)(?:st|nd|rd|th)\s+millennium\s+BCE/gi, (_, n) => -(Number(n) * 1000 - 500));
  eat(/(\d+)(?:st|nd|rd|th)\s+century\s+BCE/gi, (_, n) => -(Number(n) * 100 - 50));
  eat(/(\d+)(?:st|nd|rd|th)\s+millennium(?:\s+CE)?/gi, (_, n) => (Number(n) - 1) * 1000 + 500);
  eat(/(\d+)(?:st|nd|rd|th)\s+century(?:\s+CE)?/gi, (_, n) => (Number(n) - 1) * 100 + 50);
  eat(/(\d[\d,]*)\s*BCE/gi, (_, n) => -Number(String(n).replace(/,/g, "")));
  eat(/\b([1-9]\d{0,2})\s*CE\b/g, (_, n) => Number(n));
  /* the plain band, read WITHOUT consuming, since 1947 may be reached twice in one sentence */
  (s.match(/\b(1\d{3}|20[0-2]\d)\b/g) || []).forEach((m) => out.push(Number(m)));
  return out;
}

const cards = window.CARD_DATA.filter((c) => /^(gw-|geo-|gc-)/.test(String(c.id)) && String(c.id).startsWith(PREFIX));
if (!cards.length) { console.error("no cards match --prefix=" + PREFIX); process.exit(1); }

const read = (c) => {
  const blocks = String(c.abstract || "").split(" <br><br> ");
  const hist = plain(blocks[1] || "");
  const ys = years(hist);
  return {
    id: String(c.id), name: String(c.answerText || ""), hist, ys,
    min: ys.length ? Math.min(...ys) : null,
    max: ys.length ? Math.max(...ys) : null,
    span: ys.length ? Math.max(...ys) - Math.min(...ys) : null,
    era: (hist.match(new RegExp(ERA.source, "gi")) || []).slice(0, 4),
  };
};

if (CARD) {
  const c = window.CARD_DATA.find((x) => String(x.id) === CARD);
  if (!c) { console.error("no such card: " + CARD); process.exit(1); }
  const r = read(c);
  console.log("\n" + r.id + "  " + r.name);
  console.log("  dates in the history block : " + (r.ys.length ? [...new Set(r.ys)].sort((a, b) => a - b).join(", ") : "(none)"));
  console.log("  span                       : " + (r.span === null ? "-" : r.span + " years"));
  console.log("  earliest                   : " + (r.min === null ? "-" : r.min));
  console.log("  era words                  : " + (r.era.length ? r.era.join(", ") : "(none)"));
  console.log("\n" + r.hist + "\n");
  process.exit(0);
}

const hit = { nodate: [], span: [], reach: [] };
let adjCount = 0;
const adjudicated = (rule, id) => !!(ADJUDICATED[rule] && ADJUDICATED[rule][id]);
const note = (r) => r.era.length ? "   era: " + [...new Set(r.era.map((x) => x.toLowerCase()))].join(", ") : "";

for (const c of cards) {
  const r = read(c);
  if (!r.ys.length) { if (adjudicated("nodate", r.id)) adjCount++; else hit.nodate.push(r.id + "  " + r.name + note(r)); continue; }
  if (r.span < SPAN_BAR) { if (adjudicated("span", r.id)) adjCount++; else hit.span.push(r.id + "  " + r.name + "  (" + r.min + "–" + r.max + ", " + r.span + "y)" + note(r)); }
  if (r.min > REACH_BAR) { if (adjudicated("reach", r.id)) adjCount++; else hit.reach.push(r.id + "  " + r.name + "  (begins " + r.min + ")" + note(r)); }
}

const pad = (s) => String(s).padStart(5);
console.log("\nRule 5 — does the history block cover the whole history?   " + (PREFIX || "all three geography collections") + "\n");
console.log("  cards                                       " + pad(cards.length));
console.log("  5a. history block names no date at all      " + pad(hit.nodate.length));
console.log("  5b. spans under " + SPAN_BAR + " years                  " + pad(hit.span.length));
console.log("  5c. begins after " + REACH_BAR + "                        " + pad(hit.reach.length));
console.log("  adjudicated: read and kept as they are      " + pad(adjCount));
if (LIST && hit[LIST]) { console.log("\n" + LIST + ":"); hit[LIST].forEach((x) => console.log("  " + x)); }
else if (LIST) console.log("\n--list= takes nodate, span or reach");
console.log("");
