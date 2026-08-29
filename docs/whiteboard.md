# The whiteboard marker

**Read this before touching `ensureWBTools`, `setupWhiteboard`, `wbMakeDraggable`, the marker's
fling/snap-home behaviour, the stylus mode, or the ink layer's pass-through to controls underneath.**

`CLAUDE.md`'s "How the app is wired" carries the operational summary — what the marker is, the one
predicate that turns it off, and the two states (`WB.enabled` / `WB.panelOpen`). This file carries the
rest: the gesture classification, the fling arithmetic and why it is measured across a window of
samples, the snap-home probe and the transition that has to be turned off to take it, the custom-colour
picker, the pass-through hit-test, the stylus split and the hand-rolled scroll under it, and the
per-page default corners.

It also carries the **page-swipe and Atlas-sheet test coverage** that had drifted into the end of the
marker bullet — those are `test-layout.js` assertions rather than marker behaviour, and they are kept
here verbatim rather than being dropped in the move.

- **THE WHITEBOARD MARKER CAN BE TURNED OFF ALTOGETHER** (`markerOn` beside `ensureWBTools`;
  **Settings → Study → Whiteboard marker**, `S.settings.marker`, default ON. Aug 2026, on request). It floats
  over every study card, every page of a book and the Atlas globe, and a reader who never draws has been
  carrying it round the corner of the screen on all three. **ONE predicate, asked in the two places that
  bring the marker into existence** — `showWBTools`, which puts the panel on screen, and `setupWhiteboard`,
  which lays the ink canvas over the page — so a disabled marker costs a page neither the panel, the canvas
  nor the pointer listeners that go with it. It needs no third gate: **the panel is the only way to put the
  pen DOWN**, so `WB.enabled` can never become true and every page-specific hook (the globe's cursor, the
  book's ink store) simply never fires. Two things are load-bearing. The guard in `setupWhiteboard` sits
  AFTER that function's own teardown, or a fling or a resize listener left by the previous page would outlive
  it. And the switch calls `hideWBTools()` when thrown OFF: Settings is not one of the three pages that mount
  the marker, so nothing would repaint it away by itself, and a panel still floating over the page a switch
  has just disabled reads as a switch that did nothing. Anything already drawn is kept — this decides whether
  the marker APPEARS, not whether the ink exists.
- **The whiteboard marker is DRAGGABLE anywhere on screen** (`wbMakeDraggable` / `wbApplyPos`, beside
  `ensureWBTools` — Aug 2026, on request). It is a fixed control floating over a card the reader is trying to
  read, and its default corner is exactly where some cards put the thing you want to look at.
  · **`WB.enabled` (the pen is down) and `WB.panelOpen` (the tools are showing) are TWO states**, and were
    one until Aug 2026, when putting the tools away also put the pen down — you could not draw with the
    panel out of the way, which on a phone is most of the card. The marker button now only opens and closes
    the panel; what puts the pen down is **choosing a tool inside it**, and what puts it up is unselecting
    that tool. The tools are mutually exclusive and clicking the
    selected one deselects it, so **nothing selected IS the pen-up state** —
    which is what makes that gesture available at all. `applyWBState` maps `panelOpen` → `.active` and
    `enabled` → the button's `.on` (visible with the panel shut) plus the canvas; **`wbSetEnabled` is the
    one place `enabled` changes**, because the Atlas owns its own cursor / hover / spin state and has to be
    told through `WB.onToggle` the moment the pen goes down or up.
    **OPENING THE TOOLS SELECTS NOTHING** (Aug 2026, on request). It used to pick the pen so that one tap
    got you drawing, which is a shortcut for the reader who wanted the pen and a trap for everyone else:
    `enabled` lays a canvas over the whole visible page, so a reader who opened the panel to reach Undo,
    Clear, a colour or the stylus row found the card underneath already taken. The panel is a MENU and
    choosing from it is what starts drawing; the cost is one extra tap on the way to the pen, and it is
    exactly the tap that says which tool was meant. `test-layout.js` asserts **both halves in two places**
    — nothing selected on open, and a tool choice starting the drawing — because they fail in opposite
    directions and "nothing is selected" would otherwise also pass on a marker that had stopped working.
    (A HOLD on the marker still restores the tool last drawn with; that is a separate gesture and is
    unchanged.)
  · **IT HAS WEIGHT: it can be THROWN** (`WB_FLING_*` / `wbStopFling` / `wbClampPos`, Aug 2026, on request).
    It used to stop dead on the lift, which on a phone reads as the thing being stuck to the finger rather
    than being moved by it; it now keeps the velocity it was released at and coasts to a stop under
    friction. The shape is deliberately `panFling`'s — the hand-rolled scroll the ink layer does for a
    finger in stylus mode — since two things that coast on one page must coast the same way. Three things
    are decisions rather than arithmetic. **THE VELOCITY IS MEASURED ACROSS A WINDOW OF SAMPLES, NEVER FROM
    ONE MOVE** (`WB_FLING_WINDOW` / `WB_FLING_MIN_DT` / `WB_FLING_IDLE`), and this is the whole of the
    difficulty — a per-event `delta / dt` is wrong in BOTH directions. A pointer stream ends with a sample
    or two of near-zero movement as the finger settles to lift, so read raw a hard throw dies on release
    exactly like the behaviour it replaces; and **a burst of moves arriving within a millisecond of each
    other divides a large delta by a clamped `dt` of 1 and reports a velocity nothing could produce**,
    which sent the marker into the far corner of the screen. That second one shipped and `test-layout.js`
    caught it ("dragging it follows the pointer" — the marker was at 6,7 having been dragged to 29,30), and
    it is worth knowing that a SYNTHETIC drag is the case that exposes it: a test's moves land closer
    together than a hand can move. So the last `WB_FLING_WINDOW` ms of samples are kept, the velocity is
    the distance across that window over its own span, and a window shorter than `WB_FLING_MIN_DT` is not
    flung at all — a movement the browser cannot time is not a throw. A finger that **paused before
    lifting** (`WB_FLING_IDLE`) is setting the marker down, not throwing it.
    **It DIES AT THE WALL** — `wbClampPos` now clamps the STORED position (it used to clamp only the inline
    style, which is harmless while the value is only re-read on the next apply and wrong while a fling is
    integrating against it) and returns which edges were hit, so that axis's velocity is zeroed and the
    marker stops against the edge instead of grinding along it. No bounce: this is a control being put down.
    And it is gated on `prefersReducedMotion()` like every other movement, stops the moment a new press
    lands, and **saves only once it has come to rest** — where it landed, not where it left.
    `.wb-flinging` joins `.wb-dragging` in killing the `bottom` transition, which would otherwise fight the
    fling frame for frame.
  · **…AND IT SNAPS HOME** (`WB_SNAP_HOME` / `WB_HOME_MS` / `wbDefaultPos` / `wbNearHome` / `wbGoHome` /
    `wbStopHome`, `.wb-homing`; Aug 2026, on request). Let go within 30px of the corner it started in and the
    marker slides the rest of the way and **forgets the position entirely**, so it is back to the pixel in
    line with the zoom column, the timeline bar and whatever else that corner is shared with. Without it
    "put it back where it was" is a job no reader can do by hand, because the default is a stylesheet corner
    that MOVES — 18px normally, 108 while grading, 25 on the Atlas, different again on a phone — so a drag
    landing one pixel out leaves a stored position that no longer follows any of those rules, and the
    misalignment turns up later, on a page the reader was not looking at when they moved it. Four things:
    · **THE DEFAULT IS MEASURED, NEVER WRITTEN DOWN** — the inline right/bottom are cleared, the rect is
      read, and they are put straight back. A table of the CSS corners here would be a second copy of the
      stylesheet, out of date the first time one of those offsets moved, and wrong in exactly the case this
      exists to serve.
    · **…AND THE TRANSITION HAS TO GO OFF FOR THAT MEASUREMENT.** `.wb-tools` carries `transition:bottom
      .34s` for the grade bar's sake, so clearing the inline `bottom` STARTS an animation towards the
      stylesheet's value rather than arriving at it, and the rect read on the same tick is still the OLD
      bottom. Left in, the probe returns the marker's own current position as its "default": the snap test
      becomes right-axis-only and the slide goes to a place the stylesheet never chose. It did, for an hour,
      and it is invisible from the outside — the marker still slides and still ends up right, because the
      timer then clears the position and the CSS takes over. Caught by reading the inline styles mid-slide.
    · **CLEARING THE STORED POSITION IS THE POINT, not moving it to the same numbers.** A marker parked at
      the default's coordinates still HAS a position, so it would sit still while `body.grading` lifted the
      corner out from under it. The slide animates the inline values to the default and then drops them.
    · **INTERRUPTING THE SLIDE DOES NOT CANCEL THE GOING-HOME** (`wbStopHome`): the marker was released at
      the corner and that is where it belongs, so a press stops the ANIMATION and the position is forgotten
      there and then. Cancelling instead would leave the marker sitting at coordinates localStorage does not
      have — memory, disk and the pixels have to agree at every instant.
    Gated on `prefersReducedMotion()` (there the position is simply cleared), and `.wb-homing` transitions
    BOTH axes for its own 200ms, the base rule transitioning `bottom` alone — keep it in step with
    `WB_HOME_MS`.
  · **The handle is the toggle button itself** — there is nothing else to grab — so every press has to be
    classified: under `WB_DRAG_SLOP` (5px) it stays a click and toggles drawing, past it the drag takes over
    and the click that pointerup fires afterwards is swallowed by the `wbDragged` flag, which the toggle's own
    click handler checks and clears. `pointerdown` resets it, so a cancelled drag can't swallow the next real
    press. The handle carries `touch-action:none`, or the browser claims a finger drag as a page scroll before
    `pointermove` ever arrives.
  · **The element is positioned by `right`/`bottom`, never `left`/`top`**, and is exactly the 46px button:
    `.wb-panel` hangs off it **absolutely** rather than sharing a flex column with it. Both follow from the
    drag — with `left`, opening the panel would shove the button sideways, since the panel is wider. Out of
    flow, the panel only has to be told which way to open: `.wb-flip` when there is no room above,
    `.wb-left` when there is none to the left (`WB_PANEL_W`/`WB_PANEL_H` are rough sizes used only for that
    choice — the panel is `display:none` when shut, so it cannot be measured).
  · **The position is device-local** (`localStorage["folio_wb_pos_v1"]`, not in `S` and not synced — where a
    control sits on a screen is a fact about that screen) and **clamped on every apply and on resize**, so a
    position saved on a wide window cannot strand the marker off the edge of a narrow one. With nothing
    stored the inline styles are cleared, which is what lets `.on-atlas` and `body.grading`'s offsets take
  · **HOLDING the marker TOGGLES the pen** (`wbWireHoldToRelease` / `WB_HOLD_MS` / `wbHeld`, Aug 2026, on
    request). The toggle already carried a tap (open/shut the tools) and a drag (move them); a hold is the
    third gesture it had left, and it is the same one the deck rows and the review banner use one level up.
    It was **one-directional for a fortnight** — a hold put the pen up and a hold with nothing selected did
    nothing at all — on the reasoning that a gesture meaning opposite things depending on a state the shut
    panel barely shows is one nobody can predict. **That reasoning is backwards once you hold the thing**
    (changed on request): a control that answers on one press and is inert on the next reads as broken, and
    the state IS shown — the button carries `.on` while the pen is down, panel open or shut. So it toggles,
    and the **toast says which way it went**, which settles the ambiguity the one-way rule was avoiding.
    Turning it back on **restores the tool and colour last drawn with** rather than resetting to the default
    pen (a hold is a way back to what you were doing), which is why `ensureWBTools` now also exposes
    **`wbRenderColors`** beside `wbRefreshTools` — `applyWBState` re-marks the tool but does not rebuild the
    swatch row, whose selected colour follows it. Three things it has to get right, all about not firing twice — the click that
    follows a fired hold is swallowed through `wbHeld` exactly as a drag's is through `wbDragged`; a press
    that becomes a DRAG cancels the pending hold; and `contextmenu` is suppressed on the handle, or a long
    press on a phone raises the browser's own menu over the gesture.
  · **There is no Draw button: the three SIZE buttons ARE the pen** (Aug 2026, on request). Clicking a size
    picks the pen at that width and clicking the width it is already down at lifts it, which is why the size
    buttons carry **two** marks — `.sel` for the width in use (true under Mark and Erase too, which are drawn
    at that width) and `.on` for the pen being down at it. While Mark or Erase is the active tool a size
    click only sets that tool's width: taking the tool out from under a reader mid-mark is not what a width
    control does. Panel order is `[colours] / [sizes] [Mark] / [Erase] [Clear] / [Undo] [Redo]`.
  · **The custom colour** (`wbReadCustom` / `wbSaveCustom`, `localStorage["folio_wb_custom_v1"]`) is **one per
    palette** (a highlighter yellow is not a pen colour) and device-local, like the position. It is chosen in
    an **inline picker of the ordinary shape** — a saturation/brightness field over a hue bar with the hex
    beneath (`.wb-pick`, `wirePickField`, `hsvToHex`/`hexToHSV`; Aug 2026, on request). It was an
    `<input type="color">` laid over the swatch, whose platform dialog on a phone is a full-screen "Select
    color" sheet of sliders covering the very card being annotated. Four things hold it up:
    · it is **its own `.wb-row` inside the panel**, not a popover — the panel is already a floating box that
      decides which way it opens, and a second one inside it would have to decide again;
    · **`.wb-pick[hidden]{display:none}`** is required, `.wb-row`'s author `display:flex` beating the UA rule
      (codebase convention, cf. `.ces-imgpanel`);
    · the picker keeps **its own HSV**, never re-derived from the hex on each move: at `v=0` or `s=0` a colour
      has no recoverable hue, so a reader dragging into the black corner and back would come back red. Hence
      `pickDrag`, which is what stops the re-render `useColor` triggers from reseeding it mid-gesture;
    · both fields need **`touch-action:none`**, or a finger drag is claimed as a page scroll before
      `pointermove` ever fires, and the knobs are `pointer-events:none` so a press lands on the field.
    Guarded by `test-layout.js`, which asserts there is no `input[type=color]` left anywhere in the panel.
  · **ONE POINTER OWNS THE GESTURE, AND THE REST ARE NOT THIS STROKE** (`gid` / `gpen` / `dropGesture` in
    `setupWhiteboard`, Aug 2026, on a bug report: "sometimes I find myself unable to draw lines for a few
    seconds … other times lines that should be straight end up crooked"). Every other pointer surface on
    the site records the id it started on and ignores the rest — the marker's own drag handle, the page
    swipe, the colour picker, the gloss window. **The drawing surface, the one place a second pointer is
    not merely possible but expected, did not**: a stylus rests a palm on the screen and a phone has two
    thumbs, and the four handlers share a single `WB.drawing`, `WB.last` and `passScroll` between them, so
    a second contact never began a second gesture — it walked into the first one. **Both reported symptoms
    are that walk seen from two sides**, which is why they arrived as one report and read as two bugs.
    · **CROOKED LINES** are the second contact's coordinates landing in the first's stroke. With no id
      test the move handler drew `WB.last → p` for whichever pointer moved last, so a straight line was
      sewn back and forth between two contacts on alternate samples. It is the plain two-thumb case on a
      phone, and it is also every stylus reader who has turned stylus mode off.
    · **NOT DRAWING FOR A FEW SECONDS** is the same collision at the other end. `pointerup` and
      `pointercancel` ran `end()` for ANY pointer, and `end()` sets `WB.drawing = false` — so a palm
      settling and lifting killed the stroke the pen was in the middle of, and the pen went on moving over
      a canvas that had stopped listening until it was lifted and pressed again. **A browser rejecting a
      palm for us made it worse rather than better**, `pointercancel` being the commonest thing a palm
      produces. And in stylus mode a palm landing mid-stroke sets `passScroll`, whose test is the FIRST
      line of the move handler — so the pen's own moves were handed to the hand-rolled page scroll, and
      the pen scrolled the card it was meant to be marking.
    · **THE ONE PREEMPTION IS A PEN OVER A FINGER**, and it is what makes this a preemption rather than a
      plain first-wins rule: **the palm usually lands first**, so a marker that simply ignored the newcomer
      would leave a stylus reader unable to draw at all — the same report from the other end. Nothing
      preempts a pen, and a finger never preempts a finger; the reader lifts and presses again, which is
      what they were already doing to get out of it.
    · `dropGesture` releases the old pointer's capture and **calls `end()` on the way out**, so a finger
      that was drawing (non-stylus mode) has its stroke committed rather than lost when the pen arrives.
      It is declared before `end` and only ever CALLED from pointerdown, long after setup has finished, so
      the temporal dead zone never bites.
    · **Capture alone cannot do this job.** The canvas covers the whole visible page, so it is the hit
      target for every contact whether or not it holds a capture — the filtering has to be explicit.
    Guarded by `test-whiteboard.js`, which measures **pixels in a row band** rather than state: a straight
    line across the middle marks its own row and nothing else, and a line sewn to a second contact marks
    rows up where that contact is. State can be right while the canvas is wrong.
  · **Controls under the ink stay usable** (the `CTL_SEL` / `controlUnder` / `passCtl` block in
    `setupWhiteboard`, Aug 2026, on request). The canvas covers the whole visible page, so with the pen down
    it also covered Reveal answer and everything else on the card. **A z-index cannot fix this**: `.page` and
    `.cardwrap` both animate with a fill mode, and a filling animation is a stacking context, so nothing
    inside them can paint above a sibling of the stage. Instead the canvas hit-tests underneath itself on
    pointerdown (`pointerEvents:none` → `elementFromPoint` → restore) and hands the press to any real control
    it finds, activating it on pointerup only if the finger is still on it. **`preventDefault` on the
    pointerdown is what makes that necessary** — it suppresses the compatibility click, which would otherwise
    land on the canvas. `CTL_SEL` is deliberately real controls only (`button, a[href], input, select,
    textarea, summary`) and **not** `[role="button"]` or anything focusable: a background is full of glossary
    links and its picture is a `role="button"` figure, and drawing over a word means drawing over it.
    (The grade bar itself never needed this — it is `z-index:60` against the canvas's 40, in the root
    stacking context — but it is asserted anyway, since nothing on screen says which of them is which.)
  · **…AND A GLOSSARY TERM IS A THIRD KIND OF TARGET, DECIDED AT POINTERUP** (`TIP_SEL` / `tipUnder` /
    `pendTip` / `beginStroke`, Aug 2026, on request: "while using a stylus, card buttons are still
    clickable, as they should be; gloss terms should also be clickable"). It could not simply join
    `CTL_SEL`, and the bullet above says why: a real control claims the whole gesture at POINTERDOWN, and a
    card's background is dense with glossary links — so half the background would have stopped taking ink
    at all. So a press over a `.ttip` begins NOTHING; the first movement past `WB_TAP_SLOP` turns it into
    an ordinary stroke **that starts where the press did** (hence `beginStroke(at)`, lifted out of
    pointerdown — without the original point every line drawn through a linked word loses its first few
    pixels); and a press that never moves opens the term. Underlining a word still underlines it, and a tap
    on it still asks what it means. **Nothing is drawn and then taken back**, which is the whole reason the
    stroke is deferred rather than undone — a dot cancelled out of a bitmap backend is a repair, and this
    needs none. In STYLUS mode a finger never draws, so there the term is simply one more thing
    `passCtl` can hold — and the pointerup test had to become `(controlUnder(e) || tipUnder(e)) === ctl`,
    since `controlUnder` alone can never match a `.ttip` and would have dropped every one of those taps.
    **`.uc-tts` JOINED IT IN AUG 2026, ON REQUEST** ("while the whiteboard marker is selected, all buttons
    are still clickable, including the tts button on user imported/shared cards"). A community deck's
    read-aloud control is a `<span class="uc-tts" role="button">` **inside the card's prose**, so it is not
    a real control and `CTL_SEL` cannot see it — and it must NOT be fixed by widening `CTL_SEL` to
    `[role="button"]`, which is the bullet above's own warning: a card's picture is a `role="button"` figure
    and half a background would stop taking ink. As a `TIP_SEL` target it takes the glossary term's rule
    instead — a tap presses it, a drag through it draws — which is the right answer for a control sitting in
    the middle of the words being annotated.
  · **A STYLUS TAKES THE PEN, AND FINGERS GO BACK TO SCROLLING** (`WB.stylusSeen` / `WB.penOnly` /
    `wbPenOnly()` / `wbNoteStylus` / `wbApplyStylusMode` / `.draw-canvas.wb-pen-only`, Aug 2026, on request —
    Anki's behaviour). With the marker down the canvas covers the whole visible page, so on a tablet a
    reader annotating with a stylus could not scroll the card they were annotating without first putting
    the pen up, drawing on it and undoing that. Once a stylus has been seen on this device,
    `pointerType === "pen"` draws and `"touch"` is handed back to the browser to scroll with.
    · **THE SCROLL IS PERFORMED, NOT PERMITTED, AND THAT IS THE WHOLE OF IT** (`scrollerUnder` / `panFling`
      in `setupWhiteboard`; Aug 2026, on a bug report — "the stylus only draws a line for a tiny bit and
      then switches to moving the page"). It was done through CSS for a fortnight —
      `.draw-canvas.wb-pen-only{touch-action:pan-y pinch-zoom}` — and **that is what was broken**, because
      `touch-action` is a property of the ELEMENT and cannot tell a pen from a finger: the permission
      written for the finger applied to the stylus too, so the scroller claimed the pen's drag the moment
      it passed the pan slop, fired `pointercancel` at the canvas and scrolled the page out from under a
      half-drawn stroke. **No amount of `preventDefault` fixes it** — once a permitted pan has begun the
      browser stops listening, which is why the earlier note here saying the two halves had to agree about
      preventDefault was solving the wrong problem.
      So the canvas keeps **`touch-action:none` in every state** (a drawing surface never gives a gesture
      away) and a finger's scroll is done by hand: `scrollerUnder` finds what the finger is over by the
      same `elementFromPoint` hit-test the ink uses to find a control — so a gloss popup's body and the
      Atlas panel's columns are covered without a list of selectors kept in step by hand — and
      `pointermove` moves its `scrollTop`. **Vertical only**, which is what the CSS it replaces permitted.
      · **The momentum is not a flourish.** This replaces a native scroll, and one that stops dead on the
        lift reads as a page that has snagged; `panFling` continues under friction, clamps the velocity
        (one stray sample must not launch the page), is caught by the next finger down, and gates on
        `prefersReducedMotion()` like every other movement on the site. `WB._panStop` lets the next
        `setupWhiteboard` kill a fling still running over the card it is replacing.
      · **The cost, stated:** pinch-zoom over the canvas goes with `pan-y pinch-zoom`. Putting the marker
        up gives it back, and it was not worth keeping a rule that loses every stylus stroke.
      · This is also **where Anki makes the decision** — per gesture, by the tool that started it: a stylus
        event is consumed by the whiteboard and a finger event passed down to the scroller beneath. There
        is nothing to pass down to here, so the scroll is performed instead of delegated.
      · **`.wb-pen-only` carries no style now** and is still set: it is the state written where it can be
        read. A rule added back there would be the wrong fix twice over.
    · **A finger in stylus mode still reaches the CONTROLS under the ink** — it runs the same
      `controlUnder` pass-through as the pen, and pointerup activates the control if the finger is still on
      it. A finger that MOVED more than `WB_TAP_SLOP` has scrolled rather than tapped, and firing a button
      the reader was only using to push the page along is the one way this can be worse than what it
      replaced. (The press IS `preventDefault`'d now — with `touch-action:none` there is no scroll left to
      cancel, and it keeps the compatibility click off the canvas.)
    · **`stylusSeen` and `penOnly` are separate on purpose**: the first is a fact about the hardware and
      only ever goes true, the second is the reader's answer to it and defaults to yes. Both are
      device-local (`folio_wb_stylus_v1`), like where the marker sits — a pen that has touched this screen
      once will touch it again, and re-teaching the site every reload is exactly the friction this removes.
      The panel grows a **"Stylus only" row the moment one is seen** and keeps it, so the reader can go
      back to drawing with a finger; it is NOT a tool, so it never puts the pen up and it is marked
      **`wb-on`, deliberately not `sel`** — in this panel `.sel` means "the tool being drawn with", and
      `test-layout.js` reads `.wb-btn.sel` back to say which tool is down.
    · Detection watches `pointerover` as well as `pointerdown`, at the document, once: a stylus held over
      the screen has identified itself before it touches, so the FIRST stroke is drawn under the right rule
      rather than the one after it. The listener removes itself when it fires.
  · **On a phone the default corner clears the bottom bars**: `bottom:calc(var(--tabbar-h) + 12px)` on the
    study page and `calc(var(--tabbar-h) + var(--timebar-h) + 10px)` on the Atlas, where it also steps to
    `right:62px` — the zoom column (`.globe-zoom`, 34px wide at a 16px inset) holds that same corner, and
    the marker landed exactly on its `?`. A stored drag position still overrides both.
    Guarded by `test-layout.js`: a marker that cannot be moved and one that turns drawing on
    every time you move it are opposite failures, both silent.
    `test-layout.js` also guards the phone's **page SWIPE** (Aug 2026) — and guards as hard against what
    must NOT navigate as against what must, since a false positive TAKES A PAGE AWAY: a short drag, a
    diagonal (a scroll that wandered), the ends of the order, and the ATLAS, which is excluded outright
    because a drag there turns the globe. The gesture is dispatched as real `PointerEvent`s rather than
    through `page.touchscreen`, because the handler is on `document` and keys off `pointerType`.
    It also asserts that **`SWIPE_ORDER` IS the tab bar minus the Atlas** — read off the bar rather than
    off a list written into the test, so a tab added or removed later fails on the rule rather than on a
    stale copy of it, and Collections cannot creep back in — and that the transition is a real **slide**,
    measured MID-FLIGHT (the finished state of a slide and of a cut are the same page in the same place, so
    an assertion made after it settles would pass on a hard swap for ever): the ghost exists, the incoming
    page is a whole width off to the side rather than nudged, the stage is clipped while they travel, and
    both are cleaned up after.
    And the Atlas sheet's **content-fitted ceiling**: it opens no taller than the page in it needs, a drag
    upward stops at the content rather than at the top of the screen, and a swipe to a shorter page shrinks
    it — measured as the SLACK between the scroller and the pane inside it, which is exactly the "empty
    space at the bottom" the request names.
