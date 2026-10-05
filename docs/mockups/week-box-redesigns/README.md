# The home page's Today / This week box (Oct 2026)

Six proposals for the figures box on the home page (`homeWeekHTML` in `app.js`, `.home-week` in
`styles.css`), which stands beside the Continue reading box (`.home-two`). As shipped, Today's three
figures sit over This week's three at the same size. Each design is drawn in the real tokens (copied
from the top of `styles.css`) on a desktop (1040px), a tablet (834px) and a phone (390px) frame, with
the reading box beside it for context, and one sample day: 92 cards, 43 min, 91% recalled today; 611
cards, 4 h 12 min, 88% over the week. Sample figures, not anyone's record. **D3 is implemented** (Oct 2026): its phone form on phones and tablets, its desktop form on desktops, without the globe ornament — see `homeWeekHTML` and `.home-week`.

| # | design | the idea |
|---|---|---|
| D1 | Side by side | Today and This week as two short columns, label left and figure right; the box stays as tall as the reading box. |
| D2 | Today large, the week in a line | The day keeps its three big figures; the week folds into one line of small type along the foot. |
| D3 | Seven days | Seven bars of cards per day, today the solid one, with the week's totals beneath and today's figures at the left. |
| D4 | The day against the week | A small table: measures as columns, spans as rows, so each of today's figures sits over the week's. |
| D5 | Two rings | Recall as a ring for each span, the percentage at the centre, cards and minutes beside. |
| D6 | The ledger | Label, dot leaders, amount, in the site's monospace; two columns on a desktop and tablet, one on a phone. |

## Files

- `interactive.html` — all six on one page with device (all / desktop / tablet / phone) and light / night
  switches. Open it from a server at the repo root, or directly; it fetches its fonts from Google Fonts,
  so without a network it renders in the fallback faces.
