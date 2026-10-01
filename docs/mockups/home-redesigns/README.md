# Home-page redesign mockups (Oct 2026)

Six alternative designs for the home page, each a standalone static page using Folio's real
tokens (`_tokens.css` is a copy of the palette at the top of `styles.css`), real fonts (`fonts.css`)
and real content: the day's quote, the nine games and their hues, real collection names and card
counts, real Library titles, and three real cards (`gr-990`, `rm-138`, `wh-465`) on the Desk.

**They are proposals, not the site.** Nothing in `app.js` or `styles.css` changed. The study
state shown (29 cards due as 2 new / 4 learning / 23 review, a 12-day streak, 3 of 9 games played,
*The Histories* 38% read) is a sample a returning reader might see, chosen so every element of
each design has something to show.

| # | file | the idea |
|---|---|---|
| 1 | `01-ledger.html` | A dashboard with a side rail: stat tiles, a progress ring, a streak grid, panels. |
| 2 | `02-broadsheet.html` | A morning paper: serif masthead, dateline, hairline rules, three columns. |
| 3 | `03-bento.html` | A mosaic of mixed-size tiles under a floating pill nav. |
| 4 | `04-focus.html` | One column, one sentence, one button; everything else a hairline row. |
| 5 | `05-desk.html` | A study desk: a fanned stack of real cards, spines on a shelf, a tray of game tokens, a pinned note. |
| 6 | `06-rails.html` | A full-bleed indigo hero with a globe, then sideways-scrolling rails. |

Open any file from `index.html`'s folder (they link `../../../fonts.css`); dark mode follows the
system, or append `?theme=dark` / `?theme=light`. Breakpoints: ≤640px phone (bottom bar),
641–1024px tablet, wider is desktop.

`shots/` holds every mockup at 1440, 834 and 390 px wide in light and dark
(`<design>-<device>-<scheme>.png`) and one contact sheet per design (`<design>-sheet.jpg`).
Regenerate with Playwright exactly as the CI suites run, serving the repo root over HTTP.
