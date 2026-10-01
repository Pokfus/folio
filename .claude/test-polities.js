#!/usr/bin/env node
/* test-polities.js — the dated-border bundle (`polities.js`) is well formed and every link resolves.

     node .claude/test-polities.js

   WHY. A dated border that fails falls back, silently, to the card's old authored polygon — so a slug
   misspelt in `.claude/polity-spec.json`, a series whose steps overlap, or a link to a war side the card
   does not have, all render a perfectly good map that is simply the old one. Each of those is a fact
   about the FILE and is checked here without a browser:

     · every series has steps sorted by year, none overlapping, each with at least one ring of ≥ 4
       finite [lon, lat] points;
     · every link names a real card, a side or extent that card has, and slugs the bundle defines;
     · no link is to a war that GROUPS other wars (`war.group`) — the atlas never draws those;
     · for every linked card, the series has a step inside the card's own years (a link drawing nothing
       in the years the card is shown is a link to nothing) — and for a war that ran across a step
       boundary the shape really CHANGES between its first and last year, which is the feature;
     · the header carries the CC BY 4.0 credit and its note of changes.

   Zero dependencies. Not part of the site. Re-run after touching build-polities.js, polity-spec.json or
   polities.js (rebuild with the builder; never hand-edit the bundle). */
"use strict";
const fs = require("fs"), path = require("path");
const { loadCards } = require("./card-io.js");

const ROOT = path.join(__dirname, "..");
let pass = 0, fail = 0;
const check = (name, ok, detail) => {
  if (ok) { pass++; console.log("ok    " + name); }
  else { fail++; console.log("FAIL  " + name + (detail ? "  " + detail : "")); }
};

const src = fs.readFileSync(path.join(ROOT, "polities.js"), "utf8");
const win = {};
new Function("window", src)(win);   // eslint-disable-line no-new-func
const P = win.POLITIES || {}, L = win.POLITY_LINKS || {};
const cards = new Map(loadCards().cards.map((c) => [c.id, c]));

// app.js's own year parser, sliced out by text so this test can never disagree with the site about a card's years
const APP = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const cardYears = require("./card-links.js").loadCardYears(APP);

console.log("1) the series");
check("the bundle defines at least one series", Object.keys(P).length > 0, String(Object.keys(P).length));
for (const slug of Object.keys(P)) {
  const st = P[slug].s || [];
  let sorted = true, rings = true;
  for (let i = 0; i < st.length; i++) {
    const s = st[i];
    if (!(s[0] <= s[1]) || (i && s[0] <= st[i - 1][1])) sorted = false;
    if (!Array.isArray(s[2]) || !s[2].length || !s[2].every((r) => Array.isArray(r) && r.length >= 4 && r.every((p) => isFinite(p[0]) && isFinite(p[1]) && Math.abs(p[0]) <= 180 && Math.abs(p[1]) <= 90))) rings = false;
  }
  check("[" + slug + "] " + st.length + " steps, sorted and not overlapping", st.length > 0 && sorted);
  check("[" + slug + "] every step has valid rings", rings);
}

console.log("\n2) the links");
const step = (slug, y) => (P[slug] ? P[slug].s.find((s) => y >= s[0] && y <= s[1]) : null);
const yearsOf = (c, side) => {
  if (side !== "area" && c.war && Array.isArray(c.war.years)) return c.war.years.map(Number);
  const ys = cardYears(c);
  return ys && ys.length ? [Math.min.apply(null, ys), Math.max.apply(null, ys)] : null;
};
for (const id of Object.keys(L).sort()) {
  const c = cards.get(id), link = L[id];
  if (!c) { check("[" + id + "] is a card", false); continue; }
  for (const k of Object.keys(link)) {
    const slugs = link[k];
    check("[" + id + "." + k + "] names defined series", Array.isArray(slugs) && slugs.length && slugs.every((s) => P[s]), JSON.stringify(slugs));
    if (k === "area") check("[" + id + ".area] the card has a locator extent to replace", !!(c.locator && c.locator.area));
    else {
      check("[" + id + "." + k + "] the card has a war with that side", !!(c.war && (k === "v" ? c.war.victors : c.war.losers)));
      check("[" + id + "." + k + "] …and the war is not a grouping one", !(c.war && c.war.group));
    }
    const ys = yearsOf(c, k);
    if (!ys) { check("[" + id + "." + k + "] the card has years to draw in", false); continue; }
    const hits = slugs.map((s) => [step(s, ys[0]), step(s, ys[1])]);
    check("[" + id + "." + k + "] a step covers the card's years " + ys.join("…"), hits.some((h) => h[0] || h[1]), JSON.stringify(ys));
    // THE FEATURE ITSELF: across a war that spans a step boundary, the border moves
    // (a war side only: a state's card may span rows Cliopatria splits without moving the border, which the
    // builder joins into one step — so for an extent, two different steps is the claim, not two shapes)
    if (k !== "area") hits.forEach((h, i) => { if (h[0] && h[1] && h[0] !== h[1]) check("[" + id + "." + k + "] " + slugs[i] + "'s border moves between " + ys[0] + " and " + ys[1], JSON.stringify(h[0][2]) !== JSON.stringify(h[1][2])); });
  }
}

console.log("\n3) the credit");
check("the header credits Cliopatria under CC BY 4.0 with a link", /Cliopatria/.test(src) && /creativecommons\.org\/licenses\/by\/4\.0/.test(src));
check("…and says what was changed", /CHANGES MADE/.test(src));
check("the Atlas's help card credits it where a reader can see it", /Cliopatria<\/a>[\s\S]{0,200}CC BY 4\.0/.test(APP));

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
