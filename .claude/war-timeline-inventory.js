#!/usr/bin/env node
/* war-timeline-inventory.js — WHICH WAR WINDOWS GET A TIMELINE (2026-10-19; docs/atlas-v2-card-windows.md "The war window's timeline").

     node .claude/war-timeline-inventory.js [--json]       (from the repo root; reads atlas/data/wars.js and atlas/data/history.bin, nothing else)

   For every war of atlas/data/wars.js: how many DATED STEPS its picture has, whether those dates carry months, and so whether its window shows a timeline (two or more steps) or not.
     · a war that owns the front line (the front entities' `cards` in history.bin: the Second World War's) has the front's PLATE DATES as steps — YYYYMMDD, so each carries a month;
     · every other war has its CHANGE YEARS as steps: the years of the war in which the faces of its two sides differ from the year before (a member counts inside its own window, the authored extent in the
       war's years), a year in which no side has a face being no step. Cliopatria dates a state's steps to the year, so these carry no month.
   `atlas/atlas.js` `warTimeline` is the same rule run on the loaded history; test-war-timeline.js proves the browser's steps equal this script's for the wars it opens. Also `require`d by that test. */
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "..");
const F = require("./atlas-build/lib/format.js");

function inventory() {
  const sandbox = { window: {} }; new Function("window", fs.readFileSync(path.join(ROOT, "atlas/data/wars.js"), "utf8"))(sandbox.window);
  const W = sandbox.window.ATLAS_WARS.wars;
  const R = F.read(new Uint8Array(fs.readFileSync(path.join(ROOT, "atlas/data/history.bin")))), H = R.header;
  const idx = new Map(H.entities.map((e, i) => [e.id, i]));
  const steps = new Map(); for (const s of H.steps) { let l = steps.get(s[0]); if (!l) steps.set(s[0], l = []); l.push(s); }
  const frontCards = new Set(); for (const e of H.entities) if (e.kind === "front") for (const c of e.cards || []) frontCards.add(c);
  const plateDates = [...new Set((H.fronts.plates || []).map((p) => Number(String(p.date).replace(/-/g, ""))))].sort((a, b) => a - b);
  const rows = [];
  for (const [id, w] of Object.entries(W)) {
    const members = [];
    for (const k of ["v", "l"]) { for (const m of w[k].m || []) members.push(m); if (w[k].x) members.push([w[k].x, w.y[0], w.y[1]]); }
    const of = members.map((m) => steps.get(idx.get(m[0])) || []);
    const inWar = (y) => y >= w.y[0] && y <= w.y[1];
    const ys = new Set([w.y[0]]);
    members.forEach(([, a, b], i) => { for (const y of [a, b + 1]) if (inWar(y)) ys.add(y); for (const t of of[i]) for (const y of [t[1], t[2] + 1]) if (inWar(y)) ys.add(y); });
    const sig = (y) => members.map(([, a, b], i) => { if (y < a || y > b) return "-"; const t = of[i].find((q) => q[1] <= y && y <= q[2]); return t ? String(t[3]) : "."; }).join(",");
    const years = []; let prev = null;
    for (const y of [...ys].sort((p, q) => p - q)) { const g = sig(y); if (g === prev) continue; prev = g; if (/\d/.test(g)) years.push(y); }
    const front = frontCards.has(id) && plateDates.length > 0;
    const stepList = front ? plateDates : years;
    rows.push({ id, title: w.t, y: w.y, steps: stepList.length, months: front, front, timeline: stepList.length >= 2, first: stepList[0], last: stepList[stepList.length - 1], extentOnly: members.length > 0 && members.every((m) => /^pol:ext_/.test(m[0])), list: stepList });
  }
  return { rows, frontCards: [...frontCards].sort(), plateDates };
}
module.exports = { inventory };

if (require.main === module) {
  const { rows, frontCards } = inventory();
  if (process.argv.includes("--json")) { console.log(JSON.stringify(rows.map((r) => Object.assign({}, r, { list: undefined })), null, 1)); process.exit(0); }
  const pad = (v, n) => String(v).padEnd(n);
  console.log(pad("war", 9) + pad("steps", 7) + pad("dates", 7) + pad("timeline", 9) + pad("years", 15) + "title");
  for (const r of rows) console.log(pad(r.id, 9) + pad(r.steps, 7) + pad(r.months ? "month" : "year", 7) + pad(r.timeline ? "YES" : "no", 9) + pad(r.y.join(".."), 15) + r.title + (r.timeline ? "" : r.extentOnly ? "  (one static extent)" : "  (the picture never changes in the war's years)"));
  const yes = rows.filter((r) => r.timeline);
  console.log(`\n${rows.length} wars: ${yes.length} get a timeline (${yes.filter((r) => r.months).length} with months: ${frontCards.join(", ")}; ${yes.filter((r) => !r.months).length} by year), ${rows.length - yes.length} do not.`);
}
