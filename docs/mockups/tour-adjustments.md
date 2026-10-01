# The walkthrough on the redesigned pages (Oct 2026)

What `TOUR_STEPS` in `app.js` must change to when the composed home page
(`home-redesigns/final/`) and the composed Collections page (`collections-redesigns/final/`) are
implemented. Nothing here is applied yet: the live tour targets the live page, and retargeting it
before the pages exist would break every step. Apply this in the same commit as the pages.

| step | today | on the new pages |
|---|---|---|
| Your daily study | targets `#b-review` (the hero banner) | targets `.study` (the blue banner). Add a sentence: *"The minutes beside the counts are an estimate from your own pace in each deck."* The three pile words keep their colours; the banner's own counts now wear the same three. |
| Nothing is scheduled until you choose it | targets `.home-collections` / `#b-addDecks`, the Collections button under the banner | that button is gone. Target the **"+ Add decks"** link in the *Your collections* header (`.add-decks`), which is the phone's route to the page; on desktop the Collections tab in the top bar does the same, and the copy can say so. |
| Adding a deck | targets `.collection-add`, `.collection-actions`, `.collection-list` | targets the add control in a ledger row (`.fr .ic-btn`), then the row, then the ledger (`.ledger`). The chevron is the second `.ic-btn`. Copy unchanged. |
| Pick a subject | waits on `added`, targets `.collection-list` | waits on `added`, targets `.ledger`. |
| Your decks, once they are added | `tourDeckRow()`, else `.active-decks` | `tourDeckRow()` returns the deck's `.fr` row in `.fill`; fallback `.fill`. Copy: the row's **fill** is the share of the collection learned, and the three coloured boxes are its share of the day; hold a row for its options, as now. |
| A game a day | targets `.games-sec`, `.game-grid` | targets `.list` (the minigame list-tiles). Copy unchanged; the tick on a tile is the day's round done. |
| Study your new deck | `tourDeckRow()` else `.active-decks` | as above, fallback `.fill`. |
| What a chest can hold | mentions "every seventh day of a study streak" | add: *"— the ribbon under the banner shows the week's chest filling up."* Optionally a new step before it, **Your streak**, targeting `.ribbon`: *"A day with any study keeps the streak. Each week of it ends in a chest, gold once it is paid."* |
| Write on the card / Your first card / Grade yourself / Your first badge / Over to you | — | unchanged: they run on the study page. |

Other places that name the old layout:

- `tourDeckRow()` finds the row by deck id; the new row carries the same `data-` hook, so only its selector changes.
- The Collections page's quiet help (`.page-help-quiet`) and the *Adding a deck* step both say "the + beside one"; still true.
- The Studio page goes. Any step, hint or link that routes to `studio` routes to `decks` with the deck open (there are none in `TOUR_STEPS` today; `route("studio")` is called from the Collections page's own Your decks section, which is what moves).
- The Account page loses its *Next streak chest* box; the badge step's "waiting in your account" wording for chests stays true (chests still live on the account page), but the streak-chest toast can say "in the ribbon on the home page".
