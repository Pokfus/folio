# Dinosaurs — a 1000-card running order

The plan for `dino`, a new collection: every card's number, topic and deck, fixed in advance so the
collection can be grown one card at a time over many sessions without anyone having to remember what
was intended.

It is the fifteenth of these and the fourth that is not a history collection. Read
`docs/greece-card-plan.md` first if this is the first plan you have met; the mechanics are identical and
are not repeated here.

---

## How to use this (the whole point of the file)

**The next card to write is the lowest `dino-NNN` not yet in `data.js`.**

    node -e "global.window={};require('./data.js');const h=new Set(window.CARD_DATA.map(c=>c.id));for(let i=1;i<=1000;i++){const id='dino-'+String(i).padStart(3,'0');if(!h.has(id)){console.log(id);break}}"

Look the number up below, research it, write it, and add it with the deck id this file gives:

    node .claude/add-card.js <card.json> <deckId>

**Always pass the deck id.** Without one `add-card.js` falls back to the first leaf in the whole tree,
which is in China.

There is deliberately **no progress file**. `data.js` says what exists and this file says what is
planned; the next card is whatever falls between them, so the two can never come to disagree about
where the work had got to.

The padding above is right for every id but the last: the ids are `dino-001` … `dino-999`, then
`dino-1000`.

## What a line in this list is, and is not

A line is a **subject to research**, not a fact to assert and not necessarily the finished answer term.
`dino-545 Stegosaurus` is already an answer term; `dino-415 The aquatic Spinosaurus debate` is an
argument to describe, and the card's actual answer — the word that gets blanked — is chosen while
writing it, from what the sources will support.

**This plan will need changing more often than the others**, and that is a fact about the subject rather
than about the plan: dinosaur taxonomy and dinosaur biology both move fast enough that a topic can stop
being true between the plan and the card. When that happens, change the line here in the same commit as
the card, and say so.

The one thing that must not happen is a card written to fill a slot. The house rule stands: never invent
a date, a name or a definition. If a topic cannot be sourced, say so and replace the line.

## Is there a thousand cards in this? — the question this plan has to answer first

**Dinosaurs is the narrowest subject on the shelf, and a thousand cards is defensible only because this
collection is not only about Dinosauria.** That needs saying plainly rather than discovered halfway
through.

**Roughly a quarter of the thousand name a taxon** — a clade, a genus or a group; counted by matching
taxonomic name endings across the whole list it comes to about 240, and the category is fuzzy enough
that the fraction is the honest figure rather than the count. The other three-quarters are anatomy,
physiology, growth, locomotion, feeding, reproduction, behaviour, the Mesozoic world the animals lived
in, the extinction, the birds that came out of it, and how any of it is known. That is the split that
makes the collection worth studying: **1000 cards of genera would be a list**, and a reader who
memorised it would know a great many names and nothing about dinosaurs.

**Deck 2 is the load-bearing widening.** *The Mesozoic World* is 100 cards on geology, climate, plants,
pterosaurs, marine reptiles and the mammals underfoot — none of them dinosaurs. It is here because an
animal is unintelligible without the world it lived in, and because the reader who wants dinosaurs
wants the Mesozoic and does not know it yet.

**Where the padding risk actually is**, so it can be watched: the taxon subdecks in decks 4, 5 and 6.
A genus card is easy to write and easy to write badly — *Camarasaurus was a sauropod from the Morrison
Formation, about 15 m long, with spatulate teeth* is a caption, not a card. **A genus earns its slot by
having something to teach that the group card does not**: what it settled, what it overturned, what is
unusual about it, or what it is the best-known example of. If a genus turns out not to have that, replace
the line with a subject that does.

## Making the collection

**The collection does not exist yet and this plan creates it** — the node, its tree, its `COLL_THEME`
hue and its `COLLECTION_ICON` row all ship with the file.

**The id is `dino` and the card prefix is `dino-`**, free of every existing prefix and no prefix of any
of them. The deck ids are also `dino-…`, which is the pattern `bio` uses.

**It goes in the `Science` section**, which now holds three collections — Psychology, Biology and this —
so `COLLECTION_SECTIONS` is unchanged and `COLLECTION_SECTION` gains one row. The section still draws
nothing until one of the three has a card.

**The hue is `#967B00`, an ochre**, measured against the twenty-one hues already on the shelf. It stands
**26.9 from its nearest neighbour** (India's saffron) and 29.2 from World History's sepia, against a
**tightest existing pair of 12.9** and a **median nearest-neighbour distance of 22.7** — comfortably the
best-separated candidate that is not the magenta, and apt besides: it is the colour of amber, of
Morrison sandstone and of a prepared fossil bone. It reads 4.1:1 against white, low but inside the
shelf's own 3.7–10.4 range.

**A STANDING NOTE, so the next collection does not re-run this sweep.** The magenta band around
`#c057b1` scores 30.6 and is the best-scoring region of the entire wheel; it has now been measured and
rejected FOUR times — Psychology, Philosophy, Biology and here — always for the same reason, which is
that at chroma 61 it is the loudest thing that could be put on a shelf whose whole register is muted.
**It is not going to be chosen. Stop measuring it**, and read the region below it (the plum, taken) and
the olive-brass (rejected three times as a fourth or fifth member of the yellow-green-brown quarter) as
settled too. What remains genuinely open is narrow, and a future collection may have to accept a
distance nearer the median than the maximum, as Philosophy's petrol did at 19.8.

**It gets a `COLLECTION_ICON` row and a new symbol, `sauropod`** — a long-necked quadruped in profile.
**Eight drafts, and the one that decides it is the OWL.** A footprint was drawn first and is the obvious
museum-signage mark, but at 24px a three-toed track is a bulb with three prongs and reads as a sprouting
plant; a bone reads as a slanted pill. The sauropod works — and the trap is that a long neck that curls
BACK over the body is a swan, which on a shelf that already carries an owl is the one animal this must
not resemble. The neck rises and the head tips FORWARD, and the horizontal body on two legs with a
sweeping tail is what no bird has.

## What this collection is about, and the five scope decisions

**It is dinosaurs as a science: what they were, how they lived, what the world was like, and how any of
that is known.** The last deck, *Finding and Knowing*, is 115 cards on taphonomy, excavation, analysis
and the history of the discipline, because in this subject the method is not a preliminary — every claim
in the other eight decks is an inference from bones, and a reader who does not know what an inference
from bones can and cannot support has learned a set of pictures.

**First: the corrections are the spine of the collection, not an appendix.** More of what a general
reader believes about dinosaurs is out of date than in any other subject Folio carries, because the
field was substantially rewritten between 1970 and now and the popular image lags a generation behind.
So the standing rule is the Psychology plan's, in a different subject: **a card on a familiar dinosaur
states what is currently thought and what changed.** The deliberate pairs are `dino-067` the
Brontosaurus question, `dino-069` Nanotyrannus and Torosaurus, `dino-265` what Dilophosaurus actually
was, `dino-491` what Velociraptor was really like, `dino-483` was Tyrannosaurus feathered, `dino-554`
the stegosaur brain myth, `dino-448` Oviraptor and its misnaming, `dino-631` Torosaurus and the
Triceratops question, and `dino-994` the myths that persist. **The card is not a debunking**: a reader
needs to know why the old picture was believed, which is usually that it was the best reading of thinner
evidence.

**Second: feathers are the single biggest change and are carded in proportion — and with their limits.**
`dino-451` to `dino-460` are ten cards in the coelurosaur subdeck, and `dino-460` is deliberately titled
*Which dinosaurs had feathers*, because the popular version has overshot: filamentous integument is
securely known in coelurosaurs and reported in some ornithischians, and **"all dinosaurs were feathered"
is as wrong as the scaly monsters it replaced**. Say what is preserved, in which clades, and what the
distribution does and does not license.

**Third: a genus card states its taxonomic standing, and that standing may change.** Names are sunk into
synonymy, resurrected, split and rediagnosed constantly. `dino-064` nomen dubium and `dino-065` synonymy
card the machinery; every genus card should be written so that a later change is a correction to one
sentence rather than to the card. **Distinguish "sunk" from "disputed"** — *Brontosaurus* is a live
disagreement and *Titanosaurus* is a nomen dubium, and writing either as though it were the other is the
commonest error in popular dinosaur writing.

**Fourth: speculation is labelled as speculation, and the limits are carded.** Colour, sound, social
behaviour and intelligence are where dinosaur writing goes furthest past its evidence, and the
collection cards both the evidence and its edge: `dino-785` melanosomes and fossil colour is a real
method with real results, `dino-787` vocalisation is largely inference from anatomy, and `dino-793`,
`dino-794` and `dino-795` are about what cannot be recovered at all. **A card may say "unknown". It may
not say something vivid instead.**

**Fifth: Jurassic Park is carded as culture, and corrected as science, in two different places.**
`dino-989` and `dino-990` are in the public deck, where the film's influence on the field — including
its role in the funding and popularity of palaeontology — is the subject. The scientific corrections
belong on the animals: the Dilophosaurus frill at `dino-265`, Velociraptor's real size at `dino-491`,
and why dinosaur DNA is not recoverable at `dino-945`. **Do not turn a genus card into a film review.**

## Allocation

| Deck | Subdeck | Cards | Range |
|---|---|---|---|
| What Dinosaurs Are | What a dinosaur is | 20 | dino-001–020 |
|  | Dinosaur anatomy | 35 | dino-021–055 |
|  | Classifying dinosaurs | 30 | dino-056–085 |
| The Mesozoic World | Deep time and the Mesozoic | 20 | dino-086–105 |
|  | Continents and climate | 20 | dino-106–125 |
|  | Mesozoic plants and landscapes | 20 | dino-126–145 |
|  | The other reptiles: sea and sky | 25 | dino-146–170 |
|  | Life beside the dinosaurs | 15 | dino-171–185 |
| Origins and the Triassic | The Permian extinction and its aftermath | 20 | dino-186–205 |
|  | Archosaurs before dinosaurs | 20 | dino-206–225 |
|  | The first dinosaurs | 25 | dino-226–250 |
|  | The Triassic world and the end-Triassic extinction | 25 | dino-251–275 |
| Sauropodomorphs | Early sauropodomorphs | 20 | dino-276–295 |
|  | Sauropods | 35 | dino-296–330 |
|  | The great sauropod groups | 35 | dino-331–365 |
|  | Gigantism | 20 | dino-366–385 |
| Theropods | Early theropods | 20 | dino-386–405 |
|  | Large predators | 30 | dino-406–435 |
|  | Coelurosaurs | 25 | dino-436–460 |
|  | Tyrannosaurs | 25 | dino-461–485 |
|  | Maniraptorans | 20 | dino-486–505 |
|  | The origin of birds | 20 | dino-506–525 |
| Ornithischians | Early ornithischians | 15 | dino-526–540 |
|  | Thyreophorans: stegosaurs and ankylosaurs | 30 | dino-541–570 |
|  | Ornithopods | 25 | dino-571–595 |
|  | Hadrosaurs | 25 | dino-596–620 |
|  | Ceratopsians | 25 | dino-621–645 |
|  | Pachycephalosaurs | 10 | dino-646–655 |
| Dinosaur Biology | Growth and life history | 25 | dino-656–680 |
|  | Physiology and metabolism | 25 | dino-681–705 |
|  | Locomotion | 25 | dino-706–730 |
|  | Feeding and diet | 25 | dino-731–755 |
|  | Reproduction and nests | 20 | dino-756–775 |
|  | Behaviour and society | 20 | dino-776–795 |
| Extinction and Legacy | The end of the Cretaceous | 30 | dino-796–825 |
|  | Recovery and the Cenozoic | 20 | dino-826–845 |
|  | Birds as living dinosaurs | 25 | dino-846–870 |
|  | Dinosaurs and the shape of life | 15 | dino-871–885 |
| Finding and Knowing | Fossilisation and taphonomy | 25 | dino-886–910 |
|  | Finding and excavating | 20 | dino-911–930 |
|  | Studying a fossil | 25 | dino-931–955 |
|  | The history of palaeontology | 25 | dino-956–980 |
|  | Dinosaurs in public | 20 | dino-981–1000 |

Deck totals: What Dinosaurs Are 85 · The Mesozoic World 100 · Origins and the Triassic 90 · Sauropodomorphs 110 · Theropods 140 · Ornithischians 130 · Dinosaur Biology 140 · Extinction and Legacy 90 · Finding and Knowing 115. **1000.**
## What the weighting is arguing

**Theropods take 140 and Ornithischians 130, against 110 for Sauropodomorphs.** That is not a judgement
about interest but about how much there is to say: the theropod line runs from Coelophysis to living
birds and carries the feather evidence, the flight origin and the best-studied predators, and the
ornithischians are four structurally different radiations rather than one. Sauropods are the most
spectacular and the most uniform.

**Dinosaur Biology takes 140 and is the deck a reader should be sent to first after deck 1.** Growth,
metabolism, locomotion, feeding, reproduction and behaviour are what the last fifty years of the science
have actually been about, and they are where the reasoning from bone to animal is visible. A collection
that spent its length on who was biggest would be a bestiary.

**The Mesozoic World takes 100 and none of it is dinosaurs**, which is argued under the scope section
above. Twenty-five of those go to pterosaurs and marine reptiles, largely so `dino-013` and `dino-014`
have something to point at: those are the two animals every reader thinks are dinosaurs.

**Finding and Knowing takes 115 and the history of palaeontology takes 25 of it.** The Bone Wars, the
Gobi expeditions and the dinosaur renaissance are history rather than science, and they are carded
because they explain the shape of the collections and the questions the field asks — and because
`dino-971`, the colonial history of fossil collecting, is a live issue in museums now and cannot be told
without them.

**Extinction takes 90 and 30 of those are the end-Cretaceous event itself.** It is the best-studied mass
extinction in the record, the evidence is unusually direct, and the impact-versus-volcanism argument is
a worked example of how a scientific controversy is actually settled — or, at `dino-825`, not yet.

**Pachycephalosaurs get 10, the smallest subdeck in any collection on the shelf.** They are a real group
with a real literature and there is not more than ten cards in them; padding it to twenty to match its
neighbours would be exactly the failure the scope section warns about.

## Six decisions this plan forced on the tree

**The three great groups get one deck each and are not merged.** Sauropodomorphs, theropods and
ornithischians are the collection's spine, they are how the subject is organised, and a reader who
finishes decks 4 to 6 can place any dinosaur they meet afterwards.

**Birds are carded three times, in three different registers, and that is deliberate.** `dino-015` says
birds are dinosaurs as a fact about classification; `dino-506` to `dino-525` are the origin of birds as
an evolutionary problem with a history; and `dino-846` to `dino-870` are birds as living dinosaurs, what
they inherited, and what studying them tells palaeontologists about the extinct ones. Those are three
questions, not one topic repeated.

**Biology sits after the taxonomy rather than before it.** Growth curves and bite forces mean more once
a reader knows what a tyrannosaur and a sauropod are, and the biology deck can then use them as
examples rather than defining them first.

**Trackways are in the locomotion subdeck, not in a fossil-evidence deck.** Ichnology is a whole
discipline and could have gone in deck 9, but a trackway is evidence about *how an animal moved*, and
separating it from the biomechanics would put the evidence three decks from the claim it supports.

**There is no "famous dinosaurs" deck**, for the reason the Psychology plan gives for having no famous
experiments deck. Tyrannosaurus, Triceratops, Stegosaurus and Velociraptor are each carded inside their
own group, where what they are can be seen against their relatives.

**`dino-1000` is "Where dinosaur science is going" and `dino-999` is "Why dinosaurs matter to people".**
Both plans before this one end on the first of those; this one earns the second as well, because the
public appetite for this subject is itself part of the subject — it funds the field, staffs the museums
and supplies most of its recruits.

## Evidence, not spectacle — and the four pulls

**The rule this section is the local form of lives in CLAUDE.md** ("FOLIO IS A HISTORY SITE, NOT AN
ARCHAEOLOGY SITE" and its historiography half). Four things pull a dinosaur card away from the science.

**Superlatives.** Biggest, fastest, deadliest, most intelligent. This is the register of every popular
treatment and it is a claim about a ranking rather than about an animal, usually resting on a single
fragmentary specimen and an estimation method with wide error bars. `dino-350`, `dino-371` and
`dino-374` exist so that a card can say *estimated at* and mean it. **Give the estimate, the method and
the range.**

**The vivid reconstruction.** A card can describe a hunt, a call, a colour and a social structure and be
entirely unsupported, and it will read better than the honest version. The test is whether a sentence
could be traced to a specimen, a trace fossil or a comparison with a living animal — and where it
cannot, the card says what the inference rests on or does not make it.

**Stale popular science.** Dinosaur books date faster than almost anything else Folio cites, and a
confident 1990s account of tail-dragging, cold blood or Brontosaurus is still on shelves and still
online. **Check the date of anything popular, and prefer the primary literature**, which for this subject
is unusually accessible.

**Taxonomic overconfidence.** A genus is a hypothesis. Where a name is disputed, say by whom and on what
grounds; where a specimen is fragmentary, say so; where a "new species" is one bone, say that. `dino-068`
and `dino-073` card the general problem, and every genus card inherits it.

## This collection follows the no-researchers rule, with the history deck exempt

**Like `bio` and unlike `psych` and `phil`, this collection is NOT excluded from the no-researchers
rule**, and does not need to be: the science is inference from specimens, so a question clues from the
animal or the evidence rather than from who published it. `dino-807` asks what the iridium anomaly is,
not what Alvarez proposed — and `dino-806`, where the hypothesis carries its author's name, is the
exemption rather than the pattern.

**The exemption the rule already provides covers `dino-history` entirely**, because there the answer term
IS a person or their work: Cuvier, Anning, Buckland, the Mantells, Owen, Marsh, Cope, Barnum Brown,
Andrews, Ostrom and Bakker. That is 25 cards where the history of the discipline is the subject, plus a
handful elsewhere (`dino-510` Huxley, `dino-512` Ostrom and Deinonychus, `dino-806` the Alvarez
hypothesis, `dino-986` Charles R. Knight, `dino-987` Zdeněk Burian). **Everywhere else the rule binds
normally**, and so does the historiography cap: at most three of ten sentences on who established a
thing, except in `dino-history` itself.

## Names, dates and figures

**Binomials and genus names are italicised; clade names are not.** *Tyrannosaurus rex*, *Stegosaurus*,
*Velociraptor mongoliensis* — but Theropoda, Sauropoda, Ornithischia, Maniraptora in plain text, and the
anglicised group words (theropod, sauropod, hadrosaur) in plain text and lower case. **A genus is
capitalised and italic even alone**; a species epithet is never used alone. This is the one convention
this collection will get wrong most often, and `check-style.js` cannot see it.

**`split-abstract.js`'s abbreviated-genus rule will be exercised constantly.** *T. rex*, *S. stenops*, a
capital followed by a full stop and a lowercase word, is not a sentence break — the rule was added in
glossary batch L8 for *S. fatalis* and is already in place. **Run the split audit over a batch before
placing footnote markers**, as the Biology plan says for the same reason.

**Dates are geological and `cardYears` already reads them.** The date line takes `Lived` with a Mya
span — `c. 68 – 66 Mya` — which the deep-time parser handles natively, and `yearLabel` prints Mya above
10,000 years. Prefer the span to a single figure: almost every genus is known from a formation with a
dated range rather than from a moment. **A geological AGE name (Maastrichtian, Kimmeridgian) is not a
date `cardYears` can read**, so give the numbers and name the age in words beside them.

**Sizes and masses are given with their method and their uncertainty**, per the superlatives rule above:
"estimated at 8–14 tonnes by volumetric modelling" rather than "weighed 10 tonnes". Metric first with
the imperial conversion the house rule requires, and the conversion does not count against the word
limits.

**Where a figure is one specimen, say so.** *Argentinosaurus* is known from a handful of bones and every
mass estimate for it is an extrapolation; a card that gives a number without that sentence has asserted
a precision nobody has.

## Sourcing

**Unusually well served by open access for a science this popular.**

**The open routes that work.** *PeerJ*, *PLOS ONE*, *Acta Palaeontologica Polonica*, *Palaeontologia
Electronica* and *Scientific Reports* are open and carry a large share of the descriptive literature;
*The Anatomical Record* and *Journal of Anatomy* carry much of the functional morphology. The
**Paleobiology Database** is the standard occurrence resource and its records are citable. Museum
collection catalogues — the American Museum of Natural History, the Natural History Museum, the
Smithsonian, the Canadian Museum of Nature, the IVPP — publish specimen records with numbers, which is
what a card should cite when it names a specimen. The **International Commission on Zoological
Nomenclature** is the authority for the naming rules at `dino-062` to `dino-066`.

**Four hazards, and the second is specific to this field.**

**Popular dinosaur writing dates fastest of anything Folio cites.** See the pulls above. A book from
2005 is not a safe source for anything about feathers, metabolism or the tyrannosaur family.

**A new genus is often described in a single paper and revised in the next.** Before citing a
description, check whether it has been revised, sunk or challenged — the field's turnover is high and
the revision is usually as findable as the original. **Where a genus is contested, cite both sides.**

**Press releases are worse here than almost anywhere**, because a new dinosaur is a story and a
university press office knows it. The gap between "may have hunted in packs" in a paper and "hunted in
packs" in the release is exactly the gap this collection exists to close. Follow the DOI.

**Amateur and enthusiast material is enormous, sometimes excellent and not citable.** Palaeontology has
an unusually good online community and some of it is written by researchers, but a blog post is not a
source under the house rule; follow it to the paper it discusses, which it usually names.

## Living beside the other collections

**BIOLOGY IS THE NEIGHBOUR AND THE OVERLAP IS SMALL — THREE TITLES, MEASURED.** `dino-028` and
`bio-553` are both *The vertebral column*; `dino-088` and `bio-417` are both *The geological timescale*;
`dino-506` and `bio-562` are both *The origin of birds*. That is all, against the eighteen Biology
shares with Psychology, and the reason is that Biology's diversity deck treats dinosaurs in about two
cards. **Write the three pairs deliberately** — Biology's are general and this collection's are about
dinosaurs specifically — and note that the origin of birds is the one where the two are genuinely close;
`bio-562` is one card in a vertebrate survey and `dino-506` opens a subdeck of twenty.

**The evolutionary machinery is Biology's and is not re-taught here.** Natural selection, cladistics,
phylogeny, speciation, extinction and taphonomy all have Biology cards; this collection uses them and
cards them only where the dinosaur case is the point — `dino-058` cladistics *in palaeontology*,
`dino-887` taphonomy, `dino-904` bias in the fossil record. A reader coming here without Biology should
still be able to follow, so the overlap cards define their terms; they do not repeat Biology's deck.

**FIVE GLOSSARY TERMS THIS COLLECTION NEEDS ALREADY EXIST**, checked when this plan was written:
`Amber`, `Stratum` (which already carries *strata* as an alias), `Stratigraphy`, `Geological_epoch` and
`Genus`. Reuse them; do not re-key.

**`Extinction` is the collision to watch, and it is now three-way.** Biology's `bio-897` is the loss of a
species, Psychology's `ps-432` is the weakening of a conditioned response, and this collection's
`dino-796` to `dino-825` are about one particular extinction event. The Biology plan calls for
disambiguated keys; **this collection should key its own terms narrowly** — `Cretaceous–Palaeogene
extinction`, not `Extinction` — and take no claim on the bare surface.

**The card ships with its glossary term, cited at the bar.** This collection's vocabulary is largely
proper nouns, which makes the terms easy to key and easy to duplicate: **check `GLOSSARY` for the genus
before writing it**, since Biology and the prehistory decks may have reached a name first.

# The list

## What Dinosaurs Are

### What a dinosaur is — `dino-def`

    dino-001  Dinosaur
    dino-002  What makes a dinosaur a dinosaur
    dino-003  Dinosauria
    dino-004  The upright stance
    dino-005  The perforate acetabulum
    dino-006  The lizard-hipped dinosaurs
    dino-007  The bird-hipped dinosaurs
    dino-008  The two-hipped division and its challenge
    dino-009  Ornithoscelida
    dino-010  Common misconceptions about dinosaurs
    dino-011  Animals mistaken for dinosaurs
    dino-012  Why Dimetrodon is not a dinosaur
    dino-013  Why pterosaurs are not dinosaurs
    dino-014  Why marine reptiles are not dinosaurs
    dino-015  Birds are dinosaurs
    dino-016  Non-avian dinosaurs
    dino-017  How many dinosaur species there were
    dino-018  How many dinosaurs are known
    dino-019  The geographical spread of dinosaurs
    dino-020  The dinosaur size range

### Dinosaur anatomy — `dino-anatomy`

    dino-021  The dinosaur skeleton
    dino-022  The dinosaur skull
    dino-023  Skull openings and the diapsid condition
    dino-024  The antorbital fenestra
    dino-025  Dinosaur teeth
    dino-026  Tooth replacement
    dino-027  The beak
    dino-028  The vertebral column
    dino-029  Cervical vertebrae
    dino-030  Dorsal vertebrae
    dino-031  The sacrum
    dino-032  The tail
    dino-033  Ossified tendons
    dino-034  The rib cage
    dino-035  Gastralia
    dino-036  The shoulder girdle
    dino-037  The forelimb
    dino-038  The dinosaur hand
    dino-039  The dinosaur pelvis
    dino-040  The hindlimb
    dino-041  The dinosaur foot
    dino-042  Digitigrade posture
    dino-043  Bone histology
    dino-044  Pneumatic bones
    dino-045  Air sacs
    dino-046  The braincase
    dino-047  Endocasts and dinosaur brains
    dino-048  Sensory anatomy
    dino-049  Dinosaur eyes and vision
    dino-050  Hearing in dinosaurs
    dino-051  Smell in dinosaurs
    dino-052  Skin and scales
    dino-053  Feathers in dinosaurs
    dino-054  Osteoderms
    dino-055  Crests, horns and frills

### Classifying dinosaurs — `dino-classify`

    dino-056  Classifying dinosaurs
    dino-057  The dinosaur family tree
    dino-058  Cladistics in palaeontology
    dino-059  Reading a dinosaur cladogram
    dino-060  Character matrices
    dino-061  Convergence and its traps
    dino-062  Naming a dinosaur
    dino-063  The holotype
    dino-064  Nomen dubium
    dino-065  Synonymy
    dino-066  Priority in zoological nomenclature
    dino-067  The Brontosaurus question
    dino-068  Ontogeny and taxonomic inflation
    dino-069  Nanotyrannus and Torosaurus
    dino-070  Species in the fossil record
    dino-071  Sexual dimorphism in dinosaurs
    dino-072  Individual variation
    dino-073  Sample size in palaeontology
    dino-074  The completeness of the fossil record
    dino-075  Lagerstätten
    dino-076  The Yixian Formation
    dino-077  The Morrison Formation
    dino-078  The Hell Creek Formation
    dino-079  The Djadochta Formation
    dino-080  Formations and faunas
    dino-081  Biostratigraphy
    dino-082  Dinosaur biogeography
    dino-083  Vicariance and dispersal
    dino-084  Endemism in dinosaur faunas
    dino-085  What a dinosaur name tells you

## The Mesozoic World

### Deep time and the Mesozoic — `dino-deeptime`

    dino-086  The Mesozoic
    dino-087  Deep time
    dino-088  The geological timescale
    dino-089  Periods, epochs and ages
    dino-090  The Triassic
    dino-091  The Jurassic
    dino-092  The Cretaceous
    dino-093  The Palaeozoic before them
    dino-094  The Cenozoic after them
    dino-095  How long the dinosaurs lasted
    dino-096  Radiometric dating
    dino-097  Half-life and decay
    dino-098  Uranium-lead dating
    dino-099  Argon-argon dating
    dino-100  Relative dating
    dino-101  Index fossils
    dino-102  Correlating rock sequences
    dino-103  Golden spikes and stage boundaries
    dino-104  The precision of Mesozoic dates
    dino-105  Reading a stratigraphic column

### Continents and climate — `dino-continents`

    dino-106  Plate tectonics
    dino-107  Pangaea
    dino-108  The breakup of Pangaea
    dino-109  Laurasia and Gondwana
    dino-110  The opening of the Atlantic
    dino-111  Sea level in the Mesozoic
    dino-112  Epicontinental seas
    dino-113  The Western Interior Seaway
    dino-114  Mesozoic climate
    dino-115  The greenhouse world
    dino-116  Atmospheric carbon dioxide in the Mesozoic
    dino-117  Polar forests
    dino-118  Dinosaurs in the polar regions
    dino-119  Mesozoic deserts
    dino-120  Monsoons and seasonality
    dino-121  Ocean circulation in the Mesozoic
    dino-122  Oceanic anoxic events
    dino-123  Volcanism and large igneous provinces
    dino-124  How Mesozoic climate is reconstructed
    dino-125  Isotopes as palaeothermometers

### Mesozoic plants and landscapes — `dino-plants`

    dino-126  Mesozoic vegetation
    dino-127  Ferns in the Mesozoic
    dino-128  Cycads
    dino-129  Ginkgoes
    dino-130  Conifers in the Mesozoic
    dino-131  Araucarias
    dino-132  Horsetails
    dino-133  Fern prairies
    dino-134  The rise of the flowering plants
    dino-135  The Cretaceous terrestrial revolution
    dino-136  Grasses in the Cretaceous
    dino-137  Amber and what it preserves
    dino-138  Fossil wood
    dino-139  Palaeosols
    dino-140  Rivers and floodplains
    dino-141  Lakes and lake beds
    dino-142  Coastal and deltaic environments
    dino-143  Reconstructing a Mesozoic landscape
    dino-144  Plant and dinosaur coevolution
    dino-145  Fire in the Mesozoic

### The other reptiles: sea and sky — `dino-seasky`

    dino-146  Pterosaurs
    dino-147  Pterosaur flight
    dino-148  Rhamphorhynchoids and pterodactyloids
    dino-149  Pteranodon
    dino-150  Quetzalcoatlus
    dino-151  Pterosaur origins
    dino-152  Pterosaur extinction
    dino-153  Marine reptiles
    dino-154  Ichthyosaurs
    dino-155  Plesiosaurs
    dino-156  Pliosaurs
    dino-157  Mosasaurs
    dino-158  Marine reptile viviparity
    dino-159  The Mesozoic marine revolution
    dino-160  Ammonites
    dino-161  Belemnites
    dino-162  Mesozoic fish
    dino-163  Sharks in the Mesozoic
    dino-164  Crocodylomorphs
    dino-165  Marine crocodiles
    dino-166  Turtles in the Mesozoic
    dino-167  Lizards and snakes in the Mesozoic
    dino-168  Rhynchocephalians
    dino-169  Choristoderes
    dino-170  The Mesozoic seas as an ecosystem

### Life beside the dinosaurs — `dino-neighbours`

    dino-171  Mesozoic mammals
    dino-172  Mammaliaforms
    dino-173  Multituberculates
    dino-174  Repenomamus and mammals that ate dinosaurs
    dino-175  The mammal body plan in the Mesozoic
    dino-176  Mesozoic insects
    dino-177  Pollinating insects
    dino-178  Mesozoic amphibians
    dino-179  Temnospondyls
    dino-180  Mesozoic birds
    dino-181  Enantiornithes
    dino-182  Freshwater life in the Mesozoic
    dino-183  Soil and decomposer communities
    dino-184  Parasites and disease in the Mesozoic
    dino-185  Mesozoic food webs

## Origins and the Triassic

### The Permian extinction and its aftermath — `dino-permian`

    dino-186  The Permian-Triassic extinction
    dino-187  The scale of the Great Dying
    dino-188  Causes of the end-Permian extinction
    dino-189  The Siberian Traps
    dino-190  Ocean anoxia and acidification
    dino-191  Recovery after the extinction
    dino-192  The Early Triassic world
    dino-193  Lystrosaurus
    dino-194  Disaster taxa
    dino-195  Therapsids
    dino-196  Cynodonts
    dino-197  The synapsid decline
    dino-198  The archosaur radiation
    dino-199  Why archosaurs succeeded
    dino-200  Oxygen levels in the Triassic
    dino-201  Reptile diversification in the Triassic
    dino-202  The Triassic as a natural experiment
    dino-203  Dating the Permian-Triassic boundary
    dino-204  Evidence from the Karoo and South China
    dino-205  What the recovery took

### Archosaurs before dinosaurs — `dino-archosaurs`

    dino-206  Archosaurs
    dino-207  The two branches of Archosauria
    dino-208  Pseudosuchians
    dino-209  Aetosaurs
    dino-210  Rauisuchians
    dino-211  Phytosaurs
    dino-212  Ornithodirans
    dino-213  Lagerpetids
    dino-214  Silesaurids
    dino-215  Dinosauromorphs
    dino-216  Marasuchus
    dino-217  The origin of the dinosaur hip
    dino-218  The origin of bipedality
    dino-219  Ankle joints and archosaur locomotion
    dino-220  The Chanares Formation
    dino-221  Footprints before body fossils
    dino-222  The track record of early dinosauromorphs
    dino-223  Competition or opportunity
    dino-224  What the earliest dinosaurs looked like
    dino-225  The archosaur world before the dinosaurs

### The first dinosaurs — `dino-first`

    dino-226  The origin of dinosaurs
    dino-227  The Ischigualasto Formation
    dino-228  Herrerasaurus
    dino-229  Eoraptor
    dino-230  Staurikosaurus
    dino-231  Pisanosaurus
    dino-232  The Carnian Pluvial Episode
    dino-233  The first dinosaur radiation
    dino-234  Early saurischians
    dino-235  Early theropods in the Triassic
    dino-236  Coelophysis
    dino-237  The Ghost Ranch quarry
    dino-238  Early sauropodomorphs in the Triassic
    dino-239  Plateosaurus
    dino-240  Early ornithischians and their scarcity
    dino-241  Dinosaur body size at origin
    dino-242  Where dinosaurs first appeared
    dino-243  The southern origin hypothesis
    dino-244  Dating the earliest dinosaurs
    dino-245  Dinosaurs as a minority group
    dino-246  The slow rise of the dinosaurs
    dino-247  Triassic dinosaur diversity
    dino-248  Silesaurids and the ornithischian gap
    dino-249  What made a dinosaur successful
    dino-250  The debate over dinosaur origins

### The Triassic world and the end-Triassic extinction — `dino-triassic`

    dino-251  The Late Triassic
    dino-252  Triassic ecosystems
    dino-253  The Chinle Formation
    dino-254  The Petrified Forest
    dino-255  Triassic Europe
    dino-256  Triassic Africa and South America
    dino-257  Triassic Asia
    dino-258  Non-dinosaur competitors
    dino-259  The end-Triassic extinction
    dino-260  The Central Atlantic Magmatic Province
    dino-261  What died at the end of the Triassic
    dino-262  Dinosaurs after the extinction
    dino-263  The Early Jurassic recovery
    dino-264  Dilophosaurus
    dino-265  What Dilophosaurus actually was
    dino-266  Scelidosaurus
    dino-267  Heterodontosaurus
    dino-268  Early Jurassic sauropodomorphs
    dino-269  The Lufeng Formation
    dino-270  The Kayenta Formation
    dino-271  Dinosaur footprints of the Newark Supergroup
    dino-272  Body size increase in the Early Jurassic
    dino-273  Ecological release
    dino-274  The Jurassic world takes shape
    dino-275  How the dinosaurs came to dominate

## Sauropodomorphs

### Early sauropodomorphs — `dino-earlysauro`

    dino-276  Sauropodomorpha
    dino-277  The sauropodomorph body plan
    dino-278  Why the term prosauropod was retired
    dino-279  Massospondylus
    dino-280  Riojasaurus
    dino-281  Lufengosaurus
    dino-282  Anchisaurus
    dino-283  Melanorosaurus
    dino-284  The shift to herbivory
    dino-285  Early sauropodomorph diet
    dino-286  Bipedality in early sauropodomorphs
    dino-287  The hand and thumb claw
    dino-288  Early sauropodomorph growth
    dino-289  Massospondylus eggs and embryos
    dino-290  Nesting evidence in early sauropodomorphs
    dino-291  Early sauropodomorph distribution
    dino-292  The transition to quadrupedality
    dino-293  Vulcanodon
    dino-294  The earliest true sauropods
    dino-295  What made sauropods possible

### Sauropods — `dino-sauropods`

    dino-296  Sauropoda
    dino-297  The sauropod body plan
    dino-298  The sauropod neck
    dino-299  How many neck vertebrae
    dino-300  Neck posture in sauropods
    dino-301  The sauropod skull
    dino-302  Sauropod teeth and feeding
    dino-303  Peg teeth and spatulate teeth
    dino-304  Tooth replacement rates
    dino-305  Gastroliths and the gizzard question
    dino-306  The sauropod gut
    dino-307  The sauropod tail
    dino-308  Whip-tailed sauropods
    dino-309  Sauropod limbs
    dino-310  The sauropod foot
    dino-311  Sauropod trackways
    dino-312  Sauropod locomotion
    dino-313  Sauropod speed
    dino-314  Pneumaticity in sauropods
    dino-315  The sauropod respiratory system
    dino-316  Sauropod hearts and blood pressure
    dino-317  Sauropod growth rates
    dino-318  Sauropod eggs
    dino-319  Sauropod nesting sites
    dino-320  Auca Mahuevo
    dino-321  Sauropod hatchling to adult
    dino-322  Sauropod herding
    dino-323  Sauropod skin
    dino-324  Sauropod bone histology
    dino-325  How sauropods fed a body that size
    dino-326  Niche partitioning among sauropods
    dino-327  Sauropod defence
    dino-328  Sauropod predators
    dino-329  Sauropod decline in the Cretaceous
    dino-330  The sauropod hiatus in North America

### The great sauropod groups — `dino-sauropodgroups`

    dino-331  The sauropod family tree
    dino-332  Diplodocoids
    dino-333  Diplodocus
    dino-334  Apatosaurus
    dino-335  Barosaurus
    dino-336  Dicraeosaurids
    dino-337  Amargasaurus
    dino-338  Rebbachisaurids
    dino-339  Macronarians
    dino-340  Camarasaurus
    dino-341  Brachiosaurus
    dino-342  Giraffatitan
    dino-343  Titanosaurs
    dino-344  The titanosaur radiation
    dino-345  Saltasaurus
    dino-346  Titanosaur armour
    dino-347  Argentinosaurus
    dino-348  Patagotitan
    dino-349  Dreadnoughtus
    dino-350  How the largest sauropods are estimated
    dino-351  Mamenchisaurus
    dino-352  Chinese sauropods
    dino-353  Turiasaurs
    dino-354  Dwarf sauropods
    dino-355  Magyarosaurus and island dwarfing
    dino-356  Sauropods of Africa
    dino-357  Sauropods of Australia and Antarctica
    dino-358  Sauropod diversity in the Jurassic
    dino-359  Sauropod diversity in the Cretaceous
    dino-360  The Tendaguru beds
    dino-361  Sauropods of the Bone Wars
    dino-362  Reconstructing a sauropod skeleton
    dino-363  Mounted sauropods in museums
    dino-364  What sauropod fossils rarely preserve
    dino-365  Open questions about sauropods

### Gigantism — `dino-gigantism`

    dino-366  Dinosaur gigantism
    dino-367  Why sauropods grew so large
    dino-368  Constraints on land animal size
    dino-369  The square-cube law
    dino-370  Bone strength and body mass
    dino-371  Estimating dinosaur mass
    dino-372  Volumetric mass estimation
    dino-373  Limb-bone scaling methods
    dino-374  Disagreements between mass methods
    dino-375  Metabolism and body size
    dino-376  Gigantothermy
    dino-377  Food intake at sauropod size
    dino-378  The absence of chewing
    dino-379  Long necks as feeding adaptations
    dino-380  Alternative explanations for long necks
    dino-381  Reproduction and giant size
    dino-382  Why no land mammal reached sauropod size
    dino-383  The largest land animals ever
    dino-384  Upper limits on dinosaur size
    dino-385  What gigantism explains and does not

## Theropods

### Early theropods — `dino-earlytheropod`

    dino-386  Theropoda
    dino-387  The theropod body plan
    dino-388  Theropod teeth
    dino-389  Serrations and cutting teeth
    dino-390  Theropod hands
    dino-391  Theropod feet
    dino-392  Coelophysoids
    dino-393  Dilophosaurids
    dino-394  Ceratosaurs
    dino-395  Ceratosaurus
    dino-396  Abelisaurids
    dino-397  Carnotaurus
    dino-398  Majungasaurus
    dino-399  Noasaurids
    dino-400  Theropods of Gondwana
    dino-401  Theropod diversity in the Jurassic
    dino-402  Small theropods and their preservation
    dino-403  Theropod growth stages
    dino-404  Theropod bite force
    dino-405  How theropod diets are inferred

### Large predators — `dino-bigpredators`

    dino-406  Large theropods
    dino-407  Megalosaurids
    dino-408  Megalosaurus
    dino-409  Torvosaurus
    dino-410  Spinosaurids
    dino-411  Baryonyx
    dino-412  Suchomimus
    dino-413  Spinosaurus
    dino-414  The Spinosaurus sail
    dino-415  The aquatic Spinosaurus debate
    dino-416  Spinosaurid diet and fish-eating
    dino-417  Allosauroids
    dino-418  Allosaurus
    dino-419  The Cleveland-Lloyd Quarry
    dino-420  Carcharodontosaurids
    dino-421  Giganotosaurus
    dino-422  Carcharodontosaurus
    dino-423  Mapusaurus
    dino-424  Neovenatorids
    dino-425  Metriacanthosaurids
    dino-426  The largest theropods
    dino-427  Comparing theropod sizes
    dino-428  Predator-prey ratios
    dino-429  Theropod hunting strategies
    dino-430  Pack hunting and its evidence
    dino-431  Scavenging and predation
    dino-432  Injuries and pathologies in theropods
    dino-433  Theropod interactions preserved as fossils
    dino-434  The Fighting Dinosaurs specimen
    dino-435  Bite marks on bone

### Coelurosaurs — `dino-coelurosaurs`

    dino-436  Coelurosauria
    dino-437  The coelurosaur radiation
    dino-438  Compsognathids
    dino-439  Compsognathus
    dino-440  Ornithomimosaurs
    dino-441  Ornithomimus and Struthiomimus
    dino-442  Deinocheirus
    dino-443  Alvarezsaurs
    dino-444  Therizinosaurs
    dino-445  Therizinosaurus
    dino-446  Therizinosaur herbivory
    dino-447  Oviraptorosaurs
    dino-448  Oviraptor and its misnaming
    dino-449  Citipati and brooding
    dino-450  Caudipteryx
    dino-451  Feathered coelurosaurs
    dino-452  The Jehol Biota
    dino-453  Sinosauropteryx
    dino-454  The first feathered dinosaur discoveries
    dino-455  Filamentous integument
    dino-456  Feather types in dinosaurs
    dino-457  The evolution of the feather
    dino-458  What feathers were first for
    dino-459  Feathers beyond coelurosaurs
    dino-460  Which dinosaurs had feathers

### Tyrannosaurs — `dino-tyrannosaurs`

    dino-461  Tyrannosauroidea
    dino-462  Early tyrannosauroids
    dino-463  Dilong
    dino-464  Yutyrannus
    dino-465  Guanlong
    dino-466  The tyrannosaur size increase
    dino-467  Tyrannosauridae
    dino-468  Albertosaurus
    dino-469  Gorgosaurus
    dino-470  Daspletosaurus
    dino-471  Tarbosaurus
    dino-472  Tyrannosaurus rex
    dino-473  Tyrannosaurus anatomy
    dino-474  The tyrannosaur skull and bite
    dino-475  Tyrannosaur arms
    dino-476  Tyrannosaur senses
    dino-477  Tyrannosaur growth curves
    dino-478  Sue the Tyrannosaurus
    dino-479  Tyrannosaur speed and locomotion
    dino-480  Predator or scavenger
    dino-481  Tyrannosaur feeding traces
    dino-482  Tyrannosaur social behaviour
    dino-483  Was Tyrannosaurus feathered
    dino-484  Tyrannosaur species disputes
    dino-485  Tyrannosaurs at the end of the Cretaceous

### Maniraptorans — `dino-maniraptor`

    dino-486  Maniraptora
    dino-487  The maniraptoran hand
    dino-488  The semilunate carpal
    dino-489  Dromaeosaurids
    dino-490  Velociraptor
    dino-491  What Velociraptor was really like
    dino-492  Deinonychus
    dino-493  Utahraptor
    dino-494  Microraptor
    dino-495  Four-winged dinosaurs
    dino-496  The sickle claw and its use
    dino-497  Troodontids
    dino-498  Troodontid intelligence claims
    dino-499  Scansoriopterygids
    dino-500  Yi qi and membranous wings
    dino-501  Maniraptoran brooding
    dino-502  Sleeping postures in maniraptorans
    dino-503  Maniraptoran diets
    dino-504  Maniraptorans and flight
    dino-505  The maniraptoran-bird boundary

### The origin of birds — `dino-birdorigin`

    dino-506  The origin of birds
    dino-507  Archaeopteryx
    dino-508  The Solnhofen limestone
    dino-509  Archaeopteryx and the reception of evolution
    dino-510  Huxley and the dinosaur-bird link
    dino-511  The eclipse and revival of the dinosaur hypothesis
    dino-512  Ostrom and Deinonychus
    dino-513  The evidence that birds are dinosaurs
    dino-514  The temporal paradox and its resolution
    dino-515  Avialae
    dino-516  Confuciusornis
    dino-517  Enantiornithines and ornithuromorphs
    dino-518  The origin of flight
    dino-519  Ground-up and trees-down hypotheses
    dino-520  Wing-assisted incline running
    dino-521  The flight stroke and the flight apparatus
    dino-522  The loss of teeth in birds
    dino-523  Body size reduction on the bird line
    dino-524  Miniaturisation and innovation
    dino-525  What made birds different

## Ornithischians

### Early ornithischians — `dino-earlyornith`

    dino-526  Ornithischia
    dino-527  The ornithischian body plan
    dino-528  The predentary bone
    dino-529  Ornithischian teeth and chewing
    dino-530  Cheeks in ornithischians
    dino-531  The ornithischian gut
    dino-532  Heterodontosaurids
    dino-533  Lesothosaurus
    dino-534  The scarcity of early ornithischians
    dino-535  Ornithischian origins
    dino-536  Ornithischian bipedality and quadrupedality
    dino-537  Ornithischian growth
    dino-538  Ornithischian armour
    dino-539  Ornithischian display structures
    dino-540  The three ornithischian lineages

### Thyreophorans: stegosaurs and ankylosaurs — `dino-thyreophora`

    dino-541  Thyreophora
    dino-542  Scutellosaurus
    dino-543  Scelidosaurus and early armour
    dino-544  Stegosauria
    dino-545  Stegosaurus
    dino-546  The stegosaur plates
    dino-547  What the plates were for
    dino-548  The thagomizer
    dino-549  Stegosaur defence
    dino-550  Kentrosaurus
    dino-551  Miragaia
    dino-552  Huayangosaurus
    dino-553  Stegosaur diet and feeding height
    dino-554  The stegosaur brain myth
    dino-555  Stegosaur decline
    dino-556  Ankylosauria
    dino-557  Ankylosaurids
    dino-558  Nodosaurids
    dino-559  Ankylosaurus
    dino-560  Euoplocephalus
    dino-561  Borealopelta
    dino-562  Borealopelta and preserved colour
    dino-563  The ankylosaur tail club
    dino-564  Ankylosaur armour construction
    dino-565  Ankylosaur skulls and nasal passages
    dino-566  Ankylosaur diet
    dino-567  Ankylosaur locomotion
    dino-568  Ankylosaurs in the Cretaceous
    dino-569  Thyreophoran distribution
    dino-570  Armour as evidence of predation

### Ornithopods — `dino-ornithopods`

    dino-571  Ornithopoda
    dino-572  Small ornithopods
    dino-573  Hypsilophodon
    dino-574  Thescelosaurus
    dino-575  Orodromeus
    dino-576  Dryosaurus
    dino-577  Camptosaurus
    dino-578  Iguanodontians
    dino-579  Iguanodon
    dino-580  The discovery of Iguanodon
    dino-581  The Bernissart iguanodonts
    dino-582  The Iguanodon thumb spike
    dino-583  Mantellisaurus
    dino-584  Ouranosaurus and its sail
    dino-585  Tenontosaurus
    dino-586  The Tenontosaurus and Deinonychus association
    dino-587  Ornithopod chewing
    dino-588  The dental battery
    dino-589  Ornithopod locomotion
    dino-590  Ornithopod trackways
    dino-591  Ornithopod growth
    dino-592  Ornithopod herding
    dino-593  Polar ornithopods
    dino-594  Ornithopod diversity through time
    dino-595  Why ornithopods were successful

### Hadrosaurs — `dino-hadrosaurs`

    dino-596  Hadrosauridae
    dino-597  The hadrosaur body plan
    dino-598  The duck bill
    dino-599  Hadrosaurines and lambeosaurines
    dino-600  Edmontosaurus
    dino-601  Shantungosaurus
    dino-602  Maiasaura
    dino-603  Egg Mountain and hadrosaur parenting
    dino-604  Parasaurolophus
    dino-605  The Parasaurolophus crest
    dino-606  Crest function and sound
    dino-607  Corythosaurus
    dino-608  Lambeosaurus
    dino-609  Hypacrosaurus
    dino-610  Hadrosaur teeth and chewing mechanics
    dino-611  Hadrosaur diet
    dino-612  Hadrosaur mummies
    dino-613  Preserved hadrosaur skin
    dino-614  Hadrosaur growth rates
    dino-615  Hadrosaur bonebeds
    dino-616  Hadrosaur migration claims
    dino-617  Hadrosaur pathologies
    dino-618  Hadrosaur distribution
    dino-619  Hadrosaur abundance in the Late Cretaceous
    dino-620  Why hadrosaurs were so numerous

### Ceratopsians — `dino-ceratopsians`

    dino-621  Ceratopsia
    dino-622  Psittacosaurus
    dino-623  Psittacosaurus and preserved soft tissue
    dino-624  Protoceratops
    dino-625  The Protoceratops nests
    dino-626  Leptoceratopsids
    dino-627  Ceratopsidae
    dino-628  Centrosaurines
    dino-629  Chasmosaurines
    dino-630  Triceratops
    dino-631  Torosaurus and the Triceratops question
    dino-632  Styracosaurus
    dino-633  Pachyrhinosaurus
    dino-634  The ceratopsian frill
    dino-635  Frill function
    dino-636  Ceratopsian horns
    dino-637  Horn use and injuries
    dino-638  The ceratopsian beak and dental battery
    dino-639  Ceratopsian diet
    dino-640  Ceratopsian bonebeds
    dino-641  Ceratopsian herding
    dino-642  Ceratopsian growth series
    dino-643  Ceratopsian distribution
    dino-644  The Asian origin of ceratopsians
    dino-645  Ceratopsian diversity at the end of the Cretaceous

### Pachycephalosaurs — `dino-pachy`

    dino-646  Pachycephalosauria
    dino-647  Pachycephalosaurus
    dino-648  Stygimoloch and Dracorex
    dino-649  The pachycephalosaur dome
    dino-650  Head-butting and its evidence
    dino-651  Pachycephalosaur pathologies
    dino-652  Pachycephalosaur diet
    dino-653  Pachycephalosaur rarity
    dino-654  Marginocephalia
    dino-655  What pachycephalosaurs are still unclear about

## Dinosaur Biology

### Growth and life history — `dino-growth`

    dino-656  Dinosaur growth
    dino-657  Bone histology as a record of growth
    dino-658  Lines of arrested growth
    dino-659  Dinosaur growth curves
    dino-660  Determinate and indeterminate growth
    dino-661  How fast dinosaurs grew
    dino-662  Age at maturity
    dino-663  Dinosaur lifespan
    dino-664  Juvenile dinosaurs
    dino-665  Ontogenetic change in shape
    dino-666  Recognising ontogenetic stages
    dino-667  Baby dinosaurs
    dino-668  Growth and metabolism
    dino-669  Growth rates compared with living animals
    dino-670  Dwarfism in dinosaurs
    dino-671  Island rules in the fossil record
    dino-672  Sexual maturity before full size
    dino-673  Medullary bone
    dino-674  Sexing a dinosaur
    dino-675  Growth in giant sauropods
    dino-676  Growth in tyrannosaurs
    dino-677  Population age structure
    dino-678  Survivorship in dinosaur populations
    dino-679  Dinosaur mortality
    dino-680  What growth tells us about biology

### Physiology and metabolism — `dino-physiology`

    dino-681  Dinosaur metabolism
    dino-682  Ectothermy and endothermy
    dino-683  The warm-blooded dinosaur debate
    dino-684  Mesothermy
    dino-685  Evidence from bone histology
    dino-686  Evidence from oxygen isotopes
    dino-687  Evidence from growth rates
    dino-688  Predator-prey ratios as evidence
    dino-689  Posture and activity
    dino-690  The dinosaur respiratory system
    dino-691  Unidirectional airflow
    dino-692  Air sacs and pneumaticity
    dino-693  The dinosaur heart
    dino-694  Blood pressure in long-necked dinosaurs
    dino-695  Body temperature regulation in giants
    dino-696  Insulation and feathers
    dino-697  Dinosaur skin physiology
    dino-698  Water balance in dinosaurs
    dino-699  Dinosaur excretion
    dino-700  Dinosaur digestion
    dino-701  Fermentation in dinosaurs
    dino-702  Coprolites
    dino-703  Gut contents as evidence
    dino-704  Dinosaur disease
    dino-705  Palaeopathology

### Locomotion — `dino-locomotion`

    dino-706  Dinosaur locomotion
    dino-707  Bipedal and quadrupedal dinosaurs
    dino-708  Limb posture
    dino-709  Gait
    dino-710  Estimating dinosaur speed
    dino-711  Trackway speed formulas
    dino-712  Biomechanical modelling
    dino-713  Muscle reconstruction
    dino-714  Tendons and ligaments
    dino-715  The tail as a counterbalance
    dino-716  Turning and manoeuvrability
    dino-717  Running dinosaurs
    dino-718  The fastest dinosaurs
    dino-719  Swimming dinosaurs
    dino-720  Climbing and arboreality
    dino-721  Gliding and powered flight
    dino-722  Footprints and trackways
    dino-723  Ichnotaxa
    dino-724  Reading a trackway
    dino-725  Trackway evidence for behaviour
    dino-726  Undertracks and preservation
    dino-727  Manus-only trackways
    dino-728  Trackways and body mass
    dino-729  Famous trackway sites
    dino-730  What trackways add to skeletons

### Feeding and diet — `dino-feeding`

    dino-731  Dinosaur diets
    dino-732  Herbivorous dinosaurs
    dino-733  Carnivorous dinosaurs
    dino-734  Omnivory in dinosaurs
    dino-735  Insectivory in dinosaurs
    dino-736  Tooth shape and diet
    dino-737  Tooth microwear
    dino-738  Jaw mechanics
    dino-739  Chewing in ornithischians
    dino-740  Processing food without chewing
    dino-741  Bite force estimation
    dino-742  Skull stress modelling
    dino-743  Feeding envelopes and reach
    dino-744  Browse height partitioning
    dino-745  Plant availability and diet
    dino-746  Dinosaur herbivore guilds
    dino-747  Predation on dinosaurs
    dino-748  Prey selection
    dino-749  Cannibalism in dinosaurs
    dino-750  Fish-eating dinosaurs
    dino-751  Filter feeding claims
    dino-752  Egg eating
    dino-753  Stomach stones reconsidered
    dino-754  Isotopes and diet
    dino-755  What we cannot tell about diet

### Reproduction and nests — `dino-repro`

    dino-756  Dinosaur reproduction
    dino-757  Dinosaur eggs
    dino-758  Eggshell structure
    dino-759  Ootaxa
    dino-760  Egg shape and clutch arrangement
    dino-761  Nesting behaviour
    dino-762  Nest sites and colonies
    dino-763  Brooding dinosaurs
    dino-764  Incubation
    dino-765  Parental care
    dino-766  Precocial and altricial young
    dino-767  Embryos in the fossil record
    dino-768  Baby Louie and embryonic finds
    dino-769  Egg incubation times
    dino-770  Clutch size
    dino-771  Reproductive output and body size
    dino-772  Dinosaur sex determination
    dino-773  Courtship and display
    dino-774  Nest-scrape display traces
    dino-775  What dinosaur reproduction was not like

### Behaviour and society — `dino-behaviour`

    dino-776  Dinosaur behaviour
    dino-777  Inferring behaviour from fossils
    dino-778  Herding and gregariousness
    dino-779  Bonebeds as behavioural evidence
    dino-780  Migration in dinosaurs
    dino-781  Territoriality in dinosaurs
    dino-782  Combat between dinosaurs
    dino-783  Display structures and signalling
    dino-784  Colour in dinosaurs
    dino-785  Melanosomes and fossil colour
    dino-786  Countershading
    dino-787  Vocalisation in dinosaurs
    dino-788  Dinosaur hearing and communication
    dino-789  Nocturnality in dinosaurs
    dino-790  Dinosaur intelligence
    dino-791  Brain size and encephalisation
    dino-792  Social behaviour in theropods
    dino-793  Play and other unknowables
    dino-794  Behavioural inference and its limits
    dino-795  What we will probably never know

## Extinction and Legacy

### The end of the Cretaceous — `dino-endcret`

    dino-796  The Cretaceous-Palaeogene extinction
    dino-797  The K-Pg boundary
    dino-798  What died out
    dino-799  What survived
    dino-800  The last dinosaurs
    dino-801  Latest Cretaceous faunas
    dino-802  Hell Creek at the boundary
    dino-803  The Deccan Traps
    dino-804  Volcanism as a cause
    dino-805  The impact hypothesis
    dino-806  The Alvarez hypothesis
    dino-807  The iridium anomaly
    dino-808  Shocked quartz
    dino-809  Tektites and spherules
    dino-810  The Chicxulub crater
    dino-811  Dating the impact
    dino-812  The impact winter
    dino-813  Wildfires and their evidence
    dino-814  Ocean acidification at the boundary
    dino-815  The sequence of events
    dino-816  The Tanis site and its claims
    dino-817  The declining-diversity debate
    dino-818  Were dinosaurs already in decline
    dino-819  Sampling bias in the last dinosaurs
    dino-820  Regional differences in the extinction
    dino-821  Selectivity of the extinction
    dino-822  Extinction in the sea
    dino-823  Extinction on land
    dino-824  Combining impact and volcanism
    dino-825  What the K-Pg extinction is still argued about

### Recovery and the Cenozoic — `dino-recovery`

    dino-826  The Palaeocene
    dino-827  The recovery of ecosystems
    dino-828  Disaster floras
    dino-829  The fern spike
    dino-830  Mammal diversification after the extinction
    dino-831  The rise of the mammals
    dino-832  Bird diversification after the extinction
    dino-833  The Palaeocene-Eocene Thermal Maximum
    dino-834  Crocodilians as survivors
    dino-835  Why some lineages survived
    dino-836  Body size and survival
    dino-837  Diet and survival
    dino-838  The freshwater refuge hypothesis
    dino-839  Cenozoic terrestrial giants
    dino-840  Terror birds
    dino-841  Was there a second chance for dinosaurs
    dino-842  The Cenozoic world without non-avian dinosaurs
    dino-843  Comparing mass extinctions
    dino-844  The K-Pg extinction as a model for today
    dino-845  Extinction and evolutionary opportunity

### Birds as living dinosaurs — `dino-livingbirds`

    dino-846  Birds as living dinosaurs
    dino-847  What birds inherited from dinosaurs
    dino-848  The avian skeleton
    dino-849  The furcula
    dino-850  The pygostyle
    dino-851  The avian respiratory system
    dino-852  Bird eggs and dinosaur eggs
    dino-853  Bird brooding and dinosaur brooding
    dino-854  Bird growth compared with dinosaur growth
    dino-855  Bird feathers and dinosaur feathers
    dino-856  Bird flight and its origins
    dino-857  The avian beak
    dino-858  Tooth loss and the modern bird skull
    dino-859  Modern bird diversity
    dino-860  Neornithes
    dino-861  Palaeognaths and neognaths
    dino-862  The bird family tree
    dino-863  Molecular evidence in bird phylogeny
    dino-864  Dating the origin of modern birds
    dino-865  Birds through the K-Pg
    dino-866  Flightlessness in birds
    dino-867  What studying birds tells palaeontologists
    dino-868  The extant phylogenetic bracket
    dino-869  Using living animals to reconstruct extinct ones
    dino-870  Why calling birds dinosaurs matters

### Dinosaurs and the shape of life — `dino-legacy`

    dino-871  The dinosaurs' place in the history of life
    dino-872  How long dinosaurs ruled
    dino-873  Dinosaur diversity through time
    dino-874  Counting dinosaur species through time
    dino-875  Sampling bias in diversity curves
    dino-876  The dinosaur record by continent
    dino-877  Continental drift and dinosaur distribution
    dino-878  Dinosaurs and mammal evolution
    dino-879  What dinosaurs tell us about evolution
    dino-880  Convergence between dinosaurs and mammals
    dino-881  Dinosaurs and body size evolution
    dino-882  Ecosystems with and without dinosaurs
    dino-883  Dinosaurs in the fossil record of the future
    dino-884  What if the impact had missed
    dino-885  Counterfactuals in evolution

## Finding and Knowing

### Fossilisation and taphonomy — `dino-taphonomy`

    dino-886  Fossilisation
    dino-887  Taphonomy
    dino-888  What becomes a fossil
    dino-889  Permineralisation
    dino-890  Moulds and casts
    dino-891  Compression fossils
    dino-892  Soft tissue preservation
    dino-893  Exceptional preservation
    dino-894  Amber preservation
    dino-895  Mummified dinosaurs
    dino-896  Bone diagenesis
    dino-897  Scavenging and disarticulation
    dino-898  Transport and sorting
    dino-899  Bonebed formation
    dino-900  Monodominant bonebeds
    dino-901  Trace fossils
    dino-902  Coprolites as trace fossils
    dino-903  Gastroliths as trace fossils
    dino-904  Bias in the fossil record
    dino-905  Preservation bias by environment
    dino-906  Preservation bias by body size
    dino-907  Collection bias
    dino-908  The Signor-Lipps effect
    dino-909  Estimating what is missing
    dino-910  What taphonomy adds to interpretation

### Finding and excavating — `dino-excavation`

    dino-911  Prospecting for fossils
    dino-912  Where dinosaur fossils are found
    dino-913  Badlands and exposure
    dino-914  Reading the geology first
    dino-915  Excavation methods
    dino-916  The plaster jacket
    dino-917  Field documentation
    dino-918  Mapping a quarry
    dino-919  Removing a large specimen
    dino-920  Fossil preparation
    dino-921  Air scribes and acid preparation
    dino-922  Consolidants and adhesives
    dino-923  Conservation of fossils
    dino-924  Cataloguing and accession
    dino-925  Fossil collections and repositories
    dino-926  The law and fossil ownership
    dino-927  Commercial fossil collecting
    dino-928  Fossil poaching and smuggling
    dino-929  Repatriation of fossils
    dino-930  Fieldwork and local communities

### Studying a fossil — `dino-study`

    dino-931  Describing a new dinosaur
    dino-932  Comparative anatomy in palaeontology
    dino-933  Measuring fossils
    dino-934  Photogrammetry
    dino-935  CT scanning fossils
    dino-936  Synchrotron imaging
    dino-937  Three-dimensional models
    dino-938  Digital reconstruction
    dino-939  Finite element analysis
    dino-940  Biomechanical simulation
    dino-941  Histological thin sections
    dino-942  Geochemical analysis of bone
    dino-943  Ancient proteins
    dino-944  The ancient DNA limit
    dino-945  Why dinosaur DNA is not recoverable
    dino-946  Molecular palaeontology
    dino-947  Phylogenetic analysis in practice
    dino-948  Statistical methods in palaeontology
    dino-949  Palaeoart and scientific reconstruction
    dino-950  Skeletal reconstruction
    dino-951  Life restoration
    dino-952  Shrink-wrapping and its critics
    dino-953  Rigour in palaeoart
    dino-954  Peer review in palaeontology
    dino-955  Reanalysis and replication of fossil studies

### The history of palaeontology — `dino-history`

    dino-956  Fossils before palaeontology
    dino-957  Dragon bones and giants
    dino-958  Georges Cuvier and extinct animals
    dino-959  Mary Anning
    dino-960  William Buckland and Megalosaurus
    dino-961  Gideon and Mary Mantell
    dino-962  Richard Owen and the naming of Dinosauria
    dino-963  The Crystal Palace dinosaurs
    dino-964  The first American dinosaurs
    dino-965  The Bone Wars
    dino-966  Othniel Marsh and Edward Cope
    dino-967  The consequences of the Bone Wars
    dino-968  Barnum Brown
    dino-969  The Central Asiatic Expeditions
    dino-970  Roy Chapman Andrews and the Gobi
    dino-971  The colonial history of fossil collecting
    dino-972  The Tendaguru expedition
    dino-973  Dinosaur research in China
    dino-974  Soviet and Mongolian expeditions
    dino-975  The dinosaur doldrums
    dino-976  The dinosaur renaissance
    dino-977  Bakker and the renaissance argument
    dino-978  Palaeontology since 1990
    dino-979  Who does palaeontology now
    dino-980  The pace of new discoveries

### Dinosaurs in public — `dino-public`

    dino-981  Dinosaurs in museums
    dino-982  The mounted skeleton
    dino-983  Casts and replicas
    dino-984  The changing museum dinosaur
    dino-985  Dinosaurs in books and illustration
    dino-986  Charles R. Knight
    dino-987  Zdeněk Burian
    dino-988  Dinosaurs in film
    dino-989  Jurassic Park and its influence
    dino-990  What Jurassic Park got wrong
    dino-991  Dinosaurs in toys and merchandise
    dino-992  Dinosaurs and children
    dino-993  Dinosaurs and popular science
    dino-994  Dinosaur myths that persist
    dino-995  Auctions and the market for fossils
    dino-996  Naming dinosaurs after people and places
    dino-997  Public engagement and citizen science
    dino-998  Dinosaurs and the teaching of evolution
    dino-999  Why dinosaurs matter to people
    dino-1000  Where dinosaur science is going
