#!/usr/bin/env node
/* related.js <regex> — list gr-/rm-/cnh-/in-/ru-/eg- cards whose answer matches (case-insensitive).
   related.js --card <id> — print that card's answer, date line, abstract and sources.
   Run from the repo root: node .claude/wh-refine/related.js */
const { loadCards } = require("../card-io.js");
const { cards } = loadCards();
const strip = (s) => String(s || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
if (process.argv[2] === "--card") {
  const c = cards.find((x) => x.id === process.argv[3]); if (!c) { console.log("no such card"); process.exit(1); }
  console.log(c.id + " | " + c.answer + "\nDATE: " + strip(c.answerDate) + "\nQ: " + strip(c.question) + "\nABSTRACT: " + strip(c.abstract) + "\nSOURCES:\n" + (c.sources || []).map((s, i) => (i + 1) + ". " + strip(s)).join("\n") + "\nIMAGE: " + JSON.stringify(c.image || null) + "\nUNDATABLE: " + c.undatable);
} else {
  const re = new RegExp(process.argv[2], "i");
  cards.filter((c) => /^(gr|rm|cnh|in|eg|ru|us|jp|ko|ww2)-/.test(c.id) && (re.test(c.answer) || re.test(strip(c.question)))).slice(0, 25)
    .forEach((c) => console.log(c.id + "\t" + c.answer + "\t" + strip(c.answerDate)));
}
