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
if (!m1 || !m2) {
  console.error("ERROR: src-target.js could not find SRC_TARGET / SRC_TARGET_BY_DIFFICULTY in app.js — has a constant been renamed?");
  process.exit(2);
}
const SRC_TARGET = +m1[1];
// the literal is plain JS ({ 1: 9, … }), so evaluate it rather than JSON.parse it
const SRC_TARGET_BY_DIFFICULTY = new Function("return " + m2[1])();

function srcTargetFor(card) {
  const n = card && typeof card.difficulty === "number" ? card.difficulty : 0;
  return SRC_TARGET_BY_DIFFICULTY[n] || SRC_TARGET;
}

module.exports = { SRC_TARGET, SRC_TARGET_BY_DIFFICULTY, srcTargetFor };
