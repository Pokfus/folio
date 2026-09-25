# Visual Art — a 1000-card running order

The plan for `art`, a new collection: every card's number, topic and deck, fixed in advance so the
collection can be grown one card at a time over many sessions without anyone having to remember what
was intended.

It is the seventeenth thousand-card plan on the shelf — the nineteenth row of CLAUDE.md's index
table, which also carries the three geography plans — and the fifth that is not a history collection. Read
`docs/greece-card-plan.md` first if this is the first plan you have met; the mechanics are identical and
are not repeated here. What is NOT identical is the card itself — this collection uses a built-in
format of its own, the **artwork card**, which the section "The artwork card" below specifies in full.

**THE COLLECTION WAS REMOVED AND RESTARTED IN SEP 2026, ON REQUEST, AND THIS FILE IS THE RESTART.** Ten
cards had shipped; all ten were deleted and the format was rebuilt. The request: *"Remove and restart the
Visual Art collection. This should not be a history collection. On the question side it should show no
words but an image of a famous painting, sculpture etc, and the user must guess the title, artist, date of
creation, and current ownership/location in the answer box. In the background section it should then give
a history and description of the artwork."*

**Three things in that sentence are the whole of what changed**, and every rule below is downstream of
one of them.

**IT IS NOT A HISTORY COLLECTION, so every card is one identifiable work and nothing else is.** The first
ten cards were ochre, a dating method, two caves and a rock shelter — real subjects, and art *history*
rather than art. A movement, a technique, a school, a material, a site, a patron and a museum are all out;
see "What a line in this list is" below, which is the rule that enforces it.

**THE QUESTION SIDE SHOWS NO WORDS**, so the card carries no question prose at all — `question` is stored
empty and `add-card.js` refuses one that is not. A work that cannot be shown therefore cannot be carded
here at all, which narrows the canon and is the one real cost of the restart; "Copyright" below states it
with the figure.

**AND THERE ARE SEVERAL ANSWERS RATHER THAN ONE.** Title, artist and date are each typed into their own
field and each marked separately. That is what the format section is mostly about. **Where the work is
now was a fourth field and is now SHOWN rather than asked** (Sep 2026, on request: *"remove the 'where is
it now' from the question but ensure it's mentioned on the answer side"*) — every card still states it,
in the figures grid on the reveal, and a work with no known whereabouts still cannot be carded.

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

**EVERY LINE IS ONE IDENTIFIABLE WORK, AND THAT IS THE RESTART'S FIRST RULE.** `art-400 Michelangelo's
David — Florence, 1504` is a line; *Parietal art — the techniques of the painted cave* is not, and neither
is *Baroque — the style, and the argument about the word*, *The Kano school under the Tokugawa*, or *How
the earliest art is dated*. Those are art history, and this collection is not a history collection: its
question is a photograph, so its subject has to be a thing that can be photographed and named.

**THE FOUR-PART TEST a line has to pass**, and it is worth applying before researching rather than after:

1. **It is ONE object**, not a class of them. *The Standard of Ur* passes; *Jōmon pottery* does not, and
   becomes the Umataka flame pot.
2. **It has a TITLE a reader could type.** A work known only by its site and its number is unaskable.
3. **It has a MAKER or an honest "Unknown"**, and a DATE, and a PLACE IT IS NOW. The first two are asked
   and the third is stated on the answer side, and `add-card.js` requires all three — so a line whose
   work has no known whereabouts still cannot be carded.
4. **A free photograph of it exists.** See "Copyright" below. Check before writing, never after.

A line still says only what to research; the card's own title, date and location are researched when it
is written and may correct the line. What a line may no longer do is name something that is not a work.

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

## The artwork card — how the format works

**IT IS BUILT** (the `ARTWORK CARDS` block in app.js; `.claude/test-artwork-cards.js` guards it). A
**built-in format, like the map card** — see the MAP CARDS bullet in CLAUDE.md — and for the same reason:
a community card type is templates plus scoped CSS and cannot run code, and this needs a picture promoted
to the front of the card, a licence credit held back until the reveal, and typed answers graded
separately.

**THE FRONT IS THE PICTURE AND THREE EMPTY FIELDS. THERE IS NO QUESTION.** `question` is stored as `""`,
`questions` as `[]`, and `add-card.js` refuses anything else — a sentence sitting in a field that nothing
renders is a thing a later reader of the data cannot tell from a bug. What says what to do is the answer
box's own three labels, which are the form rather than a clue about the work.

**WHERE THE WORK IS NOW IS SHOWN AND NOT ASKED** (Sep 2026, on request). It was a fourth field. It is
still derived, still REQUIRED of every card by `add-card.js`, and still printed on the answer side by
`cardFactsHTML`, which reads `facts` directly — so the row the reader is shown is the row the label table
below is matching. What changed is one entry in `ART_FIELDS` and nothing else, which is also what makes
asking for it again one line back.

Seven things are decisions rather than plumbing.

**`artwork: true` SAYS THE PICTURE IS THIS CARD'S OWN SUBJECT.** It is a flag rather than an inference
from `image` because an ordinary card's picture ILLUSTRATES its subject — a hand-axe under *Acheulean*, a
flag under a country — and must never be dealt as "what is this?". In this collection every card carries
it; elsewhere on the site no card does.

**THE ANSWERS ARE DERIVED FROM THE CARD'S OWN DISPLAY FIELDS, NEVER STORED TWICE.**

| field | comes from | also prints as |
|---|---|---|
| Title *(asked)* | `answerText` | the answer term |
| Artist *(asked)* | the `facts` row labelled Artist / Maker / Sculptor / Painter / Architect / Workshop / Attributed to / Culture | a row of the figures grid |
| Date *(asked)* | the first labelled row of `answerDate` | the date line under the answer |
| Where it is now *(shown)* | the `facts` row labelled Location / Where it is / Where it is now / Collection / Museum / Held / Home | a row of the figures grid |

Giving the format its own copy of them would be the same strings written twice on every card, and
that is the shape that goes quietly out of step: the grid would say the Rijksmuseum while the grading went
on accepting the Louvre, and nothing on the page could say so. Derived, the grid and the grading are
arithmetically incapable of disagreeing. **What makes reading a row by its label safe is that the labels
are DECLARED** — `ART_ARTIST_LABELS` and `ART_PLACE_LABELS` in app.js, the same two in `add-card.js` —
**and that `add-card.js` REFUSES a card whose grid matches neither.** Without that refusal a card with a
row labelled "Owner" would silently ask two questions instead of three, or state no location at all, and
look perfectly finished.

**THERE IS NO `Date` ROW IN THE GRID**, and that is refused too: the date line already carries the date
and is what `cardStartYear` reads to file the card in this collection's chronological running order, so a
grid row beside it would be a third copy of one fact.

**EACH FIELD IS MARKED IN ITS OWN WAY, AND THE MARKING IS FEEDBACK RATHER THAN A SCORE.** The reader
still grades themselves Again/Hard/Good/Easy; what the marks buy is the difference the literature
measures between a bare right-or-wrong (d = 0.05) and being shown the right answer (d = 0.32), so every
field shows what was typed AND what the work actually is.

- **Title** takes `nearMiss`, the one-slip tolerance the cloze box and the pretest already use.
- **Artist** is routinely given short — "Rembrandt" is right for "Rembrandt van Rijn" — so a value whose
  whole significant vocabulary sits inside the other counts, in BOTH directions, since a reader who gives
  the fuller form has not been less right. "Unknown" and "Anonymous" are one answer. The rule is written
  for any value of that shape rather than for names alone: it is what graded the location while that was
  a field, and is what would grade it again.
- **Date** is the one field with a third state. It is the only one where being nearly right is a fact
  rather than a judgement: a reader who says 1640 of a picture painted in 1642 knows when it was painted,
  and `ART_YEAR_NEAR` (25 years) is the width of that band. The years are read by `cardYears`, the site's
  own date reader, so a range, a `c.` and a BCE date are understood on both sides.

**THE CREDIT IS HELD BACK, AND THAT IS THE WHOLE DIFFICULTY.** `card.image` carries `title`, `desc` and
`credit`, and on every other card those are drawn beside the picture. Here every one of them answers the
question — a Commons credit line routinely reads "Rembrandt, *The Night Watch*, Rijksmuseum" — so the
front draws the picture and **nothing else**, and all three appear on the reveal, exactly as the picture
round holds its artefact's metadata back until the round is answered. The attribution the licence
requires is still given, one press away and on the same card; it is deferred, not dropped. **Any
implementation that leaks `title` or `credit` onto the front has broken the collection**, and it will
look perfectly fine while doing it, which is what the format's own test asserts first.

**THE ALT TEXT IS A REAL DESCRIPTION, AND IT NEVER NAMES THE WORK.** This format is more accessible than
the map card, not less: a shape on a globe cannot be described without answering the question, but a
painting can — "a company of militia in seventeenth-century dress crowding out of an arch into shadow" is
a fair question for a reader who cannot see it, and a fair alternative for one who can. So the rule is
**describe, never name**: no title, no artist, no gallery in the alt text. `add-card.js` refuses an alt
that carries the answer term or the artist the grid names.

**AN ARTWORK CARD IS OUT OF THE TEXT-ONLY MINIGAMES BY CONSTRUCTION**, as a map card is: those games deal
a question cold and this question is a picture. The exclusion lives in `gameCardIdSet` beside
`cardMapSpec` and needs no editorial judgement per card, so it needs no field. It IS in the **picture
round**, which is the one game whose question is a photograph. **And `undatable` is never set here**:
every work has a date — that is the collection's organising fact — so nothing in it is kept out of
Timeline.

## The background is a history and a description of the work

**"In the background section it should then give a history and description of the artwork."** That is the
one content rule the restart adds, and it is narrower than the house rule it sits inside. The abstract is
still exactly ten sentences in two blocks of five, still 270–330 words, still cited at five sources with
markers — and on this format the two blocks have jobs:

- **Sentences 1–5 DESCRIBE the work.** What is in it, how big it is, what it is made of, how it is
  composed, what a viewer standing in front of it sees. This is the half a reader cannot get from the
  picture alone and the half most cards get thinnest, because it is easier to write about a painter than
  about a painting.
- **Sentences 6–10 are its HISTORY.** Who commissioned it and why, what happened to it, where it has
  been, what was argued about it, how it came to be where it is now. The last of these matters more here
  than anywhere else on the site, because "where it is now" is the one thing on the answer side that the
  reader was shown rather than asked, so the prose is where it is explained rather than merely stated.

**The artist's biography is not the work's history**, and the commonest way this collection can go wrong
is a card that spends six sentences on Caravaggio and none on the picture. A sentence about the maker
earns its place where it explains the OBJECT.

**And the discovery-history rule still binds** (`docs/history-focus-plan.md`): at most about two of the
ten sentences may be about the modern people who excavated, attributed, restored or authenticated the
work, and the date line carries the dates of the WORK — `Painted`, `Carved`, `Cast`, `Made`, `Printed`,
`Woven`, `Completed` — never `Found` or `Excavated`.

## Copyright — the constraint that now decides what is IN the collection

**Folio links pictures, it does not host them, and the bar is public domain, CC BY or CC BY-SA** (see the
picture rule in CLAUDE.md). Wikimedia Commons hosts a file only where it is free **in the United States
and in the country of origin**, and there is no fair-use route on this site. So:

- **Before about 1900 the pictures are there.** A faithful photograph of a two-dimensional public-domain
  work is itself public domain, and Commons has the canon in high resolution.
- **Between about 1900 and 1945 it is mixed**, and it has to be checked work by work. Klimt, Munch,
  Schiele, Kandinsky, Mondrian and Malevich are clear; Picasso (d. 1973), Kahlo (d. 1954), Hopper and
  Pollock are not.
- **After about 1945 almost nothing painted can be shown.** *Guernica*, *Nighthawks*, *Marilyn Diptych*,
  *Spiral Jetty* — every one of them is in copyright and none of them can carry a picture here.

**AND SINCE THE RESTART THAT DECIDES MEMBERSHIP RATHER THAN FORMAT.** The old plan let a work that could
not be shown ship as an ordinary cloze card that described it in words. That escape hatch is gone with
the words: the question side shows no words, so a card with no picture is a card with no question. **A
work Folio cannot show is not carded in this collection at all.**

**THE COST IS REAL AND IS STATED RATHER THAN HIDDEN.** A thousand famous artworks that omits *Guernica*
is not the canon, and this collection is now that list. What it is instead is an honest one: **a thousand
works you can be shown and asked to name.** The two things that follow:

- **The twentieth-century decks are not a survey of twentieth-century art.** They are the part of it that
  is free — which in practice means Europe to about 1930, the artists who died early or long ago, the
  photographers whose work has fallen out of term, and the vast non-Western and anonymous material that
  never had a term to fall out of. Deck 9 is short for that reason and says so.
- **The works that had to leave belong somewhere, and that somewhere is World History.** A `wh-` card can
  ask about *Guernica* in words, with a cloze and three phrasings, exactly as it always could. Nothing is
  lost from the site; it is filed where the format fits.

**CHECK COMMONS BEFORE RESEARCHING A POST-1900 LINE, NOT AFTER**, and use `node
.claude/check-image-free.js "<file>"` before fetching a candidate — the corpus is 3,205 cards, 3,400-odd
glossary terms and 200 artefacts, and a picture already on one of them cannot be used here.

**A REPLICA OR A CAST CAN CARRY AN ARTWORK CARD, DISCLOSED ON BOTH CHANNELS.** Where every photograph of
the original is reserved — the Chauvet panels, the Lascaux hall — a full-size museum facsimile may stand
in, provided the caption says so at the reveal AND the alt text says so on the front, so the one reader
who meets the picture only in words is not told less than the reader who can see it. The rule against a
cast standing in for an object is about passing one off; disclosing it in both places is what makes this
allowed rather than an exception.

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
| The Twentieth Century to the Public-Domain Horizon, 1914–1944 | 1914–1918 | 41 | art-860–900 |
|  | 1919–1922 | 25 | art-901–925 |
|  | 1923–1928 | 35 | art-926–960 |
|  | 1929–1935 | 24 | art-961–984 |
|  | 1936–1944 | 16 | art-985–1000 |

Deck totals: Before History 80 · The Classical World 94 · Medieval Worlds 104 · The Fourteenth and
Fifteenth Centuries 116 · The Sixteenth Century 102 · The Baroque World 119 · Revolution and Romance
110 · The Modern Age 134 · The Twentieth Century 141. **1000.**

**DECK 9'S SLICES WERE RE-CUT AT THE RESTART AND THEIR IDS WENT WITH THEM.** The deck used to run to the
present in five subdecks of roughly fifteen years; it now stops at 1944 and its slices are four to six
years each, because that is where the works are. The ids moved with the titles — `art-1930` → `art-1918`,
`art-1945` → `art-1922`, `art-1960` → `art-1928`, `art-1980` → `art-1935` — which was free only because
**no card had shipped**: after a card exists a deck id is an address in `S.active` and in every reader's
own order, and the titles would have had to drift from the ids instead. `art-1914` kept its id and its
first year.

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

**The Twentieth Century and After takes 142 and is the deck the restart changed most**, which is the
copyright section above showing up in the allocation rather than as an apology. It used to carry
proportionally more movement cards than any other deck, on the reasoning that a movement can be asked in
words where a Rothko cannot; since the restart a card is a work with a picture or it is not a card, so
those lines are gone and the deck is what remains — the free part of the century, which is Europe to
about 1930, the artists who died early or long ago, photography out of term, and the anonymous and
non-Western material that never had a term to fall out of. **It is the one deck where the running order
is a smaller claim than its title**, and it says so at its own head.

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
enough that "most famous and significant" is a guess rather than a judgement, and almost nothing made in
those years can be shown at all. Twenty-four is the honest number; the plan does not pretend the next
twenty years are already sorted, and every one of the twenty-four is a work with a free photograph
because since the restart nothing else can be a card.

## What counts as visual art here

**In:** painting in every medium, sculpture, drawing, printmaking, mosaic, fresco, illuminated
manuscript and calligraphy where it is treated as an art rather than as a text, photography from 1839,
and the ceramics, metalwork, ivory, jade and textile that a culture's own art history treats as its major
art (Shang bronzes, Ru ware, Benin brass, the Bayeux Tapestry). **In every case it is a NAMED, SINGLE
OBJECT** — the Umataka flame pot, not Jōmon pottery; the Portland Vase, not Roman cameo glass.

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
`sculpture`, `print`, `drawing`, `mosaic`, `fresco`, `manuscript`, `photograph`, `object`, `textile`, `ivory`), then
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

**THERE ARE NO STYLE CARDS ANY MORE**, which retires a rule this section used to carry. A card whose
subject was a movement had to be illustrated by a work that had no card of its own, or *The Great Wave*
would appear on the "Japanese woodblock print" card and again on its own and teach the reader that two
questions have one answer. Since the restart a movement is not a card at all, so the difficulty does not
arise — and the movements are still taught, in the glossary terms every card links to and in the
background prose that names them.

**The glossary is the shared surface and it is where the saving is.** Many of the terms this collection
needs already exist: `Fresco`, `Bronze`, `Marble`, `Mosaic`, `Terracotta`, `Icon` and a dozen period
names were written for other collections and must be reused rather than re-keyed. Run
`node .claude/gloss-source-audit.js` and grep before writing a term.

**And it is the first collection whose cards will routinely auto-link into other collections' prose.**
`Impressionism`, `Cubism`, `Baroque` and `Renaissance` occur in card backgrounds all over the site, so a
new term here changes what a reader meets on a card written two years ago. `node
.claude/check-gloss-links.js` is the report that catches a link pointing at the wrong sense.

## The batch log

**THE RESTART — Sep 2026, on request.** Ten cards (`art-001`–`art-010`) were deleted, the format was
rebuilt around a wordless question and four typed answers, and the running order was swept. What the
sweep found and did is worth having before the next batch.

**THE FIRST TEN WERE NOT ARTWORK CARDS AND FOUR OF THEM COULD NOT HAVE BEEN.** `art-001` was ochre (a
material), `art-002` uranium-series dating (a method), `art-003` Blombos Cave, `art-004` Leang Bulu'
Sipong 4, `art-006` El Castillo and `art-008` Chauvet (sites). Only the Lion-man, the Venus of Hohle
Fels, the Vogelherd horse and the Leang Tedongnge pig were single works a reader could be shown and asked
to name — and the first four had no `artwork` flag at all, because their pictures illustrated rather than
depicted. **That is the whole of what "this should not be a history collection" was about**, and it is
the reason the test in "What a line in this list is" is four questions rather than one.

**THE GLOSSARY TERMS THOSE TEN PAIRED WITH WERE KEPT.** A glossary term is deck-agnostic and
self-contained by house rule, `Ochre` and `Chauvet_Cave` are legitimate entries whatever collection
prompted them, and other collections' prose already auto-links several. Deleting a cited term to tidy up
after a card is a loss with no gain.

**THE SWEEP'S OWN RULE: A LINE THAT NAMED A CLASS WAS REPLACED BY ITS BEST NAMED MEMBER**, in the same
years, rather than dropped and the slot left to be filled later. *Jōmon pottery* became the Umataka flame
pot; *Parietal art* became the Pech Merle panel it was about. A line naming a movement, a method, a
school, a market or a museum had no member to promote and was replaced outright by a work from the same
slice. **The year on every replaced line was checked against its neighbours**, because the running order
is the chronology and nothing on the page says when it takes a backward step.

**THE FIRST TWO CARDS SHIPPED WITH IT**, `art-001` the Lion-man of Hohlenstein-Stadel and `art-002` the
Vogelherd horse, and the opening of `art-iceage` was re-cut round them: Blombos, Leang Tedongnge, El
Castillo, Chauvet and the Pech Merle panel have **no free photograph in existence** — the published
images belong to the excavators and their journals — so under the new rule they could not be carded and
the slice now opens on the Swabian ivories, which Commons holds in high resolution. **A famous work can
be unshowable for want of a photographer as easily as for copyright**, and the check is `node
.claude/check-image-free.js` plus a Commons search BEFORE the research, not after. Both cards' glossary
terms already existed and were reused — **check before running `add-glossary.js`, which overwrites in
silence.**

**AND THE MODERN DECKS LOST WORKS RATHER THAN GAINING THEM.** With no picture-less card available any
more, *Guernica*, *Nighthawks*, the *Marilyn Diptych* and everything else still in term came out; see
"Copyright" above for where they went and why that is the honest answer rather than a gap.

**BATCH A2 — `art-004` TO `art-008`, Sep 2026.** The Vogelherd mammoth and bison, the Hohle Fels
waterbird, the Venus of Galgenberg and the Brno II figurine. Five findings are worth having before the
next batch.

**THE OPENING OF THIS DECK IS ONE HORIZON AND CANNOT BE ORDERED INSIDE ITSELF, SO ITS LINE-YEARS ARE
FLAT ON PURPOSE.** `art-001`–`art-007` are Aurignacian, and the published dates for them overlap end to
end: the Swabian ivories are given as 35,000 years old in most of the literature and as around 40,000
by the museums that hold them, and the Galgenberg figure is 32,000 by the charcoal from its own layer
and 36,000 by the later work. **The plan's year is the horizon's YOUNGER bound and the card carries the
real range**, which is what `art-003` already did — line 35,000, card `c. 40,000 – 35,000 years ago`.
Do not "correct" a line upward to match its card: `check-art-order.js` reads the plan, the plan is the
dealing order, and a raised line here puts a backward step in front of a shipped card that cannot be
renumbered.

**`art-009` AS PLANNED WAS NOT ONE OBJECT AND HAS BEEN REPLANNED** (done in batch A3 below; the finding
is kept because the shape recurs). The line read *The Kostenki 1 Venus*, and there is no such single
work: Kostenki I produced a series of female figurines in mammoth ivory and in marl, the English
reference article is titled in the PLURAL, and the best free photographs (an ivory figure 153 mm high
and a limestone one 137 mm, both Kunstkamera originals photographed at Hamburg in 2016–17) are of two
different objects. That fails the four-part test in "What a line in this list is" at its first question.
**Decide which object the line names — and say so in the line — before researching it**; a card whose
picture shows one figurine while its title names a group is the one shape this format cannot carry.

**A BLURRY PHOTOGRAPH IS STILL THE ONLY PHOTOGRAPH, AND THAT IS A REASON TO SHIP RATHER THAN TO WAIT.**
Commons holds exactly one free picture of the Hohle Fels waterbird and it is soft-focus through display
glass. It was shipped, because the alternative was to drop the oldest known depiction of a bird from a
collection whose subject is exactly that; **the object is legible and the card says what it is**. Weigh
the same way next time: the bar is whether the work can be recognised, not whether the photograph is
good.

**THE FIGURES CAME OFF THE MUSEUMS' OWN RECORDS, NOT OFF THE ENCYCLOPEDIAS, AND THEY DISAGREED.**
`museum-digital` carries the Tübingen catalogue entries for both Vogelherd pieces with inventory
numbers, dimensions and a described decoration (**the mammoth is 5 cm long, pierced between the legs as
a pendant, and blue from iron in the cave floor; the bison is 7.2 cm and has lost its head and its far
face**), and the Blaubeuren museum's own object page carries the waterbird's. The English-language
write-ups of the Galgenberg figure call its stone **serpentine**; the Lower Austrian provincial record
and the German sources call it **amphibolite schist**, which is what the card says. **Read the holding
museum's own record before the secondary literature.**

**AND THE `Location` CELL HAS TO CARRY THE CITY.** The first draft of `art-007` gave the location as
*Naturhistorisches Museum Wien, Austria* and a reader typing **Vienna** was marked wrong, the German name
of the city being nowhere in the string. That was a GRADING fault and the cell is no longer graded — the
rule survives as a plain editorial one, which is a weaker reason for exactly the same wording, since a
cell that could not be matched by the name of its own city cannot be read by a reader who does not know
the museum either. **A museum whose own name does not contain its town needs the town added**, which is
what `art-001` already does with *Museum Ulm, Ulm, Germany*. Type at the three fields and read the fourth
before shipping.


**BATCH A3 — the location stops being asked, and `art-009` is replanned (Sep 2026, on request).**
Two cards, `art-009` and `art-010`, and one change to the format itself.

**THE FOURTH FIELD IS GONE FROM THE QUESTION SIDE AND THE LOCATION IS STILL ON THE ANSWER.** The
request was to "remove the 'where is it now' from the question but ensure it's mentioned on the answer
side", and the whole of it is one entry taken out of `ART_FIELDS`. Nothing else moved: `location` is
still derived by `cardArtAnswers`, still required of every card by `add-card.js`, and still printed by
`cardFactsHTML`, which reads `facts` directly — so the row the reader is shown is the row the label
table is matching. **Both halves of that fail silently and in opposite directions** — a fourth input
coming back is a question the format no longer asks, and a grid that stops drawing the row is a fact
the reader simply never gets — so `test-artwork-cards.js` asserts both, and the one rule that lost its
teeth is kept in a weaker form: the `Location` cell was worded to carry its town because it was GRADED,
and it still carries it because a reader who does not know the museum cannot place it either.

**`art-009` IS NOW THE VENUS OF PŘEDMOSTÍ**, and the slot is what chose it. The line's year is fixed
and the deck is a timeline, so its replacement had to be a single object at the same horizon — which in
practice means the Moravian Pavlovian, the cluster `art-008` and `art-010` already sit in. The obvious
candidate, the ivory female head from Dolní Věstonice, was researched and **dropped for want of
sources**: its fame rests on being read as a portrait of the woman in the DV3 burial, and that argument
lives in Czech monographs and in scanned journal issues with no text layer, so the card could not have
been written to the five-source bar. The engraved tusk could: it is one object, it carries the name the
literature and Commons both use, its two best photographs are free, and — the thing the deck was short
of — **it is an engraving rather than a carving**, the first on a shelf of eight sculptures.

**ANTHROPOLOGIE (BRNO) IS THE OPEN JOURNAL THIS CORNER OF THE SUBJECT LIVES IN.** `puvodni.mzm.cz`
serves every issue from 1923 as a free PDF and its `search_all.php` takes a POST, which is how both
cards found their spines; the Moravian Museum's own reprints of Valoch's Předmostí papers are there in
English translation. **Its older scans have no text layer**, so a paper from the 1980s or 1990s can be
cited but not read — check before planning a claim on one. Three hosts that look obvious are not:
`journals.openedition.org` and `jstor.org` both answer 200 with a bot wall, and `ehu.eus`, which holds
the open Veleia paper on Pavlov and Předmostí, resets the connection.

**A GRADED DATE FIELD NEEDS A RANGE, AND THESE OBJECTS ARE WHY.** `artYearBand` gives a 30,000-year-old
work a band of about 900 years, which is right; what is not right is a single-point date line on an
object whose published ages differ by thousands. `art-010` first carried `c. 30,000 years ago` and
marked a reader typing the textbook **27,000** wrong — while the card's own prose explains that 27,000
is the figure usually quoted. The fix is the DATE LINE, not the band: both cards now carry the span
their sources actually support, and the Věstonice card's third why-question is about the two numbers.
**Type the textbook answer at the field before shipping a Palaeolithic card.**

**AND THE CALIBRATION GAP PUTS THE THREE MORAVIAN CARDS OUT OF ORDER WITH EACH OTHER.** Brno II's
`23,680 BP` is an uncalibrated radiocarbon age and calibrates to about 28,000–27,000 years ago, where
Dolní Věstonice and Předmostí calibrate to about 31,000–29,000 — so **`art-008` is the YOUNGEST of the
three and sits first**, because its line-year was set from a popular figure. The lines are all at one
horizon and `check-art-order.js` is content; the cards' own ranges overlap, which is exactly what the
Aurignacian run at `art-002`–`art-006` does. It is recorded rather than repaired because a shipped card
cannot be renumbered — **but if this deck's opening is ever re-cut, Brno II belongs after these two.**

**A DEBT FROM BATCH A2, STATED SO IT IS NOT LOST: `art-004` to `art-008` SHIPPED WITHOUT THEIR PAIRED
GLOSSARY TERMS.** The house rule is that a card ships with an entry for its own answer term in the same
commit, and `art-001`–`art-003` have theirs. *Vogelherd mammoth*, *Vogelherd bison*, *Hohle Fels
waterbird*, *Venus of Galgenberg* and *Brno II figurine* have none, so nothing in a later card's prose
can auto-link to them. `art-009` and `art-010` shipped with theirs; the five are owed.

**BATCH A4 — `art-011` TO `art-020`, Sep 2026: the Ice Age subdeck is finished.** Willendorf, Lespugue,
Brassempouy, Laussel, the Pech Merle spotted horses, the Hall of the Bulls, the Altamira ceiling, *Bison
Licking Insect Bite*, the *Fawn with Birds* and the *Swimming Reindeer*, each with its paired glossary term
(Willendorf's already existed and was reused). Six findings.

**THE APOLLO 11 CAVE PLAQUES CAME OUT OF THE RUNNING ORDER, AND THE LINES BEHIND THEM MOVED UP ONE.** Both
Commons photographs of the original slabs have the words *APOLLO 11 STONE — AGE: 30,000 YEARS* printed into
the image, which is the answer written on the question side, and Folio never alters a picture; the one clean
file is a replica in Burgos painted red where the original figure is dark, which fails the facsimile rule's
own premise that the copy shows what the original looks like. The line also named a group of plaques rather
than one object. Nothing had shipped past `art-010`, so the nine lines behind it moved up one and `art-019`
became the Mas-d'Azil *Fawn with Birds* spear-thrower, which keeps the subdeck at twenty. **It costs the
subdeck its only African work**, which is stated rather than hidden; a free photograph of the Apollo 11
slabs would put it back, and the same-horizon replacements checked did not survive either — the Venus of
Savignano has no openable literature, and the free photographs of the Venus of Petřkovice show a replica
and a modern statue.

**A SUBJECT THAT IS ALSO AN ARTEFACT IS DEALT ONCE IN THE PICTURE ROUND.** The Venus of Willendorf is one
of the 200 artefacts, and `picturePool` keeps one entry per label with the artefacts read first, so the card
stands behind the artefact there — which is the pool's own "never offer the answer twice" rule working.
`test-artwork-cards.js` asserted that every artwork card is in the pool and now names the shadowed subjects
instead. **Grep `artefacts.js` for a work's name before carding it**: the picture must also differ from the
artefact's, which `check-image-free.js` catches.

**TWO CAVE PAINTINGS SHIP ON DISCLOSED FACSIMILES.** Pech Merle is shown by the full-size replica in the
Anthropos pavilion at Brno, and the Hall of the Bulls by Lascaux II; both say so in the `alt` as well as the
caption. Altamira did not need one: a 1959 photograph of the ceiling itself is free, and it predates the
Neocueva, so it cannot be the replica.

**THE DATE LINE CARRIES THE NUMBER A READER WILL TYPE, AND ON THIS DECK THAT MEANS TWO SCALES.** Altamira's
bison are about 14,000 radiocarbon years, which calibrates to about 18,500–15,200 years ago; the line reads
`c. 18,500 – 14,000 years ago` so the textbook figure is not marked wrong, and the prose says which number is
which — the `art-010` rule again. **And years-ago is not BCE**: the Middle Magdalenian's 18,000–16,000 years
ago is 16,000–14,000 BCE, which is where the *Fawn with Birds* line already sat.

**WHERE THE *FAWN WITH BIRDS* IS HELD IS THE WEAKEST FACT IN THE BATCH.** The Musée d'Archéologie nationale's
own fawn-and-bird thrower is the Bédeilhac piece, a different object; exhibition captions name the lender as
the Ariège département's museum; and the département's own press dossier says the Mas-d'Azil museum shows a
reproduction. The grid says *Musée de la Préhistoire, Le Mas-d'Azil* and the prose claims only that the
museum presents it as its most celebrated piece. **Correct the grid if a source says where the original is
kept.**

**ONE FRENCH SOURCE A CARD BINDS HARD ON THIS DECK**, the French excavation literature being where most of
it lives; several claims (Brassempouy as *mammoth* ivory, Lespugue at 28,000 years, the La Madeleine bison's
finder) were dropped rather than cited to a second French work. `SAME_LANGUAGE_OK` in `check-cards.js` is the
declared route if a card ever needs two.

# The list

## Before History, to 700 BCE — `art-early`

### Ice Age art, before 10,000 BCE — `art-iceage`

    art-001  The Lion-man of Hohlenstein-Stadel — Swabia, c. 40,000 years ago
    art-002  The Vogelherd horse — Swabia, c. 35,000 years ago
    art-003  The Venus of Hohle Fels — Swabia, c. 35,000 years ago
    art-004  The Vogelherd mammoth — Swabia, c. 35,000 years ago
    art-005  The Vogelherd bison — Swabia, c. 35,000 years ago
    art-006  The Hohle Fels waterbird — Swabia, c. 35,000 years ago
    art-007  The Venus of Galgenberg — Austria, c. 32,000 years ago
    art-008  The Brno II figurine — Moravia, c. 28,000 years ago
    art-009  The Venus of Předmostí — Moravia, c. 26,000 BCE
    art-010  The Venus of Dolní Věstonice — Moravia, c. 26,000 BCE
    art-011  The Venus of Willendorf — Austria, c. 25,000 BCE
    art-012  The Venus of Lespugue — France, c. 24,000 BCE
    art-013  The Venus of Brassempouy — France, c. 23,000 BCE
    art-014  The Venus of Laussel — France, c. 23,000 BCE
    art-015  The Pech Merle spotted horse panel — France, c. 23,000 BCE
    art-016  The Hall of the Bulls, Lascaux — France, c. 17,000 BCE
    art-017  The Altamira polychrome ceiling — Spain, c. 15,000 BCE
    art-018  Bison Licking an Insect Bite — La Madeleine, c. 15,000 BCE
    art-019  The Fawn with Birds spear-thrower — Le Mas-d'Azil, c. 14,000 BCE
    art-020  The Swimming Reindeer — Montastruc, c. 13,000 BCE

### The first villages, 10,000–3000 BCE — `art-neolithic`

    art-021  The Shigir Idol — the Urals, c. 9600 BCE
    art-022  Göbekli Tepe Pillar 43, the Vulture Stone — Anatolia, c. 9500 BCE
    art-023  The Bhimbetka Zoo Rock panel — India, c. 8000 BCE
    art-024  The Cueva de las Manos hand-stencil panel — Argentina, c. 7300 BCE
    art-025  The 'Ain Ghazal monumental figure — Jordan, c. 7200 BCE
    art-026  The Jericho plastered skull — the Levant, c. 7000 BCE
    art-027  The Lepenski Vir Danubius boulder — Serbia, c. 6500 BCE
    art-028  The Seated Woman of Çatalhöyük — Anatolia, c. 6000 BCE
    art-029  The Sefar Great God panel, Tassili n'Ajjer — the Sahara, c. 6000 BCE
    art-030  The Thinker of Cernavodă — Romania, c. 5000 BCE
    art-031  The Banpo human-face fish basin — China, c. 4800 BCE
    art-032  The Varna Grave 43 gold sceptre — Bulgaria, c. 4500 BCE
    art-033  The Gebel el-Arak knife handle — Egypt, c. 3450 BCE
    art-034  The Newgrange entrance stone — Ireland, c. 3200 BCE
    art-035  The Uruk Vase — Mesopotamia, c. 3200 BCE
    art-036  The Mask of Warka — Uruk, c. 3100 BCE
    art-037  The Battlefield Palette — Egypt, c. 3100 BCE

### The Bronze Age, 3000–1500 BCE — `art-bronze`

    art-038  The Narmer Palette — Egypt, c. 3100 BCE
    art-039  The Guennol Lioness — Mesopotamia, c. 3000 BCE
    art-040  The Umataka flame pot — Japan, c. 3000 BCE
    art-041  The Harp Player of Keros — the Cyclades, c. 2800 BCE
    art-042  The Tell Asmar worshipper statue — Mesopotamia, c. 2750 BCE
    art-043  The Standard of Ur — Sumer, c. 2600 BCE
    art-044  The Ram in a Thicket — Ur, c. 2600 BCE
    art-045  The Khafre Enthroned statue — Egypt, c. 2570 BCE
    art-046  The Bull-Headed Lyre of Ur — Sumer, c. 2550 BCE
    art-047  The Great Sphinx of Giza — Egypt, c. 2500 BCE
    art-048  Menkaure and His Queen — Egypt, c. 2490 BCE
    art-049  The Seated Scribe — Saqqara, c. 2450 BCE
    art-050  Ti Watching a Hippopotamus Hunt — Saqqara, c. 2400 BCE
    art-051  The Indus Valley Dancing Girl — Mohenjo-daro, c. 2300 BCE
    art-052  The Mask of Sargon — Nineveh, c. 2250 BCE
    art-053  The Victory Stele of Naram-Sin — Akkad, c. 2250 BCE
    art-054  Gudea, Seated Statue B — Lagash, c. 2100 BCE
    art-055  The Indus Priest-King — Mohenjo-daro, c. 2000 BCE
    art-056  The Stele of Hammurabi — Babylon, c. 1750 BCE
    art-057  The Knossos Snake Goddess faience figurine — Crete, c. 1600 BCE
    art-058  The Spring Fresco — Akrotiri, Thera, c. 1600 BCE
    art-059  The Nebra Sky Disc — Germany, c. 1600 BCE
    art-060  The Mask of Agamemnon — Mycenae, c. 1550 BCE

### Empires and the early Iron Age, 1500–700 BCE — `art-lbronze`

    art-061  The Bull-Leaping Fresco — Knossos, c. 1500 BCE
    art-062  The Vaphio Cups — Laconia, c. 1500 BCE
    art-063  Nebamun Hunting in the Marshes — Egypt, c. 1350 BCE
    art-064  Akhenaten, Nefertiti and Three Daughters — Amarna, c. 1350 BCE
    art-065  The Bust of Nefertiti — Amarna, c. 1345 BCE
    art-066  The Mask of Tutankhamun — Egypt, c. 1323 BCE
    art-067  The Book of the Dead of Hunefer — Egypt, c. 1275 BCE
    art-068  The Abu Simbel colossi — Egypt, c. 1264 BCE
    art-069  The Lion Gate — Mycenae, c. 1250 BCE
    art-070  The Houmuwu ding — Anyang, China, c. 1200 BCE
    art-071  San Lorenzo Colossal Head 1 — Olmec Mexico, c. 1200 BCE
    art-072  The Sanxingdui bronze standing figure — China, c. 1200 BCE
    art-073  The Las Limas Monument 1 — Olmec Mexico, c. 900 BCE
    art-074  The Chavín Lanzón — Peru, c. 900 BCE
    art-075  The Tello Obelisk — Chavín de Huántar, Peru, c. 900 BCE
    art-076  The Ashurnasirpal II winged genius relief — Nimrud, c. 870 BCE
    art-077  The Black Obelisk of Shalmaneser III — Assyria, c. 825 BCE
    art-078  The Dipylon Amphora — Athens, c. 750 BCE
    art-079  The Khorsabad lamassu — Assyria, c. 715 BCE
    art-080  The Mona Lisa of Nimrud ivory head — Assyria, c. 715 BCE

## The Classical World, 700 BCE–500 CE — `art-classic`

### The Greek awakening, 700–480 BCE — `art-archaic`

    art-081  The Eleusis Amphora — Attica, c. 670 BCE
    art-082  The Lady of Auxerre — Crete, c. 640 BCE
    art-083  The Chigi Vase — Corinth, c. 640 BCE
    art-084  The New York Kouros — Attica, c. 590 BCE
    art-085  Kleobis and Biton — Delphi, c. 580 BCE
    art-086  The François Vase — Kleitias and Ergotimos, c. 570 BCE
    art-087  The Sophilos Dinos — Athens, c. 570 BCE
    art-088  The Peplos Kore — Athens, c. 530 BCE
    art-089  Exekias's Achilles and Ajax Playing a Game — c. 530 BCE
    art-090  The Anavysos Kouros — Attica, c. 530 BCE
    art-091  The Siphnian Treasury frieze — Delphi, c. 525 BCE
    art-092  The Andokides Painter's bilingual amphora — Athens, c. 525 BCE
    art-093  The Etruscan Sarcophagus of the Spouses — Cerveteri, c. 520 BCE
    art-094  The Euphronios Krater — Athens, c. 515 BCE
    art-095  The Apollo of Veii — Etruria, c. 510 BCE
    art-096  The Apadana tribute-bearers relief — Persepolis, c. 500 BCE

### Classical Greece, 480–330 BCE — `art-classical`

    art-097  The Tomb of the Diver — Paestum, c. 480 BCE
    art-098  The Kritios Boy — Athens, c. 480 BCE
    art-099  The Berlin Foundry Cup — Athens, c. 480 BCE
    art-100  The Tyrannicides of Kritios and Nesiotes — Athens, 477 BCE
    art-101  The Charioteer of Delphi — c. 470 BCE
    art-102  The Riace Bronzes — c. 460 BCE
    art-103  The Artemision Bronze — c. 460 BCE
    art-104  The east pediment of the Temple of Zeus — Olympia, c. 460 BCE
    art-105  Polykleitos's Doryphoros — c. 440 BCE
    art-106  The Parthenon frieze — Athens, c. 440 BCE
    art-107  The Achilles Painter's Muse on Mount Helikon lekythos — Athens, c. 440 BCE
    art-108  Phidias's Athena Parthenos — Athens, c. 438 BCE
    art-109  The Parthenon Centauromachy metope — Athens, c. 438 BCE
    art-110  The Parthenon pediments — Athens, c. 435 BCE
    art-111  The Grave Stele of Ampharete — Athens, c. 430 BCE
    art-112  The Nike of Paionios — Olympia, c. 420 BCE
    art-113  The Erechtheion Caryatids — Athens, c. 415 BCE
    art-114  Nike Adjusting Her Sandal — the Athena Nike parapet, c. 410 BCE
    art-115  The Grave Stele of Hegeso — Athens, c. 410 BCE
    art-116  The Nereid Monument — Xanthos, c. 390 BCE
    art-117  The Mausolus statue from Halicarnassus — c. 353 BCE
    art-118  Praxiteles's Aphrodite of Knidos — c. 350 BCE
    art-119  Praxiteles's Hermes and the Infant Dionysus — c. 340 BCE
    art-120  The Abduction of Persephone fresco — Vergina, c. 336 BCE

### The Hellenistic world, 330–30 BCE — `art-hellenistic`

    art-121  The Apoxyomenos of Lysippos — c. 330 BCE
    art-122  The Stag Hunt Mosaic of Gnosis — Pella, c. 325 BCE
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
    art-133  The Ai-Khanoum Cybele plaque — Afghanistan, c. 145 BCE
    art-134  The Venus de Milo — c. 130 BCE
    art-135  The Boxer at Rest — c. 100 BCE
    art-136  The Drunken Old Woman — a Roman copy after a Hellenistic bronze, c. 100 BCE
    art-137  The Alexander Mosaic — Pompeii, c. 100 BCE
    art-138  The Northern Gateway of the Great Stupa — Sanchi, c. 50 BCE
    art-139  The Head of a Roman Patrician from Otricoli — c. 50 BCE
    art-140  The Villa of the Mysteries frieze — Pompeii, c. 50 BCE
    art-141  The cubiculum of the Villa of P. Fannius Synistor — Boscoreale, c. 50 BCE
    art-142  The Laocoön and His Sons — c. 40 BCE

### Rome and the first centuries, 30 BCE–200 CE — `art-rome`

    art-143  The Augustus of Prima Porta — c. 20 BCE
    art-144  The Garden Room of the Villa of Livia — c. 20 BCE
    art-145  The Ara Pacis reliefs — Rome, 13–9 BCE
    art-146  The Gemma Augustea — c. 10 CE
    art-147  The Boscoreale Cups — Rome, c. 10 CE
    art-148  The Portland Vase — Rome, c. 15 CE
    art-149  The Portrait of Aline — Hawara, Egypt, c. 24 CE
    art-150  The Bimaran Casket — Gandhara, c. 50 CE
    art-151  The Arch of Titus reliefs — Rome, c. 81 CE
    art-152  The Bronze Galloping Horse of Wuwei — China, c. 100 CE
    art-153  The Nazca hummingbird geoglyph — Peru, c. 100 CE
    art-154  Trajan's Column — Rome, 113 CE
    art-155  The Kushan Kanishka statue — India, c. 130 CE
    art-156  The Fasting Siddhartha of Sikri — Gandhara, c. 150 CE
    art-157  The Mathura Buddha — India, c. 150 CE
    art-158  The Palmyrene funerary relief of Aqmat — Syria, c. 150 CE
    art-159  The Equestrian Statue of Marcus Aurelius — c. 175 CE

### Late antiquity, 200–500 CE — `art-lateantique`

    art-160  The Tepantitla Tlalocan mural — Teotihuacan, c. 200 CE
    art-161  The Dura-Europos synagogue west wall paintings — Syria, c. 245 CE
    art-162  The Ludovisi Battle Sarcophagus — Rome, c. 250 CE
    art-163  The portrait of the Four Tetrarchs — c. 300 CE
    art-164  The catacomb painting of the Good Shepherd — Rome, c. 300 CE
    art-165  The Colossus of Constantine — Rome, c. 315 CE
    art-166  The Arch of Constantine frieze — Rome, 315 CE
    art-167  The Sarcophagus of Junius Bassus — Rome, 359 CE
    art-168  The Admonitions Scroll — attributed to Gu Kaizhi, c. 400 CE
    art-169  The Mausoleum of Galla Placidia mosaics — Ravenna, c. 430 CE
    art-170  The Santa Maria Maggiore mosaics — Rome, c. 435 CE
    art-171  The Yungang Cave 20 seated Buddha — China, c. 460 CE
    art-172  The Bodhisattva Padmapani, Ajanta Cave 1 — India, c. 475 CE
    art-173  The Gupta Sarnath Buddha — India, c. 475 CE
    art-174  The Guyang Cave Buddha, Longmen — China, c. 495

## Medieval Worlds, 500–1300 — `art-medieval`

### The sixth to eighth centuries, 500–800 — `art-500`

    art-175  The Mogao Cave 249 ceiling mural — Dunhuang, c. 520
    art-176  The Barberini Ivory — Constantinople, c. 525
    art-177  The Vienna Genesis — Syria or Constantinople, c. 540
    art-178  The apse mosaic of San Vitale — Ravenna, 547
    art-179  Justinian and His Attendants — San Vitale, 547
    art-180  Theodora and Her Attendants — San Vitale, 547
    art-181  The Maijishan Cave 44 seated Buddha — China, c. 550
    art-182  The Christ Pantocrator of Sinai — c. 550
    art-183  The Virgin and Child with Saints Theodore and George — Sinai, c. 550
    art-184  The Rabbula Gospels — Syria, 586
    art-185  The Hōryū-ji Shaka triad — Japan, 623
    art-186  The Sutton Hoo shoulder-clasps and purse lid — England, c. 625
    art-187  The Sutton Hoo helmet — England, c. 625
    art-188  The Mamallapuram Descent of the Ganges — India, c. 650
    art-189  The Book of Durrow — c. 680
    art-190  The Palenque Pakal sarcophagus lid — Mexico, 683
    art-191  The Dome of the Rock mosaics — Jerusalem, 691
    art-192  The Barada mosaic panel, Great Mosque of Damascus — Syria, c. 705
    art-193  The Lindisfarne Gospels — c. 715
    art-194  The Umayyad frescoes of Qusayr Amra — c. 740
    art-195  The Mshatta facade — Jordan, c. 743
    art-196  The Ruthwell Cross — Northumbria, c. 750
    art-197  The Great Buddha of Tōdai-ji — Nara, 752
    art-198  The Shōsōin five-stringed biwa — Nara, c. 756
    art-199  The Ravana Shaking Mount Kailasa relief — Ellora, c. 760
    art-200  The Maya Bonampak murals — Mexico, c. 790

### The ninth to eleventh centuries, 800–1050 — `art-800`

    art-201  The Book of Kells — c. 800
    art-202  The Coronation Gospels — Aachen, c. 800
    art-203  The Lorsch Gospels ivory book cover — Aachen, c. 810
    art-204  The Borobudur ship relief — Java, c. 825
    art-205  The Utrecht Psalter — Reims, c. 830
    art-206  The Oseberg animal-head post — Norway, c. 834
    art-207  The Khludov Psalter — Constantinople, c. 840
    art-208  The Prambanan reliefs — Java, c. 850
    art-209  The Lindau Gospels cover — c. 880
    art-210  The Blue Qur'an — North Africa, c. 900
    art-211  The Nishapur epigraphic ware dish — Iran, c. 930
    art-212  The Paris Psalter — Constantinople, c. 950
    art-213  The Harbaville Triptych — Byzantium, c. 950
    art-214  Li Cheng's A Solitary Temple amid Clearing Peaks — China, c. 960
    art-215  The Jelling stone — Denmark, c. 965
    art-216  The Great Mosque of Córdoba mihrab mosaics — 965
    art-217  The Pyxis of al-Mughira — Córdoba, 968
    art-218  The Gero Crucifix — Cologne, c. 970
    art-219  The Gospels of Otto III — Reichenau, c. 1000
    art-220  The Chola bronze Nataraja — India, c. 1000
    art-221  Fan Kuan's Travellers among Mountains and Streams — China, c. 1000
    art-222  The Toltec Atlantean figures of Tula — Mexico, c. 1000
    art-223  The Bernward Doors — Hildesheim, 1015
    art-224  The Kandariya Mahadeva temple sculpture — Khajuraho, c. 1030

### Romanesque and Song, 1050–1150 — `art-1050`

    art-225  The Chola bronze Shiva Vinadhara — Tamil Nadu, c. 1050
    art-226  The Byōdō-in Amida by Jōchō — Japan, 1053
    art-227  The Urnes stave church north portal — Norway, c. 1070
    art-228  The Bayeux Tapestry — c. 1070
    art-229  Guo Xi's Early Spring — China, 1072
    art-230  Su Shi's Wood and Rock — China, c. 1080
    art-231  The Saint-Savin-sur-Gartempe vault paintings — c. 1100
    art-232  The Doubting Thomas relief, Santo Domingo de Silos — Spain, c. 1100
    art-233  The Ru ware narcissus basin — Northern Song China, c. 1100
    art-234  The Gloucester Candlestick — England, c. 1110
    art-235  Wiligelmo's Modena reliefs — c. 1110
    art-236  Emperor Huizong's Auspicious Cranes — China, 1112
    art-237  The Moissac portal — c. 1115
    art-238  Zhang Zeduan's Along the River During the Qingming Festival — c. 1120
    art-239  The Christ in Majesty of Sant Climent de Taüll — Catalonia, c. 1123
    art-240  The Vézelay tympanum — c. 1125
    art-241  The Gislebertus tympanum at Autun — c. 1130
    art-242  The Genji Monogatari Emaki — Japan, c. 1130
    art-243  The west portal tympanum of Saint-Denis — France, c. 1140

### Gothic and the thirteenth century, 1150–1300 — `art-1150`

    art-244  The Cloisters Cross — England, c. 1150
    art-245  The Chōjū-jinbutsu-giga scrolls — Japan, c. 1150
    art-246  The Hungry Ghosts Scroll — Japan, c. 1150
    art-247  The Angkor Wat bas-reliefs — Cambodia, c. 1150
    art-248  The Chartres royal portal jamb figures — c. 1150
    art-249  The Stavelot Triptych and Mosan enamel — c. 1156
    art-250  The Winchester Bible — c. 1160
    art-251  The Baptistery doors of Bonanno Pisano — Pisa, c. 1180
    art-252  Nicholas of Verdun's Klosterneuburg Altar — 1181
    art-253  Liang Kai's Immortal in Splashed Ink — China, c. 1200
    art-254  Liang Kai's Sixth Patriarch Chopping Bamboo — China, c. 1200
    art-255  Unkei's Niō guardians at Tōdai-ji — Japan, 1203
    art-256  The Kitano Tenjin Engi handscroll — Japan, c. 1219
    art-257  The Notre-Dame de la Belle Verrière window — Chartres, c. 1220
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
    art-275  Guido da Siena's Madonna and Child Enthroned — Siena, c. 1285
    art-276  Cimabue's Crucifix at Santa Croce — c. 1288
    art-277  Cimabue's Santa Trinita Maestà — c. 1290
    art-278  Zhao Mengfu's Autumn Colours on the Que and Hua Mountains — China, 1296

## The Fourteenth and Fifteenth Centuries — `art-1300s`

### 1300–1350 — `art-1300`

    art-279  The Ife bronze head of an Ooni — Nigeria, c. 1300
    art-280  The Hereford Mappa Mundi — England, c. 1300
    art-281  Qian Xuan's Wang Xizhi Watching Geese — China, c. 1300
    art-282  Giovanni Pisano's Pistoia pulpit — 1301
    art-283  Giotto's Scrovegni Chapel frescoes — Padua, 1305
    art-284  Giotto's Lamentation — Padua, 1305
    art-285  The Codex Manesse — Zurich, c. 1305
    art-286  Giovanni Pisano's Madonna della Cintola — c. 1305
    art-287  Giotto's Ognissanti Madonna — c. 1310
    art-288  The Öljeitü mihrab of the Friday Mosque of Isfahan — Persia, 1310
    art-289  Duccio's Maestà — Siena, 1311
    art-290  The Rashid al-Din World History illustrations — Persia, c. 1314
    art-291  The Chora Church mosaics and frescoes — Constantinople, c. 1315
    art-292  Simone Martini's Maestà — Siena, 1315
    art-293  The Queen Mary Psalter — England, c. 1320
    art-294  The Luttrell Psalter — England, c. 1330
    art-295  Simone Martini's Annunciation — 1333
    art-296  Taddeo Gaddi's Presentation of the Virgin — Florence, c. 1335
    art-297  The Great Mongol Shahnama — Persia, c. 1335
    art-298  Andrea Pisano's Florence Baptistery doors — 1336
    art-299  The Psalter of Robert de Lisle — England, c. 1339
    art-300  Ambrogio Lorenzetti's Allegory of Good and Bad Government — Siena, 1339
    art-301  Pietro Lorenzetti's Birth of the Virgin — 1342
    art-302  Ni Zan's Six Gentlemen — China, 1345
    art-303  The Triumph of Death — Camposanto, Pisa, c. 1350

### 1350–1400 — `art-1350`

    art-304  Huang Gongwang's Dwelling in the Fuchun Mountains — China, 1350
    art-305  The Vyšší Brod Altarpiece — Bohemia, c. 1350
    art-306  The David Vases — Jingdezhen, 1351
    art-307  The Chunyang Hall murals of the Yongle Palace — Shanxi, c. 1358
    art-308  Master Theodoric's Karlštejn panels — Bohemia, c. 1360
    art-309  The Parement de Narbonne — France, c. 1375
    art-310  Theophanes the Greek's Novgorod frescoes — 1378
    art-311  The Bohun Psalter — England, c. 1380
    art-312  The Apocalypse Tapestry — Angers, c. 1380
    art-313  The Très Belles Heures de Notre-Dame of Jean de Berry — c. 1390
    art-314  The Wilton Diptych — England, c. 1395
    art-315  The Westminster Portrait of Richard II — England, c. 1395
    art-316  Claus Sluter's Well of Moses — Dijon, 1395
    art-317  Melchior Broederlam's Dijon Altarpiece — 1399

### 1400–1440 — `art-1400`

    art-318  Claus Sluter's Mourners of the tomb of Philip the Bold — c. 1400
    art-319  The Yongle-era gilt-bronze Vajradhara — China, c. 1400
    art-320  The Divan of Sultan Ahmad Jalayir — Baghdad, c. 1400
    art-321  The early Benin bronze head of an Oba — Nigeria, c. 1400
    art-322  The Boucicaut Hours — Paris, c. 1401
    art-323  Ghiberti's Sacrifice of Isaac panel — 1401
    art-324  Brunelleschi's Sacrifice of Isaac panel — 1401
    art-325  Donatello's Saint Mark — Orsanmichele, Florence, c. 1413
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
    art-337  Fra Angelico's Cortona Annunciation — c. 1430
    art-338  The Ghent Altarpiece — Hubert and Jan van Eyck, 1432
    art-339  Jan van Eyck's Man in a Red Turban — 1433
    art-340  Jan van Eyck's Annunciation — c. 1434
    art-341  Jan van Eyck's Arnolfini Portrait — 1434
    art-342  Donatello's Cantoria — Florence, c. 1435
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
    art-363  Jean Fouquet's Hours of Étienne Chevalier — c. 1460
    art-364  Benozzo Gozzoli's Procession of the Magi — Florence, 1461
    art-365  Filippo Lippi's Madonna and Child with Two Angels — c. 1465
    art-366  Piero della Francesca's Resurrection — c. 1465
    art-367  Dieric Bouts's Last Supper — 1468

### 1470–1500 — `art-1470`

    art-368  Piero della Francesca's Montefeltro diptych — c. 1470
    art-369  Sesshū Tōyō's Winter Landscape — Japan, c. 1470
    art-370  Shen Zhou's Lofty Mount Lu — China, c. 1470
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
    art-390  Bihzad's The Seduction of Yusuf — Herat, c. 1490
    art-391  Albrecht Dürer's Self-Portrait at Twenty-Two — 1493
    art-392  Leonardo da Vinci's The Last Supper — Milan, 1498
    art-393  Albrecht Dürer's Apocalypse woodcuts — 1498
    art-394  Michelangelo's Pietà — Rome, 1499

## The Sixteenth Century — `art-1500s`

### 1500–1520 — `art-1500`

    art-395  Hieronymus Bosch's The Garden of Earthly Delights — c. 1500
    art-396  Albrecht Dürer's Self-Portrait — 1500
    art-397  Botticelli's Mystic Nativity — 1501
    art-398  Leonardo da Vinci's Mona Lisa — c. 1503
    art-399  Michelangelo's Doni Tondo — Florence, c. 1504
    art-400  Michelangelo's David — Florence, 1504
    art-401  Giorgione's Castelfranco Madonna — c. 1504
    art-402  Raphael's Marriage of the Virgin — 1504
    art-403  Tilman Riemenschneider's Altar of the Holy Blood — Germany, 1505
    art-404  Raphael's Madonna of the Meadow — 1506
    art-405  Giorgione's The Tempest — c. 1508
    art-406  Leonardo's Study of the Fetus in the Womb — c. 1510
    art-407  Giorgione and Titian's Sleeping Venus — c. 1510
    art-408  Raphael's The School of Athens — Vatican, 1511
    art-409  Michelangelo's Sistine Chapel ceiling — Rome, 1512
    art-410  The Creation of Adam — Sistine Chapel, 1512
    art-411  Raphael's Galatea — 1512
    art-412  Raphael's Sistine Madonna — 1512
    art-413  Albrecht Dürer's Knight, Death and the Devil — 1513
    art-414  Albrecht Dürer's Melencolia I — 1514
    art-415  Raphael's Portrait of Baldassare Castiglione — c. 1515
    art-416  Raphael's La Velata — c. 1515
    art-417  Albrecht Dürer's Rhinoceros — 1515
    art-418  Matthias Grünewald's Isenheim Altarpiece — c. 1515
    art-419  Michelangelo's Moses — Rome, c. 1515
    art-420  Michelangelo's Dying Slave — c. 1515
    art-421  Hieronymus Bosch's The Haywain Triptych — c. 1516
    art-422  Titian's Assumption of the Virgin — Venice, 1518

### 1520–1550 — `art-1520`

    art-423  The Benin Queen Mother head of Idia — Nigeria, c. 1520
    art-424  The Feather Headdress of Moctezuma — Mexico, c. 1520
    art-425  Rosso Fiorentino's Descent from the Cross — 1521
    art-426  Hans Holbein's The Body of the Dead Christ in the Tomb — 1521
    art-427  Lucas Cranach the Elder's Luther as Junker Jörg — 1522
    art-428  Titian's Bacchus and Ariadne — 1523
    art-429  Parmigianino's Self-Portrait in a Convex Mirror — 1524
    art-430  Sultan Muhammad's Court of Gayumars — Persia, c. 1525
    art-431  Pontormo's Deposition from the Cross — 1528
    art-432  Pontormo's Portrait of a Halberdier — Florence, c. 1529
    art-433  Albrecht Altdorfer's The Battle of Alexander at Issus — 1529
    art-434  Correggio's Assumption of the Virgin — Parma, 1530
    art-435  Jean Clouet's Portrait of Francis I — France, c. 1530
    art-436  Correggio's Jupiter and Io — c. 1532
    art-437  Lucas Cranach the Elder's Venus — 1532
    art-438  Hans Holbein the Younger's The Ambassadors — 1533
    art-439  Michelangelo's Medici Chapel tombs — Florence, 1534
    art-440  Parmigianino's Madonna with the Long Neck — c. 1535
    art-441  The Shahnama of Shah Tahmasp — Persia, c. 1535
    art-442  Hans Holbein's Portrait of Henry VIII — c. 1537
    art-443  Titian's Venus of Urbino — 1538
    art-444  Jacopo Sansovino's Loggetta bronze reliefs — Venice, c. 1540
    art-445  The Ardabil Carpet — Persia, 1540
    art-446  Michelangelo's Last Judgment — Sistine Chapel, 1541
    art-447  Benvenuto Cellini's Salt Cellar — 1543
    art-448  Agnolo Bronzino's Venus, Cupid, Folly and Time — c. 1545
    art-449  Bronzino's Portrait of Eleonora di Toledo — 1545
    art-450  Titian's Portrait of Pope Paul III and His Grandsons — 1546
    art-451  Tintoretto's The Miracle of the Slave — 1548

### 1550–1580 — `art-1550`

    art-452  Titian's Venus with a Mirror — c. 1550
    art-453  Qiu Ying's Spring Morning in the Han Palace — China, c. 1550
    art-454  Sofonisba Anguissola's The Chess Game — 1555
    art-455  Pieter Bruegel the Elder's The Fall of Icarus — c. 1558
    art-456  Titian's Diana and Actaeon — 1559
    art-457  Pieter Bruegel the Elder's Netherlandish Proverbs — 1559
    art-458  Titian's Rape of Europa — 1562
    art-459  Pieter Bruegel the Elder's The Triumph of Death — c. 1562
    art-460  Paolo Veronese's The Wedding at Cana — 1563
    art-461  Pieter Bruegel the Elder's The Tower of Babel — 1563
    art-462  Bartolomeo Ammannati's Fountain of Neptune — Florence, 1565
    art-463  Tintoretto's Scuola Grande di San Rocco cycle — Venice, 1565
    art-464  Pieter Bruegel the Elder's The Hunters in the Snow — 1565
    art-465  Pieter Bruegel the Elder's The Peasant Wedding — c. 1567
    art-466  Pieter Bruegel the Elder's The Beggars — 1568
    art-467  Titian's The Death of Actaeon — c. 1570
    art-468  The Mughal Hamzanama — India, c. 1570
    art-469  Nicholas Hilliard's Pelican Portrait of Elizabeth I — England, c. 1572
    art-470  Kanō Eitoku's Scenes in and around Kyoto — Japan, c. 1573
    art-471  Veronese's Feast in the House of Levi and the Inquisition — 1573
    art-472  Titian's Flaying of Marsyas — c. 1575
    art-473  El Greco's The Disrobing of Christ — Toledo, 1579
    art-474  Federico Barocci's Madonna del Popolo — 1579
    art-475  Sofonisba Anguissola's Portrait of Philip II — Madrid, c. 1579

### 1580–1600 — `art-1575`

    art-476  Lavinia Fontana's Portrait of a Noblewoman — c. 1580
    art-477  Giambologna's Mercury — c. 1580
    art-478  Giambologna's Appennino — Pratolino, c. 1580
    art-479  Jacopo Bassano's Adoration of the Shepherds — c. 1580
    art-480  Giambologna's Rape of the Sabine Women — Florence, 1582
    art-481  The Ottoman Surname-i Hümayun festival book — 1582
    art-482  Annibale Carracci's The Bean Eater — c. 1585
    art-483  Annibale Carracci's The Butcher's Shop — c. 1585
    art-484  El Greco's The Burial of the Count of Orgaz — 1588
    art-485  Giuseppe Arcimboldo's Vertumnus — c. 1590
    art-486  Kanō Eitoku's Chinese Lions screen — Japan, c. 1590
    art-487  Basawan and Chetar's Akbar Restraining the Elephant Hawa'i — India, c. 1590
    art-488  Bartholomeus Spranger's Vulcan and Maia — Prague, c. 1590
    art-489  Nicholas Hilliard's Young Man Among Roses — England, c. 1590
    art-490  Adriaen de Vries's Mercury and Psyche — Prague, 1593
    art-491  Isaac Oliver's Portrait of a Young Man Seated Under a Tree — c. 1595
    art-492  Hasegawa Tōhaku's Pine Trees screen — Japan, c. 1595
    art-493  The Namban screen of Kanō Naizen — Japan, c. 1595
    art-494  El Greco's View of Toledo — c. 1599
    art-495  Caravaggio's Basket of Fruit — c. 1599
    art-496  Caravaggio's Judith Beheading Holofernes — c. 1599

## The Baroque World, 1600–1750 — `art-baroque`

### 1600–1630 — `art-1600`

    art-497  Annibale Carracci's Farnese Gallery ceiling — Rome, 1600
    art-498  Caravaggio's The Calling of Saint Matthew — Rome, 1600
    art-499  Caravaggio's The Martyrdom of Saint Matthew — Rome, 1600
    art-500  Dong Qichang's Autumn Mountains — China, c. 1600
    art-501  Kanō Sanraku's Peonies screen — Japan, c. 1600
    art-502  Bernardo Bitti's Coronation of the Virgin — Peru, c. 1600
    art-503  The Kwer'ata Re'esu icon — Ethiopia, c. 1600
    art-504  El Greco's Saint Martin and the Beggar — c. 1600
    art-505  Caravaggio's The Conversion of Saint Paul — 1601
    art-506  Caravaggio's Supper at Emmaus — 1601
    art-507  Juan Sánchez Cotán's Quince, Cabbage, Melon and Cucumber — c. 1602
    art-508  Caravaggio's The Entombment of Christ — 1603
    art-509  Caravaggio's Death of the Virgin — 1606
    art-510  Caravaggio's David with the Head of Goliath — c. 1610
    art-511  Peter Paul Rubens's Samson and Delilah — c. 1610
    art-512  Artemisia Gentileschi's Susanna and the Elders — 1610
    art-513  El Greco's The Opening of the Fifth Seal — c. 1610
    art-514  Peter Paul Rubens's The Elevation of the Cross — 1611
    art-515  Peter Paul Rubens's The Descent from the Cross — 1614
    art-516  Guido Reni's Aurora — Rome, 1614
    art-517  Domenichino's Last Communion of Saint Jerome — 1614
    art-518  Ambrosius Bosschaert's Bouquet in a Niche — c. 1615
    art-519  Kanō Sanraku's Red Plum Blossoms screen — Japan, c. 1615
    art-520  Frans Hals's Banquet of the Officers of the St George Civic Guard — 1616
    art-521  Peter Paul Rubens's The Rape of the Daughters of Leucippus — c. 1618
    art-522  Diego Velázquez's Old Woman Frying Eggs — 1618
    art-523  Peter Paul Rubens's Prometheus Bound — c. 1618
    art-524  Artemisia Gentileschi's Judith Slaying Holofernes — c. 1620
    art-525  Orazio Gentileschi's The Lute Player — c. 1620
    art-526  Hendrick ter Brugghen's The Concert — c. 1620
    art-527  Diego Velázquez's The Water Seller of Seville — c. 1620
    art-528  Juan van der Hamen's Still Life with Flowers and Fruit — c. 1620
    art-529  Guercino's Aurora — Rome, 1621
    art-530  Gianlorenzo Bernini's David — 1624
    art-531  Frans Hals's The Laughing Cavalier — 1624
    art-532  Gianlorenzo Bernini's Apollo and Daphne — 1625
    art-533  Francisco de Zurbarán's Saint Serapion — 1628

### 1630–1660 — `art-1630`

    art-534  Tawaraya Sōtatsu's Wind God and Thunder God — Japan, c. 1630
    art-535  Ogata Sōtatsu's Waves at Matsushima screen — Japan, c. 1630
    art-536  Riza Abbasi's Two Lovers — Persia, 1630
    art-537  Rembrandt's The Anatomy Lesson of Dr Nicolaes Tulp — 1632
    art-538  Judith Leyster's Self-Portrait — c. 1633
    art-539  Bernini's Baldacchino — Rome, 1634
    art-540  Diego Velázquez's The Surrender of Breda — 1635
    art-541  Anthony van Dyck's Charles I at the Hunt — 1635
    art-542  Willem Claesz Heda's Still Life with a Gilt Cup — c. 1635
    art-543  Rembrandt's Belshazzar's Feast — c. 1636
    art-544  Anthony van Dyck's Charles I in Three Positions — 1636
    art-545  Nicolas Poussin's The Rape of the Sabine Women — c. 1637
    art-546  Artemisia Gentileschi's Self-Portrait as the Allegory of Painting — c. 1638
    art-547  Nicolas Poussin's Et in Arcadia ego — c. 1638
    art-548  Jusepe de Ribera's Martyrdom of Saint Philip — 1639
    art-549  Pietro da Cortona's Barberini ceiling — Rome, 1639
    art-550  Georges de La Tour's Magdalene with the Smoking Flame — c. 1640
    art-551  The Padshahnama of Shah Jahan — India, c. 1640
    art-552  Iwasa Matabei's Thirty-Six Immortal Poets — Japan, c. 1640
    art-553  Rembrandt's The Night Watch — 1642
    art-554  Louis Le Nain's The Peasant Family — c. 1642
    art-555  Rembrandt's The Three Trees — 1643
    art-556  Georges de La Tour's The Newborn — c. 1645
    art-557  Nicolas Poussin's Eliezer and Rebecca — 1648
    art-558  Claude Lorrain's Seaport with the Embarkation of the Queen of Sheba — 1648
    art-559  Claude Lorrain's Landscape with the Marriage of Isaac and Rebecca — 1648
    art-560  Rembrandt's Hundred Guilder Print — c. 1649
    art-561  Diego Velázquez's Rokeby Venus — c. 1650
    art-562  Diego Velázquez's Portrait of Pope Innocent X — 1650
    art-563  Alessandro Algardi's Meeting of Leo the Great and Attila — Rome, c. 1650
    art-564  Bernini's Fountain of the Four Rivers — Rome, 1651
    art-565  Bernini's Ecstasy of Saint Teresa — Rome, 1652
    art-566  Rembrandt's Bathsheba at Her Bath — 1654
    art-567  Jacob van Ruisdael's The Jewish Cemetery — c. 1655
    art-568  Nicolaes Maes's The Eavesdropper — 1656
    art-569  Diego Velázquez's Las Meninas — 1656
    art-570  Johannes Vermeer's The Milkmaid — c. 1658
    art-571  Pieter de Hooch's The Courtyard of a House in Delft — 1658

### 1660–1700 — `art-1660`

    art-572  The Basohli Rasamanjari illustrations — India, c. 1660
    art-573  Gerrit Dou's Self-Portrait — c. 1660
    art-574  Wallerant Vaillant's mezzotint Portrait of a Boy — c. 1660
    art-575  Johannes Vermeer's View of Delft — c. 1661
    art-576  Johannes Vermeer's Woman Holding a Balance — c. 1662
    art-577  Charles Le Brun's Galerie d'Apollon ceiling — Paris, c. 1663
    art-578  Rembrandt's The Jewish Bride — c. 1665
    art-579  Johannes Vermeer's Girl with a Pearl Earring — c. 1665
    art-580  Jan Steen's The Feast of Saint Nicholas — c. 1665
    art-581  Peter Lely's Portrait of Barbara Villiers — c. 1665
    art-582  Johannes Vermeer's The Art of Painting — c. 1666
    art-583  Jan Steen's The Merry Family — 1668
    art-584  Gong Xian's A Thousand Peaks and Myriad Ravines — China, c. 1670
    art-585  Hishikawa Moronobu's Scenes from the Yoshiwara — Japan, c. 1675
    art-586  Bartolomé Esteban Murillo's Immaculate Conception — c. 1678
    art-587  Grinling Gibbons's carvings for the King's Dining Room at Windsor — c. 1680
    art-588  The Deccan painting of Sultan Abdullah Qutb Shah — India, c. 1680
    art-589  Luca Giordano's Triumph of the Medici — Florence, 1685
    art-590  Bada Shanren's Lotus and Birds — China, c. 1690
    art-591  Andrea Pozzo's Sant'Ignazio ceiling — Rome, 1694
    art-592  Shitao's Reminiscences of Qinhuai — China, c. 1695

### 1700–1750 — `art-1700`

    art-593  Rachel Ruysch's Flower Still Life — c. 1700
    art-594  Hyacinthe Rigaud's Louis XIV — 1701
    art-595  Ogata Kōrin's Irises screen — Japan, c. 1702
    art-596  Maria Sibylla Merian's Metamorphosis of the Insects of Suriname — 1705
    art-597  The Meissen Böttger stoneware teapot — Germany, c. 1710
    art-598  Wang Yuanqi's Wangchuan Villa — China, 1711
    art-599  Antoine Watteau's Pilgrimage to Cythera — 1717
    art-600  Antoine Watteau's Pierrot — c. 1719
    art-601  Antoine Watteau's The Shopsign of Gersaint — 1720
    art-602  Rosalba Carriera's Portrait of Antoine Watteau — c. 1721
    art-603  Nishikawa Sukenobu's Hyakunin Jorō Shinasadame — Japan, 1723
    art-604  Canaletto's The Stonemason's Yard — c. 1725
    art-605  Canaletto's The Grand Canal at the Salute Church — c. 1727
    art-606  Jean-Siméon Chardin's The Ray — 1728
    art-607  The Asam brothers' high altar of Weltenburg Abbey — Germany, c. 1730
    art-608  Jean-Siméon Chardin's Soap Bubbles — c. 1734
    art-609  Jean-Siméon Chardin's The Silver Goblet — c. 1735
    art-610  William Hogarth's A Rake's Progress — 1735
    art-611  Jean-Baptiste Oudry's The Dead Wolf — 1740
    art-612  Okumura Masanobu's Large Perspective Picture of a Kabuki Theatre — Japan, c. 1740
    art-613  William Hogarth's Marriage A-la-Mode — 1743
    art-614  William Hogarth's The Shrimp Girl — c. 1745
    art-615  Piranesi's Vedute di Roma — from 1748

## Revolution and Romance, 1750–1860 — `art-revolution`

### 1750–1790 — `art-1750`

    art-616  Giovanni Battista Piranesi's Carceri — 1750
    art-617  Thomas Gainsborough's Mr and Mrs Andrews — c. 1750
    art-618  François Boucher's The Toilet of Venus — 1751
    art-619  Giovanni Battista Tiepolo's Würzburg Residenz ceiling — 1753
    art-620  Giovanni Battista Tiepolo's Apollo and the Continents ceiling — Würzburg, 1753
    art-621  Ignaz Günther and Bavarian Rococo sculpture — c. 1755
    art-622  Giovanni Paolo Panini's Ancient Rome — 1757
    art-623  François Boucher's Madame de Pompadour — 1759
    art-624  Anton Raphael Mengs's Parnassus — 1761
    art-625  George Stubbs's Whistlejacket — c. 1762
    art-626  Miguel Cabrera's De español y d'India, Mestiza — Mexico, 1763
    art-627  Joshua Reynolds's Lady Sarah Bunbury Sacrificing to the Graces — 1765
    art-628  Suzuki Harunobu's Evening Bell at the Clock — Japan, 1766
    art-629  Itō Jakuchū's Colourful Realm of Living Beings — Japan, c. 1766
    art-630  Jean-Honoré Fragonard's The Swing — 1767
    art-631  Joseph Wright of Derby's An Experiment on a Bird in the Air Pump — 1768
    art-632  Joshua Reynolds's Colonel Acland and Lord Sydney: The Archers — 1769
    art-633  Benjamin West's The Death of General Wolfe — 1770
    art-634  Johan Zoffany's The Academicians of the Royal Academy — 1772
    art-635  Thomas Gainsborough's The Blue Boy — 1772
    art-636  Maruyama Ōkyo's Pine Trees in Snow — Japan, c. 1775
    art-637  Katsushika Hokusai's Asakusa Kannon Temple in Snow — Japan, c. 1777
    art-638  John Singleton Copley's Watson and the Shark — 1778
    art-639  Yosa Buson's Night Scene of the Kanshin Temple — Japan, c. 1780
    art-640  The Impey Album paintings of Shaikh Zain al-Din — India, c. 1780
    art-641  The Tlingit Chilkat blanket of the Whale House — c. 1780
    art-642  The Asante Golden Stool regalia sword ornament — Ghana, c. 1780
    art-643  Jean-Antoine Houdon's Voltaire Seated — 1781
    art-644  Henry Fuseli's The Nightmare — 1781
    art-645  Antonio Canova's Theseus and the Minotaur — 1782
    art-646  Jacques-Louis David's Oath of the Horatii — 1784
    art-647  Angelica Kauffman's Cornelia, Mother of the Gracchi — c. 1785
    art-648  Torii Kiyonaga's Cherry Blossoms at Nakanochō — Japan, c. 1785
    art-649  Élisabeth Vigée Le Brun's Marie Antoinette and Her Children — 1787
    art-650  Jacques-Louis David's The Death of Socrates — 1787

### 1790–1820 — `art-1790`

    art-651  Kitagawa Utamaro's Ten Studies in Female Physiognomy — Japan, c. 1792
    art-652  Jacques-Louis David's The Death of Marat — 1793
    art-653  Antonio Canova's Psyche Revived by Cupid's Kiss — 1793
    art-654  Tōshūsai Sharaku's Ōtani Oniji III as Yakko Edobei — Japan, 1794
    art-655  William Blake's The Ancient of Days — 1794
    art-656  William Blake's Newton — 1795
    art-657  Thomas Bewick's A History of British Birds engravings — 1797
    art-658  Thomas Girtin's The White House at Chelsea — 1798
    art-659  Francisco Goya's Los Caprichos, plate 43 — 1799
    art-660  Francisco Goya's The Family of Charles IV — 1800
    art-661  Francisco Goya's La maja desnuda — c. 1800
    art-662  The Aleijadinho prophets at Congonhas — Brazil, 1800
    art-663  Ingres's Napoleon on His Imperial Throne — 1806
    art-664  Jacques-Louis David's The Coronation of Napoleon — 1807
    art-665  Antonio Canova's Perseus with the Head of Medusa — 1808
    art-666  Antonio Canova's Pauline Borghese as Venus Victrix — 1808
    art-667  Caspar David Friedrich's The Cross in the Mountains — 1808
    art-668  Philipp Otto Runge's Morning — 1808
    art-669  Caspar David Friedrich's Monk by the Sea — 1810
    art-670  J. M. W. Turner's Snow Storm: Hannibal Crossing the Alps — 1812
    art-671  Francisco Goya's The Third of May 1808 — 1814
    art-672  Jean-Auguste-Dominique Ingres's La Grande Odalisque — 1814
    art-673  Katsushika Hokusai's Manga, Volume One — Japan, 1814
    art-674  Francisco Goya's The Disasters of War — c. 1815
    art-675  Théodore Géricault's The Charging Chasseur — 1816
    art-676  Caspar David Friedrich's Wanderer above the Sea of Fog — c. 1818
    art-677  Caspar David Friedrich's Chalk Cliffs on Rügen — c. 1818
    art-678  Théodore Géricault's The Raft of the Medusa — 1819
    art-679  Théodore Géricault's The Derby at Epsom — 1821

### 1820–1840 — `art-1820`

    art-680  John Constable's The Hay Wain — 1821
    art-681  John Constable's Study of Cirrus Clouds — c. 1822
    art-682  Eugène Delacroix's The Barque of Dante — 1822
    art-683  Francisco Goya's Saturn Devouring His Son and the Black Paintings — c. 1823
    art-684  Eugène Delacroix's The Massacre at Chios — 1824
    art-685  John Constable's The Leaping Horse — 1825
    art-686  Camille Corot's The Bridge at Narni — 1826
    art-687  Eugène Delacroix's The Death of Sardanapalus — 1827
    art-688  J. M. W. Turner's Ulysses Deriding Polyphemus — 1829
    art-689  Eugène Delacroix's Liberty Leading the People — 1830
    art-690  Katsushika Hokusai's The Great Wave off Kanagawa — c. 1831
    art-691  Katsushika Hokusai's Red Fuji — Japan, c. 1831
    art-692  Jean-Auguste-Dominique Ingres's Louis-François Bertin — 1832
    art-693  Utagawa Hiroshige's Kanbara, Night Snow — Japan, 1833
    art-694  Utagawa Hiroshige's Shōno, Driving Rain — Japan, 1833
    art-695  Karl Bryullov's The Last Day of Pompeii — 1833
    art-696  Eugène Delacroix's Women of Algiers in Their Apartment — 1834
    art-697  Honoré Daumier's Rue Transnonain — 1834
    art-698  Utagawa Kuniyoshi's Miyamoto Musashi and the Whale — Japan, c. 1835
    art-699  Thomas Cole's The Course of Empire — 1836
    art-700  Thomas Cole's The Oxbow — 1836
    art-701  J. M. W. Turner's The Fighting Temeraire — 1839
    art-702  Louis Daguerre's Boulevard du Temple — 1839

### 1840–1860 — `art-1840`

    art-703  Hippolyte Bayard's Self-Portrait as a Drowned Man — 1840
    art-704  William Henry Fox Talbot's The Open Door — 1844
    art-705  J. M. W. Turner's Rain, Steam and Speed — 1844
    art-706  Adolph Menzel's The Balcony Room — 1845
    art-707  Richard Redgrave's The Sempstress — 1846
    art-708  Katsushika Ōi's Night Scene in the Yoshiwara — Japan, c. 1847
    art-709  Gustave Courbet's The Stone Breakers — 1849
    art-710  Asher B. Durand's Kindred Spirits — 1849
    art-711  Dante Gabriel Rossetti's Ecce Ancilla Domini — 1850
    art-712  John Everett Millais's Christ in the House of His Parents — 1850
    art-713  Jean-François Millet's The Sower — 1850
    art-714  Gustave Courbet's A Burial at Ornans — 1850
    art-715  Ivan Aivazovsky's The Ninth Wave — 1850
    art-716  Théodore Rousseau's The Forest in Winter at Sunset — c. 1850
    art-717  John Everett Millais's Ophelia — 1852
    art-718  Rosa Bonheur's The Horse Fair — 1853
    art-719  William Holman Hunt's The Light of the World — 1854
    art-720  Gustave Courbet's The Meeting (Bonjour Monsieur Courbet) — 1854
    art-721  Gustave Courbet's The Painter's Studio — 1855
    art-722  Roger Fenton's The Valley of the Shadow of Death — 1855
    art-723  Jean-François Millet's The Gleaners — 1857
    art-724  Gustave Le Gray's The Great Wave, Sète — 1857
    art-725  Utagawa Hiroshige's Sudden Shower over Shin-Ōhashi Bridge — Japan, 1857

## The Modern Age, 1860–1914 — `art-modernage`

### 1860–1875 — `art-1860`

    art-726  Francesco Hayez's The Kiss — 1859
    art-727  Edgar Degas's The Bellelli Family — c. 1862
    art-728  Ford Madox Brown's Work — 1863
    art-729  Édouard Manet's Le Déjeuner sur l'herbe — 1863
    art-730  Édouard Manet's Olympia — 1863
    art-731  Alexandre Cabanel's The Birth of Venus — 1863
    art-732  Honoré Daumier's The Third-Class Carriage — c. 1864
    art-733  Nadar's Portrait of Sarah Bernhardt — c. 1864
    art-734  Camille Corot's Souvenir de Mortefontaine — 1864
    art-735  Claude Monet's Women in the Garden — 1866
    art-736  Édouard Manet's The Execution of Emperor Maximilian — 1868
    art-737  Édouard Manet's The Balcony — 1869
    art-738  Claude Monet's La Grenouillère — 1869
    art-739  Pierre-Auguste Renoir's La Grenouillère — 1869
    art-740  Dante Gabriel Rossetti's Beata Beatrix — c. 1870
    art-741  Frederic Leighton's Hercules Wrestling with Death — 1871
    art-742  James McNeill Whistler's Arrangement in Grey and Black — 1871
    art-743  Vasily Perov's Portrait of Fyodor Dostoevsky — 1872
    art-744  Jean-Léon Gérôme's Pollice Verso — 1872
    art-745  Berthe Morisot's The Cradle — 1872
    art-746  Claude Monet's Impression, Sunrise — 1872
    art-747  Winslow Homer's Snap the Whip — 1872
    art-748  Camille Pissarro's Hoar Frost — 1873
    art-749  Claude Monet's Boulevard des Capucines — 1873
    art-750  Ilya Repin's Barge Haulers on the Volga — 1873
    art-751  Edgar Degas's The Dance Class — c. 1874
    art-752  Pierre-Auguste Renoir's La Loge — 1874

### 1875–1885 — `art-1875`

    art-753  Adolph Menzel's The Iron Rolling Mill — 1875
    art-754  James McNeill Whistler's Nocturne in Black and Gold: The Falling Rocket — 1875
    art-755  Gustave Caillebotte's Young Man at His Window — 1875
    art-756  Gustave Caillebotte's The Floor Scrapers — 1875
    art-757  Thomas Eakins's The Gross Clinic — 1875
    art-758  Alfred Sisley's The Flood at Port-Marly — 1876
    art-759  Pierre-Auguste Renoir's Bal du moulin de la Galette — 1876
    art-760  Edgar Degas's L'Absinthe — 1876
    art-761  Shibata Zeshin's Autumn Grasses lacquer panel — Japan, c. 1876
    art-762  Gustave Moreau's The Apparition — 1876
    art-763  Auguste Rodin's The Age of Bronze — 1877
    art-764  Gustave Caillebotte's Paris Street; Rainy Day — 1877
    art-765  Claude Monet's Gare Saint-Lazare — 1877
    art-766  Takahashi Yuichi's Salmon and the coming of yōga — Japan, 1877
    art-767  Edward Burne-Jones's The Beguiling of Merlin — 1877
    art-768  Eadweard Muybridge's The Horse in Motion — 1878
    art-769  Mary Cassatt's Little Girl in a Blue Armchair — 1878
    art-770  Jules Bastien-Lepage's Season of October — 1878
    art-771  Ivan Shishkin's Rye — 1878
    art-772  Hubert von Herkomer's Eventide: A Scene in the Westminster Union — 1878
    art-773  Auguste Rodin's The Thinker — 1880
    art-774  Auguste Rodin's The Gates of Hell — from 1880
    art-775  Kawanabe Kyōsai's Crows — Japan, c. 1880
    art-776  Raja Ravi Varma's Shakuntala Composing a Love Letter — India, c. 1880
    art-777  Pierre-Auguste Renoir's Luncheon of the Boating Party — 1881
    art-778  Edgar Degas's Little Dancer Aged Fourteen — 1881
    art-779  Édouard Manet's A Bar at the Folies-Bergère — 1882
    art-780  Paul Cézanne's Mont Sainte-Victoire — 1882
    art-781  Arnold Böcklin's Isle of the Dead — 1883
    art-782  John Singer Sargent's Portrait of Madame X — 1884
    art-783  Georges Seurat's Bathers at Asnières — 1884

### 1885–1900 — `art-1885`

    art-784  Vincent van Gogh's The Potato Eaters — 1885
    art-785  Ilya Repin's Ivan the Terrible and His Son — 1885
    art-786  Georges Seurat's A Sunday Afternoon on the Island of La Grande Jatte — 1886
    art-787  Paul Signac's The Riverbank, Petit-Andely — 1886
    art-788  Vasily Surikov's Boyarina Morozova — 1887
    art-789  Vincent van Gogh's Sunflowers — 1888
    art-790  Vincent van Gogh's The Bedroom — 1888
    art-791  Vincent van Gogh's Café Terrace at Night — 1888
    art-792  Paul Gauguin's Vision after the Sermon — 1888
    art-793  Émile Bernard's Breton Women in the Meadow — 1888
    art-794  Vincent van Gogh's The Night Café — 1888
    art-795  Auguste Rodin's The Burghers of Calais — 1889
    art-796  James Ensor's Christ's Entry into Brussels — 1889
    art-797  Vincent van Gogh's The Starry Night — 1889
    art-798  Vincent van Gogh's Self-Portrait with Bandaged Ear — 1889
    art-799  Paul Gauguin's The Yellow Christ — 1889
    art-800  Vincent van Gogh's Wheatfield with Crows — 1890
    art-801  Kusakabe Kimbei's Girl in a Rickshaw — Japan, c. 1890
    art-802  Fernand Khnopff's I Lock My Door Upon Myself — 1891
    art-803  Henri de Toulouse-Lautrec's Moulin Rouge: La Goulue — 1891
    art-804  Paul Cézanne's The Card Players — c. 1892
    art-805  Paul Cézanne's Still Life with Plaster Cupid — c. 1892
    art-806  Henri de Toulouse-Lautrec's At the Moulin Rouge — 1892
    art-807  Édouard Vuillard's Interior, Mother and Sister of the Artist — 1893
    art-808  Mary Cassatt's The Child's Bath — 1893
    art-809  Camille Claudel's The Waltz — 1893
    art-810  Edvard Munch's The Scream — 1893
    art-811  Edvard Munch's Death in the Sickroom — 1893
    art-812  Alphonse Mucha's Gismonda poster — 1894
    art-813  Victor Horta's Hôtel Tassel stair ironwork — Brussels, c. 1894
    art-814  Edvard Munch's Madonna — 1894
    art-815  Paul Cézanne's Still Life with Apples — c. 1894
    art-816  Aubrey Beardsley's The Climax — 1894
    art-817  Paul Gauguin's Where Do We Come From? What Are We? Where Are We Going? — 1897
    art-818  Paul Gauguin's Nevermore — 1897
    art-819  Henri Rousseau's The Sleeping Gypsy — 1897
    art-820  Käthe Kollwitz's The Weavers: March of the Weavers — 1897
    art-821  Edvard Munch's The Kiss woodcut — 1897
    art-822  Kuroda Seiki's Wisdom, Impression, Sentiment — Japan, 1897
    art-823  Auguste Rodin's Monument to Balzac — 1898
    art-824  Gustav Klimt's Pallas Athene — 1898

### 1900–1914 — `art-1900`

    art-825  Edvard Munch's Girls on the Bridge — 1901
    art-826  Henri Matisse's Woman with a Hat — 1905
    art-827  André Derain's Portrait of Henri Matisse — 1905
    art-828  Paula Modersohn-Becker's Self-Portrait with Amber Necklace — 1906
    art-829  Paul Cézanne's The Large Bathers — 1906
    art-830  Henri Matisse's Le bonheur de vivre — 1906
    art-831  André Derain's Charing Cross Bridge — 1906
    art-832  Gustav Klimt's Portrait of Adele Bloch-Bauer I — 1907
    art-833  Pablo Picasso's Les Demoiselles d'Avignon — 1907
    art-834  Henri Rousseau's The Snake Charmer — 1907
    art-835  Gustav Klimt's Danaë — 1907
    art-836  Alfred Stieglitz's The Steerage and photography as art — 1907
    art-837  Gustav Klimt's The Kiss — 1908
    art-838  Umberto Boccioni's The City Rises — 1910
    art-839  Wassily Kandinsky's Improvisation 7 — 1910
    art-840  Piet Mondrian's The Red Tree — 1910
    art-841  Henri Matisse's The Dance — 1910
    art-842  Egon Schiele's Seated Male Nude — 1910
    art-843  Henri Rousseau's The Dream — 1910
    art-844  Wassily Kandinsky's Composition IV — 1911
    art-845  Egon Schiele's Self-Portrait with Black Vase — 1911
    art-846  Umberto Boccioni's States of Mind: The Farewells — 1911
    art-847  Franz Marc's The Large Blue Horses — 1911
    art-848  Kazimir Malevich's The Woodcutter — 1912
    art-849  Juan Gris's The Watch — 1912
    art-850  Juan Gris's Portrait of Picasso — 1912
    art-851  Robert Delaunay's Simultaneous Windows — 1912
    art-852  Egon Schiele's Autumn Tree in Stirred Air — 1912
    art-853  Kazimir Malevich's Morning in the Village after Snowstorm — 1912
    art-854  Wassily Kandinsky's Composition VII — 1913
    art-855  Ernst Ludwig Kirchner's Street, Berlin — 1913
    art-856  Umberto Boccioni's Unique Forms of Continuity in Space — 1913
    art-857  Egon Schiele's The Bridge — 1913
    art-858  Franz Marc's The Tower of Blue Horses — 1913

## The Twentieth Century to the Public-Domain Horizon, 1914–1944 — `art-c20`

**THIS DECK IS A SMALLER CLAIM THAN ITS OLD TITLE AND SAYS SO.** It used to run to the present; since the
restart a card is a work with a free photograph or it is not a card, and for painting and sculpture the
free horizon is **first publication before 1931** (the United States term) crossed with **the author dead
more than seventy years** (most of Europe). Commons hosts a file only where both are satisfied, so the
canon after about 1930 is almost entirely unshowable and the deck stops where the evidence does rather
than pretending otherwise.

**What it holds instead is the richest free decade in the history of art** — 1914 to 1930, when Malevich,
Mondrian, Klee, Kandinsky, Schiele, Klimt, Modigliani, Popova, Rozanova, Lissitzky, af Klint, Marc and
Macke all worked and all are free — followed by the thin tail that clears both tests: artists who died
before about 1955, and the **United States federal photography** of the Farm Security Administration,
which is public domain as a government work whatever its date.

**THE HORIZON MOVES ONE YEAR EVERY JANUARY**, which is the useful thing to know here: on 1 January 2027 the
1931 publications clear, and a line may be added then. Extending this deck is therefore a recurring, dated
piece of work rather than a judgement — check Commons, not a calendar of art history.

**The works that had to leave are not lost to the site**: *Guernica*, *Nighthawks*, the *Marilyn Diptych*
and the rest can be carded in World History, in words, exactly as any other card. See "Copyright" above.

    art-859  Odilon Redon's The Cyclops — c. 1914
### 1914–1918 — `art-1914`

    art-860  August Macke's Turkish Café — 1914
    art-861  Franz Marc's Fate of the Animals — 1914
    art-862  Egon Schiele's Blind Mother — 1914
    art-863  Henri Gaudier-Brzeska's Hieratic Head of Ezra Pound — 1914
    art-864  Hilma af Klint's Swan No. 17 — 1914
    art-865  Vilhelm Hammershøi's Interior with a Woman at a Piano — 1914
    art-866  Gwen John's A Corner of the Artist's Room in Paris — 1914
    art-867  George Bellows's Cliff Dwellers — 1914
    art-868  Kazimir Malevich's The Aviator — 1914
    art-869  Robert Delaunay's Homage to Blériot — 1914
    art-870  Christopher Nevinson's Returning to the Trenches — 1915
    art-871  Umberto Boccioni's Charge of the Lancers — 1915
    art-872  Olga Rozanova's Non-Objective Composition — 1915
    art-873  Liubov Popova's Painterly Architectonic — 1915
    art-874  Kazimir Malevich's Black Square — 1915
    art-875  Wilhelm Lehmbruck's The Fallen Man — 1915
    art-876  Amedeo Modigliani's Portrait of Paul Guillaume — 1915
    art-877  Marianne von Werefkin's The Black Women — 1915
    art-878  Odilon Redon's The Cyclops — 1916
    art-879  Franz Marc's Fighting Forms — 1916
    art-880  Alexej von Jawlensky's Mystical Head — 1916
    art-881  Piet Mondrian's Composition with Colour Planes and Grey Lines — 1916
    art-882  Hilma af Klint's Altarpiece No. 1 — 1916
    art-883  Kazimir Malevich's Suprematist Composition: Airplane Flying — 1916
    art-884  Egon Schiele's The Artist's Room in Neulengbach — 1916
    art-885  Anna Ancher's Sunlight in the Blue Room — 1916
    art-886  Auguste Rodin's The Cathedral — 1917
    art-887  Edgar Degas's Woman Combing Her Hair — 1917
    art-888  Amedeo Modigliani's Reclining Nude — 1917
    art-889  Theo van Doesburg's Composition IX — 1917

    art-890  Kuzma Petrov-Vodkin's Bathing of a Red Horse — 1917
    art-891  Gustav Klimt's Portrait of Johanna Staude — 1917
    art-892  Ferdinand Hodler's Lake Geneva from Chexbres — 1917
    art-893  Boris Kustodiev's The Merchant's Wife at Tea — 1918
    art-894  Egon Schiele's The Family — 1918
    art-895  Gustav Klimt's The Bride — 1918
    art-896  Raymond Duchamp-Villon's The Large Horse — 1918
    art-897  Olga Rozanova's Green Stripe — 1918
    art-898  Paul Klee's Once Emerged from the Grey of Night — 1918
    art-899  Kazimir Malevich's White on White — 1918
    art-900  Paul Nash's We Are Making a New World — 1918
### 1919–1922 — `art-1918`

    art-901  Pierre-Auguste Renoir's The Bathers — 1919
    art-902  El Lissitzky's Beat the Whites with the Red Wedge — 1919
    art-903  Wilhelm Lehmbruck's Seated Youth — 1919
    art-904  Hilma af Klint's Parsifal Series — 1919
    art-905  Charles Demuth's Trees and Barns, Bermuda — 1919
    art-906  Marsden Hartley's Movements — 1919
    art-907  Liubov Popova's Space-Force Construction — 1920
    art-908  Amedeo Modigliani's Portrait of Jeanne Hébuterne — 1920
    art-909  Paul Klee's Angelus Novus — 1920
    art-910  Piet Mondrian's Composition A — 1920
    art-911  Vladimir Tatlin's Model for the Monument to the Third International — 1920
    art-912  Aleksandra Ekster's Constructivist stage design for Romeo and Juliet — 1920
    art-913  Juan Gris's Still Life with Guitar — 1920
    art-914  Max Beckmann's The Dream — 1921
    art-915  Paul Klee's The Mocker Mocked — 1921
    art-916  Wassily Kandinsky's White Cross — 1921
    art-917  Piet Mondrian's Composition with Large Red Plane — 1921
    art-918  Gustav Klutsis's Dynamic City — 1921
    art-919  Kishida Ryūsei's Reiko with a Woollen Shawl — 1921

    art-920  Joseph Stella's The Voice of the City of New York Interpreted — 1922
    art-921  Paul Klee's Twittering Machine — 1922
    art-922  Wassily Kandinsky's White Zig Zags — 1922
    art-923  El Lissitzky's Proun 19D — 1922
    art-924  Piet Mondrian's Composition with Yellow, Blue, Black, Red and Grey — 1922
    art-925  Käthe Kollwitz's War woodcut cycle — 1922
### 1923–1928 — `art-1922`

    art-926  Wassily Kandinsky's Composition VIII — 1923
    art-927  El Lissitzky's Proun Room — 1923
    art-928  Liubov Popova's textile designs — 1923
    art-929  Marsden Hartley's New Mexico Recollection — 1923
    art-930  Max Beckmann's Self-Portrait with a Cigarette — 1923
    art-931  Kazimir Malevich's Suprematist Architecton — 1923
    art-932  Käthe Kollwitz's Bread! — 1924
    art-933  Kuzma Petrov-Vodkin's Still Life with Mirror — 1924
    art-934  Kishida Ryūsei's Cutting-Board Still Life — 1924
    art-935  Alfred Stieglitz's Georgia O'Keeffe: Hands — 1924
    art-936  Theo van Doesburg's Counter-Composition V — 1924
    art-937  Wu Changshuo's Plum Blossoms — China, 1924
    art-938  Chaïm Soutine's Carcass of Beef — 1925
    art-939  Eugène Atget's Shop Front, Avenue des Gobelins — 1925
    art-940  Wassily Kandinsky's Yellow-Red-Blue — 1925
    art-941  Paul Klee's Fish Magic — 1925
    art-942  El Lissitzky's Self-Portrait, The Constructor — 1925
    art-943  Eugène Atget's Tree Roots, Saint-Cloud — 1925
    art-944  Claude Monet's Water Lilies at the Orangerie — 1926
    art-945  Paul Klee's Around the Fish — 1926
    art-946  Theo van Doesburg's Counter-Composition XIII — 1926
    art-947  Alfred Stieglitz's Equivalent — 1926
    art-948  Piet Mondrian's Composition with Red, Yellow and Blue — 1926

    art-949  Wassily Kandinsky's Several Circles — 1926
    art-950  Wu Changshuo's Gourd and Vine — China, 1927
    art-951  Charles Demuth's My Egypt — 1927
    art-952  Max Beckmann's Self-Portrait in Tuxedo — 1927
    art-953  El Lissitzky's Abstract Cabinet — 1927
    art-954  Kishida Ryūsei's Portrait of Reiko in a Kimono — 1927
    art-955  Yorozu Tetsugorō's Self-Portrait with Clouds — 1927
    art-956  Paul Klee's Cat and Bird — 1928
    art-957  Gustav Klutsis's Spartakiada poster — 1928
    art-958  Max Beckmann's The Loge — 1928
    art-959  Kazimir Malevich's Peasants — 1928
    art-960  Gaganendranath Tagore's Cubist study — India, 1928
### 1929–1935 — `art-1928`

    art-961  Kazimir Malevich's Girls in the Field — 1929
    art-962  Paul Klee's Highways and Byways — 1929
    art-963  Piet Mondrian's Composition No. II with Red and Blue — 1929
    art-964  Wassily Kandinsky's Levels — 1929
    art-965  El Lissitzky's Russian Exhibition poster — 1929
    art-966  Grant Wood's American Gothic — 1930
    art-967  Lewis Hine's Icarus atop the Empire State Building — 1930
    art-968  Xu Beihong's Tian Heng and His Five Hundred Retainers — China, 1930
    art-969  Max Beckmann's Self-Portrait with Saxophone — 1930
    art-970  Piet Mondrian's Composition with Red, Blue and Yellow — 1930
    art-971  Theo van Doesburg's Arithmetic Composition — 1930
    art-972  Grant Wood's The Midnight Ride of Paul Revere — 1931
    art-973  Paul Klee's Ad Parnassum — 1932
    art-974  Kazimir Malevich's Complex Presentiment — 1932
    art-975  Käthe Kollwitz's The Grieving Parents — 1932
    art-976  Amrita Sher-Gil's Young Girls — India, 1932

    art-977  Wassily Kandinsky's Development in Brown — 1933
    art-978  Alfred Stieglitz's Georgia O'Keeffe: A Portrait — 1933
    art-979  Paul Klee's Struck from the List — 1933
    art-980  Dorothea Lange's White Angel Breadline — 1933
    art-981  Käthe Kollwitz's Death Seizes a Woman — 1934
    art-982  Amrita Sher-Gil's Self-Portrait as a Tahitian — 1934
    art-983  Huang Binhong's Landscape — China, 1935
    art-984  Paul Nash's Equivalents for the Megaliths — 1935
### 1936–1944 — `art-1935`

    art-985  Arthur Rothstein's Dust Storm, Cimarron County — 1936
    art-986  Dorothea Lange's Migrant Mother — 1936
    art-987  Walker Evans's Allie Mae Burroughs — 1936
    art-988  Amrita Sher-Gil's Bride's Toilet — India, 1937
    art-989  Vera Mukhina's Worker and Kolkhoz Woman — 1937
    art-990  Ernst Ludwig Kirchner's Shepherds in the Evening — 1938
    art-991  Paul Klee's Insula Dulcamara — 1938
    art-992  Marsden Hartley's Fishermen's Last Supper — 1939
    art-993  Amrita Sher-Gil's The Story Teller — India, 1940
    art-994  Paul Klee's Death and Fire — 1940
    art-995  Piet Mondrian's New York City I — 1941
    art-996  El Lissitzky's Give Us More Tanks poster — 1941
    art-997  Marsden Hartley's Mount Katahdin, Maine — 1942
    art-998  Chaïm Soutine's The Great Tree — 1942
    art-999  Piet Mondrian's Broadway Boogie Woogie — 1943
    art-1000  Wassily Kandinsky's Tempered Élan — 1944

