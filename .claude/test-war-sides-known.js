/* test-war-sides-known.js — the in/out assertions of test-war-cards.js `EXTENT_PLACES` that do NOT hold on the built topology (Atlas v2 Phase 2d), each with its cause.
   Never forced: a place the card’s hand-drawn ring holds and Cliopatria’s polygon does not is a disagreement between two sources, said here, not a fault to patch with an invented outline.
   Keys: `<card> <victors|losers> <place> <in|out>`. A fixed one must be removed (test-war-sides.js fails on a listed key that now holds). */
"use strict";
module.exports = {
 "gr-561 victors Olympia in": {
  "cause": "table-neutral"
 },
 "gr-235 losers Methone in": {
  "cause": "coast-clip"
 },
 "gr-236 losers Methone in": {
  "cause": "coast-clip"
 },
 "gr-237 losers Methone in": {
  "cause": "coast-clip"
 },
 "gr-461 losers Methone in": {
  "cause": "coast-clip"
 },
 "gr-755 victors Pydna in": {
  "cause": "cliopatria-excludes"
 },
 "rm-151 victors Rome in": {
  "cause": "cliopatria-excludes"
 },
 "rm-151 victors Capua in": {
  "cause": "cliopatria-excludes"
 },
 "rm-151 victors Neapolis in": {
  "cause": "cliopatria-excludes"
 },
 "rm-152 victors Rome in": {
  "cause": "cliopatria-excludes"
 },
 "rm-152 victors Capua in": {
  "cause": "cliopatria-excludes"
 },
 "rm-152 victors Neapolis in": {
  "cause": "cliopatria-excludes"
 },
 "rm-153 victors Capua in": {
  "cause": "cliopatria-excludes"
 },
 "rm-156 victors Capua in": {
  "cause": "cliopatria-excludes"
 },
 "rm-162 victors Florence in": {
  "cause": "cliopatria-excludes"
 },
 "rm-237 victors Florence in": {
  "cause": "cliopatria-excludes"
 },
 "rm-237 losers Corfu out": {
  "cause": "coast-snap"
 },
 "rm-245 victors Milan out": {
  "cause": "cliopatria-includes"
 },
 "rm-245 victors Bologna out": {
  "cause": "cliopatria-includes"
 },
 "rm-255 victors Milan out": {
  "cause": "cliopatria-includes"
 },
 "rm-255 victors Bologna out": {
  "cause": "cliopatria-includes"
 },
 "rm-255 losers Sparta in": {
  "cause": "cliopatria-excludes"
 },
 "rm-310 victors Milan out": {
  "cause": "cliopatria-includes"
 },
 "rm-310 victors Bologna out": {
  "cause": "cliopatria-includes"
 },
 "wh-345 victors Florence in": {
  "cause": "cliopatria-excludes"
 },
 "rm-186 victors Florence in": {
  "cause": "cliopatria-excludes"
 },
 "rm-209 victors Milan out": {
  "cause": "cliopatria-includes"
 },
 "rm-209 victors Bologna out": {
  "cause": "cliopatria-includes"
 },
 "gr-448 losers Hippo Regius out": {
  "cause": "coast-snap"
 },
 "gr-552 victors Camarina in": {
  "cause": "coast-clip"
 },
 "rm-162 victors Palermo out": {
  "cause": "cliopatria-includes"
 },
 "wh-349 victors Milan out": {
  "cause": "cliopatria-includes"
 },
 "wh-349 victors Bologna out": {
  "cause": "cliopatria-includes"
 },
 "rm-234 victors Milan out": {
  "cause": "cliopatria-includes"
 },
 "rm-234 victors Bologna out": {
  "cause": "cliopatria-includes"
 },
 "wh-330 victors Megara out": {
  "cause": "coast-snap"
 },
 "gr-521 victors Megara out": {
  "cause": "coast-snap"
 },
 "rm-240 victors Milan out": {
  "cause": "cliopatria-includes"
 },
 "rm-240 victors Bologna out": {
  "cause": "cliopatria-includes"
 },
 "rm-249 victors Milan out": {
  "cause": "cliopatria-includes"
 },
 "rm-249 victors Bologna out": {
  "cause": "cliopatria-includes"
 },
 "rm-249 losers Larissa in": {
  "cause": "cliopatria-excludes"
 },
 "rm-292 victors Milan out": {
  "cause": "cliopatria-includes"
 },
 "rm-292 victors Bologna out": {
  "cause": "cliopatria-includes"
 },
 "rm-292 losers Hippo Regius in": {
  "cause": "cliopatria-excludes"
 },
 "wh-354 victors Palermo out": {
  "cause": "cliopatria-includes"
 },
 "wh-354 victors Syracuse out": {
  "cause": "coast-snap"
 },
 "rm-350 victors Palermo out": {
  "cause": "cliopatria-includes"
 },
 "rm-350 victors Syracuse out": {
  "cause": "coast-snap"
 },
 "gr-561 victors Megara out": {
  "cause": "coast-snap"
 },
 "rm-333 victors Milan out": {
  "cause": "cliopatria-includes"
 },
 "rm-333 victors Bologna out": {
  "cause": "cliopatria-includes"
 },
 "gr-383 losers Miletus in": {
  "cause": "cliopatria-excludes"
 },
 "gr-676 victors Chios in": {
  "cause": "coast-clip"
 },
 "rm-158 victors Rome in": {
  "cause": "cliopatria-excludes"
 },
 "rm-158 victors Capua in": {
  "cause": "cliopatria-excludes"
 },
 "rm-158 victors Tibur in": {
  "cause": "cliopatria-excludes"
 },
 "rm-159 victors Capua in": {
  "cause": "cliopatria-excludes"
 },
 "wh-463 victors Mecca in": {
  "cause": "member-not-drawn"
 },
 "wh-463 victors Medina in": {
  "cause": "member-not-drawn"
 },
 "wh-463 victors Sanaa in": {
  "cause": "member-not-drawn"
 },
 "wh-463 losers Carthage out": {
  "cause": "coast-snap"
 },
 "wh-310 victors Pydna in": {
  "cause": "cliopatria-excludes"
 },
 "cnh-103 losers Zhengzhou in": {
  "cause": "cliopatria-excludes"
 },
 "us-071 victors Philadelphia in": {
  "cause": "cliopatria-excludes"
 },
 "us-071 victors Newtown out": {
  "cause": "cliopatria-includes"
 }
};
module.exports.CAUSES = {
 "cliopatria-excludes": "Cliopatria’s own row for the series does not contain the place that year (the pin was composed against the card’s hand-drawn ring, which does)",
 "cliopatria-includes": "Cliopatria’s own row for the series already contains the place that year (the pin’s ‘outside’ was composed against the card’s narrower ring)",
 "coast-snap": "the place lies within the 15 km coast-snap tolerance of the series’ edge: Cliopatria’s raw row excludes it, the border snapped to the OSM coast takes it in",
 "coast-clip": "a coastal site: the extent is clipped to the present OSM land and the place lies on the sea side of that coast ring (the face is within 1 km of it)",
 "table-neutral": "the Peloponnesian War's sides are drawn from Folio's dated table of members (war-poleis.json, 2026-10-25): the place's polis is neutral that year in the sources (Elis broke with Sparta in 420 and is absent from Sparta's levy of 413, Thuc. 5.31, 8.3), so neither side holds it",
 "member-not-drawn": "the member is not alive that year: Cliopatria draws no Rashidun Caliphate in 632 (nothing in Arabia), so the Muslim side has no ground"
};
