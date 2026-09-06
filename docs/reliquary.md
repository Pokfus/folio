# The Reliquary — artefact chests, collectible themes and the showcase

**Read this before touching the `THE RELIQUARY` block in app.js, `rollChestItem` / `spendChest` /
`grantChest`, the chest overlay, `artefactPlateHTML`, the showcase, the collectible themes
(`COLLECTIBLE_THEMES` / `THEME_DROP` / `unlockTheme` / `themeGrandfather`) or the collector's badges.**

`CLAUDE.md`'s "How the app is wired" carries the operational summary — what a chest is, the three
channels that grant one, what a chest may hold, and which fields sync. This file carries the rest: why
rarity is the whole language and why an exhausted rarity is dropped from the roll rather than re-rolled,
the timing the reveal is sized by, the two-tier plate and where its actions sit, why a theme drop
grandfathers an existing reader, the showcase's empty-slot control, and the z-index and Escape
interactions that a plate's own glossary links forced.

- **THE RELIQUARY — artefact chests** (the `THE RELIQUARY` block in app.js, just below the levels block;
  `artefacts.js`; Aug 2026, on request). A level buys a **chest**, and a chest holds one real historical
  object. It is the first thing a Folio level has ever GIVEN the reader rather than taken away — the level
  used to cap how many decks the daily review would hold, which made the reward for studying a permission
  to study. Nine things are decisions rather than plumbing.
  · **RARITY IS THE WHOLE LANGUAGE**: `RARITIES` holds Common / Rare / Epic / Legendary at **60 / 25 / 12 / 3**,
    and styles.css declares one token pair each (`--rar-common` grey, `--rar-rare` blue, `--rar-epic` purple,
    `--rar-legendary` orange, with separate NIGHT and `body.hc` values — a colour mixed toward a dark paper
    loses the thing that identifies it, and the reader is being asked to tell four apart at a glance).
    `[data-rar]` sets `--rar` on whatever element needs it, so the chest, the reveal, the inventory tile and
    the admin row's swatch all say "this is an epic" the same way and none of them carries a literal.
  · **A RARITY THE READER HAS FULLY COLLECTED IS DROPPED FROM THE ROLL, not re-rolled into a duplicate.**
    `rollArtefact` renormalises the weights over whatever rarities still hold something unowned, so every
    chest is a NEW artefact until the whole pool is exhausted — and then it says so instead of opening on
    nothing. With a small pool that is the difference between a reward and a slot machine, and it is the
    failure a reader would never report: a duplicate just reads as bad luck.
  · **THE RARITY IS DECIDED WHEN THE LID IS TAPPED, not when the overlay opens**, so the shake, the burst,
    the confetti and the sound are all sized to what is inside (`CHEST_MS`: 900ms common → 2500ms legendary;
    a legendary is the only one that gets rays, a screen flash and a held chord). Four `sfx` branches —
    `chest` for the hinge, then `loot-common` / `loot-rare` / `loot-epic` / `loot-legendary`.
  · **THE CHEST IS THE LEVEL-UP CELEBRATION, not a second one after it.** `announceLevelUps` grants and
    opens; `congratsPopup` is no longer raised behind it, since two overlays for one event is two.
  · **AN UNOPENED CHEST QUEUES.** `S.chests` is a COUNT, not a flag: dismissing the overlay keeps the chest,
    and a second level while one waits adds to it.
    **…AND SINCE AUG 2026 THE READER CAN SAY SO, which is two changes that are one feature** (on request).
    `Save for later` stands beside the CLOSED chest and is removed the moment the lid opens — once an artefact
    has been drawn there is nothing left to defer — and it makes an existing guarantee visible rather than
    changing behaviour: dismissing the overlay always kept the chest, and nothing said so. Since a chest may
    now be deliberately put by, there has to be somewhere obvious to come back to it, so
    **`chestBannerHTML` says one is waiting DIRECTLY ABOVE THE DAILY-STUDY BANNER** (`#chestSlot` /
    `#chestBanner` in `PAGES.home`) — rendered as nothing at all when none is, a banner reading "0 chests"
    being one that looks broken. `refreshReliquary` fills and empties the slot in place on whichever page is
    open, so a chest opened from the home page can take its own notice away without a repaint.
    **IT MOVED THERE FROM THE ACCOUNT PAGE, AND THE BANNER'S COUNT WENT WITH IT** (Aug 2026, on request:
    "never display the number of chests in the daily study banner"). The two were the wrong way round — the
    NOTICE, a sentence with a button beside it, sat on a page a reader has to go to, while the DAILY-STUDY
    BANNER carried a bare `.chest-chip` count in its meta row: a fourth figure in a row of three, counting
    something that is not a pile of cards. Both `#chestSlot`s are gone from the account views and
    `.chest-chip` is deleted from app.js and styles.css alike. The Reliquary's own "Open your chest" button
    stays, since that page still holds the collection. `#chestSlot:empty{display:none}` matters on the home
    page in a way it never did on the account one: `.banners` is a flex column with a gap, so an empty slot
    would spend one and leave a hole above the banner on every day nothing is waiting.
  · **THE LID IS SHALLOW ON PURPOSE** (Aug 2026, on request: "the top is too rounded"). The dome was an arc of
    ry 30 over a 92-wide lid — very nearly a half-circle, which reads as a barrel or a cauldron rather than a
    chest — and is ry 16 now, with the 14 units it gave up going to the box. `CHEST_SVG` is drawn at 190px in
    the overlay and 42px in the account banner, so it has to hold up at both.
  · **THE SECOND CHANNEL is the daily sweep** (`maybeSweepChest`, called from `markGamePlayed`): all six
    games won in one day, once a day. `S.sweepChest` records the DAY rather than a boolean — a flag would
    need clearing at midnight by something, and nothing runs at midnight.
  · **THE THIRD IS THE STREAK, EVERY SEVENTH DAY** (`maybeStreakChest` / `STREAK_CHEST_EVERY` (7) /
    `S.streakChest` / `streakChestProgress` / `streakChestHTML`, Aug 2026, on request). A seven-day run buys
    a chest, and so does every week after it. **`S.streakChest` is the streak length last PAID, not a day or
    a count of chests**, and that is the whole of the design: `bumpStreak` is what advances the streak, so
    the test is simply "has this length crossed a multiple of seven that has not been paid yet", which
    grants at 7, 14, 21 … and can never grant twice for one day however often `save()` runs. A broken streak
    resets it to 0 with the streak, so the next week starts over — and a reader whose streak was already
    long when this shipped is paid at their next multiple of seven rather than seven times at once, since
    the field back-fills at 0.
    **AND EACH WEEK IS WORTH MORE THAN THE LAST** (`streakChestWeeks`, Aug 2026, on request): the seventh
    day pays one chest, the fourteenth two, the twenty-first three. A flat chest a week is a reward that
    stops meaning anything around the second month, where the whole point of a streak is that it costs more
    to keep the longer it runs. **The figure is DERIVED from the count rather than tallied** — the number of
    complete weeks — so it needs no field of its own, cannot drift from the streak it is paid for, and comes
    out right for a returning reader: they are paid the full amount at their next multiple of seven rather
    than everything they have missed at once. `streakChestProgress` gained a **`worth`**, which is what the
    NEXT chest pays and deliberately not what the last one did — on the day one is earned the week that
    closed has just been paid, so what is coming is the week after it — and the account page's sentence
    names the prize wherever it is more than one, a bare "your next chest" saying the fifth week is worth
    what the first was.
    **THE PROGRESS IS ON THE ACCOUNT PAGE, UNDER THE STAT TILES** (`streakChestHTML` / `.streak-chest`) —
    beside the streak figure it counts from, since that tile says how long the run is and this says what the
    run is worth, which are two halves of one fact and read badly a section apart. **Seven pips rather than
    a bar**: the unit is a DAY, and a continuous fill would suggest a part-finished one. **AND THE "3 / 7"
    BESIDE THE TITLE IS GONE** (`.sc-count`, Sep 2026, on request: "remove the numerical counter so it is
    only the grid and the chest") — the pips ARE the count, seven of them with three filled, so the figure
    was the same fact in a second notation and the sentence under them already says how many days are left.
    Nothing is lost to a reader who cannot see the pips: the row's `aria-label` has always carried
    "3 of 7 days towards the next streak chest" in words, and still does. **A CHEST SITS AT
    THE RIGHT-HAND END** (`.sc-chest`, Aug 2026, on request), drawn in the quiet ink and lighting to the
    earned gold on the seventh day, so the row says what the pips are building towards rather than leaving
    it to the heading; it is the same `CHEST_SVG` the overlay and the notice use, so the three cannot come
    to disagree about what a chest looks like, and it is `aria-hidden`, the row being named in words. It takes a `prog`
    like every other figure in that section, so a friend's would render correctly — **nothing calls it that
    way today**, and that is a gap rather than a decision.
    **THE TWO CALLERS GATE IT DIFFERENTLY, ON PURPOSE.** On your OWN record it is always drawn, and at a
    streak of 0 it says what a streak is worth rather than showing a bare "0 of 7" — an explanation on the
    one page where the reader is studying their own record. On the SIGNED-OUT page it is drawn only once a
    streak exists, which is the Reliquary's gate directly beside it: everything on that page is a courtesy
    over a sign-in wall, and a section with nothing in it is one more thing between a first visitor and the
    form. **A guest sees it at all** for the Reliquary's reason too — a streak is built and its chests
    earned entirely on this device, so walling the progress off would hide the thing being worked towards.
  · **THE SHOWCASE is four** (`SHOWCASE_MAX`, `S.showcase`), pinned from an artefact's own window and shown
    at the top of the profile — your own and a friend's, since being seen is the whole point of it.
    `showcaseIds` filters on the way OUT rather than on the way in: an artefact retired from the pool since
    it was pinned would otherwise leave a slot pointing at nothing, and a reader cannot unpin what they
    cannot see.
    **AN EMPTY SLOT ON YOUR OWN PROFILE IS A CONTROL** (`[data-arslot]`, Aug 2026, on a bug report: "when I
    click one of the four empty squares, nothing happens"). It was a decorative `div` carrying a "+", which is
    the mark for *something goes here* and so invites exactly the click it could not answer; it opens the
    collection now, that being where an artefact is pinned from, and where nothing is owned yet it says so
    rather than raising an empty list. On a FRIEND'S showcase the slots stay decoration — their profile is not
    yours to fill — which is why the markup branches on `own` and only `button.ar-slot` takes a pointer.
    **…AND IT CARRIES THE WAY IN TO THE WHOLE COLLECTION** (`.ar-schead` → `openCollectionWin`, Aug 2026, on
    request). Four artefacts out of however many a reader holds said nothing about the rest: on your own
    account the inventory was three sections further down and on a friend's it was below their statistics,
    so the four tiles read as the whole of it. It opens as an OVERLAY rather than scrolling to that section
    — the same list wherever a showcase is rendered, including a page that carries no inventory section at
    all — and it is built from **`reliquaryHTML`**, so the overlay and the page's own section cannot come to
    disagree about what is collected. **It is the ONLY way to the collection since Aug 2026** (on
    request): the account page carried a second, full Reliquary section lower down, so a reader's
    artefacts were listed twice on one page — the section is gone from both your own account and a
    friend's, and this button reads **See Reliquary** with the count moved into its `title`. The
    SIGNED-OUT page keeps its own `#reliquary` section, deliberately: that page has no showcase, so
    removing it would leave a guest's own collection unreachable. Two things: it is absent when nothing is owned ("See Reliquary" over nothing is a
    control that does nothing), and **`wireReliquary(host, prog, own)` takes the progress it opens FOR** —
    a friend's showcase must raise a friend's collection, and the earlier one-argument form would quietly
    have shown the reader their own list under somebody else's name.
  · **THE PLATE IS ONE BUILDER** (`artefactPlateHTML` + `wireArtefactPlate`, Aug 2026, on request). The frame
    an artefact is READ in — picture, name, rarity, date, origin, the five sentences and the works behind
    them — is built once and used by both `openArtefactWin` and the live preview in Admin → Artefacts. A
    preview written from a second copy of the markup is a preview that drifts, and it drifts silently. The
    overlay chrome (backdrop, ×, Escape) stays with `openArtefactWin`, since the preview has nothing to
    close; the FOOTNOTE NUMBERING stays with `wireFootnotes`, which needs rendered nodes, so every caller
    pairs the builder with `wireArtefactPlate` on the container it put the markup in.
  · **THE PLATE IS WASHED IN ITS OWN RARITY, AND SO IS THE CHEST'S REVEAL** (Aug 2026, on request). The
    rarity was already the plate's whole language — the chip, the top rule, the border, the picture frame —
    and every one of those is an EDGE, so a common and a legendary read alike anywhere but the rim. Both now
    carry a gradient of `--rar` running top to bottom, laid OVER `var(--card)` rather than mixed into it, so
    it needs no per-theme rule: whatever paper a theme uses is what the wash fades into. Two things. It is
    strongest at the top, where the name and the chip are, and gone by two thirds down, so the five sentences
    and the citations under it sit on ordinary paper and lose no contrast — `test-a11y.js` measures every
    text node against the background it really renders on. And NIGHT takes a weaker mix, for the reason every
    other wash on the site does: a colour over a dark paper reads far stronger than the same percentage over
    a light one. The chest's `.chest-reveal` is additionally BOXED, because it floats on the overlay's dark
    backdrop rather than on a card, and a gradient fading to transparent there would fade into the backdrop
    instead of into paper.
  · **AND SHOWCASE SITS AT THE TOP OF THE PLATE** (same request). It used to close the plate, below five
    sentences and a fold of citations — so on anything but the shortest artefact it was off the bottom of a
    scrolling box, and a reader who opened a plate to pin it had to read past everything first. It is the one
    ACTION on a page that is otherwise all reading, and an action belongs where the reader arrives.
  · **THE PLATE'S PICTURE IS THE SITE'S OWN MEDIA FRAME** (`artefactPlateArtHTML`, Aug 2026, on a bug
    report: "there's no way to zoom in on artefact images"). A TILE's `.ar-img` is a bare `<img>` inside a
    `<button>` and must stay one — a `role="button"` figure nested in a button is invalid markup and would
    fight the tile's own click — but the plate emits **`.card-img`**, the same frame a card and a glossary
    term wear, so the delegated listener that opens the fullscreen viewer, the Enter/Space handler, the
    `pop` sound and the dead-link marking all cover it with **no wiring of its own**. Two decisions in it.
    **THE VIEWER'S TITLE IS THE ARTEFACT'S NAME**, which is a statement rather than a shortcut: an
    artefact's image carries `src`, `credit` and `alt` and no title (the entry above it already names,
    dates and places the object), so what the picture is OF is the artefact — and composing a caption for
    somebody else's photograph is the one thing this must not do. The credit becomes the viewer's
    "Source:" line exactly as a card's does. And **THE FRAME IS BORDERED IN THE ARTEFACT'S RARITY** (also
    on request), reading `--rar` off the `[data-rar]` on `.ar-win`, so the picture speaks the same
    language the chip, the tile and the chest already do; `test-artefacts.js` measures that border against
    the TOKEN rather than a hex literal, so re-toning a rarity moves both together. A dead link takes the
    whole 220px column with it (`.ar-winart:has(.card-img.media-dead)`), or the text sits beside a gap.
  · **AN ARTEFACT'S FIVE SENTENCES LINK THE GLOSSARY** (Aug 2026, on request), on `processAbstract`'s
    shape: the first bold is the object's own name and is marked `ans-term` so the linker steps over it,
    the artefact's NAME is passed as the answer term, and the SITE scope is passed explicitly — a plate is
    curated content and must never link a community deck's terms. A term first met on a plate counts on
    the account page's meter exactly as one met on a card, `setupTooltips` doing the discovery marking.
    **IT IS WHY `.artefact-pop` DROPPED FROM z-index 9700 TO 7600.** A gloss popup opens at 8000–9400 on a
    desktop and 9600 as a phone sheet, so at 9700 every definition opened from a plate rendered BEHIND the
    plate that raised it: nothing throws, the popup is really there, and the reader sees a click that did
    nothing. **AND ESCAPE HAD TO LEARN TO STAND DOWN** (`escTakenAbovePlate`) — the plate, the image viewer
    and the gloss popups all listen on `document`, and `stopPropagation` does NOT stop a sibling listener
    on the same node (that needs `stopImmediatePropagation`), so one press was closing the plate as well as
    the thing on top of it. The guard is keyed on what is actually on screen rather than on a flag, and the
    collection overlay takes it too plus "a plate is open", so Escape peels one layer at a time.
  · **A GUEST'S ARTEFACTS SHOW ON THE SIGNED-OUT ACCOUNT PAGE TOO.** Everything else there is behind the
    sign-in wall because it is about an ACCOUNT; artefacts are not — a guest levels up, earns chests and
    opens them entirely on this device, so walling the inventory off would be a reward that can be won and
    never looked at. It appears only once there is something to show, and carries no showcase, that being
    the half an account is needed for.
  · **THE OVERLAYS LIVE ON `document.body`**, like the level-up popup and the image viewer, so — like them —
    `render()` closes them (`closeChestPop`, `closeArtefactWin`, `closeCollectionWin`, in the close list). The chest is
    deliberately NOT dismissed by a backdrop click: unlike the level-up popup it holds buttons, and an
    overlay where a stray tap outside the card takes the reward away is one nobody trusts.
  · **A CHEST MAY ALSO HOLD A THEME** (`COLLECTIBLE_THEMES` / `THEME_DROP` / `ownedThemes` /
    `themeUnlocked` / `lockedThemes` / `unlockTheme` / `claimTheme` / `rollChestItem` / `themeGrandfather`;
    Aug 2026, on request: "besides artifacts, we will add a second type of item users may occasionally
    collect: Themes"). The five non-`folio` themes are locked until one comes out of a chest, at
    `THEME_DROP` (14%) of an opening **while any are still locked** — so a reader collects them at roughly
    the rate they collect artefacts and the drop retires itself rather than dwindling to noise. Six things
    are decisions rather than plumbing.
    **`folio` IS NEVER IN THE REGISTER.** `S.themes` holds only what was WON, so "unlocked" is
    `id === "folio" || owned[id]` and the default can never be lost, missing or granted twice.
    **NOTHING IS TAKEN FROM A READER WHO ALREADY WEARS ONE** (`themeGrandfather`, called at boot and again
    from `applyProgress`): a theme in `S.settings.theme` that is not in the register is written into it,
    once, and the function only ever unlocks. Without it the change would have quietly stripped five of the
    six themes from every existing reader, which is the one way a collectible can be worse than no
    collectible at all.
    **A LOCKED THEME'S BUTTON WAS PRESSABLE, NOT `disabled`** — Chrome fires no mouse events at all on a
    disabled button, so the hover try-on would have been taken away from exactly the themes that most
    needed advertising. `setTheme` is still the gate (it refuses a locked id outright) and the click still
    toasts the reason, but **the picker no longer draws a locked tile at all** (Aug 2026, on request): the
    dashed border, the desaturated mock and the padlock are gone with them, and this settings row lists
    only what the reader can actually choose. The guard stays as a backstop rather than a path anybody
    reaches — it reads an id off an attribute, and a guard on a value read out of the DOM is worth keeping
    even when nothing renders the value it refuses.
    **BUT THE ROW ITSELF IS ALWAYS DRAWN, AND HIDING IT WAS THE OVER-REACH** (Aug 2026, on a bug report:
    "I don't see anywhere to change my theme on the settings page and switch between my collected ones").
    Listing only what is owned was the request; hiding the whole section until a chest had produced
    something was a second decision taken alongside it, on the reasoning that a picker offering one option
    explains a decision nobody is being asked to make. What it did in practice was take the feature off the
    page — a reader looking for where their themes live found a Settings page with no mention of themes at
    all, and no way to tell an empty collection from a control that had moved or broken. **The state lives
    in the COPY instead**: the row's own prose names how many are still to find and where they come from,
    and says nothing once the set is complete. A sentence can be right in every state; a hidden row is right
    in exactly one. The lone `folio` tile is also the only place a reader can see the default beside the
    ones they win.
    An owned tile's tag reads **the day it was unlocked** (`themeUnlockedOn` /
    `themeUnlockedOnText`, Aug 2026, on request). Nothing new is recorded for that and no save migrates:
    `unlockTheme` has written `Date.now()` since the day it shipped, so this is only the reading of it.
    **ZERO IS A REAL ANSWER AND MUST NOT BE PRINTED AS ONE** — `themeGrandfather` writes 0, meaning "owned,
    date unknown", and 0 as a timestamp is 1 January 1970, so a caller that formatted it blindly would put
    a confident wrong date on the one theme whose history nobody recorded. There and on `folio`, which
    nobody unlocked, the tag falls back to the tagline, which moves into the tooltip everywhere else so the
    one line the tile has room for carries the thing that changes rather than the thing that never does.
    **AND `t[2]` IS PRE-ESCAPED HTML** — Marble's tagline is written `Marble &amp; bronze` and every reader
    of it emits it raw, so only the date, composed at render out of the reader's own locale, is escaped.
    **THE REVEAL OPENS AS AN "EPIC"** so the chest animation has a rarity to size its shake, its burst and
    its sound by, without borrowing the legendary flourish — and the plate shows the same `themeMockHTML`
    the Settings picker draws, so the two cannot come to disagree about what a theme looks like. Its two
    actions are **Wear it now** and **Keep it for later**, because a theme is the one collectible that
    changes the site under the reader the moment it is claimed.
    **`THEME_OPTS` MOVED UP BESIDE `THEMES`** (with `THEME_BY_ID` / `themeName` / `themeMockHTML`), out of
    `PAGES.settings`' closure: the chest overlay, the friends list, the admin tab and the picker all draw a
    theme now, and a table reachable from one page only would have become four copies of itself.
    **AND `spendChest()` IS THE ONE PLACE A CHEST IS SPENT**, incrementing `S.chestsOpened` — a lifetime
    tally that only ever goes up. It cannot be derived from the artefacts any more, since an opening may
    hand back a theme instead, and the badges below read it, so the banner's count and the badges' count
    cannot drift.
  · **FIFTEEN COLLECTOR'S BADGES** (Aug 2026, on request), reading `progStats`' new fields: chests opened
    (1 / 10 / 50), artefacts held (10 / 25 / 50), a legendary found, a deck published, books started
    (1 / 5 / 10), 250 glossary terms, and **an hour, three hours and eight hours studied in ONE day**.
    Three things about them. **They are tested at the moment they are earned, not at the next card** —
    `checkAchievements()` is called from `spendChest`, from `uDeckPublish` and from `setReadingPos`' first
    write for a book, because being told about a chest badge three cards later reads as the site having
    lost count. **A badge grants a chest**, which is what `checkAchievements` has always done, so opening
    chests earns badges which grant chests — it cannot run away (a badge unlocks once) and it does mean
    the chest BALANCE is not a plain subtraction, which `test-artefacts.js` now asserts against the badges
    rather than against a constant. And **the day figures read `S.studyTime` only where its day stamp is
    today** (`dayKey()`), so the three hour badges are about one day's work rather than a lifetime total,
    which is what was asked for.
  `S.artefacts` / `S.chests` / `S.showcase` / `S.sweepChest` — and, since Aug 2026, `S.chestsOpened`,
  `S.themes`, `S.published`, `S.publishedIds` and `S.theme` — are in `defaultState` AND `PROGRESS_FIELDS`:
  an artefact is something the reader earned, so the shelf a phone shows is the shelf a laptop shows.
  **`themes` and `theme` are additionally in `RESET_KEEPS`** — Reset progress names the study history, the
  streak and the badges, and a collectible taken away by a control that does not mention it is the failure
  that bullet exists to prevent; the artefacts and chests still go, being what a LEVEL bought. Guarded by
  `.claude/test-artefacts.js`.

## The page (`#reliquary`, Aug 2026, on request)

"The Reliquary should be its own page, sortable by alphabet, unlocked date, artefact dating, rarity, and
reverses." What shipped is `PAGES.reliquary`, and five things about it are decisions rather than plumbing.

**Your own collection is a page; a friend's is still an overlay.** A page buys an address, a back button
and a sort a reader can leave set, all of which a hundred artefacts want. It can only ever be YOURS,
though: a route carries a name and nothing else, so there is nowhere for somebody else's progress to ride,
and `openCollectionWin` stays exactly as it was for a friend's showcase. `wireReliquary` decides which of
the two a "See Reliquary" press opens, from the `own` flag it was already being given.

**The sort is the Library shelf's pair, not a second control.** `sortPickerHTML` chooses the FIELD and
`sortDirHTML` the DIRECTION — which is why `RELIQ_SORTS` carries four strings a row rather than two: a
field and its direction are independent choices, and folding them together gives a select of eight rows in
which the reader has to find the one row that is both. It is also what spends the request's "and reverses"
on one button instead of doubling the list. The choice lives in a module-level `reliqSort` / `reliqRev`,
not in `S`: it is a way of LOOKING at a list rather than a preference about Folio, the same call
`PAGES.glossary`'s picker and `renderDeckStats` both make, so it survives navigating away and back and
resets on reload.

**"Unlocked date" needed no new field, and nothing had to be backfilled.** `S.artefacts[id]` has been
`Date.now()` rather than `true` since the register existed — `ownedArtefacts` already sorted on it — so
every artefact ever granted can say when it arrived. This was planned as a new `S.artefactAt` map with an
apology for the artefacts that predated it; the apology was unnecessary and the map does not exist.

**"Artefact dating" needed a parser, and it is deliberately NOT `cardYears`.** Forty-two of the hundred
artefacts are dated by CENTURY — `c. 7th – 5th century BCE`, `Early 7th century CE`, `3rd millennium BCE`
— which `cardYears` cannot read and must not learn to: 52 shipped CARDS carry a century form beside a
plain year in their date lines, and teaching the shared parser about centuries would silently move their
sort years. So `artefactYear` reads the century and millennium forms itself and falls through to
`cardStartYear` for everything else. Two details in it earn their place:

- **the range whose unit carries rightwards** (`1st – 3rd century CE`, `c. 6th – 4th century BCE`) is
  matched by its own pattern FIRST, because the first ordinal has no "century" after it and the simple
  pattern would read the SECOND one — dating the object two centuries late, plausibly and invisibly;
- **the earliest year the unit names** is what is returned — the 3rd century BCE opens at 300 BCE and the
  7th CE at 601 — so the ordering answers "how old is this" rather than "when did it stop".

All 100 shipped artefacts yield a year. One that did not would sort LAST in both directions rather than at
year zero, where it would sit among the Roman ones claiming a date it has not got.

**And the signed-out account page's inline grid became an entry to the page.** That page has no showcase,
so before there was a page its only route to the collection was a second full copy of the grid — which is
exactly the duplication the signed-in page had removed on request a fortnight earlier. `reliquaryHTML(prog,
own, { entry: true })` renders the count, the chest button and a "See Reliquary" press instead. The full
grid is still what a friend's overlay draws.

One repaint note. A chest can be opened from this page, and `refreshReliquary` must not rebuild the page
under a reader who is looking at it through an overlay — so the page leaves its own `repaint` in
`_reliqRepaint` and that function calls it, exactly as it repaints the account page's two blocks in place.
`closeReliquaryPage()` is in `render()`'s close list, so the hook can never be called against a page that
has gone.
