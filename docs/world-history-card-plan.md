# World History — the 1000-card plan

The running order for the `col-8` World History collection. Every card has a number, a topic and a
deck, fixed in advance, so the collection can be grown one card at a time across many sessions without
anyone having to remember where it had got to.

Not part of the site.

This plan **replaced an earlier one on 2026-08-04, on request.** The old World History collection was a
single 109-card `wh-prehistory` deck sitting beside a tree of empty period decks (`col-44`…`col-64`)
that no plan ever filled. It was written from scratch, deliberately ignoring what already existed, and
the cards were then reconciled against it — see "The 2026-08-04 renumbering" at the foot of this file
for exactly what happened to each of the 109.

## How to use this (the whole point of the file)

**"Generate the next World History card" means: take the lowest `wh-NNN` that is not yet in `data.js`,
read its topic and deck from the list below, research it, and add it.**

    node -e "global.window={};require('./data.js');const h=new Set(window.CARD_DATA.map(c=>c.id));
      for(let i=1;i<=1000;i++){const id='wh-'+String(i).padStart(3,'0');
      if(!h.has(id)){console.log('next:',id);break}}"

There is deliberately **no separate progress file**. `data.js` is the record of what exists, this file
is the record of what is planned, and the next card is whatever falls between them — so the two can
never disagree about where the work has got to.

Then write the card to the rules in CLAUDE.md ("Generating cards & glossary entries") and add it with:

    node .claude/add-card.js <card.json> <deckId>

**Always pass the deck id.** `add-card.js` falls back to the first leaf in the whole tree when it is
omitted, which is `cn-myth`, in the China collection.

Note that the numbering runs past 999, so ids are **not** all the same length: `wh-001` … `wh-999`,
then `wh-1000`. The command above pads to three digits, which is right for every id but the last.

## What a line in this list is, and is not

A line is a **subject to research**, not a fact to assert and not necessarily the finished answer
term. `wh-880 Battle of the Somme` is already an answer term; `wh-192 Mesopotamian religion` is an
area, and the card's actual answer — the word that gets blanked — is chosen while writing it, from
what the sources will support.

So: **a topic may be renamed, split, merged or dropped when the research is done.** Some will turn out
to be thinner than they look, and a few will turn out to be two cards. When that happens, change the
line here in the same commit as the card, and say so — this file is only useful while it is true.

The one thing that must not happen is a card written to fill a slot. The house rule stands: never
invent a date, a name or a definition. If a topic cannot be sourced, say so and replace the line.

Card ids run `wh-001` … `wh-1000`, in the order below. Numbering follows the tree, and the tree follows
chronology, so the running order is roughly chronological — which also means an early card and a late
card in the same deck sort together on the study page, since cards are ordered by
`cardYears(answerDate)` and not by id. Within a subdeck the order is a reading order, not a claim about
dates: `wh-435 Norte Chico civilisation` is older than most of the deck it closes.

## Allocation

| Deck | Subdeck | Cards | Range |
|---|---|---|---|
| Origins and Prehistory | Human origins | 45 | wh-001–045 |
| | The Palaeolithic | 40 | wh-046–085 |
| | Peopling the planet | 25 | wh-086–110 |
| The First Farmers | The Neolithic transition | 30 | wh-111–140 |
| | Neolithic worlds | 30 | wh-141–170 |
| The First Civilisations | Mesopotamia | 30 | wh-171–200 |
| | Ancient Egypt | 30 | wh-201–230 |
| | The Indus and early China | 25 | wh-231–255 |
| | The Bronze Age world | 25 | wh-256–280 |
| Classical Worlds | Iron Age Near East and Persia | 30 | wh-281–310 |
| | Greece and the Hellenistic world | 25 | wh-311–335 |
| | Rome | 40 | wh-336–375 |
| | Ancient India | 20 | wh-376–395 |
| | Ancient China | 20 | wh-396–415 |
| | Africa and the Americas in antiquity | 20 | wh-416–435 |
| The Post-Classical World | Byzantium and the Christian East | 20 | wh-436–455 |
| | The Islamic world | 30 | wh-456–485 |
| | Medieval Europe | 35 | wh-486–520 |
| | East Asia | 25 | wh-521–545 |
| | South and Southeast Asia | 20 | wh-546–565 |
| | Africa | 20 | wh-566–585 |
| | Steppe empires and the Mongols | 15 | wh-586–600 |
| | The Americas before Columbus | 20 | wh-601–620 |
| The Early Modern World | Renaissance, Reformation and the new science | 35 | wh-621–655 |
| | Voyages, conquest and exchange | 30 | wh-656–685 |
| | The gunpowder empires | 25 | wh-686–710 |
| | Ming and Qing China, Tokugawa Japan | 15 | wh-711–725 |
| | Slavery and the Atlantic world | 20 | wh-726–745 |
| Revolutions and Empire | The age of revolutions | 30 | wh-746–775 |
| | The Industrial Revolution | 25 | wh-776–800 |
| | Nations, ideologies and reform | 25 | wh-801–825 |
| | Empire and the colonised world | 30 | wh-826–855 |
| | A connected world, 1850–1914 | 15 | wh-856–870 |
| The Modern World | The First World War | 25 | wh-871–895 |
| | Between the wars | 20 | wh-896–915 |
| | The Second World War | 30 | wh-916–945 |
| | The Cold War | 25 | wh-946–970 |
| | Decolonisation and the new nations | 15 | wh-971–985 |
| | The contemporary world | 15 | wh-986–1000 |

Deck totals: Origins and Prehistory 110 · The First Farmers 60 · The First Civilisations 110 ·
Classical Worlds 155 · The Post-Classical World 185 · The Early Modern World 125 ·
Revolutions and Empire 125 · The Modern World 130. **1000.**

## What the weighting is arguing

Every allocation in a world-history plan is an argument, and these are the ones this file is making.

**Prehistory keeps 110 cards — 11% of the collection for 99% of the elapsed time.** That is far more
than a school syllabus gives it and it is deliberate: the deep past is what this site is already best
at, its glossary and its citation apparatus are built out around it, and a reader who arrives through
human origins is the reader Folio actually has. It is still a survey. Site-level and specimen-level
cards — a single rock shelter, a single ivory figurine — belong to a dedicated Prehistory collection,
not to a card in ten about the whole human past.

**Nothing outside Europe is a single "and the rest" deck.** Africa, the Islamic world, South and
Southeast Asia, East Asia, the steppe and the Americas each get their own subdeck in the
post-classical period, and the ancient world gets `wh-antiquity-beyond` for Kush, Aksum, Nok, the
Olmecs and Chavín. The commonest way a world-history syllabus goes wrong is to run one chronological
spine through Europe and hang everything else off it as an excursion.

**The Post-Classical World is the largest deck at 185.** It covers a thousand years across every
inhabited continent and it is the period most often compressed into "the Middle Ages", meaning
Europe's.

**The twentieth century gets 130 and not more.** It is the best-taught century there is, and a reader
who wants the Somme in depth is served by a war collection rather than by a world survey spending a
fifth of itself on ninety years.

**The Industrial Revolution and the age of revolutions are 55 cards between them**, which is generous
for a century and a half of one region — the argument being that this is where the modern world's
inequalities of power start, and a world history that treats industrialisation as a British technical
story has already lost the plot of the imperialism deck that follows it.

## Living beside the other collections

Folio has, or plans, separate collections for **Ancient Greece** (`col-13`, being written now),
**Ancient Rome** (`col-40`, planned in `docs/rome-card-plan.md` and not yet started), the **United
States** (`col-41`, planned in `docs/us-card-plan.md` and not yet started), **Russia** (`col-42`,
planned in `docs/russia-card-plan.md` and not yet started),
**India** (`col-43`, planned in `docs/india-card-plan.md` and not yet started) and **China** (`china`,
planned in `docs/china-card-plan.md`, set aside and not yet started). There is also **Ancient Egypt**
(`egypt`, planned in `docs/egypt-card-plan.md` and not yet started), which the plan created, and **the
Second World War** (`ww2`, planned in `docs/ww2-card-plan.md` and not yet started) and **Japan**
(`japan`, planned in `docs/japan-card-plan.md` and not yet started), both of which the plan likewise
created. World History overlaps all nine, on purpose, and the rule is:

**World History is written at survey altitude and never waits for another collection.** Greece gets 25
cards here against 1000 in `col-13`; Rome gets 40. A World History card on the Peloponnesian War is
what a reader needs to place the war in the world, and it is written now, not deferred until `col-13`
reaches `gr-521`. The two will say some of the same things in different registers, which is what a
survey and a specialist course do.

The corollary is the length rule doing real work: **ten sentences on the Roman Republic is a different
card from ten sentences on the Conflict of the Orders**, and the survey card must not quietly become
the specialist one. When a topic here has a whole deck elsewhere, write the card that a reader with no
other context needs.

## History, not archaeology

The rule lives in CLAUDE.md ("FOLIO IS A HISTORY SITE, NOT AN ARCHAEOLOGY SITE") and the site-wide
rewrite pass is `docs/history-focus-plan.md`. Do not restate either here; two things are specific to
this collection.

**The prehistory decks are where the fault is easiest to fall into**, because the deep past is known
almost entirely through excavation, so the reachable sources are dig reports and the prose slides into
who dug, how deep, and which excavator reinterpreted whom. The 109 cards inherited by this plan were
measured for exactly that in `docs/history-focus-plan.md`; the flagged ones carry their flags into
their new numbers.

**The other end of the collection has its own version of the fault**: for the modern decks the trap is
not archaeology but *commemoration* — writing the card that a memorial writes. A card on the Somme
states what happened, what it was for and what it cost, in the register of the rest of the collection.
`docs/ww2-card-plan.md` takes that observation further, into the three pulls that go with it — national
memory, denial and myth, and live political use — and its section is the one to read before writing
anything in `wh-ww1`, `wh-interwar`, `wh-ww2` or `wh-coldwar`.

## The named-person budget

A survey of the whole human past cannot be a list of great men, and left alone it will become one,
because a person is easier to write a clue about than a process. The plan holds roughly **150 of the
1000 slots for named individuals** — about one in seven — and the list below is already inside that.
Before adding a person to a line that does not have one, ask what process the card would otherwise
have taught.

The same restraint applies to modern scholars: the Greece plan caps them at four in a thousand, and
this collection allows the same handful, spent on the ones whose work *is* the historical event
(`wh-090 Ancient DNA`, `wh-822 Charles Darwin`).

## Cross-listing

A card may belong to several decks; `subtreeCardIds` dedupes with a `Set` at every branch, so the
collection total stays honest. Each card is listed **once** below, in its primary deck. Cross-list a
second home at writing time where it genuinely earns one — the obvious cases:

- `wh-530 Gunpowder`, `wh-532 Movable type` → also `wh-early-modern`'s decks, which are where their
  consequences land
- `wh-726 Atlantic slave trade` → also `wh-voyages`
- `wh-836 Battle of Plassey` → also `wh-ming-qing`'s neighbours in the early modern deck
- `wh-964 Vietnam War` → also `wh-decolonisation`
- `wh-085 Quaternary extinction event`, `wh-998 Climate change` → each other's decks, if a
  human-and-environment thread is ever wanted

Do not cross-list wholesale. A deck that contains everything relevant is a deck nobody finishes.

## Glossary

The site rule stands: **a new card ships with a cited glossary entry for its own answer term, in the
same commit** (`docs/card-glossary-pairing.md`). The prehistory decks are largely paid for already —
the glossary's 477 terms cover most of `wh-001`–`wh-110`, including every subject whose card this plan
retired — and everything from `wh-111` onwards is open ground. Write those terms cited from the start,
at the `GLOSS_SRC_TARGET` bar of 2, rather than opening a backlog to be closed later.

Sourcing gets easier as the collection goes forward in time and then harder again at the end. The
ancient and medieval decks are well served by museum and university open access; the twentieth-century
decks run into copyright, and the last fifteen cards run into the fact that the scholarship is not
written yet. `wh-1000 The Anthropocene` is a live scientific argument and the card must say so.

---

# The list

## Origins and Prehistory — `wh-origins`

### Human origins — `wh-evolution`

    wh-001  Prehistory
    wh-002  Three-age system
    wh-003  Stone Age
    wh-004  Human evolution
    wh-005  Hominin
    wh-006  Sahelanthropus
    wh-007  Bipedalism
    wh-008  Ardipithecus
    wh-009  Australopithecus
    wh-010  Lucy
    wh-011  Laetoli footprints
    wh-012  Taung Child
    wh-013  Paranthropus
    wh-014  Lomekwi
    wh-015  Knapping
    wh-016  Oldowan
    wh-017  Olduvai Gorge
    wh-018  Homo habilis
    wh-019  Homo erectus
    wh-020  Homo ergaster
    wh-021  Turkana Boy
    wh-022  Out of Africa I
    wh-023  Dmanisi
    wh-024  Java Man
    wh-025  Peking Man
    wh-026  Zhoukoudian
    wh-027  Acheulean
    wh-028  Hand axe
    wh-029  Control of fire
    wh-030  Wonderwerk Cave
    wh-031  Cooking hypothesis
    wh-032  Homo antecessor
    wh-033  Atapuerca
    wh-034  Homo heidelbergensis
    wh-035  Neanderthal
    wh-036  Levallois technique
    wh-037  Mousterian
    wh-038  Denisovans
    wh-039  Denisova Cave
    wh-040  Homo floresiensis
    wh-041  Homo naledi
    wh-042  Homo sapiens
    wh-043  Jebel Irhoud
    wh-044  Omo remains
    wh-045  Mitochondrial Eve

### The Palaeolithic — `wh-paleolithic`

    wh-046  Paleolithic
    wh-047  Lower Paleolithic
    wh-048  Middle Paleolithic
    wh-049  Upper Paleolithic
    wh-050  Pleistocene
    wh-051  Ice age
    wh-052  Last Glacial Period
    wh-053  Last Glacial Maximum
    wh-054  Hunter-gatherer
    wh-055  Middle Stone Age
    wh-056  Later Stone Age
    wh-057  Ochre
    wh-058  Blombos Cave
    wh-059  Howiesons Poort
    wh-060  Aterian
    wh-061  Behavioural modernity
    wh-062  Shell beads and personal ornament
    wh-063  Palaeolithic burial
    wh-064  Toba catastrophe theory
    wh-065  Neanderthal extinction
    wh-066  Châtelperronian
    wh-067  Aurignacian
    wh-068  Cro-Magnon
    wh-069  Lion-man
    wh-070  Gravettian
    wh-071  Venus figurines
    wh-072  Venus of Willendorf
    wh-073  Solutrean
    wh-074  Magdalenian
    wh-075  Cave painting
    wh-076  Chauvet Cave
    wh-077  Lascaux
    wh-078  Cave of Altamira
    wh-079  Petroglyph
    wh-080  Palaeolithic music
    wh-081  Spear-thrower
    wh-082  Bow and arrow
    wh-083  Microlith
    wh-084  Woolly mammoth
    wh-085  Quaternary extinction event

### Peopling the planet — `wh-peopling`

    wh-086  Recent African origin of modern humans
    wh-087  Skhul and Qafzeh hominins
    wh-088  Southern dispersal route
    wh-089  Archaic human admixture
    wh-090  Ancient DNA
    wh-091  Y-chromosomal Adam
    wh-092  Sahul
    wh-093  Madjedbebe
    wh-094  Lake Mungo remains
    wh-095  Peopling of Europe
    wh-096  Mal'ta–Buret' culture
    wh-097  Beringia
    wh-098  Settlement of the Americas
    wh-099  Monte Verde
    wh-100  Paleo-Indians
    wh-101  Clovis culture
    wh-102  Clovis point
    wh-103  Folsom tradition
    wh-104  Younger Dryas
    wh-105  Holocene
    wh-106  Mesolithic
    wh-107  Epipaleolithic
    wh-108  Doggerland
    wh-109  Star Carr
    wh-110  Bhimbetka rock shelters

## The First Farmers — `wh-farmers`

### The Neolithic transition — `wh-neolithic`

    wh-111  Neolithic
    wh-112  Neolithic Revolution
    wh-113  Holocene climatic optimum
    wh-114  8.2-kiloyear event
    wh-115  Fertile Crescent
    wh-116  Natufian culture
    wh-117  Domestication
    wh-118  Neolithic founder crops
    wh-119  Cereal domestication
    wh-120  Animal domestication
    wh-121  Dog domestication
    wh-122  Pre-Pottery Neolithic
    wh-123  Göbekli Tepe
    wh-124  Jericho
    wh-125  Çatalhöyük
    wh-126  'Ain Ghazal
    wh-127  Sedentism
    wh-128  Pottery
    wh-129  Rice domestication
    wh-130  Millet domestication
    wh-131  Maize domestication
    wh-132  Independent origins of agriculture
    wh-133  Neolithic demographic transition
    wh-134  Zoonotic disease and early farming
    wh-135  Lactase persistence
    wh-136  Secondary products revolution
    wh-137  Linear Pottery culture
    wh-138  Megalith
    wh-139  Stonehenge
    wh-140  Ötzi

### Neolithic worlds — `wh-early-villages`

    wh-141  Neolithic Europe
    wh-142  Skara Brae
    wh-143  Newgrange
    wh-144  Varna necropolis
    wh-145  Chalcolithic
    wh-146  Early metallurgy
    wh-147  Yangshao culture
    wh-148  Longshan culture
    wh-149  Jōmon period
    wh-150  Mehrgarh
    wh-151  African humid period
    wh-152  Saharan rock art
    wh-153  African cattle pastoralism
    wh-154  Nabta Playa
    wh-155  Kuk Swamp
    wh-156  Austronesian expansion
    wh-157  Lapita culture
    wh-158  Eastern Agricultural Complex
    wh-159  Poverty Point
    wh-160  Andean domestication
    wh-161  Chinchorro mummies
    wh-162  Prehistoric warfare
    wh-163  Origins of social inequality
    wh-164  Textiles and weaving
    wh-165  The plough
    wh-166  The wheel
    wh-167  Irrigation
    wh-168  Prehistoric trade
    wh-169  Ubaid period
    wh-170  Urban revolution

## The First Civilisations — `wh-first-civ`

### Mesopotamia — `wh-mesopotamia`

    wh-171  Mesopotamia
    wh-172  Sumer
    wh-173  Uruk
    wh-174  Cuneiform
    wh-175  Writing system
    wh-176  Cylinder seal
    wh-177  Ziggurat
    wh-178  Eridu
    wh-179  Sumerian city-state
    wh-180  Ur
    wh-181  Royal Cemetery at Ur
    wh-182  Gilgamesh
    wh-183  Epic of Gilgamesh
    wh-184  Sargon of Akkad
    wh-185  Akkadian Empire
    wh-186  Third Dynasty of Ur
    wh-187  Code of Ur-Nammu
    wh-188  Old Babylonian period
    wh-189  Hammurabi
    wh-190  Code of Hammurabi
    wh-191  Babylon
    wh-192  Mesopotamian religion
    wh-193  Enuma Elish
    wh-194  Babylonian mathematics
    wh-195  Babylonian astronomy
    wh-196  Scribes and the edubba
    wh-197  Mesopotamian trade
    wh-198  Kassites
    wh-199  Elam
    wh-200  Mitanni

### Ancient Egypt — `wh-egypt`

    wh-201  Ancient Egypt
    wh-202  The Nile and Egyptian agriculture
    wh-203  Naqada culture
    wh-204  Narmer Palette
    wh-205  Unification of Egypt
    wh-206  Egyptian hieroglyphs
    wh-207  Rosetta Stone
    wh-208  Papyrus
    wh-209  Pharaoh
    wh-210  Old Kingdom of Egypt
    wh-211  Step Pyramid of Djoser
    wh-212  Great Pyramid of Giza
    wh-213  Great Sphinx of Giza
    wh-214  Mummification
    wh-215  Book of the Dead
    wh-216  Ancient Egyptian religion
    wh-217  First Intermediate Period
    wh-218  Middle Kingdom of Egypt
    wh-219  Hyksos
    wh-220  New Kingdom of Egypt
    wh-221  Hatshepsut
    wh-222  Thutmose III
    wh-223  Akhenaten
    wh-224  Tutankhamun
    wh-225  Ramesses II
    wh-226  Battle of Kadesh
    wh-227  Valley of the Kings
    wh-228  Karnak
    wh-229  Egypt and Nubia
    wh-230  Third Intermediate Period

### The Indus and early China — `wh-indus-china`

    wh-231  Indus Valley Civilisation
    wh-232  Harappa
    wh-233  Mohenjo-daro
    wh-234  Indus script
    wh-235  Indus urban planning
    wh-236  Dholavira
    wh-237  Lothal
    wh-238  Decline of the Indus civilisation
    wh-239  Indo-Aryan migrations
    wh-240  Vedic period
    wh-241  Rigveda
    wh-242  Sanskrit
    wh-243  Erlitou culture
    wh-244  Xia dynasty
    wh-245  Shang dynasty
    wh-246  Oracle bone script
    wh-247  Yinxu
    wh-248  Chinese ritual bronzes
    wh-249  Fu Hao
    wh-250  Sanxingdui
    wh-251  Western Zhou
    wh-252  Mandate of Heaven
    wh-253  Chinese characters
    wh-254  Silk
    wh-255  Jade in early China

### The Bronze Age world — `wh-bronze-age`

    wh-256  Bronze Age
    wh-257  Bronze
    wh-258  Yamnaya culture
    wh-259  Indo-European languages
    wh-260  Domestication of the horse
    wh-261  Chariot
    wh-262  Minoan civilisation
    wh-263  Mycenaean Greece
    wh-264  Minoan eruption of Thera
    wh-265  Linear B
    wh-266  Hittites
    wh-267  Hattusa
    wh-268  Ugarit
    wh-269  Proto-Sinaitic script
    wh-270  Amarna letters
    wh-271  Uluburun shipwreck
    wh-272  Tin and the Bronze Age trade
    wh-273  Bell Beaker culture
    wh-274  Únětice culture
    wh-275  Nebra sky disc
    wh-276  Nordic Bronze Age
    wh-277  Oxus civilisation
    wh-278  Sea Peoples
    wh-279  Late Bronze Age collapse
    wh-280  Ironworking

## Classical Worlds — `wh-classical`

### Iron Age Near East and Persia — `wh-near-east`

    wh-281  Iron Age
    wh-282  Neo-Assyrian Empire
    wh-283  Nineveh
    wh-284  Ashurbanipal
    wh-285  Assyrian warfare and deportation
    wh-286  Neo-Babylonian Empire
    wh-287  Nebuchadnezzar II
    wh-288  Hanging Gardens of Babylon
    wh-289  Babylonian captivity
    wh-290  Ancient Israel and Judah
    wh-291  Hebrew Bible
    wh-292  Judaism
    wh-293  Phoenicia
    wh-294  Phoenician alphabet
    wh-295  Founding of Carthage
    wh-296  Urartu
    wh-297  Lydia
    wh-298  Coinage
    wh-299  Medes
    wh-300  Cyrus the Great
    wh-301  Achaemenid Empire
    wh-302  Persepolis
    wh-303  Darius the Great
    wh-304  Royal Road
    wh-305  Satrap
    wh-306  Zoroastrianism
    wh-307  Behistun Inscription
    wh-308  Xerxes I
    wh-309  Aramaic
    wh-310  Fall of the Achaemenid Empire

### Greece and the Hellenistic world — `wh-greece`

    wh-311  Ancient Greece
    wh-312  Polis
    wh-313  Greek colonisation
    wh-314  Homer
    wh-315  Greek alphabet
    wh-316  Sparta
    wh-317  Classical Athens
    wh-318  Athenian democracy
    wh-319  Greco-Persian Wars
    wh-320  Battle of Marathon
    wh-321  Battle of Thermopylae
    wh-322  Battle of Salamis
    wh-323  Delian League
    wh-324  Pericles
    wh-325  Parthenon
    wh-326  Greek theatre
    wh-327  Socrates
    wh-328  Plato
    wh-329  Aristotle
    wh-330  Peloponnesian War
    wh-331  Herodotus
    wh-332  Philip II of Macedon
    wh-333  Alexander the Great
    wh-334  Hellenistic period
    wh-335  Library of Alexandria

### Rome — `wh-rome`

    wh-336  Ancient Rome
    wh-337  Etruscan civilisation
    wh-338  Founding of Rome
    wh-339  Roman Kingdom
    wh-340  Roman Republic
    wh-341  Roman Senate
    wh-342  Twelve Tables
    wh-343  Conflict of the Orders
    wh-344  Roman legion
    wh-345  Punic Wars
    wh-346  Hannibal
    wh-347  Battle of Cannae
    wh-348  Destruction of Carthage
    wh-349  Roman conquest of Greece
    wh-350  Gracchi brothers
    wh-351  Marius and Sulla
    wh-352  Third Servile War
    wh-353  Julius Caesar
    wh-354  Gallic Wars
    wh-355  Roman civil wars
    wh-356  Assassination of Julius Caesar
    wh-357  Augustus
    wh-358  Roman Empire
    wh-359  Pax Romana
    wh-360  Roman roads
    wh-361  Roman aqueduct
    wh-362  Colosseum
    wh-363  Roman law
    wh-364  Roman citizenship
    wh-365  Pompeii
    wh-366  Nero
    wh-367  Trajan
    wh-368  Hadrian's Wall
    wh-369  Marcus Aurelius
    wh-370  Crisis of the Third Century
    wh-371  Diocletian
    wh-372  Constantine the Great
    wh-373  Christianity in the Roman Empire
    wh-374  First Council of Nicaea
    wh-375  Fall of the Western Roman Empire

### Ancient India — `wh-ancient-india`

    wh-376  Mahajanapadas
    wh-377  Upanishads
    wh-378  Hinduism
    wh-379  Varna and caste
    wh-380  Gautama Buddha
    wh-381  Buddhism
    wh-382  Jainism
    wh-383  Maurya Empire
    wh-384  Chandragupta Maurya
    wh-385  Arthashastra
    wh-386  Ashoka
    wh-387  Edicts of Ashoka
    wh-388  Spread of Buddhism
    wh-389  Stupa
    wh-390  Indo-Greek kingdoms
    wh-391  Kushan Empire
    wh-392  Greco-Buddhist art
    wh-393  Gupta Empire
    wh-394  Hindu–Arabic numerals
    wh-395  Classical Sanskrit literature

### Ancient China — `wh-ancient-china`

    wh-396  Eastern Zhou
    wh-397  Spring and Autumn period
    wh-398  Warring States period
    wh-399  Confucius
    wh-400  Confucianism
    wh-401  Taoism
    wh-402  Legalism
    wh-403  The Art of War
    wh-404  Qin Shi Huang
    wh-405  Qin dynasty
    wh-406  Terracotta Army
    wh-407  Great Wall of China
    wh-408  Han dynasty
    wh-409  Silk Road
    wh-410  Chinese bureaucracy
    wh-411  Sima Qian
    wh-412  Invention of paper
    wh-413  Fall of the Han dynasty
    wh-414  Three Kingdoms
    wh-415  Buddhism in China

### Africa and the Americas in antiquity — `wh-antiquity-beyond`

    wh-416  Kingdom of Kush
    wh-417  Meroë
    wh-418  Kingdom of Aksum
    wh-419  Nok culture
    wh-420  Bantu expansion
    wh-421  Garamantes
    wh-422  Land of Punt
    wh-423  Early trans-Saharan trade
    wh-424  Olmecs
    wh-425  Mesoamerica
    wh-426  Mesoamerican ballgame
    wh-427  Monte Albán
    wh-428  Maya civilisation
    wh-429  Maya script
    wh-430  Mesoamerican Long Count calendar
    wh-431  Teotihuacan
    wh-432  Chavín culture
    wh-433  Nazca Lines
    wh-434  Moche culture
    wh-435  Norte Chico civilisation

## The Post-Classical World — `wh-postclassical`

### Byzantium and the Christian East — `wh-byzantium`

    wh-436  Byzantine Empire
    wh-437  Constantinople
    wh-438  Justinian I
    wh-439  Corpus Juris Civilis
    wh-440  Hagia Sophia
    wh-441  Theodora
    wh-442  Plague of Justinian
    wh-443  Greek fire
    wh-444  Byzantine Iconoclasm
    wh-445  East–West Schism
    wh-446  Eastern Orthodoxy
    wh-447  Cyril and Methodius
    wh-448  Kievan Rus'
    wh-449  First Bulgarian Empire
    wh-450  Battle of Manzikert
    wh-451  Sack of Constantinople
    wh-452  Fall of Constantinople
    wh-453  Christianisation of Armenia
    wh-454  Kingdom of Georgia
    wh-455  Ethiopian Orthodox Church

### The Islamic world — `wh-islam`

    wh-456  Pre-Islamic Arabia
    wh-457  Muhammad
    wh-458  Hijra
    wh-459  Quran
    wh-460  Islam
    wh-461  Five Pillars of Islam
    wh-462  Rashidun Caliphate
    wh-463  Early Muslim conquests
    wh-464  Sunni–Shia split
    wh-465  Umayyad Caliphate
    wh-466  Damascus
    wh-467  Battle of Tours
    wh-468  Al-Andalus
    wh-469  Abbasid Caliphate
    wh-470  Baghdad
    wh-471  House of Wisdom
    wh-472  Islamic Golden Age
    wh-473  Al-Khwarizmi
    wh-474  Avicenna
    wh-475  Medicine in the medieval Islamic world
    wh-476  Islamic art
    wh-477  Great Mosque of Córdoba
    wh-478  Fatimid Caliphate
    wh-479  Al-Azhar
    wh-480  Sufism
    wh-481  Ibn Battuta
    wh-482  Ibn Khaldun
    wh-483  Seljuk Empire
    wh-484  Saladin
    wh-485  Mamluk Sultanate

### Medieval Europe — `wh-medieval-europe`

    wh-486  Middle Ages
    wh-487  Migration Period
    wh-488  Ostrogoths and Visigoths
    wh-489  Clovis I
    wh-490  Anglo-Saxon England
    wh-491  Sutton Hoo
    wh-492  Christian monasticism
    wh-493  Rule of Saint Benedict
    wh-494  Medieval papacy
    wh-495  Charlemagne
    wh-496  Carolingian Renaissance
    wh-497  Holy Roman Empire
    wh-498  Vikings
    wh-499  Lindisfarne raid
    wh-500  Alfred the Great
    wh-501  Norse colonisation of North America
    wh-502  Feudalism
    wh-503  Manorialism
    wh-504  Norman Conquest
    wh-505  Domesday Book
    wh-506  Crusades
    wh-507  First Crusade
    wh-508  Knights Templar
    wh-509  Medieval castle
    wh-510  Gothic architecture
    wh-511  Medieval university
    wh-512  Thomas Aquinas
    wh-513  Magna Carta
    wh-514  Medieval guild
    wh-515  Hanseatic League
    wh-516  Black Death
    wh-517  Late medieval peasant revolts
    wh-518  Hundred Years' War
    wh-519  Joan of Arc
    wh-520  Reconquista

### East Asia — `wh-east-asia`

    wh-521  Sui dynasty
    wh-522  Grand Canal
    wh-523  Tang dynasty
    wh-524  Chang'an
    wh-525  Imperial examination
    wh-526  Woodblock printing
    wh-527  An Lushan Rebellion
    wh-528  Song dynasty
    wh-529  Song economic revolution
    wh-530  Gunpowder
    wh-531  Compass
    wh-532  Movable type
    wh-533  Neo-Confucianism
    wh-534  Chinese porcelain
    wh-535  Yuan dynasty
    wh-536  Marco Polo
    wh-537  Mongol invasions of Japan
    wh-538  Muromachi period
    wh-539  Zen
    wh-540  Goryeo
    wh-541  Korean movable type
    wh-542  Heian period
    wh-543  The Tale of Genji
    wh-544  Samurai
    wh-545  Kamakura shogunate

### South and Southeast Asia — `wh-south-asia`

    wh-546  Harsha
    wh-547  Chola dynasty
    wh-548  Delhi Sultanate
    wh-549  Vijayanagara Empire
    wh-550  Bhakti movement
    wh-551  Islam in India
    wh-552  Indo-Islamic architecture
    wh-553  Indian Ocean trade
    wh-554  Srivijaya
    wh-555  Majapahit
    wh-556  Khmer Empire
    wh-557  Angkor Wat
    wh-558  Pagan Kingdom
    wh-559  Đại Việt
    wh-560  Indianisation of Southeast Asia
    wh-561  Borobudur
    wh-562  Anuradhapura
    wh-563  Spice trade
    wh-564  Dhow
    wh-565  Malacca Sultanate

### Africa — `wh-africa`

    wh-566  Ghana Empire
    wh-567  Trans-Saharan trade
    wh-568  Mali Empire
    wh-569  Sundiata Keita
    wh-570  Mansa Musa
    wh-571  Timbuktu
    wh-572  Songhai Empire
    wh-573  Kanem–Bornu Empire
    wh-574  Hausa Kingdoms
    wh-575  Kingdom of Benin
    wh-576  Benin Bronzes
    wh-577  Swahili coast
    wh-578  Kilwa Kisiwani
    wh-579  Great Zimbabwe
    wh-580  Kingdom of Kongo
    wh-581  Zagwe dynasty
    wh-582  Lalibela
    wh-583  Griot
    wh-584  Islam in West Africa
    wh-585  Christian Nubia

### Steppe empires and the Mongols — `wh-steppe`

    wh-586  Eurasian Steppe
    wh-587  Nomadic pastoralism
    wh-588  Xiongnu
    wh-589  Huns
    wh-590  Attila
    wh-591  Göktürks
    wh-592  Khazars
    wh-593  Genghis Khan
    wh-594  Mongol Empire
    wh-595  Mongol conquests
    wh-596  Pax Mongolica
    wh-597  Siege of Baghdad
    wh-598  Golden Horde
    wh-599  Timur
    wh-600  Legacy of the Mongol Empire

### The Americas before Columbus — `wh-americas`

    wh-601  Tikal
    wh-602  Classic Maya collapse
    wh-603  Chichen Itza
    wh-604  Toltecs
    wh-605  Aztec Empire
    wh-606  Tenochtitlan
    wh-607  Aztec religion
    wh-608  Aztec society
    wh-609  Chinampa
    wh-610  Wari Empire
    wh-611  Tiwanaku
    wh-612  Inca Empire
    wh-613  Cusco
    wh-614  Machu Picchu
    wh-615  Quipu
    wh-616  Inca road system
    wh-617  Mississippian culture
    wh-618  Cahokia
    wh-619  Ancestral Puebloans
    wh-620  Chaco Canyon

## The Early Modern World — `wh-early-modern`

### Renaissance, Reformation and the new science — `wh-renaissance`

    wh-621  Renaissance
    wh-622  Italian city-states
    wh-623  Florence
    wh-624  House of Medici
    wh-625  Renaissance humanism
    wh-626  Petrarch
    wh-627  Leonardo da Vinci
    wh-628  Michelangelo
    wh-629  Linear perspective
    wh-630  Printing press
    wh-631  Johannes Gutenberg
    wh-632  Northern Renaissance
    wh-633  Erasmus
    wh-634  Niccolò Machiavelli
    wh-635  Reformation
    wh-636  Martin Luther
    wh-637  Ninety-five Theses
    wh-638  Protestantism
    wh-639  John Calvin
    wh-640  English Reformation
    wh-641  Henry VIII
    wh-642  Counter-Reformation
    wh-643  Jesuits
    wh-644  European wars of religion
    wh-645  St Bartholomew's Day massacre
    wh-646  Thirty Years' War
    wh-647  Peace of Westphalia
    wh-648  Witch trials in the early modern period
    wh-649  Scientific Revolution
    wh-650  Nicolaus Copernicus
    wh-651  Galileo Galilei
    wh-652  Johannes Kepler
    wh-653  Isaac Newton
    wh-654  Scientific method
    wh-655  Royal Society

### Voyages, conquest and exchange — `wh-voyages`

    wh-656  Age of Discovery
    wh-657  Henry the Navigator
    wh-658  Caravel
    wh-659  Cape Route
    wh-660  Vasco da Gama
    wh-661  Christopher Columbus
    wh-662  Treaty of Tordesillas
    wh-663  Magellan expedition
    wh-664  Conquistador
    wh-665  Hernán Cortés
    wh-666  Fall of Tenochtitlan
    wh-667  Francisco Pizarro
    wh-668  Spanish conquest of the Inca Empire
    wh-669  Columbian exchange
    wh-670  Epidemics in the early Americas
    wh-671  Potosí
    wh-672  Global silver trade
    wh-673  Encomienda
    wh-674  Spanish Empire
    wh-675  Portuguese Empire
    wh-676  Dutch East India Company
    wh-677  English East India Company
    wh-678  Manila galleon
    wh-679  Jamestown
    wh-680  New England colonies
    wh-681  New France
    wh-682  Russian conquest of Siberia
    wh-683  Voyages of James Cook
    wh-684  Mercantilism
    wh-685  Early modern cartography

### The gunpowder empires — `wh-gunpowder`

    wh-686  Gunpowder empires
    wh-687  Ottoman Empire
    wh-688  Mehmed II
    wh-689  Janissary
    wh-690  Suleiman the Magnificent
    wh-691  Siege of Vienna
    wh-692  Battle of Lepanto
    wh-693  Millet system
    wh-694  Battle of Vienna
    wh-695  Safavid Empire
    wh-696  Abbas the Great
    wh-697  Isfahan
    wh-698  Shia Islam in Iran
    wh-699  Mughal Empire
    wh-700  Babur
    wh-701  Akbar
    wh-702  Shah Jahan
    wh-703  Taj Mahal
    wh-704  Aurangzeb
    wh-705  Mansabdar
    wh-706  Sikhism
    wh-707  Maratha Empire
    wh-708  Military revolution
    wh-709  Musket
    wh-710  Crimean Khanate

### Ming and Qing China, Tokugawa Japan — `wh-ming-qing`

    wh-711  Ming dynasty
    wh-712  Zheng He
    wh-713  Forbidden City
    wh-714  Haijin
    wh-715  Fall of the Ming dynasty
    wh-716  Qing dynasty
    wh-717  Kangxi Emperor
    wh-718  Qianlong Emperor
    wh-719  Canton System
    wh-720  Macartney Embassy
    wh-721  Sengoku period
    wh-722  Unification of Japan
    wh-723  Tokugawa shogunate
    wh-724  Sakoku
    wh-725  Hangul

### Slavery and the Atlantic world — `wh-slavery`

    wh-726  Atlantic slave trade
    wh-727  Middle Passage
    wh-728  Triangular trade
    wh-729  Plantation economy
    wh-730  Sugar and the Caribbean
    wh-731  Chattel slavery
    wh-732  Slave codes
    wh-733  Slave rebellion
    wh-734  Maroon communities
    wh-735  Asiento
    wh-736  Royal African Company
    wh-737  Kingdom of Dahomey
    wh-738  Ashanti Empire
    wh-739  Indian Ocean slave trade
    wh-740  Trans-Saharan slave trade
    wh-741  Abolitionism
    wh-742  Olaudah Equiano
    wh-743  Slave Trade Act 1807
    wh-744  Creolisation
    wh-745  Legacy of Atlantic slavery

## Revolutions and Empire — `wh-revolutions`

### The age of revolutions — `wh-age-of-revolutions`

    wh-746  Age of Enlightenment
    wh-747  John Locke
    wh-748  Montesquieu
    wh-749  Voltaire
    wh-750  Jean-Jacques Rousseau
    wh-751  Encyclopédie
    wh-752  Enlightened absolutism
    wh-753  American Revolution
    wh-754  United States Declaration of Independence
    wh-755  American Revolutionary War
    wh-756  United States Constitution
    wh-757  French Revolution
    wh-758  Storming of the Bastille
    wh-759  Declaration of the Rights of Man and of the Citizen
    wh-760  Reign of Terror
    wh-761  Maximilien Robespierre
    wh-762  Napoleon
    wh-763  Napoleonic Wars
    wh-764  Napoleonic Code
    wh-765  Battle of Waterloo
    wh-766  Congress of Vienna
    wh-767  Haitian Revolution
    wh-768  Toussaint Louverture
    wh-769  Spanish American wars of independence
    wh-770  Simón Bolívar
    wh-771  José de San Martín
    wh-772  Mexican War of Independence
    wh-773  Revolutions of 1848
    wh-774  Liberalism
    wh-775  Nationalism

### The Industrial Revolution — `wh-industrial`

    wh-776  Industrial Revolution
    wh-777  British Agricultural Revolution
    wh-778  Enclosure
    wh-779  Steam engine
    wh-780  James Watt
    wh-781  Spinning jenny
    wh-782  Factory system
    wh-783  Coal mining
    wh-784  Bessemer process
    wh-785  Rail transport
    wh-786  Stephenson's Rocket
    wh-787  Canals of the United Kingdom
    wh-788  Urbanisation
    wh-789  Child labour
    wh-790  Factory Acts
    wh-791  Luddite
    wh-792  Trade union
    wh-793  Karl Marx
    wh-794  The Communist Manifesto
    wh-795  Socialism
    wh-796  Second Industrial Revolution
    wh-797  Electrification
    wh-798  Electrical telegraph
    wh-799  Steamship
    wh-800  Suez Canal

### Nations, ideologies and reform — `wh-nations`

    wh-801  Nation state
    wh-802  Unification of Italy
    wh-803  Giuseppe Garibaldi
    wh-804  Unification of Germany
    wh-805  Otto von Bismarck
    wh-806  Franco-Prussian War
    wh-807  Austria-Hungary
    wh-808  Tanzimat
    wh-809  Crimean War
    wh-810  Serfdom in Russia
    wh-811  Emancipation reform of 1861
    wh-812  American Civil War
    wh-813  Abraham Lincoln
    wh-814  Emancipation Proclamation
    wh-815  Reconstruction era
    wh-816  Manifest destiny
    wh-817  Trail of Tears
    wh-818  Women's suffrage
    wh-819  Mary Wollstonecraft
    wh-820  Sanitation and public health reform
    wh-821  Germ theory of disease
    wh-822  Charles Darwin
    wh-823  On the Origin of Species
    wh-824  Compulsory education
    wh-825  Mass-circulation press

### Empire and the colonised world — `wh-imperialism`

    wh-826  New Imperialism
    wh-827  Scramble for Africa
    wh-828  Berlin Conference
    wh-829  Congo Free State
    wh-830  Cecil Rhodes
    wh-831  Anglo-Zulu War
    wh-832  Second Boer War
    wh-833  Battle of Adwa
    wh-834  Herero and Nama genocide
    wh-835  Maji Maji Rebellion
    wh-836  Battle of Plassey
    wh-837  British Raj
    wh-838  Indian Rebellion of 1857
    wh-839  Indian National Congress
    wh-840  Opium Wars
    wh-841  Unequal treaty
    wh-842  Taiping Rebellion
    wh-843  Boxer Rebellion
    wh-844  Meiji Restoration
    wh-845  Industrialisation of Japan
    wh-846  First Sino-Japanese War
    wh-847  Russo-Japanese War
    wh-848  Cash crop economies
    wh-849  Indentured labour
    wh-850  Colonial railways
    wh-851  Christian missions and empire
    wh-852  Settler colonialism
    wh-853  Colonisation of Australia
    wh-854  Treaty of Waitangi
    wh-855  Scientific racism

### A connected world, 1850–1914 — `wh-global-1900`

    wh-856  Age of mass migration
    wh-857  Chinese and Indian diaspora
    wh-858  Immigration to the Americas
    wh-859  Latin America after independence
    wh-860  Caudillo
    wh-861  Mexican Revolution
    wh-862  Abolition of slavery in Brazil
    wh-863  Qajar Iran
    wh-864  Modernisation of Siam
    wh-865  Young Turk Revolution
    wh-866  Zionism
    wh-867  Gold standard
    wh-868  Submarine communications cable
    wh-869  World's fair
    wh-870  The world in 1914

## The Modern World — `wh-modern`

### The First World War — `wh-ww1`

    wh-871  First World War
    wh-872  European alliance system
    wh-873  Assassination of Archduke Franz Ferdinand
    wh-874  July Crisis
    wh-875  Schlieffen Plan
    wh-876  Western Front
    wh-877  Trench warfare
    wh-878  First Battle of the Marne
    wh-879  Battle of Verdun
    wh-880  Battle of the Somme
    wh-881  Gallipoli campaign
    wh-882  Eastern Front
    wh-883  Unrestricted submarine warfare
    wh-884  Chemical weapons in the First World War
    wh-885  Home front
    wh-886  Women's war work
    wh-887  Armenian genocide
    wh-888  Arab Revolt
    wh-889  Sykes–Picot Agreement
    wh-890  Balfour Declaration
    wh-891  American entry into the First World War
    wh-892  Armistice of 11 November 1918
    wh-893  Treaty of Versailles
    wh-894  League of Nations
    wh-895  Spanish flu

### Between the wars — `wh-interwar`

    wh-896  Russian Revolution
    wh-897  Vladimir Lenin
    wh-898  Bolsheviks
    wh-899  Russian Civil War
    wh-900  Soviet Union
    wh-901  Joseph Stalin
    wh-902  Five-year plans of the Soviet Union
    wh-903  Holodomor
    wh-904  Great Purge
    wh-905  Weimar Republic
    wh-906  Hyperinflation in the Weimar Republic
    wh-907  Wall Street Crash of 1929
    wh-908  Great Depression
    wh-909  New Deal
    wh-910  Fascism
    wh-911  Benito Mussolini
    wh-912  Adolf Hitler
    wh-913  Nazi seizure of power
    wh-914  Nuremberg Laws
    wh-915  Appeasement

### The Second World War — `wh-ww2`

    wh-916  Second World War
    wh-917  Molotov–Ribbentrop Pact
    wh-918  Invasion of Poland
    wh-919  Blitzkrieg
    wh-920  Battle of France
    wh-921  Dunkirk evacuation
    wh-922  Battle of Britain
    wh-923  The Blitz
    wh-924  Operation Barbarossa
    wh-925  Siege of Leningrad
    wh-926  Battle of Stalingrad
    wh-927  Second Sino-Japanese War
    wh-928  Nanjing Massacre
    wh-929  Attack on Pearl Harbor
    wh-930  Pacific War
    wh-931  Battle of Midway
    wh-932  North African campaign
    wh-933  Second Battle of El Alamein
    wh-934  The Holocaust
    wh-935  Auschwitz
    wh-936  Resistance during the Second World War
    wh-937  Normandy landings
    wh-938  Battle of the Bulge
    wh-939  Battle of Berlin
    wh-940  Atomic bombings of Hiroshima and Nagasaki
    wh-941  Surrender of Japan
    wh-942  Nuremberg trials
    wh-943  Postwar displacement of peoples
    wh-944  United Nations
    wh-945  Universal Declaration of Human Rights

### The Cold War — `wh-cold-war`

    wh-946  Cold War
    wh-947  Iron Curtain
    wh-948  Truman Doctrine
    wh-949  Marshall Plan
    wh-950  Berlin Blockade
    wh-951  NATO
    wh-952  Warsaw Pact
    wh-953  Chinese Communist Revolution
    wh-954  Mao Zedong
    wh-955  Korean War
    wh-956  Nuclear arms race
    wh-957  Mutual assured destruction
    wh-958  Hungarian Revolution of 1956
    wh-959  Berlin Wall
    wh-960  Cuban Revolution
    wh-961  Cuban Missile Crisis
    wh-962  Space Race
    wh-963  Apollo 11
    wh-964  Vietnam War
    wh-965  Prague Spring
    wh-966  Détente
    wh-967  Great Leap Forward
    wh-968  Cultural Revolution
    wh-969  Soviet–Afghan War
    wh-970  Fall of the Berlin Wall

### Decolonisation and the new nations — `wh-decolonisation`

    wh-971  Decolonisation
    wh-972  Indian independence movement
    wh-973  Mahatma Gandhi
    wh-974  Partition of India
    wh-975  Indonesian National Revolution
    wh-976  Arab–Israeli conflict
    wh-977  Suez Crisis
    wh-978  Algerian War
    wh-979  Year of Africa
    wh-980  Kwame Nkrumah
    wh-981  Non-Aligned Movement
    wh-982  Apartheid
    wh-983  Nelson Mandela
    wh-984  Iranian Revolution
    wh-985  Postcolonial nation-building

### The contemporary world — `wh-contemporary`

    wh-986  Tiananmen Square protests of 1989
    wh-987  Dissolution of the Soviet Union
    wh-988  German reunification
    wh-989  European Union
    wh-990  Chinese economic reform
    wh-991  Yugoslav Wars
    wh-992  Rwandan genocide
    wh-993  Globalisation
    wh-994  Internet
    wh-995  September 11 attacks
    wh-996  War on terror
    wh-997  Arab Spring
    wh-998  Climate change
    wh-999  COVID-19 pandemic
    wh-1000 Anthropocene

---

# The 2026-08-04 renumbering

The collection this plan replaced was **109 cards in one `wh-prehistory` deck**, beside a tree of
empty period decks (`col-44`…`col-64`) that no plan ever filled. The plan above was written first and
from scratch, deliberately without looking at what existed; the 109 were then reconciled against it,
matching on **the card's own answer term**. **89 were renumbered into their planned slot and 20 were
retired**, and the empty decks went with the old one.

**A match is the answer term, not the neighbourhood.** `Sungir` is a Palaeolithic burial and
`wh-063 Palaeolithic burial` was an open slot, but the card answers "Sungir" and the slot asks for the
practice, so the card was retired rather than filed under a question it does not answer. The same rule
retired `Divje Babe flute` against `wh-080 Palaeolithic music`. If the research for either slot ends
up resting on that site, the retired card is the obvious place to start reading — see below.

## What the 20 retirements have in common

They are **site-level and specimen-level cards**: one rock shelter, one ivory figurine, one subspecies,
one pollen chronozone. Every one of them is good work and none of them is wrong. They are simply finer
than a survey of the whole human past can carry at ten cards in a thousand — four separate South
African Middle Stone Age cave sites, three separate Gravettian burial sites, four separate Holocene
chronozones — and they are exactly what a **dedicated Prehistory collection** would be built from, in
the way `col-13` is being built for Greece.

Two things soften the loss, and they are the reason this was done rather than argued about:

- **The research survives in the glossary.** All twenty retired subjects already have a cited
  glossary term at the `GLOSS_SRC_TARGET` bar — `Liang_Bua`, `Sibudu_Cave`, `Border_Cave`,
  `Klasies_River_Caves`, `Pinnacle_Point`, `Hohle_Fels`, `Venus_of_Hohle_Fels`, `Sungir`,
  `Dolní_Věstonice`, `Cosquer_Cave`, `Meadowcroft_Rockshelter`, `Nordic_Stone_Age`, `Preboreal`,
  `Boreal`, `Blytt–Sernander_sequence`, `Post-glacial_rebound` and the rest. **No glossary term was
  deleted.** The definitions, the dates and the citations are all still on the site.
- **The cards themselves are in git**, at `4995e7b` (the commit before this one), with their five-plus
  citations, their date lines and their nine translations intact. Recovering one is a `git show`.

## Retired (20)

    wh-039  Liang Bua
    wh-040  Homo luzonensis
    wh-046  Homo sapiens idaltu
    wh-053  Sibudu Cave
    wh-054  Border Cave
    wh-055  Klasies River Caves
    wh-056  Pinnacle Point
    wh-068  Hohle Fels
    wh-069  Venus of Hohle Fels
    wh-070  Divje Babe flute
    wh-074  Dolní Věstonice
    wh-075  Sungir
    wh-087  Cosquer Cave
    wh-095  Meadowcroft Rockshelter
    wh-101  Nordic Stone Age
    wh-103  Preboreal
    wh-104  Boreal
    wh-105  Atlantic period
    wh-106  Blytt–Sernander sequence
    wh-108  post-glacial rebound

## Renumbered (89)

Read `new  <-  old`. The old numbering is what `docs/citation-plan.md`,
`docs/history-focus-plan.md`, `docs/card-glossary-pairing.md`, `.claude/sources-register.md` and the
batch logs in CLAUDE.md all use: those are historical records of work done under the old ids and were
**not** rewritten, because rewriting a log makes it a worse record. Use this table to read them.

    wh-001  <-  wh-007   Prehistory
    wh-002  <-  wh-006   Three-age system
    wh-003  <-  wh-005   Stone Age
    wh-009  <-  wh-013   Australopithecus
    wh-014  <-  wh-014   Lomekwi
    wh-015  <-  wh-008   Knapping
    wh-016  <-  wh-015   Oldowan
    wh-017  <-  wh-017   Olduvai Gorge
    wh-018  <-  wh-016   Homo habilis
    wh-019  <-  wh-018   Homo erectus
    wh-020  <-  wh-019   Homo ergaster
    wh-021  <-  wh-020   Turkana Boy
    wh-023  <-  wh-024   Dmanisi
    wh-024  <-  wh-025   Java Man
    wh-025  <-  wh-026   Peking Man
    wh-026  <-  wh-027   Zhoukoudian
    wh-027  <-  wh-022   Acheulean
    wh-028  <-  wh-023   Hand axe
    wh-029  <-  wh-098   control of fire
    wh-030  <-  wh-021   Wonderwerk Cave
    wh-032  <-  wh-028   Homo antecessor
    wh-033  <-  wh-029   Atapuerca Mountains
    wh-034  <-  wh-030   Homo heidelbergensis
    wh-035  <-  wh-034   Neanderthal
    wh-036  <-  wh-032   Levallois technique
    wh-037  <-  wh-033   Mousterian
    wh-038  <-  wh-035   Denisovans
    wh-039  <-  wh-036   Denisova Cave
    wh-040  <-  wh-038   Homo floresiensis
    wh-041  <-  wh-037   Homo naledi
    wh-042  <-  wh-043   Homo sapiens
    wh-043  <-  wh-045   Jebel Irhoud
    wh-044  <-  wh-044   Omo remains
    wh-045  <-  wh-047   Mitochondrial Eve
    wh-046  <-  wh-001   Paleolithic
    wh-047  <-  wh-002   Lower Paleolithic
    wh-048  <-  wh-003   Middle Paleolithic
    wh-049  <-  wh-004   Upper Paleolithic
    wh-050  <-  wh-010   Pleistocene
    wh-051  <-  wh-011   Ice age
    wh-052  <-  wh-012   Last Glacial Period
    wh-053  <-  wh-078   Last Glacial Maximum
    wh-054  <-  wh-009   Hunter-gatherer
    wh-055  <-  wh-031   Middle Stone Age
    wh-057  <-  wh-057   Ochre
    wh-058  <-  wh-051   Blombos Cave
    wh-059  <-  wh-052   Howiesons Poort
    wh-060  <-  wh-050   Aterian
    wh-061  <-  wh-058   Behavioural modernity
    wh-064  <-  wh-042   Toba catastrophe theory
    wh-065  <-  wh-041   Neanderthal extinction
    wh-066  <-  wh-065   Châtelperronian
    wh-067  <-  wh-066   Aurignacian
    wh-068  <-  wh-064   Cro-Magnon
    wh-069  <-  wh-067   Lion-man
    wh-070  <-  wh-071   Gravettian
    wh-071  <-  wh-072   Venus figurines
    wh-072  <-  wh-073   Venus of Willendorf
    wh-073  <-  wh-077   Solutrean
    wh-074  <-  wh-079   Magdalenian
    wh-075  <-  wh-083   cave painting
    wh-076  <-  wh-084   Chauvet Cave
    wh-077  <-  wh-086   Lascaux
    wh-078  <-  wh-085   Cave of Altamira
    wh-079  <-  wh-097   petroglyph
    wh-081  <-  wh-081   spear-thrower
    wh-082  <-  wh-082   bow and arrow
    wh-083  <-  wh-080   microlith
    wh-084  <-  wh-088   woolly mammoth
    wh-085  <-  wh-089   Quaternary extinction event
    wh-087  <-  wh-049   Skhul and Qafzeh hominins
    wh-091  <-  wh-048   Y-chromosomal Adam
    wh-093  <-  wh-059   Madjedbebe
    wh-094  <-  wh-060   Lake Mungo remains
    wh-096  <-  wh-076   Mal'ta-Buret' culture
    wh-097  <-  wh-061   Beringia
    wh-098  <-  wh-062   Settlement of the Americas
    wh-099  <-  wh-094   Monte Verde
    wh-100  <-  wh-063   Paleo-Indians
    wh-101  <-  wh-091   Clovis culture
    wh-102  <-  wh-092   Clovis point
    wh-103  <-  wh-093   Folsom tradition
    wh-104  <-  wh-090   Younger Dryas
    wh-105  <-  wh-102   Holocene
    wh-106  <-  wh-099   Mesolithic
    wh-107  <-  wh-100   Epipaleolithic
    wh-108  <-  wh-096   Doggerland
    wh-113  <-  wh-107   Holocene climatic optimum
    wh-114  <-  wh-109   8.2-kiloyear event

## What still carries over

- **Every renumbered card keeps everything it had**: its citations, its markers, its date line, its
  three question phrasings, its tags and its nine translations. Only `id` and `num` changed.
- **The citation pass therefore still stands at its bar** for these 89 — but the deck is no longer
  "109 of 109 complete", because the deck is now 89 of 1000. `node .claude/source-audit.js` reports the
  live figure; the completeness claims in CLAUDE.md's citation-plan bullet are about the old deck.
- **`docs/history-focus-plan.md`'s flags travel with the cards.** A card flagged as too archaeological
  under its old number is still flagged under its new one; re-run the measure rather than trusting the
  old table's ids.
- **A reader's study progress is keyed by card id**, so a renumbered card looks like a new card to the
  scheduler and a retired one leaves a dead entry in `S.cards`. Nothing breaks — `cardById` returns
  undefined and the id is skipped — but 89 cards will come round as unseen again. That is the honest
  cost of renumbering and there is no way to avoid it short of never renumbering.
