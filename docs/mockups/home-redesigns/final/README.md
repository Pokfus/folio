# The composed home page (Oct 2026)

One design assembled on request from round 4 (`../round-4/`):

- **Compass**: the study banner (on the phone the Start button runs the banner's full content width) ("29 cards" in rose, new / learning / review in blue / red / green, a
  bare "≈ 12 min" estimate from the reader's per-deck pace, the card preview) and the 14-day streak ribbon.
- **Tabular**: the minigame list-tiles (icon disc, name, tick) and the Continue Reading row.
- **Keys**: the This Week box and the active-deck rows whose fill is the share of the collection learned,
  with the blue / red / green number boxes.

The streak ribbon carries the **streak chests**: each week of the run ends in the site's chest glyph, gold once that week is paid (`maybeStreakChest`, every seventh day, worth one more each week), quiet while it is being earned, with the days to the next one and what it is worth. **The implementation removes the "Next streak chest" box from the Account page** (`streakChestHTML`), so the chest is said once.

The greeting carries no date, ever. The order is greeting, quote, banner, ribbon, collections,
minigames, reading beside This Week. `build.js` borrows the parts from the round-4 and round-2
generators; edit it, not the page. `shots/` holds the page at 1440, 834 and 390 px in light and dark
and one contact sheet.
