# Folio's regression tests — what each one guards, and why

**Read this before writing a new suite, and when one of them fails in a way you do not recognise.**

`CLAUDE.md`'s Testing section carries the list, the house rules and — for every suite — the
**"re-run after touching …"** list, which is the operational part. This file carries the rest: what
each suite actually asserts, the bug it was written for, and the harness traps that made a first
draft report faults that were not there. It is the record of what has already gone wrong, so a
later session does not rediscover it.

Every one of these was written because the failure it guards is SILENT. Nothing throws when a
layout is wrong, when a review quietly takes all its new cards from one deck, when a citation
marker stops resolving, or when a deck imports with its last nine thousand cards missing. That is
the whole reason the suites exist and the reason their narratives are worth keeping.

  · `node .claude/test-deck-trust.js` — **the sanitizer revision stamp** (9 assertions), which is what lets
    boot skip re-cleaning a deck it has already cleaned. Two directions, failing in opposite ways: a stored
    record with **no `srev`** — what an older and possibly buggier sanitizer left — is still cleaned, meta
    and card fields alike, with nothing executing (verified by reintroducing the fault: the payload runs);
    and a record we write really does **carry** the stamp, at the record's top level where an export cannot
    copy it. That second one is the assertion nothing else can make, because it guards a PERFORMANCE
    promise, and a performance promise that has quietly stopped holding looks exactly like one that holds.
    Its fixture writes to IndexedDB **and** localStorage, since `cdbAll` falls back and a fixture in the
    store the app is not reading proves nothing. **Re-run after touching `SANITIZE_REV` / `uDeckNormalize`
    / `uDeckIndexRecord` / `communityBoot`, or any `sanitize*` function.**
  · `node .claude/test-deck-lazy.js` — **the split store** (27 assertions, Aug 2026): a deck's cards live
    one record per note and are loaded when needed, and EVERY failure that change can produce is invisible
    from the outside, which is why this is a file of its own. A boot that quietly went back to loading
    everything still works, only slower — there is nothing on screen to see, which is exactly how the cost
    it replaced went unnoticed for months. A session whose cards were never warmed renders BLANK cards
    rather than throwing. A save that writes the whole deck instead of the one note it touched shows up
    only on a deck nobody in a test has. So the assertions are made against the STORE: the deck record
    carries an index and **no prose**, the notes store holds one record each keyed `<deckId>/<noteId>`,
    the Studio's shelf warms nothing while opening a deck warms all of it, a real edit rewrites **exactly
    one note of twelve**, and a session started from the home page shows a card **with its words in it**.
    Its sharpest section is the **fmt-1 migration**, the one path that can lose somebody's deck: a
    record in the old shape is planted directly in the store with prose no other deck has, and after a
    boot it must be rewritten, keep every word, and still open. It also pins that an export carries real
    cards rather than empty stubs and smuggles no `srev` / `fmt` / `_lazy` into the file. **Re-run after
    touching `cdbPutDeck` / `cdbGetNotes` / `cdbAllNotes` / `uDeckIndexRecord` / `uNoteRecord` /
    `uDeckRecordFull` / `uNoteIndexEntry` / `uIndexSanitize` / `uNoteStub` / `uDeckMount` / `uDeckSave` /
    `uCardTouched` / `uWarm` / `uWarmDeck` / `uAdoptNotes` / `communityBoot`'s migration, or the loading
    placards in `PAGES.study` / `PAGES.studio` / `PAGES.browse`.**
  · `node .claude/test-sanitize.js` — 48 XSS vectors through `sanitizeHTML()`, each one also injected into
    a live DOM to confirm nothing executes. **Re-run after touching `SANITIZE_*` or `sanitizeUrl`.**
  · `node .claude/test-csp.js` — serves the site with the real `_headers` CSP and walks every route,
    failing on any violation. **Re-run after changing `_headers`, or adding an inline script/`eval`.**
  · `node .claude/test-community.js` — 40 assertions end-to-end: write a deck in the Studio, reload,
    study it, export, import, delete; plus that a hostile deck file executes nothing, and that community
    content never reaches `CARD_DATA` / the tree / the glossary / the admin overlay / the daily games.
    **Re-run after touching the `COMMUNITY DECKS` module or the Studio** — including the ownership register
    (`uDeckOwned` / `uDeckClaim` / `deckOwnBackfill`): its "deck survives a reload" is the only assertion on
    the shelf that can see a deck that mounts from nothing, and it is what caught `uDeckCreate` not claiming
    the deck it had just created.
  · `node .claude/test-admin-editor.js` — the curated-content editor: open a card, type, confirm the
    overlay records it, revert, the HTML source box, and gloss popups. **Re-run after touching
    `liveCardEditorHTML` / `wireLiveCardEditor`** — that surface is shared with the Studio.
  · `node .claude/test-publish.js` — 128 assertions across six browser sessions (an author, a reader, an
    admin, and three more DEVICES of that reader's) driving publish → browse → install → update → report → hide → rate → staff-pick → fork → export → delete → sync. It runs against an
    **in-memory mock of the Supabase REST API**, deliberately: the publishable key in app.js points at the
    real project, so a test that really published would write rows into it. The mock also enforces the
    ownership rule, which is how "a stranger cannot patch someone's deck" is asserted — and, since Aug 2026,
    **it truncates a card request that carries no `Range`**, which is what stands in for PostgREST's
    `db-max-rows`: a deck of 7 is published and installed and every card must arrive at both ends, so an
    unpaged fetch loses cards HERE rather than on somebody's live project. Verified by removing the paging
    and watching it fail.
    **IT PUBLISHES A TYPED DECK SINCE AUG 2026, AND THAT FOUND A LIVE BUG OF THE WORST SHAPE THIS FILE
    RECORDS.** Every deck it had ever published was BASIC — no card types, no subdecks — so the branch that
    carries a typed card's content had never once been exercised. `uDeckPublish` builds each row's `data`
    from `CARD_FIELDS`, which is the Basic thirteen, plus `questions` / `sources` / `sub` / `image` / `video`
    — **and a typed card carries `type` + `fields` INSTEAD of those thirteen**, so what went up was twelve
    empty strings and nothing else. The TEMPLATES travelled (they ride on the deck row, `user_decks.types`)
    and the CONTENT did not, so an installed copy was the right number of BLANK cards, under the right
    subdecks, with no direction rows — and **the author's own copy was perfect throughout, so only somebody
    ELSE would ever have seen it.** Whole Mandarin deck, published, unreadable to everyone but its author.
    The fix is one line; the lesson is that the round-trip test has to publish a deck shaped like the decks
    people actually publish. Its typed section now asserts on the INSTALLED copy read out of the store —
    both templates, the type's CSS, the `<details>` in the back, every card typed, every card's field
    values, the nested `::` tree — and then that the deck DRAWS its direction rows, since a deck that lost
    its templates looks exactly like a deck that never had any.
    **A DECK PUBLISHED BEFORE THE FIX IS REPAIRED BY PUBLISHING IT AGAIN**: the upload deletes every card
    row and re-inserts, so there is nothing to migrate, and the version bump is what offers the update to
    anyone who installed the broken copy.
    **Two traps in reading the store back**, both of which made a healthy deck report as broken while the
    test was being written: a note record is `{ k, deckId, c }` with the card nested under `c`, and the
    SUBDECK and TYPE are not on it at all — they live in the deck record's own `index`, that being the whole
    point of the index (what a card IS, without its content).
    **Its DELETE section (Aug 2026) is the one that has to be read before it is trusted**, because every
    assertion in it fails silently on a real site: the deck vanishes from the author's own Studio either
    way, and only somebody ELSE browsing ever sees the difference. So it checks the author's Studio not at
    all and the SERVER instead — the row, its cards and the reader's install record all gone — then Bob's
    browse, then that Bob's installed copy survives on his own device. **One of those passed with the bug
    deliberately reintroduced and had to be fixed**: Bob's `#community` was reached by a hash-only `goto`,
    which is a same-document navigation, so the page repainted the browse results it already held — a list
    fetched before that deck was ever published, and an assertion that would have passed whatever the server
    said. It takes a real `reload()` now. Verified in both directions: with the bug deliberately reintroduced,
    **five of the delete assertions fail**, and they all pass with the fix.
    The orphan half plants a row straight into the mock's store, which is exactly what an orphan IS, and
    asserts the negative as well — a deck this device DOES hold is never offered for removal.
    **ITS LAST TWO SECTIONS ARE THE CROSS-DEVICE SYNC (Aug 2026), and a fresh browser context IS another
    device** — its own IndexedDB and its own localStorage, against the same account and the same server.
    Every assertion in them fails silently on a real site: a deck that never arrives on the second device
    is indistinguishable from a deck nobody installed, which is how the gap went unnoticed for a year. They
    assert that the account's decks arrive **and that only those do**, that **their cards came with their
    titles** — a deck row over an empty store reads as a working feature until somebody taps it — that
    **both devices file a deck under the same local id**, that a second boot adds nothing twice, that a
    removal travels (**while an author's DELETE still reaches nobody's device**, the two being
    indistinguishable from the client and only one of them a removal to mirror), that a deck added while
    signed out is announced at the next sign-in, and that an older install is **renamed onto the shared id
    with its review entry, its limits, its colour and its cards**, the rewrite reaching the account's own
    list. Verified by disabling `communitySyncSoon` and watching five of them fail.
    **THE MOCK'S PROGRESS ROW HAD TO BECOME STATEFUL FOR THE LAST OF THOSE** — it answered every GET with
    an empty blob, which on a real device is a boot that wipes the added-decks list, so no claim about
    `S.active` crossing devices could be made at all. Two things came out of making it real. A card check
    that STUDIED the arrived deck had to become a check on the STORE: the account's schedule travels too,
    so a session can honestly deal nothing and a study-path assertion would report a healthy deck as an
    empty one. And the upstream assertion has to **wait out the progress push's own debounce**, or it
    reads a device that has not spoken yet as one that never does.
    **TWO SEEDING TRAPS, both of which made a working feature report as broken**: `addInitScript` reaches
    only pages opened AFTER it is added, so "signing in" on a page that already exists means writing the
    session into that page's own localStorage and reloading; and a seeded `folio_v1` survives only until
    the app's next `save()`, so anything planted there must be followed by the reload immediately —
    a single navigation in between was enough to lose it.
    **Re-run after
    touching the publishing functions, `communitySyncInstalls` / `communitySyncSoon` /
    `communityFetchDeckById` / `localIdForRemote` / `uDeckInstall` / `uDeckUninstall`, `uDeckDelete` /
    `uDeckRemoteDelete` / `confirmDeleteDeck` /
    `myRemoteDecksLoad` / `orphanSectionHTML` / `uDeckSetColor` / `colorColumnMissing`, the shared-decks
    table on the Collections page (`COMMUNITY_COLS` / `sharedDecksHTML` / `wireSharedDecks`), or
    `.claude/supabase-schema.sql` — and keep the mock in step
    with the policies, since it is only a stand-in for them, never a proof that the real RLS is right.**
    **A "THIS DECK IS GONE" CHECK MUST BE SCOPED TO THE SHARED SECTION, NOT TO `document.body`** — the two
    lists now share one page, so a reader who INSTALLED the deleted deck legitimately still has its title
    on screen under "Your decks", and a body-wide search contradicts the very next assertion, which
    requires that copy to survive. It looks in `#sharedDecks`. Before the merge the page held nothing else
    and the loose version was harmless; it is exactly the kind of assertion a page merge quietly inverts.
  · `node .claude/test-deck-glossary.js` — 22 assertions on per-deck glossaries: the `glossMode`s,
    the popup, and above all **isolation** (a curated card never links a deck's term; a second deck never
    sees the first's), plus a hostile glossary in an imported deck. **Re-run after touching
    `glossSourcesFor` / `buildGlossIndex` / `uGlossSanitize`.**
  · `node .claude/test-i18n-lang.js` — **21 assertions**, in two halves. First the **English-only gate**, on
    the real app.js: `?lang=ja` does not switch the site, Settings offers no picker, a stored non-English
    language is migrated back, and not one translation file is fetched. Then the lazy per-language LOADER —
    the machinery kept behind `MULTILANG` — against an app.js the test's own server rewrites
    `const MULTILANG = false;` → `true` as it serves it, so the preserved code stays tested instead of
    quietly rotting until someone flips the flag back. **`patchApp` asserts the string was found**, and one
    assertion at the end reports it, so renaming the flag fails loudly here rather than leaving this file
    testing an app that can no longer switch language at all.
    **IT WAS REWRITTEN ON 2026-08-08 when the card `i18n` blocks and the gloss files were removed on
    request.** Roughly two-thirds of it described data that no longer exists — gloss-file parity, card
    translation parity, the per-language overlay and the bake — and those assertions went with the data
    rather than being propped up. What replaced them is the invariant the removal created: **the removal
    STAYS removed.** No card may carry an `i18n` block and no `gloss-<lang>.js` may reappear, because
    `add-card.js` and `add-lang.js` can both still write one and a card carrying translations costs every
    visitor its bytes in the eager path whether or not any reader can reach them. **Nothing else in the suite
    would notice** — that is the quotes.js mistake, and this is the only thing watching for its return.
    What survives beside it: chrome parity across the nine `ui-<lang>.js` (a batch that translates one
    language and forgets the rest still fails), one-language-in-one-language-out for the three families that
    still ship, that **no `gloss-` file is requested** (the 404 that caught the dead bundle fetch), that the
    game pools carry no INLINE translations, and that an English reader fetches nothing at all.
    **Re-run after touching `MULTILANG` / `langBundle` / `loadLangData` / `DATA_BUNDLES`, after adding a
    language, or after anything that writes card or glossary content.**
  · `node .claude/test-account-switch.js` — 22 assertions on switching accounts on one device, against an
    in-memory mock of the Supabase **auth + progress** endpoints (a test that really signed up would create
    users in the live project). It asserts both halves of the rule: a guest's study history still migrates
    into their FIRST account, and a newly created second account starts at level 1 with no badges, no streak
    and no heatmap — in the store, on the server row, and on the page (first-run hero, "0 unlocked"). **Re-run
    after touching `supaAfterSignIn` / `supaSignOut` / `supaBoot` / `_supaOwner` / `PROGRESS_FIELDS`,
    **or any of `supaSignIn` / `supaEmailForUsername` / `supaSwitchTo` / `supaRemember` / `supaForget` /
    `supaSetEmail` / `SUPA_ACCTS_KEY`** — a switch that carries the outgoing account's progress across is
    exactly what its `_supaOwner` assertions exist to catch, and nothing on screen would say so.**
    **Section 6 is the RECONCILE** (Aug 2026), added after a reader reported deck settings that "won't
    save" and the fault was blamed on their connection. It was not one. `supaBoot` AWAITS the progress
    pull and hands the row to `applyProgress`, which replaces every progress field — `deckOpts` among
    them — so a reader who pressed Save on a deck's Daily limits while that request was in flight had the
    change overwritten the moment it landed, silently, having just been toasted "Daily limits saved". A
    slow link only holds the window open long enough to hit every time, which is exactly why it reads as
    a network fault and is not one. The mock therefore grew a `pullDelay` knob: holding the one request
    boot waits on IS the reproduction, and nothing shorter reproduces it at all.
    **The two halves are asserted together because fixing one alone is worse than fixing neither** — the
    reconcile must still ADOPT another device's write when this device has been idle, that being the whole
    of last-write-wins, and a guard that refused every adopt would strand a reader's phone and laptop on
    different data for ever. So: an edit made during the wait survives, is the copy that reaches the
    server, and survives the next reload; AND an idle boot still takes the other device's 77.
    **A third assertion arrived on merging main and is the one that changed the fix.** The other device
    now also adds a second collection, so `deckOpts` and `active` must part company — the reader edits the
    first and never touches the second — and a reconcile answering with one blob or the other gets one of
    them wrong. That is not hypothetical: `setFriendCount` writes `S.friendCount` from the friends list,
    so a BACKGROUND write can make "something moved locally" true while the reader has edited nothing, and
    the original all-or-nothing skip would then push a stale blob over the other device's. The adopt is a
    three-way merge per field now, and the row count is what catches it — 2 with the merge, 5 without.
    The third assertion is the defect that made the first fire so often, and it is counted rather than
    observed: **a boot that is genuinely in sync must send no PATCH at all.** The reconcile compared
    `extractProgress()` — which appends `revlog` — against `row.data`, which never carries it, so the two
    could not be equal, the "in sync" branch was unreachable, and every signed-in boot re-uploaded the
    whole blob. Nothing on screen shows that; only a request count does.
    Two harness traps cost a run each. **Sign in BEFORE adding the deck**: signing in adopts the account's
    server progress wholesale — section 1's own subject — so a deck added as a guest first is discarded by
    the very mechanism under test, and the row the section needs is simply absent. And the suite now runs
    past two minutes, so give it a real timeout rather than reading the kill as a failure.
  · `node .claude/test-video.js` — 100 assertions on card + glossary videos **and the fullscreen viewer's
    gestures**: that every accepted link shape
    resolves to the embed this code builds and **every other URL resolves to no player at all** (the check
    that keeps an `<iframe src>` off untrusted input), that the frame is byte-for-byte the image's frame
    (computed border-radius / aspect-ratio / border / size), that the expand control opens the viewer and a
    click on the player does not, and that a community deck's `javascript:` video src is dropped on ingest.
    Above all it pins the **one-frame rule** from every side: a card or term given both renders one frame,
    a URL of one kind retires the other in the store *and* on screen, the tombstone survives a reload (the
    keystroke bug above), and Revert brings the shipped picture back. On the card surface it also pins the
    **auto-recognition**: the single `data-mediafield` box files a video link as a video and a picture link as
    a picture, says which it decided on, and offers no second empty frame. It also pins **what a dead link
    does** — the failure that is guaranteed rather than hypothetical, since there is no upload path: a
    same-origin 404 leaves the AUTHOR the frame, marked and worded, and leaves the READER nothing at all
    (`height:0`, out of the flow — not a blank 16:9 box), with a click on it opening no empty viewer.
    Both halves matter: hiding it everywhere would leave the author with no way to notice.
    **Its ninth section is the VIEWER'S GESTURES, and every assertion in it is made with REAL mouse and REAL
    touch on purpose** (Aug 2026): a synthetic `PointerEvent` dispatched at an element BYPASSES
    pointer-capture retargeting, which is the whole of the bug it exists for — `setPointerCapture` makes
    every later event target the STAGE, so the tap toggle's `e.target === im` was false for a real finger
    even dead centre of the picture and the close-on-backdrop branch took every press. **A synthetic version
    of these checks passes on the broken code**, verified by reintroducing the fault. It covers the click
    that must not close (on the picture and on the space around it), the tap that must zoom, the drag that
    must pan without toggling the zoom back, a CDP two-finger pinch with `.iv-live` on during it, and the ×
    as the only way out.
    **Re-run after touching `videoSource` / `cardVideoHTML` / `openMediaViewer` / `retireOther*Media` /
    the delegated `error` listener / `.media-dead` / the media panel, or the `media-src`/`frame-src` CSP.**
  · `node .claude/test-gloss-image.js` — 44 assertions on glossary images: the popup floats one to the
    top-right of the body within a 150px × half-the-popup box — the LIMITS, not the shape, since Aug 2026 —
    **shown whole rather than cropped** (`object-fit:contain`, and the rendered box keeping the file's own
    proportions), with the prose starting level with it rather than below it; it opens the SHARED fullscreen viewer and that viewer stacks **above** the popup,
    the curated editor's overlay delta survives a reload and clears cleanly, and a deck's own term images
    are sanitized on ingest (a `javascript:` src is dropped). **Re-run after touching `glossImage` /
    `renderGlossImage` / `setGlossImageEdit` / `uGlossSetImage`, or any z-index in the gloss/viewer stack.**
  · `node .claude/test-media-source.js` — 36 assertions on the media source gate: that an uncredited URL
    really is **absent from the store** rather than merely marked, that it is still shown to the author
    and flagged (so the gate reads as "not yet", not "nothing happened"), that leaving the URL field asks
    for the source and navigating away warns instead of losing it, that an answer commits the whole object
    at once, that **clearing the source takes the picture back out**, and that a shipped credited picture
    is untouched by any of it — on all four surfaces (the card's one media box with a picture in it, the same
    box with a video link in it, the curated glossary, the Studio term). **Re-run after touching
    `wireMediaSource` / `askMediaSource` or any media panel's wiring.**
    Its `typeInto` sets a field's value and dispatches `input` by hand: `page.fill()` can land on a box the
    URL keystroke has only just revealed and the value never arrives — and a programmatic value fires no
    `change`, so the blur-asks-for-a-source case dispatches that itself.
  · `node .claude/test-feedback.js` — 39 assertions on reader feedback: the About-page form (a message
    that reaches the row with its line breaks intact and its markup gone, the device-local cooldown, and
    that **the sender never supplies a triage status** — the client half of what the column guard enforces)
    and the Edit-page queue (the filters, that **no two statuses paint the same row edge**, the toggling
    swatches, the private note, the two-step delete, and that a session saved on the retired Accounts tab
    opens on Cards). Supabase is an in-memory stand-in, deliberately: the publishable key in app.js points
    at the REAL project, so a test that actually sent a message would write rows into it — and like
    `test-publish.js`'s mock, it is a stand-in for the policies, never a proof they are right. **Re-run
    after touching the feedback functions, the queue, or the `7) FEEDBACK` schema block.**
  · `node .claude/test-sources.js` — 74 assertions on source footnotes, on all three surfaces. Most of them are
    about the JOIN between the prose and the list, since that is where a footnote apparatus rots: a marker shows
    the number of the entry it actually opens, a bare marker takes the next number in reading order, and a marker
    pointing **past the end of the list is removed** rather than left claiming a citation the reader cannot follow.
    Plus: the fold is **open everywhere by default and remembers being shut** — in the store and across a reload,
    written by the header and never by a marker jump — the Atlas section is hidden outright when a place has nothing,
    a place cited by both its general and its year paragraph gets **one** footnote and not two, the citation text
    is `notranslate`, a hostile deck's `sources` are sanitized on ingest, and an admin's typed citations reach the
    overlay as a `sources` delta and come back after a reload. **A whole unwired surface is exercised too** —
    the fold replaced by a listener-free clone and every marker blanked — since that is the shape both reported
    failures took, and it is invisible unless something asserts it: on that clone the numbers still print, the
    header still toggles, **and the links and chips are still there**, because the list is serialized wired
    rather than fixed up after render. The editor's own sources panel is exercised as the rich rows it now is:
    a shipped citation's italics render rather than showing their tags, and the ribbon's **+Source** button puts
    an EMPTY marker in the background and a blank citation row below it in one press. The **access chip** is
    guarded too: one chip per
    labelled citation and none invented for an unlabelled one, open and paywalled told apart by class **and by
    colour** so the difference survives without reading the words, the chip outside the anchor so it can never
    read as part of the URL, and the brackets gone from the render while the stored string keeps them.
    **ITS STORE READ WAS LEFT BEHIND BY THE SPLIT AND HUNG RATHER THAN FAILING** (found Aug 2026 and fixed
    then; the fault predated the branch that found it). It read a card out of `d.cards[0]` on the `decks`
    record, which the split retired — cards live one per note in `notes`, under `c` — so the TypeError was
    thrown INSIDE an IndexedDB success callback, the promise never settled, and Playwright reported
    **"Resulting promise was garbage collected"** a minute later, naming a line number and no fault at all.
    The read is wrapped now so that anything going wrong comes back as a failed check. **A promise inside
    `page.evaluate` that can throw in a callback must resolve on every path** — otherwise a stale test does
    not report a stale test, it reports a timeout nobody can read.
    **Re-run after touching the `SOURCE FOOTNOTES` block, `wireFootnotes` / `sourcesHTML` / `normSources` /
    `linkifySrcItem` / `replaceInSrcText`, the `.src-access` styles, the editors' sources boxes, the
    community store's record shape, or the
    `fn` / `data-fn` sanitizer allowlists.**
  · `node .claude/test-layout.js` — 308 assertions on **the shell**: the rules that break silently because
    nothing throws when a layout is wrong. The phone's bottom tab bar (present, labelled — *every* tab, not
    just the active one, which is the top bar's behaviour — each name **centred under its own icon**, the
    selected one included, since one tab off out of five reads as a design; routing; no Library and no
    About, which the home page's banner and its grey line carry now; and gone while grading); the home
    page, which is now ASSERTED THE SAME AT BOTH WIDTHS and was asserted as opposites for a fortnight
    (one column, no pager, no card of the day, no gloss of the day and no Atlas teaser — none of which is
    BUILT at any width, watched on the desktop through the REQUEST LOG as well as the markup, since the
    teaser's ornament was the only thing outside the Atlas that fetched the ~1.6 MB globe; the Collections button standing under
    the bottom of the review group, centred, narrower than the group, routing to the collections and filled
    in the site's own `--indigo` read off a probe rather than hard-coded — and, since Aug 2026, sharing a
    `.rv-foot` line with "+ New group", which is asserted OUT of the banner while the chest is asserted out
    of it too and its notice IN a slot above it, both directions each, since a control that has stopped
    rendering looks from one side exactly like one that has moved; the
    Minigames heading over a 3 × 2 grid whose tiles carry no tagline; the About link last, routing to the
    About page and with room above and below it; no Seen total; the review's three Anki piles — new /
    learning / review, in order, no two
    the same colour, repeated unlabelled in the same colours on each added deck's row, with the button
    CENTRED against them; and that deck row on ONE line — every part in a single horizontal band, its
    figure reading `N/N studied`, its bar underlining the row instead of taking width from it, and the
    deck's NAME not cut off at 390px, that being what gives way if the arithmetic ever stops working) and the same page above the breakpoint, where the only thing that may differ
    is the About line (a desktop reaches About from its top bar) and where `#decks` must still RESOLVE with
    no tab left pointing at it;
    the whiteboard marker on a phone (clear of the tab bar, no Draw button, the sizes toggling the pen,
    **opening the tools selecting NOTHING and choosing a tool being what starts drawing** — asserted in
    both places the marker is exercised, and both halves each time, since they fail in opposite directions
    and "nothing is selected" alone would also pass on a marker that had stopped working; the
    custom colour picked in the inline picker — its hue bar setting the hue, its field the saturation and
    brightness, the choice surviving the session, and **no `input[type=color]` anywhere**, which is what a
    revert to the platform dialog would look like — and **Reveal answer and the grade row still tappable with
    the pen down**, which is the assertion holding up the hit-test in `setupWhiteboard`); the Atlas place sheet
    (**opening SHUT since Aug 2026** — its name, a chevron, under a third of the screen — the chevron
    revealing the sections, and then drag-to-resize: taller, capped at the top of the screen, its title bar
    still showing at the floor, the NEXT place opening shut too, and the dragged height being what the
    chevron opens TO. **The shut assertions have to come FIRST and the fit checks have to open it**: with
    the sheet shut `.cp-cols` is `display:none`, so every measurement of it reads zero and the content-fit
    checks pass on nothing at all — which is how they went on passing for a run after the behaviour
    changed under them); the daily quote keeping its height — and everything under it its
    position — when flipped to its original language; the Atlas panel's discovery chip sharing
    the title's row and its sections likewise unskippable; the CHAIN of
    things anchored to the bottom of the viewport, where the globe stage, the Atlas timebar and the tab bar
    are stacked by arithmetic over `--timebar-h`/`--tabbar-h` and each edge must meet the next exactly, at
    three widths; the rail's year labels never overlapping at four widths, with the two ends always kept;
    the Atlas search and legend as chips covering under 3% of the map, opening and closing again; the
    Settings page carrying NO language picker while the site is English-only, with the light/dark switch
    beside it untouched — and a language stored before the picker went being brought back to English on
    load, which is the one way removing a setting can strand somebody; the
    one-row grade bar and the study page's padding clearing it — and its two HEIGHTS, where dragging the grip
    down must genuinely halve it (a "compact" state saving 15px is not what was asked for), leave the four
    grades as bare colours that a screen reader can still name, keep the ? and Suspend beside them rather
    than dropping them, and take the page's bottom padding down with it — note that the fold is ANIMATED
    since Aug 2026, so a height read sooner than `GB_FOLD_MS` after the press measures a state half way
    between the two — which is also how the fold is asserted to EASE rather than cut, by reading a
    mid-flight height and requiring it to sit between the two settled ones; the shortcut digits and the
    `?` bubble's keyboard line present in the markup and hidden on a phone (both halves, since a removal
    and a hidden element look identical from one side); the Text size setting, which is a SLIDER filling its row (asserted, that being the
    visible half of the request) and which must
    grow the card and the glossary popup and must leave a tab label and a grade button exactly where they
    were, that being the difference between a reading scale and a page zoom; Settings and Account filling the stage;
    a coming-soon collection carrying no level badge and no XP bar, and a live one stating its size ONCE —
    the bar and no `.collection-count`, with a DECK row inside asserted the other way round, since a count
    with no bar and a bar with no count are opposite regressions; and **no overlay outliving the page
    that spawned it** — a real level-up is raised (three cards graded Easy) and dismissed by a HASH CHANGE,
    never a click, since a click would dismiss it anyway and prove nothing.
    **Re-run after touching `.tabbar` / `--tabbar-h` / `--timebar-h` / `layoutTicks` / the Atlas chrome's
    media queries / `.settings` / `.auth-split` / the coming-soon rows / `wireOnePageSwipe`
    / `.home-collections` / `.games-sec` / `.home-about` / `gameSub` / `pileCounts` / `adProg` / `.active-deck` /
    `gbWireResize` / `.gb-fold` / `body.gb-compact` / `wirePageSwipe` / `SWIPE_ORDER` /
    `makePageGhost` / `clipStageFor` / the `.page-next`/`.page-prev` keyframes /
    `applyTheme`'s `data-fs` / `var(--fs)` / `.fs-slide` / `#fsRange` / `MULTILANG` /
    `ensureWBTools` / `.wb-pick` / the `.wb-toggle` click handler /
    `wbDefaultPos` / `wbGoHome` / `wbStopHome` / `.wb-homing` / `.tab .tab-label` /
    the ink layer's pass-through /
    `GB_FOLD_EASE` / `flipHeight` / `.gk` / `.ghb-keys` / the `*-mode` list on `.admin-list-items` /
    `cpWireResize` / `cpPaneNeedH` / `cpFitH` / `lockHeight`, or after adding an overlay to `document.body`.**
    **`studyEasy` PUTS A COLLECTION IN THE REVIEW FIRST** (Aug 2026), through the collections page's own +:
    the first-run hero routes there now rather than choosing a subject for the reader, so nothing studies
    until something has been added, and every section that wanted a card was reporting an empty page.
    **Section 8 watches the CHEST, not `.levelup-pop`** — the Reliquary retired that path deliberately
    (`announceLevelUps` calls `grantChest()` and `openChestPop({level})`, the chest overlay BEING the
    celebration), so the old assertion could only ever count zero and had been failing on a feature working
    exactly as designed. `congratsPopup` is not dead code — it survives for anything else that wants it and
    `closeCongrats` is still in `render()`'s close list — but nothing reaches it from a level-up, so
    asserting it here was testing an unreachable path. The level is checked ON the overlay (`.chest-lvl`),
    or this would pass on any chest at all rather than on the level-up that raised one. Its clicks go
    through `evaluate`
    rather than `page.click`: clicking an element the
    CSS has hidden waits 30s and then THROWS, and a missing chip is exactly what some of this is here to
    catch — it has to report, not abort the file. Verified against six deliberately reintroduced
    regressions (a no-op `layoutTicks`, the chip's source-order bug, the collapsing labels, a `render()`
    that forgets `closeCongrats`, the tab label's two-class rule, and the marker's transitioned default
    probe); each was caught. **That last one is worth knowing before adding to the marker section**: the
    settled position could NOT see it — clearing the stored position afterwards hands the marker to the
    stylesheet and it ends up right whatever the slide aimed at — so the assertion had to read the inline
    right/bottom MID-FLIGHT. A first cut asserted the finished position and passed with the bug
    reintroduced, which is a test that would have shipped the fault back the next time somebody touched it.
  · `node .claude/test-discovery.js` — 22 assertions on the counting behind the discovery chips and the
    "Beyond the cards" meters, run against the **real** `world.js` / `timeline.js` / `glossary.js`: that a
    register full of historical territories can never push the country figure past its own total, that a
    retired glossary term drops out of the count, that an unloaded `world.js` yields an honest unknown
    rather than a confident zero, and — the assertion most likely to fire on someone else's change — that
    **`SEEN_CAP` still clears the shipped universe with room to spare**, since every geo era added to
    `timeline.js` grows it and a prune would make a completion count go backwards. **No browser and no
    dependencies.** Re-run after touching `markSeen` / `SEEN_CAP` / the `*SeenCount` helpers, **and after
    adding a timeline era or a batch of glossary terms** — the sizing, not just the logic, is what it
    guards.
  · `node .claude/test-a11y.js` — the accessibility floor (Aug 2026), and every one of its three passes covers
    something that fails SILENTLY. **Names**: every visible control resolves an accessible name, which in a UI
    made largely of SVG is the commonest screen-reader failure — an icon-only button with no `aria-label` is
    announced as "button" and nothing else. **Keyboard**: every control is in the tab order, a non-native one
    declares a role, the first Tab lands on the skip link, and — operation, not merely reach — a `.switch`
    answers to Space and reports its state, a `.ttip` opens on Enter. **Contrast**: every text node's computed
    colour against the paper it ACTUALLY renders on (the ancestor walk, alphas composited), at 4.5:1, or 3:1
    for large text. Measured live rather than from the token table, so a rule that re-tones something in one
    theme is caught. The default mode is REPORTED — the quiet tokens are quiet on purpose and the high-contrast
    mode is the answer to them — while **with `body.hc` on, nothing may fall short**, which is the assertion.
    **Re-run after touching a control's markup, `body.hc`, or any theme's colour tokens.**
  · `node .claude/test-card-plans.js` — 150 assertions on **the join between the eleven card plans and
    `data.js`**, which is what makes "generate the next `<collection>` card" work. Everything it guards
    fails SILENTLY, and the worst of them is not a crash: **a plan naming a deck id the tree hasn't got
    makes `add-card.js` file the card in the FIRST leaf of the whole tree, which is `cn-myth`, in
    China** — nothing throws, and the card sits in the wrong collection until somebody notices. It also
    asserts that no leaf in `data.js` goes unnamed by a plan (cards could never be routed there), that
    each running order covers **the numbers its own collection declares** with no gaps and nothing
    outside them, no duplicate ids and no two cards naming the same
    topic, that CLAUDE.md carries every plan and a working next-id command, and that the **index table**
    under "Generating cards & glossary entries" still matches the tree. **No browser and no
    dependencies.**
    **A COLLECTION NEED NOT BE A THOUSAND CARDS, and the numbering is DECLARED rather than assumed**
    (Aug 2026, adding Geography). The check was a flat 1–1000, which is right for the ten planned
    histories and wrong for a deck of fifty states and their fifty capitals: `PLANS`' third element is
    now either `1000` or a list of ranges (`[[1,50],[501,550]]`), and a number outside the declared set
    fails too — a mistyped one otherwise reads as a card the plan does not have. Two things it had to learn, both of which made a first draft report faults that were
    not there: **a `##` heading may name a FLAT DECK** — a deck that is itself a leaf (`gr-iron`,
    `ru-federation`, `cn-myth`) — so reading only `###` misses it and reading `##` as always-a-leaf
    misfires on the branch decks; and **`docs/world-history-card-plan.md` carries an appendix**, the
    2026-08-04 renumbering record, whose 109 old-numbering ids are not the running order, so the list
    must stop at the next `#` heading. Verified against four deliberately injected faults (a renamed
    leaf, a duplicate id, a broken next-id command, an unplanned leaf) plus a stale table count; each
    was caught. **Re-run after editing a plan, after changing a tree in `data.js`, and after adding a
    collection.**
  · `node .claude/test-daily-quote.js` — 7 assertions on the home page's daily-quote running order: it
    simulates 400 days off the real `QUOTE_ORDER` and checks every seven-day window in them, so a repeat
    two days running or a third appearance inside a week fails here rather than on the live page. **No
    browser and no dependencies** — the pieces are sliced out of `app.js` and run in a `new Function`.
    The rule is a property of the ARRANGEMENT, so it breaks silently: **re-run after adding or removing
    quotes** (a fifth Confucius line tightens the pool) as well as after touching `quoteRunningOrder`.
  · `node .claude/test-streak-chest.js` — 18 assertions on the weekly streak chest (Aug 2026). **No browser
    and no dependencies**: `bumpStreak`, `maybeStreakChest` and `streakChestProgress` are sliced out of
    app.js and walked over patterns of days, because a chest is earned on the SEVENTH day of a run and no
    single-session browser test can walk a fortnight. Every way this can be wrong is silent — a chest not
    granted looks exactly like a chest not yet earned. **Its central assertion is the fault it was written
    for**: a streak that reaches seven, BREAKS, and climbs back to seven must earn a second chest, which it
    did not until `bumpStreak` learned to clear `S.streakChest` with the count (a count rather than a date is
    what makes the grant idempotent against an undo, and is exactly why it has to be cleared). Verified in
    both directions by reverting that one line. It also pins the meter's off-by-one — day seven reads 7 of 7
    rather than 0 of 7 — and that a length already paid at is never paid twice.
    **The harness lesson is worth carrying: stub `Date` as well as the clock helpers.** `bumpStreak` asks
    `Date.now()` what yesterday was, so without it every simulated day reads as a break and the streak never
    passes 1 — which is what the first run reported, and is a fault in the test rather than in the code.
    **Re-run after touching `bumpStreak` / `maybeStreakChest` / `streakChestProgress` / `STREAK_CHEST_EVERY`
    / `S.streak`.**
  · `node .claude/test-scheduler.js` — 136 assertions on **the schedule itself**, which is the thing a study site is
    most worth getting right and the thing that fails most silently: a wrong interval is still a number on a button,
    and a card that graduates a step early looks exactly like a card being studied. Nobody reports it; they just learn
    less. So it is pinned as ARITHMETIC — the pure `THE SCHEDULER` block is sliced out of app.js by text and run in a
    `new Function`, the way `test-daily-quote.js` takes `quoteRunningOrder`. **No browser and no dependencies.** It
    covers the learning ladder (a new card's Good is 10 minutes, not a day; the second Good graduates; Hard is the
    midpoint of the first two steps), the review formulas, the ordering guarantee **Hard < Good < Easy over 1,600
    interval/ease combinations**, days-late credit, lapses and relearning, that **every button shows exactly the
    interval grading it will apply** (360 cases — the property the card-seeded fuzz exists to give), that older records
    back-fill, that the block is pure and reads no global, and that **no state × grade is ever scheduled into the
    past** (24 cases). Its two finds were both invisible on the page: the Hard<Good<Easy floor walking Easy past the
    maximum interval, and a preview that read the live clock while the grade took the passed one, so an overdue card
    previewed one interval and scheduled another. **Re-run after touching anything named `sched*`, `SCHED`,
    `fmtInterval`, or the load map (`loadMapNow` / `easyDays` / `LOAD_AVOID` / `LOAD_NEAR`)** — and note that the end-to-end half lives in `test-review-decks.js` section 6.
    **Sections 10 and 10b are FSRS**, and they are a different kind of check from everything above them: the arithmetic is
    compared against `.claude/fsrs-vectors.json`, generated by the reference implementation, to 1e-9 over 768 steps —
    stability and difficulty at every step of 256 seeded histories, plus the forgetting curve and the interval formula.
    **A fixture regenerated to match a change proves nothing**, so `gen-fsrs-vectors.py` is re-run only when deliberately
    moving to a new FSRS version. 10b adds the properties a fixture cannot state (recall never loses stability, a lapse
    never gains it, difficulty stays in 1–10, nothing lands in the past, seeding takes the interval and not the ease) and
    that the mode selection reads the deck. **The slice ends at `/* ---------- SRS ---------- */`** — the four impure
    config lookups live below it, and the purity assertion is what caught them being written above it.
    **Section 10c is the OPTIMISER**: the loss to 1e-9 against the reference's own `_compute_batch_loss`, the reference's
    clamp bounds, both refusals, and a **recovery** test — history generated from a known parameter set must be predicted
    better than the defaults on a held-out tail, which is what stands in for a reference check on an output two gradient
    descents can never agree on. It also pins that the stepwise and one-call forms land on the same parameters, and that
    fitting mutates neither the defaults nor the history handed to it.
    **Section 11 is LOAD BALANCING and EASY DAYS**, and its two sharpest assertions are properties rather
    than values: that the balanced day is ALWAYS inside the fuzz's own range (so turning it on cannot
    lengthen or shorten a schedule), and that **Hard < Good < Easy survives it** over every interval and ease
    with a deliberately lumpy pile — the three ranges overlap, so the balancer can hand back the same day for
    two grades and only `schedPass`'s floor separates them, which is what would break if the balancing were
    moved below it. It also re-asserts that the **preview still schedules what it says** with a map in play,
    that a marked day is AVOIDED rather than forbidden (every day marked still schedules, in range), and that
    with no map the result is byte-for-byte the fuzz it always was.
    **The fixture's step count is now DERIVED from the fixture** rather than written down (`walked === wantWalked`) —
    widening the grid, which is exactly what adding fractional gaps did, must not fail on an arithmetic constant.
  · `node .claude/test-cards.js` — **flags, Set due date, Forget and the card browser** (114 assertions,
    Aug 2026), in two halves for the reason `test-card-types.js` is. The **pure** half slices `schedSetDue`,
    `schedForget`, `parseSetDue`, `browseTokens` and `browsePredicate` out of app.js and runs them with no
    browser at all — a scheduling rule reads far better as a failed comparison than as a screenshot — and its
    sharpest assertions are the ones no screen could report: that a forgotten card KEEPS its record (deleting
    it would put the card back to new just as well and silently take back a level, Folio's XP being the
    number of distinct cards studied), that a card given a due date comes out as a REVIEW card (left in
    learning, the very next grade walks the steps and overwrites the date), and that a forgotten card walks
    the learning steps again, which is a property of the pair rather than of either function. On the search:
    that an **empty query matches everything** and a **nonsense one matches nothing** — opposite failures,
    each of which looks like "the search is broken" from one side only — and that an unknown operator stays
    free text rather than being dropped. The **browser** half drives a real one: the flag chord in both
    directions, that flagging a REVEALED card leaves it revealed (a `render()` here would un-reveal it),
    Card info's four actions and its re-opening on the state it has just changed, the search, the sort and
    its reversal, a bulk action reaching the selected card, and **both ways in** — the SIGNED-OUT account
    page and a deck's options sheet, asserted separately because they serve different readers and fail
    differently.
    **ITS TWO DUE-DATE ASSERTIONS COUNTED HOURS WHERE THE SCHEDULER COUNTS DAYS, so they passed every morning
    and failed every afternoon** (fixed Aug 2026). Anything scheduled in DAYS lands at the START of its day
    (`schedDayDue` / `cfg.dayAnchor`), so `Math.round((due - Date.now()) / 864e5)` is a day short of the figure
    the reader asked for from midday onwards — "9! puts the card nine days out" reported 8 at 21:51 UTC with
    nothing whatever wrong. Both now round the difference between the two DAY STARTS, which is what "nine days
    out" means and is what the reader sees. **A test that reads a clock has to read it the way the code does**;
    a failure that depends on the hour reads as an intermittent bug and is the most expensive kind to chase.
    **Re-run after touching `schedSetDue` / `schedForget` / `parseSetDue` / `browseTokens` /
    `browseTerm` / `browsePredicate` / `browseRowData` / `BROWSE_COLS` / `PAGES.browse` / `openFlagSheet` /
    `openSetDueSheet` / `openForgetSheet` / `openCardInfo` / `cardFlag` / `setCardFlag` / `S.flags`, or the
    account page's and the deck sheet's entries.**
  · `node .claude/test-revlog.js` — 58 assertions on **the per-review log**, Card info and the Answer-buttons
    card (Aug 2026), and every one of them is for a silent failure: a log that stops being written throws
    nothing and looks exactly like a reader who has not studied, and a duration that stops being measured
    leaves a card of dashes that reads as a reader who answers instantly. It reads the row off the **SHIPPED
    SAVE** rather than from a function sliced out of app.js, because an encoding only its writer and its
    reader agree about is exactly the thing that drifts — eight fields, the documented order, minutes for
    both intervals, tenths for the duration, the cap. Its sharpest assertion is the one a count cannot make:
    **undo must take back ITS OWN row**, so two reviews of the same card are logged and the row that survives
    is checked to be the FIRST — "remove the last row" passes a count check and fails this. Card info is
    exercised in **both** its states (a card with history shows the table; a card whose reviews predate the
    log shows its state and says why), since those fail in opposite directions and either alone would pass on
    a panel that had stopped working. The Answer-buttons card needs a SESSION, so Supabase is
    `test-account-page.js`'s `page.route` stand-in, and for the same reason: the publishable key in app.js
    points at the real project. **Re-run after touching `logReviewEntry` / `revRead` / `revForCard` /
    `revWindow` / `grade()`'s logging / `shownAt` / `undoRevRow` / `openCardInfo` / `answerButtonsHTML`.**
    Two things it had to learn, both of which made a first draft report faults that were not there:
    **`#study` is deliberately not a restorable hash**, so a session can only be started through the review
    banner; and a card-info panel must be exercised on a card the SESSION IS ACTUALLY SHOWING — seeding a
    record for the queue's first card and then reloading makes the test depend on the order the scheduler and
    the seed happen in, so it seeds every card the deck might deal instead.
  · `node .claude/test-date-line.js` — 13 assertions on the card date line, run against the real `data.js`:
    that every shipped card's `answerDate` is still a LIST OF DATES and not the paragraph it replaced
    (the check is content-aware, since an old date line wore exactly the same tags), that the limits in
    `date-line.js` still describe a glance, that every card stating a date still yields a sort year from
    it — four cards on the pre-conversion data yielded none — and that **no card naming a deep date sorts
    by the year it was dug up**, which is how Atapuerca came to sort at 1978 CE. Plus the compact
    notation itself: `BP`, `cal BP`, and the ranges that write their unit once, where reading only the
    closing number sorts a card from the wrong end of its own era. **No browser and no dependencies.**
    Re-run after touching `cardYears` / `date-line.js`, **and after any batch of date lines** — the field
    is edited card by card and grew into a paragraph the same way.
  · `node .claude/test-review-decks.js` — the daily review's decks and the study session that comes out of
    them (Aug 2026). Everything it guards fails SILENTLY: nothing throws when a review quietly takes all its
    new cards from one deck, when a reload drops a session on the floor, or when a long press does nothing.
    It asserts that **both added decks contribute** to the day's new cards and that they are drawn at random
    across them (the bug this replaced sliced the whole allowance off the front of one deck's list — so it
    STUDIES the whole review through and reads back which deck each card came from, since a queue that looks
    right can still have been built wrong); that a deck's row shows **its own remaining allowance** rather
    than its share of the pooled review; that a **reload stays in the session**, on the same card, asking the
    same phrasing, still turned over if it was turned over, and that leaving forgets it so a bare `#study`
    goes home; that the **phrasing chevrons** change the question and the change sticks; that holding a row
    opens **Custom study / Daily limits / Skip today / Remove** and each does what it says, the bin having
    gone; and that the **Folio level caps** the decks a review will take — with the shipped default
    `S.active` (a deck of the coming-soon China collection) NOT filling that one slot.
    It also pins the **review's own limits** (Aug 2026): the banner's sheet carries the deck sheet's rows
    minus Remove, its Daily limits opens on the REVIEW and shows the allowance it is actually using, its
    default is the WIDEST deck's rather than a global figure (two decks at 5 draw 5, from the ten between
    them), and an explicit limit set there caps the pooled draw **without changing what a deck offers when
    tapped on its own** — which is the distinction the whole design turns on and which nothing on screen
    states. **The banner's own COLOUR joined that block in Aug 2026**: its sheet's row list is pinned
    EXACTLY, which is what catches a row appearing or vanishing (Colour did, on request, and the pinned list
    is how it was noticed), and the colour itself cannot be asserted as a value — the banner rotates through
    a hue a day — so what is pinned is that **choosing one overrides the rotation, survives the home page
    being rebuilt, and that clearing it hands the rotation back**. It is read off the element's own `--tile`
    rather than out of the store, so it measures what a reader sees; the two palettes are disjoint, which is
    what makes the "cleared ≠ chosen" comparison safe. **Persistence is checked by NAVIGATING AWAY AND BACK,
    never by `reload()`** — this file seeds `folio_v1` through `addInitScript` on every load, so a reload
    puts the seed back and reports a working feature as broken, which it did once while this was being
    written. The re-render is the real risk anyway: the banner's markup is rebuilt on every repaint. **Section 6 (Aug 2026) pins THE LEARNING STEPS end to end**, in a real session, where
    `test-scheduler.js` pins their arithmetic: a new card's Good button offers minutes rather than a day and
    the four buttons are four different answers (on the old scheduler three of them read `<10m`), one Good
    leaves the card learning on its second step, **the same card comes BACK later in the session**, and a
    second Good graduates it to tomorrow. Two things it must keep doing: **track the card by ID out of the
    session record**, never by the question on screen — that is a different one of the card's three phrasings
    each time it is shown, so comparing the prose reports a card that never returned when it returned wearing
    another sentence — and assert the banner's **"Start"** button on a reader who has STUDIED, since with no
    cards graded at all the banner is the first-run hero and its button says something else entirely.
    **Section 8 (Aug 2026) pins DRAGGING THE LIST INTO ORDER**, driven with real mouse input so the pointer
    capture, the `touch-action` and the 4px slop are exercised as a hand exercises them: every row carries a
    handle wherever the LIST holds a second row (it used to be wherever a LEVEL did — too narrow since a row
    can be dropped into a group), a drag moves it, the order is written down under that level's own key, **every subtree travels with the row it belongs to** (rebuilt from the depths — a
    collection dragged out of the middle leaving its decks behind is the failure this is for, and the list
    looks perfectly ordinary when it happens), no transform is left behind, the rounded corner follows
    whichever row is last NOW, ↑/↓ do it from the keyboard, and **the Collections page keeps the editorial
    order**. Persistence is proved by carrying the saved blob to a page that has never seen the list — a
    reload cannot show it here, since `newPage` re-seeds `folio_v1` on every load and would put the seed's
    own order back. **Sections 9 and 10** pin the day's default allowance at FIVE new cards — in the store, and
    on the control that shows it, which since Aug 2026 is the Daily limits dialog's "All decks" tab rather
    than a Settings stepper (both halves asserted: the stepper is GONE from Settings and the figure is on
    the tab, since either alone would pass on a move that had only half happened) — and that **every
    Multiple Choice round asks its card's FIRST phrasing** — with a second assertion that the cards it drew genuinely
    carry others, or the first passes on cards that have only one. **That comparison strips parentheticals
    from both sides**: the units pass rewrites every text node, so a card asking about "140 metres (460
    feet)" renders without the bracket, and 20 of the deck's cards carry one in their first phrasing — an
    exact string match passed on most runs and failed on the rest, which is worse than not asserting it.
    **Section 11 (Aug 2026) pins GROUPS**, and almost everything in it fails silently: a group that studies
    nothing looks like a group, a colour that reaches the header and not the decks inside looks like a design
    choice, a deck counted by both its collection and the group it moved into shows the reader the same five
    new cards twice, and a drop that lands as a REORDER rather than a nesting just looks like a drag that did
    not take. It asserts an added collection drawn as a header (and NOT a collection the reader never added —
    that is a signpost, and making it a counted, tappable header would offer them a collection they did not
    ask for), the sheet's Rename / Colour / Ungroup and the absence of the daily-allowance rows, a real-mouse
    drag lighting the group and landing inside it, the CARDS moving with it — the group's header count up by
    exactly what the collection's went down — the colour reaching every deck inside, the whole arrangement
    surviving a move to another device, tapping a group studying its cards, and **Ungroup leaving the decks in
    the review**. Two things it must keep doing: **open every fold first** (an added collection seeds SHUT, so
    without it the only visible rows are two headers and there is nothing to carry), and **drag a LEAF whose
    parent keeps a sibling** — a leaf carries no subtree so the group's count IS that deck's, and a container
    left with another child stays a header whose own count can be read before and after. **Those counts are
    read off each header's `.dk-prog` `data-total` since Aug 2026**, the header having given up its "N cards"
    line for a progress bar like the rows inside it — the same number, from the row's own reckoning rather
    than the test's.
    **Sections 12–15 are FSRS end to end**, where `test-scheduler.js` has the arithmetic: the Scheduling sheet
    (both modes offered, the retention and parameters boxes drawn only under FSRS, a parameter list of the wrong
    length refused with a reason, the sheet fitting the screen, and the focus following the CHOICE rather than
    the click — the `data-dmfocus` race); that a card graded under FSRS gains a stability and a difficulty and
    that Card info then shows those instead of the ease and names the scheduler; **that one deck on FSRS and
    its neighbour on SM-2 are each scheduled their own way from the POOLED review**, which is the whole of what
    "deck-specific" means and which no unit test can see; that turning FSRS on mid-deck **seeds stability
    from the existing interval** rather than starting the card over; and (section 15) what **Card info** says
    about an FSRS card, read off the rendered panel because both of its faults were in the wording rather than
    in the numbers.
    **Sections 18–20 are the Aug 2026 study-flow batch**: `mixPiles` sliced out and walked as a pure function
    (both piles' own order preserved, neither pile ever exhausted early) and then a REAL session read back to
    prove the day's new cards genuinely arrive among the reviews rather than after them; that suspending a new
    card refills the day rather than costing it one; and that undo steps back exactly ONE card however fast
    the button is pressed twice.
    **ITS FIXTURE PICKS TWO LEAVES OF ONE COLLECTION, AND FOR A FORTNIGHT IT DID NOT** (Aug 2026). Sections 8
    and 11 need a level of the review list holding more than one row — a reorder needs two siblings and a
    group needs a deck to carry into it — and the flat "first two leaves anywhere" rule stopped supplying one
    the day the China collection was opened: `cn-myth` and `wh-evolution` are leaves of DIFFERENT
    collections, so each parent had exactly one child and there was nothing to rearrange. **Nothing said so.**
    The drag section quietly reported the top level instead, and the group section's `geo` finder returned
    null, reached `document.querySelector(...).dispatchEvent` inside `page.evaluate` and **aborted node**, so
    every section after it — including the three new ones — silently never ran at all. Two fixes, and the
    second matters as much as the first: the leaves are chosen preferring a pair under one root, and the
    group section is a **labelled block** that `break`s with a printed SKIP when there is no deck to drag.
    **`return` would have been the same bug again** — these sections are bare `{ }` blocks inside one async
    IIFE, so returning skips every later section. **A test that takes the process down is worse than a test
    that fails**, and a fixture derived from shipped data goes stale the day the data changes.
    **Section 17 is LOAD BALANCING and EASY DAYS in Settings**, where test-scheduler has the arithmetic: that
    both are **OFF by default** (the assertion most worth having — they change what the scheduler does, and
    an existing reader's intervals must not move because they updated), that the seven days are drawn
    Monday-first while being STORED Sunday-first by `Date#getDay` index (a conversion nothing on screen would
    report getting wrong), and that the row STACKS rather than squeezing its own description to one word a
    line, which is what looking at the page found.
    **Section 16 is the OPTIMISER's path**, where test-scheduler.js has its arithmetic: the button under FSRS and
    NOT under SM-2, a fit that runs to a verdict without freezing the sheet it lives in, 21 parameters STAGED in the
    box with nothing saved until Save is pressed, and the too-little-history refusal naming both numbers. Its log is
    synthesised in the shipped row shape with **every card starting at state 0**, since a sequence whose beginning is
    missing is dropped — which is the likeliest way to make the whole thing silently refuse.
    **SECTION 15 SEEDS ITS CARD'S MEMORY STATE AND ITS ONE LOGGED REVIEW rather than grading into them**, and
    that is this file's own `addInitScript` warning being obeyed after ignoring it cost two runs: grading the
    deck's only due card ENDS the session and the completion screen has no Info button, while re-entering a
    session needs a `reload()` — which re-seeds `folio_v1` from `state` and throws the graded record away. The
    panel then honestly showed `Ease 260%`, the seeded SM-2 value, and read as the FSRS rows having been lost.
    **In this file, the state to look at is the state that is seeded.**
    **Re-run after
    touching `reviewQueue` / `reviewLimits` / `REVIEW_ENTRY` / `deckLimits` / `globalLimits` /
    `mixPiles` / `orderPile` / `DECK_ORDERS` / `deckOrderMode` / `setDeckOrderMode` / `sortByDifficulty` /
    `refillAfterSuspend` / `UNDO_GUARD_MS` / `studyHold` / `clearStudySession` /
    `clearDeckLimits` / `deckDoneToday` / `entryPiles` / `openDeckMenu` / `openDeckLimits` / `addActive` /
    `maxActiveDecks` / `STUDY_KEY` / `qIdx` / `S.deckOrder` / `orderedIds` / `setupDeckDrag` /
    `S.deckGroups` / `S.deckNest` / `groupCreate` / `groupDelete` / `setNestParent` / `nestChildren` /
    `openDeckSched` / `setDeckSched` / `setDeckRetention` / `setDeckFsrsParams` / `schedModeOf` /
    `deckSchedCfg` / `cardEntryId` / `schedCfgFor` / `revFetchAll` / `fsrsSequences` /
    `defaultState().settings.newPerDay` / `buildChallengeQuestions`, `buildSession`'s per-deck allowances,
    or anything named `sched*` or `fsrs*`.**
  · `node .claude/test-atlas-places.js` — the Atlas's label crowding, its heightmap strength slider, and a
    glossary term's way onto the map (Aug 2026). All three fail silently: a map that quietly writes forty
    overlapping names looks like a map, a slider that does nothing looks like a slider, and a marker that
    flies you somewhere and highlights nothing looks like a flight. It asserts that the shipped
    `GLOSSARY_PLACES` coordinates are all PLAUSIBLE (a `[0,0]` is what a failed fetch leaves behind) and
    that the country join shipped with them; that `CITY_SEP` falls with zoom and starts at a whole region
    — sliced out of app.js by text, since the labels are drawn on a canvas and there is nothing in the DOM
    to measure, the same technique `test-daily-quote.js` uses; that the slider is hidden while the layer is
    off, live while it is on and remembered; that a point term and a country term show the marker and a
    term that is neither does not; and that pressing it reaches the Atlas, closes the popup and opens **no
    info panel** — the reader has just read the term, and a second description is not what the marker
    offered. **Re-run after touching `glossPlace` / `focusPlace` / `CITY_SEP` / `computeCityLayout` /
    `gsIndex` / `hmOpacity`, or after re-running `.claude/fetch-place-coords.js`.**
  · `node .claude/test-map-cards.js` — **the geography map-card format** (76 assertions, Aug 2026), half of it
    with no browser. Everything it guards is silent on the page. **The FIT**: a map that does not frame its
    state still draws a globe — the reader gets an ocean, or a continent with a speck in it — so it sweeps
    all 51 shapes and asserts each fills a useful part of its window without overflowing, that Alaska's fit
    ignores the rings across the antimeridian, and that **at most one entry sits at the zoom ceiling**, which
    it names (the District of Columbia). **The RESOLUTION**: a floor on Rhode Island's vertex count and on
    the layer's, which is what fails if somebody re-syncs the tolerance to world.js's and turns the bay back
    into three spikes — no count of states or rings can see that. **The BEHAVIOUR**: dragging turns the globe
    and does not zoom it, the three buttons do what they say, recentre returns EXACTLY to the opening view,
    and a click opens no place panel and no popup of any kind. **The SERIALIZER**: `map` and `facts` carried
    by `serializeCardData` and restored by `revertCard`, read out of app.js by text — a whitelist that drops
    a field strips it from every card on the next admin keystroke. Plus that map cards are out of
    `gameCardIdSet`, that `us-states.js` is lazy and not in `index.html`, and that each card's key names a
    shape the layer actually has.
    **ASSERT THE VIEW, NOT PIXELS** — `_folioMap.view()` exists for this. An earlier drag check compared two
    sampled pixels and reported "the drag did nothing" on a globe that had turned four degrees, both samples
    having landed on the same flat fill. **And its copy of the fit formula is PINNED against app.js** (the
    span, the zoom, the near-ring test, the disk radius, and both zoom limits read out by regex), because
    the real fit lives inside `startCardGlobe`'s closure with no way in from outside and a copy is exactly
    what goes stale. Verified against two reintroduced faults — the game filter removed, and the layer
    re-coarsened — each caught. **Re-run after touching the `MAP CARDS` block, `startCardGlobe` /
    `cardMapSpec` / `cardMapHTML` / `mountCardMaps` / `cardFacts` / `CMAP_ZMAX` / `serializeCardData` /
    `revertCard` / `gameCardIdSet`, `.claude/build-us-states.js`, or after adding a map card.**
    **AND IT WAITS FOR THE PAGE GHOST BEFORE READING THE CARD** (`settle()`, Aug 2026, found while merging).
    Boot renders the home page and then routes to study, which is a same-document render, so `makePageGhost`
    lays a CLONE of the outgoing page over the stage for `PAGE_GHOST_MS + 60` — and this file's flat 250ms
    sleep was racing a 260ms fade. It passed for months and started losing the moment the `usstates` bundle
    gained a second file to fetch. **Both ways it then fails look like faults in the site and neither is**:
    a strict Playwright locator throws `resolved to 2 elements`, and a `document.querySelector` may pick the
    GHOST's canvas — which is a clone, so it carries no pixels and `toDataURL()` reads back an empty map,
    reported as a globe that drew nothing. Waiting on `!document.querySelector(".page-ghost")` is one line
    in the two navigation helpers and covers every query after them; **a fixed sleep across a transition is
    a race with a stopwatch on it**, and the right shape is to wait for the thing to be gone.
  · `node .claude/test-minigames.js` — the three games added on 2026-08-09 **plus Common Thread's restricted
    pool** (75 assertions), and every one of
    its checks is for something that fails SILENTLY. **The wiring**: each of the three is a route, has a
    `PAGE_META` row and a played-today name — a missing route is a deep link that goes home and a missing
    meta row puts the HOME page's title in the tab and in every link preview — and **the sweep is asserted
    against the tiles the home page actually paints** rather than against a list copied into the test, so a
    tenth game fails on the rule and not on a stale copy of it. **The crossword**: the grid fits a 390px
    column with no sideways scroll (the `1fr` track-sizing bug), every clue carries its enumeration, and —
    the assertion nothing else could make — **every maximal run of squares on the board is re-derived and
    must be a clue**, which is the only way to see the layout's adjacency rule going and the board filling
    with words nobody clued. A deliberately wrong grid scores 0, marks every square wrong and **marks none
    both wrong and right**, which is the crossing-square bug the score itself cannot see. **What year?**:
    the rail is ruled in one era rather than across the whole of history, a too-early guess rules out
    everything below it, and three misses name the year. **The picture round**: with a pool planted the way
    an admin batch would, five rounds of four deal — and **nothing on the page names the subject before the
    guess**, the failure that leaves a game working perfectly and teaching nothing.
    **It opens with 730 DAYS OF PUZZLES generated in Node** (`simulate`, slicing the two daily builders out
    of app.js and standing them on the real `data.js` and `whatyear.js`) — because a generator can be
    flawless on the day it was written and degenerate on a date nobody tried, which is exactly what both of
    this game's real bugs were. That sweep is what pins the crossword dealing a full grid every day with no
    unclued run in any of them, and What year?'s rail staying inside the answer's own age, never crossing
    year 0, and no answer repeating inside half a cycle.
    **`gameCardIdSet` IS SHIMMED TO THE REAL RULE, and that is load-bearing** (Aug 2026): the shim reads
    `GAME_MAX_DIFFICULTY` out of app.js rather than writing it down, because the whole value of the sweep is
    that it deals from the pool the SITE deals from. Shimmed to "every card", the way `availableCardIdSet`
    is, it would sweep two years of puzzles no reader ever sees and would go on passing on the day the
    filter starved a game. **The crossword's variety assertion is a BOUND, not "all 730 distinct"** — with
    the filtered pool at 30 words, choosing nine over two years collides however good the shuffle is, so
    uniqueness is arithmetically impossible; the bound still catches the collapse to 60 that the unscaled
    draw cap caused. Raise the floor if the pool grows; don't lower it.
    **Two of the harder assertions run the same day in two fresh contexts**: the first plays badly and reads
    the answer off the result screen, the second is handed it and must win. That proves the puzzle is seeded,
    that its answer is REACHABLE (the crossword's letters fit its own squares; the year sits on a tick of its
    own rail — get that wrong and the puzzle is unwinnable every day with nothing on screen to say so), and
    that a correct solve is scored as correct rather than only a wrong one being scored as wrong.
    **ITS COMMON THREAD SECTION IS ABOUT A STARVED POOL** (Aug 2026): the grid is now built only from
    well-known cards' answers, which cut the pool from ~680 terms to about ninety and made the generator
    fail on 271 days of 730 — a blank page, silently, on more than a third of days. It asserts a full grid
    of sixteen with nothing repeated, four mistakes to spare, and — the half a starved pool cannot fake —
    **that every term on the board really is the answer of a card rated 1 or 2**, read against the shipped
    corpus rather than a list copied into the test. Both directions matter: a grid that will not build says
    "not enough terms", and one built from the WHOLE glossary looks perfectly healthy while being the
    puzzle nobody could do. **There is deliberately NO 730-day sweep of this one** — `dailyThreadPuzzle`
    resolves each answer through the real glossary index, plurals and aliases and all, so slicing it into a
    bare Node harness the way the crossword's sweep is sliced would mean reimplementing the very resolution
    under test. That sweep was run against a browser page while the restriction was being tuned (0 blank
    days, 726 of 730 distinct grids, 7 group categories) and its numbers are recorded in the game's own
    bullet; what is committed is the guard that fires on the day the pool is starved.
    **ITS SEEDING SECTION EXISTS BECAUSE ONLY TWO PEOPLE TALKING COULD FIND THE BUG** (Aug 2026): Multiple
    Choice, True or False and Who said it? drew through `pick`, i.e. `Math.random`, so every reader got a
    private quiz while the tile, the tile's record card and a friend's account all presented the score as
    comparable. From inside one browser there is nothing to see — five well-formed rounds, correctly
    scored — so the test is TWO CONTEXTS, independent storage, sharing nothing but the date, and it walks
    **two rounds** of each game rather than one: one round would only prove the two readers got the same
    SET, where the report is about the same questions *in the same order*, and the second round is what
    measures that. The option order is folded into the same trace rather than asserted on its own,
    because True or False's two options are static markup and a check of their order is a check that
    cannot fail — which reads as coverage and is not.
    **The day-to-day half is done in NODE, and that is forced rather than preferred**: the site's day runs
    on the reader's own boundary, capped at noon, so from mid-afternoon onwards no setting rolls a live
    page back into yesterday and a browser version would pass every morning and be unrunnable every
    afternoon. `dayPick` is sliced out of app.js by the same `builder()` that runs the crossword sweep, so
    what is measured is the shipped function. It asserts 90 days dealing 90 different sets — distinctness
    over a long run, since one pair colliding is a coincidence a FIXED seed would also survive — and that
    two keys on one day do not shuffle in step, which is the fault the per-draw key suffixes prevent and
    which would otherwise put the right answer in the same position in every round of the day.
    **Re-run after touching `dayPick` or any game's draw**, and never let a game's draw go back to `pick`.
    **ITS FIND IT SECTION IS THE FIRST COVERAGE THAT GAME HAS EVER HAD** (Aug 2026), which is how a score
    that disagreed with the reader's own arithmetic went unremarked. It asserts that a tap SELECTS rather
    than answering (no verdict, no change to the score, and a button naming the tapped place), that Clear
    withdraws it and the action row collapses, that only Confirm spends a try, and — the reported bug —
    that a correct SECOND guess counts. **The target is HUNTED, not computed, and that is forced**: the
    rounds are built inside the Atlas closure and turning a lon/lat into a screen point needs the globe's
    rotation and zoom, neither reachable from outside, so the board is swept and the CONFIRM BUTTON read,
    it being exactly the readout the feature added. ~850 clicks sweep a hemisphere in eleven seconds, and
    the globe is spun a quarter turn and swept again when the day's target is on the far side — the draw
    is seeded by the date, not by what happens to be facing the reader. **It FAILS when the target is
    never found rather than skipping the assertion**: a hunt that quietly gives up is a test that passes
    on the day the feature breaks.
    **Re-run after touching `PAGES.crossword` / `PAGES.picture` / `PAGES.whatyear`, `xwNorm` / `xwPool` /
    `xwLayout` / `dailyCrossword` / `xwLocked` / `nextOpen` / `xwMarkGaveUp`, `picturePool` /
    `dailyPictureRounds` / `tagKinship`, `dayPick` / `buildChallengeQuestions` / `buildWhoSaidRounds` /
    `PAGES.truefalse`'s draw, `threadEasyKeys` / `dailyThreadPuzzle` /
    `THREAD_GROUP_MIN` / `THREAD_TRIES`, `wyStep` / `dailyWhatYear`,
    `DAILY_GAMES` / `GAME_NAMES` / `PAGE_META` / the `valid` route list, `gameCardIdSet` /
    `GAME_MAX_DIFFICULTY`, `whatyear.js` / `truefalse.js` / `quotes.js`, or the home page's tile grid.**
  · `node .claude/test-difficulty.js` — **card difficulty and the minigames' pool filters** (69 assertions,
    Aug 2026). No browser and no dependencies: the rule is arithmetic over the shipped data plus a few
    structural reads of app.js, the shape `test-date-line.js` uses. Every one of its checks is for something
    that fails silently on the page — a wrongly-filtered game still deals a puzzle, still scores it and still
    turns the tile gold. It asserts that **every shipped card is rated 1–5** (an unrated card silently stops
    appearing in the games); that the bar is read from ONE place, `add-card-difficulty.js` grepping it out of
    app.js rather than restating it, **and that the grep still matches**; that **every card-fed game goes
    through `gameCardIdSet()` and none reaches for the unfiltered set** — the assertion that matters most,
    and the only one that can catch a tenth game added later reaching for `availableCardIdSet` out of habit;
    that the filtered pool **can still deal** (the opposite failure, and just as quiet — the game shows a
    "Coming soon" placard that reads as content nobody has written); that **study is untouched**, with
    `availableCardIdSet` knowing nothing about difficulty; that `serializeCardData` **emits** the rating,
    since a serializer that forgot it would strip every one from data.js on the next admin keystroke; and that
    `add-card-difficulty.js` refuses a bad batch **and writes nothing at all** when it does, which it proves
    by running the tool for real and comparing the file's bytes. It also owns the **What year? event pool**:
    every year carrying at least `WY_EVENTS`, no entry with markup (the clue list escapes, so a stray `<i>`
    would print its own tags), no entry naming the year it asks about, no duplicate event, and at least ten
    usable years. **Its section 8 is the second filter, `card.undatable`** (Aug 2026): that Timeline's pool
    skips the flagged terms and **that no other game's pool applies it**, since those ask what a term IS
    and narrowing them would be a rule borrowed for a reason that does not apply; that `cardStartYear`
    knows nothing about it, so the deck's own order is unmoved; that `human evolution` — the card this was
    reported about — is flagged AND still carries its sort year; that the flag is only ever written as
    `true`; that what is left is comfortably larger than a round, which is the opposite failure and just as
    quiet; and that `mark-undatable.js` refuses a flag with no reasoning behind it and writes nothing when
    it does. Verified against five injected faults — an unrated card, a game reverted to the unfiltered
    set, a serializer that drops either field, and `chronoPool` reverted to the unfiltered pool; each was
    caught. **Re-run after touching
    `cardDifficulty` / `difficultyOK` / `gameCardIdSet` / `GAME_MAX_DIFFICULTY` / `cardUndatable` /
    `chronoPool` / `cardStartYear` / `serializeCardData` /
    `revertCard`, any game's pool function, `add-card.js`'s difficulty or undatable guard,
    `add-card-difficulty.js`, `mark-undatable.js`, or
    `whatyear.js` — and after any batch of ratings or flags.**
  · `node .claude/test-tour.js` — the first visitor's walkthrough and the pages that explain themselves
    (Aug 2026), 70 assertions. Everything in it fails SILENTLY and most of it has broken once. **The offer is
    INLINE**, so a regression to a modal over the first paint would look like a feature rather than a fault.
    **The tour NAVIGATES and is deliberately not in `render()`'s close list** — putting it there is the
    obvious tidy-up every other body overlay wants, and it would dismiss the tour on the one step that
    teaches adding a deck. **The card must never leave the viewport**, on a desktop or a 390px phone: the
    nudge that keeps it off its own target walked it off the side of the screen with its own Next button
    when the base rect was measured rather than computed, and nothing on screen says "the button is outside
    the viewport" — the tour simply stops working, which is how it was found. **The Library's card must be
    on `document.body` AND on the screen**, the two halves of the containing-block trap that had it
    centring itself a screen and a half below the fold. Plus: the three subjects the request names are read
    off the prose a reader is actually shown (a tour can lose one to an edit without erroring); the four
    demo grades carry four DIFFERENT intervals from the real scheduler, which a hard-coded illustration
    would hide for ever; either answer retires the offer and a second visit proves it; a reader with study
    history is not offered a beginners' tour; and the coach marks are shown once, reopen from their "?", and
    cannot outlive their page. **THE LIBRARY'S SPLIT IS ASSERTED IN BOTH DIRECTIONS** (Aug 2026) — the shelf
    card carries the search and the reading position and NOT the marker, the book card carries the marker,
    the chapters and the facing original, and the two are remembered under separate keys — because a tip
    filed in the wrong half is invisible from either side on its own, and the half that fires on opening a
    book is the one nothing else in the suite would ever see.
    **SECTION 5b IS A ROUTE RATHER THAN A CARD** (Aug 2026): the hero's first press lands on `#decks`, a
    collection can be added there, and — the half that closes a loop — **with one added the banner deals a
    card after all**. Both ends are needed because they fail in opposite directions and either alone looks
    deliberate: a hero that still deals a card bypasses the page, and one that never does strands a reader
    on it.
    **A CONTROL'S LABEL IS READ OFF `app.js`, NEVER WRITTEN DOWN IN THE TEST** (Aug 2026, and this file was
    itself the fault). The reveal assertion was the literal `/show answer/i` — the words the button carried
    when the tour was written — so when the control became **Reveal answer** the test went on passing and the
    walkthrough went on naming a button the page has not got, for months. **A test that hard-codes a label is
    not guarding the label, it is pinning the stale one**; the expectation now comes from the same source the
    button does (`id="reveal-btn">([^<]+)<` over `APP_SRC`), with a second assertion that the id was found at
    all, so a renamed id fails loudly instead of quietly matching nothing. The same trap is waiting wherever a
    tutorial names a control: **the walkthrough also called an undiscovered glossary term "gold" for the
    fortnight after that mark became teal** — the word naming a colour is painted in that colour now
    (`.tour-newterm` reads `--newterm`), so the step and the page cannot disagree without it being visible.
    Four About-page and Atlas claims were stale the same way and are checked in `.claude/test-layout.js`'s
    company rather than here. **AND THAT SUITE'S OWN FIRST-HEADING ASSERTION WAS THE SAME FAULT** (Aug 2026):
    it read `lib.groupLabel === "Collections"` and went on passing after the heading was renamed to
    **History** on request — a suite reporting 321/0 while pinning a name the page no longer uses. It comes
    from `COLLECTION_SECTIONS` now, with a second check that the table was found at all. **A hard-coded
    label in a test is not an assertion about the label, it is a copy of it that nothing keeps in step.**
    **Re-run after touching the `THE GUIDED TOUR` block, `pageHelp` / `closePageHelp` /
    `LIB_HELP_TIPS` / `BOOK_HELP_TIPS`, `PAGES.home`'s `fresh` branch, `tourOfferHTML`'s place on the home
    page, the Atlas / Library / book help cards, or `render()`'s close list.** Two things it had to learn: the demo's grade cells concatenate into
    `Again1mHard6m…`, so a word-boundary regex over the card's text finds neither the labels nor the
    figures (read them structurally); and a step-change reads mid-transition, so anything measured during
    one has to be measured again after it settles.
  · `node .claude/test-units.js` — the two Settings that REWRITE what is already on the page (Aug 2026):
    measurements, and light/dark from the device. The units transform is a regex over every text node, so
    its two failure modes are a bracket it fails to recognise (both systems left on screen — it looks as
    though the feature was never built) and a bracket it recognises wrongly (an ordinary parenthesis eaten
    out of a sentence — it looks like a typo in the card). **The corpus sweep is the assertion that
    matters**: the engine is sliced out of the real app.js by text and run over every shipped card and every
    glossary term, demanding 0 missed and 0 taken in error (341 fields transform today). It also pins that
    the SHIPPED DATA still carries both figures after a reader has chosen one — the display transform must
    never reach the store, which is the whole reason it is a DOM pass. On the theme: a first visit follows
    the system in both directions, a manual Night flip takes the decision back and holds it across a
    reload, and **an older save keeps the light/dark it chose** — the one way this change could strand
    somebody. **Re-run after touching `unitizeText` / `unitizeTree` / `applyUnits` / `applyTheme` /
    `setNight` / `setThemeAuto`, and after any units batch.**
  · `node .claude/test-avatar.js` — **the avatar scene** (47 assertions, Sep 2026). It reaches the internals
    through a **patched app.js**, appending one line inside the IIFE and failing if the tail it appends to
    is not found — `test-photo.js`'s technique, and here for its reason: the account page's own controls
    live behind a Supabase sign-in and mocking auth to reach them would test the mock.
    Five silences. **The box's ratio** is measured rather than assumed, because every anchor in `avatar.js`
    is a percentage of the box and a box that stops being 3:2 crops the scene and points all of them at the
    wrong part of a cropped picture — which is exactly what `max-height` beside `aspect-ratio` does, and it
    shipped that way for an hour. **The slot column** is measured for collapse: `flex:1 1 0` with
    `aspect-ratio:1` in a column is circular and rendered the six slots as a 4px stripe of colour, which
    reads as a feature nobody built. **The gate** (`setEquip`) is driven with an unowned artefact, one
    tagged for another slot, a nonsense id and a slot that does not exist, because the picker only ever
    OFFERS what is legal — a gate that stopped refusing could not be seen from the page, and the loadout
    syncs to every device the reader has. **The migration** is run twice with an unequip between, since one
    that runs on every page open puts the artefact back each time the reader takes it off. And **Reset
    progress** is asserted in both directions — the look kept, the loadout and scenes gone — because
    getting that split backwards deletes something the dialog promised to keep and is found afterwards.
    It also drives 4,000 chest rolls to prove a scene can actually drop while artefacts and themes still
    do, and measures the phone layout, where the slots leave the picture and become a row a thumb can hit.
  · `node .claude/test-artefacts.js` — **THE RELIQUARY, the collection banners, and the two colour swaps that
    went with them** (Aug 2026). Everything in it fails SILENTLY, which is why it is a file rather than a few
    lines appended elsewhere. **The roll**: a chest never returns something already owned (with a small pool a
    duplicate reads as bad luck and is never reported), every rarity is reachable, and an exhausted pool SAYS
    so rather than opening on nothing — driven through 32 real chest openings over a synthetic 32-artefact
    pool planted in the admin overlay, under `reducedMotion` so the rarity-sized waits collapse to a tick.
    **The queue**: dismissing an overlay keeps the chest, opening one spends exactly one. **The plate's
    actions** (Sep 2026): the showcase cap it used to assert — four, and the fifth refused — is gone with the
    showcase, and what stands in its place is that the plate offers one button per avatar slot whose label
    names what pressing it DOES, and that pressing one reaches the loadout. **The colour swap, in both directions** — a book's marker measured against a
    CARD's rather than against a hex literal, so a re-toned `--zh` moves both together, and an undiscovered
    term measured against a card's blank, which it must no longer match. **The collection banner**: an icon
    where the numeral was, a studied/total bar where the XP bar was, and no numeral or `.lib-cap` left
    anywhere. **And the deck cap is gone**: a reader who has studied nothing may add every live collection,
    which is the one assertion that would catch a half-removal, the cap having lived in three places. Plus
    the Admin tab, including its ≤860px panel cap and the never-save-a-picture-uncredited rule.
    **THE CITATION APPARATUS (Aug 2026)** is asserted in two places and two ways. On the PAGE: the plate
    carries the fold, its markers are numbered by `wireFootnotes` rather than left blank, and it renders
    OPEN as a card's does — a plate looks identical whether its markers resolve or not, so only the numbers
    prove the join. In the SHIPPED FILE: **the shape is an invariant and the coverage is a pass in progress**,
    and the two are checked differently on purpose — anything cited must be cited properly (a URL on every
    citation, no marker past the end of its list, no work nothing points at), while coverage is REPORTED,
    exactly as the card and glossary passes were run, because a suite that goes red for a documented backlog
    is a suite people learn to ignore. The bar is enforced where it bites: `add-artefacts.js` and the
    editor's Save. **The admin PREVIEW** is asserted to be the reader's own plate, to follow the FORM rather
    than the store, and to update on the rarity `<select>`, which fires `change` and not `input`.
    **The showcase's "See all" is NOT here** — the signed-out account page has no showcase, so it lives in
    `test-account-page.js`, which has the session; what this file asserts is the other half, that a guest is
    shown no orphan control for a section they have not got.
    **ITS SECTION 3b IS THE THEME DROP AND IT IS MADE DETERMINISTIC RATHER THAN SAMPLED** (Aug 2026): with
    the artefact pool exhausted `rollChestItem` has only themes left, so a locked theme MUST come out, and
    with every theme owned as well the chest must say the pool is empty — **both halves, since a drop that
    never fires and a drop that fires when nothing is left look identical from one side and neither
    throws.** The 32-chest sweep above it seeds every theme as already owned for the same reason: left
    locked, the drop would take a random ~14% of those openings and the run would fail on a coin toss. The
    five collectible themes are read out of app.js by text and ASSERTED to be the whole set, so a seventh
    theme added later fails here rather than silently invalidating both fixtures.
    **AND THE CHEST BALANCE IS ASSERTED AGAINST THE BADGES, NOT AGAINST A CONSTANT** — the collector's
    badges are earned during that very sweep and each grants a chest, so `40 - 32` is not the answer; what
    is invariant is `chestsOpened`, which is exactly what that counter exists for.
    **Re-run after touching the `THE RELIQUARY` block, `artefactPlateHTML` / `openCollectionWin` / `wireReliquary`,
    `rollChestItem` / `spendChest` / `claimTheme` / `unlockTheme` / `themeGrandfather` / `THEME_DROP` /
    `THEMES` / `ACHIEVEMENTS` / `progStats`,
    `artefacts.js`, `COLLECTION_ICON` / `deckProgMarkup` /
    `addActive`, `serializeArtefacts`, or the `--newterm` / `--rar-*` tokens.**
  · `node .claude/test-deck-ux.js` — **49 assertions on six things asked for in Aug 2026, every one of
    which fails silently**: a card type's `<details>` remembering how it was left, the structure line's
    typography, a community deck's colour, the sheet's ×, **the pinyin being set in a face that has the
    third tone**, and **studying past the daily limit staying inside the subdeck**. Nothing in it reaches into app.js — the probe
    deck is imported through the Studio's own file picker, the card is read off a REAL study session, and
    the sheet is opened the way a mouse opens one — because **a debug surface added for a test is a debug
    surface every reader downloads**. Three things it is worth reading before adding to it. The disclosure
    is asserted in all THREE of its states (opened, closed, and never touched keeping the template's own
    default), across a card change AND across a reload, since the in-memory map and localStorage fail
    differently and each state looks right from the other two's side. The typography is measured **against
    the sentence it annotates** rather than against a hard-coded 9px: what was asked for is a relationship,
    and a figure written into a test pins today's number instead of the rule. And the colour is asserted at
    both ends — the swatches appearing AND the hue reaching the subdecks — because the inheritance already
    worked before the change, so asserting only the control would pass on one that does nothing.
    **Its own three bugs are the ones to expect again.** A deck id shorter than `[a-z0-9]{4,16}` is silently
    replaced on import, so the id is read back off the page rather than assumed from the file. `.dm-head`
    spans the whole box, so "the × is right of the head" is false by construction and says nothing — the
    real test is a box OVERLAP against the title and the studied count. And **a live collection is full of
    `.pill.soon` for its own empty subdecks** (378 of them on that page), so excluding coming-soon rows on
    that class matches nothing: a coming-soon collection has no add button at all, which is the whole test.
    That one is the worth-remembering kind, because it made the parity check SKIP — and a skip written as a
    pass is exactly the false confidence a suite is for, so a missing collection now fails.
    **Its sections 6–8 were added a day later with three more reported bugs, and each is guarded by the
    assertion the fix's own first attempt would have failed.** The PINYIN one is about the ORDER of the font
    chain and not merely its contents — "names a covering face" passes on the broken append, because the
    broken append does name one; what has to hold is that no GENERIC family stands in front of it, since a
    generic matches every character and the browser never reaches the name after it. It is deliberately
    network-free (this sandbox cannot reach Google Fonts, and a glyph measurement would pass or fail on
    that), and section 7 re-asserts the same rule over the SHIPPED deck files, `deckcore.js` being the
    source and every built file a copy. The STUDY-AHEAD one asserts the pile's size AND its order, because
    either alone passes on the other's bug — and it asserts the walk really stepped, after a first cut
    recorded the same card three times and had "each word's two cards side by side" agreeing with itself.
    **Four more traps came out of writing those**, all of them ways to be told a card is not there when it
    is: `study()` already reveals its first card, so a second reveal times out; a **new card graded Good
    requeues** as a learning step, so the queue never empties and the placard never appears (grade Easy);
    the study session **survives a reload** in sessionStorage, so seeding state and reloading lands back on
    the previous section's card, revealed; and the grade bar **animates in**, so Playwright's actionability
    check waits for an element that is still moving — click it through `evaluate`. Since the sections above
    grade cards out of the same deck, section 8 clears `cards`/`deckDay`/`intro`/`buried` before it starts.
    **Re-run after touching
    `ucRestoreDetails` / `ucDetailsKey` / `ucSetOpen` / the capture `toggle` listener / `cardTypeSideHTML` /
    `deckSheet` / `.dm-x` / `containerHasChildren` / `reviewHue` / `uDeckColorOf`, the cram branch in
    `PAGES.study`, or `deckcore.js`'s `.uc-exst` / `PINYIN_FONT`.**
  · `node .claude/test-glossary-page.js` — the discovered-terms list and the page transition (Aug 2026).
    The list must drop a term retired since it was read (it would open a popup onto nothing) and a deck's
    own term (never part of what the meter counts); both filters are invisible until they are wrong. The
    GHOST is the other half: the outgoing page is cloned into the document for a quarter of a second, so it
    is asserted to carry **no `id`** (the new page's wiring could find the dead copy) and **no control
    `name`** (a radio group is document-scoped outside a form, so the ghost's radios joined the new page's
    and a click that had landed read back as never having happened — which is how it was found), to be out
    of the accessibility tree and out of the way of a click, and to be gone a moment later. Plus: the Atlas
    opts out in BOTH directions. It also guards the **SORT** (Aug 2026): alphabetical is asserted against
    the ORDER rather than against the picker's value — a control that changes nothing looks exactly like
    one that works — and, the assertion most worth having, that re-sorting KEEPS a filter the reader has
    typed, which the obvious two-handler implementation silently throws away. **Re-run after touching
    `makePageGhost` / `.page-ghost` / `PAGES.glossary` / `GLOSS_SORTS` / `glossSeen`.**
  · `node .claude/test-lang-decks.js` — **the Collections page's Languages section** (Aug 2026), in two
    halves and both for silent failures. The **catalogue** half runs with no browser at all and its one
    strong assertion is that `lang-decks.js` **reproduces byte for byte** from `decks/`: it is metadata read
    off the deck files, so a deck rebuilt without regenerating it leaves a row claiming 500 words over a
    deck that now holds 700 — which looks exactly like a row, and which nothing on the page could report.
    It costs about a second (181 MB read, 11 KB written) and **restores the shipped bytes in a `finally`**,
    since a check must not leave the repo changed. The **browser** half is about the banner (Aug 2026,
    when a language became a COLLECTION): one per language, titled and counted from the catalogue, each
    carrying the curated wash, the icon and a studied/total bar whose **denominator is that language's own
    card count** — the honest figure for decks that are not on the device yet. It asserts every banner has
    **a hue of its own and no two the same**, since a language with no `COLL_THEME` key renders with no
    wash at all and looks deliberate; that they are **shut AND full together** (shut-and-empty looks
    identical to shut-and-full) and that the **chevron really changes the fold's height**, which the pair
    cannot show; that a deck row is the curated `.node` and is **not itself pressable**, a row click
    meaning a 21 MB download off a stray tap; and — the assertion for a control that must NOT exist —
    that **no banner carries a collection-level `+`**. **Section 3 is then the ADD/DOWNLOAD SPLIT, and
    its sharpest assertion is a NEGATIVE**: pressing + writes the entry, marks the row, and **fetches
    nothing at all** — a request log with one line in it is exactly what the request forbids, and a page
    that downloaded on Add would look entirely correct on the device that pressed it. Then the home page,
    which must draw **exactly one** pending row for the deck (nine, one per added level, is the failure
    the `pendingSeen` collapse exists for), named after the FILE, saying it is not on this device,
    offering Download with the size, and carrying **no counts and nothing to study**. Then Download
    fetches **exactly one** file and **exactly the one the row named**, and the pending row becomes the
    deck. **It reads the PAGE and never the store**, on the standing rule that a debug surface added for a
    test is one every reader downloads.
    **Its section 2b is the SUBDECK FOLD** (Aug 2026), and it takes the deepest-tree deck in the
    catalogue rather than naming one, so a rebuilt shelf cannot leave it pinning a deck that no longer
    has subdecks: it asserts the row is a `.node-group` with a chevron, that it holds **exactly** the
    number of `.node.lang-sub` rows the catalogue's own tree walks to and in that order (a fold with the
    right count and the wrong rows looks identical), that **no subdeck wears `.lang-deck`** — that class
    is how the page counts DECKS, so a subdeck carrying it inflates every tally in silence — that a
    subdeck DOES carry an Add (a subdeck is a study scope, and since Add fetches nothing there is nothing
    left to object to), and that the chevron really opens the fold. Then the opposite case, which fails
    the other way: a deck with NO subdecks stays flat, with no `.node-group` and no chevron.
    **Its section 2c is the UNWRAPPING, and it asserts BOTH directions** — a deck the catalogue marks
    `flat` draws no row for the file itself while every one of its top-level subdecks does, and a deck
    whose subdecks are DIRECTIONS stays wrapped — because each alone passes on the rule having been
    dropped in the other, and a shelf that unwrapped the Spanish levels would be seven identical pairs of
    "Spanish → English" rows. The expected per-language row COUNT is derived from the catalogue's own
    `flat` flags rather than written down, so a deck that starts or stops being unwrapped fails on the
    rule and not on a stale number. **And the curated shelf's SIZES**: every counted
    deck row carries one, each reading as a figure with a unit, each with a `title` saying the cards are
    already downloaded — the wording being what separates the two shelves' figures, and the half a
    reader would misread rather than miss.
    **Re-run after touching `langCollectionsHTML` / `langCollectionHTML` / `langRowHTML` /
    `langRowSpecs` / `langNodeSpecs` / `langCollId` / `wireLangDecks` / `entryPending` /
    `langDeckDownload` / `langCatalogById` / `langCatalogNode` / the `.dk-pending` row in `PAGES.home` /
    `cardBytes` / `nodeBytes` / `fmtDeckSize` / `.node-size` / `buildNode`'s `nodeSpanHTML` / the `lang-*`
    rows of `COLL_THEME` / `.claude/build-lang-decks.js`, and after adding, rebuilding or removing a deck
    in `decks/`.**
  · `node .claude/test-reset.js` — **Settings → Danger zone → Reset progress, and who the home page thinks
    you are** (21 assertions, Aug 2026). Both halves fail silently and one of them cannot be undone. It
    seeds a long-standing reader — study history, two collections added with a per-deck limit, a place in a
    book, a starred book, badges, a streak, artefacts, a non-default theme, text size, sound, book sort and
    day boundary — presses the real control, types the real confirmation, and then reads the SAVE back:
    everything the dialog names is gone and **every one of `RESET_KEEPS` survives**. That list is exactly
    the kind a later edit shortens by accident, and dropping a name from it loses a reader's decks in
    silence — no other test on the shelf would see it. The other half is `fresh`, asserted in **both**
    directions, which is the point: a genuine first-timer must still get the hero (so the fix cannot be
    "never show it"), a reader with a studiable deck must not — before studying as well as after a reset —
    and none of it may be undone by a reload. **Re-run after touching `resetProgress` / `RESET_KEEPS` /
    `PROGRESS_FIELDS` / `emptyProgress`, the home page's `fresh`, or the Settings reset row.** Note the
    house gotcha it is built around: a hash-only `goto` is a same-document navigation, so anything written
    into localStorage behind the app's back has to be read back through a real `reload()` or the next
    `save()` simply overwrites it — hence `seedHome` reloads and `home` does not.
  · `node .claude/test-library.js` — the Library (333 assertions): the rename, the shelf, one book, and the
    reader's place. Each half guards something that fails SILENTLY. **The rename**: `#decks` must still
    resolve (every link ever shared points at it) while calling itself Collections everywhere, and exactly
    one nav tab may read "Library". **The laziness**: it watches the request log and asserts no
    `books/*.js` is fetched on boot OR on the shelf, and is fetched on the book — a book on the eager path
    just makes the site slower, which nobody reports. **The place**: stored as a chapter NUMBER and a
    FRACTION (an index moves when the book grows; a pixel offset moves when the text size does), surviving
    a real RELOAD rather than a re-render, and a deliberate chapter change starting at the top. **The
    apparatus**: notes numbered in reading order by `wireFootnotes` with no marker past the end of the
    list, and — the assertion most worth having — it walks **every chapter of every book** asserting no lowercase
    surface is ever glossary-linked, which is what keeps `genus`, `epoch`, `iron` and `bronze` from
    quietly mis-defining Seneca. Note that letter 3 contains no glossary term at all, so an assertion
    pointed there passes on nothing; letter 9 is the one to use. **The front matter** (Aug 2026): the book
    opens on chapter 0, there is exactly one of it, it carries the translator and the licence, and — the
    other half, which fails the opposite way — that rights box is NOT repeated under every chapter, and a
    letter still carries the section numbers by which the text is cited. **Once the original is loaded it
    must carry TWO licence boxes** — the Latin is out of copyright by AGE and Gummere's English by its date
    of publication, and running them together is how the distinction that decides what may be shelved here
    gets lost (it failed silently once: the front matter was built before the original's own file landed).
    **The bilingual reading** (section 6, Aug 2026), nearly all of which fails silently: the original is
    not fetched until asked for; a wide screen sets the two side by side and a narrow one shows ONE; each
    row holds the same section number **in both columns' own rendered markers** (checking `data-sec`
    against itself would prove nothing); the glossary reaches the translation and not the original;
    tapping the page turns it over and **lands on the same section**, having actually had to move the
    scroll to do so; a tap on a glossary term does NOT turn it; and the choice survives a reload.
    **The shelf's own licence paragraph is gone** (on request) and the one-line blurb replacing it is
    asserted with it — they fail in opposite ways. **No Wikisource stylesheet in the
    prose**: read off the SHIPPED data over every chapter of every book (`shippedBookLeaks`), not off one
    rendered page, because the leak sat in 24 of 335 notes and each is visible only to a reader who opens
    that chapter's fold. **The chapter SLIDE** (Aug 2026) is measured MID-FLIGHT for the same reason the
    page swipe's is — the panel leaves the way the finger went, the next arrives from the other side, the
    stage clips while they travel and releases after. Note that the whole-book proper-noun sweep now runs
    under `emulateMedia({reducedMotion:"reduce"})`: it clicks 125 tabs a hundredth of a second apart, and
    against an animated chapter change it would measure the FIRST chapter 125 times over and read as a book
    with almost nothing linked in it. **Re-run after touching `PAGES.library` /
    `PAGES.book` / `BOOKS` / `bookIngest` / `bookIntroChapter` / `bookNotesHTML` / `linkProperNounsOnly` /
    `readingPos` / `setReadingPos` / `bookSections` / `bookRows` / `applyLangMode` / `anchorNow` /
    `slideChapter` / `BOOK_SORTS` / `sortDirHTML` / `setBookSort` / `openBookMenu` / `shareBook` /
    `isBookFav` / `toggleBookFav` / `bookQuery` / `bookMatches` / `shelfHTML` / `teiPagedBooks` /
    `teiDramaDivisions` / `dramaNotes` / `dramaText` / `extractShloka` / `splitAlternating` /
    `markLikiHeads` / `markLikiSections` / `applyGlyphs` / `markChapterHead` / `markArticuli` /
    `extractSukta` / `suktaBody` / `suktaLines` / `suktaVerses` / `suktaSanskrit` / `SUKTA_VERSE` /
    `extractQuixote` / `extractSatyricon` / `satyriconSection` / `cutAcrossSections` /
    `extractRamayan` / `ramSanskrit` / `RAM_BOOKS` / `ramSarga` /
    `extractPtahhotep` / `PTAH_KEYS` /
    `extractBede` / `bedeChapter` / `bedeLatin` / `BEDE_CHAPTERS` /
    `sanKuoHead` / `sanKuoRoman` / `originalChapter`'s `dropTables` /
    `extractBoethius` / `boethiusLatin` / `boeGreek` / `boePoem` / `BOE_BOOKS` /
    `markMaloryHeads` / `MALORY_RUBRIC` / `MALORY_CHAPTERS` / `dropNotes` /
    `closeQuotesAt` / `balancedSpan` / `betaGreek` /
    `cleanBody`'s `body: "plain"` slice / `extractCaput` /
    `extractTerzina` / `terzinaLines` / `terzinaHtml` /
    `teiVerseBooks`' `prose` branch and its two spacing rules / `cardMarks`' `both` sweep / the
    mid-line card lift / `teiVerse`'s `<choice>` resolver / `reconcileCards`' `langName` /
    `stripTags`'s `data-n` carry and its `VOID_TAGS` guard, after running `fetch-book.js`, or after
    renaming anything on the Collections page.**
    **A BEDE section (`bedeChecks`) is there because its pairing is exact by MEASUREMENT rather than
    by construction, so the thing to assert is that it stays exact**: 140 chapters a side in
    34/20/30/32/24, a clean 1..N on both sides, and the two columns' lists identical book for book.
    Every fault this book can have is silent — a mark that stops being recognised folds its chapter
    into the one before it and shortens nothing visible. Two of its assertions are worth copying
    elsewhere. **Every marker resolves and every note is referenced** is what found the four headings
    carrying a footnote marker, and it is the ONLY check that can see one: flattened, the marker
    becomes a bare figure inside a chapter title and the chapter is otherwise perfect. And **the
    Latin is fingerprinted on its own orthography** (93 `uero` against 2 `vero`, and the same for
    `uita` and `ciuitate`), because the transcription names Migne and does not print what Migne
    prints — so a shelf that quietly acquired a v-orthography text would be serving a different
    edition under the same claim, with every count still healthy.
    **A MALORY section (`malloryChecks`) is there because that book has no second column to check it
    against** — a single-column book cannot fail a pairing, which is what catches most faults on this
    shelf, so everything about it has to be asserted directly. Its sharpest assertion is not a count
    but a FINGERPRINT: the other free English copy of the book carries the same 503 chapters in the
    same 21 books with the same rubrics in the same order, and differs from this one about a thousand
    times in its words, so a shelf that quietly acquired that transcription instead would pass every
    structural check there is. Half a dozen readings this edition keeps (`pyght`, `hool`, `alit`,
    `trappours`, `advision`) and three the other one carries (`trappings`, `jesseraunt`, `rightwise`)
    are asserted in both directions. It also pins Caxton's preface as an UNNUMBERED block before the
    first chapter of Book I, the rubric on all 503 heads including the one set as a centred block, and
    — in both directions, since they fail opposite ways — that no note and no marker reaches the page.
    **A MARCO POLO section (`poloChecks`) is Malory's position with an apparatus five times the
    size**, and it exists because the two faults that book actually had were both invisible to every
    count: a chapter whose note region was never found rendered Yule's whole commentary as Polo's
    own prose, and a footnote container carrying a `lang` attribute dropped its note in silence. So
    it sweeps the shipped file for a **"Note 1.—" label left standing in a chapter's body**, which
    is what the first looks like from the outside, and asserts every marker resolves, every note is
    referenced and exactly ONE note is cited twice — Yule does that once, and it is the Seneca rule
    working rather than a fault. It also counts the edition's own three marks, each of which is the
    book telling the reader whose words these are and each of which would be tidied away without a
    sound: the ⚜ on the seventeen chapters Yule gives in gist, his brackets round what he takes from
    Ramusio, and Cordier's —H. C. And it asserts **no `bk-n` marker anywhere**, this being a
    deliberately single-column book rather than one whose original failed to arrive.
    **A SATYRICON section (`satyriconChecks`) is there for the same reason**, and every assertion in
    it guards something that renders perfectly while being wrong. The balanced-matching and
    close-and-reopen rules fail by leaving a poem's words on the page in the wrong setting, so the
    check is a TAG BALANCE over both shipped columns plus the block and line counts (55 display
    quotations, 607 Latin lines against 23 English, and §120 opening mid-poem inside the Bellum
    Civile). The apparatus check runs the other way round from every count in this file — a leak makes
    a chapter LONGER — and the Greek one asserts §48's Sibyl is Greek rather than `Si/bulla, ti/
    qe/leis;`, that being the sentence a reader would report. Both of the first two were verified by
    having caught real faults on the way in: 49 blocks of 55 and 8 unbalanced sections.

    **It carries an AENEID section (`aeneidChecks`) for the reason it carries a City of God one**: that
    book's reader — `cards: "both"` plus the mid-line lift — serves one book, so it cannot be proved
    inert by re-running a sibling and the shipped data stands in. Every fault it hunts is silent, and the
    LINE COUNTS are the assertions that matter (13,336 English and 9,843 Latin): break the lift and up to
    69 lines of verse vanish with all twelve books still pairing and nothing thrown. Its weld sweep
    asserts EXACTLY ONE survivor — the source's own "the.dead" — so that a regression in the space rule
    returns 13 and fails here, and so the survivor cannot later be read as that rule having broken. It
    also caught the one claim this batch got wrong: nine of the twelve books pair on every card, not ten.
    **A change to `teiVerseBooks` needs OVID, LUCRETIUS, THE ILIAD AND THE ODYSSEY, both columns** —
    they are the only other books on that path, and the Iliad's prose branch and its two spacing rules
    were each proved inert against all four of the files that then existed, byte-for-byte, before being
    kept; the Odyssey's order-independent book-division rule was proved inert against all six the same
    way. `--force` is what re-runs the EXTRACTOR, the cache holding the extracted prose rather than the
    fetched page. Note that the two spacing rules are
    gated on `opts.prose` precisely so that check can pass: dropping a note or a milestone for a SPACE
    rather than for nothing would rewrite Ovid's Latin, which joins its lines with `<br>` and has
    nothing to weld.
    **AND THAT CHECK IS NOT A FORMALITY — IT FOUND A LIVE FAULT IN A SHIPPED BOOK** (Aug 2026, adding the
    Aeneid). Five of the six files came back byte-identical and Lucretius's Latin did not, because the
    new `<choice>` resolver corrected 110 doubled words that book had been printing since the day it was
    added ("aeraër" for *aër*). **A sibling diff is worth reading rather than glancing at**: a file that
    changes is not automatically a regression, and here the one that changed was the one that had been
    wrong all along. Record the intended diff and re-baseline deliberately.
    **A change to the CAPUT reader NOW HAS A SIBLING to diff against, and it is cheap** — the City of
    God and the Confessions are both on that path, and `--only-original --force` re-runs the extractor
    over 22 cached pages in seconds, so `node .claude/fetch-book.js city-of-god --only-original
    --force` plus an md5 of `books/city-of-god.la.js` is the check to run every time (it is what
    proved the fifth costume's `\b` inert). What stands in BESIDE it is the shipped-data sweep: 661
    and 278 marks a side, both columns a clean 1..N in every book, tag balance on both, every footnote
    marker resolving and every note referenced, and **no unconverted `CAPUT` left in either Latin
    except the one bracketed resumption in the City of God's Book I**, which is Migne's own and is
    deliberately left as printed. That last assertion is the one that would catch a SIXTH costume, and
    it is the fault no other check here can see — the fifth was found by a pairing warning and not by
    any count of the Latin itself.
    **A change to the ARTICULI reader has no sibling to diff against either** — the Summa is the only
    book on that path, and it is the only book here whose section numbers are decided by an ARITHMETIC
    CHECK against a figure the edition prints, so a regression cannot show up as a missing chapter or
    a short one. What stands in for the byte-for-byte check is the run's own report, which prints the
    figures the reader is built on: 614 chapters, 3,094 articles, and **592 of the 614 questions
    numbered by their own stated count**. That last number is the assertion — a fall in it means a
    heading shape has stopped being recognised, which nothing else can see, since the prose would
    still be complete and the chapter still the right length. `test-library.js`'s own sweep adds what
    the report cannot: that no chapter carries a leftover "Art." heading beyond the one the edition
    misnumbers, that the two questions with no article headings are the known two, and that all seven
    notes still have a marker pointing at them.
    **A change to `cleanBody`'s `body: "plain"` slice needs all four books that declare it** —
    Thucydides, the City of God, the Confessions and Journey to the West's original — which is how
    the Summa's transcluded-fragment fix was shown inert, byte-for-byte on every one.
    **A change to the SHLOKA reader has no sibling to diff against** — the Gita is the only book on
    that path — so what stands in for the byte-for-byte check is the shipped-data sweep the entry
    above describes: verse counts per discourse against the standard chapter lengths, the two columns
    identical marker for marker, tag balance, and **no verse cell carrying a numeral inside it except
    the last of each discourse, which is the colophon**. That last assertion is the one that catches a
    stream-cut regression, and it is the fault no other check in this repo can see.
    **A change to the TERZINE reader has no sibling to diff against either** — the Divine Comedy is
    the only book on that path, and it is the only book here whose numbers are COUNTED, so a
    regression cannot show up as a missing line or a short chapter. What stands in for the
    byte-for-byte check is the run's own report, which prints the figures the reader is built on:
    14,233 lines over 100 cantos, 4,811 tercet numbers, and **1,014 printed numerals checked against
    the count with 1,012 agreeing**. That last pair is the assertion — a change in it means a numeral
    has stopped being recognised in one of the two transcription shapes, which nothing else can see,
    since the poem would still be complete and the totals still right. The two misprints it names
    (Inferno IX and XXXII) should stay two.
    **Sections 3–6 NAME `seneca-letters` rather than opening whatever the shelf puts first** (fixed
    Aug 2026, when Aesop's Fables was added and took the lead under the "recent" sort). Two of those
    checks can only ever pass on Seneca — the four common nouns that mean something else in him, and
    the original-language control, which Aesop deliberately has not got — so a first-tile target made
    the whole block fail at once and report a missing Stoic on a page where nothing was wrong. **A
    check written about ONE book must name it**; that the first tile opens at all is asserted
    separately, in the shelf and search sections. The two banner assertions above it were fixed the
    other way, by checking EVERY banner names a work, an author and a length — order-proof, and a
    stronger claim, since a book added later with no author now fails there.
    **A shared-extractor change needs the byte-for-byte check as well as this suite**, since the suite
    walks the SHIPPED files and cannot see that an extractor would now produce something different:
    re-run one wiki book and one TEI book and diff the generated files against the committed ones.
    That is what proved the `data-n` carry inert on the seven books that predate it. **`plato-dialogues`
    is both at once** and is the cheapest single check (eleven wiki pages, eleven TEI files); a change to
    `cleanBody`'s `dropHeads` pass additionally needs the four OTHER books that declare `dropHeads` —
    `marcus-aurelius-meditations`, `plato-republic`, `aristotle-nicomachean-ethics`, `machiavelli-prince`
    — which is how the 2026-08-06 leading-furniture fix was shown inert (all four byte-identical). Run
    them with `--force --skip-original`: `--force` is what re-runs the EXTRACTOR, and the original is on
    a different path and need not be refetched to prove an English-side change.
    **A change to the DRAMA reader needs `sophocles-oedipus-rex`, and it needs BOTH columns** — it is
    the only other play, `plato-dialogues` does not touch that path, and the two columns go through the
    same reader with different options (the English lifts its notes, the original drops them), so a
    change that is inert on one may not be on the other. Run it with `--force` and no `--skip-original`;
    that is how the 2026-08-06 note lift was shown inert on the shipped play, byte-identical both sides.
    Two things it now pins that are new (Aug 2026, on request) and both fail silently. **The SORT**: the
    select must carry no direction in its labels (a reverse button beside "Title (A – Z)" makes the two
    controls contradict each other), the reverse must actually reverse, and the pair must survive a full
    RELOAD — a control that changes nothing looks exactly like one that works, and "the page should
    remember" is only testable across a reload. **The FAVOURITES**: holding a banner must open the sheet
    and NOT the book, and a starred book must appear ONCE — the duplicate is the failure a reader meets,
    since two identical banners leave them working out which is the real one. It also puts the shelf back
    (favourites cleared, sort reset) before section 3 runs, so the later sections still find the page they
    expect. **The SEARCH BOX** (Aug 2026) is pinned the same way and mostly for silent failures: the fold
    (`sun tzu` → Sun Tzŭ), words in any order, a line rather than an empty shelf when nothing matches, the
    query surviving a navigation AND a re-sort — the two-handler bug the glossary page documents — and,
    the one a reader actually meets, **a banner the search painted still opening its book**, since the hold
    sheet is wired per element and a repaint that forgets to rewire leaves a shelf that looks perfect. It
    runs AFTER the no-book-text-fetched assertion, because opening a book is the point of it.
  · `node .claude/test-account-page.js` — the SIGNED-IN account page and the Edit dashboard's account
    figures (Aug 2026). Neither is reachable without a session, so Supabase is a `page.route` stand-in —
    deliberately, and for the same reason as `test-publish.js`'s mock: the publishable key in app.js points
    at the REAL project. Like that mock it is a stand-in for the policies, never a proof they are right.
    It asserts the four account actions as a **2×2 grid** inside the profile card with the sync line under
    them, that the glossary meter is a link on your own record, and that the dashboard's People panel fills
    from the database and still says in prose what RLS will not let it count. **The mock sends
    `Access-Control-Expose-Headers: Content-Range` on purpose** — that header is not CORS-safelisted, and a
    mock that forgets it reports a connection failure that is really a CORS one. It also owns the **Profile
    showcase's "See Reliquary" button** (Aug 2026) — absent when the reader holds nothing, saying how many
    they DO hold, opening the collection and closing on Escape — because the signed-out account page carries
    no showcase at all and `test-artefacts.js` therefore cannot reach one. *(Since Sep 2026 there is no
    showcase anywhere: that button is the head row `showcaseHTML` was cut back to.)*
    **TWO OF ITS ASSERTIONS WERE STALE FOR A BATCH, AND BOTH HAD BEEN PINNING WHAT THE PAGE NO LONGER DID**
    (Aug 2026, found while shipping the collectibles): the account actions became a 2×2 grid and "See all 2"
    became "See Reliquary" with the count moved into the button's `title`, and the two checks went on
    demanding one row and a figure in the label. Neither was a regression — both were changes made the batch
    before, in a suite that batch did not name. **A suite is stale the moment a change lands that it does
    not run against**, and rewriting one to the current rule is not weakening it: what replaced the row test
    is a stronger claim (two columns, four buttons of ONE width, which is what the `1fr` columns are for),
    and what replaced the label test reads the count where the count now is. **Re-run after touching
    `acctSelfView` / `showcaseHTML` / `openCollectionWin` / `adminRenderDashboard` / `dashLoadRemote` /
    `supaFetch`'s count parsing.**
  · `node .claude/test-card-types.js` — the XP curve, community-deck **card types**, reverse cards,
    **bury siblings** and **one card per cloze** (Aug 2026), 228 assertions in five parts.
    **⚠ IT RAN 87 OF THEM FOR A FORTNIGHT AND SAID "82 passed"** (found and fixed Aug 2026): a `deckSheet`
    swallows clicks for its first `DECK_SHEET_ARM_MS` (500ms) and five of this file's sheet rows were pressed
    at 300–350ms, so the very first preset click did nothing, the `page.fill` after it timed out, and the
    whole browser half from that line on **never ran** — while the summary line still reported a pass count
    and only a lone "the run completed" FAIL said otherwise. **A suite that aborts mid-run reports its
    assertions so far as passes**, which is the most expensive kind of green there is; `sheetArmed(page)`
    now waits past the arm and **reads the constant out of app.js** rather than writing 500 down, so the
    next change to it cannot put the suite back. Watch for the same in any file that opens a sheet: the
    LANGUAGE sheet arms too, and its Ok button was the second offender.
    The **XP** part slices `levelFromXP` out of app.js and walks every threshold
    through level 13, so the shape of the curve is asserted rather than three sample points. The **pure** part
    runs `sanitizeCSSText` / `cssScoped` / `tplRender` as string functions with no browser at all — a scoping
    bug reads far better as a failed comparison than as a screenshot of a restyled page — and its central
    assertion is that a type's `.studio-tab{display:none}` cannot reach the site around it (probed on
    `.studio-tab` and NOT `.tabbar`, which is `display:none` above 640px anyway and would pass whatever the
    scoper did). The **browser** part builds a type and a card of it through the real Studio, studies it,
    reads the store back to prove the type travels with the DECK, and finally imports a **hostile deck file**
    through the real file picker: a type calling itself `basic`, a field name that is markup, an `onclick` in
    a template, a `javascript:` href, and CSS carrying `</style>`, `@import`, `url(javascript:)` and
    `position:fixed`. It also pins the **`{{FrontSide}}` rule in both directions** — the vocabulary shape's
    front printed ONCE with the shell's own question hidden, and the cloze shape's question still shown above
    an answer that does not repeat it — since each alone would pass on a rule that had stopped firing
    everywhere, and the failure reads as a template mistake rather than as a missing stylesheet rule.
    **`reverseChecks` runs with burying TURNED OFF for its deck, deliberately** — it is measuring the
    template-major ordering and each direction carrying a schedule of its own, and with burying on (the
    default) no session can reach both directions of a note at all, so its last assertion failed the day
    burying shipped. **`buryChecks` narrows `S.active` to its OWN deck** for the same reason in reverse: its
    counts are read off the pooled banner, and the two-way deck's seven cards reappear the moment `S.cards` is
    cleared to set a case up. It presses the visible **Undo** control rather than Ctrl+Z (the same code path,
    already pinned by test-revlog, and the key reaches the card only while nothing else holds the keyboard —
    this section has just been through a deck sheet and its focus trap), and it proves the day-expiry by
    **ageing the register** rather than by waiting.
    **`clozeChecks` runs LAST and is the ONE-CARD-PER-BLANK section** (Aug 2026): its deck declares a note
    with c1, c2 and **c9** on purpose, because the sparse case is where building ids by position deals
    `note~2` and `note~3` and renders a passage with nothing blanked — and a second type with the switch OFF
    beside it, since the two must not behave alike. It asserts through the SCHEDULE (each blank holds one of
    its own), through the dealt ORDER (a note's blanks never arrive back to back) and through the rendered
    TEXT (card 2 hides Egypt and shows the Nile), and it turns burying off for its own deck for
    `reverseChecks`' reason — with it on, no session can reach a note's second blank at all.
    **Re-run after touching the CARD TYPES block, `cardTypeSideHTML` / `ensureCardTypeStyle` /
    `cardTypeFieldGetter` / `.uc-hasfront` / `uCardSanitize` / `uDeckSanitizeMeta` / `typeCards` /
    `uCardIdFor` / `uDeckStudyIds` / `clozeMark` / `clozeOrds` / `clozeOrd` / `CLOZE_RX` / `type.cloze` /
    `isBuried` / `buryCard` / `burySiblings` / `deckBurySiblings` /
    `entryHasSiblings`, the Studio's Types tab, or `levelFromXP`.**
  · `node .claude/test-speak.js` — **automatic read-aloud on reveal, and the guard that keeps it quiet**;
    its last section (Aug 2026) is **the rule that a press must never come back as silence**, added after a
    reader reported that read-aloud "is not working at all" when studying Spanish.
    The first thing that report cost was a wrong diagnosis, and it is worth not repeating: the site-wide
    `ttsEnabled()` switch has had the whole read-aloud SYSTEM set aside since July 2026, so the obvious
    answer is that it is off on purpose — and it is the wrong answer, because a community card type's
    `.uc-tts` deliberately bypasses that switch, and the shipped language decks are exactly what uses it.
    The real fault was that **nothing failed**. A browser can carry `speechSynthesis` and
    `SpeechSynthesisUtterance` and have no voice installed behind them — ordinary on Linux without
    speech-dispatcher, on some Android WebViews, and **in headless Chromium, where the suite itself runs**,
    which is why the section can assert the reader's own case directly: `getVoices()` is empty, `speak()`
    returns with no sound, no error and no `onstart`, every guard passes, and the control draws itself as a
    live button that answers a press with nothing whatever.
    **All three cases are asserted together because the danger is symmetrical.** Refusing up front on an
    empty voice list was the first fix written and is wrong twice over — `getVoices()` arrives
    asynchronously, so the same list is empty at boot and full a second later, and on some engines it is
    empty while speech works — so case 1 pins that the attempt is still MADE and only the OUTCOME is
    reported. Case 2 pins that a device with voices but none for the card's language still speaks, in the
    card's own language, without having a wrong-language voice forced on it, and gets the *other* message.
    Case 3 is the half a one-sided test would have shipped broken: **an engine that really speaks must
    never be nagged**, and a suite that only tested the failure would have passed happily while toasting at
    every reader on earth.
    Each case installs its own stub rather than using the suite's `__spoke` recorder, because what is
    measured here is what the READER was told, which needs an "engine" that can be made to start or not
    start on demand. Two things a first draft got wrong: a hand-made voice object **is not** a
    `SpeechSynthesisVoice` and Chrome rejects the assignment, so a fixture that supplies one measures its
    own fixture rather than the code (use a voice whose language does not match, and none is assigned at
    all); and the report lands a full `TTS_SILENT_MS` after the press, so a probe that waits the old 700ms
    sees nothing and reads as a regression.
    **Re-run after touching `cardSpeak` / `ttsSilentNote` / `ttsCanSpeak` / `TTS_SILENT_MS` /
    `ttsSupported` / `speechVoiceFor` / `wireSpeakControls` / the `.uc-tts` listeners, or `body.no-tts`.**
