# Glossary length plan — every description at 100 words (±10%)

**Opened Aug 2026, on request:** *"Although all glosses are currently three sentences, they vary widely in
length. I want each to be 100 words with a 10% margin. Plan batches to convert the current glosses to that
length."*

Not part of the site. This is the plan; the rule it establishes belongs in CLAUDE.md once the first batch
ships.

---

## The bar

**90–110 words**, counted on the rendered prose of the ENGLISH description: tags stripped, footnote markers
stripped, entities resolved, and — as on a card — **an imperial conversion not counted**. That last is the
house rule already written down in CLAUDE.md, and it matters here more than anywhere: a country term states
an area, and often a height and a length too, at three words of conversion each, so counting them would hold
the glossary to a tighter PROSE budget than the cards for no reason but its subject matter.
`.claude/gloss-length.js` is the measure, and it is the only measure — do not count by eye, and do not count
the HTML.

Three things the bar does **not** change, and they are what keeps this a length pass rather than a rewrite:

- **Still exactly three sentences.** The three-sentence rule is what makes a gloss popup a glance instead of
  a page, and 100 words across three sentences is ~33 words each — the same average a card's abstract runs
  at, which is a rhythm the corpus already reads well in.
- **Still impartial, deck-agnostic and self-contained.** Every rule in CLAUDE.md's "Add a glossary term"
  section stands. A term padded to length with a comparison to a sibling term has been made worse, not
  longer.
- **Still cited, and still at `GLOSS_SRC_TARGET`.** All 477 terms are at the bar today. A sentence that
  grows past what its marked source states needs a new source or a smaller claim — **the length is not a
  licence to assert more than the citations carry.** This is the single most likely way for the pass to do
  damage, and it is the thing to check on every term.

## Where it stands (measured 2026-08-04, `node .claude/gloss-length.js`)

| | |
|---|---|
| terms | **477** |
| already 90–110 | **64** |
| under 90 | **10** |
| over 110 | **403** |
| mean | 129.5 words |
| range | 43 (`Archaeology`) – 195 (`Spear-thrower`) |

```
  40– 59    1
  60– 79    4
  80– 99   33
 100–119   92
 120–139  216     <- the bulk
 140–159   88
 160–179   39
 180–199    4
```

So **413 terms need work and 64 are already there**, and the work is overwhelmingly *trimming*: 403 over
against 10 under. That asymmetry decides the shape of the pass — cutting a sentence back to what its source
states is quick and safe, where growing one is where fabrication gets in.

## The two kinds of edit, and why they are not the same job

**TRIM (403 terms).** A description at 135 words has about 30 words that are doing no work: a second example
where one served, a subordinate clause restating the main one, a date already on the term's own date line.
Cut those first, before touching a claim. If the term is still over after the padding is gone, drop the
*weakest* claim entire rather than shaving every sentence — three full sentences beat three clipped ones.

**GROW (10 terms).** These are the definitional ones (`Archaeology` 43, `Paleolithic` 68,
`Australopithecus` 68, `Iron_Age` 75, `Bronze_Age` 78) and they are short because their subjects are
*definitions*, which is exactly the class G8 found the literature does not pay for. **Do not pad them from
memory.** What a definitional term can honestly gain is the material the pass already has sources for: a
date range, a type site, the scheme it belongs to, the discipline's own statement of scope. If a term
cannot reach 90 words on what its sources bear out, **leave it short, record it here, and say so** — an
under-length term is a known gap; an invented sentence is a lie in a study tool.

## Batches

Cut by KIND, not by alphabet: terms of one kind share a shape, so the same trim works down a batch and the
sibling-consistency check that has caught so much in the citation passes (a date on one term contradicting
its neighbour) actually has neighbours to compare against. The first tag in `GLOSSARY_TAGS` is the kind.

| batch | scope | terms | over/under | notes |
|---|---|---|---|---|
| **L0** | tooling | — | — | **SHIPPED 2026-08-04.** `.claude/gloss-length.js` — the measure, plus `--over` / `--under` / `--tag=<kind>` / `--list`, and the per-kind table the batches below are cut from. |
| **L1** | `place`, A–E (countries) | 56 | 54 over | **SHIPPED 2026-08-04.** All 56 now 102–110 words, mean 107.3. See the log below. |
| **L2** | `place`, F–L | ~70 | ~66 | " |
| **L3** | `place`, M–R | ~70 | ~66 | " |
| **L4** | `place`, S–Z | ~56 | ~53 | " |
| **L5** | `place`, sites, regions and continents | ~40 | ~38 | Everything under `place` that is not a country: caves, gorges and type sites, the continents and oceans, and the odd river (`Awash_River`, which L1's filter turned up). Less formulaic; expect real judgement per term. |
| **L6** | `person` | 54 | 28 | Half are already close — the 45 US presidents were written to one template. Cheapest batch per term. |
| **L7** | `era` + `industry` | 44 | 36 | Do these two together: they share dates, and the sibling check across them is the one that caught the Palaeolithic end-date twice before. |
| **L8** | `hominin` + `fossil` + `animal` | 40 | 35 | Taxa. Watch the citations: a trimmed sentence must still be the one the marker points at. |
| **L9** | `object` + `culture` + `people` + `building` + `event` + `practice` | 45 | 40 | The tail, and the longest terms in the glossary (`Spear-thrower` at 195, `Dolní Věstonice` at 184). |
| **L10** | `concept` + the 10 short definitional terms | ~34 | 21 over, 10 under | **Last on purpose.** These are the GROW cases and the hardest; by L10 the register holds everything the other nine batches read, which is where the honest extra sentences will come from. |
| **L-audit** | the whole glossary | 477 | — | Re-measure. Report what is still outside 90–110 and why, term by term. |

Roughly 35–70 terms a batch; L1–L4 are the big formulaic ones and can go faster than the tail.

## The per-term workflow

1. `node .claude/gloss-length.js --over` (or `--under`) for the batch's list and current counts.
2. Read the term **with its sources open**. The trim is against what the cited works state, not against what
   the sentence sounds like it could lose.
3. Rewrite in place, keeping three sentences and every footnote marker on the claim it belongs to. **A marker
   whose sentence was cut has to move or go** — a marker pointing at a claim that is no longer there is the
   `wh-098` failure, and the audit cannot see it.
4. Re-measure. 90–110 or it does not ship.
5. `node .claude/add-sources.js` for the prose (it writes the English description), then
   `node .claude/gloss-source-audit.js` to confirm the citation standing did not move.
6. **English only, while `MULTILANG` is false.** The nine translations keep their current text; when
   translations resume they will need this pass run over them in their own idiom, which is a second pass of
   the same size and should be planned separately rather than smuggled into this one.

## Things to check before each batch closes

- **Sentence count is still three, in every term touched.** `node .claude/split-abstract.js` is the check;
  a trim that merges two sentences is the commonest way to end up at two.
- **No marker orphaned and no source unreferenced** (`add-sources.js` refuses both).
- **The date line was not absorbed into the prose.** A term with a `GLOSSARY_DATES` entry should not spend
  words restating it — that is free length to reclaim, and it is the first place to look on a term at 130.
- **Siblings still agree.** Trimming is where a hedge gets dropped: "scholars disagree about" costs four
  words and is the first thing a careless trim removes, which turns a contested claim into a flat one.

## The batch log

### L1 — 56 country terms, A–E (2026-08-04)

**56 terms, 54 of them over the bar; all 56 now sit at 102–110 words, mean 107.3.** The glossary as a whole
moved from 64 to 117 terms inside the bar and its mean from 129.5 to 127.2 words. Two terms — `Belarus`
(103) and `Denmark` (102) — were already inside it and were passed through untouched, which is the right
outcome and worth saying: this pass edits what is out of band, not everything it looks at.

**The measure was wrong before any prose was touched, and fixing it first is the reusable lesson.**
`gloss-length.js` counted imperial conversions; `add-card.js` has exempted them since the units pass, and a
country term carries two or three of them at three words each. Counting them held the glossary to a tighter
PROSE budget than the cards for no reason but its subject matter. Corrected, the baseline moved from 62 to 64
terms in band — small, but it is the difference between trimming prose and trimming parentheses.

**What a country term is made of, and where the 30 words come from.** Every one has the same three
sentences: FIGURES (area, region, population, borders, capital, marked to UNdata), GEOGRAPHY (landscape,
usually unmarked), HISTORY (colonial rule, independence, the modern state, marked to the recognition guide).
The padding is in two predictable places, and taking both is almost exactly the 30 words a 135-word term
needs to lose:
- **the border list, worth 9–13 words**, and the first thing to go. "Bordered by Mali, Niger, Benin, Togo,
  Ghana and Côte d'Ivoire" tells a reader less than "in West Africa" already did, and it is the most
  formulaic clause in the corpus. Keep it only where the borders ARE the fact (Bhutan wedged between China
  and India; Bangladesh almost surrounded by India).
- **the second and third clauses of the geography sentence.** These run on semicolons and are where a term
  lists a third landscape, a second river or a climate note after the point is made.
Tightening the remaining prose finds the last ten. **Cutting a whole clause beats shaving every sentence** —
three full sentences read better than three clipped ones, which is what the plan said and what the batch bore out.

**No figure was added or altered, and that is checked mechanically rather than trusted.** Diffing every
number in all 56 terms before and after: **zero added**, 23 dropped, each with the clause it sat in. Most are
asides (a causeway length, a strait width, the distance to the Galápagos), but three are substantive and are
recorded here rather than glossed over — `Afghanistan` lost "resisted British campaigns in the 19th and early
20th centuries", `Eritrea` lost the 1998–2000 border war with Ethiopia, and `Bulgaria`'s Cyrillic clause lost
its 9th- and 10th-century dating. **A trim to length removes real facts; the honest thing is to name which.**

**Two incidental finds.** `Bhutan` carried a typo — "a index it calls gross national happiness" — fixed in
passing. And `Costa_Rica`'s markers were both parked at the end of its third sentence, where the register
records that the 1821 clause is carried by the guide's **El Salvador** page and the 1848 by Costa Rica's own;
they now sit on their own claims. **A length pass reads every term slowly, which is when marker sloppiness
shows** — expect one or two of these a batch.

**Verified before shipping:** all 56 split into exactly three sentences and round-trip through
`split-abstract.js`; `gloss-source-audit.js` still reports 477/477 at the 2-source bar; `check-style.js` is
clean on glossary.js; `test-sources.js` passes 74/74; and a table-by-table diff confirms only descriptions
changed — sources, dates, tags, aliases, places and the Atlas map-country table are byte-identical.

## Status

**L0 and L1 have shipped** (2026-08-04). The glossary stands at **117 of 477 terms inside the bar**, mean
127.2 words. **L2 is next** — the same recipe, and it should go faster now that the shape is known: drop the
border list, take the geography sentence's tail, tighten. Re-run `gloss-length.js` before and after every
batch and record the movement here.
