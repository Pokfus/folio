/* test-findit-pick.js — Find it's PICK and the flat colour of an area round (Atlas v2, Oct 2026; the owner's phone, 2026-10-16).

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-findit-pick.js [shotsDir]
     FOLIO_CHROMIUM=/path/to/chrome

   The owner's two reports: (1) "clicking countries to select them does not light them up as it should"; (2) "historical states are displayed in varying colours; they should all be the same colour,
   like modern states". THE CAUSES: (1) the pick was a BLUE wash at alpha 0.30 with an outline only on a country round — on an area round the pick was the state's own fill REPLACED by the pick's colour
   (atlas.js `put` used the tint at the history's 1.7 × fill alpha, no outline, no glow: embed.js's past-year branch had no mask pass), which, among states in a dozen hues of their own, was one more hue, not
   a selection; a place round showed a thin blue cross. (2) an area round drew the year's states in the history's own golden-angle hues (`entColourAt`; gone since 2026-10-18, when the Atlas page too went to one neutral fill), as the Atlas page then did; Find it needs no hue to tell
   states apart (their borders do) and a hue is a clue. THE FIX: the pick is the card windows' own selection (TINT_SEL: gold, alpha 0.24, outline, glow) on a country and on a state of the year (embed.js `exact`
   highlights, an outline from a mask pass of the year's states: atlas.js `setMask`), lit by a fast frame at once and outlined within 140 ms; an area round is `layers.flat` (every state in the land colour,
   borders as a modern country's, atlas.js `setFlat`); where there is no region to light (a place round, a tap on no state, the still renderer's area round) the same gold marker.

   THE SAMPLE RULE (2026-10-17; CI run 39010458430 on 64109b0, shard 3: "a tap on a state: two frames later …" read [233,210,177] where [232,213,186] was wanted). The pick is drawn in two
   steps — a FAST frame with the fill alone, then the full frame with the outline and its glow within 140 ms (atlas-embed.js `flash`). The check samples the fill two frames after the tap; on a
   slow runner two frames take longer than 140 ms, the full frame has landed, and a sample point near the outline reads the GLOW (the blue channel down a few more levels) instead of the tint. The
   pick itself was right; reproduced locally with FOLIO_SLOW_FRAMES=60. So the sample point is now chosen BEYOND THE GLOW'S REACH — every point within GLOW_REACH px of it answers the same ids to
   the ID pass (GLOW_REACH = the highlight spec's line width 2.6 + glow blur 9 + 2 px, atlas-windows.js `hl`) — so it reads the tint whether or not the outline has landed; the tolerance stays ±4;
   the same pixel is read again once the window has settled and must still be the tint. FOLIO_SLOW_FRAMES=<ms> delays every requestAnimationFrame callback by that much, as test-atlas-labels.js
   does, so the slow-runner case runs on any machine (the suite is run at 0, 60 and 120 ms).

   WHAT IS READ (pixels of #fi2Board), at 390 × 844 (touch, dpr 2) and 1280 × 800:
     1  a modern round: a tap lights the picked country within one frame — its pixels differ from the unlit land by the gold tint (land + (gold − land) × 0.24, ±4), the gold outline is on the canvas after
        a settle, the lit pixels are still lit through a drag (mid-gesture and after) and Clear puts it out;
     2  an area round: at least five different states of the year sample to the SAME land colour (±1 per channel), the colour of a modern country; the same tint, outline and glow on a tapped state; lit through a drag;
        nothing but the picked region is lit (the other states stay land); Clear and the next round clear it;
     3  a place round: the marker is gold (the selection's colour), not blue. */
"use strict";
const fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");
const WE = require("./test-window-env.js");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const SHOTS = process.argv[2] || "";
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  " + extra : "")); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [];
const TOURS = `localStorage.setItem("folio_tour_v1","1");localStorage.setItem("folio_atlas_tour_v1","1");localStorage.setItem("folio_library_tour_v1","1");localStorage.setItem("folio_mine_tour_v1","1");`;
const GOLD = [255, 178, 46], A = 0.24;   // TINT_SEL
const GLOW_REACH = 2.6 + 9 + 2;   // the highlight spec (atlas-windows.js `hl`: lineWidth 2.6, glowBlur 9) + 2 px: how far from the outline its glow can reach, in CSS px
const SLOW = Number(process.env.FOLIO_SLOW_FRAMES) || 0;

let base;
async function open(browser, vp) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: !!vp.mobile, hasTouch: !!vp.mobile, deviceScaleFactor: vp.mobile ? 2 : 1 });
  await ctx.addInitScript(TOURS);
  /* FOLIO_SLOW_FRAMES=<ms>: requestAnimationFrame callbacks arrive that many ms late without blocking the page's JavaScript, as on a software rasteriser whose previous frame still holds the compositor (a CI runner) */
  if (SLOW) await ctx.addInitScript((d) => { const raf = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = (cb) => setTimeout(() => raf(cb), d); }, SLOW);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text()) && !/GL_INVALID|WebGL/.test(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  await page.goto(base + "#findit", { waitUntil: "load" }); await page.reload({ waitUntil: "load" });
  await page.waitForFunction(() => { const m = document.querySelector("#mapGame"); return m && !m.hidden && document.querySelector("#findit2") && document.querySelector("#mgQ").textContent.length > 3; }, null, { timeout: 180000 });
  return { ctx, page };
}
const api = (page, fn, arg) => page.evaluate(([src, a]) => { const h = [...document.querySelectorAll("*")].find((e) => e._finditApi); return new Function("h", "a", "return (" + src + ")(h, a)")(h, a); }, [fn.toString(), arg]);
const settle = async (page) => { await page.waitForFunction(() => { const h = [...document.querySelectorAll("*")].find((e) => e._finditApi); const w = h && h._finditApi.win(); return w && w.isSettled(); }, null, { timeout: 25000 }).catch(() => {}); await sleep(500); };
const px = (page, x, y) => page.evaluate(([x, y]) => { const c = document.getElementById("fi2Board"), k = c.width / c.getBoundingClientRect().width, d = c.getContext("2d").getImageData(Math.round(x * k), Math.round(y * k), 1, 1).data; return [d[0], d[1], d[2]]; }, [x, y]);
const near = (a, b, t) => a.every((v, i) => Math.abs(v - b[i]) <= t);
const lit3 = (c, base) => c[2] <= base[2] - 25;   // lit: the gold tint takes the blue channel down (by 44 on the land), the outline and glow further
const blend = (land) => land.map((l, i) => l + (GOLD[i] - l) * A);
/* the number of canvas pixels in the outline's gold (255,192,74): opaque enough to be the line, not the 0.24 wash (the wash is within ~25 of land) */
const outlinePx = (page) => page.evaluate(() => { const c = document.getElementById("fi2Board"), d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] > 235 && d[i + 1] > 170 && d[i + 1] < 215 && d[i + 2] > 40 && d[i + 2] < 120) n++; return n; });
const frames = (page, n) => page.evaluate((n) => new Promise((res) => { let i = 0; const f = () => { if (++i >= n) res(); else requestAnimationFrame(f); }; requestAnimationFrame(f); }), n);
const landOf = (page) => page.evaluate(() => window.AtlasEmbed.hub().landRGB().map((v) => v * 255));

/* tap at CSS px (x, y) of the board the way the viewport's own input does */
async function tap(page, box, x, y, touch) { if (touch) await page.touchscreen.tap(box.x + x, box.y + y); else await page.mouse.click(box.x + x, box.y + y); }
/* a small drag from (x, y): down, move, (read mid-gesture), up */
async function drag(page, box, x, y, dx, dy, mid) {
  await page.mouse.move(box.x + x, box.y + y); await page.mouse.down();
  for (let i = 1; i <= 6; i++) { await page.mouse.move(box.x + x + dx * i / 6, box.y + y + dy * i / 6); }
  if (mid) await mid();
  await page.mouse.up();
}
/* where a lon/lat is on the board now (CSS px) */
const proj = (page, ll) => page.evaluate((ll) => { const h = [...document.querySelectorAll("*")].find((e) => e._finditApi), p = h._finditApi.win().api.project(ll[0], ll[1]); return [p[0], p[1]]; }, ll);
/* a point on the board (CSS px) whose 3 × 3 neighbourhood is one flat colour and which the engine says is under `want` (a predicate on the ids); with `clear` (px), only a point
   whose whole disc of that radius answers the SAME ids to the ID pass — beyond an outline's glow (GLOW_REACH), so the fill's tint is read whether or not the outline has landed */
async function findPoint(page, want, rad, step, clear, notKey, subject) {   // notKey: a key (ids joined) to leave out — another country than the one already picked; subject: the ids that must be constant over the clear disc (a regex source; the admin-1 unit may change inside a country)
  return page.evaluate(([src, rad, step, clear, notKey, subject]) => {
    const subjRe = subject && subject !== "state" ? new RegExp(subject) : null;
    const keyOf = (ids) => (subject === "state" ? ids.filter((i) => /^(pol|ext):/.test(i) && (!hub.kindOfId || hub.kindOfId(i) === "polity")) : subjRe ? ids.filter((i) => subjRe.test(i)) : ids).join("|");   // "state": the states only (a people's stipple overlaps a state and is not its outline)
    const want = new Function("ids", "return (" + src + ")(ids)");
    const h = [...document.querySelectorAll("*")].find((e) => e._finditApi), w = h._finditApi.win(), a = w.api, hub = window.AtlasEmbed.hub(), c = document.getElementById("fi2Board"), k = c.width / a.cw, ctx = c.getContext("2d");
    const all = [], out = [];
    for (let fy = 0.3; fy <= 0.9; fy += step) for (let fx = 0.08; fx <= 0.92; fx += step) {
      const x = a.cw * fx, y = a.ch * fy; const ids = hub.idsAt(a.spec, x, y) || []; const hit = want(ids);
      all.push({ x, y, key: hit ? ids.join("|") : null }); if (!hit) continue;
      const R = Math.max(1, Math.round((rad || 0) * k)), d = ctx.getImageData(Math.round(x * k) - R, Math.round(y * k) - R, 2 * R + 1, 2 * R + 1).data; let ok = true; for (let i = 4; i < d.length; i += 4) if (Math.abs(d[i] - d[0]) > 1 || Math.abs(d[i + 1] - d[1]) > 1 || Math.abs(d[i + 2] - d[2]) > 1) { ok = false; break; }
      if (ok) out.push({ x, y, ids, rgb: [d[0], d[1], d[2]], ll: hub.lonLatAt(a.spec, x, y), key: ids.join("|"), kinds: ids.map((i) => (hub.kindOfId ? hub.kindOfId(i) : /^pol:/.test(i) ? "polity" : null)) });
    }
    for (const o of out) { let dmin = 1e9; for (const q of all) if (q.key !== o.key) dmin = Math.min(dmin, Math.hypot(q.x - o.x, q.y - o.y)); o.depth = dmin; }   // the distance to the nearest scanned point of anything else: a point away from the outline and its glow
    out.sort((p, q) => q.depth - p.depth);
    if (notKey) { for (let i = out.length - 1; i >= 0; i--) if (out[i].key === notKey) out.splice(i, 1); }
    if (!clear) return out;
    // the disc check, on the deepest candidates first: every ID-pass reading within `clear` px (a 3 px lattice over the disc) is this candidate's own ids
    const kept = []; let tried = 0;
    for (const o of out) {
      if (kept.length >= 2 || tried >= 60) break;   // the deepest sixty at most (a disc is ~60 ID-pass readings)
      tried++;
      let ok = true;
      const want0 = keyOf(o.ids);
      for (let dy = -clear; dy <= clear && ok; dy += 3) for (let dx = -clear; dx <= clear; dx += 3) { if (dx * dx + dy * dy > clear * clear) continue; const ids = hub.idsAt(a.spec, o.x + dx, o.y + dy) || []; if (keyOf(ids) !== want0) { ok = false; break; } }
      if (ok) kept.push(o);
    }
    return kept;
  }, [want.toString(), rad || 0, step || 0.045, clear || 0, notKey || null, subject || null]);
}
async function playOut(page, box, touch) {   // tap a grid until Guess shows, Guess twice (a wrong guess gives a second try), the round ends
  for (let go = 0; go < 2; go++) {
    let picked = false;
    for (let a = 0; a < 8 && !picked; a++) for (let b = 0; b < 6 && !picked; b++) { await tap(page, box, box.width * (0.35 + a * 0.07), box.height * (0.35 + b * 0.08), touch); if (await page.isVisible("#mgConfirm")) picked = true; }
    if (!picked) break;
    await page.click("#mgConfirm"); await sleep(900);
    if (await page.isVisible("#mgNext")) break;
  }
}
const nextRound = async (page) => { await page.click("#mgNext"); await sleep(1200); };

async function run(browser, vp, label) {
  console.log("\n\x1b[1m" + label + "\x1b[0m\n");
  const { ctx, page } = await open(browser, vp), touch = !!vp.mobile;
  const box0 = await (await page.$("#fi2Board")).boundingBox(), box = { x: box0.x, y: box0.y, width: box0.width, height: box0.height };
  await settle(page);
  const land = await landOf(page);

  // ---- 1) a modern round ----
  const q1 = await page.textContent("#mgQ");
  // the board zoomed to the Sahara (the round opens on the whole globe, where on a phone's 358 px board few countries hold a sample point GLOW_REACH px clear of every border)
  await api(page, (h, v) => h._finditApi.win().setView(v[0], v[1], v[2]), [15, 22, 2.6]); await settle(page); await sleep(600);
  const cand = await findPoint(page, (ids) => ids.some((i) => /^adm0:/.test(i)), 0, 0, GLOW_REACH, null, "^adm0:");
  const P = cand.length ? cand[0] : null;
  check(`1. round 1 ("${q1.slice(0, 40)}"): a point deep inside a country, ${GLOW_REACH} px clear of its outline, is found on the board`, !!P, cand.length + " candidates");
  const before = await px(page, P.x, P.y);
  check("1. ...it is unlit land before the tap (the palette's land colour, ±2)", near(before, land, 2), JSON.stringify({ before, land: land.map(Math.round) }));
  const o0 = await outlinePx(page);
  await tap(page, box, P.x, P.y, touch);
  await frames(page, 2);
  const lit = await px(page, P.x, P.y);
  check("1. one tap, two frames later: the picked country's pixels (beyond the glow's reach) differ from the unlit land by the gold tint (land + (gold − land) × 0.24, ±4)", near(lit, blend(before), 4) && !near(lit, before, 3), JSON.stringify({ before, lit, want: blend(before).map(Math.round) }));
  await settle(page);
  const litSettled = await px(page, P.x, P.y);
  check("1. ...and settled, with the outline and glow drawn, the same pixel still reads the tint (±4): the sample point is beyond the glow", near(litSettled, blend(before), 4), JSON.stringify({ litSettled, want: blend(before).map(Math.round) }));
  const o1 = await outlinePx(page);
  check("1. ...and, settled, its gold outline and glow are on the canvas (the outline's pixels went from " + o0 + " to " + o1 + ")", o1 - o0 > 40, String(o1 - o0));
  if (SHOTS) { try { fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, `findit-pick-country-${vp.width}.png`) }); } catch (e) {} }
  let mid = null;
  await drag(page, box, P.x + 4, P.y + 4, 10, 6, async () => { await frames(page, 2); const q = await proj(page, P.ll); mid = await px(page, q[0], q[1]); });
  await frames(page, 2); const aq = await proj(page, P.ll), after = await px(page, aq[0], aq[1]);
  check("1. it stays lit while the map is dragged (mid-gesture) and after the drag (its pixel still carries the tint: blue channel down by ≥ 25)", mid && after && lit3(mid, before) && lit3(after, before), JSON.stringify({ mid, after }));
  // another country: the first goes out
  const cand2 = await findPoint(page, (ids) => ids.some((i) => /^adm0:/.test(i)), 0, 0, GLOW_REACH, P.key, "^adm0:");
  if (cand2.length) {
    const Q = cand2[0], qb = await px(page, Q.x, Q.y);
    await tap(page, box, Q.x, Q.y, touch); await frames(page, 2);
    const qlit = await px(page, Q.x, Q.y), pnow = await px(page, P.x, P.y);
    const pq = await proj(page, P.ll), pn = await px(page, pq[0], pq[1]);
    check("1. a tap on another country lights it and the first goes out (only the picked region is lit)", near(qlit, blend(qb), 4) && near(pn, land, 3), JSON.stringify({ qlit, pn }));
  } else check("1. a second country was found on the board", false);
  await page.click("#mgClear"); await frames(page, 3);
  { const q = await proj(page, P.ll); check("1. Clear puts the light out", near(await px(page, q[0], q[1]), land, 3)); }
  // play the round out, then round 2
  await playOut(page, box, touch); await nextRound(page);

  // ---- 2) an area round ----
  const q2 = await page.textContent("#mgQ");
  check(`2. round 2 is an area round ("${q2.slice(0, 50)}")`, /as it stood in/.test(q2));
  const landNow = await landOf(page), seen = new Map();
  for (const v of [[15, 25, 0.95], [20, 38, 2.6], [12, 42, 4.5], [40, 33, 2.4], [30, 31, 3.4], [10, 43, 3.2], [60, 33, 2.4], [23, 39, 7], [12, 42, 6]]) {   // the Mediterranean, Egypt, Persia: wherever the year has states
    if (seen.size >= 7) break;
    await api(page, (h, v) => h._finditApi.win().setView(v[0], v[1], v[2]), v); await settle(page); await sleep(600);
    for (const s of await findPoint(page, (ids) => ids.filter((i) => /^(pol|ext):/.test(i)).length === 1, 0, 0.03)) { const id = s.ids.find((i) => /^(pol|ext):/.test(i)); if (s.kinds[s.ids.indexOf(id)] === "polity" && !seen.has(id)) seen.set(id, Object.assign(s, { view: v })); }   // a STATE (kind polity): a people or a culture is a stipple, not a state
  }
  const states = [...seen.values()];
  check(`2. at least five different states of the year are on the board (${states.length})`, states.length >= 5, [...seen.keys()].join(" "));
  const same = states.filter((s) => near(s.rgb, landNow, 1));
  check(`2. ...and they sample to the SAME land colour, the colour of a modern country (±1 per channel): ${same.length} of ${states.length}`, same.length === states.length && states.length >= 5, JSON.stringify(states.map((s) => s.rgb.join(","))));
  if (SHOTS) { try { await page.screenshot({ path: path.join(SHOTS, `findit-pick-area-flat-${vp.width}.png`) }); } catch (e) {} }
  // a pick on a state: in the view that showed the most of them
  // among the CLOSER views (zoom ≥ 2): on the whole globe (the first view, zoom 0.95) no state of a phone's board holds a sample point GLOW_REACH px clear of its outline
  const byView = new Map(); for (const s of states) { if (s.view[2] < 2 && states.some((t) => t.view[2] >= 2)) continue; const k = s.view.join(","); byView.set(k, (byView.get(k) || 0) + 1); }
  const bestView = [...byView.entries()].sort((a, b) => b[1] - a[1])[0][0].split(",").map(Number);
  await api(page, (h, v) => h._finditApi.win().setView(v[0], v[1], v[2]), bestView); await settle(page); await sleep(600);
  let inView = [];   // the states of this view with room round them: a fill pixel beyond the outline's glow (GLOW_REACH px of the state's own ids all round it; 10 px of flat colour, else 5, else 2, else none)
  for (const rad of [10, 5, 2, 0]) {
    const here = new Map(); for (const s of await findPoint(page, (ids) => ids.filter((i) => /^(pol|ext):/.test(i)).length === 1, rad, 0, GLOW_REACH, null, "state")) { const id = s.ids.find((i) => /^(pol|ext):/.test(i)); if (s.kinds[s.ids.indexOf(id)] === "polity" && !here.has(id)) here.set(id, s); }
    inView = [...here.values()]; if (inView.length) break;
  }
  const T = inView[0];
  check(`2. a state with ${GLOW_REACH} px of its own ground round a sample point is on the board`, !!T, T ? T.ids.join(" ") : "none");
  const so0 = await outlinePx(page);
  await tap(page, box, T.x, T.y, touch); await frames(page, 2);
  const tl = await px(page, T.x, T.y);
  check("2. a tap on a state: two frames later its pixels (beyond the glow's reach) differ from the flat land by the same gold tint (±4)", near(tl, blend(landNow), 4) && !near(tl, landNow, 3), JSON.stringify({ tl, want: blend(landNow).map(Math.round), ids: T.ids }));
  await settle(page);
  const tlSettled = await px(page, T.x, T.y);
  check("2. ...and settled, with the outline and glow drawn, the same pixel still reads the tint (±4)", near(tlSettled, blend(landNow), 4), JSON.stringify({ tlSettled, want: blend(landNow).map(Math.round) }));
  const others = states.filter((s) => s.view.join(',') === bestView.join(',') && s.ids.every((i) => T.ids.indexOf(i) < 0) && Math.hypot(s.x - T.x, s.y - T.y) > 40);
  const olit = []; for (const s of others) olit.push(await px(page, s.x, s.y));
  check("2. ...only the picked region is lit: every other state stays the land colour (not the tint; the glow of a neighbour's outline may bleed a few levels) (" + others.length + " read)", others.length >= 1 && olit.every((c) => !lit3(c, landNow) && near(c, landNow, 14)), JSON.stringify(olit.slice(0, 4)));
  await settle(page);
  const so1 = await outlinePx(page);
  check("2. ...its gold outline and glow are on the canvas, for a historical area too (" + so0 + " → " + so1 + " outline pixels)", so1 - so0 > 40, String(so1 - so0));
  if (SHOTS) { try { await page.screenshot({ path: path.join(SHOTS, `findit-pick-area-${vp.width}.png`) }); } catch (e) {} }
  let mid2 = null;
  await drag(page, box, T.x + 6, T.y + 6, 8, 5, async () => { await frames(page, 2); const q = await proj(page, T.ll); mid2 = await px(page, q[0], q[1]); });
  await frames(page, 2); const aq2 = await proj(page, T.ll), after2 = await px(page, aq2[0], aq2[1]);
  check("2. the state stays lit while the map is dragged, and after (the tint, or its outline)", mid2 && after2 && lit3(mid2, landNow) && lit3(after2, landNow), JSON.stringify({ mid2, after2 }));
  await page.click("#mgClear"); await frames(page, 3);
  { const q = await proj(page, T.ll); check("2. Clear puts the state's light out", near(await px(page, q[0], q[1]), landNow, 2)); }
  await playOut(page, box, touch);   // a guess ends it (right or wrong); the pick is cleared on the commit
  if (await page.isVisible("#mgNext")) await nextRound(page);
  const gone = await findPoint(page, (ids) => ids.some((i) => /^adm0:/.test(i)));
  check("2. the next round opens with nothing picked: Guess and Clear collapsed", await page.isHidden("#mgConfirm") && await page.isHidden("#mgClear") && gone.length >= 0);

  // ---- 3) a place round: the marker ----
  for (let i = 0; i < 3; i++) { const q = await page.textContent("#mgQ"); if (/city of|on today's map/.test(q) && (await api(page, (h) => h._finditApi.rounds()[h._finditApi.round()].kind, null)) === "point") break; await playOut(page, box, touch); if (await page.isVisible("#mgNext")) await nextRound(page); }
  const kind = await api(page, (h) => h._finditApi.rounds()[h._finditApi.round()].kind, null);
  if (kind === "point") {
    await settle(page); await tap(page, box, box.width * 0.5, box.height * 0.5, touch); await frames(page, 3);
    const gold = await outlinePx(page);
    const blue = await page.evaluate(() => { const c = document.getElementById("fi2Board"), d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] < 90 && d[i + 1] > 90 && d[i + 1] < 130 && d[i + 2] > 190) n++; return n; });
    check("3. a place round: the pick is the gold marker (outline pixels " + gold + "), not the old blue cross (" + blue + ")", gold > 20 && blue === 0, JSON.stringify({ gold, blue }));
  } else check("3. the place round was reached", false, kind);
  await ctx.close();
}

(async () => {
  const srv = await WE.serve(path.resolve(__dirname, ".."), 5631); base = srv.base;
  const browser = await WE.launch(chromium, LAUNCH);
  await run(browser, { width: 390, height: 844, mobile: true }, "A) a phone, 390 × 844, touch");
  await run(browser, { width: 1280, height: 800 }, "B) a desktop, 1280 × 800");
  check("no console or page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  await browser.close(); srv.close();
  console.log(`\n${pass} ok, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
