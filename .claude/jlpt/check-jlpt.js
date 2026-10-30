/* Look at a Japanese deck the way a reader would: import it through the Studio, add it, study it, and read
   what is actually on the card.  Every fault these decks can have is quiet -- above all the one the whole
   collection turns on: FURIGANA THAT DOES NOT SURVIVE IMPORT.  The deck sanitizer dropped <ruby> until
   Oct 2026, and a deck cleaned by it still reads perfectly: the kanji are there, the reading simply sits
   beside them as a run of kana instead of over them.  So this asserts <rt> elements on the RENDERED card.

     node .claude/jlpt/check-jlpt.js [n5|n4|n3|n2|n1|hiragana|katakana|phrases|idioms]

   The file half runs first: every note has its English, reading and romaji; ids are unique; and across the
   five levels no JMdict entry is carded twice.  Screenshots go to /tmp/jlpt-<deck>-front.png / -back.png. */
"use strict";
const { chromium } = require("playwright");
const path = require("path"), http = require("http"), fs = require("fs");
const ROOT = path.resolve(__dirname, "..", "..");
const WHICH = (process.argv[2] || "n5").toLowerCase();
const FILES = { hiragana: "Japanese-Hiragana", katakana: "Japanese-Katakana",
                phrases: "Japanese-Phrases-and-Expressions", idioms: "Japanese-Idioms" };
const LEVELS = ["n5", "n4", "n3", "n2", "n1"];
const DECK = (FILES[WHICH] || ("JLPT-" + WHICH.toUpperCase() + "-Japanese")) + ".folio-deck.json";
const KANA = !!{ hiragana: 1, katakana: 1 }[WHICH];
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
  else console.log("   ✓ " + m);
};

(async () => {
  // ---------------------------------------------------------------- the file
  const deck = JSON.parse(fs.readFileSync(path.join(ROOT, "decks", DECK), "utf8"));
  const cards = deck.cards;
  console.log(DECK + ": " + cards.length + " notes");
  ok(new Set(cards.map((c) => c.id)).size === cards.length, "every note id is unique");
  ok(Object.values(deck.meta.types)[0].speechLang === "ja-JP", "the card type speaks Japanese");
  if (KANA) {
    ok(cards.every((c) => c.fields.Kana && c.fields.Romaji), "every kana has its romaji");
    const sides = cards.map((c) => c.fields.Romaji + "|" + c.fields.Note);
    ok(new Set(sides).size === sides.length, "every romaji side names one kana");
  } else {
    ok(cards.every((c) => /uc-gl/.test(c.fields.English)), "every note has an English meaning");
    ok(cards.every((c) => c.fields.Reading && c.fields.Romaji), "every note has its reading and romaji");
    ok(new Set(cards.map((c) => c.fields.English)).size === cards.length, "every English side is unique");
    ok(cards.filter((c) => /<ruby>/.test(c.fields.Furigana)).length > cards.length / 2,
       "most headwords carry furigana");
    const withEx = cards.filter((c) => c.fields.Examples).length;
    ok(withEx / cards.length > 0.85, "most notes carry an example sentence", withEx + " of " + cards.length);
    if (LEVELS.includes(WHICH)) {
      const seen = new Map();
      let dup = [];
      for (const lv of LEVELS) {
        const f = path.join(ROOT, "decks", "JLPT-" + lv.toUpperCase() + "-Japanese.folio-deck.json");
        if (!fs.existsSync(f)) continue;
        for (const c of JSON.parse(fs.readFileSync(f, "utf8")).cards) {
          if (seen.has(c.jmdict)) dup.push(c.jmdict + " " + seen.get(c.jmdict) + "/" + lv);
          seen.set(c.jmdict, lv);
        }
      }
      ok(dup.length === 0, "no JMdict entry is carded at two levels", dup.slice(0, 5).join(", "));
    }
  }

  // ---------------------------------------------------------------- the page
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port + "/index.html";
  const browser = await chromium.launch(process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {});
  const pg = await browser.newPage({ viewport: { width: 1100, height: 900 }, reducedMotion: "reduce" });
  const errs = [];
  pg.on("pageerror", (e) => errs.push(e.message));
  // AN EMPTY CATALOGUE, so the import lands under "Your decks" as a stranger's deck would.  A deck that
  // `lang-decks.js` lists is filed into its language's collection instead; that shelf is
  // test-lang-decks.js's to check, and what this file checks is the CARD.
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
  const dirs = await pg.evaluate(() => [...document.querySelectorAll("[data-usubtpl]")]
    .map((r) => (r.querySelector(".node-title, .deck-title") || r).textContent.trim()));
  ok(dirs.length === 2, "both directions are offered as rows", JSON.stringify(dirs));
  await pg.click("[data-uadd]");
  await pg.waitForTimeout(500);
  await pg.setViewportSize({ width: 420, height: 900 });   // studied at phone width, where kanji rows are tightest
  await pg.goto(base + "#home", { waitUntil: "load" });
  await pg.waitForTimeout(700);
  // a session begins from a deck's row on Home, past the order picker
  await pg.evaluate(() => { const b = document.querySelector(".active-deck[data-review]"); if (b) b.click(); });
  await pg.waitForTimeout(900);
  await pg.evaluate(() => { const b = document.querySelector("#opSkip"); if (b) b.click(); });
  await pg.waitForSelector("#reveal-btn", { timeout: 20000 });
  await pg.waitForTimeout(400);

  // Walk until a card whose back has furigana (a kanji word), grading Easy so the queue moves on.
  let front = null, back = null;
  for (let step = 0; step < 40; step++) {
    front = await pg.evaluate(() => {
      const w = document.querySelector(".uc-front, .uc-kana, .uc-ask");
      return { text: w ? w.textContent.trim() : "", rt: !!document.querySelector(".question rt"),
               meaning: !!document.querySelector(".question .uc-gl"), ask: !!document.querySelector(".uc-ask") };
    });
    await pg.evaluate(() => { const r = document.querySelector("#reveal-btn"); if (r) r.click(); });
    await pg.waitForTimeout(350);
    back = await pg.evaluate(() => {
      const all = [...document.querySelectorAll(".uc-card")];
      const b = all[all.length - 1] || document;
      const t = (s) => { const e = b.querySelector(s); return e ? e.textContent.trim() : ""; };
      return { rt: b.querySelectorAll(".uc-word rt, .uc-egw rt").length, romaji: t(".uc-romaji"),
               meaning: t(".uc-gl"), kanji: b.querySelectorAll(".uc-kj").length,
               exRt: b.querySelectorAll(".uc-exz rt").length, speaker: !!b.querySelector(".uc-tts"),
               ask: !!b.querySelector(".uc-ask") };
    });
    if (KANA || (back.rt && !back.ask && back.kanji)) break;
    await pg.evaluate(() => document.querySelector(".grade[data-g='easy']").click());
    await pg.waitForTimeout(350);
  }
  console.log("   front: " + JSON.stringify(front.text) + "   back: " + back.romaji + " — " + back.meaning.slice(0, 60));
  ok(front.text.length > 0, "the front shows the " + (KANA ? "kana" : "word"));
  ok(!front.meaning, "the meaning is not on the front");
  ok(back.romaji.length > 0, "the romaji is on the back");
  ok(back.speaker, "a speaker is on the back");
  if (!KANA) {
    ok(back.rt > 0, "FURIGANA SURVIVED IMPORT: <rt> over the headword on the rendered card", "rt " + back.rt);
    ok(back.meaning.length > 0, "the meaning is on the back");
    if (WHICH !== "phrases") ok(back.kanji > 0, "a kanji row is on the back", "rows " + back.kanji);   // phrases carry none, by design
    ok(back.exRt > 0, "the example sentences carry furigana", "rt " + back.exRt);
  }
  // the screenshot is of the CARD: overlays (the first-card achievement, toasts) are cleared, the fold opened
  await pg.evaluate(() => {
    document.querySelectorAll(".ach-pop, .toast, .modal-backdrop").forEach((e) => e.remove());
    document.querySelectorAll(".uc-fold").forEach((d) => { d.open = true; });
  });
  await pg.waitForTimeout(200);
  await pg.screenshot({ path: "/tmp/jlpt-" + WHICH + "-back.png", fullPage: true });
  
  ok(errs.length === 0, "no uncaught page errors", errs.join(" | "));
  await browser.close();
  server.close();
  console.log("\n" + (checks - fails) + " passed, " + fails + " failed");
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
