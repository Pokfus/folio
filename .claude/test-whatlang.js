/* test-whatlang.js — What language?, the name-the-language minigame (2026-11-09, on request). Playwright, headless Chromium.

     NODE_PATH=<playwright>/node_modules node .claude/test-whatlang.js     (WL_SHOTS=<dir> also writes screenshots)

   What it guards (docs/minigames.md "What language?"):
   · the pool: 200 languages, each with a passage, a family and a branch (in Node, through the builder's --verify);
   · the decoys, for EVERY language in the pool: three, all different, never the answer, never one of its `near` twins, and
     drawn from its own branch/family first — a language with three or more relations in its family gets three of them (or its hand-picked `like`);
   · the day deals FIVE different passages with four options each, the answer among them;
   · a right choice is marked correct and a wrong one wrong, the reveal names the language, its family and the English
     meaning, and carries two sources;
   · a round answered stays answered: a reload resumes at the next round;
   · the end writes S.games.whatlang (played, s, n), clears the progress and locks the game for the day;
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
const SHOTS = process.env.WL_SHOTS || "";
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
  const ready = (page) => page.waitForSelector(".wl-passage", { timeout: 30000 });
  const api = (page) => page.evaluate(() => { const a = document.querySelector(".wl-game").parentElement._wlApi; return { answers: a.answers(), options: a.options() }; });
  const head = (page) => page.evaluate(() => document.querySelector(".page-head h1").textContent.replace(/\s+/g, " ").trim());
  const shot = async (page, name) => { if (SHOTS) { await page.waitForTimeout(300); await page.screenshot({ path: path.join(SHOTS, name + ".png"), fullPage: true }); } };
  const pick = async (page, id) => { await page.click('#opts .opt[data-lang="' + id + '"]'); await page.waitForSelector("#reveal:not([hidden])"); };
  const next = async (page) => { await page.click("#wl-next"); await page.waitForTimeout(120); };

  try {
    // ---- 0. the pool, in Node ----
    const v = cp.spawnSync(process.execPath, [path.join(__dirname, "build-whatlang.js"), "--verify"], { encoding: "utf8" });
    check("[pool] build-whatlang --verify passes", v.status === 0, (v.stdout + v.stderr).trim().split("\n").pop());
    const win = {}; new Function("window", fs.readFileSync(path.join(ROOT, "whatlang.js"), "utf8"))(win);
    const POOL = (win.WHATLANG && win.WHATLANG.langs) || [];
    const byId = new Map(POOL.map((l) => [l.id, l]));

    // ---- 1. the decoys of every language, through the page's own function ----
    const [ctx, page] = await open();
    await page.goto(base + "#whatlang", { waitUntil: "load" });
    await ready(page);
    const decoyFaults = [];
    const relations = (l) => POOL.filter((o) => o.id !== l.id && o.family === l.family && !(l.near || []).includes(o.id) && !(o.near || []).includes(l.id));
    const dealt = await page.evaluate(() => { const a = document.querySelector(".wl-game").parentElement._wlApi; return a.decoysAll ? a.decoysAll() : null; });
    if (!dealt) check("[decoys] the page exposes its dealer for the test", false, "_wlApi.decoysAll missing");
    else {
      for (const l of POOL) {
        const d = dealt[l.id] || [];
        const fam = relations(l).length;
        if (d.length !== 3) decoyFaults.push(l.id + ": " + d.length + " decoys");
        else if (new Set(d).size !== 3 || d.includes(l.id)) decoyFaults.push(l.id + ": duplicate or self");
        else if (d.some((x) => (l.near || []).includes(x))) decoyFaults.push(l.id + ": a near twin offered");
        else if (d.some((x) => !byId.has(x))) decoyFaults.push(l.id + ": unknown id");
        else if (fam >= 3 && d.some((x) => byId.get(x).family !== l.family && !(l.like || []).includes(x))) decoyFaults.push(l.id + ": has " + fam + " relations but was dealt " + d.filter((x) => byId.get(x).family !== l.family).join(","));
      }
      check("[decoys] every language gets three valid decoys, its own family first", decoyFaults.length === 0, decoyFaults.slice(0, 5).join(" | "));
      const hi = dealt.hi || [];
      check("[decoys] Hindi is set against Devanagari Indo-Aryan languages", hi.every((x) => byId.get(x).branch === "Indo-Aryan" && byId.get(x).script === "Devanagari"), hi.join(","));
      const sw = dealt.sw || [];
      check("[decoys] Swahili is set against Bantu languages", sw.every((x) => byId.get(x).branch === "Bantu"), sw.join(","));
    }

    // ---- 2. the deal ----
    const { answers, options } = await api(page);
    check("[deal] five different passages", answers.length === 5 && new Set(answers).size === 5, answers.join(","));
    check("[deal] four different options each, the answer among them", options.every((o, k) => o.length === 4 && new Set(o).size === 4 && o.includes(answers[k])), JSON.stringify(options));
    check("[round] Passage 1 / 5", (await head(page)) === "Passage 1 / 5");
    const pass1 = await page.evaluate(() => { const b = document.querySelector(".wl-passage"); return { text: b.textContent, lang: b.getAttribute("lang"), verbatim: b.classList.contains("verbatim") }; });
    check("[round] the passage is the pool's text, verbatim, with no lang attribute", pass1.text === byId.get(answers[0]).text && pass1.lang === null && pass1.verbatim);
    await shot(page, "wl-desktop-round");

    // ---- 3. right and wrong ----
    await pick(page, answers[0]);
    let rv = await page.evaluate(() => { const r = document.querySelector("#reveal"); return { verdict: r.querySelector(".tf-verdict").textContent, fam: (r.querySelector(".wl-family") || {}).textContent || "", why: r.querySelector(".tf-why").textContent, srcs: r.querySelectorAll(".src-item").length, correct: [...document.querySelectorAll("#opts .opt.correct")].map((b) => b.dataset.lang), disabled: [...document.querySelectorAll("#opts .opt")].every((b) => b.disabled) }; });
    check("[reveal] a right choice: Correct, the name, the family", /^Correct/.test(rv.verdict) && rv.verdict.indexOf(byId.get(answers[0]).name) >= 0 && rv.fam.indexOf(byId.get(answers[0]).family) >= 0, rv.verdict + " / " + rv.fam);
    check("[reveal] the English meaning and two sources", /All human beings are born free/.test(rv.why) && rv.srcs >= 2, rv.srcs + " sources");
    check("[reveal] the options lock, the answer marked", rv.disabled && rv.correct.length === 1 && rv.correct[0] === answers[0]);
    await shot(page, "wl-desktop-reveal");
    await next(page);
    check("[round] Passage 2 / 5", (await head(page)) === "Passage 2 / 5");
    const wrong = options[1].find((x) => x !== answers[1]);
    await pick(page, wrong);
    rv = await page.evaluate(() => ({ verdict: document.querySelector("#reveal .tf-verdict").textContent, wrong: [...document.querySelectorAll("#opts .opt.wrong")].map((b) => b.dataset.lang), correct: [...document.querySelectorAll("#opts .opt.correct")].map((b) => b.dataset.lang) }));
    check("[reveal] a wrong choice: Not quite, it marked wrong and the answer marked correct", /^Not quite/.test(rv.verdict) && rv.wrong[0] === wrong && rv.correct[0] === answers[1], JSON.stringify(rv));

    // ---- 4. a round answered stays answered ----
    await page.reload({ waitUntil: "load" });
    await ready(page);
    check("[resume] a reload resumes at passage 3", (await head(page)) === "Passage 3 / 5", await head(page));
    const pips = await page.evaluate(() => [...document.querySelectorAll(".tf-pip")].map((x) => x.className.replace("tf-pip", "").trim()));
    check("[resume] the pips keep the first two results", pips[0] === "ok" && pips[1] === "no" && pips[2] === "cur", pips.join(","));
    for (let k = 2; k < 5; k++) {
      await pick(page, answers[k]);
      if (k === 4) check("[round] the last says See results", (await page.textContent("#wl-next")) === "See results");
      await next(page);
    }
    check("[end] 4 / 5", (await head(page)) === "You scored 4 / 5", await head(page));
    const rows = await page.evaluate(() => document.querySelectorAll(".tf-sum-row").length);
    check("[end] the summary lists the five passages", rows === 5, String(rows));
    await shot(page, "wl-desktop-end");
    const g = await page.evaluate(() => JSON.parse(localStorage.getItem("folio_v1") || "{}").games || {});
    check("[end] S.games.whatlang records the run and drops the progress", g.whatlang && g.whatlang.played === true && g.whatlang.s === 4 && g.whatlang.n === 5 && !g.whatlang.prog && g.whatlang.won === false, JSON.stringify(g.whatlang));
    await page.reload({ waitUntil: "load" }); await page.waitForTimeout(900);
    const locked = await page.evaluate(() => document.body.innerText);
    check("[end] one play a day: the placard", /Played today/.test(locked) && /What language\?/.test(locked));
    await ctx.close();

    // ---- 5. the home tile, and the phone ----
    const [c3, p3] = await open({ width: 390, height: 844 });
    await p3.goto(base, { waitUntil: "load" }); await p3.waitForTimeout(1400);
    const tile = await p3.evaluate(() => { const t = document.getElementById("g-whatlang"); return t ? (t.querySelector(".gt-title") || {}).textContent : null; });
    check("[home] a What language? tile", tile === "What language?", String(tile));
    await p3.goto(base + "#whatlang", { waitUntil: "load" }); await p3.reload({ waitUntil: "load" });
    await ready(p3);
    const lay = await p3.evaluate(() => ({ docW: document.documentElement.scrollWidth, winW: innerWidth }));
    check("[phone] no horizontal scroll", lay.docW <= lay.winW, JSON.stringify(lay));
    await shot(p3, "wl-phone-round");
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
