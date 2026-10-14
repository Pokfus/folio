/* test-findit-learn.js — Find it's LEARN PANEL on the engine's board (Atlas v2 Phase 4c, the owner's decision 5; Phase 5: the engine's board is the only board).

     NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-findit-learn.js [shotsDir]
     FOLIO_CHROMIUM=/path/to/chrome

   The earlier Find it ended a round on a popup (a country: its full name, "New discovery!", the prose; a state, a people or a place: the study cards about it). The engine's board ends it on a panel of its own
   (atlas/atlas-windows.js `revealPanel`): the place's name, "New discovery!" for a first-seen country, the country's prose, the PLACE CARD'S LIST of cards (`AtlasStudy.cardsFor`), a way on (Next, in the panel) and a way
   to put it away (close, Escape).

   A DAY IS PLAYED through the controls a reader has — a grid of taps until one lands, Guess, a second try, the round ends right or wrong — and at the end of EACH of the five rounds the panel is read (.fi2-reveal-head,
   .fi2-learn-new, the list): the name, the discovery chip on a first-seen country, the prose on a country, the cards of a state, a people or a place (exactly the round's own cards, each a link to the card's own address),
   and a way to continue that really continues. PHASE 5: the same day used to be played on the earlier board first and the two panels compared; with that board gone, each assertion is absolute (the question names the
   round's place, the chip is on for a fresh profile, the list holds as many cards as the round carries). A phone-sized run checks the panel sits inside the screen with its two buttons a thumb's size. */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");
const WE = require("./test-window-env.js");
const ROOT = path.resolve(__dirname, "..");
const LAUNCH = process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {};
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".bin": "application/octet-stream", ".woff2": "font/woff2" };
const PORT = 5627, SHOTS = process.argv[2] || "";
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => { if (err) { res.writeHead(404); res.end("not found"); return; } res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Content-Length": data.length }); res.end(data); });
});
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if (ok) { pass++; console.log("  \x1b[32mok\x1b[0m    " + name + (extra ? "  \x1b[2m" + extra + "\x1b[0m" : "")); } else { fail++; console.log("  \x1b[31mFAIL\x1b[0m  " + name + (extra ? "  " + extra : "")); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errors = [];
const TOURS = `localStorage.setItem("folio_tour_v1","1");localStorage.setItem("folio_atlas_tour_v1","1");localStorage.setItem("folio_library_tour_v1","1");localStorage.setItem("folio_mine_tour_v1","1");`;

async function open(browser, vp) {
  const ctx = await browser.newContext({ viewport: vp || { width: 1280, height: 900 }, isMobile: !!(vp && vp.mobile), hasTouch: !!(vp && vp.mobile), deviceScaleFactor: vp && vp.mobile ? 2 : 1 });
  await ctx.addInitScript(TOURS);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e).slice(0, 200)));
  page.on("console", (m) => { if (m.type() === "error" && !isNoise(m.text()) && !/GL_INVALID|WebGL/.test(m.text())) errors.push("console: " + m.text().slice(0, 200)); });
  await page.goto(`http://127.0.0.1:${PORT}/#findit`, { waitUntil: "load" }); await page.reload({ waitUntil: "load" });
  await page.waitForFunction(() => { const m = document.querySelector("#mapGame"); return m && !m.hidden && document.querySelector("#findit2") && document.querySelector("#mgQ").textContent.length > 3; }, null, { timeout: 180000 });
  return { ctx, page };
}
const stateOf = (page) => page.evaluate(() => {
  const t = (s) => { const e = document.querySelector(s); return e ? (e.textContent || "").trim() : ""; };
  const h = (s) => { const e = document.querySelector(s); return !e || e.hidden; };
  return { q: t("#mgQ"), round: t("#mgRound"), fb: t("#mgFeedback"), confirmHidden: h("#mgConfirm"), nextHidden: h("#mgNext") };
});
/* one round, played to its end through a grid of taps (the right-hand part of the stage: the panel a reveal opens sits low and central) */
async function playRound(page, canvasSel) {
  const box = await (await page.$(canvasSel)).boundingBox();
  const grid = []; for (let a = 0; a < 10; a++) for (let b = 0; b < 10; b++) grid.push([0.46 + a * 0.05, 0.22 + b * 0.05]);
  for (let go = 0; go < 2; go++) {
    let picked = false;
    for (const [fx, fy] of grid) { await page.mouse.click(box.x + box.width * fx, box.y + box.height * fy); if (!(await stateOf(page)).confirmHidden) { picked = true; break; } }
    if (!picked) break;
    await page.click("#mgConfirm"); await sleep(1100);
    if (!(await stateOf(page)).nextHidden) break;
  }
  await sleep(700);
}
const norm = (s) => String(s || "").toLowerCase().replace(/\s+/g, " ").trim();

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await WE.launch(chromium, LAUNCH);

  console.log("\n\x1b[1m1) the engine's board: a day, each round's panel read\x1b[0m\n");
  {
    const { ctx, page } = await open(browser);
    const rounds = await page.evaluate(() => { const h = [...document.querySelectorAll("*")].find((e) => e._finditApi); return h._finditApi.rounds().map((r) => ({ kind: r.kind, n: r.n, ids: r.ids || [], year: r.year })); });
    check("the engine deals the day: five rounds, a country, an area, a country, an area, a place", rounds.length === 5 && rounds.map((r) => r.kind).join(",") === "entity,area,entity,area,point", rounds.map((r) => r.n).join(", "));
    const panels = [];
    for (let i = 0; i < 5; i++) {
      const s0 = await stateOf(page);
      check(`round ${i + 1}: the question names the round's own place ("${s0.q.slice(0, 40)}")`, norm(s0.q).includes(norm(rounds[i].n)), s0.q + " | " + rounds[i].n);
      await playRound(page, "#fi2Board");
      const P = await page.evaluate(() => {
        const rv = document.getElementById("fiReveal"), t = (s) => { const e = rv.querySelector(s); return e ? (e.textContent || "").trim() : ""; };
        const links = [...rv.querySelectorAll(".fi2-learn-card")].map((a) => ({ href: a.getAttribute("href"), card: a.getAttribute("data-card"), title: (a.querySelector(".fi2-learn-title") || {}).textContent || "" }));
        const more = rv.querySelector(".fi2-learn-more"), r = rv.getBoundingClientRect(), nx = rv.querySelector(".fi2-reveal-next"), cl = rv.querySelector(".fi2-reveal-close");
        const bx = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return { w: b.width, h: b.height, in: b.left >= 0 && b.right <= innerWidth && b.top >= 0 && b.bottom <= innerHeight }; };
        return { shown: !rv.hidden, name: t(".fi2-reveal-head b"), isNew: !!rv.querySelector(".fi2-learn-new"), desc: t(".fi2-reveal-desc").length, rawTags: /<\/?[a-z][^>]*>/i.test(t(".fi2-reveal-desc")), links, more: more ? Number((/and (\d+) more/.exec(more.textContent) || [])[1]) : 0, role: rv.getAttribute("role"), label: rv.getAttribute("aria-label"), next: bx(nx), close: bx(cl), nextText: nx ? nx.textContent : "", box: { l: r.left, r: r.right, t: r.top, b: r.bottom } };
      });
      panels.push(P);
      check(`round ${i + 1} (${rounds[i].kind}): the round ends on the learn panel, a dialog named for the place`, P.shown && P.role === "dialog" && /^What you found: /.test(P.label || ""), P.label);
      // the name
      const want = rounds[i].n, got = P.name;
      check(`round ${i + 1}: it names the place ("${got}" for "${want}")`, norm(got) && (rounds[i].kind === "entity" ? (norm(got).includes(norm(want)) || norm(want).includes(norm(got))) : norm(got) === norm(want)), got);
      if (rounds[i].kind === "entity") {
        check(`round ${i + 1}: a country's panel carries its prose (no markup printed as text) and, on a profile that has seen no country, the "New discovery!" chip`, P.desc > 40 && !P.rawTags && P.isNew === true, `prose ${P.desc} chars, chip ${P.isNew}`);
      } else {
        const n = P.links.length + P.more;
        check(`round ${i + 1}: the place card's list holds exactly the cards the round carries (${rounds[i].ids.length})`, n === rounds[i].ids.length && P.links.length >= 1, `${P.links.length} listed + ${P.more} more`);
        check(`round ${i + 1}: each card is a link to the card's own address`, P.links.every((l) => l.href === "#card/" + l.card && l.title.length > 0), JSON.stringify(P.links.slice(0, 3)));
        check(`round ${i + 1}: the round's own cards are the ones listed (${rounds[i].ids.slice(0, 3).join(", ")}…)`, P.links.every((l) => rounds[i].ids.includes(l.card)));
      }
      check(`round ${i + 1}: a way to continue is in the panel (${P.nextText}), and a way to put it away`, !!P.next && !!P.close && P.next.h >= 40 && /Next round|See your score/.test(P.nextText), JSON.stringify({ next: P.next, close: P.close }));
      if (SHOTS) { try { fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, `findit-learn-${i + 1}-desktop.png`) }); } catch (e) {} }
      if (i === 1) {   // close puts the panel away and leaves the board; Escape does the same
        await page.click(".fi2-reveal-close"); await sleep(200);
        check("the close button puts the panel away (the board and the Next button stay)", await page.isHidden("#fiReveal") && !(await page.isHidden("#mgNext")));
      }
      if (i === 2) {
        const before = (await stateOf(page)).round;
        await page.focus("#fi2Board"); await page.keyboard.press("Escape"); await sleep(200);
        check("Escape puts the panel away too", await page.isHidden("#fiReveal") && (await stateOf(page)).round === before);
      }
      if (i < 4) {   // continue from the PANEL's own button (rounds 1, 3, 4) or the Next under the question (round 2): both go on
        const before = (await stateOf(page)).round;
        if (i === 1 || i === 2) await page.click("#mgNext"); else await page.click(".fi2-reveal-next");
        await sleep(900);
        const after = await stateOf(page);
        check(`round ${i + 1}: ${i === 1 || i === 2 ? "Next" : "the panel's Next"} moves on to the next round and the panel is gone`, after.round !== before && await page.isHidden("#fiReveal"), before + " → " + after.round);
      }
    }
    check("the last round's panel offers \"See your score\", and it ends the day with a score", /See your score/.test(panels[4].nextText));
    await page.click(".fi2-reveal-next"); await sleep(900);
    check("...the score line shows", /\d+ \/ 5\s*found|found/.test((await stateOf(page)).q), (await stateOf(page)).q);
    await ctx.close();
  }

  console.log("\n\x1b[1m2b) a place with many cards: the place card's list caps at its cap and grows\x1b[0m\n");
  {
    const { ctx, page } = await open(browser);
    // twelve real cards of one collection stand in for a busy place (the day's own places each carry one)
    const res = await page.evaluate(() => {
      const h = [...document.querySelectorAll("*")].find((e) => e._finditApi), api = h._finditApi;
      const ids = window.CARD_DATA.filter((c) => /^wh-/.test(c.id)).slice(0, 12).map((c) => c.id);
      api.panel({ kind: "point", n: "A busy place", ids, lon: 0, lat: 0 });
      const rv = document.getElementById("fiReveal");
      return { n: rv.querySelectorAll(".fi2-learn-card").length, more: (rv.querySelector(".fi2-learn-more") || {}).textContent || "", cap: window.AtlasStudy.LIST_CAP, shown: !rv.hidden };
    });
    check(`twelve cards: the list shows the place card's cap (${res.cap}) and offers the other ${12 - res.cap} ("${res.more}")`, res.shown && res.n === res.cap && res.more === "and " + (12 - res.cap) + " more", JSON.stringify(res));
    await page.click(".fi2-learn-more"); await sleep(150);
    const after = await page.evaluate(() => ({ n: document.querySelectorAll("#fiReveal .fi2-learn-card").length, more: !!document.querySelector("#fiReveal .fi2-learn-more"), nextVisible: !!document.querySelector("#fiReveal .fi2-reveal-next") }));
    check("\"and N more\" lists them all and the button goes", after.n === 12 && !after.more && after.nextVisible, JSON.stringify(after));
    await ctx.close();
  }

  console.log("\n\x1b[1m3) a phone: the panel sits inside the screen and its buttons are a thumb's size\x1b[0m\n");
  {
    const { ctx, page } = await open(browser, { width: 390, height: 844, mobile: true });
    for (let i = 0; i < 2; i++) {
      await playRound(page, "#fi2Board");
      const P = await page.evaluate(() => { const rv = document.getElementById("fiReveal"), b = rv.getBoundingClientRect(), bx = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return { w: r.width, h: r.height, in: r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight }; }; return { shown: !rv.hidden, in: b.left >= 0 && b.right <= innerWidth && b.top >= 0 && b.bottom <= innerHeight, next: bx(rv.querySelector(".fi2-reveal-next")), close: bx(rv.querySelector(".fi2-reveal-close")), h: b.height, vh: innerHeight }; });
      check(`phone, round ${i + 1}: the panel is inside the screen (${Math.round(P.h)} of ${P.vh} px high), Next at least 44 px tall and wholly on screen, close at least 30 px`, P.shown && P.in && P.next && P.next.h >= 44 && P.next.in && P.close && P.close.w >= 30 && P.close.in, JSON.stringify(P));
      if (SHOTS) { try { await page.screenshot({ path: path.join(SHOTS, `findit-learn-${i + 1}-phone.png`) }); } catch (e) {} }
      await page.click(".fi2-reveal-next"); await sleep(900);
    }
    await ctx.close();
  }

  check("no console or page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  await browser.close(); server.close();
  console.log(`\n${pass} ok, ${fail} failed\n`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
