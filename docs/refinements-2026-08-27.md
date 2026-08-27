# The 2026-08-27 request — what shipped, what was found, and what is planned

A single request of thirty-five items, from a reader working through the site. This file is the record:
what was fixed, what the fixes turned up along the way, the four items that asked for a *suggestion*
rather than a change, and a plan for the ones not built.

**Rules live in `CLAUDE.md`; this is the reasoning.** Where an item produced a rule, the rule is in
`CLAUDE.md` and the argument is here.

---

## 1 · What shipped

### The review list and the study session

| what | where |
|---|---|
| The red LEARNING count and the session no longer disagree | `PAGES.study`'s "Still learning" placard |
| The daily review's header names the card's own deck | `cardWhereLabel` |
| The completion screen offers the next deck down the list | `adRowOrder` / `nextStudyRow` / `entryScope` |
| The progress bar underlines the row at every width | `.active-deck .dk-prog` |
| Folds survive a reload | `adFoldMap` / `adFoldSet` |
| A finished collection goes gold | `deckProgMarkup` / `adProg` → `.prog-done` |
| A card type's fold is remembered across decks | `ucDetailsKey` |
| The long-press sheet closes on the click, not the press | `deckSheet` |
| A deck download draws a real progress bar | `langDeckDownload(id, onProgress)` |

**The red-count fault is worth stating properly, because both numbers were right.** A deck row's red
figure counts LEARNING cards — everything answered wrong and not yet graduated, whether or not its
ten-minute step has come round — and that is deliberate: a count that emptied while a card sat on its
timer would say the day's work was finished when it plainly is not. The session, on the other hand,
deals what is DUE. So a deck holding nothing but a learning card three minutes from coming back builds
an empty queue, and the placard then said "you've studied everything available in this deck", which is
false while the row is showing a red 2. **The placard was the thing that was wrong**, and it now says
what is happening, names when the next step comes round, and offers to take them early — Anki's
learn-ahead. Nothing about the schedule is bent to do it.

### The Atlas, the whiteboard, the account page, the games

- **The Atlas popup never scrolls sideways and hides its scrollbar.** Three causes wearing one coat: a
  grid item's `min-width` is `auto`, so a citation link — whose visible text IS a URL and which contains
  no break opportunity — widened the track rather than being contained by it; `overflow-x:clip` beside an
  untouched `overflow-y:auto` is the one pairing that stops sideways scrolling without making a second
  scroll container; and the bar itself reads as a seam in the map down a narrow column.
- **Tablets get the phone's sheet.** The breakpoint was a `matchMedia("(max-width:720px)")` in app.js
  beside a `@media (max-width:720px)` in the stylesheet — one decision written twice in two files. It is
  now `--cp-sheet` on `.country-pop`, declared once and read back by `cpSheetMode()`, the move `tourPlace`
  makes when it asks its own overlay for its computed `align-items`. A custom property rather than a
  geometric read-back, because `getComputedStyle().top` on a positioned element hands back the USED value,
  so `top:auto` cannot be told from `top:16px` that way.
- **The whiteboard marker takes its drag origin when the DRAG starts, not when the press lands.** Two
  things move the element in between and both were the reported jump: `.wb-tools` carries
  `transition:bottom .34s` for the grade bar's sake and `.wb-dragging` — which turns that off — was added
  only once the slop was passed, so a press landing while the marker was still travelling anchored to a
  stale rect, and the gap is the whole 90px between `bottom:18px` and `body.grading`'s 108 (152 on a
  phone). And the slop itself: anchoring at pointerdown applied the whole delta on the first qualifying
  move. Re-reading the rect when the drag takes over fixes both without depending on which caused a given
  report.
- **The account page's four identity buttons stay a 2×2 grid on a phone.** They were a flex row that
  wrapped, so each took whatever width its neighbours left it and the long labels overflowed their border.
- **Who said it? deals five rounds again.**

### The About page

- The beta card moves under Common questions.
- **The Library's sources are counted off the shelf.** Two `<li>`s named five books and their translators,
  written when the Library held five; by the time they were checked the shelf held forty-eight from five
  archives, of which **Project Gutenberg (6 books), the Internet Archive (2) and Global Grey (1) were
  credited nowhere at all**. `bookSourceCredits()` derives the rows from `BOOKS`, so the count cannot
  drift and a new archive appears the moment its first book does. The per-edition attribution — the
  translator, the reviser, the year, the ground the copyright expired on — is printed by each book's own
  page, which is where a reader meets the text and where CC BY-SA attribution belongs.
- **Anki loses its licence chip.** The line says outright that Folio shares no code with Anki, and a
  licence chip beside it reads as "used under AGPL-3.0", which is a claim Folio does not make.
- **The hosting line goes.** No licence obliges it and it says nothing about where the content came from.

**What was deliberately KEPT, and why**, since the item asked for anything that "doesn't legally have to
be mentioned" to be removed. Under a strict reading that is most of the list: Wikidata is CC0, Natural
Earth and the Wikisource texts are public domain, Terrain Tiles is open data, and Google Fonts is loaded
from Google's CDN rather than redistributed, so none of them compels a notice. They stay because **they
are not licence compliance, they are provenance** — a statement of where the site's content came from,
which is a Folio value rather than a legal obligation, and a credits page cut to the four compelled
entries would be a worse page. The one line that was neither was the hosting line, and that is the one
that went.

### Content

- **`Middle Paleolithic`** gave two different end dates: the date line and the background said 300,000–50,000
  BP and the second question said 300,000–40,000. The question is corrected, and the closing sentence no
  longer says the Upper Palaeolithic begins at 40,000 either — it follows from about 50,000, overlapping
  Europe's last Neanderthals, which is what the cited Higham paper is actually about.
- **`Paleo-Indians`** linked "the Archaic period" to the gloss for the GREEK archaic period. There is now
  a cited term for the North American one and the card links it by hand. See §3.
- **`Agora`** gave six of its ten sentences to three particular agoras. It is three now, block one is
  wholly general, and all six citations are still referenced.
- **China's Atlas description** gave three of its five second-block sentences to American trade history —
  1784, 1844, 1972 — because the recognition guide is written from the American point of view. It now
  states China's own figures from UNdata and the World Bank, dates its UN seat to resolution 2758, and
  keeps one sentence on 1972.
- **Language decks**: see §2.

---

## 2 · What the fixes turned up

### 110 wrong Mandarin readings, from one reported card

饭馆 printed "fàng uǎn". The `g` had moved across the syllable boundary — "fanguan" split as fang+uan
rather than fan+guan, the n/ng ambiguity, and the one segmentation error that still looks like pinyin.
**Every one of those cards carries the reading twice**, in `pinyin` and in `Bopomofo`, produced
independently; zhuyin writes the initial as a symbol of its own, so it pins the boundary exactly.
`.claude/decks/check-pinyin.js` compares the two and found **29 migrated consonants** (饭馆, 办公室, 蛋糕,
参观, 员工, 人工智能, 尴尬, 观光 …), five words whose notations count different syllables, two with a bare
"r" where erhua belongs on the syllable before it, and 68 written as one word where the other 11,000
separate them.

Two things about the repair are worth keeping:

- **It moves the SPACES and never the letters.** The corrected spelling is derived from the card's own
  zhuyin, and then the ORIGINAL characters are re-split at those boundaries — so a tone-sandhi spelling
  (`bú kè qi`, `yí huìr`) survives untouched. A first pass that simply took the converter's output
  rewrote 345 cards and silently un-did the sandhi; it was reverted.
- **Nine cards were wrong the other way round** — the pinyin right and the bopomofo wrong (抽查, 核查,
  返还, 非得, 器重, 强劲, 藤蔓, 免不了, 标识). Their zhuyin is rebuilt from a syllable table read off the
  11,000 cards where the two already agree, and each is round-tripped back through the converter before
  it is written.

The zhuyin→pinyin converter was **validated before it was trusted**: it reproduces 11,466 of the 11,500
shipped readings letter for letter, and the 34 it does not are the erhua convention plus the nine genuine
disagreements. The Mandarin decks' own inputs (`w26-*.json`) are not in the repo, so they cannot be
regenerated; these files are edited in place and the checker is what keeps them honest from here.

### 1,953 cards showing the same example twice

Two mechanisms. The Indonesian pipeline picks a sentence once per SOURCE and dedupes by index — and an
index means nothing outside the corpus it came from — so a line carried by both Tatoeba and Wiktionary
appeared twice, identically. Three cards did that. Far more often the target sentences differ while the
English is word for word the same: Tatoeba carries "Du bist / Ihr seid / Sie sind gegen das Virus nicht
immun" as three sentences and translates all three "You're not immune to the virus", so a card spent all
three of its example slots saying one thing. The first of each is kept and the rest dropped;
`.claude/ukbi/examples.py` now dedupes across its three sources.

### Five glosses that were the wrong sense

| card | shipped gloss | its own examples say |
|---|---|---|
| `assim` (pt) | "full of; replete" | "…like that", "…this way" |
| `estou` (pt) | "hello (answering the telephone)" | "I'm sorry", "I am accustomed", "I am so hungry" |
| `natale` (it) | "native" | all three about Christmas |
| `bang` (id) | "a sudden percussive noise" | all three about a bench |
| `la mi` (es, **A1**) | "mu, the Greek letter Μ" | "**My** mother often suffers from headaches" |

Every one is a real dictionary sense of a real word, taken from an entry that ranks the obscure above the
ordinary — or, for `bang`, from the ENGLISH section of a word spelt the same way. Nothing about the cards
is malformed, which is why nothing caught them.

**`bang`'s examples were about a bench because the Indonesian clitic rule reads `bangku` as `bang` + the
possessive `-ku`, and `bangku` is a word of its own.** The examples are removed; the family matcher needs
a look and that is noted rather than done.

---

## 3 · The four items that asked for a suggestion

### "Think of a way to avoid such double meanings in the future" (the Archaic period)

Two answers, and both shipped.

**The structural one.** `glossKeyTitle` strips a trailing `_(…)` from a key, because a Wikipedia slug
carries one for DISPLAY reasons — and a slug carries one for exactly one reason, which is that the bare
name is ambiguous. Stripping it and then registering the result as an auto-link surface is therefore the
one thing that must not follow: adding `Archaic_period_(North_America)` would have made it compete with
`Archaic_period` for the phrase "Archaic period", and which won came down to their order in
`glossary.js`. **A parenthetical key no longer claims its bare name.** It can still claim it deliberately,
with an alias — which is how all five parenthetical keys that predate the rule were already written
(`Georgia_(country)` carries "Georgia"), so nothing changed for any of them and only the accidental claim
is gone.

**The measurable one.** `.claude/check-gloss-links.js` resolves every auto-link in every card's
background and reports one whose term is bound to a different part of the world. A tag counts as a PLACE
tag when the glossary itself holds a term of that name whose own kind is a place kind, so the list of 450
places is derived from the data rather than written down. It is narrowed to the homograph-prone KINDS —
era, period, culture, industry, event — because a card on Olduvai Gorge saying "Africa" means Africa, and
reporting those buried the real findings a hundred to one. **34 findings, and it catches the reported one
exactly** (verified by running it against the card's pre-fix prose). It also reports, exactly rather than
as a proxy, two keys competing for one surface.

One finding on that list is worth a look: **`rm-022` Etruscan civilisation links "Archaic periods" to the
Greek term**, which is the same fault one collection over.

### "In many language cards, the definitions do not match the way they are used in their examples"

**The cards carry their own evidence and nothing was reading it.** Each one comes with up to three real
example sentences and an English translation of each, drawn from a different corpus by a different stage
of the pipeline. Where the gloss is wrong, the examples agree with each other and disagree with it.

`.claude/decks/check-senses.js` measures content-word overlap between the gloss and those translations,
and ranks what disagrees. **12,230 of 52,841 cards (23%) share no content word with any of their
examples** — which is why it is a REVIEW LIST and not a gate: a correct gloss is often a synonym of what
the sentence says ("to sprint" over "he ran off"), and a list a quarter of which is right teaches the next
person to ignore it. The ranking is what makes it usable: a word appearing in at least two examples and in
none of the gloss is the shape all five reported cards had, so those float to the top.

**The durable fix is upstream, and it is a ranking change rather than a checker**: the pipelines should
prefer the sense whose gloss the card's own examples support, which is computable at build time with
exactly the measure above. That is a change to five Python pipelines and is not made here.

### "On daylight mode, the gold icons in the active collection banners don't look very good"

The mark is `#C39A2E` on `--card`, which is **3.6:1** — below the 4.5:1 text bar, though it is decorative
(`aria-hidden`) and the collection is named in words beside it, so it is not a contrast failure. What it
looks like is *washed out*, and there are three ways to fix that, in order of preference:

1. **Give the icon the collection's own hue instead of the gold.** Every banner already carries
   `--coll-bg`; the icon is the one thing on the row that does not use it. It would read as belonging to
   the collection rather than as a medal, and the daylight problem disappears because the hues are chosen
   against the paper. The cost is that the gold currently ties the icon to the level badge and the earned
   badge — but the level badge is gone (Aug 2026), so that tie is to nothing.
2. **Darken the gold in daylight only** — `#A8801F` on light paper (5.4:1), keeping `#C39A2E` at night.
   One rule, no other change, and it is what `body.hc` already does for this token.
3. **Give it a hairline.** A `stroke` at 40% ink under the gold fill lifts it off the paper without
   changing the colour. It is the smallest change and the least effective.

**Recommendation: (1), falling back to (2).** Both are one rule; neither is made here, because which of
them is right is a question about how Folio wants a collection to read rather than one about contrast.

### "Suggest ways to increase consistency in formatting and quality across all language collections"

The decks come from five separate pipelines plus several supplied ready-made, and they have drifted. What
the audits above actually measured:

1. **Pinyin was written two ways in one language** — 68 of the Mandarin cards set a multi-syllable
   reading as one word where the other 11,000 separate the syllables. Fixed, and `check-pinyin.js` holds
   it.
2. **Example counts vary** — 1,953 cards were padding three slots with one sentence. Fixed.
3. **The gloss shape differs between pipelines**: CILS emits `<div class="uc-pos">` with no `uc-sense`
   wrapper, CAPLE/DELE/UKBI wrap. Harmless to the eye, and it means no single selector styles them all.
4. **Field names differ per language** (`Spanish` / `Portuguese` / `Indonesian` / `Simplified`), which is
   why every audit here has to guess which field is the headword.
5. **`answer` / `answerText` are populated in some decks and `undefined` in others** — the CILS and UKBI
   decks leave both empty and rely on the type's templates.

**The proposal is one checker, not five rewrites**: `.claude/decks/check-all-languages.js` exists already;
extend it to assert a shared CONTRACT — every card has a headword field, a gloss, `answerText`, between 0
and 3 examples with no repeats, and a gloss whose shape one selector can style — and run it in CI. A
contract that is checked is the only kind that stays true across five pipelines nobody runs together.

---

## 4 · Planned, not built

Each of these was specified clearly enough to build and is left because the session ran to its useful end
elsewhere. They are in rough order of value per unit of work.

### A · A deck download that does not repaint the page (the second half of item 8)

The bar shipped; the repaint did not. `uImportDone(r, true)` calls `renderInPlace()`, which already drops
the scroll-to-top and the entrance animation — what is left is that the whole of `#view` is rebuilt, which
is what a reader sees as a refresh.

**The fix is a factoring, not a feature**: pull the review list's build and its wiring out of `PAGES.home`
into `renderReviewList(hostEl)`, so the download path can rebuild `.active-decks` alone. Everything the
list needs is already derived (`adRowOrder`, `adCounts`, `adProg`, `adIcon`, `setupDeckDrag`,
`adSyncFold`); what is not factored is the boundary between "build the page" and "build this list".
Roughly 150 lines moved and one new call site. **It also unblocks item 12 below**, which needs to repaint
the same list on every edit.

### B · The editor mode for the active decks (item 12)

Asked for: the drag handles go invisible and the banner contents shift left; a button appears **bottom
left, just below the list and vertically centred against the study timer**, which opens an editor mode
with handles on the left, red crosses on the right and titles editable by clicking; the button becomes
three (save, exit, undo) and the study timer hides until the mode closes.

The pieces that already exist: `.dk-grip` and `setupDeckDrag` (the handles and the drag), `removeActive`
(the cross), `groupRename`'s inline editing (the title), `.rv-foot` (the row the button goes in, which is
currently drawn only when there IS a timer — it will need to be drawn unconditionally), and `S.deckOrder`
/ `S.deckGroups` (what a save writes).

**The open question is what save/undo mean**, and it changes the design completely:

- **Live with an undo stack** — every edit applies at once, Undo pops one, Save just closes. Small: the
  drag and the remove already write through `save()`, and `adminUndoStack` is a model to copy.
- **Staged** — edits accumulate in a working copy and nothing touches `S.active` until Save, with Exit
  discarding. Larger, and it needs the list to render from the working copy rather than from state.

This is asked in the follow-up questions rather than guessed at.

### C · The Reliquary on its own page, sortable (item 37)

Today it is an overlay raised from the account page (`openCollectionWin`). The page wants:
`PAGES.reliquary` at `#reliquary`, its `PAGE_META` row, the `valid` route list, and a sort picker over
alphabetic / unlocked date / artefact dating / rarity, each reversible.

Three things the existing code decides for us. The plate is ONE builder (`artefactPlateHTML`) and must
stay so. The sort belongs in a **module-level variable, not in `S`** — it is a way of looking at a list
rather than a preference about Folio, which is the call `PAGES.glossary`'s own picker and
`renderDeckStats` both make. And **"unlocked date" needs a field that is not currently stored**:
`S.artefacts` records which, not when. Adding `S.artefactAt[id] = ts` is a one-line change to
`spendChest` but it cannot be backfilled, so artefacts already owned sort last (or by id) and the picker
should say so rather than inventing an order.

### D · Long-press a minigame tile to flip it (item 25)

`wireHoldMenu` already classifies a hold and is used by the deck rows and the review banner, so the
gesture is free. The FLIP is `.badge`'s (`.badge-front` / `.badge-back` with a 3D rotation) and can be
reused as-is.

**What is not free is the "site-wide average".** There is no table of game scores: `S.games[key]` is
device-local and `progress` is RLS-scoped to its owner, so an average across readers needs a schema block
of the shape `card_stats` already has — an anonymous per-game counter with a `bump_game_scores()`
security-definer function. Until that exists the back of the tile can honestly show **the reader's own**
record (played, won, current streak, best) and say that the site-wide figure is not collected, which is
the same line the admin Dashboard takes about `progress`.

### E · Reading time per book, and lifetime study time (items 27, 28)

Study time is **already measured**: `S.timeToday` and the ticker in `PAGES.study` (see "TIME ON CARDS
TODAY"), which is self-stopping on `root.isConnected`, counts only while a card is painted and the tab is
visible, and saves once a minute. Two things are missing and both are small:

- a **lifetime total** — `S.timeTotal += gap` beside the daily one, in `PROGRESS_FIELDS`, shown on the
  account page beside the existing meters;
- the **same ticker in `PAGES.book`**, writing `S.reading[bookId].secs` — the record already exists and
  already syncs, so it is one more field on it.

Badges then read `progStats` exactly as the fifteen collector's badges do, and are tested at the moment
they are earned. Suggested thresholds, to be confirmed: 1, 10, 50, 100 hours studied; 1, 5, 25 hours in
one book, and 100 hours across the Library.

### F · Card locator maps showing the collection's other places (item 22)

`cardMapSpec` / `startCardGlobe` draw one place today. The ask is: the other cards' places in the same
collection as smaller red dots, plus the Atlas's capitals, its million-plus cities and its rivers, with
river names shown only where the river is itself a card in the collection.

The data is all present and all lazy: `glossPlace` already gives a term its coordinates
(`.claude/fetch-place-coords.js`), `cities.js` carries the city tiers the Atlas already thins with
`CITY_SEP`, and `rivers.js` is in the `atlas` bundle. **The cost is the bundle**: a card locator today
loads `usstates` alone, and this would put `atlas` (~600 KB) and `world` behind every history card that
shows a map. That is the decision to make before any code — either the extra layers are drawn only once
those bundles happen to be loaded (the Atlas has been opened this session), or the locator becomes a
deliberate second fetch with the load bar the Atlas already has.

### G · A book quotation inside a card's background (item 24)

Where a card cites one of the Library's own books, put the cited lines between sentences five and six with
a button that opens the book at that section.

The join exists: a citation is a Chicago note ending in a URL, and `BOOKS` carries `sourceUrl` — but
matching a card's source to a book by URL is not enough, because **what is needed is the SECTION**, and
`#book/<id>` has no section fragment today. So this needs three things: a way to name a passage
(`#book/<id>/<n>` and `PAGES.book` honouring it), a field on the card (`quote: { book, n, text }` —
authored, not derived, because choosing the cited lines is a judgement), and `add-card.js` validating that
the book and section exist. **The quotation must be authored rather than extracted**: a card cites a
whole letter or chapter, and picking the sentences that discuss the topic is exactly the editorial act the
citation apparatus exists for.

### H · One card per paradigm for articles and pronouns (item 36)

Asked for: an article or a personal pronoun should be one card listing all its forms rather than a card
per variant.

This is a **deck regeneration**, not an app change, and the inputs for most of the pipelines are not in
the repo (see §2). Where it can be done it is a `select.py` change: group the inventory by lemma for the
closed classes (articles, personal and possessive pronouns, demonstratives), emit one note whose `Forms`
field carries the paradigm, and drop the variants. The DELE and CAPLE decks already have a `Forms` field
built for exactly this.

**It cannot be done to the shipped decks by editing them**, because merging notes changes card ids, and a
card id is a reader's schedule. A deck that merges `mi`/`mis` into one note retires two ids and creates
one, and every reader who has studied them loses that history. So this is a **new deck version** with the
migration that implies, or it is not done — which is the honest answer and the reason it is not attempted
here.

### I · The TTS and the noun articles (item 5)

Read-aloud is disabled site-wide (`ttsEnabled()` returns `false`), so this is about the community decks'
own `.uc-tts` control, whose `data-say` is written by each pipeline. Where a noun's article is in a
separate field or in the bolded head word, `data-say` carries the bare noun. The fix is in the emitters:
`data-say` should be the form a learner would say aloud, article included. One line per pipeline, and
`check-all-languages.js` is the place to assert it.

---

## 5 · Two findings that are nobody's item

- **384 MB of narration audio ships for a feature that is switched off.** `audio/` holds 2,086 committed
  mp3s for 177 card ids, of which **38 still exist** — the rest are the pre-2026-08-04 China numbering.
  While the files are distributed the Piper / LibriTTS-R / VCTK credit is genuinely required, so the
  credit stays; but the files themselves are dead weight in every clone and every deploy. Deleting them is
  a decision about whether narration is coming back, which is why it is reported rather than done.
- **`docs/glossary-length-plan.md` and `CLAUDE.md` both say the glossary holds 477 terms.** It holds
  **1,254**, all of them cited and at the bar, and all inside the 90–110 word band. The prose is three
  passes out of date.
