# Home-page redesigns, round 4 (Oct 2026)

Six designs built from the review of round 3 (`../round-3/`). Kept everywhere: the Atrium study banner,
now with "29 cards" in rose, the three pile counts in blue / red / green, a bare "≈ 12 min" estimate
(the per-deck pace is the implementation, not the label) and no "try ten cards" line; the Nocturne
14-day streak ribbon; a horizontal top menu on desktop and tablet; the globe outline as decoration only.
Every collection list carries a **progress bar for the share of the collection learned**, because
learning a chosen collection is what the site is for. No layout leaves a half-empty column.

`build.js` generates the six pages; edit it, not the pages.

| # | file | game tiles | collections | streak |
|---|---|---|---|---|
| 1 | `r4-1-compass.html` | gallery pieces (colour field, caption bar) | rows: number boxes at left, name, full-width bar beneath | ribbon under the banner |
| 2 | `r4-2-tabular.html` | list-tiles, three across, name and a tick only | the table, with a Learned column holding the bar | ribbon beside the greeting |
| 3 | `r4-3-marks.html` | trading cards (coloured band) | cards with a mastery ring and the number boxes | ribbon under the banner |
| 4 | `r4-4-hall.html` | tickets, in a column beside the decks | monogram rows with boxes and a bar, in a panel | ribbon under the banner |
| 5 | `r4-5-keys.html` | keycaps | rows whose progress is the row's own fill | full-width strip under the top bar |
| 6 | `r4-6-frames.html` | polaroids, each slightly tilted | two-column cards with monogram, boxes and bar | ribbon beside the greeting |

A small "This week" panel (cards studied, minutes, recall) fills what would otherwise be an empty cell
in four of the six. `shots/` holds each page at 1440, 834 and 390 px in light and dark plus a sheet.
