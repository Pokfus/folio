# The Mandarin deck generators

These built the nine HSK `.folio-deck.json` files in `decks/` (and, since Nov 2026, `build-beginner.js` builds three more — see "The order, the pinned ids and the three beginner decks"). **Not part of the site** — nothing here is
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
    node build-mandarin.js              # → decks/Mandarin-*.folio-deck.json  (nine decks)
    node build-hsk20.js                 # → decks/HSK1-Mandarin, HSK2-Mandarin

`build-mandarin.js` is the one that writes what ships, and it writes NINE decks: the seven HSK 3.0 levels,
the everyday phrases and the idioms. It requires `build-extra.js` for the last two — that file is a library
and writes nothing of its own, since two builders emitting one deck under two ids is a silent swap for
anyone who has installed it. The titles, ids, units, tags and descriptions are all in `hsk30-meta.js`, so
the generator and the files on disk cannot come to disagree about what a deck is called.

It was ONE file of nine subdecks until Aug 2026 ("It shouldn't download the whole collection at once, its
cards should be divided into decks the same as the other collections"): that shape made every row on the
Collections page read 20.6 MB and made pressing any of them fetch all nine. What the one file bought — one
Add for the whole language — the collection banner's own + buys instead.

`extras.js` is **both a script and a module**: required, it runs down to the pool and the segmenter and
stops, which is how `build-extra.js` gets the same corpus, the same traditional-script exclusions and the
same sentence selection as the vocabulary decks rather than a second copy of them.

## The order, the pinned ids and the three beginner decks (Nov 2026)

The nine decks cannot be rebuilt — `w26-*.json`, the generator's inputs, are not in the repo — so since Sep
2026 every change to them goes through `mandarin-fix.js` and its record, `mandarin-fixes.json`. The
beginner pass (`docs/mandarin-review.md`) added three things on that model.

    node mandarin-fix.js --check        # the nine decks carry their fixes, their order and their pinned ids
    node build-beginner.js --check      # the three beginner decks are what the tables and the decks give

| file | what it is |
|---|---|
| `mandarin-ids.json` | deck id → headword (or key) → the number in the card's id. **Never delete or renumber a row**: the Update press merges a reader's progress by id. A new note takes the next free number. |
| `mandarin-order.json` | deck id → the full list of headwords, in the order the deck is dealt. Applied by `mandarin-fix.js`, which moves a note with its id and rewrites `num`. May be edited by hand; a list that is not exactly the deck's headwords is refused. |
| `mandarin-order.js` | how that file was computed (the rules are in its header): Level 1's hand-written head, then frequency over the nine decks' own sentences, confusable notes forty apart; the phrases by reading level. Re-run it on purpose, never as a side effect. |
| `build-beginner.js` | writes `Mandarin-Pinyin-and-Tones`, `Mandarin-Bopomofo` (2026-11-16), `Mandarin-Level-1-Character-Parts` and `Mandarin-First-Phrases`. **Reads no live source**: only the shipped Level 1 to 3 decks and the three tables below. Re-run it after `mandarin-fix.js` changes Level 1, 2 or 3. |
| `beginner-pinyin.json` | the sounds: IPA and descriptions quoted from two Wikipedia articles at the revisions it names. A row's `key` is what its id is pinned to. |
| `beginner-bopomofo.json` | the bopomofo symbols: origin, IPA, pinyin and notes quoted from Wikipedia's "Bopomofo" at the revision it names; `pin` points at the `beginner-pinyin.json` row whose description a card shows. A row's `key` is what its id is pinned to. |
| `beginner-phrases.json` | the first phrases: hand-chosen CC-CEDICT headwords with the reading as printed and the senses to carry; `trad` and `senses` are captured from CC-CEDICT by `build-beginner.js --capture <cedict file>` and never typed. |

`mandarin-fix.js` leaves the four beginner decks alone (they are not in its record) but still holds them to
their pinned ids. To add a first phrase: add a row (`w`, `c`, `py`, `pick`), fetch CC-CEDICT, run
`--capture`, then build — a headword CC-CEDICT lacks, one using a character Level 1 does not, or one
already carded in the nine decks is refused. After any of this, `node .claude/build-lang-decks.js`.

## The Spanish decks: the record, the order, the pinned ids and the sounds deck (Nov 2026)

The DELE decks CAN be rebuilt (`.claude/dele/`, Python, 1.2 GB of live corpora), which is why every edit
to them is in a record that is re-applied after a rebuild. The beginner pass (`docs/lang-decks.md`, "The
Spanish beginner pass") added the Mandarin model's three files, with one difference: **the pin is APPLIED**,
so a rebuilt deck, which the generator numbers by position, is numbered back.

    node spanish-fix.js --check            # the seven decks carry their fixes, their order and their pinned ids
    node build-spanish-sounds.js --check   # the sounds deck is what its table and DELE A1 give

| file | what it is |
|---|---|
| `spanish-fixes.json` | the record: one entry per note, `insert` for a card the generator has not got, `dropDup` for a card a lower deck now carries, `hints`, and each deck's subtitle and description edits. |
| `spanish-ids.json` | deck id → headword (a sounds row's key) → the number in the card's id. **Never delete or renumber a row.** A removed note's row moves to `_retired`; a rename renames the key. |
| `spanish-order.json` | deck id → the full list of headwords in the order the deck is dealt (DELE A1, the phrases). May be edited by hand; a list that is not exactly the deck's headwords is refused. |
| `spanish-order.js` | how that file is computed, from the PINNED NUMBER (the generator's frequency rank) and never from the file's own order: A1's hand-written head, the closed sets, look-alikes forty apart; the phrases by reading level. `--report` prints the measurements. |
| `spanish-sounds.json` | the sounds table: rows quoted from one Wikipedia article at the revision it names. A row's `key` is what its id is pinned to. |
| `build-spanish-sounds.js` | writes `Spanish-Sounds-and-Spelling`. **Reads no live source**: the table and the shipped A1 deck. |

`spanish-fix.js` finds its decks by CARD TYPE (`dele`), so the phrases deck is covered and a Spanish deck
of another type is left alone. To add a word to A1: an `insert` entry (the next free id, its senses, three
sentences each naming where it came from in `why`), `spanish-fix.js`, then add the headword to the head in
`spanish-order.js` or let it fall where its `after` puts it, `spanish-order.js`, `spanish-fix.js` again,
`build-spanish-sounds.js` (A1's order decides its example words), and `node .claude/build-lang-decks.js`.

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

## The two files to read before changing anything

`deckcore.js` holds the card type — one type, two templates, so a word is one note asked in both
directions — and every field builder. `phrasepick.js` holds the rule that decides whether a CC-CEDICT
entry is a phrase, an idiom or a word, and records the versions of that rule that were tried and measured
and thrown away. The findings that cost the most to get are written into those two files and into the
`decks/` entry in `CLAUDE.md`.

## Checking them

    node check-decks.js      # imports every deck in decks/, studies it, reads what is on the card
    node check-reverse.js    # the reverse card: a two-note cut, studied all the way through
    node check-nesting.js    # nested subdecks and the cascade, on a deck built in memory

Both need Playwright, which is a dev dependency and must not be installed into the repo — install it in a
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
