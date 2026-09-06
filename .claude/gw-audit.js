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
   American card as a violation. */
const US = /\bUnited States\b|\bU\.S\.|\bU\.S\b|\bAmerican\b|\bAmericans\b|\bWashington\b/;

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

const cards = window.CARD_DATA.filter((c) => String(c.id).startsWith(PREFIX));
/* every gw- answer term BELOW 500, longest first: 001-233 are the countries and territories
   and 501+ are their capitals, and a capital's name in the vocabulary reports Victoria for
   Lake Victoria, Stanley for a mountain and Riga for a gulf. Longest first so "Democratic
   Republic of the Congo" is claimed before "Congo" and "South Africa" before "South Sudan"
   can steal the word South. */
const COUNTRIES = cards.filter((c) => Number(String(c.id).slice(3)) < 500)
  .map((c) => String(c.answerText || "").trim())
  .filter((n) => n.length > 3).sort((a, b) => b.length - a.length);
const plain = (s) => String(s || "").replace(/<sup[^>]*><\/sup>/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const hit = { us: [], grid: [], nature: [], dateline: [], borders: [] };
let shareSum = 0, shareN = 0;

for (const c of cards) {
  const p = plain(c.abstract);
  if (US.test(p)) hit.us.push(c.id);
  if (!NATURE.test(p)) hit.nature.push(c.id);
  /* A grid repeat is the VALUE as the grid prints it, minus its imperial bracket — "New Delhi",
     "1.46B", "3,287,263 km²". A bare place name counts: the grid has already said it. */
  const facts = (c.facts || []).map((f) => String(f[1]).replace(/\s*\(.*$/, "").trim()).filter((v) => v.length > 2);
  const rep = facts.filter((v) => p.includes(v));
  if (rep.length) hit.grid.push(c.id + "  (" + rep.join(" / ") + ")");
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
  if (named.length) hit.borders.push(c.id + "  (" + [...new Set(named)].join(", ") + ")");
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
if (LIST && hit[LIST]) { console.log("\n" + LIST + ":"); hit[LIST].forEach((x) => console.log("  " + x)); }
console.log("");
