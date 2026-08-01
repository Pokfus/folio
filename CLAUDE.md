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
  Zhou deck"). **One line per kind of change per day** — if the day already has a "N new cards" or "N more
  glossary terms" line, RAISE ITS COUNT and fold in the new subject rather than adding a second line; several
  days once carried the same kind of entry two to seven times over. The same holds for **"now in your language"
  lines**: a day gets ONE localisation line per area (the daily games, the Atlas, the site chrome), extended as
  more of that area lands — 2026-07-27/28 once carried eight and five of them, each announcing another corner of
  the same rollout. The Mission page renders it.
  **Keep an item SHORT — a summary, not a transcript.** Two entries once ran to 12,000 and 15,000 characters
  because a citation batch listed every correction it made; they were compressed on request (2026-08-01) into
  one line a day saying what changed and what KIND of corrections came out of it. The counts and the finding
  belong here; the per-card detail belongs in the batch log in `docs/`. Anything past ~1,000 characters is a
  transcript, and it costs nine translations of the same length.
  **A new line ships with its nine translations.** The whole changelog (27 day titles + 196 items) is live in
  es/fr/de/it/nl/ru/ar/zh/ja as `chrome.exact` rows in `i18n/ui-<lang>.js` — the items are plain text nodes, so
  `localizeTree` picks them up with no code. They must NOT go inline into `changelog.js`, which is in the eager
  load path (the `quotes.js` mistake: 27 KB → 312 KB for every visitor). Add them with `.claude/add-lang.js`
  chrome batches. **If you reword or merge an existing line, retire the old translations** in the same pass via
  the `chrome.remove` list, or nine files keep a dead row that matches nothing and reads like coverage.
  The changelog **dates follow the site language** (`fmtDay` → `dayLocale()`, en-GB for English), not the
  browser's.

## File map

**Only the study-critical files load eagerly** (~1.4 MB), in this order — it is significant:
`data.js → truefalse.js → quotes.js → changelog.js → mission.js → glossary.js → glossary-wikipedia.js → app.js`.

**Everything else is LAZY**, injected on demand by `DATA_BUNDLES` / `ensureData(name)` in app.js (see the
"Lazy data bundles" bullet under "How the app is wired"). Before this split every visitor downloaded ~11.3 MB
of blocking JS to flip a card; the Atlas layers and the translation tables are ~9.9 MB of that.

| bundle | files | loaded when |
|---|---|---|
| `world` | `world.js` | the Atlas mounts; the home page's mini globe (at idle); the Settings home picker |
| `atlas` | `uk` `lakes` `rivers` `water` `cities` `timeline` `countries` `country-stats` `country-spans` `country-years` `country-sources` | the Atlas mounts |
| `uiI18n:<lang>` | `i18n/ui-<lang>.js` | the site language isn't English |
| `glossI18n:<lang>` | `i18n/gloss-<lang>.js` | ditto |
| `gamesI18n:<lang>` | `i18n/games-<lang>.js` | ditto (the True-or-False / Who-said-it pools) |
| `placeI18n:<lang>` | `i18n/places-<lang>.js` | ditto (country / territory / capital names on the globe) |

(`heightmap.js` + `heightmap-ultra.js` are lazy too, but on their own older path — `loadHeightmapLevel`, keyed off
the Heightmap legend toggle / zoom, not `DATA_BUNDLES`.
`ranges.js` + `admin1.js` — the removed Mountains / Divisions layers — are **never loaded**; app.js reads
`window.RANGES`/`window.ADMIN1` with empty-fallbacks, so the files stay on disk for a future revival.)

- `index.html` — app shell. `<main class="stage"><div id="view"></div></main>`. Also the static
  `<title>`/description/OG baseline (link-preview crawlers don't run JS) and the `<link rel="manifest">`.
- `styles.css` (~235 KB) — editorial design system; 8 themes via CSS custom properties.
  **All theme color variables are hex** (e.g. `--ink:#1B1A17`) so the canvas globe can parse and
  blend them — keep them hex, not `rgb()`/`hsl()`.
- `app.js` (~684 KB) — all logic, written as a single IIFE. Hash-based routing via the `PAGES`
  map. No ES modules.
- `manifest.json` + `icon.svg` + `icon-maskable.svg` + `sw.js` — the PWA. See the "PWA" bullet below.
- `_headers` — Cloudflare Pages response headers: the **Content-Security-Policy** (plus nosniff /
  Referrer-Policy / Permissions-Policy). Verified against every route with 0 violations. `script-src 'self'`
  holds only because index.html has **no inline `<script>`** and app.js uses neither `eval` nor `new Function`
  — adding either would need the policy weakened, so don't. `style-src` needs `'unsafe-inline'` (app.js sets
  inline style attributes everywhere) and `fonts.googleapis.com` (styles.css `@import`s it); `img-src` needs
  `data:` (heightmap PNGs, avatars) and `blob:` (the avatar upload preview); **`media-src` allows `https:`**
  (linked card/glossary videos) and **`frame-src` allows exactly `youtube-nocookie.com` + `player.vimeo.com`**
  — nothing else may ever be framed. Headers only apply over HTTP, so
  opening index.html from `file://` is unaffected. If it ever breaks the live site, rename the header to
  `Content-Security-Policy-Report-Only` — violations keep showing in devtools without blocking anything.
- `docs/citation-plan.md` — the batch plan for **citing the 109 prehistory cards** (the bar a source must
  clear, the per-card workflow, how translations are staged, and the batches with their source spines).
  Not part of the site. **The bar is at least 5 citations per card** (`SRC_TARGET` in app.js; raised from
  2–4 on 2026-07-31) — **all 109 are there, with nothing blocked and nothing left to find**; batches 0–26 are complete.
  Coverage is reported by `add-sources.js` on every run and in full by `node .claude/source-audit.js`. Its **Pilot log** records
  that batch 0 was attempted and stopped: this sandbox's egress policy blocks every scholarly host, so no
  source could be opened and none was cited. `.claude/sources-register.md` holds the verified citations
  (and, separately and clearly marked, unverified search-only candidates that must never be pasted in).
- `docs/glossary-citation-plan.md` — the batch plan for **citing the 333 glossary terms**, the sibling of
  the card plan above. The bar is **at least 2 citations per term** (a description is three sentences, where
  a card's abstract is ten), and the acceptable sources are academic, museum, government or reputable
  NGO/IGO. **Batches G1–G3 have shipped — 23 of the 333 terms are cited and at the bar.** Three things about this pass that
  the card pass does not have: **markers are optional** on a term, so the default batch changes no prose and
  therefore needs no translation work; a term whose prose IS corrected needs a second command in the same
  batch (`add-lang.js` for the nine languages, since `add-sources.js` writes only the English description);
  and Phase 1 is largely paid for out of `.claude/sources-register.md` already. It also records which
  scholarly and official hosts were **reachable from this sandbox on 2026-08-01**, measured rather than
  assumed. **Batch G0 (tooling) has shipped**: `GLOSS_SRC_TARGET = 2` sits beside `SRC_TARGET` in app.js and
  is sliced out of it by text by `.claude/gloss-source-audit.js` (the mirror of `source-audit.js`, plus a
  `--tag=` filter and two checks a two-source list makes easy to fail — not-majority-open, and a citation
  with no access label) and by `add-sources.js`, which now warns a short term and reports glossary coverage
  against the bar. The **admin glossary list carries a coverage chip** like the card list, in two states
  rather than three (no `sourcesBlocked` on a term) and never on a deck term. Not part of the site.
- `docs/user-decks-plan.md` — the design plan for **community decks** (user-created decks, sharing,
  ratings, an optional per-deck glossary, and a later paid tier). Phases 0–1 have shipped; see the bullet
  in "How the app is wired". Not part of the site.
- `data.js` — `window.CARD_DATA` and `window.COLLECTION_TREE`. **Currently 105 cards** (wh-001…wh-105), **each carrying its full pool of 3 question phrasings** (`question` + 2 `questions` extras) in EN + all 9 languages, all in the
  `wh-prehistory` deck under World History (regrown from the `cnh-001` template, which remains the canonical
  format); the deck is grown one card at a time (see "Generating cards & glossary entries" below).
- `glossary.js` — `window.GLOSSARY` plus `window.GLOSSARY_DATES`, `GLOSSARY_TITLES`, `GLOSSARY_ALIASES`,
  `GLOSSARY_CASESENSITIVE`, `GLOSSARY_TAGS` (per-term category tags — the admin glossary's left-bar
  filter), `GLOSSARY_IMAGES` (per-term illustration — see the "Glossary image" bullet below) and
  `GLOSSARY_SOURCES` (per-term citations — see the "Source footnotes" bullet).
  Trimmed to the single `Sima_Qian` template entry on 2026-07-23 and **regrown since to 333 terms**
  (every country in the world, plus prehistory/paleoanthropology vocabulary), one fully-formed entry at a time
  (description + date + tags + all 9 translations); the full pre-trim glossary (2,165 terms) and its partial
  translations are backed up in `.claude/backup/`.
- `glossary-wikipedia.js` — `Object.assign`s extra summaries onto `window.GLOSSARY` (loads *after*
  `glossary.js`). **Currently an empty stub.**
- `i18n/gloss-<lang>.js` — glossary descriptions translated into that one language (slug → text); written by
  `.claude/add-glossary.js` from the entry JSON's `translations` field, or backfilled a language at a time by
  `.claude/add-lang.js` (both go through `.claude/gloss-i18n-io.js`). A file **pushes onto
  `window.GLOSSARY_I18N_IN`** rather than writing the live table: the bundle's `after` hook (`glossI18nIngest`)
  drains that queue into the shipped baseline `PRISTINE_GLOSS_I18N` and then layers the admin overlay on top,
  producing `window.GLOSSARY_I18N[slug][lang]` — which is what `glossText()` reads. **Admin-editable**: with the
  site language switched to a non-EN language, the glossary editor edits that language's translation
  (`glossaryI18n` overlay deltas; baked back into this file by `serializeGlossaryI18n`).
- `i18n/ui-<lang>.js` — the site-chrome translation tables for one language (`window.I18N` exact strings /
  `I18N_RULES` regex patterns / `I18N_HTML` whole prose blocks, keyed by English source text) consumed by
  app.js's localisation engine. **Lazy** (bundle `uiI18n:<lang>`) — an English reader never fetches any of
  them. See the "Language switcher + i18n" bullet below.
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
- `i18n/places-<lang>.js` — place names translated into one language (English name → local name): the
  countries in `world.js` plus the era territories and era capitals in `timeline.js`, **1,744 distinct names**.
  **Lazy** (bundle `placeI18n:<lang>`); the `after` hook `placeI18nIngest` drains `window.PLACE_I18N_IN` into
  `window.PLACE_I18N[englishName][lang]`, which **`placeName(n)`** reads. They live outside `world.js` /
  `timeline.js` because those are multi-megabyte geometry files. **`placeName` is called at CANVAS DRAW TIME**
  (`drawCountryNames`, `drawEraNames`, `drawCities`, `drawEraCities`) as well as in the DOM — the map labels are
  `ctx.fillText`, which the `localizeTree` walker can never reach, so this is the only route to translating them.
  Era names are localised **before** the two-line wrap, or the wrap measures the English. The Settings home
  picker localises only the option LABEL: the `value` stays the English name, since it keys `countryCenter()`
  and is stored in `S.settings.home`. Not routed through the I18N exact table, and for the same reason as
  `nodeTitle` — most of these names are also glossary terms and card answers. A file ships for every language
  so an untranslated one can't 404 on each page load.
  **Coverage — es 609 / fr 555 / de 547 / it 517 / nl 516 / ru 922 / ar 924 / zh 924 / ja 924.** The gap
  between the Latin and non-Latin counts is structural, not a backlog: **a name identical to the English is
  deliberately NOT written** (`placeName` falls back), so `Madrid` needs no Spanish row while every name needs
  a Russian one. Three things stay English on purpose and should not be "finished": the **~750 ethnonyms**
  among the era territories (Wiradjuri, Kwakwaka'wakw, Yukagir) — an endonym keeps its own form in every
  language; the uninhabited **banks, reefs, glaciers and military zones** (Bajo Nuevo Bank, Siachen Glacier);
  and the **obscure historical seats** (Bal Batsinâng, Danamombe, Xieng Dong Xieng Thong). None has an
  established form in Spanish or Japanese, and inventing a transliteration would be fabrication.
- `i18n/games-<lang>.js` — the two daily-game pools translated into one language, keyed by each item's
  **English `q`** (unique in both pools, and stable against reordering in a way an array index is not).
  **Lazy** (bundle `gamesI18n:<lang>`); the `after` hook `gamesI18nIngest` drains `window.GAMES_I18N_IN`
  into `GAMES_I18N[pool][englishQ][lang]`, which `tfLocalized()` / `quoteLocalized()` read. **These must
  NOT go inline into `truefalse.js` / `quotes.js`** — both are in the EAGER load path, and nine languages
  inline took `quotes.js` from 27 KB to 312 KB downloaded by every visitor to flip a card. `PAGES.truefalse`
  and `PAGES.whosaid` hold on a loading line (`gamesI18nPending`) until it lands so they never paint English
  and flip. Both pools are complete in all 9.
- `quotes.js` — `window.QUOTEGAME = [ { q, who, context } ]`, the pool for the **Who said it?** home-page minigame (64 famous,
  well-documented quotations by distinct historical figures; `who` = the speaker, `context` = a 2-sentence explanation shown on
  reveal). **Adversarially fact-checked** for correct attribution (quote misattribution is rampant). The 4 answer options are the
  correct speaker + 3 other `who` names from the pool (all real people → plausible). Loaded before app.js (after `truefalse.js`).
- `changelog.js` — `window.CHANGELOG = [ { d:"YYYY-MM-DD", label?, t, items:[…] } ]`, the day-grouped release notes
  rendered as the **About** page's collapsible changelog (`PAGES.mission`, hash `#mission` — the nav tab is LABELLED
  "About" but the route/hash stay `mission`; section order: intro prose + forgetting-curve SVG → "How to use Folio"
  walkthrough + feature blurbs → FAQ (collapsible `.faq-item`s) → **beta feedback form** → changelog →
  credits/licenses). See the golden rule: append to today's entry on every ship.
- `mission.js` — `window.MISSION = { title, paras:[…] }`, the About-page intro copy (raw HTML; **deliberately
  jargon-free and written at a low reading level — NO glossary auto-linking on this page**, `autoLinkGlossary` is not
  called). **Admins click the title or a paragraph on the page to edit it in place** (Esc cancels, Ctrl+Enter/blur
  saves): edits overlay via `ADMIN_EDITS.mission` (merged at render by `missionMerged()`, so undo/reload need no
  special handling) and bake back into this file through auto-save / "Save to project" / `folioSave.files`
  (`serializeMission`). The walkthrough / FAQ / forgetting-curve SVG are hardcoded in `PAGES.mission`, not in this
  file. **The About page is TTS-free**: no read-aloud button, and `openGlossWin` skips its play button + auto-read
  when `current.name === "mission"`.
- `lakes.js`, `rivers.js`, `water.js`, `ranges.js`, `admin1.js`, `cities.js` — extra
  Natural-Earth layers for the Atlas globe (lakes, rivers, water-body labels, mountain ranges,
  admin-1 borders, city pins); built by the `.claude/build-*.js` dev scripts. (A Forests layer
  was removed; `forests.js`/`build-forests.js` remain on disk but are no longer loaded or rendered.)
  The **Mountains layer was likewise removed** from the globe: its legend toggle + `wire("#rangesToggle",…)` are
  gone and `rangesOn` defaults `false` with no way to enable it, so `drawRanges` is never called. **`ranges.js` and
  `admin1.js` are no longer loaded by `index.html`** (~1.7 MB less per page load; `drawRanges`/`drawAdmin` remain as
  inert dead code over the empty fallbacks) — the files stay on disk for a future heightmap-style lazy revival.
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
- `country-sources.js` — `window.COUNTRY_SOURCES` (*lowercased place name* → `[citations]`, the works behind the
  general description) and `window.COUNTRY_YEAR_SOURCES` (*name* → `{ "<year>": [citations] }`, the works behind that
  map-year's paragraph). The panel merges the two into **one** numbered list, general first, de-duplicated. **Currently
  empty** — the UI and the pipeline ship, the citations do not (see "Source footnotes"). Written by
  `node .claude/add-country-sources.js <batch.json>`, which refuses a place name that is in neither `countries.js` nor
  `country-years.js` (a citation filed under a name the panel never looks up is a citation nobody will ever see).
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
  It also calls **`setPageMeta(current.name)`**, which sets `document.title` and the
  description / `og:` / `twitter:` meta from the **`PAGE_META`** table (route → `[title, description]`,
  run through `t()` so it localises where a translation exists, English otherwise). Add a route → add its
  `PAGE_META` row, or it inherits the home page's title. `index.html` carries the home-page values as the
  static baseline because most link-preview crawlers don't execute JS — **keep the two in step.**
- **Lazy data bundles:** `DATA_BUNDLES` + `ensureData(name)` / `dataReady(name)` / `whenIdle(fn)` (defined
  just above the ROUTER block). See the table in the File map for what's in each bundle. `ensureData`
  resolves `true`/`false` and **never rejects**, so a fire-and-forget caller can't raise an unhandled
  rejection; a failed bundle is retried on the next call. Consumers:
  · **`PAGES.map`** holds a `.data-loading` placard until `world` + `atlas` land, then re-renders (`render()`
    re-invokes the *current* page, so this covers `PAGES.findit` too).
  · **`startMiniGlobe`** (home) fetches `world` at **idle** so a 170px ornament never delays first paint,
    and skips entirely under `navigator.connection.saveData`.
  · **Settings' home-location picker** holds just the current home until `world` arrives, then fills.
  · **`loadLangData`** pulls `uiI18n` + `glossI18n` whenever the language isn't English.
  **A bundle's `after` hook re-establishes what boot would have done had the file been present** — this is
  the part that bites. `timeline.js` assigns `window.TIMELINE` over the empty array `applyAdminEdits()` left
  at boot, so the atlas hook re-applies `ADMIN_EDITS.timeline` on top or **the admin's working era set is
  silently lost**; a gloss language file arrives after `PRISTINE_GLOSS_I18N` was snapshotted empty, so its hook
  (`glossI18nIngest`) re-seeds that baseline (revert/undo compare against it) and re-applies the `glossaryI18n`
  deltas. Because those files are **per language** the hook runs once per language and the baseline accumulates —
  and it drains a QUEUE (`window.GLOSSARY_I18N_IN`), not a single slot, so two languages whose scripts land before
  either hook both get seeded. Any new lazy file whose global is read at boot needs the same treatment.
- **PWA:** `manifest.json` (installable, `icon.svg` + `icon-maskable.svg`) and **`sw.js`**, registered by
  app.js on `load`. **Never registered on a dev origin** (`isDevOrigin()` — same guard, and same reason, as
  the cloud content overrides): a file-watching dev server's live-reload against a caching worker serves
  files you have already fixed. **Test the PWA on the deployed site, not localhost.** Strategy: navigations
  are network-first (a deploy is picked up at once, and the app still opens offline); same-origin
  JS/CSS/JSON/images are stale-while-revalidate, so **content files land one reload late** — the deliberate
  trade for instant loads. Live admin edits are unaffected (they arrive through the Supabase
  `content_overrides` overlay at runtime, not through these files). The multi-MB lazy bundles are **not**
  precached — that would undo the split; they enter the cache when a page actually asks for them, so one
  Atlas visit makes it available offline. Bump `VERSION` in sw.js to invalidate everything.
- **State:** `localStorage["folio_v1"]` holds settings and spaced-repetition scheduling.
- **Admin edits:** `localStorage["folio_admin_v1"]` stores edits as *deltas*, applied at startup
  by mutating the in-memory globals (`CARD_BY_ID`, `window.GLOSSARY`, the collection tree). **The editing language
  IS the site language** (the top-right switcher; there is NO in-editor language picker — it was replaced on request):
  with the site in EN the card editor edits the base fields via `setCardEdit`; any other site language shows ONLY the
  5 translated fields (question, answer, answerDate, abstract, answerText; Arabic gets `dir="rtl"`) editing
  `card.i18n[lang]` via `setCardI18nEdit`, which REPLACES the card's `i18n` with a deep copy (never mutate in place —
  `PRISTINE_CARDS` shares the object) and stores the whole copy as an `i18n` delta (`applyAdminEdits` re-applies it
  via `Object.assign`; `serializeCardData` bakes `c.i18n` as-is; `revertCard` restores `p.i18n`). **The glossary
  editor follows the same rule**: non-EN site language edits that language's description translation
  (`setGlossI18nEdit` → a **per-(slug, language)** `glossaryI18n` delta **LAYERED** over the shipped text by
  `glossI18nMerged`/`glossI18nApply` — `null` is a cleared translation, and typing the shipped text back clears the
  delta. It must stay per-language rather than a whole lang-map: the gloss files are lazy and per-language, so a
  whole-map delta would hold only the languages loaded when the admin typed and would wipe the rest on the next
  load. Baked to `i18n/gloss-<lang>.js` by `serializeGlossaryI18n(lang)`, one file per edited language and **only
  for languages whose file is loaded** (`editedGlossI18nLangs`) — writing an unloaded one would truncate the shipped
  file to just the edited slugs — via auto-save / Save to project / `folioSave.files`;
  `PRISTINE_GLOSS_I18N` + `revertGloss` cover undo/revert); title/dates/aliases/tags stay EN-view-only. The editor
  previews render in the editing language. Gloss auto-linking stays EN-only. The language switcher's own handler
  already calls `render()`, so the editor re-renders in the new language on switch.
- **Card editor = single live card** (`.card-edit-single` in `adminRenderEditor`): no fields/preview split — ONE
  card-styled surface (`.admin-live-card`) whose question / answer / answerDate / abstract are `.ces-field`
  contenteditables, **double-click to edit in place** (blur locks again; every keystroke saves). Above it: the
  formatting ribbon + a meta row (id, chronology, plain `answerText`) + a collapsible "Appears in N decks" picker.
  Below: a collapsible **whole-card HTML source** (`#cesSrcTa`, sections delimited by `<!-- QUESTION -->`-style
  markers, two-way synced; `.af-src[hidden]{display:none}` is required — the author `display:block` would defeat the
  hidden attribute and leave it permanently expanded). The image renders in place (click = edit panel; the **title /
  description / source fields (`#cesImgMeta`) only appear once an image URL is set** — `syncImgMeta()` gates them on
  `c.image.src`; the fullscreen
  viewer is suppressed inside the editor via stopPropagation); a card with no image shows an **editor-only**
  "Add an image" placeholder (`.ces-img-ph` — deliberately NOT `.card-img`, so the delegated viewer/study page
  never see it). `.card-edit-single .admin-live-card` carries auto margins (the card caps at 680px inside the 780px
  column — without them it sat off-centre). **traditional / hanzi / pinyin / translations / citation were REMOVED from the editor on request**
  (the data fields still exist and render on study cards). **The admin tree drags two ways**: dropping on a
  same-parent sibling REORDERS (insert-before, `reorderSiblings` — the Library follows this order); dropping on a
  node with a different parent MOVES INTO it, as before. The
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
  = `#C39A2E`, brighter `#E6C765` on `body.night`; the profile `.cl-row .lb-num` stays indigo). **The review
  banner's xp bar runs in the same metal** (`.banner .xp-fill` + `.xp-lvl`, gold): the Library's bars take each
  collection's hue and the account's are indigo, so one indigo bar read as another. Its "Level N" label is a
  DEEPER gold than the fill — `#C39A2E` on the card is only 3.6:1, too thin for 10px text. The earned
  `.done`/`.won` fills override both with their own on-fill colour, since gold on gold reads as nothing. The old studied/total
  **progress bars were removed from Library decks + collections** (they remain on the account page's "Progress by deck").
  **The Daily-review list got one back** in July 2026, on request: each added row carries an `X/X cards studied` bar
  (`adProg` in `PAGES.home` → `.prog.ad-prog`, animated by the existing `animateProgs`) where a blue `.ad-dot` used to
  sit. The dot and the ancestor rows' hollow `.ad-branch` went together — the branch existed only to line the two up,
  and alone it would have pushed every parent title 21px right of the deck beneath it; the `data-depth` indent carries
  the hierarchy. The bar's label also replaced the `.ad-count` "N cards" chip, which stated the same total twice. Each collection's level is also listed on the **profile** (`renderCollectionLevels` in
  `acctSelfView`). `grade()` calls `announceLevelUps(id)` on a freshly-studied card → a **full-screen "Level up!" popup**
  (`congratsPopup(items)`, a `.levelup-pop` overlay modelled on `inlineModal`) naming each Folio/collection level that ticks
  over (China's shown as its Chinese numeral); it is **dismissed by clicking anywhere on screen** (or Esc/Enter) — the
  click-to-close listener is wired a tick later (`setTimeout 0`) so the grading click that spawned it doesn't instantly dismiss it. Clicking a **deck row in the home Daily-review list** starts a study session scoped to just that deck
  (`data-review` → `route("study",{scope:{type:"deck",id}})`). On the **Library page, clicking a collection's body studies its
  whole subtree** (`wireExpander`'s optional `rowClick` → `route("study",{scope:{type:"deck",id}})`, since a collection is in
  `NODE_BY_ID` and `subtreeCardIds` covers it); its **chevron still expands/collapses** the decks within (the chevron's
  `stopPropagation` keeps it from also studying). A coming-soon / empty collection falls back to toggling.
- **Card-of-the-day additions** (`COTD_ENTRY` / `cotdIds` / `cotdAdd`, beside the other entry helpers): the home tile's
  button studies **that one card** (`scope {type:"card", id, addTo:"cotd"}`), and **grading it** — not opening it — drops
  the card into the daily review. It can't be added the usual way: `S.active` holds whole decks, and pulling a deck in
  for one card is not what the tile offers. So the ids collect in **`S.cards`-independent `S.cotd`** (in `defaultState`
  + `PROGRESS_FIELDS`) and ride in under ONE pseudo-entry, `"cotd:added"`, which `activeEntryIds` / `entryCardIds` /
  `entryInfo` / `removeActive` each special-case so it lists, studies (`scope {type:"cotd"}`) and trashes like an added
  collection — its trash **empties the whole list**, and the entry only exists while it holds cards, so an emptied list
  retires its own row. The id carries a **colon** so it can never collide with a node id (plain slugs) or a `u:` deck.
  Two study-session details go with it: a **one-card session does not requeue** a learning step (`res.requeue &&
  scope.type !== "card"`) — with no other card between, the card would reappear instantly and read as a grade that
  never landed, and it is scheduled properly regardless — and `fromHome` (review / card / cotd scopes) sends the exit
  button, the completion screen and the caught-up placard back to **Home** rather than the collections.
- **Daily review order** (`reviewOrder` toggle → `S.settings.reviewRandom`): **Chrono** presents cards in their in-deck order;
  **Random** shuffles the session order AND **draws the day's NEW cards at random from across the active decks** (rather than the
  first-N in set order) — `reviewQueue` seeded-shuffles the unseen pool by the date (`seededShuffle(pool, mulberry32(hashStr("review-"+todayStr())))`) so the same new cards surface all day.
- **Scheduling (`grade()`):** SM-2-ish with Anki-style learning steps. A **new card graded "Good"** becomes a `learning` step
  (`interval 1/144`, `due = now + 10 min`) that **re-appears the same session/day** — grade() returns `{requeue: due-now < 11 min}`
  and the study session does `queue.shift(); if (requeue) queue.push(id)` — and only **graduates to `review` (due tomorrow) on the
  next "Good"** (Anki-like; before this it jumped straight to tomorrow). "Again"/"Hard" on a new/learning card also requeue
  (1 min / 6 min); "Easy" graduates immediately (4 days). `S.intro.count` (the daily new-card cap via `newRemainingToday`) is
  incremented only on a card's FIRST grade (`fresh`), so a requeued learning card is never re-counted.
- **Review history + statistics:** `grade()` calls **`logReview(mature, correct)`**, which tallies
  `S.reviewLog["YYYY-MM-DD"] = [reviews, matureCorrect, matureTotal]` (in `defaultState()` so old saves
  back-fill, and in `PROGRESS_FIELDS` so it syncs and a friend's shows too). **This log has to exist**: a card
  record keeps only its *last* review, so a card studied on ten days is indistinguishable from one studied
  once — past-day history is unreconstructable from `S.cards`. "Mature" = the card's status was `review`
  *before* the grade (a real recall attempt, not a learning step — hence `preStatus`, captured before the
  scheduler rewrites it); correct = anything but Again. Pruned to `REVIEW_LOG_DAYS` (400).
  Read by `reviewHistory` / `retentionRate` / `dueForecast` and rendered by **`reviewStatsHTML(prog, joined)`**
  on the account page and a friend's: a **study heatmap** (whole weeks in columns, Monday-first,
  scrolling inside `.hm-scroll` so it can never widen the page), a **90-day true-retention** figure (`—`
  when nothing mature has been reviewed — never a made-up 0% or 100%), and a **14-day due forecast**
  (overdue cards fold into today rather than hiding in a past bucket). `dueForecast` skips suspended cards
  and anything in a coming-soon collection, matching `availableCardIdSet()`.
  **The heatmap starts on the day the account was created** (`joined` — `S.user.joined` for yourself, the
  friend's `profiles.joined` for theirs), capped at `HEAT_WEEKS` (53), rather than always showing a year of
  blank squares. Two things that look optional but aren't: it never starts **later than
  `firstLoggedDay(prog)`**, or a guest's study history migrated up into their first account would be hidden
  by the later sign-up date; and the range is rounded **back to that week's Monday**, because the grid is
  `grid-auto-flow:column` over 7 rows and day 0 must be a Monday or every column shifts. The days in that
  first column that precede the account render as `.hm-pre` blanks (aligned, but not drawn as missed days)
  and are excluded from the totals. Month labels drop the earlier of any pair closer than 3 columns — at
  11px per column two labels collide, which a full year never triggered but a short new-account range does.
- **Deck statistics + "Beyond the cards"** (the account page, and a friend's — both take a `prog`, so the
  friend view gets them for free). Two sections below Review statistics:
  · **`renderDeckStats(container, prog, withCommunity)`** — an `<optgroup>`ed picker over `statScopes()`
    (each live collection, every deck inside it, and — for your own account only — your community decks,
    which live outside the tree and outside a friend's synced blob) driving `deckStatsPanelHTML`: a
    studied/total bar plus eight tiles (mature / young / learning / not started / due now / lapses /
    average gap / set aside) and when the deck was last studied. It opens on the deck with the most
    studied cards, and the selection is UI-only — a glance, not a setting. **Everything is DERIVED from
    the card records** (`deckStats(prog, ids)`), deliberately: a per-deck review log would only start on
    the day it was added, so every deck already worked through would read as empty, and it would multiply
    the synced blob by the number of decks. The day-by-day history stays global.
  · **`exploreStatsHTML(prog)`** — what a scholar does *around* the cards. Two meters (glossary terms
    opened, **countries** opened on the Atlas — the latter shows "of N" only once `world.js` has actually
    loaded, since that bundle is lazy), seven derived tiles (**historical territories**, all-time reviews,
    days studied, **longest streak** — `longestStreakDays`, computable from `reviewLog` where `S.streak`
    only holds the current one — card-of-the-day picks, games played, perfect runs) and a per-game row
    from the lifetime log.
    **Both meters count against the set they are measured by, which is NOT the whole register**, and each
    was wrong once in the same way. `placesSeen` records every place opened — 258 present-day countries
    *and* 1,194 historical era territories — so counting the register against `WORLD_GEO.length` read
    "412 of 258": the bar clamps at 100%, the figure beside it does not. It now counts only names that
    are present-day countries (`countrySeenCount`), and the remainder gets the "Historical territories"
    tile rather than being silently dropped. `glossSeen` likewise counts only terms that **still exist**
    (`glossSeenCount`), or a term retired since it was read pushes the figure past the total. The single
    helpers `countryNameSet` / `countryTotalCount` / `countrySeenCount` / `glossSeenCount` /
    `glossTotalCount` are shared by the meters, the discovery chips and `progStats` — **keep new callers
    on them** rather than re-deriving, which is how the two mismatches got in. Guarded by
    `.claude/test-discovery.js`.
  · **Three new progress fields feed them** (in `defaultState` + `PROGRESS_FIELDS`, so old saves back-fill
    and a friend's shows too): **`glossSeen`** and **`placesSeen`** (key → first-seen timestamp, written by
    `markSeen` from `openGlossWin` and `showCountryPopupName`) and **`gameLog`** (key → `{plays, wins}`,
    written by `markGamePlayed`). These exist because **a popup and an Atlas panel leave no other trace** —
    nothing in the state records that they were ever opened, so the reading is invisible unless written
    down as it happens. `markSeen` no-ops (and so skips `save()`) on a key already known, and prunes
    oldest-first at **`SEEN_CAP` (6000)**. Deck
    glossary keys are **not** recorded: the terms-opened figure is measured against the curated glossary,
    and a stranger's deck would let it pass 100%. Both registers start the day they were added, so an
    existing reader's count begins at zero — said plainly here rather than on the meter, which was
    carrying a sentence about it until it was removed on request.
    **`SEEN_CAP` must stay above the SHIPPED universe of both registers** and is no longer a free
    parameter: these counts are now shown to the reader as progress towards completion, so a prune would
    make a count go backwards and re-flag a place as newly discovered. Measured: 333 glossary terms and
    **1,211 distinct clickable place names** (258 present-day + 1,194 across the 13 eras) — already 80% of
    the old 1500 cap, and **every new geo era adds territory names**. Fully seen, `placesSeen` is ~34 KB of
    the progress blob, so the headroom is nearly free. `.claude/test-discovery.js` asserts the clearance
    against the real data files; **if it fires, raise the cap — don't trim the data.**
  · **Discovery marks — telling a read term/place from an unread one.** `markSeen` **returns `true` only
    on first sight**, and that return is the entire signal. Both call sites (`openGlossWin`,
    `showCountryPopupName`) mark on the way IN, above everything that renders, so **anything asking "is
    this new?" at render time is always told no** — capture the return at the top, as they now do.
    · **The UNDISCOVERED term is the marked one.** A glossary link not yet opened carries **`data-new`**
      (set by `markTtipNew`, called from `setupTooltips` — the one choke point every `.ttip` render path
      already goes through, hand-authored and auto-linked alike), and `.ttip[data-new]` paints it in
      **`--ochre`, the same gold as the blank in a card's question**, so an unread term reads as something
      waiting to be filled in. **A term already read carries no attribute and renders exactly as every
      glossary link always has** — the familiar state is untouched, because the mark is the invitation,
      not a record of what is finished. (It was briefly the other way round — read terms dimmed — and was
      changed on request; don't reintroduce that.) It writes an explicit `data-new` rather than styling
      `:not([data-seen])` **because deck terms are in neither register** and would otherwise sit gold and
      undiscoverable forever. `.ttip[data-new]:hover` keeps the gold — jumping to the indigo hover would
      read as the term changing state before it was opened — and sits **after** the base `:hover` rules
      (equal specificity → source order). `refreshTtipNew(key)` re-marks every matching link on the page
      the moment a popup opens, so the prose behind it loses its gold at once, not on the next render.
    · The **first** opening also shows a gold chip (`discChipHTML` → `.disc-chip`): "New term! 41 / 333"
      in the gloss popup's bar, "New place! 7 / 258" in the Atlas panel (`#cpNew`), with a **splash** of
      two expanding rings (`discRing` / `discRingNight`, staggered onto `::after`) and a **`sfx("discover")`
      chime**. The rings are **box-shadow spread, never a scaled pseudo-element**: the chip sits inside
      `.gloss-win` (`overflow:hidden`) and `.cp-cols` (`overflow-y:auto`), where a transform would be
      clipped by the one and could add a scrollbar to the other. Both animations **end fully transparent**,
      so the reduced-motion killswitch — which lands animations on their END state — leaves no ring behind.
      The Atlas panel element is REUSED, so it must be cleared on every non-first open. A historical
      territory gets the label with **no ratio** — it is not part of any set with an honest total. The
      figure carries `notranslate`. **The chime is suppressed in the Find-it game** (`if (!GAME)`):
      `gameTap`/`gameReveal` have just played their own `good`/`bad`, and a bright discovery chime over
      `bad` would congratulate a reader for a wrong answer. The chip still shows — the sound was the only
      part that contradicted the game.
      The `!` is part of the translated string (Spanish opens with `¡`, CJK uses the full-width `！`), so
      the exclamation-less keys were retired from all nine language files when it was added.
    · Four achievements ride on the same counts (`terms25` / `terms100` / `places50` / `placesAll`, fed by
      `progStats`'s `terms` / `countries` / `countryTotal`), and `checkAchievements()` is called from both
      first-sight branches. `countries` is 0 until `world.js` loads, which only ever DELAYS a badge —
      `checkAchievements` adds and never revokes.
- **Deep time (years before the present).** A card's sort year is a plain signed number, so a prehistory
  card is just a very negative one (`-3300000` = 3.3 Mya). Three pieces carry that: **`cardYears(c)`** reads
  `answerDate` and now understands `"2.6 million years ago"`, `"3.3 to 2.6 million years ago"`,
  `"780,000 years ago"` and `kya`/`Mya`/`Gya`, consuming each match so the BCE/CE rules can't re-read its
  digits (before this the prehistory deck sorted on the *discovery* years in the prose — `1925`, `2011` —
  because `\b(1\d{3}|20\d{2})\b` was the only rule that matched); the BCE rules also accept comma grouping
  now, or `"around 10,000 BCE"` parsed as the year 0. **`yearLabel(y)`** is the single formatter — `Gya` /
  `Mya` / `kya` above 10,000 years, `BCE`/`CE` below — used by `chronoLabel` and `fmtYearSpan`.
  **`parseChronoYear`** (the editor's chronology field) accepts everything `yearLabel` emits, so the field
  **round-trips**; keep that true if you touch either. In a range like `"3.3 to 2.6 million years ago"` the
  unit carries leftwards only when the first number is small and ungrouped — `"700,000 and 1.5 million
  years ago"` is not two millions.
- **Card fields (13):** `id, num, category, question` (HTML cloze with blanks), `answer`,
  `answerDate` (HTML), `traditional, hanzi, pinyin, translations` (HTML), `abstract` (rich HTML
  card background; may carry `ttip` glossary links, but newly generated cards omit them),
  `citation, answerText`. (The legacy `citation` string is **not** the footnote system — see the next bullet;
  it predates it, is not in the editor, and is empty on every current card.)
- **Source footnotes (July 2026)** — the `SOURCE FOOTNOTES` block in app.js, just above `buildBack`. Three surfaces
  say things about the past — a card's background, a glossary description, an Atlas place panel — and each can now
  name the scholarship behind them. Each carries a **`sources` list of Chicago note-form citations** (card:
  `card.sources`; term: `window.GLOSSARY_SOURCES[slug]` or a deck term's `entry.sources`; place:
  `country-sources.js`), rendered as a **numbered fold at the foot of the surface**, `sourcesHTML()` /
  `sourceListHTML()` for the Atlas panel, which owns its own `.cp-sec` fold.
  · **Prose points INTO the list with an EMPTY marker** — `<sup class="fn" data-fn="2"></sup>`. **The digit is
    written by `wireFootnotes()`, never by the author**, so re-ordering a source list can never leave a stale number
    sitting in a sentence — the one failure mode of hand-numbered footnotes. A bare `<sup class="fn"></sup>` takes
    the next number in reading order. A marker whose number has **no entry behind it is REMOVED**, not shown: a dead
    superscript claims a citation the reader cannot check, which is worse than no marker.
    **If that pass never runs the marker still prints its number**: `sup.fn:empty::before{content:attr(data-fn)}`
    (once `wireFootnotes` has written the digit the marker is no longer `:empty`, so the two can't both print).
    A phone once showed a whole card of blank gaps mid-sentence over a fold that would not open, which is what
    an unwired surface looks like — and it looks like nothing, so nobody reports it as a wiring failure.
  · **The fold header and the markers are DELEGATED** (one capture-phase document listener each for click and
    Enter/Space, beside `wireFootnotes`), never wired per render — the `.card-img` pattern. Everything a click
    needs is derivable from the DOM at click time, and a per-render listener is one render path away from a
    header that looks like a control and isn't. **Capture phase** so a surface that stops propagation on its own
    clicks (a gloss popup) can't swallow it; `noteForNode` climbs to the nearest ancestor holding a `.src-note`
    and **stops at `<body>`**, so a marker whose own surface has no list finds nothing rather than jumping into
    whatever other panel is open. Don't re-add a per-element listener — it would fire alongside the delegated
    one and toggle the fold twice, i.e. not at all. `wireFootnotes` still does the numbering and the a11y
    attributes, with `wireSourceLinks` in a try/catch: the links are decoration over text this code didn't
    write, the numbering is the join between the prose and the list, and one must not be able to take the
    other down.
  · **A card's and the Atlas panel's folds are OPEN by default; a GLOSS POPUP's is always SHUT.** On the two
    big surfaces a citation the reader has to go looking for is one they will not check, and checking is the
    whole point of shipping the apparatus (July 2026, on request — they were collapsed before). **A reader who
    shuts one there is remembered**: `S.settings.srcCollapsed` (in `defaultState`, so old saves back-fill; a
    device setting, not synced) is written by the **delegated header handler only** — a marker jump force-opens
    the fold for one look and deliberately does NOT change the preference. The Atlas section follows the same
    setting and additionally **hides outright when empty** (unlike its neighbours, which show a shut header): an
    empty "Description" header still tells the reader the panel has that part, but a "Sources" header over
    nothing reads as a claim to have cited something.
    **The gloss popup (`sourcesHTML`'s `opts.compact`) is the exception on both counts** (August 2026, on
    request): it renders `collapsed` unconditionally, ignoring `srcCollapsed` rather than sharing it, and the
    header handler **skips the write when the note carries `.src-compact`** — so expanding one term's sources
    is not remembered, and the next popup opens shut again. A popup is a glance at a word met mid-sentence and
    the fold is a third of its height; expanding one says something about that term, not about every term
    opened afterwards. A marker jump still force-opens it, there as everywhere. Guarded by `test-sources.js`.
  · **A citation ends in its URL, written as plain text**, and `linkifySrcItem` turns it into an anchor —
    **inside `sourceListHTML`, so the list is serialized already wired** rather than fixed up by a pass over the
    rendered page. That was the second half of the same lesson the fold header learned: a list that depends on a
    caller remembering `wireSourceLinks` will, on some render path, reach a reader as a bare `[Open access]` and a
    URL that is not a link — which looks like nothing went wrong, so it gets reported as "the labels reverted",
    not as a wiring failure (it was, in July 2026). It still walks TEXT NODES, so a URL already inside an
    attribute is untouchable, and `wireSourceLinks` stays as an idempotent safety net for markup that arrives
    some other way: the URL pass skips text inside an anchor, and the chip pattern needs brackets that are gone
    once a chip exists. Building the anchor here rather than asking an author for `<a href="…">…</a>` is what
    keeps the href and the visible text from ever disagreeing — a mismatched anchor would quietly send a reader
    somewhere the citation does not name. Links open in a new tab, or following one would end the study session.
  · **A citation also ends in an access label** — `[Open access]` or `[Paywalled]`, stored as plain bracketed
    text after the final period, and lifted into a **chip** by the same `linkifySrcItem` pass
    (`SRC_ACCESS_RX`, `.src-access-open` in `--good` green / `.src-access-pay` in `--ochre` amber, both theme
    tokens so the chip follows every theme and both modes). A paywall is a fact about the link, **not an error,
    so it must not be styled as a warning** — amber, never red. The URL pattern already excludes `[` and stops before
    the closing period, so the two passes can't collide; `replaceInSrcText` is the shared text-node walk.
    Unlike the citation itself the four chip strings ARE localised, through **`t()` at build time** rather
    than `localizeTree`, which can't reach inside `.src-list`'s `notranslate`. **Write the label in English
    in the data.** A citation with no label renders exactly as before — most don't have one yet.
    The rule the label enforces: a **paywalled work is citable only when it is the landmark defining paper**
    for the claim, and the majority of any card's list must be open (`docs/citation-plan.md`, "The bar").
  · **Citations are NOT translated**, and for the reason image credits are not — a citation names an edition that
    exists in one language, and rendering "Cambridge University Press" in nine is fabrication, not translation. Hence
    `notranslate` on every list, and hence `sources` lives on the base card and NOT in the `i18n` blocks. Only the
    **"Sources" label**, its aria-label and the `^Source (\d+)$` rule are localised (all 9 languages).
  · **Deltas + serialization**: `setCardSourcesEdit` (a `sources` delta with a null tombstone, exactly like
    `questions`/`image`), `setGlossSourcesEdit` (`ADMIN_EDITS.glossarySources`, `PRISTINE_GLOSS_SOURCES`,
    `glossaryResetToPristine` / `revertGloss` / `deleteGloss`); baked by `serializeCardData` / `serializeGlossary`.
    Community decks get `uCardSetSources` / `uGlossSet(…, "sources", …)`, sanitized on ingest by `uCardSanitize` /
    `uGlossSanitize` (rich HTML — a citation italicises a title) and carried through export/publish/install.
  · **Editing**: the shared card surface's `sourcesPanel` (so the admin editor's EN view AND the Studio), and a
    `sources` textarea in the curated glossary editor's EN view + the Studio's term form. **One citation per LINE**,
    never comma-separated as tags and aliases are — a Chicago note is full of commas.
  · **How many, and the red mark** (July 2026, on request). **`SRC_TARGET` (5) is the editorial bar** a curated
    card is held to — a target the Edit page reports against, never a validity rule, and community decks are not
    held to it. The card list paints each row's id line with a coverage chip (`cardSourceState` → `.acr-src`):
    **nothing** at 5+, **amber `3/5`** under the bar, **red `0/5`** under it *and* carrying `card.sourcesBlocked`
    — a string reason recording that a batch went looking and came back short. The amber/red distinction is the
    point: amber is a to-do, red is a finding. **A card earns red only when a batch concludes it**, written by
    `.claude/mark-sources-blocked.js` (which demands a reason saying what was searched) and retired
    automatically by `add-sources.js` the moment the card reaches 5. Flagging a card unsourceable before
    searching is the failure the apparatus exists to prevent, one level up — and batch 8b is the standing
    warning, having cited two cards a previous session had written off. The flag is `data.js`-level, carried by
    `serializeCardData` beside `sources`, and **never shown to a reader**: the fold shows the sources a card has.
    A "Fewest sources" sort and an "N under-cited, M blocked" tally in the list head let the pass be worked
    straight down the list. Deliberately NOT the same channel as the right-click `cardColor` mark (a left
    stripe): one is derived from the data, the other is an editor's private marker.
  · `sup` + `class="fn"` + `data-fn` are in the sanitizer allowlists, so a community deck can use markers too.
  · **The Atlas table still ships EMPTY; the glossary has begun.** `country-sources.js` has no entries at all.
    **`GLOSSARY_SOURCES` carries 23 of the 333 terms** (batches G1–G3, 2026-08-01 — the genus, species, specimen and
    stone-industry terms), against
    a bar of **`GLOSS_SRC_TARGET` (2)**, which is lower than a card's five because a description is three sentences
    where an abstract is ten; `docs/glossary-citation-plan.md` is the plan for the rest and
    `node .claude/gloss-source-audit.js` says where it stands. The UI, the deltas and the pipeline are in place;
    the rest is a content job (see "Citing the existing content" below). Guarded by `.claude/test-sources.js`
    (67 assertions).
    **Batches 0–22 shipped 2026-07-31/08-01**: **all 109 prehistory cards now carry sources.** **Against the
    5-source bar, ALL 109 are there** — batches 0–26 are complete, and
    the audit that says which is `node .claude/source-audit.js`. **Every list is majority-open**, `wh-045`
    Jebel Irhoud having been taken to six sources in batch 24 to clear the last exception. See `docs/citation-plan.md` — its Pilot log records how the
    definitional cards were solved, its Batch 1 log the factual errors the exercise turns up (21 so far) and
    the gotcha that a matching sentence COUNT across languages does not prove a matching sentence MAPPING, and
    its Batch 2 log the finding that reshapes the rest of the pass: **the batches are grouped by subject, and
    subject does not predict whether the sources are reachable.** Cards built on a published *result* — a
    genome, a date, a measurement, a model — go through easily; cards built on a discovery history or a naming
    history turn on founding announcements and historiography that are closed with no open deposit, and 14
    such cards are now deferred. Re-cut the remaining batches by source type before working them.
    Two working rules from Batch 3: **an index saying a paper is closed is not evidence that it is** — fetch
    it before labelling it, in both directions (Europe PMC marks Wood et al. 2013 closed and its PMC full text
    is free; the Auckland deposit of Sutikna et al. 2016 is indexed open and sits behind a JS challenge) — and
    **a card reporting an argument in progress has a shelf life**, so expect corrections caused by time rather
    than carelessness (`wh-037`'s *naledi* burial papers reached Versions of Record in 2025 with mixed
    verdicts, where the card said the reviewers were unanimously against and the papers still in revision).
    From Batch 8: **a correction is not finished when the abstract is fixed — check the QUESTION POOL too.**
    Each card carries three phrasings that repeat the abstract's figures exactly as the date line does, and
    `wh-075`'s third phrasing restated the very error being corrected, which would have shipped as the cloze
    question above a corrected background. Patch the extras with `add-questions.js` and the main `question`
    with `fix-field.js` (it reaches any string field, so `question` yes, the `questions` array no).
    From Batch 8b, and it reversed a deferral: **search the holding institution before concluding a card
    cannot be cited.** `wh-067`/`wh-068` were written off when every Swabian Jura paper proved closed, then
    went through on museum and government records — Museum Ulm's catalogue entry for the Lion Man (with its
    inventory number, its measurements and its sex), the Blaubeuren state museum's object record for the
    Hohle Fels flute, and the World Heritage property's official portal, which is openable where
    `whc.unesco.org` is not. For a card **about an object**, the museum record is often the better source
    anyway: it is kept by the people holding the thing and it states the measurements a journal article
    assumed its readers knew. It also carries what the literature quietly updated — the Lion Man's sex is
    settled in the catalogue and was still "disputed" on the card.
    From Batch 13, the limit of that method: **it works where a museum runs a CATALOGUE, and a catalogue is
    not the same thing as a website.** The Georgian National Museum, Naturalis, the Fundación Atapuerca and
    the Moravian Museum all have sites and none publishes per-object records, so Dmanisi, Java Man,
    Atapuerca and Dolní Věstonice were not unblocked the way the Swabian cards were. Check whether a
    catalogue exists before planning a batch around one.
    From Batch 14, the first batch cut by SOURCE TYPE rather than subject, as Batch 2 said the rest should
    be: **a supervolcano, an island species and two Levantine caves went through in one sitting because
    every claim on them is a published RESULT** — a modelled climate, a dated bone bed, a measured genome, a
    thermoluminescence age. Results are deposited, indexed and openable; discovery histories are not. Two
    corollaries worth carrying. **A figure can be right when written and wrong now**: `wh-042` gave Toba's
    2,800 km³ (Rose & Chesner) while the paper its own last sentence rests on opens with ∼5,300 km³, and it
    had Ambrose proposing a six-year volcanic winter he never proposed — that is Rampino & Self's, repeated
    into him by retellings, and his abstract gives a thousand years of cold instead. **Read the abstract of
    the paywalled landmark before paraphrasing it**; PubMed carries it even where the text is closed.
    And **budget for the length rule**: a citation pass makes prose longer, so a card already near the
    330-word ceiling (`wh-049` sat at 329) needs several trimming passes across all ten languages before it
    lands back inside it.
    From Batch 15, two rules that between them reopened a set the plan had written off. **When the
    discovery paper is closed, look for the REVIEW that restates it** — the southern African Middle Stone
    Age was deferred because Henshilwood and Marean are closed, which is true of the founding
    announcements and false of the syntheses built on them; one open review carried six of `wh-057`'s ten
    sentences. And **fetch the FILE, not the landing page**: `hal.science/hal-XXXXXX` sits behind an
    Anubis wall while `hal.science/hal-XXXXXX/document` serves the PDF, which reversed a Batch 14 call —
    Détroit et al. 2019 shipped as [Paywalled] and is open. A wrong access label is a real error, not a
    cosmetic one: it tells a reader not to bother following a link they could have followed.
    From Batch 16: **when a card narrates an ARGUMENT, look for the review that narrates it, and cite the
    originals alongside rather than instead.** `wh-033`'s middle five sentences are the Bordes–Binford
    debate and Dibble's reduction thesis, none of whose primary statements is open; one 2024 review states
    all three in an openable page, and Bordes 1961 and Binford & Binford 1966 sit beside it as the
    paywalled landmarks they are. Also **narrow a naming history to what a source actually says** — "the
    1860s and 1870s" for Levallois-Perret became "the 19th century", which is as precise as the open
    literature gets.
    From Batch 18: **when a card is about an object, an institution or an act of state, look for the body
    responsible before looking for a paper.** Three of its four cards were carried by sources that are not
    journal articles — a Dutch state commission's 2025 advice on the Dubois collection, the ministry's record
    of the handover, and the Smithsonian's Human Origins fossil and species records — none of which has an
    equivalent in the literature. Its other finding is a limit on the batch's own premise: **a founding
    monograph answers the questions its author asked**, so Dubois 1894 and Weidenreich 1943 settle the
    discovery sequences precisely and carry almost nothing else, and five claims across the four cards were
    dropped outright rather than sourced — including Binford & Ho 1985, which could not be opened at all, so
    the card no longer names it.
    From Batch 19: **a museum's catalogue IS the open review that restates the closed founding paper.** Batch
    15's rule — when the discovery paper is shut, find the review — worked on exactly one of its five cards
    (Kimbel & Villmoare 2016 carried the whole of `wh-016`'s second half). What carried the other four was
    batch 18's rule generalised: seven of the batch's 21 works are Smithsonian Human Origins records, and
    between them they supply the dates, body sizes, discoverers, discovery years, type-specimen status and
    cranial capacities that Dart 1925, Leakey/Tobias/Napier 1964 and Brown et al. 1985 hold behind paywalls.
    A catalogue is open **by policy** rather than by luck. Its other finding: **a discovery card is not the
    same as a card that can only be sourced from the discovery paper** — `wh-046` Herto, which the plan
    expected to come back short, reached the bar because the find has been re-examined three times in open
    venues since 2003, and every re-examination restates it before disputing it.
    From Batch 20, the move that reopened a set batch 5 and batch 15 had both walked away from:
    **when the paper that announced a find is shut, look for the paper that CITES it as a comparison.**
    This is not batch 15's rule — a review restates a field and may not exist, whereas a comparison
    restates one rival site and is much easier to find, because you can search the site's own NAME inside
    the open-access corpus. Every famous Blombos find came in that way: Bouzouggar et al. 2007 give the 41
    pierced *Nassarius* shells, their ≈75,000-year age, the two engraved ochres and the 400 Still Bay
    points because they are comparing Blombos with Taforalt, and Rosso et al. 2016 give the 100 ka ochre
    toolkits because they are comparing them with Porc-Epic. Its second finding is simpler and was missed
    twice: **check who is excavating a site NOW, not only who published the landmark.** Klasies River had
    been deferred on Marean's closed papers while Sarah Wurz's current team publishes in *Frontiers*, which
    is open by policy. Third, **old conference proceedings are often the most openable thing in a naming
    history** — the whole 440-page 1957 volume of the 1955 Pan-African Congress is OCR'd on the Internet
    Archive, and it corrected two claims at once: the term is Goodwin's alone from 1928 (1929 is the joint
    volume), and the Congress did not endorse the three-stage scheme but recommended a five-part frame,
    over objections. And the sibling check the plan puts on definitional cards paid twice: `wh-031` had a
    Still Bay date no other card used and an end-date 10,000 years off three of its own siblings.
    From Batch 21, a correction to batch 8b's rule rather than a new one: **the institution to ask is not
    always a museum, and its record is not always a catalogue.** Lascaux and Atapuerca — two of the three
    cards the plan called the hardest — were carried almost entirely by a **government ministry's scholarly
    portal** and a **foundation's year-by-year dig timeline**, eleven citations between them, covering the
    discovery dates, the sector count, the dating, the World Heritage years and even a fossil's nickname.
    Batch 13's "a website is not a catalogue" has a converse worth holding onto. Two hard findings go with
    it. **The `/document` trick is dead on hal.science and journals.openedition.org**, which now serve an
    Anubis proof-of-work wall on the file path as well as the landing page — Ducasse & Langlais 2019 is
    genuinely open and unreadable from here, so it is NOT cited and NOT labelled paywalled, because a bot
    wall is a different fact. And **the uncalibrated-radiocarbon error is the pass's most common find**:
    Lascaux's "17,000 years ago" and Dolní Věstonice's "29,000 to 25,000" are both raw BP read as calendar
    years (21,500–21,000 and 31,270–29,260 cal BP respectively). When a prehistory card carries a round age
    in the twenties or thirties of thousands, check BP against cal BP before anything else.
    From Batch 22, on the pair the plan expected to end red and which did not: **before searching for a
    definitional card, read the register.** Batch 12's finding at full strength — Marchal 2002, Walker 2012,
    Walker 2018 and Walanus & Nalepka 2010 were already deposited for `wh-102`/`wh-105`/`wh-106` and between
    them carry the entire chronozone framework. Its second finding: **when a regional scheme is named for one
    country's bogs, check the neighbours' journals** — the plan looked to Scandinavia, and the Preboreal
    vegetation is open in the *Netherlands Journal of Geosciences*, one country west. Third, a new route to a
    closed paper: **`api.crossref.org/works/<doi>` serves publisher-deposited abstracts**, and returned Groß
    et al. 2019 on Duvensee where PubMed has no record at all. And the arithmetic rule these two produced:
    **when a card gives an age both in ¹⁴C years and in "years ago", check that the second is the calibration
    of the first** — the Boreal's stated end of "8,000 years ago" was neither the calibration of 8,000 ¹⁴C BP
    (that is ~8,950 cal BP) nor consistent with `wh-105`, which already had the Atlantic starting at 7000 BC.
    From Batch 12: **the register pays for itself late.** The three framework cards (`wh-001`, `wh-002`,
    `wh-004`) took 25 citation slots and needed **no new sources at all** — every claim a definitional card
    makes is a claim some other card already makes, so the whole job was mapping sentences to entries
    already in `.claude/sources-register.md`. It also produced the first corrections of a new kind: the
    cards were not wrong against the literature but **against each other** (`wh-001` and `wh-004` ended the
    Palaeolithic at 12,000 years ago where five other cards and `wh-004`'s own date line said 11,700). Run
    the sibling-consistency check FIRST on any card that summarises a whole period.
    From Batch 23, the first TOP-UP batch, and its lesson governs the three that follow: **a top-up is
    where the errors are.** A first pass only has to stand behind the sentences it marked; the bare ones
    are exactly where an unchecked claim survives, and a top-up goes looking at them. Four of its ten
    cards changed prose and every wrong figure sat in an unmarked sentence — `wh-022`'s Acheulean end
    date (a 170–130 ka range no source in front of the card carried, against de la Torre's 0.125 Myr),
    `wh-023`'s "June 1797" and jawbone (both in Frere's own letter, which is paywalled on Cambridge
    Core with no abstract), `wh-008`'s antler pressure-flaker (the study that demonstrates the technique
    used a pointed BONE compressor) and `wh-098`'s 1.9 Ma for Wrangham, which Gowlett puts at 1.7. That
    last card also carried the pass's first **wrong marker**: its Wrangham sentence pointed at Berna et
    al. 2012, the Wonderwerk fire microstratigraphy, which says nothing about cooking — **a marker
    pointing at the wrong work is worse than no marker**, and only a top-up would ever have looked.
    Three tools findings go with it. **`https://www.ebi.ac.uk/europepmc/webservices/rest/PMC<id>/fullTextXML`
    is the way past the PMC captcha** that appeared partway through this batch; resolve the PMCID with the
    `search?query=DOI:"…"` endpoint rather than guessing it. **`split-abstract.js` could not see a dozen
    Chinese abstracts at all**: its CJK clause demanded that `。` carry no following space, so the twelve
    zh and four ja abstracts written with one came back as a SINGLE sentence per block — silently, which
    would have scattered markers anywhere. `\s?` on the CJK terminator took the deck's 5+5 failures from
    48 to 22; **the remaining 22 are real and not this batch's** — `wh-039` and `wh-063` split 6+5 and 7+5
    **in English** — and batch 24 should clear them before marking any of those cards. And
    **`check-style.js` was applying the house rules to `sources`**, reporting a real paper's title as a
    century-word violation; in `--fix` mode it would have renamed the paper. Citations are now masked out
    before any rule runs. Where a language's sentence split diverges from English (zh on `wh-022`), **repair
    the split rather than routing round it with a per-language marker map** — `add-sources.js` catches the
    divergence as a marker-count mismatch, and rejoining the sentences restores parity claim for claim.
    From Batch 24: **where a batch's cards share a DEBATE rather than a site, one review can carry
    most of it.** Two open reviews — Harvati & Reyes-Centeno 2022 on the Middle Pleistocene and
    Scerri et al. 2018 on whether *H. sapiens* has one birthplace — filled eleven of its sixteen
    slots across four and three cards respectively. Batch 2 found that subject does not predict
    reachability; this is the exception that sharpens it, since an argument attracts reviews and
    reviews are what open venues publish. It also produced the pass's **first clean re-check**:
    `wh-047` and `wh-048` were expected to have drifted and had not (Karmin's Y-MRCA "254 (95% CI
    192–307) kya", Rito's mtDNA ancestor "~180 ka"), and it retired the last not-majority-open list
    by giving `wh-045` two open sources instead of one. Two tooling notes: **PMC's browser check now
    covers the article HTML as well as search**, so the Europe PMC `fullTextXML` route from batch 23
    is the only one left here, and it 404s for author manuscripts with no deposited text; and
    **`isOpenAccess: N` in a Europe PMC record means not OA-LICENSED, not unreadable** — check for
    full text before writing a work off.
    Batch 24 also cleared the **5+5 residue** batch 23 left, and the three causes are worth keeping:
    the splitter held an initial only when another followed, so the LAST of a run was exposed and
    "R. P. Soejono" / "Frank H. H. Roberts Jr." each split a sentence in eight languages (it now
    holds whole runs in Latin, Cyrillic and Arabic, plus `Jr.`/`Dr.`/`St.`); **a sentence ending on
    the era abbreviation** has no terminator left and swallows the next one, which `wh-063` did in
    six languages at once — an AUTHORING rule, not a tooling gap, and the splitter's header has
    always said so; and nine translations had turned one English sentence into two. **The deck now
    splits 5+5 in all ten languages with identical marker counts** — the state batches 25–26 can
    rely on, and worth re-asserting after any prose edit.
    From Batch 25, a route the pass had not used: **where a card describes a nineteenth-century
    idea, the idea's own author is often the openable source — because he is out of copyright.**
    Batch 23 found that a founding paper of 1800 can still be paywalled (Frere on Cambridge Core);
    Blytt's 1886 statement of his theory is the other case, OCR'd in full on the Internet Archive,
    and it settled two of `wh-106`'s sentences and **disproved a third**: the card had Blytt naming
    the Atlantic and the Boreal, and his own paper uses neither word as a phase name. Nothing
    openable settles who coined which of the five names — Sernander is not on the Internet Archive,
    no open history of the scheme exists in the palynology journals, and Walker et al. 2012's open
    deposit has 404'd — so that clause and its companion about Sernander were **withdrawn rather
    than re-sourced**. Treat a "who named it" clause as a claim needing its own source. Its other
    finding is the register's, again: **six of the batch's eleven slots needed no new reading at
    all**, which is what a well-kept register buys late in a pass. And a caution for batch 26: two
    correctly-recorded open entries could not be RE-read this time (the Marchal 2002 WHOI PDF uses
    an encoding the extractor cannot decode; Walker 2012's deposit has moved), so a top-up wanting
    to extend what an old entry supports may find it cannot, and should say so rather than guess.
    From Batch 26, which finished the pass at **109 of 109 with nothing blocked**: the plan's own
    advice held — five of its thirteen citations are heritage-agency records (the French culture
    ministry for Lascaux and Chauvet, the Blaubeuren museum, Cosquer Méditerranée, the Fundação Côa
    Parque) — but its finding is a correction to the pass's own method. **A correction does not
    travel between cards on its own.** Batch 21 stripped three Lascaux claims from `wh-086` (the
    17,000-year date, ~1,500 engravings, the five-metre bull) and `wh-083`, which mentions Lascaux
    in one sentence, still carried all three five batches later — in its abstract AND on its date
    line, in ten languages. **Grep the deck for the FIGURE, not just for the card it belongs to**,
    and sweep every language before a batch closes. Two smaller notes: the batch-22
    `api.crossref.org/works/<doi>` abstract route paid for the only paywalled work added across
    batches 23–26 (Villa et al. 2012, the landmark for where the LSA begins at Border Cave); and
    **an agency record can disagree with the paper a card follows** — the Chauvet portal dates the
    occupations to ~36,500 and 30–31,000 where Quiles et al. give 37,000–33,500 and 31,000–28,000,
    so the discrepancy is recorded in the register and the card keeps its Quiles marker rather than
    being silently re-dated.
- **Multiple question phrasings (July 2026):** a card may carry an optional **`questions` array of EXTRA
  phrasings** beyond `question` — **at most `CARD_MAX_QUESTIONS` (10) in all** (official Folio cards carry
  exactly 3; the headroom is for community decks to experiment). Every phrasing is a full standalone clue
  under the same rules (mid-sentence blank, ~28 words), each testing the concept from a different angle so
  students learn the concept rather than one sentence's shape. `cardQuestions(c)` returns the non-blank pool;
  **`cardWithQuestion(c, pickIdx?)`** returns a COPY with `question` set to one of them — **random per show**
  on the study page, **date-seeded** for the card of the day, **fixed per round** in Multiple Choice (so the
  results summary repeats what was asked). Translations carry their own pool (`i18n[lang].questions`), and
  `cardLocalized` **falls back to the single translated question when a language hasn't translated the
  extras** — never a translated question mixed with English extras. In the editors the question box gets
  **chevrons (‹ ›) that cycle the pool** plus a "1 / 3" counter and add/remove controls; edits write through
  `setQuestions` (curated: `setCardEdit` + `setCardQuestionsEdit`, a delta with a null tombstone like
  image/video; i18n: `setCardI18nEdit`; Studio: `uCardSetQuestions`). The HTML source box gives each phrasing
  its own `<!-- QUESTION -->` / `<!-- QUESTION 2 -->` … section. Extras ride through export/publish/install
  and are sanitized on ingest (`uCardSanitize`, capped at 9 extras). The admin card search matches every
  phrasing. Backfill existing cards with `.claude/add-questions.js` (see "Generating cards").
- **Card image (optional):** `card.image = { src, title, desc, credit }` — rendered by `buildBack` as a **16:9
  frame** (`.card-img`, `cardImageHTML`) at the top of the Background section, above the prose (the section now
  renders when a card has an image even without an abstract). Clicking it opens the **fullscreen viewer**
  (`openImageViewer`: wheel zoom toward the cursor 1–8×, click toggles 1↔2.5×, drag pans when zoomed, Esc/×/backdrop
  closes, `closeImageViewer()` runs in `render()`), with title/description/source in a bottom caption bar (a URL
  source becomes a link). One **delegated** document click/keydown listener opens it from any `.card-img` (study,
  previews, editor) via the figure's `data-img-*` attributes — no per-render wiring. The editor's EN view has the
  four image fields (`data-imgfield` → `setCardImageEdit`), which — like i18n — deep-copies the object and stores it
  whole as an `image` delta (clearing every field stores a **null tombstone** that hides a shipped image);
  `serializeCardData` bakes `c.image` when it has a `src`, `revertCard` restores `p.image`. Image metadata is shared
  across languages (not in the i18n blocks).
- **Card video (optional):** `card.video = { src, title, desc, credit }` — the **same four fields and the same
  frame as the image** (`.card-img` plus a `.card-vid` modifier), rendered by `cardVideoHTML`.
  **ONE FRAME PER CARD: the image and the video are alternatives, never companions.** Every writer enforces
  it — `setCardImageEdit`/`setCardVideoEdit` (via `retireOtherCardMedia`), `uCardSetImage`/`uCardSetVideo`,
  the glossary pair (via `retireOtherGlossMedia`), and the deck-ingest sanitizers — and `buildBack`,
  `renderGlossImage`, `serializeCardData`, `serializeGlossary` and the publish payload all keep the rule as a
  backstop, **with the picture winning** so a hand-authored `data.js` carrying both renders as it always did.
  **`retireOtherCardMedia` asks `PRISTINE_CARDS`, not the live card**, when deciding whether to write a null
  tombstone: it runs on every keystroke, and by the second one the live field is already gone — reading it
  erased the tombstone the first keystroke wrote and the retired picture came back on the next reload.
  **Links only — there is deliberately no upload path**: the only place an
  uploaded file could live is inline as a data-URI, which for a curated card rides into `data.js` (eagerly
  downloaded by every visitor) and for a community deck into its published jsonb payload. Host it elsewhere,
  link it here. **`videoSource(src)`** is the single resolver → `{ kind: "youtube"|"vimeo"|"file", url }` or
  **null** for anything else, and null renders NOTHING (the editors show "Not a link Folio can play" rather
  than an empty box). YouTube (watch / youtu.be / embed / shorts / live, `?t=` carried over as `&start=`) and
  Vimeo become `<iframe>`s on **youtube-nocookie.com** / **player.vimeo.com**; a `.mp4/.m4v/.webm/.ogv/.ogg/.mov`
  URL becomes a `<video controls>`. **An iframe src is only ever built by `videoSource` from a matched video
  id — never from raw input**, which is what keeps a stranger's deck from framing an arbitrary page; the
  regexes are the security boundary, so don't loosen them to "anything that looks like an embed URL".
  The figure is **not** a `role="button"` like an image's (the player owns clicks inside it): the fullscreen
  viewer is reached by an explicit `.cv-expand` control, placed **top**-right because a `<video>`'s native
  control bar owns the bottom edge. `openImageViewer`/`openVideoViewer` both call **`openMediaViewer`**, which
  skips the zoom/pan wiring for video and just plays it big (`.iv-vid`). The delegated `.card-img` click
  listener returns early on a `.card-vid` unless the expand control was hit, and the Enter/Space handler skips
  it entirely (the control is a real `<button>`). Editing: `setCardVideoEdit` (curated, a `video` delta exactly
  like `image`, null tombstone and all) / `uCardSetVideo` (community); `serializeCardData` bakes `c.video`,
  `revertCard` restores `p.video`, publish sends `data.video`. `_headers` carries **`media-src 'self' https:`**
  and **`frame-src`** for the two embed hosts. In the editors the unused side is **not** a second empty box:
  it collapses to a slim `.ces-media-swap` pill ("Use a video instead") that opens the other panel, and
  setting either URL clears the other panel's fields and hides it. `.ces-imgpanel[hidden]{display:none}` is
  **required** — the author `display:flex` beats the UA `[hidden]` rule, and without it BOTH panels sit
  permanently open and the click-to-edit toggle does nothing (the image panel shipped that way until the
  video panel made it obvious). Guarded by `.claude/test-video.js` (83 assertions).
- **Nothing is saved uncredited — the media source gate** (`wireMediaSource` / `askMediaSource`, beside
  `videoSourceLabel`). The editors save on every keystroke, so a picture URL pasted in and then forgotten
  about used to ship credited to nobody — the one mistake that stays invisible until someone else points it
  out. The gate sits **between a media panel's fields and the store**: while the source box is empty a typed
  URL is **staged only**, an `.af-reqnote` says so where it was typed (with an "Add the source" button), and
  a modal asks for the source the moment the URL field is left (`change`, not every keystroke). The whole
  staged object enters the store together as soon as a source exists; **clearing the source takes it back
  out**, so `src` and `credit` can never come apart in stored data. `render()` toasts on the way out if a
  panel is still pending, rather than losing the URL in silence. **All four surfaces use it**: the shared
  card surface's image + video panels (so the admin editor and the Studio both), the curated glossary
  editor, and the Studio's term form — each passing its own `get`/`set`/`after`, so the writers stay dumb.
  Because a staged picture is deliberately NOT in the store, the panels' meta rows, the slot renderers and
  `imgSet()`/`vidSet()` **read `gate.staged()`, never the store** (an author must see the picture they just
  pasted, flagged `.ces-media-pending`, not an "Add an image" box over a panel they have just filled in);
  the one-frame sync calls the *other* gate's `reload()`. It is **editor-side on purpose** — a hand-authored
  `data.js`, an imported deck file and an installed community deck are untouched, since this is a guard
  against forgetting while writing, not a validity rule imposed on other people's decks. `add-card.js` and
  `add-glossary.js` enforce the same rule at the content-pipeline end. Guarded by
  `.claude/test-media-source.js` (35 assertions).
- **Glossary video (optional):** `window.GLOSSARY_VIDEOS` (slug → the same object; `glossVideo(key)`,
  `ADMIN_EDITS.glossaryVideos`, baked by `serializeGlossary`), or `entry.video` inside `UGLOSS` for a
  community deck's own term. `renderGlossImage` puts it in the **same `.gloss-imgslot`** at the same fixed
  height — **one frame per term, like a card**, so setting one retires the other and the picture wins if a
  hand-authored `glossary.js` carries both. Edited in the curated glossary editor's **EN view only**
  (`data-gvidfield` → `setGlossVideoEdit`) and in the Studio's term form (`data-gvid` → `uGlossSetVideo`) —
  metadata is shared across languages, like an image's. The home page's Gloss-of-the-day plate stays
  image-only on purpose: it is a silhouette, not a player.
- **Glossary image (optional):** a term can carry the **same `{ src, title, desc, credit }` object as a card**,
  read through `glossImage(key)` and rendered by `renderGlossImage` into the `.gloss-imgslot`, which is
  **floated to the TOP-RIGHT of the popup body** — so the opening sentences run down its left and the
  description resumes the popup's full width below it. It reuses `cardImageHTML`/`.card-img`, so the existing
  delegated
  listener opens the **shared** fullscreen viewer — no wiring of its own. The slot is therefore **first in
  `.gloss-body`, before `.gloss-dates`/`.gloss-desc`** — a float only wraps content that follows it, so don't
  move it back after the prose (both markup sites: `openGlossWin` and the admin glossary editor's preview).
  **In the popup that frame is sized by HEIGHT, not by the card's fixed 16:9 box** (`.gloss-imgslot`): the
  `<img>` is a fixed `height:150px` (170 on the mobile sheet) with `width:auto`, and the float carries
  `max-width:50%` — so every term's picture displays at the same height and never takes more than half the
  popup, whatever its shape. A picture wider than that half is cropped by `object-fit:cover` (the whole of it
  is one click away in the fullscreen viewer); that crop is the deliberate price of one silhouette per popup.
  The **home page's Gloss-of-the-day tile**
  shows the same image to the right of the copy, but as a **profile-picture plate** — a 3:4 frame running the
  tile's full height and **bleeding to its top, bottom and right edges** (negative margins cancelling the
  `.exp-tile` padding, which is 18/20px in every theme; arcade's blanket `*{border-radius:0}` already flattens
  the plate's right corners), filled with `object-fit:cover` (crop biased to 40% so a portrait's subject isn't
  cut off), so the tile keeps one silhouette whatever shape the day's picture is (`.term-img`, a plain `<img>`
  — the tile is a `<button>`, so the `role="button"` figure can't be nested inside it); the discovery row
  splits **half and half** with the card of the day instead of 2:1 on days its term has one
  (`.explore-grid.has-term-img`) — at a third of the row the copy was down to four words a line. Curated terms live in
  `window.GLOSSARY_IMAGES` (slug → object, in `glossary.js`, baked by `serializeGlossary`); a community deck's
  terms carry `entry.image` inside `UGLOSS` and travel with the deck (the `user_gloss` `data` jsonb takes the
  whole term object, so publishing needed **no** schema change), re-sanitized on ingest by `uGlossSanitize` /
  written by `uGlossSetImage`. Editing: the curated glossary editor's **EN view only** (`data-gimgfield` →
  `setGlossImageEdit`, a whole-object `glossaryImages` delta with a null tombstone, exactly like the card image
  — image metadata is shared across languages), and the Studio's term form (`data-gimg`). **The viewer's
  `z-index` (9800) must stay above the gloss stack** — popups sit at 8000+ and the mobile sheet at 9600, and a
  gloss image opens the viewer *from inside* a popup; `focusGlossWin` renormalizes its counter at
  `GLOSS_Z_CAP` so a long session can't climb past it.
- **Themes (8):** folio, clay, garden, synth + four full-overhaul themes: arcade (16-bit), academy (formal faculty),
  marble (antiquity inscriptions), gazette (1940s newsprint, two-column About prose) — each light + dark, tokens
  hex-only. The overhaul themes change layout/chrome/ornament per theme (scoped `body[data-theme="…"]` blocks in
  styles.css; fonts in the single @import). **Seven themes — atlas, press, bloom, tide, scroll, grove, dynasty — were
  REMOVED on request** (a saved selection of one falls back to folio via the `THEMES` whitelist); don't reintroduce
  them. **Collection banners and all theme decorations are STATIC — no animated/moving patterns (removed on request).**
  Themes register in `THEMES` (app.js) + the `THEME_OPTS` settings-picker table (mini-mockup previews, hover try-on).
- **Language switcher + i18n** (`#lang-switch` in the top bar, right of Settings): a custom dropdown of 10 languages
  (en/es/fr/de/it/nl/ru/ar/zh/ja) stored in `S.settings.lang`, each option showing an **inline SVG country flag**
  (`FLAG_SVG` in app.js — NOT emoji flags, which render as bare letter pairs on Windows) plus the language's native
  name. **The site chrome IS localised**: `i18n/ui-<lang>.js` holds one language's tables (`window.I18N` exact strings /
  `I18N_RULES` regex patterns for dynamic labels / `I18N_HTML` whole prose blocks, all keyed by the ENGLISH source
  text), and app.js's engine (`t()`, `localizeTree()`, `applyLang()`) walks rendered text nodes +
  title/aria-label/placeholder/alt attributes after render, with a MutationObserver localizing later DOM (toasts,
  popups, menus). Originals are stashed on the nodes so switching back restores cleanly; anything untranslated stays
  English (graceful fallback). Arabic flips `<html dir="rtl">`. Elements with class `notranslate` are skipped.
  **Adding a language** — the language set is defined in exactly three code sites: `LANGS` + `FLAG_SVG` (app.js,
  the switcher) and `CARD_I18N_LANGS` (app.js, the card editor's translated fields); plus the `I18N_LANGS`
  validation list in `.claude/add-card.js` and `.claude/add-glossary.js`. Everything else is keyed off
  `S.settings.lang` and needs no change. Backfill the CONTENT with **`node .claude/add-lang.js <batch.json>`**
  (see "Backfilling a site language" below) — and add the code to `LANGS` **last**, once the chrome table is
  translated, so the switcher never offers a language that renders as English. Ship an EMPTY
  `i18n/gloss-<lang>.js` at that point too, or every page load 404s on it until the glossary is translated
  (`ensureData` degrades gracefully, but the console noise is real). **No CJK webfont is loaded, deliberately**: `--serif` ends in the generic
  `serif` and none of the Latin faces carry CJK glyphs, so Chinese and Japanese body text falls through to
  the reader's own system CJK font — correct glyph forms per language. The imported `Noto Sans SC` sits only
  in `--han` (level numerals, hanzi lines) and is NOT in the body chain, so it can't impose Chinese glyph
  forms on Japanese text. Don't "fix" this by adding a CJK webfont; it would be a multi-MB download for no
  gain. **Japanese (`ja`) is COMPLETE**: the chrome
  (531 strings / 72 rules / 12 prose blocks), all 30 cards and all 333 glossary terms are translated and live,
  at full parity with the other eight languages.
  **Content localisation is separate**: cards carry per-language `i18n` blocks (`cardLocalized()`), glossary
  descriptions live in `i18n/gloss-<lang>.js` (`window.GLOSSARY_I18N`, read by `glossText()`), and **collection /
  deck titles carry their own `node.i18n` lang-map in `data.js`, read by `nodeTitle(n)`** — deliberately NOT the
  I18N exact table, because titles like `Prehistory`, `Paleolithic`, `Neolithic` and `Bronze Age` also occur as
  answer terms and glossary links inside card prose, where a global exact key would override wording the card and
  glossary pipelines have already translated (verified empirically before choosing the helper). `nodeTitle` feeds
  `nodePath`/`nodeWhere`/`nodeParentPath`, so the Library, study bar, home review list, account rows, deck picker
  and level-up popup all follow; the **admin tree deliberately keeps reading `node.title`** so the editor always
  edits the English base, like the glossary editor's EN-view-only fields. An admin **rename retires** that node's
  translations (`i18n: null`), since a stale translation beside a new English title is worse than falling back.
  `SHIPPED_NODES`, the `applyAdminEdits` rebuild and `serializeCardData` all carry `i18n` through — **a new node
  field must be added to all three or it is silently dropped on the first admin edit** (this bit once: the rebuild's
  `nodeById` literal omitted it and every title stayed English).
  **The `I18N_HTML` whole-block pass is gated on key membership, not tag name.** It was once limited to
  `P|LI|H1…`, which skipped the About walkthrough's `<span>`s and `div.mf-row` blurbs; the exact pass then
  translated only their inline `<b>`s and stranded the surrounding prose in English. It now tests any element,
  with an `isConnected` guard and cheap `children.length`/`textContent.length` bounds against `_i18nHtmlCap`
  (the longest key in that language's table) so it does not serialize `innerHTML` for every element on the page.
  **`setLang(code)` is the single entry point** for a language change (the switcher calls it; don't set
  `S.settings.lang` directly): it validates against `LANG_CODES`, persists, and — since the translation files are
  **lazy and per-language** (`langBundle`) — calls `loadLangData()` first, repainting with `applyLang(); render();`
  once the chrome table lands. A non-English reader therefore sees English for the moment the table takes to
  arrive; an English reader never fetches any of them, and never pays a second render. Switching language pulls
  only the new language's two files; the previous one stays resident.
  **`?lang=xx` links the site in a given language** (e.g. `/?lang=es#decks`) and, like the switcher, becomes
  the stored preference. Its IIFE runs **before `setupLangSwitch`** so the switcher's flag and code chip render
  in the chosen language — move it after and the chip shows the previous language until the next reload.
  Base-tag matching (`es-ES` → `es`); an unknown code is ignored, not stored.
  **Known gap:** the `PAGE_META` titles/descriptions have no `i18n/ui-<lang>.js` entries yet, so `document.title` stays
  English in other languages (the documented graceful fallback). Adding them is a content task.
- **UI sound effects** (the `/* UI sound effects */` block in app.js): tiny synthesized Web-Audio sounds, no files —
  `sfx(name)` with click / toggle / pop / good / bad / win / **discover** (a term or place opened for the first
  time — see the discovery-marks bullet above), played by ONE delegated **capture-phase** click listener
  (so a handler's `stopPropagation` can't swallow the tick) that maps button-likes to sounds (grades → good/bad,
  `#reveal-btn` + `.card-img` → pop, switches → toggle, everything else → click), plus hooks in `congratsPopup`,
  `checkAchievements` and `markGamePlayed(won)` → win. Gated by **Settings → Audio → Sound effects**
  (`S.settings.sfx`, default ON); the shared `AudioContext` is lazily created + resumed inside the gesture (autoplay-safe).
  Volumes are deliberately tiny — keep them subtle.
- **Read-aloud TTS — SET ASIDE (July 2026)**: the whole system is disabled site-wide — `ttsEnabled()` in app.js
  returns `false` unconditionally, which hides every play control, the card mute button, the pronunciation button,
  auto-read and the selection Read-aloud menu; the Settings "Audio" card was removed. The machinery below and the
  baked `audio/` files stay dormant for a later revival — everything in this bullet describes that dormant system.
  (Web Speech API, zero-dependency; the `/* text-to-speech */` block in app.js): a slow MALE English voice
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
- **Home page** (`PAGES.home`): greeting → daily quote (`QUOTES` — world sources East and West, standard published
  translations only, no loose internet attributions; **clicking one flips it to the original** — text, speaker and
  source from the entry's `o` block, `wireDailyQuote` swapping `hidden` on the `.dq-live`/`.dq-orig` spans, clicking
  again returns to the site language. The swap **crossfades**: the words fade out (`dq-out`), the swap happens while
  nothing is visible, the incoming ones are held at their start (`dq-in`, `transition:none` — removing the class is
  what animates them) and the figure's height eases between the two languages (`dq-sizing` + an inline height, since
  a Greek line and its English rarely wrap the same), so nothing cuts and the page below never jumps. `DQ_FADE` /
  `DQ_SIZE` in app.js must stay in step with the `.dq-*` transition durations in styles.css; a `busy` guard ignores
  clicks mid-flight and `prefersReducedMotion()` swaps outright instead of waiting out the timings. `.dq-flip` also
  carries **`user-select:none`** — it is a button, and clicking it twice to toggle back otherwise swept the
  `::selection` wash across the whole quote (the "it lights up" bug); the trade is that the quote can no longer be
  selected for copying. The original carries **`notranslate`**, or the i18n engine would translate the
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
  the best attempt, not a guarantee. Guarded by `.claude/test-daily-quote.js`) → review banner → (first-run only) a 3-step how-it-works strip →
  game tiles → a **discovery row** (`.explore-grid`): **Card of the day** (a real card, CSS-3D flip to its answer, gloss
  links stripped, **"Study this card"** button — see the CotD-additions bullet below), **Term of the day** (a dated glossary term → `openGlossWin`), and an **Atlas
  teaser** with a slowly turning decorative mini globe (`startMiniGlobe` — decimated `WORLD_GEO`, orthographic,
  theme-coloured like the Atlas, stops when the canvas leaves the DOM, static under `prefers-reduced-motion`). Both
  daily picks come from `dailyPick(arr, salt)` (date-seeded). **Until the first card is ever graded**
  (`S.cards` empty) the banner is a **first-run hero**: purpose sentence + "Study your first cards", which sets
  `S.active = ["china"]` (replacing the bare `cn-qing` default) and routes straight into a session; the level badge,
  xp bar, stats, review-order toggle and active-deck list appear only after that. The banner shows a **🔥 day-streak
  chip** (`S.streak`, shown at 2+ when the run is alive). **The Daily-review banner earns its colour like a game
  tile**, in **bronze** (`--tile:#9A6634`, set on `.banner` in styles.css): the idle wash from the left; **`.done`**
  = the day's pile is cleared → the full bronze fill; **`.won`** = every card today was right on the first try →
  the same shining gold (`gt-gold-shine`) as a perfect game tile. It reads `S.reviewDay = { d, n, miss }` (in
  `defaultState` + `PROGRESS_FIELDS`), written by **`logReviewDay`** from `grade()`: only a card's FIRST attempt
  of the day counts (`firstToday`, from the pre-grade `c.last`), since a learning card is graded again ten minutes
  later; correct = anything but Again, as in `logReview`. `reviewLog` can't answer this — it counts every grade
  and only tracks mature ones. Both fills carry `.review-group` in their selector **for specificity**: marble and
  academy dress `.banner` with a surface of their own, and the earned fill must outrank it in every theme; the
  gold is `.done.won`, since a perfect day carries both classes. **The home page must not read as China-centric** — Folio
  covers many history topics; copy stays subject-neutral (China is just the first live collection).
- **Home minigames** (game-grid tiles → `PAGES.*`): **Multiple Choice** (`PAGES.challenge`, formerly "Daily Challenge" — the
  rival bots + timer were removed; it's now a plain 5-question quiz whose 3 wrong options are the SAME `answerType()` as the
  answer — a person → other people, a dynasty → other dynasties), **Timeline** (`chrono`), **True or False** (`truefalse`),
  **Who said it?** (`whosaid`, from `quotes.js`), and **Find it on the map** (`findit` — see the Atlas game-mode bullet
  below; 5 date-seeded locate-on-the-globe rounds, score = first-try finds). `BOTS`/`drawRace`/podium are now dead code.
  Each of the 5 games records a per-day result in `S.games[key] = { date, played, won }` (`markGamePlayed(key, won)` at each
  game's end; `won` = a perfect run, or `solved` for Timeline). The home tile has **three daily states** (state classes set by
  `tile()`) — playing EARNS the colour: **unplayed** = a whisper of the tile's hue (a ~10% wash + hue-tinted title,
  theme colour only in the left bar, faint corner icon — `button.game-tile:not(.done):not(.won)`); **played today** (`done`, via
  `gamePlayedToday` — challenge/chrono still also derive it from `S.daily.lastPlayed` / `S.chrono.date`) = the tile FILLS with
  its theme colour (bright top-left → darkened far corner, dark icon, white text) + the green **✓ checkmark**; **perfect score
  today** (`won`, via `gameWonToday`) = a **shining gold** tile (`gt-gold-shine` sweeps a white band across the gold via
  animated `background-position`; icon/text darken; check stays). In **light mode** the filled (non-gold) tile skips the
  darkened far corner (`body:not(.night)` override). A played tile's tagline becomes **today's best score** ("4/5 correct!",
  chrono: "in order!") — `markGamePlayed(key, won, score, total)` stores `{s, n}` per day, `gameSub()` renders it. The
  Daily-review banner's CTA sits at the **bottom-left inside `.body`** (below the full-width xp bar), on mobile too. The **"Clean Sweep" achievement**
  (`sweep`, 🎯) unlocks when **all five are `won` on the same day** (`DAILY_GAMES` includes `findit`;
  `allGamesWonToday` → `progStats().dailySweep`). A perfect Multiple-choices run also increments `S.daily.wins`, which **revived
  the previously-dead `win1`/`win10` (Victor/Champion) badges** (`wins` was never written after the bot race was removed).
  `S.games` is in `defaultState()` (back-fills old saves) and `PROGRESS_FIELDS` (mirrors to the account).
- **Collection identity (Library)**: `COLL_THEME` (app.js) maps each collection id → `{ bg }`, a signature hue
  (`--coll-bg`, consumed by every theme's STATIC banner treatment in styles.css — the old drifting SVG motif system
  AND the gold `COLL_SEAL` emblem circles were both removed on request; banners carry only the hue wash + level
  numeral). The **default folio theme has a "bookplate" deco** (quiet hue wash + fine inner rule); coming-soon rows
  show a ghost of their hue (row opacity .62). Deck rows inside a collection take the collection hue as their left
  hairline (`--coll-bg` inherits from the `.collection` root; branches stay ochre). If a collection is ever recreated
  under a new id, update `COLL_THEME` (and `COLLECTION_NUMERALS`).
- **Library layout (`PAGES.decks`)**: "All decks" is a plain group; **"Coming soon" is a `<details>` disclosure**
  (`.collection-group-soon`), collapsed for visitors and **`open` for admins** — the library drag-and-drop needs its
  drop targets reachable, and moving a collection between the two groups is an editor workflow. This exists because
  the collections still being written far outnumber the finished ones (currently 6 to 1), and listing them flat made
  the Library read as empty. A live collection's banner also carries a **card count** (`.collection-count`, from
  `subtreeCardIds`) — the one number that says there is something to study here.
- **Collections count their level in their own script** (`levelBadgeMarkup(xp, sys)` + `numeralIn(sys, n)`; the id→system map is
  `COLLECTION_NUMERALS`): China → Chinese numerals (`一 二 三 …` via `cnNumeral()`, Han font — `一` for level 1 is a single
  horizontal stroke, so it reads as a bar until level 2+), Ancient Rome (col-40) → Roman numerals, Ancient Greece (col-13) →
  ancient Greek alphabetic numerals (`α ια`, ϛ = 6; the closing keraia was removed on request — don't reintroduce it), India (col-43) → Devanagari digits (`१ २`), Russia
  (col-42) → Cyrillic/Church-Slavonic numerals (`а҃ в҃`, titlo over the second-to-last letter, 11–19 unit-before-ten). The
  level-up popup (`congratsPopup`, items carry `sys`) uses the same map; sizes tuned per script in styles.css
  (`.level-badge.num-*`). World History + United States stay Western digits.
- **Mobile** (`@media max-width:640px`): page content is centred (`.page-head{text-align:center}`); the top nav is condensed
  (the admin-only Editor/Visitor `.mode-switch` is hidden, controls shrunk) and horizontally scrollable so every item fits and
  the bar spans edge-to-edge.
- **Reduced motion:** styles.css ends with a **global killswitch** — `@media (prefers-reduced-motion:reduce){ *,*::before,*::after
  { animation-duration:.001ms !important; animation-iteration-count:1 !important; transition-duration:.001ms !important; } }`.
  It covers every CSS animation and transition in the file (entrance animations land on their end state), so a new one usually
  needs no extra handling — only add a targeted override when the *end* state is wrong (e.g. `.lu-conf`/`.lu-burst` are
  `display:none`, the gold tile shine is `animation:none`). What it **cannot** reach is JS-driven motion, which must be gated
  by hand: `prefersReducedMotion()` (module-level, read live so the OS setting can change mid-session) covers `render()`'s
  smooth `scrollTo` and the home mini globe; inside the Atlas closure the same check is cached as `REDUCED`, gating
  `pulseChanges`, the era crossfade and `flyTo`'s duration. Globe drag inertia is deliberately left alone — it's the
  continuation of a direct gesture, not decorative motion.
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
  Full-bleed between the top nav and a fixed bottom timeline (1000 BCE → present). **The timeline rail is
  NON-LINEAR** (`year2frac`/`frac2year`, exact inverses used by every rail position — pin, fill, ticks, marks): the
  map-less 1000 BCE – 1500 CE span compresses into the left `TL_KNEE_F = 15%` and 1500 → present stretches over the rest.
  The `.tl-mark` map-year ticks are **focusable buttons** (click = jump, title/aria-label = "1500 CE — <era label>").
  A **plate-title cartouche** (`#mapCartouche`, top-centre, hidden ≤640px, updated by `paintYear`) shows "THE WORLD ·
  1938" / "THE WORLD TODAY". The disk gets **limb shading + an atmosphere halo** as **two DOM layers, NOT canvas
  gradients**: `#globeHalo` (below the canvas) + `#globeShade` (above it, `z-index:1`), radial-gradient divs sized to
  the disk by `updateLimbDom()` each draw (style-update only, keyed so it no-ops unless the disk moved) and tinted by
  `paintLimbDom()` (colours `limbA/limbB/haloIn/haloOut` from `readColors`; re-applied by the theme observer). They
  were canvas gradients once, gated to settled frames — a limb-sized gradient shifting per frame is exactly what some
  hosts onion-skin into a page-wide gold bloom (the "everything turns gold" bug) — but that made them vanish during
  every drag/zoom; as GPU-composited DOM they are **always visible** and give the compositor artifact no fuel.
  `drawLimb()` now draws only the rim stroke. **Hovering names the entity under the cursor** via a **DOM chip**
  (`#globeHoverName` / `updateHoverName()` — deliberately NOT canvas: following the cursor is a style update, so the
  canvas only redraws when the hovered ENTITY changes, never per-move; on a geo era it shows "empire · territory" via
  `.mother`/`empireName`; hidden while dragging / map-editing / whiteboard-drawing and on touch (`@media (hover:none)`);
  `settle()` re-derives `hoverIdx` from the recorded `hoverPx/hoverPy` after a drag/coast/zoom so the tag and hover fill
  are never stale under a stationary cursor). **`eraLabelAnchors` caches on `_htId` AND `mapEditRev`** — mapBump() only
  nulls `_htId`, which `histTerr()` refills with the same era.id, so without the rev key editor edits kept stale labels.
  An **atlas search box** (`#globeSearch`, top-right) typeaheads over present-day countries, every era's territories and
  all capitals (index built lazily by `gsIndex()`, folded case/diacritics, rebuilt when `mapEditRev` changes; a territory
  sharing a present-day name folds into one row spanning its years). Picking a result keeps the current year when the
  entity exists there, else jumps to the present (if listed) or the entity's earliest era, then **flies the globe**
  (`flyTo` — easeInOutQuad rotLon/rotLat/zoom over ~0.7s) and selects it + opens its popup (capitals just fly close
  enough for the pin label, no popup). The fly is cancelled by pointerdown / wheel / `zoomStep` / `setYear` (so timeline
  navigation mid-flight aborts it) / `cleanupGlobe`; the landing selection runs ~90ms after touchdown via a **tracked**
  `flyDoneT` timeout and re-checks `eraKey(year)` against the era it took off for, so it can never resurrect a
  selection on an era the user navigated to meanwhile. The dropdown's `.gs-results[hidden]{display:none}` override is
  required (author `display:flex` beats the UA hidden rule — codebase convention, cf. `.country-pop[hidden]`).
  **Change-over-time features (batch 2):** `terrOf(era)`/`ownerAt`/`ownerIdxAt` are the cross-era lookup (per-era.id cache
  `_terrCache`, cleared by `mapBump` + the groups→geo materialization in `enterMapEdit`; smallest-bbox tie-break so enclaves
  beat their surrounder, like `countryAt`). Stepping ONE map-year pulses the territories that changed hands (`pulseChanges` —
  each new-map label anchor sampled against the old era's owner; anchors carry their territory index `i` because names are
  NOT unique — 1900 has 35 "Fiji" polygons; skipped while `tlDrag`, throttled 450ms for chevron-holds, skipped on eras with
  >320 territories, and under `prefers-reduced-motion` (`REDUCED`)). Era changes **crossfade** (~280ms — `fadeCv` snapshot in
  `setYear`, composited with falling alpha in `draw()`, killed by `startMotion`/`tlDrag`; the settled base cache is snapshotted
  BEFORE overlays, so pulse/fade never leak into `baseCv`). A **play button** (`#tlPlay`) auto-steps the mapped years every
  2.4s (`_playStepping` flag; any user-driven `setYear` AND any search pick calls `playStop` — a pick on the current year has
  no setYear, and a later tick would cancel its flight mid-air). The info panel gained a **drill breadcrumb** (`#cpCrumb` —
  parent = the empire via `.mother`, or `ownerAt(popPointLL)` for drilled countries/UK constituents; clicking climbs back up),
  **"Through the ages"** (`#cpHistory` — `ownerAt(popPointLL)` across all mapYears, consecutive runs collapsed; a row click
  jumps + re-selects **by point, not name** via `selectEntityByName(name, atLL)`), and **Copy link** → `#map/<year>/<slug>`
  deep links (parsed at boot + hashchange by `parseMapHash` — `decodeURIComponent` is try/caught so a mangled %-escape can't
  kill boot; the consumer resolves territory names, then EMPIRE names via `.mother`, then drilled present-day countries
  (`subSelGeo`), then UK constituents (`subSelUK`); `popPointLL` (the click point / search anchor — GEO label point `c`, NOT
  the bbox centre, which can land in a neighbour) + `popEntityName` feed all three). Unclaimed land on historical eras gets a
  **terra-incognita stipple** (`stipplePattern()`, theme-aware via `stippleCol`, drawn settled-only under the claimed-land
  refill so it survives only on wilderness).
  **Frame-cost rules (smoothness batch, July 2026) — keep these when touching the render path:**
  · **Coalesce input renders.** `onGlobeWheel` calls `scheduleDraw()` (one render per rAF), EXCEPT right after its paced
    `forceComposite()` realloc, which needs a synchronous `draw()` (the realloc clears the backing).
  · **Borders are PRE-CHAINED, not per-edge.** `histTerr()` builds `_htRuns` = `{r0, r2}`, maximal same-mask polylines
    (rebuilt per era; entries reference the ring vertex arrays so editor vertex-drags flow through). The render strokes
    runs — never re-walk masks per frame — and skips the `'2'` pass when `r2` is empty (all geo eras).
  · **Cull before projecting.** Coast chains have bounding caps (`coastCaps()`, the `ADMC`/`cullHidden` pattern); the
    coast pass skips chains behind the horizon or off-screen. Any new global layer should get the same treatment.
  · **`_wild` is geo-eras-only.** Merger (groups) eras claim every country, so the wilderness pass is skipped entirely.
    Accepted delta: merger-era coasts lost a sub-pixel dark `landWild` seam fringe (an artifact of that pass).
  · **The wilderness pass COMPOSITES, it does not clip** (`landLayer()` / `landCv`, the `_wild` branch — the fix that
    made 1500–1938 as smooth as the present-day map, July 2026). Dark land, stipple and the claimed-land refill are
    painted into a transparent offscreen layer whose later passes run under `globalCompositeOperation = "source-atop"`,
    so they reach land pixels and nothing else; one `drawImage` puts the layer on the globe. The old path filled all
    117k GEO vertices dark, filled them again with the stipple pattern, then built a clip out of every era-territory
    ring and filled + stroked all 117k a third and fourth time inside it — **four world-sized passes where the
    present-day map does one, each of the 258 fills rasterized against a 20–45k-vertex clip mask.** Under the composite
    the stipple needs no geometry at all (one `fillRect`) and the refill is one territory-sized fill. The claimed fill
    is followed by a `stroke()` of the SAME path so a claimed coast keeps its light edge over the dark base's own
    stroke — drop that and every coast grows a dark hairline. `landCv` is freed on present-day/merger eras and in
    `cleanupGlobe`, so only a geo era pays for the buffer. **Never reintroduce a per-frame `ctx.clip()` over
    world-scale geometry** — that, not the vertex count, is what made the older maps unusable.
  · **Motion frames are cheaper on purpose.** While `moving`: city labels don't lay out (pins only), era-capital labels
    and their `measureText` are skipped, selection glows drop `shadowBlur`, and the selection's gold COASTLINE
    (`strokeCoastClipped`, two more clips + a scan of every coast chain in the region) is skipped — the fill is still
    clipped to the land, so only the bright coast edge waits for the settled frame. Everything returns when settled.
  · **A selection paints as ONE batch** (`paintFillGroups`; `paintFillRings` is now a single-group wrapper). A click on
    a geo era selects a whole EMPIRE — dozens of territories — and painting them one at a time meant one GEO-derived
    clip mask, one coastline scan and two full Gaussian `shadowBlur` passes **per territory, per frame**: dragging with
    an empire selected cost ~4× dragging with nothing selected, and was the likeliest source of the browser hanging.
    Batched, the whole selection shares one clip (bbox- **and** `cullHidden`-filtered, or a world-spanning empire drags
    the far side of the globe into the mask), one stroke path and one coast pass. Fills stay per-entity so ring holes
    survive.
  · **The selection overlay is cached.** `drawSelectionOverlay()` renders selSet/subSelGeo/subSelUK once into `selCv`
    (key = `baseKey` + selection ids) and blits it, so pulse/crossfade rAF frames never re-blur dozens of territories;
    motion frames paint direct. It temporarily reassigns `ctx` (hence `let ctx`) — restored in a `finally`.
  · **Reuse buffers, release big ones.** `drawHeightmap` keeps one `_hmId` ImageData per size; `fadeCv` frees its
    backing when the crossfade retires; `selCv` frees when nothing is selected.
  · **Heightmap grays live on `window.__folioHM`, NOT in the page closure** — the loader frees the multi-MB data-URI
    (`window[L.vn] = null`) and zeroes the decode canvas, so the extracted grays are the only surviving copy; per-mount
    state would force a script re-inject + re-decode on every Atlas revisit.
  · **The idle warm must never fire mid-gesture.** `coastEdges()`/`worldEdgeOwners()` (~1.3s combined) are warmed after
    mount via `requestIdleCallback`, but the callback **reschedules itself while `moving || dragging || ptrs.size ||
    flyRAF || playT || mapDragging`** — an rIC timeout landing during a drag would freeze the globe under the pointer.
  **Game mode + approachability (batch 3):** `PAGES.findit` routes to `PAGES.map(root, {game:true})` — the **"Find it on
  the map" daily minigame** plays on the real globe (`const GAME` gates everything): 5 date-seeded rounds from
  `buildGameRounds()` (2 present-day countries, 2 historical territories, 1 capital; **one seeded RNG stream PER pool**
  so intraday data changes can't reshuffle the day; a `used`-names Set dedupes targets across rounds; quality gates =
  bbox area + `countryDesc` exists + an ETHNO name regex). Taps route to `gameTap` (countryAt name match, or
  haversine ≤300 km for capitals) — a wrong pick **flashes RED and opens ITS info panel** (`GAME_RED` via the shared
  `pulseCol`; a miss still teaches), one retry with a km-distance hint, then `gameReveal`: **GREEN pulse when found,
  gold when missed**, over ALL same-named polygons (capitals get a **geo-anchored `pulsePin` ring** since the fly alone
  is cancellable), and the **answer's info panel opens** (capitals → the owning state via `ownerIdxAt`). The country
  popup is therefore NOT in the `.atlas-game` hide list — it is the game's learning surface; `gameShowRound` closes it
  per round. `pulseCol` resets to gold wherever pulses fire outside the game (`pulseChanges` does). Scoring: first-try
  finds; `won` needs `n >= 5` AND all first-try; `gameEnd` → `markGamePlayed("findit", …)` + `save()` +
  `checkAchievements()`. **Anti-cheat gating**: `.atlas-game` CSS hides search/legend/hover-chip/hint, game mode
  **forces `citiesOn`/`majorCitiesOn`/`countryNamesOn` false** (a capital label on the board IS the answer), the timebar
  is **`inert`** (not just pointer-events:none — buttons stay keyboard-focusable otherwise) + `stepYear`/`playTick`
  carry GAME guards, and the whiteboard never mounts. **Same-day replays are PRACTICE** (`gamePractice` — playable,
  never records: the rounds are deterministic and every answer was revealed). The Atlas also gained **first-visit coach
  marks** (`#atlasHelp` overlay, auto-shown once via `localStorage["folio_atlas_tour_v1"]`, reopened by the `#gzHelp`
  "?" button) and **keyboard navigation** (canvas `tabindex=0`: arrows rotate, Enter selects/answers at the disk
  centre, Esc clears, `[`/`]` step map-years). The **`#gzIn`/`#gzOut` zoom buttons' markup was restored** (wiring + CSS
  existed but the DOM had been lost in an old refactor); the `.globe-zoom` column now sits **bottom-right** — at
  top:50% it collided with the (top-right) legend on short viewports. Clicking a country
  (present-day or a historical era's territory) highlights it and shows a single info popup above the
  timeline — its name + a 5-sentence description from `countries.js`; one at a time, cleared on a second
  click / ocean click / era change. The popup is a **vertical panel on the LEFT of the stage** (the base `.country-pop` rule:
  `left:clamp(16px,4vw,40px); top:16px; bottom:16px; width:min(360px,…)`, single-column `.cp-cols`) — the legend moved to the
  **top-right under the search box** (`.globe-legend{right:…; top:60px}`) to free the left edge. On **≤720px** it reverts to a
  **bottom sheet** capped at `max-height:70%` of the stage. In both layouts it is `display:flex; flex-direction:column` and its
  **`.cp-cols` scroll internally** (`overflow-y:auto; min-height:0`) so the box never pushes the absolutely-positioned
  **`.cp-close` (×) off screen** — the × stays pinned while the columns scroll. Don't put `overflow` on
  `.country-pop` itself (the × would scroll off). **`.cp-cols` is also scrolled back to 0 on every populate**
  (`showCountryPopupName`) — the popup element is REUSED, so without it the next place opens at however far down
  the previous one the reader had got, which on the phone's short sheet lands mid-panel.
  **Its three parts each fold** (`.cp-sec` + `.cp-sec-head`/`.cp-sec-body`, one delegated click listener on
  `#countryPop`): the description, the year paragraph (whose header IS the year number, so it still reads while
  shut) and the figures grid. `cpSection(sec, hasContent)` sets each one as the popup is filled — **open when it
  has something, closed when it doesn't**, so a place with no year paragraph and no figures shows two quiet
  headers instead of a dash and a grid of dashes. That **resets per entity**: a reader's manual toggles belong to
  the popup they were made in, not to the next country.
  The popup (`#countryPop`) stacks: the state's **full legal official name**
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
  - **`c` means two different things, and it bit once.** On an era territory (`timeline.js`) and a UK subunit
    (`uk.js`) `c` is the per-ring **edge mask**; on a `world.js` country it is the **label centre `[lon,lat]`**.
    `paintFill` / `paintSelection` read `terr[idx].c` off `terr = histTerr() || GEO` and passed the centre in as
    a mask, so `masks[r].charCodeAt(i)` threw for **every selection on the present-day map** — aborting the paint
    before anything was blitted, which meant clicking a country there produced **no highlight at all** (fixed
    July 2026 by passing `ht ? terr[idx].c : null`; the historical eras were always fine). Every other reader of
    `GEO[i].c` treats it as a point. If you touch either painter, keep the mask era-only.
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
    states, `SOVIET` set) are overlaid **limited to the era's USSR extent**, light like a `'2'` sub-border — an accurate proxy
    for the union-republic boundaries (the Central-Asian/Caucasus borders were settled by 1936). Limiting to the era polygon
    keeps e.g. the still-independent 1938 Baltics out. Drawn on the map in `renderStatic` next to `drawUKConstituents`.
    That limit is a **per-era cached midpoint test** (`sovietSegsForEra`, keyed on `_htId` + `mapEditRev`), not a canvas
    clip: it used to build a complex clip mask from the USSR polygon on **every frame** of 1920/1938 for a layer whose
    geometry can't change within an era.
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
  · **Persistence** — IndexedDB `folio-community`, store `decks`, one record per deck
    (`{ id, meta, cards, gloss }` — also the export-file shape). **An unusable IndexedDB silently falls back
    to `localStorage["folio_community_v1"]`** (`_communityLS`): the golden rule is that opening index.html
    directly keeps working, and private mode / blocked storage are real too. Verified both ways.
  · **`uDeckNormalize` is the single ingest choke point** — everything entering the store passes through it,
    imports *and* what comes back out of IndexedDB, because that store is writable by anything on the origin.
    Rich fields go through `sanitizeHTML`, plain ones through `sanitizePlain`, image `src` through
    `sanitizeUrl`. `uCardSet` sanitizes on write too, so an exported deck is clean at the source. **The
    contenteditable is never rewritten mid-keystroke** — only the stored value is sanitized, or the caret
    would fight the sanitizer.
  · **Bridges into the rest of the app** are deliberately few: `entryCardIds` / `entryInfo` /
    `activeEntryIds` (accept `u:` entries), `availableCardIdSet` (adds community cards so they reach the
    daily review), `buildSession`'s `scope.type === "udeck"`, and `cardById`. **The daily games are NOT
    bridged** — they draw from `ALL_CARD_IDS`, which is TREE-derived, so unvetted cards can't reach them.
    That's asserted by the test, not just intended.
  · **Studio** (`PAGES.studio`, `#studio`, `studioState`) — deck list → one deck (details, card list with
    reorder, the shared card surface). Reached from the Library's **"Your decks"** section, not the nav bar.
    Community rows are visually distinct (dashed rule, no collection hue) and the section says plainly that
    these decks are **not fact-checked by Folio** — Folio's content rules can't be imposed on a stranger, and
    the credibility of the curated decks is the whole product.
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
  · **`UDECK_PUBLISH_KEYS` never leave the device.** `uDeckExport` strips them and `uDeckImportText` zeroes
    them, so a deck *file* can't claim someone else's slug, masquerade as installed, or suppress an update
    prompt. Only `UDECK_META_KEYS` travel in a `.folio-deck.json`.
  · **Pages** — `PAGES.community` (`#community`: search, sort, grid) and `PAGES.deck` (`#deck/<slug>`, a
    shareable deep link parsed at boot and on `hashchange`, the same shape as `#map/<year>/<slug>`). The
    deck page renders **a real flippable sample card**, re-sanitized through `uCardSanitize` — the server
    copy is never trusted just because it came from our own API.
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
    deck's terms; the site glossary is invisible), `both` (deck terms layered over the site's). Set in the
    Studio under **Deck details**; stored, exported and published.
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
- **Reader feedback (beta, July 2026).** Readers write to the editors from the **foot of the About page**
  (`.msn-feedback`, between the FAQ and the changelog); admins triage the messages in **Edit → Feedback**,
  which **replaced the Accounts tab** — that tab managed the legacy device-local accounts (`folio_acct_v1`)
  and had had nothing to manage since accounts moved to Supabase. **⚠ Needs the `7) FEEDBACK` block at the
  end of `.claude/supabase-schema.sql` run once**, on top of the phase-2/3 blocks; until then every call
  404s and `feedbackErr()` says "Feedback isn't set up on this site yet." rather than leaking PostgREST's
  error, and nothing else breaks.
  · **`public.feedback`** — one row per message: `kind` (bug / correction / suggestion / praise / other),
    `message`, the optional `name` + `email`, the `page` the reader was on, a `meta` jsonb (`lang`, `ua`),
    and the triage pair `status` (**new / seen / approved / done / discarded**) + `admin_note`.
  · **Anonymous inserts are allowed, deliberately.** The reader most likely to spot a wrong date is the one
    who never made an account, and a sign-in wall is exactly the friction that loses that correction. The
    cost is that the publishable key lets anyone POST; the only rate limit is a **device-local cooldown**
    (`folio_feedback_sent_v1`, 30s) — honest friction, **not security**. If it is ever abused, narrow the
    insert policy to `to authenticated`; no application code has to change.
  · **`guard_feedback_columns()` is what actually matters**, and it is the same lesson as
    `guard_user_deck_columns`: RLS picks the ROWS you may write, never the COLUMNS. Without it a sender
    could POST `status:'done'` alongside their message and file it away before an editor saw it, or plant
    an `admin_note`. A non-admin's triage columns are silently restored on insert, and a non-admin update
    returns `old` unchanged. **If you add a server-maintained column here, add it to the guard.**
  · **The message is sanitized on INGEST** (`feedbackPlain` → `sanitizePlain` **per line**, because
    `sanitizePlain` collapses all whitespace and a textarea's paragraph breaks have to survive). It is
    escaped again on render in the queue — the server copy is not trusted just because it came from our
    own API, and this one is written by anonymous strangers.
  · **The status IS the colour** (`FEEDBACK_STATUS`, hex per status, set inline as `--fb-col`): the row's
    left edge, its kind chip and its state label all take it, so scanning for what still needs a decision
    is a glance. The swatches **toggle** — clicking the status a row already carries clears it back to New.
    Changes are applied optimistically and rolled back if the PATCH fails, so a triage pass never waits on
    the network between clicks. The queue opens on "Needs a decision" (new + seen), and the tab carries an
    unread badge fetched once per admin-page mount.
  · **The user-facing strings are localised in all 9 languages** (`chrome.exact` + two `chrome.html` rows
    for the `<small>(optional)</small>` labels); the **queue itself stays English**, like the rest of the
    editor.
  · `adminState.tab === "accounts"` is a **retired value**: `restoreAdminUI` drops it so a session saved
    before this change opens on Cards rather than a tab that no longer exists.

## Generating cards & glossary entries

**Content style rules (all card fields + glossary descriptions, current AND future):**
- **Reading level: a bright 17-year-old must understand it — and the length is fixed.** Two requirements:
  1. **Length: about 300 words** for the abstract, and always within **270–330** (a 10% margin). Treat this as a hard
     target — under 270 reads thin, over 330 turns dense. The abstract stays **exactly 10 sentences in two blocks of
     5**, so sentences now average about **30 words**. Vary the rhythm: mix shorter, punchier sentences with longer
     well-structured ones, rather than making all ten the same length. (This supersedes an earlier, shorter
     ~190–230-word house style — the cards were rewritten up to this length and level in July 2026.)
  2. **Vocabulary: upper-secondary — neither childish nor academic.** Precise words are welcome and need no apology at
     this level: *sedentary*, *surplus*, *hierarchy*, *reciprocity*, *domestication*, *subsistence*, *nomadic*,
     *successive*. What still earns a brief gloss on first use is genuinely specialist vocabulary a general reader
     would not meet outside the field (*conchoidal fracture*, *Levallois*, *Mousterian*, *debitage*, *knapping*,
     *immediate-return*). Avoid jargon for its own sake, but equally avoid over-explaining what a 17-year-old already
     knows.
  Keep the tone of a good popular-history book or a well-written museum panel for older students — never childish,
  never a lecture, and **never at the cost of accuracy or of the hedges**: contested facts stay hedged, in clear prose
  ("scholars still disagree about exactly when…"). This applies to every field, in English **and** in all 8
  translations, which must hit the same length and register in their own natural idiom — never a literal calque of the
  English. (Flesch–Kincaid lands around **11–13** for this register; treat it as a rough check only, since proper nouns
  like "Paleolithic" inflate it — judge by sentence construction and word choice.)
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

**Current direction (July 2026): the China collection is SET ASIDE** — its tree node carries
`placeholder: true`, so it sits under "Coming soon" and `availableCardIdSet()` (app.js) keeps its cards
out of the daily review, the games, the card of the day and study deep-links. **New cards go to the
World History collection (`col-8`)** — create leaf decks under it as topics demand. **Every NEW card and
glossary entry also ships in the 9 site languages** (es, fr, de, it, nl, ru, ar, zh, ja — see the i18n bullets
below and in the file map); the helpers refuse a new entry without its translations (escape hatch:
`skipTranslations: true`, only for deliberate English-only maintenance edits of old entries).

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
  **Length: ONE sentence of about 28 words, and always within 20–34** (the blank counts as a word).
  The questions were rewritten down to this length in July 2026 — they had grown to ~46 words on
  average, which reads as a paragraph on the study card. Keep one strong identifying clue and the
  detail that makes it guessable; push the rest into the background, which is where the depth belongs.
  `add-card.js` refuses an English question outside 20–34 words and warns on a translation that has
  not been shortened with it. **The translations follow the same rule in their own idiom** — a
  language does not get to keep the long version.
- `questions` — **REQUIRED for every new card: exactly 2 EXTRA phrasings of the question** (3 in all —
  the study page asks one of the three at random each time the card comes up, so students remember the
  concept rather than the shape of one sentence). Each extra follows every `question` rule above
  (mid-sentence blank, ~28 words, 20–34) and must **approach the concept from a genuinely different
  angle** — lead with a different fact from the card's background (a function, a date, a place, a
  consequence), never a reworded copy of the same clue. All three must stay answerable from the card's
  own background. `add-card.js` refuses a new card without exactly 2 well-formed extras.
  **Backfilling existing cards** is batched through `node .claude/add-questions.js <batch.json>`
  (`{ "cards": { "<id>": { "questions": [q2, q3], "i18n": { "es": [q2, q3], … all 9 } } } }`) — it
  merges ONLY the question pools, per language, without touching any other field or language
  (`update-cards.js` would clobber the whole `i18n` object; don't use it for this).
- Chinese fields (`hanzi, pinyin, traditional, translations`) — fill only if the term has a Chinese
  form, else `""`. `translations` wraps the pinyin: `<div class="tr-pinline"><span class="tr-pin">…</span></div>`.
- `answerDate` — a `<div class="dt"><span class="dt-k">Date</span><span class="dt-v">…</span></div>`
  block (key date / reign / era, or an etymology line).
- `abstract` (the background) — **exactly 10 sentences and about 300 words** (keep within 270–330), as two
  blocks of 5 split by ` <br><br> `: sentences 1–5 give the general meaning/context, 6–10 the meaning in this
  card's question. Information-heavy and precise, at the 17-year-old register set out above. **The only `<b>` bold is the answer term, at its first mention
  opening the background**; use `<i>` for titles (and foreign terms). **No parenthetical asides** —
  never put information between parentheses. **No glossary links** — plain text only (`cnh-001`
  still uses the old `ttip`/`data-k` links and bolded facts; new cards omit both).
- `sources` — **REQUIRED for every new card: an array of Chicago note-form citations** for the claims the
  background makes, and **at least one `<sup class="fn" data-fn="N"></sup>` marker in the abstract**
  pointing at each of them. Write the marker EMPTY — the digit is drawn from the list at render time, so
  re-ordering the list can never leave a wrong number in the text. Chicago **note** form (not
  bibliography form), **ending in the URL that lets a reader check it**:
  `Author, “Article Title,” <i>Journal</i> 546, no. 7657 (2017): 289–92, https://doi.org/10.1038/nature22336.`
  Italicise the title with `<i>`, as everywhere else, and write the **URL as PLAIN TEXT** — the page turns
  it into a link (`linkifySrcItem`), so the href and the visible text can never disagree. **Every citation
  must carry a link** and all four helper scripts refuse one that does not, which by design restricts the
  citable literature to what is **publicly reachable**: a DOI, an open-access paper, a museum or agency
  permalink. That restriction is the point — a page number nobody can open is a page number nobody
  checked. **Every source must be referenced by at least one marker** — a citation
  nothing points at is a reading list, not a footnote — and `add-card.js` refuses a card that breaks
  either rule. Cite the scholarship the claim actually rests on: a monograph, a survey, a journal
  article, a museum or excavation report. **A Wikipedia article is not a source here** — it is where the
  research starts, not what a study card stands on; follow it to what it cites. **Never invent a
  citation, a page number, a DOI or a publisher.** If a claim cannot be tied to a work you can actually
  name, soften the claim or drop it — that is the whole point of the apparatus. **A source in any language
  qualifies**, and an English card may cite a French or German work where that work carries detail no
  English source does — common for European prehistory, where the excavation reports are written where the
  site is. English is preferred only where it serves equally well, since most readers of the English card
  can check an English source themselves. Cite a foreign-language work under its own title, untranslated:
  a citation names a work that exists, and a translated title names one that does not. Sources are **not
  translated** (they do not appear in the `i18n` blocks), but the **markers do**: put the same markers on
  the same claims in all 9 translated abstracts, or that language silently loses the apparatus
  (`add-card.js` warns when the counts differ). Escape hatch: `"skipSources": true`, only for a
  deliberate maintenance edit of a card written before citations existed.
- `answerText` — the answer as plain text, no HTML.
- `image` / `video` (optional, one or the other) — `{ src, title, desc, credit }`. **`credit` is required**:
  `add-card.js` refuses a `src` with no source line, matching the editors' media gate.
- `i18n` — **REQUIRED for every new card**: the card translated into all 9 site languages,
  `"i18n": { "es": { "question": …, "questions": [q2, q3], "answer": …, "answerDate": …, "abstract": …,
  "answerText": … }, "fr": …,
  "de": …, "it": …, "nl": …, "ru": …, "ar": …, "zh": …, "ja": … }`. Each language mirrors the English fields under the
  SAME formatting rules (blank `<span class="blank">_____</span>` mid-sentence, a question of the same
  ~28-word brevity as the English, **a `questions` array with the same 2 extra phrasings translated**, 2×5-sentence abstract with one
  `<b>` on the answer term, `<i>` for titles, no parentheses, dt-block markup in `answerDate`). Translate
  meaning-for-meaning at native quality — **not a literal, word-for-word rendering of the English.** Each language
  must read as though it were written by a native speaker for teenagers in that language: use its own natural phrasing,
  idiom and word order, at the same plain 14-year-old reading level as the English. Do not transliterate proper names
  that have established forms in the target language, and use each language's own standard scholarly term for the
  answer. The study page, card of the day and games show the `i18n[lang]` fields when the site
  language matches (`cardLocalized()` in app.js); English is the fallback. `add-card.js` refuses a new card
  with a missing language/field.

**Add a glossary term** — write `{ "slug": "Wikipedia_Article_Slug", "description": "<3 sentences>",
"date": "<optional>", "tags": ["<kind>", "<subject>", "<specific>"],
"sources": ["<Chicago note-form citation>", …],
"translations": { "es": "<3 sentences>", "fr": …, "de": …, "it": …, "nl": …, "ru": …, "ar": …, "zh": …, "ja": … } }`
(translations REQUIRED for new terms — the description in all 9 site languages, same three-sentence,
impartial, self-contained rules; they land in `i18n/gloss-<lang>.js` → `window.GLOSSARY_I18N`) to a temp
`.json` file, then run:

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

**Every new term carries `"sources"`** — Chicago note-form citations for its three sentences, in the same
form and under the same rules as a card's (see the `sources` bullet under "Add a card": real scholarship,
never Wikipedia, never an invented page number). They land in `window.GLOSSARY_SOURCES` and show as a
numbered fold at the foot of the popup. **Markers are optional here**, unlike on a card: three sentences
drawn from one reference work are honestly described by the list alone. Where a sentence does rest on a
particular work, point at it the same way — `<sup class="fn" data-fn="2"></sup>`, written empty. Not
translated (a citation names an edition that exists in one language). Escape hatch: `"skipSources": true`,
only for a maintenance edit of an older term.

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

Optional `"image": { "src": "https://…", "title": "…", "desc": "…", "credit": "…" }` adds an illustration
shown at the foot of the term's popup, clickable into the fullscreen viewer (lands in
`window.GLOSSARY_IMAGES`; same shape and rules as a card image, and likewise **not** translated — the
metadata is shared across all 9 languages). Also editable per-term on the admin glossary page. Only add
one where the picture genuinely teaches something, and put its provenance in `credit`. **`credit` is
required** — `add-glossary.js` refuses an `image` or `video` that has a `src` and no source line, the same
rule the editors' media gate enforces (see the "Nothing is saved uncredited" bullet above).

Optional `"video": { "src": "https://…", "title": "…", "desc": "…", "credit": "…" }` adds a clip shown in
the same frame in the popup (lands in `window.GLOSSARY_VIDEOS`). **Links only** — a YouTube or Vimeo page
URL, or a URL ending in `.mp4`/`.m4v`/`.webm`/`.ogv`/`.ogg`/`.mov`; anything else silently renders nothing.
**A term shows one frame, so `image` and `video` are alternatives** — giving an entry both renders only the
image. Not translated, like the image metadata, and also editable per-term on the admin glossary page.

To remove a term, run the helper on `{ "slug": "Some_Slug", "delete": true }`.

When the user pastes one of the generation prompts and then sends bare terms one per message, treat
each as "research it and add it via the helper script," then reload to confirm no console errors.

**Citing the Atlas** — a place panel's citations do not come from `add-card.js` / `add-glossary.js`; they are
batched through `node .claude/add-country-sources.js <batch.json>` (`{ "general": { "<place>": [citations] },
"years": { "<place>": { "1938": [citations] } } }`). Keys are the place name **as it appears on the map**,
lowercased — the helper refuses a name that is in neither `countries.js` nor `country-years.js`, and warns when
year citations are filed against a year that has no paragraph. Same content rules as everywhere else: real
scholarship, Chicago note form, nothing invented. The number grid is untouched — it already names Wikidata in
its hover bubble.

**Backfilling citations onto existing content** — `node .claude/add-sources.js <batch.json>`
(`{ "cards": { "<id>": { "sources": [...], "abstract": "<with markers>", "i18n": { "es": "<with the same
markers>", … } } }, "glossary": { "<slug>": { "sources": [...], "description": "<optional>" } } }`).
add-card.js refuses a duplicate id and add-glossary.js rewrites a whole entry, so neither can do this;
`update-cards.js` would clobber the rest of `i18n`. It merges surgically — only `sources` and, where given,
the prose the markers live in — enforces the same marker rules as add-card.js, **warns for every language
whose abstract carries a different number of markers than the English** (that language shows the list but
none of the in-text links), and reports running coverage, which is how a multi-batch pass is tracked.

**Fixing a figure OUTSIDE the abstract** — `node .claude/fix-field.js <batch.json>`
(`{ "cards": { "<id>": { "field": "answerDate", "sub": { "en": [[find, replace], …], "es": […], … } } } }`).
add-sources.js touches only `sources` and the abstract, and `update-cards.js` ASSIGNS whole fields, so an
`i18n` patch through it replaces the card's entire `i18n` object and drops the other languages. Neither can
fix a wrong number sitting in **`answerDate`** — which is exactly where a citation pass keeps finding them,
because the date line repeats the abstract's figures. This does find/replace inside one named field, per
language, and **refuses to write unless every `find` string is present**: a silent no-op would leave a
corrected card still showing the wrong figure on its date line. Batch 6 needed it for three cards, all of
which would otherwise have shipped corrected prose above an uncorrected date line.

**Citing the existing content (as of July 2026)** — **most of the shipped content still has no citations.** The
109 cards, 333 glossary terms and every Atlas description were written before this system existed, from Wikipedia
and its sources, and were fact-checked rather than referenced. A batched pass is working through the cards —
**all 109 carry sources, and all 109 meet the 5-source bar** (`docs/citation-plan.md`; `add-sources.js`
reports both on every run, `node .claude/source-audit.js` reports them per card, and the Edit page's card list
shows each card's coverage as an amber or red chip) — and **a second pass has started on the glossary**, batched
through `docs/glossary-citation-plan.md` at a bar of **2 citations per term** (`GLOSS_SRC_TARGET`), with
`node .claude/gloss-source-audit.js` and the glossary list's own coverage chip reporting it; **23 of 333 terms
are cited** (batches G1–G3). `country-sources.js` is still empty, so the Atlas panel never shows a Sources fold.
Two rules that pass turned up at once. **`add-sources.js` writes only the ENGLISH description**, so a term whose
prose is corrected needs an `add-lang.js` run per language in the same batch or nine languages keep the old
claim; and **a correction does not travel between surfaces** — `Homo_habilis` still carried the 2.3–1.5 Mya span
a day after batch 19 corrected it on `wh-016`, so when a card is corrected, grep the glossary for the figure.
**Batch G3 ran that rule BACKWARDS, and it is the more valuable direction**: a term is three sentences, so a
wrong figure is quickest to spot there, and the card is where it does the most damage. Checking six industry
terms against their sources corrected the `Mousterian`'s start date on the term **and** on `wh-033` (160,000 →
300,000, in ten languages and on the date line — 160,000 is in nothing openable and contradicted the card's own
parent period), and moved a marker on `wh-032` off a paper arguing the opposite of the sentence it marked. A
term's date line is patched by **`node .claude/fix-gloss-date.js`** — `fix-field.js`'s glossary sibling, an
asserted find-and-set on `window.GLOSSARY_DATES`, written for batch G3 because two of its four corrections were
there and `add-sources.js` does not touch dates.
**Do not paper over the rest by attaching plausible-looking citations to existing prose** — a citation that was
not the actual source of a sentence is worse than no citation, because it invites a reader to trust a page number
nobody checked. The honest routes are the ones the pass follows: open every work before citing it, re-derive the
passage from it, and correct the prose where the source does not bear it out.

**Splicing footnote markers into the translations** — `node .claude/split-abstract.js <cardId …>` splits a
card's abstract into its 2 blocks of 5 sentences in all ten languages and reports whether each one runs 5+5
and round-trips byte for byte. **Run it before placing markers by sentence index**: a language that splits
differently maps the markers onto the wrong claims and nothing downstream notices. It carries every guard
the batches have turned up — decimals, the era abbreviations in five languages (incl. Russian `н. э.`,
which needs no `\b` since JS's is ASCII-only), initials, a day-ordinal before a month name, a bare ordinal
before `Jahrhundert`, the CJK full stop, and **markers already placed by an earlier batch** (the marker sits
between the full stop and the following space, and in zh/ja with no space at all — without that guard a
top-up batch sees one enormous sentence, or splits every marker off as its own).

**Backfilling a site language** — `add-card.js` / `add-glossary.js` only handle a whole NEW entry in every
language at once. To add a language to content that already exists (a new site language, or topping up a
partial one), batch it through:

```
node .claude/add-lang.js <batch.json> [--partial]
```

`{ "lang": "ja", "chrome": { "exact": {…}, "rules": [[pattern, replacement], …], "html": {…} },
"cards": { "<cardId>": { question, answer, answerDate, abstract, answerText }, … },
"tree": { "<nodeId>": "<translated collection/deck title>", … },
"glossary": { "<slug>": "<3 sentences>", … } }` — every section optional, so one batch can be as small as
20 glossary terms. It writes `i18n/ui-<lang>.js` / `data.js` / `i18n/gloss-<lang>.js`, **merging** in every case (a language
never overwrites its neighbours), refuses a card missing any of the 5 translated fields unless `--partial`,
refuses a glossary slug that has no English entry, refuses a `tree` id that is not in `COLLECTION_TREE`
(keyed by **node id**, not title — titles repeat across the tree, e.g. two `Jin`s and two `Prehistory`s),
warns on a chrome key no other language has (a sign the
English source string has changed), and re-parses each file it writes. It reports running coverage
("ja now 140/333"), which is how a multi-batch language rollout is tracked.
**Gotcha this exists to avoid:** `update-cards.js` assigns whole fields, so passing it an `i18n` patch replaces
the card's entire `i18n` object and silently drops the other languages. `add-glossary.js` used to do the same
to `GLOSSARY_I18N[slug]` and now merges instead.

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
**Region membership is a fraction-of-the-feature test (`SUP_MIN`, 80% of a feature's vertices), never a centroid** — a
state straddling the region's edge has a centroid that says nothing about where its land is. The centroid rule silently
DELETED the **Ottoman Empire** from the 1900 map: its centre of mass sits in the open eastern Mediterranean (31.8E 34.4N),
inside the Africa box, so it was dropped from 1900 while the 1914 Ottoman — whose centroid lies outside the box — was never
added, leaving Anatolia, the Levant, Mesopotamia and western Arabia as blank terra-incognita stipple. Greece went the same
way. Both are back under the fraction test, and with them 1900's Libya is Ottoman Tripolitania rather than a 1914 Italian
"Libya" polygon. Two residual artifacts are accepted there, both cross-snapshot frontier mismatches in empty desert: a
sliver of doubled border where 1914's Algeria overlaps Ottoman territory, and an unclaimed wedge in the Egyptian Western
Desert that the 1900 source genuinely never digitized. **A rebuild also carries the era's `id`, label, researched period
`cities` and per-territory `.mother` across from the era it replaces** (mothers travel by territory name; a territory the
rebuild introduces falls back to being its own mother and is listed in the build output to be checked by eye) — without
that, re-running a year silently discarded the capitals and the empire-grouping classification. `RENAME` keeps a source
name the site has standardised elsewhere (e.g. "Manchu Empire" → "Qing dynasty", which is how `countries.js` is keyed).
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
min-zoom gate). **Capitals (`citiesToggle`) and Borders (`bordersToggle`) are separate legend layers in EVERY year** —
every era ships period capitals, so `citiesToggle` is not in `PRESENT_ONLY` and gates `drawEraCities` on historical eras
too. **Country names (`countryToggle`) also draw in every era**: on a past era `drawEraNames` labels the era territories
(anchors computed once per era by `eraLabelAnchors` — largest-ring lon-unwrapped centroid, nudged inside concave shapes —
sized by territory area, de-collided big-first, long ethnographic names wrapped to two lines; era capital labels yield to
them via `countryLabelRects`). Only major cities (`majorToggle`) remains present-day-only, and its legend row is now
**dimmed + disabled (`.legend-na`, title "Present-day map only") on past eras rather than hidden**. The **"Divisions"
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
  Shipped eras: **1500, 1600, 1700, 1800, 1900, 1920, 1938, 1960, 1994, 2000, 2010, 2015, 2020** (+ the present-day map)
  — a century apart back through 1500, then roughly every other decade of the 20th c. (1900-era snapshots are sparse:
  1900/1914/1920/1930/1938/1945/1960 then a gap to 1994, so "1940"→1938
  and "1980"→1994 land on the nearest snapshot, stored at the snapshot's real year). 1500–1938 are `geo` (their
  borders genuinely differ from today; the pre-1900 eras carry period capitals + researched descriptions/spans/year
  paragraphs merged as trailing `Object.assign` blocks in `countries.js`/`country-spans.js`/`country-years.js`);
  1960/1994/2000/2010 are merger-only `groups` (rendered from world.js — e.g.
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
- **Thirteen committed regression tests** (in `.claude/`, not loaded by the site): eleven drive a real browser with
  Playwright; `test-daily-quote.js` and `test-discovery.js` are plain Node with no dependencies at all. Each slices what
  it tests out of the real `app.js`/`_headers` by text, so they can't drift from what ships.
  **Gotcha when writing more of them:** `page.goto()` to a URL that differs only in the `#fragment` is a
  same-document navigation — the app keeps running and its module state survives. Use `page.reload()` when
  a test means "start fresh", or navigate through the UI. Several early failures were this, not real bugs.
  · `node .claude/test-sanitize.js` — 48 XSS vectors through `sanitizeHTML()`, each one also injected into
    a live DOM to confirm nothing executes. **Re-run after touching `SANITIZE_*` or `sanitizeUrl`.**
  · `node .claude/test-csp.js` — serves the site with the real `_headers` CSP and walks every route,
    failing on any violation. **Re-run after changing `_headers`, or adding an inline script/`eval`.**
  · `node .claude/test-community.js` — 40 assertions end-to-end: write a deck in the Studio, reload,
    study it, export, import, delete; plus that a hostile deck file executes nothing, and that community
    content never reaches `CARD_DATA` / the tree / the glossary / the admin overlay / the daily games.
    **Re-run after touching the `COMMUNITY DECKS` module or the Studio.**
  · `node .claude/test-admin-editor.js` — the curated-content editor: open a card, type, confirm the
    overlay records it, revert, the HTML source box, and gloss popups. **Re-run after touching
    `liveCardEditorHTML` / `wireLiveCardEditor`** — that surface is shared with the Studio.
  · `node .claude/test-publish.js` — 62 assertions across three browser sessions (an author, a reader, an
    admin) driving publish → browse → install → update → report → hide → rate → staff-pick → fork → export. It runs against an
    **in-memory mock of the Supabase REST API**, deliberately: the publishable key in app.js points at the
    real project, so a test that really published would write rows into it. The mock also enforces the
    ownership rule, which is how "a stranger cannot patch someone's deck" is asserted. **Re-run after
    touching the publishing functions or `.claude/supabase-schema.sql` — and keep the mock in step with
    the policies, since it is only a stand-in for them, never a proof that the real RLS is right.**
  · `node .claude/test-deck-glossary.js` — 22 assertions on per-deck glossaries: the three `glossMode`s,
    the popup, and above all **isolation** (a curated card never links a deck's term; a second deck never
    sees the first's), plus a hostile glossary in an imported deck. **Re-run after touching
    `glossSourcesFor` / `buildGlossIndex` / `uGlossSanitize`.**
  · `node .claude/test-i18n-lang.js` — 24 assertions on the PER-LANGUAGE translation files: that a
    reader downloads one language and not all of them (an English reader downloads none), that switching
    pulls only the new language, that Japanese is at parity with the other languages across chrome/cards/
    glossary, and — the sharp edge of this layout — that a `glossaryI18n` overlay delta records ONLY the
    edited language, LAYERS over the shipped text so an edit made in one language cannot wipe another's,
    bakes to one file per edited language holding every term, and NEVER bakes a language whose file isn't
    loaded. **Re-run after touching `langBundle` / `glossI18nIngest` / `glossI18nMerged` /
    `setGlossI18nEdit` / `serializeGlossaryI18n` / `editedGlossI18nLangs`, or after adding a language.**
  · `node .claude/test-account-switch.js` — 22 assertions on switching accounts on one device, against an
    in-memory mock of the Supabase **auth + progress** endpoints (a test that really signed up would create
    users in the live project). It asserts both halves of the rule: a guest's study history still migrates
    into their FIRST account, and a newly created second account starts at level 1 with no badges, no streak
    and no heatmap — in the store, on the server row, and on the page (first-run hero, "0 unlocked"). **Re-run
    after touching `supaAfterSignIn` / `supaSignOut` / `supaBoot` / `_supaOwner` / `PROGRESS_FIELDS`.**
  · `node .claude/test-video.js` — 83 assertions on card + glossary videos: that every accepted link shape
    resolves to the embed this code builds and **every other URL resolves to no player at all** (the check
    that keeps an `<iframe src>` off untrusted input), that the frame is byte-for-byte the image's frame
    (computed border-radius / aspect-ratio / border / size), that the expand control opens the viewer and a
    click on the player does not, and that a community deck's `javascript:` video src is dropped on ingest.
    Above all it pins the **one-frame rule** from every side: a card or term given both renders one frame,
    setting either URL retires the other in the store *and* in the other panel's fields, the tombstone
    survives a reload (the keystroke bug above), and Revert brings the shipped picture back. **Re-run after
    touching `videoSource` / `cardVideoHTML` / `openMediaViewer` / `retireOther*Media` / the image or video
    panels, or the `media-src`/`frame-src` CSP.**
  · `node .claude/test-gloss-image.js` — 40 assertions on glossary images: the popup floats one to the
    top-right of the body at a fixed height and at most half its width, with the prose beside rather than
    below it; it opens the SHARED fullscreen viewer and that viewer stacks **above** the popup,
    the curated editor's overlay delta survives a reload and clears cleanly, and a deck's own term images
    are sanitized on ingest (a `javascript:` src is dropped). **Re-run after touching `glossImage` /
    `renderGlossImage` / `setGlossImageEdit` / `uGlossSetImage`, or any z-index in the gloss/viewer stack.**
  · `node .claude/test-media-source.js` — 35 assertions on the media source gate: that an uncredited URL
    really is **absent from the store** rather than merely marked, that it is still shown to the author
    and flagged (so the gate reads as "not yet", not "nothing happened"), that leaving the URL field asks
    for the source and navigating away warns instead of losing it, that an answer commits the whole object
    at once, that **clearing the source takes the picture back out**, and that a shipped credited picture
    is untouched by any of it — on all four surfaces (card image, card video, curated glossary, Studio
    term). **Re-run after touching `wireMediaSource` / `askMediaSource` or any media panel's wiring.**
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
  · `node .claude/test-sources.js` — 67 assertions on source footnotes, on all three surfaces. Most of them are
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
    rather than fixed up after render. The **access chip** is guarded too: one chip per
    labelled citation and none invented for an unlabelled one, open and paywalled told apart by class **and by
    colour** so the difference survives without reading the words, the chip outside the anchor so it can never
    read as part of the URL, and the brackets gone from the render while the stored string keeps them.
    **Re-run after touching the `SOURCE FOOTNOTES` block, `wireFootnotes` / `sourcesHTML` / `normSources` /
    `linkifySrcItem` / `replaceInSrcText`, the `.src-access` styles, the editors' sources boxes, or the
    `fn` / `data-fn` sanitizer allowlists.**
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
  · `node .claude/test-daily-quote.js` — 7 assertions on the home page's daily-quote running order: it
    simulates 400 days off the real `QUOTE_ORDER` and checks every seven-day window in them, so a repeat
    two days running or a third appearance inside a week fails here rather than on the live page. **No
    browser and no dependencies** — the pieces are sliced out of `app.js` and run in a `new Function`.
    The rule is a property of the ARRANGEMENT, so it breaks silently: **re-run after adding or removing
    quotes** (a fifth Confucius line tightens the pool) as well as after touching `quoteRunningOrder`.
  Playwright is a dev dependency and must NOT be installed into the repo (the zero-dependency rule, and
  `node_modules/` is gitignored) — install it in a scratch folder and run with
  `NODE_PATH=<that>/node_modules`. Set `FOLIO_CHROMIUM=<path to chrome>` if Chromium lives outside the
  playwright package; otherwise the default launch is used.

## Environment

- Developed on Windows. Use forward-slash relative paths inside the site.
- The project is a **Git repo** (initialized Jul 2026) so any change can be reviewed and rolled back — commit meaningful
  changes as you go.
- **Cloud sessions (claude.ai/code, driven from the phone)** — when this project is worked on from an Anthropic cloud
  sandbox instead of the desktop: (1) the sandbox clones from **GitHub** — anything uncommitted on the desktop is
  invisible, and desktop sessions must push before/after a travel period; (2) cloud sessions **cannot push to `main`** —
  work lands on a feature branch and a PR, which the user merges from the GitHub mobile app (merge to main = the
  Cloudflare Pages deploy); (3) there is **no live-preview browser panel** — verify with `node --check`, Node scripts
  (`global.window = {}` then `require(...)` for the data files), and if visual verification is needed install
  Playwright + headless Chromium in-session (see Testing above); (4) the desktop machine's Claude memory files do NOT
  load in the cloud — **this CLAUDE.md is the only operational memory**, so keep it current exactly as the golden rule
  says; (5) the user may also make content edits from their phone via the LIVE site's admin editor (the
  `content_overrides` cloud overlay) — before shipping content-file changes from a cloud session, check that overlay
  isn't carrying unbaked live edits, and after baking remind the user to reset `content_overrides.data` to `{}`
  (Supabase Table Editor) per the hygiene rule above.
- **Online accounts + sync (Supabase)** — LIVE in app.js (the `/* Supabase */` module after the legacy accounts block).
  Static hosting on Cloudflare Pages fed by GitHub pushes (`git push` = deploy; content files like `data.js` ship with deploys).
  Schema + RLS: `.claude/supabase-schema.sql` (applied; tables `profiles` / `progress` / `friends`; signup trigger creates the
  profile + empty progress row). Plain `fetch()` (no SDK — zero-dependency rule); the publishable key in app.js is safe to ship
  (security = RLS). **Offline-first**: localStorage stays the working copy; `save()` → `supaQueuePush()` (6s debounce, skips
  no-ops) PATCHes the whole `PROGRESS_FIELDS` blob into `progress.data`; boot (`supaBoot`) refreshes the session, pulls, and
  reconciles — server wins when its `updated_at` ≠ the device's `S._supaTs` baseline (another device wrote), else local pushes.
  Sign-in adopts server progress (or MIGRATES local progress up if the server row is empty); the pre-sign-in device state is
  stashed (`folio_supa_guest_v1`) and restored on sign-out. **That migration is OWNERSHIP-GATED by `S._supaOwner`** —
  the account id the progress currently in localStorage belongs to (device-local like `_supaTs`, so it never syncs
  itself). Migrating up is right for a guest who studied before ever making an account and WRONG for every account
  after the first: without the gate, creating a second account on a device silently adopted — and then permanently
  owned, since we push it up — the previous account's levels, badges, streak and heatmap. So `supaAfterSignIn` migrates
  only when the local progress is unclaimed or already this account's, and otherwise **wipes to `emptyProgress()`**;
  `supaClaimGuestStash()` marks the stash claimed at the moment it migrates (or signing out and into a THIRD account
  would inherit it again), the stash carries its `owner` back on sign-out, and `supaBoot` back-fills ownership for
  sessions signed in before the field existed. Guarded by `.claude/test-account-switch.js`. Auth = email+password (`/auth/v1/*`); emailed links (confirm/reset)
  land with tokens in the URL hash → `supaBoot` adopts them (requires the Supabase **Site URL** to point at the deployed app).
  The account page (auth/self/friends views) is fully server-backed; friends use the `friends` table (request → accept, RLS lets
  accepted friends read each other's `progress` for the badges view). **Admin gating** (`adminEligible()` / `isAdmin()`): a
  signed-in user is admin-eligible iff `profiles.role === 'admin'` (set via the dashboard Table Editor); a signed-in non-admin is
  NEVER eligible; a signed-out guest is eligible only on a **dev origin** (`isDevOrigin()`: `file://` or
  localhost/127./10./192.168.) with no legacy local accounts — so the dev machine keeps its editor, while first-time visitors and
  non-admin accounts on the live site see no Edit tab or Editor/Visitor switch (`applyMode` shows the switch only when
  `adminEligible()`). `isAdmin()` additionally honours the Editor/Visitor toggle (`S.settings.adminMode === false` → visitor view).
  The old local accounts (`folio_acct_v1`) remain only as legacy code (guest stash helpers); their admin-page
  user-manager went with the Accounts tab when the reader-feedback queue replaced it.
- **Live content editing (cloud overrides)** — the `/* cloud content overrides */` module in app.js + the `content_overrides`
  table (single row `id=1`, in `.claude/supabase-schema.sql`; **the user must run the SQL once** — until then every fetch 404s and
  the module degrades silently). The row's `data` holds an admin-edit overlay in the exact `folio_admin_v1` delta format. Every
  visitor (anonymous included, RLS select = public) runs `cloudBootOverrides()` after `supaBoot`: if the row's `updated_at` differs
  from the device's baseline (`localStorage["folio_cloud_ts_v1"]`), the overlay is adopted via `reapplyAdminOverlay(row.data)` +
  persisted, so live-site edits reach all visitors within seconds of their next load. A **signed-in admin** publishes automatically:
  `writeAdminEdits()` (the single overlay write choke-point) calls `cloudQueuePush()` (4s debounce, skips no-ops) which PATCHes
  `ADMIN_EDITS` into the row (RLS update = admins only). **Dev origins neither publish nor adopt, signed-in or not**
  (`cloudBootOverrides` returns early on `isDevOrigin()`; `cloudCanPublish()` requires `!isDevOrigin()`): the dev machine's
  in-flight local overlay is never clobbered by the cloud copy, and it never publishes — a dev overlay empties whenever it's
  baked into the data files, so publishing it would wipe live edits (this actually happened in testing: a signed-in localhost
  tab auto-published its empty overlay over a fresh live edit; don't weaken these guards). Live editing is therefore
  live-site-only. Adopted/loaded overlays pass through `normalizeAdminEdits()` (used by `loadAdminEdits` +
  `reapplyAdminOverlay`), which guarantees every overlay section exists whatever the input (a bare `{}` row can't crash
  `applyAdminEdits`) and **must list every overlay key — `mission` was once missing from the load path, silently dropping
  Mission-page edits on reload**. **Hygiene:** after baking the overlay into `data.js`/`glossary.js`/`timeline.js` and
  deploying, reset `content_overrides.data` to `{}` (Table Editor) so a stale cloud overlay can't shadow the newer shipped files.
