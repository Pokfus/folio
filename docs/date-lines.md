# The card date line

**Read this before opening a batch of date lines.** `CLAUDE.md` keeps the rules — the key/value shape,
the labels, the compact deep-span notation, and the three ways a date line can yield the wrong sort year.
This file carries the account behind them, moved out of CLAUDE.md verbatim.

## The three parsing faults, with the cards they were found on (2026-09-12)

- **The century**: caught by `test-date-line.js` on `rm-047`, whose two rows both read "7th century BCE".
- **The era marker reaching only the year it follows**: found on `wh-268` (Aug 2026), where
  `1188 or 1177 BCE` parsed as 1188 CE beside 1177 BCE and ran a Bronze Age deck's coverage to the 12th
  century CE.
- **The `c.` inside a range**: found on `wh-284` (Aug 2026).

## The whole-deck conversion (2026-08-03)

**The whole deck was converted with `set-date-line.js`** — 11 batches, 112 cards: the date line had grown
into a summary of the card, sometimes three sentences under a one-word label, and is now the dates alone.
Two things worth keeping from that pass. **The sort order improved as a side effect** — fifteen cards
changed sort year and every one was a correction, because the old paragraphs carried excavation and
publication years that `cardYears` read as the card's own date (Atapuerca sorted at **1978 CE**, Denisova
Cave at 1977, Omo at 1967, Dolní Věstonice at 2016). **A card that states no era of its own needs the
sort year putting back by hand**: `wh-063` Paleo-Indians lost its only deep date when the Clovis figures
went, and sorted 5,000 years late until the Clovis row was restored — so run the before/after comparison
over `cardStartYear`, not just the eye, after a batch.

## The bullet as it stood in CLAUDE.md

- `answerDate` (the date line) — **the dates worth memorising beside the answer term, and nothing else**
(Aug 2026, on request). It is a KEY/VALUE LIST, not a paragraph: alternating `dt-k` / `dt-v` spans
inside ONE `<div class="dt">`, which is a two-column grid, so the labels align down the left and each
date sits beside the word naming what it is. A `<span class="dt-v dt-sub">` line continues under a
value with no label of its own — the place under a birth date.
```html
<div class="dt"><span class="dt-k">Born</span><span class="dt-v">12 February 1809</span><span class="dt-v dt-sub">LaRue County, Kentucky</span><span class="dt-k">Died</span><span class="dt-v">15 April 1865</span></div>
```
**The label names WHAT the date is** — `Era`, `Lived`, `In use`, `Occupied`, `Found`, `Named`,
`Coined`, `Painted`, `Born`, `Died`, `World Heritage` — and NOT the card's category, which is what the
old one-word key said (`Site`, `Species`, `Industry`) above a paragraph explaining the term all over
again. That paragraph is what this replaced: the background is where prose belongs, and a date line a
reader has to read is one they will not memorise.
**If the card has no obvious date, leave the field `""`.** An empty section is the right answer there —
it collapses to nothing (`.av-row:empty`), and a sentence apologising for the absence is not a date.
Write it with **`node .claude/set-date-line.js <batch.json>`** rather than by hand (`[[label, value], …]`
per card; the script builds the markup, so the shape cannot drift card to card). Both it and
`add-card.js` hold the field to `.claude/date-line.js`: at most 4 rows, a label of at most 16
characters, a value of at most 64 characters and 10 words, a number in every labelled row, and no
sentence. **Deep spans are written in the compact notation** — `115,000 – 11,700 BP`, `c. 4.2 – 2 Mya`,
`c. 2.6 Mya – 9700 BCE` — all of which `cardYears` parses, which is what keeps the deck in
chronological order (see the "Deep time" bullet).
**A CENTURY IS NOT A DATE `cardYears` CAN READ**, and a date line whose ONLY dates are centuries
therefore yields no sort year at all — the card falls to 0, "timeless", which on a deck running in
BCE puts it after every other card (Aug 2026, caught by `test-date-line.js` on `rm-047`, whose two
rows both read "7th century BCE"). Write the span the century MEANS — `c. 700 – 600 BCE` — which
asserts no precision the source has not got, since that interval IS the 7th century; a second row
may then say "7th century" in words. **The fix is in the DATE LINE, not in `cardYears`**: 52 of the
447 shipped date lines carry a century form beside a plain year, so teaching that function to read
centuries would silently move their sort years too.
**AND AN ERA MARKER ONLY REACHES THE YEAR IT FOLLOWS**, so a row naming two alternative years —
`1188 or 1177 BCE` — is read as 1188 **CE** beside 1177 BCE (Aug 2026, on `wh-268`). Write the era
on both: `1188 BCE or 1177 BCE`. The sort year is usually unaffected, which is why nothing reports
it: `cardStartYear` takes the MINIMUM, so the stray positive hides there and surfaces only in
`cardSpanYears`, where it runs a Bronze Age deck's coverage to the 12th century CE.
**AND A `c.` INSIDE A RANGE BREAKS THE ERA'S LEFTWARD CARRY** (Aug 2026, on `wh-284`). A range writes
the era once and lets it carry back to the first number — `668 – 631 BCE` yields −668 and −631 — but
`668 – c. 631 BCE` yields only **−631**, the approximation mark standing between the two. The failure
is the opposite way round from the one above and LOUDER, since the lost year is usually the EARLIER
one and `cardStartYear` takes the minimum: the card silently sorts by whatever else its date line
happens to name. Write the era twice (`668 BCE – c. 631 BCE`) or move the `c.` to the front
(`c. 668 – 631 BCE`) — both parse. **Read the sort year back after writing a date line**, which is
two lines of Node against `cardYears` and is the only thing that can see this.
