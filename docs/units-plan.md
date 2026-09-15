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

## Amended the same day: the reader picks ONE system

*"We will replace this with another system: it will show only one of either, and in the settings a user can
choose which system they want to use."*

**The authoring rule above is unchanged, and this is the point.** The corpus stays metric-first with the
imperial equivalent in brackets, because that is the only form that carries BOTH figures — which a batch
script, a citation pass, a translator and a future reader of the data files all need. What changed is the
DISPLAY: `S.settings.units` (Settings → Appearance → Measurements) decides which of the two a reader is
shown, and they are never shown both.

The transform is `unitizeText` / `unitizeTree` in app.js — see the "Measurements: ONE system" bullet in
CLAUDE.md for how it works and why it is a DOM text-node pass rather than a hook in the content accessors.
Three consequences for anyone working on content:

- **Keep writing `about 37 kilometres (23 miles)`.** A bare metric figure is not wrong, but it will read
  the same in both systems, which is a gap rather than a decision.
- **A conversion still costs no words**, since `IMPERIAL_PAREN` is stripped before the length checks in
  `add-card.js` / `add-questions.js`.
- **After a units batch, re-run the corpus check** described in the CLAUDE.md bullet: every bracket that
  looks imperial must be recognised, and no other bracket may be touched. At the time of writing that is
  341 fields transformed, 0 missed and 0 false positives.

## Sep 2026 — the three blind spots, and the one backlog they leave

Found by asking what the committed sweeps in `.claude/test-units.js` could NOT see. All three had shipped
to readers; none of them threw, and the authored metric view looked perfect in every case.

### 1. A temperature spelled out is a measurement with no bracket at all

Every sweep in that file returns early on a field holding no `(`, so a metric figure with no imperial
equivalent beside it is invisible to all of them — and `U_METRIC` lists `°C` while knowing no word for it,
`U_IMP` `°F` likewise. `bio-030` and its paired glossary term `Specific_heat_capacity` both wrote

> the kilocalorie having been defined as the energy needed to raise one litre of water by **one degree
> centigrade**

which is a DIFFERENCE, shown to every reader in Celsius with nothing to say so. It is the mirror of the
`Fahrenheit` hole recorded above, one step further out: there the bracket existed and was merely
unrecognised.

Both were rewritten to `1 °C (1.8 °F)` — **a difference takes ×1.8 with no offset**, so 1 °C is a rise of
1.8 °F and not 33.8 °F. The prose also stopped claiming a DEFINITION: Alberts (NBK26883) defines the
kilocalorie in Celsius, so "defined as … by 1.8 °F" would have been false for an imperial reader, where
"a kilocalorie being the energy needed to raise one litre of water by 1 °C (1.8 °F)" is a statement of
magnitude and true in both renderings. `bio-030`'s question 2 went with it: "by only six tenths of a
degree" names no scale at all, and an imperial reader read it as six tenths of a Fahrenheit degree.

**Closed by a committed check**: `test-units.js` now fails on a temperature SCALE named in words
(`centigrade`, `Celsius`, `Fahrenheit`, `degrees C/F`) anywhere in the corpus, with a liveness assertion
pinning the pre-fix sentence so the rule cannot quietly stop firing.

**A bare `degrees` is deliberately NOT in that rule.** The corpus writes the word 172 times and 156 of
them are latitude, an angle of slope, "a high degree of autonomy" or "its degree of disorder"; a rule
claiming the word would report the language rather than a fault.

### 2. The sweeps only ever looked at five fields

`question`, `answer`, `answerDate`, `abstract`, `answerText` and the question pool — while the transform
is a DOM text-node pass that reaches **everything a reader is shown**. Widening the walk to `why`, a
picture's `title`/`desc`/`alt` and a map or artwork card's `facts` grid took the corpus sweep from 1,667
fields to 2,003 and found the last two faults immediately:

- **`gr-712`'s picture caption** read "now several kilometres (two miles) inland". `U_RUN` needs a NUMBER
  and "several" is not one, so the run never started and the bracket was invisible — both systems on
  screen at once. It was also self-inconsistent (several kilometres is not two miles) and the figure was
  uncited: Livius, the card's own source for the site, says only that the harbour "was silting up", and
  nothing openable was found that states a distance. **The figure went rather than being invented**; the
  caption now says what the photograph and the cited article both support.
- **`art-005`'s Size row** read `136 × 54 cm (54 × 21 inches)`. `×` is in neither `U_JOIN` nor `U_FILL`,
  so the run stopped at 136 and `isImperialParen("54 × 21 inches")` was false. Rewritten to the `by` form,
  which `test-units.js` already pins.

### 3. `set-facts.js` refused the artwork cards

The artwork card format ships a `facts` grid and that helper was written for map cards, so it died with
"not a map card" — meaning the only field the artwork format adds had **no sanctioned writer at all**, and
the next edit of one would have gone by hand straight into `data.js`. It now takes both, with the row
bounds **sliced out of `add-card.js` by text** (a map card's minimum and an artwork card's differ) and the
run stopping if the slice fails.

### Teaching the engine `×` was built, measured and NOT taken

The obvious alternative to rewriting `art-005` was to add `×` to `U_JOIN` and `U_FILL`. It was implemented
and proved against the whole corpus in both systems — 56,702 renderings, 0 changed — so it is safe in the
narrow sense. It is still refused, for three reasons worth having before anyone rebuilds it:

- `U_FILL` governs what a bracket may be MADE of, i.e. what may be **eaten** out of ordinary prose, which
  is the one failure this engine must not have (it corrupts text for the imperial reader alone, so the
  authored view looks perfect and nothing reports it).
- **9 of the corpus's 10 `×` sites are MULTIPLICATION** — `6.02214076 × 10²³`, `2 × 10¹⁹`, `18 × 20` —
  so the character mostly does not mean what the widening would claim it means.
- One card is affected. `by` is a shape the suite already pins.

If the Visual Art collection later wants `×` as its dimension convention across ~1,000 Size rows, that is
a deliberate engine change with its own batch and its own before/after proof — not a fix smuggled in
beside a card edit.

### The backlog this leaves: a bare temperature degree, 16 sites

Measured Sep 2026 over cards, why-answers, captions, facts grids and the glossary. These write a
temperature degree with no scale named, so an imperial reader reads a Celsius figure as a Fahrenheit one.
It is a content pass rather than a sweep, because **four of them are vague comparatives that may well be
right as they stand** and converting them would invent precision.

| where | what it says | kind |
|---|---|---|
| `wh-064` abstract + why3 | "a cooling of only about 1.5 degrees" | difference |
| `wh-104` abstract | "perhaps 10 to 14 degrees colder than today" | difference |
| `wh-113` abstract ×2 + why3 | "0.7 degrees above … 0.3 degrees below" | difference |
| `gw-229` abstract | "risen by about half a degree in the last century" | difference |
| `gloss:Toba_catastrophe_theory` | "a cooling of only about 1.5 degrees" | difference |
| `gloss:Younger_Dryas` | "perhaps 10 to 14 degrees colder than today" | difference |
| `gloss:Atlantic_period` | "about one and a half degrees warmer than today" | difference |
| `gw-145` abstract | "a degree or two colder" | vague |
| `gw-184` abstract | "varying only a degree or two between seasons" | vague |
| `gw-196` abstract | "dropping only a few degrees in the cooler months" | vague |
| `gc-514` abstract | "they run several degrees colder on average" | vague |
| `gw-678` abstract | "the coldest month sits three degrees under freezing" | **absolute** |
| `gloss:Mongolia` | "winters can fall below minus 40 degrees" | **absolute** |

**The two absolutes are the traps.** "Three degrees under freezing" is −3 °C, i.e. 26.6 °F — not three
degrees under freezing on the Fahrenheit scale, which is 29 °F. And −40 is the one temperature at which
the two scales coincide, so `Mongolia` is accidentally right in both and must not be "corrected" into
something that is only right in one.

Correctly left alone by that measure and not part of the backlog: latitude (`gw-069`, `gw-757`,
`gloss:Milankovitch_cycles`, `gloss:African_humid_period`), an angle of slope (`gw-541`), "a high degree
of autonomy" (`gw-104`, `gloss:Hong_Kong`), "its degree of disorder" (`bio-076`, `gloss:Bioenergetics`),
"to an incredible degree" (`rm-339`), and `Specific_heat_capacity`'s own first sentence — "the energy
required to raise the temperature of a given mass of it by one degree" is scale-free and is the
definition, so it is right as it stands.

## Sep 2026 — `IMPERIAL_PAREN` could not match the house form, in nine files

**A `\b` between a SPACE and a DEGREE SIGN can never match**, because both are non-word characters — and
that is where every copy of the pattern had put the `°F` alternative:

```
[^)]*\b(?:miles?|foot|feet|…|sq\s?mi|°F)\b[^)]*\)      ← °F is unreachable
[^)]*(?:\b(?:miles?|foot|feet|…|sq\s?mi)\b|°F\b)[^)]*\) ← fixed: °F carries its own boundary
```

So **the rule "an imperial conversion does not count" was not being applied to temperatures at all**,
except in the minority spelling: `(1.8°F)` was stripped and `(1.8 °F)` was charged in full. The house form
is the spaced one — **725 sites against 127** — so almost every temperature conversion on the site was
costing its card or term about two words it was not supposed to cost.

It is the length rule fighting the units rule through a regex bug: a glossary term already at the
110-word ceiling could not be given a `(2.7 °F)` at all, which is how it was found — writing exactly that
bracket onto `Toba_catastrophe_theory`.

**Measured over the whole corpus, before and after.** Both directions are the stated rule being applied
correctly for the first time, so neither is a regression:

| | before | after |
|---|---|---|
| card backgrounds over 330 | 9 | **2** |
| card backgrounds under 270 | 0 | **9** |
| glossary terms outside 90–110 | 0 | **2** |

Seven cards were never over-length; nine were only inside the floor because their conversions were being
counted. **Three questions** count differently and none changes band (`check-questions.js` listed no `°F`
at all, which is the same defect wearing different clothes).

### The backlog this leaves: 11 items genuinely short of the floor

Each needs a sentence extended from a source it already cites — not padding, which is the one way a
length pass can do real damage.

| | words | short by |
|---|---|---|
| `gw-645` | 262 | 8 |
| `gw-620` | 264 | 6 |
| `gw-658` | 265 | 5 |
| `gw-046` | 266 | 4 |
| `gw-052` | 266 | 4 |
| `gw-043` | 267 | 3 |
| `gw-070` | 267 | 3 |
| `gw-644` | 267 | 3 |
| `gw-041` | 269 | 1 |
| `gloss:Shenyang` | 86 | 4 |
| `gloss:Hunan` | 88 | 2 |

### …and the hazard that is NOT fixed: the pattern exists nine times, in three versions

`add-artefact-sources.js`, `add-artefacts.js`, `add-card.js`, `add-place-info.js`, `add-questions.js`,
`atlas-audit.js`, `card-length.js`, `gloss-length.js` and `check-questions.js` each carry their own copy,
and they are **not the same pattern**: one adds `gallons?|pints?|quarts?`, and `check-questions.js`'s
lists `sq ft|in|yd` while listing no `°F` at all. The boundary is now fixed in all nine and the lists are
deliberately left as they are — unifying them changes what three tools count and wants its own
before-and-after measurement. **One file should own the pattern and the rest should slice it out by text,
stopping if the slice fails**, which is what `set-facts.js` and `check-cards.js` already do for their own
shared rules. Until that happens, **a change to one copy is a change to one copy.**
