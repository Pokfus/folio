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
| I | Authoring | collection icons a reader can set; the About page's AI prompts and the link to them |
| J | Cross-cutting | the two difficulty ratings; the en-GB/en-US switch; the changelog's day titles |
| K | Large passes | the Atlas info-box rewrite (plan + batch 1); the book text corrections (plan + batch 1) |

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
