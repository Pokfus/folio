#!/usr/bin/env node
// Where the GLOSSARY citation pass stands: every term measured against the GLOSS_SRC_TARGET bar in app.js
// (2 sources). The sibling of source-audit.js, which does the same for cards.
//
//   node .claude/gloss-source-audit.js            # the summary + every term below the bar
//   node .claude/gloss-source-audit.js --all      # …and the terms that have met it
//   node .claude/gloss-source-audit.js --csv      # one row per term, for pasting into a plan
//   node .claude/gloss-source-audit.js --tag=era  # only terms carrying that tag
//
// Two states, not the cards' three: a term has met the bar or it has not. There is no `sourcesBlocked`
// equivalent on a term — the cards needed one because five qualifying works for one card is a research
// finding worth recording, and two for a three-sentence description is not. A term that genuinely cannot
// reach two belongs in the batch log in docs/glossary-citation-plan.md, in prose.
//
// It also reports the majority-open rule, which the plan holds this pass to exactly as the card pass is
// held: at most one paywalled work in a two-source list, and never a list that is more closed than open.
// No dependencies, no browser.
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");

function loadWindow(file) { const win = {}; new Function("window", fs.readFileSync(file, "utf8"))(win); return win; }

const appSrc = fs.readFileSync(path.join(root, "app.js"), "utf8");
const m = /const GLOSS_SRC_TARGET = (\d+);/.exec(appSrc);
if (!m) { console.error("ERROR: could not find `const GLOSS_SRC_TARGET` in app.js — has the constant been renamed?"); process.exit(1); }
const TARGET = +m[1];

const win = loadWindow(path.join(root, "glossary.js"));
const GLOSS = win.GLOSSARY || {}, SOURCES = win.GLOSSARY_SOURCES || {}, TAGS = win.GLOSSARY_TAGS || {};

const tagArg = (process.argv.find((a) => a.startsWith("--tag=")) || "").slice(6).toLowerCase();
const rows = Object.keys(GLOSS)
  .filter((slug) => !tagArg || (TAGS[slug] || []).some((t) => String(t).toLowerCase() === tagArg))
  .map((slug) => {
    const src = Array.isArray(SOURCES[slug]) ? SOURCES[slug] : [];
    const open = src.filter((s) => /\[Open access\]/.test(s)).length;
    const pay = src.filter((s) => /\[Paywalled\]/.test(s)).length;
    return { slug, n: src.length, open, pay, tags: (TAGS[slug] || []).join(" · "), met: src.length >= TARGET };
  })
  .sort((a, b) => a.n - b.n || a.slug.localeCompare(b.slug));

if (process.argv.includes("--csv")) {
  console.log("slug,sources,open,paywalled,state,tags");
  rows.forEach((r) => console.log([r.slug, r.n, r.open, r.pay, r.met ? "met" : "short", JSON.stringify(r.tags)].join(",")));
  process.exit(0);
}

const met = rows.filter((r) => r.met), short = rows.filter((r) => !r.met);
const uncited = short.filter((r) => r.n === 0);
// a list is majority-open when strictly more of it is open than closed; an unlabelled citation counts as
// neither, so a list of unlabelled works is flagged rather than silently passed
const notOpen = met.filter((r) => r.open <= r.pay);
const unlabelled = rows.filter((r) => r.n && r.open + r.pay < r.n);

const show = (list) => list.forEach((r) =>
  console.log("  " + String(r.n + "/" + TARGET).padStart(5) + "  " + r.slug.padEnd(38) +
    (r.n ? "(" + r.open + " open, " + r.pay + " paywalled)  " : "") + r.tags));

console.log("Glossary citations — the bar is " + TARGET + " source" + (TARGET === 1 ? "" : "s") + " per term" + (tagArg ? "  ·  tag: " + tagArg : ""));
console.log("");
console.log("  at the bar        " + String(met.length).padStart(4) + " / " + rows.length);
console.log("  below it          " + String(short.length).padStart(4) + "   of which " + uncited.length + " carry nothing at all");
console.log("  citations to find " + String(short.reduce((a, r) => a + (TARGET - r.n), 0)).padStart(4));
if (notOpen.length) console.log("  NOT majority-open " + String(notOpen.length).padStart(4) + "   a paywalled work is citable only as the landmark, never as the bulk");
if (unlabelled.length) console.log("  unlabelled access " + String(unlabelled.length).padStart(4) + "   every citation ends in [Open access] or [Paywalled]");
console.log("");

if (notOpen.length) { console.log("NOT MAJORITY-OPEN"); show(notOpen); console.log(""); }
if (unlabelled.length) { console.log("MISSING AN ACCESS LABEL"); show(unlabelled); console.log(""); }
if (short.length) { console.log("BELOW THE BAR (" + short.length + ")"); show(short); console.log(""); }
if (process.argv.includes("--all") && met.length) { console.log("AT THE BAR (" + met.length + ")"); show(met); console.log(""); }
else if (met.length) console.log("(" + met.length + " term" + (met.length === 1 ? "" : "s") + " at the bar — pass --all to list them)");
