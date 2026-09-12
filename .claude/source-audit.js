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
// No dependencies, no browser. It reads the real card corpus and the real app.js, slicing SRC_TARGET out
// of the latter by text so this script and the site can never disagree about what the bar is.
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");

const appSrc = fs.readFileSync(path.join(root, "app.js"), "utf8");
const m = /const SRC_TARGET = (\d+);/.exec(appSrc);
if (!m) { console.error("ERROR: could not find `const SRC_TARGET` in app.js — has the constant been renamed?"); process.exit(1); }
const TARGET = +m[1];

/* THROUGH card-io, NEVER THROUGH A `new Function` LOADER OF ITS OWN. `sources` is one of the fields
   the split moved out to data-extra/<collection>.js, and data.js closes that gap with a Node-only tail
   that re-joins the two halves — but the tail needs `require`, so it is wrapped in a try/catch and
   SILENTLY DOES NOTHING for a helper that evaluates the file through `new Function`, which has no
   require in scope. This script did exactly that from the split until 2026-09-12 and reported a fully
   cited corpus as uncited: 2,965 cards, 0 at the bar, 14,825 citations "still to find". Nothing threw,
   and the figure it printed is the one a decision about whether the pass is finished rests on. That is
   card-io.js's own first warning, and `gloss-source-audit.js` had already made the same mistake one
   file over after the glossary split. Four helpers still load the file that way — add-lang.js,
   add-questions.js, mark-sources-blocked.js and patch-cards.js — and each is a WRITER, where the same
   blindness costs the heavy halves rather than a wrong number. */
const { cards } = require("./card-io").loadCards();
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

/* A translation whose markers differ from the English shows the source LIST with the wrong claims pointed
   at it — or with none pointed at it at all. `add-sources.js` warns about it at write time, but a warning
   scrolls past and nothing here ever looked again, so the card side had no standing check where
   `gloss-source-audit.js` has had one all along. Found on 2026-08-08: `wh-061`, adrift in all nine, because
   the English abstract was revised later and the translations kept the older marker layout. */
const I18N_LANGS = ["es", "fr", "de", "it", "nl", "ru", "ar", "zh", "ja"];
const markersOf = (s) => (String(s || "").match(/data-fn="(\d+)"/g) || []).map((x) => x.match(/\d+/)[0]).join(",");
const drifted = cards.map((c) => {
  const en = markersOf(c.abstract);
  const drift = I18N_LANGS.filter((l) => {
    const t = c.i18n && c.i18n[l] && c.i18n[l].abstract;
    return t && markersOf(t) !== en;
  });
  return { id: c.id, drift };
}).filter((r) => r.drift.length);

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
console.log("  " + need + " citations still to find");
console.log("  " + drifted.length + " markers adrift   a translation carries different markers from the English\n");

if (drifted.length) {
  console.log("── MARKERS ADRIFT FROM THE ENGLISH (" + drifted.length + ") ".padEnd(20, "─") + "\n");
  drifted.forEach((r) => console.log("  " + r.id.padEnd(10) + r.drift.join(" ")));
  console.log("");
}

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
