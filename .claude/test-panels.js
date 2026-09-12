#!/usr/bin/env node
/* THE ARITHMETIC BEHIND THE PANELS ADDED IN SEP 2026, AND THE MAP IN WORDS.
 *
 * No browser and no dependency: every function under test is sliced out of the real `app.js` by text, so
 * it cannot drift from what ships, and the map half is run against the real `us-states.js`.
 *
 * Each of these fails SILENTLY on the page, which is why they are here rather than left to the eye:
 *   - a "right, but slowly" list built on a fixed threshold reports a whole collection on one reader and
 *     nothing at all on another, and both look like the feature working;
 *   - a neighbour list computed by shared EDGES is wrong by a quarter and reads as a complete list —
 *     it missed California–Oregon, and a reader told "Ohio borders Indiana, Kentucky, Michigan and West
 *     Virginia" has been handed a list that rules out the right answer;
 *   - a stale streak printed as a current one compares against something that is not happening;
 *   - and a route registered in five of its six places works until the day somebody pastes the link.
 *
 *   node .claude/test-panels.js
 */
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const src = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");

let pass = 0, fail = 0;
function ok(name, cond, note) {
  if (cond) { pass++; console.log("  ok    " + name + (note ? "  " + note : "")); }
  else { fail++; console.log("  FAIL  " + name + (note ? "  " + note : "")); }
}
function head(t) { console.log("\n" + t); }

/* Slice a top-level function out of app.js by brace-matching. It THROWS on a name it cannot find, which
   is the point: a renamed function must fail loudly here rather than leave the suite testing nothing. */
function slice(name) {
  const start = src.indexOf("function " + name + "(");
  if (start < 0) throw new Error("test-panels: app.js has no function " + name);
  let d = 0;
  for (let j = src.indexOf("{", start); j < src.length; j++) {
    if (src[j] === "{") d++;
    else if (src[j] === "}") { d--; if (!d) return src.slice(start, j + 1); }
  }
  throw new Error("test-panels: unbalanced braces in " + name);
}
function build(names, prelude, exports) {
  const code = [prelude || "", ...names.map(slice), "module.exports = { " + exports.join(", ") + " };"].join("\n");
  const m = { exports: {} };
  new Function("module", code)(m);
  return m.exports;
}
const dayKeys = "function _p2(n){return n<10?'0'+n:''+n;}\n" +
  "function dayKeyOfDate(d){return d.getFullYear()+'-'+_p2(d.getMonth()+1)+'-'+_p2(d.getDate());}\n" +
  "function todayStr(){return dayKeyOfDate(new Date());}\nconst DAY = 86400000;\n";
const back = (n) => { const d = new Date(Date.now() - n * 864e5); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };

// ---------------------------------------------------------------- 1) right, but slowly
head("1) the cards you get right and cannot get right quickly");
{
  const REV = "const REV_ST = { new:0, learning:1, relearn:2, review:3 };\n" +
    "const REV_GRADE_NAME=['','Again','Hard','Good','Easy'], REV_ST_NAME=['New','Learning','Relearning','Review'];\n" +
    "const SLOW_ROWS=12, SLOW_MULT=2, SLOW_FLOOR_DS=60, SLOW_MIN_N=2, SLOW_WINDOW_DAYS=90;\n" +
    "const availableCardIdSet = () => new Set(['a','b','c','d','e','f']);\n";
  const { slowCards, medianOf } = build(["revRead", "revWindow", "medianOf", "slowCards"], dayKeys + REV, ["slowCards", "medianOf"]);
  const ids = ["a", "b", "c", "d", "e", "f"];
  const rows = (ds, st) => ids.flatMap((id, i) => [0, 1, 2].map((k) => [id, Date.now() - (k + 1) * 864e5, 3, st === undefined ? 3 : st, 1440, 7200, 2500, typeof ds === "function" ? ds(i) : ds]));

  ok("the median is the middle, not the mean", medianOf([1, 2, 3, 4, 100]) === 3, String(medianOf([1, 2, 3, 4, 100])));
  const mixed = slowCards({ cards: {}, suspended: {}, revlog: rows((i) => (i < 2 ? 220 : 30)) });
  ok("two slow cards among six are named", mixed.rows.length === 2, mixed.rows.map((r) => r.id).join(","));
  ok("…and the bar is the reader's own median, not a constant", mixed.base === 3 && mixed.bar === 6, "median " + mixed.base + ", bar " + mixed.bar);
  const flat = slowCards({ cards: {}, suspended: {}, revlog: rows(50) });
  ok("a uniformly slow reader is told nothing", flat.rows.length === 0, "5s every card");
  const learn = slowCards({ cards: {}, suspended: {}, revlog: rows(400, 1) });
  ok("a learning step is never counted", learn.rows.length === 0 && learn.base === 0);
  const relearn = slowCards({ cards: {}, suspended: {}, revlog: rows(400, 2) });
  ok("…nor a relearning one (the key is `relearn`, not `relearning`)", relearn.rows.length === 0 && relearn.base === 0);
  const one = { cards: {}, suspended: {}, revlog: [["a", Date.now() - 864e5, 3, 3, 1440, 7200, 2500, 400]].concat(rows(30).filter((r) => r[0] !== "a")) };
  ok("one slow answer is a moment, not a difficulty", slowCards(one).rows.length === 0);
  const susp = slowCards({ cards: {}, suspended: { a: 1, b: 1 }, revlog: rows((i) => (i < 2 ? 220 : 30)) });
  ok("a suspended card is left out", susp.rows.length === 0);
  const wrong = slowCards({ cards: {}, suspended: {}, revlog: ids.flatMap((id, i) => [0, 1, 2].map((k) => [id, Date.now() - (k + 1) * 864e5, 1, 3, 1440, 7200, 2500, i < 2 ? 220 : 30])) });
  ok("a card you got WRONG is not in this list — that is the other panel", wrong.rows.length === 0);
}

// ---------------------------------------------------------------- 2) the map, in words
head("2) the map in words, against the real us-states.js");
{
  const { mapNeighbours, andList } = build(["mapNeighbourCells", "mapNeighbours", "andList"], "let _nbrFor=null,_nbrCells=null;\nconst NBR_MIN_CELLS = 2;\n", ["mapNeighbours", "andList"]);
  const w = {}; new Function("window", fs.readFileSync(path.join(ROOT, "us-states.js"), "utf8"))(w);
  const US = w.US_STATES;
  ok("the layer loaded", Array.isArray(US) && US.length === 51, US && US.length);
  const nb = (n) => mapNeighbours(US, [n], 0.05);
  // the standard count of adjacent US state pairs, derived here from the shapes themselves
  const pairs = new Set();
  US.forEach((s) => nb(s.n).forEach((o) => pairs.add([s.n, o].sort().join("|"))));
  ok("107 pairs of neighbouring states", pairs.size === 107, String(pairs.size));
  ok("Ohio borders Pennsylvania (the shared-EDGE test missed this)", nb("Ohio").indexOf("Pennsylvania") >= 0, nb("Ohio").join(", "));
  ok("…and California borders Oregon (so did this)", nb("California").indexOf("Oregon") >= 0, nb("California").join(", "));
  ok("Four Corners is a point, not a border", nb("Arizona").indexOf("Colorado") < 0 && nb("Utah").indexOf("New Mexico") < 0, nb("Arizona").join(", "));
  ok("an island state borders nothing", nb("Hawaii").length === 0);
  ok("…and so does one across a strait", nb("Alaska").length === 0);
  ok("the answer is the geometry, not the cell size",
    [0.03, 0.04, 0.06, 0.08].every((g) => mapNeighbours(US, ["Ohio"], g).join() === nb("Ohio").join()), "0.03–0.08 agree");
  ok("a list of three reads as English", andList(["a", "b", "c"]) === "a, b and c", andList(["a", "b", "c"]));
  ok("…and a list of one is just the one", andList(["a"]) === "a");
}

// ---------------------------------------------------------------- 3) you and them
head("3) the comparison on a friend's profile");
{
  const { streakLive, daysStudied } = build(["streakLive", "daysStudied"], dayKeys, ["streakLive", "daysStudied"]);
  ok("a streak touched today is live", streakLive({ streak: { count: 12, last: back(0) } }) === 12);
  ok("…and one touched yesterday still is", streakLive({ streak: { count: 12, last: back(1) } }) === 12);
  ok("a streak nobody has kept is shown as ended, not as a number", streakLive({ streak: { count: 40, last: back(9) } }) === 0);
  ok("no streak at all is 0", streakLive({}) === 0 && streakLive({ streak: { count: 0, last: "" } }) === 0);
  const log = {}; for (let i = 0; i < 120; i++) log[back(i)] = [i % 3 === 0 ? 5 : 0, 0, 0];
  ok("a 90-day window is 90 days, not 91", daysStudied({ reviewLog: log }, 90) === 30, String(daysStudied({ reviewLog: log }, 90)));
  ok("a day with no reviews is not a day studied", daysStudied({ reviewLog: { [back(0)]: [0, 0, 0] } }, 90) === 0);
  ok("an empty log is 0 rather than a crash", daysStudied({}, 90) === 0);
}

// ---------------------------------------------------------------- 4) the route, in all six places
head("4) #u/<username> is registered everywhere a route has to be");
{
  const places = [
    ["PAGES", /PAGES\.u\s*=\s*PAGES_u/],
    ["the valid list", /const valid = \[[^\]]*"u"\]/],
    ["PAGE_META", /\n\s*u:\s*\["A profile/],
    ["the boot parser", /initName === "u"/],
    ["the hashchange parser", /parts\[0\] === "u"/],
    ["the hash writer", /name === "u" && current\.params\.name/],
    ["setActiveTab", /name === "u" \? "account"/],
  ];
  places.forEach(([what, rx]) => ok("registered in " + what, rx.test(src)));
}

// ---------------------------------------------------------------- 5) the two traps that already bit
head("5) the two faults that shipped and were caught");
{
  const lm = slice("lightMode");
  const lmBody = lm.slice(lm.indexOf("{"));   // the signature carries the name; only the BODY may not
  ok("lightMode does not call itself (a sweep once rewrote it into a stack overflow)",
    lmBody.indexOf("lightMode(") < 0, lmBody.replace(/\s+/g, " ").slice(0, 90));
  ok("…and it reads the reader's own switch as well as the browser hint",
    /S\.settings.*saveData/.test(lm) && /navigator\.connection/.test(lm));
  const css = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, " ");
  ok("the picture held back under light mode keeps a frame that says so", /\.ci-hold\{/.test(css) && /\.card-img\.ci-held\{/.test(css));
  ok("the keyboard sheet's scrim is theme-independent black, never var(--ink)",
    /\.key-sheet\{[^{}]*background:color-mix\(in srgb, #000/.test(css));
}

console.log("\n" + pass + " passed, " + fail + " failed\n");
process.exit(fail ? 1 : 0);
