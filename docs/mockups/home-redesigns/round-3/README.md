# Home-page redesigns, round 3 (Oct 2026)

Six designs built from the review of round 2 (`../round-2/`). Every version has its **own game-tile
form** and its **own active-deck list**; the quote keeps the room it has on the live page; each deck
row carries the blue / red / green new / learning / review counts the live rows carry (`.dkc-new`,
`.dkc-learn`, `.dkc-rev`); the streak is compact. The blue study banner with the per-deck time
estimate, the Continue Reading box and the globe Atlas box are kept from round 2.

`build.js` generates the six pages from round 2's shared parts plus its own; edit it, not the pages.

| # | file | layout | game tiles | active decks | streak |
|---|---|---|---|---|---|
| 1 | `r3-1-atrium.html` | one centred column | app icons: a coloured rounded square with the glyph, the name beneath | rows with a bar segmented blue / red / green | a pill beside the greeting |
| 2 | `r3-2-ledger.html` | side rail | wide list-tiles in two columns, icon disc at left, status pill at right | a table with coloured column heads and a totals row | a four-figure stat strip |
| 3 | `r3-3-nocturne.html` | dark-blue hero | postage stamps with a perforated edge and a "played" postmark | cover cards with three labelled chips | a 14-day ribbon under the hero |
| 4 | `r3-4-spread.html` | an open book, two pages | trading cards with a coloured band | rows with a three-colour ring and three pills | a half-width box with a 14-column grid |
| 5 | `r3-5-console.html` | three-column console | tickets with a coloured stub and a torn edge | monogram rows with a three-cell scoreboard | a heat strip in the header |
| 6 | `r3-6-gallery.html` | wide centred column | gallery pieces: a colour field with a caption bar | cards with a large three-colour ring and a legend | a slim box under the decks |

`shots/` holds each page at 1440, 834 and 390 px in light and dark, plus one contact sheet per design.
