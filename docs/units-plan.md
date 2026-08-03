# Measurements: metric first, imperial in parentheses — the plan

*Opened 2026-08-03, on request: "we're not very consistent with measurement systems, sometimes using
imperial and sometimes metric units. In all current and future cards and gloss, use the metric system first
with the imperial units in parentheses after it."*

Not part of the site.

## The rule (now in CLAUDE.md, binding on every future card and glossary term)

**Every measurement is written metric first, with the imperial equivalent in parentheses after it:**
`about 2,400 kilometres (1,500 miles)`, `18,272 km² (7,055 sq mi)`, `1.6 metres (5 ft 3 in)`.

Four riders:

1. **This is the one documented exception to the house rule against parentheses.** The abstract style says
   "no parenthetical asides — never put information between parentheses"; a unit conversion is not an aside,
   it is the same measurement said twice, and there is no other punctuation that reads as naturally. The
   ban stands for everything else.
2. **Round the conversion to the source figure's own precision.** `1,500 miles` is two significant figures,
   so it becomes `2,400 kilometres`, never `2,414`. A conversion carrying more precision than the
   measurement it converts is a claim the source does not make.
3. **Never convert a figure the source states in metric into an imperial figure the source does not
   state, and then cite the source for it.** The conversion is arithmetic and needs no citation of its own;
   the marker stays on the metric figure, which is what the work actually says.
4. **Scientific units stay bare.** Cranial capacity in cubic centimetres, ages in years, isotope ratios,
   radiocarbon determinations — a card that gave `940 cubic centimetres (57 cubic inches)` would be worse,
   not better. The rule is for the everyday dimensions a reader pictures: distance, length, height, area,
   weight, temperature.

## Where it stands, measured

The shipped content is already all but entirely metric — the inconsistency the request names turned out to
be **one** place, now fixed:

- **`gloss:Obsidian`** — "over 1,500 miles away" → **"over 2,400 kilometres (1,500 miles) away"**. This is
  the only imperial-first measurement in 119 cards and 401 glossary terms. (It got there honestly: the
  claim comes from a US National Park Service page, which states miles.)

What remains is the other half of the rule — metric figures that do not yet carry their imperial
equivalent:

| | fields | figures | |
|---|---|---|---|
| cards (question, extras, abstract, date line) | 51 of 119 | 108 | **done** |
| glossary descriptions | 307 of 401 | 361 | **done** |

**469 conversions in all** — more than the 360 first counted, because the count had missed the figures
written at word scale (`14 million km²`) and the ones inside ranges (`between 400 and 700 m`), both of which
a digit-then-unit regex walks straight past. All applied 2026-08-03.

## Why it is a planned pass rather than a script

Two things stop this being a find-and-replace, and both are worth knowing before anyone starts:

- **49 of 119 abstracts are already within 12 words of the 330-word ceiling.** A conversion costs about
  three words; a card with four measurements costs twelve. So a card at 320 words cannot simply take its
  conversions — something else has to come out, and choosing what is editorial work, not arithmetic.
  **Re-run the word count after every card.**
- **The glossary's country terms are the bulk of it** (an area and sometimes a population apiece). Those are
  three-sentence descriptions with no word ceiling, so they are the cheap half — but every one of them is
  cited, and rule 3 above applies: the marker must stay attached to the figure the source states.

## The batches

| batch | scope | status |
|---|---|---|
| **U1** | the ~24 flagged cards of `docs/history-focus-plan.md` | **done** — folded into the same pass as U2 rather than waiting on the rewrites |
| **U2** | the remaining cards with figures | **done** — 108 conversions across 51 abstracts, 11 questions and 9 question pools |
| **U3** | glossary — the 191 country terms | **done** — 194 areas, one `add-sources.js` batch |
| **U4** | glossary — the rest | **done** — 151 lengths, heights, weights and temperatures, plus 16 million-km² figures |

**Nothing metric is left bare.** The sweep that says so is worth keeping, because it is what will catch the
next figure written without its equivalent: walk every card field and every glossary description for a
number followed by a metric unit, and skip any already followed by a parenthetical containing an imperial
one. It reports **0** across 119 cards and 414 terms.

**RUN A SECOND SWEEP FOR SPELLED-OUT NUMBERS.** The one above looks for a digit, so it is blind to "about
four miles inland", "cleared about two acres", "a third of a metre down", "barely a centimetre thick" —
seventeen figures in all, including the corpus's SECOND imperial-first measurement, which sat in
`gr-008` and was found only by reading the card in order to write its glossary term (P10 of
`docs/card-glossary-pairing.md`). The pattern is a number word immediately before a unit — and the word
list must include the VAGUE ones (`a few`, `several`, `a couple of`, `dozen`) as well as the counting ones
(`a`, `two`, `three`, `hundred`, `half`, `a third of a`): the corpus's THIRD imperial-first figure was
"a few inches under the herbage" on `gr-010`, and a list without `few` in it walks straight past. The line drawn: a **definite** spelled-out quantity gets its
conversion, an explicitly **indefinite** one does not — "several hundred metres" converts to "several
hundred yards", which is the same vagueness in different words. And "a foot bone" is not a measurement.
**But an indefinite IMPERIAL quantity is still turned round**, because metric-first is a separate rule from
conversion and applies whether or not a number is definite: "a few inches under the herbage" becomes "a few
centimetres", with nothing in parentheses, since there is no figure to convert.

## What the pass changed about the rules

- **The word limits do not count a conversion** (2026-08-03, on request: *"you can ignore the word limits
  when adding parentheses imperial units"*). Without that, the pass was unrunnable as written above — a
  question is held to 20–34 words and an abstract to 270–330, and four measurements cost about twelve. It
  is enforced rather than trusted: `add-card.js` and `add-questions.js` both strip a parenthetical that
  contains a digit and an imperial unit (`IMPERIAL_PAREN`) before counting, so the **prose** limits stay
  exactly as binding as they were. **Strip the leading whitespace with it** — without that the stripped
  parenthetical leaves the following full stop stranded as a word of its own, which read as two abstracts
  having grown over the ceiling when neither had. Measured properly, the finished corpus has the same 4
  over-length abstracts and 1 out-of-range question it had before the pass began, against 11 and 4 if the
  conversions are counted.
- **English only.** Like every other content change since the `MULTILANG` gate went up, the conversions were
  written into the English and not into the nine translations. A translated abstract keeps the bare metric
  figure it always had; when translations resume, each language takes its own conversions (and its own
  decimal comma).

## Conventions the pass settled

These were decided once and applied everywhere, so a future figure should follow them rather than be argued
about again:

| metric | imperial | note |
|---|---|---|
| km² | sq mi | an EXACT source figure converts to a whole number; a ROUND one keeps its own significant figures — `28,748 km² (11,100 sq mi)`, `86,600 km² (33,400 sq mi)` |
| km | miles | |
| m | feet | but **feet and inches under 4 m**, which is where a figure describes a person or an object — `1.05 metres (3 ft 5 in)` |
| cm / mm | inches | |
| kg | pounds | |
| tonnes | tons | |
| hectares | acres | |
| °C | °F | sign carried; `−89.2 °C (−129 °F)` |
| N million km² | N million sq mi | written out in full below a million — `2.2 million km² (850,000 sq mi)` |

A **range** takes one parenthetical for both ends, in the source's own order: `between 400 and 700 m
(1,300 to 2,300 feet)`, `some 5.5 to 8 tonnes (6.1 to 8.8 tons)`. Converting only the second number, which
is what a naive find-and-replace does, reads as a conversion of the range.

## One thing this pass broke, and fixed

`add-sources.js` and `add-glossary.js` rebuild `glossary.js` from a **fixed list of tables**, so a table
they do not know about is silently dropped on the next write — which is what happened to
`GLOSSARY_PLACES` and `GLOSSARY_MAP_COUNTRY` (the Atlas marker's coordinates and country join, added the
same day) the first time a citation batch ran after them. Both writers now carry every table. **If you add
a `window.GLOSSARY_*` table, add it to both serializers**, or the next content batch deletes it.
