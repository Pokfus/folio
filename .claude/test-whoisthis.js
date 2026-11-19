/* test-whoisthis.js — Who is this?, the portrait minigame (2026-11-19, on request). Playwright, headless Chromium.

     NODE_PATH=<playwright>/node_modules node .claude/test-whoisthis.js     (WIT_SHOTS=<dir> also writes screenshots)

   What it guards (docs/minigames.md "Who is this?"):
   · the pool: whoisthis.js is what build-whoisthis.js would write (in Node, through --check);
   · the page's pool is that list through gameCardIdSet(), one card per name, every one a `person` card;
   · the decoys, for EVERY answer in the pool: three, all different people, never the answer's own name, every one a `person`
     card the games may deal;
   · the day deals FIVE different people with four options each, the answer among them, and the picture is the card's own;
   · nothing names the answer before the guess (the alt is neutral, the picture is not enlargeable);
   · a right choice is marked correct and a wrong one wrong, the reveal names the person;
   · a round answered stays answered: a reload resumes at the next round;
   · the end writes S.games.whoisthis (played, s, n), clears the progress and locks the game for the day;
   · the home grid has the tile, and the page lays out at phone width without a horizontal scroll. */
"use strict";
const path = require("path");
const http = require("http");
const fs = require("fs");
const cp = require("child_process");
const { chromium } = require("playwright");
const { isNoise } = require("./test-noise.js");

const ROOT = path.join(__dirname, "..");
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".bin": "application/octet-stream" };
const SHOTS = process.env.WIT_SHOTS || "";
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
    const ctx = await browser.newContext({ viewport: vp || { width: 1280, height: 900 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => { if (!isNoise(String(e))) errors.push(String(e)); });
    return [ctx, page];
  }
  const ready = (page) => page.waitForSelector(".wit-game #witOpts .opt", { timeout: 60000 });
  // the page's own dealer, which PAGES.whoisthis hangs on its root for this suite (no eval: the site's CSP forbids it in the page)
  const api = (page) => page.evaluate(() => { const a = document.querySelector(".wit-game").parentElement._witApi; return { answers: a.answers(), options: a.options() }; });
  const head = (page) => page.evaluate(() => document.querySelector(".page-head h1").textContent.replace(/\s+/g, " ").trim());
  const shot = async (page, name) => { if (SHOTS) { await page.waitForTimeout(1200); await page.screenshot({ path: path.join(SHOTS, name + ".png"), fullPage: true }); } };
  const pick = async (page, id) => { await page.click('#witOpts .opt[data-card="' + id + '"]'); await page.waitForSelector("#witReveal:not([hidden])"); };
  const next = async (page) => { await page.click("#wit-next"); await page.waitForTimeout(150); };

  try {
    // ---- 0. the generated list, in Node ----
    const v = cp.spawnSync(process.execPath, [path.join(__dirname, "build-whoisthis.js"), "--check"], { encoding: "utf8" });
    check("[pool] build-whoisthis --check passes", v.status === 0, (v.stdout + v.stderr).trim().split("\n").pop());

    // ---- 1. the pool and the decoys of every answer, through the page's own functions ----
    const [ctx, page] = await open();
    await page.goto(base + "#whoisthis", { waitUntil: "load" });
    await ready(page);
    const P = await page.evaluate(() => { const a = document.querySelector(".wit-game").parentElement._witApi; return { pool: a.pool(), dec: a.decoysAll() }; });
    const facts = await page.evaluate((ids) => {
      // the light half of every card involved, read from data.js's own global
      const by = {}; (window.CARD_DATA || []).forEach((c) => { by[c.id] = c; });
      const o = {}; ids.forEach((id) => { const c = by[id]; o[id] = c ? { name: c.answerText, tags: c.tags || [], d: c.difficulty } : null; });
      return o;
    }, [...new Set(P.pool.concat(...Object.values(P.dec)))]);
    const names = P.pool.map((id) => facts[id] && facts[id].name);
    check("[pool] at least 40 people today", P.pool.length >= 40, P.pool.length + " people");
    check("[pool] one card per name", new Set(names.map((n) => String(n).toLowerCase())).size === names.length);
    check("[pool] every answer is a person card at or below the games' bar", P.pool.every((id) => facts[id] && facts[id].tags.indexOf("person") >= 0 && facts[id].d > 0 && facts[id].d <= 2));
    const faults = [];
    for (const id of P.pool) {
      const d = P.dec[id] || [], nm = String(facts[id].name).toLowerCase();
      const dn = d.map((x) => facts[x] && String(facts[x].name).toLowerCase());
      if (d.length !== 3) faults.push(id + ": " + d.length + " decoys");
      else if (new Set(dn).size !== 3 || dn.indexOf(nm) >= 0) faults.push(id + ": a repeated name or the answer's own");
      else if (d.some((x) => !facts[x] || facts[x].tags.indexOf("person") < 0)) faults.push(id + ": a decoy that is not a person");
    }
    check("[decoys] every answer gets three different people, never its own name", faults.length === 0, faults.slice(0, 5).join(" | "));
    const sameColl = P.pool.filter((id) => (P.dec[id] || []).every((x) => x.split("-")[0] === id.split("-")[0])).length;
    check("[decoys] most answers are set against people of their own collection", sameColl >= P.pool.length * 0.8, sameColl + " of " + P.pool.length);

    // ---- 2. the deal ----
    const { answers, options } = await api(page);
    check("[deal] five different people", answers.length === 5 && new Set(answers).size === 5, answers.join(","));
    check("[deal] four different options each, the answer among them", options.every((o, k) => o.length === 4 && new Set(o).size === 4 && o.includes(answers[k])), JSON.stringify(options));
    check("[round] Portrait 1 / 5", (await head(page)) === "Portrait 1 / 5");
    const fig = await page.evaluate(() => { const f = document.querySelector(".pic-frame"), i = f.querySelector("img"); return { src: i.getAttribute("src"), alt: i.alt, open: f.classList.contains("pic-open"), role: f.getAttribute("role") }; });
    check("[round] the picture is a real URL, its alt names no one, and it does not enlarge yet",
      /^https:\/\//.test(fig.src) && !fig.open && fig.role === null && fig.alt.toLowerCase().indexOf(String(facts[answers[0]] ? facts[answers[0]].name : "").toLowerCase()) < 0, JSON.stringify(fig));
    const before = await page.evaluate(() => document.querySelector(".wit-game").innerText);
    const ansName = (await page.evaluate((id) => document.querySelector('#witOpts .opt[data-card="' + id + '"]').innerText.replace(/^[A-D]\s*/, "").trim(), answers[0]));
    check("[round] the page names the answer only among the options", before.split(ansName).length - 1 === 1, ansName);
    await shot(page, "wit-desktop-round");

    // ---- 3. right and wrong ----
    await pick(page, answers[0]);
    let rv = await page.evaluate(() => { const r = document.querySelector("#witReveal"); return { verdict: r.querySelector(".tf-verdict").textContent, correct: [...document.querySelectorAll("#witOpts .opt.correct")].map((b) => b.dataset.card), disabled: [...document.querySelectorAll("#witOpts .opt")].every((b) => b.disabled), open: document.querySelector(".pic-frame").classList.contains("pic-open") }; });
    check("[reveal] a right choice: Correct and the name", /^Correct/.test(rv.verdict) && rv.verdict.indexOf(ansName) >= 0, rv.verdict);
    check("[reveal] the options lock, the answer marked, the picture now enlarges", rv.disabled && rv.correct.length === 1 && rv.correct[0] === answers[0] && rv.open);
    await shot(page, "wit-desktop-reveal");
    await next(page);
    check("[round] Portrait 2 / 5", (await head(page)) === "Portrait 2 / 5");
    const wrong = options[1].find((x) => x !== answers[1]);
    await pick(page, wrong);
    rv = await page.evaluate(() => ({ verdict: document.querySelector("#witReveal .tf-verdict").textContent, wrong: [...document.querySelectorAll("#witOpts .opt.wrong")].map((b) => b.dataset.card), correct: [...document.querySelectorAll("#witOpts .opt.correct")].map((b) => b.dataset.card) }));
    check("[reveal] a wrong choice: Not quite, it marked wrong and the answer marked correct", /^Not quite/.test(rv.verdict) && rv.wrong[0] === wrong && rv.correct[0] === answers[1], JSON.stringify(rv));

    // ---- 4. a round answered stays answered ----
    await page.reload({ waitUntil: "load" });
    await ready(page);
    check("[resume] a reload resumes at portrait 3", (await head(page)) === "Portrait 3 / 5", await head(page));
    const pips = await page.evaluate(() => [...document.querySelectorAll(".tf-pip")].map((x) => x.className.replace("tf-pip", "").trim()));
    check("[resume] the pips keep the first two results", pips[0] === "ok" && pips[1] === "no" && pips[2] === "cur", pips.join(","));
    for (let k = 2; k < 5; k++) {
      await pick(page, answers[k]);
      if (k === 4) check("[round] the last says See results", (await page.textContent("#wit-next")) === "See results");
      await next(page);
    }
    check("[end] 4 / 5", (await head(page)) === "You scored 4 / 5", await head(page));
    const rows = await page.evaluate(() => document.querySelectorAll(".tf-sum-row").length);
    check("[end] the summary lists the five people", rows === 5, String(rows));
    check("[end] a Share result button", await page.evaluate(() => !!document.querySelector(".gshare-open")));
    await shot(page, "wit-desktop-end");
    const g = await page.evaluate(() => JSON.parse(localStorage.getItem("folio_v1") || "{}").games || {});
    check("[end] S.games.whoisthis records the run and drops the progress", g.whoisthis && g.whoisthis.played === true && g.whoisthis.s === 4 && g.whoisthis.n === 5 && !g.whoisthis.prog && g.whoisthis.won === false, JSON.stringify(g.whoisthis));
    await page.reload({ waitUntil: "load" }); await page.waitForTimeout(900);
    const locked = await page.evaluate(() => document.body.innerText);
    check("[end] one play a day: the placard", /Played today/.test(locked) && /Who is this\?/.test(locked));
    await ctx.close();

    // ---- 5. the home tile, and the phone ----
    const [c3, p3] = await open({ width: 390, height: 844 });
    await p3.goto(base, { waitUntil: "load" }); await p3.waitForTimeout(1400);
    const tile = await p3.evaluate(() => { const t = document.getElementById("g-whoisthis"); return t ? (t.querySelector(".gt-title") || {}).textContent : null; });
    check("[home] a Who is this? tile", tile === "Who is this?", String(tile));
    await p3.goto(base + "#whoisthis", { waitUntil: "load" }); await p3.reload({ waitUntil: "load" });
    await ready(p3);
    const lay = await p3.evaluate(() => ({ docW: document.documentElement.scrollWidth, winW: innerWidth }));
    check("[phone] no horizontal scroll", lay.docW <= lay.winW, JSON.stringify(lay));
    await shot(p3, "wit-phone-round");
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
