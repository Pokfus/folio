#!/usr/bin/env node
/* WHO FOUGHT, AND WHO WON — `card.war` (Sep 2026, on request).

   "Cards in which the main answer term is a war, should in their atlas window highlight the countries of
   the two different sides in the conflict in two different colours — the victors green, the losers red.
   In the relevant years on the personal atlas it should also highlight countries involved in war in a
   similar way."

   EVERY FAULT THIS GUARDS RENDERS PERFECTLY, which is why it exists at all:

   · A BELLIGERENT NAMED OFF THE MAP shades nothing. The window still draws, the other side still shades,
     and what a reader sees is a war with one participant. Sections 1 and 2 ask the DATA rather than the
     canvas, because the corpus is the only place that fault lives.
   · THE TWO SIDES DRAWING IN ONE COLOUR is a map that looks finished and says nothing. Section 4 counts
     green AND red pixels, and asserts each against the other.
   · THE LEGEND IS THE ACCESSIBILITY ANSWER to a green/red pair, so section 4 also asserts it names both
     sides — a coloured map with no key is exactly the state this feature must not ship in.
   · ON THE PERSONAL ATLAS the shading is bounded at BOTH ends, unlike a place's mark. Section 6 asserts
     the war is drawn inside its years and absent outside them, in both directions: a war that never
     appears and a war that appears in every year both look deliberate from one side.
   · A WAR CARD NEEDS NO LOCATOR — its two sides are its place — so section 3 asserts the window exists on
     a card that carries no coordinate at all, and section 5 that it frames itself from the war's extent.

       NODE_PATH=… node .claude/test-war-cards.js

   Sections 1–3 need no browser. Re-run after touching `cardWar` / `warSide` / `cardWarYears` /
   `cardWarKeyHTML` / `cardWarSwatch` / `warRingsAttr` / `cardLocatorHTML` / `TINT_WIN` / `TINT_LOSE` /
   the war block in `startCardGlobe`'s `draw()` / `warSides` / `warDrawable` / `fitTarget`'s `ext` /
   `atlasUnlocks`' war branch / `mineMarks` / `mineWarShapes` / `drawMineWar` / `mineAt` /
   `serializeCardData` / `revertCard` / `.claude/card-war.js`, or after a batch of war blocks.
   Not part of the site. */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const APP = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const CSS = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
const { checkWar, mapNames, warYears } = require("./card-war.js");
const { loadCardYears } = require("./card-links.js");

let pass = 0, fail = 0;
const check = (n, ok, x) => { if (ok) { pass++; console.log("ok    " + n + (x ? "  " + x : "")); } else { fail++; console.log("FAIL  " + n + "  " + (x || "")); } };

/* ---------- 1) the corpus ---------- */
console.log("\n1) what the cards carry");
const cardYears = loadCardYears(APP);
const { cards } = require("./card-io").loadCards();
const wars = cards.filter((c) => c && c.war);
check("the corpus carries war blocks at all", wars.length > 0, wars.length + " cards");
let dataBad = 0;
wars.forEach((c) => { const e = checkWar(c, cardYears); if (e) { dataBad++; console.log("      " + c.id + ": " + e); } });
check("...and every one of them is valid", dataBad === 0, dataBad ? dataBad + " bad" : String(wars.length) + " checked");
check("...and every one has years to be drawn in", wars.every((c) => !!warYears(c, cardYears)));
/* THE SIDES MUST BE DRAWABLE ON THE CARD'S OWN WINDOW, which draws world.js and nothing else. A `keys`
   side naming only era spellings shades on the personal atlas and is invisible where the author is
   looking, which is the one failure `checkWar` cannot be relied on to catch by eye. */
const N = mapNames();
let noWorld = 0;
wars.forEach((c) => ["victors", "losers"].forEach((k) => {
  const s = c.war[k];
  if (s.keys && !s.keys.some((n) => N.world.has(String(n).toLowerCase()))) { noWorld++; console.log("      " + c.id + " " + k); }
}));
check("...and every named side resolves at least one present-day shape", noWorld === 0);
/* AN AUTHORED EXTENT IS THE OTHER HALF, and the thing to assert about it is that it is somewhere: a ring
   of three points at [0,0] validates and draws a speck in the Gulf of Guinea. The bar is a shape big
   enough to be a belligerent and small enough not to be the planet. */
let badSpan = 0;
wars.forEach((c) => ["victors", "losers"].forEach((k) => {
  const s = c.war[k];
  if (!s.area) return;
  const rings = Array.isArray(s.area[0][0]) ? s.area : [s.area];
  let x0 = 180, y0 = 90, x1 = -180, y1 = -90;
  rings.forEach((r) => r.forEach((q) => { if (q[0] < x0) x0 = q[0]; if (q[0] > x1) x1 = q[0]; if (q[1] < y0) y0 = q[1]; if (q[1] > y1) y1 = q[1]; }));
  const w = x1 - x0, h = y1 - y0;
  if (w < 0.4 || h < 0.4 || w > 200 || h > 120) { badSpan++; console.log("      " + c.id + " " + k + " spans " + w.toFixed(1) + "° x " + h.toFixed(1) + "°"); }
}));
check("...and every authored extent is a plausible size", badSpan === 0);

/* ---------- 1b) the authored extents still cover what they are supposed to ---------- */
/* THE SHAPES ARE HAND-DRAWN, AND A RING WHOSE INTERIOR IS ON THE WRONG SIDE OF AN EDGE DRAWS A BEAUTIFUL
   MAP OF SOMEWHERE ELSE. Nothing downstream can tell — the file parses, the window paints, the pixels are
   the right colour — so the only check is what the shape COVERS, against places whose coordinates are
   known. `add-card-wars.js` asks this of a BATCH as it is written; this asks it of the CORPUS, for ever,
   which is the half that catches a shipped extent edited later.
   A SUBSET, DELIBERATELY. The batch that shipped these ran 620 assertions; what is pinned here is three
   places inside each side and two outside, chosen from that run, because a table nobody can read is a
   table nobody maintains. Every one of them is a place the card's own prose names or would.
   IT IS DECLARED PER CARD, and a card with no row is not checked — adding a war block does not fail this
   suite. Add a row when you add an extent, and take the places from the batch you already tested. */
const EXTENT_PLACES = {
  "gr-235": {victors: {in: [["Sparta",22.43,37.07],["Gytheio",22.56,36.76],["Amyclae",22.43,37.02]], out: [["Messene",21.92,37.18],["Pylos",21.7,36.91]]}, losers: {in: [["Messene",21.92,37.18],["Pylos",21.7,36.91],["Methone",21.7,36.82]], out: [["Sparta",22.43,37.07],["Gytheio",22.56,36.76]]}},
  "gr-236": {victors: {in: [["Sparta",22.43,37.07],["Gytheio",22.56,36.76],["Amyclae",22.43,37.02]], out: [["Messene",21.92,37.18],["Pylos",21.7,36.91]]}, losers: {in: [["Messene",21.92,37.18],["Pylos",21.7,36.91],["Methone",21.7,36.82]], out: [["Sparta",22.43,37.07],["Gytheio",22.56,36.76]]}},
  "gr-237": {victors: {in: [["Sparta",22.43,37.07],["Gytheio",22.56,36.76],["Amyclae",22.43,37.02]], out: [["Messene",21.92,37.18],["Pylos",21.7,36.91]]}, losers: {in: [["Messene",21.92,37.18],["Pylos",21.7,36.91],["Methone",21.7,36.82]], out: [["Sparta",22.43,37.07],["Gytheio",22.56,36.76]]}},
  "gr-461": {victors: {in: [["Sparta",22.43,37.07],["Gytheio",22.56,36.76],["Amyclae",22.43,37.02]], out: [["Messene",21.92,37.18],["Pylos",21.7,36.91]]}, losers: {in: [["Messene",21.92,37.18],["Pylos",21.7,36.91],["Methone",21.7,36.82]], out: [["Sparta",22.43,37.07],["Gytheio",22.56,36.76]]}},
  "gr-755": {victors: {in: [["Pella",22.53,40.76],["Thessalonica",22.94,40.64],["Pydna",22.62,40.4]], out: [["Larissa",22.42,39.64],["Pherae",22.71,39.39]]}, losers: {in: [["Athens",23.73,37.98],["Piraeus",23.65,37.94],["Eleusis",23.54,38.04]], out: [["Sparta",22.43,37.07],["Corinth",22.93,37.94]]}},
  "rm-151": {victors: {in: [["Rome",12.48,41.9],["Capua",14.22,41.1],["Neapolis",14.25,40.85]], out: [["Bovianum",14.47,41.49],["Beneventum",14.78,41.13]]}, losers: {in: [["Bovianum",14.47,41.49],["Beneventum",14.78,41.13],["Aesernia",14.23,41.59]], out: [["Rome",12.48,41.9],["Capua",14.22,41.1]]}},
  "rm-152": {victors: {in: [["Rome",12.48,41.9],["Capua",14.22,41.1],["Neapolis",14.25,40.85]], out: [["Bovianum",14.47,41.49],["Beneventum",14.78,41.13]]}, losers: {in: [["Bovianum",14.47,41.49],["Beneventum",14.78,41.13],["Aesernia",14.23,41.59]], out: [["Rome",12.48,41.9],["Capua",14.22,41.1]]}},
  "rm-153": {victors: {in: [["Rome",12.48,41.9],["Capua",14.22,41.1],["Neapolis",14.25,40.85]], out: [["Bovianum",14.47,41.49],["Beneventum",14.78,41.13]]}, losers: {in: [["Bovianum",14.47,41.49],["Beneventum",14.78,41.13],["Aesernia",14.23,41.59]], out: [["Rome",12.48,41.9],["Capua",14.22,41.1]]}},
  "rm-156": {victors: {in: [["Rome",12.48,41.9],["Capua",14.22,41.1],["Neapolis",14.25,40.85]], out: [["Bovianum",14.47,41.49],["Beneventum",14.78,41.13]]}, losers: {in: [["Bovianum",14.47,41.49],["Beneventum",14.78,41.13],["Aesernia",14.23,41.59]], out: [["Rome",12.48,41.9],["Capua",14.22,41.1]]}},
  "rm-237": {victors: {in: [["Rome",12.48,41.9],["Naples",14.25,40.85],["Florence",11.25,43.77]], out: [["Milan",9.19,45.46],["Bologna",11.34,44.49]]}, losers: {in: [["Scodra",19.51,42.07],["Lissus",19.62,41.78],["Epidamnus",19.45,41.32]], out: [["Apollonia",19.47,40.72],["Corfu",19.92,39.62]]}},
  "rm-245": {victors: {in: [["Rome",12.48,41.9],["Naples",14.25,40.85],["Florence",11.25,43.77]], out: [["Milan",9.19,45.46],["Bologna",11.34,44.49]]}, losers: {in: [["Antioch",36.16,36.2],["Seleucia on the Tigris",44.52,33.09],["Ecbatana",48.51,34.8]], out: [["Pergamum",27.18,39.13],["Byzantium",28.98,41.01]]}},
  "rm-255": {victors: {in: [["Rome",12.48,41.9],["Naples",14.25,40.85],["Florence",11.25,43.77]], out: [["Milan",9.19,45.46],["Bologna",11.34,44.49]]}, losers: {in: [["Sparta",22.43,37.07],["Corinth",22.93,37.94],["Olympia",21.63,37.64]], out: [["Athens",23.73,37.98],["Megara",23.34,37.99]]}},
  "rm-262": {victors: {in: [["Carthago Nova",-0.98,37.6],["Tarraco",1.25,41.12],["Gades",-6.29,36.53]], out: [["Numantia",-2.45,41.81],["Madrid",-3.7,40.42]]}, losers: {in: [["Numantia",-2.45,41.81],["Segeda",-1.5,41.35],["Bilbilis",-1.6,41.38]], out: [["Toletum",-4.02,39.86],["Tarraco",1.25,41.12]]}},
  "rm-263": {victors: {in: [["Carthago Nova",-0.98,37.6],["Tarraco",1.25,41.12],["Gades",-6.29,36.53]], out: [["Numantia",-2.45,41.81],["Madrid",-3.7,40.42]]}, losers: {in: [["Olisipo",-9.14,38.72],["Emerita",-6.34,38.92],["Norba",-6.37,39.48]], out: [["Gades",-6.29,36.53],["Corduba",-4.78,37.89]]}},
  "rm-265": {victors: {in: [["Carthago Nova",-0.98,37.6],["Tarraco",1.25,41.12],["Gades",-6.29,36.53]], out: [["Numantia",-2.45,41.81],["Madrid",-3.7,40.42]]}, losers: {in: [["Numantia",-2.45,41.81],["Segeda",-1.5,41.35],["Bilbilis",-1.6,41.38]], out: [["Toletum",-4.02,39.86],["Tarraco",1.25,41.12]]}},
  "rm-310": {victors: {in: [["Rome",12.48,41.9],["Naples",14.25,40.85],["Florence",11.25,43.77]], out: [["Milan",9.19,45.46],["Bologna",11.34,44.49]]}, losers: {in: [["Sinope",35.15,42.03],["Amisus",36.33,41.29],["Amasia",35.83,40.65]], out: [["Nicomedia",29.92,40.76],["Byzantium",28.98,41.01]]}},
  "wh-345": {victors: {in: [["Rome",12.48,41.9],["Naples",14.25,40.85],["Florence",11.25,43.77]], out: [["Palermo",13.36,38.12],["Syracuse",15.29,37.07]]}, losers: {in: [["Carthage",10.32,36.85],["Utica",10.06,37.06],["Hadrumetum",10.64,35.83]], out: [["Cirta",6.61,36.36],["Cyrene",21.86,32.82]]}},
  "rm-186": {victors: {in: [["Rome",12.48,41.9],["Naples",14.25,40.85],["Florence",11.25,43.77]], out: [["Palermo",13.36,38.12],["Syracuse",15.29,37.07]]}, losers: {in: [["Carthage",10.32,36.85],["Utica",10.06,37.06],["Hadrumetum",10.64,35.83]], out: [["Cirta",6.61,36.36],["Cyrene",21.86,32.82]]}},
  "rm-209": {victors: {in: [["Rome",12.48,41.9],["Naples",14.25,40.85],["Florence",11.25,43.77]], out: [["Milan",9.19,45.46],["Bologna",11.34,44.49]]}, losers: {in: [["Carthage",10.32,36.85],["Utica",10.06,37.06],["Hadrumetum",10.64,35.83]], out: [["Cirta",6.61,36.36],["Cyrene",21.86,32.82]]}},
  "gr-448": {victors: {in: [["Syracuse",15.29,37.07],["Acragas",13.58,37.31],["Himera",13.82,37.97]], out: [["Motya",12.47,37.87],["Panormus",13.36,38.12]]}, losers: {in: [["Carthage",10.32,36.85],["Utica",10.06,37.06],["Hadrumetum",10.63,35.83]], out: [["Hippo Regius",7.75,36.9],["Cirta",6.61,36.37]]}},
  "gr-552": {victors: {in: [["Syracuse",15.29,37.07],["Camarina",14.44,36.87],["Gela",14.25,37.07]], out: [["Catana",15.09,37.5],["Naxos",15.27,37.82]]}, losers: {in: [["Athens",23.73,37.98],["Piraeus",23.65,37.94],["Eleusis",23.54,38.04]], out: [["Sparta",22.43,37.07],["Corinth",22.93,37.94]]}},
  "rm-162": {victors: {in: [["Rome",12.48,41.9],["Naples",14.25,40.85],["Florence",11.25,43.77]], out: [["Palermo",13.36,38.12],["Syracuse",15.29,37.07]]}, losers: {in: [["Mediolanum",9.19,45.46],["Placentia",9.69,45.05],["Cremona",10.02,45.13]], out: [["Rome",12.48,41.9],["Arretium",11.86,43.46]]}},
  "wh-349": {victors: {in: [["Rome",12.48,41.9],["Naples",14.25,40.85],["Florence",11.25,43.77]], out: [["Milan",9.19,45.46],["Bologna",11.34,44.49]]}, losers: {in: [["Pella",22.53,40.76],["Thessalonica",22.94,40.64],["Larissa",22.42,39.64]], out: [["Athens",23.73,37.98],["Delphi",22.5,38.48]]}},
  "cnh-188": {victors: {in: [["Xianyang",108.71,34.33],["Chengdu",104.07,30.67],["Hanzhong",107.02,33.07]], out: [["Handan",114.49,36.61],["Daliang",114.31,34.8]]}, losers: {in: [["Xinzheng",113.73,34.4],["Yangzhai",113.47,34.14],["Handan",114.49,36.61]], out: [["Luoyang",112.45,34.62],["Xianyang",108.71,34.33]]}},
  "wh-504": {victors: {in: [["Rouen",1.1,49.44],["Caen",-0.37,49.18],["Bayeux",-0.7,49.28]], out: [["Paris",2.35,48.86],["Rennes",-1.68,48.11]]}, losers: {in: [["London",-0.13,51.51],["York",-1.08,53.96],["Winchester",-1.31,51.06]], out: [["Cardiff",-3.18,51.48],["Swansea",-3.94,51.62]]}},
  "wh-518": {victors: {in: [["Paris",2.35,48.86],["Rouen",1.1,49.44],["Reims",4.03,49.26]], out: [["Bordeaux",-0.58,44.84],["Bayonne",-1.47,43.49]]}, losers: {in: [["London",-0.13,51.51],["York",-1.08,53.96],["Bristol",-2.59,51.45]], out: [["Edinburgh",-3.19,55.95],["Glasgow",-4.25,55.86]]}},
  "us-072": {victors: {in: [["Philadelphia",-75.16,39.95],["New York",-74.01,40.71],["Boston",-71.06,42.36]], out: [["Detroit",-83.05,42.33],["Columbus",-83,39.96]]}, losers: {in: [["Fallen Timbers",-83.69,41.55],["Fort Wayne",-85.14,41.08],["Fort Recovery",-84.78,40.25]], out: [["Pittsburgh",-80,40.44],["Lexington",-84.5,38.04]]}},
  "rm-234": {victors: {in: [["Rome",12.48,41.9],["Naples",14.25,40.85],["Florence",11.25,43.77]], out: [["Milan",9.19,45.46],["Bologna",11.34,44.49]]}, losers: {in: [["Carthage",10.32,36.85],["Utica",10.06,37.06],["Hadrumetum",10.64,35.83]], out: [["Cirta",6.61,36.36],["Hippo Regius",7.77,36.9]]}},
  "wh-319": {victors: {in: [["Athens",23.73,37.98],["Sparta",22.43,37.07],["Corinth",22.93,37.94]], out: [["Larissa",22.42,39.64],["Thessalonica",22.94,40.64]]}, losers: {in: [["Sardis",28.04,38.49],["Ephesus",27.34,37.94],["Miletus",27.28,37.53]], out: [["Athens",23.73,37.98],["Sparta",22.43,37.07]]}},
  "wh-330": {victors: {in: [["Sparta",22.43,37.07],["Corinth",22.93,37.94],["Olympia",21.63,37.64]], out: [["Athens",23.73,37.98],["Megara",23.34,37.99]]}, losers: {in: [["Athens",23.73,37.98],["Piraeus",23.65,37.94],["Eleusis",23.54,38.04]], out: [["Sparta",22.43,37.07],["Corinth",22.93,37.94]]}},
  "gr-521": {victors: {in: [["Sparta",22.43,37.07],["Corinth",22.93,37.94],["Olympia",21.63,37.64]], out: [["Athens",23.73,37.98],["Megara",23.34,37.99]]}, losers: {in: [["Athens",23.73,37.98],["Piraeus",23.65,37.94],["Eleusis",23.54,38.04]], out: [["Sparta",22.43,37.07],["Corinth",22.93,37.94]]}},
  "rm-240": {victors: {in: [["Rome",12.48,41.9],["Naples",14.25,40.85],["Florence",11.25,43.77]], out: [["Milan",9.19,45.46],["Bologna",11.34,44.49]]}, losers: {in: [["Pella",22.53,40.76],["Thessalonica",22.94,40.64],["Larissa",22.42,39.64]], out: [["Athens",23.73,37.98],["Delphi",22.5,38.48]]}},
  "rm-249": {victors: {in: [["Rome",12.48,41.9],["Naples",14.25,40.85],["Florence",11.25,43.77]], out: [["Milan",9.19,45.46],["Bologna",11.34,44.49]]}, losers: {in: [["Pella",22.53,40.76],["Thessalonica",22.94,40.64],["Larissa",22.42,39.64]], out: [["Athens",23.73,37.98],["Delphi",22.5,38.48]]}},
  "rm-292": {victors: {in: [["Rome",12.48,41.9],["Naples",14.25,40.85],["Florence",11.25,43.77]], out: [["Milan",9.19,45.46],["Bologna",11.34,44.49]]}, losers: {in: [["Cirta",6.61,36.36],["Sitifis",5.41,36.19],["Hippo Regius",7.77,36.9]], out: [["Carthage",10.32,36.85],["Utica",10.06,37.06]]}},
  "wh-354": {victors: {in: [["Rome",12.48,41.9],["Naples",14.25,40.85],["Florence",11.25,43.77]], out: [["Palermo",13.36,38.12],["Syracuse",15.29,37.07]]}, losers: {in: [["Lutetia",2.35,48.86],["Alesia",4.5,47.54],["Bibracte",4.04,46.93]], out: [["Narbo",3,43.18],["Massilia",5.37,43.3]]}},
  "rm-350": {victors: {in: [["Rome",12.48,41.9],["Naples",14.25,40.85],["Florence",11.25,43.77]], out: [["Palermo",13.36,38.12],["Syracuse",15.29,37.07]]}, losers: {in: [["Lutetia",2.35,48.86],["Alesia",4.5,47.54],["Bibracte",4.04,46.93]], out: [["Narbo",3,43.18],["Massilia",5.37,43.3]]}},
  "gr-561": {victors: {in: [["Sparta",22.43,37.07],["Corinth",22.93,37.94],["Olympia",21.63,37.64]], out: [["Athens",23.73,37.98],["Megara",23.34,37.99]]}, losers: {in: [["Athens",23.73,37.98],["Piraeus",23.65,37.94],["Eleusis",23.54,38.04]], out: [["Sparta",22.43,37.07],["Corinth",22.93,37.94]]}},
  "rm-333": {victors: {in: [["Rome",12.48,41.9],["Naples",14.25,40.85],["Florence",11.25,43.77]], out: [["Milan",9.19,45.46],["Bologna",11.34,44.49]]}, losers: {in: [["Sinope",35.15,42.03],["Amisus",36.33,41.29],["Amasia",35.83,40.65]], out: [["Nicomedia",29.92,40.76],["Byzantium",28.98,41.01]]}},
  "cnh-224": {victors: {in: [["Chang'an",108.94,34.34],["Luoyang",112.45,34.62],["Ji",116.4,39.9]], out: [["Panyu",113.26,23.13],["Kunming",102.83,24.88]]}, losers: {in: [["Ulaanbaatar",106.92,47.92],["Hohhot",111.75,40.84],["Karakorum",102.83,47.2]], out: [["Chang'an",108.94,34.34],["Ji",116.4,39.9]]}},
};
console.log("\n1b) the authored extents cover what they should");
{
  let n = 0, wrong = 0, rows = 0;
  for (const id of Object.keys(EXTENT_PLACES)) {
    const c = cards.find((x) => x && x.id === id);
    if (!c) { console.log("      " + id + ": no such card"); wrong++; continue; }
    rows++;
    const bad = require("./card-war.js").checkPlaces(c, EXTENT_PLACES[id]);
    bad.forEach((m) => console.log("      " + id + ": " + m));
    wrong += bad.length;
    for (const side of Object.keys(EXTENT_PLACES[id])) n += EXTENT_PLACES[id][side].in.length + EXTENT_PLACES[id][side].out.length;
  }
  check("every pinned place falls where it should", wrong === 0, n + " assertions over " + rows + " cards");
  /* AND NO CARD'S TWO EXTENTS OVERLAP. `checkWar` refuses one as a batch is written; this asks it of the
     whole corpus, because an extent edited later is exactly where it comes back. It is the `keys` rule —
     a name may not stand on both sides — in geometry rather than in a list, and it found two overlaps by
     itself the day it was written: Laconia against Messenia at the head of the Eurotas, and Rome against
     Samnium along the Volturno, both of them invisible until the wash came out brown on the page. */
  const over = wars.filter((c) => /OVERLAP/.test(checkWar(c, cardYears) || ""));
  check("...and no card's two extents overlap", over.length === 0, over.map((c) => c.id).join(", ") || wars.length + " cards swept");
  /* AND THE CHECK ITSELF MUST BE ABLE TO FAIL. A geometry test that has quietly stopped testing reports a
     clean corpus exactly as a clean corpus does, so one assertion is deliberately inverted here. */
  const probe = cards.find((x) => x && x.id === "rm-209");
  check("...and the test can fail",
    require("./card-war.js").checkPlaces(probe, { victors: { in: [], out: [["Rome", 12.48, 41.90]] } }).length === 1);
}

/* ---------- 1c) …and no two cards contradict each other ----------
   The fault this catches needs TWO cards and so is invisible to every per-card rule: the personal atlas
   draws every studied war on one globe, so two blocks whose years overlap and whose opposing sides claim
   one piece of ground shade it green and red at once, and whichever is painted second wins. Nothing on
   either card is wrong. It found seven pairs on the day it was written, all of them the Punic Wars card
   holding Carthage's extent AS IT STOOD IN 264 across the whole 118-year span while every later Roman
   card correctly had Sicily and Sardinia on Rome's side. */
console.log("\n1c) no two blocks contradict each other");
{
  const { checkClashes } = require("./card-war.js");
  const clash = checkClashes(cards, cardYears);
  const role = { v: "victors", l: "defeated" };
  clash.forEach((k) => console.log("      " + k.a.id + " " + role[k.sa] + " vs " + k.b.id + " " + role[k.sb] + " — " + k.why + ", both in " + k.y0 + " .. " + k.y1));
  check("the corpus's blocks agree with each other", clash.length === 0, wars.length + " blocks compared pairwise");
  /* …AND THE CHECK CAN FAIL, both ways it can fire. A planted NAME on the opposite side of an overlapping
     year, and a planted EXTENT over a side of one. A sweep that has quietly stopped sweeping reports an
     agreeing corpus exactly as an agreeing corpus does. */
  const yrs = { years: [-218, -201] };
  const nameClash = checkClashes(cards.concat([
    { id: "probe-a", answerText: "A", war: Object.assign({ victors: { name: "A", keys: ["Italy"] }, losers: { name: "B", keys: ["Tunisia"] } }, yrs) },
    { id: "probe-b", answerText: "B", war: Object.assign({ victors: { name: "C", keys: ["Tunisia"] }, losers: { name: "D", keys: ["Greece"] } }, yrs) },
  ]), cardYears);
  check("...and a name on two cards' opposing sides is reported", nameClash.some((k) => k.a.id === "probe-a" && k.b.id === "probe-b"));
  const sq = (x, y, d) => [[x - d, y - d], [x + d, y - d], [x + d, y + d], [x - d, y + d]];
  const areaClash = checkClashes(cards.concat([
    { id: "probe-c", answerText: "C", war: Object.assign({ victors: { name: "A", area: sq(12, 42, 1) }, losers: { name: "B", area: sq(20, 42, 1) } }, yrs) },
    { id: "probe-d", answerText: "D", war: Object.assign({ victors: { name: "C", area: sq(30, 42, 1) }, losers: { name: "D", area: sq(12, 42, 1) } }, yrs) },
  ]), cardYears);
  check("...and two cards' opposing extents over one piece of ground are reported",
    areaClash.some((k) => k.a.id === "probe-c" && k.b.id === "probe-d"));
  check("...while blocks that agree are not reported",
    !checkClashes([
      { id: "probe-e", answerText: "E", war: Object.assign({ victors: { name: "A", keys: ["Italy"] }, losers: { name: "B", keys: ["Tunisia"] } }, yrs) },
      { id: "probe-f", answerText: "F", war: Object.assign({ victors: { name: "A", keys: ["Italy"] }, losers: { name: "B", keys: ["Tunisia"] } }, yrs) },
    ], cardYears).length);
}

/* ---------- 2) the rules refuse what they are supposed to ---------- */
/* A CHECKER THAT CANNOT FAIL IS NOT A CHECKER. Every rule is fed the fault it exists for, because a
   validation that has quietly stopped firing reports a clean corpus exactly as a clean corpus does. */
console.log("\n2) the rules bite");
const base = { id: "x-001", answerDate: "<div class=\"dt\"><span class=\"dt-k\">Fought</span><span class=\"dt-v\">218 &ndash; 201 BCE</span></div>" };
const w = (v, l, years) => Object.assign({}, base, { war: Object.assign({ victors: v, losers: l }, years ? { years } : {}) });
const ok = { name: "Rome", keys: ["Italy"] };
check("a good block passes", !checkWar(w(ok, { name: "Carthage", keys: ["Tunisia"] }), cardYears));
check("a name on no map is refused", /none of Folio/.test(checkWar(w(ok, { name: "Carthage", keys: ["Carthage"] }), cardYears) || ""));
check("a name on both sides is refused", /both sides/.test(checkWar(w({ name: "A", keys: ["Italy"] }, { name: "B", keys: ["Italy"] }), cardYears) || ""));
check("a side with both keys and an area is refused", /both `keys` and `area`/.test(checkWar(w(ok, { name: "C", keys: ["Tunisia"], area: [[1, 1], [2, 2], [3, 1]] }), cardYears) || ""));
check("a side with neither is refused", /needs `keys`/.test(checkWar(w(ok, { name: "C" }), cardYears) || ""));
check("a missing side is refused", /is missing/.test(checkWar({ id: "x", war: { victors: ok } }, cardYears) || ""));
check("an unnamed side is refused", /no `name`/.test(checkWar(w(ok, { keys: ["Tunisia"] }), cardYears) || ""));
check("a side resolving no present-day shape is refused", /resolves nothing on world\.js/.test(checkWar(w(ok, { name: "C", keys: ["USSR"] }), cardYears) || ""));
check("a card with no derivable years is refused", /no years to draw in/.test(checkWar({ id: "x", war: { victors: ok, losers: { name: "C", keys: ["Tunisia"] } } }, cardYears) || ""));
check("...and `years` is what rescues it", !checkWar({ id: "x", war: { victors: ok, losers: { name: "C", keys: ["Tunisia"] }, years: [-264, -146] } }, cardYears));
check("a ring of two points is refused", /at least three points/.test(checkWar(w(ok, { name: "C", area: [[1, 1], [2, 2]] }), cardYears) || ""));
check("a point off the globe is refused", /within the globe/.test(checkWar(w(ok, { name: "C", area: [[500, 1], [2, 2], [3, 1]] }), cardYears) || ""));

/* ---------- 3) app.js's own half ---------- */
/* `cardWar` is SLICED OUT OF app.js BY TEXT rather than re-implemented: the reader's normaliser and the
   writer's validator are two different jobs, and a second copy of the normaliser here would answer
   differently on exactly the malformed block a card ships with. The run STOPS if the slice fails, rather
   than silently checking nothing. */
console.log("\n3) the reader's own normaliser");
const cut = (name, kind) => {
  const re = new RegExp("\\n  " + (kind || "function") + " " + name + "[\\s\\S]*?\\n  }\\n");
  const m = APP.match(re);
  if (!m) { console.log("FAIL  could not slice " + name + " out of app.js — this suite is checking nothing"); process.exit(1); }
  return m[0];
};
const SRC = cut("locPts") + cut("locRings") + cut("warSide") + cut("cardWar");
const cardWar = new Function(SRC + "\nreturn cardWar;")();
check("a flat ring is read as one ring", (cardWar({ war: { victors: { name: "A", area: [[1, 1], [2, 2], [3, 1]] }, losers: { name: "B", keys: ["x"] } } }) || {}).victors.area.length === 1);
check("a list of rings is read as several", (cardWar({ war: { victors: { name: "A", area: [[[1, 1], [2, 2], [3, 1]], [[5, 5], [6, 6], [7, 5]]] }, losers: { name: "B", keys: ["x"] } } }) || {}).victors.area.length === 2);
check("a block with one side is null", cardWar({ war: { victors: { name: "A", keys: ["x"] } } }) === null);
check("a side with nothing to draw is null", cardWar({ war: { victors: { name: "A" }, losers: { name: "B", keys: ["x"] } } }) === null);
check("`years` the wrong way round is dropped", (cardWar({ war: { victors: { name: "A", keys: ["x"] }, losers: { name: "B", keys: ["y"] }, years: [10, -10] } }) || {}).years === null);
check("no war block is null", cardWar({}) === null);

/* The serializer and the revert path: a field the baker forgets is a field an admin keystroke strips from
   every card in data.js, which is the scar `add-card-tags.js` left and is asserted rather than trusted. */
check("serializeCardData carries `war`", /if \(cardWar\(c\)\) o\.war = c\.war;/.test(APP));
check("revertCard restores `war`", /CARD_BY_ID\[id\]\.war = p\.war;/.test(APP));
check("the two tints are module-level, beside TINT_SEL", /const TINT_WIN = \{[\s\S]{0,200}const TINT_LOSE = \{/.test(APP));
/* The legend's colours are written from those constants, never from a CSS rule — a key that states its
   own colours is a key that will one day disagree with the map it explains. */
check("...and the legend's swatches are built from them", /cardWarSwatch\(TINT_WIN\)|row\(TINT_WIN/.test(APP) && /background:rgba\(' \+ t\.rgb/.test(APP));
check("...so the stylesheet states no colour of its own", !/\.war-key[^{]*\{[^}]*#[0-9a-fA-F]{3,6}/.test(CSS) && /\.war-key\{/.test(CSS));
check("the personal atlas explains what green and red mean", /Green and red are a war/.test(APP));

if (process.argv.includes("--data-only")) { console.log("\n" + pass + " passed, " + fail + " failed (data only)"); process.exit(fail ? 1 : 0); }

/* ---------- the browser half ---------- */
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");
const url = require("url").pathToFileURL(path.join(ROOT, "index.html")).href;

/* GREEN AND RED, counted as HUE DOMINANCE rather than as a particular value. The tints are translucent,
   so what lands on the canvas is the tint composited over whatever land, sea or coast is underneath, and
   a fixed RGB triple would be measuring one pixel of one theme. The two predicates are deliberately
   disjoint and neither can match the map's own greys, its ocean blue or the selection gold. */
const COUNT = (sel) => `(() => {
  const cv = document.querySelector(${JSON.stringify(sel)});
  if (!cv) return null;
  const d = cv.getContext("2d").getImageData(0, 0, cv.width, cv.height).data;
  let green = 0, red = 0, ink = 0;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 8) continue;
    ink++;
    const r = d[i], g = d[i + 1], b = d[i + 2];
    if (g - r > 18 && g - b > 12) green++;
    else if (r - g > 45 && r - b > 45) red++;
  }
  return { green: green, red: red, ink: ink, w: cv.width };
})()`;

/* THE CARD-OF-THE-DAY LIST AND THE STUDIED SET ARE SEPARATE, and getting that wrong is the harness
   failing as the app: a card whose record says it is not due again for ten days is dealt to nobody, so a
   session seeded with its own card in `cards` opens on "All caught up" and every assertion below reports
   a missing window. The card-window sections put the card in `cotd` and give it NO record; the personal
   atlas needs the opposite, since its whole register is derived from `S.cards`. */
const seed = (cotd, studied) => `localStorage.setItem("folio_v1", JSON.stringify({
  active: ["cotd:added"], cotd: ${JSON.stringify(cotd || [])},
  cards: Object.fromEntries(${JSON.stringify(studied || [])}.map((id) => [id, { due: Date.now() + 9e8, ivl: 9, ease: 2.5, status: "review", reps: 2, first: "2026-08-01" }])),
  settings: { newPerDay: 5 },
}));
localStorage.setItem("folio_mine_tour_v1", "1");
localStorage.setItem("folio_atlas_tour_v1", "1");
localStorage.setItem("folio_tour_v1", "1");`;

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.FOLIO_CHROMIUM });
  const errs = [];
  const newPage = async (cotd, studied) => {
    const p = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
    p.on("pageerror", (e) => errs.push(e.message));
    p.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !isNoise(t)) errs.push(t); });
    await p.addInitScript(seed(cotd, studied));
    return p;
  };
  /* A STUDY CARD IS REACHED THROUGH THE CARD-OF-THE-DAY PSEUDO-ENTRY, which is the one scope that deals a
     single named card — and the deck-order question stands between every fresh reader and their first
     card, so `#opSkip` is pressed if it is there and is a no-op if it is not. */
  const openCard = async (p) => {
    await p.goto(url + "#home", { waitUntil: "load" });
    await p.reload({ waitUntil: "load" });
    await p.waitForTimeout(1500);
    await p.evaluate(() => { const r = document.querySelector('[data-review="cotd:added"]'); if (r) r.click(); });
    await p.waitForTimeout(700);
    await p.evaluate(() => { const b = document.querySelector("#opSkip"); if (b) b.click(); });
    await p.waitForTimeout(700);
    await p.evaluate(() => { const r = document.querySelector("#reveal-btn"); if (r) r.click(); });
    await p.waitForTimeout(900);
  };

  /* ---------- 4) the card's own window ---------- */
  console.log("\n4) a war card's atlas window");
  let page = await newPage(["rm-209"], []);
  await openCard(page);
  const win = await page.evaluate(() => {
    const h = document.querySelector(".map-card.map-loc");
    return h ? {
      war: h.classList.contains("map-war"), card: h.getAttribute("data-map-card"),
      at: h.getAttribute("data-map-at"), v: h.getAttribute("data-war-varea") ? "area" : h.getAttribute("data-war-v"),
      l: h.getAttribute("data-war-larea") ? "area" : h.getAttribute("data-war-l"),
      label: (document.querySelector(".card-loc .label") || {}).textContent,
    } : null;
  });
  check("the Second Punic War card carries an atlas window", !!win && win.card === "rm-209", JSON.stringify(win));
  check("...marked as a war, with both sides on it", !!win && win.war && win.v === "area" && win.l === "area", JSON.stringify(win));
  check("...labelled for what it shows", !!win && /Who fought/.test(win.label || ""), win && win.label);
  check("...and needing no coordinate of its own", !!win && !win.at, String(win && win.at));
  const key = await page.$$eval(".war-key .wk-side", (els) => els.map((e) => e.textContent.replace(/\s+/g, " ").trim()));
  check("a legend names both sides", key.length === 2 && /Rome/.test(key[0]) && /Carthage/.test(key[1]), key.join(" | "));
  check("...saying which won and which lost", /victors/.test(key[0] || "") && /defeated/.test(key[1] || ""), key.join(" | "));
  check("...and it sits OUTSIDE the locator block, so the Atlas popup keeps it",
    await page.evaluate(() => !document.querySelector(".card-loc .war-key") && !!document.querySelector(".war-key")));
  const alt = await page.$eval(".map-loc .mc-canvas", (e) => e.getAttribute("aria-label"));
  check("...and the canvas says it in words for a reader who cannot see it", /Rome.*victors.*green[\s\S]*Carthage.*red/.test(alt), (alt || "").slice(0, 110));

  await page.waitForTimeout(4200);
  const px = await page.evaluate(COUNT(".map-loc .mc-canvas"));
  check("the window draws", !!px && px.ink > 2000, JSON.stringify(px));
  check("...the victors in green", !!px && px.green > 300, px && "green " + px.green);
  check("...and the defeated in red", !!px && px.red > 300, px && "red " + px.red);
  /* NEITHER SIDE MAY SWAMP THE OTHER. One tint drawn over both sides, or one side failing to resolve,
     both leave a map that looks finished — and the ratio is the only thing that separates them. */
  check("...in comparable measure, so neither side is missing", !!px && px.green / px.red > 0.2 && px.red / px.green > 0.2,
    px && px.green + " : " + px.red);

  /* ---------- 5) a named side shades the real country ---------- */
  console.log("\n5) a modern war, shaded off the map");
  await page.close();
  page = await newPage(["ww2-096"], []);
  await openCard(page);
  await page.waitForTimeout(4500);
  const px2 = await page.evaluate(COUNT(".map-loc .mc-canvas"));
  check("the Second Sino-Japanese War shades China green and Japan red", !!px2 && px2.green > 500 && px2.red > 80, JSON.stringify(px2));
  /* THE FRAME IS READ OFF THE TWO SIDES. A window that fell back to the whole globe would still draw
     both of them — in a corner — so what is asserted is that the view is ZOOMED IN on them. */
  const view = await page.evaluate(() => { const h = document.querySelector(".map-card.map-loc"); return h && h._folioMap ? h._folioMap.view() : null; });
  check("...and the window frames the war rather than the planet", !!view && view.zoom > 1.3 && view.lon > 90 && view.lon < 145, JSON.stringify(view));
  check("...with the window reporting itself ready", await page.evaluate(() => { const h = document.querySelector(".map-card.map-loc"); return !!(h && h._folioMap && h._folioMap.ready()); }));

  /* ---------- 6) the personal atlas, in the war's years and no others ---------- */
  console.log("\n6) the personal atlas");
  await page.close();
  page = await newPage([], ["rm-209"]);
  await page.goto(url + "#map", { waitUntil: "load" });
  await page.reload({ waitUntil: "load" });
  await page.waitForTimeout(4200);
  const setYear = async (y) => {
    const b = await page.$eval("#tlTrack", (e) => { const x = e.getBoundingClientRect(); return { x: x.x, y: x.y, w: x.width, h: x.height }; });
    const now = new Date().getFullYear();
    await page.mouse.click(b.x + b.w * ((y + 4000) / (now + 4000)), b.y + b.h / 2);
    await page.waitForTimeout(1200);
  };
  await setYear(-210);
  const a1 = await page.evaluate(COUNT("#globe"));
  check("in a year the war was fought, both sides are on the globe", !!a1 && a1.green > 200 && a1.red > 200, JSON.stringify({ g: a1.green, r: a1.red }));
  await setYear(-400);
  const a0 = await page.evaluate(COUNT("#globe"));
  check("...and two centuries before it, neither is", !!a0 && a0.green < 60 && a0.red < 60, JSON.stringify({ g: a0.green, r: a0.red }));
  await setYear(-100);
  const a2 = await page.evaluate(COUNT("#globe"));
  check("...nor a century after it ended", !!a2 && a2.green < 60 && a2.red < 60, JSON.stringify({ g: a2.green, r: a2.red }));

  /* EVERYTHING DRAWN ON THIS TAB ANSWERS A CLICK, and a war's shading is drawn where the reader has
     unlocked no country at all — so it is the only thing under the pointer and must answer. */
  await setYear(-210);
  const r = await page.$eval("#globe", (e) => { const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; });
  let title = "";
  for (let dx = -300; dx <= 300 && !title; dx += 24) {
    for (let dy = -240; dy <= 240 && !title; dy += 24) {
      await page.mouse.click(r.x + r.w / 2 + dx, r.y + r.h / 2 + dy);
      await page.waitForTimeout(60);
      title = await page.evaluate(() => { const e = document.getElementById("countryPop"); return e && !e.hidden ? document.getElementById("cpName").textContent : ""; });
    }
  }
  check("clicking a side opens the war's own card", /Second Punic War/i.test(title), title || "nothing opened");
  check("...and the popup keeps the legend that explains the colours",
    await page.evaluate(() => !!document.querySelector("#cpDesc .war-key")) &&
    await page.evaluate(() => !document.querySelector("#cpDesc .card-loc")));

  check("no console errors anywhere", errs.length === 0, errs.slice(0, 3).join(" | "));
  await browser.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
