#!/usr/bin/env node
/* gw-audit.js — how far the World geography backgrounds are from the three rules of
   docs/geography-background-plan.md, measured rather than asserted.
     node .claude/gw-audit.js [--list=us|grid|nature|dateline] [--prefix=gw-]
   Report-only; it exits 0 whatever it finds, like card-focus.js, because every one of its
   three questions is a judgement at the level of the single card and only a count at the
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

const cards = window.CARD_DATA.filter((c) => String(c.id).startsWith(PREFIX));
const plain = (s) => String(s || "").replace(/<sup[^>]*><\/sup>/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const hit = { us: [], grid: [], nature: [], dateline: [] };
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
}

const pad = (s) => String(s).padStart(5);
console.log("\nThe " + PREFIX + " backgrounds against the three rules\n");
console.log("  cards                                 " + pad(cards.length));
console.log("  1. mention the United States          " + pad(hit.us.length));
console.log("     mean share of their sentences      " + pad((shareSum / (shareN || 1) * 100).toFixed(0) + "%"));
console.log("  2. repeat a facts-grid value          " + pad(hit.grid.length));
console.log("  3. name NO landform, water or weather " + pad(hit.nature.length));
console.log("     date lines naming the United States" + pad(hit.dateline.length));
if (LIST && hit[LIST]) { console.log("\n" + LIST + ":"); hit[LIST].forEach((x) => console.log("  " + x)); }
console.log("");
