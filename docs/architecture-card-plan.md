# Architecture — a 1000-card running order

The plan for `arch`, a new collection: every card's number, topic and deck, fixed in advance so the
collection can be grown one card at a time over many sessions without anyone having to remember what
was intended.

It is the twenty-sixth of these and the eighth that is not a history collection. Read
`docs/greece-card-plan.md` first if this is the first plan you have met; the mechanics are identical
and are not repeated here.

---

## How to use this (the whole point of the file)

**The next card to write is the lowest `arch-NNN` not yet in `data.js`.**

    node -e "global.window={};require('./data.js');const h=new Set(window.CARD_DATA.map(c=>c.id));for(let i=1;i<=1000;i++){const id='arch-'+String(i).padStart(3,'0');if(!h.has(id)){console.log(id);break}}"

Look the number up below, research it, write it, and add it with the deck id this file gives:

    node .claude/add-card.js <card.json> <deckId>

**Always pass the deck id.** Without one `add-card.js` falls back to the first leaf in the whole tree,
which is in China.

There is deliberately **no progress file**. `data.js` says what exists and this file says what is
planned; the next card is whatever falls between them.

The padding above is right for every id but the last: the ids are `arch-001` … `arch-999`, then
`arch-1000`.

## What a line in this list is, and is not

A line is a **subject to research**, not a fact to assert and not necessarily the finished answer
term. `arch-214 The Hanging Gardens problem` is a question about evidence, and the card's actual
answer — the word that gets blanked — is chosen while writing it, from what the sources will support.

Where the research says the line is wrong, **change the line here in the same commit as the card**,
and say so. The house rule stands: never invent a date, a name or a definition.

---

## Making the collection

**The collection does not exist yet and this plan creates it** — the node, its tree, its `COLL_THEME`
hue, a new `ICON_SYMBOLS` mark and its `COLLECTION_SECTION` row all ship with the file.

**The id is `arch` and the card prefix is `arch-`.** Neither is a prefix of any existing one and none is
a prefix of it: `art-` and `astro-` both differ at the second character, and nothing else on the shelf
begins `ar`. The deck ids are also `arch-…`.

**IT NEEDS A `COLLECTION_SECTION` ROW, AND THAT IS THE ONE PIECE OF REGISTRATION THE LAST TWO
COLLECTIONS DID NOT NEED.** `sectionOf` returns History for anything the table does not name, which is
the right answer for the First World War and for Mesopotamia and is the wrong one here. The row is
`arch: "The Arts"`, and it is not a judgement — **the Visual Art plan created that heading for exactly
this**, on the reasoning that it is a heading rather than a collection because "music, architecture,
theatre and literature are the siblings a heading is for", and it says in terms that a second one
"costs a row in COLLECTION_SECTION and nothing else". This is that second one.

### The hue: `#008DC6`, cyanotype blue — and two families were refused before it

**The apt families were swept in CIELAB against the 32 hues now on the shelf, and every one of them is
crowded.** The shelf's median nearest-neighbour distance is **20.3**, its tightest existing pair is
**12.9** (China's vermilion against Russia's lacquer), and its density — hues within ΔE 30 — runs a
median of 6 and a maximum of 10.

**STONE IS REFUSED, AND IT IS THE OBVIOUS COLOUR.** A warm limestone or travertine is what a reader
would expect an architecture collection to wear, and the measurement is decisive against it: the best
mid-toned warm stone stands **16.1** with **TEN hues within 30**, and the best light one **15.0** —
against a shelf that already carries three greys, France's roof slate, the Second World War's dark iron
and the First World War's field grey. A fourth grey at 15 would be pressed against all three.

**BRICK IS REFUSED ON THE SAME NUMBERS.** Terracotta is the other universal building material and the
red-brown corner is the single most crowded on the shelf: the best candidate measures **16.3** with
**nine** neighbours inside 30 — China, Russia, Korea, Visual Art, the German, Indonesian, Mandarin and
Spanish decks. Both refusals also carry an editorial point worth keeping: **a material names a region.**
Limestone says the classical Mediterranean, brick says Mesopotamia and the Low Countries, timber says
Japan and Scandinavia. This collection spends its deck 4 and deck 5 arguing that no one tradition is the
subject, and a banner in one tradition's material would say otherwise at a glance.

**WHAT IS TAKEN IS THE DRAWING RATHER THAN THE BUILDING.** `#008DC6` is the blue of a cyanotype — the
print process that gave the blueprint its name and its colour. It names no country, no century and no
material; it names the act this collection is actually about, which is **designing** a building rather
than being one. Deck 1 ends with 23 cards on plan, section, elevation, projection, scale and the model,
and the hue is that subdeck's colour.

**The numbers, stated in full because they are not flattering.** It stands **18.7** from Greece's Aegean
blue, **19.7** from the French deck's blue, **26.0** from Politics: East Asia's periwinkle and **29.2**
from Economics' teal. That is **below the shelf's median of 20.3** and would be the seventh-closest hue
of the thirty-three — ahead of Rome and Geography-China at 18.2, the Mandarin deck at 17.5, the
Indonesian deck at 17.4 and the China–Russia pair at 12.9, so it is comfortably inside what this shelf
has already accepted, and the one figure in its favour is **density 4 against a median of 6**. Its
lightness is L 55 and its chroma 40, just above the shelf's median of 35; at **3.7:1 against white** it
sits at the light end of the shelf's own 3.7–10.4 band, exactly level with India's ochre, which is the
lightest hue already on it.

**IT IS A FIFTH BLUE AND NEEDS THE ARGUMENT ASTRONOMY'S FOURTH PURPLE NEEDED.** The others are Greece's
Aegean (L 44, chroma 25), the United States' navy (L 29), Geography-China's blue (L 35), the French
deck's blue (L 51, chroma 51) and Politics: East Asia's periwinkle (L 53, desaturated). This is the
**light, saturated, cyan-leaning** end of the band: Greece sits at almost the same hue angle and is
eleven points darker and fifteen points less saturated, and the French deck's blue is twenty degrees
further round toward violet. Rendered as a banner and as its 20% wash beside all five on the real
Collections page, it is plainly a different colour from each.

**Two regions that score better were NOT re-measured, on the standing note in `COLL_THEME`.** The
magenta around `#c057b1` came top of the unconstrained sweep again — that is the eighth time — and the
olive-brass beside it measured 21.5 here, which is the best non-magenta score on the whole wheel and is
refused on its own standing note, since it would be the sixth thing in the yellow-green-brown quarter.
Neither is going to be chosen; do not run either sweep again.

**AND THE ONE THING TO CHECK IF IT EVER NEEDS MOVING**: go darker rather than greener. The deeper
cyanotype, the true Prussian blue of the print itself, was measured across the whole lightness band and
tops out at **16.9**, sitting on the United States' navy — which is why the light end was taken.

### The icon: an arch

**`arch`, drawn as a round-headed arch of two concentric curves on two piers, standing on a ground
line.** The sharpest icon problem any collection on this shelf has posed, because **eight of the
forty-nine marks are already buildings**: `pagoda`, `column`, `dome`, `pyramid`, `torii`, `castle`,
`wall` and `eiffel`. An architecture collection may have none of them, and the answer is not a
building at all but a piece of construction — the one structural invention that is not the property of
any one tradition, since Mesopotamian, Roman, Sasanian, Islamic, Gothic and Chinese building all turn
on it.

**THE RING IS WHAT MAKES IT READABLE, AND IT WAS MEASURED BY RENDERING RATHER THAN REASONED ABOUT.**
A single-line arch — one curve on two legs — was drawn first and reads at 24px as a doorway, a
tombstone or a plain shed; drawing the arch as an extrados and an intrados, with the opening inside it,
is what says *masonry* and what separates it from the onion `dome` beside it in the list. **A keystone
was tried twice and refused both times**: as a wedge projecting above the crown it reads at 24px as a
chimney on a hut, and as two radial joint lines it crowds the ring into a smear. Rendered at 24, 28 and
34px against `dome`, `torii`, `castle`, `pyramid`, `column`, `eiffel`, `wall` and `map`, the plain ring
is unmistakable against all of them.

**Keep the ring and keep the ground line.** Without the ground line the shape floats and reads as a
horseshoe; without the ring it is a door.


---

## What this collection is about

**It is about how buildings are designed and built, and why they take the forms they do.** That is
narrower than "buildings" and much narrower than "the history of the places buildings are in". The
subject of a card here is a structural idea, a material, a plan, a climate problem, a way of drawing,
a tradition of building, or one building considered as a piece of construction.

Three things follow from that sentence and each of them decides a large part of the running order.

**IT IS NOT A HISTORY COLLECTION, AND DECK 1 IS WHAT SAYS SO.** One hundred and fifteen cards on load
and span, on materials, on light and heat and water, and on the drawing come FIRST, before any period
at all — the shape Ancient Mesopotamia's evidence deck has, and for the same reason: **every later
card inherits them.** A reader who has met `arch-018 The arch`, `arch-021 Thrust` and `arch-022
Buttress` can be told in ten sentences why Beauvais fell, and a reader who has not cannot. Writing the
Gothic deck before the structure deck is the one ordering mistake that would cost this collection most,
because the later cards would then have to re-explain the same mechanics twenty times over.

**IT IS NOT AN ART COLLECTION EITHER, WHICH IS A SEPARATE POINT AND A SHARPER ONE.** Visual Art (`art`)
is already on the shelf under the same section heading, and its own plan says outright that a movement,
a technique, a school, a material, a site, a patron and a museum are all out of it: an `art` card is one
identifiable, showable, portable work. **So the two collections do not compete for a single line.** The
mosaics of the Dome of the Rock are `art-191`; the Dome of the Rock is `arch-444`. The Villa of the
Mysteries frieze is `art-140`; the Roman villa is `arch-296`. **Where a building holds a famous work,
`art` cards the work and this collection cards the building** — and a reader who has both meets the same
room twice from two directions, which is the good outcome rather than a repetition.

**AND IT IS NOT A WESTERN COLLECTION.** The easy thousand here is Greece to Rome to Romanesque to Gothic
to Renaissance to modernism, with the rest of the world as an appendix, because that is the shape of
nearly every general book on the subject in English. This plan refuses it by arithmetic rather than by
intention: **deck 4 gives 120 cards to Asia in chronological position** — the same as the whole ancient
Mediterranean and Near East get in deck 3 — the Islamic world takes 34 cards at the head of deck 5
rather than a coda at its end, and Africa, the Americas, the Pacific and the steppe are carded where
they belong in the order. Counted end to end, a little under half the thousand is Europe and North
America, which for a subject whose literature is perhaps four-fifths Western is a deliberate correction
and not an accident.

---

## Is there a thousand cards in this?

Yes, and the reason is deck 1. A genus list runs out and a monument list runs out; **the vocabulary of
construction does not**, because every one of its terms is a thing a reader can be shown and then meet
again in forty later cards. The 115 cards of deck 1 are each independently worth knowing — a reader who
learns what a pendentive is has learned something they will use at Hagia Sophia, at St Peter's and at
the Hall of Mirrors — and they are the cheapest hundred cards in the collection to write well, because
their sources are engineering textbooks rather than contested history.

**Only about a fifth of the thousand names one building.** The rest is structure, material, climate,
plan, city, profession and method. That ratio is the plan's main defence against the failure the
Dinosaurs plan names for genus cards: a monument earns its slot by teaching something the tradition
card does not. The Parthenon is here (`arch-262`) because of entasis and the optical refinements, which
are `arch-260` and `arch-261` and are not a fact about Athens; Beauvais is here (`arch-535`) because it
fell down.

**The modern half is not padding either.** Decks 7 to 9 take 340 cards, and the reason is that the last
two centuries are when the discipline acquired most of what it now is: the steel frame, the lift, the
curtain wall, reinforced concrete, building regulation, the profession itself, mass housing, and the
argument about carbon. A collection that spent 800 cards before 1800 would be a collection about
monuments.

---

## Five scope decisions

**1. VERNACULAR BUILDING IS CARDED, NOT JUST MONUMENTS.** Almost every building ever made was put up
without an architect, to a pattern nobody wrote down, out of what was to hand. If the collection cards
only the designed exceptions it teaches that architecture is what rich institutions commission, which
is both false and the commonest thing a survey gets wrong. So `arch-140 Vernacular architecture` sits
at the end of deck 2 as a card in its own right, and the vernacular runs through the whole order: the
yurt, the tipi, the pit house, the crannog, the tulou, the Loess cave dwelling, the minka, the stilt
house, the bahay kubo, the shophouse, the log cabin, the shotgun house, the back-to-back, the
bye-law terrace. **When a deck offers a choice between a palace and the house most people in that
society actually lived in, this plan has generally taken both.**

**2. A BUILDING IS CARDED FOR WHAT IT SOLVES.** This is the overlap rule and it is stated again under
"The overlaps" below, because it is the one that decides the most lines.

**3. THE MODERN DECKS CARD WHAT FAILED AS WELL AS WHAT WAS BUILT.** `arch-842 Pruitt-Igoe`, `arch-843
Ronan Point`, `arch-844 The failure of the tower block`, `arch-824 The flat roof and its problems`,
`arch-946 Demolition and its cost`, `arch-966 Facadism`, `arch-972 Urban renewal and its victims`. The
modern movement is the part of this subject where a survey most easily becomes a catalogue of
manifestos, and a manifesto is evidence of what somebody intended rather than of what happened to the
people who had to live in it. **Where a famous building is also a famous failure, the card says both**;
where a reform housed people well, the card says that too, which is why Red Vienna, Bournville and
Saltaire are here beside Pruitt-Igoe.

**4. THE PROFESSION AND ITS LABOUR ARE THE LAST SUBDECK, AND THEY ARE NOT AN AFTERWORD.** Twenty-four
cards on who designs, who pays, who builds and who is credited. **`arch-985 Construction labour`,
`arch-986 Safety on the building site` and `arch-987 Migrant labour and construction` are in the
running order on purpose**: buildings are made by people, a great many of them have died making them,
and a thousand cards that never mention it would be making a claim by omission. So would a thousand
cards in which every named designer is a man, hence `arch-989`, `arch-990` and `arch-991`.

**5. THE CLIMATE DECK IS CARDED AS EVIDENCE, NOT AS ADVOCACY.** Twenty-five cards on embodied and
operational carbon, on concrete, on timber, on retrofit and on reuse. The rule is the house rule
everywhere else: **give the figure, give whose figure it is, and give the date it was measured.**
`arch-949 Greenwashing in architecture` and `arch-948 Green building certification` are there because
the gap between what a building is certified to do and what it measurably does is itself one of the
better-studied findings in the field, and a collection that left it out would be advertising.

---

## The overlaps, measured

This collection has a very large pre-existing footprint — roughly a hundred lines across the other
plans name a building — and it was **measured rather than guessed**, by grepping every
`docs/*-card-plan.md` for the vocabulary of building.

**THE DIVISION OF LABOUR IS ONE SENTENCE: a national collection cards a building as an episode in that
country's history; this collection cards how it was built and why it looks like that.** So `ru-206
Saint Basil's Cathedral` is Ivan IV's monument to the taking of Kazan, and `arch-490` is the same
building as nine chapels on one podium; `cnh-722 Great Wall of China` is what the wall was for, and
`arch-360 The Great Wall as construction` is rammed earth, brick facing and the logistics of a
frontier; `wh-212 Great Pyramid of Giza` is the Fourth Dynasty's achievement, and `arch-227 Pyramid
construction` and `arch-228 Pyramid ramps` are the argument about how the stones got up there.

What each collection holds, counting only real card lines:

| collection | lines that name a building | how this collection differs |
|---|---|---|
| Visual Art (`art`) | 28 | `art` cards the WORK, this collection the BUILDING — see above |
| Ancient Egypt (`eg`) | 24 | the pyramids are a dynasty's project there, a construction problem here |
| India (`in`) | 22 | a temple is a dynasty's patronage there, a plan and a shikhara here |
| Ancient Rome (`rm`) | 17 | the Colosseum is a political gift there, a structure here |
| World History (`wh`) | 15 | headline monuments, one card each |
| Russia (`ru`) | 14 | church architecture as national style there, as construction here |
| Korea (`ko`) | 11 | `ko-943 Korean architecture` is one card; `arch-393`–`arch-397` are five |
| Ancient Greece (`gr`) | 10 | the temple as cult and civic act there, as orders and refinements here |
| Ancient Mesopotamia (`me`) | 9 | the temple as an institution there, the ziggurat as a structure here |
| Japan (`jp`) | 9 | `jp-990 Japanese architecture` is one card; deck 4 gives it 26 |

**A NATIONAL COLLECTION'S SINGLE SURVEY LINE IS THIS COLLECTION'S SUBDECK.** `ru-849 Russian church
architecture`, `jp-990 Japanese architecture`, `cnh-962 Chinese architecture`, `ko-943 Korean
architecture`, `in-186 Gupta temple architecture` and `fr-128 Romanesque architecture in France` are
each one card where they stand, and each is a whole run of cards here. **Write the pair deliberately
when you reach it**: the national card should say what the tradition meant to that country, and the
cards here should say how the buildings work.

**THE ONE PLACE THE RULE RUNS THE OTHER WAY IS THE CITY.** Haussmann's Paris, the Ringstrasse and the
Eixample are in deck 7 because the nineteenth-century remaking of the European city is a fact about
building rather than only about politics — but `fr-` will want Haussmann too, and that pair should be
written together.

---

## Dates, names and spellings

**A BUILDING'S DATE IS A RANGE AND USUALLY AN ARGUED ONE.** Cathedrals took two centuries, were
altered in every one of them, and the "date" a book gives is a convention. A date line here should say
what it is dating — begun, completed, consecrated, rebuilt — using the labels `date-line.js` already
takes, and **a card about a building that was rebuilt says which building it is about**.

**A BUILDING KEEPS THE NAME A GENERAL READER WILL MEET**, which is usually the English one where an
English one is settled (Cologne Cathedral, the Great Mosque of Córdoba) and the local one where it is
not (Siheyuan, Hanok, Minka, Tongkonan, Rumah gadang). `answerText` is what the reader TYPES, so an
answer term carrying a diacritic needs checking against `gradeCloze`'s near-miss tolerance before it
ships: *Çatalhöyük*, *Dolní Věstonice*, *Ġgantija* and *Ħal Saflieni* are all in this order and all
four are typed by a reader with an English keyboard.

**AND THE ORDERS ARE A VOCABULARY, NOT A STYLE.** Doric, Ionic and Corinthian are carded in deck 3 as
what they are — a system of proportion — and the Renaissance and Neoclassical decks use them again.
Do not write a card that treats an order as a period.

---

## Sourcing

Architecture is well served and the one real trap is the opposite of Astronomy's. **Most of the
accessible writing is either a technical manual with no history in it or a coffee-table survey with no
evidence in it**, and the second is the one to avoid: a beautifully photographed book that dates
Chartres to a year and attributes it to nobody is not a source for either claim.

What does answer well from here, measured on earlier batches: museum and heritage-body records (Historic
England, the National Park Service, UNESCO's own nomination dossiers, which are long, referenced and
free), university repositories via OpenAIRE and DOAJ, the Getty's conservation publications, and the
out-of-copyright canon on archive.org — **Vitruvius, Alberti, Palladio, Ruskin, Viollet-le-Duc, Pugin,
Semper and Le Corbusier are all public domain in translation**, which matters more here than in most
collections because deck 6 and deck 7 card the arguments those books ARE.

**AN ARCHITECT'S OWN MANIFESTO IS A SOURCE FOR WHAT HE CLAIMED AND NOT FOR WHAT HE BUILT.** *Vers une
architecture* is evidence about Le Corbusier's programme; whether Villa Savoye leaked is a separate
question with separate sources, and the card that cites the first for the second has made the
commonest mistake in this literature. The house rule about a state's account of its own actions is the
same rule.

**A MODERN BUILDING'S PICTURE IS NOT AUTOMATICALLY FREE**, unlike a medieval one. Freedom of panorama
covers exterior photographs of buildings in Britain, Germany and much of the Commonwealth and does NOT
in France, Italy, Greece, Belgium or the United States for buildings after 1990. **Check Commons before
promising a picture for a twentieth-century card**; `node .claude/check-image-free.js` answers the other
half of the question, which is whether Folio already uses the file.

---

## The glossary

**Eighteen of this collection's terms already exist and `add-glossary.js` would overwrite every one of
them in silence.** `Doric_order`, `Ionic_order`, `Corinthian_order`, `Architrave`, `Pediment`,
`Cyclopean_masonry`, `Temple`, `Archaic_temple`, `Ziggurat`, `Stupa`, `Gothic_architecture`,
`Greek_Revival_architecture`, `Indo-Islamic_architecture`, `Parthenon`, `Colosseum`, `Hagia_Sophia`,
`Fresco` and the named Greek temples were written for the Greece, Rome, India and World History
collections. **The correct action on each is to WIDEN the description, not to re-key it** — the Korea
`Seoul` scar, and here it is eighteen terms rather than one. Check before running the helper.

**AND THE TRAP THIS COLLECTION HAS IS ECONOMICS'S, AT A LARGER SCALE: its vocabulary is ordinary
English words used technically.** Plan, section, elevation, order, bay, arch, column, wall, frame,
core, shell, load, span, site, scale, light, fabric, opening, skin, mass, module. **Almost none of them
may claim its bare surface** — `buildGlossIndex` would auto-link the wrong sense across thousands of
cards in every other collection — so they are keyed `Plan_(architecture)`, `Bay_(architecture)`,
`Order_(architecture)` on `Life_(biology)`'s rule, reached by a narrower alias and a hand-written
`data-k`. **Measure the bare word over the shipped corpus before deciding**, exactly as `Cell_(biology)`
was measured twice and answered differently the second time.

**`Arch` is the sharpest of them** and is worth stating outright: it is a prefix (archbishop, archive,
archaeology, archon, archipelago) as well as a word, the corpus already holds sixty-odd keys beginning
with those letters, and `buildGlossIndex` matches on word boundaries that an ASCII `\b` gets wrong
around an accent. Key it `Arch_(architecture)` and give it no bare alias.

## Allocation

| Deck | Subdeck | Cards | Range |
|---|---|---|---|
| How a building stands up | Forces, spans and structure | 35 | arch-001–035 |
|  | Materials | 35 | arch-036–070 |
|  | Light, heat, water and sound | 22 | arch-071–092 |
|  | Drawing, model and plan | 23 | arch-093–115 |
| The first builders | Shelter before architecture | 25 | arch-116–140 |
|  | The Neolithic house and village | 27 | arch-141–167 |
|  | Megaliths and mounds | 28 | arch-168–195 |
| The ancient world | Mesopotamia and Persia | 26 | arch-196–221 |
|  | Egypt | 26 | arch-222–247 |
|  | Greece and the Aegean | 26 | arch-248–273 |
|  | Rome | 30 | arch-274–303 |
|  | The early Americas | 12 | arch-304–315 |
| Asia | South Asia | 28 | arch-316–343 |
|  | China | 28 | arch-344–371 |
|  | Japan and Korea | 26 | arch-372–397 |
|  | Southeast Asia | 20 | arch-398–417 |
|  | Central Asia and the mountains | 18 | arch-418–435 |
| The Islamic world and medieval Europe | The Islamic world | 34 | arch-436–469 |
|  | Byzantium and the Orthodox world | 24 | arch-470–493 |
|  | Romanesque | 24 | arch-494–517 |
|  | Gothic | 33 | arch-518–550 |
| Renaissance to Enlightenment | The Renaissance | 30 | arch-551–580 |
|  | Baroque and Rococo | 28 | arch-581–608 |
|  | Neoclassicism and the Enlightenment | 27 | arch-609–635 |
|  | Empire and the colonial building | 25 | arch-636–660 |
| The industrial century | Iron, glass and the engineer | 28 | arch-661–688 |
|  | The industrial city | 28 | arch-689–716 |
|  | The revivals and the battle of the styles | 27 | arch-717–743 |
|  | The tall building | 27 | arch-744–770 |
| The modern movement | Before the modern movement | 24 | arch-771–794 |
|  | The modern movement | 30 | arch-795–824 |
|  | Mass housing | 22 | arch-825–846 |
|  | The International Style and after | 22 | arch-847–868 |
|  | Other modernisms | 17 | arch-869–885 |
| Now | Brutalism, postmodernism and after | 22 | arch-886–907 |
|  | High-tech and the engineered envelope | 20 | arch-908–927 |
|  | Building and the climate | 25 | arch-928–952 |
|  | Conservation, repair and loss | 24 | arch-953–976 |
|  | The profession and its questions | 24 | arch-977–arch-1000 |

Nine decks, thirty-nine subdecks, one thousand cards.

---

# The list

## How a building stands up

### Forces, spans and structure — `arch-forces`

    arch-001  What architecture is
    arch-002  Load
    arch-003  Dead load and live load
    arch-004  Compression
    arch-005  Tension
    arch-006  Bending
    arch-007  Shear
    arch-008  Buckling
    arch-009  Foundation
    arch-010  Bearing capacity
    arch-011  Pile foundation
    arch-012  The wall
    arch-013  Load-bearing wall
    arch-014  Post and lintel
    arch-015  Span
    arch-016  The beam
    arch-017  Corbelling
    arch-018  The arch
    arch-019  Voussoir
    arch-020  Keystone
    arch-021  Thrust
    arch-022  Buttress
    arch-023  The barrel vault
    arch-024  The groin vault
    arch-025  The rib vault
    arch-026  The dome
    arch-027  Pendentive
    arch-028  Squinch
    arch-029  The truss
    arch-030  The frame
    arch-031  Cantilever
    arch-032  The shell structure
    arch-033  Tensile structure
    arch-034  Structural redundancy
    arch-035  Collapse

### Materials — `arch-materials`

    arch-036  Building material
    arch-037  Earth building
    arch-038  Rammed earth
    arch-039  Adobe
    arch-040  Cob
    arch-041  Mudbrick
    arch-042  Fired brick
    arch-043  Brick bond
    arch-044  Mortar
    arch-045  Lime mortar
    arch-046  Stone masonry
    arch-047  Quarrying
    arch-048  Ashlar
    arch-049  Rubble masonry
    arch-050  Dry stone
    arch-051  Marble
    arch-052  Limestone
    arch-053  Granite
    arch-054  Timber
    arch-055  Timber framing
    arch-056  The joint in wood
    arch-057  Thatch
    arch-058  Roof covering
    arch-059  Tile
    arch-060  Slate
    arch-061  Roman concrete
    arch-062  Portland cement
    arch-063  Reinforced concrete
    arch-064  Prestressed concrete
    arch-065  Cast iron
    arch-066  Wrought iron
    arch-067  Structural steel
    arch-068  Glass in building
    arch-069  Plaster and render
    arch-070  Bamboo

### Light, heat, water and sound — `arch-climate`

    arch-071  Orientation
    arch-072  Daylighting
    arch-073  The window
    arch-074  Glazing
    arch-075  Shading
    arch-076  The courtyard
    arch-077  Ventilation
    arch-078  The wind tower
    arch-079  Thermal mass
    arch-080  Insulation
    arch-081  The hearth and the chimney
    arch-082  Heating
    arch-083  Air conditioning
    arch-084  Damp
    arch-085  The roof pitch
    arch-086  The gutter and the downpipe
    arch-087  Water supply in buildings
    arch-088  Drainage and sanitation
    arch-089  Acoustics
    arch-090  Reverberation
    arch-091  Fire in buildings
    arch-092  Fire escape

### Drawing, model and plan — `arch-drawing`

    arch-093  The architectural drawing
    arch-094  Plan
    arch-095  Section
    arch-096  Elevation
    arch-097  Orthographic projection
    arch-098  Perspective in architecture
    arch-099  Axonometric drawing
    arch-100  Scale
    arch-101  The architectural model
    arch-102  The measured survey
    arch-103  Proportion
    arch-104  The module
    arch-105  The order
    arch-106  Symmetry in architecture
    arch-107  The grid
    arch-108  Circulation
    arch-109  The programme
    arch-110  Site
    arch-111  The specification
    arch-112  The building contract
    arch-113  Building regulation
    arch-114  Standardisation
    arch-115  Computer-aided design

## The first builders

### Shelter before architecture — `arch-shelter`

    arch-116  Shelter
    arch-117  The cave as dwelling
    arch-118  Rock shelter
    arch-119  Hearths and the first floors
    arch-120  Mammoth bone dwellings
    arch-121  The windbreak
    arch-122  The tent
    arch-123  Nomadic dwelling
    arch-124  The yurt
    arch-125  The tipi
    arch-126  The pit house
    arch-127  Ohalo II
    arch-128  Terra Amata
    arch-129  Dolní Věstonice
    arch-130  Mezhyrich
    arch-131  The Natufian house
    arch-132  Ain Mallaha
    arch-133  Hallan Çemi
    arch-134  Wadi Faynan 16
    arch-135  Zawi Chemi Shanidar
    arch-136  Building before agriculture
    arch-137  The round house
    arch-138  The transition from round to rectangular
    arch-139  Building and sedentism
    arch-140  Vernacular architecture

### The Neolithic house and village — `arch-village`

    arch-141  The Neolithic house
    arch-142  Göbekli Tepe
    arch-143  Karahan Tepe
    arch-144  Nevalı Çori
    arch-145  Jericho
    arch-146  The Tower of Jericho
    arch-147  Çatalhöyük
    arch-148  The roof-entry house
    arch-149  Aşıklı Höyük
    arch-150  Mehrgarh
    arch-151  Banpo
    arch-152  Jiahu
    arch-153  The longhouse of the Linear Pottery culture
    arch-154  The European Neolithic village
    arch-155  The crannog
    arch-156  The lake dwelling
    arch-157  Skara Brae
    arch-158  The Neolithic of the Nile
    arch-159  Neolithic building in the Americas
    arch-160  The pueblo
    arch-161  Storage and the granary
    arch-162  The threshing floor
    arch-163  The enclosure
    arch-164  The ditch and bank
    arch-165  Mudbrick and the first standard sizes
    arch-166  Plaster floors
    arch-167  Household archaeology

### Megaliths and mounds — `arch-megalith`

    arch-168  Megalith
    arch-169  The dolmen
    arch-170  The passage grave
    arch-171  Newgrange
    arch-172  Maeshowe
    arch-173  The menhir
    arch-174  The stone circle
    arch-175  Stonehenge
    arch-176  Avebury
    arch-177  Carnac
    arch-178  The henge
    arch-179  The cursus
    arch-180  The long barrow
    arch-181  West Kennet Long Barrow
    arch-182  The round barrow
    arch-183  Silbury Hill
    arch-184  The Maltese temples
    arch-185  Ġgantija
    arch-186  Ħal Saflieni Hypogeum
    arch-187  The nuraghe
    arch-188  The talayot
    arch-189  Newark Earthworks
    arch-190  Poverty Point
    arch-191  Watson Brake
    arch-192  The mound builders
    arch-193  Cahokia
    arch-194  Astronomical alignment in early building
    arch-195  Moving and raising megaliths

## The ancient world

### Mesopotamia and Persia — `arch-mesopotamia`

    arch-196  Building in Mesopotamia
    arch-197  The Uruk temple
    arch-198  The White Temple
    arch-199  The Eanna precinct
    arch-200  Cone mosaic
    arch-201  The ziggurat
    arch-202  Ziggurat of Ur
    arch-203  Etemenanki
    arch-204  The Mesopotamian courtyard house
    arch-205  The Mesopotamian palace
    arch-206  The palace at Mari
    arch-207  The Assyrian palace
    arch-208  Dur-Sharrukin
    arch-209  The citadel of Nineveh
    arch-210  The lamassu gateway
    arch-211  The walls of Babylon
    arch-212  The Ishtar Gate
    arch-213  The Processional Way
    arch-214  The Hanging Gardens problem
    arch-215  Canal and city in Mesopotamia
    arch-216  Persepolis
    arch-217  The apadana
    arch-218  Pasargadae
    arch-219  Achaemenid stone-cutting
    arch-220  The Sasanian iwan
    arch-221  Taq Kasra

### Egypt — `arch-egypt`

    arch-222  Building in ancient Egypt
    arch-223  The mastaba
    arch-224  The Step Pyramid complex
    arch-225  Imhotep
    arch-226  The true pyramid
    arch-227  Pyramid construction
    arch-228  Pyramid ramps
    arch-229  The Giza plateau
    arch-230  The mortuary temple
    arch-231  The valley temple
    arch-232  The rock-cut tomb
    arch-233  The Valley of the Kings
    arch-234  Abu Simbel
    arch-235  The Egyptian temple plan
    arch-236  The pylon
    arch-237  The hypostyle hall
    arch-238  Karnak
    arch-239  Luxor Temple
    arch-240  The obelisk
    arch-241  Egyptian column types
    arch-242  Deir el-Bahari
    arch-243  The workers' village at Deir el-Medina
    arch-244  Amarna
    arch-245  The Egyptian house and garden
    arch-246  Egyptian quarrying and transport
    arch-247  The Egyptian builder's tools

### Greece and the Aegean — `arch-greece`

    arch-248  Minoan building
    arch-249  The palace at Knossos
    arch-250  The Minoan light well
    arch-251  Mycenaean building
    arch-252  The megaron
    arch-253  Cyclopean masonry
    arch-254  The Treasury of Atreus
    arch-255  The Greek temple
    arch-256  The peripteral plan
    arch-257  The Doric order
    arch-258  The Ionic order
    arch-259  The Corinthian order
    arch-260  Entasis
    arch-261  The optical refinements of the Parthenon
    arch-262  The Parthenon as a building
    arch-263  The Erechtheion
    arch-264  The Temple of Apollo at Bassae
    arch-265  The Greek theatre
    arch-266  The stoa
    arch-267  The agora as built space
    arch-268  The bouleuterion
    arch-269  The Greek house
    arch-270  Olynthus
    arch-271  Hippodamian planning
    arch-272  Greek fortification
    arch-273  Polychromy on Greek buildings

### Rome — `arch-rome`

    arch-274  Roman building
    arch-275  Opus caementicium
    arch-276  Roman facing techniques
    arch-277  The Roman arch
    arch-278  The Roman vault
    arch-279  The Roman dome
    arch-280  The Pantheon as a structure
    arch-281  The oculus
    arch-282  Roman brick
    arch-283  The Colosseum as a structure
    arch-284  The Roman theatre
    arch-285  The basilica
    arch-286  The Roman bath
    arch-287  The Baths of Caracalla
    arch-288  The hypocaust
    arch-289  The aqueduct
    arch-290  Pont du Gard
    arch-291  The Roman road as engineering
    arch-292  The Roman bridge
    arch-293  The insula
    arch-294  The domus
    arch-295  The atrium
    arch-296  The Roman villa
    arch-297  Hadrian's Villa
    arch-298  The Roman forum as built space
    arch-299  The triumphal arch
    arch-300  The Roman camp plan
    arch-301  Roman town planning
    arch-302  Vitruvius
    arch-303  Firmitas, utilitas, venustas

### The early Americas — `arch-americas`

    arch-304  Building in Mesoamerica
    arch-305  The Mesoamerican pyramid
    arch-306  Teotihuacan
    arch-307  The talud-tablero
    arch-308  Maya architecture
    arch-309  The Maya corbel vault
    arch-310  Tikal
    arch-311  Chichen Itza
    arch-312  Andean building
    arch-313  Chavín de Huántar
    arch-314  Tiwanaku
    arch-315  Inca masonry

## Asia

### South Asia — `arch-india`

    arch-316  Building in South Asia
    arch-317  Indus Valley urban planning
    arch-318  Mohenjo-daro
    arch-319  The Great Bath
    arch-320  Indus brick standardisation
    arch-321  The stupa
    arch-322  Sanchi
    arch-323  The torana
    arch-324  Rock-cut architecture in India
    arch-325  Ajanta Caves
    arch-326  Ellora
    arch-327  The Kailasa Temple
    arch-328  The chaitya hall
    arch-329  The vihara
    arch-330  The Hindu temple plan
    arch-331  The shikhara
    arch-332  The vimana
    arch-333  Nagara and Dravida
    arch-334  Khajuraho
    arch-335  Brihadisvara Temple
    arch-336  Konark Sun Temple
    arch-337  The stepwell
    arch-338  Rani ki Vav
    arch-339  Indo-Islamic architecture
    arch-340  Qutb Minar
    arch-341  Fatehpur Sikri
    arch-342  Taj Mahal
    arch-343  The Sri Lankan stupa

### China — `arch-china`

    arch-344  Building in China
    arch-345  The Chinese timber frame
    arch-346  Dougong
    arch-347  The bay in Chinese building
    arch-348  Yingzao Fashi
    arch-349  The Chinese roof
    arch-350  The Chinese courtyard house
    arch-351  Siheyuan
    arch-352  The Chinese city plan
    arch-353  Chang'an
    arch-354  The Forbidden City
    arch-355  The Hall of Supreme Harmony
    arch-356  The Temple of Heaven
    arch-357  The Chinese pagoda
    arch-358  Songyue Pagoda
    arch-359  Foguang Temple
    arch-360  The Great Wall as construction
    arch-361  Chinese brick and tile
    arch-362  The Chinese garden
    arch-363  The gardens of Suzhou
    arch-364  The Chinese bridge
    arch-365  Anji Bridge
    arch-366  The tulou
    arch-367  The cave dwelling of the Loess Plateau
    arch-368  Chinese roof ornament
    arch-369  Feng shui and building
    arch-370  The Chinese imperial tomb
    arch-371  Chinese carpentry tools

### Japan and Korea — `arch-japan`

    arch-372  Building in Japan
    arch-373  Japanese carpentry
    arch-374  The Japanese joint
    arch-375  Ise Grand Shrine
    arch-376  Shikinen sengu
    arch-377  Shinden-zukuri
    arch-378  Shoin-zukuri
    arch-379  Sukiya-zukuri
    arch-380  The tatami module
    arch-381  Fusuma and shoji
    arch-382  The tokonoma
    arch-383  The Japanese tea house
    arch-384  Horyu-ji
    arch-385  The Japanese pagoda
    arch-386  The shinbashira
    arch-387  Byodo-in
    arch-388  The Japanese castle
    arch-389  Himeji Castle
    arch-390  Katsura Imperial Villa
    arch-391  The minka
    arch-392  Earthquake and Japanese building
    arch-393  Building in Korea
    arch-394  The hanok
    arch-395  Ondol
    arch-396  Bulguksa
    arch-397  Hwaseong Fortress

### Southeast Asia — `arch-seasia`

    arch-398  Building in Southeast Asia
    arch-399  The stilt house
    arch-400  The Toraja tongkonan
    arch-401  The Minangkabau rumah gadang
    arch-402  Borobudur
    arch-403  Prambanan
    arch-404  The candi
    arch-405  Angkor
    arch-406  Angkor Wat
    arch-407  The Khmer temple mountain
    arch-408  The Bayon
    arch-409  Khmer hydraulic engineering
    arch-410  Bagan
    arch-411  The Burmese stupa
    arch-412  Shwedagon Pagoda
    arch-413  Thai temple architecture
    arch-414  Wat Phra Kaew
    arch-415  The Vietnamese communal house
    arch-416  The bahay kubo
    arch-417  The shophouse

### Central Asia and the mountains — `arch-steppe`

    arch-418  Building in Central Asia
    arch-419  The caravanserai
    arch-420  The Registan
    arch-421  Samarkand
    arch-422  Gur-e-Amir
    arch-423  Bukhara
    arch-424  The Timurid dome
    arch-425  Tilework in Central Asia
    arch-426  The Seljuk mosque
    arch-427  The Anatolian caravanserai
    arch-428  The Armenian church
    arch-429  The Georgian church
    arch-430  The Tibetan monastery
    arch-431  The Potala Palace
    arch-432  The Mongolian ger
    arch-433  Building in the Himalaya
    arch-434  The Kashmiri wooden mosque
    arch-435  The Afghan mudbrick town

## The Islamic world and medieval Europe

### The Islamic world — `arch-islamic`

    arch-436  Islamic architecture
    arch-437  The mosque
    arch-438  The hypostyle mosque
    arch-439  The qibla wall
    arch-440  The mihrab
    arch-441  The minbar
    arch-442  The minaret
    arch-443  The sahn
    arch-444  The Dome of the Rock
    arch-445  The Great Mosque of Damascus
    arch-446  The Great Mosque of Kairouan
    arch-447  The Great Mosque of Córdoba
    arch-448  The horseshoe arch
    arch-449  The muqarnas
    arch-450  The Alhambra
    arch-451  The Court of the Lions
    arch-452  Islamic geometric ornament
    arch-453  The arabesque
    arch-454  Calligraphy in architecture
    arch-455  The Islamic garden
    arch-456  The chahar bagh
    arch-457  The iwan
    arch-458  The four-iwan plan
    arch-459  The madrasa
    arch-460  The Persian mosque
    arch-461  Naqsh-e Jahan
    arch-462  The Ottoman mosque
    arch-463  Mimar Sinan
    arch-464  Selimiye Mosque
    arch-465  The hammam
    arch-466  The souk and the covered market
    arch-467  The Cairene courtyard house
    arch-468  The mashrabiya
    arch-469  Building in Islamic West Africa

### Byzantium and the Orthodox world — `arch-byz`

    arch-470  Byzantine architecture
    arch-471  The early Christian basilica
    arch-472  Old St Peter's
    arch-473  The baptistery
    arch-474  The buildings of Ravenna
    arch-475  San Vitale
    arch-476  Hagia Sophia as a structure
    arch-477  Anthemius and Isidore
    arch-478  The Byzantine pendentive dome
    arch-479  The cross-in-square church
    arch-480  The narthex
    arch-481  The iconostasis as architecture
    arch-482  Byzantine brickwork
    arch-483  Mosaic and the Byzantine wall
    arch-484  Hosios Loukas
    arch-485  The Armenian and Georgian cross-dome
    arch-486  The Serbian monastery
    arch-487  The Russian church
    arch-488  Saint Sophia in Kyiv
    arch-489  The Russian onion dome
    arch-490  Saint Basil's Cathedral
    arch-491  The Russian wooden church
    arch-492  Kizhi Pogost
    arch-493  The Orthodox monastery plan

### Romanesque — `arch-romanesque`

    arch-494  Romanesque architecture
    arch-495  The Carolingian renaissance in building
    arch-496  The Palatine Chapel at Aachen
    arch-497  The westwork
    arch-498  The plan of Saint Gall
    arch-499  The Cluniac church
    arch-500  Cluny III
    arch-501  The pilgrimage church
    arch-502  Santiago de Compostela
    arch-503  The ambulatory and radiating chapels
    arch-504  Durham Cathedral
    arch-505  The Norman church in England
    arch-506  The Romanesque tympanum
    arch-507  The cloister
    arch-508  The chapter house
    arch-509  The crypt
    arch-510  The Italian Romanesque
    arch-511  Pisa Cathedral and its tower
    arch-512  The Lombard band
    arch-513  The German Romanesque
    arch-514  Speyer Cathedral
    arch-515  The castle keep
    arch-516  The motte-and-bailey
    arch-517  The concentric castle

### Gothic — `arch-gothic`

    arch-518  Gothic architecture
    arch-519  Suger and Saint-Denis
    arch-520  The pointed arch
    arch-521  The rib vault in Gothic building
    arch-522  The flying buttress
    arch-523  The bay system
    arch-524  The Gothic elevation
    arch-525  The triforium
    arch-526  The clerestory
    arch-527  The rose window
    arch-528  Stained glass
    arch-529  Tracery
    arch-530  The pinnacle
    arch-531  The gargoyle
    arch-532  Notre-Dame de Paris
    arch-533  Chartres Cathedral
    arch-534  Amiens Cathedral
    arch-535  Beauvais and the limits of height
    arch-536  Reims Cathedral
    arch-537  Sainte-Chapelle
    arch-538  English Gothic
    arch-539  Salisbury Cathedral
    arch-540  The fan vault
    arch-541  King's College Chapel
    arch-542  Perpendicular Gothic
    arch-543  The German hall church
    arch-544  Cologne Cathedral
    arch-545  Italian Gothic
    arch-546  Milan Cathedral
    arch-547  The Doge's Palace
    arch-548  Brick Gothic
    arch-549  The medieval mason
    arch-550  The medieval building site

## Renaissance to Enlightenment

### The Renaissance — `arch-renaissance`

    arch-551  Renaissance architecture
    arch-552  Brunelleschi
    arch-553  The dome of Florence Cathedral
    arch-554  The Ospedale degli Innocenti
    arch-555  Linear perspective and architecture
    arch-556  Alberti
    arch-557  De re aedificatoria
    arch-558  The facade of Santa Maria Novella
    arch-559  The Renaissance palazzo
    arch-560  Palazzo Rucellai
    arch-561  The rusticated base
    arch-562  Bramante
    arch-563  The Tempietto
    arch-564  New St Peter's
    arch-565  Michelangelo as architect
    arch-566  The dome of St Peter's
    arch-567  The Laurentian Library
    arch-568  The Campidoglio
    arch-569  Palladio
    arch-570  I quattro libri dell'architettura
    arch-571  The Palladian villa
    arch-572  Villa Rotonda
    arch-573  The Palladian window
    arch-574  Sansovino and Venice
    arch-575  The Renaissance in France
    arch-576  The château of the Loire
    arch-577  Chambord
    arch-578  The Renaissance in Spain
    arch-579  El Escorial
    arch-580  The Renaissance in Central Europe

### Baroque and Rococo — `arch-baroque`

    arch-581  Baroque architecture
    arch-582  The Counter-Reformation church
    arch-583  Il Gesù
    arch-584  Bernini
    arch-585  St Peter's Square
    arch-586  Borromini
    arch-587  San Carlo alle Quattro Fontane
    arch-588  Sant'Ivo alla Sapienza
    arch-589  The oval plan
    arch-590  Guarini
    arch-591  The Baroque dome
    arch-592  Baroque illusionism
    arch-593  The Baroque staircase
    arch-594  Versailles
    arch-595  The Hall of Mirrors
    arch-596  The French formal garden
    arch-597  Le Vau and Hardouin-Mansart
    arch-598  The hôtel particulier
    arch-599  The Austrian Baroque
    arch-600  Fischer von Erlach
    arch-601  Karlskirche
    arch-602  The Bavarian Rococo church
    arch-603  Wieskirche
    arch-604  The Baroque in Spain and Portugal
    arch-605  The Latin American Baroque
    arch-606  English Baroque
    arch-607  Wren and St Paul's Cathedral
    arch-608  The Baroque city

### Neoclassicism and the Enlightenment — `arch-neoclass`

    arch-609  Neoclassical architecture
    arch-610  The rediscovery of Greece
    arch-611  Stuart and Revett
    arch-612  Winckelmann
    arch-613  Piranesi
    arch-614  The Grand Tour and architecture
    arch-615  Palladianism in Britain
    arch-616  Chiswick House
    arch-617  The country house
    arch-618  Robert Adam
    arch-619  Neoclassicism in France
    arch-620  Soufflot and the Panthéon
    arch-621  Ledoux
    arch-622  Boullée
    arch-623  Architecture parlante
    arch-624  Durand and the teaching of plan
    arch-625  The École des Beaux-Arts
    arch-626  Neoclassicism in Germany
    arch-627  Schinkel
    arch-628  Neoclassicism in Russia
    arch-629  The building of Saint Petersburg
    arch-630  The American Federal style
    arch-631  Jefferson as architect
    arch-632  Monticello
    arch-633  The United States Capitol
    arch-634  The Greek Revival
    arch-635  The Egyptian Revival

### Empire and the colonial building — `arch-colonial`

    arch-636  Colonial architecture
    arch-637  The Spanish colonial church
    arch-638  The mission
    arch-639  The Portuguese colonial town
    arch-640  The Dutch colonial house
    arch-641  The French colonial building
    arch-642  Colonial building in British India
    arch-643  The bungalow
    arch-644  The hill station
    arch-645  New Delhi
    arch-646  Lutyens and Baker
    arch-647  The colonial city plan
    arch-648  The plantation house
    arch-649  Slavery and building in the Americas
    arch-650  The shotgun house
    arch-651  Colonial building in Africa
    arch-652  The trading fort
    arch-653  Elmina Castle
    arch-654  The Ottoman provincial town
    arch-655  Building in the Russian empire's east
    arch-656  The settler house
    arch-657  The log cabin
    arch-658  Building in Australia and New Zealand
    arch-659  Indigenous building and colonial erasure
    arch-660  The colonial style after empire

## The industrial century

### Iron, glass and the engineer — `arch-iron`

    arch-661  Iron in architecture
    arch-662  The Iron Bridge
    arch-663  The fireproof mill
    arch-664  The cast-iron frame
    arch-665  The glasshouse
    arch-666  The Palm House at Kew
    arch-667  The Crystal Palace
    arch-668  Paxton
    arch-669  The exhibition building
    arch-670  The railway station
    arch-671  St Pancras station
    arch-672  The train shed
    arch-673  Les Halles
    arch-674  The iron market hall
    arch-675  The suspension bridge
    arch-676  Brooklyn Bridge
    arch-677  The Forth Bridge
    arch-678  The Eiffel Tower
    arch-679  Gustave Eiffel
    arch-680  The Galerie des Machines
    arch-681  The arcade
    arch-682  The department store
    arch-683  The engineer and the architect
    arch-684  The lift
    arch-685  The safety lift
    arch-686  Building services
    arch-687  Gas and electric light in buildings
    arch-688  The world's fair and architecture

### The industrial city — `arch-city19`

    arch-689  The industrial city
    arch-690  The factory
    arch-691  The mill town
    arch-692  The back-to-back house
    arch-693  The tenement
    arch-694  Overcrowding and the slum
    arch-695  Public health and building
    arch-696  The sewer
    arch-697  Bazalgette and London's sewers
    arch-698  The model dwelling
    arch-699  The philanthropic housing trust
    arch-700  The company town
    arch-701  Saltaire
    arch-702  Bournville
    arch-703  The building by-law
    arch-704  The bye-law terrace
    arch-705  Haussmann's Paris
    arch-706  The boulevard
    arch-707  The Ringstrasse
    arch-708  The Barcelona Eixample
    arch-709  Cerdà
    arch-710  The park movement
    arch-711  Central Park
    arch-712  The cemetery as designed landscape
    arch-713  The public library
    arch-714  The museum building
    arch-715  The hospital plan
    arch-716  The prison and the panopticon

### The revivals and the battle of the styles — `arch-revival`

    arch-717  The battle of the styles
    arch-718  The Gothic Revival
    arch-719  Pugin
    arch-720  Contrasts
    arch-721  The Palace of Westminster
    arch-722  Ruskin
    arch-723  The Seven Lamps of Architecture
    arch-724  The Stones of Venice
    arch-725  The Victorian church
    arch-726  Butterfield
    arch-727  Polychromy in Victorian building
    arch-728  Viollet-le-Duc
    arch-729  Restoration and its critics
    arch-730  The Society for the Protection of Ancient Buildings
    arch-731  William Morris
    arch-732  The Arts and Crafts movement
    arch-733  The Red House
    arch-734  Philip Webb
    arch-735  Voysey
    arch-736  The garden suburb
    arch-737  The Queen Anne style
    arch-738  The Romanesque Revival in America
    arch-739  Richardson
    arch-740  The Beaux-Arts in America
    arch-741  The City Beautiful movement
    arch-742  The World's Columbian Exposition
    arch-743  Historicism and its exhaustion

### The tall building — `arch-chicago`

    arch-744  The skyscraper
    arch-745  The Chicago School
    arch-746  The Home Insurance Building
    arch-747  The steel skeleton frame
    arch-748  The curtain wall
    arch-749  Fireproofing the tall building
    arch-750  The Chicago window
    arch-751  Sullivan
    arch-752  Form follows function
    arch-753  The Wainwright Building
    arch-754  The Carson Pirie Scott store
    arch-755  Burnham and Root
    arch-756  The Monadnock Building
    arch-757  The foundation problem in Chicago
    arch-758  The New York skyscraper
    arch-759  The Flatiron Building
    arch-760  The Woolworth Building
    arch-761  The 1916 zoning resolution
    arch-762  The setback skyscraper
    arch-763  The Chrysler Building
    arch-764  The Empire State Building
    arch-765  Rockefeller Center
    arch-766  The skyscraper race
    arch-767  Land value and building height
    arch-768  The lift core
    arch-769  The tall building outside America
    arch-770  What the skyscraper did to the city

## The modern movement

### Before the modern movement — `arch-early20`

    arch-771  Art Nouveau
    arch-772  Horta
    arch-773  Guimard and the Paris Métro
    arch-774  Gaudí
    arch-775  Sagrada Família
    arch-776  Casa Milà
    arch-777  The catenary arch in Gaudí
    arch-778  The Vienna Secession
    arch-779  Otto Wagner
    arch-780  Adolf Loos
    arch-781  Ornament and Crime
    arch-782  The Raumplan
    arch-783  Mackintosh
    arch-784  The Glasgow School of Art
    arch-785  The Deutscher Werkbund
    arch-786  Peter Behrens
    arch-787  The AEG Turbine Factory
    arch-788  The Fagus Factory
    arch-789  Berlage
    arch-790  Expressionism in architecture
    arch-791  The Einstein Tower
    arch-792  Futurism and Sant'Elia
    arch-793  Frank Lloyd Wright's early work
    arch-794  The Prairie house

### The modern movement — `arch-modern`

    arch-795  Modern architecture
    arch-796  The Bauhaus
    arch-797  Gropius
    arch-798  The Dessau Bauhaus building
    arch-799  Bauhaus teaching
    arch-800  De Stijl
    arch-801  The Rietveld Schröder House
    arch-802  Russian Constructivism
    arch-803  Tatlin's Tower
    arch-804  Melnikov
    arch-805  Le Corbusier
    arch-806  Vers une architecture
    arch-807  The five points of a new architecture
    arch-808  Villa Savoye
    arch-809  The Dom-Ino house
    arch-810  The Modulor
    arch-811  Mies van der Rohe
    arch-812  The Barcelona Pavilion
    arch-813  The Tugendhat House
    arch-814  Less is more
    arch-815  The Weissenhof Estate
    arch-816  CIAM
    arch-817  The Athens Charter
    arch-818  The functional city
    arch-819  Fallingwater
    arch-820  The Johnson Wax Building
    arch-821  Usonian houses
    arch-822  Alvar Aalto
    arch-823  Paimio Sanatorium
    arch-824  The flat roof and its problems

### Mass housing — `arch-housing`

    arch-825  Mass housing
    arch-826  The housing question
    arch-827  Red Vienna
    arch-828  Karl-Marx-Hof
    arch-829  The Weimar Siedlung
    arch-830  The Frankfurt Kitchen
    arch-831  Existenzminimum
    arch-832  The British council estate
    arch-833  The garden city
    arch-834  Ebenezer Howard
    arch-835  Letchworth
    arch-836  The new town
    arch-837  The Soviet mikrorayon
    arch-838  The khrushchyovka
    arch-839  Prefabrication in housing
    arch-840  The large panel system
    arch-841  The tower block
    arch-842  Pruitt-Igoe
    arch-843  Ronan Point
    arch-844  The failure of the tower block
    arch-845  The self-built settlement
    arch-846  Sites and services

### The International Style and after — `arch-intl`

    arch-847  The International Style
    arch-848  Hitchcock and Johnson
    arch-849  The 1932 MoMA exhibition
    arch-850  Modernism and emigration
    arch-851  The glass office tower
    arch-852  The Seagram Building
    arch-853  Lever House
    arch-854  The United Nations Secretariat
    arch-855  Corporate modernism
    arch-856  Skidmore, Owings and Merrill
    arch-857  The open-plan office
    arch-858  Air conditioning and the deep plan
    arch-859  The curtain wall in the twentieth century
    arch-860  Mies in Chicago
    arch-861  Farnsworth House
    arch-862  The Case Study Houses
    arch-863  Eames House
    arch-864  Post-war school building
    arch-865  The system-built school
    arch-866  The airport terminal
    arch-867  TWA Flight Center
    arch-868  Eero Saarinen

### Other modernisms — `arch-region`

    arch-869  Modernism outside Europe and America
    arch-870  Brazilian modernism
    arch-871  Niemeyer
    arch-872  Brasília
    arch-873  Costa's plan
    arch-874  Mexican modernism
    arch-875  Barragán
    arch-876  Indian modernism
    arch-877  Chandigarh
    arch-878  Doshi
    arch-879  Japanese post-war modernism
    arch-880  Tange
    arch-881  Metabolism
    arch-882  The Nakagin Capsule Tower
    arch-883  African modernism
    arch-884  Tropical modernism
    arch-885  Regionalism in modern architecture

## Now

### Brutalism, postmodernism and after — `arch-late20`

    arch-886  Brutalism
    arch-887  Béton brut
    arch-888  The Unité d'Habitation
    arch-889  The Capitol Complex at Chandigarh
    arch-890  The Barbican
    arch-891  The Smithsons
    arch-892  New Brutalism
    arch-893  Louis Kahn
    arch-894  The Salk Institute
    arch-895  Served and servant spaces
    arch-896  Postmodern architecture
    arch-897  Complexity and Contradiction in Architecture
    arch-898  Venturi and Scott Brown
    arch-899  Learning from Las Vegas
    arch-900  The decorated shed
    arch-901  Less is a bore
    arch-902  The Portland Building
    arch-903  The Piazza d'Italia
    arch-904  Charles Jencks
    arch-905  Deconstructivism
    arch-906  The 1988 MoMA exhibition
    arch-907  Frank Gehry

### High-tech and the engineered envelope — `arch-hightech`

    arch-908  High-tech architecture
    arch-909  The Centre Pompidou
    arch-910  Rogers and Piano
    arch-911  The Lloyd's building
    arch-912  Norman Foster
    arch-913  The Hongkong and Shanghai Bank
    arch-914  The Sainsbury Centre
    arch-915  Structural expression
    arch-916  The tensile roof
    arch-917  Frei Otto
    arch-918  The Munich Olympic Stadium
    arch-919  The space frame
    arch-920  Buckminster Fuller
    arch-921  The geodesic dome
    arch-922  The cable-stayed structure
    arch-923  Structural glass
    arch-924  The double-skin facade
    arch-925  Ove Arup
    arch-926  The engineer in modern practice
    arch-927  Computational design

### Building and the climate — `arch-green`

    arch-928  Architecture and climate change
    arch-929  Embodied carbon
    arch-930  Operational carbon
    arch-931  Concrete and carbon
    arch-932  Cement alternatives
    arch-933  Mass timber
    arch-934  Cross-laminated timber
    arch-935  The passive house
    arch-936  Insulation and retrofit
    arch-937  The energy performance of buildings
    arch-938  The building envelope
    arch-939  Natural ventilation in modern buildings
    arch-940  The green roof
    arch-941  Solar design
    arch-942  Daylight and energy
    arch-943  Water in the sustainable building
    arch-944  The circular economy in construction
    arch-945  Adaptive reuse
    arch-946  Demolition and its cost
    arch-947  Construction waste
    arch-948  Green building certification
    arch-949  Greenwashing in architecture
    arch-950  Building for heat
    arch-951  Building for flood
    arch-952  Earthquake-resistant design

### Conservation, repair and loss — `arch-conserve`

    arch-953  Architectural conservation
    arch-954  The Venice Charter
    arch-955  Authenticity in conservation
    arch-956  Reconstruction after destruction
    arch-957  The rebuilding of Warsaw
    arch-958  The Frauenkirche in Dresden
    arch-959  Notre-Dame after the fire
    arch-960  Anastylosis
    arch-961  The ruin
    arch-962  Preventive maintenance
    arch-963  The listed building
    arch-964  World Heritage and architecture
    arch-965  The conservation area
    arch-966  Facadism
    arch-967  The loss of the Victorian city
    arch-968  Pennsylvania Station
    arch-969  The preservation movement in America
    arch-970  Jane Jacobs
    arch-971  The Death and Life of Great American Cities
    arch-972  Urban renewal and its victims
    arch-973  Deliberate destruction of heritage
    arch-974  Palmyra
    arch-975  The Bamiyan Buddhas
    arch-976  Digital recording of buildings

### The profession and its questions — `arch-profession`

    arch-977  The architect
    arch-978  The rise of the profession
    arch-979  Architectural education
    arch-980  The architectural competition
    arch-981  The client
    arch-982  The brief
    arch-983  Procurement
    arch-984  The contractor
    arch-985  Construction labour
    arch-986  Safety on the building site
    arch-987  Migrant labour and construction
    arch-988  Who is credited for a building
    arch-989  Women in architecture
    arch-990  Denise Scott Brown and the Pritzker
    arch-991  Zaha Hadid
    arch-992  The Pritzker Prize
    arch-993  The starchitect
    arch-994  Architecture and photography
    arch-995  The architectural rendering
    arch-996  Building information modelling
    arch-997  Housing affordability and design
    arch-998  Accessibility and universal design
    arch-999  Participation in design
    arch-1000  What architecture is for

