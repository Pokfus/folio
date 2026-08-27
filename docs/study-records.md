# What Folio records about studying, and what it shows back

**Read this before touching `S.revlog` / `logReviewEntry` / `revRead` / `revForCard` / `revWindow`,
`S.reviewLog` / `logReview` / `reviewHistory` / `retentionRate` / `dueForecast` / `reviewStatsHTML`,
`renderDeckStats` / `deckStats` / `exploreStatsHTML` / `progStats`, `schedSetDue` / `schedForget` /
`browseTokens` / `browsePredicate` / `PAGES.browse`, or the flag machinery.**

`CLAUDE.md`'s "How the app is wired" carries the operational summary of all four — the flags and the
three card actions, the per-review log's row shape and its own table, the daily log the heatmap and
retention rate are built on, and the derived deck statistics. This file carries the rest.

Four bullets, in the order they appeared in CLAUDE.md:

1. **Flags, Set due date, Forget and the card browser** — why a flag is not `cardColor`, the seven
   colours and the Ctrl chord, why the two scheduler calls are pure and live above the SRS marker, the
   search's documented subset of Anki's syntax and its two departures, and the two ways in.
2. **The per-review log** — the compact row and its two unpacking sites, the duration cap, the move out
   of the synced blob into a table of its own and the account-switch leak that opened, and why undo
   takes back its own row by identity.
3. **Review history and statistics** — the daily tally, why it has to exist at all, the heatmap's start
   date and its Monday alignment.
4. **Deck statistics and "Beyond the cards"** — the derived per-deck figures, the discovery registers,
   and the two meters that counted against the wrong set.

- **FLAGS, SET DUE DATE, FORGET, AND THE CARD BROWSER (Aug 2026, on request).** Folio had come to record a
  great deal about every card — a state, an interval, an ease or a stability, a lapse count, tags, and since
  this month every individual review — and gave a reader no way to look at any of it except one card at a
  time, on whichever card happened to be in front of them. These four land together because they are one
  gesture: find the card, then do something to it.
  · **A FLAG IS NOT `cardColor`, and the two must never be merged however alike they look.** `cardColor` is
    an ADMIN's private marker on a card in the editor: it rides in `ADMIN_EDITS`, it is published to every
    reader through the content overrides, and it means "I, who write these cards, have a note about this
    one". A **flag** (`S.flags[id]` → 1–7) is the READER's, it rides in their own progress, and nobody else
    ever sees it. One is a fact about the content, the other a fact about somebody's studying.
    Anki's seven, in Anki's order and under Anki's names, because a reader who has flagged cards before will
    press Ctrl+1 and mean red by it. **The chord has to be Ctrl** — 1–4 are the grade keys — and it sits
    ABOVE the Enter/Space guard in the study page's key handler but is deliberately allowed to fire while
    the cloze box has focus, since Ctrl+digit types nothing into a text box and a reader mid-guess is
    exactly who wants to flag the card. **Setting the flag a card already carries CLEARS it**, which is what
    makes one chord enough for both directions; the sheet toggles on ONE card for the same reason and SETS
    on many, a bulk action that toggled leaving a mixed selection half red and half not.
    **It is in `RESET_KEEPS`**: a flag is an annotation rather than history, and Settings → Reset progress
    names the study history, the streak and the badges, none of which a flag is.
    **The colours are TOKENS** (`--flag-1` … `--flag-7`, with night and high-contrast values of their own),
    for the rarity palette's reason at more than twice the scale — seven hues told apart at a glance, and a
    hue mixed toward a dark paper stops being the hue that identifies it. **The dot is never coloured TEXT**:
    seven hues legible as 10px type on sixteen light papers and eighteen dark ones do not exist, the name is
    beside it in the ordinary ink, and the picker prints the FIGURE on each swatch so the seven are told
    apart by position and number as well as by colour.
    **Flagging repaints the CARD, not the page** (`renderCard()`, never `render()`) — `render()` rebuilds the
    study page from the stored session and would take a revealed answer away, and flagging a card is not a
    reason to un-reveal it. Guarded in both directions.
  · **`schedSetDue` and `schedForget` are PURE and live above the `/* ---------- SRS ---------- */` marker**,
    beside `schedAnswer`, so `test-cards.js` walks them as arithmetic and the undo snapshot stays valid (each
    returns a NEW record; the caller's is never mutated). **They belong to the scheduler rather than to a
    button** because either written at the call site would be five field writes with a rule behind each —
    what happens to a learning card's step, whether a lapsed card keeps the interval it was returning to,
    whether the FSRS memory state survives — and those rules would then exist in as many places as offered
    the action. Here there is one of each, and the browser's bulk actions and the single-card sheets are the
    same code.
    **Set due date takes Anki's own input** (`7`, `7!`, `4-7`) and its instant is `t + days * DAY`, computed
    the way `schedAnswer` computes every other due date rather than snapped to the reader's day boundary —
    deliberate consistency, since a card graded at ten in the evening with a one-day interval already comes
    due at ten the next evening. A **new or learning card becomes a REVIEW card**, which is Anki's behaviour
    and the only coherent one: left in learning, the date the reader has just chosen is overwritten by the
    very next grade, which walks the steps, and nothing on screen would say so. A **range is resolved per
    card, seeded by the card's own id**, so pushing a hundred cards spreads them — the point of offering a
    range — and re-running the same action puts them on the same days rather than reshuffling.
    **Forget KEEPS the record rather than deleting it**, and that is the load-bearing part: Folio's XP is the
    number of distinct cards studied, so dropping the record would silently take back a level earned by
    studying something the reader did in fact study, and `first` is what every per-deck new-card count is
    derived from. `resetCounts` is Anki's own checkbox and is off by default — those reviews happened. The
    FSRS memory state always goes, forgetting being exactly the assertion that it was wrong.
  · **THE BROWSER (`PAGES.browse` at `#browse`)** — a searchable, sortable table over every card
    `availableCardIdSet()` yields, which is the right universe rather than every id in the tree: it already
    leaves out the coming-soon collections and already expands a community note into its several cards, so
    the browser lists exactly what the review could deal. Rows carry a checkbox, the flag, the card, its
    deck, its state, when it is due, its interval, its reviews and its lapses; selecting any of them raises a
    bulk bar (flag, set due date, forget, suspend, unsuspend). A row opens Card info, where the same actions
    live on one card — **the actions are IN Card info because that panel is already "everything about this
    card", and the two calls it was missing are both answers to what it shows**: a due date the reader
    disagrees with, and a lapse count saying the card never stuck.
    **THE SEARCH IS THE HALF THAT MATTERS**, and it is Anki's syntax cut to a documented subset: `is:`,
    `flag:`, `prop:`, `deck:`, `tag:`, `introduced:`, `rated:`, terms ANDed, any of them negatable with a
    leading `-`, phrases quotable. `browseTokens` and `browsePredicate` are **PURE** — a row is a plain
    object and nothing in them reads `S` — which is what lets the test put thirty queries through them as
    arithmetic. **An operator Folio does not know stays FREE TEXT rather than being dropped**, so a typo
    searches for itself and narrows to nothing instead of matching everything; and **an operator whose VALUE
    makes no sense matches NOTHING rather than everything**, for the same reason. Both failures look like
    "the search is broken" from one side only.
    **TWO DEPARTURES FROM ANKI, and the page says so rather than leaving them to be discovered.** There is
    **no `added:`** — Anki's counts from when a note was created and a curated Folio card has no creation
    date at all, it ships in `data.js` — so the operator is `introduced:` and means the day a card was first
    STUDIED, which `first` already records. Calling it `added:` would have been a figure that looks like
    Anki's and answers a different question. And **`rated:` reads the per-review log**, so it cannot see
    further back than the log does.
    **The deck column prints the LEAF's title and the full path is on the row's tooltip** — a full path is
    forty-odd characters, which in a table column is an ellipsis and nothing else ("World History · Or…"
    tells a reader strictly less than "Origins"). **Below 640px five of the nine columns go** rather than
    being squeezed: at 390px the card's own title is the only part of a row with no shorter form, so anything
    taking width from it is what gives, and the rest is one tap away in Card info.
    **`BROWSE_PAGE` (300) is a PAGE, not a ceiling** (Aug 2026, on request). It was a hard cut with a line
    telling the reader to narrow the search, which on a few thousand cards makes the last two thirds of the
    collection unreachable by scrolling at all. The table grows by a page whenever its foot comes into view,
    watched by an **IntersectionObserver on a sentinel drawn as the body's last child** — a scroll listener
    cannot see the case where the first page does not fill the window, since no scroll ever happens there.
    One observer, re-pointed at each freshly drawn sentinel (the rows are rebuilt on every repaint, so an
    observer left on the old one fires on a detached node) and disconnecting itself when the page goes. The
    count line still states the true total and now says how much of it is on screen; a repaint that CHANGES
    the list resets the depth, since a new search is a new list.
    **The query, the column and the selection are module-level and deliberately NOT in `S`**: they are a way
    of LOOKING at the collection rather than a preference about Folio, so they survive navigating away and
    back within a session and reset on reload — the glossary record's own call. Typing repaints IN PLACE
    rather than re-rendering, or the caret leaves the box being typed in.
    **THERE ARE TWO WAYS IN and both are asserted**, because they serve different readers: the **account
    page**, at the head of the reader's own record — **including the SIGNED-OUT one**, which is the case that
    would have been missed, since everything else there is behind the sign-in wall for being about an ACCOUNT
    where this is about the cards on this device, and a guest studies, flags and forgets like anybody else —
    and a **deck's long-press options sheet**, which is the everyday path, the moment somebody wants to find
    a card usually being the moment they are looking at their decks. `setActiveTab` maps the route to
    `account`, as it does `glossary`.
- **THE PER-REVIEW LOG (Aug 2026, on request)** — `S.revlog`, one row per answer, written by
  **`logReviewEntry`** from `grade()` and read by **`revRead`** / `revForCard` / `revWindow`. The daily
  `reviewLog` below keeps three numbers a day, which is all a heatmap and a retention rate need and is the
  whole of what a past day can say; this keeps what a day cannot — which card, which button, from what
  interval to what, and how long the answer took. **It is the foundational half of the feature and it landed
  before the screens that read it, deliberately**: a card record holds only its LATEST review, so every day
  the log is not being written is detail no later release can reconstruct. It is what a **card-info** panel,
  an **answer-buttons** breakdown, any **time** figure and (the real prize) **FSRS** all need, and none of
  them can be retrofitted onto history that was never kept.
  · **THE ROW IS AN ARRAY and its shape lives in exactly TWO places** — `logReviewEntry` writes it and
    `revRead` unpacks it, so every reader goes through one function and the compact form is an encoding
    detail rather than something eight call sites agree about. `[ id, t, g, st, prevMin, nextMin, ease100, ds ]`:
    `t` is plain **ms** (the unit every other stamp in app.js uses — a minutes-since-epoch would save five
    characters a row and give the file a second time unit to remember); `prevMin`/`nextMin` are the interval
    before and the delay the grade bought, **both in MINUTES**, one unit for both, because a field that is
    sometimes days and sometimes minutes reads correctly and computes wrongly; `ease100` is an integer, so no
    float noise in JSON, and is **whichever number the card's scheduler uses ×100** — its ease under SM-2, its
    difficulty under FSRS (see `docs/scheduler.md` for why that needs no extra field); `ds` is **tenths of a second**.
  · **THE DURATION IS CAPPED at `REV_MAX_DS` (60s, Anki's own `maxTaken`)**, and the cap is the honest half
    of it: a card left open over lunch would otherwise claim two hours of study and make every time figure a
    lie. It is measured by the STUDY PAGE (`shownAt`, stamped in `renderCard`) and passed into `grade(id, g,
    ms)`, since only the page knows when the question appeared; a grade with no timing logs a 0 rather than
    refusing, because a missing duration must never be able to cost the schedule.
  · **THE LOG IS NO LONGER IN THE SYNCED BLOB, AND THAT IS WHAT LIFTED THE CAP** (Aug 2026, on request —
    "with no cap, I don't mind adding a supabase table"). It shipped at `REV_CAP` 3000 rows because it rode
    inside the one progress blob `save()` PATCHes whole, and this bullet said outright that the fix was a
    table of its own rather than a bigger cap. That is what happened: **`review_log`** (the `10) REVIEW LOG`
    block at the end of `.claude/supabase-schema.sql` — **the user must run it once**, and until then
    `revTableMissing` turns PostgREST's 404 into a silent no-op rather than an error on every grade), one row
    per review, owner-only, **insert and delete but deliberately NO update policy** — a review is a record of
    something that happened and nothing should be able to rewrite one.
    · **`revlog` came OUT of `PROGRESS_FIELDS`**, so `save()` no longer carries it, and **`progressBlob()`
      (PROGRESS_FIELDS only) is what `supaPush`/`supaQueuePush` now send** where they used to send
      `extractProgress()`. `extractProgress()` still INCLUDES `revlog`, because the guest stash is a whole
      device state rather than a synced blob and a guest's history must survive a sign-in.
    · **THAT SPLIT OPENED AN ACCOUNT-SWITCH LEAK and closing it is not optional**: with the log outside the
      blob, adopting a second account's progress left the first account's card history sitting in
      localStorage. `applyProgress` clears `S.revlog` and removes `REV_SYNC_KEY` — the same rule
      `_supaOwner` exists for one level up.
    · **The push is INCREMENTAL and keyed on a HIGH-WATER TIMESTAMP** (`REV_SYNC_KEY`, device-local like
      `_supaTs`), in batches of `REV_BATCH`, with `Prefer: resolution=ignore-duplicates` over the unique
      `(user_id, card_id, reviewed_at)` index — so two devices pushing the same session, or a retry after a
      half-failed batch, cannot double-count. `resetProgress` calls `revWipeRemote()`, or a reset would clear
      the device and leave the archive behind to be re-adopted.
    · **`REV_CAP` (20000) still exists and is a LOCAL bound, not a limit on the archive** — the rows are on
      the server, and what is kept on the device is what Card info and the answer-buttons chart read. ~42
      bytes a row, so a full local log is ~840 KB, about three years at twenty reviews a day.
    · What wanted the uncapped archive is the **FSRS optimiser**, which shipped days later and reads every row
      through `revFetchAll` — see THE FSRS OPTIMISER above. This is the bullet to read before adding anything
      else that grows per review: give it a table.
  · **UNDO TAKES BACK ITS OWN ROW BY IDENTITY** (`lastRevRow` → the snapshot's `revRow` → `undoRevRow`), and
    this is the one piece that cannot be done the obvious way. The undo snapshot is taken BEFORE the grade,
    so it cannot hold a row that does not exist yet: `grade()` leaves the row it appended in `lastRevRow` and
    `doGrade` copies it onto the snapshot afterwards. Splicing what `indexOf` finds is exact under pruning,
    under a requeued step and under a session's fortieth undo alike — where **"remove the last row" takes
    somebody else's review off** and **a recorded length silently keeps the phantom one**, since the log
    prunes from the front and a length taken before an append can equal the length after it.
  · **Read by two surfaces, and they are deliberately different shapes.** **Card info** (`openCardInfo` /
    `cardInfoRowsHTML` / `cardInfoHistHTML`, on a `deckSheet`) is reached by **Info** in the study bar or
    **`I`** — Anki's key — and is in two halves for a reason: the STATE block comes from the card record, so
    it is complete for every card ever studied, and the HISTORY table can only show what the log holds, which
    begins the day the log shipped. **A card studied for months before that shows its true state above an
    honestly short history and says which it is** — fabricating rows from the interval and ease would be
    inventing a reader's own past. The **Answer buttons** card (`answerButtonsHTML`, `ANSWER_WINDOW_DAYS` 30)
    renders **nothing at all** on an empty log rather than an empty panel beside a heatmap holding a year of
    real history, and where the log is younger than its window it names its own age instead of reporting a
    quiet month as a quiet thirty days.
  · The Info button is in the **study bar**, not the grade bar: that bar's phone layout is a fixed three-cell
    row (`"help undo suspend"`) and Undo is duplicated down there because a misclick is URGENT, where asking
    why a card is due is not. The `I` key is guarded on `typing` for the reason Ctrl+Z is — the cloze box
    takes focus as every card opens.
  · The card-info sheet is the one `deckSheet` that can outgrow the screen, so `.ci-sheet .dm-box` is capped
    and **`.ci-histwrap` is the part that gives** (`flex:1 1 auto; min-height:0`), keeping the state block and
    Close put while the history scrolls between them. The answer-buttons bar sits in a **track of its own**
    (`.ab-track`) because a percentage height resolves against its containing block, and an `<i>` that is a
    sibling of the labels grows over the word beneath it.
  · **AN OVERLAY OVER THE CARD OWNS THE KEYBOARD** (`OVERLAY_SEL` / `overlayOpen`, beside `swipeEnabled`),
    which this panel is what forced: every study shortcut acts on the card UNDERNEATH, so a reader who opened
    Card info mid-card and pressed `3` graded the card they were reading about — invisibly, the sheet being
    over it — and Ctrl+Z undid a grade they could not see. It is the Enter-on-a-focused-glossary-term bug one
    level up: there a CONTROL owned the key, here a whole panel does, and the fix also covers the gloss popup
    and the image viewer, which had the same hole. **ONE list, shared with the page swipe**, since both ask
    the same question of it and a second copy would drift invisibly.
  · Guarded by **`.claude/test-revlog.js` (58 assertions)**. **Re-run after touching `logReviewEntry` /
    `revRead` / `revForCard` / `revWindow` / `grade()`'s logging / `shownAt` / `undoRevRow` /
    `openCardInfo` / `answerButtonsHTML` / `OVERLAY_SEL`.**
- **Review history + statistics:** `grade()` calls **`logReview(mature, correct)`**, which tallies
  `S.reviewLog["YYYY-MM-DD"] = [reviews, matureCorrect, matureTotal]` (in `defaultState()` so old saves
  back-fill, and in `PROGRESS_FIELDS` so it syncs and a friend's shows too). **This log has to exist**: a card
  record keeps only its *last* review, so a card studied on ten days is indistinguishable from one studied
  once — past-day history is unreconstructable from `S.cards`. "Mature" = the card's status was `review`
  *before* the grade (a real recall attempt, not a learning step — hence `preStatus`, captured before the
  scheduler rewrites it); correct = anything but Again. Pruned to `REVIEW_LOG_DAYS` (400).
  Read by `reviewHistory` / `retentionRate` / `dueForecast` and rendered by **`reviewStatsHTML(prog, joined)`**
  on the account page and a friend's: a **study heatmap** (whole weeks in columns, Monday-first,
  scrolling inside `.hm-scroll` so it can never widen the page), a **90-day true-retention** figure (`—`
  when nothing mature has been reviewed — never a made-up 0% or 100%), and a **14-day due forecast**
  (overdue cards fold into today rather than hiding in a past bucket). `dueForecast` skips suspended cards
  and anything in a coming-soon collection, matching `availableCardIdSet()`.
  **The heatmap starts on the day the account was created** (`joined` — `S.user.joined` for yourself, the
  friend's `profiles.joined` for theirs), capped at `HEAT_WEEKS` (53), rather than always showing a year of
  blank squares. Two things that look optional but aren't: it never starts **later than
  `firstLoggedDay(prog)`**, or a guest's study history migrated up into their first account would be hidden
  by the later sign-up date; and the range is rounded **back to that week's Monday**, because the grid is
  `grid-auto-flow:column` over 7 rows and day 0 must be a Monday or every column shifts. The days in that
  first column that precede the account render as `.hm-pre` blanks (aligned, but not drawn as missed days)
  and are excluded from the totals. Month labels drop the earlier of any pair closer than 3 columns — at
  11px per column two labels collide, which a full year never triggered but a short new-account range does.
- **Deck statistics + "Beyond the cards"** (the account page, and a friend's — both take a `prog`, so the
  friend view gets them for free). Two sections below Review statistics:
  · **`renderDeckStats(container, prog, withCommunity)`** — an `<optgroup>`ed picker over `statScopes()`
    (each live collection, every deck inside it, and — for your own account only — your community decks,
    which live outside the tree and outside a friend's synced blob) driving `deckStatsPanelHTML`: a
    studied/total bar plus eight tiles (mature / young / learning / not started / due now / lapses /
    average gap / set aside) and when the deck was last studied. It opens on the deck with the most
    studied cards, and the selection is UI-only — a glance, not a setting. **Everything is DERIVED from
    the card records** (`deckStats(prog, ids)`), deliberately: a per-deck review log would only start on
    the day it was added, so every deck already worked through would read as empty, and it would multiply
    the synced blob by the number of decks. The day-by-day history stays global.
  · **`exploreStatsHTML(prog)`** — what a scholar does *around* the cards. Two meters (glossary terms
    opened, **countries** opened on the Atlas — the latter shows "of N" only once `world.js` has actually
    loaded, since that bundle is lazy), seven derived tiles (**historical territories**, all-time reviews,
    days studied, **longest streak** — `longestStreakDays`, computable from `reviewLog` where `S.streak`
    only holds the current one — card-of-the-day picks, games played, perfect runs) and a per-game row
    from the lifetime log.
    **Both meters count against the set they are measured by, which is NOT the whole register**, and each
    was wrong once in the same way. `placesSeen` records every place opened — 258 present-day countries
    *and* 1,194 historical era territories — so counting the register against `WORLD_GEO.length` read
    "412 of 258": the bar clamps at 100%, the figure beside it does not. It now counts only names that
    are present-day countries (`countrySeenCount`), and the remainder gets the "Historical territories"
    tile rather than being silently dropped. `glossSeen` likewise counts only terms that **still exist**
    (`glossSeenCount`), or a term retired since it was read pushes the figure past the total. The single
    helpers `countryNameSet` / `countryTotalCount` / `countrySeenCount` / `glossSeenCount` /
    `glossTotalCount` are shared by the meters, the discovery chips and `progStats` — **keep new callers
    on them** rather than re-deriving, which is how the two mismatches got in. Guarded by
    `.claude/test-discovery.js`.
  · **Three new progress fields feed them** (in `defaultState` + `PROGRESS_FIELDS`, so old saves back-fill
    and a friend's shows too): **`glossSeen`** and **`placesSeen`** (key → first-seen timestamp, written by
    `markSeen` from `openGlossWin` and `showCountryPopupName`) and **`gameLog`** (key → `{plays, wins}`,
    written by `markGamePlayed`). These exist because **a popup and an Atlas panel leave no other trace** —
    nothing in the state records that they were ever opened, so the reading is invisible unless written
    down as it happens. `markSeen` no-ops (and so skips `save()`) on a key already known, and prunes
    oldest-first at **`SEEN_CAP` (6000)**. Deck
    glossary keys are **not** recorded: the terms-opened figure is measured against the curated glossary,
    and a stranger's deck would let it pass 100%. Both registers start the day they were added, so an
    existing reader's count begins at zero — said plainly here rather than on the meter, which was
    carrying a sentence about it until it was removed on request.
    **`SEEN_CAP` must stay above the SHIPPED universe of both registers** and is no longer a free
    parameter: these counts are now shown to the reader as progress towards completion, so a prune would
    make a count go backwards and re-flag a place as newly discovered. Measured: 401 glossary terms and
    **1,211 distinct clickable place names** (258 present-day + 1,194 across the 13 eras) — already 80% of
    the old 1500 cap, and **every new geo era adds territory names**. Fully seen, `placesSeen` is ~34 KB of
    the progress blob, so the headroom is nearly free. `.claude/test-discovery.js` asserts the clearance
    against the real data files; **if it fires, raise the cap — don't trim the data.**
  · **Discovery marks — telling a read term/place from an unread one.** `markSeen` **returns `true` only
    on first sight**, and that return is the entire signal. Both call sites (`openGlossWin`,
    `showCountryPopupName`) mark on the way IN, above everything that renders, so **anything asking "is
    this new?" at render time is always told no** — capture the return at the top, as they now do.
    · **The UNDISCOVERED term is the marked one.** A glossary link not yet opened carries **`data-new`**
      (set by `markTtipNew`, called from `setupTooltips` — the one choke point every `.ttip` render path
      already goes through, hand-authored and auto-linked alike), and `.ttip[data-new]` paints it in
      **`--newterm`, a teal of its own**. It wore `--ochre`, the gold of the blank in a card's question,
      until Aug 2026, when the two roles were SWAPPED on request: the Library books gave up the teal they
      had been using for their note markers (those now take the card's vermilion like every other citation
      on the site) and it moved here. **The reasoning that chose the hue holds either way** — every
      neighbouring token is spoken for, and this teal is none of them — and the swap ends a real collision:
      a card's blank and an unread term in the SAME gold, in the same sentence, said the two were the same
      kind of thing. **A term already read carries no attribute and renders exactly as every
      glossary link always has** — the familiar state is untouched, because the mark is the invitation,
      not a record of what is finished. (It was briefly the other way round — read terms dimmed — and was
      changed on request; don't reintroduce that.) It writes an explicit `data-new` rather than styling
      `:not([data-seen])` **because deck terms are in neither register** and would otherwise sit marked and
      undiscoverable forever. `.ttip[data-new]:hover` keeps the teal — jumping to the indigo hover would
      read as the term changing state before it was opened — and sits **after** the base `:hover` rules
      (equal specificity → source order). `refreshTtipNew(key)` re-marks every matching link on the page
      the moment a popup opens, so the prose behind it loses its mark at once, not on the next render.
      **`body.hc` re-tones `--newterm`** with the other quiet tokens; `test-a11y.js` covers it with no
      change of its own, and `test-artefacts.js` asserts the swap in both directions.
    · The **first** opening also shows a gold chip (`discChipHTML` → `.disc-chip`): "New term! 41 / 401"
      in the gloss popup's bar, "New place! 7 / 258" in the Atlas panel (`#cpNew`), with a **splash** of
      two expanding rings (`discRing` / `discRingNight`, staggered onto `::after`) and a **`sfx("discover")`
      chime**. The rings are **box-shadow spread, never a scaled pseudo-element**: the chip sits inside
      `.gloss-win` (`overflow:hidden`) and `.cp-cols` (`overflow-y:auto`), where a transform would be
      clipped by the one and could add a scrollbar to the other. Both animations **end fully transparent**,
      so the reduced-motion killswitch — which lands animations on their END state — leaves no ring behind.
      The Atlas panel element is REUSED, so it must be cleared on every non-first open. A historical
      territory gets the label with **no ratio** — it is not part of any set with an honest total. The
      figure carries `notranslate`. **The chime is suppressed in the Find-it game** (`if (!GAME)`):
      `gameTap`/`gameReveal` have just played their own `good`/`bad`, and a bright discovery chime over
      `bad` would congratulate a reader for a wrong answer. The chip still shows — the sound was the only
      part that contradicted the game.
      The `!` is part of the translated string (Spanish opens with `¡`, CJK uses the full-width `！`), so
      the exclamation-less keys were retired from all nine language files when it was added.
    · Four achievements ride on the same counts (`terms25` / `terms100` / `places50` / `placesAll`, fed by
      `progStats`'s `terms` / `countries` / `countryTotal`), and `checkAchievements()` is called from both
      first-sight branches. `countries` is 0 until `world.js` loads, which only ever DELAYS a badge —
      `checkAchievements` adds and never revokes.

## Time studied, and time reading (Aug 2026, on request)

Two requests, one mechanism: "the account page needs a lifetime study-time counter and badges", and "a
book's about page should show reading time today and in total; award badges".

**The study page has counted the day's time on cards since it shipped.** What was missing was a lifetime
total and the same clock pointed at the Library. `startTimeTicker(root, alive, addMs)` is that clock
factored out of `PAGES.study`: it counts only while the tab is visible and the thing being timed is still
painted (`alive()` is a predicate the caller supplies — a study card, or a book page with content in it),
and it saves about once a minute rather than on every tick.

- **`S.studyTotal`** holds the lifetime figure, added to beside the daily one. It is in `PROGRESS_FIELDS`,
  so it syncs, and it back-fills from the daily record on first read.
- **`S.reading[bookId].secs`** holds a book's own. That record already existed — it is where the reader's
  place is kept — and it already synced, so this is one more field on it rather than a new store.

Both are tiles in "Beyond the cards", and both carry badges: 1, 10, 50 and 100 hours studied; 1, 5 and 25
hours in one book. They read `progStats` and are tested at the moment they are earned, exactly as the
fifteen collector's badges are. A book's own front matter prints its clock — today's and the total — above
the introduction.

### Two faults worth remembering

**`setReadingPos` replaced the reading record rather than merging into it.** It wrote
`S.reading[id] = { ch, y, at }`, which is correct for a record holding only a place and silently fatal for
one holding a clock as well: the new `secs` would have been wiped on every scroll. It merges now
(`Object.assign({}, prev, …)`), and the general rule is that **a record that gains a field gains a merge**.

**The lifetime back-fill was first written at boot and threw on the temporal dead zone.** It called
`todayStr()` — a `const` arrow declared about a thousand lines further down the file — which is a
`ReferenceError` at boot and not at parse, so `node --check` says nothing about it. It is a lazy accessor
(`studyTotalMs()`) instead, which is the shape to reach for whenever a back-fill needs something the module
has not finished defining.
