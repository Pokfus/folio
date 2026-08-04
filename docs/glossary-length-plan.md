# Glossary length plan — every description at 100 words (±10%)

**Opened Aug 2026, on request:** *"Although all glosses are currently three sentences, they vary widely in
length. I want each to be 100 words with a 10% margin. Plan batches to convert the current glosses to that
length."*

Not part of the site. This is the plan; the rule it establishes belongs in CLAUDE.md once the first batch
ships.

---

## The bar

**90–110 words**, counted on the rendered prose of the ENGLISH description:
tags stripped, footnote markers stripped, entities resolved. `.claude/gloss-length.js` (below) is the
measure, and it is the only measure — do not count by eye, and do not count the HTML.

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
| already 90–110 | **62** |
| under 90 | **10** |
| over 110 | **405** |
| mean | 131.8 words |
| range | 43 (`Archaeology`) – 195 (`Spear-thrower`) |

```
  40– 59    1
  60– 79    4
  80– 99   32
 100–119   78
 120–139  201     <- the bulk
 140–159  117
 160–179   39
 180–199    5
```

So **415 terms need work and 62 are already there**, and the work is overwhelmingly *trimming*: 405 over
against 10 under. That asymmetry decides the shape of the pass — cutting a sentence back to what its source
states is quick and safe, where growing one is where fabrication gets in.

## The two kinds of edit, and why they are not the same job

**TRIM (405 terms).** A description at 135 words has about 30 words that are doing no work: a second example
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
| **L1** | `place`, A–E | ~70 | ~66 | The country terms. Highly formulaic (figures / history / accession), so one trim pattern covers the batch. |
| **L2** | `place`, F–L | ~70 | ~66 | " |
| **L3** | `place`, M–R | ~70 | ~66 | " |
| **L4** | `place`, S–Z | ~56 | ~53 | " |
| **L5** | `place`, sites & regions | ~30 | ~28 | The non-country places: caves, gorges, type sites. Less formulaic; expect real judgement per term. |
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

## Status

**L0 has shipped** (2026-08-04): `node .claude/gloss-length.js` is the measure, and every figure in this
document came out of it rather than out of an estimate. **L1 is next.** No prose has been edited — the
count above is the baseline the pass will be measured against, so re-run L0 before and after every batch
and record the movement here.
