# The Ancient Greece audit, September 2026

The first 500 cards of the Ancient Greece collection (`col-13`, `gr-001`–`gr-500`) audited on
request across nine dimensions: formatting, consistency, chronology, coverage, questions, date
lines, pictures, backgrounds and citations. **What was fixed is listed first; what is still open
is listed after it, with the card ids, because every one of those is a batch of its own.**

Read `docs/greece-card-plan.md` for the running order this collection is written against.

## What the collection is

500 cards fill nine leaf decks exactly and stop at the Athenian Empire, so the covered span runs
from the Aegean Bronze Age to about 431 BCE.

| deck | cards | ids |
|---|---|---|
| Crete and the Cyclades | 55 | gr-001–055 |
| Mycenaean Greece | 55 | gr-056–110 |
| Early Iron Age | 60 | gr-111–170 |
| Polis and colonisation | 60 | gr-171–230 |
| Sparta | 45 | gr-231–275 |
| Athens | 45 | gr-276–320 |
| Archaic art, verse and thought | 60 | gr-321–380 |
| Persian Wars | 70 | gr-381–450 |
| Athenian Empire | 50 | gr-451–500 |

## What passed

These were measured rather than assumed, and none of them needed work.

- **Abstract length.** 270–332 words, mean 311.7, against a 270–330 bar. Exactly one card was over
  (`gr-193`, by two words) and none was under. An earlier count of 33 over-length cards was WRONG:
  it counted the imperial conversions, which the house rules exclude. **Strip `IMPERIAL_PAREN`
  before measuring.**
- **Abstract structure.** All 500 split 5 + 5 across a single block break.
- **Question rules.** `check-questions.js` passes on all 1,500: one sentence, self-contained,
  20–34 words, blank mid-sentence.
- **Question uniqueness.** No two questions in the collection share as much as 42% of their content
  words, and the sibling pairs most at risk — the three Messenian Wars, Harmodius against the
  Tyrannicides, the two royal houses against the dual kingship, Laconia against Lacedaemon — each
  anchor on a fact belonging to one card only.
- **Chronology.** 17 backward jumps of more than 300 years between consecutive cards; every one is
  either a thematic restart inside a period (the Cretan deck runs palaces, then religion, then
  tombs) or one of the five modern-subject cards the brief allows — Evans, Schliemann, the
  decipherment of Linear B, the Homeric Question and the hoplite reform, each placed with the
  period its work bears on.
- **Card-to-glossary pairing.** 500 of 500 answer terms have a glossary entry. (18 appeared to be
  missing and all 18 resolve under a singular or disambiguated key: `Peak_sanctuary`,
  `Liturgy_(ancient_Greece)`, `Histories_(Herodotus)`, `Persians_(play)`.)
- **Citation authorship.** `check-citations.js` reports 0 mismatches against Crossref over every
  checkable work. No invented author or year was found.
- **Plan alignment.** 477 of 500 shipped answers match their planned topic outright; the other 23
  are the plan naming a subject and the card choosing a sharper answer term, which the rules allow.
- **Source language.** 47 of 2,709 citations are non-English (3%), so English is properly
  prioritised.

## What was fixed

- **276 image descriptions carried the source in the caption.** "Olaf Tausch, CC BY 3.0, via
  Wikimedia Commons." — printed under a picture whose credit line already carries the Commons file
  URL, so every one said the attribution twice and spent the caption on it. Raw Commons metadata
  went with it: upload timestamps (one a negative year), archive scan identifiers, truncated
  "Subjects :…" blocks.
- **33 descriptions then said nothing** and were rewritten from the picture itself — each was
  looked at on a contact sheet first. Untranslated German, Spanish, French and Greek; bare file
  titles ("Μόχλος 05", "Bas fourneau"); two empty.
- **14 pictures showed something other than the card** and were removed rather than replaced,
  a wrong picture being worse than none: a Byzantine manuscript for `basileus`, a Viking grave at
  Birka for `warrior burial`, a Swedish gallery grave for `cist grave`, Hecataeus's world map for
  `Cleomenes I`, a Viennese weight of 1756 for `weight standard`, a presentation slide for the
  `Great Rhetra`, a kleroterion for the `Athenian empire`, a 1600s sea chart for the Cypriot
  city-kingdoms, a Carthaginian stater for `Lydian electrum coinage`, a plate of figurines for
  `Mesara tholos tombs`, one French map of Attica used on both `phyle` and `trittys`, a drawing of
  objects on a card about a language, and a cooking pot for `kleos`.
- **116 cards had no date line, and 99 of them now do.** The Athens deck was the worst: all 45
  cards empty, and 42 of them state no year in their prose either, because they are written from
  Aristotle, Herodotus and Plutarch, who date by archon — "in the archonship of Aristaechmus". A
  reader could finish the card on Solon without learning when he lived.
- **13 questions named a modern scholar**, which the collection's own rules forbid absolutely.
  Each keeps its claim and drops the name.
- **One dead citation URL** out of 1,443 (the Acropolis Museum's conservation page for the
  Moschophoros, which moved rather than closed).

## What is still open

### 1. A whole deck rests on one undergraduate course website

**237 citations — 8.7% of the collection's entire apparatus — are Jeremy B. Rutter's *Aegean
Prehistoric Archaeology* at Dartmouth**, across 107 cards, and **39 cards cite it more than twice**.
`gr-056` "Mycenaean civilisation" cites it 8 times out of 10 sources. The brief allows an author
two sources per card.

    gr-056 8/10   gr-013 5/6   gr-046 5/6   gr-049 5/6   gr-001 4/8   gr-011 4/7
    gr-016 4/5    gr-020 4/6   gr-050 4/5   gr-053 4/5   gr-058 4/8
    gr-005 gr-006 gr-010 gr-012 gr-015 gr-017 gr-018 gr-022 gr-025 gr-026 gr-028
    gr-029 gr-030 gr-033 gr-034 gr-035 gr-038 gr-039 gr-042 gr-044 gr-045 gr-048
    gr-051 gr-068 gr-071 gr-087 gr-090 gr-092  (all 3 of 5 or 3 of 6)

Three others of the same shape: `gr-334` (Ernest Gardner 5/9), `gr-189` (ASCSA 4/5), `gr-159`
(Pestarino 4/6), `gr-323` (H. B. Walters 1905, 3/5), `gr-350`/`gr-359` (Smyth 4/9, 3/6).

**ATTEMPTED 2026-09-05 AND BLOCKED BY THIS ENVIRONMENT, measured rather than assumed.** Replacing a
citation means finding another openable work that carries the same claim, and every route was tried:

| route | result |
|---|---|
| OpenAlex API | rate-limited to zero budget: "Insufficient budget… $0 remaining" |
| DOAJ API | answers, but thin for Aegean archaeology — a query for Mycenaean tholoi returns one hit, in a geo-informatics journal |
| Bryn Mawr Classical Review | 502 on every one of its 353 URLs from here, in parallel and singly alike |
| `ascsa.edu.gr` (Hesperia) | connection refused at the root |
| Perseus building records | classical only; Mycenae, Tiryns and Pylos return no Bronze Age record |
| Crossref search | works, but returns mostly paywalled DOIs, which would trade an open apparatus for a closed one |
| archive.org (Hall 1915, Tsountas 1897) | reachable and greppable, but their OCR carries too few page numbers to cite honestly — and a 1915 survey is a century out of date against a maintained specialist teaching site |

The last row is the reason not to force it. Rutter's is a current scholarly resource; swapping it for
Edwardian handbooks would satisfy the rule and make the cards worse.

**RE-MEASURED 2026-09-10, AND THE TABLE ABOVE WAS TOO PESSIMISTIC — THREE ROUTES DO OPEN.** The
first sweep tested seven hosts and stopped; four more answer from here:

| route | result |
|---|---|
| Europe PMC | **open** — 291 open-access hits for Minoan/Cycladic/Aegean Bronze Age, including Knappett 2025, Carter & Kilikoglou 2022 on Melian obsidian, the Thera radiocarbon literature and Clemente et al. 2021 on the Aegean palatial genomes |
| DOAJ | **open, and far richer than the one query tried first reported** — 44 articles for *minoan crete*, 33 for *cycladic*, 17 for the phrase *Aegean Bronze Age*, across *Open Archaeology*, *Documenta Praehistorica*, *Pallas*, *Cahiers Mondes Anciens* and *Heritage*. Each hit's own host must then be tested: De Gruyter and MDPI are shut from here, `journals.openedition.org` and `journals.uni-lj.si` are not |
| Persée (`persee.fr`) | **open, search included** — `/search?ta=article&q=…` returns real article ids over plain HTTP (a nonsense query returns none, which is how it was proved to be a search rather than a suggestions page), and `/doc/<id>` serves the full article. This is BCH, CRAI and Ktèma — the French School at Athens' own record of Malia, Knossos and Phaistos |
| `chs.harvard.edu` | **open** — the Center for Hellenic Studies' full-text book series, Mycenaean texts among them |

**What that changes, and what it does not.** The open literature these four reach is the archaeological
SCIENCE — dating, provenance, isotopes, genomes — and the French excavation record. The Rutter
citations carry something else: the pottery sequences, the palace phasing and the period narrative a
teaching site exists to give. So a substitute has to be found **claim by claim**, and for several of
them there is still nothing openable: `gr-001`'s "the Cyclades held towns of two-storeyed houses by
about 2650 BCE, and the long ships drawn on clay pans needed crews of up to fifty" was searched for
across all four routes and found in none of them.

**The fix is real and still owed** — roughly 60 surplus citations across the 39 cards, each verified
against the claim its marker carries — and it is now a CONTENT PASS rather than a blocked one: a
card at a time, through Persée and DOAJ, keeping Rutter for the claims nothing else states rather
than swapping in a work that does not carry them.

#### The re-sourcing pass: batch log

**BATCH R1 — 2026-09-10. Five cards cleared, 39 → 34.** `gr-011` Phaistos (4 of 7 → 2), `gr-012` Malia
(3 of 6 → 2), `gr-035` Mesara tholos tombs (3 of 5 → 2), `gr-038` Mochlos (3 of 5 → 2), `gr-042`
Akrotiri (3 of 5 → 2). Six citations swapped, each read against the claim its marker carries; no
prose was changed, and every swap kept the source's position in the list so no marker had to be
renumbered.

**FOUR MORE ROUTES OPEN THAN THE TABLE ABOVE RECORDS, and two of them are large.** Re-measured
2026-09-10, with `curl` and a browser user-agent:

| route | result |
|---|---|
| **Cambridge Core** | **OPEN, full text, search included** — this is the *Annual of the British School at Athens*, *Antiquity*, the *Cambridge Classical Journal*, the *Classical Review* and the *European Journal of Archaeology*. A browser UA is required; the bare default gets nothing. Its open-access filter (`filters[openAccess]=true`) is what makes the search usable, and an `/abs/` in a result's path means that one is not open. Judson's ABSA 2023 came back at 19,107 words |
| **AJA Online** (`ajaonline.org`) | **open** — the AJA's own site serves its open-access articles as PDFs where `doi.org` → `journals.uchicago.edu` is 403. This is the way to the articles the collection already cites (Lupack 2011, Schon 2011) and could not otherwise reach |
| **GRBS** (`grbs.library.duke.edu`) | **open, whole back run** — a full OJS instance, so every article page carries `citation_author`, `citation_volume`, `citation_firstpage` and a `citation_pdf_url` in its metadata: a citation can be read off the record instead of composed |
| **BMCR** (`bmcr.brynmawr.edu`) | **OPEN AGAIN** — the table above records 502 on all 353 URLs tried; it answers 200 now. The collection already leans on it |
| Odysseus (`odysseus.culture.gr`) | open, and the index is walkable: `eh351.jsp?obj_id=N` is a site's history and `eh352.jsp?obj_id=N` its description, over a contiguous id range. Phaistos 2363, Gournia 2368, Knossos 2369, Zakros 2376, Tiryns 2382, Malia 2385, Agia Triada 2405/2406, Akrotiri 2410, Glas 2421, Mochlos 2448, Palace of Nestor 2562, Mycenae 2573 |
| `assets.cambridge.org` | **SHUT** (connection reset), which matters because `gr-001`, `gr-006` and `gr-008` cite the Watrous *Minoan Crete* excerpt PDF there. Those three citations are currently unreachable — recorded, not repaired, since it may be transient |
| CORE, OAPEN, MDPI, De Gruyter, Wiley, T&F, ScienceDirect, `academia.edu` | shut. JSTOR still serves a Client Challenge under a 200 |

**THE ONE FINDING THAT GOVERNS THE REST OF THIS PASS: A CHRONOLOGY CITATION CANNOT BE SWAPPED ON THE
STRENGTH OF THE PERIOD NAME.** Rutter's "Chronology Overview" is the single most reused citation here —
it is on 25 of the 39 cards — and on nearly all of them it carries a period date bracket, which looks
like the cheapest possible substitution. It is not, because **the schemes genuinely disagree**.
Déderix, Schmitt & Caloi's Table 1 (*Antiquity* 99, 2025, after Warren 2010) gives Protopalatial as
MM IB–IIB 1900–1700 and Neopalatial as 1700–1430, where the cards, written from Rutter, give the
Protopalatial as about 2000–1750 and the Neopalatial as about 1750–1500, and put the Postpalatial
after about 1470 where Warren's table has a Final Palatial phase first and starts the Postpalatial at
1360. So the substitution is clean on `gr-011` (first palace MM IB, about 1900 BCE — exact) and on
`gr-035` (tholoi first built EM I from about 3000 BCE, and in use "up to a millennium" — both stated
outright), and it is a MISMATCH on `gr-025`, `gr-034`, `gr-048` and `gr-005`, whose brackets differ by
50 to 100 years. **Read the substitute's own table against the card's date line before swapping, and
where they differ, spend the replacement on a different Rutter citation on that card.**

**The three substitutes that did most of the work, and why each was chosen.** Déderix, Schmitt & Caloi
2025 for the Cretan tombs and the chronology table; **the Odysseus site pages**, which turn out to
carry exactly the register a site card states — Phaistos's history gives the palace destroyed in the
15th century, the city inhabited on through the Mycenaean and Geometric periods and destroyed by
Gortyn in the mid-2nd century BCE, which is `gr-011`'s last sentence entire, and Akrotiri's
description names the crocus-gatherers offering to a seated goddess, the monkeys, the boxing children
and the Flotilla frieze, which is `gr-042`'s last sentence entire; and **the INSTAP Study Center's own
Mochlos page**, which states the two monumental tombs' "symbols of rank, including gold diadems and a
silver vessel" and the Neopalatial town "laid out with distinct blocks of houses separated by paved or
bedrock streets". **An institution is not a scholar** (`check-cards.js` counts them separately), so an
Odysseus page is a legitimate substitute for the rule this pass is clearing — but it is a real source
only where it states the claim, and on the destruction DATES it repeatedly does not: it gives Zakros
and Malia c. 1450 BCE where the cards say about 1470.

**What is queued, and what each still needs.** `gr-056` Mycenaean civilisation (8 of 10, the worst on
the shelf) is half solved: **Middleton's review article in *Antiquity* 98 (2024) carries the collapse
sentence outright** — Mycenae, Tiryns, Thebes and Pylos, and Maran arguing for a combination of causes
"rather than any sudden single 'silver bullet' cause" — and **Lupack's AJA 2011 carries the Linear B
society sentence**, giving the wanax as king, te-re-ta as officials holding land and the damos holding
ke-ke-me-na land in common. Still unfound for it: the shaft-grave metalwork's Minoan character, the
tholos sequence beginning in Messenia, the Cyclopean fortifications at about 1250, and the Cape
Gelidonya cargo. Beck's *GRBS* amber series carries the Baltic attribution but not a date, so the
"amber coming south from about 1700 BCE" clause has no substitute yet. `gr-013` Zakros (5 of 6) has
Odysseus for its cult rooms and its town plan but nothing yet for the oxhide ingots or the Late
Minoan IB horizon; the ABSA article that would carry both is one of the `/abs/` paywalled ones.

**BATCH R2 — 2026-09-10. Five more cleared, 34 → 29; over-cited 111 → 106.** `gr-017` Palace
storerooms (3 of 6 → 2), `gr-018` Minoan palace economy (3 of 6 → 2), `gr-028` Peak sanctuaries
(3 of 5 → 2), `gr-029` Cretan cult caves (3 of 5 → 2), `gr-058` Mycenae (4 of 8 → 2).

**THE SCAN THAT MAKES THIS TRACTABLE, and it is worth running before any further batch.** Count the
MARKERS each Rutter citation on a card carries. Most of the cards need only one substitution, and most
of them have a Rutter source carrying exactly ONE marker — which is the cheapest possible swap, because
the claim to be re-sourced is a single sentence and the replacement keeps the source's position, so no
marker is renumbered and no other sentence is touched. Measured over the 34 remaining: 22 need one
substitution, and all but `gr-005`, `gr-006`, `gr-015`, `gr-020` and `gr-092` have a single-marker
Rutter to spend it on.

**Two sources did the work here and both are worth reaching for again.** **Christakis's contribution
to the AJA's 2011 *Redistribution in Aegean Palatial Societies* forum** is Minoan palace storage and
the redistribution argument entire, and the whole forum is AJA Open Access — Galaty, Nakassis and
Parkinson's introduction at `ajaonline.org/forum/867`, Christakis on Crete at `/870`, Lupack at `/871`
and Schon at `/872`. **Middleton's *Antiquity* review carries the Mycenaean destructions by name** —
Mycenae, Tiryns, Thebes and Pylos — which is `gr-058`'s last sentence and half of `gr-056`'s.

**AND CHRISTAKIS COST TWO SENTENCES A SMALL REWRITE, which is the honest half of this pass.** Rutter's
Lesson 11 gives the redistribution argument as a contest between "a countryside specialising in oil and
wine" and "trade and on wool, cheese and hides"; Christakis contains none of those six words. What he
does state is the contest the field actually has — palaces as "centralized redistributive agents,
reallocating wealth to the community as a whole and providing security in times of crisis" against
palaces as mobilisers of wealth "meant to serve the exclusive needs of the elite" — so `gr-017` and
`gr-018` now say that instead, and each sentence rests on a work that carries it. **Where the substitute
will not bear the clause, rewrite the clause rather than moving the marker onto it.** Both cards stayed
inside the 270–330 word band (`gr-017` 320 → 323, `gr-018` 310 → 316).

**A TOOLING FAULT FOUND AND FIXED IN PASSING, because it blocks this whole pass.** `add-sources.js`
read `data.js` through its own `loadWindow` — a bare `new Function` — where a card's abstract, sources,
`why`, `quote` and `image` now live in `data-extra/<prefix>.js` and are merged back by a loader inside
`data.js` that needs `require` and `__dirname`. A `new Function` body has neither, so the merge silently
did nothing and every abstract came back `undefined`; the tool then refused the batch, reporting **"card
gr-028 has no footnote marker in its abstract"** on a card whose abstract is full of them. It ran
correctly only from `node -e`, where those two names happen to be global — an accident, and the reason
the first batch went through. It reads through `card-io.js` now, which is what `data.js`'s own comment
says a helper must do. **The message names the wrong thing entirely, so the next session would have gone
looking at the card.**

**BATCH R3 — 2026-09-10. `gr-056` cleared, and two more; 29 → 26, over-cited 106 → 103.** `gr-039`
Pseira (3 of 5 → 2, INSTAP's own Pseira project page), `gr-071` Gla (3 of 5 → 2, Middleton for the
destruction) and — **the worst card on the shelf — `gr-056` Mycenaean civilisation, 8 of 10 → 2.**

**THE SOURCE THAT MADE `gr-056` POSSIBLE IS A MUSEUM, AND IT WAS THE LAST PLACE LOOKED.** The National
Archaeological Museum in Athens publishes a page on its Collection of Mycenaean Antiquities
(`namuseum.gr`, open) which carries, in a few hundred words, six of the eight claims that were resting
on the teaching site: the Mycenaean world at 1600–1100 BC and "called after its largest centre, Mycenae
in the Peloponnese"; the royal shaft graves of Grave Circles A and B; the palaces of Mycenae, Tiryns,
Pylos and Thebes as "administrative, economic, military and religious centres" behind "strong Cyclopean
walls"; the beehive tombs kept for the ruling elite; an administration "led by the 'anax' (king)"
keeping "archives … of clay tablets inscribed with Linear B script, the first Greek script"; and a
collapse put down to social unrest, economic decline, migration and earthquake. **A national museum's
own collection page is written at exactly the altitude a survey card is**, which no journal article is,
so the museum and Odysseus family is what to reach for FIRST on a card that surveys a period rather
than a site.

**What `gr-056` cost, stated plainly.** Six sentences were adjusted so each says what its new source
says, and five specifics went with them: the tholos sequence beginning in Messenia; the palaces dated
from about 1400 BCE with Gla, Orchomenos and Athens among them; the fortifications finished about 1250;
the archive list with Chania and the figure of 3,369 tablets at Knossos; and the *lawagetas*, the one
title of the four that no open work found here defines. Everything else survives, the card is 316 → 303
words and still ten sentences in two blocks, and it now rests on ten sources of which two are Rutter —
kept deliberately for the two claims nothing open states: the shaft-grave metalwork's Minoan character,
and the Baltic amber with the Cape Gelidonya wreck. **That is the trade this pass makes and it should be
made with the eyes open: a card loses specifics that were resting on one course website and gains an
apparatus a reader can check.** Where a specific is worth more than the citation, keep Rutter.

**Sources that did NOT work, so the next batch need not re-try them.** Harding's *Studia Hercynia* 2022
review of Mycenaean–European contact is historiography and states no date for amber reaching Greece;
Beck's *GRBS* amber series establishes the Baltic attribution and gives no chronology; the open-access
ABSA article on Aghios Vasileios contains `wanax` seven times and *lawagetas* not once; and
`heraklionmuseum.gr` and `ascsa.edu.gr` both fail TLS verification from here where `namuseum.gr` does
not. **No Cape Gelidonya source was found at all**, and the ABSA articles on oxhide ingots that would
carry both it and `gr-013`'s ingots are behind the `/abs/` paywall.

**BATCH R4 — 2026-09-10. Eight cards; 26 → 18, over-cited 103 → 95.** `gr-010` Throne Room, `gr-013`
Zakros (5 of 6 → 2), `gr-022` Minoan frescoes, `gr-026` Marine Style, `gr-044` Flotilla fresco,
`gr-045` Theran tephra, `gr-050` destruction of the Minoan palaces (4 of 5 → 2), `gr-068` Palace of
Nestor.

**THE CHRONOLOGY ROUTE IS NOW EXHAUSTED, and it is worth writing down which way.** Batch R1 established
that Rutter's "Chronology Overview" — the most reused citation of the 39 — cannot be swapped on the
strength of the period name. Every remaining card carrying it was checked against Déderix's Table 1 and
only ONE matches: `gr-049`'s "Middle Minoan IA, around 2000 BCE". The rest (`gr-005`, `gr-006`,
`gr-010`, `gr-022`, `gr-025`, `gr-030`, `gr-034`, `gr-048`, `gr-051`, `gr-053`) are 50 to 100 years
apart from Warren 2010 because the cards were written from Rutter's scheme. **Do not re-run that
comparison; it has been done card by card.**

**WHAT REPLACED IT IS THE ERUPTION LITERATURE, WHICH DATES THE PERIODS BY DOING SOMETHING ELSE.**
Manning's *PLOS One* 2022 paper on the Thera date is open, and because its whole subject is the high-
against-low chronology argument it states in prose what the cards' chronology markers assert: that the
eruption falls "late in, or at the end of, the Late Minoan (LM) IA cultural period"; that airfall Theran
tephra is found at Trianda on Rhodes; and that "the LMIB period on Crete famously ends in a set of
well-known destructions at a number of sites", placed "in the mid-15th century BCE". **That one paper
carried five of this batch's eight** — `gr-010`, `gr-026`, `gr-044`, `gr-045` and `gr-050` — and it is
the first substitute in this pass that reaches the period framework rather than a site or an object.
**Reach for the dating literature when a chronology marker needs replacing**, not for a chronology
table: a paper arguing about a date has to say what the date is a date OF.

**AND A SITE CAN CARRY ITS OWN CARD TWICE, WHICH IS WHAT UNLOCKED `gr-013`.** Odysseus publishes a
site's HISTORY and its DESCRIPTION at two addresses (`eh351` and `eh352` on the same `obj_id`), and the
collection already cites both for the Palace of Nestor. Zakros needed three substitutions and has only
one obvious institutional source; taking both pages plus Manning made three. The description carries the
west wing "devoted to religious activity" with its eleven-room shrine, the palace "surrounded by the
town", and that after its destruction "it was not rebuilt"; the history carries the two building phases
and the destruction "along with the other centres of Minoan Crete". **Where a site card needs more than
one substitute, the two Odysseus pages are two sources, not one.**

**Two small prose edits, both losses worth naming.** `gr-022` gave up "Phylakopi on Melos and" from its
travelling-frescoes sentence, Odysseus carrying Akrotiri and nothing carrying Melos. `gr-068` gave up
"1,107 clay tablets … by 32 different scribes, the most substantial collection anywhere on the mainland"
for "about a thousand Linear B texts … the work of some thirty to forty different scribal hands" —
which is what Judson's open ABSA article actually publishes ("the majority of the c. 1000 Linear B texts
from this palace"; "c. 30–40 identified scribal hands at this site"). **The precise figure was the more
impressive and the range is the one a specialist will defend.**

**Searched for and not found, so the next batch need not repeat it.** No open source states the position
of the Throne Room within the Knossos palace; the Cambridge open-access ABSA report on the Middle and
Late Minoan tombs south of the palace contains neither "shaft-niche" nor "warrior grave", so `gr-051`'s
mainland-form tombs are still unsourced; Odysseus's Tiryns pages mention no fresco and no chariot, which
leaves `gr-087`; the National Archaeological Museum's page on the silver Battle Krater carries the krater
and not the Siege Rhyton, so `gr-090`'s sentence cannot be moved whole; and Christakis, who carried
`gr-017` and `gr-018`, never mentions Kamares, so he cannot carry `gr-025`.

### 2. Seventy-six cards rest mostly on one ancient witness

An ancient author is a witness rather than a researcher, so this is a softer finding — but a card
whose every source is one work is a card with one point of view. Two are at 100%: `gr-475` First
Peloponnesian War (8 of 8 Thucydides) and `gr-320` Athens and Aegina (6 of 6 Herodotus). Then
`gr-306` 8/9, `gr-304` 6/7, `gr-439` 6/7, `gr-467` 6/7 (Plutarch), `gr-481` 6/7, and seventy more
at half or above — concentrated in the Athens deck, where the *Athenaion Politeia* carries 4 of 5
sources on a dozen cards.

### 3. The Athens and Sparta decks paraphrase their sources instead of explaining

This is the same finding as 1 and 2 seen from the reader's side, and it is the most substantive
thing in the audit. `gr-286` Solon contains no date, no mention of 594 BCE, and tells the reader
"the archonship of Aristaechmus" and "the fourth year after the tyrants fell". The register is
Aristotle's, not a fifteen-year-old's. The date lines are now supplied; **the prose still needs a
pass for register and for the plain facts a newcomer needs** — who, when, where, and why it
mattered — across roughly `gr-276`–`gr-320` and much of `gr-231`–`gr-275`.

### 4. Modern scholars in the backgrounds

The brief allows one per background, and only where that scholar named the card's term. Cards
naming two or more: `gr-170` (five — Snodgrass, Morris, Scheidel, Osborne, Lane Fox), `gr-144`
(four), `gr-154`, `gr-160`, `gr-171` (three each), and `gr-147` `gr-149` `gr-152` `gr-156`
`gr-164` `gr-165` `gr-172` `gr-133` (two each). About 25 more name exactly one scholar who did not
name the term. `gr-007`, `gr-057`, `gr-075` and `gr-129` are exempt — the scholar is the subject.

**`card-focus.js` cannot see any of this.** It takes the names it looks for from the author
positions of each card's own citations, so a scholar named in the prose but not cited on that card
is invisible to it. It reported one card needing revision; an independent sweep found thirteen in
the questions alone.

### 5. Eight cards carry more than one source in the same non-English language

All French, and all natural — the École française d'Athènes dug these sites: `gr-012` (3),
`gr-195` (3), `gr-015`, `gr-017`, `gr-019`, `gr-040`, `gr-042`, `gr-336` (2 each).

### 6. Pictures that are maps, plans or engravings where a photograph exists

Not wrong, but against the preference for a real photograph: `gr-001` `gr-009` `gr-057` `gr-064`
`gr-067` `gr-071` `gr-097` `gr-101` `gr-103` `gr-105` `gr-106` `gr-107` `gr-143` `gr-148` `gr-199`
`gr-203` `gr-218` `gr-231` `gr-240` `gr-272` `gr-284` `gr-335` `gr-341` `gr-372` `gr-379` `gr-445`.
`gr-231` Sparta is the one to fix first: a city card carrying an 18th-century survey map when
`gr-264` beside it has a photograph of the ruins.

Seven pairs of cards also share one picture: `gr-200`/`gr-437`, `gr-201`/`gr-384`,
`gr-226`/`gr-383`, `gr-303`/`gr-364`, `gr-390`/`gr-417`, `gr-082`/`wh-279`, `gr-223`/`rm-043`.

### 7. Questions that lead with a curiosity instead of the defining fact

Each card carries three phrasings and Multiple Choice always asks the first, so this is cheap to
fix by reordering — except where none of the three is plain. `gr-495` Parthenon: not one of its
three phrasings says it is the temple of Athena on the Acropolis. `gr-371` Pythagoras is clued from
a story about a beaten puppy, and its second phrasing says he was *not* the mathematician.
`gr-163` Olympia is clued from the date of its earliest wells. `gr-467` Pericles from the shape of
his head. All four are difficulty 1 or 2 — the terms a newcomer is likeliest to meet cold.

## What was implemented on 2026-09-05, in the same pass

| item | done |
|---|---|
| glossary terms | 19 of the ~40 measured added, at the 90-110 word and two-source bars — the Constitution of the Athenians first, then the temple vocabulary and the money |
| scholars in backgrounds | all 16 cards rewritten; Snodgrass, Parry and Woolley keep the one mention the rule allows them |
| archon-datings | all 12 Athens cards now give the year beside the archon |
| coverage | 2 gaps filled by amending unwritten plan slots; the other 7 recorded as permanent, with the deck each belongs to |
| pictures | gr-231 Sparta given a photograph in place of an 18th-century map |
| Library quotes | 3 cards linked to the shelved primary text, against 1 before |
| citation concentration | **not done** — every route measured and blocked; see the table above |

**A second batch shipped the same day**, from the ten suggestions asked for beside the audit:

| item | done |
|---|---|
| a checker for what no tool sees | **`.claude/check-cards.js`**, seven checks — an author over-cited, a modern scholar named in a question, one picture on two cards, a caption carrying its own credit, a card with no picture (reported, never failed), two sources in one non-English language, and a `card.quote` against the book it names. Report-only by hand; deliberately not in the CI fast gate, since checks 1 and 6 carry the blocked backlog above |
| undatable flags | 18 more cards flagged — acropolis, agora and Attica are inside the games' bar, the other fifteen belt-and-braces against a later re-rating |
| orphan topics | 2 folded into neighbouring prose on sources those cards already cite (Daedalus into `gr-332`, Chania into `gr-051`); the chamber tomb deliberately not, and the plan now says why |
| questions that bury the lead | 12 rewritten so the FIRST phrasing is the plain defining one, Multiple Choice always asking that one; the anecdote moves down the pool on nine of them |
| duplicate pictures | all 5 pairs retired — `gr-200` re-pictured, the other four borrowers left with an empty frame and the reason recorded |
| locators | 16 added, 10 of them battles that draw crossed swords; 59 → 76 of the 500 |
| Library quotes | 7 more, so 11 of the 500 quote the shelved text — and the check above caught `gr-467`'s already-shipped quotation joining two passages 200 words apart with no ellipsis |

**The terms still owed**, in usage order: panoply, cuirass, temenos, peplos, chiton, himation,
triglyph's siblings abacus and volute are in, then othismos, autonomia, arete, nomos, metropolis,
hypomeiones, ta-ra-si-ja, lapis primus, aniconic, crucible, relieving triangle, circuit wall,
postern, bastion, and the two works cited by title with no entry, Aristotle's *Politics* (9 cards)
and Tyrtaeus' *Eunomia* (2).

## Coverage: what is missing from the covered span

Most apparent gaps are scheduled later — Delos (gr-867), Dodona (gr-982), the Panathenaia
(gr-986), the City Dionysia (gr-588), metics (gr-510), slavery (gr-511) — and the Myth and Religion
deck holds the Olympians, the heroes and the festivals. **Checked against the plan, these are the
genuine gaps inside the Bronze Age to 431 BCE span:**

- **The other three crown games.** `gr-228` defines the Panhellenic sanctuary and `gr-229`/`gr-230`
  card the Olympics, but the **Pythian, Isthmian and Nemean games** — founded 582, 582 and 573 BCE,
  the rest of the *periodos* — are carded nowhere.
- **The Delphic amphictyony and the First Sacred War**, the institution that ran Delphi and the war
  that made it Panhellenic.
- **Chania / Kydonia**, the third Cretan palace centre with a Linear A and Linear B archive, absent
  where Zakros, Malia, Gournia, Mochlos, Pseira and Petras are all carded.
- **The chamber tomb**, the commonest Mycenaean grave form, where the shaft grave and the tholos
  each have a card.
- **The Daedalic style**, the phase of sculpture that precedes the kouros.
- **Anemospilia**, the site behind the whole argument about Minoan human sacrifice.
- **Orchomenos and the Treasury of Minyas**, the Boeotian counterpart to Mycenae's tholos.
- **Archaic Thessaly** and **archaic Megara** (carded only through its colony, Megara Hyblaea).

## Terms worth adding to the glossary

Measured: used in the Greece prose, no entry under any key or alias. Ranked by how many cards use
each.

| cards | term | note |
|---|---|---|
| 38 | **Constitution of the Athenians** | the most-cited work in the collection has no entry at all; also written "Athenian Constitution" on 8 more cards, so the entry wants both as aliases |
| 14 | terracotta | |
| 8 | libation · mina | |
| 7 | stoa · drachma · obol | |
| 6 | cella · talent | |
| 5 | panoply | |
| 4 | architrave · cuirass | |
| 3 | pronaos · opisthodomos · stylobate · ashlar | the temple vocabulary of gr-341–343 |
| 2 | hypomeiones · ta-ra-si-ja · lapis primus · triglyph · echinus · peplos · temenos · aniconic · crucible · relieving triangle · circuit wall · stater | |
| 1 | entasis · volute · himation · chiton · postern · bastion · othismos · autonomia · arete · nomos · metropolis | |

`Politics` (Aristotle, 9 cards) and `Eunomia` (Tyrtaeus, 2) are the other two works cited by title
with no entry behind them.

**BATCH R5 — 2026-09-10. Six cards; Rutter 18 → 12, over-cited 95 → 89.** `gr-025` Kamares ware,
`gr-030` horns of consecration, `gr-033` Ayia Triada sarcophagus, `gr-034` larnax, `gr-053` Postpalatial
Crete (4 of 5 → 2), `gr-087` Mycenaean chariot. Five clear rule 1 outright; `gr-030` clears Rutter and
keeps a second finding of its own, for the reason set out below.

**BRYN MAWR CLASSICAL REVIEW IS OPEN AGAIN, AND THE NOTE AT THE FOOT OF THIS FILE SAYING OTHERWISE HAS
BEEN CORRECTED.** It answered 502 on all 353 URLs when this audit was written and answers 200 now,
search included (`bmcr.brynmawr.edu/?s=<query>`). That single change carried four of this batch's six
substitutions, because a BMCR review is the one instrument this pass had been missing: it is open, it is
signed by a named specialist who is not the book's author, and it summarises exactly the survey-level
claims a Folio card makes — which the excavation reports that ARE open do not, being granular by
design. **Search BMCR before searching anywhere else.** The precedent was already in the collection:
`gr-051` and `gr-053` have cited BMCR reviews since they were written.

**THE THREE REVIEWS THIS BATCH RESTS ON, and what each turned out to carry.** Yannis Galanakis on
*Mochlos IIA* (BMCR 2009.11.12) publishes the receptacle counts for one whole Late Minoan III cemetery —
"26 chamber tombs and 5 pits … one of the largest known LM IIIA-B cemeteries in Crete", used "from about
1400 (LM IIIA1) to 1250 BC (LM IIIB)", with "pithoi … in 18 tombs, chest larnakes in 5, tub larnakes in
4" — which is the whole of what `gr-033`, `gr-034` and `gr-053` were asking Rutter's Lesson 13 for.
Donald C. Haggis on *Knossos: Protopalatial Deposits* (BMCR 2008.05.32) calls Kamares ware "the
notionally 'palatial' pottery par excellence" and names the elite-production reading of the Knossos and
Phaistos fine wares. Anne P. Chapin on *Mycenaean Wall Painting in Context* (BMCR 2016.11.09) carries
the West House chariots at Mycenae, the Boar Hunt fresco at Tiryns, and the Late Minoan III paintings of
Ayia Triada. **One review can serve several cards** — Galanakis serves three here — because what it
states is a fact about a period rather than about one card's subject.

**TWO CARDS TURNED OUT TO BE WRONG, AND BOTH WERE FOUND BY READING THE SUBSTITUTE RATHER THAN THE
CARD.** `gr-030` said "every known figured Minoan fresco is Neopalatial"; Chapin's review describes "the
Late Minoan (LM) III paintings of Ayia Triada", the Great Procession and the Woman and an Altar among
them, so the absolute is false and now reads "figured Minoan fresco is chiefly Neopalatial … with a Late
Minoan III sequel at Ayia Triada". `gr-087` said "in palatial art the horses are shown hitched to
chariots at both Tiryns and Mycenae"; the Mycenae chariots are from the West House, which the same
review names as the evidence that these themes "are now known to have decorated nonpalatial buildings",
so the sentence now says where the paintings actually are. **A substitute read carefully is a
fact-check**, and neither error was visible from inside the card.

**`gr-030`'s SECOND FINDING IS NOT REDUCIBLE AND SHOULD NOT BE CHASED.** With Rutter down to 2 the card
still reports "arthur j. evans in 3 of 6 sources", and that is the rule working correctly on a subject
where the concentration is honest: horns of consecration are Evans's own coinage, his 1901 *Mycenaean
Tree and Pillar Cult* is where the category was defined, and the two Knossos objects the card describes
are published in his own annual reports and nowhere else. Substituting there would mean citing somebody
who is reporting Evans. **Leave it, and leave it recorded**, exactly as Rutter is kept where nothing
else states a claim.

**A PERIOD REPORT CAN CARRY A CLAIM ABOUT A DIFFERENT SITE ENTIRELY.** `gr-053` needed a source for a
sentence naming two shrines, at Knossos and at Gournia, and Evans's own 1903 report (ABSA 9) carries
both: the Shrine of the Double Axes "found with the original arrangement intact", the Dove Goddess
beside the sacral horns (p. 91), and, forty pages earlier, Harriet Boyd's Gournia shrine with "coarse
images of a Goddess rising from a cylindrical base, about which serpents were coiled" (pp. 83–84).
**Read the whole volume, not the page the card already cites**; the Gournia paragraph is in a section
about Knossos.

**Prose losses, named.** `gr-025` gave up "it ranked with seals and ceremonial weaponry among the luxury
goods the palaces had made" for what Haggis actually states about elite production. `gr-030` gave up
Evans's "potsherds rounded as though in running water" for "water-rounded potsherds", to buy the words
the Ayia Triada correction cost. `gr-034` gave up "the commonest container" for "one of the commonest
containers" — which the Mochlos counts make the more defensible of the two — and "after about 1470 BCE",
which its date line still carries. `gr-053` gave up the Knossos shrine's floor area and "stood alone
near the top of the settlement", neither being in Evans. `gr-033` gave up "on the floor".

**Hosts measured on 2026-09-10, beyond the four the pass already had.** OPEN: `bmcr.brynmawr.edu`
(above); `aegeussociety.org`, whose *Aegean Studies* is open but runs to five articles in all;
`degruyterbrill.com` (Open Archaeology). SHUT: `aura.arch.uoa.gr` (connection reset),
`heraklionmuseum.gr` (TLS failure, as before). **DOAJ is thin for Aegean archaeology** — "Ayia Triada
sarcophagus" and "Kamares ware" both return zero — and a bare "Linear A" returns 327,616 results, none
of them about Crete. Cambridge Core's open-access filter is the better index for this subject.

**Searched for and not found.** No open source states the Linear A distribution outside Crete (`gr-020`
[4]: Ayia Irini, Phylakopi, Akrotiri) — the two BMCR reviews of Linear A books, *Aegean Linear Scripts*
and *Minoan Stone Vessels with Linear A Inscriptions*, mention none of the three sites — so `gr-020`
stays over-cited although its other loose marker is solved (Manning carries "no later than Late Minoan
I", the LMIB destructions being "in the mid-15th century BCE"). Burke's AJA article on the Ayia Triada
sarcophagus is genuinely paywalled: `ajaonline.org/article/107/` carries no open-access badge and no
PDF. The *Archaeological Reports* survey Haysom's review points at — Christakis, "Palatial Crete: recent
discoveries & research, 2014–2019", AR 66 — is not open. And **Matthew Haysom, "Minoan Studies",
*Classical Review* 76.1 (2026), IS open (CC BY) and was read in full**: it is a historiographical survey
of the Knossos-hegemony and nature-of-the-palaces debates, and it was not used here only because no card
in this batch makes a claim it states. **It is the obvious first source for `gr-016`, `gr-048` and
`gr-051`**, whose subjects are those very debates.

**BATCH R6 — 2026-09-10. Two cards; Rutter 12 → 10, over-cited 89 → 87.** `gr-051` Mycenaean Knossos,
`gr-090` figure-of-eight shield. A short batch, and the shortness is the finding: **every cheap route is
now spent.** The chronology brackets, the Odysseus site pages, the eruption literature and the BMCR
reviews have each been run to the end of what they can carry, and the ten cards left need a source found
for one particular claim apiece.

**A CAMBRIDGE OPEN-ACCESS EXCAVATION REPORT CARRIES AN ARGUMENT AS WELL AS A DIG.** Hood, Galanakis,
Hughes-Brock, Nafplioti and Preston's Ailias tombs publication (*ABSA* 119, 2024, CC BY) is 100 pages on
four tombs and it also states, in its discussion, that "Hägg and Sieurin believed that the wooden chest
was introduced in the LM II tombs as a mainland-inspired idea" while "Preston considered the use of the
wooden bier/coffin a re-invention or continuation of an earlier tradition at Knossos" — which is
`gr-051`'s own subject, the question of who was running Knossos, in a form the card did not have. It
also reports that strontium testing of "the hypothesis that these people may have originated from the
Argolid on the mainland … yielded negative results", **which is the single most useful modern fact for
that card and did not fit**: the card is at 324 of 330 words. Recorded here so the next prose pass on
`gr-051` knows where to spend the room if any is ever freed.

**A MUSEUM'S EXHIBIT-OF-THE-MONTH PAGE IS A CITABLE OBJECT RECORD.** The National Archaeological
Museum's Unseen Museum page for the silver Battle Krater gives Schliemann's 1876 excavation and the
scene — two groups fighting over a fallen man — which is more than `gr-090` said and better anchored.
**The loss is named**: the sentence gave up the silver siege rhyton, which nothing openable describes;
`gr-044` still carries it, so it is not lost from the collection.

**What is left, and why each is stuck.** `gr-001` (2 needed) — no open source for the Early Cycladic
longboats or the two-storeyed towns; the BMCR review of *Horizon: A Colloquium on the Prehistory of the
Cyclades* is about Keros and Dhaskalio and mentions no boat. `gr-005`, `gr-006` — the Early Minoan and
Minoan brackets, 3100–2000 and 3100–1050, which Déderix's Table 1 puts at 3000–2050 and cannot carry.
`gr-015`, `gr-016` — no single-marker Rutter citation to spend, so a substitute would have to carry
three or four claims at once. `gr-020` (1 of 2 solved) — nothing states the Linear A distribution
outside Crete. `gr-046`, `gr-049` — three substitutions each against two spendable markers. `gr-048` —
Haysom's open review is about the Knossian hegemony debate and not the thalassocracy. `gr-092` — nothing
open states that the Vapheio cup shape is common in the Cycladic repertoire; Mathioudaki's open *Aegean
Studies* paper mentions Vapheio cups only as a Knossian ripple-ware phase marker.

**The four remaining authors after Rutter.** Once these ten are settled the concentration list is
William Smith (13 `rm-` cards), James Legge (11 `cnh-`), and a tail of three or fewer per author.

**BATCHES R7–R8 — 2026-09-10. Seven cards; Rutter 10 → 3, over-cited 87 → 80.** `gr-005` Early Minoan
Crete, `gr-006` Minoan civilisation, `gr-015` Protopalatial period, `gr-016` Neopalatial period, `gr-020`
Linear A, `gr-048` Minoan thalassocracy, `gr-092` Vapheio cups. R6 said every cheap route was spent; it
was wrong, and the route it had missed is the largest one in this whole pass.

**OAPEN IS OPEN, AND IT IS FULL-TEXT SCHOLARLY MONOGRAPHS.** `library.oapen.org` answers, its REST API
takes a plain query (`/rest/search?query=Minoan&expand=metadata`), and every book carries a
**pre-extracted `.pdf.txt` bitstream** — so a 300,000-word monograph is one `curl` and a `grep` away, with
no PDF extraction at all. Ask `/rest/search?query=handle:"20.500.12657/<n>"&expand=bitstreams` for the
download links. Four books fetched in one afternoon came to ~620,000 words of open Aegean scholarship.
**This is where the next session should start, on any collection.**

**THE ONE THAT SETTLED FIVE CARDS IS A CHRONOLOGY TABLE.** Graziadio's *The Aegean and Cyprus* (Edizioni
Ca' Foscari, 2025) opens chapter 2 with a comparative table of Cretan and mainland phases with absolute
dates after Manning 2010 — Pre-Palatial EM I **3100–2650**, EM II 2650–2200, EM III 2200–2100/2050, MM IA
2100/2050–**1925/1900**, Protopalatial MM IB 1925/1900–1875/1850, MM II 1875/1850–**1750/1700**,
Postpalatial LM IIIC 1200/1190–**1075/1050**. Those are the cards' own figures, to the year in several
places: `gr-006`'s "from about 3100 to 1050 BCE" needed **no rewording at all**, and `gr-015`'s "given as
1925 or 1900 for the opening" is the table's own MM IB entry. **R4 concluded that the chronology route was
exhausted because Déderix's Table 1 (after Warren 2010) is 50–100 years off the cards; the answer was not
that no open table matches but that the WRONG open table had been tried.** Where a card is written from
one scheme, look for a work that prints that scheme rather than reading the mismatch as a dead end.

**TWO CARDS WERE CORRECTED TO THE TABLE.** `gr-005`'s date line now reads EM II c. 2650–2200 and EM III
c. 2200–2050 where it read 2650–2150 and 2150–2000, and its prose closes at 2050 rather than 2000;
`gr-015`'s alternative close moves from 1720 to 1700. Both were Rutter's alternative column, and both are
now the column the card's own citation prints. **A date line is not marked, so nothing in the pipeline
would have caught the contradiction** between a prose bracket sourced to one scheme and a date line
carrying another; check it by hand when a chronology marker moves.

**AND ONE CARD WAS SIMPLY WRONG.** `gr-020` said "only three places outside Crete have produced true
texts: Ayia Irini on Kea, Phylakopi on Melos and Akrotiri on Thera". Philippa Steele's *Exploring Writing
Systems and Practices in the Bronze Age Aegean* (Oxbow, 2024, open at OAPEN) writes that "inscriptions
including administrative documents have also been found outside Crete in the islands (Kea, Melos,
**Samothrace** and Thera)". Four, not three. That plus Manning on the mid-15th-century destructions
finishes the card R6 recorded as blocked on exactly this claim.

**A GERMAN DISSERTATION IS A SOURCE LIKE ANY OTHER, and it was the only one for the villas.** Adlung's
*Die Minoischen Villen Kretas* (Hamburg University Press, 2020) is a whole book on the buildings `gr-016`
spends three sentences on: it gives the villa as a *Mittelstufe zwischen den Palästen und Bürgerhäusern*,
places Vathypetro and Sklavokampos at 497 and 422 m on the edges of upland plateaus, records that
Dickinson doubted their isolation at all, and puts the lustral baths and the *Minoische Hallen* across the
island. **The card is better for saying the isolation is argued** than it was for asserting it.

**AND ONE BOOK WAS FOUND AND REFUSED.** OAPEN's top hit for "Minoan" is *Matriarchy in Bronze Age Crete: A
Perspective from Archaeomythology and Modern Matriarchal Studies*, which does carry a usable sentence
about 3100 BC as the Neolithic–Bronze Age boundary on Crete. It is not cited. **An aggregator returns
books of very uneven standing, and a citation is read by the reader who follows it**: a title announcing
an archaeomythological thesis in the apparatus is not an improvement on a course website, whatever the
sentence it happens to carry. Read the title and the press before citing.

**THE LAST THREE, and what each is stuck on.** `gr-001` Aegean Bronze Age (4 of 8) — nothing open states
the Early Cycladic longboats with crews of fifty or the two-storeyed towns of 2650 BCE; Graziadio mentions
'frying pans' once, in passing, about mainland pottery parallels. `gr-046` Minoan trade with Egypt (5 of
6) — needs three substitutions and Graziadio can supply at most two before tripping the same rule in his
own name; his ostrich eggs are Cypriot tomb goods rather than Cretan rhyta, and his Kommos is about
Cypriot copper, so taking it would cost the card Egypt, the Levant and Italy on a card about Egypt.
`gr-049` Minoan Kythera (5 of 6) — Graziadio carries the Minoanisation contrast and the MM IA date, which
is two, and nothing open found carries the *lapis Lacedaemonius* trade, the Kythera chamber tombs or the
Late Minoan IB painting styles at Kastri. **All three want a source found for one particular claim, not a
wider search.**

**BATCHES R9–R10 — 2026-09-10. Two cards; Rutter 3 → 1, over-cited 80 → 78.** `gr-001` Aegean Bronze
Age, `gr-049` Minoan Kythera (5 of 6 → 2). **THE RUTTER PASS IS FINISHED AT 38 OF 39.** One card is left
and it is left deliberately; the reason is set out at the end of this entry.

**A BMCR REVIEW OF A SITE REPORT CAN CARRY A CLAIM ABOUT A DIFFERENT ISLAND.** `gr-049` was recorded in
R6 and R8 as blocked on the *lapis Lacedaemonius* trade, the Kythera tombs and the Late Minoan IB
painting styles. What settled it was Daniel Pullen's review of *Ayios Stephanos* (BMCR 2009.09.08), a
site on the **Laconian coast** and not on Kythera at all: it states that Ayios Stephanos's "proximity to
the famous lapis lacedaemonius quarry" made it "most likely the entrepôt for its exportation, most likely
to Kastri on Kythera and from there to the wider world", records a Linear A sign in its catalogue, and
quotes Janko's judgement that the place was "neither a Minoan colony such as Kastri [on Kythera] nor a
heavily Minoanised settlement like Phylakopi" — which carries three of the card's sentences at once.
**Search the sites a card's subject TRADED WITH, not only the subject.**

**AND A THEORY IS BEST CITED TO THE MAN WHOSE THEORY IT IS.** `gr-049` reported Evans's reading of the
Shaft Graves through Rutter's lesson on them; it now cites Evans's own *The Shaft Graves and Bee-hive
Tombs of Mycenae and Their Interrelation* (1929), which is on archive.org and says it in his own words —
conquerors "more set on bringing armourers and goldsmiths than potters in their train". **The scan's page
numbers cannot be read reliably** (the OCR of the running heads is broken), so the citation carries none
rather than one composed from a character offset.

**Graziadio's Broodbank–Kiriatzi paragraph replaced a sentence and improved the card.** `gr-049` said its
dead "were laid in chamber tombs, and both the tombs and the goods put in them are thoroughly Minoan";
it now says that the Minoans of Kythera "have lately been recast not as invaders but as friendly
newcomers who lived peaceably beside the people already there", which is what the open literature
actually argues and what makes the Evans sentence after it mean something.

**`gr-001` COST A CLAUSE AND IS WORTH RECORDING AS THE SHAPE OF THAT TRADE.** Its chronology citation
went to Graziadio's table with no rewording at all; its second substitution took the sentence "the
palaces … called for trained masons and workforces far larger than anything the island had assembled
before" down to the date alone, because nothing open found states the labour claim and Adlung — the one
book on Minoan building on the shelf — has no word for workforce in it. **A vivid clause was traded for a
citation that holds.** Say so when it happens; do not let it pass as a tidy-up.

**`gr-046` MINOAN TRADE WITH EGYPT IS LEFT AT 5 OF 6, ON PURPOSE, AND THIS IS WHAT RULE 2 LOOKS LIKE.**
It can be cleared. Judith Weingarten's review of Koehl's *Aegean Bronze Age Rhyta* (BMCR 2009.04.04) is
open and rich — rhyta are "the only Aegean vessels that were adopted for ritual use in Egypt, Cyprus and
the Levant", thirteen Egyptian imitations are catalogued, four from Tel el-Dabʿa "clearly based on LM IA
prototypes" — and Graziadio carries the card's Levantine-intermediary sentence word for word. Two
substitutions from Weingarten plus one from Graziadio takes Rutter to 2. **The price is the card's two
best facts**: the ostrich-egg rhyta, which nothing open describes, and the Minoan genius as a reworking
of Ta-weret, which Graziadio mentions as a figure holding an ewer and never derives from Egypt. Two
sentences of rhyton typology in their place is a worse card. **And a third claim is not merely
unsourceable but contested**: the card dates the Kahun and Harageh pottery MM IB–IIA, where Graziadio
reports Caloi's conclusion that everything exported to Egypt is *later than MM IIA* — so re-sourcing the
sentence would mean changing what the card says and its date line with it, on the strength of one open
book against a summary that reads the evidence differently. **Left as it is, with the disagreement
recorded here rather than resolved by whichever source happens to be open.**

**BATCH R11 — 2026-09-10. THE FIRST ROME BATCH: seven cards, William Smith 13 → 6, over-cited 78 → 71.**
`rm-096` collegiality, `rm-131` cursus honorum, `rm-132` praetorship, `rm-134` Lex Poetelia, `rm-141`
Roman expansion in Italy, `rm-145` Latin rights and `rm-149` Latin colony. **Three OAPEN volumes carried
all seven**, and the finding is that a Rome batch is cheaper than a Greece one: where the Aegean cards
each needed their own excavation report, the Republic's institutions are covered by a handful of open
edited volumes whose chapters are exactly the survey pitch a card is written at. The three are
*Romans at War*, ed. Armstrong and Fronda (Routledge, 2020) — five of the seven substitutions, from
Drogula's chapter on the institutionalization of warfare, VanDerPuy's on debt and Roselaar's on ager
publicus — *Running Rome and Its Empire*, ed. Lopez Garcia (Routledge, 2024), and *How Republics Die*,
ed. Vervaet, Rafferty and Dart (De Gruyter, 2025).

**TWO CORRECTIONS, AND BOTH ARE THE 19TH-CENTURY HANDBOOK BEING OVERTAKEN RATHER THAN CONTRADICTED.**
`rm-141` said the settlers of a colony took "usually a third of the land", which is Smith's *Colonia*
and is still what most modern summaries repeat; Roselaar's own footnote says it outright — one-third or
one-half "is often considered the standard amount taken by the Romans", but Frusino in 303 "is actually
the only one in which one-third is specified". The card now says a third is often claimed and that one
case names it. And `rm-132` gave the whole of Livy's account of 367 BCE, in which the praetorship is the
patricians' price for the consulship; Drogula reads the same reform as a military one, making a college
of three annual commanders of whom two came to be called consuls — which is the more interesting claim
and the one the card now carries beside Livy's.

**A THIRD CLAIM WAS WITHDRAWN RATHER THAN RE-SOURCED, and that is worth naming as its own outcome.**
`rm-131` said that "from the First Punic War the cost of the public games fell on the aediles instead of
the treasury, which put a price on that rung and kept poorer men off it". Bartz's chapter on the
organisation of the ludi is precisely about who paid, and it carries none of those three things: what it
carries is that the official games grew longer through the Republic and that the financial burden on the
magistrates grew with them, and that giving them promoted a career. The card now says that and stops.
**Where a source is squarely on the subject and still does not carry the claim, the claim goes.**

**THE PAGE NUMBER IS READ OFF THE RUNNING HEAD, AND THE EXTRACTION PUTS IT IN AN ODD PLACE.** In these
Routledge and De Gruyter PDFs the text comes out as *body, then that page's footnotes, then the NEXT
page's running head*, so a passage's page is the head that stands immediately BEFORE it, not after.
Getting that backwards puts every citation one page out and nothing anywhere reports it.

**THE CHAPTER DOI IS FINDABLE AND IS WORTH THE TWO MINUTES.** A Routledge chapter's DOI is the book's
with `-N` appended and a De Gruyter's with `-00N`, but neither may be composed: the number is printed at
the foot of the chapter's own first page, and Crossref then confirms the chapter's title, authors and
page range in one request. That turns a citation `check-citations.js` could only send to the eye into one
it can adjudicate — which is how these seven were checked.

**AND IT PRODUCED THE PASS'S FIRST DECLARED YEAR EXCEPTIONS.** Routledge deposits a chapter DOI months
before the volume appears, so Crossref carries a print date a year earlier than the book's own imprint:
*Romans at War* says "First published 2020" and Crossref dates its chapters 1 October 2019, *Running Rome
and Its Empire* says 2024 against a 30 October 2023 deposit. Chicago cites the imprint year, so the four
DOIs are declared in `CROSSREF_YEAR_WRONG` with the reason beside them rather than the citations being
bent to the deposit.

**`rm-166` BATTLE OF ASCULUM WAS DEFERRED, AND THE REASON IS A URL RATHER THAN A SOURCE.** Yntema's
*The Archaeology of South-East Italy in the First Millennium BC* (Amsterdam University Press, 2013) is
open and carries exactly what the card's first sentence needs — Ausculum is Ascoli Satriano in the
north-Apulian Tavoliere, Daunian country, and Pyrrhus won there after Herakleia. But **its DOI
(10.5117/9789089645791) is a 404 at doi.org**, its OAPEN handle answers 403 here, `aup.nl` redirects to a
Routledge shop page for a different edition, and the extracted text carries no page numbers at all. A
book that cannot be pointed at is not citable, however open it is. Left for a batch that finds a live
address for it.

**HOST NOTES.** `library.oapen.org`'s **REST API is open and its `/handle/` pages are 403** from this
container — which is a change from earlier in this pass, when the handles were fetched directly, so the
handle URLs already shipped in the Greece cards should be re-tested rather than assumed. Search with
`rest/search?query=…&expand=metadata,bitstreams`; every book has a pre-extracted `.pdf.txt` bitstream.
`www.taylorfrancis.com` is 403 to any user agent, so a Routledge chapter DOI cannot be opened from here
even when the chapter is CC BY-NC; the licence line is read off the PDF's own first page instead.

**BATCH R12 — 2026-09-10. THE LAST SIX SMITH CARDS: William Smith 6 → 0, over-cited 71 → 65.**
`rm-105` concilium plebis, `rm-135` Lex Hortensia, `rm-139` Aqua Appia, `rm-140` aes grave, `rm-166`
Battle of Asculum and `rm-174` Via Aemilia. **Five of the six came from BMCR and the sixth from the book
R11 was already reading**, and the batch is the clearest case yet for the review as a source: four
reviews, each of a book squarely on one card's subject, each written by a named specialist and pitched
at the level a card is written at.

**A REVIEW CARRIES THE BOOK'S THESIS, WHICH IS OFTEN THE MOST INTERESTING THING A CARD CAN SAY.** Three
of this batch's six substitutions are a dispute rather than a fact. `rm-135` opened by treating the Lex
Hortensia as the settled end of the Struggle of the Orders; Champion's review of Feig Vishnia reports
her case that the real turning point came eighty years earlier with the Licinio-Sextian rogations, that
the ancient authorities give the law no great weight, and that its beneficiaries were the tribunes, who
by 287 belonged to the same nobility as the senate. `rm-140` said aes grave was bronze "whose value was
their weight"; Muccigrosso's review of *Making the Middle Republic* reports Yarrow's conclusion, from the
weights themselves, that Rome's early bronze was not bullion but closer to fiat money with wide
variation. And `rm-105` now says the Volero plebiscite of 471 freed plebeian elections from the CURIATE
assembly and gave them to a tribal one "whose making and composition are now unclear", which is what
Kondratieff's review of Lanfranchi actually says.

**THE OTHER THREE NEEDED NO PROSE CHANGE AT ALL, AND THAT IS WORTH RECORDING AS THE CHEAP CASE.**
Rosenstein's review of Bernard's *Building Mid-Republican Rome* names "Appius' road and aqueduct"
together, which is `rm-139`'s first sentence; Champion's review quotes Feig Vishnia on "Ariminum, the key
to Cisalpine Gaul" and the Flaminian way built up to it, which is `rm-174`'s; and Tan's chapter in
*Romans at War* notes that Dionysius lists the Italian contingents by name in his account of Asculum,
which `rm-166` was already reporting. **When a review names the very thing the card names, the
substitution is one line.**

**`rm-166` IS THE DEFERRAL FROM R11 CLEARED BY LOOKING IN THE OTHER DIRECTION.** R11 could not cite
Yntema because his book has no openable address; the card did not need a book about Apulia at all, only
a work that says something about the passage of Dionysius the card already quotes — and that was one
page of a chapter already open on this machine. **Before hunting a new source for a deferred card, re-read
what the batch before it already had.**

**AND THE SEARCH ORDER THAT PRODUCED THIS BATCH IS WORTH KEEPING.** BMCR's own search
(`bmcr.brynmawr.edu/?s=…`) answered every one of four subject queries with a book-length treatment of
that subject: *Les tribuns de la plèbe … 494-287* for the plebs and the tribunate, Vishnia's *State,
Society, and Popular Leaders … 241-167* for the middle Republic, Aicher's *Guide to the Aqueducts of
Ancient Rome* and Bernard's *Building Mid-Republican Rome* for the water. OAPEN's subject searches for the
same topics returned nothing usable — "Roman coinage Republic", "Roman aqueduct water supply", "Roman
roads Italy" and "Roman law Republic plebiscite" between them produced one relevant book. **For a
subject with a modern monograph on it, search BMCR first; for a subject covered by an edited volume,
OAPEN.** Two reviews were read and set aside for saying nothing the cards needed — Taylor on Aicher (a
field guide, whose review is about finding ruins) and Poehler on Kolb's *Roman Roads* (which is about
milestones in the provinces, not the Via Aemilia).

**BATCH R13 — 2026-09-10. THE LEGGE CARDS, AND THEY DID NOT NEED RE-SOURCING AT ALL: fourteen cards,
over-cited 65 → 51.** `cnh-008`, `cnh-010` to `cnh-014`, `cnh-025`, `cnh-055`, `cnh-057`, `cnh-059`,
`cnh-060`, `cnh-067`, `cnh-068` and `wh-399`. **The finding is that this was a CITATION-FORM fault
wearing the shape of an over-citation**, and it is the first time in the pass that the right answer was
to change how a source is written rather than which source it is.

**JAMES LEGGE IS A TRANSLATOR, NOT THE AUTHOR OF WHAT HE TRANSLATED.** `cnh-010` Yao cited the Shû King,
the Yî King, the *Analects* and the *Mencius* — four different ancient works — and every one of them
opened `James Legge, trans., …`, so `check-cards.js`, which takes a citation's author from the first
field, read four ancient witnesses as one modern scholar cited four times. The collection's own record
had already reasoned it out: `docs/china-card-findings.md` on `cnh-010` says "Four different WORKS by one
out-of-copyright translator is variety; four citations of one work would not be." **The card was right
and the citation was wrong.** They are now written the way every other translated ancient work in the
corpus is written — `Livy … trans. Canon Roberts`, `Plutarch … trans. Bernadotte Perrin`, and for an
anonymous work its own title first, which the corpus already does for the *Greek Anthology* and the
*Historia Augusta*. Forty-two Legge citations and nine Chavannes ones were rewritten.

**THE DISCRIMINATOR IS WHETHER THE CITATION POINTS AT THE TEXT OR AT THE PROLEGOMENA, AND IT IS A
JUDGEMENT PER CITATION.** Legge's Shoo King is a translation with a 250-page introduction of his own, so
`James Legge, prolegomena to <i>The Shoo King</i>` is exactly right where the card is leaning on his
argument and exactly wrong where it is quoting the text. Eight citations stayed in his name on that
test, which is why `cnh-060` still failed after the rewrite and the other thirteen did not.

**`cnh-060` IS THEREFORE THE ONE REAL SUBSTITUTION, and it was already half in the card's own hand.**
Three of its five sources were Legge's Prolegomena. Yun Kuen Lee's "Building the Chronology of Early
Chinese History" (*Asian Perspectives* 41.1, open at ScholarSpace) was already source 4 cited at the
whole article; read properly it carries two separate things at two separate pages — Li Xueqin's
screening of the Xia entries at p. 22, which is what source 4 was standing for, and at p. 30 the entry
"the sun rose twice at Zheng" in King Yiwang's first year, read as a solar eclipse and dated to 21 April
899 BCE. **A whole-article page range is a citation that has not been read**; pinning both pages replaced
a Legge citation and gained the card its one concrete modern date.

**AND THE TOOL WAS TAUGHT WHAT IT WAS LOOKING AT.** `check-cards.js`'s `ANCIENT` list now carries
`confucius`, `mencius`, and the anonymous classics by TITLE (`the shû king`, `the yî king`, `the shoo
king`, `the ch'un ts'ëw`, `the annals of the bamboo books`), so a future card citing one of them three
times gets the `one-witness` NOTE it deserves rather than an over-cited failure. `cnh-068`, which cites
the *Shiji* four times over, moved to that note the moment its citations were rewritten
`Sima Qian … trans. Édouard Chavannes` — which is the checker finally saying what is true of the card.

**THE REST OF THE SWEEP IS MEASURED AND DELIBERATELY NOT DONE.** **304 more citations across 145 cards**
(150 opening `James Legge`, 154 opening `Édouard Chavannes`) plus 71 in `glossary-extra.js` still carry
the translator-first form. It is not a regex job: every one has to be read for the text-versus-prolegomena
distinction above, and getting that wrong attributes a Victorian's argument to a Zhou compiler. This
batch changed only the cards where the form was actually causing a rule-1 failure; the rest is a pass of
its own, and the rule is now written down in CLAUDE.md's `sources` bullet so nothing new joins the
backlog.

**WHERE THE PASS STANDS.** Rutter: 39 cards → 1. William Smith: 13 → 0. James Legge: 11 → 0, and not
by re-sourcing. Over-cited across the whole corpus: 116 → 51. What is left is a tail of two to five
cards each — William Frederick Mayers (3) and Henry Doré (2) in China, Arthur J. Evans (3), Herbert
Weir Smyth (2) and H. B. Walters (2) in Greece, E. B. Titchener (2) in Psychology, and a dozen
singletons, mostly World History cards resting on the excavators' own three papers. **Read a card before assuming it needs a substitute**: R13's eleven needed a
citation rewritten, and `gr-046` and `wh-041`'s shape may be the one-witness case in another coat.
**Start with BMCR and OAPEN**, in that order for a subject with a monograph on it and the other way
round for one covered by an edited volume; between them they have carried twenty-four of the pass's
substitutions.

## Two notes on the tooling

- **`cardYears` reads "594/3 BCE" as year 3.** Writing split years the short way in a date line
  sorts the card to the wrong millennium, silently. Write them out: "594/593 BCE".
  `test-date-line.js` catches the century-only case but not this one.
- **The Bryn Mawr Classical Review outage was the container, and it has lifted.** All 353 BMCR
  URLs answered 502 when this file was written, in parallel and one at a time alike; on
  2026-09-10 the site answers 200, search included. `ascsa.edu.gr` still refuses the connection
  outright. Wikimedia rate-limits image requests to 429 after about thirty. **Re-test a host
  before trusting a refusal recorded here.**


---

## `check-cards.js`'s own findings, moved out of `CLAUDE.md` (2026-09-11)

**READ BEFORE OPENING A RE-SOURCING BATCH ON THE GREECE COLLECTION.** The account as it stood in
`CLAUDE.md` until it was moved here verbatim: what each check was written after, the measured figures
(431 findings dropping to 116 once institutions were split out; 39 cards on one course website), and
the four hosts re-measured in Sep 2026. The RULES stay in `CLAUDE.md`.

- `.claude/check-cards.js` — **the card-level faults nothing else in the pipeline can see**:
`node .claude/check-cards.js [--prefix=gr-] [--verbose] [--report]`, exit 1 on a violation and never
on `--report`. Six checks, each written after a real fault shipped unreported — **an author cited in
more than two of one card's sources** (`add-card.js` checks a citation ends in a URL,
`source-audit.js` counts them and `check-citations.js` checks the names against Crossref, and all
three pass a card whose whole apparatus is one website; ancient authors are counted separately,
six passages of one witness being a different fault from six pages of one scholar), **a modern
scholar named in a question**, **one picture on two cards**, **a picture description that names its
own source**, **a card with no picture** (reported, never failed) and **two sources in the same
non-English language**. Two of them are the reason it exists at all. `card-focus.js` takes the names
it looks for from the AUTHOR POSITIONS of a card's own citations, so **a scholar named in a question
but not cited on that card is invisible to it** — it reported ONE Greece card where an independent
sweep found thirteen; this reads the question for the SHAPE of an attribution and asks afterwards
whether the name is an ancient witness. And the duplicate-picture check compares on the file name
**with the `\d+px-` prefix stripped**, because the same file at two widths is two different `src`
strings and gr-267 and gr-379 carried one map for weeks at 1920 and 1280.
· **THE GLOSSARY IS THE DISCRIMINATOR FOR THE QUESTION RULE, AND A MODERN PERSON IS WITHHELD FROM
IT.** "Athenian Constitution" and "White Castle" wear the shape of an attribution and are a work
and a place; both are glossary surfaces. But the pairing rule gives every card's answer its own
entry, so an excavator who is herself a card's subject has one — `Harriet_Boyd_Hawes`, with
"Harriet Boyd" as an alias — and a flat exemption **suppressed the one real finding it was meant
to leave standing**. A term is withheld when it is tagged `person` and its date line begins after
1500, which is the site's own record of a modern figure rather than a guess from the name.
· **THE COMMA ENDS AN AUTHOR FIELD, NOT THE FULL STOP.** A book's title is italicised rather than
quoted, so a quoted-title pattern cannot see it and a full-stop fallback reads an INITIAL as the
whole name: "H. B. Walters, History of Ancient Pottery…" gave an author called **"H"**, so three
citations of one book were filed under a scholar named for a letter and the concentration was
missed. A citation OPENING on its title has no author at all — reading the title as one gave
gr-333 an author called "Athens".
· **AND IT CHECKS A `card.quote` AGAINST THE BOOK IT NAMES, WORD FOR WORD.** `test-card-quote.js`
asserts the placement and the address and neither of them the WORDS, so a quotation can be
re-punctuated, re-worded or elided across a gap and still render perfectly under a link to the
real text — `gr-467` joined two passages 200 words apart with no ellipsis, opened on an
editorial "He" where Thucydides names Pericles, and set the translator's `--` as an em dash. An
explicit ` … ` is the author saying a gap was cut and each side of it is checked on its own;
**a bare number is the edition's apparatus and is dropped from both sides**, since several
shelved editions run their section and verse numbers inline and a quotation rightly leaves them
out.
· **AN INSTITUTION IS NOT A SCHOLAR, AND THREE OF ITS RECORDS ARE NOT THREE OPINIONS** (Sep 2026,
out of the field audit). Rule 1 was written against a card whose whole apparatus is one
researcher's view, and it counted a DATA PUBLISHER the same way — so a geography card citing the
World Bank for its population, its area and its GDP was reported as resting three sources on one
author. Measured over the corpus that shape was **274 of the 431 findings**: the World Bank 84
times, the National Park Service 65, the Census Bureau 50, the Holocaust Memorial Museum 31.
**They are REPORTED SEPARATELY rather than excused** — a card resting entirely on one ministry's
site is thin however official the ministry — so `INSTITUTIONAL` sends them to a `one-institution`
note and the failure list drops to **116**, which is the finding the rule exists for: before the
split, `jeremy b. rutter` (39 cards, the Dartmouth course site the Greece audit names) sat in a
list of 431 where nobody would read it. **The list is DECLARED, never pattern-matched** — "anything
ending in Museum or Bureau" would quietly excuse a real author — so add an entry only after
reading a card that cites it.
· **IT IS A REPORT TOOL RUN BY HAND AND IS DELIBERATELY NOT IN THE CI FAST GATE.** Over the whole
corpus it finds a large standing backlog on the first and last checks — the Greece collection's
early decks rest on one Dartmouth course site and on the French excavation reports (the seven
measured routes are in `docs/greece-audit-2026-09.md`). **That file's "no substitute is
reachable" was re-measured in Sep 2026 and four more routes DO open** — Europe PMC (291
open-access Aegean hits), DOAJ (44 for *minoan crete*, against the one thin query first tried),
**`persee.fr` INCLUDING ITS SEARCH** (`/search?ta=article&q=…` over plain HTTP, proved a real
search by a nonsense query returning nothing, with `/doc/<id>` serving the whole article — BCH,
CRAI and Ktèma, the French School at Athens' own record of Malia and Knossos) and
`chs.harvard.edu`. JSTOR still serves a Client Challenge under a 200 and `ascsa.edu.gr` refuses.
**What they carry is the archaeological SCIENCE and the French excavation record**, where the
Rutter citations carry pottery sequences and palace phasing — so a substitute is found claim by
claim and some claims still have none (`gr-001`'s Cycladic longboats were searched for across
all four and found in none). **The re-sourcing is a content pass, card by card, not a
substitution table**, and keeping Rutter for a claim nothing else states is the right answer
rather than a failure. Run it with `--prefix=` over the cards a batch touches. Not part of the
site.
