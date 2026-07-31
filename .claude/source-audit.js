#!/usr/bin/env node
// Where the citation pass stands: every card measured against the SRC_TARGET bar in app.js (5 sources).
//
//   node .claude/source-audit.js            # the summary + every card below the bar
//   node .claude/source-audit.js --all      # …and the cards that have met it
//   node .claude/source-audit.js --csv      # one row per card, for pasting into a plan
//
// Three states, the same three the Edit page's card list paints:
//   met      — SRC_TARGET or more citations
//   short    — below it, and nobody has researched it yet          (amber chip)
//   blocked  — below it, and a batch concluded it cannot be raised (red chip; `card.sourcesBlocked`)
//
// No dependencies, no browser. It reads the real data.js and the real app.js, slicing SRC_TARGET out of
// the latter by text so this script and the site can never disagree about what the bar is.
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");

function loadWindow(file) { const win = {}; new Function("window", fs.readFileSync(file, "utf8"))(win); return win; }

const appSrc = fs.readFileSync(path.join(root, "app.js"), "utf8");
const m = /const SRC_TARGET = (\d+);/.exec(appSrc);
if (!m) { console.error("ERROR: could not find `const SRC_TARGET` in app.js — has the constant been renamed?"); process.exit(1); }
const TARGET = +m[1];

const cards = loadWindow(path.join(root, "data.js")).CARD_DATA || [];
const rows = cards.map((c) => {
  const src = Array.isArray(c.sources) ? c.sources : [];
  const why = typeof c.sourcesBlocked === "string" ? c.sourcesBlocked.trim() : "";
  const open = src.filter((s) => /\[Open access\]/.test(s)).length;
  const pay = src.filter((s) => /\[Paywalled\]/.test(s)).length;
  return {
    id: c.id,
    name: (c.answerText || c.answer || "").replace(/<[^>]*>/g, "").trim(),
    n: src.length, open, pay, why,
    state: src.length >= TARGET ? "met" : why ? "blocked" : "short",
    // a paywalled-majority list breaks the plan's rule even at full count, so it is worth surfacing here
    majorityOpen: src.length ? open > src.length / 2 : false,
  };
});

const by = (s) => rows.filter((r) => r.state === s);
const met = by("met"), short = by("short"), blocked = by("blocked");
const need = short.concat(blocked).reduce((a, r) => a + (TARGET - r.n), 0);

if (process.argv.includes("--csv")) {
  console.log("id,name,sources,open,paywalled,state,reason");
  rows.forEach((r) => console.log([r.id, r.name, r.n, r.open, r.pay, r.state, r.why].map((v) => '"' + String(v).replace(/"/g, '""') + '"').join(",")));
  process.exit(0);
}

const line = (r) => "  " + r.id + "  " + String(r.n) + "/" + TARGET + "  (o" + r.open + "/p" + r.pay + ")  " + r.name +
  (r.n && !r.majorityOpen ? "   [!] list is not majority-open" : "") + (r.why ? "\n      ↳ " + r.why : "");

console.log("Citation coverage — bar is " + TARGET + " sources per card (SRC_TARGET in app.js)\n");
console.log("  " + cards.length + " cards");
console.log("  " + met.length + " at the bar");
console.log("  " + short.length + " below it, not yet researched");
console.log("  " + blocked.length + " below it, researched and blocked");
console.log("  " + need + " citations still to find\n");

if (short.length) {
  console.log("── BELOW THE BAR, NOT YET RESEARCHED (" + short.length + ") ".padEnd(20, "─"));
  const zero = short.filter((r) => !r.n), part = short.filter((r) => r.n);
  if (zero.length) { console.log("\n  uncited (" + zero.length + "):"); zero.forEach((r) => console.log(line(r))); }
  if (part.length) { console.log("\n  under-cited, needs a top-up (" + part.length + "):"); part.sort((a, b) => a.n - b.n).forEach((r) => console.log(line(r))); }
  console.log("");
}
if (blocked.length) {
  console.log("── RESEARCHED AND BLOCKED (" + blocked.length + ") ".padEnd(20, "─") + "\n");
  blocked.forEach((r) => console.log(line(r)));
  console.log("");
}
if (process.argv.includes("--all") && met.length) {
  console.log("── AT THE BAR (" + met.length + ") ".padEnd(20, "─") + "\n");
  met.sort((a, b) => a.id.localeCompare(b.id)).forEach((r) => console.log(line(r)));
  console.log("");
}

const notOpen = rows.filter((r) => r.n && !r.majorityOpen);
if (notOpen.length) console.log("[!] " + notOpen.length + " card(s) carry a list that is not majority-open — see the plan's \"The bar\".");
