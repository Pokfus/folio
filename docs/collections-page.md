# The Collections page — the tab bar, the sections and the shelf rows

**READ BEFORE CHANGING THE COLLECTIONS PAGE, A SECTION OR THE PLANNED FOLD.** This is the account of
`PAGES.decks` as it stood in `CLAUDE.md` until it was moved here verbatim on 2026-09-11: the request
behind each rule, the Geography node's promotion and what it did to readers who had added it, the two
names one status nearly ended up with, the size figure's five decisions, and the drag handle that
looked like a feature in the one place it was an accident. The RULES stay in `CLAUDE.md`.

- **Collections layout (`PAGES.decks`)** — a TAB BAR over five sections. The bar is Sep 2026, on
request (`COLLECTION_TABS` / `collTab` / `collTabSections` / `collTabBarHTML`): **History · Geography ·
Language · Other · Community · All**, defaulting to All, filtering the shelves that were already there
rather than splitting them into pages. Psychology sits under **Other** (with Philosophy), Community
holds your own decks and the shared ones below them, and the Planned fold is filtered with the rest —
its empty admin drop target drawn only under All and History, the two tabs a dragged collection would
land under. **A tab is a group of SECTIONS, not a new level in the tree**, so `COLLECTION_SECTIONS` and
`COLLECTION_SECTION` are untouched and "put Psychology in Other" costs one row. **The choice is
module-level, not in `S`** — a way of looking at one page, like the glossary record's sort — so a
shared `#decks` link still opens the whole shelf. **A tab with nothing in it is still drawn** and says
so in a sentence, unlike an empty SECTION: a tab that came and went as collections shipped would be a
bar whose shape a reader cannot learn.
Under it, five sections: **History**, **Geography**,
**Languages**, then **Your decks**
(the reader's own, and the way into the Studio), then **Shared decks** (Aug 2026, on request — the browse
list that used to be `PAGES.community`, a page of its own; see `docs/community-decks.md` for the route, the
redirect and the sortable table). The order is the point: the curated shelves first, by subject; then your
own; then strangers'; one page.
**THE SUBJECT SECTIONS ARE A DECLARED TABLE, NOT A LEVEL IN THE TREE** (`COLLECTION_SECTIONS` /
`COLLECTION_SECTION` / `sectionOf`, just above `PAGES.decks`; Aug 2026, on request: "rename the Collections
section to History. Put a section directly below it titled Geography, and put there a collection titled
United States … Put the Languages section directly below the Geography section"). The first heading read
**Collections** until then, which is what almost every collection is anyway, so anything the table does not
name is History. Four things.
**IT IS A TABLE FOR THE REASON `COLL_THEME` AND `COLLECTION_ICON` ARE**: a section is how this ONE PAGE is
arranged, and making it a node would put every collection a level deeper in `S.active`, in `entryCardIds`,
in the daily-study list and in every `#decks` link ever shared.
**GEOGRAPHY *WAS* SUCH A NODE, and what shipped is that node PROMOTED rather than a third level added
above it.** `geography` was a wrapper collection holding one deck, "The United States", holding the two
leaves; the request asks for a SECTION called Geography and a COLLECTION called United States, so `geo-us`
became the collection and its two decks now sit directly inside it. **The card-bearing ids are untouched**
(`geo-us-states`, `geo-us-capitals`), so no reader's schedule moves — and a reader who had added the
`geography` node loses that one entry silently and correctly, `activeEntryIds` already filtering an id that
no longer resolves.
**THE COMING-SOON FOLD SITS BELOW ALL THREE SUBJECT SECTIONS** (Aug 2026, on request; it was History's
tail for a day, on the reasoning that every collection in it is a history one). That reading is
defensible on the contents and wrong on the grammar: **a fold under one heading is a claim that what is
in it belongs to that subject**, so the day a Geography or a Languages collection goes coming-soon it
would land under History with nothing on the page to say so. Below all three it says what it actually is
— everything still being written — and needs no second fold when that day comes. There is deliberately
still ONE of it rather than a fold per section: a heading over an empty fold is the failure the
empty-section rule below already refuses.
**AN EMPTY SECTION IS DRAWN ONLY FOR HISTORY, AND ONLY FOR AN ADMIN** — that one has a drop target worth
offering, where a "Geography" heading over nothing would advertise a section a drag cannot put anything
into, the section coming from the table and never from where a row is dropped. History keeps the slot id
**`collection-list-all`**, which five test files and the admin drag both name; Geography is
`collection-list-geo`.
**AND THE ADMIN DRAG STANDS DOWN ON A SECTIONED COLLECTION** (`valid()` in `wireLibraryDnd`): a collection
named in `COLLECTION_SECTION` is neither dragged nor dropped onto, because that order decides a
collection's place WITHIN its section and nothing there decides which section it is in — so such a drag
could only ever appear to do nothing, the row being re-ordered in the tree and re-drawn exactly where it
was. Reordering History, and moving a collection to and from Planned, are untouched.
**THE SECTION IS CALLED "PLANNED"** (Aug 2026, on request; it was "Coming soon"), and so is the status
pill on every row in it — the pill IS the section's marker on a row, so leaving it saying "Coming soon"
under a "Planned" heading would be two names for one status. **The INTERNAL names are deliberately
unchanged** — `isComingSoon`, `setNodeSoon`, the `soon` flag, `.collection-group-soon`, `.pill.soon`
and `ADMIN_EDITS.tree.soon` — for the reason the Library-to-Collections rename kept its route: a label
is what a reader sees and a class is what five test files and the admin drag name. So **"coming-soon"
survives in this file and in the code as the name of the STATE**, and "Planned" is what is on screen.
The phrase also survives elsewhere on purpose: the minigames' empty placards and the home page's
"More games" tile say "Coming soon" about a different thing.
**It is a `<details>` disclosure**
(`.collection-group-soon`), **collapsed for everyone, admins included** (Aug 2026, on request — it used to open
itself for an admin so the library's drag-and-drop had its drop targets reachable, which meant the one person who
opens this page most often always met it expanded; an admin moving a collection between the groups opens the fold
first, and the drop targets are reachable the moment it is open). This exists because
the collections still being written far outnumber the finished ones (currently 6 to 1), and listing them flat made
the Library read as empty.
**THE DRAG HANDLE IS VISIBLE AT REST** (`.lib-grip`, Aug 2026, on a report that admin reordering had
stopped working there). It had NOT: every row rendered its grip and carried `draggable="true"` the whole
time — the grip sat at `opacity:0` until the row was hovered, so on a live collection there was nothing
to reach for, while a **Planned** row showed its own at rest as a side effect of the overrides that
compensate for that group's `filter:opacity(.5)`. So the one place it looked like a feature was the one
place it was an accident. It is `.32` at rest and `.6` on hover now. **A discoverability fault reads
exactly like a broken feature** — check whether the affordance is on the page before looking for the
handler.
**A COLLECTION STATES ITS SIZE ONCE, ON THE BAR** (Aug 2026, on request). Its banner carried a
`.collection-count` behind the title AND a studied/total bar under it, so the row read "412 cards" beside
"0 / 412 cards" — one number, said twice, in two registers. The count behind the title is gone and the bar
is what says it. **The DECK rows inside keep theirs** (`.node-count`, next paragraph) precisely because
they have no bar; a coming-soon collection keeps its pill for the same reason, that being the only thing
its row has to say. Nothing else changed — `total` still feeds `deckProgMarkup` and the study guard.
**…AND HOW MUCH OF THE DOWNLOAD IT IS** (`.node-size` / `cardBytes` / `nodeBytes` / `fmtDeckSize`, Aug
2026, on request: "make it so that both Language decks and now also History decks mention the file size
to download"). The Languages shelf had said what a deck would fetch since it shipped; the history shelf
said nothing, so the same fact was in one place on one shelf and nowhere on the other. Five things.
**THE TWO SHELVES ARE MEASURING DIFFERENT THINGS AND THE WORDING SAYS SO.** A language deck's figure is
the SIZE OF THE FILE, read off disk by `.claude/build-lang-decks.js`, and its row reads "20.6 MB to
download". A curated deck has no file of its own — its cards ship inside `data.js`, which every visitor
downloads before flipping one — so the honest figure is what those cards WEIGH there, its row says the
bytes alone, and its `title` says they are already downloaded. Writing "to download" on both would
promise a fetch that happened before the reader saw the page.
**ONE FORMATTER** (`fmtDeckSize`), so a language deck's megabytes and a curated deck's cannot come to be
written two different ways on one page — `langDeckMB` is DELETED rather than left beside it. Under a
megabyte it says kilobytes: "0.1 MB" over a 90 KB deck is a figure a reader cannot act on, and most of
the curated decks are that size.
**`TextEncoder`, NEVER `String.length`** — the corpus is full of accented and CJK characters and every
one of them is undercounted by a code-unit count, which is a figure that is quietly wrong rather than
visibly missing.
**THE BYTES ARE CACHED PER CARD AND PER NODE, AND BUSTED WITH THE REST** (`uCacheBust`): the Collections
page draws every leaf of every collection, so the alternative is `JSON.stringify` over a few megabytes
per repaint — and an admin edit changes a card's bytes, so the two caches have to be declared BESIDE
`uCacheBust` rather than near the code that fills them, that function running at boot from
`applyAdminEdits`.
**AND THE FIGURE WRAPS RATHER THAN HIDING ON A PHONE.** The first cut hid it below 430px, which takes
the download size away from exactly the readers who most need it; `.node-title-row` carries
`flex-wrap:wrap; row-gap:4px` in its base rule instead, so on a narrow row the size drops to a line of
its own and is still there.
**A DECK ROW SAYS HOW MANY CARDS IT HOLDS, not what years they cover** (`.node-count`, Aug 2026, on
request). The banner one level up had said this all along, and the two rows disagreeing about what the
small grey figure on the right MEANS is the whole reason to change it. What is dropped is the
AUTO-DERIVED span (`nodeSpanText` → the earliest and latest datable card inside); a date an editor has set
BY HAND on the node still shows, exactly as it does on a collection, since that is a fact about the deck
rather than a summary of its contents. An empty deck says so, for the reason the banner does — "0 cards"
reads as a figure that failed to load. `nodeSpanText` is still what the admin editor's date field reads.
(The first group was labelled "All decks" until Aug 2026, which contradicted both the hierarchy —
collection → deck → subdeck — and the page's own title.)
**A coming-soon collection shows its name and the pill, and nothing else** (Aug 2026): it used to carry a
`Level 1` badge over an XP bar reading `0 / 3 cards` — a progress meter towards a level in a collection
that cannot be studied, and a figure that reads as a card count when the collection holds no cards. Six of
the seven collections are coming-soon, so that was most of the Library saying nothing. With the meter gone
the row's opacity fade no longer has to cover one, so it eases from `.62` to `.78` (at `.62`, over a tinted
wash, the title and pill sat near the contrast floor). It also has to **cancel `.collection-title-row`'s 9px
bottom margin** (Aug 2026, on request): that margin separates the title from the XP bar, and with no bar it
was 9px of nothing inside a flex item the row centres as a whole, so the title rode ~4.5px above the middle
of its own banner. A flex item establishes its own formatting context, so the margin cannot collapse away by
itself — it has to be zeroed.
