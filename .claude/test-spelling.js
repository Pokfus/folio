/* THE en-GB / en-US SWITCH AND THE FIRST-THREE-SIGHTINGS RATING (Aug 2026).
 *
 * Two features, one file, because both fail the same silent way: a transform that stops firing leaves
 * a perfectly readable page in the other spelling while the Settings row still claims otherwise, and a
 * rating that counts a card's fourth answer looks exactly like one that counts its first three.
 *
 * Half of it needs no browser at all: SPELL_PAIRS is a DECLARED TABLE and the things that go wrong with
 * one — a stem that is itself a word (`emphasis` -> `emphasiz`), a suffix right for one side and wrong
 * for the other (`centre`+`d` -> `centerd`), a two-way row whose American form is the modern British
 * one (`story` -> `storey`, `medieval` -> `mediaeval`) — are all arithmetic over the shipped corpus,
 * and read far better as a failed comparison than as a screenshot.
 *
 * Run: NODE_PATH=<playwright> FOLIO_CHROMIUM=<chrome> node .claude/test-spelling.js
 */
const fs = require("fs"), path = require("path"), http = require("http"), os = require("os");
const ROOT = path.resolve(__dirname, "..");
const SRC = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");

let pass = 0, fail = 0;
const check = (n, c, x) => { if (c) { pass++; console.log("  ok  " + n); } else { fail++; console.log("FAIL  " + n + (x ? "  << " + String(x).slice(0, 220) : "")); } };

/* ---------- 1. the table, and the transform as a pure function ---------- */
function sliceBetween(a, b) {
  const i = SRC.indexOf(a); if (i < 0) return null;
  const j = SRC.indexOf(b, i); if (j < 0) return null;
  return SRC.slice(i, j);
}
const block = sliceBetween("  const SPELLINGS =", "  function setSpelling(");
check("the spelling block is still where the slice expects it", !!block);

let spellText = null, SPELL_PAIRS = null;
if (block) {
  const body = block.replace(/function spellSystem\(\)[^}]*}/, "function spellSystem(){return S.settings.spelling;}") +
    "\nreturn { spellText, spellCase, SPELL_PAIRS, SPELLINGS };";
  const api = new Function("S", body)({ settings: { spelling: "en-US" } });
  spellText = api.spellText; SPELL_PAIRS = api.SPELL_PAIRS;
  check("en-GB and en-US are the two systems", JSON.stringify(api.SPELLINGS) === '["en-GB","en-US"]', JSON.stringify(api.SPELLINGS));
}

// expand both maps exactly as the builder does
const gbMap = Object.create(null), usMap = Object.create(null);
(SPELL_PAIRS || []).forEach(([g, u, sfx, oneWay]) => {
  sfx.split("|").forEach((t) => { gbMap[g + t] = u + t; if (!oneWay) usMap[u + t] = g + t; });
});
check("the table is a real table, not a stub", (SPELL_PAIRS || []).length >= 100, (SPELL_PAIRS || []).length);

/* A word in BOTH maps is a loop: the pass would rewrite it and the reverse pass would rewrite it back,
   so whichever ran last would win and the two systems would disagree about what the word is. */
const collide = Object.keys(gbMap).filter((w) => usMap[w]);
check("no word is in both maps", collide.length === 0, collide.slice(0, 8).join(", "));

/* Every two-way row must round-trip. This is what catches a suffix that is right for one stem and
   wrong for the other — the fault that shipped `centerd` and `catalogd` while it was being written. */
const badTrip = [];
Object.keys(gbMap).forEach((g) => {
  const u = gbMap[g];
  if (!usMap[u]) return;               // one-way rows are exempt by construction
  if (usMap[u] !== g) badTrip.push(g + " -> " + u + " -> " + usMap[u]);
});
check("every two-way row round-trips", badTrip.length === 0, badTrip.slice(0, 8).join("; "));

/* THE ROWS THAT MUST BE ONE-WAY, BY NAME. Each American form here is ALSO a British word with a
   different meaning or is the modern British spelling outright, so carrying it in the reverse map
   rewrites correct prose into something wrong — `story` into `storey`, `medieval` into the archaic
   `mediaeval`, `program` into `programme` on a computer program, `meter` into `metre` on a parking
   meter. Asserted by name because no rule can see it. */
["story", "stories", "storied", "medieval", "program", "programs", "meter", "meters",
 "practice", "practices", "practiced", "practicing", "license", "licenses",
 "catalog", "catalogs", "cataloged", "cataloging"].forEach((w) => {
  check("`" + w + "` is not rewritten into British", !usMap[w], usMap[w]);
});

/* THE FIVE FAMILIES DELIBERATELY ABSENT. American English writes `archaeology` and `ochre` the same
   way, so a row for either would rewrite 1,900-odd correct sites into a spelling nobody asked for. */
["archaeology", "archaeological", "archaeologist", "ochre", "aesthetic", "dialogue", "analogue", "axe"].forEach((w) => {
  check("`" + w + "` is left alone", !gbMap[w] && !usMap[w], gbMap[w] || usMap[w]);
});

if (spellText) {
  const gb2us = (t) => spellText(t, true), us2gb = (t) => spellText(t, false);
  check("British to American", gb2us("the colour of the centre") === "the color of the center", gb2us("the colour of the centre"));
  check("American to British", us2gb("the color of the center") === "the colour of the centre", us2gb("the color of the center"));
  check("Capitalised survives", gb2us("Colour and Defence") === "Color and Defense", gb2us("Colour and Defence"));
  check("ALL CAPS survives", gb2us("COLOUR") === "COLOR", gb2us("COLOUR"));
  check("a mixed-case word is left alone", gb2us("McColour") === "McColour", gb2us("McColour"));
  check("a stem that is a word of its own is untouched", gb2us("emphasis and paralysis") === "emphasis and paralysis", gb2us("emphasis and paralysis"));
  check("`analyses` is the plural, not a verb", gb2us("two analyses") === "two analyses", gb2us("two analyses"));
  check("a divergent inflection has its own row", gb2us("centred and catalogued") === "centered and cataloged", gb2us("centred and catalogued"));
  check("`medieval` stays modern British", us2gb("medieval Europe") === "medieval Europe", us2gb("medieval Europe"));

  /* A URL IS NOT PROSE. `mediaCreditHTML` renders a credit URL as the VISIBLE TEXT of its own link,
     so without the mask a reader would meet a link whose words no longer name where it goes. */
  const u = "See https://www.ncei.noaa.gov/pub/data/paleo/icecore for the colour of the theatre.";
  check("a URL survives the pass", gb2us(u) === "See https://www.ncei.noaa.gov/pub/data/paleo/icecore for the color of the theater.", gb2us(u));
  const u2 = "https://upload.wikimedia.org/x/Panionium_theatre.jpg";
  check("…and so does one that is the whole node", gb2us(u2) === u2, gb2us(u2));

  /* THE WORD BOUNDARY IS UNICODE-AWARE, AND `\b` CANNOT BE (Aug 2026, on a bug report). JS's `\b` is
     defined over ASCII `\w`, so an accented letter is a NON-word character and stands as a boundary of
     its own — which let a `\b`-anchored pattern match INSIDE an accented word. Every case below was
     found in the shipped decks, not invented: `Mold`+`ávia`, `liter`+`ário`, `élab`+`or`+`er`,
     `honor`+`é`. None of them is an English word at all, and the reader saw the corruption mid-word,
     which reads as a typo in the content rather than as a transform. */
  [["Moldávia é um país", "us2gb"], ["um texto literário", "us2gb"], ["élaborer un plan", "us2gb"],
   ["il est honoré", "us2gb"], ["une décoloration", "us2gb"], ["réorganiser le texte", "gb2us"]].forEach(([t, dir]) => {
    const out = dir === "us2gb" ? us2gb(t) : gb2us(t);
    check("an accented word is not matched into: " + JSON.stringify(t), out === t, out);
  });
  /* …and the boundary still BINDS: the change must not turn the anchors off, or `neighbour` starts
     matching inside `neighbourhood` and every word in the table matches inside every longer one. */
  check("the boundary still holds at the LEFT", gb2us("a discolouration") === "a discolouration", gb2us("a discolouration"));
  check("…and at the RIGHT", gb2us("the timetree") === "the timetree", gb2us("the timetree"));
  check("…while a real word still transforms beside an accented one", us2gb("the color of Moldávia") === "the colour of Moldávia", us2gb("the color of Moldávia"));

  /* A LANGUAGE DECK'S OWN WORDS ARE NOT MISSPELLED ENGLISH. These are the exact tokens the transform
     was rewriting on 52 shipped decks — Spanish `por favor` and `saber`, German `Labor`, Portuguese
     `valor` — and at this level they are indistinguishable from American English, which is why the DOM
     half below (the `lang` rule) is what actually fixes them rather than a row removed from the table. */
  check("the table alone cannot tell Spanish from American English", us2gb("por favor") === "por favour", us2gb("por favor"));
}

/* THE TABLE AGAINST THE REAL CORPUS. A row is only ever as good as what it does to the prose that
   actually ships, and every fault this feature had was found here rather than by reading the table. */
const corpus = ["data.js", "glossary.js", "artefacts.js", "artefacts-extra.js", "countries.js", "country-years.js", "mission.js", "changelog.js"]
  .map((f) => { try { return fs.readFileSync(path.join(ROOT, f), "utf8"); } catch (e) { return ""; } }).join("\n");
check("the corpus was read", corpus.length > 1e6, corpus.length);

function sweep(map) {
  const keys = Object.keys(map).sort((a, b) => b.length - a.length);
  if (!keys.length) return {};
  const rx = new RegExp("\\b(?:" + keys.join("|") + ")\\b", "gi");
  const out = {}; let m;
  while ((m = rx.exec(corpus))) { const k = m[0].toLowerCase(); out[k] = (out[k] || 0) + 1; }
  return out;
}
const foundGB = sweep(gbMap), foundUS = sweep(usMap);
const nGB = Object.values(foundGB).reduce((a, b) => a + b, 0), nUS = Object.values(foundUS).reduce((a, b) => a + b, 0);
check("the corpus really is mixed, which is why the switch is two-way", nGB > 500 && nUS > 500, nGB + " British, " + nUS + " American");
check("the commonest British forms are covered", foundGB.metres > 100 && foundGB.centre > 100, JSON.stringify({ metres: foundGB.metres, centre: foundGB.centre }));
check("…and the commonest American ones", foundUS.center > 100 && foundUS.organized > 20, JSON.stringify({ center: foundUS.center, organized: foundUS.organized }));

/* ---------- 2. the first-three-sightings rule, read out of app.js ---------- */
check("the bar is a declared constant", /const CARD_STATS_SIGHTINGS = 3;/.test(SRC));
check("grade() counts the sighting on the card record", /c\.seen = \(Number\(c\.seen\) \|\| 0\) \+ 1;/.test(SRC));
check("…and only the first three are rated", /if \(c\.seen <= CARD_STATS_SIGHTINGS\) cardStatsBump\(id, g\);/.test(SRC));
check("an undo takes its own vote back", /function cardStatsUndo\(id, g\)/.test(SRC));
/* THE UNDO READS THE SNAPSHOT, NEVER THE LOG. `REV_GRADE_NAME` is capitalised and `CARD_GRADE_KEY`
   is not, so a grade recovered from the review log would not match a stats key and the vote would be
   left standing — silently, since nothing on the page reports a rating that is one answer too heavy. */
check("doGrade records the grade on the snapshot", /snap\.g = g;/.test(SRC));
check("undoGrade withdraws it from the snapshot", /if \(s\.g && \(\(s\.card && Number\(s\.card\.seen\)\) \|\| 0\) < CARD_STATS_SIGHTINGS\) cardStatsUndo\(s\.id, s\.g\);/.test(SRC));
check("forgetting a card does NOT reset the counter", !/seen: 0/.test(SRC.slice(SRC.indexOf("function schedForget"), SRC.indexOf("function schedForget") + 900)));

/* ---------- 3. the browser: the Settings row, the page, and the cloze ---------- */
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".xml": "text/xml" };
const srv = http.createServer((rq, rs) => {
  let p = decodeURIComponent(rq.url.split("?")[0]); if (p === "/") p = "/index.html";
  const f = path.join(ROOT, p);
  fs.readFile(f, (e, d) => { if (e) { rs.writeHead(404); rs.end(); return; } rs.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" }); rs.end(d); });
});

(async () => {
  let chromium;
  try { chromium = require("playwright").chromium; }
  catch (e) { console.log("\n(playwright not on NODE_PATH — the browser half was skipped)"); console.log("\n" + pass + " passed, " + fail + " failed"); process.exit(fail ? 1 : 0); }

  await new Promise((r) => srv.listen(8797, r));
  const b = await chromium.launch({ executablePath: process.env.FOLIO_CHROMIUM });
  const page = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));

  await page.goto("http://127.0.0.1:8797/#settings");
  await page.waitForTimeout(1800);

  const row = await page.evaluate(() => {
    const g = document.querySelector("#spellPick");
    if (!g) return null;
    const bs = [...g.querySelectorAll("button")];
    return { n: bs.length, vals: bs.map((x) => x.dataset.spelling), on: bs.filter((x) => x.classList.contains("on")).map((x) => x.dataset.spelling),
             specimens: bs.map((x) => (x.querySelector(".fs-a") || {}).textContent) };
  });
  check("Settings offers the two spellings", !!row && row.n === 2 && row.vals.join() === "en-GB,en-US", JSON.stringify(row));
  check("British is what the site is authored in, so it starts there", !!row && row.on.join() === "en-GB", JSON.stringify(row && row.on));
  /* The specimens are `notranslate` on purpose: the British button must read `colour` and the American
     one `color` whichever system is in force, or the control rewrites its own labels and says nothing. */
  check("each button shows its own spelling as a specimen", !!row && row.specimens.join() === "colour,color", JSON.stringify(row && row.specimens));

  await page.evaluate(() => document.querySelector('#spellPick [data-spelling="en-US"]').click());
  await page.waitForTimeout(900);
  const after = await page.evaluate(() => ({
    stored: (JSON.parse(localStorage.getItem("folio_v1") || "{}").settings || {}).spelling,
    on: [...document.querySelectorAll("#spellPick button")].filter((x) => x.classList.contains("on")).map((x) => x.dataset.spelling).join(),
    specimens: [...document.querySelectorAll("#spellPick .fs-a")].map((x) => x.textContent).join(),
  }));
  check("choosing American is stored", after.stored === "en-US", JSON.stringify(after));
  check("…and marked on the control", after.on === "en-US", after.on);
  check("…and the specimens are still one of each", after.specimens === "colour,color", after.specimens);

  // it survives a reload, and it reaches the prose rather than only the setting
  await page.reload();
  await page.waitForTimeout(1800);
  await page.goto("http://127.0.0.1:8797/#mission");
  await page.waitForTimeout(1500);
  const prose = await page.evaluate(() => {
    const t = document.body.innerText;
    const gb = (t.match(/\b(colour|centre|metres|organised|recognised|neighbour)\w*/gi) || []).length;
    const us = (t.match(/\b(color|center|meters|organized|recognized|neighbor)\w*/gi) || []).length;
    return { gb, us, len: t.length };
  });
  check("the page carries American spellings", prose.us > 0, JSON.stringify(prose));
  check("…and no British ones outside the protected parts", prose.gb === 0, JSON.stringify(prose));

  /* THE CITATIONS ARE NOT TRANSFORMED, and this is the assertion the whole `.notranslate` skip exists
     for: a citation names a published work, and rewriting `The Colour of Prehistory` into `Color`
     invents a title that does not exist. Read off a real card's own source list. */
  const cite = await page.evaluate(async () => {
    location.hash = "#decks";
    await new Promise((r) => setTimeout(r, 1200));
    const c = (window.CARD_DATA || []).find((x) => (x.sources || []).some((s) => /colour|centre|behaviour|organis/i.test(s)));
    return c ? { id: c.id, src: (c.sources || []).find((s) => /colour|centre|behaviour|organis/i.test(s)) } : null;
  });
  if (cite) {
    check("a citation in the data still carries its British spelling", /colour|centre|behaviour|organis/i.test(cite.src), cite.src);
  } else {
    check("(no British-spelled citation in the corpus to check)", true);
  }

  /* ---------- 4. THE `lang` RULE, ON A REAL LANGUAGE DECK (Aug 2026, on a bug report) ----------
     A reader met the Spanish `por favor` shown as `por favour`. The transform was running over every
     text node on the page, and a language deck's cards are not English: `por favor` and the verb
     `saber` are ordinary Spanish, and `favor` / `saber` are also rows in this table. `saber` is the
     WORD ON THE FRONT of DELE A1's card 108, so what a learner was being taught to produce was the
     misspelling — which no amount of reading the table can catch, because at the level of a string
     `favor` really is American English (asserted as much in section 1).

     IT MUST RUN IN en-GB, WHICH IS THE DEFAULT AND WAS THE WHOLE OF THE REPORT. `favor` is an
     AMERICAN form, so it is the American-to-British pass that corrupts it — written against en-US
     this section passes on the unfixed code, because that direction never looks at `favor` at all.
     A liveness check goes with it for the same reason: without one, a future change that stopped the
     en-GB pass running would make every assertion here pass while testing nothing.

     It is asserted on the REAL shipped deck rather than on a fixture, because what fixes it is a
     `lang` attribute written by `cardTypeSideHTML` out of the card TYPE's `speechLang` — a fixture
     would be asserting that this test file writes `lang` correctly. Every one of the 52 shipped decks
     declares `speechLang` on every type; if that ever stops being true, this fails. */
  await page.goto("http://127.0.0.1:8797/#settings");
  await page.waitForTimeout(1200);
  await page.evaluate(() => { const el = document.querySelector('#spellPick [data-spelling="en-GB"]'); if (el) el.click(); });
  await page.waitForTimeout(800);

  /* THE FLAG'S SELECTOR, ASSERTED DIRECTLY. `spellSkip` only consults `lang` when a one-per-pass
     `querySelector` says the page has foreign text on it — so a selector that quietly stopped matching
     would put the whole bug back with nothing on the page or in this file to say so. `[lang|="en" i]`
     is the attribute selector's own language test: it matches `en` and `en-GB` and, with the `i`, their
     casings. An EMPTY lang counts as foreign here and is then let through by `SPELL_LANG_EN` — the flag
     is allowed to be conservative, the per-node test is what decides. */
  const selSrc = (SRC.match(/const SPELL_FOREIGN_SEL = (['"])(.*?)\1;/) || [])[2];
  check("the foreign-language selector is still declared", !!selSrc, selSrc);
  if (selSrc) {
    const sel = await page.evaluate((SEL) => {
      const h = document.createElement("div");
      document.body.appendChild(h);
      const ask = (v) => { h.innerHTML = v === null ? "<span>x</span>" : '<span lang="' + v + '">x</span>'; return !!h.querySelector(SEL); };
      const out = { es: ask("es-ES"), fr: ask("fr"), zh: ask("zh-CN"), grc: ask("grc"),
                    en: ask("en"), enGB: ask("en-GB"), ENgb: ask("EN-gb"), none: ask(null) };
      h.remove();
      return out;
    }, selSrc);
    check("…and it finds a non-English language", sel.es && sel.fr && sel.zh && sel.grc, JSON.stringify(sel));
    check("…and does NOT fire on English, in any casing", !sel.en && !sel.enGB && !sel.ENgb && !sel.none, JSON.stringify(sel));
  }

  const deckSrc = path.join(ROOT, "decks", "Spanish-Phrases.folio-deck.json");
  if (fs.existsSync(deckSrc)) {
    const full = JSON.parse(fs.readFileSync(deckSrc, "utf8"));
    const porFavor = (full.cards || []).find((c) => (c.fields || {}).Spanish === "por favor");
    check("the shipped Spanish deck still leads on `por favor`", !!porFavor);
    check("…and its type declares the language it speaks", Object.values(full.meta.types || {}).every((t) => !!t.speechLang),
      JSON.stringify(Object.values(full.meta.types || {}).map((t) => t.speechLang)));
    if (porFavor) {
      const probe = path.join(os.tmpdir(), "folio-spell-es.folio-deck.json");
      /* The deck's own TITLE is the liveness check: it is Folio chrome rather than card content, so it
         sits outside every `lang` and MUST still be transformed. `color` -> `colour` there and
         `por favor` left alone on the card is the pair that says the fix is a skip and not an off switch. */
      fs.writeFileSync(probe, JSON.stringify({ folioDeck: 1,
        meta: { ...full.meta, id: "spelles1", title: "Spelling probe in color" }, cards: [porFavor], gloss: {} }));

      await page.goto("http://127.0.0.1:8797/#studio");
      await page.waitForTimeout(1600);
      const fchoose = page.waitForEvent("filechooser");
      await page.click("#stImport");
      (await fchoose).setFiles(probe);
      await page.waitForTimeout(1400);
      await page.goto("http://127.0.0.1:8797/#decks");
      await page.waitForTimeout(1500);
      const titles = await page.evaluate(() => [...document.querySelectorAll(".collection-title, .sd-title")].map((e) => e.textContent));
      check("LIVENESS: the en-GB pass is running on ordinary page text",
        titles.some((t) => /Spelling probe in colour/.test(t)), JSON.stringify(titles.filter((t) => /Spelling probe/.test(t))));

      await page.click('[data-uadd="spelles1"]').catch(() => {});
      await page.waitForTimeout(900);
      await page.goto("http://127.0.0.1:8797/#home");
      await page.waitForTimeout(1500);
      await page.evaluate(() => { const r = document.querySelector("[data-review]"); if (r) r.click(); });
      await page.waitForTimeout(1600);

      const card = await page.evaluate(() => {
        const el = document.querySelector(".uc-card");
        return el ? { lang: el.getAttribute("lang"), word: (document.querySelector(".uc-word") || {}).textContent } : null;
      });
      check("the Spanish card is on screen", !!card && !!card.word, JSON.stringify(card));
      /* The wrapper's `lang` is the whole mechanism: it was already being written when the bug was
         reported, and the spelling pass simply was not reading it. If this fails, the fix has no seam
         left to hang on and the one below is failing for a different reason. */
      check("…and the wrapper declares the language it is in", !!card && /^es\b/i.test(card.lang || ""), JSON.stringify(card && card.lang));
      check("Spanish `por favor` is left as its author wrote it", !!card && (card.word || "").trim() === "por favor", JSON.stringify(card && card.word));
    }
  }

  // back to British, so the run leaves nothing behind
  await page.goto("http://127.0.0.1:8797/#settings");
  await page.waitForTimeout(1200);
  await page.evaluate(() => document.querySelector('#spellPick [data-spelling="en-GB"]').click());
  await page.waitForTimeout(700);
  const backGB = await page.evaluate(() => (JSON.parse(localStorage.getItem("folio_v1") || "{}").settings || {}).spelling);
  check("switching back is stored too", backGB === "en-GB", backGB);

  check("no page errors", errs.length === 0, errs.join(" | "));

  await b.close(); srv.close();
  console.log("\n" + pass + " passed, " + fail + " failed");
  process.exit(fail ? 1 : 0);
})();
