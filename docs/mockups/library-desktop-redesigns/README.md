# Library — six desktop redesigns

`index.html` is one self-contained file (vanilla JS, no build step; the three house fonts come from Google
Fonts). Open it, flip between the six designs with the strip at the bottom (keys `1`–`6`, `←` `→`), toggle
day / night (`D`). The choice is kept in the URL hash (`#3-night`). Search, sort, direction, stars and the
selected text are shared, so the six can be compared in the same state. The phone layout is not redesigned;
below about 960 px each design only falls back to a readable single column.

| # | Design | What it is |
|---|---|---|
| 1 | Reading room | Three panes: a filter rail with counts, the shelf as dense rows, a sticky detail pane for the selected or hovered text. |
| 2 | Stacks | A wall of typographic covers in each book's own colour, under sticky tradition headings, with a Continue reading band on top. |
| 3 | Time river | A zoomable timeline, 2600 BCE to 1926, on a piecewise scale with a lane per tradition; the ordinary sorted list sits below it. |
| 4 | Catalogue | A sortable table (click a heading) under a strip of the books in progress; the densest of the six. |
| 5 | Traditions | A board with one column per tradition, or per form, scrolling sideways inside its own frame; Favourites pinned as the first column. |
| 6 | Desk | A front page: the book in progress as a hero, the others beside it with four figures, then one shelf per form that opens into a grid. |

**Chosen (Nov 2026).** Design 1, the Reading room, is now the Library page on a desktop (1100px and
wider), and the top of design 6 — On your desk, Also on your desk, the four figures — stands over the
shelf on a phone and a tablet. `docs/library-feature.md`, "The Reading room and the Desk", describes what
was built. The other four are drawings only.

## Data

`books.json` holds the 101 texts. Regenerate it from the live catalogue with

    node docs/mockups/library-desktop-redesigns/make-data.js

`index.html` carries its own copy of that data between the `/*BOOKS:start*/` and `/*BOOKS:end*/` markers.
After regenerating, copy it in again (run from the repo root):

    node -e "const fs=require('fs'),d='docs/mockups/library-desktop-redesigns/';let h=fs.readFileSync(d+'index.html','utf8');const a=h.indexOf('/*BOOKS:start*/'),b=h.indexOf('/*BOOKS:end*/');fs.writeFileSync(d+'index.html',h.slice(0,a)+'/*BOOKS:start*/const BOOKS = '+JSON.stringify(JSON.parse(fs.readFileSync(d+'books.json','utf8'))).replace(/</g,'\\\\u003c')+';'+h.slice(b))"

**`tradition` and `form` are groupings made for this mockup.** The live catalogue has no such fields yet;
designs 1, 2, 3, 5 and 6 depend on one existing. The reading places (`at`), the three stars and the read
counts are sample reader state from `make-data.js`, not anyone's real progress. The Reading room's length
buckets count a book's own parts (books, chapters, letters …), which are not the same size from one book to
the next.

## Screenshots

`shots/` holds each design at 1440 × 900 in day and night (`d1-day.png` … `d6-night.png`) and at 1100 × 800
in day (`d1-1100.png` …).
