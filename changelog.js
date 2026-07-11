/* Folio changelog — shown on the Mission page, grouped by day (newest first).
   Each entry: { d: "YYYY-MM-DD" (sort key), label: optional display override, t: day title, items: ["…"] }.
   POLICY: whenever a user-requested change ships to the live site, append a one-line summary to TODAY's
   entry (create it if missing). Keep items short, plain-English, and reader-facing (what changed for the
   user, not how). Loaded before app.js. */
window.CHANGELOG = [
  {
    d: "2026-07-11",
    t: "Folio goes online",
    items: [
      "The site is now live on the web, updated directly from the development machine.",
      "Online accounts: sign up with email, and your study progress syncs to the cloud and follows you across devices.",
      "Friends are server-backed — send requests, accept, and browse a friend's badges and deck progress from any device.",
      "Every card's question, answer and background now has pre-recorded narration by a single warm male voice on all devices, with the device's own speech as fallback.",
      "New Mission page: why spaced repetition, source credits, and this changelog.",
      "Mission page refined: its tab moved next to Atlas, the changelog now sits above the credits, glossary popups work inside the intro, and admins can click the intro title or paragraphs to edit them in place.",
    ],
  },
  {
    d: "2026-07-05",
    t: "Study, games and read-aloud sprint",
    items: [
      "Read-aloud added to studying: a slow male voice reads the question, answer and background; a female Chinese voice reads the hanzi. Mute button on every card, play buttons behind section titles, and a right-click “Read aloud” for selected text.",
      "New cards graded “Good” now return later the same session (Anki-style learning step) instead of jumping to tomorrow.",
      "True or False grew to 79 statements and Who said it? to 64 quotations, all fact-checked; the home tiles got icon artwork and three daily states — filled colour when unplayed, a checkmark when played, shining gold for a perfect score.",
      "Levelling up now shows a congratulations popup; level numerals turned gold; collections on the Library page can be studied with one click.",
      "The Atlas country info-box is capped on every screen size so the globe and close button always stay visible.",
      "Editor quality-of-life: automatic save-to-files while editing, the page remembers your place through reloads, and Ctrl+Z undoes the last edit.",
    ],
  },
  {
    d: "2026-07-01",
    label: "Late June – early July 2026",
    t: "The Atlas deepens",
    items: [
      "Historical border eras added to the globe's timeline (1600 through 2020), built from curated historical map data with period-accurate capitals for every era.",
      "Click a territory for its story: full official name, the years that state existed, a general description, what was happening in the selected year, and population / area / GDP figures.",
      "Empires drill down — one click selects a whole colonial empire, another the single territory, and the United Kingdom opens into its constituent countries in every era.",
      "Global terrain relief (mountains and ocean floor) blended into the map, plus lakes and rivers drawn as water in every era.",
      "The deck was regrown card by card into per-dynasty history decks with uniform, information-dense backgrounds, alongside a glossary of 2,100+ terms.",
    ],
  },
  {
    d: "2026-06-25",
    t: "Depth, theming, admin tooling and the Atlas",
    items: [
      "The Atlas was born: an orthographic globe with drag, zoom and a bottom timeline.",
      "Eight visual themes, each with light and dark variants.",
      "The admin editor arrived — a three-pane back-end for cards, decks and the glossary, with local-overlay persistence and JSON export.",
      "The glossary grew from hundreds to thousands of terms with clickable, nested definitions.",
      "Cards gained multi-deck membership with shared progress, ordered chronologically.",
    ],
  },
  {
    d: "2026-06-24",
    t: "Folio is built in a day",
    items: [
      "The whole foundation in one day: an Anki-style spaced-repetition study site built from scratch in plain JavaScript — no frameworks, no build step.",
      "Study flow (question → reveal → grade), daily review scheduling, nested decks, daily games, a whiteboard, glossary tooltips, and an editorial design system.",
      "The China deck imported and reorganised into period decks; questions rewritten as fill-in-the-blank statements.",
    ],
  },
];
