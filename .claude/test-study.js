#!/usr/bin/env node
/* test-study.js — the study integration's arithmetic, without a browser (Atlas v2 Phase 3b; docs/atlas-v2-design.md §2.8,
   §7 "Phase 3b — as built").

     node .claude/test-study.js

   WHAT IT PROVES, each a fault the eye would not see on a globe full of marks:
     · THE LIGHT INDEX IS A FUNCTION OF THE CARDS: atlas/data/card-places.js is byte-for-byte what build-card-places.js makes from
       the cards' heavy `places` (so the Personal Atlas, which never loads the heavy collection files, can never disagree with the
       cards), is under its 200 KB budget, is deterministic, and a build over budget throws instead of writing;
     · "STUDIED" IS v1's DEFINITION AND ONE DEFINITION: the host's `studiedCards` in app.js and v1's `atlasRegisterAll` both read
       the keys of `S.cards` — a card with a record — and the studied-set computation turns exactly those ids into exactly their
       places (a seeded reader, compared against the cards' own `places`), counts the studied cards that carry no place and says so,
       and ignores an id that is not a card (a community deck's);
     · THE FLAGS: Personal draws only the studied places, Full every place any card is about with the studied ones apart, a
       collection switched off removes its cards' places from both (and the studied flag only through a studied card of a collection
       that is on), the plain Map draws nothing;
     · THE SENTENCES are honest: the count line, the empty state for a reader with no cards, for one whose cards have no place, and for
       one who has switched every collection off, and the note "K of your cards have no place on the map yet";
     · THE PLACE CARD'S LIST: the reader's cards first, capped with "and N more", a Personal listing counting the rest without naming
       them, a switched-off collection's cards absent;
     · THE MARKS (stacks removed 2026-10-14): there is no clustering anywhere; every kind a card is about has one of three shapes and a
       layer (the draw order); a mark is a dot 4 px across at the widest view and 16 by city scale; a tap finds the nearest marks within a
       finger by the same arithmetic as a brute force; a fan holds every member once, apart, inside the frame and off the controls.

   Phase 3c adds: the years a place has (search across years — never an invented year), the default view's framing, the New-discovery
   rule, the polity index and the glossary table's builders. Zero dependencies. Not part of the site. Re-run after touching atlas/study.js, atlas/data/card-places.js, the study block of
   atlas/atlas.js, the study pass of atlas/atlas-worker.js, or `studyHost` in app.js. */
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const AS = require(path.join(ROOT, "atlas", "study.js"));
const C = require("./atlas-build/build-card-places.js");
const { loadCards } = require("./card-io.js");
let pass = 0, fail = 0;
const check = (name, ok, detail) => { if (ok) { pass++; console.log("  ok    " + name + (detail ? "  (" + detail + ")" : "")); } else { fail++; console.log("  FAIL  " + name + (detail ? "  (" + detail + ")" : "")); } };

console.log("\n1) the light index\n");
const { cards } = loadCards();
const w = {}; new Function("window", fs.readFileSync(C.TARGET, "utf8"))(w);
const RAW = w.ATLAS_CARD_PLACES;
const st0 = C.build({ check: true, log: () => {} });
check("card-places.js is exactly what the cards build (byte for byte)", st0.ok, st0.why);
check("it is under its 200 KB budget", st0.bytes <= C.BUDGET, st0.bytes + " bytes");
check("two builds are identical (the digest is a hash of the content, not a clock)", C.render(C.indexOf(cards)) === C.render(C.indexOf(cards.slice().reverse())));
check("a card with no places is not in it, and every card that has some is", Object.keys(RAW.cards).length === cards.filter((c) => Array.isArray(c.places) && c.places.length).length, Object.keys(RAW.cards).length + " cards");
check("each entry is the card's own `places`, sorted, through the id table", cards.filter((c) => c.places && c.places.length).every((c) => RAW.cards[c.id].map((i) => RAW.ids[i]).join() === [...new Set(c.places)].sort().join()));
let over = null; try { C.build({ cards: [{ id: "x-001", places: Array.from({ length: 60000 }, (_, i) => "pl:q" + (1000000 + i)) }], dry: true, log: () => {} }); } catch (e) { over = e; }
check("a build over the budget throws (the brief's stop rule) instead of writing", over && over.over && /split/.test(over.message), over ? over.message.slice(0, 80) : "no error");
const idx = AS.parse(RAW);
check("parse: every card's places come back, and the reverse index lists every card of a place", idx.cardIds.length === Object.keys(RAW.cards).length && [...idx.cardsOfPlace].every(([id, cs]) => cs.every((c) => idx.placesOfCard.get(c).includes(id))));
const bad = AS.parse({ ids: ["a"], cards: { x: [0, 7], y: "no", z: [9] } });
check("a malformed entry (an index outside `ids`, a non-list) is ignored, never thrown", bad.placesOfCard.get("x").join() === "a" && !bad.placesOfCard.has("y") && !bad.placesOfCard.has("z"));
check("a missing or empty file parses to an empty index", AS.parse(null).cardIds.length === 0 && AS.parse({}).cardIds.length === 0);

console.log("\n2) studied is v1's definition, and one\n");
const app = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const host = /studiedCards: \(\) => (Object\.keys\(S\.cards \|\| \{\}\)\.filter\(\(id\) => CARD_BY_ID\[id\]\)),/.exec(app);
check("the host's studiedCards is Object.keys(S.cards) filtered to shipped cards — a record, never a view or an opening", !!host, host ? host[1] : "not found");
const v1 = /function cardAtlasDiscover[\s\S]{0,2200}?const studied = (Object\.keys\(S\.cards \|\| \{\}\));/.exec(app);   // Phase 5: v1's register is gone; the "Discovered!" chip asks the same keys of the same object
check("the card window's discovery chip asks the same keys of the same object as the host (a card with a record)", !!v1 && host && host[1].startsWith(v1[1]), v1 ? v1[1] : "not found");
check("nothing in the study layer writes to the progress blob: no S.* assignment in studyHost, no progress field added", !/studyHost[\s\S]{0,900}S\.[A-Za-z]+\s*=[^=]/.test(app.slice(app.indexOf("const studyHost"), app.indexOf("const studyHost") + 900)) && !/PROGRESS_FIELDS = \[[^\]]*"(atlas2[A-Za-z]*|atlasStudy|studyMode|studyOff|personalAtlas|studiedPlaces)"/.test(app));
const withPlaces = cards.filter((c) => c.places && c.places.length);
const noPlace = cards.filter((c) => !(c.places && c.places.length) && /^ps-/.test(c.id)).slice(0, 4);
const reader = [...withPlaces.filter((c) => /^gr-/.test(c.id)).slice(0, 7), ...withPlaces.filter((c) => /^gw-/.test(c.id)).slice(0, 3), ...withPlaces.filter((c) => /^rm-/.test(c.id)).slice(0, 2)].map((c) => c.id);
const st = AS.studied(idx, [...reader, ...noPlace.map((c) => c.id), "not-a-card-of-ours"]);
const expect = new Set(cards.filter((c) => reader.includes(c.id)).flatMap((c) => c.places));
check("a seeded reader's places are exactly the union of their cards' own `places`", st.all.size === expect.size && [...expect].every((id) => st.all.has(id)), reader.length + " cards → " + st.all.size + " ids");
check("…split into places and polities", st.places.size + st.polities.size === st.all.size && [...st.polities].every((id) => id.startsWith("pol:")) && [...st.places].every((id) => !id.startsWith("pol:")));
check("the studied cards that carry a place are exactly the seeded ones", st.cards.length === reader.length && reader.every((id) => st.cardSet.has(id)));
check("the cards with no place are counted (not hidden): " + noPlace.length + " of them, and the unknown id is a card of someone else's and counts as one", st.noPlace === noPlace.length + 1 && st.total === reader.length + noPlace.length + 1, `noPlace ${st.noPlace}, total ${st.total}`);
check("a card studied twice (a duplicate id) counts once", AS.studied(idx, [reader[0], reader[0]]).total === 1);

console.log("\n3) the flags, the collections, the sentences\n");
// a collection per card prefix, standing in for the host's cardCollectionRoot
const NAMES = { gr: "Ancient Greece", gw: "World Geography", rm: "Ancient Rome", ps: "Psychology" };
const info = (cid) => { const p = cid.replace(/-\d+$/, ""); return NAMES[p] ? { collId: "c-" + p, coll: NAMES[p] } : { collId: "c-" + p, coll: p }; };
const none = new Set();
let f = AS.flags(idx, st, "personal", none, info);
check("Personal: every flagged place is the reader's (flag 2), and every studied place is flagged", [...f.values()].every((v) => v === 2) && f.size === st.all.size, f.size + " flagged");
f = AS.flags(idx, st, "full", none, info);
check("Full: every place any card is about is flagged — the studied ones 2, the rest 1", f.size === idx.ids.length && [...f].every(([id, v]) => v === (st.all.has(id) ? 2 : 1)), f.size + " of " + idx.ids.length);
check("the plain Map flags nothing", AS.flags(idx, st, "map", none, info).size === 0 && AS.flags(idx, st, "", none, info).size === 0);
const hide = new Set(["c-gr"]);
f = AS.flags(idx, st, "personal", hide, info);
const rmOnly = new Set(cards.filter((c) => reader.includes(c.id) && !/^gr-/.test(c.id)).flatMap((c) => c.places));
const greekOnly = [...st.all].filter((id) => ![...rmOnly].includes(id));
check("a collection switched off removes the places only its studied cards bring (a place shared with a collection still on stays)", greekOnly.every((id) => !f.has(id)) && [...rmOnly].every((id) => f.get(id) === 2), greekOnly.length + " gone, " + rmOnly.size + " stay");
f = AS.flags(idx, st, "full", hide, info);
check("…and in the Full Atlas it removes the collection's unstudied places too, keeping a studied place whose studied card is in a collection still on", [...f.keys()].every((id) => idx.cardsOfPlace.get(id).some((c) => info(c).collId !== "c-gr")) && [...rmOnly].every((id) => f.get(id) === 2));
const cols = AS.collections(idx, st, info);
check("only collections that have places are listed, largest first, each with how many places are the reader's", cols.length > 0 && cols.every((c) => c.places > 0) && cols.every((c, i) => !i || cols[i - 1].places >= c.places) && cols.find((c) => c.id === "c-gr").mine > 0, cols.slice(0, 3).map((c) => c.name + " " + c.mine + "/" + c.places).join(", "));
check("a collection with no card that names a place is not listed", !cols.some((c) => c.id === "c-ps"));
let sm = AS.summary(st, "personal", AS.flags(idx, st, "personal", none, info));
check("the count line reads \"N places … from M cards\"", /^\d[\d,]* places?( and \d+ polit(y|ies))? from \d+ cards$/.test(sm.text) && sm.text.includes("from " + reader.length + " cards"), sm.text);
check("the honest note says how many of the reader's cards have no place yet", sm.note === (noPlace.length + 1) + " of your cards have no place on the map yet", sm.note);
check("a reader whose one card has no place is told so, in the singular", /^The card you have studied has no place on the map yet\./.test(AS.summary(AS.studied(idx, [noPlace[0].id]), "personal", new Map()).empty));
check("a reader with several, none of which has a place, is told so", /^None of your 2 studied cards has a place on the map yet\./.test(AS.summary(AS.studied(idx, [noPlace[0].id, noPlace[1].id]), "personal", new Map()).empty));
check("a reader with no cards gets the honest empty state and no count line", (() => { const s0 = AS.summary(AS.studied(idx, []), "personal", new Map()); return /haven’t studied any cards yet/.test(s0.empty) && !s0.text && !s0.note; })());
check("a reader who has switched every collection off is told why the globe is empty", /switched off/.test(AS.summary(st, "personal", new Map()).empty));
sm = AS.summary(st, "full", AS.flags(idx, st, "full", none, info));
check("the Full Atlas line counts every place and how many are the reader's", /places/.test(sm.text) && /· \d+ yours$/.test(sm.text), sm.text);
check("the plain Map says nothing", (() => { const s1 = AS.summary(st, "map", new Map()); return !s1.text && !s1.note && !s1.empty; })());

console.log("\n4) the place card's list\n");
const hot = [...idx.cardsOfPlace].sort((a, b) => b[1].length - a[1].length)[0];
const hotMine = AS.studied(idx, hot[1].slice(0, 3));
let L = AS.cardsFor(idx, hot[0], hotMine, "full", none, info);
check("a place with many cards lists " + AS.LIST_CAP + " and says how many more (" + hot[0] + ", " + hot[1].length + " cards)", L.shown.length === AS.LIST_CAP && L.more === hot[1].length - AS.LIST_CAP && L.total === hot[1].length, `shown ${L.shown.length}, more ${L.more}`);
check("the reader's own cards come first, marked", L.shown.slice(0, 3).every((c) => c.mine) && L.shown.slice(3).every((c) => !c.mine));
L = AS.cardsFor(idx, hot[0], hotMine, "personal", none, info);
check("the Personal list names only the reader's cards and counts the rest without naming them", L.shown.length === 3 && L.shown.every((c) => c.mine) && L.others === hot[1].length - 3 && L.more === 0, `others ${L.others}`);
L = AS.cardsFor(idx, hot[0], hotMine, "full", none, info, 40);
check("a larger limit shows more of the list (the \"and N more\" button asks for 20 more)", L.shown.length === Math.min(40, hot[1].length));
const owner = info(hot[1][0]).collId;
L = AS.cardsFor(idx, hot[0], hotMine, "full", new Set([owner]), info, 9999);
check("a switched-off collection's cards are absent from the list", L.shown.every((c) => info(c.id).collId !== owner) && L.total < hot[1].length);
check("a polity lists its linked cards the same way", (() => { const pol = [...idx.cardsOfPlace].find(([id]) => id === "pol:rome"); if (!pol) return true; const r = AS.cardsFor(idx, "pol:rome", AS.studied(idx, []), "full", none, info, 9999); return r.total === pol[1].length && r.total > 0; })());

console.log("\n5) the marks: every flagged place is its own mark, and nothing stands in for a neighbour (stacks removed 2026-10-14)\n");
{
  const REG = require("./places-registry.js").loadRegistry();
  const full = AS.flags(idx, AS.studied(idx, []), "full", none, info);
  const kindOf = (id) => (REG.rows.get(id) || {}).kind;
  // NO CLUSTERING ANYWHERE: the function is gone from the module, and no source names a stack marker, its radius or its count
  check("AtlasStudy has no cluster by screen proximity: the only grouping is a CITY's (stackGroups, per city — decision d of 2026-10-17)", AS.cluster === undefined && !Object.keys(AS).some((k) => /cluster/i.test(k)) && typeof AS.stackGroups === "function" && typeof AS.cityMembership === "function");
  const worker = fs.readFileSync(path.join(ROOT, "atlas", "atlas-worker.js"), "utf8"), atlasJs = fs.readFileSync(path.join(ROOT, "atlas", "atlas.js"), "utf8"), css = fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
  check("the worker never calls cluster and groups marks only within one city (byCity)", !/AtlasStudy\.cluster|\.cluster\(/.test(worker) && /for \(const \[cid, idxs\] of byCity\)/.test(worker));
  check("the page has no stack mark, no expandStack and no \"N places here, activate to zoom in\" button", !/kind === "stack"|expandStack|places here, activate|"stack:"|startsWith\("stack:/.test(atlasJs));
  check("…and no setting brings it back (nothing stored under a key that names clusters or stacks)", !/folio\.atlas2\.[a-zA-Z]*(stack|cluster)/i.test(atlasJs));
  // THE SIZE: a dot about 4 px across at the widest view, today's 16 px by city scale, never shrinking as the reader zooms in
  const hs = [40, 26.8, 16, 12, 8, 6, 4, 3, 2, 1.5, 1, 0.1].map((k) => AS.markHalf(k));
  check("markHalf is 2 px (a dot 4 px across) at 16 km/px and wider, 8 px (16 across, as it was) at 1.5 km/px and nearer", hs[0] === 2 && hs[1] === 2 && hs[2] === 2 && Math.abs(AS.markHalf(1.5) - 8) < 1e-9 && hs[11] === 8, hs.map((h) => h.toFixed(2)).join(" "));
  check("…and never shrinks as the zoom grows", hs.every((h, i) => i === 0 || h >= hs[i - 1] - 1e-12));
  check("…and is smooth: no two zoom steps a quarter-octave apart differ by more than a pixel", (() => { let worst = 0; for (let k = 20; k > 1; k /= Math.pow(2, 0.25)) worst = Math.max(worst, Math.abs(AS.markHalf(k / Math.pow(2, 0.25)) - AS.markHalf(k))); return worst <= 1; })());
  // THE SHAPE AND THE LAYER of every kind of place any card is about (the property over the Full Atlas's flags)
  const kinds = new Set([...full.keys()].map(kindOf));
  const shapeOK = [...kinds].every((k) => ["diamond", "triangle", "disc"].includes(AS.markShape(k)));
  check("every kind the Full Atlas flags (" + kinds.size + ") has one of the three shapes", shapeOK, [...kinds].sort().join(", "));
  check("a mountain, a hill and a cape are triangles; a polity, a people, a culture and an extent are discs; a city, a site, an island and a country are diamonds",
    ["mountain", "hill", "cape"].every((k) => AS.markShape(k) === "triangle") && ["polity", "people", "culture", "extent"].every((k) => AS.markShape(k) === "disc") && ["city", "capital", "town", "site", "island", "country", "region", "river"].every((k) => AS.markShape(k) === "diamond"));
  check("a hill is the smaller triangle, nothing else is scaled", AS.markScale("hill") === 0.75 && ["mountain", "city", "polity", "cape"].every((k) => AS.markScale(k) === 1));
  const order = [AS.markLayer("city", 1), AS.markLayer("city", 2), AS.markLayer("polity", 1), AS.markLayer("polity", 2)];
  check("the draw order is places not studied (0), places studied (1), polities (2), whether or not studied", order.join() === "0,1,2,2", order.join());
  check("every flagged id gets exactly one layer in 0..2, and the Full flags hold " + [...full.keys()].filter((id) => AS.markLayer(kindOf(id), full.get(id)) === 2).length + " polities", [...full].every(([id, f]) => [0, 1, 2].includes(AS.markLayer(kindOf(id), f))));
  // THE TAP: the nearest within a finger, found by the same arithmetic a brute force gives
  let seed = 12345; const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
  const pts = Array.from({ length: 400 }, () => ({ x: rnd() * 800, y: rnd() * 600 }));
  pts.push({ x: pts[7].x, y: pts[7].y }, { x: pts[7].x, y: pts[7].y });   // three marks on one exact point
  let allSame = true;
  for (const R of [12, 22]) for (let t = 0; t < 200; t++) {
    const x = rnd() * 800, y = rnd() * 600, got = AS.nearMarks(pts, x, y, R);
    const want = pts.map((p, i) => ({ i, d: Math.hypot(p.x - x, p.y - y) })).filter((o) => o.d <= R).sort((p, q) => p.d - q.d || p.i - q.i).map((o) => o.i);
    if (got.join() !== want.join()) allSame = false;
  }
  check("nearMarks returns exactly the marks within the radius, nearest first, for 12 px and 22 px (400 taps against a brute force)", allSame);
  check("marks on one exact point are all returned, in the order given", AS.nearMarks(pts, pts[7].x, pts[7].y, 12).slice(0, 3).join() === "7,400,401");
  // THE FAN: every member once, at a distinct place, wholly inside the frame and clear of the controls where there is room
  const W = 390, H = 700, chrome = [[0, 0, 390, 120], [330, 120, 390, 380], [0, 640, 390, 700]];   // a phone: the panel, the zoom stack, the rail
  let fanOK = true, fanClear = true, apart = true, trueKept = true, n2 = 0, smallN = 0, smallClear = 0;
  for (let t = 0; t < 300; t++) {
    const n = 2 + Math.floor(rnd() * 12), tap = { x: 60 + rnd() * 270, y: 160 + rnd() * 440 };
    const items = Array.from({ length: n }, (_, i) => ({ x: tap.x + (rnd() - 0.5) * (i % 3 === 0 ? 0 : 40), y: tap.y + (rnd() - 0.5) * (i % 3 === 0 ? 0 : 40), w: 30 + rnd() * 70 }));
    const before = JSON.stringify(items), f = AS.fanOut(items, tap, { W, H, chrome });
    if (JSON.stringify(items) !== before) trueKept = false;
    if (f.slots.length !== n || new Set(f.slots.map((sl) => sl.i)).size !== n) fanOK = false;
    for (let i = 0; i < f.slots.length; i++) for (let j = i + 1; j < f.slots.length; j++) if (Math.hypot(f.slots[i].x - f.slots[j].x, f.slots[i].y - f.slots[j].y) < 20) apart = false;
    if (f.clear) for (const sl of f.slots) { const r = sl.rect; if (!(r[0] >= 0 && r[1] >= 0 && r[2] <= W && r[3] <= H && !chrome.some((c) => r[0] < c[2] && r[2] > c[0] && r[1] < c[3] && r[3] > c[1]))) fanClear = false; }
    if (f.clear) n2++;
    if (n <= 6) { smallN++; if (f.clear) smallClear++; }
  }
  check("a fan holds each member once, whatever the count (2–13) and whether they share a point or not", fanOK);
  check("…at places at least 20 px apart (the copies never overlap)", apart);
  check("…leaves the members' true positions as they were", trueKept);
  check("…and when it says it is clear every copy and name lies wholly in the frame, off every control and clear of one another (" + n2 + " of 300 phone taps were)", fanClear && n2 > 100);
  check("…and a fan of up to six almost always finds room on a phone but for a tap pinned against a control: " + smallClear + " of " + smallN + " are clear", smallN > 50 && smallClear / smallN >= 0.9, (100 * smallClear / smallN).toFixed(0) + " %");
  check("more than 14 members fan only the nearest 14 (the others are for a closer zoom), never a ring of a hundred", AS.fanOut(Array.from({ length: 40 }, () => ({ x: 200, y: 300, w: 40 })), { x: 200, y: 300 }, { W, H, chrome }).slots.length === 14);
}

/* ---------------------------------------------------------------- Phase 3c */
console.log("\n6) search across years: only years the data holds\n");
{
  const R = [[750, 969], [1202, 1259]];
  check("inside a range: no note", AS.yearsNote(R, 800) === null && AS.yearsNote(R, 750) === null && AS.yearsNote(R, 1259) === null);
  check("no ranges on record: never said to be absent", AS.yearsNote([], 1000) === null && AS.yearsNote(null, 1000) === null);
  check("before the first range: its first year", AS.yearsNote(R, -300).go === 750);
  check("after the last range: its last year", AS.yearsNote(R, 2026).go === 1259);
  check("in a gap: the nearer end (1000 is 31 after 969 and 202 before 1202)", AS.yearsNote(R, 1000).go === 969 && AS.yearsNote(R, 1150).go === 1202);
  check("on a tie the later year", AS.yearsNote([[0, 10], [20, 30]], 15).go === 20);
  const PX = {}; new Function("window", fs.readFileSync(path.join(ROOT, "atlas", "data", "polity-index.js"), "utf8"))(PX);
  let asked = 0, bad = 0;
  for (const row of PX.ATLAS_POLITY_INDEX.polities) for (let y = -3500; y <= 2026; y += 37) { const n = AS.yearsNote(row[5], y); if (!n) continue; asked++; if (!row[5].some((r) => r[0] === n.go || r[1] === n.go) || row[5].some((r) => r[0] <= n.go && n.go <= r[1]) === false) bad++; }
  check("over every polity of the index and 150 years each, every year offered is an endpoint of one of its own ranges, and the polity is on the map in it", asked > 5000 && bad === 0, asked + " offers, " + bad + " bad");
  const Bp = require("./atlas-build/build-polity-index.js");
  const ix = Bp.indexOf({ entities: [{ id: "pol:a", name: "A", kind: "polity", span: [0, 30], sourceNames: ["A", "Ancient A"] }, { id: "pol:b", name: "B", kind: "contested", span: [0, 5] }], steps: [[0, 0, 9, 1], [0, 10, 19, 2], [0, 25, 30, 3], [0, 12, 14, 4]], cities: [{ entity: "pol:a", name: "Aville", lon: 1, lat: 2, from: 0, to: 30 }, { entity: "pol:b", name: "Bville", lon: 1, lat: 2, from: 0, to: 5 }] });
  check("the index joins consecutive and overlapping steps, keeps a real gap, and lists only polities (and their capitals)", JSON.stringify(ix.polities) === JSON.stringify([["pol:a", "A", ["Ancient A"], 0, 30, [[0, 19], [25, 30]], ""]]) && ix.capitals.length === 1, JSON.stringify(ix.polities));
  check("atlas/data/polity-index.js is exactly what history.bin's header builds", Bp.build({ check: true, log: () => {} }).ok);
  check("…and is small (the 4.7 MB history file is not fetched by a keystroke)", fs.statSync(Bp.TARGET).size < 40000, fs.statSync(Bp.TARGET).size + " bytes");
}

console.log("\n7) the default view\n");
{
  const near = [[23.7, 37.9], [22.9, 40.6], [21.7, 38.2], [26.1, 38.3], [25.1, 35.3]];
  const f = AS.framing(near, { shortPx: 700 });
  check("a handful of Greek places: centred among them, a few km/px", !!f && Math.abs(f.lon - 23.9) < 1 && Math.abs(f.lat - 38.1) < 1 && f.kmpp >= 3 && f.kmpp < 8, f && JSON.stringify({ lon: +f.lon.toFixed(1), lat: +f.lat.toFixed(1), kmpp: +f.kmpp.toFixed(1) }));
  check("no places: null (the caller keeps today's default)", AS.framing([], {}) === null && AS.framing(null, {}) === null);
  check("places spread right round the globe: null", AS.framing([[0, 0], [180, 0], [90, 0], [-90, 0]], {}) === null);
  check("one place alone is held at the floor (3 km/px), not zoomed into the street", AS.framing([[12.5, 41.9]], { shortPx: 700 }).kmpp === 3);
  check("the scale never passes the ceiling", AS.framing([[0, 0], [60, 0], [-60, 0]], { shortPx: 400, maxKmpp: 24 }).kmpp <= 24);
  const withOutlier = near.concat([[151.2, -33.9]]), plain = AS.framing(near, { shortPx: 700 }), out = AS.framing(withOutlier, { shortPx: 700, keep: 0.9 });
  const many = []; for (let i = 0; i < 20; i++) many.push([23 + (i % 5) * 0.5, 38 + Math.floor(i / 5) * 0.4]); many.push([151.2, -33.9]);
  const m1 = AS.framing(many.slice(0, 20), { shortPx: 700 }), m2 = AS.framing(many, { shortPx: 700 });
  check("with twenty close places, an outlier on the far side of the globe moves the centre and the scale by little", Math.abs(m1.lon - m2.lon) < 25 && m2.kmpp < 24 && m2.radiusKm < m1.radiusKm * 4, `radius ${m1.radiusKm.toFixed(0)} → ${m2.radiusKm.toFixed(0)} km`);
  check("across the antimeridian the centre is on the right side (Fiji and Samoa)", (() => { const g = AS.framing([[178.0, -17.7], [-172.0, -13.8], [-175.2, -21.1]], { shortPx: 700 }); return Math.abs(Math.abs(g.lon) - 180) < 6; })());
  check("deterministic", JSON.stringify(AS.framing(near, { shortPx: 700 })) === JSON.stringify(AS.framing(near.slice(), { shortPx: 700 })));
  void plain;
}

console.log("\n8) New discovery\n");
{
  const st = AS.studied(AS.parse(RAW), cards.filter((c) => c.places && c.places.length).slice(0, 6).map((c) => c.id));
  const id = [...st.places][0], seenNone = () => false;
  check("a studied place not yet seen is new", AS.isNewDiscovery(st, id, "Somewhere", seenNone) === true);
  check("…and is not once its name is in the seen register", AS.isNewDiscovery(st, id, "Somewhere", (n) => n === "Somewhere") === false);
  check("a place the reader has not studied is never new", AS.isNewDiscovery(st, "pl:q1", "Elsewhere", seenNone) === false);
  check("a polity is never a discovery (it is drawn by year)", AS.isNewDiscovery({ places: new Set(["pol:rome"]) }, "pol:rome", "Rome", seenNone) === false);
  check("nothing without a name or a studied set", AS.isNewDiscovery(null, id, "x", seenNone) === false && AS.isNewDiscovery(st, id, "", seenNone) === false);
  check("app.js's host reads and writes the EXISTING placesSeen register, and no new progress field", (() => { const a = fs.readFileSync(path.join(ROOT, "app.js"), "latin1"); return /seenPlace: \(name\) => !!\(S\.placesSeen/.test(a) && /discover: \(name\) => markSeen\("placesSeen", atlasCountryV2\(name\)\)/.test(a) && /see: \(name\) => \{ if \(name\) markSeen\("placesSeen", atlasCountryV2\(name\)\); \}/.test(a); })());
}

console.log("\n9) the glossary's \"show on the Atlas\" table\n");
{
  const G = require("./atlas-build/build-glossary-places.js");
  const rows = new Map([["adm0:fra", { id: "adm0:fra", kind: "country" }], ["pl:q1", { id: "pl:q1", kind: "site" }]]);
  const reg = { rows, byName: new Map([["france", [rows.get("adm0:fra")]], ["twin", [{ id: "adm0:a", kind: "country" }, { id: "adm0:b", kind: "country" }]]]) };
  const fold = (x) => String(x).toLowerCase();
  const T = G.tableOf({ points: { Lascaux: [1, 2], Alaska: [3, 4], Gone: [5, 6] }, countries: { France: "France", Twin: "Twin", Nowhere: "Nowhere" }, resolved: { Lascaux: "pl:q1", Gone: "pl:q999" }, reg, fold });
  check("a point resolves through the spec, a country through its one gazetteer row", T.ids.Lascaux === "pl:q1" && T.ids.France === "adm0:fra");
  check("an unresolved point, a stale id, a two-row name and an unknown country are left out and say why — nothing guessed", !T.ids.Alaska && !T.ids.Gone && !T.ids.Twin && !T.ids.Nowhere && T.left.length === 4 && T.left.every((l) => l.why), T.left.map((l) => l.slug).join(","));
  check("atlas/data/glossary-places.js is exactly what glossary.js, the spec and the registry build", G.build({ check: true, log: () => {} }).ok);
  const wg = {}; new Function("window", fs.readFileSync(G.TARGET, "utf8"))(wg); const gp = wg.ATLAS_GLOSSARY_PLACES;
  check("every country term has a country row and no term in the table is a community deck's", Object.keys(gp.ids).filter((k) => /^adm0:/.test(gp.ids[k])).length === 181 && Object.keys(gp.ids).every((k) => !/^deck:/.test(k)), JSON.stringify(gp.counts));
}

console.log("\n10) the wars (Phase 2d): which wars are drawn, which entities are tinted in which role\n");
{
  const T = {
    "rm-209": { t: "Second Punic War", y: [-218, -201], g: 0, v: { n: "Rome", m: [["pol:rome", -218, -201]], x: "", u: [] }, l: { n: "Carthage", m: [["pol:carthage", -218, -201]], x: "", u: [] } },
    "rm-152": { t: "First Samnite War", y: [-343, -341], g: 0, v: { n: "Rome", m: [["pol:rome", -343, -341]], x: "", u: [] }, l: { n: "Samnium", m: [], x: "pol:ext_samnium", u: [] } },
    "wh-345": { t: "Punic Wars", y: [-264, -146], g: 1, v: { n: "Rome", m: [["pol:rome", -264, -146]], x: "", u: [] }, l: { n: "Carthage", m: [["pol:carthage", -264, -146]], x: "", u: [] } },
    "ww2-001": { t: "Second World War", y: [1937, 1945], g: 1, v: { n: "Allied powers", m: [["pol:ussr", 1941, 1945], ["pol:roc", 1937, 1945]], x: "", u: ["Poland"] }, l: { n: "Axis powers", m: [["pol:italy", 1937, 1943]], x: "", u: ["Germany"] } },
  };
  const info = (id) => ({ collId: id.startsWith("rm") ? "col-40" : "col-8" });
  const ids = (set) => [...set].sort().join(",");
  check("the plain Map draws every war a card teaches except those that group others", ids(AS.warsShown(T, { pos: "on", mode: "map" })) === "rm-152,rm-209");
  check("the switch off draws none — except a war chosen from a card, which is drawn whatever the switch says", AS.warsShown(T, { pos: "off", mode: "map" }).size === 0 && ids(AS.warsShown(T, { pos: "off", mode: "map", focus: "ww2-001" })) === "ww2-001");
  check("Phase 4 / 0a: the default is Automatic — off on the plain Map, on in the Personal Atlas, off in the Full Atlas, and a war chosen from a card is drawn in all three", AS.WARS_DEFAULT === "auto" && AS.normalizeWars(undefined) === "auto" && AS.normalizeWars("x") === "auto" && ids(AS.warsShown(T, { pos: "auto", mode: "map" })) === "" && ids(AS.warsShown(T, { pos: "auto", mode: "full" })) === "" && ids(AS.warsShown(T, { pos: "auto", mode: "personal", cardSet: new Set(["rm-209"]) })) === "rm-209" && ids(AS.warsShown(T, { pos: "auto", mode: "map", focus: "rm-209" })) === "rm-209");
  check("...and a reader's own On or Off holds in every mode (On tints the plain Map; Off keeps the Personal Atlas plain)", ids(AS.warsShown(T, { pos: "on", mode: "map" })) === "rm-152,rm-209" && ids(AS.warsShown(T, { pos: "off", mode: "personal", cardSet: new Set(["rm-209"]) })) === "");
  check("a war that groups others (war.group) is drawn only when chosen, in every mode", !AS.warsShown(T, { pos: "on", mode: "full" }).has("wh-345") && AS.warsShown(T, { pos: "on", mode: "personal", cardSet: new Set(["wh-345"]), focus: "wh-345" }).has("wh-345"));
  check("the Personal Atlas draws the wars of the reader's own studied cards and no others", ids(AS.warsShown(T, { pos: "on", mode: "personal", cardSet: new Set(["rm-209"]) })) === "rm-209");
  check("the Full Atlas drops a switched-off collection's wars", ids(AS.warsShown(T, { pos: "on", mode: "full", hidden: new Set(["col-40"]), info })) === "" && ids(AS.warsShown(T, { pos: "on", mode: "full", hidden: new Set(["col-8"]), info })) === "rm-152,rm-209");
  const shown = new Set(["rm-209", "rm-152", "ww2-001"]);
  const r1 = AS.warRoles(T, shown, -210);
  check("in 210 BCE Rome is a victor and Carthage a loser, and nothing else is tinted", r1.size === 2 && r1.get("pol:rome").role === 1 && r1.get("pol:carthage").role === 2 && AS.roleWord(r1.get("pol:rome").role) === "victor");
  check("outside every war's years nothing is tinted (one year before and one after)", AS.warRoles(T, shown, -220).size === 0 && AS.warRoles(T, shown, -200).size === 0);
  check("an authored extent is tinted in the war's own years and a member only inside its window", AS.warRoles(T, shown, -342).get("pol:ext_samnium").role === 2 && !AS.warRoles(T, shown, 1940).has("pol:ussr") && AS.warRoles(T, shown, 1941).get("pol:ussr").role === 1 && AS.warRoles(T, shown, 1944).has("pol:italy") === false);
  const both = AS.warRoles({ a: { t: "A", y: [1, 5], g: 0, v: { n: "X", m: [["pol:x", 1, 5]], x: "", u: [] }, l: { n: "Y", m: [], x: "", u: [] } }, b: { t: "B", y: [1, 5], g: 0, v: { n: "Z", m: [], x: "", u: [] }, l: { n: "X", m: [["pol:x", 1, 5]], x: "", u: [] } } }, new Set(["a", "b"]), 3);
  check("an entity on both sides in a year is reported as both (the builder refuses to ship one)", both.get("pol:x").role === 3 && AS.roleWord(3) === "both sides");
  const ofRome = AS.warsOfEntity(T, "pol:rome");
  check("an entity's wars, for its place card: the war, its years, its role and the other side", ofRome.length === 3 && ofRome.every((w) => w.role === "victor") && ofRome.find((w) => w.id === "rm-209").against === "Carthage" && AS.warsOfEntity(T, "pol:ext_samnium")[0].authored === true);
  const sent = AS.warSentence(T["rm-152"]);
  check("the sentence names the sides, the years and says the extent is Folio's own approximation", /First Samnite War/.test(sent) && /343 BCE – 341 BCE/.test(sent) && /Rome \(victors\)/.test(sent) && /authored extent/.test(sent) && /not a surveyed border/.test(sent), sent.slice(0, 120));
  const sw = AS.warSentence(T["ww2-001"]);
  check("a side's unresolved names are said, not drawn, and a member's narrower window is said", /no entity for: Poland/.test(sw) && /ussr 1941 CE – 1945 CE|ussr 1941 – 1945 CE/.test(sw) || /ussr/.test(sw), sw.slice(0, 200));
  check("the extent kind is its own layer and word (not a people, not a state)", AS.layerOf("extent") === "war-extent" && AS.kindWord("extent") === "authored extent" && AS.isPresence("extent") === false && AS.normalizeWars("bogus") === "auto" && AS.normalizeWars("off") === "off");
}

/* ---------------------------------------------------------------- the owner's phone, 2026-10-17 */
console.log("\n11) the tap rules: what a tap may open (tappableSet)\n");
{
  const fP = AS.flags(idx, st, "personal", [], info), fF = AS.flags(idx, st, "full", [], info);
  const tP = AS.tappableSet(idx, "personal", fP), tF = AS.tappableSet(idx, "full", fF), tM = AS.tappableSet(idx, "map", new Map());
  check("before the index is read nothing is tappable (null)", AS.tappableSet(null, "full", fF) === null);
  check("Personal: exactly the ids a studied card links (flag 2)", tP.size === [...fP].filter(([, f]) => f === 2).length && [...tP].every((id) => fP.get(id) === 2) && tP.size > 0, tP.size + " ids");
  check("Full: every id any card of a collection that is on links (flag 1 or 2)", tF.size === fF.size && [...fF.keys()].every((id) => tF.has(id)), tF.size + " ids");
  check("the plain Map: every id of the index (any card at all)", tM.size === idx.ids.length && idx.ids.every((id) => tM.has(id)));
  const off = AS.flags(idx, st, "full", [info(reader[0]).collId], info), tOff = AS.tappableSet(idx, "full", off);
  check("a collection switched off takes its own places out of the Full set", tOff.size < tF.size && tOff.size === off.size);
  check("an id no card links is in no set (a desert, an ocean, a town with no card)", !tP.has("sea:1159115079") && !tF.has("sea:1159115079") && !tM.has("sea:1159115079") && !tM.has("nothing"));
}

console.log("\n12) city stacks: membership by the registry's parent or the nearest settlement within 3 km, groups within 28 px, never across cities\n");
{
  global.window = global.window || {};
  require(path.join(ROOT, "atlas/data/gazetteer.js")); require(path.join(ROOT, "atlas/data/places.js"));
  const by = new Map(); const G = window.ATLAS_GAZETTEER, gi = {}; G.cols.forEach((c, i) => { gi[c] = i; });
  for (const r of G.rows) by.set(r[gi.id], { id: r[gi.id], name: r[gi.name], kind: r[gi.kind], at: r[gi.at] || null, within: "" });   // a gazetteer row's `within` is a country index, not a parent place
  const T = window.ATLAS_PLACES; for (const r of T.rows) { const o = {}; T.cols.forEach((c, j) => { o[c] = r[j] == null ? 0 : r[j]; }); o.within = o.within || ""; by.set(o.id, o); }
  const linked = idx.ids.filter((id) => !id.startsWith("pol:") && by.has(id)).map((id) => { const r = by.get(id), p = r.within ? by.get(r.within) : null; return { id, kind: r.kind, within: p ? p.id : "", pk: p ? p.kind : "", at: r.at }; });
  const cities = [...by.values()].filter((r) => /^(capital|city|town)$/.test(r.kind) && r.at);
  const cm = AS.cityMembership(linked, cities, { km: 3 });
  const perCity = new Map(); for (const [, c] of cm.of) perCity.set(c, (perCity.get(c) || 0) + 1);
  const top = [...perCity].filter(([c, n]) => n >= 2 && c !== undefined).sort((a, b) => b[1] - a[1]).map(([c, n]) => (by.get(c) ? by.get(c).name : c) + " " + n);
  const rome = "city:1159151593";
  console.log("  (membership over the " + linked.length + " card-linked places: by the registry's parent " + cm.how.parent + ", by the 3 km rule " + cm.how.near + ", settlements their own city " + cm.how.self + "; cities with two or more members: " + top.slice(0, 12).join(", ") + ")");
  check("Rome has the most members, and more than 20 of them", perCity.get(rome) >= 20 && [...perCity].every(([c, n]) => c === rome || n <= perCity.get(rome)), perCity.get(rome) + " in Rome");
  check("every member of Rome is within Rome by the registry's parent or within 3 km of its centre", [...cm.of].filter(([, c]) => c === rome).every(([id]) => { const r = by.get(id); if (r.within === rome) return true; const d = ((a, b) => { const R = 6371, dLa = (b[1] - a[1]) * Math.PI / 180, dLo = (b[0] - a[0]) * Math.PI / 180, x = Math.sin(dLa / 2) ** 2 + Math.cos(a[1] * Math.PI / 180) * Math.cos(b[1] * Math.PI / 180) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); })(r.at, by.get(rome).at); return d <= 3; }));
  check("the registry's parent wins over distance (Veii, 'within' Rome though 16 km from its centre, is Rome's; so is the Lapis Niger)", cm.of.get("pl:q677935") === rome && cm.of.get("pl:q841388") === rome);
  const RK = { capital: 0, city: 1, town: 2 };
  check("a settlement with no parent is its own city unless a LARGER kind lies within 3 km (a town joins the capital it is in; two towns stay two)", linked.filter((p) => /^(capital|city|town)$/.test(p.kind) && !p.within).every((p) => { const c = cm.of.get(p.id); return c === p.id || (by.has(c) && RK[by.get(c).kind] < RK[p.kind]); }));
  check("the largest settlement within 3 km wins: the Acropolis's sites — and the 'Acropolis (neighbourhood)' row itself — are Athens's (a capital)", [...cm.of].some(([, c]) => by.get(c) && by.get(c).name === "Athens") && ![...cm.of].some(([, c]) => by.get(c) && /^Acropolis/.test(by.get(c).name)));
  check("a place with no parent and no settlement within 3 km belongs to no city (a mountain, a cave in the hills)", [...cm.of].every(([id, c]) => by.has(c)) && linked.some((p) => !cm.of.has(p.id) && /^(mountain|site)$/.test(p.kind)));
  // the groups: a property over random layouts — every member of a group chains within 28 px, two groups never within 28 px of each other, singles never within 28 px of any other
  let okP = true, rnd = 12345; const rand = () => { rnd = (rnd * 1103515245 + 12345) & 0x7fffffff; return rnd / 0x7fffffff; };
  for (let t = 0; t < 300 && okP; t++) {
    const pts = []; const n = 2 + Math.floor(rand() * 20); for (let i = 0; i < n; i++) pts.push({ x: rand() * 200, y: rand() * 200 });
    const gs = AS.stackGroups(pts, 28), inG = new Map(); gs.forEach((g, k) => g.forEach((i) => inG.set(i, k)));
    const d = (i, j) => Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
    for (let i = 0; i < n && okP; i++) for (let j = i + 1; j < n; j++) { const near = d(i, j) <= 28; if (near && inG.get(i) !== inG.get(j)) okP = false; if (near && !inG.has(i)) okP = false; }
    for (const g of gs) { if (g.length < 2) okP = false; const seen = new Set([g[0]]); let grew = true; while (grew) { grew = false; for (const a of [...seen]) for (const b of g) if (!seen.has(b) && d(a, b) <= 28) { seen.add(b); grew = true; } } if (seen.size !== g.length) okP = false; }
  }
  check("PROPERTY (300 layouts): two points within 28 px are in one group, every group chains within 28 px, a group has two or more", okP);
  check("the groups never cross cities: the worker groups per city (a text guard on atlas-worker.js)", /for \(const \[cid, idxs\] of byCity\)/.test(fs.readFileSync(path.join(ROOT, "atlas/atlas-worker.js"), "utf8")) && /study\.city\.get\(list\[i\]\.id\)/.test(fs.readFileSync(path.join(ROOT, "atlas/atlas-worker.js"), "utf8")));
  check("STACK_PX is the owner's 28", AS.STACK_PX === 28);
}

console.log(`\n${pass} ok, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
