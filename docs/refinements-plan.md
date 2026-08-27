# Refinements plan — Aug 2026

One request, ~60 items, divided into batches so each ships as a reviewable commit. A batch is a
group of items that touch the same code or the same corpus, so the diff reads as one change and one
re-run of the same tests covers it.

**The four scoping decisions, taken on request before any of it was written:**

- **Collectible themes are the five non-`folio` themes we already ship.** `folio` stays the default
  everyone has. A reader already using one of the five KEEPS it — grandfathered at boot — because a
  feature that takes away a theme somebody chose is a punishment rather than a reward.
- **The community difficulty rating is an ANONYMOUS AGGREGATE**, four counters per card in a public
  table, no per-user rows, switching over at **20 answers**. Nothing identifies who answered what.
- **British/American English is a DISPLAY-TIME TRANSFORM**, modelled on the metric/imperial switch:
  content stays authored in en-GB and a text-node pass rewrites at render. One system; no field is
  authored twice, so a card written next year is covered without anybody remembering.
- **The two very large content passes get a plan doc and a first batch each**, the shape the citation
  passes used: `docs/atlas-rewrite-plan.md` and `docs/book-text-plan.md` fix the format, the source
  bar and the batch table, and batch 1 of each proves the shape.

## The batches

| # | Batch | Items |
|---|---|---|
| A | Study flow | the day boundary for due cards; ordered mode mixing new with review; undo stepping back two cards; a suspended new card not counting against the day's allowance; the grade bar's fold jamming; "Difficulty" written beside the stars; a way back to studying from the editor |
| B | Deck settings | the third review order (By difficulty) and the cycler that presents it; settings cascading to subdecks with an override mark; read-aloud on by default |
| C | Shell layout | the Collections button replacing the lip; the completed-review button; admin drag on the Collections page; Your decks collapsible; the shared-decks row on one line; the account page's 2×2 button grid; the streak chest's icon; the Reliquary moving into the showcase; the Library chips; loading bars |
| D | Collectibles | badges for sharing a deck, for chests and artefacts, for glossary terms, books and hours in a day; themes as chest items; the friend banner wearing its owner's theme; the admin Themes tab; the dashboard's dev figures |
| E | Minigames | Who said it at three rounds with same-category distractors and a larger pool; the picture round's difficulty and kind filters; more True-or-False statements; the wax sigil |
| F | Reading surfaces | the Atlas place sheet's chevron; a book's own glossary term linking to the shelf; the whiteboard's remembered size, its off switch, its pass-through and its renamed row; the War of Ages page and the admin colour in the bar |
| G | Maps on cards | the geography answer grid's order; flags beside the answer; an Atlas window on a history card about a place |
| H | Content corrections | the eighteen named cards, terms and pictures, plus the question-rule audit — and the two date lines `test-date-line.js` has been reporting since before this work began (`wh-177` states two CENTURIES and `wh-178` two MILLENNIA, neither of which `cardYears` reads, so both cards sort as timeless; write the span each unit means, per the date-line rule) |
| I | Authoring | collection icons a reader can set; the About page's AI prompts and the link to them — **shipped** |
| J | Cross-cutting | the two difficulty ratings; the en-GB/en-US switch; the changelog's day titles — **shipped** |
| K | Large passes | the Atlas info-box rewrite (plan + batch 1 — **shipped**); the book text corrections (plan **shipped**, B1 **shipped**, B2–B8 and E1–En open) |
| L | Late corrections | undo stepping back to the previous card's QUESTION; the War of Ages tab renamed Project W; an unlocked theme naming the day it was unlocked — **shipped** |
| M | Language decks | the language decks listed on the Collections page in a Languages section of their own — **shipped** |
| N | Late corrections | the Dressel 20 picture and the artefacts' context-free descriptions; the Clean Sweep badge's wording; the Editor/Visitor chip and the Project W tab out of the menu bar — **shipped** |
| O | Language collections | the language decks presented as official curated collections, one collection per language inside a single Languages section — **shipped** |
| P | Late corrections | a card's state as a coloured dot beside the QUESTION label; the Lefkandi picture; the no-modern-scholars rule in a question or a background, with its two stated exceptions; the theme picker showing only what has been unlocked, and not appearing at all until one has — **shipped** |

**Five items arrived after the batches were drawn** (Aug 2026, with the request to proceed). Three are
small and sit together in a new batch L; one refines an item batch J already carried, and is done there
rather than twice; one is a feature of its own and gets batch M.

- *undo back to the question* → **L**. It stepped back to the previous card REVEALED, on the grade row;
  the request is the question, so the reader answers it again rather than reading the answer again.
- *War of Ages → Project W* → **L**. The visible text only: the route id stays `warofages`, which is the
  World War II rename's rule (the ids and the prefix are untouched; only what a reader is shown moves).
- *an unlocked theme's date* → **L**. The date is ALREADY stored — `unlockTheme` writes `Date.now()` —
  so this is a display change, with the one honest exception that a GRANDFATHERED theme carries 0 and
  has no date to name.
- *the community rating measured over a card's first three sightings* → **J**, folded into that batch's
  own difficulty item rather than shipped separately: it changes what `bump_card_grades` is called WITH,
  which is the same code the rating is built out of.
- *the language decks on the Collections page* → **M**, its own batch: it is a catalogue, an eager
  registry and a fetch-and-import path, which is more than the two authoring items beside it.

**Four more arrived with the next request** (Aug 2026). Three are corrections and sit together in
**N**; the fourth reverses what M shipped and gets **O** of its own.

- *the Dressel 20 amphora's picture, and artefact descriptions that assume no context* → **N**.
- *the Clean Sweep badge's wording* → **N**. The badge already required a PERFECT score in every
  game; only its description said "win", so this is the wording catching up with the rule.
- *the Editor/Visitor chip and the Project W tab out of the menu bar* → **N**. The TABS only: the
  route, `PAGES.warofages`, its `PAGE_META` row and `ADMIN_ROUTES` all stay, because the request
  says "in the menu bar" and "for now", and the page is admin-gated so nothing reader-facing is
  left. Putting the tab back is one markup block.
- *the language decks as official curated collections* → **O**, and it must land BEFORE batch I,
  whose collection-icon work would otherwise be built on a presentation about to change.

## Rules that hold across every batch

- **Bump `FOLIO_VERSION` and write the changelog line in the same commit**, once per batch, per the
  golden rule. `released` is CAPTURED off the clock in UTC, never composed.
- **Re-run the tests each batch names**, and `node --check app.js` before every commit.
- **English only** — `MULTILANG` is false, so no new content carries its nine translations.
- **Nothing is invented**: a corrected date, a new citation and a replaced picture each rest on a
  source that was actually opened.

## Where the work has got to

One line per batch as it ships, so a session picking this up mid-way can see the boundary without
reading the diff. **A batch is "shipped" only once its named suites are green, its changelog line is
written and its version is bumped** — the three go in one commit, per the rules above.

- **A — Study flow.** Shipped `8188840`. `test-scheduler.js` 136/0, `test-review-decks.js` 140/0,
  `test-difficulty.js` 69/0, `test-layout.js` 315/0, `test-a11y.js` 9/0. Its accessibility extension
  (a study card added to `ROUTES`) turned up a defect of its own — every one of the grade bar's twelve
  text-on-colour combinations was below 4.5:1 in High contrast mode, and had been since the bar was
  built, because nothing had ever measured a study card. Fixed by darkening the eight backgrounds
  rather than re-toning the ink, the four colours being what the four answers MEAN.
  **Two date lines are left for Batch H** (`wh-177`, `wh-178`) and were failing before this work began.
- **B — Deck settings.** `test-review-decks.js` 144/0 (four new cycler assertions), `test-speak.js` 32/0,
  `test-card-types.js` 228/0, `test-deck-ux.js` 49/0.
  **`test-card-types.js` had been running 87 of its 228 assertions and reporting "82 passed"** — five of
  its sheet rows were pressed inside `DECK_SHEET_ARM_MS`, so the first preset click did nothing and the
  browser half aborted there. Pre-existing (confirmed against HEAD with the batch stashed) and fixed
  here rather than left, since a suite this batch names cannot be read while it aborts; see the
  `⚠ IT RAN 87 OF THEM` note under that file in CLAUDE.md.
- **C — Shell layout.** `test-layout.js` 315/0, `test-library.js` 333/0, `test-publish.js` 138/0,
  `test-artefacts.js` 68/0, `test-subdecks.js` 30/0, `check-nesting.js` 28/0, `test-streak-chest.js`,
  `test-tour.js` 70/0, `test-a11y.js` 9/0, `test-reset.js` 21/0.
  **The Your-decks fold is the item that reached furthest.** Making a community deck's subdecks look
  and behave like a curated collection's meant giving them the curated tree's OWN markup — `.node` /
  `.node-main` / `.node-title` / `.node-count` inside `.node-children`, wired by `wireExpander` — so
  the grid fold, the stagger, the card box, the hover and the collection hue all come free and cannot
  drift from the curated ones. `.udeck-subrow` survives as a modifier carrying the depth indent alone,
  and every `data-*` attribute is untouched, so the `[data-usub]` wiring needed no change.
  **The old class names were TEST HOOKS and nothing else** (`.deck-title` styled nothing anywhere), so
  four suites read them and three broke: `test-publish.js`, `test-subdecks.js` and `check-nesting.js`
  are updated to the curated names, and `check-nesting.js`'s depth probe now reads
  `marginInlineStart` — the indent moved from a padding to a margin when the row became the same 46px
  box as its parent.
  **AND A SHUT FOLD IS UNCLICKABLE, WHICH IS THE POINT AND ALSO THE TRAP**: a curated collection's
  decks start folded, so these do too, and a subrow's `+` is in the DOM and clipped to zero height —
  anything reading it may go straight to the markup, and anything PRESSING one has to open the deck
  first, exactly as a reader does (`openFolds` in `test-subdecks.js`).
  **The load bar counts FILES, not bytes**, and is drawn only where a bundle set has two or more of
  them (`dlBarHTML` / `wireDlBar`). Byte progress needs `fetch()` plus running the text, i.e. an inline
  script, which `script-src 'self'` forbids — so the honest choices were a per-file bar or none, and a
  bundle of one large file keeps its spinner rather than showing a bar that jumps 0 → 100. The Atlas,
  which is the load anybody actually waits for, is twelve files: measured in a browser it steps
  8, 17, 25, 33, 42, 50, 67, 75, 83, 92.
- **D — Collectibles.** `test-artefacts.js` 77/0 (a new section 3b), `test-layout.js` 315/0,
  `test-publish.js` 138/0, `test-account-page.js` 16/0, `test-reset.js` 21/0, `test-streak-chest.js` (all pass).
  **`test-account-page.js` had two assertions left stale by Batch C** — the account actions became a 2×2
  grid and "See all 2" became "See Reliquary" with the count moved into the title — which is what a suite
  a batch does not name looks like a batch later. Rewritten to the current rule rather than relaxed: two
  columns and four buttons of ONE width is a stronger claim than "are they on one row", and the count is
  read where it now lives.
  **The one decision that shaped the rest is where a worn theme lives.** A theme is now both a collectible
  and how an account presents itself to its friends, and the obvious home — the synced progress blob — is
  wrong twice over: `progress` is RLS-scoped to its owner and their accepted friends, so a friends list
  would have to fetch every friend's whole blob to read one string, and an editor counting themes could not
  read it at all. It goes on `profiles` (schema **section 14**, one column plus a column-level grant), which
  is readable by any signed-in user — and that single choice serves the friend banner AND the admin Themes
  tab, which is why both landed together.
  **The chest balance stopped being a subtraction**, which is the finding the test caught rather than a
  reader: the collector's badges are earned by opening chests and every badge grants a chest, so
  `test-artefacts.js`' 32-chest sweep no longer ends at `40 - 32`. What is invariant is `chestsOpened`, and
  the balance is now asserted against the badges earned along the way.
  **A theme's picker button stays PRESSABLE while locked** — Chrome fires no mouse events on a `disabled`
  button, so marking it disabled would take the hover try-on away from exactly the themes that most need
  advertising. `setTheme` refuses a locked id; the click toasts the reason.
  **And the dev figures are MEASURED rather than asserted.** Folio has no server to ask, so the dashboard's
  Delivery card reads the browser's own Resource Timing — what was actually sent over the wire, what was
  already cached, the eight biggest files — and says outright that where readers connect FROM is not
  collected and is not guessed at, which is the People card's own rule about RLS applied to a question no
  policy could answer either way.
- **E — Minigames.** `test-minigames.js` 82/0 (a new WHO SAID IT section), `test-difficulty.js` 69/0,
  `test-layout.js`, `test-a11y.js`.
  **The decoy ladder is the item that reached furthest.** Who said it? already preferred a speaker of the
  same CATEGORY, and a category alone is not narrow enough — a Stoic maxim answered against Nietzsche,
  Kant and Simone de Beauvoir is a round a reader wins by noticing which name is two thousand years older
  than the other three. Every entry now carries an `era` as well, and `buildWhoSaidRounds` fills a round
  from a four-tier ladder: share both, share the category, share the era, anybody. **The ladder's outcome
  is EXACT rather than a preference**, because the greedy fill is determined by the cumulative tier counts
  — so the test computes those in the page and requires every decoy to come from at or above the smallest
  tier the fill must reach, which degrades honestly on a thin cell and cannot go stale when the pool is
  edited.
  **TWO CELLS HOLD ONE PERSON EACH AND ARE LEFT THAT WAY** (reform/earlymodern, science/medieval), named
  in `quotes.js`'s own header rather than padded: inventing a companion for a cell is how a pool acquires
  a speaker nobody has heard of, or a quotation nobody said.
  **The picture round's two filters cost the test its fixture, which is the finding.** The glossary half
  now goes through `threadEasyKeys()` and either half may be refused by `PIC_ABSTRACT_KINDS`, so the
  section's planted pool — the first ten glossary keys — yields NO POOL AT ALL. It is planted on the
  ARTEFACTS instead, which `picturePool` takes unconditionally and says so in its own comment: an
  artefact is a photograph of one object, carries no difficulty and is filed under no kind. The section
  then asserts the ROUND rather than re-asserting the pool rules.
  **AND A SHIM OF A RULE IS A COPY OF IT.** `[xw] the page's grid is the one the date deals` had been
  failing with "no matching day" since the Geography collection landed: `gameCardIdSet` excludes a MAP
  CARD (its clue is its picture, so dealt cold it asks "the state shaded on the map is ____" with no map
  beside it) and the Node builder's shim did not, so the two drew from pools five cards apart and
  compared two genuinely different grids. It reads as a SEEDING fault rather than as a stale shim, which
  is why it sat there; the shim carries `cardMapSpec` now.
- **F — Reading surfaces.** `test-layout.js` 321/0, `test-library.js` 333/0, `test-sources.js` 81/0,
  `test-atlas-places.js` 16/0, `test-a11y.js` 9/0.
  **The Atlas sheet lost a control rather than gaining one**, which is the shape of the request: it had
  two ways to open — a drag handle on the title bar and a chevron — and two answers to one question is
  what made the sheet feel arbitrary. The drag, its stored height and the whole `cp-resizing` path are
  gone; what is left is a fold with two positions, and because a `display:none` cannot be transitioned the
  class is applied at the two ENDS of the movement (removed at once when opening, so the content is there
  to be revealed and measured; applied after the transition when shutting). The chevron is drawn bare, the
  boxed tile behind it having read as a second control beside the ×.
  **A BOOK'S GLOSSARY TERM IS JOINED TO ITS BOOK BY A DECLARED TABLE, NOT BY ITS TITLE.** Matching the two
  by name was measured first and is worse than useless: folded on both sides it finds three of forty-eight
  books, and loosened enough to find more it offers five COUNTRIES as Plato's Republic. Three rows
  (`GLOSS_BOOK`) say what the join is, which is the codebase's own pattern for a judgement —
  `ENTITY_SINCE`, `SUPPLEMENT`, `RENAME`, `FORCE_POS`. The banner is the shelf's own tile in miniature and
  reads `--bk-accent` rather than `--tile`, so it takes the day and night mixes the shelf already derives.
  **The marker's remembered width stores the WIDTH and not the tool**, because a size click also puts the
  pen down — restoring the tool would have the marker start drawing over a page the reader has only just
  opened. Device-local, like the custom colour and where the marker sits.
  **A FOOTNOTE MARKER AND A PICTURE ARE `TIP_SEL` TARGETS, NEVER `CTL_SEL` ONES**, and the picture is the
  case that makes it plain: claimed at pointerdown a picture could not be drawn on at all, which is what a
  marker is for. Tapped they open; drawn across they take ink.
  **AND AN ADMIN-ONLY ROUTE IS REFUSED IN TWO PLACES, BECAUSE THERE ARE TWO DOORS.** `ADMIN_ROUTES` covers
  `route()`; boot renders directly and needs its own line — which `#warofages` reached a visitor through
  for an hour. The boot refusal is PROVISIONAL and deliberately leaves the address alone: at that moment
  nobody knows whether this reader is an admin, and rewriting it then would take `#admin` away from an
  editor whose session merely had not been restored yet. `bootAdminSettled()` is called on every path
  where the answer IS known — an admin is sent back to the page they reloaded, everyone else has the
  address corrected — which is the `#community` redirect's rule with the tense fixed.
  **`test-layout.js`'s Edit-tab assertion had been reading `.tabbar .tab-admin`**, a proxy that was unique
  until this batch gave that class a second wearer. It reads `[data-route='admin']` now, and the rule it
  was standing in for — no admin-only tab is visible to a reader, and the typed address turns them back —
  is asserted directly beside it.
  **AND `test-atlas-places.js` HAD BEEN CHOOSING ITS COLLECTION BY BEING FIRST**, which stopped meaning
  anything the day China opened for study: its section 4 studies until a card links a place term, and a
  card of Chinese myth links none — so it walked fourteen cards and reported the map marker missing, at
  HEAD as well as on this branch. Both failures were confirmed pre-existing before anything was touched.
  The collection is DERIVED now, by counting how many of a collection's cards name a term the Atlas can
  place, and the day's allowance is raised with it: at five new cards a day a fourteen-card walk only ever
  sees five, so a fixture that names a quantity has to name the limit that lets it reach one.

- **G — Maps on cards.** Shipped. `test-map-cards.js` 301/0 (it grew a section 8), `test-layout.js`
  321/0, `test-a11y.js` 9/0, `test-card-types.js` 228/0, plus `test-card-plans.js` 151/0,
  `test-difficulty.js` 69/0, `check-style.js` clean. Three items, and each turned up something.
  **THE ANSWER GRID'S ORDER IS A COLUMN ORDER.** `.card-facts` is a two-column grid filled row by row, so
  rows 1 and 3 stand above one another and rows 2 and 4 do — which means swapping two rows decides what a
  reader compares at a glance. A state's four now run Capital, Population, Largest city, Total area: the
  two cities in one column and the two figures in the other.
  **THE FLAG'S FIELD IS `answerFlag` AND THE NAME IS THE WHOLE FINDING.** Written as `flag`, its helper
  was a second `cardFlag(c)` at module scope — and in JavaScript the later declaration wins for the WHOLE
  file, so `cardFlag(id)`, the reader's own 1–7 marker, silently answered 0 everywhere: the browse column,
  the study bar and the Ctrl+1 chord all quietly unflagged, with nothing thrown. **Nothing but reading the
  declaration list can see it.** Recorded in app.js and in `docs/geography-card-plan.md`.
  **AND THAT FIELD THEN SHIPPED A BLANK BACK FOR A SESSION**, which is the sharper lesson: `answerFlag`
  called `sanitizeUrl` with ONE argument, and that function takes its allowed schemes as a second and has
  no default — so `schemes.indexOf` threw the moment a URL had a scheme, `buildBack` died, and the whole
  BACK of every geography card came back empty. The front was perfect and Reveal did nothing at all.
  `test-map-cards.js` caught it; **the reason it could is that its section 5 reads the ANSWER off a
  revealed card** rather than asserting the front. It was found the first time the suite ran after the
  change, and would have been found by nothing else.
  **THE LOCATOR IS A SEPARATE FIELD FROM `map`, NOT A MODE OF IT.** A map card's window is the QUESTION —
  above the prompt, shading a shape, holding the name back; a locator is an ANNOTATION at the foot of a
  card whose answer is already showing, so it names its place from the first frame, sits after the
  Background fold and before the citations, and marks the place with the Atlas's own DOT rather than
  shading a country. That last is the decision worth keeping: the gold fill means *this is the answer* on
  a map card, and lighting up modern Greece for Knossos would both reuse that mark for a second meaning
  and make a claim about a border drawn three and a half thousand years later.
  **94 cards carry one**, written by the new `.claude/add-locators.js`, which FETCHES every coordinate off
  the named article's own published primary and never types one. Two of its findings are in
  `docs/geography-card-plan.md`: **read the `←` redirect markers** (`Idaean Cave` resolves to Psychro Cave,
  a different cave on a different mountain, and `Zagora, Andros` to the Pelion village — both shipped
  wrong for a run and were caught by reading the log), and **an article with no coordinate gets none**,
  which is the right outcome for Sahul and Beringia, whose whole point is their EXTENT.
  **`ready()` had to become `!!(target || dot)`** — a locator resolves a dot and no target, so the test
  hook reported every one of them as a window that never loaded.

- **H — Content corrections.** Shipped. `check-style.js` clean over all four files, the new
  `.claude/check-questions.js` reporting 1,862 questions across 624 cards with every rule passing,
  `test-date-line.js` 13/0, `test-card-plans.js` 151/0, `test-difficulty.js` 69/0, `test-discovery.js`
  22/0, `test-artefacts.js` 77/0, `test-sources.js` 81/0, `test-i18n-lang.js` 21/0, `test-a11y.js` 9/0,
  `test-cards.js` 114/0, `source-audit.js` and `gloss-source-audit.js` at the bar (1,124/1,124),
  `gloss-length.js` 0 outside it. Sixteen items, mostly one card each; four things are worth carrying.
  **A FILE REWRITTEN WHOLE HAS AS MANY WRITERS AS IT HAS WRITERS, AND `artefacts.js` HAS FOUR.** The
  entry in CLAUDE.md said three — `artefactSanitize`, `serializeArtefacts`, `add-artefacts.js` — and
  `.claude/add-images.js` rewrites it too, with an emitter written when an artefact's image was three
  fields and never taught the two it gained in Aug 2026. **One run to replace one picture silently
  stripped `title` and `desc` from all 99**: nothing threw, no count could see it, every `src` was
  untouched, and the only symptom was a viewer caption bar that had gone blank again. Reverted, the
  emitter taught both fields, and proved byte-inert by running it over an empty batch. **Ask which
  writers rewrite a file WHOLE before adding a field to it** — the ones that touch the entry you are
  editing are not the whole list.
  **A TEST THAT READS A CLOCK HAS TO READ IT THE WAY THE CODE DOES.** `test-cards.js`'s two Set-due-date
  assertions divided `due - now` by a day, where the scheduler lands a day-measured due date at the START
  of its day (`schedDayDue` / `cfg.dayAnchor`) — so "nine days out" measured 8 from midday onwards and 9
  before it. **The suite passed every morning and failed every afternoon, in the same session, with
  nothing wrong**; it was confirmed pre-existing at HEAD by stashing before anything was touched. Both
  now count day boundaries. A failure that depends on the hour reads as an intermittent bug and is the
  most expensive kind to chase.
  **THE TWO DATE LINES `test-date-line.js` HAD BEEN REPORTING WERE THE CENTURY RULE, TWICE.** `wh-177`
  stated only centuries and `wh-178` only a millennium, so neither yielded a sort year at all and both
  fell to 0 — "timeless", which on a BCE deck sorts after everything. Each was rewritten as the span its
  unit MEANS, off the card's own sourced prose rather than a precision invented to satisfy the parser.
  **AND A QUESTION IS NOW CHECKED AS PROSE, NOT ONLY AS A SHAPE.** The article audit had corrected every
  background and left the questions alone, so a term written as *the Mycenaean civilisation* was asked
  for without one; `.claude/check-questions.js` reads all 1,862 and holds each to the three rules asked
  for — one sentence, self-contained, naming the answer's most important aspect.
  **Two limits are stated rather than papered over.** The dotted-`ī` report is **not reproduced**: the
  deck's data is precomposed U+012B with no combining diacritic anywhere, all three runs that carry one
  already declare `PINYIN_FONT`, and EB Garamond, Newsreader, Cormorant Garamond and the generic serif
  each render it dotless in this Chromium — it needs a screenshot from the reporting device before
  anything is changed. And the Mandarin deck's byte-for-byte rebuild check **cannot be run here**: all
  four builders' inputs are gitignored caches that this environment does not hold, so the deck's edits
  were verified by reading the shipped file rather than by reproducing it.

- **L + M — Late corrections and the language decks.** Shipped TOGETHER, in one commit at v1.287, because
  Batch M's code sits in the same file as Batch L's and splitting the diff would have been fiddly for no
  gain. `test-review-decks.js` 146/0, `test-artefacts.js` 77/0, the new
  `.claude/test-lang-decks.js` 22/0, `test-layout.js` 321/0. Four things are worth carrying.
  **UNDO BRINGS THE CARD BACK AT ITS QUESTION, AND AT THE PHRASING THE READER WAS ACTUALLY ASKED.** It
  restored the card REVEALED, on the reasoning that the reader had just been looking at the answer — which
  puts them back on the grade row rather than at the thing they are meant to reconsider. The second half is
  the one nothing would have reported: a card carries three phrasings and `renderCard` picks one at random
  when `qIdx` is null, so an undo that cleared the index asked a DIFFERENT question, which reads as the undo
  having fetched another card. `undoSnapshot` carries `qi` now. Both are asserted, because they fail in
  opposite directions.
  **A RENAME IS THE LABEL, NEVER THE ROUTE.** War of Ages → Project W touches the tab label, the `<h1>` and
  the `PAGE_META` row; `data-route="warofages"`, the `PAGES` key and the hash are untouched, so every link
  ever shared still resolves — and the day's own changelog line was EDITED rather than a second line added,
  since a reader met that tab for the first time this morning and a day carrying both an addition and a
  rename of one tab is a day contradicting itself.
  **ZERO IS A REAL ANSWER FOR A THEME'S UNLOCK DATE.** `S.themes[id]` is the day it was won, and a theme
  grandfathered in — one the reader was already wearing when themes became collectible — is written 0,
  because it was never won. `themeUnlockedOnText` therefore tests for a FINITE POSITIVE number rather than
  truthiness, and says "Unlocked" with no date rather than 1 January 1970. **And only the composed date is
  escaped**: `THEME_OPTS[i][2]` is pre-escaped HTML and running it through `esc` again prints its own tags.
  **THE LANGUAGES SECTION IS DRAWN FROM A CATALOGUE, WHICH IS THE WHOLE DESIGN.** The decks in `decks/` are
  38 files and 119 MB, and nothing on the site linked to one. `lang-decks.js` (9 KB, generated by
  `.claude/build-lang-decks.js`, in the eager path on `artefacts.js`'s own ground — metadata whose cost does
  not grow with what it describes) carries a title, a subtitle, a card count and a size per deck; the deck
  FILE is fetched only when somebody presses Add. **Every figure is read off the deck it describes**, so a
  rebuilt deck cannot come to disagree with the row offering it — which would be silent, a row claiming 500
  words over a deck that now holds 700 looking exactly like a row. Hence the test's strongest assertion:
  the shipped catalogue must **reproduce byte for byte** from the shelf, which is the only thing that can
  see a stale one. A count of CARDS rather than notes is what makes the two deck shapes comparable, since a
  word may be one note with two templates (HSK, CILS, DELF) or two notes (DELE).

- **N — Late corrections.** Shipped with Batch O in one commit at v1.288. `test-artefacts.js` 77/0,
  `check-style.js` clean on all four files, `test-layout.js` 321/0. Four things are worth carrying,
  and a fifth about the SUITE: the reader simulation had to change with the code. It faked a reader by
  writing `settings.adminMode = false`, which the new back-fill clears on load — so the "reader" was an
  editor and two assertions failed. With the chip gone that flag no longer MAKES a reader, it makes a
  stranded editor; the honest way to be one on a dev origin is a legacy local account whose role is not
  admin, which `adminEligible()` tests before it ever reaches the guest-on-dev-origin branch.
  **A PICTURE OF A FRAGMENT IS NOT A PICTURE OF THE THING.** The Dressel 20 plate carried a sherd — a
  real Dressel 20, correctly credited, and useless on a card whose whole point is the shape of the
  vessel. What replaced it was chosen on the SILHOUETTE the description names (a globular body with two
  short thick open-loop handles), not on resolution: the best-resolution rival was pear-shaped with its
  handles buried in concretion. **Its record contradicted its own file name** — the name says Florence
  and the description and categories say Monsummano Terme — which is `cnh-019`'s rule (a file NAME is an
  uploader's identification), so the `desc` was written from the record and the name's century was left
  out of it, the plate already printing the artefact's own date. Both URLs verified 200.
  **AND "THE EMPIRE" WAS SWEPT FOR RATHER THAN FIXED WHERE IT WAS REPORTED.** All 100 descriptions were
  grepped for a bare definite reference (`the|its|his|their` + `empire|emperor|republic|kingdom|dynasty|
  war|…`); 23 matched and every one was read. Only TWO were genuinely bare (`dressel-20`,
  `portland-vase`) — the rest name their entity in the same sentence or in the `origin` field the plate
  prints directly under the name, which is a fact about the FORMAT rather than about those descriptions
  and is why a rule about context-free prose does not mean every noun must be re-qualified.
  **THE BADGE ALREADY ASKED FOR WHAT THE REQUEST ASKS FOR.** `allGamesWonToday` tests `g[k].won`, which
  `gameWonToday` documents as a perfect run; only the badge's `desc` and the sweep toast said "win".
  So this is the WORDING catching up with the rule, and no scoring changed — worth checking before
  changing a rule that a description misstates.
  **AND REMOVING THE CHIP WOULD HAVE STRANDED AN ADMIN IN VISITOR VIEW.** The Editor / Visitor chip was
  the only thing that ever wrote `S.settings.adminMode = false`, so a stored `false` after its removal is
  an editor with no control left to return with. A back-fill clears it on load, beside the other
  `S.settings` back-fills; a first-time visitor is not admin-eligible at all and is unaffected.
  `setMode` had no callers left and is DELETED rather than left unreachable. The route, `PAGES.warofages`,
  its `PAGE_META` row and `ADMIN_ROUTES` are untouched — the request is about the menu bar — so
  `test-layout.js`'s cold-load `#warofages` guard still has a route to resolve.

- **O — Language collections.** Shipped in the SAME commit as Batch N at v1.288, on Batches L+M's
  precedent: both land in one release, both touch app.js, and splitting a single file's diff would have
  been fiddly for no gain. `test-lang-decks.js` 35/0 (rewritten for the new shape, 22 assertions → 35),
  `test-artefacts.js` 77/0, `check-style.js` clean, `test-layout.js` 321/0. Five things are worth carrying.
  **A LANGUAGE IS A COLLECTION AND CANNOT BE A TREE NODE, and the catalogue is what makes both true at
  once.** The request is that these be "official curated collections, with the same type of banners … as
  the history collections", and a `COLLECTION_TREE` node's cards live in `data.js`, which every visitor
  downloads before flipping a card — these decks are 119 MB. So the BANNER is the curated one, built from
  the same `.collection-row`, `.collection-deco`, `coll-ic`, title row and `deckProgMarkup` and folded
  through `wireExpander`, while the CARDS stay in `decks/` and the section is drawn from `lang-decks.js`.
  Nothing new was invented for the look: the whole of the CSS this needed is five rules, every one a
  difference rather than a restatement.
  **THE HUES WERE MEASURED, NOT PICKED, AND THE ASSIGNMENT IS DELIBERATELY NOT EVOCATIVE.** Seven swept in
  CIELAB over the shelf's own band (L 25–52, chroma 26–58) and taken greedily; the worst clears 26.4 from
  every hue already placed, against a tightest EXISTING pair of 12.9. Three sweeps were run before one was
  kept — a 26–50 band produced two dull olives too near Geography's `#3E6610`, a 28–64 band a hot pink and
  an over-saturated blue. They are handed out in the order the section lists the languages, because a flag
  colour would be a claim: these are decks for a LANGUAGE, and Spanish is not Spain's.
  **THE SEVEN SHARE ONE ICON, which is the one place they cannot match the history shelf.** Every curated
  icon says what its collection is ABOUT, and a language cannot be drawn: a letter needs a font where these
  are bare paths, and a flag or a landmark would be the same claim the hues refuse. `COLLECTION_ICON._lang`
  is a speech bubble and the seven are told apart by title, hue and section.
  **THE BANNER CARRIES NO `+`, WHICH IS A CONTROL THE TEST ASSERTS THE ABSENCE OF.** A curated
  collection's + adds its whole subtree to the daily review, and there is no study scope for "several
  community decks" — nor should pressing one silently download 21 MB of Mandarin. A + that appeared here
  would look like a working control and would be one of those two things. **The deck rows are the curated
  `.node` and are equally deliberately NOT pressable**, for the same reason at a smaller scale.
  **AND THE BAR IS HONEST ABOUT CARDS THAT ARE NOT ON THE DEVICE.** Its total is the catalogue's count and
  its studied figure is summed over the decks actually installed, so an untouched language reads 0 of
  23,666 rather than 0 of 0. That figure is what sent `deckProgMarkup` to `toLocaleString`: the deck rows
  under it have always grouped their thousands, and one screen reading 15296 above 1,178 reads as a
  mistake. **Inert on every curated collection**, none of which passes 999 — and `test-artefacts.js`'s
  regex was WIDENED to allow a separator rather than dropped.

- **I — Authoring.** Shipped at v1.289. `test-review-decks.js` 146/0 (both pinned sheet-row lists gained
  the Icon row), `test-layout.js` 321/0, `test-lang-decks.js` 35/0, `test-artefacts.js` 77/0,
  `test-feedback.js` 39/0, `test-map-cards.js` 301/0. Five things are worth carrying.
  **`COLLECTION_ICON` BECAME A TABLE OF KEYS RATHER THAN OF PATHS, WHICH IS THE WHOLE FEATURE.** A reader
  choosing a mark needs a picker, a picker needs names, and a stored choice has to be a SHORT stable thing
  rather than a path — so `ICON_SYMBOLS` is an ordered `{k, n, d}` list (33 marks: the 13 the collections
  already wore plus 20 drawn to sit beside them), `COLLECTION_ICON` maps a collection id to a KEY, and
  `ICON_PATH` / `ICON_NAME` are derived from the list on load. Nothing that draws an icon changed shape:
  `symbolIconMarkup` still emits the same `.coll-ic` div, which is why five suites reading `.coll-ic svg`
  needed no change at all.
  **A READER'S ICON LIVES IN `S.deckGroups` BESIDE THE COLOUR, and that is what made it small.** That
  record is already keyed by ENTRY ID, already in `PROGRESS_FIELDS` and `RESET_KEEPS`, and already the
  place a row's presentation is stored — so the icon syncs, survives a reset and needs no new field, no
  migration and no schema block. A record holding only a colour or an icon is a presentation override; one
  holding a `title` is a group the reader made.
  **A PNG IS RE-ENCODED AT 64px AND CAPPED, AND IT IS NOT DRAWN IN THE GOLD.** An uploaded file is read,
  drawn contained and centred into a 64×64 canvas and re-encoded — so what is stored is the site's own
  bytes rather than a stranger's file, bounded at `ICON_MAX_BYTES` (24 KB) whatever came in, which matters
  because this rides in the synced blob. Every failure path resolves to `{ error: "<sentence>" }` rather
  than rejecting, so the picker can say what went wrong. A symbol takes `currentColor` and therefore the
  collection gold; a PNG cannot, so it renders as an `<img>` and keeps its own colours.
  **THE ICON IS NOT INHERITED DOWN THE TREE.** A colour cascades to the decks inside a collection because
  it is a wash and reads as one family; an icon is an identity, and repeating it on nine subdeck rows
  would say each of them is the collection. `adIconKey` therefore returns a mark only for a ROOT
  collection, a whole community deck, or a row the reader has given one — which is asserted both ways,
  since a mark on every row and a mark on none look equally deliberate from one side.
  **AND THE PROMPTS DESCRIBE PATHS THAT WERE VERIFIED END TO END.** A prompt whose output the importer
  refuses is worse than no prompt, the reader having no way to tell their file from the instructions — so
  the deck-file shape was derived from `uDeckImportText` / `uDeckSanitizeMeta` / `uCardSanitize` rather
  than from memory, a file was written to the published shape and imported through the real picker, and
  the check does that too. The prompts are wrapped at ~78 characters because `.ai-pre` at 11.5px mono
  holds ~95 and hard breaks any longer re-wrap into rags. The Copy button reads the `<pre>`'s own
  `textContent` rather than `AI_PROMPTS`, so what is on screen and what lands on the clipboard cannot
  differ; the Studio's link uses `route("mission", { scrollTo: "aiPrompts" })` rather than a fragment, so
  the About page's address stays `#mission` and a shared link cannot land a reader mid-page on reload.

- **J — Cross-cutting.** Shipped at v1.290. `test-spelling.js` 64/0 (new), `test-units.js` 37/0,
  `test-layout.js` 321/0, `test-scheduler.js` 136/0, `test-difficulty.js` 69/0, `test-date-line.js` 13/0,
  `test-card-plans.js` 151/0, `check-style.js` clean on all five files. Five things are worth carrying.
  **THE SPELLING SWITCH IS A DECLARED TABLE AND NEVER A RULE, and every trap in it was found in the real
  corpus rather than reasoned about.** A `-re` → `-er` rule turns `timetree` into `timetrer`; a `kerb` →
  `curb` rule reaches into `Kerberos` and `Lockerbie`; an `-ll-` → `-l-` rule reaches into `controlled`,
  `paywalled` and the archaeologist `Conneller`; an `axe` → `ax` rule matches `taxes` and `Saxe`. So
  `SPELL_PAIRS` is 144 hand-written rows and the transform can only ever do what the table says.
  **THE SUFFIX LIST IS EXHAUSTIVE, AND THE BARE STEM IS ADMITTED ONLY BY AN EXPLICIT EMPTY ELEMENT.** The
  first cut always admitted the stem, which rendered `emphasis` as `emphasiz` and `paralysis` as
  `paralyzis` — a stem that is itself a word with another meaning. Two more rows were wrong the other way:
  `centre` + `d` gives `centerd` and `catalogue` + `d` gives `catalogd`, because the two stems end
  differently, so every divergent inflection (`centred`, `catalogued`, `storeyed`, `manoeuvred`) has a
  whole row of its own.
  **IT IS TWO-WAY, WHICH THE UNITS SWITCH IS NOT, AND THE MEASUREMENT IS WHY.** The corpus is genuinely
  mixed in the -ise/-ize family — 82 `organized` against 54 `organised`, 68 `civilization` against 51
  `civilisation` — so a one-way transform would leave a British reader reading American spellings on half
  the cards while the setting claimed otherwise. **Eighteen rows are one-way all the same**, and the
  fourth column is what says so: `storey` → `story` is safe and `story` → `storey` is catastrophic, and
  the same holds for `program`, `meter`, `practice`, `license`, `catalog` and — found by the reverse sweep
  — `medieval`, which is the standard modern British spelling while `mediaeval` is archaic and occurs in
  the corpus zero times.
  **A URL IS NOT PROSE, AND THE MASK IS IN `spellText` RATHER THAN IN `spellTree`.** Measured: 173 of the
  corpus's 10,108 URLs carry a mapped word (`/pub/data/paleo/`, `Panionium_theatre.jpg`,
  `Mycenaean_armour_from_chamber_tomb_12`). Most sit in an `src` attribute, which a text-node walk can
  never reach, and the citations are behind `.notranslate` — but `mediaCreditHTML` renders a credit URL as
  the VISIBLE TEXT of its own link, so without the mask an American reader would meet a link reading
  `palaeo` whose href still said `paleo`. Masked at the transform, so every rendering site added later is
  covered without anybody remembering.
  **AND `gradeCloze` TRANSFORMS THE ANSWER, NEVER THE GUESS.** It is the one place the switch has to reach
  past the DOM: the cloze compares what was typed against the stored `answerText`, which is authored in
  British, so an American reader typing exactly what is on their screen would be marked wrong. Transforming
  the guess instead would be the same fault upside down.
  **The changelog's day titles are back in the band they were always in.** Measured over the whole file:
  the first thirty-two days run 13–72 characters and read as titles, while nine recent ones had grown to
  100–194 and were three- and four-item lists — a contents page rather than a heading, and on a phone a
  wall of prose above the list it introduces. The nine are rewritten and **`check-style.js` gained a fifth
  rule** over `changelog.js`, report-only and deliberately absent from `--fix`: shortening a title is a
  judgement about which of the day's changes led, which is the one thing a regex cannot make.
  **`test-units.js` was failing before this batch began**, on a card added by an earlier one: `wh-166`
  wrote `3 to 16 kilometres an hour (2 to 10 miles)`, and the engine's range pattern cannot see a bracket
  the unit does not immediately precede. Confirmed against HEAD with the batch stashed, and fixed in the
  card's prose (`3 to 16 kilometres (2 to 10 miles) an hour`) rather than by widening the pattern.
