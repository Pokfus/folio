/* Look at a Japanese deck the way a reader would: import it through the Studio, add it, study it, and read
   what is actually on the card.  Every fault these decks can have is quiet -- above all the one the whole
   collection turns on: FURIGANA THAT DOES NOT SURVIVE IMPORT.  The deck sanitizer dropped <ruby> until
   Oct 2026, and a deck cleaned by it still reads perfectly: the kanji are there, the reading simply sits
   beside them as a run of kana instead of over them.  So this asserts <rt> elements on the RENDERED card.

     node .claude/jlpt/check-jlpt.js [first|n5|n4|n3|n2|n1|kanji|hiragana|katakana|phrases|idioms]

   The file half runs first: every note has its English, reading and romaji; ids are unique AND ARE THE ONES
   ids.json PINS (a note that changed its number hands a reader's progress to another word, and nothing else
   would say so); across the first-words deck and the five levels no JMdict entry is carded twice; every
   English → Japanese question is unique; a verb carries its four forms; and N5 deals its sets together.
   Screenshots go to /tmp/jlpt-<deck>-back.png. */
"use strict";
const { chromium } = require("playwright");
const path = require("path"), http = require("http"), fs = require("fs");
const ROOT = path.resolve(__dirname, "..", "..");
const WHICH = (process.argv[2] || "n5").toLowerCase();
const FILES = { hiragana: "Japanese-Hiragana", katakana: "Japanese-Katakana", first: "Japanese-First-Words",
                kanji: "Japanese-Kanji-N5", phrases: "Japanese-Phrases-and-Expressions", idioms: "Japanese-Idioms" };
const LEVELS = ["n5", "n4", "n3", "n2", "n1"];
const DECK = (FILES[WHICH] || ("JLPT-" + WHICH.toUpperCase() + "-Japanese")) + ".folio-deck.json";
const KANJI = WHICH === "kanji";
const KANA = !!{ hiragana: 1, katakana: 1 }[WHICH] || KANJI;   // a deck of characters, not of words
const plain = (h) => String(h || "").replace(/<rt>.*?<\/rt>|<span class="uc-hint">.*?<\/span>|<[^>]+>/g, "");
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
  // THE IDS ARE THE PINNED ONES.  ids.json maps deck -> note key -> number; a card whose id is not its key's
  // number has been renumbered, and a reader's schedule for it now belongs to whatever holds the old number.
  const pinned = JSON.parse(fs.readFileSync(path.join(__dirname, "ids.json"), "utf8"))[deck.meta.id] || {};
  const keyOf = (c) => c.jmdict || (KANJI ? c.fields.Kanji : c.fields.Kana);
  const moved = cards.filter((c) => c.id !== "u_" + deck.meta.id + "_" + pinned[keyOf(c)]);
  ok(moved.length === 0, "every card id is the one ids.json pins to its note",
     moved.slice(0, 3).map((c) => c.id + " ≠ " + pinned[keyOf(c)]).join(", "));
  if (KANJI) {
    ok(cards.every((c) => c.fields.Kanji.length === 1 && c.fields.Meaning && c.fields.Readings),
       "every kanji has its meanings and readings");
    const sides = cards.map((c) => c.fields.Meaning + "|" + c.fields.Readings);
    ok(new Set(sides).size === sides.length, "every meaning side names one kanji");
    // THE ORDER IS THE ORDER THE WORDS NEED THE KANJI IN: read the fronts of the first-words deck and then N5,
    // note each of this deck's kanji where it is first written, and that is this deck's own order
    const have = new Set(cards.map((c) => c.fields.Kanji)), need = [];
    for (const f of [FILES.first, "JLPT-N5-Japanese"]) {
      for (const c of JSON.parse(fs.readFileSync(path.join(ROOT, "decks", f + ".folio-deck.json"), "utf8")).cards) {
        for (const ch of plain(c.fields.Word)) if (have.has(ch) && !need.includes(ch)) need.push(ch);
      }
    }
    ok(need.length > 80 && cards.slice(0, need.length).map((c) => c.fields.Kanji).join("") === need.join(""),
       "the kanji stand in the order the first words and N5 first write them", need.length + " of " + cards.length);
    ok(cards.filter((c) => c.fields.Words).length > cards.length * 0.8, "most kanji show a word that uses them");
  } else if (KANA) {
    ok(cards.every((c) => c.fields.Kana && c.fields.Romaji), "every kana has its romaji");
    const sides = cards.map((c) => c.fields.Romaji + "|" + c.fields.Note);
    ok(new Set(sides).size === sides.length, "every romaji side names one kana");
    // THE EXAMPLE SHOWS THE KANA ITSELF, picked out, and says it as the card does
    const eg = cards.filter((c) => c.fields.Examples);
    ok(eg.every((c) => c.fields.Examples.includes("<b>" + c.fields.Kana + "</b>")),
       "every example word picks the kana out in the word itself");
    const wrong = eg.filter((c) => c.fields.Kana.length === 1 &&
      new RegExp("<b>" + c.fields.Kana + "</b>[ゃゅょャュョ]").test(c.fields.Examples));
    ok(wrong.length === 0, "no example shows a kana inside a combination (き as in きょう)",
       wrong.map((c) => c.fields.Kana).join(" "));
    ok(cards.every((c) => !/<ruby>/.test(c.fields.Examples)), "no example hides its kana under a kanji");
    const tail = cards.slice(-3).map((c) => c.fields.Kana).join("");
    ok(/[ぢづヂヅヲ]/.test(cards.map((c) => c.fields.Kana).slice(71).join("")) &&
       !/[ぢづヂヅヲ]/.test(cards.map((c) => c.fields.Kana).slice(0, 71).join("")),
       "the rarely written kana come after the chart", tail);
  } else {
    ok(cards.every((c) => /uc-gl/.test(c.fields.English)), "every note has an English meaning");
    ok(cards.every((c) => c.fields.Reading && c.fields.Romaji), "every note has its reading and romaji");
    ok(new Set(cards.map((c) => c.fields.English)).size === cards.length, "every English side is unique");
    ok(cards.every((c) => /uc-gl/.test(c.fields.Prompt) && c.fields.Say), "every note has its question and what the speaker says");
    ok(new Set(cards.map((c) => c.fields.Prompt)).size === cards.length, "every English → Japanese question has one answer");
    // two notes that open on the same gloss name each other
    // the gloss is unescaped before it is cut at the semicolon: "I&#x27;m sorry" is not the gloss "I&#x27"
    const unesc = (t) => t.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
    const firstGloss = (c) => unesc((/uc-gl">([^<]*)/.exec(c.fields.Prompt) || ["", ""])[1]).split(";")[0].trim().toLowerCase();   // [^<]* stops before a sense note's <span>
    const byGloss = new Map();
    cards.forEach((c) => byGloss.set(firstGloss(c), (byGloss.get(firstGloss(c)) || []).concat(c)));
    const unnamed = [...byGloss.values()].filter((g) => g.length > 1).flat().filter((c) => !/uc-pos">[^<]*\bnot /.test(c.fields.Prompt));
    ok(unnamed.length === 0, "two words with one first gloss each name the other", unnamed.slice(0, 3).map((c) => plain(c.fields.Word)).join(" "));
    if (LEVELS.includes(WHICH) || WHICH === "first") {
      // A VERB CARRIES ITS FOUR FORMS, and the polite one ends in ます
      const verbs = cards.filter((c) => /^<div class="uc-sense"><div class="uc-pos">(godan verb|ichidan verb)(,|<)/.test(c.fields.English));
      const bare = verbs.filter((c) => (c.fields.Conj.match(/uc-cjl/g) || []).length !== 4 || !/ます/.test(c.fields.Conj));
      ok(bare.length === 0, "every godan and ichidan verb shows its four forms (" + verbs.length + " verbs)",
         bare.slice(0, 4).map((c) => plain(c.fields.Word)).join(" "));
    }
    if (WHICH === "n5" || WHICH === "n4") {
      const gated = cards.filter((c) => /shown in kana/.test(c.fields.Also));
      ok(gated.length > 100, "words whose kanji are above the level are asked in kana", String(gated.length));
      ok(gated.every((c) => /<ruby>/.test(c.fields.Furigana)), "and written in kanji, with furigana, on the back");
      ok(gated.every((c) => !/[\u4e00-\u9fff]/.test(plain(c.fields.Word)) || /<ruby>/.test(c.fields.Word)),
         "a kana front holds no kanji unless it is a homograph's furigana");
    }
    if (WHICH === "n5") {
      const pos = new Map(cards.map((c, i) => [plain(c.fields.Furigana) + "|" + c.fields.Reading, i]));
      const run = (names) => names.map((x) => pos.get(x));
      const together = (names) => { const r = run(names); return r.every((v, i) => v !== undefined && (!i || v === r[i - 1] + 1)); };
      ok(together(["一|いち", "二|に", "三|さん", "四|し", "五|ご", "六|ろく", "七|しち", "八|はち", "九|きゅう", "十|じゅう"]),
         "N5 counts one to ten on ten consecutive notes");
      ok(together(["月曜日|げつようび", "火曜日|かようび", "水曜日|すいようび", "木曜日|もくようび", "金曜日|きんようび", "土曜日|どようび", "日曜日|にちようび"]),
         "N5 deals the days of the week together");
      ok(pos.get("私|わたし") + 30 < pos.get("私|わたくし"), "わたし comes well before わたくし");
      ok(pos.get("する|する") + 30 < pos.get("やる|やる"), "two words for one gloss (する, やる) are kept apart");
    }
    if (WHICH !== "first") ok(cards.filter((c) => /<ruby>/.test(c.fields.Furigana)).length > cards.length / 2,
       "most headwords carry furigana");   // the first words are greetings and particles: kana
    const withEx = cards.filter((c) => c.fields.Examples).length;
    ok(withEx / cards.length > 0.85, "most notes carry an example sentence", withEx + " of " + cards.length);
    if (LEVELS.includes(WHICH) || WHICH === "first") {
      const seen = new Map();
      let dup = [];
      for (const lv of ["first"].concat(LEVELS)) {
        const f = path.join(ROOT, "decks", lv === "first" ? FILES.first + ".folio-deck.json"
                                                         : "JLPT-" + lv.toUpperCase() + "-Japanese.folio-deck.json");
        if (!fs.existsSync(f)) continue;
        for (const c of JSON.parse(fs.readFileSync(f, "utf8")).cards) {
          if (seen.has(c.jmdict)) dup.push(c.jmdict + " " + seen.get(c.jmdict) + "/" + lv);
          seen.set(c.jmdict, lv);
        }
      }
      ok(dup.length === 0, "no JMdict entry is carded in two of the first-words and level decks", dup.slice(0, 5).join(", "));
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
      const w = document.querySelector(".uc-front, .uc-kana, .uc-kanji1, .uc-ask");
      return { text: w ? w.textContent.trim() : "", rt: !!document.querySelector(".question rt"),
               meaning: !!document.querySelector(".question .uc-gl"), ask: !!document.querySelector(".uc-ask") };
    });
    await pg.evaluate(() => { const r = document.querySelector("#reveal-btn"); if (r) r.click(); });
    await pg.waitForTimeout(350);
    back = await pg.evaluate(() => {
      const all = [...document.querySelectorAll(".uc-card")];
      const b = all[all.length - 1] || document;
      const t = (s) => { const e = b.querySelector(s); return e ? e.textContent.trim() : ""; };
      return { rt: b.querySelectorAll(".uc-word rt, .uc-egw rt").length, romaji: t(".uc-romaji") || t(".uc-kread"),
               meaning: t(".uc-gl") || t(".uc-kmean"), kanji: b.querySelectorAll(".uc-kj").length,
               conj: b.querySelectorAll(".uc-cj").length,
               exRt: b.querySelectorAll(".uc-exz rt").length, speaker: !!b.querySelector(".uc-tts"),
               ask: !!b.querySelector(".uc-ask") };
    });
    if (KANA || (back.rt && !back.ask && back.kanji && (WHICH !== "first" || back.exRt))) break;
    await pg.evaluate(() => document.querySelector(".grade[data-g='easy']").click());
    await pg.waitForTimeout(350);
  }
  console.log("   front: " + JSON.stringify(front.text) + "   back: " + back.romaji + " — " + back.meaning.slice(0, 60));
  ok(front.text.length > 0, "the front shows the " + (KANA ? "kana" : "word"));
  ok(!front.meaning, "the meaning is not on the front");
  ok(back.romaji.length > 0, KANJI ? "the readings are on the back" : "the romaji is on the back");
  ok(back.speaker, "a speaker is on the back");
  if (!KANA) {
    ok(back.rt > 0, "FURIGANA SURVIVED IMPORT: <rt> over the headword on the rendered card", "rt " + back.rt);
    ok(back.meaning.length > 0, "the meaning is on the back");
    if (WHICH !== "phrases" && WHICH !== "first") ok(back.kanji > 0, "a kanji row is on the back", "rows " + back.kanji);   // phrases carry none, by design
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
