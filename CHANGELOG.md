# Folio — Changelog

A study companion for Chinese history, built in vanilla JavaScript with zero dependencies.
Construction spanned two days, **24–25 June 2026**, starting from an uploaded Anki deck and
growing into a multi-page app: an SRS study system, daily games, an 8-theme design system, a
full admin editor, and an interactive globe. The deck now holds ~600 cards across nested
collections; the glossary holds thousands of terms.

> Dates below are grouped by the day the work was done. Within each day, entries are sorted
> into *Added / Changed / Fixed / Removed*.

---

## 2026-06-24 — From-scratch build

The whole foundation was laid in one day: the app itself, the data model, the study engine,
games, the whiteboard, and several rounds of content cleanup.

### Added
- **Folio (initial build).** A zero-dependency, vanilla-JS, multi-page flashcard study site
  modelled on Anki, generated from an uploaded *China Modern History* Anki deck. Established the
  four-file architecture (`index.html`, `styles.css`, `app.js`, `data.js`), an editorial design
  system with tokens extracted from the source deck, hash-based page routing, and an Anki-style
  spaced-repetition (SRS) scheduler.
- **Study & review flow.** Front → reveal → grade, with SRS intervals driving each card's next
  appearance.
- **Daily games.** A quiz game and a chronological-ordering ("timeline") game.
- **Whiteboard.** Freehand drawing / annotation, later expanded into a whole-page overlay with a
  highlighter.
- **Glossary bubbles.** Hover-tooltip definitions embedded inline in card backgrounds.
- **Home progress bars** and a soft blurred-gradient page background.
- **Date info-boxes.** An `answerDate` box added to cards that lacked a date.
- **"?" help icon** with a hover tooltip, beside the grade buttons.

### Changed
- **Nested deck model.** Restructured the China deck into arbitrary-depth nesting
  (deck → subdeck → sub-subdeck), refactored `app.js` for recursive rendering, and outlined a
  Rome deck.
- **Full Anki import.** Grew the collection from the initial 102 cards to the full source deck
  (several hundred cards), and classified/redistributed every card into period decks. Added a
  glossary-window system.
- **Terminology refactor.** Renamed the hierarchy throughout — deck → collection,
  subdeck → deck, sub-subdeck → subdeck — across code and CSS, verified pixel-identical.
- **Questions → cloze.** Rephrased the interrogative card questions into declarative
  fill-in-the-blank statements, and normalised every blank to exactly five underscores.
- **Translations section** made collapsible and collapsed by default.
- **Home header** renamed *"Spaced Repetition"* → *"Daily review."*
- **Light-mode background** gradient blur made more pronounced.
- **TTS button** repositioned; **whiteboard strokes** made to stay anchored on scroll/resize.

### Removed
- Wikipedia links from card answers, map emojis, the Sources/Citations fields, and deck
  subtitles.

---

## 2026-06-25 — Depth, theming, admin tooling, and the Atlas

The second day went broad and deep: richer glossary content, a full theme system, the admin
back-end, a multi-deck data model, and the interactive Atlas globe.

### Added
- **Admin editor (v1).** A back-end editing interface with a three-pane layout — a
  collection/deck tree, a searchable card list, and a field editor.
- **8 visual themes** (light/dark variants) with a theme picker, plus an account
  **"suspended cards"** window.
- **Etymology / coinage info-boxes** on 273 date-less cards.
- **Atlas page.** An orthographic Canvas-2D globe — drag to rotate, wheel/pinch zoom with min/max
  caps, country borders and a graticule built from Natural Earth 110m data (new `world.js`) —
  with a bottom **timeline** (a draggable year pin with a hover-year tooltip) and a large year
  display flanked by accelerating ‹ › chevrons.
- **Wikipedia-fetch helper** (`fetch-glossary.js`). A standalone, rate-limited Node script that
  backfills glossary terms with Wikipedia summaries, taking the glossary from a few hundred
  curated entries to thousands.
- **Deep-link edit button** from a study card straight to its entry in the admin editor.

### Changed
- **Glossary upgrade.** Authored 483 three-sentence definitions; repositioned the popup; gave it
  a flat header with a red title; made terms inside entries nested and clickable; auto-linked
  terms while removing their bold styling; added title wrapping and date labels.
- **Multi-deck membership.** Cards can now live in multiple decks with shared progress;
  redistributed cards into every relevant deck by era-span / date overlap; ordered all cards
  chronologically.
- **Admin editor expansion.** Added a `localStorage` override layer for persistence (edits stored
  as deltas, applied at startup), exposed all card fields, per-item revert from pristine
  snapshots, JSON export, drag-to-reparent within the tree, and card preview from the editor.
- **Library page.** Empty collections/decks now auto-route to a *"Coming soon"* section, and
  admins can drag-to-reorder or move items via a left-edge grip handle.
- **Highlighter colours** refreshed and stray bold styling in card backgrounds cleaned up.
- **Suspend-card button** moved into the grade row, beside the grade buttons.
- **Atlas refinements.** Moved the timeline into a fixed bottom bar; made the globe full-bleed,
  filling everything between the top nav and the bottom bar; removed the page headers; flattened
  the ocean; and moved the timeline's start from 6000 BCE to **4000 BCE**.

### Fixed
- **Atlas edge glitch.** Rebuilt the globe's projection on a 3D basis so landmasses and borders
  clip exactly at the horizon — eliminating the flickering/smearing at the globe's edge while
  rotating.
- A **collection card-count** miscount.

### Removed
- The dark radial-gradient shading (the "blurred spot") on the globe, and the Atlas page's
  "Geography / Atlas" headers.

---

*This changelog was reconstructed from the session journal; a few early card/term counts are
approximate where the source notes varied.*
