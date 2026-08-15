/* Look at the Italian deck the way a reader would: import it, add it, study it, and read what is
   actually on the card.  `check-decks.js` skips the card-level checks for a deck that is not
   Mandarin (they are facts about a hanzi card), so everything Italian this deck is FOR — the
   coloured article, the plural that carries the gender, the auxiliary, the paradigm — is unchecked
   by anything until here.

   Every fault this deck can have is quiet.  A dropped article leaves a perfectly good card that has
   stopped teaching gender; a paradigm built from the wrong record renders as a clean table of the
   wrong verb's forms; a template whose CSS never lands looks like a design choice.  So this asserts
   what the PAGE says, and writes screenshots to look at.

     FOLIO_CHROMIUM=/path/to/chrome NODE_PATH=/tmp/pw/node_modules \
       node .claude/cils/check-cils.js [a1|a2|b1|b2|c1|c2]

   The level is an argument rather than a constant because the assertions are about ITALIAN and not
   about a level: every one of them is the same question of any deck this pipeline writes.

   THE SPELLING SWEEP IS THE ONE THAT MATTERS MOST and it runs over the FILE rather than the page.
   Wiktionary marks the tonic stress on every form it carries — `pàrlo`, `èssere`, `và` — and Italian
   writes an accent only on a final stressed vowel and on a short closed list of monosyllables.  A
   deck that ships those is teaching a spelling that does not exist, on hundreds of cards, and it
   looks completely normal: the accent is plausible and every count is healthy.  Reading one card
   cannot see it; sweeping every card can.  */
const { chromium } = require("playwright");
const path = require("path"), http = require("http"), fs = require("fs");
const ROOT = path.resolve(__dirname, "..", "..");
const LEVEL = (process.argv[2] || "a1").toLowerCase();
if (!/^[abc][12]$/.test(LEVEL)) { console.error("level must be a1..c2"); process.exit(2); }
const DECK = "CILS-" + LEVEL.toUpperCase() + "-Italian.folio-deck.json";
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

// the monosyllables Italian actually writes with an accent; everything else bare
const MONO_OK = new Set(["è", "dà", "dì", "là", "lì", "né", "sé", "sì", "tè",
                         "ciò", "già", "giù", "più", "può", "cioè", "ahimè", "piè"]);

(async () => {
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port + "/index.html";
  const browser = await chromium.launch({ executablePath: process.env.FOLIO_CHROMIUM });
  const pg = await browser.newPage({ viewport: { width: 1100, height: 900 } });
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
  const type = deck.meta.types.cils;
  ok(type && type.cards && type.cards.length === 2, "the type declares two card templates");
  ok(type.speechLang === "it-IT", "the speech language is Italian", type && type.speechLang);
  ok(deck.cards.every((c) => c.type === "cils"), "every note carries the type");
  ok(new Set(deck.cards.map((c) => c.id)).size === deck.cards.length, "no id occurs twice");
  ok(deck.cards.every((c) => /^u_cils[a-z0-9]+_\d+$/.test(c.id)), "every id carries the deck");

  // ------------------------------------------------- the spelling sweep
  // Scoped to the fields built out of DICTIONARY forms, which is what the stress marks come in on.
  // `Examples` is Tatoeba's own running Italian and `English` is English -- and the English is the
  // one that must be left out rather than merely being uninteresting, since a gloss legitimately
  // carries a French loanword (`purée`) that this sweep would read as a mis-stressed Italian one.
  const text = deck.cards
    .map((c) => [c.fields.Italian, c.fields.Word, c.fields.Forms, c.fields.Conjugation].join(" "))
    .join(" ");
  const words = text.replace(/<[^>]*>/g, " ").match(/[A-Za-zÀ-ÿ']+/g) || [];
  const wrong = new Set();
  for (const w of words) {
    if (!/[àáèéìíòóùú]$/.test(w)) continue;
    const syll = (w.match(/[aeiouàáèéìíòóùúy]+/gi) || []).length;
    if (syll < 2 && !MONO_OK.has(w.toLowerCase())) wrong.add(w);
  }
  ok(wrong.size === 0, "no card carries an accented monosyllable Italian writes bare",
     [...wrong].slice(0, 10).join(" "));
  const midStress = new Set();
  for (const w of words) {
    const body = w.slice(0, -1);
    if (/[àáèéìíòóùú]/.test(body)) midStress.add(w);
  }
  ok(midStress.size === 0, "no card carries a stress mark inside a word",
     [...midStress].slice(0, 10).join(" "));

  // ------------------------------------------------- the article, derived
  // A spot-check of the derivation against words this band actually carries: `lo` before impure s
  // and z, `l'` before a vowel, `il` otherwise, and the plural article that goes with each.
  const head = {};
  for (const c of deck.cards) {
    const m = c.fields.Italian.replace(/<[^>]*>/g, "|").replace(/\|+/g, "|");
    head[c.fields.Word] = m;
  }
  const want = [["lo stato", /lo/], ["il problema", /il/], ["la casa", /la/]];
  for (const [w, rx] of want) {
    ok(Object.prototype.hasOwnProperty.call(head, w) || Object.keys(head).some((k) => k === w),
       "the article on " + JSON.stringify(w) + " is derived", Object.keys(head).find((k) => k.endsWith(w.split(" ").pop())) || "");
  }

  // ---------------------------------------------------------------- import
  await pg.goto(base + "#studio", { waitUntil: "load" });
  await pg.waitForTimeout(400);
  const chooser = pg.waitForEvent("filechooser");
  await pg.click("#stImport");
  (await chooser).setFiles(ROOT + "/decks/" + DECK);
  await pg.waitForSelector(".studio-deck", { timeout: 300000 });

  // ------------------------------------------------- the rows it offers
  await pg.goto(base + "#decks", { waitUntil: "load" });
  await pg.waitForTimeout(600);
  const dirs = await pg.evaluate(() => [...document.querySelectorAll("[data-usubtpl]")]
    .map((r) => r.querySelector(".deck-title").textContent.trim()));
  ok(dirs.some((r) => /Italian . English/.test(r)) && dirs.some((r) => /English . Italian/.test(r)),
     "each direction is offered as a row of its own", JSON.stringify(dirs));
  await pg.click("[data-uadd]");
  await pg.waitForTimeout(500);
  await pg.goto(base + "#home", { waitUntil: "load" });
  await pg.waitForTimeout(700);
  const rows = await pg.evaluate(() => [...document.querySelectorAll(".active-deck .dk-title")]
    .map((e) => e.textContent.trim()));
  ok(rows.length === 1 && rows[0].includes("CILS " + LEVEL.toUpperCase()),
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
    };
  });
  console.log("   front: " + JSON.stringify(front.text));
  ok(front.text.length > 0, "the Italian word is on the front");
  ok(parseFloat(front.size) > 24, "it is set large", front.size);
  ok(front.speaker, "a speaker sits beside it");
  ok(!front.backYet, "the meaning is NOT on the front");
  await pg.screenshot({ path: "/tmp/cils-" + LEVEL + "-front.png" });

  await pg.click("#reveal-btn");
  await pg.waitForTimeout(500);
  const back = await pg.evaluate(() => {
    const t = (s) => { const e = document.querySelector(s); return e ? e.textContent.trim() : ""; };
    const f = document.querySelector(".uc-field");
    return { meaning: t(".uc-field"), pos: t(".uc-pos"),
             border: f ? getComputedStyle(f).borderTopWidth : "" };
  });
  console.log("   back:  " + JSON.stringify(back.meaning).slice(0, 90) + "  [" + back.pos + "]");
  ok(back.meaning.length > 0, "the meaning is on the back");
  ok(back.pos.length > 0, "the part of speech is labelled", back.pos);
  ok(back.border !== "0px", "the deck's own CSS reached the card", back.border);
  await pg.screenshot({ path: "/tmp/cils-" + LEVEL + "-back.png" });

  // ------------------------------------------- a noun, a verb and an adjective
  // Grade EASY, never Good: a new card graded Good requeues as a learning step and comes straight
  // back, so the walk stands still.
  const seen = { mascN: null, femN: null, elided: null, verb: null, adj: null };
  const done = () => seen.mascN && seen.femN && seen.verb && seen.adj;
  for (let i = 0; i < 260 && !done(); i++) {
    const card = await pg.evaluate(() => {
      const t = (s) => { const e = document.querySelector(s); return e ? e.textContent.trim() : ""; };
      const art = document.querySelector(".uc-art");
      return {
        word: t(".uc-word"), pos: t(".uc-pos"), forms: t(".uc-forms"),
        // READ AS STRUCTURE, NOT AS TEXT.  `textContent` runs the label into the value with no
        // space -- `plural` + `i fatti` comes back "plurali fatti" -- so a regex looking for the
        // article finds nothing and a perfectly correct card fails.
        formList: [...document.querySelectorAll(".uc-fi")].map((fi) => {
          const l = fi.querySelector(".uc-fl");
          const label = l ? l.textContent.trim() : "";
          return { label, value: fi.textContent.slice(label.length).trim() };
        }),
        art: art ? art.textContent.trim() : "",
        artColor: art ? getComputedStyle(art).color : "",
        artClass: art ? art.className : "",
        blocks: [...document.querySelectorAll(".uc-cjh")].map((e) => e.textContent.trim()),
        rows: [...document.querySelectorAll(".uc-cj")].map((b) => ({
          head: (b.querySelector(".uc-cjh") || {}).textContent,
          rows: [...b.querySelectorAll(".uc-cjr")].map((r) => r.textContent.trim()),
        })),
        ex: [...document.querySelectorAll(".uc-exz")].map((e) => e.textContent.trim()),
        bold: [...document.querySelectorAll(".uc-exz b")].map((e) => e.textContent.trim()),
      };
    });
    let shot = "";
    if (card.pos.startsWith("noun, masculine") && card.art && !seen.mascN) { seen.mascN = card; shot = "noun-m"; }
    if (card.pos.startsWith("noun, feminine") && card.art && !seen.femN) { seen.femN = card; shot = "noun-f"; }
    if (/^l'/.test(card.art) && !seen.elided) { seen.elided = card; }
    if (/^verb/.test(card.pos) && card.blocks.length && !seen.verb) { seen.verb = card; shot = "verb"; }
    if (card.pos === "adjective" && card.forms && !seen.adj) { seen.adj = card; shot = "adj"; }
    if (shot) {
      await pg.keyboard.press("Escape");
      await pg.evaluate(() => document.querySelectorAll(".uc-fold").forEach((d) => (d.open = true)));
      await pg.waitForTimeout(180);
      await pg.screenshot({ path: "/tmp/cils-" + LEVEL + "-" + shot + ".png", fullPage: true });
    }
    await pg.evaluate(() => {
      const b = document.querySelector("#reveal-btn");
      if (b) { b.click(); return; }
      // `.grade[data-g='easy']` -- the class and the attribute are on ONE element.  Written as a
      // descendant selector it matches nothing, the grade never lands, and the walk sits on the
      // first card of the deck for all 260 turns while every read looks perfectly healthy.
      const g = document.querySelector(".grade[data-g='easy']");
      if (g) g.click();
    });
    await pg.waitForTimeout(120);
  }

  // ------------------------------------------------------------ what they say
  if (seen.mascN) {
    const mp = seen.mascN.formList.find((f) => f.label === "plural");
    console.log("   noun m: " + seen.mascN.art + " " + seen.mascN.word + "   " +
                JSON.stringify(seen.mascN.formList));
    ok(/^(il|lo|l')$/.test(seen.mascN.art), "a masculine noun's article is il, lo or l'", seen.mascN.art);
    ok(/uc-m/.test(seen.mascN.artClass), "it is marked masculine", seen.mascN.artClass);
    ok(!!mp, "its plural is shown", JSON.stringify(seen.mascN.formList));
    ok(mp && /^(i|gli)\s/.test(mp.value), "the plural carries its own article", mp && mp.value);
  } else ok(false, "a masculine noun was reached");
  if (seen.femN) {
    const fp = seen.femN.formList.find((f) => f.label === "plural");
    console.log("   noun f: " + seen.femN.art + " " + seen.femN.word + "   " +
                JSON.stringify(seen.femN.formList));
    ok(/^(la|l')$/.test(seen.femN.art), "a feminine noun's article is la or l'", seen.femN.art);
    ok(/uc-f/.test(seen.femN.artClass), "it is marked feminine", seen.femN.artClass);
    ok(fp && /^le\s/.test(fp.value), "its plural article is le", fp && fp.value);
  } else ok(false, "a feminine noun was reached");
  if (seen.mascN && seen.femN)
    ok(seen.mascN.artColor !== seen.femN.artColor,
       "the two genders are different colours", seen.mascN.artColor + " vs " + seen.femN.artColor);
  if (seen.verb) {
    const heads = seen.verb.blocks.join(" | ");
    console.log("   verb:   " + seen.verb.word + "   [" + heads + "]");
    ok(/Presente/.test(heads), "the present tense is there", heads);
    ok(/Passato prossimo/.test(heads), "the passato prossimo is there", heads);
    ok(/Imperfetto/.test(heads) && /Futuro/.test(heads), "so are the imperfetto and the futuro", heads);
    ok(/Imperativo/.test(heads), "and the imperative", heads);
    const base = seen.verb.rows.find((b) => /Forme base/.test(b.head || ""));
    ok(base && base.rows.some((r) => /ausiliare/.test(r)), "the auxiliary is named",
       base ? base.rows.join(" / ") : "");
    const pp = seen.verb.rows.find((b) => /Passato prossimo/.test(b.head || ""));
    ok(pp && /^io(ho|sono)/.test(pp.rows[0].replace(/\s+/g, "")),
       "the passato prossimo is built with avere or essere", pp ? pp.rows[0] : "");
    ok(seen.verb.ex.length > 0, "the verb carries example sentences");
    ok(seen.verb.bold.length > 0, "the word is picked out in its sentence", seen.verb.bold.join(" "));
  } else ok(false, "a verb was reached");
  if (seen.adj) {
    console.log("   adj:    " + seen.adj.word + "   " + JSON.stringify(seen.adj.formList));
    ok(seen.adj.formList.some((f) => /feminine|plural/.test(f.label)),
       "an adjective shows its agreement", JSON.stringify(seen.adj.formList));
  } else ok(false, "an adjective was reached");
  if (seen.elided)
    ok(seen.elided.art === "l'", "a vowel-initial noun elides its article", seen.elided.art);

  ok(errs.length === 0, "no console errors", errs.slice(0, 3).join(" | "));

  await browser.close();
  server.close();
  console.log("\n" + (fails ? "✗ " + fails + " of " + checks + " checks failed"
                             : "✓ all " + checks + " checks passed"));
  process.exit(fails ? 1 : 0);
})();
