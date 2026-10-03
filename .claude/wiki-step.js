/* ============================================================================
   wiki-step.js — the Learn-more link a NEW CARD ships with.

     const { linkNewCards } = require("./wiki-step");
     linkNewCards(["rm-801", "rm-802"]);      // resolves, applies, prints one line per card

   A card's answer term may have a dedicated English Wikipedia article, and the tile at the foot of the
   card (`learnMoreHTML` in app.js) links to it. The pass that did this for the whole corpus is
   find-wiki-links.js + apply-wiki-links.js; this is the same pass for just the cards a session has
   written, run by add-card.js (one card) and import-batch.js (a batch) straight after the write, so a
   new card ships with its link the way it ships with its citations and its glossary term — not in a
   later sweep that goes out of date the next morning.

   WHAT IT DOES, in order: find-wiki-links.js --cards=<ids> --max-wait=90 (the title is resolved through
   Wikipedia's API with redirects followed, disambiguation pages caught, nothing guessed), then
   apply-wiki-links.js (which writes the heavy field `wiki` onto the cards, through card-io). Then it
   prints what happened to each card, and says so plainly when a card has none: "no dedicated article"
   is an answer ("Palace storerooms and pithoi" has none and must show no tile), not a failure.

   IT NEVER FAILS THE CARD. By the time this runs the card is already written, and Wikipedia being rate
   limited or the network being down is no reason to refuse it. If the lookup cannot finish it returns
   { ok: false } and prints the exact command that finishes it; until that is run,
   `apply-wiki-links.js --check` (a CI step) fails on the card, which is what stops it being forgotten.

   A STATUS THAT NEEDS A GLANCE is flagged in the output — a redirect to a differently named article, a
   disambiguation page settled by hint words, a search match — because those are the three ways a link
   can be to a neighbour of the right article rather than the article itself. To correct one, edit its
   entry in .claude/wiki-links.json, add `"manual": true` and re-run apply-wiki-links.js.
   ============================================================================ */
"use strict";
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const HERE = __dirname;
const LINKS = path.join(HERE, "wiki-links.json");
const GLANCE = new Set(["redirect-broader", "disambig-resolved", "search-match"]);

function run(script, args, timeout) {
  return spawnSync(process.execPath, [path.join(HERE, script), ...args], {
    encoding: "utf8", timeout: timeout || 300000,
    env: { ...process.env, NODE_USE_ENV_PROXY: "1" },   // Node's fetch only goes through the cloud proxy with this
  });
}

function linkNewCards(ids, opts) {
  const o = opts || {};
  const say = o.quiet ? () => {} : (l) => console.log(l);
  ids = [...new Set((ids || []).filter(Boolean))];
  if (!ids.length) return { ok: true, linked: [], none: [], glance: [] };
  const retry = "NODE_USE_ENV_PROXY=1 node .claude/find-wiki-links.js --cards=" + ids.join(",") + " && node .claude/apply-wiki-links.js";

  const f = run("find-wiki-links.js", ["--cards=" + ids.join(","), "--max-wait=" + (o.maxWait || 90)], 240000);
  if (f.status !== 0) {
    say("  WIKIPEDIA LINK NOT RESOLVED for " + ids.join(", ") + " (" + (f.status === 2 ? "Wikipedia did not answer in time" : "the lookup failed") + "). The card is written.");
    say("  Finish it with:  " + retry);
    return { ok: false, retry };
  }
  const a = run("apply-wiki-links.js", [], 240000);
  if (a.status !== 0) {
    say("  WIKIPEDIA LINK RESOLVED BUT NOT APPLIED for " + ids.join(", ") + ": " + ((a.stderr || a.stdout || "").trim().split("\n").slice(-2).join(" | ")));
    say("  Finish it with:  node .claude/apply-wiki-links.js");
    return { ok: false, retry: "node .claude/apply-wiki-links.js" };
  }

  let entries = {};
  try { entries = JSON.parse(fs.readFileSync(LINKS, "utf8")).cards || {}; } catch (e) { /* reported below as unresolved */ }
  const linked = [], none = [], glance = [];
  for (const id of ids) {
    const e = entries[id];
    if (!e) { none.push(id); say("  " + id + ": no Wikipedia entry written — run: " + retry); continue; }
    if (e.url) {
      linked.push(id);
      const flag = GLANCE.has(e.status) ? "   <- CHECK: " + e.status + (e.from ? " (from " + e.from + ")" : "") : "";
      if (flag) glance.push(id);
      say("  " + id + ": Learn-more -> " + e.title + flag);
    } else {
      none.push(id);
      const hint = e.suggestions && e.suggestions.length ? " (search offered: " + e.suggestions.slice(0, 3).join("; ") + ")" : "";
      say("  " + id + ": no dedicated Wikipedia article (" + e.status + ") — no tile" + hint);
    }
  }
  if (glance.length) say("  Glance at the link(s) marked CHECK above; to correct one, edit its entry in .claude/wiki-links.json, add \"manual\": true, run apply-wiki-links.js.");
  return { ok: true, linked, none, glance };
}

module.exports = { linkNewCards };
