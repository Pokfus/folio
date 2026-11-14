# Where the Today / This week box goes on a tablet and a desktop (Nov 2026)

On a phone (≤640px) the home page's figures box (`homeWeekHTML` in `app.js`, `.home-week` in `styles.css`) already
stands between Your collections and Minigames (`.home-two{display:contents}` and `order`). On a tablet and a desktop it
still sits at the foot, in `.home-two` beside Suggested reading, under the games. These six proposals move it to the
phone's place on the larger screens: three for a tablet (834px frame) and three for a desktop (1280px window, the
800px content column), each drawn as a whole mock home page in the real tokens (copied from the top of `styles.css`),
with the moved box outlined and tagged "moved". Sample figures, not anyone's record: 40 cards, 16 min, 80% recalled
today; 211 cards, 1 h 52 min, 84% this week.

| # | design | the idea |
|---|---|---|
| T1 | The shipped box, full width | Today's three figures over the week's seven bars (the tablet's form today), across the column; reading below the games, full width. |
| T2 | Two-line band | Today on one line, the week and a seven-day sparkline on the next, a link to the stats; the games stay high. |
| T3 | The pair moves together | The current `.home-two` row (reading beside the box) lifted whole above the games. |
| D1 | The shipped box, full width | The desktop's two-column inside (Today at the left, the bars and totals at the right) widened to 800px; reading below the games, full width. |
| D2 | One-line band | Today's figures, a sparkline and the week's figures in one ~60px strip. |
| D3 | Three cells | A row of three boxes: Today, the last seven days as bars, the week's totals; reading below the games. |

## Files

- `interactive.html` — all six on one page with device (both / tablet / desktop), design (all / 1 / 2 / 3), light /
  night and moved-marker switches. Open it directly; it fetches its fonts from Google Fonts, so without a network it
  renders in the fallback faces.
