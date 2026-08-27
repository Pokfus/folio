# Folio's schedule — the day boundary, SM-2, FSRS, load balancing and burying

**Read this before touching anything named `sched*`, `fsrs*`, `dayKey*`, `loadMap*` or `bury*`.**

`CLAUDE.md`'s "How the app is wired" carries the operational summary: what each piece is, the purity
rule the whole scheduler rests on, and which suites guard it. This file carries the rest — why the port
is Anki's rather than an approximation of it, why the FSRS arithmetic is pinned against a fixture the
reference implementation generated, and the several faults that were invisible on the page because a
wrong interval is still a number on a button.

The seven bullets below are as they stood in CLAUDE.md, verbatim.

- **THE DAY BOUNDARY** (`dayKey` / `dayKeyOfDate` / `dayEndMin` / `dayEndTs` / `scheduleDayRoll`, Aug 2026,
  on a bug report: "the daily quote doesn't always change exactly at midnight"). A day used to be a UTC day
  (`new Date().toISOString().slice(0,10)`), so the quote, the card of the day, the streak, the review's
  allowance and the games' per-day records all rolled over at an hour that was not midnight for anybody off
  the Greenwich meridian. A day now runs on **THIS DEVICE'S OWN CLOCK** and ends at `S.settings.dayEnd` —
  minutes past midnight, 0 by default, capped at noon (`DAY_END_MAX`), set in **Settings → Study → Day ends
  at** — so a reader who studies until two in the morning can keep the day open until then.
  · **`dayKey(ts)` is the SINGLE derivation and everything goes through it.** The key was computed in ten
    places by slicing an ISO string; a rule applied in nine of them would leave one surface rolling over at a
    different moment from its neighbours, which reads as a bug in whichever surface you happen to be looking
    at. `dayKeyOfDate(d)` is the sibling for the two places that ITERATE days (`reviewHistory`, the heatmap)
    rather than deriving one from a timestamp, and `dayEndTs()` is what `dueForecast` means by "the end of
    today" now that 23:59 is not it.
  · **It deliberately does NOT derive a zone from `S.settings.home`.** A lon/lat cannot be turned into a
    political time zone without a tz database, and approximating one from longitude would put the Netherlands
    (lon 5.3) on UTC+0 — an hour or two out from the reader's own clock, and worse than the device time it
    replaced. The Settings row says "this device's clock" outright.
  · **`scheduleDayRoll()`** re-arms itself and repaints ONLY the home page, which is where everything dated
    lives; a repaint under a reader mid-card would take the card away.
- **THE SCHEDULER — Anki's SM-2, ported (Aug 2026, on request).** The `THE SCHEDULER` block in app.js, just above the SRS
  helpers. It replaced an approximation of Anki with the thing itself, on the request to "copy the entire spaced interval
  system exactly from Anki".
  · **The whole of it is PURE** — `schedAnswer(card, grade, t, seed, cfg)` returns a NEW record and reads no global, no DOM
    and no clock beyond its `t`. That is what lets `.claude/test-scheduler.js` walk every path as arithmetic rather than
    through a browser, and it is also what keeps the undo snapshot valid (the caller's record is never mutated).
    `grade()` is now only the bookkeeping around it: the review log, the streak, the day's new-card count, level-ups.
    **THE FOUR IMPURE LOOKUPS SIT BELOW THE `/* ---------- SRS ---------- */` MARKER ON PURPOSE** — `schedModeOf`,
    `deckSchedCfg`, `cardEntryId` and `schedCfgFor` read `S`, `UCARDS` and `cardLeaves`, and that marker is where
    `test-scheduler.js` STOPS SLICING. They were written above it first and the purity assertion caught them at once;
    keep new config readers on that side of the line, and pass the resolved `cfg` down rather than looking it up inside
    the arithmetic.
  · **`SCHED` holds Anki's defaults in one place** — learning steps `1m 10m`, relearning `10m`, graduating 1 day, easy
    4 days, starting ease 2.5 (floor 1.3), hard ×1.2, easy bonus ×1.35, lapse ×0 with a 1-day minimum, max 36500 days,
    leech at 8 lapses. There is deliberately **no UI for these** — the request was for Anki's schedule, not Anki's deck
    options — but they are a config object rather than scattered literals so a per-deck override is a small change.
  · **A new card WALKS THE STEPS, which is the reported bug.** The first Good sends it to the 10-minute step and the back
    of the day's queue; only the second graduates it to a day. `Hard` on the first step is the **midpoint of the two
    steps** (5.5m), or Again and Hard would both mean one minute and the button would be a lie.
  · **A lapse RELEARNS rather than resetting** — status `"relearn"`, ease −0.20, and the interval it returns to is
    computed at the moment it lapses and carried on the card as **`lapseIv`**. The record gains **`step`** too. Both
    back-fill by their own absence, so **nothing migrates**: an older single-step learning card reads as standing on
    step 1 and takes one more Good, which is the intended new behaviour anyway.
  · **`status` gains `"relearn"` beside new / learning / review.** Every counter that used to test `=== "learning"` calls
    **`schedIsLearning()`** now — a lapsed card is being learned again and Anki files it in the same pile — so reach for
    that helper rather than adding a third comparison.
  · **THE FUZZ IS SEEDED BY THE CARD, NOT THE CLOCK**, and that is what makes the grade buttons honest: `schedPreview`
    and `schedAnswer` compute the same number, so a button reading "12d" schedules 12 days. **Both take the same `t`** —
    a preview that read `Date.now()` while the grade took the passed time previewed one interval and scheduled another
    on any overdue card (caught by the test, not by eye).
  · **`fmtInterval` renders real minutes.** It answered `<10m` for everything under an hour and then labelled HOURS as
    minutes, so both rungs of the ladder read the same and neither read correctly.
  · **The requeue rule is the DAY BOUNDARY**, not a fixed window: `{requeue: schedIsLearning(status) && (due < dayEndTs()
    || due - now <= SCHED_AHEAD_MS)}`. The old 11-minute window silently stopped requeuing the moment a step ran longer
    than it; the learn-ahead allowance is Anki's, and is what stops the last card of a late-night session being stranded
    a few minutes the wrong side of the cut-off.
  · **A DUE DATE MEASURED IN DAYS LANDS AT THE START OF ITS DAY** (`dayStartTs` / `SCHED.dayAnchor` / `schedDayDue`,
    Aug 2026, on request). An interval of one day used to mean *twenty-four hours from the moment you graded it*, so a
    card answered at nine in the evening was not offered again until nine the next evening — which makes "today's
    review" a moving window rather than a day, and means a reader who studies in the morning meets none of yesterday
    evening's cards. Anything scheduled in **days** is now anchored to the start of the reader's own day (`dayEnd`
    included, so it is the same boundary the streak, the quote and the day's allowance turn over on) plus the fuzz;
    anything in **minutes** — the learning steps — is untouched, since those are genuinely a delay from now.
    **It is a `cfg` field, not a global read**, so the pure block stays pure: `deckSchedCfg` and `schedCfgFor` attach
    `dayAnchor`, and a `cfg` without one behaves exactly as before, which is what keeps `test-scheduler.js`'s older
    sections describing the same function. Both schedulers go through it — `fsrsAnswer` routes its interval through
    `schedPass` — so neither knows about it.
  · `S.intro.count` (the daily new-card cap via `newRemainingToday`) is still incremented only on a card's FIRST grade
    (`fresh`), so a requeued learning card is never re-counted.
  · **Guarded by `.claude/test-scheduler.js` (136 assertions, no browser, no dependencies)** — including the ordering
    guarantee Hard < Good < Easy over 1,600 interval/ease combinations, that preview and grade agree over 360 cases,
    that nothing is ever scheduled into the past, and that old records back-fill. Its two most useful finds were both
    invisible on the page: the ordering floor walking Easy past the maximum interval, and the preview/grade clock
    mismatch above. `.claude/test-review-decks.js` section 6 pins the same thing end to end in a real session — and
    **tracks the card by ID out of the session record, never by the question on screen**, which is a different one of
    its three phrasings each time it is shown.
  · **Re-run both after touching `SCHED` / `schedAnswer` / `schedPreview` / `schedPass` / `schedFuzz` / `schedIsLearning`
    / `schedDayDue` / `dayStartTs` / `fmtInterval`, or the requeue line in `grade()`.**
- **FSRS, CHOSEN PER DECK (Aug 2026, on request).** The `FSRS` block in app.js, between SM-2 and the SRS helpers.
  SM-2 asks *how did that go* and multiplies an interval; FSRS models the memory — a **stability** (the delay at which
  recall is about 90%) and a **difficulty** (1–10) carried on the card record beside the interval — and computes the delay
  at which the reader's own target retention is reached. A deck is on one or the other; the reader also says what they are
  aiming for (`retention`, 0.70–0.98, default 0.90).
  · **IT IS FSRS-6 AND IT WAS NOT WRITTEN FROM MEMORY, which is the most important thing on this bullet.** Every formula
    and all 21 default parameters were read off the reference implementation (`py-fsrs`, open-spaced-repetition), and the
    arithmetic is pinned against vectors **generated by it** — `.claude/fsrs-vectors.json`, written by
    `.claude/gen-fsrs-vectors.py` (a dev-only script; `py-fsrs` is installed OUTSIDE the repo, like Playwright). A
    scheduler that is subtly wrong reports nothing, throws nothing and quietly teaches every reader worse, so **a change
    to any `fsrs*` function is verified against the fixture and never by eye**. Regenerate the fixture only when
    deliberately moving to a new FSRS version, and say so — a fixture regenerated to match a change proves nothing.
    **The fixture RECORDS which reference produced it** (`ref`, printed by test-scheduler.js — `py-fsrs 6.3.2` today),
    for exactly that reason: without it there is nothing to tell a deliberate version bump from a file edited to fit a
    bug. Verified with `/tmp/fsrsenv/bin/python .claude/gen-fsrs-vectors.py` regenerating it byte-identically.
  · **FSRS REPLACES THE INTERVAL ARITHMETIC AND NOTHING ELSE**, which is also how Anki does it. The statuses, the learning
    steps (`1m 10m`), the relearning step, the fuzz, the day boundary, the requeue rule, the leech count and the whole of
    `grade()`'s bookkeeping are untouched: a new card still walks the steps, and FSRS decides where it lands when it
    graduates. So `fsrsAnswer` mirrors `schedAnswer`'s shape exactly and `fsrsPreviewIvs` mirrors `schedPreview`'s, which
    is what keeps the grade buttons honest under both.
  · **DECAY AND FACTOR ARE DERIVED FROM `w20`, not fixed** — that is FSRS-6's whole addition over FSRS-5 (the forgetting
    curve's shape became a fitted parameter), so `fsrsDecay`/`fsrsFactor` must never be written as constants or a reader's
    own pasted parameters would be half-ignored.
  · **SEEDING: interval → stability, and the difficulty is NOT guessed from the ease** (`fsrsSeed`). Turning FSRS on
    mid-deck must not throw away what the reader has learned, and an SM-2 interval and an FSRS stability are the same
    thing measured the same way, so the interval carries straight across. The ease is a different quantity on a different
    scale with a different meaning, so a seeded card starts at the **Good initial difficulty** and lets its next few
    reviews say what it really is; a confident wrong difficulty is worse than an honest default. A card with no interval
    at all is simply new to FSRS.
  · **PER-DECK, and the pooled review honours each card's OWN deck** (`schedModeOf` / `deckSchedCfg` / `cardEntryId` /
    `schedCfgFor`, all below the purity marker). The mode lives in `S.deckOpts[entryId].sched`, beside the daily limits
    and question variety and written by the same `setDeckLimits`, so it syncs and needs no field of its own and **nothing
    migrates** — an absent key is SM-2, which is every existing deck. `cardEntryId` is what makes a card studied from the
    pooled review, from its own row or from a deep link get the same scheduler. Being in `deckOpts` also means the choice
    **survives Settings → Reset progress** (`deckOpts` is in `RESET_KEEPS`), which is right: the schedule is cleared and
    every card's stability goes with it, but how the reader wants their decks scheduled is a preference, not history.
  · **A READER'S OWN PARAMETERS ARE ACCEPTED OR REFUSED, never half-taken** (`setDeckFsrsParams`): 21 finite numbers or an
    error naming the count, and an empty box clears them back to the defaults. Somebody who has had FSRS optimised in Anki
    should not have to lose that; Folio fits its own from the review archive (see THE FSRS OPTIMISER below).
  · **ELAPSED DAYS ARE WHOLE AND FLOORED**, which is the reference's convention (`(now - last).days`) and which Folio got
    WRONG for the first few hours of FSRS's life, reading the same delay as a fraction. It is not a rounding detail: the
    forgetting curve is evaluated at that number, so a card answered 1.9 days late was scored at 1.9 where every parameter
    set in the world — the defaults, and any set a reader pastes out of Anki — was fitted against 1. **The fixture could
    not see it because every gap in it was a whole number of days**; there are fractional gaps in it now, and they fail
    loudly if this is ever un-fixed (worst stability error 7.65 when it was).
  · **NO OTHER STUDY APP IS NAMED IN A SETTINGS SHEET** (Aug 2026, on request). The deck sheet's Scheduling row read
    "SM-2, the classic Anki schedule", the two Scheduling rows called SM-2 "the classic Anki schedule" and FSRS "Anki's
    default", and the parameters note offered to take a set "if Anki has already optimised parameters for you" — all
    four are reworded to describe what the thing DOES, which is what a reader choosing between two schedulers needs;
    the last says "fitted for you elsewhere". **The debt is real, so it is stated once and properly**: Anki and FSRS
    are both credited in the About page's "Credits & sources" list, naming what Folio's schedule is modelled on and
    that it shares no code with either. The code COMMENTS in the scheduler blocks still name Anki freely — they are
    where the reasoning lives and are not user-facing.
  · **The sheet is `openDeckSched(id)`**, reached from a deck's own long-press options ("Scheduling"). The retention box
    and the parameters box are drawn only under FSRS, since neither means anything under SM-2. **`deckSheet` honours
    `[data-dmfocus]`** because of this sheet: its own `setTimeout(0)` focus ran after the caller's and left a focus ring on
    the un-chosen row beside a tick on the chosen one — a general fix, so any sheet may nominate its initial focus now.
  · Card info shows **stability and difficulty instead of the ease** under FSRS, and names the scheduler with the target
    retention — the ease is a leftover there and showing it would invite a reader to read meaning into a number nothing
    uses. Two things about that panel are worth carrying, and both shipped WRONG for an hour and were caught by looking
    at it rather than by any test. **THE 90 IN "the delay at ~90% recall" IS NOT THE READER'S TARGET**: stability is
    defined at 90% whatever retention the deck asks for, so on a deck set to 85% that annotation sat four rows above
    "aiming to remember 85%" and read as the setting having been ignored — it said "the 90% interval" and now says what
    it measures. And the review-history table's sixth column is **whichever number the scheduler actually uses**, headed
    from the card's own mode (an ease as a percentage under SM-2, a difficulty out of 10 under FSRS): `logReviewEntry`
    writes `post.difficulty` where there is one and `post.ease` otherwise, since **only `fsrsAnswer` ever writes a
    difficulty**, so the row says for itself which scheduler produced it with no extra field. That is also what
    `review_log.ease100` has always documented. The one case the two can disagree is a deck switched between schedulers
    part-way through, where older rows keep their own values under the newer heading — recorded rather than repaired.
  · **Guarded by `.claude/test-scheduler.js` sections 10 and 10b** (the fixture, to 1e-9, over 768 steps, plus the
    properties a fixture cannot state: recall never loses stability, a lapse never gains it, difficulty stays in 1–10,
    stability never falls below its floor, nothing is scheduled into the past, and seeding takes the interval and not the
    ease) and by **`.claude/test-review-decks.js` sections 11–14** end to end — the sheet, the per-deck isolation (one deck
    on FSRS while its neighbour stays on SM-2, both studied from the pooled review), the seeding, and what Card info says.
- **LOAD BALANCING AND EASY DAYS (Aug 2026, on request).** `schedFuzzRange` / `schedSpread` / `LOAD_AVOID` /
  `LOAD_NEAR` in the pure scheduler, `loadMapNow` / `bumpLoadMap` / `easyDays` / `easyDaysOn` /
  `loadBalanceOn` below the SRS marker, and two rows in **Settings → Study**. Anki's two features, and they
  are one mechanism: the fuzz has always spread an interval over a few days at random, and this decides
  WHICH of those days rather than leaving it to a hash — the quietest one, and never a day the reader has
  said they do not study if the range holds anything else.
  · **IT REPLACES THE FUZZ'S CHOICE AND NOTHING ELSE**, which is what makes it safe to turn on mid-collection
    and is asserted directly: the day chosen is always inside the range the unbalanced fuzz could already
    have chosen, so a schedule cannot be quietly lengthened or shortened. `schedFuzz` is now `schedFuzzRange`
    plus the same hash pick, so with no map the result is byte-for-byte what it always was.
  · **ONE INSERTION POINT COVERS BOTH SCHEDULERS.** It is in `schedPass`, and `fsrsAnswer` routes its own
    interval through `schedPass` too — so FSRS and SM-2 are balanced by the same code and neither knows about
    it. Anki ties easy days to FSRS; there is no reason to here.
  · **HARD < GOOD < EASY SURVIVES IT because the floor is applied AFTER.** The three ranges overlap, so the
    balancer can hand back the same day for two grades; `schedPass`'s `Math.max(floor, …)` is what pulls them
    apart again. Move the balancing below the floor and the ordering goes — which is why the test walks every
    interval and ease with a deliberately lumpy pile.
  · **THE MAP TRAVELS ON `cfg`, and that is the load-bearing decision.** It keeps the arithmetic pure (no
    reader of `S` above the marker) and, more importantly, it is what keeps **the preview and the grade in
    agreement**: both are handed the same cfg, so a button reading "12d" still schedules twelve days. A map
    read from a global at each call could differ between the two, which is the clock-seeded-fuzz mistake in a
    new coat — and it is asserted, not assumed.
  · **BOTH ARE DEFAULT OFF**, and `loadMapNow` returns null unless one of them is on, so a reader who has not
    asked pays nothing and their intervals are exactly what they were. That is the house rule rather than a
    view about which default is better — Anki's own balancer defaults on.
  · **A MARKED DAY IS AVOIDED, NOT FORBIDDEN** (`LOAD_AVOID` is a large number, not `Infinity`). If every day
    in a card's range is marked it still lands on one: a card that cannot be scheduled at all is worse than
    one arriving on a Sunday, and the loop must not fall through to nothing. `LOAD_NEAR` breaks ties toward
    the interval the scheduler actually wanted, so a level pile leaves the card where it would have been.
  · **STORED SUNDAY-FIRST, DRAWN MONDAY-FIRST.** `S.settings.easyDays` is indexed by `Date#getDay`, so the
    scheduler steps the weekday modularly with no conversion at all; the UI orders them Monday-first to match
    the heatmap. Two honest approximations are stated in the code rather than hidden: the weekday is stepped
    from `dow0` rather than re-derived per candidate, so it can be a day out across a daylight-saving change,
    and the card being rescheduled still counts itself in its OLD bucket, which is almost never inside the
    range it is moving to.
  · **The map is cached for the DAY and `bumpLoadMap()` is called wherever a due date moves** — `grade()`,
    `applySetDue`, `applyForget`, and both settings. A stale map corrupts nothing (the worst case is a card
    landing on a day that filled up since) but would slowly stop doing the job it exists for.
  · **The row for the seven days STACKS** (`.set-row-stack`): `.set-row` is a flex line with `flex:1` prose
    and a `flex:none` control, which is right for a switch and hopeless for seven buttons — in the settings
    column they claimed the whole line and squeezed the description to one word per line. Found by looking at
    the page, which is the only way a squeeze like that shows up.
- **THE FSRS OPTIMISER (Aug 2026, on request).** The `THE FSRS OPTIMISER` block in app.js, inside the pure scheduler slice.
  FSRS's 21 parameters describe how a memory fades; the defaults describe the average of millions of reviews and these
  describe the reader's own. It is what the per-review log was uncapped FOR — a card record keeps only its latest review,
  so none of this can be reconstructed after the fact.
  · **WHAT IS FITTED.** Each card's reviews are a sequence: from the state after review i-1 and the delay to review i,
    FSRS predicts the chance of recall and the answer says what happened (anything but Again is a recall). The loss is the
    mean binary cross-entropy between the two. **Same-day reviews are excluded** (retrievability is defined at a scale of
    days) **and so is a card's first review** (no prior state to predict from) — both the reference's exclusions, and both
    the reason `fsrsLossReviews` is much smaller than the row count and is computed rather than approximated.
  · **THE LOSS IS CHECKED AGAINST THE REFERENCE; THE DESCENT IS NOT, and that division is the whole design.** Two gradient
    descents never land on the same 21 numbers, so comparing the OUTPUT against py-fsrs would be comparing noise — while
    the loss being descended is a fixed function of the parameters and the data, and getting it wrong is how an optimiser
    confidently walks a reader's schedule somewhere worse. So the fixture carries a synthetic 60-card history scored by
    the reference's own `Optimizer._compute_batch_loss` at two parameter sets, and `fsrsBatchLoss` is held to it **to
    1e-9**. (That needs torch/pandas/tqdm in the scratch venv beside `fsrs`: `pip install torch --index-url
    https://download.pytorch.org/whl/cpu`, then `pip install pandas tqdm`.)
  · **THE GRADIENT IS NUMERICAL**, the other deliberate departure: the reference differentiates a torch graph and Folio has
    no torch and no build step. Hand-derived analytic gradients over 21 parameters would be ~200 lines of calculus with
    nothing to check them against — the exact mistake this feature exists to avoid — where a finite difference is derived
    mechanically from the loss, which IS checked. It costs 22 evaluations a step. **Full-batch, where the reference takes
    mini-batches**: a mini-batch gradient needs card states carried across the batch boundary, which autograd gets free and
    a finite difference does not, and the full batch is what the reference itself selects its best epoch on anyway.
  · **IT IS ALLOWED TO REFUSE, and both refusals matter.** Too little history — the reference's own floor of one
    mini-batch, 512 loss-bearing reviews — returns `reason:"few"` **naming the number it has and the number it wants**,
    because "not enough" with no figure is untestable by the reader. And a fit that does not beat the defaults **on a
    held-out tail it never trained on** returns `reason:"noBetter"`: that guard is Folio's own and is the one that counts,
    since a reader pressing this is handing over their schedule and the honest answer to "your history does not support
    better parameters" is to say so. The split is **within each card's sequence, not by card** — splitting by card would
    judge a card the fit had never seen from a cold start, where a tail is the fair question (given what this card did,
    does the fitted set predict what it did NEXT any better?).
  · **A SEQUENCE MUST BEGIN AT THE CARD'S FIRST REVIEW** (`fsrsSequences`, which lives beside `revRead` and NOT in the
    optimiser — it is the only part that knows what a row is, and the row shape is documented as living in exactly two
    places). A card whose earliest row is already in the review state has a stability the log does not record, so it is
    dropped rather than guessed at. That is why the optimiser stays quiet until a reader has history made SINCE the log
    started, and why the refusal says so in those words.
  · **The whole ARCHIVE is fetched, paged** (`revFetchAll`) — PostgREST caps a response at 1,000 rows, and fitting to the
    first thousand of somebody's four thousand reviews without saying so is the quiet kind of wrong. A failure returns
    `null`, which the caller tells apart from a reader who genuinely has nothing; signed out, the local window is used.
  · **It runs ON THE PAGE, a step at a time** (`fsrsOptimiseStart` / `fsrsOptimiseStep` / `fsrsOptimiseFinish`, with
    `fsrsOptimise` as the one-call form the tests use), repainting between steps — a few seconds of arithmetic behind a
    frozen dialog reads as a crash. **There is deliberately no Web Worker**: one needs its own file or a `blob:` URL, and
    `script-src 'self'` is the one line of the CSP this project will not weaken for a progress bar.
  · **The result is STAGED in the parameters box, not saved** — Optimise asks, Save answers, which is the two-step every
    other field on that sheet already has and the difference between offering a schedule and changing one behind the
    reader's back.
  · **Guarded by `.claude/test-scheduler.js` section 10c** (the loss against the reference, the reference's own clamp
    bounds, both refusals, and a RECOVERY test — a history generated from a known parameter set must be predicted better
    than the defaults on a held-out tail, which is what stands in for a reference check on the output) and by
    **`.claude/test-review-decks.js` section 15** for the path (the button under FSRS and not under SM-2, a run that
    finishes without freezing its sheet, nothing saved until Save, and the too-little-history refusal in words).
- **THE NOTE→CARDS EXPANSION AND `availableCardIdSet` ARE CACHED** (`_uStudyCache` / `_availCache` /
  `uCacheBust` / `uDeckStudyIdsFor`, Aug 2026, same report as the sanitizer revision stamp under COMMUNITY
  DECKS). Both are DERIVED on every read, which is what keeps them honest — a card's `sub` and a type's
  template list change under them and nothing has to be kept in step — and both are O(the whole deck). One
  home render asked for the expansion **sixteen times**: `entryPiles` per row, `reviewQueue`, `entryInfo`,
  the progress bar on each row, and `availableCardIdSet`, itself called nine times. On the HSK 3.0 deck
  that was 174,336 `uNoteCardIds` calls and ~270ms per repaint **with a single row on the page**, before
  its nine subdecks were drawn at all; it is ~150ms with ten rows now.
  · **Keyed by (deck, subdeck), and thrown away WHOLE** rather than reasoned about: a stale entry would
    silently deal the wrong cards, so `uCacheBust` keeps nothing. Every write goes through it — the
    Studio's mutations all end in `uDeckSave`, and `uDeckMount` / `uDeckDelete` are the only other ways
    the stores move. `availableCardIdSet` depends on ONE thing more, the collection tree, hence the bust
    in **`applyAdminEdits`**.
  · **The declarations sit beside `applyAdminEdits`, far from the code that fills them**, and must stay
    there: that function busts them and runs at BOOT, so a `let` down beside the community block would
    still be in its temporal dead zone — a ReferenceError before the first paint rather than anything
    subtle.
  · **Both hand back the live array/Set, not a copy.** Every caller was audited first: they all `filter`,
    `forEach`, `some` or read `.length`, and nothing sorts or pushes in place. **Keep it that way** — a
    caller that sorted what `entryCardIds` returns would corrupt the cache for everything else on the page.
- **BURY SIBLINGS (Aug 2026, on request).** Answering one card of a note puts the note's OTHER cards off until tomorrow.
  It is what makes asking a word in both directions worth doing: 中 → middle and then middle → 中 an hour later tests the
  last hour rather than the word. Template-major ordering (see `docs/community-decks.md`) keeps siblings apart WITHIN a
  session; this keeps them apart across the day, which is the half that matters.
  · **THE REGISTER EXPIRES BY BEING READ.** `S.buried[id]` is the DAY it was buried (`dayKey`, so the reader's own day
    boundary), never a boolean — so nothing has to run at midnight, and a card buried yesterday simply reads as not buried
    today. Stale entries are swept on write, which is where `deckDay` does it too. It is in `defaultState` AND
    `PROGRESS_FIELDS`: burying is a fact about the reader's day, so a phone and a laptop agree about it.
  · **Burying is for today and is Folio's decision; SUSPENDING is for ever and is the reader's** — two registers, two
    meanings, and neither should grow into the other.
  · **Only a community note can have siblings** (a curated card is one card), so `burySiblings` returns immediately
    everywhere else, and `entryHasSiblings(id)` is what decides whether the switch is drawn at all — a control that can
    only ever do nothing is worse than none. Default **ON** (`deckBurySiblings` tests `!== false`), so nothing migrates.
  · **A card already answered today is not buried.** Burying it would record a fact that changes nothing and would show in
    the count as work removed that had already been done.
  · **THE LIVE QUEUE HAS TO BE FILTERED TOO.** Every queue built after the grade already excludes the buried sibling; the
    one in hand was built before it, so `doGrade` filters it — and **the reader is told once a session**, because the first
    time the day's count drops by more than one that needs explaining and the tenth time it is just how the deck works.
  · **Undo un-buries**, through the ordinary snapshot (`buried` is copied into it whole), so a mis-grade does not cost a
    day on two cards.
  · Guarded by `.claude/test-card-types.js`'s `buryChecks` — including that the register records the DAY (asserted by
    **ageing it** rather than by waiting), that the switch is absent on a curated deck, and that with it off nothing is
    buried.
