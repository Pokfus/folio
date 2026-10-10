/* src-target.js — a card's source bar, read out of app.js.
 *
 *     const { SRC_TARGET, SRC_TARGET_BY_DIFFICULTY, srcTargetFor } = require("./src-target.js");
 *
 * THE BAR IS TIERED BY DIFFICULTY (Sep 2026, on request): difficulty 1 → 9 sources, 2 → 8, 3 → 7,
 * 4 → 6, 5 → 5, and SRC_TARGET (5) is the floor for anything unrated. Both are SLICED out of app.js by
 * text rather than restated here, so the Edit page's chip and every helper agree about a card's bar —
 * and the run STOPS if the slice fails, since a helper silently measuring against a stale number is the
 * failure this module exists to close.
 *
 * Zero dependencies. Not part of the site.
 */
"use strict";
const fs = require("fs"), path = require("path");
const APP = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");

const m1 = /const SRC_TARGET = (\d+);/.exec(APP);
const m2 = /const SRC_TARGET_BY_DIFFICULTY = (\{[^}]*\});/.exec(APP);
const m3 = /const SRC_TARGET_BY_PREFIX = (\{[^}]*\});/.exec(APP);
if (!m1 || !m2 || !m3) {
  console.error("ERROR: src-target.js could not find SRC_TARGET / SRC_TARGET_BY_DIFFICULTY / SRC_TARGET_BY_PREFIX in app.js — has a constant been renamed?");
  process.exit(2);
}
const SRC_TARGET = +m1[1];
// the literal is plain JS ({ 1: 9, … }), so evaluate it rather than JSON.parse it
const SRC_TARGET_BY_DIFFICULTY = new Function("return " + m2[1])();
// a course collection's own, lower bar, keyed by card-id prefix ("gga-" → 2) — see app.js
const SRC_TARGET_BY_PREFIX = new Function("return " + m3[1])();

/* COURSE-ONLY COLLECTIONS (Oct 2026, on request): "for all cards you haven't built yet: you only need to use
   the sources I provided, no outside sources, and there is a lowered minimal source count; this collection
   is for private study only". The cards of The EU as an External Power from `eep-048` on are built from the
   course's own slides and set readings, which a card can cite once each, so the bar for them is ONE source
   rather than the tiered 5-9. The first 53 cards (written before the request) keep the full bar they were
   written to; this only lowers what a NEW or REPLACED `eep-` card must carry. See
   docs/eu-external-power-card-plan.md, "Course-only sourcing". */
const COURSE_ONLY = /^eep-/;
const COURSE_ONLY_MIN = 1;

function srcTargetFor(card) {
  if (card && COURSE_ONLY.test(String(card.id || ""))) return COURSE_ONLY_MIN;
  const id = card && typeof card.id === "string" ? card.id : "";
  for (const p of Object.keys(SRC_TARGET_BY_PREFIX)) if (id.indexOf(p) === 0) return SRC_TARGET_BY_PREFIX[p];
  const n = card && typeof card.difficulty === "number" ? card.difficulty : 0;
  return SRC_TARGET_BY_DIFFICULTY[n] || SRC_TARGET;
}

module.exports = { SRC_TARGET, SRC_TARGET_BY_DIFFICULTY, SRC_TARGET_BY_PREFIX, srcTargetFor };
