# Untranslated content audit + translation plan

Audited 2026-07-27 against the 9 non-English site languages (es, fr, de, it, nl, ru, ar, zh, ja).

## How this was measured

Two passes, both against the real site served over HTTP:

1. **Static coverage** — every card's `i18n` block, every glossary slug in `i18n/gloss-<lang>.js`, and
   every key in `i18n/ui-<lang>.js` compared across all nine languages.
2. **Runtime probe** — the site rendered in `zh`, `ja`, `ru` and `ar` (non-Latin scripts, so surviving
   Latin prose is unambiguous evidence of untranslated text), walking every route plus the interactive
   surfaces: a study session front/back, a glossary popup, the Atlas country panel on the present-day
   and a historical map, all five games, and the account page. A string is only reported when it stays
   Latin in **every** probe language, which filters out proper nouns a given language keeps in Latin.

Scripts are not committed (they are one-off dev tooling); the method above reproduces them.

## What is already complete

| Surface | Status |
|---|---|
| Cards (50) — question, answer, answerDate, abstract, answerText | **9/9 languages, no holes** |
| Glossary descriptions (333 terms) | **9/9 languages, no holes** |
| Site chrome (`ui-<lang>.js`) — 531 exact / 72 rules / 12 prose blocks | **complete**; the handful of per-language "gaps" are person names a language keeps in Latin |
| Timeline game, account page, badges, settings rows, study chrome | clean under probe |

The content pipeline is in good shape. Everything below is either a surface the pipeline was never
pointed at, or a mechanism that does not exist yet.

---

## Gaps found

### A. A bug, not missing content — `I18N_HTML` never fires on the About walkthrough

`localizeTree()` (app.js ~line 12006) gates the whole-block prose pass to
`P|LI|H1|H2|H3|H4|BLOCKQUOTE|SUMMARY|FIGCAPTION` or a `faq-*` class. The About page's walkthrough steps
are `<span>` inside `.ms-body` and the feature blurbs are `div.mf-row`, so **neither is ever
block-translated**. The exact-string pass then swaps only the inline `<b>` fragments, producing visibly
mixed text — live in Spanish today:

> `Open the <b>Biblioteca</b> and choose a collection. Its cards join your daily review.`
> `Press <b>Otra vez</b> if you missed it, <b>Difícil</b> if it was a struggle, …`

The translations **already exist** in all nine `ui-<lang>.js` files. Widening the gate fixes 8 blocks ×
9 languages with no new content. Guard against double-application: skip an element that contains a
descendant which is itself a key.

### B. Chrome strings with no translation in any language — 95 strings, ~700 words

| Area | Count | Examples |
|---|---|---|
| Atlas | 37 | the whole "Reading the Atlas" coach-mark card; `Zoom in` / `Zoom out` / `How to use the Atlas` aria-labels; `Search the atlas…`; `Through the ages`; `Copy link`; the globe's canvas aria-label |
| Community / Studio / Library | 18 | `Your decks`, `New deck`, `Import a deck…`, `Browse shared decks`, `not fact-checked by Folio`, `Top rated` / `Newest` / `Most installed`, `✦ Staff picks`, `Search decks…` |
| About page | ~14 | credits-list link labels and licence names — mostly proper nouns, safe to leave |
| Home / Settings / games | 11 | `Gloss of the day`, `Find it on the map`, `Click the globe · 5 rounds`, Settings → `Audio`, `Sound effects` + its description |

Some of these need **`I18N_RULES` patterns rather than exact strings** because they are generated:
`Round 1 / 5`, `0 points`, `1500 CE — The world in 1500` (×14 timeline tick titles), `THE WORLD · 1938` /
`THE WORLD TODAY` (cartouche), `1815 – Present` (country span), `c. 1.85 – 1.77 Mya` (deep-time label),
`World · History` (deck breadcrumb).

### C. PAGE_META — 16 titles + 16 descriptions, never translated

Already documented in CLAUDE.md as a known gap. Only `Folio — a study companion` is translated; every
other route's `<title>` and meta description stays English in all nine languages.

### D. Deck and collection names — 68 strings, 121 words

`COLLECTION_TREE` titles and blurbs (`China`, `Ancient`, `Xia`, `Shang`, `Iron Age`, `Cold War`,
`World History`, …) render English everywhere: the Library, the study bar, the challenge breadcrumb, the
Settings picker. There is no mechanism for translating tree nodes at all.

### E. Daily-game content — 143 items, 9,158 words

- `truefalse.js` — 79 × `{q, why, cat}`, 5,047 words. Confirmed English in `zh`.
- `quotes.js` (`QUOTEGAME`) — 64 × `{q, who, context}`, 4,111 words. Confirmed English in `zh`.
- Plus the verdict strings `Correct — it's` / `Not quite — it's` and the 5 category labels.

Neither file has an `i18n` field and neither has a localised reader; they need the `cardLocalized()`
treatment. Note the daily QUOTES on the home page (app.js, 20 items) **are** translated — only their
source citations (`Analects II.11`, `Tao Te Ching, ch. 33`) are not.

### F. Changelog — 22 day titles + 163 items, 4,757 words

`changelog.js` renders on the About page entirely in English. No `i18n` field.

### G. Place names — 1,744 distinct strings

258 country names (`world.js`), 1,194 era territory names and 556 era city names (`timeline.js`);
after overlap, 1,744 distinct. 182 of them already exist as glossary terms with translated
*descriptions* but untranslated *titles*.

These surface in the Settings home picker, the Atlas hover chip, the atlas search box, the country panel
title and breadcrumb, and the "Through the ages" rows. **Critically, the country-name, capital and
era-name map layers are drawn with `ctx.fillText` on the canvas**, which the DOM walker can never reach —
those need a draw-time lookup, i.e. a code change, not just a table.

### H. Atlas prose — 225,000 words (the dominant item)

- `countries.js` `COUNTRY_INFO` — 672 descriptions, **86,118 words**
- `country-years.js` — 682 states / 2,086 year-paragraphs, **138,863 words**
- `country-spans.js` — 364 spans (trivial; only the word `Present` and the dash format)

Every country panel on the Atlas is English in every language. At 9 languages this is **~2.0 million
words** and roughly **13.5 MB** of additional lazy payload — an order of magnitude more than everything
else on this page combined. See the scope decision below.

### I. Lower priority

- `GLOSSARY_DATES` (93) — `c. 145–86 BCE`; the BCE/CE/Mya/kya era markers are not localised. Rules, not entries.
- `GLOSSARY_TAGS` (230 distinct) — admin glossary filter only, not visitor-facing.
- Admin editor and Studio editor chrome — admin/author surfaces, English-only today.

---

## Scope decision needed

Everything except **H (Atlas prose)** totals roughly **15,000 words + 1,744 names per language** —
about **135,000 words and 15,700 names** across nine languages. That is a large but ordinary content
job on the existing pipeline.

**H alone is 2.0 million words.** Three honest options:

1. **Skip it.** Label the country panel "description in English" in non-English languages. Cheapest,
   and the panel is a reference surface, not study content.
2. **Tier it.** Translate `COUNTRY_INFO` for the 258 present-day countries only (~33,000 words ×9 =
   300k) and leave the 2,086 per-year paragraphs English. Covers the common case — the present-day map
   is the default view.
3. **All of it.** ~2.0M words, 13.5 MB of new lazy bundles that must be split per language *and*
   probably per region to stay loadable.

My recommendation was **option 2**. **Decision (2026-07-28): deferred** — the Atlas prose is out of
scope for this programme. Batches 0–7 proceed without it; the country panel stays English in every
language until it is picked up separately.

---

## Batch plan

Batches are ordered so each one ships something visible. Every batch goes through
`node .claude/add-lang.js <batch.json>` unless it needs new machinery, which is called out.

### Batch 0 — engine fix ✅ SHIPPED
`localizeTree()`'s `I18N_HTML` pass is now gated on **key membership rather than tag name**, with an
`isConnected` guard and cheap `children.length` / `textContent.length` bounds (memoized via
`_i18nHtmlCap`) so it does not serialize `innerHTML` for every element on the page. Unlocked 8
already-translated About-page blocks in all 9 languages.

### Batch 1 — chrome strings ✅ SHIPPED
72 exact strings, 3 rules and 7 HTML blocks per language (× 9 = 738 translations), applied through
`add-lang.js`: the Atlas coach-mark card, search, zoom and timeline chrome; the 14 timeline tick titles;
Community / Studio / Library; Settings → Audio; the Home game tile and term-of-the-day; the Find-it
scoreboard; and the 20 daily-quote source citations (work titles translated, reference numbers kept
verbatim). Generated labels went in as rules — `THE WORLD · <year>`, `Round n / m`, `n points`, the last
two recast as "label: number" in ru/ar where one pattern cannot carry plural agreement.

Verified by re-running the runtime probe: the untranslated-chrome count fell from 279 to 198, and every
one of the 198 survivors is deliberate or belongs to a later batch — 195 changelog lines (Batch 5),
`World · History` (Batch 3), `c. 1.85 – 1.77 Mya` (Batch 7), and proper nouns (`Folio`,
`.folio-deck.json`, the credits links and licence identifiers).

### Batch 2 — PAGE_META ✅ SHIPPED
31 strings per language (15 route names carrying the `— Folio` brand suffix, 16 descriptions) as plain
`chrome.exact` additions; `setPageMeta` already ran them through `t()`. No code change.

### Batch 3 — deck & collection names ✅ SHIPPED
The mechanism question was settled empirically rather than by judgement: a probe scanning every route
and interaction for tree titles appearing as standalone text nodes elsewhere found that `Prehistory`,
`Paleolithic`, `Neolithic` and `Bronze Age` **also occur as card answer terms and glossary links inside
card prose**. A global `chrome.exact` key would therefore have overridden wording the card and glossary
pipelines already translate — so the `nodeTitle()` helper was the right call, not merely the tidier one.

Shipped as `node.i18n` lang-maps on all 67 tree nodes in `data.js`, read by `nodeTitle(n)`, which feeds
`nodePath`/`nodeWhere`/`nodeParentPath` — so the Library, study bar, home review list, account progress
lists, deck picker and level-up popup all follow from one helper. `add-lang.js` gained a `tree` section
keyed by **node id** (titles repeat: two `Jin`s, two `Prehistory`s). The admin tree deliberately still
reads `node.title` so the editor edits the English base, and an admin rename retires that node's
translations rather than leaving a stale one beside a new English title.

**Gotcha worth keeping:** `i18n` had to be threaded through `SHIPPED_NODES`, the `applyAdminEdits`
rebuild *and* `serializeCardData`. The rebuild's `nodeById` object literal omitted it at first and every
title silently stayed English — any new tree-node field needs all three.

Verified: the tree bucket fell from 62 survivors to 4, and all four belong elsewhere (a `4.2 Mya – 2022
CE` deck span → Batch 7; `China`/`India`/`Russia` in the Settings country picker → Batch 6).

### Batch 4 — daily games — ⏳ HALF SHIPPED (Who said it? done, True or False pending)
Mechanism complete, and **all 64 quotations are live in all 9 languages** — the quotation, the speaker's
name and the explanation, so the four answer options are localised too and the quiz stays
self-consistent. Famous lines use the established target-language wording where one exists (Rousseau's
*L'homme est né libre*, Dante's *Lasciate ogne speranza*, Marx's *Die Philosophen haben die Welt nur
verschieden interpretiert*), and German/Italian/Chinese-origin lines are given in their original.
The three verdict lines (`Correct — <speaker>`, `… — it's <True/False>`) shipped as chrome; both the
curly and straight apostrophe variants are registered, because app.js uses a different one per page.

**A design correction worth recording.** The obvious implementation — an `i18n` block on each pool item,
mirroring cards — is wrong here: `truefalse.js` and `quotes.js` are in the **eager** load path, and nine
languages inline took `quotes.js` from 27 KB to **312 KB downloaded by every visitor to flip a card**,
which is precisely what the lazy-bundle split exists to prevent. Translations therefore live in
`i18n/games-<lang>.js` (bundle `gamesI18n:<lang>`, `after` hook `gamesI18nIngest` draining a queue into
`GAMES_I18N[pool][englishQ][lang]`), keyed by the item's **English `q`** — unique in both pools, and
stable against reordering in a way an array index is not. The two game pages hold on a loading line
until the bundle lands so they never paint English and flip. Eager payload is unchanged; an English
reader still fetches nothing. Guarded by three new assertions in `.claude/test-i18n-lang.js`, including
one that fails if translations ever get put back inline.

**True or False is rolling out one language at a time** — the same pattern the Japanese rollout used, and
what `add-lang.js`'s per-language coverage report ("es now 79/79") exists for. Each language is complete
or absent, never half-done, and an untranslated language falls back to English exactly as designed.

| | es | fr | de | it | nl | ru | ar | zh | ja |
|---|---|---|---|---|---|---|---|---|---|
| quotes (64) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| truefalse (79) | ✅ | ✅ | ✅ | — | — | — | — | — | — |

Remaining: 6 languages × 79 statements (`q`, `why`, `cat`), ~5,000 words each. Pure content — the
mechanism, tooling and category labels are done, and the pipeline is verified end to end on Spanish
(statement, category, verdict line and explanation all render translated).

### Batch 5 — changelog (185 strings, 4,757 words × 9)
Add per-day `i18n` to `changelog.js` and an `add-lang.js` `changelog` section. Worth pairing with a
golden-rule update so **new** changelog lines ship translated; whether to backfill all 163 historical
items or only the 22 day titles plus the last few months is a judgement call — I would backfill the day
titles and the most recent 3 months, and leave older items English.

### Batch 6 — place-name gazetteer (1,744 names × 9)
New lazy bundle `i18n/places-<lang>.js` (name → translated name) with a `placeName(n)` helper, called
from both the DOM sites **and** the canvas `fillText` label draws (`drawEraNames`, `drawPin`, the
country-names layer). Seed 182 of them from existing glossary titles. This is the one batch with real
render-path code in it. **Do batch 1a first** so the Atlas chrome is already translated.

### Batch 7 — date and era formatting ✅ SHIPPED
26 rules + 1 exact string per language, covering `yearLabel()`'s five forms (CE / BCE / kya / Mya / Gya),
the `– Present` country spans, the `N–N; president N–N` glossary dates and the circa / born / BP prefixes
those use. Ordered most-specific-first, since only the first matching rule fires per text node.

**One code change was required.** `fmtYearSpan` joined two labels into one text node
(`4.2 Mya – 2022 CE`), which no single rule could ever fully translate. It now localises **each side**
before joining. `yearLabel` itself stays English on purpose — `parseChronoYear` round-trips against it in
the editor's chronology field, which CLAUDE.md calls out as an invariant to preserve.

Two things the sanity-check caught before they shipped: the numeric sub-pattern was over-escaped, so every
deep-time rule silently matched nothing; and CJK places the era marker **before** a range
(`约公元前145–86年`), not after the second number, so zh/ja need their own range template rather than
reusing the single-year one. Pure-digit ranges like `1644–1912` correctly match no rule — there is nothing
in them to translate.

### Batch 8 — Atlas prose
Per the scope decision above. If option 2: a new lazy per-language bundle for `COUNTRY_INFO`, 258
present-day countries, batched ~30 countries at a time.

### Batch 9 — admin surfaces (optional)
Glossary tags (230) and the editor/Studio chrome. Only worth doing if non-English-speaking admins or
deck authors are expected.

---

## Cross-cutting work implied

- `add-lang.js` needs new sections: `games`, `changelog`, `tree`, `places`, `countries`. It currently
  handles `chrome` / `cards` / `glossary` only.
- Three new lazy bundle families (`places`, later `countries`) in `DATA_BUNDLES`, each per-language, each
  needing the `after`-hook treatment described in CLAUDE.md so a late-arriving file re-seeds its baseline.
- One render-path change: canvas map labels must resolve through `placeName()` at draw time.
- CLAUDE.md's "every NEW card and glossary entry ships in 9 languages" rule should be extended to cover
  changelog lines, true/false statements, quotes and deck names, or these gaps reopen as content grows.
