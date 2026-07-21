/* Folio changelog — shown on the Mission page, grouped by day (newest first).
   Each entry: { d: "YYYY-MM-DD" (sort key), label: optional display override, t: day title, items: ["…"] }.
   POLICY: whenever a user-requested change ships to the live site, append a one-line summary to TODAY's
   entry (create it if missing). Keep items short, plain-English, and reader-facing (what changed for the
   user, not how). Loaded before app.js. */
window.CHANGELOG = [
  {
    d: "2026-07-21",
    t: "Plainer words, in every language",
    items: [
      "The whole site now reads in your language, not just the cards: the menus, buttons, settings, and every page including About are translated into Spanish, French, German, Italian, Dutch, Russian, Arabic and Mandarin. Choosing Arabic also flips the page to read right-to-left.",
      "Every card has been rewritten in plainer language with shorter sentences, so a curious 14-year-old can follow it — and the translations were redone to sound natural in each language rather than word-for-word. Nothing was simplified away: the facts, dates and the careful 'scientists still argue about this' notes are all still there.",
      "Three more cards in the World History › Prehistory deck.",
      "The China collection has been emptied while it sits in 'coming soon' — it will be rebuilt from the ground up.",
      "The card editor speaks every language too: language tabs above the fields let a card's Spanish, French, German, Italian, Dutch, Russian, Arabic or Mandarin translation be edited directly, with the live preview following along.",
      "Cards can now carry an image: a widescreen picture at the top of the Background section that opens fullscreen when clicked — zoom in with the scroll wheel or a click, drag to look around, and read the picture's title, description and source at the bottom. Admins add and edit all of it from the card editor.",
      "Fixed a doubled dash before the author's name under the daily quote.",
    ],
  },
  {
    d: "2026-07-20",
    t: "A wider world, in many tongues",
    items: [
      "Folio is opening up to all of history: the China collection has been set aside as 'coming soon' while we build a brand-new World History collection, which opens today with a Prehistory deck of four cards.",
      "The language menu in the top corner now shows a country flag beside each language, and gained two more: Arabic and Mandarin Chinese. Newly written cards and glossary terms come translated into all of them, and switching language now translates the site itself, not just the menu.",
      "Read-aloud has been set aside for now — the spoken-audio buttons and the Audio settings are gone while we rework how it sounds.",
    ],
  },
  {
    d: "2026-07-19",
    t: "A more welcoming home",
    items: [
      "First-time visitors now get a proper welcome: the home page explains what Folio is in one sentence, walks through spaced repetition in three short steps, and starts your first study session with a single button.",
      "Three new doorways on the home page: a Card of the day you can flip over, a Term of the day from the glossary, and a slowly spinning mini globe that opens the Atlas.",
      "The review banner now shows your day streak and tells 'all caught up' apart from 'not started yet'; the daily quote now rotates through history's great voices, East and West — Confucius and Sima Qian alongside Seneca, Cicero and Plato.",
      "The Mission page became the About page, rewritten in plain language anyone can follow: a picture of the forgetting curve, a five-step guide to using Folio, and answers to common questions — with the changelog and credits below.",
      "The About page went quiet: no more read-aloud there, on the intro or in its glossary popups.",
      "A fresh coat of colour in the Library: every collection now has its own identity — Aegean blue for Greece, imperial purple for Rome, saffron for India, lacquer red for Russia — with a gold seal, a soft colour wash and a drifting motif on every theme, including the default.",
      "The About page brightened too: coloured section accents with small icons, the forgetting curve on a soft panel, the changelog drawn as a timeline, and a drop cap on the intro — plus an accent line under page titles and deck rows tinted in their collection's colour.",
      "Seven brand-new themes in Settings, each a complete makeover of the site: Arcade (16-bit console), Academy (formal faculty), Scroll (aged parchment), Marble (classical inscriptions), Dynasty (vermilion and gold), Grove (deep forest) and Gazette (1940s newsprint, with two-column reading).",
      "The drifting patterns on the Library banners are gone — collection banners are now calm and still on every theme.",
      "The default theme found its colour: minigame tiles now hint at their hue before you play them, a fine indigo-vermilion-gold ribbon runs under the navigation, due and new counts colour themselves, Library bars fill in each collection's shade, and the discovery tiles wear their own accents.",
      "Settings reorganised into titled sections — Appearance, Study, Audio, Atlas, Data and a fenced-off Danger zone that asks you to type RESET. Themes now show little previews of themselves and try on live as you hover; narrators became pickable cards; random review order joined the page.",
      "The Account page got a profile makeover: a golden level ring around your photo, headline tiles for cards, streak, badges and quiz wins, badges that show their unlock date or your progress toward them, collection levels in their own colours and numerals — and on a friend's page, your level beside theirs.",
      "A pruning: the gold seals left the Library banners, Marble lost its patterned top band, and seven themes (Scroll, Grove, Dynasty, Tide, Press, Bloom, Atlas) were retired — eight distinct ones remain.",
      "On the Atlas, Capitals and Borders are now separate legend layers in every year — historical capitals can be switched on and off just like today's.",
    ],
  },
  {
    d: "2026-07-14",
    t: "Counting in every script",
    items: [
      "The upcoming collections on the Library page now count their levels in their own script: Roman numerals for Ancient Rome, ancient Greek numerals for Ancient Greece, Devanagari for India, and Cyrillic numerals for Russia — joining China's Chinese numerals.",
    ],
  },
  {
    d: "2026-07-13",
    t: "Live editing",
    items: [
      "Content edits made by an admin on the live site now publish to the cloud and reach every visitor within seconds — no redeploy needed.",
      "The Edit page and the Editor/Visitor switch are now visible only to signed-in admin accounts; visitors and regular accounts no longer see them.",
      "Nineteen new cards in the Eastern Zhou deck.",
      "Pre-recorded narration for five more cards.",
    ],
  },
  {
    d: "2026-07-12",
    t: "Style pass",
    items: [
      "A consistency pass across every card and glossary entry: precise numbers above 20 are now written as numerals, centuries and millennia are always numbered (“11th century”), and literature titles are properly italicised — nearly 400 corrections in all.",
      "Three new cards in the Western Zhou deck.",
      "Seventeen new cards in the Eastern Zhou deck.",
      "Profile photos: click your avatar on the Account page to add a picture — it shows on your profile and in your friends' lists.",
      "Read-aloud is now off by default — switch it on under Settings → Text-to-speech whenever you want the narration.",
    ],
  },
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
      "Three new cards in the Western Zhou deck.",
      "Card backgrounds now play their recorded narration too (a mismatch had them falling back to the robotic device voice), and Settings gained a Narrator picker: American or British English, male or female.",
      "New accounts now start with five new cards per day instead of three (adjustable in Settings as before).",
      "The minigame tiles now earn their colour: quiet with just a coloured edge until you play, filling with colour once completed, and turning gold for a perfect score.",
      "Completed game tiles now show your score for the day (e.g. “4/5 correct!”), light mode lost the dark corner on coloured tiles, and the Daily-review button moved to the bottom-right so the level bar runs the full width.",
      "The Daily review now sits above the minigame tiles, sharing one grid, and the Mission intro gained a read-aloud button — silent until you click it.",
      "This changelog became a true day-by-day record back to June 24th, its dates now always in English, and the review banner got a neutral left bar with its button on the stats line.",
      "Eleven new cards in the Western Zhou deck.",
    ],
  },
  {
    d: "2026-07-10",
    t: "The deck regrown",
    items: [
      "The card deck was regrown one researched card at a time into per-dynasty history decks — mythology through the Western Zhou, around 150 cards — each with a uniform, information-dense background story.",
      "Cards file into every deck their era touches, ordered chronologically, with etymology and date boxes throughout.",
    ],
  },
  {
    d: "2026-07-09",
    t: "Glossary day",
    items: [
      "The glossary passed 2,100 terms — every one a three-sentence, neutral definition with category tags, dates and aliases.",
      "Fixed a save bug that quietly dropped some terms' settings when the editor wrote its files.",
    ],
  },
  {
    d: "2026-07-08",
    t: "Read-aloud arrives",
    items: [
      "Cards learned to speak: a slow male voice reads the question, answer and background; a female Chinese voice reads the hanzi. Mute button on every card, tiny play buttons behind the section titles, and glossary popups read themselves when opened.",
      "Select any background text and right-click for Copy / Read aloud.",
      "Settings gained a text-to-speech switch and device-voice pickers that automatically prefer the most human-sounding voices a device offers.",
    ],
  },
  {
    d: "2026-07-07",
    t: "Study polish",
    items: [
      "New cards graded “Good” now return later the same session (Anki-style learning step) instead of jumping to tomorrow.",
      "Levelling up shows a congratulations popup naming the deck; level numerals turned gold on the home and Library banners.",
      "The Atlas country info-box is capped on every screen size, so the globe and its close button always stay visible.",
      "Collection banners stopped showing the card date-spans (decks keep theirs), and repaired glossary links on a dozen cards.",
    ],
  },
  {
    d: "2026-07-06",
    t: "Games day",
    items: [
      "True or False grew to 79 statements and Who said it? to 64 quotations — all researched and fact-checked.",
      "The home tiles got icon artwork, daily checkmarks for all four games, and the Clean Sweep badge for winning everything in one day.",
      "Ctrl+Z now undoes the last edit on the editor page, and open glossary popups survive a page reload.",
    ],
  },
  {
    d: "2026-07-05",
    t: "Feature sprint",
    items: [
      "The Atlas opens centred on your home location (set in Settings; the Netherlands by default), and gained global terrain relief — mountains and ocean floor blended into the map.",
      "The country info-box grew up: the state's full official name, the years it existed, a general description beside what was happening in the selected year, and year-specific population / area / GDP.",
      "Undo and redo came to the whiteboard, on both the globe and card studies.",
      "Daily review's Random mode now draws the day's new cards randomly from your active decks, Library collections are studiable with one click, and the whiteboard covers the whole page before the answer is revealed.",
      "Editor quality-of-life: automatic save-to-files while editing, and the page remembers your place through reloads.",
    ],
  },
  {
    d: "2026-07-04",
    t: "The Atlas learns history",
    items: [
      "Historical border eras joined the globe's timeline — accurate snapshots from 1600 through 2020, changing only the political borders while today's coastlines, lakes and rivers stay put.",
      "Around 1,400 period-accurate capitals researched across the eras, with relocations honoured (St. Petersburg → Moscow, Constantinople → Ankara, Calcutta → Delhi…).",
      "Empires drill down: one click selects a whole colonial empire, a double-click the single territory, and the United Kingdom opens into its constituent countries in every era.",
      "The source data's quirks were cleaned in the build — overlapping territories removed, stray border ends welded onto the coastline.",
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
