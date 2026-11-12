/* Look at an Arabic deck the way a reader would: import it through the Studio, add it, study it, and read
   what is actually on the rendered card.  The fault this collection turns on is quiet: Arabic laid out LEFT
   TO RIGHT.  It still shows every letter, joined correctly, and reads wrong — a sentence's words in reverse
   order, the speaker on the wrong side.  It happens if the sanitizer ever drops `dir` (it is in the "*" set of
   SANITIZE_ATTRS today), so this asserts the COMPUTED direction of the headword and of a sentence.

     node .claude/arabic/render-arabic.js [a1|a2|b1|b2|alphabet] [screenshot-dir]

   Screenshots go to <screenshot-dir>/arabic-<deck>-back.png (default: the OS temp dir). */
"use strict";
const { chromium } = require("playwright");
const path = require("path"), http = require("http"), fs = require("fs"), os = require("os");
const ROOT = path.resolve(__dirname, "..", "..");
const WHICH = (process.argv[2] || "a1").toLowerCase();
const OUT = process.argv[3] || os.tmpdir();
const ABC = WHICH === "alphabet";
const DECK = (ABC ? "Arabic-Alphabet" : "Arabic-" + WHICH.toUpperCase()) + ".folio-deck.json";
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
               ".json": "application/json", ".svg": "image/svg+xml" };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]));
  fs.readFile(p, (e, b) => {
    if (e) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { "Content-Type": MIME[path.extname(p)] || "application/octet-stream" });
    res.end(b);
  });
});
let fails = 0, checks = 0;
const ok = (c, m, extra) => {
  checks++;
  if (!c) { fails++; console.log("   ✗ " + m + (extra ? "   " + extra : "")); }
  else console.log("   ✓ " + m + (extra ? "   " + extra : ""));
};

(async () => {
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port + "/index.html";
  const browser = await chromium.launch(process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {});
  const pg = await browser.newPage({ viewport: { width: 1100, height: 900 }, reducedMotion: "reduce" });
  const errs = [];
  pg.on("pageerror", (e) => errs.push(e.message));
  await pg.route("**/lang-decks.js", (r) => r.fulfill({ contentType: "text/javascript", body: "window.LANG_DECKS = [];" }));
  await pg.addInitScript(() => {
    try {
      const s = JSON.parse(localStorage.getItem("folio_v1") || "{}");
      s.settings = Object.assign({}, s.settings, { newPerDay: 60, maxReviewsPerDay: 200 });
      localStorage.setItem("folio_v1", JSON.stringify(s));
    } catch (e) {}
  });
  await pg.goto(base + "#studio", { waitUntil: "load" });
  await pg.waitForTimeout(400);
  const chooser = pg.waitForEvent("filechooser");
  await pg.click("#stImport");
  (await chooser).setFiles(path.join(ROOT, "decks", DECK));
  await pg.waitForSelector(".studio-deck", { timeout: 240000 });
  await pg.goto(base + "#decks", { waitUntil: "load" });
  await pg.waitForTimeout(600);
  await pg.click("[data-uadd]");
  await pg.waitForTimeout(500);
  await pg.setViewportSize({ width: 420, height: 900 });
  await pg.goto(base + "#home", { waitUntil: "load" });
  await pg.waitForTimeout(700);
  await pg.evaluate(() => { const b = document.querySelector(".active-deck[data-review]"); if (b) b.click(); });
  await pg.waitForTimeout(900);
  await pg.evaluate(() => { const b = document.querySelector("#opSkip"); if (b) b.click(); });
  await pg.waitForSelector("#reveal-btn", { timeout: 20000 });
  await pg.waitForTimeout(400);

  let back = null;
  for (let step = 0; step < 60; step++) {
    await pg.evaluate(() => { const r = document.querySelector("#reveal-btn"); if (r) r.click(); });
    await pg.waitForTimeout(300);
    back = await pg.evaluate(() => {
      const all = [...document.querySelectorAll(".uc-card")];
      const b = all[all.length - 1] || document;
      const dir = (s) => { const e = b.querySelector(s); return e ? getComputedStyle(e).direction : ""; };
      const t = (s) => { const e = b.querySelector(s); return e ? e.textContent.trim() : ""; };
      return { word: t(".uc-word, .uc-letter"), wordDir: dir(".uc-word, .uc-letter"), exDir: dir(".uc-exz"),
               rom: t(".uc-rom"), meaning: t(".uc-gl"), table: b.querySelectorAll(".uc-cjr").length,
               ex: b.querySelectorAll(".uc-exz").length, speaker: !!b.querySelector(".uc-tts"),
               ask: !!b.querySelector(".uc-ask"), shapes: b.querySelectorAll(".uc-shf").length };
    });
    if (ABC ? (back.shapes >= 4 && !back.ask) : (back.table && back.ex && !back.ask)) break;
    await pg.evaluate(() => document.querySelector(".grade[data-g='easy']").click());
    await pg.waitForTimeout(300);
  }
  console.log("   back: " + back.word + " — " + back.rom + " — " + back.meaning.slice(0, 50));
  ok(back.word.length > 0, "the headword is on the card");
  ok(back.wordDir === "rtl", "THE HEADWORD IS LAID OUT RIGHT TO LEFT after import", back.wordDir);
  ok(back.speaker, "a speaker is on the card");
  ok(back.rom.length > 0, "the romanisation is on the back");
  if (ABC) ok(back.shapes >= 4, "the four shapes are drawn", String(back.shapes));
  else {
    ok(back.exDir === "rtl", "AN EXAMPLE SENTENCE IS LAID OUT RIGHT TO LEFT", back.exDir);
    ok(back.table >= 16, "a verb's past and present table is on the back", String(back.table));
  }
  await pg.evaluate(() => {
    document.querySelectorAll(".ach-pop, .toast, .modal-backdrop").forEach((e) => e.remove());
    document.querySelectorAll(".uc-fold").forEach((d) => { d.open = true; });
  });
  await pg.waitForTimeout(200);
  const shot = path.join(OUT, "arabic-" + WHICH + "-back.png");
  await pg.screenshot({ path: shot, fullPage: true });
  console.log("   screenshot " + shot);
  ok(errs.length === 0, "no uncaught page errors", errs.join(" | "));
  await browser.close();
  server.close();
  console.log("\n" + (checks - fails) + " passed, " + fails + " failed");
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
