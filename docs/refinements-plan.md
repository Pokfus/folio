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
