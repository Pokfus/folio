#!/usr/bin/env node
// Append a card to ../data.js and register its id in COLLECTION_TREE. Cheap regardless of file size
// (it parses + rewrites the array programmatically — no whole-file Edit). See CLAUDE.md.
//
//   node .claude/add-card.js <card.json> [deckId]
//
// <card.json>  a file holding ONE card object (all 13 fields), PLUS a `questions` array of 2 extra
//              question phrasings (3 in all — the site asks one at random), PLUS a `sources` array of
//              Chicago note-form citations referenced from the abstract, PLUS an `i18n` block with
//              OPTIONAL while the site is English-only (see REQUIRE_TRANSLATIONS below) —
//              the card translated into all 9 site languages (see CLAUDE.md):
//                "sources": ["Chris Stringer, <i>Lone Survivors</i> (New York: Times Books, 2012), 84–86.", …]
//                "i18n": { "es": { "question": …, "questions": [q2, q3], "answer": …, "answerDate": …, "abstract": …, "answerText": … },
//                          "fr": …, "de": …, "it": …, "nl": …, "ru": …, "ar": …, "zh": … }
//              ("skipSources": true only for a maintenance edit of a card written before citations existed).
//              deckId defaults to the first leaf deck.
//
//              A MAP CARD instead carries `map` + `facts` and no extra phrasings — its question is a window
//              onto the globe with one place shaded (see the MAP CARDS block below and in app.js):
//                "map": { "layer": "us-states", "key": "California" },
//                "facts": [["Capital", "Sacramento"], ["Population", "39.4 million"], …],
//                "questions": []
//              A card whose ANSWER IS A PLACE may carry a `locator` — a globe at the foot of the card with
//              that place marked. Written by `.claude/add-locators.js`, never by hand: the coordinate is
//              the one the place's own Wikipedia article publishes, and a typed pair is a dot a degree out
//              that draws perfectly and points at the wrong place.
//                "locator": { "name": "Knossos", "at": [25.163, 35.2979], "zoom": 6 }
//              A place with EXTENT says so, and a dot is not drawn for it — a `kind` of "river" (traced
//              out of rivers.js by the card's answer term and its glossary aliases), "range" (with a
//              `spine` of [lon, lat] points, drawn as mountains), "region" (with an approximate `area`,
//              washed under a dashed edge) or "battle" (crossed swords rather than a dot):
//                "locator": { "name": "The Apennines", "at": [13.5656, 42.4692], "kind": "range",
//                             "spine": [[8.45, 44.35], [9.55, 44.45], …] }
//              Any card may also carry an `answerFlag` — the flag of the place it is about, drawn inside
//              coloured answer box beside the term. Three fields, and `credit` AND `alt` are both required:
//                "answerFlag": { "src": "https://…", "credit": "…, public domain, via Wikimedia Commons (…)",
//                          "alt": "The flag of Texas: a blue band at the hoist bearing a white star, …" }
const fs = require("fs"), path = require("path");
const { isDateList } = require("./date-line.js");
const { figureEchoes: factsEchoes } = require("./facts-echo.js");
const { checkWhy, checkLeadsTo, loadCardYears, collectionIndex } = require("./card-links.js");
const { checkWar } = require("./card-war.js");
const dataPath = path.join(__dirname, "..", "data.js");
const FIELDS = ["id","num","category","question","answer","answerDate","traditional","hanzi","pinyin","translations","abstract","citation","answerText"];
const I18N_LANGS = ["es","fr","de","it","nl","ru","ar","zh","ja"];
/* ENGLISH ONLY (Aug 2026, on request): the site ships in English while the work is on the English, so a
   new card no longer has to arrive with its nine translations. This is the content-pipeline half of
   MULTILANG in app.js — flip it back to true when translations resume, and new cards are held to all
   nine again. A translation that IS supplied is still written and still checked (length, marker parity):
   the requirement is lifted, the machinery is not. */
const REQUIRE_TRANSLATIONS = false;
const I18N_FIELDS = ["question","answer","answerDate","abstract","answerText"];
// A question is ONE short clue — about 28 words (see CLAUDE.md "Add a card"). The blank counts as a word.
const Q_MIN = 20, Q_MAX = 34;
/* The background is about 300 words and always within 270–330 (CLAUDE.md calls it a hard target). It was
   never checked here, which is how several cards reached 331–342 unremarked; the ceiling is easy to pass
   by a word or two while trimming for something else, and nothing else in the pipeline measures it. */
const A_MIN = 270, A_MAX = 330;
// Translations are checked loosely: Chinese/Japanese by character, the rest by word, both generous enough
// that only a question that was never shortened trips them.
const Q_TR_MAX_WORDS = 40, Q_TR_MAX_CHARS = 95;
const plain = (s) => String(s || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
/* An IMPERIAL CONVERSION does not count towards a length limit (Aug 2026, on request). Measurements are
   written metric first with the imperial equivalent in parentheses, which costs about three words a figure
   and would otherwise squeeze the prose out of a card to make room for arithmetic. So the parenthetical is
   stripped before counting: the limit still binds what the card SAYS, and the conversion rides free. The
   pattern is deliberately narrow — a parenthesis holding a number and an imperial unit — so an ordinary
   aside is still counted (and asides are banned in an abstract anyway).

   THIS FILE OWNS IT, AND THE OTHER EIGHT TOOLS SLICE IT OUT BY TEXT (Sep 2026). It had been COPIED into
   nine files and had drifted into THREE different patterns, which is the scar this comment exists to close:
   `check-questions.js` lacked `tons?` while every other copy had it, so a question carrying a tonnage
   conversion was charged for it THERE and not here — measured at four words apart on `gr-004`, `gr-065` and
   `wh-249`, none over a bar today and every one of them a contradiction waiting for the card that is.
   The artefact tools had a third list, widened with VOLUME units because an artefact is a jar or a cauldron;
   that argument was right about the corpus and wrong about the fix, since the widening is INERT everywhere
   else — measured, 0 brackets in 4,945 that the union eats and the narrowest copy did not. So the list is
   the UNION of all three and one file holds it.

   TWO THINGS THE MEASUREMENT SETTLED and which are worth not re-deriving. `sq mi` / `sq ft` need no rule of
   their own now that the bare units are in the list, so the redundant branch is gone. And the alarming
   member is `in`, which has been here since the beginning and would eat "(in 1920)": over the whole corpus
   the pattern eats 4,945 brackets and EVERY ONE is a measurement — the 53 that are not shaped
   `<number> <unit>` are hyphenated attributives ("(100-foot)"), densities ("(191 to the square mile)"),
   "(4 fluid ounces)" and "(11 Roman miles)". Not one ordinary aside. Re-run that check before widening it
   again; a pattern that eats prose makes the budget looser for the cards that happen to carry a bracket,
   and does it in silence. */
const IMPERIAL_PAREN = /\s*\((?=[^)]*\d)[^)]*(?:\b(?:miles?|mi|foot|feet|ft|inch(?:es)?|in|yards?|yd|pounds?|lbs?|ounces?|oz|tons?|acres?|gallons?|pints?|quarts?)\b|°F\b)[^)]*\)/gi;
const unconverted = (s) => String(s || "").replace(IMPERIAL_PAREN, "");
/* A TOKEN OF PURE PUNCTUATION IS NOT A WORD, and counting one is how a card meets the floor on a full
   stop (Sep 2026). `plain` replaces a tag with a SPACE, which is right — it keeps the words either side
   apart — but it also cuts a footnote marker out from between a word and its terminal stop, leaving the
   stop standing alone: `set aside<sup …></sup>.` counts as "aside" AND ".". Measured over the corpus,
   2,448 such tokens were being counted, 1,173 of them a lone full stop across the 114 cards that write
   the marker BEFORE the stop rather than after it (30,093 sit after), and 718 a standalone em dash, which
   is the house form of a parenthetical dash and no more a word than the stop is. Fifty-two Greece cards
   passed this bar on that punctuation alone and hold 260–269 words of prose; wh-145 was reported over the
   ceiling on it. The UNDERSCORE is deliberately a word character here: `_____` is the cloze blank, and
   CLAUDE.md's question rule says in terms that the blank counts as a word.
   THIS PREDICATE IS THE ONE COPY. card-length.js, check-questions.js, add-questions.js and
   gloss-length.js slice it out of this file by text and stop if the slice fails, because a second copy
   goes stale on a change made in a file nobody counting words has reason to open. */
const COUNTS_AS_WORD = /[\p{L}\p{N}_]/u;
const qWords = (s) => plain(unconverted(s)).split(" ").filter((w) => COUNTS_AS_WORD.test(w)).length;

function loadWindow(file) { const win = {}; new Function("window", fs.readFileSync(file, "utf8"))(win); return win; }
function leafDecks(node, acc) { for (const ch of node.children || []) { if (ch.cardIds) acc.push(ch); if (ch.children) leafDecks(ch, acc); } return acc; }
function countIds(node) { const s = new Set(); (function w(n){ (n.cardIds||[]).forEach(i=>s.add(i)); (n.children||[]).forEach(w); })(node); return s.size; }

// Every official card asks its question 3 ways: `question` plus a `questions` array of exactly
// N_EXTRA further phrasings (each a full standalone clue under the same rules — mid-sentence blank,
// ~28 words). The site shows one of the three at random each time the card comes up. The data model
// allows up to 10 in all (community decks may experiment); official cards carry exactly 3.
const N_EXTRA = 2;
// mirrors SRC_MAX in app.js — more citations than this on one study card is a bibliography, not footnotes
const SRC_MAX = 24;
// the editorial floor, read out of app.js (SRC_TARGET) so the two can never disagree about what it is
const SRC_TARGET = (() => { const m = /const SRC_TARGET = (\d+);/.exec(fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8")); return m ? +m[1] : 5; })();
// Every citation carries a link, so a reader can check the claim and follow it further — which also means
// only publicly reachable scholarship is citable here, and that a page number can always be verified.
const SRC_URL = /https?:\/\/[^\s<>"']+/;
const { checkCitationLang } = require("./src-langs.js");

/* ---------- MAP CARDS (Aug 2026, on request) ----------
   A card carrying `map: { layer, key }` asks its question as a WINDOW onto the globe with one place
   shaded, and three of the rules above stop making sense for it:

   · THE QUESTION IS A PROMPT, NOT A CLUE. Twenty-eight words of identifying detail is what a text card
     needs because the words are all the reader has; here the MAP is the clue, and a paragraph beside it
     would be a second, easier question sitting on top of the first. So a map card's prompt is held to
     MAPQ_MIN–MAPQ_MAX words instead — still with its blank, since the reader still types the answer.

   · AND IT CARRIES NO EXTRA PHRASINGS. The pool exists so a card is not learned as one sentence's shape;
     a map card is not learned as a sentence at all, and "which state is shaded?" has no second angle —
     three ways of saying it would be three ways of saying it. `cardQuestions` then yields a pool of one,
     so the ‹ › chevrons simply do not appear.

   · THE KEY IS CHECKED AGAINST THE LAYER'S OWN DATA, which is the half that matters. A mistyped key is
     the quiet failure this whole repo keeps recording: nothing throws, the card ships, and its window
     says "this map could not be loaded" to a reader who has no idea what they were meant to see. */
const MAP_LAYERS = {
  "us-states": { file: "us-states.js", global: "US_STATES", what: "state", points: "US_CAPITALS", dotWhat: "state capital" },
  /* The world's own borders, with the capitals in a file of their OWN — `pointsFile` rather than a second
     global inside `file`, because app.js fetches the two as separate bundles for the same reason: a
     locator card reads the shapes and never the table. Keep this table in step with CARD_MAP_LAYERS in
     app.js; the two are checked against each other by nothing but this comment. */
  world: { file: "world.js", global: "WORLD_GEO", what: "country", points: "WORLD_CAPITALS", pointsFile: "world-capitals.js", dotWhat: "capital city" },
  /* China's provincial-level divisions. Its capitals live in the SAME file as its shapes — no
     `pointsFile` — which is the one structural difference from `world` above and is app.js's own
     `chinaprov` bundle written out here: nothing but a China map card ever loads this layer, so there is
     nobody to spare the 13 KB from. Four provinces are DELIBERATELY absent from the point table: Beijing,
     Shanghai, Tianjin and Chongqing are cities that are themselves divisions, so a dot card there would
     shade the answer. The refusal a missing point produces is the intended one. */
  "china-provinces": { file: "china-provinces.js", global: "CHINA_PROVINCES", what: "province", points: "CHINA_CAPITALS", dotWhat: "provincial capital" },
  /* Russia's federal subjects, shaped like China's above — the centres in the SAME file as the shapes,
     for app.js's own `russubj` bundle reason. `what` is "federal subject" rather than a kind because the
     83 are six different kinds of thing (46 oblasts, 21 republics, 9 krais, 4 autonomous okrugs, 2 cities
     of federal significance, 1 autonomous oblast), so "province" would be false of 37 of them and
     "region" would give the answer away on the 46 oblasts. THREE subjects are deliberately absent from
     the point table and they are not the same refusal: Moscow and Saint Petersburg are cities that are
     themselves federal subjects, so a dot card there would shade its own answer; Khakassia is a DATA
     refusal, this layer drawing Abakan outside the republic (see docs/russia-geography-card-plan.md and
     the builder's DEFERRED table). The refusal a missing point produces is the intended one in all
     three. */
  "russia-subjects": { file: "russia-subjects.js", global: "RUSSIA_SUBJECTS", what: "federal subject", points: "RUSSIA_CENTRES", dotWhat: "administrative centre" },
};
const MAPQ_MIN = 5, MAPQ_MAX = 20;
const MAP_FACTS_MIN = 3, MAP_FACTS_MAX = 8;
const ART_FACTS_MIN = 3;   // an artwork card: artist / maker, date, medium, size, where it is

const cardFile = process.argv[2], deckId = process.argv[3];
if (!cardFile) { console.error("usage: node .claude/add-card.js <card.json> [deckId]"); process.exit(1); }
const card = JSON.parse(fs.readFileSync(cardFile, "utf8"));
for (const f of FIELDS) if (!(f in card)) { console.error("ERROR: card is missing field:", f); process.exit(1); }
if (!card.id) { console.error("ERROR: card.id is empty"); process.exit(1); }

const isMap = !!card.map;
const isArt = card.artwork === true;   // an ARTWORK card: the picture is its own subject (see the block below)
const isFlag = card.flagCard === true; // a FLAG card: the flag is its whole question (see the block below)
const isDraw = card.drawCard === true; // a DRAW card: the flag is its ANSWER and the reader draws it
if (isMap) {
  const m = card.map;
  if (typeof m !== "object" || Array.isArray(m)) { console.error("ERROR: card.map must be an object: { \"layer\": \"us-states\", \"key\": \"California\" }"); process.exit(1); }
  const layer = MAP_LAYERS[m.layer];
  if (!layer) { console.error("ERROR: unknown map layer " + JSON.stringify(m.layer) + " — known layers: " + Object.keys(MAP_LAYERS).join(", ") + " (add one to CARD_MAP_LAYERS in app.js and to MAP_LAYERS here, in the same commit)."); process.exit(1); }
  /* `key` is a name, or a LIST of names where the layer files one place as several polygons — Cyprus is
     three (Cyprus, N. Cyprus and the buffer zone), and a card naming one shades two-thirds of the island
     and asks the reader to name it. The renderer joins the list with a PIPE for the markup's single
     attribute, so a name containing one is refused here rather than silently split in the browser. */
  const mapKeys = Array.isArray(m.key) ? m.key : [m.key];
  if (!mapKeys.length || mapKeys.some((k) => typeof k !== "string" || !k.trim())) { console.error("ERROR: card.map.key is empty — it names the place, or the places, to shade."); process.exit(1); }
  if (mapKeys.some((k) => k.indexOf("|") >= 0)) { console.error("ERROR: card.map.key may not contain a pipe — the renderer joins a list of keys with one."); process.exit(1); }
  if ("zoom" in m && !(Number.isFinite(m.zoom) && m.zoom > 0)) { console.error("ERROR: card.map.zoom must be a positive number, or absent (the window fits the place automatically)."); process.exit(1); }
  const lp = path.join(__dirname, "..", layer.file);
  if (!fs.existsSync(lp)) { console.error("ERROR: the " + m.layer + " layer's data file is missing: " + layer.file + " — build it first (see .claude/build-us-states.js)."); process.exit(1); }
  const shapes = loadWindow(lp)[layer.global] || [];
  for (const k of mapKeys) {
    if (shapes.some((s) => s.n === k || s.a === k)) continue;
    const near = shapes.map((s) => s.n).filter((n) => n.toLowerCase().startsWith(String(k).slice(0, 3).toLowerCase()));
    console.error("ERROR: " + JSON.stringify(k) + " is not a " + layer.what + " in " + layer.file + "." +
      (near.length ? " Did you mean: " + near.join(", ") + "?" : "") +
      "\n       A key the layer does not carry ships a card whose window says it could not be loaded — which is\n" +
      "       a reader meeting a broken card, not an error anybody would see first.");
    process.exit(1);
  }
  /* THE DOT IS CHECKED THE SAME WAY THE KEY IS, and its STATE is checked against the key — which is the
     part worth having. A capital card shades a state and marks a city in it, so the two are a claim about
     each other, and the layer's own table records which state each capital stands in. Providence filed
     under Rhode Island and a card shading Rhode Island agree; a card that shaded Vermont would not, and
     nothing on the rendered page would say so — the dot would simply be off the edge of the shape. */
  if ("dot" in card.map) {
    const d = card.map.dot;
    if (!layer.points) { console.error("ERROR: the " + m.layer + " layer carries no point table, so a card on it cannot ask for a dot."); process.exit(1); }
    if (typeof d !== "string" || !d.trim()) { console.error("ERROR: card.map.dot is empty — it names the " + layer.dotWhat + " to mark."); process.exit(1); }
    const pp = path.join(__dirname, "..", layer.pointsFile || layer.file);
    if (!fs.existsSync(pp)) { console.error("ERROR: the " + m.layer + " layer's point table is missing: " + (layer.pointsFile || layer.file) + " — build it first (see .claude/build-world-capitals.js)."); process.exit(1); }
    const pts = loadWindow(pp)[layer.points] || {};
    const hit = pts[d];
    if (!hit) {
      const near = Object.keys(pts).filter((n) => n.toLowerCase().startsWith(String(d).slice(0, 3).toLowerCase()));
      console.error("ERROR: " + JSON.stringify(d) + " is not a " + layer.dotWhat + " in " + (layer.pointsFile || layer.file) + "." + (near.length ? " Did you mean: " + near.join(", ") + "?" : ""));
      process.exit(1);
    }
    if (mapKeys.indexOf(hit.s) < 0) {
      console.error("ERROR: " + JSON.stringify(d) + " is in " + JSON.stringify(hit.s) + ", but the card shades " + JSON.stringify(mapKeys.join(", ")) + " — the dot would fall outside the shape.");
      process.exit(1);
    }
    /* The card's ANSWER should be the thing the dot marks, since the dot is what the question points at.
       A warning rather than a refusal: a future card might legitimately mark a city and ask something
       else about it, and this file refuses only what is provably broken. */
    const ans = String(card.answerText || "").trim();
    if (ans && ans !== d) console.warn("  ! the dot marks " + JSON.stringify(d) + " but the answer is " + JSON.stringify(ans) + " — check that is deliberate.");
  }
  if (Array.isArray(card.questions) && card.questions.length) {
    console.error("ERROR: a map card carries no extra question phrasings — the map is the clue, and \"which " + layer.what + " is shaded?\" has no second angle. Give it `\"questions\": []`.");
    process.exit(1);
  }
  card.questions = [];
  const facts = Array.isArray(card.facts) ? card.facts : [];
  const bad = facts.find((r) => !Array.isArray(r) || r.length !== 2 || !String(r[0] || "").trim() || !String(r[1] || "").trim() || /[<>]/.test(String(r[0]) + String(r[1])));
  if (bad) { console.error("ERROR: every `facts` row is a [label, value] pair of non-empty PLAIN TEXT (no markup — the writer builds the tags): " + JSON.stringify(bad)); process.exit(1); }
  if (facts.length < MAP_FACTS_MIN || facts.length > MAP_FACTS_MAX) {
    console.error("ERROR: a map card carries " + MAP_FACTS_MIN + "–" + MAP_FACTS_MAX + " `facts` rows — the figures box beside its answer (capital, population, area …). This one has " + facts.length + ".");
    process.exit(1);
  }

  /* THE BACKGROUND MAY NOT RESTATE THE GRID (on request, Sep 2026).  The answer box prints these
     figures two inches above the prose, so giving them again asks the reader to read the same number
     twice.  The rule and its two tiers live in `.claude/facts-echo.js`; this is that test applied to
     ONE card before it ships, so the corpus cannot quietly regrow a fault a whole pass has cleared.
     A NAME is not refused here, only a FIGURE -- see that file for why. */
  const echoes = factsEchoes(card);
  if (echoes.length) {
    console.error("ERROR: the background states a figure the facts grid already prints, so the reader reads the same number twice: " + echoes.join(", "));
    console.error("       Drop it from the prose and keep the grid. A RANK, a DENSITY or a SHARE derived from it is not an echo, and is usually the better sentence.");
    console.error("       Then: node .claude/facts-echo.js --card=" + card.id);
    process.exit(1);
  }
} else if (!isArt && !isFlag && Array.isArray(card.facts) && card.facts.length) {
  // not refused — the box is general, and an ARTWORK card's facts are its own furniture (the artist, the
  // date, the medium) — but worth saying on anything else, since the box arrived with map cards.
  // A FLAG card's grid is its map-card twin's, copied whole, so it is meant on every one of the 233 and
  // the warning would be 233 lines of noise about the format working.
  console.warn("WARNING: card." + card.id + " has a `facts` box but no `map`. That is allowed; just check it was meant.");
}

/* ---------- ARTWORK CARDS (Sep 2026, on request) ----------
   `artwork: true` says THE PICTURE IS THIS CARD'S OWN SUBJECT: the front draws the work and nothing
   else, and the reader names it. It is a flag rather than an inference from `image` because an ordinary
   card's picture ILLUSTRATES its subject, which is a different claim — see cardArtSpec in app.js.

   SIX THINGS ARE CHECKED HERE AND NOWHERE ELSE, and every one of them ships looking perfect:

   · A picture, with a CREDIT and an ALT. The credit is required of every card already; the alt is
     required HERE because on this format it is not a courtesy, it is the question as a reader who
     cannot see the picture receives it.
   · THE ALT MAY NOT NAME THE ANSWER, and may not name whatever the `facts` box gives as the artist.
     "Describe, never name" is the rule the plan states, and an alt reading "Rembrandt's Night Watch"
     hands the answer to exactly the reader the alt exists for — silently, since no sighted reviewer
     ever sees it.
   · AN EMPTY `question`, AND NO EXTRA PHRASINGS. The request is that the question side show no words,
     so the format renders none — and a sentence stored in a field nothing draws is a thing a reader of
     the data cannot tell from a bug, so it is refused rather than ignored.
   · AN ARTIST ROW AND A LOCATION ROW IN `facts`, matching app.js's own declared label tables. The
     reader is asked for three things — the title, the artist and the date — and `cardArtAnswers`
     derives every one of them from the card's own display fields rather than keeping a second copy, so
     a grid with no artist row this can read is a card that silently asks fewer questions than the
     format promises, and looks finished doing it. The LOCATION row is required for a different reason:
     it is no longer asked (Sep 2026, on request) but it is still the answer side's statement of where
     the work is now, and a card whose grid has no row app.js can read as one has stopped making it.
   · A DATE LINE THAT YIELDS A YEAR. It is the third asked answer AND the card's place in a collection
     whose whole running order is chronological, so a card without one is unanswerable and unsortable
     at once. */
if ("artwork" in card && typeof card.artwork !== "boolean") {
  console.error("ERROR: card.artwork is true or absent — it says the picture IS this card's subject."); process.exit(1);
}
if (isArt) {
  if (isMap) { console.error("ERROR: a card is a map card or an artwork card, not both — each is a different question in the same slot."); process.exit(1); }
  const img = card.image;
  if (!img || !String(img.src || "").trim()) {
    console.error("ERROR: an artwork card needs `image.src` — the picture IS the question. A work that cannot be shown (copyright: see docs/art-card-plan.md) is written as an ORDINARY card, without `artwork`.");
    process.exit(1);
  }
  if (!String(img.alt || "").trim()) {
    console.error("ERROR: an artwork card needs `image.alt` — on this format the alt text is the question for a reader who cannot see the picture. Describe what is depicted; never name the work or the artist.");
    process.exit(1);
  }
  const alt = String(img.alt).toLowerCase();
  const ansT = String(card.answerText || "").trim().toLowerCase();
  if (ansT && alt.indexOf(ansT) >= 0) {
    console.error("ERROR: image.alt contains the answer (" + JSON.stringify(card.answerText) + ") — it must DESCRIBE the picture, not name it.");
    process.exit(1);
  }
  const artistRow = (Array.isArray(card.facts) ? card.facts : []).find((r) => Array.isArray(r) && /^(artist|maker|sculptor|painter|attributed to)$/i.test(String(r[0] || "").trim()));
  const artist = artistRow ? String(artistRow[1] || "").trim() : "";
  if (artist && !/^unknown$/i.test(artist) && alt.indexOf(artist.toLowerCase()) >= 0) {
    console.error("ERROR: image.alt names the artist (" + JSON.stringify(artist) + ") — the card asks for the artist too, so the alt may not give it away.");
    process.exit(1);
  }
  if (String(card.question || "").trim()) {
    console.error("ERROR: an artwork card's `question` is EMPTY (\"\") — the picture is the whole question and no prose is drawn on the front. What to type is said by the answer box's own three labels.");
    process.exit(1);
  }
  if (Array.isArray(card.questions) && card.questions.length) {
    console.error("ERROR: an artwork card carries no extra question phrasings — the picture is the clue. Give it `\"questions\": []`.");
    process.exit(1);
  }
  card.question = "";
  card.questions = [];
  const facts = Array.isArray(card.facts) ? card.facts : [];
  const bad = facts.find((r) => !Array.isArray(r) || r.length !== 2 || !String(r[0] || "").trim() || !String(r[1] || "").trim() || /[<>]/.test(String(r[0]) + String(r[1])));
  if (bad) { console.error("ERROR: every `facts` row is a [label, value] pair of non-empty PLAIN TEXT: " + JSON.stringify(bad)); process.exit(1); }
  if (facts.length < ART_FACTS_MIN || facts.length > MAP_FACTS_MAX) {
    console.error("ERROR: an artwork card carries " + ART_FACTS_MIN + "–" + MAP_FACTS_MAX + " `facts` rows — the artist, the date, the medium, the size and where it is. This one has " + facts.length + ".");
    process.exit(1);
  }
  /* THE LABEL TABLES ARE app.js's, AND THE MATCH DECIDES WHETHER THE READER IS ASKED AT ALL.
     `cardArtAnswers` reads the artist and the location out of this grid by label — that is what lets
     the grid and the grading be one fact rather than two copies of it — so a row these do not match is
     a field the card silently stops asking for, or, in the location's case, stops stating. Kept in step
     with ART_ARTIST_LABELS / ART_PLACE_LABELS in app.js; a card that reaches a reader with one missing
     looks perfectly finished. */
  const ART_ARTIST_LABELS = /^(artist|maker|sculptor|painter|architect|workshop|attributed to|culture)$/i;
  const ART_PLACE_LABELS = /^(location|where it is|where it is now|collection|museum|held|home)$/i;
  const labelOf = (r) => String(r[0] || "").trim();
  if (!facts.some((r) => ART_ARTIST_LABELS.test(labelOf(r)))) {
    console.error("ERROR: an artwork card needs an artist row in `facts` — the reader is asked who made it. The label must be one of: artist, maker, sculptor, painter, architect, workshop, attributed to, culture. Write \"Unknown\" where the work is anonymous.");
    process.exit(1);
  }
  if (!facts.some((r) => ART_PLACE_LABELS.test(labelOf(r)))) {
    console.error("ERROR: an artwork card needs a location row in `facts` — the answer side states where the work is now (it is shown rather than asked). The label must be one of: location, where it is, where it is now, collection, museum, held, home.");
    process.exit(1);
  }
  /* A `Date` row would be a THIRD copy of the date — the date line already carries it and is what
     `cardStartYear` sorts the collection by, so that is where the asked-for date is read from. */
  if (facts.some((r) => /^date$/i.test(labelOf(r)))) {
    console.error("ERROR: an artwork card does not carry a `Date` row in `facts` — the date line above the grid is the date, and is what the reader is graded against and what files the card in chronological order.");
    process.exit(1);
  }
  if (!/<span class="dt-k">[^<]+<\/span><span class="dt-v">[^<]+<\/span>/.test(String(card.answerDate || ""))) {
    console.error("ERROR: an artwork card needs a date line with a labelled row (Painted / Carved / Cast / Made …) — it is the third thing the reader is asked for and the card's place in the collection's running order.");
    process.exit(1);
  }
}

/* ---------- A FLAG CARD (Sep 2026, on request) ----------
   `flagCard: true` says the card's FLAG is its whole question: the front draws it and the reader names
   the country or territory it belongs to. See docs/flags-card-plan.md and the FLAG CARDS block in
   app.js. The picture is the existing `answerFlag` field rather than a new one — it already refuses an
   uncredited `src` and already rides the serializer and the overlay — so what is checked here is the
   three things the FORMAT adds, every one of which renders perfectly when it is wrong.

   · IT NEEDS THE FLAG. `cardFlagSpec` returns null without one, and a flag card with no flag draws a
     bare prompt naming nothing — a question with no question in it.
   · IT NEEDS AN `alt` THAT DOES NOT NAME THE ANSWER. This is the artwork card's own guard, and it is
     the one rule that makes this format accessible rather than merely drawn: a flag CAN be described
     without answering ("three horizontal bands of saffron, white and green"), where a shape on a globe
     cannot. `answerFlagHTML` falls back to the CREDIT where a card has no alt, which is right beside an
     answer already on screen and would hand the answer over on a front — and a Commons credit for a
     national flag reads "Government of India, public domain".
   · IT IS ONE FORMAT AT A TIME. A map card's window and an artwork card's picture both occupy the
     front, so a card carrying two of the three is two questions in one slot. */
if ("flagCard" in card && typeof card.flagCard !== "boolean") {
  console.error("ERROR: card.flagCard is true or absent — it says the card's flag IS its whole question."); process.exit(1);
}
if (isFlag) {
  if (isMap || isArt) { console.error("ERROR: a card is a flag card, a map card or an artwork card, not two of them — each is a different question in the same slot."); process.exit(1); }
  const fl = card.answerFlag;
  if (!fl || !String(fl.src || "").trim()) {
    console.error("ERROR: a flag card needs `answerFlag.src` — the flag IS the question. An entity whose flag cannot be shown is NOT carded here (see `fl-036` Afghanistan in docs/flags-card-plan.md).");
    process.exit(1);
  }
  if (!String(fl.alt || "").trim()) {
    console.error("ERROR: a flag card needs `answerFlag.alt` — on this format the alt text is the question for a reader who cannot see the flag. Describe the field, the colours and the charge; never name the country.");
    process.exit(1);
  }
  const alt = String(fl.alt).toLowerCase();
  const ansT = String(card.answerText || "").trim().toLowerCase();
  if (ansT && alt.indexOf(ansT) >= 0) {
    console.error("ERROR: answerFlag.alt contains the answer (" + JSON.stringify(card.answerText) + ") — it must DESCRIBE the flag, not name whose it is. The 115 descriptions already on `gw-` cards open \"The flag of X: \"; cut that prefix.");
    process.exit(1);
  }
  if (Array.isArray(card.questions) && card.questions.length) {
    console.error("ERROR: a flag card carries no extra question phrasings — the flag is the clue, and three ways of saying \"name this flag\" are three ways of saying nothing. Give it `\"questions\": []`.");
    process.exit(1);
  }
  card.questions = [];
}

/* ---------- DRAW CARDS (Sep 2026, on request) ----------
   `drawCard: true` says the card's flag is its ANSWER: the prompt names the country and the reader draws
   the flag from memory on the pad, then reveals it and grades themselves. It is `fl-NNN` run backwards
   and is numbered +500 from its twin. See docs/flags-card-plan.md and the DRAW CARDS block in app.js.
   Four things are checked, and every one of them renders perfectly when it is wrong.
   · IT NEEDS THE FLAG, for the flag card's reason one step later: without one the reveal shows an empty
     frame and the card simply has no answer in it.
   · IT IS NOT ALSO A FLAG CARD. The two booleans say OPPOSITE things about the same picture — one puts it
     on the front and one holds it back — so a card carrying both shows the answer on the question side
     and looks entirely normal doing it.
   · ITS PROMPT CARRIES NO CLOZE BLANK, which is the one place this format departs from every other card
     here. There is nothing to type: the answer is a drawing. A blank would put an ungradeable input on
     the card and, under the "Answer before revealing" policy, a gate the reader could never pass.
   · AND ITS PROMPT MUST NAME THE COUNTRY. The whole question is "draw THIS flag", so a prompt that does
     not say whose is a card asking for nothing — and it is exactly the shape a copy-and-paste from the
     card above would produce. */
if ("drawCard" in card && typeof card.drawCard !== "boolean") {
  console.error("ERROR: card.drawCard is true or absent — it says the card's flag is its ANSWER and the reader draws it."); process.exit(1);
}
if (isDraw) {
  if (isMap || isArt || isFlag) { console.error("ERROR: a card is a draw card, a flag card, a map card or an artwork card, not two of them. A draw card and a flag card in particular are OPPOSITES — `flagCard` puts the flag on the question side and `drawCard` holds it back until the reveal, so a card carrying both shows the reader the answer."); process.exit(1); }
  const fl = card.answerFlag;
  if (!fl || !String(fl.src || "").trim()) {
    console.error("ERROR: a draw card needs `answerFlag.src` — the flag IS the answer, and without one the reveal is an empty frame. An entity whose flag cannot be shown is NOT carded here (see the deferrals in docs/flags-card-plan.md).");
    process.exit(1);
  }
  if (Array.isArray(card.questions) && card.questions.length) {
    console.error("ERROR: a draw card carries no extra question phrasings — there is one thing to ask and three ways of saying \"draw it\" are three ways of saying nothing. Give it `\"questions\": []`.");
    process.exit(1);
  }
  card.questions = [];
  if (/class="blank"/.test(String(card.question || ""))) {
    console.error("ERROR: a draw card's prompt carries NO cloze blank — the answer is a drawing, so there is nothing to type. A blank here also arms the \"Answer before revealing\" policy against a field the reader can never fill.");
    process.exit(1);
  }
  const ansT = String(card.answerText || "").trim();
  if (ansT && String(card.question || "").toLowerCase().indexOf(ansT.toLowerCase()) < 0) {
    console.error("ERROR: a draw card's prompt does not name " + JSON.stringify(ansT) + " — the whole question is \"draw THIS flag\", so the prompt has to say whose.");
    process.exit(1);
  }
}

const QMIN = isMap || isArt || isFlag || isDraw ? MAPQ_MIN : Q_MIN, QMAX = isMap || isArt || isFlag || isDraw ? MAPQ_MAX : Q_MAX;
if (!isMap && !isArt && !isFlag && !isDraw && (!Array.isArray(card.questions) || card.questions.length !== N_EXTRA || card.questions.some(q => typeof q !== "string" || !q.trim()))) {
  console.error("ERROR: card needs a `questions` array of exactly " + N_EXTRA + " EXTRA phrasings (3 questions in all — see CLAUDE.md). Each is a full standalone clue with its own mid-sentence blank.");
  process.exit(1);
}
/* An ARTWORK card has no question prose at all (checked above: `question` is "" and `questions` is
   empty), so there is nothing here to hold to a length or to a blank. */
for (const [qi, q] of (isArt ? [] : [card.question, ...card.questions]).entries()) {
  const qn = qWords(q);
  if (qn < QMIN || qn > QMAX) {
    console.error("ERROR: question " + (qi + 1) + " is " + qn + " words — it must be " + QMIN + "–" + QMAX +
      (isMap || isArt || isFlag || isDraw ? " (the picture, the flag or the map is the clue, so the prompt is short)." : " (aim for ~28; see CLAUDE.md). Keep one identifying clue and move the rest into the abstract."));
    process.exit(1);
  }
  if (!isDraw && !/class="blank"/.test(q)) {
    console.error("ERROR: question " + (qi + 1) + " has no <span class=\"blank\">_____</span> — every phrasing blanks the answer mid-sentence.");
    process.exit(1);
  }
}
/* THE ANSWER TERM CARRIES NO ARTICLE (Aug 2026, on request). "the polis" is a phrase in a sentence;
   what the reader is being asked to recall is `polis`. The article belongs to the question and to the
   background, where the grammar needs it, and never to the term itself — which is also what keeps the
   answer matching its glossary key, its `answerText` and the way a reader would say it aloud. */
/* ...EXCEPT WHERE THE ARTICLE IS PART OF THE PROPER NOUN (Sep 2026, on `gw-719`). A place can be
   NAMED "The X": Anguilla's capital is The Valley on its own government's facts page, and the Dutch
   seat of government is The Hague in English. Stripping the article there does not bare a term, it
   renames a town — and `test-card-plans.js` compares the shipped answer against the plan's own name,
   so the mangled form would fail there instead. Declared rather than pattern-matched, for the reason
   `CROSSREF_WRONG` is: a rule that guesses which "The" is a name would let the real fault through.
   Add an entry only after checking how the place's own authority writes it. */
const ARTICLE_IS_NAME = new Set([
  "the valley",   // Anguilla's capital; "The Valley" on gov.ai's own Anguilla Facts page
  "the hague",    // the Dutch seat of government, the English name of 's-Gravenhage / Den Haag
  "the gambia",   // the country's own constitutional name
  "the bahamas",  // ditto
  /* AND ONE THAT IS NOT A PLACE: "An Lushan" is the Chinese surname An (安), and the check cannot
     tell it from the English indefinite article. Same rule as the four above — the term is a NAME,
     and a matcher clever enough to see that would let a real article through. */
  "an lushan rebellion",
]);
for (const f of ["answer", "answerText"]) {
  if (ARTICLE_IS_NAME.has(String(card[f] || "").trim().toLowerCase())) continue;
  if (/^(the|a|an)\s/i.test(card[f] || "")) {
    console.error("ERROR: card." + f + " begins with an article: " + JSON.stringify(card[f]) + "\n" +
      "       Drop it — the answer term is the bare term. Put the article in front of the blank in each\n" +
      "       question instead (\"... in the <span class=\\\"blank\\\">_____</span>, which ...\") and outside the\n" +
      "       <b> in the background (\"The <b>polis</b> is ...\", not \"<b>The polis</b> is ...\").");
    process.exit(1);
  }
}
const boldTerm = (String(card.abstract || "").match(/^<b>([^<]*)<\/b>/) || [])[1] || "";
if (!ARTICLE_IS_NAME.has(boldTerm.trim().toLowerCase()) && /^<b>(the|a|an)\s/i.test(card.abstract || "")) {
  console.error("ERROR: the background bolds the article. The bold is the answer term alone:\n" +
    "       write \"The <b>polis</b> is ...\", not \"<b>The polis</b> is ...\".");
  process.exit(1);
}

/* EVERY NEW CARD IS RATED FOR HOW OBSCURE ITS ANSWER TERM IS (Aug 2026, on request). `difficulty` is an
   integer 1–5 — 1 a household name, 5 a word met in the scholarship and almost nowhere else — and it is
   what the daily minigames draw under: they deal a term COLD, with no background to read first, so a pool
   holding `qa-si-re-u` deals unanswerable rounds. Study is unaffected at every rating.

   It is REFUSED rather than defaulted, and that is the whole reason it is here. A default would have to be
   a guess, and the safe guess (too obscure for the games) is invisible — the card simply never appears in
   one, and nothing anywhere says so. The 409 cards shipped before this existed were rated in one pass; the
   corpus stays rated only if a card cannot be written without one. Batch-rate an older card with
   `.claude/add-card-difficulty.js`, which carries the same scale in its header. */
const DIFF_MIN = 1, DIFF_MAX = 5;
const DIFF_LABELS = { 1: "household name", 2: "generally familiar", 3: "known to the interested", 4: "specialist", 5: "highly obscure" };
if (!Number.isInteger(card.difficulty) || card.difficulty < DIFF_MIN || card.difficulty > DIFF_MAX) {
  console.error("ERROR: card needs a `difficulty` — an integer " + DIFF_MIN + "–" + DIFF_MAX + " rating how well known its ANSWER TERM is to the general population:\n" +
    Object.keys(DIFF_LABELS).map(n => "         " + n + "  " + DIFF_LABELS[n]).join("\n") + "\n" +
    "       It rates the TERM, not the card — a subtle card about " + JSON.stringify("Homer") + " is still a 1, and a\n" +
    "       beautifully clear one about " + JSON.stringify("qa-si-re-u") + " is still a 5. The daily minigames deal only\n" +
    "       terms at or below the bar in app.js (GAME_MAX_DIFFICULTY); every card is studiable whatever its rating.");
  process.exit(1);
}

/* …AND IT CARRIES ITS CATEGORISING TAGS, ON THE SAME REASONING AND FOR A DIFFERENT GAME (Sep 2026).
   `tags` is 3–8 lowercase tags in the glossary's own vocabulary — the KIND first (`era`, `place`,
   `object`, `person`, `industry`…), then the subject areas, then the specifics — and what they are FOR is
   Multiple Choice: `cardKinship` counts the tags two cards share and offers the three closest as the wrong
   answers, so the Mousterian is answered against the Oldowan and the Acheulean rather than against a cave,
   an ice age and a fossil.

   THERE WAS NO GUARD HERE UNTIL NOW, and the corpus records exactly what that cost: 467 cards, 14.5% of
   it, carry no tags at all, and they arrived in whole CONTIGUOUS RUNS — `gr-611`–`gr-760`,
   `cnh-147`–`cnh-230`, `us-061`–`us-100`, `wh-151`–`wh-200` — rather than card by card, because nothing
   ever said no. It is the `difficulty` fault one game over and quieter still: an untagged card falls
   through to the coarse `answerType` fallback, draws slightly worse distractors, and NOBODY EVER REPORTS A
   SLIGHTLY WORSE DISTRACTOR. So it is REFUSED rather than defaulted, for `difficulty`'s reason — there is
   no safe guess, only an invisible one. Batch-tag a card already shipped with `.claude/add-card-tags.js`.

   The rules are that tool's own, SLICED OUT BY TEXT rather than copied, and the run STOPS if the slice
   fails: a second copy goes stale on a change made in a file nobody here has reason to open, which is the
   scar `add-card-tags.js` itself left when its private copy of a field list stripped `difficulty` and
   `undatable` from all 500 cards in one run. */
const TAG_RULES = (() => {
  const src = fs.readFileSync(path.join(__dirname, "add-card-tags.js"), "utf8");
  const n = /const MIN_TAGS = (\d+), MAX_TAGS = (\d+);/.exec(src);
  const rx = /const TAG_RX = \/((?:\\.|[^\/\\])+)\/([a-z]*);/.exec(src);
  if (!n || !rx) {
    console.error("ERROR: could not read the tag rules out of .claude/add-card-tags.js (MIN_TAGS, MAX_TAGS, TAG_RX).\n" +
      "       They are sliced out by text so the two tools cannot come to disagree about what a tag is.\n" +
      "       Fix the slice rather than restating the rules here — a second copy is the thing that goes stale.");
    process.exit(1);
  }
  return { min: +n[1], max: +n[2], rx: new RegExp(rx[1], rx[2]) };
})();
const TAG_HELP =
  "       Tag 1 is the KIND (era, place, object, person, industry, culture, event, concept, fossil, …),\n" +
  "       then the subject areas (archaeology, history, prehistory, science, geography, art, …), then the\n" +
  "       specifics — a country, a region, a period:\n" +
  '         "tags": ["industry", "archaeology", "prehistory", "stone tools", "france"]\n' +
  "       REUSE the vocabulary the glossary and the shipped cards already carry rather than coining a\n" +
  "       near-synonym: a tag no other card shares can never group anything. Multiple Choice draws its\n" +
  "       three wrong answers from the cards sharing the most tags, so without them this card falls through\n" +
  "       to the coarse `answerType` fallback and its distractors get quietly worse.";
if (!Array.isArray(card.tags)) {
  console.error("ERROR: card needs `tags` — an array of " + TAG_RULES.min + "–" + TAG_RULES.max + " lowercase category tags.\n" + TAG_HELP);
  process.exit(1);
}
if (card.tags.length < TAG_RULES.min || card.tags.length > TAG_RULES.max) {
  console.error("ERROR: card.tags has " + card.tags.length + " tag(s) — it wants " + TAG_RULES.min + "–" + TAG_RULES.max + ".\n" + TAG_HELP);
  process.exit(1);
}
for (const t of card.tags) {
  if (typeof t !== "string" || !TAG_RULES.rx.test(t)) {
    console.error("ERROR: " + JSON.stringify(t) + " is not a tag — lowercase words, 2–40 characters, as the glossary's are.\n" + TAG_HELP);
    process.exit(1);
  }
}

/* OPTIONAL: `undatable: true` says the ANSWER TERM does not happen at a time — a process, a condition, a
   material, a category or a physical feature — so the Timeline game must not ask a reader to place it.
   It is not required and not guessed at: almost every card names something with a date, and the flag is
   an editorial judgement about the term rather than a fact anything can read off the date line, which
   cannot tell an onset from one end of a span. It only bites on a card the games can reach at all
   (difficulty at or below the bar); see `cardUndatable` in app.js and `.claude/mark-undatable.js`, which
   is the batch tool for cards already shipped. */
if ("undatable" in card && typeof card.undatable !== "boolean") {
  console.error("ERROR: card.undatable must be true or false — it is the Timeline game's own filter, not a note. Set it true where the answer term names something with no single moment a reader could place it at (see CLAUDE.md), and leave it out otherwise.");
  process.exit(1);
}
if (card.undatable === false) delete card.undatable;   // the absent state, written out rather than shipped as a field that says nothing

const aWords = qWords(card.abstract);
if (aWords < A_MIN || aWords > A_MAX) {
  console.error("ERROR: the background is " + aWords + " words — it must be " + A_MIN + "–" + A_MAX +
    " (aim for ~300, in two blocks of five sentences; see CLAUDE.md).");
  process.exit(1);
}

/* ...AND THE SHAPE, which this said in its error message for a year and never checked (Sep 2026).
   The rule is TEN sentences in TWO BLOCKS OF FIVE split by ` <br><br> `, and nothing enforced it:
   `gr-639` and `gr-678` shipped with NINE sentences, and `cnh-128` and `cnh-258` with ten split 6+4
   and 4+6 — the break one sentence late and one sentence early. Four cards in 3,215, invisible,
   because every one reads perfectly and every one is in band on words: THE COUNT IS THE ONLY THING
   THAT CAN SEE THIS, which is why it is a guard rather than a note.
     · AND THE BLOCKS ARE CHECKED SEPARATELY, NOT JUST THE TOTAL. Two of the four carried the full
       ten sentences and were still wrong, because the citation passes place markers by sentence
       index ACROSS BOTH BLOCKS while a reader meets them as two paragraphs of five — so a mis-placed
       break moves where the card pauses without moving a single word.
   THE SPLITTER IS split-abstract.js's, not a second copy: it is the module the citation passes place
   markers by sentence index with, so a card this accepts is a card those can mark. */
const SHAPE = require("./split-abstract.js").count(card.abstract);
if (SHAPE.length !== 2 || SHAPE[0] !== 5 || SHAPE[1] !== 5) {
  console.error("ERROR: the background splits " + JSON.stringify(SHAPE) + " — it must be exactly ten " +
    "sentences in two blocks of five, separated by ` <br><br> ` (see CLAUDE.md).");
  console.error("       If the prose really is 5+5, look for a sentence ending in a lone capital " +
    "letter: the splitter reads that as an initial (the `V. Gordon Childe` guard), which is how " +
    "gr-639's \"the letters A and N.\" counted as nine. Reword so the stop follows a word.");
  process.exit(1);
}

/* The date line is a LIST OF DATES, not a summary — the dates worth memorising beside the answer term,
   or nothing at all where the term has none. It is shared with set-date-line.js so a card written by
   hand and a card converted by that pass cannot end up in different shapes. */
if (!isDateList(card.answerDate)) {
  console.error("ERROR: card.answerDate is not a date line. Write the dates as a key/value list and nothing else:\n" +
    "         <div class=\"dt\"><span class=\"dt-k\">Era</span><span class=\"dt-v\">115,000 – 11,700 BP</span></div>\n" +
    "       Several key/value pairs inside the one .dt stack into aligned rows; a <span class=\"dt-v dt-sub\"> line\n" +
    "       continues under a value with no label of its own. Leave the field \"\" when the card has no obvious date\n" +
    "       — an empty section is the right answer there, not a sentence. Everything else belongs in the abstract.");
  process.exit(1);
}
/* Every new card names the scholarship behind its background. The abstract states things about the past
   as fact, and a study tool that cannot be checked is asking to be believed rather than read — so the
   citations are required, and so is at least one marker tying a sentence to one of them.

   A marker is an EMPTY <sup class="fn" data-fn="N"></sup>; the digit is drawn from this list at render
   time, so re-ordering the list can never leave a wrong number in the text. Every source must be
   referenced by at least one marker: a citation nothing points at is a reading list, not a footnote. */
if (!card.skipSources) {
  const src = card.sources;
  if (!Array.isArray(src) || !src.length || src.some(s => typeof s !== "string" || !s.trim())) {
    console.error("ERROR: card needs a `sources` array — Chicago note-form citations for the claims in its background (see CLAUDE.md). Pass skipSources:true only for a maintenance edit of a card written before citations existed.");
    process.exit(1);
  }
  if (src.length > SRC_MAX) { console.error("ERROR: card has " + src.length + " sources — at most " + SRC_MAX + ". More than that is a bibliography, not footnotes."); process.exit(1); }
  // A NEW card ships at the bar. The backfill pass is allowed to leave an old card short (add-sources.js
  // warns instead), because raising it may be genuinely impossible; a card being written now is not in
  // that position — if five qualifying sources cannot be found for it, its ten sentences are not ready.
  if (src.length < SRC_TARGET) { console.error("ERROR: card has " + src.length + " source(s) — a new card carries at least " + SRC_TARGET + " (see docs/citation-plan.md, \"How many\"). Ten sentences making ten claims are not honestly covered by fewer."); process.exit(1); }
  const openN = src.filter(s => /\[Open access\]/.test(s)).length;
  if (openN <= src.length / 2) console.warn("WARNING: only " + openN + " of this card's " + src.length + " sources are labelled [Open access]. The majority of any card's list must be open — a paywalled work earns its place only as the landmark a claim is actually built on.");
  /* A LANGUAGE MARKER MUST BE ONE app.js CAN DRAW (Sep 2026). A non-English citation ends in `[in
     French]`, lifted into a chip beside the access one; a typo is not an error anywhere, it is a chip
     that never appears, which nothing on the page can report. The list is SLICED out of app.js. */
  src.forEach((s) => { const bad = checkCitationLang(s); if (bad) { console.error("ERROR: a citation " + bad); process.exit(1); } });
  const unlinked = src.filter(s => !SRC_URL.test(s));
  if (unlinked.length) {
    console.error("ERROR: every citation ends in a link the reader can follow — " + JSON.stringify(unlinked[0].slice(0, 80)) + " has none.\n" +
      "       Cite something publicly reachable and put its DOI or permalink last, as Chicago prints it:\n" +
      "         Author, \u201cTitle,\u201d <i>Journal</i> 546, no. 7657 (2017): 289\u201392, https://doi.org/10.1038/nature22336.\n" +
      "       The URL is written as PLAIN TEXT; the site turns it into a link (linkifySrcItem in app.js).");
    process.exit(1);
  }
  const marks = [...String(card.abstract || "").matchAll(/<sup\b[^>]*class="[^"]*\bfn\b[^"]*"[^>]*>/gi)]
    .map(m => { const d = /data-fn="(\d+)"/i.exec(m[0]); return d ? +d[1] : 0; });
  if (!marks.length) {
    console.error("ERROR: card.abstract has no footnote marker. Point its claims at the sources with <sup class=\"fn\" data-fn=\"1\"></sup> (the digit is drawn from the list at render time — leave the tag empty).");
    process.exit(1);
  }
  const bad = marks.filter(n => n < 1 || n > src.length);
  if (bad.length) { console.error("ERROR: card.abstract has a footnote marker for source " + bad[0] + ", but the card has " + src.length + ". A marker with no entry behind it is dropped at render time."); process.exit(1); }
  const unused = src.map((_, i) => i + 1).filter(n => marks.indexOf(n) < 0);
  if (unused.length) { console.error("ERROR: source " + unused.join(", ") + " is never referenced from the abstract. Every citation is a footnote to a specific claim — add a <sup class=\"fn\" data-fn=\"" + unused[0] + "\"></sup> marker, or drop the source."); process.exit(1); }
  // markers belong to the ENGLISH abstract and every translation of it, or a language silently loses the apparatus
  if (!card.skipTranslations) {
    // only the languages the card actually carries — an English-only card has nothing to be out of step with
    for (const l of I18N_LANGS) {
      const a = ((card.i18n || {})[l] || {}).abstract;
      if (!a) continue;
      const tm = [...String(a).matchAll(/<sup\b[^>]*class="[^"]*\bfn\b[^"]*"[^>]*>/gi)].length;
      if (tm !== marks.length) console.warn("WARNING: the " + l + " abstract has " + tm + " footnote markers, the English has " + marks.length + " — the same claims should carry the same markers.");
    }
  }
}
delete card.skipSources;   // control flag only — never written to data.js

// nothing Folio shows is uncredited — the editors gate this too (wireMediaSource in app.js), and a card
// written straight into data.js has to meet the same rule or the credit is simply never added
for (const m of ["image", "video", "answerFlag"]) {
  if (card[m] && String(card[m].src || "").trim() && !String(card[m].credit || "").trim()) {
    console.error("ERROR: card." + m + " has a src but no `credit` — every picture and clip carries its source (see CLAUDE.md).");
    process.exit(1);
  }
}
// …and a picture carries `alt`: what it SHOWS, for a reader who cannot see it — a different sentence from
// its title, which names it for somebody who can. Warned rather than refused; most shipped images predate it.
if (card.image && String(card.image.src || "").trim() && !String(card.image.alt || "").trim()) {
  console.warn("WARNING: card.image has no `alt` — a screen reader will fall back to its title.");
}
/* A FLAG IS THE ONE PICTURE ON A CARD THAT `alt` IS THE WHOLE OF. It is drawn inside the answer box at
   about the height of a line, it never opens fullscreen, and it carries no title and no caption — so a
   reader who cannot see it has nothing else to go on, and the field is REFUSED rather than warned about.
   Describe what the flag shows, not that it is a flag. */
/* A LOCATOR IS CHECKED FOR SHAPE AND NOT WRITTEN HERE. `add-locators.js` is what fetches the coordinate,
   so anything arriving in a card file is a hand-typed pair — which is the one thing that rule exists to
   prevent — but a card being re-added after an edit legitimately carries the one already fetched, so the
   pair is validated rather than refused. A coordinate outside the globe is a dot that never draws. */
if (card.locator) {
  const at = card.locator.at;
  if (!Array.isArray(at) || at.length !== 2 || !isFinite(at[0]) || !isFinite(at[1]) || Math.abs(at[0]) > 180 || Math.abs(at[1]) > 90) {
    console.error("ERROR: card.locator.at must be [lon, lat] within the globe — write it with `node .claude/add-locators.js`, which fetches the coordinate rather than trusting a typed one.");
    process.exit(1);
  }
  if (!String(card.locator.name || "").trim()) {
    console.error("ERROR: card.locator has no `name` — the dot is drawn labelled, so an unnamed one is a mark with nothing to say.");
    process.exit(1);
  }
  /* ---- AND IT OPENS ON THE PLACE, NOT ON AN ARTICLE (Sep 2026, on request: "the atlas location for the
     card 'Hongshan culture' should not include the word 'The' in its label. The same goes for other
     locations in the atlas windows, in all collections") ----
     A map label is a place NAMED rather than a phrase in a sentence, and no atlas prints "The Apennines"
     beside the range. Eight carried one across four collections, and they were stripped in data.js in the
     same pass.
     IT IS REFUSED HERE RATHER THAN STRIPPED AT DRAW TIME, and the reason is a handful of real place names:
     The Hague is the seat of the Dutch government and The Valley is the capital of Anguilla, both of them
     labels this same window draws off the capitals tables. A rule clever enough to tell those from a
     definite article is a rule that will one day be wrong about one of them; a refusal at the point of
     writing is not. */
  if (/^the\s/i.test(String(card.locator.name).trim())) {
    console.error("ERROR: card.locator.name opens on \"The\" — a map label names a place rather than reading as a phrase, so write " + JSON.stringify(String(card.locator.name).trim().replace(/^the\s+/i, "")) + ".");
    process.exit(1);
  }
  /* ---- AND WHAT SORT OF PLACE IT IS (Aug 2026, with the locator kinds) ----
     A dot is the right mark for a cave and the wrong one for a river, a range or a region, so a locator
     may declare a `kind` and — for the two that have extent — the shape to draw. Both are hand-authored,
     which is exactly why they are validated here: `at` can be fetched and an extent cannot, so a
     transposed pair in an `area` is a region drawn in the wrong ocean and nothing anywhere would throw.
     A `kind` app.js does not know is silently treated as a point, which is the quiet failure this
     refusal exists to turn into a loud one. */
  const KINDS = ["point", "battle", "river", "range", "region"];
  const kind = card.locator.kind == null ? "point" : String(card.locator.kind);
  if (KINDS.indexOf(kind) < 0) {
    console.error("ERROR: card.locator.kind must be one of " + KINDS.join(", ") + " — got " + JSON.stringify(card.locator.kind) + ".");
    process.exit(1);
  }
  const shape = kind === "region" ? "area" : kind === "range" ? "spine" : null;
  if (shape) {
    const pts = card.locator[shape];
    if (!Array.isArray(pts) || pts.length < 3) {
      console.error("ERROR: a locator of kind \"" + kind + "\" needs a `" + shape + "` of at least three [lon, lat] points — without it the card falls back to a dot, which is the mark this kind exists to replace.");
      process.exit(1);
    }
    const bad = pts.findIndex((q) => !Array.isArray(q) || q.length !== 2 || !isFinite(q[0]) || !isFinite(q[1]) || Math.abs(q[0]) > 180 || Math.abs(q[1]) > 90);
    if (bad >= 0) {
      console.error("ERROR: card.locator." + shape + "[" + bad + "] is not a [lon, lat] pair within the globe: " + JSON.stringify(pts[bad]) + ".");
      process.exit(1);
    }
  }
  for (const extra of ["area", "spine"]) {
    if (card.locator[extra] && extra !== shape) {
      console.error("ERROR: card.locator." + extra + " is only read on a locator of kind \"" + (extra === "area" ? "region" : "range") + "\" — this one is \"" + kind + "\", so the shape would be carried in data.js and never drawn.");
      process.exit(1);
    }
  }
}
/* A QUOTATION IS CHECKED AGAINST THE ACTUAL SHELF (Aug 2026, with the card quotations). The card names
   a book and a section, and both are read out of `app.js`'s own eager `BOOKS` registry and the generated
   `books/<id>.js` — so a typo, a book that has left the shelf and a section the importer never brought in
   are all refused HERE, at the point of writing, rather than rendering as nothing on the page. The renderer
   keeps its own guard, but a silent blank is exactly what an author cannot see. */
if (card.quote) {
  const q = card.quote;
  const bid = String(q.book || "").trim();
  if (!bid || !String(q.text || "").trim()) {
    console.error("ERROR: card.quote needs both a `book` and the `text` of the passage.");
    process.exit(1);
  }
  const appjs = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
  // the registry is one object literal per book; matching the id is enough to know it is on the shelf
  const onShelf = new RegExp('\\bid:\\s*"' + bid.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '"').test(appjs);
  if (!onShelf) {
    console.error('ERROR: card.quote.book "' + bid + '" is not a book in the Library — check the id against the BOOKS registry in app.js.');
    process.exit(1);
  }
  const n = q.n == null ? "" : String(q.n).trim();
  if (n) {
    const bookFile = path.join(__dirname, "..", "books", bid + ".js");
    if (!fs.existsSync(bookFile)) {
      console.error('ERROR: books/' + bid + '.js does not exist, so its sections cannot be checked.');
      process.exit(1);
    }
    const g = {}; g.window = { FOLIO_BOOKS_IN: [] };
    try { require("vm").runInNewContext(fs.readFileSync(bookFile, "utf8"), g); } catch (e) {
      console.error("ERROR: books/" + bid + ".js could not be read: " + e.message);
      process.exit(1);
    }
    const book = (g.window.FOLIO_BOOKS_IN || [])[0] || {};
    const has = (book.chapters || []).some((ch) => String(ch.n) === n);
    if (!has) {
      console.error('ERROR: "' + bid + '" has no section ' + n + " — the book holds " +
        (book.chapters || []).length + " sections" +
        ((book.chapters || []).length ? " (" + (book.chapters || []).slice(0, 6).map((ch) => ch.n).join(", ") + "…)" : "") + ".");
      process.exit(1);
    }
  }
}
if (card.answerFlag && String(card.answerFlag.src || "").trim() && !String(card.answerFlag.alt || "").trim()) {
  console.error("ERROR: card.answerFlag has a src but no `alt` — the flag is drawn with no title and no caption, so `alt` is all a reader who cannot see it gets.");
  process.exit(1);
}
/* THE "WHY" PROMPT AND THE CAUSAL EDGES both live in `.claude/card-links.js`, because `add-card-links.js`
   writes the same two fields onto cards already shipped and a second copy of a rule is a rule with no
   home. The `why` check needs nothing but the card; `leadsTo` needs the whole corpus and is run further
   down, once data.js has been loaded.

   IT IS REQUIRED HERE AND OPTIONAL THERE (Sep 2026, on request), which is the whole point of the flag:
   a card written from today ships with its Think-it-through set, and `add-card-links.js` stays the tool
   for the cards written before the rule. A MAP CARD and a FLAG CARD are the exemptions, for two
   different reasons — see `whyExempt`. */
{ const e = checkWhy(card, { required: true }); if (e) { console.error("ERROR: " + e + " — see CLAUDE.md."); process.exit(1); } }
if (REQUIRE_TRANSLATIONS && !card.skipTranslations) {   // a new card ships in all 9 site languages (i18n block)
  const missing = [];
  for (const l of I18N_LANGS) {
    const tr = (card.i18n || {})[l] || {};
    for (const f of I18N_FIELDS) if (!(typeof tr[f] === "string" && tr[f].trim())) missing.push(l + "." + f);
    // the phrasing pool translates as a set: every language carries the same number of extras
    if (!Array.isArray(tr.questions) || tr.questions.length !== N_EXTRA || tr.questions.some(q => typeof q !== "string" || !q.trim())) missing.push(l + ".questions[" + N_EXTRA + "]");
  }
  if (missing.length) { console.error("ERROR: card needs `i18n` translations for all 9 languages × 5 fields + the `questions` extras (missing: " + missing.slice(0, 10).join(", ") + (missing.length > 10 ? " … +" + (missing.length - 10) : "") + ") — or set skipTranslations:true for a deliberate English-only maintenance edit"); process.exit(1); }
}
// …and whatever translations a card DOES carry are held to the English's brevity, in their own idiom
for (const l of I18N_LANGS) {
  const tr = (card.i18n || {})[l];
  if (!tr) continue;
  for (const q of [tr.question, ...(tr.questions || [])]) {
    if (typeof q !== "string" || !q.trim()) continue;
    const long = (l === "zh" || l === "ja") ? plain(q).length > Q_TR_MAX_CHARS : qWords(q) > Q_TR_MAX_WORDS;
    if (long) console.warn("WARNING: a " + l + " question looks much longer than the English — shorten it to match (see CLAUDE.md).");
  }
}
delete card.skipTranslations;   // control flag only — never written to data.js
/* THE `i18n` BLOCK IS NOT WRITTEN (2026-08-08, on request). The card translations were removed along with
   the glossary ones: 2.06 MB of the eager path — 58% of data.js — that no reader could reach while
   `MULTILANG = false`. Writing one here would put it straight back into every visitor's first paint, so a
   batch that still carries `i18n` is accepted and its translations DROPPED, loudly, rather than honoured.
   `test-i18n-lang.js` asserts the corpus stays clean. Restoring the languages means deleting this, not
   working around it. */
if (card.i18n && Object.keys(card.i18n).length) {
  console.warn("WARNING: card." + card.id + " carries an `i18n` block (" + Object.keys(card.i18n).join(", ") +
    ") — DROPPED. The site is English-only and card translations were removed from data.js; see CLAUDE.md.");
  delete card.i18n;
}

const win = loadWindow(dataPath), cards = win.CARD_DATA, tree = win.COLLECTION_TREE;
if (cards.some(c => c.id === card.id)) { console.error("ERROR: duplicate id:", card.id); process.exit(1); }
const leaves = []; for (const col of tree.collections) leafDecks(col, leaves);
const deck = deckId ? leaves.find(d => d.id === deckId) : leaves[0];
if (!deck) { console.error("ERROR: deck not found:", deckId, "| available:", leaves.map(d=>d.id).join(", ")); process.exit(1); }

{
  const appSrc = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
  const collIdx = collectionIndex(tree);
  const byId = {}; for (const c of cards) byId[c.id] = c;
  // the card being added is not in the tree yet, so its collection is the one its DECK belongs to
  const deckColl = (() => { for (const col of tree.collections) { let hit = false; (function w(n) { if (n.id === deck.id) hit = true; (n.children || []).forEach(w); })(col); if (hit) return col.id; } return null; })();
  const e = checkLeadsTo(card, {
    byId, cardYears: loadCardYears(appSrc),
    collectionOf: (cid) => (cid === card.id ? deckColl : collIdx[cid] || null),
  });
  if (e) { console.error("ERROR: " + e + " — see CLAUDE.md."); process.exit(1); }
  /* ---------- WHO FOUGHT, ON A CARD WHOSE ANSWER IS A WAR (Sep 2026) ----------
     The rules live in `.claude/card-war.js` because `add-card-wars.js` enforces the same ones on the
     cards already shipped, and a second copy of a validation goes stale in a file nobody here has reason
     to open. Every one of them is for a failure that renders perfectly: a belligerent named off the map
     shades nothing, a name on both sides asks one shape for two colours, and a war with no derivable
     years is simply absent from the personal atlas. */
  { const ew = checkWar(card, loadCardYears(appSrc)); if (ew) { console.error(/^ERROR/.test(ew) ? ew : "ERROR: " + ew); process.exit(1); } }
}

cards.push(card);
deck.cardIds.push(card.id);
for (const col of tree.collections) col.total = Math.max(col.total || 0, countIds(col));   // keep total >= card count

const out =
  "/* Card data. Add cards one at a time with `node .claude/add-card.js <card.json> [deckId]` (see CLAUDE.md). */\n" +
  "window.CARD_DATA = [\n" + cards.map(c => JSON.stringify(c)).join(",\n") + "\n];\n\n" +
  "/* Collection -> deck -> sub-deck tree. Leaf decks carry a `cardIds` array. */\n" +
  "window.COLLECTION_TREE = " + JSON.stringify(tree, null, 2) + ";\n";
fs.writeFileSync(dataPath, out);
/* data.js is the LIGHT half of the corpus. This helper splices its change straight into that
   file, so a heavy field (abstract / sources / why / quote / image) lands there fat and has to
   be moved back out — otherwise data.js re-fattens one card at a time and the eager load path
   grows back in silence. See .claude/card-io.js. */
require("./card-io").resplit();
loadWindow(dataPath);   // re-parse to confirm the written file is valid JS
console.log("added card " + card.id + " -> deck " + deck.id + " | total cards: " + cards.length);

/* A NEW CARD LOOKS FOR ITS PICTURE HERE, not in a later sweep.  The picture pass that put an
   illustration on several hundred cards was a batch over the whole corpus, and a batch is a thing
   that goes out of date the next morning — so a card written today asks for a picture today, the
   way it ships with its own citations and its own glossary entry.  It SUGGESTS and never installs:
   the candidate list is a name match, and a name match is confidently wrong in a way nothing
   downstream can catch, so a person picks.  Best-effort — it needs the network and this has
   already written the card, so a failure prints a line and changes no exit status. */
// …except a MAP card, whose illustration is its map. A second picture there would sit under the globe
// answering the same question, and the suggestion is a network round trip nobody is going to act on.
// A FLAG card is the same case: its illustration is the flag on its front.
if (!isMap && !isArt && !isFlag && !(card.image && card.image.src) && !(card.video && card.video.src) && !process.argv.includes("--no-image")) {
  require("./suggest-image.js").report("cards", card.id, card.answerText || card.answer || card.id)
    .catch((e) => console.log("  (no picture looked for: " + e.message + ")"));
}
