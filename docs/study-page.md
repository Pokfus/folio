# The study page's furniture — the grade bar, the undo and the gloss popup

**READ BEFORE CHANGING THE GRADE BAR, THE UNDO OR THE GLOSS POPUP.** These bullets stood in
`CLAUDE.md`'s "How the app is wired" until they were moved here verbatim on 2026-09-11: the requests
and bug reports each rule came from, the measurements, and the faults that were invisible on the page.
The RULES stay in `CLAUDE.md`.

## The grade bar's fold — REMOVED (Oct 2026)

The phone's grade bar once had a chevron (`.gb-fold`, `gbWireResize`, `body.gb-compact`, `folio_gb_compact_v1`)
that folded it to a short, colours-only state, animated by a FLIP (`gbSetCompact`, `flipHeight`/`flipMove`, `_gbAnims`,
`body.gb-folding`). **It was removed on request, mode and all** — nothing reads or writes any of those names now, and a
stale `folio_gb_compact_v1` in a reader's storage is simply ignored. The bar has one height.
Under the four grades the phone's row is **two equal halves**: the `?` is as wide as the two grades above it on the
left, Suspend as wide as the two on the right (`.grade-wrap` is `1fr 1fr`, areas `"grades grades" "help suspend"`;
below 430px its column gap is 6px, the grades' own, so each half is exactly two grades and the gap between them).
When there is something to undo (Oct 2026, on request), `.grade-wrap:has(.gb-undo)` becomes three equal thirds,
`"help undo suspend"`, Undo between the two. Guarded by `test-layout.js`.
(`flipMove` / `flipHeight` in app.js are left in place, now without a caller.)

## Undoing a grade, moved out of `CLAUDE.md`

- **Undoing a grade (Aug 2026, on request)** — `undoStack` / `undoSnapshot` / `undoGrade` inside `PAGES.study`,
reached by the `#undoGrade` button in the study bar (rendered only when there is something to undo), by
**Ctrl/Cmd+Z**, and by "Undo the last card" on the completion screen (where the queue is empty and there is no
card left to press the button on). A misclick on Again or Easy was otherwise unfixable from inside a session.
**A grade is LOSSY** — the old interval, ease and due date cannot be derived back out of the new ones — and
`grade()` writes in five places at once, so the undo is a snapshot of exactly those (`S.cards[id]`, today's
`reviewLog` row, `S.reviewDay`, `S.intro`, `S.streak`) taken in `doGrade` **before anything is written and
before `queue.shift()`**, plus the queue itself, which is what restores a requeued learning step as faithfully
as a graduated card. **The card comes back AT ITS QUESTION, and at the PHRASING the reader was actually
shown** (Aug 2026, on request; it used to come back revealed, on the grade row it was mis-answered on).
The reasoning is what a reader means by undoing a grade: they want to ANSWER the card again, and a card
whose answer is already on screen cannot be answered — it can only be re-scored against prose they are
looking at. So `studyRevealId` is cleared, and `undoSnapshot` records **`qi: qIdx`** so the phrasing goes
back with it: a card carries up to three ways of asking the same thing and `renderCard` picks one at
random when `qIdx` is null, so an undo that did not record it would bring the card back asking something
else — which reads as the undo having fetched a different card rather than as a phrasing being re-rolled.
Two things it deliberately does NOT take back, both additive and harmless: a badge or level-up already announced
(`checkAchievements` only ever adds) and a Card of the day already dropped into the review list.
**IT STEPS BACK ONE CARD, NOT TWO** (`UNDO_GUARD_MS` (90) / `undoAt`, Aug 2026, on a report). There are
three ways in — the button, the shortcut and the completion screen's link — and a press that reached two of
them, or a key held a moment too long, popped two snapshots: the reader lost the card they meant to fix AND
the one before it, which is the one outcome an undo must never produce. A pop inside the guard window is
refused. It is deliberately a TIME guard rather than a flag cleared on the next render: the render is what
the second press races.
**The Ctrl+Z guard is not `!typing`**: the cloze box takes focus as each card opens, so refusing whenever it is
focused would mean the shortcut never fired at the one moment it is wanted — the card AFTER the misclick, which
has just opened with an empty box. It yields to the browser's own typing-undo only while the box actually holds
a typed guess. (That autofocus is now **keyboard-machines only** — `setupCloze` skips it under `touchDevice()`,
i.e. `(hover:none)`, added Aug 2026 on request: on a phone it summoned the on-screen keyboard over half the card
on every card, before the reader had decided to type. The guard is unaffected — a touch reader who has not
focused the box is exactly the case it already lets through.)
**THE FIELD IS AS WIDE AS THE TEXT IN IT, MEASURED** (`.blank-sizer`, Aug 2026, on a bug report: "the blank
underscores always extend far beyond the typed text"). It was `max(4, length + 1) + "ch"`, and **`ch` is the
advance of the digit "0"** — far wider than a lowercase letter in the card's serif — so a typed "Cycladic
civilization" reserved room for twenty-two zeroes and drew its underline a third of a line past the last
word. **A count of characters cannot size a proportional font at all.** Each field now carries a hidden
sizer span beside it, `font:inherit` from the same parent, whose `offsetWidth` sets the field's px width:
that picks up the face, the letter-spacing AND the reader's own text-size setting without naming any of
them. The two candidates rejected are worth knowing — `getComputedStyle(el).font` is not reliable
cross-browser, and a canvas `measureText` cannot see letter-spacing. It must be `position:absolute` and
`visibility:hidden` and **never `display:none`**, a box with no layout having no width to read; the empty
field falls back to the CSS `min-width`, which matches the static `.blank`, so an untouched question looks
exactly as it did; and **`gradeCloze` removes the sizers** with the fields they were measuring.
**The shortcuts are written down in the grade bar's `?` bubble** (`.ghb-keys`, Aug 2026) — Space reveals,
1–4 grade, Enter is Good, Ctrl+Z takes the last one back. They all existed and nothing said so, and that
bubble is where a reader already goes to ask what the buttons do. (The Atlas's own coach marks already
covered its click drill-down; they gained the keyboard line — `[`/`]`, Enter, Esc — which they hadn't.)
**…AND NEITHER THE BUBBLE'S KEYS NOR THE BUTTONS' DIGITS ARE SHOWN ON A PHONE** (Aug 2026, on request).
`.grade .gk` and `.grade-help-bubble .ghb-keys` are both `display:none` in the ≤640px block: they describe
a keyboard a phone has not got, so on a phone they are furniture explaining a control that cannot be
reached — the digits costing each of the four buttons a line of height and the shortcut line a third of
the bubble. **Hidden, not removed from the markup**, because the same markup is what a desktop reader
gets, and there the keys are real and worth saying. The `.gk` rule used to live in the ≤430px block alone
and now covers the whole phone range, so the two cannot disagree about where a phone starts.


## The phone's gloss window, moved out of `CLAUDE.md`

- **The phone's gloss window is CENTRED, the WHOLE of it drags, and the page behind it goes soft**
(`.gloss-win.gloss-sheet` / `makeGlossSheetDraggable` / `glossScrim` / `wireGlossDoubleTap`, Aug 2026, on
request). It was a bottom sheet glued to the foot of the screen for months; a definition met mid-sentence
belongs in the middle of the screen, where the reader's eye already is, and the sheet was also the
furthest point on the page from the word tapped.
What a centred window loses is the sheet's implicit "there is a page behind me", so it can be HELD and
dragged UP AND DOWN to uncover the sentence the term came from. **Vertical only**, deliberately: the
window is as wide as the screen allows, so there is nothing to uncover sideways and a horizontal drag
would fight the page-swipe gesture. The offset is a custom property, **`--gs-dy`, riding INSIDE the
`translate(-50%,-50%)`** rather than replacing it with a `top` — mixing the two would need the height
measured on every move. It is **not remembered**: a new term always opens in the middle (the request says
so), so the offset lives on the element and dies with it, which also means the restore-after-reload path
needed no change.
· **EVERY PART of the window is the handle**, not a bar. It was the title bar, then briefly a grab bar at
each end, and both marks went on request — a window in the middle of the screen can want moving either
way and which end falls under the thumb depends on where it currently is. The one exception is the
DESCRIPTION when there is more of it than fits: that box scrolls, and the choice is made at
**pointerdown** (`body.scrollHeight > body.clientHeight` → this is a scroll) rather than arbitrated
mid-gesture, because a gesture that changes its mind half way through is what reads as broken. Most
terms are three sentences and scroll nothing, so for most of them the whole window really does drag.
`touch-action:none` on the window with **`pan-y` back on `.gloss-body`** is the CSS half of the same
split; controls and `.ttip` are exempt through `GLOSS_NODRAG`.
· **A DOUBLE TAP ANYWHERE ON THE SCREEN closes it** (`glossDoubleTap`; it was anywhere on the WINDOW
until Aug 2026, and was widened on request with the scrim's blocking below) — the × is a 26px target
in one corner of a window that fills most of the screen. Written on pointer events, not `dblclick`,
which a phone may swallow for double-tap-to-zoom. Two guards: the taps must land close TOGETHER as
well as close in time (`GLOSS_TAP_SLOP`), so tapping one word and then another further down is not a
close; and an interactive target is exempt (`GLOSS_TAP_SKIP`), or a nested glossary link and the
sources fold would become unusable. The end of a drag is told from a tap by a **one-shot flag**
(`el._glossDragged`) that the drag sets and the tap handler clears — NOT by reading the `dragging`
class, which is gone by the time the tap handler runs and which, if held for a frame instead,
swallows the first real tap after every drag. **The window and the scrim keep SEPARATE pairs of taps**
rather than sharing one counter, which is the same rule the slop expresses: two taps mean "close" when
they land in one place, and a tap on the page followed by a tap on the description is a reader reading.
The scrim's copy closes the TOP of `glossWins`.
· **The scrim is ONE element with `backdrop-filter`** (`#glossScrim`), never a `filter` over a list of the
page's own containers: that list would need keeping in step with every fixed thing on the site, and a
`filter` on an ancestor becomes the containing block for its `position:fixed` descendants — which would
move the very bars it was blurring. It is raised **explicitly** in `openGlossWin` rather than through
`syncGlossScrim`, because at that point the new window has not yet been pushed onto `glossWins` (that
is the last thing the function does) and a count-based call would find zero.
**IT IS A MODAL SINCE AUG 2026, ON REQUEST** — it began as focus alone (`pointer-events:none`, the page
behind still live) and the request was that nothing behind a popup be clickable until it closes. One
property does the whole job: at **z-index 9590 it is above every bar and control on the site** (the tab
bar is 55, the grade bar 60), so nothing has to be disabled by name and no list has to be maintained.
`touch-action:none` goes with it — a scrim that swallows a tap must not leave the browser free to read
the same tap as a scroll or a double-tap zoom. **A single tap on it still does nothing**: tapping
outside has never dismissed a popup and that has not changed; what makes the blocking bearable is the
double tap above. **The blocking rides on `.on`, not on the base rule**, because the scrim is faded for
220ms before it is removed and the popup is already gone for those 220ms — a scrim still eating taps
there would leave the page dead to the touch just after the reader closed the thing that made it so.
It keeps the sheet's **permanent compositing layer** (`will-change:transform` + `backface-visibility`),
and that is not decoration: it was the fix for a reported flicker, where the sheet blinked out for a
fraction of a second the instant its slide finished. A per-frame probe read `opacity:1`,
`visibility:visible` and one `.gloss-win` throughout, so the gap is the browser DISCARDING the layer it
made for the transform animation and repainting a frame or two later. Declaring the promotion up front
means the layer is never created and never thrown away. **Keep it on this one element** — a permanent
layer is cheap once and expensive by the dozen, and the desktop popups fade rather than move.
