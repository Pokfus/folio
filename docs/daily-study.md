# The daily study — per-deck limits, the pooled review, order, groups and the deck list

**Read this before touching `reviewQueue`, `deckLimits`, `entryCardIds`, `buildSession`, the deck
long-press sheet, or the review list on the home page.**

`CLAUDE.md`'s "How the app is wired" carries the operational summary: what the entries are, where a
deck's options live, the rules a change must respect, and which suites guard it. This file carries the
rest — why the allowance is per deck rather than global, why the pooled review is itself an entry, why
every count is derived rather than tallied, and the faults that left a reader studying one deck for
thirty days while the other never appeared.

The four bullets below are as they stood in CLAUDE.md, verbatim.

- **Daily review order** (`S.settings.reviewRandom`): **Ordered** (labelled "Chrono" until Aug 2026, renamed on
  request — the old key is retired from all nine language tables) presents cards in their in-deck order;
  **Random** shuffles the session order. The **draw** of the day's new cards is date-seeded-random across the decks in BOTH
  modes now (see the next bullet) — the setting decides presentation order only.
  **THERE ARE THREE ORDERS SINCE AUG 2026, AND ORDERED NO LONGER MEANS "EVERY REVIEW FIRST"** (`DECK_ORDERS` /
  `deckOrderMode` / `setDeckOrderMode` / `mixPiles` / `orderPile` / `deckByDifficulty` / `sortByDifficulty` /
  `cardDifficultyRank`, on request). **Ordered**, **Random** and **By difficulty** (easiest first, on
  `cardDifficultyShown` — so a card with enough answers is ranked by how hard readers actually found it and one
  without by how obscure its answer term is).
  **IT IS REACHED BY A CYCLER, NOT A SWITCH** (`cyRow` / `.dm-cycle` / `.dm-cyval` / `DECK_ORDER_LABEL` /
  `DECK_ORDER_NOTE`, Aug 2026, on request). The data layer shipped a batch ahead of the control, which
  this file recorded as a warning at the time — a setter nothing calls being the next person's bug — and
  the control is what closes it. **A switch cannot express three answers**, so the row states the order
  currently in force and steps to the next on a press, wrapping; its `small` line says what that order
  DOES rather than what the next one would do, so it reads as a sentence in whichever of the three
  positions it is in. Three things about the shape carry over from the switch beside it and one does not.
  It is a `<div>` carrying `role="button"` (the row is the target, and a control inside a button is
  invalid); pressing it must NOT close the sheet and must NOT repaint, since `render()` closes this very
  sheet through `closeDeckMenu`; and it is **excluded from the generic command selector** in
  `openDeckMenu`'s click handler, or one press would step the order and then run the sheet's ordinary
  dismiss-and-act path on top of it. What does not carry over is that a cycler cannot be answered by a
  keyboard's Space alone the way a `role="switch"` can — it takes Enter and Space through the row, which
  is what `role="button"` buys, and there is deliberately no arrow-key handling, three values in a ring
  having no "up". **`test-review-decks.js` pins the sheet's row list EXACTLY**, so the cycler was an
  assertion change as well as a UI one, and it asserts the full ring (Ordered → Random → By difficulty
  → Ordered) with the store read back at each step rather than only that the label moved. Three things
  about the ORDERS themselves are load-bearing.
  **`mixPiles(due, fresh)` INTERLEAVES THE TWO PILES IN EVERY BRANCH**, weighted by what is left of each and
  preserving both piles' own order, because a session that deals every due card and then every new one is two
  sessions rather than one — and on a large deck the new cards, which are the reason a reader added it, arrive
  after forty reviews or not at all. It replaces the bare `[...due, ...fresh]` in all five `buildSession` branches
  and in the review's own queue, so a deck studied from its row and the same deck studied from the pooled review
  cannot come to disagree about what a session looks like.
  **AND `setDeckOrderMode` IS NAMED THAT WAY BECAUSE `setDeckOrder` WAS ALREADY TAKEN** — it is the DRAG order
  setter (`setDeckOrder(parentKey, ids)`, writing `S.deckOrder`), and a second `function setDeckOrder` at the same
  scope wins for the whole scope, silently: the drag setter simply stopped existing and a reader's arrangement of
  their own deck list stopped being saved, with nothing thrown and the rows still moving under the finger.
  `test-review-decks.js` section 8 is what caught it. **A duplicate function declaration at module scope is
  invisible** — sweep for one when a working feature stops working for no reason a diff explains.
  **IT IS PER ENTRY, LIKE QUESTION VARIETY AND THE DAILY LIMITS** (`deckRandom` / `deckOrderMode` /
  `setDeckOrderMode`, Aug 2026, on request: the switch appeared on the review banner's sheet alone, so a
  deck held on its own row had no way to ask for a shuffled session). `S.deckOpts[id].order` where the
  reader has chosen on that deck, the older `S.deckOpts[id].random` boolean read as a fallback beside it,
  and `S.settings.reviewOrder` / `reviewRandom` as the default everywhere else, so **nothing migrates**.
  **`setDeckRandom` is RETIRED** — `deckRandom` is now derived from `deckOrderMode`, so one function decides
  which of the three orders is in force and the two shuffles in `buildSession` cannot come to disagree with
  the control that set it. Two things are decisions rather than plumbing. **The REVIEW writes the GLOBAL rather than a per-entry flag** — Settings → Random review
  order shows that value, and giving the review a private copy would leave two controls disagreeing about the
  pooled session with nothing on either page to say which was in force (this is where it differs from
  `deckVariety`, whose review flag is per-entry because Settings has no switch for it). And **`buildSession`
  shuffles the DECK and UDECK branches too**: those queues were never shuffled at all, so without that the
  switch would appear on a deck's sheet and do nothing — the piles are chosen first and shuffled after, so the
  setting decides presentation order and never which cards the day's allowances let through.
  **It is chosen by HOLDING THE BANNER** (`openReviewMenu` → `openDeckMenu(REVIEW_ENTRY)`, Aug 2026, on request),
  plus the Settings page's own "Random review order" switch. **The banner's sheet IS the deck sheet now** (Aug 2026,
  on request: "the same menu, without the delete option"): Custom study, Daily limits and Skip today above it, no
  Remove — there is nothing to take the review out OF. It was a `.review-order` pill absolutely positioned in the banner's top-right
  corner: a permanent control, in the corner of the one block on the home page that has something to say, for a
  setting almost nobody changes twice. The sheet is the same `deckSheet` shell the deck rows use one level down,
  so the gesture is the same one step up the hierarchy.
  **IT IS A SWITCH, NOT A PAIR OF ROWS** (`swRow` / `.dm-switch`, Aug 2026, on request). It was two
  `.dm-choice` rows one of which carried a tick — two rows for one bit of state, and on a phone a third of
  the sheet spent saying what one line says. The row's LABEL under the title states what the switch is
  currently doing rather than what it could be changed to, so it reads as a sentence in both positions.
  Three things about the shape are load-bearing and apply to **question variety** beside it too: the row is
  a `<div>` (it CONTAINS a `role="switch"`, and a control inside a button is invalid and unreachable by
  keyboard); a click anywhere on the row throws it, while the switch itself takes the tab stop and the
  keys; and **throwing one must NOT close the sheet and must NOT repaint** — `render()` closes this very
  sheet through `closeDeckMenu`, so a switch that repainted would dismiss itself on every flip, and there
  is nothing on the page behind that either setting changes (both decide what a SESSION deals out).
  `.dm-choice` survives for the book shelf's own favourite row. **The long-press wiring is `wireHoldMenu(el, onHold, onTap)`** (beside
  `openDeckMenu`), shared with the deck rows. Its one subtlety: the click that follows a hold is swallowed by a
  **document-level CAPTURE listener** keyed off `_holdUntil`, not by a flag the element's own handler checks —
  the banner already had a click listener before this ran, and listener order on one element is registration
  order, so an element-level guard registered second would fire after the very handler it exists to stop.
- **PER-DECK DAILY LIMITS, and a review pooled from all of them (Aug 2026, on request).** There used to be ONE global
  allowance (`S.settings.newPerDay`) sliced off the front of the pooled card list, so a reader with two decks got every
  new card from whichever came first and never saw the second deck at all. That was the bug; per-deck allowances are
  the fix, and the shape is Anki's.
  · **`deckLimits(id)`** → `{ newPerDay, maxReviews, newIgnoresReview }`, stored in **`S.deckOpts`** keyed by the same
    entry id as `S.active` and written only for decks the reader has actually changed — an absent deck follows
    `S.settings.newPerDay`, exactly as before. **`DECK_MAX_REVIEWS` is 50** (Aug 2026, on request; it was
    Anki's own 200) — a view about what a day's studying should feel like rather than a technical bound, and
    a DEFAULT only: a deck or the review can still be set as high as anybody likes in its own Daily limits
    sheet, and a reader who has already chosen one keeps it, `deckLimits` reading the constant only where
    nothing has been chosen.
  · **`S.deckDay`** holds TODAY only — `{ d, extra, skip }`, the Custom-study bump and "Skip today" — and resets in
    place, dropping every other stale record with it, so the table can never outgrow the decks in use.
  · **The COUNTS are DERIVED, never tallied** (`deckDoneToday`). `grade()` writes **`c.first`** — the day a card was
    introduced — onto the card record, and every per-deck new count is read back off it. That is what makes the
    figures right for a deck that is not in the review, right after an undo, and right for a card sitting in two decks
    at once; a per-deck tally would have to be kept in step with all three by hand.
  · **`reviewQueue` now builds deck by deck and then pools**: each entry offers its due cards up to
    `deckReviewRemaining` and its unseen cards up to `deckNewRemaining`, the new ones are **date-seeded-shuffled across
    the decks** and sliced to `newRemainingToday()`. Dedupe happens BEFORE the slice, or a card an earlier deck already
    claimed eats one of this deck's places. So with two decks at 5/day the review draws 5 in all — say 3 and 2 — and
    each row then shows the 2 and 3 that deck still has of its own, which is exactly what a reader sees under a
    cleared banner and is correct rather than a bug.
  · **…and the REVIEW ITSELF is an entry, under `REVIEW_ENTRY` (`"review:all"`)** — Aug 2026, on a bug report. It is
    Anki's parent deck: it pools what its decks offer and caps the pool, and it had no settings of its own, so the cap
    came from Settings → New cards per day while each deck's came from its own sheet. Two decks at five a day pooled
    ten and then handed back three — a figure no deck had agreed to, and nothing on the page explained it.
    `deckLimits` / `deckDoneToday` / `deckNewRemaining` / `deckDay` / `entryCardIds` / `entryInfo` and the long-press
    sheet all answer for that id as they do for a deck, which is what makes the banner and the rows under it
    arithmetically incapable of disagreeing. Two things about it are decisions rather than plumbing.
    **Its DEFAULT new-card limit is the LARGEST any added deck offers** (`reviewLimits`), not the global number: a
    pooled view must not impose a figure none of the things it pools has agreed to. An explicit limit set in its own
    sheet wins outright, exactly as a parent deck's does in Anki, and the **"All decks" tab of the Daily limits
    dialog** — which is where Settings → New cards per day moved to in Aug 2026 — remains what a DECK follows until
    it is given limits of its own. **And `newRemainingToday()` is now `deckNewRemaining(REVIEW_ENTRY)`,
    derived from the card records** — it used to read `S.intro.count`, a running tally `grade()` increments on ANY
    card's first grade, so a Card of the day or a deck tapped into directly silently ate the review's allowance and an
    undo did not give it back. The decks' counts were derived all along; the banner above them was not, and the two
    drifted apart. `S.intro` is still written and still rides in the synced blob; nothing reads it for a limit.
  · **STUDYING AHEAD IS THE ENTRY'S PILE, ORDERED, AND WARMED** (the `queue.length === 0` branch in
    `PAGES.study`; Aug 2026, on a bug report: "when I keep studying beyond the daily limit it stops showing
    both directions and becomes one directional again", and "it shows in the top right how many cards are
    remaining in that entire collection instead of that specific subdeck"). **Both symptoms were one fault**,
    and a third and worse one was underneath.
    The ahead pile was built from `subtreeCardIds(sd)` / `uDeckStudyIds(ud.cardIds)` — the whole tree and the
    whole deck — where every other queue in the session is `studyOrder(entry, entryCardIds(entry))`. So it
    reached past the subdeck or direction actually being studied (the count, which is `remainingCounts()`
    over the queue and so was never a second bug), and it skipped `studyOrder`, which is what interleaves the
    subdecks and what pulls a note's two cards together under "both directions together" — the raw expansion
    is TEMPLATE-MAJOR, so the pile was every forward card before any reverse. Reproduced exactly: a subdeck of
    6 offered "Study 14 ahead" and dealt `2f 3f 4f 5f 6f 7f`. It takes the same `availStudy` and `isBuried`
    filters as `buildSession`'s two branches, and the placard quotes **this entry's** allowance rather than
    the global default.
    **AND THE PILE IS WARMED BEFORE IT IS DEALT**, which is the one a reader would report first and which
    predates the rest: a community deck's cards are loaded per note when needed, the session warms its own
    queue behind a `.data-loading` line, and this pile is assembled AFTER that — so every card in it was a
    stub and **rendered BLANK, with a working grade bar under it**. Nothing threw and every count was right.
    Found by the test written for the scope fix, not by looking.
  · **A deck's row wears its COLLECTION's hue**, not the review's bronze (Aug 2026, on request): `rowHue` in
    `PAGES.home` walks up to the root collection and sets `--coll-bg` from `COLL_THEME` — the same colour the
    Library banner uses — and the row's wash, left bar and hover all read it, falling back to the bronze for a
    community deck or the Card-of-the-day list, which belong to no collection.
    **…AT THE BANNER'S OWN STRENGTH, which it was not for a fortnight** (Aug 2026, on request). The hue was
    right from the start and the MIX was half of it — 14% by day and 9% at night against the banner's 30% and
    22% — and a colour at half strength does not read as a paler version of itself, it reads as another
    colour, which is the whole of what was reported. `.active-deck` now writes the same 105deg wash at the
    same percentages fading at the same 64%, so a row's gradient start is byte-identical to its collection
    banner's (measured: World History `srgb 0.862 0.828 0.774` by day and `0.235 0.210 0.189` at night, on
    both). **Keep the four figures in step with `body[data-theme="folio"] .collection-deco` and its `.night`
    pair** — the two rules exist to say one thing, and nothing enforces it. The other themes' banners are not
    a plain wash at all (arcade dithers, academy sets a side band, gazette hatches) and are deliberately NOT
    matched: a row is 46px of `var(--ink)` text and a saturated banner gradient under it would be unreadable.
    **A CONTEXT ROW NEEDED ITS OWN NIGHT RULE**, found while making that change and fixed with it:
    `body.night .active-deck` is (0,2,1) against `.active-deck.context`'s (0,2,0), so source order never came
    into it and on every dark theme an ancestor signpost row silently lost both its wash and the `--paper-2`
    under it and rendered as an added deck's row. What marks a context row is the paper and the quieter title,
    never a weaker hue — it names the very collection its children are washed in.
  · **A pile at ZERO is grey** (`.dkc-zero` on a row, `.stat-zero` on the banner, Aug 2026, on request): the
    colour means "there is work of this kind here", so it has nothing to say on a 0.
  · **`entryPiles(id)`** is what a deck's row shows, and it is deliberately NOT that deck's share of the pooled review.
    `buildSession` uses the same per-deck allowances for a `deck` / `udeck` scope, so tapping a row studies what its
    row promised.
  · **THE ROWS ARE DRAGGED INTO THE READER'S OWN ORDER** (`S.deckOrder` / `orderedIds` / `setDeckOrder` /
    `setupDeckDrag` / `.dk-grip`, Aug 2026, on request — Anki lets a reader arrange their deck list, and this
    is the same thing done by dragging). The list is built from the collection tree, so until now its order
    was the editorial one; a reader working through four collections at once has their own idea of which
    belongs at the top. Seven things are decisions rather than plumbing.
    **THE ORDER IS PER LEVEL, keyed by PARENT** (`""` for the top level), so an arrangement is scoped to
    where it was made: dragging one subdeck above another says nothing about where its collection sits.
    **THE TOP LEVEL IS ONE RUN** — the collections, the reader's own community decks and the Card-of-the-day
    list used to be three blocks appended in a fixed order, so a community deck could never sit above a
    collection and the two tail rows could not be moved at all; they are one ordered level now, and the tail
    rows are ordinary rows in the build rather than markup pasted on the end. **NOTHING ELSE READS IT**: the
    Collections page keeps the editorial order (it is the shelf every reader shares, and one reader's study
    habits rearranging it would make it a different page for each of them), and the scheduler does not read
    it either — the day's new cards are drawn at random across the added decks, so a row's position says how
    the reader wants to LOOK at their study, not what it deals them.
    **A ROW BRINGS ITS SUBTREE**: a collection's row is followed in the DOM by every deck under it, so what
    moves is a contiguous BLOCK — the row plus every following row of greater depth, folded ones included, or
    a shut collection would leave its children behind. **IT MOVES AMONG ITS SIBLINGS, AND — SINCE GROUPS
    (Aug 2026, on request) — INTO ANY CONTAINER**: the note that used to stand here said re-parenting was
    deliberately not on offer, because a subdeck dragged under another collection would carry cards that
    collection does not contain and its indent, its hue and its counts would all then be lying. The request
    reversed the policy, and the "lying" half of it is answered rather than accepted — see the GROUPS
    bullet: a container counts what is drawn UNDER it, so a branch dragged out of a collection stops being
    counted by it.
    **THE HANDLE TAKES THE PRESS OUT OF THE ROW'S OWN HANDS** — the row is a tap (study this deck) and a hold
    (its options sheet), so the grip stops its pointerdown and swallows the click that follows, exactly as
    the fold chevron beside it does — and it is a real `<button>` answering to ↑/↓, because a reorder
    reachable by pointer alone is one a keyboard reader simply has not got. It is drawn wherever the LIST
    holds a second row — it used to be wherever a LEVEL did, which is too narrow now that the only row in
    its level can still be dropped into a group — and it sits ABSOLUTELY in the row's left padding rather
    than taking a column: the base indent went 16px → 22px to make room, because at 390px the deck's NAME is
    the only part of the row with a shorter form and a handle in the line would have been paid for out of it.
    **AND THE ROW'S OWN `pageIn` ANIMATION HAS TO GO before it can be moved** — `both`-filled, so its last
    keyframe (`transform:none`) outranks an inline style and `deckSetY` would be silently ignored, leaving a
    row that does not follow the finger while the list around it FLIPs perfectly (a script animation wins,
    which is why only the carried row would have been stuck). This file's third instance of that trap, after
    `.bk-page` and `gbSetCompact`.
    `S.deckOrder` is in `defaultState` AND `PROGRESS_FIELDS` — an arrangement is a fact about the reader, so
    the list a phone shows is the list the laptop shows. Guarded by `test-review-decks.js` section 8.
  · **GROUPS — the reader's own containers in the review list** (`S.deckGroups` / `S.deckNest`, `GROUP_PREFIX`
    / `isGroupId` / `groupCreate` / `groupDelete` / `groupTitle` / `groupColor` / `setNestParent` /
    `nestChildren` / `nestForget` / `nestWouldLoop` / `repaintReviewHues`; `.deck-group` / `.dk-into` /
    `.rv-foot` / `.dm-swatch` in styles.css. Aug 2026, on request). A group holds decks dragged into it,
    folds with a chevron, can be renamed, can be given a colour every deck inside takes, and studies
    everything under it.
    **⚠ NO NEW GROUP CAN BE MADE — THE FUNCTION WAS REMOVED FROM THE DAILY STUDY BLOCK** (Aug 2026, on
    request: "remove the group function from the daily study/active decks banner"). "+ New group" stood
    inside the banner, then at the bottom left of the DECK LIST for a fortnight, and is now gone along with
    `promptNewGroup`, `.rv-tools` and `.rv-newgroup`; `.rv-foot` survives, carrying the day's timer
    (`.rv-time`) alone at the left end it vacated — and is now drawn only once there is a time to report,
    the Collections button having left that row for a place of its own under the whole group.
    **WHAT DELIBERATELY STAYS is everything a reader who ALREADY made one needs**: the group row in the
    list, its hue, dragging a deck in, and Rename / Colour / Ungroup in its own options sheet. Deleting
    that code would leave such a reader a container on their home page that nothing could open — and there
    is no dead UI in keeping it, because a group row exists only where a group does and nobody can make a
    new one. If the stored groups should be dissolved too, that is a second decision and has not been
    taken. **The rest of this bullet describes a feature that can no longer be created**, and is kept
    because it still runs for anyone holding a group. **AN ADDED
    COLLECTION IS ONE TOO** — that is the request's own reasoning and it decided the shape of the rest: a
    collection holds no cards itself, only the decks inside it do, so a root collection with rows under it is
    drawn as a group header rather than as a deck row.
    Nine things are decisions rather than plumbing.
    **A GROUP IS NOT IN `S.active`.** It has no cards of its own, so putting it there would make `reviewQueue`
    offer its members' cards a second time under the GROUP's allowance as well as each member's — deduped to
    the same set, but drawn against the wrong limits. It is a display-and-scope construct; the decks inside it
    are what the daily review iterates, exactly as before, so a group can be made, filled and taken apart
    without the review's arithmetic moving at all.
    **A CONTAINER COUNTS WHAT IS DRAWN UNDER IT, which is what answers the old "its counts would be lying"
    objection.** `entryCardIds` on a tree node walks its subtree MINUS any branch dragged out from under it,
    and adds whatever has been dragged in — so a collection that has lost two decks to a group stops claiming
    their cards, and the two rows do not both offer the reader the same five new cards. Nothing is lost from
    the review: the deck dragged away is still in `S.active` and still offers its own cards on its own
    account. `buildSession`'s deck branch and `entryInfo` read `entryCardIds` for the same reason — **a row,
    its sheet and the session it starts must all be counting one thing.**
    **THE ID CARRIES A COLON** (`g:`), like `COTD_ENTRY` and `REVIEW_ENTRY`, so it can never collide with a
    node id (plain slugs) or with the `u:` of one of the reader's own decks.
    **`deckGroups` IS KEYED BY CONTAINER, NOT BY GROUP.** A colour set on an added collection has to live
    somewhere, and a second register for tree nodes would be two lookups and two chances to forget one: a
    record with a `title` is a group the reader made, a record with only a `color` is an override on
    something the tree already names.
    **THE HUE IS INHERITED DOWN THE CONTAINER CHAIN** rather than looked up per row — that is the whole of
    "changes the colour of all decks inside it" — and **only the header is darkened** (38% against the rows'
    30%, with its own `body.night` pair at 28%, which `.active-deck.context` already had to learn: `body.night
    .active-deck` is (0,2,1) and outranks a (0,2,0) rule whatever the source order). It was 52% / 40% and
    came down on request (Aug 2026): the three pile counts sit at the LEFT of the header, in the darkest end
    of the gradient, and at that strength they were hard to read.
    **A HEADER IS SET AND FURNISHED LIKE THE ROWS UNDER IT** (Aug 2026, on request). Its title used to take
    `--display` two sizes down, bolder, letterspaced and in capitals, and it carried a small mono `.dg-count`
    ("N cards") where a deck row carries its progress bar. Both are gone: `.active-deck .dk-title` answers for
    the header too, and it draws `adProg` like everything else on the list, so a header and its decks no
    longer answer the same question two different ways. What still marks it as a header is the wash above and
    the indent of the rows below. `adProg` gained `data-total` / `data-studied` with it — nothing renders
    them, but a percentage alone cannot say how many cards a row counts, which is exactly what has to be
    readable when a deck is dragged from one container into another (`test-review-decks` reads them).
    **THE MIDDLE OF A ROW MEANS "INSIDE", THE EDGES MEAN "BESIDE"** (`dropTargetAt`, `DROP_EDGE` 0.34). One
    gesture does both "drag a deck into a group" and "drop a deck on another deck to make it a subdeck", and
    without that split there would be nowhere left to aim between two rows. Positions are read from the
    LAYOUT, never the paint, for the reason the reorder is — and `elementFromPoint` is no use, since
    `.dk-reordering` takes the rows out of hit-testing. A drop into a container goes through `render()`
    (depth, indent, hue and fold are all derived at build time) where a reorder does not, and the container
    is opened first or the deck reads as having been swallowed.
    **…AND A NESTING IS SIDEWAYS WHERE A REORDER IS VERTICAL** (`NEST_DX` 28, Aug 2026, on a bug report from
    a phone: "when I try to drag active collections to reorder them, they disappear"). The middle band alone
    cannot tell the two apart, and on a phone it decides against the reader: a row is 46px, so the band is
    about fifteen of them, and a thumb travelling straight down to move a collection two places lands in one
    about a third of the time. Reproduced with real touch at 390×844 — **an 88px drag, less than two rows,
    filed a whole collection inside its neighbour**, eleven rows down and indented under a 43-row subtree;
    nothing was lost and nothing threw, and from the top of the list, where the reader was looking, it was
    simply gone. The pointer must now ALSO have travelled `NEST_DX` in the writing direction from where the
    grip was taken — the outline-editor convention (drag right to indent), which a straight-down drag can
    never satisfy. It stays discoverable because `.dk-into` lights the row the moment the threshold is met,
    and it costs the deliberate gesture nothing: the grip sits in the row's left padding, so a drop aimed at
    another row's middle is a rightward move already. Guarded by `test-review-decks.js` section 8, whose new
    assertion is that a straight-down drag leaves `deckNest` EMPTY — the one place the fault would show.
    **A DESCENDANT CANNOT BE A DROP TARGET, and it is the BLOCK that says so** rather than a tree walk:
    `blockOf` is the row plus every following row of greater depth, folded ones included, so a collection's
    whole subtree is skipped when the collection itself is being carried. `nestWouldLoop` is the belt to that
    braces, for a cycle that could only arrive out of an older save or two devices reconciling — and
    `entryCardIds` / `nestDescendants` / `adChainVisible` all carry a guard for the same reason: a cycle must
    draw a wrong list, never hang the page.
    **THE FOLD NOW WALKS THE CONTAINER CHAIN, NOT THE TREE** (`adChainVisible`, and `adSyncFold` reading
    `data-parent`/`data-drag` off the DOM). It used to walk `node.parentId`, which stopped being the whole
    answer the moment a row could be drawn somewhere the tree does not put it. A group seeds OPEN where an
    added collection seeds shut: the reader has just built it and put things in it.
    **UNGROUP DISSOLVES, IT DOES NOT DELETE.** The members are freed to the level the group stood at, keeping
    the order they had inside it — losing a deck because you tidied a container away is the one outcome a
    grouping feature must never produce — and `removeActive` re-homes a container's children one level up for
    the same reason, since a child whose container is no longer drawn would be in the review and invisible.
    **THE COLOUR SWATCHES REPAINT IN PLACE** (`repaintReviewHues`): the sheet is where a colour is chosen and
    `render()` closes that sheet, so repainting the ordinary way would dismiss the very control the reader is
    using to compare two colours. Both registers are in `defaultState`, `PROGRESS_FIELDS` **and
    `RESET_KEEPS`** — a group is how the reader has arranged the decks `active` already keeps.
    **AND SINCE AUG 2026, ON REQUEST, EVERY ROW IN THE LIST IS OFFERED A COLOUR — INCLUDING THE BANNER**
    (`containerHasChildren` / `reviewHue`). It was offered on a container alone (a group, an added
    collection, the whole-deck row of an imported deck) and the gate is **gone**: a subdeck, a curated deck
    inside a collection and the daily study banner itself all take one now. **Almost nothing had to change,
    and that is the thing to know before reaching further in** — `emit` and `repaintReviewHues` already read
    `groupColor(id)` for any row whatever, and `S.deckGroups` has always been keyed by ENTRY ID rather than
    by group, so every row was colourable in every respect except being asked. `isContainerEntry` is
    **deleted**, not left unreachable; `containerHasChildren` survives only to word the row's own note,
    since "every deck inside" is a promise a deck with no subdecks cannot keep.
    **THE BANNER IS `REVIEW_ENTRY`, WHICH IS WHAT MAKES IT FREE**: the pooled review has been an entry with
    a sheet of its own since the per-deck limits landed, so it stores its colour in the same register as
    everything else. `reviewHue()` is `groupColor(REVIEW_ENTRY) || dayHue()` — a chosen colour wins and, with
    none chosen, the **day hue still turns over every morning**, which is the behaviour a reader who never
    opens that sheet keeps. It is set inline on the banner element by the two markup sites AND by
    `repaintReviewHues`, which must reach `#b-review` explicitly: the banner is not a `.active-deck` row, so
    the sweep over those rows cannot see it and the swatch would answer for every deck but the one whose
    sheet it was opened from.
    **A COMMUNITY DECK MAY ALSO SHIP WITH A COLOUR ITS AUTHOR CHOSE** (`deck.color` / `uDeckSetColor` /
    `uDeckColorOf`, same request; the Studio's Deck details). It is the deck's DEFAULT, not the reader's
    choice: `emit` reads `groupColor(id) || hue || uDeckColorOf(id)`, so a colour set on the row always wins
    and a fresh install simply arrives wearing the author's. It rides in `UDECK_META_KEYS`, so the export
    file, the import and the fork carry it with no plumbing of its own, and `uDeckSanitizeMeta` holds it to
    a six-digit hex — a colour from a stranger's file is set as a custom property and read by the stylesheet,
    so anything else is a value the page would have to make sense of.
    **PUBLISHING IT NEEDS SECTION 11 OF THE SCHEMA AND DOES NOT WAIT FOR IT** (`colorColumnMissing` /
    `colorColumnMsg`). `user_decks.color` is one `alter table … add column if not exists`, and until it is
    run PostgREST answers PGRST204 — so `uDeckPublish` **retries once without the colour** and returns a
    `warn` the Studio toasts, which is the card-types column's own pattern (an ADMIN gets a different
    sentence naming the block to run, being the one person who can clear it). A deck therefore publishes
    from an un-migrated database and simply arrives in the generic indigo.
  · **A SHEET IS NOT LIVE THE INSTANT IT APPEARS** (`DECK_SHEET_ARM_MS`, Aug 2026, on a bug report: "when
    the long-press menu loads, I sometimes accidentally immediately press a menu item"). A hold opens the
    sheet UNDER the finger that is still down, so the lift that ends the gesture lands on whichever row
    happens to be beneath it and fires it — a Remove or a Skip today the reader never chose. **The
    document-level capture guard that swallows the click after a hold cannot help**: it deliberately steps
    aside inside `.deck-menu`, which is what lets a fast deliberate click through. So `deckSheet` guards its
    own clicks, on TWO tests. The first is EXACT rather than a guess at how fast a finger is: a pointer click
    whose own pointerdown never landed in this sheet is by definition the tail of the press that opened it,
    and is swallowed however long that press ran (`e.detail` is 0 for a keyboard or programmatic click, which
    has no pointerdown to have seen and must go through). The second is a 500ms arming window, covering a
    fresh tap made before the sheet has settled — half the second the report asks for, because the exact test
    is what fixes the reported misfire and a full second is long enough that a reader reaching straight for a
    row would meet a sheet that ignores them, which is the same complaint again.
  · **A × IN THE TOP RIGHT OF EVERY SHEET** (`.dm-x`, Aug 2026, on request). Escape and a backdrop tap both
    closed it already and neither says so: Escape is a key a phone has not got, and "tap outside" is a
    convention a reader has to know in advance. Three decisions.
    **IT IS BUILT BY `deckSheet` RATHER THAN BY EACH CALLER**, so the options menu, Custom study, Daily
    limits, Scheduling, Card info and the flag picker all have one — and a sheet added later cannot ship
    without it, which is the same argument the shared shell already wins on Escape and the exit animation.
    **STICKY, AND FIRST IN THE DOM.** Sticky because `.ds-sheet` scrolls its whole box, where an absolute ×
    would scroll off the top; first in the DOM so a screen reader meets "Close" on the way in rather than
    after forty rows of card history. Its own height is cancelled with a negative bottom margin so it costs
    the head no room, and `.dm-head` carries the right padding that keeps a long title and the studied count
    clear of it — asserted as a box OVERLAP rather than as "right of the head", which is false by
    construction since the head spans the whole box.
    **AND IT IS SKIPPED WHEN THE INITIAL FOCUS IS CHOSEN**, or every sheet would open with the ring on the
    way out. That is the one line a later tidy-up is likeliest to undo, and it is asserted.
  · **EVERY SHEET IS CAPPED TO THE SCREEN AND SCROLLS** (`.dm-box`'s `max-height` + `overflow-y`, Aug 2026,
    on a bug report from a phone: "sometimes on mobile not the whole long-press menu is visible"). Only the
    two sheets that were BORN long — Scheduling (`.ds-sheet`) and Card info (`.ci-sheet`) — declared a
    height, so the OPTIONS menu, which has since grown to five switches, five commands, a swatch row and an
    icon picker, simply outgrew a 640px screen. **`.deck-menu` is a centred flex container, so a box taller
    than it overflows equally at BOTH ends and neither end can be scrolled to**: the head is off the top,
    Remove is off the bottom, and nothing on screen says so — which is why it reads as a menu that is
    missing rows rather than as one that is too tall. It belongs on the SHARED SHELL rather than on that one
    sheet, because the next sheet to grow will grow the same way and the two that already state a cap are
    more specific and untouched; `dvh` is what makes it right on a phone whose address bar comes and goes,
    with `vh` under it for anything that lacks it, and `overscroll-behavior:contain` keeps the page behind
    from scrolling once the sheet reaches its end.
    **AND THE STICKY × IS NOW BACKED IN THE SHEET'S OWN PAPER**, which it did not need while only two
    sheets scrolled: sticky means it floats over whatever row the scroll brings to the top, and an unbacked
    × sitting across a switch reads as a rendering fault and swallows the tap meant for that switch. At rest
    it sits inside the 38px `.dm-head` already reserves for it, where the colour is invisible.
  · **The sheet is CENTRED at every width and leaves the way it arrives** (Aug 2026, on request). It was a
    bottom sheet below 560px, on the reasoning that the row held was near the thumb; what that produced was a
    dialog rising out of the tab bar at the very bottom of the screen, furthest from where the reader was
    looking. It also had an entrance and no exit, so dismissing it cut it away on the frame of the click —
    the one abrupt half of a control that is otherwise entirely animated. `deckSheet`'s close adds `.closing`
    and removes the element after `DECK_SHEET_OUT_MS` (keep that in step with the CSS), and clears
    `_deckMenuClose` at the same moment so a second close cannot restart the timer; the overlay stops
    hit-testing the instant the class lands, so the gesture is finished whatever the paint is still doing.
  · **A MODAL SCRIM IS THEME-INDEPENDENT BLACK, NEVER `var(--ink)`** (Aug 2026, on a bug report: "the whole
    background is whited out"). Five full-screen overlays — `.inline-prompt`, `.deck-menu`, `.levelup-pop`,
    `.artefact-pop` and `.chest-pop` — were each `color-mix(in srgb, var(--ink) 38–58%, transparent)`, which
    reads as "the darkest thing this theme has" and IS exactly that in light mode (`--ink` is #1B1A17, so
    those figures are unchanged there). **At night the token flips to #ECEAE3**, so every one of them became
    a 38–58% WHITE veil: holding a deck's row, opening a chest or an artefact on any dark theme whited the
    whole page out behind the sheet. A scrim's job is to push the page BACK, which is a DIRECTION rather
    than a colour the theme gets a say in — the rule `.folio-tour`, `.page-help` and the media viewer were
    already written to, each spelling its black out. **The failure is invisible from the light side**, which
    is why it survived: nothing throws, the sheet is perfectly readable, and every screenshot taken in light
    mode is correct. `.gloss-scrim` and `.atlas-help` are deliberately NOT in the list: both are mixes of
    `var(--paper)`, which is DARK at night, so they already darken — a paper mix follows the theme correctly
    where an ink mix inverts.
  · **The row's options are a LONG PRESS** (`openDeckMenu` / `deckSheet` / `openCustomStudy` / `openDeckLimits`), and
    the small bin that used to sit at the right of every row is gone with it — one command holding a permanent column
    on a 390px row, with three more that had nowhere to live. Custom study bumps the deck's allowance for today AND
    `S.intro.extra` by the same amount (or the extra cards would be unreachable from the banner the reader pressed to
    ask for them); Skip today sits the deck out of `reviewQueue`; Remove is the old bin. A press is CLASSIFIED like
    the whiteboard marker's drag — a finger that moves more than `AD_SLOP` is scrolling, not holding — and
    `contextmenu` plus the ContextMenu key give a mouse and a keyboard the same way in. The sheet lives on
    `document.body`, so **`render()` closes it** (`closeDeckMenu`).
  · **DAILY LIMITS HAS TWO TABS, and the Settings page has no allowance any more** (`globalLimits` /
    `setGlobalLimits` / `clearDeckLimits` / `.dm-tabs`, Aug 2026, on request). **This deck** writes
    `S.deckOpts[id]`, as it always did; **All decks** writes the DEFAULT every deck follows until it has
    limits of its own — which is where **Settings → New cards per day** moved to when it was removed from
    that page. The value is the same (`S.settings.newPerDay`, so no save migrates) and its companion is new
    (`S.settings.maxReviewsPerDay`, back-filling from `DECK_MAX_REVIEWS` by its own absence): the maximum
    reviews a day had only ever been settable per deck, so the two halves of one idea lived in two places
    three navigations apart, and the global one read as a rule about Folio rather than as the fallback
    behind a per-deck figure.
    Three things are decisions. **The tabs swap PANES rather than rebuilding the sheet**, and Save writes
    both, so a reader can change the default and this deck's override in one visit without either being
    thrown away by looking at the other. **The per-deck tab shows the INHERITED figure where nothing has
    been set**, and says so under the fields — `deckLimits` already falls back, so the box would otherwise
    show a number the reader might take for something they had chosen. And **"Clear back to the default"
    DELETES the three keys** rather than writing the global's current values into them, which is the whole
    difference: a deck cleared this way follows a later change to the default, where one holding a copy of
    today's figures would silently stop following it. It is offered only where there is something to clear.
    `.dm-pane[hidden]{display:none}` is required — the author `display` beats the UA rule, the trap
    `.ces-imgpanel[hidden]` already carries.
  · **A SETTING CASCADES TO WHAT IS UNDER IT** (`DECK_OPT_INHERIT` / `entryChain` / `deckOpt` /
    `deckOptFrom` / `deckOwnOverrides` / `clearDeckOverrides`, Aug 2026, on request). A community deck may
    nest nine levels deep and end in a direction row, and until this every one of those rows answered for
    itself — so setting FSRS, or a review order, or read-aloud on the DECK did nothing at all to the levels
    inside it, which is where the reader actually studies. `entryChain(id)` walks outward from an entry to
    everything that contains it — a direction to its subdeck, a subdeck path to its parents, a subdeck to
    its deck, a tree node to its ancestors, and anything to the GROUP it has been dragged into — and
    `deckOpt(id, key)` returns the nearest answer with `from` (which entry gave it) and `own` (whether that
    was this one). Four things are decisions rather than plumbing.
    **THE DAILY LIMITS DELIBERATELY DO NOT INHERIT, and that is the whole of `DECK_OPT_INHERIT`.** A POLICY
    — how to order, whether to shuffle, which scheduler, whether to speak — means the same thing wherever it
    is applied, so handing it down is what a reader means by setting it on a deck. A QUANTITY does not:
    handed down to nine levels, "five new a day" becomes forty-five, and the pooled review would then draw
    a number no deck agreed to, which is the exact bug the per-deck limits were built to fix. So
    `newPerDay`, `maxReviews` and `newIgnoresReview` are absent from that list and `deckOpt` answers for
    them from the entry alone; `deckLimits` keeps its own fallback to the All-decks default, which is a
    different mechanism and is where a limit is meant to be inherited from.
    **THE CHAIN IS WALKED ONCE PER QUESTION, NEVER ONCE PER KEY.** `deckOrderMode` has to ask each entry for
    BOTH the new `order` string and the older `random` boolean before moving outward — two passes would let
    a deck's stale boolean beat a subdeck's explicit choice, which is a setting silently ignored rather than
    an error.
    **THE ROW SAYS WHERE ITS VALUE CAME FROM** (`.dm-from`, `fromMark`): "Set here" on an entry that carries
    its own, or "From &lt;the entry's title&gt;" where it is inherited — because a sheet showing a value that
    is not this entry's, with nothing to say so, teaches a reader that a setting they never made is theirs.
    `markOwn(rowEl)` re-marks the row in place when a switch is thrown, since throwing one must not repaint
    (`render()` closes this very sheet), and `.dm-from[hidden]{display:none}` is spelled out for the reason
    every `[hidden]` in this file is.
    **AND "FOLLOW &lt;PARENT&gt;" IS OFFERED ONLY WHERE THERE IS SOMETHING TO CLEAR**, `clearDeckOverrides`
    DELETING every inherited key on that entry rather than writing the parent's current values into it —
    the Daily limits tab's own rule, and the same difference: an entry cleared this way follows a later
    change made higher up, where one holding a copy of today's answers would silently stop following it.
  · **QUESTION VARIETY** (`deckVariety` / `setDeckVariety` / `scopeEntryId` / `S.settings.questionVariety`,
    Aug 2026, on request). Whether a card asks one of its three phrasings at random or always the first.
    It is **PER ENTRY with a global default**, exactly like the daily limits and for the same reason: this
    sheet is opened on a deck's own row as well as on the pooled review, and a setting that silently
    answered for every deck when thrown from one of them is the one thing a reader could not predict.
    `S.deckOpts[id].variety` is written only where the switch has actually been thrown; everything else
    follows `S.settings.questionVariety` (default true), so **nothing migrates**. `scopeEntryId(scope)` is
    what a study session resolves its scope to — a deck's own for a `deck`/`udeck` scope, the review's for
    everything else — and `PAGES.study` reads it ONCE per session, since the setting is changed from the
    home page and a card requeued ten minutes later must not suddenly be asked a different way.
    **The pool is CUT rather than the index pinned** (`cardQuestions(base).slice(0, 1)`): the ‹ › chevrons
    and the "1 / 3" counter are drawn from `pool.length`, so they simply do not appear, and there is no
    second state in which the counter says 1 / 3 and the arrows do nothing. The daily GAMES are untouched
    — they draw from every card and are not deck-scoped, so a per-deck setting has no business there.
  · **AUTOMATIC READ-ALOUD** (`deckAutoSpeak` / `setDeckAutoSpeak` / `entryHasSpeech` / `typeSpeaks`, and the
    `fromReader` argument to `PAGES.study`'s `showAnswer`; Aug 2026, on request — Anki's "read the answer
    aloud"). Revealing a card speaks it, with no button pressed. Four things are decisions rather than
    plumbing.
    **IT IS PER ENTRY WITH NO GLOBAL DEFAULT, AND SINCE AUG 2026 IT STARTS ON** (on request; it was opt-in,
    on the reasoning that a site which makes a noise by itself should be asked first). **What makes the
    default safe is the gate below it rather than a change of view about consent**: the switch — and the
    behaviour — exist only where the deck's own card TYPE marks a run `.uc-tts`, so the person who wrote
    the deck has already asked for those words to be speakable, and a deck that marks nothing is silent
    whatever this says. The reader who does not want it throws one switch, and it cascades to that deck's
    subdecks. It rides in `S.deckOpts`, so it syncs and survives a reset (`deckOpts` is in `RESET_KEEPS`)
    with no field of its own and **nothing migrates** — an absent key is the new default, which is the
    intended behaviour for everyone who has never opened the sheet, and a reader who explicitly turned it
    OFF keeps that. `.claude/test-speak.js` asserts the default in both directions.
    **THE SWITCH APPEARS ONLY WHERE SOMETHING CAN SPEAK** (`entryHasSpeech`), because a control that answers
    a press with silence is worse than none — the test `.uc-tts` already applies to its own chrome through
    `body.no-tts`. A curated card has no templates and so never speaks; a community deck speaks when one of
    its own card types marks text with `.uc-tts`. It is **derived on each open rather than stored**, so the
    pooled review grows the switch the day such a deck is added to it and loses it when the deck is removed.
    **ONLY A READER'S REVEAL SPEAKS** — hence `fromReader`, passed by the Reveal button and by Enter/Space
    and by nothing else. `showAnswer` also runs from `renderCard`'s own tail (`if (studyRevealId === id)`),
    which re-opens an ALREADY-revealed card after a reload, a language switch or an **undo**; without the
    flag a card would speak again on every repaint, which is a card nobody can leave open. Guarded in both
    directions by `.claude/test-speak.js`, and the undo path is how that test reaches the restore branch.
    **THE FIRST MARKED RUN IS THE ONE SPOKEN.** A type that marks several is asking for a control on each,
    not for a recital — and `cardSpeak` calls `ttsStop()` first, so queuing several would cancel all but the
    last anyway.
  · **The N/N STUDIED figure lives in the sheet's head, not on the row** (`.dm-studied`, Aug 2026, on request).
    It sat at the right of the row, where on a 390px line it competed with the deck's own name — the one part
    of the row with a shorter form, so the name is what gave way. The **bar stays on the row** and says the
    same thing at a glance, which is all a row of a list is for; the exact count is something a reader goes
    looking for, and holding the row IS that. It is derived from `entryCardIds(id)` + `isSeen`, so it answers
    for a deck, a community deck, the Card-of-the-day list and the pooled review alike, and is omitted
    outright on an entry with no cards. `.dm-head` is a `justify-content:space-between` row on
    **`align-items:baseline`**: the left-hand block (`.dm-headmain`) is a column, and a column flex item
    aligns on its own FIRST line's baseline — which is what puts the figure on the title's line rather than
    on the block's centre. `adProg` no longer emits `.count`.
  · **Remove carries its red in the TEXT and nothing else** (Aug 2026, on request). It had `--zh-wash` behind
    it on hover, and on a phone a hover state can be left behind by the very tap that opened the sheet — a
    highlighted row in a menu reads as one already chosen. The rule is gone; `.dm-item.dm-danger b` keeps
    `--zh` and the row hovers like every other. `test-layout.js` asserts it HOVERED, against an ordinary
    row's own hover wash — reading the resting style would pass whatever the rule says.
- **THE DAILY REVIEW HAS NO DECK CAP** (Aug 2026, on request). The Folio level used to be one — one deck at level
  1 and one more per level — and it was removed because it was the only thing a level decided and it decided it
  by taking something away: a reader who had found two collections worth studying was told to go and study more
  before they could have both. **`maxActiveDecks`, `activeDecksFull` and `countedActiveEntries` are deleted**, as
  is the Library's `.lib-cap` line and the toast that said why an add was refused. `addActive` still returns a
  boolean and every caller still tests it — it simply never returns false for a cap now — so nothing else moved.
  A level buys an artefact chest instead; see THE RELIQUARY. Guarded by `test-review-decks.js` section 5, which
  now asserts the OPPOSITE of what it used to: a reader who has studied nothing may add every collection offered.
  **The cap lived in three places** (`addActive`, `wireAddButton`'s toast, the page head), and dropping it from
  one of them would still have let almost every add through — which is why that assertion is worth having.
- **ADDING A COLLECTION ADDS WHAT IS INSIDE IT** (`nodeSubtreeIds` / `nodeAncestorIds` / `addActive` /
  `removeActive` / `refreshAddButtons`, Aug 2026, on request). A collection used to enter the review as a
  single entry with its decks showing under the banner as greyed CONTEXT rows — present, but not something
  you could tap into, hold for options, or drop one of. Adding one now adds the collection **and every deck
  and subdeck beneath it**, so each arrives as a row of its own. Three things follow, and each is the part
  that would otherwise bite:
  · **The CAP counts choices, not entries.** `countedActiveEntries` skips a node with an active ANCESTOR —
    it is in `S.active` because the collection is — or a level-1 reader adding a collection of four decks
    would instantly be five decks over their cap and unable to add anything at all. `addActive` therefore
    tests the cap ONCE, against the thing the reader actually pressed.
  · **Removing takes the node, its subtree AND its ancestors**, because an ancestor left active would go on
    offering the very cards just removed and its + button would still read "added". What must not go with
    the ancestor is its OTHER branches, so each is re-added explicitly first. Usually they are already
    there (the cascade put them there); the exception is what makes it necessary — a save written before
    this existed, where only the collection is listed and its decks are implied by it.
  · **`wireAddButton` re-reads EVERY + on the page** (`refreshAddButtons`), not just the one pressed: one
    press can change a dozen of them further down, and updating only the one clicked leaves the rest
    showing what they meant a moment ago, which reads as the tick landing on the wrong row. It is a sweep
    of the buttons rather than a `render()` because the collections page is a tree the reader has expanded
    by hand, and rebuilding it would fold that back up.
