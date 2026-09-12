# The study page's furniture — the grade bar, the undo and the gloss popup

**READ BEFORE CHANGING THE GRADE BAR, THE UNDO OR THE GLOSS POPUP.** These bullets stood in
`CLAUDE.md`'s "How the app is wired" until they were moved here verbatim on 2026-09-11: the requests
and bug reports each rule came from, the measurements, and the faults that were invisible on the page.
The RULES stay in `CLAUDE.md`.

## The grade bar's fold, moved out of `CLAUDE.md` (2026-09-11)

- **…and on a phone its HEIGHT is the reader's** (`.gb-fold` / `gbWireResize` / `body.gb-compact`, Aug 2026, on
request): a **CHEVRON** on its top edge folds the bar to half its height, 111px → 58px, the four grades going
side by side as bare COLOURS with the `?`, Undo and Suspend as icons on the same row. It was a DRAG GRIP for a
fortnight and became a chevron on request (Aug 2026): the bar has exactly two positions, so a drag was a
gesture whose whole range mapped onto one bit, and a chevron says "there are two states and this is the other
one" outright. Being a real `<button>` it also needs no press classification — `GB_SLOP`, which told a drag
from a tap, is retired — and Enter/Space come free, with ↑/↓ reaching the two states directly.
Three things are load-bearing. The chevron lives **outside `.gradebar-inner`**, whose contents are replaced for
every card, so it is wired once in `ensureGradeBar` and a grade never has to survive a rebuild. Nothing is
**lost** in the short state: the label is CLIPPED (`clip-path`, 1px) rather than `display:none`, or the four
buttons would be four unnamed colours to a screen reader as well as to the eye, and the `?`/Undo/Suspend go
icon-only via **`font-size:0` on the button** — their text is a bare node beside an `<svg>`, which no
selector can reach, and the svg keeps its own px size. The chevron's own svg is rotated 180° in the short
state, so it always points the way pressing it will go. And `body.gb-compact.grading .stage`'s padding drops
to 96px with it (specificity, not source order — the ≤430px block's `body.grading .stage` sits further
down). Device-local in `localStorage["folio_gb_compact_v1"]`, like where the marker sits and how tall the
place sheet is. Guarded by `test-layout.js`.
**It FOLDS rather than cutting** (Aug 2026, on a report). The two states differ by more than a height —
the four grades go from two rows of two to one row of four, and the `?`, Undo and Suspend move up beside
them — and none of that is a property CSS can transition. So the SIZES transition in CSS and the
POSITIONS are FLIPped in JS (`gbSetCompact(on, persist, animate)` → `flipHeight` around `flipMove`), and
the two halves have to be written against each other: the tall state states `.grade`'s height explicitly
(`calc(56px * var(--fs))`, since `auto` is a value nothing can transition from) and **`GB_FOLD_MS` must
stay in step with the 280ms in styles.css**. The animation is not gated on being a phone — above the
breakpoint the chevron is `display:none` and it is unreachable, and `flipMove` skips anything that did
not move — but it IS gated on the reader's motion setting, inside both helpers. Note for the tests: a
height read sooner than `GB_FOLD_MS` after the press measures a state half way between the two.
**ONE CLOCK AND ONE CURVE, which is what it was missing** (Aug 2026, on a report that the fold ran
roughly). The two passes act on the SAME four buttons at the same moment — the position from `flipMove`,
the height and padding from the CSS transitions — so they have to agree about more than the duration:
the FLIP ran `cubic-bezier(.22,.61,.36,1)` while the transitions ran `--ease`
(`cubic-bezier(.2,.7,.2,1)`), and a box arriving slightly before or after the place it is sliding to
reads as a stutter rather than as two animations. `GB_FOLD_EASE` in app.js is now `--ease` written out,
and `flipHeight` takes an easing argument so it can be passed the same one. Two more things came out of
the same report and are worth keeping: **`font-size` is NOT transitioned** on `.grade-help` /
`.gb-undo` / `.suspendbtn` — easing a font down to 0 relayouts the text every frame on three buttons
`flipMove` is translating, and the two fighting over one box was most of the roughness, so the labels
now go at once and only the geometry eases — and **`#gradebar`'s own `padding-bottom` IS transitioned**,
or the whole movement ends on a 5px jump the instant everything else settles.
**The chevron is dimmed to `opacity:.5`** (Aug 2026, on request), full strength on hover and focus: it
is a quiet control sitting directly above four saturated colours.
**AND IT NO LONGER JAMS HALF WAY** (`_gbAnims` / `_gbFoldT` / `gbStopFold` / `gbFoldingFor` /
`body.gb-folding`, Aug 2026, on a report that pressing the chevron twice quickly left the bar stuck).
Two faults, and each is invisible on a single press. The FLIP's animations were fired and forgotten, so a
second press started a second set over the first and the four buttons settled wherever the two disagreed —
they are kept in `_gbAnims` now and cancelled at the head of the next fold, which is `flipMove` and
`flipHeight` having been taught to RETURN what they created (they returned nothing, so no caller could
have cancelled anything). And the CSS transitions have a duration of their own, so a press landing inside
it measured a height half way between the two states and folded to the wrong one — `body.gb-folding` is
set for `GB_FOLD_MS` and takes the bar's own contents out of hit-testing while it moves, with a
capture-phase `pointerdown` **exempting `.gb-fold` itself** so the chevron stays pressable: a reader who
presses it twice means to end up where the second press says, and swallowing that press would be the same
jam wearing a different coat.
**ITS TEST MUST DRIVE REAL INPUT AND MUST CLEAR THE LEVEL-UP CHEST**, and the second half is what made
the block honest. `el.click()` bypasses hit-testing entirely — which is the whole of what breaks here —
so a scripted version passes on the bug and the rounds have to go through `page.mouse.click`. But six
grades takes a fresh reader past level 2 (`XP_PER_LEVEL` is 5), and a level buys an artefact chest whose
overlay swallows every REAL pointer event: the chevron presses land on nothing and the grade's own centre
hit-tests to the overlay, so the round reports a jam that is the REWARD working exactly as designed. It
shows as **1 of 6** — the scripted reveal goes through regardless, so only the real-input half is blocked
— which reads like a rare intermittent fault rather than a fixture problem. The chests are dismissed at
the head of each round and **counted**, so a dismissal that stopped firing cannot put the false failure
back quietly. **And the sub-block after the loop has to REVEAL again**: the loop now ends on a grade that
succeeds, which moves to the next card and hides the bar, and `#gradebar` is `pointer-events:auto` only
while it carries `.show` — so the mid-fold probe read `none` on everything and reported a fold that never
started. It had been passing for the wrong reason, on a round 6 whose grade the chest was swallowing.
**A fixture that depends on an earlier step failing passes until that step is fixed.**


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
