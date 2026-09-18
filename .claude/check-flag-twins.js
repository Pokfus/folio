#!/usr/bin/env node
/*
 * check-flag-twins.js — has a Flags card drifted from its World Geography twin?
 *
 *   node .claude/check-flag-twins.js [--verbose]
 *
 * Report-only, exits 0.
 *
 * THIS IS THE ONE MAINTENANCE COST THE FLAGS COLLECTION CREATES, AND THE ONLY THING THAT CAN SEE IT.
 * `fl-NNN` is the same entity as `gw-NNN` and copies its answer side verbatim, on request — so a
 * correction made to a `gw-` background, date line, facts grid or citation list has to be carried to its
 * twin in the same commit. Nothing on the page can tell when it has not been: BOTH CARDS RENDER
 * PERFECTLY while saying different things about the same country, every checker in the pipeline passes
 * both, and a reader meets one or the other rather than the pair.
 *
 * IT IS A REPORT AND NOT A REFUSAL, deliberately. A divergence can be the right answer — a flag card's
 * `alt` is NOT its twin's (the twin's opens "The flag of X: ", which hands the answer over on a front),
 * and `tags` differs by the `flag` row the format adds — so those two are compared under their own
 * rules rather than for equality, and anything else is named for a human to read. What it must never do
 * is decide for you which of two readings is the correction.
 *
 * WHAT IT CHECKS
 *   1. Every shipped `fl-NNN` has a `gw-NNN`, and vice versa where the twin carries a flag.
 *   2. The COPIED fields are byte-identical: answer, answerText, answerDate, abstract, sources, facts,
 *      difficulty, category.
 *   3. The two fields that legitimately differ, differ CORRECTLY: `answerFlag.src` and `.credit` are the
 *      same file and the same credit, `.alt` is NOT the twin's and does not name the answer, and `tags`
 *      is the twin's tags plus `flag`.
 *   4. The format itself: `flagCard` is true, `questions` is empty, no `map`, no `artwork`, no `image`.
 *
 * Not part of the site. See docs/flags-card-plan.md.
 */
"use strict";
global.window = {};
const { loadCards } = require("./card-io.js");

const COPY = ["answer", "answerText", "answerDate", "abstract", "difficulty", "category"];
const DEEP = ["sources", "facts"];
const verbose = process.argv.includes("--verbose");

const cards = loadCards().cards;
const byId = new Map(cards.map((c) => [c.id, c]));
const flags = cards.filter((c) => /^fl-\d{3}$/.test(c.id)).sort((a, b) => a.id.localeCompare(b.id));

const findings = [];
const note = (id, what, detail) => findings.push([id, what, detail]);

// any card wearing the format that is not in this collection at all is worth knowing about
for (const c of cards) {
  if (c.flagCard === true && !/^fl-\d{3}$/.test(c.id)) note(c.id, "wears `flagCard` but is not an fl- card", "");
}

for (const c of flags) {
  const twinId = "gw-" + c.id.slice(3);
  const t = byId.get(twinId);
  if (!t) { note(c.id, "no twin", twinId + " is not in data.js"); continue; }

  for (const f of COPY) {
    const a = c[f] == null ? "" : String(c[f]), b = t[f] == null ? "" : String(t[f]);
    if (a !== b) note(c.id, "`" + f + "` differs from " + twinId, first(a, b));
  }
  for (const f of DEEP) {
    const a = JSON.stringify(c[f] == null ? [] : c[f]), b = JSON.stringify(t[f] == null ? [] : t[f]);
    if (a !== b) note(c.id, "`" + f + "` differs from " + twinId, first(a, b));
  }

  // the flag itself is the SAME file and the SAME credit — a different one is two attributions for one picture
  const cf = c.answerFlag || {}, tf = t.answerFlag || {};
  if (!String(cf.src || "").trim()) note(c.id, "no answerFlag.src", "the flag IS the question");
  else if (String(cf.src) !== String(tf.src || "")) note(c.id, "a different flag file from " + twinId, first(String(cf.src), String(tf.src || "")));
  if (String(cf.credit || "") !== String(tf.credit || "")) note(c.id, "a different credit from " + twinId, first(String(cf.credit || ""), String(tf.credit || "")));

  // …and the alt DELIBERATELY differs. What is checked is that it differs the right way.
  const alt = String(cf.alt || "").trim(), ansT = String(c.answerText || "").trim();
  if (!alt) note(c.id, "no answerFlag.alt", "on this format the alt is the question for a reader who cannot see the flag");
  else {
    if (ansT && alt.toLowerCase().indexOf(ansT.toLowerCase()) >= 0) note(c.id, "the alt NAMES the answer", alt.slice(0, 110));
    if (/^the flag of /i.test(alt)) note(c.id, "the alt still opens “The flag of …”", alt.slice(0, 110));
  }

  // tags: the twin's, plus `flag`
  const ct = (c.tags || []).slice(), tt = (t.tags || []).slice();
  if (!ct.includes("flag")) note(c.id, "no `flag` tag", ct.join(", "));
  const want = tt.filter((x) => x !== "flag").sort().join("|");
  const have = ct.filter((x) => x !== "flag").sort().join("|");
  if (want !== have) note(c.id, "tags differ from " + twinId + " beyond `flag`", first(have, want));
  if (ct[0] !== tt[0]) note(c.id, "tag 1 is not the twin's kind", JSON.stringify(ct[0]) + " against " + JSON.stringify(tt[0]));

  // the format
  if (c.flagCard !== true) note(c.id, "`flagCard` is not true", "it would render as an ordinary cloze card with no flag on the front");
  if (Array.isArray(c.questions) && c.questions.length) note(c.id, "carries extra question phrasings", String(c.questions.length));
  if (c.map) note(c.id, "carries `map`", "a `map` block makes it a MAP card, whose window goes on the FRONT and shades the answer");
  if (c.artwork === true) note(c.id, "carries `artwork`", "two formats in one slot");
  if (c.image && c.image.src) note(c.id, "carries `image`", "the flag is this card's picture; a second one duplicates its twin's photograph");
}

// a twin that HAS a flag and no flag card yet is the collection's own backlog rather than a fault
const pending = [];
for (const t of cards) {
  if (!/^gw-\d{3}$/.test(t.id) || Number(t.id.slice(3)) > 233) continue;
  if (byId.has("fl-" + t.id.slice(3))) continue;
  pending.push([t.id, t.answerText, !!(t.answerFlag && t.answerFlag.src)]);
}

function first(a, b) {
  for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) return "at char " + i + ": " + JSON.stringify(a.slice(Math.max(0, i - 25), i + 35)) + " vs " + JSON.stringify(b.slice(Math.max(0, i - 25), i + 35));
  return "";
}

console.log("Flags against their World Geography twins\n");
console.log(`  ${flags.length} flag card${flags.length === 1 ? "" : "s"} shipped, of 233 planned.`);
const ready = pending.filter((p) => p[2]).length;
console.log(`  ${pending.length} twins have no flag card yet — ${ready} of them already carry a flag, ${pending.length - ready} need one fetched.`);
if (verbose && pending.length) {
  pending.forEach(([id, name, has]) => console.log(`    ${id}  ${name}${has ? "" : "   (no flag on the twin)"}`));
}

if (!findings.length) { console.log("\n  Every shipped card matches its twin."); process.exit(0); }
console.log(`\n  ${findings.length} finding${findings.length === 1 ? "" : "s"} — read each, and decide which of the two is the correction:\n`);
for (const [id, what, detail] of findings) console.log(`    ${id}: ${what}${detail ? "\n        " + detail : ""}`);
process.exit(0);
