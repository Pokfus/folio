/* test-atlas-overlaps.js — no two drawn names overlap on the Atlas, no name covers a mark that is not its own, every mark's name stands directly right or
   left of its mark, and every city stack's ring or square is named or lawfully unnamed (Atlas v2, 2026-10-17 and 2026-10-18; the owner's phone over Rome).

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-overlaps.js [shotsDir]
     FOLIO_CHROMIUM=/path/to/chrome  … to pick the browser (otherwise playwright's own)

   WHAT IT PROVES, for a seeded reader (Roman, Greek, Levantine and Japanese cards) in the Full Atlas of 2025, in the light theme and in folio's
   night, on a 390 × 844 phone and a 1280 × 800 desktop, at the views where the owner saw the fault — Rome at 1.2, 0.6 and 0.3 km/px,
   Naples and Vesuvius at 0.6, Athens, Jerusalem and Kyoto at 1.2 and 0.6 (decision c):
     · no two DRAWN names' boxes intersect, whatever pass placed them — a polity's or a country's spaced capitals, a study name, a city's,
       a physical name (the boxes are the layout's own rectangles, moved as the page moves them: `labelsLive`);
     · no name's box intersects a mark that is not its own — the study layer's marks as drawn (`liveMarks`) and the ordinary city dots;
     · A MARK'S NAME STANDS DIRECTLY RIGHT OR LEFT OF ITS MARK (2026-10-18, decision c — the owner: "when icons are clustered, their text labels drift and it
       becomes impossible to tell which text belongs to which icon"): every drawn name of a drawn mark (a place's, a city stack's, a capital's) is vertically
       centred on it, 3 px from its edge, on the right or the left — and only at the ZOOM CAP (Rome at 0.15 km/px) — or, for a capital's stack, at any zoom (2026-10-19) — may it stand above or below instead; there
       is no other place for it, so a mark whose two sides are taken has no name (the worker's drop reason says what each of its 2 — or 4 — tries met);
     · every city stack's ring (or a capital's square) that is drawn has its city's name drawn beside it ("Rome" beside the "41") — or, where its tries all
       met a name, a mark, a control or the frame, it stays unnamed rather than drift (before 2026-10-18 a ring had 64 tries and two last resorts);
     · a polity's or a country's name that is not a card-linked place ranks below the study names (decision b): in the layout's own placement order
       every unflagged one comes after the last study name, a card-linked one is laid by the study pass at its flag's turn, and the rings' names come
       first of all.
   It also prints, per view, how many names the layout placed and how many it dropped (the worker's own drop reasons, `labelWhy`), so the cost
   of the rule can be read.
   THE FAULT IT WAS WRITTEN FOR (2026-10-17, a 390 × 844 phone, the Full Atlas at lon 12.5, lat 41.9, 1.2 km/px): "VATICAN CITY" over "Collatia",
   "Ostia Antica" crossed by a mark, "Mount Vesuvius" over marks near Naples, and Rome's "41" ring with no name at all — the study pass's fallback
   let a mark's own name lie over any lesser mark, and the ordinary names kept their licence over a small dot. At 0.25 km/px the same area was clean.
   ASSERTIONS CHANGED ON 2026-10-18 (decision c, deliberately): "every ring is named or boxed in by marks and the frame alone" became "named, or every try
   met something" (a name may now block a ring's name, since only two boxes are tried); the new placement check above fails on the code before (names at the
   corners, slid along a side, 10 px out, on two lines); Rome at 0.15 km/px (the cap) joins the views.
   Re-run after touching the label layout of atlas-worker.js (the study pass, the ordinary pass, `free`, `take`), `nudgeStacks`, or the label painter. */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");
const { loadCards } = require("./card-io.js");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const SHOTS = process.argv[2] || "";
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream" };
const PORT = 5657;
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  — " + extra : "")); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* THE READER: the Roman, Greek, Levantine and Japanese cards that link a place — the reader's own marks are hard ground round Rome, Athens, Jerusalem and Kyoto */
const { cards } = loadCards();
const READER = cards.filter((c) => /^(rm|gr|jp|wh)-/.test(c.id) && Array.isArray(c.places) && c.places.length).slice(0, 160).map((c) => c.id);

/* THE VIEWS (decision c): where the owner saw the fault, and the three other crowded cities */
const VIEWS = [
  ["Rome", 12.5, 41.9, 1.2], ["Rome", 12.5, 41.9, 0.6], ["Rome", 12.5, 41.9, 0.3], ["Rome", 12.5, 41.9, 0.15],   // 0.15: the zoom cap, where a name may also stand above or below (decision c, 2026-10-18)
  ["Naples", 14.35, 40.84, 0.6],
  ["Athens", 23.7275, 37.9838, 1.2], ["Athens", 23.7275, 37.9838, 0.6],
  ["Jerusalem", 35.2137, 31.7683, 1.2], ["Jerusalem", 35.2137, 31.7683, 0.6],
  ["Kyoto", 135.7681, 35.0116, 1.2], ["Kyoto", 135.7681, 35.0116, 0.6],
];
const PROFILES = [["phone", 390, 844], ["desktop", 1280, 800]].filter((p) => !process.env.FOLIO_PROFILES || process.env.FOLIO_PROFILES.split(",").includes(p[0]));   // FOLIO_PROFILES=phone, FOLIO_THEMES=light, FOLIO_VIEWS=Rome: a subset while iterating (CI runs all)
const THEMES = ["light", "dark"].filter((t) => !process.env.FOLIO_THEMES || process.env.FOLIO_THEMES.split(",").includes(t));
const VIEWS_RUN = VIEWS.filter((v) => !process.env.FOLIO_VIEWS || new RegExp(process.env.FOLIO_VIEWS).test(v[0] + " " + v[3]));

const seed = (ids) => `try { if (!localStorage.getItem("folio_v1_seeded")) { localStorage.setItem("folio_v1", JSON.stringify({ cards: Object.fromEntries(${JSON.stringify(ids)}.map((id, i) => [id, { due: i % 3 === 0 ? Date.now() - 9e5 : Date.now() + 9e8, ivl: 9, ease: 2.5, status: "review", reps: 2, first: "2026-08-01" }])), settings: { newPerDay: 5 } })); localStorage.setItem("folio_v1_seeded", "1"); } } catch (e) {}`;
const A = (page, fn, arg) => page.evaluate(`(() => { const c = document.querySelector(".atlas2").__atlas2; return (${fn.toString()})(c, ${JSON.stringify(arg === undefined ? null : arg)}); })()`);
async function open(browser, ids, prof, theme) {
  const phone = prof[0] === "phone";
  const ctx = await browser.newContext(phone ? { viewport: { width: prof[1], height: prof[2] }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : { viewport: { width: prof[1], height: prof[2] } });
  await ctx.addInitScript(seed(ids));
  await ctx.addInitScript(`localStorage.setItem("folio_tour_v1","1");localStorage.setItem("folio_atlas_tour_v1","1");`);
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  await page.goto(`http://127.0.0.1:${PORT}/#map`, { waitUntil: "load" });
  await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 120000 });
  if (theme === "dark") { await page.evaluate(() => document.body.classList.add("night")); await sleep(300); }   // the theme observer re-reads the tokens
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.waterSettled() && c.labelsReady() && c.study.ready(); }, null, { timeout: 120000 });
  await A(page, (c) => { c.labelDebug(true); c.study.setMode("full"); }); await sleep(300);
  await A(page, (c) => c.setYear(2025));
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.year() >= 2000 || (c.historyOK && c.historyOK()); }, null, { timeout: 120000 });
  await settle(page);
  return { ctx, page, errors };
}
async function settle(page) { await page.evaluate(() => document.querySelector(".atlas2").__atlas2.layoutNow()); await sleep(200); }
async function view(page, lon, lat, k) {
  await page.evaluate(([a, b, c]) => document.querySelector(".atlas2").__atlas2.setView(a, b, c), [lon, lat, k]);
  await page.waitForFunction(() => document.querySelector(".atlas2").__atlas2.tilesSettled(), null, { timeout: 120000 });
  await settle(page); await settle(page);   // the second layout follows the first's level change, if any
}
/* what is DRAWN: every live name with its boxes moved as the painter moves them (the layout's rectangles plus the label's own dx, dy), the ordinary
   dots, the study layer's marks as drawn, and the layout's count of names placed and dropped */
const read = (page) => A(page, (c) => {
  const names = c.labelsLive().map((e) => ({ id: e.p.id, kind: e.p.kind, text: e.p.text, hist: !!e.p.hist, st: e.p.st || 0, stack: /^stk:/.test(e.p.id), rects: (e.p.rects || []).slice(0, e.p.marker ? -1 : undefined).map((q) => [q[0] + e.dx, q[1] + e.dy, q[2] + e.dx, q[3] + e.dy]), marker: e.p.marker ? [e.p.marker[0] + e.dx, e.p.marker[1] + e.dy, e.p.marker[2]] : null }));
  const marks = c.study.liveMarks().map((m) => ({ id: m.id, name: m.name || m.id, x: m.x, y: m.y, h: m.h, stack: !!m.members, cap: !!(m.members && (m.cap || m.shape === "square")), count: m.count }));
  const why = c.labelWhy() || [];
  const order = c.labels().map((p) => ({ id: p.id, text: p.text, study: !!p.study, stack: /^stk:/.test(p.id), st: p.st || 0, polity: !!p.hist || p.kind === "country" || p.kind === "admin1" }));   // the layout's own placement order
  return { names, marks, placed: order.length, dropped: why.length, why, order };
});
const inter = (r, b) => Math.max(0, Math.min(r[2], b[2]) - Math.max(r[0], b[0])) * Math.max(0, Math.min(r[3], b[3]) - Math.max(r[1], b[1]));
const EPS = 0.25;   // a quarter pixel each way: float noise, never a real overlap
const shrink = (r) => [r[0] + EPS, r[1] + EPS, r[2] - EPS, r[3] - EPS];
function judge(d, atCap) {
  const nameBad = [], markBad = [], unnamed = [], sideBad = [], sides = { right: 0, left: 0, above: 0, below: 0 };
  for (let i = 0; i < d.names.length; i++) for (let j = i + 1; j < d.names.length; j++) {
    const a = d.names[i], b = d.names[j]; if (a.id === b.id) continue;   // one river's name on two stretches
    let over = 0; for (const r of a.rects) for (const s of b.rects) over += inter(shrink(r), shrink(s));
    if (over > 0) nameBad.push({ a: a.text + " [" + a.kind + (a.hist ? ", polity" : "") + (a.st ? ", study" : "") + "]", b: b.text + " [" + b.kind + (b.hist ? ", polity" : "") + (b.st ? ", study" : "") + "]", px2: Math.round(over) });
  }
  const dots = d.marks.map((m) => ({ id: m.id, name: m.name, box: [m.x - m.h, m.y - m.h, m.x + m.h, m.y + m.h] })).concat(d.names.filter((p) => p.marker).map((p) => ({ id: p.id, name: p.text, box: [p.marker[0] - p.marker[2], p.marker[1] - p.marker[2], p.marker[0] + p.marker[2], p.marker[1] + p.marker[2]] })));
  for (const p of d.names) for (const m of dots) {
    if (m.id === p.id) continue;   // its own mark (a stack's name is the ring's)
    let over = 0; for (const r of p.rects) over += inter(shrink(r), shrink(m.box));
    if (over > 0) markBad.push({ name: p.text + " [" + p.kind + (p.hist ? ", polity" : "") + (p.st ? ", study" : "") + "]", mark: m.name, px2: Math.round(over) });
  }
  /* THE PLACEMENT (decision c, 2026-10-18): a drawn name of a drawn mark is vertically centred on the mark (its box's middle within 0.75 px of the mark's
     centre) and stands 3 px (± 0.75) from the mark's edge on the right or the left; at the zoom cap — and, for a CAPITAL's stack, at any zoom (2026-10-19) — it may instead be centred above or below at the same gap.
     The boxes are the DRAWN ones (moved as the painter moves them) against the DRAWN marks (a nudged ring at its nudged point). */
  const byId = new Map(d.marks.map((m) => [m.id, m]));
  for (const p of d.names) {
    const m = byId.get(p.id); if (!m || !p.rects.length) continue;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity; for (const r of p.rects) { x0 = Math.min(x0, r[0]); y0 = Math.min(y0, r[1]); x1 = Math.max(x1, r[2]); y1 = Math.max(y1, r[3]); }
    const cy = (y0 + y1) / 2 - m.y, cx = (x0 + x1) / 2 - m.x, gapR = x0 - (m.x + m.h), gapL = (m.x - m.h) - x1, gapA = (m.y - m.h) - y1, gapB = y0 - (m.y + m.h), G = 3, T = 0.75;
    const vert = atCap || m.cap;   // above or below: at the zoom cap for every mark, at any zoom for a capital's stack (decision c, 2026-10-19; test-atlas-capital-names.js)
    const side = Math.abs(cy) <= T && Math.abs(gapR - G) <= T ? "right" : Math.abs(cy) <= T && Math.abs(gapL - G) <= T ? "left" : vert && Math.abs(cx) <= T && Math.abs(gapA - G) <= T ? "above" : vert && Math.abs(cx) <= T && Math.abs(gapB - G) <= T ? "below" : null;
    if (side) sides[side]++; else sideBad.push(`"${p.text}" [${p.kind}${p.stack ? ", stack" : ""}] mark ${m.h.toFixed(1)} px at ${m.x.toFixed(1)},${m.y.toFixed(1)}, box ${[x0, y0, x1, y1].map((v) => v.toFixed(1)).join(" ")}: dy ${cy.toFixed(1)}, gaps R ${gapR.toFixed(1)} L ${gapL.toFixed(1)} A ${gapA.toFixed(1)} B ${gapB.toFixed(1)}`);
  }
  /* an unnamed ring (or a capital's square) is lawful when the worker's own drop reason says every one of its tries — two, or four at the cap — met a name, a
     control, a mark or the frame (decision c: a mark's name stands right or left or not at all). A ring with no drop reason, or whose tries were not all met, fails. */
  const lawful = [];
  for (const m of d.marks) if (m.stack && !d.names.some((p) => p.id === m.id)) {
    const w = d.why.find((x) => x.startsWith(m.name + ": study name finds no free side")), mt = w && /\((\d+) tries: (\d+) left the frame, (\d+) met a name or a control, (\d+) met a mark/.exec(w);
    const tries = mt ? Number(mt[1]) : 0, met = mt ? Number(mt[2]) + Number(mt[3]) + Number(mt[4]) : 0;
    if (mt && tries >= 2 && tries <= 4 && met >= tries) lawful.push(m.name + " (" + m.count + "): " + mt[1] + " tries, " + mt[2] + " left the frame, " + mt[3] + " met a name or a control, " + mt[4] + " met a mark"); else unnamed.push(m.name + " (" + m.count + ")" + (w ? " — " + w.slice(w.indexOf("(")) : " — no drop reason"));
  }
  /* decision b: a polity's or a country's name that is NOT a card-linked place ranks below the study names — in the layout's placement order every unflagged
     one comes after the last study name; a card-linked one is laid by the study pass itself (study: true); and the city rings' names come before every other
     study name (decision a) */
  const lastStudy = d.order.reduce((k, p, i) => (p.study ? i : k), -1), firstPolity = d.order.findIndex((p) => p.polity && !p.st), firstPlain = d.order.findIndex((p) => p.study && !p.stack);
  const orderBad = [];
  if (firstPolity >= 0 && firstPolity < lastStudy) orderBad.push(`"${d.order[firstPolity].text}" (a polity or country with no card) is laid before "${d.order[lastStudy].text}" (a study name)`);
  for (const p of d.order) if (p.polity && p.st && !p.study) orderBad.push(`"${p.text}" (a card-linked polity or country) was not laid by the study pass`);
  for (const p of d.order) if (p.stack && firstPlain >= 0 && d.order.indexOf(p) > firstPlain) orderBad.push(`the ring "${p.text}" is laid after "${d.order[firstPlain].text}"`);
  if (!d.order.some((p) => p.study) && d.marks.length) orderBad.push("no name is marked as the study pass's");
  return { nameBad, markBad, unnamed, lawful, orderBad, sideBad, sides };
}

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch(LAUNCH);
  const allErrors = [];
  const table = [];
  for (const prof of PROFILES) for (const theme of THEMES) {
    console.log(`\n\x1b[1m${prof[0]} ${prof[1]} × ${prof[2]}, ${theme}: the Full Atlas of 2025 at ${VIEWS_RUN.length} views\x1b[0m\n`);
    const { ctx, page, errors } = await open(browser, READER, prof, theme);
    for (const [name, lon, lat, k] of VIEWS_RUN) {
      await view(page, lon, lat, k);
      const d = await read(page), j = judge(d, k <= 0.15);
      const rings = d.marks.filter((m) => m.stack);
      table.push({ prof: prof[0], theme, view: `${name} ${k}`, placed: d.placed, drawn: d.names.length, dropped: d.dropped, rings: rings.length, nameBad: j.nameBad.length, markBad: j.markBad.length, unnamed: j.unnamed.length + j.lawful.length });
      const at = `${name} at ${k} km/px`;
      check(`${at}: no two drawn names overlap (${d.names.length} names drawn, ${d.placed} placed, ${d.dropped} dropped)`, j.nameBad.length === 0, j.nameBad.slice(0, 4).map((x) => `"${x.a}" × "${x.b}" ${x.px2} px²`).join("; ") + (j.nameBad.length > 4 ? ` … ${j.nameBad.length} pairs` : ""));
      check(`${at}: no name covers a mark that is not its own (${d.marks.length} marks drawn)`, j.markBad.length === 0, j.markBad.slice(0, 4).map((x) => `"${x.name}" over ${x.mark} ${x.px2} px²`).join("; ") + (j.markBad.length > 4 ? ` … ${j.markBad.length} pairs` : ""));
      const named = Object.values(j.sides).reduce((a, b) => a + b, 0);
      check(`${at}: every mark's name stands directly right or left of its mark, centred, 3 px off${k <= 0.15 ? " (or above or below: the zoom cap)" : ""} — ${named} named marks: ${j.sides.right} right, ${j.sides.left} left, ${j.sides.above} above, ${j.sides.below} below`, j.sideBad.length === 0 && (named > 0 || d.marks.length === 0), j.sideBad.slice(0, 3).join("; ") + (j.sideBad.length > 3 ? ` … ${j.sideBad.length} names` : ""));
      check(`${at}: every unflagged polity's and country's name is laid after the study names, a card-linked one by the study pass, and the rings' names first (${d.order.filter((p) => p.polity && !p.st).length} + ${d.order.filter((p) => p.polity && p.st).length} polity or country names, ${d.order.filter((p) => p.study).length} study names)`, j.orderBad.length === 0, j.orderBad.slice(0, 3).join("; "));
      if (rings.length) check(`${at}: every city stack's ring or square is named (${rings.map((m) => m.name + " " + m.count).join(", ")})${j.lawful.length ? " — but for the stack whose every try met something: " + j.lawful.join("; ") : ""}`, j.unnamed.length === 0, j.unnamed.join(", ") + " unnamed");
      if (SHOTS && prof[0] === "phone" && ((name === "Rome" && (k === 1.2 || k === 0.15)) || name === "Naples")) { fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, `${name.toLowerCase()}-${k}-${theme}.png`) }); }
    }
    allErrors.push(...errors); await ctx.close();
  }
  console.log("\n\x1b[1mNames placed and dropped per view (the worker's drop reasons), and the faults counted\x1b[0m\n");
  console.log("  profile  theme  view               placed  drawn  dropped  rings  name×name  name×mark  unnamed rings");
  for (const r of table) console.log(`  ${r.prof.padEnd(8)} ${r.theme.padEnd(6)} ${r.view.padEnd(18)} ${String(r.placed).padStart(6)}  ${String(r.drawn).padStart(5)}  ${String(r.dropped).padStart(7)}  ${String(r.rings).padStart(5)}  ${String(r.nameBad).padStart(9)}  ${String(r.markBad).padStart(9)}  ${String(r.unnamed).padStart(13)}`);
  check("no page errors", allErrors.length === 0, allErrors.slice(0, 3).join(" | "));
  await browser.close(); server.close();
  console.log(`\n${pass} ok, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
