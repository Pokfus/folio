# Astronomy — a 1000-card running order

The plan for `astro`, a new collection: every card's number, topic and deck, fixed in advance so the
collection can be grown one card at a time over many sessions without anyone having to remember what
was intended.

It is the twenty-first of these and the sixth that is not a history collection. Read
`docs/greece-card-plan.md` first if this is the first plan you have met; the mechanics are identical and
are not repeated here.

---

## How to use this (the whole point of the file)

**The next card to write is the lowest `astro-NNN` not yet in `data.js`.**

    node -e "global.window={};require('./data.js');const h=new Set(window.CARD_DATA.map(c=>c.id));for(let i=1;i<=1000;i++){const id='astro-'+String(i).padStart(3,'0');if(!h.has(id)){console.log(id);break}}"

Look the number up below, research it, write it, and add it with the deck id this file gives:

    node .claude/add-card.js <card.json> <deckId>

**Always pass the deck id.** Without one `add-card.js` falls back to the first leaf in the whole tree,
which is in China.

There is deliberately **no progress file**. `data.js` says what exists and this file says what is
planned; the next card is whatever falls between them, so the two can never come to disagree about
where the work had got to.

The padding above is right for every id but the last: the ids are `astro-001` … `astro-999`, then
`astro-1000`.

## What a line in this list is, and is not

A line is a **subject to research**, not a fact to assert and not necessarily the finished answer term.
`astro-474 Pulsars` is already an answer term; `astro-689 The Hubble tension` is an open disagreement to
describe, and the card's actual answer — the word that gets blanked — is chosen while writing it, from
what the sources will support.

Where the research says the line is wrong, **change the line here in the same commit as the card**, and
say so. The one thing that must not happen is a card written to fill a slot. The house rule stands:
never invent a date, a name or a definition. If a topic cannot be sourced, replace the line.

## Is there a thousand cards in this?

Yes, and unusually comfortably — the risk in this collection is the opposite one. **Astronomy is four
subjects wearing one name**, and a plan that does not say which of them it is covering will drift into
whichever has the most popular writing behind it.

The four are: **the sky as it is seen** (positional astronomy, which is what the word meant for four
thousand years); **the Solar System** (planetary science, now largely a geology and an atmospheric
science); **astrophysics** (what stars and galaxies are made of and how they work, which is physics done
at a distance); and **cosmology** (the universe as one object with a history). They ask different
questions, they are checked in different ways, and a reader who has met only the third of them thinks
astronomy is a set of pictures.

**The collection gives each of them a share and says so in the allocation.** What it deliberately does
NOT do is spend its length on a bestiary of objects. There are about **sixty cards whose subject is one
named body** — Jupiter, Titan, the Crab Nebula, Omega Centauri, Andromeda — out of a thousand, and every
one of them is there because it teaches something the general card does not. **A named object earns its
slot the way a genus does in the Dinosaurs plan**: by what it settled, what it overturned, or what it is
the clearest example of. *Betelgeuse is a red supergiant about 550 light-years away* is a caption.

**Where the padding risk actually is**, so it can be watched: the planet and moon subdecks in deck 2,
and the "kinds of X" subdecks in decks 3 and 6. Those are the places where a list is easiest to write
and hardest to justify.

## Making the collection

**The collection does not exist yet and this plan creates it** — the node, its tree, its `COLL_THEME`
hue and its `COLLECTION_ICON` row all ship with the file.

**The id is `astro` and the card prefix is `astro-`**, free of every existing prefix and no prefix of any
of them (the near neighbour is Visual Art's `art-`, and neither string starts with the other). The deck
ids are also `astro-…`, which is the pattern `bio` and `dino` use.

**It goes in the `Science` section**, which now holds four collections — Psychology, Biology, Dinosaurs
and this — so `COLLECTION_SECTIONS` is unchanged and `COLLECTION_SECTION` gains one row. The section
draws already, Psychology and Biology having shipped cards.

### The hue: `#5E3262`, a deep violet — and the obvious colour was measured and refused

**The obvious colour for an astronomy collection is a midnight blue, and it cannot be had.** Swept in
CIELAB against all twenty-seven hues on the shelf (the twenty curated collections and the seven language
decks), the whole night-sky region is occupied: the best candidate at hue 298 stands **12.6** from the
United States' navy, one at hue 288 stands **4.2** from it, and the shelf's **tightest existing pair is
12.9** (China's vermilion against Russia's lacquer). A midnight blue would therefore ship at or below
the worst separation the shelf has ever accepted, which is a floor rather than a target. The blue
quarter also already carries Greece's Aegean, Geography–China's blue, the French deck's blue and
Politics: East Asia's periwinkle. **Do not re-run that sweep; it does not come out differently.**

What is taken instead is the **dark end of the violet band**, which is the twilight rather than the
night and is the one region near the shelf's optimum that an astronomy collection can honestly claim.
`#5E3262` stands **21.0 from Psychology's plum, 21.3 from Rome's imperial purple and 21.5 from Japan's
kuwazome** — very nearly equidistant from all three, against a **median nearest-neighbour distance of
20.1** across the present shelf. L 28, chroma 35, **10.0:1 against white**, inside the shelf's own
3.7–10.4 range and equal to Biology's, which is the darkest thing on it.

**It is a FOURTH purple, and that needs the argument Biology's fifth green needed.** The other three sit
at L 38 (Rome), L 45 (Psychology) and L 53 (Politics: East Asia); this one is at **L 28**, far darker
than any of them, which is why the measurement puts it a clear 21 from each rather than inside the
family. Chroma 35 is below the shelf's median of 44, so it stays inside the muted register.

**The standing note in `COLL_THEME` holds and is not re-tested here.** The magenta around `#c057b1` is
the whole wheel's best-scoring region and has now been measured and rejected five times; the olive-brass
beside it has been rejected as a fourth or fifth member of the yellow-green-brown quarter. Neither was
re-measured for this collection and neither should be for the next.

**AND IT WAS LOOKED AT**, which the last four hues on this shelf were not: rendered as a banner and as
its 20% wash beside Psychology's plum, Rome's purple, Japan's kuwazome and the United States' navy, it
is plainly a different colour from all four and reads as aubergine rather than as a fifth member of the
purple family. The wash is pale enough to carry quiet text. If it ever needs moving, go darker and less
red, not brighter.

### The icon: a new symbol, `ringed`

**A ringed planet**, which is the one mark that says *astronomy* and nothing else at the 24–28px a deck
row draws it at. It ships as a new `ICON_SYMBOLS` entry so a reader can also choose it for a deck of
their own.

**The collision to avoid is `atom`, not `star`.** The shelf already carries `sun`, `moon`, `star` and
`atom`; the first three are each one shape and are not what this is, but `atom` is a small disc crossed
by an ellipse, which is the same construction. What separates them is proportion: `atom`'s nucleus is
r 1.9 inside three ellipses of rx 9, and this is a disc of r 5 inside **one** ring of rx 10.5. A single
ring around a large disc is Saturn; three rings around a dot is an atom. **If it is ever redrawn, keep
the disc large and the ring single**, and do not add a second ring.

**`star` was considered and refused for a different reason.** It is not wrong for astronomy, but the
United States collection already wears it, and two collections sharing a mark on one shelf is the thing
the icons exist to prevent — Visual Art's reuse of `brush` is a stated cost rather than a precedent.

**IT WAS LOOKED AT, at 24, 28 and 40px, on dark ground and on light, beside `atom` and `star`.** The
failure mode this had to clear is the ring reading as a strike-through at small sizes, and it does not:
the −18° tilt and the ring's overhang on both sides (x 1.96–22.04 against the disc's 7–17) read as a
ring at every size, and nothing about it suggests the atom. At 24px the disc is still plainly a disc.

## What this collection is about, and the six scope decisions

**It is astronomy as a science: what is out there, how it works, and how any of it is known.** Deck 8,
*Observing the Universe*, is 130 cards on light, gravity, telescopes, wavebands, missions and the
non-light messengers, because in this subject the method is not a preliminary — **nothing in the other
eight decks was ever touched**, and a reader who does not know what can be inferred from a spectrum has
learned a set of assertions.

**First: astronomy is the science of things nobody can experiment on, and the collection says so
repeatedly rather than once.** There is no control group for a galaxy. Every claim is an inference from
radiation that arrived, and the inference chain is usually long: a brightness becomes a luminosity only
through a distance, and a distance is itself a chain. `astro-299` the distance ladder, `astro-318`
errors and uncertainty, `astro-319` selection effects and `astro-320` Malmquist bias are the spine of
this, and **every card that quotes a distance, a mass or an age inherits it**. Where a figure rests on
one rung of the ladder, say which rung.

**Second: the open disagreements are carded as disagreements, with both sides and the evidence.** This
subject has several live ones and popular writing settles them prematurely in both directions.
`astro-689` the Hubble tension, `astro-747` modified gravity as an alternative to dark matter,
`astro-755` the cosmological constant problem, `astro-785` the lithium problem, `astro-786` tensions in
the concordance model and `astro-643` where supermassive black holes came from are the deliberate ones.
**A card may say the question is open. It may not pick a winner the literature has not picked.**

**Third: dark matter and dark energy are carded as *names for measurements*, not as substances.** This
is where astronomy is most often written badly. What is actually established is a set of observations —
rotation curves, lensing, the microwave background's acoustic peaks, the supernova magnitude–redshift
relation — and "dark matter" is the label for whatever accounts for the first three. `astro-750` is
titled *Why dark matter is still called dark* for exactly this reason, and `astro-731` and `astro-751`
must open by saying what is measured before saying what it might be.

**Fourth: the pictures are carded, because the pictures are how most readers meet this subject and
almost all of them are false colour.** `astro-881` to `astro-885` are five cards on what an astronomical
image is, ending at *Why nothing in space looks like the pictures*. This is not debunking: the images
are honest scientific products and the processing is documented. What a reader needs is the difference
between a filter map and a photograph, and nothing else in the collection can supply it.

**Fifth: astrology is dealt with once, early, and never again.** `astro-015` is *Astronomy and
astrology*, in the opening subdeck, and it is a card about the historical relationship and the
distinction, not a refutation. Having it there means no later card has to hedge around it, and the
zodiac can then be carded straightforwardly at `astro-034` and `astro-065` as what it is: a band of the
ecliptic and a set of constellations.

**Sixth: the history of astronomy is a deck rather than a thread, and the science decks do not carry
it.** Deck 9 is 80 cards, and the reason it is separate is the rule under "no researchers" below: a card
about the Sun's corona should be answerable from the corona, not from who observed it first. The history
deck is where the people go.

## Allocation

| Deck | Subdeck | Cards | Range |
|---|---|---|---|
| Looking Up | What astronomy is | 15 | astro-001–015 |
|  | The celestial sphere | 20 | astro-016–035 |
|  | The moving sky | 20 | astro-036–055 |
|  | Constellations and star names | 20 | astro-056–075 |
|  | Eclipses, tides and calendars | 15 | astro-076–090 |
| The Solar System | How the Solar System formed | 20 | astro-091–110 |
|  | The rocky planets | 30 | astro-111–140 |
|  | The giant planets | 25 | astro-141–165 |
|  | Moons | 25 | astro-166–190 |
|  | Asteroids, comets and meteorites | 30 | astro-191–220 |
|  | The outer Solar System | 20 | astro-221–240 |
| The Sun and the Stars | The Sun | 30 | astro-241–270 |
|  | What a star is | 25 | astro-271–295 |
|  | Measuring the stars | 25 | astro-296–320 |
|  | The H–R diagram | 20 | astro-321–340 |
|  | Binaries, clusters and variables | 30 | astro-341–370 |
| Lives and Deaths of Stars | Star formation | 25 | astro-371–395 |
|  | The interstellar medium | 20 | astro-396–415 |
|  | Nuclear burning and the elements | 25 | astro-416–440 |
|  | Old age and mass loss | 20 | astro-441–460 |
|  | Supernovae and remnants | 30 | astro-461–490 |
| Planets Beyond the Sun | Finding exoplanets | 25 | astro-491–515 |
|  | What exoplanets are like | 25 | astro-516–540 |
|  | Habitability | 15 | astro-541–555 |
|  | Life in the universe | 15 | astro-556–570 |
| Galaxies | The Milky Way | 30 | astro-571–600 |
|  | Kinds of galaxy | 25 | astro-601–625 |
|  | Active galaxies and black holes | 20 | astro-626–645 |
|  | Clusters and large-scale structure | 20 | astro-646–665 |
|  | How galaxies change | 15 | astro-666–680 |
| Cosmology | The expanding universe | 25 | astro-681–705 |
|  | The hot Big Bang | 25 | astro-706–730 |
|  | Dark matter | 20 | astro-731–750 |
|  | Dark energy and the fate of everything | 20 | astro-751–770 |
|  | What cosmology does not know | 20 | astro-771–790 |
| Observing the Universe | What light carries | 25 | astro-791–815 |
|  | Gravity and orbits | 25 | astro-816–840 |
|  | Telescopes | 25 | astro-841–865 |
|  | Across the spectrum | 20 | astro-866–885 |
|  | Observatories and space missions | 20 | astro-886–905 |
|  | Beyond light | 15 | astro-906–920 |
| The History of Astronomy | Ancient and medieval astronomy | 25 | astro-921–945 |
|  | The Copernican revolution | 20 | astro-946–965 |
|  | The making of modern astrophysics | 20 | astro-966–985 |
|  | Astronomy now | 15 | astro-986–1000 |

Deck totals: Looking Up 90 · The Solar System 150 · The Sun and the Stars 130 · Lives and Deaths of Stars 120 · Planets Beyond the Sun 80 · Galaxies 110 · Cosmology 110 · Observing the Universe 130 · The History of Astronomy 80. **1000.**

## What the weighting is arguing

**The Solar System takes 150, the largest deck, and is not the largest subject.** It is the largest deck
because it is the only part of astronomy where there is *ground truth* — spacecraft have been to these
places, samples have been returned, and a claim can be checked against a photograph taken from orbit. A
reader who works through deck 2 has met the one region of the sky where astronomy stops being inference
at a distance, which is the best possible preparation for the seven decks where it does not.

**Stars take 250 across two decks, which is a quarter of the collection.** That is the honest weight:
nearly everything in astronomy is either a star, made by stars, or measured against stars. Splitting it
in two puts the *census* (what stars are, how they are measured, how they are classified) in deck 3 and
the *narrative* (birth, burning, death, remnants) in deck 4, which are two different kinds of knowledge
and are usually run together to the reader's cost.

**Cosmology takes 110 and 20 of those are what it does not know.** It is the part of the subject with
the widest gap between public confidence and professional caution, and a deck that ended at the
concordance model would have taught the confidence. The last subdeck is not a disclaimer; the horizon
problem, the initial singularity and the anthropic argument are real content with real literature.

**Exoplanets take 80, which is fewer than the subject's current profile suggests.** The field is
thirty years old and moving fast, so a larger allocation would mostly be occupied by individual systems
that will be superseded. What is carded instead is the *methods* and what they can and cannot see
(25 cards) and the *classes* of object the census has actually established (25), which is the durable
half. **Expect this deck to need revising more often than any other in the collection.**

**Observing takes 130, the second-largest deck, on the argument the scope section makes.** Fifty of it
is physics — light and gravity — placed here rather than in a deck of its own because in astronomy they
are instruments: the Doppler shift is how a velocity is measured and Kepler's third law is how a mass
is weighed. A reader meets them as tools, with the thing they are used on already in hand.

**History takes 80 and the ancient and medieval subdeck takes 25 of it.** Pre-telescopic astronomy is
carded at that length because it is the longest and least-known part of the story and because it is not
European: Babylonian tables, Chinese records, Indian and Islamic astronomy and Mesoamerican reckoning
each have their own cards. The Copernican revolution gets 20 rather than 40 for the same reason.

**Looking Up takes 90 and comes first, which is a decision about the reader rather than the subject.**
Every other ordering starts at the Big Bang or at the Sun. This one starts with what is overhead,
because that is the only part of astronomy a reader can check for themselves, and because the celestial
sphere and the sky's motions are assumed by every later deck and explained by none of them.

## Six decisions this plan forced on the tree

**The Sun is in the stars deck, not the Solar System deck.** It is a star, it is the only one that can
be resolved, and almost everything known about stellar interiors is calibrated on it — so it opens deck
3 rather than closing deck 2. The cost is that the Solar System deck begins with the disc rather than
with the object at the middle of it, and `astro-091` and `astro-092` are written to carry that.

**Black holes are carded in three places and that is deliberate.** `astro-482` to `astro-486` are
stellar-mass black holes as the end of a massive star; `astro-626` to `astro-645` are supermassive black
holes as engines of galaxies; `astro-834` to `astro-838` are the relativity that describes them. Those
are three questions, not one topic repeated, and each names the others.

**Gravitational waves and neutrinos are in the observing deck, not with the objects they come from.**
They are *messengers* — a second and third way of being told about the same events — and the point of
`astro-906` to `astro-920` is exactly that: the same merger seen two ways at once (`astro-916`) is worth
more than either seen alone. The objects themselves are carded in deck 4.

**There is no "famous objects" deck**, for the reason the Dinosaurs plan gives for having no famous
dinosaurs deck. The Crab Nebula sits with supernova remnants, Andromeda with kinds of galaxy, Titan with
moons — each where it can be seen against its relatives.

**Astrobiology is inside the exoplanet deck rather than beside it.** Fifteen cards, ending at the Fermi
paradox and SETI. It is there because habitability is now an observational question about atmospheres
rather than a speculative one, and putting it in its own deck would have detached it from the
measurements that make it a science.

**`astro-1000` is "Where astronomy is going" and `astro-999` is "Why astronomy matters".** The second
of those is earned here as it is in the Dinosaurs plan: this is the science most people meet first and
most governments fund for reasons that are not scientific, and that is part of the subject.

## Evidence, not spectacle — and the five pulls

**The rule this section is the local form of lives in CLAUDE.md** ("FOLIO IS A HISTORY SITE, NOT AN
ARCHAEOLOGY SITE" and its historiography half). Five things pull an astronomy card away from the
science.

**The superlative.** Biggest, brightest, oldest, most distant, fastest. Every one of these is a claim
about a *ranking* that is usually a claim about a *survey's limits*, and most of them have changed
within the last decade. Give the figure, the method and the uncertainty, and where a record is held,
say when it was set and by which survey.

**The vivid number with no error bar.** A distance, a mass, an age or a temperature quoted bare reads as
measured when it is very often modelled. The house rule is the Dinosaurs plan's: **"estimated at" and
mean it.** Where a quantity depends on the Hubble constant, the value moves with which measurement of it
you take — `astro-689` exists so a card can say so in one clause.

**The press release.** Astronomy has the best-funded science communication of any field and the gap
between a paper's abstract and its university's headline is wide and consistent: *may indicate* becomes
*is evidence of*, and a candidate becomes a discovery. **Follow the DOI.** Where a result is new,
check whether it has been confirmed — this field's retraction rate is low but its *unconfirmed-claim*
rate is high, particularly for biosignatures and for the most distant object of any kind.

**The picture.** An astronomical image is a scientific instrument's output rendered by a choice of
filters and stretch. A card that describes what a picture "shows" without knowing which wavelengths made
it has described the rendering. `astro-881` to `astro-885` card the general problem; every card carrying
an image inherits it, and its caption should say what the colours are.

**Stale popular science, which in this subject has a specific shape.** Astronomy's *textbook* facts are
stable, and its *numbers* are not: the Hubble constant, the age of the universe, the exoplanet count,
the number of known moons and the mass of the Milky Way have all moved, some of them a lot, inside the
last fifteen years. **A figure from a source older than about 2015 needs re-checking even when the
source was excellent**, and the count-type figures need re-checking every time.

## This collection follows the no-researchers rule, with the history deck exempt

**Like `bio` and `dino`, and unlike `psych` and `phil`, this collection is NOT excluded from the
no-researchers rule**, and does not need to be: astronomy's content is objects and mechanisms, so a
question can nearly always be clued from what the thing is or does. `astro-731` asks what dark matter is
and what measures it, not what Zwicky proposed.

**The exemption the rule already provides covers `astro-history` entirely** — 80 cards where the answer
term IS a person or their work: Hipparchus, Ptolemy, Ulugh Beg, Copernicus, Tycho, Kepler, Galileo,
Newton, Leavitt, Cannon, Payne, Hubble, Lemaître. A handful elsewhere take the same exemption because
the name is the term: `astro-479` the Hulse–Taylor binary, `astro-653` the Sunyaev–Zel'dovich effect,
`astro-683` Olbers' paradox, `astro-686` Hubble's law, `astro-566` the Fermi paradox,
`astro-564` the Drake equation, `astro-796` Wien's law, `astro-797` the Stefan–Boltzmann law,
`astro-801` Kirchhoff's laws, `astro-818` to `astro-820` Kepler's laws, `astro-453` the Chandrasekhar
limit, `astro-824` Lagrange points, `astro-374` the Jeans mass and `astro-379` Herbig–Haro objects.
**That is a long list and it is the exemption working as intended**: in physics an eponym is a term of
art rather than an attribution, and the test is whether a reader would meet the word again. Where it is
genuinely an attribution — "Zwicky argued", "Rubin showed" — the rule binds and the card names the
evidence instead.

**The historiography cap binds everywhere except `astro-history`**: at most three of ten sentences on
who established a thing. It will bite hardest in the cosmology deck, where the temptation is to tell the
story of how each result was obtained.

## Names, dates and figures

**Object designations are given in full on first use and are not invented.** A star is `Betelgeuse` or
`Alpha Orionis` or `HD 39801`, a galaxy `M31` or `NGC 224` or `Andromeda` — all real, all findable, and
each catalogue has a card (`astro-071` to `astro-074`). **Never construct a designation from the
pattern**; catalogue numbers are not derivable and a plausible wrong one resolves to a different object.

**Distances carry their method.** "About 640 light-years, from Gaia parallax" and "about 2.5 million
light-years, from Cepheids" are different kinds of statement, and the second inherits the ladder.

**Dates are of two kinds and only one of them is a date line.** The *observation* history of an object
is history and mostly belongs in deck 9; the *age* of an object is a number in the prose with an
uncertainty on it. Most cards in decks 3 to 7 will have **no date line at all**, and that is correct —
`test-date-line.js` is explicit that a card with nothing datable takes an empty line rather than a
filler row. Where a card does take one, the labels are `Discovered`, `Observed`, `Launched`, `Named` and
`Proposed` for human events, and a deep span (`c. 13.8 Gya`, `c. 4.57 Gya`) for the universe and the
Solar System — both of which `cardYears` reads natively via `Gya`.

**Numbers use the site's own conventions.** Non-round numbers above 20 are numerals; metric first with
the imperial conversion in parentheses, which does not count against the word limits. **Astronomical
units, light-years and parsecs are not imperial-convertible and take no bracket** — they are already the
units the subject uses, and `astro-006` to `astro-008` card them. A kilometre figure does take one.

**A temperature is written `5,772 K` and a temperature difference is not a temperature.** CLAUDE.md's
units bullet has the rule and the trap; Kelvin is neither of the two scales its conversion table knows,
so a Kelvin figure simply stands. Where a card gives a Celsius figure for a reader's sake, it takes the
Fahrenheit bracket like any other.

## Sourcing

**Better served by open access than any other science on this shelf, and the reason is structural**:
astronomy has published to **arXiv** since 1991 and the field's norm is that the preprint goes up on
acceptance. Nearly every paper a card needs is free.

**The open routes that work.** *arXiv* (astro-ph) for essentially everything, with the caution below.
The **NASA Astrophysics Data System** is the field's bibliographic index and resolves any citation to
its published version. *Astronomy & Astrophysics*, *The Astrophysical Journal*, *Monthly Notices of the
Royal Astronomical Society*, *The Astronomical Journal* and *Publications of the ASP* carry the
literature; *Annual Review of Astronomy and Astrophysics* and *Living Reviews in Relativity* carry the
syntheses and are where a card on a large subject should start. **NASA**, **ESA**, **ESO** and the
**IAU** publish mission and nomenclature material that is citable for what it is — a mission's own
specifications, a body's official name — and is not an independent source for a scientific claim.
The **NASA Exoplanet Archive** and the **JPL Small-Body Database** are the standard catalogues for
counts, and **a count is a fact about a database on a date**, so cite it with the date.

**Five hazards.**

**An arXiv preprint is not a published paper.** Most become one and some do not, and the version on
arXiv may be earlier than the version that was refereed. **Cite the journal version where one exists**,
and where a card rests on a preprint alone, say so.

**The numbers move.** See the pulls above. Any count — planets, moons, gravitational-wave detections,
known asteroids — is out of date by the time it is written, so card the *kind* of thing and give the
count as "more than N as of <date>", never as a bare figure.

**Press releases are worse here than anywhere.** Every major observatory has a communications office
and a picture, and the picture travels further than the paper. The gap this collection has to close is
between "consistent with" and "shows".

**Popular cosmology is a genre and it is not a source.** The multiverse, string cosmology and the
anthropic principle all have serious literature and an enormous secondary one, and the secondary one
routinely presents speculation with the register of result. `astro-776` to `astro-782` need the
technical reviews, and need to say clearly what is and is not testable.

**Wikipedia is where this subject is best written and is still not citable.** Astronomy's articles are
unusually good and unusually well referenced; follow them to what they cite, which they almost always
name precisely.

## Living beside the other collections

**BIOLOGY IS THE NEIGHBOUR AND THE OVERLAP IS SMALL.** The two meet only in astrobiology: Biology's
origin-of-life cards and this collection's `astro-556` to `astro-570` are about the same question from
opposite ends, and the rule is the Dinosaurs plan's — **write the pair deliberately**, with Biology's
asking how life began here and this one asking whether it began elsewhere. `astro-559` is titled *The
origin of life as an astronomical question* precisely to keep the two apart.

**DINOSAURS IS THE OTHER NEIGHBOUR AND THE OVERLAP IS EXACTLY ONE SUBJECT.** The Chicxulub impact is
`dino-796` to `dino-825`'s whole deck and is `astro-218` here — one card, about the impactor and what
impacts do, pointing at the extinction rather than telling it. **Do not re-card the extinction.**
`astro-217` impacts on Earth and `astro-220` planetary defence are this collection's own.

**THE HISTORY COLLECTIONS OVERLAP IN DECK 9 AND THE RULE IS THE SAME.** Greek, Chinese, Indian, Islamic
and Mesoamerican astronomy each have a card here and each has a home collection that may reach the same
subject. This collection's cards are about **what was observed and what was concluded**; the history
collections' are about the people and the institutions. Check for an existing card before writing one,
and where both exist, each should be able to stand without the other.

**GLOSSARY TERMS: expect to write nearly all of them.** A spot check when this plan was written found
`Sun`, `Moon`, `Earth`, `Mars`, `Comet` and `Eclipse` already in the glossary in senses written for
history cards; **check before running `add-glossary.js`, which overwrites in silence** (CLAUDE.md's own
scar). Where a term exists in a historical sense and this collection needs an astronomical one, **widen
the existing entry rather than re-keying it** — the glossary is deck-agnostic by house rule.

**Two keys need care and both are ordinary English words.** `Star` and `Galaxy` are the shape
`Life_(biology)` was written to refuse: measured over the shipped corpus before writing either, ask how
many existing abstracts contain the bare word and in what sense. `Universe` and `Space` are worse and
should probably not claim their bare surfaces at all.

**`Black_hole`, `Dark_matter`, `Redshift`, `Parallax` and `Spectrum` are unambiguous and can be keyed
plainly.** `Spectrum` is the one to watch: it is also used of the electromagnetic spectrum, of a
political spectrum and of autism, so check the corpus before claiming the bare name.

# The list

## Looking Up

### What astronomy is — `astro-what`

    astro-001  Astronomy
    astro-002  What astronomers study
    astro-003  Astronomy and astrophysics
    astro-004  Astronomy is an observational science
    astro-005  The scale of the universe
    astro-006  The astronomical unit
    astro-007  The light-year
    astro-008  The parsec
    astro-009  Looking out is looking back in time
    astro-010  The night sky as a projection
    astro-011  Why the sky is dark at night
    astro-012  Light pollution
    astro-013  Seeing and the atmosphere
    astro-014  Amateur astronomy
    astro-015  Astronomy and astrology

### The celestial sphere — `astro-sphere`

    astro-016  The celestial sphere
    astro-017  The celestial poles
    astro-018  The celestial equator
    astro-019  The ecliptic
    astro-020  The zenith and the horizon
    astro-021  Altitude and azimuth
    astro-022  Right ascension and declination
    astro-023  The vernal equinox as a zero point
    astro-024  The meridian and transit
    astro-025  Circumpolar stars
    astro-026  What can be seen from a given latitude
    astro-027  Star charts
    astro-028  The magnitude scale
    astro-029  Apparent and absolute magnitude
    astro-030  Angular size
    astro-031  Angular separation and the degree
    astro-032  Parallax as an angle
    astro-033  Sidereal time
    astro-034  The zodiac
    astro-035  Galactic coordinates

### The moving sky — `astro-motion`

    astro-036  The diurnal motion of the sky
    astro-037  The Earth's rotation
    astro-038  The Earth's orbit
    astro-039  Why the stars change with the season
    astro-040  The solstices
    astro-041  The equinoxes
    astro-042  Why there are seasons
    astro-043  The analemma
    astro-044  Precession of the equinoxes
    astro-045  Nutation
    astro-046  Proper motion
    astro-047  The changing constellations over deep time
    astro-048  The phases of the Moon
    astro-049  The synodic and the sidereal month
    astro-050  The motion of the planets against the stars
    astro-051  Retrograde motion
    astro-052  Conjunction and opposition
    astro-053  Elongation and the inner planets
    astro-054  Transits of Mercury and Venus
    astro-055  Occultations

### Constellations and star names — `astro-constellations`

    astro-056  Constellation
    astro-057  The 88 modern constellations
    astro-058  The IAU constellation boundaries
    astro-059  Asterisms
    astro-060  Ursa Major and the Plough
    astro-061  Orion
    astro-062  The Southern Cross
    astro-063  Cassiopeia and finding the pole
    astro-064  Polaris
    astro-065  The zodiacal constellations
    astro-066  The southern sky
    astro-067  Constellations in other cultures
    astro-068  Aboriginal Australian sky knowledge
    astro-069  The Chinese sky
    astro-070  Polynesian navigation by the stars
    astro-071  Bayer designations
    astro-072  Flamsteed numbers
    astro-073  Proper names of stars
    astro-074  Catalogue designations
    astro-075  The brightest stars in the sky

### Eclipses, tides and calendars — `astro-calendar`

    astro-076  Solar eclipse
    astro-077  Lunar eclipse
    astro-078  Why eclipses do not happen every month
    astro-079  The saros cycle
    astro-080  Totality and the solar corona
    astro-081  Eclipse prediction in the ancient world
    astro-082  Tides
    astro-083  Spring and neap tides
    astro-084  Tidal locking
    astro-085  The solar day and the sidereal day
    astro-086  The tropical year
    astro-087  The lunar calendar
    astro-088  The Julian and Gregorian calendars
    astro-089  Leap seconds and atomic time
    astro-090  Julian dates in astronomy

## The Solar System

### How the Solar System formed — `astro-formation`

    astro-091  The Solar System
    astro-092  The nebular hypothesis
    astro-093  The protoplanetary disc
    astro-094  Accretion and planetesimals
    astro-095  Why the inner planets are rocky
    astro-096  The frost line
    astro-097  The formation of the giant planets
    astro-098  Migration of the giant planets
    astro-099  The late heavy bombardment
    astro-100  The age of the Solar System
    astro-101  Dating the Solar System with meteorites
    astro-102  Angular momentum in the Solar System
    astro-103  The invariable plane
    astro-104  Why the planets orbit the same way
    astro-105  What the Solar System is made of
    astro-106  Condensation and the chemistry of the disc
    astro-107  Isotopic clues to the Sun's birthplace
    astro-108  Was the Sun born in a cluster
    astro-109  The Solar System's place in the Galaxy
    astro-110  Is the Solar System typical

### The rocky planets — `astro-inner`

    astro-111  Terrestrial planet
    astro-112  Mercury
    astro-113  The surface of Mercury
    astro-114  Mercury's spin–orbit resonance
    astro-115  Venus
    astro-116  The atmosphere of Venus
    astro-117  The runaway greenhouse on Venus
    astro-118  The surface of Venus
    astro-119  Venus's rotation
    astro-120  Earth as a planet
    astro-121  The Earth's interior
    astro-122  Plate tectonics
    astro-123  The Earth's atmosphere
    astro-124  The Earth's magnetic field
    astro-125  The Moon
    astro-126  The origin of the Moon
    astro-127  The lunar surface
    astro-128  Lunar maria and highlands
    astro-129  Impact craters
    astro-130  Mars
    astro-131  The Martian surface
    astro-132  Water on Mars
    astro-133  The Martian atmosphere
    astro-134  Olympus Mons and the Tharsis bulge
    astro-135  Valles Marineris
    astro-136  The moons of Mars
    astro-137  Dust storms on Mars
    astro-138  The loss of Mars's atmosphere
    astro-139  Why the terrestrial planets differ
    astro-140  Planetary differentiation

### The giant planets — `astro-giants`

    astro-141  Gas giant
    astro-142  Ice giant
    astro-143  Jupiter
    astro-144  Jupiter's atmosphere
    astro-145  The Great Red Spot
    astro-146  Jupiter's interior
    astro-147  Jupiter's magnetosphere
    astro-148  Saturn
    astro-149  Saturn's rings
    astro-150  How planetary rings work
    astro-151  The Roche limit
    astro-152  Shepherd moons
    astro-153  Saturn's hexagon
    astro-154  Uranus
    astro-155  The tilt of Uranus
    astro-156  Neptune
    astro-157  Neptune's winds
    astro-158  The discovery of Neptune
    astro-159  Interiors of the ice giants
    astro-160  Metallic hydrogen
    astro-161  Helium rain
    astro-162  Why the giants have so many moons
    astro-163  Ring systems of the outer planets
    astro-164  Heat from within
    astro-165  Weather on the giant planets

### Moons — `astro-moons`

    astro-166  Natural satellite
    astro-167  The Galilean moons
    astro-168  Io and its volcanoes
    astro-169  Europa
    astro-170  The ocean beneath Europa's ice
    astro-171  Ganymede
    astro-172  Callisto
    astro-173  Titan
    astro-174  Titan's lakes and weather
    astro-175  Enceladus
    astro-176  The plumes of Enceladus
    astro-177  Tidal heating
    astro-178  Subsurface oceans in the outer Solar System
    astro-179  Triton
    astro-180  Irregular satellites
    astro-181  Captured moons
    astro-182  The mid-sized moons of Saturn
    astro-183  Iapetus
    astro-184  The moons of Uranus
    astro-185  Charon and the Pluto system
    astro-186  How moons form
    astro-187  Orbital resonance among moons
    astro-188  Why the outer moons matter to astrobiology
    astro-189  Cryovolcanism
    astro-190  Moonquakes and lunar interiors

### Asteroids, comets and meteorites — `astro-small`

    astro-191  Asteroid
    astro-192  The asteroid belt
    astro-193  Why the asteroid belt is not a planet
    astro-194  Kirkwood gaps
    astro-195  Ceres
    astro-196  Vesta
    astro-197  Asteroid families
    astro-198  Near-Earth asteroids
    astro-199  Trojan asteroids
    astro-200  Asteroid composition and spectral classes
    astro-201  Rubble-pile asteroids
    astro-202  Comet
    astro-203  The nucleus of a comet
    astro-204  Comet tails
    astro-205  The coma
    astro-206  Short-period and long-period comets
    astro-207  Halley's Comet
    astro-208  Great comets
    astro-209  Where comets come from
    astro-210  Meteoroid, meteor and meteorite
    astro-211  Meteor showers
    astro-212  The Perseids and the Leonids
    astro-213  Fireballs and bolides
    astro-214  Meteorite types
    astro-215  Chondrites and chondrules
    astro-216  What meteorites say about the early Solar System
    astro-217  Impacts on Earth
    astro-218  The Chicxulub impactor
    astro-219  The Tunguska event
    astro-220  Planetary defence

### The outer Solar System — `astro-outer`

    astro-221  The Kuiper belt
    astro-222  Pluto
    astro-223  The surface of Pluto
    astro-224  Why Pluto was reclassified
    astro-225  Dwarf planet
    astro-226  Eris, Haumea and Makemake
    astro-227  Trans-Neptunian objects
    astro-228  Resonant Kuiper belt objects
    astro-229  The scattered disc
    astro-230  Sedna and the detached objects
    astro-231  The Oort cloud
    astro-232  Centaurs
    astro-233  The heliosphere
    astro-234  The solar wind's edge
    astro-235  The heliopause and interstellar space
    astro-236  Voyager beyond the planets
    astro-237  The search for Planet Nine
    astro-238  Interstellar objects passing through
    astro-239  The outer limits of the Sun's gravity
    astro-240  What the outer Solar System is made of

## The Sun and the Stars

### The Sun — `astro-sun`

    astro-241  The Sun
    astro-242  The Sun's structure
    astro-243  The solar core
    astro-244  Nuclear fusion in the Sun
    astro-245  The proton–proton chain
    astro-246  The radiative zone
    astro-247  The convective zone
    astro-248  The photosphere
    astro-249  Granulation
    astro-250  Sunspots
    astro-251  The solar cycle
    astro-252  The Maunder minimum
    astro-253  The chromosphere
    astro-254  The corona
    astro-255  The coronal heating problem
    astro-256  Solar flares
    astro-257  Coronal mass ejections
    astro-258  The solar wind
    astro-259  Space weather
    astro-260  Aurorae
    astro-261  The Sun's magnetic field
    astro-262  Helioseismology
    astro-263  Solar neutrinos
    astro-264  The solar neutrino problem and its solution
    astro-265  The solar constant
    astro-266  The Sun's composition
    astro-267  The Sun's age and future
    astro-268  The faint young Sun problem
    astro-269  Observing the Sun safely
    astro-270  The Sun as a typical star

### What a star is — `astro-starbasics`

    astro-271  Star
    astro-272  Hydrostatic equilibrium
    astro-273  What holds a star up
    astro-274  Stellar mass and why it matters
    astro-275  The mass–luminosity relation
    astro-276  Stellar luminosity
    astro-277  Effective temperature
    astro-278  Stellar radius
    astro-279  Blackbody radiation from stars
    astro-280  Star colour and temperature
    astro-281  Spectral classification
    astro-282  The OBAFGKM sequence
    astro-283  Luminosity classes
    astro-284  The Harvard classification
    astro-285  Brown dwarfs
    astro-286  The lowest-mass stars
    astro-287  The most massive stars
    astro-288  Stellar composition and metallicity
    astro-289  Stellar rotation
    astro-290  Stellar magnetic activity
    astro-291  Starspots
    astro-292  Stellar winds
    astro-293  Stellar atmospheres
    astro-294  Convection in stars
    astro-295  Why stars differ

### Measuring the stars — `astro-measuring`

    astro-296  Stellar parallax
    astro-297  The parallax second
    astro-298  Hipparcos and Gaia
    astro-299  The distance ladder
    astro-300  Standard candles
    astro-301  Spectroscopic parallax
    astro-302  Photometry
    astro-303  Colour index
    astro-304  Bolometric magnitude
    astro-305  Interstellar reddening
    astro-306  Extinction and its correction
    astro-307  Weighing stars with binaries
    astro-308  Measuring stellar radii
    astro-309  Interferometry and stellar diameters
    astro-310  Radial velocity from spectra
    astro-311  The Doppler shift in astronomy
    astro-312  Space velocity
    astro-313  Surface gravity from spectra
    astro-314  Abundance measurement
    astro-315  Asteroseismology
    astro-316  Light curves
    astro-317  Astrometry
    astro-318  Errors and uncertainty in astronomy
    astro-319  Selection effects in stellar samples
    astro-320  Malmquist bias

### The H–R diagram — `astro-hr`

    astro-321  The Hertzsprung–Russell diagram
    astro-322  The main sequence
    astro-323  Why the main sequence is a mass sequence
    astro-324  Main-sequence lifetime
    astro-325  Giants and supergiants
    astro-326  The red giant branch
    astro-327  The horizontal branch
    astro-328  The asymptotic giant branch
    astro-329  White dwarfs on the diagram
    astro-330  The instability strip
    astro-331  Stellar evolutionary tracks
    astro-332  Isochrones
    astro-333  The turn-off point and cluster ages
    astro-334  Population I and Population II stars
    astro-335  Population III stars
    astro-336  The initial mass function
    astro-337  The stellar census
    astro-338  Where the Sun sits on the diagram
    astro-339  Reading an H–R diagram
    astro-340  What the diagram is not

### Binaries, clusters and variables — `astro-multiples`

    astro-341  Binary star
    astro-342  Visual binaries
    astro-343  Spectroscopic binaries
    astro-344  Eclipsing binaries
    astro-345  Contact binaries
    astro-346  Mass transfer in close binaries
    astro-347  The Roche lobe
    astro-348  Cataclysmic variables
    astro-349  Novae
    astro-350  Multiple star systems
    astro-351  How often stars come in pairs
    astro-352  Star cluster
    astro-353  Open clusters
    astro-354  The Pleiades
    astro-355  The Hyades
    astro-356  Globular clusters
    astro-357  Omega Centauri
    astro-358  Ages of globular clusters
    astro-359  Stellar associations
    astro-360  Moving groups
    astro-361  Variable star
    astro-362  Cepheid variables
    astro-363  The period–luminosity relation
    astro-364  RR Lyrae stars
    astro-365  Mira variables
    astro-366  Eruptive variables
    astro-367  T Tauri stars
    astro-368  Flare stars
    astro-369  Naming variable stars
    astro-370  Amateur work on variable stars

## Lives and Deaths of Stars

### Star formation — `astro-birth`

    astro-371  Star formation
    astro-372  Giant molecular clouds
    astro-373  Gravitational collapse
    astro-374  The Jeans mass
    astro-375  What triggers collapse
    astro-376  Protostars
    astro-377  The protostellar disc
    astro-378  Bipolar outflows and jets
    astro-379  Herbig–Haro objects
    astro-380  Pre-main-sequence evolution
    astro-381  Deuterium burning
    astro-382  How a star reaches the main sequence
    astro-383  Failed stars
    astro-384  Star-forming regions
    astro-385  The Orion Nebula
    astro-386  The Eagle Nebula
    astro-387  Embedded clusters
    astro-388  Triggered star formation
    astro-389  Star-formation efficiency
    astro-390  The rate of star formation in the Galaxy
    astro-391  Feedback from young stars
    astro-392  Massive star formation
    astro-393  How binaries form
    astro-394  From disc to planetary system
    astro-395  Watching star birth in the infrared

### The interstellar medium — `astro-ism`

    astro-396  The interstellar medium
    astro-397  Interstellar gas
    astro-398  Interstellar dust
    astro-399  What dust grains are made of
    astro-400  Molecular clouds
    astro-401  Interstellar molecules
    astro-402  H II regions
    astro-403  Emission nebulae
    astro-404  Reflection nebulae
    astro-405  Dark nebulae
    astro-406  The 21-centimetre line
    astro-407  The phases of the interstellar medium
    astro-408  Interstellar magnetic fields
    astro-409  Cosmic rays in the interstellar medium
    astro-410  How supernovae stir the interstellar medium
    astro-411  The galactic fountain
    astro-412  Interstellar chemistry
    astro-413  How dust obscures and reddens
    astro-414  Polarisation by dust
    astro-415  Recycling of matter in the Galaxy

### Nuclear burning and the elements — `astro-fusion`

    astro-416  Nuclear fusion in stars
    astro-417  The binding-energy curve
    astro-418  Quantum tunnelling in stellar cores
    astro-419  The CNO cycle
    astro-420  Hydrogen burning
    astro-421  The triple-alpha process
    astro-422  Helium burning
    astro-423  Carbon and oxygen burning
    astro-424  Silicon burning and the iron core
    astro-425  Why fusion stops at iron
    astro-426  The s-process
    astro-427  The r-process
    astro-428  Where gold comes from
    astro-429  What the Big Bang did not make
    astro-430  The origin of carbon
    astro-431  The origin of oxygen
    astro-432  Cosmic abundance of the elements
    astro-433  Metallicity and chemical evolution
    astro-434  Spallation and the light elements
    astro-435  Nucleosynthesis in novae
    astro-436  Chemical enrichment of galaxies
    astro-437  Reading a star's history from its composition
    astro-438  Neutrinos from stellar cores
    astro-439  Energy transport out of a star
    astro-440  Timescales of stellar burning

### Old age and mass loss — `astro-late`

    astro-441  Leaving the main sequence
    astro-442  The red giant
    astro-443  The helium flash
    astro-444  The subgiant branch
    astro-445  Thermal pulses
    astro-446  Dredge-up
    astro-447  Stellar mass loss
    astro-448  Planetary nebula
    astro-449  Why a planetary nebula is so called
    astro-450  The Ring Nebula
    astro-451  White dwarf
    astro-452  Electron degeneracy
    astro-453  The Chandrasekhar limit
    astro-454  Cooling white dwarfs as clocks
    astro-455  The fate of the Sun
    astro-456  The end of the Earth
    astro-457  Carbon stars
    astro-458  The asymptotic giant branch in practice
    astro-459  Post-AGB stars
    astro-460  What a low-mass star leaves behind

### Supernovae and remnants — `astro-remnants`

    astro-461  Supernova
    astro-462  Core-collapse supernovae
    astro-463  Type Ia supernovae
    astro-464  Supernova classification
    astro-465  What explodes in a Type Ia
    astro-466  The light curve of a supernova
    astro-467  Supernova 1987A
    astro-468  Historical supernovae
    astro-469  Supernova remnants
    astro-470  The Crab Nebula
    astro-471  Cassiopeia A
    astro-472  Neutron star
    astro-473  Neutron-star matter
    astro-474  Pulsars
    astro-475  The discovery of pulsars
    astro-476  Millisecond pulsars
    astro-477  Magnetars
    astro-478  Pulsar timing
    astro-479  The Hulse–Taylor binary
    astro-480  Neutron-star mergers
    astro-481  Kilonovae
    astro-482  Black hole
    astro-483  The event horizon
    astro-484  Stellar-mass black holes
    astro-485  X-ray binaries
    astro-486  Accretion discs
    astro-487  Hypernovae
    astro-488  Gamma-ray bursts
    astro-489  What determines a star's end
    astro-490  Compact objects as laboratories

## Planets Beyond the Sun

### Finding exoplanets — `astro-detect`

    astro-491  Exoplanet
    astro-492  The first exoplanets found
    astro-493  51 Pegasi b
    astro-494  The radial-velocity method
    astro-495  The transit method
    astro-496  Kepler and the transit survey
    astro-497  TESS
    astro-498  Transit timing variations
    astro-499  Direct imaging of exoplanets
    astro-500  Gravitational microlensing
    astro-501  Astrometric detection
    astro-502  Pulsar planets
    astro-503  Detection biases
    astro-504  What the methods cannot see
    astro-505  Confirming a candidate planet
    astro-506  False positives in transit surveys
    astro-507  Measuring an exoplanet's mass
    astro-508  Measuring an exoplanet's radius
    astro-509  Exoplanet density and composition
    astro-510  Transmission spectroscopy
    astro-511  Secondary eclipse spectra
    astro-512  Phase curves
    astro-513  The exoplanet census
    astro-514  Occurrence rates
    astro-515  How many planets the Galaxy holds

### What exoplanets are like — `astro-worlds`

    astro-516  Hot Jupiters
    astro-517  Why hot Jupiters were a surprise
    astro-518  Planetary migration
    astro-519  Super-Earths
    astro-520  Mini-Neptunes
    astro-521  The radius valley
    astro-522  Rocky exoplanets
    astro-523  Ultra-short-period planets
    astro-524  Eccentric planets
    astro-525  Circumbinary planets
    astro-526  Free-floating planets
    astro-527  Planets around M dwarfs
    astro-528  TRAPPIST-1
    astro-529  Proxima Centauri b
    astro-530  The architecture of planetary systems
    astro-531  Resonant chains
    astro-532  Exoplanet atmospheres
    astro-533  Clouds and hazes on exoplanets
    astro-534  Tidally locked worlds
    astro-535  Exomoons
    astro-536  Debris discs
    astro-537  Discs around other stars
    astro-538  Planet formation seen in progress
    astro-539  How exoplanets changed planet-formation theory
    astro-540  What a typical planetary system looks like

### Habitability — `astro-habit`

    astro-541  The habitable zone
    astro-542  What the habitable zone leaves out
    astro-543  Liquid water as a criterion
    astro-544  Stellar activity and habitability
    astro-545  Atmospheres and the greenhouse effect
    astro-546  Magnetic fields and atmospheric loss
    astro-547  The continuously habitable zone
    astro-548  Habitability of moons
    astro-549  Galactic habitability
    astro-550  Earth as a reference world
    astro-551  Biosignatures
    astro-552  False biosignatures
    astro-553  Technosignatures
    astro-554  Observing an Earth-like atmosphere
    astro-555  What would count as evidence of life

### Life in the universe — `astro-life`

    astro-556  Astrobiology
    astro-557  The chemistry life needs
    astro-558  Extremophiles
    astro-559  The origin of life as an astronomical question
    astro-560  Panspermia
    astro-561  Life elsewhere in the Solar System
    astro-562  Missions that look for life
    astro-563  Planetary protection
    astro-564  The Drake equation
    astro-565  What the Drake equation is for
    astro-566  The Fermi paradox
    astro-567  Proposed answers to the Fermi paradox
    astro-568  SETI
    astro-569  The Wow! signal
    astro-570  Messages to the stars

## Galaxies

### The Milky Way — `astro-milkyway`

    astro-571  The Milky Way
    astro-572  The band of light in the sky
    astro-573  The shape of the Galaxy
    astro-574  The galactic disc
    astro-575  The spiral arms of the Milky Way
    astro-576  The galactic bar
    astro-577  The galactic bulge
    astro-578  The galactic halo
    astro-579  Where the Sun sits in the Galaxy
    astro-580  The galactic year
    astro-581  Mapping the Galaxy with radio
    astro-582  Mapping the Galaxy with Gaia
    astro-583  The rotation curve of the Milky Way
    astro-584  Dark matter in the Milky Way
    astro-585  Sagittarius A*
    astro-586  The black hole at the galactic centre
    astro-587  Stellar orbits at the galactic centre
    astro-588  The galactic centre in other wavelengths
    astro-589  The Fermi bubbles
    astro-590  Globular clusters of the Milky Way
    astro-591  Stellar streams
    astro-592  The Galaxy's satellites
    astro-593  The Magellanic Clouds
    astro-594  The Sagittarius dwarf galaxy
    astro-595  The Milky Way's merger history
    astro-596  The age of the Milky Way
    astro-597  The mass of the Milky Way
    astro-598  How many stars the Galaxy has
    astro-599  The Local Bubble
    astro-600  Studying a galaxy from inside it

### Kinds of galaxy — `astro-kinds`

    astro-601  Galaxy
    astro-602  The Hubble sequence
    astro-603  Spiral galaxies
    astro-604  Barred spirals
    astro-605  Elliptical galaxies
    astro-606  Lenticular galaxies
    astro-607  Irregular galaxies
    astro-608  Dwarf galaxies
    astro-609  Ultra-diffuse galaxies
    astro-610  The Andromeda Galaxy
    astro-611  The Triangulum Galaxy
    astro-612  Starburst galaxies
    astro-613  Low-surface-brightness galaxies
    astro-614  The galaxy luminosity function
    astro-615  Galaxy masses
    astro-616  Galaxy rotation curves
    astro-617  Density waves and spiral structure
    astro-618  Bulges and discs
    astro-619  Stellar populations in galaxies
    astro-620  Colour and star formation in galaxies
    astro-621  The red sequence and the blue cloud
    astro-622  Gas in galaxies
    astro-623  Dust in galaxies
    astro-624  Galaxy morphology and environment
    astro-625  Classifying galaxies by eye and by machine

### Active galaxies and black holes — `astro-agn`

    astro-626  Active galactic nucleus
    astro-627  Supermassive black hole
    astro-628  Quasars
    astro-629  The discovery of quasars
    astro-630  Seyfert galaxies
    astro-631  Radio galaxies
    astro-632  Blazars
    astro-633  Relativistic jets
    astro-634  The unified model of active galaxies
    astro-635  Accretion onto a supermassive black hole
    astro-636  The Eddington limit
    astro-637  How supermassive black holes are weighed
    astro-638  The M–sigma relation
    astro-639  Black holes and galaxy co-evolution
    astro-640  Feedback from active nuclei
    astro-641  The first image of a black hole
    astro-642  Tidal disruption events
    astro-643  Where supermassive black holes came from
    astro-644  Quasars as cosmic probes
    astro-645  Dormant black holes

### Clusters and large-scale structure — `astro-clusters`

    astro-646  The Local Group
    astro-647  Galaxy groups
    astro-648  Galaxy clusters
    astro-649  The Virgo Cluster
    astro-650  The Coma Cluster
    astro-651  The intracluster medium
    astro-652  X-ray emission from clusters
    astro-653  The Sunyaev–Zel'dovich effect
    astro-654  Gravitational lensing by clusters
    astro-655  The Bullet Cluster
    astro-656  Superclusters
    astro-657  Laniakea
    astro-658  Filaments and voids
    astro-659  The cosmic web
    astro-660  Galaxy redshift surveys
    astro-661  Baryon acoustic oscillations
    astro-662  The two-point correlation function
    astro-663  Peculiar velocities and the Great Attractor
    astro-664  The largest structures known
    astro-665  How structure grew

### How galaxies change — `astro-evolution`

    astro-666  Galaxy formation
    astro-667  Hierarchical assembly
    astro-668  Galaxy mergers
    astro-669  Major and minor mergers
    astro-670  Interacting galaxies
    astro-671  The coming collision with Andromeda
    astro-672  Ram-pressure stripping
    astro-673  Quenching of star formation
    astro-674  Cosmic star-formation history
    astro-675  High-redshift galaxies
    astro-676  The first galaxies
    astro-677  Reionisation
    astro-678  Lyman-break galaxies
    astro-679  Surveys through cosmic time
    astro-680  Galaxies in the far future

## Cosmology

### The expanding universe — `astro-expansion`

    astro-681  Cosmology
    astro-682  The cosmological principle
    astro-683  Olbers' paradox
    astro-684  Redshift
    astro-685  Cosmological redshift
    astro-686  Hubble's law
    astro-687  The Hubble constant
    astro-688  Measuring the Hubble constant
    astro-689  The Hubble tension
    astro-690  The expansion is not an explosion
    astro-691  The scale factor
    astro-692  The observable universe
    astro-693  The cosmic horizon
    astro-694  Comoving distance
    astro-695  Lookback time
    astro-696  The age of the universe
    astro-697  The curvature of space
    astro-698  The flat universe
    astro-699  The Friedmann equations
    astro-700  The critical density
    astro-701  Cosmological parameters
    astro-702  The concordance model
    astro-703  Standard candles in cosmology
    astro-704  Type Ia supernovae as distance indicators
    astro-705  The distance ladder in practice

### The hot Big Bang — `astro-bigbang`

    astro-706  The Big Bang
    astro-707  What the Big Bang theory does not claim
    astro-708  The early universe
    astro-709  The Planck epoch
    astro-710  Inflation
    astro-711  What inflation explains
    astro-712  Evidence for inflation
    astro-713  Baryogenesis
    astro-714  The matter–antimatter asymmetry
    astro-715  The quark–gluon era
    astro-716  Nucleosynthesis in the first minutes
    astro-717  Primordial abundances as a test
    astro-718  Recombination
    astro-719  The surface of last scattering
    astro-720  The cosmic microwave background
    astro-721  The prediction of the microwave background
    astro-722  The blackbody spectrum of the microwave background
    astro-723  Anisotropies in the microwave background
    astro-724  The acoustic peaks
    astro-725  COBE, WMAP and Planck
    astro-726  Polarisation of the microwave background
    astro-727  The dark ages
    astro-728  Cosmic dawn
    astro-729  The 21-centimetre cosmology signal
    astro-730  Relic neutrinos

### Dark matter — `astro-darkmatter`

    astro-731  Dark matter
    astro-732  Rotation curves and the missing mass
    astro-733  Missing mass in clusters
    astro-734  Gravitational lensing as evidence
    astro-735  Dark matter in the microwave background
    astro-736  How much dark matter there is
    astro-737  Cold dark matter
    astro-738  Structure formation with cold dark matter
    astro-739  Dark matter haloes
    astro-740  The missing-satellites problem
    astro-741  The core–cusp problem
    astro-742  WIMPs
    astro-743  Axions
    astro-744  Direct detection experiments
    astro-745  Indirect detection
    astro-746  Collider searches for dark matter
    astro-747  Modified gravity as an alternative
    astro-748  What the Bullet Cluster shows
    astro-749  Why ordinary matter is not enough
    astro-750  Why dark matter is still called dark

### Dark energy and the fate of everything — `astro-darkenergy`

    astro-751  Dark energy
    astro-752  The accelerating universe
    astro-753  The supernova evidence for acceleration
    astro-754  The cosmological constant
    astro-755  The cosmological constant problem
    astro-756  Quintessence
    astro-757  The equation of state of dark energy
    astro-758  Measuring dark energy
    astro-759  Dark energy and the geometry of space
    astro-760  The energy budget of the universe
    astro-761  The fate of the universe
    astro-762  Heat death
    astro-763  The Big Rip
    astro-764  The Big Crunch
    astro-765  The far future of the stars
    astro-766  The far future of galaxies
    astro-767  Proton decay and the very far future
    astro-768  The end of observational cosmology
    astro-769  The universe as seen from the far future
    astro-770  Why the fate depends on dark energy

### What cosmology does not know — `astro-open`

    astro-771  The horizon problem
    astro-772  The flatness problem
    astro-773  The monopole problem
    astro-774  The initial singularity
    astro-775  What came before the Big Bang
    astro-776  The multiverse
    astro-777  Eternal inflation
    astro-778  The anthropic principle
    astro-779  Fine-tuning arguments
    astro-780  Quantum gravity and cosmology
    astro-781  String theory in cosmology
    astro-782  Loop quantum cosmology
    astro-783  Cosmic topology
    astro-784  Anomalies in the microwave background
    astro-785  The lithium problem
    astro-786  Tensions in the concordance model
    astro-787  Testing general relativity on cosmic scales
    astro-788  What a cosmological observation can never do
    astro-789  Cosmology as a historical science
    astro-790  Where cosmology is going

## Observing the Universe

### What light carries — `astro-light`

    astro-791  Electromagnetic radiation
    astro-792  The electromagnetic spectrum
    astro-793  Wavelength, frequency and energy
    astro-794  The photon
    astro-795  Blackbody radiation
    astro-796  Wien's law
    astro-797  The Stefan–Boltzmann law
    astro-798  The inverse-square law
    astro-799  Emission and absorption
    astro-800  Spectral lines
    astro-801  Kirchhoff's laws of spectroscopy
    astro-802  The hydrogen spectrum
    astro-803  Ionisation and excitation
    astro-804  The Doppler effect for light
    astro-805  Line broadening
    astro-806  Zeeman splitting
    astro-807  Synchrotron radiation
    astro-808  Bremsstrahlung
    astro-809  Thermal and non-thermal emission
    astro-810  Polarisation of light
    astro-811  Scattering
    astro-812  Opacity
    astro-813  Radiative transfer
    astro-814  What a spectrum tells an astronomer
    astro-815  Reading a spectrum

### Gravity and orbits — `astro-gravity`

    astro-816  Gravity
    astro-817  Newton's law of universal gravitation
    astro-818  Kepler's first law
    astro-819  Kepler's second law
    astro-820  Kepler's third law
    astro-821  Orbital elements
    astro-822  The two-body problem
    astro-823  The three-body problem
    astro-824  Lagrange points
    astro-825  Escape velocity
    astro-826  Orbital energy
    astro-827  Tidal forces
    astro-828  Perturbations
    astro-829  Orbital resonance
    astro-830  The stability of the Solar System
    astro-831  Chaos in orbital dynamics
    astro-832  The centre of mass
    astro-833  Orbital decay
    astro-834  General relativity and gravity
    astro-835  The precession of Mercury's perihelion
    astro-836  Gravitational time dilation
    astro-837  Gravitational lensing
    astro-838  Frame dragging
    astro-839  Testing general relativity in the Solar System
    astro-840  Where Newton is enough

### Telescopes — `astro-telescopes`

    astro-841  Telescope
    astro-842  The refracting telescope
    astro-843  The reflecting telescope
    astro-844  Aperture and light-gathering power
    astro-845  Focal length and magnification
    astro-846  Angular resolution
    astro-847  The diffraction limit
    astro-848  Astronomical seeing
    astro-849  Adaptive optics
    astro-850  Segmented mirrors
    astro-851  Mounts and tracking
    astro-852  Eyepieces and cameras
    astro-853  The photographic plate
    astro-854  CCDs and modern detectors
    astro-855  Quantum efficiency
    astro-856  Signal-to-noise ratio
    astro-857  Exposure and stacking
    astro-858  Filters
    astro-859  The spectrograph
    astro-860  Interferometry
    astro-861  Very-long-baseline interferometry
    astro-862  Observatory sites
    astro-863  Extremely large telescopes
    astro-864  Robotic and survey telescopes
    astro-865  Choosing a telescope for a question

### Across the spectrum — `astro-spectrum`

    astro-866  Multiwavelength astronomy
    astro-867  Radio astronomy
    astro-868  The radio telescope
    astro-869  Radio arrays
    astro-870  Microwave astronomy
    astro-871  Infrared astronomy
    astro-872  Why infrared needs height or space
    astro-873  Ultraviolet astronomy
    astro-874  X-ray astronomy
    astro-875  Grazing-incidence optics
    astro-876  Gamma-ray astronomy
    astro-877  Air-shower detection
    astro-878  The atmospheric windows
    astro-879  What each waveband shows
    astro-880  Combining wavebands on one object
    astro-881  False colour in astronomical images
    astro-882  How an astronomical image is made
    astro-883  Image processing and its limits
    astro-884  Reading a false-colour image honestly
    astro-885  Why nothing in space looks like the pictures

### Observatories and space missions — `astro-missions`

    astro-886  Space observatory
    astro-887  The Hubble Space Telescope
    astro-888  The James Webb Space Telescope
    astro-889  X-ray observatories in orbit
    astro-890  Infrared space telescopes
    astro-891  Gaia
    astro-892  The microwave background satellites
    astro-893  Planetary flyby missions
    astro-894  Orbiters
    astro-895  Landers and rovers
    astro-896  Sample-return missions
    astro-897  The Voyager missions
    astro-898  Cassini–Huygens
    astro-899  The Apollo landings as science
    astro-900  Solar missions
    astro-901  Ground-based observatories of note
    astro-902  Radio observatories of note
    astro-903  Mission planning and cost
    astro-904  Why missions take decades
    astro-905  What is being built now

### Beyond light — `astro-messengers`

    astro-906  Multi-messenger astronomy
    astro-907  Cosmic rays
    astro-908  The origin of cosmic rays
    astro-909  The highest-energy cosmic rays
    astro-910  Neutrino astronomy
    astro-911  IceCube
    astro-912  Neutrinos from Supernova 1987A
    astro-913  Gravitational waves
    astro-914  LIGO and Virgo
    astro-915  The first gravitational-wave detection
    astro-916  GW170817 seen two ways
    astro-917  Pulsar timing arrays
    astro-918  The gravitational-wave background
    astro-919  Future gravitational-wave detectors
    astro-920  What a second messenger buys

## The History of Astronomy

### Ancient and medieval astronomy — `astro-ancient`

    astro-921  Astronomy before writing
    astro-922  Babylonian astronomy
    astro-923  The Babylonian planetary tables
    astro-924  Egyptian astronomy
    astro-925  Archaeoastronomy
    astro-926  Greek astronomy
    astro-927  The Greek geocentric model
    astro-928  Measuring the size of the Earth
    astro-929  Hipparchus
    astro-930  Ptolemy and the Almagest
    astro-931  Epicycles and deferents
    astro-932  Chinese astronomical records
    astro-933  Chinese observations of transient events
    astro-934  Indian astronomy
    astro-935  Islamic astronomy
    astro-936  The astrolabe
    astro-937  Observatories of the Islamic world
    astro-938  The Maragha criticism of Ptolemy
    astro-939  Ulugh Beg
    astro-940  Mesoamerican astronomy
    astro-941  Medieval European astronomy
    astro-942  Navigation and the stars
    astro-943  The armillary sphere
    astro-944  Star catalogues before the telescope
    astro-945  What pre-telescopic astronomy achieved

### The Copernican revolution — `astro-revolution`

    astro-946  The Copernican revolution
    astro-947  Copernicus
    astro-948  De revolutionibus
    astro-949  What Copernicus did not settle
    astro-950  Tycho Brahe
    astro-951  Tycho's observations
    astro-952  The Tychonic system
    astro-953  Johannes Kepler
    astro-954  How Kepler found the ellipse
    astro-955  Galileo
    astro-956  Galileo's telescope
    astro-957  What Galileo saw
    astro-958  The phases of Venus as evidence
    astro-959  The trial of Galileo
    astro-960  Isaac Newton
    astro-961  The Principia
    astro-962  Universal gravitation as a unification
    astro-963  The return of Halley's Comet
    astro-964  Measuring the astronomical unit
    astro-965  The aberration of starlight

### The making of modern astrophysics — `astro-modern`

    astro-966  The rise of astrophysics
    astro-967  Spectroscopy and the composition of stars
    astro-968  Fraunhofer lines
    astro-969  The discovery of helium
    astro-970  Photography in astronomy
    astro-971  The Harvard computers
    astro-972  Annie Jump Cannon and stellar classification
    astro-973  Cecilia Payne and what stars are made of
    astro-974  Henrietta Swan Leavitt
    astro-975  The Great Debate
    astro-976  Hubble and the nature of the nebulae
    astro-977  The discovery of the expansion
    astro-978  Lemaître and the primeval atom
    astro-979  The steady-state theory
    astro-980  How the Big Bang won
    astro-981  The beginnings of radio astronomy
    astro-982  The space age
    astro-983  The accidental discovery of the microwave background
    astro-984  Astronomy's computing revolution
    astro-985  How astrophysics became a physics

### Astronomy now — `astro-today`

    astro-986  Who does astronomy
    astro-987  How telescope time is allocated
    astro-988  Open data in astronomy
    astro-989  Big surveys and the data problem
    astro-990  Machine learning in astronomy
    astro-991  Citizen science in astronomy
    astro-992  Amateur discoveries
    astro-993  Astronomy and the public
    astro-994  Naming things in astronomy
    astro-995  The International Astronomical Union
    astro-996  Protecting the night sky
    astro-997  Satellite constellations and astronomy
    astro-998  Indigenous sky knowledge and modern observatories
    astro-999  Why astronomy matters
    astro-1000  Where astronomy is going
