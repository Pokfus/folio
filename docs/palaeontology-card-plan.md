# Palaeontology — a 1000-card running order

The plan for `paleo`, the collection that **replaces Dinosaurs** (2026-11-12, on request: "Make the
collection on Dinosaurs dormant. Instead, plan a 1000 card collection on Paleontology (covering the
field of science broadly rather than focused on dinosaurs). We can reuse most of the cards from the
current dinosaurs collection in their correct places in the new Paleontology."). Every card's number,
topic and deck is fixed in advance so the collection can be grown one card at a time over many sessions.

Read `docs/greece-card-plan.md` first if this is the first plan you have met; the mechanics are identical
and are not repeated here. **`docs/dinosaurs-card-plan.md` is DORMANT** and is kept as the reading list
for the dinosaur decks below: its scope rules, its corrections and its sourcing notes still apply to
every card in *The Age of Reptiles*.

---

## How to use this (the whole point of the file)

**The next card to write is the lowest `pal-NNN` not yet in `data.js`** — `node .claude/next-cards.js pal- 5`
prints it with its deck id. **All 100 Dinosaurs cards were renumbered into this plan** (the table at the
foot of this file), so the written cards are scattered rather than a run from `pal-001`: the next card is
`pal-001` itself, and the reused numbers are simply skipped as the work reaches them.

    node .claude/add-card.js <card.json> <deckId>

**Always pass the deck id.** Without one `add-card.js` falls back to the first leaf in the whole tree,
which is in China.

There is deliberately **no progress file**: `data.js` says what exists and this file says what is planned.
The ids are `pal-001` … `pal-999`, then `pal-1000`.

## What a line in this list is, and is not

A line is a **subject to research**, not a fact to assert and not necessarily the finished answer term.
`pal-706 Stegosaurs` is already an answer term; `pal-920 Impact against volcanism` is an argument to
describe, and the card's answer is chosen while writing it, from what the sources will support. When
research says a line is wrong — a genus sunk, a site redated, a claim withdrawn — change the line here in
the same commit as the card, and say so. Never write a card to fill a slot.

## What this collection is, and why it replaced Dinosaurs

**It is palaeontology as a science: the history of life read from the rocks, and how that reading is
done.** Dinosaurs was the narrowest subject on the shelf, and its own plan said a thousand cards were
defensible only because three quarters of it was not about Dinosauria. Palaeontology is that widening
taken to its end: four billion years instead of 186 million, every kingdom that fossilises instead of one
clade, and the dinosaurs as one deck among ten — the largest, because they are what brings most readers
to the subject, but a deck rather than the shelf.

**A minority of the thousand name a taxon** (a clade, a genus or a group); most are methods,
processes, sites, events, environments and the history of the discipline. That proportion is the
argument: **1000 cards of genera would be a bestiary**, and a reader who memorised it would know names
and nothing about how a fossil becomes evidence.

**The method deck comes first, not last.** Dinosaurs put *Finding and Knowing* at the end; here *The
Science of Palaeontology* and *Fossils and the Rock Record* open the collection, because every later card
is an inference from a fossil and its rock, and the reader should meet the inference before its results.
The reused naming and dating cards happen to be exactly that deck's spine.

## Making the collection

**The id is `paleo` and the card prefix is `pal-`**, free of every existing prefix and no prefix of any
of them. The deck ids are `pal-<word>`, the pattern `bio` and `dino` used; a deck id never collides with a
card id because a card's suffix is digits.

**The title is *Palaeontology*, in the house's British spelling**; `spellTree`'s `palaeo → paleo` pair
already shows an American reader *Paleontology*, which is how the request spelled it.

**It goes in the `Science` section** (`COLLECTION_SECTION`), takes **Dinosaurs' hue `#967B00`** — free
again now that Dinosaurs is dormant, and the colour of amber and of prepared fossil bone, which fits the
wider subject better than the narrower one — and **Dinosaurs' `sauropod` mark** in `COLLECTION_ICON`.
A mark of its own (an ammonite is the field's usual emblem) is a later, separate change; the sauropod
reads correctly meanwhile because the dinosaurs are its largest deck.

## Dinosaurs is dormant — what that means

**Dormant, not deleted.** The `dino` node is out of `COLLECTION_TREE`, so nothing draws, deals or counts it,
and its plan, `docs/dinosaurs-card-plan.md`, stays in `docs/` with a dormant notice at its head. Its 100
written cards are not lost: **they are the 100 reused slots below**, renumbered, in their new decks. Its
`COLL_THEME`, `COLLECTION_ICON`, `COLLECTION_SECTION` and `COLLECTION_TARGET` rows moved to `paleo`.

**Reviving it** would mean putting the node back (`git show` the tree from the commit before this one) and
deciding which cards it shares with this collection — a card lives in one place in the tree, so the two
cannot both own `pal-656`.

**A reader's study history followed the cards.** `migrateDinoIds` in `app.js` rewrites every `dino-NNN`
card id and every Dinosaurs deck id in the saved progress to its new id, once, at boot and whenever a
progress record is adopted from the cloud (so an old record synced from another device is caught too). The
table it uses is the appendix of this file, and the two must not drift: see the appendix's note.

## The scope decisions

**First: the evidence and its limits are the subject, as they were in Dinosaurs.** Every scope rule of
`docs/dinosaurs-card-plan.md` carries over and widens: a card on a familiar animal states what is now
thought and what changed; speculation is labelled; a superlative carries its estimate, method and range;
a genus states its taxonomic standing. **A card may say "unknown". It may not say something vivid
instead.** That rule binds hardest in *Early Life*, where `pal-217 The Apex chert controversy` and
`pal-247 The Ediacaran biota` are fields in which the reading of a single specimen is still argued.

**Second: the Precambrian is carded as a real deck, not a preface.** Most of the history of life is
microbial, and a palaeontology collection that began at the Cambrian would be repeating the error the
field spent the twentieth century correcting. Fifty-five cards go to the time before animals — the oldest
evidence of life, its disputes, oxygen, the eukaryotes and the Ediacaran — and they are written to the
standard of the rest: what is preserved, and what the claim rests on.

**Third: invertebrates and microfossils are where most of the fossil record is.** The popular subject is
vertebrates; the working science is overwhelmingly shells, plankton and pollen, because they are what the
rocks hold in numbers, what dates the rocks, and what the oil industry and the climate record are built
on. *Invertebrates and Microfossils* (105) and *Plants Through Time* (80) together outweigh the dinosaurs,
and that is the point of the replacement.

**Fourth: human evolution is carded from the fossils only, and briefly.** World History's
`wh-evolution` already carries the hominins as human history. *Primates and human origins* is 25 cards on
the fossil evidence and its disputes — the specimens, the sites, the dating rows and Piltdown — and
deliberately avoids re-carding the species World History has (see "Living beside the other collections").

**Fifth: the history deck is about how the science was made.** Thirty cards, from fossils in antiquity to
the colonial history of collecting, plus twenty on palaeontology in public — museums, palaeoart, film,
fakes, the trade and parachute science. Jurassic Park is carded as culture there and corrected as science
on the animals, exactly as the Dinosaurs plan ruled.

## Allocation

| Deck | Subdeck | Cards | Range | Reused |
|---|---|---|---|---|
| The Science of Palaeontology | What palaeontology is | 20 | pal-001–020 | 2 |
|   | Naming and classifying fossils | 30 | pal-021–050 | 20 |
|   | Deep time | 25 | pal-051–075 | 9 |
|   | Dating rocks and fossils | 25 | pal-076–100 | 7 |
| Fossils and the Rock Record | How fossils form | 25 | pal-101–125 |  |
|   | Exceptional fossil sites | 25 | pal-126–150 | 5 |
|   | Trace fossils | 20 | pal-151–170 |  |
|   | Finding and preparing fossils | 20 | pal-171–190 |  |
|   | Studying a fossil | 20 | pal-191–210 | 3 |
| Early Life | The earliest life | 20 | pal-211–230 |  |
|   | Eukaryotes and the boring billion | 15 | pal-231–245 |  |
|   | The Ediacaran biota | 20 | pal-246–265 |  |
|   | The Cambrian explosion | 25 | pal-266–290 |  |
|   | The Palaeozoic seas | 20 | pal-291–310 |  |
| Invertebrates and Microfossils | Trilobites and other arthropods | 20 | pal-311–330 |  |
|   | Insects | 15 | pal-331–345 |  |
|   | Molluscs | 25 | pal-346–370 |  |
|   | Shells, spines and reefs | 25 | pal-371–395 |  |
|   | Microfossils | 20 | pal-396–415 |  |
| Plants Through Time | Plants move onto land | 20 | pal-416–435 |  |
|   | Coal forests and seed plants | 20 | pal-436–455 |  |
|   | Mesozoic plants | 20 | pal-456–475 |  |
|   | The Cenozoic green world | 20 | pal-476–495 |  |
| Fishes and the Move onto Land | The first vertebrates | 20 | pal-496–515 |  |
|   | The age of fishes | 20 | pal-516–535 |  |
|   | From fins to limbs | 20 | pal-536–555 |  |
|   | Amphibians and early amniotes | 20 | pal-556–575 |  |
|   | Synapsids | 20 | pal-576–595 | 1 |
| The Age of Reptiles | The Triassic world | 20 | pal-596–615 | 3 |
|   | Seas and skies | 20 | pal-616–635 | 3 |
|   | What a dinosaur is | 20 | pal-636–655 | 14 |
|   | Dinosaur anatomy | 30 | pal-656–685 | 30 |
|   | The dinosaur groups | 30 | pal-686–715 |  |
|   | Dinosaur lives | 15 | pal-716–730 |  |
|   | The origin of birds | 15 | pal-731–745 | 1 |
| The Age of Mammals | The first mammals | 20 | pal-746–765 |  |
|   | The Cenozoic world | 20 | pal-766–785 |  |
|   | Mammal radiations | 25 | pal-786–810 |  |
|   | The Ice Age | 25 | pal-811–835 |  |
|   | Primates and human origins | 25 | pal-836–860 |  |
| Extinction and Evolution | Patterns in the history of life | 20 | pal-861–880 |  |
|   | Mass extinctions | 30 | pal-881–910 |  |
|   | The end of the Cretaceous | 20 | pal-911–930 |  |
|   | Ancient climates and geography | 20 | pal-931–950 | 2 |
| Palaeontology and People | The history of palaeontology | 30 | pal-951–980 |  |
|   | Palaeontology in public | 20 | pal-981–1000 |  |

Deck totals: The Science of Palaeontology 100 · Fossils and the Rock Record 110 · Early Life 100 · Invertebrates and Microfossils 105 · Plants Through Time 80 · Fishes and the Move onto Land 100 · The Age of Reptiles 150 · The Age of Mammals 115 · Extinction and Evolution 90 · Palaeontology and People 50. **1000.**

## What the weighting is arguing

**The Age of Reptiles takes 150 — the largest deck, and 51 of its slots were Dinosaurs' cards.** Most of
it is already written: the definition of a dinosaur and its anatomy came across whole. The new half is the
groups (30), their biology (15), the Triassic and the seas and skies around them. **That is a
fifth of the old collection's ambition for the same animals**, and the cut is the point: a genus now
earns a slot only by being the best-known example of its group, or by having overturned something.

**Dinosaur anatomy keeps all 30 of its reused cards, which is generous for a survey**, and it is kept
deliberately rather than by inertia: those cards are where this collection teaches reading a skeleton —
pneumaticity, the braincase, the senses from bone — and the anatomy of every other vertebrate deck leans
on them rather than repeating them.

**Fossils and the Rock Record takes 110 and is the deck a reader should be sent to second.** Taphonomy,
the great fossil sites, trace fossils, fieldwork and the laboratory are what make the other eight decks
possible; a reader who has them can judge a claim about any fossil.

**The Age of Mammals takes 115, Fishes and the Move onto Land 100.** The vertebrate story from the first
jawless fishes to the Ice Age is the backbone of the popular subject and is carded at survey depth: one
card a group, a card a famous transition, and the transitions — fins to limbs, the synapsid jaw, whales
returning to water — get runs of their own because they are where the fossil record answers a question.

**Extinction and Evolution takes 90, and 30 are the mass extinctions** besides the end-Cretaceous.
Dinosaurs carded one extinction in depth; here all five, the lesser crises and the debate about the
present one are the subject, because comparing them is what the field actually does.

**Palaeontology and People takes 50 — the smallest deck.** It is history and culture rather than
science, and the no-researchers rule (below) exempts it for that reason, so it is kept short.

## Decisions this plan forced on the tree

**A reused card went where its SUBJECT belongs, not where its example lives.** `pal-021` to `pal-050`, the
naming and classifying cards, are illustrated with dinosaurs — *Tyrannosaurus rex*'s holotype, the
Brontosaurus question — and sit in the general deck all the same, because what they teach is the
nomenclature. The same rule put Dimetrodon with the synapsids (`pal-579`), the pterosaur, plesiosaur and
mosasaur cards in *Seas and skies*, the femur-and-mass card and bone histology in the laboratory, and the
diapsid and antorbital-fenestra cards in the Triassic, beside the archosaurs they define.

**A reused card's wording is NOT rewritten by the move.** A card asked about dinosaurs in Dinosaurs and it
still does; nothing in a renumbering justifies touching cited prose. Where a card's dinosaur framing reads
oddly in its new deck, rewrite it later as an ordinary content edit with `add-card.js --replace`, on its
own evidence, and never as part of a move.

**The geological periods are one run in deck 1** (`pal-064` to `pal-075`), all twelve Phanerozoic periods
together, because the three Mesozoic ones were already written and splitting the twelve across the decks
that need them would scatter the timescale a reader has to learn as one thing. The Cenozoic EPOCHS are in
*The Cenozoic world* (`pal-766`–`772`), where the finer division is the subject.

**Pterosaurs and marine reptiles share one subdeck.** Twenty cards for both is thin by Dinosaurs'
standard and right by this collection's: they are the two groups readers mistake for dinosaurs, and the
cards that say why are the reused `pal-622`, `pal-625` and `pal-628`.

**There is no "famous fossils" deck.** Lucy, Sue, Archaeopteryx and the Burgess Shale are carded inside the
subject each is evidence for.

**`pal-1000` is "Where palaeontology is going"**, the ending every science plan on the shelf uses.

## Evidence, not spectacle

The Dinosaurs plan's four pulls — superlatives, the vivid reconstruction, stale popular science and
taxonomic overconfidence — are this collection's too, and its "Evidence, not spectacle" section is the
standing reference. Two more pulls are specific to the wider subject:

**The oldest-claim.** "The oldest animal", "the earliest life", "the first land plant" are claims about
the edge of the record, where the evidence is thinnest and most contested. **Give the claim, its date, who
disputes it and on what grounds.** `pal-211`, `pal-214`, `pal-216` and `pal-217` are each a case.

**The living fossil.** `pal-326` cards the idea itself; elsewhere a card never calls an animal one as
though that settled anything. Coelacanths, horseshoe crabs, *Lingula* and the Wollemi pine have each
evolved since their fossils were laid down.

## The no-researchers rule, with the history deck exempt

**As in `bio` and `dino`, this collection follows the no-researchers rule**: a question clues from the
fossil or the evidence, not from who published it. **`pal-history` is exempt entirely**, because there the
answer IS a person or their work; so are the cards whose answer is a named hypothesis or a dispute
(`pal-915 The Alvarez hypothesis`, `pal-858 The KBS Tuff dispute`, `pal-943 Wegener's fossil evidence`).
The historiography cap binds everywhere else.

## Names, dates and figures

**Exactly the Dinosaurs plan's rules** ("Names, dates and figures" there): genus and binomial italic, clade
names plain; geological dates as Mya spans that `cardYears` reads, with an age name in words beside the
numbers; masses and sizes with method and uncertainty; a single-specimen figure says so.

**Two additions for the deep end.** Ages older than the Phanerozoic are given in **millions or billions of
years ago, written as Mya** (`c. 3,480 Mya` rather than `3.48 Ga`) so that date lines read alike from the
Archean to the Ice Age — `cardYears` parses both, the reader should not have to convert — and an Ediacaran or Precambrian
fossil's **affinity is stated as a hypothesis**: *Dickinsonia* is "interpreted as an early animal", with
the evidence, rather than "was an animal".

## Sourcing

The Dinosaurs plan's open routes (PeerJ, PLOS ONE, *Acta Palaeontologica Polonica*, *Palaeontologia
Electronica*, *Scientific Reports*, the Paleobiology Database, museum catalogues, the ICZN) serve the whole
field. Add the **International Commission on Stratigraphy** (`stratigraphy.org`) for every boundary,
period and GSSP card — the chart's own dates are the house figures, and the year of the chart edition
cited must be given — and museum and society overviews (the University of California Museum of
Paleontology among them) for group-level orientation, followed to the primary papers they cite. For the history deck,
the Dinosaurs plan's rule stands: the primary account where it is open, a museum or society history where
it is not, and never a popular book alone.

**One hazard grows with the subject: the press release about the oldest something.** It is the commonest
palaeontology story and the one most often revised. Follow the DOI, and check for a reply paper.

## Living beside the other collections

**Biology is the main neighbour.** Its `bio-evolution` deck carries the evolutionary machinery and a few
history-of-life cards: `bio-342` the fossil record as evidence, `bio-343` transitional fossils, `bio-363`
Cuvier and extinction, `bio-417` the geological timescale, `bio-418` mass extinctions, `bio-419` the
Cambrian explosion, `bio-420` the colonisation of land, `bio-422` the origin of life and `bio-425` what
fossils can and cannot tell us. **Each has a counterpart here** (`pal-017`, `pal-862`, `pal-955`, `pal-052`,
`pal-881`, `pal-266`, `pal-416`, `pal-227`, `pal-016`), and they are written as pairs: Biology's card is the
idea in a survey of biology, this collection's is the evidence in a survey of the fossil record. The
answers may coincide; the clues must not. `pal-052` and the old `dino-088` are the same card, so that pair
already exists.

**World History's `wh-evolution` owns the hominins.** Australopithecus, the *Homo* species, Turkana Boy,
Olduvai, the Neanderthals, the Denisovans, *Homo floresiensis* and *Homo naledi* are World History cards;
*Primates and human origins* carries the primates before them and the specimens and disputes World History
does not card (Lucy, Ardi, the Taung Child, the Black Skull, the KBS Tuff, Piltdown). **Check `wh-` for the
species before writing any hominin card here.**

**Glossary.** The Dinosaurs plan's five existing terms (`Amber`, `Stratum`, `Stratigraphy`,
`Geological_epoch`, `Genus`) still apply; reuse them. **Key extinction terms narrowly** (`End-Permian
extinction`, not `Extinction`), the three-way collision that plan warned of now being a four-way one.
Check `GLOSSARY` before keying any genus or site — Biology, World History and the old Dinosaurs cards may
have reached it first.

# The list

## The Science of Palaeontology

### What palaeontology is — `pal-what`

    pal-001  Palaeontology
    pal-002  Fossil
    pal-003  Body fossils and trace fossils
    pal-004  Vertebrate palaeontology
    pal-005  Invertebrate palaeontology
    pal-006  Palaeobotany
    pal-007  Micropalaeontology
    pal-008  Palaeoanthropology
    pal-009  Palaeontology and archaeology are different sciences
    pal-010  Palaeobiology
    pal-011  Palaeoecology
    pal-012  Uniformitarianism
    pal-013  Actualism: the living as a key to the dead
    pal-014  Comparative anatomy
    pal-015  Extant phylogenetic bracketing
    pal-016  What a fossil can and cannot tell us
    pal-017  The fossil record
    pal-018  Pseudofossils
    pal-019  The Paleobiology Database
    pal-020  Estimating how many species have ever lived

### Naming and classifying fossils — `pal-classify`

    pal-021  Linnaean taxonomy
    pal-022  Binomial nomenclature
    pal-023  The specific name
    pal-024  The International Code of Zoological Nomenclature
    pal-025  The holotype
    pal-026  Paratypes, lectotypes and neotypes
    pal-027  Nomen dubium
    pal-028  Junior synonyms
    pal-029  The principle of priority
    pal-030  The Brontosaurus question
    pal-031  Phylogenetic trees
    pal-032  Cladistics in palaeontology
    pal-033  Reading a cladogram
    pal-034  Synapomorphy
    pal-035  The character matrix
    pal-036  Monophyletic, paraphyletic and polyphyletic groups
    pal-037  Crown groups and stem groups
    pal-038  Parsimony
    pal-039  Bayesian tip-dating
    pal-040  The molecular clock and the fossil record
    pal-041  Ghost lineages
    pal-042  Lazarus taxa
    pal-043  Convergent evolution
    pal-044  Growth changes mistaken for species
    pal-045  Nanotyrannus and the juvenile problem
    pal-046  Chronospecies
    pal-047  Sexual dimorphism in fossils
    pal-048  Intraspecific variation
    pal-049  Sample size
    pal-050  Form taxa and parataxonomy

### Deep time — `pal-deeptime`

    pal-051  Deep time
    pal-052  The geological timescale
    pal-053  Chronostratigraphy
    pal-054  The Global Boundary Stratotype Section and Point
    pal-055  The International Commission on Stratigraphy
    pal-056  Eons, eras, periods, epochs and ages
    pal-057  The Hadean
    pal-058  The Archean
    pal-059  The Proterozoic
    pal-060  The Phanerozoic
    pal-061  The Palaeozoic
    pal-062  The Mesozoic
    pal-063  The Cenozoic
    pal-064  The Cambrian Period
    pal-065  The Ordovician
    pal-066  The Silurian
    pal-067  The Devonian
    pal-068  The Carboniferous
    pal-069  The Permian
    pal-070  The Triassic
    pal-071  The Jurassic
    pal-072  The Cretaceous
    pal-073  The Palaeogene
    pal-074  The Neogene
    pal-075  The Quaternary

### Dating rocks and fossils — `pal-dating`

    pal-076  Relative dating
    pal-077  The law of superposition
    pal-078  Original horizontality
    pal-079  Cross-cutting relationships
    pal-080  Unconformities
    pal-081  The principle of faunal succession
    pal-082  Biostratigraphy
    pal-083  Index fossils
    pal-084  Correlation between distant rocks
    pal-085  Lithostratigraphy
    pal-086  The geological formation
    pal-087  Radiometric dating
    pal-088  Half-life
    pal-089  Uranium–lead dating
    pal-090  Zircon
    pal-091  Argon–argon dating
    pal-092  Potassium–argon dating
    pal-093  Radiocarbon dating and its limits
    pal-094  Magnetostratigraphy
    pal-095  Tephrochronology
    pal-096  Chemostratigraphy
    pal-097  Astrochronology
    pal-098  Bracketing a fossil's age between dated layers
    pal-099  Luminescence dating
    pal-100  Electron spin resonance dating

## Fossils and the Rock Record

### How fossils form — `pal-taphonomy`

    pal-101  Taphonomy
    pal-102  Decay and disarticulation
    pal-103  Rapid burial
    pal-104  Permineralisation
    pal-105  Petrified wood
    pal-106  Replacement
    pal-107  Moulds and casts
    pal-108  Compression and carbonisation
    pal-109  Pyritisation
    pal-110  Phosphatisation
    pal-111  Burgess Shale-type preservation
    pal-112  Amber
    pal-113  Frozen remains in permafrost
    pal-114  Asphalt seeps
    pal-115  Natural mummification
    pal-116  Subfossils
    pal-117  Taphonomic experiments
    pal-118  Preservation potential
    pal-119  Time-averaging
    pal-120  Bias in the fossil record
    pal-121  The Signor–Lipps effect
    pal-122  The pull of the Recent
    pal-123  Biomineralisation and hard parts
    pal-124  Original soft tissue and proteins in fossils
    pal-125  Why DNA does not survive from deep time

### Exceptional fossil sites — `pal-sites`

    pal-126  Lagerstätte
    pal-127  Konservat- and Konzentrat-Lagerstätten
    pal-128  Bone beds
    pal-129  The Rhynie chert
    pal-130  The Hunsrück Slate
    pal-131  Mazon Creek
    pal-132  The Bear Gulch Limestone
    pal-133  Holzmaden and the Posidonia Shale
    pal-134  The Solnhofen Limestone
    pal-135  The Yixian Formation
    pal-136  The Jehol Biota
    pal-137  The Crato and Santana formations
    pal-138  Burmese amber and the ethics of collecting it
    pal-139  Baltic amber
    pal-140  The Messel Pit
    pal-141  The Green River Formation
    pal-142  Monte Bolca
    pal-143  Ashfall Fossil Beds
    pal-144  Rancho La Brea
    pal-145  The Morrison Formation
    pal-146  The Hell Creek Formation
    pal-147  The Djadochta Formation
    pal-148  The Karoo Basin
    pal-149  Dinosaur Provincial Park
    pal-150  Las Hoyas

### Trace fossils — `pal-traces`

    pal-151  Ichnology
    pal-152  Ichnotaxa
    pal-153  Trackways
    pal-154  Reading speed from a trackway
    pal-155  Burrows
    pal-156  Borings
    pal-157  Bioturbation
    pal-158  Ichnofacies
    pal-159  Coprolites
    pal-160  Gastroliths
    pal-161  Bite and tooth marks
    pal-162  Fossil eggs
    pal-163  Fossil nests
    pal-164  Root traces
    pal-165  Microbially induced sedimentary structures
    pal-166  Treptichnus pedum and the base of the Cambrian
    pal-167  Cruziana and Rusophycus
    pal-168  Climactichnites
    pal-169  Megatracksites
    pal-170  Regurgitalites

### Finding and preparing fossils — `pal-field`

    pal-171  Prospecting for fossils
    pal-172  Why fossils are found in sedimentary rock
    pal-173  Badlands and erosion
    pal-174  Geological maps in fossil hunting
    pal-175  The field jacket
    pal-176  Quarry maps
    pal-177  Screen-washing
    pal-178  Fossil preparation
    pal-179  Mechanical preparation and the air scribe
    pal-180  Acid preparation
    pal-181  Consolidants and conservation
    pal-182  Casts and replicas
    pal-183  Mounted skeletons
    pal-184  Museum collections and specimen numbers
    pal-185  Pyrite decay in collections
    pal-186  Fossil collecting law
    pal-187  The commercial fossil trade
    pal-188  The Sue specimen dispute
    pal-189  Repatriation of fossils
    pal-190  Amateur collectors and citizen science

### Studying a fossil — `pal-lab`

    pal-191  Computed tomography
    pal-192  Synchrotron imaging
    pal-193  Scanning electron microscopy
    pal-194  Thin sections
    pal-195  Bone histology
    pal-196  Lines of arrested growth
    pal-197  Stable isotope analysis
    pal-198  Clumped isotope thermometry
    pal-199  Geometric morphometrics
    pal-200  Finite element analysis
    pal-201  Biomechanical modelling
    pal-202  The femur and body-mass estimates
    pal-203  Photogrammetry and digital fossils
    pal-204  Melanosomes and fossil colour
    pal-205  Palaeoproteomics
    pal-206  Ancient DNA
    pal-207  Endocasts and fossil brains
    pal-208  Phylogenetic comparative methods
    pal-209  Muscle scars and soft-tissue reconstruction
    pal-210  Describing a new species

## Early Life

### The earliest life — `pal-origins`

    pal-211  The Jack Hills zircons
    pal-212  The oldest rocks
    pal-213  The Isua greenstone belt
    pal-214  The earliest evidence of life
    pal-215  Stromatolites
    pal-216  The Strelley Pool stromatolites
    pal-217  The Apex chert controversy
    pal-218  Microfossils
    pal-219  Biosignatures
    pal-220  Carbon isotopes as evidence of life
    pal-221  Cyanobacteria
    pal-222  The Great Oxidation Event
    pal-223  Banded iron formations
    pal-224  The Gunflint chert
    pal-225  Living stromatolites at Shark Bay
    pal-226  The last universal common ancestor
    pal-227  Hydrothermal vents and the origin of life
    pal-228  Thrombolites
    pal-229  The Lomagundi–Jatuli event
    pal-230  The decline of stromatolites

### Eukaryotes and the boring billion — `pal-eukaryotes`

    pal-231  The origin of eukaryotes in the fossil record
    pal-232  Acritarchs
    pal-233  Grypania
    pal-234  The Francevillian fossils
    pal-235  The boring billion
    pal-236  Bangiomorpha and the oldest known sex
    pal-237  The first multicellular life
    pal-238  Vase-shaped microfossils
    pal-239  Snowball Earth
    pal-240  The Cryogenian
    pal-241  Sponge biomarkers
    pal-242  The Doushantuo Formation
    pal-243  The Neoproterozoic Oxygenation Event
    pal-244  Steroid biomarkers and early eukaryotes
    pal-245  The Tonian

### The Ediacaran biota — `pal-ediacaran`

    pal-246  The Ediacaran Period
    pal-247  The Ediacaran biota
    pal-248  The Ediacara Hills
    pal-249  Mistaken Point
    pal-250  Charnia
    pal-251  Dickinsonia
    pal-252  Dickinsonia and cholesterol
    pal-253  Spriggina
    pal-254  Kimberella
    pal-255  Tribrachidium
    pal-256  Rangeomorphs
    pal-257  Funisia
    pal-258  Cloudina and the first skeletons
    pal-259  Namacalathus
    pal-260  The Avalon, White Sea and Nama assemblages
    pal-261  Microbial mats and the Ediacaran seafloor
    pal-262  The Garden of Ediacara
    pal-263  Vendobionta
    pal-264  Ediacaran trace fossils
    pal-265  The end of the Ediacaran biota

### The Cambrian explosion — `pal-cambrian`

    pal-266  The Cambrian explosion
    pal-267  The small shelly fauna
    pal-268  Archaeocyathids
    pal-269  The Burgess Shale
    pal-270  The Chengjiang biota
    pal-271  Sirius Passet
    pal-272  The Emu Bay Shale
    pal-273  Anomalocaris
    pal-274  Opabinia
    pal-275  Hallucigenia
    pal-276  Wiwaxia
    pal-277  Marrella
    pal-278  Pikaia
    pal-279  Haikouichthys
    pal-280  Lobopodians
    pal-281  Kerygmachela
    pal-282  Radiodonts
    pal-283  Fuxianhuia and the arthropod brain
    pal-284  Vetulicolians
    pal-285  Body plans and phyla
    pal-286  The Tommotian
    pal-287  Darwin's dilemma
    pal-288  The Cambrian substrate revolution
    pal-289  Causes of the Cambrian explosion
    pal-290  Wonderful Life and the disparity debate

### The Palaeozoic seas — `pal-pzseas`

    pal-291  The Great Ordovician Biodiversification Event
    pal-292  The Fezouata biota
    pal-293  Graptolites
    pal-294  Nautiloids
    pal-295  Endocerids
    pal-296  Eurypterids
    pal-297  Conodonts
    pal-298  The conodont animal
    pal-299  Hyoliths
    pal-300  Tabulate corals
    pal-301  Rugose corals
    pal-302  Stromatoporoids
    pal-303  Crinoids
    pal-304  Blastoids
    pal-305  Palaeozoic reefs
    pal-306  The Wenlock Limestone
    pal-307  The Soom Shale
    pal-308  The Herefordshire Lagerstätte
    pal-309  The Palaeozoic evolutionary fauna
    pal-310  Sepkoski's three evolutionary faunas

## Invertebrates and Microfossils

### Trilobites and other arthropods — `pal-arthropods`

    pal-311  Trilobites
    pal-312  Trilobite anatomy
    pal-313  Trilobite eyes
    pal-314  Trilobite moulting
    pal-315  Enrolment in trilobites
    pal-316  Agnostids
    pal-317  Phacops
    pal-318  Paradoxides
    pal-319  Elrathia kingii
    pal-320  Walliserops
    pal-321  The decline of the trilobites
    pal-322  Chelicerates
    pal-323  Early arachnids
    pal-324  Fossil spiders
    pal-325  Horseshoe crabs
    pal-326  The idea of a living fossil
    pal-327  The first land arthropods
    pal-328  Pneumodesmus
    pal-329  Arthropleura
    pal-330  Crustaceans in the fossil record

### Insects — `pal-insects`

    pal-331  Rhyniognatha and the oldest insects
    pal-332  The origin of insect flight
    pal-333  Meganeura and the Palaeozoic giant insects
    pal-334  Oxygen and giant insects
    pal-335  Palaeodictyopterans
    pal-336  The rise of the beetles
    pal-337  Insects and flowering plants
    pal-338  The origin of butterflies and moths
    pal-339  Social insects in the fossil record
    pal-340  The oldest ants
    pal-341  Fossil bees
    pal-342  The Florissant Fossil Beds
    pal-343  Insects at the end-Permian
    pal-344  Insect damage on fossil leaves
    pal-345  Parasites in the fossil record

### Molluscs — `pal-molluscs`

    pal-346  Molluscs in the fossil record
    pal-347  The earliest molluscs
    pal-348  Cephalopods
    pal-349  The nautilus
    pal-350  Ammonoids
    pal-351  Ammonite sutures
    pal-352  Goniatites
    pal-353  Ceratites
    pal-354  Ammonites as index fossils
    pal-355  Heteromorph ammonites
    pal-356  Macroconchs and microconchs
    pal-357  Ammonite buoyancy and swimming
    pal-358  Baculites
    pal-359  The ammonites' end
    pal-360  Belemnites
    pal-361  Fossil squid ink
    pal-362  Bivalves
    pal-363  Rudists
    pal-364  Inoceramids
    pal-365  Gryphaea
    pal-366  Gastropods
    pal-367  Tusk shells
    pal-368  Predatory drill holes
    pal-369  The Mesozoic marine revolution
    pal-370  Snakestones and ammonite folklore

### Shells, spines and reefs — `pal-shelly`

    pal-371  Brachiopods
    pal-372  Brachiopods and bivalves compared
    pal-373  Lingula
    pal-374  Spiriferids
    pal-375  Productids
    pal-376  Echinoderms
    pal-377  Stereom
    pal-378  Sea urchins in the fossil record
    pal-379  Shepherd's crowns
    pal-380  Starfish and brittle stars
    pal-381  Carpoids
    pal-382  Helicoplacus
    pal-383  Edrioasteroids
    pal-384  Cystoids
    pal-385  Sponges in the fossil record
    pal-386  Glass sponge reefs
    pal-387  Scleractinian corals
    pal-388  Coral growth bands and the length of the day
    pal-389  Bryozoans
    pal-390  Reefs through time
    pal-391  The Capitan Reef
    pal-392  Microbial reefs
    pal-393  Jellyfish fossils
    pal-394  Fossil annelids
    pal-395  Tentaculitids

### Microfossils — `pal-micro`

    pal-396  What a microfossil is
    pal-397  Foraminifera
    pal-398  Planktonic and benthic foraminifera
    pal-399  Nummulites
    pal-400  Fusulinids
    pal-401  Radiolarians
    pal-402  Diatoms
    pal-403  Diatomite
    pal-404  Coccolithophores
    pal-405  Chalk
    pal-406  Dinoflagellate cysts
    pal-407  Ostracods
    pal-408  Chitinozoans
    pal-409  Pollen and spores
    pal-410  Palynology
    pal-411  Phytoliths
    pal-412  Testate amoebae
    pal-413  Foraminiferal oxygen isotopes
    pal-414  Deep-sea drilling cores
    pal-415  Microfossils in oil exploration

## Plants Through Time

### Plants move onto land — `pal-landplants`

    pal-416  The colonisation of land by plants
    pal-417  The algal ancestors of land plants
    pal-418  Cryptospores
    pal-419  Cooksonia
    pal-420  The Rhynie chert plants
    pal-421  Prototaxites
    pal-422  Fossil fungi and early symbiosis
    pal-423  Lichens in the fossil record
    pal-424  Zosterophylls
    pal-425  Lycophytes
    pal-426  Baragwanathia
    pal-427  The origin of leaves
    pal-428  The origin of roots
    pal-429  Wood and lignin
    pal-430  Archaeopteris
    pal-431  The first forests
    pal-432  The Gilboa fossil forest
    pal-433  The Devonian plant explosion
    pal-434  Plants and the Devonian atmosphere
    pal-435  Horsetails

### Coal forests and seed plants — `pal-coal`

    pal-436  The Carboniferous coal forests
    pal-437  Coal formation
    pal-438  Lepidodendron
    pal-439  Sigillaria
    pal-440  Stigmaria
    pal-441  Calamites
    pal-442  Tree ferns
    pal-443  The seed
    pal-444  Seed ferns
    pal-445  Glossopteris
    pal-446  Glossopteris and continental drift
    pal-447  Cordaites
    pal-448  The Carboniferous rainforest collapse
    pal-449  Coal balls
    pal-450  Why coal formation slowed
    pal-451  The Joggins Fossil Cliffs
    pal-452  Early conifers
    pal-453  Ginkgo
    pal-454  Cycads
    pal-455  Fossil forests buried in ash

### Mesozoic plants — `pal-mesoplants`

    pal-456  Mesozoic floras
    pal-457  Conifers of the Mesozoic
    pal-458  Araucaria
    pal-459  Petrified Forest National Park
    pal-460  Bennettitales
    pal-461  Ferns in the Mesozoic
    pal-462  Fern spikes after extinctions
    pal-463  A world without grass
    pal-464  The Wollemi pine
    pal-465  The dawn redwood
    pal-466  Cheirolepidiaceae
    pal-467  Pollination before flowers
    pal-468  The origin of flowering plants
    pal-469  Darwin's abominable mystery
    pal-470  Archaefructus
    pal-471  Montsechia
    pal-472  The Cretaceous flowering-plant radiation
    pal-473  Plants and plant-eating dinosaurs
    pal-474  Leaf-margin analysis
    pal-475  Stomata and ancient carbon dioxide

### The Cenozoic green world — `pal-cenoplants`

    pal-476  Angiosperms take over
    pal-477  The origin of grasses
    pal-478  The spread of grasslands
    pal-479  C4 photosynthesis and the late Miocene
    pal-480  Grass phytoliths in dinosaur dung
    pal-481  Palms at high latitudes
    pal-482  The polar forests of the Eocene
    pal-483  The Arctic Azolla event
    pal-484  Fossil fruits and seeds
    pal-485  The evolution of fruit
    pal-486  The London Clay flora
    pal-487  Amber-producing trees
    pal-488  The Clarkia fossil beds
    pal-489  Plant extinction at the end of the Cretaceous
    pal-490  Fossil pollen and past vegetation
    pal-491  Pollen diagrams
    pal-492  Packrat middens
    pal-493  The mammoth steppe
    pal-494  The Younger Dryas
    pal-495  Silene stenophylla and ancient seeds

## Fishes and the Move onto Land

### The first vertebrates — `pal-firstverts`

    pal-496  Chordates in the fossil record
    pal-497  Yunnanozoans
    pal-498  Myllokunmingia
    pal-499  Jawless fishes
    pal-500  Ostracoderms
    pal-501  Heterostracans
    pal-502  Osteostracans
    pal-503  Anaspids
    pal-504  Thelodonts
    pal-505  The origin of bone
    pal-506  The origin of teeth
    pal-507  Hagfish and lampreys in the fossil record
    pal-508  Tullimonstrum
    pal-509  The origin of jaws
    pal-510  Placoderms
    pal-511  Entelognathus
    pal-512  Dunkleosteus
    pal-513  Bothriolepis
    pal-514  Materpiscis and internal fertilisation
    pal-515  Acanthodians

### The age of fishes — `pal-fishes`

    pal-516  The Devonian as the age of fishes
    pal-517  Chondrichthyans
    pal-518  Cladoselache
    pal-519  Stethacanthus
    pal-520  Helicoprion
    pal-521  Megalodon
    pal-522  Fossil shark teeth
    pal-523  Holocephalans
    pal-524  Ray-finned fishes
    pal-525  Teleosts
    pal-526  Gars and bowfins
    pal-527  Pycnodonts
    pal-528  Leedsichthys
    pal-529  Xiphactinus
    pal-530  Lobe-finned fishes
    pal-531  Coelacanths
    pal-532  The coelacanth rediscovered
    pal-533  Lungfish
    pal-534  Lungfish burrows
    pal-535  Mass mortality of fossil fishes

### From fins to limbs — `pal-tetrapods`

    pal-536  The fish–tetrapod transition
    pal-537  Eusthenopteron
    pal-538  Panderichthys
    pal-539  Tiktaalik
    pal-540  Elpistostege
    pal-541  Ventastega
    pal-542  Acanthostega
    pal-543  Ichthyostega
    pal-544  Tulerpeton
    pal-545  Polydactyly in early tetrapods
    pal-546  The Zachełmie trackways
    pal-547  Why limbs evolved in water
    pal-548  Devonian tetrapod habitats
    pal-549  Fins, limbs and Hox genes
    pal-550  Air breathing in early tetrapods
    pal-551  The spiracle and the tetrapod ear
    pal-552  Romer's Gap
    pal-553  Pederpes
    pal-554  The East Kirkton site
    pal-555  Westlothiana

### Amphibians and early amniotes — `pal-amphibians`

    pal-556  Temnospondyls
    pal-557  Eryops
    pal-558  Mastodonsaurus
    pal-559  Prionosuchus
    pal-560  Lepospondyls
    pal-561  Diplocaulus
    pal-562  Gerobatrachus and the origin of frogs and salamanders
    pal-563  Triadobatrachus
    pal-564  Caecilians in the fossil record
    pal-565  Reptiliomorphs
    pal-566  Seymouria
    pal-567  Diadectes
    pal-568  The amniotic egg
    pal-569  Hylonomus
    pal-570  Captorhinids
    pal-571  Pareiasaurs
    pal-572  Mesosaurus and continental drift
    pal-573  The origin of turtles
    pal-574  Eunotosaurus
    pal-575  Odontochelys

### Synapsids — `pal-synapsids`

    pal-576  Synapsids
    pal-577  The synapsid skull opening
    pal-578  Pelycosaurs
    pal-579  Dimetrodon
    pal-580  Why Dimetrodon had a sail
    pal-581  Edaphosaurus
    pal-582  Therapsids
    pal-583  Dinocephalians
    pal-584  Gorgonopsians
    pal-585  Inostrancevia
    pal-586  Dicynodonts
    pal-587  Lystrosaurus
    pal-588  Cynodonts
    pal-589  Thrinaxodon
    pal-590  Tritylodontids
    pal-591  The secondary palate
    pal-592  The mammalian jaw joint
    pal-593  How the middle-ear bones began as jaw bones
    pal-594  Hair and whiskers in synapsids
    pal-595  Why "mammal-like reptiles" is retired

## The Age of Reptiles

### The Triassic world — `pal-triassic`

    pal-596  The Triassic world
    pal-597  Pangaea
    pal-598  The Carnian Pluvial Episode
    pal-599  Skull openings and the diapsid condition
    pal-600  Archosaurs
    pal-601  The antorbital fenestra
    pal-602  Archosauriforms
    pal-603  Erythrosuchus
    pal-604  Euparkeria
    pal-605  Pseudosuchians
    pal-606  Phytosaurs
    pal-607  Aetosaurs
    pal-608  Rauisuchians
    pal-609  Postosuchus
    pal-610  Crocodylomorphs
    pal-611  Avemetatarsalians
    pal-612  Lagerpetids
    pal-613  Silesaurids
    pal-614  Tanystropheus
    pal-615  Rhynchosaurs

### Seas and skies — `pal-seasky`

    pal-616  Marine reptiles
    pal-617  Ichthyosaurs
    pal-618  Live birth in ichthyosaurs
    pal-619  Shonisaurus
    pal-620  Nothosaurs
    pal-621  Placodonts
    pal-622  Plesiosaurs
    pal-623  Elasmosaurus
    pal-624  Pliosaurs
    pal-625  Mosasaurs
    pal-626  Archelon and Cretaceous sea turtles
    pal-627  The Western Interior Seaway
    pal-628  Pterosaurs
    pal-629  The pterosaur wing
    pal-630  Pycnofibres
    pal-631  Pteranodon
    pal-632  Quetzalcoatlus
    pal-633  Rhamphorhynchus
    pal-634  How pterosaurs took off
    pal-635  Pterosaur eggs

### What a dinosaur is — `pal-dinodef`

    pal-636  Dinosaur
    pal-637  Dinosauria
    pal-638  The upright stance
    pal-639  The perforate acetabulum
    pal-640  The lizard-hipped dinosaurs
    pal-641  The bird-hipped dinosaurs
    pal-642  The pubis and the two-hipped division
    pal-643  Ornithoscelida
    pal-644  Dinosaurs are not lizards
    pal-645  Non-avian dinosaurs
    pal-646  How many dinosaur species there were
    pal-647  The geographical spread of dinosaurs
    pal-648  The dinosaur size range
    pal-649  Dinosaur biogeography
    pal-650  The first dinosaurs
    pal-651  The Ischigualasto Formation
    pal-652  Eoraptor
    pal-653  Herrerasaurus
    pal-654  Nyasasaurus
    pal-655  The rise of the dinosaurs

### Dinosaur anatomy — `pal-dinoanat`

    pal-656  The dinosaur skeleton
    pal-657  The dinosaur skull
    pal-658  Dinosaur teeth
    pal-659  Tooth replacement
    pal-660  The beak
    pal-661  The vertebral column
    pal-662  Cervical vertebrae
    pal-663  Dorsal vertebrae
    pal-664  The sacrum
    pal-665  The tail
    pal-666  Ossified tendons
    pal-667  The rib cage
    pal-668  Gastralia
    pal-669  The shoulder girdle
    pal-670  The forelimb
    pal-671  The dinosaur hand
    pal-672  The dinosaur pelvis
    pal-673  The dinosaur foot
    pal-674  Digitigrade posture
    pal-675  Pneumatic bones
    pal-676  Air sacs
    pal-677  The braincase
    pal-678  The trigeminal nerve and facial touch
    pal-679  Dinosaur eyes and vision
    pal-680  Hearing in dinosaurs
    pal-681  Smell in dinosaurs
    pal-682  Skin and scales
    pal-683  Feathers in dinosaurs
    pal-684  Osteoderms
    pal-685  Crests, horns and frills

### The dinosaur groups — `pal-dinogroups`

    pal-686  Sauropodomorphs
    pal-687  Plateosaurus
    pal-688  Sauropods
    pal-689  Diplodocids
    pal-690  Brachiosaurids
    pal-691  Titanosaurs
    pal-692  Argentinosaurus and the limits of size estimates
    pal-693  Sauropod gigantism
    pal-694  Theropods
    pal-695  Coelophysis
    pal-696  Allosaurus
    pal-697  Spinosaurus
    pal-698  Tyrannosaurs
    pal-699  Tyrannosaurus
    pal-700  Velociraptor
    pal-701  Deinonychus and the dinosaur renaissance
    pal-702  Oviraptorosaurs
    pal-703  Therizinosaurs
    pal-704  Ornithomimosaurs
    pal-705  Heterodontosaurus
    pal-706  Stegosaurs
    pal-707  Ankylosaurs
    pal-708  Iguanodon
    pal-709  Hadrosaurs
    pal-710  Edmontosaurus mummies
    pal-711  Ceratopsians
    pal-712  Triceratops
    pal-713  Protoceratops and the griffin legend
    pal-714  Pachycephalosaurs
    pal-715  Psittacosaurus and its colour

### Dinosaur lives — `pal-dinobio`

    pal-716  Dinosaur growth rates
    pal-717  Dinosaur metabolism
    pal-718  The warm-blooded dinosaur debate
    pal-719  Medullary bone
    pal-720  Dinosaur eggs and their colour
    pal-721  Brooding dinosaurs
    pal-722  Maiasaura and parental care
    pal-723  Dinosaur herds and bonebeds
    pal-724  Tyrannosaurus bite force
    pal-725  How fast dinosaurs ran
    pal-726  Sauropod neck posture
    pal-727  Which dinosaurs had feathers
    pal-728  The aquatic Spinosaurus debate
    pal-729  Disease and injury in dinosaurs
    pal-730  Dinosaur brains and intelligence

### The origin of birds — `pal-birds`

    pal-731  Birds are dinosaurs
    pal-732  Archaeopteryx
    pal-733  The Archaeopteryx specimens
    pal-734  Huxley and the dinosaur–bird link
    pal-735  Sinosauropteryx
    pal-736  Anchiornis
    pal-737  Microraptor
    pal-738  The evolution of feathers
    pal-739  The origin of flight
    pal-740  The wishbone
    pal-741  Confuciusornis
    pal-742  Enantiornithes
    pal-743  Hesperornis
    pal-744  Ichthyornis
    pal-745  The birds that survived the end-Cretaceous

## The Age of Mammals

### The first mammals — `pal-firstmammals`

    pal-746  Mammaliaforms
    pal-747  Morganucodon
    pal-748  Hadrocodium
    pal-749  Docodonts
    pal-750  Castorocauda
    pal-751  Volaticotherium and gliding mammals
    pal-752  Multituberculates
    pal-753  Repenomamus
    pal-754  Gondwanatheres
    pal-755  Vintana
    pal-756  Spinolestes and fossil mammal hair
    pal-757  The tribosphenic molar
    pal-758  Monotremes in the fossil record
    pal-759  Steropodon
    pal-760  Juramaia
    pal-761  Eomaia
    pal-762  The origin of marsupials
    pal-763  The origin of placentals
    pal-764  The nocturnal bottleneck
    pal-765  The mammal radiation after the dinosaurs

### The Cenozoic world — `pal-cenozoic`

    pal-766  The Palaeocene
    pal-767  The Eocene
    pal-768  The Oligocene
    pal-769  The Miocene
    pal-770  The Pliocene
    pal-771  The Pleistocene
    pal-772  The Holocene
    pal-773  The Anthropocene proposal
    pal-774  The Corral Bluffs fossils
    pal-775  The Palaeocene–Eocene Thermal Maximum
    pal-776  The Eocene–Oligocene transition
    pal-777  The Grande Coupure
    pal-778  The Drake Passage and Antarctic ice
    pal-779  The Himalayas and Cenozoic climate
    pal-780  The Mid-Miocene Climatic Optimum
    pal-781  The Messinian salinity crisis
    pal-782  The Isthmus of Panama
    pal-783  The Great American Biotic Interchange
    pal-784  Island dwarfism
    pal-785  Island gigantism

### Mammal radiations — `pal-radiations`

    pal-786  Archaic mammals of the Palaeocene
    pal-787  Uintatheres
    pal-788  Brontotheres
    pal-789  Paraceratherium
    pal-790  Horse evolution
    pal-791  Eohippus
    pal-792  The horse series as a branching bush
    pal-793  Whale evolution
    pal-794  Pakicetus
    pal-795  Ambulocetus
    pal-796  Basilosaurus
    pal-797  Wadi Al-Hitan
    pal-798  Whale ankle bones and the artiodactyls
    pal-799  Proboscideans
    pal-800  Moeritherium
    pal-801  Deinotherium
    pal-802  Gomphotheres
    pal-803  Mastodons
    pal-804  Creodonts
    pal-805  The origin of carnivorans
    pal-806  Onychonycteris and the first bats
    pal-807  South America's native hoofed mammals
    pal-808  Macrauchenia
    pal-809  Pezosiren and walking sea cows
    pal-810  Terror birds

### The Ice Age — `pal-iceage`

    pal-811  Glacial and interglacial cycles
    pal-812  Milankovitch cycles
    pal-813  Ice cores
    pal-814  Pleistocene megafauna
    pal-815  The woolly mammoth
    pal-816  Mammoth carcasses in permafrost
    pal-817  The woolly rhinoceros
    pal-818  Smilodon
    pal-819  The dire wolf
    pal-820  The cave bear
    pal-821  The Irish elk
    pal-822  Giant ground sloths
    pal-823  Glyptodonts
    pal-824  Diprotodon
    pal-825  Thylacoleo
    pal-826  Australia's lost megafauna
    pal-827  Moa
    pal-828  Elephant birds
    pal-829  Steller's sea cow
    pal-830  The Wrangel Island mammoths
    pal-831  Dwarf elephants of the Mediterranean islands
    pal-832  The Late Pleistocene extinctions
    pal-833  The overkill hypothesis
    pal-834  Climate or people in the megafaunal extinctions
    pal-835  Mammoth de-extinction proposals

### Primates and human origins — `pal-humans`

    pal-836  Primate origins
    pal-837  Plesiadapiforms
    pal-838  Darwinius
    pal-839  Eosimias and the origin of anthropoids
    pal-840  Aegyptopithecus
    pal-841  Proconsul
    pal-842  Miocene apes
    pal-843  Gigantopithecus
    pal-844  Sahelanthropus
    pal-845  Orrorin
    pal-846  Ardipithecus
    pal-847  Ardi
    pal-848  Australopithecus afarensis
    pal-849  Lucy
    pal-850  The Laetoli footprints
    pal-851  The Taung Child
    pal-852  Australopithecus sediba
    pal-853  Kenyanthropus
    pal-854  Paranthropus
    pal-855  The Black Skull
    pal-856  The Feldhofer Neanderthal
    pal-857  The Xiahe mandible
    pal-858  The KBS Tuff dispute
    pal-859  Piltdown Man
    pal-860  A bush, not a ladder

## Extinction and Evolution

### Patterns in the history of life — `pal-patterns`

    pal-861  Macroevolution in the fossil record
    pal-862  Transitional fossils
    pal-863  Punctuated equilibrium
    pal-864  Phyletic gradualism
    pal-865  Stasis
    pal-866  Adaptive radiations in the fossil record
    pal-867  Key innovations
    pal-868  Exaptation
    pal-869  Cope's rule
    pal-870  Directional trends and passive diffusion
    pal-871  Disparity and diversity
    pal-872  Diversity curves
    pal-873  Background extinction
    pal-874  Species durations
    pal-875  The Red Queen hypothesis
    pal-876  Escalation
    pal-877  Incumbency and biotic replacement
    pal-878  Iterative evolution
    pal-879  Evo-devo and fossils
    pal-880  The Lilliput effect

### Mass extinctions — `pal-massext`

    pal-881  Mass extinctions
    pal-882  The Big Five
    pal-883  Extinctions of the Cambrian
    pal-884  The end-Ordovician extinction
    pal-885  The Hirnantian glaciation
    pal-886  The Late Devonian extinction
    pal-887  The Kellwasser events
    pal-888  The Hangenberg event
    pal-889  The Capitanian extinction
    pal-890  The end-Permian extinction
    pal-891  The Meishan section
    pal-892  The Siberian Traps
    pal-893  Ocean acidification at the end of the Permian
    pal-894  Disaster taxa
    pal-895  The coal gap
    pal-896  Recovery from the Great Dying
    pal-897  The end-Triassic extinction
    pal-898  The Central Atlantic Magmatic Province
    pal-899  Large igneous provinces
    pal-900  Oceanic anoxic events
    pal-901  The Toarcian event
    pal-902  Selectivity in mass extinctions
    pal-903  Extinction and body size
    pal-904  Reef collapses
    pal-905  Pseudo-extinction
    pal-906  Dead clade walking
    pal-907  Recovery intervals
    pal-908  Periodicity in extinction
    pal-909  The sixth extinction debate
    pal-910  Today's losses against the Big Five

### The end of the Cretaceous — `pal-kpg`

    pal-911  The Cretaceous–Palaeogene extinction
    pal-912  The K–Pg boundary clay
    pal-913  Gubbio
    pal-914  The iridium anomaly
    pal-915  The Alvarez hypothesis
    pal-916  Shocked quartz
    pal-917  Spherules and tektites
    pal-918  The Chicxulub crater
    pal-919  The Deccan Traps
    pal-920  Impact against volcanism
    pal-921  Dating the boundary
    pal-922  Impact winter
    pal-923  Wildfires after the impact
    pal-924  The Tanis site
    pal-925  Were dinosaurs declining before the impact
    pal-926  Plankton at the boundary
    pal-927  The Strangelove ocean
    pal-928  What survived the end-Cretaceous
    pal-929  Freshwater survivors
    pal-930  Mammals at the boundary

### Ancient climates and geography — `pal-palaeoclimate`

    pal-931  Palaeoclimatology
    pal-932  Proxies for past climate
    pal-933  Oxygen isotopes and past temperatures
    pal-934  Greenhouse and icehouse Earth
    pal-935  The Late Palaeozoic Ice Age
    pal-936  The Cretaceous hothouse
    pal-937  Atmospheric oxygen through time
    pal-938  Carbon dioxide through time
    pal-939  Aragonite and calcite seas
    pal-940  Sea-level change through time
    pal-941  Palaeosols
    pal-942  Continental drift
    pal-943  Wegener's fossil evidence
    pal-944  Plate tectonics and the fossil record
    pal-945  Gondwana
    pal-946  Laurasia
    pal-947  Palaeogeographic maps
    pal-948  Vicariance
    pal-949  Endemism
    pal-950  Reconstructing ancient food webs

## Palaeontology and People

### The history of palaeontology — `pal-history`

    pal-951  Fossils in antiquity
    pal-952  Shen Kuo and fossils
    pal-953  Nicolas Steno and the tongue stones
    pal-954  Robert Hooke's fossils
    pal-955  Georges Cuvier
    pal-956  The discovery of extinction
    pal-957  Jean-Baptiste Lamarck
    pal-958  William Smith's geological map
    pal-959  Mary Anning
    pal-960  William Buckland
    pal-961  Megalosaurus
    pal-962  Gideon Mantell and Iguanodon
    pal-963  Richard Owen
    pal-964  Charles Lyell
    pal-965  Charles Darwin and the fossil record
    pal-966  The Crystal Palace dinosaurs
    pal-967  Othniel Charles Marsh
    pal-968  Edward Drinker Cope
    pal-969  The Bone Wars
    pal-970  Charles Doolittle Walcott
    pal-971  Roy Chapman Andrews and the Gobi expeditions
    pal-972  Tilly Edinger
    pal-973  Alfred Romer
    pal-974  George Gaylord Simpson
    pal-975  Zofia Kielan-Jaworowska
    pal-976  Mary Leakey
    pal-977  John Ostrom
    pal-978  Robert Bakker
    pal-979  Stephen Jay Gould
    pal-980  The colonial history of fossil collecting

### Palaeontology in public — `pal-public`

    pal-981  Natural history museums
    pal-982  Dippy the Diplodocus
    pal-983  Redesigning fossil halls
    pal-984  Palaeoart
    pal-985  Charles R. Knight
    pal-986  Zdeněk Burian
    pal-987  The Age of Reptiles mural
    pal-988  The Lost World
    pal-989  Dinosaurs in film
    pal-990  Jurassic Park
    pal-991  Fossils in myth and legend
    pal-992  State fossils
    pal-993  Fossil tourism
    pal-994  Fossil auctions
    pal-995  Fakes and forgeries
    pal-996  Archaeoraptor
    pal-997  Creationism and the fossil record
    pal-998  Press releases and palaeontology
    pal-999  Parachute science
    pal-1000  Where palaeontology is going

# The 2026-11-12 renumbering

**All 100 cards of the Dinosaurs collection (`dino-001`–`dino-100`) were renumbered into this plan**, when
Dinosaurs went dormant. None was retired. Each was matched to a slot by **its own answer term**, the rule
World History's renumbering used, and each kept its wording, citations, date line and Wikipedia link
unchanged — only the id and the deck moved. The Dinosaurs plan's own topic lines were rewritten here only
where the new deck needed a different heading for the same subject (`dino-011` *Animals mistaken for
dinosaurs* is `pal-625 Mosasaurs`, because the card's answer is "mosasaur").

**THIS TABLE IS ALSO CODE.** `DINO_TO_PAL` in `app.js` is the same 100 pairs plus the deck ids, and
`migrateDinoIds` uses it to carry a reader's saved progress across. If a line here ever changes, that table
must change with it — but neither should change: an id is a permanent address once a reader holds it.

Read `new  <-  old`. The old numbering is what earlier commits, `.claude/wiki-title-cache.json` and any
batch notes use; those records were not rewritten.

    pal-017  <-  dino-074   The fossil record   (pal-what)
    pal-019  <-  dino-018   The Paleobiology Database   (pal-what)
    pal-021  <-  dino-056   Linnaean taxonomy   (pal-classify)
    pal-022  <-  dino-062   Binomial nomenclature   (pal-classify)
    pal-023  <-  dino-085   The specific name   (pal-classify)
    pal-025  <-  dino-063   The holotype   (pal-classify)
    pal-027  <-  dino-064   Nomen dubium   (pal-classify)
    pal-028  <-  dino-065   Junior synonyms   (pal-classify)
    pal-029  <-  dino-066   The principle of priority   (pal-classify)
    pal-030  <-  dino-067   The Brontosaurus question   (pal-classify)
    pal-031  <-  dino-057   Phylogenetic trees   (pal-classify)
    pal-032  <-  dino-058   Cladistics in palaeontology   (pal-classify)
    pal-033  <-  dino-059   Reading a cladogram   (pal-classify)
    pal-034  <-  dino-002   Synapomorphy   (pal-classify)
    pal-035  <-  dino-060   The character matrix   (pal-classify)
    pal-043  <-  dino-061   Convergent evolution   (pal-classify)
    pal-044  <-  dino-068   Growth changes mistaken for species   (pal-classify)
    pal-045  <-  dino-069   Nanotyrannus and the juvenile problem   (pal-classify)
    pal-046  <-  dino-070   Chronospecies   (pal-classify)
    pal-047  <-  dino-071   Sexual dimorphism in fossils   (pal-classify)
    pal-048  <-  dino-072   Intraspecific variation   (pal-classify)
    pal-049  <-  dino-073   Sample size   (pal-classify)
    pal-051  <-  dino-087   Deep time   (pal-deeptime)
    pal-052  <-  dino-088   The geological timescale   (pal-deeptime)
    pal-053  <-  dino-089   Chronostratigraphy   (pal-deeptime)
    pal-061  <-  dino-093   The Palaeozoic   (pal-deeptime)
    pal-062  <-  dino-086   The Mesozoic   (pal-deeptime)
    pal-063  <-  dino-094   The Cenozoic   (pal-deeptime)
    pal-070  <-  dino-090   The Triassic   (pal-deeptime)
    pal-071  <-  dino-091   The Jurassic   (pal-deeptime)
    pal-072  <-  dino-092   The Cretaceous   (pal-deeptime)
    pal-076  <-  dino-100   Relative dating   (pal-dating)
    pal-082  <-  dino-081   Biostratigraphy   (pal-dating)
    pal-086  <-  dino-080   The geological formation   (pal-dating)
    pal-087  <-  dino-096   Radiometric dating   (pal-dating)
    pal-088  <-  dino-097   Half-life   (pal-dating)
    pal-089  <-  dino-098   Uranium–lead dating   (pal-dating)
    pal-091  <-  dino-099   Argon–argon dating   (pal-dating)
    pal-126  <-  dino-075   Lagerstätte   (pal-sites)
    pal-135  <-  dino-076   The Yixian Formation   (pal-sites)
    pal-145  <-  dino-077   The Morrison Formation   (pal-sites)
    pal-146  <-  dino-078   The Hell Creek Formation   (pal-sites)
    pal-147  <-  dino-079   The Djadochta Formation   (pal-sites)
    pal-195  <-  dino-043   Bone histology   (pal-lab)
    pal-202  <-  dino-040   The femur and body-mass estimates   (pal-lab)
    pal-207  <-  dino-047   Endocasts and fossil brains   (pal-lab)
    pal-579  <-  dino-012   Dimetrodon   (pal-synapsids)
    pal-598  <-  dino-095   The Carnian Pluvial Episode   (pal-triassic)
    pal-599  <-  dino-023   Skull openings and the diapsid condition   (pal-triassic)
    pal-601  <-  dino-024   The antorbital fenestra   (pal-triassic)
    pal-622  <-  dino-014   Plesiosaurs   (pal-seasky)
    pal-625  <-  dino-011   Mosasaurs   (pal-seasky)
    pal-628  <-  dino-013   Pterosaurs   (pal-seasky)
    pal-636  <-  dino-001   Dinosaur   (pal-dinodef)
    pal-637  <-  dino-003   Dinosauria   (pal-dinodef)
    pal-638  <-  dino-004   The upright stance   (pal-dinodef)
    pal-639  <-  dino-005   The perforate acetabulum   (pal-dinodef)
    pal-640  <-  dino-006   The lizard-hipped dinosaurs   (pal-dinodef)
    pal-641  <-  dino-007   The bird-hipped dinosaurs   (pal-dinodef)
    pal-642  <-  dino-008   The pubis and the two-hipped division   (pal-dinodef)
    pal-643  <-  dino-009   Ornithoscelida   (pal-dinodef)
    pal-644  <-  dino-010   Dinosaurs are not lizards   (pal-dinodef)
    pal-645  <-  dino-016   Non-avian dinosaurs   (pal-dinodef)
    pal-646  <-  dino-017   How many dinosaur species there were   (pal-dinodef)
    pal-647  <-  dino-019   The geographical spread of dinosaurs   (pal-dinodef)
    pal-648  <-  dino-020   The dinosaur size range   (pal-dinodef)
    pal-649  <-  dino-082   Dinosaur biogeography   (pal-dinodef)
    pal-656  <-  dino-021   The dinosaur skeleton   (pal-dinoanat)
    pal-657  <-  dino-022   The dinosaur skull   (pal-dinoanat)
    pal-658  <-  dino-025   Dinosaur teeth   (pal-dinoanat)
    pal-659  <-  dino-026   Tooth replacement   (pal-dinoanat)
    pal-660  <-  dino-027   The beak   (pal-dinoanat)
    pal-661  <-  dino-028   The vertebral column   (pal-dinoanat)
    pal-662  <-  dino-029   Cervical vertebrae   (pal-dinoanat)
    pal-663  <-  dino-030   Dorsal vertebrae   (pal-dinoanat)
    pal-664  <-  dino-031   The sacrum   (pal-dinoanat)
    pal-665  <-  dino-032   The tail   (pal-dinoanat)
    pal-666  <-  dino-033   Ossified tendons   (pal-dinoanat)
    pal-667  <-  dino-034   The rib cage   (pal-dinoanat)
    pal-668  <-  dino-035   Gastralia   (pal-dinoanat)
    pal-669  <-  dino-036   The shoulder girdle   (pal-dinoanat)
    pal-670  <-  dino-037   The forelimb   (pal-dinoanat)
    pal-671  <-  dino-038   The dinosaur hand   (pal-dinoanat)
    pal-672  <-  dino-039   The dinosaur pelvis   (pal-dinoanat)
    pal-673  <-  dino-041   The dinosaur foot   (pal-dinoanat)
    pal-674  <-  dino-042   Digitigrade posture   (pal-dinoanat)
    pal-675  <-  dino-044   Pneumatic bones   (pal-dinoanat)
    pal-676  <-  dino-045   Air sacs   (pal-dinoanat)
    pal-677  <-  dino-046   The braincase   (pal-dinoanat)
    pal-678  <-  dino-048   The trigeminal nerve and facial touch   (pal-dinoanat)
    pal-679  <-  dino-049   Dinosaur eyes and vision   (pal-dinoanat)
    pal-680  <-  dino-050   Hearing in dinosaurs   (pal-dinoanat)
    pal-681  <-  dino-051   Smell in dinosaurs   (pal-dinoanat)
    pal-682  <-  dino-052   Skin and scales   (pal-dinoanat)
    pal-683  <-  dino-053   Feathers in dinosaurs   (pal-dinoanat)
    pal-684  <-  dino-054   Osteoderms   (pal-dinoanat)
    pal-685  <-  dino-055   Crests, horns and frills   (pal-dinoanat)
    pal-731  <-  dino-015   Birds are dinosaurs   (pal-birds)
    pal-948  <-  dino-083   Vicariance   (pal-palaeoclimate)
    pal-949  <-  dino-084   Endemism   (pal-palaeoclimate)
