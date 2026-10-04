# The nine-games chest indicator on tablet and phone (Oct 2026)

Twelve proposals for the indicator at the right of the home page's **Minigames** heading — the thing that
says how many of today's nine games are played and holds the chest that finishing all nine unlocks
(`sweepRowHTML` in `app.js`, `.sweep-row` in `styles.css`). The desktop's indicator is a 3×3 miniature of
the tile grid, and on the desktop that is honest: the lit pip in the middle of the top row is the tile in
the middle of the top row. A tablet lays the tiles **two to a row** (641–1024px) and a phone **one to a
row** (≤640px), so there the 3×3 is a miniature of nothing. Six designs for each.

**They are proposals, not the site.** Nothing in `app.js` or `styles.css` changed. Every design is drawn in
the real tokens (copied from the top of `styles.css`), the real fonts (`../../../fonts.css`), the real chest
and padlock marks, the real game glyphs and tile hues, and one sample state: 5 of 9 played, 2 of them
perfect (Timeline, Find it), chest still locked. Green is `--good` (played) and the gold is the tile seal's
pair of stops (perfect), as on the desktop's pips.

## Tablet (`tablet.html`, shot at 834px)

| # | design | the idea |
|---|---|---|
| T1 | Two-by-five miniature | The honest mirror: pips laid out as the tablet lays out the tiles — two to a row, the ninth alone — so the lit pip is still the tile it names. |
| T2 | Nine-segment bar | One meter in reading order, left to right, top to bottom: the tile order without pretending to be the tile layout. |
| T3 | Ring around the chest | Nine arcs wrap the chest itself; the count stands beside it in words. |
| T4 | Glyph rail | Uses the width a tablet has: a strip under the heading with each game's own glyph in its hue once played, gold when perfect, joined by a line that runs to the chest. |
| T5 | Trail to the chest | Nine stations on a path, the played stretch solid and the rest dashed; the words say how many are left. |
| T6 | The chest fills | The chest is the meter: it fills from the floor as games are played, with the figures and the perfect count beside it. |

## Phone (`phone.html`, shot at 390px)

| # | design | the idea |
|---|---|---|
| P1 | The ladder | The honest mirror of a phone's single column: nine short rungs, one per tile, top to bottom. |
| P2 | Compact segmented bar | The nine as one small meter on the heading row, with the figures and the chest. |
| P3 | Ring and pill | The arcs wrap the chest; the count is a pill beside it. |
| P4 | Full-width rail | The heading keeps its own line; under it the meter runs the whole width and the chest caps its right end. |
| P5 | Chest with a badge | The smallest footprint: the chest alone, a count badge on its shoulder, a thin segmented arc round it. |
| P6 | Words, and the rule is the meter | The count in words on the heading row; the hairline beneath fills green with a gold tail for the perfect runs. |

## Files

- `build.js` writes `tablet.html` and `phone.html`, and with Playwright on `NODE_PATH` (as the CI suites
  run it) the shots. Open either page from a server at the repo root; `?theme=dark` forces night mode.
- `shots/<device>-<light|dark>.png` — each page whole, in context above the first tiles.
- `shots/<device>-sheet.png` — light beside night.
- `shots/<device>-detail.png` — every design's indicator row cropped at 3×, light beside night. **Start here.**

The chest's other two states are not drawn: *ready* (all nine played — the chest takes `--gold`, the lock
goes and it nods, as `.sweep-chest.ready` does today) and *claimed* (green, dimmed). Each design keeps the
chest a real `<button>` so those states carry over unchanged.
