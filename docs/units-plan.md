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

| | fields | figures |
|---|---|---|
| cards (question, extras, abstract, date line) | 51 of 119 | 108 |
| glossary descriptions | 211 of 401 | 252 |

**360 conversions in all.** Not urgent, not risky, and not free.

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

| batch | scope | notes |
|---|---|---|
| **U1** | the ~24 flagged cards of `docs/history-focus-plan.md` | Fold the conversions into those rewrites. Those abstracts are being reopened anyway, and the word budget is being spent deliberately rather than twice. |
| **U2** | the remaining cards with figures | Card by card, with a word count after each. `fix-field.js` for `answerDate` and `question`; `add-questions.js --partial` for the extras. |
| **U3** | glossary — the 191 country terms | Areas and populations. Mechanical, but do them in runs of ~20 with `add-sources.js` (passing each term's existing `sources` back unchanged), and re-run `gloss-source-audit.js` after each run. |
| **U4** | glossary — the rest | Palaeolithic and physical-geography terms: lengths, depths, ice thicknesses. Rule 4 bites hardest here — check each figure is one a reader pictures before converting it. |

Nothing here changes what the site says. It changes how a reader who thinks in feet reads it.
