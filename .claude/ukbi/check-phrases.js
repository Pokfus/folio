/* Look at the phrases deck the way a reader would: build it, read it, import it, study it.

     FOLIO_CHROMIUM=/path/to/chrome NODE_PATH=/tmp/pw/node_modules \
       node .claude/ukbi/check-phrases.js

   It runs `run.py --phrases` first, so it needs no committed artefact and works on a fresh
   clone.

   EVERY CONTENT RULE IN THIS DECK FAILS SILENTLY, which is why it has a checker of its own.
   Wiktionary's Indonesian holds French and Latin phrases, misspellings, inflected forms and
   several thousand compound nouns, and a deck that let any of them through would import,
   study and count perfectly while teaching a reader that `s'il vous plaît` is Indonesian or
   that `terimah kasih` is how the word is spelled.  The gloss order is worse still: an idiom
   whose literal sense comes first is a well-formed card that teaches the words the expression
   is made of instead of what it means, and nothing but reading it can see that.  */
const { chromium } = require("playwright");
const path = require("path"), http = require("http"), fs = require("fs");
const { execFileSync } = require("child_process");
const ROOT = path.resolve(__dirname, "..", "..");
const OUT = path.join(ROOT, "decks", "Indonesian-Phrases-and-Expressions.folio-deck.json");
const SUBS = [["Phrases", 84], ["Idioms", 111], ["Proverbs", 33]];
/* Named one by one rather than re-derived, because each is a DIFFERENT rule's work and a
   rule that has stopped firing must not be covered for by another that still is. */
const FOREIGN = ["de facto", "s'il vous plaît", "en route", "in situ", "ad hominem",
                 "force majeure", "mezzo piano", "primus inter pares", "tout le monde"];
const MISSPELT = ["terimah kasih", "selamat tinngal"];
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
const strip = (h) => (h || "").replace(/<[^>]+>/g, " ").replace(/&quot;/g, '"')
                              .replace(/&#x27;/g, "'").replace(/&amp;/g, "&")
                              .replace(/\s+/g, " ").trim();

(async () => {
  console.log("-- build");
  console.log(execFileSync("python3", [path.join(ROOT, ".claude", "ukbi", "run.py"),
                                       "--phrases", "--no-fetch"],
                           { encoding: "utf8" }).split("\n").slice(-6).join("\n"));

  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port + "/index.html";

  console.log("-- the file");
  const deck = JSON.parse(fs.readFileSync(OUT, "utf8"));
  const cards = deck.cards, words = cards.map((c) => c.fields.Word);
  const wordSet = new Set(words);
  const byWord = new Map(cards.map((c) => [c.fields.Word, c]));
  const N = SUBS.reduce((a, s) => a + s[1], 0);
  ok(deck.meta.id === "idphrase", "its own deck id", deck.meta.id);
  ok(cards.length === N, N + " expressions", cards.length);
  ok(new Set(words).size === words.length, "nothing carded twice");

  /* NOTHING THE SEVEN LEVELS TEACH, read off the shipped decks rather than a working file:
     a repeat would be one expression on two schedules with nothing to say which is which. */
  const taught = new Set();
  for (const f of fs.readdirSync(path.join(ROOT, "decks")))
    if (/^UKBI-[1-7]-.*\.folio-deck\.json$/.test(f))
      for (const c of JSON.parse(fs.readFileSync(path.join(ROOT, "decks", f), "utf8")).cards)
        taught.add(c.fields.Word);
  const dupe = words.filter((w) => taught.has(w));
  ok(!dupe.length, "nothing here is already taught by one of the seven levels",
     dupe.slice(0, 5).join(" | "));

  /* THE THREE RULES THAT KEEP THE DICTIONARY'S RUBBISH OUT.  Each is a statement Wiktionary
     makes about the entry, and each would ship a perfectly well-formed card if it stopped. */
  const foreign = FOREIGN.filter((w) => wordSet.has(w));
  ok(!foreign.length, "no foreign phrase is taught as Indonesian", foreign.join(" | "));
  const bad = MISSPELT.filter((w) => wordSet.has(w));
  ok(!bad.length, "no misspelling is taught", bad.join(" | "));
  /* A COMPOUND NOUN IS VOCABULARY.  6,000-odd untaught multi-word entries are nouns like
     these, and letting them in would make this a second vocabulary deck.  Note that the rule
     is about the PART OF SPEECH and not about the subject: a term-of-art filter on subject
     categories was measured and refused, because it costs `selamat makan`, `atas nama` and
     `kuda troya` to save `tahun cahaya`. */
  ok(!wordSet.has("burung hantu") && !wordSet.has("beruang kutub")
     && !wordSet.has("serangan jantung"),
     "a compound noun is vocabulary and is not here");
  /* …and one it DOES keep, so the rule above is not passing by having eaten everything: a
     noun the dictionary separately marks idiomatic stays. */
  ok(wordSet.has("kambing hitam") && wordSet.has("lintah darat"),
     "a noun the dictionary marks idiomatic is kept");

  /* THE IDIOMATIC SENSE COMES FIRST.  Wiktionary lists `kambing hitam` as "black goat" and
     then "scapegoat"; on an idioms card that is exactly backwards, and the card is otherwise
     flawless either way. */
  const kh = strip(byWord.get("kambing hitam").fields.English);
  ok(kh.indexOf("scapegoat") >= 0 && kh.indexOf("scapegoat") < kh.indexOf("black goat"),
     "the idiom comes before its literal reading", kh);
  ok(kh.indexOf("black goat") >= 0, "…and the literal reading is kept under it", kh);

  /* A PROVERB'S SPELLING VARIANTS DEDUPLICATE THEMSELVES: seven forms, one card. */
  const dij = words.filter((w) => /langit dijunjung/.test(w));
  ok(dij.length === 1, "one card per proverb, not one per spelling", dij.join(" | "));

  /* NO CARD IS DEFINED BY NAMING ANOTHER INDONESIAN WORD -- the Aug 2026 audit's rule, which
     is what a cross-reference gloss reaching the page looks like. */
  const xref = cards.filter((c) => /\b(?:synonym|basic form|passive|plural|alternative form)\s+of\b/i
                                    .test(strip(c.fields.English)));
  ok(!xref.length, "no card is defined by naming another Indonesian word",
     xref.slice(0, 3).map((c) => c.fields.Word).join(" | "));
  ok(cards.every((c) => strip(c.fields.English).length > 1),
     "every card carries a meaning");

  /* THE SUBDECKS ARE THE POINT OF THE DECK: everyday, idioms, proverbs. */
  const subs = [...new Set(cards.map((c) => c.sub))];
  ok(subs.join(" | ") === SUBS.map((s) => s[0]).join(" | "),
     "three subdecks, in the order they are met", subs.join(" | "));
  ok(SUBS.every(([s, n]) => cards.filter((c) => c.sub === s).length === n),
     "each subdeck holds what it says",
     JSON.stringify(SUBS.map(([s]) => [s, cards.filter((c) => c.sub === s).length])));
  ok(cards.filter((c) => c.sub === "Proverbs")
       .every((c) => / /.test(c.fields.Word)), "every proverb is more than one word");

  const tpl = deck.meta.types.ukbi.cards;
  ok(tpl.length === 2, "both directions", tpl.map((t) => t.name).join(" / "));

  console.log("-- the page");
  const browser = await chromium.launch(
    process.env.FOLIO_CHROMIUM ? { executablePath: process.env.FOLIO_CHROMIUM } : {});
  const pg = await (await browser.newContext({ viewport: { width: 1180, height: 900 },
                                               reducedMotion: "reduce" })).newPage();
  pg.on("pageerror", (e) => { fails++; console.log("   ✗ page error: " + e.message); });
  await pg.goto(base + "#studio", { waitUntil: "load" });
  await pg.waitForTimeout(400);
  const chooser = pg.waitForEvent("filechooser");
  await pg.click("#stImport");
  (await chooser).setFiles(OUT);
  await pg.waitForSelector(".studio-deck", { timeout: 120000 });

  await pg.goto(base + "#decks", { waitUntil: "load" });
  await pg.waitForTimeout(700);
  const rows = await pg.evaluate(() => {
    const d = [...document.querySelectorAll(".udeck")].find((e) => /Phrases/.test(e.textContent));
    return [...d.querySelectorAll(".udeck-subrow")].map((e) => ({
      name: ((e.querySelector(".deck-title") || {}).textContent || "").trim(),
      tpl: e.getAttribute("data-usubtpl"),
    }));
  });
  ok(rows.length === 9, "three subdecks, each with its two directions", rows.length);
  ok(rows.map((r) => r.tpl).join(",") === "-1,0,1,-1,0,1,-1,0,1",
     "the directions belong to the subdeck above them", rows.map((r) => r.tpl).join(","));
  await pg.evaluate(() => [...document.querySelectorAll(".udeck")]
    .find((e) => /Phrases/.test(e.textContent)).querySelector("[data-uadd]").click());
  await pg.waitForTimeout(600);

  /* A PROVERB IS SEEDED AS DUE RATHER THAN WALKED TO -- `check-ukbi.js`'s rule: the deck is
     ordered by how common an expression is and a proverb sorts near the end, so a walk long
     enough to reach one costs a session and several artefact chests.  Seeded AFTER the deck
     is added, because adding it calls save() and that overwrites a seeded folio_v1. */
  const seeded = await pg.evaluate(async () => {
    const db = await new Promise((res) => {
      const q = indexedDB.open("folio-community"); q.onsuccess = () => res(q.result);
    });
    const notes = await new Promise((res) => {
      const t = db.transaction("notes").objectStore("notes").getAll();
      t.onsuccess = () => res(t.result);
    });
    db.close();
    const want = ["air tenang menghanyutkan", "kambing hitam"], out = {};
    for (const r of notes) {
      const c = r.c || r;
      if (c.fields && want.includes(c.fields.Word)) out[c.fields.Word] = c.id;
    }
    const S = JSON.parse(localStorage.getItem("folio_v1") || "{}");
    S.cards = S.cards || {};
    for (const w of want)
      if (out[w]) S.cards[out[w]] = { status: "review", due: Date.now() - 864e5, iv: 1,
                                      ease: 2.5, reps: 1, lapses: 0, first: "2026-08-01",
                                      last: Date.now() - 864e5 };
    localStorage.setItem("folio_v1", JSON.stringify(S));
    return Object.keys(out).length;
  });
  ok(seeded === 2, "both specimens are in the store to be seeded", seeded);
  await pg.reload({ waitUntil: "load" });
  await pg.waitForTimeout(900);
  await pg.goto(base + "#home", { waitUntil: "load" });
  await pg.waitForTimeout(800);
  await pg.click(".review-group .cta .btn");

  const seen = [];
  for (let i = 0; i < 10 && seen.length < 2; i++) {
    for (let k = 0; k < 4; k++) {                       // a level buys a chest, which covers the card
      if (!(await pg.$(".chest-pop"))) break;
      await pg.evaluate(() => { const b = [...document.querySelectorAll(".chest-pop button")].pop(); if (b) b.click(); });
      await pg.waitForTimeout(300);
    }
    await pg.waitForSelector(".question", { timeout: 20000 });
    await pg.waitForTimeout(300);
    await pg.evaluate(() => { const b = document.querySelector("#reveal-btn"); if (b) b.click(); });
    await pg.waitForTimeout(400);
    const c = await pg.evaluate(() => ({
      w: ((document.querySelector(".uc-word") || {}).textContent || "").trim(),
      en: ((document.querySelector(".uc-field") || {}).innerText || "").replace(/\s+/g, " ").trim(),
      speaker: !!document.querySelector(".uc-word .uc-tts"),
    }));
    if (/kambing hitam|air tenang/.test(c.w)) { seen.push(c); await pg.screenshot({ path: "/tmp/ukbi-phrases-" + seen.length + ".png" }); }
    const more = await pg.evaluate(() => {
      const e = [...document.querySelectorAll(".grade")].find((x) => x.getAttribute("data-g") === "easy");
      if (!e) return false; e.click(); return true;
    });
    if (!more) break;
    await pg.waitForTimeout(400);
  }
  seen.forEach((c) => console.log("   " + c.w + "  ->  " + c.en.slice(0, 72)));
  ok(seen.length === 2, "both specimens are dealt", seen.length);
  ok(seen.every((c) => c.speaker), "each renders its word with a speaker");
  const idiom = seen.find((c) => /kambing/.test(c.w));
  ok(idiom && idiom.en.indexOf("scapegoat") < idiom.en.indexOf("black goat"),
     "ON THE PAGE the idiom comes before its literal reading", idiom && idiom.en);

  await browser.close();
  server.close();
  console.log(fails ? "\n" + fails + " of " + checks + " checks FAILED"
                    : "\nPASS all " + checks + " checks");
  process.exit(fails ? 1 : 0);
})();
