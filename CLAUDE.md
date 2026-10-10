# Folio — project guide for Claude Code

Folio is a study companion: an Anki-style flashcard site with spaced repetition, daily games, a
glossary, a library of whole books, an admin editor and an interactive globe. It is a plain static
website — open `index.html` and it runs. Hosted on Cloudflare Pages at https://folio.study; merging to `main` deploys.

**This file is deliberately short.** It used to be 930 KB and every session paid for all of it on every
step. Everything it used to say is in **`docs/reference.md`** — the archive of why every rule exists.
**📖 `docs/reference.md` — READ BEFORE TOUCHING ANYTHING IT NAMES, BY GREPPING FOR THAT NAME — NEVER
WHOLE.** Read only the paragraph around the hit. **📖 `docs/README.md` — READ BEFORE LOOKING FOR A DOC**: the index of
`docs/`, one line per file. Rules live here; reasoning lives in `docs/`.

## Working cheaply (read first — this is why the file is short)

- **Never read a large file whole.** `app.js` is ~3.5 MB, `data.js` and the `data-extra/` files are
  megabytes, `docs/reference.md` is 930 KB, the card plans are thousands of lines. Use `grep -n` and
  `sed -n 'A,Bp'`. `node .claude/app-map.js --find <name>` locates anything in `app.js`.
- **Read a doc only when a pointer below says to**, and only the section you need.
- **Before changing a function, grep `docs/reference.md` for its name** — that finds the rule, the
  fault it was written for, and the test that guards it, for the cost of a few lines.
- **Do the task asked, then stop.** No unrequested audits, refactors or sweeps. Report findings you
  trip over in one line rather than fixing them.
- **Prefer the helper scripts in `.claude/`** over hand edits of data files: they validate, splice one
  line, and are far cheaper than reading and rewriting a file.
- **Keep the final reply short**: what changed, what was verified, what was not.

## Which checks to run (and which to skip)

Every push runs CI (`.github/workflows/checks.yml`): the fast Node checks as a gate, and **every
Playwright browser suite** as a second opinion. So a session does not need to re-run what CI will run.

| the change | run locally | skip |
|---|---|---|
| Cards, glossary terms, date lines, sources (content only) | the add/fix helper's own validation, then `node .claude/check-style.js`, `node .claude/check-questions.js`, `node .claude/test-card-plans.js` | all browser suites |
| Docs, plans, `CLAUDE.md` | `node .claude/check-docs.js`, `node .claude/test-card-plans.js` | everything else |
| JS logic with no visible change | `node --check app.js` + the ONE suite that guards it (grep `docs/reference.md` for the function's name to find its "Re-run after touching" line) | the other suites |
| Anything a reader SEES (layout, CSS, a new control) | `node --check app.js` + the one relevant browser suite + one screenshot | the rest |
| Before merging a big thread | nothing extra — read CI's result on the PR | — |

The user can override in a prompt: **"skip tests"** means syntax check only; **"full tests"** means run
every relevant suite. Playwright and Chromium are preinstalled in cloud sessions
(`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`; never `playwright install`).

## Golden rules

- **No remote dependencies, vanilla JS, no build step.** No frameworks, bundlers, npm packages,
  `node_modules` or CDN scripts in the site. It must work from `index.html` directly. No inline
  `<script>`, no `eval` / `new Function` in the site (the CSP in `_headers` depends on it; never relax it).
  **The one exception is a vendored library** (Oct 2026): a small library under a permissive licence
  (MIT, BSD, ISC or Apache-2.0 — never GPL/LGPL/AGPL, non-commercial or share-alike) MAY be copied into
  `vendor/` as a plain, unminified or source-mapped JS file and loaded like any other script, when the
  task's PR says why. Each file has a `vendor/<name>.LICENSE` beside it and a row in `vendor/README.md`
  (name, version, upstream URL, licence, why). Vendored files are lazy (`DATA_BUNDLES` / `ensureData`)
  unless a reader needs them at boot. The offline generators in `.claude/` may use ANY Node library:
  their output is data files and the library never ships — install it outside the repo and reach it
  through `NODE_PATH`, exactly as Playwright is. 📖 `docs/reference.md` "Vendored libraries" has the reasoning.
- **Touch only what the task needs.** Small, surgical diffs. Don't reformat or rename unrelated code.
- **Never fabricate content.** No invented dates, names, figures, citations, authors, DOIs or page
  numbers. If a claim cannot be sourced, soften it or drop it, and say so.
- **Be honest about scope and tradeoffs.** Flag limitations plainly.
- **Changelog + version, on every user-requested change that reaches readers.** Append ONE
  plain-English line to TODAY's entry in `changelog.js` (newest day first; create the day if missing)
  and bump `window.FOLIO_VERSION = { v, released }` at the top of the same file in the same commit.
  `v` is MAJOR.MINOR (minor +1 per release). **`released` is captured, never typed**:
  `date -u "+%Y-%m-%dT%H:%MZ"`. One sentence per item (~120 chars, max 200); one line per KIND of
  change per day (raise an existing "N new cards" line's count instead of adding a second); a day
  title is ≤72 characters (`check-style.js` rule 5). Card/glossary changes are described by count and
  deck only, never naming a card. Items render as HTML (`<b>`, `<i>` allowed). English only.
  **A community deck in `decks/` is not a change to Folio** — no line. **Docs/CLAUDE.md/tooling-only
  changes are not reader-facing** — no line, no bump. `sw.js`'s `VERSION` is a cache generation and is
  NOT bumped for a release. 📖 `docs/changelog-and-version.md` — READ BEFORE CHANGING HOW THE CHANGELOG OR VERSION WORKS.
- **English only** (`MULTILANG = false` in `app.js`). New content needs no translations; the content
  tools drop a supplied `i18n` block. Never put translations into an eager-path file.
- **Commit as you go; push to the branch you were given.** Never push to `main`.

## File map (the essentials)

- `index.html` — shell. **Eager scripts, in order:** `data.js → truefalse.js → quotes.js → whatyear.js →
  crossword.js → changelog.js → mission.js → glossary.js → artefacts.js →
  lang-decks.js → app.js` (read the real list from `index.html`). Sizes: `node .claude/check-sizes.js`
  — never quote a size.
- `app.js` — all logic, one IIFE, hash routing via `PAGES`. Navigate it with `.claude/app-map.js`.
- `styles.css` — design system; themes are CSS custom properties, **hex only** (the canvas globe parses
  them). A new theme adds no webfont and must override `.collection-deco`.
- `data.js` + `data-extra/<collection>.js` — the cards, **split in two**: `data.js` holds the light
  half (question, answer, date line, tags, difficulty, locator, war…), `data-extra/` the heavy half
  (abstract, sources, why, quote, image, and the `questions` phrasing pool). **Every helper goes through `.claude/card-io.js`**
  (`loadCards`/`writeCards`); a helper that evaluates `data.js` alone sees empty abstracts and does not
  fail. `writeCards` ignores tree edits — edit `COLLECTION_TREE` as text.
- `glossary.js` + `glossary-extra.js` — the glossary, split the same way: `glossary.js` holds every KEY (with
  an empty text) plus dates, aliases, tags; `glossary-extra.js` the definitions, citations and pictures. Ask
  `k in window.GLOSSARY`, never whether its text is truthy. Go through `.claude/gloss-io.js`.
- `artefacts.js` + `artefacts-extra.js` — the Reliquary pool; go through `.claude/artefact-io.js`.
- `timeline.js`, `world.js`, `countries.js`, `cities.js`, `rivers.js`, `lakes.js`, `us-states.js`,
  `china-provinces.js`, `russia-subjects.js`, `world-capitals.js`, `coast/`, `rivers/` — map data,
  **lazy**, mostly generated by `.claude/build-*.js` (never hand-edit generated files).
- `books/<id>.js`, `books/<id>.<lang>.js` — Library texts, lazy, generated by `.claude/fetch-book.js`.
  📖 `docs/library-importer.md` — READ BEFORE ADDING A BOOK OR TOUCHING ANY EXTRACTOR.
- `decks/*.folio-deck.json` + `lang-decks.js` — language decks (re-run `.claude/build-lang-decks.js`
  after changing a deck). 📖 `docs/lang-decks.md` — READ BEFORE TOUCHING ANY DECK OR GENERATOR.
- `docs/*-card-plan.md` — the fixed running orders for every collection (table below).
- `.claude/` — helper scripts and tests. Not part of the site.
- `atlas/` — Atlas v2 (Oct 2026): `atlas.js` (the page), `atlas-gl.js` (WebGL2), `atlas-canvas.js` (the still 2D view without
  WebGL2), `atlas-worker.js` (geometry; also the main-thread shim on `file://`), `atlas-format.js` (the `.bin` reader shared with
  the checkers), `vendor/earcut.js`; `atlas/data/` — generated: `topology.bin` + `tiles/`, `water.bin` + `water/`, `relief/`,
  `gazetteer.js`, `credits.js`, and the `.bin.js` twins for `file://`. `.claude/atlas-build/` — the pipeline (`npm ci` there;
  nothing ships). Routes: `#map2` (unlinked preview), `#credits` (Sources and credits, linked from Settings, the home footer,
  About and the map's `?`).
- `_headers` — CSP. `manifest.json`, `icon*.svg`, `sw.js` — PWA (never registered on a dev origin).

## Invariants that fail silently (one line each — grep `docs/reference.md` before touching)

- **Lazy data**: `DATA_BUNDLES` / `ensureData(name)`. A lazy file whose global is read at boot needs an
  `after` hook re-applying `ADMIN_EDITS`. 📖 `docs/eager-path.md` — READ BEFORE SPLITTING ANYTHING OFF THE EAGER PATH.
- **Admin edits are deltas** (`ADMIN_EDITS`, applied at boot); the shipped data files are never
  rewritten by the app. Live edits publish through the `content_overrides` Supabase row — after baking
  them into data files, remind the user to reset that row to `{}`. Dev origins never publish or adopt.
  📖 `docs/admin-editor.md` — READ BEFORE TOUCHING THE ADMIN AREA.
- **Accounts/sync**: offline-first, `progressBlob()` PATCHed whole; anything that grows per review gets
  its own table, never `PROGRESS_FIELDS`. 📖 `docs/accounts-sync.md` — READ BEFORE TOUCHING SIGN-IN OR SYNC.
- **Scheduler** (`sched*`, FSRS) is pure and arithmetic-tested. 📖 `docs/scheduler.md` — READ BEFORE TOUCHING THE SCHEDULE.
- **Daily study / deck limits**: 📖 `docs/daily-study.md` — READ BEFORE TOUCHING THE REVIEW OR A DECK'S OPTIONS.
- **Minigames** draw cards only through `gameCardIdSet()`; daily draws only through `dayPick()`.
  📖 `docs/minigames.md` — READ BEFORE ADDING A GAME OR CHANGING A POOL.
- **Atlas (v1, `#map`)**: one geometry source per era; DOM limb layers, not canvas gradients.
  📖 `docs/atlas.md` — READ BEFORE TOUCHING THE RENDER PATH, AN ERA OR THE TIMELINE.
- **Atlas v2 (`#map2`, Phase 1 complete, unlinked until Phase 5)**: `atlas/` is the lazy `atlas2` bundle; every file under
  `atlas/data/` is GENERATED by `.claude/atlas-build/` and carries a `sources` header — never hand-edit one, and never
  touch `topology.bin`, `tiles/`, `water*` or `relief/` without the land files staying byte-identical (`sha256sum`).
  The `#credits` page is generated from those headers (`build-credits.js`; `check-credits.js` in CI fails when it lags).
  The frame gate (`test-atlas-perf.js`, its own CI job) must be green on every head; on a slow GPU the view degrades
  in two sticky stages during a gesture (half resolution, then one coarser level — `gestureFrame` in `atlas.js`, design
  §7 Phase 1d). Names are English, one row per Wikidata item per kind (`build-gazetteer.js`, `check-gazetteer.js`).
  📖 `docs/atlas-v2-design.md` — READ BEFORE BUILDING ANY PART OF ATLAS V2 (the design, §7's as-built notes per phase, the owner's gate rules).
  📖 `docs/atlas-v2-build.md` — READ BEFORE RUNNING OR CHANGING ANY SCRIPT IN `.claude/atlas-build/` (pipeline order, every checker, every CI job).
- **Map cards / locators / war cards**: 📖 `docs/map-cards.md` and 📖 `docs/war-cards.md` — READ BEFORE CHANGING EITHER FORMAT.
- **Footnotes**: markers are written EMPTY (`<sup class="fn" data-fn="N"></sup>`); `wireFootnotes`
  numbers them. 📖 `docs/source-footnotes.md` — READ BEFORE TOUCHING THE APPARATUS.
- **Community decks** never enter `CARDS` / the tree / `window.GLOSSARY`; `uDeckNormalize` is the one
  ingest choke point; bump `SANITIZE_REV` when a sanitizer changes.
  📖 `docs/community-decks.md` — READ BEFORE TOUCHING ANY OF IT.
- **Never name a CSS class `ad-…`** (ad blockers hide it; `adBaitCheck` in `test-layout.js`).
- **Units and spelling** are rendering passes over text nodes (`unitizeTree`, `spellTree`); content is
  authored metric-first with imperial in brackets, and in British spelling.
  📖 `docs/reader-settings.md` — READ BEFORE CHANGING EITHER.
- **Library**: 📖 `docs/library-feature.md` — READ BEFORE TOUCHING THE LIBRARY.
- Other areas each have a doc — find it in `docs/README.md`.

## Generating cards & glossary entries

**📖 `docs/card-authoring.md` — READ BEFORE WRITING A CARD OR A GLOSSARY TERM.** It is the complete,
self-contained spec (every field, every length, every style rule, a worked example) — the same file
the user pastes into ChatGPT, so the two always agree. Then read **only the section of the
collection's plan** covering the cards you are writing, plus the plan's short scope sections if you
have not this session.

- **The next cards**: `node .claude/next-cards.js <prefix> [n]` prints the next `n` unwritten plan
  lines with their deck ids — no need to open the plan file to find them.
- **Write one card**: `node .claude/add-card.js <card.json> <deckId>` (**always pass the deck id**, or
  it files into China). **It also resolves the card's Wikipedia article** and writes it as `wiki` (see
  "Wikipedia links" below) — read its output: a link marked CHECK wants a glance, "no dedicated article"
  is a normal answer, and "NOT RESOLVED" prints the command that finishes it. **Write one term**: `node .claude/add-glossary.js <entry.json>` — it
  **overwrites an existing term in silence**, so grep `glossary.js` for the slug first.
- **Import a batch** (from ChatGPT or written in bulk): `node .claude/import-batch.js <batch.json>` —
  adds the glossary terms (refusing existing slugs), then each card, and writes anything refused to a
  `.rejected.json` beside the input for fixing. **Verify every citation before committing** (curl each
  URL; `node .claude/check-citations.js --card=<id>`): a ChatGPT citation is a claim, not a fact.
- **The plan is the authority**: the next card is the lowest unwritten number; don't create decks;
  a plan line is a subject to research, not a fact — retitle a line in the same commit when research
  says so.
- Other writers: `add-sources.js` (citations onto existing content), `set-date-line.js`,
  `fix-field.js`, `add-questions.js`, `add-card-links.js` (why / leadsTo), `add-locators.js`,
  `add-card-wars.js`, `add-card-difficulty.js`, `add-card-tags.js`, `mark-undatable.js`,
  `set-facts.js`, `add-images.js` — each documents itself in its header.
- After a batch: `check-style.js`, `check-questions.js`, `node .claude/check-cards.js --prefix=<p>`
  (report only), `test-card-plans.js`.
- **Wikipedia links** (the "Learn more" tile at the foot of a card, `learnMoreHTML`): `.claude/wiki-links.json` maps
  each card to its dedicated article and `node .claude/apply-wiki-links.js` writes it onto the cards as the heavy
  field `wiki` — the only writer of that field; never set it by hand. **A new card gets its link automatically**:
  `add-card.js` and `import-batch.js` run `find-wiki-links.js` + the applier for the cards they write (needs the
  network; `--no-wiki` skips it; a `--replace` re-resolves only if the answer changed). A card whose answer is a
  descriptive phrase has no article and shows no tile — that is an answer, not a fault. If Wikipedia could not be
  reached the output prints the command to run later, and CI's `node .claude/apply-wiki-links.js --check` (offline)
  fails until it is. To correct a link, edit its entry in `wiki-links.json`, add `"manual": true` (a re-run then never
  overwrites it) and run the applier. 📖 `docs/wikipedia-links-audit.md` — READ BEFORE CHANGING A CARD'S LINK OR THE RESOLVER (the cards still needing a human decision).

### The planned collections

| collection or deck | id | prefix | plan | decks / leaves | state |
|---|---|---|---|---|---|
| World History | `col-8` | `wh-` | `docs/world-history-card-plan.md` | 8 / 39 | complete |

📖 `docs/wh-refinement-audit.md` — READ BEFORE TOUCHING ANY `wh-` CARD (the Oct 2026 refinement: Greece's rules plus deep time, batches, ledger; `node .claude/wh-audit.js`). 📖 `docs/wh-chronology.md` — READ BEFORE WRITING A DATE ON A `wh-` CARD.

| Ancient Greece | `col-13` | `gr-` | `docs/greece-card-plan.md` | 6 / 19 | complete |

📖 `docs/greece-refinement-audit.md` — READ BEFORE TOUCHING ANY `gr-` CARD (the Sep 2026 refinement: rules, batches, ledger; `node .claude/greece-audit.js`, and `add-card.js --replace`). 📖 `docs/greece-chronology.md` — READ BEFORE WRITING A DATE ON A `gr-` CARD. A card's source bar is tiered by difficulty (`srcTargetFor`: 1 → 9 … 5 → 5). `node .claude/test-why-markers.js` guards Think-it-through markers.

| Ancient Rome | `col-40` | `rm-` | `docs/rome-card-plan.md` | 7 / 25 | complete |

📖 `docs/rome-refinement-audit.md` — READ BEFORE TOUCHING ANY `rm-` CARD (the Oct 2026 refinement: Greece's rules plus tradition against fact, batches, ledger; `node .claude/rm-audit.js`; the harness is `.claude/wh-refine/` with `REFINE_PREFIX=rm-`). 📖 `docs/rome-chronology.md` — READ BEFORE WRITING A DATE ON AN `rm-` CARD.

| United States | `col-41` | `us-` | `docs/us-card-plan.md` | 9 / 33 | live |
| Russia | `col-42` | `ru-` | `docs/russia-card-plan.md` | 9 / 29 | live |
| India | `col-43` | `in-` | `docs/india-card-plan.md` | 9 / 31 | empty |
| China | `china` | `cnh-` | `docs/china-card-plan.md` | 7 / 39 | live (`cnh-070` retired, never reuse) |
| Ancient Egypt | `egypt` | `eg-` | `docs/egypt-card-plan.md` | 9 / 26 | live |
| The Second World War | `ww2` | `ww2-` | `docs/ww2-card-plan.md` | 8 / 30 | live |
| The First World War | `ww1` | `ww1-` | `docs/ww1-card-plan.md` | 9 / 37 | empty |
| Architecture | `arch` | `arch-` | `docs/architecture-card-plan.md` | 9 / 39 | empty |
| Middle-earth | `middleearth` | `mid-` | `docs/middleearth-card-plan.md` | 9 / 40 | empty |
| Westeros | `westeros` | `wes-` | `docs/westeros-card-plan.md` | 9 / 41 | empty |
| The Cold War | `coldwar` | `cw-` | `docs/coldwar-card-plan.md` | 9 / 36 | empty |
| The Viking Age | `vikingage` | `vk-` | `docs/vikingage-card-plan.md` | 9 / 39 | empty |
| Japan | `japan` | `jp-` | `docs/japan-card-plan.md` | 9 / 34 | live |
| Psychology | `psych` | `ps-` | `docs/psychology-card-plan.md` | 9 / 38 | live |
| Philosophy | `phil` | `ph-` | `docs/philosophy-card-plan.md` | 9 / 38 | empty |
| Biology | `bio` | `bio-` | `docs/biology-card-plan.md` | 9 / 46 | live |
| Dinosaurs | `dino` | `dino-` | `docs/dinosaurs-card-plan.md` | 9 / 43 | empty |
| Astronomy | `astro` | `astro-` | `docs/astronomy-card-plan.md` | 9 / 45 | empty |
| Economics | `econ` | `ec-` | `docs/economics-card-plan.md` | 9 / 40 | empty |
| Korea | `korea` | `ko-` | `docs/korea-card-plan.md` | 9 / 43 | live |
| France | `france` | `fr-` | `docs/france-card-plan.md` | 9 / 43 | empty |
| Ancient Mesopotamia | `mesopotamia` | `me-` | `docs/mesopotamia-card-plan.md` | 9 / 40 | empty |
| Visual Art | `art` | `art-` | `docs/art-card-plan.md` | 9 / 39 | 30 cards, contiguous — next is `art-031`; not a history collection (artwork-card format) |
| Geography | `geo-us` | `geo-` | `docs/geography-card-plan.md` | 3 / 3 | complete (map cards) |
| World Geography | `geo-world` | `gw-` | `docs/world-geography-card-plan.md` | 2 / 2 | complete but 3 deferred |
| Flags | `flags` | `fl-` | `docs/flags-card-plan.md` | 2 / 2 | complete (4 deferred) |
| Draw the flags | `flags` | `fd-` | `docs/flags-draw-card-plan.md` | 2 / 2 | complete (4 deferred) |
| China (Geography) | `geo-china` | `gc-` | `docs/china-geography-card-plan.md` | 2 / 2 | complete |
| Russia (Geography) | `geo-russia` | `gru-` | `docs/russia-geography-card-plan.md` | 2 / 2 | complete (`gru-502` deferred) |
| Politics: East Asia | `pea` | `pea-` | `docs/politics-east-asia-card-plan.md` | 24 / 24 | live, planned a lecture at a time |
| Gateway to Global Affairs | `gga` | `gga-` | `docs/gateway-to-global-affairs-card-plan.md` | 21 / 21 | a COURSE (Leiden), 300 cards planned in full over 7 lectures and 14 readings; written deck by deck, Lecture 7 awaits slides |

The lowest unused id for a prefix (substitute it); `next-cards.js` does this and also prints the topic:

    node -e "global.window={};require('./data.js');const h=new Set(window.CARD_DATA.map(c=>c.id));for(let i=1;i<=1000;i++){const id='jp-'+String(i).padStart(3,'0');if(!h.has(id)){console.log(id);break}}"

`node .claude/test-card-plans.js` checks this table against the tree and the plans — re-run it after
editing a plan, the tree, or this table.

## Testing (mechanics)

- `node --check app.js` before anything else. Data files load under Node after `global.window = {}`.
- Browser suites are `.claude/test-*.js` (Playwright, headless Chromium). Find the one guarding a
  function by grepping `docs/reference.md` for the function name near "Re-run after touching".
- Install Playwright **outside the repo** (nothing but `vendor/` ships a library) and reach it through `NODE_PATH`:
  `mkdir -p "$SCRATCH/pw" && cd "$SCRATCH/pw" && npm init -y && npm i playwright`, then run a suite
  with `NODE_PATH="$SCRATCH/pw/node_modules" node .claude/test-<name>.js` — exactly as CI does.
- `page.goto()` to a URL differing only in `#fragment` does not reload; use `page.reload()`.
- Put Unicode test strings in a file, not inline `node -e`.

## Environment

- Cloud sessions clone from GitHub, push to a feature branch, and the user merges the PR from their
  phone (merge = deploy). This file is the only memory a cloud session has.
- Outbound HTTPS goes through a proxy; Node's `fetch` needs `NODE_USE_ENV_PROXY=1` (curl does not).
  `node .claude/check-reach.js` says which scholarly hosts answer — never assume a host is shut.
- Supabase: schema in `.claude/supabase-schema.sql`; the live project has every block. Every feature
  must degrade to a sentence on a database missing a later block.
- Never rewrite git history; the repo is ~0.5 GB and that is expected.
