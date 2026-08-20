/* Look at the COMBINED Indonesian deck the way a reader would: build it, import it, add it, and
   read what is actually on the page.

     FOLIO_CHROMIUM=/path/to/chrome NODE_PATH=/tmp/pw/node_modules \
       node .claude/ukbi/check-combined.js

   It runs `combine.py` first, so it needs no committed artefact and works on a fresh clone —
   which is the point: the combined file is regenerated from the seven shipped decks and is not
   itself in the repo.

   `check-ukbi.js` asserts what is on an Indonesian CARD and `check-nesting.js` asserts the
   subdeck/direction machinery in app.js.  What is left, and what this file is for, is the JOIN
   between them: eight decks poured into one file, where every way it can be wrong is silent.
   A card id left carrying its own level's deck collides with an installed copy of that level in
   the shared `UCARDS` store and studies the wrong card, with both decks on the shelf showing
   their full counts.  A level whose notes lost their `sub` falls into the deck's own loose pile
   and simply stops having a row.  A direction row that stops being drawn takes half of what was
   asked for away, and the deck still imports, studies and counts perfectly.  */
const { chromium } = require("playwright");
const path = require("path"), http = require("http"), fs = require("fs");
const { execFileSync } = require("child_process");
const ROOT = path.resolve(__dirname, "..", "..");
const OUT = path.join(ROOT, "decks", "Indonesian-UKBI-1-7-and-Expressions.folio-deck.json");
const LEVELS = [["1 Terbatas", 500], ["2 Marginal", 750], ["3 Semenjana", 1000],
                ["4 Madya", 1500], ["5 Unggul", 2000], ["6 Sangat Unggul", 2500],
                ["7 Istimewa", 1500],
                ["Phrases and expressions::Phrases", 84],
                ["Phrases and expressions::Idioms", 111],
                ["Phrases and expressions::Proverbs", 33]];
const NOTES = LEVELS.reduce((a, l) => a + l[1], 0);
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
  console.log("-- build");
  console.log(execFileSync("python3", [path.join(__dirname, "combine.py")],
                           { encoding: "utf8" }).replace(/^/gm, "   "));

  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port + "/index.html";

  /* ------------------------------------------------------------------ the file */
  console.log("-- the file");
  const deck = JSON.parse(fs.readFileSync(OUT, "utf8"));
  ok(deck.meta.id === "ukbiall", "its own deck id, so it cannot disturb an installed level",
     deck.meta.id);
  /* A CARD ID MUST CARRY THE DECK.  A file import mints fresh ids only when the deck id is
     already taken, so an id left reading `u_ukbi1_1` would collide with an installed level 1
     in the shared store — and that failure is invisible from both decks' own shelves. */
  ok(deck.cards.every((c, i) => c.id === "u_ukbiall_" + (i + 1)),
     "every note is renumbered onto the combined deck",
     deck.cards.find((c, i) => c.id !== "u_ukbiall_" + (i + 1)) || "");
  ok(deck.cards.length === NOTES, NOTES.toLocaleString() + " notes", deck.cards.length);
  const subs = [...new Set(deck.cards.map((c) => c.sub))];
  ok(subs.join(" | ") === LEVELS.map((l) => l[0]).join(" | "),
     "ten card-holding subdecks, in the order they are studied", subs.join(" | "));
  /* THE EIGHTH ROW IS NOT AN EIGHTH LEVEL, and the tree is what says so: the
     seven predicates are flat and the expressions hang under a parent of their
     own.  Flattened in they would read as a step past Istimewa, which UKBI has
     not got. */
  ok(subs.filter((x) => x.indexOf("::") > 0).length === 3
     && subs.filter((x) => x.indexOf("::") < 0).length === 7,
     "the seven predicates are flat and the expressions nest under one parent",
     subs.join(" | "));
  ok(LEVELS.every(([s, n]) => deck.cards.filter((c) => c.sub === s).length === n),
     "each subdeck brings its own words and all of them",
     JSON.stringify(LEVELS.map(([s]) => [s, deck.cards.filter((c) => c.sub === s).length])));
  /* A LEVEL EXCLUDES THE LEVELS BELOW IT, so a word appearing twice would mean two subdecks
     teaching one word on two schedules with nothing to say which is which. */
  const words = deck.cards.map((c) => c.fields.Word);
  ok(new Set(words).size === words.length, "no word is taught twice",
     words.length - new Set(words).size + " repeated");
  /* THE DIRECTION ROWS COME FROM THE TEMPLATES and from nothing else. */
  const tpl = deck.meta.types.ukbi.cards;
  ok(tpl.length === 2 && /Indonesian . English/.test(tpl[0].name)
     && /English . Indonesian/.test(tpl[1].name),
     "two card templates, forward first", tpl.map((t) => t.name).join(" / "));

  /* ------------------------------------------------------------------ import */
  console.log("-- import");
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
  await pg.waitForSelector(".studio-deck", { timeout: 300000 });
  ok(await pg.evaluate(() => /9,?750/.test(document.body.innerText)),
     "all " + NOTES.toLocaleString() + " notes arrive");

  /* ------------------------------------------------------- the rows it offers */
  console.log("-- the rows");
  await pg.goto(base + "#decks", { waitUntil: "load" });
  await pg.waitForTimeout(800);
  const rows = await pg.evaluate(() => {
    const d = [...document.querySelectorAll(".udeck")].find((e) => /UKBI 1/.test(e.textContent));
    return [...d.querySelectorAll(".udeck-subrow")].map((e) => ({
      name: ((e.querySelector(".deck-title") || {}).textContent || "").trim(),
      tpl: e.getAttribute("data-usubtpl"),
      count: ((e.querySelector(".collection-count") || {}).textContent || "").trim(),
    }));
  });
  rows.forEach((r) => console.log("   tpl " + String(r.tpl).padStart(2) + "  "
                                  + r.name.padEnd(22) + r.count));
  /* 10 card-holding subdecks with two directions each, plus the one parent
     that groups the expressions and correctly gets none of its own. */
  ok(rows.length === 31, "ten subdecks with their directions, plus one parent",
     rows.length);
  ok(rows.map((r) => r.tpl).join(",")
     === ("-1,0,1,".repeat(7) + "-1," + "-1,0,1,".repeat(3)).slice(0, -1),
     "the directions belong to the subdeck above them, and a parent gets none",
     rows.map((r) => r.tpl).join(","));
  /* A LEVEL COUNTS BOTH DIRECTIONS AND EACH DIRECTION COUNTS ONE — the file holds notes and the
     review deals cards, and a level reading 500 rather than 1,000 is the shape of a count that
     has forgotten the second template. */
  ok(/^1,?000 cards/.test(rows[0].count) && /^500 cards/.test(rows[1].count)
     && /^500 cards/.test(rows[2].count),
     "a level counts both directions and a direction counts one",
     [rows[0].count, rows[1].count, rows[2].count].join(" / "));

  /* ADDING THE DECK BRINGS THE LEVELS AND NOT THE DIRECTIONS.  A level holds cards nothing else
     holds, so the cascade must bring it; a direction is a VIEW of its own level's cards, and
     bringing it too would surface reverses in the pooled draw from the first day. */
  console.log("-- adding");
  await pg.evaluate(() => [...document.querySelectorAll(".udeck")]
    .find((e) => /UKBI 1/.test(e.textContent)).querySelector("[data-uadd]").click());
  await pg.waitForTimeout(600);
  const active = await pg.evaluate(() => {
    const S = JSON.parse(localStorage.getItem("folio_v1") || "{}");
    return (S.active || []).filter((x) => String(x).indexOf("u:ukbiall") === 0)
      .map(decodeURIComponent);
  });
  ok(active.length === 12,
     "the deck, its seven levels, the phrases parent and its three",
     active.length);
  ok(!active.some((x) => /#\d$/.test(x)),
     "the directions are the reader's own choice, not the cascade's", active.join(" "));

  /* ------------------------------------------------------------------ study */
  console.log("-- study");
  await pg.evaluate(() => {
    const S = JSON.parse(localStorage.getItem("folio_v1") || "{}");
    S.settings = Object.assign(S.settings || {}, { newPerDay: 12 });
    localStorage.setItem("folio_v1", JSON.stringify(S));
  });
  await pg.goto(base + "#home", { waitUntil: "load" });
  await pg.waitForTimeout(900);
  const home = await pg.evaluate(() => [...document.querySelectorAll(".active-deck .dk-title")]
    .map((e) => e.textContent.replace(/\s+/g, " ").trim()));
  console.log("   " + home.join(" | "));
  ok(home.length === 12
     && LEVELS.every(([s]) => home.some((h) => h.indexOf(s.split("::").pop()) === 0)),
     "the deck and every subdeck get a row of their own", home.join(" | "));
  await pg.screenshot({ path: "/tmp/ukbi-combined-home.png" });
  await pg.click(".review-group .cta .btn");
  await pg.waitForSelector(".question", { timeout: 30000 });
  await pg.waitForTimeout(500);
  await pg.click("#reveal-btn");
  await pg.waitForTimeout(500);
  const card = await pg.evaluate(() => ({
    word: (document.querySelector(".uc-word") || {}).textContent || "",
    gloss: !!document.querySelector(".uc-field"),
    speaker: !!document.querySelector(".uc-word .uc-tts"),
  }));
  console.log("   " + JSON.stringify(card));
  ok(card.word.trim().length > 0 && card.gloss && card.speaker,
     "a card of the combined deck renders its word, its meaning and its speaker",
     JSON.stringify(card));
  await pg.screenshot({ path: "/tmp/ukbi-combined.png" });

  await browser.close();
  server.close();
  console.log(fails ? "\n" + fails + " of " + checks + " checks FAILED"
                    : "\nPASS all " + checks + " checks");
  process.exit(fails ? 1 : 0);
})();
