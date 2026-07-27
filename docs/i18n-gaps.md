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

My recommendation is **option 2**, and to treat it as a separate programme after batches 0–8 ship.

---

## Batch plan

Batches are ordered so each one ships something visible. Every batch goes through
`node .claude/add-lang.js <batch.json>` unless it needs new machinery, which is called out.

### Batch 0 — engine fix (no translation work)
Widen the `I18N_HTML` element gate in `localizeTree()`; add a containment guard. Unlocks 8 already
translated About-page blocks in all 9 languages. **~1 hour.**

### Batch 1 — chrome strings (95 strings × 9)
One `add-lang.js` batch per language, `chrome.exact` plus `chrome.rules` for the generated labels in B.
Split into 1a Atlas (37), 1b Community/Studio/Library (18), 1c Home/Settings/games (11), skipping the
proper-noun credits. **No code change.**

### Batch 2 — PAGE_META (32 strings × 9)
Straight `chrome.exact` additions; `setPageMeta` already runs them through `t()`. **No code change.**

### Batch 3 — deck & collection names (68 strings × 9)
Needs a decision on mechanism. Cheapest is `chrome.exact` — the walker already sees these text nodes and
no code changes. Risk: short titles (`Han`, `Ancient`, `Modern`, `Early`) are collision-prone as global
exact keys. Cleaner is an `i18n` map on the tree node read by a `nodeTitle()` helper, mirroring
`cardLocalized()`. **Recommend the helper**; it is ~20 lines and cannot mistranslate prose elsewhere.

### Batch 4 — daily games (143 items, 9,158 words × 9)
Add `i18n` blocks to `truefalse.js` and `quotes.js` plus `tfLocalized()` / `quoteLocalized()` readers,
extend `add-lang.js` with a `games` section, then translate in sub-batches of ~20 items per language.
Also the two verdict strings and 5 category labels (chrome). **Largest genuinely-worth-it batch.**

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

### Batch 7 — date and era formatting
`I18N_RULES` for BCE/CE/Mya/kya/`Present`, covering `yearLabel()`, `GLOSSARY_DATES`, `COUNTRY_SPANS` and
the deep-time labels. Small, but touches every historical surface. **~30 rules per language.**

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
