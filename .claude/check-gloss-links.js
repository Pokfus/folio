#!/usr/bin/env node
/*
  Folio — glossary auto-links that point at the WRONG SENSE of a word.

    node .claude/check-gloss-links.js [--all] [--card=<id>]

  Exit 1 on a finding, so it guards a batch the way check-questions.js and check-style.js do.

  WHY THIS EXISTS. A card's background auto-links the first occurrence of every glossary surface it
  contains (autoLinkGlossary), and a surface is matched by TEXT alone. Nothing anywhere asks whether the
  term it resolves to is about the same thing the sentence is about — so `wh-100` Paleo-Indians said
  "archaeologists speak instead of the Archaic period" and opened the gloss for the archaic period of
  GREECE, which is a different continent and four thousand years away. It was reported by a reader, and
  no check on the site could have seen it: the link is well-formed, the term exists, the prose is right,
  and the popup is the popup of a real term.

  THE MEASURE, and it is a PROXY rather than a verdict — read the card before rewriting it, exactly as
  with card-focus.js. Every card and every glossary term carries TAGS in one shared vocabulary
  (CLAUDE.md, "CARDS CARRY CATEGORISING TAGS"), whose third rank is the specifics: a country, a region, a
  period. A tag is treated as a PLACE tag when the glossary itself holds a term of that name whose own
  kind is a place kind — so the list of places is DERIVED from the data rather than written down here,
  and a country added to the glossary tomorrow joins it with nobody remembering this file. A link is
  reported when the term's place tags and the card's place tags are both non-empty and share nothing:
  the sentence is about one part of the world and the term it links to is about another.

  It also reports, as a separate and harder finding, two glossary KEYS that would compete for the same
  auto-link surface. `buildGlossIndex` resolves that by first-wins, which means by position in
  glossary.js — a silent tie-break that no reader or editor can see. Since Aug 2026 a key with a
  disambiguating parenthetical does not claim its bare name at all (see buildGlossIndex), so a collision
  here means two keys that genuinely humanise to the same words.

  The surface rules are SLICED OUT OF app.js by text — glossKeyTitle, isProperCS, pluralForms and the
  three registration passes are mirrored below — so what this matches cannot drift from what the site
  links. It deliberately does NOT slice buildGlossIndex whole: that function reaches into per-deck
  glossary scopes and the community stores, none of which exist here.

  Not part of the site.
*/
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const src = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");

function slice(startRe, endMark, what) {
  const m = startRe.exec(src);
  if (!m) throw new Error("could not find " + what + " in app.js");
  const end = src.indexOf(endMark, m.index);
  if (end < 0) throw new Error("could not find the end of " + what + " in app.js");
  return src.slice(m.index, end + endMark.length);
}
const { glossKeyTitle, isProperCS, pluralForms } = new Function(
  [
    slice(/^  function glossKeyTitle\(/m, "\n", "glossKeyTitle"),
    slice(/^  function isProperCS\(/m, "\n", "isProperCS"),
    slice(/^  function pluralForms\(/m, "\n  }", "pluralForms"),
    "  return { glossKeyTitle, isProperCS, pluralForms };",
  ].join("\n")
)();

global.window = {};
require(path.join(ROOT, "data.js"));
require(path.join(ROOT, "glossary.js"));
const CARDS = window.CARD_DATA || [];
const G = window.GLOSSARY || {};
const A = window.GLOSSARY_ALIASES || {};
const CS = window.GLOSSARY_CASESENSITIVE || {};
const TAGS = window.GLOSSARY_TAGS || {};

const args = process.argv.slice(2);
const showAll = args.includes("--all");
const onlyCard = (args.find((a) => a.startsWith("--card=")) || "").slice(7);

/* ---- which tags name a place, derived from the glossary itself -------------------------------------
   A tag is a place tag when the glossary holds a term of that name whose FIRST tag — the kind, by the
   vocabulary's own rule — is one of the place kinds. That is why `greece`, `north america` and `italy`
   are places here and `archaeology`, `era` and `person` are not, without any of the four being listed. */
const PLACE_KINDS = new Set(["place", "city", "state", "region", "island", "country", "continent", "river", "mountain", "lake", "landform"]);
const kindOfName = Object.create(null);
Object.keys(G).forEach((k) => {
  const name = glossKeyTitle(k).toLowerCase();
  const kind = (TAGS[k] || [])[0];
  if (kind && !(name in kindOfName)) kindOfName[name] = kind;
});
const isPlaceTag = (t) => PLACE_KINDS.has(kindOfName[t]);
const AMBIGUOUS_KINDS = new Set(["era", "period", "culture", "industry", "event", "practice", "dynasty", "people", "institution", "title"]);
const placeTags = (list) => (list || []).map((t) => String(t).toLowerCase()).filter(isPlaceTag);

/* ---- the auto-link index, mirroring buildGlossIndex's three passes ---------------------------------- */
const byName = Object.create(null), byNameCS = Object.create(null), names = [];
const collisions = [];
const add = (surface, k) => {
  const s = String(surface || "").trim();
  if (s.length < 3) return;
  if (CS[k] || isProperCS(s)) { if (!byNameCS[s]) { byNameCS[s] = k; names.push(s); } }
  else { const low = s.toLowerCase(); if (!byName[low]) { byName[low] = k; names.push(s); } }
};
const bareTaken = (k) => /_\([^)]*\)$/.test(String(k || ""));
const keys = Object.keys(G);
// pass 1 — the primary names, and the one place a genuine key-vs-key collision can happen
const claimed = Object.create(null);
keys.forEach((k) => {
  if (bareTaken(k)) return;
  const t = glossKeyTitle(k);
  const low = t.toLowerCase();
  if (claimed[low] && claimed[low] !== k) collisions.push([t, claimed[low], k]);
  else claimed[low] = k;
  add(t, k);
});
keys.forEach((k) => (A[k] || []).forEach((al) => add(al, k)));            // pass 2 — aliases
keys.forEach((k) => {                                                     // pass 3 — plurals
  if (CS[k]) return;
  if (!bareTaken(k)) { const t = glossKeyTitle(k); if (!isProperCS(t)) pluralForms(t).forEach((p) => add(p, k)); }
  (A[k] || []).forEach((al) => { if (!isProperCS(al)) pluralForms(al).forEach((p) => add(p, k)); });
});
names.sort((a, b) => b.length - a.length);
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const RE = names.length
  ? new RegExp("(?<![\\p{L}\\p{N}_])(" + names.map(escRe).join("|") + ")(?![\\p{L}\\p{N}_])", "giu")
  : null;
const resolve = (surface) => byNameCS[surface] || byName[String(surface).toLowerCase()] || null;

/* ---- walk the cards -------------------------------------------------------------------------------- */
// the abstract as the linker sees it: hand-written .ttip spans are left alone by autoLinkGlossary, so
// their text is cut out here rather than matched — an editor who wrote the link chose the term
const plainForLinking = (html) =>
  String(html || "")
    .replace(/<span class="ttip"[^>]*>[\s\S]*?<\/span>/g, " ")
    .replace(/<sup class="fn"[^>]*><\/sup>/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ");

const findings = [];
let scanned = 0, linksSeen = 0;
for (const c of CARDS) {
  if (onlyCard && c.id !== onlyCard) continue;
  if (!c.abstract) continue;
  scanned++;
  const cardPlaces = new Set(placeTags(c.tags));
  const answer = String(c.answerText || "").trim().toLowerCase();
  const text = plainForLinking(c.abstract);
  const linked = new Set();
  if (RE) {
    RE.lastIndex = 0;
    let m;
    while ((m = RE.exec(text))) {
      const surface = m[0], key = resolve(surface);
      if (!key || linked.has(key)) continue;
      if (surface.toLowerCase() === answer) continue;
      linked.add(key);
      linksSeen++;
      if (!cardPlaces.size) continue;
      /* Only the HOMOGRAPH-PRONE kinds. A place, a person, an animal or a fossil named in a background is
         almost always the very thing the term is about — a card on Olduvai Gorge says "Africa" and means
         Africa — and reporting those buried the real findings a hundred to one. What CAN mean two things
         in two parts of the world is a period, a culture, an industry or an event: those are named after
         a stage rather than after a thing, so the same words are reused wherever the same stage occurs,
         which is the whole of what went wrong with "the Archaic period". */
      if (!AMBIGUOUS_KINDS.has((TAGS[key] || [])[0])) continue;
      const termPlaces = placeTags(TAGS[key]);
      if (!termPlaces.length) continue;
      if (termPlaces.some((t) => cardPlaces.has(t))) continue;
      findings.push({
        card: c.id, answer: c.answerText, surface, key,
        cardPlaces: [...cardPlaces], termPlaces,
      });
    }
  }
}

console.log("Glossary auto-links whose term is about somewhere else");
console.log("  " + scanned + " backgrounds scanned, " + linksSeen + " auto-links resolved");
console.log("  " + Object.keys(G).length + " terms, " + names.length + " surfaces, " +
  Object.keys(kindOfName).filter(isPlaceTag).length + " tags read as places");
console.log("");

if (collisions.length) {
  console.log("TWO KEYS COMPETING FOR ONE SURFACE — first in glossary.js wins, and nothing says which");
  collisions.forEach(([t, a, b]) => console.log("  " + JSON.stringify(t) + "   " + a + "   vs   " + b));
  console.log("");
}

if (!findings.length) console.log("no cross-region auto-links");
else {
  console.log(findings.length + " link(s) to check by eye:");
  const show = showAll ? findings : findings.slice(0, 40);
  show.forEach((f) => {
    console.log("  " + f.card + "  " + JSON.stringify(f.answer));
    console.log("      links " + JSON.stringify(f.surface) + " -> " + f.key);
    console.log("      card: " + f.cardPlaces.join(", ") + "   term: " + f.termPlaces.join(", "));
  });
  if (!showAll && findings.length > show.length) console.log("  … " + (findings.length - show.length) + " more (--all)");
  console.log("");
  console.log("A finding is a PROXY. Where it is real, the fixes are, in order of preference:");
  console.log("  · write the link by hand — <span class=\"ttip\" data-k=\"The_Right_Key\">…</span> — which");
  console.log("    autoLinkGlossary leaves alone and processAbstract keeps;");
  console.log("  · give the right term a narrower ALIAS the wrong one cannot match;");
  console.log("  · reword the sentence, where the phrase really is doing two jobs.");
}
/* THE COLLISION LIST FAILS AND THE CROSS-REGION LIST DOES NOT, which is the same split check-style.js
   makes for its day titles: a collision is EXACT — two keys really do compete, and the winner really is
   decided by position in a file — where a cross-region link is a judgement about whether a phrase means
   the same thing in two places, and most of them are correct (a Greek card naming Egypt should link
   Egypt). Failing the build on a list that is mostly right teaches the next person to ignore it.
   `--strict` fails on both, for a session that has just worked the list to zero. */
const strict = args.includes("--strict");
process.exit(collisions.length || (strict && findings.length) ? 1 : 0);
