# Ancient Mesopotamia — a 1000-card running order

The plan for `mesopotamia`, a new collection: every card's number, topic and deck, fixed in advance so
the collection can be grown one card at a time over many sessions without anyone having to remember
what was intended.

It is the twenty-fourth of these and the thirteenth history collection. Read
`docs/greece-card-plan.md` first if this is the first plan you have met; the mechanics are identical and
are not repeated here.

---

## How to use this (the whole point of the file)

**The next card to write is the lowest `me-NNN` not yet in `data.js`.**

    node -e "global.window={};require('./data.js');const h=new Set(window.CARD_DATA.map(c=>c.id));for(let i=1;i<=1000;i++){const id='me-'+String(i).padStart(3,'0');if(!h.has(id)){console.log(id);break}}"

Look the number up below, research it, write it, and add it with the deck id this file gives:

    node .claude/add-card.js <card.json> <deckId>

**Always pass the deck id.** Without one `add-card.js` falls back to the first leaf in the whole tree,
which is in China.

There is deliberately **no progress file**. `data.js` says what exists and this file says what is
planned; the next card is whatever falls between them.

The padding above is right for every id but the last: the ids are `me-001` … `me-999`, then `me-1000`.

## What a line in this list is, and is not

A line is a **subject to research**, not a fact to assert and not necessarily the finished answer term.
`me-472 What the stele was for` is an argument to describe, and the card's actual answer — the word
that gets blanked — is chosen while writing it, from what the sources will support.

Where the research says the line is wrong, **change the line here in the same commit as the card**, and
say so. The house rule stands: never invent a date, a name or a definition. **In this collection that
rule bites harder than anywhere else on the shelf**, for the reason the first scope decision gives.

## Is there a thousand cards in this?

Yes, and the constraint is not the amount of history but the **amount of evidence**. Three thousand
years and four successive civilisations would fill three thousand cards if they were documented like
Rome. They are not: they are documented by **clay tablets**, mostly administrative, mostly from a
handful of excavated sites, and — this is the load-bearing figure — **a large fraction of the
half-million or so known tablets has never been published or read at all.**

So the plan is built the other way round from a normal history collection. **Deck 1 is 110 cards on
the land and the evidence**, because a reader who does not know what the evidence IS will read every
later card as though it rested on a narrative source, and it does not. **Deck 8 is 120 cards on
writing, scholarship, literature and science**, because in Mesopotamia those are not a cultural
appendix — they are the record itself and the civilisation's most durable export.

**Where the padding risk is**, so it can be watched: the city subdeck in deck 3 and the king-by-king
runs in decks 5 and 6. **A city earns its slot by what was found there and what that settled**, not by
having existed; a king earns his by what changed under him. *Shalmaneser III ruled Assyria from 858 to
824 and campaigned in the west* is a caption.

## Making the collection

**The collection does not exist yet and this plan creates it** — the node, its tree, its `COLL_THEME`
hue and its `COLLECTION_ICON` row all ship with the file.

**The id is `mesopotamia` and the card prefix is `me-`**, free of every existing prefix and no prefix
of any of them. The deck ids are also `me-…`.

**It needs no `COLLECTION_SECTION` row.** `sectionOf` returns **History** for anything the table does
not name, and this is a history collection, so the correct action is to add nothing — the same note
the France plan makes, and for the same reason.

### The hue: `#784A00`, a clay brown — the sixth of its family, and the first one it fits

**Two colours have a claim here and the measurement splits them cleanly.**

**LAPIS LAZULI IS THE OBVIOUS CHOICE AND IT IS REFUSED ON THE NUMBERS.** It is the Mesopotamian luxury
material — the blue of the Standard of Ur, of Ur's royal graves and of the Ishtar Gate's glaze — and
swept in CIELAB against the 30 hues now on the shelf its best candidate stands **19.2**, below the
median of 20.8, **with NINE hues within 30 of it**: the United States' navy, Psychology's plum,
Greece's Aegean, the Second World War's dark iron and Philosophy's petrol all sit in that
neighbourhood. That density figure is the real verdict; the blue-violet quarter is the most crowded
region left.

**CLAY IS THE OTHER CLAIM AND IT IS THE STRONGER ONE ANYWAY.** Everything this collection is made of is
mud: mud-brick cities, mud-brick ziggurats, and an evidence base that is literally baked clay. `#784A00`
stands **21.3 from World History's sepia, 21.4 from the German deck and 21.9 from the Spanish deck**,
above the median of 20.8, **with 5 hues within 30** — the same density as Philosophy's petrol, and four
fewer than lapis.

**IT IS THE SIXTH MEMBER OF THE YELLOW-BROWN QUARTER AND THAT NEEDS THE ARGUMENT.** That family already
holds World History's sepia, Dinosaurs' ochre, India's saffron, the German deck and the Spanish deck.
Two things justify a sixth. It is separated by **lightness and chroma together** — sepia is L 48 /
chroma 30 and the German deck L 27 / chroma 32, where this is L 36 / chroma 47, between them in
lightness and above both in saturation. And **it is APT in a way none of the four previous rejections
of this quarter were**: Psychology, Philosophy, Biology and Dinosaurs each rejected an olive-brass
because a good number is not a look, and the note in `COLL_THEME` records it. **This is not that
candidate.** The rejected region is the olive-brass at hue 90–100; this is at hue 72, a red-brown, and
it is chosen because the civilisation is made of the stuff.

**ONE FIGURE IS AGAINST IT AND IS STATED RATHER THAN HIDDEN.** Chroma 47 is above the shelf's own
median of **35** — which has itself fallen as the shelf has grown and is worth re-measuring rather than
quoting. It is below four hues already shipped (India 61, Dinosaurs 58, Spanish 49, Economics… no:
Spanish 49 and India 61 and Dinosaurs 58), so it is not the loudest thing here, but it is not in the
quiet half either. **Contrast 7.6:1 against white**, comfortably inside the shelf's 3.7–10.4.

**The standing note holds and the magenta was not re-measured.** It came top of the unconstrained sweep
for the sixth time in the Economics plan and has been rejected six times; it should not be measured
again.

### The icon: a new symbol, `tablet`

**A clay tablet with wedge marks on it** — the object this entire collection is made of. Nothing else
on the shelf is a written document (`scroll`, `book` and `letter` exist as generic marks and are
claimed by no collection, but a scroll is papyrus and a book is a codex, and neither is what
Mesopotamia wrote on).

**The collision to avoid is `book` and `letter`, both of which are rectangles.** What separates this is
the SHAPE — a tablet is a rounded, slightly convex rectangle, wider than it is tall, with no spine and
no fold — and the wedge marks inside it, which are three short strokes in two rows rather than the
straight ruled lines a `letter` carries.

**The mark was drawn, rendered and looked at** at 20, 24, 28, 40 and 64px, on dark ground and on light,
beside `book`, `letter` and `scroll`, before the comment above was written. **See the note in
`ICON_SYMBOLS` for what the first draft got wrong**, which is recorded there rather than here because
that is where the next person redrawing it will be.

## What this collection is about, and the six scope decisions

**It is Mesopotamia as a subject with an evidence problem: what happened, what is known, and how.**

**First: THE EVIDENCE IS THE SPINE, AND IT IS UNLIKE ANY OTHER COLLECTION'S.** Almost everything known
about three thousand years comes from excavated clay tablets. They are overwhelmingly
**administrative** — receipts, ration lists, land sales — rather than narrative; they cluster at the
few sites that have been dug; **a large share of what has been excavated has never been read**; and the
famous literary texts survive in copies made centuries after composition. `me-049` to `me-051`,
`me-064` *The bias of the evidence*, `me-065` *What the tablets do not record* and `me-089` *The
backlog of unread tablets* are the cards that say so, **and every other card in the collection inherits
them.** Where a claim rests on one archive or one site, the card says which.

**Second: THE FIRST-CLAIMS ARE THIS SUBJECT'S BIGGEST PULL AND MOST ARE QUALIFIED.** First writing,
first cities, first laws, first literature, first wheel, first schools, first astronomy — this is how
Mesopotamia is sold, and nearly every one of those claims needs a qualification that popular writing
drops. `me-012` *The claim that Mesopotamia was first*, `me-013` *What cradle of civilisation means and
does not*, `me-209` *What being first means in this subject* and `me-890` *What Mesopotamia did and did
not invent* card the problem directly, **and no other card may assert a first without saying first of
what, on what evidence, and against what rival claim.**

**Third: HAMMURABI'S LAWS ARE NOT A LAW CODE, and this is the collection's single most important
correction.** The stele is the best-known object in the subject and is almost universally described as
the first legal code. The scholarship does not support that: there is no evidence the provisions were
cited in court, the surviving court records do not apply them, earlier collections exist, and the
monument's own prologue and epilogue present it as a royal display of justice. `me-470` *Why the laws
are not a law code*, `me-471` *The evidence that the laws were not applied* and `me-472` *What the
stele was for* carry it, with `me-479` *What Mesopotamian law actually looked like* supplying the
alternative. **The card is not a debunking** — a reader needs to know why the other reading was
believed, which is the Dinosaurs plan's rule about corrections.

**Fourth: THE BIBLICAL RELATIONSHIP IS CARDED AS A LITERARY AND HISTORICAL QUESTION AND NOTHING ELSE.**
The flood, the tower, the captivity and the Assyrian sieges all appear in both the cuneiform record and
the Hebrew Bible, and the relationship between them has been argued since the 1870s and is still
argued. `me-739` *The flood story and Genesis*, `me-740` *How the relationship is argued*, `me-538`
*Etemenanki and the Tower of Babel*, `me-614` *Assyrian and biblical accounts compared*, `me-989`
*Babel and Bible* and `me-990` *The controversy over biblical parallels* are the cards. **They describe
what each source says, when each was written and what the arguments are. They take no position on any
theological question**, and a card that treats either text as confirming or refuting the other has
stepped outside what the evidence supports.

**Fifth: MESOPOTAMIA IS NOT ONE CIVILISATION AND THE TREE ENFORCES IT.** Sumer, Akkad, Babylonia and
Assyria are four separate subjects across three millennia, with different languages, different gods in
different order, and different states — and they are given four decks rather than one narrative.
**Sumerian and Akkadian are unrelated languages**, `me-213` cards the Sumerian problem and `me-216`
cards the two side by side. **The commonest error in popular writing is to treat "the Mesopotamians" as
one people with one culture**, and the second is to run Sumer straight into Babylon with a thousand
years missing.

**Sixth: THE DESTRUCTION AND THE DISPERSAL ARE PART OF THE SUBJECT.** `me-104` the looting of the Iraq
Museum, `me-105` the antiquities trade, `me-106` and `me-107` the destruction of sites since 2003 and
at Nimrud and Mosul, `me-108` repatriation, `me-548` *Babylon in Berlin*, `me-996` and `me-997` on
museum holdings and the case for repatriation. **This is live and contested**, so the cards say what
was taken, when, under what law then in force, and what the arguments on each side now are — and
`me-993` to `me-995` card the Iraqi relationship to this past, which is not an afterthought to it.

## Allocation

| Deck | Subdeck | Cards | Range |
|---|---|---|---|
| The Land and the Evidence | What Mesopotamia is | 20 | me-001–020 |
|  | The land between the rivers | 25 | me-021–045 |
|  | The tablets and what survives | 25 | me-046–070 |
|  | Decipherment and Assyriology | 20 | me-071–090 |
|  | Excavating Mesopotamia | 20 | me-091–110 |
| Before Cities | The Neolithic of the north | 25 | me-111–135 |
|  | The Ubaid | 20 | me-136–155 |
|  | The Uruk period | 30 | me-156–185 |
|  | The first cities | 25 | me-186–210 |
| Sumer | The Sumerians | 25 | me-211–235 |
|  | The Early Dynastic period | 30 | me-236–265 |
|  | City and king | 30 | me-266–295 |
|  | The cities of Sumer | 35 | me-296–330 |
| Akkad and Ur | Sargon and the Akkadian empire | 30 | me-331–360 |
|  | The fall of Akkad | 20 | me-361–380 |
|  | The Third Dynasty of Ur | 30 | me-381–410 |
|  | The Amorites and the coming of Babylon | 20 | me-411–430 |
| Babylon | The Old Babylonian period | 25 | me-431–455 |
|  | Hammurabi and his laws | 25 | me-456–480 |
|  | The Kassites and the late Bronze Age | 25 | me-481–505 |
|  | The Neo-Babylonian empire | 25 | me-506–530 |
|  | The city of Babylon | 20 | me-531–550 |
| Assyria | Ashur and early Assyria | 25 | me-551–575 |
|  | The Middle Assyrian kingdom | 20 | me-576–595 |
|  | The Neo-Assyrian empire | 35 | me-596–630 |
|  | How Assyria ruled | 25 | me-631–655 |
|  | The fall of Assyria | 15 | me-656–670 |
| Gods, Temples and the Afterlife | The gods | 30 | me-671–700 |
|  | Temple and cult | 25 | me-701–725 |
|  | Myth and cosmology | 25 | me-726–750 |
|  | Death, demons and divination | 20 | me-751–770 |
| Writing, Science and Literature | Cuneiform as a system | 25 | me-771–795 |
|  | Scribes and schools | 20 | me-796–815 |
|  | Literature | 30 | me-816–845 |
|  | Mathematics | 25 | me-846–870 |
|  | Astronomy, medicine and technology | 20 | me-871–890 |
| Daily Life, Law and Legacy | Society and daily life | 30 | me-891–920 |
|  | Work, land and trade | 25 | me-921–945 |
|  | Law and justice | 25 | me-946–970 |
|  | The end and the afterlife of Mesopotamia | 30 | me-971–1000 |

Deck totals: The Land and the Evidence 110 · Before Cities 100 · Sumer 120 · Akkad and Ur 100 · Babylon 120 · Assyria 120 · Gods, Temples and the Afterlife 100 · Writing, Science and Literature 120 · Daily Life, Law and Legacy 110. **1000.**

## What the weighting is arguing

**Deck 1 takes 110 and only 45 of it is the place.** The other 65 are the tablets, the decipherment and
the excavation — which is the largest evidence deck of any collection on this shelf, and is the first
scope decision made structural. Astronomy gives its method 130 out of 1000 for a similar reason; here
it comes first rather than eighth, because the reader needs it before the narrative rather than after.

**Sumer and Assyria take 120 each, Babylon 120, Akkad and Ur 100.** That is not a ranking of
importance; it is where the evidence is. Sumer has the cities and the Early Dynastic archives, Assyria
has the annals, the reliefs and the state correspondence, Babylon has the law collections, the
scholarly tradition and the Neo-Babylonian temple archives, and Akkad — the most famous of the four —
has the least, which is itself carded at `me-337` *The search for Akkad*, a capital city nobody has
found.

**Writing, science and literature take 120, which is more than any single political deck.** Cuneiform,
the scribal schools, Gilgamesh, sexagesimal mathematics and the astronomical diaries are the reason
this subject is taught outside its own field, and the astronomical record in particular is the longest
continuous run of dated observations anyone made before the modern era.

**Religion takes 100 and is its own deck rather than a strand.** Mesopotamian religion is the frame for
kingship, law, medicine, astronomy and the calendar, and a collection that scattered it would have the
reader meeting the gods as decoration in twenty other cards.

**Deck 9's last subdeck takes 30 for the afterlife of the subject** — the Persian and Seleucid
centuries, the death of cuneiform, the nineteenth-century rediscovery, and the heritage crisis. `me-994`
*Archaeology and Iraqi national identity* and `me-997` *The case for repatriation* are in it because the
sixth scope decision says they belong to the subject rather than to a postscript.

## Six decisions this plan forced on the tree

**Sumer gets a deck and the Sumerians get a subdeck inside it.** Who they were, where they came from and
whether "Sumerian" names a people or a language is a real and unresolved question (`me-213` *The Sumerian
problem*), and separating it from the political history stops every Early Dynastic card carrying it.

**The cities of Sumer are a 35-card subdeck — the largest in the collection — rather than being
distributed.** A Mesopotamian city is the unit of everything here: the political unit, the economic
unit, the religious unit and the excavation unit. Carding them together lets `me-329` ask why some have
never been found and `me-330` ask what the map actually looks like.

**Akkad and Ur III share a deck.** They are two empires, not one, and they are together because the Ur
III state is unintelligible except as the answer to what Akkad did and failed to do — and because the
two centuries between them are the collection's best worked example of what "collapse" does and does
not mean (`me-369`, `me-370`, `me-372`).

**Assyria's "how it ruled" is a subdeck rather than a theme.** Twenty-five cards on provinces, tribute,
the army, deportation, the road system, the scholars at court and the terror — because the Neo-Assyrian
empire is the first state that documented its own method at length, and because the documentation is
propaganda and has to be carded as such (`me-629`, `me-630`, `me-645`).

**Law is in deck 9 and Hammurabi is in deck 5, deliberately.** The stele belongs with the reign that
produced it; what Mesopotamian law actually was — the collections as a genre, the court records, the
oath, the ordeal, the contracts — is a subject of its own and is carded once, properly, at the end.

**`me-999` is "Why Mesopotamia matters" and `me-1000` is "What the tablets may still say".** The second
is this collection's own thesis: there is more unread than read, and the subject is one of the few
where the next major finding is likelier to come out of a museum drawer than out of the ground.

## History, not commemoration — and the five pulls

**The rule this section is the local form of lives in CLAUDE.md** ("FOLIO IS A HISTORY SITE, NOT AN
ARCHAEOLOGY SITE" and its historiography half). **This collection has the strongest claim to an
exemption from the first half of that rule and does not get one**: the excavation genuinely is how
everything is known, so deck 1 cards it *as a subject* — and everywhere else the rule binds normally,
and a card about Ur is about Ur rather than about Woolley.

**The first.** See the second scope decision. It is the loudest thing written about this subject.

**The vivid reconstruction from an administrative text.** A ration list tells you how much barley a
named woman received in one month. It does not tell you what her life was like, and the gap between
those is where most popular writing about Mesopotamian daily life lives. `me-920` *What a day looked
like* is deliberately the last card of its subdeck, so that it can say what the twenty-nine before it
rest on.

**The king's own account.** Assyrian annals, royal inscriptions and year names are the backbone of the
political chronology and every one of them was written to be read by a god or a successor. They record
victories and omit defeats; they attribute to one king what several did. **Cite them as what they are**,
and `me-056`, `me-592`, `me-629` and `me-630` card the problem so the narrative cards can point at it.

**The Bible read backwards into the tablets, or the tablets read as disproving it.** Both happen, both
have a nineteenth-century pedigree, and `me-989`/`me-990` card that history. The fourth scope decision
is the rule.

**The date.** Mesopotamian chronology is genuinely uncertain before about 1500 BCE — the competing
"long", "middle" and "short" chronologies differ by more than a century — and most popular sources give
one set of numbers with no indication that the question is open. See the next section.

## This collection follows the no-researchers rule

**It is NOT excluded from it.** A question is clued from the thing: `me-072` asks what the Behistun
inscription is, not what Rawlinson did with it. **Deck 1's decipherment and excavation subdecks are
exempt by the rule's own terms** — 40 cards where the answer term genuinely IS a modern person or their
work — and everywhere else the rule binds. **The historiography cap binds outside those subdecks**: at
most three of ten sentences on who established a thing.

**Two modern scholars at most across the collection**, on the standing rule, and they should be spent in
deck 1 where an account itself became an event.

## Names, dates and spellings

**THE CHRONOLOGY IS GENUINELY UNCERTAIN AND THE CARDS SAY SO.** For everything before about 1500 BCE
there are competing chronologies — long, middle and short — differing by up to about 150 years, and
**the middle chronology is the usual default rather than the established answer**. `me-068` and `me-069`
card the problem. **A date before 1500 BCE is given with the chronology it belongs to where the card
turns on it**, and where it does not, the card uses the middle chronology and says once that it is doing
so. **Do not silently mix chronologies between cards.**

**Every date in the first seven decks is BCE**, so the house rule applies with no exceptions: **BCE and
CE, never BC or AD**, with the numeral leading. `check-style.js` rule 4 sweeps it.

**Transliteration is a real choice and the collection makes one.** Cuneiform names reach English through
several conventions — Akkadian *Aššur* against *Ashur*, *Ninurta*, *Šamaš* against *Shamash*, *Ur-Nammu*
against *Ur-Namma*. **Use the form a general English reader will meet**: `sh` for š, no macrons or
subscripts in the answer term or the question, with the scholarly form given once in the abstract where
it differs. **`answerText` is what a reader types**, so a diacritic in it is a character nobody can
produce — the same constraint the Economics plan works out in full for formulae.

**A name may belong to several things and the card says which.** Ashur is a city, a god and a country;
Ur is a city and a dynasty; Babylon is a city, a kingdom and a symbol. The glossary keys have to
distinguish them (see below) and so does the prose.

**Regnal dates are given as ranges and attributed.** "Hammurabi (r. c. 1792–1750 BCE, middle
chronology)" is the honest form; a bare year is not.

## Sourcing

**Unusually well served by open access for an ancient subject, and the reason is that the field
digitised early.**

**The open routes that work.** The **Cuneiform Digital Library Initiative (CDLI)** holds catalogue
records, transliterations and images for hundreds of thousands of tablets and is citable per tablet by
its number. The **Electronic Text Corpus of Sumerian Literature (ETCSL)** at Oxford gives composite
texts and translations of the Sumerian literary corpus. **Oracc** (the Open Richly Annotated Cuneiform
Corpus) carries edited, annotated projects including the Neo-Assyrian royal inscriptions and the state
archives. **SAAo** publishes the State Archives of Assyria. The **British Museum**, the **Penn Museum**,
the **Louvre**, the **Vorderasiatisches Museum** and the **Yale Babylonian Collection** publish object
records with numbers, which is what a card should cite when it names an object. The **Journal of
Cuneiform Studies**, **Iraq**, **Zeitschrift für Assyriologie** and **Revue d'Assyriologie** are the
standard journals; much is on JSTOR, and **Oracc and CDLI between them make the primary material more
openly available than for Greece or Rome.**

**A source in German or French is welcome and often necessary** — the field's foundational editions are
in both, and the `[in German]` / `[in French]` chips exist for exactly this. Cite the work under its own
title.

**Four hazards.**

**A translation is an argument.** Sumerian in particular is a language isolate reconstructed from
bilingual lists, and translations of literary texts differ substantially — not in style but in meaning.
**Name the translation** when quoting, and where two standard renderings disagree, `me-087` *Where
translations disagree* is the card that says so.

**Popular writing about Mesopotamia is unusually old.** A great deal of what circulates derives from
work of the 1920s to 1960s — Woolley's interpretations, the temple-state model, the hydraulic
hypothesis — all of which the field has substantially revised. `me-190`/`me-191` and `me-923` card two
of those revisions directly. **Check the date of anything general.**

**A tablet's provenance may be a problem.** Some published texts come from the antiquities market rather
than from excavation, which makes their archaeological context unrecoverable and, for material that left
Iraq after 1990, raises a legal question as well. Where a card rests on an unprovenanced text, say so.

**Wikipedia is thin and dated on this subject compared with its coverage of Greece or Rome.** Follow it
to CDLI, Oracc or ETCSL, which it usually cites and which are better than it is.

## Living beside the other collections

**THE OVERLAPS WERE MEASURED RATHER THAN ASSUMED, and this collection has the largest pre-existing
footprint of any planned so far.**

**WORLD HISTORY HOLDS TWENTY-SIX MESOPOTAMIAN CARDS**, and they are the headline set: `wh-171`
Mesopotamia, `wh-172` Sumer, `wh-173` Uruk, `wh-174` Cuneiform, `wh-177` Ziggurat, `wh-179` Sumerian
city-state, `wh-182`–`wh-183` Gilgamesh and the Epic, `wh-184`–`wh-185` Sargon and the Akkadian Empire,
`wh-188`–`wh-190` the Old Babylonian period, Hammurabi and the Code, `wh-191` Babylon, and more. **This
is the relationship Greece, Rome and France already have with World History** — one card there, a
subdeck here — and needs no special handling beyond writing the finer card as the finer card. `me-001`
*Mesopotamia* and `wh-171` are deliberately the same subject at two scales, as `fr-421` and `wh-757`
are.

**VISUAL ART HOLDS TWENTY-FOUR MESOPOTAMIAN OBJECTS AND THIS COLLECTION MUST NOT RE-CARD THEM.**
`art-035` the Uruk Vase, `art-036` the Mask of Warka, `art-042` the Tell Asmar worshipper, `art-043` the
Standard of Ur, `art-046` the Bull-Headed Lyre, `art-052` the Mask of Sargon, `art-053` the Victory
Stele of Naram-Sin, `art-056` the Stele of Hammurabi, `art-077` the Black Obelisk, `art-079` the
Khorsabad lamassu, `art-080` the Nimrud ivory — and more as that plan runs on. **The rule is France's:
`art` cards the OBJECT, this collection cards what the object is EVIDENCE FOR.** Four lines here are
written to that rule and their titles say so — `me-245` *What the Standard of Ur shows*, `me-349` *What
the Naram-Sin stele claims*, `me-461` *The monument the laws are written on*, `me-603` *The tribute
scenes of Shalmaneser III*. **Check `art`'s running order before writing any card whose subject is a
single object.**

**ASTRONOMY HOLDS TWO AND I WROTE THEM**: `astro-922` *Babylonian astronomy* and `astro-923` *The
Babylonian planetary tables*, in that collection's ancient-and-medieval subdeck. **Astronomy cards them
as the beginning of astronomy; this collection cards them as Mesopotamian scholarship** — which is why
`me-871` is titled *Astronomy in Mesopotamia* rather than repeating the string, and why `me-875` is *The
invention of the zodiac* rather than *The zodiac*, which `astro-034` already is. `me-873` the
astronomical diaries and `me-874` the length of the record are this collection's own.

**EGYPT HOLDS FIVE AND GREECE TWO**, all of them the relationship rather than the subject: `eg-043`
Egypt and Mesopotamia in the fourth millennium, `eg-469`, `eg-499`, `eg-500` and `eg-517` on Assyria,
and `gr-723`/`gr-752` on Alexander's Babylon. Write the Mesopotamian side of each and let the other
collection keep its own.

**GLOSSARY: TWENTY-NINE TERMS ALREADY EXIST — THE MOST OF ANY NEW COLLECTION ON THIS SHELF — AND
`add-glossary.js` WOULD OVERWRITE EVERY ONE IN SILENCE.** Measured when this plan was written, of the
glossary's 3,838 terms these are already there, written for World History's 26 cards: `Mesopotamia`,
`Sumer`, `Uruk`, `Cuneiform`, `Ziggurat`, `Eridu`, `Sumerian_city-state`, `Gilgamesh`,
`Epic_of_Gilgamesh`, `Sargon_of_Akkad`, `Akkadian_Empire`, `Old_Babylonian_period`, `Hammurabi`,
`Code_of_Hammurabi`, `Babylon`, `Mesopotamian_religion`, `Babylonian_mathematics`,
`Babylonian_astronomy`, `Mesopotamian_trade`, `Elam`, `Neo-Assyrian_Empire`, `Nineveh`,
`Neo-Babylonian_Empire`, `Hanging_Gardens_of_Babylon`, `Babylonian_captivity`, `Surrender_of_Babylon`,
`Partition_of_Babylon`, `Seleucia_on_the_Tigris` and `Battle_of_Telamon`. **The pairing rule is
therefore already satisfied for about thirty of this collection's answer terms, and the correct action
on every one of them is to WIDEN the existing description, never to re-run the helper** — the Korea
`Seoul` scar at thirty times the scale. **Check before every run**, and note that `Code_of_Hammurabi` is
the term whose description most needs widening, since the third scope decision says the existing name
is itself the misconception.

**THREE KEYS NEED CARE BECAUSE ONE NAME IS SEVERAL THINGS.** **`Ur`** is a two-character surface and
`buildGlossIndex` skips anything under three characters, so the city must be keyed and aliased
deliberately rather than expected to auto-link. **`Ashur`** is a city, a god and a country and needs
three keys or one entry that says so. **`Babylon`** already exists as the city; the kingdom and the
symbol want their own. And **`Sumerian` and `Akkadian` are both a people and a language** — ask which
sense a card means before linking it.

# The list

## The Land and the Evidence

### What Mesopotamia is — `me-what`

    me-001  Mesopotamia
    me-002  The name Mesopotamia
    me-003  Where Mesopotamia was
    me-004  The peoples of Mesopotamia
    me-005  The languages of Mesopotamia
    me-006  Sumerian
    me-007  Akkadian
    me-008  The span of Mesopotamian history
    me-009  The periods and how they are named
    me-010  Sumer, Akkad, Babylonia and Assyria
    me-011  What Mesopotamia is famous for
    me-012  The claim that Mesopotamia was first
    me-013  What cradle of civilisation means and does not
    me-014  Mesopotamia and the Fertile Crescent
    me-015  Mesopotamia and its neighbours
    me-016  The end of Mesopotamia
    me-017  Mesopotamia and modern Iraq
    me-018  What a Mesopotamian would have called themselves
    me-019  How the periods were worked out
    me-020  What this subject is made of

### The land between the rivers — `me-geography`

    me-021  The Tigris
    me-022  The Euphrates
    me-023  The rivers and their floods
    me-024  The alluvial plain
    me-025  Northern and southern Mesopotamia
    me-026  The marshes of the south
    me-027  The climate of ancient Iraq
    me-028  Climate change in Mesopotamian history
    me-029  Irrigation
    me-030  The canal networks
    me-031  Salinisation
    me-032  The debate over salinisation and decline
    me-033  What the land produced
    me-034  Barley and the staple crop
    me-035  The date palm
    me-036  Sheep, goats and wool
    me-037  What Mesopotamia lacked
    me-038  Stone, metal and timber
    me-039  The trade routes
    me-040  The Persian Gulf and Dilmun
    me-041  The Zagros and the eastern highlands
    me-042  The Syrian steppe and the west
    me-043  Anatolia and the north
    me-044  Reeds, mud and bitumen
    me-045  Building in mud brick

### The tablets and what survives — `me-cuneiform-ev`

    me-046  The cuneiform tablet
    me-047  How a tablet was made
    me-048  Why clay survives
    me-049  How many tablets there are
    me-050  How many are unpublished
    me-051  What the tablets are mostly about
    me-052  Administrative texts
    me-053  Letters
    me-054  Legal documents
    me-055  Royal inscriptions
    me-056  What a royal inscription is for
    me-057  Chronicles and king lists
    me-058  The Sumerian King List
    me-059  How the King List is read
    me-060  Literary manuscripts
    me-061  Archives and libraries
    me-062  The library of Ashurbanipal
    me-063  Where the tablets come from
    me-064  The bias of the evidence
    me-065  What the tablets do not record
    me-066  Dating a tablet
    me-067  Year names and eponyms
    me-068  The chronology problem
    me-069  The long, middle and short chronologies
    me-070  What can be dated and what cannot

### Decipherment and Assyriology — `me-decipher`

    me-071  The decipherment of cuneiform
    me-072  The Behistun inscription
    me-073  Old Persian as the way in
    me-074  Reading Akkadian
    me-075  Recovering Sumerian
    me-076  The problem of a language with no relatives
    me-077  Assyriology
    me-078  What an Assyriologist does
    me-079  Sign lists and dictionaries
    me-080  Transliteration
    me-081  How a cuneiform text is published
    me-082  Copies, photographs and 3D scans
    me-083  The Cuneiform Digital Library
    me-084  Joins and broken tablets
    me-085  Collation
    me-086  Translating an ancient text
    me-087  Where translations disagree
    me-088  The size of the field
    me-089  The backlog of unread tablets
    me-090  What a new reading can change

### Excavating Mesopotamia — `me-digging`

    me-091  The excavation of Mesopotamia
    me-092  The first excavators
    me-093  Nineveh and the Assyrian discoveries
    me-094  The race for museum objects
    me-095  The German excavations at Babylon
    me-096  Woolley at Ur
    me-097  Stratigraphy in Mesopotamian archaeology
    me-098  The tell
    me-099  How a tell forms
    me-100  Survey archaeology
    me-101  What survey adds to excavation
    me-102  Iraqi archaeology in the twentieth century
    me-103  Excavation after 1990
    me-104  The looting of the Iraq Museum
    me-105  Illegal excavation and the antiquities trade
    me-106  The destruction of sites since 2003
    me-107  The destruction at Nimrud and Mosul
    me-108  Repatriation and museum collections
    me-109  Digital reconstruction
    me-110  What is still buried

## Before Cities

### The Neolithic of the north — `me-neolithic`

    me-111  The Neolithic in Mesopotamia
    me-112  The first farmers of the Fertile Crescent
    me-113  Domestication of cereals
    me-114  Domestication of animals
    me-115  Göbekli Tepe
    me-116  What Göbekli Tepe changed
    me-117  Çayönü and the northern sites
    me-118  Jarmo
    me-119  The Hassuna culture
    me-120  The Samarra culture
    me-121  Early irrigation in the north
    me-122  The Halaf culture
    me-123  Halaf pottery
    me-124  Halaf society
    me-125  Trade in the Neolithic north
    me-126  Obsidian
    me-127  The first villages
    me-128  Houses and households
    me-129  Burial in the Neolithic
    me-130  Figurines and what they might mean
    me-131  Population and settlement growth
    me-132  The move south
    me-133  Why the south was settled late
    me-134  The Neolithic north and the urban south
    me-135  What the Neolithic left to the cities

### The Ubaid — `me-ubaid`

    me-136  The Ubaid period
    me-137  Eridu
    me-138  The temple sequence at Eridu
    me-139  Ubaid pottery
    me-140  Ubaid settlement
    me-141  The Ubaid house
    me-142  Irrigation in the Ubaid
    me-143  Ubaid society
    me-144  Was there Ubaid inequality
    me-145  The Ubaid in the north
    me-146  The Ubaid expansion
    me-147  Ubaid trade and the Gulf
    me-148  Boats and the water world
    me-149  Ubaid burials
    me-150  Skull shaping and body practice
    me-151  The Ubaid figurines
    me-152  Continuity from Ubaid to Uruk
    me-153  How the Ubaid is dated
    me-154  What the Ubaid explains
    me-155  The problem of a culture named after pottery

### The Uruk period — `me-uruk`

    me-156  The Uruk period
    me-157  Uruk the city
    me-158  The size of Uruk
    me-159  The Eanna precinct
    me-160  Monumental building at Uruk
    me-161  The cone mosaic
    me-162  The Uruk temple
    me-163  Uruk pottery and mass production
    me-164  The bevel-rim bowl
    me-165  What the bevel-rim bowl was for
    me-166  Rationing and dependent labour
    me-167  The first administrative devices
    me-168  Tokens
    me-169  The token theory of writing's origin
    me-170  Bullae and numerical tablets
    me-171  Seals and sealing
    me-172  The cylinder seal
    me-173  What seals show
    me-174  Proto-cuneiform
    me-175  The earliest tablets
    me-176  What the first texts say
    me-177  The lexical lists
    me-178  The Uruk expansion
    me-179  Uruk colonies and outposts
    me-180  Habuba Kabira
    me-181  Explaining the Uruk expansion
    me-182  The end of the Uruk period
    me-183  The Jemdet Nasr period
    me-184  Uruk and the invention of the state
    me-185  What Uruk is evidence for

### The first cities — `me-urban`

    me-186  The first cities
    me-187  What makes a settlement a city
    me-188  Why cities appeared in southern Mesopotamia
    me-189  Irrigation and the state
    me-190  The hydraulic hypothesis
    me-191  Why the hydraulic hypothesis is doubted
    me-192  Surplus and specialisation
    me-193  Craft specialisation
    me-194  The emergence of hierarchy
    me-195  Temple, palace and household
    me-196  The temple as an institution
    me-197  Early urban planning
    me-198  City walls
    me-199  The countryside around a city
    me-200  Urban population estimates
    me-201  How a city fed itself
    me-202  Disease and the city
    me-203  The city and its hinterland
    me-204  Competition between cities
    me-205  Writing and the city
    me-206  Was the state invented once
    me-207  Comparing Mesopotamia and Egypt
    me-208  Comparing Mesopotamia and the Indus
    me-209  What being first means in this subject
    me-210  The urban revolution as an idea

## Sumer

### The Sumerians — `me-sumerians`

    me-211  The Sumerians
    me-212  Where the Sumerians came from
    me-213  The Sumerian problem
    me-214  The Sumerian language
    me-215  How Sumerian works
    me-216  Sumerian and Akkadian side by side
    me-217  Bilingualism in Mesopotamia
    me-218  The death of spoken Sumerian
    me-219  Sumerian as a learned language
    me-220  Sumerian identity
    me-221  The land of Sumer
    me-222  Sumerian self-description
    me-223  Were the Sumerians a people or a culture
    me-224  The Sumerian pantheon
    me-225  Sumerian kingship
    me-226  The Sumerian city
    me-227  Sumerian art
    me-228  Sumerian sculpture
    me-229  The votive statue
    me-230  Sumerian music
    me-231  Sumerian dress and appearance
    me-232  Sumerian daily life and its evidence
    me-233  The Sumerian legacy in Babylonia
    me-234  Sumerian literature and its survival
    me-235  Why the Sumerians were forgotten

### The Early Dynastic period — `me-earlydyn`

    me-236  The Early Dynastic period
    me-237  The phases of the Early Dynastic
    me-238  The Sumerian city-states
    me-239  Kish
    me-240  Uruk in the Early Dynastic
    me-241  Ur in the Early Dynastic
    me-242  The Royal Cemetery of Ur
    me-243  The graves and the human sacrifices
    me-244  Puabi
    me-245  What the Standard of Ur shows
    me-246  The Royal Game of Ur
    me-247  Lagash
    me-248  The Stele of the Vultures
    me-249  The Lagash and Umma border war
    me-250  Eannatum
    me-251  Entemena
    me-252  Urukagina and his reforms
    me-253  The first recorded reforms
    me-254  Lugalzagesi
    me-255  Warfare in the Early Dynastic
    me-256  Armies and equipment
    me-257  Chariots and the onager
    me-258  Fortification
    me-259  Temples of the Early Dynastic
    me-260  The Tell Asmar hoard
    me-261  Craft and metallurgy
    me-262  The Early Dynastic economy
    me-263  Writing in the Early Dynastic
    me-264  The Abu Salabikh and Fara tablets
    me-265  The end of the Early Dynastic

### City and king — `me-citystates`

    me-266  The Mesopotamian city-state
    me-267  The institutions of a city-state
    me-268  Kingship in Sumer
    me-269  The words for ruler
    me-270  The en, the ensi and the lugal
    me-271  Where kingship came from
    me-272  Kingship descended from heaven
    me-273  The king and the gods
    me-274  Royal legitimacy
    me-275  The sacred marriage
    me-276  The king's duties
    me-277  The king as builder
    me-278  The king as judge
    me-279  The king as shepherd
    me-280  The royal household
    me-281  The palace as an institution
    me-282  Temple and palace
    me-283  The city assembly
    me-284  Was there Mesopotamian democracy
    me-285  Elders and citizens
    me-286  Law before law collections
    me-287  The reform edict
    me-288  Debt cancellation
    me-289  The misharum act
    me-290  Diplomacy between cities
    me-291  Treaties
    me-292  Hegemony and overlordship
    me-293  Kingship over all Sumer
    me-294  Nippur and religious authority
    me-295  Why no city could hold the south

### The cities of Sumer — `me-sumercities`

    me-296  Eridu and the first city
    me-297  Uruk after the Uruk period
    me-298  Ur
    me-299  The city plan of Ur
    me-300  Nippur
    me-301  Enlil and the sanctuary at Nippur
    me-302  Lagash and Girsu
    me-303  Umma
    me-304  Shuruppak
    me-305  Adab
    me-306  Bad-tibira
    me-307  Larsa
    me-308  Isin
    me-309  Kish and the north
    me-310  Sippar
    me-311  Mari
    me-312  The palace at Mari
    me-313  Ebla
    me-314  The Ebla tablets
    me-315  What Ebla changed
    me-316  Susa and Elam
    me-317  Elam and Mesopotamia
    me-318  The northern cities in the third millennium
    me-319  Nineveh before Assyria
    me-320  The cities of the Diyala
    me-321  Eshnunna
    me-322  Eshnunna and the Diyala kingdoms
    me-323  Tutub and the Diyala temples
    me-324  Abandonment and resettlement
    me-325  How a Mesopotamian city died
    me-326  Ruins and the memory of ruins
    me-327  The condition of the sites today
    me-328  The sites and their modern names
    me-329  Why some cities were never found
    me-330  Mapping the cities of Sumer

## Akkad and Ur

### Sargon and the Akkadian empire — `me-sargon`

    me-331  The Akkadian Empire
    me-332  Sargon of Akkad
    me-333  The legend of Sargon's birth
    me-334  Sargon's conquests
    me-335  What Sargon actually ruled
    me-336  Akkad the city
    me-337  The search for Akkad
    me-338  The Akkadian language and the empire
    me-339  Akkadian as an administrative language
    me-340  Imperial administration under Sargon
    me-341  The standardisation of weights and measures
    me-342  Enheduanna
    me-343  The hymns of Enheduanna
    me-344  The first named author
    me-345  What the Enheduanna attribution rests on
    me-346  Rimush and Manishtushu
    me-347  Naram-Sin
    me-348  Naram-Sin's deification
    me-349  What the Naram-Sin stele claims
    me-350  The great revolt
    me-351  Akkadian art
    me-352  The Akkadian royal image
    me-353  The bronze head from Nineveh
    me-354  Akkadian seals and their scenes
    me-355  Trade under the Akkadians
    me-356  The empire's reach
    me-357  Was Akkad an empire
    me-358  Resistance to Akkad
    me-359  The Akkadian legacy
    me-360  Akkad in later memory

### The fall of Akkad — `me-akkadfall`

    me-361  The fall of the Akkadian Empire
    me-362  The Gutians
    me-363  The Curse of Agade
    me-364  How the Curse of Agade explains the fall
    me-365  The 4.2 kiloyear event
    me-366  The climate hypothesis for Akkad's fall
    me-367  Evidence for and against the climate hypothesis
    me-368  Tell Leilan
    me-369  Collapse as an idea in archaeology
    me-370  What collapse meant on the ground
    me-371  The Gutian period
    me-372  How dark the dark age was
    me-373  Lagash under Gudea
    me-374  The statues of Gudea
    me-375  Gudea's building inscriptions
    me-376  The temple of Ningirsu
    me-377  Continuity through the collapse
    me-378  Utu-hegal
    me-379  The end of Gutian rule
    me-380  What followed Akkad

### The Third Dynasty of Ur — `me-ur3`

    me-381  The Third Dynasty of Ur
    me-382  Ur-Nammu
    me-383  The Code of Ur-Nammu
    me-384  What the Ur-Nammu laws contain
    me-385  Shulgi
    me-386  Shulgi's reforms
    me-387  The Ur III state
    me-388  The bureaucracy of Ur III
    me-389  The scale of the Ur III archives
    me-390  What the archives record
    me-391  The bala system
    me-392  Provinces and governors
    me-393  The messenger system
    me-394  Standardised accounting
    me-395  The Ur III calendar
    me-396  Labour and the state
    me-397  Dependent workers
    me-398  Rations
    me-399  Women's labour in Ur III
    me-400  The great ziggurat of Ur
    me-401  Building the ziggurat at Ur
    me-402  Religion under Ur III
    me-403  Deification of the kings
    me-404  Ur III literature
    me-405  The Ur III frontiers
    me-406  The Amorite wall
    me-407  The fall of Ur
    me-408  The Lament for Ur
    me-409  The city laments as a genre
    me-410  What Ur III is famous for

### The Amorites and the coming of Babylon — `me-amorites`

    me-411  The Amorites
    me-412  Who the Amorites were
    me-413  The Amorite question
    me-414  Nomads and settled people
    me-415  The Isin-Larsa period
    me-416  Isin and its kings
    me-417  Larsa and Rim-Sin
    me-418  Competition in the south
    me-419  The rise of new dynasties
    me-420  The Old Assyrian period
    me-421  The Kanesh trade
    me-422  The Old Assyrian merchant archives
    me-423  What the Kanesh letters show
    me-424  Mari under Zimri-Lim
    me-425  The Mari letters and diplomacy
    me-426  Eshnunna and the east
    me-427  Shamshi-Adad
    me-428  The kingdom of Upper Mesopotamia
    me-429  The political map of 1800 BCE
    me-430  Babylon before Hammurabi

## Babylon

### The Old Babylonian period — `me-oldbab`

    me-431  The Old Babylonian period
    me-432  Babylon in its first age
    me-433  The First Dynasty of Babylon
    me-434  Old Babylonian society
    me-435  The Old Babylonian family
    me-436  Marriage and the contract
    me-437  Inheritance
    me-438  Adoption
    me-439  The Old Babylonian economy
    me-440  Silver as money
    me-441  Interest and lending
    me-442  Debt and debt slavery
    me-443  The tamkarum
    me-444  Land tenure
    me-445  The palace and the private sector
    me-446  Old Babylonian letters
    me-447  What the letters reveal
    me-448  Old Babylonian scribal schools
    me-449  The edubba
    me-450  Old Babylonian literature
    me-451  Old Babylonian mathematics
    me-452  Religion in the Old Babylonian period
    me-453  Marduk's rise
    me-454  The end of the First Dynasty
    me-455  The Hittite sack of Babylon

### Hammurabi and his laws — `me-hammurabi`

    me-456  Hammurabi
    me-457  Hammurabi's conquests
    me-458  How Hammurabi unified the south
    me-459  Hammurabi's administration
    me-460  The letters of Hammurabi
    me-461  The monument the laws are written on
    me-462  Where the stele was found
    me-463  The prologue and epilogue
    me-464  What the laws say
    me-465  The structure of the laws
    me-466  An eye for an eye
    me-467  Class and punishment in the laws
    me-468  Women in the laws
    me-469  Slavery in the laws
    me-470  Why the laws are not a law code
    me-471  The evidence that the laws were not applied
    me-472  What the stele was for
    me-473  Earlier collections of laws
    me-474  The laws in the scribal tradition
    me-475  Hammurabi's reputation
    me-476  Hammurabi as a lawgiver in modern memory
    me-477  The stele in the Louvre
    me-478  Hammurabi and the idea of justice
    me-479  What Mesopotamian law actually looked like
    me-480  What the laws tell us about society

### The Kassites and the late Bronze Age — `me-kassite`

    me-481  The Kassites
    me-482  Where the Kassites came from
    me-483  The Kassite dynasty
    me-484  How long the Kassites ruled
    me-485  Kassite Babylonia
    me-486  Dur-Kurigalzu
    me-487  The kudurru
    me-488  What a kudurru records
    me-489  Kassite art
    me-490  Babylon as a great power
    me-491  The Amarna letters
    me-492  Diplomacy between great kings
    me-493  Royal marriage and gift exchange
    me-494  Babylonia and Egypt
    me-495  Babylonia and the Hittites
    me-496  Babylonia and Assyria
    me-497  Elam and Babylon
    me-498  The late Bronze Age system
    me-499  Scholarship under the Kassites
    me-500  The standardisation of texts
    me-501  The canonisation of literature
    me-502  The end of the Kassite dynasty
    me-503  The late Bronze Age collapse and Mesopotamia
    me-504  The second dynasty of Isin
    me-505  Nebuchadnezzar I

### The Neo-Babylonian empire — `me-neobab`

    me-506  The Neo-Babylonian Empire
    me-507  Chaldeans and Arameans
    me-508  Babylonia under Assyrian rule
    me-509  Merodach-Baladan
    me-510  Nabopolassar
    me-511  The fall of Assyria and the Babylonian rise
    me-512  Nebuchadnezzar II
    me-513  Nebuchadnezzar's campaigns
    me-514  The capture of Jerusalem
    me-515  The Babylonian captivity
    me-516  What the exile meant for Judah
    me-517  Babylonian records of the conquest
    me-518  Nebuchadnezzar's building programme
    me-519  Babylonian administration
    me-520  The Neo-Babylonian temple economy
    me-521  The Eanna and Ebabbar archives
    me-522  Neo-Babylonian society
    me-523  Nabonidus
    me-524  Nabonidus and the moon god
    me-525  The Nabonidus Chronicle
    me-526  The fall of Babylon to Cyrus
    me-527  The Cyrus Cylinder
    me-528  What the Cyrus Cylinder says
    me-529  Babylon under the Persians
    me-530  The end of Babylonian independence

### The city of Babylon — `me-babcity`

    me-531  Babylon
    me-532  The plan of Babylon
    me-533  The walls of Babylon
    me-534  The Ishtar Gate
    me-535  The Processional Way
    me-536  Esagila
    me-537  Etemenanki
    me-538  Etemenanki and the Tower of Babel
    me-539  The ziggurat and the biblical story
    me-540  The Hanging Gardens
    me-541  Whether the Hanging Gardens existed
    me-542  The Hanging Gardens and Nineveh
    me-543  Babylon in Greek accounts
    me-544  Herodotus on Babylon
    me-545  How reliable the Greek accounts are
    me-546  Babylon after Alexander
    me-547  The excavation of Babylon
    me-548  Babylon in Berlin
    me-549  Babylon in the twentieth century
    me-550  Babylon as a symbol

## Assyria

### Ashur and early Assyria — `me-earlyassyria`

    me-551  Assyria
    me-552  The city of Ashur
    me-553  The name Assyria
    me-554  Early Ashur
    me-555  Ashur as a trading city
    me-556  The Old Assyrian city-state
    me-557  The Assyrian King List
    me-558  Puzur-Ashur and the early kings
    me-559  Ashur under Shamshi-Adad
    me-560  The kingdom of Shamshi-Adad
    me-561  Assyria under Mitanni
    me-562  Mitanni
    me-563  The Hurrians
    me-564  Assyrian revival under Ashur-uballit
    me-565  The Assyrian heartland
    me-566  The land and economy of Assyria
    me-567  Assyrian and Babylonian difference
    me-568  Assyrian Akkadian
    me-569  Early Assyrian religion
    me-570  The temple of Ashur
    me-571  Assyrian kingship in the early period
    me-572  The vice-regent of Ashur
    me-573  Assyrian expansion begins
    me-574  What drove Assyrian expansion
    me-575  The making of an Assyrian identity

### The Middle Assyrian kingdom — `me-middleassyria`

    me-576  The Middle Assyrian period
    me-577  Adad-nirari I
    me-578  Shalmaneser I
    me-579  Tukulti-Ninurta I
    me-580  The conquest of Babylon
    me-581  The Middle Assyrian state
    me-582  The Middle Assyrian Laws
    me-583  What the Middle Assyrian Laws show
    me-584  Women in the Middle Assyrian Laws
    me-585  The veil and its regulation
    me-586  Middle Assyrian administration
    me-587  Provincial government
    me-588  Deportation begins
    me-589  Middle Assyrian art
    me-590  Tiglath-Pileser I
    me-591  The Assyrian annals
    me-592  What an annal is for
    me-593  The Aramean incursions
    me-594  The Assyrian retreat
    me-595  The dark age between empires

### The Neo-Assyrian empire — `me-neoassyria`

    me-596  The Neo-Assyrian Empire
    me-597  Ashurnasirpal II
    me-598  The Nimrud palace
    me-599  The banquet stele
    me-600  Assyrian palace reliefs
    me-601  What the reliefs depict
    me-602  Shalmaneser III
    me-603  The tribute scenes of Shalmaneser III
    me-604  Assyria and the Levant
    me-605  Tiglath-Pileser III
    me-606  The reforms of Tiglath-Pileser III
    me-607  The conquest of Israel
    me-608  Sargon II
    me-609  Dur-Sharrukin
    me-610  Sennacherib
    me-611  Sennacherib's campaigns
    me-612  The siege of Lachish
    me-613  The siege of Jerusalem
    me-614  Assyrian and biblical accounts compared
    me-615  Nineveh under Sennacherib
    me-616  The aqueduct and the gardens
    me-617  The murder of Sennacherib
    me-618  Esarhaddon
    me-619  The conquest of Egypt
    me-620  Esarhaddon's succession treaty
    me-621  Ashurbanipal
    me-622  Ashurbanipal's library
    me-623  Ashurbanipal's self-presentation
    me-624  The lion hunt reliefs
    me-625  The Elamite wars
    me-626  The civil war with Babylon
    me-627  The extent of the empire
    me-628  The cost of empire
    me-629  Assyrian propaganda and its audience
    me-630  How much of the annals is true

### How Assyria ruled — `me-assyrianstate`

    me-631  The Assyrian imperial system
    me-632  Provinces and vassals
    me-633  Tribute
    me-634  The Assyrian army
    me-635  Chariots, cavalry and infantry
    me-636  Siege warfare
    me-637  Iron and Assyrian weapons
    me-638  Logistics and roads
    me-639  The royal road system
    me-640  Deportation as policy
    me-641  The scale of deportation
    me-642  What happened to the deported
    me-643  Terror as a method
    me-644  Assyrian atrocity in the sources
    me-645  Reading Assyrian violence critically
    me-646  Administration and the scribes
    me-647  The state correspondence
    me-648  Spies and informers
    me-649  Scholars at court
    me-650  Omens and royal decision-making
    me-651  The substitute king ritual
    me-652  The queen and the royal women
    me-653  The eunuchs
    me-654  Assyrian religion and empire
    me-655  Imposing Assyrian cult on the conquered

### The fall of Assyria — `me-assyriafall`

    me-656  The fall of the Assyrian Empire
    me-657  The death of Ashurbanipal
    me-658  Civil war in Assyria
    me-659  The Medes
    me-660  The Babylonian and Median alliance
    me-661  The fall of Ashur
    me-662  The fall of Nineveh
    me-663  The last Assyrian kings
    me-664  Harran and the end
    me-665  Why Assyria fell so fast
    me-666  Explanations for the collapse
    me-667  What happened to the Assyrians
    me-668  Assyria after the empire
    me-669  Assyria in the Hebrew Bible
    me-670  Assyria in later memory

## Gods, Temples and the Afterlife

### The gods — `me-gods`

    me-671  Mesopotamian religion
    me-672  The Mesopotamian pantheon
    me-673  How the pantheon changed
    me-674  An
    me-675  Enlil
    me-676  Enki
    me-677  Inanna
    me-678  Ishtar
    me-679  Identifying Sumerian and Akkadian gods
    me-680  Nanna and Sin
    me-681  Utu and Shamash
    me-682  Ninhursag
    me-683  Marduk
    me-684  The rise of Marduk
    me-685  Nabu
    me-686  Ashur as a god
    me-687  Ereshkigal
    me-688  Dumuzi
    me-689  Ninurta
    me-690  Nergal
    me-691  City gods
    me-692  The god and the city
    me-693  Personal gods
    me-694  The divine assembly
    me-695  Divine statues
    me-696  What a divine statue was
    me-697  The capture of gods
    me-698  Gods and kings
    me-699  Divine hierarchy and its politics
    me-700  How many gods there were

### Temple and cult — `me-temple`

    me-701  The Mesopotamian temple
    me-702  The plan of a temple
    me-703  The ziggurat
    me-704  What a ziggurat was for
    me-705  The temple as a household
    me-706  Feeding the gods
    me-707  The daily cult
    me-708  Festivals
    me-709  The New Year festival
    me-710  The akitu
    me-711  Processions
    me-712  The temple economy
    me-713  Temple land and labour
    me-714  Priests
    me-715  The high priestess
    me-716  Temple personnel
    me-717  Music and the cult
    me-718  Prayer
    me-719  Votive offerings
    me-720  Temple building as a royal act
    me-721  Foundation deposits
    me-722  Restoring a temple
    me-723  Purity and pollution
    me-724  Sacrifice
    me-725  What worship involved

### Myth and cosmology — `me-myth`

    me-726  Mesopotamian myth
    me-727  How myths were transmitted
    me-728  The Mesopotamian cosmos
    me-729  Heaven, earth and the Apsu
    me-730  The creation of the world
    me-731  Enuma Elish
    me-732  What Enuma Elish is for
    me-733  The creation of humans
    me-734  Atrahasis
    me-735  Why the gods made people
    me-736  The flood story
    me-737  The flood in Atrahasis and Gilgamesh
    me-738  Ziusudra and Utnapishtim
    me-739  The flood story and Genesis
    me-740  How the relationship is argued
    me-741  Inanna's descent
    me-742  Tiamat and the sea
    me-743  Enki and the ordering of the world
    me-744  Ninurta's battles
    me-745  Etana and the eagle
    me-746  Adapa
    me-747  The myth of the sages
    me-748  Myth and ritual
    me-749  Myth and politics
    me-750  Reading a Mesopotamian myth

### Death, demons and divination — `me-death`

    me-751  Death in Mesopotamia
    me-752  The netherworld
    me-753  What the dead needed
    me-754  Burial practice
    me-755  The care of the dead
    me-756  Ghosts
    me-757  Demons
    me-758  Lamashtu
    me-759  Pazuzu
    me-760  Exorcism
    me-761  Magic and medicine
    me-762  Incantations
    me-763  Divination
    me-764  Extispicy
    me-765  The liver models
    me-766  Astrology and celestial omens
    me-767  The omen compendia
    me-768  Dreams
    me-769  Divination and the state
    me-770  Belief, practice and what can be known

## Writing, Science and Literature

### Cuneiform as a system — `me-script`

    me-771  Cuneiform
    me-772  The invention of writing
    me-773  Why writing was invented
    me-774  Accounting and the origin of writing
    me-775  From pictures to signs
    me-776  The rebus principle
    me-777  How cuneiform represents sound
    me-778  Logograms and syllabograms
    me-779  Determinatives
    me-780  The number of signs
    me-781  How cuneiform changed over time
    me-782  Writing Sumerian with cuneiform
    me-783  Adapting cuneiform to Akkadian
    me-784  Cuneiform for other languages
    me-785  Hittite, Elamite, Hurrian and Urartian
    me-786  Ugaritic and the alphabet
    me-787  The stylus and the hand
    me-788  Tablet formats
    me-789  Writing on stone and metal
    me-790  Cuneiform monuments
    me-791  Literacy in Mesopotamia
    me-792  How many people could read
    me-793  The persistence of cuneiform
    me-794  The last cuneiform tablet
    me-795  Why cuneiform died

### Scribes and schools — `me-scribes`

    me-796  The Mesopotamian scribe
    me-797  Becoming a scribe
    me-798  The scribal school
    me-799  The curriculum
    me-800  Lexical lists as teaching
    me-801  School exercise tablets
    me-802  Copying and memorisation
    me-803  Scribal humour
    me-804  The satire of the scribal profession
    me-805  Women scribes
    me-806  Scribes and the state
    me-807  Scribes and the temple
    me-808  The scribal family
    me-809  Colophons
    me-810  Who owned a tablet
    me-811  The transmission of texts
    me-812  The stream of tradition
    me-813  Commentaries
    me-814  Scholarship as a profession
    me-815  The scribe's status

### Literature — `me-lit`

    me-816  Mesopotamian literature
    me-817  What counts as literature here
    me-818  The Epic of Gilgamesh
    me-819  The versions of Gilgamesh
    me-820  The Standard Babylonian Gilgamesh
    me-821  Gilgamesh and Enkidu
    me-822  The Humbaba episode
    me-823  The death of Enkidu
    me-824  Gilgamesh's search for immortality
    me-825  The flood tablet
    me-826  The discovery of the flood tablet
    me-827  What Gilgamesh is about
    me-828  The Sumerian Gilgamesh poems
    me-829  The historical Gilgamesh
    me-830  Enuma Elish as literature
    me-831  The Descent of Inanna
    me-832  Lamentations
    me-833  Hymns
    me-834  Royal praise poetry
    me-835  Wisdom literature
    me-836  The Babylonian Theodicy
    me-837  Ludlul bel nemeqi
    me-838  Proverbs
    me-839  Debate poems
    me-840  Love poetry
    me-841  Letters as literature
    me-842  Pseudo-autobiography
    me-843  How Mesopotamian literature was rediscovered
    me-844  Translating Mesopotamian poetry
    me-845  The influence of Mesopotamian literature

### Mathematics — `me-maths`

    me-846  Mesopotamian mathematics
    me-847  The sexagesimal system
    me-848  Why sixty
    me-849  Place value
    me-850  The absence of zero
    me-851  Numerals in cuneiform
    me-852  Metrology
    me-853  Weights and measures
    me-854  The shekel and the mina
    me-855  Mathematical tablets
    me-856  Multiplication and reciprocal tables
    me-857  Solving problems
    me-858  Quadratic problems
    me-859  Plimpton 322
    me-860  What Plimpton 322 is
    me-861  The arguments about Plimpton 322
    me-862  The Pythagorean relation in Mesopotamia
    me-863  Geometry
    me-864  Area and volume
    me-865  Approximating a square root
    me-866  YBC 7289
    me-867  Mathematics teaching
    me-868  Mathematics and administration
    me-869  Was this algebra
    me-870  The legacy of Mesopotamian mathematics

### Astronomy, medicine and technology — `me-sciences`

    me-871  Astronomy in Mesopotamia
    me-872  The observation of the sky
    me-873  The astronomical diaries
    me-874  The length of the record
    me-875  The invention of the zodiac
    me-876  Babylonian planetary theory
    me-877  Predicting eclipses
    me-878  Eclipse records and their use
    me-879  The Babylonian calendar
    me-880  Intercalation
    me-881  Babylonian astronomy and the Greeks
    me-882  The seven-day week question
    me-883  Mesopotamian medicine
    me-884  The physician and the exorcist
    me-885  Diagnostic texts
    me-886  Materia medica
    me-887  Surgery and its limits
    me-888  Technology and invention
    me-889  The wheel and Mesopotamia
    me-890  What Mesopotamia did and did not invent

## Daily Life, Law and Legacy

### Society and daily life — `me-society`

    me-891  Mesopotamian society
    me-892  Social classes
    me-893  The free person and the dependent
    me-894  Slavery in Mesopotamia
    me-895  How people became slaves
    me-896  What slaves did
    me-897  Manumission
    me-898  The household
    me-899  The family
    me-900  Marriage
    me-901  Divorce
    me-902  Children
    me-903  Women in Mesopotamia
    me-904  Women's legal position
    me-905  Women's work
    me-906  The naditu
    me-907  Prostitution and its evidence
    me-908  Sexuality
    me-909  Old age
    me-910  Food and diet
    me-911  Beer
    me-912  Bread and the kitchen
    me-913  Clothing
    me-914  Houses and how people lived
    me-915  Furniture and possessions
    me-916  Hygiene and health
    me-917  Games and leisure
    me-918  Music and instruments
    me-919  Animals and people
    me-920  What a day looked like

### Work, land and trade — `me-economy`

    me-921  The Mesopotamian economy
    me-922  How the economy has been described
    me-923  The temple-state model and its collapse
    me-924  Redistribution, market and household
    me-925  Land ownership
    me-926  The field and its measurement
    me-927  Agricultural labour
    me-928  The agricultural year
    me-929  Yields and their estimation
    me-930  Herding and wool
    me-931  The textile industry
    me-932  Craft production
    me-933  Metalworking
    me-934  Pottery
    me-935  Building trades
    me-936  Merchants
    me-937  Long-distance trade
    me-938  Dilmun, Magan and Meluhha
    me-939  The Indus connection
    me-940  Trade with Anatolia
    me-941  Prices and the evidence for them
    me-942  Silver, barley and exchange
    me-943  Credit and interest
    me-944  Accounting
    me-945  How the economy actually worked

### Law and justice — `me-law`

    me-946  Mesopotamian law
    me-947  The law collections
    me-948  The sequence of law collections
    me-949  The Laws of Lipit-Ishtar
    me-950  The Laws of Eshnunna
    me-951  The Assyrian law collections
    me-952  The Neo-Babylonian laws
    me-953  What the collections have in common
    me-954  Were the collections legislation
    me-955  The casuistic form
    me-956  Court records
    me-957  How a case was heard
    me-958  Judges
    me-959  Evidence and witnesses
    me-960  The oath
    me-961  The river ordeal
    me-962  Contracts
    me-963  Sealing and witnessing
    me-964  Penalties
    me-965  Compensation and retaliation
    me-966  Debt and its remedies
    me-967  Royal edicts and debt release
    me-968  Law and social class
    me-969  Mesopotamian law and later law
    me-970  What Mesopotamian justice was like

### The end and the afterlife of Mesopotamia — `me-legacy`

    me-971  Mesopotamia under the Persians
    me-972  Mesopotamia under Alexander
    me-973  Seleucid Babylonia
    me-974  Greek and Babylonian scholarship
    me-975  Berossus
    me-976  Mesopotamia under the Parthians
    me-977  The survival of cuneiform culture
    me-978  Uruk in the Hellenistic period
    me-979  The last of the temples
    me-980  Mesopotamia and the Sasanians
    me-981  What became of the Mesopotamians
    me-982  The Aramaic transition
    me-983  Mesopotamian survivals in later religion
    me-984  Mesopotamia in the Hebrew Bible
    me-985  Mesopotamia in Greek and Roman writing
    me-986  The classical image of Babylon and Nineveh
    me-987  Mesopotamia forgotten
    me-988  The rediscovery in the nineteenth century
    me-989  Babel and Bible
    me-990  The controversy over biblical parallels
    me-991  Mesopotamia and the history of science
    me-992  Mesopotamia in modern imagination
    me-993  Iraq and its ancient past
    me-994  Archaeology and Iraqi national identity
    me-995  The heritage crisis
    me-996  Museums and their holdings
    me-997  The case for repatriation
    me-998  What is still unknown
    me-999  Why Mesopotamia matters
    me-1000  What the tablets may still say
