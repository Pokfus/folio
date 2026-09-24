#!/usr/bin/env node
/*
  check-cards.js — the card-level faults NOTHING else in the pipeline can see.

    node .claude/check-cards.js [--prefix=gr-] [--verbose] [--report]

  Exit 1 on a violation, so it guards a batch the way check-style.js and
  check-questions.js do.  `--report` never exits 1: it prints the same findings as
  a work list, which is how a content pass is planned rather than gated.

  WHY THIS FILE EXISTS.  Every check here was written after a real fault reached the
  shipped collection and no tool reported it:

  1. AN AUTHOR CITED IN MORE THAN TWO OF ONE CARD'S SOURCES.  `add-card.js` checks a
     citation ends in a URL, `source-audit.js` counts them and `check-citations.js`
     checks the names against Crossref — all of them pass a card whose whole apparatus
     is one work.  gr-056 cited a single Dartmouth course website eight times out of ten
     and every existing check called it fully sourced.  ANCIENT AUTHORS ARE COUNTED
     SEPARATELY: Herodotus cited six times is six passages of one witness, which is a
     different fault from six pages of one modern scholar, and the two are reported
     under their own headings so neither hides the other.

  2. A MODERN SCHOLAR NAMED IN A QUESTION.  `card-focus.js` already reports this and
     CANNOT SEE MOST OF IT: it takes the names it looks for from the AUTHOR POSITIONS of
     the card's own citations, so a scholar named in a question but not cited on that
     card is invisible to it.  It reported one card for the Greece collection; an
     independent sweep found thirteen.  This one works the other way round — it reads the
     question for the SHAPE of an attribution ("X argues", "X's graph", "according to X")
     and asks only afterwards whether the name is an ancient witness.

  3. ONE PICTURE ON TWO CARDS.  Compared on the Commons FILE NAME with the size prefix
     stripped, because the same file at two widths is two different `src` strings and a
     plain comparison misses it: gr-267 and gr-379 carried the same map for weeks at
     1920px and 1280px.

  4. A PICTURE DESCRIPTION THAT NAMES ITS OWN SOURCE.  The credit line under a picture
     already carries the file URL, so a description ending "…, CC BY 3.0, via Wikimedia
     Commons" prints the attribution twice and spends the caption on it.  276 of the
     Greece collection's 411 descriptions did this.

  5. A CARD WITH NO PICTURE AND NO REASON.  Reported, never failed — plenty of terms
     cannot be depicted and an empty frame is the right answer for them.  It is a work
     list, not a rule.

  6. MORE THAN ONE SOURCE IN THE SAME NON-ENGLISH LANGUAGE.  English is preferred where
     it serves equally well, and a card resting on two French excavation reports is one
     most readers cannot check.  Detected from the journal and publisher names, so it is
     a proxy: read the card before acting on it.

  7. A QUOTATION THAT IS NOT IN THE BOOK IT NAMES.  `card.quote` puts a passage of a shelved
     Library book on the card and a button through to it, and `test-card-quote.js` asserts the
     placement and the address — neither of them the WORDS.  So a quotation can be silently
     re-punctuated, re-worded or elided across a gap and still render perfectly under a link to
     the real text: gr-467 joined two passages 200 words apart with no ellipsis, opened on an
     editorial "He" where Thucydides names Pericles, and set the translator's `--` as an em dash.
     Every passage is checked against the generated `books/<id>.js` it names, an explicit ` … `
     marking a gap and each side of it checked on its own.  A book that is not on disk is skipped
     rather than failed.

  WHAT IT REPORTS TODAY, so a run is not read as a regression.  Over the whole corpus it
  finds a large standing backlog of 1 and 6 — the Ancient Greece collection's early decks
  rest heavily on one Dartmouth course site and on the French excavation reports, because
  the substitutes are not reachable from this sandbox (the seven measured routes are in
  `docs/greece-audit-2026-09.md`).  Those are recorded rather than papered over, so it is a
  REPORT TOOL run by hand and is deliberately NOT in the CI fast gate.  Run it with
  `--prefix=` over the cards a batch touches and leave the backlog alone.

  WHAT IT DELIBERATELY DOES NOT CHECK.  Whether a question names its topic's most
  important aspect, and whether a picture is really of its subject.  Both are judgements
  no regular expression can make; the first is stated in check-questions.js's own header
  and the second is why `.claude/contact-sheet.py` exists.
*/
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const args = process.argv.slice(2);
const VERBOSE = args.includes("--verbose");
const REPORT  = args.includes("--report");
const PREFIX  = (args.find(a => a.startsWith("--prefix=")) || "").slice(9);

function loadWindow(file) { const win = {}; new Function("window", fs.readFileSync(file, "utf8"))(win); return win; }
/* THE CARDS COME THROUGH card-io, and every check here depends on it: `sources` and `image` are two of
   the fields that moved to data-extra/, so read from data.js alone this file reports a fully cited,
   fully illustrated corpus as uncited and unillustrated — "no-picture — 100" on a collection where
   fifty-seven cards carry one. A checker that reports a clean corpus as broken is a checker nobody
   runs. (See card-io.js: a `new Function` body inside a module cannot see `require`, so data.js's own
   rejoin block never fires there.) */
const win = Object.assign(loadWindow(path.join(ROOT, "data.js")), { CARD_DATA: require("./card-io.js").loadCards().cards });

/* THE GLOSSARY IS THE DISCRIMINATOR FOR RULE 2, and it is the right one because it is the
   collection's own register of what its words NAME.  "Athenian Constitution" and "White Castle"
   match the shape of an attribution and are a work and a place; both are glossary surfaces, and
   most modern scholars are not.  Read through gloss-io.js, which loads BOTH glossary files —
   glossary.js alone yields empty tables.

   BUT A MODERN SCHOLAR CAN BE A GLOSSARY TERM, AND THAT IS EXACTLY THE CASE THE RULE IS FOR.
   The pairing rule gives every card's answer its own entry, so an excavator who is herself a
   card's subject has one — `Harriet_Boyd_Hawes`, with "Harriet Boyd" as an alias — and a flat
   glossary exemption therefore SUPPRESSED the one real finding it was meant to leave standing
   (gr-014 Q3, "Harriet Boyd excavated …").  A term is withheld from the exemption when it is
   tagged `person` and its date line begins after 1500: that is the site's own record of a modern
   figure, made where the term was written rather than guessed at from the name. */
const MODERN_FROM = 1500;
const GL = (() => {
  try {
    const g = require("./gloss-io.js").loadGlossary();
    const tags = g.GLOSSARY_TAGS || {}, dates = g.GLOSSARY_DATES || {};
    const modern = (k) => {
      if (!(tags[k] || []).includes("person")) return false;
      const y = String(dates[k] || "").match(/\d{3,4}/);
      return !!y && +y[0] >= MODERN_FROM;
    };
    const set = new Set();
    for (const k of Object.keys(g.GLOSSARY || {})) {
      if (modern(k)) continue;
      set.add(k.replace(/_/g, " ").toLowerCase());
      for (const a of g.GLOSSARY_ALIASES[k] || []) set.add(String(a).toLowerCase());
    }
    return set;
  } catch { return new Set(); }
})();
const cards = (win.CARD_DATA || []).filter(c => !PREFIX || String(c.id).startsWith(PREFIX));

const plain = s => String(s || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

/* ---------- 1. one author across a card's sources ---------- */

/* An ancient author is a WITNESS, not a researcher (the same distinction card-focus.js
   draws), so the two are counted apart.  The list is of authors the collections actually
   cite; add to it rather than loosening the pattern.
   THE LIST WAS INCOMPLETE AND THE GAP WAS ALL ROMAN.  Measured over data.js and the
   glossary in Sep 2026, fifteen ancient authors were being counted as modern scholars —
   Appian 183 citations, Dionysius of Halicarnassus 109, Velleius 54, Sallust 32, Aulus
   Gellius 27, Cassius Dio 24, Florus 13 — so a Rome card resting on three passages of
   Appian was reported under the same heading as one resting on three pages of a course
   website, which is the one distinction this check's own header says it draws.  A checker
   that cries wolf on a well-sourced card is one nobody runs.  Half of that gap was found
   twice over, independently and in the same month, which is what a list nobody measures
   invites; the two halves are merged here rather than either being taken whole. */
/* THE CHINESE CLASSICS ARE WITNESSES TOO, and they reach the list by their TITLES because
   most of them are anonymous.  A translated ancient work is cited ancient-author-first with
   the translator after (Livy trans. Roberts, the Greek Anthology trans. Paton), so an
   anonymous one opens on its title — and the title is then what `authorOf` returns.  Before
   the China cards were re-cited, five different classics translated by James Legge read as
   one modern scholar cited five times, which is the opposite of what rule 1 is for.
   THE LIST GREW AGAIN WITH THE PASS THAT PRODUCED THAT FORM (Sep 2026,
   `.claude/fix-citation-form.js`).  Correcting 237 citations moved a heap of anonymous works
   INTO the author slot — the Book of Lord Shang 33 times, the Nihongi 27, the She King 12,
   the Anglo-Saxon Chronicle 10 — and every one of them was then keyed as a modern scholar,
   which is the same fault one step further on: no card trips on them today, so nothing would
   have said so until one did.  A title is added here the moment the pass starts producing it.
   WHAT IS DELIBERATELY NOT HERE IS THE MODERN PRIMARY DOCUMENT.  The same slot now holds the
   Treaty of Versailles (7), the Covenant of the League of Nations (6) and a dozen
   constitutions and court records.  They are primary rather than scholarly, so counting them
   as one scholar's opinion is wrong in the same way — but this list is of ANCIENT witnesses,
   and a card resting three times on one modern treaty is a judgement somebody should make
   with the card in front of them rather than a row added here in passing. */
/* THREE MORE CAME FROM THE OTHER TOOL, WHICH NOW SHARES THIS LIST (Sep 2026).  `card-focus.js`
   enforces the same house rule one field over — a question may never name a researcher — and reads
   its names from these same author positions, so reading its findings showed Antiphon (5 citations),
   Lucian (3) and Sun Tzŭ (3) reaching the MODERN side here as well.  Not one of them trips a card
   today, which is exactly why nothing would have said so until one did.  They are added here rather
   than in the other file because `card-focus.js` now slices this regex out by text, the mirror of the
   way this file slices its exemptions: one list of ancient witnesses, two tools. */
/* AND THE CLOSING GUARD IS A LOOKAHEAD RATHER THAN `\b`, WHICH IS ASCII-DEFINED (Sep 2026).  `Sun
   Tzŭ` is how this corpus cites the Art of War, and `\b` after a ŭ asks for a boundary between two
   characters neither of which JS counts as a word character — so the alternative matched the name and
   the anchor then threw the match away, silently, on the one author it had just been added for.  A
   negative lookahead for a Latin letter says what the anchor meant and is blind to no alphabet. */
/* A WITNESS NEED NOT BE ANCIENT, AND FOUR MEDIEVAL ONES WERE REPORTING RULE 1 AS A FAULT (Sep 2026,
   found while verifying a merge).  The house rule is that the line falls between the modern ARGUER and
   the witness, not at any date: `Ibn Battuta reached Kilwa in 1331 and found a large town` is a
   fourteenth-century traveller on a fourteenth-century subject, which is Herodotus' relation to Greece
   exactly.  Seven of main's new Africa cards were reported by `card-focus.js` for naming one, because
   the mechanism keys on a name's LAST token — `Ibn Battuta` yielded *Battuta*, `Ibn Khaldun` *Khaldun*,
   `Marco Polo` *Polo*, and `Ibn Fadl Allah al-ʿUmari` yielded **Allah**, which is a latent finding on
   any Islamic-history card whose question carries the word.  THE WHOLE-NAME TEST IS WHAT MAKES THIS
   SAFE TO ADD: the corpus cites six living scholars whose given name is Marco — Demichelis five times,
   plus Tizzoni, Rossi, Romboni, Fratus and Yseki — so a `^marco` prefix would have excused every one of
   them, and the anchored full form `marco polo` excuses none.  al-ʿUmari is spelled with three
   different apostrophes across the corpus, hence the class; he trips no card today and is added for the
   reason the three above him were, that nothing would have said so until one did. */
/* SEVEN NAMES ARE WRITTEN OUT IN FULL AND LEAD THE ALTERNATION, WHICH IS NOT TIDINESS (Sep 2026).
   `card-focus.js` reads this list to decide whether an author is a witness, and it measures the
   match against the WHOLE name — because the trap on the other side is an ancient author's name
   that is also a modern GIVEN name.  Measured over the corpus, testing a prefix quietly excused
   eleven living scholars: Homer B. Hulbert eighteen times, and Justin Coppe, Justin Bradfield,
   Justin Ledogar, Justin Reuter, Justin Liefer, Justin Lemberg, Justin Eilertsen, Virgil Drăgușin
   and Aristotle Kakaliagos once each.  A whole-name test needs the ancient's own full name, and
   these seven are the shapes the corpus actually cites — Diodorus Siculus 242 times, Velleius
   Paterculus 83, Pliny the Elder 27.  JS alternation takes the FIRST branch that matches, so a
   long form placed after its own prefix would never be seen. */
/* FOUR MORE MEDIEVAL WITNESSES, AND ONE ANONYMOUS CHRONICLE CITED BY ITS OWN TITLE (Sep 2026, on the
   ru-041–ru-050 batch).  The Kievan Rus' cards rest on four texts written between the 820s and the
   1110s, and rule 1 reported three cards for citing one of them three times: `Leo the Deacon` wrote at
   Constantinople within living memory of the war he describes, `Liudprand of Cremona` heard the 941 raid
   from his own stepfather, and `Constantine VII Porphyrogenitus` compiled two of the handbooks the
   period is reconstructed from.  Three passages of any of them is the same shape as six passages of
   Herodotus, which is what this list exists to separate from six pages of one scholar.
   `Chronique dite de Nestor` is the fourth and is not a person at all: the Rus' Primary Chronicle is
   anonymous, so its citations OPEN on the work's own title, and `authorOf` read that title as an author
   — the fault the tool already guards against for a title in QUOTES (`^["“]`) and cannot see through
   an italicised one.  It joins the anonymous works already listed by title (`the anglo-saxon chronicle`,
   `the annals of the bamboo books`), and the whole-name anchoring makes all four safe: no living scholar
   is called any of them. */
/* TWO MORE OF THE SAME TWO SHAPES (Sep 2026, on the ru-051–ru-060 batch).  `Thietmar of Merseburg`
   was a contemporary of the events he reports — he died in 1018, the year his last book describes
   Bolesław in Kyiv — so three passages of him are three passages of one witness, exactly as Leo the
   Deacon's are.  `The Chronicle of Novgorod` is `Chronique dite de Nestor`'s case again: the Novgorod
   First Chronicle is anonymous, so its citations open on the italicised title of the Michell and
   Forbes translation, which `authorOf` reads as an author called "The Chronicle of Novgorod
   1016–1471".  The alternation carries the name only as far as `novgorod`, since the printed title
   runs on into its date span and the `(?![A-Za-z])` lookahead is satisfied by the space after it. */
/* AND A SEVENTH MEDIEVAL WITNESS, THIS ONE TRIPPING RULE 2 RATHER THAN RULE 1 (Sep 2026, on the
   ru-081–ru-090 batch).  `Anna Comnena` is the same shape as Leo the Deacon and Thietmar of
   Merseburg — a twelfth-century writer reporting her own father's reign — and the Alexiad is the
   fullest account there is of the Varangian Guard, so `ru-089`'s question naming her is a question
   naming a WITNESS.  It was reported as a scholar in a question, which is rule 2 rather than the
   citation-count rule the six names beside her were added for, and the same list answers both: rule 2
   skips a name `ANCIENT` matches.  Anchored on the whole name, as the seven full forms above are, so
   it cannot excuse a living scholar called Anna: the corpus cites several, none of them Comnena. */
const ANCIENT = /^(anna comnena|leo the deacon|liudprand of cremona|constantine vii porphyrogenitus|chronique dite de nestor|thietmar of merseburg|the chronicle of novgorod|ibn fadl allah al-[\u02bf\u2018\u2019']?umari|ibn battuta|ibn khaldun|marco polo|diodorus siculus|lucius ampelius|velleius paterculus|pliny the elder|pliny the younger|ammianus marcellinus|eusebius of caesarea|memnon of heracleia|suda on line|herodotus|thucydides|aristotle|plutarch|pausanias|strabo|aeschylus|sophocles|euripides|aristophanes|horace|diodorus|xenophon|homer|hesiod|plato|isocrates|demosthenes|lysias|andocides|antiphon|lucian|pomponius|sun tz[uŭ]|pindar|polybius|vitruvius|athenaeus|apollodorus|arrian|nepos|justin|aelian|suda|pliny|cicero|livy|ovid|virgil|tacitus|suetonius|josephus|sima qian|ban gu|hippocrates|galen|euclid|archimedes|ptolemy|theophrastus|diogenes laertius|appian|augustus|dionysius of halicarnassus|velleius|sallust|aulus gellius|gellius|cassius dio|dio cassius|florus|eutropius|quintilian|frontinus|statius|procopius|varro|memnon|ampelius|ammianus|zosimus|martial|julius caesar|historia augusta|eusebius|caesar|kautilya|orosius|confucius|mencius|the sh[uû] king|the y[iî] king|the shoo king|the ch['’]un ts['’][eë]w|the annals of the bamboo books|the she king|the shih king|the religious portions of the shih king|the l[iî] k[iî]|the sacred books of china|the book of lord shang|nihongi|the anglo-saxon chronicle|the laws of manu|vinaya texts|the hymns of the rigveda|the upanishads|the thirteen principal upanishads|the zend-avesta|hymns of the tamil|hymns of the alvars|the code of hammurabi|the greek anthology|the rule of our most holy father st\\. benedict|the trial of jeanne d['’]arc|the glass palace chronicle|the finding of wineland the good|akaranga sutra|gaina sutras)(?![A-Za-z])/i;

/* AN INSTITUTION IS NOT A SCHOLAR, AND THREE OF ITS RECORDS ARE NOT THREE OPINIONS (Sep 2026, out of
   the field audit). Rule 1 was written against a card whose whole apparatus is one researcher's view,
   and it counted a DATA PUBLISHER the same way — so a geography card citing the World Bank for its
   population, its area and its GDP was reported as resting three sources on one author. Measured over
   the corpus, that shape was **274 of the 431 findings**: the World Bank 84 times, the National Park
   Service 65, the Census Bureau 50, the Holocaust Memorial Museum 31.
   THEY ARE REPORTED SEPARATELY RATHER THAN EXCUSED. A concentration on one institution is still worth
   seeing — a card resting entirely on one ministry's site is thin however official the ministry — so it
   becomes a NOTE under its own heading and stops drowning the finding rule 1 exists for, which is a
   card whose apparatus is one scholar. Before the split, `jeremy b. rutter` (39 cards, the Dartmouth
   course site the Greece audit names) sat in a list of 431 where nobody would read it.
   DECLARED, never pattern-matched. "Anything ending in Museum or Bureau" would quietly excuse a real
   author, and the point of a declared list is that adding to it is a decision somebody made. Add an
   entry only after reading a card that cites it. */
const INSTITUTIONAL = new Set([
  "world bank", "u.s. census bureau", "united nations statistics division", "un general assembly",
  "un security council", "office of the historian", "united states department of state",
  "national park service", "historic american buildings survey", "smithsonian national museum of natural history",
  "united states holocaust memorial museum", "national diet library", "american school of classical studies at athens",
  "institute for the study of the ancient world", "digital egypt for universities",
  "ministère de la culture", "ministère de la culture (france)", "government of the netherlands",
  "government of anguilla", "governorate of vatican city state", "statistics jersey",
  "administration supérieure des îles wallis et futuna", "parks australia",
  /* A MULTI-AUTHOR TEXTBOOK CITED PER CHAPTER IS THE SAME CASE AS A DATA PUBLISHER (Sep 2026), and
     both were read before being named here. Three chapters of one standard textbook, credited to a
     team of three or six, are not three scholars' opinions — they are one reference shelf consulted
     three times, which is a different fault from three papers by one arguing scholar and is reported
     as such rather than excused. NOT extended to the 1905, 1922 and 1929 works the corpus also leans
     on (Walters, the Cambridge History of India, Platner and Ashby): there the whole modern apparatus
     of a card really is one book, which is the finding this check exists for. */
  "mary ann clark",   // OpenStax, Biology 2e — three authors, cited per chapter (bio-003/014/015)
  "bruce alberts",    // Molecular Biology of the Cell — six authors, cited per chapter (bio-025/026)
  /* ONE RESOURCE WAS BEING COUNTED TWO WAYS DEPENDING ON CITATION FORM (Sep 2026). "digital egypt
     for universities" is already declared above, and it works for the 74 corpus citations that open
     on the page title — but 10 open on the site's two named editors instead, and those bypassed the
     entry entirely. wh-203 Naqada culture cites FIVE different pages of it (background, chronology,
     predynastic burial customs, foreign relations, political unification), which is one teaching
     resource consulted five times, not one scholar's view five times. Measured before adding: the
     drop set is exactly ONE card — wh-202, wh-216 and wh-201 cite it twice or once and are unmoved —
     and wh-203 moves from a FAIL to the one-institution note rather than to silence, which is what
     this table is for. The card was read first. */
  "wolfram grajetzki and stephen quirke",  // Digital Egypt for Universities, cited per page (wh-203)
]);

/* Is this cited author the card's own subject? Folded to letters, digits and single spaces, and
   compared both ways round so "Charles Darwin" matches an answer of "Charles Darwin" and a citation
   key that carries more or less of the name than the answer does still resolves. */
const subjKey = (x) => String(x || "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
function citesOwnSubject(card, key) {
  const ans = subjKey(card && card.answerText), k = subjKey(key);
  if (!ans || !k || k.length < 4) return false;
  if (ans === k || ans.includes(k) || k.includes(ans)) return true;
  /* A CHICAGO NOTE ABBREVIATES A GIVEN NAME AND A CARD'S ANSWER TERM DOES NOT, so the string
     test above can only match a source written with the given name IN FULL — which is how a
     19th-century book is cited and not how a journal article is.  It therefore saw `ps-037`
     Fechner, `ps-038` Darwin and `ps-040` Galton, all cited by their books, and could not see
     `ps-049`, whose answer is “Edward Titchener” against four sources reading “E. B.
     Titchener”: the card was reported as an over-citation on a difference of typography.  The
     surname ALONE is too loose — Erasmus and Charles Darwin are two men, and so are the three
     Seligmans — so the first initial must agree with it. */
  const last = (s) => s.split(" ").pop();
  return last(ans).length >= 4 && last(ans) === last(k) && ans[0] === k[0];
}

/* The author field of a Chicago note is what stands before the first quoted title.  A
   work with no author (a museum record, an institutional page) falls back to the text
   before the first full stop, which is that body's name. */
function authorOf(src) {
  const t = plain(src);
  /* A citation that OPENS on its title has no author — an anonymous museum or institutional
     record.  Reading the title as the author gave gr-333 an author called “Athens”, and three
     records of one museum then looked like one scholar cited three times. */
  if (/^[“"]/.test(t)) return "";
  const m = t.match(/^(.*?),\s*[“"]/);
  if (m) return m[1].trim();
  /* THE COMMA, NOT THE FULL STOP, IS WHAT ENDS AN AUTHOR FIELD.  A book's title is italicised
     rather than quoted, so the pattern above cannot see it — and a full-stop fallback then reads
     an INITIAL as the whole name: “H. B. Walters, History of Ancient Pottery …” gave an author
     called “H”, so the same three citations of one book were filed under a scholar named for a
     letter.  Chicago note form puts the given name first, so nothing before the first comma is
     ever part of a title. */
  const m2 = t.match(/^([^,]{2,80}),\s/);
  if (m2) return m2[1].trim();
  const m3 = t.match(/^(.*?)\.\s/);
  return (m3 ? m3[1] : t.slice(0, 60)).trim();
}
const surnameKey = a => a.split(",")[0].trim().toLowerCase();

/* ---------- 2. a modern scholar named in a question ---------- */

const ATTRIB = new RegExp(
  "\\b([A-Z][a-zA-Z\\u00C0-\\u024F.'-]+(?:\\s+[A-Z][a-zA-Z\\u00C0-\\u024F.'-]+){0,2})" +
  "(?:'s\\s+(?:graph|count|chronology|reading|case|dating|view|argument|edition|excavation)" +
  "|\\s+(?:argues?|argued|reads?|has read|holds?|held|proposes?|proposed|showed|shows?|suggests?|suggested|" +
  "identifies|identified|maintains?|denies|denied|concludes?|concluded|counted|thought|calls|called|" +
  "puts?|sets? out|takes? it|took it|finds?|found))\\b", "g");

/* ---------- 8. a modern scholar named in a "what came of this" line ----------

   `card.leadsTo[].how` is the causal strip at the foot of the answer, headed "What
   came of this" — one sentence saying how this card's subject led to another's. It is
   held to rule 2's house rule, on request (Sep 2026: "the 'what came of this' section
   should never name modern scholars"), and for rule 2's reason one field over: a line
   reading "Childe made the farming surplus the engine of the first cities" teaches a
   reader the state of a literature where the strip exists to teach them what happened.

   IT IS A WIDER PATTERN THAN RULE 2's AND MUST NOT BECOME RULE 2's. `ATTRIB` names the
   verbs an attribution is written with; `made`, `makes`, `credits`, `presents`,
   `attributes`, `treats` and `dates the` are attribution verbs too, and adding them to
   the shared regex was built and thrown away — MEASURED, it adds 107 findings over the
   corpus's questions, almost all of them false ("Copper made an inland member of the
   ___ worth taking", "Athens made", "Psychology treats"). A question is 20-34 words of
   narrative prose where the shape is common; a `how` is one short caption and there are
   22 of them in the whole corpus, so the wider net can be afforded here and nowhere else.

   THE ANCIENT WITNESS IS WELCOME, exactly as in a question. Measured over the corpus the
   wide pattern fires five times: Pausanias, Plutarch, Xenophon and Livy, every one an
   ancient author `ANCIENT` already excuses, and Childe — which was the one real finding
   and is now repaired. */
const ATTRIB_HOW = new RegExp(
  "\\b([A-Z][a-zA-Z\\u00C0-\\u024F.'-]+(?:\\s+[A-Z][a-zA-Z\\u00C0-\\u024F.'-]+){0,2})" +
  "\\s+(?:made|makes?|credits?|credited|presents?|presented|attributes?|attributed|" +
  "treats?|treated|dates? the|has it)\\b", "g");

/* Words that open a sentence and are not names.  A capitalised place or period followed
   by "puts"/"shows" is the prose doing its job, not an attribution. */
/* A DECLARED LIST BEATS A LOOSER PATTERN, and it is kept short with a reason beside each entry.
   The shapes above separate a modern scholar from an ancient name well enough that what is left
   over is a handful of English-named PLACES the prose really does put in front of a verb of
   agency.  Widening the pattern to catch them would start excusing real findings; naming them
   cannot.  Add one only after reading the card. */
const NOT_A_SCHOLAR = new Set([
  "White Castle",     // gr-478: the Persian citadel of Memphis, which "held them"
  /* Places and things the prose puts in front of a verb of agency — the shape the header above
     predicted, met once the Rome, World History and Second World War collections grew. */
  "Golan Heights",    // wh-138: the field of dolmens "holds over 400 tombs"
  "Teotihuacan Valley", // wh-167: lidar "over" it "found" rerouted river course
  "Golden House",     // wh-366: Nero's Domus Aurea, which "held" a colossal statue
  "Sun Pyramids",     // wh-431: caught from "the Moon and Sun Pyramids", which "held" caches
  "Fascist Italy",    // ww2-038: the state, which "counted its own era" from the March on Rome
  /* ROMAN REPUBLICAN NAMES, which `ANCIENT` does not cover: that list is of ancient AUTHORS, written
     for the citation rule, and these are ancient ACTORS a question narrates. Named rather than caught
     by a praenomen rule, because Gaius, Lucius and Marcus are modern given names too and a pattern
     would quietly excuse a real scholar. */
  "Gaius Mucius",     // rm-098: Mucius Scaevola, who "held" his hand in the fire
  "Asinius Pollio",   // wh-354: the Augustan historian, who "thought" the Commentarii careless
  "Marcus Aemilius",  // rm-240: M. Aemilius Lepidus, who "put" Rome's terms to Philip
  "BCE Lucius Mummius", // rm-256: the consul of 146; the match swallowed the era from "146 BCE"
  /* AN OFFICE IS NOT A PERSON, and a Chinese one is two capitalised words in front of a verb of agency
     exactly as a scholar is. These are titles the Politics collection narrates ("the General Secretary
     counted only as first among equals"), not people the prose credits. */
  "General Secretary",  // pea-003: the party office, which "counted" as first among equals
  "Standing Committee", // the Politburo body, which decides and meets
  "Central Committee",  // the party body, which elects and meets in plenum
  "Party Congress",     // the five-yearly assembly, which elects and revises
]);

/* ============================================================================
   THE EXEMPTIONS ARE `card-focus.js`'s, SLICED OUT BY TEXT RATHER THAN COPIED

   Two tools enforce one house rule — a question may never name a researcher — and
   until Sep 2026 only one of them knew what is exempt from it. So this file
   reported `wh-064` (Toba catastrophe theory), which CLAUDE.md exempts BY NAME,
   and would have gone on reporting a permanent, growing false finding over
   Psychology and Philosophy, where the literature IS the subject matter and the
   exclusion is collection-wide.

   A second copy of a list goes stale on a change made in a file nobody here has
   reason to open — this repo has the scar — so the lists are read out of
   `card-focus.js` at run time and the run STOPS if they are not there, rather
   than silently checking nothing.
   ============================================================================ */
const { EXEMPT, RULE1_EXCLUDED } = (() => {
  const src = fs.readFileSync(path.join(__dirname, "card-focus.js"), "utf8");
  const grab = (name) => {
    const m = src.match(new RegExp("\\bconst " + name + "\\s*=\\s*(\\{[\\s\\S]*?\\n\\});"));
    if (!m) {
      console.error("check-cards: card-focus.js no longer declares `" + name + "`. The exemptions are\n" +
        "read from there so the two tools cannot disagree — fix the slice rather than copying the list.");
      process.exit(2);
    }
    return new Function("return " + m[1])();
  };
  return { EXEMPT: grab("EXEMPT"), RULE1_EXCLUDED: grab("RULE1_EXCLUDED") };
})();
const rule1Exempt = (id) =>
  !!EXEMPT[id] || Object.keys(RULE1_EXCLUDED).some((p) => id.startsWith(p));

const NOT_A_NAME = /^(The|A|An|This|That|It|Its|His|Her|Their|One|Some|Most|Many|Others|Both|Each|What|When|Where|Who|Nothing|Modern|Ancient|Later|Recent|Tradition|Scholars|Evidence|Radiocarbon|Excavation|Survey|Analysis|Work|Study|Studies|Research|Pottery|Linear|Greek|Greeks|Athens|Sparta|Rome|Egypt|Crete|Cyprus|Sicily|Italy|Troy|Delphi|Olympia|Asia|Europe|Africa|Bronze|Iron|Early|Middle|Late|Old|New|North|South|East|West|Upper|Lower|First|Second|Third|Fourth|Fifth)\b/;

/* ---------- 6. a non-English source, by the name of the work it appears in ---------- */

const LANGS = [
  /* `française d'Athènes` AND `chronique` CAME OUT (Sep 2026, on reading all seventeen
     findings).  They name a French INSTITUTION, not a French work: the École française
     d'Athènes publishes its site notices in ENGLISH ("5a. Malia – The Palace", "4. Malia –
     Historical Discussion") and the Chronique des fouilles en ligne is bilingual, so five
     Greece cards were reported for resting on two French sources neither of which is in
     French.  A sixth, gr-195, cited three English chapters of an English volume and was
     caught by its editors' affiliation.  The real BCH articles still match on `bulletin de
     correspondance` and Mélanges de l'École française de Rome on `mélanges`, so nothing
     genuine was let through — checked against all eleven survivors. */
  ["French",     /\b(revue|études|étude|bulletin de correspondance|persée|comptes rendus|cahiers|mélanges|l'antiquité)\b/i],
  ["German",     /\b(zeitschrift|jahrbuch|mitteilungen|archäolog|untersuchungen|beiträge|forschungen|athenische)\b/i],
  ["Italian",    /\b(rivista|annuario|della scuola|bollettino|quaderni|ricerche)\b/i],
  ["Spanish",    /\b(revista|estudios|boletín|cuadernos|anales de)\b/i],
  ["Greek",      /[Α-Ωα-ω]{4,}/],
  ["Portuguese", /\b(revista brasileira|cadernos de)\b/i],
];

/* ADJUDICATED SAME-LANGUAGE PAIRS.  Rule 6 is a proxy and its own header says to read the
   card before acting on it; these eleven were read in Sep 2026 and every one of them is the
   right answer rather than a fault.  CLAUDE.md's rule is that "a source in any language
   qualifies, and an English card may cite a French or German work where that work carries
   detail no English source does — common for European prehistory, where the excavation
   reports are written where the site is", and these are exactly that: Greek excavation in
   the BCH, Etruscan and early Latin archaeology in CRAI and MEFRA, French sinology in the
   Cahiers d'Extrême-Asie, the Swiss-French mission at Kerma and Meroë, and Mesoamerican and
   Andean archaeology in Spanish.
   A ROW MATCHES ONLY WHEN THE CARD, THE LANGUAGE AND THE COUNT ALL AGREE — `check-citations.js`'s
   CROSSREF_WRONG rule — so adding a third French source to rm-033 reports again rather than
   riding in on a judgement made about two. */
const SAME_LANGUAGE_OK = new Map([
  ["gr-040|French|2",  "BCH: Touchais' excavation note and Faure's review, where the kouros was published"],
  ["gr-336|French|2",  "BCH: Lemerle's Musée National chronicle for 1937 and 1938, the acquisition record"],
  ["rm-011|French|3",  "CRAI and the Revue belge — the Latin League's sanctuaries are French scholarship"],
  ["rm-033|French|2",  "CRAI and MEFRA: Heurgon on the Pyrgi tablets, Humbert on Caere's citizenship"],
  ["rm-034|French|2",  "CRAI: the Pyrgi inscriptions and the Campana terracottas"],
  ["rm-036|French|2",  "MEFRA and CRAI: the Tetnie tomb and the Bonaparte excavations at Vulci"],
  ["cnh-001|French|2", "Cahiers d'Extrême-Asie and the Revue de l'histoire des religions — French sinology"],
  ["wh-416|French|3",  "CRAI: Rilly on Meroitic and the Swiss-French mission's reports from Kerma and El-Hassa"],
  ["wh-429|Spanish|2", "Estudios de Cultura Maya, where Maya epigraphy is published"],
  ["wh-433|Spanish|3", "Boletín de Arqueología PUCP: the Palpa and Chincha surveys behind the Nazca lines"],
  ["wh-434|Spanish|2", "Peruvian ceramic analyses published in Spanish"],
  ["gw-566|Spanish|2", "Chilean journals on a Chilean city: the Revista de Urbanismo on a century of Mapocho corridor planning and the Revista de Teledetección on the San Ramón fault — neither has an English counterpart"],
  /* The École française d'Athènes case again, one language over: only ONE of the two is a Spanish
     WORK. The other is the WMO's Tegucigalpa record, whose author field is the Honduran meteorological
     agency's own Spanish name on a page published in English. Read Sep 2026. */
  ["gw-589|Spanish|2", "the WMO's own record, credited to the Honduran agency in Spanish, beside one genuinely Spanish paper on the Guacerique sub-basin"],
]);

/* ---------- run ---------- */

const fails = [], notes = [];
const imgByFile = new Map();

for (const c of cards) {
  const id = c.id, srcs = c.sources || [];

  // 1
  const modern = {}, ancient = {};
  for (const s of srcs) {
    const a = authorOf(s), k = surnameKey(a);
    if (!k) continue;
    (ANCIENT.test(a) ? ancient : modern)[k] = ((ANCIENT.test(a) ? ancient : modern)[k] || 0) + 1;
  }
  for (const [k, n] of Object.entries(modern)) {
    if (n <= 2) continue;
    if (INSTITUTIONAL.has(k)) notes.push(["one-institution", `${id}: ${k} in ${n} of ${srcs.length} sources`, id]);
    /* A CARD CITING ITS OWN SUBJECT'S WORKS IS CITING A WITNESS, NOT A SCHOLAR (Sep 2026) — the
       ANCIENT rule one era forward. `ps-037` Fechner rests three of its six sources on Fechner's own
       books, and that is what a card about Fechner SHOULD do; counting it as over-citation asks the
       card to describe a man while avoiding what he wrote. It is COMPUTED rather than declared, so it
       can never excuse the same author on another card: the test is that the cited author IS this
       card's own answer term. Measured over the whole corpus it matches exactly three cards —
       `ps-037`, `ps-038` and `ps-040` — and `ps-048`, whose answer is `structuralism` rather than
       Titchener, correctly stays a finding. */
    else if (citesOwnSubject(c, k)) notes.push(["one-witness", `${id}: ${k} in ${n} of ${srcs.length} sources — the card's own subject`, id]);
    else fails.push(["over-cited", `${id}: ${k} in ${n} of ${srcs.length} sources`, id]);
  }
  for (const [k, n] of Object.entries(ancient))
    if (n > 2 && n / srcs.length >= 0.5)
      notes.push(["one-witness", `${id}: ${k} carries ${n} of ${srcs.length} sources`, id]);

  // 2
  for (const [qi, q] of (rule1Exempt(id) ? [] : [c.question, ...(c.questions || [])]).entries()) {
    const t = plain(q);
    for (const m of t.matchAll(ATTRIB)) {
      const nm = m[1].trim();
      if (ANCIENT.test(nm) || NOT_A_NAME.test(nm)) continue;
      /* A MODERN SCHOLAR IS WRITTEN GIVEN + SURNAME, AND ALMOST NOTHING ELSE IN THIS PROSE IS.
         An ancient figure is a single name (Lichas, Gobryas, Androtion, Themistocles), a place is
         a single name (Miletus, Ephesus, Munich), and a king carries a regnal numeral (Agis IV).
         Requiring two capitalised words and refusing those two shapes is what separates "Harriet
         Boyd excavated" from "Gobryas advised", which the verb alone cannot. */
      if (!/\s/.test(nm)) continue;                          // one word: an ancient name or a place
      if (/\b[IVXLC]+$/.test(nm)) continue;                   // a regnal numeral: an ancient ruler
      if (/^(While|When|Where|After|Before|Since|Though|Although|Because|If)\b/.test(nm)) continue;
      if (GL.has(nm.toLowerCase())) continue;                 // a glossary surface: a work, a place, a people
      if (/^(Archaic|Classical|Hellenistic|Athenian|Spartan|Persian|Greek|Roman|Minoan|Mycenaean|Cretan|Ionian|Dorian|Aeolian|Corinthian|Lydian|Egyptian|Phoenician)\b/.test(nm)) continue;
      if (NOT_A_SCHOLAR.has(nm)) continue;
      fails.push(["scholar-in-question", `${id} Q${qi + 1}: “${nm}”`, t]);
    }
  }

  // 8 — the same house rule over the "What came of this" strip. The exemptions are rule 2's, and so is
  // the reasoning; only the verb list is wider. See the note beside ATTRIB_HOW for why it may be.
  for (const e of c.leadsTo || []) {
    const t = plain(e && e.how);
    if (!t) continue;
    for (const m of t.matchAll(ATTRIB_HOW)) {
      const nm = m[1].trim();
      if (ANCIENT.test(nm) || NOT_A_NAME.test(nm)) continue;
      if (/^(While|When|Where|After|Before|Since|Though|Although|Because|If|It|The|His|Her|Their)\b/.test(nm)) continue;
      if (GL.has(nm.toLowerCase())) continue;                 // a glossary surface: a work, a place, a people
      if (NOT_A_SCHOLAR.has(nm)) continue;
      fails.push(["scholar-in-leadsto", `${id} → ${e.id}: “${nm}”`, t]);
    }
  }

  // 3 + 4 + 5
  if (c.image && c.image.src) {
    /* THE KEY IS THE SOURCE FILE, NOT THE THUMBNAIL'S NAME. A thumb URL is
       …/thumb/<a>/<ab>/<FILE>/<width>px-<FILE>, so the last segment normally carries the file name with a
       width prefix — but Commons TRUNCATES a long one to the literal "1920px-thumbnail.jpg", and stripping
       the prefix then leaves every such picture keyed "thumbnail.jpg". Two entirely different pictures
       compare equal, which reported the Hopewell mica face and a 1930s Senate hearing as one photograph.
       The segment BEFORE the width is the real file name and is never truncated; fall back to the last
       segment for a URL that is not a thumb. */
    const parts = String(c.image.src).split("/");
    const wIdx = parts.findIndex((p) => /^\d+px-/.test(p));
    const file = decodeURIComponent(wIdx > 0 ? parts[wIdx - 1] : parts[parts.length - 1])
      .replace(/^\d+px-/, "").toLowerCase();
    if (!imgByFile.has(file)) imgByFile.set(file, []);
    imgByFile.get(file).push(id);
    if (/via wikimedia commons|public domain,|\bCC[ -]?BY\b|\bCC0\b/i.test(String(c.image.desc || "")))
      fails.push(["source-in-caption", `${id}: the description carries its own credit`, String(c.image.desc).slice(0, 120)]);
  } else if (!c.video && !(c.flagCard === true && c.answerFlag && c.answerFlag.src)) {
    /* A FLAG CARD'S PICTURE IS ITS FLAG, and `answerFlag` is a different field from `image` (see the
       FLAG CARDS block in app.js — the format reuses the field a map card already carries rather than
       adding one). Without this the whole Flags collection reports here as unillustrated, which is 233
       notes about the one collection every card of which IS a picture. It is only excused where the
       flag is actually there: a flag card with no flag draws a prompt naming nothing, and `add-card.js`
       refuses one. */
    notes.push(["no-picture", `${id}: ${c.answerText || ""}`, id]);
  }

  // 6
  const per = {};
  for (const s of srcs) { const t = plain(s); for (const [n, rx] of LANGS) if (rx.test(t)) { per[n] = (per[n] || 0) + 1; break; } }
  for (const [n, k] of Object.entries(per))
    if (k > 1 && !SAME_LANGUAGE_OK.has(`${id}|${n}|${k}`))
      fails.push(["same-language", `${id}: ${k} sources in ${n}`, id]);
}

for (const [file, ids] of imgByFile)
  if (ids.length > 1) fails.push(["duplicate-image", `${ids.join(", ")} share one picture`, file]);

/* ---------- 7. a quotation against the book it names ---------- */

const BOOKS = {};
function shelved(id) {
  if (id in BOOKS) return BOOKS[id];
  const f = path.join(ROOT, "books", id + ".js");
  if (!fs.existsSync(f)) return (BOOKS[id] = null);
  const win = { FOLIO_BOOKS_IN: [] };
  new Function("window", fs.readFileSync(f, "utf8"))(win);
  return (BOOKS[id] = win.FOLIO_BOOKS_IN.find(b => b.id === id) || null);
}
for (const c of cards) {
  const q = c.quote;
  if (!q || !q.book) continue;
  const b = shelved(q.book);
  if (!b) { fails.push(["quote-book-missing", `${c.id}: no books/${q.book}.js on disk`, q.book]); continue; }
  const ch = (b.chapters || []).find(x => String(x.n) === String(q.n));
  if (!ch) { fails.push(["quote-section-missing", `${c.id}: ${q.book} has no section ${q.n}`, q.cite || ""]); continue; }
  /* A BARE NUMBER IS THE EDITION'S APPARATUS, NOT THE TEXT.  Several shelved editions run their
     section and verse numbers inline — Herodotus' chapter numbers, the Rigveda's verse numbers —
     and a quotation rightly leaves them out, so comparing the raw strings fails on every
     verse-numbered book.  Both sides drop tokens that are purely digits before matching. */
  /* A WHITESPACE ENTITY IS WHITESPACE, NOT A WORD.  Four of the shelved editions carry literal
     &#32; / &#160; / &#8195; / &#8201; in their HTML — a browser renders them as the spaces they
     are, but stripping TAGS leaves the entity itself standing as a token, so a quotation that is
     verbatim against what the reader sees was reported as "not in the book" (beowulf's prelude
     carries 128 of them).  Decode them before splitting, or the checker cries wolf on the one
     thing it exists to certify. */
  const norm = t => " " + String(t).replace(/<[^>]*>/g, " ")
    .replace(/&#(?:32|160|8195|8201|8194|8202|8239);/g, " ").split(/\s+/)
    .filter(w => w && !/^\d+$/.test(w)).join(" ") + " ";
  const flat = norm(ch.html);
  const said = norm(q.text).trim();
  /* ` … ` is the author saying a gap was cut.  Anything else must be there word for word. */
  for (const part of said.split(" … "))
    if (part && flat.indexOf(part) < 0)
      fails.push(["quote-not-verbatim", `${c.id} (${q.cite || q.book + " " + q.n}): a passage is not in the book`, part.slice(0, 90)]);
}

/* ---------- print ---------- */

const group = rows => {
  const by = {};
  for (const [tag, why, extra] of rows) (by[tag] = by[tag] || []).push([why, extra]);
  return by;
};
const show = (by, head) => {
  for (const [tag, rows] of Object.entries(by)) {
    console.log(`\n${head} ${tag} — ${rows.length}`);
    for (const [why, extra] of rows) { console.log(`  ${why}`); if (VERBOSE) console.log(`      ${extra}`); }
  }
};

console.log(`${cards.length} cards checked${PREFIX ? ` (prefix ${PREFIX})` : ""}.`);
show(group(notes), "note:");
if (!fails.length) { console.log("\nAll card rules pass."); process.exit(0); }
show(group(fails), "FAIL:");
console.log(`\n${fails.length} violation${fails.length === 1 ? "" : "s"}.`);
process.exit(REPORT ? 0 : 1);
