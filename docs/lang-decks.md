# The community and language decks

Moved out of CLAUDE.md (Aug 2026). **Read this before rebuilding, adding to or
editing anything under `decks/`, before touching a generator in `.claude/`, and
before changing `lang-decks.js` or its builder.**

A deck under `decks/` is USER-UPLOADED content that nothing on the site links to
or serves as its own — it is imported through the Studio like a stranger's. **A
community deck is not a change to Folio: it gets no changelog line and no version
bump.** What DOES belong in the changelog is a change to the APP that a deck
happened to force, worded as a fact about deck files rather than about any deck.

The standing discipline for every generator here: **re-running it must reproduce
the shipped deck byte for byte, on EVERY level, in order** — the stages are
shared, so a change made for one level reaches the others, and a level is built
on the shipped decks below it. Read the diff rather than glancing at it: a file
that changes is not automatically a regression, and more than once the file that
changed was the one that had been wrong all along.

- `decks/*.folio-deck.json` — **the community decks**, files a reader imports through the Studio. Not part
  of the site and never loaded by it: a deck file is somebody else's content that happens to have been
  written here, and it goes through `uDeckNormalize` on import exactly as a stranger's would.
  The Mandarin set is **NINE** files — 11,532 notes / 23,064 cards, 20.5 MB: the seven HSK 3.0 levels of
  the 2026 standard plus the two the syllabus leaves out, **Everyday phrases** (159) and **Idioms**
  (477 chengyu). **It was ONE file of nine subdecks until Aug 2026 and was split on a bug report**: "why
  are the file sizes in the Mandarin Chinese collection all the same? It shouldn't download the whole
  collection at once, its cards should be divided into decks the same as the other collections." Nine
  rows each reading 20.6 MB is what a catalogue built on FILES says about a deck that is one file, and it
  is true rather than a display fault — a reader adding Level 1 fetched the whole of HSK 7–9 with it —
  so the fix is in the SHELF and not in the row: nine files, each fetched on its own, each row stating
  what it actually costs (0.3–8.9 MB). The catalogue's `flat` unwrapping (below) becomes inert for this
  language, the nine now being decks rather than subdecks of one; nothing else on the page changed,
  because a language's decks were always drawn from the catalogue's rows. **The HSK1 and HSK2 decks were
  DELETED on request earlier in Aug 2026**: they are the 2012 standard's first two levels at 150 and 151
  words, which HSK 3.0's own Level 1 and Level 2 cover — so on the Collections page they were two more
  rows in the Mandarin collection saying what two of its neighbours already said. The **DELE
  Spanish set** (seven files) sits beside it and the **German set** (six) beside that, and neither is
  wholly generated here: `.claude/dele/` makes A1–B2 and `.claude/goethe/` A1 and A2, while the Spanish
  C1, C2 and phrases decks and the German B1, B2, C1, C2 and phrases decks were supplied ready-made in
  their generators' own shape — see those two bullets, which say what each pipeline would OVERWRITE.
  The **CAPLE Portuguese set** (all six CEFR levels, plus a seventh deck of phrases and expressions) is
  built by `.claude/caple/`, the **French set** — DELF A1–B2,
  DALF C1–C2 and a seventh of **common phrases and expressions** (402), seven files plus a **combined
  `French-A1-C2`** (7,648 notes / 15,296 cards, a subdeck per level and one of idiom) — by
  `.claude/delf/`, and the **UKBI Indonesian set** — all seven predicates plus an eighth deck of
  phrases, idioms and proverbs (228) — by `.claude/ukbi/`: see their own bullets below. The Indonesian
  one is the odd one out and its bullet says why: **its exam board publishes no word list at all**, so
  unlike every other deck here its vocabulary is assembled rather than read, and the deck's own
  description states that in those words. **A COMBINED FILE IS GITIGNORED**, French, Spanish, Italian
  and Indonesian alike: it is an artefact of the levels it combines rather than another deck, so
  committing it duplicates every megabyte the repo already carries for them, and its own `combine.py`
  regenerates it byte for byte.
  · **THE NINE WERE ONE DECK AND ARE NINE AGAIN, and both moves were the reader's** — which is worth
    keeping as a pair rather than as a correction, because the two requests are not in conflict and the
    thing that changed between them is what Add MEANT. Combining them ("three files was three imports and
    three rows on the Collections page for one subject") was right while a language's decks were separate
    rows a reader imported one at a time; once the shelf drew a language as a COLLECTION with its decks
    folded inside it and Add stopped fetching anything, one file was no longer what made them one subject
    — it was only what made every row quote the same 20.6 MB. **`build-mandarin.js` is the ONE entry
    point** and writes all nine; `build-extra.js` is a **library** (`module.exports = { noteOf, phrases,
    idioms, PHRASE_BAR, IDIOM_BAR }`) and no longer writes decks on its own, because both paths would
    otherwise write the same words under two different deck ids — which for a reader who has installed one
    is a silent swap to another deck. The titles, ids and descriptions live in `hsk30-meta.js`, where both
    halves read them.
  · **A SUBDECK NAME IS A STRING AND A MANGLED ONE IS A NEW SUBDECK.** An intermediate build of the
    combined file wrote one note's `sub` as `Levels 7<U+FFFD><U+FFFD><U+FFFD>9` — three replacement characters where the
    en-dash should be — and the deck drew a phantom eighth level holding a single word. **Nothing throws,
    the note count is right, and the only symptom is a row nobody put there**; it was caught before it
    shipped, and no released deck has ever carried it (swept, all nine on main, zero replacement
    characters). So: **count the DISTINCT subs after a build and read the list**, rather than checking the
    note total — a count of notes cannot see it, and a count of subdecks only helps if you know what the
    number should be.
  · **EVERY WORD IS ONE NOTE WITH TWO CARDS** (Aug 2026, once the reverse-cards feature landed on main).
    Each deck used to write a word out twice, once per direction, and the two rows were identical field for
    field — the same characters, reading, character breakdown and three example sentences, which between
    them are nine tenths of a row. The eleven HSK 3.0 files were 44.7 MB and are 19.3. What matters more
    than the bytes is that a word is now one RECORD: a definition corrected or a better example found is
    corrected in both directions at once, where two rows drift with nothing to say so. Each direction keeps
    its own schedule, which is the point of a reverse card.
  · **THE SUBDECK AXIS WENT TO THE LEVEL, and that is what let HSK 3.0 become one deck.** The old combined
    files spent their one `sub` axis on the study DIRECTION — two subdecks, Chinese → English and English →
    Chinese — and that is exactly what the two templates now express, so the axis came free for the thing a
    learner actually works along. **A note's `sub` is per note, so direction can never be a `sub` again**
    while the two directions are one note; that was the trade, and it was worth making.
    **AND THEN THE DIRECTIONS CAME BACK AS ROWS WITHOUT COSTING THE FILE ANYTHING** (Aug 2026, on request —
    see "A DIRECTION IS A LEVEL BELOW THE SUBDECK" under community decks). The thing `sub` could not name,
    the TEMPLATE already does, so each of the nine subdecks now lists **Chinese → English** and **English →
    Chinese** as rows of its own. **The deck file did not change by a byte** — the two templates were always
    in its one type — which is the answer to the paragraph above: the halving stands and the directions are
    separable, because they were separated at the level where they actually differ. Adding the deck brings
    the nine levels and NOT their eighteen directions; a level already deals both ways, forward first.
  · **THE OLD "TOO BIG FOR ONE DECK" MEASUREMENT WAS RE-TAKEN RATHER THAN CARRIED FORWARD.** The 7–9 band
    shipped as five files because level 6 alone (3,554 rows, 7.4 MB) measured 3.6s to import and 2.7s to the
    first card. Measured again on the whole of 3.0 at 10,896 notes: **JSON.parse 81 ms, import 10.0s once,
    the Studio 3.2s, adding a subdeck 0.8s, home → first card 1.1s** — faster to a card than one level was,
    because the study path touches a subdeck rather than the deck. **A conclusion drawn from a measurement
    expires when the thing it measured changes**, and this one has since: the store was split in Aug 2026 so
    a deck's cards live one record per note, which moved the cost squarely onto the import — **the deck is
    visible in ~6.8s and fully written in ~19s, against 6.6s and 10.7s before** — and took it off every
    load after it (boot 501 ms → 213, 18.19 MB resident → 1.01). See the Persistence bullet under COMMUNITY
    DECKS for the whole table; the case for one file rather than five is only stronger.
  · **THE TWO NEW DECKS ARE DERIVED, NOT WRITTEN.** Candidates are CC-CEDICT entries not already carded in
    any HSK deck; whether one is an IDIOM is CC-CEDICT's own `(idiom)` marker; how common each is comes from
    the OpenSubtitles 2018 frequency list (hermitdave/FrequencyWords, CC BY-SA 4.0) and from counting the
    Tatoeba corpus. **The two measure different things and neither replaces the other**: the frequency list
    is SEGMENTED, so it counts a four-character idiom (which every segmenter treats as one token) and cannot
    see a free phrase like 对我来说 at all, while Tatoeba reads running text and can.
  · **WHAT COUNTS AS A PHRASE RATHER THAN A WORD is the hardest judgement in the two decks**, and the
    generous version of the rule was tried and measured and thrown away — see `.claude/`'s `phrasepick.js`
    for the whole of it. The short version: the test is on the entry's FIRST sense (奶油 is "cream" and
    carries "(coll.) effeminate" third), it is case-SENSITIVE (run blind it matched the "US" in "United
    States" and the "i" in "i.e."), a `(coll.)` marker is NOT a third test (it admits a colloquial WORD as
    readily as a phrase), and **length is no guide at all** — "a three-character headword is more often a
    construction" took the candidate list from 472 to 37,681, Chinese having an enormous stock of
    three-character nouns. Recall is stated rather than guessed: on a probe of thirty-six expressions a
    beginner meets, 24 are already carded in the HSK decks, 5 are not in CC-CEDICT, 2 are idioms, and the
    rule takes 4 of the remaining 5.
  · **THE STRUCTURE LINE IS A CAPTION, NOT A HEADING** (`.uc-exst`, Aug 2026, on request). The formula above
    each example sentence — "PRONOUN + MEASURE WORD + VERB + NOUN" — was set at 9.5px/600, which over an 18px
    sentence reads as a heading for it; that is the wrong way round, since the sentence is the thing and this
    only says what shape it is. It is 9px/400 now, with the marked term at 500 so a weight as well as the
    vermilion still finds it. **The CSS lives in `deckcore.js` and is COPIED into every built deck file**, so
    a change there does not reach a reader until the decks are rebuilt — or, as here, until each shipped
    deck's `meta.types.<id>.css` is patched to match. That patch was made as a string replacement on the raw
    JSON rather than by re-serialising it, which is what keeps the 20 MB file's diff to the one line it
    should be; all three Mandarin decks carried byte-identical CSS to `deckcore.js` beforehand, so the two
    are provably the same edit.
  · **THE THIRD TONE HAS TO BE ASKED FOR BY NAME** (`PINYIN_FONT` in `deckcore.js`; Aug 2026, on a bug
    report: "the letter ǒ appears larger than other pinyin letters"). The card inherits the site's body
    serif and **Newsreader — the default — has none of the ten pinyin characters at issue**: ǎ ǐ ǒ ǔ (third
    tone on a, i, o, u, but NOT ě, which it does have, and which is why one letter was named), ǖ ǘ ǚ ǜ, and
    ǹ ḿ. Measured in a browser against every family the stylesheet imports, not assumed.
    **THE QUIET PART IS WHY IT RENDERS AT ALL rather than as a blank**: Google Fonts declares Newsreader's
    latin-ext face with `unicode-range: U+0100-02BA, …`, which COVERS U+01D2 — **a unicode-range is a
    promise about the subset, not about the glyphs in it** — so the browser picks that face, finds nothing,
    and falls back per character to whatever last-resort font the operating system keeps, whose design size
    has nothing to do with the page.
    **THE OBVIOUS FIX DOES NOTHING, WHICH IS THE THING TO CARRY.** Fallback is per character, so appending a
    covering face after `var(--serif)` ought to leave every working letter alone and catch only these ten.
    It cannot: `--serif` is `"Newsreader", Georgia, "Times New Roman", serif`, so appending puts **a generic
    family in the MIDDLE of the list**, and a generic matches everything — the browser resolves the caron
    against the system default and never reaches the name after it. Measured on the rendered card before and
    after: identical ink height, 9px both ways. A `@font-face` with a `unicode-range` of exactly those ten
    codepoints is the textbook way to have both, and **a deck may not have one** — `cssScoped` drops
    `@font-face` from deck CSS deliberately, a src URL in a stranger's deck being a per-character call home.
    So the covering face goes FIRST, with the theme's serif behind it.
    **EB GARAMOND IS CHOSEN ON MEASUREMENT.** Of the thirteen imported families exactly four carry all ten —
    Cormorant Garamond, EB Garamond, Inter, Noto Sans SC — and **the two sans candidates are the wrong
    answer for this bug in particular**, Inter's x-height being 123% of Newsreader's and Noto Sans SC's
    125%: either would have swapped one oversized glyph for another. EB Garamond is 95%, is a serif, and is
    already in the single `@import` because the academy theme sets it, so it costs no new request and its
    latin-ext subset is fetched only by a reader who meets one of these characters.
    **IT IS ON THE THREE PINYIN RUNS AND NOT ON `.card`**, counted over the 11,532-note deck: 13,365 of the
    carons are in the character breakdown (`.uc-ptp`), 3,709 in the reading (`.uc-pinyin`), 145 in the
    measure word (`.uc-mwp`) — and **six in an English gloss**, all six the "chǔ — " reading printed at the
    head of a two-reading word. Setting the whole card would catch those six at the price of restyling every
    definition; they are left, and they are the one place this bug survives. **The site's own corpus has
    zero** of these characters, so `--serif` and `.tr-pin` are deliberately untouched.
  · **AN IDIOM MOSTLY HAS NO EXAMPLE SENTENCE, and that is the subject rather than a gap**: of 5,227
    non-syllabus idioms only 361 appear in the Tatoeba corpus even once, an idiom being literary and the
    corpus conversational. What stands in for it is CC-CEDICT's own lit./fig. gloss and the character
    breakdown, which for a chengyu is most of the explanation.
- `docs/units-plan.md` — **metric first, imperial in parentheses**: the rule, the one imperial-first figure in the whole
  corpus (fixed), and the 360 metric figures still to gain their equivalents. Not part of the site.
- `docs/audit-2026-08-08.md` — a whole-project sweep for bugs, obsolete code and inconsistency: what was fixed
  (the `check-style --fix` citation corruption above all), four planned batches (**A** stale translations,
  **B** content outside its own length bar, **C** the changelog drifting back into transcripts, **D** deck-title
  casing), the eager-payload measurement, and the suggestions that came out of it. **Its "where the site is
  strong" section is measured on purpose** — 4,028 citations all carrying a URL and an access label, clean data
  integrity, `PAGE_META` covering all 20 routes — so a later pass does not go "fixing" what is already right.
  Not part of the site.
- `docs/user-decks-plan.md` — the design plan for **community decks** (user-created decks, sharing,
  ratings, an optional per-deck glossary, and a later paid tier). Phases 0–1 have shipped; see the bullet
  in "How the app is wired". Not part of the site.
- `data.js` (~2.9 MB) — `window.CARD_DATA` and `window.COLLECTION_TREE`. **Currently 560 cards** (measured
  2026-08-15; this line said 99 for weeks and then 409 for days, so **count them rather than quoting it**:
  `node -e "global.window={};require('./data.js');console.log(window.CARD_DATA.length)"`) — **200 in World
  History** (`col-8`, scattered across the first subdecks of its 1000-slot plan), **305 in Ancient Greece**
  (`gr-001`…`gr-305`), **50 in Ancient Rome** (`rm-001`…`rm-050`) and **5 in Geography** — **each carrying its
  full pool of 3
  question phrasings** (`question` + 2 `questions` extras — **except a MAP CARD, which carries exactly one**,
  see the map-card bullet) **and a `difficulty` of 1–5** (all rated on
  2026-08-10; see the card-difficulty bullet under "How the app is wired") **and, on 14 of them, an
  `undatable: true`** (the terms Timeline must not ask a reader to place — see the bullet beside that one),
  **in ENGLISH ONLY: the per-card `i18n` blocks were removed on 2026-08-08, on
  request** — 2.06 MB, 58% of the file, that `MULTILANG = false` put beyond every reader's reach, and the
  file went 4.32 MB → 1.64 MB with them. `add-card.js` now DROPS a supplied `i18n` block with a warning and
  `test-i18n-lang.js` fails if one reappears, so the eager path cannot silently regain it; both collections are grown one card at a time (see "Generating cards & glossary
  entries" below). **The old single `wh-prehistory` deck and the empty `col-44`…`col-64` period decks
  are gone** (2026-08-04) — World History's tree is now the one in `docs/world-history-card-plan.md`,
  and card ids follow that plan's numbering. **`col-40` Ancient Rome gained its 7 decks and 25 leaf
  subdecks, `col-42` Russia its 9 decks and 29 leaf decks, and `col-43` India its 9 decks and 31 leaf
  subdecks, on 2026-08-06** from `docs/rome-card-plan.md`, `docs/russia-card-plan.md` and
  `docs/india-card-plan.md`, all empty; all three stay under "Coming soon" until their first card ships,
  since a collection with no cards is coming-soon whatever its `placeholder` says. **`egypt` is new — the
  collection itself was created on 2026-08-06** by `docs/egypt-card-plan.md`, with 9 decks and 26 leaf
  subdecks and a `COLL_THEME` row of its own. **`ww2` is new the same way — created on 2026-08-07** by
  `docs/ww2-card-plan.md`, with 8 decks and 30 leaf decks and its own `COLL_THEME` row; it and Egypt are
  the only two collections a plan has had to bring into existence. **`col-41` United States gained its 9
  decks and 33 leaf decks on 2026-08-07** from `docs/us-card-plan.md` — it was a leaf node with an empty
  `cardIds` and is now a branch, keeping its `total`, its `placeholder` and its nine translated titles.
  **`japan` is new the same day** from `docs/japan-card-plan.md`, with 9 decks and 34 leaf decks, its own
  `COLL_THEME` row and the first new `COLLECTION_NUMERALS` entry since China; it, Egypt and the Second
  World War are the three collections a plan has had to bring into existence. **`china` was the one
  collection that already had a tree**, and on the same day `docs/china-card-plan.md` made four changes to
  it — dropping the duplicate `col-9 Xin`, retitling `col-30 Jin` → `Jurchen Jin` and `col-2 Xia` →
  `Neolithic China and the Xia`, and adding the `cn-state` / `cn-belief` / `cn-culture` thematic decks —
  taking it to 7 decks and 39 leaf decks. Its `placeholder: true` was left alone by that plan and
  **cleared on request in Aug 2026**, once forty cards had shipped into `cn-myth`.
  **`geo-us` is new — the collection was created on 2026-08-15** by `docs/geography-card-plan.md`, with
  two leaf decks (`geo-us-states`, `geo-us-capitals`), a
  `COLL_THEME` hue and a `COLLECTION_ICON` compass rose of its own. **It shipped as a `geography` collection
  holding one deck called The United States and was FLATTENED on request in Aug 2026** ("Put a section
  directly below it titled Geography, and put there a collection titled United States, with the states and
  state capitals decks inside it"): Geography is now a heading on the Collections page — `COLLECTION_SECTION`
  in app.js, a declared table rather than a level in the tree — so the wrapper node was promoted to the
  collection rather than a third level being added under it, and a second country would be a collection
  beside this one. The card-bearing leaves keep their ids, so nobody's schedule moved; a reader who had
  added the old `geography` entry simply loses it, `activeEntryIds` filtering an id the tree no longer has.
  It is the fourth collection a plan has
  had to bring into existence, after Egypt, the Second World War and Japan — and the FIRST that ships with
  cards rather than empty: **five**, `geo-001`–`geo-004` and `geo-504`. Its cards carry two fields no other
  card has, **`map` and `facts`**, so `serializeCardData` and `revertCard` had to learn both — the
  documented whitelist trap, and the reason `test-map-cards.js` asserts them in the file rather than on the
  page. See the map-card bullet under "How the app is wired".
- `glossary.js` — `window.GLOSSARY` plus `window.GLOSSARY_DATES`, `GLOSSARY_TITLES`, `GLOSSARY_ALIASES`,
  `GLOSSARY_CASESENSITIVE`, `GLOSSARY_TAGS` (per-term category tags — the admin glossary's left-bar
  filter), `GLOSSARY_IMAGES` (per-term illustration, **771 of the 836 terms** since Aug 2026 — see the
  "Glossary image" bullet below and the picture-pass scripts in this map) and
  `GLOSSARY_SOURCES` (per-term citations — see the "Source footnotes" bullet).
  **A DATE LINE MAY RUN TO SEVERAL LINES** (`glossDatesHTML` / `glossDatesFlat`, Aug 2026, on request). It
  was written into the popup with `textContent`, so a term wanting a birth on one line and a death on the
  next had no way to say so — a typed `<br>` printed as the characters and a typed newline collapsed to a
  space. Two entry forms mean the same thing now, an explicit `<br>` and a plain newline, and the result
  goes through `sanitizeHTML` exactly as a description does, since the popup writes it with `innerHTML`.
  **`glossDatesFlat` is the single-line reading, and everything that is NOT the popup wants that one**: the
  "By date" sort's year parser (`glossStartYear`), the discovered-terms list (one row, one line), the
  `stripDupDates` comparison against a parenthetical in the prose, and the read-aloud text — none has
  anywhere to put a break and all would otherwise be handed markup. Both editors' date boxes are
  `<textarea>`s (`.af-glossdates`) so a plain Enter can be typed; `el.value` reads the same either way, so
  the Studio's `data-gf` wiring needed no change.
  **`add-sources.js` and `add-glossary.js` REBUILD this file from a fixed list of tables**, so a
  `window.GLOSSARY_*` table neither of them carries is silently dropped on the next content batch — which is
  what happened to `GLOSSARY_PLACES`/`GLOSSARY_MAP_COUNTRY` the day they were added. **Add a new table to
  both serializers in the same commit.**
  Trimmed to the single `Sima_Qian` template entry on 2026-07-23 and **regrown since to 401 terms**
  (every country in the world, plus prehistory/paleoanthropology vocabulary), one fully-formed entry at a time
  (description + date + tags + all 9 translations); the full pre-trim glossary (2,165 terms) and its partial
  translations are backed up in `.claude/backup/`.
- `glossary-wikipedia.js` — `Object.assign`s extra summaries onto `window.GLOSSARY` (loads *after*
  `glossary.js`). **Currently an empty stub.**
- ~~`i18n/gloss-<lang>.js`~~ — **REMOVED 2026-08-08, on request**, together with the card `i18n` blocks: the
  site ships in English (`MULTILANG = false`) and the nine files were 3.1 MB of repo weight no reader could
  reach. `glossText()` falls back to the English, so every reader now sees the English glossary. **The
  machinery is deliberately intact** — `GLOSSARY_I18N`, the `glossI18nIngest` queue drain, `PRISTINE_GLOSS_I18N`,
  the per-language `glossaryI18n` overlay and `serializeGlossaryI18n` are all still there — so restoring the
  languages is a matter of putting the files back, not rebuilding the layout. What is NOT still there is the
  fetch: `loadLangData` no longer requests the bundle, because a bundle pointing at a deleted file is a 404
  per language (it was, for the hour between deleting the files and cutting that line, and `test-i18n-lang.js`
  is what caught it). `add-glossary.js` drops a `translations` block with a warning rather than recreating them.
- `i18n/ui-<lang>.js` — the site-chrome translation tables for one language (`window.I18N` exact strings /
  `I18N_RULES` regex patterns / `I18N_HTML` whole prose blocks, keyed by English source text) consumed by
  app.js's localisation engine. **Lazy** (bundle `uiI18n:<lang>`) — an English reader never fetches any of
  them. See the "Language picker + i18n" bullet below.
- `world.js` (~1.6 MB) — `window.WORLD_GEO`, country-border polygons (Natural Earth 110m, ~117k verts) for the
  Atlas globe.
- `us-states.js` (~600 KB) — `window.US_STATES = [ { n, a, c:[lon,lat], p:[rings] } ]`, the 50 US states and the
  District of Columbia (Natural Earth 10m admin-1), for the **map cards** in the Geography collection. `n` is the
  name a card's `map.key` addresses it by, `a` the postal abbreviation, `c` Natural Earth's own published label
  point (what the card centres on). Same SHAPE as `world.js`, so `startCardGlobe` draws a state with the code
  that draws a country. **Lazy** (bundle `usstates`), generated by `.claude/build-us-states.js`, never hand-edited.
  **It is traced TEN TIMES FINER than world.js (Douglas–Peucker 0.002, 3dp against 0.02, 2dp), and that is a
  decision rather than an oversight.** The first cut copied world.js's figures, on the reasoning that two traces
  drawn into one canvas should match — which is a rule about a WORLD map, and this is not one: world.js is seen at
  zoom 1–10 and a state card opens at whatever zoom frames its state, 79× for Rhode Island. At 0.02/2dp Rhode
  Island came out as **49 points** — Narragansett Bay three triangular spikes, Block Island a triangle — and
  nothing was WRONG with it, which is why no count could see it and it took looking at the card. The tolerance is
  derived from the card's own zoom ceiling instead (see the builder), and the disagreement with world.js's coarser
  shore is answered in the RENDERER, which fills the states as land. `test-map-cards.js` asserts a floor on the
  vertex count, so a re-coarsening fails there rather than shipping a hexagon.
- `uk.js` (~47 KB) — `window.UK_SUBUNITS = [ { n, p:[rings], c:[mask] } ]`, the UK's constituent countries (England,
  Scotland, Wales, Northern Ireland) + Ireland (the whole island, for the pre-1922 all-Ireland UK), from Natural Earth
  10m admin-0 **map subunits** (matched by `SU_A3`, since the NAME field abbreviates "Northern Ireland" → "N. Ireland").
  Built by `.claude/build-uk.js`. The `c` mask marks each edge `'0'` internal land border (England–Scotland, England–Wales —
  drawn light by `drawUKConstituents`) or `'1'` coast (the island edges + the UK–Ireland international border, left to
  `world.js`). Double-clicking the UK on the globe drills into the constituent under the cursor (see the Atlas section).
- `heightmap.js` (~3.5 MB) + `heightmap-ultra.js` (~8.9 MB) — `window.HEIGHTMAP` / `window.HEIGHTMAP_ULTRA = { w, h, lo, hi, png }`,
  the **global terrain-relief raster** as two LOD levels: a **base 6144×3072** (terrarium z=5) and a sharper **ultra 10240×5120**
  (terrarium z=6). Each is an equirectangular grayscale PNG (data-URI; pixel 0..255 → elevation `[lo,hi]` m) baked from the **AWS
  open Terrain Tiles** (the data behind tangrams.github.io/heightmapper) by `.claude/build-heightmap.js` (`node build-heightmap.js
  [Z] [OUTW] [OUTH] [outFile] [varName]` — key-free build-time tile fetch + a minimal zlib PNG codec, zero runtime deps).
  Both are **lazy-loaded** (NOT in `index.html`): enabling the **Heightmap** legend toggle (default off) loads the base via
  `loadHeightmap()`; the ultra loads only once zoomed past `HMULTRA_Z`. `drawHeightmap` reprojects the active level onto the globe
  over **land AND ocean floor (bathymetry)** — clipped only to the disk (cheap) — **blended with an `"overlay"` composite** (not a
  flat image paste) at strength `HM_OPACITY = 0.7`, so the grey relief **modulates the map's own colours** (lows/ocean-floor darken,
  peaks lighten; sea level = mid-grey 128 = neutral). Borders/rivers/cities still draw on top, **the same in every era** (physical
  layer, not in `PRESENT_ONLY`). The grey is
  baked into a **per-pixel alpha** that is **theme-aware**: on `body.night` it adds opacity to the DARK (ocean / low) end so the
  darks go darker over the dark map; on day it adds opacity to the BRIGHT (high-land) end so peaks go brighter — keeping the other
  end at the faint base. (So the ocean bathymetry is visible mainly on dark themes; tune via `aBase`/`aBoost`.) The reprojection
  buffer cap is **low while moving** (stays visible without lag — no blink) and **up to full canvas resolution when settled +
  zoomed in** (crispest the data allows at deep zoom); settled renders are cached. (Crisper-than-z=6 deepest-zoom detail would
  need runtime tile streaming, which would break the offline-first design and is imperceptible at this opacity, so it's not done.)
  An older `elevation.js`/three-globe attempt was replaced.
- `truefalse.js` (~56 KB) — `window.TRUEFALSE = [ { q, a, why, cat } ]`, the statement pool for the **True or False** home-page
  minigame (`a` is a boolean, `why` the explanation, `cat` the category). Generated and
  **adversarially fact-checked** for accuracy (`q` statement, `a` true|false, `why` reality).
  **CURRENTLY 130, AND IT IS NO LONGER A HISTORY POOL** (Aug 2026, on request: "add more possible questions.
  They needn't only be about history, but any science"). It was 79 historical myths and misconceptions; the
  51 added are physics, chemistry, astronomy, biology, earth science, mathematics and medicine, each written
  to the same shape — a statement a general reader would confidently answer, and a `why` that says what is
  actually the case. **The widening is a fact about the POOL and not about the game**, which never knew what
  its statements were about: nothing in `PAGES.truefalse` changed. Two rules for adding more: a statement
  must be settled rather than merely current (a guessing game cannot rest on a live scientific argument), and
  a misconception is worth more than a fact nobody would doubt — the point of the game is the surprise.
  **Not translated**; when translations resume they belong in `i18n/games-<lang>.js`, keyed by the English
  `q`, never inline (the `quotes.js` mistake: 27 KB → 312 KB for every visitor).
- `i18n/places-<lang>.js` — place names translated into one language (English name → local name): the
  countries in `world.js` plus the era territories and era capitals in `timeline.js`, **1,744 distinct names**.
  **Lazy** (bundle `placeI18n:<lang>`); the `after` hook `placeI18nIngest` drains `window.PLACE_I18N_IN` into
  `window.PLACE_I18N[englishName][lang]`, which **`placeName(n)`** reads. They live outside `world.js` /
  `timeline.js` because those are multi-megabyte geometry files. **`placeName` is called at CANVAS DRAW TIME**
  (`drawCountryNames`, `drawEraNames`, `drawCities`, `drawEraCities`) as well as in the DOM — the map labels are
  `ctx.fillText`, which the `localizeTree` walker can never reach, so this is the only route to translating them.
  Era names are localised **before** the two-line wrap, or the wrap measures the English. The Settings home
  picker localises only the option LABEL: the `value` stays the English name, since it keys `countryCenter()`
  and is stored in `S.settings.home`. Not routed through the I18N exact table, and for the same reason as
  `nodeTitle` — most of these names are also glossary terms and card answers. A file ships for every language
  so an untranslated one can't 404 on each page load.
  **Coverage — es 609 / fr 555 / de 547 / it 517 / nl 516 / ru 922 / ar 924 / zh 924 / ja 924.** The gap
  between the Latin and non-Latin counts is structural, not a backlog: **a name identical to the English is
  deliberately NOT written** (`placeName` falls back), so `Madrid` needs no Spanish row while every name needs
  a Russian one. Three things stay English on purpose and should not be "finished": the **~750 ethnonyms**
  among the era territories (Wiradjuri, Kwakwaka'wakw, Yukagir) — an endonym keeps its own form in every
  language; the uninhabited **banks, reefs, glaciers and military zones** (Bajo Nuevo Bank, Siachen Glacier);
  and the **obscure historical seats** (Bal Batsinâng, Danamombe, Xieng Dong Xieng Thong). None has an
  established form in Spanish or Japanese, and inventing a transliteration would be fabrication.
- `i18n/games-<lang>.js` — the two daily-game pools translated into one language, keyed by each item's
  **English `q`** (unique in both pools, and stable against reordering in a way an array index is not).
  **Lazy** (bundle `gamesI18n:<lang>`); the `after` hook `gamesI18nIngest` drains `window.GAMES_I18N_IN`
  into `GAMES_I18N[pool][englishQ][lang]`, which `tfLocalized()` / `quoteLocalized()` read. **These must
  NOT go inline into `truefalse.js` / `quotes.js`** — both are in the EAGER load path, and nine languages
  inline took `quotes.js` from 27 KB to 312 KB downloaded by every visitor to flip a card. `PAGES.truefalse`
  and `PAGES.whosaid` hold on a loading line (`gamesI18nPending`) until it lands so they never paint English
  and flip. Both pools are complete in all 9.
- `quotes.js` — `window.QUOTEGAME = [ { q, who, context, cat } ]`, the pool for the **Who said it?** home-page minigame (64 famous,
  well-documented quotations by distinct historical figures; `who` = the speaker, `context` = a 2-sentence explanation shown on
  reveal). **Adversarially fact-checked** for correct attribution (quote misattribution is rampant). The 4 answer options are the
  correct speaker + 3 other `who` names from the pool (all real people → plausible). Loaded before app.js (after `truefalse.js`).
  **`cat` IS REQUIRED ON A NEW ENTRY** (Aug 2026, on request): one of **philosophy / statecraft / science /
  reform / letters**, and it is what makes the three wrong options the same KIND of speaker as the right one
  (see the Picture round bullet under "How the app is wired" — the same request widened both games).
  Add to the five rather than coining a sixth unless a real family is missing: a category holding two people
  cannot supply three distractors and the game falls back to the whole pool, which is where it started.
- `whatyear.js` (~14 KB) — `window.WHATYEAR = [ { y, e } ]`, the pool for the **What year?** minigame: a year
  (negative for BCE) and a ONE-SENTENCE description of something that happened in it. **Currently 98 events
  across 15 years**, 1066 to 1989, each verified against a reference source when it was written.
  **The game drew from the CARDS until Aug 2026 and was moved off them on request**, for two reasons worth
  keeping. A card names a TERM where this game wants an EVENT — Timeline has the same mismatch and calls its
  terms "events" in its own prose. And the game needs FIVE things sharing one exact year, which a corpus of
  terms almost never supplies: of 409 cards only 19 years carried five, and once the minigames were narrowed
  to well-known terms (see the difficulty bullet under "How the app is wired") exactly **one** did — the game
  would have asked about c. 700 BCE every day for ever. **Timeline still draws from the cards and should**:
  it asks for an ORDER, which terms give perfectly well.
  Four rules for an entry, all forced by the game or by the rendering, and all in the file's own header:
  **no markup** (the clue list renders through `esc()`, so an `<i>` around a book title prints as the
  characters — this is the one place on the site where a title is not italicised, and it is a rendering fact
  rather than a change of house style); **it may not name its own year or a nearby one**, the year being the
  answer; **the dating is not in dispute**, since a guessing game cannot rest on a contested date; and **it
  is recognisable**, which is the same argument `card.difficulty` makes one file over — a round dealt cold
  has to be answerable cold. **A year needs at least `WY_EVENTS` (5) entries or it is skipped in silence**,
  and a sixth and seventh are not waste: the game draws five at random, so the extras are what stop a
  repeated year being a repeated puzzle. Eager, like the two pools it sits beside. **Not translated** —
  when translations resume it belongs in `i18n/games-<lang>.js` beside them, keyed by its English sentence,
  never inline (the `quotes.js` mistake: 27 KB → 312 KB for every visitor). Guarded by `test-difficulty.js`.
- `artefacts.js` — `window.ARTEFACTS = [ { id, name, rarity, date, origin, image?, desc, sources } ]`, the pool a
  level-up chest draws from (see THE RELIQUARY under "How the app is wired"). **Eager**, and it can stay
  eager because it is metadata only: a picture is a LINK, never an upload, exactly as a card's is, so an
  artefact costs a few hundred bytes however many are added. Every entry is a REAL object and the content
  rules are the cards' — nothing invented, five sentences, ~200 words (±10%), metric first with the
  imperial in brackets.
  **A DESCRIPTION ASSUMES NO CONTEXT AND NAMES WHAT IT MEANS** (Aug 2026, on a report that the Dressel 20
  said "the empire" without saying which). An artefact is dealt cold out of a chest, so a bare definite
  reference — *the empire*, *the dynasty*, *the war* — is a claim the reader has no way to resolve. **What
  makes the rule bearable is the `origin` field the plate prints directly under the name**: "The Roman
  empire", "The Inca empire", "Qing China", so a noun the origin already names needs no re-qualifying, and
  the rule is about the ones nothing on the plate settles. Swept over all 100 with a regex for a definite
  article before an entity word: 23 matched, every one read, and only TWO were genuinely bare. **Sweep
  rather than fixing the one that was reported.**
  **The `id` is permanent**: the reader's own inventory (`S.artefacts`) is keyed by
  it, so renaming one takes the artefact out of every collection that holds it, and the Admin editor locks
  the field once an artefact exists. Written and edited in **Admin → Artefacts**, which also hands the
  whole file back as a JS literal (`serializeArtefacts`); an `ADMIN_EDITS.artefacts` overlay sits over it,
  keyed by id, exactly as the daily quotes' does over `SHIPPED_QUOTES`.
  **Currently 100 — 4 legendary, 13 epic, 27 rare, 56 common** (98 added on 2026-08-08 on request, to the
  two the feature shipped with). **92 of the 100 carry a picture** since the Aug 2026 picture pass (see
  `.claude/search-images.js --artefacts` in the File map); the eight without are ones whose Commons
  candidates were reviewed and rejected as not being the object — `gladius` matches *Xiphias gladius*, the
  swordfish. That is a fact rather than a backlog: a `src` is somebody else's URL and a `credit` is
  required beside it, so an invented one would be a fabricated source holding up a real object, and the
  rarity-coloured placeholder is what the shape was designed for. **An artefact's image was three fields —
  `src`, `credit`, `alt`** — not the card's five, on the reasoning that the entry already carries the name,
  date, origin and five-sentence description, so `credit` was the only place the attribution could go and is
  written there in full, URL included. **IT IS FIVE SINCE AUG 2026, on request** ("some images don't contain
  titles or descriptions"): the plate's picture OPENS the site's fullscreen viewer, and with no `desc` all 99
  of them opened it with the object's name over a blank caption. They gained `title` and `desc`, and NEITHER
  composes anything — the title is the artefact's own name and the description is the `alt` this corpus
  already wrote plus the attribution `credit` already carries, re-punctuated (see `.claude/fix-image-text.js`).
  **FOUR places had to learn the two fields or the next write would strip them**: `artefactSanitize`,
  `serializeArtefacts`, `add-artefacts.js`'s own emitter and — found in Aug 2026, a fortnight after the other
  three — **`add-images.js`'s**, which is a FOURTH writer of this file and rewrites every artefact in it. One
  run to replace one picture silently stripped `title` and `desc` from all 99: nothing threw, no count could
  see it, and the only symptom was a caption bar that had gone blank again. **Ask which writers rewrite a file
  WHOLE before adding a field to it** — the ones that touch the entry you are editing are not the whole list.
  All four write the pair only where it exists, so an entry without them is byte-identical to what they
  always wrote, which is the check to run after touching any of them.
  **THE PLATE ITSELF NO LONGER PRINTS THE CREDIT** (`.ar-wcredit`, deleted Aug 2026 on request): the viewer
  carries it a tap away from the picture it belongs to, where on the plate it was a grey line under five
  sentences it is not about. **The field is still REQUIRED** — `add-artefacts.js` and Admin → Artefacts both
  refuse a `src` with no `credit`, and the viewer is what shows it — so this changes where the attribution
  is read, never whether it exists.
  A batch is added with `node .claude/add-artefacts.js <batch.json>`, which enforces the
  content rules the file's own header states (exactly five sentences, 180–220 words with the imperial
  conversion NOT charged against the budget, a bolded first mention, a credit on any picture, an id that
  is a fresh lowercase slug) and **rewrites the file in `serializeArtefacts`'s exact output format**, so a
  hand edit and the next Admin save cannot drift apart. Its imperial pattern is add-card.js's plus VOLUME
  (gallons, pints, quarts), which the card corpus never needed and a corpus of jars and cauldrons does.
  **AN ARTEFACT IS CITED, at `ARTEFACT_SRC_TARGET` (3) works** (Aug 2026, on request), each ending in the
  URL a reader can open and each pointed at by a `<sup class="fn" data-fn="N"></sup>` marker written EMPTY
  in the description — the card's apparatus exactly, so the numbering, the links, the access chips and the
  jump both ways all come free. Three sits between the glossary's two and a card's five because a
  description is five sentences. **It is a REFUSAL rather than a target the editor reports against**:
  `add-artefacts.js` and Admin → Artefacts both turn away an artefact under the bar, one with a citation
  carrying no URL, one whose description points at nothing, or one whose marker runs past the end of its
  list (`wireFootnotes` deletes those at render, so the claim silently loses its source). An artefact
  ALREADY in the file is cited with **`node .claude/add-artefact-sources.js <batch.json>`**, and the markers
  are placed by **`node .claude/mark-artefact-sources.js <plan.json> <batch.json>`** from a plan of
  `{ id: { sources, marks: { "<sentence>": [srcNums] } } }` — never by hand, which is how a marker ends up
  inside a tag or a sentence loses its full stop. That plan takes an optional `desc`, so a CORRECTION and
  its markers land in one diff where a source turns out not to bear the prose out.
  **ALL 100 ARE CITED** (batches 1–15, completed 2026-08-08); `docs/artefact-citation-plan.md` holds the
  batch table, the reachable-host survey the pass is built on, and its findings. **What keeps it true is
  the refusal, not the count** — a new artefact cannot be written below the bar — so re-run
  `.claude/test-artefacts.js` after any batch, since it reports coverage and re-checks every shipped list.
- `lang-decks.js` (~11 KB) — `window.LANG_DECKS = [ { lang, file, id, title, sub, notes, cards, subs?, tree?, flat?, bytes } ]`,
  the CATALOGUE of the language decks in `decks/`, which is what the Collections page's **Languages**
  section is drawn from (Aug 2026, on request: "ensure that all our language collections are visible on
  the Collections page in their own Languages section", and then "ensure the language collections are
  presented as official curated collections, with the same type of banners on the Collections page as the
  history collections … there should be one section titled Languages; it should contain one collection
  for each language; each collection should have all decks for that language inside it").
  Generated by `.claude/build-lang-decks.js`, **never hand-edited**. Eight things about it are decisions
  rather than plumbing.
  · **A LANGUAGE IS A COLLECTION AND CANNOT BE A TREE NODE, which is what the catalogue is FOR.** It is
    drawn with the curated banner — the same `.collection-row`, `.collection-deco` wash, `coll-ic` icon,
    title row and `deckProgMarkup` bar as Ancient Greece — and its decks are the curated tree's own
    `.node` rows inside its fold (`langCollectionsHTML` / `langCollectionHTML` / `langDeckRowHTML` /
    `wireLangDecks` in app.js, wired through `wireExpander` so the chevron and the entrance stagger
    cannot drift from the collections'). What it may NOT be is a real `COLLECTION_TREE` node: a tree
    node's cards live in `data.js`, which every visitor downloads before flipping a card, and these
    decks are 181 MB. **Its hues are in `COLL_THEME` under `lang-<slug>` keys**, and the id is BUILT from
    the language name by `langCollId` rather than written down, so a language added to the catalogue
    needs one row in `COLL_THEME` and nothing else. **SIX OF THE SEVEN ARE NAMED RATHER THAN MEASURED**
    (Aug 2026, on request: "make Mandarin red, Spanish orange, Portuguese green, German brown, Italian
    green, Indonesian red"). They were swept in CIELAB and handed out alphabetically, on the reasoning
    that a flag colour would be a claim — Spanish is not Spain's and French is spoken on five
    continents — and **that reasoning was overruled**, which is the site owner's call about their own
    shelf; French was not named and keeps the blue it was measured into. **WHAT IS STILL MEASURED IS
    WHICH red, orange, green and brown**: each was swept inside its own hue window AND inside the
    shelf's band (L 28–55, chroma 7–62), then taken greedily as far as possible from every hue already
    placed. The request puts two reds where China's vermilion and Russia's lacquer already sit and two
    greens where Egypt's malachite and Geography's olive do, so the clearances are tighter than the
    alphabetical sweep managed — the worst is **17.4** (Indonesian against Russia) against a tightest
    EXISTING pair of 12.9 (China against Russia), with the two reds clearing each other by 17.5 and the
    two greens by 24.8, so every one is still further from its neighbour than the closest pair the page
    already carries. **Nothing here is a flag**, and Mandarin's resemblance to the CHINA collection's
    vermilion is left rather than avoided: those two genuinely are about one place, and the kinship test
    forbids a false claim rather than a true one.
    **THE SEVEN SHARE ONE ICON** (`COLLECTION_ICON._lang`, a speech bubble), which is the one place they
    cannot match the history shelf: every curated icon says what its collection is ABOUT, and a language
    cannot be drawn — a letter needs a font where these are bare paths, and a flag or a landmark would
    be a claim about a NATION where the deck is for a language several nations speak.
    **AND THE BANNER CARRIES A `+` SINCE AUG 2026** (`data-langadd`, on request: "language collections
    should be able to be added as one complete package, the same way as History collections"). This bullet
    said the opposite for a fortnight and the reasoning was two halves, of which one had already expired:
    a curated collection's + adds its whole subtree, there is no study scope for "several community decks
    at once", **and Add used to mean DOWNLOAD**, so a language's + would have fetched 181 MB off one press.
    The split of Add from Download answered that half — pressing + writes entries into `S.active` and
    fetches nothing, so adding seven levels costs a reader exactly what adding one does — and the second
    half is answered by the entries themselves: what is added is not a scope over the collection but the
    DECK ROWS the shelf is drawing, each on its own account, which is what a curated collection's + does
    one level up. **THE ENTRY LIST IS CARRIED ON THE BUTTON** rather than re-derived when it is pressed, so
    the control and the rows under it can never disagree about what "the whole language" is — an unwrapped
    deck contributes its subdecks and a wrapped one contributes itself, judged once, where the shelf is
    built (a comma is safe as the separator, `uSubEntry` percent-encoding the path it carries) — and the
    button is **on only when EVERY deck of that language is**, so a language half added reads as not added
    and pressing it completes the set rather than undoing the half that is there. **The bar is honest on a
    deck that is not here yet**: the total is the catalogue's card count and the studied figure is summed
    over the decks actually installed, so an untouched language reads 0 of 23,064 rather than claiming a
    denominator it has no cards for.
  · **A DECK'S OWN SUBDECKS FOLD OPEN LIKE A COLLECTION'S** (`tree` / `langSubRowsHTML`, Aug 2026, on
    request: "when I open the Mandarin Chinese collection, I should see the 9 decks inside it, and any
    subdecks if there are, displayed in the same way as History decks and subdecks"). The catalogue
    carried a `subs` COUNT, which is all a one-line row needed and which a fold can draw nothing from, so
    the builder now emits the whole nested `tree` — a node is `{ n, c, k? }`, its count in CARDS for the
    reason the deck's own is, and a node exists for every PREFIX of a path a card names, which is the
    tree app.js derives at study time taken at build time from the same `::` paths. Four things about the
    rendering are decisions rather than plumbing.
    **A SUBDECK ROW IS THE CURATED `.node`, IN THE CURATED FOLD**, wired through the same `wireExpander`,
    so the chevron, the open class, the row's Enter/Space and the children's entrance stagger are the
    collections' own and cannot drift from them — which is the whole of what was asked for, and is why
    almost no CSS was needed (`.node.lang-sub` takes `.node`'s single-line box back, a subdeck having
    none of the two quiet lines a deck row carries).
    **A SUBDECK ROW MUST NEVER WEAR `.lang-deck`**: that class is how the page counts a language's
    DECKS, so a subdeck carrying it would inflate every tally silently (Spanish would read 21 for its
    seven levels and their fourteen directions). It wears `.lang-sub` instead, and `langRowHTML` decides
    which from its own `depth` argument rather than from where it was called.
    **IT DOES CARRY AN ADD, since Aug 2026** — it used to carry none, on the reasoning that a deck is ONE
    file and a subdeck has nothing of its own to fetch, which stopped being the objection the moment Add
    stopped fetching anything: a subdeck is a perfectly good STUDY SCOPE (`u:<deck>/<path>`), it is what
    a reader wanting HSK Level 3 and not the other eight actually means, and the file it needs is
    downloaded once from the row it then grows in Daily study.
    **A DECK WITH SUBDECKS BECOMES PRESSABLE AND ONE WITHOUT STAYS FLAT.** A row click on a branch
    toggles the fold and costs nothing; on a leaf it could only ever mean Add, i.e. a 21 MB download off
    a stray tap, so a deck with nothing inside it keeps the unpressable row it has always had.
    **AND A DIRECTION IS NOT DRAWN HERE.** A two-way deck's directions come from its card TYPE's
    templates, which the catalogue does not carry and could not honestly state, so what a reader sees on
    this shelf is the subdecks the deck's own cards name — the directions appear once the deck is on the
    device, under its row in the daily study, where `uEntryTemplates` can see them.
    `wireLangDecks` uses `:scope >` throughout for this: a deck's fold now sits INSIDE the collection's,
    so a loose descendant query would reach past its own row into the rows below it.
  · **A DECK ROW SAYS ITS SIZE AND ITS CARD COUNT UNDER ITS TITLE** (`.node-meta`, Aug 2026, on request:
    "language decks should say the card number and file size below their title, the same way history
    decks do"). The two figures were on the row's own line and are a quiet second line now, which is the
    shape a curated deck row already had — and the wording still differs from the history shelf's for the
    reason recorded above: a language deck's figure is what pressing Download will FETCH, where a curated
    deck's is what the reader already has.
  · **A DECK DOES NOT REPEAT ITS LANGUAGE'S NAME** (`langShortTitle`, Aug 2026, on request: "language
    decks do not need to name the language in their title, since its already mentioned in the collection
    name"). Every deck file titles itself "Spanish — DELE A1", which under a banner reading **Spanish** is
    the word said twice on every row. Three things about the trim, all of which are about not taking a
    word that is doing work. **It removes the LANGUAGE'S OWN NAME and the separator left dangling beside
    it**, never a word that merely looks like one. **A title that is ONLY the language is left alone** —
    trimmed it would be a row saying nothing — and the first letter is re-capitalised only where the trim
    took the first word off, so an acronym and a proper noun are left as the deck's author wrote them.
    And **a title naming only the shorter half of a two-word language keeps it**: `Mandarin Chinese` is
    stripped whole, where "Chinese" alone is a different claim. The trim is applied at DISPLAY and the
    catalogue keeps the full title, so a deck imported by hand still names its own language.
  · **A LANGUAGE GETS ITS OWN CONTAINER IN THE DAILY-STUDY LIST** (`langCtxId` / `isLangCtxId` /
    `langCtxName` / `langCtxHue`, Aug 2026, on request: "When i add only several decks from a collection
    to my active decks, they should still automatically appear grouped together in the active decks list
    under their respective collection, the same way they would if you added the whole deck"). Four things.
    **THE CURATED SIDE GETS THIS FREE and that is why nothing had to be built there**: a curated deck is a
    TREE NODE, so the list walks its ancestors and draws its collection above it as a quiet signpost
    whether or not that collection was ever added. A language is a row in a generated catalogue and has no
    ancestors, so its decks went into the top-level run flat — seven "A1" rows in a line with nothing to
    say which language each belonged to, which is exactly what a reader who added three levels of two
    languages met.
    **SO THE CONTAINER IS SYNTHESISED, AND IS DELIBERATELY NOT A GROUP HEADER.** A group is tappable,
    counted and studiable, and offering "study all of Spanish" from a row the reader never asked for is
    the `asGroup` rule's own objection one store over. It is the same CONTEXT row an unadded curated
    collection gets: a name, a hue and a chevron, claiming nothing.
    **THE ID CARRIES A COLON**, like `COTD_ENTRY` and `REVIEW_ENTRY`, so it can never collide with a node
    id (plain slugs) or with one of the reader's own decks (`u:`).
    **AND THE NAME IS RECOVERED FROM THE CATALOGUE rather than remembered as the id is minted** — the slug
    is lossy, and an id read back out of the reader's own order or off the page has to resolve whenever it
    is asked about rather than only during the render that made it, which is what `repaintReviewHues`
    needs, running long after. Its hue is `langCtxHue`, the same `COLL_THEME` row the banner wears, so the
    two pages cannot come to disagree about what colour a language is.
    **AND IT NOW READS AS A HEADER RATHER THAN AS A SIGNPOST** (`r.langhead` / `.dk-langhead` /
    `langCtxEntries`, Aug 2026, on a bug report: "the languages collection headers in the active decks
    section looks greyed out and lacks the colored numbers on the left"). It fell through to the quiet
    `context` template at the foot of that list, which paints `--paper-2` under a 14px `--ink-faint` title —
    right for an ancestor signpost the reader never chose, and wrong here: a language IS one of the
    reader's collections, drawn with the same banner as a curated one on the Collections page, so on this
    page it should read as a header rather than as a row apologising for itself. It takes the group
    header's wash (its `.deck-group` rules gained a `.dk-langhead` twin, **and so did the `body.night`
    pair** — `body.night .active-deck` is (0,2,1) and outranks a (0,2,0) rule whatever the source order,
    which is the trap `.active-deck.context` already records) plus the three coloured piles and the
    progress bar every other row carries.
    **WHICH IT CAN ONLY ANSWER FOR BECAUSE `entryCardIds` LEARNT TO UNION ITS MEMBERS** — a header stating
    figures the rows beneath it contradict is the one thing a container must not do. That branch reads
    `langCtxEntries(id)`, derived from `S.active` rather than from the map the render happens to be
    building, so it answers long after that render is over (`repaintReviewHues`' own requirement), and it
    carries the cycle guard every other container branch does. A pending deck contributes nothing and needs
    no special case: its own `entryCardIds` is already empty.
    **IT IS STILL NOT A GROUP**: no `data-review`, no `role`, no tab stop, because "study all of Spanish"
    is a scope the reader never asked for. The LOOK is what was reported, not the behaviour.
  · **A CATALOGUE EXISTS BECAUSE THE SHELF IS 181 MB.** Nothing on the site linked to a deck in `decks/`
    until this shipped — they are files a reader imports through the Studio — and a section that listed
    them by FETCHING them would cost the whole shelf to draw a list. What ships is the metadata, a few
    hundred bytes a deck; the deck file itself is fetched only when somebody presses **Download**. It is
    the Library's own arrangement (`BOOKS` eager so the shelf can paint, a book's text lazy).
  · **ADD AND DOWNLOAD ARE TWO PRESSES, AND THE SPLIT IS THE WHOLE OF WHY A DECK REACHES A SECOND DEVICE**
    (`entryPending` / `langCatalogById` / `langCatalogNode` / `langDeckDownload`; the `.dk-pending` row and
    its `[data-langdl]` button in `PAGES.home`. Aug 2026, on request: "Adding a deck from the collections
    page shouldn't download anything; it should merely move the decks to the active decks list, where a
    download button in the banner (with file size) can be clicked to download the deck's cards"). Add
    writes the entry into `S.active` and stops; Download fetches `decks/<file>`. **`S.active` is in
    `PROGRESS_FIELDS` and the cards are in IndexedDB**, so a deck added on the phone arrives on the laptop
    as a row with a Download button on it rather than as cards that turned up by themselves — which is the
    asymmetry the feature is built out of rather than a limitation worked around.
    **A PENDING ENTRY YIELDS NO CARDS, AND THAT NEARLY TOOK THE DOWNLOAD BUTTON AWAY.** `fresh` — the home
    page's first-run test — was `S.cards` empty **and** `activeCardIds()` empty, both of which are true of
    a reader whose only choice so far is a language deck they have not downloaded; the hero it draws HIDES
    the deck list, and with it the one control that can turn that entry into cards. `fresh` now also
    requires that no active entry is pending. It is the same failure the reset-progress clause beside it
    was written for, one step further along: **a state that is empty for a REASON is not a state that has
    never been used.**
    **THE FILE KEEPS ITS OWN DECK ID** — `uDeckImportText(text, false)` — which is what makes the whole
    thing join up: the entry written by Add on one device names `u:hsk30l1`, and an import that minted a
    fresh id would leave that entry pointing at nothing for ever, on every device but the one that
    downloaded it.
    **AND ONE PENDING ROW IS DRAWN PER FILE, NOT PER ENTRY.** A file may carry several entries, which is
    what the catalogue's `flat` unwrapping produces — Indonesian's three phrase groups and Portuguese's
    Expressions and Proverbs are each one file drawn as several rows — so a reader who adds all of one of
    those has several pending entries and one download. Rows each offering the same file are several
    answers to one question, so `emit` collapses them (`pendingSeen`) and names the row after the deck the
    file holds. Once it lands the entries draw their own rows in the ordinary way. (It bit hardest on
    Mandarin, whose nine levels were one 20.6 MB file until Aug 2026; they are nine files now and each
    pending row is its own, which is the same rule with nothing left to collapse.)
  · **A DECK ON THIS DEVICE IS NOT A DECK THIS READER HOLDS** (`DECK_OWN_KEY` / `deckOwnerKey` /
    `uDeckOwned` / `uDeckOwnedByAnyone` / `uDeckClaim` / `uDeckDisown` / `deckOwnBackfill` /
    `uDeckUnmountAll` / `communityRemount`; Aug 2026, on request: "Ensure that downloaded decks are only
    visible to the user who downloaded them (even on the same device)"). Community decks live in one
    IndexedDB store shared by every account that signs in on the device, so what separates them is a
    REGISTER — `folio_deck_own_v1`, account id → deck id → when — read by `communityBoot`, which mounts
    only what the current reader owns. Four things about it.
    **THE GATE IS ONE LINE AT THE MOUNT, and that is why nothing else had to be told.** `UDECKS` /
    `UCARDS` / `UGLOSS` are what every count, row, session and glossary scope reads, so a deck that never
    mounts is invisible everywhere without a single caller learning about ownership.
    **`guest` IS A KEY LIKE ANY OTHER**, so a reader who downloads decks before ever making an account
    keeps them and does not hand them to the first account that signs in there.
    **AN ABSENT REGISTER MEANS "EVERYTHING IS YOURS", ONCE.** `uDeckOwned` answers true while no register
    exists and `deckOwnBackfill` claims the whole store for whoever is here now, inside `communityBoot`
    and before the mount — because reading an unrecorded deck as nobody's would hide every deck a reader
    already had behind a re-download they never asked for.
    **AND A DECK YOU WROTE IN THE STUDIO IS CLAIMED BY `uDeckCreate` ITSELF**, which is the one path into
    `UDECKS` that does not go through `uDeckMount`: unclaimed, such a deck survives the session it was
    written in and is gone on the next load, mounted from nothing. `test-community.js` is what caught it.
  · **UNWRAPPING: A DECK FILE IS NOT ALWAYS A ROW** (`flat` in the catalogue, `langRowSpecs` /
    `langNodeSpecs` in app.js. Aug 2026, on request: "The Mandarin Chinese collection should only contain
    its nine subdecks, not the combined folder … i.e. unwrap them", and "for indonesian, unwrap
    'Indonesian Phrases and Expressions'"). A deck marked `flat` contributes its top-level subdecks as the
    language's own decks and draws no row for the file: for those the file is a container and nothing
    more, where for a DELE level the file IS the level and its two subdecks are directions of it.
    **THE TEST IS A HEURISTIC ON THE TITLES AND HAS TO BE**, since nothing else in a deck file
    distinguishes the two — a subdeck is a `sub` string either way, and the arrow is the only thing that
    says one of them means "the same words asked the other way round". So a top level carrying no `→` is
    unwrapped. **It catches THREE decks and not the two the request names**: Mandarin's nine levels,
    Indonesian's three phrase groups and, by the same rule, Portuguese's Expressions and Proverbs — which
    is the rule doing what it says rather than an oversight, and is recorded so it is not later read as
    one. A direction pair must stay wrapped, or the Spanish shelf would be seven identical pairs of
    "Spanish → English" rows with nothing to say which level each belongs to.
    **AND THE SIZE ON AN UNWRAPPED ROW IS THE WHOLE FILE'S**, so its title says so ("These decks are in one
    20.6 MB file — downloading any of them brings them all") rather than leaving nine rows reading 20.6 MB
    to be added up.
  · **IT IS EAGER, ON `artefacts.js`'s PRECEDENT AND MEASUREMENT.** The documented rule is that only the
    study-critical files load eagerly, and the documented exception is a metadata-only file: an artefact's
    picture is a LINK, so `artefacts.js` stays eager whatever is added to it, and the same holds here —
    9 KB raw against a 5.90 MB eager path is 0.15%. What being lazy would buy is that fraction; what it
    would cost is a placard and a reflow on every visit to one of the site's main pages, for a file that
    is already on disk. **Re-measure rather than assuming it stays small**: it grows by ~250 bytes a deck.
  · **EVERY FIGURE IS READ OFF THE DECK FILE IT DESCRIBES**, which is the whole reason it is generated: a
    row claiming 500 words over a deck that now holds 700 looks exactly like a row, and nothing on the
    page could report it. **`cards` is CARDS and not notes** — a deck may ask a word both ways from ONE
    note by giving its type two templates (HSK, CILS, DELF) or from TWO notes (DELE), so the count
    multiplies each note by its type's template count, which is what makes the two shapes comparable and
    what every other count on the site already means by "cards".
  · **THE LANGUAGE IS MATCHED FROM THE FILE NAME AGAINST A DECLARED LIST, AND AN UNMATCHED FILE IS AN
    ERROR.** The names follow no one pattern (`DELE-A1-Spanish`, `French-Phrases`,
    `Italian-Core-Vocabulary`, `Mandarin-HSK-3.0-Level-1`), so a rule about position drops three of them; what
    they all carry is the language's own name somewhere in the name. Matching TWO is an error too — a
    deck the catalogue could file under either is one nobody would find twice. **A new language is one
    row in `LANGS` plus its deck files**, and the build refuses rather than quietly leaving a file out.
  Currently **44 deck FILES across 7 languages** — French 7, German 6, Indonesian 8, Italian 8, Mandarin
  Chinese 1, Portuguese 7, Spanish 7 — **136,222 cards over 76,502 notes**, 181 MB. **A file is not a row
  since the unwrapping**: the shelf draws French 7, German 6, Indonesian 10, Italian 8, Mandarin 9,
  Portuguese 8, Spanish 7, and a collection's "N decks" counts ROWS. Count them rather than quoting
  either: `node .claude/build-lang-decks.js` prints the file tally on every run and
  `.claude/test-lang-decks.js` derives the row tally from the catalogue's own `flat` flags.
  **WHAT THEY DELIBERATELY DO NOT CARRY IS THE ADMIN GRIP**, and that is a gap rather than an oversight. A
  curated row's `libGripHTML` drags a TREE NODE and writes the new order into `ADMIN_EDITS`, the editor's
  overlay over `data.js`; a language row has no tree node behind it at all, and its order comes from
  `.claude/build-lang-decks.js`, which sorts by the level the exam names and is regenerated from `decks/`
  — so a dragged order would be thrown away by the next rebuild unless it were given a store of its own.
  That is a decision about where a language deck's order lives, so it is left for whoever wants it.
- `.claude/build-lang-decks.js` — the generator above: `node .claude/build-lang-decks.js`. Zero deps, reads
  `decks/*.folio-deck.json` and writes `lang-decks.js`. It sorts by language and then by the level the exam
  itself names (A1…C2, UKBI 1–7, HSK 1–6), with anything that is not a level — a phrase book, a core
  vocabulary — sorting last within its language, that being where a learner reaches it. **Re-run it after
  adding, rebuilding or removing a deck in `decks/`**, or the Languages section goes on offering the figures
  the deck used to have. Not part of the site.
- `changelog.js` — `window.CHANGELOG = [ { d:"YYYY-MM-DD", label?, t, items:[…] } ]`, the day-grouped release notes
  rendered as the **About** page's collapsible changelog (`PAGES.mission`, hash `#mission` — the nav tab is LABELLED
  "About" but the route/hash stay `mission`; section order: intro prose + forgetting-curve SVG → "How to use Folio"
  walkthrough + feature blurbs → FAQ (collapsible `.faq-item`s) → **beta feedback form** → changelog →
  credits/licenses). See the golden rule: append to today's entry on every ship, in ONE sentence.
  **A 0fr GRID ROW ONLY COLLAPSES A CHILD WHOSE OWN MINIMUM IS ZERO, AND PADDING COUNTS TOWARDS THAT
  MINIMUM** (Aug 2026, on a report from a phone: "collapsible sections don't collapse fully"). Both folds
  here are the standard `display:grid; grid-template-rows:0fr → 1fr` with `min-height:0` on the child — and
  the child was the padded `<ul>` / `<p>` itself, so a shut fold stayed ~16–18px tall and showed a CLIPPED
  LINE of its own first sentence through that padding. It reads as a fold that half-works, and it was true
  at every width; a phone is only where it was noticed. The fix is an unpadded wrapper (`.clog-in` /
  `.faq-in`, `overflow:hidden`) between the grid and the padded content: the wrapper is what the row sizes,
  and it really does go to 0. **Reach for the wrapper whenever a 0fr fold's content carries padding.**
  It also carries **`window.FOLIO_VERSION = { v, released }`** at the top — the shipped version, printed in the
  top-left corner of the home page by `versionLineHTML()` (see the golden rule above, and the bullet under
  "How the app is wired"). Nothing rewrites this file programmatically, so both are hand-edited together.
- `mission.js` — `window.MISSION = { title, paras:[…] }`, the About-page intro copy (raw HTML; **deliberately
  jargon-free and written at a low reading level — NO glossary auto-linking on this page**, `autoLinkGlossary` is not
  called). **Admins click the title or a paragraph on the page to edit it in place** (Esc cancels, Ctrl+Enter/blur
  saves): edits overlay via `ADMIN_EDITS.mission` (merged at render by `missionMerged()`, so undo/reload need no
  special handling) and bake back into this file through auto-save / "Save to project" / `folioSave.files`
  (`serializeMission`). The walkthrough / FAQ / forgetting-curve SVG are hardcoded in `PAGES.mission`, not in this
  file. **The About page is TTS-free**: no read-aloud button, and `openGlossWin` skips its play button + auto-read
  when `current.name === "mission"`.
- `lakes.js`, `rivers.js`, `water.js`, `ranges.js`, `admin1.js`, `cities.js` — extra
  Natural-Earth layers for the Atlas globe (lakes, rivers, water-body labels, mountain ranges,
  admin-1 borders, city pins); built by the `.claude/build-*.js` dev scripts. (A Forests layer
  was removed; `forests.js`/`build-forests.js` remain on disk but are no longer loaded or rendered.)
  The **Mountains layer was likewise removed** from the globe: its legend toggle + `wire("#rangesToggle",…)` are
  gone and `rangesOn` defaults `false` with no way to enable it, so `drawRanges` is never called. **`ranges.js` and
  `admin1.js` are no longer loaded by `index.html`** (~1.7 MB less per page load; `drawRanges`/`drawAdmin` remain as
  inert dead code over the empty fallbacks) — the files stay on disk for a future heightmap-style lazy revival.
  `lakes.js` = `window.LAKES` (**~302 major inland seas & lakes**, NE 10m), kept by `build-lakes.js` when
  `scalerank ≤ 4 OR area ≥ 0.1 deg² OR` a well-known name (a `FAMOUS` regex ensures the Alpine lakes,
  Dead Sea, rift lakes, etc.). **Outer rings only** (island holes dropped) so every lake fills solid — otherwise an
  island-heavy lake (e.g. Manicouagan) renders as a confusing thin "ring". Rendered as ocean-coloured fills on top of
  the land (present-day shape in every era), with **no shore stroke** — lakes are covered by the country fill and just
  re-filled as water, so inland seas & lakes read clean (no outline) on the 2026 map too, matching the historical maps
  (don't reintroduce the per-lake border stroke). The **Caspian Sea is NOT in this layer** — no country polygon covers
  it, so it shows through as ocean (its shore is still drawn as a coastline, same on present-day + historical). Rivers
  (`rivers.js`) are stroked in the **ocean colour** (`riverCol = ocean`) so they read as water continuous with the sea.
- `timeline.js` — `window.TIMELINE`, historical border *eras* for the globe timeline (past-year
  political maps, **borders only**). Starts empty; eras are added in **Edit → Timeline** (see
  "Generating timeline eras").
- `countries.js` — `window.COUNTRY_INFO`, a map of *lowercased country/territory name* → 5-sentence
  description, shown in the Atlas click popup. Covers present-day countries (`world.js`) **and** every
  historical-era territory (`timeline.js`); a missing entry just yields a "no description yet" fallback.
  **Regenerated (from the accurate source summaries) + adversarially fact-checked** so each is exactly **5 clean,
  general, TIMELESS sentences free of number-grid figures** (population/area/GDP live in the stat tiles, not the prose) —
  including the 20 former Wikipedia disambiguation stubs (Oyo Empire, Kong Empire, Kuba/Luba/Lunda, Vatican City, etc.),
  which were researched into real descriptions of the entity the map means. Don't reintroduce grid figures or year-pinned
  facts into these; keep them general (the per-year specifics belong in `country-years.js`).
- `country-stats.js` — `window.COUNTRY_STATS`, *lowercased country name* → `{ pop, area, gdp, gdppc }`
  present-day figures (Wikidata, formatted strings) for the popup's stat tiles, shown **at the present year**. It also holds
  `window.COUNTRY_STATS_YEARS`, *name* → `{ "<map-year>": { pop, area, gdp } }` — **year-specific** figures shown at a historical
  map-year (`countryStatsYear()`; GDP-per-capita computed at render). Missing → a long dash, never fabricated.
- `country-spans.js` — `window.COUNTRY_SPANS`, *lowercased state/iteration name* → the years that iteration existed
  (e.g. `"1815 – Present"`, `"1636 – 1912"`), shown in **thin grey under the popup title** (`countrySpan()`; missing → the line
  collapses). Keyed by the name as it appears on the map (present-day name, or the era iteration name). Grown per timeline year.
- `country-years.js` — `window.COUNTRY_YEARS`, *lowercased state name* → `{ "<year>": "<2–3 sentence
  description of that state in that map-year>" }`, for the popup's middle "year" column (`countryYear()`).
  Keyed by the name as it appears on each era's map (e.g. `british raj`, `ussr`, `france`) and the map-years
  (1900/1920/1938/1960/1994/2000/2010/present). Built by a verified generation pass; **only fact-checked
  entries are added — a missing one shows a dash, never a fabricated fact.**
- `country-sources.js` — `window.COUNTRY_SOURCES` (*lowercased place name* → `[citations]`, the works behind the
  general description) and `window.COUNTRY_YEAR_SOURCES` (*name* → `{ "<year>": [citations] }`, the works behind that
  map-year's paragraph). The panel merges the two into **one** numbered list, general first, de-duplicated. **Currently
  empty** — the UI and the pipeline ship, the citations do not (see "Source footnotes"). Written by
  `node .claude/add-country-sources.js <batch.json>`, which refuses a place name that is in neither `countries.js` nor
  `country-years.js` (a citation filed under a name the panel never looks up is a citation nobody will ever see).
- `fetch-glossary.js` — standalone Node helper, run manually, that backfills missing glossary
  terms from Wikipedia. Not loaded by the site.
- `.claude/fetch-place-coords.js` — writes `window.GLOSSARY_PLACES` (slug → `[lon, lat]`, fetched from each
  Wikipedia article's own published primary coordinate) and `window.GLOSSARY_MAP_COUNTRY` (slug → the name
  world.js uses) into glossary.js, so a glossary term can put itself on the Atlas. **One title per request** —
  batching looked economical and quietly lost most of them, because `prop=coordinates` paginates and a
  single-response reader records a handful and reports the rest as having no coordinate, which is
  indistinguishable from the truth. Rate-limited hard: it backs off and retries rather than recording a 429 as
  "no coordinate". Not part of the site.
- `.claude/build-us-states.js` — builds `us-states.js` from Natural Earth 10m admin-1: `node
  .claude/build-us-states.js [--refetch]`, caching the 40 MB source in `.claude/ne-cache/` (gitignored).
  Zero deps. It **asserts exactly 51 shapes and unique postal abbreviations** and re-parses the file it
  writes, on `add-card.js`'s discipline — a builder that quietly drops a state produces a card whose key
  names nothing, which paints an empty window and throws. Its header carries the tolerance arithmetic, which
  is the part worth reading before touching it: the figures are derived from the map card's own zoom ceiling
  and **must not be re-synced to world.js's**, which is where they started and which produced a 49-point
  Rhode Island. Filters on `adm0_a3 === "USA"` and `type_en === "State"`, plus DC by name — that last is a
  named exception because Natural Earth does not type it as a state and the layer would otherwise be 50.
  Not part of the site.
- `.claude/fetch-images.js` → `.claude/search-images.js` → `.claude/pick-images.js` → `.claude/add-images.js`
  — the four-step **picture pass** that put an illustration on 233 cards and 547 glossary terms (Aug 2026, on
  request; the site had exactly ONE picture before it). Standalone Node helpers, zero deps, resumable, cache
  in `.claude/image-cache/` (gitignored). Not part of the site. Read them in that order — each header carries
  what it found.
  · **THE BAR IS "FREE TO USE COMMERCIALLY", because Folio may sell premium accounts.** It began as public
    domain only, on the request's wording, and was **widened to CC BY and CC BY-SA on request** once the
    price of the narrow reading had been measured — 133 terms had a usable CC picture and no public-domain
    one. Two facts make the wider bar safe and both are worth knowing before anyone narrows it again.
    **Wikimedia Commons only accepts licences permitting commercial use AND derivatives**, so NC and ND are
    outside its scope entirely and the corpus is past the hard part before this pass starts (the NC/ND test
    in `licenceClass` is belt and braces, and finds nothing). And **share-alike does not reach the site**:
    CC BY-SA's copyleft binds ADAPTATIONS of the picture, while a page showing one beside prose is a
    COLLECTION — CC 4.0 says the licence "does not apply to the other parts of the Collection" — and
    resizing to a thumbnail is a format change rather than an adaptation. So a CC BY-SA illustration does
    not oblige Folio to license Folio under CC BY-SA and does not stand in the way of charging.
    **GFDL, the Free Art Licence and the one-off national open licences are still refused**: GFDL permits
    commercial use but wants its full text shipped with the work and a "transparent copy" made available,
    which a card frame cannot do, and the others would each need reading on their own terms for a few dozen
    files. **A CC FILE WHOSE AUTHOR CANNOT BE ESTABLISHED IS REFUSED TOO** (`attributableAuthor`) — naming
    the creator is the condition of the grant, not a courtesy, so "Unknown author" is a fine answer for a
    public-domain scan and no answer at all for a CC one. 501 files are dropped on that rule alone.
  · **THE CAPTION IS THE ATTRIBUTION.** A CC picture's `desc` ends "<Author>, <licence>, via Wikimedia
    Commons" and its `credit` is the Commons file page, which together carry creator, licence and source;
    a public-domain one says "Public domain, via Wikimedia Commons" and needs none of it. An ARTEFACT has
    no `desc` field (its entry already has name, date, origin and five sentences), so the whole attribution
    goes in `credit`, which renders as plain text — hence the URL is written into it rather than linked.
  · **THE LEAD IMAGE ALONE IS NOT ENOUGH.** Taking Wikipedia's `pageimages` gave 128 usable pictures out of
    836 terms; reading EVERY file on the article and ranking them gave 628, for the same number of requests.
    An article routinely illustrates a public-domain OBJECT with a modern copyrighted PHOTOGRAPH of it.
  · **`imlimit=max` IS A CAP ON THE WHOLE QUERY, NOT PER PAGE**, so batching twenty titles returns the first
    article's files and silently nothing for most of the rest — 221 terms came back "no-image" that way,
    France and Homo erectus among them. A truncation that reports as an absence is the worst shape a bug can
    take here. One title per request.
  · **`incategory:"PD-old-100"|incategory:…` RETURNS NOTHING AT ALL** — the OR form is not supported the way
    it looks, and it fails by matching zero rather than by erroring, so it reads as "Commons has no
    public-domain picture of the Venus of Willendorf". `haswbstatement:P6216=Q19652` is the working filter.
  · **THE MACHINE RANKS AND A READER CHOOSES.** The scorer is a name match and a name match is confidently
    wrong: the top candidate for `Jason_E._Lewis`, the palaeoanthropologist, was the official portrait of a
    United States congressman of the same name — public domain, high resolution, no watermark, wrong man.
    Every one of the 547 was read against its file name, its article and its Commons description before it
    shipped. The rejects are the other half of the work: `Polis` matched Governor Jared Polis, `Levallois`
    the Paris suburb, `Malia` the president's daughter, `Corinth` the painter Lovis Corinth, and
    `Eighth-century_revival` resolved through the search fallback to *Futurama*.
  · **A CAST IS NOT THE THING, and metadata cannot always tell you.** The best public-domain picture of the
    Venus of Willendorf is a white plaster cast on a mounting block with an accession number inked on it, and
    nothing in its Commons record says so — it was found by LOOKING at it. `--build` drops a file whose NAME
    or CATEGORIES say cast/replica while its caption does not (the description is deliberately not read:
    Hayes's biography mentions votes *cast*), and a labelled cast is kept, since in palaeoanthropology the
    originals are rarely photographed and "museum replica" in the caption is honest. **The residual risk is
    real**: a dozen were checked by eye, one was wrong, and it is the kind of error only a reader will find.
  · **ONE PICTURE MAY NOT STAND FOR TWO TERMS** — sibling terms share a Wikipedia article, so the same file
    ranks top for all of them, and a reader meeting the identical photograph under "Minoan civilisation" and
    "Minoan trade with Egypt" learns that Folio is guessing. First claimant keeps it.
  · **A CARD TAKES ITS ANSWER TERM'S PICTURE**, which is not a shortcut: the pairing rule already says every
    card ships with a glossary entry for its own answer, so the term IS the card's subject. 394 of the 409
    cards resolve to a term.
  · **A COUNTRY TAKES ITS FLAG** (178 of them, plus Ireland by hand, whose article is the island). The
    alternative is a photograph, and a photograph of a country is a photograph of one thing in it — the top
    public-domain candidate for Georgia was a US Navy destroyer visiting Batumi and for Tanzania a giraffe.
    An SVG flag is unambiguous, public domain everywhere, watermark-free and sharp at any zoom.
  · **THE THREE TEXT FIELDS COME FROM THREE PLACES**: `title` is the TERM (what the picture is of), `alt` is
    the cleaned FILE NAME (what the picture shows), `desc` is Commons' own English description — never a
    sentence composed here, since a composed sentence about somebody else's photograph is a fabricated fact.
    Every `desc` ends with the licence and "via Wikimedia Commons", so the corpus states its own copyright
    status where the reader can see it.
  · **`src` is the 1600px rendering for a raster and the original for an SVG.** The card frame caps at 680
    CSS px, so that is high-resolution with room to open fullscreen, and it spares the reader a 40 MB scan.
  · **A REVIEWED PICK IS FROZEN BY FILE NAME, NEVER BY INDEX** (`chosen-0-frozen.json`). The review lists
    record an index into a RANKED candidate list, and widening the licence bar re-ranked every one of them
    — so the second pass would have silently swapped the picture on terms already reviewed and shipped.
    The shipped choices are resolved back to their `File:` titles from `glossary.js` and frozen; only a
    list reviewed against the CURRENT ranking may stay an index. `chosen-0-frozen.json` also sorts first,
    which matters because the first claimant of a file keeps it — and note that `chosen-10` sorts before
    `chosen-2`.
  · **ARTEFACTS HAVE NO ARTICLE TO WALK**, so they are searched by name (`search-images.js --artefacts`),
    first for public domain and then `--wide` for CC. Half their names are a KIND rather than a thing
    ("Flint scraper", "Roman gold aureus"), which cuts both ways: a kind is hard to search and almost
    impossible to get wrong, a named object is easy to search and easy to get wrong by finding a replica —
    the top hit for the Portland Vase is the Wedgwood copy and for the Mask of Agamemnon an electrotype.
    Both were caught by eye. `gladius` matched *Xiphias gladius*, the swordfish, in both sweeps.
  · **A HAND-WRITTEN QUERY IS THE LAST RESORT AND IT HAS TO EXIST** (`search-images.js --queries=<file>`,
    a `{ "<key>": "<query>" }` map whose results are cached under a `|q` suffix). The automatic query is
    the subject's own NAME, and a name is sometimes the worst search term there is: CirrusSearch ANDs its
    terms, so "Roman bronze as" matches nothing at all, and "Gladius" matches *Xiphias gladius*. What works
    is naming the thing the way a MUSEUM catalogues it — "Roman sword Mainz", "Kangxi Tongbao", "Post
    Medieval pewter spoon" — and that is a judgement no rule makes. Seven of the eight artefacts the two
    automatic sweeps could not serve went through on one hand-written query each.
  · **A CAPTION IN A SCRIPT THE READER CANNOT READ IS NOT A CAPTION.** Where the uploader wrote the
    description only in their own language there is no English part for `englishPart` to take, and the raw
    text arrives under an English term as a line of Belarusian or Arabic; translating it here would be
    composing a sentence about somebody else's photograph, which is the one thing this pipeline must not
    do. So the description is dropped and the cleaned FILE NAME carries the caption — and where the file
    name is in that script too, the pick is dropped outright, since `alt` is the one field that exists for
    the reader who cannot see the picture at all.
  · **THE HAND-WRITTEN QUERY IS WHERE THE LAST THIRD CAME FROM, and it needs a `--tag`.** Four rounds of
    them took the glossary from 684 to 771: the automatic sweep had already been run over every one of
    those terms and found nothing usable, and naming the subject the way a museum or an excavation report
    names it found a picture for a third of them (`Acragas` → "Temple of Concordia Agrigento",
    `Mycenaean_road_network` → "Arkadiko Mycenaean bridge", `Ledi-Geraru` → "LD 350-1 mandible"). **A
    second round for the same subject needs `--tag=q2`**, because `searchTerms` skips a key already in the
    cache — which is what makes the whole pass resumable, and which means a better query re-run under the
    same key does nothing at all, silently, and reads as the better query having found no more than the
    worse one.
  · Coverage today: **771 of 836 glossary terms, 360 of 409 cards, 99 of 100 artefacts.** The 65 terms
    still without one are not a backlog: **41 are ABSTRACT** — Greek institutional vocabulary (`Apella`,
    `Gerousia`, `Phratry`, `Synoecism`, `Xenia`), the Linear B titles (`Lawagetas`, `Qa-si-re-u`), the
    chronozones (`Boreal`, `Atlantic_period`, `Chronozone`) and the theories (`Cooking_hypothesis`,
    `Mosaic_evolution`, `Southern_dispersal_route`) — and **10 are living or recent scholars** with no
    freely licensed portrait (`Sonia_Harmand`, `Mark_Collard`, `Todd_Whitelaw`). The remaining 14 are
    places and cultures Commons genuinely does not illustrate freely (`Madjedbebe`, `Nyayanga`,
    `Wonderwerk_Cave`, `Al_Mina`, the Ahrensburg, Bromme and Pitted Ware cultures — the last three
    photographed only in Swedish and Danish museum uploads whose file names and captions are in those
    languages, which the Latin-script rule above refuses). **Say which of those a later attempt is for**:
    a term with no picture because none exists is finished, and a term with no picture because the caption
    was unreadable is not. The one artefact without a picture is the Lord of Sipán's turquoise ear
    ornaments: Commons holds no free photograph of them at all.
  · **A CARD'S ANSWER IS OFTEN THE PLURAL OF ITS TERM, and matching only the exact surface loses the
    picture the pairing rule already paid for.** "Denisovans", "Mesara tholos tombs", "bronze tripod
    cauldrons" and `Lucy` (whose key is `Lucy_(Australopithecus)`) all resolve now — the site's own
    auto-linker pluralises a key when it scans prose, and this is that rule read backwards. A COMPOUND
    answer is deliberately not resolved to its head noun: "Euboean trade" is not Euboea and "Chalcis and
    Eretria" is neither of them. Those **8 cards are reported by name** at the end of a build rather than
    passed over, since an answer naming no term is a break in the card→glossary pairing rule and this is
    where it shows up first.
  · **A NEW ITEM NO LONGER WAITS FOR A SWEEP.** This pipeline is a BATCH over the whole corpus, which is
    the right shape for 836 terms at once and the wrong shape for the one term written this morning — it
    is how the corpus went from one picture to several hundred in a day and then began drifting out of
    date the next. `.claude/suggest-image.js` is the single-item version, and `add-card.js`,
    `add-glossary.js` and `add-artefacts.js` each call it at the end of a successful add.
- `.claude/fix-image-text.js` — the repair pass over the words that travel WITH a picture (Aug 2026, on
  request: "some images don't contain titles or descriptions, and some of those that do contain grammatical
  errors or spelling mistakes"). A picture's caption is ASSEMBLED rather than written — Commons' own English
  description where there is one, the cleaned FILE NAME where there is not, plus the attribution the licence
  requires — and that leaves residue a reader meets in the viewer's caption bar. Run it after a picture batch;
  it is IDEMPOTENT for cards and the glossary (the hand-checked table is keyed on the exact text as it ships,
  so an entry that has already been applied is REPORTED rather than silently doing nothing) and skips an
  artefact that already has its two fields. Four things it settled:
  · **AN ATTRIBUTION IS NOT A DESCRIPTION, and 56 captions were only that** — "Michael Gunther, CC BY-SA 4.0,
    via Wikimedia Commons." and nothing else, where Commons carried no usable English and the file name
    cleaned down to nothing. The repair composes NOTHING: those pictures already carry a full hand-written
    `alt`, which is a description of the picture by definition, so the alt is PROMOTED to the caption.
  · **A COLON IS NOT PUNCTUATION TO BE TIDIED.** The first cut spaced out every `,;:` with nothing after it,
    which turned every URL in the corpus into "http: //", every wiki namespace into "en: William" and an
    aspect ratio into "1.7477: 1". It is the one mark here as often structural as grammatical, and it is left
    alone in both directions.
  · **THE ELLIPSIS HAS TO BE NORMALISED BEFORE THE DOUBLED STOP**, or `\.{2}` eats the tail of one and leaves
    a caption ending in two dots — the rule that exists to fix "12 by 19 cm.." breaking the truncation mark
    that `pick-images.js` puts on a caption it cut at 300 characters.
  · **AND THE HAND-CHECKED TABLE IS THE HONEST HALF.** A mechanical rule cannot know that "MeadowcroftPA" is
    a rockshelter in Pennsylvania, that "afarensisIMG 2930" is a camera number welded to a species, or that a
    flag file's caption is the SVG author's construction notes rather than anything about the flag. 35
    captions and 9 alts are read by hand, each entry recording what the file name actually said. Not part of
    the site.
- `.claude/suggest-image.js` — the SINGLE-ITEM half of that pass, and the reason the corpus should not
  drift out of date again: `add-card.js`, `add-glossary.js` and `add-artefacts.js` each call
  `report(kind, key, subject)` at the end of a successful add, so a new card, term or artefact looks for
  its picture the moment it is written, exactly as it ships with its own citations. It **suggests and
  never installs** — the candidate list is a name match, and a name match is confidently wrong in a way
  nothing downstream can catch (the top public-domain hit for `Jason_E._Lewis`, the palaeoanthropologist,
  is a United States congressman of the same name), so it prints candidates, their licences, their sizes
  and their Commons pages, and a person picks. It applies the same last-gate bar `pick-images.js --build`
  applies, so a candidate it shows is one that could actually ship. It is **best-effort and never fatal**:
  it runs after the content has been written and it needs the network, so a failure prints one line and
  leaves the exit status alone — a content tool must not start failing because Commons is slow.
  `--no-image` skips it. Run it directly with `node .claude/suggest-image.js "<subject>" [--slug=<key>]`.
  Not part of the site.
- `.claude/caple/` — the generator behind the six `decks/CAPLE-<level>-Portuguese.folio-deck.json`
  files, **all six CEFR levels** (A1: 498 notes / 996 cards, 1.8 MB; A2: 500 / 1,000, 2.0 MB;
  B1: 998 / 1,996, 3.4 MB; B2: 1,400 / 2,800, 4.1 MB; C1: 999 / 1,998, 3.0 MB; C2: 700 / 1,400,
  2.0 MB) **and, since Aug 2026, a seventh deck that is not a level**
  (`decks/Portuguese-Phrases-and-Expressions.folio-deck.json`; 1,342 notes / 2,684 cards, 2.2 MB),
  community decks rather than site content:
  `python3 .claude/caple/run.py [--level c2] [--no-fetch] [--variety-check]`. Seven stages, run by
  `run.py`, caching its corpora in `.claude/caple-cache/` (~750 MB, gitignored). PYTHON, like
  `.claude/dele/` and `.claude/goethe/` and for the same reason: a further level is a re-run against
  the next inventory rather than a rebuild. **ONE LEVEL PER RUN** (`caple_level` reads the level once,
  at import), and a level is taught on top of the ones below it, read out of the SHIPPED deck files —
  the DELE and Goethe arrangement exactly. It takes the **Goethe SHAPE** rather than the DELE one: one
  note with two card templates, so a corrected gloss is corrected both ways at once and each direction
  still keeps a schedule of its own.
  · **THE PHRASES DECK IS THE SEVENTH AND IT IS NOT A CEFR LEVEL** (`--level phr`; `parse_phrases.py`,
    and `PHRASES` / `SUBS` / `headwords_below` in `caple_level.py`. Aug 2026, on request: "add a deck
    with common phrases and expressions"). **It is the Mandarin set's own arrangement** — that deck
    teaches the seven HSK levels and then two subdecks carry Phrases and Idioms, "the two the syllabus
    leaves out" — and the reason is the same here: a Referencial level is an inventory of WORDS, so a
    set expression reaches those decks only where the inventory happens to name one, and what the six
    between them teach is **17 of the 1,342 this pool holds**. Eight things are decisions rather than
    plumbing.
    **IT REUSES EVERY STAGE THAT IS ABOUT PORTUGUESE AND REPLACES THE FOUR THAT ARE ABOUT THE
    REFERENCIAL.** `examples.py` and `build_deck.py` are the same code with the same European filters
    and the same card type; `parse_phrases.py` stands in for parse_referencial + supplement +
    extract_kaikki + select, because none of the cascade those run applies when the pool IS the deck —
    that cascade exists to stop the closed classes competing with nouns on raw frequency while choosing
    500 words from several thousand, and here nothing is being chosen.
    **WHAT COUNTS AS AN EXPRESSION IS TWO TESTS, and each misses what the other catches**: a part of
    speech only a phrase can have (`phrase`, `proverb`, `prep_phrase`, `intj`) OR an `idiomatic` tag on
    any sense. `de vez em quando` is an ADVERB and `pão e circo` a NOUN, so the POS test alone loses
    both; `não sei` and `com certeza` are filed as phrases and carry no tag, so the tag alone loses
    those. **What the pair keeps OUT is the point** — `cartão de crédito`, `fim de semana` and `banda
    desenhada` are all in the dump, all multi-word, and none is in this deck, being nouns that happen
    to be spelled with a space.
    **THE ORDER IS THE CORPUS COUNT, and it has to be**: hermitdave's frequency lists are SEGMENTED, so
    `de vez em quando` appears in them as four ordinary words and the phrase has no rank at all.
    `select.py` solves that for the handful of phrases in a word deck by counting them in Tatoeba and
    calibrating onto the subtitle scale through the single words that carry both; here every entry is a
    phrase, there is nothing to calibrate against, and the calibration would be monotone in the count
    anyway. **Counted on WORD BOUNDARIES** — the pipeline's own `poder com` / `poder comprar` fault,
    worth more here because a short phrase is common: `a par` matches 7,847 times as a substring
    (almost all `a parte` and `a partir`) and 21 on boundaries.
    **715 OF THE 1,342 ARE IN NO CORPUS AT ALL, and that is the subject rather than a gap** — an idiom
    is literary where a sentence-pair corpus is conversational, and the Mandarin deck records exactly
    the same of its chengyu (361 of 5,227 appear even once). Stated in the deck's own description and
    NOT repaired by truncating to what the corpus can rank, which would let the corpus choose the
    syllabus — the DELE pipeline's own finding.
    **THE BRAZIL FILTER IS ENTRY-LEVEL HERE where the word decks demote a SENSE**, and the difference
    follows from what is being taught: a word usually means the same thing on both sides of the
    Atlantic and differs in one sense, so the sense is demoted and the word ships, while an idiom is
    the whole of what is being taught and one whose every recorded meaning is marked Brazil is not said
    in Portugal at all. **178 go that way — much the largest filter here**, which is what a corpus of
    idioms should look like, set expressions being the most regionally divided part of a language.
    **…AND THE TAG CANNOT SEE AN EXPRESSION THAT IS BRAZILIAN IN ITS WORDS**, which is a second filter
    and was nearly missed: `a grama do vizinho é sempre mais verde` is filed as Portuguese generally,
    so nothing marks it, and in Portugal a lawn is `relva` while a `grama` is a gram. The first hand
    table was swept with **the seven shibboleth PAIRS `run.py` checks the corpora with**, and every
    leak turned on a word outside that list — so the sweep is now against the **whole frequency list**
    (`variety_report`, printed on every run) and the table names **15**. **THE LINE IS ZERO EUROPEAN
    HITS**: a word common in Brazil and wholly absent from a European list of the same size is a
    variety marker rather than a rarity, and that took nine (`sumiço`, `mané`, `eita`, `cê`, `capim`,
    `pingando`, `oras`, and `cômico`, which is a SPELLING — Wiktionary's own `cómico` entry glosses
    itself "European Portuguese standard spelling of cômico"). The rest were read: `grama` at 9.5×
    against `relva`'s 0.23, `fumaça` 16.7× against Portugal's `fumo`, `paletó` 19.4×.
    **AND THE REST IS REPORTED AND LEFT, WHICH IS `select.py`'S OWN RULE.** 78 shipped phrases still
    carry a word said ≥8× more often in Brazil and taking them wholesale would cost more than it
    saved: `em suma` is flagged for the coincidence of `suma` and `grão a grão enche a galinha o papo`
    for `papo`, both of them Portugal's own, and they sit in the same band as the real Brazilianisms
    (`tô ligado`, four on `botar`, `chutar o balde`). **Read the report, do not automate it.**
    **AND `headwords_below` IS A SECOND FUNCTION RATHER THAN A WIDER `words_below` — BUT IT RETURNS
    BOTH FORMS, AND SHIPPED RETURNING ONE.** A level asks "is this WORD already taught?" and strips a
    leading article, so `a distância` goes into its exclusion set as `distância`; this deck asks "is
    this PHRASE already taught?", and the two answers differ at BOTH ends. Keeping the unstripped form
    is what saves the adverbial locutions (`a par`, `a seco`, `a pé`), which stripped would enter as
    `par`, `seco` and `pé` and match nothing. Keeping the STRIPPED form is what was missing: **a noun
    is keyed WITH its article**, so C1's `o peso morto` never matched the candidate `peso morto` and
    the deck taught one lexeme twice under one gloss. A noun's article there is the deck's own
    typography — it is what colours the gender — and no part of the headword. Widening the shared
    `words_below` is still refused: it would drop six adverbial locutions from C1 and C2, which ship
    correctly. Widening THIS one is safe because only `parse_phrases` imports it, and measured over
    the pool the union excludes exactly one phrase the old rule kept — that duplicate.
    **TWO SUBDECKS, READ AND NOT GUESSED**: Wiktionary files a proverb under a part of speech of its
    own, so **Expressions (1,127)** and **Proverbs (215)** are split on the record rather than on the
    shape of the words. `build_deck.py` writes the `sub` string; the deck's subdecks are the distinct
    values its cards name, which is what makes them cost the file nothing.
    **A BOUNDARY MATCH FINDS THE WORDS AND NOT ALWAYS THE EXPRESSION**, which is `poder com` /
    `poder comprar` one level deeper — there the boundary rule fixed it, and here the boundaries are
    already right. `que foi` is the exclamation "what's the matter?" and also the two words in `a
    primeira vez que foi preso`, so the card came up glossed as an interjection over three sentences
    in which it is a relative clause: **teaching the wrong thing rather than nothing**, which is worse
    than an empty fold. **What separates them is the ENGLISH** — `reflexives.py`'s own answer to the
    same question, where `KEYWORDS` requires the translation to carry a word the reflexive means — and
    here the keyword set is free, being the entry's own gloss. It is scored as a **PREFERENCE and not
    a filter**: an idiom translates loosely (`bater as botas` is "to kick the bucket" and its sentence
    may say "he died"), so a hard test would drop good sentences to remove bad ones. Measured on the
    pool as it then stood, it took the mismatches from 149 of 445 to 108, and `que foi` now opens on
    "Que foi que eu fiz de errado?".
    The rest is stated in the deck's own description rather than repaired. **Gated on `PHRASES`** for
    the ordinary reason: it changes which sentence is chosen, so ungated it would re-pick examples
    across all six word decks for a problem those decks barely have, their entries being single words
    where an inflected form is its own evidence of which word it is.
    **AND THE BOLDER MATCHED AGAINST ALREADY-ESCAPED TEXT**, found by the same assertion that caught
    `poder com` (a card with examples must have a bolded term in them): the pattern is built from the
    raw form and was applied to `esc(pt)`, so a form carrying an escapable character matched nothing
    and its sentences shipped with no bold at all. **One form on the whole shelf does** —
    `tempestade em copo d'água`, whose apostrophe becomes `&#x27;` — which is why it went unseen and
    why the fix is provably inert on the six: swept over every level's examples, no other form
    contains `'`, `&`, `<` or `>`. Matched on the raw sentence and escaped afterwards now.
    **ITS LOUDEST FAULT WAS TWO MISSING KEYS IN `POS_NAME`** — `recs_of` keeps a record only if its
    `pos` is a key there, and `proverb` and `prep_phrase` were not, so all 218 proverbs and 19
    prepositional phrases arrived with no records, no senses and no meaning. **The guard caught it
    outright** ("cards with no meaning at all") rather than shipping, which is the failure shape this
    pipeline wants. Both were added UNCONDITIONALLY because they are **provably inert** — swept over
    all six shipped word lists, not one word has such a record — where `name` was NOT in that position
    (B1's `terra` and C2's `ártico` each have one) and is therefore added only under `PHRASES`, rather
    than quietly re-picking the primary record of two cards in decks nobody was editing.
  · **THE BUILD WAS NOT DETERMINISTIC, FOR THREE LEVELS, AND ONLY THE BYTE-FOR-BYTE RULE COULD SEE IT**
    (Aug 2026, found while adding B2). `examples.py` banked its per-sentence findings in a SET of
    `(word, form)` pairs and then iterated it — and Python randomises string hashing per process, so
    the order varied between runs. It decides which candidate a word banks FIRST, which decides which
    of its sentences survive the scoring, so **A2 rebuilt twice from an unchanged cache produced two
    different decks**. It shows only where one sentence carries two forms of the same word — `Ele
    ganha o dobro do que eu ganho` banked as `ganha` on one run and `ganho` on the next, so the card
    bolded a different word and chose a different third sentence — which is why A1, B1 and B2 all
    reproduced and A2 did not. **Every deck was correct either way**, which is exactly why nothing but
    the rebuild-and-diff discipline was ever going to find it. Sorted at the point of use, and
    verified the strong way: **all four levels built under two different `PYTHONHASHSEED` values are
    byte-identical**, which is a better check than two ordinary runs and is the one to repeat.
  · **B2 IS WHERE THE TABLE'S OWN GUESSES CAME DUE** (Aug 2026). Three of them, and each was corrected
    by measurement rather than by judgement. **ITS TARGET WAS WRONG**: `TARGET` said 2,000, written
    when only A1 existed, and the Referencial's levels are not a widening syllabus — B2's Noções
    section has the same 162 headings as B1's and largely repeats its bullets, so what B2 ADDS once
    the 2,216 words below are removed is a pool of **1,491**. `select.py` REFUSES a level short of its
    target rather than taking what it can get, so the guess announced itself on the first build; it is
    1,400 now, with the margin a corpus refresh needs. **ITS REFLEXIVES ARE 78 NAMED AND 41 GLOSSED**
    — and the second test grew a third family, the phrase-bound `dever-se`, which occurs only ever as
    `dever-se a` and so is a headword the inventory has not got, exactly as `ir-se embora` is at A2.
    **AND 206 OF ITS 1,400 WORDS HAVE NO EXAMPLE SENTENCE**, against B1's 40 in 1,000: B2's inventory
    is a fifth multi-word phrases and its single words are rarer, and Tatoeba's Portuguese does not
    reach them. That figure is stated in the deck's own description rather than repaired, because
    repairing it means letting the corpus choose the syllabus — the DELE pipeline's own rule.
  · **C2 COMPLETES THE SIX AND ITS FINDING IS THE SHAPE OF THE LADDER** (Aug 2026). Measured the way
    the guard forces, the levels ADD **500, 500, 1,000, 1,400, 1,054, 741** — it rises to B2 and then
    falls away, so the two C levels together are smaller than B2 alone. That is not the Referencial
    running out of language: it describes what a speaker can DO at each level, and by C1 most of the
    doing is done with vocabulary the lower levels have already given, so the top of the ladder
    contributes the specialised words and little else. **Its own two drops are one of each kind the
    pass has met, and neither could have been found by the ratio report.** `parabenizar` occurs
    exactly ONCE in the whole document and it is inside a worked example — a word the Referencial
    USES rather than one it LISTS, which is `segurar-se`'s test — so it is in `BLOCK` rather than
    `BRAZILIAN`, even though it is also Brazilian and posted the highest ratio the pass has produced
    (814×); **a word the inventory does not name has no place in the deck whichever side of the
    Atlantic says it.** And `cesta básica` is `varal`'s case — listed alone, with `cabaz` nowhere in
    the document — but it is **the first PHRASE in that table, so it carries no frequency count and
    the ratio report is blind to it**; it was found by reading the level's own no-example list, which
    is where the rare and the foreign both end up. **293 of its 700 words have no example sentence**,
    42% against B2's 15%, which is the same curve seen from the corpus's side and is stated in the
    deck rather than repaired. Two smaller things: `concernir` is the shelf's first **defective**
    verb — used only in the third person, so it has no imperative for a reason that is not
    impersonality — and it renders honestly, dashes in the persons it has not got; and `linhagem` is
    the sense ranking's one remaining shape, below.
  · **A WORD MAY HAVE TWO NOUN RECORDS WITH THE ODD SENSE FILED FIRST, AND NO TAG SEPARATES THEM**
    (Aug 2026, C2). `o comboio`'s "convoy" is fixed by scoring a European tag negatively; here
    neither of `linhagem`'s two records carries a tag at all, so the pick is pure Wiktionary record
    ORDER and it led with "burlap" for a word that means lineage. **Measured before it was treated as
    a class**: 177 shipped words across the six levels carry two or more noun records, and reading
    C2's seventeen by eye this is the only one the order gets wrong — `coração`, `bar`, `canto`,
    `gota`, `pilha` and `teto` all lead with their central sense. So it is an `AUTHORED` entry rather
    than a rule, and **the next one is found the same way: read the level's own multi-record nouns
    when adding a level**, which is a list of seventeen rather than a corpus.
  · **C1 CORRECTED 108 CARDS IN THE FOUR DECKS ALREADY SHIPPED, AND ADDED NONE OF ITS OWN FINDINGS TO
    ITS OWN DECK** (Aug 2026). That is the rebuild-every-level rule paying for itself: nothing in C1
    needed a new stage, and the three faults it surfaced were all in shared code, all silent, and all
    older than the level that found them. **THE `-s` DROP BEFORE `vos` WAS A RULE APPLIED ONE TENSE TOO
    WIDE**, and it is the one that was not merely archaic but wrong: `enclitic` dropped a final `-s`
    before `vos` on every form, where that belongs to the FORMATION of the affirmative imperative
    (`chamais` → `chamai`), which the source hands over already formed — so the present became
    `chamai-vos` for `chamais-vos`, the personal infinitive `chamarde-vos`, and the preterite
    **`chamaste-vos`, which is the second person SINGULAR verb carrying a plural pronoun** and reads as
    an ordinary word. Measured on two sources that do not know about each other before it was touched:
    Tatoeba's Portuguese is unanimous on the 1pl drop (129 `-mo-nos` against 0) while every `-vos` token
    but one is an imperative and says nothing either way, and the single informative one,
    `lembrais-vos`, keeps its `-s`; Wiktionary's own generated pronominal table keeps it in all four
    non-imperative tenses and drops it in the imperative. 103 reflexive cards across A1–B2. **THE
    LESSON IS THAT ONE FIX MADE TWO CARDS OF ONE DECK SPELL THE SAME CONSTRUCTION TWO WAYS**, which is
    what forced the measurement — see the next bullet.
  · **A VERB THAT IS INHERENTLY PRONOMINAL COMES WITH ITS PRONOUN ALREADY IN THE TABLE** (Aug 2026, C1;
    `is_pronominal` / `remark` in build_deck.py). `arrepender` is only ever used as `arrepender-se`, so
    Wiktionary's `pt-conj` generated it in the pronominal form — every cell reads `arrependo-me`,
    `arrepender-me-ei`, `me arrependa` — and the reflexive branch attached a SECOND pronoun, so 29 rows
    of one card printed the word twice. Nothing threw, the paradigm was the right shape and the right
    length, and the only symptom was the pronoun twice; **`check-caple.js`'s existing sweep for a still
    hyphenated clitic would have caught it, and there was no `c1` PROBE row yet to run**. One card of
    3,397 on the shelf. **THE FORMS ARE RE-MARKED RATHER THAN STRIPPED AND REBUILT**: inverting the
    source's transformation means guessing which `-s` it dropped, the table IS the reflexive paradigm,
    and all it needs is the hyphen turned into a colour. **AND THE TWO CONVENTIONS AGREE EVERYWHERE
    ELSE**, which is the closest thing to an independent check the clitic module has — the generated
    table puts the pronoun after the verb, inside the future and the conditional, before the verb in
    the conjuntivo and after `não` in the negative imperative, cell for cell what `TENSES` says. It is
    also what exposed the `vos` rule above, by putting the source's spelling and ours on two cards of
    one deck.
  · **AN ARTICLE IS COLOURED ONLY WHERE THE PIPELINE PUT ONE** (Aug 2026, found while adding C1;
    `headword_html`). It re-derived the article by matching a leading `a`/`o` in the STRING, and the
    Referencial names adverbial locutions built on the preposition `a` — so five B2 cards set `a fim
    de`, `a menos que`, `a não ser que`, `a distância` and `a seco` with their first word in the
    FEMININE-ARTICLE colour, contradicting the part of speech printed two lines below. On a deck whose
    whole visual grammar is that the article's colour teaches the gender, that is the Goethe deck's own
    fault the other way round. Nothing threw and every count was right; the symptom was a colour.
    **THE COLLISION IT ALSO EXPLAINS IS NOT A DUPLICATE**: `a distância` is taught at A2 as a feminine
    noun and at B2 as an adverb, which `words_below` cannot see because it strips the article from the
    lower deck's headword and the upper candidate carries it as a preposition. Six such candidates
    exist across the four levels (`a pé`, `a seguir`, `a princípio`, `a distância`, `a seco`) and
    **every one is an adverb**, so they ship: the noun colours its article and the locution does not,
    which with the part of speech under it is how the two cards say which they are. A NOUN doing the
    same thing would be two identical headwords, so `select.py` reports that case and is silent today.
    · **AND ONE REDUNDANCY IS RECORDED RATHER THAN REPAIRED, because the repair is the riskier
      change.** The same sweep finds three words taught both alone and as the feminine half of a noun
      pair — `menina` and `senhora` in A1, `corretora` in C1 — because `merges_with` folds a feminine
      onto its masculine's card only where the two entries point at each other, and these do not. That
      guard is what keeps a real noun that merely LOOKS like a feminine from being swallowed, and the
      shelf is full of them: `a cara` beside `caro, cara`, `a curva` beside `curvo, curva`, `a física`
      beside `físico, física`, `a corretora` ("brokerage") beside `o corretor, a corretora`
      ("corrector"). Loosening it to catch three notes in 4,395 would put all of those at risk of
      losing a card, and a swallowed word is a worse fault than a word taught twice — both cards being
      correct Portuguese under correct glosses.
  · **THE SOURCE ALSO LISTS A BRAZILIAN WORD ON ITS OWN, WHICH IS NOT THE SLASH CASE** (Aug 2026, B2).
    `xícara` arrives beside `chávena` and the drop swaps one word for another; `varal` and `coquetel`
    appear with no European alternative anywhere in the document — `estendal` and `cocktail` are not
    in it — so the drop **loses the concept** rather than swapping it. Deliberately not repaired by
    adding the European word, which would be the pipeline writing the syllabus instead of reading it.
    `o varal` also showed the two faults compounding: Wiktionary glosses it "shaft (of a cart)", the
    sense European Portuguese does keep, so the card was a Brazilian word under a meaning the
    inventory does not mean.
  · **THE 1990 ORTHOGRAPHIC REFORM IS WHY THE VARIETY RATIO CAN NEVER BE AUTOMATIC** (Aug 2026, B2),
    and it is a far stronger case than B1's four false positives. The European subtitle corpus largely
    predates the reform, so **the correct modern European spellings all look Brazilian**: `extrato`,
    `incorreto`, `ótica`, `indireta`, `exatidão`, `subjetivo`, `redator`, `direto`, `reto`, `adotivo`
    — ten of B2's twenty-eight flagged words are one family, and every one of them is right.
    **AND THE REFORM ALSO DEFEATS THE BETWEEN-LEVELS EXCLUSION**: `words_below` is a string match, so
    B1's `atual` does not exclude B2's `actual`, which shipped as a second card with the same meaning.
    Swept over all four decks there are exactly two pairs differing by a reform consonant, and **the
    other one is why this is a hand table and not a rule** — `facto` (A1) and `fato` (A2) look
    identical in shape and are two different words, a fact and a suit. Hence `SPELLING` in select.py,
    one entry, naming the level below that already teaches it.
  · **B1 IS THE LEVEL WHERE THE LOWER DECKS STOP BEING SPECTATORS, and that is what to expect of B2**
    (Aug 2026). A2 was a re-run and a table row; B1 needed no new stage either, and its whole cost was
    in the three places a level is built ON something else. **THE REFLEXIVES STOP BEING A HANDFUL**:
    its inventory names **56** `-se` strings against A2's 32, and `reflexives.py` glosses 31 of them by
    hand — the rest being inflected forms out of the Referencial's own example sentences (`pode-se`,
    `sente-se`, `formaram-se`) or the impersonal `se` (`como se escreve?`), which is a construction
    rather than a verb. **A missing gloss is SILENT**: the word is simply not offered, the cascade
    takes the next one, and the deck builds at exactly its target — so read the inventory rather than
    waiting for a warning, and note that a gloss added here is offered at EVERY level whose inventory
    names it, so check the lower candidate lists before writing one (none of B1's 31 is named at A1 or
    A2 — measured, not assumed). **AND A WORD WHOSE ENTRY IS A POINTER MAY POINT AT NOTHING**:
    `vários` reads "masculine plural of vário" and `vário` has no Wiktionary entry at all, so it is
    written into `AUTHORED`. That one is loud — `build_deck` refuses a card with no meaning — which is
    the shape to want and the reason that refusal exists.
  · **THE REFERENCIAL DESCRIBES PORTUGUESE, NOT ONLY EUROPEAN PORTUGUESE** (`BRAZILIAN` / `BR_RATIO` in
    select.py; Aug 2026, found by B1). Where the two varieties differ it writes both with a slash —
    `uma chávena/xícara de` — and `segments` splits on that slash, so the Brazilian half arrives as an
    ordinary candidate: B1 shipped a Brazilian teacup in a deck for an exam set in Lisbon until it was
    caught. **The slash cannot simply be read left-to-right**: measured over the whole document it
    holds **1,553 distinct pairs**, almost all of them antonyms and near-synonyms (`alto/baixo`,
    `abrir/fechar`, `achar/pensar`), so a rule taking the left-hand side would throw away a good word
    in nearly every case.
    **THE MEASUREMENT IS AUTOMATIC AND THE DROP IS BY HAND, and the arithmetic is why.** A word
    markedly commoner in the Brazilian frequency list than the European one is the obvious test and it
    separates the known pairs cleanly (xícara 19×, trem 18×, ônibus 31×, celular 25×, banheiro 26×
    against chávena 0.1×, comboio 0.2×, autocarro 0.1×). Run as an automatic DROP over the three
    finished word lists it takes **one right answer and four wrong ones** — `você`, which is ordinary
    European Portuguese and which this deck teaches on purpose; `hidratar`, absent from a small
    subtitle corpus rather than from Portugal; and `policial` and `conexão`, both standard here and
    merely commoner there. **A ratio measures how often Brazilians say a word, which is not the same
    question as whether the word is Brazilian.** So `select.py` prints the flagged words on every run
    and drops only what `BRAZILIAN` names, each entry naming the European word it stands for. The
    Brazilian list is now a normal source rather than `--variety-check`'s alone.
  · **A DISPLAY CHANGE BROKE THE EXCLUSION BETWEEN LEVELS, AND IT SHIPPED** (Aug 2026; `words_below`).
    Colouring the clitic took the hyphen out of the printed headword, and `words_below` read that
    field — so A1's `sentir-se` entered A2's exclusion set as `sentirse`, matched nothing A2 offered,
    and **the A2 deck re-taught `chamar-se`, `levantar-se` and `sentir-se`**, pushing three real A2
    nouns out. Both decks looked perfect: a duplicated word is a well-formed card. It reads
    `question` now — the plain lemma the whole pipeline is keyed on, which a rendering decision cannot
    move. **The lesson is the coupling rather than the field**: a deck FILE is an input to the next
    level, so anything that changes what is printed in it has to be checked against what reads it, and
    the check is to rebuild every level and diff — which is what found this.
  · **A PHRASE IS MATCHED ON WORD BOUNDARIES, NEVER AS A BARE SUBSTRING** (`PH_RX` in examples.py; Aug
    2026, found by B1's `poder com`). `if p in low` gave that phrase three sentences about `poder
    comprar` — real Portuguese, correctly translated, on a card of the right shape, about a different
    phrase. **What caught it is the BOLDER**, which does anchor on boundaries and so refused to mark a
    term it could not find, and `check-caple.js`'s assertion that a card with examples has a bolded
    word in them. The two now share one boundary class, so a phrase that is FOUND can be MARKED.
  · **A2 WAS A RE-RUN AND A TABLE ROW, WHICH IS WHAT THE PIPELINE WAS BUILT FOR** — the Referencial's
    six levels are siblings in one HTML file and every node carries `id="nivel<LEVEL>-…"`, so the
    parser was already level-scoped and the A2 inventory is a genuinely different and larger one
    (3,036 candidates against A1's 1,646, sharing 841). **What it did cost is a REFLEXIVE PASS**: the
    A2 inventory names thirty-two `-se` verbs where A1 names eleven, and since Wiktionary has a record
    for none of them the twenty worth teaching had to be glossed by hand in `reflexives.py`. Adding a
    level means reading its inventory for those; nothing warns, because a reflexive with no gloss is
    simply not offered and the deck builds cleanly at exactly 500 words without it.
  · **A REFLEXIVE'S BASE VERB IS FETCHED FOR ITS PARADIGM AND MUST NOT JOIN THE WORD LIST BY ITSELF.**
    `run.py` adds every reflexive's base to the Wiktionary lookup, and `select.py`'s pool is
    everything with a record — so once `reflexives.py` covered two levels at once, A2's twenty bases
    (`voltar`, `casar`, `tornar`, `divertir`, …) entered **A1's** pool and pushed nineteen real A1
    nouns out of its top 500, with A1 still building cleanly at exactly 500 words. The guard is one
    `if k in cands`: fetch a base only where this level's inventory names the reflexive.
  · **CAPLE PUBLISHES NO VOCABULARY LIST, and that was established rather than assumed** — its site
    carries exam specifications and nothing else, checked page by page, and the one PDF that looks like
    a syllabus is an image-only scan of a brochure. So the words come from the reference description
    **CAPLE's own Recursos page links to**: the Referencial Camões PLE, the Instituto Camões'
    level-by-level account of Portuguese. That is the DELE pipeline's relationship with the Cervantes
    *Plan curricular* with one difference worth having — **here the exam board points at the source
    rather than being it**, so the choice is the board's rather than this repo's. Only the inventory of
    WORDS is taken; the Referencial's own prose is not reproduced, exactly as the Goethe pipeline takes
    the Wortliste and leaves the Goethe-Institut's example sentences alone.
  · **THE DECK IS EUROPEAN PORTUGUESE, AND THAT REACHES INTO FOUR STAGES RATHER THAN SITTING IN THE
    DESCRIPTION.** CAPLE sets its exams on the European standard, so: the frequency ordering comes from
    the European half of the subtitle corpus (`pt_50k.txt`, **not** `pt_br_50k.txt`); Wiktionary's
    Brazil-tagged verb FORMS are dropped (5,464 of the 6,511 verbs carrying a table have one, so
    without it almost every -ar verb shows `falamos` beside `falámos` with nothing to say which is
    which); Brazil-tagged SENSES are outranked; and an example sentence carrying a Brazilian marker is
    rejected. **Nothing in either frequency file says which variety it is**, so `--variety-check`
    re-proves it on fourteen shibboleths (comboio/trem, autocarro/ónibus, telemóvel/celular…) and exits
    non-zero if they come out the wrong way round — a measurement that can be re-run rather than a
    comment that can rot.
  · **THE SENSE RANKING IS THE BUG THIS DECK IS MOST LIKELY TO GET WRONG AGAIN.** `o comboio` shipped
    for an hour glossed **"convoy"**: Wiktionary's "train" sense is tagged `Portugal` *and* `Africa`,
    and any ranking that merely penalises Brazil scores it worse than the untagged "convoy" — so a
    European tag has to score NEGATIVELY, and only the best-ranked senses survive. Every count was
    healthy throughout and the card read perfectly. `check-caple.js` pins five of these glosses.
  · **WHERE THE PRONOUN GOES IS FOUR RULES, NOT ONE, AND A WRONG ONE RENDERS AS A PERFECTLY REGULAR
    TABLE.** European Portuguese's default is enclisis (`chamo-me`, where Brazil writes `me chamo`),
    with the first person plural dropping its -s before `-nos` (`chamamo-nos`) — but the **conjuntivo**
    is subordinate by nature and takes proclisis (`que eu me chame`), a **negative imperative** takes
    proclisis after `não` (`não te chames`), and the **future and conditional take MESOCLISIS**, the
    pronoun going INSIDE the verb between its stem and its ending: `chamar-me-ei`, `chamar-nos-emos`,
    `chamar-me-ia`. That last one shipped as ordinary enclisis for a session — `chamarei-me`, which is
    not Portuguese at all — on all eleven reflexives, twelve rows apiece, with the table the right
    shape and the right length throughout. The split is found by **stripping the ending** rather than
    by assuming the stem is the infinitive (the irregular futures are irregular in the stem: `dizer` →
    `direi` → `dir-me-á`), the ending list is **sorted by length** (the conditional's `íeis` must beat
    the future's `eis`, or `chamaríeis` comes out `chamarí-vos-eis`), and a form matching no ending is
    reported at the end of the run rather than falling back silently.
  · **…AND THE PRONOUN IS PRINTED AS A COLOUR RATHER THAN WITH A HYPHEN** (`marked` / `clitic_html` /
    `CL_A` / `.uc-cl`; Aug 2026, on request). The card shows `sintome`, `sentirmeei` and `me sinta`
    with the pronoun in indigo, where standard orthography writes `sinto-me`, `sentir-me-ei` and
    `me sinta`. **The trade is real and is recorded rather than smoothed over**: the hyphen is not
    decoration a learner can do without, it is how the form is SPELLED, so the card teaches the right
    word in the wrong orthography — and the example sentences under the table are Tatoeba's own
    Portuguese and keep their hyphens, so a reflexive card shows both spellings a few lines apart.
    What it buys is that the three parts of `sentir·me·ei` read as three parts at a glance. The deck's
    own description says which way round it is, so a learner meeting `chamo-me` in a book is not left
    thinking one of the two is a misprint.
    **THE COLOUR IS VERMILION**, where it was indigo for a day (Aug 2026, on request): it is the
    colour the mood headings and the example bolding already use, so the card says one thing in one
    colour, and the two cannot be confused — a mood heading is 10px letterspaced capitals on a line of
    its own and the pronoun is two letters inside a word.
    **THE MARK IS A SENTINEL, NOT A TAG**, because every one of these strings goes through `esc()` on
    its way onto the card and a `<span>` built in the builder would arrive as visible angle brackets:
    two control characters no source text can contain survive the escape and become the span after it.
    It is a **weight as well as a colour** — with the hyphen gone, a `chamome` whose mark did not land
    is simply a misspelling, so the one channel that can fail for a reader (high contrast, bright sun,
    these two hues being one colour to them) is not the only one. And it reaches the **headword** too:
    `chamar-se` at the top of the card over `chamome` in the table would show both spellings with
    nothing to say which is the rule. The stored key keeps its hyphen — this is the printed form only,
    and the word is still looked up, spoken and matched as `chamar-se`.
  · **A BRACKET CAN CONTAIN A BRACKET, AND EVERY CUT CAN LAND INSIDE ONE** (`strip_parens` /
    `split_top` / `debracket`). Three faults, one shape, and all three were found by LOOKING at a
    rendered card rather than by any count. A gloss is split on `;` and `,` to make the meaning lines,
    and a separator INSIDE a parenthesis is not a separator — `to feel (well, ill, tired)` came out as
    three lines reading `to feel (well`, `ill`, `tired)`. A parenthetical is stripped to find a
    definition's head, and `\([^)]*\)` ends at the FIRST `)` — which on `our (… of us, excluding the
    person(s) being addressed)` is the one inside `person(s)`, leaving the gloss **`our being
    addressed`**: not a shortened meaning but a different and wrong one that reads as ordinary English.
    And the 92-character cut simply stops, leaving a bracket that never closes. So the splitting and
    the stripping both count depth, and whatever is still half-open at the end is dropped whole — a
    parenthetical is a qualifier, so losing it entirely is honest where losing half of it is not.
    Every count stayed healthy throughout: the glosses were non-empty strings of the right shape on
    cards of the right length.
  · **WIKTIONARY HAS NO RECORD FOR ANY PORTUGUESE REFLEXIVE**, so `reflexives.py` carries all
    thirty-one by hand — eleven attested in the A1 Referencial and twenty in the A2 one — and the
    paradigm is built from the base verb, which is why `run.py` adds a reflexive's base to the lookup
    set before the extraction runs. **Four of A2's thirty-two are deliberately absent and the file
    says why**: `ir-se` and `vir-se` are named only inside `ir-se/vir-se embora`, where the unit is
    the phrase, and `ver-se` and `dizer-se` mean what their base verbs mean with a pronoun on them —
    which is the test, and the reason the table is not simply every `-se` string in the source.
  · **`se` IS BOTH THE THIRD-PERSON CLITIC AND THE CONJUNCTION `IF`, AND NOTHING STRUCTURAL TELLS THEM
    APART.** `KEYWORDS` in `reflexives.py` is what does — the English translation has to carry a word
    the reflexive means — and it existed unused for a session while the docstring claimed
    `examples.py` applied it. Wired in, it replaced a `sentir-se` example that was actually
    `sentar-se` ("Por favor sente-se" / "Please sit") and an `apresentar-se` one that meant
    "volunteered". **Proclisis is also ADJACENT** in European Portuguese, so the two-token window that
    let `Me deixa voltar a dormir` count as `voltar-se` is now one. The cost is honest and stated in
    each deck's own description: A2 has eight words the corpus cannot illustrate at all, where a
    looser rule gave them wrong sentences.
  · **A PORTUGUESE INFINITIVE IS VERY OFTEN A NOUN**, so a verb record alone is not grounds for
    printing a paradigm: `o jantar` is dinner and `jantar` is to dine, `a colher` a spoon and `colher`
    to harvest, `o colar` a necklace and `colar` to glue. Four cards printed a noun's headword and
    gloss over a conjugation of the other word — `o prazer` "pleasure" over the defective paradigm of
    `prazer` "to please" — and the table was correct in every case, simply about something the card
    does not claim to teach. The paradigm is now gated on the card's PRIMARY part of speech, and those
    four gained their plural line instead.
  · **A PARENTHESIS IN THE INVENTORY MEANS FOUR DIFFERENT THINGS** (`unparen`): `segunda(-feira)` is one
    word with an optional tail, `irmã(o)` is TWO words, `pequeno(a)` is a feminine ending, and a
    trailing gloss is neither — so both readings are returned and the junk (`pequenoa`) dies harmlessly
    at the Wiktionary lookup rather than being guessed at.
  · **THE CORPUS DOES NOT GET A VOTE ON THE WORD LIST.** One word (`arrendar`) has no Tatoeba sentence
    at all and is kept: the syllabus is set by the inventory and by frequency, and dropping a word
    because the corpus cannot illustrate it would be letting the corpus set the syllabus — the DELE
    pipeline's own finding, where that rule fired on 117 of 2,000 B2 words. The count is stated in the
    deck's description instead.
  · **ITS HONEST LIMITATION IS TATOEBA, and the description says so rather than implying otherwise**:
    the corpus's Portuguese is overwhelmingly Brazilian (measured at about 10:1), so the filter rejects
    16,732 sentences outright and what remains is mostly variety-NEUTRAL rather than positively
    European. That is a limit of the corpus and not something a filter can repair.
  · **`node .claude/caple/check-caple.js [a1|a2|b1|b2|c1|c2|phr]` is the browser half**, and it exists because
    `check-decks.js` skips the card-level checks for a deck that is not Mandarin — so everything
    Portuguese this deck is FOR is unchecked by anything until there. It splits its assertions on
    purpose: what is EUROPEAN is checked in the FILE, exactly, over every card (a wrong clitic on one
    verb in eleven would never be reached by a walk through a session), and what is RENDERED is checked
    in the BROWSER. **Its Brazilian sweep is written by hand and is deliberately not the generator's**
    — re-using `examples.py`'s pattern would pass by construction on whatever it let through — and it
    runs over the PORTUGUESE half of each example only, since the English beside it says "next time"
    and `time` is also the Brazilian word for a football team. It writes screenshots to look at.
    **Its probes are PER LEVEL** (`PROBE`), because the assertions are about European Portuguese and
    have to be asked about a word the level teaches — `o comboio` is in A1 and in no other deck — and
    the expected verb forms are written out rather than derived from the infinitive, since a
    derivation here could share a bug with `build_deck.py` and the two would then be wrong together.
    A level's row also states what only that level can lose: B1 carries a `minReflexives` floor,
    since a gloss missing from `reflexives.py` drops a word in silence, and a `noBrazilian` list,
    since the inventory's `chávena/xícara` pairs arrive split; B2 a `plainArticle` list, since its
    preposition-led locutions are the ones the headword used to colour; **C1's reflexive is an
    -ER verb and the shelf's only already-pronominal table**, so its row is what pins the endings
    every other level's -ar probe cannot reach and what would catch the re-marking and our own rules
    drifting apart; and **C2's is an IRREGULAR -er verb** (`abster`, which conjugates like `ter`), so
    its 2pl forms end `-des` and `-stes` and are the sharpest case of the rule below.
    **EVERY LEVEL NOW PINS THE `-vos` ENCLISIS, which nothing did until C1 corrected it** — a
    `presVos` and a `pretVos` row apiece, because the present is the common case and the preterite is
    where dropping the `-s` produced the second person SINGULAR verb under a plural pronoun, a real
    Portuguese word in the wrong cell. **A rule corrected is a rule to add a probe for**; that one had
    been wrong on every reflexive on the shelf and no assertion was looking at it.
    A probe verb also has to be one THAT level teaches, which is not automatic once a level is built
    on the ones below: C2's preterite probe was written as `preparar` and C2 has no such card,
    `preparar` being an A1 word.
    **Each expected form is asserted TWICE, as text and as HTML** (`clText` / `clHtml`, the clitic
    written between pipes): the text says WHERE the pronoun sits and the HTML says that it is actually
    marked up, and with the hyphen gone the markup is the only thing separating the pronoun from the
    letters around it — so a text-only assertion passes on `chamarmeei` with the span dropped, which
    on the page is a misspelling. The text side is **space-blind**, since `txt` turns every tag into a
    space and a pronoun in a span of its own reads `chamar se ei` however tightly the card sets it.
    The browser half then asserts the colour LANDS — a deck's CSS is scoped per (deck, type) at
    install, so a rule that stopped matching would leave every reflexive flat and correct-looking —
    and that a reflexive is recognised by **having coloured pronouns** rather than by a headword
    ending `-se`, which is exactly the hyphen this change removed: read the old way, no reflexive is
    ever found, the screenshot is never taken and the walk reports nothing wrong.
    **A marker in its Brazilian sweep must be a word Portugal does not use in that sense at all**:
    `calçada` and `grama` were in the list and came out, a *calçada* being an ordinary paved street
    in Portugal and a *grama* a gram.
    **THE `phr` ROW ASKS A DIFFERENT SET OF QUESTIONS, and half the file is SKIPPED there rather than
    loosened** — there is no article to colour, no gendered pair and no reflexive lemma, and the
    European question is about whole idioms rather than about lexis. Three things it pins that nothing
    else can: **an ordinary compound is NOT in the deck** (`cartão de crédito`, `fim de semana`), which
    is the whole of what the idiomatic test buys and which no count can see — a filter that stopped
    firing leaves a deck of perfectly good cards that is no longer a deck of idioms; **the commonest
    expressions come first**, the corpus ordering being the only one there is and its loss leaving a
    deck that is still complete and still well formed; and **no expression is given an article**, which
    is the stronger form of the word decks' own colour assertion. Two of its skips are ACTIVE rather
    than passive: the three mesoclisis sweeps run over an empty list there and would report a clean
    pass on nothing, so they are gated off — **three ticks proving nothing is worse than three missing
    lines** — and the impersonal-verb list becomes a printed COUNT, since a verb phrase nobody can be
    told to do (`bater as botas`) is the rule rather than the exception there.
  Re-running it must reproduce the shipped decks byte for byte, **and ALL SIX levels plus `phr` have to
  be re-run, IN ORDER**: the stages are shared, so a change made for C2 reaches A1, and a level is built
  on the shipped decks BELOW it, so a stale file lower down is a higher level quietly teaching the
  same word twice. **Build them under two different `PYTHONHASHSEED` values** rather than twice the
  ordinary way — that is what caught the set-iteration non-determinism above, which two default runs
  would have found only by luck. This is the check to make after any edit, since every fault above is
  silent, and it is not a formality: it has now caught a level re-teaching three of the level below,
  three levels' worth of builds that could not be reproduced at all, and — adding C1 — **108 cards
  across the four decks already shipped**, corrected by two shared-stage fixes that C1 found and that
  nothing in C1's own deck would have shown. **It reports the other answer just as usefully**: C2
  touched no shared stage and all five earlier decks came back byte-identical, which is how a level
  is known to have cost the ones below it nothing. **Adding the phrases deck reported it a third way**:
  it changed three shared stages and the six word decks still came back byte-identical, because each
  change was either gated on `PHRASES` or provably inert (see the `POS_NAME` note above) — which is the
  cheaper half of the discipline and the half to reach for whenever two readings could ever collide.
  Not part of the site.
- `.claude/dele/` — the generator behind the four `decks/DELE-<level>-Spanish.folio-deck.json` files
  (A1, A2, B1, B2), community decks rather than site content.
  **THREE MORE SPANISH DECKS SHIP THAT IT DOES NOT MAKE** (Aug 2026, on the request to add the missing
  Spanish decks): **`DELE-C1-Spanish`** (1,998 words), **`DELE-C2-Spanish`** (2,000) and
  **`Spanish-Phrases`** (400 expressions), supplied ready-made. They wear this pipeline's own shape — the
  `es-to-en` / `en-to-es` pair, its two subdecks, its subtitle wording — and `dele_level.py`'s `DECK_FILES`,
  `BELOW` and `TARGET` name **a1, a2, b1 and b2 and nothing else**, so nothing here can rebuild them and a
  C1 row added to those tables would land on `DELE-C1-Spanish.folio-deck.json` and overwrite one. **Look at
  the file names in `decks/` before adding a level** — the Goethe entry records the same trap on the German
  shelf, where a supplied B1 already sits on the path `--level b1` writes to.
  **AND THE THREE FIGURES A DECK STATES ARE THREE DIFFERENT THINGS HERE**: this shape is TWO NOTES PER WORD,
  one per direction, so C1's "1,998 more words" is 3,996 notes and 3,996 cards, where the Goethe shape's one
  note carries two templates and its 3,000 words are 3,000 notes and 6,000 cards. `lang-decks.js` counts
  CARDS on both, which is what makes the two comparable; a count of rows is half a deck on one shelf and a
  whole one on the other.
  `python3 .claude/dele/run.py [--level a2|b1|b2] [--no-fetch]`. Seven stages, run by `run.py`, caching
  its corpora in `.claude/dele-cache/` (~1.2 GB, gitignored). **It is PYTHON where every other helper here
  is Node** — a deliberate exception, committed on request so a further level is a re-run against the next
  column rather than a rebuild, which is exactly what B1 and B2 turned out to be.
  **ONE LEVEL PER RUN** (`dele_level` reads the level once, at import), and **a level is taught on top of
  the ones below it**: a level excludes every word the SHIPPED decks below it contain, read out of the
  deck files rather than a working file, so they cannot drift and a rebuilt level cannot start teaching a
  word a lower one already covers — **both halves of a paired headword**, so A2 cannot re-teach a feminine
  A1 already shows (that exclusion is what took four feminine adjectives out of A2 and let four new words
  in). The intermediates are level-suffixed so all four can sit in one cache. **A level is four table
  rows in `dele_level`** — its title, deck id and file, which levels are below it, how many words it
  teaches (`TARGET`: 500, 500, 1,000, 2,000) and which pair of inventory pages its column is printed on
  (`PAGES`: A1 and A2 share a page, B1 and B2 share another) — plus a supplement list and a batch of
  reflexives. **`select.py` REFUSES a level whose pool is short of its TARGET**, since a short list is the
  one failure that stage can have that looks like success: the deck builds, every card is well formed, and
  the level quietly teaches fewer words than it says it does.
  **THE CARDS SHIP IN FREQUENCY ORDER, AND THAT IS A SEPARATE QUESTION FROM WHICH WORDS ARE CHOSEN**
  (Aug 2026, on request). `select.py`'s cascade decides WHICH words a level teaches — it exists to stop
  the closed classes and the verbs competing with nouns on raw frequency, a 500-word A1 list without `yo`
  and `tú` not being an A1 list — and it deliberately does not rank the result, which left `uno` as A1's
  first card and `de`, `que` and `no` several hundred cards in. The chosen list is now re-sorted for
  OUTPUT, most frequent first, and **nothing about the selection moves**: the same 500/500/1,000/2,000
  words ship, so the exclusion sets the higher levels are built against are untouched and a rebuilt level
  cannot come out teaching something else. Two classes of word need repairing, because `es_50k.txt` counts
  SURFACE FORMS rather than lemmas. A **reflexive** takes its BASE VERB's rank (`llamarse` is 14,131st
  where `llamar` is 580th, and the paradigm the card teaches is the base's anyway). And **a PHRASE cannot
  appear in a segmented list at all, where the obvious fallback is wrong in a way worth recording**: giving
  `por consiguiente` the rank of its RAREST COMPONENT is a true ceiling on how often it can be said and a
  hopeless estimate of it, since a phrase built out of very common words gets a very low ceiling — tried,
  and `si bien`, `con todo`, `es más` and `ahora bien` all led the B2 deck ahead of `razón` and `problema`.
  So a phrase is COUNTED in the Tatoeba corpus this pipeline already downloads for its examples, and that
  count is calibrated onto the subtitle list's own scale through the level's single words, which carry both
  a count and a rank; it puts `es más` 307th and `en la medida en que` last, which is the right shape.
  **What is NOT done is summing a lemma's inflected forms**, which looks like the rigorous answer and is
  worse: a paradigm routinely holds a form that is common for another reason entirely, and `comer` would
  inherit the 1.6 million hits of `como` — overwhelmingly "as, like" and not "I eat" — and lead the deck.
  The cost of the change is that the thematic runs the cascade produced are now scattered, the numbers and
  the days no longer arriving together; that is what ordering by frequency MEANS, and the deck's own
  description says which order it is in.
  **`combine.py` is the ONE-FILE version of all four** (`python3 .claude/dele/combine.py [out.json]`), on
  request: 7,986 cards under a fresh deck id `deleall`, whose subdecks **NEST** — a level, with its two
  directions inside it (`A1`, then `A1::Spanish → English` and `A1::English → Spanish`) — so the levels
  stay separable inside one file rather than being poured together. Nesting is the `::` path app.js grew
  for this in Aug 2026 (see the SUBDECKS bullet under "How the app is wired"); it was `A1 · Spanish →
  English` as eight flat subdecks for a day. Three things it has to get right and two of them are silent.
  **A CARD ID MUST CARRY THE DECK** — every card is renumbered `u_deleall_N`, since a deck FILE import only
  mints fresh ids when the DECK id already exists, so reusing `u_delea1_1` would collide with an installed
  A1 in the shared `UCARDS` store and study the wrong card. **THE TYPE BLOCK IS ASSERTED IDENTICAL** across
  the four rather than assumed, a level rebuilt against a changed template otherwise having its cards
  rendered silently by another level's. And **THE WORD COUNT IS NOT DERIVABLE FROM THE FILES**: a pair card
  teaches two headwords where both were selected and one where only the masculine was, and the shipped
  files do not record which, so the 4,000 comes from `TARGET` and only the CARD counts are counted. It reads
  no clock (the timestamps come from the newest source), so the same inputs write the same bytes.
  **The combined file is deliberately NOT committed** — it duplicates ~27 MB already in the repo and this
  regenerates it. **Combining EVERY deck in `decks/` IS possible and is `.claude/combine-decks.py`** — this
  line said it was not, on the caps as they then stood, and **a legitimate deck that will not fit is what
  moves a cap** (it has moved three of them since, twice over this very file),
  which is what happened. See that file's own bullet below. **Re-measure rather than quoting any of it** —
  the same line has said 19,819 notes and 50.4 MB, which was true of nine decks and is now six short.
  The stage headers carry what the build found, and ten of those findings are the ones to read before
  touching it.
  **THE EXAMPLE CORPUS DOES NOT GET A VOTE ON WHICH WORDS A LEVEL TEACHES**, and the rule that said
  otherwise survived three levels because it was firing on five words in a thousand. A word Tatoeba could
  not illustrate used to be swapped for the next word in the ranked order — which comes from the RARE TAIL
  by construction — and at B2 it fired on **117 of 2,000**: it proposed dropping `matizar`, `constatar`,
  `vincular` and `incidir`, the argumentative verbs the level is examined on, along with seven of the
  connectives it is built around (`por consiguiente`, `en conclusión`, `en la medida en que`), and putting
  `sopera`, `gomina` and `colorete` in their place. The loop is gone; a word the corpus cannot illustrate
  ships without sentences and the deck's own description states how many do. **Removing it changed B1 by
  five words**, restoring `asesino`, `delta`, `bufete`, `nublarse` and `pintado`.
  **ONE ITEM PER LINE WHERE AN ITEM MAY BE A PHRASE, and this is the fault B1 introduced and caught in one
  run.** Every supplement list is a triple-quoted block ending in `.split()`, which is right for single
  words and silently tears a phrase into its pieces: B1's discourse layer is half phrases (`sin embargo`,
  `a pesar de`, `de vez en cuando`), and `o sea` became `o` and `sea` — where `sea` is the present
  subjunctive of `ser`, which the closed-class escape hatch then waved past the inflection test, so the
  deck grew a card for a verb form with no meaning on it. It was loud rather than quiet only because
  `build_deck` refuses to write a card with no meaning. `_lines()` keeps the phrases whole; the rest of
  the pipeline already handled them (`PHRASES` in `examples.py` matches them as substrings), so the 44
  that survive are the best cards in the deck.
  **A PAST PARTICIPLE IS FILED BEFORE THE NOUN IT SHARES ITS SPELLING WITH** (`FORCE_POS`), which is a
  handful of words at A1 and a whole class once the vocabulary gets past A2: `hecho` came out as "done,
  completed" rather than "the fact", `sentido` as "deeply felt", `vestido` as "dressed" rather than "a
  dress", `atentado` as "moderate, prudent" rather than "an attack". Each is a well-formed adjective card
  carrying a real sense of the word and the wrong one for a learner. **The test cannot be mechanical** —
  `preparado`, `ocupado`, `perdido`, `mojado` and thirty more of the same shape genuinely want the
  adjective — so the thirty that do not are named, and forcing the noun IMPROVES the gendered pairing for
  free (`el ciudadano, la ciudadana`, `el aficionado, la aficionada`). Watch for the tag as well as the
  order: `hecho`'s "fact" sense is tagged **archaic** in Wiktionary, which is wrong and which the sense
  filter obeys, so that one is authored.
  **A CARD ID MUST CARRY ITS DECK, and this is the loudest silent fault the generator has had** (Aug 2026).
  Both levels wrote `u_delea1_N`, because the id was a literal in a file first written for A1 — and a deck
  FILE import only mints fresh card ids when the DECK id already exists, which `delea2` does not. So
  installing both decks put two different cards under one key in the shared `UCARDS` store, and **studying
  the A1 subdeck dealt A2's cards — all twenty-five of a twenty-five-card probe.** Both decks were on the
  shelf, both had their full card counts on disk, and nothing threw. The check to run after any change to
  the emitter is to import BOTH levels into one device and study the lower one.
  **A MALE/FEMALE PAIR IS ONE WORD WEARING TWO ENDINGS, AND NOTHING ABOUT IT MAY BE DERIVED**
  (`fem_forms` / `merges_with` / `pair_for` in `build_deck.py`). The naive rule — swap a final `-o` for
  `-a`, add `-a` to a consonant — gets `señor` wrong ("señoa") and every suppletive pair wrong
  (padre/madre, rey/reina, caballo/yegua). It does not have to be derived at all: kaikki has already
  expanded Wiktionary's own template arguments into the record's `forms`, tagged `['feminine']` and
  `['feminine','plural']`, so the four costumes the argument wears — an explicit word, `+` for the default
  derivation, `#` for the headword itself, `#a` for the headword plus `-a` — are resolved before this code
  sees them. **Read the record the CARD teaches, not the first one carrying a feminine**: `mano` has a
  masculine record meaning "bro" whose feminine is "mana", and the card is about the hand. And **a real
  feminine FORM is very often a different WORD as well**, which is what decides whether the two share a
  card: `caro`/`cara` (dear/face), `medio`/`media` (half/stocking), `político`/`política` and
  `chino`/`china` are all genuine feminines and all separately nouns the deck teaches. Two signals
  separate them and either will do — the feminine's own entry points back (`señora` carries `señor` as its
  masculine) or the masculine names the feminine outright rather than deriving it (`rey` names `reina`) —
  and every false pair is a bare `+` with no back-link. Measured: 63 pairs in A1 and 70 in A2, of which 4
  and 1 fold two cards into one.
  **A LETTER HAS A NOUN ENTRY, AND WIKTIONARY FILES IT FIRST** (`FORCE_POS`). `de`, `te` and `ese` — the
  preposition, the object pronoun and the demonstrative — came out as `la de`, `la te` and `la ese`,
  glossed "the name of the Latin script letter D/d", each a perfectly well-formed noun card with an
  article and a plural, which is why nothing downstream complained.
  **A WORD THAT IS ANOTHER WORD WEARING AN ENDING IS NOT A CARD, AND THE TEST FOR IT IS THE SUBTLEST
  THING HERE** (`is_inflection` in `select.py`). `flores`, `roja`, `clases` and `mala` are the plural or
  the feminine of words already taught, and they get past the lemma test because Wiktionary records some
  marginal homonym for each — `roja` is "the Chile national football team" and `mala` "a suitcase", which
  is what the card would have shown. But the obvious test, *some record calls it an inflection*, is
  **wrong in exactly the way this file already warns about**: nearly every Spanish noun collides with a
  verb form, so it read `casa` as the third person of `casar` and **threw `la casa`, `el libro` and `el
  agua` out of A1** while letting `el jersey` in. A word goes only when its entry OPENS by declaring
  itself an inflection of a word the decks actually teach, or when it declares itself one anywhere and
  has no showable meaning of its own at all. **A derivation is not an inflection**: `peor` is the
  comparative of `malo`, `quizás` an alternative form of `quizá` and `moto` a clipping of `motocicleta`,
  and none of the three has a single clean sense in Wiktionary, so a test on usable senses would have
  kept `roja` and thrown out `peor`.
  **A CROSS-REFERENCE IS NOT A TRANSLATION, and it arrives three ways**: as a `form_of` field, as a tag,
  and — the one that got through — as plain prose inside the gloss (`niña` is "girl, female equivalent of
  niño", `santa` is "saintess; female equivalent of santo"). All three are stripped, the meaning is
  recovered from the tail of the gloss or from the entry it points at, and `build_deck` now REFUSES to
  write a card with no meaning at all rather than shipping a blank one. **A CONJUGATION TABLE CANNOT BE A `<table>`**:
  `SANITIZE_TAGS` has no `table`/`tr`/`td`, and an unknown tag is UNWRAPPED rather than dropped, so the whole
  paradigm arrives as one run-on line of words — it is a CSS grid of divs. **A REFLEXIVE'S FORMS ARE ITS BASE
  VERB'S**, so matching a sentence on the form alone teaches the wrong word (every `llamarse` example came
  back as `llamar` "to phone"), and requiring the pronoun merely to be NEARBY is not enough either, since
  "él me llamará por teléfono" is a dative object of a third-person verb — the clitic has to AGREE.
  **NEARLY EVERY SPANISH NOUN COLLIDES WITH SOME VERB FORM** (`libro` is a book and the 1sg of `librar`,
  `vino` is wine and the preterite of `venir`), so a word is only an inflected form when NOT ONE of its
  records carries a sense of its own; the naive test threw out `hablar` and `estar` while `libro` survived on
  kaikki's key order alone. And **TATOEBA IS A GENERAL CORPUS**, which a deck for exam candidates cannot deal
  out unfiltered — `millón` first came back offering "Would you have sex with me for a million dollars?".
  **A STAGE RUN BY HAND CAN SHIP A DECK NO CLEAN RUN REPRODUCES** (found Aug 2026, reordering the four).
  Rebuilding B2 swapped one word — `ilusionado, ilusionada` out, `flexible` in — and the reorder was
  innocent: checking the OLD `select.py` out and running it against the same cache produced the swap too,
  so the shipped B2 was built on a cache that a full `run.py` no longer produces. The cause is that
  `run.py` refreshes `lookup` and `wikt` on every run while a stage invoked directly does not, and B2's
  last stages were driven by hand while its `AUTHORED` entry was being sorted out. It is one word out of
  2,000, both of them B2-appropriate adjectives, and the fix is to keep the clean run's answer rather than
  pin the deck to a cache nobody can reconstruct. **Drive a rebuild through `run.py`, not through the
  stage you are debugging** — and note the check below could not have caught this by itself, since it
  compares a rebuild against a shipped file that was already unreproducible.
  **Re-running it must reproduce the shipped deck byte for byte**; that is the check to make after any edit,
  since every fault above is silent. Not part of the site.
- `.claude/goethe/` — the generator behind the Goethe decks: `decks/Goethe-A1-German.folio-deck.json`
  (**785 notes / 1,570 cards**), an **A2** built the same way (**1,072 notes / 2,144 cards**, the one deck
  on the shelf DELIBERATELY NOT COMMITTED — see the last sub-bullet) and a **B1**.
  **THE SHIPPED B1 IS NOT THIS GENERATOR'S OUTPUT AND `run.py --level b1` WOULD OVERWRITE IT** (Aug 2026,
  on the request to add the missing German decks). This entry said 2,525 notes / 5,050 cards, which is what
  the pipeline builds; the file in `decks/` is **1,786 notes / 3,572 cards**, supplied ready-made, and it
  lands on the very path `DECK_FILES['b1']` names. So the two claims had been contradicting each other on
  disk with nothing to say so — the catalogue reads whatever is there and reports it correctly either way.
  **Check a deck file's own counts against this entry before believing either**, and where they differ say
  which of the two the reader is actually being offered.
  **AND FOUR MORE GERMAN DECKS SHIP THAT THIS GENERATOR DOES NOT MAKE** (same request):
  `German-B2-Vocabulary` (3,000 notes / 6,000 cards), `German-C1-Vocabulary` (3,000 / 6,000),
  `German-C2-Vocabulary` (3,000 / 6,000) and `German-Phrases-Expressions` (976 / 1,952). They wear this
  pipeline's own shape — the `goethe` card type, its two templates, its subtitle wording and its `#8A5A2B`
  — and `goethe_level.py`'s `TITLES` / `DECK_IDS` / `DECK_FILES` name **a1, a2 and b1 and nothing else**,
  so nothing here can rebuild them and they are not named after the exam board, being levels the
  Goethe-Institut publishes no Wortliste for. Adding a B2 row to those tables would put a fifth German
  deck beside `German-B2-Vocabulary` rather than replacing it; **look at the file names in `decks/` before
  adding a level.**
  `python3 .claude/goethe/run.py [--level a1|a2|b1] [--no-fetch]`. Seven stages, caching its corpora and the
  Goethe-Institut's own PDFs in `.claude/goethe-cache/` (~1.3 GB, gitignored). PYTHON, like `.claude/dele/`
  and unlike every other helper here, and for the same reason: a further level is a re-run against the next
  Wortliste rather than a rebuild. **ONE LEVEL PER RUN** (`goethe_level` reads the level once, at import),
  and a level is taught on top of the ones below it, read out of the SHIPPED deck files so they cannot
  drift — the DELE arrangement exactly (A2's list REPEATS 330 A1 words and B1 repeats 571 of both, which is
  what `BELOW` removes). B2 has a published Wortliste of its own and would take a row in each of that
  module's tables plus a `BELOW` entry.
  **THE SECOND LEVEL IS WHERE THE PIPELINE'S ASSUMPTIONS WERE TESTED, and almost every one of them was a
  fact about A1's TYPESETTING rather than about German.** Six things it settled are worth carrying.
  · **THE PAGE GEOMETRY IS A TABLE, NOT A CONSTANT.** A1 is ONE pair of columns and A2 is TWO pairs side by
    side, so a page reads down the left pair and then down the right; a reader written for one finds half
    of the other. `HEAD_COLUMNS` / `LIST_PAGES` / `SUB_INDENT` / `GROUP_PAGES` / `FURNITURE` are per level,
    each measured off that PDF's own x-histogram. A1 also indents "ableitbare Nebeneinträge" and A2 has no
    such level at all, which is why `SUB_INDENT` may be None.
  · **A RULE THAT CANNOT BE MADE GENERAL IS GATED PER LEVEL RATHER THAN MADE CLEVERER** (`BRACKET_CONT`).
    In A2, eighteen lines OPENING on a bracket are continuations of the line above (`(Sg.)`, `(sich),`) and
    four are headwords; in A1 every one is a headword — the eight `(sich) anziehen` reflexives and
    `(Kredit)-Karte`. Two attempts at a single predicate each swallowed one of A1's shapes, so the rule is
    declared per list and is **inert on A1 by construction rather than by a re-run**.
  · **THE REFLEXIVE MARKER SITS ON EITHER SIDE OF THE VERB, and which side is a fact about the LIST.** A1
    writes `(sich) anziehen` and A2 writes `anziehen (sich)`, for the same word — nine prefixed against
    twenty-five suffixed. A prefix-only rule leaves twenty-five A2 verbs looked up under a lemma with
    `(sich)` on the end, which Wiktionary has not got; nothing throws and the cards come out bare.
  · **A2 PRINTS A VERB'S PRINCIPAL PARTS AND AN ADJECTIVE'S COMPARISON UNDER THE HEADWORD** and A1 does
    not (`besichtigen, besichtigt, hat besichtigt`; `gut, besser, am besten`), which is what most of
    `split_entry`'s new work is for — the deck builds both from Wiktionary, so what is wanted off the page
    is the first part. Two tests, because a paradigm is not always three parts: a part opening on an
    auxiliary, or more than one comma on an entry that is not a noun.
  · **THE ONE FAULT THAT COST REAL WORK WAS `der/das`** (`ART` in parse_goethe.py). A slash between two
    articles is ONE noun with two genders; the pair rule matches a slash before an article, so `der/das
    Blog` was split into halves and shipped as a card headed **`der`** with `Blog` filed as its partner.
    Three A2 entries. Inventoried over both lists rather than guessed.
  · **AND THE A2 WORK FOUND SIXTEEN FAULTY GENDER LABELS IN THE SHIPPED A1 DECK** — the argument for
    running a change across the SIBLING that the Library's importer already records. `der Erwachsene` was
    labelled "noun, feminine" (Wiktionary files the nominalised adjectives under the feminine) and twelve
    cards carried a raw two-letter code, "noun, mn". On a deck whose whole point is that the article's
    colour teaches the gender, a label contradicting the article teaches the opposite of what it shows.
    **THE LABEL NOW FOLLOWS THE ARTICLE THE CARD PRINTS** and Wiktionary is the fallback, and `by_article`
    narrows a merged homograph by the list's own article — which also stopped `der See` and `die See`
    rendering as the same card twice, both glossed "lake, sea, ocean", and took "momentum" off `der Moment`
    and "twig" off `der Reis` (those are `das Moment` and `das Reis`). 26 A1 notes changed, every one a
    correction. Two guards keep it honest: a record tagged with TWO genders answers to both (testing only
    its first tag cost `das Viertel` the meaning "quarter"), and the narrowed set must still carry a gloss
    (narrowing on gender alone left eight cards with no meaning at all).
  · **UNLIKE THE DELE, THERE IS NOTHING TO SELECT: the exam board publishes the word list, and the deck
    teaches it.** So `select.py` does no choosing — it settles which Wiktionary LEMMA each headword is and
    orders the result by frequency, where the Spanish pipeline's whole difficulty is deciding which 500
    words a level should hold. What replaces that difficulty is reading a two-column PDF (pdfplumber word
    x-coordinates, `COLUMN_X = 236` measured off the whole histogram rather than guessed — a threshold of
    230 silently truncated `die Sehenswürdigkeit, -en`, whose `-en` sits at 233) and building the German a
    card needs: the gender, the plural, the feminine, the paradigm. **The Wortgruppen — the numbers, days,
    months and colours the alphabetical list omits — are declared and then ASSERTED against the PDF's own
    pages 5–7**; that check is what found `der Monat`, which is in no list at all, and the gap is the exam
    board's and is recorded rather than filled.
  · **WHAT IS TAKEN FROM THE PDF IS THE WORD LIST AND NOTHING ELSE.** It prints an example sentence under
    almost every entry and not one is reproduced: those are the Goethe-Institut's own authored prose, where
    this deck's sentences come from Tatoeba and its meanings from Wiktionary. They ARE read while the
    pipeline is written — they are the evidence for which sense of `aus` or `laut` the list means, and for
    the `FORCE_POS` table's 83 multi-POS entries — but they do not travel into the deck, and
    `check-goethe.js` asserts no card text quotes the document.
  · **A FEMININE IS READ AND THEN CHECKED, because Wiktionary lists one wherever German CAN make one and
    not only where it uses one.** Read straight, `der Mann` shipped with `die Männin` beside it. Nothing in
    the tags separates that from `die Lehrerin` — all of them are a bare `['feminine']`, and Männin's entry
    carries an ordinary gloss whose only marks are a `Bible` CATEGORY on one sense and `rare` on the other.
    What does separate them is CURRENCY, measured on the frequency list the ordering already uses: **a
    feminine of a common masculine that appears not once in 50,000 words is not a word in use.** Mann
    222,707/Männin 0, Fisch 6,038/Fischin 0, Gast 5,053/Gästin 0 all fall; `die Doktorin` at 64 hits
    survives, and so do `die Absenderin` and `die Empfängerin`, ordinary words whose masculines are
    themselves too rare for the list to say anything about. Two more go for reasons that are not about
    frequency: a feminine equal to the headword is not a feminine (`Mensch` gave its own name, meaning the
    neuter `das Mensch`), and a STEM has none (`Lieblings-` gave `die Lieblingin`). 23 → 18.
  · **A GERMAN NOUN IS CAPITALISED, WHICH CUTS BOTH WAYS — AND AT THE HEAD OF A SENTENCE IT CUTS NEITHER.**
    The first two rules are what keep `fernsehen` off "dass Fernsehen schlecht für Kinder ist" and the
    adverb `morgen` off "heute Morgen"; the hole they leave is position 0, where every word is capitalised
    and the capital is therefore no evidence of a noun at all. `die Bitte` came out illustrated by "**Bitte**
    erklären Sie, warum Sie nicht kommen können", which is the particle `bitte` — **the other entry in this
    very deck**. So where the deck also teaches a lowercase word of the same spelling, the noun reading is
    declined in first position and the lowercase one keeps the sentence; it bites on the handful of words
    that are two words (bitte/Bitte, essen/Essen, morgen/Morgen) and separates all three cleanly.
  · **A TWO-TOKEN FORM IS A SEPARABLE VERB ONLY WHERE IT IS FINITE, and the rule had to be positive.**
    Blacklisting the shapes was tried twice and is the wrong shape: 4,779 of the deck's 5,301 distinct
    multiword forms are not separable pairs at all, in at least four families — Wiktionary's
    `includes-article` declensions (`der gute`, 8,288 of them), the two-word superlative (`am besten`),
    compound tenses (`hat gesagt`, which also made the build unreproducible, since a sentence then hit one
    key under two forms and which was recorded came off a set), and **names leaking out of citation
    metadata into `forms`** (`Sebastian Brant`, filed under `sein`). Requiring a finite tag keeps 522 and
    every one is `lade ein`, `höre auf`, `stelle vor`. The article ones bit hardest: the adjective `best-`
    resolves to the lemma `gut`, so its card came out with three sentences bolding `am`, `das` and `Die`
    and never `besten` — every count healthy, since the sentences really do contain the word.
  · **WIKTIONARY'S OWN SENSE ORDER IS THE SIGNAL** — the DELE ranks a sense by how SHORT its gloss is, which
    is a fair proxy in Spanish and gave `das Haus` as "theatre" and `gehen` as "to leave" here. The only
    reordering is to push a sense labelled obsolete or dialectal behind the plain ones, **and one more: a
    gloss that describes a grammatical FUNCTION rather than translating.** `haben` opened on "forms the
    perfect aspect" and gave "to have" second. **The tag `auxiliary` is the wrong test and was tried**: on
    the modals the auxiliary sense IS the meaning, so demoting it gave `müssen` Wiktionary's mangled
    intransitive reading ("to have to do something implied") ahead of "must". The gloss is what separates
    them, and swept over the deck all 21 glosses opening on "Used…" are usage notes and not one is a
    meaning. Where no rule can settle it the answer is written down and read off the list's own example:
    Wiktionary opens `werden` on the future auxiliary and the Goethe example is `Mein Sohn will Arzt
    werden`, so that one joins `möchten`, `geboren`, `lieber` and `der Lkw` in `AUTHORED`.
  · **A STEM ENTRY IS ILLUSTRATED BY ITS OWN FORM OR NOT AT ALL** (`own_stem_only`), a BAR and not a
    penalty, which is this pipeline's standing rule that under-marking beats mis-marking: as a penalty
    `Lieblings-` still took "**Liebling**, ich kann es dir erklären!", which is the noun and a different
    word from the prefix. Measured over all fifteen stems it costs NOTHING — barring the wrong sentence let
    a lower-scoring right one through.
  · **THE CARD IS ONE NOTE AND TWO TEMPLATES**, the Mandarin shape rather than the DELE's two-notes-per-word:
    785 notes, 1,570 cards, 1.59 MB. A corrected gloss is corrected in both directions at once and each
    direction keeps a schedule of its own. Its `.uc-field` needs a `min-width` the Mandarin decks do not,
    because German's commonest words gloss in ONE word and `ich` → `I` left an 80px stamp adrift in a 680px
    card under a rule spanning the whole of it.
  · **`check-goethe.js` is the browser half** and exists because `check-decks.js` skips the card-level
    checks for a deck that is not Mandarin — so everything German this deck is FOR is unchecked by anything
    until here. It studies the deck and asserts what the PAGE says (a coloured article and a plural, a
    paradigm with Präsens/Perfekt/Imperativ and its auxiliary, a comparative and superlative, der/die/das in
    three distinct colours) and **writes four screenshots to look at** — front, back, noun, verb, adjective
    — which is where the bolding fault and the `bitte` sentences were actually found. Two things it has to
    keep doing: **grade EASY** (a new card graded Good requeues as a learning step and the walk stands
    still) and **raise the day's allowance**, since five new cards is five function words and no noun, verb
    or adjective is ever reached. It takes the level as its argument (`node check-goethe.js b1`).
  **THE THIRD LEVEL IS WHERE THE LIST'S OWN TYPESETTING BECAME THE WHOLE JOB.** B1 is 2,529 headwords
  against A2's 1,300, set in a narrower column with two or three numbered example sentences under each, so
  it wraps constantly and in every direction — and a wrapped line read as a headword is a card for a word
  that does not exist. Seven things it settled are worth carrying.
  · **A LINE IS A CLUSTER OF TOPS, NOT A ROUNDED ONE, AND THAT CHANGE BROKE A1 IN A PLACE NOTHING WAS
    WATCHING.** B1 sets the regional-variant arrow 1.42 points above the headword it belongs to, which
    `round` files in the next bucket down, so `→` became a row of its own and — a row ending in an arrow
    being a continuation — swallowed the real headword under it. Clustering fixed that and merged two A1
    lines the rounding had kept apart: the running head at x 17 and the section letter at 143 sit on ONE
    line, so `Alphabetische A` and `wortliste ab` became entries and `ab` was lost. **The column, not the
    line grouping, is what should have separated them** — A1's `HEAD_COLUMNS` opened at 0 and now opens at
    140, with `SUB_INDENT` moved from 146 to 6 to stay relative to it.
    **AND IT WENT UNNOTICED FOR A SESSION BECAUSE THE BASELINE WAS THE CACHE.** `wortliste-a1.json` in
    `.claude/goethe-cache/` was already carrying the fault when it was copied as the "before"; the only
    honest baseline is **the committed deck rebuilt from the committed code**, which is what `git stash` and
    an md5 give in two commands.
  · **A VERB PARADIGM RUNS TO FOUR PARTS AND THE LINE OFTEN ENDS BEFORE IT DOES**, 58 times, and the break
    falls anywhere in it — after the auxiliary (`baden, badet, badete, hat` over `gebadet`, 25 of those),
    after a finite form whose separable prefix or reflexive pronoun wrapped (`sich amüsieren, amüsiert` over
    `sich, amüsierte sich, …`), inside a word (`hat geant-` over `wortet`). So the test is **the paradigm's
    own arithmetic** rather than the shape of the break: four comma-parts, the last not a bare auxiliary.
    Gated per level (`VERB_WRAP`) because A2 prints a bare `abholen` as a headword and the rule joins it.
  · **THE UMLAUT MARK COMES BACK AS A CURLY QUOTE ON ONE ROW IN THREE HUNDRED** (`die Angst, “-e`) and the
    marker's hyphen is set clear of its ending on two more (`der Klick, - s`). Both are repaired in
    `fix_glyphs`, before anything reads the row — a mark that is not a mark is a noun shipped under a lemma
    no dictionary has, and the count of nouns stays perfect throughout.
  · **A FEMININE IS RECOGNISED BY COMPARISON, NOT BY CONSTRUCTION.** Adding `-in` to the masculine catches
    `Absender`/`Absenderin` and misses every noun that umlauts (`Anwalt`/`Anwältin`, `Arzt`/`Ärztin`) and
    every weak masculine in `-e` (`Kollege`/`Kollegin`) — eight adjacent pairs, each of which then ships as
    a card of its own with **no meaning at all**, Wiktionary glossing a feminine "female equivalent of X".
    Fixing it also gave A2's `der Partner` the feminine it had been missing.
  · **A LEMMA WHOSE EVERY SENSE IS A POINTER HAS NO MEANING TO CARD, AND THE MEANING IS AT THE OTHER END.**
    Nineteen B1 words are filed as inflections or variants — `Früchte` "plural of Frucht", `ausgebildet`
    "past participle of ausbilden", `die Mail` "alternative form of E-Mail", `Bub` "alternative form of
    Bube", `Coiffeuse` "female equivalent of Coiffeur". `extract_kaikki` now takes a **third pass** to fetch
    the pointer targets and `pointed_glosses` follows them **only when there is nothing else**, so every
    earlier level is inert. It is the general form of what the `STEM` table does by hand.
  · **THE REGIONAL NOTE IS THE LIST'S OWN COLUMN AND IT WRAPS FIVE DIFFERENT WAYS** — before the arrow,
    after it, on a country code and a comma (`→ A,` over `CH: Pension`), with the whole bracket on the next
    line (`(D) → A: e-card`), and once at the very tail of a phrase the note has already named. Each was
    inventoried before it was written; the last is a single row, and left alone it ships a card for the bare
    verb `gehen/sein`.
  · **WHAT WIKTIONARY CANNOT GLOSS IS AUTHORED, NEVER DROPPED.** B1's residue is 40 words — the
    compound-forming prefixes (`Bio-`, `Schwieger-`, `Sonder-`), the correlative conjunctions (`weder …
    noch`, `je … desto …`), the phrases (`sich scheiden lassen`, `in Rente gehen/sein`) and the Austrian and
    Swiss words the list gives entries of their own (`der Führerausweis`, `die e-card`, `der Zivilstand`) —
    and each is written into `AUTHORED` with its country where the country is the point. `build_deck` still
    REFUSES a card with no meaning, which is what keeps that list honest.
  · **A1, B1, B2, C1, C2 AND THE PHRASES ARE IN THE REPO AND A2 IS NOT** (Aug 2026), and the reasoning
    changed under it. It was A1 alone, on the request that these are files to hand a reader for import
    rather than something the site should carry, and `.gitignore` named the rest so a `git add -A` could
    not sweep one in. **THE LANGUAGES SECTION MADE THAT UNTENABLE FOR ANY DECK THAT IS ON DISK**: the
    catalogue is built by READING `decks/`, so a deck that is present and ignored is one the shelf offers
    and the deployed site cannot fetch — an Add button that 404s on the live site and nowhere else, seen
    by nobody but the reader who presses it. It happened to the B1 deck, which was ignored as a build
    artefact and then catalogued the day it was asked for by name. **So the rule is now that anything in
    `decks/` is either committed or absent**: A2 stays ignored and is not built by default, and
    `test-lang-decks.js` asserts no catalogued deck is gitignored. Nothing on the site LINKS to a deck
    file — the Languages section fetches one on Add — and a community deck is still user content, which
    is why none of them goes in the changelog.
  **Re-running it must reproduce the shipped deck byte for byte**; that is the check to make after any edit,
  since every fault above is silent — **and it has to be run on every level, since the parser is shared**:
  A1 must stay byte-identical to what is committed, and A2 and B1 must reproduce themselves. Not part of
  the site.
- `.claude/delf/` — the generator behind the French decks, **all six levels plus the expressions**:
  `decks/DELF-A1-French.folio-deck.json` (**446 notes / 892 cards**, 0.78 MB),
  `decks/DELF-A2-French.folio-deck.json` (**589 / 1,178**, 1.37 MB),
  `decks/DELF-B1-French.folio-deck.json` (**895 / 1,790**, 2.34 MB),
  `decks/DELF-B2-French.folio-deck.json` (**1,654 / 3,308**, 3.96 MB),
  `decks/DALF-C1-French.folio-deck.json` (**3,231 / 6,462**, 5.91 MB) and
  `decks/DALF-C2-French.folio-deck.json` (**431 / 862**, 0.53 MB), community decks rather than site
  content: `python3 .claude/delf/run.py [--level a1|a2|b1|b2|c1|c2|phrases] [--no-fetch]`. Six stages, run by
  `run.py`,
  caching its corpora in `.claude/delf-cache/` (~760 MB, gitignored). PYTHON, like `.claude/dele/` and
  `.claude/goethe/` and unlike every other helper here, and for the same reason: a further level is a
  re-run against the next page rather than a rebuild. **ONE LEVEL PER RUN** (`delf_level` reads the level
  once, at import), and a level is taught on top of the ones below it, read out of the shipped deck FILES
  so they cannot drift — the DELE and Goethe arrangement exactly. The ladder is complete, so `LISTS` and
  `BELOW` name every level the source publishes.
  · **THE DIPLOMA CHANGES ITS NAME AT C1, AND THE DECK HAS TO CHANGE WITH IT** (`EXAM` in
    `delf_level.py`). The **DELF** covers A1–B2; C1 and C2 are the **DALF**, the *diplôme approfondi de
    langue française* — a different diploma under the same authority — so those two files are
    `DALF-C1-French` and `DALF-C2-French` with deck ids `dalfc1` / `dalfc2`, and the exam name is a
    TABLE rather than a literal in the prose (two sites in the description read it). A level above B2
    calling itself a DELF would be telling its reader something false about the exam it is for. **The
    GENERATOR keeps its own name** (`.claude/delf/`, `delf_level`) — that is what the pipeline is
    called, and renaming it would churn every stage for nothing. The four existing titles, ids and
    filenames are derived from the same table and were verified unchanged.
  · **THE WORD LIST IS NOT AN EXAM BOARD'S, AND THAT CHANGES WHAT THE PIPELINE MAY DO WITH IT.** The
    Goethe deck teaches the Goethe-Institut's own published Wortliste, and its standing rule is that the
    list IS the syllabus — a word the sentence corpus cannot illustrate still ships, because the board
    sets the scope and the corpus gets no vote. **France Éducation international publishes no such list
    for the DELF or the DALF**: it publishes a syllabus of THEMES, and the reference that turns those
    into words
    (Beacco et al., *Niveau A1 pour le français*, Didier) is a commercially published book. So the list
    here is a third party's — the six pages of minddory.com at 384, 554, 893, 1,673, 3,220 and 376 words
    — and **a
    compilation with typos in it has no authority to defer to**. Its defects are repaired, every repair
    is declared in `REPAIRS_BY_LEVEL` with the reason, and the deck's own description tells the reader
    whose list it is.
    **AND THE LIST IS GRADED BY FREQUENCY, WHICH WAS MEASURED RATHER THAN TAKEN ON TRUST** — the check
    to run before building a level nobody has looked at. Ranked against the OpenSubtitles list the six
    pages' medians run **700 / 1,754 / 4,861 / 15,490 / 18,538 / 21,194**, and the share falling in the
    commonest five thousand runs **88% / 80% / 50% / 11% / 6% / 4%** — monotone both ways, so each page
    really is rarer vocabulary than the one below it and "is C1 junk?" is a measured no.
    **BUT THE CORPUS BEHIND THAT RANKING IS FILM AND TELEVISION SUBTITLES, AND THE HIGHER THE BAND THE
    MORE ITS CHARACTER DOMINATES.** At A1 the commonest words are the commonest words whatever the
    corpus; by C2 the corpus's own character is all that is left, and its 376 words are Star Trek
    (*hyperespace*, *téléportation*, *symbiote*, and among the dropped entries *cardassien*,
    *romulien*, *phaseur*, *réplicateurs*), hospital drama (*anévrisme*, *défibrillateur*,
    *pneumothorax*), crime procedural (*légiste*, *perquisition*, *macchabée*) and the occult
    (*exorcisme*, *grimoire*) — **rare French worth knowing, and not the abstract argumentative register
    a DALF C2 candidate is examined on**. The answer is neither to withhold the deck nor to let its name
    make a claim it cannot keep: **`LIST_NOTE` in `emit.py` is a per-level paragraph, written only for
    c1 and c2**, telling the reader exactly that in the deck's own description. The lower four need
    none.
  · **AND THE PAGES ARE ADDED TO, WHICH IS A DIFFERENT ACT FROM REPAIRING THEM AND NEEDS ITS OWN
    WARRANT** (`SUPPLEMENT_BY_LEVEL` in `wordlist.py`; Aug 2026, on request — "add more core words or
    less common ones where appropriate"). Everything in `REPAIRS_BY_LEVEL` is a correction: the list
    printed something and the something was defective. An addition is not, and the pipeline's standing
    position is that the list is somebody else's. **The warrant is that a frequency cut is not a
    language, and it fails at BOTH ends — measured, over all six shipped decks against the same
    50,000-word list.**
    **AT THE TOP THE CLOSED CLASSES COME THROUGH WITH HOLES IN THEM, because a frequency cut has no
    notion of a paradigm.** The A1 deck taught **`pas` and not `ne`** — a learner could not form a
    negative sentence — and taught `je`, `tu`, `il`, `elle`, `nous` and `vous` but not **`on`**, which
    is how French says *we*. Absent from all six: `ne` (rank 17), `on` (21), `ça` (22), `si` (38), `du`
    (39), `y` (40), `au` (50), `moi` (52), `comme` (63), `toi` (69), `lui` (72) — **eleven of the
    hundred commonest words in the language**, plus the demonstratives, the relatives and the
    contracted articles. The DELE pipeline reached this first and states it in one line: a 500-word A1
    list without `yo` and `tú` is not an A1 list.
    **AT THE BOTTOM THE CORPUS SIMPLY DOES NOT CONTAIN THE REGISTER**, which is the C2 finding above
    arriving from the other side: no amount of counting subtitles turns up the connectives and abstract
    vocabulary of argument, because they are not in the thing being counted. So **the two halves have
    two different warrants and are kept apart on purpose** — the lower levels' additions are DERIVED
    (the commonest words no deck taught, read off the same frequency list that orders the cards, then
    hand-filtered for the proper nouns, English and swearing a subtitle corpus is full of) and C1's and
    C2's are **AUTHORED**. 253 words in all: 67 / 44 / 9 / 8 / 53 / 72.
    Four things about it are decisions rather than lists.
    **FREQUENT IS NOT THE SAME TEST AS EVERYDAY, and at A1 the difference is the whole filter.** The
    subtitle corpus puts `meurtre`, `prison`, `arme` and `capitaine` inside the first eight hundred
    words of French — frequent because of what films are about, not because a beginner needs them — so
    the A1 additions are the ones that are frequent AND ordinary, and those are left for the levels
    whose own pages print them.
    **A GROUP CARRIES THE REASON IT IS THERE, and the reader is told**: the table is keyed by a phrase
    finishing "the level's own list does not print …", and `emit.py` reads those back into the
    description, with a different sentence for the derived half and the authored half. A deck that says
    "the list is a third party's" and then quietly teaches two hundred words the third party never
    printed has told the reader something false about its own scope.
    **`page` AND `raw` ARE NOT THE SAME LIST**, which is the one thing here that would have gone wrong
    silently: the description says "Of its 384 entries, 3 are misspelt", which is a claim about the
    PAGE, and counting the supplement into `repairs.json`'s `raw` would have every level report a page
    longer than the one anybody can go and read.
    **AND A PHRASE IS SEPARATED BY `|`, NOT BY A SPACE** — the B1 lesson in another coat, and it bites
    harder here, since half of what C1 and C2 add IS a phrase (`dans la mesure où`, `quand bien même`,
    `si tant est que`). A group whose value carries a `|` is a list of phrases; anything else splits on
    whitespace as before.
    Its own supporting changes: **six `FORCE_POS` rows** where the dump's first record is a different
    part of speech from the word being taught (`voici`/`voilà` are filed as VERBS and would be sent to
    the conjugation builder for a paradigm they have not got; `sauf` leads as the adjective *safe* and
    `envers` as the noun *the reverse*; `or` leads as *gold* and `partant` as a runner in a race), and
    **`AUTHORED` glosses for the contracted articles**, which are the clearest case in that table of a
    gloss that has to be written — `du`, `au` and `aux` are pointer-only records pointing at `de` and
    `à`, so the pointer walk hands back the meaning of the OTHER half of the contraction and says
    nothing about the word in front of the reader.
    **`CLOSED_FORMS` in `build_deck.py` is the other half, and it is what stopped the supplement being
    four cards where one will do.** `forms_html` reads the dictionary, which supplies a feminine for a
    noun and an agreement for an adjective and **nothing at all for a pronoun or a determiner** — so
    `celui` came out taught alone, its `celle`, `ceux` and `celles` being bare pointers back to it with
    no meaning of their own, and `mon` was carded without `ma` or `mes`. Hand-written, because these
    ARE the closed classes: enumerable, unchanging, and precisely the exceptions any derived rule would
    be about. One trap it hit: **`mien`/`tien`/`sien` are filed as ADJECTIVES**, so the adjective branch
    already reads `mienne` off the dictionary and a `feminine` row here printed the feminine twice on
    one card; what the dictionary cannot say is that the word takes an article, which is the whole
    difference between `mon livre` and `le mien`.
  · **`combine.py` IS THE SIX IN ONE IMPORTABLE FILE** (`python3 .claude/delf/combine.py`, Aug 2026, on
    request), a subdeck per level: **7,249 notes / 14,498 cards, 13.9 MB**, inside app.js's caps
    (12,000 NOTES — what the file holds — and 48 MB), both of which it restates and refuses to exceed
    rather than leaving the failure to be found on a phone.
    **THE TREE IS FLAT, AND THAT IS THE DIFFERENCE FROM THE SPANISH ONE.** `dele/combine.py` nests a
    direction inside each level, because a DELE deck writes the study direction into the card's own
    `sub` — it is two notes per word, one each way. A French deck is ONE note with TWO TEMPLATES, so
    the direction is not a subdeck and **cannot be made one**: `sub` is a property of the note, and the
    note is both directions. What replaces it is better and costs nothing, since app.js already draws a
    level's two templates as rows of their own beneath it — so the reader gets `A1` → `French →
    English` / `English → French` out of a file with one `sub` per level and no `::` in it anywhere.
    **THE EXAM NAME CHANGES AT C1 AND THE TITLE HAS TO SAY SO** — `DELF A1–B2 & DALF C1–C2 — French`,
    built by walking `delf_level.EXAM` rather than typed, so it cannot drift from the six files it is
    made of; a combined deck called `DELF A1–C2` would be making a claim about the exam that is false
    for a third of it. The rest is the Spanish version's discipline unchanged: ids renumbered
    `u_delfall_N` (a combined deck reusing `u_delfa1_1` collides with an installed A1 in the shared
    `UCARDS` store and studies the wrong card), the type block **asserted** identical across the six
    rather than assumed, every figure in the description COUNTED off the cards, and no clock read, so
    the same inputs write the same bytes and a diff means something. Here the note count IS the word
    count, which the Spanish version cannot say — a pair card there may teach two words, so how many
    WORDS a level teaches is not derivable from its shipped file at all.
    **IT IS GITIGNORED, like the Spanish one**: a combined deck is an ARTEFACT of the levels it
    combines, so committing it duplicates every megabyte the repo already carries for them, and one
    command regenerates it byte for byte.
    **`check-combined.js` is its browser half** and exists because everything `check-delf.js` asserts
    about a French card is true of this file by construction — the cards are copied over unchanged —
    while everything `combine.py` BUILDS fails silently: an id collision studies the wrong card with
    both decks on the shelf and their full counts showing, a lost `sub` lands seven thousand words in
    one undivided pile, a mismatched type block renders one level with another's templates, and a file
    over the note cap is refused with a message about the file rather than about the deck. So it
    imports the real file through the real picker, asserts the six subdecks and the direction rows
    underneath them, adds A1, studies it, and checks **the word dealt is one of A1's**.
    **THE REPAIR TABLE IS PER LEVEL, AND SO IS EVERY SENTENCE WRITTEN ABOUT IT.** A repair is a statement
    about ONE page, so a flat table shared across levels fires a merge on a list with nothing to merge —
    silently, since a repair whose source word is absent does nothing and reports nothing — and, worse,
    applies one page's correction to another nobody has read. The same fault had already been made twice
    in prose: `check-delf.js` hard-coded A1's five broken entries and three duplicate pairs as literals
    and **failed on A2 over `cinéma`, a word that page does not print**, and the deck's own DESCRIPTION
    told an A2 reader about `chaussures` while saying nothing about its own seven duplicates. Both are
    derived now — the checker parses `REPAIRS_BY_LEVEL` out of `wordlist.py`, and `wordlist.py` writes a
    `repairs.json` the description reads back. **A level-parameterised thing with one level's answers
    baked into it does not guard the rule, it pins a stale copy of it.**
  · **THE DEFECTS WERE FOUND BY A MEASUREMENT, NOT BY EYE.** Looking every entry up in the dump, **four
    of the 384 have no French record at all** — `exercise` (the English spelling of *exercice*), `france`
    (uncapitalised), `cinema` (the accent dropped, and `cinéma` is on the list too) and `loud`, which is
    an English word — and **four more are the same word printed twice** (`chaussure`/`chaussures`,
    `parent`/`parents`, `salle de bain`/`salle de bains`). Four in 384 is a sharp test rather than a
    suggestive one, and all four are the ones a reader would flinch at. `loud` is DROPPED rather than
    guessed at: `lourd` is the obvious near-miss and choosing it would be composing a syllabus entry out
    of a typo. **`renter` is the one repair the dictionary does not make for us and is marked as such** —
    it IS a French word, meaning to yield an income, so the no-record test walks past it; what gives it
    away is that it lands LAST of 379 in the frequency ordering, among `regarder` and `rester`, in a list
    with no word for coming home. **What is deliberately NOT repaired is the harder half**: `chaussettes`,
    `sandales` and `devoirs` are printed only in the plural and stay there, since each is a real word in a
    real form and normalising them would be editing a syllabus rather than correcting an error.
    **THE A2 PAGE HAS THE SAME TWO DEFECTS AT THE SAME RATE, WHICH IS THE ARGUMENT FOR RUNNING BOTH
    MEASUREMENTS ON EVERY NEW LIST** rather than trusting that a longer page was compiled more carefully:
    one accent dropped off a word the list also prints correctly (`temperature` beside `température`) and
    four nouns printed in both numbers (`cheveu`, `loisir`, `personne`, `quelque`). **A COLLISION IS NOT A
    DUPLICATE UNTIL IT HAS BEEN READ**: `âge`/`âgé` collide within A2 and are the noun and the adjective,
    and `salé`/`sale`, `sucré`/`sucre` and `sûr`/`sur` collide ACROSS the levels and are six different
    words — nothing has to be done about those, since `words_below()` excludes by exact spelling.
    **AND A THIRD SHAPE OF DUPLICATE IS INVISIBLE TO BOTH SWEEPS: the same word printed in both GENDERS.**
    Neither the no-record test nor the accent sweep nor the singular/plural sweep can see `joli`/`jolie`
    or `voisin`/`voisine`, because all four are real words in real forms. What shows it is **a card whose
    Forms row names another card** — which `parti`/`partie` (party against part) and `surpris`/`surprise`
    (surprised against a surprise) also do and deliberately are not. Read all four before merging any.
    **AND A FOURTH: the bare infinitive beside its pronominal.** A2 prints `promener` AND `se promener`,
    `sentir` AND `se sentir`. Those are NOT merged — they are different verbs — but they came out sharing
    glosses and an example; see the two entries below.
    **THE B1 PAGE ADDS A FIFTH SHAPE AND IT IS THE ONE THE EARLIER RULE FORBIDS: an INFLECTED FORM
    printed as a headword.** `aspects` and `profondes` are a plural noun and a feminine-plural adjective,
    so both build a card headed `l'aspects` / `un aspects` — ungrammatical French on a card whose whole
    subject is the article a word takes. **It looks exactly like A1's `chaussettes`, which is deliberately
    NOT repaired**, and what separates them is whether the list ALSO prints the citation form: A1 prints
    `chaussettes` alone, so the plural is that syllabus's entry and normalising it would be editing a
    syllabus; B1 prints neither `aspect` nor `profond`, so those are not a choice about scope but a slip
    that leaves the level without the word at all. **Ask what the list would look like if the entry were
    deliberate**, rather than matching the shape. Its other defects are the two already met — two letters
    dropped (`implquer`, `questioner`, both beside the correct spelling) and four nouns printed in both
    numbers (`étude`, `média`, `sentiment`, `solde`).
    **THE B2 PAGE HAS THIRTY-THREE DEFECTS AND THAT IS THE SAME RATE, WHICH IS THE MEASUREMENT WORTH
    TAKING RATHER THAN THE COUNT**: 33 of 1,673 is 2.0% against A1's 8 of 384 at 2.1%, so a list four
    times longer is not four times worse and the sweeps simply have four times as much to find. What
    makes it far easier to read than the count suggests is that **the page is ALPHABETICAL and every
    defect sits immediately beside its own correct spelling** — `aboroder` after `aborder`, `emettre`
    before `émettre`, `tenacité` before `ténacité` — which is better evidence of what was meant than any
    inference, and which makes nineteen of the thirty-three merges rather than corrections. **Read the
    NEIGHBOURS of a defect before deciding what it was.** Four things it settled beyond that:
    · **A COLLISION IS STILL NOT A DUPLICATE, and at B2 the ratio flips.** Stripping the accents finds
      eight twins and only three are duplicates: `contraste`/`contrasté`, `controverse`/`controversé`,
      `enthousiasme`/`enthousiasmé` and `stéréotype`/`stéréotypé` are a noun beside an adjective in each
      case, as `contrainte`/`contraint` and `étendue`/`étendu` are, and `composant`/`composante` and
      `dominant`/`dominante` are two nouns with real independent records. **Eight of the thirteen
      collisions are two words**; a rule applied to the shape would have merged them all.
    · **THE DANGEROUS ONES ARE THE ENTRIES WITH A SECOND, RARER RECORD**, because a bare form-of record
      loses to the next and the card then teaches the rarity. `volatile` would card as *a fowl* rather
      than as the feminine of `volatil`, `revenue` as *the action of game leaving the forest to graze*
      rather than as the noun beside it, and `explicit` — which IS French, for the closing words of a
      medieval manuscript — as that, beside `explicite` on the same page. **No sweep here can see one**:
      the word has a record, so the no-record test passes it, and the record is not a pointer, so the
      only-pointer test passes it too. They were found by reading the collisions.
    · **THE PARTICIPLE-AS-ADJECTIVE CLASS SCALES WITH THE LEVEL AND GAINS A SECOND SHAPE.** 27 of B2's
      entries have nothing but a pointer against B1's 11, and after the merges fourteen need `FORCE_POS`
      + `AUTHORED` — including two PRESENT participles (`contrastant`, `convergent`), which B1 had none
      of and which need it for the same reason, `convergent` also being the third-person plural of
      `converger`.
    · **AND `déchets` IS WHERE A1 AND B1 STOP LOOKING LIKE THEY CONTRADICT EACH OTHER.** A1 keeps
      `chaussettes` and B1 repairs `aspects`, and the test that separates them is a fact about the WORD:
      is the plural how the word is normally met? French says *les déchets* for waste, so it stays — and
      staying means writing it into **`PLURAL_ONLY` in `build_deck.py`**, which is hand-written for
      exactly this reason. A word in that table cards as `les chaussettes` and one outside it as
      `l'aspects`, which is the whole of B1's justification and is worth knowing before trusting it: the
      Wiktionary records of the two are identical.
    **THE C1 PAGE'S DEFECTS ARE THE SAME FIVE SHAPES AT 3,220 ENTRIES**, which is the point: fifty-odd
    rows, and not one of them a shape the four levels below had not already met — nine accents dropped,
    twelve duplicates, fourteen feminines and three plurals standing in for their citation form, and
    fourteen with no record at all. **Only the LIGATURE is new** (`manoeuvre` for *manœuvre*, `écoeurant`
    for *écœurant*), and it is the accent case wearing another coat: `œ` is a single letter, so a page
    that types it as two has misspelt the word exactly as one that drops a circumflex has. Its
    participle-as-adjective class is B2's at three times the size — **46 rows of `FORCE_POS` +
    `AUTHORED`** — and `PLURAL_ONLY` gained `oreillons`, `ossements` and `pourparlers`, three more words
    French does not have a singular for in ordinary use.
    **AND THE C2 PAGE IS THE ONE WHOSE DEFECTS ARE MOSTLY NOT DEFECTS.** Seventeen rows against C1's
    fifty on a page a ninth the size, and sixteen of them are drops: `cardassien`, `romulien`,
    `excalibur`, `prométhée`, `phaseur`, `métamorphe`, `nobel`, `sapiens`, `mystic`, `maxim`, `serial`.
    A proper noun and an English word are what the no-record test is for, and finding eleven of them in
    376 entries is the same finding as the subtitle-corpus measurement above, arriving from the other
    side. **The one repair is an accent** (`eventreur` beside `éventreur`, a duplicate). What that means
    for the pipeline is that a page can be clean and still be wrong for its name — the defect count says
    nothing about whether the list is the right list, which is why `LIST_NOTE` exists and is not a
    repair.
  · **WIKTIONARY'S OWN RECORD ORDER IS THE SIGNAL, and a preference list is not** — the Goethe build
    reaches this about SENSES (a commoner sense is not a shorter one) and it holds one level up, about
    which PART OF SPEECH an entry leads with. Measured: a fixed order (noun, then verb, then adjective…)
    disagrees with the first record on **73 of the 379 words**, and reading all 73 the first record is
    right almost every time — `être`, `avoir`, `aller`, `parler` and `dire` are verbs that happen to have
    a noun record, `grand`, `beau`, `petit` and `vieux` adjectives that happen to have one. French
    nominalises so freely that preferring `noun` makes two thirds of the deck a noun, which is how the
    first build came out with **245 nouns and 35 verbs** against the true 195 and 43.
  · **A FORCED CLASS MUST WIN EVEN WHERE THE DICTIONARY HAS NO RECORD FOR IT.** `une` is the indefinite
    article, which Wiktionary files under `un` as a bare form-of with no senses of its own — so the only
    record for `une` carrying a real sense is the NOUN, *la une*, a newspaper's front page. Read with
    `FORCE_POS` as a mere preference, the entry fell through to that noun, took the feminine article,
    elided it, and the card came out reading **`l'une`** with a forms row offering *une une*. The table is
    hand-written and every row was read off the page, so where it names a class the dump has no record
    for, the class stands and the meaning comes from `AUTHORED` — and a forced class with no record is
    now REPORTED on the run, because otherwise the build dies at the blank-meaning guard with no clue why.
  · **…AND ON A2 THE PIPELINE ALREADY HANDLED THE FAMILY THAT LOOKED WORST, which is worth measuring
    before writing a table.** Swept over all **159** of that list's multi-record entries, a record whose
    every gloss is a form-of pointer already loses to the next, so `produit`, `tapis`, `fermé`,
    `amusant`, `pressé`, `bruyant`, `surprise` and `droite` come out right untouched. **Ten do not, and
    they are two shapes.** A DEVERBAL NOUN FILED AHEAD OF ITS VERB — `devenir` glosses "future" and
    `toucher` "the act of touching, a way of touching, the sense of touch", both real nouns and neither
    what a learner means by the word; nothing structural separates those from a word that genuinely is a
    noun first, so they were found by reading. And A RARE SENSE FILED AHEAD OF THE EVERYDAY ONE, which is
    the A1 table's own `journal`/`menu` shape at greater length: `pendant` leads with the participle
    "hanging" where the word is *during*, `parti` with a heraldic adjective and "drunk" where it is the
    political party, `cher` with the vocative "dear, honey, hon" where it is *expensive*, `reçu` with
    "accomplished" where it is a receipt, `général` with the military rank, and `devoir` with the noun
    "duty, homework" — **which A1 already teaches as `devoirs`, so at A2 the word left to learn is the
    verb *must***.
  · **…AND ON B1 THAT FAMILY IS A SINGLE CLASS OF ELEVEN: the PAST PARTICIPLE used as an adjective.**
    `reconnu`, `lié`, `énervé`, `guéri`, `examiné`, `soulagé`, `amélioré`, `estimé`, `équilibré`,
    `dominé` and `découragé` are all printed by the list without their verbs, and Wiktionary files each
    as "past participle of X" — a record with no meaning of its own, so the card came out glossed as the
    BASE VERB (`reconnu` as "to recognise") on a level that does not teach the verb. Forced to `adj` and
    given an `AUTHORED` gloss apiece, which is the `une` rule at eleven times the scale: **a forced class
    the dump has no record for is REPORTED on the run**, and the eleven lines it prints are the check
    that the table has not drifted from the list.
    **THEIR EXAMPLES ARE COMPOUND TENSES AND THAT IS CORRECT, NOT A COLLISION.** A participle mostly
    appears after an auxiliary, so `estimé` is illustrated by "Nous avons estimé les dommages à mille
    dollars" — the verb, on a card glossed "estimated, valued", which shows the reader exactly that
    meaning in use. The `été` rule does not fire here and must not: there the noun and the participle are
    DIFFERENT WORDS, where these are one word in two classes.
  · **A FEMININE TAKES ITS OWN ARTICLE, NOT THE HEADWORD'S** — the sharpest fault of the A2 batch and it
    was in the SHIPPED A1 deck too. The forms row was written `'la ' + fem`, so it printed **`la
    étudiante`**, `la amie`, `la employée`: ungrammatical French, on a card whose entire subject is which
    article a word takes, directly under a headword correctly reading `l'étudiant`. It survives because a
    feminine begins with the same letter as its masculine and so gets it right often enough to look like
    an exception rather than a rule — the elision has to be recomputed for the feminine, and `elides()`
    was already sitting there unused by that line. One A1 card changed (`ami`).
  · **`œ` AND `æ` ARE VOWELS**, and leaving them out of the elision set is how **`le œuf`** reached a
    card. They are single letters rather than the two-letter sequences they look like, so a set written
    out of the ASCII vowels plus the accents misses them — and `œuf`, `œil` and `sœur` are exactly the
    words a beginners' list carries.
  · **A MONTH TAKES NO ARTICLE AND A DAY WITH ONE MEANS SOMETHING ELSE.** `le janvier` is not French;
    `le lundi` is French and means "on Mondays", so an article there changes the card from the NAME of the
    day into a habit. Both groups print bare and the gender still shows in the label line. The SEASONS
    keep theirs, because that is how they are said (`le printemps`, `l'été`).
  · **THE ELIDED ARTICLE HIDES THE ONE THING IT IS THERE TO TEACH**, which is the French problem the
    German deck never had: `le` and `la` both become `l'`, so `l'arbre` and `l'année` print the same
    article and say nothing about gender — and the words it happens to are not marginal (`l'eau`,
    `l'homme`, `l'école`, `l'hôtel`, `l'argent`). `un` and `une` do not elide, so those **25** cards carry
    the indefinite form as well, on exactly the words that need it rather than on all of them.
  · **A NOUN'S EXAMPLES MUST NOT BE SENTENCES WHERE THE SAME STRING IS A PARTICIPLE** — the German deck's
    `essen`/`das Essen` collision in a language with no capitalisation to settle it. `l'été` is the summer
    AND the past participle of `être`, so the card teaching *summer* was illustrated with "Tout le monde a
    **été** invité sauf moi", which is grammatical, correctly translated and about the wrong word. The
    ambiguity penalty cannot help, because every occurrence of `été` is ambiguous and the penalty falls on
    all of them equally. What separates the readings is POSITION: a participle follows a conjugated
    `avoir` or `être`, where a noun would need a determiner in between (`a été invité` against `a un été
    chaud`). **Written as "the token before it", the rule caught that sentence and walked straight past
    `n'ai jamais été`** — French puts adverbs between the auxiliary and the participle — so the fault
    survived its own fix and the card simply showed a different wrong sentence. It is a short scan back
    that stops at a determiner; it changes two cards, `été` and `marché` (the participle of *marcher*,
    which nobody had spotted), and both were wrong before.
  · **A HYPHEN EITHER ATTACHES A CLITIC OR BUILDS A COMPOUND WORD, and the tokeniser cannot tell them
    apart** — `-` is not a word character, exactly as the apostrophe is not, which is right half the time.
    `Donnez-moi`, `pensez-vous`, `Amuse-toi` and `adresse-t-il` are the verb the card teaches with its
    pronoun stuck on and a learner wants to see them; `passe-temps`, `porte-monnaie`, `couvre-feu`,
    `sèche-linge`, `après-midi`, `centre-ville` and `sous-entends` are single words meaning what their
    halves do not, so the `temps` card was illustrated twice over by a HOBBY. Measured before the rule was
    written: **72 hyphen-adjacent matches across both decks, about fifteen of them compounds.** What
    separates them is a CLOSED CLASS — everything a hyphen legitimately attaches is a clitic pronoun or a
    deictic particle, two dozen words that have not changed since the seventeenth century — so a match
    beside a hyphen is kept when either side of it is one of them. Deliberately a test on the NEIGHBOUR
    rather than on the compound: asking whether `passe-temps` "is a word" needs a dictionary of compounds,
    and the one to hand holds only the five hundred headwords being taught. Every compound goes; the two
    documented false accepts are `monsieur-je-sais-tout` and `ras-le-bol`, whose second halves really do
    follow a clitic.
  · **…AND THE MIRROR OF THAT RULE IS WHY EIGHT CARDS HAD NO EXAMPLES AT ALL.** A hyphenated HEADWORD is
    not a token either, and it is not a `phrase` — that test is a space — so `là-bas`, `grand-mère`,
    `grand-père`, `après-midi`, `peut-être`, `rendez-vous`, `petit-déjeuner` and `micro-ondes` could never
    match anything, silently, since a word with no examples simply prints none. They are matched against
    the TEXT like a phrase: `compound_here` stops a HALF of a compound matching and this lets the WHOLE of
    one match.
  · **WHERE THE LIST TEACHES BOTH MEMBERS OF A PAIR, A PRONOMINAL SENTENCE BELONGS TO THE PRONOMINAL
    CARD** — and the two cards came out sharing an example word for word ("Ils se promenèrent le long de
    la plage" sat on both `promener` and `se promener`), because a reflexive occurrence matches the bare
    verb's forms as readily as the pronominal's. `reflexive_here` already existed to REQUIRE the pronoun
    for the pronominal card; this is the same test read backwards to EXCLUDE it from the plain one. **It
    is safe only because the pronominal is on the list**: where it is not, `se` before a plain verb is
    very often the ordinary passive-reflexive ("la porte se ferme", "ça se voit"), which illustrates that
    verb perfectly well and is deliberately left alone — measured, and the alternative would remove good
    examples with the poor ones. **The same rule applies to the GLOSSES**, one file over: a sense tagged
    `reflexive` is dropped from the bare verb's card, which took "to walk (leisurely), to go for a walk"
    off `promener` and, on A1, "to use" off `aider`, "to wonder" off `demander`, "to wash oneself" off
    `laver` and "to be read" off `lire` — four cards that had been quietly glossing `s'aider`, `se
    demander`, `se laver` and `se lire`.
  · **THAT TEST WAS BLIND IN THREE PLACES AND EACH IS A DIFFERENT FACT ABOUT FRENCH.** **A PAST PARTICIPLE
    CARRIES NO PERSON**, so there is nothing for the pronoun to agree with and `Il s'est senti mis à
    l'écart` was invisible — the docstring had CLAIMED compound tenses worked, which is worse than an
    unstated limit; on a participle the window test now runs alone. **IN AN IMPERATIVE THE PRONOUN
    FOLLOWS, HYPHENATED, AND IS A DIFFERENT WORD**: `Lave-toi` is `se laver`, and `toi` and `moi` are the
    STRESSED forms, in no reflexive table — kept in `ENCL_PN` of their own rather than added to `REFL_PN`,
    because before a verb `moi` and `toi` mark nothing (`c'est à moi de jouer`). And **AN ESSENTIALLY
    PRONOMINAL VERB CARRIES ITS PRONOUN INSIDE ITS OWN FORMS**: `se souvenir` does not exist without one,
    so kaikki conjugates it `me souviens`, `te souviens`, `se souvient` — and every form-reader here drops
    anything containing a space, so all six persons were thrown away and that card had no examples while
    the corpus held a thousand sentences. The pronoun is stripped back off and the bare form indexed,
    which costs no precision because `reflexive_here` then demands it back.
  · **…AND PAIRING IT WITH ITSELF IS HOW THAT CARD STAYED EMPTY AFTER THE FIX.** `se souvenir`'s own lemma
    IS `se souvenir`, so the plain-key → pronominal-key map mapped it to itself, every occurrence read as
    "belongs to the other card", and the card came out empty a second time. **A pair must be two DIFFERENT
    entries**, which is not the tautology it looks like.
  · **AND THE EUPHONIC `-t-` IS NOT THE PRONOUN `t'`** — the fourth blind spot, found on B1's `se
    préparer`, which came out illustrated by "Le dîner **a-t-il** été préparé ?": a PASSIVE, and not the
    pronominal verb at all. French inserts a meaningless `t` between a verb ending in a vowel and an
    inverted `il`/`elle`/`on`, the tokeniser sees the bare letter `t`, and the reflexive test read it as
    an elided `te`. What separates them is the HYPHEN BEFORE IT, which the euphonic one always carries
    and the clitic never does, so the scan skips a `t` whose preceding character is `-` and keeps
    looking. Note the two facts it turns on: the test had only just learned to accept a participle with
    no person (the bullet above), which is what let this sentence through at all, and the character
    before a token is reachable only because the loop keeps its `spans`.
  · **TATOEBA CARRIES THE SAME SENTENCE SEVERAL TIMES OVER, AND AN EXACT-TEXT CHECK CANNOT SEE IT.** The
    corpus is contributed sentence by sentence, so it is full of tu/vous pairs, masculine/feminine
    agreement pairs and punctuation variants: `la raison` was illustrated by "Je ne suis pas sûr de la
    raison." and "Je ne suis pas sûre de la raison.", both translated "I'm not sure why.", which spends
    one of a card's three examples saying nothing new. **Measured over all three decks: 174 near-duplicate
    pairs across about a tenth of the cards** — and found by LOOKING at a card, since every count in this
    pipeline reads healthy either way.
    **TWO TESTS, AND THE PAIR WAS CHOSEN BY MEASURING WHAT EACH REJECTS rather than by picking a
    threshold that sounded right.** A SIGNATURE — accents and punctuation gone, every token cut to three
    letters, the second-person pronouns and determiners folded to one symbol — collapses 74 of the pairs
    and not one sentence pair that is less than 80% alike, so it costs nothing. A character ratio catches
    the mechanical variants the signature misses, and **0.90 is where it stops being safe**: at 0.86 it
    begins rejecting "Le film était un peu décevant" beside "Le concert était un peu décevant", and at
    0.82 "Elle était en train de faire du thé" beside "Il est en train de boire du thé", which are
    different sentences about different things. It runs in the FALLBACK pass as well as the preferred one,
    because two good sentences is the better card. **111 cards changed across the three levels and every
    substitution was read**; the one that came out worse is `surpris`, which lost a duplicate and took
    "Ma journée entière a été pleine de surprises" in its place — the NOUN, which A2 teaches as its own
    card. That is the homograph hazard rather than this rule: the +12 ambiguity penalty had been
    outvoting it all along and stopped once the two duplicates went. **It is recorded rather than fixed,
    because French has no cheap positional rule for it** — the `été` fix works because a participle
    follows an auxiliary, where an adjective and a noun both follow a determiner ("un bon film" against
    "de surprises"), so the rule that would catch this would reject a fifth of the adjective cards.
  · **A TRANSLATION IS SHORT AND A DEFINITION IS LONG**, and Wiktionary writes both in the same field:
    `l'eau` came out glossed "water, a liquid that is transparent, colorless, odorless, and tasteless in
    its pure form…", and sixteen more did the same. Only 15 of 508 leading glosses run past 80 characters,
    so the trim bites where it should; the head is salvaged (`water`, `a sponge cake`, `banana`) and the
    definition dropped where the card already has a meaning. **A SUB-SENSE OPENS ON A DISCOURSE MARKER
    AND THE COMMA AFTER IT IS NOT A LIST COMMA** — "In particular, rain" was split into two lines, so the
    card offered "water", "In particular" and "rain" as three meanings, one of which is not a word.
  · **A PRONOMINAL VERB'S MEANING IS IN THE SENSES TAGGED `reflexive`, and the entry's first sense is
    usually the opposite of it**: `se lever` came out "to raise, lift", which is what `lever` means, where
    the word means to get up. Four of the five have such senses; `brosser` has none, so `se brosser` is
    the one AUTHORED there. **Three forms are COMPOSED and they are the only ones** — the passé composé
    (the auxiliary's own présent plus the participle, with the agreement printed as `je suis allé(e)` so
    the bracket teaches the rule), the pronominal finite forms, and the pronominal imperative, where the
    pronoun moves behind the verb and `te` becomes `toi` (`lève-toi`). Which auxiliary a verb takes is
    **read** off Wiktionary's own `avoir + past participle` row, never guessed.
  · **kaikki INTERLEAVES THE PRONUNCIATION INTO THE CONJUGATION TABLE**, with the same tags as the
    spelling it belongs to (`paʁl` beside `parle`, on four verbs). The obvious test — look for IPA
    characters — is wrong: it also throws away `sœurs` and `œufs`, because `œ` is a French letter. So the
    test is positive, that every character be one French orthography uses; it keeps 4,023 forms and drops
    the 8 that are pronunciations. **A REGION TAG ON A PRONUNCIATION IS NOT ONE ON A SENSE**, either:
    rejecting `['Belgium','France']` the way a regional sense is rejected left `le chien` with no
    transcription at all, when that tag marks the ordinary European one against Quebec's.
  · **THE DECK'S OWN DESCRIPTION IS GENERATED PROSE AND HAS TO BE READ AT EVERY LEVEL'S NUMBERS, because
    a count of one and a count of zero are where generated prose goes wrong** (Aug 2026, adding B2 — and
    two of the three faults were already SHIPPING on A2 and B1). A clause built by concatenation reads
    perfectly at the numbers it was written against and stops being true at somebody else's.
    **A CLAUSE FOR A FEATURE THE DECK HAS NONE OF IS NOT PRINTED**: "the few that change before a vowel
    carry that form too (0: un bel homme, un vieil ami)" promises something and then says there is none
    of it, and it went out on A2 and B1 as well as B2, A1 being the only level with any.
    **A COUNT OF ONE IS NOT A PLURAL**: B2 teaches a single pronominal verb and no level below it does,
    so "The 1 pronominal verbs carry their pronouns" had never been reachable before.
    **AND A TRAILING CLAUSE ATTACHES TO WHATEVER ENDS UP LAST**: "chosen where possible to show three
    different inflected forms" was appended after the sentence, so on a level with words the corpus
    cannot illustrate it landed after "the corpus has nothing at all for the other 223" and read as
    though those words had been chosen — on B1's 7 as well. It belongs to the sentences, so it is now
    written inside the branch that talks about them rather than glued on after.
    **C1 AND C2 THEN FOUND THREE MORE, and two of them are the same fault as the first three: a claim
    that was true where it was written and is false somewhere else.** **A COUNT OF ZERO IS THE
    BEFORE-VOWEL FAULT ONE CLAUSE ALONG** — "whether a verb takes avoir or être has to be learnt with
    the verb (0 of them take être)" is a bracket promising a figure and then saying there is none of it,
    and on a deck whose six verbs all take avoir the sentence before it teaches a distinction the reader
    will not meet; it says "here they all take avoir" instead, and bites at C2 alone, the être verbs
    being common ones the lower levels take. **AND A SIZE CLAIM NOBODY MEASURED IS NOT MADE AT ALL**:
    "a third party's compilation **of roughly the right size for** C2" is an assertion about the exam's
    own scope that this pipeline has no way to check, and which the `LIST_NOTE` two sentences later
    flatly contradicts — so it says where the list came from and stops. The third is about what a DROP
    means: "are not French words in any spelling" is true of `loud` and `worldview` and **false of
    `argus`** (a real noun, the used-car guide), `goder`, `intraçable` and B2's `relevant`, all of them
    real French the extraction simply has no record of. The honest claim is the one the pipeline can
    make — "could not be matched to a French dictionary entry". **A generated sentence must state the
    TEST that was actually run, not the conclusion it feels like.**
  · **`check-delf.js` is the browser half** and exists because `check-decks.js` skips the card-level
    checks for a deck that is not Mandarin — so everything French this deck is FOR is unchecked by
    anything until here. It studies the deck and asserts what the PAGE says (the coloured article, the
    elided `l'` with its `un`/`une`, all five tenses in six persons, the auxiliary, `je` eliding before a
    vowel, the agreement table's cells on one line and not overlapping) and **writes seven screenshots to
    look at** — which is how the `été` sentence was found, every assertion having passed. It takes the
    level as its argument (`node .claude/delf/check-delf.js b1`) and reads that level's repairs out of
    `wordlist.py` rather than carrying a copy, so a list defect met on one page cannot be asserted on
    another that does not print it.
    **EVERYTHING ELSE LEVEL-SPECIFIC IN IT IS DERIVED THE SAME WAY, AND C1 IS WHY** (Aug 2026). The
    deck's FILENAME, its ID and the LADDER below it were literals — right for the four DELF levels and
    wrong the moment C1 became a DALF and the ladder five deep — so all three are now parsed out of
    `delf_level.py` (`EXAM`, `BELOW`). That is the fifth time this file has recorded the same lesson,
    after the repairs table, the checker's repairs, the deck description and the exam name: **a
    level-parameterised thing with one level's answers baked into it does not guard the rule, it pins a
    stale copy of it.**
    **AND THE ÊTRE ASSERTION IS THREE-WAY, because a deck may honestly have no être verb at all.** It
    was "the walk reached a verb taking être", which C1 failed with 2 of 428 and C2 with 0 of 6 — a
    healthy deck reported as broken. Made proportional it would go quiet on C2 exactly when the
    auxiliary machinery could be broken and nothing would say so, so: walked one → assert it agrees with
    the deck; **many and none walked** → fail; some but few → read off the deck file; **NONE IN THE DECK
    AT ALL** → assert the deck teaches no verb from a closed list of 19 motion verbs, which is the only
    reading under which zero is the truth rather than a bug.
    Two harness notes: the grade button is `.grade[data-g='easy']` and NOT `.grade [data-g='easy']`, since the class
    and the attribute are on the same element and the descendant form silently clicks nothing and reports
    a deck with no nouns, verbs or adjectives in it; and **a walk this long levels the reader up**, which
    opens an artefact chest over the card and swallows the click on Reveal.
  · **A SEVENTH DECK THAT IS NOT A SEVENTH LEVEL** (`.claude/delf/phraselist.py`,
    `decks/French-Phrases.folio-deck.json` — **402 expressions / 804 cards**, Aug 2026, on request).
    The six levels teach WORDS and a set expression is not one: `avoir` is on the A1 page, `faim` is
    on the A2 page and `avoir faim` is on neither, because a vocabulary syllabus enumerates the
    vocabulary and leaves the reader to assemble it — which for `avoir faim`, `tout de suite` and
    `du coup` is exactly what cannot be done. It is built by the same six stages with the FIRST one
    swapped, and `run.py` branches on whether the level has a `LISTS` row rather than on its name.
    **IT TAKES EXPLICIT ROWS RATHER THAN AN `EXAM` ENTRY**, which is the whole of why it is a
    separate thing: `EXAM['phrases'] = 'DELF'` would title it "DELF PHRASES — French", naming a
    diploma that has no such paper. `TITLES`/`DECK_IDS`/`DECK_FILES` are given it directly, `BELOW`
    excludes all six, and `combine.py` keeps `LEVELS` and `PARTS` apart for the same reason — every
    per-level figure walks the first and every per-subdeck one the second, so the title cannot ask
    `EXAM` for a row that does not exist.
    Six things it settled are worth carrying.
    **THE CANDIDATES ARE THE DICTIONARY'S OWN MULTI-WORD ENTRIES**, which is `phrasepick.js`'s
    precedent: a lexicographer has already judged that a string is worth an entry, and that is better
    evidence than any rule about shape or length. **`noun` IS THE FIRST CUT AND IT IS 12,177 OF THE
    66,000** — a French compound noun is a WORD wearing a space (`pomme de terre`, `chemin de fer`,
    `homme d'affaires`), met with a gender and an article rather than explained as an expression, and
    it is what the six levels are already for.
    **THE FILTERS RUN PER SENSE AND NOT PER ENTRY**, and the difference is 14 ordinary expressions:
    `ça marche`, `au fond`, `sans faute` and `péter un câble` each carry a "used other than
    figuratively or idiomatically" sense beside the idiom, so testing the ENTRY throws the idiom away
    to remove a sense nobody would card.
    **…AND A FILTER THAT RUNS ONLY AT SELECTION TIME DOES NOT REACH THE CARD**, which is the quietest
    fault of the batch. `phraselist.py` chose which ENTRIES to teach and `build_deck.py` then read the
    record again and merged whatever senses it found — so every sense refused here arrived on the card
    anyway, and **`ça marche` shipped glossed "OK; see ça, marche"**, which is the literal reading the
    filter exists to drop. It bit on all ~36 entries a per-sense rule saved, i.e. on exactly the
    entries the rule was written for. The surviving senses are written to `phrase-senses.json` and
    read back, so the card shows what was actually judged usable; they are READ rather than written,
    so they are kept apart from `AUTHORED`. **Ask where a filtered value is next read from**, not only
    whether the filter is right.
    **AND A CLASS OVERRIDE HAS TO REACH `FORCE_POS`, NOT ONLY THE ENTRY.** `pick_pos` falls back to
    the dictionary's own record when the class asked for has none — its `une` rule, stated in its own
    docstring — so of the four hand-set classes `au fait` came out right (it HAS an adverb record) and
    **`en dehors` went on printing "adjectival phrase" over "outside"** (it has none), with the
    corrected gloss sitting under a contradicting label. The class and the meaning are one decision
    and are written in one row.
    **THE FREQUENCY MEASUREMENT IS A SORT KEY AND NOT A VERDICT, because substring counting
    over-counts a phrase that is also an ordinary word sequence**: `pas que` scores 2,692 and is
    almost entirely `je ne pense pas que`, `de par` matches *de partir* and *de parler*, `être à`
    matches every *est à* in the corpus. So everything above the floor is READ — `pick-images.js`'s
    rule, that the machine ranks and a reader chooses — and **64 of 466 are refused under four
    declared reasons** (`DROP` in phraselist.py: an ordinary run of words or a fragment of a longer
    phrase; a first dictionary sense that is not the ordinary one; a person-variant or near-synonym
    of one already kept; a whole sentence; an inflected form). **A DROP THAT MATCHES NOTHING IS
    REPORTED**, since a refusal stops working silently the day Wiktionary re-glosses an entry and the
    expression simply comes back.
    **ITS ONE REAL LIMITATION IS THE CONJUGATION AND IT IS MEASURED RATHER THAN ASSUMED**: kaikki
    carries **zero inflected forms for every multi-word verb** on the shelf (`avoir faim`, `faire la
    vaisselle`, `prendre soin`, `laisser tomber` — all ten probed), the paradigm belonging to the head
    verb, which the levels already card in full. Composing thirty forms out of a lemma the entry never
    names is the composition this pipeline refuses everywhere else, so there is no table and the
    deck's own first screen says so.
    **THE TWO `build_deck.py` GATES KEY ON THE DECK, NOT ON `e['phrase']`** — and that is the
    shared-stage discipline biting exactly as it is meant to. **63 entries across the six levels carry
    that flag** (`salle de bains`, `par exemple`, `mettre en cause`), so keyed on it, adding this deck
    would have relabelled all 63 and changed six shipped files as a side effect of adding a seventh.
    On a word list `salle de bains` is a noun with a gender and an article and `noun` is the right
    label; here the distinction between a word and an expression is the point. (The paradigm gate was
    provably inert on those seven multi-word verbs — every one is already 0 characters — and is gated
    anyway, or a level that later gained one WITH forms would lose its table in silence.)
    **THE SIBLING DIFF THEN FOUND ONE REGRESSION AND ONE FIX, which is why it is read rather than
    glanced at.** The regression: rewriting `EX_NOTE`'s empty branch from `' '` to `''` closed
    "colour." up against "Word list:" on **every deck the corpus illustrates entirely**, which is A2
    and nothing else — a lost space, invisible except in a byte diff. The fix: adding `prep_phrase`
    and `proverb` to `POS_NAME` corrected **C2's `en filigrane`**, which had been printing the raw
    internal token `prep_phrase` as its class since the day it shipped, the table's `.get(pos, pos)`
    fallback returning the key. A shared-stage change reaches decks nobody is looking at, in both
    directions.
    **AND A DESCRIPTION MUST NOT BE BUILT ON A DECK IT IS NOT FOR.** Both paragraphs were plain
    assignments, so each was evaluated on every level: the levels' one asks `EXAM[LEVEL]` and died on
    the phrases build, and the phrases one calls `_and(_ref_bits)` on an empty list and **broke all
    six**. Both are conditional expressions now, so only the branch that is used is built. Its own
    prose also produced the **one-is-not-a-plural fault for the third time in this file** — "the other
    1", "The 1 adjectival phrases", "16 because it is the dictionary's first sense is not…" — so the
    refusal list is worded as `N for <noun phrase>`, a form that cannot make the mistake at any count,
    and the singular cases are branched.
    **`check-phrases.js` is its browser half and is a file of its own**, because `check-delf.js`'s
    stated premise is that its assertions are about FRENCH rather than about a level — and this deck
    breaks it, having none of the article, elision, paradigm or agreement that checker exists to
    verify. Its sharpest assertions are NEGATIVE and run on every card walked: **no article** (the
    fault `pos_hint` would produce, and `le à peu près` is ungrammatical French rendered beautifully)
    and **no paradigm**, the latter checked against the description promising there is none, since
    those fail in opposite directions. It reads the deck's name, its refusals and its written-in
    meanings out of `delf_level.py` and `phraselist.py` rather than carrying copies.
  · **WHAT CONJUGATES IS SET IN BOLD RED, AND WHICH CHARACTERS THOSE ARE IS MEASURED**
    (`common_prefix` / `mark_tail` / `.uc-cj-e`; Aug 2026, on request — the expressions deck
    deliberately keeps no conjugation at all, see the bullet above). The obvious implementation is a
    table of `-e -es -e -ons -ez -ent` per group and it is wrong twice over: it says nothing about
    the second and third groups, and it is silent about the verbs a learner most needs warning of,
    whose STEM moves as well. What is actually being asked is *which characters differ within this
    tense*, and that is arithmetic — **the longest prefix all six forms share is the part that does
    not change**. It lands on the textbook analysis wherever there is one (`parl|e … parl|ons`,
    `parler|ai … parler|ont`) and tells the truth where there is not: `être` shares no prefix across
    suis/es/est/sommes/êtes/sont, so the whole of every form is marked, which is exactly the fact
    about `être` a beginner needs. Measured **per tense**, not over the verb — a stem constant
    through the présent may still move in the futur (`je b|ois` against `nous b|uvons`, `j'ir|ai`).
    Five things about it.
    **THE PREFIX IS CAPPED SO EVERY FORM KEEPS AT LEAST ONE MARKED CHARACTER, and that is a repair
    rather than a tidying rule.** The `-ger` verbs soften their stem before `-ons`, so `mange` is a
    PREFIX of `mangeons` and the raw common prefix of the présent came out as the whole of `je
    mange` — that row marked nothing at all while `nous mange|ons` marked three letters, which read
    beside `je parl|e` on the next card is a contradiction rather than an oddity. One character back
    gives `mang|e … mang|eons`, the textbook analysis, and the cap can only bite where one form is
    spelled inside another: measured over all six decks, **8 verbs move and every one is `-ger`**.
    **THE PASSÉ COMPOSÉ MARKS THE AUXILIARY AND NOT THE PARTICIPLE**, which is the tense's whole
    point — `je SUIS allé(e)`, `nous SOMMES allé(e)s` — and because avoir and être are suppletive the
    mark covers all of it.
    **ONE MECHANISM SERVES EVERY ROW BECAUSE THE MARK IS A TAIL**: the subject and any pronominal
    pronoun are composed onto the FRONT and elision only ever shortens the pronoun, so the ending is
    always the last *n* characters of whatever `finite` returns, whatever stands before it. The
    imperative is the one exception — its pronoun is composed onto the END, hyphenated — so there the
    form is marked before `-toi` is appended.
    **THE COLOUR IS `var(--zh, #C8453C)`, the one the tense heading already uses**, so the panel gains
    no new colour; keep the hex fallback, a deck file being readable outside the site.
    **AND IT EXPOSED A SHIPPED FAULT NOTHING ELSE HAD SEEN**: `se souvenir` was rendering **"je me me
    souviens"** and **"souviens-toi-toi"**. An essentially pronominal verb carries its pronoun inside
    its own dictionary forms (`me souviens`, `nous souvenons`) — which `examples.py` already records
    and strips for its own indexing — and `finite` was composing a second one onto the front. The
    doubled word had been on the card for months; the red run is what made it legible, and the common
    prefix of `me souviens … nous souvenons` being EMPTY is what made it impossible to ignore.
    Stripped in `conj_rows` and `imperative_rows`, gated on `reflexive`, which is as narrow as the
    evidence: **one card in 7,648**.
  · **THE GLOSS SCAN, AND WHY A COLON IS A DECLARED TABLE RATHER THAN A RULE** (`COLON_GLOSS` /
    `colon_fix` / `colon_sweep`; Aug 2026, on request to scan the deck for mistakes — and the scan ran
    over all seven, since the pipeline is shared). Wiktionary uses a colon for two opposite things:
    `<usage label>: <gloss>` (`Sports game: away`, `Exclamation of surprise…: crap!`) and
    `<gloss>: <definition>` (`friction: the rubbing`, `A hardware store: a store where…`). `head_of`
    already carries a colon branch and it is **gated on the part running past `MAX_LINE`**, so it
    never sees any of these, a label being short. **Ungating it was tried and is worse than useless**:
    of the twelve it gets four right, five wrong, and leaves two shipping whole through the no-meaning
    fallback. Length does not separate them either — `Sports game: away` and `all the way: totally`
    have identical head lengths and opposite answers. So each was read once and written down, which is
    this file's own answer at this size, and **any colon line NOT in the table is REPORTED on the
    run**. A thirteenth row DROPS rather than replaces: `dernier` was carding "see: ce dernier" as a
    fourth meaning — a cross-reference to an entry the deck has not got. **The staleness check lives in
    `combine.py`, not in `build_deck.py`**: a level carries only some of the thirteen, so a per-level
    check fires every run and becomes a warning nobody reads, where the combined build has all seven
    decks in hand and can see both failures at once — a KEY still on a card (the fix did not fire) and
    a replacement on no card (the source has reworded it).
  · **FOUR MORE LIST DEFECTS THE SAME SCAN TURNED UP, and each was found by a sweep rather than by
    eye.** **A PLURAL PRINTED AS THE HEADWORD RENDERS AS UNGRAMMATICAL FRENCH** — sweeping every card
    for an article disagreeing in number with its noun found `le vœux`, `l'achats`, `le gants`,
    `le degrés` and `le confins`. They divide on the test `déchets` is already here on: a wish and a
    purchase are made one at a time, so those are slips and are repaired; gloves come in pairs and
    `aux confins de` is the only way the last is ever said, so those go to `PLURAL_ONLY`. **A LIGATURE
    TYPED AS `oe` SURVIVES THE NO-RECORD TEST WHERE WIKTIONARY DOCUMENTS THE `oe` FORM** — which is
    why `manoeuvre` and `écoeurant` were caught and `voeu` was not: it HAS a record, the
    pointer-follower resolves it to the real word's gloss, and C1 shipped `le vœu` and `le voeu` with
    identical meanings. Normalise the ligature and read the collisions; the no-record sweep cannot see
    it. **A PLURAL ALSO HIDES A CROSS-LEVEL DUPLICATE**: `words_below()` excludes by EXACT spelling,
    so B1's `degrés` slipped past A2's `degré` — repaired, B1 ships 895 rather than 896, and there is
    no back-fill, because this pipeline teaches the page rather than selecting a quota from it. **AND
    A LEADING RECORD MAY BE A VERB THE LANGUAGE DOES NOT USE ALONE**: Wiktionary leads `souvenir` with
    the verb, so B1 was teaching a bare `souvenir` nobody says AND teaching A2's `se souvenir` a
    second time under another spelling; `FORCE_POS` makes it the noun and the two cards are two
    different words again.
  **Re-running it must reproduce the shipped deck byte for byte, ON EVERY LEVEL AND ON THE EXPRESSIONS
  DECK**; that is the check to
  make after any edit, since every fault above is silent — and the stages are SHARED, so a change made for
  one level has to be run across the OTHERS and its diff READ rather than glanced at. That is what found
  the `la amie` elision and the five reflexive senses on A1's bare verbs (seven A1 cards changed while A2
  was being built), it is what the near-duplicate rule's 111 changed cards were read out of while B1 was,
  and it is what turned B2's three description faults into fixes for A2 and B1 as well. **Every one of
  those was an improvement except the one named above**, which is the point of reading them: a
  shared-stage change reaches decks nobody is looking at. **Diff the CARDS and the DESCRIPTION
  separately** — B2's fixes changed two levels' prose and not one card, and a whole-file md5 cannot tell
  that from a level whose cards have quietly moved. Verified across `PYTHONHASHSEED`. **And rebuild the
  COMBINED file with them** (`combine.py`), or it goes on carrying the previous build's cards under the
  current description. The browser checkers are `check-delf.js <level>` for a level,
  **`check-phrases.js`** for the expressions and `check-combined.js` for the combined file. Not part of
  the site.
- `.claude/ukbi/` — the generator behind the UKBI Indonesian decks: **level 1
  `UKBI-1-Terbatas-Indonesian.folio-deck.json`** (500 notes / 1,000 cards, 533 KB), **level 2
  `UKBI-2-Marginal-Indonesian.folio-deck.json`** (750 / 1,500, 789 KB), **level 3
  `UKBI-3-Semenjana-Indonesian.folio-deck.json`** (1,000 / 2,000, 925 KB), **level 4
  `UKBI-4-Madya-Indonesian.folio-deck.json`** (1,500 / 3,000, 1.09 MB), **level 5
  `UKBI-5-Unggul-Indonesian.folio-deck.json`** (2,000 / 4,000, 1.10 MB), **level 6
  `UKBI-6-Sangat-Unggul-Indonesian.folio-deck.json`** (2,500 / 5,000, 1.14 MB) and **level 7
  `UKBI-7-Istimewa-Indonesian.folio-deck.json`** (1,500 / 3,000, 618 KB — smaller than the level below it,
  for the reason its own bullet gives).
  `python3 .claude/ukbi/run.py [--level 1..7] [--no-fetch]`. Six stages, caching its
  corpora in `.claude/ukbi-cache/` (~180 MB, gitignored). PYTHON, like `.claude/dele/` and `.claude/goethe/`
  and unlike every other helper here, for the same reason: a further level is a re-run rather than a rebuild.
  **ONE LEVEL PER RUN** (`ukbi_level` reads the level once, at import), and a level is taught on top of the
  ones below it, read out of the SHIPPED deck files so they cannot drift — the DELE arrangement exactly.
  **THE LEVELS ARE NUMBERED FROM THE BOTTOM, which is the opposite of how UKBI prints them.** UKBI reports a
  *peringkat* I–VII from the TOP down, so Istimewa is I and **Terbatas is VII, score 251–325, the lowest**. A
  learner meets them the other way up, so the decks are numbered in the order they are studied and the
  predicate's own name is carried in the title. Level 1 is Terbatas, level 2 Marginal (peringkat VI, score
  326–404), level 3 Semenjana (V, 405–481), level 4 Madya (IV, 482–577), level 5 Unggul (III, 578–640),
  level 6 Sangat Unggul (II, 641–724) and level 7 Istimewa (I, 725–800). **All seven are built.**
  **A PREDICATE'S NAME MAY BE TWO WORDS AND A FILE NAME MAY NOT HAVE A SPACE IN IT** — the first five are
  single words, so `DECK_FILES` went five levels before Sangat Unggul wrote `UKBI-6-Sangat Unggul-….json`,
  a name that works on disk, breaks any shell command typed without quoting it, and is what every reader
  who saves the deck gets. The hyphen is applied to all seven, which leaves levels 1–5 byte-identical
  because a name with no space cannot change.
  **A LEVEL'S SCOPE IS ITS OWN DESCRIPTOR, AND THE DESCRIPTOR EXCLUDES AS WELL AS INCLUDES.** Terbatas is
  "keperluan **sintas**", survival, so `SECTIONS_1` is greetings, numbers, days, food, money, the body and the
  closed classes. Marginal is everyday and community life **and its official descriptor says outright that a
  candidate at this level cannot yet use Indonesian for professional or academic purposes** — so `SECTIONS_2`
  is feelings, the home, clothes, errands, travel, narration and opinion, and deliberately carries no office,
  no contract and no essay vocabulary. **Semenjana is where that door opens**: "keperluan **keprofesian yang
  tidak kompleks**", non-complex professional purposes, so `SECTIONS_3` is precisely the list level 2 refused
  to write — a job, a rota, a colleague, a payslip, a bank, a government counter — plus the abstract and
  connective vocabulary a paragraph is built out of. **The same list is wrong one level down and right one
  level up, and the descriptor is what says which**, which is why the two section headers should be read
  together. `keilmiahan` (academic) is still shut at Semenjana, so there is no `hipotesis`, `metodologi` or
  `analisis` in it either.
  **MADYA IS THE FIRST LEVEL WHOSE DESCRIPTOR ADDS NO NEW DOMAIN, AND THAT HAD TO BE READ RATHER THAN
  ASSUMED.** Every step so far opened a door — survival, then community life, then the non-complex
  professions — so the obvious reading of a fourth level is a fourth subject area. Madya's descriptor says
  something else: "berkomunikasi untuk keperluan sintas dan kemasyarakatan **dengan baik**", the SAME
  purposes as the levels below, done WELL, with the professional ones still short of the complex end and
  academic communication still out of reach. So `SECTIONS_4` is not a new field but the vocabulary that
  doing the old ones well takes — the shape of an organisation, how work is planned and checked, a formal
  letter, a meeting, rules and what breaks them, and above all the `ke-…-an` abstractions and the hedges a
  formal sentence is built out of. **Ask what the descriptor's ADVERB is doing before writing the next
  inventory**; here it is carrying the whole of the difference.
  **AND UNGGUL'S DOOR IS NAMED BY THE LEVEL BELOW IT, IN AS MANY WORDS.** Madya's descriptor ends "tetapi
  masih mengalami kendala dalam hal keprofesian yang **kompleks**"; Unggul's says the candidate "tidak
  terkendala … untuk keperluan keprofesian, baik keprofesian yang sederhana **maupun kompleks**". So `SECTIONS_5`
  is not a subject area chosen here — it is the one thing the level below states it cannot do, lifted:
  contracts, the papers a complex job turns on, accounts and the money markets, what a company is and who
  governs it, courts, specifications, the standard Indonesian of computing, and the vocabulary of integrity
  and its failures. **Read the next level's descriptor against the current one's LIMIT clause**; three times
  now the two have fitted together exactly.
  **AND SANGAT UNGGUL'S DOOR IS OPENED BY AN ADJECTIVE.** Its descriptor grants survival, social and
  professional purposes outright and then says "Untuk kepentingan akademik yang **kompleks**, yang
  bersangkutan masih memiliki kendala" — and **constraining the HARD case is a statement that the ordinary
  one is within reach**, so this is where `keilmiahan` begins and only its hardest end waits for Istimewa,
  whose descriptor is the first to list academic purposes among the things with no kendala at all. So
  `SECTIONS_6` is the STUDENT'S register rather than the professor's: doing a piece of research and writing
  it up, the parts of a paper, the apparatus of citation, the university and its degrees, argument and the
  evidence under it, the words for judging a claim, and the language a test of Indonesian uses to talk about
  Indonesian — not the internal terminology of any one field. **Much of the obvious list had already been
  taught**: `penelitian`, `hipotesis`, `teori`, `metode`, `analisis`, `sampel`, `populasi` and some seventy
  more arrived on frequency alone at lower levels, because film dialogue talks about science. What is left
  for an inventory at this level is the part a corpus of SPEECH never says aloud — the apparatus.
  **AND ISTIMEWA'S DESCRIPTOR IS THE ONLY ONE OF THE SEVEN THAT NAMES NO LIMIT AT ALL**, which is where the
  chain of "read the next level's descriptor against the current one's LIMIT clause" finally stops: it says
  the candidate "memiliki kemahiran yang **sempurna**" and lists survival, social, professional AND
  `keilmiahan` among the purposes with no kendala whatever, where every level below names something it
  cannot yet do. So there is no door left for `SECTIONS_7` to open, and the level is not a subject area but
  a REGISTER — the derived morphology a formal Indonesian sentence is built out of (`-isme`, `-itas`,
  `ke-…-an`, `peN-…-an`), the doctrines and disciplines a scholarly argument names, argument itself and the
  language used to talk about language, and the administrative and legal vocabulary. **Ask what is left when
  a descriptor states no limit**; the answer here is the WORDS rather than the topics.
  **THE ACADEMIC DOOR IS THE LAST ONE, AND THE MADYA HEADER GUESSED IT WRONG.** That header said `keilmiahan`
  "is Unggul's", written while building level 4 from the reasonable assumption that a ladder opens one door
  per rung. The board's own descriptors say otherwise: Unggul's does not mention `keilmiahan` at all, and
  **Sangat Unggul's — one rung higher still — says "Untuk kepentingan akademik yang kompleks, yang
  bersangkutan masih memiliki kendala"**. Academic communication opens at Istimewa. The wrong sentence is
  left in `supplement.py` with the correction under it, because its shape is the one to remember: **a claim
  about the NEXT level, made while writing the current one, from a pattern rather than from the source.**
  Read the descriptor of the level you are naming, not the one you are building. **IT WAS THEN MADE A SECOND
  TIME, IN THE VERY NEXT HEADER, BY SOMEBODY WHO HAD JUST CORRECTED IT** — level 5's said writing about the
  literature "is Istimewa's" — so it is a pattern with a structural cause rather than a slip: an inventory is
  written by deciding what the level does NOT cover, and the shortest way to say that is to name the level
  that does, which is the one thing not yet read. Both wrong sentences are left in `supplement.py` with
  their corrections under them.
  `supplement.LEVELS` maps the level to its inventory and `supplement.sections()` reads it; a level with no
  inventory contributes nothing rather than falling back to another level's, which would fill Marginal with
  words level 1 has already taught.
  **THE ONE FACT THE WHOLE GENERATOR RESTS ON: UKBI PUBLISHES NO VOCABULARY LIST.** It is a proficiency test
  rather than a syllabus — it reports a score and a predicate, and the Badan Bahasa publishes descriptors of
  what a candidate at each predicate can DO, never the words they should know. Neither does BIPA:
  Permendikbud 27/2017 sets the Standar Kompetensi Lulusan in competences. **This was checked before anything
  was built**, because the alternative was to imply an official list that does not exist. That is the
  substantial difference from the siblings — the Goethe decks read the exam board's own printed Wortliste and
  the DELE decks the Instituto Cervantes' Plan curricular, so in both the board chooses the vocabulary and the
  generator only reads it. **Here the generator chooses it, and the deck's own description says outright that
  it does.** What keeps that from being arbitrary is that both inputs are stated: the level's SCOPE is UKBI's
  own descriptor — Terbatas is "berkomunikasi untuk keperluan **sintas**", survival communication — which is
  what `supplement.py` is an inventory of, and the ORDER and the fill are corpus frequency. **Ask whether an
  exam board publishes a word list before assuming the sibling's shape transfers.**
  What it settled is below, and there is **deliberately no count in front of it** — this bullet said
  "fifteen things" while carrying eighteen, having been written at level 2 and added to at every level
  since. A tally in prose is a tally nobody re-counts; the findings are the thing.
  **A DESCRIPTION IS PROSE, AND PROSE WRITTEN ONCE FOR ONE LEVEL GOES ON BEING PRINTED FOR EVERY LEVEL AFTER
  IT.** `emit.py` was written for level 1 and templated only the NAME and the NUMBERS, so **levels 2 and 3
  shipped calling themselves "the first and most basic level of the UKBI", saying each was "the lowest of
  them", and quoting Terbatas's descriptor verbatim under their own names** — "untuk keperluan sintas",
  survival, against predicates whose own descriptors say something else entirely — over a topic list that
  was level 1's inventory and an example of phrases (`terima kasih`, `apa kabar`) that those decks do not
  contain. Nothing threw and every count was right. **A deck's description is the one place that has to state
  true things about the deck**, so every claim in it now comes from `SCOPE` in `ukbi_level.py` (rank, the
  short verbatim phrase of that predicate's own descriptor, its plain-English reading, and what that level's
  inventory actually covers) or is derived from the built deck — the inventory/frequency split is carried
  through `wordlist.json` because it moves from 378-of-500 to 200-of-1,000, and the phrase examples are the
  deck's own first four. **Templating the name is not the same as templating the claims.**
  **AND A DERIVED SENTENCE HAS TO SURVIVE ITS OWN QUANTITY GOING TO ZERO**, which is the same lesson one
  level down. The phrase sentence is built from a count and a sample, and at level 6 the count was 0, so the
  deck shipped saying "0 of the entries are phrases rather than single words —  — which a list of single
  words cannot see at all": a sentence about nothing, with an empty sample between two dashes. It is gated
  on there being phrases now. **Read a derived clause at both ends of its range**, not only at the value the
  level in hand happens to have.
  **THE AFFIX FAMILY IS INDONESIAN'S ANSWER TO A PARADIGM, AND IT IS THE WHOLE POINT OF THE CARD.** The
  siblings spend their card on morphology a learner cannot guess — German's gender and plural, Spanish's
  conjugation, Mandarin's character breakdown — and Indonesian has none of that: no gender, no agreement, no
  conjugation, no tense. What it has instead is a family of derived words around a root, so the card carries
  `lihat` / `melihat` / `dilihat` labelled **root, active and passive** (67 of level 1 and 89 of level 2; 42
  and 63 show a passive, which Indonesian uses far more readily than English). **The forms are READ from the
  dictionary and never derived by stripping affixes**, because `meN-` assimilates and swallows the root's
  first consonant: `tulis` → `menulis` but `nanti` → `menanti`, and no rule can undo that without a
  dictionary.
  **THE RELATION IS OFTEN IN THE TAGS RATHER THAN IN THE WORDING, and reading only the wording left a fifth
  of the rows with a cell that had no label against it** (21 of level 1's and 10 of level 2's, measured).
  Wiktionary states a VERB's relation in the gloss — "active of lihat" — and nearly everything else's in the
  sense's own tags: `terbaik` is glossed "superlative degree of baik: best" and TAGGED `superlative`, `sebaik`
  `equative`, `pergilah` `jussive`, `raja-raja` `plural`, `siswi` `feminine`. **An unlabelled cell is worse
  than no cell**: it asserts that the word is a form of the headword without saying which form, on a row whose
  whole purpose is to name the relation. So the tags are read first, the gloss second, and anything still
  unnamed is dropped from the row and REPORTED rather than printed bare.
  **TWO KINDS OF RELATIVE ARE REAL AND ARE STILL NOT SHOWN** (`FORM_HIDE`). A **colloquial respelling** —
  `udah` for `sudah`, `malem` for `malam`, `dapet` for `dapat` — contradicts the deck's own promise on the
  card itself, and is not an affix family at all: `udah` is not derived from `sudah` by any affix, it is the
  same word with a syllable knocked off. And **the word plus a possessive clitic** — `hatiku`, `hatinya`,
  `sakitnya` — is mechanical and reversible with no sound change, which is why `read_frequency` already strips
  it; `hati` was showing four cells, three of them `hati` with a pronoun on the end. **Hidden from the ROW,
  not removed from the FAMILY**: freeing them would promote each to a headword whose only gloss is a
  cross-reference.
  **A PARADIGM ARGUMENT LIST IS NOT PURELY LABEL/VALUE.** The id-adj template writes `superlative | paling
  aman | or | teraman` — the periphrastic superlative as a proper pair, then the literal word `or`
  introducing the affixed alternative — and id-verb writes `used in the form | menyanyi`. Read as pairs those
  label `teraman` "or" and `menyanyi` "used in the form", and both reached the card. A label the file cannot
  NAME is now held back and the sense's own tags and gloss are asked instead (superlative; active of nyanyi);
  an unrecognised label is still used where nothing else names the form, and is reported when it is.
  **THE CLITICS ARE THE ONE THING THAT CAN SAFELY BE STRIPPED**, and doing it recovers a fifth of the
  frequency list: Indonesian writes `-ku`, `-mu`, `-nya` onto the word, so a surface list counts `ayahku`
  apart from `ayah` and 342 of the top 1,500 are absent from the dictionary largely because of it. Those are
  pure suffixes with no sound change, which is exactly what the prefixes are not.
  **THE FAMILY RELATION POINTS BOTH WAYS IN THE SOURCE, so it is a UNION-FIND and not a walk.** `mengirim`'s
  paradigm names `kirim` as its base and `kirim`'s own entry is glossed "infinitive, imperative and colloquial
  of mengirim" — a two-element cycle — and chains occur too (`kata` → `katakan` → `mengatakan`). Union-find
  flattens both without having to decide which arrow is true, and **the headword is then the family's most
  frequent member**, which is what stops the deck teaching `erti`: it is used nineteen times in the corpus
  against 47,243 for `mengerti`, and it is Malay rather than Indonesian.
  **AN AFFIXED VERB OFTEN HAS NO ENTRY OF ITS OWN AND ITS ROOT DOES**, which is a fact about Wiktionary's
  Indonesian coverage rather than about the language, and it bites hardest on an intermediate inventory: of
  level 3's list, `mengurus`, `menyetujui`, `membandingkan`, `menyebutkan`, `mengharapkan`, `membutuhkan`,
  `mengalami`, `menghadapi`, `melibatkan`, `melapor` and `menandatangani` are all absent while `urus`,
  `setuju`, `banding`, `sebut`, `harap`, `butuh`, `hadap` and `lapor` are all there and correctly glossed.
  The affixed form is how a learner meets the verb and the root is what the dictionary can teach, so the
  inventory is written in roots — and the ones whose root teaches something ELSE are dropped rather than
  substituted (`alam`/`alami` for `mengalami` is nature and natural, not to experience). Level 2 hit the same
  wall and it is a standing step: **write the inventory, run it, and read the "the dictionary does not carry"
  report before believing the list.** Three more went for the sibling reason — `satpam` is glossed only as
  the expansion of its own abbreviation, `diskon` is tagged colloquial, `rawat` says only "basic form of
  merawat" — which is `build_deck.py`'s meaning test doing its job at the inventory rather than at the card.
  **A RELATION IS QUALIFIED AS OFTEN AS NOT, and a family that fails to form is INVISIBLE.** `menjaga` is
  glossed "**transitive** active of jaga", and a pattern anchored hard at the start misses it — so the word
  never joins its root's family, gets no forms row, and gets no MEANING either, since the meaning lives on the
  root. It was found from the other end, by `build_deck.py` refusing to write a card for a common verb: a word
  whose family fails to form simply ships alone, looking exactly like a word that has no relatives.
  `build_deck.py`'s own pattern already allowed the modifier and the two had drifted apart.
  **…AND WIDENING IT THEN BUILT FALSE FAMILIES, which is the other half of the same lesson.** With an
  optional leading word, "**syllabic** abbreviation of kepala bagian" matched, and `kabag` (a head of
  division) was carded as a form of `kepala` (head) — with `warnet` under `warung`, `miras` under `minuman`
  and `toserba` under `toko`. Two fixes, and both are statements about what an affix family IS. **Inflection
  only**: an abbreviation, an ellipsis, a contraction and an alternative spelling are LEXICAL VARIANTS rather
  than morphological forms, and the row exists to show a root and what is derived from it by prefix and
  suffix. And **a multi-word target is taken whole or not at all**: reducing "kepala bagian" to its first word
  invents a kinship that does not exist.
  **A WORD WITH ANY LIVE ENTRY OF ITS OWN IS A HEADWORD, and that single line saves `mereka`.** It carries
  two entries — the third-person plural pronoun, and a verb form glossed "active of reka" — and a rule that
  merged on the existence of any derived entry would have filed **"they" under the root "to devise"** and
  deleted the commonest plural pronoun in the language from a beginners' deck. Measured: 128 of the top 1,500
  carry a derived reading and eleven of those also carry an unrelated live one.
  **`informal` AND `colloquial` ARE NOT THE SAME TAG AND MUST NOT BE TREATED ALIKE.** UKBI tests bahasa baku,
  so the nonstandard family is dropped (`nggak`, `gue`, `banget`, `dimana`) — but `kamu` and `aku` are tagged
  `informal`, which is the familiar register OF the standard language, and they are the first and thirty-first
  commonest words there are. The blanket rule took `kamu`, `aku`, `saya` and `Anda`; the narrow one drops 584
  words of 50,000 and keeps all four. **And it must read EVERY sense, not the first**: `bumi`, `kereta`,
  `pasukan`, `ratu` and `tangkap` all open on an alt-of and carry the ordinary meaning further down.
  **`Anda` IS CAPITALISED AND THAT IS NOT A TYPO** — the dictionary files the lowercase form as an
  alternative letter-case spelling — so the frequency lookup is case-insensitive or the standard formal
  pronoun ranks on nothing. It also earns `Minggu` (Sunday) and `minggu` (week) as two separate cards.
  **THE SAME EXCLUSION IS RIGHT AT ONE STAGE AND WRONG AT THE NEXT.** `select.py` excludes proper nouns —
  2,153 of the dictionary's entries are names and a frequency-ranked pool fills with them — and carrying that
  into the GLOSSING stage refused **all twelve months and two days** for having no meaning, Wiktionary filing
  `April`, `Mei` and half the week as names. A survival deck with no word for Monday is the exact failure
  `supplement.py` exists to prevent, reintroduced one stage further down. Choosing and glossing are different
  questions; ask which one a filter is answering.
  **A WORD CAN INHERIT A FREQUENCY FROM A FORM THE DECK REFUSES TO TEACH, and this has now happened three
  times.** `tau` is the nineteenth of the top 19,125 words of the corpus, because in speech it is the
  colloquial form of `tahu`, "to know" — and that reading is tagged colloquial and correctly refused, which
  leaves the entry Wiktionary files for the **Greek letter Τ** standing alone. So level 2 taught a Greek
  letter on the strength of an Indonesian colloquialism's frequency. It is the `kan` / `ku` / `mu` / `nya`
  shape already in `EXCLUDE` — "the frequency belongs to a form the deck does not teach and the surviving
  sense does not deserve it" — and there the answer was to widen `LETTER_NAME` rather than name `tau` by hand,
  which leaves it with no meaning at all and lets the pool's own meaning test refuse it. Swept before it was
  widened: **31 senses are newly dropped and every one defines a letter of an alphabet**; `es` (ice) and `ha`
  (an interjection) both carry a letter sense and both keep their real meanings, which is why the sweep was
  the check rather than the pattern.
  **A CARD MAY BE DEFINED IN INDONESIAN, AND 62 OF THEM WERE** (Aug 2026, on request: "check the deck
  for any mistakes or inconsistencies"). Wiktionary writes `synonym of paham` where it means "to
  understand", and `synonym of` is **not a form-of relation** — the target is a different lexeme rather
  than a member of this word's affix family — so `REL`, which drops `active of` and `plural of`, never
  saw it and the pointer shipped as the meaning. **Eighteen of the 62 carried no English anywhere at
  all**: the reader was shown a word they do not know and told it means another word they do not know
  (`perkosaan` → "synonym of pemerkosaan"). Every count was healthy throughout and the cards were well
  formed. **TWO THINGS ARE READ RATHER THAN COMPOSED, in this order**: the dictionary usually writes
  the meaning into the gloss itself — `synonym of beri (“to give”)` — and that parenthetical IS the
  English, sitting two characters from where it was needed; where there is none, the TARGET is looked
  up and its own glosses are taken, one hop. Where neither works the word is refused, which is how
  `momod` (an internet clipping of `moderator`) left the decks. **THE PARENTHETICAL CLOSES WITH TWO
  CHARACTERS**, `”` and `)`, and a pattern allowing one matched nothing at all — silently, since the
  caller then falls through to the lookup and usually finds something. **A cross-reference may also be
  a CLAUSE inside a gloss** (`a dance; synonym of tari`), where the tail is cut and the meaning kept —
  and **`see` is not one of the words that may introduce such a tail**, which it was for a run:
  `arrivederci` is glossed "farewell, goodbye, see you later" and cutting there leaves a greeting with
  no greeting in it. Swept over the whole dictionary, allowing `see` touches eleven glosses and gets
  two wrong.
  **THE TWO WORST CARDS IN THE STACK WERE BOTH ON LEVEL 1 AND BOTH MEANT "TO GIVE".** `memberi` was
  glossed **"berry (a small succulent fruit, of any one of many varieties)"** and `memberikan`
  **"have a fish; full of fish"**, on a 500-word survival deck. Two independent causes, and each is a
  general rule:
  · **A SENSE THE DICTIONARY ITSELF CALLS `formal` IS STANDARD, whatever else it is tagged.** `beri`
    ("to give") is tagged `['dialectal', 'formal']`, `dialectal` is in `NONSTANDARD`, so the register
    filter refused it and left the English loanword for a berry as the only surviving `beri` entry —
    and both verbs take their meaning from it. The filter was doing exactly what it was written to do.
    `formal` and `dialectal` together is the source disagreeing with itself, and the tag naming the
    register UKBI actually examines is the one to believe. **Measured before it was kept: twelve senses
    in the whole dictionary carry a nonstandard tag beside `formal`**, half of them alt-of forms `REL`
    drops anyway, so it cannot reach far enough to do damage. The same line is in `select.py`'s
    `entry_nonstandard` and **the two have to be kept in step** — the stages would otherwise disagree
    about whether `beri` is a word at all.
  · **A FAMILY MEMBER'S MEANING COMES FROM THE ENTRY THAT CLAIMS THE WORD.** `memberikan` falls back to
    `berikan`, which has three entries: two are `ber-` + `ikan` and mean fish, one is `beri` + `-kan`
    and means to give. Wiktionary's own order — which this generator otherwise trusts — puts the fish
    first. **The source separates them cleanly and the separator was already extracted**: the third
    entry's head template reads `active: memberikan, passive: diberikan`, so the entry naming the word
    we came from is the entry the word belongs to. Exact rather than heuristic, and no etymology
    parsing. A `pos_hint` backs it up where no entry names the word, so a verb cannot be answered with
    a homograph noun.
  **AND A WORD WHOSE ONLY SURVIVING GLOSS SAYS THE HEADWORD IS NOT USED IS NOT TAUGHT.** `kejam`'s two
  adjective senses (brutal, violent, vicious, ruthless, cruel) are both tagged `colloquial` and both
  refused, leaving a verb entry glossed "to close (eyes) **(used in the form mengejamkan)**" — a sense
  the gloss itself says belongs to a different word. The card taught a Semenjana candidate that a very
  common adjective means to close one's eyes. It is the `tau` shape with the opposite outcome: there
  the refused sense left a Greek letter and the word fell out, here it left a rarer homograph and the
  word stayed with the wrong meaning. Dropped, after which `kejam` has no standard meaning in this
  dictionary and is refused — the honest reading of a source that tags every sense a reader wants as
  outside the standard language.
  **TWO NONSTANDARD FORMS CARRY NO NONSTANDARD TAG AND WERE FOUND BY AUDITING THE GLOSSES RATHER THAN
  THE WORDS**: `enggak` (the written-out `nggak`, tagged `informal`, which this generator deliberately
  keeps because `aku`, `kamu` and `Anda` are tagged the same) and `momod` (tagged nothing at all).
  Neither is reachable by any rule — what gave them away is that their only gloss named another
  Indonesian word, which is what a variant's entry looks like — so both go in `EXCLUDE` by hand.
  **The synonym resolution is exactly why they needed naming**: it turns their glosses into ordinary
  English and makes them look like ordinary words.
  **What the audit found NOTHING wrong with is worth recording too**, since it is what a later pass
  need not re-check: no word is taught on two levels, no card has an empty field, every forms row's
  labels match its cells, the HTML balances in every field of all 9,750 cards, and every card id
  follows its deck.
  **`kayak` AT LEVEL 3 IS THE SAME SHAPE AND SHOWS WHY IT CANNOT BE AUTOMATED.** It is very common as the
  colloquial preposition "like, such as"; that sense is refused, leaving the untagged noun — `kayak`, the
  boat. `tau` was reachable by a rule because its surviving sense was recognisably not an Indonesian word at
  all, where this one is a perfectly good Indonesian noun, so no rule can see it and the exclusion is by hand.
  **The harm is worse than a useless card**: the sentences come from a corpus in which nearly every `kayak` is
  the preposition, so the card would gloss it "a canoe" and print three sentences meaning "like". Found by
  `check-ukbi.js`, which lists it among the colloquial forms that must never be taught — the assertion
  catching a word the deck arrived at from the other direction.
  **A DEEPER POOL REACHES JUNK THE SHALLOW ONES NEVER TOUCHED, AND TWO GENERAL RULES CLEARED IT — one about
  LENGTH and one about CASE.** Level 4 draws 1,357 words off the frequency list where level 1 drew 122, so it
  is the first level to meet the corpus's tail, and what came up was not rare Indonesian but two kinds of
  thing that are not Indonesian words at all. **A SINGLE CHARACTER IS NOT A WORD THIS DECK TEACHES**:
  Indonesian's shortest are two letters (`di`, `ke`, `ya`), so a length floor of 2 can never refuse a real
  one — and it catches what `LETTER_NAME` cannot, a letter that ALSO carries a live non-letter sense the
  meaning test therefore lets through (`P` arrived glossed "used to ping or otherwise start a text messaging
  conversation", its `character` entry correctly ignored and its interjection entry perfectly good).
  **AND A CAPITALISED HEADWORD MUST NOT RANK ON ITS LOWERCASE HOMOGRAPH'S COUNT**, which is the `Anda` fold
  paying for itself twice over: that fold exists so the formal pronoun can be ranked on `anda`, and run
  blind it also handed `Maya` the count of `maya`, `Nabi` the count of `nabi`, `BA` the count of `ba` and
  `Insinyur` the count of `insinyur`. `freq` now returns the capitalised form's OWN count wherever the
  lowercase spelling is itself a live word (`live_lower`), and falls back to the fold only where it is not —
  so `Anda` still ranks and the four impostors fall out. **Both rules are general, so both reached back into
  the SHIPPED levels**: level 3 lost `B`, `C`, `D` and `E` — carded as American academic grades and Roman
  numerals — and `Bapa` ("God, the father of Creation"), and level 2 lost `Bu` and `Nyonya`. **A filter
  written for the level in hand is a filter the levels below it have been missing all along**, so re-run and
  diff every level after adding one rather than shipping the new deck alone.
  **THE DECKS HAD BEEN SLOWLY FILLING UP WITH ARITHMETIC** (`compound_numeral`). A multi-word cardinal —
  `delapan puluh sembilan`, eighty-nine — is generated from parts a learner has had since level 1, so a card
  for it teaches nothing; the dictionary states the part of speech (`num`) and multi-word is the whole of the
  test, so `sepuluh` and `seratus` are untouched. What makes it worth a rule rather than a tidy-up is the
  measurement: level 2 had one, level 3 four, level 4 **nine** — including `puluh ribu`, which is not even a
  number but "tens of thousands" — level 5 seven more and level 6 two. **Twenty-five cards of counting
  practice, arriving a few at a time and never enough at once to be noticed.** It is applied to the POOL and not to the
  supplement, which is what lets it be this blunt: level 1's inventory asks for `sebelas`, `dua belas` and
  `dua puluh` deliberately, as the PATTERN rather than as a run, and a hand-written entry is forced in without
  consulting a frequency — so what goes is precisely the numbers nobody chose, the ones a film said aloud.
  **ONE OCCURRENCE IS NOT A FREQUENCY, AND AT 2,000 WORDS THE PHRASE ESTIMATOR WAS RUNNING ON HAPAXES**
  (`PHRASE_MIN`). A phrase cannot appear in a segmented frequency list, so it is counted in Tatoeba and
  calibrated onto the subtitle scale — sound in the middle of the range and worthless at the bottom, because
  a count of 1 says only that the phrase exists somewhere in 28,192 sentences and **every hapax then gets the
  SAME estimate**, 245. They therefore do not spread along the ranking: they arrive together, as one block,
  sorted alphabetically. Measured — of the 579 multi-word entries Tatoeba contains at all, **263 occur exactly
  once**, and at level 5 those filled **234 of the deck's 360 phrases**, a run of cards from about rank 1200
  reading `air putih, air tenang menghanyutkan, akal imitasi, aksi terorisme, alat bantu` straight down the
  alphabet — visibly not the frequency ordering the deck's own description promises. Not one of them is a bad
  Indonesian word (`bola voli`, `burung hantu`, `bawang merah`); what is missing is any evidence they belong
  at THIS rank rather than three levels on. **The floor costs the shipped levels nothing** — 0, 1, 0 and 0 of
  levels 1–4's phrases rest on a single occurrence, and the one is `hari raya`, which is in level 2's
  inventory and forced in regardless — and it takes level 5 from 360 phrases to 124, which is the sane
  progression 19, 31, 56, 100, 124.
  **…AND AT LEVEL 6 IT TOOK THE PHRASES TO NOTHING AT ALL, WHICH IS THE FLOOR WORKING AND THE INVENTORY
  FAILING.** Every earlier level got its phrases free — `estimate_phrases` finds them in the corpus — so no
  inventory had ever needed to write one down, and `SECTIONS_6` was drafted the same way and contained not a
  single multi-word line. A film corpus does not say `daftar pustaka`, so the estimator found none above the
  floor and **the level shipped with zero phrases**. Nothing in the build could see it: 2,500 single words is
  a perfectly ordinary-looking deck. `check-ukbi.js` caught it, on the file assertion that a deck carries at
  least ten multi-word entries, and it caught it twice over, since the walk then had no phrase to reach.
  **TWO SIGNS WERE ALREADY IN THE FILE AND NEITHER WAS READ AS ONE**: the inventory carried bare `tolok`,
  which outside `tolok ukur` is a word almost nobody uses, and bare `pustaka` — **a HALF of a set phrase
  standing alone in an inventory is what the missing whole looks like** — and the section header above them
  already PROMISED `daftar pustaka`, prose describing a list it had drifted out of. Sixteen were written in,
  each confirmed present in the dictionary and absent from levels 1–5 first, which is where the finding
  repeats itself: eight of the obvious candidates (`hak cipta`, `ilmu pengetahuan`, `sumber daya`, `tata
  bahasa`, `kata kerja`, `kata benda`, `kata ganti`, `di samping itu`) had already arrived on frequency at a
  lower level. **The register's set phrases have to be written down from the level a hand-written inventory
  starts carrying the vocabulary** — expect the same of level 7. **And level 7 did the same thing again**,
  which is what makes it a rule rather than one level's mistake: `SECTIONS_7` was drafted from the dictionary
  (see below) and a mined inventory is a list of HEADWORDS, so it contained no multi-word line either — the
  same zero, from a different cause. Twenty-two were written in before the build was run, so the assertion
  never had to fire; the deck ships 29 phrases, the extras being the few the corpus supplies at this depth.
  **THE `kayak` SHAPE A FOURTH TIME, AND TWO RULES FOR IT WERE MEASURED AND REFUSED.** Level 5 goes 2,000
  words into a corpus of film subtitles, and a subtitle file is full of English — so a word spelled like a
  common English one collects that word's count and the reader is shown whatever marginal Indonesian sense
  the dictionary files under the spelling: `station` glossed as an obstetric measurement, `cup` as "sound of
  something immersed in water", `along` as "abundant catch of fishermen", `lukas` as a fish species ranked on
  the name Lucas. **The obvious automations both cost more than they save.** Dropping Wiktionary's "unadapted
  borrowing" etymology takes `bank`, `si`, `laptop`, `tank`, `tsunami` and `siku` to catch four; dropping
  anything spelled like a common English word takes `digital`, `legal`, `formal`, `vitamin`, `stadium`,
  `diagnosis` and `proposal` — ordinary Indonesian, and several of them this level's own subject matter.
  Indonesian has borrowed too well for either test to separate a borrowing from an intruder, so this stays a
  hand list and will grow by a few at every level. **The test is not whether the count is borrowed but
  whether the CARD teaches something false**: `bridge` (the card game), `port` (port wine) and `flat` (an
  apartment) are ranked by their English homographs too and are deliberately KEPT, because their glosses are
  true and only their rank is inflated — which the deck's description already warns about.
  **A PHRASE MUST BE WRITTEN ON A LINE OF ITS OWN, NEVER INFERRED FROM A LINE OF SINGLE WORDS.** The
  supplement reader scanned each line for the longest run that happened to be a dictionary entry, and
  Indonesian compounds freely: `kopi teh susu` resolved as `kopi` plus `teh susu`, which is a real entry
  meaning milk tea, so the deck silently lost its words for tea and for milk. It shipped at rank 500 with a
  frequency of zero, **which is the only reason it was seen**. The opposite failure is the DELE's own — a bare
  `.split()` tore `o sea` in two — and here it would break `terima kasih`, `rumah sakit`, `di mana`,
  `dua belas` and `kamar mandi`, a fifth of the survival core.
  **A PHRASE CANNOT APPEAR IN A SEGMENTED FREQUENCY LIST AT ALL**, so all nineteen scored zero and sorted
  last, behind `sialan` — `terima kasih` among the very last cards of a survival deck. They are counted in the
  Tatoeba corpus the pipeline already downloads and calibrated onto the subtitle scale through the single
  words, which carry both, on the MEDIAN ratio so that one wildly disagreeing word cannot drag the scale.
  `terima kasih` lands at rank 276 and `di sini` at 91. The DELE's rejected fallback — giving a phrase the
  rank of its rarest component — is rejected here for its own reason: it is a true ceiling and a hopeless
  estimate.
  **AND ITS REAL LIMITATION IS THE CORPUS THE FILL COMES FROM, which is stated rather than smoothed over.**
  The 123 words not in the survival inventory are the commonest words of film dialogue, so `membunuh` (to
  kill) outranks `air` (water) and `sialan`, `bodoh` and `polisi` all arrive before a word for food or a day
  of the week. That is an accurate description of what people say in films and a poor one of what a beginner
  needs, which is why 378 of the 500 come from the inventory instead; the deck's description says which half
  is which. **The higher the level, the more of it the corpus decides** — level 2 is 313 from its inventory
  and 437 by frequency, level 3 **199 against 801**, level 4 **143 against 1,357**, level 5 **196 against
  1,804**, level 6 **152 against 2,348**, level 7 **279 against 1,221** — the first level whose inventory
  share RISES, because it was mined from the dictionary rather than recalled — so the caveat gets
  heavier as the levels climb, not lighter, and the description now derives the split rather than restating
  level 1's. **AND ONCE THE CORPUS IS CHOOSING MOST OF THE LIST THE DESCRIPTION SAYS SO IN AS MANY WORDS**,
  which is a clause of its own added at level 4 and fired **on the measurement rather than on the level
  number** — it appears wherever the corpus supplies the majority, so it reaches back into levels 2 (58%),
  3 (80%), 5 (90%) and 6 (94%) and stays silent at level 1 (24%). The reason to state it is that the earlier sentence — "the
  commonest words of everyday Indonesian, taken from a frequency list built from film and television
  subtitles" — is equally true at every level and stops being the WHOLE truth at the point where the
  inventory has run out and the subtitles are picking nine words in ten. What that produces at level 4 is
  overwhelmingly ordinary vocabulary (`orbit`, `karbon`, `reputasi`, `pengelolaan`, `musyawarah`,
  `sutradara`) with a handful of marginal-but-real dictionary entries in the tail (`bong`, `dom`, `ken`,
  `bedebah`) — none invented, all glossed from Wiktionary, and exactly what a film corpus yields.
  **THERE ARE THREE SENTENCE SOURCES AND THE ORDER THEY GO IN IS THE WHOLE DESIGN** (Aug 2026, on
  request: "add example sentences for as many as you can that don't have any yet"). Tatoeba is a
  pair bank of everyday sentences written and translated by people, and it runs out — 22,008
  Indonesian sentences with an English pair covers a survival vocabulary almost completely and an
  academic one hardly at all. **Two things were measured and REFUSED before a source was added**, and
  both are the obvious moves: **raising the length cap does nothing** (110 characters already admits
  99% of that corpus — p99 is 102 — so lifting it to 150 recovers 55 words across the whole stack and
  to 180 recovers 79, each a longer sentence on a card), and **the matcher was already correct** (a
  re-implementation with no limits found no extra matches at all). What is missing is not long
  sentences, it is the words. So two sources were added, strictly in order of how much they can be
  trusted, and each word takes the best three it can get:
  **1. Tatoeba** (CC BY 2.0 FR), human-written pairs; **2. Wiktionary's own usage examples**
  (CC BY-SA 4.0, the same source and licence as the definitions already on the card, carried through
  `extract_kaikki.py` — 1,257 usable of 2,583 raw, the rest being `Near-synonyms:` lists, collocations
  written with an em-dash gloss, and literary quotations in older orthography); **3. Global Voices news
  articles via OPUS** (CC BY 3.0).
  **THE THIRD IS A DELIBERATE TRADE AND ITS COST IS STATED RATHER THAN HIDDEN.** OPUS aligns Global
  Voices sentence by sentence with SOFTWARE, and software drifts: reading thirty random pairs by hand
  found one where the two sides were different sentences from the same article — both real, both
  fluent, neither a translation of the other. A wrong English under a right Indonesian teaches a wrong
  meaning, which is worse than teaching nothing. Four things make it acceptable, and the first is the
  one that matters: **it is reached ONLY where the other two have nothing**, so the risk falls on
  exactly the words that would otherwise have no example at all; it is filtered hard (see `gv_pairs` —
  two complete sentences, no URL, a length ratio inside a factor of two, and **where both sides state
  a number they must state the same one**); where several of its sentences carry the word, the one
  whose English contains the word's own dictionary gloss is preferred, which raised the confirmed rate
  of what is actually chosen from 52% to **64%**; and the deck's own description says it used an
  automatically aligned source and that a few sentences may not line up.
  **THE PROPER-NOUN VERSION OF THAT NUMBER CHECK WAS TRIED AND THROWN AWAY**, which is the finding:
  a translated proper noun changes form — `Korea Utara` against `North Korea`, `Eropa` against
  `Europe`, `Islam` against `Islamic` — so a rule keyed on them rejected **28% of the corpus, of
  which seven in eight were correctly aligned**. Numbers survive translation and names do not.
  **THE LICENCE WAS READ RATHER THAN RECALLED**, which is this file's standing rule and mattered here:
  OPUS's own LICENSE file says only "the same license as the original sources", so it settles nothing
  — Global Voices' attribution policy is what states CC BY 3.0, and it was fetched. **TED2020 and
  WikiMatrix were checked and refused**: TED is CC BY-NC-**ND**, which the site's own bar rules out
  (Folio may sell premium accounts), and WikiMatrix is machine-MINED rather than human-translated, so
  its misalignment rate is far worse than the one being weighed here.
  **THE RESULT: 1,528 words gained an example**, and the stack went from 5,602 words with no sentence
  to 4,074. Per level, "with none" went 2 → 1, 33 → 11, 180 → 46, 591 → 271, 1,313 → 849, 2,096 →
  1,643 and 1,387 → 1,253. **The bulk of the remainder is not recoverable from any corpus**: level 7's
  vocabulary is the `-isme`/`-itas`/`ke-…-an` morphology, which no sentence bank of any size contains.
  **THE CLITIC WAS A REAL MATCHER BUG AND IS WORTH 72 WORDS ON ITS OWN.** Indonesian writes `-ku`,
  `-mu` and `-nya` onto the end of the word, so a sentence about `peradangannya` is a sentence about
  `peradangan` — and a whole-word match refuses it. `select.py`'s `read_frequency` had stripped those
  for exactly this reason since level 1 and `examples.py` had not. **The fix has a second half that
  fails silently**: `build_deck.bold` picks the word out of the sentence with its own pattern, and
  left demanding the bare form it marked NOTHING in precisely the sentences the clitic rule had just
  admitted — the card renders, the sentence is there, the English is there, and the word is simply no
  longer picked out. Caught by an assertion counting `<b>` against sentences, not by eye. Nothing is
  ever stripped off the FRONT anywhere in this generator, because `meN-` assimilates and eats the
  root's first consonant.
  Tatoeba's Indonesian is
  small — 28,192 sentences, 22,023 with an English pair, against hundreds of thousands for Spanish — and was
  **measured before each level was built rather than assumed**: 494 of level 1's cards carry three sentences
  and one carries none; at level 2 it is 703 and 11; at level 3, whose words are rarer again, **814 with three
  and 46 with none**; at level 4, **779 with three and 271 with none**, 18% of the deck; at
  level 5, **382 with three and 849 with none**, which is 42%; at level 6, **174 with three and 1,643 with
  none**, 66%; at level 7, **28 with three and 1,253 with none**, which is 84%. Those are kept: a word is chosen for being
  worth knowing and not for
  being well covered by a sentence bank, and each deck's own description states its own figure. **That
  figure is the honest output of a small corpus meeting a large deck, and the answer is to print it rather
  than to filter the words down to the ones the sentence bank happens to cover** — which would let Tatoeba
  choose the vocabulary, and Tatoeba is not a syllabus either. **At level 5 the same argument settles the
  TARGET as well**: 2,000 words is a statement about what the level teaches, and cutting it because the
  sentence bank is small would let Tatoeba choose the deck's SIZE — and the professional vocabulary this
  level exists for (`wanprestasi`, `arus kas`, `pemutusan hubungan kerja`) is exactly what a conversational
  sentence bank will never contain, so filtering on coverage would produce a level 5 that is a level 2 with
  rarer words in it.
  **AND AT LEVEL 6 THE FREQUENCY SOURCE IS EXHAUSTED, WHICH IS A FACT ABOUT THE CORPUS RATHER THAN ABOUT THE
  LEVEL AND IS THE MEASUREMENT TO TAKE BEFORE BUILDING LEVEL 7.** Dictionary headwords with a subtitle count
  of 200 or more number **5,770**; levels 1–5 already teach **5,750**. So level 6 is the first whose fill is
  drawn almost entirely from the tail, and the shape of that shows in every figure at once: the MEDIAN
  subtitle count per level runs 22,238 / 5,640 / 2,042 / 720 / 250 / **76**, the share of a level's words
  counted under 100 runs 4% / 4% / 5% / 8% / 10% / **68%**, and sentence coverage runs 99% / 95% / 82% / 60%
  / 34% / **16%**. Under a hundred occurrences the count cannot rank one word against another with any
  confidence, so **the deck is still frequency-ordered and the ordering has stopped meaning much**, and the
  hand-written inventory items — which have no corpus frequency at all — sort to the very end (median
  position 2,404 of 2,500). **THE ANSWER IS TO SAY SO RATHER THAN TO FILTER OR RE-SORT** (`THIN_PCT` in
  `emit.py`): a second derived clause fires at 50% thin and tells the reader to treat the sequence as a rough
  guide and not a ranking. Filtering to the well-counted words would let a film corpus decide what an
  academic-register level teaches, and a two-group sort was measured and declined — only ~50 words have a
  frequency of exactly zero, so the re-sort would move almost nothing while claiming the order meant more
  than it does.
  **AT LEVEL 7 BOTH SOURCES RUN OUT, DIFFERENTLY, AND THE HONEST ANSWER WAS TO SIZE THE LEVEL FROM THEM
  RATHER THAN FROM THE SEQUENCE.** `TARGET` was 500 / 750 / 1,000 / 1,500 / 2,000 / 2,500 and had **3,000
  tabled for Istimewa** when level 1 was written; the level ships **1,500**, which is smaller than the level
  below it and is the only one of the seven derived rather than chosen. Two measurements, taken before
  anything was drafted.
  · **THE CORPUS IS EXHAUSTED, which level 6's own paragraph above predicted.** Levels 1–6 teach 8,250 words;
    the subtitle list holds 11,364 the dictionary can gloss, of which the cascade leaves **1,344** free — and
    every one of those 1,344 is counted **fewer than 50 times** (median 26, maximum 39). Within a count band
    the ordering is therefore alphabetical (`peradangan, prefek, proporsional, provokatif, rampung,
    salamander`), which is level 6's finding taken to its conclusion: the corpus has stopped measuring
    anything at all.
  · **AND THE DICTIONARY CANNOT REACH THE REGISTER THE DESCRIPTOR NAMES**, which is the new one and the
    binding constraint. English Wiktionary's Indonesian is excellent on everyday words and thin on exactly
    the scholarly vocabulary Istimewa is about: `metodologi`, `paradigma`, `epistemologi`, `kutipan`,
    `merujuk`, `mengutamakan` and `normatif` are ordinary Indonesian and are simply not in it. **A
    hand-written inventory of 352 recalled candidates yielded 61 usable.**
  **SO THE INVENTORY WAS MINED RATHER THAN RECALLED, AND THAT IS THE METHOD TO CARRY.** Every earlier level's
  `SECTIONS_n` is written from the descriptor and then checked against the dictionary; at this level that
  loop returns almost nothing, so the direction was inverted — sweep the dictionary for the suffix families
  the register is MADE of (`-isme`, `-is`, `-itas`, `ke-…-an`, `peN-…-an`, `-if`/`-al`/`-er`), take what is
  actually there, and let the descriptor decide which of it belongs. **The quality filter is pedagogical and
  is what made it usable**: a derivation whose ROOT the reader has already been taught teaches almost nothing
  (`keadaan` beside `ada`), so those are dropped, which cut 1,717 raw hits to **435** good ones and yielded
  **254 usable, of which 201 are not already in the corpus pool**. 1,344 + 201 = 1,545 is the whole of what
  the two sources support, and 1,500 is that with a small margin. **This is not a claim that Istimewa needs
  fewer words than Sangat Unggul** — it is the point at which the sources run out, and `emit.py` gained a
  derived clause (gated on this level's target being below the one below it) so the deck's own description
  says so in those words rather than leaving a reader to wonder.
  **AND THE AFFIX FAMILY ALL BUT DISAPPEARS AT THIS LEVEL, WHICH IS THE LEVEL RATHER THAN A FAULT.** The
  family row is the centrepiece of every card below — 67 at level 1, 89 at level 2 — and level 7 carries
  **15, of which 4 show a passive**. It is arithmetic rather than a dropped rule: this level's vocabulary IS
  the derived morphology, so its headwords are the `-isme`, `-itas` and `ke-…-an` forms themselves and the
  ROOTS they are built on were taught three levels ago. The share of a level's words carrying a full family
  runs 13.4 / 11.9 / 8.4 / 5.3 / 4.0 / 2.8 / **1.0%** — no cliff anywhere, so no ratio threshold could name
  it — and `emit.py` states it in the description on the **categorical** test (zero full families with a
  passive: 42/62/70/59/42/29 at levels 1–6 and **0** at level 7). `check-ukbi.js` takes it as a declared
  per-level EXCEPTION rather than a skip — `FAM_RANGE` is a two-sided range (`[50, ∞)` below, `[5, 40]` here)
  and `WANT` drops the family specimen from the walk — because a silent skip and a broken extractor look the
  same. **The one that had to be read rather than assumed** was `keandalan`, whose family is `['keandalan']`
  alone: Wiktionary lists it as a headword in its own right rather than as a derivation of `andal`, so the
  count is TRUE and the fix is the range, not the reader.
  **`node .claude/ukbi/check-ukbi.js [1..7]` is the browser half** (49 assertions at level 1, 53 at level 2,
  57 at level 3, 61 at level 4, 67 at level 5, 73 at level 6, 74 at level 7), and it exists because
  `check-decks.js` skips the card-level checks for a deck that is not Mandarin — so everything Indonesian the
  deck is FOR is unchecked by anything until there. Every fault it hunts is quiet: a dropped forms row leaves
  a good card that has stopped teaching the hard part, a colloquial form that slips the filter looks exactly
  like a word, and a torn phrase leaves two ordinary cards. So it asserts the closed SETS whole (all seven
  days, all twelve months, one to ten, the question words), that no colloquial form is taught while every
  standard one is, that tea and milk survived as two words, and — on the page, after walking to a card that
  has one — that the family row renders with its labels and marks which form is being asked for. **It runs
  under `reducedMotion`**, or every screenshot is a card caught half way through its fade.
  **A LEVEL'S CLOSED SETS ARE ASSERTED AGAINST THE WHOLE STACK, NOT AGAINST THAT DECK** (`CORE`, keyed by
  level; `taught` is this deck's words plus every lower deck's, read off the shipped files exactly as
  `words_below()` reads them). Checking only the deck in hand reported level 2 as having no word for Monday —
  which is TRUE and is the entire point of `words_below()` — and dropping a lower level's sets once past them
  would stop watching the thing they were written to watch, so a level-1 regression now fails a level-2 run
  as well. Level 2 adds three sets of its own, clothes being the cleanest (not one of the five is in level 1);
  level 3 adds the workplace, money at a bank and the abstract nouns — **the set that would have been WRONG
  one level down**, which is the descriptor doing its work in the test as well as in the inventory; level 4
  adds the shape of an organisation, the running of a meeting and the `ke-…-an` abstractions, which is where
  a descriptor that opens no new door instead takes the vocabulary; level 5 adds contracts, the books, the
  courts, the standard Indonesian of computing — and **a set of professional COMPOUNDS** (`arus kas`, `tata
  kelola`, `pemangku kepentingan`, `pemutusan hubungan kerja`), which is that level's own finding: at this
  register a great deal of the vocabulary is multi-word, so an assertion on single words alone would miss the
  half that matters; level 6 adds research and its writing-up, the apparatus of citation, the university, the
  words for judging a claim, and the language a test of Indonesian uses to talk about Indonesian; level 7
  adds the doctrines, the measurable qualities, the abstractions, the processes and the formal compounds —
  **five MORPHOLOGICAL sets rather than topical ones**, which is that level's own finding restated as an
  assertion, since a set of subject vocabulary would say nothing about a level whose subject is the
  derivation itself.
  **Every member of a new set is checked to
  be in that level AND in none below it**, or the assertion passes on a lower level's word and says nothing
  about the one being added — and it names the HEADWORD the deck actually teaches (`mengunggah`, whose root
  `unggah` is shown in its forms row) rather than the root a reader might expect.
  **And a new assertion the stack needed: no word is taught again from a level below**, whose failure is not
  an error but a duplicate — the learner meets one word on two decks with two schedules and nothing says so.
  **THREE ASSERTIONS COME FROM THE AUG 2026 AUDIT AND EACH GUARDS A FAULT THAT LOOKED LIKE A WORKING
  CARD.** **No card is defined by naming another Indonesian word** — a sweep for `synonym of` /
  `basic form of` / `used in the form` in the rendered English, which is what the 62 bad cards had in
  common and what no count could see. **The words for giving are glossed as giving** — asserted by
  MEANING rather than by presence, since `memberi` and `memberikan` were on the deck all along and it
  was their definitions that were fruit and fish. And **`kejam` is not taught**, which is the one place
  the check asserts an ABSENCE for a content reason rather than a register one. Two more cover the new
  sentence sources, and they assert the property all three must share rather than which source a row
  came from: **every sentence is paired with an English and has its word marked**, and **every sentence
  contains the form it is credited to** — a row with no pair is what a half-read corpus leaves behind
  and a sentence without the word is what an over-eager matcher leaves behind, and both render as an
  ordinary card. The second tolerates a clitic on purpose, for the reason the matcher does.
  **THE SPECIMENS ARE SEEDED AS DUE RATHER THAN WALKED TO, AND THAT IS THE THIRD ANSWER TO A QUESTION
  THIS CHECK KEPT GETTING WRONG** (`SPECIMENS` / `WANT` / `seedIds`). The walk exists to prove that a card carrying an
  affix family, one carrying a phrase and one carrying three sentences all RENDER, and it used to reach them
  by grading real cards under a cap written down as a number. **The cap was wrong twice for the same reason**:
  all three are properties of the WORD, the deck is frequency-ordered, so the higher the level the later the
  first falls. 240 cleared level 3's family at note 167 by 73 and **did not clear level 4's at 383**,
  reporting a deck carrying 79 families as having none; 600 then did not clear **level 6's at 886**. And the
  first PHRASE went from note 14 at level 1 to **2,445 at level 6**, because that level's phrases are all
  hand-written inventory items with no corpus frequency and the deck sorts them last — so the honest cap
  became 2,485, or eight minutes and fifty artefact chests to prove something about markup.
  **A DUE CARD IS IN THE QUEUE WHATEVER THE DAY'S NEW-CARD ALLOWANCE IS**, and that — rather than any claim
  about order — is what the seeding rests on: a session is at most `ALLOW` cards plus the seeds, so a walk of
  `ALLOW + 40` reaches them at every level however deep they sit. **It does NOT put them first**, which was
  the first guess and was wrong: the review's Ordered presentation re-sorts the whole queue into in-deck
  order, so a specimen from the end of the deck is dealt at the end of the SESSION — which is why the cap is
  derived from the allowance rather than being a small number. What it gives up is the incidental proof that
  a reader working the deck normally will meet them, so the positions are PRINTED on every run instead.
  **A specimen the deck does not contain AT ALL is still a failure**, and never a skip — that is what caught
  level 6 shipping with no phrases in it. Verified by removing the seed and watching level 6 fail exactly the
  two assertions it is for; and the seeding itself is asserted, count included, since `every` over an empty
  list passes vacuously and a seed that never landed would hand the walk silently back to the natural queue.
  **WHICH IS WHY THE ONE LEVEL THAT GENUINELY HAS NO FAMILY SPECIMEN DROPS IT FROM `WANT` RATHER THAN
  FAILING QUIETLY**: `WANT` is per level, `seedIds.length === WANT.length` still has to hold, and the walk's
  family assertion is skipped only where the level has declared it has none — so a family specimen going
  missing at any of levels 1–6 still fails, and level 7 is asserted on its own `FAM_RANGE` instead. **A
  per-level exception is a DECLARATION, not a condition tested at run time**; written the other way round it
  would pass on a deck whose families had stopped being built.
  Three more things that bit: `.grade` carries `data-g` ITSELF, so a descendant selector matches nothing and
  the walk stands still at zero cards; **studying several hundred cards levels the reader up, and a level
  buys an artefact chest** whose modal overlay intercepts the pointer and stops the walk on a timeout naming
  an SVG (levels 4–7 dismiss eight of them); and the
  sandbox's Chromium is not where Playwright looks for it, so it needs
  `FOLIO_CHROMIUM=/opt/pw-browsers/chromium-<n>/chrome-linux/chrome`.
  **`combine.py` is the ONE-FILE version of the lot** (`python3 .claude/ukbi/combine.py [out.json]`), on
  request — `decks/Indonesian-UKBI-1-7-and-Expressions.folio-deck.json`: 9,978 notes / 19,956 cards under a
  fresh deck id `ukbiall`, with **a subdeck per level plus the phrases deck nested under one parent of its
  own** (the seven predicates are flat and the expressions are not, which is the tree saying that the eighth
  row is not an eighth level) — and
  the DIRECTIONS come free as a level below that, which is the one substantial difference from the DELE
  combiner beside it. There a word is TWO notes, one per direction, so the direction can be written into
  `sub`; **here a word is ONE note carrying two card TEMPLATES, and `sub` is a property of the NOTE**, so it
  cannot name a direction at all — and does not need to, since app.js draws a DIRECTION ROW under any level
  whose notes are all filed directly in it. So each of the seven levels lists `Indonesian → English` and
  `English → Indonesian` beneath it and the deck row above them correctly gets none, a second pair over the
  whole deck being the same cards offered twice under a name that says nothing new. **Nesting the directions
  the DELE way would mean two notes per word, which is the duplication the one-note shape was adopted to
  remove.** Five more things it has to get right, four of them silent.
  **A CARD ID MUST CARRY THE DECK** — every note is renumbered `u_ukbiall_N`, since a deck FILE import mints
  fresh ids only when the deck id is already taken, so an id left reading `u_ukbi1_1` would collide with an
  installed level 1 in the shared `UCARDS` store and study the wrong card, with both decks on the shelf
  showing their full counts.
  **THE FILE HOLDS NOTES AND THE CAP COUNTS NOTES, which is why this fits at all**: 9,978 notes against
  `UDECK_MAX_CARDS` (12,000) is comfortable, where the 19,956 cards they carry would not be — see the note
  beside that constant, which says the bound is on what the FILE holds. At 7.5 MB it is far inside the
  48 MB one.
  **THE TYPE BLOCK, THE COLOUR AND THE TEMPLATE COUNT ARE ASSERTED RATHER THAN ASSUMED.** A level rebuilt
  against a changed template would otherwise have its cards silently rendered by another level's; a level
  that had quietly stopped carrying two templates would give up its two direction rows in silence, and the
  deck would import, study and count perfectly with half of what was asked for.
  **THE COUNTS IN THE DESCRIPTION ARE COUNTED** off the notes, never added up from the seven descriptions —
  only the per-level word counts come from `TARGET`, a level's size being a decision the shipped file cannot
  report. It reads no clock (the stamp comes from the newest source), so the same inputs write the same
  bytes.
  **AND ITS OUTPUT IS GITIGNORED, like every other combined file's.** It was committed for a fortnight, on
  the reasoning that it had been asked for as a download and so wanted a permanent home beside the seven it
  is made of — and that is the whole shelf's rule the other way round: a combined deck is an ARTEFACT of the
  decks it combines, every byte of it already in the repo, so committing one duplicates ~7.5 MB for nothing
  a re-run cannot produce. See the `.gitignore` block naming all five.
  **`node .claude/ukbi/check-combined.js` is the browser half** (16 assertions): it RUNS `combine.py` first,
  so it needs no committed artefact and works on a fresh clone, then imports the file through the real
  Studio picker and reads the page — 31 rows, ten card-holding subdecks with their directions plus the one
  parent that correctly gets none, a level counting both directions and a direction counting one, adding the
  deck bringing the subdecks and **not** the twenty directions, and a card rendering its word, its meaning
  and its speaker. `check-ukbi.js` asserts what is on an Indonesian
  CARD and `check-nesting.js` the subdeck/direction machinery in app.js; what is left, and what this covers,
  is the JOIN — seven decks poured into one file.
  **THE EIGHTH DECK IS PHRASES, IDIOMS AND PROVERBS, AND IT IS NOT AN EIGHTH PREDICATE**
  (`phrases.py` → `examples.py` → `build_deck.py` → `emit_phrases.py`, driven by
  `python3 .claude/ukbi/run.py --phrases`; `decks/Indonesian-Phrases-and-Expressions.folio-deck.json`, **228
  expressions — 84 Phrases, 111 Idioms, 33 Proverbs** — Aug 2026, on request). There are seven predicates and
  this is not one of them, so the deck's own description says so in those words: a row sitting beside
  `UKBI 1 Terbatas` … `UKBI 7 Istimewa` will be read as an eighth level unless it states otherwise, and in
  the combined file the seven are FLAT while this one NESTS under a parent of its own, which is the tree
  saying the same thing without prose. **WHY THE LEVELS CANNOT REACH THESE EXPRESSIONS is the reason it
  exists**: a phrase cannot appear in a segmented frequency list at all, so the whole cascade — which ranks
  on that list — is blind to them, and `PHRASE_MIN` additionally floors a phrase at two corpus occurrences
  precisely because one occurrence is not a frequency. Everything here is a phrase, so none of it could ever
  have arrived by the ordinary route.
  **THE SELECTION IS THE DICTIONARY'S OWN CLASSIFICATION AND NEVER A JUDGEMENT MADE HERE**, which is the
  house rule against inventing content applied to CHOOSING it: a candidate is taken because Wiktionary files
  it under a phrase part of speech, puts it in `Indonesian proverbs` or `Indonesian phrasebook`, or tags a
  sense `idiomatic` / `figuratively` — and is dropped because the dictionary says it is a misspelling, a
  borrowing, or a form of something else. Six things it settled are worth carrying.
  **THE `phrase` PART OF SPEECH IS A TRAP: most of its entries are LATIN AND FRENCH.** `de facto`,
  `s'il vous plaît`, `en route`, `ad hominem`, `force majeure`, `primus inter pares` — all filed as
  Indonesian phrases, all useless to a candidate, and a deck that shipped them would be teaching the wrong
  language under the right heading. The dictionary marks them itself, two ways, and both are needed: the
  etymology's "Unadapted borrowing" / "Learned borrowing" (159), and the `Indonesian internationalisms`
  category (19). **`in situ` still leaked**, its etymology reading only "Borrowed from Latin" with no
  qualifier and no category, so a third rule matches the plain form for six source languages —
  **guarded on `calque`**, since a calque is made of Indonesian words and is exactly what the deck wants
  (`kambing hitam` is one).
  **WIKTIONARY CARRIES MISSPELLINGS AS ENTRIES** — `terimah kasih`, `selamat tinngal` — and this is a deck
  for a test that marks `dimana` wrong, so 107 go on the tag alone. **And a gloss reading "passive of X" or
  "synonym of Y" is a cross-reference rather than a meaning**: `diberi tahu` and `direka ulang` are the same
  fault one level down, dropped at selection so the counts agree, since `build_deck` refuses a card with no
  meaning and a candidate refused there leaves the wordlist and the deck disagreeing about their own size.
  **THE CENTRAL FINDING IS THAT A MARKED EXPRESSION MAY NOT BE FILTERED ON USE.** Measured over both corpora
  (28,192 Tatoeba sentences and 16,043 Global Voices pairs), only **9 of 38 idioms and 8 of 46 proverbs occur
  even once** — an idiom being literary and a corpus of subtitles and news conversational. Filtering on
  occurrence would delete the deck's subject, which is the Mandarin deck's own recorded finding at a smaller
  scale (of 5,227 non-syllabus chengyu only 361 are in Tatoeba). **So what the dictionary MARKS is taken
  whatever the corpus says, and what only the POS suggests must be shown in use** — that second rule costs
  89 of 110 and 86 of 120, and every one of them is a string nobody says.
  **A PROVERB DEDUPLICATES ITSELF, THROUGH THE DICTIONARY AGAIN**: `di mana bumi dipijak, di situ langit
  dijunjung` has seven spellings on the wiki, six of them glossed "synonym of" the seventh, so the
  cross-reference rule that drops a form-of gloss leaves exactly one card per proverb rather than seven.
  **THE `figuratively` INTRUDERS WERE A GLOSS-ORDER PROBLEM, NOT A SELECTION ONE, and the fix is DATA.**
  `kambing hitam` is genuinely idiomatic and belongs here; what was wrong is that Wiktionary lists "black
  goat" before "scapegoat", so the card taught the literal reading. `phrases.py` rewrites `wikt-p.json` with
  the marked sense first — **never `build_deck.py`, which is shared with all seven levels** and where the
  same change would re-order glosses in decks nobody was editing. Its diagnostic reports the STATE ("N
  entries carry both a literal and a figurative sense; the figurative one is put first") rather than the
  number it moved, since the file is rewritten in place and a count of moves reads 0 on the second run —
  which looks exactly like a rule that has stopped firing.
  **A DOMAIN-CATEGORY FILTER WAS MEASURED AND REFUSED**, which is the finding to read before adding one: 37
  chosen entries carry a subject category (law, medicine, computing), and most of them are precisely what a
  Semenjana-and-above candidate needs — so a term-of-art rule would have deleted `atas nama`, `balik kanan`,
  `saham gorengan` and `kuda troya`. The subdeck was renamed `Everyday expressions` → **`Phrases`** instead,
  a label everything under it answers to, which is the honest fix for a heading that had grown narrower than
  its contents.
  **`deck_type.py` IS THE CARD TYPE, DEFINED ONCE**, lifted out of `emit.py` when this deck gave it a second
  emitter: copied into each they would drift invisibly, which is the `deckcore.js` fault this file already
  records one directory over. **Verified inert: all seven level decks rebuild byte-for-byte identical.**
  **`node .claude/ukbi/check-phrases.js` is the browser half** (23 assertions), and almost every one guards a
  silent fault — a foreign phrase, a misspelling or a compound noun in this deck looks exactly like an entry
  somebody chose. It asserts each named intruder is absent AND that a marked noun is KEPT (`kambing hitam`,
  `lintah darat`), which fail in opposite directions; one card per proverb rather than one per spelling; no
  cross-reference gloss anywhere; the three subdecks with 9 rows and their directions; and — on the page —
  that `kambing hitam` shows "scapegoat" before "black goat", which is the only place the gloss order can
  actually be seen.
  **Re-running it must reproduce the shipped deck byte for byte** (a fixed `STAMP`, no clock read anywhere);
  that is the check to make after any edit, since every fault above is silent — **and it has to be run on
  EVERY level, since the stages are shared**: most of the fixes above were found while adding level 2 and
  every one of them changed level 1 as well. **A community deck is not a change to Folio**, so these get no
  changelog line and no version bump. Not part of the site.
- `.claude/combine-decks.py` — **every deck in `decks/` as ONE importable file, a language per branch**
  (`python3 .claude/combine-decks.py [out.json]` → `decks/All-Languages.folio-deck.json`; Aug 2026, on
  request). The THIRD combiner, and the one that knows nothing about how any deck was built: `dele/
  combine.py` and `delf/combine.py` each know their own pipeline — its levels, its exam name, its
  per-level figures — where this one knows a TABLE (`PARTS`) of which shipped file goes where in the
  tree, so a pipeline change reaches the language combiner and a new language reaches this one without
  the two being kept in step. It is **76,502 rows = 153,004 cards, 183.53 MB** in seven branches: French
  7,648, German 12,547, Italian 11,578, Indonesian 9,978, Mandarin 11,532, Portuguese 6,437, Spanish
  16,782. **READ `PARTS` AND RE-MEASURE RATHER THAN QUOTING ANY OF THAT** — this line has been stale twice
  already, once saying 39,830 rows over five branches while the table held six, and once naming two HSK
  decks that had been deleted. The run prints the whole per-level breakdown on every build.
  It is **gitignored**, like the other two combined files: every byte of it is already in the repo and this
  regenerates it, reading no clock (`exportedAt` comes from the newest source), so the same inputs write
  the same bytes and a diff means something.
  **IT REFUSED TO RUN AT ALL FOR A FORTNIGHT, AND EVERY ONE OF THE THREE REASONS WAS A GUARD WORKING**
  (Aug 2026, on request: "feel free to raise the cap"). The seven **CAPLE Portuguese** files were in
  `decks/` and absent from `PARTS`, so the unlisted-file check refused to write a file that would quietly
  be a smaller shelf; with them listed the shelf came to 76,502 notes against a 44,000 cap and then to
  183.5 MB against a 128 MB one; and with both caps raised the type check refused the German block. All
  three are recorded because **each is what a silent version of the same fault would have cost**: a shelf
  short one language, a file the app declines to import, and a deck rendered by another deck's CSS. Seven
  things are decisions rather than plumbing.
  · **IT IS WHAT RAISED BOTH CAPS, TWICE OVER, and that is the intended direction of causation.** At 2.4×
    the note cap and 1.4× the byte cap that stood before it, the five-language file did not fit and took
    them to 44,000 and 128 MB; the seven-language one did not fit either and took them to 85,000 and
    208 MB. `UDECK_MAX_CARDS` / `UDECK_MAX_BYTES` are guards against a hostile or runaway file rather than
    views about how large a deck may usefully be, each set from the largest legitimate deck anyone has
    brought — so a legitimate deck this size is the thing that moves them, which has now happened four
    times. **The caps are READ out of app.js by `app_const`** rather than restated here, so this tool and
    the app can never come to disagree about what will import.
  · **A FILE IN `decks/` THAT `PARTS` DOES NOT NAME IS AN ERROR, not a silent omission** — combining
    "every deck" and quietly leaving one out is the failure the whole file exists to avoid, and it looks
    exactly like a smaller shelf. `ARTEFACTS` names the two pipelines' own combined files so the check can
    tell one of those from a deck somebody added.
  · **A SOURCE DECK'S OWN SUBDECKS SURVIVE BELOW THE LANGUAGE**, at no cost in the table: `sub` is
    `[lang] + [path] + [the card's own]`, so HSK 3.0 keeps its nine levels and the four Spanish levels
    keep their two directions. Depth is checked against `SUB_MAX_DEPTH`, also read off app.js.
  · **A CARD ID MUST CARRY THE DECK** (`u_alldecks_N`), the Spanish generator's own lesson: a deck FILE
    import only mints fresh ids when the DECK id already exists, so a reused `u_delfa1_1` collides with an
    installed DELF A1 in the shared `UCARDS` store and studies the wrong card.
  · **TWO DECKS DEFINING ONE TYPE ID DIFFERENTLY ARE KEPT APART rather than picked between, and this
    USED TO REFUSE** (Aug 2026). Refusing was right about the danger — one deck's cards rendered with
    another's templates and CSS reads as a card merely laid out oddly, not as a fault — and wrong about
    the remedy, since it stopped the whole shelf combining over a difference that harms nobody once the
    two definitions are separate objects. The second deck's type is renamed `<id>-<its deck id>`, its own
    cards are repointed at it, and the split is **printed on every run**, so it can never happen quietly.
    It is safe because a type is already scoped per (deck, type) at install (`cssScoped` prefixes every
    selector with `.uc-card[data-uct="<deckId>__<typeId>"]`), so two ids inside one deck is exactly what
    that machinery is for.
    **THE SHELF REALLY CARRIES ELEVEN OF THEM, AND THEY ARE A RECORD OF DRIFT rather than a hypothetical.**
    All six German decks call their type `goethe` with identical fields and identical templates, and their
    CSS differs by one rule: Goethe A1 styles `.uc-cj-e` and the other five `.uc-infl`, two names for the
    same marked inflection, each used by that file's own cards and by no other's — so merged either way,
    one deck's 3,546 or the others' 77,000 marked endings would silently have lost their colour. The
    Spanish C1, C2 and Phrases decks diverge from DELE A1–B2 on `en-to-es` / `es-to-en` the same way, and
    the split is the same in both cases: the decks a pipeline here GENERATES agree with each other, and
    the ones supplied ready-made carry a slightly older or newer copy of the same type. (The 44 files use
    19 type ids after splitting, from 8 before.)
  · **THE STAMP COMES FROM `meta.updatedAt`, NOT `exportedAt`.** The two pipelines write that top-level
    field differently — French an epoch integer, Mandarin an ISO string — so comparing them raises on the
    first mixed pair, and picking either convention would silently ignore half the shelf.
  **`.claude/decks/check-all-languages.js` is its browser half**, and it MEASURES as well as asserting:
  everything `check-combined.js` covers is true here by construction (the cards are copied unchanged),
  where what this file BUILDS is the branch per language, 19 card types in one file and 76,502
  renumbered ids — and, above all, whether a file this size is usable. **Measured on one machine: JSON.parse
  1.7 s in node, import visible in 63.5 s and fully written in 145.5 s, and a later boot 4.5 s with the
  deck installed** — that last being the cost every visit after the first pays, and small for its size
  because boot reads the note INDEX and no prose at all (see the Persistence bullet under COMMUNITY
  DECKS). **The import is the honest cost and it is now over two minutes**: it is ONE IndexedDB
  transaction, so it is atomic and an interrupted import leaves the old state rather than half a deck, but
  it is a real wait and the reader is told so ("Saving…"). Those timings are the evidence for the raised
  caps and the thing to **re-run** rather than re-read — they measure one file on one machine and go out
  of date the moment a language is added (at 39,830 rows / 94 MB they were 690 ms, 30.2 s, 56.8 s and
  861 ms; at 28,252 rows / 66 MB, 514 ms, 13.7 s, 31.1 s and 636 ms). **Time the boot with no settling
  wait after it**, or a fixed `waitForTimeout` lands in the figure and a fast boot reads as a slow one (it
  did: 2.1 s, of which 1.5 was mine).
  **AND ITS OWN EXPECTATIONS ARE DERIVED, NOT WRITTEN DOWN** (Aug 2026): it carried a hard-coded list of
  five languages and a `TYPES = 6`, both of which were simply stale the day a sixth language and thirteen
  namespaced type ids arrived — which is this file's own standing warning about a test pinning today's
  answer rather than the rule. `LANGS` is parsed out of `combine-decks.py`'s `PARTS` table, so a language
  added there is asserted here with nobody remembering to, and the type count became a **set check in both
  directions**: no card names a type the file has not got, and no type travels unused. Not part of the
  site.
- `.claude/split-decks.js` — **the inverse of that one: an all-languages file back into a deck per
  language** (`node .claude/split-decks.js <combined.folio-deck.json> [outDir] [--drop=Lang]
  [--add=Lang/Sub=file] [--add=Lang=file]`; Aug 2026, on request). Standalone Node, zero deps, not part of
  the site. Five decks out of the 94 MB file: **French 7,648 notes / 16.7 MB, German 13,244 / 43.5,
  Italian 11,578 / 24.7, Mandarin 11,833 / 23.9, Spanish 16,782 / 56.5**, each keeping its own subdeck
  tree below the language (HSK 3.0's nine levels, the Spanish levels' two directions). **Gitignored**, on
  the artefact rule above.
  · **ITS REASON IS NOT THE ONE IT WAS WRITTEN WITH, and the correction is the point.** It was built
    because at 94 MB and 39,830 notes the combined file was over both caps as they then stood, so the one
    file carrying everything was the one file no device could open. `combine-decks.py` then raised them to
    44,000 and 128 MB for a combined file of its own, and again to 85,000 and 208 MB when Portuguese joined
    that file's table — **so that argument is gone**, and what remains is
    the reason the reader actually gave and the caps never answered: a language per deck, so the languages
    you study are the ones you add. **The SIZE argument survives it**: app.js's own note beside
    `UDECK_MAX_BYTES` says a cap is a guard against a hostile file rather than a promise that anything
    under it imports on the device the reader studies on, and five files of 17–57 MB are a far safer thing
    to hand a phone than one of 94.
  · **THE CAPS ARE READ OUT OF app.js** (`appConst`), never restated — combine-decks.py's rule, and this
    is what it is for: both figures were written into this file as literals, and the raise above left them
    silently wrong within the hour. A renamed constant is FATAL rather than assumed.
  · **CARD IDS ARE RENUMBERED PER DECK**, the same lesson one level over: an import only mints fresh ids
    when the DECK id already exists, so a German deck carrying the `u_goethea1_…` ids of the file it was
    built from collides with an installed Goethe A1 in the shared `UCARDS` store.
  · **`--add` TAKES TWO FORMS and the difference is whether the added deck is already divided**:
    `Lang/Sub=file` files a whole deck as ONE subdeck (the seven German level files, each a flat list),
    `Lang=file` keeps the added deck's OWN tree (the Spanish DELE A1–C2 file, whose fourteen subdecks are
    seven levels × two directions). Splitting that one on its own first segment would have made seven
    decks called A1, A2 … out of one language.
  · **GERMAN AND SPANISH ARE NOT PURE SPLITS**, and it is why these five are the one set of artefacts here
    that the repo could NOT reproduce: the combined file predates both languages' later levels — German A1
    alone, Spanish only to B2 — so each is rebuilt with `--drop` / `--add` from the reader's own files,
    which are not in `decks/`.
  · **SPANISH IS THE ONE TO WATCH.** At 16,782 notes and 56.5 MB it is 38% of the note cap and 44% of the
    byte cap, which is comfortable — but it is also the only one of the five that grew by a whole exam
    ladder in a day, and the next such growth is what would need it split by band rather than by language.
  A rebuild reproduces every deck **byte for byte** (`updatedAt` comes from the files that fed each
  language, not the clock), which is the standing check here and the only way to tell a deliberate change
  from a re-run. Nothing is written unchecked: each file is re-parsed, measured against both caps, its ids
  checked unique and its notes counted back against the source.
