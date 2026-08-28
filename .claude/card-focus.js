#!/usr/bin/env node
/*
  THE FOCUS MEASURE — is a card about its answer term's HISTORY, or about the modern study of it?

    node .claude/card-focus.js [--prefix=gr-] [--all] [--card=gr-176]

  Folio is a history site. A card is about the PAST it names — not about the people who dug it up
  (archaeology) and not about the people who argue over it (historiography). Either may be touched on;
  neither may be the primary focus. The one exception is a card whose ANSWER TERM is itself a modern
  theory, debate, method or scholar, which is what EXEMPT records.

  Two rules are measured, and they fail differently:

  1. THE QUESTION MAY NOT NAME A RESEARCHER. Absolute. A clue opening "Hans van Wees calls…" is
     answerable by someone who knows the modern literature and nothing whatever about Greece, which is
     the exact inversion of what a study card is for. Naming a THEORY is fine; naming its author is not.

  2. THE ABSTRACT MAY NOT BE MOSTLY HISTORIOGRAPHY, counted over its ten sentences.

  HOW A RESEARCHER IS DETECTED, and why it is done this way. The first cut of this script swept every
  capitalised word out of the citations and flagged 187 of 269 cards — place names, period names and
  ancient authors all leak out of a citation's TITLE, so "Morocco", "Oldowan" and "Homer" were being
  read as scholars. It now parses the citation STRUCTURALLY and takes names only from author positions:
  the reviewer before ", review of", and the authors after ", by " or ", ed. ". Titles are stripped
  first, so an ancient author named in a title never reaches the list — which is correct, since naming
  Homer or Strabo in a question is naming a SOURCE for the past, not a modern scholar.

  A second, weaker pass catches attribution with the name filed off ("his reviewer", "modern
  scholarship", "scholars divide"), which is historiography wearing a disguise.

  The measure is a PROXY, not a verdict. Read the card before rewriting it.
*/
const fs = require("fs"), path = require("path");
const dataPath = path.join(__dirname, "..", "data.js");

// Cards whose ANSWER TERM is itself a modern theory, debate, method or scholar. Historiography is the
// subject there, so neither rule applies. Keep this list SHORT and justify every entry.
const EXEMPT = {
  "gr-007": "Arthur Evans — a biography of an excavator",
  "gr-075": "the decipherment of Linear B — a modern act",
  "gr-184": "the hoplite reform — a modern theory about the past, argued over since the 19th century",
  // Was keyed "wh-006" — the three-age system's id BEFORE the 2026-08-04 renumbering, which moved it to
  // wh-002 and gave wh-006 to Sahelanthropus. So this list exempted the wrong card in both directions
  // until 2026-08-07. Unlike `.claude/sources-register.md`, which is a LOG of past work and is
  // deliberately left in the old numbering, this is a LIVE measure: a stale id here silently exempts
  // whatever card inherited the number. `wh-064` and `wh-106` below were checked at the same time and
  // are correct under the new numbering.
  "wh-002": "the three-age system — a 19th-century idea",
  "wh-064": "Toba catastrophe theory — a named modern theory",
  "wh-106": "Blytt–Sernander scheme — a 19th-century scheme",
};

/* TWO COLLECTIONS ARE EXCLUDED FROM RULE 1 OUTRIGHT (Aug 2026, on request), and this is a COLLECTION-WIDE
   exclusion rather than a list of cards. In psychology and philosophy the literature IS the subject
   matter: a finding is a study, an argument carries its author's name, and both disciplines are mostly
   "modern" by this script's own measure — so holding their questions to rule 1 would make most of those
   two collections unwriteable. `EXEMPT` above is the wrong instrument for it: CLAUDE.md says explicitly
   NOT to clear these one card at a time, because the exclusion is a fact about the collection and a
   per-card list would have to be extended on every card that names anybody.

   RULE 2 STILL BINDS ON THEM. The cap on historiography is about a card being ABOUT the modern argument
   rather than about its subject, which is as much a fault in a philosophy card as anywhere else.

   They are reported under their own heading rather than silently dropped: a psychology question naming a
   researcher is still worth SEEING, since the choice should be deliberate, and the count belongs
   somewhere a reader of this output can find it. It is simply not a finding to be fixed. */
const RULE1_EXCLUDED = {
  "ps-": "Psychology — the literature is the subject matter",
  "ph-": "Philosophy — the thinkers are the subject matter",
};
const rule1Excluded = (id) => { const k = Object.keys(RULE1_EXCLUDED).find((p) => id.startsWith(p)); return k ? RULE1_EXCLUDED[k] : null; };

/* MEASURED, not chosen: over the 269 shipped cards the historiography count is 0 or 1 for 206 of them,
   2 for 37 and 3 for 12, then breaks to a tail of twelve cards at 4 and above. So 3 is where the corpus
   itself puts "briefly touched on" and 4 is where a card starts to be ABOUT the modern argument. */
const HISTORIO_MAX = 3;
const PARTICLES = new Set(["van", "von", "de", "der", "den", "du", "la", "le", "di", "da", "el"]);
/* Tokens that reach an author position but name a PLACE, SITE or SERIES rather than a person. Each was
   found by reading a flagged question and finding no scholar in it. */
const NOT_A_SURNAME = new Set(["Bryn", "Mawr", "Classical", "Review", "Press", "University", "Jr", "Sr",
  "The", "And", "France", "Fels", "Hohle", "Agora", "Athenian", "Anzick", "Sands", "Grotte", "Sahul", "Dartmouth", "Hanover", "Tufts",
  // A CORPORATE AUTHOR ends on a place, and the place is what the last-token rule takes for a surname:
  // "Archaeological Survey of India" left every question naming India reading as one naming a scholar.
  "Archaeological", "Survey", "India"]);

/* ANCIENT AUTHORS ARE NOT SCHOLARS, and the distinction is the whole point of the rule. Herodotus and
   Pausanias are cited here as SOURCES FOR THE PAST — a question that names one is teaching history, and
   is exactly what a Folio card should do. It is the modern arguer, not the ancient witness, that must
   stay out of the question. They reach the name list legitimately, being the authors of works this
   corpus cites directly, so they are excluded here rather than by accident. */
const ANCIENT = new Set(`Homer Hesiod Herodotus Thucydides Xenophon Plato Aristotle Plutarch Pausanias Strabo
Diodorus Polybius Arrian Apollodorus Aeschylus Sophocles Euripides Aristophanes Pindar Sappho Solon Theognis
Tyrtaeus Archilochus Hippocrates Theophrastus Demosthenes Isocrates Lysias Aeschines Livy Ovid Lucretius
Suetonius Caesar Seneca Cicero Tacitus Virgil Horace Vitruvius Pliny Josephus Athenaeus Vyasa Confucius
Mencius Laozi Zhuangzi Sima Ptolemy Euclid Archimedes Galen Aelian Hyginus Ovidius Quintilian`.split(/\s+/));

function loadWindow(file) { const win = {}; new Function("window", fs.readFileSync(file, "utf8"))(win); return win; }
const plain = (s) => String(s || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

/* Pull the AUTHOR POSITIONS out of one Chicago-note citation. Everything else — the title, the series,
   the journal, the URL, the access label — is thrown away before any name is read. */
function authorSegments(src) {
  let s = String(src || "")
    .replace(/<i>[\s\S]*?<\/i>/g, " §TITLE§ ")     // the work's title: never a scholar
    .replace(/[“"][^“”"]*[”"]/g, " §TITLE§ ")     // an article title in quotes — BOTH curly and straight,
                                                   // the corpus uses each, and missing the straight form
                                                   // let "…Middle Minoan Crete," leak "Crete" as a surname
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\[[^\]]*\]/g, " ");
  const segs = [];
  const rev = s.match(/^(.*?),\s*review of/i);           // reviewer, at the head
  if (rev) segs.push(rev[1]);
  for (const m of s.matchAll(/,\s*(?:by|ed\.|edited by)\s+([^,§]*(?:,\s*[A-Z][^,§]*)?)/gi)) segs.push(m[1]);
  if (!segs.length) {                                    // not a review: authors run to the first title
    const head = s.split("§TITLE§")[0];
    if (head && head.length < 200) segs.push(head);
  }
  return segs;
}

/* Surnames worth matching in prose. A surname is the LAST capitalised token of a personal name, with
   Dutch/German/French particles folded in ("van Wees" -> "Wees", matched as a word either way). */
function scholarsOf(card) {
  const out = new Set();
  for (const src of card.sources || []) {
    for (const seg of authorSegments(src)) {
      for (const person of seg.split(/\s+(?:and|&)\s+|,\s*(?![A-Z]\.)/)) {
        const toks = (person.match(/\b[A-ZÀ-Þ][a-zà-ÿ'’-]{2,}\b|\b(?:van|von|de|der|den|du|la|le|di|da|el)\b/g) || [])
          .filter((t) => !NOT_A_SURNAME.has(t));
        if (!toks.length) continue;
        const last = toks[toks.length - 1];
        if (last && !PARTICLES.has(last) && !ANCIENT.has(last) && last.length >= 3) out.add(last);
      }
    }
  }
  return out;
}

// Attribution with the name filed off — still historiography.
const ANON_ATTRIB = /\b(?:his|her|its|the) reviewer\b|\bone (?:contribution|scholarly account|essay|study|argument)\b|\bmodern (?:scholarship|accounts?|reading|pictures?|interpretations?)\b|\bscholars? (?:divide|disagree|now|have|hold|set|put|question)\b|\bhas (?:been|largely) (?:called|attacked|questioned|challenged|dismantled|doubted|taken apart)\b|\bis (?:now )?(?:doubted|unsettled|contested|not universally accepted)\b|\blater work\b|\bthe standard (?:work|collection)\b/i;

const sentences = (t) => plain(t).split(/(?<=\.)\s+/).filter(Boolean);

function measure(card) {
  const names = [...scholarsOf(card)];
  const rx = names.length ? new RegExp("\\b(" + names.join("|") + ")\\b") : null;
  const named = (s) => (rx ? (s.match(rx) || [])[1] : null);

  const qs = [card.question, ...(card.questions || [])];
  const qNamed = qs.map((q, i) => { const hit = named(plain(q)); return hit ? { i: i + 1, name: hit } : null; }).filter(Boolean);

  const sents = sentences(card.abstract);
  const historio = sents.filter((s) => named(s) || ANON_ATTRIB.test(s));
  const modern = sents.filter((s) => /\b(1[89]\d{2}|20[0-2]\d)\b/.test(s));

  return { id: card.id, answer: card.answerText, n: sents.length, historio: historio.length,
           modern: modern.length, qNamed, names, exempt: EXEMPT[card.id] || null,
           q1off: rule1Excluded(card.id) };
}

const win = loadWindow(dataPath);
const argv = process.argv.slice(2);
const prefix = (argv.find((a) => a.startsWith("--prefix=")) || "").split("=")[1] || "";
const one = (argv.find((a) => a.startsWith("--card=")) || "").split("=")[1];

const rows = win.CARD_DATA.filter((c) => c.id.startsWith(prefix) && (!one || c.id === one)).map(measure);

if (one) { console.log(JSON.stringify(rows[0], null, 1)); process.exit(0); }

const qFails = rows.filter((r) => r.qNamed.length && !r.exempt && !r.q1off);
const qOff = rows.filter((r) => r.qNamed.length && !r.exempt && r.q1off);
const aFails = rows.filter((r) => r.historio > HISTORIO_MAX && !r.exempt);
const both = rows.filter((r) => r.qNamed.length && !r.q1off && r.historio > HISTORIO_MAX && !r.exempt);
const needsWork = rows.filter((r) => ((r.qNamed.length && !r.q1off) || r.historio > HISTORIO_MAX) && !r.exempt);

console.log(`cards measured: ${rows.length}${prefix ? " (prefix " + prefix + ")" : ""}\n`);
console.log(`RULE 1 — question names a researcher: ${qFails.length} card(s)`);
for (const r of qFails.sort((a, b) => b.qNamed.length - a.qNamed.length || a.id.localeCompare(b.id))) {
  console.log(`  ${r.id}  ${String(r.answer).slice(0, 24).padEnd(25)} ${r.qNamed.map((q) => "Q" + q.i + " " + q.name).join(", ")}`);
}
if (qOff.length) {
  console.log(`\nnaming a researcher where rule 1 does NOT apply: ${qOff.length} card(s)`);
  for (const r of qOff.sort((a, b) => a.id.localeCompare(b.id))) {
    console.log(`  ${r.id}  ${String(r.answer).slice(0, 24).padEnd(25)} ${r.qNamed.map((q) => "Q" + q.i + " " + q.name).join(", ")}   [${r.q1off}]`);
  }
}
console.log(`\nRULE 2 — historiography over ${HISTORIO_MAX}/10 sentences: ${aFails.length} card(s)`);
for (const r of aFails.sort((a, b) => b.historio - a.historio || a.id.localeCompare(b.id))) {
  console.log(`  ${r.id}  ${String(r.answer).slice(0, 24).padEnd(25)} ${String(r.historio).padStart(2)}/${r.n} historiographical, ${r.modern}/${r.n} carry a modern year`);
}
console.log(`\nfailing both: ${both.length}${both.length ? "  " + both.map((r) => r.id).join(", ") : ""}`);
console.log(`cards needing revision in total: ${needsWork.length}`);
console.log(`exempt: ${Object.keys(EXEMPT).filter((k) => rows.some((r) => r.id === k)).join(", ") || "none in range"}`);

if (argv.includes("--all")) {
  console.log("\n-- every card, worst first --");
  for (const r of rows.slice().sort((a, b) => b.historio - a.historio || b.qNamed.length - a.qNamed.length)) {
    console.log(`  ${r.id}  ${String(r.historio).padStart(2)}/${r.n}  q:${r.qNamed.length}  ${r.exempt ? "[exempt] " : ""}${r.answer}`);
  }
}
