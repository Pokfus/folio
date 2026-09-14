#!/usr/bin/env node
/* gw-audit.js — how far the World geography backgrounds are from the four rules of
   docs/geography-background-plan.md, measured rather than asserted.
     node .claude/gw-audit.js [--list=us|grid|nature|dateline|borders] [--prefix=gw-]
   Report-only; it exits 0 whatever it finds, like card-focus.js, because every one of its
   four questions is a judgement at the level of the single card and only a count at the
   level of the collection.
   IT EXISTS BECAUSE THE PLAN QUOTED FIGURES AND THEY WERE MEASURED FOUR DIFFERENT WAYS.
   The first cut of this pass reported 205 grid repeats and 119 landscape mentions against
   396 and 237 here, on the same data — the earlier sweep having matched only whole facts
   VALUES and a shorter word list. A figure in prose cannot say how it was taken; a script
   can, so the plan now points at this and quotes nothing.
   Not part of the site. */
"use strict";
const path = require("path");
global.window = {};
require(path.join(__dirname, "..", "data.js"));

const args = process.argv.slice(2);
const arg = (k, d) => { const a = args.find((x) => x.startsWith("--" + k + "=")); return a ? a.slice(k.length + 3) : d; };
const PREFIX = arg("prefix", "gw-");
const LIST = arg("list", "");

/* The United States by any of the names a background actually uses. "America" alone is NOT
   in it: "South America" is the continent Brazil is on, and matching it reports every South
   American card as a violation.
   The ADJECTIVE has the same trap one word further in, and it was missed until Sep 2026: a bare
   \bAmerican\b matches "South American", "North American", "Latin American" and "Central
   American", none of which is the United States. Measured over the shipped gw- cards at the time,
   8 of the 307 rule-1 findings were that and nothing else — every one of them a background this
   pass had already rewritten, so the rule was reporting a permanent false finding on exactly the
   cards it had finished with. The lookbehind excludes the compounds and leaves "American" and
   "Americans" alone. */
const US = /\bUnited States\b|\bU\.S\.|\bU\.S\b|(?<!(?:South|North|Latin|Central|Meso)[- ])\bAmericans?\b|\bWashington\b/;

/* Landform, water, weather. A card that names none of these is telling a reader nothing about
   the place whose shape it has just asked them to recognise. */
const NATURE = new RegExp("\\b(mountain|mountains|river|rivers|coast|coastal|coastline|plateau|desert|delta|" +
  "climate|rainfall|rain|monsoon|forest|rainforest|plain|plains|island|islands|basin|savannah|savanna|" +
  "tropical|temperate|glacier|glacial|volcano|volcanic|lagoon|steppe|tundra|snow|snowfall|drought|cyclone|" +
  "typhoon|latitude|altitude|highland|lowland|valley|gorge|peninsula|archipelago|estuary|swamp|marsh|" +
  "grassland|arid|semi-arid|humid|equator|sea|lake|bay|gulf|strait)\\b", "i");

/* RULE 4 — the neighbours. A background may not name the countries that border it: the card
   shows the shape on a globe with every neighbour drawn around it, so a list of them is the
   one thing on the card a reader can already see.
   THE VOCABULARY IS THE DECK'S OWN ANSWER TERMS, not an outside list of country names — the
   same reason D1 gives for deriving a batch's list from the glossary's own keys: an outside
   list spells Côte d'Ivoire and Cabo Verde its own way and silently matches nothing.
   IT IS A PROXY AND IT SAYS SO. A country name is a finding only where it stands in a
   BORDERING construction — a compass bearing, or a border word — because a background may
   legitimately name another country for a hundred other reasons (a colonial ruler, a treaty,
   a shared river, a federation it left). And a name inside a longer geographic name is
   masked first, from both directions: the Gulf of Guinea is not Guinea and the Democratic
   Republic of the Congo is not the Congo, and the South CHINA Sea is not China nor the Korea
   Bay Korea. Read the list; do not sweep it. */
const MASK = [
  /\b(Gulf|Sea|Bay|Strait|Straits|Republic|Kingdom|Federation|Union|Territory|Territories) of (the )?[A-Z][\w'\u2019-]*/g,
  /\b[A-Z][\w'\u2019-]*(\s+[A-Z][\w'\u2019-]*)*\s+(Sea|Ocean|Gulf|Bay|Channel|Strait|Straits|Peninsula|Plateau|Desert|Mountains|Basin|Delta|Valley|Highlands|Islands?|Rift)\b/g,
];
const BORDERISH = new RegExp("(to (its|the) (north|south|east|west|north-east|north-west|south-east|south-west)" +
  "|border(s|ed|ing)?\\b|frontier|adjoin(s|ing)?\\b|shares? (its )?(land )?(borders?|frontiers?)" +
  "|bounded by|flanked by|hemmed in by)", "i");

/* ADJUDICATED — the findings that have been READ and are the right answer, declared with the
   reason beside each, on `check-cards.js`'s own model. It exists because by Sep 2026 the pass had
   rewritten every card it could and the four counts still read 5 / 3 / 0 / 2 — every one of which,
   read, was the measure reporting itself rather than work outstanding. A count that can never reach
   zero stops being read, which is how a real finding hides among ten standing ones.
   A ROW MATCHES ONLY WHEN THE CARD, THE RULE AND THE MATCHED TEXT ALL AGREE, so a card excused for
   naming its own subject still reports the day it names something else: `gw-135` is excused for
   "United States" and would report on "Washington". Nothing here is a pattern — the alternative,
   "exempt a card whose answer term contains the matched words", also excuses `gw-134 Uruguay` for
   "the American continent", which was a real finding and was fixed.
   ADD A ROW ONLY AFTER READING THE CARD, and record why in the plan's batch log. */
const ADJUDICATED = {
  /* rule 1 — the card's own subject IS the United States or one of its territories, so the words
     cannot come out; the plan's "seven cards exempt by subject". */
  us: {
    "gw-003": ["United States"],       // the card's own answer term
    "gw-135": ["United States"],       // Puerto Rico: the forest system and the currency, both unavoidable
    "gw-193": ["United States"],       // the card's own answer term
    "gw-207": ["American"],            // American Samoa: the card's own answer term
    "gw-503": ["Washington"],          // the card's own answer term, plus the president and the monument
  },
  /* rule 2 — the grid's value stands inside a LONGER name, or names the place an event happened at
     rather than repeating the cell. */
  grid: {
    "gw-002": ["Shanghai"],            // where the Communist Party was founded in 1921, not the largest-city cell
    "gw-151": ["Riga"],                // "the Gulf of Riga": a gulf named for a city is not the city
    "gw-188": ["Tarawa"],              // "South Tarawa", the urban area, which is not the capital cell
    "gw-009": ["Moscow"],              // the medieval principality that gathered the others in, not the
                                       // capital cell: the rise of Moscow IS the history rule 5 asks for
    "gw-025": ["Rome"],               // the city that took the peninsula by 264 BCE, not the capital cell:
                                       // the same shape as gw-009, and the ordinary case rather than the exception
  },
  /* rule 4 — another country named for one of the hundred other reasons the rule's own header
     allows, in a sentence that happens to carry a border word. */
  borders: {
    "gw-005": ["India"],               // "British India was partitioned": the 1947 partition, not a neighbour list
    "gw-053": ["Spain"],               // "independence from Spain": the colonial power, not a neighbour
  },
};
/* every matched string on this card is declared for this rule */
const adjudicated = (rule, id, found) => {
  const row = ADJUDICATED[rule] && ADJUDICATED[rule][id];
  return !!row && found.length > 0 && found.every((x) => row.includes(x));
};
let adjCount = 0;

const cards = window.CARD_DATA.filter((c) => String(c.id).startsWith(PREFIX));
/* every gw- answer term BELOW 500, longest first: 001-233 are the countries and territories
   and 501+ are their capitals, and a capital's name in the vocabulary reports Victoria for
   Lake Victoria, Stanley for a mountain and Riga for a gulf. Longest first so "Democratic
   Republic of the Congo" is claimed before "Congo" and "South Africa" before "South Sudan"
   can steal the word South.
   IT IS READ OFF THE WHOLE DECK, NEVER OFF THE FILTERED SET, and that was a live fault until
   Sep 2026: taken from `cards`, a run under --prefix=gw-5 had an EMPTY vocabulary, so rule 4
   reported 0 on every capital hundred and read as a rule those cards passed. A check that
   silently measures nothing under a filter is worse than one that refuses the filter. */
const COUNTRIES = window.CARD_DATA.filter((c) => /^gw-\d+$/.test(String(c.id)) && Number(String(c.id).slice(3)) < 500)
  .map((c) => String(c.answerText || "").trim())
  .filter((n) => n.length > 3).sort((a, b) => b.length - a.length);
const plain = (s) => String(s || "").replace(/<sup[^>]*><\/sup>/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const hit = { us: [], grid: [], nature: [], dateline: [], borders: [] };
let shareSum = 0, shareN = 0;

for (const c of cards) {
  /* THE CARD'S OWN NAME IS MASKED BEFORE THE GRID TEST, and the word boundary below is why it has to
     be (Sep 2026). That boundary was added for a capital whose name is a PREFIX of its country's —
     "Tunis" inside "Tunisia" — and it does nothing for the mirror case, a capital whose name CONTAINS
     its country's as a whole word: "Guatemala City", "Panama City", "Kuwait City", "Mexico City". The
     grid's first row is Country, so every one of those four was reported as repeating a value it had
     never printed, on the strength of the bolded answer term the house style REQUIRES an abstract to
     open on. A rule that reports a card for naming itself is reporting the house style.
     IT IS SCOPED TO THAT ONE RULE. Masking the answer term in `p` outright also moved rule 1 from 153
     findings to 150, because three capitals are named Washington or the like — a different question,
     answered by the seven-card subject exemption, and not one this mask may quietly re-answer. */
  const p = plain(c.abstract);
  const pSelf = p.split(String(c.answerText || "\u0000")).join(" ");
  const usFound = [...new Set((p.match(new RegExp(US.source, "g")) || []).map((x) => x.trim()))];
  if (usFound.length) { if (adjudicated("us", c.id, usFound)) adjCount++; else hit.us.push(c.id); }
  if (!NATURE.test(p)) hit.nature.push(c.id);
  /* A grid repeat is the VALUE as the grid prints it, minus its imperial bracket — "New Delhi",
     "1.46B", "3,287,263 km²". A bare place name counts: the grid has already said it.
     IT NEEDS A WORD BOUNDARY, and the reason is a country whose capital's name is a prefix of its
     own: "Tunis" is inside "Tunisia", "Kuwait City" aside "Kuwait", "Panama" inside "Panama City",
     "Djibouti", "Guatemala", "Mexico", "Singapore" and a dozen more. A bare substring test reports
     every one of those cards as repeating a value it never printed. */
  const facts = (c.facts || []).map((f) => String(f[1]).replace(/\s*\(.*$/, "").trim()).filter((v) => v.length > 2);
  const rep = facts.filter((v) => {
    let i = -1;
    while ((i = pSelf.indexOf(v, i + 1)) >= 0) {
      const before = pSelf[i - 1] || " ", after = pSelf[i + v.length] || " ";
      if (!/[A-Za-z]/.test(before) && !/[A-Za-z]/.test(after)) return true;
    }
    return false;
  });
  if (rep.length) { if (adjudicated("grid", c.id, rep)) adjCount++; else hit.grid.push(c.id + "  (" + rep.join(" / ") + ")"); }
  if (/\bUS\b|U\.S\.|United States|American/.test(String(c.answerDate || ""))) hit.dateline.push(c.id);
  const sents = p.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sents.length) { shareSum += sents.filter((s) => US.test(s)).length / sents.length; shareN++; }
  /* rule 4: another country's name standing in a bordering construction, in the same sentence */
  const self = String(c.answerText || "");
  const named = [];
  for (const s of sents) {
    if (!BORDERISH.test(s)) continue;
    let t = s;
    for (const m of MASK) t = t.replace(m, (x) => "\u0000".repeat(x.length));
    for (const n of COUNTRIES) {
      if (n === self) continue;
      const i = t.indexOf(n);
      if (i < 0) continue;
      const before = t[i - 1] || " ", after = t[i + n.length] || " ";
      if (/[A-Za-z]/.test(before) || /[A-Za-z]/.test(after)) continue;
      named.push(n);
      t = t.slice(0, i) + "\u0000".repeat(n.length) + t.slice(i + n.length);
    }
  }
  if (named.length) {
    const uniq = [...new Set(named)];
    if (adjudicated("borders", c.id, uniq)) adjCount++; else hit.borders.push(c.id + "  (" + uniq.join(", ") + ")");
  }
}

const pad = (s) => String(s).padStart(5);
console.log("\nThe " + PREFIX + " backgrounds against the four rules\n");
console.log("  cards                                 " + pad(cards.length));
console.log("  1. mention the United States          " + pad(hit.us.length));
console.log("     mean share of their sentences      " + pad((shareSum / (shareN || 1) * 100).toFixed(0) + "%"));
console.log("  2. repeat a facts-grid value          " + pad(hit.grid.length));
console.log("  3. name NO landform, water or weather " + pad(hit.nature.length));
console.log("  4. name a bordering country           " + pad(hit.borders.length));
console.log("     date lines naming the United States" + pad(hit.dateline.length));
console.log("  adjudicated: read and kept as they are" + pad(adjCount));
if (LIST && hit[LIST]) { console.log("\n" + LIST + ":"); hit[LIST].forEach((x) => console.log("  " + x)); }
console.log("");
