# The Mandarin deck generators

These build the three `.folio-deck.json` files in `decks/`. **Not part of the site** — nothing here is
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
    node build-mandarin.js              # → decks/Mandarin-Chinese.folio-deck.json
    node build-hsk20.js                 # → decks/HSK1-Mandarin, HSK2-Mandarin
    node build-extra.js                 # the phrases and the idioms, as two decks of their own

`build-mandarin.js` is the one that writes what ships: it requires `build-extra.js` as a MODULE and files
its two lists as the eighth and ninth subdecks of the one deck. Run on its own, `build-extra.js` writes
them as two separate decks instead — the same rows either way, so it is one flag rather than two builders,
and the standalone files are not in `decks/` today.

`extras.js` is **both a script and a module**: required, it runs down to the pool and the segmenter and
stops, which is how `build-extra.js` gets the same corpus, the same traditional-script exclusions and the
same sentence selection as the vocabulary decks rather than a second copy of them.

## Changing the card type's CSS

`deckcore.js` holds it, and every built deck file carries a **copy** — so an edit there does not reach a
reader until the decks are rebuilt. Rebuilding needs the 130 MB of source corpora above; where only the CSS
has changed, the shipped files can be patched instead, and the way to do it safely is a **string replacement
on the raw JSON** rather than parsing and re-serialising:

    node -e '
    const fs=require("fs"), fresh=require("./deckcore.js").TYPE.css, enc=s=>JSON.stringify(s).slice(1,-1);
    for (const f of fs.readdirSync("../../decks").filter(x=>x.includes("Mandarin"))) {
      const p="../../decks/"+f, raw=fs.readFileSync(p,"utf8");
      const cur=Object.values(JSON.parse(raw).meta.types)[0].css;
      if (cur===fresh) continue;
      if (raw.split(enc(cur)).length-1 !== 1) { console.log("REFUSED",f); continue; }
      fs.writeFileSync(p, raw.replace(enc(cur), enc(fresh)));
    }'

Two reasons it is done that way. The three files are written with **different formatters** — `build-mandarin.js`
uses `JSON.stringify(deck)` and the other two `JSON.stringify(deck, null, 1)` — so re-serialising the wrong one
rewrites all 20 MB. And the refusal matters: replacing a string that occurs more than once would rewrite
something that is not the type's CSS.

Check afterwards that **only** `meta.types.<id>.css` moved, by diffing the parsed objects field by field —
and check the CARDS are byte-identical while you are there, since that is the half a bad replacement would
break. It has been done twice (the Aug 2026 `.uc-exst` change and the `PINYIN_FONT` one the day after), and
both times all three decks carried CSS byte-identical to `deckcore.js` beforehand, which is what makes the
patch provably the same edit as a rebuild.

`test-deck-ux.js`'s section 7 asserts the shipped files carry the pinyin rule, so a rebuild that loses it
fails there rather than on somebody's card.


## The two repairs that live in `deckcore.js`

`fixPinyin(pinyin, bopomofo)` and `fixGloss(simplified, englishHTML)`. Both are applied to the shipped deck
files and both belong in a rebuild — the three builders each write `Pinyin:` and `English:` and each requires
`deckcore.js`, so that is the one place all three can reach.

They are narrow on purpose. `fixPinyin` moves a consonant back across a syllable boundary ONLY where the
bopomofo names the initial the next syllable is missing, and never where the bopomofo says the first
syllable really does end that way — so `shēn gāo` and `cháng gē` are left exactly as they are. `fixGloss` is
keyed on the WRONG TEXT as well as the word, so the day the source gives 别 an adverb sense of its own the
override stops matching and quietly stops firing; a table keyed on the word alone would overwrite a
corrected source for ever.

**`parsepdf.js` is missing from this repo** and `build2026b.js` requires it, so the HSK 3.0 chain cannot
currently be run at all — which is why both repairs were applied to the shipped JSON by string replacement
as well as being wired in for a future rebuild.

## The two files to read before changing anything

`deckcore.js` holds the card type — one type, two templates, so a word is one note asked in both
directions — and every field builder. `phrasepick.js` holds the rule that decides whether a CC-CEDICT
entry is a phrase, an idiom or a word, and records the versions of that rule that were tried and measured
and thrown away. The findings that cost the most to get are written into those two files and into the
`decks/` entry in `CLAUDE.md`.

## Checking them

    node check-pinyin.js     # the two readings on every card, held against each other — no browser
    node check-decks.js      # imports every deck in decks/, studies it, reads what is on the card
    node check-reverse.js    # the reverse card: a two-note cut, studied all the way through
    node check-nesting.js    # nested subdecks and the cascade, on a deck built in memory

`check-pinyin.js` is the cheap one and the one to run after ANY rebuild. A card carries the reading twice —
pinyin from the HSK PDFs, bopomofo from CC-CEDICT — so the two are independent witnesses and neither needs a
dictionary. It exists because 办公室 shipped as `bàng ōng shì`: the g had migrated a syllable left, leaving
`ōng`, which is not a Mandarin syllable. 28 readings were corrupt that way and **every count read healthy** —
three syllables, every tone present, nothing thrown. It reports in classes because most disagreements are
NOT faults: 92 words differ on 不 (sandhi against citation form), 236 differ in syllable count (erhua,
two-reading words, and the word-spaced levels 7–9 band). Only the first three lines are assertions.

The last three need Playwright, which is a dev dependency and must not be installed into the repo — install it in a
scratch directory and run with `NODE_PATH=<that>/node_modules`, as `.claude`'s other browser tests do.

Two things they exist to catch, and neither shows up in any count. **After a reveal BOTH sides of the card
are in the document** — the front stays, hidden by CSS, because the back renders `{{FrontSide}}` — so the
back is the LAST `.uc-card` and never the first; reading the first one reports a card with no reading, no
definition and no character breakdown, which is exactly what a broken template would look like. And **the
reverse card is not reachable by grading Good**: that sends a new card to its ten-minute learning step and
straight back into the queue, so a four-card run of Goods deals the same two words twice.

`check-nesting.js` is the third, and it does not touch `decks/` at all — it builds its decks in memory. Its
first four sections use an eight-note deck whose cards name PATHS (`Level 1/Chinese to English`) and assert
the two things a curated collection has always done and the reader's own decks now do too: the Collections
page draws the tree, indented and counting its children's cards, and adding the deck puts every subdeck on
the home page — with removing it taking them all away again, and adding one branch bringing only that
branch.

Its **fifth section is direction as a subdeck**, on a six-note deck with a two-template type. That is the
level BELOW the subdeck — a word is one note with two cards, so `sub` can never name the direction and the
template does — and it needs no change to a deck file, which is what the section is really pinning. Three
of its assertions cover failures nothing else would see: a direction row drawn over a container that only
groups (the same cards offered a third time), the deck file having to change after all, and — the one that
matters — studying a direction dealing **three cards all ending `~2`** rather than the level's six.

It also pins that **adding a deck brings its levels and NOT their directions**, which is the narrower half
of the cascade: a direction holds a subset of its own parent's cards, so adding it too would surface
reverses in the pooled draw from the first day. `check-decks.js` is what caught that, studying the shipped
decks through the review, and it is the check to re-run after any change to the cascade.

The **sixth section is the pairing switch** — *Both directions together*, on a deck's own options. Off (the
default) the day's new cards are all forward; on, they are the day's new WORDS each way, shuffled, and
burying is derived off so the reverse is not taken straight back out. Its seeding is worth copying: writing
localStorage behind the app's back needs a real `reload()`, because a `goto` differing only in the
`#fragment` is a same-document navigation and the next `save()` puts the in-memory state back over it.
