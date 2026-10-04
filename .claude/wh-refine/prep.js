#!/usr/bin/env node
/* prep.js <from> <to> — set up the scratch dir for a run of refinement drafts.
   [REFINE_PREFIX=rm-] WH_S=<scratch dir> node .claude/wh-refine/prep.js 101 200   (prefix: cfg.js)
   Writes $WH_S/cur/<id>.json (the card and its glossary entry as they stand now), $WH_S/index.tsv (id, answer,
   question for ALL 1000 cards of the prefix, for sibling checks) and empty out/ and pages/. Run from the repo root. */
"use strict";
const fs = require("fs"), path = require("path");
const { S, idOf } = require("./cfg.js");
const { loadCards } = require("../card-io.js"), { loadGlossary } = require("../gloss-io.js");
const lo = +process.argv[2], hi = +process.argv[3];
if (!lo || !hi) { console.error("usage: WH_S=<dir> node .claude/wh-refine/prep.js <from> <to>"); process.exit(2); }
for (const d of ["cur", "out", "pages"]) fs.mkdirSync(path.join(S, d), { recursive: true });
const { cards } = loadCards(), G = loadGlossary();
const norm = (s) => String(s || "").replace(/<[^>]*>/g, "").replace(/_/g, " ").replace(/\s*\([^)]*\)\s*$/, "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
const T = new Map();
for (const k of Object.keys(G.GLOSSARY)) { T.set(norm(k), k); (G.GLOSSARY_ALIASES[k] || []).forEach((a) => T.set(norm(a), k)); }
const idx = [];
for (let i = 1; i <= 1000; i++) {
  const id = idOf(i), c = cards.find((x) => x.id === id); if (!c) continue;
  if (i >= lo && i <= hi) {
    const k = T.get(norm(c.answer));
    const g = k ? { slug: k, description: G.GLOSSARY[k], date: G.GLOSSARY_DATES[k], aliases: G.GLOSSARY_ALIASES[k], tags: G.GLOSSARY_TAGS[k], sources: G.GLOSSARY_SOURCES[k], image: G.GLOSSARY_IMAGES[k] } : null;
    fs.writeFileSync(path.join(S, "cur", id + ".json"), JSON.stringify({ card: c, glossary: g }, null, 1));
  }
  idx.push(id + "\t" + c.answer + "\t" + c.question.replace(/<[^>]+>/g, "").replace(/_+/g, "____"));
}
fs.writeFileSync(path.join(S, "index.tsv"), idx.join("\n"));
console.log("prepared " + (hi - lo + 1) + " card(s) in " + S);
