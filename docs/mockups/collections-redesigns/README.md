# Collections-page redesigns (Oct 2026)

Six designs for the Collections page in the composed home page's style (`../home-redesigns/final/`):
the same top bar, phone head and bottom bar, tokens, mono eyebrows, number boxes and rounded cards.

**The Studio page is folded in.** Every design carries, on the Collections page itself, what `#studio`
did: the Your decks list with New deck, Import, Study, Edit, Export and Delete; the deck editor opened in
place (Cards, Deck details, Card types, Glossary; Publish / Publish changes / Unpublish); the "Published,
but not on this device" list; and the Shared decks section with its search and Staff picks. The
implementation removes `PAGES.studio` and routes every `route("studio")` call to this page with the deck
open. The page's tabs rename Community to **Your decks**.

| # | file | the catalogue | your decks |
|---|---|---|---|
| 1 | `c-1-shelf.html` | the home page's fill rows: the fill is the share studied; mark, decks, cards, written-of-planned, Try ten, add, expand | rows of the same kind, the editor unfolding under the open one |
| 2 | `c-2-covers.html` | two-up cover cards with a coloured band, a studied bar and the actions in the foot | cards of the same kind with a dashed New deck card |
| 3 | `c-3-ledger.html` | the table: decks, written, cards, learned (with bar), by section | a second table: cards, edited, sharing, actions |
| 4 | `c-4-atlas.html` | a summary banner in the study banner's blue (collections in review, learned, due, own decks) then compact tiles with a mini ring | tiles of the same kind with a dashed New deck |
| 5 | `c-5-workbench.html` | the catalogue in a narrow list on the left | a bench on the right holding your decks, New deck, the editor and the orphans, sticky on desktop |
| 6 | `c-6-spines.html` | upright covers five across, like a shelf of books | covers of the same kind, hand-lettered with the deck's initial |

Every design: the section headings of the live page (History, Geography, Science, The Arts, Special,
Languages), the Planned fold, the real collection marks and colours (`collicons.json`, pulled from the
live page), the "written of planned" reach, and the Try ten / add / expand controls. `shots/` holds each
page at 1440, 834 and 390 px in light and dark plus one contact sheet per design.
