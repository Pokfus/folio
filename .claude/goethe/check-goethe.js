/* Look at the German deck the way a reader would: import it, add it, study it, and read what is
   actually on the card.  `check-decks.js` skips the card-level checks for a deck that is not Mandarin
   (they are facts about a hanzi card), so everything German this deck is FOR — the coloured article,
   the plural, the paradigm, the sentences — is unchecked by anything until here.

   Every fault this deck can have is quiet.  A dropped article leaves a perfectly good card that has
   stopped teaching gender; a conjugation built from the wrong record renders as a clean table of the
   wrong verb's forms; a template whose CSS never lands looks like a design choice.  So this asserts
   what the PAGE says, and writes two screenshots to look at.

     FOLIO_CHROMIUM=/path/to/chrome NODE_PATH=/tmp/pw/node_modules \
       node .claude/goethe/check-goethe.js [a1|a2]

   The level is an argument rather than a constant because the assertions are about GERMAN and not
   about a level: every one of them — the article's colour, the plural, the paradigm, the marked
   sentence, the screenshots — is the same question of any deck this pipeline writes, so a second
   level is a word on the command line rather than a second checker to keep in step with this one.  */
const { chromium } = require("playwright");
const path = require("path"), http = require("http"), fs = require("fs");
const ROOT = path.resolve(__dirname, "..", "..");
const LEVEL = (process.argv[2] || "a1").toLowerCase();
if (!/^a[12]$/.test(LEVEL)) { console.error("level must be a1 or a2"); process.exit(2); }
const DECK = "Goethe-" + LEVEL.toUpperCase() + "-German.folio-deck.json";
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
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port + "/index.html";
  const browser = await chromium.launch({ executablePath: process.env.FOLIO_CHROMIUM });
  const pg = await browser.newPage({ viewport: { width: 1100, height: 900 } });
  // The day's allowance is five new cards, which is right for a reader and useless here: the deck is
  // ordered by frequency, so five cards is five function words and no noun, verb or adjective is ever
  // reached.  PATCH the saved settings rather than seeding a whole state -- this runs on every load, and
  // a seed would put the deck back to un-added on the first reload after importing it.
  await pg.addInitScript(() => {
    try {
      const s = JSON.parse(localStorage.getItem("folio_v1") || "{}");
      s.settings = Object.assign({}, s.settings, { newPerDay: 400, maxReviewsPerDay: 500 });
      localStorage.setItem("folio_v1", JSON.stringify(s));
    } catch (e) {}
  });
  const errs = [];
  // ERR_* is the sandbox failing to reach fonts.googleapis.com (the stylesheet's one @import), not the
  // deck; everything else is the deck's and is a failure.
  pg.on("console", (m) => { if (m.type() === "error" && !/net::ERR_/.test(m.text())) errs.push(m.text()); });
  pg.on("pageerror", (e) => errs.push(String(e)));

  const deck = JSON.parse(fs.readFileSync(ROOT + "/decks/" + DECK, "utf8"));
  console.log("=== " + DECK + "   " + deck.cards.length + " notes");

  // ---------------------------------------------------------------- the file
  const type = deck.meta.types.goethe;
  ok(type && type.cards && type.cards.length === 2, "the type declares two card templates");
  ok(type.speechLang === "de-DE", "the speech language is German");
  ok(deck.cards.every((c) => c.type === "goethe"), "every note carries the type");
  ok(new Set(deck.cards.map((c) => c.id)).size === deck.cards.length, "no id occurs twice");
  ok(deck.cards.every((c) => c.id.startsWith("u_goethe" + LEVEL + "_")
                             && /^u_goethe[a-z0-9]+_\d+$/.test(c.id)),
     "every id carries the deck");
  ok(!/Wortliste|goethe\.de/i.test(JSON.stringify(deck.cards)),
     "no card text quotes the source document");

  // ---------------------------------------------------------------- import
  await pg.goto(base + "#studio", { waitUntil: "load" });
  await pg.waitForTimeout(400);
  const chooser = pg.waitForEvent("filechooser");
  await pg.click("#stImport");
  (await chooser).setFiles(ROOT + "/decks/" + DECK);
  await pg.waitForSelector(".studio-deck", { timeout: 240000 });

  // ------------------------------------------------- the rows it offers
  await pg.goto(base + "#decks", { waitUntil: "load" });
  await pg.waitForTimeout(600);
  const entries = await pg.evaluate(() => [...document.querySelectorAll("[data-uadd]")]
    .map((b) => decodeURIComponent(b.getAttribute("data-uadd"))));
  ok(entries.length >= 1, "the deck is addable", JSON.stringify(entries));
  // The two directions are rows to ADD, not rows the deck brings with it -- adding narrow and removing
  // wide is the rule, since a direction holds a subset of its parent's cards and adding it too would
  // surface the reverses in the pooled draw from the first day.  So they belong to this page, and the
  // thing to assert is that a two-template deck offers them at all.
  const dirs = await pg.evaluate(() => [...document.querySelectorAll("[data-usubtpl]")]
    .map((r) => r.querySelector(".deck-title").textContent.trim()));
  ok(dirs.some((r) => /German . English/.test(r)) && dirs.some((r) => /English . German/.test(r)),
     "each direction is offered as a row of its own", JSON.stringify(dirs));
  await pg.click("[data-uadd]");
  await pg.waitForTimeout(500);
  await pg.goto(base + "#home", { waitUntil: "load" });
  await pg.waitForTimeout(700);
  const rows = await pg.evaluate(() => [...document.querySelectorAll(".active-deck .dk-title")]
    .map((e) => e.textContent.trim()));
  ok(rows.length === 1 && rows[0].includes("Goethe " + LEVEL.toUpperCase()),
     "adding the deck adds the deck and not both directions with it", JSON.stringify(rows));

  // ---------------------------------------------------------------- study
  await pg.click(".review-group .cta .btn");
  await pg.waitForSelector(".question", { timeout: 20000 });
  await pg.waitForTimeout(400);

  const front = await pg.evaluate(() => {
    const w = document.querySelector(".uc-word");
    const art = document.querySelector(".uc-art");
    return {
      text: w ? w.textContent.trim() : "",
      size: w ? getComputedStyle(w).fontSize : "",
      art: art ? art.textContent.trim() : "",
      artColor: art ? getComputedStyle(art).color : "",
      inkColor: w ? getComputedStyle(w).color : "",
      speaker: !!document.querySelector(".uc-word .uc-tts"),
      backYet: !!document.querySelector(".uc-field"),
    };
  });
  console.log("   front: " + JSON.stringify(front.text));
  ok(front.text.length > 0, "the German word is on the front");
  ok(parseFloat(front.size) > 24, "it is set large", front.size);
  ok(front.speaker, "a speaker sits beside it");
  ok(!front.backYet, "the meaning is NOT on the front");
  await pg.screenshot({ path: "/tmp/goethe-" + LEVEL + "-front.png" });

  await pg.click("#reveal-btn");
  await pg.waitForTimeout(500);
  const back = await pg.evaluate(() => {
    const t = (s) => { const e = document.querySelector(s); return e ? e.textContent.trim() : ""; };
    return {
      meaning: t(".uc-field"),
      pos: t(".uc-pos"),
      forms: t(".uc-forms"),
      folds: [...document.querySelectorAll(".uc-fold summary")].map((e) => e.textContent.trim()),
      exCount: document.querySelectorAll(".uc-exi").length,
      fieldBorder: (() => { const e = document.querySelector(".uc-field");
        return e ? getComputedStyle(e).borderTopWidth : ""; })(),
    };
  });
  console.log("   back:  " + JSON.stringify(back.meaning).slice(0, 90) + "  [" + back.pos + "]");
  ok(back.meaning.length > 0, "the meaning is on the back");
  ok(back.pos.length > 0, "the part of speech is labelled", back.pos);
  ok(back.fieldBorder !== "0px", "the deck's own CSS reached the card", back.fieldBorder);
  await pg.screenshot({ path: "/tmp/goethe-" + LEVEL + "-back.png" });

  // ------------------------------------------- a noun, a verb and an adjective
  // Grade EASY, never Good: a new card graded Good requeues as a learning step and comes straight back,
  // so the walk stands still.  The button's `data-g` is the grade's NAME -- a numeric one matches nothing
  // and the click silently does nothing, which reads as forty identical cards.
  const seen = { noun: null, verb: null, adj: null };
  for (let i = 0; i < 150 && !(seen.noun && seen.verb && seen.adj); i++) {
    const card = await pg.evaluate(() => {
      const t = (s) => { const e = document.querySelector(s); return e ? e.textContent.trim() : ""; };
      const art = document.querySelector(".uc-art");
      return {
        word: t(".uc-word"), pos: t(".uc-pos"), forms: t(".uc-forms"),
        art: art ? art.textContent.trim() : "", artColor: art ? getComputedStyle(art).color : "",
        conj: [...document.querySelectorAll(".uc-cj-h")].map((e) => e.textContent.trim()),
        conjRows: [...document.querySelectorAll(".uc-cj-r")].slice(0, 6)
          .map((e) => e.textContent.trim()),
        nonfinite: [...document.querySelectorAll(".uc-cj-nfi")].map((e) => e.textContent.trim()),
        // the paradigm panel as a grid: one row of cells per case
        decl: [...document.querySelectorAll(".uc-dtr")].map((r) =>
          [...r.children].map((c) => c.textContent.trim())),
        // …AND WHERE ITS CELLS ACTUALLY SIT.  Both faults this table has had were
        // invisible to every reading of the DOM and obvious in a picture: a
        // dropped custom property wrapped each row onto two lines, and a zero
        // track floor let the cells OVERLAP on a phone.  The markup was perfect
        // in both.  So the cells of a row are measured: one line, left to right,
        // no two boxes overlapping.
        declBoxes: [...document.querySelectorAll(".uc-dtr")].map((r) =>
          [...r.children].map((c) => {
            const b = c.getBoundingClientRect();
            return [Math.round(b.left), Math.round(b.right),
                    Math.round(b.top), Math.round(b.bottom)];
          })),
        ex: [...document.querySelectorAll(".uc-exz")].map((e) => e.textContent.trim()),
        bold: [...document.querySelectorAll(".uc-exz b")].map((e) => e.textContent.trim()),
      };
    });
    // A screenshot of each KIND, with the folds open: the examples and the paradigm are the two things
    // most worth looking at and both are behind a shut <details>, so a picture of a card as dealt shows
    // neither.  The pronoun the session opens on is the least representative card in the deck.
    let shot = "";
    if (card.pos.startsWith("noun") && card.art && !seen.noun) { seen.noun = card; shot = "noun"; }
    if (/verb/.test(card.pos) && card.conj.length && !seen.verb) { seen.verb = card; shot = "verb"; }
    if (card.pos === "adjective" && /comparative/.test(card.forms) && !seen.adj) { seen.adj = card; shot = "adj"; }
    if (shot) {
      // grading a hundred cards earns levels, and a chest overlay sits over the card.  The walk itself
      // is unaffected (it clicks through `evaluate`, which does not hit-test) -- only the picture is.
      await pg.keyboard.press("Escape");
      await pg.evaluate(() => document.querySelectorAll(".uc-fold").forEach((d) => (d.open = true)));
      await pg.waitForTimeout(120);
      await pg.screenshot({ path: "/tmp/goethe-" + LEVEL + "-" + shot + ".png", fullPage: true });
    }
    await pg.evaluate(() => {
      const b = document.querySelector(".grade[data-g='easy']");
      if (b) b.click();
    });
    await pg.waitForTimeout(190);
    if (!(await pg.$("#reveal-btn"))) break;
    await pg.evaluate(() => document.querySelector("#reveal-btn").click());
    await pg.waitForTimeout(190);
  }

  console.log("   noun:  " + JSON.stringify(seen.noun && [seen.noun.word, seen.noun.forms]));
  ok(seen.noun, "a noun came up in the first forty cards");
  if (seen.noun) {
    ok(/^(der|die|das)$/.test(seen.noun.art), "it carries its article", seen.noun.art);
    ok(/plural/.test(seen.noun.forms) || /plural only/.test(seen.noun.pos + seen.noun.forms),
       "and its plural", seen.noun.forms);
    ok(seen.noun.artColor !== "rgb(0, 0, 0)" && seen.noun.artColor.length > 0,
       "the article is coloured by gender", seen.noun.artColor);
    // THE WHOLE PARADIGM, not just the plural: the four cases against singular and
    // plural, each cell carrying the DECLINED ARTICLE, which is what makes the table
    // teach the case rather than list four spellings of one word.
    const nrows = seen.noun.decl.filter((r) => /^(Nominativ|Akkusativ|Dativ|Genitiv)$/.test(r[0]));
    ok(nrows.length === 4, "its declension shows all four cases",
       JSON.stringify(seen.noun.decl.map((r) => r[0])));
    ok(nrows.some((r) => r.slice(1).some((c) => /^des |^der |^dem |^den /.test(c))),
       "with the article declined beside each form", JSON.stringify(nrows[3]));
  }
  console.log("   verb:  " + JSON.stringify(seen.verb && [seen.verb.word, seen.verb.conj, seen.verb.conjRows.slice(0, 3)]));
  ok(seen.verb, "a verb came up");
  if (seen.verb) {
    ok(seen.verb.conj.join(" ").includes("Präsens"), "the present tense is there", seen.verb.conj.join(", "));
    ok(seen.verb.conj.join(" ").includes("Perfekt"), "so is the Perfekt");
    ok(seen.verb.conj.join(" ").includes("Imperativ"), "so is the imperative");
    ok(seen.verb.nonfinite.some((s) => /auxiliary/i.test(s)),
       "and which auxiliary it takes", JSON.stringify(seen.verb.nonfinite));
    ok(seen.verb.conjRows.length >= 6, "six persons are shown");
  }
  console.log("   adj:   " + JSON.stringify(seen.adj && [seen.adj.word, seen.adj.forms]));
  ok(seen.adj, "an adjective came up");
  if (seen.adj) {
    ok(/superlative/.test(seen.adj.forms), "with its comparative and superlative", seen.adj.forms);
    // A GERMAN ADJECTIVE HAS THREE DECLENSIONS, chosen by the article in front of
    // it, and a card showing one of the three teaches a third of the ending rule.
    ok(seen.adj.conj.length === 3, "and all three declension paradigms",
       JSON.stringify(seen.adj.conj));
    const arows = seen.adj.decl.filter((r) => r[0] === "Dativ");
    ok(arows.length === 3 && arows.every((r) => r.length === 5),
       "each four cases wide, m/f/n/plural", JSON.stringify(arows[0]));
    // the cells share a BASELINE and not a top -- the row label is set two points
    // smaller than the forms -- so "one line" is that their vertical extents
    // overlap, which a wrapped row's would not
    const bad = (seen.adj.declBoxes || []).find((cells) =>
      cells.some((c, i) => i && (c[2] >= cells[i - 1][3] || c[3] <= cells[i - 1][2]
                                 || c[0] < cells[i - 1][1])));
    ok(!bad, "and every row is one line of cells that do not overlap",
       JSON.stringify(bad));
  }

  // --------------------------------------------------------- the three colours
  const cols = await pg.evaluate(() => {
    const out = {};
    for (const [g, cls] of [["der", "uc-m"], ["die", "uc-f"], ["das", "uc-n"]]) {
      const s = document.createElement("span");
      s.className = "uc-art " + cls;
      (document.querySelector(".uc-card") || document.body).appendChild(s);
      out[g] = getComputedStyle(s).color;
      s.remove();
    }
    return out;
  });
  console.log("   gender colours: " + JSON.stringify(cols));
  ok(new Set(Object.values(cols)).size === 3, "der, die and das are three different colours",
     JSON.stringify(cols));

  ok(errs.length === 0, "no console errors", errs.slice(0, 3).join(" | "));
  console.log("\n" + (fails ? "✗ " + fails + " of " + checks + " checks failed"
                            : "✓ all " + checks + " checks passed"));
  console.log("screenshots: /tmp/goethe-" + LEVEL + "-*.png");
  await browser.close();
  server.close();
  process.exit(fails ? 1 : 0);
})();
