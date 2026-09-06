# Visual Art — a 1000-card running order

The plan for `art`, a new collection: every card's number, topic and deck, fixed in advance so the
collection can be grown one card at a time over many sessions without anyone having to remember what
was intended.

It is the seventeenth thousand-card plan on the shelf — the nineteenth row of CLAUDE.md's index
table, which also carries the three geography plans — and the fifth that is not a history collection. Read
`docs/greece-card-plan.md` first if this is the first plan you have met; the mechanics are identical and
are not repeated here. What is NOT identical is the card itself — this collection uses a **new built-in
format, the artwork card**, which does not exist yet and which the section "The artwork card" below
specifies in full. **Nothing in the running order can be written until that format is built.**

---

## How to use this (the whole point of the file)

**The next card to write is the lowest `art-NNN` not yet in `data.js`.**

    node -e "global.window={};require('./data.js');const h=new Set(window.CARD_DATA.map(c=>c.id));for(let i=1;i<=1000;i++){const id='art-'+String(i).padStart(3,'0');if(!h.has(id)){console.log(id);break}}"

Look the number up below, research it, write it, and add it with the deck id this file gives:

    node .claude/add-card.js <card.json> <deckId>

**Always pass the deck id.** Without one `add-card.js` falls back to the first leaf in the whole tree,
which is in China.

There is deliberately **no progress file**. `data.js` says what exists and this file says what is
planned; the next card is whatever falls between them, so the two can never come to disagree about
where the work had got to.

The padding above is right for every id but the last: the ids are `art-001` … `art-999`, then `art-1000`.

## What a line in this list is, and is not

A line is a **subject to research**, not a fact to assert. `art-400 Michelangelo's David — Florence,
1504` is already an answer term; `art-015 Parietal art — the techniques of the painted cave, c. 25,000
BCE` is a subject to describe, and the card's actual answer — the word that gets blanked — is chosen
while writing it, from what the sources will support.

**THE YEAR AT THE END OF EVERY LINE IS A SORT KEY, NOT A CITATION.** It is what fixed the running order
(see the next section) and it is approximate by construction: a great many of these works are dated to a
decade, a reign or a range, and several are actively argued about. The card's own date line is
researched when the card is written and **may differ from the year in the line**. That is expected and
is not a fault to fix here — a card id is a permanent address, so **the order is never re-sorted**, for
the reason `docs/world-geography-card-plan.md` gives about its population snapshot. If research moves a
work by five years, the card moves nowhere.

The one thing that must not happen is a card written to fill a slot. The house rule stands: never invent
a date, a name or an attribution. If a topic cannot be sourced, say so and replace the line, in the same
commit as the change.

## The collection is a timeline, and that is the request

The request that produced this file asks that **the Ordered study mode deal the artworks in
chronological order of creation**. That is not free, and it is worth being exact about why.

"Ordered" is **the cards' order of appearance in the tree** — `buildSession`'s Ordered branch flattens
`TREE.collections` with `subtreeCardIds` and sorts by position in that sequence, with `cardStartYear`
only as a tie-break. So the global order is: deck by deck in tree order, and within a deck, subdeck by
subdeck, and within a subdeck, the order the cards were added — which for a collection grown lowest-id
first is **the order of the ids**. A collection is therefore dealt chronologically if, and only if, its
running order is chronological end to end.

**So every deck and every subdeck here is a date range, and nothing else.** There is no sculpture deck,
no Impressionism deck, no Italy deck. A subdeck is a slice of time and holds whatever the world made in
it: Sesshū's *Winter Landscape* (`art-369`) sits nine cards from Botticelli's *Primavera* (`art-378`), and
the Benin Queen Mother head of Idia (`art-423`) falls one card after Titian's *Assumption of the
Virgin*.

**The cost is real and is stated rather than hidden.** A reader cannot study "just the sculpture" or
"just the Baroque" as a deck, because those are not decks. What they get instead is the card browser's
`tag:` search (`#browse`), which reads the tags every card carries — and the tags are therefore load-
bearing here in a way they are not in a history collection. See "Tags" below.

**What was gained is the thing the request asked for**, and it is more than a sorting convenience: a
chronological world survey is what an art history actually is. Meeting van Eyck and Masaccio in the same
years, and both of them beside the Ming court, is a claim about how the subject should be read, and it
is the claim this tree makes.

**`node .claude/test-card-plans.js` cannot check this** — it checks numbering, not chronology. What
checked it is the generator that produced the list: every line carries a year, the whole thousand was
sorted on it, and the sequence was verified to take **no backward step** across all 1000 cards. Re-run
that check by eye if you ever move a line: a line moved out of date order is a card dealt out of date
order, and nothing on the page will say so.

## The artwork card — the format this collection needs

**IT DOES NOT EXIST YET.** This plan ships the collection, its tree, its hue and its icon; the format is
specified here and must be built before `art-001`. It is a **built-in format, like the map card** — see
the MAP CARDS bullet in CLAUDE.md — and for the same reason: a community card type is templates plus
scoped CSS and cannot run code, and this needs a picture promoted to the front of the card and a licence
credit held back until the reveal.

**THE PICTURE IS THE QUESTION.** The front shows the work and asks the reader to name it and, where it
is known, its artist. The back names it, gives its date, and gives the artist, medium, size and where it
is now.

Six things are decisions rather than plumbing.

**THE CREDIT IS HELD BACK, AND THAT IS THE WHOLE DIFFICULTY.** `card.image` already carries `title`,
`desc` and `credit`, and on every other card those are drawn beside the picture. Here every one of them
answers the question — a Commons credit line routinely reads "Rembrandt, *The Night Watch*, Rijksmuseum"
— so the front draws the picture and **nothing else**, and the title, description and credit appear on
the reveal, exactly as the picture round holds its artefact's metadata back until the round is answered.
The attribution the licence requires is still given, one press away and on the same card; it is deferred,
not dropped. **Any implementation that leaks `title` or `credit` onto the front has broken the
collection**, and it will look perfectly fine while doing it, so this is what the format's own test has
to assert first.

**THE ANSWER TERM IS THE TITLE, AND THE ARTIST IS SELF-GRADED.** `gradeCloze` matches one typed string,
so a card cannot check two answers. The blank is the work's title; the question asks for the artist as
well; the reveal shows both and the reader grades themselves Again/Hard/Good/Easy, which is what the
four buttons have always been for. This is a limitation and is written down rather than papered over.
Where the work is anonymous the question asks for the work alone — that is the "if known" in the
request, and it is most of the collection before 1300.

**THE DATE GOES IN `answerDate`, AND IT IS ALSO THE SORT KEY.** One field does both jobs: the date line
prints "Painted 1642" under the answer, and `cardStartYear` reads it to file the card in chronology. Use
the date-line labels the work takes — `Painted`, `Carved`, `Cast`, `Made`, `Printed`, `Built` — never
`Found` or `Excavated`, which are facts about the modern discovery and which
`docs/history-focus-plan.md` rules out anyway. A range is written in the compact form the other
collections use (`c. 1503 – 1519`).

**THE ARTIST, MEDIUM AND LOCATION GO IN `facts`**, the map card's own field, as a short list of label /
value pairs: Artist, Date, Medium, Size, Where it is. They are facts a reader wants at the moment of the
reveal and they are not prose, so they do not eat into the abstract's ten sentences.

**THE ALT TEXT IS A REAL DESCRIPTION, AND IT NEVER NAMES THE WORK.** This format is more accessible than
the map card, not less: a shape on a globe cannot be described without answering the question, but a
painting can — "a company of militia in seventeenth-century dress crowding out of an arch into shadow"
is a fair question for a reader who cannot see it, and a fair alternative for one who can. So the rule
is **describe, never name**: no title, no artist, no gallery in the alt text. The held-back title and
description carry those.

**AN ARTWORK CARD IS OUT OF THE MINIGAMES BY CONSTRUCTION**, as a map card is: the games deal a question
cold, and this question is a picture. The exclusion belongs in `gameCardIdSet` beside `cardMapSpec` and
needs no editorial judgement per card, so it needs no field. A card in this collection that has **no**
picture (see the next section) is an ordinary cloze card and stays in the pool.

**And `undatable` is never set here.** Every work has a date — that is the collection's organising fact —
so nothing in it should be kept out of Timeline.

## Copyright — the constraint that shapes the last two decks

**Folio links pictures, it does not host them, and the bar is public domain, CC BY or CC BY-SA** (see the
picture rule in CLAUDE.md). Wikimedia Commons hosts a file only where it is free **in the United States
and in the country of origin**, and there is no fair-use route on this site. So:

- **Before about 1900 the pictures are there.** A faithful photograph of a two-dimensional public-domain
  work is itself public domain, and Commons has the canon in high resolution.
- **Between about 1900 and 1945 it is mixed**, and it has to be checked work by work. Klimt, Munch,
  Schiele and Kandinsky are clear; Picasso (d. 1973), Kahlo (d. 1954), Hopper and Pollock are not.
- **After about 1945 almost nothing can be shown.** *Guernica*, *Nighthawks*, *Marilyn Diptych*, *Spiral
  Jetty* — every one of them is in copyright and none of them can carry a picture here.

**A CARD THAT CANNOT SHOW ITS WORK IS AN ORDINARY CARD AND SAYS SO.** It is written as a normal curated
card: a cloze question that describes the work in words, an abstract, a date line, citations. It loses
the format and keeps the collection. **Do not go looking for a smaller "fair use" thumbnail** and do not
narrow the canon to what happens to be free — a thousand famous artworks that omits *Guernica* is a false
canon, and a Guernica card with no picture is an honest one.

**The rough size of it, stated as an estimate rather than a count:** of deck 9's 142 cards, expect
something like two-thirds to ship without a picture, and a handful of deck 8's late cards too. That is
also an argument the running order already acts on — deck 9 carries proportionally more movement and
technique cards than any other, because a movement can be asked in words.

**CHECK COMMONS BEFORE WRITING A POST-1900 CARD**, not after. If the work is not there, the card is a
text card, and the commit message says which and why.

## Making the collection

**The collection does not exist yet and this plan creates it** — the node, its tree, its `COLL_THEME`
hue, its `COLLECTION_ICON` row and its section all ship with the file.

**The id is `art` and the card prefix is `art-`**, free of every existing prefix and no prefix of any of
them. The deck ids are also `art-…`, which is the pattern `bio` and `dino` use.

**IT GETS A SECTION OF ITS OWN, "The Arts", and that is a decision about the future rather than about
this collection.** The request says music, architecture, theatre and literature "may get their own
collections later", and each of those is an art rather than a science, a geography or a history. A
heading rather than a collection is what `COLLECTION_SECTIONS` is for — it is why Geography and Science
are headings — so the second arts collection costs a row in `COLLECTION_SECTION` and nothing else. The
section draws nothing until this collection has a card, on the rule `sectionOf` already follows, and it
answers to the **Other** tab of the Collections page's tab bar, beside Science and Philosophy, which is
exactly the "a third non-history section joins them by adding a row here" the tab table's own comment
describes.

**The collection is called *Visual Art* and not *Art***, so that it does not read as the parent of the
music and architecture collections that may sit beside it under the same heading. It is also what the
request itself says: visual arts, and not music, architecture, theatre or literature.

**The hue is `#66333F`, a deep oxblood** — the red of a picture gallery's wall, which is the one colour
convention this subject actually has — and it is MEASURED, like every hue on the shelf. Against all
twenty-five hues (the eighteen curated collections and the seven language decks) it stands **21.8 from
its nearest neighbour**, the Second World War's dark iron, with the Indonesian deck's red at the same
distance and Japan's kuwazome at 22.3. The tightest pair already shipped is **12.9** (China's vermilion
against Russia's lacquer) and the shelf's median nearest-neighbour distance is **20.0** across all
twenty-five and 23.3 across the curated eighteen — so this clears the median of the shelf a reader
actually sees and is nearly double the bar the house has accepted in practice. It sits at **L 28, chroma
24**, the dark and muted corner of the shelf's own band, and reads **10.0:1 against white**, the highest
contrast on the shelf beside Biology's.

**THE MAGENTA WAS MEASURED AND REJECTED FOR THE SEVENTH TIME.** The whole-wheel optimum is again
`#C65AB4` at 31.5, and it is again the loudest thing that could go on a shelf whose register is muted
throughout. The olive-brass beside it (22.0) is again a fourth or fifth member of the
yellow-green-brown quarter. The standing note in `COLL_THEME` is right and this sweep adds nothing to
it: **stop measuring the magenta.**

**The icon is the existing `brush` symbol, and that is a deliberate reuse rather than a new drawing.**
Every collection before this drew its own mark, and every one of those was checked by eye at the 24–28px
a deck row draws it at — which is the one thing that cannot be done from a cloud session with no
browser. `brush` is already drawn, already in `ICON_SYMBOLS` for readers to pick, and says the subject.
Its cost is stated: **a brush is a painting mark on a collection that also carries sculpture**, and a
palette or a frame would be more inclusive. Both were considered and neither is worth shipping unlooked
at — a palette is a blob with three holes in it at 28px, which is the exact failure the owl and the
sauropod each took several drafts to avoid. **If the mark is to change, draw it and look at it.**

## Allocation

| Deck | Subdeck | Cards | Range |
|---|---|---|---|
| Before History, to 700 BCE | Ice Age art, before 10,000 BCE | 20 | art-001–020 |
|  | The first villages, 10,000–3000 BCE | 17 | art-021–037 |
|  | The Bronze Age, 3000–1500 BCE | 23 | art-038–060 |
|  | Empires and the early Iron Age, 1500–700 BCE | 20 | art-061–080 |
| The Classical World, 700 BCE–500 CE | The Greek awakening, 700–480 BCE | 16 | art-081–096 |
|  | Classical Greece, 480–330 BCE | 24 | art-097–120 |
|  | The Hellenistic world, 330–30 BCE | 22 | art-121–142 |
|  | Rome and the first centuries, 30 BCE–200 CE | 17 | art-143–159 |
|  | Late antiquity, 200–500 CE | 15 | art-160–174 |
| Medieval Worlds, 500–1300 | The sixth to eighth centuries, 500–800 | 26 | art-175–200 |
|  | The ninth to eleventh centuries, 800–1050 | 24 | art-201–224 |
|  | Romanesque and Song, 1050–1150 | 19 | art-225–243 |
|  | Gothic and the thirteenth century, 1150–1300 | 35 | art-244–278 |
| The Fourteenth and Fifteenth Centuries | 1300–1350 | 25 | art-279–303 |
|  | 1350–1400 | 14 | art-304–317 |
|  | 1400–1440 | 29 | art-318–346 |
|  | 1440–1470 | 21 | art-347–367 |
|  | 1470–1500 | 27 | art-368–394 |
| The Sixteenth Century | 1500–1520 | 28 | art-395–422 |
|  | 1520–1550 | 29 | art-423–451 |
|  | 1550–1580 | 24 | art-452–475 |
|  | 1580–1600 | 21 | art-476–496 |
| The Baroque World, 1600–1750 | 1600–1630 | 37 | art-497–533 |
|  | 1630–1660 | 38 | art-534–571 |
|  | 1660–1700 | 21 | art-572–592 |
|  | 1700–1750 | 23 | art-593–615 |
| Revolution and Romance, 1750–1860 | 1750–1790 | 35 | art-616–650 |
|  | 1790–1820 | 29 | art-651–679 |
|  | 1820–1840 | 23 | art-680–702 |
|  | 1840–1860 | 23 | art-703–725 |
| The Modern Age, 1860–1914 | 1860–1875 | 27 | art-726–752 |
|  | 1875–1885 | 31 | art-753–783 |
|  | 1885–1900 | 41 | art-784–824 |
|  | 1900–1914 | 34 | art-825–858 |
| The Twentieth Century and After, 1914 to now | 1914–1930 | 31 | art-859–889 |
|  | 1930–1945 | 30 | art-890–919 |
|  | 1945–1960 | 29 | art-920–948 |
|  | 1960–1980 | 28 | art-949–976 |
|  | 1980 to now | 24 | art-977–1000 |

Deck totals: Before History 80 · The Classical World 94 · Medieval Worlds 104 · The Fourteenth and
Fifteenth Centuries 116 · The Sixteenth Century 102 · The Baroque World 119 · Revolution and Romance
110 · The Modern Age 133 · The Twentieth Century and After 142. **1000.**

## What the weighting is arguing

**The slice sizes are not chosen; they are counted.** Every deck and subdeck here is a date range, so a
subdeck holds however many of the thousand fall inside its years — the running order was written as one
chronological sequence and then cut at the boundaries. That is why the counts are uneven (14 in
1350–1400, 41 in 1885–1900) where every other plan on the shelf has round numbers. What WAS chosen is
the thousand subjects and the boundaries; the arithmetic followed.

**394 cards fall before 1500 and 275 after 1860.** Those are the two halves worth defending. A canon of
"the most famous artworks" drawn from a general audience would put far more than 275 after 1860 and
almost nothing before 1300; a canon of "the most significant" would do close to the reverse. This sits
between them, and the reason is the collection's own subject: it is the visual art of the world, and the
world had been making it for forty thousand years before Giotto.

**The Modern Age (1860–1914) is the largest deck at 133**, which is the one place fame is allowed to
win. It is the period a general reader can already half-name — Impressionism, van Gogh, Munch, Cubism —
and the period in which what a picture is FOR was argued out, so the cards do double duty.

**The Twentieth Century and After takes 142 and carries proportionally more movement cards than any
other deck**, which is the copyright section above showing up in the allocation rather than as an
apology: after 1945 the works mostly cannot be shown, and a movement can be asked in words.

**Non-European art is about a fifth of the collection and is not a deck.** China, Japan, India, Persia,
the Islamic world, West Africa, Mesoamerica and the Andes appear inside every slice from the Bronze Age
onward, in their own years. That is the timeline doing something a regional deck could not: it puts the
Song landscape beside the Romanesque tympanum, where the reader can see they are contemporaries.

**Photography takes about twenty cards and enters at 1839.** It is a visual art, it is not music,
architecture, theatre or literature, and after Daguerre no account of what painting was doing makes
sense without it. It is deliberately a thin thread rather than a strand: this is not a history of
photography, and a photography collection is one of the siblings "The Arts" was made a heading for.

## Six decisions this plan forced on the tree

**One: nine decks of dates, and no other kind of deck.** Argued above under "The collection is a
timeline". Everything else in this list follows from it.

**Two: the boundaries are art-historical, not round.** 700 BCE, 480 BCE, 1300, 1500, 1600, 1750, 1860
and 1914 are the joints the subject itself has; 1050, 1440 and 1885 are there to keep a slice from
becoming unreadably long. The subdeck titles print the years, so a reader always knows where they are.

**Three: Greek art starts a deck rather than ending one.** Deck 1 stops at 700 BCE so that the Archaic
kouros, the Classical bronze and the Hellenistic marble sit in one deck instead of being split by a
round number. The cost is that Assyria, Egypt's late periods and Zhou China finish deck 1 rather than
opening deck 2, which is the right way round: they belong with the Bronze Age they grew out of.

**Four: "Before History" ends where writing does not.** The deck is named for the reader's sense of the
word rather than for a literacy boundary — it holds Sumer and Egypt, which are not prehistoric at all.
`docs/history-focus-plan.md`'s rule still applies inside it: these cards are about the objects and the
people who made them, not about the archaeologists who found them.

**Five: the two nineteenth-century decks split at 1860, not at 1800 or 1900.** *Revolution and Romance*
runs David to Courbet; *The Modern Age* opens on Manet. The line is where the Salon stops being the only
place a picture can be seen, which is the change that makes everything after it legible.

**Six: 1980 to now is a short deck (24) and ends where the record thins.** The last cards are recent
enough that "most famous and significant" is a guess rather than a judgement. Twenty-four is the honest
number; the plan does not pretend the next twenty years are already sorted, and the line for `art-995`
says so by carding the biennial and the art fair rather than a work.

## What counts as visual art here

**In:** painting in every medium, sculpture, drawing, printmaking, mosaic, fresco, illuminated
manuscript and calligraphy where it is treated as an art rather than as a text, photography from 1839,
and the ceramics, metalwork, ivory, jade and textile that a culture's own art history treats as its major
art (Shang bronzes, Ru ware, Benin brass, the Bayeux Tapestry).

**Out, and each for a stated reason:** **architecture**, which the request excludes and which will
support a collection of its own — a building appears here only where the card is about the *images on
it* (the Parthenon frieze, the Chartres portal, the Sistine ceiling), never about the building.
**Music, theatre and literature**, likewise excluded and likewise better served on their own.
**Film**, which is theatre's neighbour rather than painting's. **Performance and video**, admitted only
where art history treats the artist as a visual artist and the work as an object of the museum — Paik,
Abramović, Ono and Viola — which is four cards in a thousand, deliberately.

**A building's decoration is carded as the decoration**, so the answer term is *the Parthenon frieze* and
not *the Parthenon*; and where a monument is nothing but its sculpture (Trajan's Column, the Great
Sphinx) the whole thing is the work.

## Names, titles and dates

**A work takes the English title it is known by**, which is the title the reader will meet in a gallery
and in the sources: *The Night Watch*, not *De Nachtwacht*; *Las Meninas*, not *The Maids of Honour*.
Where the untranslated title is the one in use, it stays untranslated. Where a work has two names in
common use, the alternative goes in the glossary term's aliases, so the cloze accepts the answer a reader
is likely to type. **Titles are italicised in prose** (`<i>`), like every other work title on the site,
and not in the answer term, the `answerText` or the glossary key.

**Most titles are not the artist's.** *The Night Watch*, *The Arnolfini Portrait* and the *Venus de Milo*
were all named by other people, sometimes centuries later, and several are wrong about what they
describe. Where the name is a museum's invention or a mistake, the card's abstract says so — it is one of
the most reliably interesting sentences this collection can write.

**An anonymous work is anonymous.** Do not attribute one to a workshop, a school or a "circle of" that
the sources hedge; the date line and the facts box carry "Unknown" and the abstract says what is actually
argued. Attribution is the discipline's own live controversy and the collection should show it rather
than tidy it away.

**Dates follow the same conventions as the rest of the site** — BCE and CE, never BC or AD, and centuries
in numerals ("15th century"). A date that is a range is written as one and the earlier end sorts the
card; `cardStartYear` reads the compact deep-time and BCE forms, so `c. 2600 BCE` and `c. 1503 – 1519`
both work. Read the sort year back after writing a date line (the trap is in CLAUDE.md's date-line
bullet: an era marker only reaches the year it follows, and a `c.` inside a range breaks the leftward
carry).

## Tags, difficulty and the glossary

**TAGS MATTER MORE HERE THAN IN ANY OTHER COLLECTION**, because the tree carries only chronology. A
reader who wants the sculpture, the prints, the Dutch or the Impressionists has the card browser and
nothing else, so every card is tagged in the house vocabulary and in this order: the KIND (`painting`,
`sculpture`, `print`, `drawing`, `mosaic`, `fresco`, `manuscript`, `photograph`, `object`, `style`), then
the subject areas (`art`, plus `history`, `religion`, `politics` where they apply), then the specifics —
the movement (`impressionism`, `baroque`, `ukiyo-e`), the place (`italy`, `japan`, `nigeria`) and the
material (`bronze`, `marble`, `oil`, `tempera`). **Reuse the vocabulary the glossary already has**;
`GLOSSARY_TAGS` is the list to check before coining a word.

**Difficulty rates the ANSWER TERM's fame, as everywhere else** — how well known the title is to the
general population, not how hard the card is. *Mona Lisa* is a 1, *The Night Watch* a 2, *The Ambassadors*
a 3, *The Portinari Altarpiece* a 4, *The Bimaran Casket* a 5. The scale is unusually easy to apply here
and unusually easy to get wrong in one specific way: **a famous artist is not a famous work.** Everyone
knows Titian; almost nobody outside the subject can name *The Flaying of Marsyas*, and that card is a 4.

**Every card ships with a glossary term for its own answer, cited at the bar**, which is the standing
pairing rule. Three things about it are particular to this collection.

**The key is the Wikipedia slug and the slug is usually disambiguated already** — `David_(Michelangelo)`,
`Guernica_(Picasso)`, `The_Kiss_(Klimt)` — and a parenthetical key claims no bare name, which is exactly
what is wanted: `Guernica` is a town, `David` is a name, `The Kiss` is three different works. **Add a bare
alias only where the bare name genuinely belongs to the work**, and never for a title that is an ordinary
English phrase.

**A title under three characters cannot auto-link at all** (`buildGlossIndex` skips short surfaces), and a
one-word title that is also an ordinary word needs `caseSensitive` or a narrower alias, on the rule
`Boreal` established.

**An ARTIST is a glossary term too, and is written once.** The first card that needs Rembrandt writes
`Rembrandt`; the eight later Rembrandt cards reuse it. **Check whether the term exists before running
`add-glossary.js`, which overwrites in silence** — this collection will meet that trap more than any
other, because forty artists have several works each.

## Sourcing

The bar is the site's: at least five citations a card, each with an openable URL, each pointed at by a
marker, and never a Wikipedia article. What is different here is that the best sources are **museums**,
and museums publish well.

**Reachability, measured rather than assumed, is a job for the session that writes the first batch** —
the surveys in `docs/artefact-expansion-plan.md` and `docs/artefact-citation-plan.md` already cover many
of the same hosts and should be read first. What those two record and this collection will lean on: a
museum's own object page is a citable, stable record of what it holds; `metmuseum.org`, `nga.gov`,
`rijksmuseum.nl` and `britishmuseum.org` publish per-object pages with provenance and dimensions;
`whc.unesco.org` is 403 from this sandbox; `jstor.org` and `muse.jhu.edu` serve 200-status challenge
pages rather than articles; and a paper walled at its publisher is often open at its Europe PMC or
repository copy.

**Three source families this collection needs and the others did not.** A **catalogue raisonné** is the
authority on attribution, date and dimensions, and several are online. A **museum's own conservation or
technical report** is the authority on what a work is made of and what has been done to it — the
Rijksmuseum's Operation Night Watch and the National Gallery's technical bulletins are open. And an
**exhibition catalogue** is often the only synthesis of a non-Western field in English, which matters
most for exactly the cards where a single loose sentence would do the most damage.

**The attribution and the date are the two claims to source hardest.** Both move: works are reattributed,
and a card that states a date flatly where the sources give a range is the commonest error this
collection can make. Say what the sources say, and hedge in the prose where they disagree.

## Living beside the other collections

**This collection shares subjects with six others and the overlaps are deliberate.** Ancient Greece,
Ancient Rome, Ancient Egypt, China, Japan and World History all card objects that appear here, and
Psychology and Biology do not.

**The rule is that a shared subject is written from a different question.** `gr-` cards ask what a work
tells us about Greece; these ask what the work is and who made it. Where a card here and a card there
would be the same card, this one takes the object and the other takes the history — and where both
already exist, the two must not share a picture, because `check-cards.js` fails a picture used on two
cards, deliberately.

**A STYLE CARD'S ILLUSTRATION MUST BE A WORK THAT HAS NO CARD OF ITS OWN**, for that same reason and for
a better one: showing *The Great Wave* on the "Japanese woodblock print" card and again on its own card
teaches the reader that the two questions have the same answer. Pick the second-best example — there are
always several — and say in the caption what it is.

**The glossary is the shared surface and it is where the saving is.** Many of the terms this collection
needs already exist: `Fresco`, `Bronze`, `Marble`, `Mosaic`, `Terracotta`, `Icon` and a dozen period
names were written for other collections and must be reused rather than re-keyed. Run
`node .claude/gloss-source-audit.js` and grep before writing a term.

**And it is the first collection whose cards will routinely auto-link into other collections' prose.**
`Impressionism`, `Cubism`, `Baroque` and `Renaissance` occur in card backgrounds all over the site, so a
new term here changes what a reader meets on a card written two years ago. `node
.claude/check-gloss-links.js` is the report that catches a link pointing at the wrong sense.

## The batch log

**BATCH 1 — `art-001` to `art-010` (Sep 2026), the first cards written, and the format built with them.**
Five findings, and the first three changed the plan.

**THE SULAWESI DATES HAVE MOVED TWICE SINCE THIS PLAN WAS WRITTEN, AND BOTH LINES WERE RESEARCHED IN THE
WRONG ORDER.** The Leang Bulu' Sipong 4 hunting scene was published in 2019 at a minimum of 43,900 years
and re-dated in 2024, by laser-ablation U-series, to about 50,200 — so it is OLDER than the Leang
Tedongnge pig (45,500), not younger, and `art-004` and `art-005` were swapped before either was written.
The same 2024 paper dates a scene at Leang Karampuang to at least 51,200 years, and a 2026 paper puts a
hand stencil on Muna Island at a minimum of 67,800, which is now the oldest demonstrated age for cave art
anywhere. **A future batch should find `art-011`–`art-020` room for Leang Karampuang and Liang
Metanduno**; both are more significant than several lines standing in that slice.

**AND `art-008` MOVED WITH THEM**: Chauvet's first phase of drawing is 37,000–33,500 years ago, which is
older than the Venus of Hohle Fels and the Vogelherd horse at about 35,000, so the cave was written
before them rather than after. The rule that produced all three swaps is the one this plan opens with —
**a line's year is a sort key, and the sort is what the running order is FOR** — and the swaps were free
only because no card had shipped. After a card exists its number is a permanent address and the drift
stays.

**THE ICE AGE LINES ARE DATED IN YEARS AGO, NOT BCE, WHEREVER A SOURCE GIVES A MINIMUM AGE.** The lines
in this deck were drafted "c. 45,500 BCE" and the sources say "at least 45,500 years ago", which is a
different number and a different KIND of number — a floor rather than a date. The ten written here were
corrected as they were written; **the rest of `art-iceage` and `art-neolithic` still carry the BCE
spelling and each should be corrected as its card is researched.** At these depths the two differ by
2,000 years and the ordering is unaffected, which is why they were left rather than swept.

**FOUR OF THE TEN CARRY NO `artwork` FLAG, AND ONLY ONE OF THE FOUR IS FOR THE REASON THE PLAN
EXPECTED.** The copyright section above predicts picture-less cards after about 1900; the first four came
90,000 years earlier. `art-002` and `art-001` are a method and a material rather than a work, so their
pictures illustrate rather than depict and the flag would be a lie. But `art-003` (the Blombos engraved
ochres) and `art-004` (the Leang Bulu' Sipong 4 panel) are works with no free photograph in existence:
the published images belong to the excavators and their journals, and Wikimedia Commons has nothing of
either. **A famous work can be unshowable for want of a photographer as easily as for copyright**, and
the answer is the same one the plan already gives — an ordinary cloze card, and say so.

**AND A REPLICA CAN CARRY AN ARTWORK CARD, DISCLOSED ON BOTH CHANNELS.** `art-008`'s picture is a
full-size museum copy of the Chauvet lion panel, because every photograph of the cave itself is reserved;
the caption says so at the reveal and **the alt text says so on the front**, so the one reader who meets
the picture only in words is not told less than the reader who can see it. The rule against a cast
standing in for an object is about passing one off; disclosing it in both places is what makes this
allowed rather than an exception.

# The list

## Before History, to 700 BCE — `art-early`

### Ice Age art, before 10,000 BCE — `art-iceage`

    art-001  Ochre, and the Blombos processing kit — South Africa, c. 100,000 years ago
    art-002  How the earliest art is dated, and what counts as art at all — uranium-series dating
    art-003  Blombos Cave and its engraved ochres — South Africa, c. 77,000 years ago
    art-004  The Leang Bulu' Sipong 4 hunting scene — Sulawesi, c. 50,200 years ago
    art-005  The Leang Tedongnge warty pig — Sulawesi, c. 45,500 years ago
    art-006  The El Castillo hand stencils — Spain, c. 40,800 years ago
    art-007  The Lion-man of Hohlenstein-Stadel — Swabia, c. 40,000 years ago
    art-008  Chauvet Cave — France, c. 37,000 years ago
    art-009  The Venus of Hohle Fels — Swabia, c. 35,000 years ago
    art-010  The Vogelherd horse — Swabia, c. 35,000 years ago
    art-011  The Venus of Dolní Věstonice — Moravia, c. 26,000 BCE
    art-012  The Apollo 11 stones — Namibia, c. 25,500 BCE
    art-013  The Venus of Willendorf — Austria, c. 25,000 BCE
    art-014  The Pech Merle spotted horses — France, c. 25,000 BCE
    art-015  Parietal art — the techniques of the painted cave, c. 25,000 BCE
    art-016  Mobiliary art — the carved and portable Ice Age object, c. 25,000 BCE
    art-017  Lascaux — France, c. 17,000 BCE
    art-018  Altamira — Spain, c. 15,000 BCE
    art-019  Bison Licking an Insect Bite — La Madeleine, c. 15,000 BCE
    art-020  The Swimming Reindeer — Montastruc, c. 13,000 BCE

### The first villages, 10,000–3000 BCE — `art-neolithic`

    art-021  Jōmon pottery — Japan, from c. 10,500 BCE
    art-022  The Shigir Idol — the Urals, c. 9600 BCE
    art-023  The Göbekli Tepe pillars — Anatolia, c. 9500 BCE
    art-024  The Bhimbetka rock shelters — India, c. 8000 BCE onward
    art-025  The Cueva de las Manos hand stencils — Argentina, c. 7300 BCE
    art-026  The Ain Ghazal statues — Jordan, c. 7200 BCE
    art-027  The Jericho plastered skulls — the Levant, c. 7000 BCE
    art-028  The Seated Woman of Çatalhöyük — Anatolia, c. 6000 BCE
    art-029  Neolithic art — what settled life did to images, c. 6,000 BCE
    art-030  The Tassili n'Ajjer rock paintings — the Sahara, c. 6000 BCE
    art-031  The Thinker of Cernavodă — Romania, c. 5000 BCE
    art-032  The Varna gold burial — Bulgaria, c. 4500 BCE
    art-033  The Yangshao painted pottery basins — China, c. 4000 BCE
    art-034  Megalithic art and the Newgrange entrance stone — Ireland, c. 3200 BCE
    art-035  The Gwion Gwion rock paintings — Australia, dating disputed, c. 3,200 BCE
    art-036  Ceramic — how a fired clay vessel became a picture surface, c. 3,200 BCE
    art-037  The Uruk Vase — Mesopotamia, c. 3200 BCE

### The Bronze Age, 3000–1500 BCE — `art-bronze`

    art-038  The Narmer Palette — Egypt, c. 3100 BCE
    art-039  Egyptian art — the conventions that held for three thousand years, c. 3,100 BCE
    art-040  The Guennol Lioness — Mesopotamia, c. 3000 BCE
    art-041  The Cycladic figurines — the Aegean, c. 2800 BCE
    art-042  Cuneiform and the image — Mesopotamian relief before empire, c. 2,800 BCE
    art-043  The Standard of Ur — Sumer, c. 2600 BCE
    art-044  The Ram in a Thicket — Ur, c. 2600 BCE
    art-045  The Khafre Enthroned statue — Egypt, c. 2570 BCE
    art-046  The Bull-Headed Lyre of Ur — Sumer, c. 2550 BCE
    art-047  The Great Sphinx of Giza — Egypt, c. 2500 BCE
    art-048  Menkaure and His Queen — Egypt, c. 2490 BCE
    art-049  The Seated Scribe — Saqqara, c. 2450 BCE
    art-050  The Mastaba of Ti reliefs — Saqqara, c. 2400 BCE
    art-051  The Indus Valley Dancing Girl — Mohenjo-daro, c. 2300 BCE
    art-052  The Mask of Sargon — Nineveh, c. 2250 BCE
    art-053  The Victory Stele of Naram-Sin — Akkad, c. 2250 BCE
    art-054  The Gudea statues — Lagash, c. 2100 BCE
    art-055  The Indus Priest-King — Mohenjo-daro, c. 2000 BCE
    art-056  The Stele of Hammurabi — Babylon, c. 1750 BCE
    art-057  The Snake Goddess figurines — Knossos, c. 1600 BCE
    art-058  The Akrotiri frescoes — Thera, c. 1600 BCE
    art-059  The Nebra Sky Disc — Germany, c. 1600 BCE
    art-060  The Mask of Agamemnon — Mycenae, c. 1550 BCE

### Empires and the early Iron Age, 1500–700 BCE — `art-lbronze`

    art-061  The Minoan Bull-Leaping Fresco — Knossos, c. 1500 BCE
    art-062  The Vaphio Cups — Laconia, c. 1500 BCE
    art-063  The Nebamun tomb paintings — Egypt, c. 1350 BCE
    art-064  The Amarna style — Egypt, c. 1350 BCE
    art-065  The Bust of Nefertiti — Amarna, c. 1345 BCE
    art-066  The Mask of Tutankhamun — Egypt, c. 1323 BCE
    art-067  The Book of the Dead of Hunefer — Egypt, c. 1275 BCE
    art-068  The Abu Simbel colossi — Egypt, c. 1264 BCE
    art-069  The Lion Gate — Mycenae, c. 1250 BCE
    art-070  The Shang bronze ritual vessels — China, c. 1200 BCE
    art-071  The Olmec colossal heads — Mexico, c. 1200 BCE
    art-072  The Sanxingdui bronze masks and standing figure — China, c. 1200 BCE
    art-073  The Las Limas Monument 1 — Olmec Mexico, c. 900 BCE
    art-074  The Chavín Lanzón — Peru, c. 900 BCE
    art-075  The Nok terracottas — Nigeria, from c. 900 BCE
    art-076  The Assyrian palace reliefs — Nimrud, c. 870 BCE
    art-077  The Black Obelisk of Shalmaneser III — Assyria, c. 825 BCE
    art-078  Geometric pottery and the Dipylon Amphora — Athens, c. 750 BCE
    art-079  The lamassu of Khorsabad — Assyria, c. 715 BCE
    art-080  The Nimrud ivories — Assyria, 9th–8th century BCE, c. 715 BCE

## The Classical World, 700 BCE–500 CE — `art-classic`

### The Greek awakening, 700–480 BCE — `art-archaic`

    art-081  Orientalising Greek art — the Near East in the seventh century, c. 700 BCE
    art-082  The Lady of Auxerre — Crete, c. 640 BCE
    art-083  The Chigi Vase — Corinth, c. 640 BCE
    art-084  The New York Kouros — Attica, c. 590 BCE
    art-085  The kouros and the kore — the Archaic Greek figure, c. 590 BCE
    art-086  The François Vase — Kleitias and Ergotimos, c. 570 BCE
    art-087  Black-figure vase painting — the technique, c. 570 BCE
    art-088  The Peplos Kore — Athens, c. 530 BCE
    art-089  Exekias's Achilles and Ajax Playing a Game — c. 530 BCE
    art-090  The Anavysos Kouros — Attica, c. 530 BCE
    art-091  The Siphnian Treasury frieze — Delphi, c. 525 BCE
    art-092  Red-figure vase painting — the reversal, c. 525 BCE
    art-093  The Etruscan Sarcophagus of the Spouses — Cerveteri, c. 520 BCE
    art-094  The Euphronios Krater — Athens, c. 515 BCE
    art-095  The Apollo of Veii — Etruria, c. 510 BCE
    art-096  The Persepolis Apadana reliefs — Persia, c. 500 BCE

### Classical Greece, 480–330 BCE — `art-classical`

    art-097  The Tomb of the Diver — Paestum, c. 480 BCE
    art-098  The Kritios Boy — Athens, c. 480 BCE
    art-099  Contrapposto — the discovery of weight in a standing figure, c. 480 BCE
    art-100  The Tyrannicides of Kritios and Nesiotes — Athens, 477 BCE
    art-101  The Charioteer of Delphi — c. 470 BCE
    art-102  The Riace Bronzes — c. 460 BCE
    art-103  The Artemision Bronze — c. 460 BCE
    art-104  The Olympia pediments and the Temple of Zeus — c. 460 BCE
    art-105  Polykleitos's Doryphoros and the Canon — c. 440 BCE
    art-106  The Parthenon frieze — Athens, c. 440 BCE
    art-107  White-ground lekythoi — Athenian funerary painting, c. 440 BCE
    art-108  Phidias's Athena Parthenos — Athens, c. 438 BCE
    art-109  The Phidias workshop and the chryselephantine statue, c. 438 BCE
    art-110  The Elgin Marbles — a work and the argument over where it belongs, c. 438 BCE
    art-111  The Parthenon pediments — Athens, c. 435 BCE
    art-112  The Nike of Paionios — Olympia, c. 420 BCE
    art-113  The Erechtheion Caryatids — Athens, c. 415 BCE
    art-114  Nike Adjusting Her Sandal — the Athena Nike parapet, c. 410 BCE
    art-115  The Grave Stele of Hegeso — Athens, c. 410 BCE
    art-116  The Nereid Monument — Xanthos, c. 390 BCE
    art-117  The Mausoleum at Halicarnassus sculptures — c. 353 BCE
    art-118  Praxiteles's Aphrodite of Knidos — c. 350 BCE
    art-119  Praxiteles's Hermes and the Infant Dionysus — c. 340 BCE
    art-120  The Tomb of Philip II paintings — Vergina, c. 336 BCE

### The Hellenistic world, 330–30 BCE — `art-hellenistic`

    art-121  The Apoxyomenos of Lysippos — c. 330 BCE
    art-122  Hellenistic art — what changed after Alexander, c. 323 BCE
    art-123  The Alexander Sarcophagus — Sidon, c. 320 BCE
    art-124  The Ashokan lion capital at Sarnath — India, c. 250 BCE
    art-125  The Dying Gaul — a Roman copy of a Pergamene bronze, c. 230 BCE
    art-126  The Ludovisi Gaul — c. 220 BCE
    art-127  The Barberini Faun — c. 220 BCE
    art-128  The Terracotta Army — Xi'an, c. 210 BCE
    art-129  The Nike of Samothrace — c. 190 BCE
    art-130  The Mawangdui silk banner — Han China, c. 168 BCE
    art-131  The Pergamon Altar frieze — c. 165 BCE
    art-132  The Farnese Bull — c. 150 BCE
    art-133  The Ai-Khanoum finds and Greek art in Central Asia — c. 145 BCE
    art-134  The Venus de Milo — c. 130 BCE
    art-135  The Boxer at Rest — c. 100 BCE
    art-136  The Old Drunkard and the Hellenistic taste for the unbeautiful, c. 100 BCE
    art-137  The Alexander Mosaic — Pompeii, c. 100 BCE
    art-138  The Great Stupa at Sanchi gateways — India, c. 50 BCE
    art-139  The Fayum and the Roman republican portrait head — c. 50 BCE
    art-140  The Villa of the Mysteries frieze — Pompeii, c. 50 BCE
    art-141  The Pompeian styles of wall painting, c. 50 BCE
    art-142  The Laocoön and His Sons — c. 40 BCE

### Rome and the first centuries, 30 BCE–200 CE — `art-rome`

    art-143  The Augustus of Prima Porta — c. 20 BCE
    art-144  The Garden Room of the Villa of Livia — c. 20 BCE
    art-145  The Ara Pacis reliefs — Rome, 13–9 BCE
    art-146  The Gemma Augustea — c. 10 CE
    art-147  Roman art — copy, portrait and the uses of Greek style, c. 10 CE
    art-148  The Portland Vase — Rome, c. 15 CE
    art-149  The Fayum mummy portraits — Egypt, from c. 50 CE
    art-150  The Bimaran Casket — Gandhara, c. 50 CE
    art-151  The Arch of Titus reliefs — Rome, c. 81 CE
    art-152  The Moche portrait vessels — Peru, c. 100 CE
    art-153  The Nazca Lines — Peru, c. 100 CE
    art-154  Trajan's Column — Rome, 113 CE
    art-155  The Kushan Kanishka statue — India, c. 130 CE
    art-156  The Gandhara Buddha and the first images of the Buddha — c. 150 CE
    art-157  The Mathura Buddha — India, c. 150 CE
    art-158  The Palmyrene funerary busts — Syria, c. 150 CE
    art-159  The Equestrian Statue of Marcus Aurelius — c. 175 CE

### Late antiquity, 200–500 CE — `art-lateantique`

    art-160  The Teotihuacan murals — Mexico, c. 200 CE
    art-161  The Dura-Europos synagogue paintings — Syria, c. 245 CE
    art-162  The Ludovisi Battle Sarcophagus — Rome, c. 250 CE
    art-163  The portrait of the Four Tetrarchs — c. 300 CE
    art-164  The catacomb painting of the Good Shepherd — Rome, c. 300 CE
    art-165  The Colossus of Constantine — Rome, c. 315 CE
    art-166  The Arch of Constantine and the reused relief — 315 CE
    art-167  The Sarcophagus of Junius Bassus — Rome, 359 CE
    art-168  The Admonitions Scroll — attributed to Gu Kaizhi, c. 400 CE
    art-169  The Mausoleum of Galla Placidia mosaics — Ravenna, c. 430 CE
    art-170  The Santa Maria Maggiore mosaics — Rome, c. 435 CE
    art-171  The Yungang colossal Buddhas — China, c. 460 CE
    art-172  The Ajanta Cave paintings — India, c. 475 CE
    art-173  The Gupta Sarnath Buddha — India, c. 475 CE
    art-174  The Longmen Grottoes — China, from 493 CE

## Medieval Worlds, 500–1300 — `art-medieval`

### The sixth to eighth centuries, 500–800 — `art-500`

    art-175  The Dunhuang cave paintings — China, from c. 500
    art-176  The Barberini Ivory — Constantinople, c. 525
    art-177  The Hagia Sophia and the Byzantine image — 537
    art-178  The Ravenna mosaics of San Vitale — 547
    art-179  Justinian and His Attendants — San Vitale, 547
    art-180  Theodora and Her Attendants — San Vitale, 547
    art-181  Xie He's Six Principles and the Chinese theory of painting — c. 550 CE
    art-182  The Christ Pantocrator of Sinai — c. 550
    art-183  The icon — what it is and what it claims, c. 550 CE
    art-184  The Rabbula Gospels — Syria, 586
    art-185  The Hōryū-ji Shaka triad — Japan, 623
    art-186  The Sutton Hoo shoulder-clasps and purse lid — England, c. 625
    art-187  Insular art and the interlace, c. 625 CE
    art-188  The Mamallapuram Descent of the Ganges — India, c. 650
    art-189  The Book of Durrow — c. 680
    art-190  The Palenque Pakal sarcophagus lid — Mexico, 683
    art-191  The Dome of the Rock mosaics — Jerusalem, 691
    art-192  Aniconism and the ornament of early Islamic art, c. 691 CE
    art-193  The Lindisfarne Gospels — c. 715
    art-194  The Umayyad frescoes of Qusayr Amra — c. 740
    art-195  The Mshatta facade — Jordan, c. 743
    art-196  The Ruthwell Cross — Northumbria, c. 750
    art-197  The Great Buddha of Tōdai-ji — Nara, 752
    art-198  The Shōsōin treasures — Nara, c. 756
    art-199  The Ajanta caves' late phase and the Ellora Kailasa — India, c. 760
    art-200  The Maya Bonampak murals — Mexico, c. 790

### The ninth to eleventh centuries, 800–1050 — `art-800`

    art-201  The Book of Kells — c. 800
    art-202  Carolingian art and the return to Rome — c. 800
    art-203  The Coronation Gospels — Aachen, c. 800
    art-204  The Borobudur reliefs — Java, c. 825
    art-205  The Utrecht Psalter — Reims, c. 830
    art-206  The Oseberg ship carvings — Norway, c. 834
    art-207  Iconoclasm and what it destroyed — 726–843
    art-208  The Prambanan reliefs — Java, c. 850
    art-209  The Lindau Gospels cover — c. 880
    art-210  The Blue Qur'an — North Africa, c. 900
    art-211  Kufic calligraphy as an art form, c. 900 CE
    art-212  The Paris Psalter — Constantinople, c. 950
    art-213  The Harbaville Triptych — Byzantium, c. 950
    art-214  Li Cheng and the Northern Song monumental landscape — c. 960
    art-215  The Jelling stone — Denmark, c. 965
    art-216  The Great Mosque of Córdoba mihrab mosaics — 965
    art-217  The Pyxis of al-Mughira — Córdoba, 968
    art-218  The Gero Crucifix — Cologne, c. 970
    art-219  Ottonian manuscript painting and the Gospels of Otto III — c. 1000
    art-220  The Chola bronze Nataraja — India, c. 1000
    art-221  Fan Kuan's Travellers among Mountains and Streams — China, c. 1000
    art-222  The Toltec Atlantean figures of Tula — Mexico, c. 1000
    art-223  The Bernward Doors — Hildesheim, 1015
    art-224  The Kandariya Mahadeva temple sculpture — Khajuraho, c. 1030

### Romanesque and Song, 1050–1150 — `art-1050`

    art-225  Romanesque sculpture — the return of the carved figure, from c. 1050
    art-226  The Byōdō-in Amida by Jōchō — Japan, 1053
    art-227  The Borgund and the Urnes stave church carving — Norway, c. 1070
    art-228  The Bayeux Tapestry — c. 1070
    art-229  Guo Xi's Early Spring — China, 1072
    art-230  Su Shi and the scholar-painter's ideal — c. 1080
    art-231  The Saint-Savin-sur-Gartempe vault paintings — c. 1100
    art-232  The Silos cloister reliefs — Spain, c. 1100
    art-233  Ru ware and the Song ceramic — c. 1100
    art-234  The Gloucester Candlestick — England, c. 1110
    art-235  Wiligelmo's Modena reliefs — c. 1110
    art-236  Emperor Huizong's Auspicious Cranes — China, 1112
    art-237  The Moissac portal — c. 1115
    art-238  Zhang Zeduan's Along the River During the Qingming Festival — c. 1120
    art-239  The Christ in Majesty of Sant Climent de Taüll — Catalonia, c. 1123
    art-240  The Vézelay tympanum — c. 1125
    art-241  The Gislebertus tympanum at Autun — c. 1130
    art-242  The Genji Monogatari Emaki — Japan, c. 1130
    art-243  Gothic art — the style, and the word, from c. 1140

### Gothic and the thirteenth century, 1150–1300 — `art-1150`

    art-244  The Cloisters Cross — England, c. 1150
    art-245  The Chōjū-jinbutsu-giga scrolls — Japan, c. 1150
    art-246  Yamato-e — the Japanese picture, c. 1150
    art-247  The Angkor Wat bas-reliefs — Cambodia, c. 1150
    art-248  The Chartres royal portal jamb figures — c. 1150
    art-249  The Stavelot Triptych and Mosan enamel — c. 1156
    art-250  The Winchester Bible — c. 1160
    art-251  The Baptistery doors of Bonanno Pisano — Pisa, c. 1180
    art-252  Nicholas of Verdun's Klosterneuburg Altar — 1181
    art-253  Liang Kai's Immortal in Splashed Ink — China, c. 1200
    art-254  Chan painting and the untutored brush, c. 1200
    art-255  Unkei's Niō guardians at Tōdai-ji — Japan, 1203
    art-256  The Kitano Tenjin Engi handscroll — Japan, c. 1219
    art-257  Stained glass and the Chartres windows — c. 1220
    art-258  The Lalibela rock-hewn reliefs — Ethiopia, c. 1220
    art-259  Villard de Honnecourt's portfolio — c. 1230
    art-260  The Bamberg Rider — c. 1235
    art-261  The Maqamat of al-Hariri illustrated by al-Wasiti — Baghdad, 1237
    art-262  The Reims Visitation and the Gothic smile — c. 1240
    art-263  The Morgan Crusader Bible — Paris, c. 1245
    art-264  The Sainte-Chapelle glass — Paris, 1248
    art-265  The Naumburg Uta — c. 1250
    art-266  The Great Zimbabwe soapstone birds — c. 1250
    art-267  Muqi's Six Persimmons — China, c. 1250
    art-268  The Konark Sun Temple wheel — India, c. 1250
    art-269  The Kamakura Great Buddha — Japan, 1252
    art-270  The Psalter of St Louis — Paris, c. 1260
    art-271  Nicola Pisano's Pisa Baptistery pulpit — 1260
    art-272  The Deesis mosaic of Hagia Sophia — c. 1261
    art-273  The Westminster Retable — England, c. 1270
    art-274  Duccio's Rucellai Madonna — 1285
    art-275  The Byzantine maniera greca in Italy, c. 1285
    art-276  Cimabue's Crucifix at Santa Croce — c. 1288
    art-277  Cimabue's Santa Trinita Maestà — c. 1290
    art-278  Zhao Mengfu's Autumn Colours on the Que and Hua Mountains — China, 1296

## The Fourteenth and Fifteenth Centuries — `art-1300s`

### 1300–1350 — `art-1300`

    art-279  The Ife heads — Nigeria, c. 1300
    art-280  The Alhambra stucco and tile — Granada, from c. 1300
    art-281  Yuan literati painting and the retreat from the court — c. 1300
    art-282  Giovanni Pisano's Pistoia pulpit — 1301
    art-283  Giotto's Scrovegni Chapel frescoes — Padua, 1305
    art-284  Giotto's Lamentation — Padua, 1305
    art-285  Giotto and the beginning of the modern picture, c. 1305
    art-286  Giovanni Pisano's Madonna della Cintola — c. 1305
    art-287  Giotto's Ognissanti Madonna — c. 1310
    art-288  The Sultaniyya tilework and Ilkhanid ornament — Persia, c. 1310
    art-289  Duccio's Maestà — Siena, 1311
    art-290  The Rashid al-Din World History illustrations — Persia, c. 1314
    art-291  The Chora Church mosaics and frescoes — Constantinople, c. 1315
    art-292  Simone Martini's Maestà — Siena, 1315
    art-293  The Queen Mary Psalter — England, c. 1320
    art-294  The Luttrell Psalter — England, c. 1330
    art-295  Simone Martini's Annunciation — 1333
    art-296  The Sienese school and the Gothic line, c. 1333
    art-297  The Great Mongol Shahnama — Persia, c. 1335
    art-298  Andrea Pisano's Florence Baptistery doors — 1336
    art-299  Tempera on panel — the technique before oil, c. 1336
    art-300  Ambrogio Lorenzetti's Allegory of Good and Bad Government — Siena, 1339
    art-301  Pietro Lorenzetti's Birth of the Virgin — 1342
    art-302  The Ni Zan empty landscape — China, c. 1345
    art-303  The Black Death and what it did to painting — after 1348

### 1350–1400 — `art-1350`

    art-304  Huang Gongwang's Dwelling in the Fuchun Mountains — China, 1350
    art-305  The Master of Vyšší Brod and Bohemian panel painting — c. 1350
    art-306  The blue-and-white porcelain of Jingdezhen — China, from c. 1350
    art-307  Andrei Rublev's forerunners and the Novgorod icon — c. 1360
    art-308  Master Theodoric's Karlštejn panels — Bohemia, c. 1360
    art-309  The Parement de Narbonne — France, c. 1375
    art-310  Theophanes the Greek's Novgorod frescoes — 1378
    art-311  Nicholas of Verdun's successors and Rhenish goldsmithing — c. 1380
    art-312  The Ashikaga collection and the Japanese taste for Chinese painting — c. 1380
    art-313  The Trés Belles Heures and the illuminated book at court — c. 1390
    art-314  The Wilton Diptych — England, c. 1395
    art-315  International Gothic — the court style of Europe, c. 1395
    art-316  Claus Sluter's Well of Moses — Dijon, 1395
    art-317  Melchior Broederlam's Dijon Altarpiece — 1399

### 1400–1440 — `art-1400`

    art-318  Claus Sluter's Mourners of the tomb of Philip the Bold — c. 1400
    art-319  The Yongle-era Buddhist bronzes — China, c. 1400
    art-320  The Timurid book and the Herat workshop — from c. 1400
    art-321  The Benin ivory and brass tradition begins — c. 1400
    art-322  The Florence Baptistery doors competition — 1401
    art-323  Ghiberti's Sacrifice of Isaac panel — 1401
    art-324  Brunelleschi's Sacrifice of Isaac panel — 1401
    art-325  Linear perspective — Brunelleschi's demonstration, c. 1413
    art-326  Josetsu's Catching a Catfish with a Gourd — Japan, c. 1413
    art-327  The Limbourg brothers' Très Riches Heures — c. 1416
    art-328  Donatello's Saint George — c. 1416
    art-329  Gentile da Fabriano's Adoration of the Magi — 1423
    art-330  Donatello's Zuccone — Florence, c. 1425
    art-331  Andrei Rublev's Trinity — Russia, c. 1425
    art-332  Donatello's Feast of Herod relief — Siena, 1427
    art-333  Masaccio's Holy Trinity — Santa Maria Novella, 1427
    art-334  Masaccio's Tribute Money — Brancacci Chapel, c. 1427
    art-335  Masaccio's Expulsion from the Garden of Eden — c. 1427
    art-336  The Master of Flémalle's Mérode Altarpiece — c. 1428
    art-337  Sesshū's teachers and the rise of Japanese ink landscape — c. 1430
    art-338  The Ghent Altarpiece — Hubert and Jan van Eyck, 1432
    art-339  Jan van Eyck's Man in a Red Turban — 1433
    art-340  Oil painting — what the Netherlandish technique made possible, c. 1433
    art-341  Jan van Eyck's Arnolfini Portrait — 1434
    art-342  Alberti's On Painting and the theory of the picture — 1435
    art-343  Jan van Eyck's Madonna of Chancellor Rolin — c. 1435
    art-344  Rogier van der Weyden's Descent from the Cross — c. 1435
    art-345  Paolo Uccello's Battle of San Romano — c. 1438
    art-346  Luca della Robbia's Cantoria — Florence, 1438

### 1440–1470 — `art-1440`

    art-347  Fra Angelico's San Marco Annunciation — c. 1440
    art-348  Donatello's David — Florence, c. 1440
    art-349  Fra Angelico's San Marco cell frescoes — c. 1442
    art-350  Petrus Christus's A Goldsmith in His Shop — 1449
    art-351  Piero della Francesca's Baptism of Christ — c. 1450
    art-352  Jean Fouquet's Melun Diptych — c. 1452
    art-353  Ghiberti's Gates of Paradise — Florence, 1452
    art-354  Donatello's Gattamelata — Padua, 1453
    art-355  Donatello's Mary Magdalene — c. 1455
    art-356  Andrea Mantegna's Ovetari Chapel frescoes — c. 1455
    art-357  Enguerrand Quarton's Avignon Pietà — c. 1455
    art-358  Andrea Mantegna's San Zeno Altarpiece — 1459
    art-359  Desiderio da Settignano's Marsuppini tomb — Florence, c. 1459
    art-360  Rogier van der Weyden's Portrait of a Lady — c. 1460
    art-361  Piero della Francesca's Legend of the True Cross — Arezzo, c. 1460
    art-362  Piero della Francesca's Flagellation of Christ — c. 1460
    art-363  The Master E. S. and the beginnings of engraving — c. 1460
    art-364  Benozzo Gozzoli's Procession of the Magi — Florence, 1461
    art-365  Filippo Lippi's Madonna and Child with Two Angels — c. 1465
    art-366  Piero della Francesca's Resurrection — c. 1465
    art-367  Dieric Bouts's Last Supper — 1468

### 1470–1500 — `art-1470`

    art-368  Piero della Francesca's Montefeltro diptych — c. 1470
    art-369  Sesshū Tōyō's Winter Landscape — Japan, c. 1470
    art-370  Shen Zhou and the Wu school — China, c. 1470
    art-371  The Aztec Coyolxauhqui Stone — Mexico, c. 1473
    art-372  Andrea Mantegna's Camera degli Sposi — Mantua, 1474
    art-373  Hans Memling's Portrait of a Man with a Coin — c. 1475
    art-374  Antonello da Messina's Saint Jerome in His Study — c. 1475
    art-375  Martin Schongauer's Temptation of Saint Anthony — c. 1475
    art-376  Sandro Botticelli's Adoration of the Magi — c. 1476
    art-377  Hugo van der Goes's Portinari Altarpiece — c. 1478
    art-378  Sandro Botticelli's Primavera — c. 1480
    art-379  Andrea Mantegna's Lamentation of Christ — c. 1480
    art-380  Leonardo da Vinci's Adoration of the Magi — 1481
    art-381  Sandro Botticelli's The Birth of Venus — c. 1485
    art-382  Leonardo da Vinci's Virgin of the Rocks — c. 1485
    art-383  Carlo Crivelli's Annunciation with Saint Emidius — 1486
    art-384  Giovanni Bellini's San Giobbe Altarpiece — c. 1487
    art-385  Andrea del Verrocchio's Bartolomeo Colleoni — Venice, c. 1488
    art-386  Domenico Ghirlandaio's An Old Man and His Grandson — c. 1490
    art-387  Giovanni Bellini's Sacred Allegory — c. 1490
    art-388  Leonardo da Vinci's Lady with an Ermine — c. 1490
    art-389  Leonardo's Vitruvian Man — c. 1490
    art-390  The Bihzad manuscripts and the Herat school — Persia, c. 1490
    art-391  Albrecht Dürer's Self-Portrait at Twenty-Two — 1493
    art-392  Leonardo da Vinci's The Last Supper — Milan, 1498
    art-393  Albrecht Dürer's Apocalypse woodcuts — 1498
    art-394  Michelangelo's Pietà — Rome, 1499

## The Sixteenth Century — `art-1500s`

### 1500–1520 — `art-1500`

    art-395  Hieronymus Bosch's The Garden of Earthly Delights — c. 1500
    art-396  Albrecht Dürer's Self-Portrait — 1500
    art-397  Botticelli's Mystic Nativity and the shadow of Savonarola — 1501
    art-398  Leonardo da Vinci's Mona Lisa — c. 1503
    art-399  Leonardo's sfumato — the technique of the lost outline, c. 1503
    art-400  Michelangelo's David — Florence, 1504
    art-401  Leonardo and Michelangelo in the Sala del Gran Consiglio — 1504
    art-402  Raphael's Marriage of the Virgin — 1504
    art-403  Tilman Riemenschneider's Altar of the Holy Blood — Germany, 1505
    art-404  Raphael's Madonna of the Meadow — 1506
    art-405  Giorgione's The Tempest — c. 1508
    art-406  Leonardo's anatomical drawings — c. 1510
    art-407  Giorgione and Titian's Sleeping Venus — c. 1510
    art-408  Raphael's The School of Athens — Vatican, 1511
    art-409  Michelangelo's Sistine Chapel ceiling — Rome, 1512
    art-410  The Creation of Adam — Sistine Chapel, 1512
    art-411  Raphael's Galatea — 1512
    art-412  Raphael's Sistine Madonna — 1512
    art-413  Albrecht Dürer's Knight, Death and the Devil — 1513
    art-414  Albrecht Dürer's Melencolia I — 1514
    art-415  Raphael's Portrait of Baldassare Castiglione — c. 1515
    art-416  The High Renaissance — what the phrase means and what it leaves out, c. 1515
    art-417  Albrecht Dürer's Rhinoceros — 1515
    art-418  Matthias Grünewald's Isenheim Altarpiece — c. 1515
    art-419  Michelangelo's Moses — Rome, c. 1515
    art-420  Michelangelo's Dying Slave and the non-finito — c. 1515
    art-421  Hieronymus Bosch's The Haywain Triptych — c. 1516
    art-422  Titian's Assumption of the Virgin — Venice, 1518

### 1520–1550 — `art-1520`

    art-423  The Benin Queen Mother head of Idia — Nigeria, c. 1520
    art-424  The Aztec featherwork headdress and the objects sent to Europe — c. 1520
    art-425  Rosso Fiorentino's Descent from the Cross — 1521
    art-426  Hans Holbein's The Body of the Dead Christ in the Tomb — 1521
    art-427  The Reformation and the destruction of images — from 1522
    art-428  Titian's Bacchus and Ariadne — 1523
    art-429  Parmigianino's Self-Portrait in a Convex Mirror — 1524
    art-430  Sultan Muhammad's Court of Gayumars — Persia, c. 1525
    art-431  Pontormo's Deposition from the Cross — 1528
    art-432  Mannerism — the style after perfection, c. 1528
    art-433  Albrecht Altdorfer's The Battle of Alexander at Issus — 1529
    art-434  Correggio's Assumption of the Virgin — Parma, 1530
    art-435  The Fontainebleau school — France, from 1530
    art-436  Correggio's Jupiter and Io — c. 1532
    art-437  Lucas Cranach the Elder's Venus — 1532
    art-438  Hans Holbein the Younger's The Ambassadors — 1533
    art-439  Michelangelo's Medici Chapel tombs — Florence, 1534
    art-440  Parmigianino's Madonna with the Long Neck — c. 1535
    art-441  The Shahnama of Shah Tahmasp — Persia, c. 1535
    art-442  Hans Holbein's Portrait of Henry VIII — c. 1537
    art-443  Titian's Venus of Urbino — 1538
    art-444  Jacopo Sansovino and the Venetian sculpted figure — c. 1540
    art-445  Sinan's Ottoman tilework at Iznik — from c. 1540
    art-446  Michelangelo's Last Judgment — Sistine Chapel, 1541
    art-447  Benvenuto Cellini's Salt Cellar — 1543
    art-448  Agnolo Bronzino's Venus, Cupid, Folly and Time — c. 1545
    art-449  Bronzino's Portrait of Eleonora di Toledo — 1545
    art-450  Titian's Portrait of Pope Paul III and His Grandsons — 1546
    art-451  Tintoretto's The Miracle of the Slave — 1548

### 1550–1580 — `art-1550`

    art-452  Vasari's Lives and the invention of art history — 1550
    art-453  Qiu Ying's Spring Morning in the Han Palace — China, c. 1550
    art-454  Sofonisba Anguissola's The Chess Game — 1555
    art-455  Pieter Bruegel the Elder's The Fall of Icarus — c. 1558
    art-456  Titian's Diana and Actaeon — 1559
    art-457  Pieter Bruegel the Elder's Netherlandish Proverbs — 1559
    art-458  Titian's Rape of Europa — 1562
    art-459  Pieter Bruegel the Elder's The Triumph of Death — c. 1562
    art-460  Paolo Veronese's The Wedding at Cana — 1563
    art-461  Pieter Bruegel the Elder's The Tower of Babel — 1563
    art-462  The Council of Trent and what the Church asked of painters — 1563
    art-463  Tintoretto's Scuola Grande di San Rocco cycle — Venice, 1565
    art-464  Pieter Bruegel the Elder's The Hunters in the Snow — 1565
    art-465  Pieter Bruegel the Elder's The Peasant Wedding — c. 1567
    art-466  Bruegel and the birth of the independent landscape, c. 1567
    art-467  Titian's late manner and the broken brushstroke — c. 1570
    art-468  Nicholas Hilliard and the English portrait miniature — c. 1570
    art-469  The Momoyama gold screen — Japan, from c. 1570
    art-470  The Mughal Hamzanama — India, c. 1570
    art-471  Veronese's Feast in the House of Levi and the Inquisition — 1573
    art-472  Titian's Flaying of Marsyas — c. 1575
    art-473  El Greco's The Disrobing of Christ — Toledo, 1579
    art-474  Federico Barocci's Madonna del Popolo — 1579
    art-475  Tenebrism and the Caravaggesque light, c. 1579

### 1580–1600 — `art-1575`

    art-476  Lavinia Fontana's Portrait of a Noblewoman — c. 1580
    art-477  Giambologna's Mercury — c. 1580
    art-478  The Wunderkammer and the collecting of art — c. 1580
    art-479  Jacopo Bassano and the night scene — c. 1580
    art-480  Giambologna's Rape of the Sabine Women — Florence, 1582
    art-481  The Ottoman Surname-i Hümayun festival book — 1582
    art-482  The Carracci and the reform of painting — Bologna, c. 1585
    art-483  Annibale Carracci's The Butcher's Shop — c. 1585
    art-484  El Greco's The Burial of the Count of Orgaz — 1588
    art-485  Giuseppe Arcimboldo's Vertumnus — c. 1590
    art-486  Kanō Eitoku's Chinese Lions screen — Japan, c. 1590
    art-487  The Akbarnama illustrations — India, c. 1590
    art-488  The Kunstkammer object: nautilus cups and rock-crystal — c. 1590
    art-489  The Basawan and Mughal portraiture — India, c. 1590
    art-490  Hans von Aachen and the Rudolfine court at Prague — c. 1595
    art-491  Isaac Oliver and the miniature after Hilliard — c. 1595
    art-492  Hasegawa Tōhaku's Pine Trees screen — Japan, c. 1595
    art-493  The Namban screens and Japan's view of Europe — c. 1595
    art-494  El Greco's View of Toledo — c. 1599
    art-495  Caravaggio's Basket of Fruit — c. 1599
    art-496  Caravaggio's Judith Beheading Holofernes — c. 1599

## The Baroque World, 1600–1750 — `art-baroque`

### 1600–1630 — `art-1600`

    art-497  Annibale Carracci's Farnese Gallery ceiling — Rome, 1600
    art-498  Caravaggio's The Calling of Saint Matthew — Rome, 1600
    art-499  Adam Elsheimer and the small painting on copper — c. 1600
    art-500  Chen Hongshou's forerunners and late Ming figure painting — c. 1600
    art-501  Dong Qichang and the theory of Northern and Southern schools — China, 1600
    art-502  The Cuzco school begins — Peru, c. 1600
    art-503  The casta and the colonial image in New Spain — c. 1600
    art-504  The Ethiopian icon and the Gondar style — c. 1600
    art-505  Caravaggio's The Conversion of Saint Paul — 1601
    art-506  Caravaggio's Supper at Emmaus — 1601
    art-507  Juan Sánchez Cotán's Quince, Cabbage, Melon and Cucumber — c. 1602
    art-508  Caravaggio's The Entombment of Christ — 1603
    art-509  Caravaggio's Death of the Virgin — 1606
    art-510  Caravaggio's David with the Head of Goliath — c. 1610
    art-511  Baroque — the style, and the argument about the word, c. 1610
    art-512  Artemisia Gentileschi's Susanna and the Elders — 1610
    art-513  El Greco's The Opening of the Fifth Seal — c. 1610
    art-514  Peter Paul Rubens's The Elevation of the Cross — 1611
    art-515  Peter Paul Rubens's The Descent from the Cross — 1614
    art-516  Guido Reni's Aurora — Rome, 1614
    art-517  Domenichino's Last Communion of Saint Jerome — 1614
    art-518  Ambrosius Bosschaert and the Dutch flower piece — c. 1615
    art-519  The Kano school and Japanese painting under the Tokugawa — from 1615
    art-520  Frans Hals's Banquet of the Officers of the St George Civic Guard — 1616
    art-521  Peter Paul Rubens's The Rape of the Daughters of Leucippus — c. 1618
    art-522  Diego Velázquez's Old Woman Frying Eggs — 1618
    art-523  Rubens's oil sketch and the workshop — c. 1620
    art-524  Artemisia Gentileschi's Judith Slaying Holofernes — c. 1620
    art-525  Orazio Gentileschi and the Caravaggisti abroad — c. 1620
    art-526  Hendrick ter Brugghen and the Utrecht Caravaggisti — c. 1620
    art-527  Diego Velázquez's The Water Seller of Seville — c. 1620
    art-528  The bodegón and the Spanish still life, c. 1620
    art-529  Guercino's Aurora and the illusionistic ceiling — 1621
    art-530  Gianlorenzo Bernini's David — 1624
    art-531  Frans Hals's The Laughing Cavalier — 1624
    art-532  Gianlorenzo Bernini's Apollo and Daphne — 1625
    art-533  Francisco de Zurbarán's Saint Serapion — 1628

### 1630–1660 — `art-1630`

    art-534  Tawaraya Sōtatsu's Wind God and Thunder God — Japan, c. 1630
    art-535  The Rinpa school — Japan, c. 1630
    art-536  The Persian Isfahan school and Riza Abbasi — c. 1630
    art-537  Rembrandt's The Anatomy Lesson of Dr Nicolaes Tulp — 1632
    art-538  Judith Leyster's Self-Portrait — c. 1633
    art-539  Bernini's Baldacchino and the sculpted setting — Rome, 1634
    art-540  Diego Velázquez's The Surrender of Breda — 1635
    art-541  Anthony van Dyck's Charles I at the Hunt — 1635
    art-542  Willem Claesz Heda and the Dutch banquet piece — c. 1635
    art-543  Rembrandt's Belshazzar's Feast — c. 1636
    art-544  Anthony van Dyck's Charles I in Three Positions — 1636
    art-545  Nicolas Poussin's The Rape of the Sabine Women — c. 1637
    art-546  Artemisia Gentileschi's Self-Portrait as the Allegory of Painting — c. 1638
    art-547  Nicolas Poussin's Et in Arcadia ego — c. 1638
    art-548  Jusepe de Ribera's Martyrdom of Saint Philip — 1639
    art-549  Pietro da Cortona's Barberini ceiling — Rome, 1639
    art-550  Georges de La Tour's Magdalene with the Smoking Flame — c. 1640
    art-551  Shah Jahan's court albums and Mughal painting at its height — c. 1640
    art-552  The Tosa school and the Japanese court style — c. 1640
    art-553  Rembrandt's The Night Watch — 1642
    art-554  Rembrandt's self-portraits — a lifetime of them, c. 1642
    art-555  The Le Nain brothers and the peasant subject — c. 1642
    art-556  Georges de La Tour's The Newborn — c. 1645
    art-557  Poussin and the theory of the modes — c. 1647
    art-558  Claude Lorrain's Seaport with the Embarkation of the Queen of Sheba — 1648
    art-559  Claude and the classical landscape, c. 1648
    art-560  Rembrandt's Hundred Guilder Print and the etching — c. 1649
    art-561  Diego Velázquez's Rokeby Venus — c. 1650
    art-562  Diego Velázquez's Portrait of Pope Innocent X — 1650
    art-563  Alessandro Algardi and the Baroque relief — c. 1650
    art-564  Bernini's Fountain of the Four Rivers — Rome, 1651
    art-565  Bernini's Ecstasy of Saint Teresa — Rome, 1652
    art-566  Rembrandt's Bathsheba at Her Bath — 1654
    art-567  Jacob van Ruisdael's The Jewish Cemetery — c. 1655
    art-568  The Dutch Golden Age and the picture as a commodity, c. 1655
    art-569  Diego Velázquez's Las Meninas — 1656
    art-570  Johannes Vermeer's The Milkmaid — c. 1658
    art-571  Pieter de Hooch's The Courtyard of a House in Delft — 1658

### 1660–1700 — `art-1660`

    art-572  The Kangra and Basohli Ragamala paintings — India, c. 1660
    art-573  Gerrit Dou and the Leiden fijnschilders — c. 1660
    art-574  The mezzotint and the reproductive print — c. 1660
    art-575  Johannes Vermeer's View of Delft — c. 1661
    art-576  Vermeer and the camera obscura — the argument, c. 1661
    art-577  Charles Le Brun and the Academy's doctrine — Paris, from 1663
    art-578  Rembrandt's The Jewish Bride — c. 1665
    art-579  Johannes Vermeer's Girl with a Pearl Earring — c. 1665
    art-580  Jan Steen's The Feast of Saint Nicholas — c. 1665
    art-581  Peter Lely and the Restoration portrait — c. 1665
    art-582  Johannes Vermeer's The Art of Painting — c. 1666
    art-583  The Académie's hierarchy of genres — c. 1667
    art-584  The Four Wangs and Qing orthodox painting — c. 1670
    art-585  Hishikawa Moronobu and the first ukiyo-e prints — Japan, c. 1670
    art-586  Bartolomé Esteban Murillo's Immaculate Conception — c. 1678
    art-587  Grinling Gibbons and the carved English interior — c. 1680
    art-588  The Marattā and Deccan painting — India, c. 1680
    art-589  Luca Giordano and the Neapolitan Baroque — c. 1682
    art-590  Bada Shanren's birds and fishes — China, c. 1690
    art-591  Andrea Pozzo's Sant'Ignazio ceiling — Rome, 1694
    art-592  Shitao's Reminiscences of Qinhuai — China, c. 1695

### 1700–1750 — `art-1700`

    art-593  Rachel Ruysch and the Dutch flower piece at its height — c. 1700
    art-594  Hyacinthe Rigaud's Louis XIV — 1701
    art-595  Ogata Kōrin's Irises screen — Japan, c. 1702
    art-596  Maria Sibylla Merian's Metamorphosis of the Insects of Suriname — 1705
    art-597  The Meissen figure and European porcelain — from 1710
    art-598  Giuseppe Castiglione at the Qing court — from 1715
    art-599  Antoine Watteau's Pilgrimage to Cythera — 1717
    art-600  Antoine Watteau's Pierrot — c. 1719
    art-601  The fête galante and the Rococo, c. 1719
    art-602  Rosalba Carriera and the pastel portrait — c. 1720
    art-603  Nishikawa Sukenobu and the Japanese printed book — c. 1720
    art-604  Canaletto's The Stonemason's Yard — c. 1725
    art-605  Canaletto and the view painting for the Grand Tour, c. 1725
    art-606  Jean-Siméon Chardin's The Ray — 1728
    art-607  The Asam brothers and the German Baroque interior — c. 1730
    art-608  Jean-Siméon Chardin's Soap Bubbles — c. 1734
    art-609  Chardin and the dignity of the still life, c. 1734
    art-610  William Hogarth's A Rake's Progress — 1735
    art-611  Jean-Baptiste Oudry and the animal picture — c. 1740
    art-612  Okumura Masanobu and the perspective print — Japan, c. 1740
    art-613  William Hogarth's Marriage A-la-Mode — 1743
    art-614  Hogarth and the print as social criticism, c. 1743
    art-615  Piranesi's Vedute di Roma — from 1748

## Revolution and Romance, 1750–1860 — `art-revolution`

### 1750–1790 — `art-1750`

    art-616  Giovanni Battista Piranesi's Carceri — 1750
    art-617  Thomas Gainsborough's Mr and Mrs Andrews — c. 1750
    art-618  François Boucher's The Toilet of Venus — 1751
    art-619  Giovanni Battista Tiepolo's Würzburg Residenz ceiling — 1753
    art-620  Tiepolo and the last great fresco cycles, c. 1753
    art-621  Ignaz Günther and Bavarian Rococo sculpture — c. 1755
    art-622  Winckelmann and the invention of the antique ideal — 1755
    art-623  Neoclassicism — the style, and the return to Greece and Rome, c. 1755
    art-624  Anton Raphael Mengs's Parnassus — 1761
    art-625  George Stubbs's Whistlejacket — c. 1762
    art-626  Miguel Cabrera's casta paintings — Mexico, 1763
    art-627  Joshua Reynolds's Lady Sarah Bunbury Sacrificing to the Graces — 1765
    art-628  Suzuki Harunobu and the full-colour nishiki-e — Japan, 1765
    art-629  Itō Jakuchū's Colourful Realm of Living Beings — Japan, c. 1765
    art-630  Jean-Honoré Fragonard's The Swing — 1767
    art-631  Joseph Wright of Derby's An Experiment on a Bird in the Air Pump — 1768
    art-632  Reynolds's Discourses and the Grand Manner — from 1769
    art-633  The Royal Academy exhibition and the birth of the art public — from 1769
    art-634  Thomas Gainsborough's The Blue Boy — 1770
    art-635  Benjamin West's The Death of General Wolfe — 1770
    art-636  Katsushika Hokusai's teachers and the Torii line — Japan, c. 1770
    art-637  The Qianlong emperor's collection and Qing court taste — c. 1770
    art-638  Yosa Buson and Japanese literati painting — c. 1770
    art-639  John Singleton Copley's Watson and the Shark — 1778
    art-640  The Company school and painting for the East India Company — India, c. 1780
    art-641  The Tlingit and Haida crest art of the Northwest Coast — c. 1780
    art-642  The Asante gold regalia — Ghana, c. 1780
    art-643  Jean-Antoine Houdon's Voltaire Seated — 1781
    art-644  Henry Fuseli's The Nightmare — 1781
    art-645  Antonio Canova's Theseus and the Minotaur — 1782
    art-646  Jacques-Louis David's Oath of the Horatii — 1784
    art-647  Angelica Kauffman's Cornelia, Mother of the Gracchi — c. 1785
    art-648  Torii Kiyonaga's beauties — Japan, c. 1785
    art-649  Élisabeth Vigée Le Brun's Marie Antoinette and Her Children — 1787
    art-650  Jacques-Louis David's The Death of Socrates — 1787

### 1790–1820 — `art-1790`

    art-651  Kitagawa Utamaro's Ten Studies in Female Physiognomy — Japan, c. 1792
    art-652  Jacques-Louis David's The Death of Marat — 1793
    art-653  Antonio Canova's Psyche Revived by Cupid's Kiss — 1793
    art-654  Tōshūsai Sharaku's actor portraits — Japan, 1794
    art-655  William Blake's The Ancient of Days — 1794
    art-656  William Blake's Newton — 1795
    art-657  Thomas Bewick and the wood engraving — c. 1797
    art-658  Lithography and Senefelder's invention — 1798
    art-659  Francisco Goya's Los Caprichos — 1799
    art-660  Francisco Goya's The Family of Charles IV — 1800
    art-661  Francisco Goya's La maja desnuda — c. 1800
    art-662  The Aleijadinho prophets at Congonhas — Brazil, 1800
    art-663  Ingres's Napoleon on His Imperial Throne — 1806
    art-664  Jacques-Louis David's The Coronation of Napoleon — 1807
    art-665  David and art in the service of a revolution, c. 1807
    art-666  Antonio Canova's Pauline Borghese as Venus Victrix — 1808
    art-667  Caspar David Friedrich's The Cross in the Mountains — 1808
    art-668  Philipp Otto Runge's Morning — 1808
    art-669  Caspar David Friedrich's Monk by the Sea — 1810
    art-670  J. M. W. Turner's Snow Storm: Hannibal Crossing the Alps — 1812
    art-671  Francisco Goya's The Third of May 1808 — 1814
    art-672  Jean-Auguste-Dominique Ingres's La Grande Odalisque — 1814
    art-673  Hokusai's Manga — from 1814
    art-674  Francisco Goya's The Disasters of War — c. 1815
    art-675  The Elgin Marbles arrive in London and the argument begins — 1816
    art-676  Caspar David Friedrich's Wanderer above the Sea of Fog — c. 1818
    art-677  Romanticism — the style, and what it was against, c. 1818
    art-678  The sublime and the picturesque — the eighteenth-century categories, c. 1818
    art-679  Théodore Géricault's The Raft of the Medusa — 1819

### 1820–1840 — `art-1820`

    art-680  John Constable's The Hay Wain — 1821
    art-681  Constable's cloud studies — c. 1821
    art-682  Eugène Delacroix's The Barque of Dante — 1822
    art-683  Francisco Goya's Saturn Devouring His Son and the Black Paintings — c. 1823
    art-684  Eugène Delacroix's The Massacre at Chios — 1824
    art-685  John Constable's The Leaping Horse — 1825
    art-686  Camille Corot's early Italian oil studies — c. 1826
    art-687  Eugène Delacroix's The Death of Sardanapalus — 1827
    art-688  J. M. W. Turner's Ulysses Deriding Polyphemus — 1829
    art-689  Eugène Delacroix's Liberty Leading the People — 1830
    art-690  Katsushika Hokusai's The Great Wave off Kanagawa — c. 1831
    art-691  Hokusai's Thirty-six Views of Mount Fuji — c. 1831
    art-692  Delacroix's Moroccan journey and the Orientalist picture — 1832
    art-693  Ingres and Delacroix — the argument over line and colour, c. 1832
    art-694  Utagawa Hiroshige's Fifty-three Stations of the Tōkaidō — 1833
    art-695  The Japanese woodblock print — how one was made, c. 1833
    art-696  Karl Bryullov's The Last Day of Pompeii — 1833
    art-697  Honoré Daumier's Rue Transnonain — 1834
    art-698  Utagawa Kuniyoshi's warrior prints — Japan, c. 1835
    art-699  Thomas Cole's The Course of Empire — 1836
    art-700  The Hudson River School — America's landscape, c. 1836
    art-701  J. M. W. Turner's The Fighting Temeraire — 1839
    art-702  The daguerreotype and the invention of photography — 1839

### 1840–1860 — `art-1840`

    art-703  Katsushika Ōi and the women of the ukiyo-e studios — c. 1840
    art-704  The tube of paint and painting out of doors — 1841
    art-705  Ruskin's Modern Painters and the critic's authority — from 1843
    art-706  The calotype and Talbot's Pencil of Nature — 1844
    art-707  Photography and painting — the first argument, c. 1844
    art-708  J. M. W. Turner's Rain, Steam and Speed — 1844
    art-709  The Pre-Raphaelite Brotherhood — 1848
    art-710  Gustave Courbet's The Stone Breakers — 1849
    art-711  Jean-François Millet's The Sower — 1850
    art-712  Gustave Courbet's A Burial at Ornans — 1850
    art-713  The Barbizon School and painting out of doors — c. 1850
    art-714  Ivan Aivazovsky's The Ninth Wave — 1850
    art-715  The Great Exhibition and the reform of design — 1851
    art-716  John Everett Millais's Ophelia — 1852
    art-717  Rosa Bonheur's The Horse Fair — 1853
    art-718  William Holman Hunt's The Light of the World — 1854
    art-719  Gustave Courbet's The Painter's Studio — 1855
    art-720  Realism — Courbet's word and Courbet's pavilion, c. 1855
    art-721  Roger Fenton's Crimean War photographs — 1855
    art-722  Nadar and the photographic portrait — c. 1855
    art-723  Jean-François Millet's The Gleaners — 1857
    art-724  Gustave Le Gray's seascapes — c. 1857
    art-725  Hiroshige's One Hundred Famous Views of Edo — 1857

## The Modern Age, 1860–1914 — `art-modernage`

### 1860–1875 — `art-1860`

    art-726  James McNeill Whistler's Symphony in White No. 1 — 1862
    art-727  Edgar Degas's The Bellelli Family — c. 1862
    art-728  Ford Madox Brown's Work — 1863
    art-729  Édouard Manet's Le Déjeuner sur l'herbe — 1863
    art-730  Édouard Manet's Olympia — 1863
    art-731  The Salon des Refusés — 1863
    art-732  Honoré Daumier's The Third-Class Carriage — c. 1864
    art-733  Camille Corot's Souvenir de Mortefontaine — 1864
    art-734  Claude Monet's Women in the Garden — 1866
    art-735  Julia Margaret Cameron's portrait photographs — c. 1867
    art-736  Édouard Manet's The Execution of Emperor Maximilian — 1868
    art-737  Édouard Manet's The Balcony — 1869
    art-738  Claude Monet's La Grenouillère — 1869
    art-739  Pierre-Auguste Renoir's La Grenouillère — 1869
    art-740  Dante Gabriel Rossetti's Beata Beatrix — c. 1870
    art-741  Jean-Léon Gérôme and the academic machine — c. 1870
    art-742  Whistler's Arrangement in Grey and Black (Whistler's Mother) — 1871
    art-743  Vasily Perov and the Russian Wanderers — 1871
    art-744  Berthe Morisot's The Cradle — 1872
    art-745  Claude Monet's Impression, Sunrise — 1872
    art-746  Winslow Homer's Snap the Whip — 1872
    art-747  Camille Pissarro's Hoar Frost — 1873
    art-748  Ilya Repin's Barge Haulers on the Volga — 1873
    art-749  The first Impressionist exhibition — 1874
    art-750  Impressionism — the name, the group and the method, c. 1874
    art-751  Edgar Degas's The Dance Class — c. 1874
    art-752  Pierre-Auguste Renoir's La Loge — 1874

### 1875–1885 — `art-1875`

    art-753  Adolph Menzel's The Iron Rolling Mill — 1875
    art-754  Whistler's Nocturne in Black and Gold and the Ruskin trial — 1875
    art-755  Japonisme — what Europe took from the Japanese print, c. 1875
    art-756  Gustave Caillebotte's The Floor Scrapers — 1875
    art-757  Thomas Eakins's The Gross Clinic — 1875
    art-758  Alfred Sisley's The Flood at Port-Marly — 1876
    art-759  Pierre-Auguste Renoir's Bal du moulin de la Galette — 1876
    art-760  Edgar Degas's L'Absinthe — 1876
    art-761  The Meiji export crafts and the Japanese pavilion — c. 1876
    art-762  Gustave Moreau's The Apparition — 1876
    art-763  Auguste Rodin's The Age of Bronze and the scandal of the cast — 1877
    art-764  Gustave Caillebotte's Paris Street; Rainy Day — 1877
    art-765  Claude Monet's Gare Saint-Lazare — 1877
    art-766  Takahashi Yuichi's Salmon and the coming of yōga — Japan, 1877
    art-767  The Aesthetic Movement and art for art's sake — c. 1877
    art-768  Eadweard Muybridge's The Horse in Motion — 1878
    art-769  Mary Cassatt's Little Girl in a Blue Armchair — 1878
    art-770  Jules Bastien-Lepage and the Salon naturalists — c. 1878
    art-771  Ivan Shishkin and the Russian forest — c. 1878
    art-772  Hubert von Herkomer and the British social subject — c. 1878
    art-773  Auguste Rodin's The Thinker — 1880
    art-774  Auguste Rodin's The Gates of Hell — from 1880
    art-775  Kawanabe Kyōsai and the last of the ukiyo-e line — c. 1880
    art-776  Ravi Varma and oil painting in India — c. 1880
    art-777  Pierre-Auguste Renoir's Luncheon of the Boating Party — 1881
    art-778  Edgar Degas's Little Dancer Aged Fourteen — 1881
    art-779  Édouard Manet's A Bar at the Folies-Bergère — 1882
    art-780  Paul Cézanne's Mont Sainte-Victoire — from 1882
    art-781  Arnold Böcklin's Isle of the Dead — 1883
    art-782  John Singer Sargent's Portrait of Madame X — 1884
    art-783  Georges Seurat's Bathers at Asnières — 1884

### 1885–1900 — `art-1885`

    art-784  Vincent van Gogh's The Potato Eaters — 1885
    art-785  Ilya Repin's Ivan the Terrible and His Son — 1885
    art-786  Georges Seurat's A Sunday Afternoon on the Island of La Grande Jatte — 1886
    art-787  Pointillism and Neo-Impressionism, c. 1886
    art-788  Vasily Surikov's Boyarina Morozova — 1887
    art-789  Vincent van Gogh's Sunflowers — 1888
    art-790  Vincent van Gogh's The Bedroom — 1888
    art-791  Vincent van Gogh's Café Terrace at Night — 1888
    art-792  Paul Gauguin's Vision after the Sermon — 1888
    art-793  Émile Bernard, cloisonnism and the Pont-Aven school — c. 1888
    art-794  Symbolism — the movement, c. 1888
    art-795  Auguste Rodin's The Burghers of Calais — 1889
    art-796  James Ensor's Christ's Entry into Brussels — 1889
    art-797  Vincent van Gogh's The Starry Night — 1889
    art-798  Vincent van Gogh's Self-Portrait with Bandaged Ear — 1889
    art-799  Paul Gauguin's The Yellow Christ — 1889
    art-800  Vincent van Gogh's Wheatfield with Crows — 1890
    art-801  The Yokohama photograph and the tourist image of Japan — c. 1890
    art-802  Fernand Khnopff and Belgian Symbolism — c. 1891
    art-803  Toulouse-Lautrec's posters and the lithographic poster boom — 1891
    art-804  Paul Cézanne's The Card Players — c. 1892
    art-805  Cézanne and the doubt in the motif, c. 1892
    art-806  Henri de Toulouse-Lautrec's At the Moulin Rouge — 1892
    art-807  Pierre Bonnard, Édouard Vuillard and the Nabis — c. 1892
    art-808  Mary Cassatt's The Child's Bath — 1893
    art-809  Camille Claudel's The Waltz — 1893
    art-810  Edvard Munch's The Scream — 1893
    art-811  Edvard Munch's The Frieze of Life — c. 1893
    art-812  Alphonse Mucha's Gismonda poster — 1894
    art-813  Art Nouveau — the style, c. 1894
    art-814  Edvard Munch's Madonna — 1894
    art-815  Paul Cézanne's Still Life with Apples — c. 1894
    art-816  Aubrey Beardsley's illustrations for Salome — 1894
    art-817  Paul Gauguin's Where Do We Come From? What Are We? Where Are We Going? — 1897
    art-818  Gauguin in Tahiti and the primitivist claim, c. 1897
    art-819  Henri Rousseau's The Sleeping Gypsy — 1897
    art-820  Käthe Kollwitz's A Weavers' Revolt — 1897
    art-821  The Vienna Secession — 1897
    art-822  Kuroda Seiki and the Japanese nude — 1897
    art-823  Auguste Rodin's Monument to Balzac — 1898
    art-824  Gustav Klimt's Pallas Athene — 1898

### 1900–1914 — `art-1900`

    art-825  Pablo Picasso's La Vie and the Blue Period — 1903
    art-826  Henri Matisse's Woman with a Hat — 1905
    art-827  Fauvism and the wild beasts of 1905
    art-828  Die Brücke and German Expressionism — Dresden, 1905
    art-829  Paul Cézanne's The Large Bathers — 1906
    art-830  Henri Matisse's Le bonheur de vivre — 1906
    art-831  André Derain's Charing Cross Bridge — 1906
    art-832  Gustav Klimt's Portrait of Adele Bloch-Bauer I — 1907
    art-833  Pablo Picasso's Les Demoiselles d'Avignon — 1907
    art-834  African sculpture in Paris and what modernism took from it — c. 1907
    art-835  Constantin Brâncuși's The Kiss — 1907
    art-836  Alfred Stieglitz's The Steerage and photography as art — 1907
    art-837  Gustav Klimt's The Kiss — 1908
    art-838  Futurism and Marinetti's manifesto — 1909
    art-839  Georges Braque and analytic Cubism — 1910
    art-840  Cubism — what it did to the picture, c. 1910
    art-841  Henri Matisse's The Dance — 1910
    art-842  Egon Schiele's Seated Male Nude — 1910
    art-843  Constantin Brâncuși's Sleeping Muse — 1910
    art-844  Henri Matisse's The Red Studio — 1911
    art-845  Kandinsky's Concerning the Spiritual in Art — 1911
    art-846  Der Blaue Reiter — Munich, 1911
    art-847  Franz Marc's The Large Blue Horses — 1911
    art-848  Pablo Picasso's Ma Jolie — 1912
    art-849  The papier collé and the invention of collage — 1912
    art-850  Juan Gris's Portrait of Picasso — 1912
    art-851  Robert Delaunay's Simultaneous Windows — 1912
    art-852  Giacomo Balla's Dynamism of a Dog on a Leash — 1912
    art-853  Marcel Duchamp's Nude Descending a Staircase, No. 2 — 1912
    art-854  Wassily Kandinsky's Composition VII — 1913
    art-855  Ernst Ludwig Kirchner's Street, Berlin — 1913
    art-856  Umberto Boccioni's Unique Forms of Continuity in Space — 1913
    art-857  The Armory Show — New York, 1913
    art-858  Sonia Delaunay's Prose du Transsibérien — 1913

## The Twentieth Century and After, 1914 to now — `art-c20`

### 1914–1930 — `art-1914`

    art-859  Odilon Redon's The Cyclops — c. 1914
    art-860  Oskar Kokoschka's The Bride of the Wind — 1914
    art-861  Giorgio de Chirico's The Song of Love — 1914
    art-862  Metaphysical painting and the empty square, c. 1914
    art-863  Kazimir Malevich's Black Square — 1915
    art-864  Suprematism and painting without objects — 1915
    art-865  Dada — Zurich, 1916
    art-866  Marcel Duchamp's Fountain — 1917
    art-867  The readymade and what it asked of art, c. 1917
    art-868  De Stijl and the reduction to the grid — 1917
    art-869  Amedeo Modigliani's Reclining Nude — 1917
    art-870  El Lissitzky's Beat the Whites with the Red Wedge — 1919
    art-871  Hannah Höch's Cut with the Kitchen Knife — 1919
    art-872  The Bauhaus and the teaching of modern form — 1919
    art-873  Max Beckmann's The Night — 1919
    art-874  Vladimir Tatlin's Monument to the Third International — 1920
    art-875  Kurt Schwitters's Merz collages — c. 1920
    art-876  Otto Dix's The Skat Players — 1920
    art-877  Constructivism and the artist as engineer — c. 1921
    art-878  George Grosz and the Weimar indictment — c. 1921
    art-879  Man Ray's rayographs — 1922
    art-880  Paul Klee's Twittering Machine — 1922
    art-881  Marcel Duchamp's The Bride Stripped Bare by Her Bachelors, Even — 1923
    art-882  Alexander Rodchenko's photographs and photomontages — c. 1924
    art-883  André Breton's Surrealist Manifesto — 1924
    art-884  Chaïm Soutine and the School of Paris — c. 1925
    art-885  New Objectivity — Germany, 1925
    art-886  Max Ernst's frottage and Une Semaine de bonté — c. 1925
    art-887  Joan Miró's The Harlequin's Carnival — 1925
    art-888  Tarsila do Amaral's Abaporu and Brazilian modernism — 1928
    art-889  René Magritte's The Treachery of Images — 1929

### 1930–1945 — `art-1930`

    art-890  Piet Mondrian's Composition with Red, Blue and Yellow — 1930
    art-891  The Mexican muralists and public art — c. 1930
    art-892  José Clemente Orozco's Prometheus — 1930
    art-893  Grant Wood's American Gothic — 1930
    art-894  Edward Hopper's Early Sunday Morning — 1930
    art-895  Salvador Dalí's The Persistence of Memory — 1931
    art-896  Salvador Dalí and the paranoiac-critical method, c. 1931
    art-897  Alberto Giacometti's The Palace at 4 a.m. — 1932
    art-898  Barbara Hepworth and the pierced form — c. 1932
    art-899  Diego Rivera's Detroit Industry Murals — 1933
    art-900  Socialist Realism and the Soviet picture — from 1934
    art-901  Aaron Douglas and the art of the Harlem Renaissance — c. 1934
    art-902  The Federal Art Project and the WPA murals — 1935
    art-903  Dorothea Lange's Migrant Mother — 1936
    art-904  Walker Evans and the documentary photograph — 1936
    art-905  David Alfaro Siqueiros's Echo of a Scream — 1937
    art-906  Pablo Picasso's Guernica — 1937
    art-907  The Degenerate Art exhibition — Munich, 1937
    art-908  Art under the Third Reich and what was destroyed, c. 1937
    art-909  Vera Mukhina's Worker and Kolkhoz Woman — 1937
    art-910  Henry Moore's Reclining Figure — 1938
    art-911  Frida Kahlo's The Two Fridas — 1939
    art-912  Augusta Savage's The Harp — 1939
    art-913  Frida Kahlo's Self-Portrait with Thorn Necklace — 1940
    art-914  Ansel Adams's Moonrise, Hernandez, New Mexico — 1941
    art-915  Jacob Lawrence's The Migration Series — 1941
    art-916  Edward Hopper's Nighthawks — 1942
    art-917  Piet Mondrian's Broadway Boogie Woogie — 1943
    art-918  Wifredo Lam's The Jungle — 1943
    art-919  Francis Bacon's Three Studies for Figures at the Base of a Crucifixion — 1944

### 1945–1960 — `art-1945`

    art-920  Alexander Calder's mobiles — c. 1946
    art-921  Jean Dubuffet and art brut — c. 1947
    art-922  Louise Bourgeois's early Personages — c. 1949
    art-923  Jackson Pollock's Autumn Rhythm (Number 30) — 1950
    art-924  Jackson Pollock's One: Number 31 — 1950
    art-925  Abstract Expressionism — the New York School, c. 1950
    art-926  Art informel and European abstraction after the war — c. 1950
    art-927  Le Corbusier and the painter's modernism — c. 1950
    art-928  Barnett Newman's Vir Heroicus Sublimis — 1951
    art-929  Clyfford Still and the field of paint — c. 1951
    art-930  Action painting and Harold Rosenberg's phrase — 1952
    art-931  Willem de Kooning's Woman I — 1952
    art-932  Helen Frankenthaler's Mountains and Sea — 1952
    art-933  Colour field painting, c. 1952
    art-934  Lucian Freud's early portraits — c. 1952
    art-935  Mark Rothko's No. 61 (Rust and Blue) — 1953
    art-936  Francis Bacon's Study after Velázquez's Portrait of Innocent X — 1953
    art-937  Robert Rauschenberg's Erased de Kooning Drawing — 1953
    art-938  Henri Matisse's cut-outs and The Snail — 1953
    art-939  The Gutai group — Japan, 1954
    art-940  Jasper Johns's Flag — 1955
    art-941  Richard Hamilton's Just What Is It That Makes Today's Homes So Different? — 1956
    art-942  Lee Krasner's The Seasons — 1957
    art-943  Yves Klein's monochromes and IKB — 1957
    art-944  Rothko and the Seagram murals — 1958
    art-945  Lucio Fontana's Spatial Concept slashes — 1958
    art-946  Robert Rauschenberg's Monogram — 1959
    art-947  Frank Stella's Black Paintings — 1959
    art-948  Minimalism — the object without composition, c. 1959

### 1960–1980 — `art-1960`

    art-949  Alberto Giacometti's Walking Man — 1960
    art-950  Andy Warhol's Campbell's Soup Cans — 1962
    art-951  Andy Warhol's Marilyn Diptych — 1962
    art-952  Pop art — Britain and America, c. 1962
    art-953  Claes Oldenburg's soft sculptures — c. 1962
    art-954  Roy Lichtenstein's Whaam! — 1963
    art-955  Bridget Riley and Op art — 1964
    art-956  Agnes Martin's grids — c. 1964
    art-957  Yoko Ono's Cut Piece — 1964
    art-958  James Rosenquist's F-111 — 1965
    art-959  Donald Judd's stacks and boxes — c. 1965
    art-960  Joseph Kosuth's One and Three Chairs — 1965
    art-961  Yayoi Kusama's Infinity Mirror Rooms — 1965
    art-962  Joseph Beuys's How to Explain Pictures to a Dead Hare — 1965
    art-963  Carl Andre's Equivalent VIII — 1966
    art-964  Eva Hesse's Hang Up — 1966
    art-965  David Hockney's A Bigger Splash — 1967
    art-966  Conceptual art and the dematerialised object — c. 1967
    art-967  Arte Povera — Italy, 1967
    art-968  Sol LeWitt's wall drawings — from 1968
    art-969  Robert Smithson's Spiral Jetty — 1970
    art-970  Land art and the work that cannot be moved, c. 1970
    art-971  Feminist art and the question of the canon — c. 1971
    art-972  Christo and Jeanne-Claude's Valley Curtain — 1972
    art-973  Gordon Matta-Clark's Splitting — 1974
    art-974  Nam June Paik's TV Buddha — 1974
    art-975  Cindy Sherman's Untitled Film Stills — 1977
    art-976  Judy Chicago's The Dinner Party — 1979

### 1980 to now — `art-1980`

    art-977  Graffiti and the street as a surface — c. 1980
    art-978  Jean-Michel Basquiat's Untitled (Skull) — 1981
    art-979  Anselm Kiefer's Margarethe — 1981
    art-980  Neo-expressionism and the return of painting — c. 1981
    art-981  Keith Haring's subway drawings — c. 1982
    art-982  Jeff Koons's Rabbit — 1986
    art-983  Gerhard Richter's Betty — 1988
    art-984  Barbara Kruger's Untitled (Your body is a battleground) — 1989
    art-985  The Guerrilla Girls' Do Women Have to Be Naked? — 1989
    art-986  Gerhard Richter's Abstraktes Bild series — c. 1990
    art-987  Damien Hirst's The Physical Impossibility of Death — 1991
    art-988  Rachel Whiteread's House — 1993
    art-989  Kara Walker's silhouettes — c. 1994
    art-990  Bill Viola and video as an art medium — c. 1995
    art-991  Cai Guo-Qiang's gunpowder drawings — c. 1996
    art-992  The Young British Artists and Sensation — 1997
    art-993  Kerry James Marshall's Past Times — 1997
    art-994  Louise Bourgeois's Maman — 1999
    art-995  The biennial, the art fair and the global art world — c. 2000
    art-996  El Anatsui's bottle-cap hangings — c. 2002
    art-997  Banksy and the art market's embrace — c. 2005
    art-998  Marina Abramović's The Artist Is Present — 2010
    art-999  Ai Weiwei's Sunflower Seeds — 2010
    art-1000  Yinka Shonibare's Nelson's Ship in a Bottle — 2010

