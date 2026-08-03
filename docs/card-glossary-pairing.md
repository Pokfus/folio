# Every card's answer term gets a glossary entry — the backfill plan

*Opened 2026-08-03, on request: "whenever we add a new card, we should also immediately add a gloss entry
for that same answer term. Identify which current cards do not yet have a corresponding gloss and plan
batches to add them."*

Not part of the site.

## The rule (now in CLAUDE.md, binding from here on)

**A new card ships with a glossary entry for its own answer term, in the same commit.** Not afterwards, not
in a later batch — the two are one piece of work, because a card's answer is exactly the word its siblings
will use in their own backgrounds, and a term that has no entry auto-links to nothing.

Two things follow from that:

- **The term is written cited, at the `GLOSS_SRC_TARGET` bar (2 sources with in-text markers).** The card's
  research is already open on the desk; writing the term from it costs a fraction of what coming back later
  costs. This is how the glossary pass stayed at 401/401 while sixty-eight new Palaeolithic terms were added.
- **The description obeys the glossary's own rules, not the card's.** Three sentences, impartial,
  deck-agnostic, self-contained — a gloss popup is shared across every deck, so it must not be written as a
  companion to the card that prompted it. In particular it must not say "as this card explains" or define
  the term by contrast with a sibling term.

Where the answer term is a phrase the glossary would never carry as a headword (a sentence-like answer),
give the entry the head noun instead and add the card's exact answer as an **alias**, so the auto-linker
still finds it.

## Where it stands

Measured over `data.js` against `window.GLOSSARY` + `GLOSSARY_TITLES` + `GLOSSARY_ALIASES`:

# ✅ COMPLETE — 119 of 119

**Every card has a glossary entry for its answer term** (42 of 119 when the plan opened; P9, P10 and P1–P8
all shipped 2026-08-03). The glossary went from 401 terms to **477**, all of them at the
`GLOSS_SRC_TARGET` bar, every list majority-open and every citation labelled. What the plan now describes is
the RULE, which stands: a new card ships with a term for its own answer, in the same commit. **Every Ancient Greece card is paired** —
all eight prehistory batches are done.

**Count plurals when measuring this.** A card whose answer is `Denisovans` is paired by the term
`Denisovan`, because `buildGlossIndex` auto-pluralizes — but an exact-match count says it is not, which is
how P2's list came to contain a term that already existed. The figures above allow for plurals; the ones
quoted in the P9 and P1 logs were one short for this reason.

The gap is not random: the glossary was grown as a vocabulary of *general* prehistory (taxa, periods,
industries, peoples, physical geography) and separately as a term for every country in the world, while the
cards are largely about *particular* fossils, sites and objects. So almost every missing term is a proper
noun — a named specimen, a named cave, a named culture — which is also why they are cheap to write: a
site's three sentences are a place, a date range and a find, and the card in front of you already carries
all three with its sources attached.

## The batches

Eight cards each, in card order, so a batch shares its reading with the cards it comes from. Run each with
`node .claude/add-glossary.js <entry.json>` one term at a time (it takes one entry per call), then
`node .claude/gloss-source-audit.js` to confirm the batch landed at the bar.

| batch | cards | terms |
|---|---|---|
| **P1** ✅ | `wh-012`, `wh-019`, `wh-020`, `wh-021`, `wh-025`, `wh-026`, `wh-027`, `wh-028` | Last Glacial Period; Homo ergaster; Turkana Boy; Wonderwerk Cave; Java Man; Peking Man; Zhoukoudian; Homo antecessor — **shipped 2026-08-03** |
| **P2** ✅ | `wh-029`, `wh-030`, `wh-035`, `wh-036`, `wh-037`, `wh-038`, `wh-039`, `wh-040` | Atapuerca Mountains; Homo heidelbergensis; Denisova Cave; Homo naledi; Homo floresiensis; Liang Bua; Homo luzonensis — **shipped 2026-08-03**; `Denisovans` was already covered by the existing `Denisovan` term |
| **P3** ✅ | `wh-041`, `wh-042`, `wh-044`, `wh-045`, `wh-046`, `wh-047`, `wh-048`, `wh-050` | Neanderthal extinction; Toba catastrophe theory; Omo remains; Jebel Irhoud; Homo sapiens idaltu; Mitochondrial Eve; Y-chromosomal Adam; Aterian — **shipped 2026-08-03** |
| **P4** ✅ | `wh-052`, `wh-053`, `wh-054`, `wh-055`, `wh-056`, `wh-058`, `wh-059`, `wh-060` | Howiesons Poort; Sibudu Cave; Border Cave; Klasies River Caves; Pinnacle Point; Behavioural modernity; Madjedbebe; Lake Mungo remains — **shipped 2026-08-03** |
| **P5** ✅ | `wh-062`, `wh-063`, `wh-064`, `wh-065`, `wh-067`, `wh-068`, `wh-069`, `wh-070` | Settlement of the Americas; Paleo-Indians; Cro-Magnon; Châtelperronian; Lion-man; Hohle Fels; Venus of Hohle Fels; Divje Babe flute — **shipped 2026-08-03** |
| **P6** ✅ | `wh-072`, `wh-073`, `wh-074`, `wh-076`, `wh-080`, `wh-081`, `wh-082`, `wh-083` | Venus figurines; Venus of Willendorf; Dolní Věstonice; Mal'ta-Buret' culture; microlith; spear-thrower; bow and arrow; cave painting — **shipped 2026-08-03** |
| **P7** ✅ | `wh-087`, `wh-089`, `wh-090`, `wh-091`, `wh-092`, `wh-093`, `wh-094`, `wh-095` | Cosquer Cave; Quaternary extinction event; Younger Dryas; Clovis culture; Clovis point; Folsom tradition; Monte Verde; Meadowcroft Rockshelter — **shipped 2026-08-03** |
| **P8** ✅ | `wh-097`, `wh-098`, `wh-100`, `wh-101`, `wh-103`, `wh-104`, `wh-105`, `wh-106` | petroglyph; control of fire; Epipaleolithic; Nordic Stone Age; Preboreal; Boreal; Atlantic period; Blytt–Sernander sequence — **shipped 2026-08-03** |
| **P9** ✅ | `wh-107`, `wh-108`, `wh-109`, `gr-001`, `gr-002`, `gr-003`, `gr-004`, `gr-005` | Holocene climatic optimum; post-glacial rebound; 8.2-kiloyear event; Aegean Bronze Age; Cycladic civilisation; Cycladic figurines; Keros; Early Minoan Crete — **shipped 2026-08-03** |
| **P10** ✅ | `gr-006`, `gr-007`, `gr-008`, `gr-009`, `gr-010` | Minoan civilisation; Arthur Evans; Knossos; Minoan palace; Throne Room at Knossos — **shipped 2026-08-03** |

*(All ten batches are done. What follows is the record of how they went.)* The Ancient Greece collection is the one being grown, its glossary starts from
almost nothing, and every card written from `docs/greece-card-plan.md` from here on will want to link these
ten terms. The prehistory batches are backfill of a finished deck and can wait.

## Notes for whoever works this

- **The three general terms in P8 are the easy ones and the trap.** `petroglyph`, `microlith`,
  `spear-thrower`, `bow and arrow`, `cave painting` and `control of fire` are common nouns, so their
  descriptions must be written from nothing about any one culture — the deck-agnostic rule at its
  strictest. *A bow is a bow in every continent that has one.*
- **Check the aliases before you write.** Several of these terms will already be reachable by an alias on
  an existing entry, and adding the term as its own headword then leaves a dead alias row pointing at the
  wrong place — the failure N2 and N7 of the glossary pass each hit once. Grep `GLOSSARY_ALIASES` for the
  new surface first, and strip it from the old entry in the same batch.
- **A correction found here travels back to the card.** Writing a term from a card's own sources is the
  cheapest sibling-consistency check there is, and the glossary pass found errors that way repeatedly
  (`Homo_habilis`'s span, the `Mousterian`'s start date). If the term and the card disagree, one of them is
  wrong — fix both in the same commit.

## The P9 log

Eight terms, all at the bar, all on the cards' own already-verified sources — no new reading at all, which
is the whole economy of writing the term while the card's research is still open. Four things it turned up:

- **The alias check the plan asks for paid immediately, but on an OLD entry rather than a new one.**
  `Lomekwi` carried the alias `Lomekwi 3`, which is the key of a separate term — so pass 1 of
  `buildGlossIndex` always beat it and the alias had been dead since the day the sibling was written. It is
  retired. Worth turning into a standing check rather than a per-batch one: a script that maps every key,
  title and alias to its owner and reports any surface claimed twice found this in a second, and found
  nothing else in 409 terms.
- **The headword is the card's answer, not Wikipedia's article title**, where the two differ. `Cycladic
  civilisation` and `Aegean Bronze Age` are keyed as the cards name them, with `Cycladic culture` and
  `Aegean civilization` as aliases. A reader who has just answered "Cycladic civilisation" and then meets
  the linked phrase in another background should not get a popup headed something else; that reads as a
  wrong link.
- **A citation whose URL contains a bracket is a broken link, silently.** `SRC_URL_RX` stops at `)`, `<`
  and `>`, so `wh-109`'s Alley 1997 citation — an old GSA DOI of the form
  `10.1130/0091-7613(1997)025<0483:…>` — rendered as a link to `…/0091-7613(1997`. Percent-encoding the
  brackets is the standard fix and the whole DOI now survives. It was the ONLY such URL in 119 cards and
  409 terms; a sweep for `[()<>]` inside a citation's URL is worth running after any batch.
- **The three climate terms are general and the five Aegean ones are proper nouns**, and the general ones
  were the slower half — exactly what P8's note predicts. `Post-glacial rebound` had to be written without
  Scandinavia or Hudson Bay being the point of it, and the mechanism (mantle creep, the forebulge, the
  stiffness that makes it take millennia) is what a reader meeting the word in any deck needs.

## The P10 log

Five terms, finishing the Ancient Greece collection's pairing. Like P9 they cost no new reading — every
citation is one the card already carried. Three things:

- **A UNITS VIOLATION the digit sweep could not see.** `gr-008` opened "about four miles inland from
  Heraklion" — imperial FIRST, and spelled out, so neither the metric-figure sweep (which looks for a digit
  followed by a unit) nor the imperial-first check found it. It was found by reading the card in order to
  write its glossary term. A second sweep, for a SPELLED-OUT number before a unit, then turned up fifteen
  more across the corpus: `gr-008`'s own "two acres", "a third of a metre" and "three metres", plus
  "barely a metre away", "about a metre tall", "two metres thick", "barely a centimetre thick" and the
  rest. All are converted. **Run both sweeps** — a number written as a word is invisible to the one that
  matters most.
  · The line drawn, so it need not be re-argued: a DEFINITE spelled-out quantity gets its conversion; an
    explicitly indefinite one does not, because "several hundred metres" converts to "several hundred
    yards", which is the same vagueness in different words. `wh-060`'s "a few hundred metres away",
    `wh-108`'s "several hundred metres" and its "a millimetre or two annually" are left alone on that
    ground. And "a foot bone" is not a measurement. **An indefinite IMPERIAL quantity is still turned
    round** — `gr-010`'s "a few inches under the herbage" is now "a few centimetres", with nothing in
    parentheses — which is how the third and last imperial-first figure was found, on the second pass,
    after `few` was added to the number-word list.
- **An alias that repeats its own key is not an alias.** `Throne_Room_at_Knossos` was drafted with
  "Throne Room at Knossos" in its alias list, which is exactly what the key humanizes to. Harmless but
  dead weight; the collision sweep introduced in P9 does not catch it, since the key and its own alias
  have the same owner. Check a new alias against the humanized key as well as against other terms.
- **"Minoan" is deliberately NOT an alias of `Minoan_civilisation`.** It is an adjective, not a synonym,
  and it opens `Minoan palace`, `Minoan Crete` and a dozen other phrases; aliasing it would scatter links
  through every Aegean background and steal surfaces from `Minoan_palace`. N2's rule — ask whether the two
  names belong to the same scheme — has an adjectival cousin: ask whether the surface is ever used ON ITS
  OWN to mean the thing.

Verified in a browser: seven of the thirteen terms written across P9 and P10 auto-link from the Aegean
cards' backgrounds and open. The other six appear only on their own cards, where `autoLinkGlossary` skips
the answer term by design.

## The P1 log

Eight terms, the first of the prehistory backfill, and the first batch in which the cards' own citations
were not quite enough on their own. Four things:

- **THE SIBLING CHECK PAID, AND THE ANSWER WAS "BOTH".** `wh-026` dates the Zhoukoudian deposits
  "from more than 750,000 to roughly 230,000 years ago" and `wh-027` puts "the topmost layers at about
  400,000 and the deepest beyond 750,000". Written up as two glossary terms sitting side by side, that
  reads as a flat contradiction. It is not: Xing et al. give the fossils' ages as "230 kyr to >= 750 kyr
  **according to different methods of chronometric analyses**", while Huang et al. date "an upper horizon
  of Layer 1/2" to 400 ± 8 kyr — one is a spread across dating techniques, the other a single dated
  horizon. Both cards keep their figures; `wh-026` and the `Peking_Man` term now carry Xing's own hedge
  ("by different dating methods"), which is what makes the pair reconcilable to a reader who meets both.
  **When two cards disagree, read the sources before correcting either — a disagreement between summaries
  is often an agreement between measurements.**
- **A guessed PMCID cost a fetch**, exactly as N1 warns. `PMC5792596` is a paper on stem-cell
  transplantation in mouse inner ear, not Xing et al. Resolve it with
  `europepmc/webservices/rest/search?query=DOI:"…"&resultType=core`, which gave `PMC5794973`, and read the
  text through the `fullTextXML` route.
- **`nature.com`, `frontiersin.org` and PMC all answered this session** — N1 recorded nature.com as 403.
  Reachability is a fact about the day, not about the host; re-test before treating a citation as
  unopenable.
- **Two aliases were cut in draft**, on P10's rule. "Trinil 2" is the catalogue number of Java Man's
  skullcap, not a synonym for the three bones together; and "last glacial" is a fragment that sits inside
  the sibling term `Last_Glacial_Maximum`. The regional names — Würm, Weichselian, Wisconsinan, Devensian
  — were likewise **not** aliased onto `Last_Glacial_Period`, since each already has its own term.

Verified in a browser: seven of the eight auto-link from other prehistory cards' backgrounds and open.
The eighth, `Last_Glacial_Period`, appears on no card but its own, where the answer term is skipped by
design.

## The P2 log

Seven terms rather than the planned eight, and the missing one is the finding.

- **CHECK THE PLURAL BEFORE WRITING THE TERM.** `wh-035`'s answer is `Denisovans`, which the plan listed as
  missing — but `Denisovan` has been in the glossary since the N-batches, and `buildGlossIndex`
  auto-pluralizes, so the card was already paired and a new `Denisovans` term would have been a duplicate
  headword competing with it. The measure that built the plan compares `answerText` against the surface set
  by exact string, which is blind to exactly the case the auto-linker handles. **Fold plurals into the
  measure**, or three or four more batches will each carry a term that does not need writing.
- **Reachability is a fact about the day, again.** `hal.science/…/document` answered 200 this session,
  where batch 21 recorded the `/document` route as dead behind an Anubis wall and N1 recorded the record
  pages the same way. Both `Homo_luzonensis` citations that rest on it were verified live rather than
  carried over on trust.
- **A source's abstract is not always what the card summarised from it.** `wh-036` gives Denisova Cave's
  occupation as reaching back "some 300,000 years", which is Jacobs et al.'s figure and paywalled; Zavala
  et al., which is open, actually says the earliest Denisovan mtDNA sits in layers "deposited approximately
  250,000 to 170,000 years ago". The term states Zavala's numbers, which are the ones a reader can check,
  and cites Jacobs for the deposit span it alone carries. **Read the abstract before re-pointing a marker
  at an open sibling source** — the open one may be answering a different question.
- One alias worth keeping: **`hobbit` on `Homo_floresiensis`**. It is a nickname rather than a taxon, but
  it is what the cards themselves call the species, it is unambiguous in this corpus, and the plural is
  picked up automatically.

Verified in a browser: every one of the seven that appears in another card's background auto-links and
opens. `Homo_naledi` and `Homo_luzonensis` appear on no card but their own, where the answer term is
skipped by design.

## The P3 log

Eight terms, all at the bar and all majority-open — which took care, because half these cards rest on
landmark papers that are paywalled (Higham on the Neanderthal dating, Ambrose on Toba, Hublin and Richter
on Jebel Irhoud, White and Clark on Herto, Cann on Mitochondrial Eve). Every list was built open-first with
the closed landmark alongside, never instead.

**THE BATCH FOUND A BUG IN THE AUTO-LINKER, AND THE PLAN IS WHAT SURFACED IT.** `autoLinkGlossary` stops a
card from linking its own answer term by resolving `answerText` to a key — but it looked only in `byName`,
the case-insensitive map, while a PROPER-NAME surface lives in `byNameCS`. So a card whose answer is a
proper noun linked that answer inside its own background, offering the reader a popup defining the word
they had just been asked to recall. Measured across the prehistory deck: five cards did it — `Ice_Age`,
which has been wrong since long before this plan, plus `Turkana_Boy`, `Java_Man`, `Peking_Man` and
`Atapuerca_Mountains`, added by P1 and P2. `buildGlossIndex` now also returns `byAnySurface` (every surface
lowercased, whichever map it landed in) and `autoLinkGlossary` uses it for that one question; prose
matching is untouched, since a proper name must still match case-sensitively there. Verified back to zero.
**This is what giving every card's answer a term does: a latent one-off becomes one per batch.** Re-run the
self-link check after each batch — it is a dozen lines and it caught what no existing suite covers.

Two smaller notes:

- **Grep the aliases too, not just the headword.** `Omo_remains` looked as though it appeared on no card
  but its own, and it links from `wh-043` — through the alias `Omo Kibish`, which the check had not been
  given. A term's reach is its whole surface set.
- **`Neanderthal extinction` sits on top of the existing `Neanderthal`** and wins, because
  `buildGlossIndex` sorts surfaces longest-first so phrases beat their parts. Worth knowing before adding
  any multi-word term whose first word is already a term.
- **A permanently-red test is a test nobody reads.** `test-i18n-lang.js` demanded that the nine gloss files
  hold as many terms as `GLOSSARY` — impossible since the `MULTILANG` gate made every new term
  English-only, so it had been sitting at 24 passed / 4 failed and drifting further with each batch of this
  plan. It now asserts the rule that IS in force: **no language behind the others**, translated terms a
  subset of shipped ones, and no card translated into only some languages. Back to 30/0, and both halves
  still bite.

## The P4 log

Eight terms, and the quietest batch so far: no corrections, no access surprises, no tooling faults. What it
did have was three judgement calls worth writing down.

- **TWO SITES CLAIMING THE SAME FIRST, AND BOTH RIGHT.** `wh-056` calls Pinnacle Point's 164,000-year-old
  shell middens "the earliest firm evidence anywhere that people gathered food from the shore"; `wh-055`
  calls Klasies River "the clearest early sign of steady coastal foraging" on middens under a 110,000-year
  speleothem. Side by side as glossary terms those read as rival claims to the same title. They are not —
  one is the earliest instance, the other the earliest sustained pattern — and the fix was to take the
  Klasies wording from its own source's title, which says **systematic** coastal exploitation. P1's
  Zhoukoudian case again in a different shape: **when two terms look like they contradict, check whether
  they are answering different questions before changing either.**
- **A term whose subject is an argument gets the argument, not a verdict.** `Behavioural_modernity` is a
  contested category, so its three sentences give the trait list, why each item is only a proxy, and the
  two standing objections (the traits turn up far earlier in Africa; Neanderthals had them too) without
  settling it — and it says plainly that the term stays in wide use. A gloss that picked a side would be
  taking a position the cards themselves decline to take.
- **`Lake_Mungo_remains` names the Traditional Owners and the repatriation.** These are ancestral remains,
  not specimens: the term says whose country they lie in, that the 2001 DNA claim collapsed as
  contamination, and that reburial was approved in 2022. It also carries the card's hedge on the word
  'cremation', in the single quotes the house style uses for a word mentioned as a word.

Verified in a browser: all three of the eight that appear in another card's background auto-link and open;
the other five appear only on their own cards. The self-link check introduced in P3 still reports zero.

## The P5 log

Eight terms, every list open except the one landmark that isn't (Conard 2009 on the Hohle Fels Venus).
Three findings, and the first is the useful one.

- **THE SAME MEASUREMENT WAS RENDERED TWO WAYS IN TWO FILES.** `Swabian_Jura` gave the Hohle Fels flute as
  "21.7 cm (8.54 inches)" and `wh-068` as "21.7 centimetres (8.5 inches)". Both follow a defensible rule —
  the glossary figure came out of the mechanical units pass, which rounds to the source's significant
  figures, while the card's was written by hand — and a reader meeting both sees the site contradict
  itself over a third decimal. Harmonised to 8.5. **When the same measurement appears in a card and in a
  term, grep the FIGURE across both files**, which is batch 26's rule for corrections applied to
  conversions.
- **Use the project's splitter, not a regex.** The batch's sentence-count check reported
  `Paleo-Indians` at six sentences; the prose is fine and the check was wrong, because a naive
  `/(?<=[.!?])\s+/` breaks on "Frank H. H. Roberts Jr." — precisely the initial-run trap batch 24 fixed in
  `.claude/split-abstract.js`. The check now loads that module into the page instead. A verification tool
  that is wrong in the same way the content used to be is worse than none.
- **A term may already describe its subject in passing, and that is not a duplicate.** `Swabian_Jura`,
  written in the N-batches, mentions both the Lion-man and the Hohle Fels flute with their measurements;
  P5 gives each its own term. The region term says what the region is famous for, the object terms say
  what the objects are — but the figures had to be made to agree, which is how the flute discrepancy above
  came to light.

## The P6 log

The batch the plan warned about — four common nouns among the eight — and the warning was right about the
difficulty and wrong about where it lay.

- **THE COMMON NOUNS WERE EASY TO KEEP GENERAL AND HARD TO CITE.** `Microlith`, `Spear-thrower`,
  `Bow_and_arrow` and `Cave_painting` each open on the MECHANISM — what the thing is and why it works that
  way — which keeps a culture out of the framing without effort: a microlith is small because it is meant to
  sit in a groove, a bow stores effort where an arm cannot, a spear-thrower lengthens the arc the hand
  describes. Dates and places then enter as facts about the CLASS ("the oldest complete bows are about
  10,000 years old"), which is what `Tar` already does with Campitello and is not the banned "portrait of
  its local instance". What was hard is that these definitions are exactly the sentences the cards leave
  unmarked, because a definition is not a published result.
- **WHICH TURNED INTO A CITATION FOR THE CARD.** `wh-083`'s whole first block — what parietal art is, the
  pigments, how the colour was applied, what the subjects are — carried no marker at all. The French
  culture ministry's Lascaux site states two of those sentences almost verbatim on pages the card did not
  cite: *The Raw Materials* ("the red are hematites and the yellows are goethites"; "the blacks are always
  manganese oxide-based") and *The Techniques* ("most often the human hand was used"; "a few brushes and
  swabs, and stencils cut from hides"). Both are now cited on the card as well as in the term, with the
  markers spliced into **all ten languages** by `split-abstract.js`'s `mark()`, which is what that helper
  exists for. Batch 23's rule holds: **the unmarked sentences are where to look.** The hand-stencil sentence
  was left unmarked — the ministry's stencils are cut from hides, which is not the same claim.
- One caution on the verification, not the content: **a term can fail to link simply because the check did
  not reach its card.** `Microlith` appeared unlinked until the study loop was widened from 90 cards to the
  whole deck of 109; it links from `wh-031`, `wh-099` and `wh-100`. Grep first, then set the loop to cover
  the cards the grep names.

## The P7 log

Eight terms, every list at four sources and majority-open, nothing corrected — these cards were already
consistent with each other. Three notes:

- **A CULTURE AND ITS OBJECT AS TWO TERMS, WITH THE SHORT NAME AN ALIAS OF ONE.** `Clovis_culture` carries
  the alias `Clovis` while `Clovis_point` is a key of its own, so the two compete for every occurrence of
  the phrase. `buildGlossIndex` sorts surfaces longest-first, so "Clovis point" resolves to the object and a
  bare "Clovis" to the culture — and both were seen linking in the same browser run, which is the P3 note
  confirmed by measurement rather than by reading the sort. **The same shape is safe to repeat**: name the
  narrower thing as its own key and let the broader one take the short alias, never the other way round.
- **A term whose subject is a live dispute states the dispute and cites both sides.** `Monte_Verde` was
  resisted for twenty years, accepted in print in 1997, challenged again by a paper in *Science* in 2026
  and defended by its excavators within weeks; the term says exactly that and cites the challenge alongside
  the reply. Same principle as P4's `Behavioural_modernity` — a gloss that picked a winner would be taking
  a position the field has not.
- **A near-miss that is not one, for the third time this pass.** `Meadowcroft_Rockshelter`'s date line says
  "at least 16,000 BP" and its abstract "about 14,000 to 14,500 radiocarbon years ago". Those disagree only
  if the units are ignored: 14,500 uncalibrated ¹⁴C years is roughly 17,500 calendar years, so the date line
  is the calibrated figure. **The term keeps the words "radiocarbon years"**, which is what makes the two
  readable together — batch 22's arithmetic rule (check that a "years ago" is the calibration of a ¹⁴C
  figure) in its benign form.

## The P8 log — and what the whole pass came to

Eight terms, which finish the plan at **119 of 119**. Three findings, one of them a correction.

- **A CORRECTION THAT HAD NOT TRAVELLED, FOUND BY WRITING ITS SIBLING.** Batch 25 withdrew the claim that
  Blytt named the Atlantic and the Boreal — his own 1886 paper uses neither word as a phase name, and
  nothing openable settles who coined which of the five — and rewrote `wh-106` accordingly. `wh-105` still
  said "Blytt named it for that wetness", the same withdrawn claim on a different card, five batches later.
  It now reads "Its name records that wetness rather than the ocean", corrected **in all ten languages**
  through `split-abstract.js`'s `mark(abstract, map, replace)`, which replaces a sentence by index and left
  the card splitting 5+5 with its marker counts intact. Batch 26's rule, third confirmation: **a correction
  does not travel between cards on its own** — and writing the sibling term is the cheapest way to find that
  it hasn't.
- **`Boreal` NEEDED THE CASE-SENSITIVE FLAG, AND IT IS THE FIRST TERM IN THIS PLAN THAT DID.** The key
  humanizes to a word that is also an everyday adjective: `Canada`, `Northern_Hemisphere`,
  `Weichselian_glaciation` and `Fennoscandia` all say "boreal forest" or "boreal vegetation", and without
  `caseSensitive: true` every one of them would have linked to a Holocene chronozone. Verified live rather
  than reasoned: the Weichselian popup says "boreal vegetation" and does **not** link it, while the cards
  naming the chronozone do. **Before adding a one-word term, ask whether the word has a common-noun life**
  — it is the third kind of alias trap this pass has met, after the wrong-scheme synonym (N2) and the
  identity-asserting alias (N4).
- The two common nouns went the way P6's did: `Petroglyph` and `Control_of_fire` open on what the thing IS
  — an image cut rather than painted; the three separate achievements of using, keeping and kindling — and
  let the dates in afterwards as facts about the class.

### The pass in summary

Ten batches, **76 new terms**, and the plan's own premise held: every one was written from the card's
already-verified sources, so the whole pass cost no new reading beyond a handful of checks. What it bought
beyond the terms themselves was six defects that only writing a term next to a card could surface —
a broken DOI link (P9), a dead alias (P9), a self-linking auto-linker (P3), a permanently-red test (P3), a
measurement rendered two ways (P5), an uncited definitional block (P6) and an untravelled correction (P8).
**The pairing rule earns its keep as a review pass, not only as a coverage target.**
