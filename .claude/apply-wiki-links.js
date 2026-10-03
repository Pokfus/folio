#!/usr/bin/env node
/*
  apply-wiki-links.js — write each card's Wikipedia article title onto the card, from wiki-links.json.

    node .claude/apply-wiki-links.js [--dry]
    node .claude/apply-wiki-links.js --check     # offline, writes nothing; exit 1 if the cards are out of step

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
const CHECK = process.argv.includes("--check");
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
/* --check is the CI gate that makes "every card comes with its Learn-more link, where one exists" true
   of the whole corpus and not just of the sessions that remembered. Two ways to fail, both naming the
   command that fixes them: a card with NO entry (it was added without add-card.js's Wikipedia step, or
   that step could not reach Wikipedia), and a card whose `wiki` differs from its entry (wiki-links.json
   was edited and the applier not re-run). A card with an entry and no article passes: "none" is an
   answer. Nothing is written. */
if (CHECK) {
  const missing = cards.filter((c) => !links[c.id]).map((c) => c.id);
  if (missing.length) {
    console.error("FAIL  " + missing.length + " card(s) have no entry in .claude/wiki-links.json: " + missing.slice(0, 12).join(", ") + (missing.length > 12 ? ", …" : ""));
    const prefixes = [...new Set(missing.map((id) => id.replace(/\d+[a-z]?$/, "")))];
    const scope = missing.length <= 40 ? "--cards=" + missing.join(",") : prefixes.length <= 3 ? prefixes.map((p) => "--prefix=" + p).join(" (once each) ") : "(--prefix=<p>- for each collection listed)";
    console.error("      fix: NODE_USE_ENV_PROXY=1 node .claude/find-wiki-links.js " + scope + " && node .claude/apply-wiki-links.js");
  }
  if (set || cleared) console.error("FAIL  " + (set + cleared) + " card(s) carry a `wiki` that differs from wiki-links.json — fix: node .claude/apply-wiki-links.js");
  if (missing.length || set || cleared) process.exit(1);
  console.log("ok  every card has a Wikipedia entry and its `wiki` matches it");
  process.exit(0);
}
if (!DRY && (set || cleared)) { writeCards(cards, tree); console.log("written"); }
else if (!DRY) console.log("nothing to write");
