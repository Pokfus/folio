# The claim check — does the source say what the sentence says?

`.claude/verify-claims.js` (Nov 2026). The header of the script is the manual; this file is the reasoning.

## What was already checked, and what was not

| checker | what it proves | what it cannot see |
|---|---|---|
| `add-card.js` / `add-sources.js` | every citation ends in a URL; every source has a marker | anything about the source's content |
| `check-links.js` | the URL still answers | a live page that says something else |
| `check-citations.js`, `check-cite-authors.js` | authors and year match Crossref / Europe PMC | whether the paper says what the sentence claims |
| the refinement audits (Greece, Rome, World History, China) | a Claude session re-read the sources claim by claim | the other collections were never read this way |

So until this script, no automated check ever asked whether a sentence's footnote **supports** it.

## How it works

One request per (card, footnote number): the sentences of the abstract and the "Think it through"
answers that carry that marker, plus an excerpt of the cited source. Sources are fetched once and
cached: archive.org items through their OCR `_djvu.txt`, PubMed Central through Europe PMC's full text
(PMC answers scripts with a challenge), PDFs through `pdftotext`, and a DOI through the publisher and then
Crossref's abstract. A long text is cut down to the passages that best match each sentence's own rare
words (names, numbers), so the excerpt stays about 14,000 characters.

The model gives each sentence one of: **supported**, **partial**, **not_in_excerpt** (could not tell —
not an accusation), **contradicted**, and must quote the passage. **A quote that is not in the excerpt
word for word turns the verdict into `unverified`**: this is checked in the script, not trusted to the model.
A page that is not the cited work at all (paywall, cookie notice, error page) is reported apart.

## What it costs (measured on samples of 25–40 cards from rm-, ps-, cnh-, us-, Nov 2026)

About 3,500 input tokens per pair; about 76,800 pairs over 11,220 cards. Output per pair is a guess
(about 700 tokens with thinking) until a pilot measures it; the script switches to the measured average
after 50 requests. Batch prices (half the standard rate):

| model | whole corpus, batch | per $100 |
|---|---|---|
| Haiku 5.5 | ≈ $40 | the whole corpus, more than twice |
| Sonnet 5.5 | ≈ $540 | ≈ 2,000 cards |
| Opus 5.5 | ≈ $1,080 | ≈ 1,000 cards |

**Run a pilot first** (about 50 cards, a few dollars) to measure the real output size and to read the
flagged rows by hand: that tells you how often the model is wrong before you spend more.

## Money

`--budget=USD` is a ceiling across all runs (`ledger.json` remembers what was spent). `--run` sends
batches of `--chunk` requests, collects each one, adds the **actual** cost from the API's usage figures,
and does not send a chunk whose estimate would cross the ceiling. A chunk can come in above its estimate,
so the ceiling can be passed by a little; a smaller `--chunk` keeps that small. Also set a spend limit
in the Anthropic Console: that one is enforced by the account, not by this script.

## Reading the report

`.claude/.claimcheck/report.md` lists `contradicted`, then `unverified`, then `partial`. **Every row is a
question.** Open the source, decide, and fix the card with the usual writers (`fix-field.js`,
`add-sources.js`). A keyword excerpt can miss the passage, so `not_in_excerpt` is never a reason to drop a claim.
