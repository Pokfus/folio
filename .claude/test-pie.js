/* test-pie.js — What share?, the pie-chart percentage minigame (2026-10-31, on request). Playwright, headless Chromium.

     NODE_PATH=<playwright>/node_modules node .claude/test-pie.js     (PIE_SHOTS=<dir> also writes screenshots)

   What it guards (docs/minigames.md "What share?"):
   · the day deals FIVE different questions, the same for every reader (`dayPick`);
   · a drag on the pie sets the slice from twelve o'clock clockwise to the pointer, and never wraps past the top;
   · the keyboard drives it (role="slider": Home, End, arrows, Page Up/Down);
   · a guess within 10 percentage points wins the round and one outside loses it — exactly at the edges (±10 wins, ±11 loses);
   · the reveal names the answer, prints the guess green on a win and red on a loss, and carries the explanation and at least two sources;
   · a round answered stays answered: a reload resumes at the next round with the score kept;
   · the end writes S.games.pie (played, s, n), clears the progress and locks the game for the day;
   · the home grid has the tile, and the page lays out at phone width without a horizontal scroll. */
"use strict";
const path = require("path");
const http = require("http");
const fs = require("fs");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");

const ROOT = path.join(__dirname, "..");
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".bin": "application/octet-stream" };
const SHOTS = process.env.PIE_SHOTS || "";
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
  async function open(vp) {
    const ctx = await browser.newContext({ viewport: vp || { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => { if (!isNoise(String(e))) errors.push(String(e)); });
    return [ctx, page];
  }
  const ready = (page) => page.waitForSelector("#pieChart", { timeout: 30000 });
  const answers = (page) => page.evaluate(() => document.querySelector("#pieChart").closest(".pie-game").parentElement._pieApi.answers());
  const read = (page) => page.evaluate(() => ({ val: document.querySelector("#pieRead").textContent, aria: document.querySelector("#pieChart").getAttribute("aria-valuenow"), round: document.querySelector(".page-head h1").textContent.replace(/\s+/g, " ").trim() }));
  async function pointAt(page, pct, rFrac) {
    const b = await page.evaluate(() => { const r = document.querySelector("#pieChart").getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, r: r.width / 2 }; });
    const a = (pct / 100) * Math.PI * 2, rr = b.r * (rFrac || 0.6);
    return { x: b.x + rr * Math.sin(a), y: b.y - rr * Math.cos(a) };
  }
  async function setKeys(page, v) {
    await page.focus("#pieChart");
    await page.keyboard.press("Home");
    for (let i = 0; i < Math.floor(v / 10); i++) await page.keyboard.press("PageUp");
    for (let i = 0; i < v % 10; i++) await page.keyboard.press("ArrowRight");
  }
  const reveal = (page) => page.evaluate(() => {
    const rv = document.querySelector("#pieReveal"), g = rv && rv.querySelector(".pie-guess"), cs = getComputedStyle(document.body);
    return rv && !rv.hidden ? { verdict: rv.querySelector(".tf-verdict").textContent, cls: g && g.className, col: g && getComputedStyle(g).color, good: cs.getPropertyValue("--good").trim(), zh: cs.getPropertyValue("--zh").trim(),
      why: (rv.querySelector(".tf-why") || {}).textContent || "", srcs: rv.querySelectorAll(".src-item").length, next: (rv.querySelector("#pieNextRound") || {}).textContent } : null;
  });
  const hex = (h) => { const n = parseInt(h.replace("#", ""), 16); return "rgb(" + ((n >> 16) & 255) + ", " + ((n >> 8) & 255) + ", " + (n & 255) + ")"; };
  const shot = async (page, name) => { if (SHOTS) { await page.waitForTimeout(300); await page.screenshot({ path: path.join(SHOTS, name + ".png"), fullPage: true }); } };

  try {
    // ---- 0. the pool, in Node: every question answerable and sourced twice ----
    const win = {}; new Function("window", fs.readFileSync(path.join(ROOT, "pie.js"), "utf8"))(win);
    const POOL = win.PIE_QUESTIONS || [];
    check("[pool] at least five questions", POOL.length >= 5, POOL.length + " questions");

    // ---- 1. the deal ----
    const [ctx, page] = await open();
    await page.goto(base + "#pie", { waitUntil: "load" });
    await ready(page);
    const ans = await answers(page);
    const qs = await page.evaluate(() => document.querySelector(".qtext").textContent);
    check("[deal] five answers, each a whole per cent", ans.length === 5 && ans.every((a) => Number.isInteger(a) && a >= 2 && a <= 98), JSON.stringify(ans));
    check("[round] Round 1 / 5 and a question", (await read(page)).round === "Round 1 / 5" && /\?$/.test(qs.trim()), qs);
    check("[round] the slice starts at 50%", (await read(page)).val === "50%");
    await shot(page, "pie-desktop-round");

    // ---- 2. the drag ----
    let p = await pointAt(page, 25);
    await page.mouse.move(p.x, p.y); await page.mouse.down();
    check("[drag] a press at three o'clock is 25%", (await read(page)).val === "25%", (await read(page)).val);
    p = await pointAt(page, 50); await page.mouse.move(p.x, p.y, { steps: 6 });
    check("[drag] dragged to six o'clock is 50%", (await read(page)).val === "50%", (await read(page)).val);
    p = await pointAt(page, 90); await page.mouse.move(p.x, p.y, { steps: 8 });
    p = await pointAt(page, 5); await page.mouse.move(p.x, p.y, { steps: 4 });
    check("[drag] over twelve o'clock it stops at 100%, never wraps", (await read(page)).val === "100%", (await read(page)).val);
    await page.mouse.up();
    p = await pointAt(page, 10); await page.mouse.click(p.x, p.y);
    check("[drag] a fresh press after 100% is taken where it lands", (await read(page)).val === "10%", (await read(page)).val);

    // ---- 3. the keyboard and the judging ----
    const edge = (a, d) => (a + d <= 100 && a + d >= 0 ? a + d : a - d);
    await setKeys(page, edge(ans[0], 10));
    const r0 = await read(page);
    check("[keys] Home, Page Up and arrows set the slice", r0.val === edge(ans[0], 10) + "%" && r0.aria === String(edge(ans[0], 10)), r0.val);
    await page.click("#pieLock");
    let rv = await reveal(page);
    check("[judge] 10 points off is inside the margin", !!rv && /^Within the margin/.test(rv.verdict) && rv.verdict.indexOf(ans[0] + "%") >= 0, rv && rv.verdict);
    check("[reveal] the guess is green on a win (--good)", !!rv && rv.cls === "pie-guess ok" && rv.col === hex(rv.good), rv && rv.col);
    check("[reveal] an explanation and at least two sources", !!rv && rv.why.length > 40 && rv.srcs >= 2, rv && rv.srcs + " sources");
    check("[reveal] the slice is locked", await page.evaluate(() => document.querySelector("#pieChart").classList.contains("locked") && !document.querySelector("#pieLock")));
    await shot(page, "pie-desktop-reveal");
    await page.click("#pieNextRound"); await page.waitForTimeout(100);
    check("[round] Round 2 / 5", (await read(page)).round === "Round 2 / 5");
    await setKeys(page, edge(ans[1], 11));
    await page.keyboard.press("Enter");
    rv = await reveal(page);
    check("[judge] 11 points off is outside it", !!rv && /^Not quite/.test(rv.verdict) && /11 points (over|under)/.test(rv.verdict), rv && rv.verdict);
    check("[reveal] the guess is red on a loss (--zh)", !!rv && rv.cls === "pie-guess no" && rv.col === hex(rv.zh), rv && rv.col);

    // ---- 4. a round answered stays answered ----
    await page.reload({ waitUntil: "load" });
    await ready(page);
    check("[resume] a reload resumes at round 3", (await read(page)).round === "Round 3 / 5", (await read(page)).round);
    const pips = await page.evaluate(() => [...document.querySelectorAll(".tf-pip")].map((x) => x.className.replace("tf-pip", "").trim()));
    check("[resume] the pips keep the first two results", pips[0] === "ok" && pips[1] === "no" && pips[2] === "cur", pips.join(","));
    for (let k = 2; k < 5; k++) {
      await setKeys(page, ans[k]);
      await page.click("#pieLock");
      rv = await reveal(page);
      if (k === 4) check("[judge] the last round says See results", !!rv && rv.next === "See results", rv && rv.next);
      await page.click("#pieNextRound"); await page.waitForTimeout(150);
    }
    const end = await page.evaluate(() => document.querySelector(".page-head h1").textContent.replace(/\s+/g, " ").trim());
    check("[end] 4 / 5", end === "You scored 4 / 5", end);
    const sumSrc = await page.evaluate(() => [...document.querySelectorAll(".tf-sum-row")].map((r) => r.querySelectorAll(".src-item").length));
    check("[end] the summary lists five questions, each with its sources", sumSrc.length === 5 && sumSrc.every((n) => n >= 2), sumSrc.join(","));
    await shot(page, "pie-desktop-end");
    const g = await page.evaluate(() => JSON.parse(localStorage.getItem("folio_v1") || "{}").games || {});
    check("[end] S.games.pie records the run and drops the progress", g.pie && g.pie.played === true && g.pie.s === 4 && g.pie.n === 5 && !g.pie.prog && g.pie.won === false, JSON.stringify(g.pie));
    await page.reload({ waitUntil: "load" }); await page.waitForTimeout(900);
    const locked = await page.evaluate(() => document.body.innerText);
    check("[end] one play a day: the placard", /Played today/.test(locked) && /What share\?/.test(locked));
    await ctx.close();

    // ---- 5. the home tile, and the phone ----
    const [c3, p3] = await open({ width: 390, height: 844 });
    await p3.goto(base, { waitUntil: "load" }); await p3.waitForTimeout(1400);
    const tile = await p3.evaluate(() => { const t = document.getElementById("g-pie"); return t ? (t.querySelector(".gt-title") || {}).textContent : null; });
    check("[home] a What share? tile", tile === "What share?", String(tile));
    await p3.goto(base + "#pie", { waitUntil: "load" }); await p3.reload({ waitUntil: "load" });
    await ready(p3);
    const lay = await p3.evaluate(() => { const c = document.querySelector("#pieChart").getBoundingClientRect(); return { docW: document.documentElement.scrollWidth, winW: innerWidth, w: Math.round(c.width) }; });
    check("[phone] the pie fits, no horizontal scroll", lay.docW <= lay.winW && lay.w >= 200, JSON.stringify(lay));
    await shot(p3, "pie-phone-round");
    await c3.close();

    check("[page] no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
  } catch (e) {
    fail++; console.log("FAIL  threw: " + (e && e.stack || e));
  } finally {
    await browser.close(); server.close();
    console.log("\n" + pass + " passed, " + fail + " failed");
    process.exit(fail ? 1 : 0);
  }
})();
