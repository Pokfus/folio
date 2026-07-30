#!/usr/bin/env node
// Regression test for the discovery counting behind the "New term" / "New place" chips and the account
// page's "Beyond the cards" meters (app.js: glossSeenCount / countrySeenCount / SEEN_CAP / markSeen).
//
//   node .claude/test-discovery.js
//
// What it guards, and why each rule breaks SILENTLY:
//
//  1. placesSeen records every place opened on the Atlas — present-day countries AND the historical eras'
//     territories. Counting the whole register against the present-day country total once read "412 of
//     258": the bar clamps at 100%, the figure beside it does not. Nothing throws, so only a reader who
//     bothers to look notices. The same class of mistake is one line away any time these counts are
//     touched, which is why the numerator/denominator pairing is asserted here rather than eyeballed.
//
//  2. glossSeen is a permanent record; the glossary is not. A term retired since it was read must drop
//     out of the count rather than push it past the total.
//
//  3. SEEN_CAP prunes oldest-first. These figures are now shown to the reader as progress towards
//     completion, so a prune would make a count go BACKWARDS and re-flag a place as newly discovered —
//     the exact opposite of what the chips promise. The cap therefore has to stay above the SHIPPED
//     universe of both registers, and that universe grows on its own: every geo era added to timeline.js
//     brings new territory names with it. Measured at the time of writing, 1,211 place names against a
//     cap that was 1,500 — so this was ~80% of the way to silently breaking, with no test watching it.
//     THIS IS THE ASSERTION MOST LIKELY TO FIRE ON SOMEONE ELSE'S CHANGE: if it does, raise SEEN_CAP,
//     do not trim the data.
//
// No dependencies and no browser: the counters are sliced out of app.js by text (the same trick the
// Playwright tests use) and run against the real world.js / timeline.js / glossary.js, so neither the
// logic nor the sizing can drift from what ships.
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const src = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");

function slice(startRe, endMark, what) {
  const m = startRe.exec(src);
  if (!m) throw new Error("could not find " + what + " in app.js");
  const end = src.indexOf(endMark, m.index);
  if (end < 0) throw new Error("could not find the end of " + what + " in app.js");
  return src.slice(m.index, end + endMark.length);
}

// the real shipped data (these files assign onto window)
global.window = {};
require(path.join(ROOT, "world.js"));
require(path.join(ROOT, "timeline.js"));
require(path.join(ROOT, "glossary.js"));

const code = [
  slice(/^  const SEEN_CAP = /m, ";", "SEEN_CAP"),
  slice(/^  function seenCount\(/m, "\n", "seenCount"),
  slice(/^  function glossSeenCount\(/m, "\n  }", "glossSeenCount"),
  slice(/^  function glossTotalCount\(/m, "\n", "glossTotalCount"),
  slice(/^  function countryNameSet\(/m, "\n", "countryNameSet"),
  slice(/^  function countryTotalCount\(/m, "\n", "countryTotalCount"),
  slice(/^  function countrySeenCount\(/m, "\n  }", "countrySeenCount"),
  slice(/^  function discCounter\(/m, "\n", "discCounter"),
  "  return { SEEN_CAP, seenCount, glossSeenCount, glossTotalCount, countryNameSet, countryTotalCount, countrySeenCount, discCounter };",
].join("\n");
const A = new Function("window", code)(global.window);

let pass = 0, fail = 0;
const ok = (cond, name, extra) => {
  if (cond) { pass++; console.log("ok    " + name + (extra ? "  " + extra : "")); }
  else { fail++; console.log("FAIL  " + name + (extra ? "  " + extra : "")); }
};

// ---- the shipped universe both registers are measured against ----
const GEO = global.window.WORLD_GEO || [];
const TIMELINE = global.window.TIMELINE || [];
const GLOSS = global.window.GLOSSARY || {};
const countryNames = [...new Set(GEO.map((c) => c.n).filter(Boolean))];
const eraNames = new Set();
TIMELINE.forEach((e) => {
  (e.geo || []).forEach((t) => { if (t.n) eraNames.add(t.n); });
  Object.values(e.groups || {}).forEach((n) => { if (n) eraNames.add(n); });
});
const allPlaceNames = new Set([...countryNames, ...eraNames]);

console.log("\n-- the shipped universe --");
ok(countryNames.length > 0, "world.js loaded", countryNames.length + " present-day countries");
ok(eraNames.size > 0, "timeline.js loaded", eraNames.size + " era territory / group names");
ok(Object.keys(GLOSS).length > 0, "glossary.js loaded", Object.keys(GLOSS).length + " terms");

// ---- 1. the register holds far more than the meter's denominator ----
console.log("\n-- a register full of historical territories --");
// the pathological case that produced "412 of 258": a reader who has toured the old maps
const touredEverything = {};
allPlaceNames.forEach((n) => { touredEverything[n] = Date.now(); });
const prog = { placesSeen: touredEverything, glossSeen: {} };
const seenAll = A.seenCount(prog, "placesSeen");
const countries = A.countrySeenCount(prog);
const total = A.countryTotalCount();
ok(seenAll > total, "the register really can outgrow the country total", seenAll + " places vs " + total + " countries");
ok(countries === total, "every present-day country is counted when all are seen", countries + " of " + total);
ok(countries <= total, "the country count can NEVER exceed its own total", countries + " of " + total);
ok(seenAll - countries === allPlaceNames.size - countryNames.length,
  "the remainder is reported as historical territories, not silently dropped", (seenAll - countries) + " territories");

console.log("\n-- a register of ONLY historical territories --");
const onlyHistorical = {};
[...eraNames].filter((n) => !countryNames.includes(n)).forEach((n) => { onlyHistorical[n] = Date.now(); });
const histProg = { placesSeen: onlyHistorical };
ok(A.countrySeenCount(histProg) === 0, "a reader who only toured the old maps has opened 0 countries");
ok(A.seenCount(histProg, "placesSeen") > 0, "…while their exploring is still recorded", Object.keys(onlyHistorical).length + " territories");

console.log("\n-- world.js not yet loaded (it is a lazy bundle) --");
const realGeo = global.window.WORLD_GEO;
global.window.WORLD_GEO = undefined;
ok(A.countryNameSet() === null, "the country set is null rather than empty — an unknowable, not a zero");
ok(A.countryTotalCount() === 0, "the total is 0, so the meter shows no bar at all");
ok(A.countrySeenCount(prog) === 0, "and the count is 0 rather than a confident wrong answer");
global.window.WORLD_GEO = realGeo;

// ---- 2. a term retired since it was read ----
console.log("\n-- glossary terms that no longer exist --");
const realTerms = Object.keys(GLOSS);
const readSome = {};
realTerms.slice(0, 10).forEach((k) => { readSome[k] = Date.now(); });
readSome["A_Term_Retired_Long_Ago"] = Date.now();
readSome["Another_Retired_Term"] = Date.now();
const gProg = { glossSeen: readSome };
ok(A.seenCount(gProg, "glossSeen") === 12, "the register keeps the retired terms (it is a permanent record)");
ok(A.glossSeenCount(gProg) === 10, "…but the COUNT drops them", A.glossSeenCount(gProg) + " of " + A.glossTotalCount());
ok(A.glossSeenCount(gProg) <= A.glossTotalCount(), "so the terms figure can never exceed its own total");

const readEverything = {};
realTerms.forEach((k) => { readEverything[k] = Date.now(); });
ok(A.glossSeenCount({ glossSeen: readEverything }) === A.glossTotalCount(), "reading every term reads as 100%");

// ---- 3. the cap must stay above the shipped universe ----
console.log("\n-- SEEN_CAP vs the data that actually ships --");
ok(A.SEEN_CAP > allPlaceNames.size,
  "the cap clears every clickable place name — a completionist is never pruned",
  "cap " + A.SEEN_CAP + " vs " + allPlaceNames.size + " places");
ok(A.SEEN_CAP > Object.keys(GLOSS).length,
  "…and every glossary term", "cap " + A.SEEN_CAP + " vs " + Object.keys(GLOSS).length + " terms");
// headroom, so that adding one more geo era does not silently start pruning
const headroom = A.SEEN_CAP - allPlaceNames.size;
ok(headroom >= 1000, "with room for the eras still to be added", headroom + " names of headroom");

// ---- the chip's own counter ----
console.log("\n-- the discovery chip's counter --");
ok(A.discCounter(41, 333) === "41 / 333", "reads as a ratio");
ok(A.discCounter(0, 258) === "0 / 258", "…including before anything is found");
ok(A.discCounter(7, 0) === "7", "…and falls back to the bare figure when the total is unknown");

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
