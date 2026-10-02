#!/usr/bin/env node
/*
  apply-wiki-links.js — write each card's Wikipedia article title onto the card, from wiki-links.json.

    node .claude/apply-wiki-links.js [--dry]

  Reads  .claude/wiki-links.json   (made by find-wiki-links.js: one entry per card, with `title` and
                                    `url` where a dedicated article was found)
  Writes the cards, through card-io, with `wiki` = the article's exact title on every card that has
  one and NO `wiki` field on every card that has not. It is idempotent and it is the ONLY writer of
  that field: to change a card's link, edit wiki-links.json (set the entry's `url` and `title` to
  null to take a link away, or put the right title in) and run this again.

  `wiki` is a HEAVY field (card-io's EXTRA_FIELDS / app.js's CARD_EXTRA_FIELDS), so it lands in
  data-extra/<prefix>.js, not data.js: the only reader is learnMoreHTML in app.js, which runs after
  the card's lazy half has arrived, and 4,700 titles on the eager path would be weight for nothing.
*/
"use strict";
const fs = require("fs");
const path = require("path");
const { loadCards, writeCards } = require(path.join(__dirname, "card-io.js"));

const DRY = process.argv.includes("--dry");
const links = JSON.parse(fs.readFileSync(path.join(__dirname, "wiki-links.json"), "utf8")).cards || {};
const { cards, tree } = loadCards();

let set = 0, cleared = 0, kept = 0, unknown = 0;
for (const c of cards) {
  const e = links[c.id];
  const title = e && e.url && typeof e.title === "string" && e.title.trim() ? e.title.trim() : "";
  if (!e) unknown++;
  if (title) {
    if (c.wiki === title) kept++; else { c.wiki = title; set++; }
  } else if (c.wiki !== undefined) {
    delete c.wiki; cleared++;
  }
}
console.log(`${cards.length} cards: ${set} set, ${cleared} cleared, ${kept} unchanged, ${unknown} not in wiki-links.json (run find-wiki-links.js for them)`);
if (!DRY) { writeCards(cards, tree); console.log("written"); }
