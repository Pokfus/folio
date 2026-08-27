# The home page

**Read this before touching `PAGES.home`, the daily quote, the review banner, or the page's own layout.**

`CLAUDE.md`'s "How the app is wired" carries the operational summary: what is on the page, what `fresh`
means, where the quote's data lives, and which suites guard it. This file carries the rest — why the
page retreated to one column at every width, what was removed from it and why, and the faults that made
a working page look broken.

The two bullets below are as they stood in CLAUDE.md, verbatim.

- **Home page** (`PAGES.home`): greeting → daily quote (`QUOTES` — world sources East and West, standard published
  translations only, no loose internet attributions; **clicking one flips it to the original** — text, speaker and
  source from the entry's `o` block, `wireDailyQuote` swapping `hidden` on the `.dq-live`/`.dq-orig` spans, clicking
  again returns to the site language. The swap **crossfades**: the words fade out (`dq-out`), the swap happens while
  nothing is visible, the incoming ones are held at their start (`dq-in`, `transition:none` — removing the class is
  what animates them) and the figure's height eases between the two languages (`dq-sizing` + an inline height, since
  a Greek line and its English rarely wrap the same), so nothing cuts and the page below never jumps.
  **The figure is also held at the height of its TALLER language** (`lockHeight`, Aug 2026, on request): both are
  measured in one synchronous pass that never paints — swap the `hidden` attributes, read `offsetHeight`, swap
  back — and the larger becomes a `min-height`, after which the flip moves nothing at all and the height easing
  above is a no-op. It is **re-measured on a tick, on `document.fonts.ready` and on resize** (`_dqResize`, one
  listener ever), because the i18n observer rewrites the quote after render for a non-English reader and a
  webfont arriving re-wraps both languages. `DQ_FADE` /
  `DQ_SIZE` in app.js must stay in step with the `.dq-*` transition durations in styles.css; a `busy` guard ignores
  clicks mid-flight and `prefersReducedMotion()` swaps outright instead of waiting out the timings.
  **THE WORDS ARE SELECTABLE, and the flip is guarded in JS rather than in CSS** (Aug 2026, on request).
  `.dq-flip` carried **`user-select:none`** from the day it shipped — it is a button, and clicking it twice
  to toggle back swept the `::selection` wash across the whole quote (the "it lights up" bug) — and the
  trade was that the one thing on the home page a reader might want to copy could not be. So the rule is
  gone and `wireDailyQuote` classifies the click instead, on TWO tests, both needed: a **live selection
  inside the figure** (a sweep or a double-click always ends in a click, and flipping there takes the very
  words away) and a press that **MOVED past `DQ_SLOP`** (a drag across empty space beside a short line
  selects nothing, so there is no selection left to test). It is the same classification the book's own
  tap-to-turn makes. The original carries **`notranslate`**, or the i18n engine would translate the
  one thing on the page that must stay as written. A quote has an `o` only where the original wording is documented —
  Bacon wrote in English, and Meditations VII.49's exact Greek could not be verified, so both render exactly as before
  with no `dq-flip` class, no cursor and no handler; **don't fill those in from memory**.
  **The day's quote follows `QUOTE_ORDER`, not the array** (`quoteRunningOrder`): the same author never speaks
  two days running and never more than twice in any seven days — in array order Confucius held the page for four
  days straight. The order is laid on a **circle** of `QUOTES.length` days and checked on every arc of it, wrap
  included: a reader sees that circle repeated, and a week is shorter than the cycle, so a circle that is legal
  all the way round is legal forever — which is why the order does **not** reshuffle per cycle (the join between
  two cycles is the one window neither can see). Greedy seating, busiest author first, plus a soft "a turn every
  n/c days" preference that is what makes the spread even rather than merely legal; seeded retries when a seating
  gets stuck. It rebuilds at load, so **adding quotes needs no thought here** — but the pool must stay solvable:
  an author with more than `2n/7` lines (5 of 20 today) cannot be spread by any arrangement, and the fallback is
  the best attempt, not a guarantee. Guarded by `.claude/test-daily-quote.js`, which slices `SHIPPED_QUOTES`
  — the literal, before any one editor's overlay — since the rule has to hold for what every reader gets.
  **THE POOL IS `SHIPPED_QUOTES` + THE ADMIN'S OVERLAY** (`quotesMerged` / `refreshQuotes` / `setQuoteEdit`
  / `revertQuote`, Aug 2026, on request, for the Admin → Quotes tab). It lives in app.js, which the app
  must never rewrite, so **the overlay IS the storage**: `ADMIN_EDITS.quotes` is applied over the literal
  exactly as the glossary's deltas are applied over glossary.js, and a signed-in admin's overlay reaches
  every reader through `content_overrides` with no deploy. The **key is a quote's shipped English text,
  never its index** — an index moves the moment a quote is inserted above it and every earlier edit would
  then point at somebody else's words, which is why the two daily-game pools are keyed by their English
  `q` too; `null` retires a shipped quote, and a key matching nothing shipped is one the admin added.
  `QUOTES` and `QUOTE_ORDER` are therefore both `let` and both DERIVED: the order is a property of the
  whole pool, so adding or retiring one quote re-solves the lot. **Any writer calls `refreshQuotes()`**,
  and `reapplyAdminOverlay` does too (undo, and a cloud-adopted overlay)) → review banner (+ the Collections button
  lip) → (first-run only) a 3-step how-it-works strip → a **Minigames** heading over the game tiles. That is the
  whole page, at every width.
  **THE DISCOVERY ROW IS GONE** (`.explore-grid`, and with it the **Card of the day** flip tile, the **Term of the
  day** tile and the **Atlas teaser**) — dropped from the phone in Aug 2026 and from the DESKTOP a fortnight later,
  on the request to bring the desktop into line with the phone rather than the other way round. `dailyPick` and
  `startMiniGlobe` went with it and are **not dead code left lying about — they are deleted**; ~90 CSS rules
  (`.exp-tile` / `.exp-card` / `.cod-*` / `.term-*` / `.atlas-*` / `.mini-globe`) went too. The one worth stating
  is the cost that is no longer paid anywhere: the mini globe was the **only caller of the `world` bundle outside
  the Atlas**, so the home page no longer fetches ~1.6 MB of borders at idle to turn an ornament. The
  Card-of-the-day PSEUDO-ENTRY (`COTD_ENTRY`, `S.cotd`) survives untouched — a reader who added cards that way
  still has them in the review, and the entry retires itself when its list empties.
  **THE `.howit` STRIP IS GONE TOO** (Aug 2026, on request), and `.hi-step` / `.hi-num` / `.hi-body` with it:
  the three-beat first-run explanation of the method that sat under the review banner — study a card, grade
  yourself, it comes back. The WALKTHROUGH offered directly above where it stood says all three properly,
  with the forgetting curve behind them and a real card to look at, so the strip was a first visit spending
  its attention twice on the same lesson. Its markup and its CSS are deleted rather than hidden at a
  breakpoint: the reasoning applies at every width, and the phone/desktop divergence is what this page has
  spent Aug 2026 removing. `TOUR_STEPS`' second step no longer names it as a target and falls to `.banners`.
  **Until the first card is ever graded**
  (`S.cards` empty) the banner is a **first-run hero**: purpose sentence + "Study your first cards"; the level badge,
  xp bar, stats, review-order toggle and active-deck list appear only after that.
  **ITS FIRST PRESS GOES TO THE COLLECTIONS** (Aug 2026, on request). It used to pick the first collection
  that was not coming soon, add it on the reader's behalf and deal them a card — quick, and making for them
  the one decision this page exists to hand over. They are sent to `#decks` instead, to choose their own.
  It can route there UNCONDITIONALLY because `fresh` already asks the harder question (next paragraph): a
  reader who has added a collection but not yet graded a card is no longer fresh, so they meet the ordinary
  banner with their decks under it and never reach that branch. That matters more than it looks — while the
  hero IS the banner it is the only way into a session, the deck list not being drawn under it, so a
  version of this that sent every press to the collections left a reader who had just added one looping
  back to the page they came from. The two changes landed on different branches; `test-tour.js` section 5b
  asserts both ends of it. The LABEL is untouched: the button is named for what it is for, and the
  collections are the first step of it.
  **A FIRST-TIME VISITOR IS ONE WITH NO HISTORY *AND* NOTHING TO STUDY** (`fresh`, Aug 2026, on a bug
  report: "I am now always forced into the first-time visitor view, and can no longer see my Daily study
  active decks" — from a reader who had used **Settings → Reset progress**). `fresh` was `S.cards` being
  empty, which is true of a genuine first-timer and equally true of somebody who has been here for months
  and has just cleared their schedule on purpose. And it does not merely change the banner's WORDING: it
  also **hides the list of added decks** (`reviewGroup`), so the one thing that reader wanted back was the
  one thing taken off the page. It is `Object.keys(S.cards).length === 0 && activeCardIds().length === 0`
  now, which needs **no new flag**, because a first-timer's shipped `S.active` is a single deck of the
  **coming-soon** China collection and `activeCardIds` filters that out through `availableCardIdSet` — so
  they still get the hero, exactly as before. Anyone with a studiable deck in their review gets the
  ordinary banner and their decks, whether they arrived there by resetting or by adding a collection before
  turning a single card over; that second case is an improvement rather than a side effect, since somebody
  who has just pressed Collections is better served by their own pile and a Start button than by being
  told again what Folio is for. **A state that is empty for a REASON is not the same as a state that has
  never been used, and a first-run screen keyed on emptiness alone cannot tell them apart.** Guarded by
  `.claude/test-reset.js`, in both directions.
  **The hero offers ONE way in, and its title breaks where it is written to** (Aug 2026, on request). The
  quiet "or browse the collections" beside the button is gone and `.hero-alt` with it — the collections are
  one press further on from wherever that button lands, and the Collections button under the review group is the route
  the home page advertises, so a second and quieter link in the same row only asked a first-time reader to
  choose between two things they cannot yet tell apart. The `#hero-browse` branch in the banner's own click
  handler went with the markup. The title carries an explicit `<br>` after "Memorize anything," rather than
  leaving the two halves to the wrap: it is a promise and a price, and which line each falls on should not
  be a function of the column width. The banner shows a **🔥 day-streak
  chip** (`S.streak`, shown at 2+ when the run is alive).
  **…AND, SINCE AUG 2026 ON REQUEST, THE DAY'S TIME ON CARDS** (`S.studyTime = { d, ms }`, `studyTimeAdd` /
  `studyTimeToday` / `fmtStudyTime` / `STUDY_TICK_MS` / `STUDY_IDLE_MS`; **`.rv-time` in the `.rv-foot`
  row**, not in the banner — see the last bullet). Five things are decisions rather than plumbing.
  · **THE MINIGAMES ARE EXCLUDED BY CONSTRUCTION, NOT BY A RULE** — the clock is a ticker living inside
    `PAGES.study` and `studyTimeAdd` has exactly that one caller, so no game can reach it and none has to
    be named. A rule listing the games would be a list to keep in step with the grid.
  · **IT IS A TICKER, NOT A STAMP PER CARD.** What was asked for is the time a question or an answer was ON
    SCREEN, and a card can be left mid-session, requeued, or read for three minutes with nothing graded —
    none of which a per-grade duration sees. **It cannot be summed out of `revlog` either**: that records a
    duration only for a card that was GRADED, capped at `REV_MAX_DS` (60s) precisely so a card left open
    over lunch cannot claim two hours, so both a long read and an abandoned session count wrongly there.
  · **TWO GUARDS MAKE THE FIGURE HONEST RATHER THAN MERELY LARGE**, and both matter on a phone: a tick is
    discarded while `document.hidden` or after `STUDY_IDLE_MS` (3 minutes) with no pointer, key, wheel,
    scroll or touch — a card left face-up on a table is not studying — and a tick is CLAMPED to twice its
    own interval, so a laptop waking from sleep cannot hand the day eight hours in one go. The idle window
    is deliberately generous: a reader three minutes into a 300-word background is reading it.
  · **THE TICKER IS SELF-STOPPING ON `root.isConnected`**, the shape `startMiniGlobe` uses — `render()`
    replaces `#view` without telling anyone and there is no teardown hook to hang it on — and it takes its
    document-level activity listeners with it when it goes. It counts only while a `.study-card` is
    actually painted, so the completion screen and the caught-up placard are not studying.
  · **IT REACHES `save()` ONCE A MINUTE, not on every tick**: `save()` queues a synced push, and a push
    every five seconds for a figure nothing else reads is a great deal of traffic for a clock. The grade
    path saves anyway, so in ordinary use the day is written down card by card; at most a minute is lost to
    an abrupt close, which is inside the honesty of the figure.
  · **IT SITS AT THE BOTTOM LEFT OF THE REVIEW GROUP, NOT IN THE BANNER** (Aug 2026, on request — it was a
    fourth `.stat` in the meta row beside New / Learning / Review, and `.banner .stat.st-time` is gone).
    Those three say what is LEFT to do today and this says what has been DONE, so standing it among them
    asked a reader to take four numbers of two different kinds off one line. It takes the left end of the
    **`.rv-foot`** row instead, the line under the deck list, so the two sit at the
    two ends of the block's own bottom edge — which cost that row nothing, `margin-inline-start:auto` on
    the lip having always held it right whatever stood to its left ("+ New group" did, until it went).
    Two consequences worth knowing. Out there it is on the page's own **paper** rather than on the card,
    where its `--ink-faint` label measures exactly what the About line below it already measures (2.78–5.23
    across the six themes both ways, sampled from painted pixels; the shipped bar is folio/light/`body.hc`,
    where it reads 4.96) — so it introduces no contrast state the site had not got. And it stops being a
    figure over a word: the row is one small tab high, so it is **one line**, and it names the day now that
    nothing beside it supplies one.
  · **THE WORD LEADS AND THE FIGURE FOLLOWS** — "studied 13m today", not "13m studied today" (Aug 2026, on
    request). A figure with its label under it is what the three piles in the banner are, and reversing the
    order is what stops this reading as a fourth one: it is a sentence about the day rather than a labelled
    statistic. Three flex children rather than two, so the row's own `gap` spaces them and no text node
    carries a space of its own — and "today" is LAST, which is what lets `.rv-today` drop it below 430px
    without leaving the line ungrammatical ("studied 3h 07m" is whole; "13m studied" was not).
  The figure is day-stamped like `reviewDay` and `deckDay`, so it resets in place with nothing to run at
  midnight, and is **drawn only once there is time to report** — a "0s" before the first card is a clock
  saying nothing has happened, which the empty row already says. `fmtStudyTime` prints seconds below a
  minute ("45s"), because rounding the first card of the day up to "1m" is a small lie and "<1m" is not a
  figure. It is in `PROGRESS_FIELDS` (time studied is a fact about the reader, so a phone and a
  laptop agree) and deliberately NOT in `RESET_KEEPS` — it is study history, which is what that control
  names. Measured at 390px with everything on the row: it fits with the streak chip beside it.
  **Completion is a MARK in the top-right corner, and
  it comes in TWO SHAPES** (`doneMarkHTML` in `PAGES.home`; Aug 2026). The tile used to FILL with its colour
  once played and turn gold on a perfect score, which was a lot of surface to change for one fact and fought
  every theme's own treatment of the card; that became a diagonal **ribbon**, and the ribbon then split in
  two on a second request. A **perfect** score keeps it — the shining gold (`.gt-ribbon.gr-gold`,
  `gt-gold-shine`) reading "Perfect!". Merely **having played** is a small green circled check
  (`.gt-check`, `--good`) instead of a green band reading "Done!": a ribbon is a lot of tile for a fact that
  only says "you have been here today", and a gridful of them read as a row of announcements rather
  than as games ticked off. **Both still carry a NAME** — the ribbon its word, the circle an `aria-label` —
  because an unlabelled patch of colour says nothing to a screen reader and little more to the eye, which is
  the reasoning the ribbon was built on and is not weakened by the mark getting smaller. `.done` / `.won`
  stay on the element (they are what the tests and the achievements read); all they do now is carry the mark.
  The earned fill that used to run down the added decks went with the original change (`rv-done` / `rv-won`
  are still set on `.review-group`, and nothing styles them). It reads `S.reviewDay = { d, n, miss }` (in
  `defaultState` + `PROGRESS_FIELDS`), written by **`logReviewDay`** from `grade()`: only a card's FIRST attempt
  of the day counts (`firstToday`, from the pre-grade `c.last`), since a learning card is graded again ten minutes
  later; correct = anything but Again, as in `logReview`. `reviewLog` can't answer this — it counts every grade
  and only tracks mature ones. Both fills carry `.review-group` in their selector **for specificity**: marble and
  academy dress `.banner` with a surface of their own, and the earned fill must outrank it in every theme; the
  gold is `.done.won`, since a perfect day carries both classes. **The home page must not read as China-centric** — Folio
  covers many history topics; copy stays subject-neutral (China is just the first live collection).
  **A "Seen total" stat sat beside Due and New and was removed on request (Aug 2026)** — the xp bar directly above
  it already counts the distinct cards studied, as progress towards the next level rather than a bare number.
  **The banner is headed "Daily study"** (Aug 2026, renamed from "Daily review" on request). It is
  `REVIEW_TITLE`, and the heading now INTERPOLATES that constant rather than restating it, so the banner and
  the long-press sheet's own head cannot come to disagree about what the thing is called. The route, the
  entry id (`REVIEW_ENTRY`, `"review:all"`) and every internal name are untouched, and the prose in this file
  still says "daily review" for the mechanism — only what a reader is shown changed.
  **The banner carries NO big numeral and no description line while there is work** (Aug 2026, on request —
  it had a gold numeral of the day's whole pile for a fortnight, and `pileBadgeMarkup` went with it). The
  numeral was a fourth unlabelled number competing with the three labelled counts directly below it, which
  break the same total into New / Learning / Review and are the answer a reader is actually after; the
  sentence ("Cards scheduled for today, plus a few new ones…") described those three counts in words. The
  other two `.desc` branches STAY — one says the day is finished and the other says there is nothing here
  yet, and neither is visible anywhere else on the banner. The level is still spelled out by `xpBarMarkup`
  directly underneath. **`test-account-switch.js` therefore reads the xp bar**, not a badge, to tell an
  account that has studied from one that has not.
  **AND A FINISHED DAY OFFERS NO BUTTON AT ALL** (Aug 2026, on request). The CTA used to become "Browse
  collections" once the pile was empty, which is a second route to a page the Collections button under the
  group already reaches, dressed as the primary action of a banner whose own subject is finished — so the
  `.cta` is simply not emitted when `dueN + newN` is zero and the sentence saying the day is done stands
  alone. **Nothing pressable becomes a dead no-op**: the banner's own click handler still falls through to
  the collections, so an idle tap on the card does what it always did; what is gone is the invitation.
  **The banner counts ANKI'S THREE PILES** (Aug 2026, on request — it was a Due / New pair): **New** in blue,
  **Learning** in red, **Review** in green (`pileCounts` in `PAGES.home`; the tokens are the study bar's own
  `--indigo-bright` / `--zh` / `--good`, so all three sites agree). The same three numbers, unlabelled, open every
  added deck's row below it (`adCounts` → `.dk-counts`), computed by the SAME function over that deck's ids, so a
  row can never claim work the banner does not. Two things about the split are deliberate: **new** is the day's
  allowance (`reviewQueue().fresh`), not the whole unseen backlog, and a **learning** card counts from the moment
  it is answered wrong until it graduates — whether or not its ten-minute step has come round — because a count
  that emptied while the card sat on its timer would say the work was done. `review` is the due pile minus those.
  Each figure is **centred over its own label** and the three sit on the **CTA's own line**; below 640px that
  costs the button its width (`.review-group .banner .cta .btn` shrinks and the row goes `nowrap`), since a
  button on a line of its own left the piles floating over nothing.
  The button is **CENTRED against them** (`align-items:center`, Aug 2026, on request): a figure over a label is a
  two-line column, and the `flex-end` this rule used to carry put a one-line button on its baseline, reading as
  having slipped down.
  **THE BANNER IS LIGHT BLUE** (`--tile:#5AA9DC`, Aug 2026, on request — it was a bronze, `#9A6634`, from the
  days when the tile earned that colour as a fill). It is set TWICE and the two must be kept in step:
  `.banner` carries it because `.banner` is the review banner and nothing else on the site, and
  `.review-group` carries it because that is what a row with no collection hue of its own falls back to — and
  a value set on the banner element itself outranks anything inherited, so the group's copy cannot serve for
  both. `.deck-group`'s own fallback is a third copy of the same figure.
  **…AND IT CHANGES EVERY DAY** (`DAY_HUES` / `dayHue`, Aug 2026, on request). Twelve hues round the wheel,
  one per day, taken IN ORDER rather than at random — a random pick repeats, and two days the same colour
  reads as the feature having stopped rather than as chance. The index comes from `dayKey`, so it turns over
  at the reader's OWN day boundary, the same moment the quote and the day's allowance do, rather than at
  some hour of its own. They are lighter and brighter than the collection hues on purpose: a collection's
  colour has to stay legible under 30% of it behind body text, where this is a wash across a whole banner.
  It is set INLINE on the banner element, so it beats the stylesheet's own `--tile` without either of them
  having to know about the other — and the DECK ROWS below keep `.review-group`'s static value, or the whole
  list would change colour every morning with it. The light blue above is Tuesday's, and the stylesheet's
  copy is still what a theme, a hero and every fallback read.
  **"+ NEW GROUP" AND THE CHEST COUNT HAVE BOTH LEFT THE BANNER** (Aug 2026, on request), and with them the
  last two things nested inside that button: `#b-review`'s click handler no longer steps around any target of
  its own. The group control is at the bottom left of the DECK LIST now (`.rv-foot` / `.rv-tools` /
  `#b-newgroup` — see `docs/daily-study.md`), and a waiting chest is announced by `chestBannerHTML` in
  `#chestSlot` ABOVE the banner rather than counted as a fourth stat inside it (see THE RELIQUARY). Both are
  real `<button>`s out here, so neither needs the `role="button"` span and hand-written Enter/Space handler
  that a control inside a button required.
- **The home page is ONE COLUMN and, since Aug 2026, LITERALLY THE SAME PAGE at every width** (`PAGES.home`).
  It was three swiped panes for a week (`.home-pager` / `.hp-pane` / `#homeDots` — all
  gone, along with their ≤640px rules), then one column on a phone and a longer page on a desktop, and is now the
  same page on both: quote → review group (+ the lip, + the first-run how-it-works strip) → a **Minigames**
  heading over the game grid → the About line, in `.banners`, which is the flex column the pager used to be.
  · **THERE IS NO `phone` FLAG AND NO RESIZE LISTENER ANY MORE** (Aug 2026). The retreat ran: the swiped
    panes, then the discovery row, then the lip to the collections, and finally the About line, each brought
    into line on request and always in the direction of what the phone already showed. With the desktop's
    About tab gone the line ships at both widths, and nothing here is BUILT at one width and not the other —
    so `const phone = phoneHome()` and `_homeResize` (which existed only to rebuild the page on a breakpoint
    cross, since that is a difference CSS cannot make) are both retired. `_homeResize` is still torn DOWN on
    the way in, so a listener installed by an older build in the same session goes with it. What still
    differs is layout, and the stylesheet answers for that alone.
  · **The games are 3 × 2 on a phone and 3-wide on a desktop, under a `.games-head` heading that now ships at
    EVERY width** (Aug 2026, on request — it was phone-only, and with the discovery row gone the grid is the
    last thing on the page, so six coloured squares under nothing at all do not say what they are). The heading
    was centred, then left for a fortnight, then centred again on request. The class is deliberately **not** `.mg-head`: `mg-` is the MAP GAME's prefix
    (`.mg-card` / `.mg-head` / `.mg-score`), and reusing it gave the heading that card's `display:flex` —
    which beats `text-align` outright, so it rendered hard left with a computed `text-align:center` — while
    pushing this heading's font and colour onto the game's own score row. `test-layout.js` measures the
    heading TEXT's centre through a Range rather than reading `text-align`, which is the only way to tell
    the two apart. The tiles' **taglines are gone at EVERY width now, and dropped at the source** — `gameSub`
    returns the score or nothing, so there is no `.gt-sub` to hide in CSS. They went from the phone first
    (three to a row leaves ~86px of text column, where one sentence runs to four lines and buries the name
    above it) and from the desktop with the discovery row, on request. **Today's SCORE stays**, in its bare
    figures ("3/5"): it is not a description, it is the one thing on the tile that changes during the day. The
    blank sixth tile lost its sentence the same way.
  · **The way to the collections is `.home-collections`** — a free-standing button reading **Collections**,
    centred under the review group (`#b-addDecks` → `route("decks")`). It replaced the `.rv-lip` tab in Aug
    2026, on request, which had itself replaced the full-width `.lib-banner`. It is **the ONLY route to the
    collections anywhere on the site**, so it ships at every width and in every state the review can be in,
    first run included — don't gate it on having decks or on a breakpoint. The `#decks` ROUTE is untouched
    and must stay so: every link ever shared points at it, and `test-library.js` loads one.
    Two things about the shape are load-bearing. **It is a SIBLING of the review group inside `.banners`,
    not a child of it** — that is the whole of "unattached", and it is what the lip could not be: a lip has
    to hang off an edge, so it had to be the group's last child, in flow, because the deck list is glued
    flush to the banner above it and an absolutely-positioned tab would have to guess the list's height on
    every render. Out here none of that arises. And **`.banners` is a flex COLUMN, so `align-self:center`
    is what stops it spanning the whole width** — a block child there is full width by default, which
    reads as a second banner rather than as a button, which is exactly what the lip replaced.
    It keeps the lip's **indigo fill with white text** (Aug 2026, on request), the site's own
    primary-button colour, so it matches Start review directly above it; paper-on-paper it read as part of
    the card's own edge, which is the failure that colour fixes.
    `.rv-foot` survives and now holds the day's timer alone, so it is drawn only once there is a time to
    report — an empty row would otherwise leave a band of nothing under the deck list.
  · **`.home-about`** — a centred grey "About Folio" line (`#b-about` → `route("mission")`) at the foot, from
    when About left the tab bar. It was phone-only for a fortnight and now ships at **EVERY width** (Aug
    2026, on request), the About tab having left the DESKTOP's top bar too: this is the only route to the
    page anywhere on the site, so it must not be gated on a breakpoint — exactly the rule the Collections
    button already follows. The `#mission` ROUTE is untouched and must stay so: every link ever
    shared points at it, and `setActiveTab` already handles a route with no tab (nothing lights). Its
    `20px 0 16px` padding is the whole of its separation
    from the games above it (Aug 2026, on request — it was `4px 0 2px`, leaving it crowded against the grid),
    and **above 640px the top of it goes to 48px** (Aug 2026, on request): those figures are a PHONE's, where
    the page ending a thumb's width below the last tile is right and more air there is only scrolling, and a
    wide window has the room to let the last line of the page read plainly as the end of it. It is
    `padding-top` rather than a margin so the space stays part of the button's own target.
    Guarded by `test-layout.js`.
