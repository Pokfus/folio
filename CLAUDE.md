# Folio — project guide for Claude Code

Folio is a study companion for Chinese history: an Anki-style flashcard site with spaced
repetition, daily games, a glossary, a whiteboard, an admin editor, and an interactive globe.
It is a plain static website — open `index.html` and it runs.

## Golden rules (read first)

- **Zero dependencies, vanilla JS, no build step.** No frameworks, bundlers, npm packages, or
  CDN `<script>`s in the site itself. It must keep working by opening `index.html` directly.
- **Touch only what the task needs.** Don't reformat, rename, or "tidy" files that aren't part of
  the request. Prefer small, surgical diffs over rewrites.
- **Verify before declaring done.** After a change, reload in the browser and confirm there are no
  new console errors. For visual/UI work, it isn't finished until it's been looked at on the page.
- **Never fabricate card or glossary content.** This is a study tool — historical accuracy
  matters. If unsure about a fact, say so; don't invent dates, names, or definitions.
- **Be honest about scope and tradeoffs.** Flag limitations and judgment calls plainly rather than
  papering over them.
- **Keep the changelog current.** Whenever a user-requested change ships to the live site (committed/pushed),
  append a one-line plain-English summary to TODAY's entry in `changelog.js` (create the day if missing; newest
  day first). Reader-facing wording — what changed for the user, not how. **Card/glossary content changes are
  summarized by count + deck only, never naming specific cards or terms** (e.g. "Three new cards in the Western
  Zhou deck"). The Mission page renders it.

## File map

Script load order in `index.html` is significant:
`data.js → truefalse.js → glossary.js → glossary-wikipedia.js → world.js → uk.js → lakes.js → rivers.js → water.js →
ranges.js → admin1.js → cities.js → timeline.js → countries.js → country-stats.js → country-years.js → app.js`.
(`heightmap.js` + `heightmap-ultra.js` are **not** in this list — they are lazy-loaded when the Heightmap layer is enabled / zoomed in.)

- `index.html` — app shell. `<main class="stage"><div id="view"></div></main>`.
- `styles.css` (~94 KB) — editorial design system; 8 themes via CSS custom properties.
  **All theme color variables are hex** (e.g. `--ink:#1B1A17`) so the canvas globe can parse and
  blend them — keep them hex, not `rgb()`/`hsl()`.
- `app.js` (~175 KB) — all logic, written as a single IIFE. Hash-based routing via the `PAGES`
  map. No ES modules.
- `data.js` — `window.CARD_DATA` and `window.COLLECTION_TREE`. **Currently ~23 cards** (regrown from
  the `cnh-001` template, which remains the canonical format); the deck is grown one card at a time
  (see "Generating cards & glossary entries" below).
- `glossary.js` — `window.GLOSSARY` plus `window.GLOSSARY_DATES`, `GLOSSARY_TITLES`, `GLOSSARY_ALIASES`,
  `GLOSSARY_CASESENSITIVE`, and `GLOSSARY_TAGS` (per-term category tags — the admin glossary's left-bar
  filter). **Currently ~2,100+ terms**, grown from the `Sima_Qian` template, one at a time.
- `glossary-wikipedia.js` — `Object.assign`s extra summaries onto `window.GLOSSARY` (loads *after*
  `glossary.js`). **Currently an empty stub.**
- `world.js` (~1.6 MB) — `window.WORLD_GEO`, country-border polygons (Natural Earth 110m, ~117k verts) for the
  Atlas globe.
- `uk.js` (~47 KB) — `window.UK_SUBUNITS = [ { n, p:[rings], c:[mask] } ]`, the UK's constituent countries (England,
  Scotland, Wales, Northern Ireland) + Ireland (the whole island, for the pre-1922 all-Ireland UK), from Natural Earth
  10m admin-0 **map subunits** (matched by `SU_A3`, since the NAME field abbreviates "Northern Ireland" → "N. Ireland").
  Built by `.claude/build-uk.js`. The `c` mask marks each edge `'0'` internal land border (England–Scotland, England–Wales —
  drawn light by `drawUKConstituents`) or `'1'` coast (the island edges + the UK–Ireland international border, left to
  `world.js`). Double-clicking the UK on the globe drills into the constituent under the cursor (see the Atlas section).
- `heightmap.js` (~3.5 MB) + `heightmap-ultra.js` (~8.9 MB) — `window.HEIGHTMAP` / `window.HEIGHTMAP_ULTRA = { w, h, lo, hi, png }`,
  the **global terrain-relief raster** as two LOD levels: a **base 6144×3072** (terrarium z=5) and a sharper **ultra 10240×5120**
  (terrarium z=6). Each is an equirectangular grayscale PNG (data-URI; pixel 0..255 → elevation `[lo,hi]` m) baked from the **AWS
  open Terrain Tiles** (the data behind tangrams.github.io/heightmapper) by `.claude/build-heightmap.js` (`node build-heightmap.js
  [Z] [OUTW] [OUTH] [outFile] [varName]` — key-free build-time tile fetch + a minimal zlib PNG codec, zero runtime deps).
  Both are **lazy-loaded** (NOT in `index.html`): enabling the **Heightmap** legend toggle (default off) loads the base via
  `loadHeightmap()`; the ultra loads only once zoomed past `HMULTRA_Z`. `drawHeightmap` reprojects the active level onto the globe
  over **land AND ocean floor (bathymetry)** — clipped only to the disk (cheap) — **blended with an `"overlay"` composite** (not a
  flat image paste) at strength `HM_OPACITY = 0.7`, so the grey relief **modulates the map's own colours** (lows/ocean-floor darken,
  peaks lighten; sea level = mid-grey 128 = neutral). Borders/rivers/cities still draw on top, **the same in every era** (physical
  layer, not in `PRESENT_ONLY`). The grey is
  baked into a **per-pixel alpha** that is **theme-aware**: on `body.night` it adds opacity to the DARK (ocean / low) end so the
  darks go darker over the dark map; on day it adds opacity to the BRIGHT (high-land) end so peaks go brighter — keeping the other
  end at the faint base. (So the ocean bathymetry is visible mainly on dark themes; tune via `aBase`/`aBoost`.) The reprojection
  buffer cap is **low while moving** (stays visible without lag — no blink) and **up to full canvas resolution when settled +
  zoomed in** (crispest the data allows at deep zoom); settled renders are cached. (Crisper-than-z=6 deepest-zoom detail would
  need runtime tile streaming, which would break the offline-first design and is imperceptible at this opacity, so it's not done.)
  An older `elevation.js`/three-globe attempt was replaced.
- `truefalse.js` (~34 KB) — `window.TRUEFALSE = [ { q, a, why, cat } ]`, the statement pool for the **True or False** home-page
  minigame (79 historical myths/misconceptions + surprising truths; `a` is a boolean, `why` the explanation). Generated and
  **adversarially fact-checked** for accuracy by a workflow (`q` statement, `a` true|false, `why` reality, `cat` category).
- `quotes.js` — `window.QUOTEGAME = [ { q, who, context } ]`, the pool for the **Who said it?** home-page minigame (64 famous,
  well-documented quotations by distinct historical figures; `who` = the speaker, `context` = a 2-sentence explanation shown on
  reveal). **Adversarially fact-checked** for correct attribution (quote misattribution is rampant). The 4 answer options are the
  correct speaker + 3 other `who` names from the pool (all real people → plausible). Loaded before app.js (after `truefalse.js`).
- `changelog.js` — `window.CHANGELOG = [ { d:"YYYY-MM-DD", label?, t, items:[…] } ]`, the day-grouped release notes
  rendered as the **Mission** page's collapsible changelog (`PAGES.mission` — nav tab in the LEFT group, right of Atlas;
  section order: intro prose → changelog → credits/licenses). See the golden rule: append to today's entry on every ship.
- `mission.js` — `window.MISSION = { title, paras:[…] }`, the Mission intro copy (raw HTML; gloss links are auto-added at
  render via `autoLinkGlossary` + `setupTooltips`). **Admins click the title or a paragraph on the page to edit it in
  place** (Esc cancels, Ctrl+Enter/blur saves): edits overlay via `ADMIN_EDITS.mission` (merged at render by
  `missionMerged()`, so undo/reload need no special handling) and bake back into this file through auto-save /
  "Save to project" / `folioSave.files` (`serializeMission`).
- `lakes.js`, `rivers.js`, `water.js`, `ranges.js`, `admin1.js`, `cities.js` — extra
  Natural-Earth layers for the Atlas globe (lakes, rivers, water-body labels, mountain ranges,
  admin-1 borders, city pins); built by the `.claude/build-*.js` dev scripts. (A Forests layer
  was removed; `forests.js`/`build-forests.js` remain on disk but are no longer loaded or rendered.)
  The **Mountains layer was likewise removed** from the globe: its legend toggle + `wire("#rangesToggle",…)` are
  gone and `rangesOn` defaults `false` with no way to enable it, so `drawRanges` is never called (ranges.js is still
  loaded and `drawRanges`/`RANGES` remain as inert dead code — the layer just no longer renders or appears in the legend).
  `lakes.js` = `window.LAKES` (**~302 major inland seas & lakes**, NE 10m), kept by `build-lakes.js` when
  `scalerank ≤ 4 OR area ≥ 0.1 deg² OR` a well-known name (a `FAMOUS` regex ensures the Alpine lakes,
  Dead Sea, rift lakes, etc.). **Outer rings only** (island holes dropped) so every lake fills solid — otherwise an
  island-heavy lake (e.g. Manicouagan) renders as a confusing thin "ring". Rendered as ocean-coloured fills on top of
  the land (present-day shape in every era), with **no shore stroke** — lakes are covered by the country fill and just
  re-filled as water, so inland seas & lakes read clean (no outline) on the 2026 map too, matching the historical maps
  (don't reintroduce the per-lake border stroke). The **Caspian Sea is NOT in this layer** — no country polygon covers
  it, so it shows through as ocean (its shore is still drawn as a coastline, same on present-day + historical). Rivers
  (`rivers.js`) are stroked in the **ocean colour** (`riverCol = ocean`) so they read as water continuous with the sea.
- `timeline.js` — `window.TIMELINE`, historical border *eras* for the globe timeline (past-year
  political maps, **borders only**). Starts empty; eras are added in **Edit → Timeline** (see
  "Generating timeline eras").
- `countries.js` — `window.COUNTRY_INFO`, a map of *lowercased country/territory name* → 5-sentence
  description, shown in the Atlas click popup. Covers present-day countries (`world.js`) **and** every
  historical-era territory (`timeline.js`); a missing entry just yields a "no description yet" fallback.
  **Regenerated (from the accurate source summaries) + adversarially fact-checked** so each is exactly **5 clean,
  general, TIMELESS sentences free of number-grid figures** (population/area/GDP live in the stat tiles, not the prose) —
  including the 20 former Wikipedia disambiguation stubs (Oyo Empire, Kong Empire, Kuba/Luba/Lunda, Vatican City, etc.),
  which were researched into real descriptions of the entity the map means. Don't reintroduce grid figures or year-pinned
  facts into these; keep them general (the per-year specifics belong in `country-years.js`).
- `country-stats.js` — `window.COUNTRY_STATS`, *lowercased country name* → `{ pop, area, gdp, gdppc }`
  present-day figures (Wikidata, formatted strings) for the popup's stat tiles, shown **at the present year**. It also holds
  `window.COUNTRY_STATS_YEARS`, *name* → `{ "<map-year>": { pop, area, gdp } }` — **year-specific** figures shown at a historical
  map-year (`countryStatsYear()`; GDP-per-capita computed at render). Missing → a long dash, never fabricated.
- `country-spans.js` — `window.COUNTRY_SPANS`, *lowercased state/iteration name* → the years that iteration existed
  (e.g. `"1815 – Present"`, `"1636 – 1912"`), shown in **thin grey under the popup title** (`countrySpan()`; missing → the line
  collapses). Keyed by the name as it appears on the map (present-day name, or the era iteration name). Grown per timeline year.
- `country-years.js` — `window.COUNTRY_YEARS`, *lowercased state name* → `{ "<year>": "<2–3 sentence
  description of that state in that map-year>" }`, for the popup's middle "year" column (`countryYear()`).
  Keyed by the name as it appears on each era's map (e.g. `british raj`, `ussr`, `france`) and the map-years
  (1900/1920/1938/1960/1994/2000/2010/present). Built by a verified generation pass; **only fact-checked
  entries are added — a missing one shows a dash, never a fabricated fact.**
- `fetch-glossary.js` — standalone Node helper, run manually, that backfills missing glossary
  terms from Wikipedia. Not loaded by the site.
- `fetch-countries.js` — standalone Node helper (run manually, resumable) that fetches the 5-sentence
  Wikipedia summaries into `countries.js` for every clickable name. Re-run after adding timeline eras so
  their new territories get descriptions. Not loaded by the site.
- `fetch-stats.js` — standalone Node helper that fetches present-day Population/Area/GDP/GDP-per-capita
  from Wikidata (matched to `world.js` by ISO code) into `country-stats.js`. Not loaded by the site.

## How the app is wired

- **Routing:** `location.hash` → the `PAGES` map (home, decks/library, study, map/atlas, account,
  settings, challenge, chrono, admin). `render()` clears `#view` and calls the current page fn.
- **State:** `localStorage["folio_v1"]` holds settings and spaced-repetition scheduling.
- **Admin edits:** `localStorage["folio_admin_v1"]` stores edits as *deltas*, applied at startup
  by mutating the in-memory globals (`CARD_BY_ID`, `window.GLOSSARY`, the collection tree). The
  shipped data files are never rewritten by the app; edits live in this override layer and can be
  exported as JSON. **"Save to project"** (`adminExport`) writes `data.js`/`glossary.js`/`timeline.js` via the File System Access
  API (Chrome over `http://localhost`) then prunes the overlay + reloads. **"Auto-save: on"** (`adminAutosave` toggle, pref
  `folio_autosave_v1`) writes those same files on **every** edit (debounced ~20s after you stop typing) with NO prune/reload — the folder handle is kept in
  IndexedDB (`folio-fs`), and since `applyAdminEdits` is idempotent (created-card guard + set-based) the untouched overlay re-applies
  cleanly on reload. Chrome's write permission is per-session, so after a reload the toggle shows an amber **"reconnect"** state you
  click (a user gesture) to re-grant. Only works in real Chrome over localhost — not `file://` or the Claude Code preview webview.
  Because a file-watching dev server may **live-reload** the page after each auto-save, the editor **persists its position**
  (open card/deck/term, tab, search, sort, tree-expansion, list scroll) to `localStorage["folio_admin_ui_v1"]` (`saveAdminUI`, on
  every navigation + `pagehide`) and **restores it on load** (`restoreAdminUI` seeds `adminState`; `PAGES.admin` re-validates the
  saved card/node/term against the rebuilt tree and scrolls it back into view) — so a reload lands you back on the card you were
  editing instead of the top of the deck.
- **Admin undo (Ctrl/Cmd+Z on the editor page):** an overlay edit checkpoints its PRE-edit state (JSON) onto an in-memory
  `adminUndoStack` via `adminCheckpoint()`. Immediate/structural saves (`saveAdminEdits`, e.g. create/delete/rename/move) checkpoint
  directly; debounced field-typing (`queueAdminSave`) checkpoints at the **LEADING edge** of a burst and the debounce fire only
  advances the baseline via `writeAdminEdits` (no 2nd entry) — so a Ctrl+Z **mid-burst** (before the 350ms save) still reverts the
  in-flight edit, and a structural action that interrupts a pending burst doesn't collapse the two into one undo (both were fixed
  after a review flagged them). Bursts collapse into one entry; capped 100; session-only, not persisted. A global keydown handler
  fires `adminUndo()` **only when `current.name === "admin"` and focus is NOT in an input/textarea/contenteditable** (so the
  browser's native typing-undo is preserved inside fields).
  `adminUndo` pops a snapshot and `reapplyAdminOverlay` reconstructs state exactly as a fresh load would: reset the in-place-mutated
  globals to their shipped base (`glossaryResetToPristine()` from `PRISTINE_GLOSS*`; rebuild `CARDS`/`CARD_BY_ID` from `PRISTINE_CARDS`
  restricted to `BASE_CARD_IDS`), install the snapshot as `ADMIN_EDITS`, then `applyAdminEdits()` (which rebuilds the tree from
  `SHIPPED_NODES` and re-applies all deltas). Guarded by `_adminUndoing` (so the undo's own save doesn't re-checkpoint) and
  `_adminUndoReady` (false until boot, so the load-time overlay cleanup isn't captured). Known limitation: undoing a **first
  timeline-era edit** (`ADMIN_EDITS.timeline` array→null) doesn't reset the in-memory `window.TIMELINE` (a deep snapshot would cost
  MBs) — the overlay reverts, so it self-heals on reload; timeline eras are edited on the map page anyway, out of this handler's scope.
- **Gloss popups persist across reload:** the open glossary popups (`glossWins`, the draggable `.gloss-win` windows opened by
  clicking a `.ttip` term) are recorded to `sessionStorage["folio_gloss_open_v1"]` as `{ r: <route>, w: [{ k, l, t }] }` (owning page
  + term slug + left/top) by `persistGlossOpen()` on open / user-close / drag-end. **`sessionStorage` (not local)** so an F5 /
  dev-server live-reload in the same tab restores them, but a tab/browser **close** clears them (a cold restart won't resurrect stale
  popups). Boot captures the record **before** the first `render()` (whose `closeAllGloss()` clears the key) and `restoreGlossWins()`
  re-opens each at its saved position **after** the initial render — but **only if the record's route matches the booted page** (so a
  popup opened during study, which reloads to Home since `study` isn't a restorable hash, is dropped rather than orphaned over Home).
  Navigation still dismisses popups (`render()` → `closeAllGloss` also clears the key). Terms no longer in `window.GLOSSARY` are
  skipped; on mobile only the first saved popup is restored (single-sheet). `renderCard()` calls `closeAllGloss()` **before** its
  empty-queue early return so a last-card popup can't linger over the completion screen. `openGlossWin(key, triggerEl, pos)` takes an
  optional `pos` to place a restored window (vs `positionGlossBeside` for a fresh click).
- **Hierarchy terms:** collection → deck → subdeck. (An early refactor renamed these from the old
  deck/subdeck/sub-subdeck — don't reintroduce the old names.)
- **Cards** can belong to several decks at once (cross-listed by era/date) with shared progress,
  and are ordered chronologically.
- **XP / levels** (`levelFromXP` / `xpBarMarkup` / `levelBadgeMarkup` in app.js): **XP = the number of distinct cards
  studied** (derived from `S.cards`; no separate persistence). Each level costs `3 × level` more cards (bar starts at
  0/3, then 0/6, 0/9, …). Each **collection** has its own level (distinct cards studied within it, `collectionXP` =
  `studiedInNode`) shown on its **Library banner**; the whole of Folio has a **general level** (`folioXP` =
  `Object.keys(S.cards).length`) shown on the **home Daily-review banner**. Both banners carry a **large level numeral**
  on the left (`.level-badge` — just the numeral now; the small "Level" label under it was removed since the blue "Level N"
  in the xp-bar head beside it already says it), rendered in a **golden colour** (`.banner .lb-num` + `.collection-row .lb-num`
  = `#C39A2E`, brighter `#E6C765` on `body.night`; the profile `.cl-row .lb-num` stays indigo). The old studied/total
  **progress bars were removed from Library decks + collections and the Daily-review list** (progress bars remain only on the
  account page's "Progress by deck"). Each collection's level is also listed on the **profile** (`renderCollectionLevels` in
  `acctSelfView`). `grade()` calls `announceLevelUps(id)` on a freshly-studied card → a **full-screen "Level up!" popup**
  (`congratsPopup(items)`, a `.levelup-pop` overlay modelled on `inlineModal`) naming each Folio/collection level that ticks
  over (China's shown as its Chinese numeral); it is **dismissed by clicking anywhere on screen** (or Esc/Enter) — the
  click-to-close listener is wired a tick later (`setTimeout 0`) so the grading click that spawned it doesn't instantly dismiss it. Clicking a **deck row in the home Daily-review list** starts a study session scoped to just that deck
  (`data-review` → `route("study",{scope:{type:"deck",id}})`). On the **Library page, clicking a collection's body studies its
  whole subtree** (`wireExpander`'s optional `rowClick` → `route("study",{scope:{type:"deck",id}})`, since a collection is in
  `NODE_BY_ID` and `subtreeCardIds` covers it); its **chevron still expands/collapses** the decks within (the chevron's
  `stopPropagation` keeps it from also studying). A coming-soon / empty collection falls back to toggling.
- **Daily review order** (`reviewOrder` toggle → `S.settings.reviewRandom`): **Chrono** presents cards in their in-deck order;
  **Random** shuffles the session order AND **draws the day's NEW cards at random from across the active decks** (rather than the
  first-N in set order) — `reviewQueue` seeded-shuffles the unseen pool by the date (`seededShuffle(pool, mulberry32(hashStr("review-"+todayStr())))`) so the same new cards surface all day.
- **Scheduling (`grade()`):** SM-2-ish with Anki-style learning steps. A **new card graded "Good"** becomes a `learning` step
  (`interval 1/144`, `due = now + 10 min`) that **re-appears the same session/day** — grade() returns `{requeue: due-now < 11 min}`
  and the study session does `queue.shift(); if (requeue) queue.push(id)` — and only **graduates to `review` (due tomorrow) on the
  next "Good"** (Anki-like; before this it jumped straight to tomorrow). "Again"/"Hard" on a new/learning card also requeue
  (1 min / 6 min); "Easy" graduates immediately (4 days). `S.intro.count` (the daily new-card cap via `newRemainingToday`) is
  incremented only on a card's FIRST grade (`fresh`), so a requeued learning card is never re-counted.
- **Card fields (13):** `id, num, category, question` (HTML cloze with blanks), `answer`,
  `answerDate` (HTML), `traditional, hanzi, pinyin, translations` (HTML), `abstract` (rich HTML
  card background; may carry `ttip` glossary links, but newly generated cards omit them),
  `citation, answerText`.
- **Themes (8):** folio, atlas, press, bloom, tide, clay, garden, synth — each light + dark.
- **Language switcher** (`#lang-switch` in the top bar, right of Settings): a dropdown of 7 languages (en/es/fr/de/it/nl/ru)
  stored in `S.settings.lang`. **The site is NOT localised yet** — selecting a language is a no-op (just persists + toasts).
- **Read-aloud TTS** (Web Speech API, zero-dependency; the `/* text-to-speech */` block in app.js): a slow MALE English voice
  (`ttsVoiceEn`, rate 0.85) + a slow FEMALE Chinese voice (`ttsVoiceZh`, rate 0.7 — also used by the `.tr-play` pronunciation
  buttons via `speak()`). **Voice choice is quality-scored** (`ttsPickVoice`): neural/natural/enhanced/premium names +8, network
  (`localService===false`) +2, wanted gender +4, wrong gender −3 — so Edge's free "… Online (Natural)" neural voices and iOS
  "Enhanced" voices win automatically; a voice picked in **Settings → Reading voices** (`S.settings.ttsVoiceEn/ttsVoiceZh`,
  stored by `voiceURI`, "" = auto; EN + ZH selects with Test buttons, refreshed on `voiceschanged` via `_ttsVoicesHook` since
  mobile delivers the list async) always beats the auto-pick. **The API can only use voices installed on the device** — Android
  Chrome often exposes a single female Google voice per language, so no in-app fix can produce a male voice there (the user must
  install/select a better system TTS voice, or pick the least-robotic option in the picker). Studying a card auto-reads the question (the cloze `____` is read as **"blank"** — `ttsQuestionText`);
  revealing auto-reads answer title → hanzi (ZH) → background. English text is **chunked into ~220-char sentences** (`ttsChunks`)
  or Chrome's engine cuts out mid-paragraph. Two gates: the Settings-page **Text-to-speech** toggle (`S.settings.tts` — off hides
  every control) and the card's top-right **mute** button (`S.settings.ttsMuted`, **persisted** so leaving a card muted keeps all
  future cards/decks muted until unmuted; muting `ttsStop()`s dead — unmuting never resumes). Tiny `[data-tts]` play triangles sit
  behind the Question/Answer/Background section titles (Background's is a `role=button` SPAN inside the `.bg-head` button — a
  nested `<button>` would be invalid HTML) and behind the gloss-popup title; `wireTTS(container, c)` binds them (study, admin
  previews). **Opening a gloss popup interrupts the current read, waits 500ms, then reads title + dates + description**
  (`ttsSay(parts, 500)`; a generation counter `_ttsSeq` kills superseded delayed reads — `ttsSay` also defers ≥60ms because Chrome
  swallows a `speak()` issued synchronously after `cancel()`). Right-clicking a text selection inside the background paragraph
  shows a custom **Copy / Read aloud** menu (`wireReadAloudMenu` → `.ctx-menu`; native menu when TTS is off or nothing is
  selected). `render()` calls `ttsStop()` so navigation always silences reading.
  **Baked narration** (`audio/cards/<narrator>/*.mp3` + `manifest.json` + `_sample.mp3`, built by `node .claude/build-tts.js
  [--narrator=key]`): card sections (question/answer/background) pre-rendered with a local neural TTS (**Piper**). FOUR shipped
  narrators (Settings → **Narrator**, `S.settings.ttsNarrator`, default `us-male`): `us-male`/`us-female` =
  `en_US-libritts_r-medium` speakers 5/12, `gb-male`/`gb-female` = `en_GB-vctk-medium` speakers 13/14 — both datasets
  **CC BY 4.0, commercial-safe**; do NOT switch to `hfc_male`/`ryan`/`lessac`, they're CC BY-**NC**. 48 kbps mono MP3, ~85 MB
  per narrator. The runtime loads the selected narrator's manifest (`loadBakedManifest()`; re-fetched on picker change; the
  Test button plays `_sample.mp3`) and plays a baked file when `bakedUrl()` finds one whose manifest hash (`hashStr` of the
  section text) still matches — an admin-edited card silently falls back to the Web Speech engine, as do missing files,
  `file://` (manifest fetch fails), and autoplay-blocked plays. **Gotcha:** the build's text-canonicalization must mirror DOM
  `textContent` EXACTLY — tags strip to "" (not a space), else every background hash mismatches and reads with the robotic
  device voice (this happened; `--rehash` updates manifest hashes without re-synthesis after canonicalization-only changes).
  `ttsSay` is a sequential part-driver (`runTTSPart`: baked `<audio>` → engine fallback per part); `ttsStop()` also halts
  `_ttsAudio`. Chinese hanzi stays on the device voice (no commercially-clear zh Piper voice). The bake is incremental
  (manifest hash check; `--force` re-bakes; `--scan-speakers=N` pitch-scans voices; toolchain auto-downloads into gitignored
  `.claude/tts-cache/`). Gloss popups + selection read-aloud always use the engine.
- **Home minigames** (game-grid tiles → `PAGES.*`): **Multiple Choice** (`PAGES.challenge`, formerly "Daily Challenge" — the
  rival bots + timer were removed; it's now a plain 5-question quiz whose 3 wrong options are the SAME `answerType()` as the
  answer — a person → other people, a dynasty → other dynasties), **Timeline** (`chrono`), **True or False** (`truefalse`), and
  **Who said it?** (`whosaid`, from `quotes.js`). `BOTS`/`drawRace`/podium are now dead code.
  Each of the 4 games records a per-day result in `S.games[key] = { date, played, won }` (`markGamePlayed(key, won)` at each
  game's end; `won` = a perfect run, or `solved` for Timeline). The home tile has **three daily states** (state classes set by
  `tile()`) — playing EARNS the colour: **unplayed** = mostly colourless like the "coming soon" tiles (plain card background,
  theme colour only in the left bar, faint corner icon — `button.game-tile:not(.done):not(.won)`); **played today** (`done`, via
  `gamePlayedToday` — challenge/chrono still also derive it from `S.daily.lastPlayed` / `S.chrono.date`) = the tile FILLS with
  its theme colour (bright top-left → darkened far corner, dark icon, white text) + the green **✓ checkmark**; **perfect score
  today** (`won`, via `gameWonToday`) = a **shining gold** tile (`gt-gold-shine` sweeps a white band across the gold via
  animated `background-position`; icon/text darken; check stays). In **light mode** the filled (non-gold) tile skips the
  darkened far corner (`body:not(.night)` override). A played tile's tagline becomes **today's best score** ("4/5 correct!",
  chrono: "in order!") — `markGamePlayed(key, won, score, total)` stores `{s, n}` per day, `gameSub()` renders it. The
  Daily-review banner's CTA sits at the **bottom-left inside `.body`** (below the full-width xp bar), on mobile too. The **"Clean Sweep" achievement**
  (`sweep`, 🎯) unlocks when **all four are `won` on the same day**
  (`allGamesWonToday` → `progStats().dailySweep`). A perfect Multiple-choices run also increments `S.daily.wins`, which **revived
  the previously-dead `win1`/`win10` (Victor/Champion) badges** (`wins` was never written after the bot race was removed).
  `S.games` is in `defaultState()` (back-fills old saves) and `PROGRESS_FIELDS` (mirrors to the account).
- **China's collection level** renders as a **Chinese numeral** (`一 二 三 …` via `cnNumeral()`, Han font) — `levelBadgeMarkup(xp, zh)`
  with `zh = d.id === "china"`. (`一` for level 1 is a single horizontal stroke, so it reads as a bar until level 2+.)
- **Mobile** (`@media max-width:640px`): page content is centred (`.page-head{text-align:center}`); the top nav is condensed
  (the admin-only Editor/Visitor `.mode-switch` is hidden, controls shrunk) and horizontally scrollable so every item fits and
  the bar spans edge-to-edge.
- **Atlas:** an orthographic Canvas-2D globe (drag to rotate, wheel/pinch zoom, **on-screen `+`/`−` buttons (`#gzIn`/`#gzOut`,
  `.globe-zoom`) + keyboard `+`/`−`** via `zoomStep()`; `ZMIN 0.82 … ZMAX 10`). Zooming scales the disk
  radius (`R = baseR·zoom`), so the globe fills the screen by ~zoom 2.1 (`R ≥ dist(centre,corner)`). The **wheel-zoom listener is
  bound to `window` in the CAPTURE phase** (`onGlobeWheel`), not to the canvas — some hosts (e.g. the Claude Code live preview)
  route `wheel` to a scroll container / parent rather than the canvas, so a canvas-only listener never fired there and scroll-zoom
  looked dead. Catching it at window+capture and acting only when the pointer is over the globe stage (with `stopPropagation` so
  the host can't also scroll its pane) makes scroll work wherever the event reaches the DOM at all. The **on-screen `+`/`−` buttons
  + keyboard `+`/`−`** (`zoomStep()`) remain as a fallback for any host that swallows wheel entirely before the DOM sees it.
  (Also re-runs `resize()` on `devicePixelRatio` changes so page-zoom / DPI changes don't leave the canvas at a stale resolution.)
  The wheel handler **normalizes `e.deltaMode`**
  (a line ≈ a 33px notch, a page ≈ the viewport) and uses a punchy factor so a few notches fill the screen — without this,
  line/page-mode mice barely zoomed and the globe seemed stuck at a fixed size (the "broken zoom"). The wheel zoom is
  **zoom-to-cursor**: it captures the lon/lat under the pointer (`screenToLonLat`), applies the zoom, then nudges
  `rotLon`/`rotLat` by `(before−after)` so that same geographic point stays under the cursor (recentering the globe on
  where you point, rather than always zooming to the disk centre).
  The Claude Code preview webview does **NOT repaint the `<canvas>` after a `preventDefault()`'d wheel gesture** (the draw runs and
  `zoom`/`R` update, but the pixels stay frozen — discrete clicks and a window-resize DO repaint). Fix: while a wheel gesture is
  active (`wheelActive`, set in `onGlobeWheel`, cleared in `settle()`), `draw()` calls `forceComposite()`, which **reallocates the
  canvas backing store** (toggles `canvas.width` by 1 device px, imperceptible) — the same thing a window-resize does, forcing the
  host to re-rasterize+composite. Gated to wheel gestures so drag/idle keep the fast (no-realloc) path. Don't use a CSS transform
  nudge for this — it promotes the canvas to a layer that onion-skins old frames into gold ghost rings. See the
  [[wheel-zoom-deltamode]] memory (incl. the gotcha that `preview_eval` hits a different browser than the user's panel).
  The Atlas **opens centred on the scholar's home location** — `atlasView` (the persistent rotLon/rotLat/zoom) is initialised from
  `S.settings.home` (`{ name, lon, lat }`, **default the Netherlands**; back-filled on load for older saves). Change it in
  **Settings → Home location**, a country `<select>` (`.set-sel`) built from `window.WORLD_GEO` names; picking one stores the
  largest-ring bbox centre via `countryCenter(name)` and re-centres `atlasView` (zoom reset to 1). Home lives in device settings,
  not the synced account record.
  Full-bleed between the top nav and a fixed bottom timeline (1000 BCE → present). Clicking a country
  (present-day or a historical era's territory) highlights it and shows a single info popup above the
  timeline — its name + a 5-sentence description from `countries.js`; one at a time, cleared on a second
  click / ocean click / era change. The popup is **capped on EVERY viewport** (the base `.country-pop` rule, not just a mobile
  media query): `max-height:70%` of the `.globe-stage` (which has a definite height — `position:fixed` with top+bottom, so the `%`
  resolves), `display:flex; flex-direction:column`, and its **`.cp-cols` scroll internally** (`overflow-y:auto; min-height:0`) — so
  on a phone, a tablet, OR a short/landscape window the box can't fill the screen and push the × off the top; the globe stays visible
  above it and the absolutely-positioned **`.cp-close` (×) stays pinned** at the top-right instead of scrolling away. (Earlier the cap
  lived only in `@media max-width:720px`, so tablets/landscape >720px went uncapped and the × scrolled off — the real bug behind "the
  box fills the screen".) The `@media max-width:720px` block now only switches `.cp-cols` to a single column. Don't put `overflow` on
  `.country-pop` itself (the × would scroll off). The popup (`#countryPop`) is three columns: the state's **full legal official name**
  (`officialName()` — from the summary's "officially …", or a leading "Full Name, commonly known as …" form, with a state-type
  keyword fallback so e.g. USSR → "Union of Soviet Socialist Republics"), with the **years that iteration of the state existed** in
  **thin grey directly under the title** (`.cp-span` ← `countrySpan()` / `country-spans.js`; missing → the line collapses); + a
  **general description of the state**
  (`stripInfoNoise(countryDesc())`) that is **constant across timeline years** (keyed by the entity name — it only differs when
  the name does) and free of any figure shown in the number grid; the **year** + a per-year paragraph describing that state in
  that map-year (`country-years.js` → `countryYear()`; missing → a dash, never fabricated); and a 2×2 grid of **Population / Area /
  GDP / GDP-per-capita** tiles — **year-specific** (present year → `country-stats.js`; a past map-year → `country-stats.js`'s
  `COUNTRY_STATS_YEARS`; missing → a dash). Pop/Area/GDP come from `country-stats.js`
  (Wikidata); **GDP-per-capita is computed at render** as GDP ÷ Population (`statNum()` parses the formatted strings) — it is NOT
  stored. **Hovering (or focusing) a number** shows a small speech bubble naming its source ("Source: Wikidata" / "Calculated:
  GDP ÷ Population").
  Glossary terms in **both** the summary and the per-year paragraph are **auto-linked** (`autoLinkGlossary` +
  `setupTooltips`, same as card backgrounds) so each opens its gloss popup; the place's own name is skipped.
  **Wilderness / stateless (unnamed) areas are not clickable** (`countryAt` skips unnamed entities).
  **Two-level click / drill-down** (single = parent, double = child):
  - **Merger-only eras** (groups, e.g. 1960 *USSR*): single-click selects the whole group; **double-click** selects the
    **present-day country under the cursor** within it (`countryAt(px,py,true)`), highlighting its exact `world.js`
    borders (`subSelGeo` → `paintFillRings(GEO[subSelGeo].p,…)`) and showing its per-year info.
  - **Geo eras** (1900/1920/1938): every territory carries a **`.mother`** field (its sovereign / colonial power, classified
    by an agent pass and applied to `timeline.js`, since the source's `SUBJECTO` tag is unreliable — Algeria/Kenya/Angola are
    tagged as themselves). The click model is a drill-DOWN (more clicks = deeper): **single-click selects the whole EMPIRE** —
    every territory sharing that `.mother` (so clicking French West Africa lights up France + all French colonies) — and shows
    the empire named as an EMPIRE via the `EMPIRE_NAME` map (mother "United Kingdom" → "British Empire", "France" → "French
    colonial empire", "Denmark" → "Danish Realm", "Chinese Warlords" → "Warlord-era China", …; mothers already named as a state
    map to themselves; the US resolves to "United States of America"). Empire descriptions live in `countries.js` (13 added,
    workflow-researched + adversarially fact-checked). **Double-click selects just that one territory/home country** (British Raj,
    or the UK metropole "United Kingdom of Great Britain and Ireland") and shows its info. Independent states are their own mother
    (group = just themselves). Multi-tap is counted by `tapCount` (1/2/3, same spot within 400ms).
  - **UK constituent countries** (`uk.js`, in EVERY era incl. present-day): the UK's internal land borders (England–Scotland,
    England–Wales) draw light (`drawUKConstituents`). The constituents are the DEEPEST level, so they're reached by a
    **TRIPLE-click on a geo era** (empire → country → constituents) and a **double-click elsewhere** (present-day / merger era:
    country → constituents) — `constituentHit()` returns the one under the cursor (England / Scotland / Wales / Northern Ireland), era-aware: **before the 1922
    partition the whole island of Ireland was part of the UK**, so any Irish point → the all-Ireland "Ireland"; from 1922 only
    N. Ireland is, the Republic being a separate country). Its popup uses `showCountryPopupName(name, true)` → the constituent's
    general description (from the inline `UK_DESC`), no year paragraph or stats. Highlight state is `subSelUK` (an array — the (era-aware: **before the 1922
    partition the whole island of Ireland was part of the UK**, so any Irish point → the all-Ireland "Ireland"; from 1922 only
    N. Ireland is, the Republic being a separate country). Its popup uses `showCountryPopupName(name, true)` → the constituent's
    general description (from the inline `UK_DESC`), no year paragraph or stats. Highlight state is `subSelUK` (an array — the
    pre-1922 all-Ireland selection lights both Ireland + N. Ireland). The drill is checked **before** the era logic, so it works
    over the UK in a colony-grouping geo era too (and a non-UK double-click still drills to the colony/present-day country).
  - The **info box** layout is the **same in every era** (`showCountryPopupName`): title = the state's full official name, the
    left/main paragraph = its general description (**constant across years**, keyed by the entity name), and the middle column =
    the per-year paragraph (`countryYear()`) describing that state in the selected map-year — so the constant "who they are" sits
    beside the year-specific "what was happening". `stripInfoNoise()` strips translation parentheticals + any sentence quoting an
    actual **numeric** grid figure from both — money (`$/€ N`), a population/GDP count in millions/billions, or an area in
    km²/sq mi. (It matches numeric figures only, NOT the bare words "population"/"GDP" — matching the words wrongly dropped
    figure-free general sentences like "most of the population lives on the coast"; don't reintroduce word-matching.)
    Stats (the number grid) are present-day Wikidata figures → shown only at the
    present year, a dash otherwise. (Earlier the historical box used the year paragraph AS the main text; it now mirrors the
    present-day layout.)
  - **The golden overlay traces EXACTLY the edges the map draws** (`paintFillRings`) — it must match the displayed borders +
    coastlines. For masked geometry (era territory / merger group / UK constituent) it strokes only the political borders
    (`'0'` inter-group + `'2'` sub-country) and **skips `'1'` (the entity's own coast) and `'3'` (hidden)**; the coast is then
    added from the **present-day `coastEdges()` clipped to the region** (`strokeCoastClipped`, bbox-filtered) so the gold coast
    sits on the *drawn* coastline, never the era geometry's offset shore. The double-click **drill** (`subSelGeo`, an unmasked
    present-day country inside a merger era) skips any edge in `hiddenEdgeSet()` — the era's `'3'` edges — so it never draws a
    border the map omits (e.g. the S. Sudan split line pre-2011). This fixed the old artifacts: gold coast fragments around the
    southern USSR's inland seas (Caspian/Aral/Balkhash `'1'` edges) and present-day borders showing on older maps.
  - **Soviet republics on the geo eras** (`drawSovietRepublics`): the source's 1920/1938 USSR is a single polygon with **no
    internal republic borders**. To show its union republics (as the merger eras 1960+ already do via `synthGroups`, and the UK
    shows its constituents), the present-day **post-Soviet internal borders** (edges shared between two of the 15 successor
    states, `SOVIET` set) are overlaid **clipped to the era's USSR extent**, light like a `'2'` sub-border — an accurate proxy
    for the union-republic boundaries (the Central-Asian/Caucasus borders were settled by 1936). Clipping to the era polygon
    keeps e.g. the still-independent 1938 Baltics out. Drawn on the map in `renderStatic` next to `drawUKConstituents`.

## Generating cards & glossary entries

**Content style rules (all card fields + glossary descriptions, current AND future):**
- **Non-round numbers above 20 are numerals** ("27 chapters", never "twenty-seven chapters"). Round numbers may
  stay as words ("thirty kings", "eight hundred years"). Proper names keep their words (*Twenty-Four Histories*,
  *Twenty-four Filial Exemplars*).
- **Centuries and millennia are always numbered** ("11th century", "2nd millennium BCE" — never "eleventh century"),
  whatever the ordinal.
- **Literature titles are italicised** (`<i>Bamboo Annals</i>`) — except in plain-text fields (`answerText`) and in
  glossary alias/title keys, which must stay unstyled or matching breaks. Person-vs-book names (Zhuangzi, Mencius,
  Laozi…) are italicised only when clearly the text — "the <i>Zhuangzi</i>" — never the person.
- Enforcement: `node .claude/check-style.js` reports violations; `--fix` applies the safe ones (it masks the proper-name
  exceptions, skips plain-text fields and the glossary alias sections). Run it after bulk content additions. **Card text
  edits invalidate baked narration hashes — re-run `build-tts.js` for all four narrators after a style pass.**

The deck and glossary are being regrown one entry at a time, each researched from **Wikipedia and
academic sources** — accuracy is non-negotiable, never invent dates, names, or definitions. The kept
template entries are the canonical format: card `cnh-001` in `data.js`, glossary term `Sima_Qian` in
`glossary.js`. The full pre-trim originals are backed up in `.claude/backup/`.

**Add a card** — build a card object with all 13 fields, write it to a temp `.json` file, then run:

```
node .claude/add-card.js <card.json> [deckId]
```

It appends the card to `window.CARD_DATA`, registers the id in a leaf deck's `cardIds` (defaults to
the first leaf deck), keeps the collection `total` ≥ card count, and re-parses to confirm valid JS.
This stays cheap as `data.js` grows (it never re-Edits the whole file). Content rules:

- `question` — an HTML clue whose answer is the term, with the term itself blanked as
  `<span class="blank">_____</span>`; use `<i>…</i>` for work titles. **Place the blank in the MIDDLE
  of the sentence, never at the end** — the clue must keep going after the blank, not stop on it
  (write "The `___` is the god of the east…", not "…the god of the east is `___`.").
- Chinese fields (`hanzi, pinyin, traditional, translations`) — fill only if the term has a Chinese
  form, else `""`. `translations` wraps the pinyin: `<div class="tr-pinline"><span class="tr-pin">…</span></div>`.
- `answerDate` — a `<div class="dt"><span class="dt-k">Date</span><span class="dt-v">…</span></div>`
  block (key date / reign / era, or an etymology line).
- `abstract` (the background) — **exactly 10 sentences**, as two blocks of 5 split by ` <br><br> `:
  sentences 1–5 give the general meaning/context, 6–10 the meaning in this card's question.
  Information-heavy and precise. **The only `<b>` bold is the answer term, at its first mention
  opening the background**; use `<i>` for titles (and foreign terms). **No parenthetical asides** —
  never put information between parentheses. **No glossary links** — plain text only (`cnh-001`
  still uses the old `ttip`/`data-k` links and bolded facts; new cards omit both).
- `answerText` — the answer as plain text, no HTML.

**Add a glossary term** — write `{ "slug": "Wikipedia_Article_Slug", "description": "<3 sentences>",
"date": "<optional>", "tags": ["<kind>", "<subject>", "<specific>"] }` to a temp `.json` file, then run:

```
node .claude/add-glossary.js <entry.json>
```

The key is the Wikipedia article slug (spaces → underscores, keep diacritics, e.g. `Nüwa`). The
description is **exactly three sentences**, and must stay **impartial and deck-agnostic** — a gloss
popup is shared across every deck, so define the term on its own terms the way a neutral encyclopedia
would, never within the context of a particular deck, card, or example. A term that is not *inherently*
Chinese (a general concept like *culture hero*, *creation myth*, or *dynasty*, or a comparative one
like *Ymir* or *Tiamat*) must **not** use China — or any single culture — as its framing or example;
only terms that are themselves Chinese should mention China. This holds **even for things invented or
chiefly developed in one place**: a general term gets a general description, never a portrait of its
local instance — an *abacus* is a bead-frame calculator used in many cultures (not "the Chinese
suanpan"); *gunpowder* is an explosive mixture of saltpetre, charcoal, and sulfur (not "invented in
China"); a *compass*, *crossbow*, or *water clock* is defined by what it is, with no country, dynasty,
or inventor attached. Only terms that are themselves inherently tied to one culture — a proper noun or
a named tradition/practice (e.g. *acupuncture*, *Dujiangyan*) — may reference it. The description must also be
**self-contained / not "aware" of other glossary entries**: describe the term on its own, never
defining or positioning it by comparison or contrast with a sibling gloss item — no *"the opposite of
X"*, *"in contrast to / as opposed to / unlike X"*, *"distinct from X"*, *"should not be confused with
X"*, *"together with X it forms Y"*, *"superseded by / grew out of X"*, or *"the counterpart of X"*.
Stating an intrinsic fact that merely names a related entity (a figure's parent, consort, or author;
a work it is part of; the members of a group) is fine — it is *comparative or contrastive framing*
that is banned, not every mention. Include `date` only when relevant (a
lifespan, dynasty, or dated event), e.g. `"c. 145–86 BCE"` or `"1644–1912"` — it lands in
`window.GLOSSARY_DATES`.

**Every term carries `"tags"` — at least 3 lowercase category tags** (lands in `window.GLOSSARY_TAGS`;
the helper refuses a new term without them). They drive the tag filter in the admin glossary's left bar
and are shown as the list's second column and in the "Link term" picker. **Reuse the established
vocabulary** (check `window.GLOSSARY_TAGS` for tags already in use) rather than coining near-synonyms:
tag 1 = the kind (`person`, `ruler`, `deity`, `creature`, `place`, `mountain`, `river`, `city`, `state`,
`dynasty`, `era`, `event`, `battle`, `text`, `festival`, `food`, `plant`, `animal`, `object`, `concept`,
`practice`, `title`, `institution`, `school of thought`, `symbol`, `constellation`, `unit`, …), then
subject areas (`mythology`, `religion`, `philosophy`, `history`, `geography`, `astronomy`, `literature`,
`warfare`, …), then specifics that apply (a dynasty/period like `han dynasty`; a school like `taoism`,
`buddhism`, `confucianism`; a non-Chinese culture like `japan`, `greece` — there is deliberately **no
`china` tag**, China being the default context). Tags are also editable per-term on the admin glossary
page.

Optional `"aliases": ["alt spelling", …]` lists extra background spellings that should open the same
popup (lands in `window.GLOSSARY_ALIASES`); **plural forms link automatically**, so only add aliases
for forms the auto-pluralizer misses. Aliases are also editable per-term on the admin glossary page.
To remove a term, run the helper on `{ "slug": "Some_Slug", "delete": true }`.

When the user pastes one of the generation prompts and then sends bare terms one per message, treat
each as "research it and add it via the helper script," then reload to confirm no console errors.

## Generating timeline eras (historical globe maps)

The Atlas globe has a timeline (1000 BCE → present). The present year always shows the present-day map
(`world.js`); past years can show a **historical border era** — a snapshot of the world's political
borders, built from **curated historical GeoJSON** (the primary path) or traced from a map image (a
fallback). **A past era keeps the present-day land, coastline, lakes, rivers and mountains** (from
`world.js`/`lakes.js`/`rivers.js`/`ranges.js`/`forests.js`, at full resolution and exact position) and
changes **only the political borders on land**. Each era territory carries a per-ring `c` bitmask (built by
`build-era.js`) marking which edges are *coastal* (along the present-day coast) vs *interior*; the render
strokes **only the interior land borders** and draws the coast from the exact present-day coastline
(`coastEdges()` — the GEO edges not shared between two countries), so the era's own (lower-res, off-source)
coastline never shows and coasts look identical to the modern map. **`build-era.js` is topology-preserving**:
it quantizes every vertex to a shared grid so a border shared by two countries stays *bit-identical* in both
rings (drawn twice it overlaps exactly instead of doubling), classifies each edge interior-vs-coast
*topologically* (interior ⇔ its reverse edge exists in another territory), with a **`landAcross` fallback** for
NON-tiling sources: an unshared edge is still a LAND border (not coast) if another territory lies ~0.06° across it
(probe both sides of the midpoint) — this recovers borders where the source's polygons don't share exact edges.
It thins with a local cyclic collinear test that keeps junctions so shared edges stay matched. (The old
per-ring Douglas–Peucker diverged shared borders → "double border" + stray artifacts; do not reintroduce it.)
**Region SUPPLEMENT** (`SUPPLEMENT` map): some snapshots are sparsely *digitized* in a region (gaps, not real history).
`world_1900` maps Africa only ~20% (huge gaps → a blank continent); the Scramble for Africa was settled by 1900, so the
1900 era fills the African continent (a Red-Sea-aware bbox) from the complete `world_1914` snapshot, keeping 1900
everywhere else (incl. the pre-Balkan-Wars Balkans, which 1914 gets wrong). Result: 1900 Africa went 276 → 2268 interior edges.
**It also cleans the source first** (`removeOverlaps`): some historical-basemaps snapshots ship STALE / ANACHRONISTIC /
DUPLICATE features that *overlap* the correct territories (e.g. `world_1938` layers "Israel", leftover "Hejaz"/"Hail"/
"Emirate of Bin Shal'an", and duplicate "Qatar"/"Yemen"/"Trucial Oman" on top of Saudi Arabia + Mandatory Palestine,
plus ~79 unnamed blobs) — overlapping polygons render as **double borders + desert strays**. `removeOverlaps` drops
unnamed features, then greedily drops whichever remaining feature is ≥60% contained inside a *single* other feature
(the spurious overlapper — a real base territory is never mostly inside one neighbour; valid enclaves like Lesotho with
a proper hole are kept), keeping one of any duplicate pair. 1938 went from 18 overlaps → 4 (the residual are tiny
sub-threshold Caribbean specks). This is why **no cleaner external source was adopted** — CShapes isn't topology-clean,
OHM is too sparse; the artifacts were source data-quality errors, fixable in place.
**It also WELDS coast-junctions to the present-day coastline** (step 4.6): a geo era draws only its interior borders and
lets `world.js` draw the coast (`coastEdges`), so where an interior border meets the sea it used to terminate at the era's
OWN (offset/historical) shore — leaving the border end floating off the drawn present-day coast ("stray lines that don't
connect"). The build snaps each junction vertex (where a drawn '0' edge meets a skipped '1' coast edge on a ring) onto the
nearest present-day coast vertex within EPS=0.6° (shared junctions snap by quantized key so both neighbours move
identically → the shared interior edge stays bit-identical; no doubles — coast edges stay skipped, only junctions move).
This fixed the bulk (e.g. 1900 went from 58 visible coastal floats to ~2; 1938 to 2). **Residual far-floats (>0.6° from any
present coast) are LEFT as-is** — they're genuinely hard cases with no clean target: borders through lakes (Superior, Malawi),
a sea that became land (the dried **Aral**, where the 1900 border meets a shore that no longer exists), and large 1900-vs-today
coastline divergence in colonial Africa. Don't widen EPS much — a 1°+ snap can yank a border onto the WRONG coast (worse than a float).

**Each era uses ONE geometry source — never a mix** (mixing world.js + the era source for the same border drew two
slightly-offset lines = "double borders"; do not reintroduce a render-time overlay that draws both). `build-era.js`
classifies each snapshot: a **merger-only** era (differs from today *only* by merged/split countries, not moved
borders — a sampling consistency check ≥97%; e.g. 2000/2010 ≈ 98.9%) is stored as just `groups`
{ presentCountryName: groupName } (groupName = the present-day name for an unchanged country so its popup name +
description resolve, the era-territory name only for a genuine multi-country merger) with **no geometry**, and the renderer reuses `world.js`'s own high-res
geometry — so unchanged borders are pixel-identical to the present-day map. An era with genuinely **moved** borders
(e.g. 1900 ≈ 88.1%) keeps its own topology-preserving `geo` (source resolution, ~46k verts — a source limit, not a
bug). At render time `histTerr()` returns, for a groups era, `synthGroups(era)` (cached by era.id): it groups the
GEO countries by `groups[name]` and per ring edge writes a 3-state mask — **'0' inter-group** border (reverse owned via
`worldEdgeOwners()` by a country in a **different** group → drawn bold at full res), **'2' intra-group** border (reverse
owned by a country in the **same** group → a **sub-country** border, e.g. a Soviet republic inside the USSR), **'1' coast**
(no neighbour → skipped, `coastEdges()` draws it). The renderer draws '0' bold and **'2' light** (`globalAlpha 0.5`,
`lineWidth ≈ bw*0.62`) so a merged unit still reads as one while showing its constituents; geo eras (no '2') are unchanged,
and editor-drawn territories (no mask) stroke their full outline. **An intra-group '2' edge is downgraded to '1' (skipped)
when either side is an entity that did not exist yet in the era's year** (`ENTITY_SINCE` table: Baikonur 1994, S. Sudan 2011,
Kosovo 2008, Timor-Leste 2002, Eritrea 1993, N. Cyprus 1983; disputed/military zones = `1e4` = never) — so e.g. Baikonur's
border is hidden before its 1994 lease, and S. Sudan's split line before 2011 (the *external* Sudan border still draws as '0').
E.g. 2010 Sudan = Sudan+South Sudan in one group → their shared edge is skipped (S. Sudan didn't exist until 2011). countryAt / paintFill / the click popup all read `histTerr()` and hit-test
the whole group territory (so single-click selects the union, double-click drills to the sub-country — see the Atlas popup section). Editing a groups era
(`enterMapEdit`) **materializes** it to deep-copied `geo` first, so it becomes a normal hand-editable era.
A past era's **territories are
clickable/selectable** exactly like present-day countries (hover/select hit-tests the era geometry via
`histTerr()`). Every legend layer now shows at **ALL zoom levels** (`updateLegendVisibility` no longer applies a per-layer
min-zoom gate); the only remaining legend gate is that cities, capitals and country names are
present-day-only and are **hidden from the legend** on past eras (only Borders + the physical layers show there). The **"Divisions"
(admin-1 borders, `drawAdmin`) and "Division capitals" legend layers were removed** — like Mountains, their toggle + `wire()` are
gone, `adminOn`/`divCapsOn` default `false` with no way to enable them, so `drawAdmin` + the division-capital city tier are inert
dead code (never rendered).

- **Data:** `window.TIMELINE = [ { id, year, n:label, EITHER groups:{presentCountryName:eraTerritoryName} OR geo:[ { n, p:[rings], c:[coastal-bitmask/ring] } ], cities:[ { n, lon, lat, cap } ] } ]`
  in `timeline.js`. A **merger-only** era carries `groups` (tiny — geometry comes from `world.js`); others carry
  `geo` territories — `world.js`-shaped polygons (even-odd rings) with `c` marking coastal
  edges (so only interior borders stroke). `cities` are the era's own capitals/cities (`cap:true` = a capital),
  drawn at that era's year by `drawEraCities`, which calls the **same `drawPin`** as the present-day map so the dots
  look identical (vermilion `CITY_DOT` + white ring, radius `cityDot(tier)`); labels show once zoomed past `CAP_Z`, **sized
  exactly like the present-day map** (`clamp(10+(zoom−2)·1.1, 10, 13.5)`, weight 600 — `ctx.font` MUST include a px size,
  not just the family, or the browser ignores it and the labels render tiny). **Every shipped
  era now carries COMPREHENSIVE period-accurate capitals** (~157–232 each, ~1422 total — every sovereign state + colony)
  researched + adversarially fact-checked
  with PERIOD names and capital relocations correct for the year (St. Petersburg→Moscow in 1918, Constantinople→Ankara
  in 1923, Calcutta→Delhi→New Delhi, Kristiania→Oslo, Urga→Ulan Bator, Karachi→Islamabad, Almaty→Astana,
  Rangoon→Yangon→Naypyidaw, Lagos→Abuja, Rio→Brasília). Added by `.claude/add-era-cities.js <capitals.json>`
  (matches eras by year, sets `cities`, keeps any non-capital cities, re-parses to confirm valid JS). An era applies from its `year` until the next era's (a step function). The timeline only **stops on
  map-years** — each era's `year` plus the present (the years that actually have a map): dragging/clicking the
  rail snaps to the nearest map-year, and the chevrons / arrow keys step between adjacent map-years, so blank
  years are skipped entirely (`mapYears` / `snapYear` / `stepYear`). Small rail ticks (`.tl-mark`, drawn by
  `renderMapYearMarks`) mark the stops; the "no map yet" note is therefore effectively unreachable now.
  Shipped eras: **1900, 1920, 1938, 1960, 1994, 2000, 2010, 2015, 2020** (+ the present-day map) — roughly every other
  decade of the 20th c. (1900-era snapshots are sparse: 1900/1914/1920/1930/1938/1945/1960 then a gap to 1994, so "1940"→1938
  and "1980"→1994 land on the nearest snapshot, stored at the snapshot's real year). 1900/1920/1938 are `geo` (their
  borders genuinely differ from today); 1960/1994/2000/2010 are merger-only `groups` (rendered from world.js — e.g.
  1960 correctly merges the 15 post-Soviet states into one "USSR"). The dataset's latest snapshot is **2010**, so there is
  **no distinct 2015/2020 source**: those two eras carry **empty `groups: {}`** (which `synthGroups` renders as the full
  present-day `world.js` map — South Sudan correctly separate since 2011) plus 2010's period capitals + Juba, so they're
  accurate present-day-border stops filling the 2010→present gap. 2021–present is the present-day map (the present stop).
- **Primary method — `node .claude/build-era.js <year> [label]`** (recommended; **use this when the user
  wants a year**): fetches accurate world borders for the nearest available snapshot from the
  *historical-basemaps* GeoJSON dataset (https://github.com/aourednik/historical-basemaps, CC-BY-SA 4.0;
  ~53 snapshots 123000 BCE → 2010, incl. 1900/1914/1920/1938/1945/…), topology-preservingly simplifies (see
  above — grid-quantize + topological interior/coast classification, NOT per-ring Douglas–Peucker), and
  writes `timeline.js`. Already accurate lon/lat — no tracing, no projection guessing. Re-running a
  snapshot replaces it; eras carry `src:"historical-basemaps"`. (Needs a build-time network fetch.)
  Era rings are stored **closed** (first vertex == last) so the per-ring `c` mask and the globe's
  `i+1 < ring.length` border stroke both cover every edge *including* the closing one — don't reintroduce
  open rings (a missing closing edge leaves 1-segment gaps in landlocked outlines). **Gotcha:** if an era
  was ever opened in the in-app editor, a copy is persisted to `localStorage` `ADMIN_EDITS.timeline` and
  **shadows the rebuilt `timeline.js` at startup** — clear that overlay key (or re-import the era in the
  editor) to see a fresh `build-era.js` run.
- **The in-app editor — Edit → Timeline → "Open globe editor"** (sets `atlasEditEraId`; the Atlas enters
  edit mode for that era). Enter a year (existing or new) and edit on the globe via a toolbar
  (`#mapEditBar`). Tools: **Select** (tap a territory/place to select; **drag a vertex** to reshape; drag a
  place to move; **Delete** the selected territory/place), **Draw** (tap to drop vertices → **Finish
  polygon** → name it), **City** / **Capital** (tap to place + name). Edits mutate the era in
  `window.TIMELINE`, bump `mapEditRev` (invalidates the render cache via `viewKey`) and persist to the
  overlay; **Done** returns to the editor. Drawn territories carry no `c` mask, so their full outline is
  stroked. (The old PNG image-tracer was removed; `traceMapToGeo` remains in `app.js` but is unused. Not
  yet in the editor: inserting/deleting individual vertices — move existing ones or redraw.)
- **Seeding accurate borders:** `build-era.js` (above) imports real historical borders for a year; open the
  result in the globe editor to clean it up, reshape, or add capitals/cities.
- In-app eras live in `ADMIN_EDITS.timeline` until **Save to project** writes `timeline.js`. Verify on the
  globe at the era's year (no console errors).

## Testing

- Fastest check: open `index.html` in a browser and watch the console for errors. The app uses
  `localStorage`, which works from `file://` in Chrome.
- After editing JS, run `node --check app.js` to catch syntax errors before reloading.
- For automated checks, Playwright + headless Chromium works well (navigate via `location.hash`,
  screenshot pages, assert zero console errors). Loading `data.js` / `glossary.js` / `world.js`
  under Node requires setting `global.window = {}` first.
- Put any Unicode (Chinese text) used in a test script into a file — don't pass it inline via
  `node -e`.

## Environment

- Developed on Windows. Use forward-slash relative paths inside the site.
- The project is a **Git repo** (initialized Jul 2026) so any change can be reviewed and rolled back — commit meaningful
  changes as you go.
- **Online accounts + sync (Supabase)** — LIVE in app.js (the `/* Supabase */` module after the legacy accounts block).
  Static hosting on Cloudflare Pages fed by GitHub pushes (`git push` = deploy; content files like `data.js` ship with deploys).
  Schema + RLS: `.claude/supabase-schema.sql` (applied; tables `profiles` / `progress` / `friends`; signup trigger creates the
  profile + empty progress row). Plain `fetch()` (no SDK — zero-dependency rule); the publishable key in app.js is safe to ship
  (security = RLS). **Offline-first**: localStorage stays the working copy; `save()` → `supaQueuePush()` (6s debounce, skips
  no-ops) PATCHes the whole `PROGRESS_FIELDS` blob into `progress.data`; boot (`supaBoot`) refreshes the session, pulls, and
  reconciles — server wins when its `updated_at` ≠ the device's `S._supaTs` baseline (another device wrote), else local pushes.
  Sign-in adopts server progress (or MIGRATES local progress up if the server row is empty); the pre-sign-in device state is
  stashed (`folio_supa_guest_v1`) and restored on sign-out. Auth = email+password (`/auth/v1/*`); emailed links (confirm/reset)
  land with tokens in the URL hash → `supaBoot` adopts them (requires the Supabase **Site URL** to point at the deployed app).
  The account page (auth/self/friends views) is fully server-backed; friends use the `friends` table (request → accept, RLS lets
  accepted friends read each other's `progress` for the badges view). **Admin gating** (`adminEligible()` / `isAdmin()`): a
  signed-in user is admin-eligible iff `profiles.role === 'admin'` (set via the dashboard Table Editor); a signed-in non-admin is
  NEVER eligible; a signed-out guest is eligible only on a **dev origin** (`isDevOrigin()`: `file://` or
  localhost/127./10./192.168.) with no legacy local accounts — so the dev machine keeps its editor, while first-time visitors and
  non-admin accounts on the live site see no Edit tab or Editor/Visitor switch (`applyMode` shows the switch only when
  `adminEligible()`). `isAdmin()` additionally honours the Editor/Visitor toggle (`S.settings.adminMode === false` → visitor view).
  The old local accounts (`folio_acct_v1`) remain only as legacy code (admin page user-manager + guest stash helpers).
- **Live content editing (cloud overrides)** — the `/* cloud content overrides */` module in app.js + the `content_overrides`
  table (single row `id=1`, in `.claude/supabase-schema.sql`; **the user must run the SQL once** — until then every fetch 404s and
  the module degrades silently). The row's `data` holds an admin-edit overlay in the exact `folio_admin_v1` delta format. Every
  visitor (anonymous included, RLS select = public) runs `cloudBootOverrides()` after `supaBoot`: if the row's `updated_at` differs
  from the device's baseline (`localStorage["folio_cloud_ts_v1"]`), the overlay is adopted via `reapplyAdminOverlay(row.data)` +
  persisted, so live-site edits reach all visitors within seconds of their next load. A **signed-in admin** publishes automatically:
  `writeAdminEdits()` (the single overlay write choke-point) calls `cloudQueuePush()` (4s debounce, skips no-ops) which PATCHes
  `ADMIN_EDITS` into the row (RLS update = admins only). **Dev-origin guests neither publish nor adopt** (`cloudBootOverrides`
  returns early when `!supaLoggedIn() && isDevOrigin()`) — the dev machine's in-flight local overlay is never clobbered, and its
  content ships via git/deploy instead. **Hygiene:** after baking the overlay into `data.js`/`glossary.js`/`timeline.js` and
  deploying, reset `content_overrides.data` to `{}` (Table Editor) so a stale cloud overlay can't shadow the newer shipped files.
