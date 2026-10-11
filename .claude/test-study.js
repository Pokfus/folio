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
     · THE STACKS: no two marks drawn have centres within the stack radius, every point is in exactly one stack, the result does not
       depend on anything but the points, and a lone point is a mark of its own.

   Zero dependencies. Not part of the site. Re-run after touching atlas/study.js, atlas/data/card-places.js, the study block of
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
const v1 = /\(full \? CARDS\.map\(\(c\) => c\.id\) : (Object\.keys\(S\.cards \|\| \{\}\))\)\.forEach/.exec(app);
check("v1's atlasRegisterAll asks the same keys of the same object", !!v1 && host && host[1].startsWith(v1[1]), v1 ? v1[1] : "not found");
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

console.log("\n5) the stacks\n");
let seed = 12345; const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
const pts = Array.from({ length: 400 }, (_, i) => ({ id: "p" + i, x: rnd() * 800, y: rnd() * 600 }));
for (const R of [22, 30, 34]) {
  const g = AS.cluster(pts, R);
  const ids = g.flatMap((c) => c.ids);
  let minD = Infinity; for (let i = 0; i < g.length; i++) for (let j = i + 1; j < g.length; j++) minD = Math.min(minD, Math.hypot(g[i].x - g[j].x, g[i].y - g[j].y));
  check(`radius ${R}: every point is in exactly one stack`, ids.length === pts.length && new Set(ids).size === pts.length && g.every((c) => c.n === c.ids.length));
  check(`radius ${R}: no two marks have centres within ${R} px (nearest ${minD.toFixed(1)})`, minD > R);
}
check("the same points give the same stacks (nothing but the points decides)", JSON.stringify(AS.cluster(pts, 30)) === JSON.stringify(AS.cluster(pts.slice(), 30)));
check("a lone point is a mark of its own, at its own place", (() => { const g = AS.cluster([{ id: "a", x: 10, y: 20 }], 30); return g.length === 1 && g[0].n === 1 && g[0].x === 10 && g[0].y === 20; })());
check("two points 10 px apart are one stack of two at their middle", (() => { const g = AS.cluster([{ id: "a", x: 0, y: 0 }, { id: "b", x: 10, y: 0 }], 30); return g.length === 1 && g[0].n === 2 && g[0].x === 5; })());
check("the top of a stack is the first (most important) point given", AS.cluster([{ id: "top", x: 0, y: 0 }, { id: "low", x: 5, y: 5 }], 30)[0].ids[0] === "top");
console.log(`\n${pass} ok, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
