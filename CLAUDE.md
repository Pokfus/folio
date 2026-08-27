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
**That path is 5.90 MB raw / 1.65 MB gzipped** (re-measured 2026-08-10 after `whatyear.js` joined it, which
cost 14 KB raw / 6 KB gzipped; it was 5.84 MB / 1.61 MB after the picture pass of 2026-08-09 and
4.9 MB / 1.35 MB the day before that, and it said "~1.4 MB" for months while being five times out of
date, so **re-measure it rather than quoting it**). The picture pass added ~555 KB raw / ~270 KB gzipped, and that is
metadata only — a picture is a LINK, never an upload, exactly as an artefact's is, so 1,230 illustrations
cost a few hundred bytes each and the files themselves are fetched only by a reader who reaches the card.
**THE CARD TRANSLATIONS WERE REMOVED ON 2026-08-08, on request**, and that is where the drop came from: the
path was 7.5 MB raw / 2.4 MB gzipped, and **58% of `data.js` (2.06 MB) was the `i18n` blocks of 89 cards**,
which `MULTILANG = false` meant no reader could reach — the `quotes.js` mistake (27 KB → 312 KB for every
visitor) at seven times the scale. `data.js` went 4.32 MB → 1.64 MB and every visitor now downloads ~1 MB
less gzipped. `glossary.js` is 1.15 MB, of which `GLOSSARY_SOURCES` is 479 KB (42%) and is only read once a
popup opens — the largest remaining candidate, and the weakest of them, since popups are common.
**Nothing re-adds a translation by accident**: `add-card.js` and `add-glossary.js` now DROP a supplied
`i18n` / `translations` block with a warning, and `test-i18n-lang.js` fails if any card carries one or any
`i18n/gloss-<lang>.js` reappears.

**Everything else is LAZY**, injected on demand by `DATA_BUNDLES` / `ensureData(name)` in app.js (see the
"Lazy data bundles" bullet under "How the app is wired"). Before this split every visitor downloaded ~11.3 MB
of blocking JS to flip a card; the Atlas layers and the translation tables are ~9.9 MB of that.

| bundle | files | loaded when |
|---|---|---|
| `world` | `world.js` | the Atlas mounts; the home page's mini globe (at idle); the Settings home picker |
| `atlas` | `uk` `lakes` `rivers` `water` `cities` `timeline` `countries` `country-stats` `country-spans` `country-years` `country-sources` | the Atlas mounts |
| `usstates` | `us-states.js` | a MAP CARD is rendered (the Geography collection). Deliberately its own bundle rather than part of `atlas`: the Atlas never draws states, and a geography card never needs the timeline, the era maps or the city index — folding them together would make each pay the other's ~9.9 MB / 600 KB for nothing |
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
- `styles.css` (~235 KB) — editorial design system; **6 themes** via CSS custom properties (`THEMES` in
  app.js — folio, synth, arcade, academy, marble, gazette; this line said 8 for months, after clay and
  garden were removed with the other retired themes, so **read `THEMES` rather than quoting it**).
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
  every congressional bioguide address), **`senate.gov` serves its 404 page with a 200 status**, and
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
  the day and study deep links, and the collection sits under Collections rather than Coming soon. Its
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
  counts, and reports both rules with an `EXEMPT` list for cards whose answer term IS modern. Not part of the site.
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
  prevents it, and the cure is to splice the changed line into the old text).
  Not part of the site.
- `.claude/add-card-difficulty.js` — writes `card.difficulty`, the 1–5 rating of how well known a card's
  ANSWER TERM is, in batches: `node .claude/add-card-difficulty.js <batch.json>` over
  `{ "cards": { "wh-001": 1, … } }`. It validates the WHOLE batch before writing anything (a half-applied
  batch is worse than a refused one), reads `GAME_MAX_DIFFICULTY` out of app.js rather than restating it, and
  reports coverage and the resulting minigame pool on every run. It is the BATCH tool for cards already
  shipped; a NEW card carries its own rating and `add-card.js` refuses one without it, so the corpus cannot
  quietly regrow an unrated tail. The scale is in its header and under "Generating cards" below — keep the
  three copies in step. Not part of the site.
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
  `render()` also **detaches the outgoing page's keyboard handler** (`detachKeys`). `attachKeys` already
  detached the previous one, so two pages could never both be listening — but a page with no shortcuts of its
  own attaches nothing, and the last handler stayed live over it: pressing Space on the Library after a study
  session ran that session's `showAnswer()` against a page that no longer existed. It mutated a detached tree,
  so nothing looked wrong and nothing was reported (found when the page ghost below stopped ids resolving in
  the dead copy). A page that wants keys re-attaches when its own render runs, which is after this.
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
  see the per-deck-limits bullet above.) The dot and the ancestor rows' hollow `.dk-branch` went together — the branch existed only to line the two up,
  and alone it would have pushed every parent title 21px right of the deck beneath it; the `data-depth` indent carries
  the hierarchy. The bar's label also replaced the `.dk-count` "N cards" chip, which stated the same total twice.
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
    a bar**: the unit is a DAY, and a continuous fill would suggest a part-finished one. **A CHEST SITS AT
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
    **A LOCKED THEME'S BUTTON IS PRESSABLE, NOT `disabled`** — Chrome fires no mouse events at all on a
    disabled button, so the hover try-on would be taken away from exactly the themes that most need
    advertising. `setTheme` is the gate (it refuses a locked id outright), and the click toasts the reason;
    the picker marks the row with a dashed border, a desaturated mock and a padlock, and its tag reads
    "From a chest" where an owned one reads **the day it was unlocked** (`themeUnlockedOn` /
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
- **Daily review order** (`S.settings.reviewRandom`): **Ordered** (labelled "Chrono" until Aug 2026, renamed on
  request — the old key is retired from all nine language tables) presents cards in their in-deck order;
  **Random** shuffles the session order. The **draw** of the day's new cards is date-seeded-random across the decks in BOTH
  modes now (see the next bullet) — the setting decides presentation order only.
  **THERE ARE THREE ORDERS SINCE AUG 2026, AND ORDERED NO LONGER MEANS "EVERY REVIEW FIRST"** (`DECK_ORDERS` /
  `deckOrderMode` / `setDeckOrderMode` / `mixPiles` / `orderPile` / `deckByDifficulty` / `sortByDifficulty` /
  `cardDifficultyRank`, on request). **Ordered**, **Random** and **By difficulty** (easiest first, on
  `cardDifficultyShown` — so a card with enough answers is ranked by how hard readers actually found it and one
  without by how obscure its answer term is).
  **IT IS REACHED BY A CYCLER, NOT A SWITCH** (`cyRow` / `.dm-cycle` / `.dm-cyval` / `DECK_ORDER_LABEL` /
  `DECK_ORDER_NOTE`, Aug 2026, on request). The data layer shipped a batch ahead of the control, which
  this file recorded as a warning at the time — a setter nothing calls being the next person's bug — and
  the control is what closes it. **A switch cannot express three answers**, so the row states the order
  currently in force and steps to the next on a press, wrapping; its `small` line says what that order
  DOES rather than what the next one would do, so it reads as a sentence in whichever of the three
  positions it is in. Three things about the shape carry over from the switch beside it and one does not.
  It is a `<div>` carrying `role="button"` (the row is the target, and a control inside a button is
  invalid); pressing it must NOT close the sheet and must NOT repaint, since `render()` closes this very
  sheet through `closeDeckMenu`; and it is **excluded from the generic command selector** in
  `openDeckMenu`'s click handler, or one press would step the order and then run the sheet's ordinary
  dismiss-and-act path on top of it. What does not carry over is that a cycler cannot be answered by a
  keyboard's Space alone the way a `role="switch"` can — it takes Enter and Space through the row, which
  is what `role="button"` buys, and there is deliberately no arrow-key handling, three values in a ring
  having no "up". **`test-review-decks.js` pins the sheet's row list EXACTLY**, so the cycler was an
  assertion change as well as a UI one, and it asserts the full ring (Ordered → Random → By difficulty
  → Ordered) with the store read back at each step rather than only that the label moved. Three things
  about the ORDERS themselves are load-bearing.
  **`mixPiles(due, fresh)` INTERLEAVES THE TWO PILES IN EVERY BRANCH**, weighted by what is left of each and
  preserving both piles' own order, because a session that deals every due card and then every new one is two
  sessions rather than one — and on a large deck the new cards, which are the reason a reader added it, arrive
  after forty reviews or not at all. It replaces the bare `[...due, ...fresh]` in all five `buildSession` branches
  and in the review's own queue, so a deck studied from its row and the same deck studied from the pooled review
  cannot come to disagree about what a session looks like.
  **AND `setDeckOrderMode` IS NAMED THAT WAY BECAUSE `setDeckOrder` WAS ALREADY TAKEN** — it is the DRAG order
  setter (`setDeckOrder(parentKey, ids)`, writing `S.deckOrder`), and a second `function setDeckOrder` at the same
  scope wins for the whole scope, silently: the drag setter simply stopped existing and a reader's arrangement of
  their own deck list stopped being saved, with nothing thrown and the rows still moving under the finger.
  `test-review-decks.js` section 8 is what caught it. **A duplicate function declaration at module scope is
  invisible** — sweep for one when a working feature stops working for no reason a diff explains.
  **IT IS PER ENTRY, LIKE QUESTION VARIETY AND THE DAILY LIMITS** (`deckRandom` / `deckOrderMode` /
  `setDeckOrderMode`, Aug 2026, on request: the switch appeared on the review banner's sheet alone, so a
  deck held on its own row had no way to ask for a shuffled session). `S.deckOpts[id].order` where the
  reader has chosen on that deck, the older `S.deckOpts[id].random` boolean read as a fallback beside it,
  and `S.settings.reviewOrder` / `reviewRandom` as the default everywhere else, so **nothing migrates**.
  **`setDeckRandom` is RETIRED** — `deckRandom` is now derived from `deckOrderMode`, so one function decides
  which of the three orders is in force and the two shuffles in `buildSession` cannot come to disagree with
  the control that set it. Two things are decisions rather than plumbing. **The REVIEW writes the GLOBAL rather than a per-entry flag** — Settings → Random review
  order shows that value, and giving the review a private copy would leave two controls disagreeing about the
  pooled session with nothing on either page to say which was in force (this is where it differs from
  `deckVariety`, whose review flag is per-entry because Settings has no switch for it). And **`buildSession`
  shuffles the DECK and UDECK branches too**: those queues were never shuffled at all, so without that the
  switch would appear on a deck's sheet and do nothing — the piles are chosen first and shuffled after, so the
  setting decides presentation order and never which cards the day's allowances let through.
  **It is chosen by HOLDING THE BANNER** (`openReviewMenu` → `openDeckMenu(REVIEW_ENTRY)`, Aug 2026, on request),
  plus the Settings page's own "Random review order" switch. **The banner's sheet IS the deck sheet now** (Aug 2026,
  on request: "the same menu, without the delete option"): Custom study, Daily limits and Skip today above it, no
  Remove — there is nothing to take the review out OF. It was a `.review-order` pill absolutely positioned in the banner's top-right
  corner: a permanent control, in the corner of the one block on the home page that has something to say, for a
  setting almost nobody changes twice. The sheet is the same `deckSheet` shell the deck rows use one level down,
  so the gesture is the same one step up the hierarchy.
  **IT IS A SWITCH, NOT A PAIR OF ROWS** (`swRow` / `.dm-switch`, Aug 2026, on request). It was two
  `.dm-choice` rows one of which carried a tick — two rows for one bit of state, and on a phone a third of
  the sheet spent saying what one line says. The row's LABEL under the title states what the switch is
  currently doing rather than what it could be changed to, so it reads as a sentence in both positions.
  Three things about the shape are load-bearing and apply to **question variety** beside it too: the row is
  a `<div>` (it CONTAINS a `role="switch"`, and a control inside a button is invalid and unreachable by
  keyboard); a click anywhere on the row throws it, while the switch itself takes the tab stop and the
  keys; and **throwing one must NOT close the sheet and must NOT repaint** — `render()` closes this very
  sheet through `closeDeckMenu`, so a switch that repainted would dismiss itself on every flip, and there
  is nothing on the page behind that either setting changes (both decide what a SESSION deals out).
  `.dm-choice` survives for the book shelf's own favourite row. **The long-press wiring is `wireHoldMenu(el, onHold, onTap)`** (beside
  `openDeckMenu`), shared with the deck rows. Its one subtlety: the click that follows a hold is swallowed by a
  **document-level CAPTURE listener** keyed off `_holdUntil`, not by a flag the element's own handler checks —
  the banner already had a click listener before this ran, and listener order on one element is registration
  order, so an element-level guard registered second would fire after the very handler it exists to stop.
- **PER-DECK DAILY LIMITS, and a review pooled from all of them (Aug 2026, on request).** There used to be ONE global
  allowance (`S.settings.newPerDay`) sliced off the front of the pooled card list, so a reader with two decks got every
  new card from whichever came first and never saw the second deck at all. That was the bug; per-deck allowances are
  the fix, and the shape is Anki's.
  · **`deckLimits(id)`** → `{ newPerDay, maxReviews, newIgnoresReview }`, stored in **`S.deckOpts`** keyed by the same
    entry id as `S.active` and written only for decks the reader has actually changed — an absent deck follows
    `S.settings.newPerDay`, exactly as before. **`DECK_MAX_REVIEWS` is 50** (Aug 2026, on request; it was
    Anki's own 200) — a view about what a day's studying should feel like rather than a technical bound, and
    a DEFAULT only: a deck or the review can still be set as high as anybody likes in its own Daily limits
    sheet, and a reader who has already chosen one keeps it, `deckLimits` reading the constant only where
    nothing has been chosen.
  · **`S.deckDay`** holds TODAY only — `{ d, extra, skip }`, the Custom-study bump and "Skip today" — and resets in
    place, dropping every other stale record with it, so the table can never outgrow the decks in use.
  · **The COUNTS are DERIVED, never tallied** (`deckDoneToday`). `grade()` writes **`c.first`** — the day a card was
    introduced — onto the card record, and every per-deck new count is read back off it. That is what makes the
    figures right for a deck that is not in the review, right after an undo, and right for a card sitting in two decks
    at once; a per-deck tally would have to be kept in step with all three by hand.
  · **`reviewQueue` now builds deck by deck and then pools**: each entry offers its due cards up to
    `deckReviewRemaining` and its unseen cards up to `deckNewRemaining`, the new ones are **date-seeded-shuffled across
    the decks** and sliced to `newRemainingToday()`. Dedupe happens BEFORE the slice, or a card an earlier deck already
    claimed eats one of this deck's places. So with two decks at 5/day the review draws 5 in all — say 3 and 2 — and
    each row then shows the 2 and 3 that deck still has of its own, which is exactly what a reader sees under a
    cleared banner and is correct rather than a bug.
  · **…and the REVIEW ITSELF is an entry, under `REVIEW_ENTRY` (`"review:all"`)** — Aug 2026, on a bug report. It is
    Anki's parent deck: it pools what its decks offer and caps the pool, and it had no settings of its own, so the cap
    came from Settings → New cards per day while each deck's came from its own sheet. Two decks at five a day pooled
    ten and then handed back three — a figure no deck had agreed to, and nothing on the page explained it.
    `deckLimits` / `deckDoneToday` / `deckNewRemaining` / `deckDay` / `entryCardIds` / `entryInfo` and the long-press
    sheet all answer for that id as they do for a deck, which is what makes the banner and the rows under it
    arithmetically incapable of disagreeing. Two things about it are decisions rather than plumbing.
    **Its DEFAULT new-card limit is the LARGEST any added deck offers** (`reviewLimits`), not the global number: a
    pooled view must not impose a figure none of the things it pools has agreed to. An explicit limit set in its own
    sheet wins outright, exactly as a parent deck's does in Anki, and the **"All decks" tab of the Daily limits
    dialog** — which is where Settings → New cards per day moved to in Aug 2026 — remains what a DECK follows until
    it is given limits of its own. **And `newRemainingToday()` is now `deckNewRemaining(REVIEW_ENTRY)`,
    derived from the card records** — it used to read `S.intro.count`, a running tally `grade()` increments on ANY
    card's first grade, so a Card of the day or a deck tapped into directly silently ate the review's allowance and an
    undo did not give it back. The decks' counts were derived all along; the banner above them was not, and the two
    drifted apart. `S.intro` is still written and still rides in the synced blob; nothing reads it for a limit.
  · **STUDYING AHEAD IS THE ENTRY'S PILE, ORDERED, AND WARMED** (the `queue.length === 0` branch in
    `PAGES.study`; Aug 2026, on a bug report: "when I keep studying beyond the daily limit it stops showing
    both directions and becomes one directional again", and "it shows in the top right how many cards are
    remaining in that entire collection instead of that specific subdeck"). **Both symptoms were one fault**,
    and a third and worse one was underneath.
    The ahead pile was built from `subtreeCardIds(sd)` / `uDeckStudyIds(ud.cardIds)` — the whole tree and the
    whole deck — where every other queue in the session is `studyOrder(entry, entryCardIds(entry))`. So it
    reached past the subdeck or direction actually being studied (the count, which is `remainingCounts()`
    over the queue and so was never a second bug), and it skipped `studyOrder`, which is what interleaves the
    subdecks and what pulls a note's two cards together under "both directions together" — the raw expansion
    is TEMPLATE-MAJOR, so the pile was every forward card before any reverse. Reproduced exactly: a subdeck of
    6 offered "Study 14 ahead" and dealt `2f 3f 4f 5f 6f 7f`. It takes the same `availStudy` and `isBuried`
    filters as `buildSession`'s two branches, and the placard quotes **this entry's** allowance rather than
    the global default.
    **AND THE PILE IS WARMED BEFORE IT IS DEALT**, which is the one a reader would report first and which
    predates the rest: a community deck's cards are loaded per note when needed, the session warms its own
    queue behind a `.data-loading` line, and this pile is assembled AFTER that — so every card in it was a
    stub and **rendered BLANK, with a working grade bar under it**. Nothing threw and every count was right.
    Found by the test written for the scope fix, not by looking.
  · **A deck's row wears its COLLECTION's hue**, not the review's bronze (Aug 2026, on request): `rowHue` in
    `PAGES.home` walks up to the root collection and sets `--coll-bg` from `COLL_THEME` — the same colour the
    Library banner uses — and the row's wash, left bar and hover all read it, falling back to the bronze for a
    community deck or the Card-of-the-day list, which belong to no collection.
    **…AT THE BANNER'S OWN STRENGTH, which it was not for a fortnight** (Aug 2026, on request). The hue was
    right from the start and the MIX was half of it — 14% by day and 9% at night against the banner's 30% and
    22% — and a colour at half strength does not read as a paler version of itself, it reads as another
    colour, which is the whole of what was reported. `.active-deck` now writes the same 105deg wash at the
    same percentages fading at the same 64%, so a row's gradient start is byte-identical to its collection
    banner's (measured: World History `srgb 0.862 0.828 0.774` by day and `0.235 0.210 0.189` at night, on
    both). **Keep the four figures in step with `body[data-theme="folio"] .collection-deco` and its `.night`
    pair** — the two rules exist to say one thing, and nothing enforces it. The other themes' banners are not
    a plain wash at all (arcade dithers, academy sets a side band, gazette hatches) and are deliberately NOT
    matched: a row is 46px of `var(--ink)` text and a saturated banner gradient under it would be unreadable.
    **A CONTEXT ROW NEEDED ITS OWN NIGHT RULE**, found while making that change and fixed with it:
    `body.night .active-deck` is (0,2,1) against `.active-deck.context`'s (0,2,0), so source order never came
    into it and on every dark theme an ancestor signpost row silently lost both its wash and the `--paper-2`
    under it and rendered as an added deck's row. What marks a context row is the paper and the quieter title,
    never a weaker hue — it names the very collection its children are washed in.
  · **A pile at ZERO is grey** (`.dkc-zero` on a row, `.stat-zero` on the banner, Aug 2026, on request): the
    colour means "there is work of this kind here", so it has nothing to say on a 0.
  · **`entryPiles(id)`** is what a deck's row shows, and it is deliberately NOT that deck's share of the pooled review.
    `buildSession` uses the same per-deck allowances for a `deck` / `udeck` scope, so tapping a row studies what its
    row promised.
  · **THE ROWS ARE DRAGGED INTO THE READER'S OWN ORDER** (`S.deckOrder` / `orderedIds` / `setDeckOrder` /
    `setupDeckDrag` / `.dk-grip`, Aug 2026, on request — Anki lets a reader arrange their deck list, and this
    is the same thing done by dragging). The list is built from the collection tree, so until now its order
    was the editorial one; a reader working through four collections at once has their own idea of which
    belongs at the top. Seven things are decisions rather than plumbing.
    **THE ORDER IS PER LEVEL, keyed by PARENT** (`""` for the top level), so an arrangement is scoped to
    where it was made: dragging one subdeck above another says nothing about where its collection sits.
    **THE TOP LEVEL IS ONE RUN** — the collections, the reader's own community decks and the Card-of-the-day
    list used to be three blocks appended in a fixed order, so a community deck could never sit above a
    collection and the two tail rows could not be moved at all; they are one ordered level now, and the tail
    rows are ordinary rows in the build rather than markup pasted on the end. **NOTHING ELSE READS IT**: the
    Collections page keeps the editorial order (it is the shelf every reader shares, and one reader's study
    habits rearranging it would make it a different page for each of them), and the scheduler does not read
    it either — the day's new cards are drawn at random across the added decks, so a row's position says how
    the reader wants to LOOK at their study, not what it deals them.
    **A ROW BRINGS ITS SUBTREE**: a collection's row is followed in the DOM by every deck under it, so what
    moves is a contiguous BLOCK — the row plus every following row of greater depth, folded ones included, or
    a shut collection would leave its children behind. **IT MOVES AMONG ITS SIBLINGS, AND — SINCE GROUPS
    (Aug 2026, on request) — INTO ANY CONTAINER**: the note that used to stand here said re-parenting was
    deliberately not on offer, because a subdeck dragged under another collection would carry cards that
    collection does not contain and its indent, its hue and its counts would all then be lying. The request
    reversed the policy, and the "lying" half of it is answered rather than accepted — see the GROUPS
    bullet: a container counts what is drawn UNDER it, so a branch dragged out of a collection stops being
    counted by it.
    **THE HANDLE TAKES THE PRESS OUT OF THE ROW'S OWN HANDS** — the row is a tap (study this deck) and a hold
    (its options sheet), so the grip stops its pointerdown and swallows the click that follows, exactly as
    the fold chevron beside it does — and it is a real `<button>` answering to ↑/↓, because a reorder
    reachable by pointer alone is one a keyboard reader simply has not got. It is drawn wherever the LIST
    holds a second row — it used to be wherever a LEVEL did, which is too narrow now that the only row in
    its level can still be dropped into a group — and it sits ABSOLUTELY in the row's left padding rather
    than taking a column: the base indent went 16px → 22px to make room, because at 390px the deck's NAME is
    the only part of the row with a shorter form and a handle in the line would have been paid for out of it.
    **AND THE ROW'S OWN `pageIn` ANIMATION HAS TO GO before it can be moved** — `both`-filled, so its last
    keyframe (`transform:none`) outranks an inline style and `deckSetY` would be silently ignored, leaving a
    row that does not follow the finger while the list around it FLIPs perfectly (a script animation wins,
    which is why only the carried row would have been stuck). This file's third instance of that trap, after
    `.bk-page` and `gbSetCompact`.
    `S.deckOrder` is in `defaultState` AND `PROGRESS_FIELDS` — an arrangement is a fact about the reader, so
    the list a phone shows is the list the laptop shows. Guarded by `test-review-decks.js` section 8.
  · **GROUPS — the reader's own containers in the review list** (`S.deckGroups` / `S.deckNest`, `GROUP_PREFIX`
    / `isGroupId` / `groupCreate` / `groupDelete` / `groupTitle` / `groupColor` / `setNestParent` /
    `nestChildren` / `nestForget` / `nestWouldLoop` / `repaintReviewHues`; `.deck-group` / `.dk-into` /
    `.rv-foot` / `.dm-swatch` in styles.css. Aug 2026, on request). A group holds decks dragged into it,
    folds with a chevron, can be renamed, can be given a colour every deck inside takes, and studies
    everything under it.
    **⚠ NO NEW GROUP CAN BE MADE — THE FUNCTION WAS REMOVED FROM THE DAILY STUDY BLOCK** (Aug 2026, on
    request: "remove the group function from the daily study/active decks banner"). "+ New group" stood
    inside the banner, then at the bottom left of the DECK LIST for a fortnight, and is now gone along with
    `promptNewGroup`, `.rv-tools` and `.rv-newgroup`; `.rv-foot` survives, carrying the day's timer
    (`.rv-time`) alone at the left end it vacated — and is now drawn only once there is a time to report,
    the Collections button having left that row for a place of its own under the whole group.
    **WHAT DELIBERATELY STAYS is everything a reader who ALREADY made one needs**: the group row in the
    list, its hue, dragging a deck in, and Rename / Colour / Ungroup in its own options sheet. Deleting
    that code would leave such a reader a container on their home page that nothing could open — and there
    is no dead UI in keeping it, because a group row exists only where a group does and nobody can make a
    new one. If the stored groups should be dissolved too, that is a second decision and has not been
    taken. **The rest of this bullet describes a feature that can no longer be created**, and is kept
    because it still runs for anyone holding a group. **AN ADDED
    COLLECTION IS ONE TOO** — that is the request's own reasoning and it decided the shape of the rest: a
    collection holds no cards itself, only the decks inside it do, so a root collection with rows under it is
    drawn as a group header rather than as a deck row.
    Nine things are decisions rather than plumbing.
    **A GROUP IS NOT IN `S.active`.** It has no cards of its own, so putting it there would make `reviewQueue`
    offer its members' cards a second time under the GROUP's allowance as well as each member's — deduped to
    the same set, but drawn against the wrong limits. It is a display-and-scope construct; the decks inside it
    are what the daily review iterates, exactly as before, so a group can be made, filled and taken apart
    without the review's arithmetic moving at all.
    **A CONTAINER COUNTS WHAT IS DRAWN UNDER IT, which is what answers the old "its counts would be lying"
    objection.** `entryCardIds` on a tree node walks its subtree MINUS any branch dragged out from under it,
    and adds whatever has been dragged in — so a collection that has lost two decks to a group stops claiming
    their cards, and the two rows do not both offer the reader the same five new cards. Nothing is lost from
    the review: the deck dragged away is still in `S.active` and still offers its own cards on its own
    account. `buildSession`'s deck branch and `entryInfo` read `entryCardIds` for the same reason — **a row,
    its sheet and the session it starts must all be counting one thing.**
    **THE ID CARRIES A COLON** (`g:`), like `COTD_ENTRY` and `REVIEW_ENTRY`, so it can never collide with a
    node id (plain slugs) or with the `u:` of one of the reader's own decks.
    **`deckGroups` IS KEYED BY CONTAINER, NOT BY GROUP.** A colour set on an added collection has to live
    somewhere, and a second register for tree nodes would be two lookups and two chances to forget one: a
    record with a `title` is a group the reader made, a record with only a `color` is an override on
    something the tree already names.
    **THE HUE IS INHERITED DOWN THE CONTAINER CHAIN** rather than looked up per row — that is the whole of
    "changes the colour of all decks inside it" — and **only the header is darkened** (38% against the rows'
    30%, with its own `body.night` pair at 28%, which `.active-deck.context` already had to learn: `body.night
    .active-deck` is (0,2,1) and outranks a (0,2,0) rule whatever the source order). It was 52% / 40% and
    came down on request (Aug 2026): the three pile counts sit at the LEFT of the header, in the darkest end
    of the gradient, and at that strength they were hard to read.
    **A HEADER IS SET AND FURNISHED LIKE THE ROWS UNDER IT** (Aug 2026, on request). Its title used to take
    `--display` two sizes down, bolder, letterspaced and in capitals, and it carried a small mono `.dg-count`
    ("N cards") where a deck row carries its progress bar. Both are gone: `.active-deck .dk-title` answers for
    the header too, and it draws `adProg` like everything else on the list, so a header and its decks no
    longer answer the same question two different ways. What still marks it as a header is the wash above and
    the indent of the rows below. `adProg` gained `data-total` / `data-studied` with it — nothing renders
    them, but a percentage alone cannot say how many cards a row counts, which is exactly what has to be
    readable when a deck is dragged from one container into another (`test-review-decks` reads them).
    **THE MIDDLE OF A ROW MEANS "INSIDE", THE EDGES MEAN "BESIDE"** (`dropTargetAt`, `DROP_EDGE` 0.34). One
    gesture does both "drag a deck into a group" and "drop a deck on another deck to make it a subdeck", and
    without that split there would be nowhere left to aim between two rows. Positions are read from the
    LAYOUT, never the paint, for the reason the reorder is — and `elementFromPoint` is no use, since
    `.dk-reordering` takes the rows out of hit-testing. A drop into a container goes through `render()`
    (depth, indent, hue and fold are all derived at build time) where a reorder does not, and the container
    is opened first or the deck reads as having been swallowed.
    **…AND A NESTING IS SIDEWAYS WHERE A REORDER IS VERTICAL** (`NEST_DX` 28, Aug 2026, on a bug report from
    a phone: "when I try to drag active collections to reorder them, they disappear"). The middle band alone
    cannot tell the two apart, and on a phone it decides against the reader: a row is 46px, so the band is
    about fifteen of them, and a thumb travelling straight down to move a collection two places lands in one
    about a third of the time. Reproduced with real touch at 390×844 — **an 88px drag, less than two rows,
    filed a whole collection inside its neighbour**, eleven rows down and indented under a 43-row subtree;
    nothing was lost and nothing threw, and from the top of the list, where the reader was looking, it was
    simply gone. The pointer must now ALSO have travelled `NEST_DX` in the writing direction from where the
    grip was taken — the outline-editor convention (drag right to indent), which a straight-down drag can
    never satisfy. It stays discoverable because `.dk-into` lights the row the moment the threshold is met,
    and it costs the deliberate gesture nothing: the grip sits in the row's left padding, so a drop aimed at
    another row's middle is a rightward move already. Guarded by `test-review-decks.js` section 8, whose new
    assertion is that a straight-down drag leaves `deckNest` EMPTY — the one place the fault would show.
    **A DESCENDANT CANNOT BE A DROP TARGET, and it is the BLOCK that says so** rather than a tree walk:
    `blockOf` is the row plus every following row of greater depth, folded ones included, so a collection's
    whole subtree is skipped when the collection itself is being carried. `nestWouldLoop` is the belt to that
    braces, for a cycle that could only arrive out of an older save or two devices reconciling — and
    `entryCardIds` / `nestDescendants` / `adChainVisible` all carry a guard for the same reason: a cycle must
    draw a wrong list, never hang the page.
    **THE FOLD NOW WALKS THE CONTAINER CHAIN, NOT THE TREE** (`adChainVisible`, and `adSyncFold` reading
    `data-parent`/`data-drag` off the DOM). It used to walk `node.parentId`, which stopped being the whole
    answer the moment a row could be drawn somewhere the tree does not put it. A group seeds OPEN where an
    added collection seeds shut: the reader has just built it and put things in it.
    **UNGROUP DISSOLVES, IT DOES NOT DELETE.** The members are freed to the level the group stood at, keeping
    the order they had inside it — losing a deck because you tidied a container away is the one outcome a
    grouping feature must never produce — and `removeActive` re-homes a container's children one level up for
    the same reason, since a child whose container is no longer drawn would be in the review and invisible.
    **THE COLOUR SWATCHES REPAINT IN PLACE** (`repaintReviewHues`): the sheet is where a colour is chosen and
    `render()` closes that sheet, so repainting the ordinary way would dismiss the very control the reader is
    using to compare two colours. Both registers are in `defaultState`, `PROGRESS_FIELDS` **and
    `RESET_KEEPS`** — a group is how the reader has arranged the decks `active` already keeps.
    **AND SINCE AUG 2026, ON REQUEST, EVERY ROW IN THE LIST IS OFFERED A COLOUR — INCLUDING THE BANNER**
    (`containerHasChildren` / `reviewHue`). It was offered on a container alone (a group, an added
    collection, the whole-deck row of an imported deck) and the gate is **gone**: a subdeck, a curated deck
    inside a collection and the daily study banner itself all take one now. **Almost nothing had to change,
    and that is the thing to know before reaching further in** — `emit` and `repaintReviewHues` already read
    `groupColor(id)` for any row whatever, and `S.deckGroups` has always been keyed by ENTRY ID rather than
    by group, so every row was colourable in every respect except being asked. `isContainerEntry` is
    **deleted**, not left unreachable; `containerHasChildren` survives only to word the row's own note,
    since "every deck inside" is a promise a deck with no subdecks cannot keep.
    **THE BANNER IS `REVIEW_ENTRY`, WHICH IS WHAT MAKES IT FREE**: the pooled review has been an entry with
    a sheet of its own since the per-deck limits landed, so it stores its colour in the same register as
    everything else. `reviewHue()` is `groupColor(REVIEW_ENTRY) || dayHue()` — a chosen colour wins and, with
    none chosen, the **day hue still turns over every morning**, which is the behaviour a reader who never
    opens that sheet keeps. It is set inline on the banner element by the two markup sites AND by
    `repaintReviewHues`, which must reach `#b-review` explicitly: the banner is not a `.active-deck` row, so
    the sweep over those rows cannot see it and the swatch would answer for every deck but the one whose
    sheet it was opened from.
    **A COMMUNITY DECK MAY ALSO SHIP WITH A COLOUR ITS AUTHOR CHOSE** (`deck.color` / `uDeckSetColor` /
    `uDeckColorOf`, same request; the Studio's Deck details). It is the deck's DEFAULT, not the reader's
    choice: `emit` reads `groupColor(id) || hue || uDeckColorOf(id)`, so a colour set on the row always wins
    and a fresh install simply arrives wearing the author's. It rides in `UDECK_META_KEYS`, so the export
    file, the import and the fork carry it with no plumbing of its own, and `uDeckSanitizeMeta` holds it to
    a six-digit hex — a colour from a stranger's file is set as a custom property and read by the stylesheet,
    so anything else is a value the page would have to make sense of.
    **PUBLISHING IT NEEDS SECTION 11 OF THE SCHEMA AND DOES NOT WAIT FOR IT** (`colorColumnMissing` /
    `colorColumnMsg`). `user_decks.color` is one `alter table … add column if not exists`, and until it is
    run PostgREST answers PGRST204 — so `uDeckPublish` **retries once without the colour** and returns a
    `warn` the Studio toasts, which is the card-types column's own pattern (an ADMIN gets a different
    sentence naming the block to run, being the one person who can clear it). A deck therefore publishes
    from an un-migrated database and simply arrives in the generic indigo.
  · **A SHEET IS NOT LIVE THE INSTANT IT APPEARS** (`DECK_SHEET_ARM_MS`, Aug 2026, on a bug report: "when
    the long-press menu loads, I sometimes accidentally immediately press a menu item"). A hold opens the
    sheet UNDER the finger that is still down, so the lift that ends the gesture lands on whichever row
    happens to be beneath it and fires it — a Remove or a Skip today the reader never chose. **The
    document-level capture guard that swallows the click after a hold cannot help**: it deliberately steps
    aside inside `.deck-menu`, which is what lets a fast deliberate click through. So `deckSheet` guards its
    own clicks, on TWO tests. The first is EXACT rather than a guess at how fast a finger is: a pointer click
    whose own pointerdown never landed in this sheet is by definition the tail of the press that opened it,
    and is swallowed however long that press ran (`e.detail` is 0 for a keyboard or programmatic click, which
    has no pointerdown to have seen and must go through). The second is a 500ms arming window, covering a
    fresh tap made before the sheet has settled — half the second the report asks for, because the exact test
    is what fixes the reported misfire and a full second is long enough that a reader reaching straight for a
    row would meet a sheet that ignores them, which is the same complaint again.
  · **A × IN THE TOP RIGHT OF EVERY SHEET** (`.dm-x`, Aug 2026, on request). Escape and a backdrop tap both
    closed it already and neither says so: Escape is a key a phone has not got, and "tap outside" is a
    convention a reader has to know in advance. Three decisions.
    **IT IS BUILT BY `deckSheet` RATHER THAN BY EACH CALLER**, so the options menu, Custom study, Daily
    limits, Scheduling, Card info and the flag picker all have one — and a sheet added later cannot ship
    without it, which is the same argument the shared shell already wins on Escape and the exit animation.
    **STICKY, AND FIRST IN THE DOM.** Sticky because `.ds-sheet` scrolls its whole box, where an absolute ×
    would scroll off the top; first in the DOM so a screen reader meets "Close" on the way in rather than
    after forty rows of card history. Its own height is cancelled with a negative bottom margin so it costs
    the head no room, and `.dm-head` carries the right padding that keeps a long title and the studied count
    clear of it — asserted as a box OVERLAP rather than as "right of the head", which is false by
    construction since the head spans the whole box.
    **AND IT IS SKIPPED WHEN THE INITIAL FOCUS IS CHOSEN**, or every sheet would open with the ring on the
    way out. That is the one line a later tidy-up is likeliest to undo, and it is asserted.
  · **EVERY SHEET IS CAPPED TO THE SCREEN AND SCROLLS** (`.dm-box`'s `max-height` + `overflow-y`, Aug 2026,
    on a bug report from a phone: "sometimes on mobile not the whole long-press menu is visible"). Only the
    two sheets that were BORN long — Scheduling (`.ds-sheet`) and Card info (`.ci-sheet`) — declared a
    height, so the OPTIONS menu, which has since grown to five switches, five commands, a swatch row and an
    icon picker, simply outgrew a 640px screen. **`.deck-menu` is a centred flex container, so a box taller
    than it overflows equally at BOTH ends and neither end can be scrolled to**: the head is off the top,
    Remove is off the bottom, and nothing on screen says so — which is why it reads as a menu that is
    missing rows rather than as one that is too tall. It belongs on the SHARED SHELL rather than on that one
    sheet, because the next sheet to grow will grow the same way and the two that already state a cap are
    more specific and untouched; `dvh` is what makes it right on a phone whose address bar comes and goes,
    with `vh` under it for anything that lacks it, and `overscroll-behavior:contain` keeps the page behind
    from scrolling once the sheet reaches its end.
    **AND THE STICKY × IS NOW BACKED IN THE SHEET'S OWN PAPER**, which it did not need while only two
    sheets scrolled: sticky means it floats over whatever row the scroll brings to the top, and an unbacked
    × sitting across a switch reads as a rendering fault and swallows the tap meant for that switch. At rest
    it sits inside the 38px `.dm-head` already reserves for it, where the colour is invisible.
  · **The sheet is CENTRED at every width and leaves the way it arrives** (Aug 2026, on request). It was a
    bottom sheet below 560px, on the reasoning that the row held was near the thumb; what that produced was a
    dialog rising out of the tab bar at the very bottom of the screen, furthest from where the reader was
    looking. It also had an entrance and no exit, so dismissing it cut it away on the frame of the click —
    the one abrupt half of a control that is otherwise entirely animated. `deckSheet`'s close adds `.closing`
    and removes the element after `DECK_SHEET_OUT_MS` (keep that in step with the CSS), and clears
    `_deckMenuClose` at the same moment so a second close cannot restart the timer; the overlay stops
    hit-testing the instant the class lands, so the gesture is finished whatever the paint is still doing.
  · **A MODAL SCRIM IS THEME-INDEPENDENT BLACK, NEVER `var(--ink)`** (Aug 2026, on a bug report: "the whole
    background is whited out"). Five full-screen overlays — `.inline-prompt`, `.deck-menu`, `.levelup-pop`,
    `.artefact-pop` and `.chest-pop` — were each `color-mix(in srgb, var(--ink) 38–58%, transparent)`, which
    reads as "the darkest thing this theme has" and IS exactly that in light mode (`--ink` is #1B1A17, so
    those figures are unchanged there). **At night the token flips to #ECEAE3**, so every one of them became
    a 38–58% WHITE veil: holding a deck's row, opening a chest or an artefact on any dark theme whited the
    whole page out behind the sheet. A scrim's job is to push the page BACK, which is a DIRECTION rather
    than a colour the theme gets a say in — the rule `.folio-tour`, `.page-help` and the media viewer were
    already written to, each spelling its black out. **The failure is invisible from the light side**, which
    is why it survived: nothing throws, the sheet is perfectly readable, and every screenshot taken in light
    mode is correct. `.gloss-scrim` and `.atlas-help` are deliberately NOT in the list: both are mixes of
    `var(--paper)`, which is DARK at night, so they already darken — a paper mix follows the theme correctly
    where an ink mix inverts.
  · **The row's options are a LONG PRESS** (`openDeckMenu` / `deckSheet` / `openCustomStudy` / `openDeckLimits`), and
    the small bin that used to sit at the right of every row is gone with it — one command holding a permanent column
    on a 390px row, with three more that had nowhere to live. Custom study bumps the deck's allowance for today AND
    `S.intro.extra` by the same amount (or the extra cards would be unreachable from the banner the reader pressed to
    ask for them); Skip today sits the deck out of `reviewQueue`; Remove is the old bin. A press is CLASSIFIED like
    the whiteboard marker's drag — a finger that moves more than `AD_SLOP` is scrolling, not holding — and
    `contextmenu` plus the ContextMenu key give a mouse and a keyboard the same way in. The sheet lives on
    `document.body`, so **`render()` closes it** (`closeDeckMenu`).
  · **DAILY LIMITS HAS TWO TABS, and the Settings page has no allowance any more** (`globalLimits` /
    `setGlobalLimits` / `clearDeckLimits` / `.dm-tabs`, Aug 2026, on request). **This deck** writes
    `S.deckOpts[id]`, as it always did; **All decks** writes the DEFAULT every deck follows until it has
    limits of its own — which is where **Settings → New cards per day** moved to when it was removed from
    that page. The value is the same (`S.settings.newPerDay`, so no save migrates) and its companion is new
    (`S.settings.maxReviewsPerDay`, back-filling from `DECK_MAX_REVIEWS` by its own absence): the maximum
    reviews a day had only ever been settable per deck, so the two halves of one idea lived in two places
    three navigations apart, and the global one read as a rule about Folio rather than as the fallback
    behind a per-deck figure.
    Three things are decisions. **The tabs swap PANES rather than rebuilding the sheet**, and Save writes
    both, so a reader can change the default and this deck's override in one visit without either being
    thrown away by looking at the other. **The per-deck tab shows the INHERITED figure where nothing has
    been set**, and says so under the fields — `deckLimits` already falls back, so the box would otherwise
    show a number the reader might take for something they had chosen. And **"Clear back to the default"
    DELETES the three keys** rather than writing the global's current values into them, which is the whole
    difference: a deck cleared this way follows a later change to the default, where one holding a copy of
    today's figures would silently stop following it. It is offered only where there is something to clear.
    `.dm-pane[hidden]{display:none}` is required — the author `display` beats the UA rule, the trap
    `.ces-imgpanel[hidden]` already carries.
  · **A SETTING CASCADES TO WHAT IS UNDER IT** (`DECK_OPT_INHERIT` / `entryChain` / `deckOpt` /
    `deckOptFrom` / `deckOwnOverrides` / `clearDeckOverrides`, Aug 2026, on request). A community deck may
    nest nine levels deep and end in a direction row, and until this every one of those rows answered for
    itself — so setting FSRS, or a review order, or read-aloud on the DECK did nothing at all to the levels
    inside it, which is where the reader actually studies. `entryChain(id)` walks outward from an entry to
    everything that contains it — a direction to its subdeck, a subdeck path to its parents, a subdeck to
    its deck, a tree node to its ancestors, and anything to the GROUP it has been dragged into — and
    `deckOpt(id, key)` returns the nearest answer with `from` (which entry gave it) and `own` (whether that
    was this one). Four things are decisions rather than plumbing.
    **THE DAILY LIMITS DELIBERATELY DO NOT INHERIT, and that is the whole of `DECK_OPT_INHERIT`.** A POLICY
    — how to order, whether to shuffle, which scheduler, whether to speak — means the same thing wherever it
    is applied, so handing it down is what a reader means by setting it on a deck. A QUANTITY does not:
    handed down to nine levels, "five new a day" becomes forty-five, and the pooled review would then draw
    a number no deck agreed to, which is the exact bug the per-deck limits were built to fix. So
    `newPerDay`, `maxReviews` and `newIgnoresReview` are absent from that list and `deckOpt` answers for
    them from the entry alone; `deckLimits` keeps its own fallback to the All-decks default, which is a
    different mechanism and is where a limit is meant to be inherited from.
    **THE CHAIN IS WALKED ONCE PER QUESTION, NEVER ONCE PER KEY.** `deckOrderMode` has to ask each entry for
    BOTH the new `order` string and the older `random` boolean before moving outward — two passes would let
    a deck's stale boolean beat a subdeck's explicit choice, which is a setting silently ignored rather than
    an error.
    **THE ROW SAYS WHERE ITS VALUE CAME FROM** (`.dm-from`, `fromMark`): "Set here" on an entry that carries
    its own, or "From &lt;the entry's title&gt;" where it is inherited — because a sheet showing a value that
    is not this entry's, with nothing to say so, teaches a reader that a setting they never made is theirs.
    `markOwn(rowEl)` re-marks the row in place when a switch is thrown, since throwing one must not repaint
    (`render()` closes this very sheet), and `.dm-from[hidden]{display:none}` is spelled out for the reason
    every `[hidden]` in this file is.
    **AND "FOLLOW &lt;PARENT&gt;" IS OFFERED ONLY WHERE THERE IS SOMETHING TO CLEAR**, `clearDeckOverrides`
    DELETING every inherited key on that entry rather than writing the parent's current values into it —
    the Daily limits tab's own rule, and the same difference: an entry cleared this way follows a later
    change made higher up, where one holding a copy of today's answers would silently stop following it.
  · **QUESTION VARIETY** (`deckVariety` / `setDeckVariety` / `scopeEntryId` / `S.settings.questionVariety`,
    Aug 2026, on request). Whether a card asks one of its three phrasings at random or always the first.
    It is **PER ENTRY with a global default**, exactly like the daily limits and for the same reason: this
    sheet is opened on a deck's own row as well as on the pooled review, and a setting that silently
    answered for every deck when thrown from one of them is the one thing a reader could not predict.
    `S.deckOpts[id].variety` is written only where the switch has actually been thrown; everything else
    follows `S.settings.questionVariety` (default true), so **nothing migrates**. `scopeEntryId(scope)` is
    what a study session resolves its scope to — a deck's own for a `deck`/`udeck` scope, the review's for
    everything else — and `PAGES.study` reads it ONCE per session, since the setting is changed from the
    home page and a card requeued ten minutes later must not suddenly be asked a different way.
    **The pool is CUT rather than the index pinned** (`cardQuestions(base).slice(0, 1)`): the ‹ › chevrons
    and the "1 / 3" counter are drawn from `pool.length`, so they simply do not appear, and there is no
    second state in which the counter says 1 / 3 and the arrows do nothing. The daily GAMES are untouched
    — they draw from every card and are not deck-scoped, so a per-deck setting has no business there.
  · **AUTOMATIC READ-ALOUD** (`deckAutoSpeak` / `setDeckAutoSpeak` / `entryHasSpeech` / `typeSpeaks`, and the
    `fromReader` argument to `PAGES.study`'s `showAnswer`; Aug 2026, on request — Anki's "read the answer
    aloud"). Revealing a card speaks it, with no button pressed. Four things are decisions rather than
    plumbing.
    **IT IS PER ENTRY WITH NO GLOBAL DEFAULT, AND SINCE AUG 2026 IT STARTS ON** (on request; it was opt-in,
    on the reasoning that a site which makes a noise by itself should be asked first). **What makes the
    default safe is the gate below it rather than a change of view about consent**: the switch — and the
    behaviour — exist only where the deck's own card TYPE marks a run `.uc-tts`, so the person who wrote
    the deck has already asked for those words to be speakable, and a deck that marks nothing is silent
    whatever this says. The reader who does not want it throws one switch, and it cascades to that deck's
    subdecks. It rides in `S.deckOpts`, so it syncs and survives a reset (`deckOpts` is in `RESET_KEEPS`)
    with no field of its own and **nothing migrates** — an absent key is the new default, which is the
    intended behaviour for everyone who has never opened the sheet, and a reader who explicitly turned it
    OFF keeps that. `.claude/test-speak.js` asserts the default in both directions.
    **THE SWITCH APPEARS ONLY WHERE SOMETHING CAN SPEAK** (`entryHasSpeech`), because a control that answers
    a press with silence is worse than none — the test `.uc-tts` already applies to its own chrome through
    `body.no-tts`. A curated card has no templates and so never speaks; a community deck speaks when one of
    its own card types marks text with `.uc-tts`. It is **derived on each open rather than stored**, so the
    pooled review grows the switch the day such a deck is added to it and loses it when the deck is removed.
    **ONLY A READER'S REVEAL SPEAKS** — hence `fromReader`, passed by the Reveal button and by Enter/Space
    and by nothing else. `showAnswer` also runs from `renderCard`'s own tail (`if (studyRevealId === id)`),
    which re-opens an ALREADY-revealed card after a reload, a language switch or an **undo**; without the
    flag a card would speak again on every repaint, which is a card nobody can leave open. Guarded in both
    directions by `.claude/test-speak.js`, and the undo path is how that test reaches the restore branch.
    **THE FIRST MARKED RUN IS THE ONE SPOKEN.** A type that marks several is asking for a control on each,
    not for a recital — and `cardSpeak` calls `ttsStop()` first, so queuing several would cancel all but the
    last anyway.
  · **The N/N STUDIED figure lives in the sheet's head, not on the row** (`.dm-studied`, Aug 2026, on request).
    It sat at the right of the row, where on a 390px line it competed with the deck's own name — the one part
    of the row with a shorter form, so the name is what gave way. The **bar stays on the row** and says the
    same thing at a glance, which is all a row of a list is for; the exact count is something a reader goes
    looking for, and holding the row IS that. It is derived from `entryCardIds(id)` + `isSeen`, so it answers
    for a deck, a community deck, the Card-of-the-day list and the pooled review alike, and is omitted
    outright on an entry with no cards. `.dm-head` is a `justify-content:space-between` row on
    **`align-items:baseline`**: the left-hand block (`.dm-headmain`) is a column, and a column flex item
    aligns on its own FIRST line's baseline — which is what puts the figure on the title's line rather than
    on the block's centre. `adProg` no longer emits `.count`.
  · **Remove carries its red in the TEXT and nothing else** (Aug 2026, on request). It had `--zh-wash` behind
    it on hover, and on a phone a hover state can be left behind by the very tap that opened the sheet — a
    highlighted row in a menu reads as one already chosen. The rule is gone; `.dm-item.dm-danger b` keeps
    `--zh` and the row hovers like every other. `test-layout.js` asserts it HOVERED, against an ordinary
    row's own hover wash — reading the resting style would pass whatever the rule says.
- **THE DAILY REVIEW HAS NO DECK CAP** (Aug 2026, on request). The Folio level used to be one — one deck at level
  1 and one more per level — and it was removed because it was the only thing a level decided and it decided it
  by taking something away: a reader who had found two collections worth studying was told to go and study more
  before they could have both. **`maxActiveDecks`, `activeDecksFull` and `countedActiveEntries` are deleted**, as
  is the Library's `.lib-cap` line and the toast that said why an add was refused. `addActive` still returns a
  boolean and every caller still tests it — it simply never returns false for a cap now — so nothing else moved.
  A level buys an artefact chest instead; see THE RELIQUARY. Guarded by `test-review-decks.js` section 5, which
  now asserts the OPPOSITE of what it used to: a reader who has studied nothing may add every collection offered.
  **The cap lived in three places** (`addActive`, `wireAddButton`'s toast, the page head), and dropping it from
  one of them would still have let almost every add through — which is why that assertion is worth having.
- **ADDING A COLLECTION ADDS WHAT IS INSIDE IT** (`nodeSubtreeIds` / `nodeAncestorIds` / `addActive` /
  `removeActive` / `refreshAddButtons`, Aug 2026, on request). A collection used to enter the review as a
  single entry with its decks showing under the banner as greyed CONTEXT rows — present, but not something
  you could tap into, hold for options, or drop one of. Adding one now adds the collection **and every deck
  and subdeck beneath it**, so each arrives as a row of its own. Three things follow, and each is the part
  that would otherwise bite:
  · **The CAP counts choices, not entries.** `countedActiveEntries` skips a node with an active ANCESTOR —
    it is in `S.active` because the collection is — or a level-1 reader adding a collection of four decks
    would instantly be five decks over their cap and unable to add anything at all. `addActive` therefore
    tests the cap ONCE, against the thing the reader actually pressed.
  · **Removing takes the node, its subtree AND its ancestors**, because an ancestor left active would go on
    offering the very cards just removed and its + button would still read "added". What must not go with
    the ancestor is its OTHER branches, so each is re-added explicitly first. Usually they are already
    there (the cascade put them there); the exception is what makes it necessary — a save written before
    this existed, where only the collection is listed and its decks are implied by it.
  · **`wireAddButton` re-reads EVERY + on the page** (`refreshAddButtons`), not just the one pressed: one
    press can change a dozen of them further down, and updating only the one clicked leaves the rest
    showing what they meant a moment ago, which reads as the tick landing on the wrong row. It is a sweep
    of the buttons rather than a `render()` because the collections page is a tree the reader has expanded
    by hand, and rebuilding it would fold that back up.
- **THE DAY BOUNDARY** (`dayKey` / `dayKeyOfDate` / `dayEndMin` / `dayEndTs` / `scheduleDayRoll`, Aug 2026,
  on a bug report: "the daily quote doesn't always change exactly at midnight"). A day used to be a UTC day
  (`new Date().toISOString().slice(0,10)`), so the quote, the card of the day, the streak, the review's
  allowance and the games' per-day records all rolled over at an hour that was not midnight for anybody off
  the Greenwich meridian. A day now runs on **THIS DEVICE'S OWN CLOCK** and ends at `S.settings.dayEnd` —
  minutes past midnight, 0 by default, capped at noon (`DAY_END_MAX`), set in **Settings → Study → Day ends
  at** — so a reader who studies until two in the morning can keep the day open until then.
  · **`dayKey(ts)` is the SINGLE derivation and everything goes through it.** The key was computed in ten
    places by slicing an ISO string; a rule applied in nine of them would leave one surface rolling over at a
    different moment from its neighbours, which reads as a bug in whichever surface you happen to be looking
    at. `dayKeyOfDate(d)` is the sibling for the two places that ITERATE days (`reviewHistory`, the heatmap)
    rather than deriving one from a timestamp, and `dayEndTs()` is what `dueForecast` means by "the end of
    today" now that 23:59 is not it.
  · **It deliberately does NOT derive a zone from `S.settings.home`.** A lon/lat cannot be turned into a
    political time zone without a tz database, and approximating one from longitude would put the Netherlands
    (lon 5.3) on UTC+0 — an hour or two out from the reader's own clock, and worse than the device time it
    replaced. The Settings row says "this device's clock" outright.
  · **`scheduleDayRoll()`** re-arms itself and repaints ONLY the home page, which is where everything dated
    lives; a repaint under a reader mid-card would take the card away.
- **THE SCHEDULER — Anki's SM-2, ported (Aug 2026, on request).** The `THE SCHEDULER` block in app.js, just above the SRS
  helpers. It replaced an approximation of Anki with the thing itself, on the request to "copy the entire spaced interval
  system exactly from Anki".
  · **The whole of it is PURE** — `schedAnswer(card, grade, t, seed, cfg)` returns a NEW record and reads no global, no DOM
    and no clock beyond its `t`. That is what lets `.claude/test-scheduler.js` walk every path as arithmetic rather than
    through a browser, and it is also what keeps the undo snapshot valid (the caller's record is never mutated).
    `grade()` is now only the bookkeeping around it: the review log, the streak, the day's new-card count, level-ups.
    **THE FOUR IMPURE LOOKUPS SIT BELOW THE `/* ---------- SRS ---------- */` MARKER ON PURPOSE** — `schedModeOf`,
    `deckSchedCfg`, `cardEntryId` and `schedCfgFor` read `S`, `UCARDS` and `cardLeaves`, and that marker is where
    `test-scheduler.js` STOPS SLICING. They were written above it first and the purity assertion caught them at once;
    keep new config readers on that side of the line, and pass the resolved `cfg` down rather than looking it up inside
    the arithmetic.
  · **`SCHED` holds Anki's defaults in one place** — learning steps `1m 10m`, relearning `10m`, graduating 1 day, easy
    4 days, starting ease 2.5 (floor 1.3), hard ×1.2, easy bonus ×1.35, lapse ×0 with a 1-day minimum, max 36500 days,
    leech at 8 lapses. There is deliberately **no UI for these** — the request was for Anki's schedule, not Anki's deck
    options — but they are a config object rather than scattered literals so a per-deck override is a small change.
  · **A new card WALKS THE STEPS, which is the reported bug.** The first Good sends it to the 10-minute step and the back
    of the day's queue; only the second graduates it to a day. `Hard` on the first step is the **midpoint of the two
    steps** (5.5m), or Again and Hard would both mean one minute and the button would be a lie.
  · **A lapse RELEARNS rather than resetting** — status `"relearn"`, ease −0.20, and the interval it returns to is
    computed at the moment it lapses and carried on the card as **`lapseIv`**. The record gains **`step`** too. Both
    back-fill by their own absence, so **nothing migrates**: an older single-step learning card reads as standing on
    step 1 and takes one more Good, which is the intended new behaviour anyway.
  · **`status` gains `"relearn"` beside new / learning / review.** Every counter that used to test `=== "learning"` calls
    **`schedIsLearning()`** now — a lapsed card is being learned again and Anki files it in the same pile — so reach for
    that helper rather than adding a third comparison.
  · **THE FUZZ IS SEEDED BY THE CARD, NOT THE CLOCK**, and that is what makes the grade buttons honest: `schedPreview`
    and `schedAnswer` compute the same number, so a button reading "12d" schedules 12 days. **Both take the same `t`** —
    a preview that read `Date.now()` while the grade took the passed time previewed one interval and scheduled another
    on any overdue card (caught by the test, not by eye).
  · **`fmtInterval` renders real minutes.** It answered `<10m` for everything under an hour and then labelled HOURS as
    minutes, so both rungs of the ladder read the same and neither read correctly.
  · **The requeue rule is the DAY BOUNDARY**, not a fixed window: `{requeue: schedIsLearning(status) && (due < dayEndTs()
    || due - now <= SCHED_AHEAD_MS)}`. The old 11-minute window silently stopped requeuing the moment a step ran longer
    than it; the learn-ahead allowance is Anki's, and is what stops the last card of a late-night session being stranded
    a few minutes the wrong side of the cut-off.
  · **A DUE DATE MEASURED IN DAYS LANDS AT THE START OF ITS DAY** (`dayStartTs` / `SCHED.dayAnchor` / `schedDayDue`,
    Aug 2026, on request). An interval of one day used to mean *twenty-four hours from the moment you graded it*, so a
    card answered at nine in the evening was not offered again until nine the next evening — which makes "today's
    review" a moving window rather than a day, and means a reader who studies in the morning meets none of yesterday
    evening's cards. Anything scheduled in **days** is now anchored to the start of the reader's own day (`dayEnd`
    included, so it is the same boundary the streak, the quote and the day's allowance turn over on) plus the fuzz;
    anything in **minutes** — the learning steps — is untouched, since those are genuinely a delay from now.
    **It is a `cfg` field, not a global read**, so the pure block stays pure: `deckSchedCfg` and `schedCfgFor` attach
    `dayAnchor`, and a `cfg` without one behaves exactly as before, which is what keeps `test-scheduler.js`'s older
    sections describing the same function. Both schedulers go through it — `fsrsAnswer` routes its interval through
    `schedPass` — so neither knows about it.
  · `S.intro.count` (the daily new-card cap via `newRemainingToday`) is still incremented only on a card's FIRST grade
    (`fresh`), so a requeued learning card is never re-counted.
  · **Guarded by `.claude/test-scheduler.js` (136 assertions, no browser, no dependencies)** — including the ordering
    guarantee Hard < Good < Easy over 1,600 interval/ease combinations, that preview and grade agree over 360 cases,
    that nothing is ever scheduled into the past, and that old records back-fill. Its two most useful finds were both
    invisible on the page: the ordering floor walking Easy past the maximum interval, and the preview/grade clock
    mismatch above. `.claude/test-review-decks.js` section 6 pins the same thing end to end in a real session — and
    **tracks the card by ID out of the session record, never by the question on screen**, which is a different one of
    its three phrasings each time it is shown.
  · **Re-run both after touching `SCHED` / `schedAnswer` / `schedPreview` / `schedPass` / `schedFuzz` / `schedIsLearning`
    / `schedDayDue` / `dayStartTs` / `fmtInterval`, or the requeue line in `grade()`.**
- **FSRS, CHOSEN PER DECK (Aug 2026, on request).** The `FSRS` block in app.js, between SM-2 and the SRS helpers.
  SM-2 asks *how did that go* and multiplies an interval; FSRS models the memory — a **stability** (the delay at which
  recall is about 90%) and a **difficulty** (1–10) carried on the card record beside the interval — and computes the delay
  at which the reader's own target retention is reached. A deck is on one or the other; the reader also says what they are
  aiming for (`retention`, 0.70–0.98, default 0.90).
  · **IT IS FSRS-6 AND IT WAS NOT WRITTEN FROM MEMORY, which is the most important thing on this bullet.** Every formula
    and all 21 default parameters were read off the reference implementation (`py-fsrs`, open-spaced-repetition), and the
    arithmetic is pinned against vectors **generated by it** — `.claude/fsrs-vectors.json`, written by
    `.claude/gen-fsrs-vectors.py` (a dev-only script; `py-fsrs` is installed OUTSIDE the repo, like Playwright). A
    scheduler that is subtly wrong reports nothing, throws nothing and quietly teaches every reader worse, so **a change
    to any `fsrs*` function is verified against the fixture and never by eye**. Regenerate the fixture only when
    deliberately moving to a new FSRS version, and say so — a fixture regenerated to match a change proves nothing.
    **The fixture RECORDS which reference produced it** (`ref`, printed by test-scheduler.js — `py-fsrs 6.3.2` today),
    for exactly that reason: without it there is nothing to tell a deliberate version bump from a file edited to fit a
    bug. Verified with `/tmp/fsrsenv/bin/python .claude/gen-fsrs-vectors.py` regenerating it byte-identically.
  · **FSRS REPLACES THE INTERVAL ARITHMETIC AND NOTHING ELSE**, which is also how Anki does it. The statuses, the learning
    steps (`1m 10m`), the relearning step, the fuzz, the day boundary, the requeue rule, the leech count and the whole of
    `grade()`'s bookkeeping are untouched: a new card still walks the steps, and FSRS decides where it lands when it
    graduates. So `fsrsAnswer` mirrors `schedAnswer`'s shape exactly and `fsrsPreviewIvs` mirrors `schedPreview`'s, which
    is what keeps the grade buttons honest under both.
  · **DECAY AND FACTOR ARE DERIVED FROM `w20`, not fixed** — that is FSRS-6's whole addition over FSRS-5 (the forgetting
    curve's shape became a fitted parameter), so `fsrsDecay`/`fsrsFactor` must never be written as constants or a reader's
    own pasted parameters would be half-ignored.
  · **SEEDING: interval → stability, and the difficulty is NOT guessed from the ease** (`fsrsSeed`). Turning FSRS on
    mid-deck must not throw away what the reader has learned, and an SM-2 interval and an FSRS stability are the same
    thing measured the same way, so the interval carries straight across. The ease is a different quantity on a different
    scale with a different meaning, so a seeded card starts at the **Good initial difficulty** and lets its next few
    reviews say what it really is; a confident wrong difficulty is worse than an honest default. A card with no interval
    at all is simply new to FSRS.
  · **PER-DECK, and the pooled review honours each card's OWN deck** (`schedModeOf` / `deckSchedCfg` / `cardEntryId` /
    `schedCfgFor`, all below the purity marker). The mode lives in `S.deckOpts[entryId].sched`, beside the daily limits
    and question variety and written by the same `setDeckLimits`, so it syncs and needs no field of its own and **nothing
    migrates** — an absent key is SM-2, which is every existing deck. `cardEntryId` is what makes a card studied from the
    pooled review, from its own row or from a deep link get the same scheduler. Being in `deckOpts` also means the choice
    **survives Settings → Reset progress** (`deckOpts` is in `RESET_KEEPS`), which is right: the schedule is cleared and
    every card's stability goes with it, but how the reader wants their decks scheduled is a preference, not history.
  · **A READER'S OWN PARAMETERS ARE ACCEPTED OR REFUSED, never half-taken** (`setDeckFsrsParams`): 21 finite numbers or an
    error naming the count, and an empty box clears them back to the defaults. Somebody who has had FSRS optimised in Anki
    should not have to lose that; Folio fits its own from the review archive (see THE FSRS OPTIMISER below).
  · **ELAPSED DAYS ARE WHOLE AND FLOORED**, which is the reference's convention (`(now - last).days`) and which Folio got
    WRONG for the first few hours of FSRS's life, reading the same delay as a fraction. It is not a rounding detail: the
    forgetting curve is evaluated at that number, so a card answered 1.9 days late was scored at 1.9 where every parameter
    set in the world — the defaults, and any set a reader pastes out of Anki — was fitted against 1. **The fixture could
    not see it because every gap in it was a whole number of days**; there are fractional gaps in it now, and they fail
    loudly if this is ever un-fixed (worst stability error 7.65 when it was).
  · **NO OTHER STUDY APP IS NAMED IN A SETTINGS SHEET** (Aug 2026, on request). The deck sheet's Scheduling row read
    "SM-2, the classic Anki schedule", the two Scheduling rows called SM-2 "the classic Anki schedule" and FSRS "Anki's
    default", and the parameters note offered to take a set "if Anki has already optimised parameters for you" — all
    four are reworded to describe what the thing DOES, which is what a reader choosing between two schedulers needs;
    the last says "fitted for you elsewhere". **The debt is real, so it is stated once and properly**: Anki and FSRS
    are both credited in the About page's "Credits & sources" list, naming what Folio's schedule is modelled on and
    that it shares no code with either. The code COMMENTS in the scheduler blocks still name Anki freely — they are
    where the reasoning lives and are not user-facing.
  · **The sheet is `openDeckSched(id)`**, reached from a deck's own long-press options ("Scheduling"). The retention box
    and the parameters box are drawn only under FSRS, since neither means anything under SM-2. **`deckSheet` honours
    `[data-dmfocus]`** because of this sheet: its own `setTimeout(0)` focus ran after the caller's and left a focus ring on
    the un-chosen row beside a tick on the chosen one — a general fix, so any sheet may nominate its initial focus now.
  · Card info shows **stability and difficulty instead of the ease** under FSRS, and names the scheduler with the target
    retention — the ease is a leftover there and showing it would invite a reader to read meaning into a number nothing
    uses. Two things about that panel are worth carrying, and both shipped WRONG for an hour and were caught by looking
    at it rather than by any test. **THE 90 IN "the delay at ~90% recall" IS NOT THE READER'S TARGET**: stability is
    defined at 90% whatever retention the deck asks for, so on a deck set to 85% that annotation sat four rows above
    "aiming to remember 85%" and read as the setting having been ignored — it said "the 90% interval" and now says what
    it measures. And the review-history table's sixth column is **whichever number the scheduler actually uses**, headed
    from the card's own mode (an ease as a percentage under SM-2, a difficulty out of 10 under FSRS): `logReviewEntry`
    writes `post.difficulty` where there is one and `post.ease` otherwise, since **only `fsrsAnswer` ever writes a
    difficulty**, so the row says for itself which scheduler produced it with no extra field. That is also what
    `review_log.ease100` has always documented. The one case the two can disagree is a deck switched between schedulers
    part-way through, where older rows keep their own values under the newer heading — recorded rather than repaired.
  · **Guarded by `.claude/test-scheduler.js` sections 10 and 10b** (the fixture, to 1e-9, over 768 steps, plus the
    properties a fixture cannot state: recall never loses stability, a lapse never gains it, difficulty stays in 1–10,
    stability never falls below its floor, nothing is scheduled into the past, and seeding takes the interval and not the
    ease) and by **`.claude/test-review-decks.js` sections 11–14** end to end — the sheet, the per-deck isolation (one deck
    on FSRS while its neighbour stays on SM-2, both studied from the pooled review), the seeding, and what Card info says.
- **LOAD BALANCING AND EASY DAYS (Aug 2026, on request).** `schedFuzzRange` / `schedSpread` / `LOAD_AVOID` /
  `LOAD_NEAR` in the pure scheduler, `loadMapNow` / `bumpLoadMap` / `easyDays` / `easyDaysOn` /
  `loadBalanceOn` below the SRS marker, and two rows in **Settings → Study**. Anki's two features, and they
  are one mechanism: the fuzz has always spread an interval over a few days at random, and this decides
  WHICH of those days rather than leaving it to a hash — the quietest one, and never a day the reader has
  said they do not study if the range holds anything else.
  · **IT REPLACES THE FUZZ'S CHOICE AND NOTHING ELSE**, which is what makes it safe to turn on mid-collection
    and is asserted directly: the day chosen is always inside the range the unbalanced fuzz could already
    have chosen, so a schedule cannot be quietly lengthened or shortened. `schedFuzz` is now `schedFuzzRange`
    plus the same hash pick, so with no map the result is byte-for-byte what it always was.
  · **ONE INSERTION POINT COVERS BOTH SCHEDULERS.** It is in `schedPass`, and `fsrsAnswer` routes its own
    interval through `schedPass` too — so FSRS and SM-2 are balanced by the same code and neither knows about
    it. Anki ties easy days to FSRS; there is no reason to here.
  · **HARD < GOOD < EASY SURVIVES IT because the floor is applied AFTER.** The three ranges overlap, so the
    balancer can hand back the same day for two grades; `schedPass`'s `Math.max(floor, …)` is what pulls them
    apart again. Move the balancing below the floor and the ordering goes — which is why the test walks every
    interval and ease with a deliberately lumpy pile.
  · **THE MAP TRAVELS ON `cfg`, and that is the load-bearing decision.** It keeps the arithmetic pure (no
    reader of `S` above the marker) and, more importantly, it is what keeps **the preview and the grade in
    agreement**: both are handed the same cfg, so a button reading "12d" still schedules twelve days. A map
    read from a global at each call could differ between the two, which is the clock-seeded-fuzz mistake in a
    new coat — and it is asserted, not assumed.
  · **BOTH ARE DEFAULT OFF**, and `loadMapNow` returns null unless one of them is on, so a reader who has not
    asked pays nothing and their intervals are exactly what they were. That is the house rule rather than a
    view about which default is better — Anki's own balancer defaults on.
  · **A MARKED DAY IS AVOIDED, NOT FORBIDDEN** (`LOAD_AVOID` is a large number, not `Infinity`). If every day
    in a card's range is marked it still lands on one: a card that cannot be scheduled at all is worse than
    one arriving on a Sunday, and the loop must not fall through to nothing. `LOAD_NEAR` breaks ties toward
    the interval the scheduler actually wanted, so a level pile leaves the card where it would have been.
  · **STORED SUNDAY-FIRST, DRAWN MONDAY-FIRST.** `S.settings.easyDays` is indexed by `Date#getDay`, so the
    scheduler steps the weekday modularly with no conversion at all; the UI orders them Monday-first to match
    the heatmap. Two honest approximations are stated in the code rather than hidden: the weekday is stepped
    from `dow0` rather than re-derived per candidate, so it can be a day out across a daylight-saving change,
    and the card being rescheduled still counts itself in its OLD bucket, which is almost never inside the
    range it is moving to.
  · **The map is cached for the DAY and `bumpLoadMap()` is called wherever a due date moves** — `grade()`,
    `applySetDue`, `applyForget`, and both settings. A stale map corrupts nothing (the worst case is a card
    landing on a day that filled up since) but would slowly stop doing the job it exists for.
  · **The row for the seven days STACKS** (`.set-row-stack`): `.set-row` is a flex line with `flex:1` prose
    and a `flex:none` control, which is right for a switch and hopeless for seven buttons — in the settings
    column they claimed the whole line and squeezed the description to one word per line. Found by looking at
    the page, which is the only way a squeeze like that shows up.
- **THE FSRS OPTIMISER (Aug 2026, on request).** The `THE FSRS OPTIMISER` block in app.js, inside the pure scheduler slice.
  FSRS's 21 parameters describe how a memory fades; the defaults describe the average of millions of reviews and these
  describe the reader's own. It is what the per-review log was uncapped FOR — a card record keeps only its latest review,
  so none of this can be reconstructed after the fact.
  · **WHAT IS FITTED.** Each card's reviews are a sequence: from the state after review i-1 and the delay to review i,
    FSRS predicts the chance of recall and the answer says what happened (anything but Again is a recall). The loss is the
    mean binary cross-entropy between the two. **Same-day reviews are excluded** (retrievability is defined at a scale of
    days) **and so is a card's first review** (no prior state to predict from) — both the reference's exclusions, and both
    the reason `fsrsLossReviews` is much smaller than the row count and is computed rather than approximated.
  · **THE LOSS IS CHECKED AGAINST THE REFERENCE; THE DESCENT IS NOT, and that division is the whole design.** Two gradient
    descents never land on the same 21 numbers, so comparing the OUTPUT against py-fsrs would be comparing noise — while
    the loss being descended is a fixed function of the parameters and the data, and getting it wrong is how an optimiser
    confidently walks a reader's schedule somewhere worse. So the fixture carries a synthetic 60-card history scored by
    the reference's own `Optimizer._compute_batch_loss` at two parameter sets, and `fsrsBatchLoss` is held to it **to
    1e-9**. (That needs torch/pandas/tqdm in the scratch venv beside `fsrs`: `pip install torch --index-url
    https://download.pytorch.org/whl/cpu`, then `pip install pandas tqdm`.)
  · **THE GRADIENT IS NUMERICAL**, the other deliberate departure: the reference differentiates a torch graph and Folio has
    no torch and no build step. Hand-derived analytic gradients over 21 parameters would be ~200 lines of calculus with
    nothing to check them against — the exact mistake this feature exists to avoid — where a finite difference is derived
    mechanically from the loss, which IS checked. It costs 22 evaluations a step. **Full-batch, where the reference takes
    mini-batches**: a mini-batch gradient needs card states carried across the batch boundary, which autograd gets free and
    a finite difference does not, and the full batch is what the reference itself selects its best epoch on anyway.
  · **IT IS ALLOWED TO REFUSE, and both refusals matter.** Too little history — the reference's own floor of one
    mini-batch, 512 loss-bearing reviews — returns `reason:"few"` **naming the number it has and the number it wants**,
    because "not enough" with no figure is untestable by the reader. And a fit that does not beat the defaults **on a
    held-out tail it never trained on** returns `reason:"noBetter"`: that guard is Folio's own and is the one that counts,
    since a reader pressing this is handing over their schedule and the honest answer to "your history does not support
    better parameters" is to say so. The split is **within each card's sequence, not by card** — splitting by card would
    judge a card the fit had never seen from a cold start, where a tail is the fair question (given what this card did,
    does the fitted set predict what it did NEXT any better?).
  · **A SEQUENCE MUST BEGIN AT THE CARD'S FIRST REVIEW** (`fsrsSequences`, which lives beside `revRead` and NOT in the
    optimiser — it is the only part that knows what a row is, and the row shape is documented as living in exactly two
    places). A card whose earliest row is already in the review state has a stability the log does not record, so it is
    dropped rather than guessed at. That is why the optimiser stays quiet until a reader has history made SINCE the log
    started, and why the refusal says so in those words.
  · **The whole ARCHIVE is fetched, paged** (`revFetchAll`) — PostgREST caps a response at 1,000 rows, and fitting to the
    first thousand of somebody's four thousand reviews without saying so is the quiet kind of wrong. A failure returns
    `null`, which the caller tells apart from a reader who genuinely has nothing; signed out, the local window is used.
  · **It runs ON THE PAGE, a step at a time** (`fsrsOptimiseStart` / `fsrsOptimiseStep` / `fsrsOptimiseFinish`, with
    `fsrsOptimise` as the one-call form the tests use), repainting between steps — a few seconds of arithmetic behind a
    frozen dialog reads as a crash. **There is deliberately no Web Worker**: one needs its own file or a `blob:` URL, and
    `script-src 'self'` is the one line of the CSP this project will not weaken for a progress bar.
  · **The result is STAGED in the parameters box, not saved** — Optimise asks, Save answers, which is the two-step every
    other field on that sheet already has and the difference between offering a schedule and changing one behind the
    reader's back.
  · **Guarded by `.claude/test-scheduler.js` section 10c** (the loss against the reference, the reference's own clamp
    bounds, both refusals, and a RECOVERY test — a history generated from a known parameter set must be predicted better
    than the defaults on a held-out tail, which is what stands in for a reference check on the output) and by
    **`.claude/test-review-decks.js` section 15** for the path (the button under FSRS and not under SM-2, a run that
    finishes without freezing its sheet, nothing saved until Save, and the too-little-history refusal in words).
- **THE NOTE→CARDS EXPANSION AND `availableCardIdSet` ARE CACHED** (`_uStudyCache` / `_availCache` /
  `uCacheBust` / `uDeckStudyIdsFor`, Aug 2026, same report as the sanitizer revision stamp under COMMUNITY
  DECKS). Both are DERIVED on every read, which is what keeps them honest — a card's `sub` and a type's
  template list change under them and nothing has to be kept in step — and both are O(the whole deck). One
  home render asked for the expansion **sixteen times**: `entryPiles` per row, `reviewQueue`, `entryInfo`,
  the progress bar on each row, and `availableCardIdSet`, itself called nine times. On the HSK 3.0 deck
  that was 174,336 `uNoteCardIds` calls and ~270ms per repaint **with a single row on the page**, before
  its nine subdecks were drawn at all; it is ~150ms with ten rows now.
  · **Keyed by (deck, subdeck), and thrown away WHOLE** rather than reasoned about: a stale entry would
    silently deal the wrong cards, so `uCacheBust` keeps nothing. Every write goes through it — the
    Studio's mutations all end in `uDeckSave`, and `uDeckMount` / `uDeckDelete` are the only other ways
    the stores move. `availableCardIdSet` depends on ONE thing more, the collection tree, hence the bust
    in **`applyAdminEdits`**.
  · **The declarations sit beside `applyAdminEdits`, far from the code that fills them**, and must stay
    there: that function busts them and runs at BOOT, so a `let` down beside the community block would
    still be in its temporal dead zone — a ReferenceError before the first paint rather than anything
    subtle.
  · **Both hand back the live array/Set, not a copy.** Every caller was audited first: they all `filter`,
    `forEach`, `some` or read `.length`, and nothing sorts or pushes in place. **Keep it that way** — a
    caller that sorted what `entryCardIds` returns would corrupt the cache for everything else on the page.
- **BURY SIBLINGS (Aug 2026, on request).** Answering one card of a note puts the note's OTHER cards off until tomorrow.
  It is what makes asking a word in both directions worth doing: 中 → middle and then middle → 中 an hour later tests the
  last hour rather than the word. Template-major ordering (see the card-types bullet) keeps siblings apart WITHIN a
  session; this keeps them apart across the day, which is the half that matters.
  · **THE REGISTER EXPIRES BY BEING READ.** `S.buried[id]` is the DAY it was buried (`dayKey`, so the reader's own day
    boundary), never a boolean — so nothing has to run at midnight, and a card buried yesterday simply reads as not buried
    today. Stale entries are swept on write, which is where `deckDay` does it too. It is in `defaultState` AND
    `PROGRESS_FIELDS`: burying is a fact about the reader's day, so a phone and a laptop agree about it.
  · **Burying is for today and is Folio's decision; SUSPENDING is for ever and is the reader's** — two registers, two
    meanings, and neither should grow into the other.
  · **Only a community note can have siblings** (a curated card is one card), so `burySiblings` returns immediately
    everywhere else, and `entryHasSiblings(id)` is what decides whether the switch is drawn at all — a control that can
    only ever do nothing is worse than none. Default **ON** (`deckBurySiblings` tests `!== false`), so nothing migrates.
  · **A card already answered today is not buried.** Burying it would record a fact that changes nothing and would show in
    the count as work removed that had already been done.
  · **THE LIVE QUEUE HAS TO BE FILTERED TOO.** Every queue built after the grade already excludes the buried sibling; the
    one in hand was built before it, so `doGrade` filters it — and **the reader is told once a session**, because the first
    time the day's count drops by more than one that needs explaining and the tenth time it is just how the deck works.
  · **Undo un-buries**, through the ordinary snapshot (`buried` is copied into it whole), so a mis-grade does not cost a
    day on two cards.
  · Guarded by `.claude/test-card-types.js`'s `buryChecks` — including that the register records the DAY (asserted by
    **ageing it** rather than by waiting), that the switch is absent on a curated deck, and that with it off nothing is
    buried.
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
- **FLAGS, SET DUE DATE, FORGET, AND THE CARD BROWSER (Aug 2026, on request).** Folio had come to record a
  great deal about every card — a state, an interval, an ease or a stability, a lapse count, tags, and since
  this month every individual review — and gave a reader no way to look at any of it except one card at a
  time, on whichever card happened to be in front of them. These four land together because they are one
  gesture: find the card, then do something to it.
  · **A FLAG IS NOT `cardColor`, and the two must never be merged however alike they look.** `cardColor` is
    an ADMIN's private marker on a card in the editor: it rides in `ADMIN_EDITS`, it is published to every
    reader through the content overrides, and it means "I, who write these cards, have a note about this
    one". A **flag** (`S.flags[id]` → 1–7) is the READER's, it rides in their own progress, and nobody else
    ever sees it. One is a fact about the content, the other a fact about somebody's studying.
    Anki's seven, in Anki's order and under Anki's names, because a reader who has flagged cards before will
    press Ctrl+1 and mean red by it. **The chord has to be Ctrl** — 1–4 are the grade keys — and it sits
    ABOVE the Enter/Space guard in the study page's key handler but is deliberately allowed to fire while
    the cloze box has focus, since Ctrl+digit types nothing into a text box and a reader mid-guess is
    exactly who wants to flag the card. **Setting the flag a card already carries CLEARS it**, which is what
    makes one chord enough for both directions; the sheet toggles on ONE card for the same reason and SETS
    on many, a bulk action that toggled leaving a mixed selection half red and half not.
    **It is in `RESET_KEEPS`**: a flag is an annotation rather than history, and Settings → Reset progress
    names the study history, the streak and the badges, none of which a flag is.
    **The colours are TOKENS** (`--flag-1` … `--flag-7`, with night and high-contrast values of their own),
    for the rarity palette's reason at more than twice the scale — seven hues told apart at a glance, and a
    hue mixed toward a dark paper stops being the hue that identifies it. **The dot is never coloured TEXT**:
    seven hues legible as 10px type on sixteen light papers and eighteen dark ones do not exist, the name is
    beside it in the ordinary ink, and the picker prints the FIGURE on each swatch so the seven are told
    apart by position and number as well as by colour.
    **Flagging repaints the CARD, not the page** (`renderCard()`, never `render()`) — `render()` rebuilds the
    study page from the stored session and would take a revealed answer away, and flagging a card is not a
    reason to un-reveal it. Guarded in both directions.
  · **`schedSetDue` and `schedForget` are PURE and live above the `/* ---------- SRS ---------- */` marker**,
    beside `schedAnswer`, so `test-cards.js` walks them as arithmetic and the undo snapshot stays valid (each
    returns a NEW record; the caller's is never mutated). **They belong to the scheduler rather than to a
    button** because either written at the call site would be five field writes with a rule behind each —
    what happens to a learning card's step, whether a lapsed card keeps the interval it was returning to,
    whether the FSRS memory state survives — and those rules would then exist in as many places as offered
    the action. Here there is one of each, and the browser's bulk actions and the single-card sheets are the
    same code.
    **Set due date takes Anki's own input** (`7`, `7!`, `4-7`) and its instant is `t + days * DAY`, computed
    the way `schedAnswer` computes every other due date rather than snapped to the reader's day boundary —
    deliberate consistency, since a card graded at ten in the evening with a one-day interval already comes
    due at ten the next evening. A **new or learning card becomes a REVIEW card**, which is Anki's behaviour
    and the only coherent one: left in learning, the date the reader has just chosen is overwritten by the
    very next grade, which walks the steps, and nothing on screen would say so. A **range is resolved per
    card, seeded by the card's own id**, so pushing a hundred cards spreads them — the point of offering a
    range — and re-running the same action puts them on the same days rather than reshuffling.
    **Forget KEEPS the record rather than deleting it**, and that is the load-bearing part: Folio's XP is the
    number of distinct cards studied, so dropping the record would silently take back a level earned by
    studying something the reader did in fact study, and `first` is what every per-deck new-card count is
    derived from. `resetCounts` is Anki's own checkbox and is off by default — those reviews happened. The
    FSRS memory state always goes, forgetting being exactly the assertion that it was wrong.
  · **THE BROWSER (`PAGES.browse` at `#browse`)** — a searchable, sortable table over every card
    `availableCardIdSet()` yields, which is the right universe rather than every id in the tree: it already
    leaves out the coming-soon collections and already expands a community note into its several cards, so
    the browser lists exactly what the review could deal. Rows carry a checkbox, the flag, the card, its
    deck, its state, when it is due, its interval, its reviews and its lapses; selecting any of them raises a
    bulk bar (flag, set due date, forget, suspend, unsuspend). A row opens Card info, where the same actions
    live on one card — **the actions are IN Card info because that panel is already "everything about this
    card", and the two calls it was missing are both answers to what it shows**: a due date the reader
    disagrees with, and a lapse count saying the card never stuck.
    **THE SEARCH IS THE HALF THAT MATTERS**, and it is Anki's syntax cut to a documented subset: `is:`,
    `flag:`, `prop:`, `deck:`, `tag:`, `introduced:`, `rated:`, terms ANDed, any of them negatable with a
    leading `-`, phrases quotable. `browseTokens` and `browsePredicate` are **PURE** — a row is a plain
    object and nothing in them reads `S` — which is what lets the test put thirty queries through them as
    arithmetic. **An operator Folio does not know stays FREE TEXT rather than being dropped**, so a typo
    searches for itself and narrows to nothing instead of matching everything; and **an operator whose VALUE
    makes no sense matches NOTHING rather than everything**, for the same reason. Both failures look like
    "the search is broken" from one side only.
    **TWO DEPARTURES FROM ANKI, and the page says so rather than leaving them to be discovered.** There is
    **no `added:`** — Anki's counts from when a note was created and a curated Folio card has no creation
    date at all, it ships in `data.js` — so the operator is `introduced:` and means the day a card was first
    STUDIED, which `first` already records. Calling it `added:` would have been a figure that looks like
    Anki's and answers a different question. And **`rated:` reads the per-review log**, so it cannot see
    further back than the log does.
    **The deck column prints the LEAF's title and the full path is on the row's tooltip** — a full path is
    forty-odd characters, which in a table column is an ellipsis and nothing else ("World History · Or…"
    tells a reader strictly less than "Origins"). **Below 640px five of the nine columns go** rather than
    being squeezed: at 390px the card's own title is the only part of a row with no shorter form, so anything
    taking width from it is what gives, and the rest is one tap away in Card info.
    **`BROWSE_PAGE` (300) is a PAGE, not a ceiling** (Aug 2026, on request). It was a hard cut with a line
    telling the reader to narrow the search, which on a few thousand cards makes the last two thirds of the
    collection unreachable by scrolling at all. The table grows by a page whenever its foot comes into view,
    watched by an **IntersectionObserver on a sentinel drawn as the body's last child** — a scroll listener
    cannot see the case where the first page does not fill the window, since no scroll ever happens there.
    One observer, re-pointed at each freshly drawn sentinel (the rows are rebuilt on every repaint, so an
    observer left on the old one fires on a detached node) and disconnecting itself when the page goes. The
    count line still states the true total and now says how much of it is on screen; a repaint that CHANGES
    the list resets the depth, since a new search is a new list.
    **The query, the column and the selection are module-level and deliberately NOT in `S`**: they are a way
    of LOOKING at the collection rather than a preference about Folio, so they survive navigating away and
    back within a session and reset on reload — the glossary record's own call. Typing repaints IN PLACE
    rather than re-rendering, or the caret leaves the box being typed in.
    **THERE ARE TWO WAYS IN and both are asserted**, because they serve different readers: the **account
    page**, at the head of the reader's own record — **including the SIGNED-OUT one**, which is the case that
    would have been missed, since everything else there is behind the sign-in wall for being about an ACCOUNT
    where this is about the cards on this device, and a guest studies, flags and forgets like anybody else —
    and a **deck's long-press options sheet**, which is the everyday path, the moment somebody wants to find
    a card usually being the moment they are looking at their decks. `setActiveTab` maps the route to
    `account`, as it does `glossary`.
- **THE PER-REVIEW LOG (Aug 2026, on request)** — `S.revlog`, one row per answer, written by
  **`logReviewEntry`** from `grade()` and read by **`revRead`** / `revForCard` / `revWindow`. The daily
  `reviewLog` below keeps three numbers a day, which is all a heatmap and a retention rate need and is the
  whole of what a past day can say; this keeps what a day cannot — which card, which button, from what
  interval to what, and how long the answer took. **It is the foundational half of the feature and it landed
  before the screens that read it, deliberately**: a card record holds only its LATEST review, so every day
  the log is not being written is detail no later release can reconstruct. It is what a **card-info** panel,
  an **answer-buttons** breakdown, any **time** figure and (the real prize) **FSRS** all need, and none of
  them can be retrofitted onto history that was never kept.
  · **THE ROW IS AN ARRAY and its shape lives in exactly TWO places** — `logReviewEntry` writes it and
    `revRead` unpacks it, so every reader goes through one function and the compact form is an encoding
    detail rather than something eight call sites agree about. `[ id, t, g, st, prevMin, nextMin, ease100, ds ]`:
    `t` is plain **ms** (the unit every other stamp in app.js uses — a minutes-since-epoch would save five
    characters a row and give the file a second time unit to remember); `prevMin`/`nextMin` are the interval
    before and the delay the grade bought, **both in MINUTES**, one unit for both, because a field that is
    sometimes days and sometimes minutes reads correctly and computes wrongly; `ease100` is an integer, so no
    float noise in JSON, and is **whichever number the card's scheduler uses ×100** — its ease under SM-2, its
    difficulty under FSRS (see the FSRS bullet for why that needs no extra field); `ds` is **tenths of a second**.
  · **THE DURATION IS CAPPED at `REV_MAX_DS` (60s, Anki's own `maxTaken`)**, and the cap is the honest half
    of it: a card left open over lunch would otherwise claim two hours of study and make every time figure a
    lie. It is measured by the STUDY PAGE (`shownAt`, stamped in `renderCard`) and passed into `grade(id, g,
    ms)`, since only the page knows when the question appeared; a grade with no timing logs a 0 rather than
    refusing, because a missing duration must never be able to cost the schedule.
  · **THE LOG IS NO LONGER IN THE SYNCED BLOB, AND THAT IS WHAT LIFTED THE CAP** (Aug 2026, on request —
    "with no cap, I don't mind adding a supabase table"). It shipped at `REV_CAP` 3000 rows because it rode
    inside the one progress blob `save()` PATCHes whole, and this bullet said outright that the fix was a
    table of its own rather than a bigger cap. That is what happened: **`review_log`** (the `10) REVIEW LOG`
    block at the end of `.claude/supabase-schema.sql` — **the user must run it once**, and until then
    `revTableMissing` turns PostgREST's 404 into a silent no-op rather than an error on every grade), one row
    per review, owner-only, **insert and delete but deliberately NO update policy** — a review is a record of
    something that happened and nothing should be able to rewrite one.
    · **`revlog` came OUT of `PROGRESS_FIELDS`**, so `save()` no longer carries it, and **`progressBlob()`
      (PROGRESS_FIELDS only) is what `supaPush`/`supaQueuePush` now send** where they used to send
      `extractProgress()`. `extractProgress()` still INCLUDES `revlog`, because the guest stash is a whole
      device state rather than a synced blob and a guest's history must survive a sign-in.
    · **THAT SPLIT OPENED AN ACCOUNT-SWITCH LEAK and closing it is not optional**: with the log outside the
      blob, adopting a second account's progress left the first account's card history sitting in
      localStorage. `applyProgress` clears `S.revlog` and removes `REV_SYNC_KEY` — the same rule
      `_supaOwner` exists for one level up.
    · **The push is INCREMENTAL and keyed on a HIGH-WATER TIMESTAMP** (`REV_SYNC_KEY`, device-local like
      `_supaTs`), in batches of `REV_BATCH`, with `Prefer: resolution=ignore-duplicates` over the unique
      `(user_id, card_id, reviewed_at)` index — so two devices pushing the same session, or a retry after a
      half-failed batch, cannot double-count. `resetProgress` calls `revWipeRemote()`, or a reset would clear
      the device and leave the archive behind to be re-adopted.
    · **`REV_CAP` (20000) still exists and is a LOCAL bound, not a limit on the archive** — the rows are on
      the server, and what is kept on the device is what Card info and the answer-buttons chart read. ~42
      bytes a row, so a full local log is ~840 KB, about three years at twenty reviews a day.
    · What wanted the uncapped archive is the **FSRS optimiser**, which shipped days later and reads every row
      through `revFetchAll` — see THE FSRS OPTIMISER above. This is the bullet to read before adding anything
      else that grows per review: give it a table.
  · **UNDO TAKES BACK ITS OWN ROW BY IDENTITY** (`lastRevRow` → the snapshot's `revRow` → `undoRevRow`), and
    this is the one piece that cannot be done the obvious way. The undo snapshot is taken BEFORE the grade,
    so it cannot hold a row that does not exist yet: `grade()` leaves the row it appended in `lastRevRow` and
    `doGrade` copies it onto the snapshot afterwards. Splicing what `indexOf` finds is exact under pruning,
    under a requeued step and under a session's fortieth undo alike — where **"remove the last row" takes
    somebody else's review off** and **a recorded length silently keeps the phantom one**, since the log
    prunes from the front and a length taken before an append can equal the length after it.
  · **Read by two surfaces, and they are deliberately different shapes.** **Card info** (`openCardInfo` /
    `cardInfoRowsHTML` / `cardInfoHistHTML`, on a `deckSheet`) is reached by **Info** in the study bar or
    **`I`** — Anki's key — and is in two halves for a reason: the STATE block comes from the card record, so
    it is complete for every card ever studied, and the HISTORY table can only show what the log holds, which
    begins the day the log shipped. **A card studied for months before that shows its true state above an
    honestly short history and says which it is** — fabricating rows from the interval and ease would be
    inventing a reader's own past. The **Answer buttons** card (`answerButtonsHTML`, `ANSWER_WINDOW_DAYS` 30)
    renders **nothing at all** on an empty log rather than an empty panel beside a heatmap holding a year of
    real history, and where the log is younger than its window it names its own age instead of reporting a
    quiet month as a quiet thirty days.
  · The Info button is in the **study bar**, not the grade bar: that bar's phone layout is a fixed three-cell
    row (`"help undo suspend"`) and Undo is duplicated down there because a misclick is URGENT, where asking
    why a card is due is not. The `I` key is guarded on `typing` for the reason Ctrl+Z is — the cloze box
    takes focus as every card opens.
  · The card-info sheet is the one `deckSheet` that can outgrow the screen, so `.ci-sheet .dm-box` is capped
    and **`.ci-histwrap` is the part that gives** (`flex:1 1 auto; min-height:0`), keeping the state block and
    Close put while the history scrolls between them. The answer-buttons bar sits in a **track of its own**
    (`.ab-track`) because a percentage height resolves against its containing block, and an `<i>` that is a
    sibling of the labels grows over the word beneath it.
  · **AN OVERLAY OVER THE CARD OWNS THE KEYBOARD** (`OVERLAY_SEL` / `overlayOpen`, beside `swipeEnabled`),
    which this panel is what forced: every study shortcut acts on the card UNDERNEATH, so a reader who opened
    Card info mid-card and pressed `3` graded the card they were reading about — invisibly, the sheet being
    over it — and Ctrl+Z undid a grade they could not see. It is the Enter-on-a-focused-glossary-term bug one
    level up: there a CONTROL owned the key, here a whole panel does, and the fix also covers the gloss popup
    and the image viewer, which had the same hole. **ONE list, shared with the page swipe**, since both ask
    the same question of it and a second copy would drift invisibly.
  · Guarded by **`.claude/test-revlog.js` (58 assertions)**. **Re-run after touching `logReviewEntry` /
    `revRead` / `revForCard` / `revWindow` / `grade()`'s logging / `shownAt` / `undoRevRow` /
    `openCardInfo` / `answerButtonsHTML` / `OVERLAY_SEL`.**
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
    make a count go backwards and re-flag a place as newly discovered. Measured: 401 glossary terms and
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
      **`--newterm`, a teal of its own**. It wore `--ochre`, the gold of the blank in a card's question,
      until Aug 2026, when the two roles were SWAPPED on request: the Library books gave up the teal they
      had been using for their note markers (those now take the card's vermilion like every other citation
      on the site) and it moved here. **The reasoning that chose the hue holds either way** — every
      neighbouring token is spoken for, and this teal is none of them — and the swap ends a real collision:
      a card's blank and an unread term in the SAME gold, in the same sentence, said the two were the same
      kind of thing. **A term already read carries no attribute and renders exactly as every
      glossary link always has** — the familiar state is untouched, because the mark is the invitation,
      not a record of what is finished. (It was briefly the other way round — read terms dimmed — and was
      changed on request; don't reintroduce that.) It writes an explicit `data-new` rather than styling
      `:not([data-seen])` **because deck terms are in neither register** and would otherwise sit marked and
      undiscoverable forever. `.ttip[data-new]:hover` keeps the teal — jumping to the indigo hover would
      read as the term changing state before it was opened — and sits **after** the base `:hover` rules
      (equal specificity → source order). `refreshTtipNew(key)` re-marks every matching link on the page
      the moment a popup opens, so the prose behind it loses its mark at once, not on the next render.
      **`body.hc` re-tones `--newterm`** with the other quiet tokens; `test-a11y.js` covers it with no
      change of its own, and `test-artefacts.js` asserts the swap in both directions.
    · The **first** opening also shows a gold chip (`discChipHTML` → `.disc-chip`): "New term! 41 / 401"
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
  `CARD_DIFFICULTY_MIN/MAX`, `GAME_MAX_DIFFICULTY`, `cardDifficulty()`, `difficultyOK()`, `gameCardIdSet()`;
  Aug 2026, on request). An integer **1–5 rating HOW WELL KNOWN THE ANSWER TERM IS to the general
  population** — not how hard the card is, which is a different question and conflating the two is the one
  way this scale stops meaning anything. **Every shipped card is rated** (29 / 63 / 129 / 141 / 138 across
  the five rungs at 500 cards, so 92 sit at or below the games' bar — **count them rather than quoting
  that**, which said 409 and 58 for months: `node .claude/test-difficulty.js` prints the distribution).
  · **THE SCALE** (stated identically in app.js, `.claude/add-card-difficulty.js`, `add-card.js` and here —
    keep the four in step): **1** household name, almost any adult would recognise it (Stone Age, Homer,
    Sparta, Neanderthal); **2** generally familiar, an ordinary secondary education reaches it (Neolithic,
    Knossos, phalanx, Lascaux); **3** known to the interested, a reader who follows history (Linear B,
    hoplite, helots, Clovis culture); **4** specialist, mostly met inside the subject (Gravettian, megaron,
    bucchero, Kamares ware); **5** highly obscure, named in the scholarship and almost nowhere else
    (`qa-si-re-u`, Nichoria, Howiesons Poort, Iguvine Tables). **Rate the WORD a stranger would be shown**:
    a subtle card about `Homer` is still a 1, and a beautifully clear one about `qa-si-re-u` is still a 5,
    because a reader who has never met a word cannot be eased into recognising it by prose.
  · **WHAT IT IS FOR is the daily games, and STUDY IS UNTOUCHED.** A study card arrives with three hundred
    words of background behind it and comes back tomorrow if you miss it, so an obscure term there is the
    point of studying. A minigame deals the term COLD — four options, a crossword square, a picture — and a
    pool holding `qa-si-re-u` and `Howiesons Poort` deals unanswerable rounds. Every card is studiable, in
    every deck, at every rating; `availableCardIdSet` knows nothing about difficulty and must not learn.
  · **`gameCardIdSet()` IS THE ONE DOOR, and that is the point of it being a function.** It is
    `availableCardIdSet()` narrowed by `difficultyOK`, and **every card-fed game goes through it** —
    Multiple Choice, Timeline, the Crossword and the card half of the Picture round. A sixth game added
    later reaches for this instead of `availableCardIdSet` and is covered without anybody remembering the
    rule; `test-difficulty.js` reads each pool function out of app.js and asserts there is no other path.
    It filters the **distractors** as well as the answers: a round whose wrong options are `lawagetas`,
    `qa-si-re-u` and `damos` is answerable by elimination and teaches nothing.
  · **AN UNRATED CARD IS TREATED AS TOO OBSCURE, deliberately.** Erring the other way would let one unrated
    card deal a round nobody can answer, silently. The cost is that the failure is silent in the other
    direction too — a card arriving unrated simply stops appearing in the games, with nothing on screen to
    say so — which is why `add-card.js` REFUSES a new card without a rating rather than defaulting one, and
    why `test-difficulty.js` asserts the whole corpus is rated on every run.
  · **THE PICTURE ROUND IS PARTLY FILTERED and the limit is stated rather than hidden**: its pool reaches
    past the cards into the glossary and the artefacts, and `difficulty` is a card field, so those two enter
    as they always did. Rating the 836 glossary terms is a separate content pass.
  · **What year? is NOT on this filter — it left the cards entirely** (see the `whatyear.js` bullet in the
    File map). Under the bar exactly one year kept five cards, so the game would have asked the same
    question every day; it has an event pool of its own now.
  · **THE CROSSWORD'S DRAW CAP HAD TO SCALE WITH THE POOL** (`dailyCrossword`), found by the 730-day sweep
    the day the filter landed. It was a flat `slice(0, 40)`, which samples nothing once the pool is smaller
    than 40: every day drew the whole pool, the length sort put it in the same order, and only the layout
    RNG differed — **730 distinct grids became 60**, a repeat every fortnight. Nothing throws and every grid
    is still full; the game just quietly stops being daily. Taking a fraction restored it to 577, and a
    pool of 40+ still draws 40, so the large-pool behaviour is exactly what it was.
  · **THE READER SEES IT, AS FIVE STARS IN THE CARD'S TOP RIGHT** (`cardStarsHTML` / `.card-stars`, Aug
    2026, on request). Three decisions. It renders as **NOTHING at 0** — every community-deck card and any
    curated card not yet rated — because five empty stars claim a rating of zero, which is not on the
    scale. It is **DECORATIVE to a screen reader**: one `aria-label` on the row says the rating in words
    (the `CARD_DIFFICULTY_LABELS` wording, so the star row and the tooltip cannot disagree), where five
    identical glyphs read out one at a time say nothing. And the colour is the QUESTION/ANSWER label's own
    `--indigo` at the same `.5` opacity, on request, so the corner reads as the card's own furniture rather
    than as a second kind of mark; an unearned star is the same colour at a fraction of the opacity, which
    reads as an outline without needing a second glyph. It is absolutely positioned so it costs the
    question no width, and it steps left of `.tts-mute`, which holds that corner when read-aloud is on.
    **AND THE WHOLE HEAD LINE IS TWO FLEX ROWS, NOT ONE** (Aug 2026, on a bug report that the dot, the
    word QUESTION, the phrasing counter, the DIFFICULTY label and the stars sat at four different heights).
    `.q-head` centred the two BOXES and inside `.label` the parts were still INLINE, so each aligned by its
    own rule — the dot on the BASELINE (a 7px circle sitting on it has its centre well above the text's),
    the counter on `middle`, the play triangle on the baseline again — and the stars, being a box rather
    than text, centred against none of them. `.q-head .label` is `display:flex; align-items:center` now, so
    every part of the label centres on one line and that line centres against the stars, at every text size
    and with no offset anywhere; the per-part `vertical-align` rules are inert in flex and are left as they
    are for any other context that ever renders them. **The dot went to `opacity:1` in the same pass, also
    on request** — it is the one mark on the card saying where this card stands, and the `.85` it wore was
    holding the strongest of the three signals back for no reason.
  · **THERE ARE TWO RATINGS AND THE CARD SHOWS WHICHEVER IT HAS EVIDENCE FOR** (`CARD_STATS` /
    `CARD_STATS_MIN` / `CARD_GRADE_WEIGHT` / `cardStatsFor` / `cardDifficultyShown`, Aug 2026, on request).
    `card.difficulty` is an EDITORIAL judgement about how well known the answer term is, made once when the
    card is written; what a reader actually wants to know is how hard the card is to answer, which only the
    answers can say. So every grade is counted (`bump_card_grades`, an RPC in section 13 of
    `.claude/supabase-schema.sql` — **the user must run it once**; it clamps each increment to 0–50, caps a
    batch at 500 rows and validates the id, since anyone with the publishable key can call it), and once a
    card has **`CARD_STATS_MIN` (20)** answers the stars show the community figure instead. Four decisions.
    **It is ANONYMOUS AND AGGREGATE** — four counters per card, no reader attached — which is what makes it
    safe to publish and to read without a session. **The threshold is what stops one bad morning becoming a
    rating**: below it the card keeps the editorial one, so a new card is never rated by three people.
    **`pct` is null on the editorial rating**, deliberately: it is a judgement rather than a measurement and
    printing it as a figure out of a hundred would dress it up as one, which is why only the community
    rating carries `.cs-pct`. And **the rank is derived from the percentage** (`floor(pct / 20) + 1`) rather
    than stored, so the two ratings share one five-star scale and one row of markup.
    **ONLY A READER'S FIRST THREE ANSWERS TO A CARD COUNT** (`CARD_STATS_SIGHTINGS` (3) / `c.seen` /
    `cardStatsUndo`, Aug 2026, on request: "this way we actually rate how hard it is to LEARN the card, not
    just how well-known it is when it first appears to them"). Every grade used to be counted, and a card is
    graded for as long as it is studied — so a well-scheduled card converges on Easy whatever it cost to
    learn, and the figure slowly stopped measuring difficulty at all and started measuring how long the deck
    had been in use. Three sightings is where the learning happens.
    **THE COUNTER IS ON THE CARD RECORD (`c.seen`), which is what makes an undo free**: it rides in the
    synced blob with the rest of `S.cards`, needs no field of its own and no migration (an absent key reads
    as 0, so every existing card starts its three from today), and `resetProgress` clears it with the
    schedule it belongs to. **`schedForget` deliberately does NOT reset it** — forgetting is a statement
    about the SCHEDULE, and a reader who has already met a card three times cannot un-meet it.
    **AND THE UNDO READS THE SNAPSHOT, NEVER THE REVIEW LOG.** `doGrade` records `snap.g = g` and
    `undoGrade` withdraws that vote, because `REV_GRADE_NAME` is CAPITALISED where `CARD_GRADE_KEY` is not:
    a grade recovered from the log would not match a stats key, the withdrawal would quietly do nothing, and
    a mis-graded card would keep a vote it never earned — with nothing on the page to say the rating is one
    answer too heavy. Guarded by `.claude/test-spelling.js`, which reads all five lines out of `app.js`.
    **THE WORD "Difficulty" IS PRINTED BESIDE THE STARS** (same request): five small stars in a corner say
    that something is being rated and not what. Set small and thin, so it labels the row rather than
    competing with the question beside it. **AND IT IS THE FIRST TEXT IN THAT ROW, SO IT NEEDED A
    `body.hc` RULE** — the stars are SVG and `test-a11y.js` measures text, so until the row gained words
    there was nothing there to measure. Both the word and the community figure are `--indigo` held down by
    opacity, which over the six themes in both modes is **1.77–3.28** and **2.06–4.70** — quiet on purpose,
    short of the bar in all twelve, and correctly REPORTED rather than failed in the default mode. Opacity
    is not the rescue: at full strength the indigo is still 3.32 on gazette's dark card. So with the mode on
    they become ordinary `--ink`, which is what the re-tone does for every other quiet token. **A row that
    gains its first text node gains an accessibility surface it did not have.**
    **AND `test-a11y.js` COULD NOT SEE IT, WHICH IS THE HALF WORTH CARRYING**: its high-contrast sweep
    walks `ROUTES`, and `study` is deliberately not a restorable hash — so it visited every page a reader
    can type and none of the one they spend their time on, and the assertion "nothing falls short" was
    passing on a set that excluded the whole study card. It reaches one now, the way a reader does, with a
    guard asserting the card and the difficulty row are actually THERE: a sweep that reached no card would
    report clean for the worst possible reason.
    **AND THE FIRST THING IT SAW THERE WAS NOT THIS ROW BUT THE GRADE BAR**, failing in all twelve
    combinations — which is the argument for widening a sweep even when you are widening it to check your
    own change. Its three text runs are white at 1, .82 and .6 over four saturated backgrounds, and
    measured they are 2.25–4.56 for the label, 1.97–3.64 for the interval and 1.66–2.69 for the key: the
    site's most-used control, wrong since the bar was built, and unreported because nothing had ever
    looked. **The fix is the BACKGROUND rather than the ink**, and that follows from what the colours are
    for — the four hues ARE the four answers, so re-toning the text to a common dark would take the bar's
    whole language away, while darkening each background by a factor of .67–.99 keeps every hue and simply
    stops it being a pastel. Solved per colour and per mode with all three runs at full-strength white;
    every one lands 4.61–4.71. **The rules are written `body.hc:not(.night)` / `body.hc.night` (0,4,0),
    not `body.hc` (0,3,0)** — `.night .grade.again` is (0,3,0) and sits a thousand lines below the
    CONTRAST block, so at equal specificity source order would win and the night bar would be untouched.
    **The RPC degrades rather than breaking** — a database without
    section 13 answers 404 and the card simply keeps its editorial rating, which is the standing rule that a
    later schema block is never a prerequisite.
  · Written by `.claude/add-card-difficulty.js` in batches, editable per card in Admin → Cards (a select in
    the meta row beside the chronology — it offers the five ratings and **no "unrated" row**, since an
    undefined delta does not survive JSON round-tripping and a control whose only use is to drop a card out
    of the games by accident is not worth having). Carried by `serializeCardData` and restored by
    `revertCard` — **a serializer that forgot it would strip every rating from data.js on the next admin
    keystroke**, which is why that is asserted rather than assumed.
- **SOME TERMS DO NOT HAPPEN AT A TIME, AND TIMELINE MUST NOT ASK** (`card.undatable`, `cardUndatable()`,
  the filter in `chronoPool()`; Aug 2026, on a bug report — "there are some answers which really shouldn't
  have a specific starting date, e.g. human evolution"). The sibling of the difficulty rule above: a second
  editorial fact about the ANSWER TERM that decides whether a game may deal it. **14 of the 500 cards carry
  it**, all of them inside the games' pool, leaving Timeline 78 of its 92.
  · **THE TEST IS WHETHER THE SORT YEAR IS A DATE THE TERM IS CONVENTIONALLY GIVEN**, and it fails two
    ways. A term may not be **located in time at all** — a physical feature (`Tiber`, `Apennines`,
    `Dardanelles`), a material (`Ochre`), a condition (`Ice age`), a way of life (`Hunter-gatherer`), a
    category (`zoonotic disease`), a question (`origins of social inequality`) or a modern method
    (`ancient DNA`, which sorts a prehistory card at 2010 CE). Or it may be a **process so diffuse that
    the earliest figure on its date line is one arbitrary moment inside it**: `human evolution` sorts at
    8 Mya because that is where the ape line split, which is not when human evolution happened — it is one
    end of the span the term names as a whole, and the same card prints the other end.
  · **A LONG PROCESS IS NOT AUTOMATICALLY UNDATABLE, which is the half that keeps the game worth playing.**
    `domestication`, `animal domestication` and the `Neolithic Revolution` each ran for millennia and each
    sorts at the onset a reader would give it, which is about the precision a Timeline round is answered
    to. Flagging those would empty the game of exactly the terms it is for. **Two of the flagged cards
    argue the case in their own opening sentence** — `Ice age` is "not a slice of time but a climate
    condition" and `Hunter-gatherer` "names a subsistence strategy rather than a period of the past" —
    which is the shape to look for.
  · **IT IS TIMELINE'S RULE AND NOTHING ELSE'S.** Multiple Choice, the Crossword, the Picture round and
    Common Thread ask what a term IS, which a process answers perfectly well; only this game asks WHEN. So
    the filter is in `chronoPool` rather than in `gameCardIdSet`, and `test-difficulty.js` asserts it is
    absent from every other pool as well as present in this one.
  · **THE DECK'S OWN ORDER IS UNTOUCHED**, and that is why this could not be done with the existing
    "timeless" machinery (`ADMIN_EDITS.chrono[id] = "none"`, which `cardStartYear` reads): human evolution
    belongs at 8 Mya among its neighbours in the study deck, and setting it timeless would file a
    prehistory card in the middle of the Roman ones. `cardStartYear` therefore knows nothing about the
    flag — asserted, since a later tidy-up would naturally put the two together.
  · **THREE OF THE FOURTEEN ARE FLAGGED BELT-AND-BRACES.** `Apennines`, `Tiber` and `origins of social
    inequality` carry no date line, so they were already out of the game for want of a year; the flag is
    what stops a date line added later walking them silently back into it. (`Dardanelles` is not one of
    them — it has a year, off graves beside the strait, so flagging it really does remove it.)
  · **IT ONLY BITES ON A CARD THE GAMES CAN REACH**, i.e. rated at or below `GAME_MAX_DIFFICULTY`, so the
    pass that applied it went over those 92 and not the whole corpus. **A card RE-RATED down into the pool
    needs the judgement made about it** — that is the one way the corpus can quietly regrow an unflagged
    process, and nothing can detect it, since no rule can read an onset off a date line and tell it from
    one end of a span.
  · Written by `.claude/mark-undatable.js` in batches (which demands a reason naming the kind of thing the
    term is, refuses the batch outright rather than half-applying it, and prints the pool it leaves),
    accepted on a new card by `add-card.js` (optional, and type-checked — `true` or nothing), and editable
    per card in Admin → Cards as a **"no single date" tick** beside the difficulty select. Carried by
    `serializeCardData` and restored by `revertCard`, for the reason the rating is: a serializer that
    forgot it would strip all fourteen flags on the next admin keystroke and put a river back in the game.
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
  · **…and the ENTRY points back at the prose** (`srcNumHTML` / `jumpToMarker` / `markerForNumber` / `.src-n` /
    `.src-back`, Aug 2026, on request). The jump down had worked since the apparatus shipped and the return had
    no way in at all, because the entry's number was a **`::marker`** — which takes no `tabindex`, carries no
    accessible name and swallows no click of its own. So `list-style` is off and the number is an ELEMENT that
    both producers write (`sourceListHTML` and the book's `bookNotesHTML`), with the hanging indent coming from
    a flex row rather than each variant's own padding arithmetic.
    **Only a number some marker actually points at becomes a control.** `wireFootnotes` is the one pass that can
    see both ends — it has just numbered the markers and dropped the over-range ones — so it collects the numbers
    that survived and promotes those entries, leaving an uncited one a plain number. That is the dead-header
    lesson one level along: a surface that never gets the pass shows **no control** rather than a dead one, which
    is exactly the Atlas panel, whose prose carries no markers and which never calls `wireFootnotes`.
    **It returns to the marker the reader LEFT FROM**, recorded on the entry by `jumpToFootnote` as `_fnFrom`:
    a note may be cited several times over — Seneca's letter 114 cites one note four times — and coming back to
    the first citation when the reader jumped from the fourth lands them in the wrong sentence. Falling back to
    the first is the only other honest answer, and `markerForNumber` climbs the way `noteForNode` does, stopping
    at `<body>`, so a book's notes can never send the reader into a gloss popup open over them. Both ends reuse
    `scrollNoteIntoView` (it clears the same furniture either way) and the same `.src-flash`, so the reader is
    told which one at both ends. Guarded by `test-sources.js` and `test-library.js`.
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
  · **A BOOK'S MARKERS TAKE THE CARD'S VERMILION** (Aug 2026, on request — they wore a teal of their own,
    `--bknote`, for a fortnight). The argument for separating them was that a card's marker points at a
    work Folio is citing while a book's points at the TRANSLATOR's own note, which is a different kind of
    thing; the argument against, and the one that won, is that a reader meets both and **one apparatus is
    easier to learn than two**. So there is **no `.bk-page` override at all** — the reader inherits
    `sup.fn` and `.src-n.src-back` unchanged — and the token moved rather than being deleted: it is
    `--newterm` now, and it marks an undiscovered glossary term (see the discovery-marks bullet, which is
    where the reasoning that chose the hue lives). `test-artefacts.js` asserts both ends of the swap, and
    it compares a book's marker against a CARD's rather than against a hex literal, so a re-toned `--zh`
    moves both together.
  · **A card's, the Atlas panel's and a BOOK's folds are OPEN by default; a GLOSS POPUP's is always SHUT.** On
    the big surfaces a citation the reader has to go looking for is one they will not check, and checking is the
    whole point of shipping the apparatus (July 2026, on request — they were collapsed before; the book's notes
    joined them Aug 2026, also on request). **A reader who
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
  · **A MARKER JUMP MUST CLEAR THE FURNITURE, AND MUST MEASURE A FOLD THAT IS ALREADY OPEN**
    (`openFootnote` / `scrollNoteIntoView`, Aug 2026, on a bug report: on a phone the jump "doesn't quite go
    far enough to see the actual note"). Two faults compounded, and each is invisible to a test that only
    asks whether the note is in the viewport.
    · `scrollIntoView({block:"nearest"})` brings the item's bottom flush with the **scrollport's**, and the
      scrollport is the whole viewport — which on a phone has a 58px tab bar fixed over the foot of it. So
      the note arrived UNDERNEATH the bar: in view by the browser's reckoning, unreadable by the reader's.
      Measured on a 390×844 phone, the note landed at 807–844 with the bar starting at 786.
    · `.src-collapse` opens over .38s (`grid-template-rows` 0fr → 1fr), and the scroll was issued in the
      same tick — so it was computed against a list still zero pixels tall and stopped short by however
      tall the list was about to become. Same phone, fold shut: the note landed at **850–887, entirely
      below an 844px viewport**. Worst exactly where it was noticed, at the foot of a long chapter, where
      the notes are the last thing in the document and the page cannot scroll that far until they exist.
    The fold is now expanded WITHOUT its animation before anything is measured (animating would only mean
    scrolling to a moving target; the scroll IS the movement asked for), and `scrollNoteIntoView` reads the
    bars off the custom properties that position them (`--bar-h`, `--tabbar-h` — both 0 on the side of the
    breakpoint where they do not exist, so this cannot drift out of step with them). Already clear of both →
    **nothing moves**, since a note the reader can see should not jolt; otherwise it is placed in the middle
    of what is genuinely visible, except when the note is taller than that band, where it is aligned to its
    top — centring a long note lands the reader mid-sentence. A note inside its OWN scroller (a gloss popup's
    body, the Atlas panel's columns — `noteScrollParent`) has no fixed furniture over it and keeps
    `scrollIntoView`. Guarded by `test-library.js`, which asserts against the tab bar's own rendered box
    rather than a hard-coded 58, from an open fold and from a shut one.
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
    On the CARD surface the panel is no longer a textarea (Aug 2026, on request): each citation is its own
    **rich contenteditable row** (`#cesSrcList` → `.ces-srcitem[data-rich]`, numbered by an `<ol>` exactly as the
    card numbers them), so a Chicago note — which is mostly italicised title — is written **as it reads** rather
    than as `<i>…</i>` in a text box, and the ribbon's italic button applies to it. `srcItems` is the working
    list, like the question pool: blanks survive editing and `normSources` drops them on the way to the store.
    Everything is DELEGATED on the list (input / keydown / paste / the row's ×) because the rows are rebuilt
    whenever one is added or removed, and **`wireRichEditor` now picks up the active field by a delegated
    `focusin` on the host** rather than a listener per element — without that, every row created after it ran
    would be unreachable from the ribbon. The URL and the `[Open access]` / `[Paywalled]` label deliberately stay
    PLAIN TEXT in the row: the card builds the link and the chip at render time, and showing them already
    converted would leave nothing to edit.
  · **The ribbon's `+Source` button** (`#rtFootnote`, added by `rtRibbonHtml({footnote:true})`, so only where a
    sources list exists — a glossary description has none). One press does both halves of a footnote: an EMPTY
    `<sup class="fn" data-fn="N">` at the caret in the background (or at its end if the caret is elsewhere) and a
    blank citation row waiting below, focused. The `N` is a starting value only — the card draws the real number
    from the list, which is the whole point of writing the marker empty. It never stacks two blank rows: a second
    press lands in the one already waiting. Shown only while the background is the active field (`.rt-fn` follows
    the ribbon's existing `.on-bg` class, like `.rt-link`).
  · **The ribbon is sticky, and which scrollport it pins to depends on the surface.** The desktop `.admin-editor`
    pane scrolls inside itself (`top:0`); the Studio and the phone scroll the whole PAGE, where it has to clear
    the sticky top bar (`top:calc(var(--bar-h) + 6px)`, z-index 30 — under the bar's 50). **On ≤860px
    `.admin-editor` is given `overflow:visible`**: it stops scrolling inside itself there, and a scroll container
    that never scrolls is a scrollport its sticky child can never leave, which is why the ribbon used to scroll
    away on a phone.
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
    **`GLOSSARY_SOURCES` carries ALL 401 terms** (batches G1–G11, P1–P7, C0–C12, D1–D3, N1–N10, 2026-08-01/03 — the genus, species, specimen,
    stone-industry, three-age, periodisation, geological-time, type-site, way-of-life and discipline terms, plus the
    Indigenous-peoples group, its odds and ends, the poles / desert / ocean / two historiographic names, the six
    continents with `Sicily`, `Equator` and the two hemispheres — which completes Phase 1 — and the first six
    US presidents, Jackson to Polk, Taylor to Andrew Johnson, Grant to McKinley, Theodore Roosevelt to
    Hoover, Franklin D. Roosevelt to Nixon, and Ford to Biden — **all 45** — plus C0's six pilot
    countries, C1–C2's twenty-five EU member states, C3's four non-EU European states and C4's seven
    Commonwealth states in Asia, C5's four more, C6's thirteen African Commonwealth states, C7's eleven — the rest of Commonwealth Africa plus the first terms carried by the Office of the Historian's recognition guide — C8's fourteen non-Commonwealth African states and C9's last fourteen, which COMPLETE AFRICA at 56 of 56, C10's thirteen, which COMPLETE OCEANIA, C11's twenty across North and Central America and the Caribbean, C12's twelve in South America, D1's nineteen, which clear the European deferral list, D2's thirty-one, which clear the Asian one, and D3's last four), against
    a bar of **`GLOSS_SRC_TARGET` (2)**, which is lower than a card's five because a description is three sentences
    where an abstract is ten; `docs/glossary-citation-plan.md` is the plan for the rest and
    `node .claude/gloss-source-audit.js` says where it stands. The UI, the deltas and the pipeline are in place;
    the rest is a content job (see "Citing the existing content" below). Guarded by `.claude/test-sources.js`
    (74 assertions).
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
    before any rule runs. **THAT MASK ONLY EVER COVERED HALF THE CORPUS, and the other half was found on
    2026-08-08**: it matches the CARD shape `"sources":[…]`, and glossary citations live in a TOP-LEVEL
    `window.GLOSSARY_SOURCES` block with no such key, so nothing in the glossary was ever masked. Reproduced
    before fixing by running `--fix` on a throwaway copy: it renamed **six real published works across twelve
    citations** (Lemos's *…Late Eleventh and Tenth Centuries B.C.* → *…Late 11th and 10th Centuries B.C.*,
    Camp's *A Drought in the Late Eighth Century B.C.*, Dickinson's *…Twelfth and Eighth Centuries BC*). The
    whole block is masked now, and so is the **`COLLECTION_TREE`** — a deck title is neither a card field nor a
    glossary description, so it is outside the rules' stated scope, and the checker had been reporting
    `gr-fourth-century` and `ru-nineteenth` on every run. It now reports both files clean and `--fix` applies
    0 changes. **The lesson is that a mask keyed on one file's SHAPE is not a rule about
    citations** — when a checker grows a second corpus, re-derive what it is meant to skip there rather than
    assuming the existing guard travels. Where a language's sentence split diverges from English (zh on `wh-022`), **repair
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
- **Card image (optional):** `card.image = { src, title, desc, credit, alt }` — rendered by `buildBack` as a **16:9
  frame** (`.card-img`, `cardImageHTML`) at the top of the Background section, above the prose (the section now
  renders when a card has an image even without an abstract). Clicking it opens the **fullscreen viewer**
  (`openImageViewer`: wheel zoom toward the cursor 1–8×, **pinch zoom**, tap toggles 1↔2.5×, drag pans when
  zoomed, **only the × and Escape close**, `closeImageViewer()` runs in `render()`), with title/description/source
  in a bottom caption bar (a URL source becomes a link). One **delegated** document click/keydown listener opens
  it from any `.card-img` (study, previews, editor) via the figure's `data-img-*` attributes — no per-render wiring.
  **NOTHING INSIDE THE STAGE CLOSES IT** (Aug 2026, on request: "a click on the image itself should not close
  it; instead it should be possible to zoom in, especially on mobile, and only the X in the top right should
  close"). A click on the image toggled zoom and a click on the space around it CLOSED, which is the same
  gesture landing a few pixels apart doing opposite things — and a picture opened to be looked at is one a
  reader zooms and drags about, so a close-on-backdrop rule reads the end of every clumsy gesture as "done".
  **AND ON A REAL DEVICE THE TAP HALF COULD NOT FIRE AT ALL, WHICH IS WHY IT WAS REPORTED AS "A CLICK ON THE
  IMAGE CLOSES IT"** — the finding worth carrying furthest. `stage.setPointerCapture(e.pointerId)` on
  pointerdown **RETARGETS every later event for that pointer to the STAGE**, so the `e.target === im` the
  toggle tested at pointerup was false for a real finger or mouse even dead centre of the picture, and the
  close branch took every press. Whether the press landed on the picture is now recorded at POINTERDOWN,
  whose own target is resolved before the capture it sets. **A synthetic `PointerEvent` dispatched at an
  element bypasses that retargeting entirely**, so a test written with synthetic events passes on the broken
  code — which is why `test-video.js`'s ninth section drives real mouse and real touch, and why a gesture
  bug should be reproduced with real input before it is believed fixed.
  **A VIDEO KEEPS ITS BACKDROP CLOSE**, deliberately: the player owns every pointer inside its own frame
  (scrub, volume, fullscreen), so there is no zoom to protect and nothing but the frame to tap past.
  **PINCH IS THE HALF THAT MADE THE ZOOM REACHABLE AT ALL** — there was only a `wheel` handler, so on a phone
  the 1–8× range could not be reached and the tap toggle was the whole of it. Two pointers are tracked in a
  `Map`; the pinch holds whatever was under the fingers' midpoint under it (the wheel's zoom-to-cursor
  arithmetic, from a baseline captured when the second finger lands) and follows that midpoint as it moves.
  Three things it has to get right, and each fails quietly: a second finger **cancels the one-finger pan** or
  the two fight over `tx`/`ty`; **lifting either finger must not count as a tap**, or the end of every pinch
  toggles the zoom back (hence the `pinched` flag, which survives until the last pointer is up); and
  `.iv-live` **kills the `transform` transition while a gesture is in flight**, or the picture eases 180 ms
  behind the fingers. `.iv-stage` already carried `touch-action:none`, so the browser never takes the pinch
  for a page zoom.
  **`alt` is the text alternative, and it is a field of its own** (Aug 2026, on request: "add alt text for
  images, which can be added when editing/making cards"). Deliberately not a reuse of `title`: a title NAMES
  the picture for a reader who can already see it, where alt text has to DESCRIBE it to somebody who cannot,
  and folding the two together is the commonest way alt text ends up useless. `cardImageHTML` and the
  fullscreen viewer read `img.alt || img.title || "Card illustration"` — the generic string only where there
  is neither, since an image with no alternative at all is worse than a weak one. It rides in `MEDIA_FIELDS`,
  so the editor's one media panel, the source gate, the store and the clearing path all carry it with no
  special case; the row is hidden when the pasted URL is a VIDEO, which announces itself through its player.
  Carried through `uCardSanitize` / `uGlossSanitize`, and warned about (never refused) by `add-card.js` and
  `add-glossary.js` — most shipped images predate it.
  **A file that will not load is handled** (Aug 2026): there is deliberately no upload path, so every picture
  and clip anywhere in Folio is somebody else's URL and link rot is a certainty rather than an edge case.
  A delegated **capture-phase `error` listener** (`error` does not bubble) marks the figure `.media-dead`.
  A READER gets nothing — `display:none`, because a broken illustration is worse than none and there is
  nothing they can do about it — while an AUTHOR keeps the frame, labelled "This link doesn't load"
  (`.ces-img`/`.ces-vid`), being the one person who can fix it. The click and Enter handlers skip a dead
  figure so it can't open an empty viewer, a dead one inside a gloss popup hides the whole floated
  `.gloss-imgslot`, and the home page's Term-of-the-day plate (a bare `.term-img`, not a frame) is removed
  and gives the discovery row its 2:1 layout back. The editor's EN view has the
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
  and **`frame-src`** for the two embed hosts. `.ces-imgpanel[hidden]{display:none}` is
  **required** — the author `display:flex` beats the UA `[hidden]` rule, and without it the panel sits
  permanently open and the click-to-edit toggle does nothing. Guarded by `.claude/test-video.js` (89 assertions).
- **MAP CARDS — a shape on a globe as the question** (the `MAP CARDS` block in app.js, just above
  `cardFrontHTML`; `us-states.js`; the Geography collection. Aug 2026, on request). The card shows a place
  shaded on a globe the reader can turn and zoom but not click, and asks what it is; the back names it and
  adds a box of figures. Two new card fields carry it — **`map`** (`{ layer, key, zoom? }`) and **`facts`**
  (`[[label, value], …]`) — and everything else about such a card is an ordinary curated card. Six decisions
  are load-bearing.
  · **IT IS A BUILT-IN FORMAT AND NOT A COMMUNITY CARD TYPE, and that was settled before anything was
    written.** A card type is templates plus scoped CSS and cannot run code — deliberately, since a type is a
    stranger's content and `sanitizeHTML` plus the CSP exist to keep it inert. A globe needs a canvas, an
    animation frame and pointer handlers, so it cannot be one, and the reasoning is worth keeping because
    the request said "a new card type" and the honest answer was that the machinery it needs is exactly what
    a card type may not have.
  · **THE MAP IS DRAWN HERE RATHER THAN BY REUSING THE ATLAS.** `PAGES.map` is one enormous closure holding a
    timeline, an editor, twelve layers, a search index and a game mode, all keyed to a full-bleed stage —
    none of which belongs in a 260px window on a study card, and half of which (clicking a country to open
    its panel) is exactly what this must NOT do. What is shared is the ARITHMETIC: `startCardGlobe`'s
    orthographic basis is the Atlas's `setBasis`/`proj`, so a state sits where the Atlas would put it.
  · **NOTHING IS CLICKABLE, which is the point of the exercise.** No click handler, no hit test, no hover.
    The pointer turns the globe and the buttons zoom it — a reader who could tap the shaded state and be
    told its name would not be studying. Asserted in `test-map-cards.js`, since a map that has become
    clickable looks exactly like one that has not.
  · **A MAP CARD IS KEPT OUT OF EVERY DAILY MINIGAME, BY CONSTRUCTION** (`gameCardIdSet` tests
    `cardMapSpec`). The games deal a question cold with no map beside it, so "the state shaded on the map is
    ____" is unanswerable there. Unlike `difficulty` and `undatable` this needs no editorial judgement and
    so needs no field: a card whose clue is its map is by definition unanswerable without it. It also means
    **`undatable` should NOT be set on one** — Timeline is behind that filter and can never reach it.
  · **THE FIT IS READ OFF THE SHAPE**, centred on Natural Earth's published label point and zoomed so the
    longest side fills a little over half the window, with `map.zoom` as an override no shipped card needs.
    Fifty hand-tuned numbers would be fifty things to keep right. Two subtleties: the fit is taken from the
    rings NEAR the label point (`nearRings`, ±25°), or **Alaska's bbox spans the antimeridian and it opens on
    the whole planet** — while every ring is still SHADED, or the Aleutians drop out of Alaska — and
    `fitTarget` takes those rings as an ARGUMENT rather than narrowing `target.p`, since `shapes[i] ===
    target` is what stops the target being drawn twice.
  · **AND IT IS HONESTLY INACCESSIBLE TO A READER WHO CANNOT SEE IT.** A shape is the whole question, so
    there is no text alternative that does not give the answer away — an `alt` describing the outline has
    answered the card. The canvas says what it IS and what to do with it, and the answer is announced
    normally once revealed, so the card can be READ where it cannot be ANSWERED. That is the Picture round's
    position; it is stated in `docs/geography-card-plan.md` rather than papered over.
  **THE SHADED PLACE IS THE ATLAS'S OWN SELECTION GOLD, AND `TINT_SEL` IS HOISTED SO THERE IS ONE OF IT**
  (Aug 2026, on request — it was `--ochre`, which renders as a mid brown, then briefly a gold of the
  widget's own). That constant lived inside `PAGES.map`'s closure where a card could not see it, so the
  card had a second gold; it is module scope now, beside `CARD_MAP_LAYERS`, and the Atlas closes over it.
  **Two golds for one idea is exactly how they drift**, and this pair drifts INVISIBLY — a card and the
  Atlas are never on screen together, so a second copy is just a slightly different gold nobody can see is
  wrong. Hence `test-map-cards.js` asserts both halves: `app.js` defines `TINT_SEL` **exactly once** (a
  re-copied local inside the closure would shadow the module one in silence) and the canvas really paints
  it, with the expected values **read out of `app.js` rather than written into the test** — a literal
  there pins today's value instead of the rule, which is `test-tour.js`'s own lesson about a button's
  label.
  **AND THE TREATMENT IS SHARED TOO, WHICH IT WAS NOT FOR A DAY** (Aug 2026, on a second request: "the
  gold overlay doesn't really look the same as when I click a country on the atlas page"). The card
  filled SOLID with a darkened edge, on the reasoning that the Atlas tints at 24% because a country
  there sits over borders, cities, terrain and an era fill, where a card's land is a flat wash — so a
  24% tint would leave the answer barely distinguishable. That reasoning was written down here and in
  app.js and **it was wrong**, in the way this file keeps warning about: it was reasoned about rather
  than LOOKED at. The tint is most of what the Atlas's selection looks like, and at a card's zooms one
  state fills a third of the window, so it reads perfectly well. It is now the Atlas's three marks
  exactly — `fillA` tint, `shadowBlur 9` glow, `lineWidth 2.6` stroke in `TINT_SEL.line`.
  **The three numbers are written out rather than derived from `TINT_SEL.rgb`**: the outline is a
  LIGHTER amber than the fill and the glow lighter still, and deriving them from one triple is exactly
  what would quietly flatten that.
  **PROVING IT IS A TINT NEEDED THREE ATTEMPTS AND THE FIRST TWO PASSED ON A SOLID FILL.** Picking the
  fill out of a histogram by how WARM it is skips it entirely — a 24% tint is nothing like as saturated
  as the solid gold it replaced, `r - b` falling from 209 to 54 — so the check measured an antialiased
  fringe. SEARCHING the histogram for any pair of bulk colours satisfying the blend is worse: the glow
  lays the same gold over the land at every alpha there is, so some pair always satisfies it. What works
  is the pixel at the CENTRE of the window, which is inside the shaded shape by construction (`fitTarget`
  centres on the target's label point, and Natural Earth's label point is inside its polygon) — the land
  is then solved back out of the blend and required to be a real bulk colour on the canvas. Verified by
  reintroducing the solid fill and the darkened edge; each fails.
  **AND `h2r` HAD TO LEARN `rgb()`**, since `TINT_SEL` states its colour as a triple: without that branch
  `parseInt` reads it as NaN, `|| 0` makes it black, and the state fills BLACK — which reads as a
  rendering fault rather than as a colour that failed to parse.
  **THE FIGURES SIT BESIDE THE ANSWER, NOT UNDER IT** (Aug 2026, on request), as a sibling of
  `.answer-main` inside the coloured box — the slot `.answer-tr` already occupies on a Chinese card — which
  is what lets them be a two-column grid rather than a row that wraps. They cannot be inside `.answer-av`
  and be to the right of it. Below 640px `.answer` stacks, so "on the right" has nowhere to be and
  `.card-facts` goes back under the answer at full width, still two columns, which at 390px is what the
  tiles were sized for anyway.
  **`facts` IS NOT THE DATE LINE and the two are easy to confuse**: `isDateList` caps the date line at four
  rows and demands a number in every labelled row, so `Capital · Sacramento` cannot go there — the date line
  carries dates and the facts box everything else, and a card may have both (`CARD_FACTS_MAX` 8, plain text).
  **A CITY IS A DOT, AND A STATE ALONE CANNOT ASK ABOUT ONE** (`map.dot`, `window.US_CAPITALS`; Aug 2026,
  on request — "when the answer term is a city, it should appear as a dot on the globe, not just show the
  state"). A capital card shaded Rhode Island and asked for Providence, which says only which state: every
  capital card in a state's subdeck would have been answerable from the same picture as its state card.
  `map.dot` names a point in the layer's own `points` table (`CARD_MAP_LAYERS` gained `points` and
  `dotWhat`) and it is drawn as **the Atlas's own focus mark** — the same gold at full strength, the same
  5.5px radius, the same dark ring — on top of the shaded state, so the state answers "where" and the dot
  answers "which place". Its NAME is held back until the reveal, and the reveal labels the DOT where there
  is one, left-aligned beside it rather than centred over it, or the mark it names is under the word.
  **THE COORDINATES ARE GENERATED, NEVER TYPED** — `build-us-states.js` emits `US_CAPITALS` from the same
  Natural Earth download as the shapes (10m populated places), because fifty hand-entered coordinates are
  fifty chances to put a city in the wrong state and a dot a degree out still draws, inside the shaded
  state, on a card that looks entirely correct. **`cities.js` is the wrong source and was checked**: it is
  in the ~9.9 MB `atlas` bundle, and it drops sub-100k capitals, so Juneau is simply absent.
  **THE MARKER IS `FEATURECLA: "Admin-1 capital"`, NOT `ADM1CAP`** — that field does not exist in this
  vintage, so the first extraction returned zero and a rule testing only the flag ships a dotless deck in
  silence; both are read now. Each entry carries the state it is IN (`{s, c}`), which is what makes the
  card's claim machine-checkable: `add-card.js` refuses a dot the table has not got, refuses one whose `s`
  is not the card's own `key` (the dot would fall outside the shape), and warns if the answer is not the
  city. The test asserts the same three off the shipped files, plus that every capital falls inside its
  own state's bounding box.
  **`add-card.js` validates the key against the real data file** and suggests a near match on a typo, since a
  key naming nothing paints an empty window and throws; it also refuses extra phrasings on a map card and
  holds its question to 5–20 words rather than 20–34, the picture being the clue.
  **THE ZOOM CEILING IS WHAT THE POLYGONS SUPPORT** (`CMAP_ZMAX` 180), not what a place wants: at 3dp every
  vertex sits on a 0.001° grid, which is half a CSS pixel at 180× on a 340px window and a visible step past
  it. The District of Columbia is 0.15° across and wants roughly twice that, so it is the one entry of the
  layer's 51 that is capped — measured, and reported by name by the test so a second cannot appear quietly.
  Guarded by `.claude/test-map-cards.js`, which sweeps the fit over all 51 shapes, **asserts the VIEW rather
  than sampled pixels** (an earlier drag check compared two pixels and reported "the drag did nothing" on a
  globe that had turned four degrees — both samples sat on the same flat fill), and pins its own copy of the
  fit formula against app.js so it cannot go stale. Its **section 7 is the dot**, and both ends of it are
  needed because they fail differently and silently: a dot that never resolves leaves a perfectly good STATE
  card under a city's question, and a dot drawn but never named on the reveal leaves the reader looking at a
  gold speck nothing accounts for. It asserts the pure `TINT_SEL.rgb` triple appears in a small ROUND
  quantity — which on a card is the dot and nothing else, the outline being a different colour and the fill a
  blend of this one — and that `mc-failed` is NOT set, a missing capitals table being exactly what would take
  the dot away without a word. **Re-run after touching the `MAP CARDS` block, `startCardGlobe` /
  `cardMapSpec` / `cardMapHTML` / `mountCardMaps` / `cardFacts` / `CMAP_ZMAX` / `TINT_SEL` /
  `serializeCardData` / `revertCard` / `gameCardIdSet`, `.claude/build-us-states.js`, or after adding a map
  card.**
- **ONE media panel on the card surface** (Aug 2026, on request — it was two, with a `.ces-media-swap` pill
  between them). A card shows one frame, so the editor offers one slot (`#cesMediaSlot`) and one panel
  (`#cesMediaPanel`, fields `data-mediafield="src|title|desc|credit"`), and the pasted URL decides which of the
  two stores it lands in: **`videoSource(url)` already recognises every link the player can take, so anything it
  does not recognise is a picture.** Asking the author to classify a URL Folio can classify itself was the whole
  of the old two-box design. The stores stay separate underneath (`card.image` / `card.video`, and the one-frame
  rule the writers enforce) — only the editor stops making the distinction the author's problem.
  Three details are load-bearing. **`mediaKind` must be settled BEFORE the gate stages the value**, since the gate's
  own `input` listener is what calls `set()` — hence the listener `wireLiveCardEditor` installs on the URL box
  *ahead of* `wireMediaSource`. **Emptying the URL leaves `mediaKind` alone**, so the clear reaches whichever store
  actually holds the media instead of defaulting to the picture one. And **when the kind flips, the title,
  description and source are emptied first**, while `mediaKind` still names the old store: they described the old
  file, and a credit line silently re-attached to a new one is the same mistake as no credit at all (it also
  clears the old store, one frame per card, and the new URL then arrives uncredited and is held back). The gate's
  `kind` may now be a **getter** (`mediaKindLabel` unwraps it) so the "where does this come from?" modal words
  itself for whatever was just pasted. The glossary editors keep their own separate image/video panels.
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
  `.claude/test-media-source.js` (36 assertions).
- **Glossary video (optional):** `window.GLOSSARY_VIDEOS` (slug → the same object; `glossVideo(key)`,
  `ADMIN_EDITS.glossaryVideos`, baked by `serializeGlossary`), or `entry.video` inside `UGLOSS` for a
  community deck's own term. `renderGlossImage` puts it in the **same `.gloss-imgslot`** at the same fixed
  height — **one frame per term, like a card**, so setting one retires the other and the picture wins if a
  hand-authored `glossary.js` carries both. Edited in the curated glossary editor's **EN view only**
  (`data-gvidfield` → `setGlossVideoEdit`) and in the Studio's term form (`data-gvid` → `uGlossSetVideo`) —
  metadata is shared across languages, like an image's. The home page's Gloss-of-the-day plate stays
  image-only on purpose: it is a silhouette, not a player.
- **Glossary image (optional):** a term can carry the **same `{ src, title, desc, credit, alt }` object as a card**,
  read through `glossImage(key)` and rendered by `renderGlossImage` into the `.gloss-imgslot`, which is
  **floated to the TOP-RIGHT of the popup body** — so the opening sentences run down its left and the
  description resumes the popup's full width below it. It reuses `cardImageHTML`/`.card-img`, so the existing
  delegated
  listener opens the **shared** fullscreen viewer — no wiring of its own. The slot is therefore **first in
  `.gloss-body`, before `.gloss-dates`/`.gloss-desc`** — a float only wraps content that follows it, so don't
  move it back after the prose (both markup sites: `openGlossWin` and the admin glossary editor's preview).
  **In the popup the 150px height and the half-popup width are the picture's MAXIMUM, not its shape**
  (`.gloss-imgslot`, changed Aug 2026 on request): `max-height:150px` (170 on the mobile sheet),
  `max-width:50%` on the float, `object-fit:contain` — so within those limits the WHOLE picture is shown. It
  was a fixed height with `object-fit:cover`, which gave every popup one silhouette at the cost of cutting the
  sides off anything wider than half the popup — and a map, a diagram or a wide landscape is exactly the kind
  of picture a glossary term carries. A tall picture is now narrow and a wide one short, and both are whole.
  **THE WORDS WAIT FOR THE PICTURE** (`GLOSS_IMG_WAIT` / the `imgwait` block in `openGlossWin` /
  `.gloss-win[data-imgwait]`, Aug 2026, on a bug report: "the text loads before the image, so a split second
  after opening we see the text jump to make space for the picture"). That is exactly what a FLOAT of no
  intrinsic size does — the description lays out across the whole popup and re-wraps the instant the file
  arrives — and **nothing can reserve the right box in advance, because the box IS the picture's aspect
  ratio and no part of the entry records it**. So the body is held until the picture's size is known and
  released complete. Three things keep that from being a stall: a picture already in the browser's cache
  resolves SYNCHRONOUSLY (`img.complete`), which is the common case and where the attribute never reaches
  the DOM at all; the title bar is outside the held region, so the popup still answers the tap at once; and
  `GLOSS_IMG_WAIT` is a ceiling past which the words are worth more than the alignment. **The desktop
  placement waits with it** — `positionGlossBeside` measures the window, and measuring it before the
  picture has a size puts a too-short box on screen and then grows it, which is the same jump in another
  coat. A VIDEO needs none of this: its 16:9 box is stated in the stylesheet, so the slot has a size from
  the first frame.
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
  Themes register in `THEMES` (app.js) + the `THEME_OPTS` settings-picker table (mini-mockup previews, hover try-on),
  **both at module scope beside each other since Aug 2026** — `THEME_OPTS` lived inside `PAGES.settings` until the
  chest overlay, the friends list and the admin tab all needed to draw a theme too. **Five of the six are COLLECTIBLE**
  (everything but `folio`): see the theme bullet under THE RELIQUARY for the drop, the grandfathering and why a locked
  theme's button stays pressable. **AND THE ONE A READER WEARS IS SYNCED, on `profiles` rather than in the progress
  blob** (`S.theme`, `themePushSoon`, schema section 14) — a friend's row on the Account page is drawn in that
  friend's own theme, which is what makes it "how your account is presented to others" rather than a private
  preference. The column choice is the whole of the design and is argued in the schema: `progress` is RLS-scoped to
  its owner and their accepted friends, so a friends list would have to pull every friend's whole blob to read one
  string and an editor counting themes could not read it at all, where `profiles` is readable by any signed-in user
  and its column-level grant makes adding one column the entire permission change. `themeSyncMissing` turns
  PostgREST's 400/404 into silence, so a database that has not run section 14 simply presents every account in the
  default — **a later schema block is never a prerequisite.**
- **Text size** (**Settings → Appearance → Text size**, `FONT_SIZES` / `setFontSize` / `S.settings.fontSize`, Aug
  2026, on request): **very small / small / medium / large / very large**, written by `applyTheme` as
  `body[data-fs]` — so it is re-applied on
  every `render()` and at boot with no separate call — and read by styles.css as the multiplier **`--fs`**
  (`:root{--fs:1}`, plus `.8`/`.9`/`1.14`/`1.32` on the four `body[data-fs]` rules).
  **It was three stops until Aug 2026 and gained the two ends on request.** The stored value is the NAME
  (`tiny` / `small` / `medium` / `large` / `huge`), so the three existing ones keep working untouched and **no
  save is migrated**; `FONT_SIZE_LABELS` carries the display text because "Very small" is two words and
  `tiny`/`huge` are not what a reader should be shown. The steps are deliberately UNEVEN — the middle three
  keep the values they always had, so nobody's chosen size moves under them, and the two new ends sit further
  out than that spacing would give, a reader asking for "very large" wanting a real difference rather than one
  more nudge. Two of the five names are two words, and five labels have no room to run on one line across a
  390px row, so **the tick label WRAPS and is centred under its own specimen** rather than being abbreviated.
  **It scales EVERY px font-size in the stylesheet** — 519 of them, each rewritten as
  `calc(<its own px> * var(--fs))`, plus the four `clamp()` headings as `calc(clamp(…) * var(--fs))`. It reached
  only the reading prose for a fortnight (a card's question and background, a glossary popup, an Atlas panel)
  and was widened on a second request; **the wording on the Settings row names what it now reaches, so keep the
  two in step.** What it deliberately does NOT do is move the LAYOUT: the boxes are still laid out in px and
  only the text inside them grows, which is what keeps a four-cell grade bar four cells at Large.
  **There is ONE declared exception in the stylesheet and it is the crossword's letter** (`.xw-cell`, added
  2026-08-09): a square's SIZE comes from the grid's own width rather than from a px value, so a letter
  scaled by `--fs` would grow out of a box that cannot grow with it. It is `clamp(13px, 3.4vw, 20px)`, which
  tracks the board instead. Everything else on that page — the clues, the enumeration, the pinned clue —
  scales as usual. **If a second exception is ever needed, say so here**: an unstated one is how the claim
  above stops being true.
  **The one thing outside its reach is the Atlas's own map labels**, which are `ctx.fillText` on a canvas —
  CSS cannot see them, and their collision arithmetic (`computeCityLayout`'s grid, the leader lines, `CITY_SEP`)
  is written against those numbers, so scaling them would rearrange the map rather than enlarge it. The setting
  says so. **The picker is a SLIDER across the full width of the row** (`.fs-slide` / `#fsRange` /
  `.fs-ticks`, Aug 2026, on request — it was a three-cell segmented control, `.fs-pick`, which ran to 186px
  and left the rest of the row empty). Three sizes are an ORDERED SCALE and a segmented control says nothing
  about that ordering; a native `<input type="range">` is the one control the browser already gives arrow
  keys, Home/End and a drag to. **Its value is the INDEX into `FONT_SIZES`**, not the name, so the scale and
  the stored setting cannot drift apart, and `setFontSize` writes the range's `value` + `aria-valuetext` back
  so a change made anywhere else moves it. The tick marks under the track are `aria-hidden` — the range
  itself announces the size, and labelling them again would read the scale twice. **`.fs-pick` stays** and is
  still the Measurements picker, which is a CHOICE between two systems rather than a point on a scale.
  Guarded by `test-layout.js`, which asserts the prose AND the chrome grow, that the control fills its row,
  and that nothing in the shell is clipped or wrapped by the growth.
- **ANIMATIONS OFF** (**Settings → Appearance → Animations**, `S.settings.animations` / `motionOff()` /
  `body.no-anim`, Aug 2026, on request: "since they may cause lag on some devices"). ONE switch driving BOTH
  halves: the stylesheet's global killswitch gained a `body.no-anim` selector beside its
  `prefers-reduced-motion` media query, and **`prefersReducedMotion()` now returns `motionOff()`**, which
  reads the same setting — so every JS-driven movement already written against it (the page ghost, the sheet
  exits, `render()`'s smooth scroll, the globe's camera, the era crossfade, `pulseChanges`) stops with the
  CSS-driven movement rather than half of it carrying on. It is an **OR, not an override**: an explicit OFF
  only ever adds to what the operating system has asked for, and cannot turn motion back ON over a reader
  whose OS wants less of it. Written to the body by `applyTheme`, which runs on every render and at boot, so
  it needs no call site of its own.
- **HIGH CONTRAST** (**Settings → Appearance → High contrast**, `S.settings.contrast` / `body.hc`, Aug 2026,
  on request: "check whether colour contrasts have a ratio of at least 4.5:1 — if they don't, add a high
  contrast mode"). **The check was run, and the numbers are in the CONTRAST block at the top of styles.css.**
  What it found: in LIGHT mode `--ink-faint` (3.0–3.5), `--ochre` (3.3–3.9) and `--geo` (3.0–3.5) are below
  the bar on every paper, and `--zh` / `--good` are below it on `--paper-2`; in NIGHT mode everything clears
  it except `--ink-faint` on `--card`, at 4.19. Those are the QUIET tokens — an eyebrow, a caption, a source
  line — and they are quiet on purpose, so re-toning them for everyone would flatten the typographic
  hierarchy the design is built on. Hence a mode: `body.hc` re-tones exactly those, plus `--rule` (a hairline
  at 1.2:1 is invisible to a reader who needs this at all) and the focus ring. **The values are solved, not
  eyeballed** — each is its own hue scaled toward the ink until it clears 4.6:1 against `--paper-2`, the
  darkest of the three papers, so it clears the bar on all three.
  **One failure was NOT left to the mode**: in night mode `.btn` was `#FFF` on the light-lavender `--indigo`
  at **2.29:1**, and that is a primary control rather than a caption, so `body.night .btn{color:var(--paper)}`
  fixes it for everybody at 7.9:1. **…and that fix then broke every GHOST button in dark mode for a
  fortnight** (found Aug 2026 while adding Common Thread, whose Shuffle and Clear are ghosts): the ink is
  right for a FILLED button and a `.btn.ghost` is transparent, so it put near-black on the dark card and the
  label vanished outright — on the True or False and Timeline results' "Home" too, which is how long a
  control that is *invisible rather than merely low-contrast* can sit there unreported. The rule is
  `body.night .btn:not(.ghost)` now; **the `:hover` line beneath it had carried that `:not(.ghost)` all
  along**, so the exemption was always intended and was simply missed on the base rule. A ghost keeps
  `.btn.ghost`'s own `var(--indigo)` — the same light lavender, on the card rather than behind the text —
  which reads 7.9:1. **Note that `test-a11y.js` could not see it**: it compares a text colour against its
  background, and near-black on near-black is a contrast failure it *would* have caught — but only on a page
  it visits, and no game's results screen is in its route list. Guarded by `.claude/test-a11y.js`, which measures every text node's
  computed colour against the background it actually renders on and demands that NOTHING falls short with
  the mode on.
- **Light / dark FOLLOWS THE DEVICE by default** (**Settings → Appearance → Match my device**,
  `S.settings.themeAuto` / `systemPrefersDark` / `setThemeAuto`, Aug 2026, on request). `S.settings.night` stays
  the RESOLVED value — every stylesheet rule and the canvas globe read `body.night`, and nothing else had to
  change — and `applyTheme` writes it from `matchMedia("(prefers-color-scheme: dark)")` whenever `themeAuto` is
  on. A `change` listener on that query repaints mid-session (a laptop crossing sunset does it without a reload),
  and it `save()`s, since the resolved value is what a later manual flip starts from.
  Three things are deliberate. **`setNight` turns `themeAuto` OFF**: flipping the switch by hand is an explicit
  choice, and without this `applyTheme` would immediately overwrite it, which reads as a broken control.
  **The Night mode row stays on the page while the device decides**, dimmed (`.row-locked` / `.switch-locked`)
  rather than removed and never `pointer-events:none` — a reader needs to see that the site knows it is dark,
  and clicking it is the way back to deciding for themselves. And the **migration is the part not to remove**:
  `defaultState()` carries `themeAuto: true` but the back-fill beside the other `S.settings` back-fills pins an
  OLDER save to `false`, because an existing reader chose their `night` by hand and handing that choice to the
  operating system would flip the site under someone who had already decided. Guarded by `test-layout.js`, which
  still asserts `#sw-night` is on the page.
- **Measurements: ONE system, the reader's** (**Settings → Appearance → Measurements**, `S.settings.units` /
  `unitizeText` / `unitizeTree` / `applyUnits` / `setUnits`, Aug 2026, on request). The content stays authored
  **metric-first with the imperial equivalent in brackets** — `about 37 kilometres (23 miles)` — which is what
  `docs/units-plan.md` put across all 119 cards and 414 glossary terms, and it is the only form that carries both
  figures for a batch script, a citation pass or a translator. What changed is what a READER sees: metric (the
  default) drops the bracket, imperial replaces the metric figure with what the bracket says. Both directions are
  idempotent — after either pass the bracket is gone — which is what lets it run from a `MutationObserver`
  without tracking what it has already touched.
  · **It is a DOM text-node pass, not a hook in `glossText()`/`cardLocalized()`**, and that is the load-bearing
    decision: the editors read those same accessors, and a card whose stored text had already lost half its
    measurement would be saved back that way on the next keystroke. Walking text nodes and skipping anything
    editable means the store is never involved. It skips `.notranslate` for the reason the i18n engine does.
  · **Two patterns.** `U_CONV_RX` is the ordinary `<number><unit> (<imperial>)`. `U_BARE_RX` is the second half
    of a pair sharing the first's unit — "averaging 151 centimetres (4 ft 11 in) and females 105 (3 ft 5 in)" —
    without which imperial mode leaves that sentence half-converted.
  · **`isImperialParen` is the guard against eating an ordinary bracket.** It must be measurement-shaped ALL
    THROUGH, carry a number, and carry a STRONG imperial unit — `in` and `mi` are allowed as fillers inside a
    `4 ft 11 in` but never qualify a bracket alone, or "(in 1920)" would read as a measurement. Verified over the
    whole corpus: 341 fields transform, no imperial bracket is missed and no other bracket is touched. **Re-run
    that check after a units batch**, and mind the shapes it took to cover: `km²` and the bare `m`/`g` need a
    lookahead rather than `\b`; a hyphenated `175-metre (574-foot)`; `2.2 million km²`; and spelled numbers up
    to ninety.
  · The `MutationObserver` is permanent (both modes transform, so there is no "off"), and `render()` also calls
    `unitizeTree(root)` directly, since an observer callback is a microtask and would otherwise let one frame of
    the other system through.
- **British or American spelling, the reader's** (**Settings → Appearance → Spelling**, `S.settings.spelling` /
  `SPELL_PAIRS` / `_spellMaps` / `spellText` / `spellTree` / `applySpelling` / `setSpelling`, Aug 2026, on
  request: "just as users can switch between metric and imperial units, they should also be able to switch
  between British and American English"). The units switch's shape exactly — content stays authored in en-GB
  and a text-node pass rewrites at render — so no field is authored twice and a card written next year is
  covered without anybody remembering. Eight things are decisions rather than plumbing.
  · **IT IS A DECLARED TABLE AND NEVER A RULE, and every trap in it was found in the real corpus rather than
    reasoned about.** A `-re` → `-er` rule turns `timetree` into `timetrer`; a `kerb` → `curb` rule reaches
    into `Kerberos` and `Lockerbie`; an `-ll-` → `-l-` rule reaches into `controlled`, `paywalled` and the
    archaeologist `Conneller`; an `axe` → `ax` rule matches `taxes` and `Saxe`. `SPELL_PAIRS` is 144 rows of
    `[British stem, American stem, suffixes, one-way?]` and the transform can only ever do what it says.
  · **THE SUFFIX LIST IS EXHAUSTIVE, AND THE BARE STEM IS ADMITTED ONLY BY AN EXPLICIT EMPTY ELEMENT**
    (`"|s|ed"` → `["", "s", "ed"]`). The first cut always admitted the stem, which rendered `emphasis` as
    `emphasiz` and `paralysis` as `paralyzis` — a stem that is itself a word with another meaning. **And a
    suffix right for one side is not always right for the other**: `centre` + `d` gives `centerd` and
    `catalogue` + `d` gives `catalogd`, so every divergent inflection (`centred`, `catalogued`, `storeyed`,
    `manoeuvred`, `manoeuvring`) has a whole row of its own.
  · **IT IS TWO-WAY, WHICH THE UNITS SWITCH IS NOT, AND THE MEASUREMENT IS WHY.** The corpus is genuinely
    mixed in the -ise/-ize family — 82 `organized` against 54 `organised`, 68 `civilization` against 51
    `civilisation`, 47 `colonization` against 55 `colonisation` — so a one-way transform would leave a
    British reader reading American spellings on half the cards while the setting claimed otherwise.
  · **EIGHTEEN ROWS ARE ONE-WAY ALL THE SAME, and the fourth column is what says so.** `storey` → `story`
    is safe and `story` → `storey` is catastrophic; the same holds for `program`, `meter`, `practice`,
    `license` and `catalog`, each of whose American form is a British word with another meaning — and for
    **`medieval`**, which the reverse sweep caught: it is the standard modern British spelling, `mediaeval`
    is archaic, and the corpus has none of it.
  · **FIVE FAMILIES ARE DELIBERATELY ABSENT AND FIVE WORDS ARE EXCLUDED BY NAME.** American English writes
    `archaeology` (1,923 sites), `ochre` (91), `aesthetic`, `dialogue`/`analogue` and `axe` the same way, so
    a row for any of them rewrites correct prose into a spelling nobody asked for. `tyre` is the Phoenician
    city in all four of its sites, `draught` includes the Corridor of the Draught Board at Knossos, `kerb`
    is excluded because `curb` is also a verb, and `sulphur` and `gaol` are left as written.
  · **A URL IS NOT PROSE, AND THE MASK IS IN `spellText` RATHER THAN IN `spellTree`** (`SPELL_URL_RX`).
    Measured: 173 of the corpus's 10,108 URLs carry a mapped word (`/pub/data/paleo/`,
    `Panionium_theatre.jpg`, `Mycenaean_armour_from_chamber_tomb_12`). Most sit in an `src` attribute, which
    a text-node walk can never reach, and the citations are behind `.notranslate` — but `mediaCreditHTML`
    renders a credit URL as the VISIBLE TEXT of its own link, so without the mask a reader would meet a link
    reading `palaeo` whose href still said `paleo`. Masked at the transform, so every rendering site added
    later is covered without anybody remembering.
  · **THE CITATIONS AND THE LIBRARY'S BOOKS ARE SKIPPED** (`.notranslate, .bk-page`), and it matters more
    here than it does for units: a citation names a published work, and rewriting *The Colour of Prehistory*
    into *Color* invents a title that does not exist. A book is somebody's published translation,
    transcribed rather than edited, so it keeps whatever its translator wrote.
  · **AND `gradeCloze` TRANSFORMS THE ANSWER, NEVER THE GUESS.** It is the one place the switch has to reach
    past the DOM: the cloze compares what was typed against the stored `answerText`, which is authored in
    British, so an American reader typing exactly what is on their screen would be marked wrong.
    Transforming the guess instead would be the same fault upside down.
  **Its known limit, stated rather than papered over**: the card browser (`PAGES.browse`) searches stored
  card TEXT, so an American reader typing "color" will not find a card whose stored prose says "colour".
  The case of the word on the page is preserved in the three shapes a sentence actually produces (all
  lower, Capitalised, ALL CAPS); anything else is left alone, a mixed-case word being a name far more often
  than a spelling. Guarded by `.claude/test-spelling.js` (64 assertions) — **re-run after touching
  `SPELL_PAIRS`, `spellText`, `spellTree`, `SPELL_URL_RX` or `gradeCloze`**, and note that most of it needs
  no browser: what goes wrong with a declared table is arithmetic over the shipped corpus and reads far
  better as a failed comparison than as a screenshot.
- **ENGLISH ONLY — `const MULTILANG = false`** (app.js, beside `LANG_CODES`; Aug 2026, on request). The site
  ships in English while the work is on making the English as good as it can be. It is **one switch**, and it
  shuts three doors: the Language card is not rendered on the Settings page, `?lang=xx` no longer switches,
  and `setLang` refuses anything but English. It began as a switch with **nothing deleted**, and that is no
  longer true of the CONTENT: **on 2026-08-08, on request, the card `i18n` blocks and every
  `i18n/gloss-<lang>.js` were REMOVED** — 2.06 MB of the eager path plus 3.1 MB of repo weight that the gate
  put beyond every reader's reach. What survives is the ENGINE and the other three families: `ui-<lang>.js`,
  `games-<lang>.js` and `places-<lang>.js` are all still on disk and still lazy, `langPickerHTML` /
  `wireLangPicker` / `loadLangData` are still wired, and flipping the flag brings the chrome, the game pools
  and the map labels back at once. What it does NOT bring back is the cards and the glossary: those now fall
  back to English in every language, and restoring them means regenerating the files, not flipping a switch.
  **`loadLangData` no longer requests the gloss bundle** — a bundle pointing at a deleted file is a 404 per
  language.
  **The migration back is part of the gate, and is the part not to remove**: `langFromURL` resets a stored
  non-English `S.settings.lang` to `"en"` on boot. Without it, a reader who had chosen Spanish would be held
  in Spanish for ever with no control left on the page to escape — the one way removing a setting can
  genuinely strand someone. The content pipeline has the same switch twice over
  (`REQUIRE_TRANSLATIONS` in `add-card.js`, `add-glossary.js` and `add-questions.js`) and, since the
  removal, a second guard
  beyond it: both content tools **DROP** a supplied `i18n` / `translations` block with a warning rather than writing
  it, so the eager path cannot regain megabytes because one batch file still carried its nine languages. The
  changelog rule in the golden rules is suspended to match. Guarded by `test-layout.js` (the gate) and `test-i18n-lang.js`, which asserts the
  gate UNPATCHED and then **serves an app.js with the flag flipped** so the machinery behind it stays tested
  rather than quietly rotting.
  One consequence to know rather than to fix: **the editors can no longer reach a translation.** The editing
  language IS the site language, so with English forced the card editor edits the base fields and the
  glossary editor the English description — `setCardI18nEdit` / `setGlossI18nEdit` are unreachable from the
  UI, and `serializeGlossaryI18n` bakes nothing, since it only ever writes languages whose file is loaded.
  Translations are edited by `.claude/add-lang.js` alone while this stands — and since the removal its
  `cards` and `glossary` sections would RECREATE what was deleted, so only its `chrome` and `tree` sections
  are live. Its header says so.
- **Language picker + i18n** (**Settings → Language**, `langPickerHTML` / `wireLangPicker`; it was a `#lang-switch`
  dropdown in the top bar until Aug 2026, moved on request when the phone's top bar was removed — a preference
  belongs on the preferences page, and the picker had nowhere else to live once that bar was gone): a grid of
  10 languages (en/es/fr/de/it/nl/ru/ar/zh/ja) stored in `S.settings.lang`, each option showing an **inline SVG
  country flag** (`FLAG_SVG` in app.js — NOT emoji flags, which render as bare letter pairs on Windows) plus the
  language's native name. The whole grid is `notranslate`: these are the languages' OWN names, and translating
  "Deutsch" into German is how a reader loses the one row they were looking for. The light/dark switch made the
  same move and had a home there already (Settings → Appearance → Night mode, `#sw-night` — `applyTheme` keeps it
  in step and is now the only thing it looks for). **The site chrome IS localised**: `i18n/ui-<lang>.js` holds one language's tables (`window.I18N` exact strings /
  `I18N_RULES` regex patterns for dynamic labels / `I18N_HTML` whole prose blocks, all keyed by the ENGLISH source
  text), and app.js's engine (`t()`, `localizeTree()`, `applyLang()`) walks rendered text nodes +
  title/aria-label/placeholder/alt attributes after render, with a MutationObserver localizing later DOM (toasts,
  popups, menus). Originals are stashed on the nodes so switching back restores cleanly; anything untranslated stays
  English (graceful fallback). Arabic flips `<html dir="rtl">`. Elements with class `notranslate` are skipped.
  **Adding a language** — the language set is defined in exactly three code sites: `LANGS` + `FLAG_SVG` (app.js,
  the picker) and `CARD_I18N_LANGS` (app.js, the card editor's translated fields); plus the `I18N_LANGS`
  validation list in `.claude/add-card.js` and `.claude/add-glossary.js`. Everything else is keyed off
  `S.settings.lang` and needs no change. Backfill the CONTENT with **`node .claude/add-lang.js <batch.json>`**
  (see "Backfilling a site language" below) — and add the code to `LANGS` **last**, once the chrome table is
  translated, so the picker never offers a language that renders as English. Ship an EMPTY
  `i18n/gloss-<lang>.js` at that point too, or every page load 404s on it until the glossary is translated
  (`ensureData` degrades gracefully, but the console noise is real). **No CJK webfont is loaded, deliberately**: `--serif` ends in the generic
  `serif` and none of the Latin faces carry CJK glyphs, so Chinese and Japanese body text falls through to
  the reader's own system CJK font — correct glyph forms per language. The imported `Noto Sans SC` sits only
  in `--han` (level numerals, hanzi lines) and is NOT in the body chain, so it can't impose Chinese glyph
  forms on Japanese text. Don't "fix" this by adding a CJK webfont; it would be a multi-MB download for no
  gain. **Japanese (`ja`) is COMPLETE**: the chrome
  (531 strings / 72 rules / 12 prose blocks), all 30 cards and 333 glossary terms are translated and live,
  at full parity with the other eight languages. (The **sixty-three terms added on 2026-08-03 are English-only**,
  like every entry written since the `MULTILANG` gate went up — so all nine languages stand at 333 of 401,
  together, and a language is still "complete" in the sense that matters: none is behind the others.)
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
  **`setLang(code)` is the single entry point** for a language change (the picker calls it; don't set
  `S.settings.lang` directly): it validates against `LANG_CODES`, persists, and — since the translation files are
  **lazy and per-language** (`langBundle`) — calls `loadLangData()` first, repainting with `applyLang(); render();`
  once the chrome table lands. A non-English reader therefore sees English for the moment the table takes to
  arrive; an English reader never fetches any of them, and never pays a second render. Switching language pulls
  only the new language's two files; the previous one stays resident.
  **`?lang=xx` links the site in a given language** (e.g. `/?lang=es#decks`) and, like the picker, becomes
  the stored preference. Its IIFE runs at load, before the first `render()`, so the Settings page paints with
  the chosen language already marked. Base-tag matching (`es-ES` → `es`); an unknown code is ignored, not stored.
  **Known gap:** the `PAGE_META` titles/descriptions have no `i18n/ui-<lang>.js` entries yet, so `document.title` stays
  English in other languages (the documented graceful fallback). Adding them is a content task.
- **UI sound effects** (the `/* UI sound effects */` block in app.js): tiny synthesized Web-Audio sounds, no files —
  **`click` and `toggle` are a soft TAP since Aug 2026** (`sfxTap` / `sfxNoiseBuf`, on request: "something more
  akin to a low soft tapping sound than a high chirp"): a short burst of noise with a light body under it,
  which is what a finger on wood actually is — a broadband transient that dies at once, with no pitch to
  speak of. A pure oscillator cannot make one, which is why the old click was a triangle sliding
  1900 → 1300 Hz. **The filter is a BANDPASS, and that is the second correction** (Aug 2026, on a report that
  the tap had become "a low thud"): a low-pass at 780 Hz keeps everything BELOW it, so most of what was left
  was rumble, and under it sat a sine falling 190 → 120 Hz — which is a bass drum, not a fingertip. A
  bandpass keeps a band and throws the rest away, so the tap has a MATERIAL rather than a weight, and the
  centre frequency is what says whether a finger landed on wood or on glass. **Nothing goes below 500 Hz
  now** (~1.9 kHz band, a 560 Hz body, both under 32ms — the decay mattered as much as the pitch), and the
  gains are LARGER than the low-pass version's for a quieter result, a band being less energy than
  everything below a corner. `sfxTap` deliberately has **no attack ramp** where `sfxTone` does: a tap starts
  at full level on its first sample, and a 5ms fade-in turns it into a small swell. The noise buffer is
  built once and reused; a click is by a wide margin the most frequently played sound on the site. —
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
- **Home page** (`PAGES.home`): greeting → daily quote (`QUOTES` — world sources East and West, standard published
  translations only, no loose internet attributions; **clicking one flips it to the original** — text, speaker and
  source from the entry's `o` block, `wireDailyQuote` swapping `hidden` on the `.dq-live`/`.dq-orig` spans, clicking
  again returns to the site language. The swap **crossfades**: the words fade out (`dq-out`), the swap happens while
  nothing is visible, the incoming ones are held at their start (`dq-in`, `transition:none` — removing the class is
  what animates them) and the figure's height eases between the two languages (`dq-sizing` + an inline height, since
  a Greek line and its English rarely wrap the same), so nothing cuts and the page below never jumps.
  **The figure is also held at the height of its TALLER language** (`lockHeight`, Aug 2026, on request): both are
  measured in one synchronous pass that never paints — swap the `hidden` attributes, read `offsetHeight`, swap
  back — and the larger becomes a `min-height`, after which the flip moves nothing at all and the height easing
  above is a no-op. It is **re-measured on a tick, on `document.fonts.ready` and on resize** (`_dqResize`, one
  listener ever), because the i18n observer rewrites the quote after render for a non-English reader and a
  webfont arriving re-wraps both languages. `DQ_FADE` /
  `DQ_SIZE` in app.js must stay in step with the `.dq-*` transition durations in styles.css; a `busy` guard ignores
  clicks mid-flight and `prefersReducedMotion()` swaps outright instead of waiting out the timings.
  **THE WORDS ARE SELECTABLE, and the flip is guarded in JS rather than in CSS** (Aug 2026, on request).
  `.dq-flip` carried **`user-select:none`** from the day it shipped — it is a button, and clicking it twice
  to toggle back swept the `::selection` wash across the whole quote (the "it lights up" bug) — and the
  trade was that the one thing on the home page a reader might want to copy could not be. So the rule is
  gone and `wireDailyQuote` classifies the click instead, on TWO tests, both needed: a **live selection
  inside the figure** (a sweep or a double-click always ends in a click, and flipping there takes the very
  words away) and a press that **MOVED past `DQ_SLOP`** (a drag across empty space beside a short line
  selects nothing, so there is no selection left to test). It is the same classification the book's own
  tap-to-turn makes. The original carries **`notranslate`**, or the i18n engine would translate the
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
  the best attempt, not a guarantee. Guarded by `.claude/test-daily-quote.js`, which slices `SHIPPED_QUOTES`
  — the literal, before any one editor's overlay — since the rule has to hold for what every reader gets.
  **THE POOL IS `SHIPPED_QUOTES` + THE ADMIN'S OVERLAY** (`quotesMerged` / `refreshQuotes` / `setQuoteEdit`
  / `revertQuote`, Aug 2026, on request, for the Admin → Quotes tab). It lives in app.js, which the app
  must never rewrite, so **the overlay IS the storage**: `ADMIN_EDITS.quotes` is applied over the literal
  exactly as the glossary's deltas are applied over glossary.js, and a signed-in admin's overlay reaches
  every reader through `content_overrides` with no deploy. The **key is a quote's shipped English text,
  never its index** — an index moves the moment a quote is inserted above it and every earlier edit would
  then point at somebody else's words, which is why the two daily-game pools are keyed by their English
  `q` too; `null` retires a shipped quote, and a key matching nothing shipped is one the admin added.
  `QUOTES` and `QUOTE_ORDER` are therefore both `let` and both DERIVED: the order is a property of the
  whole pool, so adding or retiring one quote re-solves the lot. **Any writer calls `refreshQuotes()`**,
  and `reapplyAdminOverlay` does too (undo, and a cloud-adopted overlay)) → review banner (+ the Collections button
  lip) → (first-run only) a 3-step how-it-works strip → a **Minigames** heading over the game tiles. That is the
  whole page, at every width.
  **THE DISCOVERY ROW IS GONE** (`.explore-grid`, and with it the **Card of the day** flip tile, the **Term of the
  day** tile and the **Atlas teaser**) — dropped from the phone in Aug 2026 and from the DESKTOP a fortnight later,
  on the request to bring the desktop into line with the phone rather than the other way round. `dailyPick` and
  `startMiniGlobe` went with it and are **not dead code left lying about — they are deleted**; ~90 CSS rules
  (`.exp-tile` / `.exp-card` / `.cod-*` / `.term-*` / `.atlas-*` / `.mini-globe`) went too. The one worth stating
  is the cost that is no longer paid anywhere: the mini globe was the **only caller of the `world` bundle outside
  the Atlas**, so the home page no longer fetches ~1.6 MB of borders at idle to turn an ornament. The
  Card-of-the-day PSEUDO-ENTRY (`COTD_ENTRY`, `S.cotd`) survives untouched — a reader who added cards that way
  still has them in the review, and the entry retires itself when its list empties.
  **THE `.howit` STRIP IS GONE TOO** (Aug 2026, on request), and `.hi-step` / `.hi-num` / `.hi-body` with it:
  the three-beat first-run explanation of the method that sat under the review banner — study a card, grade
  yourself, it comes back. The WALKTHROUGH offered directly above where it stood says all three properly,
  with the forgetting curve behind them and a real card to look at, so the strip was a first visit spending
  its attention twice on the same lesson. Its markup and its CSS are deleted rather than hidden at a
  breakpoint: the reasoning applies at every width, and the phone/desktop divergence is what this page has
  spent Aug 2026 removing. `TOUR_STEPS`' second step no longer names it as a target and falls to `.banners`.
  **Until the first card is ever graded**
  (`S.cards` empty) the banner is a **first-run hero**: purpose sentence + "Study your first cards"; the level badge,
  xp bar, stats, review-order toggle and active-deck list appear only after that.
  **ITS FIRST PRESS GOES TO THE COLLECTIONS** (Aug 2026, on request). It used to pick the first collection
  that was not coming soon, add it on the reader's behalf and deal them a card — quick, and making for them
  the one decision this page exists to hand over. They are sent to `#decks` instead, to choose their own.
  It can route there UNCONDITIONALLY because `fresh` already asks the harder question (next paragraph): a
  reader who has added a collection but not yet graded a card is no longer fresh, so they meet the ordinary
  banner with their decks under it and never reach that branch. That matters more than it looks — while the
  hero IS the banner it is the only way into a session, the deck list not being drawn under it, so a
  version of this that sent every press to the collections left a reader who had just added one looping
  back to the page they came from. The two changes landed on different branches; `test-tour.js` section 5b
  asserts both ends of it. The LABEL is untouched: the button is named for what it is for, and the
  collections are the first step of it.
  **A FIRST-TIME VISITOR IS ONE WITH NO HISTORY *AND* NOTHING TO STUDY** (`fresh`, Aug 2026, on a bug
  report: "I am now always forced into the first-time visitor view, and can no longer see my Daily study
  active decks" — from a reader who had used **Settings → Reset progress**). `fresh` was `S.cards` being
  empty, which is true of a genuine first-timer and equally true of somebody who has been here for months
  and has just cleared their schedule on purpose. And it does not merely change the banner's WORDING: it
  also **hides the list of added decks** (`reviewGroup`), so the one thing that reader wanted back was the
  one thing taken off the page. It is `Object.keys(S.cards).length === 0 && activeCardIds().length === 0`
  now, which needs **no new flag**, because a first-timer's shipped `S.active` is a single deck of the
  **coming-soon** China collection and `activeCardIds` filters that out through `availableCardIdSet` — so
  they still get the hero, exactly as before. Anyone with a studiable deck in their review gets the
  ordinary banner and their decks, whether they arrived there by resetting or by adding a collection before
  turning a single card over; that second case is an improvement rather than a side effect, since somebody
  who has just pressed Collections is better served by their own pile and a Start button than by being
  told again what Folio is for. **A state that is empty for a REASON is not the same as a state that has
  never been used, and a first-run screen keyed on emptiness alone cannot tell them apart.** Guarded by
  `.claude/test-reset.js`, in both directions.
  **The hero offers ONE way in, and its title breaks where it is written to** (Aug 2026, on request). The
  quiet "or browse the collections" beside the button is gone and `.hero-alt` with it — the collections are
  one press further on from wherever that button lands, and the Collections button under the review group is the route
  the home page advertises, so a second and quieter link in the same row only asked a first-time reader to
  choose between two things they cannot yet tell apart. The `#hero-browse` branch in the banner's own click
  handler went with the markup. The title carries an explicit `<br>` after "Memorize anything," rather than
  leaving the two halves to the wrap: it is a promise and a price, and which line each falls on should not
  be a function of the column width. The banner shows a **🔥 day-streak
  chip** (`S.streak`, shown at 2+ when the run is alive).
  **…AND, SINCE AUG 2026 ON REQUEST, THE DAY'S TIME ON CARDS** (`S.studyTime = { d, ms }`, `studyTimeAdd` /
  `studyTimeToday` / `fmtStudyTime` / `STUDY_TICK_MS` / `STUDY_IDLE_MS`; **`.rv-time` in the `.rv-foot`
  row**, not in the banner — see the last bullet). Five things are decisions rather than plumbing.
  · **THE MINIGAMES ARE EXCLUDED BY CONSTRUCTION, NOT BY A RULE** — the clock is a ticker living inside
    `PAGES.study` and `studyTimeAdd` has exactly that one caller, so no game can reach it and none has to
    be named. A rule listing the games would be a list to keep in step with the grid.
  · **IT IS A TICKER, NOT A STAMP PER CARD.** What was asked for is the time a question or an answer was ON
    SCREEN, and a card can be left mid-session, requeued, or read for three minutes with nothing graded —
    none of which a per-grade duration sees. **It cannot be summed out of `revlog` either**: that records a
    duration only for a card that was GRADED, capped at `REV_MAX_DS` (60s) precisely so a card left open
    over lunch cannot claim two hours, so both a long read and an abandoned session count wrongly there.
  · **TWO GUARDS MAKE THE FIGURE HONEST RATHER THAN MERELY LARGE**, and both matter on a phone: a tick is
    discarded while `document.hidden` or after `STUDY_IDLE_MS` (3 minutes) with no pointer, key, wheel,
    scroll or touch — a card left face-up on a table is not studying — and a tick is CLAMPED to twice its
    own interval, so a laptop waking from sleep cannot hand the day eight hours in one go. The idle window
    is deliberately generous: a reader three minutes into a 300-word background is reading it.
  · **THE TICKER IS SELF-STOPPING ON `root.isConnected`**, the shape `startMiniGlobe` uses — `render()`
    replaces `#view` without telling anyone and there is no teardown hook to hang it on — and it takes its
    document-level activity listeners with it when it goes. It counts only while a `.study-card` is
    actually painted, so the completion screen and the caught-up placard are not studying.
  · **IT REACHES `save()` ONCE A MINUTE, not on every tick**: `save()` queues a synced push, and a push
    every five seconds for a figure nothing else reads is a great deal of traffic for a clock. The grade
    path saves anyway, so in ordinary use the day is written down card by card; at most a minute is lost to
    an abrupt close, which is inside the honesty of the figure.
  · **IT SITS AT THE BOTTOM LEFT OF THE REVIEW GROUP, NOT IN THE BANNER** (Aug 2026, on request — it was a
    fourth `.stat` in the meta row beside New / Learning / Review, and `.banner .stat.st-time` is gone).
    Those three say what is LEFT to do today and this says what has been DONE, so standing it among them
    asked a reader to take four numbers of two different kinds off one line. It takes the left end of the
    **`.rv-foot`** row instead, the line under the deck list, so the two sit at the
    two ends of the block's own bottom edge — which cost that row nothing, `margin-inline-start:auto` on
    the lip having always held it right whatever stood to its left ("+ New group" did, until it went).
    Two consequences worth knowing. Out there it is on the page's own **paper** rather than on the card,
    where its `--ink-faint` label measures exactly what the About line below it already measures (2.78–5.23
    across the six themes both ways, sampled from painted pixels; the shipped bar is folio/light/`body.hc`,
    where it reads 4.96) — so it introduces no contrast state the site had not got. And it stops being a
    figure over a word: the row is one small tab high, so it is **one line**, and it names the day now that
    nothing beside it supplies one.
  · **THE WORD LEADS AND THE FIGURE FOLLOWS** — "studied 13m today", not "13m studied today" (Aug 2026, on
    request). A figure with its label under it is what the three piles in the banner are, and reversing the
    order is what stops this reading as a fourth one: it is a sentence about the day rather than a labelled
    statistic. Three flex children rather than two, so the row's own `gap` spaces them and no text node
    carries a space of its own — and "today" is LAST, which is what lets `.rv-today` drop it below 430px
    without leaving the line ungrammatical ("studied 3h 07m" is whole; "13m studied" was not).
  The figure is day-stamped like `reviewDay` and `deckDay`, so it resets in place with nothing to run at
  midnight, and is **drawn only once there is time to report** — a "0s" before the first card is a clock
  saying nothing has happened, which the empty row already says. `fmtStudyTime` prints seconds below a
  minute ("45s"), because rounding the first card of the day up to "1m" is a small lie and "<1m" is not a
  figure. It is in `PROGRESS_FIELDS` (time studied is a fact about the reader, so a phone and a
  laptop agree) and deliberately NOT in `RESET_KEEPS` — it is study history, which is what that control
  names. Measured at 390px with everything on the row: it fits with the streak chip beside it.
  **Completion is a MARK in the top-right corner, and
  it comes in TWO SHAPES** (`doneMarkHTML` in `PAGES.home`; Aug 2026). The tile used to FILL with its colour
  once played and turn gold on a perfect score, which was a lot of surface to change for one fact and fought
  every theme's own treatment of the card; that became a diagonal **ribbon**, and the ribbon then split in
  two on a second request. A **perfect** score keeps it — the shining gold (`.gt-ribbon.gr-gold`,
  `gt-gold-shine`) reading "Perfect!". Merely **having played** is a small green circled check
  (`.gt-check`, `--good`) instead of a green band reading "Done!": a ribbon is a lot of tile for a fact that
  only says "you have been here today", and a gridful of them read as a row of announcements rather
  than as games ticked off. **Both still carry a NAME** — the ribbon its word, the circle an `aria-label` —
  because an unlabelled patch of colour says nothing to a screen reader and little more to the eye, which is
  the reasoning the ribbon was built on and is not weakened by the mark getting smaller. `.done` / `.won`
  stay on the element (they are what the tests and the achievements read); all they do now is carry the mark.
  The earned fill that used to run down the added decks went with the original change (`rv-done` / `rv-won`
  are still set on `.review-group`, and nothing styles them). It reads `S.reviewDay = { d, n, miss }` (in
  `defaultState` + `PROGRESS_FIELDS`), written by **`logReviewDay`** from `grade()`: only a card's FIRST attempt
  of the day counts (`firstToday`, from the pre-grade `c.last`), since a learning card is graded again ten minutes
  later; correct = anything but Again, as in `logReview`. `reviewLog` can't answer this — it counts every grade
  and only tracks mature ones. Both fills carry `.review-group` in their selector **for specificity**: marble and
  academy dress `.banner` with a surface of their own, and the earned fill must outrank it in every theme; the
  gold is `.done.won`, since a perfect day carries both classes. **The home page must not read as China-centric** — Folio
  covers many history topics; copy stays subject-neutral (China is just the first live collection).
  **A "Seen total" stat sat beside Due and New and was removed on request (Aug 2026)** — the xp bar directly above
  it already counts the distinct cards studied, as progress towards the next level rather than a bare number.
  **The banner is headed "Daily study"** (Aug 2026, renamed from "Daily review" on request). It is
  `REVIEW_TITLE`, and the heading now INTERPOLATES that constant rather than restating it, so the banner and
  the long-press sheet's own head cannot come to disagree about what the thing is called. The route, the
  entry id (`REVIEW_ENTRY`, `"review:all"`) and every internal name are untouched, and the prose in this file
  still says "daily review" for the mechanism — only what a reader is shown changed.
  **The banner carries NO big numeral and no description line while there is work** (Aug 2026, on request —
  it had a gold numeral of the day's whole pile for a fortnight, and `pileBadgeMarkup` went with it). The
  numeral was a fourth unlabelled number competing with the three labelled counts directly below it, which
  break the same total into New / Learning / Review and are the answer a reader is actually after; the
  sentence ("Cards scheduled for today, plus a few new ones…") described those three counts in words. The
  other two `.desc` branches STAY — one says the day is finished and the other says there is nothing here
  yet, and neither is visible anywhere else on the banner. The level is still spelled out by `xpBarMarkup`
  directly underneath. **`test-account-switch.js` therefore reads the xp bar**, not a badge, to tell an
  account that has studied from one that has not.
  **AND A FINISHED DAY OFFERS NO BUTTON AT ALL** (Aug 2026, on request). The CTA used to become "Browse
  collections" once the pile was empty, which is a second route to a page the Collections button under the
  group already reaches, dressed as the primary action of a banner whose own subject is finished — so the
  `.cta` is simply not emitted when `dueN + newN` is zero and the sentence saying the day is done stands
  alone. **Nothing pressable becomes a dead no-op**: the banner's own click handler still falls through to
  the collections, so an idle tap on the card does what it always did; what is gone is the invitation.
  **The banner counts ANKI'S THREE PILES** (Aug 2026, on request — it was a Due / New pair): **New** in blue,
  **Learning** in red, **Review** in green (`pileCounts` in `PAGES.home`; the tokens are the study bar's own
  `--indigo-bright` / `--zh` / `--good`, so all three sites agree). The same three numbers, unlabelled, open every
  added deck's row below it (`adCounts` → `.dk-counts`), computed by the SAME function over that deck's ids, so a
  row can never claim work the banner does not. Two things about the split are deliberate: **new** is the day's
  allowance (`reviewQueue().fresh`), not the whole unseen backlog, and a **learning** card counts from the moment
  it is answered wrong until it graduates — whether or not its ten-minute step has come round — because a count
  that emptied while the card sat on its timer would say the work was done. `review` is the due pile minus those.
  Each figure is **centred over its own label** and the three sit on the **CTA's own line**; below 640px that
  costs the button its width (`.review-group .banner .cta .btn` shrinks and the row goes `nowrap`), since a
  button on a line of its own left the piles floating over nothing.
  The button is **CENTRED against them** (`align-items:center`, Aug 2026, on request): a figure over a label is a
  two-line column, and the `flex-end` this rule used to carry put a one-line button on its baseline, reading as
  having slipped down.
  **THE BANNER IS LIGHT BLUE** (`--tile:#5AA9DC`, Aug 2026, on request — it was a bronze, `#9A6634`, from the
  days when the tile earned that colour as a fill). It is set TWICE and the two must be kept in step:
  `.banner` carries it because `.banner` is the review banner and nothing else on the site, and
  `.review-group` carries it because that is what a row with no collection hue of its own falls back to — and
  a value set on the banner element itself outranks anything inherited, so the group's copy cannot serve for
  both. `.deck-group`'s own fallback is a third copy of the same figure.
  **…AND IT CHANGES EVERY DAY** (`DAY_HUES` / `dayHue`, Aug 2026, on request). Twelve hues round the wheel,
  one per day, taken IN ORDER rather than at random — a random pick repeats, and two days the same colour
  reads as the feature having stopped rather than as chance. The index comes from `dayKey`, so it turns over
  at the reader's OWN day boundary, the same moment the quote and the day's allowance do, rather than at
  some hour of its own. They are lighter and brighter than the collection hues on purpose: a collection's
  colour has to stay legible under 30% of it behind body text, where this is a wash across a whole banner.
  It is set INLINE on the banner element, so it beats the stylesheet's own `--tile` without either of them
  having to know about the other — and the DECK ROWS below keep `.review-group`'s static value, or the whole
  list would change colour every morning with it. The light blue above is Tuesday's, and the stylesheet's
  copy is still what a theme, a hero and every fallback read.
  **"+ NEW GROUP" AND THE CHEST COUNT HAVE BOTH LEFT THE BANNER** (Aug 2026, on request), and with them the
  last two things nested inside that button: `#b-review`'s click handler no longer steps around any target of
  its own. The group control is at the bottom left of the DECK LIST now (`.rv-foot` / `.rv-tools` /
  `#b-newgroup` — see the GROUPS bullet), and a waiting chest is announced by `chestBannerHTML` in
  `#chestSlot` ABOVE the banner rather than counted as a fourth stat inside it (see THE RELIQUARY). Both are
  real `<button>`s out here, so neither needs the `role="button"` span and hand-written Enter/Space handler
  that a control inside a button required.
- **The home page is ONE COLUMN and, since Aug 2026, LITERALLY THE SAME PAGE at every width** (`PAGES.home`).
  It was three swiped panes for a week (`.home-pager` / `.hp-pane` / `#homeDots` — all
  gone, along with their ≤640px rules), then one column on a phone and a longer page on a desktop, and is now the
  same page on both: quote → review group (+ the lip, + the first-run how-it-works strip) → a **Minigames**
  heading over the game grid → the About line, in `.banners`, which is the flex column the pager used to be.
  · **THERE IS NO `phone` FLAG AND NO RESIZE LISTENER ANY MORE** (Aug 2026). The retreat ran: the swiped
    panes, then the discovery row, then the lip to the collections, and finally the About line, each brought
    into line on request and always in the direction of what the phone already showed. With the desktop's
    About tab gone the line ships at both widths, and nothing here is BUILT at one width and not the other —
    so `const phone = phoneHome()` and `_homeResize` (which existed only to rebuild the page on a breakpoint
    cross, since that is a difference CSS cannot make) are both retired. `_homeResize` is still torn DOWN on
    the way in, so a listener installed by an older build in the same session goes with it. What still
    differs is layout, and the stylesheet answers for that alone.
  · **The games are 3 × 2 on a phone and 3-wide on a desktop, under a `.games-head` heading that now ships at
    EVERY width** (Aug 2026, on request — it was phone-only, and with the discovery row gone the grid is the
    last thing on the page, so six coloured squares under nothing at all do not say what they are). The heading
    was centred, then left for a fortnight, then centred again on request. The class is deliberately **not** `.mg-head`: `mg-` is the MAP GAME's prefix
    (`.mg-card` / `.mg-head` / `.mg-score`), and reusing it gave the heading that card's `display:flex` —
    which beats `text-align` outright, so it rendered hard left with a computed `text-align:center` — while
    pushing this heading's font and colour onto the game's own score row. `test-layout.js` measures the
    heading TEXT's centre through a Range rather than reading `text-align`, which is the only way to tell
    the two apart. The tiles' **taglines are gone at EVERY width now, and dropped at the source** — `gameSub`
    returns the score or nothing, so there is no `.gt-sub` to hide in CSS. They went from the phone first
    (three to a row leaves ~86px of text column, where one sentence runs to four lines and buries the name
    above it) and from the desktop with the discovery row, on request. **Today's SCORE stays**, in its bare
    figures ("3/5"): it is not a description, it is the one thing on the tile that changes during the day. The
    blank sixth tile lost its sentence the same way.
  · **The way to the collections is `.home-collections`** — a free-standing button reading **Collections**,
    centred under the review group (`#b-addDecks` → `route("decks")`). It replaced the `.rv-lip` tab in Aug
    2026, on request, which had itself replaced the full-width `.lib-banner`. It is **the ONLY route to the
    collections anywhere on the site**, so it ships at every width and in every state the review can be in,
    first run included — don't gate it on having decks or on a breakpoint. The `#decks` ROUTE is untouched
    and must stay so: every link ever shared points at it, and `test-library.js` loads one.
    Two things about the shape are load-bearing. **It is a SIBLING of the review group inside `.banners`,
    not a child of it** — that is the whole of "unattached", and it is what the lip could not be: a lip has
    to hang off an edge, so it had to be the group's last child, in flow, because the deck list is glued
    flush to the banner above it and an absolutely-positioned tab would have to guess the list's height on
    every render. Out here none of that arises. And **`.banners` is a flex COLUMN, so `align-self:center`
    is what stops it spanning the whole width** — a block child there is full width by default, which
    reads as a second banner rather than as a button, which is exactly what the lip replaced.
    It keeps the lip's **indigo fill with white text** (Aug 2026, on request), the site's own
    primary-button colour, so it matches Start review directly above it; paper-on-paper it read as part of
    the card's own edge, which is the failure that colour fixes.
    `.rv-foot` survives and now holds the day's timer alone, so it is drawn only once there is a time to
    report — an empty row would otherwise leave a band of nothing under the deck list.
  · **`.home-about`** — a centred grey "About Folio" line (`#b-about` → `route("mission")`) at the foot, from
    when About left the tab bar. It was phone-only for a fortnight and now ships at **EVERY width** (Aug
    2026, on request), the About tab having left the DESKTOP's top bar too: this is the only route to the
    page anywhere on the site, so it must not be gated on a breakpoint — exactly the rule the Collections
    button already follows. The `#mission` ROUTE is untouched and must stay so: every link ever
    shared points at it, and `setActiveTab` already handles a route with no tab (nothing lights). Its
    `20px 0 16px` padding is the whole of its separation
    from the games above it (Aug 2026, on request — it was `4px 0 2px`, leaving it crowded against the grid),
    and **above 640px the top of it goes to 48px** (Aug 2026, on request): those figures are a PHONE's, where
    the page ending a thumb's width below the last tile is right and more air there is only scrolling, and a
    wide window has the room to let the last line of the page read plainly as the end of it. It is
    `padding-top` rather than a margin so the space stays part of the button's own target.
    Guarded by `test-layout.js`.
- **Home minigames** (game-grid tiles → `PAGES.*`). **Four of the nine are fed by the cards and all four draw
  through `gameCardIdSet()`, not `availableCardIdSet()`** — the well-known terms only, at or below
  `GAME_MAX_DIFFICULTY`; see the card-difficulty bullet above, and reach for that function rather than the
  wider one when adding a tenth game. **What year? left the cards entirely in Aug 2026** and has its own
  event pool in `whatyear.js`; True or False, Who said it and Find it never used them. The games:
  **Multiple Choice** (`PAGES.challenge`, formerly "Daily Challenge" — the
  rival bots + timer were removed; it's now a plain 5-question quiz whose 3 wrong options are the cards most AKIN
  to the answer, by `cardKinship` — see the card-tags bullet below. **It always asks a card's FIRST phrasing**
  (`firstQ` in `buildChallengeQuestions`, Aug 2026, on request): a card carries three ways of asking the same
  thing and the study page deals one at random, which is right there and wrong here, where the round is
  answered from four options rather than from recall — so the phrasing has to be the one written to stand on
  its own, and `question` is that one while the extras are angles on it. It also makes the day's quiz
  reproducible, which the results summary and the score both read better for. `firstQ` CUTS the pool rather
  than pinning an index, the study page's own move for a deck with question variety off), **Timeline** (`chrono` — **the FIRST "Check order" of the day is the answer that counts**, Aug 2026, on
  request: checking used to record the BEST of any number of tries, and since a check reveals every event's
  date a reader could check once, read the years off the rows and reorder to a perfect score every day. Later
  checks still mark the rows and show the dates — the puzzle stays usable for learning the order — they just
  no longer rewrite the score, and the result says so.
  **It is the one game with a SECOND pool filter** (`card.undatable`, Aug 2026, on a bug report): it is
  also the only one that asks WHEN rather than what, so a term that does not happen at a time — `human
  evolution`, `Tiber`, `Ice age` — is kept out of it and out of nothing else. See "SOME TERMS DO NOT
  HAPPEN AT A TIME" above.
  **Its DRAG was rewritten in Aug 2026, on a report that it felt unpleasant** (`setupChronoDrag`). The old
  one called `insertBefore` on every `pointermove` and did nothing else, so the row being dragged never
  went anywhere under the finger — it was re-inserted at the new index and appeared there — and every other
  row CUT to its new place, a reorder being a reflow. The two are now held apart: the dragged row is moved
  by **transform** and follows the pointer exactly, and its siblings are reordered in the DOM and then
  **FLIPped** around it. Four things are load-bearing. The row **stays in the flow** — never absolutely
  positioned, no placeholder — so the list's height never changes, the DOM order is the answer at every
  instant, and an interrupted drag cannot leave the puzzle in a state the reader did not choose. Reordering
  moves the dragged row's own layout slot out from under it, so its transform is **recomputed against the
  new layout on every reorder** (`pinToPointer`), or it jumps by exactly one row's height at the moment it
  swaps. The target index is measured against the siblings' **LAYOUT** positions (`chronoLayoutTop`), never
  their painted ones — a sibling mid-FLIP is painted somewhere it is not, and reading that makes the list
  flicker between two orders. And `.chrono-item.dragging` must NOT set `transform` (the JS owns it) or a
  `transition` on it (the row would lag the finger by its own duration); it lifts with shadow and z-index
  instead. The ‹ › arrows FLIP the same way, or they would be the one remaining way to reorder with a cut),
  **True or False** (`truefalse`),
  **Who said it?** (`whosaid`, from `quotes.js`), **Find it** (`findit`, renamed from "Find it on the map" Aug 2026 on request — see the Atlas game-mode bullet
  below; 5 date-seeded locate-on-the-globe rounds, score = first-try finds), **Common Thread**
  (`thread` — see its own bullet below), and the three added on 2026-08-09 on request — **Crossword**
  (`crossword`), **Picture round** (`picture`) and **What year?** (`whatyear`), each with a bullet of its
  own below. The rival-bot race is **gone, not merely unreachable**: `drawRace`
  and the podium had already been deleted, and `BOTS` plus the write-only `S.daily.podiums` field followed on
  2026-08-08 (nothing read either; `S.daily.wins` stays, since the Victor/Champion badges read it).
  Each of the 9 games records a per-day result in `S.games[key] = { date, played, won }` (`markGamePlayed(key, won)` at each
  game's end; `won` = a perfect run, or `solved` for Timeline).
  **A NEW GAME IS WIRED IN SIX PLACES AND FIVE OF THEM FAIL SILENTLY**: `PAGES.<key>`, the `valid` route
  list (a deep link that is not there simply goes home), `PAGE_META` (a missing row inherits the HOME page's
  title into the browser tab and every link preview), `DAILY_GAMES` (a game on the grid but not in that list
  is one the Clean Sweep badge and the daily chest claim without measuring), `GAME_NAMES` + `GAME_SET_WORD`
  (the played-today placard), and the tile plus its click handler in `PAGES.home`. `.claude/test-minigames.js`
  asserts all six, and asserts the sweep against **the tiles the home page actually paints** rather than
  against a list copied into the test, so a tenth game fails on the rule rather than on a stale copy of it.
  **ONE PLAY A DAY, AND THE GATE IS `gameLockedToday(root, key)`** (Aug 2026, on request). Every one of the
  nine is a DAILY game — its rounds are drawn once for today, its score is today's on the tile, the tile turns
  gold for a perfect run — and a **Play again** button under the results contradicted all of it: the set had
  been revealed answer by answer, so a second run was a run with the answers in hand, and the tile's figure
  came from whichever attempt went best. The three "Play again" buttons are gone, each results screen carries
  a `.tf-tomorrow` line saying when the next set arrives instead, and **each of the six `PAGES.*` calls the
  gate as its first act** — `challenge`, `truefalse`, `whosaid`, `chrono`, `thread`, and `findit`, where it
  goes in `PAGES.findit` rather than inside `PAGES.map` (that is the whole Atlas and knows nothing about
  daily games, and it is the only route into game mode). It renders an `emptyPlacard` naming today's score.
  **ITS MARK IS THE GAME'S OWN TILE ICON, NOT A HAN GLYPH** (Aug 2026, on a report: "the 'Played today'
  screen should not contain a Chinese character"). `GAME_NAMES` carried 选 / 真 / 言 / 序 / 紐 / 地 — the
  glyphs the game TILES wore back when Folio was a China deck, and which the tiles gave up for the
  line-drawn `ICON` marks when the site stopped being one. This placard kept its copy, and because it is
  what a reader meets EVERY day once they have played it was the last place on the site regularly showing
  a Chinese character to a reader of an English page — one that says nothing whatever about Timeline or
  Find it. **`ICON` therefore moved out of `PAGES.home` to module scope** rather than being copied: two
  tables of the same SVGs is how a tile and its placard come to disagree about which mark a game wears.
  `.placard .big` sizes an inline SVG to the same 54px square a character occupied and **thins the stroke
  from the tiles' 2 to 1.5** — at this size a 24-viewBox stroke of 2 draws 4.5px, which reads as a logo.
  The OTHER placards still carry Han glyphs (`emptyPlacard`'s "Coming soon" / "Not enough cards" branches
  inside the games); they are states a reader effectively never reaches, and they were deliberately left
  rather than swept up with this — say so if one is ever seen.
  **TWO GAMES HAD GROWN THEIR OWN LOCAL VERSION OF THIS RULE AND BOTH ARE NOW RETIRED**, which is the shape
  of a rule that wants stating once rather than six times: Timeline recorded the FIRST check and ignored
  later ones (it now takes ONE check — `.chrono-done` on the list stops the grips and the arrows, in JS as
  well as in CSS, and the check button is removed), and Find it called a same-day replay "practice" and
  recorded nothing (`gamePractice` is **deleted**, not left unreachable). **The cost is real and worth
  naming**: a reader can no longer re-read today's Timeline order or walk today's five places again. What is
  bought is that the figure on the tile is the answer they gave when they did not know the answers.
  Two smaller things went with it: the four "…try again" closing lines no longer invite a replay there
  isn't, and **`gameCapFirst`** capitalises Multiple Choice's options, its revealed answer and its summary
  (on request). That is DISPLAY only — `options`/`correct` are matched by identity elsewhere in the round —
  and it is `\p{L}`-anchored so a term opening on a numeral or a Han character is passed through rather than
  sliced through a surrogate pair. The study card makes the same move for the same reason and makes it in
  CSS (`.answer .val::first-letter`), which is not available to a text node inside a button.
  **TIMELINE'S ROWS TAKE IT TOO** (Aug 2026, on request): a row of that list is a heading naming the thing,
  not a word inside a sentence, and a good half of the deck's answers are common nouns stored lower-case.
  Applied at the one DISPLAY site (`.ci-name`) rather than in `chronoPool`, so the row is still tracked and
  compared by its card id and nothing downstream ever sees the capital.
  The home tile has **three daily states** (state classes set by
  `tile()`) — playing EARNS the colour: **unplayed** = a whisper of the tile's hue (a ~10% wash + hue-tinted title,
  theme colour only in the left bar, faint corner icon — `button.game-tile:not(.done):not(.won)`); **played today** (`done`, via
  `gamePlayedToday` — challenge/chrono still also derive it from `S.daily.lastPlayed` / `S.chrono.date`) = the tile FILLS with
  its theme colour (bright top-left → darkened far corner, dark icon, white text) + the green **✓ checkmark**; **perfect score
  today** (`won`, via `gameWonToday`) = a **shining gold** tile (`gt-gold-shine` sweeps a white band across the gold via
  animated `background-position`; icon/text darken; check stays). In **light mode** the filled (non-gold) tile skips the
  darkened far corner (`body:not(.night)` override). A played tile's tagline becomes **today's best score** ("4/5 correct!",
  chrono: "in order!") — `markGamePlayed(key, won, score, total)` stores `{s, n}` per day, `gameSub()` renders it. The
  Daily-review banner's CTA sits at the **bottom-left inside `.body`** (below the full-width xp bar), on mobile too. The **"Clean Sweep" achievement**
  (`sweep`, 🎯) unlocks when **every game on the grid is `won` on the same day** — nine of them since
  2026-08-09, `DAILY_GAMES` being the list and `allGamesWonToday` → `progStats().dailySweep` the test.
  **`won` IS A PERFECT SCORE, NOT A PLAY, AND THE BADGE'S OWN DESCRIPTION SAID OTHERWISE** until Aug 2026
  (on a report): `gameWonToday` documents `won` as a perfect run and `markGamePlayed(key, won, …)` is
  called with it, so the rule was always the stricter one — only the badge's `desc` and
  `maybeSweepChest`'s toast said "win". Both now say a perfect score, and **no scoring changed**. Check
  what a rule actually tests before changing it to match a description that misstates it. **The
  badge gets harder each time the grid grows, and that is deliberate**: it is the honest reading of "every
  game today", and the alternative is a sweep that means less every year. Nobody loses one they already
  hold, `checkAchievements` only ever adding. A perfect Multiple-choices run also increments `S.daily.wins`, which **revived
  the previously-dead `win1`/`win10` (Victor/Champion) badges** (`wins` was never written after the bot race was removed).
  `S.games` is in `defaultState()` (back-fills old saves) and `PROGRESS_FIELDS` (mirrors to the account).
  The grid is **3 × 3 since 2026-08-09**, Common Thread having taken the sixth slot earlier that month and
  the crossword, the picture round and What year? the last three; **`blankTile` survives unused** (a tenth
  game would leave a hole again) and reads "Coming soon / More games", having once been
  "Coming soon / —", which names nothing and looks like a tile that failed to load. Below 430px the
  tile type shrinks, or "Multiple Choice" breaks across two lines and its tagline across two more. The **Card-of-the-day tile carries the card's DECK** in its head
  row (`.cod-where` ← `cardLeaves(id)[0]` → `nodeWhere`) — the tile is a fixed height, so a short question left
  a band of nothing under it. Deliberately the deck and **not** the era: on a prehistory card the era is most
  of the answer.
- **COMMON THREAD — the sixth daily game, and the first built on the GLOSSARY** (`PAGES.thread` at `#thread`,
  the `PAGE: COMMON THREAD` block in app.js; Aug 2026, on request). Sixteen glossary terms in a 4×4 grid,
  four hidden groups of four, four mistakes to spare. It fills two gaps at once: the glossary is ~680 cited
  terms and was the largest curated body of content on the site that no game touched, and CATEGORISATION is
  the one study task the other five (recall, ordering, judgement, attribution, place) leave out.
  · **The puzzle is GENERATED from `GLOSSARY_TAGS`, so the game ships no content of its own** — and a tag set
    that groups well for the editor's filter bar does NOT automatically make a solvable puzzle. Three of the
    four rules exist because the naive version produced puzzles that cannot be solved while every group was,
    on the data, correct. **The broad tags cannot be groups** (`THREAD_BROAD` — `history` is on 427 terms and
    `place` on 314; a group indistinguishable from the rest of the grid is not a group). **One tag per family**
    (`THREAD_FAMILY`) — the first version paired an `africa` group with a `tanzania` one, which are disjoint
    tags and an unsolvable puzzle, because Laetoli is in Tanzania which is in Africa and nothing tells a
    solver which group wants it: **disjoint is not the same as distinguishable**, and only geography and
    period nest that way, which is why those are the two families declared. **A term may not be its own group
    label** (`Africa` inside `africa` gives the row away). **No two terms may share a word stem**
    (`threadStems`) — `Swabia` beside `Swabian Jura` reads as a pair whatever groups they are in.
  · **The disjointness is CHECKED, not assumed**: a term joins a group only if it carries none of the other
    three groups' tags, so all sixteen provably belong to exactly one group. Measured over 365 days before it
    shipped — **0 days fail to generate, 31 distinct group tags across the year, no duplicate or ambiguous
    term in any puzzle**. Re-run that sweep after a batch of glossary terms or a tag rename: the pool is
    derived, so new content silently changes what the game can build.
  · **A term needs ≥2 tags to enter the pool.** One with a single tag can be a red herring for nothing, and a
    grid of those is four obvious rows.
  · **…AND, SINCE AUG 2026 ON REQUEST, IT MUST BE A CARD'S ANSWER TERM RATED 1 OR 2** (`threadEasyKeys` —
    "it's currently too challenging"). The glossary is 836 terms and most of them are specialist, so a grid
    could ask a reader to group four words they had never met — which is a vocabulary test rather than a
    categorisation puzzle. `card.difficulty` is the rating that already exists for exactly this question and
    the pairing rule already gives every card's answer a term, so the pool is those answers resolved through
    `glossIndexFor("site")`'s **`byAnySurface`** (an answer is often the plural of its key) at or below
    `GAME_MAX_DIFFICULTY` — the same bar the other card-fed games draw under, read from the same constant.
    **THE RESTRICTION NEARLY BROKE THE GENERATOR AND THE FIX IS THE FINDING.** The pool falls from ~680 terms
    to ~90, so the four groups have far fewer tags to choose from: measured over 730 days, **271 of them
    produced no puzzle at all** — a blank page, silently, on more than a third of days. Two changes together
    took it to **0 blank days and 726 of 730 distinct grids**: `THREAD_GROUP_MIN`, the number of terms a tag
    needs before it can be a group, came down from 6 to **5** (measured at 6, 5 and 4 — 4 admits tags with no
    slack at all, and 5 is where the category count stops falling), and `dailyThreadPuzzle` **retries the
    seeded shuffle up to `THREAD_TRIES` (40) times** rather than giving up on the first arrangement that will
    not seat four disjoint groups. **A generator that works on a large pool can fail on a third of days when
    the pool is narrowed, and nothing on the page says so.** `test-minigames.js` guards the starved case on
    TODAY's grid (see its entry under Testing — and note that a 730-day sweep of this game is deliberately
    not committed, the resolution being the thing under test); the sweep quoted above was run against a
    browser page while the restriction was tuned, and is the check to repeat by hand after a change to the
    pool or a batch of glossary terms.
  · **Both the groups AND the grid order are date-seeded** (`hashStr`/`mulberry32`/`seededShuffle`, as the
    other games seed their rounds), so a reload cannot reshuffle a puzzle the reader is half way through.
    Shuffle is the reader's own control and is deliberately unseeded.
  · **A solved term opens its glossary popup.** The reader has just been shown a word they may not know, and
    the definition is the point of playing on the glossary — which also means playing genuinely counts terms
    towards the account page's "Glossary terms opened" meter, since `openGlossWin` marks them seen.
  · **"One away"** is counted over the four submitted, so it can only ever report a genuine 3-of-4. Without it
    a wrong guess teaches nothing, which is most of the texture of a grouping puzzle.
  · `won` (the gold tile) is **solved with NO mistakes**; `score` is groups found, out of 4.
- **CROSSWORD — the seventh daily game, and the first whose CLUE IS A CARD'S OWN QUESTION** (`PAGES.crossword`
  at `#crossword`, the `PAGE: CROSSWORD` block in app.js; 2026-08-09, on request). Nine entries clued from
  the cards' answer terms. It needed no authored content at all, and that is the point of it: a Folio
  question is already a fill-in-the-blank clue with the answer taken out of the middle, so the crossword is
  the study deck read sideways — the same 28-word clue the study card asks, answered a letter at a time.
  · **FOUR RULES DECIDE WHAT MAY BE AN ENTRY, and three are about the ANSWER rather than the clue.**
    **ONE WORD ONLY** — a crossword entry is an unbroken run of letters, so `cist grave` and `control of
    fire` would have to be run together into CISTGRAVE and CONTROLOFFIRE, which a solver cannot enumerate
    and would not recognise as the term they studied. Measured over the shipped deck: **134 of the 381
    answers are single words of a usable length**, far more than a nine-word grid needs. **FOUR TO ELEVEN
    LETTERS** (under four there is nothing to cross; over eleven the grid outgrows a 390px phone).
    **THE ENUMERATION IS SHOWN** — `(9)` beside each clue — because `xwNorm` drops diacritics and hyphens,
    so `Cro-Magnon` is entered CROMAGNON; that is the ordinary crossword convention and it is what makes
    the dropped punctuation honest rather than a trap. And **THE LETTERS KEY THE POOL, NOT THE ID**, or two
    answers normalising alike would be two clues to one entry.
  · **`repeat(N, minmax(0,1fr))`, NEVER a bare `1fr`.** A grid item's automatic minimum is its content's,
    and the content of a square is an `<input>` — about 150px of intrinsic width — so with `1fr` the
    thirteen tracks each claim that much, the board runs to some 2,000px and hangs off the side of a phone.
    It reads as a board too big for the screen rather than as a sizing rule that never fired, and it
    shipped that way for an hour. `.xw-sq` / `.xw-block` / `.xw-cell` carry `min-width:0` with it.
  · **IT MARKS ITSELF AS IT IS FILLED, AND THERE IS NO CHECK BUTTON** (Aug 2026, on request — it was a
    single "Check the grid" that scored the board, filled every wrong square in and locked the lot). The
    moment an entry's last square is typed it is judged: right, it turns green and its squares lock;
    wrong, it turns red and every square of it can be typed over. Since nothing is ever revealed, nothing
    is spent by coming back — so **THE GRID STAYS OPEN ALL DAY** (`gameLockedToday(…, {untilSolved:true})`,
    the letters kept in `XW_KEY`, device-local like the marker's position) and **the only way to lose is
    for the day to end with an answer still missing**, which is the whole shape of the request. Four
    things hold it up and each fails silently.
    **THE MARKS ARE DERIVED FROM THE WHOLE BOARD, never toggled square by square.** A crossing square
    belongs to TWO entries, so anything marking one entry at a time has to answer for both at once and the
    square ends up carrying whichever verdict ran last; `evaluate()` recomputes every square from the
    letters on the board instead, so a crossing shared by a solved entry and a wrong one is GREEN — the
    letter is right, and it is the other entry's remaining letters that are not. (The old check had the
    same fault in its worst form: it marked and filled in one pass, compared each crossing against the
    letter it had just written itself, and every crossing came out marked wrong AND right at once — 65
    squares yielding 65 `bad` and 10 `ok` — **with the SCORE correct throughout**, since that ran in an
    earlier pass.)
    **A SOLVED ENTRY'S SQUARES ARE LOCKED** (`readOnly`), which is what stops a reader typing away a
    crossing letter they have already earned and is also what makes the marking stable: a green entry can
    never become ungreen, so the derivation cannot oscillate.
    **THE SCORE IS WRITTEN UP AS IT RISES**, through `markGamePlayed`'s new `progress` flag — a grid
    abandoned at four still reads four on the tile, and the flag is what keeps the LIFETIME tally at one
    play and one win for the day however many times the score changes.
    And **"Clear the wrong letters" is not a shortcut for anything** — a red square can simply be typed
    over — but it says outright that red is erasable, which the old check (whose red squares were the
    final verdict, filled in and locked) had taught a reader it was not. It appears only while there is
    something red to clear, and touches nothing else.
  · **A SOLVED SQUARE IS OUT OF THE TYPING PATH ENTIRELY, AND THE CARET JUMPS ON** (`xwLocked` / `nextOpen`,
    Aug 2026, on request). Locking a square stopped it being TYPED into and left it a tab stop the caret
    still walked through, so filling a crossing word meant stepping over letters already earned; and
    finishing an entry left the caret sitting on its last square, so the reader picked the next clue by
    hand every time. **One predicate answers both** — `xwLocked(r,c)` is consulted by `step`, by `go`, by
    `focusEntry` and by a `focusin` redirect (a CLICK is the one path no movement rule can intercept), so a
    fifth way of reaching a square added later is covered by the same rule rather than by a fifth copy of
    it; a locked cell also gets `tabIndex = -1`, which is what takes it out of the keyboard order as well as
    out of the arrows. Completing an entry then calls `nextOpen`, which finds the next entry still holding
    an unsolved square **and wraps**, so the last clue on the board leads back to the first rather than
    stopping dead.
  · **A REVEALED LETTER IS RED, NOT GREEN** (Aug 2026, on request). Green is what a solved entry paints and
    what locks a square against being typed over — it means "you got this" — so painting the whole board
    green on a give-up told the reader they had answered a grid they in fact gave up on, and took away the
    one thing they want to see afterwards: which letters were theirs. What each square WAS is read BEFORE the
    answers are written over it, so a square whose own letter already matched stays green and every square
    that was empty or wrong turns red; the clue rows keep their tick only where the reader earned it. The
    whole square goes red for free, `.xw-sq:has(.xw-cell.bad)` already washing it.
  · **AND A GIVE-UP BUTTON REVEALS THE ANSWERS, WHICH HAD TO BE RECORDED** (`xwGaveUpToday` / `xwMarkGaveUp`,
    same request). The letters go into the very store the grid is restored from, so a revealed board reads
    back on the next visit as a board somebody filled in — a perfect score, a gold tile and a lifetime win.
    The flag therefore lives in the day-stamped record beside the letters, `markGamePlayed` is called with
    the score as it stood, and `PAGES.crossword` turns the day away at the top with a placard rather than
    letting a solved-looking grid be reopened. **A reveal is not a score, and nothing but a flag can tell
    the two apart afterwards.**
  · The layout is the ordinary greedy crossing search under a seeded RNG, best of `XW_TRIES` word orders,
    scored on **most words placed and then tightest bounding box** — a grid that crosses once per word
    strings out into a chain, which is a word list rather than a crossword. Its adjacency rule (an empty
    square may not touch anything sideways) is what stops parallel entries forming words nobody clued;
    `.claude/test-minigames.js` re-derives every maximal run on the board and demands each one be a clue,
    which is the only check that can see that rule going.
  · **MEASURED OVER 730 DAYS BEFORE IT SHIPPED, and the check is committed rather than thrown away**
    (`simulate` in `.claude/test-minigames.js`, which slices the generator out of app.js and stands it on
    the real `data.js` with no browser at all): **not one blank day, all nine entries every day, no grid
    over 13 squares a side, 730 distinct grids, and no unclued run or unnumbered entry anywhere.** A
    generator can be flawless on the day it is written and degenerate on a date nobody tried, which is what
    a one-day browser test cannot see.
- **PICTURE ROUND — the eighth daily game** (`PAGES.picture` at `#picture`; 2026-08-09, on request). Five
  pictures, four options each, drawn from **every** illustration Folio holds — a card's `image`, a glossary
  term's `GLOSSARY_IMAGES` entry, an artefact's — so a picture added anywhere feeds the game and there is
  no second registry to keep in step.
  · **THE CORPUS GAP IT SHIPPED INTO IS CLOSED** (2026-08-09, later the same day). It went out with one
    picture in the whole of Folio — `data.js` had a single card image, `glossary.js` had no
    `GLOSSARY_IMAGES` table at all — so the game could only show its placard, which was recorded here as a
    CONTENT gap rather than a wiring one. The picture pass (see `.claude/fetch-images.js` and friends in the
    File map) took it to **300 card images, 684 glossary images and 92 artefact images**, far past
    `PIC_MIN_POOL` (8), so the game now deals real rounds from all three kinds. The lesson worth keeping is
    that the game was built BEFORE the content and the gap was written down — which is why closing it
    needed no change to the game at all.
    **ITS TEST HAD TO LEARN THE SAME THING**: the planted pool used to be ten entries ADDED to the table,
    which was only ever the whole pool because the table was empty. It now REPLACES `GLOSSARY_IMAGES` and
    clears the card and artefact pictures, so the seeded draw is deterministic at any corpus size.
  · **THE TITLE, DESCRIPTION AND CREDIT ARE HELD BACK UNTIL THE GUESS IS IN.** Every one of them names the
    subject and the credit is usually a URL that spells it out, so showing any of them early leaves a game
    that works perfectly and teaches nothing — the one failure here nobody would report. The `alt` is
    deliberately generic for the same reason. `test-minigames.js` asserts the page contains none of the
    three before a choice is made.
  · The decoys are other real subjects from the same pool, which is Who said it?'s rule: three plausible
    wrong answers teach something, three obvious ones teach nothing.
  · **…AND SINCE AUG 2026, ON REQUEST, THEY ARE RANKED BY KINSHIP RATHER THAN DRAWN AT RANDOM** ("ensure the
    answers are as much as possible of the same categories, like in multiple choice, so increase the
    difficulty"). Multiple Choice has scored its distractors on shared tags since the card-tags pass, and
    that scorer is now `tagKinship(ta, tb)`, lifted out of `cardKinship` so both games read one
    implementation — the kind is worth four subject areas, and the score is capped when the kinds differ.
    A picture therefore carries its subject's TAGS into the pool (`picturePool`'s `add(…, tags)`, from
    `GLOSSARY_TAGS` for a term and `card.tags` for a card) and the three decoys are the closest three, so a
    stone industry is answered against three stone industries rather than against a cave, an ice age and a
    fossil. An artefact has no tags and simply scores 0 against everything, which is the honest fallback:
    it is answered as it always was.
    **WHO SAID IT? TAKES THE SAME RULE ON ITS OWN AXIS** (`buildWhoSaidRounds`, same request), which is a
    `cat` field added to all 64 entries in `quotes.js` — five families (philosophy, statecraft, science,
    reform, letters). A speaker is not a card and has no tags, so kinship there is simply the category, and
    the round prefers three speakers of the same one before falling back to the rest of the pool. **The
    categories are read off the RAW `window.QUOTEGAME`**, not off the localised copy: `quoteLocalized` may
    return a translated entry with no `cat` on it, so keying on the localised object would silently drop
    every round back to a random draw the day translations resume.
  · **`mediaCreditHTML` is shared with the fullscreen viewer** rather than copied, or the two would come to
    disagree about whether a credit is a link. A dead `src` marks its frame (`.pic-dead`) instead of asking
    the reader to name an empty box — a certainty rather than an edge case, there being no upload path.
- **WHAT YEAR? — the ninth daily game** (`PAGES.whatyear` at `#whatyear`; 2026-08-09, on request). Five
  events from one year, and a timeline to put that year on. It is worth saying how it differs from Timeline:
  **that one gives five different years and asks for their ORDER, this one gives five things from ONE year
  and asks what the year was.** Ordering needs no absolute knowledge at all — a Timeline puzzle is solvable
  knowing only which came first — and this cannot be solved without it.
  · **IT LEFT THE CARDS IN AUG 2026, on request** (`wyPool`, `whatyear.js` — the reasoning is in that file's
    map entry). It was built on `chronoPool` and the cards were the wrong material twice over: a card names
    a TERM where this wants an EVENT, and the game needs five things sharing one exact year, which a corpus
    of terms almost never supplies — 19 years of 409 cards carried five, and once the minigames were
    narrowed to well-known terms **exactly one** did. `wyPool` hands back `chronoPool`'s own
    `{ id, name, year }` shape, so nothing downstream of it changed.
  · **THE RAIL IS A LATTICE, NOT A CONTINUUM**, and the whole game turns on it. The pool reaches back to
    conventional round figures rather than calendar dates, and a free-dragging picker over a range
    running from 3.3 Mya to the present would be a pixel lottery in which no guess is ever exactly right. So
    the rail carries `WY_TICKS` (33) ticks a round `step` apart, the answer sits on one, and a guess is right
    or wrong with nothing in between.
  · **`wyStep` CAPS THE SPAN, and the first cut did not.** It took the largest divisor leaving four ticks,
    which for a Late Bronze Age puzzle gave a step of 100 and therefore a rail running **1600 BCE to 1600
    CE** — every clue naming a Mycenaean palace and half the rail the Renaissance. Capping at `|year|` keeps
    the rail as precise as the date it asks about: 800 years around 1200 BCE, 1.6 My around 2.6 Mya, 32
    years around a date given to the year. It also means **a BCE answer's rail can never reach across 0**,
    which is what stops a tick reading "0 CE", a year the calendar has not got.
  · **The answer is NOT at the centre** — its tick is seeded, `WY_EDGE` in from either end — or the midpoint
    would be the answer every day.
  · **It is a native `<input type="range">`**, which snaps to the lattice for nothing and is the one control
    the browser already gives arrow keys, Home/End and a drag to. The same call the Text size setting makes
    about the same problem.
  · **A WRONG GUESS NARROWS THE RAIL** rather than merely being marked: told "too early", the range's own
    `min` moves past the guess, so three tries are a real search. The ruled-out span stays DRAWN, greyed
    (`.wy-out`), so the scale does not silently change under the reader between guesses.
  · **THE ANSWER ROTATES; IT IS NOT DRAWN AT RANDOM** (`wyRotation`), and this is the subtlest thing in
    the three games. The pool holds only so many years carrying five events — 15 — so a year WILL come round
    again; what a random draw adds is clumping — measured over 365 days, one answer landed 28 times against
    another's 16, with nothing to stop two falling in the same week. The years therefore lie on a ring and
    the day walks one place along it. **The ring is TURNED between cycles rather than reshuffled**, because
    a fresh shuffle bounds nothing: the year closing one cycle can open the next or fall second in it, and
    a first attempt that guarded only the JOIN still let a repeat land **two days apart**. Turning by `r`
    moves every year exactly `n - r` days later than last time, so capping `r` at `n - ceil(n/2)` floors
    every gap at half a cycle while the order still changes. `wyRotation` is cumulative for that reason
    (cycle c's ring is defined against c-1's) — a few hundred short hashes, once per page open. **Measured
    over 730 days: 48–49 turns each on the 15-year pool, and the closest repeat 8 days apart.** A rule
    about a WINDOW cannot be enforced by a rule about one boundary — `quoteRunningOrder`'s lesson in
    miniature.
  · **THE HONEST LIMIT, visible to a reader who plays for a fortnight**: **15 years** is the whole pool, so
    a year comes round about that often. The five events are drawn separately from however many that year
    has, so a repeat is at least a different puzzle — which is why a year already carrying five is still
    worth a sixth and a seventh — and the cycle lengthens with every year added to `whatyear.js`.
  · `score` is the guesses left when it landed (3/2/1, `total` 3 — Common Thread's precedent for a total
    that is not 5); `won`, and the gold tile, is first go.
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
- **Collections layout (`PAGES.decks`)** — five sections down the page: **History**, **Geography**,
  **Languages**, then **Your decks**
  (the reader's own, and the way into the Studio), then **Shared decks** (Aug 2026, on request — the browse
  list that used to be `PAGES.community`, a page of its own; see the Phase 2 Pages bullet for the route, the
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
  was. Reordering History, and moving a collection to and from Coming soon, are untouched.
  **"Coming soon" is a `<details>` disclosure**
  (`.collection-group-soon`), **collapsed for everyone, admins included** (Aug 2026, on request — it used to open
  itself for an admin so the library's drag-and-drop had its drop targets reachable, which meant the one person who
  opens this page most often always met it expanded; an admin moving a collection between the groups opens the fold
  first, and the drop targets are reachable the moment it is open). This exists because
  the collections still being written far outnumber the finished ones (currently 6 to 1), and listing them flat made
  the Library read as empty.
  **THE DRAG HANDLE IS VISIBLE AT REST** (`.lib-grip`, Aug 2026, on a report that admin reordering had
  stopped working there). It had NOT: every row rendered its grip and carried `draggable="true"` the whole
  time — the grip sat at `opacity:0` until the row was hovered, so on a live collection there was nothing
  to reach for, while a **Coming soon** row showed its own at rest as a side effect of the overrides that
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
  **Nor is COLLECTIONS** (`#decks`, Aug 2026, on request): it is reached from the home page's Collections button
  instead, which is why nothing in the bar is active there — that page is not one of the bar's destinations.
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
  **The rail gets its own row on a phone** (≤560px, Aug 2026): one flex row could not hold a play button, a
  ~170px year box AND the rail, so at 390px the rail was squeezed to about **70px** — which is why its five
  year labels piled into an 80px band as an unreadable smudge and stopped lining up with the marks they
  annotate. The timebar becomes a two-row grid (`"play year" / "rail rail"`) and `--timebar-h` goes to 118px.
  **`layoutTicks()` then thins the labels to the ones that fit**: they are positioned off the same
  `year2frac` as everything else, so a colliding label is DROPPED rather than nudged — moving one off its
  year would make it a lie. The two ENDS are always kept (they are what fixes the scale), so an inner label
  must clear both its left neighbour and the right anchor; it re-runs from `resize()`, and it has to unhide
  everything before measuring because a hidden element has no width.
  A **plate-title cartouche** (`#mapCartouche`, top-centre, hidden ≤640px, updated by `paintYear`) shows "THE WORLD ·
  1938" for a past year and simply **"TODAY"** for the present one (Aug 2026, on request — it was "THE WORLD
  TODAY": every other plate is "THE WORLD · <year>", so on this one the two words before the date were the
  only part carrying no information, the globe under it being the world either way). The disk gets **limb shading + an atmosphere halo** as **two DOM layers, NOT canvas
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
  **On a phone the search and the legend are CHIPS** (≤640px, Aug 2026): open, they covered the whole
  top-right of a 390px screen — the map — before the reader had asked for either (the legend alone is
  126×196). The search collapses behind `#gsToggle` and expands across the full width of the stage when
  tapped (a 38vw field fits about four characters), and the legend starts `collapsed` there and shrinks to a
  34px round chip, reusing the collapse toggle it already had. `.gs-toggle{display:none}` is the desktop
  base rule and the phone block **must come after it in source order** — media queries add no specificity,
  so the base rule silently won when the block was placed first, and the chip never appeared.
  The `.globe-hint` ("drag to rotate · scroll or +/− to zoom") is hidden under `@media (hover:none)`: it is
  written for a mouse.
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
  jumps + re-selects **by point, not name** via `selectEntityByName(name, atLL)`). Both read **`popPointLL`** — the click
  point / search anchor, the GEO label point `c` and NOT the bbox centre, which can land in a neighbour.
  A **Copy link** chip sat beside them and was **removed on request (Aug 2026)**; `popEntityName`, which was only ever
  read to mint one, went with it. The **`#map/<year>/<slug>` deep links themselves are untouched** and must stay so —
  every link already shared points at one. They are parsed at boot + hashchange by `parseMapHash` (`decodeURIComponent`
  is try/caught so a mangled %-escape can't kill boot; the consumer resolves territory names, then EMPIRE names via
  `.mother`, then drilled present-day countries (`subSelGeo`), then UK constituents (`subSelUK`)), and
  `test-layout.js` loads one, because nothing on screen says they still work. Unclaimed land on historical eras gets a
  **terra-incognita stipple** (`stipplePattern()`, theme-aware via `stippleCol`, drawn settled-only under the claimed-land
  refill so it survives only on wilderness).
  **CITY LABELS THIN OUT WITH ZOOM, Google-Earth style (Aug 2026, on request).** Turning Cities on used to
  put a label on EVERY city in view: a name that would not fit cleanly got a leader line and, failing that,
  was FORCED into its last candidate slot, so below "one country fills the screen" the map was dozens of
  overlapping names and 2,665 label placements per settled frame. Two rules replace the forced placement
  (`CITY_SEP` / `CITY_CAP` above `computeCityLayout`): **`CITIES` is already sorted by significance** —
  capitals by population, then cities over a million, then division capitals — so a city whose pin lands
  within `sep` px of one already placed is dropped WHOLE, and `sep` shrinks with zoom (88px at the globe,
  22px zoomed right in), which is what reveals the crowded-out names a level at a time; and **a label that
  cannot be placed without overlapping is dropped rather than forced**. Both drops take the PIN with them —
  a pin and its name are one thing (the same reason the whole layer waits for the settled frame), and a
  field of anonymous dots was rejected before. The separation test runs BEFORE the 34-candidate label
  search, which is where the lag went. `drawEraCities` runs the same rule, with the map EDITOR exempt: its
  pins are what a click is dragging.
  **The Heightmap layer's STRENGTH is the reader's** (`hmOpacity` / `setHmOpacity` / `#hmOpacityRow`, Aug
  2026, on request): a slider in the legend, under the row that turns the layer on and shown only while it
  IS on. It is applied as `globalAlpha` at the blend rather than baked into the reprojection buffer's
  per-pixel alpha, so moving it is a redraw and not a re-reprojection — and **`viewKey` carries it**, or the
  settled base cache would keep serving the old strength. Device-local
  (`localStorage["folio_hm_opacity_v1"]`), like the marker's position and the place sheet's height.
  **A GLOSSARY TERM CAN PUT ITSELF ON THE MAP** (`glossPlace` / `focusPlace` / `focusPoint`, Aug 2026, on
  request). A term the Atlas can show carries a map-marker button beside the × in its popup; pressing it
  closes the popup and routes to `map` with `{ focus }`. Two shapes and no third:
  · a term naming a **country** the map draws is flown to and **lit up** in the map's own gold — the ordinary
    selection paint plus the change-pulse — with **no info panel**, because the reader has just read about it
    and asked where it is, not for a second description;
  · a term naming a **point** (a cave, a gorge, a named region) gets a **gold dot and its name**, plus the
    expanding ring, and is drawn ONLY while focused. Most of these are not cities and have no business
    cluttering the map for someone who came to look at something else — but they ARE added to the atlas
    search index as kind `site`, so the place is findable by name and picking it focuses it the same way.
  Both land on `sfx("discover")` after the flight, and both are cleared by Esc and by the next click on the
  ocean. **The join is done at BUILD time** by `.claude/fetch-place-coords.js`, which writes two tables into
  glossary.js: `GLOSSARY_PLACES` (slug → `[lon, lat]`, **fetched from each article's own published primary
  coordinate**, never hand-written — a term whose article has none simply gets no marker) and
  `GLOSSARY_MAP_COUNTRY` (slug → the name world.js uses, with a short alias table for the ones the two spell
  differently). It is a build-time join because **world.js is a lazy 1.6 MB bundle and the popup has to
  decide whether to show its marker without it**. A continent, an ocean or a vague region is deliberately in
  neither table: it is not a place you can point at.
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
  · **Motion frames are cheaper on purpose.** While `moving`: the whole city layer is skipped (`drawCities` and
    `drawEraCities` return at the top), selection glows drop `shadowBlur`, and the selection's gold COASTLINE
    (`strokeCoastClipped`, two more clips + a scan of every coast chain in the region) is skipped — the fill is still
    clipped to the land, so only the bright coast edge waits for the settled frame. Everything returns when settled.
    **A pin and its name go together** (changed Aug 2026, on request): the label layout is a spatial grid plus
    thousands of short-lived rect arrays per frame and can only run on the settled frame, but drawing the PINS
    anyway left a field of nameless dots through every drag and zoom. The map editor is the one exception —
    `drawEraCities(era, editable)` still draws while `editable`, since those pins are what a click is dragging.
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
  **Game mode + approachability (batch 3):** `PAGES.findit` routes to `PAGES.map(root, {game:true})` — the **"Find it"
  daily minigame** plays on the real globe (`const GAME` gates everything): 5 date-seeded rounds from
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
  `checkAchievements()`.
  · **A PULSE CANNOT CARRY AN ANSWER, AND FOR A FORTNIGHT IT WAS ASKED TO** (`gameMarks` / `gamePin` /
    `drawGameMarks` / `TINT_MISS` / `TINT_FOUND` / `TINT_ANSWER`, Aug 2026, on a bug report). The pulse is a
    1.6-second throb and then nothing, which is right for "these territories changed hands on that step" and
    wrong for an answer: a reader who missed twice was told "It was here." and looked up to find the flash
    already over and the map exactly as it had been — the answer announced and then withdrawn before it could
    be read. The wrong guess had the same fault the other way round, flashing red at the one moment the reader
    is looking at their own finger rather than at the map. So both are now **PAINTED and stay painted until
    `gameShowRound` clears them**: a LIST, since a round can hold two wrong guesses in red with the answer's
    gold over them. A revealed CAPITAL gets `gamePin` instead — a dot with its name beside it, drawn like
    `focusPoint` — because a city on a coastline of a thousand others cannot be shown by a ring that fades.
    · **Deliberately NOT `selSet`.** That is the map's gold, and `drawSelectionOverlay` caches it into `selCv`
      under a key made of its MEMBERS alone, so two marks wanting different colours would blit whichever was
      cached first. `drawGameMarks` paints direct instead, which costs nothing here: a mark lives for one
      round, there are never more than a handful, and the reveal is followed by a `flyTo`, so the frames it
      appears on are moving frames the cache would be rebuilding for anyway.
    · **`paintFillGroups` / `strokeCoastClipped` take an optional TINT** (`{rgb, fillA, line, glow}`, default
      `TINT_SEL`) so the game's three colours reuse the painter's exact edge-tracing — mask-aware, coast-clipped
      — rather than a second outline routine that would trace the era polygon's own offset shore. `TINT_SEL`
      writes `line` and `glow` out in full so the shipped gold selection is unchanged: its outline is a
      LIGHTER amber than its fill, which deriving them from one triple would have quietly flattened.
  **Anti-cheat gating**: `.atlas-game` CSS hides search/legend/hover-chip/hint, game mode
  **forces `citiesOn`/`majorCitiesOn`/`countryNamesOn` false** (a capital label on the board IS the answer),
  **the timebar is GONE** — `.atlas-game{--timebar-h:0px}` plus `display:none` on the bar, Aug 2026 on request.
  It used to be left on screen `inert` and slightly dimmed so the board would still look like the Atlas, but the
  round names its own year in the question, the rail cannot be touched and stepping years is precisely what the
  game must not allow, so it was a fifth of a phone screen spent on a control with nothing to say. **Setting the
  variable on `.atlas-game` rather than `:root` is what gives that height back**: `.globe-stage` is a descendant,
  so it inherits the zero and grows into the space, and every other rule written against `--timebar-h` is left
  describing the ordinary Atlas. The markup stays (hidden, so out of the tab order too), so `paintYear`,
  `renderMapYearMarks` and `layoutTicks` need no game branch — the last returns early on a zero `clientWidth`.
  `stepYear`/`playTick` keep their GAME guards, and the whiteboard never mounts. **A same-day replay is turned
  away at the door** by `gameLockedToday` in `PAGES.findit` (Aug 2026, on request — see the daily-games bullet).
  It used to be admitted as PRACTICE, playable and recording nothing, since the rounds are deterministic and
  every answer was revealed during play; `gamePractice` and its four branches are **deleted rather than left
  unreachable**. The Atlas also gained **first-visit coach
  marks** (`#atlasHelp` overlay, auto-shown once via `localStorage["folio_atlas_tour_v1"]`, reopened by the `#gzHelp`
  "?" button — **five tips since Aug 2026**, a marker one having been added on request: the whiteboard draws on the
  globe as it does on a study card, and the strokes there are geo-anchored, so they turn with the map. The Library
  now carries the same kind of card; see `pageHelp`) and **keyboard navigation** (canvas `tabindex=0`: arrows rotate, Enter selects/answers at the disk
  centre, Esc clears, `[`/`]` step map-years). The **`#gzIn`/`#gzOut` zoom buttons' markup was restored** (wiring + CSS
  existed but the DOM had been lost in an old refactor); the `.globe-zoom` column now sits **bottom-right** — at
  top:50% it collided with the (top-right) legend on short viewports. Clicking a country
  (present-day or a historical era's territory) highlights it and shows a single info popup above the
  timeline — its name + a 5-sentence description from `countries.js`; one at a time, cleared on a second
  click / ocean click / era change. The popup is a **vertical panel on the LEFT of the stage** (the base `.country-pop` rule:
  `left:clamp(16px,4vw,40px); top:16px; bottom:16px; width:min(360px,…)`, single-column `.cp-cols`) — the legend moved to the
  **top-right under the search box** (`.globe-legend{right:…; top:60px}`) to free the left edge. On **≤720px** it reverts to a
  **bottom sheet**. In both layouts it is `display:flex; flex-direction:column` and its
  **`.cp-cols` scroll internally** (`overflow-y:auto; min-height:0`) so the box never pushes the absolutely-positioned
  **`.cp-close` (×) off screen** — the × stays pinned while the columns scroll. Don't put `overflow` on
  `.country-pop` itself (the × would scroll off). **The scroller is reset on every populate**
  (`showCountryPopupName` sets `scrollTop` AND `scrollLeft` to 0) — the popup element is REUSED, so without it the
  next place opens wherever the previous one was left: however far down it on the desktop panel, and however far
  ACROSS on the phone.
  **Its parts each fold** (`.cp-sec` + `.cp-sec-head`/`.cp-sec-body`, one delegated click listener on
  `#countryPop`): the description, the year paragraph (whose header IS the year number, so it still reads while
  shut), the figures grid and the sources. `cpSection(sec, hasContent, alwaysPane)` sets each one as the popup is
  filled — **open when it has something, closed when it doesn't**, so a place with no year paragraph and no
  figures shows two quiet headers instead of a dash and a grid of dashes. That **resets per entity**: a reader's
  manual toggles belong to the popup they were made in, not to the next country.
  **On a phone those sections are PAGES, not folds** (Aug 2026, on request). The sheet is short and four stacked
  sections buried the figures three scrolls down, so at ≤720px `.cp-cols` becomes a `flex-direction:row`
  `scroll-snap-type:x mandatory` scroller whose `.cp-sec` children are each `flex:0 0 100%`, swiped between one
  page at a time. Three things follow from that and are load-bearing: **the title block lives in `.cp-head`,
  OUTSIDE the scroller** (it was `.cp-main`, inside it, and would have slid away with the first swipe, leaving the
  figures unlabelled); every page renders **expanded** and the head is inert there (`cpPagerOn()` makes the
  delegated fold handler return, so a tap can't write `srcCollapsed` either) since there is nothing under a page
  to uncover by shutting it; and an EMPTY section is **dropped from the run** (`cp-blank`) rather than collapsed,
  so a swipe never lands on a dash — except the description, which passes `alwaysPane` because it carries a "no
  description yet" line and is **the page every place must open on**. `#cpDots` is the pager (built by
  `cpSyncDots`, followed by `cpActiveDot` on scroll, and a tap on one turns to that page); it is hidden outright
  in the stacked layout, and `cpResize` rebuilds it when a rotation crosses the breakpoint.
  **A swipe may never move more than ONE page** (Aug 2026, on a bug report: a hard flick carried from the
  description straight to the figures, skipping the year paragraph). `mandatory` only says WHERE a scroll may come
  to rest; **`scroll-snap-stop:always`** on `.cp-sec` is what forbids passing a snap point within one gesture,
  momentum included, and is the real fix. **`wireOnePageSwipe(el)`** (beside `animateProgs`; it was shared with
  the home pager, which no longer exists) is the net under it for engines that lack the property: it records the page a gesture STARTED on and,
  once the scroller has settled, pulls it back to one step away if snapping landed further. The correction comes
  **after** the settle rather than fighting the gesture — nothing can predict a fling, and a scroller wrestled
  mid-flick feels broken in a way an overshoot does not. It is RTL-aware (`scrollLeft` runs negative there) and
  the skip is invisible when it happens, which is why it does not rest on one mechanism.
  **The discovery chip shares the title's row** (`.cp-titlerow` wrapping `#cpName` + `#cpNew`, Aug 2026, on
  request): it names the place beside it, and a line of its own cost the short phone sheet a whole line before
  the description started. The 20px right margin that clears the × moved from `.cp-name` up to the row.
  **The sheet's CEILING is what the PAGE ON SCREEN needs** (`cpPaneNeedH` / `cpFitH`, Aug 2026, on request:
  "the max height should always be the point where everything is displayed fully, so we are never left with
  empty space at the bottom"). `cpMaxH()` is now the smaller of the room the screen has and the height the
  active pane actually asks for, and a swipe to a shorter page pulls the sheet down to fit it. The reader's
  own dragged height is kept as the CAP it always was rather than overwritten, so swiping back to a long page
  restores it — a swipe answers for the page it lands on and must not quietly relitigate a setting. The fit
  is **debounced past the scroll settle**, not run per scroll event: resizing the box a gesture is being made
  inside means the snap is measuring a moving target. `cpSyncDots` has to run BEFORE `cpApplyH` on every
  populate, since the dot row is part of what the sheet must make room for.
  **The sheet's HEIGHT is the reader's to set** (`.cp-grab` / `cpWireResize` / `cpApplyH` / `cpMinH` / `cpMaxH`,
  Aug 2026, on request): drag the grip at its top edge — a pill centred on it, since a draggable edge with no
  mark on it is one nobody will find — down to the title bar alone or up to the top of the screen. Stored as a
  **fraction of the viewport** in `localStorage["folio_cp_h_v1"]` (device-local like the marker's position, and a
  fraction so a rotation keeps the proportion), re-applied on every `showCountryPopupName`, so the next place
  opens at the height the last was left at. `.cp-sized` is what takes the stylesheet's 52% cap off and lets
  `.cp-head` shrink; the desktop panel is untouched (`cpPagerOn()` gates everything, and the grip is
  `display:none` above 720px).
  **`cpMinH` measures through `offsetTop`/`offsetHeight`, never `getBoundingClientRect`** — and this is the whole
  trick. The head is a scroller inside the very box being shrunk, so its rect reports whatever is left of it, and
  a floor derived from that collapses as the drag approaches it: the first version bottomed out at the hard 56px
  and the title scrolled out of the sheet it was meant to be the floor of. Offsets are layout values and do not
  move.
  **AND ON A PHONE IT NOW OPENS SHUT — THE NAME AND A CHEVRON, NOTHING ELSE** (`cpShut` / `cpSetShut` /
  `cpSyncMore` / `#cpMore` / `.cp-shut`, Aug 2026, on request: "the popup panel at the bottom should only
  open far enough to reveal the name of the state, but have a chevron that can reveal the information
  sections, which should always be collapsed by default"). Tapping a country on a 390px screen used to
  raise a sheet over half the map — the map being the thing just tapped — before the reader had asked for
  anything but the name. **The shut height IS `cpMinH()`**, the floor the drag already measured, so there
  is one definition of "the title bar alone" and the chevron and the grip cannot come to disagree about it.
  Three things follow. **It is reset to shut on EVERY populate**, before `cpApplyH`, since the element is
  reused and a reader who opened one country's sections has said nothing about the next. **The reader's own
  dragged height is kept rather than overwritten** — the chevron opens to it, exactly as the swipe-to-a-
  shorter-page fit does. And **starting a drag clears the shut state**, or dragging the grip upward would
  fight a rule that keeps pulling the sheet back to its floor. The chevron is `display:none` above 720px,
  where the panel is a column beside the globe and covers nothing; that base rule must sit BEFORE the
  ≤720px block, media queries adding no specificity.
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
- **A QUESTION MAY NEVER NAME A RESEARCHER OR SCHOLAR.** Not "Hans van Wees calls…", not "Lambert argues
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
· It writes the same fields the pass writes: a card and a term take `{ src, title, desc, credit, alt }`, an
  artefact `{ src, credit, alt }`, and **`credit` is required in all three** — a picture on Folio is always
  somebody else's file, and `add-card.js`, `add-glossary.js`, `add-artefacts.js`, `add-images.js` and the
  editors' media gate all refuse an uncredited one.

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

**THE ELEVEN PLANNED COLLECTIONS — the index (Aug 2026).** Every one is grown the same way: **"generate
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
| Geography | `geo-us` | `geo-` | `docs/geography-card-plan.md` | 2 / 2 | 5 cards — and it is NOT a 1000-card plan, see below |

The next id for any of them (substitute the prefix):

    node -e "global.window={};require('./data.js');const h=new Set(window.CARD_DATA.map(c=>c.id));for(let i=1;i<=1000;i++){const id='jp-'+String(i).padStart(3,'0');if(!h.has(id)){console.log(id);break}}"

**Two traps when looking a number up in a plan.** A deck heading is `## Title — \`id\`` OR
`### Title — \`id\`` — the shallower level is a **flat deck**, one that is itself a leaf (`gr-iron`,
`ru-federation`, `cn-myth`), so reading only `###` misses it. And **`docs/world-history-card-plan.md`
carries an APPENDIX** — the 2026-08-04 renumbering record, under its own `#`-level heading — which
lists 109 ids in the OLD numbering; the running order stops there, so a lookup that runs past
`# The 2026-08-04 renumbering` will find the wrong entry.

**`node .claude/test-card-plans.js` checks all of this** (142 assertions, no browser, no dependencies):
every deck a plan names exists in that collection, every leaf in `data.js` is named by its plan, each
running order covers the numbers its own collection declares with no gaps or duplicate ids or repeated
topics, and CLAUDE.md names each plan, carries a working next-id command and states each prefix in the
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
  checked. **AND THE TOOLS CHECK THAT A CITATION ENDS IN A URL, NEVER THAT THE URL OPENS** — so an
  archive.org identifier or a DOI written from MEMORY ships as a 404 and nothing anywhere reports it
  (`cnh-006` shipped one for an hour: `sacredbooksofchi27conf` for `sacredbooksofchi0027unse`). Curl
  every citation URL of a new card before committing it; a 302 is a DOI resolving and is fine, a 404
  is a source the reader cannot check. **Every source must be referenced by at least one marker** — a citation
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
- **Forty-two committed regression tests** (in `.claude/`, not loaded by the site): most drive a real browser with
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
    **Re-run after touching `PAGES.crossword` / `PAGES.picture` / `PAGES.whatyear`, `xwNorm` / `xwPool` /
    `xwLayout` / `dailyCrossword` / `xwLocked` / `nextOpen` / `xwMarkGaveUp`, `picturePool` /
    `dailyPictureRounds` / `tagKinship`, `buildWhoSaidRounds`, `threadEasyKeys` / `dailyThreadPuzzle` /
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
  · `node .claude/test-artefacts.js` — **THE RELIQUARY, the collection banners, and the two colour swaps that
    went with them** (Aug 2026). Everything in it fails SILENTLY, which is why it is a file rather than a few
    lines appended elsewhere. **The roll**: a chest never returns something already owned (with a small pool a
    duplicate reads as bad luck and is never reported), every rarity is reachable, and an exhausted pool SAYS
    so rather than opening on nothing — driven through 32 real chest openings over a synthetic 32-artefact
    pool planted in the admin overlay, under `reducedMotion` so the rarity-sized waits collapse to a tick.
    **The queue**: dismissing an overlay keeps the chest, opening one spends exactly one. **The showcase cap**:
    four, and the fifth refused. **The colour swap, in both directions** — a book's marker measured against a
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
    no showcase at all and `test-artefacts.js` therefore cannot reach one.
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
  the owner has not run yet is the normal case, not the broken one. Plain `fetch()` (no SDK — zero-dependency rule); the publishable key in app.js is safe to ship
  (security = RLS). **Offline-first**: localStorage stays the working copy; `save()` → `supaQueuePush()` (6s debounce, skips
  no-ops) PATCHes the whole `PROGRESS_FIELDS` blob into `progress.data`; boot (`supaBoot`) refreshes the session, pulls, and
  reconciles — server wins when its `updated_at` ≠ the device's `S._supaTs` baseline (another device wrote), else local pushes.
  **`progressBlob()` is what it sends, and that is NOT `extractProgress()`** — the per-review log has a table of its own
  (`review_log`, block 10; see the `revlog` bullet) precisely because this blob is PATCHed whole, so anything that must grow
  without bound belongs beside it rather than in it. `extractProgress()` still includes the log, since the guest stash is a
  whole device state; **if you add a field that grows per review, give it a table and keep it out of PROGRESS_FIELDS.**
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
