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

   Zero dependencies. Not part of the site. Re-run after touching build-polities.js, polity-spec.json,
   polities.js, build-fronts.js / fronts.js / .claude/ww2-plates/, or build-country-series.js /
   country-series.js (rebuild with the builders; never hand-edit a bundle). */
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
    // a step anywhere INSIDE the card's years — a culture's rows often cover the middle of its span only
    const overl = slugs.some((sl) => P[sl] && P[sl].s.some((st) => st[0] <= ys[1] && st[1] >= ys[0]));
    check("[" + id + "." + k + "] a step falls inside the card's years " + ys.join("…"), overl, JSON.stringify(ys));
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

console.log("\n4) the Second World War's fronts (fronts.js), one map a year");
{
  const fsrc = fs.readFileSync(path.join(ROOT, "fronts.js"), "utf8"), fw = {};
  new Function("window", fsrc)(fw);   // eslint-disable-line no-new-func
  const F = fw.WW2_FRONTS || {}, keys = Object.keys(F.y || {}).sort();
  check("fronts.js names the card it belongs to, and that card exists", !!F.card && cards.has(F.card), F.card);
  check("…and carries one map a year, 1939 to 1945, and no months", keys.join(",") === "1939,1940,1941,1942,1943,1944,1945" && !F.m, keys.join(","));
  check("…each with its four sets — Axis, Axis-occupied, Allied, Allied-occupied — of valid rings",
    keys.every((k) => Array.isArray(F.y[k]) && F.y[k].length === 4 && F.y[k].every((set) => set.every((r) => r.length >= 3 && r.every((q) => isFinite(q[0]) && isFinite(q[1]) && Math.abs(q[0]) <= 180 && Math.abs(q[1]) <= 90)))));
  check("…and every year holds some Axis and some Allied ground", keys.every((k) => F.y[k][0].length + F.y[k][1].length > 0 && F.y[k][2].length + F.y[k][3].length > 0));
  check("…and says the date of each map a year is drawn from", keys.every((k) => Array.isArray((F.at || {})[k]) && F.at[k].length && F.at[k].every((d) => /^\d{4}-\d{2}(-\d{2})?$/.test(d))), JSON.stringify(F.at));
  // the plates add the Pacific from 1943: Japan's own ground (Tokyo) is Axis-held then and not before
  const inR = (rings, x, y) => { let c = false; for (const r of rings) for (let i = 0, j = r.length - 1; i < r.length; j = i++) if ((r[i][1] > y) !== (r[j][1] > y) && x < (r[j][0] - r[i][0]) * (y - r[i][1]) / (r[j][1] - r[i][1]) + r[i][0]) c = !c; return c; };
  check("the Pacific is drawn from 1943 (Tokyo is Axis ground) and not before (no 1942 source)", inR(F.y["1943"][0], 139.7, 35.7) && inR(F.y["1945"][0], 139.7, 35.7) && !inR(F.y["1942"][0], 139.7, 35.7));
  // …and the plates read right: Berlin is Axis ground to 1944, and on the 1 May 1945 plate already the Red Army's
  check("…and Berlin is Axis ground 1939–44, Allied-occupied on the last plate (1 May 1945)", keys.filter((k) => k < "1945").every((k) => inR(F.y[k][0], 13.4, 52.5)) && inR(F.y["1945"][3], 13.4, 52.5));
  check("its header names both public-domain sources", /San Jose/.test(fsrc) && /Atlas of the World Battle Fronts/.test(fsrc) && /public\s+domain/i.test(fsrc));
  check("the Atlas's help card credits both, year by year", /The Second World War, year by year[\s\S]{0,600}ww2-atlas[\s\S]{0,200}Atlas of the World Battle Fronts/.test(APP));
}

console.log("\n5) a country between two era maps (country-series.js, batch 7)");
{
  const csrc = fs.readFileSync(path.join(ROOT, "country-series.js"), "utf8"), cw = {};
  new Function("window", csrc)(cw);   // eslint-disable-line no-new-func
  const C = cw.COUNTRY_STEPS || {}, names = Object.keys(C);
  const tw = {}; new Function("window", fs.readFileSync(path.join(ROOT, "timeline.js"), "utf8"))(tw);   // eslint-disable-line no-new-func
  const eraNames = new Set();
  (tw.TIMELINE || []).forEach((e) => { (e.geo || []).forEach((t) => t.n && eraNames.add(String(t.n).toLowerCase())); Object.values(e.groups || {}).forEach((g) => eraNames.add(String(g).toLowerCase())); });
  const ww = {}; new Function("window", fs.readFileSync(path.join(ROOT, "world.js"), "utf8"))(ww);   // eslint-disable-line no-new-func
  (ww.WORLD_GEO || []).forEach((g) => eraNames.add(String(g.n).toLowerCase()));
  check("the bundle carries countries", names.length > 0, names.length + " countries");
  check("…each a name some era map carries (a step resolves only through the era maps)", names.every((n) => eraNames.has(n)), names.filter((n) => !eraNames.has(n)).join(", "));
  let ok = true, bad = "";
  for (const n of names) {
    const st = C[n];
    for (let i = 0; i < st.length; i++) {
      const s = st[i];
      if (!(s[0] <= s[1]) || (i && s[0] <= st[i - 1][1])) { ok = false; bad = n + " " + s[0]; }
      if (s[2] !== null && !(Array.isArray(s[2]) && s[2].length && s[2].every((r) => r.length >= 4 && r.every((q) => isFinite(q[0]) && isFinite(q[1]))) && Array.isArray(s[3]))) { ok = false; bad = n + " " + s[0] + " rings"; }
    }
  }
  check("…every step sorted, not overlapping, with valid rings and interior lines (or null for an ended state)", ok, bad);
  // the change the batch exists for: the 1960 map draws a UNIFIED Germany, and the bundle replaces it with West Germany until 1990
  const de = C["germany"] || [];
  check("Germany between the 1960 and 1994 maps is drawn from its own years (West Germany), not the unified 1960 shape", de.some((s) => s[0] <= 1975 && s[1] >= 1975 && s[2]), JSON.stringify(de.map((s) => s[0] + "-" + s[1])));
  check("…and the USSR is gone in 1992, not held over to the 1994 map", (C["ussr"] || []).some((s) => s[0] <= 1992 && s[1] >= 1992 && s[2] === null));
  check("its header credits Cliopatria under CC BY 4.0", /Cliopatria/.test(csrc) && /creativecommons\.org\/licenses\/by\/4\.0/.test(csrc));
}

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
