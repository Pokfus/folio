# Chrome, navigation and the first visit

**Read this before touching `render()`'s transition path, `renderInPlace` / `_renderQuiet` /
`.page-quiet`, `makePageGhost` / `clipStageFor` / the `.page-next`/`.page-prev` keyframes,
`wirePageSwipe` / `SWIPE_ORDER`, the `touch-action` declarations on `body` / `.stage` / `#view` /
`.page`, the `THE GUIDED TOUR` block, or `pageHelp` / `closePageHelp`.**

`CLAUDE.md`'s "How the app is wired" carries the operational summary of each — that a repaint is not a
navigation, that `touch-action:pan-y pinch-zoom` is what makes every horizontal swipe possible at all,
the swipe order being the tab bar minus the Atlas, the ghost being a stripped clone, and the
walkthrough's five load-bearing decisions. This file carries the rest.

Six bullets, in the order they appeared in CLAUDE.md:

1. **A repaint is not a navigation** — `renderInPlace`, what it turns off and what it deliberately does
   not touch.
2. **`touch-action:pan-y pinch-zoom`** — why it must be on the ancestors and not just `.page`, the
   fortnight the gesture worked or did not depending on where the finger began, and why the synthetic
   tests could not see any of it.
3. **Swipe between pages** — the order's history including Collections coming back out, the cross-slide's
   geometry, `clipStageFor`'s three constraints, and the guards.
4. **Page transitions** — the ghost, the stripped `id`s and control `name`s and the radio-group fault
   that forced them, and the three exclusions.
5. **The guided walkthrough** — the inline offer, the ringed rather than spotlit target, the computed
   base rect, the phone dock, the ring clamp, and the illustrated study steps.
6. **A page's own first-visit coach marks** — the two Library keys and why the card lives on
   `document.body`.

- **A REPAINT IS NOT A NAVIGATION** (`renderInPlace` / `_renderQuiet` / `.page-quiet`, Aug 2026, on a bug
  report: "each time a new active deck is downloaded, the page refreshes"). `render()` is written for a
  navigation — it **scrolls to the top and plays the page's entrance animation** — and several things
  rebuild the page the reader is standing on rather than taking them anywhere; a downloaded deck's row
  turning from Download into the deck itself is the one that was reported, and from the reader's side those
  two flourishes ARE the refresh. `renderInPlace()` is the same render with both off: it skips the page
  ghost (there is no outgoing page to lift out), skips the scroll, and marks the page `.page-quiet`, which
  is one stylesheet line killing the page's own entrance, its blocks' stagger and the deck rows' separate
  entrance one level down. **It changes nothing else** — the fold state (`adOpen`, module level) and the
  drag order (`S.deckOrder`, persisted) already survive a repaint, so the scroll position and the
  animations were the whole of what a reader could see. Three things about it. It is **the CALLER'S call
  and never a default**: the Studio's own import genuinely is a navigation-sized change to the page it
  happens on, so `uImportDone(r, quiet)` takes the flag rather than guessing. The class goes on the PAGE
  element rather than on the body, like `.page-next`, so it dies with the page and can never be left behind
  on the next ordinary navigation. And `_renderQuiet` is cleared in a `finally`, or a page function that
  throws would leave every later navigation silent.
- **`touch-action:pan-y pinch-zoom` on `body`, `.stage`, `#view` AND `.page` is what makes EVERY horizontal
  swipe on the site possible**
  (styles.css, Aug 2026, on a report that the book's chapter swipe did nothing on a phone). Without it none
  of them worked on a real device — not the chapter swipe and not the page swipe, which had been broken
  since the day it shipped. Under the default `auto` the browser hands the touch to its scroll machinery
  the moment it passes the slop and fires **`pointercancel`** at the page: `pointerup` never arrives, and
  both handlers measure the gesture at `pointerup`. `pan-y` says this box scrolls vertically and nothing
  else, so a horizontal drag is nobody's scroll and the pointer stream survives; a vertical one still
  scrolls and still cancels, which is correct. `pinch-zoom` keeps the reader able to zoom, which bare
  `pan-y` takes away; the cost is double-tap-to-zoom, which the book already suppressed for its own double
  tap. **Nested horizontal scrollers are unaffected** (measured, not assumed): the intersection deciding a
  pan stops at the element that will scroll, so the chapter bar, the Atlas sheet's pager and the heatmap
  still pan sideways, and every draggable declaring `touch-action:none` only narrows this further.
  **IT HAS TO BE ON THE PAGE'S ANCESTORS TOO, and it was on `.page` alone for a fortnight** (Aug 2026, on a
  report that swiping left from the Library did nothing when the finger started in the empty space below the
  content). A short page leaves the bottom of the screen covered by `.stage`'s 90px of padding and then by
  `body`, and neither of those is `.page`: a finger landing there met the default `auto` and the browser took
  the gesture for a scroll. **The gesture worked or did not depending on WHERE it began**, which reads as the
  swipe being unreliable rather than as a rule with a hole in it — so it is declared on `body` as well, the
  document scrolling vertically and nothing else at every width and on every route.
  **It was invisible to the tests, and that is the part to keep in mind when writing more of them**: a
  synthesised `PointerEvent` bypasses the browser's gesture arbitration entirely and completes every time,
  so every swipe assertion passed throughout. `test-layout.js` and `test-library.js` now drive one swipe
  each through **real CDP touch input** (`Input.dispatchTouchEvent`) beside the synthetic ones, which stay
  — they are what pins the classification (distance, angle, tap-vs-swipe) precisely. Two gotchas from
  writing them: a touch landing while an earlier fling is still running is spent stopping it, so a
  scroller pan measured straight after a vertical drag reads as a few pixels; and the guards must be
  asserted in both directions, since a false positive TAKES A PAGE AWAY.
- **SWIPE BETWEEN PAGES ON A PHONE** (`wirePageSwipe` / `SWIPE_ORDER` / `.page-next`/`.page-prev`, Aug 2026,
  on request). A horizontal swipe moves between `home → library → account → settings`, and the outgoing page
  leaves the way the finger came from, so the gesture and the transition tell the same story.
  · **THE ORDER IS THE TAB BAR'S, MINUS THE ATLAS — that is the whole rule**, and it is what decides whether
    a new destination belongs in `SWIPE_ORDER` (`test-layout.js` asserts the two against each other rather
    than against a list, so a tab added or removed later fails on the rule and not on a stale copy of it).
    The ATLAS is out because a drag on the globe rotates it, and a page that both rotates under the finger
    and navigates away from it can only do one of them badly; it is reached and left through the tab bar
    alone. **COLLECTIONS (`decks`) was in the order for a fortnight and came OUT on request (Aug 2026)** —
    the reasoning for including it (a real destination even without a tab, and leaving it out makes the
    sequence a subset of the bar) is backwards once the bar is what a reader has to go on: the swipe was
    landing them on a page the bar cannot reach, with nothing lit in it to say where they were. It is
    reached from the home page's own Collections button, which is the route it advertises, and
    that is now the only one.
  · **It is a full CROSS-SLIDE** (Aug 2026, on a report that it was "a hard cut"). It was a 26px nudge under
    a cross-fade, which at that distance is a fade with a lean in it — so after a finger had dragged a page
    sideways, what arrived barely moved. Both halves now travel a whole page width, exactly adjacent (plus a
    24px gutter so their edges never abut), at ONE duration and ONE easing, which is what makes it read as a
    single sheet moving rather than two things happening at once. **No opacity at all**: a page off the side
    of the screen needs no fading. It is only possible because both pages exist for those 340ms — the ghost
    being a real copy of the outgoing one — which is why the height guard in `makePageGhost` is skipped for
    a swipe (that guard is about fading in PLACE) while the element-count guard, which is about the cost of
    the clone, stays. The `sectIn` stagger opts out on a sliding page, or its blocks would pop in behind it.
  · **`clipStageFor` is what stops a page a whole screen wide from overflowing the document** while it
    travels — `body.stage-sliding .stage{overflow-x:clip}`, on a timer. Three things about it: it is on the
    STAGE rather than `#view`, which sits inside the stage's own padding and would cut both pages off short
    of the screen edge; it is **`overflow-x` alone, never the shorthand and never `hidden`**, since
    `overflow-x:clip` beside an untouched `overflow-y:visible` is the one pairing that clips without making
    a scroll container (with `hidden` the book's sticky chapter bar would stick to the stage instead of the
    viewport); and it is a body class on a timer rather than a `:has()` rule keyed off the ghost, because
    the incoming page slides whether or not a ghost was made.
  · **The guards are the whole of the difficulty, because a false positive TAKES A PAGE AWAY.** Touch only (a
    trackpad's horizontal scroll is a `wheel` and a mouse drag is a selection); never out of a horizontal
    scroller, walked up the ancestor chain by measuring `scrollWidth`/`overflow-x` rather than by listing
    classes, so a scroller added later is covered with nobody remembering this; never while an overlay is up,
    never on a form control, never while `body.grading`. Generous on distance (`SWIPE_MIN` 64px), strict on
    angle (`SWIPE_RATIO` 1.6) — a diagonal is a scroll that wandered.
  · The direction class is set on the PAGE ELEMENT, not the body, so it dies with that page and can never be
    left behind on a later tab-bar navigation.
- **PAGE TRANSITIONS (Aug 2026, on request).** `.page` has always faded IN; the missing half was the exit, so a
  navigation cut the old page away on the same frame the new one appeared. **`render()` is synchronous and has
  to stay so** — several callers query the DOM the moment it returns, which rules out `startViewTransition` and
  anything else that defers the swap — so the outgoing page is not held back but LIFTED OUT: `makePageGhost()`
  lays a copy over the stage (`.page-ghost`, `position:absolute` inside a now-`relative` `#view`) and leaves it
  to fade while the new page renders underneath, removing it on its own timer.
  · **It is a CLONE, not the element itself**, so anything still holding a reference to the outgoing page — a
    stale handler, a pending callback — keeps the original, detached, behaving exactly as before.
  · **The clone is stripped of every `id` and every control `name`.** For a quarter of a second the dead page is
    still IN the document: an `id` would let a `document.getElementById()` in the new page's wiring pick up the
    dead copy, and a `name` is worse — a radio group is scoped to the DOCUMENT when its inputs are not in a
    form, so the ghost's radios and the new page's were one group, and inserting the new checked radio silently
    unchecked the ghost's, making a click that had just landed read back as never having happened (found by
    `test-deck-glossary`, whose Studio radios are exactly that shape).
  · **Three exclusions**: reduced motion; the ATLAS in both directions (leaving it, the globe's teardown has run
    under the clone; arriving at it, its stage is full-bleed and a page fading over the globe reads as a
    rendering fault); and the editor, where a repaint per keystroke is routine. The home page's 170px ornamental
    globe is deliberately NOT excluded — skipping the commonest navigation on the site to protect it would be
    paying for the transition and not getting it.
  · **A SWIPED navigation is a different transition, not a longer one** — the full cross-slide described in
    the swipe bullet above, which is why `makePageGhost` takes the direction and relaxes its height guard
    for one. A tab-bar navigation keeps the vertical fade.
  · The stylesheet's MOTION block adds the rest: a staggered entrance for a page's top-level blocks (`sectIn`,
    capped at eight and opting out exactly where `.page` does, including inside the ghost), an entrance for the
    overlays (`.inline-prompt`/`.deck-menu`, which had none), and press feedback on the quieter buttons.
    Everything there is an animation or a transition, so the global reduced-motion killswitch covers it — the
    one thing it can't reach is a `both`-filled animation's DELAY, which is zeroed explicitly, or a reduced-motion
    reader would watch a page arrive in blank steps.

- **THE GUIDED WALKTHROUGH — a first visitor's few minutes** (the `THE GUIDED TOUR` block in app.js:
  `TOUR_KEY` / `TOUR_STEPS` / `tourStart` / `tourGo` / `tourPaint` / `tourPlace` / `tourAfterRender` /
  `tourOfferHTML`; `.folio-tour` in styles.css. Aug 2026, on request). Ten steps that dim the page, put one
  card in the middle of it, and point at the thing being described — the concept of spaced repetition, how
  to add a deck to the daily study, how to study a card, and the marker. **It deliberately stops short of
  the Atlas and the Library**, which explain themselves the first time they are opened (see `pageHelp`
  below). Five decisions are load-bearing.
  · **THE OFFER IS INLINE, NOT MODAL.** It would be one line to raise the tour over the home page on a
    first visit, and it is the wrong line: a site that seizes the screen before the reader has seen it is a
    site they leave. `tourOfferHTML()` is a card at the head of `.banners`, beside the first-run hero and
    the (now removed) `.howit` strip that are already first-run-only, shown to a reader who has **never graded a card**
    and never answered it; either answer writes the key for good, and **Settings → Study → Walkthrough** is
    the way back. It is also what keeps every Playwright test that boots a fresh reader from meeting an
    overlay it never asked about — the offer blocks nothing.
  · **THE SCREEN STAYS DARK: the target is RINGED, not spotlit.** A cut-out spotlight means holding a hole
    in the scrim over an element that moves with every reflow, and it reads as a page half-lit rather than
    as an explanation. The scrim is uniform (a theme-independent `#000` mix — the Atlas's coach marks
    lighten their globe, and this one has to darken eight themes' worth of prose), and each step draws an
    **arrow** from the card to a **dashed ring** around its target. A step whose target is missing draws
    neither and still reads: a tour must never depend on the state of the page it describes.
  · **IT NAVIGATES, so it is NOT in `render()`'s close list.** The add-a-deck step routes to the
    collections and the next one routes back. That is the whole reason the overlay lives on `document.body`
    and is left alone by the close sweep every other body overlay is in — a `render()` that dismissed it
    would dismiss it at exactly the moment it was doing its job. What it does need is re-measuring, which
    is `tourAfterRender()`, called at the end of `render()`.
  · **THE CARD IS NUDGED OFF ITS OWN TARGET, and the base rect is COMPUTED, never measured.** A centred
    popup lands on top of whatever it is describing about half the time (the daily-study banner is most of
    the home page), so four placements are tried — below the target, above it, either side — and the
    smallest shift that keeps the whole card on screen wins. **The gap has to leave room for an ARROW**
    rather than merely for daylight: the line starts 10px outside the card and stops 8px outside the ring,
    so a 26px gap draws an 8px stub, and a roomy gap is tried before a tight one. And the unshifted rect
    comes from `offsetWidth`/`offsetHeight` plus the viewport centre, **not from `getBoundingClientRect()`**
    — the card's transform is transitioned, so a rect read during a step change is the card somewhere
    between two positions, subtracting the shift we asked for does not recover the centred box, and every
    later step shifts an already-shifted card until it walks off the side of the screen taking its own Next
    button with it. That shipped for an hour and is invisible except as "the tour stopped working".
  · **…AND ON A PHONE IT IS DOCKED TO THE FOOT OF THE SCREEN INSTEAD** (`dock` in `tourPlace`, `tourReveal`,
    `.folio-tour{align-items:flex-end}` in the ≤640px block; Aug 2026, on a bug report: "on mobile the
    first-time tutorial doesn't display properly"). Centred, the card takes **half to two thirds of a 640px
    screen** — measured, 47–66% across the ten steps — and the nudge above has nowhere to move it to, so on
    most steps the thing being described ended up UNDERNEATH it and the step pointed at something the
    reader could not see. Docked, the whole upper half is free and the target is scrolled into it.
    Three things about it. **The layout is a STYLESHEET decision read back in JS**, not a breakpoint written
    twice: `tourPlace` asks the overlay for its computed `align-items` and takes its base rect from that,
    which is also why the nudge search is simply skipped there. **`tourReveal` replaces the bare
    `scrollIntoView({block:"center"})`**, because the centre of the viewport is exactly where the docked
    card is — a target is scrolled into the band ABOVE it instead, and a target too tall for that band is
    left with its top in view. And **nothing above the breakpoint changes**: there the card is centred, the
    clamp below never bites and the nudge has room to work.
  · **A RING IS CLAMPED TO THE SCREEN, AND DROPPED WHERE IT WOULD RING THE SCREEN ITSELF** (same batch, same
    report). On a desktop every target fits inside the viewport and the dashed rectangle reads as a
    highlight. On a 360px phone the daily-study block IS the page: all four of the ring's corners fell
    outside the screen and what was left was **two dashed vertical rules down the edges**, which reads as a
    rendering fault rather than as "look at this". So the box is clamped into the viewport (a target that
    merely overflows is still marked, honestly, by the part the reader can see), and if the CLAMPED box
    still covers more than 60% of the screen nothing is drawn at all — the step's own words are what it has
    to say. **The ARROW goes with it**, and additionally whenever the card ends up inside the ring: an arrow
    from a box to the box it is already in is the orange stub this used to draw across the middle of a step.
  · **THE STUDY STEPS ARE ILLUSTRATED, NOT PERFORMED.** Dealing a real card would hijack the reader's
    schedule, and the grade bar is pinned to the bottom of the viewport under the scrim — so the card, its
    blank and the four grades are drawn inside the popup, **with the four intervals read from the real
    scheduler** (`schedPreview(null, …)` → `fmtInterval`). A tutorial that teaches a schedule the site does
    not use is worse than one that teaches none.
  Escape and Skip close it (and count as answered); the **backdrop deliberately does not** — a stray tap on
  a dimmed page is the likeliest gesture there is, and losing the tour to one would be losing it silently.
  `.folio-tour` is in `swipeEnabled()`'s overlay list. Guarded by `.claude/test-tour.js`.
- **A PAGE'S OWN FIRST-VISIT COACH MARKS** (`pageHelp` / `closePageHelp` / `LIB_TOUR_KEY` / `openLibHelp` /
  `BOOK_TOUR_KEY` / `openBookHelp`;
  `.page-help` in styles.css. Aug 2026, on request). The Atlas has had these since it shipped
  (`#atlasHelp`, `folio_atlas_tour_v1`, reopened by `#gzHelp`); the walkthrough stops short of the Atlas
  and the Library on purpose, so **the Library has its own — and since Aug 2026, on request, TWO**:
  `folio_library_tour_v1` on the shelf, reopened by the `#libHelpBtn` "?" beside the sort, and
  `folio_book_tour_v1` the first time a book is opened, reopened by `#bkHelp` at the end of the chapter
  bar. The reasoning for the split, the two keys and the session flag beside the second is in the Library
  bullet under "How the app is wired". Same card, same three ways out.
  **IT LIVES ON `document.body`, AND THAT IS NOT A PREFERENCE.** The Atlas's card can be
  `position:absolute` inside its own full-bleed stage; an ordinary page has no such stage, so this one must
  be fixed to the VIEWPORT — and `.page` carries `animation:pageIn … both`, which makes it the containing
  block for every fixed descendant. Written into the page, `inset:0` therefore resolves to the page's own
  box: on the Library that is the whole shelf, several screens tall, so the card centres itself a screen
  and a half below the fold and the reader sees a dimmed page with **nothing on it**. It shipped that way
  for an hour. On the body it is `render()`'s to close, like every other overlay there — hence
  `closePageHelp()` in the close list. The **Atlas card gained a marker tip** in the same pass, on request.
