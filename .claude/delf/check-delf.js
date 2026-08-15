/* Look at the French deck the way a reader would: import it, add it, study it, and read what is
   actually on the card.  `check-decks.js` skips the card-level checks for a deck that is not Mandarin
   (they are facts about a hanzi card), so everything French this deck is FOR — the coloured article,
   the elided `l'` and the un/une that recovers the gender, the passé composé, the agreement table,
   the pronunciation — is unchecked by anything until here.

   Every fault this deck can have is quiet.  A dropped article leaves a perfectly good card that has
   stopped teaching gender; a passé composé built with the wrong auxiliary renders as a clean table of
   French that is wrong; a template whose CSS never lands looks like a design choice.  So this asserts
   what the PAGE says, and writes four screenshots to look at.

     FOLIO_CHROMIUM=/path/to/chrome NODE_PATH=/tmp/pw/node_modules \
       node .claude/delf/check-delf.js [a1|a2|b1|b2]

   The level is an argument rather than a constant because the assertions are about FRENCH and not
   about a level: every one of them is the same question of any deck this pipeline writes, so a second
   level is a word on the command line rather than a second checker to keep in step with this one.  */
const { chromium } = require("playwright");
const path = require("path"), http = require("http"), fs = require("fs");
const ROOT = path.resolve(__dirname, "..", "..");
const LEVEL = (process.argv[2] || "a1").toLowerCase();
if (!/^(a[12]|b[12])$/.test(LEVEL)) { console.error("level must be a1, a2, b1 or b2"); process.exit(2); }
const DECK = "DELF-" + LEVEL.toUpperCase() + "-French.folio-deck.json";
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
  // reached.  PATCH the saved settings rather than seeding a whole state — this runs on every load, and
  // a seed would put the deck back to un-added on the first reload after importing it.
  await pg.addInitScript(() => {
    try {
      const s = JSON.parse(localStorage.getItem("folio_v1") || "{}");
      s.settings = Object.assign({}, s.settings, { newPerDay: 400, maxReviewsPerDay: 500 });
      localStorage.setItem("folio_v1", JSON.stringify(s));
    } catch (e) {}
  });
  const errs = [];
  pg.on("console", (m) => { if (m.type() === "error" && !/net::ERR_/.test(m.text())) errs.push(m.text()); });
  pg.on("pageerror", (e) => errs.push(String(e)));

  const deck = JSON.parse(fs.readFileSync(ROOT + "/decks/" + DECK, "utf8"));
  console.log("=== " + DECK + "   " + deck.cards.length + " notes");

  // ---------------------------------------------------------------- the file
  const type = deck.meta.types.delf;
  ok(type && type.cards && type.cards.length === 2, "the type declares two card templates");
  ok(type.speechLang === "fr-FR", "the speech language is French");
  ok(deck.cards.every((c) => c.type === "delf"), "every note carries the type");
  ok(new Set(deck.cards.map((c) => c.id)).size === deck.cards.length, "no id occurs twice");
  ok(deck.cards.every((c) => c.id.startsWith("u_delf" + LEVEL + "_")), "every id carries the deck");
  // The word list is a third party's page and only the WORDS are taken from it; nothing that page
  // wrote about them should be anywhere in the deck.
  ok(!/minddory/i.test(JSON.stringify(deck.cards)), "no card text quotes the source page");
  // The four entries that are not French words, and the one that is a rare verb: none may survive.
  const words = new Set(deck.cards.map((c) => c.fields.Word));
  ok(!words.has("exercise") && !words.has("loud") && !words.has("cinema") &&
     !words.has("france") && !words.has("renter"),
     "the list's broken entries were repaired or dropped");
  ok(words.has("exercice") && words.has("cinéma") && words.has("France") && words.has("rentrer"),
     "and their repairs are in the deck");
  ok(!words.has("chaussures") && !words.has("parents") && !words.has("salle de bain"),
     "the duplicates were merged away");

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
  const dirs = await pg.evaluate(() => [...document.querySelectorAll("[data-usubtpl]")]
    .map((r) => r.querySelector(".deck-title").textContent.trim()));
  ok(dirs.some((r) => /French . English/.test(r)) && dirs.some((r) => /English . French/.test(r)),
     "each direction is offered as a row of its own", JSON.stringify(dirs));
  await pg.click("[data-uadd]");
  await pg.waitForTimeout(500);
  await pg.goto(base + "#home", { waitUntil: "load" });
  await pg.waitForTimeout(700);
  const rows = await pg.evaluate(() => [...document.querySelectorAll(".active-deck .dk-title")]
    .map((e) => e.textContent.trim()));
  ok(rows.length === 1 && rows[0].includes("DELF " + LEVEL.toUpperCase()),
     "adding the deck adds the deck and not both directions with it", JSON.stringify(rows));

  // ---------------------------------------------------------------- study
  await pg.click(".review-group .cta .btn");
  await pg.waitForSelector(".question", { timeout: 20000 });
  await pg.waitForTimeout(400);

  const front = await pg.evaluate(() => {
    const w = document.querySelector(".uc-word");
    return {
      text: w ? w.textContent.trim() : "",
      size: w ? getComputedStyle(w).fontSize : "",
      speaker: !!document.querySelector(".uc-word .uc-tts"),
      backYet: !!document.querySelector(".uc-field"),
      ipaYet: !!document.querySelector(".uc-ipa"),
    };
  });
  console.log("   front: " + JSON.stringify(front.text));
  ok(front.text.length > 0, "the French word is on the front");
  ok(parseFloat(front.size) > 24, "it is set large", front.size);
  ok(front.speaker, "a speaker sits beside it");
  ok(!front.backYet, "the meaning is NOT on the front");
  // The pronunciation is a hint at the answer's SOUND and not at its meaning, but it is still an
  // answer-side fact: the templates put it on the back only, and this is what says so.
  ok(!front.ipaYet, "the pronunciation is NOT on the front");
  await pg.screenshot({ path: "/tmp/delf-" + LEVEL + "-front.png" });

  await pg.click("#reveal-btn");
  await pg.waitForTimeout(500);
  const back = await pg.evaluate(() => {
    const t = (s) => { const e = document.querySelector(s); return e ? e.textContent.trim() : ""; };
    return {
      meaning: t(".uc-field"), pos: t(".uc-pos"), ipa: t(".uc-ipa"),
      fieldBorder: (() => { const e = document.querySelector(".uc-field");
        return e ? getComputedStyle(e).borderTopWidth : ""; })(),
    };
  });
  console.log("   back:  " + JSON.stringify(back.meaning).slice(0, 90) + "  [" + back.pos + "]");
  ok(back.meaning.length > 0, "the meaning is on the back");
  ok(back.pos.length > 0, "the part of speech is labelled", back.pos);
  ok(back.fieldBorder !== "0px", "the deck's own CSS reached the card", back.fieldBorder);
  await pg.screenshot({ path: "/tmp/delf-" + LEVEL + "-back.png" });

  // ---------------------------- a noun, an elided noun, a verb and an adjective
  // Grade EASY, never Good: a new card graded Good requeues as a learning step and comes straight
  // back, so the walk stands still.  The button's `data-g` is the grade's NAME — a numeric one matches
  // nothing and the click silently does nothing, which reads as forty identical cards.
  const seen = { noun: null, elided: null, verb: null, etre: null, adj: null };
  const done = () => seen.noun && seen.elided && seen.verb && seen.etre && seen.adj;
  for (let i = 0; i < 260 && !done(); i++) {
    const card = await pg.evaluate(() => {
      const t = (s) => { const e = document.querySelector(s); return e ? e.textContent.trim() : ""; };
      const art = document.querySelector(".uc-art");
      return {
        word: t(".uc-word"), pos: t(".uc-pos"), forms: t(".uc-forms"), ipa: t(".uc-ipa"),
        art: art ? art.textContent.trim() : "", artColor: art ? getComputedStyle(art).color : "",
        conj: [...document.querySelectorAll(".uc-cj-h")].map((e) => e.textContent.trim()),
        conjRows: [...document.querySelectorAll(".uc-cj-r")].map((e) => e.textContent.trim()),
        nonfinite: [...document.querySelectorAll(".uc-cj-nfi")].map((e) => e.textContent.trim()),
        // the agreement table as a grid: one row of cells per number
        decl: [...document.querySelectorAll(".uc-dtr")].map((r) =>
          [...r.children].map((c) => c.textContent.trim())),
        // …AND WHERE ITS CELLS ACTUALLY SIT.  The German deck records both of this table's faults
        // being invisible to every reading of the DOM and obvious in a picture: a dropped custom
        // property wrapped each row onto two lines, and a zero track floor let the cells OVERLAP on a
        // phone.  So the cells of a row are measured: one line, left to right, no two boxes crossing.
        declBoxes: [...document.querySelectorAll(".uc-dtr")].map((r) =>
          [...r.children].map((c) => {
            const b = c.getBoundingClientRect();
            return [Math.round(b.left), Math.round(b.right), Math.round(b.top), Math.round(b.bottom)];
          })),
        ex: [...document.querySelectorAll(".uc-exz")].map((e) => e.textContent.trim()),
        bold: [...document.querySelectorAll(".uc-exz b")].map((e) => e.textContent.trim()),
      };
    });
    let shot = "";
    if (!seen.noun && card.pos.startsWith("noun") && card.art && !card.art.includes("'")) {
      seen.noun = card; shot = "noun";
    }
    if (!seen.elided && card.art && card.art.includes("'")) { seen.elided = card; shot = "elided"; }
    if (!seen.verb && card.conj.includes("Passé composé")) {
      seen.verb = card; if (!shot) shot = "verb";
    }
    if (!seen.etre && card.nonfinite.some((s) => /auxiliary\s*être/.test(s))) {
      seen.etre = card; if (!shot) shot = "etre";
    }
    if (!seen.adj && card.pos.startsWith("adjective") && card.decl.length) {
      seen.adj = card; if (!shot) shot = "adj";
    }
    if (shot) {
      // the examples and the paradigm are the two things most worth looking at and both are behind a
      // shut <details>, so a picture of a card as dealt shows neither
      await pg.evaluate(() => document.querySelectorAll(".uc-fold").forEach((d) => (d.open = true)));
      await pg.waitForTimeout(120);
      await pg.screenshot({ path: "/tmp/delf-" + LEVEL + "-" + shot + ".png", fullPage: true });
    }
    const more = await pg.evaluate(() => {
      // `.grade[data-g='easy']` and NOT `.grade [data-g='easy']`: the class and the attribute are on
      // the SAME button, so the descendant form matches nothing, every click silently does nothing,
      // and the walk stands on the first card of the deck reporting that it found no noun, no verb
      // and no adjective — which reads as a broken deck rather than as a broken selector.
      const b = document.querySelector(".grade[data-g='easy']");
      if (b) { b.click(); return true; }
      return false;
    });
    if (!more) break;
    await pg.waitForTimeout(120);
    // A WALK THIS LONG LEVELS THE READER UP, and levelling up opens an artefact chest over the card.
    // It is a real overlay doing exactly what it should, and it swallows the click on Reveal — so the
    // run dies on a timeout naming an SVG, forty cards into a deck with nothing wrong with it.  Escape
    // is the overlay's own way out; the reveal is clicked through `evaluate` for the same reason, since
    // Playwright's actionability check waits for a card that is still animating in.
    if (await pg.$(".chest-pop, .levelup-pop")) {
      await pg.keyboard.press("Escape");
      await pg.waitForTimeout(150);
      await pg.evaluate(() => document.querySelectorAll(".chest-pop, .levelup-pop")
        .forEach((e) => e.remove()));
    }
    await pg.evaluate(() => { const b = document.querySelector("#reveal-btn"); if (b) b.click(); });
    await pg.waitForTimeout(200);
  }

  console.log("   walked to: " + Object.entries(seen)
    .map(([k, v]) => k + "=" + (v ? JSON.stringify(v.word) : "—")).join("  "));

  // ------------------------------------------------------------- the noun
  if (seen.noun) {
    ok(/^(le|la|les)$/.test(seen.noun.art), "a noun prints its article", seen.noun.art);
    ok(/noun, (masculine|feminine)|noun, plural/.test(seen.noun.pos),
       "and names its gender", seen.noun.pos);
    ok(seen.noun.ipa.startsWith("/"), "the pronunciation is on the back", seen.noun.ipa);
  } else ok(false, "the walk reached a noun with an article");

  // ------------------------------------------------- the elided noun
  // THE FAULT THIS DECK EXISTS TO AVOID.  `l'` is the same string for both genders, so a card that
  // prints it and nothing else has stopped teaching the one thing an article is there for.
  if (seen.elided) {
    ok(seen.elided.art === "l'", "an elided noun prints l'", seen.elided.art);
    ok(/with un\/une\s*(un|une)\s/.test(seen.elided.forms.replace(/\s+/g, " ")),
       "and recovers the gender with un or une", seen.elided.forms);
  } else ok(false, "the walk reached a noun whose article elides");

  // ------------------------------------------------------------- the verb
  if (seen.verb) {
    for (const t of ["Présent", "Passé composé", "Imparfait", "Futur simple", "Impératif"])
      ok(seen.verb.conj.includes(t), "the verb's paradigm has the " + t, seen.verb.conj.join(" "));
    ok(seen.verb.nonfinite.some((s) => /auxiliary/.test(s)),
       "and names the auxiliary it takes", seen.verb.nonfinite.join(" | "));
    ok(seen.verb.conjRows.length >= 20, "and runs to all six persons in each tense",
       String(seen.verb.conjRows.length));
    // The elision is composed, so it is asserted: `j'ai`, `j'aime` — never `je ai`.
    ok(!seen.verb.conjRows.some((r) => /\bje [aeiouéèêh]/i.test(r)),
       "and elides je before a vowel", seen.verb.conjRows.slice(0, 3).join(" | "));
  } else ok(false, "the walk reached a verb");

  // --------------------------------------- a verb whose auxiliary is être
  // WHICH AUXILIARY A VERB TAKES IS THE FACT THE PANEL EXISTS FOR, and the agreement bracket is how
  // the passé composé teaches it.  A deck that quietly gave every verb `avoir` would look perfect.
  if (seen.etre) {
    const pc = seen.etre.conjRows.find((r) => /suis|es |est |sommes|êtes|sont/.test(r));
    ok(!!pc && /\(e\)/.test(seen.etre.conjRows.join(" ")),
       "an être verb's passé composé shows the agreement", pc || "");
  } else ok(false, "the walk reached a verb taking être");

  // -------------------------------------------------------- the adjective
  if (seen.adj) {
    ok(seen.adj.decl.length >= 3, "an adjective shows its agreement table",
       JSON.stringify(seen.adj.decl));
    ok(/feminine/.test(seen.adj.forms), "and its feminine beside the word", seen.adj.forms);
    const flat = seen.adj.declBoxes.flat();
    // An EMPTY cell is skipped: the header row's first cell is the blank corner above `singulier`,
    // and an empty span under `align-items: baseline` has no baseline to sit on, so its box floats to
    // the row's top and reads as a wrapped line when nothing has wrapped.  What the check is for is a
    // row of WORDS breaking onto two lines, so it is the words that are measured.
    const filled = seen.adj.declBoxes.map((row, i) =>
      row.filter((c, j) => (seen.adj.decl[i][j] || "").length > 0));
    const oneLine = filled.every((row) =>
      row.every((c) => Math.abs(c[2] - row[0][2]) < 6));
    ok(oneLine, "each row of that table sits on one line", JSON.stringify(filled));
    const noOverlap = seen.adj.declBoxes.every((row) =>
      row.every((c, i) => i === 0 || c[0] >= row[i - 1][1] - 1));
    ok(noOverlap, "and no two of its cells overlap", JSON.stringify(seen.adj.declBoxes[0]));
    ok(flat.length > 0, "and it has boxes at all");
  } else ok(false, "the walk reached an adjective");

  // ------------------------------------------- le and la are told apart
  // The colour IS the gender lesson, so two genders printing the same colour is the whole feature
  // silently gone.
  const cols = {};
  for (const k of ["noun", "elided", "verb", "adj"]) {
    const c = seen[k];
    if (c && c.art) cols[c.art + "|" + (c.pos.match(/masculine|feminine/) || [""])[0]] = c.artColor;
  }
  console.log("   article colours: " + JSON.stringify(cols));

  // ------------------------------------------------------------- examples
  const withEx = seen.noun || seen.verb || seen.adj;
  if (withEx) {
    ok(withEx.ex.length >= 1, "a card carries example sentences", String(withEx.ex.length));
    ok(withEx.bold.length >= 1, "with the word picked out in one of them",
       JSON.stringify(withEx.bold.slice(0, 3)));
  }

  ok(errs.length === 0, "no console errors", errs.slice(0, 2).join(" | "));
  console.log("\n   " + (fails ? fails + " FAILED of " + checks : "all " + checks + " passed"));
  console.log("   screenshots: /tmp/delf-" + LEVEL + "-{front,back,noun,elided,verb,etre,adj}.png");
  await browser.close();
  server.close();
  process.exit(fails ? 1 : 0);
})();
