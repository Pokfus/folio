/* Look at the expressions deck the way a reader would, and read what is on the card.
 *
 *     FOLIO_CHROMIUM=/path/to/chrome NODE_PATH=/tmp/pw/node_modules \
 *       node .claude/delf/check-phrases.js
 *
 * WHY THIS IS A FILE OF ITS OWN RATHER THAN A SEVENTH ARGUMENT TO `check-delf.js`.
 * That checker's premise, written at the top of it, is that "the assertions are
 * about FRENCH and not about a level", which is why one file serves six.  This
 * deck breaks the premise: almost every assertion it makes is about something
 * this deck deliberately has none of -- an article coloured by gender, an elided
 * `l'` recovered by un/une, a passé composé, an agreement table.  Run against
 * this deck it would fail on all of them and every failure would be correct,
 * which is a checker that has stopped saying anything.
 *
 * So this asserts what THIS deck is for, and its sharpest assertion is a
 * NEGATIVE one.  The fault that would actually happen here is `pos_hint`
 * resolving an expression to the class kaikki files first rather than the class
 * the deck chose -- `en dehors` and `à peu près` are both filed as nouns -- and
 * a noun gets an article, so the card would read `le à peu près` in coloured
 * type.  That is ungrammatical French rendered beautifully, on a card whose
 * whole subject is what French says as a unit, and nothing throws.
 */
const { chromium } = require("playwright");
const path = require("path"), http = require("http"), fs = require("fs");

const ROOT = path.resolve(__dirname, "..", "..");
/* THE DECK'S NAME AND ID ARE READ OUT OF `delf_level.py`, never written down
   here -- the rule `check-delf.js` was fixed to follow, and it matters more on
   this deck, which is the one member of the family whose name is not derived
   from an exam. */
const LVL_PY = fs.readFileSync(ROOT + "/.claude/delf/delf_level.py", "utf8");
const PL_PY = fs.readFileSync(ROOT + "/.claude/delf/phraselist.py", "utf8");
/* Each grabber names the file it reads, because a single one that always read
   delf_level.py silently looked for phraselist.py's tables in the wrong file and
   died on the first of them. */
const from = (src, name) => (re, what) => {
  const m = re.exec(src);
  if (!m) { console.error("cannot read " + what + " out of " + name); process.exit(2); }
  return m[1];
};
const grab = from(LVL_PY, "delf_level.py");
const grabPL = from(PL_PY, "phraselist.py");

const DECK = grab(/DECK_FILES\[PHRASES\] = '([^']+)'/, "the deck file name");
const DECK_ID = grab(/DECK_IDS\[PHRASES\] = '([^']+)'/, "the deck id");
const TITLE = grab(/TITLES\[PHRASES\] = '([^']+)'/, "the deck title");

/* The refusals and the written-in meanings are read out of `phraselist.py` for
   the same reason: they are the deck's own editorial decisions, and a copy here
   would go on asserting the old list after somebody re-argued one. */
const items = (s) => s.split("|").map((x) => x.trim()).filter(Boolean);
const DROPPED = [...grabPL(/^DROP = \{([\s\S]*?)^\}/m, "the DROP table")
  .matchAll(/'(\w+)':\s*(?:"""([\s\S]*?)"""|"([^"]*)")/g)]
  .flatMap((m) => items(m[2] || m[3] || ""));
const AUTHORED = [...grabPL(/^GLOSS = \{([\s\S]*?)^\}/m, "the GLOSS table")
  .matchAll(/^\s*'([^']+)':/gm)].map((m) => m[1]);

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
  const file = path.join(ROOT, "decks", DECK);
  if (!fs.existsSync(file)) {
    console.error(DECK + " is not built; run `python3 .claude/delf/run.py --level phrases`");
    process.exit(1);
  }
  const deck = JSON.parse(fs.readFileSync(file, "utf8"));
  const cards = deck.cards;
  const words = new Set(cards.map((c) => c.fields.Word));

  console.log("the file:");
  ok(deck.meta.title === TITLE, "the title is the one delf_level.py names", deck.meta.title);
  ok(deck.meta.id === DECK_ID, "and the id", deck.meta.id);
  /* IT MUST NOT CLAIM TO BE AN EXAM PAPER.  The other six are DELF or DALF decks
     and this one is not; a title or a tag saying otherwise would tell a reader
     there is a diploma in idiom. */
  ok(!/\bDELF\b|\bDALF\b/.test(deck.meta.title + " " + deck.meta.subtitle),
     "and neither says DELF or DALF, because this is not an exam level");
  ok(!deck.meta.tags.includes("delf") && !deck.meta.tags.includes("cefr"),
     "nor do its tags", JSON.stringify(deck.meta.tags));
  ok(deck.meta.color !== "#14468C",
     "and it has a colour of its own, so a row does not read as a seventh level");

  const types = Object.keys(deck.meta.types || {});
  ok(types.length === 1 && (deck.meta.types[types[0]].cards || []).length === 2,
     "one card type with two templates, so each expression is one note and two cards");

  console.log("what was chosen:");
  /* EVERY REFUSAL IS ABSENT.  A drop that has silently stopped matching -- which
     happens when Wiktionary re-glosses an entry or the corpus moves it under the
     floor -- puts `pas que` and `de par` back in the deck, and they look exactly
     like every other card. */
  const back = DROPPED.filter((w) => words.has(w));
  ok(back.length === 0, `all ${DROPPED.length} refused expressions are absent`,
     back.join(", "));
  /* …AND THE AUTHORED MEANINGS REACHED THE CARD.  These were kept instead of
     dropped, so if the merge into AUTHORED ever stops happening the card comes
     back carrying the very sense the entry was refused for elsewhere. */
  const miss = AUTHORED.filter((w) => !words.has(w));
  ok(miss.length === 0, `all ${AUTHORED.length} written-in meanings are in the deck`,
     miss.join(", "));
  const dehors = cards.find((c) => c.fields.Word === "en dehors");
  ok(dehors && /outside/i.test(dehors.fields.English),
     "and one of them shows the written meaning rather than the dictionary's first",
     dehors && dehors.fields.English.slice(0, 120));

  /* THE NEGATIVE THAT MATTERS: nothing here is a noun, so nothing carries an
     article.  `le à peu près` is what a class resolved from kaikki's own first
     record looks like on the page. */
  const arted = cards.filter((c) => /class="uc-art/.test(c.fields.French || ""));
  ok(arted.length === 0, "no expression is given an article",
     arted.slice(0, 4).map((c) => c.fields.Word).join(", "));
  ok(cards.every((c) => c.fields.French.trim() === c.fields.Word.trim()
       || !/^<span/.test(c.fields.French)),
     "and the headword is the expression itself");

  /* AND NO PARADIGM, which is the deck's stated limitation.  Asserted in BOTH
     directions: a table appearing would be composed out of forms the dictionary
     does not have, and the description promising there is none while one is
     printed is the same fault seen from the other side. */
  const conj = cards.filter((c) => (c.fields.Conjugation || "").trim());
  ok(conj.length === 0, "no expression carries a conjugation or agreement table",
     conj.slice(0, 4).map((c) => c.fields.Word).join(", "));
  ok(/no conjugation table/i.test(deck.meta.desc),
     "and the description says so, on the first screen");

  console.log("the description's figures:");
  const n = cards.length;
  ok(deck.meta.subtitle.startsWith(n.toLocaleString("en-US") + " expressions"),
     "the subtitle's count is the deck's", deck.meta.subtitle);
  ok(deck.meta.desc.includes(n + " set expressions"),
     "and so is the description's");
  const ipa = cards.filter((c) => c.fields.Ipa).length;
  ok(deck.meta.desc.includes("(" + ipa + " of them)"),
     "and its IPA count", String(ipa));
  /* A COUNT OF ONE IS NOT A PLURAL, which this pipeline's description has now
     got wrong three times.  Nothing in the paragraph may read "the other 1",
     "The 1 adjectival phrases" or "1 more were". */
  ok(!/\b(?:the other 1|The 1 |\b1 more were)\b/.test(deck.meta.desc),
     "and nothing in it treats a count of one as a plural");

  console.log("in a browser:");
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port + "/index.html";
  const browser = await chromium.launch({ executablePath: process.env.FOLIO_CHROMIUM });
  const pg = await browser.newPage({ viewport: { width: 1100, height: 900 } });
  const errs = [];
  pg.on("pageerror", (e) => errs.push(String(e)));
  // the day's allowance is five, which is five cards and no sample worth looking
  // at.  Patch the settings on every load rather than seeding a whole state,
  // which the first reload after importing would put back.
  await pg.addInitScript(() => {
    try {
      const s = JSON.parse(localStorage.getItem("folio_v1") || "{}");
      s.settings = Object.assign({}, s.settings, { newPerDay: 400, maxReviewsPerDay: 500 });
      localStorage.setItem("folio_v1", JSON.stringify(s));
    } catch (e) {}
  });

  await pg.goto(base + "#studio", { waitUntil: "load" });
  await pg.waitForTimeout(400);
  const chooser = pg.waitForEvent("filechooser");
  await pg.click("#stImport");
  (await chooser).setFiles(file);
  await pg.waitForSelector(".studio-deck", { timeout: 300000 });
  ok(true, "it imports");

  await pg.goto(base + "#decks", { waitUntil: "load" });
  await pg.waitForTimeout(1200);
  const dirs = await pg.evaluate(() =>
    [...document.querySelectorAll("[data-usubtpl]")]
      .map((r) => r.querySelector(".deck-title")?.textContent.trim()));
  ok(dirs.some((r) => /French . English/.test(r || "")) &&
     dirs.some((r) => /English . French/.test(r || "")),
     "and offers both directions as rows of their own", JSON.stringify(dirs.slice(0, 3)));

  await pg.evaluate(() => {
    const b = [...document.querySelectorAll("[data-uadd]")][0];
    if (b) b.click();
  });
  await pg.waitForTimeout(600);
  await pg.goto(base + "#home", { waitUntil: "load" });
  await pg.waitForTimeout(1500);
  await pg.click(".review-group .cta .btn");
  await pg.waitForSelector(".question", { timeout: 60000 });
  await pg.waitForTimeout(500);

  /* WALK UNTIL EACH SHAPE HAS BEEN SEEN, and photograph one of each.  The deck
     is ordered by frequency, so the first cards are all adverbial phrases and a
     single card proves almost nothing. */
  const want = ["verbal phrase", "adverbial phrase", "interjection", "prepositional phrase"];
  const seen = {};
  for (let i = 0; i < 90 && Object.keys(seen).length < want.length; i++) {
    /* A WALK THIS LONG LEVELS THE READER UP, and levelling up opens an artefact
       chest over the card — a real overlay doing exactly what it should.  The
       assertions read the DOM and survive it, but the SCREENSHOTS do not: the
       first run photographed a chest sitting over the card it was supposed to be
       showing, which is the one thing these images exist for.  Escape is the
       overlay's own way out. */
    if (await pg.$(".chest-pop, .levelup-pop")) {
      await pg.keyboard.press("Escape");
      await pg.waitForTimeout(150);
      await pg.evaluate(() => document.querySelectorAll(".chest-pop, .levelup-pop")
        .forEach((e) => e.remove()));
    }
    await pg.evaluate(() => document.querySelector("#reveal-btn")?.click());
    await pg.waitForTimeout(160);
    const card = await pg.evaluate(() => ({
      word: document.querySelector(".uc-word")?.textContent.trim() || "",
      pos: document.querySelector(".uc-pos")?.textContent.trim() || "",
      art: !!document.querySelector(".uc-art"),
      conj: !!document.querySelector(".uc-cj-grid, .uc-dt2"),
      mean: document.querySelector(".uc-sense")?.textContent.trim() || "",
      exs: document.querySelectorAll(".uc-exi").length,
      tts: document.querySelectorAll(".uc-tts").length,
    }));
    /* THESE TWO ARE ASSERTED ON EVERY CARD WALKED, not on a sample: they are the
       two faults that render as good-looking French and there is no card on
       which either is acceptable. */
    if (card.art) ok(false, "a card showed an article", card.word);
    if (card.conj) ok(false, "a card showed a paradigm", card.word);
    if (want.includes(card.pos) && !seen[card.pos]) {
      seen[card.pos] = card;
      await pg.screenshot({
        path: "/tmp/phrases-" + card.pos.split(" ")[0] + ".png", fullPage: true });
    }
    await pg.evaluate(() =>
      document.querySelector(".grade[data-g='easy']")?.click());
    await pg.waitForTimeout(160);
  }

  for (const w of want) {
    const c = seen[w];
    ok(!!c, "the walk reached a " + w);
    if (!c) continue;
    ok(c.word.includes(" "), "  and it is a multi-word expression", c.word);
    ok(c.mean.length > w.length + 3, "  with a meaning under it", c.mean.slice(0, 80));
    ok(c.tts >= 1, "  and a speaker button", String(c.tts));
  }
  /* The class label is the one thing a translation cannot tell you, so a card
     falling back to the bare part of speech is a real loss. */
  ok(Object.keys(seen).length === want.length,
     "every class the deck teaches names itself as a phrase, not as a bare word class",
     JSON.stringify(Object.keys(seen)));

  ok(errs.length === 0, "no page errors", errs.join(" | "));
  await browser.close();
  server.close();
  console.log("   screenshots: /tmp/phrases-{verbal,adverbial,interjection,prepositional}.png");
  console.log(`\n${fails ? "✗" : "✓"} ${checks - fails} passed, ${fails} failed`);
  process.exit(fails ? 1 : 0);
})();
