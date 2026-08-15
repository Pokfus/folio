/* Look at the Portuguese deck the way a reader would: import it, add it, study it, and read what is
   actually on the card.  `check-decks.js` skips the card-level checks for a deck that is not Mandarin
   (they are facts about a hanzi card), so everything PORTUGUESE this deck is FOR — the article coloured
   by gender, the conjuntivo, the personal infinitive, where the pronoun sits — is unchecked by anything
   until here.

     FOLIO_CHROMIUM=/path/to/chrome NODE_PATH=/tmp/pw/node_modules \
       node .claude/caple/check-caple.js [a1]

   TWO KINDS OF ASSERTION, and the split is deliberate.  What is EUROPEAN about this deck is a fact
   about the generated text, so it is checked in the FILE, exactly, over every card — a wrong clitic on
   one verb in eleven would never be reached by a walk through a session, and a walk that happened to
   reach it would still only prove that one.  What is RENDERED is checked in the BROWSER, because the
   article's colour, the folds and the deck's own CSS are questions no reading of the JSON can answer.

   Every fault this deck can have is quiet.  A Brazilian sense chosen over a European one renders as a
   clean card glossing `o comboio` as `convoy`; the future of a reflexive built by ordinary enclisis
   renders as a regular-looking table of forms no Portuguese speaker would produce; a dropped article
   leaves a perfectly good card that has stopped teaching gender.  So this asserts what the text SAYS,
   and writes screenshots to look at.

   THE BRAZILIAN SWEEP IS WRITTEN HERE BY HAND AND IS NOT THE GENERATOR'S.  `examples.py` rejects a
   sentence on its own pattern, so re-using that pattern would pass by construction on whatever it let
   through.  The list below is a short second opinion — unmistakable Brazilian lexis and the
   `estar + gerund` progressive Portugal writes as `estar a + infinitive` — and it is run over the
   PORTUGUESE half of each example only: the English translation beside it says "next time" and "on
   time", and `time` is also the Brazilian word for a football team.  */
const { chromium } = require("playwright");
const path = require("path"), http = require("http"), fs = require("fs");
const ROOT = path.resolve(__dirname, "..", "..");
const LEVEL = (process.argv[2] || "a1").toLowerCase();
if (!/^(a[12]|b[12]|c[12])$/.test(LEVEL)) { console.error("level must be a1..c2"); process.exit(2); }

/* THE PROBES ARE PER LEVEL BECAUSE THE WORDS ARE.  Every assertion below is
   about EUROPEAN PORTUGUESE and is the same question of any level this
   pipeline builds — but it has to be asked about a word the level teaches, and
   a level is taught on top of the ones below it, so `o comboio` is in A1 and in
   no other deck.  The expected verb forms are written out rather than derived
   from the infinitive: a derivation here could share a bug with the one in
   `build_deck.py`, and then the two would agree with each other and be wrong
   together.  Adding a level means adding a row. */
const PROBE = {
  a1: {
    // a European word whose Brazilian counterpart is a different word
    glosses: [["o comboio", /train/i], ["o autocarro", /bus/i],
              ["o telemóvel", /(mobile|cell)/i], ["o pequeno-almoço", /breakfast/i]],
    // Portugal writes dezasseis where Brazil writes dezesseis
    numbers: ["dezasseis", "catorze"],
    preterite: ["falar", "falámos", "falamos"],
    reflexive: "chamar-se",
    forms: { pres: "eu chamo-me", plural: "nós chamamo-nos", conj: "eu me chame",
             fut: "eu chamar-me-ei", futPl: "nós chamar-nos-emos",
             cond: "eu chamar-me-ia", condVos: "vós chamar-vos-íeis",
             neg: "tu não te chames", pinf: "nós chamarmo-nos" },
    // no imperative: nobody can be told to snow or to ache
    impersonal: ["doer", "nevar"],
  },
  a2: {
    glosses: [["o duche", /shower/i], ["o fato", /suit/i],
              ["a camisola", /(sweater|jumper|jersey)/i]],
    numbers: [],
    preterite: ["voltar", "voltámos", "voltamos"],
    reflexive: "tornar-se",
    forms: { pres: "eu torno-me", plural: "nós tornamo-nos", conj: "eu me torne",
             fut: "eu tornar-me-ei", futPl: "nós tornar-nos-emos",
             cond: "eu tornar-me-ia", condVos: "vós tornar-vos-íeis",
             neg: "tu não te tornes", pinf: "nós tornarmo-nos" },
    impersonal: [],
  },
}[LEVEL];
if (!PROBE) { console.error("no probes written for level " + LEVEL); process.exit(2); }
const DECK = "CAPLE-" + LEVEL.toUpperCase() + "-Portuguese.folio-deck.json";
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
const txt = (s) => String(s || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

(async () => {
  const deck = JSON.parse(fs.readFileSync(ROOT + "/decks/" + DECK, "utf8"));
  const cards = deck.cards;
  const by = {}; cards.forEach((c) => (by[c.question] = c));
  console.log("=== " + DECK + "   " + cards.length + " notes");

  // ================================================================ the file
  const type = deck.meta.types.caple;
  ok(type && type.cards && type.cards.length === 2, "the type declares two card templates");
  ok(type.speechLang === "pt-PT", "the speech language is European Portuguese, not pt-BR",
     type && type.speechLang);
  ok(cards.every((c) => c.type === "caple"), "every note carries the type");
  ok(new Set(cards.map((c) => c.id)).size === cards.length, "no id occurs twice");
  ok(cards.every((c) => new RegExp("^u_caple" + LEVEL + "_\\d+$").test(c.id)),
     "every id carries the deck");
  // The word inventory is taken from the Referencial; its prose is not, exactly as the German deck
  // takes the Wortliste and leaves the Goethe-Institut's example sentences alone.
  ok(!/Referencial|instituto-camoes|Camões PLE/i.test(JSON.stringify(cards)),
     "no card text quotes the source document");

  // ------------------------------------------------- European, not Brazilian
  const all = JSON.stringify(cards);
  ok(!/Subjuntivo/.test(all), "the mood is headed Conjuntivo and never Subjuntivo");
  ok(!/Futuro do pret/.test(all), "and the tense Condicional, never Futuro do pretérito");
  // Portugal writes dezasseis / dezassete / dezanove / catorze where Brazil writes dezesseis /
  // dezessete / dezenove / quatorze.  A number is the last word anyone checks and the first a
  // beginner learns, so a Brazilian one would sit in the deck for good.
  const brNums = cards.map((c) => c.question)
    .filter((q) => /\b(dezesseis|dezessete|dezenove|quatorze)\b/.test(q));
  ok(brNums.length === 0, "the numbers are the European forms", JSON.stringify(brNums));
  if (PROBE.numbers.length)
    ok(PROBE.numbers.every((w) => !!by[w]), "the European numerals are taught",
       JSON.stringify(PROBE.numbers.filter((w) => !by[w])));

  // THE SENSE, not just the headword.  `comboio` has a Portugal-tagged "train" sense and an untagged
  // "convoy" one, and the untagged sense wins under any ranking that does not reward the European tag
  // — which is what shipped for an hour, glossing the commonest word for a train as `convoy`.
  // The words are ones the level's own inventory carries: `frigorífico` and `sandes` are shibboleths
  // for the FREQUENCY LIST (see `run.py --variety-check`) and are not A1 or A2 vocabulary.
  for (const [w, want] of PROBE.glosses) {
    const c = by[w];
    if (!c) { ok(false, w + " is in the deck"); continue; }
    ok(want.test(txt(c.fields.English)), w + " glosses as its European sense",
       txt(c.fields.English).slice(0, 70));
  }

  // A BRAZIL-TAGGED VERB FORM DROPPED HERE IS THE SINGLE MOST IMPORTANT LINE IN `build_deck.py`:
  // without it almost every -ar verb shows `falamos` in the preterite beside `falámos` in the present,
  // with nothing on the card to say which is which.
  const [pv, pEu, pBr] = PROBE.preterite;
  const pvc = by[pv];
  if (pvc) {
    const pret = txt(pvc.fields.Conjugation).match(/Pretérito perfeito.{0,120}/);
    ok(pret && pret[0].includes(pEu) && !new RegExp("\\b" + pBr + "\\b").test(pret[0]),
       `the preterite of ${pv} is ${pEu} and not the Brazilian ${pBr}`,
       pret && pret[0].slice(0, 80));
  } else ok(false, pv + " is in the deck");

  // ------------------------------------------------- where the pronoun goes
  // FOUR PLACEMENTS, and each is a different rule.  Nothing else in this repo can see any of them:
  // every table is the right shape and the right length whichever way round the pronoun is written.
  const refl = cards.filter((c) => /-se$/.test(c.question));
  ok(refl.length > 0, "the deck teaches reflexive verbs", String(refl.length));
  const ch = by[PROBE.reflexive];
  if (ch) {
    const t = txt(ch.fields.Conjugation);
    const F = PROBE.forms;
    const has = (s) => t.includes(s);
    ok(has(F.pres), "the indicative takes enclisis: " + F.pres);
    ok(has(F.plural), "the first person plural drops its -s before -nos: " + F.plural);
    ok(has(F.conj), "the conjuntivo takes proclisis: (que) " + F.conj);
    // MESOCLISIS: the future and the conditional put the pronoun INSIDE the verb.  Written as
    // ordinary enclisis they come out `chamarei-me`, which is not Portuguese — and looks entirely
    // regular in a table of six rows.
    ok(has(F.fut), "the future takes mesoclisis: " + F.fut);
    ok(has(F.futPl), "…in the plural too: " + F.futPl);
    ok(has(F.cond), "and so does the conditional: " + F.cond);
    ok(has(F.condVos), "with the conditional vós ending kept whole: " + F.condVos,
       (t.match(/Condicional.{0,160}/) || [""])[0].slice(-60));
    ok(has(F.neg), "a negative imperative takes proclisis: " + F.neg);
    ok(has(F.pinf), "and the personal infinitive enclisis: " + F.pinf);
  } else ok(false, PROBE.reflexive + " is in the deck");

  // …over EVERY reflexive, not just the one read by eye.  A future built by enclisis is
  // `<infinitive> + ending + -pronoun`, which is exactly what mesoclisis replaces.
  const badMeso = [];
  for (const c of refl) {
    const inf = c.question.slice(0, -3);
    const rx = new RegExp("\\b" + inf + "(?:ei|ás|á|emos|eis|ão|ia|ias|íamos|íeis|iam)-(?:me|te|se|nos|vos)\\b", "g");
    const s = txt(c.fields.Conjugation);
    (s.match(rx) || []).forEach((m) => badMeso.push(c.question + ": " + m));
    if (!/-(?:me|te|se|nos|vos)-\w/.test(s)) badMeso.push(c.question + ": no mesoclisis at all");
  }
  ok(badMeso.length === 0, "every reflexive's future and conditional take mesoclisis",
     JSON.stringify(badMeso.slice(0, 4)));

  // ------------------------------------------------- the paradigm's own shape
  const verbs = cards.filter((c) => c.fields.Conjugation);
  ok(verbs.length > 20, "verbs carry a conjugation", String(verbs.length));
  const lacks = (m) => verbs.filter((c) => !c.fields.Conjugation.includes(">" + m + "<"))
    .map((c) => c.question);
  for (const m of ["Indicativo", "Conjuntivo", "Infinitivo"])
    ok(lacks(m).length === 0, "every one shows the " + m, JSON.stringify(lacks(m).slice(0, 4)));
  // AN IMPERSONAL VERB HAS NO IMPERATIVE and should not be given one: nobody can be told to snow or
  // to ache.  Named rather than waved through, so a NORMAL verb losing its imperative — which is what
  // a broken pass would look like — fires here and a person decides.
  ok(lacks("Imperativo").every((q) => PROBE.impersonal.includes(q)),
     "and an imperative unless the verb is impersonal",
     JSON.stringify(lacks("Imperativo").filter((q) => !PROBE.impersonal.includes(q))));
  // A NOUN THAT IS ALSO AN INFINITIVE MUST NOT SHOW THE VERB'S TABLE: `o jantar` is dinner and
  // `jantar` is to dine, and a paradigm under the noun conjugates a word the card does not teach.
  const nounConj = cards.filter((c) => c.fields.Conjugation && /^(o|a|os|as) /.test(c.question));
  ok(nounConj.length === 0, "no noun card carries a verb's paradigm",
     JSON.stringify(nounConj.map((c) => c.question).slice(0, 4)));
  // A gloss that is only a pointer teaches nothing: `duche` is glossed by Wiktionary as the
  // European standard form of `ducha (“shower”)`, and the card wants the shower.
  // ANCHORED, because a gloss may mention one in passing: `primeiro` is glossed `first (ordinal
  // form of um (“one”))`, which is a translation with an etymology after it and not a pointer.
  const glossLines = (c) => [...c.fields.English.matchAll(/<(?:li|div class="uc-gl")[^>]*>([^<]*)</g)]
    .map((m) => m[1].trim());
  const ptr = cards.filter((c) => glossLines(c).some((g) => /^[\w\- ]*\bform of\s+\S+\s*\(“/.test(g)));
  ok(ptr.length === 0, "no gloss is an unresolved cross-reference",
     JSON.stringify(ptr.map((c) => c.question).slice(0, 4)));
  // THE PERSONAL INFINITIVE IS THE ONE TENSE PORTUGUESE HAS THAT NO OTHER ROMANCE LANGUAGE DOES.
  ok(verbs.every((c) => c.fields.Conjugation.includes("Infinitivo pessoal")),
     "and the personal infinitive");

  // ------------------------------------------------- the examples
  // WORDS THAT ARE BRAZILIAN AND NOT MERELY BRAZILIAN-FLAVOURED.  `calçada` and `grama` were in
  // this list and came out: a `calçada` is an ordinary paved street in Portugal (the *calçada
  // portuguesa* is Lisbon's own pavement) and a `grama` is a gram, so both fire on good European
  // sentences.  A marker has to be a word Portugal does not use in that sense at all.
  const BR = /\b(ônibus|trem|trens|celular|celulares|geladeira|banheiro|garoto|garota|papai|mamãe|xícara|terno|sorvete|times?|bonde|aeromoça|bunda|bacana|carona|açougue|sanduíche|geladinho)\b|\bcafé da manhã\b|\b(?:est\w+|and\w+|continu\w+)\s+\w{2,}ndo\b/i;
  let ptSentences = 0, brHits = [];
  for (const c of cards) {
    for (const m of c.fields.Examples.matchAll(/<div class="uc-exz">([\s\S]*?)<\/div>/g)) {
      const s = txt(m[1]);
      ptSentences++;
      if (BR.test(s)) brHits.push(c.question + ": " + s.slice(0, 60));
    }
  }
  ok(ptSentences > cards.length, "the deck ships real example sentences", String(ptSentences));
  ok(brHits.length === 0, "not one of them carries a Brazilian marker",
     JSON.stringify(brHits.slice(0, 3)));
  ok(cards.every((c) => !c.fields.Examples || /<b>/.test(c.fields.Examples)),
     "the word is picked out in every sentence that has one");

  // ================================================================ the page
  await new Promise((r) => server.listen(0, r));
  const base = "http://127.0.0.1:" + server.address().port + "/index.html";
  const browser = await chromium.launch({ executablePath: process.env.FOLIO_CHROMIUM });
  const pg = await browser.newPage({ viewport: { width: 1100, height: 900 } });
  // The day's allowance is five new cards, which is right for a reader and useless here: the deck is
  // ordered by frequency, so five cards is five function words and no noun, verb or reflexive is ever
  // reached.  PATCH the saved settings rather than seeding a whole state — this runs on every load,
  // and a seed would put the deck back to un-added on the first reload after importing it.
  await pg.addInitScript(() => {
    try {
      const s = JSON.parse(localStorage.getItem("folio_v1") || "{}");
      s.settings = Object.assign({}, s.settings, { newPerDay: 400, maxReviewsPerDay: 500 });
      localStorage.setItem("folio_v1", JSON.stringify(s));
    } catch (e) {}
  });
  const errs = [];
  // ERR_* is the sandbox failing to reach fonts.googleapis.com (the stylesheet's one @import), not
  // the deck; everything else is the deck's and is a failure.
  pg.on("console", (m) => { if (m.type() === "error" && !/net::ERR_/.test(m.text())) errs.push(m.text()); });
  pg.on("pageerror", (e) => errs.push(String(e)));

  await pg.goto(base + "#studio", { waitUntil: "load" });
  await pg.waitForTimeout(400);
  const chooser = pg.waitForEvent("filechooser");
  await pg.click("#stImport");
  (await chooser).setFiles(ROOT + "/decks/" + DECK);
  await pg.waitForSelector(".studio-deck", { timeout: 240000 });

  await pg.goto(base + "#decks", { waitUntil: "load" });
  await pg.waitForTimeout(600);
  const entries = await pg.evaluate(() => [...document.querySelectorAll("[data-uadd]")].length);
  ok(entries >= 1, "the deck is addable", String(entries));
  // The two directions are rows to ADD, not rows the deck brings with it.
  const dirs = await pg.evaluate(() => [...document.querySelectorAll("[data-usubtpl]")]
    .map((r) => r.querySelector(".deck-title").textContent.trim()));
  ok(dirs.some((r) => /Portuguese . English/.test(r)) && dirs.some((r) => /English . Portuguese/.test(r)),
     "each direction is offered as a row of its own", JSON.stringify(dirs));
  await pg.click("[data-uadd]");
  await pg.waitForTimeout(500);
  await pg.goto(base + "#home", { waitUntil: "load" });
  await pg.waitForTimeout(700);
  const rows = await pg.evaluate(() => [...document.querySelectorAll(".active-deck .dk-title")]
    .map((e) => e.textContent.trim()));
  ok(rows.length === 1 && rows[0].includes("CAPLE " + LEVEL.toUpperCase()),
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
  ok(front.text.length > 0, "the Portuguese word is on the front");
  ok(parseFloat(front.size) > 24, "it is set large", front.size);
  ok(front.speaker, "a speaker sits beside it");
  ok(!front.backYet, "the meaning is NOT on the front");
  await pg.screenshot({ path: "/tmp/caple-" + LEVEL + "-front.png" });

  await pg.click("#reveal-btn");
  await pg.waitForTimeout(500);
  const back = await pg.evaluate(() => {
    const t = (s) => { const e = document.querySelector(s); return e ? e.textContent.trim() : ""; };
    return { meaning: t(".uc-field"), pos: t(".uc-pos"),
             fieldBorder: (() => { const e = document.querySelector(".uc-field");
               return e ? getComputedStyle(e).borderTopWidth : ""; })() };
  });
  console.log("   back:  " + JSON.stringify(back.meaning).slice(0, 90) + "  [" + back.pos + "]");
  ok(back.meaning.length > 0, "the meaning is on the back");
  ok(back.pos.length > 0, "the part of speech is labelled", back.pos);
  ok(back.fieldBorder !== "0px", "the deck's own CSS reached the card", back.fieldBorder);
  await pg.screenshot({ path: "/tmp/caple-" + LEVEL + "-back.png" });

  // ------------------------------------- a noun, a pair, a verb and a reflexive
  // Grade EASY, never Good: a new card graded Good requeues as a learning step and comes straight
  // back, so the walk stands still.  The button's `data-g` is the grade's NAME — a numeric one
  // matches nothing and the click silently does nothing, which reads as forty identical cards.
  const seen = { noun: null, pair: null, verb: null, refl: null };
  const done = () => seen.noun && seen.pair && seen.verb && seen.refl;
  for (let i = 0; i < 260 && !done(); i++) {
    const card = await pg.evaluate(() => {
      const t = (s) => { const e = document.querySelector(s); return e ? e.textContent.trim() : ""; };
      // THE VISIBLE HEADWORD'S ARTICLES ONLY, and both halves of that matter.  A back that renders
      // `{{FrontSide}}` carries its own copy of the word, and the SHELL's copy above it is hidden by
      // CSS rather than removed — so it is still in the DOM and a page-wide count is doubled: every
      // noun reads as a gendered pair and no single-article card is ever seen.  `offsetParent` is
      // null for a `display:none` ancestor, which is what tells the two apart.
      const shown = [...document.querySelectorAll(".uc-word")].filter((w) => w.offsetParent !== null);
      const word = shown[shown.length - 1] || null;
      const art = word ? word.querySelectorAll(".uc-art") : [];
      return {
        word: word ? word.textContent.trim() : "", pos: t(".uc-pos"), forms: t(".uc-forms"),
        arts: [...art].map((e) => e.textContent.trim()),
        artColors: [...art].map((e) => getComputedStyle(e).color),
        moods: [...document.querySelectorAll(".uc-cj-mood")].map((e) => e.textContent.trim()),
        tenses: [...document.querySelectorAll(".uc-cj-h")].map((e) => e.textContent.trim()),
        rows: [...document.querySelectorAll(".uc-cj-r")].slice(0, 6).map((e) => e.textContent.trim()),
        ex: [...document.querySelectorAll(".uc-exz")].map((e) => e.textContent.trim()),
        bold: [...document.querySelectorAll(".uc-exz b")].map((e) => e.textContent.trim()),
        folds: [...document.querySelectorAll(".uc-fold summary")].map((e) => e.textContent.trim()),
      };
    });
    let shot = "";
    if (card.arts.length === 1 && !seen.noun) { seen.noun = card; shot = "noun"; }
    if (card.arts.length === 2 && !seen.pair) { seen.pair = card; shot = "pair"; }
    if (card.moods.length && !/-se$/.test(card.word) && !seen.verb) { seen.verb = card; shot = "verb"; }
    if (/-se$/.test(card.word) && card.moods.length && !seen.refl) { seen.refl = card; shot = "refl"; }
    if (shot) {
      // grading a couple of hundred cards earns levels, and a chest overlay sits over the card.  The
      // walk itself is unaffected (it clicks through `evaluate`, which does not hit-test) — only the
      // picture is.  The two folds are shut as dealt, so a screenshot of a card as it arrives shows
      // neither the sentences nor the paradigm, which are the two things worth looking at.
      await pg.keyboard.press("Escape");
      await pg.evaluate(() => document.querySelectorAll(".uc-fold").forEach((d) => (d.open = true)));
      await pg.waitForTimeout(120);
      await pg.screenshot({ path: "/tmp/caple-" + LEVEL + "-" + shot + ".png", fullPage: true });
    }
    await pg.evaluate(() => { const b = document.querySelector(".grade[data-g='easy']"); if (b) b.click(); });
    await pg.waitForTimeout(150);
    if (!(await pg.$("#reveal-btn"))) break;
    await pg.evaluate(() => document.querySelector("#reveal-btn").click());
    await pg.waitForTimeout(150);
  }

  console.log("   noun:  " + JSON.stringify(seen.noun && [seen.noun.word, seen.noun.forms]));
  ok(seen.noun, "a noun came up");
  if (seen.noun) {
    ok(/^(o|a)$/.test(seen.noun.arts[0]), "it carries its article", seen.noun.arts[0]);
    ok(/plural/i.test(seen.noun.forms), "and its plural", seen.noun.forms);
    ok(seen.noun.artColors[0] && seen.noun.artColors[0] !== "rgb(0, 0, 0)",
       "the article is coloured by gender", seen.noun.artColors[0]);
  }
  console.log("   pair:  " + JSON.stringify(seen.pair && [seen.pair.word, seen.pair.forms]));
  ok(seen.pair, "a masculine/feminine pair came up");
  if (seen.pair) {
    // THE POINT OF THE PAIR IS THE TWO COLOURS: `o professor, a professora` on one card teaches the
    // gender pattern, where two cards teach two words.
    ok(seen.pair.artColors[0] !== seen.pair.artColors[1],
       "its two articles are two different colours", JSON.stringify(seen.pair.artColors));
  }
  console.log("   verb:  " + JSON.stringify(seen.verb && [seen.verb.word, seen.verb.moods]));
  ok(seen.verb, "a verb came up");
  if (seen.verb) {
    ok(seen.verb.moods.join(" ") === "Indicativo Conjuntivo Imperativo Infinitivo",
       "its table shows the four moods in order", JSON.stringify(seen.verb.moods));
    ok(seen.verb.tenses.includes("Infinitivo pessoal"), "including the personal infinitive");
    ok(seen.verb.rows.length >= 6, "six persons are shown", String(seen.verb.rows.length));
    // você takes its verb on the THIRD-person row, which is the single most confusing thing about the
    // Portuguese verb for a beginner and the reason the rows are labelled rather than numbered.
    ok(seen.verb.rows.some((r) => /você/.test(r)),
       "and você sits on the third-person row", JSON.stringify(seen.verb.rows[2]));
    ok(seen.verb.folds.length === 2, "both folds are on the card", JSON.stringify(seen.verb.folds));
    ok(seen.verb.ex.length > 0 && seen.verb.bold.length > 0,
       "with the word picked out in its sentences", JSON.stringify(seen.verb.bold));
  }
  console.log("   refl:  " + JSON.stringify(seen.refl && [seen.refl.word, seen.refl.rows[0]]));
  ok(seen.refl, "a reflexive verb came up");
  if (seen.refl) {
    ok(/\w-(?:me|te|se|nos|vos)\b/.test(seen.refl.rows.join(" ")),
       "its present tense renders with the pronoun after the verb",
       JSON.stringify(seen.refl.rows[0]));
  }

  // ------------------------------------------------------------ the two colours
  const cols = await pg.evaluate(() => {
    const out = {};
    for (const [g, cls] of [["o", "uc-m"], ["a", "uc-f"]]) {
      const s = document.createElement("span");
      s.className = "uc-art " + cls;
      (document.querySelector(".uc-card") || document.body).appendChild(s);
      out[g] = getComputedStyle(s).color;
      s.remove();
    }
    return out;
  });
  console.log("   gender colours: " + JSON.stringify(cols));
  ok(cols.o !== cols.a, "o and a are two different colours", JSON.stringify(cols));

  ok(errs.length === 0, "no console errors", errs.slice(0, 3).join(" | "));
  console.log("\n" + (fails ? "✗ " + fails + " of " + checks + " checks failed"
                            : "✓ all " + checks + " checks passed"));
  console.log("screenshots: /tmp/caple-" + LEVEL + "-*.png");
  await browser.close();
  server.close();
  process.exit(fails ? 1 : 0);
})();
