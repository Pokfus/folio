/* test-atlas-mark-outline.js — a mark's outline is the names' halo in BOTH themes: a dark glyph on a light halo by day, a light glyph on a dark halo at night
   (Atlas v2, 2026-10-18 b; the owner's phone: "in dark mode the marks have a dark outline; in day mode they should have a light outline, the same as their text labels").

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-atlas-mark-outline.js
     FOLIO_CHROMIUM=/path/to/chrome

   WHAT IT PROVES, for a seeded reader (Roman and Greek cards) in the Full Atlas on a 1280 x 800 window, in the light theme and in folio's night, over three grounds — plain land
   (2025, relief off), relief (2025, relief on) and the darker empty land (3000 BCE, where no state covers Latium) — at Rome, 1.5 km/px, read off the label canvas's own pixels
   (the marks) and the GL canvas's (the ground behind each mark, the labels hidden for the shot):
     1  THE COLOURS the page says: the outline is the labels' halo colour (`colours().halo`) and its width the labels' halo width (2.6 px by day, 3.2 at night); the fill is the red
        (`colours().mark`, the reader's own too, since 2026-10-25; the ink and the names' ochre before); by day the fill is DARKER than the outline, at night LIGHTER;
     2  THE PIXELS: from the ground inward along the row through a mark's centre — a lone mark's right edge, a city stack's square or ring — the row reads ground, then a run of the
        outline's colour about half the halo's width long, then the fill, on every mark whose strip is clear (>= 6 lone marks, >= 1 stack, the selected mark among them);
     3  THE CONTRAST, measured on the rendered pixels (WCAG's ratio): the fill against the ground behind it is at least 3:1 on plain land and on relief for every mark, in both themes;
        on the darker land the fill OR the outline reaches 3:1 (by day the dark ochre of the reader's own marks is 1.5:1 against land at half the luminance, where its light outline is 4.7:1);
        the fill against its outline is at least 3:1. The figures — minimum and median of fill/ground, outline/ground, fill/outline per ground and theme — are printed.
   ASSERTIONS THAT ENCODED THE OLD LIGHT MARK, changed on purpose (the old code's marks by day were a paper fill with a thin ink outline, the reader's own the accent): test-atlas-dark-labels.js
   §3 ("a mark is the paper filled with the ink outline ... as before"), which now asserts this suite's day colours; its §2 (the dark theme) is unchanged.
   Re-run after touching `paintMark`, `drawMarker`, `markSprite`, `countInk` or `labelColours` (atlas.js). */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");
const { loadCards } = require("./card-io.js");

const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream" };
const PORT = 5663;
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  — " + extra : "")); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const lum = (h) => { const n = parseInt(h.slice(1), 16); const c = [16, 8, 0].map((s) => { const v = ((n >> s) & 255) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const { cards } = loadCards();
const READER = cards.filter((c) => /^(rm|gr)-/.test(c.id) && Array.isArray(c.places) && c.places.length).slice(0, 80).map((c) => c.id);
const seed = (ids) => `try { if (!localStorage.getItem("folio_v1_seeded")) { localStorage.setItem("folio_v1", JSON.stringify({ cards: Object.fromEntries(${JSON.stringify(ids)}.map((id, i) => [id, { due: i % 3 === 0 ? Date.now() - 9e5 : Date.now() + 9e8, ivl: 9, ease: 2.5, status: "review", reps: 2, first: "2026-08-01" }])), settings: { newPerDay: 5 } })); localStorage.setItem("folio_v1_seeded", "1"); } } catch (e) {}`;
const A = (page, fn, arg) => page.evaluate(`(() => { const c = document.querySelector(".atlas2").__atlas2; return (${fn.toString()})(c, ${JSON.stringify(arg === undefined ? null : arg)}); })()`);
const GROUNDS = [["plain land", 2025, false], ["relief", 2025, true], ["the darker land", -3000, false]];
const errors = [];

async function open(browser, theme) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript(seed(READER));
  await ctx.addInitScript(`localStorage.setItem("folio_tour_v1","1");localStorage.setItem("folio_atlas_tour_v1","1");`);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  await page.goto(`http://127.0.0.1:${PORT}/#map`, { waitUntil: "load" });
  await page.waitForSelector(".atlas2[data-ready='1']", { timeout: 120000 });
  if (theme === "dark") { await page.evaluate(() => document.body.classList.add("night")); await sleep(300); }
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.waterSettled() && c.labelsReady() && c.study.ready(); }, null, { timeout: 120000 });
  await A(page, (c) => { c.setLayers({ rivers: false, lakes: false, countries: false, peoples: "off" }); c.study.setMode("full"); c.ensureHistory(); });
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.historyStarted() && c.historyReady(); }, null, { timeout: 180000 });
  return { ctx, page };
}
async function show(page, year, relief) {
  await A(page, (c, s) => { c.setLayers({ relief: s.relief }); c.setYear(s.year); c.setView(12.5, 41.9, 1.5); }, { year, relief });
  await page.waitForFunction(() => { const c = document.querySelector(".atlas2").__atlas2; return c.tilesSettled() && c.waterSettled() && c.historySettled(); }, null, { timeout: 120000 }).catch(() => {});
  await A(page, (c) => c.layoutNow()); await sleep(1200); await A(page, (c) => c.layoutNow()); await sleep(400);
  await A(page, (c) => c.invalidate()); await sleep(700);
}
/* the GL canvas without the marks and names: the labels canvas hidden for the shot */
async function ground(page) {
  await page.evaluate(() => { document.querySelector(".atlas2-labels").style.visibility = "hidden"; });
  await sleep(200);
  const b64 = (await (await page.$(".atlas2-canvas")).screenshot()).toString("base64");
  await page.evaluate(() => { document.querySelector(".atlas2-labels").style.visibility = ""; });
  await page.evaluate(async (b64) => { const im = new Image(); im.src = "data:image/png;base64," + b64; await im.decode(); const c = document.createElement("canvas"); c.width = im.width; c.height = im.height; const g = c.getContext("2d", { willReadFrequently: true }); g.drawImage(im, 0, 0); window.__gl = { w: c.width, h: c.height, d: g.getImageData(0, 0, c.width, c.height).data }; }, b64);
  await sleep(200);
}
const read = (page) => A(page, (c) => {
  const col = c.colours(), cv = document.querySelector(".atlas2-labels"), dpr = cv.width / c.frame()[0], g = cv.getContext("2d", { willReadFrequently: true }), GL = window.__gl, k = GL.w / c.frame()[0];
  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const L = (p) => 0.2126 * lin(p[0]) + 0.7152 * lin(p[1]) + 0.0722 * lin(p[2]);
  const ratio = (p, q) => { const a = L(p) + 0.05, b = L(q) + 0.05; return a > b ? a / b : b / a; };
  const chrome = c.study.layoutChrome(), inChrome = (x, y) => chrome.some((r) => x >= r[0] - 12 && x <= r[2] + 12 && y >= r[1] - 12 && y <= r[3] + 12);
  const marks = c.study.liveMarks(), boxes = c.labelsLive().flatMap((e) => (e.p.rects || []).map((q) => [q[0] + e.dx, q[1] + e.dy, q[2] + e.dx, q[3] + e.dy]));
  const meets = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
  const fillOf = (m) => hex(m.st === 2 ? col.markOwnFill : col.markFill), lineC = hex(col.markLine);
  const out = [];
  for (const m of marks) {
    const strip = [m.x - 2, m.y - 4, m.x + m.h + 9, m.y + 4];
    if (inChrome(m.x, m.y) || !marks.every((o) => o === m || !meets(strip, [o.x - o.h - 2, o.y - o.h - 2, o.x + o.h + 2, o.y + o.h + 2])) || !boxes.every((b) => !meets(strip, [b[0] - 3, b[1] - 3, b[2] + 3, b[3] + 3]))) continue;
    const F = fillOf(m), ax = [F[0] - lineC[0], F[1] - lineC[1], F[2] - lineC[2]], len = ax[0] * ax[0] + ax[1] * ax[1] + ax[2] * ax[2] || 1;
    const px = (dx) => { const d = g.getImageData(Math.round((m.x + dx) * dpr), Math.round(m.y * dpr), 1, 1).data; return [d[0], d[1], d[2], d[3]]; };
    // the row from the ground inward: m.h + 3 px right of the centre down to the fill's own depth (a stack's square or ring: clear of its count)
    const inner = m.members ? m.h - 5 : Math.max(1, m.h - 4), steps = Math.round((m.h + 3 - inner) * dpr); let run = "", cls = [];
    for (let i = 0; i <= steps; i++) { const dx = m.h + 3 - i / dpr, p = px(dx); const t = ((p[0] - lineC[0]) * ax[0] + (p[1] - lineC[1]) * ax[1] + (p[2] - lineC[2]) * ax[2]) / len; run += p[3] < 100 ? "." : t > 0.6 ? "F" : t < 0.4 ? "L" : "?"; cls.push([dx, p]); }
    const mid = (ch) => { const idx = []; for (let i = 0; i < run.length; i++) if (run[i] === ch) idx.push(i); return idx.length ? cls[idx[Math.floor(idx.length / 2)]][1] : null; };
    const fillPx = mid("F"), linePx = mid("L"), gx = Math.round((m.x + m.h + 5) * k), gy = Math.round(m.y * k);
    const gi = (x, y) => 4 * (y * GL.w + x), gp = [0, 1, 2].map((j) => { const v = []; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) v.push(GL.d[gi(gx + dx, gy + dy) + j]); v.sort((a, b) => a - b); return v[4]; });
    if (!fillPx || !linePx) { out.push({ id: m.id, name: m.name || m.id, stack: !!m.members, own: m.st === 2, run, bad: true }); continue; }
    out.push({ id: m.id, name: m.name || m.id, shape: m.shape, stack: !!m.members, own: m.st === 2, h: m.h, run, haloRun: (run.match(/L+/) || [""])[0].length / dpr, fillGround: ratio(fillPx, gp), lineGround: ratio(linePx, gp), fillLine: ratio(fillPx, linePx) });
  }
  return { col, out, n: marks.length, sel: c.selectedId ? c.selectedId() : null };
});
const med = (a) => { const s = a.slice().sort((p, q) => p - q); return s.length ? s[Math.floor(s.length / 2)] : NaN; };

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await chromium.launch(LAUNCH);
  for (const theme of ["light", "dark"]) {
    const night = theme === "dark", th = night ? "folio's night" : "the light theme";
    console.log(`\n\x1b[1m${th}\x1b[0m\n`);
    const { ctx, page } = await open(browser, theme);
    let colours = null;
    for (const [gname, year, relief] of GROUNDS) {
      await show(page, year, relief);
      await ground(page);
      const r = await read(page); colours = r.col;
      const lone = r.out.filter((o) => !o.stack), stacks = r.out.filter((o) => o.stack), bad = r.out.filter((o) => o.bad || !/^\.*L+F+$/.test(o.run.replace(/\?/g, "F")));
      const f = (key, list) => `${Math.min(...list.map((o) => o[key])).toFixed(2)} min / ${med(list.map((o) => o[key])).toFixed(2)} median`;
      console.log(`  ${gname}: ${lone.length} lone marks and ${stacks.length} stacks read of ${r.n}; fill/ground ${f("fillGround", r.out.filter((o) => !o.bad))}; outline/ground ${f("lineGround", r.out.filter((o) => !o.bad))}; fill/outline ${f("fillLine", r.out.filter((o) => !o.bad))}`);
      check(`${th}, ${gname}: marks are read (>= 6 lone, >= 1 stack)`, lone.length >= 6 && stacks.length >= 1, `${lone.length} lone, ${stacks.length} stacks`);
      check(`${th}, ${gname}: every mark reads ground, then the outline's colour, then the fill (${r.out.length - bad.length} of ${r.out.length})`, bad.length === 0 && r.out.length >= 7, bad.slice(0, 4).map((o) => `${o.name} ${o.shape || "stack"} ${o.run}`).join("; "));
      const widths = r.out.filter((o) => !o.bad).map((o) => o.haloRun), half = (night ? 3.2 : 2.6) / 2;
      check(`${th}, ${gname}: the outline run is about half the halo's width (${half.toFixed(1)} px: ${(half * 0.5).toFixed(1)}–${(half * 2 + 1).toFixed(1)} px with anti-aliasing) on every mark`, widths.length > 0 && widths.every((w) => w >= half * 0.5 && w <= half * 2 + 1), widths.map((w) => w.toFixed(1)).join(", "));
      const good = r.out.filter((o) => !o.bad), plain = gname !== "the darker land";
      check(`${th}, ${gname}: ${plain ? "the fill reads at least 3:1 against the ground behind it on every mark" : "the fill or the outline reads at least 3:1 against the ground on every mark"}`, good.length > 0 && good.every((o) => (plain ? o.fillGround : Math.max(o.fillGround, o.lineGround)) >= 3), good.filter((o) => (plain ? o.fillGround : Math.max(o.fillGround, o.lineGround)) < 3).slice(0, 4).map((o) => `${o.name}${o.own ? " (own)" : ""}: fill ${o.fillGround.toFixed(2)}, outline ${o.lineGround.toFixed(2)}`).join("; "));
      check(`${th}, ${gname}: the fill against its outline is at least 3:1 on every mark`, good.length > 0 && good.every((o) => o.fillLine >= 3), good.filter((o) => o.fillLine < 3).slice(0, 3).map((o) => `${o.name}: ${o.fillLine.toFixed(2)}`).join("; "));
      if (gname === "plain land") {   // the selected mark: open the first clear lone mark, draw it (a ring of the selection colour inside its fill, 1 px larger) and read it as the others
        const pick = lone.find((o) => o.h >= 3.5);
        if (pick) {
          await A(page, (c, id) => c.select(id, { open: true }), pick.id); await sleep(900);
          await A(page, (c) => c.layoutNow()); await sleep(500); await A(page, (c) => c.invalidate()); await sleep(600);
          await ground(page);
          const r2 = await read(page), me = r2.out.find((o) => o.id === pick.id);
          check(`${th}: the SELECTED mark (${pick.name}) is outlined in the halo too: ground, outline, fill`, !!me && !me.bad && /^\.*L+[F?]+$/.test(me.run), me ? me.run : "not drawn clear after the selection");
          await page.keyboard.press("Escape"); await sleep(400);
        }
      }
    }
    const col = colours, fillL = lum(col.markFill), lineL = lum(col.markLine);
    check(`${th}: the outline is the labels' halo colour (${col.halo}) and its width the labels' halo width (${col.haloWidth} px)`, col.markLine === col.halo && col.markLineWidth === col.haloWidth, `outline ${col.markLine} ${col.markLineWidth} px, halo ${col.halo} ${col.haloWidth} px`);
    // 2026-10-25 (the owner: "the location icons should be red"): every mark, the reader's own included, is the theme's red (`colours().mark`), no longer the ink / the names' ochre
    check(`${th}: the fill is the red (${col.mark}), the reader's own marks too; ${night ? "lighter" : "darker"} than the outline`, !!col.mark && col.markFill === col.mark && col.markOwnFill === col.mark && (night ? fillL > lineL : fillL < lineL), `fill ${col.markFill}, own ${col.markOwnFill}, outline ${col.markLine}`);
    await ctx.close();
  }
  check("no console or page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  await browser.close(); server.close();
  console.log(`\n${pass} ok, ${fail} failed\n`); process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
