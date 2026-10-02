# Library-page redesigns (Oct 2026)

Six designs for the Library page in the composed home page's style (`../home-redesigns/final/`). All
48 books on the live shelf, with their authors, dates, part counts, original-language pills and tile
colours (`books.json`, pulled from the live page and given a sortable year by hand), plus a sample
reading state: three books open, two finished. Every design keeps the page's functions: the search
filter with its count, the sort and its direction, the help, the quiet introduction, and a tile per book.

| # | file | the shelf |
|---|---|---|
| 1 | `l-1-shelf.html` | the home page's fill rows: the fill is how far the book is read; spine, author, title, date, parts, language, status |
| 2 | `l-2-covers.html` | upright covers six across with the title set on the cover and a read bar in the foot |
| 3 | `l-3-room.html` | the current books in the study banner's blue, then the shelf two-up by era (Antiquity, Middle Ages, Early modern) |
| 4 | `l-4-ledger.html` | the Collections page's ledger with a band per original language |
| 5 | `l-5-timeline.html` | a line through time, oldest first, each book a card off the line |
| 6 | `l-6-desk.html` | a sticky "Your reading" pane with figures, beside a compact three-across shelf |

`build.js` generates the six pages; edit it, not the pages. `shots/` holds each page at 1440, 834 and
390 px in light and dark plus one contact sheet per design.
