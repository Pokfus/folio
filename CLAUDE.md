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
- **Bump the version with it.** `window.FOLIO_VERSION = { v, released }` at the top of `changelog.js` is printed
  very small in the top-left corner of the home page, and it is the reader's answer to "which Folio am I
  looking at?" — so it must be bumped **in the same commit as the changelog line**, on every merge to main.
  `v` is MAJOR.MINOR: the minor goes up by one per release, the major only when a whole new area of the site
  lands (the Library would have been one). **`released` IS CAPTURED, NEVER COMPOSED — read it off the clock
  with `date -u "+%Y-%m-%dT%H:%MZ"`.** It is an ISO instant in UTC and must be the real moment the work was
  finished; the page prints it in the READER's own clock, so a stamp that is really a local time with a `Z`
  on the end is shown shifted by the writer's own offset — which is how a release made at half past nine in
  the morning came to be announced at half past eleven, and one made just before noon as an afternoon
  (reported Aug 2026). An explicit offset is equally safe (`2026-08-10T11:24+02:00`); what is never safe is
  typing the hour on your own clock and calling it UTC, and a placeholder rounded to midnight is wrong in
  every timezone at once. It lives in `changelog.js` rather than app.js precisely so that
  bumping it and writing the day's line are one file open and two edits, and the two can never come to
  disagree about what shipped when. It is **not** sw.js's `VERSION`, which is a cache generation — bumping
  that one throws every cached file away and costs each reader ~1.4 MB, so the two are counted separately and
  a release does not touch it.
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
  **A COMMUNITY DECK IS NOT A CHANGE TO FOLIO AND DOES NOT GO IN IT** (on request, 2026-08-10). The changelog
  is Folio's own record; the decks under `decks/` — the DELE Spanish set, the HSK Mandarin set — are
  USER-UPLOADED content that nothing on the site links to or serves, so announcing one there posts it as
  though it were official. Two lines about the Spanish decks were written and removed the same day. What DOES
  belong is a change to the APP that a deck happened to force — the import caps have been raised twice by
  decks that would not fit — worded as a fact about deck files rather than about any deck. The same test
  settles a fault found in a deck FILE: a card-id collision between two of them was a bug in the generator's
  output, not in Folio, and gets no line.
  **ONE SENTENCE PER ITEM, AND ONE SENTENCE PER DAY TITLE** (Aug 2026, on request, after a reader met this
  page on a phone). Items had grown back into whole paragraphs — the longest ran to 1,216 characters and one
  day title to 300 — which on a narrow screen is a wall of prose where a list of changes should be. The whole
  file was cut to each line's own FIRST SENTENCE and the ones still long were rewritten by hand; it went
  127 KB → 54 KB, which every visitor pays for, this file being in the eager load path. **Aim for about 120
  characters and treat 200 as the ceiling**; a line that wants a second sentence wants to be two items, or to
  be shorter. The counts and the finding belong here; the per-card detail belongs in the batch log in `docs/`.
  **A DAY TITLE IS AT MOST 72 CHARACTERS, and that is a rule with a checker** (Aug 2026, on request:
  "the daily titles have grown to extensive summaries rather than compact titles"). The sentence rule above
  did not say how LONG, so the titles drifted the way the items had: measured over the whole file, the first
  thirty-two days run 13–72 characters and read as titles ("After the ice", "A Library of books, and World
  History replanned") while nine recent ones had grown to 100–194 and were three- and four-item lists — a
  contents page rather than a heading, and on a phone a wall of prose above the list it introduces. The nine
  were rewritten into the older band and the ceiling is the longest of the ones that were always right.
  **Enforced by rule 5 of `check-style.js`**, over `changelog.js`, REPORT-ONLY and deliberately absent from
  `--fix`: shortening a title is a judgement about which of the day's changes LED, which is the one thing a
  regex cannot make, and a truncated title is a sentence fragment rather than a heading. **Name the day's
  leading change and stop**; the rest of the day is the list underneath.
  (This supersedes an earlier "anything past ~1,000 characters is a transcript", which two 12,000- and
  15,000-character citation entries had already broken once, in 2026-08-01.)
  **An item is rendered as HTML, not escaped** (through `sanitizeHTML`), so `<b>` and `<i>` work and bold
  marks the thing that changed. It was escaped until Aug 2026, which printed the tags themselves on the page
  — reported as "bold text doesn't display properly".
  **ENGLISH ONLY, for now (Aug 2026, on request): a new line does NOT need its nine translations.** The site
  ships in English while the work is on making the English as good as it can be — see the `MULTILANG` bullet
  under "How the app is wired". Write the line, ship it, move on. The rest of this paragraph is the rule to
  resume when translations do: part of the changelog is already live in es/fr/de/it/nl/ru/ar/zh/ja as
  `chrome.exact` rows in `i18n/ui-<lang>.js` (the one-sentence rewrite retired 93 rows per language, so the
  coverage is thinner than it was). An item is now an HTML block rather than a plain text node, so a
  translated one belongs in `chrome.html` rather than `chrome.exact` wherever it carries a tag. They must NOT
  go inline into `changelog.js`, which is in the eager
  load path (the `quotes.js` mistake: 27 KB → 312 KB for every visitor). Add them with `.claude/add-lang.js`
  chrome batches, and **if you reword or merge an existing line, retire the old translations** in the same pass
  via the `chrome.remove` list, or nine files keep a dead row that matches nothing and reads like coverage.
  A line added while English-only simply has no translated rows to retire.
  The changelog **dates follow the site language** (`fmtDay` → `dayLocale()`, en-GB for English), not the
  browser's.

## File map

**Only the study-critical files load eagerly**, in this order — it is significant:
`data.js → truefalse.js → quotes.js → whatyear.js → changelog.js → mission.js → glossary.js →
glossary-wikipedia.js → artefacts.js → lang-decks.js → app.js`.
**HOW BIG THAT PATH IS, RUN `node .claude/check-sizes.js` — DO NOT QUOTE A FIGURE HERE.** This paragraph
used to state one, with "re-measure it rather than quoting it" written beside it, and it drifted to being
**four times understated** anyway (it said 5.90 MB raw / 1.65 MB gzipped against a real 8.80 / 2.45, and
called `app.js` "~684 KB" against a real 2.58 MB). **A warning cannot measure**, and a figure that is
quietly four times wrong is worse than no figure, because it is what a decision about whether a change is
affordable rests on. The script reads the path OUT OF `index.html` rather than from a list, prints the
per-file raw and gzipped sizes and the totals, and breaks `glossary.js` and `data.js` down by global — so
the answer to "what is the largest remaining lazy-load candidate?" is a command rather than a claim.
What is worth stating, because it is a RULE rather than a number: **a picture is a LINK, never an upload**,
exactly as an artefact's is, so an illustration costs a few hundred bytes of metadata here and the file
itself is fetched only by a reader who reaches the card.
**THE CARD TRANSLATIONS WERE REMOVED ON 2026-08-08, on request** — the `i18n` blocks of 89 cards, which
`MULTILANG = false` meant no reader could reach: the `quotes.js` mistake (27 KB → 312 KB for every visitor)
at seven times the scale. **Nothing re-adds a translation by accident**: `add-card.js` and `add-glossary.js`
now DROP a supplied `i18n` / `translations` block with a warning, and `test-i18n-lang.js` fails if any card
carries one or any `i18n/gloss-<lang>.js` reappears.
`i18n/gloss-<lang>.js` reappears.

**Everything else is LAZY**, injected on demand by `DATA_BUNDLES` / `ensureData(name)` in app.js (see the
"Lazy data bundles" bullet under "How the app is wired"). Before this split every visitor downloaded ~11.3 MB
of blocking JS to flip a card; the Atlas layers and the translation tables are ~9.9 MB of that.

| bundle | files | loaded when |
|---|---|---|
| `world` | `world.js` | the Atlas mounts; the home page's mini globe (at idle); the Settings home picker |
| `atlas` | `uk` `lakes` `rivers` `water` `cities` `timeline` `countries` `country-stats` `country-spans` `country-years` `country-sources` | the Atlas mounts |
| `usstates` | `us-states.js` `lakes.js` | a MAP CARD is rendered (the Geography collection). Deliberately its own bundle rather than part of `atlas`: the Atlas never draws states, and a geography card never needs the timeline, the era maps or the city index — folding them together would make each pay the other's ~9.9 MB / 600 KB for nothing. **`lakes.js` rides here because `world.js` has NO LAKE HOLES** — the Great Lakes sit inside the USA polygon, so a card map drew five inland seas as grey fields with an outline round each; it is listed in `atlas` too, which is harmless because `lakes.js` ASSIGNS `window.LAKES` rather than pushing onto a queue. **The card map STROKES a lake shore where the Atlas does not**, in the world layer's own coast ink: on a world globe a lake is a small blue mark, on a card zoomed to one state a Great Lake is half the window, and an unstroked shore beside a stroked ocean coast reads as two kinds of edge on one map |
| `worldcaps` | `world-capitals.js` | a map card asks for a DOT on the `world` layer (a capital card in the world collection). Its own bundle, and fetched only when a card carries `map.dot`: the shapes are `world`'s, which every map window already loads for the coastline under it, and a locator card reads those shapes and never this table |
| `glossExtra` | `glossary-extra.js` | **warmed at IDLE after boot**, and awaited by `openGlossWin` for a reader who beats the warm. The glossary's CITATIONS and ILLUSTRATIONS — 54% of `glossary.js`, and nothing reads either until a popup opens |
| `uiI18n:<lang>` | `i18n/ui-<lang>.js` | the site language isn't English |
| ~~`glossI18n:<lang>`~~ | *(removed 2026-08-08)* | the glossary translations were deleted on request; `loadLangData` no longer asks for this bundle, and the registration in `langBundle` is inert |
| `gamesI18n:<lang>` | `i18n/games-<lang>.js` | ditto (the True-or-False / Who-said-it pools) |
| `placeI18n:<lang>` | `i18n/places-<lang>.js` | ditto (country / territory / capital names on the globe) |
| `book:<id>` | `books/<id>.js` | that book is opened in the Library (never on the shelf — see the Library bullet) |
| `bookOrig:<id>` | `books/<id>.<lang>.js` | the reader asks for that book's ORIGINAL language (never before) |

(`heightmap.js` + `heightmap-ultra.js` are lazy too, but on their own older path — `loadHeightmapLevel`, keyed off
the Heightmap legend toggle / zoom, not `DATA_BUNDLES`.
`ranges.js` + `admin1.js` — the removed Mountains / Divisions layers — are **never loaded**; app.js reads
`window.RANGES`/`window.ADMIN1` with empty-fallbacks, so the files stay on disk for a future revival.)

- `index.html` — app shell. `<main class="stage"><div id="view"></div></main>`, and two things added for
  accessibility in Aug 2026: a **`.skip-link`** as the document's first element (positioned off screen until
  it takes focus, never `display:none`, which would take it out of the tab order and defeat the point of it)
  so a keyboard reader can pass the eight nav buttons in one press; and the **`#toast` live region declared
  in the markup** rather than created on the first message — a region announced at the moment it is inserted
  is one the screen reader has not been watching, and the announcement is lost. Also the static
  `<title>`/description/OG baseline (link-preview crawlers don't run JS) and the `<link rel="manifest">`.
- `books/<id>.js` — one **Library book**'s text:
  `window.FOLIO_BOOKS_IN.push({ id, intro, chapters:[{ n, p, t, html, notes }] })`. **Lazy**
  (bundle `book:<id>`), **generated — never hand-edited** (see `.claude/fetch-book.js`), and it
  pushes onto a QUEUE rather than assigning a global, for the reason the i18n files do. `intro` is
  the book's own front matter (chapter 0). **Currently forty-eight books.**
  · **`count` and `total` are different figures and both are kept**: what Folio holds against what
    the work contains. They part company the moment a book arrives in instalments, or where a
    translator stopped short of his original.
  · **A book's front matter states its own limitations** — what the edition leaves out, whose text
    each column is, and the ground its copyright is expired on. Write that prose in the importer's
    `about`, never into the generated file.
  · **📖 `docs/library-books.md` — READ BEFORE ADDING OR RE-IMPORTING A BOOK.** Per-book findings for
    all 48: how each edition marks its divisions, what pairs and what does not, what was left behind,
    and the licence ground it is shelved on.
- `books/<id>.<lang>.js` — the same book in the language it was WRITTEN in
  (`window.FOLIO_BOOK_ORIG_IN.push({ id, lang, langName, edition, rights, sourceName, sourceUrl, chapters:[{ n, html }] })`).
  Its own **lazy** bundle (`bookOrig:<id>`), generated by the same importer, never hand-edited.
  **Currently thirty-two originals**; sixteen books have none.
  · **THE ONE QUESTION THAT DECIDES WHETHER A BOOK CAN HAVE AN ORIGINAL** is not "does a text of it
    exist?" but **"does that text say which section each passage is?"** — app.js pairs the two columns
    on the section NUMBER, never on paragraph or list order. The number need not be the unit the
    edition is DIVIDED into, nor an integer (a Bekker page is `1094a`).
  · **And ask what the TRANSLATION is a translation OF** before assuming an original can be found: a
    composite of three traditions faces nothing. **And what a medieval original's EDITOR died** — a
    constituted text is a modern work with a modern copyright.
  · A book with no `origLang` simply shows no original-language control, so deleting an `original`
    block and its `origLang` removes that column and leaves the English untouched.
  · **📖 `docs/library-books.md`** carries every original's own entry and the sixteen refusals, each
    with the reason it answers no.
- `.claude/fetch-book.js` — the importer that writes those files, from Wikisource, Perseus TEI and
  Project Gutenberg. Standalone Node helper, zero deps, resumable (per-chapter cache in
  `.claude/book-cache/`, gitignored), safe to re-run:
  `node .claude/fetch-book.js seneca-letters [--from=N] [--to=N] [--force] [--only-original] [--skip-original]`.
  Not part of the site.
  · **Adding a book = an entry in its `BOOKS` table, a matching one in app.js's eager `BOOKS`
    registry, and a row in `BOOK_AUTHOR_COLOR` if the author is new to the shelf.** A book with only
    one of the first two either never appears on the shelf or appears and cannot be opened; with no
    colour row it falls through to the generic indigo.
  · **The entry says HOW THE EDITION IS SET, not just where it is** — `sections`, `layout`, `body`,
    `dropHeads`, `glyphs` and the rest are declared PER BOOK precisely so a rule written for one
    cannot re-set another. **Twenty-two layouts** exist; reach for a **hook** before a layout.
  · **`--force` re-runs the EXTRACTOR** (the cache holds extracted prose, not the fetched page). The
    chapter titles and volume divisions are re-derived on every run, so re-titling costs no refetch.
  · **A CHANGE TO A SHARED EXTRACTOR MUST BE PROVED INERT ON ITS SIBLINGS, BYTE-FOR-BYTE** — re-run
    every other book on that path and diff the generated files. That check has twice found a live
    fault in a book nobody was editing.
  · **📖 `docs/library-importer.md` — READ BEFORE ADDING A BOOK OR TOUCHING ANY EXTRACTOR.** The 22
    layouts, the five Wikisource extraction faults, the per-book options and every finding behind
    them.
- `styles.css` — editorial design system; **16 themes** via CSS custom properties (`THEMES` in
  app.js — folio, synth, arcade, academy, marble, gazette, and the ten GEMSTONES added Sep 2026 on
  request: diamond, ruby, opalite, jade, emerald, amber, amethyst, aquamarine, bloodstone, carnelian.
  This line said 8 for months, and then 6, so **read `THEMES` rather than quoting it**).
  **THE GEMSTONE BLOCK IS AT THE FOOT OF `styles.css` AND CARRIES ITS OWN REASONING** — how each stone
  was read, since "inspired by the gemstone" is a judgement the next session should not have to re-make.
  Two rules from building them. **A THEME ADDS NO WEBFONT**: there is one `@import` for the whole site
  and every visitor pays for it whatever theme they wear, so the ten are set in the twenty families
  already loaded. And **A NEW THEME MUST OVERRIDE `.collection-deco`** — the base rule washes a
  collection banner in its own hue at 46–76%, which every other theme overrides, and a theme that falls
  through to it gets banners whose quiet text is unreadable. Emerald shipped that way for an hour.
  **All theme color variables are hex** (e.g. `--ink:#1B1A17`) so the canvas globe can parse and
  blend them — keep them hex, not `rgb()`/`hsl()`.
- `app.js` — all logic, written as a single IIFE (**it is the biggest file on the eager path; run
  `node .claude/check-sizes.js` for its size rather than quoting one here**). Hash-based routing via the `PAGES`
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
  2–4 on 2026-07-31) — **all 109 were there, with nothing blocked and nothing left to find**; batches 0–26 are complete.
  **That deck no longer exists**: World History was replanned on 2026-08-04 and 89 of those 109 were renumbered
  while 20 were retired, so the live figure is 89 cards all at the bar (plus Greece), and this file's `wh-NNN`
  references are the old numbering — read them through the table in `docs/world-history-card-plan.md`.
  Coverage is reported by `add-sources.js` on every run and in full by `node .claude/source-audit.js`. Its **Pilot log** records
  that batch 0 was attempted and stopped: this sandbox's egress policy blocks every scholarly host, so no
  source could be opened and none was cited. `.claude/sources-register.md` holds the verified citations
  (and, separately and clearly marked, unverified search-only candidates that must never be pasted in).
- `docs/glossary-citation-plan.md` — the batch plan for **citing the glossary**, the sibling of
  the card plan above. The bar is **at least 2 citations per term** (a description is three sentences, where
  a card's abstract is ten), and the acceptable sources are academic, museum, government or reputable
  NGO/IGO — **plus, since 2026-08-03 and on request, an encyclopedia that cites its own sources**, tested
  per article rather than per publisher (see N9's finding below: most do not).
  **THE GLOSSARY CITATION PASS IS COMPLETE: all 401 terms are cited and at the bar** (batches G1–G11, P1–P7, C0–C12, D1–D3, N1–N10), all with
  in-text markers in all ten languages. G11 COMPLETED Phase 1** (all 91 of its prehistory, palaeoanthropology,
  geological-time, peoples and physical-geography terms) **and P1 opened Phase 2** with the first six
  presidents, on the Miller Center's presidential essays; **P2 took it to Polk, P3 to Andrew Johnson, P4
  to McKinley, P5 to Hoover, P6 to Nixon and P7 to Biden, which finishes all 45**. **P1–P7 are the batches
  after G8 that correct almost nothing** — forty-five terms, fifteen clauses — because these descriptions
  were written from the same kind of institutional record the pass now cites; where a term and its citation
  come from the same kind of source, reconciliation finds little. **P2's finding is that the sources begin
  disagreeing with each other**: Harrison served "thirty-one days" per the White House Historical
  Association and "thirty-two" per the Miller Center, and the same Miller Center essay calls his post
  "governor of the **Indian** Territory" and puts Tippecanoe "in the Ohio River Valley", both contradicted
  by its own later paragraphs. A spine source is not infallible; read the whole essay, not the sentence
  that matches. Two routes it added: **a party platform is its own best citation** (the 1848 Free Soil
  platform, from UCSB's American Presidency Project, where no government page is reachable), and
  `history.house.gov`'s Historical Highlights work by the **numeric** `/HistoricalHighlight/Detail/<id>`
  path and NOT by the readable slug form, which serves an error document with a 200 status. **P3 is where
  the `Life in Brief` essay stops being enough on its own** — five of its six terms needed a second or third
  Miller Center essay, since a president between 1849 and 1869 is described by a statute, a treaty, a battle
  date or a trial, and Pierce's brief essay (the shortest of the 45, two paragraphs) carried one claim of
  eight. **P4 shows that was understated** — only two of its seven terms were carried by the brief essay
  alone, Grant took four essays, and Benjamin Harrison's Dependent Pension Act and six new states are in
  none of his essays at all and came from the Miller Center's **Key Events** timeline, which is a dated list
  of exactly the kind of claim a three-sentence description makes. **Reach for Key Events when the essays go
  quiet.** P4's own finding is the plan's Phase 2 warning arriving as written: both its corrections are on
  `Rutherford_B._Hayes`, where the term claimed "an informal bargain with southern politicians" that the
  cited essay explicitly calls doubtful, and said he "withdrew" the last federal troops where the record
  says he **ordered them to their barracks**. **P5 makes it unanimous** — none of its six was carried by the
  brief essay alone — and adds the SECOND SPINE the rest of Phase 2 needs: from 1901 a presidency turns on
  treaties and conferences, so the State Department's **Office of the Historian** carried five claims no
  presidential essay states (Portsmouth, the Fourteen Points, the League fight, the Washington Naval
  Conference, Smoot-Hawley), where P1–P4 had leaned on NARA because their claims were statutes. P5's own
  finding is what the **sibling-consistency check** is for: both its corrections are the SAME STATUTE seen
  from two sides twenty years apart — the Budget and Accounting Act of 1921 — with `William_Howard_Taft`
  credited with creating a budget system Congress explicitly refused him and `Warren_G._Harding` with
  creating a bureau no reachable source mentions (`gao.gov` is 403 here and `whitehouse.gov/omb` carries no
  history), each rewritten to what the cited essay does state. Neither was an error a source refutes; each
  was a summary reaching one step past the record, and only reading the two against each other showed it.
  It also adds a route: **when a NARA milestone slug 404s, try `docsteach.org`** — the Archives' own
  document-teaching site carried the Indian Citizenship Act with its statute citation and NARA identifier
  where `archives.gov/milestone-documents/indian-citizenship-act` does not exist. **P6's finding is about
  the five batches before it**, and it is why the plan now carries an owed **P-topup** row: every
  presidential term opens on "the Nth president, in office from X to Y", P1–P5 marked that sentence to the
  *Life in Brief*, and **most of those essays state neither the ordinal nor the term dates** (Hoover's
  contains no "thirty-first" and neither year). Not a wrong marker — the essay is about that presidency —
  but the two numbers the sentence asserts were resting on a page that does not carry them, and **the audit
  cannot see it**, since it counts citations rather than covered claims. The fix was already published:
  **the Miller Center's LANDING page for each president carries a Fast Facts block** with `President
  Number`, `Inauguration Date` and `Date Ended` outright — reach for it whenever a term opens on an
  ordinal. **The P-topup batch then cleared that debt the same day, and found nothing wrong**: the thirty
  ordinals and sixty term dates of P1–P5, checked for the first time against a page that states them, were
  right thirty times over — the one place in the pass where the prose needed no correction at all. It also
  RESOLVED two earlier findings rather than merely recording them: the Miller Center's Fast Facts gives
  Harrison March 4 → April 4, 1841, **exactly the 31 days** P2 chose over its own essay's "thirty-two", and
  gives Garfield March 4 → September 19, 1881, confirming the term's "about six months" against the essay's
  wrong "100 days". One parsing trap went with it — **Cleveland's block carries two of everything** (22 and
  24, both terms), so a script taking the first value after each label silently loses half his presidency.
  P6's own two corrections are both `Dwight_D._Eisenhower` and both from the Eisenhower
  Presidential Library: **"Supreme Allied Commander in Europe" is the NATO post he took in December 1950**,
  where his 1944 command was Supreme Commander, Allied Expeditionary Forces; and "kept military spending in
  check" is refuted by the cited essay, which says national security spending "never fell below 50 percent
  of the budget" while he cut conventional forces and built up nuclear weapons. A third clause was
  **withdrawn** rather than re-sourced — Nixon "promising order at home" is in nothing openable. The
  presidential libraries the plan named as P6's spine are only half-reachable (`jfklibrary.org` 403;
  the biography paths on `trumanlibrary.gov`, `lbjlibrary.org`, `nixonlibrary.gov` 404; `ssa.gov` 403), but
  the one that answered produced both corrections. And **check the byline**: the LBJ essays have no named
  author where every other president's do. **P7 finished Phase 2** and its four corrections are all one
  shape — **a clause claiming an ACHIEVEMENT where the cited essay describes an ATTEMPT**, which is what a
  batch of recent presidents produces: Reagan "loosened regulation" (the courts "forced the administration
  to retreat from many of its deregulatory efforts"), Clinton's EITC expansion and "time-limited
  assistance" (in no Clinton essay; the 1996 law is block grants replacing AFDC, and the essay's only "five
  years" is about immigrants' eligibility), Obama teaching "constitutional law" (he was "a lecturer at the
  University of Chicago Law School" — the institution, not the subject), and Trump's 2016 programme of
  "raising tariffs and cutting regulation" (the essay gives immigration, taxes and repealing the ACA).
  Three P7 routes worth keeping: **a superlative about a sequence is usually sourced from the essay on the
  person who broke it** (Reagan's "oldest at 69" and Biden's "oldest" are both in the TRUMP Life in Brief,
  and nowhere in their own); **an economic figure may be in no presidential essay at all** (no Miller
  Center page gives a Carter-era inflation rate — "double-digit" is sourced to Federal Reserve History's
  "The Great Inflation", which then serves Reagan too); and **reachable is not citable** — six presidential
  libraries answer here and not one carries a usable biography (JavaScript timelines, media galleries, 404
  biography paths), while the **Nobel Foundation's Carter biographical page** supplied six claims in two
  sentences. P7 also adds a THIRD variety of 200-status error document: `state.gov` and
  `2009-2017.state.gov` serve a page titled "Technical Difficulties" with a 200, and
  `whitehouse.gov/about-the-white-house/presidents/<name>/` is 404 for all nine (a 225 KB error document);
  `bls.gov` 403 and `fred.stlouisfed.org` refuses the connection. **C0 opened Phase 3 by breaking its own
  recipe, and the finding governs the remaining 191 countries: the CIA World Factbook — the plan's chosen
  Source A — is UNUSABLE**, since every path on `cia.gov` serves one identical 498,366-byte JavaScript
  shell with no country content (the word "France" appears zero times in the page served for France).
  **Source A is now UNdata** (`data.un.org/en/iso/<cc>.html`), server-rendered and per-country, whose **UN
  membership date field dates the independence of every modern state for free** — but it has no profile for
  a state without an ISO code, so `xk` (Kosovo) 500s and a state of limited recognition gets nothing from
  it. Add the **Commonwealth Secretariat** for small states (UNdata rounds Tuvalu to "10" thousand where
  the Commonwealth gives 11,790) and **Eurostat Statistics Explained** for anything sectoral in the EU
  (`iaea.org`, `iea.org` and the French energy ministry are all shut). `un.org` is reachable PATH BY PATH:
  the Charter text and UNISPAL serve real content, `/securitycouncil/*` returns a CloudFront "Request
  blocked" page **with a 200** and `/press/*` a JavaScript "Client Challenge" **also with a 200** — a
  fourth and fifth variety of 200-status error document. C0's two corrections are `Vatican_City`'s area
  (0.49 → **0.44 km²**, per the state's own governorate) and `South_Sudan`'s population (11 → **12
  million**, per UNdata) — **the second being the shape Phase 3 will keep producing, since every country
  term opens on a population that time moves past.** Its other honest output is a long list of clauses left
  UNMARKED and recorded in full in the register: where a claim is an act of state — a treaty, a resolution,
  a court ruling, an accession — it is citable and usually easy; where it is landscape or long history, it
  usually is not. **C1 then ran that recipe at scale and it held**: fifteen EU states on THREE works
  (UNdata, the EU's own country pages, NATO's member table) at two fetches each, **33 citations and no
  corrections**. The EU country page is the second source the recipe needed — Capital, Geographical size,
  Population and **"EU Member State : since <date>"** in one block, which dates the accession clause that is
  usually the only datable claim in a European term's third sentence. Sixteen areas and populations were
  checked against both sources and **every one held** — every area within 0.6% and most within 0.05%, which
  is the land-vs-total-area spread, not a contradiction. Two divergences that look like errors and are not:
  **the EU counts only the government-controlled area of a divided state** (Cyprus 979,865 against UNdata's
  1,371 thousand for the island — cite UNdata there), and **UNdata is sometimes the outlier** (Czechia
  10,609 thousand against the EU's and the term's 10.9 million), so **read both before assuming the prose is
  wrong**. C1's own finding is a limit: **a country term written without figures is invisible to this
  recipe** — `Greece` states no area, population or capital and was DEFERRED rather than given two sources
  nothing points at, which matters because several of the twelve long-form countries are the same shape.
  **C2 then nearly paid for C1's caution and turned it into a rule**: on `Malta`, `Portugal` and `Spain` the
  EU page's population would have made the term look wrong and UNdata confirms it (Spain 49,077,984 against
  UNdata's 47,890 thousand and the term's "roughly 48 million"), so **a batch run on the EU page alone would
  have produced three corrections, every one an error introduced rather than removed**. Read BOTH before
  concluding a figure is wrong; the disagreement between two official sources is routinely larger than the
  term's error. C2 also met the first wide area spread — the Netherlands' 41,850 km² against the EU's
  37,391, which is total against land area for a country a fifth water, and not a contradiction. Its six
  DEFERRALS name the recipe's limit: `Albania` (UNdata's 2,772 thousand contradicts the term's 2.4 million,
  and INSTAT's census pages don't carry the figure in their HTML — so a marker there would point at a work
  that refutes the sentence), and `Iceland`/`Norway`/`Switzerland`/`Andorra`, where UNdata confirms every
  figure but is only ONE source and the natural second is shut (`efta.int` and `coe.int` are both 403).
  **C3 then measured how far that goes: four of nineteen shipped and fifteen wait.** Outside the EU there is
  NO second institutional profile — `efta.int`, `coe.int`, `admin.ch`, `althingi.is` and `mfa.gr` are all
  403 — so the second source is per country, per claim, and exists only where the third sentence names a
  DATABLE ACT. The four that shipped are exactly those: Bosnia on the OSCE's Dayton page, North Macedonia on
  NATO's member table (2020), Norway on Norges Bank Investment Management (which calls the fund "one of the
  world's largest"), Ukraine on **General Assembly resolution ES-11/1** of 2 March 2022. **Read the third
  sentence first and ask what act it names**: a treaty, accession, resolution or founding has a source; a
  dynasty, a language family or a mountain confederation does not. Two C3 deferrals are warnings rather than
  gaps. **The UN membership date does NOT date independence for the Soviet founding republics** — `Belarus`
  and `Ukraine` both show 24 October 1945, because Byelorussia and Ukraine held UN seats in their own right
  from 1945, so a marker there would date the USSR's seat and not the 1991 independence the term claims. And
  **`United_Kingdom` is blocked by a SPLIT fault**: its Japanese translation runs to four sentences where
  the other nine run to three, so markers placed by sentence index would land on different claims — the
  first time the country pass has hit batch 24's failure, and the reason to **run `split-abstract.js` over a
  batch's terms before planning its markers**, which C0–C2 passed by luck rather than by rule. `Greece` has
  now been deferred THREE times (no area, no population, no capital; `mfa.gr` 403) and needs a rewrite or a
  new class of source rather than a fourth deferral. **C4 found the bloc profile the recipe needs OUTSIDE
  Europe: the Commonwealth Secretariat's country pages**, whose Key Facts block carries Population, Area,
  Capital city and the year of joining WITH its independence context in one line ("1947, following
  independence from Britain"; "1965, on leaving the Federation of Malaysia") — the same shape as the EU's
  accession field, from a body covering 56 states across Asia, Africa, Oceania and the Caribbean, which is
  most of the rest of Phase 3. **But the joining line is not always the independence line**: Bangladesh's
  gives 1972 against the term's 1971, and UNdata's UN membership date (1974) is later still, so BOTH
  institutional dates postdate the independence they follow and that sentence was left unmarked. C4 also
  settles the read-both rule beyond argument by breaking it in **opposite directions in one batch**:
  Pakistan's area is 796,095 km² at UNdata and 882,000 at the Commonwealth (the Kashmir question — a
  political fact, not a measurement convention, and the widest divergence in Phase 3), where the term
  matches the Commonwealth; India's is 3,166,391 at the Commonwealth and 3,287,263 at UNdata, where the term
  matches UNdata. Either source alone would have produced a wrong correction on one of two neighbours.
  **C5 then probed the three blocs C4 named and all three fail**: `asean.org` returns 307 on every path
  including the root, and the OIC, the Gulf Cooperation Council and the League of Arab States publish no
  per-country profiles — so **Asia outside the Commonwealth has no bloc profile** and is C3's position one
  continent over. Its four shipped terms all came through C3's act-of-state rule, and three of the four
  second sources are **UN instruments served by `documents.un.org` and UNISPAL** where `un.org`'s topic
  sections are CloudFront-blocked (GA resolution 181 (II) for Israel, SC resolution 1272 for East Timor),
  plus the **Office of the Historian's Korean War milestone, which cites BOTH Koreas from one page**. C5's
  own rule comes from the **United Arab Emirates**: UNdata gives 71,024 km² against the term's 83,600, a
  **17% gap — the widest in Phase 3** — with no second official source to break the tie, so the term was
  DEFERRED rather than corrected. **When UNdata is the only profile and disagrees by more than a rounding,
  defer; never correct on one source.** Two smaller notes: `China`'s figures match UNdata exactly and the UN
  Charter names it a permanent Security Council member, but its term never mentions the Council, so **an
  open, authoritative source about the right country is still not a source for a claim the term does not
  make**; and `Taiwan` is the SECOND split fault after `United_Kingdom` (Japanese runs to four sentences
  where the others run to three), which settles that **`split-abstract.js` must be run over a batch's whole
  term list before its markers are planned**. **C6 ran that check FIRST and it paid at once** — `Lesotho`
  splits into four sentences in German and `Malawi` into four in Chinese, both removed before any research
  was done, where `United_Kingdom` and `Taiwan` were caught after theirs. Four faults in four batches makes
  it a standing step. C6 also MEASURED C4's joining-line rule across thirteen African Commonwealth states:
  **it is the independence line eleven times in thirteen** (Ghana 1957 through Namibia 1990, all marked),
  and the exceptions have a shape — **`Mozambique` (joined 1995) and `Rwanda` (joined 2009) were never
  British**, so their joining line dates an accession, not an independence; `South_Africa` left and rejoined;
  and **`Cameroon` is the near-match to withhold on**, since the years agree but the term describes French
  and British portions independent in 1960 and 1961 joining together, which the Commonwealth's single line
  does not describe. Its populations all sit BETWEEN the Commonwealth's 2022 figures and UNdata's 2025 ones,
  which is what a term written from a recent-but-not-current estimate looks like and is not an error.
  **`Kenya` is the Greece shape and its recurrence is the thing to carry forward**: both state no area, no
  population and no capital, and both are among the twelve countries the plan calls "written earlier and at
  greater length" — that length is extra PROSE, not extra FIGURES, which is what makes them invisible to a
  recipe built on statistical profiles. Expect the same of the remaining ten.
  **C7 then found the source that opens the rest of Phase 3, and it is not a statistical profile.** The
  Office of the Historian's **`history.state.gov/countries/<slug>`** — *A Guide to the United States'
  History of Recognition, Diplomatic, and Consular Relations, by Country, since 1776* — has a page for
  **every state in the world**, and its Recognition section states in prose when a country became
  independent and from whom. C3's "outside the EU there is no second European profile" and C5's "Asia
  outside the Commonwealth has no bloc profile" both stand for FIGURES and are now largely beside the
  point, because **the third sentence of a country term is almost always an independence date** and this
  guide carries it everywhere: it gave `Somalia` two of its three historical claims from one page, both
  halves of `Kenya`'s "British control in the late 19th century … independent in 1963" (dating the
  colonial rule to 1895), and the colonial names — Basutoland, Nyasaland, Tanganyika, Togoland — several
  terms turn on. It is written from the American point of view, so a date is often a *recognition* date;
  cite it only where the page states the event beside it. C7's own rule is a limit on markers: **where a
  profile carries a term's FIGURES, marking the figure sentence to it is the C1–C6 practice and continues;
  where it carries only UNdata's Region field, it has not earned a sentence** that also asserts a plateau,
  a rift valley and a lake — which is how `Kenya`, deferred three times, finally shipped, by DROPPING the
  source that had nothing to say about it rather than by finding a figure. Its one correction (`Togo` 9 →
  **8.6 million**) is right because BOTH sources agree against the term, while `Gabon` (2.4 against 2.593)
  and `Somalia` (18 against 19.655) were **not** corrected — UNdata alone, so C5's UAE rule holds and C0's
  South Sudan correction stays the exception. Two Commonwealth slugs were recovered by the rule that **the
  slug follows the member's FORMAL name** (`united-republic-tanzania`, `kingdom-eswatini`), which retires
  C6's Tanzania deferral; and **a member admitted recently has a page but not a profile** (Gabon's says
  only that it joined in June 2022, with "No data found" where the population belongs). Its three
  deferrals — `Egypt` (107 against 118.4 million, a **10.6% gap, the widest in Phase 3**, and a live
  UN-against-national disagreement rather than an error), `Ethiopia` and `Libya` — are all one shape: a
  figure diverging from UNdata with no second profile, over a third sentence too ancient for the
  recognition guide. `whc.unesco.org` is **403**, `au.int` publishes no country pages and `afdb.org` /
  `oecd.org` are 403, so the AU is not a bloc profile either; `icj-cij.org/case/<n>` is 200 and usable.
  **C7 also ran the split audit over the WHOLE glossary rather than its own list, and that is the version
  to keep**: it found seven faults of two kinds, both now fixed, leaving **0 of 333**. Five were one
  authoring fault — **the Chinese rendered an English semicolon as a full stop**, turning three sentences
  into four on `United_Kingdom`, `Taiwan`, `Malawi`, `New_Zealand` and `Papua_New_Guinea` and nothing else
  — which **unblocks `United_Kingdom` (deferred in C3) and `Taiwan` (C5)** and clears two Oceania terms
  before C10 reaches them; **check a term whose English uses a semicolon.** Two were a splitter gap:
  German writes a regnal number as a Roman numeral with a trailing period ("König Leopold **II.** von
  Belgien", "Moshoeshoe **I.** in den 1820er Jahren"), which the existing German guard could not see since
  a Roman numeral is not `\d` and no determiner precedes it. `split-abstract.js` now holds a Roman numeral
  that follows a capitalised NAME and is followed by a LOWERCASE word — the test that tells a mid-sentence
  regnal number from a sentence genuinely ending on one — verified against all 109 cards in all ten
  languages with no regressions. **Four of the five Chinese faults sat in terms nobody had reached yet**,
  where a batch-scoped check would have found them only after the research was done.
  **C8 then turned C7's find into a two-fetch RECIPE FOR ANYWHERE** — UNdata for the figures,
  `history.state.gov/countries/<slug>` for the history — and ran it over fourteen African states in
  neither the EU nor the Commonwealth, exactly the position C3 and C5 called sourceless. Its finding is
  about figures and it changes how a divergence is read: **a population that disagrees with UNdata is
  usually STALE rather than contested, and you can PROVE which.** The World Bank API
  (`api.worldbank.org/v2/country/<ISO3>/indicator/SP.POP.TOTL?format=json&date=2015:2025`) returns the
  whole series, and thirteen of C8's fourteen terms turned out to state **an earlier point on that same
  series** — Egypt's "107 million" is the 2019 value to two decimals, Chad's "18 million" the 2022 value,
  DR Congo's "105 million" the 2023 value — so they were not disputing UNdata, they were written from it
  years ago. All thirteen were updated to the 2025 figure in ten languages. **Before deferring on a
  population, ask the series when the term's figure WAS true: if it names a year, the figure is stale and
  updating it is safe; if it names none, the figure is contested and C5's rule stands.** Two cautions.
  **The World Bank is NOT a second source for a population** — `SP.POP.TOTL` relays the UN's own estimate
  (21,003,705 for Chad against UNdata's 21,004 thousand, the same number), so citing both would be false
  corroboration; it is a diagnostic and belongs in no source list. And **this revises C7's Egypt
  deferral**, which read 107-against-118 as a UN-against-national disagreement — it was simply six years
  old, and Egypt is cited in C8. Its one non-figure correction is `Djibouti`, "French Somaliland until
  independence in 1977" → **"ruled by France, latterly as the French Territory of the Afars and the
  Issas"**, that being the territory the guide names at the date the term gives. `Comoros` is deferred for
  two reasons at once, both worth knowing: its 1,861 km² counts the islands it governs where UNdata's
  2,235 counts the archipelago **including Mayotte** (C1's Cyprus case in reverse), and **a recognition
  date is not an independence date** — the guide records U.S. recognition in 1977 against the term's 1975.
  Slugs: the two Congos are **`congo-democratic-republic`** and **`congo-republic`**, and the index at
  `history.state.gov/countries` resolves any in doubt. The API serves a **UTF-8 BOM** (decode `utf-8-sig`)
  and returns an empty body under rapid repeats, which retries fix.
  **C9 finished Africa (56 of 56) and found the second source for AREA.** C8's caution was that
  `SP.POP.TOTL` relays the UN's own population and so cannot corroborate it; **`AG.SRF.TOTL.K2` is a
  different series** (World Bank via the FAO, not the UN Statistics Division) and it **resolved both
  standing deferrals in the same direction — the term was right and UNdata was the outlier**. `Libya`,
  deferred in C7 on a 5.0% gap, states 1,759,540 km², the World Bank's figure exactly, against UNdata's
  1,676,198; `Comoros`, deferred in C8 because UNdata's 2,235 km² counts Mayotte, states 1,861 km², again
  the World Bank's figure exactly. **When UNdata's area looks wrong, ask `AG.SRF.TOTL.K2` before
  deferring** — and pass a SEMICOLON-SEPARATED country list in one request, which is also the way round
  the API's empty-body behaviour under rapid single fetches. Elsewhere the two agree within 0.05%, which
  is what makes those two meaningful, and the line C9 draws is: **correct an area only when the term falls
  OUTSIDE the spread of the two sources** — `Ivory_Coast` (322,463 against 322,462 and 322,460) falls
  inside and was left, `Senegal` (196,722 against 196,712 and 196,710) falls outside and was corrected.
  Its other corrections are thirteen more stale populations by C8's method (`Tunisia` alone still current)
  and one date narrowed: **`Madagascar`'s "France conquered it in 1897" → "in the 1890s"**, the guide
  giving 1890 for the protectorate against 1897 for the annexation — two different acts, so batch 16's
  rule applies and the decade is what the source will bear. Two things to carry: **four UN membership
  dates do NOT corroborate an independence year** (Mauritania 1961 against 1960 and Libya 1955 against
  1951, both Cold War admission deadlocks, plus Liberia and Ethiopia at 1945) — C3 found this for the
  Soviet founding republics and the deadlock is the other family; and **`Sudan`'s UNdata profile has no
  Surface area field at all**, the only one in Phase 3 that omits one, so its 1,861,484 km² rests on
  nothing openable here. Côte d'Ivoire's guide slug is **`cote-divoire`**.
  **C10 finished OCEANIA on three sources at once** — UNdata, the Commonwealth and the recognition guide,
  ten of its thirteen being Commonwealth members and all thirteen having a guide page. The three do
  different jobs and `Australia` shows it: the guide states "On January 1, **1901**, six colonies were
  joined together to create the Commonwealth of Australia", the term's whole third sentence, where the
  **Commonwealth's own joining line gives 1931 and the Statute of Westminster** instead. Its finding is a
  contrast: **C8 and C9 corrected twenty-six populations between them and C10 corrected three** — not
  better editing but arithmetic, since **a figure rounded to two significant figures survives a decade of
  slow growth** and these populations are small and flat or falling where Africa's are large and growing
  at 2–3% a year. `Marshall_Islands` is the case to remember: its 40,000 was stale by being **too HIGH**
  (48,800 in 2015 down to 36,282 in 2025 as people leave under the Compact), so **"out of date" must not
  be read as "too low"** — C8's diagnostic runs both ways. C10 also **qualifies C9's area rule**: the
  World Bank ROUNDS small areas to the nearest 10 km² (Tonga 750, Kiribati 810, Nauru 20), so its figure
  is an interval, not a point; `Fiji` was corrected 18,274 → **18,272** because UNdata *and* the
  Commonwealth both give that precisely and 18,274 is outside 18,270 ± 5 as well. Three source
  disagreements are recorded and each was decided on the majority: **`Kiribati`'s area** (UNdata's 726 km²
  against 811 at the Commonwealth, 810 at the World Bank and 811 in the term — so **UNdata is dropped from
  that term outright**, the first time Phase 3's Source A has been); **`Solomon_Islands`' area** (the
  Commonwealth's 30,407 the outlier against ~28,896, so its citation carries only the third sentence); and
  **`Palau`'s capital** (the term's Ngerulmud against UNdata's Melekeok — the seat of government against
  the state it stands in, recorded not corrected). Micronesia's guide slug is simply **`micronesia`**.
  **C11 (North and Central America and the Caribbean, twenty terms) found the sharpest limit on the
  recognition guide: it dates by U.S. RECOGNITION, and in Spanish America that is not independence.**
  Mexico was recognised in **1822** against independence in 1821, the Central American states through the
  Federation in **1824**, Haiti in **1862** against 1804, the Dominican Republic in **1866** against 1844.
  Where a page happens to state the independence year separately it still works (Guatemala's "Following
  its independence from Spain in 1821", Haiti's "won independence from France in 1804"); where it does
  not, it cannot carry the term's date, and **grepping the saved HTML for the year is the two-second
  check**. `Mexico`, `Costa_Rica` and `Nicaragua` are deferred on exactly that — and **`Costa_Rica` is
  the one not to paper over**, since its page does not merely omit 1821 but says Costa Rica "did not
  formally declare its independence until **August 30, 1848**"; both dates are defensible and the term
  needs a prose reconciliation rather than a citation. **The United States has no page in the guide** (it
  is written from the United States outward), so its third sentence is carried by **NARA's Milestone
  Document for the Declaration of Independence** and the guide's **Treaty of Paris, 1783** Milestone.
  C11's second finding is a caution on C9's tool: **the World Bank's area series contains outright
  ERRORS** — Canada at **15,634,410 km²** against the true 9,984,670, and the Dominican Republic at
  **146,839** from 2019 against 48,671 with its own 2018 value at 48,670 — so **apply a plausibility
  check before letting it adjudicate**. And the population diagnostic **said "do not touch" for the first
  time**: `Cuba`'s term says 9.4 million against UNdata's 10,937 thousand, a 14% gap, but the World Bank
  series never passes through 9.4 million (11.23 m in 2018 down to 10.94 m in 2025), so by C8's own test
  the figure is **contested, not stale**, and was left alone. Three more where UNdata is the outlier and
  the term stands: `Trinidad_and_Tobago` (1,511 thousand against 1.37–1.4 million at the World Bank and
  the Commonwealth), `Canada` and `United_States`, whose terms sit with the national estimates. Its eight
  corrections are five stale populations, **`Barbados` 270,000 → 280,000** (three sources above the term)
  and **`Saint_Vincent_and_the_Grenadines` 110,000 → 100,000** — the C10 falling-population pattern *with
  the corroboration attached*, the Commonwealth's 2022 figure of 110,900 showing the term was right when
  written — plus one area, `Panama` 75,417 → **75,320**. Slug note: **the two sites spell the same states
  differently** (`st-kitts-and-nevis` at the Commonwealth against `saint-kitts-nevis` at the guide), and
  both publish an index worth grepping.
  **C12 (South America, twelve terms) REFINED C11's warning rather than repeating it.** C11 concluded the
  recognition guide is unusable for Spanish America; **the same guide states the independence year
  outright on nine of twelve South American pages** — Colombia "by 1819", Peru "in July 1821 under
  General San Martin", Bolivia "on August 6, 1825", Paraguay "on May 15, 1811", Argentina "in 1816",
  Uruguay "in 1828". The difference is structural: **those pages open with a sentence of CONTEXT before
  the recognition paragraph, and that sentence carries the date**, where Mexico's, Costa Rica's and
  Nicaragua's have none. So the rule is **"the recognition date is not an independence date — read the
  summary paragraph"**, with a grep of the saved HTML as the check. **`Venezuela` is saved by a
  preposition**: the guide says independence was achieved "by 1819" and the term says "by 1821", and
  *achieved by 1819* entails *achieved by 1821* — where "in 1819" against "in 1821" would have been C6's
  Cameroon near-match. Two terms had no history source and still reached the bar: **`Brazil`**, whose
  third sentence is left unmarked and which is carried by its FIGURES (UNdata and the World Bank's area
  series both giving ~8.51 million km², independent measurements rather than one relayed) — **a term can
  reach the bar on its first sentence alone when the second source measures rather than relays** — and
  **`Chile`**, where the country page gives 1810 and not 1818 but the **Milestone** "The Allende Years and
  the Pinochet Coup, 1969–1973" carries the term's other claim. **When a country page will not date the
  independence, look for a Milestone on the term's other claim.** Its largest correction is the largest
  area correction of Phase 3 — **`Ecuador` 283,561 → 257,217 km²**, UNdata and the World Bank agreeing
  within 0.3% and the term 10% above both (a pre-1998-border-settlement figure is the plausible
  explanation, recorded as a hypothesis and NOT cited). And **UNdata was the outlier three times in four**
  on area (`Venezuela` between the two, `Argentina` and `Uruguay` matching the World Bank), which with C9's
  Libya and C10's Kiribati settles that **Source A is a source, not an authority**.
  **D1 cleared the whole European deferral list (nineteen terms) and completed EUROPE**, using tools
  that did not exist when C2, C3 and C5 deferred them — the recognition guide (C7) and the World Bank's
  two series (C9, C11). It opens with a correction to the pass's own bookkeeping: **C9 claimed Africa
  complete at 56 of 56 and it was 55**, because `Cape_Verde` never appeared in any batch's list — the
  country lists from C7 onwards used the UN's spelling *Cabo Verde* against the glossary key
  `Cape_Verde`, so it matched nothing and nobody noticed. **Derive a batch's list from the glossary's own
  keys (`gloss-source-audit.js`'s uncited list), never from an outside list of country names.** Its
  finding revises C8: **`SP.POP.TOTL` is NOT always the UN's number.** Where a country runs its own
  statistical service the World Bank uses that instead, and `Albania` (2,349,580 against UNdata's
  2,772,000) and `Moldova` (2,360,527 against 2,996,000) both match the TERM while UNdata is the outlier
  — which is exactly why C2 deferred Albania, reading a 13.4% gap as the term being wrong. Both now cite
  the World Bank and drop UNdata entirely. **Check whether the two actually agree before treating the
  World Bank's population as a relay.** D1 also **retires the Greece shape** — a country term stating no
  area, population or capital, deferred four times — by REWRITING the opening sentence to state the
  figures its 195 siblings state: `Greece` gains 131,957 km² and Athens, `Georgia` gains 69,700 km²,
  3.8 million and Tbilisi. **No population was added to Greece** (UNdata 9,939 thousand against the World
  Bank's 10,413,962, a 4.8% gap it would be arbitrary to resolve). These are logged as rewrites, not
  corrections — nothing either term said was wrong. Its two real corrections are `Switzerland` 41,285 →
  **41,291** and `United_Kingdom` 244,376 → **243,610**; and `Monaco` at **75 km²** is the third outright
  World Bank area error after C11's Canada and Dominican Republic.
  **D2 cleared the ASIAN deferral list — thirty-one terms, thirty of them on the same two fetches** —
  which retires C5's "Asia outside the Commonwealth has no bloc profile" the way C8 retired C3's and C5's
  equivalents for Africa: the claim was true and is beside the point, since UNdata plus the recognition
  guide carries everything. Only `Bhutan` has no guide page (C12's `Brazil` pattern, figures alone).
  **Myanmar's guide slug is `burma`.** It resolves **C5's UAE deferral by C5's own rule**: UNdata's
  71,024 km² against the term's 83,600 was "the widest gap in Phase 3" with no second source, and the
  World Bank's **98,648** puts the term BETWEEN the two, so it stands untouched — the instinct was right
  and only the second source was missing. Twelve populations were corrected, **`Yemen` 34 → 42 million**
  being the largest of the pass, but **`Lebanon` was withheld**: its 5.5 million sits 6.4% below both
  sources and yet the series never passes through 5.5 (6.5 m in 2015 down to 5.7 in 2020–22), so it is
  contested rather than stale. After C11's Cuba that is the second withholding, and both are countries
  whose population is argued about rather than counted. **`Taiwan` is deferred for a reason worth stating
  precisely**: no UNdata profile (a 500, as Kosovo's `xk` gives), no guide page and no World Bank series
  — all three of Phase 3's sources are organised around UN membership, so a state outside the UN system
  is invisible to every one of them, and it needs a different CLASS of source rather than more searching.
  Its five area corrections leave `Iran` alone as inside the widest source disagreement of the pass
  (UNdata 1,630,848 against the World Bank's 1,745,150, 7% apart, the term between them).
  **D3 FINISHED THE PASS at 333 of 333.** `Costa_Rica` got the prose reconciliation C11 called for
  rather than a citation — "independence from Spain came with the rest of Central America in 1821 and
  Costa Rica declared itself a separate republic in 1848" — with each half cited, the 1848 to its own
  page and the 1821 to the guide's **El Salvador** page, whose sentence is explicitly about "the other
  Central American provinces" and so serves `Nicaragua` too. (C11 saw that route and left it because a
  citation headed "…: El Salvador" on a Nicaragua term reads like a filing error; it is used, and the
  register says why.) **`Mexico` is cited on its figures with the independence clause unmarked** —
  nothing openable here dates Mexican independence to 1821, `loc.gov` being 403 — and its World Bank
  citation NAMES THE YEAR 2019, because that series gives 1,964,380 for 2018–19 and drifts to 1,957,194
  by 2023 with no explanation, the same movement that proved to be error for Canada, the Dominican
  Republic and Monaco. **`Taiwan` was cited without any of Phase 3's three sources**, all of which are
  organised around UN membership: the way in was the guide's **Milestones**, which are about EVENTS
  rather than states ("The Chinese Revolution of 1949" and "The Taiwan Strait Crises"), with its figures
  left unmarked since `taiwan.gov.tw` is 403 and the reachable Taiwanese statistical sites are
  JavaScript-driven. **A term can be cited on its history alone when its figures have no openable
  source** — the mirror of C12's `Brazil`.
  P3 also refines the `senate.gov` warning:
  its **impeachment** pages are real, its party-history and vice-president paths are the shell, and **the
  shell is a constant 37,523 bytes**, so a size check tells them apart instantly. Three access findings from it govern the rest of Phase 2 and Phase 3:
  **a URL containing a closing parenthesis cannot be cited** (`SRC_URL_RX` stops at `)`, which rules out
  every congressional bioguide address — **and the same is true of an APOSTROPHE**, the class being
  `[^\s<>"')\]]`, which bit twice in Aug 2026 while illustrating psychology cards: the obvious Commons
  page for Kant carries parentheses and the obvious one for Broca's area carries an apostrophe, so both
  credit lines would have shipped truncated. **Check a Commons page URL for `'` and `()` before choosing
  the file**, since a picture is usually replaceable and the credit line is not optional), **`senate.gov` serves its 404 page with a 200 status**, and
  **`monticello.org` and `founders.archives.gov` are closed here** — so Founders Online, named as a
  second-source spine in the plan, is not usable and the NARA milestone documents replace it. G9's finding held into G10 and G11 and is now a law of the pass:
  the register pays for taxa and periods and **not** for peoples, places or objects, so 24 of G9's 26 and
  18 of G10's 20 works were new — and where no reachable source uses a familiar term of art (there is no openable
  qualifying source here that says "potlatch"), the prose says what the cited source says rather than
  keeping the word over a citation that does not contain it. **G10's own finding re-cut the rest of Phase 1**:
  its planned 17 terms split down the line between claims that are MEASURED RESULTS (citable from here — ice
  thickness, a population, an ocean's depth) and claims that are CONVENTIONS OR CONSTANTS (not — "Europe is a
  continent", the equator's circumference, a hemisphere's land fraction), so the six continents, `Sicily`,
  `Equator` and the two hemispheres became **G11**. It is card batch 2's rule in a new dress: subject does not
  predict reachability, the KIND of claim does. **G11 then proved the split both ways**: every convention it
  met was citable — Mortimer et al.'s Zealandia paper states the criteria for calling something a continent
  because it is arguing a contested case, and names the six geological continents as including **Eurasia**,
  which is one open work carrying a sentence on six of its ten terms — while every constant was not, and is
  recorded unmarked. Its own finding is about a figure rather than a term: **no reachable authority publishes
  a continent's AREA, and the obvious one is actively wrong** — the UN's M49 scheme assigns whole countries to
  regions and so puts all of Russia in Europe, giving Europe 22.1 and Asia 31.0 million km² against the
  conventional 10.2 and 44.5. Cite the UN's Demographic Yearbook Table 1 for POPULATIONS, never for area. Two things about this pass that the card pass does not have: a term whose
  prose is corrected — or whose markers are placed — needs a second command in the same
  batch (`add-lang.js` for the nine languages, since `add-sources.js` writes only the English description);
  and Phase 1 is largely paid for out of `.claude/sources-register.md` already.
  (**Markers were OPTIONAL on a term through G1–G4 and are now REQUIRED**, changed on request 2026-08-01
  when the reader asked where the numbers were: lists had grown to five and six sources, at which size the
  list stops explaining itself, and a reader arriving from a fully-marked card read the vanishing numbers
  as the apparatus giving up. `add-sources.js` refuses an unmarked term or an unreferenced source, exactly
  as for a card; `add-lang.js` warns on a translation whose markers differ from the English, and
  `gloss-source-audit.js` reports both standing.) It also records which
  scholarly and official hosts were **reachable from this sandbox on 2026-08-01**, measured rather than
  assumed. **Batch G0 (tooling) has shipped**: `GLOSS_SRC_TARGET = 2` sits beside `SRC_TARGET` in app.js and
  is sliced out of it by text by `.claude/gloss-source-audit.js` (the mirror of `source-audit.js`, plus a
  `--tag=` filter and two checks a two-source list makes easy to fail — not-majority-open, and a citation
  with no access label) and by `add-sources.js`, which now warns a short term and reports glossary coverage
  against the bar. The **admin glossary list carries a coverage chip** like the card list, in two states
  rather than three (no `sourcesBlocked` on a term) and never on a deck term. Not part of the site.
- `docs/greece-card-plan.md` — the **1000-card running order for the Ancient Greece collection**
  (`col-13`): every card's number, topic and deck, fixed in advance across 19 leaf decks, so the deck
  can be grown one card at a time over many sessions. See the "ANCIENT GREECE" bullet under "Generating
  cards & glossary entries" for the workflow — the short version is that the next card to write is the
  lowest `gr-NNN` not yet in `data.js`. Not part of the site.
- `docs/world-history-card-plan.md` — the **1000-card running order for the World History collection**
  (`col-8`): every card's number, topic and deck, fixed in advance across 8 decks and 39 leaf subdecks,
  so the collection can be grown one card at a time over many sessions. The sibling of the Greece plan
  and used the same way — the next card to write is the lowest `wh-NNN` not yet in `data.js` — see the
  "WORLD HISTORY" bullet under "Generating cards & glossary entries". It also holds **the 2026-08-04
  renumbering record**: the collection was replanned from scratch on request, 89 of the 109 shipped
  prehistory cards were renumbered into their planned slots and **20 were retired**, and that file has
  the old→new table every earlier document's `wh-NNN` references must be read through. Not part of the
  site.
- `docs/rome-card-plan.md` — the **1000-card running order for the Ancient Rome collection** (`col-40`):
  every card's number, topic and deck, fixed in advance across 7 decks and 25 leaf subdecks, so the
  collection can be grown one card at a time over many sessions. The third of the planned collections and
  used exactly like the other two — the next card to write is the lowest `rm-NNN` not yet in `data.js` —
  see the "ANCIENT ROME" bullet under "Generating cards & glossary entries". **No card has been written
  yet**: the plan and the tree shipped together on 2026-08-06 and the collection starts at `rm-001`. Not
  part of the site.
- `docs/russia-card-plan.md` — the **1000-card running order for the Russia collection** (`col-42`): every
  card's number, topic and deck, fixed in advance across 9 decks and 29 leaf decks, so the collection can be
  grown one card at a time over many sessions. The fourth of the planned collections and used exactly like
  the others — the next card to write is the lowest `ru-NNN` not yet in `data.js` — see the "RUSSIA" bullet
  under "Generating cards & glossary entries". **No card has been written yet**: the plan and the tree
  shipped together on 2026-08-06 and the collection starts at `ru-001`. It is the first plan that has to
  set **date, name and transliteration conventions** (the Julian/Gregorian gap, Kyiv against Kiev), and the
  first whose subject reaches the present day — read its "History, not archaeology" and "Sourcing" sections
  before writing anything after 1917. Not part of the site.
- `docs/india-card-plan.md` — the **1000-card running order for the India collection** (`col-43`): every
  card's number, topic and deck, fixed in advance across 9 decks and 31 leaf subdecks, so the collection
  can be grown one card at a time over many sessions. The fifth of the planned collections and used
  exactly like the others — the next card to write is the lowest `in-NNN` not yet in `data.js` — see the
  "INDIA" bullet under "Generating cards & glossary entries". **No card has been written yet**: the plan
  and the tree shipped together on 2026-08-06 and the collection starts at `in-001`. Read its "What this
  collection is about" section before writing anything — the subject is the SUBCONTINENT before 1947 and
  the Republic after, and getting that wrong makes a political claim without noticing. Not part of the site.
- `docs/china-card-plan.md` — the **1000-card running order for the China collection** (`china`): every
  card's number, topic and deck, fixed in advance across 7 decks and 39 leaf decks, so the collection can
  be grown one card at a time over many sessions. The sixth of the planned collections, and **the only one
  written onto a tree that already existed** — the dynastic tree is kept and the four changes made to it
  are listed at the top of the file. The next card to write is the lowest `cnh-NNN` not yet in `data.js`;
  see the "CHINA" bullet under "Generating cards & glossary entries". **`cnh-001` to `cnh-040` have
  shipped** (Aug 2026)
  and the rest of the collection is open ground. **The `placeholder: true` that had held it back was
  CLEARED on request in Aug 2026**, so the forty cards now reach the daily review, the games, the card of
  the day and study deep links, and the collection sits under Collections rather than Planned. Its
  thirty-eight EMPTY decks are still coming-soon, automatically — `isComingSoon` is `!!node.placeholder ||
  subtreeCardIds(node).length === 0`, so a deck earns its place by holding a card and nothing has to be
  un-flagged deck by deck. Not part of the site.
- `docs/egypt-card-plan.md` — the **1000-card running order for the Ancient Egypt collection** (`egypt`):
  every card's number, topic and deck, fixed in advance across 9 decks and 26 leaf subdecks. The seventh of
  the planned collections and **the only one that created its own collection** — Rome, Russia and India were
  empty nodes waiting for a tree and China had one already, where Egypt had nothing, so the collection node,
  its tree and its `COLL_THEME` hue ship with the plan. The next card to write is the lowest `eg-NNN` not
  yet in `data.js`; see the "ANCIENT EGYPT" bullet under "Generating cards & glossary entries". **No card
  has been written yet.** Not part of the site.
- `docs/japan-card-plan.md` — the **1000-card running order for the Japan collection** (`japan`): every
  card's number, topic and deck, fixed in advance across 9 decks and 34 leaf decks. The tenth of the
  planned collections and the third (after Egypt and the Second World War) to **create its own
  collection** — node, tree, `COLL_THEME` hue and numeral system ship with the plan. It is the **first
  collection since China to get a `COLLECTION_NUMERALS` entry**, `"ja"`, and the reasoning is in the
  plan: Japanese counts in the same kanji so `cnNumeral()` is reused, but the `"zh"` KEY must not be,
  since it also selects `var(--han)` — a Simplified Chinese face. The next card to write is the lowest
  `jp-NNN` not yet in `data.js`; see the "JAPAN" bullet under "Generating cards & glossary entries".
  **No card has been written yet.** Not part of the site.
- `docs/psychology-card-plan.md` — the **1000-card running order for the Psychology collection**
  (`psych`): every card's number, topic and deck, fixed in advance across 9 decks and 38 leaf decks.
  The twelfth of the planned collections, the fourth to **create its own collection** (node, tree,
  `COLL_THEME` hue and a new `ICON_SYMBOLS` mark ship with the plan) and **the first that is not a
  history collection at all**. **It is EXCLUDED from the no-researchers-in-a-question rule and from
  the two-scholar cap, on request** — see that rule's own bullet under "Generating cards & glossary
  entries", and the plan's section on what the exclusion does and does not license. Its three
  load-bearing rules are that **a card on a classic finding states that finding's current evidential
  standing** (eleven deliberate study/what-happened-to-it PAIRS are listed there), that **a disorder
  card describes and never diagnoses** — both classifications named, no checklist a reader can score
  themselves against — and that **a finding is described with the people it was found in**, which is
  the psychology form of the history plans' rule about a state's account of itself and the easiest one
  here to break by accident. The next card to write is the lowest `ps-NNN` not yet in `data.js`; the
  index table under "THE SIXTEEN PLANNED COLLECTIONS" is the lookup, and carries the count. **Its first
  cards have shipped**, so the collection is live — `isComingSoon` is false for a node holding a card — and its 37 empty decks are
  coming-soon automatically, on the same rule. That first card is also what **woke the `Science` row in
  `COLLECTION_SECTIONS`**, which shipped inert with the plan: `sectionOf` returns History for anything
  the table does not name, so without the row the first psychology card would have filed the collection
  under History, and `PAGES.decks` skips a section holding no available collection until one does.
  Not part of the site.
- `docs/philosophy-card-plan.md` — the **1000-card running order for the Philosophy collection**
  (`phil`): every card's number, topic and deck, fixed in advance across 9 decks and 38 leaf decks. The
  thirteenth of the planned collections and the second that is not history. **It is EXCLUDED from the
  no-researchers-in-a-question rule, exactly as `psych` is** — in philosophy the thinkers ARE the subject
  matter. **Read its five scope decisions before writing anything**, of which two govern the tree: it is
  **not a Western philosophy collection**, so Indian, Buddhist, Chinese and Japanese philosophy take deck
  3 and 115 cards in chronological position beside Greece rather than an appendix at the end, Islamic
  philosophy sits inside the medieval deck because that is what it historically is, and Africana,
  decolonial and Latin American philosophy sit with critical theory and feminism as one lineage of
  critique; and **a card gives the ARGUMENT, not the position** — ten sentences is enough for a premise, a
  conclusion and an objection, and a card that lists who held what teaches a reader to name views they
  cannot evaluate. Two things it is worth knowing before writing a card: **thirteen of its primary texts
  are already in Folio's Library**, eleven with their original-language column, so `card.quote` is worth
  more here than anywhere on the site; and **a work is cited by its standard divisions** (Stephanus,
  Bekker, A/B) rather than by the page of one translation. The next card to write is the lowest `ph-NNN`
  not yet in `data.js`; the index table under "THE SIXTEEN PLANNED COLLECTIONS" is the lookup. **No card
  has been written yet.** It ships an inert **`Philosophy` row in `COLLECTION_SECTIONS`**, on the same
  reasoning as Psychology's `Science` row. Not part of the site.
- `docs/biology-card-plan.md` — the **1000-card running order for the Biology collection** (`bio`):
  every card's number, topic and deck, fixed in advance across 9 decks and **46 leaf decks, the most on
  the shelf** — biology is the most systematically subdivided subject Folio carries and the tree mirrors
  how it is taught. The fourteenth of the planned collections and the third that is not history; it
  joins Psychology in the **`Science` section**, which until now held one collection. **It is NOT
  excluded from the no-researchers rule** — unlike `psych` and `phil`, and it does not need to be, since
  biology's content is mechanism rather than argument and a question can nearly always be clued from
  what the thing does; only the dozen cards whose answer term IS a person or a named experiment use the
  rule's existing exemption. **Read "Living beside the other collections" before writing anything in
  `bio-nervous`**: this collection shares **eighteen card titles with Psychology verbatim**, twelve of
  them in that one subdeck, the pairs are listed there with their ids, and three rules follow — write
  the pair deliberately, write the shared glossary term ONCE (whichever collection reaches it first),
  and know that **`bio-897` and `ps-432` are both called "Extinction" and are unrelated senses of the
  word**, so they cannot share a glossary key. Four terms it needs already exist (`Domestication`,
  `Boreal`, `Human_evolution`, `Genus`) and must be reused rather than re-keyed. The next card to write
  is the lowest `bio-NNN` not yet in `data.js`; the index table under "THE SIXTEEN PLANNED
  COLLECTIONS" is the lookup. **No card has been written yet.** Not part of the site.
- `docs/dinosaurs-card-plan.md` — the **1000-card running order for the Dinosaurs collection**
  (`dino`): every card's number, topic and deck, fixed in advance across 9 decks and 43 leaf decks. The
  fifteenth of the planned collections and the fourth that is not history; it joins Psychology and
  Biology in the **`Science` section**. **Read "Is there a thousand cards in this?" before writing
  anything** — it is the narrowest subject on the shelf and a thousand cards is defensible only because
  the collection is the MESOZOIC AND PALAEONTOLOGY rather than a genus list: roughly a quarter of the
  cards name a taxon and the other three-quarters are biology, environment, method and history, with
  100 cards (deck 2) on a Mesozoic world containing no dinosaurs at all. **The padding risk is named
  there too** — a genus earns its slot by teaching something the group card does not. Its other
  load-bearing rules: **the corrections are the spine** (nine deliberate what-changed cards, the
  Psychology plan's replication pairs in another subject), **feathers are carded with their limits**
  (`dino-460` is "Which dinosaurs had feathers", because "all of them" is as wrong as the scaly
  monsters it replaced), **a genus card states its taxonomic standing and that it may change**, and
  **speculation is labelled**. It follows the no-researchers rule, with `dino-history` exempt by the
  rule's own terms. Its `COLL_THEME` comment carries a **standing note about the magenta band** — the
  wheel's best-scoring region, now measured and rejected four times; do not re-run that sweep. The next
  card to write is the lowest `dino-NNN` not yet in `data.js`; the index table under "THE SIXTEEN
  PLANNED COLLECTIONS" is the lookup. **No card has been written yet.** Not part of the site.
- `docs/korea-card-plan.md` — the **1000-card running order for the Korea collection** (`korea`): every
  card's number, topic and deck, fixed in advance across 9 decks and 43 leaf decks. The sixteenth of the
  planned collections, the eleventh history one, and the fifth to **create its own collection** — node,
  tree, `COLL_THEME` hue and a new `ICON_SYMBOLS` mark (`taegeuk`) ship with the plan. **Read its five
  scope decisions before writing anything**, of which three carry the most weight: **North Korea gets
  thirty-five cards and is not a curiosity** (the same size as South Korea, with `ko-813`–`ko-815` and
  `ko-819`–`ko-820` carding the evidence problem and how to read a DPRK source, so a reader meets the
  epistemics before the claims); **four states are making accounts of their own actions here** — the
  DPRK's official history, the ROK's older anti-communist historiography, the Japanese colonial
  scholarship that shaped how Korean history was written for a generation, and the Chinese Northeast
  Project — and all four are carded as accounts; and **the hardest colonial subjects are carded
  directly**, forced labour and the comfort women system with the documented record and the range of
  estimates, without settling the present-day dispute. Its **Sourcing section is measured rather than
  assumed** and carries two more 200-status error documents (`jstor.org` serves a 3 KB "Client
  Challenge"; `muse.jhu.edu` serves "Verification required!"), the finding that the recognition guide
  has **no page for North Korea** because the United States has never recognised it, and the loss that
  matters most — `digitalarchive.wilsoncenter.org` refuses the connection here. **Not one of its
  thousand topics matches an existing glossary key** and there is no `Korea` term, so expect the
  glossary to grow faster here than anywhere since Greece. The next card to write is the lowest `ko-NNN`
  not yet in `data.js`; the index table under "THE SIXTEEN PLANNED COLLECTIONS" is the lookup. **No card
  has been written yet.** Not part of the site.
- `docs/us-card-plan.md` — the **1000-card running order for the United States collection** (`col-41`):
  every card's number, topic and deck, fixed in advance across 9 decks and 33 leaf decks. The ninth of the
  planned collections, and the one that starts furthest ahead — **all 45 presidents are already cited
  glossary terms** from Phase 2 of the citation pass. Its two scope decisions are the ones to read first:
  the collection **opens with Native America as a deck rather than a prologue**, running forward to tribal
  sovereignty in the present, and it covers **the territory that became the United States**, so Spanish
  Florida, French Louisiana and New Netherland are in it. The next card to write is the lowest `us-NNN` not
  yet in `data.js`; see the "THE UNITED STATES" bullet under "Generating cards & glossary entries". **No
  card has been written yet.** Not part of the site.
- `docs/ww2-card-plan.md` — the **1000-card running order for the Second World War collection** (`ww2`):
  every card's number, topic and deck, fixed in advance across 8 decks and 30 leaf decks. The eighth of the
  planned collections, the second (after Egypt) to **create its own collection** — node, tree and
  `COLL_THEME` hue ship with the plan — and **the first whose subject is inside living memory and is
  actively contested in public**, which is why its "History, not commemoration" and "Sourcing" sections are
  the ones to read before writing anything. The next card to write is the lowest `ww2-NNN` not yet in
  `data.js`; see the "THE SECOND WORLD WAR" bullet under "Generating cards & glossary entries". **No card
  has been written yet.** Not part of the site.
- `docs/geography-card-plan.md` — the running order for the **United States collection** (`geo-us`, under the
  Geography SECTION), and **the
  only plan that is not a thousand cards**: it is fifty states (`geo-001`–`geo-050`) and
  their fifty capitals (`geo-501`–`geo-550`), a capital being `geo-500+N` for state `N` so the two decks
  pair by number. The eleventh planned collection and the only one whose cards use the **map card** format,
  so the file describes the format as well as the order: what `map` and `facts` are, why a map card carries
  no extra phrasings and a short question, why it is kept out of the minigames, and **the accessibility
  limitation stated rather than papered over** — the shape is the whole question, so there is no text
  alternative that does not answer it. It also carries the three glossary collisions already waiting
  (`Alaska`, `Olympia`, `Georgia`), the reachable-source spine (Census CSVs, Library of Congress state
  guides, National Park Service), and the finding that `history.house.gov` serves a 200-status error
  document. The next card is the lowest `geo-NNN` not yet in `data.js`; see the "GEOGRAPHY" bullet under
  "Generating cards & glossary entries". Not part of the site.
- `docs/world-geography-card-plan.md` — the running order for **World** (`geo-world`, the second
  collection of the Geography SECTION), and the second plan that is not a thousand cards: it is **470
  cards** — 233 countries and territories (`gw-001`–`gw-233`) and 237 capitals (`gw-501`–`gw-733` with
  seven numbers deliberately unused, plus `gw-751`–`gw-761` for the extra seats of the ten countries that
  have more than one) — using the same **map card** format the United States collection uses, so
  it points at `docs/geography-card-plan.md` for the format rather than restating it. **It is SORTED BY
  POPULATION, largest first, and the order is FIXED at planning time and never re-sorted**: a card id is
  a permanent address, so re-sorting would move cards between ids and silently repoint every reader's
  schedule and every shared link. The snapshot behind the order is stated in the plan (World Bank
  `SP.POP.TOTL` 2024, with `country-stats.js` for the 21 small territories that series omits), and a
  card's own population figure is researched and cited when the card is written — **the two will drift
  apart, and that is expected rather than a fault**. Three things in it are decisions rather than lists.
  **Which entities are in the deck is THREE CHECKABLE RULES rather than a judgement per country** — an
  ISO 3166-1 code of its own, a shape in `world.js`, and a settled population with an administrative
  seat — which is what keeps Folio out of every sovereignty argument it would otherwise be making 233
  times; the deck is called *The countries and territories* and every question asks for "the country or
  territory shaded on the map", which is true of all of them. **Twelve countries have more than one
  seat** and the plan says which each card asks for, with the working seat named in the facts box.
  **Israel and Palestine are deferred**, numbered but not written, because a card that shades a shape and
  asks for one word cannot hold a capital question whose answer is the dispute. Not part of the site.
- `docs/china-geography-card-plan.md` — the running order for **China** (`geo-china`, the third
  collection of the Geography SECTION), and the third plan that is not a thousand cards: it is **58
  cards** — the 31 provincial-level divisions of mainland China (`gc-001`–`gc-031`) and the 27
  provincial capitals (`gc-501`–`gc-531`, four numbers deliberately unused) — on the same **map card**
  format, so it points at `docs/geography-card-plan.md` rather than restating it. **IT IS COMPLETE**:
  all 58 shipped in Aug 2026, each with a paired glossary term at the citation bar and a picture, so the
  plan is now a record of what was decided rather than a queue of work. **Sorted by
  population, largest first, and fixed at planning time**, on the same reasoning *The world* gives.
  Four things in it are decisions rather than lists. **WHICH DIVISIONS ARE IN IT COMES OUT OF ONE
  DOCUMENT** — the National Bureau of Statistics' Seventh National Population Census, Communiqué No. 3,
  which reports "31 provinces, autonomous regions and municipalities directly under the central
  government of the Chinese mainland" — and that is also the work the order is sorted by and the work
  the NAMES follow, so the list, the order and the spelling are one source rather than three judgements.
  **HONG KONG, MACAU AND TAIWAN ARE NOT IN IT, and that is a fact about Folio rather than a claim about
  any of them**: each has an ISO 3166-1 code, each is drawn by `world.js`, and each is already a card in
  *The world* (`gw-104`, `gw-167`, `gw-060`), so carding one here would ask a shape twice on one site.
  **FOUR CAPITAL NUMBERS ARE NEVER WRITTEN** — Beijing, Shanghai, Tianjin and Chongqing are cities that
  are themselves divisions, so the shape being shaded IS the answer — and the decision is enforced by
  `window.CHINA_CAPITALS` holding 27 rows rather than by the plan saying so, which is what makes
  `add-card.js` refuse such a card. And its **sourcing survey is the one to read before writing**: every
  Chinese government host outside `stats.gov.cn` refuses the connection here, `whc.unesco.org` and
  `britannica.com` are 403, and `chinadaily.com.cn` answers and is a state newspaper, citable for what
  it is and never as an independent source. Not part of the site.
- `china-provinces.js` + `.claude/build-china-provinces.js` — the 31 provincial-level divisions of
  mainland China and the 27 provincial capitals (`window.CHINA_PROVINCES` / `window.CHINA_CAPITALS`),
  the third shape layer a map card can be drawn on. **Lazy** (bundle `chinaprov`, with `lakes.js` beside
  it for the reason `usstates` carries it), **generated — never hand-edited**. Its shape is
  `us-states.js`'s exactly, down to the tolerance, plus a `t` for the division's KIND — Province,
  Autonomous Region or Municipality, which every card in the deck states and which the question is
  careful not to assume — so one renderer draws a province and a state alike.
  **📖 Read the script's header before touching it**, for one finding above all: **Natural Earth's
  `Admin-1 capital` class is unusable for China**, where for the United States it was the whole answer.
  It returns 32 points for 31 divisions and is wrong five ways at once — Zhaotong filed as a capital of
  Yunnan and Fushun of Liaoning, Xining filed under Gansu, Beijing absent because it carries the
  Admin-0 class instead, and two names misspelt. So the capital is DECLARED city by city and the
  COORDINATE is still never typed: the point comes from Natural Earth's own record of the named city,
  and **every point is then tested for falling inside its own province's polygon before it is written**,
  which is the check Natural Earth's own attribution fails. It also records, measured rather than
  assumed, that the `_lakes` variant changes NOTHING for China — all 32 features are vertex-identical
  in the two variants, because the clipping is applied to lakes lying BETWEEN divisions.
- `world-capitals.js` + `.claude/build-world-capitals.js` — the capital of every country and territory as
  a POINTS TABLE for a map card's gold dot (`window.WORLD_CAPITALS`, 246 cities across 233 entities,
  13.5 KB), the `world` layer's companion exactly as `US_CAPITALS` is `us-states.js`'s. **Lazy** (bundle
  `worldcaps`), **generated — never hand-edited**. `s` names the world.js country the city stands in, so
  `add-card.js` can CHECK that a card's dot falls inside the country its `key` shades rather than trusting
  it. **📖 Read the script's header before touching it**: the coordinates come from Natural Earth's own
  capital classes, a point NE files as a former capital or as an autonomous region's seat is dropped with
  its reason stated (Kyoto, Lagos, Yangon, Edinburgh, Funchal), and the seventeen micro-territories NE has
  no point for are fetched from the named **Wikipedia article's own published primary coordinate** — so
  what the script declares is an ARTICLE TITLE, which is checkable, and never a number, which is not.
  Two measured limits it prints on every run: **fifteen capitals fall just outside `world.js`'s own
  simplified coastline** (the dot is 4dp and the coast 2dp — sub-pixel on a country, visible on an atoll,
  and deliberately NOT snapped, since snapping would move the city to flatter the map), and 26 `world.js`
  entries have no capital at all, which is exactly the uninhabited and disputed set the plan excludes.
- `docs/history-focus-plan.md` — the rule that **Folio is a history site, not an archaeology site**, the measure that
  finds cards written the other way round (24 of 119 flagged, measured before the 2026-08-04 renumbering — the
  flags travel with the cards, the ids in its table do not), and the six rewrite batches. Opened Aug 2026 on request
  after `gr-008` Knossos was found to be mostly about who dug it. **Extended the same month, on request, to
  HISTORIOGRAPHY** — the modern argument about the past is no more the subject than the modern dig is — with two
  further rules (a question may never name a researcher; historiography may not run past 3 of an abstract's 10
  sentences), the 45 cards that break them and the five batches F1–F5. Not part of the site.
- `.claude/card-focus.js` — the measure behind that second half: `node .claude/card-focus.js [--prefix=] [--all]
  [--card=<id>]`. It reads each card's own citations, takes names only from AUTHOR POSITIONS (reviewer before
  "review of"; authors after "by" / "ed."), throws the titles away first so an ancient author named in one never
  counts, and reports both rules with an `EXEMPT` list for cards whose answer term IS modern. **It also knows
  the two COLLECTION-WIDE exclusions from rule 1** (`RULE1_EXCLUDED`: `ps-` and `ph-`, since in psychology
  and philosophy the literature is the subject matter): those cards are listed under their own heading and
  are not counted as needing revision, because the alternative is a measure that reports a permanent, growing
  false finding on two collections — and `EXEMPT` is deliberately the wrong instrument, being per card. Rule 2
  still binds on them. Not part of the site.
- `.claude/check-questions.js` — the card QUESTION house rules, measured over the shipped `data.js`:
  `node .claude/check-questions.js [--verbose]`, exit 1 on any violation, so it guards a batch the way
  `check-style.js` does. Four rules — **one sentence**; **understandable on its own** (a question may not
  OPEN on a pronoun whose only antecedent is the hidden answer, which is three words saying nothing until
  the reader has read past the blank — the DUMMY `it` of a cleft is exempt and must stay exempt); **20–34
  words** with the blank counted as one and an imperial conversion in parentheses NOT counted, the same
  allowance `add-card.js` makes; and **the blank mid-sentence**. **A MAP CARD IS EXEMPT FROM THE LAST TWO
  BY DESIGN** — its clue is the SHAPE, so its question is deliberately short and deliberately ends on the
  blank — and is still held to the first two. It deliberately does NOT check that a question names its
  topic's most important aspect: that is a judgement no checker can make, and it is stated here and read
  by eye. Not part of the site.
- `.claude/check-citations.js` — **every citation's AUTHOR NAMES and YEAR, against Crossref**:
  `node .claude/check-citations.js [--prefix=wh-] [--card=] [--term=] [--artefacts] [--verbose]`, exit 1
  on a mismatch. **RUN IT BEFORE WRITING A CARD'S JSON, NOT AFTER** — as an audit afterwards it let eight
  bad citations ship across four cards in one week. It exists because **Europe PMC returns author lists as
  INITIALS** ("Liu C, Sainsbury V", "Ding K, Li S, Lu H") and a Chicago note wants full given names:
  expanding them by hand produces names that read perfectly and are wrong — Chunlin Liu for **Cheng Liu**,
  Vanessa Sainsbury for **Victoria Sainsbury**, Shuo Li for **Siyang Li**, Huayu Lu for **Houyuan Lu**. A
  DOI composed from the shape of a publisher's identifier fails the same way and is caught too, Crossref
  simply having no record. **Nothing else in the pipeline can see this**: `add-card.js` checks a citation
  ENDS IN A URL, `source-audit.js` counts them, `add-sources.js` checks the markers — all of them pass a
  citation whose author never wrote it, and so does a reader, the name being plausible and the DOI real.
  · **It reports in TWO TIERS and the second is the point.** A **mismatch** is a differing SURNAME, or a
    full given name differing from a full given name — an error, exit 1. **"To check by eye"** is a
    citation spelling out a name Crossref only abbreviates: that cannot be verified from here at all, and
    it is exactly where a fabricated given name hides. Diacritics, spacing and the periods after initials
    are folded away — **and so is the DASH FAMILY**, Crossref writing a hyphenated surname with U+2010
    (`Marie‐Helene Moncel`) where the citation has an ASCII hyphen — so `Éric Boëda` and `Eric Boëda` are
    one name and only real differences are reported.
  · **A citation with no DOI and no PMC id is UNCHECKED, never "ok"** — an out-of-copyright book on
    archive.org has no record to check against, and saying it passed would be the checker lying.
  · **CROSSREF IS A RECORD, NOT AN AUTHORITY, and three of its records are wrong about a name Folio has
    right** — a dropped letter (*Jaques* Cinq-Mars), a title-cased and misspelt Dutch tussenvoegsel (*Van
    Der Plight* for van der Plicht), and a Catalan double surname parsed as a given name (*Autuori* Josep
    Cervelló). They are **declared in `CROSSREF_WRONG` with the reason beside each**, not left to be
    re-derived every run: a checker that cries wolf on three good citations is one nobody runs. A row
    matches only when the DOI, the cited name AND Crossref's name all agree, so it can never quietly
    excuse a different fault on the same paper; add one only after reading the article's own byline.
  · **A YEAR CROSSREF CANNOT ADJUDICATE IS NOT AN ERROR, and where a record has no published-print date
    it cannot adjudicate at all** — all it holds is when the record went ONLINE, which is a deposit date
    and falls on either side of the issue: late for an advance-access paper (*Nature Human Behaviour* 7,
    no. 2 is Feb 2023 for a paper Crossref dates 2022) and **years early for a society digitising its back
    catalogue** (PSAS 125 (1995) deposited 1996, BGSG 43 (2010) deposited 2017). Chicago cites the ISSUE,
    so a record with no print date goes to the eye and never to the mismatch list. A print year the
    citation does not carry is still an error, with one declared exception (`CROSSREF_YEAR_WRONG`).
  · **A TITLE THAT DIFFERS WHILE THE FIRST AUTHOR MATCHES IS A BILINGUAL RECORD, not a wrong DOI** — a
    journal publishing in two languages registers one of its two titles, so the Croatian *Liber Linteus i
    Zagrebačka mumija* and the Slovenian *Podoba in vloga Matere Zahodnega kraljestva* were each reported
    as a different paper from their own English original. That is a judgement, so it goes to the eye. The
    title is also read to the comma INSIDE the closing quote, since a title may carry quotation marks of
    its own and a matcher stopping at the first one captures four characters.
  · **THE INITIALS SPLIT IS DECIDED PER TOKEN, ON THE RAW TEXT.** Crossref writes several initials as one
    token (`G.M. MacDonald`, `J.C Long`), which have to be split to compare against a spelled-out name —
    but asking whether the NAME contains a cluster anywhere splits every short surname into letters as
    soon as an initial appears beside one, so `Jeffrey C. Long` and `J.C Long` compared as different
    people and **Long, Wang, Chen and Ma were all reported wrong**. Written that way the checker reported
    21 mismatches of which several were its own; per token it reports what is really there.
  Needs the network; with none it says so and exits 0 rather than failing a build for a fact it could not
  check. Answers are cached in `.claude/.crossref-cache.json` (gitignored); `--refresh` throws it away.
  Not part of the site.
- **📖 `docs/README.md` — READ BEFORE LOOKING FOR A DOC, ADDING ONE, OR SPLITTING ANYTHING OUT OF THIS
  FILE.** The index of `docs/`, and the rule the directory exists for. Every file
  there, one line each, grouped into the wiring references, the sixteen card plans, the FINISHED content
  passes and the ones with work still open — so a pass that is complete can be told from one that is not
  without opening either. The rule it states is the one this whole file is arranged around: **rules live
  in `CLAUDE.md`; reasoning lives in `docs/`**, reached by an imperative `📖 … — READ BEFORE …` pointer,
  because a file nobody is told to read is a file nobody reads. Eight docs were in exactly that state
  when it was written — unreferenced from here, several of them holding OPEN work.
- `glossary-extra.js` + `.claude/split-glossary.js` + `.claude/gloss-io.js` — **the glossary is TWO
  files.** `GLOSSARY_SOURCES` (786 KB) and `GLOSSARY_IMAGES` (523 KB) were 54% of `glossary.js`, which is
  on the EAGER path, and **nothing reads either until a popup opens** — so they moved to
  `glossary-extra.js`, fetched by the `glossExtra` bundle. The eager path went **8.80 → 7.51 MB raw,
  2.45 → 2.16 MB gzipped**.
  · **IT STAGES ONTO A QUEUE (`window.GLOSSARY_EXTRA_IN`) RATHER THAN ASSIGNING**, exactly as
    `i18n/gloss-<lang>.js` does, and `glossExtraIngest` drains it. app.js snapshots
    `PRISTINE_GLOSS_SOURCES` / `PRISTINE_GLOSS_IMAGES` at boot, which is BEFORE this file lands — so a
    plain assignment would leave the editor's revert baseline EMPTY and **"Revert" would delete a
    shipped citation list instead of restoring it**. The hook re-seeds both baselines and then
    **re-applies `ADMIN_EDITS` on top**, the same rule the `atlas` bundle follows for `window.TIMELINE`.
  · **IT IS WARMED AT IDLE, NOT FETCHED ON THE FIRST POPUP** — popups are common and a reader should not
    wait for a definition; the point is only to keep it off the path that blocks first paint.
    `openGlossWin` re-fills its picture and Sources slots (and re-runs `wireFootnotes`) if the file lands
    after a popup is already open, so the reader who beats the warm still gets both. It re-fills the
    SLOTS rather than re-opening the popup, which would take away a scroll position and any nested term.
  · **EVERY HELPER GOES THROUGH `.claude/gloss-io.js`** (`loadGlossary` / `writeGlossary`). Requiring
    `glossary.js` alone now yields EMPTY tables: a READER then reports a fully-cited glossary as
    uncited — `gloss-source-audit.js` did, on its first run after the split — and a WRITER
    re-serialises what it loaded and **deletes 1.29 MB without erroring**. `writeGlossary` also STRIPS
    either block from `glossary.js` if one creeps back in.
    **AND THE QUEUE'S KEYS ARE THE GLOBALS' OWN NAMES.** A one-off inspection that reaches past
    `gloss-io.js` has to read `window.GLOSSARY_EXTRA_IN[0].GLOSSARY_IMAGES` — not `.images`, and not
    `window.GLOSSARY_IMAGES`, which the file never assigns. Both wrong forms return `undefined`, which
    reads as *this term has no picture*: on that answer an existing illustration was overwritten in
    Aug 2026 and had to be reverted. **A check that cannot tell an absent table from an absent entry is
    worse than no check**, so confirm a table's SIZE before trusting what it says about one key.
  · **`check-style.js` reads `glossary-extra.js` too**, and that is not housekeeping: rule 4 (BCE/CE)
    sweeps the text a PICTURE carries, which is where most of the site's remaining "BC"s were, and the
    whole images table moved out of its reach. Its citations mask now matches **both** block shapes —
    `window.X = Object.assign(…)` and the new `var X = {…}` — since matching only the old one left every
    citation exposed to `--fix`, the exact fault that mask exists for.
  · **`node .claude/split-glossary.js --check` asserts the split is still intact, and CI runs it.** The
    split itself was a LINE-RANGE MOVE rather than a re-serialisation, verified key-by-key before
    anything was written, so the bytes that ship are the bytes that were reviewed.
  · **A test that seeds `window.GLOSSARY_SOURCES` must wait for the bundle first** — `test-sources.js`
    seeded before the warm landed and had its fixture Object.assign'd away, which fails as "the popup
    lists 5 citations" and reads like a rendering bug rather than a race.
- `.claude/check-docs.js` — the split's own guard: `node .claude/check-docs.js`, exit 1 on failure. It
  checks BOTH directions, each of which fails silently. **A pointer that resolves to nothing** still
  reads as authoritative, so the next session goes looking for a file that is not there; **a file nobody
  points at** is worse than an undocumented one, because the repo appears to have documented the thing.
  It also holds the index to naming only files that exist, every doc to opening on an H1, and every
  pointed-at file to carrying at least one **imperative** pointer. **That last rule is PER FILE, not per
  glyph** — it was written per glyph first and flagged `docs/library-books.md`, whose second mention is
  an ordinary cross-reference beside a primary pointer that is imperative: a true statement, wrongly
  scoped. The narrowed form was verified to still fail when a real pointer is stripped. Not part of the
  site.
- `.claude/app-map.js` — a navigable map of `app.js`: `node .claude/app-map.js [--big N]
  [--functions] [--find <re>]`. 2.57 MB and 38,000 lines is hard to find your way around, so this
  lists its 142 dashed section banners with line numbers, byte sizes and function counts, and
  `--find` resolves a name to a line. **Read its header before proposing to split `app.js`**: the
  file is ONE IIFE under `"use strict"` whose ~1,250 top-level functions share a single closure —
  `S`, `CARDS`, `TREE`, `render`, `route`, `t`, `save`, `ADMIN_EDITS` are closure variables and
  exactly **14** things are put on `window`. Splitting it across `<script>` tags means either making
  every shared name a property of a namespace object (thousands of call sites, and no test can prove
  closure-equivalence) or making them true globals — which leaks the whole application surface onto
  `window`, where a community deck's sanitized HTML and any browser extension can reach it. The
  second is a security regression sold as tidying. **So the file stays whole and this makes it
  navigable instead.** One thing the map cannot do: a section runs from its banner to the NEXT
  banner, so its name is the name of the block it OPENS rather than a summary of all of it. (The
  first cut also treated any SHOUTED comment opening as a banner, which is how the house writes the
  conclusion of a long explanation — it reported a sentence about one minigame's draw as a 266 KB
  "section". **A map that invents sections is worse than none, because it is read as structure.**)
  Not part of the site.
- `.claude/check-sizes.js` — what Folio actually weighs: `node .claude/check-sizes.js [--json]`. It
  reads the eager path **out of `index.html`** rather than from a list, prints each file's raw and
  gzipped size with the totals, lists the biggest files off that path, and breaks `glossary.js` and
  `data.js` down by global. **It exists because a figure quoted in prose is a figure that will be
  wrong**: this file used to state the eager path's size with "re-measure it rather than quoting it"
  written beside it, and every one of those numbers still drifted 2–4× out of date — `app.js` written as
  "~684 KB" against a real 2.58 MB. A warning cannot measure. **Quote nothing it prints; run it.** Not
  part of the site.
- `.claude/check-overlay.js` — audits the LIVE cloud content overlay (`content_overrides`) against the shipped
  data files: `node .claude/check-overlay.js`. It reports a card delta whose prose plainly belongs to ANOTHER
  card (the renumbering fault — see the overlay bullet under "Environment"), a delta pointing at an id that no
  longer exists, a live collection the overlay DELETES, timeline eras that differ from `timeline.js`, footnote
  markers or licence attributions an edit has dropped, and what the row costs every visitor on every page load.
  It reads and never writes. Needs the network; reads `SUPA_URL`/`SUPA_KEY` out of app.js rather than restating
  them, and fails loudly if it cannot find them. **Run it after any renumbering and after baking.**
  **`--file=<path>` audits a LOCAL overlay JSON instead of the live row**, which is how a REPLACEMENT is checked
  before it is pasted into production rather than by pasting it and looking at the site — the file is the bare
  `data` value, not the PostgREST row wrapper. Not part of the site.
- **📖 `docs/refinements-2026-08-27.md` — READ BEFORE PICKING UP ANY OF THE THIRTY-FIVE ITEMS FROM THAT
  REQUEST, and before touching a language deck's pinyin, examples or glosses.** What shipped, and the four
  faults one reported card each turned out to be at scale: **110 wrong Mandarin readings** from one
  reported "fàng uǎn" (`.claude/decks/check-pinyin.js` cross-checks pinyin against the same card's
  bopomofo, which is the one field that pins a syllable boundary); **1,953 cards showing the same example
  twice**; **five glosses that were the wrong sense**, each contradicted by the card's own examples
  (`.claude/decks/check-senses.js` measures that and ranks it); and a **glossary auto-link pointing at the
  wrong continent's period** (`.claude/check-gloss-links.js`). It also holds the four answers to the items
  that asked for a suggestion rather than a change, and a costed plan for the nine features not built —
  read the plan's entry before starting one, since three of them turn on a decision that is not obvious
  (what Save means in the deck editor, which bundle a card locator may fetch, and why merging language
  notes cannot be done to a shipped deck).
- `docs/card-glossary-pairing.md` — the rule that **a new card ships with a glossary entry for its own answer term**,
  and the backfill plan for the 77 of 119 shipped cards that have none. Its P9/P10 (the ten Ancient Greece terms) come
  first. Not part of the site.
- `docs/glossary-length-plan.md` — **every glossary description at 100 words (±10%)**, on request (Aug 2026): the
  bar, the measured baseline, the eleven batches, the per-term workflow and the batch log. **L0 (the tooling)
  L1–L10 and the L-audit have ALL SHIPPED — **THE PASS IS COMPLETE: 477 of 477 terms are inside the bar
  (100%), mean 106.7 words, range 90 (`James_A._Garfield`) – 110 (`Y-chromosomal_Adam`), and every one of the
  eighteen kinds is 0 outside**: the 197 countries (A–E, F–L, M–R, S–Z), L5's 55 caves, type sites, continents,
  oceans and regions, L6's 54 people (45 US presidents plus nine antiquarians, archaeologists and a poet),
  L7's 44 periods and stone industries, L8's 40 taxa, fossils and animals, L9's 45 tools, artworks, cultures
  and peoples, and L10's 24 concepts with the four singleton kinds.
  `node .claude/gloss-length.js` is
  the measure, with `--over` / `--under` / `--tag=<kind>` / `--list`. **What keeps it true is the rule, not the
  measure**: a new term ships at 90–110 words, three sentences, cited at the bar, exactly as it ships with its
  citations — so **re-run `gloss-length.js` after `add-sources.js` and after `add-glossary.js`**, since both
  write prose and neither measures it. Three things the bar does not
  change and which the pass must not quietly relax: still exactly three sentences, still impartial and
  self-contained, and **still no claim past what the citations carry** — a term padded to length is the one way
  this pass can do real damage. Two rules L1 established and the later batches should just apply:
  **an imperial conversion does not count** (`gloss-length.js` strips it, exactly as `add-card.js` does — the
  measure counted them at first, which held the glossary to a tighter prose budget than the cards for no reason
  but its subject matter), and **the border list is the first thing to cut** on a country term, worth 9–13 words
  and telling a reader less than the region already did. **L3 recast the "keep it where the borders ARE the
  fact" exception as a TEST to run on every term** — *does naming the neighbours say more than the region
  already did?* — because nine of its 43 kept theirs (Moldova, Mongolia, Nepal, the Netherlands, North Korea,
  Panama, Portugal, Qatar, Monaco) against one apiece in L1 (Bhutan, Bangladesh) and L2 (Luxembourg). The
  reason is arithmetic rather than luck: **a list of two is not a list.**
  **L3 also names the ISLAND term's equivalent of the border list**: a
  distance-to-the-mainland locator ("about 400 km (250 miles) off the southeast coast of Africa"), the same
  formulaic clause in a different coat, worth 8–11 words with its conversion and saying nothing the region
  already hasn't. Six of L3's terms lost one, and **L4 confirmed L3's measurement exactly** — all four terms
  it named carried the clause and all four lost it. **L4's refinement is that the clause has a PROSE form the
  regex cannot see** (`Tonga`'s "spread over a long north-south stretch of ocean", `Vanuatu`'s "lying east of
  Australia and north of New Caledonia"), so the numeric grep found four of six: **grep the shape to plan a
  batch, then read the batch's own first sentences.** On the other hand **not every country term has
  the recipe's 30 spare words**: a microstate, a single-island state or a term opening on a superlative
  (`Monaco`, `Nauru`, `Marshall_Islands`, `Russia`) has no border list and no ordinary landscape sentence, and
  there the words come out of real claims — which is why L3 and L4 name more substantive losses than L1 or L2.
  **Diff the FIGURES before and after a batch**: L1 shipped with zero numbers added or altered and 23 dropped
  with their clauses, three of them substantive, and naming which is the honest half of a trim; L2 the same, with
  17 dropped and six substantive; L3 with 15 dropped and four; L4 with 24 dropped, six substantive, and the ONE
  figure it added a correction — `Vatican_City` gave its area as "0.44 km² **(0 sq mi)**", a conversion rounded
  to nothing, which the units sweep could not see because it looked for MISSING conversions rather than useless
  ones. **A metric figure below one imperial unit needs two significant figures in its bracket**; the whole
  glossary was swept and it was the only one. **L5 dropped 102 and added none, nine substantive**, and its
  finding is the one to reach for on any batch of DATED terms: **the date line was in the prose twice.** 29 of
  its 55 carry a `GLOSSARY_DATES` entry, which the popup prints directly above the description, and the prose
  then restated the same span in words — so **read `GLOSSARY_DATES` before deciding a dropped date is a loss**
  (eight headline dates were queued for restoration before the table showed every one already on screen).
  L7 and L8 are the next two batches where that pays. **L5 also names the SITE term's padding class:
  excavation administration** — who dug, when, how many seasons, how deep — worth 15–25 words, and the one
  class the house rules already told us to cut, `docs/history-focus-plan.md` saying Folio is a history site
  and not an archaeology site. **L6 then transferred the date-line finding to the 45 presidents**, every one
  of whom opened by restating the term dates its `GLOSSARY_DATES` line already carries — but it must NOT
  become a template change, since cutting it from all 45 would push nine in-band ones below 90; it is a
  clause available to a term that NEEDS words, exactly like the border list. L6 also **half-refutes the
  office-list prediction made here**: on a president the prior career is how they got there and is not
  padding (Bush Sr's congressman → UN → CIA → vice president is the point of him), and the real padding
  class is the **run-on ENUMERATION** third sentence — nine achievements joined by "and … and … and", 88
  words on `George_W._Bush`. **L6's own hard finding is a constraint the earlier batches never met: a term
  whose citations are ONE-PER-CLAIM cannot lose that claim.** `Barack_Obama`'s Nobel Foundation source and
  `Donald_Trump`'s *Foreign Affairs* essay each carry exactly one clause, so cutting it ORPHANS the source
  and `add-sources.js` refuses the batch — read the source list before choosing what to cut. And its two
  GROW cases (the pass's first) both grew from a work already in the term's own list rather than from
  padding: **a term under the bar is usually under it because it left something out** — `Sima_Qian` never
  cashed its own promise to say what the Shiji's "arrangement" was. **L7 then transferred the date-line rule a
  third time and sharpened it — CUT THE SPAN, KEEP THE CAVEAT**, since a period's date line always carries its
  span but never "though both ends are debated" or "a lowstand plateau rather than a single peak"; its own
  padding class is **HISTORIOGRAPHY** (who named it, when, after what — keep the type site, cut the dig
  history); and it had FIVE grows, all paid for out of `.claude/sources-register.md`, which records Thomsen's
  1848 definitions verbatim and is why `Bronze_Age` and `Iron_Age` could grow at all with `brill.com` 403 here.
  **L7's hardest finding is L6's constraint in a subtler form: a marker can be left pointing at a claim the
  trim removed, and `add-sources.js` PASSES it** — the source is still *referenced* and the marker is still on
  the page — so `Châtelperronian` kept a citation titled "No Reliable Evidence for a Neanderthal–Châtelperronian
  [association]" after the 2018 challenge it IS had been cut, and `Howiesons_Poort` kept a climate-change paper
  after the clause it explained. Only reading each surviving marked sentence against the work it points at
  catches this. L7 also names two things to do BEFORE drafting: **run the sibling-consistency check over the
  whole batch's date lines** (it holds — and the `Paleolithic` 9700 BCE against `Neolithic` 10,000 BCE
  "overlap" is two regional schemes, recorded and deliberately not "fixed"), and **read a sentence that argues
  with itself before trimming it**, since `Boreal`'s "does not reach down to 8,000 years ago as loose usage
  suggests" is card batch 22's correction written into the prose and reads exactly like a stray figure.
  **L8 found a splitter gap the same way and its lesson is to look BEFORE drafting**: `Smilodon` was not
  three sentences but SIX, because `split-abstract.js` broke on an abbreviated binomial (`S. fatalis`) — the
  run rule needs a second initial and G5's lone-initial rule requires a CAPITALISED word to follow, where a
  species epithet is lowercase. Fixed with the exact test that **a single capital, a full stop and a
  LOWERCASE word can only be an abbreviated genus** (plus `>` in the lookbehind, since the letter sits
  inside `<i>…</i>`), and verified over 1,377 texts with one split changed and no regressions. **Run the
  whole-corpus split audit at the START of a batch.** L8's other lever is new: **the SIBLING PAIR** — six of
  its terms describe one find from two angles (`Taung_Child`/`Australopithecus_africanus`,
  `Lucy`/`Australopithecus_afarensis`, `KNM-WT_40000`/`Kenyanthropus_platyops`), so a shared fact can be
  given to whichever of the two owns it rather than trimmed twice; and on a taxon the **describer and year
  are the formal identity and stay**, while the discovery narrative around them goes.
  **L9's lever is L8's one level down, and it is measurable: NEAR-VERBATIM DUPLICATION BETWEEN SIBLING
  TERMS at the level of the SENTENCE.** Counting shared eight-word runs across its 40 terms found **17
  between `Chert` and `Flint` and 11 between `Gunflint` and `Musket`** — four terms written independently
  from the same two sources, repeating whole clauses word for word. Deciding what each term OWNS (`Chert`
  the mineralogy, `Flint` the chalk and the working quality, `Gunflint` the lock and the Brandon
  workshops, `Musket` the loading drill) took them to **2 and 0**. **Grep a batch's terms against each
  other before drafting**: it takes two minutes, it finds words that cost nothing to lose, and no other
  check in the workflow can see it. L9's padding class is the **MECHANISM DESCRIBED TWICE** — an `object`
  term explains how the thing works and then explains what that means, and one clause does both jobs,
  which is where most of the 70–90 words came off `Spear-thrower` (195) and `Bow_and_arrow` (177). And it
  **qualifies L5's and L7's date-line rule**: `Minoan_palace`'s restated "from about 1900 BCE" was the only
  thing its second marker (Rutter's chronology page) was standing on, so **check the source list before
  cutting a restated span**, not just `GLOSSARY_DATES`.
  **L10 is L9's lever meeting a wall, and the wall is the more useful half.** Its cluster —
  `Chronology`, `Stratum`, `Stratigraphy`, `Geology` and `Geological_epoch`, all reciting the same two
  GSSP facts out of the same three papers — could NOT be fixed by assigning ownership, because **each
  term's source list requires each of those works to be referenced somewhere in it** (L6's constraint),
  so dropping the shared clause orphans a source and `add-sources.js` refuses the batch. **Where several
  definitional terms rest on one small source set, the duplication cannot be deleted, only RE-REGISTERED**:
  each states the shared fact in the register it owns and in the fewest words (`Geological_epoch` the GSSP
  machinery, `Geology` the marker driven into a rock face, `Stratum` the sequence, `Stratigraphy` the
  combination of relative and scientific dating, `Chronology` the calibration) — every pair then measures
  0, with no marker lost. Its own padding class is L7's **historiography** again (`Post-glacial_rebound`
  lost Celsius in 1743 and Jamieson in 1865, 30 words), and its grow is the pass's largest —
  **`Archaeology`, 43 → 103, out of the register alone**, having left out the range of its own subject,
  the words *artifact* and *feature*, and **context**, which is the discipline's central idea. Two more checks
  L2 made standing, both
  for failures that are invisible in the
  finished prose. **Diff every MARKED sentence's YEARS before against after** — a trim can strand a marker, and
  `add-sources.js` cannot see it, since every source is still referenced and no marker runs past the end of the
  list: `Ireland`'s EU-country-page marker was left on a sentence about the famine once the 1973 accession it
  carried was cut, and the fix is to restore the datable clause rather than move the marker, that clause being
  what the recipe's second source exists to carry. And **grep the HEDGE vocabulary before and after** — a trim
  eats hedges silently, four of L2's six losses sat on claims that survived, and turning "often called the Isle
  of Spice" into "hence its name" saved four words by inventing a fact. **The hedge grep keeps paying, one to
  three terms a batch**: L3's was `Myanmar`, where "have long been **among** its exports" became "are
  long-standing exports" — reads the same, says something stronger. **L4 caught three, all one shape, and it is
  the shape to watch: a QUANTIFIER in front of a superlative or a fraction**, which reads as filler to someone
  cutting words and is in fact the whole claim — "**some of the** fiercest fighting" says *among the worst*
  where "fiercest fighting" says *the worst*, and `Somalia`'s "the way of life for **much of** the population"
  had become "for most people", turning a large fraction into over half. **L5 caught eight, of which six were
  the hedge leaving with the clause it hedged and two were the real thing** — `Madjedbebe`'s "5,000 to 15,000
  years earlier" flattened to "thousands of years earlier", and `Africa`'s "regained independence across
  **almost all** of its territory" to "independent again". **L5 also refines the MARKER check in both
  directions.** It fired four times and all four were benign, every one an excavation date leaving a sentence
  that still carried what its citation is for — so the rule is not that a marked sentence must keep every year
  but that **the marker must still point at something the source carries**: check the citation, not the count.
  And the checker has a blind spot worth knowing before a deep-time batch — a year regex matching
  `1\d{3}`/`20\d{2}` **cannot see BP, kya or Mya dates**, which on prehistoric terms is most of the dates
  there are (`Fertile_Crescent` lost "between about 12,000 and 11,000 years ago" out of a marked sentence in
  silence, caught by eye); **L6 fixed that**, and also stopped the check script splitting sentences with its
  own regex, which broke on initials and read `John F. Kennedy` as two sentences — `split-abstract.js`
  learned about runs of initials in card batch 24 and the check script had not. **L6's hedge grep caught
  only two against L5's eight**, which is what a batch of institutional prose produces: a presidential essay
  hedges very little; **L7's caught four, three of them the quantifier-before-superlative shape for the third
  batch running** (`Middle_Stone_Age`'s "some of the earliest", `Lomekwian`'s "mostly", `Ice_Age`'s and
  `Würm`'s "generally"). One blind spot remains, worth knowing before a batch of calibrated dates: the year
  regex needs the number immediately before "years ago", so an intervening word defeats it and `Boreal`'s
  "8,000 **calendar** years ago" reads as lost when it survived. Not part of the site.
- `docs/artefact-citation-plan.md` — the batch plan for **citing the 100 artefacts**, the third citation pass
  after the cards' and the glossary's. The bar is **3 works per artefact** (`ARTEFACT_SRC_TARGET`), each with
  an openable URL and a marker pointing at it, and unlike the other two it is a REFUSAL rather than a target
  reported against. **THE PASS IS COMPLETE: all 100 are cited and at the bar** (batches 1–15), so a new
  artefact joins at the bar instead of reopening a backlog, exactly as the glossary now works; the file holds
  the batch table and the per-artefact workflow. Its most reusable half is the **reachable-host survey** —
  which scholarly and museum hosts answer from this sandbox and which serve a bot wall, measured rather than
  assumed, with the routes that keep paying (a paper walled here is usually open at its **Europe PMC** copy;
  where the modern synthesis is closed the **standard 19th-century monograph is on archive.org and is often
  the origin of the type name**; and a family with no reachable database may still have a **subject-specialist
  network's** curator guide, which is what carried the Qing cash coins). **Coins looked like the pass's thin
  spot and were its easiest family** — `numismatics.org` is shut and the British Museum's own catalogues
  (Mattingly, Grueber, Head, Wroth, Keary, Brooke, Terrien de Lacouperie) are all on archive.org with full
  OCR. Two cautions it records: **a 200 from archive.org is not a readable book** — several items hand back
  only page furniture, so grep the `_djvu.txt` for a word the book must contain — and **a 403 or a refused
  connection is a different fact from a paywall** and must not be labelled as one. Not part of the site.
- `decks/*.folio-deck.json` — **the community decks**, files a reader imports through the Studio. Not
  part of the site and never loaded by it: a deck file is somebody else's content that happens to have
  been written here, and it goes through `uDeckNormalize` on import exactly as a stranger's would.
  **A COMMUNITY DECK IS NOT A CHANGE TO FOLIO** — no changelog line, no version bump.
  Currently **44 files across 7 languages** — French, German, Indonesian, Italian, Mandarin,
  Portuguese, Spanish — **136,222 cards over 76,502 notes, 181 MB**. **Count them rather than quoting
  that**: `node .claude/build-lang-decks.js` prints the tally on every run.
  · **A COMBINED FILE IS GITIGNORED**: it is an artefact of the levels it combines, every byte already
    in the repo, and its own `combine.py` regenerates it byte for byte. **Anything else in `decks/` is
    either committed or absent** — the Languages shelf is built by READING that directory, so a deck
    present and ignored is one the shelf offers and the deployed site cannot fetch.
- `lang-decks.js` (~11 KB) — `window.LANG_DECKS`, the CATALOGUE the Collections page's **Languages**
  section is drawn from. Generated by `.claude/build-lang-decks.js`, **never hand-edited**; **re-run it
  after adding, rebuilding or removing a deck**, or the shelf goes on quoting the figures the deck used
  to have. It is EAGER and can stay so because it is metadata only (~250 bytes a deck) — the deck file
  itself is fetched only when somebody presses Download.
  · **A language is a COLLECTION and cannot be a tree node**: a tree node's cards live in `data.js`,
    which every visitor downloads, and these decks are 181 MB. Its hues are `COLL_THEME`'s `lang-<slug>`
    rows; the id is BUILT by `langCollId` rather than written down.
  · **Add and Download are two presses.** Add writes the entry into `S.active` and fetches nothing;
    Download fetches the file. That split is the whole reason a deck added on a phone reaches a laptop
    — `S.active` syncs and IndexedDB does not.
- `.claude/build-lang-decks.js` — the generator above. Zero deps, reads `decks/*.folio-deck.json`.
  Every figure is read off the deck it describes, and `cards` is CARDS rather than notes, which is what
  makes a one-note-two-templates deck comparable with a two-notes deck.
- `.claude/caple/`, `.claude/delf/`, `.claude/dele/`, `.claude/goethe/`, `.claude/ukbi/` — the
  generators behind the Portuguese, French, Spanish, German and Indonesian decks. **PYTHON**, unlike
  every other helper here, and deliberately: a further level is a re-run against the next inventory
  rather than a rebuild. **ONE LEVEL PER RUN**, and a level is taught on top of the shipped decks below
  it, read out of those files so they cannot drift.
  · **RE-RUNNING MUST REPRODUCE THE SHIPPED DECK BYTE FOR BYTE, ON EVERY LEVEL, IN ORDER** — the stages
    are shared, so a change made for one level reaches the rest; build under two different
    `PYTHONHASHSEED` values, which is what catches set-iteration non-determinism. **Read the diff**:
    more than once the file that changed was the one that had been wrong all along.
  · **A generator here does not always write every deck of its language** — several levels were
    supplied ready-made and sit on paths a `--level` run would overwrite. **Look at the file names in
    `decks/` before adding a level.**
  · Each has a browser checker (`check-caple.js`, `check-delf.js`, `check-ukbi.js`, `check-goethe.js`,
    `check-phrases.js`, `check-combined.js`) — `check-decks.js` skips the card-level checks for
    anything that is not Mandarin, so everything a deck is FOR is unchecked until there.
- `.claude/combine-decks.py` / `.claude/split-decks.js` — every deck in `decks/` as ONE importable
  file, and the inverse. Both read `UDECK_MAX_CARDS` / `UDECK_MAX_BYTES` out of app.js rather than
  restating them; **a legitimate deck that will not fit is what MOVES those caps**, which has happened
  four times. Their outputs are gitignored.
- `.claude/decks/check-pinyin.js` — **the Mandarin decks' pinyin, cross-checked against their own
  BOPOMOFO**, which is the one field that pins a syllable boundary (zhuyin writes the initial as a symbol
  of its own, so a `g` cannot migrate). It found 29 words where a consonant had crossed the boundary —
  饭馆 as "fàng uǎn" — plus five whose notations count different syllables, two with a bare `r`, and 68
  set as one word where the other 11,000 separate them. **Exit 1 on a finding.** The Mandarin inputs
  (`w26-*.json`) are NOT in the repo, so those decks cannot be regenerated and this is what keeps them
  honest. **A repair moves the SPACES, never the letters** — re-split the ORIGINAL characters at the
  zhuyin's boundaries, or a tone-sandhi spelling (`bú kè qi`) is silently normalised away.
  **AND IT CHECKS ERHUA SINCE SEP 2026**, on a report that "in some Mandarin cards the TTS pronunciation
  differs from the pinyin tone". 那儿 was set `nà ér` — two syllables, the second a full second tone —
  where the word is `nàr` and the speaker, handed the CHARACTERS, says `nàr`. **THE ZHUYIN IS WHAT MAKES
  IT CHECKABLE**: 儿 is a SUFFIX when written ㄦ˙ (neutral) and a SYLLABLE of its own when written ㄦˊ, so
  of the thirteen cards with a trailing `ér` the zhuyin sorted them 8 to 5 — the eight were repaired and
  女儿, 婴儿, 孤儿, 胎儿 and 少儿 correctly stand. **DO NOT ADD A BLANKET TONE CHECK**: comparing the two
  notations' tones over 11,500 readings returns 231 disagreements of which almost none are errors — about
  123 are 不/一 sandhi (pinyin writes what is spoken, zhuyin the citation tone) and about 100 are
  mainland-against-Taiwan neutral-tone variance. The script's header carries the measurement.
- `.claude/decks/check-senses.js` — **a gloss against the card's own example sentences**, plus (exactly)
  a card showing the same example twice. The gloss and the examples come from different corpora by
  different stages, so where a pipeline picked the wrong SENSE the examples say so: `estou` glossed
  "hello (answering the telephone)" over three sentences reading "I am". **Report-only and a proxy** —
  23% of the corpus trips it, because a correct gloss is often a synonym of what the sentence says — so
  it is a ranked review list, never a gate.
- **📖 `docs/lang-decks.md` — READ BEFORE TOUCHING ANY DECK OR GENERATOR.** Every pipeline's findings:
  which exam boards publish a word list and which do not, the CJK and PDF extraction traps, the
  variety filters, the clitic and conjugation rules, the sense-ranking faults, and the catalogue's
  unwrapping rule.
- `.claude/add-card-tags.js` — writes `card.tags` (see the card-tags bullet under "How the app is wired").
  **A BATCH TOOL RE-SERIALIZES THE WHOLE CARD, NEVER A LIST OF FIELDS** (Aug 2026, after this one stripped
  every card's rating). It kept a private copy of `serializeCardData`'s field list and emitted only what
  that copy named — written before `difficulty` existed and knowing nothing about `undatable` — so **ONE
  run silently removed both from all 500 cards**: the tags were written correctly, the file parsed, nothing
  threw, and the only symptom was every minigame's pool quietly emptying. A whitelist in a tool can only
  ever be a copy of app.js's, and a copy goes stale on a change made in another file by someone with no
  reason to look here; `JSON.stringify(c)` cannot, since the cards are read from data.js and written back
  with their own keys in their own order. It also spliced a `tail` starting at `window.COLLECTION_TREE`,
  which dropped the comment standing above the tree on every run — both headers are written out in full
  now. **Diff `data.js` after any tool run**: a whole-file rewrite normalises every card's KEY ORDER, which
  is semantically identical and turns a one-card change into 400 lines of review noise (the fix above
  prevents it, and the cure is to splice the changed line into the old text). **`add-card.js` has a
  second, smaller footprint of the same kind, worth knowing before reviewing its diff**: it re-serialises
  the array through `JSON.stringify`, which writes a whole-number float without its fractional part — so a
  LOCATOR's authored `area` or `spine` comes back with `57.0` as `57` and `1.0` as `1`, on cards nobody
  touched. Five did when the first China geography card was added. `57.0 === 57`, so nothing renders
  differently and nothing is lost; it is review noise, and the cure is the same — restore those lines from
  `git show HEAD:data.js` before committing.
  Not part of the site.
- `.claude/add-card-difficulty.js` — writes `card.difficulty`, the 1–5 rating of how well known a card's
  ANSWER TERM is, in batches: `node .claude/add-card-difficulty.js <batch.json>` over
  `{ "cards": { "wh-001": 1, … } }`. It validates the WHOLE batch before writing anything (a half-applied
  batch is worse than a refused one), reads `GAME_MAX_DIFFICULTY` out of app.js rather than restating it, and
  reports coverage and the resulting minigame pool on every run. It is the BATCH tool for cards already
  shipped; a NEW card carries its own rating and `add-card.js` refuses one without it, so the corpus cannot
  quietly regrow an unrated tail. The scale is in its header and under "Generating cards" below — keep the
  three copies in step. Not part of the site.
- `crossword.js` (~27 KB) — the daily **Crossword**'s own bank of answers and clues,
  `window.CROSSWORD = [{ a, c }]`. **EAGER**, beside `whatyear.js` / `truefalse.js` / `quotes.js`, and for
  the same reason: a daily game's pool is read the moment the tile is drawn. **📖 read its header before
  adding an entry** — the answer is one word of 4–11 letters already normalised to capitals, the clue is
  emitted RAW (so no bare `<`, `>` or `&`), and a clue may not contain its own answer. `check-style.js`
  sweeps it for BCE/CE and `test-difficulty.js` checks the whole bank's shape.
- `coast/italy.js`, `coast/greece.js`, `coast/china.js` — the **hi-res coastlines** for the Rome, Greece
  and China collections' card maps (`window.HIRES_COAST_IN.push({ region, shapes })`, a QUEUE for the
  reason the i18n files push). **Lazy** (`coast_<region>`), **generated — never hand-edited**, by
  `.claude/build-hires-coasts.js`. A sparse patch over world.js's own rings rather than a second world
  map, so nothing doubles; see the map-card bullet under "How the app is wired".
- `.claude/fetch-geo-images.js` + `.claude/contact-sheet.py` — the geography picture pass's two tools.
  The fetcher takes a batch naming, per card, either a `subject` (a landmark article, for a REGION) or a
  `city`, and returns `add-images.js`'s own batch shape with the licence, size and attribution read off
  Commons. **It suggests and installs nothing**, like every image helper here. Two findings are built
  into it: **a free-text Commons search is not evidence of subject** — searching `"Phoenix, Arizona"
  skyline` returned a photograph of NEW YORK, which passed every other test — so a city's picture is
  established by CATEGORY MEMBERSHIP plus the name, and **satellite imagery and USGS survey photographs
  are refused**, both being legitimate pictures of a place and neither being a view of it. The sheet
  tiles a fetched batch into one image so every candidate can be LOOKED AT, which is the standing rule
  and does not otherwise scale past a handful.
  · **A THIRD INPUT, `file`, NAMES A COMMONS FILE OUTRIGHT, AND IT IS WHAT A REVIEW PRODUCES.** The
    searches find a subject's pictures and cannot judge one: `White Sands National Park`'s own article
    offers its VISITOR CENTRE as the only file over 900px, and no scoring rule turns that into a
    photograph of the dunes. A pinned file still goes through `fileInfo` and `licenceOK`, so it can
    never smuggle in a non-free or undersized picture — it is the SUBJECT that is asserted by hand,
    never the licence. **Of the 158 pictures the pass shipped, 41 were pinned this way**, which is the
    honest measure of how far a name match gets you.
  · **THE SKIP PATTERNS CARRY NO LEADING WORD BOUNDARY, AND THAT IS THE WHOLE OF WHY THEY WORK.**
    Commons runs words together — `Chesapeakelandsat.jpeg` is a false-colour Landsat scene and
    `\blandsat\b` matches nothing in it. `sentinel-\d` keeps its hyphen, since Sentinel Peak is a real
    Tucson landmark a card may legitimately want. **`Txu-…` and `…pclmaps…` were added after Inner
    Mongolia got a topographic sheet and Qinghai a geological one**: those are the University of Texas
    map library's scans, they are enormous, so they win any largest-file tie-break, and neither says
    "map" anywhere in its name.
  · **THE CREDIT ENDS IN ITS URL, AFTER A FULL STOP, NEVER IN BRACKETS.** That is the shape 567 of the
    site's 2,281 existing credits already use (the other 1,714 are a bare URL, which `mediaCreditHTML`
    turns into a link); a Commons file name is full of parentheses — `Historic Entrance (Mammoth Cave,
    Kentucky, USA) 2 (37773583192).jpg` — so a URL wrapped in another pair ends on `))`.
  · **A SMALL STATE CAPITAL HAS NO SKYLINE, AND THE HONEST ANSWER IS ITS MAIN STREET.** Commons has no
    wide view of Montpelier (7,900 people), Pierre, Frankfort, Dover, Concord or Jefferson City, and
    what it offers instead is a 19th-century bird's-eye LITHOGRAPH — a drawing of a town that no longer
    looks like that, which on a card is worse than no picture. Those six ship a downtown streetscape
    with a `desc` that says so rather than "seen from a distance".
- `fetch-countries.js` — standalone Node helper (run manually, resumable) that fetches the 5-sentence
  Wikipedia summaries into `countries.js` for every clickable name. Re-run after adding timeline eras so
  their new territories get descriptions. Not loaded by the site.
- `fetch-stats.js` — standalone Node helper that fetches present-day Population/Area/GDP/GDP-per-capita
  from Wikidata (matched to `world.js` by ISO code) into `country-stats.js`. Not loaded by the site.

## How the app is wired

- **Routing:** `location.hash` → the `PAGES` map (home, decks/library, study, map/atlas, account,
  settings, challenge, chrono, admin — and a dozen more; **read the `valid` list rather than this
  parenthesis**, which has been illustrative rather than complete since the games and the reader's own
  record pages arrived). `render()` clears `#view` and calls the current page fn.
  It also calls **`setPageMeta(current.name)`**, which sets `document.title` and the
  description / `og:` / `twitter:` meta from the **`PAGE_META`** table (route → `[title, description]`,
  run through `t()` so it localises where a translation exists, English otherwise). Add a route → add its
  `PAGE_META` row, or it inherits the home page's title. `index.html` carries the home-page values as the
  static baseline because most link-preview crawlers don't execute JS — **keep the two in step.**
  `render()` also **detaches the outgoing page's keyboard handler** (`detachKeys`). `attachKeys` already
  detached the previous one, so two pages could never both be listening — but a page with no shortcuts of its
  own attaches nothing, and the last handler stayed live over it: pressing Space on the Library after a study
  session ran that session's `showAnswer()` against a page that no longer existed. It mutated a detached tree,
  so nothing looked wrong and nothing was reported (found when the page ghost below stopped ids resolving in
  the dead copy). A page that wants keys re-attaches when its own render runs, which is after this.
- **A REPAINT IS NOT A NAVIGATION** (`renderInPlace` / `_renderQuiet` / `.page-quiet`, Aug 2026, on a bug
  report: "each time a new active deck is downloaded, the page refreshes"). `render()` is written for a
  navigation — it **scrolls to the top and plays the page's entrance animation** — and several things
  rebuild the page the reader is standing on; from the reader's side those two flourishes ARE the refresh.
  `renderInPlace()` is the same render with both off: no page ghost, no scroll, and `.page-quiet`, which is
  one stylesheet line killing the page's entrance, its blocks' stagger and the deck rows' own entrance.
  **It changes nothing else** — the fold state and the drag order already survive a repaint. Three things:
  it is **the CALLER'S call and never a default** (the Studio's own import genuinely is a navigation-sized
  change, so `uImportDone(r, quiet)` takes the flag rather than guessing); the class goes on the PAGE
  element rather than the body, like `.page-next`, so it dies with the page; and `_renderQuiet` is cleared
  in a `finally`, or a page function that throws would leave every later navigation silent.
- **`touch-action:pan-y pinch-zoom` on `body`, `.stage`, `#view` AND `.page` is what makes EVERY horizontal
  swipe on the site possible** (styles.css). Without it none of them worked on a real device — not the
  chapter swipe and not the page swipe, which had been broken since the day it shipped. Under the default
  `auto` the browser hands the touch to its scroll machinery the moment it passes the slop and fires
  **`pointercancel`**: `pointerup` never arrives, and both handlers measure the gesture at `pointerup`.
  `pan-y` says this box scrolls vertically and nothing else, so a horizontal drag is nobody's scroll and the
  pointer stream survives; `pinch-zoom` keeps the reader able to zoom, which bare `pan-y` takes away.
  **Nested horizontal scrollers are unaffected** (measured, not assumed): the intersection deciding a pan
  stops at the element that will scroll.
  **IT HAS TO BE ON THE PAGE'S ANCESTORS TOO, and it was on `.page` alone for a fortnight**: a short page
  leaves the bottom of the screen covered by `.stage`'s padding and then by `body`, so a finger landing
  there met the default `auto`. **The gesture worked or did not depending on WHERE it began**, which reads
  as unreliability rather than as a rule with a hole in it.
  **It was invisible to the tests, and that is the part to keep in mind when writing more of them**: a
  synthesised `PointerEvent` bypasses the browser's gesture arbitration entirely and completes every time,
  so every swipe assertion passed throughout. `test-layout.js` and `test-library.js` now drive one swipe
  each through **real CDP touch input** beside the synthetic ones, which stay — they are what pins the
  classification precisely.
- **SWIPE BETWEEN PAGES ON A PHONE** (`wirePageSwipe` / `SWIPE_ORDER` / `.page-next`/`.page-prev`). A
  horizontal swipe moves between `home → library → account → settings`, and the outgoing page leaves the way
  the finger came from.
  · **THE ORDER IS THE TAB BAR'S, MINUS THE ATLAS — that is the whole rule**, and `test-layout.js` asserts
    the two against each other rather than against a list, so a tab added later fails on the rule and not on
    a stale copy of it. The ATLAS is out because a drag there rotates the globe. **COLLECTIONS was in the
    order for a fortnight and came OUT on request**: the swipe was landing readers on a page the bar cannot
    reach, with nothing lit to say where they were.
  · **It is a full CROSS-SLIDE** — both halves travel a whole page width, exactly adjacent plus a 24px
    gutter, at ONE duration and ONE easing, which is what makes it read as a single sheet moving. **No
    opacity at all.** It is only possible because both pages exist for those 340ms, which is why the height
    guard in `makePageGhost` is skipped for a swipe while the element-count guard stays.
  · **`clipStageFor` is what stops a page a whole screen wide from overflowing the document.** It is on the
    STAGE rather than `#view`; it is **`overflow-x` alone, never the shorthand and never `hidden`**, since
    `overflow-x:clip` beside an untouched `overflow-y:visible` is the one pairing that clips without making
    a scroll container; and it is a body class on a timer rather than a `:has()` rule keyed off the ghost,
    because the incoming page slides whether or not a ghost was made.
  · **The guards are the whole of the difficulty, because a false positive TAKES A PAGE AWAY.** Touch only;
    never out of a horizontal scroller, walked up the ancestor chain by MEASURING rather than by listing
    classes; never while an overlay is up, on a form control, or while `body.grading`. Generous on distance,
    strict on angle — a diagonal is a scroll that wandered.
  · The direction class is set on the PAGE ELEMENT, so it dies with that page.
- **PAGE TRANSITIONS.** `.page` has always faded IN; the missing half was the exit. **`render()` is
  synchronous and has to stay so** — several callers query the DOM the moment it returns, which rules out
  `startViewTransition` — so the outgoing page is not held back but LIFTED OUT: `makePageGhost()` lays a
  copy over the stage and leaves it to fade while the new page renders underneath.
  · **It is a CLONE, not the element itself**, so anything still holding a reference to the outgoing page
    keeps the original, detached, behaving exactly as before.
  · **The clone is stripped of every `id` and every control `name`.** For a quarter of a second the dead
    page is still IN the document: an `id` would let a `getElementById()` in the new page's wiring pick up
    the dead copy, and a `name` is worse — a radio group is scoped to the DOCUMENT when its inputs are not
    in a form, so the ghost's radios and the new page's were one group, and inserting the new checked radio
    silently unchecked the ghost's, making a click that had just landed read back as never having happened.
  · **Three exclusions**: reduced motion; the ATLAS in both directions; and the editor, where a repaint per
    keystroke is routine. The home page's ornamental globe is deliberately NOT excluded.
  · The stylesheet's MOTION block adds a staggered entrance for a page's top-level blocks (`sectIn`), an
    entrance for the overlays, and press feedback. Everything there is an animation or a transition, so the
    global reduced-motion killswitch covers it — the one thing it cannot reach is a `both`-filled
    animation's DELAY, which is zeroed explicitly.
- **THE LIBRARY — whole books, read on the site** (`PAGES.library` at `#library`, `PAGES.book` at
  `#book/<id>`, the `THE LIBRARY` block in app.js). A reading room beside the flashcards. **The page
  that used to be called the Library is now Collections** — its route and hash are untouched
  (`#decks`); only the label changed. Two pages called Library is how a reader lands on the wrong one.
  · **WHAT MAY BE SHELVED, and it is the only content rule.** Folio serves the text itself, so a book
    goes up only where the copyright has **expired**. For a classical author the trap is that the
    original and the TRANSLATION are separate works. Each book's `rights` states the grounds AND any
    LIMIT (a translation clear in the US on the pre-1929 rule may run to 2042 where the term is life
    plus seventy), and **the book's own page prints it** — the reasoning is shown to the reader.
    **Claim less, and say on the page what cannot be said.**
  · **`BOOKS` is EAGER and the text is LAZY.** The registry holds a tile's worth of metadata so the
    shelf can paint without fetching a word; `BOOK_TEXT` fills from the lazy bundle only when a book
    is opened. Guarded by `test-library.js` watching the request log — a book on the eager path makes
    the site slower for every visitor and the only symptom is a slower site.
  · **The reader's place is the point of the feature** (`S.reading[bookId] = { ch, y, at }`, in
    `defaultState` + `PROGRESS_FIELDS`, so it syncs). `ch` is the chapter **number, not an index** (a
    book gains chapters); `y` is a **fraction of the chapter's own height**, not a pixel offset (text
    size, rotation and width all change pixels). A deliberate move to another chapter starts at the
    top; only a RESUME restores a depth.
  · **The two columns pair on SECTION NUMBERS, never on paragraph order** — see the `<id>.<lang>.js`
    bullet. A row whose other side is empty is still DRAWN; closing the gap would sit each column
    beside a passage it is not.
  · **`linkProperNounsOnly` — a book links only what the prose CAPITALISES.** Run unrestricted over
    Roman philosophy the glossary links `genus`, `epoch`, `iron` and `bronze`, which mean something
    else there. Books-only: a card's background should keep linking `knapping`.
  · **The notes are the site's own footnote apparatus** (`bookNotesHTML` emits `.src-note` /
    `.src-item`, so `wireFootnotes` numbers them), rendered OPEN, and NOT `sourcesHTML` — that carries
    caps written for a card and would truncate a translator's note.
  · **The marker's ink is VECTOR here** (`BOOK_INK_KEY` / `inkRecord` / `inkReplay`), where a card's
    is a raster canvas that cannot be saved; the canvas is **the size of the SCREEN, not the
    chapter**, and a point is a **fraction of the chapter panel**. **Highlights are CHARACTER
    RANGES** in the chapter's own prose, so they stay on their sentence at any width.
  · **A CARD CAN QUOTE THE BOOK IT CITES** (`card.quote` = `{ book, n, text, cite }`, `cardQuote` /
    `cardQuoteHTML` / `.card-quote` / `.cq-go`; `#book/<id>/<n>`. Aug 2026, on request). Five things.
    **THE PASSAGE IS AUTHORED, NEVER EXTRACTED** — a card cites a whole letter or chapter and choosing the
    sentences that bear on its subject is the editorial act the citation apparatus exists for; a machine
    picking them would be quoting at random and attributing it to a translator. **`n` IS THE BOOK'S OWN
    SECTION NUMBER**, the unit `S.reading[id].ch` already records and the one the two columns pair on, so
    nothing new had to be addressed — compared as a STRING, since a section number need not be an integer.
    **IT SITS AT THE BLOCK BREAK**, which is already where sentence 5 ends: every abstract is two blocks
    of five split by ` <br><br> ` (all 666 carry exactly one), so `buildBack` SPLITS on that rather than
    counting sentences, and an abstract without one puts the quotation after the prose rather than
    dropping it. **THE SECTION FRAGMENT IS WRITTEN ONLY WHEN ASKED FOR**, so every `#book/<id>` link ever
    shared still resolves to exactly what it did; an ADDRESSED section opens at the TOP even when it is
    the chapter the reader left, which is the deliberate-move rule above. **AND `add-card.js` CHECKS THE
    REFERENCE AGAINST THE ACTUAL SHELF** — the book against app.js's own `BOOKS` registry and the section
    against the generated `books/<id>.js` — because the renderer's own guard renders NOTHING, and a silent
    blank is exactly what an author cannot see. Guarded by `.claude/test-card-quote.js`.
  · **📖 `docs/library-feature.md` — READ BEFORE TOUCHING THE LIBRARY.** The shelf, the sort and
    search, the favourites, the chapter bar and its slide, the front matter, the bilingual reading and
    its gestures, the ink and highlights, and the per-book licence reasoning in full.
- **PAGES.glossary — the terms this reader has discovered** (`#glossary`, Aug 2026, on request), reached from the
  account page's "Glossary terms opened" meter, which is a `.ex-meter-link` button carrying `data-exgo`.
  `glossSeen` was already a permanent register and was only ever COUNTED; this is the list behind the number.
  Filtered to terms that STILL EXIST (as `glossSeenCount` is — a term retired since it was read would open a
  popup onto nothing) and to curated terms (a deck's are not part of what the meter measures). **The
  undiscovered terms are deliberately NOT listed beside them** — it is a record of reading, not a checklist.
  `setActiveTab` maps this route to `account`, so the tab bar stays lit under a page that is plainly part of
  "your record"; the meter is a link only on your OWN account (`prog === S`), never on a friend's.
  **It SORTS four ways** (`GLOSS_SORTS`, Aug 2026, on request: "by alphabet and date of discovery") — newest
  first stays the default, since the term just met is the one a reader came here about. Two things about it.
  The choice lives in a **module-level `glossSort`, not in `S`**: it is a way of looking at a list rather than
  a preference about Folio, the same call `renderDeckStats` makes about its own picker, so it survives
  navigating away and back and resets on reload. And the filter and the picker share **ONE `repaint()`** —
  the obvious implementation gives each its own handler rebuilding from the full set, which silently throws
  away a filter the reader has typed the moment they re-sort. Alphabetical uses `localeCompare` so an
  accented head word files where a reader expects it, and both date sorts fall back to the title so a
  restored session (which opens several popups in the same millisecond) has a stable order.
- **A STUDY SESSION SURVIVES A RELOAD (Aug 2026, on request).** `study` was not a restorable route: its hash said
  only "study", it was not in `valid`, and the whole session lived in a closure — so a refresh mid-card landed the
  reader on the home page with the card gone. **`STUDY_KEY` (`folio_study_v1`, sessionStorage)** now records
  `{ scope, queue, id, qi, rev, studied }`, written by `renderCard` and by `showAnswer`; boot and `hashchange` read
  it back and pass it to `PAGES.study` as `params.resume`.
  · It holds the **QUEUE**, not just the card: the schedule alone cannot say where a requeued learning step was
    sitting, and the reader was part-way through that order rather than a freshly built one.
  · **sessionStorage**, with the same trade and for the same reason as the gloss popups — an F5 or a dev-server
    live-reload in the same tab restores the session, a tab or browser CLOSE forgets it, so a cold start can never
    resurrect yesterday's queue. A `#study` address with no record simply goes home, which is also what a pasted
    link does.
  · **`route()` clears the record whenever `name !== "study"`** — one choke point, so no page has to tidy up after
    itself, and a language switch (which repaints through `render()`, not `route()`) leaves it alone.
    `renderComplete` clears it too, or a reload from the completion screen would resurrect an empty queue.
  · The `hashchange` branch for `study` must come BEFORE the generic `valid.includes(hh)` one, which would call
    `route("study")` with no scope.
  · **AND THE EDITOR OFFERS A WAY BACK INTO IT** (`studyHold` / the `#adminToStudy` button / `.admin-tostudy`,
    Aug 2026, on request). Pressing Edit on a study card routes to the admin area, which is a navigation, so
    `route()`'s own choke point clears the session — correctly, since every other way of leaving a session
    means leaving it. The Edit button therefore CAPTURES the record first (`showAdminEditBtn`, into a
    module-level `studyHold`), and the editor draws a "Back to studying" button that puts it back and routes
    to `study` with `resume`. Two things follow. **It is a module-level variable rather than a second
    storage key**: a held session must not survive a reload, since the reader would meet a Back button for a
    session the editor no longer knows anything about. And **`clearStudySession()` is the one function every
    caller goes through** — `route()`, `renderComplete` and the hold's own consumer — so there is one place
    that knows what clearing means.
  · **A SUSPENDED NEW CARD NO LONGER COSTS THE DAY ONE** (`refillAfterSuspend(oldId)`, Aug 2026, on request).
    Suspending is the reader saying *not this card*, and the day's allowance had already been spent on it —
    so a reader who suspended five cards got a session of nothing, with the banner still claiming five new.
    The queue is topped back up from the same entry's own unseen cards, skipping anything already in it,
    already seen or suspended. It refills only where the suspended card was NEW: a suspended REVIEW card is
    work the day genuinely no longer has, and manufacturing a replacement for it would deal a card the
    schedule did not choose.
- **A card's PHRASING is state, and the reader can step through it** (`qIdx` in `PAGES.study`, the `.q-cycle`
  chevrons beside the Question label — Aug 2026, on request). Every card carries three ways of asking the same
  thing and which one you met used to be a coin toss per render, with no appeal and nothing surviving a reload.
  `qIdx` is `null` for "not chosen yet"; `renderCard` picks one (at random, or the Card-of-the-day tile's own
  date-seeded choice), and **every move to another card sets it back to null** — `doGrade`, `suspendCurrent` and
  `undoGrade` all do — so a phrasing belongs to the card on screen and never leaks onto the next one. The chevrons
  swap the question **in place** rather than re-rendering, because the answer may already be showing and a reader
  comparing two wordings has not asked for it to be taken away; `c` is a copy whenever there is a pool, so updating
  `c.question` keeps read-aloud and `gradeCloze` on the words that are actually on screen.
- **Lazy data bundles:** `DATA_BUNDLES` + `ensureData(name)` / `dataReady(name)` / `whenIdle(fn)` (defined
  just above the ROUTER block). See the table in the File map for what's in each bundle. `ensureData`
  resolves `true`/`false` and **never rejects**, so a fire-and-forget caller can't raise an unhandled
  rejection; a failed bundle is retried on the next call. Consumers:
  · **`PAGES.map`** holds a `.data-loading` placard until `world` + `atlas` land, then re-renders (`render()`
    re-invokes the *current* page, so this covers `PAGES.findit` too). **It is the one placard with a
    PROGRESS BAR** — see the next paragraph.
  · **`startMiniGlobe`** (home) fetches `world` at **idle** so a 170px ornament never delays first paint,
    and skips entirely under `navigator.connection.saveData`.
  · **Settings' home-location picker** holds just the current home until `world` arrives, then fills.
  · **`loadLangData`** pulls `uiI18n` + `glossI18n` whenever the language isn't English.
  **THE LOAD BAR COUNTS FILES, NOT BYTES** (`dlBarHTML(names)` / `wireDlBar(host, names)` / `_bundleWatch`
  / `bundleFileCount` / `bundleDoneCount` / `watchBundles`, beside `ensureData`; `.dl-bar` in styles.css.
  Aug 2026, on request: "when there are loadscreens, can we add a load bar"). `ensureData` counts each
  file as it settles — **whichever way it settles**, so a bar cannot stall on a failed bundle whose caller
  is about to paint a failure state — and notifies whatever is watching that bundle. Three decisions.
  **Bytes are impossible here and that is a CSP fact rather than an omission**: reading a download's
  progress means `fetch()` plus running the text yourself, i.e. an inline script, and `script-src 'self'`
  holds only because there are no inline scripts (see `_headers`). Per-file is what can be counted
  honestly, so per-file is what is shown. **A bar is DETERMINATE or it is nothing**: `dlBarHTML` returns
  `""` below two files, so a single-file bundle (a book, `usstates`) keeps its spinner rather than showing
  a bar that jumps 0 → 100 and has told the reader nothing. The Atlas — the load anybody actually waits
  for — is twelve files, and measured in a browser it steps 8, 17, 25, 33, 42, 50, 67, 75, 83, 92.
  **And the fill TRANSITIONS its width**, so the global reduced-motion killswitch already lands it on its
  true value with no rule of its own; `wireDlBar` takes itself off the watch list when its bar leaves the
  document, the self-stopping shape `startMiniGlobe` uses.
  **NO COMMITTED SUITE GUARDS IT, and that is worth knowing before trusting it**: the bar lives on the
  Atlas's own load screen, which is gone within a second or two of the page opening, so a browser test
  would be racing the thing it measures. The figures above were read off a live run with the bundles
  instrumented, and that is the check to repeat by hand after touching `ensureData`'s counting.
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
- **RESET PROGRESS CLEARS PROGRESS, AND NOTHING ELSE** (`resetProgress` / `RESET_KEEPS`, beside
  `applyProgress`/`emptyProgress`; Settings → Danger zone. Aug 2026, on a bug report). It was
  `S = defaultState()`, which is not a progress reset but a **factory reset of the whole save**: it took the
  theme, the light/dark and follow-the-system settings, the text size, the language, the day boundary, the
  sound and narrator settings, the Atlas home location, the book sort — and **the decks the reader had
  added**, which is what they noticed. It also threw away `_supaTs` and `_supaOwner`, the device-local sync
  baseline and the record of whose progress this is.
  **A control is allowed to be destructive; it is not allowed to be destructive in ways its own words do not
  describe** — and this one has "cannot be undone" written on it, so the loss is found afterwards. The
  dialog names the study history, the streak and the badges, so those go, and the **artefacts and chests**
  with them (they are what a level buys, and forty of them beside a level 1 badge is the odder outcome).
  **`RESET_KEEPS` is what was never study history**: `active` and `deckOpts` (WHICH decks you study and what
  your daily limits are is a choice, and the one thing a reader cannot easily rebuild), and `reading` /
  `bookFavs` (the Library is not the flashcards — losing your place in a 124-letter book because you reset a
  card schedule is a surprise nothing warned you about). `settings` and `user` are outside PROGRESS_FIELDS
  entirely and are simply not touched; `user.joined` matters because the heatmap starts from it.
  It resets **field by field rather than replacing the object**, so a PROGRESS_FIELD added later is reset by
  default and has to be NAMED to survive — the safe direction for a control like this. The row's own
  description and the confirmation both say what is kept. Guarded by `.claude/test-reset.js`.
- **…and `S.settings.newPerDay` gained the back-fill every setting beside it already had** (same batch).
  `load()` shallow-merges, so a stored `settings` replaces the default object wholesale, and
  `deckLimits`/`reviewLimits` read `S.settings.newPerDay` with **no fallback of their own** — so a save old
  enough to lack the key (it predates every other back-fill line) gives `newPerDay: undefined`, which runs
  as NaN through `deckNewRemaining` into a `slice(0, NaN)` that returns nothing. **The review then offers no
  new cards, ever, with no error and no zero to explain it**: the banner just says the day is done, for
  good. Found by seeding a partial settings object for `test-reset.js` — which is exactly the shape an old
  save has. **When a reader in `S.settings` has no default of its own, it needs a back-fill line.**
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
  previews render in the editing language. Gloss auto-linking stays EN-only. `setLang` itself
  calls `render()`, so the editor re-renders in the new language on switch — but note the picker now lives on
  the Settings page, so switching language means leaving the editor and coming back.
- **Card editor = single live card** (`.card-edit-single` in `adminRenderEditor`): no fields/preview split — ONE
  card-styled surface (`.admin-live-card`) whose question / answer / answerDate / abstract are `.ces-field`
  contenteditables, **double-click to edit in place** (blur locks again; every keystroke saves). Above it: the
  formatting ribbon + a meta row (id, chronology, plain `answerText`) + a collapsible "Appears in N decks" picker.
  Below: a collapsible **whole-card HTML source** (`#cesSrcTa`, sections delimited by `<!-- QUESTION -->`-style
  markers, two-way synced; `.af-src[hidden]{display:none}` is required — the author `display:block` would defeat the
  hidden attribute and leave it permanently expanded). The picture or clip renders in place in **ONE media slot**
  (`#cesMediaSlot`, click = edit panel; the **title / description / source fields (`#cesMediaMeta`) only appear once
  a URL is set** — `syncMediaMeta()` gates them on the GATE's staged src, not the store; the fullscreen
  viewer is suppressed inside the editor via stopPropagation); a card with neither shows an **editor-only**
  "Add an image or a video" placeholder (`.ces-img-ph` — deliberately NOT `.card-img`, so the delegated viewer/study
  page never see it). `.card-edit-single .admin-live-card` carries auto margins (the card caps at 680px inside the 780px
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
  studied** (derived from `S.cards`; no separate persistence). Each level costs **`XP_PER_LEVEL × level`** more cards,
  and **`XP_PER_LEVEL` is 5** (bar starts at 0/5, then 0/10, 0/15, …). It was 3 until Aug 2026 and was raised on
  request, because the daily allowance defaults to FIVE new cards: at a step of three a level turned over in the
  middle of an ordinary day's work, which made the badge mean nothing. **Keep the step and the default allowance in
  step** — the number is a constant precisely so the two can be read against each other, and the two had come
  APART: this paragraph said the allowance was five from the day the step was raised and
  `defaultState().settings.newPerDay` said 3 until Aug 2026, when it was set to 5 on request. Nothing migrates
  there either — the key has been in that object since the beginning, so every existing save carries its reader's
  own figure and only a first-time visitor meets the new one. Nothing migrates for the level: XP is
  derived from `S.cards` on every read, so an existing reader's level simply recomputes on the new curve (roughly
  ×0.77 of the old level number at the same card count). Guarded by `test-card-types.js`, which slices `levelFromXP`
  out of app.js and walks every threshold through level 13.
  **THERE IS EXACTLY ONE LEVEL NOW, AND IT IS FOLIO'S** (`folioXP` = `Object.keys(S.cards).length`), shown on the
  **home Daily-study banner**. Collections had their own (distinct cards studied within them) and it was removed on
  request in Aug 2026, along with the per-script numerals that counted it — `COLLECTION_NUMERALS`, `numeralIn` and
  the five numeral functions (`cnNumeral` / `romanNumeral` / `greekNumeral` / `devanagariNumeral` / `cyrillicNumeral`)
  are **deleted**, as are their `.level-badge.zh` / `.num-*` rules. A collection banner carries a **subject icon**
  and a **studied/total bar** instead — see the collection-icon bullet under "How the app is wired". *(The
  `COLLECTION_NUMERALS` paragraphs in `docs/*-card-plan.md` are historical from that date: read them as a record of
  what each collection would have counted in, not as something to wire up.)*
  **What a level buys is an ARTEFACT CHEST** — see THE RELIQUARY. It used to cap how many decks the daily review
  would hold, which is the opposite of a reward, and that cap is gone.
  **`levelBadgeMarkup` AND `.level-badge` / `.lb-num` / `.lb-lbl` ARE GONE**, and that is a second removal
  finishing a first: the home banner gave its own big numeral up earlier in Aug 2026 on request (see the
  `pileBadgeMarkup` note in `PAGES.home`), which left the badge rendering only on collection banners — so when
  those lost their levels, nothing was calling it at all. The level is still spelled out **in words** by the
  banner's xp bar, which **runs in gold** (`.banner .xp-fill` + `.xp-lvl`): the Library's bars take each
  collection's hue and the account's are indigo, so one indigo bar read as another. Its "Level N" label is a
  DEEPER gold than the fill — `#C39A2E` on the card is only 3.6:1, too thin for 10px text. The earned
  `.done`/`.won` fills override both with their own on-fill colour, since gold on gold reads as nothing.
  **The Daily-review list got one back** in July 2026, on request: each added row carries an `X/X studied` bar
  (`adProg` in `PAGES.home` → `.prog.dk-prog`, animated by the existing `animateProgs`) where a blue `.dk-dot` used to
  sit. (The bin at the right of each row went in Aug 2026 — Remove moved into the row's long-press options sheet;
  see `docs/daily-study.md`.) The dot and the ancestor rows' hollow `.dk-branch` went together — the branch existed only to line the two up,
  and alone it would have pushed every parent title 21px right of the deck beneath it; the `data-depth` indent carries
  the hierarchy. The bar's label also replaced the `.dk-count` "N cards" chip, which stated the same total twice.
  **THE BAR UNDERLINES THE ROW AT EVERY WIDTH** (Aug 2026, on request), where it was a bottom edge on a
  phone and an inline track between the name and the figure above 640px — two rules answering one
  question. The phone's answer is the better one and its reason holds everywhere: an underline costs the
  line no width, where an inline track's length is paid for out of the deck's NAME, the one part of the
  row with no shorter form. The media query is gone and the base rule is the phone's; the row is still
  `position:relative; overflow:hidden`, which is what clips the track to the last row's rounded corners.
  **AND THE FOLD SURVIVES A RELOAD** (`adFoldMap` / `adFoldSet`, `localStorage["folio_ad_open_v1"]`, same
  request): only an EXPLICIT choice is stored, so a row nobody has touched still takes its seeded default,
  exactly as a card type's disclosure works.
  **A FINISHED COLLECTION GOES GOLD** — `deckProgMarkup` and `adProg` both write `prog-done` on the BAR
  when studied ≥ total > 0, and the stylesheet takes the NAME from there with `:has()`, so the two halves
  cannot come apart and every surface drawing one of those bars is covered without a rule apiece.
  **The row is ONE horizontal line** (Aug 2026, on request): piles · name · figure · bin, all centred on the same
  level, with the row's vertical padding down to 10px. It was two lines — the title on top and the bar indented
  under it — which left a band of empty card either side of a short deck name. Two things had to give for five
  things to share a 390px screen. **Below 640px the bar leaves the line and becomes the row's own bottom edge**
  (`.dk-prog .track` absolutely positioned along it; the row is `position:relative; overflow:hidden` so the last
  row's rounded corners clip it), an underline costing no width at all — measured, the label alone is ~88px and
  the name needs ~100, so an inline track of any useful length can only be paid for by cutting the deck's name.
  **Above the breakpoint it stays in the line**, stretched between the name and the figure, which is what fills
  the middle of a wide row; the phone block must therefore sit BELOW those rules, a media query adding no
  specificity. And the label was shortened to **`X/X studied`** (its `I18N_RULES` pattern moved with it in all nine
  languages, the old one retired). The `data-depth` indent went with them, from `22 + depth*21` to
  `16 + depth*16`. The name is the only thing that ellipsises, since it is the only part of the row with a
  shorter form.
  **NEVER NAME A CLASS `ad-…`, AND THIS WHOLE ROW WAS RENAMED `ad-` → `dk-` BECAUSE OF IT** (Aug 2026, on a
  bug report: "on desktop, the active decks don't display their names"). The row's parts were named for the
  ACTIVE DECK they belong to — and `.ad-body` and `.ad-title` are also real advertisement class names, so
  **EasyList and its relatives carry generic cosmetic filters for them**: on any reader with an ad blocker
  the deck's NAME and the bar beside it were `display:none`, leaving a row of bare numbers with the chevron
  slid left against them. An ad blocker injects those rules as an **origin-level user stylesheet**, so no
  specificity, no `!important` and no inline style can outrank one — renaming is the only fix. Three things
  are worth carrying. **It is the quietest failure shape this file records**: the markup was perfect (the
  name is right there in `innerHTML`), nothing threw, every other page was untouched — the Collections page
  renders the same titles through `nodeTitle` and uses no `ad-` names — and it could not be reproduced at
  any width, font size, theme or state, because **Playwright runs no extensions**. It was settled only by
  reading `getComputedStyle` off the reader's own machine. **The blocker took `.ad-body` and `.ad-title` and
  left `.ad-counts`, `.ad-grip` and `.ad-chev` alone**, which is why the whole prefix went rather than the
  two that were caught: being in the lists is a matter of which names real ad markup happens to use, and the
  next list update is not something to find out about from a bug report. `ads-`, `advert…`, `sponsor…`,
  `promo…` and `banner-ad` are the same trap. **It has fired since**: the Aug 2026 pending-deck row was written
  `.ad-pending`, for the ACTIVE DECK it belongs to, and is `.dk-pending`. **The guard is a STATIC check** — `adBaitCheck()` at the top of
  `.claude/test-layout.js` scans the stylesheet's selectors and every `class="…"` in `app.js`/`index.html`
  and fails the build on one — because a browser test cannot see this at all; and the row's own assertion
  now measures that the name is **drawn** (text, width, and a `.dk-body` that has not collapsed), the old
  "not cut off" test having passed on a hidden title, whose `scrollWidth` and `clientWidth` are both 0.
  Each collection's PROGRESS is also listed on the **profile** (`renderCollectionLevels` in
  `acctSelfView` — the name is historical; the section is headed "Collection progress" and shows an icon and a
  studied/total bar). `grade()` calls `announceLevelUps()` on a freshly-studied card, which grants a chest and
  **opens the chest overlay** — that overlay IS the level-up celebration now, so `congratsPopup` is no longer
  raised behind it (two overlays for one event). `congratsPopup(items)` (a `.levelup-pop` overlay modelled on
  `inlineModal`) survives for anything else that wants it and is **dismissed by clicking anywhere on screen**
  (or Esc/Enter) — the click-to-close listener is wired a tick later (`setTimeout 0`) so the click that spawned
  it doesn't instantly dismiss it.
  **`render()` closes it too** (`closeCongrats`, beside `closeImageViewer`, Aug 2026). Dismiss-on-any-click made
  it look as though it could not outlive its page — clicking a nav tab takes it away — but a back/forward, a
  deep link and any programmatic hash change move the route without a click, and it then sat over whatever
  rendered next. It lives on `document.body`, so like every other overlay there it is `render()`'s to clear.
  Clicking a **deck row in the home Daily-review list** starts a study session scoped to just that deck
  (`data-review` → `route("study",{scope:{type:"deck",id}})`). On the **Library page, clicking a collection's body studies its
  whole subtree** (`wireExpander`'s optional `rowClick` → `route("study",{scope:{type:"deck",id}})`, since a collection is in
  `NODE_BY_ID` and `subtreeCardIds` covers it); its **chevron still expands/collapses** the decks within (the chevron's
  `stopPropagation` keeps it from also studying). A coming-soon / empty collection falls back to toggling.
- **THE RELIQUARY — artefact chests** (the `THE RELIQUARY` block in app.js, just below the levels block;
  `artefacts.js`; Aug 2026, on request). A level buys a **chest**, and a chest holds one real historical
  object — the first thing a Folio level has ever GIVEN the reader rather than taken away.
  · **RARITY IS THE WHOLE LANGUAGE**: `RARITIES` holds Common / Rare / Epic / Legendary at 60 / 25 / 12 / 3,
    and styles.css declares one token pair each (with separate NIGHT and `body.hc` values — a colour mixed
    toward a dark paper loses the thing that identifies it). `[data-rar]` sets `--rar`, so the chest, the
    reveal, the tile, the plate's wash and the admin row all say "this is an epic" the same way.
  · **A RARITY THE READER HAS FULLY COLLECTED IS DROPPED FROM THE ROLL**, not re-rolled into a duplicate:
    `rollArtefact` renormalises over whatever still holds something unowned, so every chest is a NEW
    artefact until the pool is exhausted, and then it SAYS so. With a small pool that is the difference
    between a reward and a slot machine, and a duplicate reads as bad luck rather than as a bug.
  · **THE CHEST IS THE LEVEL-UP CELEBRATION, not a second one after it** — `announceLevelUps` grants and
    opens, and `congratsPopup` is no longer raised behind it. **AN UNOPENED CHEST QUEUES** (`S.chests` is a
    COUNT), and since Aug 2026 the reader can say so: **Save for later** stands beside the closed chest and
    `chestBannerHTML` says one is waiting above the daily-study banner.
  · **THREE CHANNELS**: a level; the **daily sweep** (all games won in one day, `S.sweepChest` recording
    the DAY rather than a boolean, since nothing runs at midnight); and the **STREAK, every seventh day**
    (`S.streakChest` is the streak length last PAID, so the test is arithmetic and can never pay twice for
    one day), each week worth one chest more than the last.
  · **A CHEST MAY ALSO HOLD A THEME** (Aug 2026, on request): the five non-`folio` themes are locked until
    one drops, at `THEME_DROP` (14%) while any are still locked. **`themeGrandfather` is the part not to
    remove** — a theme already worn is written into the register, once, or the change would silently strip
    five of the six from every existing reader. `setTheme` is the gate, and it stays one as a backstop:
    the Settings picker lists **only what the reader owns** and draws no locked tile at all (Aug 2026, on
    request), so nothing renders the id that guard refuses.
    **BUT THE THEME ROW ITSELF IS ALWAYS DRAWN, AND HIDING IT UNTIL A CHEST HAD DROPPED ONE WAS THE
    OVER-REACH** (Aug 2026, on a bug report: "I don't see anywhere to change my theme on the settings
    page"). Listing only what is owned was the request; hiding the whole section was a second decision
    taken beside it, and it took the feature off the page — a reader found a Settings page with no
    mention of themes and no way to tell an empty collection from a control that had moved or broken.
    **The state belongs in the COPY, not in whether the row exists**: the row names how many are still to
    find and where they come from, and says nothing once the set is complete. A sentence can be right in
    every state; a hidden row is right in one.
  · **THE PLATE IS ONE BUILDER** (`artefactPlateHTML` + `wireArtefactPlate`), used by the reader's overlay
    and by the admin preview alike — a preview written from a second copy of the markup drifts silently.
    **THE SHOWCASE IS FOUR** (`SHOWCASE_MAX`), filtered on the way OUT so a retired artefact leaves no slot
    pointing at nothing, and its actions sit at the TOP of the plate rather than below five sentences.
  · **TWO FAMILIES OF BADGE WERE UNREACHABLE FOR MONTHS, AND BOTH FAILED IN THE SAME SHAPE** (Aug 2026,
    on a bug report: the badges "for adding a friend and completing a 'daily challenge' … do not work").
    **A COUNT WAS BEING READ FROM SOMEWHERE THAT HAD STOPPED BEING WRITTEN.** `checkAchievements` took
    the friend count from `currentUser().friends` — `ACCT`, the LEGACY device-local accounts, retired
    when accounts moved to Supabase and empty for everybody since — so First Friend and Well Connected
    were tested against a hard 0. Friends now live in a table RLS-scopes to rows involving their owner,
    and a badge is tested mid-session and cannot go to the network, so the count is RECORDED:
    `setFriendCount` writes `S.friendCount` (a `PROGRESS_FIELD`) whenever the friends list is drawn, and
    `progStats` falls back to it. That also fixes a friend's OWN badge grid, which was passing a literal 0.
    And **`S.daily.wins` was incremented inside Multiple Choice's results screen**, written when that game
    WAS the daily challenge — so sweeping the other eight every day unlocked neither Victor nor Champion.
    It is counted in **`markGamePlayed`** now, the one door every game already goes through, gated on
    `freshWin` (which the one-play-a-day rule makes a game's only win of the day), so a tenth game is
    covered without anybody remembering this. **The badges say "minigame" rather than "daily challenge"**
    (same request) and the ids are untouched, for the reason the Library's route was when it became
    Collections: renaming one takes the badge off everybody holding it.
    **THE LESSON IS THE SHARED ONE: A BADGE THAT CANNOT FIRE LOOKS EXACTLY LIKE A BADGE NOT YET EARNED.**
    Nothing throws, nothing is logged, and the reader assumes they have not done enough. When a badge's
    `test` reads a counter, check that something still WRITES that counter.
  · **FIFTEEN COLLECTOR'S BADGES** read `progStats`, and are tested **at the moment they are earned**
    rather than at the next card. A badge grants a chest, so the chest balance is not a plain subtraction —
    `spendChest()` increments `S.chestsOpened`, which is what the tests assert against.
  · `S.artefacts` / `S.chests` / `S.showcase` / `S.sweepChest` / `S.chestsOpened` / `S.themes` /
    `S.published` / `S.publishedIds` / `S.theme` are in `defaultState` AND `PROGRESS_FIELDS`; **`themes`
    and `theme` are additionally in `RESET_KEEPS`** — the artefacts and chests still go, being what a LEVEL
    bought. Guarded by `.claude/test-artefacts.js`.
  · **IT HAS A PAGE OF ITS OWN** (`PAGES.reliquary` at `#reliquary`, `RELIQ_SORTS`, `artefactYear`,
    `_reliqRepaint`; Aug 2026, on request). Your OWN collection is a page — an address, a back button and
    a sort a reader can leave set; a FRIEND'S is still `openCollectionWin`, because a route carries a name
    and nothing else and there is nowhere for somebody else's progress to ride. Four things.
    **The sort is the Library shelf's pair, not a second control**: `sortPickerHTML` chooses the field and
    `sortDirHTML` the direction, which is what spends "and reverses" on one button rather than doubling the
    list; the choice is a MODULE-LEVEL variable, like the glossary record's, since it is a way of looking at
    a list and not a preference about Folio. **"Unlocked date" needed no new field** — `S.artefacts[id]` has
    always been `Date.now()` rather than `true`. **"Artefact dating" needed a parser and it is NOT
    `cardYears`**: 42 of the 100 are dated by century, which that function deliberately cannot read (see
    the date-line note under "Add a card" — teaching it to would move the sort year of 52 shipped CARDS),
    so `artefactYear` reads the century and millennium forms itself, including the range whose unit carries
    rightwards (`1st – 3rd century CE`, where the simple pattern reads the SECOND ordinal and dates the
    object two centuries late), and falls through to `cardStartYear` for the rest. **And the signed-out
    account page's inline grid became an entry to it** (`reliquaryHTML(…, { entry: true })`), which is the
    same duplication the signed-in page had removed on request a fortnight earlier.
  **📖 `docs/reliquary.md` — READ BEFORE CHANGING ANY OF IT.** The reveal's per-rarity timings and sounds,
  the shallow lid, the plate's wash and its media frame, the glossary links inside a plate and the z-index
  drop plus `escTakenAbovePlate` they forced, the showcase's empty-slot control and "See Reliquary", why a
  guest's artefacts show on the signed-out account page, and the streak meter's pips.
- **A BATCH OF INTERFACE FIXES, Sep 2026, all on request.** Each is small; three of them have a reason
  worth keeping.
  · **THE CARD'S STATE DOT IS OUTSIDE THE "Question" LABEL** (`cardStateDotHTML`, `.study-card .q-dot`).
    It was INSIDE it, and `.study-card .label` carries `opacity:.5` — **opacity on an ancestor is a
    GROUP**, so the dot's own `opacity:1` could not escape it and no colour, `!important` or otherwise,
    could have. Outside, it is the same ink as the study bar's three counts, which is what was asked for.
  · **AN ENLARGED PICTURE'S CAPTION IS INSIDE `.iv-stage`**, which is a centred column, so the words sit
    directly under the image at any shape rather than at the foot of the screen. The picture is
    `flex:0 1 auto` against a `flex:none` caption, so a tall one yields the height the words need; the
    pan/zoom handlers skip a press that begins in the caption, the credit being a link.
  · **AN ARTEFACT'S PICTURE SPINS WHILE IT LOADS** (`.ar-loading`), cleared by a delegated capture-phase
    `load` listener beside the `error` one — and by `wireArtefactPlate` asking `img.complete`, since a
    cached file fires `load` before the plate is in the document.
  · Clicking your own profile photo opens a two-item menu (Edit / Remove) through `showCtxMenu`; with no
    photo set it still opens the picker outright, a menu of one being a button wearing a second press.
    The separate Remove-photo row is gone. **"See Reliquary" is on the "Profile showcase" heading's own
    line**, which is why `showcaseHTML` emits that heading rather than each account page writing one.
  · **THE DECK LIST'S EDIT BUTTON IS BACK AT THE FOOT OF THE LIST**, in `.rv-foot`, opposite the study
    timer — so `.rv-topacts`, the absolute overlay that laid it over the banner's corner because a
    `<button>` cannot contain one, is gone with its two media queries. The timer now stays on screen in
    the mode, which reverses an older rule deliberately: it cannot sit "opposite" a control that is not
    drawn. The mode gained a **switch for the gold icons** (`S.settings.deckIcons`, asked in `adIcon`),
    which is a STATE rather than an action and so is deliberately not on the Undo stack beside it.
  · On a phone a played minigame tile's check or seal fills its top-right quarter, sized as a FRACTION of
    the tile so it stays a quarter at every width; and the Atlas timeline runs the full width with the
    year centred, the 74px right padding it gave up having been reserving room for buttons that stop
    where that bar begins.
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
  never landed, and it is scheduled properly regardless. **EVERY SESSION NOW ENDS AT THE HOME PAGE** (Aug 2026,
  on request): `fromHome` is gone, and the exit button, the caught-up placard and the completion screen all
  route there. It used to depend on the scope — the review, the Card of the day and a group returned home
  while a DECK returned to the collections — which was written when a deck was something a reader found on
  that page. It is not any more: a deck is added to the daily study and tapped on its own row on the home
  page, so that is where a reader finishing one came from and where their other decks are waiting, and the
  collections are one press further on from the lip the home page advertises. It is ONE answer rather than a
  rule per surface, since a completion screen going home while the exit beside it went to the collections
  would be two answers to one question.
- **THE DAILY STUDY — per-deck limits, and a review pooled from all of them.** There used to be ONE global
  allowance sliced off the front of the pooled card list, so a reader with two decks got every new card from
  whichever came first and never saw the second at all. The shape is Anki's. The operational half:
  · **`deckLimits(id)` → `{ newPerDay, maxReviews, newIgnoresReview }`**, stored in **`S.deckOpts`** keyed by
    the same entry id as `S.active` and written only for decks the reader has actually changed;
    `DECK_MAX_REVIEWS` (50) and `S.settings.newPerDay` (5) / `maxReviewsPerDay` are the DEFAULTS behind them,
    set in the Daily limits sheet's **All decks** tab. `S.deckDay` holds TODAY only and resets in place.
  · **EVERY COUNT IS DERIVED, NEVER TALLIED** (`deckDoneToday`): `grade()` writes `c.first`, the day a card
    was introduced, and every per-deck new count is read back off it — which is what makes the figures right
    for a deck outside the review, right after an undo, and right for a card in two decks at once.
  · **A CARD ON A LEARNING STEP IS ALWAYS REACHABLE** (`learnAheadIds` / `scopeAllIds`; Aug 2026, on a
    bug report that a deck row showed a red count and then said the day was finished). `entryPiles` and
    `pileCounts` count a learning card from the moment it is failed until it graduates, and every
    queue-builder selected on `isDueNow` — both right, and contradicting each other for the nine minutes
    the step lasts. **The fix is NOT to drop the timer**: the requeue already puts a failed card at the
    back of the queue WITHIN a session, and across sessions the delay is the whole of what a step is. So
    the queue learns ahead instead, Anki's `collapseTime` answer — **ONE TAIL STEP in `buildSession`
    rather than a fix in each of its six branches**, firing only on an EMPTY queue, so the spacing is
    untouched while there is other work. **It carries no window, unlike `SCHED_AHEAD_MS`**, which bounds
    the in-session requeue: a bound here would put the disagreement back the day a step ran longer than
    it. Guarded by `test-review-decks.js` section 21, which asserts the two AGREE rather than any figure.
  · **THE POOLED REVIEW IS ITSELF AN ENTRY**, `REVIEW_ENTRY` (`"review:all"`), so `deckLimits` /
    `deckDoneToday` / `entryCardIds` / `entryInfo` and the long-press sheet all answer for it as for a deck —
    which is what makes the banner and the rows beneath it arithmetically incapable of disagreeing. Its
    default new-card limit is the LARGEST any added deck offers, never the global figure.
  · **`reviewQueue` BUILDS DECK BY DECK AND THEN POOLS**, deduping BEFORE the slice, and `mixPiles`
    INTERLEAVES due and new in every branch — a session that deals every review and then every new card is
    two sessions rather than one.
  · **AN OPTION CASCADES AND A QUANTITY DOES NOT** (`DECK_OPT_INHERIT` / `entryChain` / `deckOpt`): a POLICY
    — the order, FSRS, read-aloud, question variety, pairing — means the same thing wherever it is applied
    and is handed down to subdecks and directions; a LIMIT handed down to nine levels becomes nine times
    itself, which is the exact bug the per-deck limits were built to fix.
  · **A NOTE'S TWO SIDES ARE NEVER DEALT BACK TO BACK** (`spreadNoteSiblings`, one tail pass in
    `buildSession`; Sep 2026, on request, "unless they are the last two cards left"). A vocabulary note
    studied both ways is two cards with two schedules, and every branch orders by deck, pile and
    difficulty without asking which NOTE a card came from — so a word could be asked one way and then, on
    the very next card, the other, with the answer still on screen. **It DEFERS rather than shuffles**: a
    card that would follow its sibling is held back and the next non-sibling dealt first, so every
    ordering promise the branches made is kept except at the one seam that had to move. It honours
    `deckPairNew`, which is the deliberate opposite of this, and works **IN PLACE**, the queue carrying
    `_sd` / `_ud` / `_unseen` as properties a copy would drop.
  · **THREE ORDERS** (`DECK_ORDERS`): Ordered, Random, By difficulty, per entry with a global default,
    reached by a CYCLER on the deck's long-press sheet. **`studyOrder` deals a multi-subdeck entry
    round-robin, each subdeck a day behind the last**, so a two-way deck asks the reverse the NEXT day rather
    than a second later.
  · **THE ROW IS ONE LINE, WEARS ITS COLLECTION'S HUE, AND IS DRAGGED INTO THE READER'S OWN ORDER**
    (`S.deckOrder`, per level, keyed by parent). Holding it opens the sheet — Custom study, Daily limits,
    Scheduling, Skip today, Colour, Icon, Remove. **NEVER NAME A CLASS `ad-…`**: `.ad-body` and `.ad-title`
    are real ad class names, so EasyList hid the deck's NAME for every reader with an ad blocker; the prefix
    is `dk-` and `adBaitCheck()` in `test-layout.js` is a static guard against it.
  · **THE READER'S OWN CONTAINERS** (`S.deckGroups` / `S.deckNest`): a group holds decks dragged into it,
    folds, can be renamed and coloured, and studies everything under it. **A container counts what is drawn
    UNDER it**, so a collection that has lost two decks to a group stops claiming their cards. **⚠ No new
    group can be MADE** — the control was removed on request; everything a reader who already has one needs
    still works.
  · **A LANGUAGE CAPS ITS DECKS; IT DOES NOT CASCADE TO THEM** (`langCtxLimits` / `langCtxOf` /
    `entrySkippedToday` / the buckets in `reviewQueue`; Aug 2026, on request: "custom study, scheduling,
    daily limits, and skip should also be options on the language collections"). **THE DRAW IS THREE
    LEVELS DEEP NOW** — the deck, then its language, then the pooled review — because a QUANTITY handed
    down to nine decks is nine times itself, which is the exact bug the per-deck allowances were built to
    fix, so a container can only ever slice what its members hand up. **Its default is the SUM of its
    members'** (the review's is the WIDEST, because the review is meant to cap a whole day and a language
    is not), which makes an untouched container arithmetically incapable of changing what is dealt. **A
    PENDING deck counts towards that sum** — these are an ALLOWANCE the reader sets and reads back, not a
    forecast of today, and excluding one made a language whose decks are not downloaded read "0 new/day"
    and then change on its own when a file landed. **Custom study is the cap run backwards and
    needs the supply raised too** — spread across the members rather than given to each, or three rows
    each promise five more where five will come. **SKIP AND SCHEDULING ARE POLICIES AND DO CASCADE**: two
    states mean the same thing nine levels down, so `entrySkippedToday` is what every reader of "is this
    sitting today out" goes through, and `sched`/`retention`/`fsrsParams` were already reaching a deck's
    language through `entryChain`. **A GROUP still gets none of the four**, deliberately: it is an
    arrangement holding decks from anywhere, so a figure on it would cap several collections at once from
    a row that names none of them.
  · **A LANGUAGE'S HEADER IS A SYNTHESISED CONTAINER, AND ITS ONE ACTION IS ITS OPTIONS** (`langCtxId`,
    `.dk-langhead`, `data-langhead`; Aug 2026, on a bug report that holding one opened nothing). It carries
    no `data-review` — it deals no cards — so neither of the home page's two hold-menu walks reached it, and
    a row that answers a hold with nothing looks exactly like a row that was never meant to. It is a real
    `role="button"` with a tab stop now and the TAP opens the sheet as well as the hold, this being the one
    row with no session to open instead; that is also its keyboard route, a hold not being something that
    can be typed. **It takes the GROUP's shape of the sheet** — the cascading session settings, a name, a
    colour and an icon, never the daily allowances, which belong to something the review iterates — and its
    last row is Remove, a language not being something that can be taken apart. **Four helpers know about
    it and each was silent in its own way**: `entryChain` (or a switch is stored where nothing reads it),
    `entryInfo` (or the sheet is headed `langctx:spanish`), `removeActive` (the container is not in
    `S.active`, so the ordinary path removes nothing) and `entryExists` (without which a deck dropped on the
    header is drawn twice, once under it and once loose). Guarded by `test-lang-decks.js` section 4.
  · **ADDING A COLLECTION ADDS EVERY DECK INSIDE IT**, removing takes the node, its subtree AND its
    ancestors, and `refreshAddButtons` re-reads every `+` on the page rather than the one pressed. **There is
    no deck cap** — the Folio level used to be one, and it was the only thing a level decided.
  · **THE HANDLES, THE CROSSES AND THE RENAMES LIVE IN AN EDITOR MODE** (`deckEditOn` /
    `deckEditCheckpoint` / `deckEditBarHTML` / `setEntryTitle` / `.rv-editing`; Aug 2026, on request). The
    grips used to sit at `.32` on every row at rest, which is six handles competing with six deck names;
    they are `visibility:hidden` until an **Edit** button is pressed — hidden that
    way rather than with `display:none`, so the column the row's padding reserves for them does not
    collapse and re-open, and `visibility` rather than `opacity` alone because an invisible control that
    still swallows the press meant for the row underneath is the worse failure of the two. Six things.
    **IT IS LIVE, WITH AN UNDO STACK**, chosen by the reader when asked: every edit lands at once, exactly
    as before the mode existed, and the stack is what makes that safe — a STAGED editor would mean
    rendering the list from a working copy rather than from state, which is a rewrite of the list rather
    than a mode over it. **THE SNAPSHOT IS OF FIVE FIELDS** (`DECK_EDIT_FIELDS`), taken BEFORE each edit,
    `adminCheckpoint`'s shape and for its reason: a removal is lossy — a deck takes its subdeck rows, its
    nesting and its place in the order with it — and none of that can be derived back out.
    **THE THREE BUTTONS ARE Undo / Revert / Done, NOT save/exit/undo as asked**: in a live editor "save"
    and "exit" are the same button pressed twice, so Revert is the one that puts everything back and Done
    is the one that just closes. **A RENAME WORKS ON EVERY ROW** — `groupTitle` has always read
    `S.deckGroups[id].title` and fallen through to the node's own title, so one override field already
    served the whole list, and it rides in the record the colour and icon are in, so it syncs and survives
    a reset with no schema of its own; `data-shipname` on every row is what lets `setEntryTitle` tell a
    real rename from the reader typing the existing name back, which CLEARS the override rather than
    storing a copy of it. **THE BUTTON IS AT THE BANNER'S TOP RIGHT** (`.rv-topacts`, Aug 2026, on request:
    "move the active decks edit button and study timer to the top right of the Daily Study banner …
    vertically centered to the Daily Study title" — and then, the same day, "move the timer back to where
    it was before", so the corner holds the button alone and `.rv-foot` still holds the timer). It is a
    SIBLING of the banner rather than a child of it, and that is forced: the banner is a `<button>`, so a
    real `<button>` inside it is hoisted straight back out by the parser — the row is laid over the corner
    with `pointer-events:none` and `auto` on its children, which keeps the rest of the banner one big
    pressable tile. The vertical centring is the title's own line box (the banner's padding for `top`, the
    title's font-size for the row's `height`), so it follows the text-size setting with no second set of
    numbers; the title's `padding-right` is the reservation that keeps the two apart and MUST be kept in
    step with the row's width; and the row steps aside for the completion mark, which is in the same
    corner. **It is DRAWN WHENEVER THERE ARE DECKS**, never only when the timer has something to say,
    which would have hidden the Edit button every morning — **and it survives the list emptying while the
    mode is open**, the one state that would otherwise strand a reader with no Revert to get the last deck
    back. **AND IT IS A MODE, NOT A SETTING**: module-level, so it survives a repaint and resets on reload.
  · **Guarded by `test-review-decks.js`** (sections 1–5, 8–11, 17–21) **and `test-layout.js`.**
  **📖 `docs/daily-study.md` — READ BEFORE TOUCHING THE REVIEW OR A DECK'S OPTIONS.** Why each rule above
  exists, what every sheet row is for, the sheet's arming window and its ×, the group machinery in full, and
  the faults that were invisible on the page — a subdeck dealing one direction for thirty days, a phone drag
  filing a whole collection inside its neighbour, a duplicate function declaration that silently stopped the
  drag order being saved at all, and a global allowance that handed back a number no deck had agreed to.
- **THE DAY BOUNDARY** (`dayKey` / `dayKeyOfDate` / `dayEndMin` / `dayEndTs` / `scheduleDayRoll`). A day
  runs on **THIS DEVICE'S OWN CLOCK** and ends at `S.settings.dayEnd` (minutes past midnight, 0 by default,
  capped at noon — **Settings → Study → Day ends at**), so a reader who studies until two in the morning can
  keep the day open until then. **`dayKey(ts)` is the SINGLE derivation and everything goes through it** —
  the quote, the card of the day, the streak, the review's allowance and every game's per-day record — since
  a rule applied in nine places out of ten leaves one surface rolling over at a different moment from its
  neighbours. It was a UTC day until Aug 2026, which was midnight for nobody off the Greenwich meridian.
- **THE SCHEDULER — Anki's SM-2, ported** (the `THE SCHEDULER` block in app.js), and **FSRS beside it,
  chosen per deck** (the `FSRS` block, plus `THE FSRS OPTIMISER`). The operational half:
  · **THE WHOLE OF IT IS PURE** — `schedAnswer(card, grade, t, seed, cfg)` returns a NEW record and reads no
    global, no DOM and no clock beyond its `t`. That is what lets `test-scheduler.js` walk every path as
    arithmetic and what keeps the undo snapshot valid. The four impure config lookups (`schedModeOf`,
    `deckSchedCfg`, `cardEntryId`, `schedCfgFor`) sit BELOW the `/* ---------- SRS ---------- */` marker,
    which is where that suite stops slicing — **keep new config readers on that side of the line.**
  · **`SCHED` holds Anki's defaults in one place** (learning `1m 10m`, relearning `10m`, graduating 1 day,
    easy 4, starting ease 2.5, floor 1.3, hard ×1.2, easy bonus ×1.35, lapse ×0 with a 1-day minimum, max
    36500 days, leech at 8). A new card WALKS the steps; a lapse RELEARNS rather than resetting; `status`
    has four values and every counter calls **`schedIsLearning()`** rather than testing for `"learning"`.
  · **THE FUZZ IS SEEDED BY THE CARD, NOT THE CLOCK**, and `schedPreview` and `schedAnswer` take the SAME
    `t` — that is what makes a button reading "12d" schedule twelve days.
  · **ANYTHING MEASURED IN DAYS LANDS AT THE START OF ITS DAY** (`dayStartTs` / `SCHED.dayAnchor`), the
    reader's own boundary; anything in minutes is a real delay from now.
  · **FSRS REPLACES THE INTERVAL ARITHMETIC AND NOTHING ELSE** — the statuses, the steps, the fuzz, the day
    boundary, the requeue rule and the leech count are untouched, which is also how Anki does it. It is
    **FSRS-6, read off the reference implementation and pinned against `.claude/fsrs-vectors.json` to 1e-9**;
    decay and factor are derived from `w20` and must never become constants. Seeding takes the INTERVAL and
    not the ease. The mode lives in `S.deckOpts[entryId].sched`, so **nothing migrates** and the pooled
    review honours each card's own deck.
  · **THE OPTIMISER FITS THE READER'S OWN PARAMETERS** from the review archive, on the page a step at a
    time, and is **allowed to refuse** — too little history, or a fit that does not beat the defaults on a
    held-out tail. It stages its result rather than saving it.
  · **LOAD BALANCING AND EASY DAYS ARE ONE MECHANISM** (`schedFuzzRange` / `schedSpread`, in `schedPass`, so
    both schedulers get it): they replace the fuzz's CHOICE of day and nothing else, so the result is always
    inside the range the unbalanced fuzz could already have picked. Both default OFF. A marked day is
    AVOIDED, never forbidden.
  · **Guarded by `test-scheduler.js`** (arithmetic, the fixture, the optimiser's loss) **and by
    `test-review-decks.js` sections 6 and 11–17** (the same rules in a real session).
- **THE NOTE→CARDS EXPANSION AND `availableCardIdSet` ARE CACHED** (`_uStudyCache` / `_availCache` /
  `uCacheBust` / `uDeckStudyIdsFor`). Both are DERIVED on every read, which is what keeps them honest, and
  both are O(the whole deck) — one home render asked for the expansion sixteen times. Keyed by (deck,
  subdeck) and thrown away WHOLE by `uCacheBust`, since a stale entry would silently deal the wrong cards;
  `availableCardIdSet` additionally depends on the collection tree, hence the bust in `applyAdminEdits`.
  **The declarations sit beside `applyAdminEdits` and must stay there** (that function busts them and runs
  at boot), and **both hand back the live array/Set** — every caller was audited, so nothing may sort or
  push in place.
- **BURY SIBLINGS.** Answering one card of a note puts the note's OTHER cards off until tomorrow, which is
  what makes asking a word in both directions worth doing. `S.buried[id]` is the DAY it was buried, never a
  boolean, so nothing has to run at midnight; it is in `PROGRESS_FIELDS`, undo un-buries through the
  ordinary snapshot, only a community note can have siblings, and **the live queue is filtered too** — the
  one in hand was built before the grade. Default ON. Guarded by `test-card-types.js`'s `buryChecks`.
  **📖 `docs/scheduler.md` — READ BEFORE TOUCHING THE SCHEDULE.** Why the port is Anki's rather than an
  approximation, why the FSRS fixture is generated by the reference and never regenerated to match a
  change, what the optimiser measures and what it deliberately does not, and the faults that were invisible
  on the page — the ordering floor walking Easy past the maximum interval, a preview reading a different
  clock from the grade, elapsed days read as a fraction where every fitted parameter set assumes whole ones,
  and a one-day interval that meant twenty-four hours from whenever you happened to grade it.
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
- **The grade bar is ONE row below 430px** (Aug 2026). Two rows of two plus a help/suspend row took about a
  quarter of a phone screen, over a card whose background already runs several screens. Four columns fit once
  `.gk` goes — those digits name keys a phone does not have — and `body.grading .stage`'s bottom padding drops
  from 206px to 150px to match.
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
- **Undo is repeated INSIDE the grade bar on a phone** (`#undoGradeBar`, `.gb-undo` — Aug 2026, on request).
  The study bar's `#undoGrade` sits at the top of a card that runs several screens, so on a phone the one way
  back from a misclicked grade was scrolled off screen at exactly the moment it was wanted. The grade bar's copy
  takes the `undo` cell of `.grade-wrap`'s phone grid (`"grades grades grades" / "help undo suspend"`), beside
  the `?` that explains the buttons above it. It is a SECOND button rather than a moved one because the grade
  bar only exists once the answer is revealed, and the study bar's copy still has to be there before that;
  `body.grading .study-shell .undobtn{display:none}` is what keeps a revealed card from showing two, and
  `.grade-wrap .gb-undo{display:none}` keeps the desktop on the study bar's single copy. Both halves are
  asserted by `test-layout.js` — a duplicate and a disappearance look identical in a screenshot of one state.
- **FLAGS, SET DUE DATE, FORGET, AND THE CARD BROWSER (Aug 2026, on request).** Folio records a great deal
  about every card — a state, an interval, an ease or a stability, a lapse count, tags, and since Aug 2026
  every individual review — and gave a reader no way to look at any of it except one card at a time. These
  four land together because they are one gesture: find the card, then do something to it.
  · **A FLAG IS NOT `cardColor`, and the two must never be merged however alike they look.** `cardColor` is
    an ADMIN's private marker, published to every reader through the content overrides; a **flag**
    (`S.flags[id]` → 1–7) is the READER's, rides in their own progress, and nobody else ever sees it. Anki's
    seven, in Anki's order and under Anki's names. **The chord has to be Ctrl** (1–4 are the grade keys) and
    fires even with the cloze box focused. **Setting the flag a card already carries CLEARS it**; the sheet
    toggles on ONE card and SETS on many. **It is in `RESET_KEEPS`** — an annotation, not history. The
    colours are **tokens** (`--flag-1` … `--flag-7`, with night and high-contrast values), the dot is never
    coloured TEXT, and flagging repaints the CARD (`renderCard()`, never `render()`) so a revealed answer
    is not taken away.
  · **`schedSetDue` and `schedForget` are PURE and live above the `/* SRS */` marker**, beside
    `schedAnswer`, so `test-cards.js` walks them as arithmetic and the undo snapshot stays valid. They
    belong to the scheduler rather than to a button, or the rules behind them would exist in as many places
    as offered the action. Set due date takes Anki's own input (`7`, `7!`, `4-7`); a **new or learning card
    becomes a REVIEW card**, or the next grade silently overwrites the date; a **range is resolved per card,
    seeded by the card's own id**, so a hundred cards spread and a re-run lands on the same days. **Forget
    KEEPS the record** — Folio's XP is the number of distinct cards studied, and `first` is what every
    per-deck new count derives from — while the FSRS memory state always goes.
  · **THE BROWSER (`PAGES.browse` at `#browse`)** — a searchable, sortable table over `availableCardIdSet()`,
    which is the right universe rather than every id in the tree. Selecting rows raises a bulk bar; a row
    opens Card info, where the same actions live on one card. **The search is the half that matters** and is
    Anki's syntax cut to a documented subset (`is:` `flag:` `prop:` `deck:` `tag:` `introduced:` `rated:`,
    ANDed, negatable, quotable). `browseTokens` / `browsePredicate` are **PURE**. **An unknown operator
    stays FREE TEXT** and **an operator with a nonsense value matches NOTHING** — both failures look like
    "the search is broken" from one side only. **`BROWSE_PAGE` (300) is a PAGE, not a ceiling**, grown by an
    IntersectionObserver on a sentinel (a scroll listener cannot see a first page that does not fill the
    window). The query, column and selection are module-level and deliberately NOT in `S`. **Two ways in**,
    both asserted: the account page — **including the SIGNED-OUT one** — and a deck's long-press sheet.
- **THE PER-REVIEW LOG (Aug 2026, on request)** — `S.revlog`, one row per answer, written by
  **`logReviewEntry`** from `grade()` and read by **`revRead`** / `revForCard` / `revWindow`. The daily
  `reviewLog` below keeps three numbers a day; this keeps what a day cannot — which card, which button,
  from what interval to what, and how long the answer took. **It landed before the screens that read it,
  deliberately**: a card record holds only its LATEST review, so every day the log is not being written is
  detail no later release can reconstruct.
  · **THE ROW IS AN ARRAY and its shape lives in exactly TWO places** — `logReviewEntry` writes it and
    `revRead` unpacks it. `[id, t, g, st, prevMin, nextMin, ease100, ds]`: `t` in plain **ms** (the unit
    every other stamp uses), `prevMin`/`nextMin` **both in minutes** (a field that is sometimes days and
    sometimes minutes reads correctly and computes wrongly), `ease100` an integer and whichever number the
    card's scheduler uses, `ds` tenths of a second.
  · **THE DURATION IS CAPPED at `REV_MAX_DS` (60s, Anki's own `maxTaken`)** — a card left open over lunch
    would otherwise claim two hours. Measured by the STUDY PAGE (`shownAt`); a grade with no timing logs a 0
    rather than refusing, because a missing duration must never cost the schedule.
  · **IT IS NOT IN THE SYNCED BLOB — it has a table of its own** (`review_log`, schema block 10; **the user
    must run it once**, and `revTableMissing` turns a 404 into a silent no-op meanwhile). Insert and delete
    but deliberately **no update policy**. `revlog` came OUT of `PROGRESS_FIELDS` and **`progressBlob()` is
    what the push now sends**; `extractProgress()` still includes it, the guest stash being a whole device
    state. **That split opened an account-switch leak**, so `applyProgress` clears `S.revlog` and removes
    `REV_SYNC_KEY`. The push is incremental on a high-water timestamp with
    `Prefer: resolution=ignore-duplicates`, and `resetProgress` calls `revWipeRemote()`. `REV_CAP` (20000)
    is a LOCAL bound, not a limit on the archive. **This is the bullet to read before adding anything else
    that grows per review: give it a table.**
  · **UNDO TAKES BACK ITS OWN ROW BY IDENTITY** (`lastRevRow` → the snapshot's `revRow` → `undoRevRow`).
    The snapshot is taken BEFORE the grade, so it cannot hold a row that does not exist yet; `grade()`
    leaves the row in `lastRevRow` and `doGrade` copies it on afterwards. **"Remove the last row" takes
    somebody else's review off** and **a recorded length silently keeps the phantom one**.
  · Read by **Card info** (`I`, Anki's key) and the **Answer buttons** card, deliberately different shapes:
    the state block is complete for every card ever studied, the history can only show what the log holds,
    and the panel says which it is rather than fabricating rows. **AN OVERLAY OVER THE CARD OWNS THE
    KEYBOARD** (`OVERLAY_SEL` / `overlayOpen`) — this panel forced it, a reader pressing `3` over Card info
    having graded the card underneath invisibly. ONE list, shared with the page swipe.
- **Review history + statistics:** `grade()` calls **`logReview(mature, correct)`**, which tallies
  `S.reviewLog["YYYY-MM-DD"] = [reviews, matureCorrect, matureTotal]` (in `defaultState()` and
  `PROGRESS_FIELDS`). **This log has to exist**: a card record keeps only its *last* review, so past-day
  history is unreconstructable from `S.cards`. "Mature" = the status was `review` *before* the grade (hence
  `preStatus`); correct = anything but Again. Pruned to `REVIEW_LOG_DAYS` (400). Rendered by
  **`reviewStatsHTML`** as a study heatmap, a 90-day true-retention figure (`—` when nothing mature has been
  reviewed — never a made-up 0%) and a 14-day forecast. **The heatmap starts on the day the account was
  created**, never later than `firstLoggedDay` (or a guest's migrated history would be hidden), rounded back
  to that week's Monday (the grid is 7 rows of `grid-auto-flow:column`, so day 0 MUST be a Monday).
- **Deck statistics + "Beyond the cards"** (the account page, and a friend's — both take a `prog`).
  · **`renderDeckStats`** — a picker over `statScopes()` driving `deckStatsPanelHTML`: a studied/total bar
    and eight tiles. **Everything is DERIVED from the card records**, deliberately: a per-deck review log
    would start on the day it was added, so every deck already worked through would read as empty.
  · **`exploreStatsHTML`** — what a scholar does *around* the cards, fed by three progress fields
    (`glossSeen`, `placesSeen`, `gameLog`) that exist because **a popup and an Atlas panel leave no other
    trace**. **Both meters count against the set they are measured by, NOT the whole register**, and each
    was wrong once the same way (412 of 258 countries; a retired term pushing the figure past the total).
    Keep new callers on `countryNameSet` / `countryTotalCount` / `countrySeenCount` / `glossSeenCount` /
    `glossTotalCount`. **`SEEN_CAP` must stay above the SHIPPED universe of both registers** — these are
    shown as progress towards completion, so a prune makes a count go backwards; `test-discovery.js`
    asserts the clearance against the real data files, and **if it fires, raise the cap, don't trim data.**
  · **Discovery marks**: `markSeen` **returns `true` only on first sight**, and that return is the whole
    signal — capture it at the top, since anything asking at render time is always told no. **The
    UNDISCOVERED term is the marked one** (`data-new`, `--newterm` teal); a read term renders exactly as
    glossary links always have. First opening also shows a gold chip with a ring splash and a chime,
    suppressed inside the Find-it game. Four achievements ride on the same counts.
  · **TIME STUDIED AND TIME READING ARE KEPT FOR EVER, NOT JUST FOR TODAY** (`S.studyTotal` /
    `studyTotalMs` / `readTimeAdd` / `readTimeToday` / `readTimeTotal` / `startTimeTicker`; Aug 2026, on
    request). The study page has counted the day's time on cards since it shipped; this is the same ticker
    factored out and pointed at two more places — a lifetime total beside the daily one, and the LIBRARY,
    where `S.reading[bookId].secs` rides on the record that already held the reader's place and already
    synced. Both are tiles in "Beyond the cards" and both carry badges (1/10/50/100 hours studied,
    1/5/25 hours in one book), tested at the moment they are earned like the collector's. Two faults worth
    remembering: **`setReadingPos` REPLACED the reading record rather than merging into it**, so the new
    clock would have been wiped on every scroll; and the lifetime back-fill, written at boot, called
    `todayStr()` — a `const` arrow declared a thousand lines further down — and threw on the temporal dead
    zone, which is why it is a LAZY accessor. **A back-fill that needs something the module has not
    finished defining belongs in an accessor, not at boot.**
  **📖 `docs/study-records.md` — READ BEFORE CHANGING ANY OF IT.** The flag palette's contrast reasoning
  and the browser's column and breakpoint decisions, the row-shape arithmetic and the sheet's flex rules,
  the heatmap's `.hm-pre` blanks and its month-label collision rule, and the discovery chip's box-shadow
  rings and why they can never be a scaled pseudo-element.
- **Deep time (years before the present).** A card's sort year is a plain signed number, so a prehistory
  card is just a very negative one (`-3300000` = 3.3 Mya). Three pieces carry that: **`cardYears(c)`** reads
  `answerDate` and now understands `"2.6 million years ago"`, `"3.3 to 2.6 million years ago"`,
  `"780,000 years ago"`, `kya`/`Mya`/`Gya`, **`BP`** and the RANGE forms of both (`"4.2 – 2 Mya"`,
  `"115,000 – 11,700 BP"` — the two the date line is written in since Aug 2026, where the unit is written
  once and carries leftwards), consuming each match so the BCE/CE rules can't re-read its
  digits (before this the prehistory deck sorted on the *discovery* years in the prose — `1925`, `2011` —
  because `\b(1\d{3}|20\d{2})\b` was the only rule that matched); the BCE rules also accept comma grouping
  now, or `"around 10,000 BCE"` parsed as the year 0. **`yearLabel(y)`** is the single formatter — `Gya` /
  `Mya` / `kya` above 10,000 years, `BCE`/`CE` below — used by `chronoLabel` and `fmtYearSpan`.
  **`parseChronoYear`** (the editor's chronology field) accepts everything `yearLabel` emits, so the field
  **round-trips**; keep that true if you touch either. In a range like `"3.3 to 2.6 million years ago"` the
  unit carries leftwards only when the first number is small and ungrouped — `"700,000 and 1.5 million
  years ago"` is not two millions.
- **CARDS CARRY CATEGORISING TAGS** (`card.tags`, Aug 2026, on request) — the card-side sibling of the glossary's
  `GLOSSARY_TAGS`, in the SAME vocabulary: tag 1 is the KIND (`era`, `hominin`, `place`, `industry`, `object`,
  `practice`, `concept`, `fossil`, `culture`, `event`, `people`, `person`, `animal`, `building`, `theory`), then
  the subject areas (`archaeology`, `palaeontology`, `geology`, `science`, `history`, `prehistory`, `evolution`,
  `genetics`, `technology`, `art`, `geography`, `nature`, `climate`, `migration`), then the specifics — a
  country, a region, a period. **Every shipped card is tagged.** Written by
  `node .claude/add-card-tags.js <batch.json>` (3–8 tags, lowercase, and it warns about a tag no other card
  shares — one that can never group anything); carried by `serializeCardData` beside `sources`.
  What they are FOR is **Multiple Choice**: `cardKinship(a, b)` counts the tags two cards share, weighting the
  first heavily (the kind is worth four subject areas) and capping the score when the kinds differ, and
  `buildChallengeQuestions` offers the three closest cards as the wrong answers. Before this the distractors
  were three cards of the same rough `answerType`, which on a prehistory deck put nearly everything in one
  bucket — a stone industry answered against a cave, an ice age and a fossil, where the odd one out was the
  right one. Now the Mousterian is answered against the Oldowan, the Acheulean and the Aurignacian.
  `answerType` survives as the fallback for a card with no tags (a community deck's).
- **CARDS CARRY A DIFFICULTY, AND THE MINIGAMES DRAW UNDER IT** (`card.difficulty`,
  `CARD_DIFFICULTY_MIN/MAX`, `GAME_MAX_DIFFICULTY`, `cardDifficulty()`, `difficultyOK()`,
  `gameCardIdSet()`; Aug 2026, on request). An integer **1–5 rating HOW WELL KNOWN THE ANSWER TERM IS to
  the general population** — not how hard the card is, which is a different question and conflating the
  two is the one way this scale stops meaning anything. **Every shipped card is rated**; run
  `node .claude/test-difficulty.js` for the distribution rather than quoting one.
  · **THE SCALE** (stated identically in app.js, `.claude/add-card-difficulty.js`, `add-card.js` and here
    — keep the four in step): **1** household name (Stone Age, Homer, Sparta); **2** generally familiar, an
    ordinary secondary education reaches it (Neolithic, Knossos, Lascaux); **3** known to the interested
    (Linear B, hoplite, helots); **4** specialist (Gravettian, megaron, bucchero); **5** highly obscure
    (`qa-si-re-u`, Nichoria, Iguvine Tables). **Rate the WORD a stranger would be shown**: a subtle card
    about `Homer` is still a 1, and a beautifully clear one about `qa-si-re-u` is still a 5, because a
    reader who has never met a word cannot be eased into recognising it by prose.
  · **WHAT IT IS FOR IS THE DAILY GAMES, AND STUDY IS UNTOUCHED.** A study card arrives with three hundred
    words behind it and comes back tomorrow if you miss it; a minigame deals the term COLD. Every card is
    studiable at every rating, and `availableCardIdSet` knows nothing about difficulty and must not learn.
  · **`gameCardIdSet()` IS THE ONE DOOR** — `availableCardIdSet()` narrowed by `difficultyOK` — and every
    card-fed game goes through it, so a sixth game added later reaches for this instead and is covered
    without anybody remembering the rule. It filters the **distractors** too: a round whose wrong options
    are all unanswerable is answerable by elimination and teaches nothing.
  · **AN UNRATED CARD IS TREATED AS TOO OBSCURE, deliberately** — erring the other way lets one card deal
    an unanswerable round silently. The cost is that the failure is silent in the other direction too, so
    `add-card.js` REFUSES a new card without a rating rather than defaulting one.
  · **THE READER SEES IT, AS FIVE STARS**, and **there are TWO ratings**: `card.difficulty` is an
    EDITORIAL judgement made once, and once a card has `CARD_STATS_MIN` (20) answers the stars show the
    COMMUNITY figure instead (anonymous per-card grade counts, `bump_card_grades`, schema section 13 —
    **the user must run it once**; a database without it simply keeps the editorial rating). **Only a
    reader's first `CARD_STATS_SIGHTINGS` (3) answers count**, on the card record's own `c.seen`, so the
    figure measures how hard the card is to LEARN rather than how long the deck has been in use — and
    **undo reads the snapshot, never the review log**, since `REV_GRADE_NAME` is capitalised where
    `CARD_GRADE_KEY` is not and a withdrawal that silently matched nothing would leave a vote unearned.
  · Written by `.claude/add-card-difficulty.js` in batches, editable per card in Admin → Cards, carried by
    `serializeCardData` and restored by `revertCard` — **a serializer that forgot it would strip every
    rating from data.js on the next admin keystroke**, which is asserted rather than assumed.
- **SOME TERMS DO NOT HAPPEN AT A TIME, AND TIMELINE MUST NOT ASK** (`card.undatable`, `cardUndatable()`,
  the filter in `chronoPool()`; Aug 2026, on a bug report). The sibling of the rule above: a second
  editorial fact about the ANSWER TERM, deciding whether ONE game may deal it.
  · **THE TEST IS WHETHER THE SORT YEAR IS A DATE THE TERM IS CONVENTIONALLY GIVEN.** It fails two ways —
    a term not located in time at all (`Tiber`, `Ochre`, `Ice age`, `Hunter-gatherer`, `ancient DNA`), or a
    process so diffuse that the earliest figure on its date line is one arbitrary moment inside it
    (`human evolution` sorts at 8 Mya, which is where the ape line split and not when human evolution
    happened).
  · **A LONG PROCESS IS NOT AUTOMATICALLY UNDATABLE**, which is what keeps the game worth playing:
    `domestication` and the `Neolithic Revolution` each sort at the onset a reader would give them.
  · **IT IS TIMELINE'S RULE AND NOTHING ELSE'S** — the other games ask what a term IS, which a process
    answers perfectly well — so the filter is in `chronoPool` rather than in `gameCardIdSet`, and **the
    deck's own order is untouched**: `cardStartYear` knows nothing about the flag, which is why this could
    not be done with the existing "timeless" machinery.
  · **IT ONLY BITES ON A CARD THE GAMES CAN REACH**, so **a card RE-RATED down into the pool needs the
    judgement made about it** — the one way the corpus can quietly regrow an unflagged process, and nothing
    can detect it. Written by `.claude/mark-undatable.js`, accepted by `add-card.js`, carried by
    `serializeCardData` and restored by `revertCard`.
  **📖 `docs/card-difficulty.md` — READ BEFORE RATING A BATCH OR CHANGING A POOL.** The community rating's
  own findings, the stars' two `body.hc` results and the sweep that could not see the study card at all,
  the crossword draw cap that had to scale with the pool, What year? leaving the cards entirely, and the
  fourteen flagged terms with the three flagged belt-and-braces.
- **THE ANSWER'S CHINESE NAME IS THE MIDDLE SECTION OF THE ANSWER BOX** (`answerNameHTML` / `wireAnswerSay`
  / `.ans-cn`; Sep 2026, on request). It was a line under the term and only on a MAP card; it is a sibling
  of `.answer-main` now and is drawn on every card carrying `hanzi`, so on a wide card it stands between
  the term on the left and the figures on the right, ruled off by a hairline, and below 640px it stacks
  under the term with the rule on its top edge. **The collapsible `.answer-tr` column and its 中文 toggle
  are RETIRED with it** — two ways of showing one thing — along with `S.settings.trCollapsed`'s readers.
  **The speaker says the CHARACTERS, never the romanisation**: it carries `data-say` with the hanzi and
  `lang="zh-CN"`, which is the contract `cardSpeak` already honours for a deck's `.uc-tts`, since a
  Mandarin voice handed "Guǎngdōng" reads the letters. It is deliberately NOT gated on `ttsEnabled()`,
  which has been off since read-aloud was set aside: like the deck control it is something the reader
  presses, and `body.no-tts` hides it where there is no speech engine at all.
- **Card fields (13):** `id, num, category, question` (HTML cloze with blanks), `answer`,
  `answerDate` (HTML), `traditional, hanzi, pinyin, translations` (HTML), `abstract` (rich HTML
  card background; may carry `ttip` glossary links, but newly generated cards omit them),
  `citation, answerText`. (The legacy `citation` string is **not** the footnote system — see the next bullet;
  it predates it, is not in the editor, and is empty on every current card.)
  **THE ANSWER ALWAYS OPENS ON A CAPITAL, and it is done in CSS** (`.answer .val::first-letter`, Aug 2026,
  on request) — even where the question and the background write the term lower-case, since in the answer
  box it is a heading naming the thing rather than a word in a sentence. Deliberately NOT a pass in
  `buildBack`: the stored `answer` is HTML that may open on a `<b>` or an `<a>`, so an uppercasing pass in
  JS would have to walk into the markup to find the first letter — and the same term is read aloud, typed
  against in the cloze box and matched by the glossary, none of which must see a capital the data has not
  got. `::first-letter` changes what is painted and nothing else; it reaches the letter through inline
  descendants, and on a hanzi answer it is simply inert.
- **Source footnotes** — the `SOURCE FOOTNOTES` block in app.js, just above `buildBack`. Four surfaces say
  things about the past — a card's background, a glossary description, an artefact's plate and an Atlas place
  panel — and each names the scholarship behind them: a **`sources` list of Chicago note-form citations**
  rendered as a numbered fold at the foot (`sourcesHTML` / `sourceListHTML`; a Library book's translator
  notes use the same apparatus through `bookNotesHTML`). The operational half:
  · **PROSE POINTS INTO THE LIST WITH AN EMPTY MARKER** — `<sup class="fn" data-fn="2"></sup>`. **The digit is
    written by `wireFootnotes()`, never by the author**, so re-ordering a list can never leave a stale number
    in a sentence; a bare marker takes the next number in reading order, and a marker whose number has **no
    entry behind it is REMOVED**, a dead superscript claiming a citation being worse than none. If that pass
    never runs, `sup.fn:empty::before{content:attr(data-fn)}` still prints the digit.
  · **…AND THE ENTRY POINTS BACK** (`srcNumHTML` / `jumpToMarker`), to the marker the reader LEFT FROM
    (`_fnFrom`) — a note may be cited several times over. Only a number some marker actually points at
    becomes a control, which `wireFootnotes` is the one pass able to decide.
  · **THE FOLD HEADER AND THE MARKERS ARE DELEGATED** — one capture-phase document listener each for click
    and Enter/Space, never wired per render, and **capture** so a surface that stops propagation on its own
    clicks cannot swallow it. `noteForNode` stops at `<body>`. **Do not re-add a per-element listener.**
  · **A CITATION ENDS IN ITS URL AS PLAIN TEXT**, and `linkifySrcItem` builds the anchor **inside
    `sourceListHTML`**, so the list is serialized already wired — a list depending on a caller remembering
    `wireSourceLinks` reaches a reader as a bare URL on some render path. It also lifts the
    `[Open access]` / `[Paywalled]` label into a chip (`--good` green / `--ochre` amber — a paywall is a fact,
    never a warning). Links open in a new tab.
  · **CITATIONS ARE NOT TRANSLATED** (`notranslate`, and `sources` lives on the base card, not in `i18n`);
    only the "Sources" label and the chips are.
  · **THE FOLD IS OPEN BY DEFAULT ON A CARD, A BOOK AND THE ATLAS PANEL, AND ALWAYS SHUT IN A GLOSS POPUP**
    (`opts.compact`), which additionally never writes the reader's `S.settings.srcCollapsed`. A marker jump
    force-opens it for one look and never changes the preference.
  · **A MARKER JUMP MEASURES A FOLD THAT IS ALREADY OPEN AND CLEARS THE FIXED FURNITURE**
    (`openFootnote` / `scrollNoteIntoView`, reading `--bar-h` / `--tabbar-h`), or the note lands under the
    tab bar or below the viewport entirely.
  · **BARS AND STORAGE**: `SRC_TARGET` 5 per card, `GLOSS_SRC_TARGET` 2 per term, `ARTEFACT_SRC_TARGET` 3.
    Deltas are `sources` / `ADMIN_EDITS.glossarySources`; community decks get `uCardSetSources` /
    `uGlossSet`, sanitized on ingest. `sup` + `class="fn"` + `data-fn` are in the sanitizer allowlists.
  · **Guarded by `test-sources.js`** (74 assertions, including a deliberately UNWIRED surface).
  **📖 `docs/source-footnotes.md` — READ BEFORE TOUCHING THE APPARATUS.** Why the marker is written empty
  and the numbering delegated, the editor's rich citation rows and the ribbon's `+Source`, the sticky
  ribbon's two scrollports, the coverage marks and what earns a card the red one, and the faults that
  reached readers — a phone showing a card of blank gaps over a fold that would not open, and a jump that
  landed a note underneath the tab bar because it was measured before the fold had opened.
- **Multiple question phrasings (July 2026):** a card may carry an optional **`questions` array of EXTRA
  phrasings** beyond `question` — **at most `CARD_MAX_QUESTIONS` (10) in all** (official Folio cards carry
  exactly 3; the headroom is for community decks to experiment). Every phrasing is a full standalone clue
  under the same rules (mid-sentence blank, ~28 words), each testing the concept from a different angle so
  students learn the concept rather than one sentence's shape. **`cardQuestions(c)` returns the non-blank
  pool, and every reader of it now reads it directly**: the study page keeps the chosen phrasing as state a
  reader can step through with the ‹ › chevrons (`qIdx`), and Multiple Choice always asks the FIRST one
  (`firstQ`, which CUTS the pool). `cardWithQuestion(c, pickIdx?)` — the copy-with-one-phrasing helper those
  two used to go through, and the card of the day with them — was **deleted in Aug 2026** when the last of
  its three callers stopped needing it; a helper nothing calls is the next person's bug.
  Translations carry their own pool (`i18n[lang].questions`), and
  `cardLocalized` **falls back to the single translated question when a language hasn't translated the
  extras** — never a translated question mixed with English extras. In the editors the question box gets
  **chevrons (‹ ›) that cycle the pool** plus a "1 / 3" counter and add/remove controls; edits write through
  `setQuestions` (curated: `setCardEdit` + `setCardQuestionsEdit`, a delta with a null tombstone like
  image/video; i18n: `setCardI18nEdit`; Studio: `uCardSetQuestions`). The HTML source box gives each phrasing
  its own `<!-- QUESTION -->` / `<!-- QUESTION 2 -->` … section. Extras ride through export/publish/install
  and are sanitized on ingest (`uCardSanitize`, capped at 9 extras). The admin card search matches every
  phrasing. Backfill existing cards with `.claude/add-questions.js` (see "Generating cards").
- **Card image (optional):** `card.image = { src, title, desc, credit, alt }` — rendered by `buildBack` as a
  **16:9 frame** (`.card-img`, `cardImageHTML`) at the top of the Background section. Clicking it opens the
  **fullscreen viewer** (`openImageViewer`: wheel and pinch zoom 1–8×, tap toggles 1↔2.5×, drag pans when
  zoomed, **only the × and Escape close**, `closeImageViewer()` runs in `render()`). One **delegated**
  document click/keydown listener opens it from any `.card-img` via the figure's `data-img-*` attributes —
  no per-render wiring.
  · **NOTHING INSIDE THE STAGE CLOSES IT** (Aug 2026, on request): a click on the image toggled zoom and a
    click beside it CLOSED, which is the same gesture a few pixels apart doing opposite things — and a
    picture opened to be looked at is one a reader zooms and drags about. **A VIDEO KEEPS ITS BACKDROP
    CLOSE**: the player owns every pointer inside its frame, so there is no zoom to protect.
  · **AND ON A REAL DEVICE THE TAP HALF COULD NOT FIRE AT ALL** — the finding worth carrying furthest.
    `stage.setPointerCapture()` **RETARGETS every later event to the STAGE**, so the `e.target === im` the
    toggle tested at pointerup was false for a real finger even dead centre of the picture. It is recorded
    at POINTERDOWN now, whose target resolves before the capture it sets. **A synthetic `PointerEvent`
    bypasses that retargeting entirely**, so a test written with synthetic events passes on the broken
    code — reproduce a gesture bug with real input before believing it fixed.
  · **`alt` is a field of its own, not a reuse of `title`**: a title NAMES the picture for someone who can
    see it, alt text DESCRIBES it to someone who cannot, and folding them together is the commonest way alt
    text ends up useless. Readers get `alt || title || "Card illustration"`. It rides in `MEDIA_FIELDS`, so
    the one media panel, the source gate, the store and the clearing path all carry it with no special case.
  · **A file that will not load is handled**: there is deliberately no upload path, so every picture and clip
    is somebody else's URL and link rot is a certainty. A delegated **capture-phase `error`** listener
    (`error` does not bubble) marks the figure `.media-dead`. **A READER gets nothing** — a broken
    illustration is worse than none — while an **AUTHOR keeps the frame**, labelled, being the one person
    who can fix it.
- **Card video (optional):** `card.video = { src, title, desc, credit }` — the **same four fields and the
  same frame as the image** (`.card-img` plus a `.card-vid` modifier), rendered by `cardVideoHTML`.
  **ONE FRAME PER CARD: the image and the video are alternatives, never companions.** Every writer enforces
  it (`setCardImageEdit`/`setCardVideoEdit` via `retireOtherCardMedia`, `uCardSetImage`/`uCardSetVideo`, the
  glossary pair, the deck-ingest sanitizers) and `buildBack`, `renderGlossImage`, `serializeCardData`,
  `serializeGlossary` and the publish payload all keep the rule as a backstop, **with the picture winning**
  so a hand-authored `data.js` carrying both renders as it always did. **`retireOtherCardMedia` asks
  `PRISTINE_CARDS`, not the live card**, when deciding whether to write a null tombstone: it runs on every
  keystroke, and by the second one the live field is already gone.
  **Links only — there is deliberately no upload path**: the only place an uploaded file could live is
  inline as a data-URI, which for a curated card rides into the eagerly-downloaded `data.js`.
  **`videoSource(src)`** is the single resolver → `{ kind: "youtube"|"vimeo"|"file", url }` or **null** for
  anything else, and null renders NOTHING. YouTube and Vimeo become `<iframe>`s on **youtube-nocookie.com**
  / **player.vimeo.com**; a `.mp4/.m4v/.webm/.ogv/.ogg/.mov` URL becomes a `<video controls>`. **An iframe
  src is only ever built by `videoSource` from a matched video id — never from raw input**, which is what
  keeps a stranger's deck from framing an arbitrary page; **the regexes are the security boundary**, so
  don't loosen them to "anything that looks like an embed URL". The figure is **not** a `role="button"`
  (the player owns clicks inside it): the viewer is reached by an explicit `.cv-expand` control placed
  **top**-right, because a `<video>`'s native control bar owns the bottom edge. `_headers` carries
  **`media-src 'self' https:`** and **`frame-src`** for the two embed hosts. `.ces-imgpanel[hidden]{display:none}`
  is **required** — the author `display:flex` beats the UA `[hidden]` rule. Guarded by
  `.claude/test-video.js` (89 assertions).
- **MAP CARDS — a shape on a globe as the question** (the `MAP CARDS` block in app.js, just above
  `cardFrontHTML`; `us-states.js`; the Geography collection. Aug 2026, on request). The card shows a place
  shaded on a globe the reader can turn and zoom but not click, and asks what it is; the back names it and
  adds a box of figures. Two fields carry it — **`map`** (`{ layer, key, zoom? }`) and **`facts`**
  (`[[label, value], …]`) — and everything else about such a card is an ordinary curated card.
  · **`key` MAY BE A LIST, AND CYPRUS IS WHY** (Aug 2026, on request: "ensure the country Cyprus encompasses
    the whole island"). `world.js` files a partitioned island as separate polygons — `Cyprus`, `N. Cyprus`
    and `Cyprus U.N. Buffer Zone` are three — so a card naming one shaded two-thirds of what the reader can
    see and asked them to name it. `"key": ["Cyprus", "N. Cyprus", "Cyprus U.N. Buffer Zone"]` shades them
    as ONE place: the names are joined with a **pipe** for the markup's single attribute (no place name in
    either layer contains one, and `add-card.js` refuses one that does), every name must resolve or the
    window fails rather than shading a shape that is not the country, and the fill and outline are laid
    down as **one path over all of them** — stroking each would draw the internal lines that dividing them
    is exactly what naming them together is meant to hide. With several shapes the opening view centres on
    the UNION's bounding box; with one it still centres on that shape's own published label point, **so no
    existing card's opening view moves by a pixel**.
  · **IT IS A BUILT-IN FORMAT AND NOT A COMMUNITY CARD TYPE**, settled before anything was written: a card
    type is templates plus scoped CSS and **cannot run code**, deliberately, since a type is a stranger's
    content — and a globe needs a canvas, an animation frame and pointer handlers. The request said "a new
    card type" and the honest answer was that the machinery it needs is exactly what a type may not have.
  · **NOTHING IS CLICKABLE, which is the point of the exercise** — no click handler, no hit test, no hover.
    A reader who could tap the shaded state and be told its name would not be studying. Asserted, since a
    map that has become clickable looks exactly like one that has not.
  · **A MAP CARD IS KEPT OUT OF EVERY DAILY MINIGAME BY CONSTRUCTION** (`gameCardIdSet` tests
    `cardMapSpec`): the games deal a question cold with no map beside it. Unlike `difficulty` and
    `undatable` this needs no editorial judgement and so needs no field — and it means **`undatable` should
    NOT be set on one**, Timeline being behind that filter already.
  · **THE FIT IS READ OFF THE SHAPE** rather than hand-tuned per state, and `map.zoom` is an override no
    shipped card needs. **The shaded place is the Atlas's own selection gold**, `TINT_SEL` hoisted to module
    scope so there is ONE of it — two golds for one idea drift INVISIBLY here, a card and the Atlas never
    being on screen together — and the treatment is the Atlas's three marks exactly.
  · **A CITY IS A DOT** (`map.dot`, `window.US_CAPITALS`): a capital card shaded its state and asked for the
    city, which says only which state. The coordinates are **generated, never typed** — fifty hand-entered
    ones are fifty chances to put a city in the wrong state, and a dot a degree out still draws.
  · `add-card.js` validates the key against the real data file, refuses a dot the table has not got or one
    outside the card's own state, refuses extra phrasings, and holds the question to 5–20 words.
  · **AND IT IS HONESTLY INACCESSIBLE TO A READER WHO CANNOT SEE IT** — a shape is the whole question, so
    there is no text alternative that does not answer it. The card can be READ where it cannot be ANSWERED;
    stated in `docs/geography-card-plan.md` rather than papered over.
  Guarded by `.claude/test-map-cards.js`. **Re-run after touching the `MAP CARDS` block, `startCardGlobe` /
  `cardMapSpec` / `cardMapHTML` / `mountCardMaps` / `cardFacts` / `CMAP_ZMAX` / `TINT_SEL` /
  `serializeCardData` / `revertCard` / `gameCardIdSet`, `.claude/build-us-states.js`, or after adding a map
  card.**
  · **A LONG STRAIGHT SEGMENT IS A LIE ON A SPHERE, AND `addRing` NOW WALKS ONE IN STEPS** (`CMAP_SEG`,
    0.5°; Aug 2026, on a report that the northern border of the US looked doubled). It was: `world.js`
    draws the whole US–Canada border west of the Great Lakes as ONE chord 27° of longitude long, and
    `us-states.js` draws the same parallel as five shorter ones, so in orthographic projection the two sag
    by different amounts — **0.0138 R against 0.0026 R**, which at a state card's zoom is forty pixels of
    open land between two grey lines. Neither file was wrong; a straight line between two points on a
    sphere simply is not the border. Subdividing fixes every ruler-drawn edge at once — **Colorado is six
    vertices** — and costs 5,330 extra points across all of world.js, nearly all culled per frame. **A
    segment wider than 180° is left alone**: the only one is Antarctica's base, (180,-90) to (-180,-90),
    which interpolates 720 steps the wrong way round the planet.
    **IT SHARES `addRing` WITH THE LOCATOR'S RIVERS, whose own change landed the same week** — a river is
    a POLYLINE and passes `close: false` — so the two arrive as ONE merge conflict on adjacent lines and
    must be resolved together: the walk is hoisted into `ringStep` and the `close` flag is read at the end
    of it. Taking either side whole silently loses the other, and **both losses render perfectly**: one
    doubles the northern border again, the other draws every river's mouth back to its source across a
    continent.
  · **A LOCATOR SHOWS THE REST OF ITS COLLECTION, AND THE WORLD AROUND IT** (`cardCollectionRoot` /
    `locatorSiblings` / `_locSibCache`; Aug 2026, on request). Four layers under the card's own gold dot:
    the collection's other card places as smaller RED dots, the Atlas's capitals and million-plus cities
    as grey ones, and its rivers. **The two halves are paid for differently and that is the whole design.**
    The siblings are FREE — every locator is in `data.js`, which every visitor downloads before flipping a
    card — so they ship unconditionally; the cities and rivers are the `atlas` bundle (~600 KB), so they
    are **warmed at IDLE and never awaited**, which is `glossExtra`'s bargain, and skipped outright under
    `saveData`, which is `startMiniGlobe`'s. A card with a locator therefore paints at once with its own
    places and fills in a moment later. **THE CITIES THIN WITH ZOOM, and that was found by LOOKING**: all
    2,665 drawn at once cover Europe and North Africa in a grey rash at the opening 50° view and bury the
    red marks that are the point — so the 216 capitals show always and the 392 million-plus cities once
    the frame is a region. **THE 2,057 DIVISION CAPITALS ARE GONE ALTOGETHER, and the rest are quieter**
    (Aug 2026, on request: "make all the black dots smaller and less conspicuous, and only put them for
    foreign capitals and cities with over 1M population") — that tier was five sixths of the layer and
    every one of them a place no card is about, and what is left is drawn at about two thirds of its old
    radius and two thirds of its old ink. They are there to give the card's own mark a world to sit in,
    and the moment they compete with it they have stopped doing their job. **EVERY RIVER THE ATLAS
    DRAWS IS DRAWN HERE TOO, AND NOT ONE OF THEIR NAMES** (Aug 2026, on request: "the same Rivers
    displayed on the Atlas should also be displayed in Atlas windows in cards (only without their
    labels)"). For a fortnight a river was drawn only where the collection taught one, and that narrowing
    was the answer to a REAL fault: **`addRing` closed every path**, and a river is a POLYLINE, so all
    1,073 were drawn with their mouths joined back to their sources across a continent. It takes a `close`
    flag now, `false` for a river, which is the flag the Atlas has always passed its own `addClipped` —
    and with the fault fixed the narrowing could go, a map that draws the Rhine only for a collection with
    a Rhine card being one whose water means something different on every card. **WHAT DOES NOT COME BACK
    IS THE NAMES**: on the Atlas a river label is a layer of its own, drawn only past a zoom and against a
    de-collision pass, and a thousand of them in a window this size buries the marks the card is about.
    The one exception is the card's OWN river, which is not a river label at all but the answer's mark,
    named after the reveal exactly as a dot's is. **THE THIN ONES ARE ONE PATH, STROKED ONCE** — it was a
    `beginPath`/`stroke` per river, which is right for the handful a collection teaches and is 1,073
    strokes a frame for all of them, on a globe the reader is dragging. **`sib.terms` WENT WITH THE RULE
    IT EXISTED FOR**: the only question left about a river is which one is the card's SUBJECT, which
    `locOwnTerms` answers per card, and that set's keys were `termName`'s keys exactly — one table in two
    copies, which is the kind of thing that comes to disagree. **Natural Earth labels a river in the
    language of the country it runs through**, which is why that match reads the term's GLOSSARY ALIASES:
    the Tiber is in `rivers.js` as `Tevere` (the Danube also as `Donau`, the Yangtze as `Chang Jiang`), so
    a Tiber card takes the gold and gets its name by carrying `Tevere` as an alias on the paired glossary
    term — and one that does not, visibly does not. **That alias was added in Aug 2026 and the mechanism
    now has a live instance**: `rm-003` is the first card whose answer is a river. **AND WHAT IS DRAWN IS
    LABELLED WITH FOLIO'S OWN NAME FOR IT, not Natural Earth's** — a map that draws the Tiber and prints
    "Tevere" beside it has answered a question nobody asked — so `locatorSiblings` hands back a `termName`
    map from every matchable surface to the term the collection teaches. **IT IS THE LOCATOR'S LAYER AND
    NOT THE MAP CARD'S**: a geography card asks the reader to name a shape and deliberately never fetches
    the `atlas` bundle, so it draws no rivers and pays for none.
    **AND THE SIBLING DOTS ARE NAMED** (Aug 2026, on the same report: "the other dots don't have their
    labels"). They went up bare, which made them decoration rather than information on a map whose whole
    job is to say where. A sibling's name gives nothing away — `locatorSiblings` excludes the card itself —
    so unlike the card's own label it is drawn BEFORE the reveal. They are **de-collided first-come**, the
    Atlas's city rule in the form this window can afford, with the card's own dot and label reserved first,
    and set at the river labels' 11px/500 rather than the answer's 13px/600, so the card's own place still
    reads as the subject: at the opening 50° view about seven of Ancient Greece's 55 are named and zooming
    in frees the rest. **Fewer names, each readable, beats every name in a heap.**
    `_locSibCache` is declared beside `uCacheBust` rather than beside its own function, for the temporal
    dead zone's reason.
  · **…AND A PLACE WITH EXTENT IS DRAWN WITH ITS EXTENT** (`LOC_KINDS` / `locPts` / `locOwnTerms` /
    `drawSwords`; Aug 2026, on request: "For river cards like 'Tiber' ensure it is displayed on the map as
    an actual river and not just a dot. Same goes for mountain ranges like the Apennines … Also regions …
    Battle locations should be identified by a crossed swords icon instead of the red dot"). A locator was
    one thing — a coordinate with a gold dot on it — which is the right mark for a cave, a palace or a city
    and the WRONG one for anything with extent: the Apennines run 1,200 km and got a dot in the middle of
    Italy, the Tiber 400 km of river and got a dot at Rome. A dot there does not merely under-describe the
    place, it makes a false claim about it. So the locator declares a **`kind`** and the kind decides the
    mark — `point` (the dot, unchanged), `battle` (crossed swords, because a battle HAPPENED at a place
    rather than being one), `river` (traced out of `rivers.js` by the term-and-aliases match above and
    drawn in the answer's gold), `range` (black triangles walked along an authored `spine`) and `region`
    (an authored `area`, washed in the answer's gold under a **DASHED** edge). Five things.
    **`area` AND `spine` ARE APPROXIMATE AND THE DRAWING SAYS SO**: a region has no border to be right
    about — Ionia is a stretch of coast, the Fertile Crescent a schematic — so the dash reads as *about
    here* where a crisp gold line would assert a frontier Folio had surveyed. They are the one part of a
    locator that is AUTHORED rather than fetched, which is exactly why `add-card.js` validates them: a
    coordinate can be looked up and an extent cannot, so a transposed pair draws a region in the wrong
    ocean and nothing throws.
    **NONE OF THE FOUR DRAWS A DOT AS WELL** — "not just as dots" was the request, and a gold dot inside a
    shaded region says "and specifically HERE", which is the false precision the shape exists to be rid of.
    The one exception is a river the `atlas` bundle has not landed yet: the dot stands until the river is
    actually traced, since a globe with nothing on it for two seconds is worse than a dot.
    **THE VIEW FRAMES THE SHAPE AND THE NAME STAYS AT `at`** — except on a region, where the name goes to
    the shape's middle too. Centring the view on `at` was tried and Doggerland showed why not: the point an
    author picks is somewhere INSIDE a region rather than at its middle, so the zoom that fitted the shape
    framed it half off the top of the window. A RANGE keeps `at` for its name, a spine's bbox centre being
    out in the Tyrrhenian Sea.
    **A REGION AND A RANGE ARE LEFT OFF EVERY OTHER CARD'S MAP** (the request says so), and **so is a
    river** — the only thing a sibling entry could carry is one red dot at the middle of them, which is
    exactly the claim their own cards stopped making, and a river is already drawn on every map in its
    collection as the thin blue thread above.
    **AND EVERY NAME ON THE MAP OPENS ON A CAPITAL** (same request), done at DRAW time through
    `gameCapFirst` rather than in the data — so it covers the sibling names, Natural Earth's river names
    and anything added later without a pass over `data.js` that would then have to be kept up.
    Guarded by `.claude/test-card-locator.js`, whose second section measures the SHAPE of the ink — a
    river is long and thin where a dot is a blob that fills four fifths of its own box — and whose third
    measures the river layer BY TAKING IT AWAY, the water falling when `window.RIVERS` is emptied and the
    dark ink not moving by a pixel.
  · **A LOCATOR'S NAME IS A PLACE, NOT THE CARD'S ANSWER** (Aug 2026, on the same request: "A card like
    'founding of Rome' should simply have Rome as its atlas window location, and not a dot titled 'founding
    of Rome' which is obviously not a real location"). Thirty of the Rome collection's locators were named
    after the card's answer term — `imperium`, `patricians`, `collegiality`, `Fasti Consulares` — so the
    map put a labelled dot on a place called "collegiality". They are named for the place the coordinate
    actually marks, read off each card's own prose and its coordinate: the Forum cluster is **Roman
    Forum**, the Campus Martius pair the **Campus Martius**, the Palatine and Capitoline abstractions
    simply **Rome**, and the handful whose subject pins a place get it (`Pons Sublicius`, `Collatia`,
    `Gabii`, `Clusium`, `Aventine Hill`, `Lake Regillus`). **The rule is that the label names somewhere a
    reader could stand**; where the card's subject has no place of its own, the city is the honest answer
    and the hill is false precision.
  · **WHAT CHANGED IN SEP 2026, ON ONE REQUEST ABOUT THE CARD ATLAS WINDOWS.** Seven things, and three
    of them are decisions rather than tuning.
    **THE SIBLINGS ARE THE PLACES THE READER HAS ALREADY STUDIED** — a sibling is drawn once its card has
    a record in `S.cards`, which a card gets on its first grade — "so that the map fills up the more they
    study a collection". A fresh reader's map is the card's own mark and the world.
    **AND A CITY IS ONE MARK, HOWEVER MANY CARDS ARE INSIDE IT.** A locator declares `within`, the city
    it stands in, and the studied siblings GROUP by it: thirty-nine Rome locators sit within four
    kilometres of each other and drew thirty-nine dots on one pixel. The group is drawn at the city's own
    coordinate where a member IS the city, and the card's own city is left out — a red "Rome" over the
    gold "Roman Forum" says nothing.
    **A LOCATOR'S NAME MUST BE A PLACE A READER COULD STAND**, which is a content rule the same request
    forced: thirty Rome locators were named after the card's ANSWER (`imperium`, `collegiality`), so the
    map put a labelled dot on a place called collegiality.
    The rest: the "Drag to turn" chip is gone (the canvas's aria-label still says what to do, which is
    the one reader the words were for); a CAPITAL is a square and the battle swords are steel with no
    outline; label boxes are MEASURED rather than reserved at a flat 141px and may be placed to the LEFT
    of their mark, so far more names fit; `CMAP_ZMAX` is 400 rather than 180; and the Vatican is in
    `CMAP_SKIP`, world.js rounding it to a 0.06° box that is six kilometres a side.
  · **A REGION IS CLIPPED TO THE LAND** (`landMask`, `effRings`, `tc`; Sep 2026, on request: "ensure
    displayed areas accurately follow coastlines … and do not extend into the ocean"). An `area` is a
    dozen authored points and a coast is a thousand, so the polygon is drawn GENEROUSLY and then
    multiplied by the land: two offscreen canvases, one holding every country under its own even-odd
    rule with the lakes cut back out, the other holding the region's fill AND its dashed edge, combined
    with ONE `destination-in`. **It was one canvas and `source-in` for an hour and that erased the
    fill** — `source-in` makes everything outside the NEW shape transparent, so the dashed stroke painted
    after the fill wiped the fill. A canvas rather than `clip()` because the countries do not tile
    exactly and an even-odd clip over all of them carves hairlines down every border.
  · **HI-RES COASTLINES, PER COLLECTION** (`CMAP_HIRES`, `hiresCoastIngest`, `coast/<region>.js`, the
    `coast_italy` / `coast_greece` / `coast_china` bundles; Sep 2026, on request). Natural Earth 10m coast
    chains SPLICED into world.js's own rings — a hi-res copy drawn over the low-res one doubles every LAND
    border, so a country keeps world.js's vertex chain wherever an edge is shared with a neighbour and
    only the runs no neighbour owns are replaced. Warmed at IDLE by the locator windows of the collection
    that frames it, never awaited and never by a map card or the Atlas. **📖 read
    `.claude/build-hires-coasts.js`'s header before touching it** — it records why the coast is classified
    off the 10m data rather than off world.js, and why Russia is left out of the China frame.
  **📖 `docs/map-cards.md` — READ BEFORE CHANGING ANY OF IT.** Why the globe is drawn here rather than by
  reusing the Atlas, the fit's near-rings rule and the Alaska and District of Columbia exceptions, the three
  attempts it took to prove the fill is a tint, `h2r` learning `rgb()`, where the facts box sits and why,
  and the ten-times-finer trace and its zoom-ceiling arithmetic.
- **ONE media panel on the card surface** (Aug 2026, on request — it was two, with a `.ces-media-swap` pill
  between them). A card shows one frame, so the editor offers one slot (`#cesMediaSlot`) and one panel
  (`#cesMediaPanel`, fields `data-mediafield="src|title|desc|credit"`), and the pasted URL decides which of
  the two stores it lands in: **`videoSource(url)` already recognises every link the player can take, so
  anything it does not recognise is a picture.** Asking the author to classify a URL Folio can classify
  itself was the whole of the old two-box design. The stores stay separate underneath (`card.image` /
  `card.video`, and the one-frame rule the writers enforce) — only the editor stops making the distinction
  the author's problem. Three details are load-bearing: **`mediaKind` must be settled BEFORE the gate stages
  the value**; **emptying the URL leaves `mediaKind` alone**, so the clear reaches whichever store holds the
  media; and **when the kind flips, the title, description and source are emptied first**, while
  `mediaKind` still names the old store, since a credit line silently re-attached to a new file is the same
  mistake as no credit at all. The glossary editors keep their own separate image/video panels.
- **Nothing is saved uncredited — the media source gate** (`wireMediaSource` / `askMediaSource`). The
  editors save on every keystroke, so a picture URL pasted in and forgotten used to ship credited to
  nobody — the one mistake that stays invisible until someone else points it out. The gate sits **between a
  media panel's fields and the store**: while the source box is empty a typed URL is **staged only**, an
  `.af-reqnote` says so where it was typed, and a modal asks the moment the URL field is left (`change`,
  not every keystroke). The whole staged object enters the store together as soon as a source exists;
  **clearing the source takes it back out**, so `src` and `credit` can never come apart in stored data.
  `render()` toasts on the way out if a panel is still pending, rather than losing the URL in silence.
  **All four surfaces use it** — the shared card surface's image and video panels, the curated glossary
  editor, and the Studio's term form — each passing its own `get`/`set`/`after`, so the writers stay dumb.
  Because a staged picture is deliberately NOT in the store, the panels' meta rows, the slot renderers and
  `imgSet()`/`vidSet()` **read `gate.staged()`, never the store**. It is **editor-side on purpose** — a
  hand-authored `data.js`, an imported deck file and an installed community deck are untouched, this being
  a guard against forgetting while writing rather than a validity rule imposed on other people's decks.
  `add-card.js` and `add-glossary.js` enforce the same rule at the content-pipeline end. Guarded by
  `.claude/test-media-source.js` (36 assertions).
- **Glossary video (optional):** `window.GLOSSARY_VIDEOS` (slug → the same object; `glossVideo(key)`,
  `ADMIN_EDITS.glossaryVideos`, baked by `serializeGlossary`), or `entry.video` inside `UGLOSS` for a
  community deck's own term. `renderGlossImage` puts it in the **same `.gloss-imgslot`** — **one frame per
  term, like a card**, so setting one retires the other and the picture wins if a hand-authored
  `glossary.js` carries both. Edited in the curated glossary editor's **EN view only** and in the Studio's
  term form; metadata is shared across languages, like an image's. The home page's Gloss-of-the-day plate
  stays image-only on purpose: it is a silhouette, not a player.
- **Glossary image (optional):** a term can carry the **same `{ src, title, desc, credit, alt }` object as a
  card**, read through `glossImage(key)` and rendered by `renderGlossImage` into the `.gloss-imgslot`, which
  is **floated to the TOP-RIGHT of the popup body**. It reuses `cardImageHTML`/`.card-img`, so the existing
  delegated listener opens the **shared** fullscreen viewer — no wiring of its own. The slot is therefore
  **first in `.gloss-body`, before `.gloss-dates`/`.gloss-desc`** — a float only wraps content that FOLLOWS
  it, so don't move it back after the prose (both markup sites: `openGlossWin` and the admin glossary
  editor's preview). **The 150px height and the half-popup width are the picture's MAXIMUM, not its shape**
  (`object-fit:contain`), so a tall picture is narrow and a wide one short, and both are whole — it was a
  fixed height with `cover`, which cut the sides off exactly the maps and diagrams a term carries.
  **THE WORDS WAIT FOR THE PICTURE** (`GLOSS_IMG_WAIT`, `.gloss-win[data-imgwait]`): a float of no intrinsic
  size lays the description across the whole popup and re-wraps when the file arrives, and **nothing can
  reserve the right box in advance, because the box IS the aspect ratio and no part of the entry records
  it** — so the body is held until the size is known. A cached picture resolves SYNCHRONOUSLY, the title bar
  is outside the held region, and `GLOSS_IMG_WAIT` is a ceiling. **The desktop placement waits with it**, or
  a too-short box is put on screen and then grown. A VIDEO needs none of this, its 16:9 box being stated in
  the stylesheet. The home page's Gloss-of-the-day tile shows the same image as a **profile-picture plate**
  (`.term-img`, a plain `<img>` — the tile is a `<button>`, so a `role="button"` figure cannot nest inside
  it), and the discovery row splits half and half on days its term has one. Curated terms live in
  `window.GLOSSARY_IMAGES`; a community deck's carry `entry.image` inside `UGLOSS` and travel with the deck.
  **The viewer's `z-index` (9800) must stay above the gloss stack** — popups sit at 8000+ and the mobile
  sheet at 9600, and a gloss image opens the viewer *from inside* a popup; `focusGlossWin` renormalizes its
  counter at `GLOSS_Z_CAP` so a long session cannot climb past it.
- **A PROFILE PHOTO IS CROPPED BY ITS OWNER AND ENLARGED BY ANYONE ELSE** (`openAvatarCropper` /
  `openAvatarViewer` / `AVATAR_PX` / `.av-crop` / `.iv-avatar`; Aug 2026, on request). The upload
  centre-cropped and there was no appeal — a portrait lost the head and the chin at once. The cropper is a
  round window the reader drags and zooms, handing back the SAME 128px JPEG data-URI, so `supaSetAvatar`,
  the `profiles` row and every monogram are untouched. **The image can never be smaller than the window**
  (`minScale` plus a clamp on both the zoom and the pan) and that is a hard guarantee rather than a nicety:
  a canvas saved as a JPEG has no alpha, so a hole is not a gap but a **black wedge in somebody's face**.
  Zoom is about a fixed point; one pointer pans and two pinch, by id, the whiteboard's rule; and the saved
  square is **re-rendered from the ORIGINAL** rather than scaled out of a preview sized to this screen.
  A friend's photo opens in the site's own viewer through an `img.viewClass` hook — round, being the shape
  it was composed in, and capped at ~320px, which is an honest limit: the stored square is small because a
  friends list fetches one per friend. **The button exists only where there IS a photograph**; a monogram
  is a letter already shown at the size a letter is worth. Guarded by `.claude/test-avatar.js`.
  **📖 `docs/media.md` — READ BEFORE TOUCHING ANY OF IT.** The viewer's zoom, pinch and pan arithmetic and
  the pointer-capture retargeting that made a real finger unable to fire the tap toggle at all, the video
  regexes as a security boundary, the alt-text reasoning, the dead-link treatment, the gate's four
  surfaces in full, and the profile-photo cropper's own five decisions.
- **Themes (6):** folio, synth, arcade, academy, marble, gazette — each light + dark, tokens **hex-only**
  (the canvas globe parses and blends them). **Seven themes were REMOVED on request** (atlas, press, bloom,
  tide, scroll, grove, dynasty), and clay and garden with them; a saved selection of one falls back to folio
  via the `THEMES` whitelist. **Don't reintroduce them, and read `THEMES` rather than quoting a count.**
  **Collection banners and all theme decorations are STATIC — no animated patterns** (removed on request).
  Themes register in `THEMES` plus the `THEME_OPTS` picker table, **both at module scope beside each other**
  since the chest overlay, the friends list and the admin tab all draw a theme. **Five of the six are
  COLLECTIBLE** — see the theme bullet under THE RELIQUARY (and `docs/reliquary.md`). **The one a reader
  wears is SYNCED, on `profiles` rather than in the progress blob** (`S.theme`, `themePushSoon`, schema
  section 14): `progress` is RLS-scoped to its owner, so a friends list would have to pull every friend's
  whole blob to read one string, where `profiles` is readable by any signed-in user. `themeSyncMissing`
  turns a 400/404 into silence — **a later schema block is never a prerequisite.**
- **Text size** (**Settings → Appearance → Text size**, `FONT_SIZES` / `setFontSize` /
  `S.settings.fontSize`): **very small / small / medium / large / very large**, written by `applyTheme` as
  `body[data-fs]` — so it is re-applied on every `render()` and at boot with no call site of its own — and
  read by styles.css as the multiplier **`--fs`**. The stored value is the NAME, so **no save is migrated**;
  the steps are deliberately UNEVEN, the middle three keeping the values they always had. **It scales EVERY
  px font-size in the stylesheet** (519 of them, each `calc(<px> * var(--fs))`), and deliberately does NOT
  move the LAYOUT — which is what keeps a four-cell grade bar four cells at Large. **There is ONE declared
  exception and it is the crossword's letter** (`.xw-cell`, sized off the grid's width); **if a second is
  ever needed, say so here.** The one thing outside its reach is the Atlas's canvas map labels, whose
  collision arithmetic is written against those numbers. The picker is a **slider** whose value is the INDEX
  into `FONT_SIZES`, so the scale and the stored setting cannot drift apart.
- **ANIMATIONS OFF** (**Settings → Appearance → Animations**, `S.settings.animations` / `motionOff()` /
  `body.no-anim`). ONE switch driving BOTH halves: the stylesheet's global killswitch gained a
  `body.no-anim` selector beside its `prefers-reduced-motion` query, and **`prefersReducedMotion()` now
  returns `motionOff()`** — so every JS-driven movement already written against it stops with the CSS-driven
  movement rather than half of it carrying on. It is an **OR, not an override**: an explicit OFF only adds
  to what the OS asked for and can never turn motion back ON over a reader who wants less of it.
- **HIGH CONTRAST** (**Settings → Appearance → High contrast**, `S.settings.contrast` / `body.hc`).
  **The check was run and the numbers are in the CONTRAST block at the top of styles.css.** It found the
  QUIET tokens below 4.5:1 — `--ink-faint`, `--ochre`, `--geo`, and `--zh`/`--good` on `--paper-2` — which
  are quiet on purpose, so re-toning them for everyone would flatten the hierarchy the design is built on;
  hence a mode. **The values are solved, not eyeballed**: each hue scaled toward the ink until it clears
  4.6:1 against the darkest paper. **One failure was NOT left to the mode** — night-mode `.btn` at 2.29:1 is
  a primary control, fixed for everybody — and **that fix then broke every GHOST button in dark mode for a
  fortnight**, putting near-black on the dark card so the label vanished outright. The rule is
  `body.night .btn:not(.ghost)` now; the `:hover` line beneath it had carried that `:not(.ghost)` all along.
  **Note `test-a11y.js` could not see it**: it only visits pages in its route list, and no game's results
  screen is in it. Guarded by `.claude/test-a11y.js`.
- **Light / dark FOLLOWS THE DEVICE by default** (`S.settings.themeAuto` / `systemPrefersDark` /
  `setThemeAuto`). `S.settings.night` stays the RESOLVED value — everything reads `body.night` and nothing
  else had to change — and `applyTheme` writes it from `matchMedia`, with a `change` listener repainting
  mid-session. Three deliberate things: **`setNight` turns `themeAuto` OFF**, or `applyTheme` immediately
  overwrites a hand-thrown switch; **the Night mode row stays on the page**, dimmed and never
  `pointer-events:none`; and **the migration is the part not to remove** — `defaultState()` carries
  `themeAuto: true` but the back-fill pins an OLDER save to `false`, an existing reader having chosen their
  `night` by hand.
- **Measurements: ONE system, the reader's** (`S.settings.units` / `unitizeText` / `unitizeTree` /
  `applyUnits`). Content stays authored **metric-first with the imperial in brackets** — the only form that
  carries both figures for a batch script, a citation pass or a translator — and what changes is what a
  READER sees. Both directions are idempotent, which is what lets it run from a `MutationObserver`.
  · **It is a DOM text-node pass, not a hook in `glossText()`/`cardLocalized()`**, and that is load-bearing:
    the editors read those same accessors, so a card whose stored text had lost half its measurement would
    be saved back that way on the next keystroke. Walking text nodes and skipping anything editable means
    the store is never involved. It skips `.notranslate`.
  · **Two patterns**: `U_CONV_RX` for the ordinary form, and `U_BARE_RX` for the second half of a pair
    sharing the first's unit, without which imperial mode leaves such a sentence half-converted.
  · **`isImperialParen` is the guard against eating an ordinary bracket** — measurement-shaped all through,
    carrying a number and a STRONG imperial unit, since `in` and `mi` alone would take "(in 1920)".
    Verified over the whole corpus: 341 fields transform and no other bracket is touched. **Re-run that
    check after a units batch.**
- **British or American spelling, the reader's** (`S.settings.spelling` / `SPELL_PAIRS` / `spellText` /
  `spellTree` / `applySpelling`). The units switch's shape exactly, so no field is authored twice. Ten
  things are decisions rather than plumbing.
  · **IT IS A DECLARED TABLE AND NEVER A RULE, and every trap in it was found in the real corpus** — a
    `-re`→`-er` rule turns `timetree` into `timetrer`, a `kerb`→`curb` rule reaches into `Kerberos`, an
    `-ll-`→`-l-` rule into `controlled` and the archaeologist `Conneller`. 144 rows of
    `[British, American, suffixes, one-way?]`, and the transform can only ever do what it says.
  · **THE SUFFIX LIST IS EXHAUSTIVE, AND THE BARE STEM ONLY BY AN EXPLICIT EMPTY ELEMENT** — the first cut
    always admitted the stem and rendered `emphasis` as `emphasiz`. **A suffix right for one side is not
    always right for the other** (`centre`+`d` → `centerd`), so every divergent inflection has its own row.
  · **IT IS TWO-WAY, WHICH THE UNITS SWITCH IS NOT, AND THE MEASUREMENT IS WHY**: the corpus is genuinely
    mixed in the -ise/-ize family, so a one-way transform would leave a British reader reading American
    spellings on half the cards.
  · **EIGHTEEN ROWS ARE ONE-WAY ALL THE SAME** — `storey`→`story` is safe and the reverse catastrophic; the
    same for `program`, `meter`, `practice`, `license`, `catalog` and `medieval`.
  · **FIVE FAMILIES ARE DELIBERATELY ABSENT AND FIVE WORDS EXCLUDED BY NAME**: American English writes
    `archaeology` (1,923 sites), `ochre`, `aesthetic`, `dialogue`/`analogue` and `axe` the same way; `tyre`
    is the Phoenician city, `draught` the Knossos corridor, `kerb` excluded because `curb` is also a verb.
  · **A URL IS NOT PROSE, AND THE MASK IS IN `spellText` RATHER THAN `spellTree`** (`SPELL_URL_RX`): 173 of
    10,108 URLs carry a mapped word, and `mediaCreditHTML` renders a credit URL as its own visible text.
  · **THE CITATIONS AND THE LIBRARY'S BOOKS ARE SKIPPED** (`.notranslate, .bk-page`) — rewriting *The
    Colour of Prehistory* invents a title that does not exist, and a book is somebody's translation.
  · **`gradeCloze` TRANSFORMS THE ANSWER, NEVER THE GUESS** — the stored `answerText` is British, so an
    American reader typing what is on their screen would be marked wrong.
  · **A TEXT NODE UNDER A NON-ENGLISH `lang` IS NOT ENGLISH AND IS LEFT ALONE** (`spellSkip` /
    `SPELL_LANG_EN` / `SPELL_FOREIGN_SEL`; Aug 2026, on a bug report that the Spanish `por favor` was shown
    as `por favour`). This is a switch between two spellings OF ENGLISH and it was being run over every text
    node on the page, a **language deck's own Spanish, French, German, Italian and Portuguese included** —
    where the table's American forms are ordinary foreign words. Measured over the 52 shipped decks: **5,568
    rewrites of somebody else's language**, of which the worst is that the Spanish verb `saber` was shown as
    `sabre` **on the FRONT of DELE A1's card 108**, so the word a learner was being taught to produce was
    the misspelling. German `Labor` became `labour`, Portuguese `valor` `valour`, Spanish `color` `colour`.
    **THE FIX NEEDED NO NEW MACHINERY, WHICH IS THE POINT**: `cardTypeSideHTML` has always written the card
    type's `speechLang` onto the `.uc-card` wrapper, so the Spanish card was sitting inside `lang="es-ES"`
    the whole time and the pass simply was not asking; the daily quote's original-language block carries its
    own `lang` for the same reason, and `<html lang="en">` is the declaring ancestor for everything else, so
    Folio's own prose is untouched. It is asked **once per pass, not per text node** — measured on `#decks`
    (8,848 text nodes), a `closest("[lang]")` per node costs 2.74ms against 0.15ms for the flag, so a reader
    with no foreign text on screen pays for none of it. An **empty** `lang` declares nothing and is not a
    reason to skip. **KNOWN GAP, STATED RATHER THAN PAPERED OVER**: the rule can only see a language that is
    DECLARED, so foreign text carrying no `lang` is still swept — a card type with no `speechLang` (all 52
    shipped decks declare one on every type, so the shipped corpus is covered; a stranger's imported deck
    need not), and a deck's own GLOSSARY, whose popup is drawn outside the card wrapper and inherits no
    language (`UGLOSS` is empty across all 52, so there is nothing to fix yet; a deck that ever carries one
    would want `lang` on `.gloss-win`).
  · **THE WORD BOUNDARY IS UNICODE-AWARE, AND `\b` CANNOT BE** (same report). JS's `\b` is defined over
    ASCII `\w`, so an **accented letter is a non-word character and stands as a boundary of its own** — a
    `\b`-anchored pattern therefore matches INSIDE an accented word: `Moldávia` became `Mouldávia`,
    `literário` `litreário`, `élaborer` `élabourer`, `honoré` `honouré`, `réorganiser` `réorganizer`. The
    fix is the lookarounds `buildGlossIndex` already uses for the mirror of this reason (`Æsir` and `Vé`
    could never MATCH): `(?<![\p{L}\p{N}_]) … (?![\p{L}\p{N}_])` with the `u` flag. **Folio's own corpus
    was measured clean of it** — the fault only ever reached accented content, which is the decks — and it
    is what keeps the known gap above from mangling the inside of words.
  · **AND `spellSkip` IS ONE TEST FOR BOTH BRANCHES.** `spellTree`'s bare-text-node branch — the one the
    MutationObserver feeds — had **no skip test at all**, so a citation or a book's prose updated in place
    was rewritten while the same text reached through the walker was protected.
  **Known limit, stated rather than papered over**: the card browser searches stored card TEXT, so
  "color" will not find a card whose stored prose says "colour". Guarded by `.claude/test-spelling.js` (83
  assertions), most of which needs no browser — and its section 4 must stay in **en-GB**, since `favor` is
  an American form and the American-to-British direction is the one that corrupts it; written against
  en-US it passes on the unfixed code. It carries a **liveness check** beside it for the same reason: a
  change that stopped the en-GB pass running would otherwise make every assertion there pass while testing
  nothing.
- **ENGLISH ONLY — `const MULTILANG = false`** (app.js, beside `LANG_CODES`; Aug 2026, on request). The site
  ships in English while the work is on making the English as good as it can be. It is **one switch** and it
  shuts three doors: no Language card on Settings, `?lang=xx` no longer switches, and `setLang` refuses
  anything but English. It began with **nothing deleted**, and that is no longer true of the CONTENT: on
  2026-08-08, on request, the card `i18n` blocks and every `i18n/gloss-<lang>.js` were REMOVED — 2.06 MB of
  the eager path the gate put beyond every reader's reach. What survives is the ENGINE and the other three
  families (`ui-`, `games-`, `places-`), all still lazy, so flipping the flag brings the chrome, game pools
  and map labels back at once — but **not the cards and glossary**, which now fall back to English in every
  language and would have to be regenerated. `loadLangData` no longer requests the gloss bundle.
  **The migration back is the part not to remove**: `langFromURL` resets a stored non-English
  `S.settings.lang` to `"en"` on boot, or a reader who had chosen Spanish would be held there for ever with
  no control left to escape. The content pipeline has the same switch three times over
  (`REQUIRE_TRANSLATIONS`) and, since the removal, a second guard: `add-card.js` and `add-glossary.js`
  **DROP** a supplied `i18n` block with a warning. One consequence to know rather than fix: **the editors
  can no longer reach a translation**, the editing language being the site language, so translations are
  edited by `.claude/add-lang.js` alone — and its `cards` and `glossary` sections would RECREATE what was
  deleted, so only `chrome` and `tree` are live. Guarded by `test-layout.js` and `test-i18n-lang.js`, which
  asserts the gate UNPATCHED and then **serves an app.js with the flag flipped** so the machinery behind it
  stays tested rather than quietly rotting.
- **Language picker + i18n** (**Settings → Language**, `langPickerHTML` / `wireLangPicker`; it moved off the
  top bar on request when the phone's top bar was removed). A grid of 10 languages (en/es/fr/de/it/nl/ru/ar/
  zh/ja) in `S.settings.lang`, each with an **inline SVG flag** (`FLAG_SVG` — NOT emoji flags, which render
  as bare letter pairs on Windows). The whole grid is `notranslate`: these are the languages' OWN names.
  **The site chrome IS localised** — `i18n/ui-<lang>.js` holds `I18N` exact strings, `I18N_RULES` regex
  patterns and `I18N_HTML` prose blocks, all keyed by the ENGLISH source text, and app.js's engine (`t()`,
  `localizeTree()`, `applyLang()`) walks rendered text nodes and title/aria-label/placeholder/alt after
  render, with a MutationObserver for later DOM. Originals are stashed on the nodes; anything untranslated
  stays English. Arabic flips `<html dir="rtl">`; `.notranslate` is skipped.
  **Adding a language** touches exactly three code sites — `LANGS` + `FLAG_SVG` and `CARD_I18N_LANGS` in
  app.js, plus the `I18N_LANGS` list in `add-card.js`/`add-glossary.js` — and everything else keys off
  `S.settings.lang`. Backfill content with `.claude/add-lang.js` and **add the code to `LANGS` LAST**, so
  the picker never offers a language that renders as English. **No CJK webfont is loaded, deliberately**:
  CJK falls through to the reader's own system font, giving correct per-language glyph forms, and the
  imported `Noto Sans SC` sits only in `--han` so it cannot impose Chinese forms on Japanese text.
  **Collection and deck titles carry their own `node.i18n` lang-map** read by `nodeTitle(n)` — deliberately
  NOT the exact table, because titles like `Prehistory` and `Bronze Age` also occur as answer terms inside
  card prose. `SHIPPED_NODES`, the `applyAdminEdits` rebuild and `serializeCardData` must ALL carry a new
  node field or it is silently dropped on the first admin edit. **`setLang(code)` is the single entry
  point** — it validates, persists, and calls `loadLangData()` first, since the tables are lazy and
  per-language. **Known gap:** `PAGE_META` has no translated entries, so `document.title` stays English.
- **UI sound effects** (the `/* UI sound effects */` block): tiny synthesized Web-Audio sounds, no files.
  **`click` and `toggle` are a soft TAP** (`sfxTap`) — a short burst of noise with a light body under it,
  which is what a finger on wood actually is, and which a pure oscillator cannot make. **The filter is a
  BANDPASS, and that is the second correction**: a low-pass keeps everything BELOW it, so the first version
  was mostly rumble over a sine falling 190→120 Hz — a bass drum, not a fingertip. A bandpass keeps a band,
  so the tap has a MATERIAL rather than a weight; **nothing goes below 500 Hz**, both parts are under 32ms,
  and the gains are LARGER for a quieter result. `sfxTap` deliberately has **no attack ramp**, a tap
  starting at full level on its first sample. `sfx(name)` covers click / toggle / pop / good / bad / win /
  discover, played by ONE delegated **capture-phase** click listener so a `stopPropagation` cannot swallow
  the tick. Gated by **Settings → Audio → Sound effects**; the shared `AudioContext` is created inside the
  gesture. **Volumes are deliberately tiny — keep them subtle.**
- **Read-aloud TTS — SET ASIDE (July 2026)**: the whole system is disabled site-wide (`ttsEnabled()`
  returns `false` unconditionally), which hides every play control, the card mute button, auto-read and the
  selection menu; the Settings "Audio" card was removed. The machinery and the baked `audio/` files stay
  dormant for a later revival — Web Speech plus four Piper-baked narrators, all **CC BY 4.0**, and
  **`hfc_male`/`ryan`/`lessac` are CC BY-NC and must not be used.** See `docs/reader-settings.md`.
  · **A COMMUNITY CARD TYPE'S `.uc-tts` IS NOT PART OF THAT AND IS LIVE** — it deliberately bypasses
    `ttsEnabled()`, being a control a reader presses rather than something Folio does to them (see the
    `.uc-tts` bullet above). So "read-aloud does nothing" reported on a LANGUAGE DECK is never the
    site-wide switch, and answering it with that switch sends the next session looking in the wrong place.
  · **AND A PRESS MUST NEVER COME BACK AS SILENCE** (`TTS_SILENT_MS` / `ttsSilentNote` / `ttsCanSpeak`,
    Aug 2026, on a bug report that read-aloud "is not working at all" on the Spanish decks). A browser can
    carry `speechSynthesis` and `SpeechSynthesisUtterance` and have **no voice installed behind them** —
    ordinary on Linux without speech-dispatcher, on some Android WebViews, and in **headless Chromium,
    where it is measurable**: the API is present, `getVoices()` is empty, and `speak()` returns with no
    sound, no error and no `onstart`. Every guard on the path passed, so the control drew itself as a live
    button and answered a press with nothing at all.
    **THE OUTCOME IS MEASURED, NEVER PREDICTED, and that is the whole of the design.** Refusing up front
    on an empty voice list was written first and is wrong twice over: `getVoices()` **arrives
    asynchronously**, so the same list is empty at boot and full a second later, and on some engines it is
    empty while speech works — so refusing would silence a control that WOULD have spoken. `cardSpeak`
    therefore always attempts, and asks afterwards whether the engine actually started (`onstart`, then
    `speaking`/`pending` after `TTS_SILENT_MS`); only then does it report. `ttsSilentNote()` picks the
    message from `ttsCanSpeak()` — **no voices at all is a fact about the DEVICE**, where an engine that
    has voices and still produced nothing is a failure of this one attempt.
    **AND THE FIRST OF THOSE TELLS THE READER WHAT TO DO** (Aug 2026, on request): the fix is an
    operating-system one, so it reads *"No speech voice installed — add one in your device's settings"*
    rather than the true-but-dead-end "Speech isn't available on this device". **The advice is
    deliberately PLATFORM-NEUTRAL**: naming the menu path is more helpful when right and worse than
    silence when wrong — it differs across Windows, macOS, Android, iOS and the Linux desktops,
    `navigator.platform` is unreliable and deprecated, and a reader sent to a screen that does not exist
    gives up on something that would have worked. It rides a longer dwell (`TTS_NOTE_MS`, via `toast`'s
    optional second argument), a message that asks for an action being read rather than glanced at.
    **`.toast` had to learn `width:max-content` for it, and that fixed every toast on a phone**: positioned
    `left:50%` with no `right`, a shrink-to-fit box may only be as wide as the space to the right edge —
    HALF the viewport — so on a 360px phone every message was capped at 180px, and "Daily limits saved"
    already wrapped to two lines while this one ran to five. Measured before and after at 360/390/768/1280:
    the long note goes 5 lines to 2 on a phone and 2 to 1 at 768, nothing overflows at any width, and
    nothing that already fitted on one line moved.
    **`ttsSupported()` STILL ANSWERS ONLY "IS THE API HERE"** and must not be taught otherwise: it gates
    `body.no-tts`, which takes the button's chrome away, and **the shipped language decks' control is an
    EMPTY span** (`<span class="uc-tts uc-say" data-say="{{Word}}"></span>`) that collapses to **0px wide**
    under that class — measured — so widening it would make the control vanish rather than explain itself.
    Guarded by `test-speak.js`'s last section, which asserts all three cases including that **an engine
    which really speaks is never nagged**.
  **📖 `docs/reader-settings.md` — READ BEFORE CHANGING ANY OF IT.** Every measured contrast ratio, the
  spelling table's traps in full, the units sweep's awkward shapes, the i18n engine's `I18N_HTML` gating
  and its cap, and the whole dormant narration system — the voice scoring, the chunking, the baked
  manifest's hashing gotcha and the `--rehash` flag.
- **THE VERSION LINE** (`versionLineHTML`, just above `PAGES.home`; `.site-ver` in styles.css — Aug 2026, on
  request). The shipped version and the moment it went out, very small in the **top-left corner of the home
  page**, above the greeting. Four decisions in it are load-bearing.
  · **The record lives in `changelog.js`, not in app.js** — see the golden rule. Bumping it and writing the
    day's changelog line are then one edit in one file.
  · **It is read at RENDER, never captured at boot.** A reader on a service-worker-cached copy of the site is
    running an older build, and the number they are shown must be that build's, since the whole point of it is
    to be quotable in a bug report. It also means a missing record prints **nothing** rather than a
    placeholder, which is the honest failure.
  · **The instant is stored in UTC and printed in the READER's own clock and locale**, like the day boundary
    and unlike the changelog's day headings, which are deliberately fixed to the site language: this is a
    moment in time rather than a day of publication. **That is also why the stored stamp has to be CAPTURED
    rather than typed** — see the golden rule: a local hour written with a `Z` on the end is shown shifted by
    the writer's own offset, which is how a morning release came to be announced in the afternoon (reported
    Aug 2026). Nothing in the code can detect that, since a wrong instant is a perfectly valid one; the fix
    is `date -u` at the moment of writing it.
  · It is a **sibling BEFORE `.page-head`, not inside it**, and carries its own `text-align:left`: below 640px
    and in the academy and gazette themes the page head is centred or boxed in a rule, and a centred version
    number reads as a title rather than as a stamp. `notranslate` for the reason the discovery chip's figure
    carries it. Its colour is `--ink-faint`, the site's own quiet token — so it joins the captions and source
    lines that the **High contrast** mode re-tones, and `test-a11y.js` covers it with no change of its own
    (3.25:1 reported in the default mode, clearing the bar with the mode on). Guarded by `test-layout.js`.
- **THE GUIDED WALKTHROUGH — a first visitor's few minutes** (the `THE GUIDED TOUR` block in app.js:
  `TOUR_KEY` / `TOUR_STEPS` / `tourStart` / `tourGo` / `tourPaint` / `tourPlace` / `tourAfterRender` /
  `tourOfferHTML`; `.folio-tour` in styles.css). Ten steps that dim the page, put one card in the middle of
  it, and point at the thing being described — spaced repetition, adding a deck, studying a card, the
  marker. **It deliberately stops short of the Atlas and the Library**, which explain themselves the first
  time they are opened. Five decisions are load-bearing.
  · **THE OFFER IS INLINE, NOT MODAL.** It would be one line to raise the tour over the home page on a first
    visit, and it is the wrong line: a site that seizes the screen before the reader has seen it is a site
    they leave. `tourOfferHTML()` is a card at the head of `.banners`, shown to a reader who has **never
    graded a card** and never answered it; either answer writes the key for good, and **Settings → Study →
    Walkthrough** is the way back. It is also what keeps every Playwright test that boots a fresh reader
    from meeting an overlay it never asked about.
  · **THE SCREEN STAYS DARK: the target is RINGED, not spotlit.** A cut-out spotlight means holding a hole
    in the scrim over an element that moves with every reflow, and it reads as a page half-lit. Each step
    draws an **arrow** from the card to a **dashed ring**; a step whose target is missing draws neither and
    still reads — a tour must never depend on the state of the page it describes.
  · **IT NAVIGATES, so it is NOT in `render()`'s close list** — a `render()` that dismissed it would do so
    at exactly the moment it was doing its job. What it does need is re-measuring: `tourAfterRender()`.
  · **THE CARD IS NUDGED OFF ITS OWN TARGET, and the base rect is COMPUTED, never measured.** Four
    placements are tried and the smallest shift that keeps the card on screen wins, with room left for the
    ARROW. The unshifted rect comes from `offsetWidth`/`offsetHeight` plus the viewport centre, **not from
    `getBoundingClientRect()`** — the card's transform is transitioned, so a rect read mid-change does not
    recover the centred box and every later step shifts an already-shifted card until it walks off the side
    of the screen taking its own Next button with it.
  · **…AND ON A PHONE IT IS DOCKED TO THE FOOT OF THE SCREEN INSTEAD.** Centred, the card takes 47–66% of a
    640px screen and the nudge has nowhere to move it, so the thing being described ended up underneath it.
    The layout is a **STYLESHEET decision read back in JS** (`tourPlace` asks the overlay for its computed
    `align-items`), not a breakpoint written twice, and `tourReveal` scrolls the target into the band ABOVE
    the docked card rather than to the viewport centre, which is where the card now is.
  · **A RING IS CLAMPED TO THE SCREEN, AND DROPPED WHERE IT WOULD RING THE SCREEN ITSELF.** On a 360px
    phone all four corners fell outside and what was left was two dashed rules down the edges. Clamped, and
    if the clamped box still covers more than 60% of the screen nothing is drawn — the step's own words are
    what it has to say. **The ARROW goes with it**, and also whenever the card ends up inside the ring.
  · **THE STUDY STEPS ARE ILLUSTRATED, NOT PERFORMED** — dealing a real card would hijack the reader's
    schedule — **with the four intervals read from the real scheduler**, a tutorial teaching a schedule the
    site does not use being worse than one teaching none.
  Escape and Skip close it; the **backdrop deliberately does not**, a stray tap on a dimmed page being the
  likeliest gesture there is. `.folio-tour` is in `swipeEnabled()`'s overlay list. Guarded by
  `.claude/test-tour.js`.
- **A PAGE'S OWN FIRST-VISIT COACH MARKS** (`pageHelp` / `closePageHelp`; `.page-help` in styles.css). The
  Atlas has had these since it shipped (`folio_atlas_tour_v1`, reopened by `#gzHelp`); the walkthrough stops
  short of the Atlas and the Library on purpose, so **the Library has its own — and TWO**:
  `folio_library_tour_v1` on the shelf (reopened by `#libHelpBtn`) and `folio_book_tour_v1` the first time a
  book is opened (reopened by `#bkHelp`). Same card, same three ways out; the reasoning for the split is in
  `docs/library-feature.md`. **IT LIVES ON `document.body`, AND THAT IS NOT A PREFERENCE.** The Atlas's card
  can be `position:absolute` inside its own full-bleed stage; an ordinary page has none, so this one must be
  fixed to the VIEWPORT — and `.page` carries `animation:… both`, which makes it the containing block for
  every fixed descendant. Written into the page, `inset:0` resolves to the page's own box: on the Library
  that is several screens tall, so the card centres itself a screen and a half below the fold and the reader
  sees a dimmed page with **nothing on it**. It shipped that way for an hour. On the body it is `render()`'s
  to close — hence `closePageHelp()` in the close list.
  **📖 `docs/chrome-navigation.md` — READ BEFORE CHANGING ANY OF IT.** The repaint path, the `touch-action`
  finding in full, the swipe order's history and the cross-slide's geometry, the page ghost's stripped ids
  and the radio-group fault that forced them, and the walkthrough's placement arithmetic.
- **Home page** (`PAGES.home`), one column at **every** width: greeting → **daily quote** → **review
  banner** (+ the Collections button under it) → a **Minigames** heading over the 3 × 3 game grid → a grey
  **About Folio** line. That is the whole page. The operational half:
  · **THE DAILY QUOTE** comes from `SHIPPED_QUOTES` + `ADMIN_EDITS.quotes` through `quotesMerged`, **keyed by
    a quote's shipped English text, never its index** — an index moves the moment one is inserted above it.
    Clicking one **flips it to the original language** where the entry has an `o` block, crossfading and
    holding the figure at the taller of the two languages; the words are selectable and the flip is
    classified in JS (a live selection or a press that MOVED is not a flip). The day's quote follows
    **`QUOTE_ORDER`**, not the array: no author two days running and none more than twice in seven, solved on
    a circle so the rule holds for ever, rebuilt at load — so **adding quotes needs no thought, but the pool
    must stay solvable** (`test-daily-quote.js`).
  · **`fresh` IS "NO HISTORY *AND* NOTHING TO STUDY"** — `S.cards` empty AND `activeCardIds()` empty. Keyed
    on emptiness alone it also caught a reader who had just used **Reset progress**, and it hides the deck
    list, so the one thing they wanted back was the one thing taken away. Fresh draws a hero whose button
    routes to the **collections** rather than choosing a subject for them.
  · **THE BANNER COUNTS ANKI'S THREE PILES** — New (blue), Learning (red), Review (green), from `pileCounts`,
    repeated unlabelled in the same colours on every added deck's row from the SAME function, so a row can
    never claim work the banner does not. Its hue **changes every day** (`DAY_HUES` / `dayHue`, set inline,
    turning over at the reader's own day boundary) unless the reader has chosen one. A finished day offers
    **no button at all**, and completion is a small green check or a gold **Perfect!** ribbon.
  · **EVERY SESSION ENDS AT THE HOME PAGE**, whatever its scope — one answer rather than a rule per surface.
  · **THE COLLECTIONS BUTTON IS THE ONLY ROUTE TO `#decks` ANYWHERE ON THE SITE**, and the About line the only
    route to `#mission`: both ship at every width and in every state, so **do not gate either on a breakpoint
    or on having decks**. The routes themselves are untouched — every link ever shared points at one.
  · **THE DISCOVERY ROW IS GONE** (Card of the day, Term of the day, the Atlas teaser), and with it
    `dailyPick` and `startMiniGlobe` — deleted, not left lying about, which is also why the home page no
    longer fetches the ~1.6 MB `world` bundle at idle. The Card-of-the-day PSEUDO-ENTRY (`COTD_ENTRY`,
    `S.cotd`) survives untouched.
  · **THERE IS NO `phone` FLAG AND NO RESIZE LISTENER** — nothing here is BUILT at one width and not the
    other; what differs is layout, and the stylesheet answers for that alone.
  · **Guarded by `test-layout.js`, `test-daily-quote.js` and `test-tour.js` section 5b.**
  **📖 `docs/home-page.md` — READ BEFORE CHANGING THE PAGE.** The quote flip's timings and height lock, the
  running order's arithmetic, the banner's meta row and the day's study timer, what each removal was for,
  and the faults that made a working page look broken — a first-run screen keyed on emptiness alone, and a
  heading whose class collided with the map game's and rendered hard left with a computed `text-align:center`.
- **Home minigames** (game-grid tiles → `PAGES.*`), a 3 × 3 grid under a **Minigames** heading:
  **Multiple Choice** (`challenge`), **Timeline** (`chrono`), **True or False** (`truefalse`), **Who said
  it?** (`whosaid`, from `quotes.js`), **Find it** (`findit`, on the real Atlas globe), **Common Thread**
  (`thread`, the only one built on the GLOSSARY), **Crossword** (`crossword`, clued from the cards' own
  questions), **Picture round** (`picture`, from every illustration Folio holds) and **What year?**
  (`whatyear`, from `whatyear.js`). The operational half:
  · **EVERY CARD-FED GAME DRAWS THROUGH `gameCardIdSet()`, NEVER `availableCardIdSet()`** — the well-known
    terms only, at or below `GAME_MAX_DIFFICULTY`, since a game deals a term COLD. A tenth game reaches for
    that function; `test-difficulty.js` asserts there is no other path. **Timeline has a second filter**
    (`card.undatable`) and nothing else may borrow it.
  · **A NEW GAME IS WIRED IN SIX PLACES AND FIVE OF THEM FAIL SILENTLY**: `PAGES.<key>`, the `valid` route
    list, `PAGE_META`, `DAILY_GAMES`, `GAME_NAMES` + `GAME_SET_WORD`, and the tile plus its click handler in
    `PAGES.home`. `test-minigames.js` asserts all six, against the tiles the home page actually paints.
  · **THE DAY'S DRAW IS THE SAME DRAW FOR EVERY READER, AND `dayPick(key, arr, n)` IS THE ONE WAY TO MAKE
    ONE** (Aug 2026, on a bug report: two readers comparing True or False scores had been answering
    different statements). A daily game's score is written to the tile as TODAY'S, shown beside a
    site-wide average on the tile's own record card, and read off a friend's account beside your own — so
    a set drawn from `Math.random` makes every one of those comparisons a comparison of two different
    tests, silently. Six of the nine were seeded off `todayStr()` already; **Multiple Choice, True or
    False and Who said it? were not**, and now are. `dayPick` is `pick`'s seeded twin — same signature,
    same shuffle, the day in place of the entropy — and lives beside `gameLockedToday`. **NEVER `pick`
    IN A GAME'S DRAW**; the one legitimate `Math.random` left in the games is Common Thread's Shuffle
    button, which is the player jumbling their own board rather than a draw.
    **The key names the DRAW, not the game**: a round draws its questions and then its options, and two
    draws sharing a seed shuffle in step, which on a four-option round puts the answer in the same
    position every round. And a per-round key carries something STABLE about that round — the card's id,
    the pool index — never its position, which would move every later round's options the day an earlier
    card left the pool, and never a LOCALISED string, which would deal a Spanish reader different
    decoys. It reads the reader's OWN day boundary, like the lock and the streak: everyone sharing a date
    shares a quiz, which is the guarantee — not that the planet turns over at once.
  · **ONE PLAY A DAY** (`gameLockedToday(root, key)`, called as each page's first act) — every game is
    daily, its rounds are drawn once and its score is today's, so a second run is a run with the answers in
    hand. The placard wears the game's own tile icon (`ICON`, at module scope so the tile and the placard
    cannot disagree). Each records `S.games[key] = { date, played, won }` through `markGamePlayed`, where
    **`won` is a PERFECT score, not a play**.
  · **THE TILE EARNS ITS COLOUR**: a whisper of its hue unplayed, filled with a green check once played, a
    shining gold ribbon on a perfect run. All nine `won` on one day is the **Clean Sweep** badge and a
    chest, and the badge gets harder each time the grid grows, deliberately.
  · **AND IT TURNS OVER TO ITS RECORD** (`gameBackHTML` / `flipGameTile` / `gameStatsPost` /
    `gameStatsLoad` / `.gt-face` / `.gt-back`; Aug 2026, on request). A HOLD flips it — `wireHoldMenu`'s
    own gesture, the deck rows' and the review banner's, so a tap still opens the game and the guard that
    swallows the click after a hold is the same one. Four things.
    **THAT GUARD'S WINDOW IS MEASURED FROM THE RELEASE, NOT FROM THE FIRE** (Aug 2026, on a bug report:
    "the minigame tiles … when flipping them they immediately flip back"). `wireHoldMenu` fired at
    `HOLD_MS` and armed the swallow for 700ms from THERE — but the click it has to swallow is dispatched
    when the finger comes UP, so a reader holding a tile for a second and a half to see what happens
    released past a window that had already shut. The click then reached `onTap`, which on a flipped tile
    means "turn it back": the record appeared and vanished in the same gesture, and **the longer you held
    the more reliably it did**. The release re-arms it. Measured through CDP touch input — a 600ms hold
    flipped and a 1,400ms hold flipped and instantly unflipped — and **a synthetic `el.click()` cannot see
    this at all**, never following a real pointer sequence, which is why nothing caught it.
    **AND THE BACK IS A DIFFERENT LAYOUT ON A PHONE** (same report: the stats "don't display correctly on
    mobile"). Three tiles to a 390px row is about 110px each, and the back was two columns of three rows
    plus a heading and a footer — measured, 167px of content in a 110px box, clipped by the tile's own
    `overflow:hidden` into two 34px columns of overlapping half-words. So the columns STACK, the type comes
    down a step, "Tap to play" goes (a phone reader knows a tile is tapped) and the SITE half falls back to
    a one-line form, `.gtb-brief`, **emitted beside the full one and chosen by the stylesheet** rather than
    by a breakpoint read in JS. Every state keeps its own short form — "Not collected", "Unavailable",
    "None yet" say three different things, and collapsing them to a dash would tell a reader nobody had
    played when the truth is that this site does not count.
    **THE SITE-WIDE HALF IS A POOLED COUNTER TABLE** (`game_stats` + `bump_game_score`, section 15 of
    `.claude/supabase-schema.sql` — **the user must run it once**), for the reason the community card
    rating is: `progress` is RLS-scoped to its owner and their friends, so there is no averaging across
    readers from the tables the site already had. **A project without the block says so in a sentence**
    rather than showing a zero, which reads as "nobody played" — and a fetch that merely FAILED says
    something different again, since claiming a site does not collect a figure because a connection dropped
    is a claim made out of a dropped connection. **THE DAY IS THE SERVER'S UTC DAY**, not the reader's, and
    the tile says "today" without claiming it is theirs. **THE FLIP IS 2D AND THAT IS FORCED**:
    `.game-tile` carries `overflow:hidden`, which flattens `transform-style` to `flat`, so a 3D rotation
    would show the back mirrored — two `scaleX` squashes about opposite origins read as one card turning.
    **AND THE TWO HALVES SWAP `aria-hidden`**, or a flipped tile reads out its front and never its record.
  · **A MAP LABEL IS NOT A QUESTION** (`FINDIT_NAMES` / `finditName`, Aug 2026, on a bug report: "when the
    Find it minigame says what state to find, it should differentiate between the two Congos"). A Find it
    round's name comes straight out of `world.js`, whose labels are written to FIT ON A MAP: they are
    abbreviated ("Dem. Rep. Congo", "Central African Rep.") and, in one case, genuinely ambiguous —
    **`Congo` is the everyday name of the Republic of the Congo AND of its neighbour**, so "Find Congo"
    asked a question with two right answers and marked one of them wrong. A declared table gives the ROUND
    TEXT a reader-facing name and nothing else: the answer is still matched on the map's own label, so
    this cannot change what counts as correct. Every key is a label `world.js` actually carries, and the
    four abbreviations it does not cover are the four that no `countryDesc` lets into the pool.
  · **WHAT YEAR? LISTS ITS FIVE IN ORDER, AND ITS YEAR IS STEPPED AS WELL AS DRAGGED** (`wyOrder` /
    `.wy-readrow` / `.wy-step`, Aug 2026, on request). All five clues share ONE year, so the only order
    they can be listed in is the order they HAPPENED — which needs a month and a day, and `whatyear.js`
    recorded none: a 1066 puzzle opened on Edward's death in January, jumped to Halley's comet in April,
    then put the fleet sailing from the Somme after the battle it sailed to. **`d` is a `"MM-DD"` sort key
    and is never shown**, which is what keeps it inside the pool's own rule that an entry may not name a
    date. **91 of the 98 entries carry one and seven deliberately do not** — the sack of Zhongdu (May or
    June, depending on the source), four of 1517's Ottoman entries, the finding of the Dead Sea Scrolls and
    1960's seventeen independences, which is a whole year rather than a day — and those sort last: a
    made-up day reads exactly like a researched one, and an unordered entry costs the reader nothing.
    The chevrons step the marker one tick and repaint through the SAME `paint()` the slider does, since
    a second writer would be a second answer to "where is the marker"; their disabled state is recomputed
    on every paint, because a wrong guess narrows the rail under them.
  · **THE CROSSWORD IS NOT CARD-FED, AND IS THE ONLY GAME THAT WAS AND STOPPED** (`crossword.js`,
    `xwPool`; Sep 2026, on request: "the crossword puzzles should no longer use questions from the cards;
    create completely unique, simple history-based crossword puzzles"). A card question is a CLOZE written
    round a blank, 20–34 words by house rule and carrying markup — a paragraph where a grid wants a phrase
    — the pool was whatever the deck happened to hold, and a reader who had studied the card had already
    seen the clue. `crossword.js` is the game's own bank of 334 answers of 4–11 letters with a short clue
    each, on `whatyear.js`'s model and under the rules in its header. **Measured over 730 days: no blank
    day, all nine entries every day, and 730 DISTINCT grids** where the card pool had collapsed to 60.
    `check-style.js` reads the file (rule 4 only — a four-word clue has no business carrying a card's
    conventions), and `test-difficulty.js` asserts the game no longer reaches for the cards.
  · **`event` IS TOO BROAD TO BE A COMMON THREAD CATEGORY** (Sep 2026, on a report). It is the site's kind
    tag for anything that HAPPENED and held 51 terms — a naval battle, a volcanic eruption, the
    decipherment of a script, a flood myth — which is not a group a solver can see. In `THREAD_BROAD` with
    the other sixteen. Sweeping 730 days without it: still 0 blank days, 728 distinct puzzles, and 42
    categories reachable rather than the handful `event` was crowding out.
  · **A DAILY POOL IS SEEDED AND ITS ANSWER MUST BE REACHABLE** — the crossword's letters must fit its own
    squares, What year?'s answer must sit on a tick of its own rail, and Common Thread's four groups must be
    provably disjoint. Each generator retries rather than giving up, and a starved pool is the failure mode
    to watch: **a generator that works on a large pool can fail on a third of days when the pool is narrowed,
    with nothing on the page to say so.**
  · **Guarded by `test-minigames.js`** (including a 730-day sweep in Node) **and `test-difficulty.js`.**
  **📖 `docs/minigames.md` — READ BEFORE ADDING A GAME OR CHANGING A POOL.** What each game is, why Common
  Thread's four rules exist and why "disjoint is not the same as distinguishable", the crossword's layout
  search and its mark-as-you-fill scoring, the picture round's held-back metadata, What year?'s lattice and
  its rotation, and the faults a one-day test cannot see — 730 distinct grids collapsing to 60 on a flat
  draw cap, and 271 blank days out of 730 when a pool was narrowed.
- **Settings and Account fill the stage** (Aug 2026). Both were a narrow column hard-LEFT inside the 800px
  stage — the settings cards stopped 180px short of a heading that spanned the whole width, and the signed-out
  sign-in form 340px short — so each page read as half-drawn on a laptop. `.settings` is now a grid that fills
  the stage and pairs the cards into two columns at ≥900px (`.set-wide` for the theme picker and `.danger`,
  which should never sit quietly beside something else, span both). Centring the column instead would have
  broken the left edge's alignment with the heading, which is why it isn't done that way. The signed-out
  account page splits into `.auth-split`: the form on the left and the three `.auth-perks` bullets — already
  written, previously stacked under it — in a column beside it at ≥820px, saying what an account is for at the
  moment a reader is deciding whether to make one.
- **Collection identity (Library)**: `COLL_THEME` (app.js) maps each collection id → `{ bg }`, a signature hue
  (`--coll-bg`, consumed by every theme's STATIC banner treatment in styles.css — the old drifting SVG motif system
  AND the gold `COLL_SEAL` emblem circles were both removed on request; banners carry only the hue wash + level
  numeral). The **default folio theme has a "bookplate" deco** (quiet hue wash + fine inner rule); coming-soon rows
  show a ghost of their hue (row opacity .62). Deck rows inside a collection take the collection hue as their left
  hairline (`--coll-bg` inherits from the `.collection` root; branches stay ochre). If a collection is ever recreated
  under a new id, update `COLL_THEME` (and `COLLECTION_ICON` — a collection with no row there falls through
  to a stack-of-cards mark, which is honest but says nothing about the subject).
- **Collections layout (`PAGES.decks`)** — a TAB BAR over five sections. The bar is Sep 2026, on
  request (`COLLECTION_TABS` / `collTab` / `collTabSections` / `collTabBarHTML`): **History · Geography ·
  Language · Other · Community · All**, defaulting to All, filtering the shelves that were already there
  rather than splitting them into pages. Psychology sits under **Other** (with Philosophy), Community
  holds your own decks and the shared ones below them, and the Planned fold is filtered with the rest —
  its empty admin drop target drawn only under All and History, the two tabs a dragged collection would
  land under. **A tab is a group of SECTIONS, not a new level in the tree**, so `COLLECTION_SECTIONS` and
  `COLLECTION_SECTION` are untouched and "put Psychology in Other" costs one row. **The choice is
  module-level, not in `S`** — a way of looking at one page, like the glossary record's sort — so a
  shared `#decks` link still opens the whole shelf. **A tab with nothing in it is still drawn** and says
  so in a sentence, unlike an empty SECTION: a tab that came and went as collections shipped would be a
  bar whose shape a reader cannot learn.
  Under it, five sections: **History**, **Geography**,
  **Languages**, then **Your decks**
  (the reader's own, and the way into the Studio), then **Shared decks** (Aug 2026, on request — the browse
  list that used to be `PAGES.community`, a page of its own; see `docs/community-decks.md` for the route, the
  redirect and the sortable table). The order is the point: the curated shelves first, by subject; then your
  own; then strangers'; one page.
  **THE SUBJECT SECTIONS ARE A DECLARED TABLE, NOT A LEVEL IN THE TREE** (`COLLECTION_SECTIONS` /
  `COLLECTION_SECTION` / `sectionOf`, just above `PAGES.decks`; Aug 2026, on request: "rename the Collections
  section to History. Put a section directly below it titled Geography, and put there a collection titled
  United States … Put the Languages section directly below the Geography section"). The first heading read
  **Collections** until then, which is what almost every collection is anyway, so anything the table does not
  name is History. Four things.
  **IT IS A TABLE FOR THE REASON `COLL_THEME` AND `COLLECTION_ICON` ARE**: a section is how this ONE PAGE is
  arranged, and making it a node would put every collection a level deeper in `S.active`, in `entryCardIds`,
  in the daily-study list and in every `#decks` link ever shared.
  **GEOGRAPHY *WAS* SUCH A NODE, and what shipped is that node PROMOTED rather than a third level added
  above it.** `geography` was a wrapper collection holding one deck, "The United States", holding the two
  leaves; the request asks for a SECTION called Geography and a COLLECTION called United States, so `geo-us`
  became the collection and its two decks now sit directly inside it. **The card-bearing ids are untouched**
  (`geo-us-states`, `geo-us-capitals`), so no reader's schedule moves — and a reader who had added the
  `geography` node loses that one entry silently and correctly, `activeEntryIds` already filtering an id that
  no longer resolves.
  **THE COMING-SOON FOLD SITS BELOW ALL THREE SUBJECT SECTIONS** (Aug 2026, on request; it was History's
  tail for a day, on the reasoning that every collection in it is a history one). That reading is
  defensible on the contents and wrong on the grammar: **a fold under one heading is a claim that what is
  in it belongs to that subject**, so the day a Geography or a Languages collection goes coming-soon it
  would land under History with nothing on the page to say so. Below all three it says what it actually is
  — everything still being written — and needs no second fold when that day comes. There is deliberately
  still ONE of it rather than a fold per section: a heading over an empty fold is the failure the
  empty-section rule below already refuses.
  **AN EMPTY SECTION IS DRAWN ONLY FOR HISTORY, AND ONLY FOR AN ADMIN** — that one has a drop target worth
  offering, where a "Geography" heading over nothing would advertise a section a drag cannot put anything
  into, the section coming from the table and never from where a row is dropped. History keeps the slot id
  **`collection-list-all`**, which five test files and the admin drag both name; Geography is
  `collection-list-geo`.
  **AND THE ADMIN DRAG STANDS DOWN ON A SECTIONED COLLECTION** (`valid()` in `wireLibraryDnd`): a collection
  named in `COLLECTION_SECTION` is neither dragged nor dropped onto, because that order decides a
  collection's place WITHIN its section and nothing there decides which section it is in — so such a drag
  could only ever appear to do nothing, the row being re-ordered in the tree and re-drawn exactly where it
  was. Reordering History, and moving a collection to and from Planned, are untouched.
  **THE SECTION IS CALLED "PLANNED"** (Aug 2026, on request; it was "Coming soon"), and so is the status
  pill on every row in it — the pill IS the section's marker on a row, so leaving it saying "Coming soon"
  under a "Planned" heading would be two names for one status. **The INTERNAL names are deliberately
  unchanged** — `isComingSoon`, `setNodeSoon`, the `soon` flag, `.collection-group-soon`, `.pill.soon`
  and `ADMIN_EDITS.tree.soon` — for the reason the Library-to-Collections rename kept its route: a label
  is what a reader sees and a class is what five test files and the admin drag name. So **"coming-soon"
  survives in this file and in the code as the name of the STATE**, and "Planned" is what is on screen.
  The phrase also survives elsewhere on purpose: the minigames' empty placards and the home page's
  "More games" tile say "Coming soon" about a different thing.
  **It is a `<details>` disclosure**
  (`.collection-group-soon`), **collapsed for everyone, admins included** (Aug 2026, on request — it used to open
  itself for an admin so the library's drag-and-drop had its drop targets reachable, which meant the one person who
  opens this page most often always met it expanded; an admin moving a collection between the groups opens the fold
  first, and the drop targets are reachable the moment it is open). This exists because
  the collections still being written far outnumber the finished ones (currently 6 to 1), and listing them flat made
  the Library read as empty.
  **THE DRAG HANDLE IS VISIBLE AT REST** (`.lib-grip`, Aug 2026, on a report that admin reordering had
  stopped working there). It had NOT: every row rendered its grip and carried `draggable="true"` the whole
  time — the grip sat at `opacity:0` until the row was hovered, so on a live collection there was nothing
  to reach for, while a **Planned** row showed its own at rest as a side effect of the overrides that
  compensate for that group's `filter:opacity(.5)`. So the one place it looked like a feature was the one
  place it was an accident. It is `.32` at rest and `.6` on hover now. **A discoverability fault reads
  exactly like a broken feature** — check whether the affordance is on the page before looking for the
  handler.
  **A COLLECTION STATES ITS SIZE ONCE, ON THE BAR** (Aug 2026, on request). Its banner carried a
  `.collection-count` behind the title AND a studied/total bar under it, so the row read "412 cards" beside
  "0 / 412 cards" — one number, said twice, in two registers. The count behind the title is gone and the bar
  is what says it. **The DECK rows inside keep theirs** (`.node-count`, next paragraph) precisely because
  they have no bar; a coming-soon collection keeps its pill for the same reason, that being the only thing
  its row has to say. Nothing else changed — `total` still feeds `deckProgMarkup` and the study guard.
  **…AND HOW MUCH OF THE DOWNLOAD IT IS** (`.node-size` / `cardBytes` / `nodeBytes` / `fmtDeckSize`, Aug
  2026, on request: "make it so that both Language decks and now also History decks mention the file size
  to download"). The Languages shelf had said what a deck would fetch since it shipped; the history shelf
  said nothing, so the same fact was in one place on one shelf and nowhere on the other. Five things.
  **THE TWO SHELVES ARE MEASURING DIFFERENT THINGS AND THE WORDING SAYS SO.** A language deck's figure is
  the SIZE OF THE FILE, read off disk by `.claude/build-lang-decks.js`, and its row reads "20.6 MB to
  download". A curated deck has no file of its own — its cards ship inside `data.js`, which every visitor
  downloads before flipping one — so the honest figure is what those cards WEIGH there, its row says the
  bytes alone, and its `title` says they are already downloaded. Writing "to download" on both would
  promise a fetch that happened before the reader saw the page.
  **ONE FORMATTER** (`fmtDeckSize`), so a language deck's megabytes and a curated deck's cannot come to be
  written two different ways on one page — `langDeckMB` is DELETED rather than left beside it. Under a
  megabyte it says kilobytes: "0.1 MB" over a 90 KB deck is a figure a reader cannot act on, and most of
  the curated decks are that size.
  **`TextEncoder`, NEVER `String.length`** — the corpus is full of accented and CJK characters and every
  one of them is undercounted by a code-unit count, which is a figure that is quietly wrong rather than
  visibly missing.
  **THE BYTES ARE CACHED PER CARD AND PER NODE, AND BUSTED WITH THE REST** (`uCacheBust`): the Collections
  page draws every leaf of every collection, so the alternative is `JSON.stringify` over a few megabytes
  per repaint — and an admin edit changes a card's bytes, so the two caches have to be declared BESIDE
  `uCacheBust` rather than near the code that fills them, that function running at boot from
  `applyAdminEdits`.
  **AND THE FIGURE WRAPS RATHER THAN HIDING ON A PHONE.** The first cut hid it below 430px, which takes
  the download size away from exactly the readers who most need it; `.node-title-row` carries
  `flex-wrap:wrap; row-gap:4px` in its base rule instead, so on a narrow row the size drops to a line of
  its own and is still there.
  **A DECK ROW SAYS HOW MANY CARDS IT HOLDS, not what years they cover** (`.node-count`, Aug 2026, on
  request). The banner one level up had said this all along, and the two rows disagreeing about what the
  small grey figure on the right MEANS is the whole reason to change it. What is dropped is the
  AUTO-DERIVED span (`nodeSpanText` → the earliest and latest datable card inside); a date an editor has set
  BY HAND on the node still shows, exactly as it does on a collection, since that is a fact about the deck
  rather than a summary of its contents. An empty deck says so, for the reason the banner does — "0 cards"
  reads as a figure that failed to load. `nodeSpanText` is still what the admin editor's date field reads.
  (The first group was labelled "All decks" until Aug 2026, which contradicted both the hierarchy —
  collection → deck → subdeck — and the page's own title.)
  **A coming-soon collection shows its name and the pill, and nothing else** (Aug 2026): it used to carry a
  `Level 1` badge over an XP bar reading `0 / 3 cards` — a progress meter towards a level in a collection
  that cannot be studied, and a figure that reads as a card count when the collection holds no cards. Six of
  the seven collections are coming-soon, so that was most of the Library saying nothing. With the meter gone
  the row's opacity fade no longer has to cover one, so it eases from `.62` to `.78` (at `.62`, over a tinted
  wash, the title and pill sat near the contrast floor). It also has to **cancel `.collection-title-row`'s 9px
  bottom margin** (Aug 2026, on request): that margin separates the title from the XP bar, and with no bar it
  was 9px of nothing inside a flex item the row centres as a whole, so the title rode ~4.5px above the middle
  of its own banner. A flex item establishes its own formatting context, so the margin cannot collapse away by
  itself — it has to be zeroed.
- **A collection wears a SUBJECT ICON and a PROGRESS BAR** (`COLLECTION_ICON` / `collectionIconMarkup(id)` /
  `deckProgMarkup(studied, total)`, Aug 2026, on request). Both replace something a level used to occupy:
  the icon stands where the per-script level numeral stood (`.coll-ic`, at the same 56px width, so nothing
  around it moved) and the bar where the XP bar did. It is one line-drawn mark per collection, chosen for the
  SUBJECT rather than for the script — a pagoda for China, a Doric column for Greece, a **laurel wreath** for
  Rome, a pyramid for Egypt, a torii for Japan, an onion dome for Russia, a lotus for India, a star for the
  United States, an aeroplane for the Second World War, a globe for World History, and a stack of cards for
  anything with no row (a community deck, or a collection added later). Three decisions are load-bearing.
  They are **decorative** (`aria-hidden`), because the collection is named in words directly beside them.
  (**Rome's arch became a LAUREL WREATH on request, Aug 2026.** Worth carrying from drawing it: an icon here
  renders at 34px on a banner and **28px on a deck row**, and a wreath is where that bites — the first cut gave
  each branch four leaves and read as a blob at 28px, so it is three a side, each leaf a teardrop whose base
  sits just OUTSIDE the branch arc with a visible gap. Mind that SVG y grows downward, so the bottom of the
  ring is at 90° and the wreath's opening at the top; the mirror of an angle about the vertical is `180 - a`,
  not `360 - a`, which is the slip that drew one branch and a stub of the other.)
  They take the **same gold the numeral did** rather than the collection's own hue: the banner wash IS that
  hue, and the gold is the one colour already proven to read over all ten of them in all eight themes, light
  and dark (the `body.hc` re-tone moved across with it). And `deckProgMarkup` **reuses the `.xp` markup**
  rather than `.prog` — every theme rule, the collection hue and `animateProgs` are already written against
  that shape, so swapping the head's words ("Studied" / "N / M cards") was the whole change and nothing else
  had to be restyled; `.deck-prog .xp-lvl` takes the quiet ink, a caption not being a level. The same pair
  is used by the community-deck rows and by the account page's "Collection progress" section, so the three
  places a collection's standing is shown cannot come to disagree about what they are showing.
- **…AND A READER CAN PUT THEIR OWN MARK ON ONE** (`ICON_SYMBOLS` / `ICON_PATH` / `ICON_NAME` /
  `symbolIconMarkup` / `entryIcon` / `setEntryIcon` / `entryIconMarkup` / `iconFromFile` / `ICON_MAX_BYTES`
  / `ICON_PX` / `openIconPicker` / `iconRowNote`; `.ip-grid` in styles.css. Aug 2026, on request: a symbol
  from a list the site provides, or a small PNG of their own.) Five decisions are load-bearing.
  **`COLLECTION_ICON` IS A TABLE OF KEYS NOW, NOT OF PATHS**, which is the whole feature: a picker needs
  names and a stored choice must be a short stable thing rather than a path, so `ICON_SYMBOLS` is an
  ordered `{k, n, d}` list — the 13 marks the collections already wore plus 20 drawn to sit beside them —
  and `ICON_PATH` / `ICON_NAME` are derived from it on load. **Nothing that DRAWS an icon changed shape**:
  `symbolIconMarkup` emits the same `.coll-ic` div, which is why five suites reading `.coll-ic svg` needed
  no change at all.
  **IT LIVES IN `S.deckGroups` BESIDE THE COLOUR, and that is what made it small.** That record is already
  keyed by ENTRY ID, already in `PROGRESS_FIELDS` and `RESET_KEEPS`, and already where a row's presentation
  is stored — so the icon syncs, survives a reset, and needs no new field, no migration and no schema
  block. A record holding only a `color` or an `icon` is a presentation override; one holding a `title` is
  a group the reader made.
  **A PNG IS RE-ENCODED AT 64px AND CAPPED, AND IS NOT DRAWN IN THE GOLD.** An uploaded file is read, drawn
  contained and centred into a 64×64 canvas and re-encoded, so what is stored is the site's own bytes
  rather than a stranger's file, bounded at `ICON_MAX_BYTES` (24 KB) whatever came in — which matters
  because this rides in the synced blob. **Every failure path resolves to `{ error: "<sentence>" }` rather
  than rejecting**, so the picker can say what went wrong. A symbol takes `currentColor` and therefore the
  collection gold; a PNG cannot, so it renders as an `<img>` and keeps its own colours.
  **IT IS NOT INHERITED DOWN THE TREE**, unlike the colour beside it. A colour cascades because it is a
  wash and reads as one family; an icon is an IDENTITY, and repeating it on nine subdeck rows would say
  each of them is the collection. `adIconKey` returns a mark only for a ROOT collection, a whole community
  deck, or a row the reader has given one — **asserted both ways**, since a mark on every row and a mark on
  none look equally deliberate from one side.
  **…AND A DECK DRAWN INSIDE A LANGUAGE GETS NONE EITHER** (Aug 2026, on request: "decks within language
  collections shouldn't get their own icons in the active decks section, only the collection itself
  should"). A language deck is a COMMUNITY deck, so it took the whole-deck card stack above and a reader
  who added seven levels of Spanish met one speech bubble over seven identical stacks — the same crowding
  the tree rule prevents, one store over. It is the curated side's own rule restated, where a deck inside a
  collection carries no icon; what differs is that a language's decks are its MEMBERS rather than its
  children in a tree, so **`adIconKey` takes the row's PARENT** and the whole-deck branch stands down under
  a `langctx:` one. A deck dragged OUT of its language sits at the top level with nothing above it to say
  what it is and keeps its stack, and an icon the reader set themselves still wins — this is the automatic
  mark, which `entryIconMarkup` reads as a fallback.
  **AND THE PICKER IS A SUB-SHEET THAT DOES NOT CLOSE ON A CHOICE.** Choosing re-marks the grid in place;
  only `[data-act="close"]` closes and repaints. The sheet's row sits directly after `colorRow` and before
  Remove — **`test-review-decks.js` pins BOTH sheet row lists EXACTLY**, so a row added here fails there
  until that assertion is updated, which is the point of pinning it.
- **THE ABOUT PAGE HANDS THE READER THE AI PROMPTS** (`AI_PROMPTS` / the `msn-ai` section / `CHIP.ai` /
  `.ai-pre`; the Studio's `#stAiHelp` / `.studio-aihint`. Aug 2026, on request). Three prompts — a whole
  deck as an importable `.folio-deck.json`, more cards for a deck already open, and vocabulary cards — each
  with a Copy button, over three steps saying what to do with what comes back. Four decisions.
  **THE PROMPTS DESCRIBE PATHS THAT WERE VERIFIED END TO END.** A prompt whose output the importer refuses
  is worse than no prompt, the reader having no way to tell their own file from the instructions — so the
  deck-file shape was derived from `uDeckImportText` / `uDeckSanitizeMeta` / `uCardSanitize` rather than
  from memory, and a file written to the published shape was imported through the real picker. **A check
  that imports one is the only thing that can see this go stale.**
  **PROMPT 3 ASKS FOR THE VOCABULARY PRESET'S FIVE FIELD NAMES, NOT FOR TEMPLATES AND CSS.** A card type is
  templates plus scoped CSS, and asking an AI for those is asking for markup a reader cannot check; asking
  for `Word | Word type | Translation | Conjugations | Notes` is asking for content the preset already
  knows how to render.
  **THE COPY BUTTON READS THE `<pre>`'s OWN `textContent`**, never `AI_PROMPTS`, so what is on screen and
  what lands on the clipboard cannot differ. **And the lines are wrapped at ~78 characters** because
  `.ai-pre` at 11.5px mono holds ~95 and hard breaks any longer re-wrap into rags.
  **THE STUDIO'S LINK IS `route("mission", { scrollTo: "aiPrompts" })`, NOT A FRAGMENT** — the About page's
  address stays `#mission`, so a shared link cannot land a reader mid-page on reload; `PAGES.mission` takes
  `params` and scrolls once, honouring `prefersReducedMotion()`.
- **THE DESKTOP'S TOP BAR NAMES ITS TABS AT ALL TIMES** (`.tab .tab-label`, Aug 2026, on request). They were
  icon-only, the name unfolding beside the icon on hover / keyboard focus and staying open on the page
  currently shown — so finding out what the four icons were meant pointing at each of them in turn, and the
  one name on screen belonged to the page the reader was already on, which is the one they least needed
  told. There are four destinations and the bar has room for all four (measured: 0px of overflow at 1280px,
  and every label rendering at its own `scrollWidth`), so the name is simply there. `.active` still says
  which page you are on, in the indigo and the underline. The collapse went with it — no `max-width`, no
  `opacity`, no width transition, so nothing animates — and **the `.ink` underline is unchanged**, since it
  was already positioned from `--ink-start` (padding + icon + the open label's margin) rather than from the
  animation. The phone's own rule still overrides `margin-inline-start` and still needs its extra `.tab` for
  specificity; the two bars now differ only in where the name sits relative to the icon (beside, against
  under). One cost, stated: an inactive label is `--ink-faint`, which is 3.25:1 and below the bar — it is one
  of the quiet tokens `body.hc` re-tones, exactly as the version line and the games heading are, and
  `test-a11y.js` covers it with no change of its own.
- **Mobile** (`@media max-width:640px`): page content is centred (`.page-head{text-align:center}`) and **the top
  bar is hidden outright** — see the next bullet.
- **The bottom tab bar (`.tabbar`, phones only — Aug 2026, on request).** The top bar held NINE icon-only
  controls in a scrolling strip at the top of a 390px screen — the four destinations plus theme, edit,
  account, settings and language — all out of the thumb's arc and none of them named. **Every destination
  now lives in the bottom bar** (home / map / account / settings — **not admin, not decks and not mission**,
  see below), and light-dark
  and the language picker moved to the **Settings page**, which leaves the top bar with nothing on it at
  all: `.topbar{display:none}` on a phone, and **`--bar-h` goes to 0px** there so `.globe-stage` and every
  other rule already written against it follows with no change of its own.
  It is **static markup in index.html** and reuses `.tab` + `data-route`, so
  `setActiveTab` and the boot-time `querySelectorAll(".tab")` wiring cover it with no new code — but note
  that same query runs ONCE over the static DOM, so a nav item added later still has to live in index.html.
  **Edit is NOT in this bar** — it left it the same week (Aug 2026, on request) for the top-right button
  described below: the editor is one person's tool and it was taking a seventh of a row six readers share.
  **Nor is COLLECTIONS** (`#decks`, Aug 2026, on request): on the PHONE's bar it is still absent, and it is
  reached from the home page's Collections button. **THE DESKTOP'S TOP BAR HAS IT BACK SINCE SEP 2026**, on
  request ("put a tab for the Collections page in the website's main menu bar, between Home and Library"):
  a SECOND route rather than a replacement, since the home page's button is untouched and still ships at
  every width. The phone's bar deliberately did not get one — five cells for five destinations, and the
  page swipe was narrowed to what that bar can reach, so a sixth tab there would put the two out of step
  again. Seven tabs do not fit the desktop bar between 641 and 900px, so that band tightens the padding
  and the tracking rather than dropping a name; `setActiveTab` also lights this tab on `#studio` and
  `#deck`, which are where one of your own decks is edited.
  **The page swipe stopped reaching it too** (Aug 2026, on request), for the same reason and a fortnight
  later: a gesture that lands a reader on a page the bar cannot reach leaves them somewhere with nothing lit
  to say where they are. The lip is the only route now.
  (The tab labelled **Library** is the books one, `#library`, which is a different page — see the Library
  bullet. Two pages called Library was exactly the confusion the rename settled.)
  **Nor About**, which left the same way a week later (Aug 2026, on request) for the `.home-about` line at the
  foot of the home page — a page read once, against a fifth of a row four readers share. `#mission` is
  therefore the second route with nothing marked in the bar.
  `applyMode` still hides `.tab-admin` with `querySelectorAll` rather than `querySelector`, because the
  entry point can exist more than once and the old form would have left a second copy live for every
  visitor. The bar is a **flex row of `flex:1 1 0` cells**, not a fixed column count, so a tab hidden or
  added closes the gap on its own. At that width the label
  may not wrap (a second line pushes the icons off centre), so it is `nowrap` + `text-overflow:ellipsis` at
  8.5px — `test-layout.js` asserts each label's rendered width against its own `scrollWidth`, so a longer
  name added later fails there rather than silently clipping.
  **The label rule is written `.tabbar .tab .tab-label`, and the descendant `.tab` is SPECIFICITY, not
  decoration** (Aug 2026, on a bug report): the top bar's own rule sets `margin-inline-start:8px`, and at
  two classes against three this rule
  lost to it whatever the source order — so the SELECTED tab, and only that one, drew its name 4px right
  of the icon it sits under. One tab misaligned out of five looks like a design, not a bug, which is why
  `test-layout.js` now measures every tab's icon centre against its label's, active included.
  Every tab is labelled here, under its icon; the TOP bar names its tabs too, beside theirs. Hidden while
  `body.grading`: the grade bar owns that edge, and a session is a place you finish rather than browse from.
  **The admin area's way in is `showAdminEditBtn(cardId)`** (`.admin-edit-fab`), a button on the page rather
  than a nav tab. Called with a card id from the study page — it opens THAT card in the editor — and with
  `null` from the home page, where it just opens the admin area; the plain variant carries `.aef-plain` and is
  **phone-only**, since above the breakpoint the top bar's Admin tab is still there and a second way in
  beside it is clutter. **The card variant says "Edit" and the plain one says "Admin"** (Aug 2026, when the
  page was renamed): the tab names the PLACE and this names what pressing it does to the card in front of
  you, and "Admin" on a study card would be the wrong half to state on the one control an editor presses a
  hundred times a day. On a phone both sit **top-right** (`right:12px`, `top:10px + safe-area-inset-top`);
  on a desktop the study card's copy stays bottom-left as it always has.
  Two things bit here. It is **admin-gated inside the function**, not by the caller — it used to be built
  unconditionally on every study card, so a signed-out reader got an Edit button that bounced them home.
  And its phone rules must live **BELOW** the base `.admin-edit-fab` rules in styles.css: media queries add
  no specificity, and the `bottom:calc(var(--tabbar-h) + 16px)` that used to sit up in the tab-bar block was
  silently overridden by the base `bottom:24px` further down and never applied at all.
  **Three custom properties keep everything anchored in step**: `--tabbar-h` (0 above the
  breakpoint, 58px below), `--timebar-h` (96px, 118px once the Atlas timeline goes to two rows) and
  `--bar-h` (60px, 0 below the breakpoint).
  `.globe-stage` and `.atlas-timebar` are each written ONCE against them rather than restated per
  breakpoint — which is how their old hard-coded `96px`/`118px` pair would have drifted apart the moment a
  third bar appeared. `.stage`, `#toast` and `.admin-edit-fab` take the same offset.
- **THE WHITEBOARD MARKER — a floating pen over a study card, a book's page and the Atlas globe**
  (`ensureWBTools` / `showWBTools` / `setupWhiteboard` / `wbMakeDraggable`; `.wb-tools` in styles.css).
  · **It can be turned off altogether** (**Settings → Study → Whiteboard marker**, `S.settings.marker`,
    default ON): **ONE predicate, `markerOn`, asked in the two places that bring the marker into
    existence** — `showWBTools`, which puts the panel on screen, and `setupWhiteboard`, which lays the ink
    canvas over the page — so a disabled marker costs a page neither the panel, the canvas nor the pointer
    listeners. It needs no third gate, the panel being the only way to put the pen DOWN. The guard in
    `setupWhiteboard` sits AFTER that function's own teardown, or a listener from the previous page would
    outlive it; and the switch calls `hideWBTools()` when thrown OFF, Settings not being a page that
    mounts the marker. Ink already drawn is kept — this decides whether the marker APPEARS.
  · **`WB.enabled` (the pen is down) and `WB.panelOpen` (the tools are showing) are TWO states.** The
    marker button only opens and closes the panel; what puts the pen down is **choosing a tool inside
    it**, and what puts it up is unselecting that tool. **Opening the tools selects NOTHING** (Aug 2026,
    on request) — `enabled` lays a canvas over the whole visible page, so a reader who opened the panel to
    reach Undo or a colour would find the card underneath already taken. **`wbSetEnabled` is the one place
    `enabled` changes**, because the Atlas owns its own cursor, hover and spin state and has to be told
    through `WB.onToggle`.
  · **It is DRAGGABLE anywhere on screen, can be THROWN, and SNAPS HOME** near the corner it started in —
    at which point the stored position is FORGOTTEN, since the default is a stylesheet corner that MOVES
    (18px normally, 108 while grading, 25 on the Atlas). The position is device-local
    (`localStorage["folio_wb_pos_v1"]`, clamped on every apply and on resize) and the element is
    positioned by `right`/`bottom`, never `left`/`top`.
  · **HOLDING the marker TOGGLES the pen**, restoring the tool and colour last drawn with, with a toast
    saying which way it went. **There is no Draw button: the three SIZE buttons ARE the pen.**
  · **Controls under the ink stay usable** — the canvas hit-tests underneath itself on pointerdown and
    hands the press to any real control it finds. **A z-index cannot fix this**: `.page` and `.cardwrap`
    both animate with a fill mode, so nothing inside them can paint above a sibling of the stage.
    `CTL_SEL` is real controls only; a **glossary term** (`TIP_SEL`, plus a community deck's `.uc-tts`) is
    a third kind of target decided at POINTERUP — a tap opens it, a drag through it draws.
  · **AND A CARD'S MAP WINDOW IS A FOURTH KIND: A SURFACE THAT OWNS ITS OWN DRAG** (`mapUnder`; Aug 2026,
    on a bug report: "on mobile, dragging to move that atlas window doesn't work, it only scrolls the whole
    page"). With the pen down the ink canvas covers the whole visible page and IS the pointer target, so a
    finger over a card's globe never reached that globe's own listeners — and in STYLUS MODE, where a
    finger is declared not to be a drawing tool, the whole gesture went to the hand-rolled page scroll
    instead. Reproduced through CDP touch input: the globe did not move a degree and the page went down
    130px. It cannot join `CTL_SEL`, which claims a press at pointerdown and activates it as a CLICK — a
    click is not a drag, and a drag is the whole of what that window is for — so the ink canvas keeps the
    pointer (it must, or the moves stop arriving) and forwards the DELTA through a small `pan` the map
    exposes for it. **It is scoped to a FINGER IN STYLUS MODE and nothing else, deliberately**: everywhere
    else the finger IS the pen, and taking drawing away from it would be a regression nobody asked for.
  · **A STYLUS TAKES THE PEN and fingers go back to scrolling** once one has been seen on this device
    (`WB.stylusSeen` / `WB.penOnly`, device-local). The scroll is **performed, not permitted** —
    `touch-action` is a property of the ELEMENT and cannot tell a pen from a finger, so the canvas keeps
    `touch-action:none` in every state and a finger's scroll is done by hand with momentum.
  · **ONE POINTER OWNS THE GESTURE, AND THE REST ARE NOT THIS STROKE** (`gid` / `gpen` / `dropGesture`,
    Aug 2026, on a bug report: "sometimes I find myself unable to draw lines for a few seconds … other
    times lines that should be straight end up crooked"). Every other pointer surface on the site records
    the id it started on — the marker's own drag handle, the page swipe, the colour picker, the gloss
    window — and **the drawing surface, where a second pointer is not merely possible but expected, did
    not**: a stylus rests a palm and a phone has two thumbs, and the four handlers share one `WB.drawing`,
    `WB.last` and `passScroll`, so a second contact walked into the first one's gesture. **Both reported
    symptoms are that walk seen from two sides.** A crooked line is the palm's coordinates sewn into the
    pen's stroke on alternate samples; not drawing is any other pointer's `pointerup` or `pointercancel`
    running `end()` and taking `WB.drawing` down mid-stroke — or, in stylus mode, a palm setting
    `passScroll`, whose test is the FIRST line of the move handler, so the pen scrolled the card it was
    marking. **The one preemption is a PEN over a finger**, because the palm usually lands first and a
    plain first-wins rule would leave a stylus reader unable to draw at all; nothing preempts a pen.
    **Capture cannot do this** — the canvas covers the visible page, so it is the hit target for every
    contact regardless. Guarded by `.claude/test-whiteboard.js`.
  **📖 `docs/whiteboard.md` — READ BEFORE CHANGING ANY OF IT.** The fling's sample-window arithmetic (a
  per-event velocity is wrong in both directions, and a synthetic drag is what exposes it), the snap-home
  probe and the transition that must be turned off to take it, the inline colour picker and why an
  `<input type="color">` was refused, the pass-through's `preventDefault` consequence, the hand-rolled
  scroll that replaced a `touch-action` rule which lost every stylus stroke, the per-page default corners,
  and the page-swipe and Atlas-sheet assertions that had drifted into the end of this bullet.
- **Reduced motion:** styles.css ends with a **global killswitch** — `@media (prefers-reduced-motion:reduce){ *,*::before,*::after
  { animation-duration:.001ms !important; animation-iteration-count:1 !important; transition-duration:.001ms !important; } }`.
  It covers every CSS animation and transition in the file (entrance animations land on their end state), so a new one usually
  needs no extra handling — only add a targeted override when the *end* state is wrong (e.g. `.lu-conf`/`.lu-burst` are
  `display:none`, the gold tile shine is `animation:none`). What it **cannot** reach is JS-driven motion, which must be gated
  by hand: `prefersReducedMotion()` (module-level, read live so the OS setting can change mid-session) covers `render()`'s
  smooth `scrollTo` and the home mini globe; inside the Atlas closure the same check is cached as `REDUCED`, gating
  `pulseChanges`, the era crossfade and `flyTo`'s duration. Globe drag inertia is deliberately left alone — it's the
  continuation of a direct gesture, not decorative motion.
- **FLIP — animating a layout change CSS cannot transition** (`flipMove` / `flipHeight`, beside
  `prefersReducedMotion`; Aug 2026, on two reports of hard cuts). CSS transitions a PROPERTY; it cannot
  transition a REFLOW. Move an element between two grid areas or reorder two siblings and it is simply in
  the new place on the next frame — which is what the grade bar's fold and the Timeline game's drag both
  looked like, and a hard cut does not read as fast, it reads as broken. `flipMove(els, mutate, opts)`
  measures where everything is, runs the mutation, and animates each element from its old paint position
  back to its new one; `flipHeight(el, mutate)` does the same for a container's content height, which is
  not an animatable value on its own. **`Element.animate`** — the Web Animations API, part of the platform,
  off the main thread, no dependency. Three deliberate choices: **scaling is opt-in** (`opts.scale`), since
  scaling a button squashes the text in it and a translate-only FLIP over an element whose SIZE is
  transitioned in CSS looks better than either alone; an element that has not moved is **skipped**, so
  calling it over a whole list costs nothing for the rows that stayed put; and `composite:"add"`, so it
  layers over a transform the element already has rather than replacing it. Both helpers gate on
  `prefersReducedMotion()` internally, so no caller has to. Used by `gbSetCompact` and by the Timeline
  game's drag and arrows — **reach for it rather than adding a transition that cannot fire.**
  **BOTH RETURN WHAT THEY CREATED** (`flipMove` an array of animations, `flipHeight` one or null; Aug 2026,
  on the grade bar's fold jam). They returned nothing, so a caller firing a second FLIP over a first had no
  way to cancel it and the two settled wherever they disagreed — which on the grade bar is a control stuck
  half folded. **A helper that starts an animation must hand it back**, or every caller that can be
  re-entered is one press away from that. An empty array is still an array, so a caller can cancel
  unconditionally.
- **THE ATLAS SHEET'S × SITS ON THE TITLE'S OWN LINE** (Aug 2026, on a bug report: "the cross to close
  them in the top right should be on the same horizontal line as the chevron and state title"). It was a
  sibling of `.cp-head`, absolutely positioned at the sheet's corner, which put it nine pixels above the
  name it belongs to and beyond the reveal chevron — three controls along one edge and none of them lined
  up. It is written INSIDE `.cp-titlerow` now and **stays `position:absolute` on the desktop**, where the
  panel runs the height of the stage and the corner is the right place for it: a positioned element is out
  of flow, so being in that row changes nothing there. The sheet sets it `position:static` and it becomes
  the row's last flex item, matching the chevron's 30px box rather than keeping its own 24px one — two
  controls of different sizes side by side read as two different kinds of thing. The row's 20px right
  margin goes with the absolute positioning, that margin having existed only to clear the corner button.
- **THE ATLAS PLACE PANEL'S BREAKPOINT IS DECLARED ONCE, IN CSS** (`--cp-sheet` on `.country-pop`, read
  back by `cpSheetMode()`; Aug 2026, on request that tablets get the phone's sheet). It was a
  `matchMedia("(max-width:720px)")` in app.js beside a `@media (max-width:720px)` in the stylesheet — one
  decision in two files, so widening it meant finding both, and getting one meant a window laid out as a
  sheet by CSS while JS went on treating it as the desktop panel (pager unwired, fold inert, height
  unfitted). **It is 1024px now** — the iPad's landscape width, so both orientations land on the sheet.
  A custom property rather than a geometric read-back: `getComputedStyle().top` on a positioned element
  hands back the USED value, so `top:auto` cannot be told from `top:16px` that way. **The panel also never
  scrolls sideways and draws no scrollbar** — `overflow-x:clip` (never the shorthand, never `hidden`)
  beside `min-width:0` on the grid items and `overflow-wrap:anywhere`, since a citation's visible text IS
  a URL and contains no break opportunity.
- **Atlas:** an orthographic **Canvas-2D** globe, full-bleed between the nav and a fixed bottom timeline
  (1000 BCE → present). Drag to rotate, wheel/pinch to zoom, plus on-screen `+`/`−` (`#gzIn`/`#gzOut`) and
  the keyboard, all through `zoomStep()`; `ZMIN 0.82 … ZMAX 10`, and zooming scales the disk radius
  (`R = baseR·zoom`). It opens centred on `S.settings.home` (**Settings → Home location**, default the
  Netherlands). The operational half:
  · **THE WHEEL LISTENER IS ON `window`, IN THE CAPTURE PHASE** (`onGlobeWheel`) and normalises
    `e.deltaMode` — a canvas-only listener never fires in hosts that route `wheel` to a scroll container,
    and a line/page-mode mouse barely zooms without the normalisation. It is **zoom-to-cursor**.
  · **LIMB SHADING AND THE HALO ARE DOM LAYERS, NEVER CANVAS GRADIENTS** (`#globeHalo` / `#globeShade`,
    sized by `updateLimbDom`, tinted by `paintLimbDom`) — a limb-sized gradient shifting per frame is what
    some hosts onion-skin into a page-wide gold bloom. `drawLimb` draws only the rim stroke.
  · **AN ERA USES ONE GEOMETRY SOURCE — NEVER A MIX**, or every shared border draws twice, slightly offset.
    A **merger-only** era stores just `groups` (present-day country → group name) and is rendered from
    `world.js` at full resolution via `synthGroups`; an era whose borders genuinely moved stores its own
    `geo`. Either way a past era keeps the present-day land, coast, lakes and rivers and changes **only the
    political borders on land**, through a per-ring edge mask — `'0'` inter-group (bold), `'2'` intra-group
    (light), `'1'` coast (skipped, `coastEdges()` draws it), `'3'` hidden.
  · **`c` MEANS TWO DIFFERENT THINGS**: an edge mask on an era territory or a UK subunit, a label centre
    `[lon,lat]` on a `world.js` country. Passing one as the other threw for every present-day selection.
  · **FRAME-COST RULES, all load-bearing**: coalesce input renders through `scheduleDraw`; borders are
    PRE-CHAINED (`_htRuns`), never re-walked per edge; cull before projecting; the wilderness pass
    COMPOSITES into an offscreen layer (`landLayer`) and **never `ctx.clip()`s over world-scale geometry**;
    motion frames skip the city layer, the selection coastline and `shadowBlur`; a selection paints as ONE
    batch (`paintFillGroups`) and is cached into `selCv`; big buffers are released; and the idle warm
    reschedules itself while anything is moving.
  · **CITY LABELS THIN OUT WITH ZOOM** (`CITY_SEP` / `CITY_CAP`): a pin whose name cannot be placed is
    dropped WHOLE, pin and all, and `CITIES` is already sorted by significance so the drops are the right
    ones. A pin and its label go together, so the whole layer waits for the settled frame.
  · **CLICKING DRILLS DOWN**: one tap the empire (territories sharing a `.mother`), two the territory, three
    the UK's constituent countries — two on a merger or present-day era, where there is one level less.
    `#map/<year>/<slug>` deep links are parsed at boot and on hashchange and **must keep working**.
  · **GAME MODE IS `PAGES.findit` → `PAGES.map(root, {game:true})`** — five date-seeded rounds on the real
    globe, with the search, legend, hover chip, city labels and the whole timebar gated off, since each of
    them is the answer.
  · **A GLOSSARY TERM CAN PUT ITSELF ON THE MAP** (`glossPlace` / `focusPlace`), joined at BUILD time by
    `.claude/fetch-place-coords.js` — a country is lit in the map's own gold with no info panel, a point
    gets a dot and its name and is drawn only while focused.
  · **Guarded by `test-atlas-places.js` and `test-layout.js`**; eras are built by
    `node .claude/build-era.js <year> [label]` and edited in **Admin → Timeline → Open globe editor**.
  **📖 `docs/atlas.md` — READ BEFORE TOUCHING THE RENDER PATH, AN ERA OR THE TIMELINE.** Why every rule
  above exists, the host quirks behind `forceComposite`, the non-linear rail, the popup's own sections and
  pager, the era build's topology-preserving simplify, its region supplement and overlap cleaning, and the
  faults that rendered perfectly while being wrong — a centroid test that silently deleted the Ottoman
  Empire from the 1900 map, gold coast fragments round inland seas, and the clip mask that made the older
  maps unusable.
- **COMMUNITY DECKS — the reader's own decks, and other people's** (the `COMMUNITY DECKS` block in
  app.js; `PAGES.studio` / `PAGES.deck`; the shared-decks section at the foot of the Collections page).
  Nine phases were built between July and Aug 2026: **Phase 0** the seams (`sanitizeHTML`, the separate
  `UCARDS` store, scoped glossary indexes, the shared card surface), **Phase 1** local decks and
  `.folio-deck.json` files, **Phase 2** publishing and moderation, **Phase 3** ratings and staff picks,
  **Phase 4** a deck's own glossary, then **subdecks**, a **direction** level below them, **both
  directions together**, and **card types**. The operational half:
  · **THE STORES ARE SEPARATE AND MUST STAY SO** — `UDECKS` / `UCARDS` / `UGLOSS`, read through
    `cardById(id)` / `isCommunityCard(id)`. Community content must NEVER enter `CARDS` / `CARD_BY_ID` /
    `TREE` / `window.GLOSSARY` / `ADMIN_EDITS`, and the daily GAMES draw from `ALL_CARD_IDS` (tree-derived),
    so unvetted cards can never reach them. Four existing behaviours force this and `test-community.js`
    asserts it.
  · **`uDeckNormalize` IS THE SINGLE INGEST CHOKE POINT** — everything entering the store passes through
    it, imports and IndexedDB reads alike, because that store is writable by anything on the origin. A
    record this build's own sanitizer wrote carries `srev` and is trusted (see `test-deck-trust.js`);
    nothing else ever is. **Bump `SANITIZE_REV` whenever a sanitizer or allowlist changes.**
  · **PERSISTENCE IS TWO IndexedDB STORES** (`folio-community` v2): `decks` holds a small record per deck
    with a note INDEX, `notes` one record per note. **Boot reads only the first**; content is warmed
    before it is needed (`uWarm` / `uWarmDeck`), never fetched at the moment `cardById` is called.
    A blocked IndexedDB falls back to `localStorage` in the old whole-record shape.
  · **CAPS:** `UDECK_MAX_CARDS` 85,000 (rows in the FILE, not cards to study) and `UDECK_MAX_BYTES` 208 MB,
    both **kept in step by hand** and both moved by a legitimate deck that will not fit. A file over either
    is REFUSED with both numbers named, never trimmed.
  · **IDS:** a card is `u_<deck8>_<n>`, a note's later cards `…~N` (template 0 keeps the bare id, so adding
    a reverse card never moves an existing schedule); an entry is `u:<deckId>`, a subdeck
    `u:<deckId>/<path>` with `::` between segments, a direction `…#<0-based template>`.
  · **SCHEMA BLOCKS, each optional and each degrading to a sentence rather than an error**: phase 2 (the
    `user_*` / `deck_*` tables), `6) RATINGS`, `8) CARD TYPES`, `9) GLOSSARY OFF`, `11) user_decks.color`.
  · **A PUBLISHED DECK'S CARDS ARE ROWS, NOT ONE BLOB** (`user_cards`) — that is the paywall seam — and
    every fetch of them is **PAGED** (`SUPA_PAGE`), PostgREST capping a response at 1,000 rows silently.
  · **INSTALLS SYNC PER ACCOUNT** (`deck_installs` + `communitySyncInstalls`), so a deck added on the phone
    reaches the laptop; the decks themselves are device-local and reader-specific (`DECK_OWN_KEY`).
  · **Guarded by `test-community.js`, `test-publish.js`, `test-deck-glossary.js`, `test-card-types.js`,
    `test-deck-lazy.js`, `test-deck-trust.js`, `test-subdecks.js` and `.claude/decks/check-nesting.js`.**
  **📖 `docs/community-decks.md` — READ BEFORE TOUCHING ANY OF IT.** Why each phase is shaped this way,
  what every guard was written for, and the faults that shipped silently — a published deck whose cards
  went up EMPTY because the publish payload used `CARD_FIELDS` on a typed card, a deleted deck that stayed
  on the shared shelf its author could no longer reach, a subdeck that dealt one direction for thirty days,
  and the several counts that read healthy while the thing they counted was wrong.
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
    before this change opens on the editor's default tab rather than one that no longer exists.
- **THE EDIT PAGE IS THE ADMIN PAGE (Aug 2026, on request).** The top bar's tab and the route's `PAGE_META`
  title say **Admin**; the route, the hash (`#admin`), `adminState` and every internal name are untouched, so
  nothing shared or stored moves. **The per-card button KEEPS saying "Edit"** — `showAdminEditBtn(cardId)`
  labels itself "Edit" with a card and "Admin" without one, because the two are answering different
  questions: the tab names the PLACE, and the button on a study card names what pressing it does to the card
  in front of you. Prose in this file and in app.js says "Admin → Feedback" / "Admin → Timeline" to match;
  the per-item Edit actions (a glossary term's pencil, a deck's Edit in the Studio) are unchanged, being the
  same kind of label as the card button.
- **Admin → Quotes: the home page's daily quote, seen, edited and PLANNED (Aug 2026, on request).**
  `adminRenderQuotes`, a fifth tab taking over the admin area the way Feedback, Timeline and the Dashboard
  do (`.quotes-mode`, the same hide list). The data layer is the `SHIPPED_QUOTES` + overlay design described
  under the Home page bullet; three things about the TAB are decisions rather than plumbing.
  · **It lists in RUNNING ORDER, not array order, and dates every row.** The order is solved from the pool
    (no author two days running, none more than twice a week), so where a quote sits in the source says
    nothing about when a reader will meet it — and when they will meet it is exactly what an editor adding
    a fifth Confucius line needs to know. Today's is marked; the rest carry "tomorrow", "in N days" and the
    date. That is the whole of what "plan" means here, and it is a question nothing else on the site answers.
  · **The form covers the English AND the original-language block** (`o`: lang, text, speaker, source),
    which is what a reader actually flips the quote over to see. An `o` is written only when the language
    and the words are both filled in — an empty one would make the home page offer a flip that turns the
    quote into nothing. The nine-language chrome translations are not editable here: they are `chrome.exact`
    rows managed by `.claude/add-lang.js`, and the site is English-only behind `MULTILANG` anyway.
  · **"Copy as JS" hands the whole pool back as the `SHIPPED_QUOTES` literal**, for pasting into app.js when
    a batch is settled. It is the bake path this tab has instead of `autoSaveFiles`, which writes data files
    and must never be pointed at app.js.
  **A TAB THAT TAKES OVER THE ADMIN AREA MUST LIFT THE ≤860px PANEL CAP, and TWO of the four had not**
  (Aug 2026, on a bug report). `.admin-list-items` is capped at `max-height:300px` on a phone, which is right
  for the Cards and Glossary lists — they are one column of a two-column layout — and traps a whole page in a
  300px scroll box for a tab that owns the screen: the Quotes tab's edit form filled the box, its Save button
  sat at the fold, the running order beneath was cut off mid-row and the rest of the screen was left empty.
  Timeline and Feedback were in that rule's exception list from the day they were built; the **Dashboard and
  Quotes arrived later and were not**, which is the whole of the bug. All FIVE are listed now (Artefacts
  joined in Aug 2026) — **keep the list in step with the `*-mode` classes `adminRefresh()` sets**, or the next
  tab added will look broken the same way. Guarded by `test-layout.js`, which reads the cap back and checks the
  pane is not clipped, and by `test-artefacts.js` for the Artefacts tab's own copy of it.
  **AND A TAB NEEDS A COLOUR, for the same reason and with the same failure mode** (Aug 2026, on a bug
  report). `.admin-tab` on its own is transparent in the inherited ink, so **Quotes and Artefacts — the two
  that arrived after the colours were placed — read as DISABLED beside five that are lit**, which is what a
  tab with no rule of its own looks like rather than what it is. Both hues are placed rather than picked:
  the original four took blue (cards), green (glossary), amber (timeline) and red (feedback) with purple
  spanning both columns above them (dashboard), so what was free was TEAL and MAGENTA — Quotes takes the
  teal (`#118e96`) and Artefacts the magenta (`#a8478f`), which also puts the two tabs that write back into
  app.js's own literals at opposite ends of the wheel. **Every `data-atab` needs a pair of rules** (the rest
  state and `.active`); adding a tab and not adding them is invisible in code review and obvious on screen.
- **Admin → Artefacts: the pool a chest draws from (Aug 2026, on request).** `adminRenderArtefacts`, a sixth
  tab taking over the admin area the way the Dashboard, Quotes, Timeline and Feedback do (`artefacts-mode`,
  the same hide list, and the panel-cap exception above). It follows the Quotes tab exactly — `artefacts.js`
  is the shipped literal and `ADMIN_EDITS.artefacts` an overlay over it, so an edit made on a phone reaches
  every reader through `content_overrides` with no deploy, and **Copy as JS** hands the whole file back
  (`serializeArtefacts`) for baking in. Three things differ from Quotes and all three matter.
  · **The key is the artefact's `id`, not its text**, because the reader's own inventory is keyed by that id.
    So the id field is editable only while an artefact is NEW and locked once it exists — a renamed id takes
    the artefact out of every collection that holds it, silently.
  · **The description carries a live word/sentence counter** against the house bar (five sentences, 200 words
    ±10%), so prose drifting long is visible as it is written rather than at review time.
  · **A picture is never saved uncredited** — the same rule `add-card.js`, `add-glossary.js` and the editors'
    media gate enforce, and for the same reason: the editors save on every keystroke, so a URL pasted in and
    forgotten about would otherwise ship credited to nobody.
  · **THE FORM SHOWS THE READER'S PLATE, LIVE** (Aug 2026, on request), drawn by `artefactPlateHTML` — the
    reader's own builder, not a second rendering of the same fields — and repainted on every keystroke.
    Three things hold it up. It is built from the **FORM, never from the store**, so it shows the edit in
    progress rather than the last thing saved, which is the difference between a preview and a receipt; the
    description goes through `sanitizeHTML` on the way in exactly as `artefactSanitize` would, so a typo in
    a tag looks here the way it will look to a reader. **`wireArtefactPlate` runs on every repaint**, or the
    citations render as an unnumbered list under blank superscripts. And the listeners are bound with
    **`change` as well as `input`**, because the rarity is a `<select>` — the one field that would silently
    stop updating on an `input`-only preview.
  · **The citation bar is a refusal here too** — a save under `ARTEFACT_SRC_TARGET`, or with a citation that
    carries no URL, is turned away with a reason, and a counter beside the sources box reports both the
    count and how many markers the description carries.
  `serializeArtefacts` writes the file's whole head comment out rather than preserving what is on disk: this
  is the only copy of it once the file has been round-tripped, and a serializer that drops the documentation
  is how a file stops explaining itself. It is wired into `autoSaveFiles`, `adminExport` (including its
  download fallback) and `folioSave.files`, each gated on the overlay actually holding something.
- **Admin → Dashboard: Folio in numbers (Aug 2026, on request).** The editor's FIRST tab and the one a fresh
  session opens on (`adminState.tab` defaults to `"dashboard"`; a session interrupted mid-edit still comes back
  to the card it was on — `restoreAdminUI` exists because auto-save can live-reload the page between
  keystrokes, and losing that would be a worse regression than gaining this). It takes over the admin area the
  way Feedback and Timeline do (`.dash-mode`, the same hide list). **Its tab is PURPLE and spans both columns
  of `.admin-tabs`** (Aug 2026, on request) — it is the only one of the five that describes the whole site
  rather than a kind of content, so it sits above the four as a header rather than beside them as a fifth
  peer. `grid-column:1 / -1`, not `span 2`, so it stays full width if the grid ever gains a third column.
  **Two halves, and the split is not cosmetic.** `dashContentStats()` is derived from the shipped data files
  and the admin overlay on top of them, so it is exact, instant and works offline — it is the same data the
  site is rendering. `dashLoadRemote()` has to ASK, and what it can ask is bounded by the RLS in
  `.claude/supabase-schema.sql`: `profiles` is readable by any signed-in user and the published-deck tables are
  public, but **`progress` is readable only by its owner and their accepted friends — an admin included**. So
  there is no honest site-wide "cards studied" figure and **none is invented**; the panel says so in prose
  rather than leaving a reader to read a missing number as a zero. **If you add a figure here, check the policy
  before the query.**
  Counting uses PostgREST's `Prefer: count=exact`, whose total arrives in **Content-Range** — which `supaFetch`
  now parses into `r.count`. Two things about that header: it is not a CORS-safelisted response header, so it
  is readable only because Supabase names it in `Access-Control-Expose-Headers` (a proxy in front of it might
  not, which is why `count()` also asks for up to `DASH_CAP` ids and falls back to counting them, flagged with
  a `+` if it filled the page — an honest floor beats a row of em dashes that looks like a broken panel); and
  **a mock must send the expose header too**, or every figure comes back null and the panel reports a
  connection failure that is really a CORS one.
  **A THIRD HALF SINCE AUG 2026 — THE DEV FIGURES** (`dashDelivery` / `fmtBytes`, on request: "list some
  dev-side statistics such as server file size, connection speeds, where users are connecting from"). Folio
  has no server to ask, so every figure here is MEASURED on the page rather than asserted: the browser's own
  **Resource Timing** gives each request's `encodedBodySize` (what was sent over the wire), its
  `transferSize` (**0** for a file the cache or the service worker already had) and its duration, so the
  card reports what a reader on this machine really paid rather than what the files weigh on disk, and the
  eight biggest same-origin files are listed with a row reading **cached** where nothing was fetched. It is
  same-origin only — a font from Google is not Folio's weight — and `navigator.connection` supplies the
  connection class, downlink and round trip **where it exists**, which is Chromium and not Safari or
  Firefox, so those tiles read an em dash rather than a guess. **WHERE READERS CONNECT FROM IS NOT
  COLLECTED AND IS NOT GUESSED AT**, which is the People card's own rule about RLS applied to a question no
  policy could answer either way: the only geography on the page is THIS machine's `Intl` time zone and
  browser language, both labelled as such and neither sent anywhere.
- **Admin → Themes: who wears what (Aug 2026, on request: "add another tab for Themes, showing their usage
  stats etc.").** `adminRenderThemes` / `themeLoadUsage`, a seventh tab taking the admin area over the way
  the Dashboard, Quotes, Artefacts, Timeline and Feedback do (`themes-mode`, the same hide list, the same
  ≤860px panel-cap exception). Three things.
  **THE QUESTION THE DATABASE CAN ANSWER IS WHO WEARS ONE, and that is why the column is on `profiles`.**
  A theme is now both a collectible and how an account presents itself, and only the second is readable:
  `profiles.theme` is public to any signed-in user, so an editor can count it, where a reader's own
  `S.themes` register lives in `progress` and RLS keeps it private — **so there is no figure here for how
  many people have UNLOCKED a theme without wearing it, and the panel says so rather than leaving a gap to
  be read as a zero.** One `count=exact` request per theme plus a total, which is seven tiny requests
  against one large one and needs no paging.
  **A DATABASE WITHOUT SECTION 14 SAYS SO AND NAMES THE BLOCK**, exactly as the publish path does for the
  deck-colour column: PostgREST answers 400/404 on a column that does not exist, which the loader turns into
  a `missing` flag rather than an error, and every account simply presents itself in the default meanwhile.
  **AND ITS TAB COLOUR IS OLIVE** (`#6d8f1f`), the one quarter of the wheel the other six leave empty
  (purple, blue, green, teal, magenta, amber, red) — **every `data-atab` needs a pair of rules**, a resting
  one and an `.active` one, or the tab renders in the inherited ink and reads as DISABLED beside six that
  are lit, which is what happened to Quotes and Artefacts when they arrived.
- **ONE DECK PER CARD (Aug 2026, on request).** The card editor's deck picker was checkboxes — a card could be
  cross-listed into any number of decks with one set of scheduling. Nothing shipped ever used it (all 119 cards
  sit in exactly one deck) and it made "which deck is this card in" a question with no single answer, which the
  editor header, the study bar and the home review row all had to hedge around. It is **radios** now, and
  `setCardMembership` is passed a list of one; the collapsible header reads `Deck: <name>` rather than
  `Appears in N decks`. **The data model still holds a SET, deliberately** — `membership` deltas, `cardLeaves`
  and `serializeCardData` are all written against one, and narrowing them would be a rewrite of the overlay
  format to enforce in storage what the editor now enforces at the point of choice. A card that somehow holds
  two decks still renders honestly (every one of its decks is marked, with a note saying so) and the next
  choice made collapses it to one. The bulk **"Move to deck…"** in the selection bar already wrote a single
  leaf, so it needed no change.
- **The account page's identity actions** (Aug 2026, on request): **Change password sits beside Sign out**
  inside the profile card (`.acct-idacts`), not a section lower among the photo controls — the two act on the
  same thing — and the "Progress synced to your account" line moved directly under them (`.acct-syncnote`),
  with the password panel following it so it opens where the button is. `.acct-tools` survives for the
  Remove-photo button and renders only when there is a photo.
  **THE FOUR BUTTONS SIT IN A 2×2 BLOCK ON A WIDE SCREEN** (Aug 2026, on request): in one row they ran the
  width of the card and squeezed the name and picture beside them into a column of two or three words.
  `grid-template-columns:repeat(2, minmax(0, 1fr))` with `flex:none`, so the block takes only what four
  buttons need and the identity beside it takes the rest. **The ≤640px rule sets `display:flex` back
  explicitly** — a phone stacks them full width, and a media query adds no specificity, so the grid would
  otherwise carry straight through.

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
- **Eras are BCE and CE, and NEVER BC or AD** (Aug 2026, on request: "ensure the use of BCE and CE always … across
  the whole website"). It reaches everywhere a reader can see one — a card's question, its background and its date
  line, a glossary description and its date line, an artefact, an Atlas country description, **and the text a
  picture carries** (`image.title` / `alt` / `desc`), which is where most of them were: those strings come from
  Wikimedia Commons and arrive saying "c. 2700 BC", and a caption is as much the site as a sentence is. The
  numeral LEADS, so "AD 301" is "301 CE" and not "CE 301". Enforced by **rule 4 of
  `node .claude/check-style.js`** — which, unlike the other three, also runs over `artefacts.js` and
  `countries.js` — so run it after any content batch. **Two things are deliberately out of scope and must stay
  out**: a **citation** (a published title is the author's, and `--fix` renamed six real works the one time that
  guard was missing — the mask is the whole reason rule 4 can be automatic at all), and a **book in the Library**,
  whose text is somebody's published translation and is transcribed rather than edited. The DOTTED forms
  (`B.C.` / `A.D.`) are report-only for a third reason as well as those two: fixing one means deciding whether
  the closing period was the abbreviation's or the sentence's, which is a judgement by eye. And the rule is
  anchored to a digit or to a unit word (`century`, `millennium`, `cal`, `cen.`) rather than matching a bare
  `\bAD\b` — "96.AD.258" is the Getty's accession number for a votive head and "A. D. Godley" translated the
  Histories, and a blanket sweep renames both.
- **Literature titles are italicised** (`<i>Bamboo Annals</i>`) — except in plain-text fields (`answerText`) and in
  glossary alias/title keys, which must stay unstyled or matching breaks. Person-vs-book names (Zhuangzi, Mencius,
  Laozi…) are italicised only when clearly the text — "the <i>Zhuangzi</i>" — never the person.
- **A WORD MENTIONED AS A WORD is quoted** (Aug 2026, on request, after a reader met "given a Latin name for
  handy"). Whenever the prose glosses a name — translating it, or naming the sense a coiner chose — the sense
  goes in **single quotes**: "a Latin word for 'handy' or 'skilful'", "its name means 'hollow rock'", "the Greek
  for 'old stone'". Single, not double, because that is what the deck already used where it got this right, and
  because a card's fields are stored in double-quoted JS strings. Where the FOREIGN word itself is given, it is
  italicised and its sense quoted: "the Greek <i>epi</i>, meaning 'upon'". The same holds for a term named as a
  term rather than used — "specialists now hedge the word 'cremation'", "he proposed the word 'Minoan'".
  What is NOT quoted: an explanation rather than a translation ("in everyday speech it means a single cold
  spell"), and a definition of a thing rather than a gloss of a name ("the Maasai word for the sisal plant that
  grows there"). Fixed across 14 abstracts, 2 questions, 3 question extras and 5 glossary terms on 2026-08-03;
  **the ENGLISH only**, since a quotation mark is a per-language convention (French takes « », German „ ", CJK
  「 」) and rendering the English mark in nine languages would be a typographic error nine times over. When
  translations resume, each language quotes in its own.
- **Measurements are METRIC FIRST, with the imperial equivalent in parentheses** — "over 2,400 kilometres
  (1,500 miles)". This is the ONE documented exception to the no-parentheses rule below; the ban stands for
  everything else. Round the conversion to the source figure's own precision (1,500 miles → 2,400 km, never
  2,414), leave the footnote marker on the metric figure the source actually states, and leave scientific units
  bare — "940 cubic centimetres (57 cubic inches)" is worse, not better.
  **THE WORD LIMITS DO NOT COUNT A CONVERSION** (Aug 2026, on request). A question is held to 20–34 words and
  an abstract to 270–330, and four measurements cost about twelve words, so without this the rule above could
  not be applied to the cards already near the ceiling. It is enforced rather than trusted: `add-card.js` and
  `add-questions.js` strip a parenthetical containing a digit and an imperial unit (`IMPERIAL_PAREN`) before
  counting (the leading space with it, or the stripped parenthetical leaves a stray token behind), so the
  **prose** limits stay exactly as binding as they were: the finished corpus has the SAME 4 over-length
  abstracts and 1 out-of-range question it had before the pass, against 11 and 4 counting the conversions.
  The exemption is for the parentheses, not for the sentence around them.
  **THE PASS IS COMPLETE** (`docs/units-plan.md`): 486 conversions across all 119 cards and all 414 glossary
  terms, and **nothing metric is left bare**. Two sweeps say so and BOTH are needed: one for a digit before
  a unit, and one for a **spelled-out** number before a unit (`about four miles inland`, `a third of a
  metre down`) — the second found the corpus's second imperial-first figure, which the first is blind to. That plan also holds the conventions settled once and to be
  followed rather than re-argued — feet-and-inches under 4 m, sq mi keeping the source's significant figures,
  a range taking ONE parenthetical for both ends ("between 400 and 700 m (1,300 to 2,300 feet)"), and
  °C → °F carrying the sign. **ENGLISH ONLY**, like every content change since the `MULTILANG` gate: the
  translations keep their bare metric figures until translations resume.
- Enforcement: `node .claude/check-style.js` reports violations; `--fix` applies the safe ones (it masks the proper-name
  exceptions, skips plain-text fields and the glossary alias sections). Run it after bulk content additions. **Card text
  edits invalidate baked narration hashes — re-run `build-tts.js` for all four narrators after a style pass.**
  It reads FOUR files now: rules 1–3 over `data.js` + `glossary.js` as before, and **rule 4 (BCE/CE) over those
  plus `artefacts.js` and `countries.js`**, which are prose a reader reads and were the last two files still
  saying "1500 BC". Two masks are what make `--fix` safe to run at all and neither may be dropped: the
  CITATIONS (three spellings now — a card's `"sources":[…]`, glossary.js's whole `GLOSSARY_SOURCES` block, and
  artefacts.js's unquoted `sources: [`), and any **URL**, since a Commons file really is called
  `…c_2700_BC_(10465349433).jpg` and renaming it in an href breaks the picture.
  **THE CENTURY RULE HAS A DELIBERATE GAP AND IT SHOULD STAY** (Aug 2026): `ORD_RE`'s lookahead is `\s*`, so
  it does not see the ATTRIBUTIVE hyphenated form — "nineteenth-century city", "second-millennium BCE".
  Measured when it was found: **32 hyphenated century NUMERALS against 2 hyphenated WORDS**, so the house
  convention plainly covers the shape and the rule simply cannot reach it. **Widening it to `[\s-]*` was
  tried and reverted**, because the cases it then finds are not all violations and `--fix` would damage two
  of them: `Eighth-century_revival` is a GLOSSARY KEY and the term's own name, and "A Seventeenth-Century
  manual of arms" sits inside an image credit quoting the scan's own book title — neither of which the
  citation mask covers. It wants a pass that masks glossary keys and quoted titles first, which is a job of
  its own rather than a character class. The reasoning is in the script's own header too.

**FOLIO IS A HISTORY SITE, NOT AN ARCHAEOLOGY SITE (Aug 2026, on request).** A card is about the PAST it
names, not about the people who dug it up: the excavation is how we know, not what the reader came for.
So the **question must be answerable from the past, not from the dig** (`gr-008`'s opening clue was
"Schliemann tried to arrange a dig at ___ and never came to terms with the owners", which a reader could
answer knowing nothing about Bronze Age Crete); **at most about two of an abstract's ten sentences may be
discovery history**, and only where the discovery is itself the fact worth knowing or the dating is
contested; and **the date line carries the dates of the THING, not of the dig** — `Found`, `Excavated`,
`First dug`, `Named` and `Published` belong only on a card whose subject IS a modern act (`wh-006` the
three-age system, `gr-007` Arthur Evans), and `Built` / `In use` / `Occupied` / `Destroyed` everywhere else.
What does not change is the apparatus: saying less about the dig is not saying less about how we know, and
the 5-source bar stands. **24 of the 119 cards shipped in Aug 2026 are flagged**, measured rather than guessed (a card
scores on how many of its ten sentences carry a year between 1800 and 2029, whether its question carries
one, and whether its date line uses a discovery label) — `docs/history-focus-plan.md` holds the measure, the
table and the six rewrite batches. Re-run the measure after each batch; and read the card before rewriting
it, because on a few of them the modern years ARE the subject.

**…AND NOT A HISTORIOGRAPHY SITE EITHER (Aug 2026, on request).** The rule above was written about the
people who DUG the past up; it binds equally on the people who ARGUE about it. A card is about its answer
term's history — not about the modern debate over that history — and the two go wrong in the same way, by
teaching a reader the state of a scholarly literature instead of the past that literature is about. Two
parts, and the first is absolute:
- **A QUESTION MAY NEVER NAME A RESEARCHER OR SCHOLAR — IN A HISTORY COLLECTION.** **`psych` is
  EXCLUDED from this rule outright (on request, Aug 2026), and so is `phil`**, because in psychology and
  philosophy the literature IS the subject matter: a finding is a study, an argument carries its author's
  name, and both disciplines are mostly "modern" by this rule's own measure, so applying it would make
  most of those two collections unwriteable. Their questions may name anybody, and `card-focus.js`'s
  flags on a `ps-` or `ph-` card are noise rather than findings — do NOT clear them one at a time through
  `EXEMPT`; the exclusion is collection-wide, is recorded here and in each plan, and **since `ps-002` the
  script itself carries it** (`RULE1_EXCLUDED`), listing such cards under their own heading rather than as
  work to do. **The historiography
  cap below still binds on both.** Everywhere else the rule is absolute: not "Hans van Wees calls…", not "Lambert argues
  that…", not "Evans noted in a footnote…". A clue built on who said a thing is answerable by someone who
  knows the modern literature and nothing whatever about Greece, which is the exact inversion of what a
  study card is for. **Naming the THEORY is fine and often better** — "the older view that they were
  artificial creations", "the middle-class hoplite army is a myth" — so the fix is almost always to keep
  the claim and drop the name, which costs a card nothing and usually buys back words. **An ANCIENT author
  is not a researcher**: Herodotus, Pausanias and Strabo are sources FOR the past and are welcome in a
  question. The line is the modern arguer, not the ancient witness.
- **HISTORIOGRAPHY MAY NOT BE THE PRIMARY FOCUS OF AN ABSTRACT.** Briefly touching on it is fine and often
  necessary — a contested date, a term whose meaning was overturned, a dissent worth hedging with — but a
  background that runs *Scholar A argues, Scholar B answers, A's reviewer is unpersuaded* for six of its ten
  sentences is a literature review with a Greek word at the top of it. The bar is **at most 3 of 10
  sentences**, which is where the corpus itself puts the break (206 of 269 cards score 0 or 1).
- **THE ONE EXEMPTION is a card whose ANSWER TERM is itself a modern theory, debate, method or scholar** —
  `gr-007` Arthur Evans, `wh-006` the three-age system, `wh-064` the Toba catastrophe theory. There the
  modern argument IS the subject and neither part applies. Keep that list short; it is `EXEMPT` in the
  measure, and every entry carries its justification.

**`node .claude/card-focus.js` is the measure** (`--prefix=gr-`, `--all`, `--card=<id>`), and it detects a
researcher from the card's OWN source list, parsing the author positions of each citation rather than
sweeping it for capitalised words — the first cut did the latter and flagged 187 of 269 cards, because
place names, period names and ancient authors all leak out of a citation's TITLE. **It is a proxy, not a
verdict: read the card before rewriting it.** **45 of the 269 cards shipped by Aug 2026 need revision — 44
on the question rule and 12 majority-historiography** — and `docs/history-focus-plan.md` holds the verified
table and the five batches. The worst offenders are `gr-174`–`gr-180`, written in the session that produced
this rule; that a whole run of cards can drift this way without anything complaining is precisely why the
measure is committed rather than done by eye.

**A NEW CARD, GLOSSARY TERM OR ARTEFACT SHIPS WITH A PICTURE, OR WITH A STATED REASON WHY NOT (Aug 2026,
on request).** A picture is part of a content item the way its citations are, and the picture pass that put
an illustration on 771 glossary terms, 360 cards and 99 of the 100 artefacts was a BATCH over the whole
corpus — which is the right shape for 836 terms at once and the wrong shape for the one term written this
morning. A batch goes out of date the next day; a rule does not. So the three content tools now LOOK, on
their own: `add-card.js`, `add-glossary.js` and `add-artefacts.js` each call `.claude/suggest-image.js` at
the end of a successful add and print the candidates, their licences, their sizes and their Commons pages.
· **THEY SUGGEST AND NEVER INSTALL, and that is not caution for its own sake.** The candidate list is a
  name match, and a name match is confidently wrong in exactly the way this site must never be — see the
  `Jason_E._Lewis` case in `pick-images.js`'s own header. **Look at the picture before using it**, and
  watch for the three faults the pass kept finding: the right name and the wrong person, an unlabelled
  plaster CAST standing in for the object, and a modern reproduction sold as the ancient thing.
· **THE BAR IS THE PIPELINE'S BAR** — public domain, CC BY or CC BY-SA (never NC or ND, which Commons does
  not host and which would forbid selling access to the site), an attributable author where the licence
  needs one, ~900px on the long side, no watermark. `suggest-image.js` applies it, so anything it offers
  could actually ship.
· **A PICTURE THAT IS NOT FOUND IS RECORDED, not silently skipped.** Where nothing openable exists — 65
  glossary terms and one artefact today, most of them abstract concepts and living scholars — say so in the
  commit message rather than leaving the gap looking like an oversight. `--no-image` skips the lookup for a
  batch run with no network.
· **AND WHEN `upload.wikimedia.org` RATE-LIMITS, `Special:FilePath` STILL SERVES THE FILE** (Aug 2026).
  A long session that has looked at a dozen pictures starts getting a 2,255-byte **429** from
  `upload.wikimedia.org` on every request, and it does not clear with backoff — fifteen minutes of waiting
  bought nothing. `https://commons.wikimedia.org/wiki/Special:FilePath/<FILE>?width=900` answers 200 with
  the image, and so does `commons.wikimedia.org/w/thumb.php?f=<FILE>&width=900`; the ordinary file
  DESCRIPTION page keeps working throughout too, which is where the licence and author have to be read
  from when the `api.php` endpoint is also limited. **Use those to LOOK at a candidate**; the `src` written
  into the card stays the normal `/thumb/…/1920px-…` URL, since the limit is this container's and not a
  reader's. The rule this protects is the one that matters: **look at the picture before using it**, and a
  host that will not serve it is a reason to keep trying or to ship without one, never to install unseen.
· It writes the same fields the pass writes: a card and a term take `{ src, title, desc, credit, alt }`, an
  artefact `{ src, credit, alt }`, and **`credit` is required in all three** — a picture on Folio is always
  somebody else's file, and `add-card.js`, `add-glossary.js`, `add-artefacts.js`, `add-images.js` and the
  editors' media gate all refuse an uncredited one.

**A GEOGRAPHY CARD'S PICTURE FOLLOWS TWO RULES (Sep 2026, on request).** "Cards about regions like
states, provinces, etc., should feature a picture of the most famous or significant natural
wonder/landmark. Cards about cities should feature a picture of the city — NOT a particular building or
small place within the city, but the city zoomed out, as a skyline or aerial view."
· **WHICH LANDMARK IS AN EDITORIAL JUDGEMENT AND NO METADATA MAKES IT.** `pageimages` for `Arizona`
  returns the state FLAG; the batch therefore NAMES the subject (`{"subject": "Grand Canyon"}`) and the
  fetcher takes that article's picture. The judgement stays with the author, the licence and the size are
  read off Commons — the division `fetch-images.js` argues for.
· **A CITY'S SUBJECT IS ESTABLISHED BY CATEGORY, NEVER BY A SEARCH.** Searching Commons for
  `"Phoenix, Arizona" skyline` returned a photograph of NEW YORK — CC BY-SA, 1,724px, a description
  carrying a view word — which would have shipped on the card asking for Arizona's capital. A candidate
  must be IN one of the city's own view categories (or on its article) AND carry the city's name AND have
  a title that reads as a wide view.
· **AND EVERY PICTURE IS LOOKED AT**, through `.claude/contact-sheet.py`, which tiles a fetched batch so
  fifty of them are one image to read. That pass found four wrong or poor pictures in the first 38 —
  a false-colour Landsat scene for Chesapeake Bay, the VISITOR CENTRE for White Sands, a monochrome USGS
  survey photograph for Mammoth Cave, and a hooded figure in steam for Hot Springs — none of which any
  automatic test would have caught. The first three are now refused by name.
· **THE UNITED STATES AND CHINA COLLECTIONS ARE COMPLETE: 158 of 158**, every picture read on a sheet.
  The measure of how far the search alone gets is that **41 of the 158 had to be pinned by name** after
  review, and the rejects were not near misses: a MAP of the Mammoth Cave system, the Berlin
  Olympiastadion for Olympia, a Nissan Skyline GT-R for Montpelier, Dover Castle in England for Dover
  in Delaware, and Springfield MASSACHUSETTS for the capital of Illinois. **A city name is ambiguous far
  more often than it looks**, so a capital's search carries its state and the result is still read.
· **ALL THREE GEOGRAPHY COLLECTIONS ARE COMPLETE: 421 of 421** (100 United States, 58 China, 263
  World), every picture read on a sheet before it was applied. The World collection's 227 countries
  were the editorial half — which landmark stands for Bhutan, for Chad, for Niue — and the answer for
  each is NAMED in the batch rather than searched for, because `pageimages` for a country returns its
  flag.
· **WHAT THE SHEET CAUGHT, over 421 cards, is one taxonomy and it is worth knowing before the next
  pass.** Roughly one in eight had to be replaced, and almost none was a near miss:
  **a picture from ORBIT** (Landsat, MODIS, Sentinel, an STS or ISS frame, NASA, Apollo 17's whole
  Earth for the Great Blue Hole) — a diagram of a place rather than a view of it;
  **a MAP** wearing no such word in its name (`Txu-…`/`pclmaps` map-library scans for Inner Mongolia
  and Qinghai, a nautical chart for Kiritimati, locator `.png`s for Santorini, Issyk-Kul, Baa Atoll
  and the Stockholm archipelago);
  **a MONTAGE or COLLAGE** (Asmara, Paramaribo, Torres del Paine) and a 7:1 wiki **banner**;
  **the RIGHT NAME IN THE WRONG PLACE** — Ostrog Monastery in Montenegro filed against Kosovo's
  Gračanica, the Berlin Olympiastadion for Olympia, Dover Castle in England for Dover in Delaware,
  Springfield Massachusetts for the capital of Illinois, and a photograph of New York for Phoenix;
  and **a thing that is not the place at all** — a necklace for Meroë, a signboard for Dzanga-Sangha,
  a window sticker reading "you can see Kuwait City", the interior tuned mass damper for Taipei 101,
  and a portrait of a man in sunglasses for Anguilla.
  The first three families are now refused by `SPACEBORNE` / `SURVEY` / `NOTAPHOTO`; **the last two
  cannot be, and that is the whole argument for the sheet.**
**A NEW CARD SHIPS WITH A GLOSSARY ENTRY FOR ITS OWN ANSWER TERM, IN THE SAME COMMIT (Aug 2026, on
request).** Not afterwards and not in a later batch: a card's answer is exactly the word its siblings will
use in their own backgrounds, and a term with no entry auto-links to nothing. Write it **cited, at the
`GLOSS_SRC_TARGET` bar**, while the card's research is still open — that is how the glossary pass stayed at
401/401 through sixty-eight new terms — and to the GLOSSARY's rules rather than the card's: three sentences,
impartial, deck-agnostic, self-contained, never written as a companion to the card that prompted it. Where
the answer is a phrase the glossary would never head, give the entry the head noun and add the card's exact
answer as an **alias**. **THE BACKFILL IS COMPLETE: every shipped card has such an entry** (42 of 119 did when the rule was written),
and the glossary stands at **477 terms, every one at the bar**. `docs/card-glossary-pairing.md` holds the
record of the ten batches and what each turned up — the rule itself is what remains in force. Worth knowing
before writing the next one: give the NARROWER thing its own key and let the broader one take the short
alias (`Clovis_point` as a key, `Clovis` as an alias of `Clovis_culture`), since `buildGlossIndex` sorts
surfaces longest-first; and **ask whether a one-word term is also an everyday word** before adding it —
`Boreal` needed `caseSensitive: true` or four country and region terms saying "boreal forest" would have
linked to a Holocene chronozone.
**AND CHECK WHETHER THE TERM ALREADY EXISTS BEFORE RUNNING `add-glossary.js`, WHICH OVERWRITES IN
SILENCE** (Aug 2026, on `wh-294`). The collections share a vocabulary: `Phoenician_alphabet` had been
written for Ancient Greece long before World History reached it, and the helper answered a fresh entry
with **`updated glossary term`** rather than `added` — one word, in a line nobody reads twice — having
replaced a four-source description, its tags and its whole citation list with a two-source one. Nothing
failed: the audits still reported 1,595 terms all at the bar, because a REPLACED term is still cited.
What was lost was the part the older entry had and the newer did not, namely that whether a script with
no vowel signs should be called an alphabet at all is disputed. **The pairing rule is satisfied by a term
that already exists**, so the check is one command before the work rather than a repair after it, and the
repair is `git checkout` on `glossary.js` and `glossary-extra.js` — which is only clean because nothing
else in the batch had touched them.

The deck and glossary are being regrown one entry at a time, each researched from **Wikipedia and
academic sources** — accuracy is non-negotiable, never invent dates, names, or definitions. The kept
template entries are the canonical format: card `cnh-001` in `.claude/backup/data.js` (it is NOT in the
shipped `data.js` — the China deck was trimmed to nothing and regrown as `wh-`/`gr-`), glossary term `Sima_Qian` in
`glossary.js`. The full pre-trim originals are backed up in `.claude/backup/`.

**The China collection was SET ASIDE in July 2026 and was OPENED again in Aug 2026, on request** — the
`placeholder: true` on its tree node is gone, so `availableCardIdSet()` (app.js) now lets its forty
`cnh-` cards into the daily review, the games, the card of the day and study deep links, and the Library
lists it under Collections. **Its empty decks need no change**: `isComingSoon` is `!!node.placeholder ||
subtreeCardIds(node).length === 0`, so a deck with no cards is coming-soon on its own account and
becomes visible the day one lands in it.

**THE EIGHTEEN PLANNED COLLECTIONS — the index (Aug 2026).** Every one is grown the same way: **"generate
the next <collection> card" means take the lowest id not yet in `data.js`, read its topic and deck from
that collection's plan, research it, and add it** with `node .claude/add-card.js <card.json> <deckId>`.
**Always pass the deck id** — without one `add-card.js` falls back to the first leaf in the whole tree,
which is `cn-myth`, in China. The bullets below each collection give the reasoning; this table is the
lookup.

| collection | id | prefix | plan | decks / leaves | state |
|---|---|---|---|---|---|
| World History | `col-8` | `wh-` | `docs/world-history-card-plan.md` | 8 / 39 | 89 cards, scattered — next id is an early GAP |
| Ancient Greece | `col-13` | `gr-` | `docs/greece-card-plan.md` | 6 / 19 | 180 cards, contiguous |
| Ancient Rome | `col-40` | `rm-` | `docs/rome-card-plan.md` | 7 / 25 | empty |
| United States | `col-41` | `us-` | `docs/us-card-plan.md` | 9 / 33 | empty |
| Russia | `col-42` | `ru-` | `docs/russia-card-plan.md` | 9 / 29 | empty |
| India | `col-43` | `in-` | `docs/india-card-plan.md` | 9 / 31 | empty |
| China | `china` | `cnh-` | `docs/china-card-plan.md` | 7 / 39 | 40 cards — `cn-myth` complete, and the collection is now open to study |
| Ancient Egypt | `egypt` | `eg-` | `docs/egypt-card-plan.md` | 9 / 26 | empty |
| The Second World War | `ww2` | `ww2-` | `docs/ww2-card-plan.md` | 8 / 30 | empty |
| Japan | `japan` | `jp-` | `docs/japan-card-plan.md` | 9 / 34 | empty |
| Psychology | `psych` | `ps-` | `docs/psychology-card-plan.md` | 9 / 38 | 50 cards — not a history collection |
| Philosophy | `phil` | `ph-` | `docs/philosophy-card-plan.md` | 9 / 38 | empty — not a history collection |
| Biology | `bio` | `bio-` | `docs/biology-card-plan.md` | 9 / 46 | empty — not a history collection |
| Dinosaurs | `dino` | `dino-` | `docs/dinosaurs-card-plan.md` | 9 / 43 | empty — not a history collection |
| Korea | `korea` | `ko-` | `docs/korea-card-plan.md` | 9 / 43 | empty |
| Geography | `geo-us` | `geo-` | `docs/geography-card-plan.md` | 2 / 2 | 5 cards — and it is NOT a 1000-card plan, see below |
| World | `geo-world` | `gw-` | `docs/world-geography-card-plan.md` | 2 / 2 | 410 cards (227 countries, 183 capitals) — 470 rather than 1000, and sorted by POPULATION, see below |
| China (Geography) | `geo-china` | `gc-` | `docs/china-geography-card-plan.md` | 2 / 2 | **COMPLETE, 58 of 58** — 58 rather than 1000, and sorted by POPULATION, see below |

The next id for any of them (substitute the prefix):

    node -e "global.window={};require('./data.js');const h=new Set(window.CARD_DATA.map(c=>c.id));for(let i=1;i<=1000;i++){const id='jp-'+String(i).padStart(3,'0');if(!h.has(id)){console.log(id);break}}"

**Two traps when looking a number up in a plan.** A deck heading is `## Title — \`id\`` OR
`### Title — \`id\`` — the shallower level is a **flat deck**, one that is itself a leaf (`gr-iron`,
`ru-federation`, `cn-myth`), so reading only `###` misses it. And **`docs/world-history-card-plan.md`
carries an APPENDIX** — the 2026-08-04 renumbering record, under its own `#`-level heading — which
lists 109 ids in the OLD numbering; the running order stops there, so a lookup that runs past
`# The 2026-08-04 renumbering` will find the wrong entry.

**`node .claude/test-card-plans.js` checks all of this** (245 assertions, no browser, no dependencies):
every deck a plan names exists in that collection, every leaf in `data.js` is named by its plan, each
running order covers the numbers its own collection declares with no gaps or duplicate ids or repeated
topics, **every SHIPPED card's number appears in its plan's running order and — wherever a plan line
names the ANSWER rather than a subject to research, i.e. the three geography plans — the card sitting at
that number IS the city the plan put there** (both added Sep 2026, after eight capitals shipped at other
cities' ids, one of them at a number its plan deliberately leaves unused, with nothing complaining
because every card was correct in itself), and CLAUDE.md names each plan, carries a working next-id command and states each prefix in the
index table (the command is asserted ONCE as a template and the prefix per collection — the rule is
shape plus prefix, and eleven copies of the shape guarded nothing the pair does not). **Re-run it after editing a plan, after changing a tree in
`data.js`, and after adding a collection** — every fault it catches is silent, and the worst of them
(a plan naming a deck id the tree hasn't got) files cards into China without throwing.

**Every collection is grown the same way and the plan is the authority.** Take the lowest id not yet
in `data.js`, read its topic and deck from that collection's plan, research it, and add it with
`node .claude/add-card.js <card.json> <deckId>` — **always passing the deck id**, since without one
`add-card.js` falls back to the first leaf in the whole tree, which is `cn-myth`, in China.
**Do not create leaf decks as topics demand**: a topic with nowhere to go means the plan needs
changing, in the same commit, and saying so. A plan line is a **subject to research, not a fact to
assert**, and not always the finished answer term — rename, split or drop a line when the research
says so, in the same commit as the card.

**EACH PLAN CARRIES ITS OWN SCOPE ARGUMENT AND YOU MUST READ IT BEFORE WRITING FOR THAT COLLECTION.**
Every `docs/*-card-plan.md` has the same sections — *What this collection is about*, *Six decisions
this plan forced on the tree*, *History, not … — and the pulls*, *Dates, names and spellings*,
*Sourcing* — and they are where the judgement lives. Getting one wrong makes a claim without noticing:
that India before 1947 is the SUBCONTINENT and after it the Republic; that Rus' is the shared
inheritance of three countries and is never "early Russia"; that the United States collection covers
the territory that BECAME the United States and opens with Native America as a deck rather than a
prologue; that Egypt runs to the Arab conquest because Egyptian religion outlives Egyptian
independence; that Japan's annexations are carded in the Ainu and Ryukyuan decks rather than in
somebody else's expansion.

**Four rules hold across all eleven.** **No state's account of its own actions is repeated as
established fact** — in any direction. **A contested figure is given as a RANGE with whose it is
named**, never the highest or lowest stated flat. **Modern scholars are capped at two per collection**
and are spent only where an account itself became an event. And **the glossary term ships with the
card, cited at the bar** — see the pairing rule above; a collection's own vocabulary starts from
nothing, and a short surface that is also an ordinary English word needs `GLOSSARY_CASESENSITIVE` or a
narrower head word.

**📖 `docs/china-card-findings.md` — READ BEFORE WRITING A `cnh-` CARD.** China is the one collection
whose per-card findings have no batch log to live in: which sources are reachable from this sandbox
(the French sinology on Persée, the Chinese-language journals, the out-of-copyright reference shelf),
how to read a CJK PDF, how to search an OCR'd volume whose romanisation nobody now uses, and the
traps that have already cost a card. The other ten keep theirs in their own plan and in
`docs/citation-plan.md` / `docs/glossary-citation-plan.md`.

**ENGLISH ONLY (Aug 2026, on request): a new card or glossary term does NOT need its nine translations.**
The site ships in English while the work is on making the English as good as it can be, so put the effort
that went into nine translations into the English instead — the sourcing, the sentence rhythm, the
question pool. `add-card.js`, `add-glossary.js` **and `add-questions.js`** each carry a
`REQUIRE_TRANSLATIONS = false` beside their `I18N_LANGS`, which is the content-pipeline half of
`MULTILANG` in app.js; flip all three back and new entries are held to all nine again. (`add-questions.js`
gained its copy in Aug 2026, having demanded nine translations that no longer exist since 2026-08-08 — so
it could only be run with `--partial`, a flag documented as being for a deliberate staged batch rather
than for the only shape the corpus can now have. **A gate lifted in one tool has to be lifted in every
tool the same content passes through**, or the pipeline refuses work the rule says is finished.) **Translations that ARE supplied are still written and still checked**
(question length, footnote-marker parity) — the requirement is lifted, the machinery is not, and the
existing 105 cards and 333 terms keep the translations they have. What is written below about the nine
languages is the rule to resume, not the rule in force.

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
- `answerDate` (the date line) — **the dates worth memorising beside the answer term, and nothing else**
  (Aug 2026, on request). It is a KEY/VALUE LIST, not a paragraph: alternating `dt-k` / `dt-v` spans
  inside ONE `<div class="dt">`, which is a two-column grid, so the labels align down the left and each
  date sits beside the word naming what it is. A `<span class="dt-v dt-sub">` line continues under a
  value with no label of its own — the place under a birth date.
  ```html
  <div class="dt"><span class="dt-k">Born</span><span class="dt-v">12 February 1809</span><span class="dt-v dt-sub">LaRue County, Kentucky</span><span class="dt-k">Died</span><span class="dt-v">15 April 1865</span></div>
  ```
  **The label names WHAT the date is** — `Era`, `Lived`, `In use`, `Occupied`, `Found`, `Named`,
  `Coined`, `Painted`, `Born`, `Died`, `World Heritage` — and NOT the card's category, which is what the
  old one-word key said (`Site`, `Species`, `Industry`) above a paragraph explaining the term all over
  again. That paragraph is what this replaced: the background is where prose belongs, and a date line a
  reader has to read is one they will not memorise.
  **If the card has no obvious date, leave the field `""`.** An empty section is the right answer there —
  it collapses to nothing (`.av-row:empty`), and a sentence apologising for the absence is not a date.
  Write it with **`node .claude/set-date-line.js <batch.json>`** rather than by hand (`[[label, value], …]`
  per card; the script builds the markup, so the shape cannot drift card to card). Both it and
  `add-card.js` hold the field to `.claude/date-line.js`: at most 4 rows, a label of at most 16
  characters, a value of at most 64 characters and 10 words, a number in every labelled row, and no
  sentence. **Deep spans are written in the compact notation** — `115,000 – 11,700 BP`, `c. 4.2 – 2 Mya`,
  `c. 2.6 Mya – 9700 BCE` — all of which `cardYears` parses, which is what keeps the deck in
  chronological order (see the "Deep time" bullet).
  **A CENTURY IS NOT A DATE `cardYears` CAN READ**, and a date line whose ONLY dates are centuries
  therefore yields no sort year at all — the card falls to 0, "timeless", which on a deck running in
  BCE puts it after every other card (Aug 2026, caught by `test-date-line.js` on `rm-047`, whose two
  rows both read "7th century BCE"). Write the span the century MEANS — `c. 700 – 600 BCE` — which
  asserts no precision the source has not got, since that interval IS the 7th century; a second row
  may then say "7th century" in words. **The fix is in the DATE LINE, not in `cardYears`**: 52 of the
  447 shipped date lines carry a century form beside a plain year, so teaching that function to read
  centuries would silently move their sort years too.
  **AND AN ERA MARKER ONLY REACHES THE YEAR IT FOLLOWS**, so a row naming two alternative years —
  `1188 or 1177 BCE` — is read as 1188 **CE** beside 1177 BCE (Aug 2026, on `wh-268`). Write the era
  on both: `1188 BCE or 1177 BCE`. The sort year is usually unaffected, which is why nothing reports
  it: `cardStartYear` takes the MINIMUM, so the stray positive hides there and surfaces only in
  `cardSpanYears`, where it runs a Bronze Age deck's coverage to the 12th century CE.
  **AND A `c.` INSIDE A RANGE BREAKS THE ERA'S LEFTWARD CARRY** (Aug 2026, on `wh-284`). A range writes
  the era once and lets it carry back to the first number — `668 – 631 BCE` yields −668 and −631 — but
  `668 – c. 631 BCE` yields only **−631**, the approximation mark standing between the two. The failure
  is the opposite way round from the one above and LOUDER, since the lost year is usually the EARLIER
  one and `cardStartYear` takes the minimum: the card silently sorts by whatever else its date line
  happens to name. Write the era twice (`668 BCE – c. 631 BCE`) or move the `c.` to the front
  (`c. 668 – 631 BCE`) — both parse. **Read the sort year back after writing a date line**, which is
  two lines of Node against `cardYears` and is the only thing that can see this.
- `abstract` (the background) — **exactly 10 sentences and about 300 words** (keep within 270–330, which
  `add-card.js` has ENFORCED since 2026-08-06 — it never measured the abstract before, which is how seven
  cards reached 331–342 unremarked; they are recorded in the changelog and left as they are), as two
  blocks of 5 split by ` <br><br> `: sentences 1–5 give the general meaning/context, 6–10 the meaning in this
  card's question. Information-heavy and precise, at the 17-year-old register set out above. **The only `<b>` bold is the answer term, at its first mention
  opening the background**; use `<i>` for titles (and foreign terms). **No parenthetical asides** —
  never put information between parentheses. **No glossary links** — plain text only (`cnh-001`
  still uses the old `ttip`/`data-k` links and bolded facts; new cards omit both).
  **COVER THE WHOLE ANSWER TERM, not the part the sources talk about most** (Aug 2026, on request).
  A background is the card's account of its term, so every region, period, group or strand the term
  contains has to be in it, in something like proportion. No single aspect may stand in for the whole
  — and the failure is quiet, because a card can be accurate in every sentence and still be a card
  about something narrower than its own answer. **The test is to read the ten sentences back asking
  which part of the term each one serves**; if a part the term names gets nothing, the card is not
  finished, whatever its word count. **`gr-001` is the standing example**: *Aegean Bronze Age* is
  three traditions by definition — Minoan, Cycladic and Helladic — and a first rewrite gave seven
  sentences to Crete, two to the islands and one to the mainland, because Crete is where the palaces,
  the writing and the best sources are. It was reported by a reader and rebalanced to 7 / 5 / 4 the
  same day. **Where the evidence really is lopsided, say so in the card rather than letting the
  proportions say it silently** — an imbalance the reader can see explained is history; one they
  cannot is a gap. The pull is strongest exactly where one part of a term is better served by open
  scholarship than the others, so this bites hardest on the terms most worth getting right.
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
  checked. **AND A URL THAT OPENS SAYS NOTHING ABOUT THE NAME IN FRONT OF IT.** N4 recorded the
  whole-citation form of this fault; the commoner form is one level down and is easy to commit without
  noticing — a search result prints `Wani PD`, a Chicago note wants a given name, and the expansion that
  FEELS right gets written. It was Pinaki, not Pooja. **`node .claude/check-cite-authors.js [--prefix=]
  [--all]`** checks every PMC-backed citation's author names against the Europe PMC record and reports
  only a mismatch where BOTH sides carry a full given name — an initial, or a record holding only
  initials, is not a finding, since Europe PMC often stores `B Cavalazzi` for a byline printing Barbara.
  Run over the whole corpus in Aug 2026 it found **24 wrong given names across 18 works, every one on a
  citation whose URL resolved perfectly**: Hayden Schill written as Hannah, Samantha Gray as Steven, Wren
  Gould as William, Ceri Shipton as Chris, Amy Way as Andrew, Piotr Fedurek as Pawel, Jessica Bates as
  Jennifer. **Verify a finding on the PMC page before rewriting** — the record can be wrong too — and note
  it tries every author sharing a surname, since a paper with two Hamiltons on it is not a finding.
  **AND THE TOOLS CHECK THAT A CITATION ENDS IN A URL, NEVER THAT THE URL OPENS** — so an
  archive.org identifier or a DOI written from MEMORY ships as a 404 and nothing anywhere reports it
  (`cnh-006` shipped one for an hour: `sacredbooksofchi27conf` for `sacredbooksofchi0027unse`). Curl
  every citation URL of a new card before committing it; a 302 is a DOI resolving and is fine, a 404
  is a source the reader cannot check. **A CURL IS NOT A CITATION CHECK, EITHER — IT CHECKS THE URL AND
  NOTHING ELSE.** Four SEP citations shipped in Aug 2026 with a wrong edition, a wrong title and a
  missing co-author, on four cards and four glossary terms, every URL returning 200 the whole time: the
  edition had been composed from the "substantive revision" date on the page instead of read, and
  `plato.stanford.edu/entries/<slug>/` shows a browse label rather than the entry's real title. **The
  Stanford Encyclopedia states its own preferred citation** at
  `plato.stanford.edu/cgi-bin/encyclopedia/archinfo.cgi?entry=<slug>` — authors, exact title, archive
  edition, editors and the stable `archives/<ed>/entries/<slug>/` URL to cite instead of the live one —
  and the four guesses were wrong four different ways ("Fall 2021" against Spring 2023, "Spring 2019"
  against Summer 2024, "Innateness: Historical Controversies" against "The Historical Controversies
  Surrounding Innateness", Mandelbaum alone against Mandelbaum and Millière). **Read a source's own
  metadata page before citing it**; this is N4's fabricated-author finding in a second coat, and the
  archive URL is also what pins the wording a marker points at. **Every source must be referenced by at least one marker** — a citation
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
- `difficulty` — **REQUIRED for every new card: an integer 1–5 rating how well known the ANSWER TERM is to
  the general population.** **1** household name (Stone Age, Homer, Sparta, Neanderthal); **2** generally
  familiar, an ordinary secondary education reaches it (Neolithic, Knossos, phalanx, Lascaux); **3** known
  to the interested (Linear B, hoplite, helots); **4** specialist (Gravettian, megaron, bucchero); **5**
  highly obscure, named in the scholarship and almost nowhere else (`qa-si-re-u`, Nichoria, Iguvine Tables).
  **It rates the WORD, not the card** — how hard the prose is, how subtle the point and how tricky the cloze
  are separate questions, and conflating them is the one way the scale stops meaning anything: a subtle card
  about `Homer` is still a 1 and a beautifully clear one about `qa-si-re-u` is still a 5, because a reader
  who has never met a word cannot be eased into recognising it by prose. It decides only whether the daily
  minigames may deal the term (see the card-difficulty bullet under "How the app is wired"); **every card is
  studiable at every rating**, and most cards worth writing are 3s, 4s and 5s. `add-card.js` REFUSES a card
  without one rather than defaulting — the safe default is invisible, since the card simply never appears in
  a game and nothing says so. Batch-rate older cards with `.claude/add-card-difficulty.js`.
- `undatable` — **OPTIONAL, and only where the answer term does not happen at a time**: `true` says the
  term names a process, a condition, a material, a category, a modern method or a physical feature, so the
  **Timeline** game must not ask a reader to place it. Ask whether the year the deck would sort the card at
  is a date the term is CONVENTIONALLY GIVEN — `human evolution` sorts at the ape split 8 Mya, which is one
  end of the span the term names rather than when it happened, and `Tiber` has no date at all. **A long
  process is not automatically undatable**: `domestication` and the `Neolithic Revolution` each sort at the
  onset a reader would give them and stay in the game. It is not required, is never guessed at, and applies
  only to a card the games can reach (rated at or below the bar); the deck's own chronological order, the
  other games and studying are all unaffected. See the "SOME TERMS DO NOT HAPPEN AT A TIME" bullet under
  "How the app is wired", and flag an older card with `.claude/mark-undatable.js`.
- `answer` / `answerText` — **the answer term NEVER carries an article** (Aug 2026, on request): it is
  `polis`, `Iliad`, `rhapsode`, `cist grave`, not "the polis" or "a cist grave". What the reader is being
  asked to recall is the term; "the" is a fact about the sentence around it, so it belongs to the QUESTION
  (`... ran together in the <span class="blank">_____</span>, of which ...`) and to the BACKGROUND
  (`The <b>polis</b> is ...`, with the article **outside** the `<b>`, never `<b>The polis</b>`). Keeping it
  out is also what keeps the answer matching its glossary key and the way a reader would say it aloud.
  **53 cards were fixed on 2026-08-06** — 52 with "the" and one with "a" — and `add-card.js` refuses a new
  one, checking `answer`, `answerText` and the opening `<b>` of the abstract. Two things that pass came out
  of that sweep and are the shape to watch for: a question whose surrounding words ALREADY supply the
  article reads "the first the rhapsode" once the term keeps its own (so `gr-134` gets no insertion), and a
  plural subject can be left with a singular complement ("17 of the 34 tombs are a cist grave"), which the
  article was hiding. Read every phrasing back after the change; the length rule bites too, since inserting
  the article costs a word.
- `answerText` — the answer as plain text, no HTML.
- `image` / `video` (optional, one or the other) — `{ src, title, desc, credit }`. **`credit` is required**:
  `add-card.js` refuses a `src` with no source line, matching the editors' media gate.
- `i18n` — **OPTIONAL while the site is English-only** (it was required, and will be again — see the
  English-only note above): the card translated into all 9 site languages,
  `"i18n": { "es": { "question": …, "questions": [q2, q3], "answer": …, "answerDate": …, "abstract": …,
  "answerText": … }, "fr": …,
  "de": …, "it": …, "nl": …, "ru": …, "ar": …, "zh": …, "ja": … }`. Each language mirrors the English fields under the
  SAME formatting rules (blank `<span class="blank">_____</span>` mid-sentence, a question of the same
  ~28-word brevity as the English, **a `questions` array with the same 2 extra phrasings translated**, 2×5-sentence abstract with one
  `<b>` on the answer term, `<i>` for titles, no parentheses). **`answerDate` is NOT translated** — the
  date line was cut to a list of dates in Aug 2026 and the translated ones were cleared with it
  (`set-date-line.js`), so every language falls back to the English line: numerals under a one-word
  label. Restoring them means translating the labels, and only the labels. Translate
  meaning-for-meaning at native quality — **not a literal, word-for-word rendering of the English.** Each language
  must read as though it were written by a native speaker for teenagers in that language: use its own natural phrasing,
  idiom and word order, at the same plain 14-year-old reading level as the English. Do not transliterate proper names
  that have established forms in the target language, and use each language's own standard scholarly term for the
  answer. The study page, card of the day and games show the `i18n[lang]` fields when the site
  language matches (`cardLocalized()` in app.js); English is the fallback. With `REQUIRE_TRANSLATIONS`
  back on, `add-card.js` refuses a new card with a missing language/field.

**Add a glossary term** — write `{ "slug": "Wikipedia_Article_Slug", "description": "<3 sentences>",
"date": "<optional>", "tags": ["<kind>", "<subject>", "<specific>"],
"sources": ["<Chicago note-form citation>", …],
"translations": { "es": "<3 sentences>", "fr": …, "de": …, "it": …, "nl": …, "ru": …, "ar": …, "zh": …, "ja": … } }`
(translations OPTIONAL while the site is English-only, and required again when it isn't — the description
in all 9 site languages, same three-sentence, impartial, self-contained rules; they land in
`i18n/gloss-<lang>.js` → `window.GLOSSARY_I18N`) to a temp `.json` file, then run:

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
numbered fold at the foot of the popup. **Markers are REQUIRED, exactly as on a card** (they were optional
through batches G1–G4; changed on request 2026-08-01). Point each claim at the work it rests on with
`<sup class="fn" data-fn="2"></sup>`, written empty — the digit is drawn from the list at render time — and
put the SAME markers on the same claims in **whatever translations the term carries** — which for a term
written while the site is English-only is none — since a language that loses them shows the fold with no
in-text links and a language that carries a different set points at the wrong work.
`add-sources.js` refuses a term with no marker, a marker past the end of the list, or a source nothing
points at; `add-lang.js` warns on a mismatched translation and `node .claude/gloss-source-audit.js` reports
both over the whole glossary. **`split-abstract.js` exports `pieces()` and `mark()`** for exactly this: split
each language into its three sentences and apply one sentence-index → source-number map to all ten at once,
after checking that every language really does split into three. The citations themselves are not
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

**A KEY WITH A DISAMBIGUATING PARENTHETICAL DOES NOT CLAIM ITS BARE NAME** (Aug 2026, on a bug report
that a Paleo-Indians card's "Archaic period" opened the gloss for the GREEK one). `glossKeyTitle` strips a
trailing `_(…)`, and a Wikipedia slug carries one for exactly one reason — the bare name is ambiguous — so
registering the stripped form as an auto-link surface is the one thing that must not follow from it. A term
that WANTS the bare name says so with an ALIAS, which is how all five parenthetical keys predating the rule
were already written (`Georgia_(country)` carries "Georgia"). **`node .claude/check-gloss-links.js` reports
what is left**: an auto-link whose term is bound to a different part of the world (a proxy, report-only, 34
findings) and — exactly — two keys competing for one surface.

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
(A figure that is only on the date line and nowhere else is now usually easier to REWRITE than to patch —
the whole field is a handful of words. Use `set-date-line.js` for that and `fix-field.js` when the same
figure also sits in another field.)

**Rewriting a date line** — `node .claude/set-date-line.js <batch.json>`
(`{ "cards": { "wh-013": [["Lived", "c. 4.2 – 2 Mya"], ["Named", "1925, by Raymond Dart"]], "wh-080": [] } }`).
Rows are `[label, value]` pairs and the script builds the markup, so the shape cannot drift; a row with an
EMPTY label is a continuation line under the value above it, and `[]` is an empty date line. It validates
through `.claude/date-line.js` — the same module `add-card.js` holds a new card to, which is what stops the
field growing back into a paragraph — clears the field from every translation the card carries
(`--keep-i18n` opts out), and reports running coverage over the whole deck.
**The whole deck was converted this way on 2026-08-03** (11 batches, 112 cards): the date line had grown
into a summary of the card, sometimes three sentences under a one-word label, and is now the dates alone.
Two things worth keeping from that pass. **The sort order improved as a side effect** — fifteen cards
changed sort year and every one was a correction, because the old paragraphs carried excavation and
publication years that `cardYears` read as the card's own date (Atapuerca sorted at **1978 CE**, Denisova
Cave at 1977, Omo at 1967, Dolní Věstonice at 2016). **A card that states no era of its own needs the
sort year putting back by hand**: `wh-063` Paleo-Indians lost its only deep date when the Clovis figures
went, and sorted 5,000 years late until the Clovis row was restored — so run the before/after comparison
over `cardStartYear`, not just the eye, after a batch.

**Citing the existing content (as of July 2026)** — **most of the shipped content still has no citations.** The
109 cards, 333 glossary terms and every Atlas description were written before this system existed, from Wikipedia
and its sources, and were fact-checked rather than referenced. A batched pass is working through the cards —
**every shipped card carries sources and meets the 5-source bar** (`docs/citation-plan.md`; `add-sources.js`
reports both on every run, `node .claude/source-audit.js` reports them per card, and the Edit page's card list
shows each card's coverage as an amber or red chip) — and **a second pass has started on the glossary**, batched
through `docs/glossary-citation-plan.md` at a bar of **2 citations per term** (`GLOSS_SRC_TARGET`), with
`node .claude/gloss-source-audit.js` and the glossary list's own coverage chip reporting it; **all 401 terms are cited — THE GLOSSARY PASS IS COMPLETE** (batches G1–G11, which complete Phase 1;
P1–P7, which complete Phase 2 — all 45 US presidents; C0–C12, which take Phase 3 through every region;
D1–D3, which clear the European and Asian deferral lists and the last four terms; and **N1–N10,
sixty-eight new Palaeolithic terms written cited rather than cited afterwards** — which is how the pass stays
complete: a term added after it joins at the bar instead of reopening a backlog). `country-sources.js` is still empty, so the Atlas panel never shows a Sources fold.
**N9 is the batch that measured a rule change, and its finding is that the change buys less than it
sounds like.** The rule was relaxed on request — **an encyclopedia may be cited, but only if that
encyclopedia cites its sources** — and the test to apply is **per article, for that article's own
claims**, not the publisher's general reputation. Measured: **Dansk Biografisk Leksikon passes**
(a named author and a *Bibliografi* section listing sources), and **Britannica and Store norske leksikon
both fail** — Britannica's *Würm Glacial Stage* carries no bibliography, no "Additional Reading" and no
citations at all, its *rhinoceros* article has a named expert and an "External Websites" link box which
is not a source list, and SNL's *Fennoskandia* has a named expert and no *Litteratur* or *Kilder*
section. **A named author is not enough**, and the two that read most like they would qualify do not.
What it bought was one term: `Jens_Jacob_Worsaae`, shipped in N4 without birth and death dates, without
his career and without his book's Danish title because every source stating them was an encyclopedia,
and looked for again in N6 down the institutional route, where `natmus.dk` turned out to carry five
history pages that do not mention him at all. DBL supplies the lot, and the shape worth keeping is the
division it produced: **the encyclopedia carries the biography and the scholarship still carries the
argument.** N9 left `Weichselian_glaciation`, `Würm_glaciation`, `Devensian_glaciation`, `Fennoscandia`
and `Rhinoceros` deferred and said the encyclopedia rule was not what held them; **N10 cleared all five
and showed what was.**
**N10's finding is that a 503 on EVERY path is a moved domain, not an outage.**
`quaternary.stratigraphy.org.uk` — the ICS Subcommission on Quaternary Stratigraphy, named by N7 as the
right source for the European stage names — was recorded down in N7, in N9 and twice more at the top of
N10, on `/correlation/`, `/charts/` and the root alike. **The site is alive at
`quaternary.stratigraphy.org`, without the `.uk`**, and nothing on the dead host says so; a search
result for the chart carried the new address in passing. A genuine outage usually still answers
something, so **look for a sibling domain before recording a third refusal.** Behind it is Cohen &
Gibbard's *Global Chronostratigraphical Correlation Table for the Last 2.7 Million Years*, whose
regional columns carry Weichselian, Devensian and Wisconsinan side by side against the marine isotope
record — the one work that ties the three names together, and now cited on two of them. **It has no
Alpine column** in any version checked, so the Würm went to the south German and Swiss literature
instead. Three more things the batch is worth remembering for. **Where a Copernicus article is 2020 or
later, fetch the HTML full text**: the older ones are PDF-only, and a subset font with no ToUnicode map
defeats extraction outright (Preusser et al. 2011 comes out as raw byte codes, Ivy-Ochs 2015 as
nothing), which is why Gaar et al. 2019 answered where Preusser did not. **Test the file, not the
host** — N9 wrote off `geologinenseura.fi` on one image-only scan, and Donner 1996, on the same host,
extracts cleanly and carries the whole of `Fennoscandia`. And the sibling check paid again in a form
worth copying: the `Rhinoceros` draft carried Welker's "*Coelodonta* surviving locally to 14 ka" while
`Woolly_rhinoceros`, whose subject that is, says its demise begins about 10,000 years ago on its own
sources — **two open works disagreeing, so the clause was DROPPED from the family term rather than
reconciled**, a date about one genus belonging on the term for that genus. An unsourced date line went
the same way: `Weichselian_glaciation` was drafted with the textbook "c. 115,000–11,700 years ago",
which is in nothing opened for it, and now has no date line at all, like `Wisconsin_glaciation`.
**N1's finding is an access repair worth reusing: `hal.science` is now behind the Anubis wall on its RECORD
pages as well as on `/document`** (batch 21 found the file path), which silently breaks stored citations —
`wh-011`'s PAGES 2016 link among them. The way back is a **university repository deposit** of the same
paper (`repository.cam.ac.uk` carried it, record page and PDF both); look there before treating a HAL
citation as lost. `discovery.ucl.ac.uk`, `agupubs.onlinelibrary.wiley.com` and `whc.unesco.org` — the
latter on `/document/<id>` as well as its property pages — are all **403** here; so are `pnas.org`,
`nature.com` and `link.springer.com`, the last two **303ing to an identity-provider cookie endpoint**, for
which **Europe PMC is the way in** (resolve the PMCID with `search?query=DOI:"…"&resultType=core` — a
guessed one in N1 returned a paper on stress in mice).
**N8's finding is that a wrong TERM is not always a wrong FACT, and only a reader caught it.**
`Smilodon` opened "*Smilodon fatalis* is the saber-toothed cat" and held every sabre-tooth alias, so the
whole vocabulary of the group resolved to one American genus. Nothing in it was false about *Smilodon* —
the canines, the microwear, La Brea, the extinction were all sound and all still stand. What was wrong was
the **definite article**, and no tool can see that: `gloss-source-audit.js` counts citations, the marker
rules check pointers, `check-style` checks prose. **When a term is the only one in the glossary for its
subject area, check whether it is being made to carry the whole subject** — the fix is a sibling term, not
a correction. Note too that N6's *refusal* to cite `dodson-2025`'s Zhoukoudian cats for `Smilodon` (wrong
animal) is exactly what now carries `Saber-toothed_cat`'s third sentence: **the fact set aside as
uncitable-here was the fact the missing term needed.** Tooling note from the same batch:
**`add-glossary.js` clears an alias list only when the `aliases` key is PRESENT** — omit it on an update
and the old list stands, so two terms end up claiming the same surfaces and the older key wins. Pass
`"aliases": []`.
**N7 is the first N-batch to come back SHORT — eight of thirteen — and the deferrals are a source
problem, not an effort one.** `Weichselian`, `Würm` and `Devensian` are *stage names*, and what defines a
stage name is a stratigraphic authority: the canonical one is a Springer encyclopedia entry (barred twice
— `link.springer.com` 303s AND the plan bars encyclopedias), and the ICS Subcommission's correlation table
at `quaternary.stratigraphy.org.uk` returned **503 on two paths** — retry it before deferring them again.
`Wisconsin_glaciation` shipped only because a USGS record carries a MEASURED claim under the name, which
is the rule: **a stage name is citable when an agency has published a result under it, never from the mere
fact that it is the name.** `Fennoscandia` is deferred as `Scandinavia` nearly was — the ice sheet is well
sourced and nothing opened defines the REGION — and `Rhinoceros` because the family-level paper is in
*Cell* with no Europe PMC record. N7's other finding is the alias pattern hardening into a rule:
`United_Kingdom` was carrying "Britain", "British", "Great Britain" AND "Northern Ireland", three of them
wrong and the last never a synonym at all, all exposed the moment `Great_Britain` was added. **An alias
list written before the sibling term existed will contain the sibling's name, and will be wrong the day
the sibling arrives** — fourth correction in seven batches.
**N6's finding is a trap in the SEARCH RESULTS, not in a host.** Asked to complete `Jens_Jacob_Worsaae`
from a Danish institutional record, five `natmus.dk` history pages and `slks.dk` were tried and **not one
mentions him** — the Danish sources the search summaries appeared to offer were aggregating `lex.dk` and
Wikipedia, both barred, so a summary can read as institutional when every source under it is an
encyclopedia. What answered was **Worsaae's own book**, whose TITLE PAGE states his Danish office ("A
ROYAL COMMISSIONER FOR THE PRESERVATION OF THE NATIONAL MONUMENTS OF DENMARK") and whose opening pages
give Thomsen as "the real founder of the Museum" and the three-class division in his own words: batch
25's rule at full strength, **a 19th-century figure is his own best institutional record**. Read a scanned
book in bulk via `archive.org/stream/<id>/<id>_djvu.txt`. **His birth and death years are STILL uncited**
and the term still omits them. N6 also shows what N5's restraint bought: `stratigraphy` was cut from
`Stratum`'s aliases in draft, so giving it its own term cost nothing — had the alias shipped, the new term
would have overridden it and left a dead row, which is the `Upper_Paleolithic` case exactly.
**N5 CLEARED `wh-085`'s date line** (see N3's note) — "a rockfall closed the entrance roughly 13,000
years ago" is gone from all ten languages, via `fix-field.js`, which refuses to write unless every `find`
string is present. **The sweep came first and is the reusable part**: grepping every card's abstract and
date line in all ten languages for *rockfall* and its nine translations proved the claim was on `wh-085`
alone, and that `wh-084`'s Chauvet rockfall at ~20,000 years is a separate, sourced claim. N5's own
finding is that **the pass's most repeated mistake is the alias**: `Stratum` was drafted with
"stratigraphy" as an alias — the STUDY of strata, not a synonym — which is N2's "Late Stone Age" and N4's
"Swabia" a third time, caught in draft this once. It also caught its own `Subsistence` draft stretching a
registered source past what the register records (G6's rule), and fixed it by RE-READING the paper rather
than softening the sentence. And it recorded a limit worth knowing: **no openable source defines the
DISCIPLINE of geology in a sentence** — the BGS gives its scope and its topic pages and no definition,
`geolsoc.org.uk`/`usgs.gov`/`historicengland.org.uk` are shut — so `Geology` describes what geologists
study and do, written around the gap. G8 needed Gray's *Anatomy* for anatomy; geology's equivalent was
not found.
**N4's finding is the one to carry furthest: a FABRICATED AUTHOR was caught in draft.** The first draft
of `Mesopotamia` cited "Morphodynamic Foundations of Sumer" to "Alberto Bravin et al." — a name read
nowhere, composed because WebFetch had returned the paper's CONTENT without its author list. Nothing in
the surrounding process would have caught it: the URL resolves, the claims are real, the marker rules
pass, and `gloss-source-audit.js` counts citations rather than checking them. **When a source's content
arrives without its metadata, look the metadata up** — `search?query=DOI:"…"&resultType=core` at Europe
PMC returns author string, volume, issue and pages in one call — and **never compose a citation from
what the prose sounded like**. N4 also withdrew a second identity-asserting alias ("Swabia" off
`Swabian_Jura`, now its own term), which with N2's makes it a pattern; and it left `Jens_Jacob_Worsaae`
**without birth/death dates or his book title**, because every source stating them is an encyclopedia,
which the plan bars: a biography written to the length of its sources is short, and one padded to the
length of a reader's expectation is fiction.
**N3's finding is what to do when a term fails the majority-open check**: `Solutrean` came back 1 open of
2, and the reflex — add a third source to fix the ratio — is wrong. Ask what the PAYWALLED one is
carrying: Aubry et al. 2008 is about laurel-leaf *production* and the term's sentence is about the
retouch, which Bachellerie 2025 states openly, so Aubry was **dropped, not balanced**. A paywalled work
earns its place only as the landmark for a claim nothing open carries. N3 also **re-points
`guder-2025`'s URL** from the Europe PMC `fullTextXML` REST route to the PLOS article page, which is 200
again: that endpoint is a machine route serving raw markup, so **when a host reopens, move the citation
back to the human-readable copy** (`journals.openedition.org` has likewise dropped the Anubis wall batch
21 recorded). And it leaves one thing UNFIXED and written down: **`wh-085`'s date line still carries the
"rockfall closed the entrance roughly 13,000 years ago" that batch 21 removed from its abstract** — the
third time a correction has failed to travel from a card's prose to its own `answerDate`.
**N2's finding is about ALIASES, and it is a content rule rather than an access one.** `Upper_Paleolithic`
carried "Late Stone Age", which is not a synonym: the Later Stone Age is the AFRICAN division running from
~40 ka into historical times, and Malan 1957 records that Goodwin chose the African names precisely so
they would not be read as the European ones. Nothing looked broken — pass 1 of `buildGlossIndex` beats an
alias — so it would simply have sat there being wrong. **Before adding a synonym alias, ask whether the two
names belong to the SAME SCHEME**: Old/New Stone Age are Palaeolithic and Neolithic in one European
sequence and are right; Earlier/Middle/Later Stone Age are another continent's sequence and are not.
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
**Batch G4 is where the pass stopped being about journals**: eighteen works, every one open, and nine of the
eleven new ones were museum records or out-of-copyright books — there is no modern open literature on who
Thomsen was, but the museum that still uses his arrangement publishes its own history, and it says **he did not
devise the three-age system** (he called it "the old idea" in 1825, and Vedel Simonsen had published the theory
ten years earlier). That corrected two terms and `wh-006`'s date line. G4 also found, and deliberately did NOT
half-fix, the pass's one systematic divergence: **the glossary starts prehistory at 3.3 Mya and the cards start
it at 2.6 Mya** with Lomekwi 3 as a contested earlier claim — and the glossary's own `Lomekwian` term calls that
assemblage debated, so it contradicts itself too.
**Batch G5 settled it: prehistory starts at 2.6 Mya everywhere**, with the disputed 3.3 Ma Lomekwi claim kept as
a hedge in the prose and left standing alone on `Lomekwian` and `Lomekwi_3`. Seven date lines moved with it, and
the sibling check the plan demanded found two nobody had gone looking for — `Neolithic` ended at 3000 BCE where
`Stone_Age` ended and `Bronze_Age` began at 3300, and `Upper_Paleolithic` ended at 12,000 BP where the Holocene
GSSP puts it at 11,700. The Palaeolithic now closes at **9700 BCE**, not 10,000. `wh-001` carried the same two
errors and was corrected in ten languages. G5's own finding is a caution about harmonising: the `Neolithic`
term's "first clear signs of social ranking" was **withdrawn** (contradicted by `wh-009` and by Fuller &
Stevens, who put rank with urbanism), while `Neolithic_Revolution`'s "private property and inherited rank" was
**kept**, because it claims these among the transition's consequences and not as the first of their kind. The
two read as inconsistent and are not; the difference is the word *first*. Also from G5: **open a source whose
title reads as a refutation before citing it** — `eren-lycett-2012` ("Why Levallois?", on whether Levallois
flakes are standardized at all) was opened for that reason and confirms the sentence it now marks.
**Batch G6 found the pass's third wrong marker, and the rule it produced governs every batch that leans on
the register.** `wh-011` credited Hoffman et al. 2017 with "at least five major ice ages"; that paper does
not say five, or any number, and nothing openable from here counts them — the familiar Huronian / Cryogenian
/ Andean-Saharan / Karoo / Quaternary list is a textbook enumeration. Both the card and the `Ice_Age` term
now say what Hoffman supports. Ten of G6's sixteen works were reused from `.claude/sources-register.md`
unopened, which is the economy of the whole pass, and **the one that broke was the one stretched to a new
claim** — so: **a source reused from the register is reused for the claim the register RECORDS; a new claim
needs a re-read.** All three wrong markers (`wh-098`, `wh-032`, `wh-011`) were caught the same way, by
re-reading a registered source for a different surface. Two smaller G6 findings: the sibling check beat the
sources again (the `Ice_Age` term's uncited "coldest point around 20,000 years ago" was settled by
`wh-078`, which already gave the LGM as 26,000–19,000 with a citation), and **a claim nothing contradicts
stays** — the Meghalayan GSSP is a "speleothem" in every open source, "stalagmite" in the term, and the term
keeps it with the gap recorded in the register rather than being reworded on a hunch.
**Batch G7 is where the register stopped paying, and the reason is structural.** Fifteen of its 32 works
were new — against ten of sixteen reused in G6 and 26 of 38 slots in G5 — because **the register carries
terms about TAXA and PERIODS, and a type site is a PLACE.** A site's three sentences are a location, an
excavation history and a find, and only the find is a claim some card already makes; the geography, the
administrative facts and the dig histories all had to be found. Expect the same of G9 and G10, which are
peoples and physical geography and have no cards behind them at all. Its other findings: the cross-surface
sweep paid twice more, and both were siblings rather than strangers — `Olduvai_Gorge` was still "about
48 km" five batches after `wh-017` was corrected to 46, and `Lomekwi_3` still had the passive-hammer
knapping backwards after G3 fixed the identical error on `Lomekwian`, so **a correction does not travel
between SIBLING TERMS either, and the grep is for the figure, on the day**. And G7 met a case the pass had
not: not a source contradicting the term but **two sources contradicting each other** over a claim the term
makes flatly — Parker et al. read Taung's hominin-bearing calcrete as pedogenic where Rowan & Wood still
write of "the cave sediments at Taung". The rule adopted: where the sources disagree and three sentences
leave no room to hedge, **say what both carry** (here "tufa and calcrete deposits") and record the question
in the register rather than settling it in a gloss.
**Batch G8 corrected NOTHING, and that is the pass's most useful negative result.** Thirty-four batches had
produced corrections every time; the tenth-of-a-batch that did not is the one whose terms are DEFINITIONS and
BIOGRAPHIES — and the same batch carries the most unmarked, unsourceable clauses of any so far (nine, across
seven terms: a forager band's size, portable wealth, `Megafauna`'s 10 kg lower bound, the word *anatomist*,
the French and Lakota etymology of *badlands*, and Dart's birth, his 1958 retirement and the
osteodontokeratic hypothesis). **A term whose fold shows two open sources looks identical to a reader whether
every sentence rests on them or only one clause does**, and the audit counts citations rather than covered
claims — so it cannot see this. G7 found the register pays for taxa and not for places; G8 adds that **the
literature pays for RESULTS, not for definitions or for living people**, which is a harder limit than any
sandbox egress policy. Two routes did work and should be reached for early in G9/G10: **a discipline's own
statement of scope** (the SAA's *What Is Archaeology?* carried that whole term) and **the canonical textbook,
out of copyright** — there is no modern open work saying what anatomy is, and Gray's *Anatomy of the Human
Body* (1918) is on the Internet Archive in full, defining the subject, dissection, histology, comparative and
applied anatomy in its Introduction. That is G4's rule applied to a discipline rather than a man; an
encyclopedia is barred by the plan, a founding textbook is not. Its cheapest find is a search order:
**look at the deck's own markers for a FIGURE before searching the literature for it** — `Megafauna`'s 44 kg
was already marked on `wh-089` to Koch & Barnosky, who also carry three of the term's four claims.
**Do not paper over the rest by attaching plausible-looking citations to existing prose** — a citation that was
not the actual source of a sentence is worse than no citation, because it invites a reader to trust a page number
nobody checked. The honest routes are the ones the pass follows: open every work before citing it, re-derive the
passage from it, and correct the prose where the source does not bear it out.

**Splicing footnote markers into the translations** — `node .claude/split-abstract.js <cardId …>` splits a
card's abstract into its 2 blocks of 5 sentences in all ten languages and reports whether each one runs 5+5
and round-trips byte for byte. **Run it before placing markers by sentence index**: a language that splits
differently maps the markers onto the wrong claims and nothing downstream notices. It carries every guard
the batches have turned up — decimals, the era abbreviations in five languages (incl. Russian `н. э.`,
which needs no `\b` since JS's is ASCII-only), initials — **runs of them AND lone ones**, the lone case
added in batch G5 after "the archaeologist **V.** Gordon Childe" split a glossary term in half in English and
five translations, with a matching Arabic clause since Arabic has no case to test for — a day-ordinal before a
month name, a bare ordinal
before `Jahrhundert`, the CJK full stop, and **markers already placed by an earlier batch** (the marker sits
between the full stop and the following space, and in zh/ja with no space at all — without that guard a
top-up batch sees one enormous sentence, or splits every marker off as its own).
**A SENTENCE MAY CLOSE ON A QUOTATION, and until Aug 2026 the splitter could not see it** — the
terminator sits inside the quotation marks, so a closing quote stands between the full stop and the
space the lookbehind was anchored to, and the quoted sentence merged with the one after it. Found while
writing `geo-012`, whose fourth sentence ends on the Nez Perce tribal executive committee's own words,
and the block came back 4+5. Two clauses fix it and the SECOND is the one that matters: widening the
terminator to allow a closing quote also broke `wh-185`, where "…to ask 'Then who was king?' twice
over…" is a quotation INSIDE a sentence, so a `hold` refuses the split when the quote is followed by a
LOWERCASE word — the same test the abbreviated-genus and regnal-numeral rules already use, since what
follows a real boundary is always a capital. **Verified over all 2,627 shipped texts, where it changes
exactly one split and that one is a CORRECTION**: `gr-336` block 2 had been splitting 4 where it is 5,
because its first sentence ends on the Kroisos epitaph. That card was written with its markers already
in the prose so nothing shipped wrong, but a top-up batch marking it by sentence index would have put
every marker one claim early.

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
the whole group territory (so single-click selects the union, double-click drills to the sub-country — see `docs/atlas.md`). Editing a groups era
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

- **CI RUNS ON EVERY PUSH** (`.github/workflows/checks.yml`, Aug 2026). Two jobs, deliberately split.
  **`fast`** is the GATE and must stay green: `node --check` over every root `.js` and every
  `.claude/*.js`, then the seven no-browser suites (`test-card-plans`, `test-daily-quote`,
  `test-date-line`, `test-difficulty`, `test-discovery`, `test-scheduler`, `test-streak-chest`) and the
  three checkers (`check-docs`, `check-questions`, `check-style`). Seconds, no install, no network.
  **`browser`** runs the Playwright suites and is a slow SECOND OPINION rather than a gate — it `needs:
  fast`, because if the cheap job is red the answer is already known. `check-sizes` runs
  `continue-on-error`, deliberately: a size is not a failure, and the point of it there is that the eager
  path's real weight lands in every run's log — which is the one thing prose in this file could not
  manage to stay honest about.
  **Playwright is installed into `$RUNNER_TEMP` and reached through `NODE_PATH`**, never into the repo:
  the zero-dependency rule is about what the SITE ships, and this is the same way the Testing bullets
  below say to run them locally, so CI and a developer's machine run the suites identically.
  **The browser job loops over `grep -l playwright .claude/test-*.js`** rather than a list, so a suite
  added later is picked up with nobody remembering this, and it runs ALL of them before failing, so one
  broken suite does not hide the state of the other thirty-four.

- Fastest check: open `index.html` in a browser and watch the console for errors. The app uses
  `localStorage`, which works from `file://` in Chrome.
- After editing JS, run `node --check app.js` to catch syntax errors before reloading.
- For automated checks, Playwright + headless Chromium works well (navigate via `location.hash`,
  screenshot pages, assert zero console errors). Loading `data.js` / `glossary.js` / `world.js`
  under Node requires setting `global.window = {}` first.
- Put any Unicode (Chinese text) used in a test script into a file — don't pass it inline via
  `node -e`.
- **Forty-seven committed regression tests** (in `.claude/`, not loaded by the site — the count excludes
  `test-noise.js`, which is a shared console-noise filter rather than a suite): most drive a real browser with
  Playwright; `test-card-plans.js`, `test-daily-quote.js`, `test-date-line.js`, `test-difficulty.js`,
  `test-discovery.js`, `test-scheduler.js` and `test-streak-chest.js` are plain Node with
  no dependencies at all (`test-card-types.js` is half and half — its XP, CSS-scoper and template-engine assertions need
  no browser). **Neither number is one to keep in your head — count them**: `ls .claude/test-*.js | wc -l`
  for the total and `grep -L playwright .claude/test-*.js` for the split. The headline had drifted TWO
  behind by 2026-08-10, having been corrected once already for the same reason, so the bullet list below is
  the thing to trust; two files are described in prose elsewhere rather than listed here
  (`test-speak.js`, `test-subdecks.js`).
  Each slices what it tests out of the real `app.js`/`_headers` by text, so they can't drift from what ships.
  **Gotcha when writing more of them:** `page.goto()` to a URL that differs only in the `#fragment` is a
  same-document navigation — the app keeps running and its module state survives. Use `page.reload()` when
  a test means "start fresh", or navigate through the UI. Several early failures were this, not real bugs.
  **And close any IndexedDB connection the test itself opens** — an idle one blocks the app's own open after a
  reload, which silently pushes it onto the localStorage fallback, and the test then goes looking for a deck in
  the store the app has just stopped using (`test-card-types.js` learned this the hard way).
  · `node .claude/test-deck-trust.js` — **the sanitizer revision stamp** (9 assertions), which is what
    lets boot skip re-cleaning a deck it has already cleaned. **Re-run after touching `SANITIZE_REV` /
    `uDeckNormalize` / `uDeckIndexRecord` / `communityBoot`, or any `sanitize*` function.**
  · `node .claude/test-deck-lazy.js` — **the split store** (27 assertions, Aug 2026): a deck's cards live
    one record per note and are loaded when needed, and EVERY failure that change can produce is
    invisible from the outside, which is why this is a file of its own. **Re-run after touching
    `cdbPutDeck` / `cdbGetNotes` / `cdbAllNotes` / `uDeckIndexRecord` / `uNoteRecord` / `uDeckRecordFull`
    / `uNoteIndexEntry` / `uIndexSanitize` / `uNoteStub` / `uDeckMount` / `uDeckSave` / `uCardTouched` /
    `uWarm` / `uWarmDeck` / `uAdoptNotes` / `communityBoot`'s migration, or the loading placards in
    `PAGES.study` / `PAGES.studio` / `PAGES.browse`.**
  · `node .claude/test-sanitize.js` — 48 XSS vectors through `sanitizeHTML()`, each one also injected
    into a live DOM to confirm nothing executes. **Re-run after touching `SANITIZE_*` or `sanitizeUrl`.**
  · `node .claude/test-csp.js` — serves the site with the real `_headers` CSP and walks every route,
    failing on any violation. **Re-run after changing `_headers`, or adding an inline script/`eval`.**
  · `node .claude/test-community.js` — 40 assertions end-to-end: write a deck in the Studio, reload,
    study it, export, import, delete; plus that a hostile deck file executes nothing, and that community
    content never reaches `CARD_DATA` / the tree / the glossary / the admin overlay / the daily games.
    Re-run after touching the `COMMUNITY DECKS` module or the Studio** — including the ownership register
    (`uDeckOwned` / `uDeckClaim` / `deckOwnBackfill`): its "deck survives a reload" is the only assertion
    on the shelf that can see a deck that mounts from nothing, and it is what caught `uDeckCreate` not
    claiming the deck it had just created.
  · `node .claude/test-admin-editor.js` — the curated-content editor: open a card, type, confirm the
    overlay records it, revert, the HTML source box, and gloss popups. **Re-run after touching
    `liveCardEditorHTML` / `wireLiveCardEditor`** — that surface is shared with the Studio.
  · `node .claude/test-publish.js` — 128 assertions across six browser sessions (an author, a reader, an
    admin, and three more DEVICES of that reader's) driving publish → browse → install → update → report
    → hide → rate → staff-pick → fork → export → delete → sync. **Re-run after touching the publishing
    functions, `communitySyncInstalls` / `communitySyncSoon` / `communityFetchDeckById` /
    `localIdForRemote` / `uDeckInstall` / `uDeckUninstall`, `uDeckDelete` / `uDeckRemoteDelete` /
    `confirmDeleteDeck` / `myRemoteDecksLoad` / `orphanSectionHTML` / `uDeckSetColor` /
    `colorColumnMissing`, the shared-decks table on the Collections page (`COMMUNITY_COLS` /
    `sharedDecksHTML` / `wireSharedDecks`), or `.claude/supabase-schema.sql` — and keep the mock in step
    with the policies, since it is only a stand-in for them, never a proof that the real RLS is right.**
  · `node .claude/test-deck-glossary.js` — 22 assertions on per-deck glossaries: the `glossMode`s, the
    popup, and above all **isolation** (a curated card never links a deck's term; a second deck never
    sees the first's), plus a hostile glossary in an imported deck. **Re-run after touching
    `glossSourcesFor` / `buildGlossIndex` / `uGlossSanitize`.**
  · `node .claude/test-i18n-lang.js` — **21 assertions**, in two halves. First the **English-only gate**,
    on the real app.js: **Re-run after touching `MULTILANG` / `langBundle` / `loadLangData` /
    `DATA_BUNDLES`, after adding a language, or after anything that writes card or glossary content.**
  · `node .claude/test-account-switch.js` — 22 assertions on switching accounts on one device, against an
    in-memory mock of the Supabase **auth + progress** endpoints (a test that really signed up would
    create users in the live project). **Re-run after touching `supaAfterSignIn` / `supaSignOut` /
    `supaBoot` / `_supaOwner` / `PROGRESS_FIELDS`, **or any of `supaSignIn` / `supaEmailForUsername` /
    `supaSwitchTo` / `supaRemember` / `supaForget` / `supaSetEmail` / `SUPA_ACCTS_KEY`** — a switch that
    carries the outgoing account's progress across is exactly what its `_supaOwner` assertions exist to
    catch, and nothing on screen would say so.**
    Its **section 6 is the RECONCILE** (Aug 2026) — that an edit made while the progress pull is still in
    flight is not overwritten, that an IDLE device still adopts another device's write, and that a boot
    which is genuinely in sync sends **no push at all**. **Re-run it after touching `supaBoot`'s reconcile,
    `progressBlob` / `extractProgress` / `applyProgress` / `_supaLastSent` / `supaPull` / `supaPush`.**
  · `node .claude/test-video.js` — 100 assertions on card + glossary videos **and the fullscreen viewer's
    gestures**: that every accepted link shape resolves to the embed this code builds and **every other
    URL resolves to no player at all** (the check that keeps an `<iframe src>` off untrusted input), that
    the frame is byte-for-byte the image's frame (computed border-radius / aspect-ratio / border / size),
    that the expand control opens the viewer and a click on the player does not, and that a community
    deck's `javascript:` video src is dropped on ingest. **Re-run after touching `videoSource` /
    `cardVideoHTML` / `openMediaViewer` / `retireOther*Media` / the delegated `error` listener /
    `.media-dead` / the media panel, or the `media-src`/`frame-src` CSP.**
  · `node .claude/test-gloss-image.js` — 44 assertions on glossary images: the popup floats one to the
    top-right within a 150px × half-the-popup box — the LIMITS, not the shape — shown whole rather than
    cropped, it opens the SHARED fullscreen viewer, that viewer stacks above the popup, the editor
    overlay survives a reload, and a deck term’s `javascript:` src is dropped on ingest. **Re-run after
    touching `glossImage` / `renderGlossImage` / `setGlossImageEdit` / `uGlossSetImage`, or any z-index
    in the gloss/viewer stack.**
  · `node .claude/test-media-source.js` — 36 assertions on the media source gate: that an uncredited URL
    really is **absent from the store** rather than merely marked, that it is still shown to the author
    and flagged, that leaving the URL field asks for the source, that an answer commits the whole object
    at once, and that clearing the source takes the picture back out — on all four surfaces. **Re-run
    after touching `wireMediaSource` / `askMediaSource` or any media panel's wiring.**
  · `node .claude/test-feedback.js` — 39 assertions on reader feedback: the About-page form (a message
    that reaches the row with its line breaks intact and its markup gone, the device-local cooldown, and
    that **the sender never supplies a triage status** — the client half of what the column guard
    enforces) and the Edit-page queue (the filters, that **no two statuses paint the same row edge**, the
    toggling swatches, the private note, the two-step delete, and that a session saved on the retired
    Accounts tab opens on Cards). **Re-run after touching the feedback functions, the queue, or the `7)
    FEEDBACK` schema block.**
  · `node .claude/test-sources.js` — 74 assertions on source footnotes, on all three surfaces. **Re-run
    after touching the `SOURCE FOOTNOTES` block, `wireFootnotes` / `sourcesHTML` / `normSources` /
    `linkifySrcItem` / `replaceInSrcText`, the `.src-access` styles, the editors' sources boxes, the
    community store's record shape, or the `fn` / `data-fn` sanitizer allowlists.**
  · `node .claude/test-layout.js` — 308 assertions on **the shell**: the rules that break silently
    because nothing throws when a layout is wrong. **Re-run after touching `.tabbar` / `--tabbar-h` /
    `--timebar-h` / `layoutTicks` / the Atlas chrome's media queries / `.settings` / `.auth-split` / the
    coming-soon rows / `wireOnePageSwipe` / `.home-collections` / `.games-sec` / `.home-about` /
    `gameSub` / `pileCounts` / `adProg` / `.active-deck` / `gbWireResize` / `.gb-fold` /
    `body.gb-compact` / `wirePageSwipe` / `SWIPE_ORDER` / `makePageGhost` / `clipStageFor` / the
    `.page-next`/`.page-prev` keyframes / `applyTheme`'s `data-fs` / `var(--fs)` / `.fs-slide` /
    `#fsRange` / `MULTILANG` / `ensureWBTools` / `.wb-pick` / the `.wb-toggle` click handler /
    `wbDefaultPos` / `wbGoHome` / `wbStopHome` / `.wb-homing` / `.tab .tab-label` / the ink layer's
    pass-through / `GB_FOLD_EASE` / `flipHeight` / `.gk` / `.ghb-keys` / the `*-mode` list on
    `.admin-list-items` / `cpWireResize` / `cpPaneNeedH` / `cpFitH` / `lockHeight`, or after adding an
    overlay to `document.body`.**
  · `node .claude/test-discovery.js` — 22 assertions on the counting behind the discovery chips and the
    "Beyond the cards" meters, run against the **real** `world.js` / `timeline.js` / `glossary.js` —
    including that **`SEEN_CAP` still clears the shipped universe with room to spare**, since every geo
    era grows it and a prune would make a completion count go backwards. Re-run after touching `markSeen`
    / `SEEN_CAP` / the `*SeenCount` helpers, **and after adding a timeline era or a batch of glossary
    terms** — the sizing, not just the logic, is what it guards.
  · `node .claude/test-a11y.js` — the accessibility floor (Aug 2026), and every one of its three passes
    covers something that fails SILENTLY. **Re-run after touching a control's markup, `body.hc`, or any
    theme's colour tokens.**
  · `node .claude/test-card-plans.js` — 245 assertions on **the join between the sixteen card plans and
    `data.js`**, which is what makes "generate the next `<collection>` card" work. **Re-run after editing
    a plan, after changing a tree in `data.js`, and after adding a collection.**
  · `node .claude/test-daily-quote.js` — 7 assertions on the home page's daily-quote running order: it
    simulates 400 days off the real `QUOTE_ORDER` and checks every seven-day window in them, so a repeat
    two days running or a third appearance inside a week fails here rather than on the live page.
    **Re-run after adding or removing quotes** (a fifth Confucius line tightens the pool) as well as
    after touching `quoteRunningOrder` — the rule is a property of the ARRANGEMENT, so it breaks
    silently.
  · `node .claude/test-streak-chest.js` — 18 assertions on the weekly streak chest (Aug 2026). **Re-run
    after touching `bumpStreak` / `maybeStreakChest` / `streakChestProgress` / `STREAK_CHEST_EVERY` /
    `S.streak`.**
  · `node .claude/test-scheduler.js` — 136 assertions on **the schedule itself**, which is the thing a
    study site is most worth getting right and the thing that fails most silently: a wrong interval is
    still a number on a button, and a card that graduates a step early looks exactly like a card being
    studied. **Re-run after touching anything named `sched*`, `SCHED`, `fmtInterval`, or the load map
    (`loadMapNow` / `easyDays` / `LOAD_AVOID` / `LOAD_NEAR`)**
  · `node .claude/test-cards.js` — **flags, Set due date, Forget and the card browser** (114 assertions,
    Aug 2026), in two halves for the reason `test-card-types.js` is. **Re-run after touching
    `schedSetDue` / `schedForget` / `parseSetDue` / `browseTokens` / `browseTerm` / `browsePredicate` /
    `browseRowData` / `BROWSE_COLS` / `PAGES.browse` / `openFlagSheet` / `openSetDueSheet` /
    `openForgetSheet` / `openCardInfo` / `cardFlag` / `setCardFlag` / `S.flags`, or the account page's
    and the deck sheet's entries.**
  · `node .claude/test-revlog.js` — 58 assertions on **the per-review log**, Card info and the
    Answer-buttons card (Aug 2026), and every one of them is for a silent failure: a log that stops being
    written throws nothing and looks exactly like a reader who has not studied, and a duration that stops
    being measured leaves a card of dashes that reads as a reader who answers instantly. **Re-run after
    touching `logReviewEntry` / `revRead` / `revForCard` / `revWindow` / `grade()`'s logging / `shownAt`
    / `undoRevRow` / `openCardInfo` / `answerButtonsHTML`.**
  · `node .claude/test-date-line.js` — 13 assertions on the card date line, run against the real
    `data.js`: that every shipped card's `answerDate` is still a LIST OF DATES and not the paragraph it
    replaced (the check is content-aware, since an old date line wore exactly the same tags), that the
    limits in `date-line.js` still describe a glance, that every card stating a date still yields a sort
    year from it — four cards on the pre-conversion data yielded none — and that **no card naming a deep
    date sorts by the year it was dug up**, which is how Atapuerca came to sort at 1978 CE. Re-run after
    touching `cardYears` / `date-line.js`, **and after any batch of date lines** — the field is edited
    card by card and grew into a paragraph the same way.
  · `node .claude/test-review-decks.js` — the daily review's decks and the study session that comes out
    of them (Aug 2026). **Re-run after touching `reviewQueue` / `reviewLimits` / `REVIEW_ENTRY` /
    `deckLimits` / `globalLimits` / `mixPiles` / `orderPile` / `DECK_ORDERS` / `deckOrderMode` /
    `setDeckOrderMode` / `sortByDifficulty` / `refillAfterSuspend` / `UNDO_GUARD_MS` / `studyHold` /
    `clearStudySession` / `clearDeckLimits` / `deckDoneToday` / `entryPiles` / `openDeckMenu` /
    `openDeckLimits` / `addActive` / `maxActiveDecks` / `STUDY_KEY` / `qIdx` / `S.deckOrder` /
    `orderedIds` / `setupDeckDrag` / `deckEditOn` / `deckEditCheckpoint` / `deckEditBarHTML` /
    `setEntryTitle` / `adOwnTitle` / `rowTitle` / `.rv-editing` / `.rv-topacts` / `.rv-foot` / `.dk-del` /
    `S.deckGroups` / `S.deckNest` / `groupCreate` / `groupDelete` /
    `setNestParent` / `nestChildren` / `openDeckSched` / `setDeckSched` / `setDeckRetention` /
    `setDeckFsrsParams` / `schedModeOf` / `deckSchedCfg` / `cardEntryId` / `schedCfgFor` / `revFetchAll`
    / `fsrsSequences` / `defaultState().settings.newPerDay` / `buildChallengeQuestions`, `buildSession`'s
    per-deck allowances, or anything named `sched*` or `fsrs*`.**
  · `node .claude/test-card-locator.js` — **what a locator draws, and what SHAPE it draws it in** (14
    assertions, Aug 2026). The marks are on a canvas, so the honest test is a PIXEL COUNT — the
    collection's reds are there, and the card's own gold is still the biggest mark on the map. It also
    asserts the PAYMENT in both directions: the card paints before the `atlas` bundle arrives, and the
    bundle really is fetched rather than folded into the eager path. **Its second section is about the
    locator KINDS and measures the shape of the ink rather than its amount**, since a river card that has
    quietly gone back to a dot draws a perfectly good map: a river is LONG (its longer side many times an
    11px dot) and THIN (it leaves most of its own bounding box empty, where a dot fills four fifths of
    one), and a range spreads dark ink across most of the window with no gold anywhere. **Its third
    section measures the RIVERS BY TAKING THEM AWAY** — read the pixels, empty `window.RIVERS`, redraw the
    same view, read them again — because a "before the bundle lands" reading measures nothing: on a
    `file://` run the `atlas` warm resolves within a second or two of the reveal, so the first frame a
    test can reach already has the rivers in it and the two readings come back equal whether the layer
    draws or not, **which is how the previous form of that check passed for the wrong reason**. The water
    must FALL when the rivers go and the dark ink must not move by a pixel, which is "without their
    labels" stated as arithmetic. It runs on `rm-002`, which frames Italy — `gr-002` frames the Cyclades,
    where there is no river to draw at any zoom, so the section-1 card cannot see this layer at all.
    **Re-run after
    touching `locatorSiblings` / `cardCollectionRoot` / `locOwnTerms` / `LOC_KINDS` / `locPts` /
    `drawSwords` / the extras block in `startCardGlobe`'s `draw()` / `fitTarget`'s extent branch / the idle
    `ensureData("atlas")` beside it / `uCacheBust`, and after giving a card a locator `kind`.**
  · `node .claude/test-card-quote.js` — **a card quoting the book it cites** (13 assertions, Aug 2026),
    and every part of it fails silently: a quotation appended after the prose instead of standing between
    the two blocks looks deliberate, one that wraps around the floated illustration looks deliberate, and
    a book address that has stopped honouring its section fragment simply opens the book. **Re-run after
    touching `cardQuote` / `cardQuoteHTML` / `buildBack`'s abstract split / the `.cq-go` listener /
    `PAGES.book`'s `params.n` / the `#book` branches in boot and hashchange / `serializeCardData` /
    `revertCard`, or `add-card.js`'s quote guard.**
  · `node .claude/decks/check-say.js` — **a language card's speaker says what the card shows**: where the
    headword displays ONE article, the spoken field must carry it. It found 3,674 cards that dropped it —
    3,640 French and 34 Italian — and `--fix` repairs them. **A common-gender noun (`il/la complice`,
    three article spans) is exempt and must stay so**: the slash cannot be spoken and picking one gender
    asserts what the card declines to. Report-only, exit 1 on a finding. **Re-run after rebuilding any
    deck, and after touching `say_text` in cils/build_deck.py or the `say` block in delf/build_deck.py.**
  · `node .claude/test-atlas-places.js` — the Atlas's label crowding, its heightmap strength slider, and
    a glossary term's way onto the map (Aug 2026). **Re-run after touching `glossPlace` / `focusPlace` /
    `CITY_SEP` / `computeCityLayout` / `gsIndex` / `hmOpacity`, or after re-running
    `.claude/fetch-place-coords.js`.**
  · `node .claude/test-map-cards.js` — **the geography map-card format** (76 assertions, Aug 2026), half
    of it with no browser. **Re-run after touching the `MAP CARDS` block, `startCardGlobe` /
    `cardMapSpec` / `cardMapHTML` / `mountCardMaps` / `cardFacts` / `CMAP_ZMAX` / `serializeCardData` /
    `revertCard` / `gameCardIdSet`, `.claude/build-us-states.js`, or after adding a map card.**
  · `node .claude/test-minigames.js` — the three games added on 2026-08-09 **plus Common Thread's
    restricted pool** (75 assertions), and every one of its checks is for something that fails SILENTLY.
    **Re-run after touching `PAGES.crossword` / `PAGES.picture` / `PAGES.whatyear`, `xwNorm` / `xwPool` /
    `xwLayout` / `dailyCrossword` / `xwLocked` / `nextOpen` / `xwMarkGaveUp`, `picturePool` /
    `dailyPictureRounds` / `tagKinship`, `dayPick` / `buildChallengeQuestions` / `buildWhoSaidRounds` /
    `PAGES.truefalse`'s draw, `threadEasyKeys` / `dailyThreadPuzzle` /
    `THREAD_GROUP_MIN` / `THREAD_TRIES`, `wyStep` / `dailyWhatYear`, `DAILY_GAMES` / `GAME_NAMES` /
    `PAGE_META` / the `valid` route list, `gameCardIdSet` / `GAME_MAX_DIFFICULTY`, `whatyear.js` /
    `truefalse.js` / `quotes.js`, `gameBackHTML` / `flipGameTile` / `gameStatsPost` / `gameStatsLoad` /
    `markGamePlayed`, `gameAnswerNote` / `gameGlossKey`, `gameTap` / `gameCommit` / `gameClearPick` /
    `gameFound` / `TINT_PICK` / the `.mg-acts` buttons, or the home page's tile grid.**
  · `node .claude/test-avatar.js` — **the profile photo's crop, and enlarging someone else's** (17
    assertions, Aug 2026), and all three of its subjects fail SILENTLY: a hole in the crop becomes a black
    wedge in a JPEG that only its owner ever sees; a drag wired to nothing still opens a dialog, shows the
    picture and saves the centre crop it always saved; and a viewer left at the stored 128px is an
    "enlarge" barely larger than the row it was tapped in. So it reads PIXELS off the canvas and off the
    saved data-URI, on a picture whose left edge and middle are different colours. It reaches the cropper
    through a **patched app.js** (`test-i18n-lang.js`'s technique — the dialog is behind a Supabase
    sign-in, and mocking auth to reach it would test the mock) and fails if the tail it appends to is
    gone, so a refactor cannot leave it testing nothing. **Re-run after touching `openAvatarCropper` /
    `openAvatarViewer` / `AVATAR_PX` / `supaSetAvatar` / `monogramHTML` / the `img.viewClass` hook in
    `openMediaViewer`, or the `.av-crop` / `.avc-*` / `.iv-avatar` / `.mono-view` styles.**
  · `node .claude/test-difficulty.js` — **card difficulty and the minigames' pool filters** (69
    assertions, Aug 2026). **Re-run after touching `cardDifficulty` / `difficultyOK` / `gameCardIdSet` /
    `GAME_MAX_DIFFICULTY` / `cardUndatable` / `chronoPool` / `cardStartYear` / `serializeCardData` /
    `revertCard`, any game's pool function, `add-card.js`'s difficulty or undatable guard,
    `add-card-difficulty.js`, `mark-undatable.js`, or `whatyear.js` — and after any batch of ratings or
    flags.**
  · `node .claude/test-tour.js` — the first visitor's walkthrough and the pages that explain themselves
    (Aug 2026), 70 assertions. **Re-run after touching the `THE GUIDED TOUR` block, `pageHelp` /
    `closePageHelp` / `LIB_HELP_TIPS` / `BOOK_HELP_TIPS`, `PAGES.home`'s `fresh` branch,
    `tourOfferHTML`'s place on the home page, the Atlas / Library / book help cards, or `render()`'s
    close list.**
  · `node .claude/test-units.js` — the two Settings that REWRITE what is already on the page (Aug 2026):
    measurements, and light/dark from the device. **Re-run after touching `unitizeText` / `unitizeTree` /
    `applyUnits` / `applyTheme` / `setNight` / `setThemeAuto`, and after any units batch.**
  · `node .claude/test-whiteboard.js` — **the marker's gesture ownership** (9 assertions, Aug 2026), and
    every one of them is silent on the page: the marker is on, the canvas is there, the pen is moving, and
    what the reader gets is either a line that wanders or no line at all. It drives TWO contacts as raw
    PointerEvents with independent ids — a palm resting beside the pen, a palm lifting, a palm the browser
    cancels, a pen arriving after a finger, and two thumbs on a phone that has never seen a stylus — and
    measures **pixels in a row band** rather than state, since a straight line marks its own row and a line
    sewn to a second contact marks rows where that contact is. **Re-run after touching `setupWhiteboard`'s
    pointer handlers, `gid` / `gpen` / `dropGesture` / `beginStroke` / `end` / `passScroll` / `passCtl` /
    `pendTip` / `passMap` / `CTL_SEL` / `TIP_SEL` / `wbPenOnly` / `wbNoteStylus`, or `wbResize`.**
  · `node .claude/test-artefacts.js` — **THE RELIQUARY, the collection banners, and the two colour swaps
    that went with them** (Aug 2026). **Re-run after touching the `THE RELIQUARY` block,
    `artefactPlateHTML` / `openCollectionWin` / `wireReliquary`, `rollChestItem` / `spendChest` /
    `claimTheme` / `unlockTheme` / `themeGrandfather` / `THEME_DROP` / `THEMES` / `ACHIEVEMENTS` /
    `progStats`, `artefacts.js`, `COLLECTION_ICON` / `deckProgMarkup` / `addActive`,
    `serializeArtefacts`, `PAGES.reliquary` / `RELIQ_SORTS` / `artefactYear` / `reliquaryHTML`'s `entry`
    option, or the `--newterm` / `--rar-*` tokens.**
  · `node .claude/test-deck-ux.js` — **49 assertions on six things asked for in Aug 2026, every one of
    which fails silently**: a card type's `<details>` remembering how it was left, the structure line's
    typography, a community deck's colour, the sheet's ×, **the pinyin being set in a face that has the
    third tone**, and **studying past the daily limit staying inside the subdeck**. **Re-run after
    touching `ucRestoreDetails` / `ucDetailsKey` / `ucSetOpen` / the capture `toggle` listener /
    `cardTypeSideHTML` / `deckSheet` / `.dm-x` / `containerHasChildren` / `reviewHue` / `uDeckColorOf`,
    the cram branch in `PAGES.study`, or `deckcore.js`'s `.uc-exst` / `PINYIN_FONT`.**
  · `node .claude/test-glossary-page.js` — the discovered-terms list and the page transition (Aug 2026).
    **Re-run after touching `makePageGhost` / `.page-ghost` / `PAGES.glossary` / `GLOSS_SORTS` /
    `glossSeen`.**
  · `node .claude/test-lang-decks.js` — **the Collections page's Languages section** (Aug 2026), in two
    halves and both for silent failures. **Re-run after touching `langCollectionsHTML` /
    `langCollectionHTML` / `langRowHTML` / `langRowSpecs` / `langNodeSpecs` / `langCollId` /
    `wireLangDecks` / `entryPending` / `langDeckDownload` / `langCatalogById` / `langCatalogNode` / the
    `.dk-pending` row in `PAGES.home` / `cardBytes` / `nodeBytes` / `fmtDeckSize` / `.node-size` /
    `buildNode`'s `nodeSpanHTML` / the `lang-*` rows of `COLL_THEME` / `.claude/build-lang-decks.js`, and
    after adding, rebuilding or removing a deck in `decks/`. Section 4 covers the LANGUAGE HEADER's own
    options sheet, so re-run it after touching `langCtxId` / `langCtxName` / `langCtxEntries` / the
    `.dk-langhead` row and its `data-langhead` wiring / `entryExists` / `entryInfo` / `entryChain` /
    `entryHasSpeech` / `containerHasChildren` / `removeActive` / `openDeckMenu`'s container branch, and
    section 4b the ALLOWANCE rows — re-run it after touching `langCtxLimits` / `langCtxOf` /
    `entrySkippedToday` / `bumpDeckExtra` / `deckLimits` / `entryPiles` / `entryNoun` / the buckets in
    `reviewQueue` / `openDeckLimits` / `openCustomStudy` / `openDeckSched`.**
  · `node .claude/test-reset.js` — **Settings → Danger zone → Reset progress, and who the home page
    thinks you are** (21 assertions, Aug 2026). **Re-run after touching `resetProgress` / `RESET_KEEPS` /
    `PROGRESS_FIELDS` / `emptyProgress`, the home page's `fresh`, or the Settings reset row.**
  · `node .claude/test-library.js` — the Library (333 assertions): the rename, the shelf, one book, and
    the reader's place. **Re-run after touching `PAGES.library` / `PAGES.book` / `BOOKS` / `bookIngest` /
    `bookIntroChapter` / `bookNotesHTML` / `linkProperNounsOnly` / `readingPos` / `setReadingPos` /
    `bookSections` / `bookRows` / `applyLangMode` / `anchorNow` / `slideChapter` / `BOOK_SORTS` /
    `sortDirHTML` / `setBookSort` / `openBookMenu` / `shareBook` / `isBookFav` / `toggleBookFav` /
    `bookQuery` / `bookMatches` / `shelfHTML` / `teiPagedBooks` / `teiDramaDivisions` / `dramaNotes` /
    `dramaText` / `extractShloka` / `splitAlternating` / `markLikiHeads` / `markLikiSections` /
    `applyGlyphs` / `markChapterHead` / `markArticuli` / `extractSukta` / `suktaBody` / `suktaLines` /
    `suktaVerses` / `suktaSanskrit` / `SUKTA_VERSE` / `extractQuixote` / `extractSatyricon` /
    `satyriconSection` / `cutAcrossSections` / `extractRamayan` / `ramSanskrit` / `RAM_BOOKS` /
    `ramSarga` / `extractPtahhotep` / `PTAH_KEYS` / `extractBede` / `bedeChapter` / `bedeLatin` /
    `BEDE_CHAPTERS` / `sanKuoHead` / `sanKuoRoman` / `originalChapter`'s `dropTables` / `extractBoethius`
    / `boethiusLatin` / `boeGreek` / `boePoem` / `BOE_BOOKS` / `markMaloryHeads` / `MALORY_RUBRIC` /
    `MALORY_CHAPTERS` / `dropNotes` / `closeQuotesAt` / `balancedSpan` / `betaGreek` / `cleanBody`'s
    `body: "plain"` slice / `extractCaput` / `extractTerzina` / `terzinaLines` / `terzinaHtml` /
    `teiVerseBooks`' `prose` branch and its two spacing rules / `cardMarks`' `both` sweep / the mid-line
    card lift / `teiVerse`'s `<choice>` resolver / `reconcileCards`' `langName` / `stripTags`'s `data-n`
    carry and its `VOID_TAGS` guard, after running `fetch-book.js`, or after renaming anything on the
    Collections page.**
  · `node .claude/test-account-page.js` — the SIGNED-IN account page and the Edit dashboard's account
    figures (Aug 2026). **Re-run after touching `acctSelfView` / `showcaseHTML` / `openCollectionWin` /
    `adminRenderDashboard` / `dashLoadRemote` / `supaFetch`'s count parsing.**
  · `node .claude/test-card-types.js` — the XP curve, community-deck **card types**, reverse cards,
    **bury siblings** and **one card per cloze** (Aug 2026), 228 assertions in five parts. **Re-run after
    touching the CARD TYPES block, `cardTypeSideHTML` / `ensureCardTypeStyle` / `cardTypeFieldGetter` /
    `.uc-hasfront` / `uCardSanitize` / `uDeckSanitizeMeta` / `typeCards` / `uCardIdFor` / `uDeckStudyIds`
    / `clozeMark` / `clozeOrds` / `clozeOrd` / `CLOZE_RX` / `type.cloze` / `isBuried` / `buryCard` /
    `burySiblings` / `deckBurySiblings` / `entryHasSiblings`, the Studio's Types tab, or `levelFromXP`.**

  **What each suite actually asserts, the bug it was written for, and the harness traps that made a
  first draft report faults that were not there, all live in `docs/tests.md`.**
  📖 **`docs/tests.md` — READ BEFORE WRITING A NEW SUITE, AND WHEN ONE FAILS IN A WAY YOU DO NOT
  RECOGNISE.** Every suite here exists because the failure it guards is silent; that file records
  WHICH silence, and re-deriving one costs a session.

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
  Schema + RLS: `.claude/supabase-schema.sql` (applied; tables `profiles` / `progress` / `friends`, plus the later blocks'
  `user_*` / `deck_*` / `feedback` / `content_overrides` / `review_log`, and — **still to be run once each** —
  **section 11 `user_decks.color`**, **section 12 `login_email()`** and **section 13 `card_stats` +
  `bump_card_grades()`**, the deck's default colour, username sign-in and the community difficulty rating;
  signup trigger creates the
  profile + empty progress row). **A LATER BLOCK IS NEVER A PREREQUISITE**: every feature that needs one
  degrades to a sentence rather than an error (`colorColumnMissing`, the `login_email` 404 → "use your email
  address"), so the site works on a database that has only the first block. **Keep it that way** — a block
  the owner has not run yet is the normal case, not the broken one. **WHICH of the optional blocks a
  given database already has is answered by `.claude/schema-check.sql`** — read-only, pasted into the
  Supabase SQL editor, one true/false row per block. It is worth having because blocks 8–15 are each
  written `if not exists` / `create or replace` / `drop … if exists`, so re-running one that is already
  there is safe and the only real question is which are missing. Plain `fetch()` (no SDK — zero-dependency rule); the publishable key in app.js is safe to ship
  (security = RLS). **Offline-first**: localStorage stays the working copy; `save()` → `supaQueuePush()` (6s debounce, skips
  no-ops) PATCHes the whole `PROGRESS_FIELDS` blob into `progress.data`; boot (`supaBoot`) refreshes the session, pulls, and
  reconciles — server wins when its `updated_at` ≠ the device's `S._supaTs` baseline (another device wrote), else local pushes.
  **`progressBlob()` is what it sends, and that is NOT `extractProgress()`** — the per-review log has a table of its own
  (`review_log`, block 10; see the `revlog` bullet) precisely because this blob is PATCHed whole, so anything that must grow
  without bound belongs beside it rather than in it. `extractProgress()` still includes the log, since the guest stash is a
  whole device state; **if you add a field that grows per review, give it a table and keep it out of PROGRESS_FIELDS.**
  **…AND THE RECONCILE MUST COMPARE THE BLOB IT ACTUALLY SENDS** (Aug 2026, on a bug report that deck settings "won't
  save"). It compared `extractProgress()` against `row.data`, and since the former appends `revlog` while the latter can
  never carry it, **the two could not be equal**: the "in sync, do nothing" branch was unreachable and every signed-in
  boot re-uploaded the whole blob — a wasted upload per launch on exactly the slow links that can least afford one, and
  worse, each push bumps `updated_at`, so for a two-device reader "another device wrote" was true on essentially every
  launch. **The pull is also a NETWORK ROUND TRIP the reader is not waiting for**, and `applyProgress` replaces every
  progress field, `deckOpts` among them — so a reader who pressed Save on a deck's Daily limits while it was in flight
  had the change overwritten the moment the row landed, silently, having just been toasted "Daily limits saved". A slow
  link does not CAUSE that; it only holds the window open long enough to hit every time, which is why it was reported as
  a connectivity fault. The blob is now snapshotted before the wait and compared after it: **a write made in the meantime
  is the newer write and wins outright**, and is pushed rather than merged, so the other device converges on its next
  pull. **An idle device still adopts**, which is the half a guard like this most easily breaks — asserted both ways in
  `test-account-switch.js` section 6.
  **THE ADOPT IS A THREE-WAY MERGE PER FIELD, NOT AN ALL-OR-NOTHING SKIP** — what was local when the pull
  started, what is local now, and what the server holds: a PROGRESS_FIELD the reader did not touch takes the
  server's copy and one they did is theirs. The first cut skipped the adopt outright whenever anything had
  moved, and that is wrong for a reason only visible once `friendCount` joined the blob: **`setFriendCount`
  writes from the friends list**, so a reader sitting on the account page at boot can have a BACKGROUND write
  suppress the adopt and push a stale blob over the other device's — the very fault this closes, through a
  different door. Merging per field needs no list of "fields a reader may edit" and so **cannot rot as more
  background writers arrive**; it is not the arithmetic merge refused above, which was merging WITHIN one field.
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
  non-admin accounts on the live site see no Edit tab. `isAdmin()` additionally honours `S.settings.adminMode === false` →
  visitor view — **but nothing writes that false any more**: the **Editor / Visitor chip was removed from the menu bar in Aug
  2026, on request**, along with the **Project W tab** (both copies, top bar and phone). `.mode-switch` and `setMode` are
  DELETED rather than left unreachable, and `load()` back-fills a stored `adminMode === false` to true, since the chip was the
  only way to set it and its removal would otherwise strand an editor in the visitor view with no control to return with. The
  **route survives**: `PAGES.warofages`, its `PAGE_META` row, `ADMIN_ROUTES` and the `valid` entry are untouched (the request
  was about the menu bar and said "for now", the page is admin-gated, and `test-layout.js`'s cold-load `#warofages` guard needs
  a route to resolve), so putting the tab back is one markup block in `index.html`.
  The old local accounts (`folio_acct_v1`) remain only as legacy code (guest stash helpers); their admin-page
  user-manager went with the Accounts tab when the reader-feedback queue replaced it.
- **SIGNING IN WITH A USERNAME, SWITCHING ACCOUNTS, AND CHANGING YOUR EMAIL (Aug 2026, on request).**
  Three things about the same account, and the first two each needed a decision that is not obvious.
  · **A USERNAME IS RESOLVED BY A PASSWORD-VERIFYING RPC, NEVER BY A LOOKUP** (`supaEmailForUsername` /
    `looksLikeEmail` / `supaSignIn(idOrEmail, pw)`; `public.login_email(uname, pw)` in section 12 of
    `.claude/supabase-schema.sql` — **the user must run it once**). GoTrue signs in with an email, so a
    username has to become one — and the obvious implementation, selecting the email out of `profiles`,
    is an **email-enumeration oracle**: anybody with the publishable key could walk the usernames and
    read off addresses. The RPC is `security definer`, takes the PASSWORD as well as the name, checks it
    with pgcrypto's `crypt()` against `auth.users.encrypted_password`, and returns the address only on a
    match — so it tells a caller nothing they could not have learned by signing in anyway. Wrong password,
    wrong username and no such user are one answer.
    **It degrades rather than breaking**: a 404 (the function not yet created) is turned into "use your
    email address", so a database without section 12 still signs everybody in. The field is
    `type="text" autocomplete="username"` and labelled **Email or username** — `type="email"` would have
    the browser refuse a username before the form was ever submitted.
  · **SWITCHING ACCOUNTS KEEPS THE OTHER TOKEN, WHICH IS WHY IT IS NOT A SIGN-OUT** (`SUPA_ACCTS_KEY` /
    `supaAccounts` / `supaRemember` / `supaForget` / `supaSwitchTo` / `supaSignOut({keepToken})`). GoTrue's
    `/logout` **revokes the refresh token globally**, so signing out and back in is the only way to reach
    another account — which is exactly the friction the request is about. `supaSwitchTo` therefore tears the
    session down LOCALLY, keeping the outgoing account's tokens in `folio_supa_accts_v1` (device-local, like
    the guest stash — never synced, since which accounts this browser remembers is a fact about the browser),
    and installs the incoming one's. **A plain Sign out FORGETS that account**, because its token has just
    been revoked and a remembered row pointing at a dead token would offer a switch that cannot work.
    The progress side needs no new machinery at all: `_supaOwner` already gates the guest-progress migration
    (see the bullet above), so a switch adopts the incoming account's progress and can never carry the
    outgoing one's levels, badges or streak across — which is the failure this feature would otherwise have
    industrialised. `.claude/test-account-switch.js` is what guards it.
  · **THE EMAIL ADDRESS IS SHOWN AND CHANGEABLE** (`supaSetEmail`, `#emPanel` / `#emToggle`). A PATCH to
    `/auth/v1/user`; with confirmations on, Supabase emails the NEW address and the change lands when that
    link is followed, so the panel says so rather than reporting a change that has not happened yet.
    `openPanel(want)` keeps the email, password and switch panels mutually exclusive — three folds open at
    once on a phone is the whole account page.
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
  · **AN OVERLAY DELTA IS KEYED BY ID, SO RENUMBERING IDS SILENTLY REPOINTS EVERY EDIT** (Aug 2026, on a bug
    report: "some cards in the World History collection are getting their background sections mixed up with
    those of other cards"). The key is the ONLY thing joining an edit to its subject, and it lives in a
    Supabase row that no repo operation touches — so the day an id changes meaning, the delta goes on being
    applied and paints its content onto whoever inherited the number. The **2026-08-04 World History
    renumbering** moved 89 cards into their planned slots and left the previous week's live edits on the old
    numbers: seven cards spent the next fortnight showing another card's background, and the mapping was
    exact both ways — old `wh-001` is now `wh-046`, so `wh-001` (Prehistory) served the Paleolithic card's
    prose, while `wh-014` and `wh-017`, which map to themselves in the table, stayed correct. **Nothing threw
    and no count could see it**: the question, answer, date line, difficulty and star rating are all read
    from `data.js` and were right, and only the prose inside the Background fold was wrong — which is why it
    took a reader to notice. **Renumber the overlay in the same pass as the cards, or clear it**;
    `docs/world-history-card-plan.md` holds the old→new table.
    **AND THE SAME ROW ACCUMULATES DAMAGE NOBODY IS WATCHING.** Audited at the same time, that overlay was
    also **deleting `col-41` and `col-42`** — the live United States and Russia collections, gone from the
    Collections page for every visitor — re-creating decks retired in the same replan, **shadowing the fixed
    1900 map** with the pre-fix one (no Ottoman Empire, no Greece; see `build-era.js`'s `SUP_MIN`), and
    carrying eleven further timeline eras byte-identical to the shipped ones as dead weight. Of 4 MB, three
    things were worth keeping. **`node .claude/check-overlay.js` is the audit** — it reads the live row
    against the shipped files and reports a delta whose prose belongs to another card, a delta pointing at a
    dead id, a live collection the overlay deletes, timeline eras that differ, footnote markers or licence
    attributions an edit has dropped, and what the row costs every visitor. **Run it after any renumbering
    and after baking.**
    · **A CONTENTEDITABLE ROUND TRIP IS NOT LOSSLESS, and what it drops is the apparatus.** Several edits in
      that row had lost **every** `<sup class="fn">` marker while the prose stayed word-for-word identical
      (both artefacts, four glossary descriptions, one abstract) — so the citations were still listed and
      nothing pointed at them, which `add-sources.js` refuses and no render-time check can see. Others moved
      a space inside the opening `<b>` (`The<b> Minoan`), dropped an image's `alt`, or dropped the licence
      line out of a picture's `desc` — losing a required CC BY-SA attribution. Ordinary typing is safe
      (verified in a browser); it is select-all, paste and heavy restructuring that strip them. **Check the
      marker count after editing prose that carries citations**, which is what `check-overlay.js` does.
