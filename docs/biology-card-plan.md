# Biology — a 1000-card running order

The plan for `bio`, a new collection: every card's number, topic and deck, fixed in advance so the
collection can be grown one card at a time over many sessions without anyone having to remember what
was intended.

It is the fourteenth of these and the third that is not a history collection, after Psychology and
Philosophy. Read `docs/greece-card-plan.md` first if this is the first plan you have met; the mechanics
are identical and are not repeated here.

---

## How to use this (the whole point of the file)

**The next card to write is the lowest `bio-NNN` not yet in `data.js`.**

    node -e "global.window={};require('./data.js');const h=new Set(window.CARD_DATA.map(c=>c.id));for(let i=1;i<=1000;i++){const id='bio-'+String(i).padStart(3,'0');if(!h.has(id)){console.log(id);break}}"

Look the number up below, research it, write it, and add it with the deck id this file gives:

    node .claude/add-card.js <card.json> <deckId>

**Always pass the deck id.** Without one `add-card.js` falls back to the first leaf in the whole tree,
which is in China.

There is deliberately **no progress file**. `data.js` says what exists and this file says what is
planned; the next card is whatever falls between them, so the two can never come to disagree about
where the work had got to.

The padding above is right for every id but the last: the ids are `bio-001` … `bio-999`, then
`bio-1000`.

## What a line in this list is, and is not

A line is a **subject to research**, not a fact to assert and not necessarily the finished answer term.
`bio-384 The Hardy-Weinberg principle` is already an answer term; `bio-488 Whether viruses are alive` is
an argument to describe, and the card's actual answer — the word that gets blanked — is chosen while
writing it, from what the sources will support.

So: **a topic may be renamed, split, merged or dropped when the research is done.** When that happens,
change the line here in the same commit as the card, and say so — this file is only useful while it is
true.

The one thing that must not happen is a card written to fill a slot. The house rule stands: never
invent a date, a name or a definition. If a topic cannot be sourced, say so and replace the line.

## Making the collection

**The collection does not exist yet and this plan creates it** — the node, its tree, its `COLL_THEME`
hue and its `COLLECTION_ICON` row all ship with the file, as they did for Egypt, the Second World War,
Japan, Psychology and Philosophy.

**The id is `bio` and the card prefix is `bio-`**, free of every existing prefix and no prefix of any of
them. Note that the deck ids are also `bio-…` (`bio-what`, `bio-cell`); that is the pattern every
collection uses (`ps-what`, `ph-what`) and the plan checker tells the two apart by their headings, not
by their names.

**It goes in the EXISTING `Science` section**, which shipped inert with Psychology and now has a second
collection in it. That retires the objection recorded in Psychology's plan — a heading over one
collection — without any change to `COLLECTION_SECTIONS`: `COLLECTION_SECTION` gains one row mapping
`bio` to `Science`, and that is the whole of it. The section still draws nothing until one of the two
has a card, because `PAGES.decks` skips a section with no available collections.

**The hue is `#36481E`, a very dark forest green**, and this is the one hue on the shelf that adds to a
CROWDED family rather than an empty one, which needs stating. Green is the shelf's most populated
colour: Egypt's malachite, Geography's olive and two of the language decks are already there. The two
best-separated regions on the wheel were, for the third collection running, an **olive-brass at 30.4**
and a **hot magenta at 30.6**, and both were rejected on the same grounds Psychology's and Philosophy's
comments give — the brass would now be the fifth thing in the yellow-green-brown quarter, and the
magenta is at chroma 61 on a shelf that is muted throughout.

**What justifies a fifth green is that it is much DARKER than the other four.** At L\* 28 against their
39, 42, 55 and 55, it is the darkest green by eleven points, and the measurement agrees: its nearest
neighbour is not a green at all but **the Second World War's dark iron, at 24.3**, with Geography's
olive a hair behind at 24.5. That clears the shelf's own median nearest-neighbour distance of 22.7,
which is the bar this shelf has settled on — Psychology's plum cleared it at 27.1, Philosophy's petrol
deliberately did not at 19.8 — and it reads 10.0:1 against white, the highest contrast on the shelf.
**Green is also the one hue on the shelf that is APT rather than arbitrary**, which is worth something
in a subject whose readers will meet it before they read the label.

**It gets a `COLLECTION_ICON` row and a new symbol, `helix`** — a DNA double helix, the one mark that
says *biology* rather than any single branch of it. A leaf was rejected because the picker already has
one and because it says botany; a cell was rejected because a circle inside a circle is already the
`coin` symbol.

## What this collection is about, and the five scope decisions

**It is biology as it is actually taught: molecules upward, then the organism, then the world it lives
in.** Six of the nine decks are the standard syllabus spine — chemistry of life, the cell, genetics,
evolution, diversity, physiology — and the other three are ecology, plant biology and a closing deck on
behaviour, health and how biological knowledge is made. A reader who finishes it should be able to open
any general biology textbook at any chapter and recognise what it is about.

**First: evolution is the spine, not a chapter.** Deck 4 is 110 cards, and more importantly the rest of
the collection is written as though deck 4 were true, because it is: the diversity deck is organised
phylogenetically, the physiology deck asks what a structure is FOR, and the genetics deck ends in
population genetics. **`bio-380` cards creationism and the teaching of evolution as an event in the
history of education and law**, which is what it is; the collection does not argue with it, because
there is no scientific controversy to report and manufacturing one would be the failure the Second World
War plan warns about in a different register.

**Second: this collection shares eighteen card titles with Psychology, twelve of them in one subdeck,
and that is deliberate.** `bio-nervous` and Psychology's `ps-neuron` / `ps-brain` / `ps-hormones` both
have to cover the neuron, the action potential, the synapse and the endocrine system — a biology
collection without them is not a biology collection, and neither is a psychology one. **The division is
that biology cards the MECHANISM and psychology cards what it EXPLAINS**: `bio-744` sits among ion
channels, myelin and comparative physiology, and `ps-227` sits among neurotransmitter systems and what
drugs do to mood. The full list is under "Living beside the other collections", together with the two
operational rules that follow — one about the glossary, one about a word that means different things in
the two collections.

**Third: plants get a deck of their own and 80 cards.** Plant biology is the part of the syllabus
readers skip and examiners keep setting, and folding it into the physiology deck — where animal systems
would crowd it out — is how it comes to be treated as a footnote to animals. Deck 5 additionally gives
the plant KINGDOM 20 cards of diversity, so the two together are 100.

**Fourth: the collection says what is known, how it is known, and where the argument still is.** The
last subdeck, `bio-practice`, cards sampling, statistics, animal research, peer review and replication
— the Psychology plan's methods deck at a smaller scale, and for the same reason: a reader who cannot
read an error bar cannot evaluate a finding. Where biology has live arguments — `bio-379` the extended
synthesis, `bio-401` group selection, `bio-407` the biological species concept, `bio-875` the ecosystem concept,
`bio-920` what conservation biology argues about — they are carded as arguments with the positions
named, not resolved.

**Fifth: the applied and contested subjects are carded as biology, not as opinion.** GM crops, gene
editing in humans, animal research, biosecurity, patenting life and climate change are all here. The
rule is the one the history plans use: give the evidence, give the range with whose it is, and do not
adjudicate the value question — which is where `docs/philosophy-card-plan.md`'s applied ethics subdeck
picks it up. **On the factual half there is no even-handedness to perform**: that the climate is warming
and that vaccines do not cause autism are findings, and a card that hedges them to seem balanced is
inaccurate.

## Allocation

| Deck | Subdeck | Cards | Range |
|---|---|---|---|
| Foundations and the Chemistry of Life | What biology is | 20 | bio-001–020 |
|  | The chemistry of life | 25 | bio-021–045 |
|  | Biological molecules | 30 | bio-046–075 |
|  | Energy and enzymes | 15 | bio-076–090 |
| The Cell | Cells and cell theory | 20 | bio-091–110 |
|  | Cell structures | 25 | bio-111–135 |
|  | Membranes and transport | 20 | bio-136–155 |
|  | Cellular respiration | 20 | bio-156–175 |
|  | Photosynthesis | 25 | bio-176–200 |
| Genetics and Molecular Biology | Mendelian genetics | 25 | bio-201–225 |
|  | Chromosomes and cell division | 25 | bio-226–250 |
|  | DNA and its replication | 25 | bio-251–275 |
|  | Genes to proteins | 25 | bio-276–300 |
|  | Gene regulation and genomics | 30 | bio-301–330 |
| Evolution | Natural selection and its evidence | 30 | bio-331–360 |
|  | The history of evolutionary thought | 20 | bio-361–380 |
|  | Population genetics | 25 | bio-381–405 |
|  | Speciation and macroevolution | 20 | bio-406–425 |
|  | Phylogeny and the tree of life | 15 | bio-426–440 |
| The Diversity of Life | Classification | 20 | bio-441–460 |
|  | Viruses, bacteria and archaea | 30 | bio-461–490 |
|  | Protists and fungi | 20 | bio-491–510 |
|  | The plant kingdom | 20 | bio-511–530 |
|  | Invertebrates | 20 | bio-531–550 |
|  | Vertebrates | 20 | bio-551–570 |
| Plant Biology | Plant structure | 20 | bio-571–590 |
|  | Transport and nutrition in plants | 20 | bio-591–610 |
|  | Plant growth and hormones | 20 | bio-611–630 |
|  | Plant reproduction | 20 | bio-631–650 |
| Animal Form and Function | Tissues, organs and homeostasis | 15 | bio-651–665 |
|  | Nutrition and digestion | 20 | bio-666–685 |
|  | Gas exchange and circulation | 25 | bio-686–710 |
|  | Excretion and osmoregulation | 15 | bio-711–725 |
|  | Support and movement | 15 | bio-726–740 |
|  | Nerves, senses and hormones | 25 | bio-741–765 |
|  | Immunity and disease | 20 | bio-766–785 |
|  | Reproduction and development | 20 | bio-786–805 |
| Ecology and the Environment | Populations | 20 | bio-806–825 |
|  | Communities and interactions | 25 | bio-826–850 |
|  | Ecosystems and energy flow | 25 | bio-851–875 |
|  | Biomes and biogeography | 20 | bio-876–895 |
|  | Conservation and global change | 25 | bio-896–920 |
| Behaviour, Health and Biology Today | Animal behaviour | 25 | bio-921–945 |
|  | Human health and disease | 25 | bio-946–970 |
|  | Biotechnology and society | 15 | bio-971–985 |
|  | Doing biology | 15 | bio-986–1000 |

Deck totals: Foundations and the Chemistry of Life 90 · The Cell 110 · Genetics and Molecular Biology 130 · Evolution 110 · The Diversity of Life 130 · Plant Biology 80 · Animal Form and Function 155 · Ecology and the Environment 115 · Behaviour, Health and Biology Today 80. **1000.**
## What the weighting is arguing

**Animal Form and Function is the largest deck at 155, in eight subdecks.** Physiology is where a
general biology course spends most of its time and where a reader's own body is the worked example, and
it genuinely has that many systems: nothing is gained by folding excretion into circulation to make the
tree look tidier. It is also the deck most likely to be studied on its own, by somebody revising for a
human biology paper.

**Genetics and Molecular Biology takes 130 and Evolution 110, and the two are consecutive on purpose.**
The modern synthesis is the joining of those two subjects, and a reader who meets population genetics
(`bio-381`–`bio-405`) directly after the molecular deck has the machinery to see why. Genetics comes
first because Hardy-Weinberg is arithmetic over allele frequencies and the alleles have to exist first.

**Diversity gets 130 and the microbes get 30 of it — more than the vertebrates and the invertebrates
separately.** This is a correction to how the subject is usually taught. Bacteria, archaea and viruses
are most of the planet's genetic diversity, most of its metabolic diversity and most of its biomass by
some measures, and a diversity deck that spends its length on animals is teaching a reader that life is
mostly things with faces.

**Ecology gets 115 and a quarter of it is conservation and global change.** That is not advocacy: it is
where the discipline's research effort and its public relevance both are, and the material is
well-sourced and rapidly moving.

**Plant Biology gets 80 and Photosynthesis gets 25 inside the cell deck.** Between them that is a tenth
of the collection on organisms most readers cannot name three of, which is roughly the proportion the
subject deserves and about twice what popular biology gives it.

**Foundations gets 90 and only 15 of it is enzymes.** The chemistry is a means: enough to read the rest
and no more. A biology collection that spent forty cards on bonding would be a chemistry collection with
a biology label.

## Six decisions this plan forced on the tree

**Cell division sits in the genetics deck, not the cell deck.** Mitosis and meiosis are mechanically
cell biology and conceptually genetics — meiosis exists to be explained by what it does to alleles — and
splitting them from `bio-mendel` would put crossing over three decks away from independent assortment.

**Photosynthesis and respiration are both in the cell deck, adjacent, and `bio-199` compares them.**
They are usually taught apart, in the plant chapter and the animal chapter, which is how a reader comes
away thinking one is a plant process and the other an animal one. Plants respire.

**The plant KINGDOM is in the diversity deck and plant PHYSIOLOGY is its own deck.** The split follows
the two questions: what plants there are, and how a plant works. `bio-521` (the flower as an
evolutionary innovation) is diversity; `bio-634` (the flower) is anatomy, and they are written as a
pair.

**Human biology is not a deck.** Humans appear throughout deck 7 as the worked example, and `bio-946` to
`bio-970` card human health as its own subject. A separate human deck would either duplicate the
physiology or hollow it out.

**Behaviour sits in the last deck rather than in ecology.** Behavioural ecology genuinely belongs with
ecology and `bio-behaviour` is full of it — foraging, territoriality, mating systems — but the subdeck
also carries reflexes, learning and circadian rhythms, which are physiology, and eusociality, which is
evolution. It is its own subject and it is put where it can be.

**Forty-six leaf decks is the most on the shelf, and it is not an accident.** China has 39 and Japan 34.
Biology is the most systematically subdivided subject Folio carries, and the tree mirrors the way it is
taught rather than flattening it to match the other collections.

## Evidence, not just conclusions — and the four pulls

**The rule this section is the local form of lives in CLAUDE.md** ("FOLIO IS A HISTORY SITE, NOT AN
ARCHAEOLOGY SITE" and its historiography half). Four things pull a biology card away from biology.

**The bare fact.** Biology has more nameable facts than any other subject Folio carries, and the easiest
bad card in the collection is a definition followed by nine sentences of elaboration. **Ten sentences is
room for the mechanism and the evidence**: what the structure does, how that was established, and what
it would look like if it were false. `bio-262` (the Meselson-Stahl experiment) is in the plan precisely
so `bio-261` does not have to assert semi-conservative replication on authority.

**Teleology.** "The heart is designed to pump blood", "the plant wants to reach the light", "evolution
is trying to". This is the register the whole subject slides into, it is how `bio-359` (common
misunderstandings of natural selection) comes to be needed, and it is a genuine error rather than loose
speech — it teaches a reader that adaptation is purposive. Write what the structure does and what
selection acted on.

**The textbook simplification that is wrong.** One gene one protein; the tongue map; dominant means
common; the lock and key; "junk DNA"; the five-kingdom system; humans use 10% of their brains. Where the
simplification is what a reader arrives holding, the card names it and corrects it — the Psychology
plan's rule about carding myths as myths, one subject over. `bio-292`, `bio-271`, `bio-450` and
`bio-083` all exist for this reason.

**Human exceptionalism, in both directions.** A card can imply humans are the point of evolution, or
overcorrect into denying that anything about us is distinctive. `bio-424` human evolution and `bio-569`
primates are both in decks where humans are one lineage among many, which is the accurate frame, and
`bio-946` opens the deck where humans are the subject.

## This collection follows the no-researchers rule, with one qualification

**Unlike `psych` and `phil`, this collection is NOT excluded from it** — and it does not need to be.
Biology's content is overwhelmingly mechanism rather than argument, so a question can nearly always be
clued from what the thing DOES: `bio-384` asks what stays constant in a population that is not evolving,
not who worked it out. The rule stands: **a question may not name a researcher**, and naming the
finding, the law or the model instead is almost always the better clue anyway.

**The qualification is that a card whose ANSWER TERM is a person or a named experiment is exempt**, as
the rule already provides. That covers `bio-202` Mendel, `bio-362` Linnaeus, `bio-366` Darwin,
`bio-368` Wallace, `bio-256` Rosalind Franklin and Photo 51, and the four named experiments in
`bio-dna` — about a dozen cards in the thousand, which is well inside what the history collections
allow, and the two-scholar cap is met with room to spare because the modern scientists here are almost
all in `bio-evohistory`, where the history of the theory IS the subject.

**The historiography cap binds normally.** `bio-evohistory` is 20 cards about how the theory came to be
believed, which is history of science and is meant to be; everywhere else, at most three of ten
sentences may be about who established a thing.

## Names, units and figures

**British spelling and the standard biological conventions.** Binomial names are italicised and
capitalised on the genus only — *Homo sapiens*, *Escherichia coli* — and abbreviated to *E. coli* after
first use. **`split-abstract.js` has a rule for exactly this**: an abbreviated genus (a capital, a full
stop and a lowercase word) is not a sentence break, added in glossary batch L8 after *S. fatalis* split
`Smilodon` into six sentences. It is already fixed; the point is that this collection will exercise it
on nearly every diversity card, so **run the split audit over a batch before placing footnote markers**.

**SI units throughout, with the imperial conversion the house rule requires** where a reader would think
in it — a whale's length, a tree's height — and NOT where the unit is scientific. "940 cubic centimetres
(57 cubic inches)" is worse, not better, and CLAUDE.md says so; a micrometre, a mole and a kilojoule
take no bracket.

**Scale is the thing this subject most often gets wrong and most needs stated.** A cell is measured in
micrometres, a virus in nanometres, a genome in base pairs, an ecosystem in hectares. Give the figure
with its unit and, where it is the point of the card, give the comparison — `bio-097` (surface area to
volume) is a card about arithmetic and needs real numbers to be worth anything.

**Figures that move are given with their date and their source.** Species counts (`bio-454`), global
population (`bio-823`), extinction rates (`bio-898`) and Red List numbers (`bio-910`) all change and are
all contested; give the range, name whose it is, and say when it was estimated. The Phase 3 rule from
`docs/glossary-citation-plan.md` applies here at scale: a figure that disagrees with a source is usually
STALE rather than wrong, and the fix is to date it.

## Sourcing

**Very well served, and the trap is the opposite of Philosophy's.** Where philosophy's open sources are
too old, biology's problem is that the field moves fast enough that a ten-year-old review can be
superseded without being wrong-looking.

**The open routes that work.** PubMed Central and Europe PMC for the primary literature; PLOS, eLife,
BMC and the other open-access publishers; the NCBI resources (GenBank, OMIM, Taxonomy) for reference
data; UniProt for proteins; the IUCN Red List, GBIF and the Catalogue of Life for species and
conservation; the IPCC and IPBES assessment reports for global change, which are themselves syntheses
with full citation trails; Kew and the Missouri Botanical Garden for plants. **NCBI Bookshelf carries
several full textbooks** — Molecular Biology of the Cell, Molecular Cell Biology, parts of Griffiths —
open and citable, which is unusual and worth reaching for on a mechanism card.

**Four hazards.**

**A review article is a secondary source and dates.** For a mechanism that is settled, the textbook or a
recent review is right; for anything at the edge — the extended synthesis, the microbiome's effects, de
novo gene birth — check the date and prefer the most recent review that is still peer-reviewed.

**The press release and the paper say different things**, exactly as the Psychology plan records. The
gap is documented and it is widest in genomics, microbiome research and anything about ageing or cancer.
Follow the DOI.

**Preprints are not peer-reviewed** and bioRxiv is enormous. Label one in its citation, as the plan for
psychology labels PsyArXiv.

**Some of this material is politically contested and none of the contestation is scientific.** Evolution,
vaccines, climate change and GM foods each have a large, confident, well-funded literature that is not
science, and some of it is designed to look like it. The citation bar is the defence and should be
applied without exception: a peer-reviewed work, a national scientific body, an intergovernmental
assessment, or a museum or agency with a research department — opened and read.

## Living beside the other collections

**PSYCHOLOGY IS THE CLOSE NEIGHBOUR AND EIGHTEEN CARD TITLES ARE SHARED VERBATIM.** Twelve are in one
subdeck. The pairs, so nobody has to find them:

    bio-741 = ps-246  The nervous system        bio-742 = ps-221  The neuron
    bio-743 = ps-226  The resting potential     bio-744 = ps-227  The action potential
    bio-745 = ps-228  Saltatory conduction      bio-746 = ps-229  The synapse
    bio-747 = ps-230  Neurotransmitters         bio-748 = ps-253  The reflex arc
    bio-749 = ps-247  The central nervous system    bio-750 = ps-249  The autonomic nervous system
    bio-753 = ps-357  The eye                   bio-759 = ps-321  The endocrine system
    bio-761 = ps-322  The pituitary gland       bio-005 = ps-704  Homeostasis
    bio-307 = ps-309  Epigenetics               bio-340 = ps-314  Sexual selection
    bio-927 = ps-320  Ethology                  bio-897 = ps-432  Extinction

**Three operational rules follow, and the third is the one that will actually bite.**

**Write the pair deliberately, or the second one written will restate the first.** Biology cards the
mechanism and psychology cards what it explains — see scope decision two. On four or five of these the
difference will be genuinely thin, and that is an acceptable cost of two collections that both have to
cover the material; it is not an acceptable cost if nobody notices and writes the same ten sentences
twice.

**THE GLOSSARY IS SITE-WIDE, SO THE TERM IS WRITTEN ONCE.** `docs/card-glossary-pairing.md` says a card
ships with a glossary entry for its answer term; for a shared pair that entry is written by whichever
collection reaches it first, cited at the bar, and the second card links to the existing term rather
than adding a second key. **Check `GLOSSARY` before writing the term, not after.**

**`bio-897` AND `ps-432` ARE NOT THE SAME WORD.** Biology's *extinction* is the loss of a species;
psychology's is the weakening of a conditioned response when the reinforcer stops. They are unrelated
technical senses of one English word, they cannot share a glossary key, and whichever is keyed
`Extinction` will auto-link on the other collection's cards and be wrong there. **This needs a
disambiguated key** — `Extinction_(biology)` and `Extinction_(learning)`, with `glossKeyTitle`'s rule in
mind: a key with a parenthetical does NOT claim the bare name, so if either wants the bare surface it
must say so with an alias, and both wanting it is exactly the collision `check-gloss-links.js` reports.
The same care is owed to *adaptation*, *plasticity*, *conditioning* and *culture*, which mean different
things in the two collections.

**FOUR GLOSSARY TERMS THIS COLLECTION NEEDS ALREADY EXIST**, checked when this plan was written:
`Domestication`, `Boreal`, `Human_evolution` and `Genus`. Reuse them; do not re-key. **`Boreal` is
already `caseSensitive`** — CLAUDE.md records why, and `bio-883` (boreal forest) is precisely the card
that would have broken it.

**Philosophy shares no card title with this collection and meets it at four places all the same** —
`ph-867` philosophy of biology, `ph-922` bioethics, `ph-928` animal ethics and `ph-930` environmental
ethics. The division is the one that plan already states: **biology says what is the case and philosophy
asks what follows.** `bio-993` (animals in research) is what is done, what it is regulated by and what
the evidence says about alternatives; `ph-928` is the argument about whether it is permissible.

**World History and the history collections carry the science at survey altitude** and never wait for
this one. `bio-evohistory` and a World History card on Darwin are different cards: one is about how a
theory came to be believed, the other about a Victorian and his century.

**The card ships with its glossary term, cited at the bar.** With 1000 cards and the most technical
vocabulary on the site, this collection will add more glossary terms than any other — which is why the
"write it once" rule above matters more here than anywhere.

# The list

## Foundations and the Chemistry of Life

### What biology is — `bio-what`

    bio-001  Biology
    bio-002  The characteristics of living things
    bio-003  Levels of biological organisation
    bio-004  The cell as the unit of life
    bio-005  Homeostasis
    bio-006  Metabolism
    bio-007  The scientific method in biology
    bio-008  Hypothesis and experiment in biology
    bio-009  Controls and variables in biological experiments
    bio-010  Observation and measurement in biology
    bio-011  The microscope
    bio-012  Magnification and resolution
    bio-013  Model organisms
    bio-014  The major fields of biology
    bio-015  Biology and the other sciences
    bio-016  Emergent properties
    bio-017  Structure and function
    bio-018  The unity and diversity of life
    bio-019  Why biology has so few laws
    bio-020  Correlation and causation in biology

### The chemistry of life — `bio-chem`

    bio-021  The chemical elements of life
    bio-022  Atoms and molecules
    bio-023  The chemical bond
    bio-024  Covalent bonds
    bio-025  Ionic bonds
    bio-026  Hydrogen bonds
    bio-027  Water
    bio-028  The polarity of water
    bio-029  Cohesion and adhesion
    bio-030  The specific heat capacity of water
    bio-031  Water as a solvent
    bio-032  Ice and density
    bio-033  Acids and bases
    bio-034  pH
    bio-035  Buffers
    bio-036  Organic chemistry and carbon
    bio-037  Functional groups
    bio-038  Isomers
    bio-039  Condensation and hydrolysis
    bio-040  Monomers and polymers
    bio-041  Oxidation and reduction
    bio-042  Chemical energy
    bio-043  Inorganic ions in organisms
    bio-044  Trace elements
    bio-045  Chemistry as the basis of life

### Biological molecules — `bio-molecules`

    bio-046  Biological molecules
    bio-047  Carbohydrates
    bio-048  Monosaccharides
    bio-049  Disaccharides
    bio-050  Polysaccharides
    bio-051  Starch
    bio-052  Glycogen
    bio-053  Cellulose
    bio-054  Chitin
    bio-055  Lipids
    bio-056  Triglycerides
    bio-057  Fatty acids
    bio-058  Saturated and unsaturated fats
    bio-059  Phospholipids
    bio-060  Steroids
    bio-061  Proteins
    bio-062  Amino acids
    bio-063  The peptide bond
    bio-064  Primary protein structure
    bio-065  Secondary protein structure
    bio-066  Tertiary protein structure
    bio-067  Quaternary protein structure
    bio-068  Protein folding
    bio-069  Denaturation
    bio-070  Nucleic acids
    bio-071  Nucleotides
    bio-072  ATP
    bio-073  Testing for biological molecules
    bio-074  The structure-function relationship in molecules
    bio-075  Chromatography and separating biomolecules

### Energy and enzymes — `bio-energy`

    bio-076  Energy in living systems
    bio-077  The laws of thermodynamics in biology
    bio-078  Free energy and spontaneity
    bio-079  Coupled reactions
    bio-080  Enzymes
    bio-081  Enzymes as catalysts
    bio-082  The active site
    bio-083  The lock-and-key and induced-fit models
    bio-084  Enzyme kinetics
    bio-085  The effect of temperature on enzymes
    bio-086  The effect of pH on enzymes
    bio-087  Enzyme inhibitors
    bio-088  Competitive and non-competitive inhibition
    bio-089  Cofactors and coenzymes
    bio-090  Enzymes in industry

## The Cell

### Cells and cell theory — `bio-celltheory`

    bio-091  What every cell has in common
    bio-092  Cell theory
    bio-093  The discovery of the cell
    bio-094  Prokaryotic cells
    bio-095  Eukaryotic cells
    bio-096  The differences between prokaryotes and eukaryotes
    bio-097  Cell size and the surface-area-to-volume ratio
    bio-098  Light microscopy
    bio-099  Electron microscopy
    bio-100  Cell fractionation
    bio-101  Cell staining
    bio-102  Unicellular and multicellular life
    bio-103  Cell specialisation
    bio-104  Stem cells
    bio-105  Tissues
    bio-106  Organs and organ systems
    bio-107  The origin of eukaryotic cells
    bio-108  The endosymbiotic theory
    bio-109  Cell culture
    bio-110  Studying cells today

### Cell structures — `bio-organelles`

    bio-111  Organelles
    bio-112  The nucleus
    bio-113  The nucleolus
    bio-114  Chromatin
    bio-115  The nuclear envelope
    bio-116  Ribosomes
    bio-117  The rough endoplasmic reticulum
    bio-118  The smooth endoplasmic reticulum
    bio-119  The Golgi apparatus
    bio-120  Lysosomes
    bio-121  Vesicles and the secretory pathway
    bio-122  Mitochondria
    bio-123  Chloroplasts
    bio-124  Vacuoles
    bio-125  Peroxisomes
    bio-126  The cytoskeleton
    bio-127  Microtubules
    bio-128  Centrioles
    bio-129  Cilia and flagella
    bio-130  The cell wall
    bio-131  Plasmodesmata
    bio-132  Cell junctions
    bio-133  The extracellular matrix
    bio-134  Plant and animal cells compared
    bio-135  The cell as a compartmentalised system

### Membranes and transport — `bio-membrane`

    bio-136  The cell membrane
    bio-137  The phospholipid bilayer
    bio-138  The fluid mosaic model
    bio-139  Membrane proteins
    bio-140  Cholesterol in membranes
    bio-141  Membrane permeability
    bio-142  Diffusion
    bio-143  Facilitated diffusion
    bio-144  Osmosis
    bio-145  Water potential
    bio-146  Osmosis in plant and animal cells
    bio-147  Active transport
    bio-148  The sodium-potassium pump
    bio-149  Co-transport
    bio-150  Endocytosis
    bio-151  Exocytosis
    bio-152  Membrane potential
    bio-153  Cell signalling
    bio-154  Receptors and signal transduction
    bio-155  Membranes and drug action

### Cellular respiration — `bio-respiration`

    bio-156  Cellular respiration
    bio-157  Aerobic and anaerobic respiration
    bio-158  Glycolysis
    bio-159  The link reaction
    bio-160  The Krebs cycle
    bio-161  The electron transport chain
    bio-162  Oxidative phosphorylation
    bio-163  Chemiosmosis
    bio-164  ATP synthase
    bio-165  The mitochondrion's structure and function
    bio-166  The yield of ATP
    bio-167  Anaerobic respiration in animals
    bio-168  Fermentation
    bio-169  Respiratory substrates
    bio-170  The respiratory quotient
    bio-171  Measuring respiration rate
    bio-172  Metabolic rate
    bio-173  Respiration and exercise
    bio-174  Respiratory poisons
    bio-175  Respiration across the living world

### Photosynthesis — `bio-photosynthesis`

    bio-176  Photosynthesis
    bio-177  The leaf as a photosynthetic organ
    bio-178  The chloroplast
    bio-179  Photosynthetic pigments
    bio-180  Chlorophyll
    bio-181  The absorption and action spectra
    bio-182  The light-dependent reactions
    bio-183  Photosystems
    bio-184  Photolysis of water
    bio-185  Photophosphorylation
    bio-186  Cyclic and non-cyclic electron flow
    bio-187  The light-independent reactions
    bio-188  The Calvin cycle
    bio-189  RuBisCO
    bio-190  Photorespiration
    bio-191  C4 photosynthesis
    bio-192  CAM photosynthesis
    bio-193  Limiting factors in photosynthesis
    bio-194  Measuring the rate of photosynthesis
    bio-195  The evolution of photosynthesis
    bio-196  Photosynthesis and the atmosphere
    bio-197  Chemosynthesis
    bio-198  Photosynthesis and food production
    bio-199  Comparing photosynthesis and respiration
    bio-200  Energy flow from sunlight to life

## Genetics and Molecular Biology

### Mendelian genetics — `bio-mendel`

    bio-201  Genetics
    bio-202  Gregor Mendel
    bio-203  Mendel's experiments with peas
    bio-204  The law of segregation
    bio-205  The law of independent assortment
    bio-206  Genes and alleles
    bio-207  Dominant and recessive alleles
    bio-208  Genotype and phenotype
    bio-209  Homozygous and heterozygous
    bio-210  The monohybrid cross
    bio-211  The Punnett square
    bio-212  The test cross
    bio-213  The dihybrid cross
    bio-214  Codominance
    bio-215  Incomplete dominance
    bio-216  Multiple alleles
    bio-217  Blood groups as a genetic trait
    bio-218  Sex determination
    bio-219  Sex-linked inheritance
    bio-220  Autosomal linkage
    bio-221  Epistasis
    bio-222  Polygenic inheritance
    bio-223  The chi-squared test in genetics
    bio-224  Pedigree analysis
    bio-225  The rediscovery of Mendel

### Chromosomes and cell division — `bio-chromosomes`

    bio-226  Chromosomes
    bio-227  The karyotype
    bio-228  Homologous chromosomes
    bio-229  The cell cycle
    bio-230  Interphase
    bio-231  Mitosis
    bio-232  The stages of mitosis
    bio-233  Cytokinesis
    bio-234  The spindle apparatus
    bio-235  Checkpoints in the cell cycle
    bio-236  Cancer as a disease of cell division
    bio-237  Oncogenes and tumour suppressor genes
    bio-238  Meiosis
    bio-239  The stages of meiosis
    bio-240  Crossing over
    bio-241  Independent assortment in meiosis
    bio-242  Genetic variation from meiosis
    bio-243  Comparing mitosis and meiosis
    bio-244  Gametogenesis
    bio-245  Non-disjunction
    bio-246  Chromosomal disorders
    bio-247  Polyploidy
    bio-248  Binary fission
    bio-249  Telomeres
    bio-250  Apoptosis

### DNA and its replication — `bio-dna`

    bio-251  DNA
    bio-252  The structure of DNA
    bio-253  The double helix
    bio-254  Base pairing
    bio-255  The discovery of DNA's structure
    bio-256  Rosalind Franklin and Photo 51
    bio-257  The Hershey-Chase experiment
    bio-258  The Avery-MacLeod-McCarty experiment
    bio-259  Chargaff's rules
    bio-260  DNA replication
    bio-261  Semi-conservative replication
    bio-262  The Meselson-Stahl experiment
    bio-263  DNA polymerase
    bio-264  The replication fork
    bio-265  Leading and lagging strands
    bio-266  Okazaki fragments
    bio-267  Proofreading and DNA repair
    bio-268  The genome
    bio-269  Genes
    bio-270  Introns and exons
    bio-271  Non-coding DNA
    bio-272  Repetitive DNA
    bio-273  DNA packaging and histones
    bio-274  RNA and its types
    bio-275  Comparing DNA and RNA

### Genes to proteins — `bio-protein`

    bio-276  The central dogma of molecular biology
    bio-277  Transcription
    bio-278  RNA polymerase
    bio-279  The promoter
    bio-280  Messenger RNA
    bio-281  RNA processing and splicing
    bio-282  Alternative splicing
    bio-283  The genetic code
    bio-284  Codons
    bio-285  The degeneracy of the genetic code
    bio-286  Cracking the genetic code
    bio-287  Translation
    bio-288  Transfer RNA
    bio-289  The ribosome in translation
    bio-290  Initiation, elongation and termination
    bio-291  Post-translational modification
    bio-292  One gene, one enzyme
    bio-293  Mutation
    bio-294  Point mutations
    bio-295  Frameshift mutations
    bio-296  Silent, missense and nonsense mutations
    bio-297  Mutagens
    bio-298  Sickle cell anaemia as a molecular disease
    bio-299  Protein targeting
    bio-300  From genotype to phenotype

### Gene regulation and genomics — `bio-regulation`

    bio-301  Gene expression
    bio-302  Gene regulation in prokaryotes
    bio-303  The lac operon
    bio-304  Gene regulation in eukaryotes
    bio-305  Transcription factors
    bio-306  Enhancers and silencers
    bio-307  Epigenetics
    bio-308  DNA methylation
    bio-309  Histone modification
    bio-310  RNA interference
    bio-311  Homeotic genes
    bio-312  Hox genes and body plans
    bio-313  Genomics
    bio-314  The Human Genome Project
    bio-315  DNA sequencing
    bio-316  The polymerase chain reaction
    bio-317  Gel electrophoresis
    bio-318  DNA profiling
    bio-319  Restriction enzymes
    bio-320  Recombinant DNA
    bio-321  Plasmids as vectors
    bio-322  Genetic engineering
    bio-323  Genetically modified organisms
    bio-324  Gene therapy
    bio-325  CRISPR and genome editing
    bio-326  Cloning
    bio-327  Bioinformatics
    bio-328  Proteomics
    bio-329  Personalised medicine
    bio-330  The ethics of genetic technology

## Evolution

### Natural selection and its evidence — `bio-selection`

    bio-331  Evolution
    bio-332  Natural selection
    bio-333  Variation
    bio-334  Overproduction and competition
    bio-335  Adaptation
    bio-336  Fitness
    bio-337  Directional selection
    bio-338  Stabilising selection
    bio-339  Disruptive selection
    bio-340  Sexual selection
    bio-341  Artificial selection
    bio-342  The fossil record as evidence
    bio-343  Transitional fossils
    bio-344  Comparative anatomy
    bio-345  Homologous structures
    bio-346  Analogous structures
    bio-347  Vestigial structures
    bio-348  Embryological evidence
    bio-349  Molecular evidence for evolution
    bio-350  Biogeographical evidence
    bio-351  Antibiotic resistance as observed evolution
    bio-352  Industrial melanism
    bio-353  Darwin's finches
    bio-354  Convergent evolution
    bio-355  Coevolution
    bio-356  Mimicry
    bio-357  Camouflage
    bio-358  Evolutionary arms races
    bio-359  Common misunderstandings of natural selection
    bio-360  What natural selection cannot do

### The history of evolutionary thought — `bio-evohistory`

    bio-361  Ideas of species before Darwin
    bio-362  Carl Linnaeus
    bio-363  Georges Cuvier and extinction
    bio-364  Jean-Baptiste Lamarck
    bio-365  Charles Lyell and deep time
    bio-366  Charles Darwin
    bio-367  The voyage of the Beagle
    bio-368  Alfred Russel Wallace
    bio-369  On the Origin of Species
    bio-370  The reception of Darwin's theory
    bio-371  The problem of heredity for Darwin
    bio-372  The eclipse of Darwinism
    bio-373  The modern synthesis
    bio-374  Theodosius Dobzhansky
    bio-375  The molecular revolution in evolution
    bio-376  The neutral theory
    bio-377  Punctuated equilibrium
    bio-378  Evolutionary developmental biology
    bio-379  The extended evolutionary synthesis debate
    bio-380  Creationism and the teaching of evolution

### Population genetics — `bio-popgen`

    bio-381  Population genetics
    bio-382  The gene pool
    bio-383  Allele frequency
    bio-384  The Hardy-Weinberg principle
    bio-385  The Hardy-Weinberg equation
    bio-386  What disturbs Hardy-Weinberg equilibrium
    bio-387  Genetic drift
    bio-388  The founder effect
    bio-389  The bottleneck effect
    bio-390  Gene flow
    bio-391  Mutation as the source of variation
    bio-392  Selection coefficients
    bio-393  Heterozygote advantage
    bio-394  Balancing selection
    bio-395  Frequency-dependent selection
    bio-396  Sickle cell and malaria
    bio-397  Inbreeding and its effects
    bio-398  Effective population size
    bio-399  Molecular clocks
    bio-400  Kin selection and inclusive fitness
    bio-401  Group selection and its critics
    bio-402  The gene's eye view
    bio-403  Altruism in evolution
    bio-404  The evolution of sex
    bio-405  The evolution of ageing

### Speciation and macroevolution — `bio-speciation`

    bio-406  The species concept
    bio-407  The biological species concept and its problems
    bio-408  Reproductive isolation
    bio-409  Prezygotic and postzygotic barriers
    bio-410  Speciation
    bio-411  Allopatric speciation
    bio-412  Sympatric speciation
    bio-413  Adaptive radiation
    bio-414  Ring species
    bio-415  Hybridisation
    bio-416  Macroevolution
    bio-417  The geological timescale
    bio-418  Mass extinctions
    bio-419  The Cambrian explosion
    bio-420  The colonisation of land
    bio-421  Major transitions in evolution
    bio-422  The origin of life
    bio-423  The RNA world hypothesis
    bio-424  Human evolution
    bio-425  What fossils can and cannot tell us

### Phylogeny and the tree of life — `bio-phylogeny`

    bio-426  Phylogeny
    bio-427  The phylogenetic tree
    bio-428  Reading a cladogram
    bio-429  Cladistics
    bio-430  Monophyletic, paraphyletic and polyphyletic groups
    bio-431  Homology and synapomorphy
    bio-432  Molecular phylogenetics
    bio-433  Sequence alignment
    bio-434  Parsimony and likelihood methods
    bio-435  Horizontal gene transfer
    bio-436  The three-domain system
    bio-437  The last universal common ancestor
    bio-438  The tree of life today
    bio-439  Taxonomy and phylogeny compared
    bio-440  Dating a phylogeny

## The Diversity of Life

### Classification — `bio-taxonomy`

    bio-441  Classification
    bio-442  The taxonomic hierarchy
    bio-443  Binomial nomenclature
    bio-444  The species
    bio-445  Genus
    bio-446  Family, order and class
    bio-447  Phylum
    bio-448  Kingdom
    bio-449  Domain
    bio-450  The five-kingdom system
    bio-451  Type specimens
    bio-452  Identification keys
    bio-453  Naming a new species
    bio-454  How many species there are
    bio-455  Cryptic species
    bio-456  Biodiversity
    bio-457  The value of a museum collection
    bio-458  DNA barcoding
    bio-459  Common names and why they mislead
    bio-460  Classification as a working hypothesis

### Viruses, bacteria and archaea — `bio-microbes`

    bio-461  Microbiology
    bio-462  Bacteria
    bio-463  Bacterial cell structure
    bio-464  Gram staining
    bio-465  Bacterial shapes
    bio-466  Bacterial reproduction
    bio-467  Bacterial conjugation
    bio-468  Bacterial metabolism
    bio-469  Nitrogen-fixing bacteria
    bio-470  Extremophiles
    bio-471  Archaea
    bio-472  The discovery of the archaea
    bio-473  Bacteria and human health
    bio-474  The microbiome
    bio-475  Antibiotics
    bio-476  Antibiotic resistance
    bio-477  Culturing bacteria
    bio-478  Aseptic technique
    bio-479  Viruses
    bio-480  Virus structure
    bio-481  The lytic cycle
    bio-482  The lysogenic cycle
    bio-483  Bacteriophages
    bio-484  Retroviruses
    bio-485  HIV and AIDS
    bio-486  Influenza and antigenic change
    bio-487  Vaccination against viruses
    bio-488  Whether viruses are alive
    bio-489  Prions
    bio-490  Emerging infectious diseases

### Protists and fungi — `bio-protists`

    bio-491  Protists
    bio-492  The problem with the kingdom Protista
    bio-493  Amoebae
    bio-494  Ciliates
    bio-495  Flagellates
    bio-496  Algae
    bio-497  Diatoms
    bio-498  Plasmodium and malaria
    bio-499  Slime moulds
    bio-500  Fungi
    bio-501  Fungal structure
    bio-502  Hyphae and mycelium
    bio-503  Fungal reproduction
    bio-504  Yeasts
    bio-505  Moulds
    bio-506  Mushrooms and fruiting bodies
    bio-507  Mycorrhizae
    bio-508  Lichens
    bio-509  Fungi as decomposers
    bio-510  Fungal diseases

### The plant kingdom — `bio-plantdiv`

    bio-511  Plants
    bio-512  The evolution of land plants
    bio-513  Alternation of generations
    bio-514  Bryophytes
    bio-515  Mosses
    bio-516  Ferns and their relatives
    bio-517  The evolution of the vascular system
    bio-518  Gymnosperms
    bio-519  Conifers
    bio-520  Angiosperms
    bio-521  The flower as an evolutionary innovation
    bio-522  Monocots and dicots
    bio-523  The success of the flowering plants
    bio-524  Seeds and their advantages
    bio-525  Plant life cycles
    bio-526  Grasses
    bio-527  Trees
    bio-528  Carnivorous plants
    bio-529  Parasitic plants
    bio-530  Plants and people

### Invertebrates — `bio-invert`

    bio-531  Animals
    bio-532  The animal body plan
    bio-533  Symmetry in animals
    bio-534  Sponges
    bio-535  Cnidarians
    bio-536  Flatworms
    bio-537  Roundworms
    bio-538  Annelids
    bio-539  Molluscs
    bio-540  Cephalopods
    bio-541  Arthropods
    bio-542  The arthropod exoskeleton
    bio-543  Crustaceans
    bio-544  Arachnids
    bio-545  Insects
    bio-546  Insect metamorphosis
    bio-547  The success of the insects
    bio-548  Echinoderms
    bio-549  The invertebrate share of animal diversity
    bio-550  Invertebrates and ecosystems

### Vertebrates — `bio-vert`

    bio-551  Chordates
    bio-552  Vertebrates
    bio-553  The vertebral column
    bio-554  Jawless fishes
    bio-555  Cartilaginous fishes
    bio-556  Bony fishes
    bio-557  The move onto land
    bio-558  Amphibians
    bio-559  The amniotic egg
    bio-560  Reptiles
    bio-561  Crocodilians
    bio-562  The origin of birds
    bio-563  Birds
    bio-564  Flight
    bio-565  Mammals
    bio-566  Monotremes and marsupials
    bio-567  Placental mammals
    bio-568  Endothermy
    bio-569  Primates
    bio-570  Vertebrate diversity today

## Plant Biology

### Plant structure — `bio-plantform`

    bio-571  Plant anatomy
    bio-572  The root
    bio-573  Root hair cells
    bio-574  The stem
    bio-575  The leaf
    bio-576  Leaf structure and gas exchange
    bio-577  Plant tissues
    bio-578  Meristems
    bio-579  The epidermis
    bio-580  Stomata
    bio-581  Guard cells
    bio-582  Xylem
    bio-583  Phloem
    bio-584  Vascular bundles
    bio-585  Parenchyma, collenchyma and sclerenchyma
    bio-586  Secondary growth
    bio-587  Wood
    bio-588  Bark
    bio-589  Plant adaptations to dry conditions
    bio-590  Plant adaptations to water

### Transport and nutrition in plants — `bio-planttransport`

    bio-591  Transport in plants
    bio-592  Water uptake by roots
    bio-593  The transpiration stream
    bio-594  Transpiration
    bio-595  The cohesion-tension theory
    bio-596  Factors affecting transpiration
    bio-597  Measuring transpiration
    bio-598  Translocation
    bio-599  The mass flow hypothesis
    bio-600  Source and sink
    bio-601  Mineral nutrition in plants
    bio-602  Nitrogen and plant growth
    bio-603  Mineral deficiencies
    bio-604  Soil and plant roots
    bio-605  Root nodules and nitrogen fixation
    bio-606  Mycorrhizal nutrition
    bio-607  Xerophytes
    bio-608  Hydrophytes
    bio-609  Halophytes
    bio-610  Plant water relations

### Plant growth and hormones — `bio-plantgrowth`

    bio-611  Plant growth
    bio-612  Plant hormones
    bio-613  Auxins
    bio-614  Phototropism
    bio-615  Gravitropism
    bio-616  Gibberellins
    bio-617  Cytokinins
    bio-618  Abscisic acid
    bio-619  Ethene and ripening
    bio-620  Apical dominance
    bio-621  Photoperiodism
    bio-622  Phytochrome
    bio-623  Flowering time
    bio-624  Vernalisation
    bio-625  Dormancy
    bio-626  Germination
    bio-627  Plant responses to stress
    bio-628  Plant defences against herbivores
    bio-629  Plant hormones in agriculture
    bio-630  Plant tissue culture

### Plant reproduction — `bio-plantrepro`

    bio-631  Plant reproduction
    bio-632  Asexual reproduction in plants
    bio-633  Vegetative propagation
    bio-634  The flower
    bio-635  Stamens and carpels
    bio-636  Pollen
    bio-637  Pollination
    bio-638  Insect pollination
    bio-639  Wind pollination
    bio-640  Coevolution of flowers and pollinators
    bio-641  Self-pollination and cross-pollination
    bio-642  Preventing self-fertilisation
    bio-643  Double fertilisation
    bio-644  Seed development
    bio-645  Fruit
    bio-646  Seed dispersal
    bio-647  Seed banks
    bio-648  Plant breeding
    bio-649  Crop domestication
    bio-650  The green revolution

## Animal Form and Function

### Tissues, organs and homeostasis — `bio-tissues`

    bio-651  Animal tissues
    bio-652  Epithelial tissue
    bio-653  Connective tissue
    bio-654  Muscle tissue
    bio-655  Nervous tissue
    bio-656  Organs and organ systems in animals
    bio-657  Homeostasis in animals
    bio-658  Negative feedback
    bio-659  Positive feedback
    bio-660  Body temperature regulation
    bio-661  Ectotherms and endotherms
    bio-662  Thermoregulation in mammals
    bio-663  Blood glucose regulation
    bio-664  Insulin and glucagon
    bio-665  Diabetes

### Nutrition and digestion — `bio-digestion`

    bio-666  Animal nutrition
    bio-667  Heterotrophic nutrition
    bio-668  The human digestive system
    bio-669  The mouth and mechanical digestion
    bio-670  The stomach
    bio-671  The small intestine
    bio-672  Digestive enzymes
    bio-673  Absorption in the ileum
    bio-674  The villus
    bio-675  The large intestine
    bio-676  The liver
    bio-677  The pancreas
    bio-678  Bile
    bio-679  Diet and balanced nutrition
    bio-680  Vitamins
    bio-681  Minerals in the diet
    bio-682  Dietary fibre
    bio-683  Malnutrition
    bio-684  Digestion in ruminants
    bio-685  Feeding adaptations in animals

### Gas exchange and circulation — `bio-circulation`

    bio-686  Gas exchange
    bio-687  Surface area and gas exchange
    bio-688  Gas exchange in insects
    bio-689  Gas exchange in fish
    bio-690  The human respiratory system
    bio-691  The alveolus
    bio-692  Ventilation
    bio-693  Lung volumes
    bio-694  Smoking and lung disease
    bio-695  The circulatory system
    bio-696  Open and closed circulation
    bio-697  Single and double circulation
    bio-698  The human heart
    bio-699  The cardiac cycle
    bio-700  Heart rate and its control
    bio-701  The electrocardiogram
    bio-702  Blood vessels
    bio-703  Capillary exchange
    bio-704  Blood pressure
    bio-705  Blood
    bio-706  Red blood cells
    bio-707  Haemoglobin and oxygen transport
    bio-708  The oxygen dissociation curve
    bio-709  The Bohr effect
    bio-710  Cardiovascular disease

### Excretion and osmoregulation — `bio-excretion`

    bio-711  Excretion
    bio-712  Nitrogenous waste
    bio-713  Ammonia, urea and uric acid
    bio-714  The kidney
    bio-715  The nephron
    bio-716  Ultrafiltration
    bio-717  Selective reabsorption
    bio-718  The loop of Henle
    bio-719  Osmoregulation
    bio-720  Antidiuretic hormone
    bio-721  Kidney failure and dialysis
    bio-722  Osmoregulation in freshwater and marine animals
    bio-723  The liver and detoxification
    bio-724  Excretion in insects
    bio-725  Water balance in desert animals

### Support and movement — `bio-movement`

    bio-726  Support and movement in animals
    bio-727  Skeletons
    bio-728  The hydrostatic skeleton
    bio-729  The exoskeleton
    bio-730  The vertebrate endoskeleton
    bio-731  Bone
    bio-732  Joints
    bio-733  Muscle
    bio-734  Skeletal muscle structure
    bio-735  The sarcomere
    bio-736  The sliding filament theory
    bio-737  Muscle contraction and ATP
    bio-738  Fast and slow muscle fibres
    bio-739  Antagonistic muscle pairs
    bio-740  Locomotion

### Nerves, senses and hormones — `bio-nervous`

    bio-741  The nervous system
    bio-742  The neuron
    bio-743  The resting potential
    bio-744  The action potential
    bio-745  Saltatory conduction
    bio-746  The synapse
    bio-747  Neurotransmitters
    bio-748  The reflex arc
    bio-749  The central nervous system
    bio-750  The autonomic nervous system
    bio-751  The brain
    bio-752  Sense organs
    bio-753  The eye
    bio-754  The retina and photoreception
    bio-755  The ear and hearing
    bio-756  Balance
    bio-757  Chemoreception
    bio-758  Mechanoreception
    bio-759  The endocrine system
    bio-760  Hormones
    bio-761  The pituitary gland
    bio-762  The adrenal glands
    bio-763  The thyroid gland
    bio-764  Comparing nervous and hormonal control
    bio-765  Pheromones

### Immunity and disease — `bio-immunity`

    bio-766  Health and disease
    bio-767  Pathogens
    bio-768  Transmission of disease
    bio-769  The immune system
    bio-770  Physical and chemical barriers
    bio-771  Phagocytes
    bio-772  The inflammatory response
    bio-773  Lymphocytes
    bio-774  B cells and antibodies
    bio-775  Antibody structure
    bio-776  T cells
    bio-777  The primary and secondary immune response
    bio-778  Immunological memory
    bio-779  Vaccination
    bio-780  Herd immunity
    bio-781  Active and passive immunity
    bio-782  Monoclonal antibodies
    bio-783  Autoimmune disease
    bio-784  Allergy
    bio-785  Immunodeficiency

### Reproduction and development — `bio-repro`

    bio-786  Reproduction
    bio-787  Asexual reproduction in animals
    bio-788  Sexual reproduction
    bio-789  The human male reproductive system
    bio-790  The human female reproductive system
    bio-791  Spermatogenesis
    bio-792  Oogenesis
    bio-793  The menstrual cycle
    bio-794  Hormonal control of reproduction
    bio-795  Fertilisation
    bio-796  Contraception
    bio-797  Assisted reproduction
    bio-798  Pregnancy and the placenta
    bio-799  Birth and lactation
    bio-800  Embryonic development
    bio-801  Gastrulation
    bio-802  Differentiation
    bio-803  Morphogenesis
    bio-804  Metamorphosis
    bio-805  Parental care and life histories

## Ecology and the Environment

### Populations — `bio-populations`

    bio-806  Ecology
    bio-807  The population
    bio-808  Population size and density
    bio-809  Population growth
    bio-810  Exponential growth
    bio-811  Logistic growth
    bio-812  Carrying capacity
    bio-813  Limiting factors
    bio-814  Density-dependent and density-independent factors
    bio-815  Life history strategies
    bio-816  Survivorship curves
    bio-817  Age structure
    bio-818  Estimating population size
    bio-819  Mark-release-recapture
    bio-820  Quadrats and transects
    bio-821  Predator-prey cycles
    bio-822  Intraspecific competition
    bio-823  Human population growth
    bio-824  The demographic transition
    bio-825  Population ecology in conservation

### Communities and interactions — `bio-communities`

    bio-826  The community
    bio-827  The habitat
    bio-828  The ecological niche
    bio-829  The competitive exclusion principle
    bio-830  Resource partitioning
    bio-831  Interspecific competition
    bio-832  Predation
    bio-833  Herbivory
    bio-834  Parasitism
    bio-835  Mutualism
    bio-836  Commensalism
    bio-837  Symbiosis
    bio-838  Keystone species
    bio-839  Ecosystem engineers
    bio-840  Food chains
    bio-841  Food webs
    bio-842  Trophic levels
    bio-843  Trophic cascades
    bio-844  Ecological succession
    bio-845  Primary and secondary succession
    bio-846  The climax community
    bio-847  Species richness and evenness
    bio-848  Measuring biodiversity
    bio-849  The species-area relationship
    bio-850  Island biogeography

### Ecosystems and energy flow — `bio-ecosystems`

    bio-851  The ecosystem
    bio-852  Energy flow through ecosystems
    bio-853  Primary productivity
    bio-854  Gross and net primary production
    bio-855  Ecological efficiency
    bio-856  The pyramid of numbers
    bio-857  The pyramid of biomass
    bio-858  The pyramid of energy
    bio-859  Decomposers and detritivores
    bio-860  Nutrient cycling
    bio-861  The carbon cycle
    bio-862  The nitrogen cycle
    bio-863  The phosphorus cycle
    bio-864  The water cycle
    bio-865  The sulphur cycle
    bio-866  Ecosystem services
    bio-867  Agriculture as an ecosystem
    bio-868  Eutrophication
    bio-869  Bioaccumulation
    bio-870  Biomagnification
    bio-871  Ecosystem stability and resilience
    bio-872  Disturbance
    bio-873  Restoration ecology
    bio-874  Modelling ecosystems
    bio-875  The ecosystem concept and its critics

### Biomes and biogeography — `bio-biomes`

    bio-876  Biomes
    bio-877  Climate and the distribution of life
    bio-878  Tropical rainforest
    bio-879  Savanna
    bio-880  Desert
    bio-881  Temperate grassland
    bio-882  Temperate forest
    bio-883  Boreal forest
    bio-884  Tundra
    bio-885  Mediterranean scrub
    bio-886  Mountain ecosystems
    bio-887  Freshwater ecosystems
    bio-888  Rivers and streams
    bio-889  Wetlands
    bio-890  Estuaries
    bio-891  Marine ecosystems
    bio-892  Coral reefs
    bio-893  The deep sea
    bio-894  Biogeography
    bio-895  Wallace's line

### Conservation and global change — `bio-conservation`

    bio-896  Conservation biology
    bio-897  Extinction
    bio-898  The current extinction crisis
    bio-899  Habitat loss and fragmentation
    bio-900  Invasive species
    bio-901  Overexploitation
    bio-902  Pollution
    bio-903  Plastics in the environment
    bio-904  Climate change and life
    bio-905  Ocean acidification
    bio-906  Coral bleaching
    bio-907  Phenological mismatch
    bio-908  Range shifts
    bio-909  Endangered species
    bio-910  The IUCN Red List
    bio-911  Protected areas
    bio-912  Wildlife corridors
    bio-913  Captive breeding and reintroduction
    bio-914  Rewilding
    bio-915  Sustainable use
    bio-916  Conservation genetics
    bio-917  Ecosystem-based management
    bio-918  Conservation and people
    bio-919  Measuring conservation success
    bio-920  What conservation biology argues about

## Behaviour, Health and Biology Today

### Animal behaviour — `bio-behaviour`

    bio-921  Animal behaviour
    bio-922  Innate behaviour
    bio-923  Reflexes and taxes
    bio-924  Fixed action patterns
    bio-925  Learned behaviour in animals
    bio-926  Imprinting
    bio-927  Ethology
    bio-928  Foraging behaviour
    bio-929  Optimal foraging theory
    bio-930  Territoriality
    bio-931  Migration
    bio-932  Navigation in animals
    bio-933  Circadian rhythms
    bio-934  Hibernation and dormancy
    bio-935  Animal communication
    bio-936  Signalling and honesty
    bio-937  Courtship behaviour
    bio-938  Mating systems
    bio-939  Parental investment
    bio-940  Social insects
    bio-941  Eusociality
    bio-942  Dominance hierarchies
    bio-943  Cooperation in animals
    bio-944  Tool use in animals
    bio-945  Studying behaviour in the wild

### Human health and disease — `bio-health`

    bio-946  Human biology
    bio-947  Infectious disease
    bio-948  Epidemiology
    bio-949  Epidemics and pandemics
    bio-950  Tuberculosis
    bio-951  Malaria
    bio-952  Cholera
    bio-953  Non-communicable disease
    bio-954  Cancer
    bio-955  Cancer treatment
    bio-956  Heart disease and its risk factors
    bio-957  Obesity
    bio-958  Type 2 diabetes as a public health problem
    bio-959  Genetic disease
    bio-960  Cystic fibrosis
    bio-961  Huntington's disease
    bio-962  Genetic screening
    bio-963  Drugs and how they work
    bio-964  Drug discovery
    bio-965  Clinical trials
    bio-966  Antibiotic and antiviral medicines
    bio-967  Organ transplantation
    bio-968  Ageing and human health
    bio-969  Global health inequality
    bio-970  Public health and prevention

### Biotechnology and society — `bio-biotech`

    bio-971  Biotechnology
    bio-972  Fermentation in industry
    bio-973  Enzymes in biotechnology
    bio-974  Bioreactors
    bio-975  Insulin production by genetic engineering
    bio-976  Transgenic crops
    bio-977  The GM crops debate
    bio-978  Synthetic biology
    bio-979  Biofuels
    bio-980  Bioremediation
    bio-981  Stem cell therapy
    bio-982  Gene editing in humans
    bio-983  Biosecurity and dual-use research
    bio-984  Patenting life
    bio-985  Biotechnology and food security

### Doing biology — `bio-practice`

    bio-986  How biological knowledge is made
    bio-987  Sampling and experimental design in biology
    bio-988  Statistics in biology
    bio-989  Standard deviation and error bars
    bio-990  Statistical tests in biology
    bio-991  Fieldwork
    bio-992  The laboratory
    bio-993  Animals in research
    bio-994  Peer review and publication
    bio-995  Replication in biology
    bio-996  Big data in biology
    bio-997  Citizen science
    bio-998  Science communication and public trust
    bio-999  Careers in the biological sciences
    bio-1000  Where biology is going
