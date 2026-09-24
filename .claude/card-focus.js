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
const splitAbstract = require("./split-abstract.js");

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
  "cnh-061": "Doubting Antiquity School — a named modern school of historical criticism",
  "cnh-065": "Xia–Shang–Zhou Chronology Project — a named modern research programme",
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

/* WHAT IS LEFT OVER IS NAMED, NOT PATTERNED — the residue of rule 1 once the extraction is sound.
   Every row is a card whose question names somebody the card's own citations put in an author
   position, and who is not a modern arguer: eight are ACTORS OF THE CARD'S OWN PERIOD cited for their
   own words, which is the line CLAUDE.md draws — "the modern arguer, not the ancient witness" — one
   era or several forward from the ancient list. Bernard of Clairvaux, Abbot Suger and Gregory IX are
   witnesses to the twelfth and thirteenth centuries in exactly the way Herodotus is to the fifth BC,
   and Hitler's own operational directive is a document rather than a reading of one.

   A ROW IS KEYED BY CARD **AND** NAME, which is `check-cards.js`'s CROSSREF_WRONG rule and the whole
   reason this can be a table rather than a list of surnames. "Gregory", "Edward", "Sun" and "Ding" are
   living surnames; a bare-surname exemption would quietly excuse a real scholar on some other card,
   where a keyed row cannot reach past the card it was written about. Add one only after reading the
   card and the citation the name comes from. */
const NOT_A_RESEARCHER = {
  "wh-249 Ding": "King Wu Ding of Shang, whom the question names as Fu Hao's husband — a collision with the geoarchaeologists Ke Ding and Aijun Ding, cited on the same card for a typhoon model",
  "wh-508 Clairvaux": "Bernard of Clairvaux, cited for his own In Praise of the New Knighthood",
  "wh-510 Suger": "Abbot Suger, cited for his own account of what was done in his administration at Saint-Denis",
  "wh-511 Gregory": "Gregory IX, cited for his own statutes for the University of Paris of 1231",
  "wh-518 Edward": "Edward III, cited for his own letter on the campaign of 1339",
  "wh-518 Poitiers": "the battle, reached through the Black Prince's own letter to London announcing it",
  "ww2-036 Mussolini": "Mussolini, cited for his own Doctrine of Fascism",
  "ww2-039 Mussolini": "the same, on the law that gave that doctrine its legal form",
  "ww2-042 Hoare": "Sir Samuel Hoare, cited for his own resignation statement to the Commons of 19 December 1935 — the minister who made the plan the question names, not a modern arguer",
  "ww2-141 Hitler": "Hitler, cited for his own Directive No. 1 for the Conduct of the War",
  "ww2-148 Chamberlain": "Chamberlain, cited for his own broadcast of 3 September 1939",
  "ww2-149 Hitler": "the same directive, on the card for the lull that followed it",
  // A MEDIEVAL TRAVELLER IS A WITNESS, NOT AN ARGUER — the ancient-author rule one era forward. Each of
  // these is cited on its own card for what he himself saw and wrote, in a translation whose translator
  // stands in the author slot, so the surname the question carries is the traveller's and not a scholar's.
  "wh-593 Polo": "Marco Polo, cited for his own account of the election of Chinghis Kaan",
  "wh-597 Polo": "the same, cited for his own account of the fall of Baghdad and the death of the caliph",
  "wh-598 Battuta": "Ibn Battuta, cited for his own account of crossing the Kipchak steppe in the 1330s",
  // A CONQUISTADOR IS AN ACTOR OF HIS OWN CARD'S PERIOD, cited for what he himself did and wrote. The
  // letters to Charles V stand in the author slot of the card's own first source, so every sentence of
  // the siege narrative that attributes a figure to him read as historiography.
  "wh-666 Cortés": "Hernán Cortés, cited on his own card for his third letter's account of the siege he laid",
  // AN EARLY MODERN WITNESS IS THE SAME CASE AGAIN. Each is cited on his own card for what he himself
  // wrote about the events of his own lifetime, so the surname the question carries belongs to an actor
  // or an eyewitness rather than to a modern arguer.
  "wh-675 Grotius": "Hugo Grotius, cited on his own card for the tract he wrote in 1609 against the Portuguese claim of his own day",
  "wh-679 Percy": "George Percy, cited on his own card for the observations he kept at Jamestown through the summer of 1607",
  "wh-680 Bradford": "William Bradford, governor of the colony, cited on his own card for the history of it he wrote himself",
  // AN ENLIGHTENED MONARCH IS AN ACTOR OF HIS OWN CARD'S PERIOD, cited for what he himself wrote about
  // how a king should rule. The essays and instructions stand in the author slot of the card's own
  // sources, so the surname the question carries is the ruler's and not a modern arguer's.
  "wh-752 Frederick": "Frederick II of Prussia, cited on his own card for his Essay on Forms of Government",
  "wh-752 Catherine": "Catherine II of Russia, cited on the same card for her own Grand Instructions of 1767",
};

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
  "Archaeological", "Survey", "India",
  // …AND IT NEED NOT END ON A PLACE. "U.S. Congress" is the author of a statute, so every question in the
  // United States collection that says what Congress did read as one naming a scholar. Congress is not a
  // person and never a surname, so the token is safe to drop outright; the rule it guards is about the
  // MODERN ARGUER, and a legislature is neither an arguer nor modern in the sense the rule means.
  "Congress",
  // Same shape, one tribunal over: "International Military Tribunal for the Far East" ends on a
  // COMPASS POINT, and every card citing the Tokyo judgment then read "East Asia" as a scholar.
  "International", "Military", "Tribunal", "Far", "East"]);

/* ANCIENT AUTHORS ARE NOT SCHOLARS, and the distinction is the whole point of the rule. Herodotus and
   Pausanias are cited here as SOURCES FOR THE PAST — a question that names one is teaching history, and
   is exactly what a Folio card should do. It is the modern arguer, not the ancient witness, that must
   stay out of the question. They reach the name list legitimately, being the authors of works this
   corpus cites directly, so they are excluded here rather than by accident. */
const ANCIENT = new Set(`Homer Hesiod Herodotus Thucydides Xenophon Plato Aristotle Plutarch Pausanias Strabo
Diodorus Polybius Arrian Apollodorus Aeschylus Sophocles Euripides Aristophanes Pindar Sappho Solon Theognis
Tyrtaeus Archilochus Hippocrates Theophrastus Demosthenes Isocrates Lysias Aeschines Livy Ovid Lucretius
Suetonius Caesar Seneca Cicero Tacitus Sallust Virgil Horace Vitruvius Pliny Josephus Athenaeus Vyasa Confucius
Mencius Laozi Zhuangzi Sima Ptolemy Euclid Archimedes Galen Aelian Hyginus Ovidius Quintilian
Gellius Aulus Dionysius Halicarnassus Varro Festus Censorinus Memnon Photius Ampelius
Nepos Justin Trogus Florus Sallust Aeneas Tacticus Polyaenus Frontinus Onasander Asclepiodotus Diogenes Laertius
Appian Velleius Paterculus Augustus Hirtius Gaius Justinian Ulpian Cassius Dio Lactantius Eusebius Socrates Athanasius Tertullian Zosimus Jordanes Procopius Jerome Augustine`.split(/\s+/));

/* …AND THE ANCIENT AUTHOR'S OWN NAME IS `check-cards.js`'s, SLICED OUT BY TEXT RATHER THAN COPIED
   (Sep 2026). The set above is of SURNAMES, because the mechanism below keys on a name's LAST token —
   which is right for Herodotus and silently wrong for every ancient author whose name is two words.
   "Sima Qian" yielded *Qian*, so eight China cards whose questions say "Sima Qian gives the battle two
   lines" were reported as questions naming a modern researcher; "Sun Tzŭ" yielded *Sun* one card
   further on. Adding the bare second tokens would be worse than the fault: Qian, Gu and Sun are living
   Chinese surnames, so the list would quietly excuse a real scholar — the trap `check-cards.js` names
   about praenomina. That file already keys its own ancient list on the WHOLE author string and so has
   never had this fault, and a second copy of a list goes stale on a change made in a file nobody here
   has reason to open. So it is read from there at run time, and the run STOPS if it is not there. */
const ANCIENT_FULL = (() => {
  const src = fs.readFileSync(path.join(__dirname, "check-cards.js"), "utf8");
  const m = src.match(/^const ANCIENT = (\/\^\(.*\/i);$/m);
  if (!m) {
    console.error("card-focus: check-cards.js no longer declares `ANCIENT` as a regex literal. The\n" +
      "ancient-author list is read from there so the two tools cannot disagree about who is a\n" +
      "witness rather than a scholar — fix the slice rather than copying the list.");
    process.exit(2);
  }
  return new Function("return " + m[1])();
})();

const plain = (s) => String(s || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

/* A CITATION THAT OPENS ON ITS OWN TITLE HAS NO AUTHOR AT ALL — and where that title is neither
   italicised nor quoted, there is nothing for the two strips above to cut the head at. Athenian
   inscriptions are cited exactly that way: "Erechtheion building accounts, 409/8 BC (IG I3 474), lines
   85–95, trans. Stephen Lambert and Robin Osborne, Attic Inscriptions Online". The head rule then
   handed the whole description to the surname test, which read *Erechtheion*, *Eleusis*, *Ionic* and
   *Herms* off it — so five Athens cards were reported for a question naming a researcher, on the
   strength of the monument the card is about.

   THE DISCRIMINATOR IS THE TRANSLATOR MARKER, and it is narrow on purpose. A citation with a real
   author puts that author BEFORE the title and the translator after it, so a `trans.` reached while
   still inside the head means the head is the work rather than a byline — and the house rule is that a
   translator is not the author in any case. The obvious wider rule was tried and measured first: an
   author field's first element is a personal name, so every lowercase word in it should be a name
   particle. It takes rule 1 to zero findings and its drop set is full of real scholars — d'Errico,
   d'Agostino, des Courtils, de los Ángeles Utrero Agudo, al-Dīn ibn Shaddād, "Erik Jensen with Insa
   Kummer" — because an elided or foreign particle is a lowercase word too, and the list that would
   admit them all is the list `NOT_A_SURNAME`'s own comment says will always be one word short.
   WHAT THIS DELIBERATELY DOES NOT CATCH is a document title with no translator in it: "Norman H. Davis
   to Shigeru Yoshida, Paris, 3 December 1937" still yields *Yoshida*. No question names it today, and
   a finding that has to be read is better than a rule that quietly eats a byline. */
const HEAD_IS_TITLE = /\b(?:trans\.|translated by)\s/i;

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
  /* A PUBLISHER PARENTHETICAL IS NOT PART OF THE AUTHOR FIELD, and swallowing one hands the
     last-token rule a PLACE. "…, ed. William S. Powell (Chapel Hill: University of North Carolina
     Press, 2006)" yielded the surname "Carolina", so every question naming the colony read as one
     naming a scholar. Cutting each segment at its opening parenthesis is general, where adding the
     place to NOT_A_SURNAME would only ever be a list that is one place short. */
  for (const m of s.matchAll(/,\s*(?:by|ed\.|edited by)\s+([^,§]*(?:,\s*[A-Z][^,§]*)?)/gi)) segs.push(m[1].split("(")[0]);
  /* THE HEAD IS TAKEN EVEN WHERE AN `ed.` FIELD WAS FOUND, which it was not until Sep 2026. A chapter
     in an edited volume carries BOTH — "Édouard Lartet and Henry Christy, 'Cavernes du Périgord,' …
     ed. Thomas Rupert Jones" — and taking the editor INSTEAD of the author lost the author of 373
     citations, 2% of the corpus, in the lenient direction: a question naming one of them was invisible
     to rule 1. Closing it surfaced exactly two findings, one of them real (`gr-644`, which named
     Furtwängler) and one an ancient jurist the shared list did not yet carry. A review is still the
     exception, its head being the reviewer that the first branch has already taken. */
  if (!rev) {
    const head = s.split("§TITLE§")[0];
    if (head && head.length < 200 && !HEAD_IS_TITLE.test(head)) segs.push(head);
  }
  return segs;
}

/* Surnames worth matching in prose. A surname is the LAST capitalised token of a personal name, with
   Dutch/German/French particles folded in ("van Wees" -> "Wees", matched as a word either way). */
/* A CORPORATE AUTHOR YIELDS NO SCHOLAR, AND THE TEST IS PER NAME RATHER THAN PER CITATION (Sep 2026).
   `NOT_A_SURNAME` above already carries three scars of the same shape — "Archaeological Survey of
   India", "U.S. Congress", the Chapel Hill publisher — and its own comment concedes that a list of
   banned words will always be one word short. It was: measured over the corpus the moment this script
   could see the cards again, rule 2 reported 97 cards and NOT ONE was real. Every flag came from an
   institutional byline whose last token the surname rule took for a scholar, which then matched all
   through the card's own prose — "United Nations Statistics Division" gave *Division*, "Government of
   Anguilla" gave *Anguilla*, so eight of Anguilla's ten sentences read as historiography about
   Anguilla. Testing for an institutional word is general where a list of places never can be.

   IT IS APPLIED TO THE COMMA-SEPARATED NAME, NOT TO THE WHOLE AUTHOR FIELD, and that is the whole
   difference between a fix and a second fault. Rejecting the field outright also cleared 88 of the
   false flags — and silently swallowed four REAL scholars, Whitley, Nevett, Osborne and Lambert, each
   of whom happens to be cited beside an institution ("trans. Stephen Lambert and Robin Osborne, Attic
   Inscriptions Online"). A measure that loses a genuine finding to tidy away a false one is the fault
   this whole script exists to avoid. Per name: rule 2 goes 97 → 9 and rule 1 19 → 14, every surviving
   flag is a place, an ancient author or a historical actor rather than a scholar, and the dropped set
   contains no surname at all. */
/* …AND ITS WORD BOUNDARIES ARE LOOKAROUNDS, BECAUSE `\b` IS ASCII-DEFINED (Sep 2026). This is the
   same trap `check-cards.js` records beside its own ancient list, met a second time the moment this
   list learnt any language but English: `Collectivité` ends in an é, so a trailing `\b` asks for a
   boundary between two characters neither of which JS counts as a word character, and the branch
   matched the name and then threw the match away. It failed on exactly the word it had just been
   added for — `Collectivité de Saint-Martin`, three citations on `gw-718` — while `Préfecture` beside
   it worked, which is what makes the fault look like a typo rather than a rule.

   THE LIST IS ENGLISH AND THE CORPUS IS NOT. The geography collections cite 233 countries' own
   governments in those countries' own languages, so an English institution list reads a place name off
   every one of them: `Gemeinde Vaduz` gave *Vaduz*, `Mairie de Saint-Pierre` gave *Pierre*, `Câmara
   dos Deputados` gave *Deputados*, `University of South Carolina` gave *Carolina* — and `University`
   was missing from the English half too. The additions are MEASURED rather than guessed: dumping every
   author string that still yields a surname over the whole corpus left fifteen institutional shapes,
   which is the list below plus the same word in the other languages these collections already cite.
   `Parks` is the one to know about — `Parks Canada` and `Parks Australia` are why it is here, and it
   would reject a scholar named Parks; none is cited today. */
const CORPORATE = /(?<![A-Za-zÀ-ÿ])(?:Ministry|Ministries|Department|Division|Bureau|Office|Agency|Authority|Administration|Commission|Committee|Council|Assembly|Congress|Parliament|Secretariat|Organization|Organisation|Nations|Government|States|Republic|Kingdom|Bank|Fund|Programme|Survey|Service|Statistics|Institute|Institution|Museum|Library|Archives|Association|Society|Foundation|Trust|Centre|Center|Board|Court|Tribunal|Union|Commonwealth|Company|Corporation|Laboratory|Observatory|Academy|College|School|Faculty|Consortium|Network|Alliance|Federation|Confederation|Secretary|Directorate|Commons|Lords|Senate|Bundestag|Reichstag|Duma|Museums?|Museo|Musée|Museu|Muzeum|Musei|Universit(?:y|ies|é|ä|à|y)|Universidad|Universidade|Universiteit|Universität|Università|Minist(?:ry|ère|erie|ero|erio|ério|erium)|Institut(?:o|e|ion|os|es)?|Istituto|Instituut|Collectivité|Préfecture|Prefecture|Mairie|Gemeinde|Gemeente|Parks|Bibliotheca|Biblioteca|Cámara|Câmara|Ayuntamiento|Municipalidad|Prefeitura|Gobierno|Governo|Regierung|Comune)(?![A-Za-zÀ-ÿ])/i;

function scholarsOf(card) {
  const out = new Set();
  for (const src of card.sources || []) {
    for (const seg of authorSegments(src)) {
      const people = seg.split(/\s+(?:and|&)\s+|,\s*(?![A-Z]\.)/);
      /* AN INSTITUTION AT THE HEAD OF A SEGMENT OWNS THE WHOLE OF IT, and that is the other half of
         the per-name rule above. A museum's object record is a catalogue entry, not a byline: the
         Met's reads "Metropolitan Museum of Art, terracotta stand, Greek, Attic, signed by Ergotimos
         as potter and by Kleitias, ca. 570 BC" — so the per-name test rejected the museum and then
         read *Attic*, *Ergotimos* and *Kleitias* off the description of the very pot the card is
         about. Where the institution comes FIRST the rest is its own description; where it comes
         LAST the names before it are real ("trans. Stephen Lambert and Robin Osborne, Attic
         Inscriptions Online"), which is the case the per-name rule was written to protect and which
         this leaves untouched. */
      if (people.length && CORPORATE.test(people[0])) continue;
      for (const person of people) {
        if (CORPORATE.test(person)) continue;   // an institution is not a scholar — see CORPORATE above
        const toks = (person.match(/\b[A-ZÀ-Þ][a-zà-ÿ'’-]{2,}\b|\b(?:van|von|de|der|den|du|la|le|di|da|el)\b/g) || [])
          .filter((t) => !NOT_A_SURNAME.has(t));
        if (!toks.length) continue;
        const last = toks[toks.length - 1];
        /* THE MATCH MUST COVER THE WHOLE NAME, and a prefix test is worse than no test at all:
           Homer, Justin, Virgil and Aristotle are ancient authors AND ordinary modern given names,
           so `^justin` excused Justin Coppe, Justin Bradfield and nine more living scholars. Hence
           the full forms leading the shared list — see `check-cards.js`'s note beside it. */
        const bare = person.replace(/^\s*(?:trans\.|ed\.|edited by)\s*/i, "").replace(/\bet al\.?$/i, "")
          .trim().replace(/[.,;:]+$/, "");
        const anc = bare.match(ANCIENT_FULL);
        if (anc && anc[0].length >= bare.length) continue;
        if (last && !PARTICLES.has(last) && !ANCIENT.has(last) && last.length >= 3) out.add(last);
      }
    }
  }
  return out;
}

// Attribution with the name filed off — still historiography.
const ANON_ATTRIB = /\b(?:his|her|its|the) reviewer\b|\bone (?:contribution|scholarly account|essay|study|argument)\b|\bmodern (?:scholarship|accounts?|reading|pictures?|interpretations?)\b|\bscholars? (?:divide|disagree|now|have|hold|set|put|question)\b|\bhas (?:been|largely) (?:called|attacked|questioned|challenged|dismantled|doubted|taken apart)\b|\bis (?:now )?(?:doubted|unsettled|contested|not universally accepted)\b|\blater work\b|\bthe standard (?:work|collection)\b/i;

/* THE SENTENCE SPLIT IS split-abstract.js's, NOT A REGEX OF THIS SCRIPT'S OWN. It was
   `plain(t).split(/(?<=\.)\s+/)`, which breaks after ANY full stop and never after a `?` or a `!` —
   so an initial, a decimal, an era abbreviation or an abbreviated genus each added a phantom
   sentence, and a sentence closing on a quoted question lost one. Measured over the shipped
   corpus it disagreed with the real split on 206 of 1,426 cards: rule 2 is a fraction of TEN,
   so every one of those had the wrong denominator — leniently on the 200-odd that over-counted,
   strictly on the handful that under-counted. `pieces` carries every guard the batches
   accumulated and is exported for exactly this. */
const sentences = (t) => {
  const { parts } = splitAbstract.blocks(String(t || ""));
  return parts.flatMap((b) => splitAbstract.pieces(b)).map(plain).filter(Boolean);
};

function measure(card) {
  const names = [...scholarsOf(card)];
  const rx = names.length ? new RegExp("\\b(" + names.join("|") + ")\\b", "g") : null;
  /* THE TABLE IS CONSULTED HERE RATHER THAN AT THE QUESTION, so both rules honour it: a name that is
     not a modern arguer is not one in the abstract either. `ww2-036` is what settled that — its four
     "historiography" sentences are Mussolini appointed prime minister, Mussolini's leadership, and
     fascism's own doctrine published under his name, none of which is anybody arguing about the past.
     EVERY match in the sentence is tried rather than just the first, or an excused name standing in
     front of a real scholar would shield him. */
  const named = (s) => {
    if (!rx) return null;
    rx.lastIndex = 0;
    for (let m; (m = rx.exec(s)); ) if (!NOT_A_RESEARCHER[card.id + " " + m[1]]) return m[1];
    return null;
  };

  const qs = [card.question, ...(card.questions || [])];
  const qNamed = qs.map((q, i) => { const hit = named(plain(q)); return hit ? { i: i + 1, name: hit } : null; }).filter(Boolean);

  const sents = sentences(card.abstract);
  const historio = sents.filter((s) => named(s) || ANON_ATTRIB.test(s));
  const modern = sents.filter((s) => /\b(1[89]\d{2}|20[0-2]\d)\b/.test(s));

  return { id: card.id, answer: card.answerText, n: sents.length, historio: historio.length,
           modern: modern.length, qNamed, names, exempt: EXEMPT[card.id] || null,
           q1off: rule1Excluded(card.id) };
}

/* THROUGH card-io, NEVER THROUGH A LOADER OF ITS OWN. Both rules this script measures read fields the
   split moved out to data-extra/<collection>.js — rule 1 takes its names from the AUTHOR POSITIONS of a
   card's own `sources`, rule 2 counts historiography sentences in its `abstract` — and data.js's rejoin
   block needs `require`, which a `new Function` body has not got. Blind, the measure does not fail: it
   reports every card as 0/0 with nothing to revise, which is indistinguishable from a corpus that has
   just been cleaned up. It did exactly that from the split until 2026-09-12. */
const win = { CARD_DATA: require("./card-io").loadCards().cards };
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
