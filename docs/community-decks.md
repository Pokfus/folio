# Folio's community decks — the design, and what each decision cost

**Read this before touching the `COMMUNITY DECKS` block in app.js, the Studio, a card type,
a subdeck, or anything that publishes or installs a deck.**

`CLAUDE.md`'s "How the app is wired" carries the operational summary: what the stores are called,
which schema blocks a feature needs, the caps, and the invariants a change must not break. This file
carries the rest — why each phase is shaped the way it is, the bug each guard was written for, and
the several faults that shipped silently and were found by a reader rather than by a count.

The nine sections below are the bullets as they stood in CLAUDE.md, verbatim.

- **Community decks — Phase 0 foundations (July 2026).** Groundwork for user-created decks
  (`docs/user-decks-plan.md`). Nothing user-visible yet; these are the seams the feature will attach to, and
  they exist so the later phases can't be built the wrong way.
  · **`sanitizeHTML()` / `sanitizePlain()`** (in the helpers block, beside `esc`/`stripHtml`) — an allowlist
    sanitizer for content Folio did NOT author. Card fields are rich HTML rendered with `innerHTML`, and the
    Supabase access token lives in localStorage, so unsanitized user markup is account takeover for a learner
    and site defacement via `content_overrides` for an admin. Unknown tags are **unwrapped** (text survives),
    dangerous ones (`SANITIZE_DROP`) removed whole; attributes are dropped unless allowlisted; `class` is
    filtered to `SANITIZE_CLASSES` + `uc-*` (arbitrary classes let untrusted content borrow site chrome and
    spoof the UI); URL schemes are tested against a copy stripped of whitespace/control characters, because
    browsers read `java\tscript:` as `javascript:`. It re-sanitizes to a **fixed point** (mXSS) and escapes
    the input outright if it won't settle. **Call it on INGEST, not per render** — one missed render site
    would otherwise reopen the hole. Curated content never passes through it. 42 XSS vectors are covered by
    a Playwright test; re-run it after touching the allowlists.
  · **`UCARDS` / `cardById(id)` / `isCommunityCard(id)`** (beside `CARD_BY_ID`) — community cards get their
    OWN store and must never enter `CARDS` / `CARD_BY_ID` / `TREE` / `window.GLOSSARY` / `ADMIN_EDITS`.
    Four existing behaviours force this: `serializeCardData()` maps over `CARDS` (auto-save would bake user
    cards into `data.js`), `applyAdminEdits()` rebuilds the tree from `SHIPPED_NODES` on every admin edit,
    `adminUndo` rebuilds `CARDS` from `PRISTINE_CARDS`∩`BASE_CARD_IDS`, and the daily games draw from
    `ALL_CARD_IDS` (TREE-derived), which must stay fact-checked content only. `cardById()` is the lookup for
    the **study path** (scheduling, rendering, progress, the suspended list); the **admin editor deliberately
    keeps reading `CARD_BY_ID` directly** so it can only ever edit curated cards. `UCARDS` is empty today, so
    `cardById()` is currently a passthrough. Ids will be `u_<deck8>_<n>`.
  · **Scoped glossary indexes** — `buildGlossIndex()` now takes a scope and **returns** its index instead of
    assigning a single global; `glossIndexFor(scope)` caches per scope in `_glossIndexes`, `glossSourcesFor
    (scope)` picks the term tables, and `invalidateGlossIndex(scope)` (scope omitted = all) replaced the four
    `glossIndex = null` sites. `autoLinkGlossary(rootEl, answerText, offKeys, scope)` and `linkifyGloss(text,
    selfKey, scope)` take a trailing scope that **defaults to `"site"`, so every existing caller is
    unchanged**; `resolveGlossKey(idx, surface)` now takes the index. A deck with its own glossary gets scope
    `"deck:<id>"` so its terms auto-link inside its own cards and nowhere else — a single global index would
    leak a stranger's terms into curated backgrounds. Verified behaviourally identical to the previous code
    (same 125 auto-linked terms across 8 study cards).
  · **The shared card surface** (`liveCardEditorHTML(opts)` + `wireLiveCardEditor(host, opts)`, just above
    `adminRenderEditor`) — the `.card-edit-single` surface: ribbon, the four double-click-to-edit
    `.ces-field` contenteditables, the image slot/panel, the `#cesAnswerText` hook and the two-way HTML
    source box. **The admin editor and the Studio both render through it.** What stays with each caller is
    its own chrome: the admin's head bar, chronology field, deck picker and revert/delete; the Studio's
    equivalents. Callers pass `metaHtml` for the row above the card and receive every edit through
    `setField` / `afterEdit`, so neither editor knows anything about the other's store. Extracted in
    Phase 1, once the Studio existed as a real second caller — guessing the seam in Phase 0 would have
    meant refactoring the main content tool blind. `.claude/test-admin-editor.js` guards it.
- **Community decks — Phase 1: local decks + deck files (July 2026).** Users can write their own decks.
  Entirely local: no server, no account, no publishing (Phases 2+ in `docs/user-decks-plan.md`).
  · **Stores** — `UDECKS` (deckId → meta + `cardIds`), `UCARDS` (cardId → the 13 `CARD_FIELDS` + optional
    `image`), `UGLOSS` (reserved for the per-deck glossary). Card ids are `u_<deck8>_<n>`; a deck's active
    entry in `S.active` is `"u:<deckId>"` (`uDeckIdOf` / `uDeckEntry`). The whole module sits under the
    `COMMUNITY DECKS` banner in app.js.
  · **A DECK IS DEVICE-LOCAL AND READER-SPECIFIC, AND THE SECOND HALF IS A REGISTER** — `folio_deck_own_v1`,
    account id → deck id → when, read by `communityBoot`, which mounts only what the current reader owns.
    Two accounts on one device share the one store and see different shelves. See the `lang-decks.js` bullet
    under the File map for the whole of it (`uDeckOwned` / `uDeckClaim` / `deckOwnBackfill` /
    `communityRemount`, and why `uDeckCreate` has to claim for itself).
  · **Persistence** — IndexedDB `folio-community`, at version **2**, in TWO object stores (Aug 2026, on the
    report that loading thousands of cards to study a few made no sense). `decks` holds one SMALL record per
    deck — `{ id, srev, fmt, meta, gloss, index }` — and `notes` holds one record per note, keyed
    `"<deckId>/<noteId>"` with a `deckId` index for bulk reads. **Boot reads only the first.** `fmt` is the
    STORE's shape version and is not the export file's: a deck FILE has looked the same throughout
    (`{ id, meta, cards, gloss }`, still what `uDeckRecordFull` builds), while a record with no `fmt` is a
    fmt-1 record with its cards inline and is migrated on the next boot.
    **WHAT MAKES THE SPLIT POSSIBLE is that boot needs a card's IDENTITY and never its CONTENT.** An index
    entry is `{ id, sub, type, ords? }` — the subdeck it sits in, the card type it uses, and for a cloze note
    its deletion ordinals — which is everything needed to COUNT, GROUP, ORDER and SCHEDULE a card; content is
    needed only to RENDER one. `fields` alone is 81% of a deck, so the index is a thirtieth of it.
    **Measured on one machine, same harness, the 10,896-note HSK 3.0 deck installed** (`.claude/` has no
    committed benchmark; this was `compare.js` in a scratchpad, and the way to re-take it is to instrument
    `communityBoot` and read `JSON.stringify` sizes off `rows` and `UCARDS`):
    | | before | after |
    |---|---|---|
    | `communityBoot` | 501 ms (IDB read 326, mount 57) | **213 ms** (IDB read 191, mount 16) |
    | read at boot | 17.87 MB | **0.55 MB** |
    | resident after boot | 18.19 MB | **1.01 MB** |
    | import — deck visible | 6.6 s | 6.8 s |
    | import — fully written | 10.7 s | **18.9 s** |
    Note what the first row does NOT say: most of what is left is the fixed cost of opening IndexedDB at all
    (a boot with NO deck installed measures ~195 ms here), so the deck's own marginal cost is now the 16 ms
    of mounting. A session then reads its own cards in **8 ms / 109 KB**.
    **`ords` MUST be precomputed** (`uNoteIndexEntry`), because `clozeOrds` reads the note's own fields:
    without it a cloze deck could not be counted or scheduled until its content had loaded, and the counts
    are wanted on the home page long before a card is rendered. It is computed only for a type that declares
    `cloze`, or importing that deck would mean a regex sweep of 14 MB of fields for nothing.
    **THE COST IS AT IMPORT and it is real**: 10,896 individual puts take ~7.4 s where one blob took 246 ms.
    It is ONE transaction, so it is atomic — an interrupted import or migration leaves the old state rather
    than half a deck, which is what makes the migration safe to run on somebody's own data without asking.
    **AND IT MADE A LATENT RACE WORTH HANDLING**: the deck is usable from memory the moment it mounts, but a
    page closed or navigated before the transaction commits aborts it and loses the import in silence — a
    window that was 246 ms and is now several seconds. So `uDeckImportText` hands its write BACK
    (`r.saved`) and **`uImportDone` waits on it before saying "Imported"**, announcing "Saving…" if the wait
    passes 400 ms. `uDeckInstall` already awaited its own. Found by the measurement rather than by a
    reader: the harness reloaded 6 s after importing and the deck was simply not there.
    **Chunking notes in groups of 25 was measured and rejected** (import 1.6 s): a due-card session is
    SCATTERED, so it hits about the same number of records whatever their size, and chunks of 25 pulled
    1.7 MB to read the same 60 notes that cost 109 KB one at a time.
    **An unusable IndexedDB silently falls back to `localStorage["folio_community_v1"]`** (`_communityLS`),
    which keeps the **fmt-1 whole-record shape** and mounts every card eagerly: the golden rule is that
    opening index.html directly keeps working, and private mode / blocked storage are real too. That is a
    decision rather than an omission — the ~5 MB quota means a deck big enough to want splitting cannot be
    stored there at all, so a lazy path there would be written for a case that cannot arise. Verified both ways.
  · **WARMING — how `cardById` stays synchronous** (`uWarm` / `uWarmed` / `uWarmDeck` / `uWarmDecks` /
    `uAdoptNotes` / `uNoteStub` / `uIsLazy`). `cardById` is called from rendering, scheduling, grading and
    undo, so content cannot be fetched at the moment it is asked for — making it async would be a rewrite of
    the study path. It is loaded BEFORE it is needed instead, which is the pattern the lazy data bundles
    already use: ask, hold a `.data-loading` placard, re-render when it lands.
    **A stub is a CARD-SHAPED object living in `UCARDS`**, deliberately not a second map beside it —
    everything that reads `.deckId`, `.sub` or `.type` off a note (the subdeck list, `cardEntryId`,
    `glossScopeForCard`, the browser's deck column) keeps working untouched, and only the places that read a
    card's PROSE need a warm first. **`PAGES.study` warms its own queue** behind the placard; **`PAGES.home`
    warms the day's review at idle**, so in ordinary use the placard is never seen. The bulk surfaces —
    the Studio with a deck open, `PAGES.browse` (it searches card TEXT, so it genuinely needs all of it),
    `uDeckExport`, `uDeckPublish` and the Studio's duplicate — call `uWarmDeck`, one read through the
    `deckId` index (~557 ms for 10,896 notes). **`_gone` is the guard against a hang**: a note the index
    names but the store cannot hand back would leave `uWarmed` false for ever and a placard that never
    lifts, so the stub stops claiming to be loadable — while staying LAZY, so `uNoteRecord` goes on refusing
    to write it and a transient read error can never overwrite good content with a blank.
  · **`uDeckSave(deckId, putIds, delIds)` writes what changed.** Passing neither list writes only the index,
    which is what a renamed deck, a reordered card or an edited type needs; a card mutation goes through
    **`uCardTouched(cardId)`** so "which note changed" is never a caller's guess, and a whole-deck write
    (import, install, duplicate, migration) goes through **`uDeckSaveAll`**. Before this, all 26 `uDeckSave`
    call sites rewrote the entire record — **a keystroke in the Studio rewrote 19 MB.** `uTypeDelete` is the
    one non-card mutation that must name notes: it strips `type` and `fields` from every card of that type,
    and an index-only write would leave every one of them still carrying the dead type on disk.
  · **`uDeckNormalize` is the single ingest choke point** — everything entering the store passes through it,
    imports *and* what comes back out of IndexedDB, because that store is writable by anything on the origin.
    Rich fields go through `sanitizeHTML`, plain ones through `sanitizePlain`, image `src` through
    `sanitizeUrl`. `uCardSet` sanitizes on write too, so an exported deck is clean at the source. **The
    contenteditable is never rewritten mid-keystroke** — only the stored value is sanitized, or the caret
    would fight the sanitizer.
  · **…EXCEPT WHERE THE SAME SANITIZER PROVABLY WROTE IT, WHICH IS ARITHMETIC RATHER THAN TRUST**
    (`SANITIZE_REV` / `srev` / `_uTrusted` / `uSH` / `uSP` / `uSCSS`; Aug 2026, on a report that the site
    had become very slow with a large deck installed). `sanitizeHTML` returns a **FIXED POINT** by
    construction — it loops until another pass changes nothing — and `sanitizePlain` / `sanitizeCSSText`
    are idempotent the same way, so re-cleaning a record this build's own sanitizer produced cannot alter
    a character. It was doing exactly that on **every page load**: on HSK 3.0 (10,896 notes) **5.7 seconds
    and 174,741 `sanitizeHTML` calls** of provable no-op before the first paint, most of them DOM-parsing
    the same Chinese markup for the fourth time. A stored record now carries **`srev`**, and
    **`communityBoot` — reading OUR store, and nothing else — passes `trusted`**, which skips the per-field
    string work while every structural guard still runs: the id patterns, the key whitelists, the URL
    schemes, the caps, the shape. Measured on the same harness: the deck's cost on a reload went from
    **+5.8s to +0.4s**, and `uDeckNormalize` from 5,756ms to 33ms.
    · **What it gives up is EXACTLY what the stamp exists to catch** — a deck cleaned by an OLDER and
      possibly buggier sanitizer, which is what a record with no matching `srev` is. Those are re-cleaned
      once, on the next load. An import, an install and a published payload are **never** trusted whatever
      they claim to carry, since only `communityBoot` passes the flag.
    · **…and the same stamp answers for the deck's NOTES, which now arrive later than it does**
      (`_deckTrusted`, Aug 2026, with the store split). A note's content is read out of the `notes` store
      long after boot decided whether its deck's record was trustworthy, so that verdict is kept per deck
      and `uAdoptNotes` cleans under it. The two were written in the same transaction by the same
      sanitizer, so one answer is honestly good for both — but it must be the answer boot reached, never a
      fresh assumption at warm time, or a deck cleaned by an older sanitizer would have its cards trusted
      on the strength of nothing.
    · **BUMP `SANITIZE_REV` WHENEVER THE SANITIZER CHANGES** — `sanitizePass`, `sanitizeHTML`,
      `sanitizePlain`, `sanitizeCSSText`, `sanitizeUrl` or any `SANITIZE_*` / `UTYPE_*` allowlist.
      Forgetting to is the one way this can be wrong, and it is silent: already-stored decks keep being
      read under the old rules.
    · **It was NOT bumped for the deck-id guard of Aug 2026, and the reasoning is worth keeping** because
      "did you bump it?" is the first question the next reader will ask. `uDeckSanitizeMeta` used to test
      `String(m && m.id)`, and `String(undefined)` is the WORD "undefined" — nine lowercase letters, which
      matches the id pattern — so a deck file with no id of its own was given the literal id `undefined`.
      That is a sanitizer fix, but **no STORED record can carry it**: every path that reaches the store
      either supplies a real id (`remoteToLocal`, `communityBoot`) or replaces a falsy one before mounting
      (`uDeckImportText`). Nothing needs re-cleaning, and bumping would have cost every reader a one-time
      full re-sanitize — 5.7 s on HSK 3.0 — to fix nothing. **Bump it when a stored record could be
      wrong, not merely when a sanitizer line moved.**
    · **`srev` sits at the record's TOP level, never inside `meta`** — `meta` is what an export copies, and
      a deck FILE must never carry a stamp, being not our store. Verified: `uDeckExport`, the Studio's fork
      and `uDeckRemotePayload` each pick their fields explicitly, so only `cdbPut` ever stores it.
    · **`_uTrusted` is a module flag set around a SYNCHRONOUS body and restored in a `finally`** — nothing
      awaits inside `uDeckNormalizeInner`, so it cannot leak into a Studio mutation that shares those same
      sanitizers.
    · Guarded by **`.claude/test-deck-trust.js`**, in both directions — a planted record with no `srev` is
      still cleaned (verified by reintroducing the fault: the hostile card's fields reach the page and its
      payload runs), and a record we write really does carry the stamp, which is a PERFORMANCE guarantee
      and therefore one that looks identical whether it holds or not.
  · **`sanitizePlain` gained `sanitizeHTML`'s own fast path** in the same pass: a string with no `<` and no
    `&` can produce no element and decode no entity, so `body.textContent` is provably the input and only
    the whitespace collapse is left. **88% of the string fields in a large deck take it**, and each was a
    DOMParser round trip. It applies everywhere, imports included — it is not gated on trust.
  · **`UDECK_MAX_CARDS` is 85,000 and a file over it is REFUSED, not trimmed** (Aug 2026). It was 500,
    applied by a silent `slice` in `uDeckNormalize`, and the failure shape is the one this file keeps
    recording: an over-size deck imported cleanly, toasted success, and was simply missing everything past
    the five hundredth card — which reads as a deck rather than as a failure, and is found weeks later by a
    reader who cannot find a word. `uDeckNormalize` now returns `over` (how many the cap cost) and
    `uDeckImportText` turns any positive value into an error naming both numbers. **The slice stays** as the
    defensive floor, because that function also loads IndexedDB rows and installs, where refusing would mean
    a deck that cannot be opened at all. The number itself is a guard against a hostile file rather than a
    view about how big a deck should be, and **it is set from the largest legitimate deck anyone has
    brought — so a legitimate deck that will not fit is what MOVES it**, which has now happened four
    times: the whole of HSK 3.0 in one file took it to 12,000, all the Italian in one to 20,000, every
    vocabulary deck on the shelf combined (`.claude/combine-decks.py`) to 44,000 — and then that same file
    once Portuguese was added to its table, **76,502 rows across seven languages**, to here. **A deck that
    size is usable and that was MEASURED rather than assumed** — see
    the timings under that file's own bullet, and the Persistence bullet above for why a later boot is
    cheap. **IT COUNTS ROWS IN THE FILE, NOT CARDS TO STUDY**, which since reverse cards is a real
    distinction — and **it cuts BOTH ways, which is worth knowing before reading anything into the
    figure**: HSK 3.0 asks a word in both directions from ONE row, by giving its card type two templates,
    so its 10,896 rows are 21,792 cards; a deck whose two directions are separately addable SUBDECKS
    cannot, a subdeck being a property of a row, so there a word is two rows and 16,782 rows is only 8,400
    words. It is deliberately left on the thing the FILE holds, since what it guards is the cost of
    parsing somebody else's file.
  · **…AND THERE IS A SECOND CAP, ON THE BYTES, which has to be kept in step BY HAND** (`UDECK_MAX_BYTES`,
    208 MB, in `uDeckImportFile`; Aug 2026). It guards the READ — a card count can only be taken once the
    whole file is a string and then an object, so something has to stop a 500 MB file before that. Four
    things about it. **It was 8 MB, unexplained, and nothing tied it to the card cap**: the two disagreed
    for a fortnight, and the HSK 3.0 level 6 deck had quietly come within 600 KB of it — an unrelated magic
    number is how a legitimate deck comes to be refused for a reason nobody can find. **The per-row figure
    is measured, and has been stale TWICE**: the comment once said "~2 KB a note, measured over the HSK
    decks, whose notes are the largest here" when the HSK rows are in fact the LIGHTEST, and the 4 KB that
    replaced it was overtaken within the day by the bolding of the conjugation tables — measured over all
    23 shipped decks it runs **1.08 KB a row** (Italian phrases, no paradigm) to **4.31** (DELE B1, a full
    one), the combined file averaging 2.42. **THE STRICT DERIVATION IS THEREFORE ABANDONED, AND SAYING SO
    IS THE POINT**: "the row cap × the heaviest row must fit" now means 350 MB, a byte cap that guards
    nothing, justified by a file of 85,000 uniformly heaviest rows that does not exist. What is set is the
    largest real file plus about a tenth — 183.5 MB became 208 — and the tension is left REAL rather than
    papered over: a deck of 50,000 all-heavy rows is under the row cap and over this one. That is tolerable **only because it is
    not silent**: the message names the size AND the limit and says to split it, which is exactly what the
    8 MB cap did not do.
    **THE HONEST COST OF THE RAISE, stated in app.js and not only here**: a file near this cap is read into
    a string and then `JSON.parse`d, so a phone briefly holds several times the file in JS heap and a deck
    at the limit may fail to import on a low-end device where two half-size ones would not. The cap is a
    guard against a hostile file, not a promise that anything under it imports anywhere.
  · **Bridges into the rest of the app** are deliberately few: `entryCardIds` / `entryInfo` /
    `activeEntryIds` (accept `u:` entries), `availableCardIdSet` (adds community cards so they reach the
    daily review), `buildSession`'s `scope.type === "udeck"`, and `cardById`. **The daily games are NOT
    bridged** — they draw from `ALL_CARD_IDS`, which is TREE-derived, so unvetted cards can't reach them.
    That's asserted by the test, not just intended.
  · **Studio** (`PAGES.studio`, `#studio`, `studioState`) — deck list → one deck (details, card list with
    reorder, the shared card surface). Reached from the **Collections page's "Your decks" section**, not the
    nav bar. Community rows are visually distinct (dashed rule, no collection hue) and the section says
    plainly that these decks are **not fact-checked by Folio** — Folio's content rules can't be imposed on a
    stranger, and the credibility of the curated decks is the whole product.
    **The way back is a `.back-link` at the TOP LEFT, above the heading, reading "← Back to Collections"**
    (Aug 2026, on request). It was a third ghost button in the row of actions under the heading, where it
    read as another thing to do rather than as the way out, and it said "Back to the Library" — the page it
    returns to was renamed Collections when the books took that name, and two pages called Library is how a
    reader ends up on the wrong one.
  · **Deck files** — `uDeckExport` writes `<name>.folio-deck.json` (`{ folioDeck: 1, meta, cards, gloss }`);
    `uDeckPickFile` → `uDeckImportText` reads one back. An import always takes a **fresh deck id and fresh
    card ids** when the id already exists, so importing can never overwrite a deck you're working on and two
    copies keep separate study progress. Blob URLs are revoked on a timer, not synchronously — an immediate
    revoke can cancel the download.
  · (The per-deck glossary that `deck.glossMode` refers to landed in Phase 4 — see below.)
- **Community decks — Phase 2: publishing, discovery, moderation (July 2026).** A deck can now go online.
  **⚠ The phase-2 SQL at the end of `.claude/supabase-schema.sql` must be run once** (Dashboard → SQL
  Editor) or every community call 404s; `communityErr()` turns that into "Deck sharing isn't set up on this
  site yet." rather than leaking PostgREST's error, and nothing else breaks.
  · **Tables** — `user_decks` (one row per published deck, with `slug`/`status`/`version`/denormalised
    `card_count` + `install_count`), `user_cards` (**one row per card**, PK `(deck_id, id)`), `user_gloss`,
    `deck_installs`, `deck_reports`. Cards are rows and not one jsonb blob **because that is the paywall
    seam**: the `user_cards` select policy already reads `is_demo or d.price_cents = 0`, so Phase 5 only has
    to flip non-demo cards and add `or exists (entitlement)`. A blob cannot be partially gated, and a
    client-side filter is not a paywall. `price_cents` / `is_demo` ship now so that phase needs no migration.
  · **Ownership** — a local deck is **mine** (`origin !== "installed"`) or **installed**. Mine can be
    published (`uDeckPublish` → insert/patch `user_decks`, then delete + re-insert every `user_cards` row,
    which is simpler than diffing and safe because **card ids are stable across a publish, so a learner's
    scheduling survives an update**). Installed decks are **read-only in the Studio** — editing would
    silently fork them and then the author's next update would either clobber the edits or be refused;
    "Duplicate to edit" makes the copy explicit (it round-trips through `uDeckImportText(..., true)`).
  · **THE CARD FETCH IS PAGED, AND WENT UNPAGED FOR A YEAR** (`SUPA_PAGE`, Aug 2026). PostgREST hands back
    at most `db-max-rows` — 1,000 — and says nothing about what it dropped, so `communityFetchDeck`, which
    asked for a deck's `user_cards` in one request, **returned the first thousand cards of anything larger
    and installed it as though that were the deck.** A truncated deck is indistinguishable from a small one:
    nothing throws, it opens, it studies, and the missing cards are found weeks later by a reader who cannot
    find a word. The loop is `revFetchAll`'s, which had the rule right from the day it shipped and states it
    in a comment two thousand lines further up — so the constant now lives beside that reader as a fact
    about the API rather than inside it, and `uDeckPublish` POSTs its rows in batches of the same size
    rather than putting 10,896 of them in one body. **`.claude/test-publish.js`'s mock truncates a request
    that carries no `Range`**, so an unpaged fetch fails there instead of on somebody's live project; its
    cap is deliberately NOT below the client's own page size, which would be a server no client could page
    correctly at all — asking for 1,000 and being given 3 is indistinguishable from a table holding 3.
  · **`UDECK_PUBLISH_KEYS` never leave the device.** `uDeckExport` strips them and `uDeckImportText` zeroes
    them, so a deck *file* can't claim someone else's slug, masquerade as installed, or suppress an update
    prompt. Only `UDECK_META_KEYS` travel in a `.folio-deck.json`. **`srev` and `fmt` never leave it
    either**, and for a stronger reason: they are the store's own bookkeeping, and a file carrying them
    would be claiming to have been cleaned by a sanitizer it has never met.
  · **Pages** — the shared decks are a SECTION AT THE FOOT OF THE COLLECTIONS PAGE (`sharedDecksHTML` /
    `wireSharedDecks` inside `PAGES.decks`, below "Your decks"), and `PAGES.deck` (`#deck/<slug>`, a
    shareable deep link parsed at boot and on `hashchange`, the same shape as `#map/<year>/<slug>`). The
    deck page renders **a real flippable sample card**, re-sanitized through `uCardSanitize` — the server
    copy is never trusted just because it came from our own API.
    **`PAGES.community` IS GONE, AND `#community` REDIRECTS** (Aug 2026, on request). It was a page of its
    own reached from the collections page, which put a reader one navigation away from the shelf they were
    already looking at — so the browse list moved to the bottom of that page, under the reader's own decks,
    where the two kinds of deck read as one shelf. The route is **deleted from `valid`** and both hash
    readers (boot's `initName` and the `hashchange` handler) map `community` → `decks`, so **every link ever
    shared still lands somewhere sensible**; the redirect is deliberately NOT a `PAGES.community` that calls
    `route("decks")`, which would re-enter `render()` from inside a render.
    **THE TWO READERS HAD TO BE MADE TO AGREE ABOUT THE ADDRESS BAR, and only a test noticed.** The
    hashchange path goes through `route`, which rewrites the hash; boot renders DIRECTLY, so a reader
    following an old link cold got the right page under a URL still naming the dead route — which they
    would then re-share, and return to on every Back. Boot now corrects it with **`history.replaceState`**:
    assigning `location.hash` would fire a hashchange and re-render the page being rendered, and would
    leave the dead route in the history for Back to land on. **A redirect is not finished when the right
    page appears** — `test-publish.js` asserts both readers for exactly this reason, and the cold-load half
    is the one that failed.
    **TO TEST THE BOOT READER, DIFFER THE QUERY, NOT THE FRAGMENT** — `goto` to a URL differing only in the
    hash is a same-document navigation, so boot never runs, and the obvious hop through `about:blank` is
    worse than useless: that origin is opaque, the harness's own init script runs there and dies reading
    localStorage, and the SecurityError then fails the end-of-run "no page errors" watcher for the whole
    file. `?coldboot=1#community` is a real load and the app ignores unknown query parameters. Note that
    `replaceState` keeps `location.search`, which is right — dropping a reader's query string would be a
    second bug.
    **IT IS A SORTABLE TABLE, NOT BANNERS** (`COMMUNITY_COLS` / `communityCol` / `sharedTh` /
    `sharedRowsHTML` / `.sd-table`, same request; the old `deckRowHTML` / `.cdeck-list` are gone, as the
    `.cdeck-grid` tiles were before them). Deck, author, rating, cards, installs, updated — each a column
    with a header that sorts, which is what a reader comparing twenty strangers' decks is actually doing.
    Three things are load-bearing. **The sort key is whitelisted through `communityCol`**, because it goes
    into PostgREST's `order=` and a key taken from the page would be an injection point. **The state is
    module-level (`communityState`) rather than in `S`** — it is a way of looking at a list, the glossary
    record's call — so it survives navigating away and back within a session and resets on reload. And
    **below 640px the author, installs and updated columns go** rather than being squeezed: at 390px the
    deck's title is the only part of a row with no shorter form.
    **A ROW IS ONE LINE** (Aug 2026, on request): the title cell carried the deck's first description line
    under it (`.sd-sub`), which made every row two or three lines tall and turned a table into a stack of
    paragraphs — so `.sd-deck` no longer wraps and the title ellipsises. The description is on the deck's
    own page, under a heading, which is where a reader deciding whether to install it goes. **Mind that
    `.sd-sub` exists TWICE in styles.css** — the Studio's deck row uses the same name for a different
    element — and only the table's rule went.
    **AND THE DECK'S PAGE IS WHERE EVERYTHING ABOUT IT IS** (same request). Four things were named and three
    of them were already there — its information, the author's own description (the Studio's `desc`,
    published as `description`), and other people's comments (see the ratings bullet: a comment is a rating
    with something written on it, which is the shape the schema holds and the right one, since a comment on
    a stranger's deck is an opinion about whether it is worth using). What was ADDED is **a download link**
    (`deckFileDownload` → `downloadDeckFile`): "Add to my decks" installs it into Folio, and this writes the
    same `.folio-deck.json` a Studio export writes, for a reader who wants a copy, wants to pass it on, or
    is not signed in to anything. It goes through `remoteToLocal` and then strips the publishing keys
    exactly as `uDeckExport` does — one importer, one file format, one set of rules about what may travel —
    and `uDeckExport` now shares `downloadDeckFile` rather than carrying its own copy of the blob dance.
    The description is set as PROSE under a heading of its own, and where there is none the page says so:
    a reader deciding whether to install a stranger's deck is owed the difference between "the author said
    nothing" and a gap where something might have failed to load.
  · **Installs** — `deck_installs` is one row per user per deck, which both syncs a signed-in learner's
    installs and gives `install_count` an honest trigger-maintained source. Installing works **signed out**
    too (the deck lands in IndexedDB; only the row and the count need an account).
  · **Card-id collisions** — `remoteToLocal` remaps a deck's card ids if any already belong to a *different*
    local deck, so two installs can never collide in `UCARDS` / `S.cards`.
  · **Moderation** — a Report control on every deck page (`deck_reports`, reasons are a CHECK constraint),
    and an admin-only queue on `#community` with Hide / Restore / Dismiss. Hiding sets `status='hidden'`,
    which the RLS select policy already excludes from everyone but the owner and admins.
  · **Update checks** — `communityCheckUpdates()` runs once at idle after boot, in ONE request for all
    installed decks, and fills `_deckUpdates` (Library and Studio show an "update" pill). A failed or
    offline check just leaves it empty.
  · **DELETING A DECK YOU PUBLISHED DELETES THE SHARED COPY** (`uDeckRemoteDelete` / `confirmDeleteDeck`,
    Aug 2026, on a bug report: decks deleted in the Studio "still appear on the shared decks page"). It is
    the shape of failure this file keeps recording, at its worst. `uDeckDelete` only ever removed the LOCAL
    record — nothing threw, the deck vanished from the author's own Studio, and only somebody ELSE browsing
    ever saw what was left behind. And it was UNRECOVERABLE from inside the app: the Unpublish button reads
    `remoteId` off the local deck, which is precisely the thing just thrown away, so every publish-then-delete
    left an orphan its own author could not take down. Five things.
    **A ROW DELETE, NOT `status='draft'`** (on request): the cards, glossary, ratings, reports and install
    records all cascade and the slug is freed, which is what "I deleted it" means. Someone who already
    installed it keeps their copy — it simply stops offering updates.
    **THE STATUS CANNOT BE TRUSTED, SO THE ROWS ARE READ BACK.** RLS picks ROWS, never permission to try, so
    a DELETE matching nothing still answers 204 — signed in as another account, or under a stale token, the
    request "succeeds" and removes nothing. `Prefer: return=representation` is the only way to tell, and
    reporting a silent failure as success is the exact bug being fixed.
    **THE REMOTE GOES FIRST AND A FAILURE STOPS THE WHOLE THING**: the local record is the only handle on the
    remote row, so deleting it while the server call is failing manufactures the very orphan this prevents.
    **SIGNED OUT, THE CONFIRMATION SAYS SO BEFORE THE READER AGREES** rather than reporting it afterwards.
    **AND `uDeckUninstall` MUST NOT GO THROUGH ANY OF IT** — an installed deck's row is the AUTHOR's, so the
    gate is `uDeckIsMine`, not merely having a `remoteId`. `uDeckDelete` is documented local-only for that
    reason; a third caller has to answer the same question.
  · **…AND THE STUDIO LISTS PUBLISHED DECKS THIS DEVICE HAS NO COPY OF** (`myRemoteDecksLoad` /
    `orphanRemoteDecks` / `orphanSectionHTML` / `_myRemote`, same batch). The other half: a row can lose its
    local counterpart for reasons the rule above cannot cover — deleted on another device, deleted while
    signed out, or left by the bug itself — and with nothing local holding its `remoteId` there is no way
    back. So the Studio asks the server what this ACCOUNT owns and lists whatever is missing here, each with
    a Remove. Fetched once a session and only when signed in; **absent, not empty, when there is nothing to
    show**, since for almost every reader there never will be. `localDeckForRemote` is the same lookup the
    update check uses, so a deck that IS installed here can never be offered for removal.
  · **A READER'S SHARED DECKS ARE THE SAME ON EVERY DEVICE THE ACCOUNT IS SIGNED IN ON**
    (`communitySyncInstalls` / `communitySyncSoon` / `communityFetchDeckById` / `deckExistsRemote` /
    `deckSyncRead` / `deckSyncInstalled` / `deckSyncPending` / `localIdForRemote` / `uDeckRekey` /
    `communityAlignDeckIds` / `DECK_SYNC_KEY` / `DECK_SYNC_MAX` / `_deckSyncFor`; Aug 2026, on request).
    `deck_installs` has recorded one row per (deck, account) since publishing shipped and **nothing ever
    read it back**: adding a shared deck wrote the row and then wrote the deck into that device's
    IndexedDB, so a reader signed in on a phone and a laptop had to find and add the same deck twice — and
    the second copy kept a schedule of its own. The row was already the account's own answer to "which
    shared decks are mine"; this reconciles against it, at idle, from `communityBoot`, `supaBoot` and
    `supaAfterSignIn` alike. **It needs no schema change** and no migration: every deck installed while
    signed in already has its row.
    Seven things are decisions rather than plumbing.
    **IT GOES BOTH WAYS — an addition travels, a removal travels, and a deck the account has never heard
    of is announced.** What makes that possible rather than merely desirable is the RECORD OF THE LAST
    AGREED STATE (`folio_deck_sync_v1`, device-local like `_supaTs` and `_supaOwner`, because it is a
    statement about THIS device's last reconciliation): a deck here that the account does not list means
    two opposite things — removed on another device, or added here while signed out — and without that
    record they are indistinguishable, so mirroring would eventually delete a deck nobody removed and
    pushing would resurrect one somebody did. It holds `seen` (per account, what the server last listed),
    `pend` (removals this device could not deliver) and `by` (remote id → the account that installed it).
    **THE DESTRUCTIVE HALF STANDS DOWN WHEREVER THE EVIDENCE IS NOT CERTAIN.** A mirrored removal deletes
    a deck and its review rows, so it is deferred — while going on being CLAIMED in `seen`, or the next
    pass reads it as this device's own and announces it back — when the page may be truncated (a full page
    cannot tell a missing row from an unread one), when a session is studying that deck (`cardById` would
    answer nothing mid-card), and, the one that is not a timing question, **when the DECK ITSELF IS GONE**
    (`deckExistsRemote`): deleting a published deck cascades its install rows away, so from here an
    author's delete looks exactly like a reader's removal, and mirroring it would take a stranger's deck
    and their progress for something they never did. Hiding one reads the same way, for free, since a
    hidden deck is not selectable by anyone but its owner. **And it is never fatal**: card progress lives
    in `S.cards` under ids that do not change, so a deck added back brings its schedule with it.
    **A DECK ANOTHER ACCOUNT INSTALLED ON THIS DEVICE IS UNTOUCHED, IN BOTH DIRECTIONS.** Community decks
    are device-local and shared by every account signing in here, so `by` is what stops account B
    announcing account A's shelf as its own — the adoption `_supaOwner` exists to prevent one layer up. It
    is recorded AT THE INSTALL rather than at the next sync, because a sync interrupted by a navigation
    writes nothing; and an install made while SIGNED OUT clears the entry rather than keeping a stale one,
    or a re-install would be read as the removal that preceded it.
    **IT MUST RUN AFTER THE LOCAL STORE HAS MOUNTED, which is what `communitySyncSoon` is for**: every
    caller calls it and whichever is last does the work, since either half can land first (a cold boot
    mounts IndexedDB while supaBoot is still refreshing an expired token, and a sign-in happens long after
    both). Run before the mount, `localDeckForRemote` sees nothing and the account's decks are installed a
    second time, each copy with its own schedule.
    **THE SAME DECK TAKES THE SAME LOCAL ID ON EVERY DEVICE** (`localIdForRemote`), and that is what makes
    the rest of what the account syncs actually land: `S.active`'s `u:<id>` entries, the per-deck daily
    limits, the scheduler choice, the row's colour, the review's order and its groups are all keyed by that
    id and by nothing else, and it was `uid(8)` — so the deck arrived and every decision the reader had
    made about it stopped at the device it was made on. It is a **hash of the WHOLE remote id** rather than
    the obvious first eight hex characters of the UUID: those are a TIMESTAMP under the time-ordered
    UUIDv7, so two decks published in the same second would collide on a rule whose whole point is that it
    never falls back. A collision still falls back to a random id, which is exactly the old behaviour.
    **AN OLDER INSTALL IS RENAMED ONTO THAT ID, ONCE** (`communityAlignDeckIds` → `uDeckRekeyStored` →
    `uDeckRekey`), or a deck installed before this shipped would go on being two different decks to one
    account. It renames the DECK and never a card — card ids are the published ones and `S.cards` is keyed
    by them, so renaming one would orphan the very progress this exists to keep — and it rewrites every
    entry id wherever it is stored (`S.active`, `deckOpts`, `deckDay`, `deckGroups`, `deckNest` at both
    ends, `deckOrder`'s keys AND its lists), since a rename that left those behind would read, on the page,
    exactly like a reader who had never added the deck. **The store half has one trap**: the notes are
    lazy and `uNoteRecord` refuses to write an unwarmed one, so the deck is WARMED before it is renamed,
    written whole under the new key, and only then is the old record dropped.
    **AND A FAILED UNINSTALL IS BOTH REPORTED AND RETRIED** (`uDeckUninstall` → `{ stale }` /
    `uninstallSaid`, and `deckSyncPending` → step 0 of the next sync): removing a deck deletes the
    account's row, so a delete the server would not take leaves a row that the next sync reads as an
    install made elsewhere — putting the deck straight back. Both Remove buttons carry the caveat through
    one wording, so it cannot reach one of them and not the other.
    Guarded by the last two sections of `.claude/test-publish.js`, where a fresh browser context is a
    second device.
  · **PRESENT ON THE DEVICE AND PRESENT ON THE ACCOUNT ARE TWO QUESTIONS, AND THE DECK PAGE ASKED ONLY THE
    FIRST** (`accountHasDeck` / `deckInstallRowWrite` / `uDeckInstall`'s `adopt` branch / `.ddetail-adopt`;
    Aug 2026, on a bug report — a deck imported and shared under one account, then added from the Shared
    decks list under a SECOND account **on the same device**, reached no other device of that second
    account). The bullet above is the sync, and the sync was never reached: **the failure is on the device
    the deck was added on.**
    Community decks are DEVICE-local and shared by every account signing in on the device — the whole
    reason `by` exists, and stated three paragraphs up — so the second account meets the first's decks
    already present. `deckDetailRender` derived its actions from `localDeckForRemote`, which answers *is
    this deck on this device*, and read that as *does this account have it*: it showed **Study / Remove
    from this device** and offered no way in. No `deck_installs` row was ever written, so the account's
    list never mentioned the deck, so no other device could learn of it. **Nothing threw and nothing was
    missing** — the deck was genuinely there and studiable — and the only symptom was on a different
    device, where a deck that never arrives is indistinguishable from a deck nobody added.
    Four things about the fix.
    **THE QUESTION IS ANSWERED FROM THIS DEVICE'S OWN SYNC RECORD** (`by[id] === me` or `seen[me]`), which
    is the pair `communitySyncInstalls` already reconciles on — so the page and the sync cannot come to
    disagree, and it costs no request. Signed out there is no account to ask and device presence is the
    only honest answer; the AUTHOR (`row.owner === me`) counts as having their own deck however they came
    by it, since asking them to add their own published deck to their own account says the wrong thing.
    **ADOPTING DOES NOT RE-MOUNT THE SERVER'S COPY**, and that is the load-bearing half. The obvious
    implementation lets `uDeckInstall` run as usual, which overwrites the existing record — taking the
    author's `origin: "mine"` away and with it their only handle on the published row, since `uDeckPublish`
    PATCHes by `remoteId` and a record without one publishes a **second, separate deck** instead of
    updating theirs. So the local record is left exactly as it is and only the ACCOUNT's list is written,
    which is all that was ever missing. Asserted directly, because the loss would be silent until the
    author next tried to ship an update.
    **THE ADOPTED DECK IS THEN ALIGNED ONTO `deckIdFromRemote`** (`communityAlignDeckIds`, widened from
    `origin === "installed"` to anything the account lists). Without it the two devices file the same deck
    under different local ids — the adopting device keeps the random id its IMPORT minted — so the deck
    arrives on the other device and the reader's `S.active` entry, daily limits, colour and groups all
    stop at the device they were made on. That is the reader's actual complaint: it is the DAILY STUDY the
    deck has to reach, and arriving in the Studio alone would have read as still broken.
    **AND `by` IS RECORDED ONLY ON A SUCCESSFUL POST** (a pre-existing hazard this surfaced): `by[id] === me`
    with no row on the server is read by the very next sync as a removal made on another device, so an
    install whose POST failed had the deck **deleted off the device it was just added to** — and for an
    adopted deck that would be the author's own copy. Unrecorded it simply stays unannounced, the reader
    is told so in the toast, and nothing is lost.
    Guarded by `test-publish.js`'s last section, which is the only one giving TWO accounts ONE device.
    **It must NOT use `newSession`**: that helper's `addInitScript` is fixed at add time and re-writes its
    account's session on every load, so a device switched to the second account is silently switched back
    on the next navigation — the app stays signed in as the first while the mock answers as the second, and
    the page then reads as the author looking at their own deck (which it did, and the section passed for
    the wrong reason until the session was written by hand instead).
  · **The column guard — `guard_user_deck_columns()`.** RLS decides which ROWS you may write, **never which
    COLUMNS**. "edit your own decks" therefore let an owner PATCH their own `install_count`, `rating_avg`,
    `staff_pick` or even `owner` — inventing an editorial endorsement and a five-star average for
    themselves. A BEFORE INSERT/UPDATE trigger now restores those fields for any non-admin caller (silently,
    since a hard error over a field the client shouldn't have sent is the worse experience). **The
    maintenance triggers are exempt via a transaction-local `folio.sync` flag** — without it the guard would
    undo `sync_card_count` / `sync_install_count` / `sync_deck_rating`'s own writes. Phase 3's block
    `create or replace`s the guard to cover the columns it adds. **If you add a server-maintained column,
    add it to the guard**, or it is client-writable the moment it exists.
- **Community decks — Phase 4: a deck's own glossary (July 2026).** A deck can define its own terms, which
  auto-link inside its cards and **nowhere else**. This is what the Phase 0 glossary scoping was built for.
  · **`deck.glossMode`** — `site` (default: link the curated glossary, exactly as before), `own` (only the
    deck's terms; the site glossary is invisible), `both` (deck terms layered over the site's), and — since
    Aug 2026, on request — **`off`: link nothing at all**. Set in the Studio under **Deck details**; stored,
    exported and published. The four values are declared ONCE, in `GLOSS_MODES`, and read by the ingest
    sanitizer, the picker and the setter alike: three lists is how `off` would come to be accepted from a
    deck file and refused from the picker, or the other way about.
    **`off` returns EMPTY TABLES rather than being special-cased at each call site.** `buildGlossIndex` over
    nothing yields an index that matches nothing, so every reader of a scope — the auto-linker, the
    hand-authored `.ttip` pruning in `processAbstract`, `resolveGlossKey` — was already written correctly
    for it and not one of them needed a branch. It is for a deck whose own vocabulary keeps colliding with a
    glossary written about something else, where every match is a link telling the reader something untrue
    about the sentence in front of them; a per-term blocklist cannot fix that, since the same key is right
    or wrong depending on the sentence.
    **⚠ Publishing a deck set to `off` needs the `9) GLOSSARY OFF` block at the end of
    `.claude/supabase-schema.sql` run once** — `user_decks.gloss_mode` carries a CHECK constraint listing
    the three older values. Until it runs, such a deck studies correctly on the device that wrote it and
    refuses to publish, which is the loud failure rather than the silent one. The Studio's glossary tab
    warns an author that their terms are being kept and not shown, exactly as it does under `site`.
  · **Keys are namespaced `u:<deckId>:<slug>`** (`uGlossKey` / `uGlossParse` / `isDeckGlossKey`). That
    namespacing is the isolation mechanism: `glossText` / `glossTitle` / `glossDates` / `glossTags` each
    branch on it and read `UGLOSS`, so a deck term resolves inside its deck and does not exist outside it.
  · **`glossSourcesFor(scope)`** now resolves `deck:<id>` to the deck's tables per its mode, and
    `glossScopeForCard(cardId)` picks the scope when a background is rendered (`processAbstract` passes it
    to `autoLinkGlossary` **and** uses it to prune hand-added `.ttip`s). `glossScopeForKey` derives the
    scope from the KEY when a popup opens nested links, so a curated description never starts linking a
    stranger's terms just because the reader arrived from a community card.
  · **Gotcha that bit once:** `buildGlossIndex` derived the matchable surface from `glossKeyTitle(key)`.
    For a namespaced deck key that humanizes to the literal `u:abc:Slug`, so nothing ever matched in prose.
    It now uses `surfaceOf(k)`, which reads a deck term's own title. **Curated keys still go through
    `glossKeyTitle`** — deliberately not `glossTitle`, since pass 1 matches the humanized slug, not a
    display-title override. The equivalence test (125 auto-linked terms over 8 curated cards) guards this.
  · **A card must not auto-link its OWN answer term, and for proper nouns it used to** (fixed Aug 2026).
    `autoLinkGlossary` suppresses the answer by resolving `answerText` to a key — but it looked only in
    `byName`, the case-INSENSITIVE map, while a proper-name surface lives in `byNameCS`. So a card whose
    answer is a proper noun linked that answer inside its own background, offering the reader a popup
    defining the very word they had just been asked to recall. `buildGlossIndex` now also returns
    **`byAnySurface`** — every surface lowercased, whichever map it landed in — which `autoLinkGlossary`
    uses for that one question. It is deliberately NOT used for matching prose: a proper name must still
    match case-sensitively there. Found by the card→glossary pairing plan, which gives every card's answer
    a term and so turns this from one stale case (`Ice_Age`) into one per batch.
  · **Every mutation invalidates only that deck's index** (`uGlossTouched` → `invalidateGlossIndex("deck:"+id)`),
    including deck deletion — otherwise a re-created deck with the same id would inherit a stale index.
  · **`uGlossSanitize` closes a hole Phase 1 left open**: `uDeckNormalize` used to pass `gloss` through
    untouched, which was harmless only because nothing rendered it. Descriptions are rich HTML and now DO
    render in a popup, so they go through `sanitizeHTML` on ingest like every other field, and slugs are
    restricted to `[\w.-]{1,80}` because they end up inside a `data-k` and a `u:` key.
  · **Publishing** carries the glossary (`user_gloss` rows, replaced wholesale like the cards) and an
    install pulls it down — re-sanitized on arrival, since the server copy is not trusted.
  · The **admin "edit this term" button is hidden on deck terms** — it routes into the curated glossary
    editor, which knows nothing about them.
- **Community decks — Phase 3: ratings, staff picks, attribution (July 2026).** **⚠ Needs the `6) RATINGS`
  block at the end of `.claude/supabase-schema.sql` run once**, on top of the phase-2 block.
  · **`deck_ratings`** — one row per (deck, user), 1–5 stars plus an optional ≤500-char review and the
    rater's display name copied in at write time so listing reviews needs no join to `profiles` (whose RLS
    is sign-in-only). Insert policy refuses a rating on an unpublished deck **or on your own deck**;
    update/delete are limited to your own row. Re-rating is an upsert (`Prefer: resolution=merge-duplicates`).
  · **Summary columns on `user_decks`** — `rating_avg`, `rating_count`, `rating_1..rating_5`, all
    trigger-maintained by `sync_deck_rating()` and unwritable by clients (see the column guard below). The per-star counts exist so the
    deck page can draw a distribution without an aggregate query, which PostgREST does badly.
  · **`rank_score` is a STORED generated column** — `(v/(v+10))·avg + (10/(v+10))·3.5`, the Bayesian pull
    toward a prior that stops one 5-star review outranking a deck with fifty good ones. Browse's "Top
    rated" orders by it. A generated column may only read its own row, so the prior is the **constant 3.5**
    rather than the live site mean; that keeps the sort indexable and is close enough.
  · **The rating form is gated on having studied `RATE_MIN_STUDIED` (5) of the deck's own cards**
    (`deckStudiedCount`). This is **friction, not security** — it is a localStorage check and a determined
    person could study five cards. Enforcing it properly would mean shipping per-deck progress to the
    server, which is not worth the privacy cost. Said plainly in the code comment too.
  · **`staff_pick`** — an admin-only boolean and the one strong quality signal on a page of unvetted
    content. Toggled from the deck page; browse has a filter and a badge. Its own RLS policy.
  · **`forked_from`** — `{slug, title, author}` recorded when "Duplicate to edit" copies an installed deck,
    rendered as "Based on X by Y". It rides in `UDECK_META_KEYS`, so unlike the publish keys it **survives
    export/import** — attribution should not be shed by round-tripping through a file.
  · **No creator profile page, deliberately.** It would need `profiles` readable by anonymous visitors,
    which publishes every user's username and display name — a privacy decision for the site owner, not
    one to make in passing. "More from this author" queries `user_decks` by `owner` instead, which is
    already public, and gets most of the value.
- **Community decks — SUBDECKS (Aug 2026, on request).** A community deck may group its cards into
  subdecks, so one file holds what would otherwise be several decks — an HSK deck with a direction each way,
  a course with a chapter each. Each is addable and studiable on its own, exactly as a curated collection's
  decks are, and it needs **no schema change anywhere**, which is the whole of the design.
  · **THEY ARE THE CURATED TREE'S OWN ROWS AND ITS OWN FOLD** (`udeckSubRowsHTML`, Aug 2026, on request:
    "collapsible with chevrons and visually look the same as the curated collections"). They were a flat
    `.udeck-subs` list, always open and hard against the deck row above it, so a nine-level deck put nine
    rows on the Collections page whether the reader wanted them or not, in a shape nothing else on that
    page wears. Each row is now a **`.node`** with `.node-main` / `.node-title-row` / `.node-title` /
    `.node-count`, inside `.node-children` / `-inner` / `-pad`, wired by **`wireExpander`** — the same
    markup and the same helper `buildNode` uses — so the grid fold, the entrance stagger, the card box,
    the hover and the collection hue on the left hairline all come free and **cannot drift from the
    curated ones**. Four things follow.
    **THE CHEVRON IS DRAWN ONLY WHERE THERE IS SOMETHING TO FOLD**: a flat deck with one template has no
    children at all, and a chevron over nothing is a control that answers a press by doing nothing.
    **`.udeck-subrow` SURVIVES AS A MODIFIER carrying the depth indent and nothing else** — one rule,
    `margin-inline-start:calc(var(--sd,0) * 20px)`, so a child is the same 46px box as its parent stepped
    in from it rather than a padded row growing its own left gutter. (The indent used to be a padding;
    anything measuring it reads `marginInlineStart` now.)
    **THE ROW KEEPS ITS PROGRESS BAR where a curated deck row has none**, and that is deliberate: a
    subdeck is the unit a community deck is actually studied by — nine levels of one file, each with a
    schedule of its own — so the bar is the only thing on the row saying how far through it the reader
    is, and dropping it to match would be losing information rather than matching a look.
    **AND THE FOLD STARTS SHUT, like a curated collection's.** A shut fold is clipped to zero height, so
    a subrow's `+` is in the DOM and cannot be pressed — which is right for a reader and is a trap for a
    test: read the markup freely, but anything CLICKING a subrow has to open the deck first (`openFolds`
    in `test-subdecks.js`). Every `data-*` attribute is untouched, so `wireCommunityLibrary`'s
    `[data-usub]` wiring needed no change at all.
  · **A SUBDECKED ENTRY DEALS ITS SUBDECKS ROUND-ROBIN, EACH ONE A DAY BEHIND** (`studyGroupOf` /
    `studyOrder`, Aug 2026, on a bug report: studying a level of a two-direction deck gave one direction
    and never the other). A deck stores its cards one subdeck after another, and both `reviewQueue` and
    `buildSession` take the day's new cards as a SLICE off the front of that list — so the slice never
    reached the second subdeck and **Ordered meant "Spanish → English, for a hundred days"**. Random was
    no answer: it shuffles the whole session and throws the word order away with the problem. An entry
    whose cards come from more than one leaf subdeck now deals them round-robin BY POSITION, each subdeck
    keeping its own 1, 2, 3. **The reorder happens BEFORE the allowance is sliced**, which is the whole
    economy of it: one function decides both WHICH cards the day gives and WHAT ORDER they arrive in, so
    the pooled review, a session started from a row and that row's own counts cannot come to disagree.
    **THE LAG IS THE DESIGN AND NOT A DETAIL.** On a two-direction deck position N is the SAME WORD in
    both subdecks — measured on DELE A1, 496 of 496 — so a plain round robin deals `de → of` and then
    `of → de` a second later, and the reverse is answered out of short-term memory and scheduled far
    further out than it has earned. **`burySiblings` cannot save it**: these are two independent cards
    rather than two cards of one note, so nothing separates them. Each later subdeck therefore runs `lag`
    positions BEHIND the first, the lag being the entry's own new-card allowance — one day's worth — so
    the reverse arrives on the NEXT day. Sorting on `position + groupIndex * lag` needs no state and
    self-corrects as cards are consumed, because the position is the card's place in its OWN subdeck and
    not its place in whatever is left unseen today. The visible consequence, worth knowing before it is
    read as the bug returning: **day one is still the first subdeck alone**, and the alternation starts on
    day two. It applies to **Folio's own collections too** (on request), where the groups are the leaf
    decks, so a collection is met a few cards from each of its decks at a time rather than one deck worked
    through end to end. **A card's group is its leaf subdeck, not its card TEMPLATE** — a note's own
    reverse card is a separate axis with a separate answer already (bury-siblings), and interleaving it
    here would be two mechanisms arguing over one pair. Random is untouched: random still means random.
  · **A SUBDECK MAY HOLD SUBDECKS** (Aug 2026, on request — `SUB_SEP` / `SUB_MAX_DEPTH` / `uSubParts` /
    `uSubNormalize` / `uSubName` / `uSubParent` / `uSubUnder` / `uSubNodes` / `uSubChildren`). `card.sub` is
    a **PATH** whose segments are separated by **`::`** — `A1` is a subdeck and `A1::Spanish → English` is a
    subdeck of it — which is Anki's own deck separator, and this file copies Anki wherever Anki has already
    answered the question. It is a convention over the SAME string field, so like subdecks themselves it
    **costs no schema change** and travels wherever the card does; every deck written before it reads as a
    one-segment path, so **nothing migrates**. Five things are decisions rather than plumbing.
    **THE ENTRY ID DID NOT CONSTRAIN THE SEPARATOR**, which is worth knowing before reaching for a different
    one: `uSubEntry` percent-encodes the whole path, so the `/` that `uDeckIdOf` splits on is always the one
    after the deck id whatever the path contains. What constrains it is that a segment is a title somebody
    typed, so it has to be something nobody types by accident. **THE TREE IS DERIVED, like the subdecks
    themselves** — `uSubNodes` walks the paths the cards name AND every prefix of one, so an intermediate
    node exists exactly when something under it does; that is what keeps a rename a matter of rewriting
    `sub`, and it is why an EMPTY intermediate is not expressible, which is the same thing one level up
    already gives up. **A PATH MATCHES ITSELF AND EVERYTHING UNDER IT** (`uSubUnder`, read by
    `uDeckCardsIn`), which is the whole of what makes a branch studiable: written as the equality test a
    one-segment sub needed, every intermediate row reads "0 cards" and studies nothing — no error, no
    warning, just a row that does not work. **THE TOP-LEVEL RUN TESTS THE CONTAINER, NOT THE DECK**: a row
    is skipped there when the thing that CONTAINS it is also active, which for a nested path is the subdeck
    above it — testing only the deck draws a nested row twice, once under its parent and once at the top of
    the list, and it reads as the deck having two of them. And **`cardEntryId` WALKS THE PATH UPWARD**, so
    daily limits or a scheduler set on `A1` govern the cards filed in `A1::Spanish → English`; without the
    walk they would be silently ignored by every card in the deck.
  · **A SUBDECK IS A STRING ON THE CARD** (`card.sub`, its own title) **and there is no list beside it**: the
    deck's subdecks are the distinct values in card order (`uDeckSubs`). That is what makes it free — the
    title rides on each card, so it survives export, import, publish and install through paths that already
    carry the card whole (`uCardSanitize` keeps it; the publish payload adds one line). An explicit list
    would have needed a column on `user_decks`, which is exactly the migration card types are still waiting
    on, and a second blocked feature is worse than a smaller one. What it gives up is an EMPTY subdeck and
    ordering the subdecks independently of the cards; **renaming one is rewriting `sub` on its cards.**
  · **THE ENTRY ID IS `u:<deckId>/<title>`**, the title percent-encoded. A deck id is `[a-z0-9]{4,16}` and so
    can never contain the slash, which is what makes the split unambiguous. **`uDeckIdOf` strips the suffix**,
    so every one of its ten-odd callers keeps working untouched and resolves to the parent deck; only the
    three places that must narrow call **`uSubOf`** (`entryCardIds`, `entryInfo`, `buildSession`'s udeck
    branch, plus `scopeEntryId` composing one). A study scope carries `{type:"udeck", id, sub}`.
    Deleting a deck now filters `S.active` on `uDeckIdOf(x) === deckId` rather than on one exact string, or
    its subdeck entries would outlive it.
  · **`uCardSetSub` is its own setter** — `sub` is NOT one of `CARD_FIELDS` (those are the Basic format's
    thirteen and `uCardSet` refuses anything outside them), so a `uCardSet(id, "sub", …)` would silently do
    nothing. The Studio's control is a **datalist rather than a `<select>`**, because the deck's subdecks ARE
    the titles its cards name: there is nothing to pick from until a card names one. It writes on `change`
    and not per keystroke, or typing "Eng" would create a subdeck per prefix and the deck would grow a row
    for each.
  · **A partly-grouped deck is fine and its loose cards get no row.** On a fully-grouped deck there are none,
    and on a partly-grouped one the parent row already studies the whole deck — an "Other" row would be a
    third thing to explain. The home review names an added subdeck **by the subdeck**, with its deck in
    `.dk-sup` for context: "HSK 1" over three rows says nothing about which is which.
  · **ADDING A DECK ADDS ITS SUBDECKS, and the home list draws them UNDER it** (Aug 2026, on a report:
    "when I add our custom Mandarin HSK deck I still don't see any subdecks in it on the home page"). This
    is the collection rule one store over — `addActive` on a tree node has always brought the whole subtree
    in — and it was the one place a container did not. Three halves, and each fails differently:
    `addActive` adds `u:<deck>` plus one entry per subdeck (adding a SUBDECK on its own still adds only
    that subdeck — a narrower choice is never widened); `removeActive` mirrors it in **both** directions,
    a deck taking its subdeck rows with it and a subdeck taking the whole-deck row, which would otherwise
    go on offering the very cards just removed while its + still read as added; and `emit` in `PAGES.home`
    gives a deck row its active subdecks as CHILDREN, with the top-level run skipping any subdeck whose own
    deck is on the list, so they nest instead of standing beside it in a flat run of ten.
  · **A NESTED ROW DROPS ITS CONTEXT LINE, and only looking at the page shows why.** A subdeck row names
    itself with its deck in the quiet `.dk-sup` beside it, which is right for a subdeck added ON ITS OWN at
    the top level ("Level 1" over three of them says nothing about which is which) and wrong the moment the
    deck is the row directly above: at 390px the name is the only part of the row with no shorter form, so
    a repeated "HSK 3.0 — Mandarin Chinese" crushed every subdeck to **"Lev…"** — nine rows reading the
    same three letters. Kept where the row stands alone, dropped where `parentKey` is its own deck's entry.
  · **…and such a row seeds OPEN**, where an added collection seeds shut. A collection's subtree runs to
    forty-odd rows; a deck's subdecks are a handful, and they are the reason it has rows at all — a deck
    that swallows them the moment it is added is exactly what this was reported as.
  · **`refreshAddButtons` had to learn `[data-uaddsub]`** with it: one press now changes a dozen buttons
    further down the Collections page, and that sweep is what stops the rows below the one pressed reading
    "add" over something already added.
  · **THERE IS NO SUBDECK PER DIRECTION AND THERE CANNOT BE** — worth stating, because it is the other half
    of what was asked for. Since reverse cards, a word is ONE note carrying two cards (recognition and
    production), and `sub` is a property of the NOTE, so the two directions cannot be in different
    subdecks while they are one record. That is the trade the note→cards change made deliberately (see the
    reverse-cards bullet): what it buys is one record per word — a definition corrected once rather than
    twice, with no chance of the two drifting — and each direction still keeps a schedule of its own. A
    subdeck's count already includes both, which is why the HSK 3.0 deck reads 23,064 cards over 11,532
    words. **That stands, and the level BELOW the subdeck is what answers the request** — next bullet.
- **Community decks — A DIRECTION IS A LEVEL BELOW THE SUBDECK** (`SUB_TPL` / `uTplEntry` / `uTplOf` /
  `uEntryTemplates` / `uTplEntriesOf` / `uTplName` / `uPruneTplEntries`; Aug 2026, on request: "add
  direction as a subdeck"). An entry id may end `#<0-based template>` and deals only that template's cards,
  so a two-way deck lists each direction as a row of its own to add, hold and study. The thing `sub` could
  not name, the TEMPLATE already does — it is what makes the two cards two cards — so the answer was a new
  LEVEL rather than a new field.
  · **IT COSTS THE DECK FILE NOTHING, which is the whole argument for doing it here.** The templates are in
    the type already, named by their author, so every two-way deck ever written or installed gains its
    direction rows on the next load with nothing rewritten, nothing republished and no card duplicated.
    The alternative is what the **DELE Spanish decks** do — direction written into the file as a real
    `sub`, `Spanish → English` / `English → Spanish` — which is two notes per word (992 for ~500), and a
    definition corrected on one of them silently drifts from the other. Both shapes now work; this is the
    one that does not double the file.
  · **`#` IS SAFE AS A RAW SEPARATOR AND `~` WOULD NOT HAVE BEEN.** `uSubEntry` percent-encodes the whole
    path and `encodeURIComponent` escapes `#` to `%23` while leaving `~` alone — so a subdeck titled "C#"
    cannot forge a template suffix and one titled "A~B" would have. `uDeckIdOf` cuts at whichever of `/`
    and `#` comes first; neither can occur in a deck id (`[a-z0-9]{4,16}`).
  · **A DIRECTION ROW IS DRAWN ONLY WHERE THE CARDS ACTUALLY ARE** (`uEntryTemplates`). A container that
    merely groups — the deck above nine levels — gets its directions from its children, and a second pair
    over the whole deck would offer the same cards again under a name saying nothing new. The test is
    structural rather than a flag: a level earns the rows when every note it studies is filed **directly**
    in it, which is also why a FLAT two-way deck gets them straight under the deck row. A level whose notes
    use more than one type gets none, and a CLOZE type gets none either — its `typeCards` is one template
    however many deletions a note carries.
  · **THE NARROWING IS A FILTER OVER THE CACHED EXPANSION, never a second one.** `uDeckStudyIdsFor` is
    memoised by (deck, subdeck); a direction takes `uCardTplIndex(id) === tpl` off that list, so nothing is
    keyed on something a template edit can change under it. `buildSession`'s udeck branch asks
    `entryCardIds` rather than expanding again, so a row, its sheet and the session it starts cannot come
    to disagree.
  · **ADD NARROW, REMOVE WIDE.** A subdeck holds cards nothing else in the subtree holds, so the cascade
    must bring it; a direction holds a **subset of its own parent's**, so adding it too would surface
    reverses in the pooled draw from the first day — where a level's own template-major list deals every
    forward card first. Choosing a direction is what makes choosing one mean anything. Removing goes the
    other way: a direction the reader chose still goes when its level goes, or it would be a row in the
    review with nothing above it. **And a direction is removed ALONE** — the one place the ancestor rule is
    turned off, since the level legitimately keeps offering both ways.
  · **`cardEntryId` resolves the DIRECTION first**, then the subdeck path upward, then the deck: a reader
    who set FSRS or a daily limit on "English → Chinese" meant it for that direction's cards.
- **Community decks — BOTH DIRECTIONS TOGETHER, the GATHER order** (`deckPairNew` / `setDeckPairNew` /
  `pairOrder`; Aug 2026, on request: "I want them interleaved"). Default OFF, which is what `uDeckStudyIds`
  has always done: the expansion is TEMPLATE-MAJOR, so the day's new cards come off the front of a list
  that is every note's first card before any note's second — all forward, with the reverses waiting for the
  whole forward pass. **At five a day on a 150-word deck that is thirty days before the first reverse**,
  right for a reader learning to RECOGNISE words and wrong for one who wants to PRODUCE them. ON, the day's
  new cards are the day's new WORDS, each way.
  · **IT IS A REORDER, NOT A SECOND EXPANSION**, which is what keeps the cache honest: `pairOrder` regroups
    the template-major list by NOTE inside **`studyOrder`**, beside the subdeck round robin, and the two
    compose — the robin decides which subdeck a card comes from and this pulls each word's cards together
    within that (a `Map` iterates in first-appearance order, so the robin's order survives).
  · **IT SHUFFLES ITS OWN NEW RUN, and that is not a second setting hiding in this one.** Note-major
    unshuffled deals 杯子 → cup then cup → 杯子 adjacently, which is exactly the "teaches the answer rather
    than testing it" that template-major exists to prevent. **The slice comes first and the shuffle after**,
    so pairing decides WHICH words arrive and the shuffle only their order; shuffling first would make the
    day's cards a random handful of the whole deck. The pooled review `seededShuffle`s its pool across decks
    already, so `buildSession` is the one place that has to do it, and the Random-order switch beside it
    still governs the WHOLE queue, reviews included.
  · **BURYING IS DERIVED OFF, never a second switch to remember.** The two are opposite intents: pairing
    gathers the reverse and burying takes it straight back out, leaving a session half the size it promised
    — measurably, since `doGrade` filters the live queue. So `deckBurySiblings` returns false while pairing
    is on, and the bury row is **dimmed in place with a reason** (the Night-mode row's pattern under "Match
    my device"), still pressable, and saying why. `syncBury` re-states it when pairing is thrown, because
    the sheet must not repaint — `render()` closes it.
  · **IT INHERITS DOWN THE PATH, unlike the daily limits beside it.** A limit is a fact about one row and
    must not leak; this is a policy about how a deck's material is organised, so setting it on the deck
    governs its levels — which is what a reader setting it on the deck plainly means, and the levels are
    what the cascade actually adds.
  · **THE ALLOWANCE IS IN CARDS, as it always was and as Anki's is**: six new a day is three words both
    ways, not six words. A reader wanting five words both ways raises the limit to ten.
  · Guarded by `.claude/test-subdecks.js` (18 assertions), which builds its own partly-grouped deck rather
    than reading the shipped ones. **The failure mode is silent** — the list is derived on every read, so a
    `sub` dropped anywhere along the way just drops that card back into the parent deck and everything still
    works — which is why the assertions follow one card's `sub` through ingest, the row list, the review and
    the session rather than testing any one of them. **The nesting, the DIRECTION rows and the pairing
    switch are guarded by `.claude/decks/check-nesting.js`** (28 assertions, a tree built in memory): its
    fifth section asserts the six rows a two-level two-way deck draws, that the deck itself gets none, that
    adding the deck brings the levels and **not** the directions while removing it takes a chosen one with
    it, and that studying a direction deals only cards carrying `~2`; its sixth covers the pairing switch —
    the default all-forward gather, the note-major one, the shuffle, and that grading one direction does
    NOT bury the other. Its seeding is the house gotcha written down: a `goto` differing only in the
    `#fragment` is a same-document navigation, so localStorage written behind the app's back needs a real
    `reload()` or the next `save()` puts the in-memory state straight back over it. **`check-decks.js` is
    the other half**, since it studies the shipped decks through the pooled review, which is where a
    cascade that is too wide shows up as reverses on the first day.
    **THEIR SUBROW HOOKS ARE THE CURATED NAMES SINCE AUG 2026** — `.node-title`, `.node-count`,
    `.node-main`, where they were `.deck-title` / `.collection-count` / `.collection-main` — and the
    migration was the right way round rather than a convenience: those three styled NOTHING anywhere
    (checked before touching them), so they were pure test hooks over rows that genuinely ARE curated
    `.node` rows now, and re-adding a dead class to keep a selector working would be two names for one
    thing. `check-nesting.js`'s depth probe reads **`marginInlineStart`** for the same reason, and
    anything CLICKING a subrow calls `openFolds` first — see the fold trap above. **Re-run all three
    (`test-subdecks.js`, `check-nesting.js`, `test-publish.js`) after touching `udeckSubRowsHTML` /
    `udeckRowHTML` / `wireCommunityLibrary` / `.udeck-subrow`**: a changed class name there is invisible
    in review and takes the suites down rather than failing them, which reports every assertion before it
    as a pass.
- **Community decks — CARD TYPES (Aug 2026, on request).** Anki's note types, cut to the three things an
  author actually programs: the **front template**, the **back template** and the **CSS** for the card as a
  whole. A type declares its own field names; a card of that type carries a `fields` map instead of the
  thirteen `CARD_FIELDS`. **⚠ Publishing a deck that uses one needs the `8) CARD TYPES` block at the end of
  `.claude/supabase-schema.sql` run once** — everything else (writing, studying, export, import) is entirely
  local and needs nothing. It is one `alter table … add column if not exists types jsonb`, it is re-run safe,
  and **it cannot be done from the app**: the publishable key the site ships with has no DDL rights, so this
  is a step in the Supabase SQL editor and nowhere else. Until it runs, `typesColumnMissing` turns
  PostgREST's PGRST204 into a sentence rather than a raw error — and **an admin gets a DIFFERENT sentence
  from everyone else** (`typesColumnMsg`), naming the block to run, because the site's owner is the one
  person who can clear it and "isn't set up yet" is a dead end for exactly them. The publish payload sends
  `types` **only when the deck has any**, which is what lets a Basic-only deck still publish from an
  un-migrated database; the read path is `select=*` (`communityFetchDeck`), so an installed copy gets the
  templates the moment the column exists. One consequence of that `undefined`, recorded rather than fixed:
  removing every type from an ALREADY-published deck does not clear the remote column, since the key is
  omitted rather than sent empty.
  · **"Basic" is Folio's own format and is NOT one of these records.** It is what a card with no `type`
    renders as — question, answer, date line, background, sources — so **every card written before this
    existed is a Basic card and nothing migrates**. `CARD_TYPE_BASIC` is a reserved id: `uTypeSanitize`
    refuses a type that tries to take the name, or an imported deck could shadow the built-in format.
  · **Types live on the DECK (`deck.types`), not on the device**, and ride in `UDECK_META_KEYS` — so one
    entry covers the record, the export file, the import and the fork with no plumbing of its own. A deck is
    the unit that travels, and a template left behind would leave an installed copy rendering its fields as
    raw prose. Publishing sends `user_decks.types`, **but only when the deck actually has types**, so a deck
    of Basic cards still publishes from a database whose owner has not run that SQL block (`typesColumnMissing`
    turns PostgREST's PGRST204 into a sentence saying what to do instead).
  · **The template language is `{{Field}}`, `{{FrontSide}}`, `{{#Field}}…{{/Field}}` and `{{^Field}}…{{/Field}}`**
    (`tplRender`) — Anki's, minus the filters. There are deliberately no filters: a template needing more than
    this is a template that wants a build step, which Folio does not have.
  · **A BACK THAT RENDERS `{{FrontSide}}` OWNS THE FRONT, AND THE SHELL MUST STOP DRAWING ITS OWN** (Aug 2026,
    on a bug report: the vocabulary shape "adds the English a second time"). Anki's back template REPLACES the
    card; Folio's study card and its three previews keep a `.question` block above the answer — right for a
    Basic card, where the answer is a new block, and a duplicate for a template that opens on the front. So
    `cardTypeSideHTML` marks the back wrapper **`uc-hasfront`** and one `:has()` rule in styles.css hides the
    shell's `.question` and its label. Three things about it. **It is contingent on the TEMPLATE, not on the
    card being typed** — a back that does not ask for the front keeps the question above it, which is what
    leaves a reader's graded cloze guess on the page beside what it should have been (the Fill-in-the-blank
    shape is exactly that case, and is untouched). **The flag is OBSERVED during the render**, through a sink
    passed to `cardTypeFieldGetter`, rather than grepped off the template: a `{{FrontSide}}` inside a
    conditional section that ends up dropped is a front the reader never sees. And **it is CSS rather than a
    class toggled at each render site**, because four separate places build that shell and a fifth will be
    added by someone who has never read this.
  · **THREE READY-MADE SHAPES, so writing a deck does not start with a blank template** (`CARD_TYPE_PRESETS` /
    `cardTypePreset` / `cardTypePresetSpec` / `openTypePresetSheet` / `.ut-preset`, Aug 2026, on request).
    **Vocabulary** (a word and its part of speech; the translation, its conjugations and a read-aloud button),
    **Picture** (an image and what it is) and **Fill in the blank** (a passage whose blanks close on the front).
    They are the shapes the popular Anki decks are made of. Three things about them are decisions rather than
    content. **A preset is an ORDINARY type once created** — same record, same editor, nothing marks it
    afterwards — and its templates and CSS go through the same sanitizers as anyone else's; they are not
    privileged, only already typed out. **Each styles itself**; only the two behaviours Folio LENDS a type
    (below) are styled in styles.css. And they are offered **in two places on purpose**: the "Add a type"
    button opens them in a `deckSheet`, and the pane behind it (`studioBasicTypeHTML`) shows the same three as
    a gallery — a feature reached only through a button labelled with what it does rather than with what it
    offers is one nobody goes looking for. `uTypeCreate(deckId, name, spec)` takes the spec over the blank
    starter and puts the deduped id and name over that, so a second "Vocabulary" in one deck cannot quietly
    overwrite the first.
  · **A type may declare a SPOKEN LANGUAGE, and any type may mark text to be read aloud** (`type.speechLang` /
    `SPEECH_LANG_RX` / `SPEECH_LANGS` / `.uc-tts` / `cardSpeak` / `speechVoiceFor` / `wireSpeakControls`).
    `<span class="uc-tts">{{Translation}}</span>` in a template becomes a button that speaks those words;
    `cardTypeSideHTML` puts the type's `lang` on the `.uc-card` **wrapper**, so every control inside inherits
    it and a template wanting a second language need only say so on the one element. Four things are
    load-bearing. **The language lives on the TYPE, not the card or the deck** — a vocabulary deck teaches one
    language, so the answer is written once beside the template that reads it, and it rides inside the `types`
    jsonb with **no schema change**. **It is asked for at CREATION** (`openSpeechLangSheet`, a closed list —
    a BCP-47 tag is a thing an author should not have to know, and a mistyped one has the device pick a voice
    at random), from a list that says which languages this device has no voice for rather than hiding them,
    since a deck is written on one machine and studied on another. **It deliberately bypasses `ttsEnabled()`**,
    which has the read-aloud SYSTEM set aside — that switch is about things Folio does TO a reader (auto-read,
    the play triangles), where this is a control a reader presses on a card whose author put it there; it is
    the same call the book's own "Read aloud" makes. And the **behaviour is DELEGATED** at the document while
    `wireSpeakControls` adds only what a delegated listener cannot (role, tab stop, name), so a paint path
    that forgets it loses keyboard access rather than the feature; `body.no-tts` (written by `applyTheme`,
    like `no-anim`) takes the button chrome away where there is no engine, leaving the words as words.
    **A CONTROL MAY SHOW ONE THING AND SAY ANOTHER** (`data-say`, read by `cardSpeakText`; Aug 2026, on
    request, for the HSK decks' pinyin). `<span class="uc-tts" data-say="{{Simplified}}">{{Pinyin}}</span>`
    shows the romanisation and pronounces the characters — which is the only way that control can work, since
    a Mandarin voice handed "bēizi" reads the letters rather than the word. It is **the same contract the
    site's own `.tr-play` buttons already use**, which is why it is spelled `data-say` and not something new,
    and `data-say` had to be added to the sanitizer's `span` allowlist to survive ingest: it never reaches
    the DOM as markup, only `SpeechSynthesisUtterance.text`, so the worst a deck can do with it is make the
    speaker say something other than what is written — which the visible text could already do.
    `wireSpeakControls` names the control by what it will SAY rather than by what it shows, that being the
    thing a reader pressing it is after. Guarded in `.claude/test-speak.js`, whose third fixture deck exists
    only for this: the failure is silent, because a dropped attribute leaves a control that still works and
    simply pronounces the wrong string.
    **THAT FILE ALSO PINS THE CONTROL UNDER THE MARKER** (Aug 2026, on request — see the `TIP_SEL` bullet):
    with the pen down a tap must still press it and a drag through it must still draw, and the two are
    asserted together because either alone passes on the rule having been dropped in the other direction.
    It is driven with **real mouse input**, not `el.click()`, which would bypass the very hit-test under
    test — the whole question is what a POINTER landing on that spot does while a canvas is over it.
  · **CLOZE DELETIONS — `{{c1::answer}}` / `{{c1::answer::hint}}`** (`clozeMark` / `CLOZE_RX` /
    `CLOZE_NAME_RX` / `.uc-cloze`). Anki's syntax, because a learner who has written cloze cards before will
    type it without being told. **The braces go in the CARD'S TEXT, not in the template** — a substituted
    value is not rescanned, so `tplRender` never sees them — but a marker written straight into a template
    means the same thing, so `tplRender` **skips a name matching `CLOZE_NAME_RX`** rather than substituting a
    field called `c1::1066` and leaving a silent blank with nothing to explain it. `clozeMark` runs BEFORE the
    composed string is sanitized, and what it emits around the author's text is a span rather than an
    attribute, so a value ending mid-tag cannot escape into one. The FRONT's blanks are closed before it is
    handed to the back as `{{FrontSide}}`, which is Anki's behaviour and the right one — the top of the back
    is the question as it was asked.
    **ONE CARD PER BLANK (Aug 2026, on request) — and this bullet used to record the opposite.** Until then
    every blank on a card was hidden and revealed together, and that was written down here as a deliberate
    simplification: Anki turns one note into one card per number, and a Folio card was a single record, so
    there was nowhere for a second card to live. The note→several-cards machinery and sibling burying between
    them removed the reason, so a cloze type now splits like any other multi-card note.
    · **`type.cloze` is DECLARED, never detected.** The markers live in a card's VALUES, so a type could only
      be recognised as a cloze type by looking at its cards — and a type whose cards happen to carry no
      marker yet would then not be one. Declared, it also means **nothing migrates**: every deck written
      before this renders exactly as it did, all of its blanks together, until somebody throws the switch.
      The "Fill in the blank" preset ships with it on.
    · **THE ID SCHEME NEEDED NO EXTENSION**, which is what made this a small job rather than the one it was
      written off as. `uCardIdFor(note, ord - 1)` gives the bare note id for c1 and `note~9` for c9, so a
      note that gains a second deletion does not move the first one's schedule — the same promise template 0
      already makes.
    · **THE ORDINALS MAY BE SPARSE**, and this is the trap: c1, c2, c9 is THREE cards numbered 1, 2 and 9.
      `uDeckStudyIds` used to build ids by POSITION (`uCardIdFor(n, tpl)` for tpl 0…most-1), which would deal
      `note~2` and `note~3` — ids naming deletions the note has not got, which render as a passage with
      nothing blanked at all. It walks each note's own `uNoteCardIds` list and interleaves BY POSITION IN IT,
      which is the template-major rule restated in a way sparse ordinals survive.
    · **A BLANK THIS CARD IS NOT ASKING ABOUT IS SHOWN AS ITS OWN WORDS** (`.uc-cloze-other`, which is given
      `color:inherit; font-weight:inherit` precisely so it does NOT inherit `.uc-cloze`'s indigo). That is
      the whole point of splitting: the rest of the sentence is the context the reader is recalling from.
      Its hint is not printed — only a blank being ASKED about wears a hint.
    · **`{{c::x}}` with no figure is ordinal 1.** Anki requires the number; a reader who leaves it out plainly
      means the only blank they have written rather than a card belonging to nothing.
    · `UTYPE_MAX_CLOZE` (20) bounds how many cards ONE note may make. A bound, not a view about how many
      blanks a passage should have — and it caps the LIST, so sparse high ordinals still work.
    · Card info names a cloze card by its **deletion** ("Blank 9, 3 of 3") rather than by a template: there is
      only one template, and "3 of 5" would be a lie where the fifth blank is numbered 9.
  · **ONE NOTE, SEVERAL CARDS — reverse cards** (`type.cards` / `typeCards` / `CARD_SIB` / `uCardBaseId` /
    `uCardTplIndex` / `uCardIdFor` / `uNoteCardCount` / `uNoteCardIds` / `uDeckStudyIds` /
    `cardTypeTemplate`; Aug 2026, on request). A type declares a LIST of card templates and one note yields
    one card per template, each with a schedule of its own — Anki's note types, and the thing the HSK decks
    needed, since recognition and production were two separately written cards with separate progress.
    · **THE RECORD STAYS ONE NOTE.** Duplicating it per direction is the obvious implementation and is
      wrong: a shared field edited on one copy and missed on the other leaves two cards drifting with
      nothing to say so. `UCARDS` keeps one row per note and the extra CARDS are ids derived from it, which
      is Anki's own notes-versus-cards split.
    · **`type.cards` is `[{ name, front, back }, …]` and the LEGACY `front`/`back` fold into `cards[0]` on
      ingest.** `uTypeSanitize` emits the canonical list and nothing else reads the old keys, so every deck
      file, installed copy and published row normalises itself with nothing to migrate by hand — and every
      type has at least one template, which is what lets every reader assume one rather than test for none.
      **`typeSpeaks` had to learn to look at ALL of them**: a two-way type may put the read-aloud control on
      one direction only, and reading the first template alone hides the switch on the reverse card.
    · **TEMPLATE 0 KEEPS THE BARE NOTE ID**; only the second and later take a `~N` suffix (1-based, so
      `u_abcd1234_7~2`). That is the whole point of the scheme: adding a reverse card must not move the
      schedule of a card a reader has been studying for a month. `~` cannot occur in a note id
      (`^u_[a-z0-9]{4,16}_\d+$`), so the split is unambiguous, and unlike `.` or `:` it is safe unescaped
      inside a quoted attribute selector.
    · **`cardById` RESOLVES a derived id** and returns a COPY carrying `_tpl` — never the stored note, which
      every one of its cards shares, and writing the index onto it would make whichever card rendered last
      the answer for all of them. It is the one place that has to know how the id is built; the study page,
      the scheduler, the counts and Card info all go through it already.
    · **THE QUEUE IS TEMPLATE-MAJOR** (`uDeckStudyIds`): every note's first card before any note's second.
      That is what makes a reverse card a test rather than a prompt — note-major deals "水 → water" straight
      after "water → 水" — and it is one of Anki's own new-card sort orders rather than a workaround.
      It is what keeps siblings apart WITHIN a session; **day-long sibling burying** (added days later, on
      request — see the BURY SIBLINGS bullet under "How the app is wired") is what keeps them apart ACROSS the
      day, and the two are separate mechanisms doing the same job at two scales. This one still matters with
      burying off, and burying is what the reader can turn off.
    · **`entryCardIds`, `availableCardIdSet`, `buildSession`'s udeck branch, the review's Chrono sequence,
      the cram offer, `entryInfo`'s count, `uDeckStudied`, the deck-statistics scope and the rating gate all
      expand.** A missed one fails QUIETLY and differently each time — a reverse card that is never dealt, a
      progress bar over the wrong denominator, a sort that dumps every second card at the end.
      **TWO WERE MISSED AND BOTH WERE THE SUBDECK CASE** (found Aug 2026 by the first deck that is a
      two-way type AND grouped into subdecks — the whole of HSK 3.0 in one file): `entryInfo`'s SUB branch
      and `udeckSubRowsHTML` each counted `uDeckCardsIn(...).length`, which is NOTES, so every subdeck row
      read half its real size (197 where the subdeck holds 394) directly beneath a deck row that had always
      counted them expanded. **A count that is wrong by exactly two looks like a count**, and the two
      display sites disagreeing with each other on the same page is the only thing that showed it. The
      lesson for the next expansion: the list above is a list of FUNCTIONS, and a function may take the
      subdeck path and the whole-deck path through different code — check both branches, not both callers.
    · **Removing a template destroys a SCHEDULE**, which nothing else in the Studio does (a dropped field
      leaves its values, a deleted type puts its cards back to Basic intact), so it asks first. The records
      from the removed position onwards are dropped rather than shifted down — card 3's schedule is not
      card 2's — and the ids before it still mean what they meant. The revlog is deliberately not swept:
      those reviews happened, and a row whose card is gone is simply never looked up.
    · **The "Two-way" preset** is Anki's "Basic (and reversed card)": Front / Back / Notes and two
      templates. Deliberately plainer than the Vocabulary preset — what an author needs to see here is the
      two-template idea — and its CSS is the worked example of **`.card[data-uctpl="2"]`**, the 1-based
      template index on the wrapper, which is Anki's `.card2` in the shape `cssScoped` can rewrite. Note
      that its arrow is the CHARACTER: `sanitizeCSSText` strips backslashes, so a `\2190` escape prints
      literally.
    · The Studio's type form gains a template picker, a name box and Add/Remove (`studioTypeCardsHTML`,
      `studioState.tpl`). `front`/`back` route to **`uTypeSetCard` with the index read live off
      `studioState`** — a listener that closed over the index would write an edit to whichever template was
      open when it was installed. The preview follows the OPEN template, since on a two-way type the card
      being edited is the second one half the time.
    · **A pre-existing import bug was fixed alongside it** (`uDeckImportText`): a deck file with no
      `meta.id` — which a hand-written one plausibly has and Folio's own export never does — mounted under
      the EMPTY STRING. It half worked (entry id `"u:"`, an empty `data-uadd`), it kept the file's own card
      ids where every other import remaps them, and a second idless import took the fresh-id branch and
      left the first as the only broken one.
  · **The safety rests on the LAST sanitize, not the first.** The templates and the field values are each
    cleaned on ingest, and that is not enough — a value dropped into `<img src="{{X}}">` is only checkable once
    the two are one string. So `cardTypeSideHTML` is the single choke point, and it runs `sanitizeHTML` over
    the COMPOSED result at render. Don't "optimise" that pass away.
  · **`<details>`/`<summary>` ARE ALLOWED, and they are the only fold a deck can have** (Aug 2026). A card
    type may not carry script and its CSS is scoped to the card, so the platform's own disclosure widget is
    the whole of what is available for hiding a long section behind a heading — which is what the HSK decks'
    example sentences sit in. Neither element has a scripting surface or takes a URL, and `open` is the one
    attribute either accepts. **A CSS ESCAPE CANNOT BE USED TO DRAW ITS MARKER**: `sanitizeCSSText` strips
    backslashes, so `content:" \\25BE"` reaches the card as the characters `25BE` — write the ▾ itself, as
    the `content:"\\201C"` note above already says for a quotation mark.
  · **…AND SUCH A FOLD REMEMBERS HOW THE READER LEFT IT** (`UC_OPEN_KEY` / `ucOpenMap` / `ucDetailsKey` /
    `ucSetOpen` / `ucRestoreDetails`; Aug 2026, on request). It went back to the template's own state on
    every card, so a reader who wanted the Mandarin decks' example sentences had to open them again for each
    of the day's twenty. Five things.
    **NEITHER HALF IS PER-RENDER WIRING.** Saving is one delegated CAPTURE listener on the document —
    `toggle` DOES NOT BUBBLE, so capture is the only way to hear it from a descendant, the same trick the
    dead-media `error` listener uses — and restoring happens inside `cardTypeSideHTML`, the one choke point
    every typed card is composed by, so a render path added later is covered without anybody remembering it.
    **THE KEY IS THE SUMMARY'S OWN TEXT, scoped to the card type.** An ordinal within the card is cheaper and
    is wrong the moment a template wraps one panel in a `{{#Field}}` conditional: a card missing that field
    renders one fewer, every later index shifts, and the wrong panel opens. The summary is what the reader
    pressed and what they meant by it.
    **SIDE IS DELIBERATELY NOT IN THE KEY** — a back that renders `{{FrontSide}}` shows the front's panels a
    second time, and those are the same panel, not two. **The DECK is**, which is the one judgement here
    worth revisiting: the three Mandarin decks share a type id (`hsk`) and do NOT share the state, so a
    reader who opens the examples in HSK 3.0 opens them once more in HSK 1. Keying on the type alone would
    join them and would also join two unrelated decks that both call a type `basic`; a deck's behaviour
    being a fact about that deck is the safer of the two, and the cost is one press per deck.
    **THERE ARE THREE STATES, NOT TWO**: opened, closed, and never touched. A panel with no stored value
    keeps the template's own default, so an author who ships one `open` still gets it open on a first
    meeting — which is why the map is read as "is there a value at all" rather than as a plain boolean.
    **AND THE RESTORE IS GUARDED ON THE CARD EVEN HOLDING ONE** (`indexOf("<details")`), since almost no card
    does and the alternative is a second DOMParser pass on top of the sanitizer's for every card on the site.
    Device-local, like where the marker sits and how tall the Atlas place sheet is: this is how a card is
    laid out on this screen, not something the schedule should carry between devices.
  · **The CSS gets its own treatment, because it is not HTML and cannot go through the HTML sanitizer** (which
    drops `<style>` outright). `sanitizeCSSText` strips comments, strips `<` (so `</style>` cannot be spelled —
    **`>` is deliberately KEPT**, it is the child combinator and only the opening bracket can end the element)
    and strips backslashes (a CSS escape can spell any blocked keyword; the cost is that `content:"\201C"` has
    to be written as the character); drops `@import`/`@charset`/`@namespace`; narrows `url()` to https and
    `data:image/`; and **demotes `position:fixed` to `absolute`, since scoping a SELECTOR does nothing to stop
    a fixed box being painted across the whole page.**
  · **`cssScoped` prefixes every selector** with `.uc-card[data-uct="<deckId>__<typeId>"]`, drops block-form
    at-rules it doesn't allow (`@font-face`, `@page`, `@document`), keeps `@media`/`@supports`/`@layer` and
    scopes the rules inside them, and leaves `@keyframes` stops alone (`0%` is not a page selector).
    **Anki's convention is that `.card` is the card itself**, and `html`/`body`/`:root` are read the same way —
    an author who writes `body{}` means this card, not the site around it. `ensureCardTypeStyle` injects ONE
    `<style data-uct>` per (deck, type) into the head; leaving them is safe precisely because they are scoped,
    and re-injecting per render would restyle the page on every card. Needs `style-src 'unsafe-inline'`, which
    `_headers` already has — **no CSP change, and none should be needed.**
  · **Switching a card's type is reversible and deleting a type is not, and the code says so both ways.**
    `uCardSetType` keeps `c.fields` when a card goes back to Basic (a `<select>` is one keystroke from being
    hit by accident), and `uCardSanitize` therefore keeps a `fields` map whether or not there is a `type` —
    while a card that has never held one carries no key at all, so a Basic-only deck's export is unchanged.
    `uTypeDelete` does destroy them, and asks first, naming the number of cards.
  · **Studio**: a third tab, **Card types**, with Basic at the head of the list as a read-only row. The card
    editor gets a type picker above the card; choosing a type replaces the whole Basic surface with one box per
    field plus a live preview, rather than dressing the Basic surface up as something it isn't. Both previews
    render through the same `cardFrontHTML`/`buildBack` the study page calls — a second implementation would
    drift.
  · **A typed card has no phrasing pool** (`renderCard` skips `cardQuestions` for one): the chevrons and the
    "1 / 3" counter are about the Basic format's `questions` array.
  · **The deck PAGE's sample card** belongs to no local deck, so it carries its type on `card._type`
    (sanitized from `row.types` there) — `cardTypeOf` reads that before looking a deck up.
  · Guarded by **`.claude/test-card-types.js` (224 assertions)**, which tests the CSS scoper, the template
    engine and the cloze pass as pure string functions (a scoping bug reads far better as a failed comparison
    than as a screenshot of a restyled page), then drives the real Studio, then imports a **hostile deck file**
    through the real file picker. Its preset section (`presetChecks`) runs LAST, after the export round trip,
    so `travelChecks` measures the deck the rest of the file built rather than one with two more types in it —
    and it therefore finds its own way back to the Studio. **Re-run after touching `sanitizeCSSText` /
    `cssScoped` / `cssScopeSelector` / `tplRender` / `clozeMark` / `cardTypeSideHTML` / `ensureCardTypeStyle` /
    `uTypeSanitize` / `uTypeCreate` / `uCardSanitize` / `CARD_TYPE_PRESETS` / `wireSpeakControls`, or
    `levelFromXP`.** Its `reverseChecks` section runs LAST and builds its own deck: it covers the whole of
    one-note-several-cards, and the three assertions worth knowing about are that **template 0 keeps the bare
    note id** (the promise no screen would report breaking), that **no note's two cards are dealt back to
    back**, and that **removing a template drops its cards' progress and not the survivors'**. It also pins
    the shape in the FILE, since a type now travels as a `cards` list and an installed copy renders raw prose
    if it does not.
    Two things that bit while writing it and will bit again: **`render()` called from inside a `change` handler
    throws** — removing the still-focused input fires blur in the middle of `#view`'s innerHTML assignment, so
    blur first and defer the render out of the event; and a test that opens IndexedDB **must close it**, or the
    idle connection blocks the app's own open after a reload and pushes it onto the localStorage fallback.
