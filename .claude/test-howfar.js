/* test-howfar.js — How far?, the distance minigame (2026-10-30, on request). Playwright, headless Chromium.

     NODE_PATH=<playwright>/node_modules node .claude/test-howfar.js     (HF_SHOTS=<dir> also writes screenshots)

   What it guards (docs/minigames.md "How far?"):
   · the day deals FIVE rounds, the same for every reader, one per distance band, two different places each;
   · a guess within 10 % of the great-circle distance wins the round and one outside it loses it — exactly at the edges (+9.5 %, −11 %);
   · an empty guess is refused, not scored;
   · a round answered stays answered: a reload resumes at the next round with the score kept;
   · the end writes S.games.howfar (played, s, n), clears the progress and locks the game for the day;
   · a reader on imperial units guesses in miles and is judged on the same ratio;
   · the home grid has the tile, and the page lays out at phone width without a horizontal scroll. */
"use strict";
const path = require("path");
const http = require("http");
const fs = require("fs");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");

const ROOT = path.join(__dirname, "..");
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".bin": "application/octet-stream" };
const SHOTS = process.env.HF_SHOTS || "";
let pass = 0, fail = 0;
function check(name, ok, extra) {
  if (ok) { pass++; console.log("ok    " + name + (extra ? "  " + extra : "")); }
  else { fail++; console.log("FAIL  " + name + (extra ? "  " + extra : "")); }
}
function serve() {
  const s = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p === "/") p = "/index.html";
    const f = path.join(ROOT, p);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end("not found"); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise((r) => s.listen(0, () => r([s, "http://127.0.0.1:" + s.address().port])));
}

(async () => {
  const [server, base] = await serve();
  const browser = await chromium.launch();
  const errors = [];
  async function open(vp, init) {
    const ctx = await browser.newContext({ viewport: vp || { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => { if (!isNoise(String(e))) errors.push(String(e)); });
    if (init) await page.addInitScript(init);
    return [ctx, page];
  }
  const ready = (page) => page.waitForFunction(() => { const g = document.querySelector("#hfGame"); return g && !g.hidden && document.querySelector("#hfRound").textContent; }, null, { timeout: 90000 });
  const api = (page, expr) => page.evaluate("(() => { const a = document.querySelector('#howfar').parentElement._howfarApi; return " + expr + "; })()");
  const state = (page) => page.evaluate(() => ({ round: document.querySelector("#hfRound").textContent, score: document.querySelector("#hfScore").textContent, q: document.querySelector("#hfQ").textContent, fb: document.querySelector("#hfFb").hidden ? "" : document.querySelector("#hfFb").textContent, next: document.querySelector("#hfNext").hidden ? "" : document.querySelector("#hfNext").textContent }));
  async function guess(page, v) { await page.fill("#hfIn", String(v)); await page.click("#hfGo"); await page.waitForTimeout(120); return state(page); }
  const shot = async (page, name) => { if (SHOTS) { await page.waitForTimeout(1500); await page.screenshot({ path: path.join(SHOTS, name + ".png") }); } };

  try {
    // ---- 1. the deal ----
    const [ctx, page] = await open();
    await page.goto(base + "#howfar", { waitUntil: "load" });
    await ready(page);
    const rounds = await api(page, "a.rounds()");
    check("[deal] five rounds", rounds.length === 5, JSON.stringify(rounds.map((r) => r.a + "→" + r.b)));
    const BANDS = [[300, 1500], [1500, 3500], [3500, 6000], [6000, 9000], [9000, 12500]];
    check("[deal] one round per distance band, shortest first", rounds.every((r, i) => r.km >= BANDS[i][0] && r.km <= BANDS[i][1]), rounds.map((r) => Math.round(r.km)).join(", "));
    const names = rounds.flatMap((r) => [r.a, r.b]);
    check("[deal] ten different places", new Set(names).size === 10, names.join(", "));
    let st = await state(page);
    check("[round] the question names both places", st.q.indexOf(rounds[0].a) >= 0 && st.q.indexOf(rounds[0].b) >= 0 && /straight line/.test(st.q), st.q);
    check("[round] Round 1 / 5, 0 won", st.round === "Round 1 / 5" && st.score === "0 won", st.round + " · " + st.score);
    await shot(page, "howfar-desktop-round");

    // ---- 2. the judging ----
    st = await guess(page, "");
    check("[judge] an empty guess is refused, not scored", /Type a distance/.test(st.fb) && !st.next, st.fb);
    st = await guess(page, Math.round(rounds[0].km));
    check("[judge] the exact distance wins", /round won/.test(st.fb) && st.score === "1 won" && st.next === "Next round", st.fb);
    await shot(page, "howfar-desktop-reveal");
    await page.click("#hfNext"); await page.waitForTimeout(150);
    st = await guess(page, Math.round(rounds[1].km * 1.25));
    check("[judge] 25 % over loses", /round lost/.test(st.fb) && /25% over/.test(st.fb) && st.score === "1 won", st.fb);

    // ---- 3. a round answered stays answered ----
    await page.reload({ waitUntil: "load" });
    await ready(page);
    st = await state(page);
    check("[resume] a reload resumes at round 3 with the score kept", st.round === "Round 3 / 5" && st.score === "1 won", st.round + " · " + st.score);
    st = await guess(page, Math.round(rounds[2].km * 1.095));
    check("[judge] 9.5 % over is inside the margin", /round won/.test(st.fb), st.fb);
    await page.click("#hfNext"); await page.waitForTimeout(150);
    st = await guess(page, Math.round(rounds[3].km * 0.89));
    check("[judge] 11 % under is outside it", /round lost/.test(st.fb) && /under/.test(st.fb), st.fb);
    await page.click("#hfNext"); await page.waitForTimeout(150);
    st = await guess(page, Math.round(rounds[4].km));
    check("[judge] the last round", /round won/.test(st.fb) && st.next === "See your score", st.fb);
    await shot(page, "howfar-desktop-long");
    await page.click("#hfNext"); await page.waitForTimeout(300);
    st = await state(page);
    check("[end] 3 / 5 within 10%", /3 \/ 5/.test(st.q) && st.next === "Back to Home", st.q);
    const g = await page.evaluate(() => JSON.parse(localStorage.getItem("folio_v1") || "{}").games || {});
    check("[end] S.games.howfar records the run and drops the progress", g.howfar && g.howfar.played === true && g.howfar.s === 3 && g.howfar.n === 5 && !g.howfar.prog && g.howfar.won === false, JSON.stringify(g.howfar));
    await page.reload({ waitUntil: "load" }); await page.waitForTimeout(1200);
    const locked = await page.evaluate(() => document.body.innerText);
    check("[end] one play a day: the placard", /Played today/.test(locked) && /How far\?/.test(locked), "");
    await ctx.close();

    // ---- 4. imperial ----
    const [c2, p2] = await open(null, () => localStorage.setItem("folio_v1", JSON.stringify({ settings: { units: "imperial" } })));
    await p2.goto(base + "#howfar", { waitUntil: "load" });
    await ready(p2);
    const unit = await p2.evaluate(() => document.querySelector(".hf-unit").textContent);
    check("[imperial] the guess is in miles", unit === "mi", unit);
    const r2 = await api(p2, "a.rounds()");
    let s2 = await guess(p2, Math.round(r2[0].km / 1.609344));
    check("[imperial] the distance in miles wins", /round won/.test(s2.fb) && / mi\b/.test(s2.fb), s2.fb);
    await c2.close();

    // ---- 5. the home tile, and the phone ----
    const [c3, p3] = await open({ width: 390, height: 844 });
    await p3.goto(base, { waitUntil: "load" }); await p3.waitForTimeout(1400);
    const tile = await p3.evaluate(() => { const t = document.getElementById("g-howfar"); return t ? (t.querySelector(".gt-title") || {}).textContent : null; });
    check("[home] a How far? tile", tile === "How far?", String(tile));
    await p3.goto(base + "#howfar", { waitUntil: "load" }); await p3.reload({ waitUntil: "load" });
    await ready(p3);
    const lay = await p3.evaluate(() => { const c = document.querySelector("#hfGame").getBoundingClientRect(), b = document.querySelector("#hfBoard").getBoundingClientRect(); return { docW: document.documentElement.scrollWidth, winW: innerWidth, inside: c.left >= b.left - 1 && c.right <= b.right + 1 && c.bottom <= b.bottom + 1 }; });
    check("[phone] the card inside the board, no horizontal scroll", lay.inside && lay.docW <= lay.winW, JSON.stringify(lay));
    await shot(p3, "howfar-phone-round");
    await c3.close();

    check("[page] no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  } catch (e) {
    fail++; console.log("FAIL  threw: " + (e && e.stack || e));
  }
  await browser.close(); server.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
