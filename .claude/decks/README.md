# The Mandarin deck generators

These build the five `.folio-deck.json` files in `decks/`. **Not part of the site** — nothing here is
loaded by it, and a deck file is imported through the Studio exactly as a stranger's would be, through
`uDeckNormalize`, with no privileged path of any kind.

They live here for the reason `build-era.js` and `fetch-book.js` do: `decks/` holds 22 MB of generated
data, and generated data whose generator is on somebody's disk is data nobody can correct.

## What they need, and where it comes from

None of the source data is committed — it is 130 MB and it belongs to other people. Fetch it into a
working directory and run the scripts from there.

| file | what it is | where |
|---|---|---|
| `cedict.u8` | CC-CEDICT, ~124,800 entries (CC BY-SA 4.0) | mdbg.net's `cedict_1_0_ts_utf-8_mdbg.txt.gz` |
| `complete.json` | the HSK lists with ICTCLAS part-of-speech tags | `drkameleon/complete-hsk-vocabulary` |
| `mmah.txt` | character decompositions and radicals | `skishore/makemeahanzi`'s `dictionary.txt` |
| `cmn.tsv` `eng.tsv` `link.tsv` | Tatoeba sentences and their links (CC BY 2.0 FR) | tatoeba.org's weekly exports |
| `freq_full.txt` | OpenSubtitles 2018 Mandarin word frequencies (CC BY-SA 4.0) | `hermitdave/FrequencyWords`, `content/2018/zh_cn/zh_cn_full.txt` |
| `up1.txt` … `up6.txt` | the official HSK 3.0 level lists, as text | the published PDFs, run through `pdftext.js` |
| `l79.html` | the levels 7–9 band | hanzistroke.com's page for it — there is no PDF |

## The order

    node extract79.js l79.html          # → up7.json  (512 characters + 5,088 words)
    node build2026b.js                  # → w26-1..7.json   the words, readings, traditional forms
    node mw2026.js                      # adds measure words
    node extras.js                      # adds the character breakdown and the example sentences
    node extras2.js                     # the same for HSK 2.0 (words1.json / words2.json)
    node build-hsk30.js                 # → decks/HSK3.0-Mandarin.folio-deck.json
    node build-hsk20.js                 # → decks/HSK1-Mandarin, HSK2-Mandarin
    node build-extra.js                 # → decks/Mandarin-Phrases, Mandarin-Idioms

`extras.js` is **both a script and a module**: required, it runs down to the pool and the segmenter and
stops, which is how `build-extra.js` gets the same corpus, the same traditional-script exclusions and the
same sentence selection as the vocabulary decks rather than a second copy of them.

## The two files to read before changing anything

`deckcore.js` holds the card type — one type, two templates, so a word is one note asked in both
directions — and every field builder. `phrasepick.js` holds the rule that decides whether a CC-CEDICT
entry is a phrase, an idiom or a word, and records the versions of that rule that were tried and measured
and thrown away. The findings that cost the most to get are written into those two files and into the
`decks/` entry in `CLAUDE.md`.

## Checking them

    node check-decks.js      # imports every deck in decks/, studies it, reads what is on the card
    node check-reverse.js    # the reverse card: a two-note cut, studied all the way through

Both need Playwright, which is a dev dependency and must not be installed into the repo — install it in a
scratch directory and run with `NODE_PATH=<that>/node_modules`, as `.claude`'s other browser tests do.

Two things they exist to catch, and neither shows up in any count. **After a reveal BOTH sides of the card
are in the document** — the front stays, hidden by CSS, because the back renders `{{FrontSide}}` — so the
back is the LAST `.uc-card` and never the first; reading the first one reports a card with no reading, no
definition and no character breakdown, which is exactly what a broken template would look like. And **the
reverse card is not reachable by grading Good**: that sends a new card to its ten-minute learning step and
straight back into the queue, so a four-card run of Goods deals the same two words twice.
