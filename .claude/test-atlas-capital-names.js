/* test-atlas-capital-names.js — a capital's stack (Rome, the Vatican, Athens) may put its own name right, left, above or below its square at ANY zoom (Atlas v2, 2026-10-19, decision c).

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-capital-names.js
     FOLIO_CHROMIUM=/path/to/chrome

   THE RULE. Every other mark's name stands directly RIGHT or LEFT of its mark, vertically centred, 3 px from its edge — above or below only at the zoom cap (decision c of 2026-10-18; test-atlas-overlaps.js). A capital's stack (the
   capital's SQUARE with its count) tries RIGHT, LEFT, ABOVE, then BELOW at every zoom, centred on the square, 3 px off it, never over another mark, a name or a control (the worker's study pass: `capStack`); when none is clear
   it moves by at most 12 px, as before, and tries the four again. The overlap and no-name-over-a-mark invariants are unchanged.

   WHAT IT PROVES, for a seeded reader (Roman, Greek, Levantine and Japanese cards) on a 390 x 844 phone in the Full Atlas, in the light theme and in folio's night:
     1  WHERE THE RULE MATTERS — four views at which a capital stack had a mark on both its sides and so NO NAME AT ALL before 2026-10-19, and has one now, above or below its square: Rome at 0.4 and 0.35 km/px, Vatican City at
        0.7 km/px (all in 2026 and 18 CE) and Athens at 0.7 km/px (2026 and 450 BCE);
     2  ATHENS at 0.6 km/px (2026 and 450 BCE) is named, as before;
     3  EVERY capital stack's drawn name, at all the views above and at 0.3 and 0.15 km/px, stands on one of the four sides: centred on the square on its axis (within 0.75 px), 3 px (± 0.75) off its edge, over no mark of
        the layer and no other drawn name; and Rome and Vatican City are both named at 0.3 and 0.15 km/px;
     4  ROME AND THE VATICAN at 0.6 km/px (2026 and 18 CE) — the owner's phone — are NOT named, and the test says why rather than pretending: the four centred places of EACH stack have a mark on them (Gabii, Collatia, Alba Longa,
        Aqua Marcia, Ostia Antica, Portus, the other stack's square: every mark's ground is taken before any name is laid, and a name never covers a mark), and the ring has no move of 12 px that frees one. The test asserts that this
        is what the worker's own drop reason says (all four tries met a mark, or a name) and that nothing was drawn over a mark. Naming them would need a rule the owner has not made (a name farther from its square or slid along
        it, on two lines, or a mark that yields): docs/atlas-v2-design.md §7 "Names", "Capital stack names".
   Re-run after touching the capital stack branch of the study pass (atlas-worker.js: `capStack`, `NAME_NUDGE_PX`), `nudgeStacks` or the stack's size (`squareHalf`). */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");
const { loadCards } = require("./card-io.js");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream" };
const PORT = 5675;
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  — " + extra : "")); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const { cards } = loadCards();
const READER = cards.filter((c) => /^(rm|gr|jp|wh)-/.test(c.id) && Array.isArray(c.places) && c.places.length).slice(0, 160).map((c) => c.id);
const seed = (ids) => `try { if (!localStorage.getItem("folio_v1_seeded")) { localStorage.setItem("folio_v1", JSON.stringify({ cards: Object.fromEntries(${JSON.stringify(ids)}.map((id, i) => [id, { due: i % 3 === 0 ? Date.now() - 9e5 : Date.now() + 9e8, ivl: 9, ease: 2.5, status: "review", reps: 2, first: "2026-08-01" }])), settings: { newPerDay: 5 } })); localStorage.setItem("folio_v1_seeded", "1"); } } catch (e) {}`;
const A = (page, fn, arg) => page.evaluate(`(() => { const c = document.querySelector(".atlas2").__atlas2; return (${fn.toString()})(c, ${JSON.stringify(arg === undefined ? null : arg)}); })()`);
const ROME = [12.4964, 41.9028], ATHENS = [23.7275, 37.9838];
const errors = [];

async function open(browser, theme) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await ctx.addInitScript(seed(READER));
  await ctx.addInitScript(`localStorage.setItem("folio_tour_v1","1");localStorage.setItem("folio_atlas_tour_v1","1");`);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  await page.goto(`http://127.0.0.1:${PORT}/#map`, { waitUntil: "load" });
  await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 120000 });
  if (theme === "dark") { await page.evaluate(() => document.body.classList.add("night")); await sleep(300); }
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.waterSettled() && c.labelsReady() && c.study.ready(); }, null, { timeout: 120000 });
  await A(page, (c) => { c.labelDebug(true); c.study.setMode("full"); c.ensureHistory(); });
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.historyStarted() && c.historyReady(); }, null, { timeout: 180000 });
  return { ctx, page };
}
const layout = async (page) => { await A(page, (c) => c.layoutNow()); await sleep(250); };
async function viewAt(page, [lon, lat], k, year) {
  await A(page, (c, y) => c.setYear(y), year);
  await A(page, (c, v) => c.setView(v[0], v[1], v[2]), [lon, lat, k]);
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.tilesSettled() && c.waterSettled() && c.historySettled(); }, null, { timeout: 120000 }).catch(() => {});
  await layout(page); await sleep(900); await layout(page);
  await page.evaluate(() => document.querySelector(".atlas2").__atlas2.invalidate()); await sleep(500);
}
/* the capital stacks of the view with their drawn names (boxes in CSS px as drawn), every other mark of the layer and every other drawn name, and the worker's drop reasons */
const read = (page) => A(page, (c) => {
  const marks = c.study.liveMarks().map((m) => ({ id: m.id, name: m.name || m.id, x: m.x, y: m.y, h: m.h, stack: !!m.members, cap: !!(m.members && (m.cap || m.shape === "square")), count: m.count }));
  const dots = c.labelsLive().filter((e) => e.p.marker).map((e) => ({ id: e.p.id, name: e.p.text, x: e.p.marker[0] + e.dx, y: e.p.marker[1] + e.dy, h: e.p.marker[2] }));
  const names = c.labelsLive().map((e) => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const r of (e.p.rects || []).slice(0, e.p.marker ? -1 : undefined)) { x0 = Math.min(x0, r[0] + e.dx); y0 = Math.min(y0, r[1] + e.dy); x1 = Math.max(x1, r[2] + e.dx); y1 = Math.max(y1, r[3] + e.dy); } return { id: e.p.id, text: e.p.text, box: [x0, y0, x1, y1], rects: (e.p.rects || []).slice(0, e.p.marker ? -1 : undefined).map((r) => [r[0] + e.dx, r[1] + e.dy, r[2] + e.dx, r[3] + e.dy]) }; }).filter((n) => n.box[0] < 1e8);
  return { marks, dots, names, why: c.labelWhy() || [] };
});
const inter = (r, b) => Math.max(0, Math.min(r[2], b[2]) - Math.max(r[0], b[0])) * Math.max(0, Math.min(r[3], b[3]) - Math.max(r[1], b[1]));
const EPS = 0.25, shrink = (r) => [r[0] + EPS, r[1] + EPS, r[2] - EPS, r[3] - EPS];
/* which of the four sides a name stands on, centred on the square's axis and 3 px (± 0.75) off its edge, or null */
function sideOf(box, m) {
  const cx = (box[0] + box[2]) / 2 - m.x, cy = (box[1] + box[3]) / 2 - m.y, gR = box[0] - (m.x + m.h), gL = (m.x - m.h) - box[2], gA = (m.y - m.h) - box[3], gB = box[1] - (m.y + m.h), G = 3, T = 0.75;
  return Math.abs(cy) <= T && Math.abs(gR - G) <= T ? "right" : Math.abs(cy) <= T && Math.abs(gL - G) <= T ? "left" : Math.abs(cx) <= T && Math.abs(gA - G) <= T ? "above" : Math.abs(cx) <= T && Math.abs(gB - G) <= T ? "below" : null;
}
const yr = (y) => (y < 0 ? -y + " BCE" : y + " CE");
const stackNamed = (d, city) => { const m = d.marks.find((q) => q.cap && q.name === city); if (!m) return { m: null }; const n = d.names.find((q) => q.id === m.id); return { m, n }; };
/* the judgement every drawn capital-stack name must pass: on one of the four sides, over no mark and no other name */
function judge(d, label, sides) {
  for (const m of d.marks.filter((q) => q.cap)) {
    const n = d.names.find((q) => q.id === m.id); if (!n) continue;
    const side = sideOf(n.box, m);
    const marks = d.marks.concat(d.dots).filter((o) => o.id !== m.id).map((o) => ({ name: o.name, box: [o.x - o.h, o.y - o.h, o.x + o.h, o.y + o.h] }));
    const overMark = marks.filter((o) => n.rects.some((r) => inter(shrink(r), shrink(o.box)) > 0)).map((o) => o.name);
    const overName = d.names.filter((o) => o.id !== m.id && n.rects.some((r) => o.rects.some((s) => inter(shrink(r), shrink(s)) > 0))).map((o) => o.text);
    if (side) sides[side] = (sides[side] || 0) + 1;
    check(`${label}: ${m.name}'s name stands ${side || "NOWHERE LAWFUL"} of its square, over no mark and no other name`, !!side && !overMark.length && !overName.length, side ? [overMark.length ? "over mark " + overMark.join(", ") : "", overName.length ? "over name " + overName.join(", ") : ""].filter(Boolean).join("; ") : `box ${n.box.map((v) => v.toFixed(1)).join(" ")} against square ${m.h * 2} px at ${m.x.toFixed(1)},${m.y.toFixed(1)}`);
  }
}

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch(LAUNCH);
  const sides = {};
  for (const theme of ["light", "dark"]) {
    console.log(`\n\x1b[1m${theme === "dark" ? "folio's night" : "the light theme"}\x1b[0m\n`);
    const { ctx, page } = await open(browser, theme);
    const at = async (city, ll, k, year) => { await viewAt(page, ll, k, year); return read(page); };
    console.log("  1  where the rule matters");
    for (const [city, ll, k, year] of [["Rome", ROME, 0.4, 2026], ["Rome", ROME, 0.4, 18], ["Rome", ROME, 0.35, 2026], ["Rome", ROME, 0.35, 18], ["Vatican City", ROME, 0.7, 2026], ["Vatican City", ROME, 0.7, 18], ["Athens", ATHENS, 0.7, 2026], ["Athens", ATHENS, 0.7, -450]]) {
      const d = await at(city, ll, k, year), r = stackNamed(d, city), label = `${city} ${yr(year)} at ${k} km/px`;
      check(`${label}: ${city}'s capital stack is drawn and NAMED`, !!r.m && !!r.n, r.m ? `${r.m.count} places; ${r.n ? "name at " + r.n.box.map((v) => v.toFixed(0)).join(" ") : "unnamed: " + d.why.filter((w) => w.startsWith(city + ":")).join(" | ").slice(0, 200)}` : "no stack");
      judge(d, label, sides);
    }
    console.log("\n  2  Athens at 0.6 km/px, as before");
    for (const year of [2026, -450]) {
      const d = await at("Athens", ATHENS, 0.6, year), r = stackNamed(d, "Athens"), label = `Athens ${yr(year)} at 0.6 km/px`;
      check(`${label}: the capital stack is NAMED`, !!r.m && !!r.n);
      judge(d, label, sides);
    }
    console.log("\n  3  Rome and the Vatican at 0.3 and 0.15 km/px");
    for (const k of [0.3, 0.15]) for (const year of [2026, 18]) {
      const d = await at("Rome", ROME, k, year), label = `Rome ${yr(year)} at ${k} km/px`;
      check(`${label}: Rome and Vatican City are both NAMED`, ["Rome", "Vatican City"].every((c) => { const r = stackNamed(d, c); return !!r.m && !!r.n; }), ["Rome", "Vatican City"].map((c) => { const r = stackNamed(d, c); return c + (r.n ? " named" : r.m ? " unnamed" : " no stack"); }).join(", "));
      judge(d, label, sides);
    }
    console.log("\n  4  Rome and the Vatican at 0.6 km/px: what the layout does");
    for (const year of [2026, 18]) {
      const d = await at("Rome", ROME, 0.6, year), label = `Rome ${yr(year)} at 0.6 km/px`;
      for (const city of ["Rome", "Vatican City"]) {
        const r = stackNamed(d, city); if (!r.m) { check(`${label}: ${city}'s stack is drawn`, false); continue; }
        if (r.n) { check(`${label}: ${city} is named`, true); continue; }
        const why = d.why.find((w) => w.startsWith(city + ": study name finds no free side")), mt = why && /\((\d+) tries: (\d+) left the frame, (\d+) met a name or a control, (\d+) met a mark/.exec(why);
        check(`${label}: ${city} is unnamed because all four sides met a mark (the worker's own reason)`, !!mt && mt[1] === "4" && Number(mt[2]) + Number(mt[3]) + Number(mt[4]) === 4 && Number(mt[4]) >= 3, why ? why.slice(why.indexOf("(")) : "no drop reason");
      }
      judge(d, label, sides);
    }
    await ctx.close();
  }
  console.log(`\n  the sides the capital stacks' names stood on, over every view and both themes: ${JSON.stringify(sides)}`);
  check("at least one capital stack's name stood above or below its square (the rule was exercised)", (sides.above || 0) + (sides.below || 0) > 0, JSON.stringify(sides));
  check("no console or page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  await browser.close(); server.close();
  console.log(`\n${pass} ok, ${fail} failed\n`); process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
