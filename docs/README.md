# `docs/` — the index

**Every file here, what it holds, and whether it is finished.**

## The rule this directory exists for

**Rules live in `CLAUDE.md`; reasoning lives here.** `CLAUDE.md` is prepended to every session and is
the only operational memory a cloud session gets, so it carries what a change must not break — the
rules, the choke points, the invariants, and each suite's "re-run after touching X" list. What it
cannot afford to carry is the *argument*: why a rule is shaped that way, the fault that produced it,
the three approaches tried first, the measured figures. That is what these files are for, and each is
reached from `CLAUDE.md` by an imperative pointer:

> **📖 `docs/atlas.md` — READ BEFORE TOUCHING THE RENDER PATH, AN ERA OR THE TIMELINE.**

When you split something out, the pointer is not optional and neither is its imperative: a file nobody
is told to read is a file nobody reads. `node .claude/check-docs.js` checks both directions — every
pointer resolves to a real file, and every file here is either pointed at or listed below as
deliberately unreferenced.

**Nothing in this directory is part of the site.** None of it is fetched, linked or served.

---

## How the app is wired — the reference files

Reached from the matching bullet in `CLAUDE.md`'s "How the app is wired". Read the pointer's file
before changing the thing it names.

| file | what it holds |
|---|---|
| `atlas.md` | The globe's render path, the timeline, the eras, the place popup and the Find-it game. |
| `library-feature.md` | The reading room — the shelf, the bilingual columns, the ink, the highlights, the per-book licence reasoning. |
| `community-decks.md` | The nine phases of community decks, every guard, and the faults that shipped silently. |
| `daily-study.md` | The pooled review, per-deck limits, the three orders, the reader's own groups and the deck rows. |
| `scheduler.md` | The day boundary, the SM-2 port, FSRS and its optimiser, load balancing, burying. |
| `minigames.md` | The nine daily games, their pools, and the faults a one-day test cannot see. |
| `source-footnotes.md` | The citation apparatus on all four surfaces — markers, numbering, the fold. |
| `study-records.md` | Flags, Set due date, Forget, the card browser, the per-review log and the statistics. |
| `media.md` | Pictures and clips on cards and terms — the frame, the viewer, the source gate. |
| `reader-settings.md` | Themes, text size, motion, contrast, units, spelling, i18n, sound, the dormant TTS. |
| `chrome-navigation.md` | Repaints, page transitions, the phone swipe, the walkthrough and coach marks. |
| `home-page.md` | The home page's running order, the daily quote, the review banner. |
| `whiteboard.md` | The floating marker — the fling, the snap home, the pass-through, the stylus split. |
| `reliquary.md` | Artefact chests, collectible themes, the showcase, the collector's badges. |
| `card-difficulty.md` | The 1–5 rating, the community rating, and `undatable`. |
| `map-cards.md` | The geography format — a shape on a globe as the question. |
| `library-books.md` | Per-book findings for all 48 — how each edition is set, what pairs, the licence ground. |
| `library-importer.md` | `.claude/fetch-book.js` — the 22 layouts, the extraction faults, the per-book options. |
| `lang-decks.md` | The community and language decks' generators, and every pipeline's findings. |
| `tests.md` | What each of the regression suites guards, and the silence it was written for. |

## The card plans — one per collection

Each is a fixed 1000-card running order, so a collection can be grown one card at a time over many
sessions. **The next card to write is the lowest id not yet in `data.js`.** Read the plan's own scope
argument before writing for that collection — getting it wrong makes a claim without noticing.

| file | collection | prefix |
|---|---|---|
| `world-history-card-plan.md` | World History (`col-8`) | `wh-` |
| `greece-card-plan.md` | Ancient Greece (`col-13`) | `gr-` |
| `rome-card-plan.md` | Ancient Rome (`col-40`) | `rm-` |
| `us-card-plan.md` | United States (`col-41`) | `us-` |
| `russia-card-plan.md` | Russia (`col-42`) | `ru-` |
| `india-card-plan.md` | India (`col-43`) | `in-` |
| `china-card-plan.md` | China (`china`) | `cnh-` |
| `egypt-card-plan.md` | Ancient Egypt (`egypt`) | `eg-` |
| `ww2-card-plan.md` | The Second World War (`ww2`) | `ww2-` |
| `japan-card-plan.md` | Japan (`japan`) | `jp-` |
| `psychology-card-plan.md` | Psychology (`psych`) — the first that is not history | `ps-` |
| `philosophy-card-plan.md` | Philosophy (`phil`) | `ph-` |
| `biology-card-plan.md` | Biology (`bio`) | `bio-` |
| `dinosaurs-card-plan.md` | Dinosaurs (`dino`) | `dino-` |
| `korea-card-plan.md` | Korea (`korea`) | `ko-` |
| `geography-card-plan.md` | Geography (`geo-us`) — **not** a 1000-card plan | `geo-` |
| `world-geography-card-plan.md` | World (`geo-world`) — 459 cards, sorted by population | `gw-` |
| `china-geography-card-plan.md` | China (`geo-china`) — 58 cards, sorted by population | `gc-` |

`china-card-findings.md` is China's per-card research log; the other seventeen keep theirs in their own plan
or in the citation plans. `node .claude/test-card-plans.js` checks every plan against `data.js`.

## Content passes — the finished ones

Kept because the *findings* are reusable, not because there is work left. Read one before starting a
pass of the same shape: what a source will bear, which hosts answer, which routes keep paying.

| file | state |
|---|---|
| `citation-plan.md` | **Complete** — the cards, at 5 citations each. |
| `glossary-citation-plan.md` | **Complete** — all glossary terms, batches G1–G11, P1–P7, C0–C12, D1–D3, N1–N10. |
| `artefact-citation-plan.md` | **Complete** — all 100 artefacts at 3 works each. Its reachable-host survey is the reusable half. |
| `glossary-length-plan.md` | **Complete** — every description at 100 words ±10%. |
| `units-plan.md` | **Complete** — metric first with the imperial in brackets, across cards and glossary. |
| `card-glossary-pairing.md` | **Complete** — every shipped card's answer term has a glossary entry. The rule stays in force. |
| `audit-2026-08-08.md` | **Closed** — a whole-project sweep; all four batches shipped. |
| `user-decks-plan.md` | **Phases 0–4 shipped.** Only Phase 5 (the paid tier) is still a proposal. Superseded as a reference by `community-decks.md`. |

## Content passes — with work still open

| file | what is left |
|---|---|
| `history-focus-plan.md` | 45 cards flagged on the question and historiography rules; batches F1–F5. |
| `book-text-plan.md` | Correcting errors baked into the Library's source texts. |
| `atlas-rewrite-plan.md` | Rewriting every place popup to a card's standard, with citations. |
| `glossary-expansion-plan.md` | Three jobs asked for together — audit, expansion, and the terms still to write. |
| `library-gaps.md` | What the 29 shelved books are missing and what can still be added. |
| `refinements-plan.md` | ~60 items from one request, batched. |
| `refinements-2026-08-27.md` | Thirty-five items from one request: what shipped, the four faults the fixes uncovered at scale, the four answers to "suggest a way", and a plan for the nine not built. |
| `artefact-expansion-plan.md` | A second hundred artefacts, planned but not yet written: the rarity budget, the eager-path split to do first, and the fifteen batches. |
| `mandarin-review.md` | The Mandarin collection measured end to end and then repaired: why a downloaded deck never saw a fix, the cards a speech engine misreads, the polyphones teaching one of two readings, the unanswerable reverse cards, the Idioms deck — and, for the three of twelve items that could not be finished, exactly where they stop and why. |
| `greece-audit-2026-09.md` | The 500-card Ancient Greece audit: what passed, what was fixed, and the seven things still open — the Rutter concentration, the Athens deck's register, and the coverage gaps. |
| `learning-science.md` | What the learning-science literature says works and does not, and twenty proposals for Folio. **Thirteen shipped Sep 2026; seven still proposals.** |
| `i18n-gaps.md` | The translation audit. **Largely moot while `MULTILANG = false`** — read it as the plan to resume, not work in hand. |

---

**Adding a file here?** Give it an H1 that says what it is, a "read this before …" line under it, add
a row above, and put an imperative `📖` pointer in `CLAUDE.md` at the bullet it belongs to. Then run
`node .claude/check-docs.js`.
