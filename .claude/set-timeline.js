#!/usr/bin/env node
/* SET A CARD'S TIMELINE DATES (Oct 2026, on request: "a timeline section showing the card on a timeline
   next to the nearest four events (2 before, two after) in the same collection … Only events and periods
   should appear in timelines, such as wars, battles, or treaties, but never more abstract or general terms").

   The light field `timeline` on a card is the ONE switch for the whole feature: a card that carries it
   gets the Timeline section on its answer side AND is a candidate neighbour on every other card of its
   collection; a card without it is neither. Nothing is inferred from the date line — a card's rows
   describe many dated things (a treaty's signing and its coming into force, a war's two beginnings and
   its end) and no rule reads "a period" off them reliably, so the span is authored, from the card's own
   date line wherever it gives one.

     node .claude/set-timeline.js <id> at   <date>            a single event — a dash
     node .claude/set-timeline.js <id> from <date> to <date>  a period — a continuous bar
     node .claude/set-timeline.js <id> none                   remove the field (the card leaves every timeline)

   A date is YYYY, YYYY-MM or YYYY-MM-DD (a leading "-" for BCE: -0218); the precision is kept and drawn
   ("1925" ends at the end of 1925, "1923-11" at the end of November). Only a card whose kind — its first
   tag — is `event`, `era`, `battle` or `war` is accepted; `--force` overrides for a card whose kind is
   mis-tagged, and says so. Goes through card-io like every writer. */
"use strict";
const { loadCards, writeCards } = require("./card-io");
const KINDS = new Set(["event", "era", "battle", "war"]);
const DATE = /^-?\d{1,6}(-\d{2})?(-\d{2})?$/;
const args = process.argv.slice(2), force = args.includes("--force"), a = args.filter((x) => x !== "--force");
const [id, mode] = a;
const die = (m) => { console.error("set-timeline: " + m); process.exit(1); };
if (!id || !mode) die("usage: <id> at <date> | <id> from <date> to <date> | <id> none");
const { cards, tree } = loadCards();
const c = cards.find((x) => x.id === id);
if (!c) die("no card " + id);
const kind = (c.tags || [])[0] || "";
let field = null;
if (mode === "at") { if (!DATE.test(a[2] || "")) die("bad date " + a[2]); field = { at: a[2] }; }
else if (mode === "from") { if (a[3] !== "to" || !DATE.test(a[2] || "") || !DATE.test(a[4] || "")) die("usage: from <date> to <date>"); if (a[4] < a[2] && a[2][0] !== "-") die("ends before it starts"); field = { from: a[2], to: a[4] }; }
else if (mode !== "none") die("mode must be at, from or none");
if (field && !KINDS.has(kind)) { if (!force) die(id + " is a " + (kind || "card with no kind") + ", not an event, era, battle or war — not a timeline card (--force overrides)"); console.log("set-timeline: " + id + " is tagged " + kind + "; writing anyway (--force)"); }
if (field) c.timeline = field; else delete c.timeline;
writeCards(cards, tree);
console.log("set-timeline: " + id + " " + c.answerText + " → " + (field ? JSON.stringify(field) : "none"));
