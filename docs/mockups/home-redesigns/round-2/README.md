# Home-page redesigns, round 2 (Oct 2026)

Six designs built from the review of round 1 (`../`). What the review kept: the blue study banner
with a time estimate, a dedicated Streak box, the globe-outline Atlas box, the Continue Reading box,
the dark-blue hero with its globe, and the card preview. What it ruled out: text-only pages, bare
minimalism, warm skeuomorphic colours, and sideways-scrolling deck lists. Two rules hold in every
version: the daily quote is at or near the top, and the minigames are tiles showing their full names.

`build.js` generates `_parts.css` (the shared components) and the six pages; edit it, not the pages.
`glyphs.json` holds the nine real game glyphs copied from `app.js`'s `ICON` table.

| # | file | the layout |
|---|---|---|
| 1 | `r2-1-rail.html` | The side rail from round 1's Ledger; quote strip under the heading; banner with the card preview beside the streak; games, reading and atlas; collections. |
| 2 | `r2-2-mosaic.html` | The bento, with the quote as the top tile, the banner carrying a globe, and the nine games as full tiles at the foot. |
| 3 | `r2-3-sky.html` | The dark-blue hero with the globe and the estimate; the quote sits in the hero's foot; a wide/narrow body. |
| 4 | `r2-4-deal.html` | The card preview is half the hero, the banner the other half; the quote is the page's dateline; a three-box row. |
| 5 | `r2-5-twin.html` | Two panes: the day's essentials (banner, streak, quote) on the left, everything else on the right. |
| 6 | `r2-6-column.html` | The current page's single centred column rebuilt from the liked parts: the smallest step from today. |

**The time estimate is per deck.** Every banner shows "≈ 12 min · from your pace in each deck …". The
intended implementation is a running average of this reader's seconds per card in each deck (a history
card reads longer than a vocabulary word), summed over the pile due today, never a constant per card.
The figures shown are sample values.

`shots/` holds each page at 1440, 834 and 390 px in light and dark, plus one contact sheet per design.
