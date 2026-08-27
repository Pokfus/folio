# The reader's own settings — appearance, language, units, spelling and sound

**Read this before touching `THEMES` / `THEME_OPTS` / `applyTheme` / `setTheme`, `FONT_SIZES` /
`setFontSize` / `var(--fs)`, `motionOff` / `prefersReducedMotion`, `body.hc`, `setNight` /
`setThemeAuto`, `unitizeText` / `unitizeTree` / `applyUnits`, `SPELL_PAIRS` / `spellText` / `spellTree`,
`MULTILANG` / `LANGS` / `setLang` / `loadLangData` / the i18n engine, `sfx()`, or the dormant TTS block.**

`CLAUDE.md`'s "How the app is wired" carries the operational summary of each — what the setting is,
where it is stored, the one predicate or choke point it goes through, and the rules that must not be
broken. This file carries the rest: the measured contrast figures behind the high-contrast mode, the
spelling table's 144 rows and the traps that made a rule impossible, the units patterns and the shapes
it took to cover them, the whole i18n engine, and the shipped-but-dormant text-to-speech system.

Ten bullets, in the order they appeared in CLAUDE.md:

1. **Themes** — the eight, the removed seven, and the sync on `profiles`.
2. **Text size** — the five stops, why the steps are uneven, the 519 rewritten px values, the one
   declared exception, and the slider.
3. **Animations off** — one switch driving both the CSS killswitch and `prefersReducedMotion`.
4. **High contrast** — every measured ratio, the solved values, and the ghost-button regression that
   `test-a11y.js` could not see.
5. **Light / dark follows the device** — the three deliberate decisions and the migration not to remove.
6. **Measurements** — the two patterns, `isImperialParen`, and the shapes the sweep needed.
7. **British or American spelling** — the declared table, the eight decisions, the excluded families, and
   the URL mask.
8. **English only** — the one switch, what it shuts, and the migration back.
9. **Language picker + i18n** — the ten languages, the three tables, the engine, and adding a language.
10. **UI sound effects** and **Read-aloud TTS (set aside)** — the tap's two corrections, and the whole
    dormant narration system including the baked Piper voices.

- **Themes (8):** folio, clay, garden, synth + four full-overhaul themes: arcade (16-bit), academy (formal faculty),
  marble (antiquity inscriptions), gazette (1940s newsprint, two-column About prose) — each light + dark, tokens
  hex-only. The overhaul themes change layout/chrome/ornament per theme (scoped `body[data-theme="…"]` blocks in
  styles.css; fonts in the single @import). **Seven themes — atlas, press, bloom, tide, scroll, grove, dynasty — were
  REMOVED on request** (a saved selection of one falls back to folio via the `THEMES` whitelist); don't reintroduce
  them. **Collection banners and all theme decorations are STATIC — no animated/moving patterns (removed on request).**
  Themes register in `THEMES` (app.js) + the `THEME_OPTS` settings-picker table (mini-mockup previews, hover try-on),
  **both at module scope beside each other since Aug 2026** — `THEME_OPTS` lived inside `PAGES.settings` until the
  chest overlay, the friends list and the admin tab all needed to draw a theme too. **Five of the six are COLLECTIBLE**
  (everything but `folio`): see the theme bullet under THE RELIQUARY (and `docs/reliquary.md`) for the drop, the grandfathering and why a locked
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
