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

**50 of 119 cards have an entry for their answer term. 69 do not.** (42 of 119 when the plan opened;
**P9 shipped 2026-08-03** and took it to 50.)

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
| **P1** | `wh-012`, `wh-019`, `wh-020`, `wh-021`, `wh-025`, `wh-026`, `wh-027`, `wh-028` | Last Glacial Period; Homo ergaster; Turkana Boy; Wonderwerk Cave; Java Man; Peking Man; Zhoukoudian; Homo antecessor |
| **P2** | `wh-029`, `wh-030`, `wh-035`, `wh-036`, `wh-037`, `wh-038`, `wh-039`, `wh-040` | Atapuerca Mountains; Homo heidelbergensis; Denisovans; Denisova Cave; Homo naledi; Homo floresiensis; Liang Bua; Homo luzonensis |
| **P3** | `wh-041`, `wh-042`, `wh-044`, `wh-045`, `wh-046`, `wh-047`, `wh-048`, `wh-050` | Neanderthal extinction; Toba catastrophe theory; Omo remains; Jebel Irhoud; Homo sapiens idaltu; Mitochondrial Eve; Y-chromosomal Adam; Aterian |
| **P4** | `wh-052`, `wh-053`, `wh-054`, `wh-055`, `wh-056`, `wh-058`, `wh-059`, `wh-060` | Howiesons Poort; Sibudu Cave; Border Cave; Klasies River Caves; Pinnacle Point; Behavioural modernity; Madjedbebe; Lake Mungo remains |
| **P5** | `wh-062`, `wh-063`, `wh-064`, `wh-065`, `wh-067`, `wh-068`, `wh-069`, `wh-070` | Settlement of the Americas; Paleo-Indians; Cro-Magnon; Châtelperronian; Lion-man; Hohle Fels; Venus of Hohle Fels; Divje Babe flute |
| **P6** | `wh-072`, `wh-073`, `wh-074`, `wh-076`, `wh-080`, `wh-081`, `wh-082`, `wh-083` | Venus figurines; Venus of Willendorf; Dolní Věstonice; Mal'ta-Buret' culture; microlith; spear-thrower; bow and arrow; cave painting |
| **P7** | `wh-087`, `wh-089`, `wh-090`, `wh-091`, `wh-092`, `wh-093`, `wh-094`, `wh-095` | Cosquer Cave; Quaternary extinction event; Younger Dryas; Clovis culture; Clovis point; Folsom tradition; Monte Verde; Meadowcroft Rockshelter |
| **P8** | `wh-097`, `wh-098`, `wh-100`, `wh-101`, `wh-103`, `wh-104`, `wh-105`, `wh-106` | petroglyph; control of fire; Epipaleolithic; Nordic Stone Age; Preboreal; Boreal; Atlantic period; Blytt–Sernander sequence |
| **P9** ✅ | `wh-107`, `wh-108`, `wh-109`, `gr-001`, `gr-002`, `gr-003`, `gr-004`, `gr-005` | Holocene climatic optimum; post-glacial rebound; 8.2-kiloyear event; Aegean Bronze Age; Cycladic civilisation; Cycladic figurines; Keros; Early Minoan Crete — **shipped 2026-08-03** |
| **P10** | `gr-006`, `gr-007`, `gr-008`, `gr-009`, `gr-010` | Minoan civilisation; Arthur Evans; Knossos; Minoan palace; Throne Room at Knossos |

**Run P9 and P10 first.** *(P9 is done; P10 is next.)* The Ancient Greece collection is the one being grown, its glossary starts from
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
