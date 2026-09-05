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

## Two notes on the tooling

- **`cardYears` reads "594/3 BCE" as year 3.** Writing split years the short way in a date line
  sorts the card to the wrong millennium, silently. Write them out: "594/593 BCE".
  `test-date-line.js` catches the century-only case but not this one.
- **All 353 Bryn Mawr Classical Review URLs answer 502 from this sandbox**, in parallel and one at
  a time alike, and `ascsa.edu.gr` refuses the connection outright. Neither is a dead link; both
  are this container. Wikimedia rate-limits image requests to 429 after about thirty.
