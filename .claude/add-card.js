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
//              Any card may also carry an `answerFlag` — the flag of the place it is about, drawn inside
//              coloured answer box beside the term. Three fields, and `credit` AND `alt` are both required:
//                "answerFlag": { "src": "https://…", "credit": "…, public domain, via Wikimedia Commons (…)",
//                          "alt": "The flag of Texas: a blue band at the hoist bearing a white star, …" }
const fs = require("fs"), path = require("path");
const { isDateList } = require("./date-line.js");
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
   aside is still counted (and asides are banned in an abstract anyway). */
const IMPERIAL_PAREN = /\s*\((?=[^)]*\d)[^)]*\b(?:miles?|foot|feet|ft|inch(?:es)?|in|yards?|pounds?|lbs?|ounces?|oz|tons?|acres?|sq\s?mi|°F)\b[^)]*\)/gi;
const unconverted = (s) => String(s || "").replace(IMPERIAL_PAREN, "");
const qWords = (s) => plain(unconverted(s)).split(" ").filter(Boolean).length;

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
};
const MAPQ_MIN = 5, MAPQ_MAX = 20;
const MAP_FACTS_MIN = 3, MAP_FACTS_MAX = 8;

const cardFile = process.argv[2], deckId = process.argv[3];
if (!cardFile) { console.error("usage: node .claude/add-card.js <card.json> [deckId]"); process.exit(1); }
const card = JSON.parse(fs.readFileSync(cardFile, "utf8"));
for (const f of FIELDS) if (!(f in card)) { console.error("ERROR: card is missing field:", f); process.exit(1); }
if (!card.id) { console.error("ERROR: card.id is empty"); process.exit(1); }

const isMap = !!card.map;
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
} else if (Array.isArray(card.facts) && card.facts.length) {
  // not refused — the box is general — but worth saying, since it is a map card's furniture
  console.warn("WARNING: card." + card.id + " has a `facts` box but no `map`. That is allowed; just check it was meant.");
}

const QMIN = isMap ? MAPQ_MIN : Q_MIN, QMAX = isMap ? MAPQ_MAX : Q_MAX;
if (!isMap && (!Array.isArray(card.questions) || card.questions.length !== N_EXTRA || card.questions.some(q => typeof q !== "string" || !q.trim()))) {
  console.error("ERROR: card needs a `questions` array of exactly " + N_EXTRA + " EXTRA phrasings (3 questions in all — see CLAUDE.md). Each is a full standalone clue with its own mid-sentence blank.");
  process.exit(1);
}
for (const [qi, q] of [card.question, ...card.questions].entries()) {
  const qn = qWords(q);
  if (qn < QMIN || qn > QMAX) {
    console.error("ERROR: question " + (qi + 1) + " is " + qn + " words — it must be " + QMIN + "–" + QMAX +
      (isMap ? " (a map card's prompt is short: the map is the clue)." : " (aim for ~28; see CLAUDE.md). Keep one identifying clue and move the rest into the abstract."));
    process.exit(1);
  }
  if (!/class="blank"/.test(q)) {
    console.error("ERROR: question " + (qi + 1) + " has no <span class=\"blank\">_____</span> — every phrasing blanks the answer mid-sentence.");
    process.exit(1);
  }
}
/* THE ANSWER TERM CARRIES NO ARTICLE (Aug 2026, on request). "the polis" is a phrase in a sentence;
   what the reader is being asked to recall is `polis`. The article belongs to the question and to the
   background, where the grammar needs it, and never to the term itself — which is also what keeps the
   answer matching its glossary key, its `answerText` and the way a reader would say it aloud. */
for (const f of ["answer", "answerText"]) {
  if (/^(the|a|an)\s/i.test(card[f] || "")) {
    console.error("ERROR: card." + f + " begins with an article: " + JSON.stringify(card[f]) + "\n" +
      "       Drop it — the answer term is the bare term. Put the article in front of the blank in each\n" +
      "       question instead (\"... in the <span class=\\\"blank\\\">_____</span>, which ...\") and outside the\n" +
      "       <b> in the background (\"The <b>polis</b> is ...\", not \"<b>The polis</b> is ...\").");
    process.exit(1);
  }
}
if (/^<b>(the|a|an)\s/i.test(card.abstract || "")) {
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

cards.push(card);
deck.cardIds.push(card.id);
for (const col of tree.collections) col.total = Math.max(col.total || 0, countIds(col));   // keep total >= card count

const out =
  "/* Card data. Add cards one at a time with `node .claude/add-card.js <card.json> [deckId]` (see CLAUDE.md). */\n" +
  "window.CARD_DATA = [\n" + cards.map(c => JSON.stringify(c)).join(",\n") + "\n];\n\n" +
  "/* Collection -> deck -> sub-deck tree. Leaf decks carry a `cardIds` array. */\n" +
  "window.COLLECTION_TREE = " + JSON.stringify(tree, null, 2) + ";\n";
fs.writeFileSync(dataPath, out);
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
if (!isMap && !(card.image && card.image.src) && !(card.video && card.video.src) && !process.argv.includes("--no-image")) {
  require("./suggest-image.js").report("cards", card.id, card.answerText || card.answer || card.id)
    .catch((e) => console.log("  (no picture looked for: " + e.message + ")"));
}
