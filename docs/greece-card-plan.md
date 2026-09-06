# Ancient Greece — the 1000-card plan

The running order for the `col-13` Ancient Greece collection. Every card has a number, a topic and a
deck, fixed in advance, so the deck can be grown one card at a time across many sessions without
anyone having to remember where it had got to.

Not part of the site.

## How to use this (the whole point of the file)

**"Generate the next Ancient Greece card" means: take the lowest `gr-NNN` that is not yet in
`data.js`, read its topic and deck from the list below, research it, and add it.**

    node -e "global.window={};require('./data.js');const h=new Set(window.CARD_DATA.map(c=>c.id));
      for(let i=1;i<=1000;i++){const id='gr-'+String(i).padStart(3,'0');
      if(!h.has(id)){console.log('next:',id);break}}"

There is deliberately **no separate progress file**. `data.js` is the record of what exists, this file
is the record of what is planned, and the next card is whatever falls between them — so the two can
never disagree about where the work has got to.

Then write the card to the rules in CLAUDE.md ("Generating cards & glossary entries") and add it with:

    node .claude/add-card.js <card.json> <deckId>

**Always pass the deck id.** `add-card.js` falls back to the first leaf in the whole tree when it is
omitted, which is `cn-myth`, in the China collection.

## What a line in this list is, and is not

A line is a **subject to research**, not a fact to assert and not necessarily the finished answer
term. `gr-403 Battle of Marathon` is already an answer term; `gr-032 Minoan religion` is an area, and
the card's actual answer — the word that gets blanked — is chosen while writing it, from what the
sources will support.

So: **a topic may be renamed, split, merged or dropped when the research is done.** Some will turn out
to be thinner than they look, and a few will turn out to be two cards. When that happens, change the
line here in the same commit as the card, and say so — this file is only useful while it is true.

The one thing that must not happen is a card written to fill a slot. The house rule stands: never
invent a date, a name or a definition. If a topic cannot be sourced, say so and replace the line.

**AND CHECK THE SHIPPED DECK FOR THE SUBJECT UNDER ANOTHER NAME BEFORE WRITING.** A line can name an
institution a much earlier card already carries, and the two answer terms will share no words, so
nothing catches it — not `test-card-plans.js`, which checks ids and topics rather than subjects, and
not a grep of the answers. `gr-470` was planned as *Boule and prytaneis* and written as **boule**,
which duplicated `gr-312` **Council of Five Hundred** — the same body, six of ten sentences the same
facts, and a second glossary term for a term that already existed. It was rewritten as **the
prytaneis**, which `gr-312` touches in one clause, and the line above now says so. The check that
would have caught it is to read the deck's existing answers for the SUBJECT, not to match the word.

Card ids run `gr-001` … `gr-1000`, zero-padded to three digits, in the order below. Numbering follows
the tree, and the tree follows chronology, so the running order is roughly chronological — which also
means an early card and a late card in the same deck sort together on the study page, since cards are
ordered by `cardYears(answerDate)` and not by id.

## Allocation

| Deck | Subdeck | Cards | Range |
|---|---|---|---|
| Bronze Age Aegean | Crete and the Cyclades | 55 | gr-001–055 |
| | Mycenaean Greece | 55 | gr-056–110 |
| Early Iron Age | *(flat)* | 60 | gr-111–170 |
| Archaic Greece | Polis and colonisation | 60 | gr-171–230 |
| | Sparta | 45 | gr-231–275 |
| | Athens | 45 | gr-276–320 |
| | Archaic art, verse and thought | 60 | gr-321–380 |
| Classical Greece | Persian Wars | 70 | gr-381–450 |
| | Athenian Empire | 70 | gr-451–520 |
| | Peloponnesian War | 65 | gr-521–585 |
| | Classical arts and thought | 70 | gr-586–655 |
| | Fourth century and the rise of Macedon | 45 | gr-656–700 |
| Alexander and the Hellenistic World | Alexander the Great | 50 | gr-701–750 |
| | Successor kingdoms | 50 | gr-751–800 |
| | Alexandria and Hellenistic science | 45 | gr-801–845 |
| | Greece under Rome | 35 | gr-846–880 |
| Myth and Religion | Olympians and cosmogony | 40 | gr-881–920 |
| | Heroes and the epic cycle | 45 | gr-921–965 |
| | Cult, oracles and festivals | 35 | gr-966–1000 |

Deck totals: Bronze Age Aegean 110 · Early Iron Age 60 · Archaic 210 · Classical 320 ·
Alexander and the Hellenistic World 180 · Myth and Religion 120. **1000.**

The weighting is deliberate. Classical Greece takes a third because that is where the surviving
evidence and the teaching weight sit. Myth takes 120 because it is how most readers arrive. The
Hellenistic 180 is generous against how it is usually taught, and is meant to be: three centuries
across three continents, normally compressed into a fortnight.

## Three decisions this plan forced on the tree

Written down because they were made here, not in the tree, and the reasoning is invisible from the
tree itself.

**Culture got its own subdeck in Archaic and in Classical.** The first pass put lyric, sculpture and
philosophy in the period decks, on the argument that they have dates. They do, and at 200 cards that
still works; at 1000 it does not, because `Polis and colonisation` was carrying Sappho, the Doric
order and the Milesian school on top of eighty colonies. Two new subdecks, `gr-archaic-culture` and
`gr-classical-culture`, take that weight. This is not a thematic axis creeping in — both are still
bounded by period.

**Alexander moved out of Classical and into the Hellenistic deck**, which is retitled *Alexander and
the Hellenistic World*. He is conventionally the last Classical figure and the period is usually dated
from his death, so this is a pedagogical choice against a chronological one: fifty cards on the
campaigns belong beside the Successors who divided them, not beside the Peloponnesian War.

**`gr-macedon` became `gr-fourth-century`** — *Fourth century and the rise of Macedon* — once Alexander
left it. That deck now has to hold Plato and Aristotle, who sit in the fourth century and had nowhere
else to go, and "Macedon and Alexander" would have been a strange address for the *Republic*.

## History, not archaeology — and how many modern scholars get a card

**The rule itself lives in CLAUDE.md** ("FOLIO IS A HISTORY SITE, NOT AN ARCHAEOLOGY SITE") and the
site-wide rewrite pass is `docs/history-focus-plan.md`. Do not restate either here; what follows is only
what is specific to this collection.

This collection is where the fault is easiest to fall into, because the Bronze Age Aegean is known
almost entirely through excavation, so the reachable sources are dig reports and the prose slides into
who dug, how deep, and which excavator reinterpreted whom. All ten shipped cards had to be rewritten on
2026-08-03 for exactly that; `docs/history-focus-plan.md` records what the pass found.

The corollary that bites hardest here is the other CLAUDE.md rule, **a background covers its whole
answer term** — `gr-001` is the worked example, an *Aegean Bronze Age* card that came back seven-tenths
about Crete because Crete is where the palaces, the writing and the best open sources are. Three named
traditions, three shares of the card. Watch for it again on `gr-056 Mycenaean civilisation`,
`gr-111 Greek Dark Ages` and `gr-203 Greek colonisation`, each of which spans regions whose evidence is
very unevenly published.

**Modern scholars are capped at four cards in the thousand**, and these are they:

| card | why it survives the cap |
|---|---|
| `gr-007 Arthur Evans` | named a civilisation nobody knew existed and the three scripts; his restoration is what a visitor sees |
| `gr-057 Heinrich Schliemann` | put Mycenae and Troy into the historical record at all |
| `gr-075 The decipherment of Linear B` | the event, not the two biographies — it proved the Bronze Age mainland spoke Greek |
| `gr-129 The Homeric Question` | about the poems and argued since antiquity, not about a dig |

`gr-264 The Spartan mirage` is not on that list and does not count against it: the gap between
Sparta's image and Spartan reality is a fact about the ancient sources, not modern scholarship about
them, and a Sparta deck that omits it teaches the propaganda.

Five slots changed subject to hold the cap — `gr-045`, `gr-076`, `gr-104`, `gr-105` and `gr-134` —
and are marked **†** in the list below with what they used to be, so a later session can see the trade
rather than wonder at the gap. `gr-045` moved a second time when it was written: *aftermath* is a topic
and not an answer term, and the aftermath of the eruption is in any case largely the story of its ash,
so the card ships as *Theran tephra* — with the Cretan destructions and the Mycenaean takeover left to
`gr-050` and `gr-051`, which is what kept it from eating them.
Three more were recast without changing subject and carry no dagger:
`gr-075` from *Michael Ventris* to the decipherment itself, `gr-102` from *Troy at Hisarlik* to
plain *Troy*, since naming the mound the Victorians dug is the archaeology and the city is the
history, and `gr-172` from *Astu and chora* to plain *Chora* — a pair is not an answer term, and a
blank cannot be filled with two words joined by *and*. The card still teaches both halves, defining
the astu against the chora in its second sentence; what changed is which of the two the reader is
asked to recall, and the sources decided that, the territory being what the scholarship turns on and
the town being covered again by `gr-173` and `gr-174`. `gr-104`'s first draft was *The Trojan War in Greek tradition*, which `gr-944 The Trojan War
in myth` already covers — **check the myth decks before filling a Bronze Age slot**, since they carry
the same names for different subjects.

`gr-171` carries a dagger for a different reason, and it is the one to expect again: **a slot can be
eaten by the card written for the slot before it.** The plan gave `gr-161` *Rise of the polis* and
`gr-171` *Polis*, which read as two subjects and are one — the card written at `gr-161` took *polis*
as its answer term and covered both what a polis is and the argument about when it arose, and the
glossary gained `Polis` with it. So `gr-171` ships as *Dreros*, the Cretan city whose temple wall
carries the oldest surviving Greek law and the first written appearance of the word. That fills a real
gap rather than papering over one: outside `gr-284 Draco's homicide law` the plan had no card anywhere
for early Greek written law, and none for Crete's part in it. **Read the neighbouring slot's shipped
card, not the plan line, before writing** — the plan says what was intended and `data.js` says what
exists, and where a topic is a near-synonym of its neighbour the second one to be written is the one
that finds out.

## Cross-listing

A card may belong to several decks; `subtreeCardIds` dedupes with a `Set` at every branch, so the
collection total stays honest. Each card is listed **once** below, in its primary deck. Cross-list a
second home at writing time where it genuinely earns one — the obvious cases:

- `gr-628 Socratic method`, `gr-629 Trial of Socrates` → also `gr-fourth-century` (399 BCE, after the war)
- `gr-695 Philip II of Macedon`, `gr-699 Battle of Chaeronea` → also `gr-alexander`
- `gr-440 Herodotus`, `gr-522 Thucydides` → also `gr-classical-culture`
- `gr-128 Homer`, `gr-130 Iliad`, `gr-131 Odyssey` → also `gr-heroes`
- `gr-929 Minotaur`, `gr-931 Daedalus and Icarus` → also `gr-crete`

Do not cross-list wholesale. A deck that contains everything relevant is a deck nobody finishes.

## Greece and Rome meet in `gr-under-rome`

`docs/rome-card-plan.md` plans the same events from the Roman side, and its "Living beside the other
collections" section names the five pairs — Pyrrhus, Cynoscephalae, the sack of Corinth, Actium,
Cleopatra. **Read that table before writing anything in `gr-846`–`gr-880`.** These are not duplicates to
be avoided but the same afternoons written twice on purpose: Cynoscephalae is the end of Macedonian
independence here and the beginning of Rome's government of the East there. Write the card this
collection needs.

There is one pair outside that deck: **`gr-738 The invasion of India` and `in-111 Alexander's Indian
campaign`** in `docs/india-card-plan.md` — the same months from opposite ends, one about the limit of a
Macedonian army's reach and one about what arrived on the Indus.

## Glossary

The glossary has essentially nothing Greek — of 401 terms only `Greece` (the modern country) and
`North_Macedonia`. Write the terms **cited from the start**, at the `GLOSS_SRC_TARGET` bar of 2, the
way the N-batches did, rather than opening a backlog to be closed later. Greek is friendlier ground
for this than prehistory: Perseus, the Met and British Museum object records, `chs.harvard.edu` and
out-of-copyright Loebs are all open.

**`Kore` IS THE SCULPTURE TYPE AND `gr-906 Persephone` MUST NOT CLAIM IT AS AN ALIAS.** The key was
taken by `gr-333`, which is about the draped archaic statue; *Kore* is also the goddess's commonest
cult epithet, so the term written for `gr-906` will naturally want it. It may not have it — one
surface cannot answer for two subjects, and `buildGlossIndex` resolves a KEY before any alias, so an
alias added there would simply lose and sit in the table doing nothing. Give Persephone `Kore` only
if the sculpture term is renamed in the same commit, which would mean renaming `gr-333`'s answer.

---

# The list

## Bronze Age Aegean

### Crete and the Cyclades — `gr-crete`

    gr-001  Aegean Bronze Age
    gr-002  Cycladic civilisation
    gr-003  Cycladic figurines
    gr-004  Keros
    gr-005  Early Minoan Crete
    gr-006  Minoan civilisation
    gr-007  Arthur Evans
    gr-008  Knossos
    gr-009  The Minoan palace
    gr-010  Throne Room at Knossos
    gr-011  Phaistos
    gr-012  Malia
    gr-013  Zakros
    gr-014  Gournia
    gr-015  Protopalatial period
    gr-016  Neopalatial period
    gr-017  Palace storerooms and pithoi
    gr-018  Minoan palace economy
    gr-019  Cretan hieroglyphic script
    gr-020  Linear A
    gr-021  Phaistos Disc
    gr-022  Minoan frescoes
    gr-023  Bull-leaping fresco
    gr-024  Snake Goddess figurines
    gr-025  Kamares ware
    gr-026  Marine Style pottery
    gr-027  Minoan seals and sealstones
    gr-028  Peak sanctuaries
    gr-029  Sacred caves of Crete
    gr-030  Horns of consecration
    gr-031  Labrys
    gr-032  Minoan religion
    gr-033  Ayia Triada sarcophagus
    gr-034  Minoan larnax
    gr-035  Mesara tholos tombs
    gr-036  Minoan roads
    gr-037  Minoan water management
    gr-038  Mochlos
    gr-039  Pseira
    gr-040  Palaikastro Kouros
    gr-041  Petras
    gr-042  Akrotiri
    gr-043  Thera eruption
    gr-044  Flotilla fresco
    gr-045  Theran tephra †  (was: Aftermath of the Thera eruption; before that: Dating the Thera eruption)
    gr-046  Minoan trade with Egypt
    gr-047  Keftiu
    gr-048  Minoan thalassocracy
    gr-049  Minoan Kythera
    gr-050  Destruction of the Minoan palaces
    gr-051  Mycenaean Knossos
    gr-052  Knossos Linear B archive
    gr-053  Postpalatial Crete
    gr-054  Eteocretan
    gr-055  The Idaean Cave †  (was: Mount Ida and the Idaean Cave)

### Mycenaean Greece — `gr-mycenae`

    gr-056  Mycenaean civilisation
    gr-057  Heinrich Schliemann
    gr-058  Mycenae
    gr-059  Lion Gate
    gr-060  Grave Circle A
    gr-061  Grave Circle B
    gr-062  Mask of Agamemnon
    gr-063  Shaft graves
    gr-064  Tholos tomb
    gr-065  Treasury of Atreus
    gr-066  Cyclopean masonry
    gr-067  Tiryns
    gr-068  Palace of Nestor at Pylos
    gr-069  Mycenaean Thebes
    gr-070  Midea
    gr-071  Gla
    gr-072  Megaron
    gr-073  Mycenaean fresco
    gr-074  Linear B
    gr-075  The decipherment of Linear B  (was: Michael Ventris)
    gr-076  The Linear B scribes †  (was: John Chadwick)
    gr-077  Pylos tablets
    gr-078  Wanax
    gr-079  Lawagetas
    gr-080  Qa-si-re-u
    gr-081  Damos
    gr-082  Mycenaean palace economy
    gr-083  Mycenaean textile industry
    gr-084  Mycenaean land tenure
    gr-085  Mycenaean gods in Linear B
    gr-086  Potnia
    gr-087  Mycenaean chariot
    gr-088  Dendra panoply
    gr-089  Boar's tusk helmet
    gr-090  Figure-of-eight shield
    gr-091  Stirrup jar
    gr-092  Vapheio cups
    gr-093  Mycenaean trade
    gr-094  Uluburun shipwreck
    gr-095  Ahhiyawa
    gr-096  Mycenaean Greek
    gr-097  Mycenaean expansion in the Aegean
    gr-098  Mycenaean Miletus
    gr-099  Drainage of Lake Copais
    gr-100  Mycenaean roads and bridges
    gr-101  The Isthmus wall
    gr-102  Troy  (was: Troy at Hisarlik)
    gr-103  Troy VI and Troy VIIa
    gr-104  Troy's citadel and lower town †  (was: Schliemann at Troy)
    gr-105  Troy and the Dardanelles †  (was: Priam's Treasure)
    gr-106  Wilusa
    gr-107  Late Bronze Age collapse
    gr-108  Sea Peoples
    gr-109  Destruction of Pylos
    gr-110  Postpalatial Greece

## Early Iron Age — `gr-iron`

    gr-111  Greek Dark Ages
    gr-112  Submycenaean period
    gr-113  Protogeometric period
    gr-114  Geometric period
    gr-115  Depopulation after the palaces
    gr-116  Lefkandi
    gr-117  The Toumba building at Lefkandi
    gr-118  Nichoria
    gr-119  Zagora on Andros
    gr-120  Iron metallurgy in Greece
    gr-121  Cremation burial
    gr-122  Cist grave
    gr-123  Kerameikos
    gr-124  Dipylon Amphora
    gr-125  Geometric pottery
    gr-126  Hero cult at Bronze Age tombs
    gr-127  The aoidos
    gr-128  Homer
    gr-129  The Homeric Question
    gr-130  Iliad
    gr-131  Odyssey
    gr-132  Dactylic hexameter
    gr-133  Formulaic composition
    gr-134  The rhapsode †  (was: Milman Parry)
    gr-135  Homeric society
    gr-136  Oikos
    gr-137  Xenia
    gr-138  Kleos
    gr-139  Basileus in the Early Iron Age
    gr-140  Hesiod
    gr-141  Theogony
    gr-142  Works and Days
    gr-143  Ascra
    gr-144  The Greek alphabet
    gr-145  The Phoenician alphabet
    gr-146  Dipylon inscription
    gr-147  Nestor's Cup
    gr-148  Pithekoussai
    gr-149  Al Mina
    gr-150  Euboean trade
    gr-151  Phoenicians in the Aegean
    gr-152  Ionian migration
    gr-153  Aeolian migration
    gr-154  The Dorian invasion
    gr-155  Return of the Heracleidae
    gr-156  Greek dialects
    gr-157  Arcadocypriot
    gr-158  The Cypriot city-kingdoms †  (was: Cyprus in the Early Iron Age)
    gr-159  The Cypriot syllabary
    gr-160  Synoecism
    gr-161  Rise of the polis
    gr-162  Ethnos
    gr-163  Early Olympia
    gr-164  Early Delphi
    gr-165  Heraion of Samos
    gr-166  Perachora
    gr-167  Votive dedication
    gr-168  Bronze tripod cauldrons
    gr-169  Warrior burials
    gr-170  The eighth-century revival

## Archaic Greece

### Polis and colonisation — `gr-polis`

    gr-171  Dreros †  (was: Polis)
    gr-172  Chora
    gr-173  Acropolis
    gr-174  Agora
    gr-175  Polites
    gr-176  Phyle
    gr-177  Phratry
    gr-178  Genos
    gr-179  Archaic aristocracy
    gr-180  Hoplite
    gr-181  Phalanx
    gr-182  Aspis
    gr-183  Corinthian helmet
    gr-184  Hoplite reform
    gr-185  Chigi Vase
    gr-186  Tyrannos
    gr-187  Cypselus
    gr-188  Periander
    gr-189  Archaic Corinth
    gr-190  Diolkos
    gr-191  Cleisthenes of Sicyon
    gr-192  Polycrates of Samos
    gr-193  Tunnel of Eupalinos
    gr-194  Pheidon of Argos
    gr-195  Archaic Argos
    gr-196  Aegina
    gr-197  Chalcis and Eretria
    gr-198  Lelantine War
    gr-199  Archaic Miletus
    gr-200  Ionia
    gr-201  Panionion
    gr-202  Artemision at Ephesus
    gr-203  Greek colonisation
    gr-204  Apoikia
    gr-205  Oikist
    gr-206  Cyrene
    gr-207  Battus
    gr-208  Syracuse
    gr-209  Megara Hyblaea
    gr-210  Gela and Acragas
    gr-211  Selinus
    gr-212  Sybaris
    gr-213  Croton
    gr-214  Taras
    gr-215  Cumae
    gr-216  Massalia
    gr-217  Emporion
    gr-218  Black Sea colonisation
    gr-219  Byzantium
    gr-220  Olbia
    gr-221  Naucratis
    gr-222  Greek mercenaries in Egypt
    gr-223  Magna Graecia
    gr-224  The invention of coinage
    gr-225  Lydian electrum coinage
    gr-226  Croesus
    gr-227  Greek weight standards
    gr-228  Panhellenic sanctuary
    gr-229  Olympic Games
    gr-230  The Olympic truce

### Sparta — `gr-sparta`

    gr-231  Sparta
    gr-232  Laconia
    gr-233  Lacedaemon
    gr-234  The Herakleidai and Dorian Sparta
    gr-235  The Messenian Wars
    gr-236  First Messenian War
    gr-237  Second Messenian War
    gr-238  Tyrtaeus
    gr-239  Helots
    gr-240  Perioikoi
    gr-241  Spartiates
    gr-242  Krypteia
    gr-243  Lycurgus
    gr-244  The Great Rhetra
    gr-245  Spartan dual kingship
    gr-246  Agiads and Eurypontids
    gr-247  Gerousia
    gr-248  Ephors
    gr-249  Apella
    gr-250  Agoge
    gr-251  Syssitia
    gr-252  The Spartan kleros
    gr-253  Spartan women
    gr-254  Spartan austerity
    gr-255  The Spartan army
    gr-256  Mora and lochos
    gr-257  Hippeis
    gr-258  Spartan iron money
    gr-259  Amyclae and the Hyacinthia
    gr-260  Menelaion
    gr-261  Sanctuary of Artemis Orthia
    gr-262  Laconian pottery
    gr-263  Alcman
    gr-264  The Spartan mirage
    gr-265  Peloponnesian League
    gr-266  Chilon of Sparta
    gr-267  Cleomenes I
    gr-268  Demaratus
    gr-269  Sparta and Croesus
    gr-270  Sparta against the tyrants
    gr-271  Battle of the Fetters
    gr-272  Battle of the Champions
    gr-273  Sparta and Argos
    gr-274  Spartan burial custom
    gr-275  Spartan divination

### Athens — `gr-athens`

    gr-276  Attica
    gr-277  Synoecism of Attica
    gr-278  Athenian foundation traditions
    gr-279  The Athenian archons
    gr-280  Areopagus
    gr-281  Eupatridae
    gr-282  Cylon's coup
    gr-283  Draco
    gr-284  Draco's homicide law
    gr-285  Hektemoroi
    gr-286  Solon
    gr-287  Seisachtheia
    gr-288  Solon's property classes
    gr-289  Pentakosiomedimnoi
    gr-290  Zeugitai
    gr-291  Thetes
    gr-292  Solon's Council of Four Hundred
    gr-293  Heliaia
    gr-294  Solon's poems
    gr-295  Solon's travels
    gr-296  Athenian party strife after Solon
    gr-297  Peisistratus
    gr-298  Peisistratus' three bids for power
    gr-299  Peisistratid Athens
    gr-300  Hippias
    gr-301  Hipparchus son of Peisistratus
    gr-302  Harmodius and Aristogeiton
    gr-303  The Tyrannicides
    gr-304  Alcmaeonids
    gr-305  Fall of the Peisistratids
    gr-306  The Spartan intervention at Athens
    gr-307  Isagoras
    gr-308  Cleisthenes of Athens
    gr-309  The Cleisthenic tribes
    gr-310  Deme
    gr-311  Trittys
    gr-312  The Council of Five Hundred
    gr-313  Isonomia
    gr-314  Ostracism
    gr-315  Naukrary
    gr-316  The Peisistratid building programme
    gr-317  Old Temple of Athena
    gr-318  Silver at Laurion
    gr-319  Athenian owls
    gr-320  Athens and Aegina

### Archaic art, verse and thought — `gr-archaic-culture`

    gr-321  The Archaic period
    gr-322  The Orientalising period
    gr-323  Corinthian pottery
    gr-324  Black-figure technique
    gr-325  Exekias
    gr-326  François Vase
    gr-327  Kleitias
    gr-328  Amasis Painter
    gr-329  The Attic pottery trade
    gr-330  Red-figure technique
    gr-331  Andokides Painter
    gr-332  Kouros
    gr-333  Kore
    gr-334  The archaic smile
    gr-335  Peplos Kore
    gr-336  Anavysos Kouros
    gr-337  Moschophoros
    gr-338  The archaic Greek temple
    gr-339  Doric order
    gr-340  Ionic order
    gr-341  The peripteral plan
    gr-342  Temple of Hera at Olympia
    gr-343  Temple of Artemis at Corfu
    gr-344  Siphnian Treasury
    gr-345  The treasuries at Delphi
    gr-346  Pediment sculpture
    gr-347  Frieze and metope
    gr-348  Aeolic capital
    gr-349  Archaic bronze casting
    gr-350  Greek lyric poetry
    gr-351  Elegy
    gr-352  Iambus
    gr-353  Archilochus
    gr-354  Sappho
    gr-355  Alcaeus
    gr-356  Lesbos and the Aeolic poets
    gr-357  Mimnermus
    gr-358  Theognis
    gr-359  Anacreon
    gr-360  Ibycus
    gr-361  Stesichorus
    gr-362  Simonides of Ceos
    gr-363  The symposium
    gr-364  Skolion
    gr-365  Aesop
    gr-366  Presocratic philosophy
    gr-367  Thales
    gr-368  Anaximander
    gr-369  Anaximenes
    gr-370  The Milesian school
    gr-371  Pythagoras
    gr-372  Pythagoreanism
    gr-373  Xenophanes
    gr-374  Heraclitus
    gr-375  Parmenides
    gr-376  Zeno of Elea
    gr-377  The Eleatic school
    gr-378  Empedocles
    gr-379  Hecataeus of Miletus
    gr-380  Alcmaeon of Croton

## Classical Greece

### Persian Wars — `gr-persian-wars`

    gr-381  The Achaemenid Empire
    gr-382  Cyrus the Great
    gr-383  The Persian conquest of Lydia
    gr-384  The Persian conquest of Ionia
    gr-385  Cambyses II
    gr-386  Darius I
    gr-387  Satrapy
    gr-388  The Royal Road
    gr-389  The Persian army
    gr-390  The Immortals
    gr-391  Darius' Scythian campaign
    gr-392  Aristagoras
    gr-393  Histiaeus
    gr-394  The Ionian Revolt
    gr-395  The burning of Sardis
    gr-396  Battle of Lade
    gr-397  The sack of Miletus
    gr-398  Phrynichus' Capture of Miletus
    gr-399  Mardonius' campaign of 492
    gr-400  Earth and water
    gr-401  Datis and Artaphernes
    gr-402  The sack of Eretria
    gr-403  Battle of Marathon
    gr-404  Miltiades
    gr-405  Callimachus the polemarch
    gr-406  Pheidippides
    gr-407  The Soros at Marathon
    gr-408  The shield signal at Marathon
    gr-409  Themistocles
    gr-410  Themistocles' naval bill
    gr-411  The Laurion strike of 483
    gr-412  Aristides
    gr-413  The ostracism of Aristides
    gr-414  Xerxes I
    gr-415  The Hellespont bridges
    gr-416  The Athos canal
    gr-417  The invasion of 480
    gr-418  The Hellenic League
    gr-419  The congress at the Isthmus
    gr-420  The wooden wall oracle
    gr-421  The Tempe expedition
    gr-422  Battle of Thermopylae
    gr-423  Leonidas I
    gr-424  Ephialtes of Trachis
    gr-425  The Thespians at Thermopylae
    gr-426  Battle of Artemisium
    gr-427  The evacuation of Athens
    gr-428  The Troezen decree
    gr-429  The sack of the Acropolis
    gr-430  Battle of Salamis
    gr-431  Eurybiades
    gr-432  Artemisia I of Caria
    gr-433  The Persian retreat
    gr-434  Mardonius in Greece
    gr-435  Battle of Plataea
    gr-436  Pausanias the regent
    gr-437  Battle of Mycale
    gr-438  The Serpent Column
    gr-439  The Persian Wars in Herodotus
    gr-440  Herodotus
    gr-441  Aeschylus' Persians
    gr-442  Medism
    gr-443  Simonides' war epigrams
    gr-444  The Themistoclean wall
    gr-445  The fortification of Piraeus
    gr-446  Battle of Himera
    gr-447  Gelon of Syracuse
    gr-448  The Carthaginian invasion of Sicily
    gr-449  Greek victory monuments
    gr-450  The legacy of the Persian Wars

### Athenian Empire — `gr-athenian-empire`

    gr-451  The Delian League
    gr-452  The treasury at Delos
    gr-453  Phoros
    gr-454  The assessment of Aristides
    gr-455  Cimon
    gr-456  Siege of Eion
    gr-457  Scyros
    gr-458  Battle of the Eurymedon
    gr-459  The revolt of Naxos
    gr-460  The revolt of Thasos
    gr-461  The helot revolt of 464
    gr-462  The Spartan earthquake
    gr-463  Cimon at Ithome
    gr-464  The ostracism of Cimon
    gr-465  Ephialtes the reformer
    gr-466  The Areopagus reform of 462
    gr-467  Pericles
    gr-468  Athenian radical democracy
    gr-469  Ecclesia
    gr-470  The prytaneis
    gr-471  Dikasteria
    gr-472  Misthos
    gr-473  Strategos
    gr-474  Pericles' citizenship law
    gr-475  The First Peloponnesian War
    gr-476  Battle of Tanagra
    gr-477  Battle of Oenophyta
    gr-478  The Egyptian expedition
    gr-479  The transfer of the treasury
    gr-480  The Peace of Callias
    gr-481  The Thirty Years' Peace
    gr-482  Cleruchy
    gr-483  The Athenian tribute lists
    gr-484  The Coinage Decree
    gr-485  The revolt of Samos
    gr-486  Athens and the allies
    gr-487  Piraeus
    gr-488  The Long Walls
    gr-489  Hippodamus of Miletus
    gr-490  The Athenian trireme
    gr-491  Trierarchy
    gr-492  Liturgy
    gr-493  The navy and the thetes
    gr-494  The Periclean building programme
    gr-495  The Parthenon
    gr-496  Phidias
    gr-497  Athena Parthenos
    gr-498  The Parthenon frieze
    gr-499  The Parthenon metopes
    gr-500  Ictinus and Callicrates
    gr-501  The Propylaea
    gr-502  The Erechtheion
    gr-503  Caryatid
    gr-504  Temple of Athena Nike
    gr-505  The Hephaisteion
    gr-506  The Odeon of Pericles
    gr-507  The Telesterion at Eleusis
    gr-508  Pericles' funeral oration
    gr-509  Aspasia
    gr-510  Metics
    gr-511  Slavery at Athens
    gr-512  The poletai and the public sales   (was: The Laurion mines — carded at gr-318 and gr-411)
    gr-513  The Athenian grain trade
    gr-514  The buildings of the Athenian agora
    gr-515  The Painted Stoa
    gr-516  Polygnotus
    gr-517  Thucydides son of Melesias   (the critics of the democracy, through the man who led them)
    gr-518  The Old Oligarch
    gr-519  The treasury of the Other Gods   (the building budget is already carded at gr-494)
    gr-520  The Kleinias decree   (the Chalcis decree is already carded at gr-486)

### Peloponnesian War — `gr-peloponnesian-war`

    gr-521  The Peloponnesian War
    gr-522  Thucydides
    gr-523  The causes of the war   (carded on `prophasis`, the word Thucydides uses for it)
    gr-524  The Corcyra affair   (carded on Epidamnus; `Corcyra` is already a glossary term)
    gr-525  Battle of Sybota
    gr-526  Potidaea
    gr-527  The Megarian Decree
    gr-528  The Spartan ultimatum of 432
    gr-529  The Archidamian War
    gr-530  Archidamus II
    gr-531  Pericles' strategy
    gr-532  The invasions of Attica   (carded on Acharnae, where the first one stopped)
    gr-533  The plague of Athens
    gr-534  The death of Pericles   (carded on `first citizen`; `Pericles` is already carded at gr-467)
    gr-535  Cleon
    gr-536  The Mytilenean revolt
    gr-537  The Mytilenean debate
    gr-538  The siege of Plataea, 429–427 BCE
    gr-539  Battle of Pylos
    gr-540  Sphacteria
    gr-541  Brasidas
    gr-542  Amphipolis
    gr-543  Battle of Amphipolis
    gr-544  The exile of Thucydides   (carded on Eion, the harbour he did save; the exile itself is at gr-522)
    gr-545  The Peace of Nicias
    gr-546  Nicias
    gr-547  Alcibiades
    gr-548  Battle of Mantinea, 418 BCE
    gr-549  The Argive alliance
    gr-550  The Melian Dialogue
    gr-551  The siege of Melos
    gr-552  The Sicilian Expedition
    gr-553  Egesta
    gr-554  The mutilation of the Herms
    gr-555  The recall of Alcibiades   (carded on the `Salaminia`, the ship sent to fetch him)
    gr-556  The siege of Syracuse
    gr-557  Gylippus
    gr-558  Battle of the Great Harbour
    gr-559  Demosthenes the general   (glossary key `Demosthenes_(general)`, so it cannot auto-link the orator)
    gr-560  The destruction of the Athenian force   (carded on the `Assinarus`, the river where it ended)
    gr-561  The Decelean War
    gr-562  The fortification of Decelea   (carded on `epiteichismos`, the strategy it is the great example of)
    gr-563  Persian intervention   (carded on Amorges, whose revolt is why Tissaphernes wanted a Spartan alliance)
    gr-564  Tissaphernes
    gr-565  Pharnabazus
    gr-566  The treaties with Persia   (carded on Lichas, the Spartan who repudiated the first two of them)
    gr-567  The oligarchic coup of 411   (carded on Colonus, where the assembly voted the democracy away)
    gr-568  The oligarchy of the Four Hundred
    gr-569  The Five Thousand
    gr-570  The fleet at Samos   (`Samos` itself is already a glossary term, so the card answers `Athenian fleet at Samos`)
    gr-571  Battle of Cynossema
    gr-572  Battle of Cyzicus
    gr-573  The restoration of the democracy   (carded on the decree of Demophantus, the oath it was secured with)
    gr-574  Battle of Arginusae
    gr-575  The trial of the generals   (carded on the decree of Cannonus, the law the assembly set aside to hold it)
    gr-576  Lysander
    gr-577  Battle of Aegospotami
    gr-578  The siege of Athens
    gr-579  The surrender of Athens
    gr-580  The demolition of the Long Walls   (`Long Walls` is carded at gr-488, so this answers the demolition itself)
    gr-581  The Thirty Tyrants
    gr-582  Critias
    gr-583  Thrasybulus
    gr-584  The restoration of 403
    gr-585  The amnesty of 403

### Classical arts and thought — `gr-classical-culture`

    gr-586  The Classical period
    gr-587  Greek tragedy
    gr-588  The City Dionysia
    gr-589  The tragic chorus
    gr-590  Thespis
    gr-591  Aeschylus
    gr-592  Oresteia
    gr-593  Prometheus Bound
    gr-594  Seven Against Thebes
    gr-595  Sophocles
    gr-596  Oedipus Tyrannus
    gr-597  Antigone
    gr-598  Ajax
    gr-599  Philoctetes
    gr-600  Euripides
    gr-601  Medea
    gr-602  Bacchae
    gr-603  Trojan Women
    gr-604  Hippolytus
    gr-605  Satyr play
    gr-606  Old Comedy
    gr-607  Aristophanes
    gr-608  Clouds
    gr-609  Lysistrata
    gr-610  Frogs
    gr-611  Birds
    gr-612  The Theatre of Dionysus
    gr-613  Greek theatre architecture
    gr-614  Skene and orchestra
    gr-615  The tragic mask
    gr-616  Choregos
    gr-617  Herodotus' Histories
    gr-618  Thucydides' method
    gr-619  Xenophon
    gr-620  Hellenica
    gr-621  Anabasis
    gr-622  The sophists
    gr-623  Protagoras
    gr-624  Gorgias
    gr-625  Prodicus
    gr-626  Antiphon
    gr-627  Socrates
    gr-628  The Socratic method
    gr-629  The trial of Socrates
    gr-630  Plato's Apology
    gr-631  Xenophon's Memorabilia
    gr-632  Hippocrates
    gr-633  The Hippocratic Corpus
    gr-634  The Hippocratic Oath
    gr-635  Humoral theory
    gr-636  Fifth-century Greek mathematics
    gr-637  Hippocrates of Chios
    gr-638  Anaxagoras
    gr-639  Democritus
    gr-640  Leucippus
    gr-641  Atomism
    gr-642  Classical Greek sculpture
    gr-643  The Severe Style
    gr-644  Kritios Boy
    gr-645  Charioteer of Delphi
    gr-646  Riace bronzes
    gr-647  Myron
    gr-648  Discobolus
    gr-649  Polykleitos
    gr-650  Doryphoros
    gr-651  The Canon of Polykleitos
    gr-652  Contrapposto
    gr-653  Red-figure masters
    gr-654  Euphronios
    gr-655  White-ground lekythos

### Fourth century and the rise of Macedon — `gr-fourth-century`

    gr-656  Spartan hegemony
    gr-657  The Corinthian War
    gr-658  Battle of Nemea
    gr-659  Battle of Coronea, 394 BCE
    gr-660  Battle of Cnidus
    gr-661  Conon
    gr-662  The King's Peace
    gr-663  Agesilaus II
    gr-664  Agesilaus in Asia Minor
    gr-665  The seizure of the Cadmea
    gr-666  The liberation of Thebes
    gr-667  The Second Athenian League
    gr-668  Epaminondas
    gr-669  Pelopidas
    gr-670  The Sacred Band of Thebes
    gr-671  Battle of Leuctra
    gr-672  Theban hegemony
    gr-673  The liberation of Messenia
    gr-674  Megalopolis
    gr-675  Battle of Mantinea, 362 BCE
    gr-676  The Social War
    gr-677  Plato
    gr-678  The Academy
    gr-679  Plato's Republic
    gr-680  The theory of Forms
    gr-681  Plato's Symposium
    gr-682  Aristotle
    gr-683  The Lyceum
    gr-684  Aristotle's Politics
    gr-685  Nicomachean Ethics
    gr-686  Aristotle's biology
    gr-687  Diogenes of Sinope
    gr-688  Cynicism
    gr-689  Isocrates
    gr-690  Attic oratory
    gr-691  Lysias
    gr-692  Demosthenes the orator
    gr-693  The Philippics
    gr-694  Aeschines
    gr-695  Philip II of Macedon
    gr-696  The Macedonian phalanx
    gr-697  Sarissa
    gr-698  The Third Sacred War
    gr-699  Battle of Chaeronea
    gr-700  The League of Corinth

## Alexander and the Hellenistic World

### Alexander the Great — `gr-alexander`

    gr-701  Alexander the Great
    gr-702  Olympias
    gr-703  The assassination of Philip II
    gr-704  Alexander's accession
    gr-705  The destruction of Thebes
    gr-706  Alexander's army
    gr-707  The Companion cavalry
    gr-708  Hetairoi and pezhetairoi
    gr-709  Parmenion
    gr-710  The crossing of the Hellespont
    gr-711  Battle of the Granicus
    gr-712  The siege of Miletus
    gr-713  The siege of Halicarnassus
    gr-714  The Gordian Knot
    gr-715  Battle of Issus
    gr-716  Darius III
    gr-717  The siege of Tyre
    gr-718  The siege of Gaza
    gr-719  Alexander in Egypt
    gr-720  The founding of Alexandria
    gr-721  The oracle of Ammon at Siwa
    gr-722  Battle of Gaugamela
    gr-723  The fall of Babylon
    gr-724  Susa
    gr-725  Persepolis
    gr-726  The burning of Persepolis
    gr-727  The death of Darius III
    gr-728  Bessus
    gr-729  Alexander's Persianising policy
    gr-730  Proskynesis
    gr-731  The fall of Philotas
    gr-732  The murder of Parmenion
    gr-733  The killing of Cleitus
    gr-734  The Pages' Conspiracy
    gr-735  Callisthenes
    gr-736  Bactria and Sogdiana
    gr-737  Roxana
    gr-738  The invasion of India
    gr-739  Battle of the Hydaspes
    gr-740  Porus
    gr-741  The mutiny at the Hyphasis
    gr-742  The Gedrosian march
    gr-743  Nearchus' voyage
    gr-744  The Susa weddings
    gr-745  The mutiny at Opis
    gr-746  The death of Hephaestion
    gr-747  The death of Alexander
    gr-748  Alexander's city foundations
    gr-749  The Alexander historians
    gr-750  Alexander's legacy

### Successor kingdoms — `gr-successors`

    gr-751  The Diadochi
    gr-752  The Partition of Babylon
    gr-753  Perdiccas
    gr-754  Antipater
    gr-755  The Lamian War
    gr-756  Battle of Crannon
    gr-757  The death of Demosthenes
    gr-758  Eumenes of Cardia
    gr-759  The Partition of Triparadisus
    gr-760  Cassander
    gr-761  Antigonus Monophthalmus
    gr-762  Demetrius Poliorcetes
    gr-763  The siege of Rhodes
    gr-764  The Colossus of Rhodes
    gr-765  Battle of Ipsus
    gr-766  Ptolemy I Soter
    gr-767  Ptolemaic Egypt
    gr-768  Seleucus I Nicator
    gr-769  The Seleucid Empire
    gr-770  Antigonid Macedonia
    gr-771  Lysimachus
    gr-772  Battle of Corupedium
    gr-773  Hellenistic kingship
    gr-774  Ruler cult
    gr-775  Hellenistic queens
    gr-776  Arsinoe II
    gr-777  Berenice II
    gr-778  Ptolemaic administration
    gr-779  Seleucid colonisation
    gr-780  Antioch
    gr-781  Seleucia on the Tigris
    gr-782  Ai-Khanoum
    gr-783  The Greco-Bactrian Kingdom
    gr-784  The Indo-Greek Kingdom
    gr-785  Menander I
    gr-786  The Milindapanha
    gr-787  The Celtic invasion of Greece
    gr-788  The Galatians
    gr-789  Attalid Pergamon
    gr-790  The Great Altar of Pergamon
    gr-791  The Library of Pergamon
    gr-792  Antiochus III
    gr-793  The Syrian Wars
    gr-794  Battle of Raphia
    gr-795  The Aetolian League
    gr-796  The Achaean League
    gr-797  Aratus of Sicyon
    gr-798  Cleomenes III
    gr-799  The Spartan revolution
    gr-800  Hellenistic siege warfare

### Alexandria and Hellenistic science — `gr-alexandria`

    gr-801  Hellenistic Alexandria
    gr-802  The Library of Alexandria
    gr-803  The Mouseion
    gr-804  The Pharos of Alexandria
    gr-805  Demetrius of Phalerum
    gr-806  Zenodotus
    gr-807  Callimachus
    gr-808  Aetia
    gr-809  Apollonius of Rhodes
    gr-810  Argonautica
    gr-811  Theocritus
    gr-812  Bucolic poetry
    gr-813  Hellenistic epigram
    gr-814  Alexandrian scholarship
    gr-815  Aristarchus of Samothrace
    gr-816  The Septuagint
    gr-817  Euclid
    gr-818  Euclid's Elements
    gr-819  Archimedes
    gr-820  Archimedes' principle
    gr-821  Archimedes at the siege of Syracuse
    gr-822  Apollonius of Perga
    gr-823  Conic sections
    gr-824  Eratosthenes
    gr-825  Measuring the Earth
    gr-826  Aristarchus of Samos
    gr-827  The heliocentric hypothesis
    gr-828  Hipparchus of Nicaea
    gr-829  Precession of the equinoxes
    gr-830  Ctesibius
    gr-831  Philo of Byzantium
    gr-832  Herophilus
    gr-833  Erasistratus
    gr-834  Alexandrian anatomy
    gr-835  The Antikythera mechanism
    gr-836  Hellenistic geography
    gr-837  Pytheas of Massalia
    gr-838  Stoicism
    gr-839  Zeno of Citium
    gr-840  Chrysippus
    gr-841  Epicureanism
    gr-842  Epicurus
    gr-843  The Garden
    gr-844  Pyrrho and scepticism
    gr-845  Hellenistic sculpture

### Greece under Rome — `gr-under-rome`

    gr-846  Pyrrhus of Epirus
    gr-847  The Pyrrhic War
    gr-848  Rome and the Greek East
    gr-849  The Illyrian Wars
    gr-850  The First Macedonian War
    gr-851  Philip V of Macedon
    gr-852  The Second Macedonian War
    gr-853  Battle of Cynoscephalae
    gr-854  Flamininus
    gr-855  The declaration at the Isthmus
    gr-856  The Roman–Seleucid War
    gr-857  Battle of Magnesia
    gr-858  The Treaty of Apamea
    gr-859  The Third Macedonian War
    gr-860  Perseus of Macedon
    gr-861  Battle of Pydna
    gr-862  The province of Macedonia
    gr-863  The Achaean War
    gr-864  The sack of Corinth
    gr-865  Polybius
    gr-866  Polybius on the constitution
    gr-867  Delos as a free port
    gr-868  The bequest of Attalus III
    gr-869  The Mithridatic Wars
    gr-870  Sulla at Athens
    gr-871  Greece in the Roman civil wars
    gr-872  Battle of Pharsalus
    gr-873  Battle of Philippi
    gr-874  Battle of Actium
    gr-875  The end of Ptolemaic Egypt
    gr-876  Cleopatra VII
    gr-877  The province of Achaea
    gr-878  Hellenisation at Rome
    gr-879  The Second Sophistic
    gr-880  The afterlife of Greek learning

## Myth and Religion

### Olympians and cosmogony — `gr-olympians`

    gr-881  Greek mythology
    gr-882  Greek cosmogony
    gr-883  Chaos
    gr-884  Gaia
    gr-885  Uranus
    gr-886  The Titans
    gr-887  Cronus
    gr-888  The Titanomachy
    gr-889  Rhea
    gr-890  Zeus
    gr-891  Hera
    gr-892  Poseidon
    gr-893  Demeter
    gr-894  Hestia
    gr-895  Hades
    gr-896  Athena
    gr-897  Apollo
    gr-898  Artemis
    gr-899  Ares
    gr-900  Aphrodite
    gr-901  Hephaestus
    gr-902  Hermes
    gr-903  Dionysus
    gr-904  The Twelve Olympians
    gr-905  Mount Olympus
    gr-906  Persephone
    gr-907  The abduction of Persephone
    gr-908  Prometheus
    gr-909  The theft of fire
    gr-910  Pandora
    gr-911  The Ages of Man
    gr-912  Deucalion's flood
    gr-913  The Gigantomachy
    gr-914  Typhon
    gr-915  The Muses
    gr-916  The Moirai
    gr-917  The Erinyes
    gr-918  Nymphs
    gr-919  Satyrs and centaurs
    gr-920  The Greek underworld

### Heroes and the epic cycle — `gr-heroes`

    gr-921  The Greek hero
    gr-922  Heracles
    gr-923  The Labours of Heracles
    gr-924  The Nemean Lion
    gr-925  The Lernaean Hydra
    gr-926  Perseus
    gr-927  Medusa
    gr-928  Theseus
    gr-929  The Minotaur
    gr-930  Ariadne
    gr-931  Daedalus and Icarus
    gr-932  Jason
    gr-933  The Argonauts
    gr-934  The Golden Fleece
    gr-935  Medea in myth
    gr-936  Bellerophon
    gr-937  Pegasus
    gr-938  Oedipus
    gr-939  The Sphinx
    gr-940  The Seven Against Thebes
    gr-941  The Epigoni
    gr-942  The Judgement of Paris
    gr-943  Helen
    gr-944  The Trojan War in myth
    gr-945  Agamemnon
    gr-946  Achilles
    gr-947  The wrath of Achilles
    gr-948  Patroclus
    gr-949  Hector
    gr-950  Ajax the Great
    gr-951  Odysseus
    gr-952  The Trojan Horse
    gr-953  The Epic Cycle
    gr-954  The Nostoi
    gr-955  The return of Agamemnon
    gr-956  Orestes
    gr-957  The wanderings of Odysseus
    gr-958  Polyphemus
    gr-959  Circe
    gr-960  The Sirens
    gr-961  Scylla and Charybdis
    gr-962  Calypso
    gr-963  Penelope
    gr-964  Telemachus
    gr-965  Aeneas in Greek myth

## Known omissions of this plan, and why they stay omitted (Sep 2026 audit)

Two gaps the audit found were **filled by amending unwritten slots**, which costs nothing: `gr-983`
was the oracle of Trophonius and is now the Delphic amphictyony and the First Sacred War, which is
how Delphi was actually run and fought over; `gr-985` was hepatoscopy, already covered by `gr-984`
Divination, and is now the crown games — the Pythian, Isthmian and Nemean, without which `gr-228`
Panhellenic sanctuary and `gr-229` Olympic Games describe a circuit with three quarters missing.

The rest fall inside decks that are **full and already written**, so adding one would mean deleting
a shipped card and moving an id. A card id is a permanent address — it carries every reader's
schedule, every shared link and every row of the cloud content overlay — so these stay out, and are
recorded here rather than quietly forgotten:

| topic | deck it belongs to | why it matters |
|---|---|---|
| Chania / Kydonia | `gr-crete` (full, 55) | the third Minoan centre, with both a Linear A and a Linear B archive, while Mochlos, Pseira and Petras each have a card |
| Anemospilia | `gr-crete` (full) | the site the whole argument about Minoan human sacrifice rests on |
| chamber tomb | `gr-mycenae` (full, 55) | the commonest Mycenaean grave form, where the shaft grave and the tholos each have a card |
| Orchomenos and the Treasury of Minyas | `gr-mycenae` (full) | the Boeotian counterpart to Mycenae's tholoi |
| Daedalic style | `gr-archaic-culture` (full, 60) | the phase of sculpture that precedes the kouros |
| archaic Thessaly | `gr-polis` (full, 60) | a major region the collection never reaches |
| archaic Megara | `gr-polis` (full) | present only through its colony, `gr-209` Megara Hyblaea |

**Where one of these can be folded into a neighbouring card's prose, do that instead of adding a
card — and the fold is only worth making where a source ALREADY ON THAT CARD carries it.** Two were
made in the Sep 2026 audit: `gr-332` kouros now names Daedalus and the ancient tradition that he
first opened his statues' eyes and freed their arms from their sides, on the Gardner handbook the
card already cites; and `gr-051` Mycenaean Knossos now puts Chania among the Warrior Grave
cemeteries, on the Rutter lesson it already cites.

**The chamber tomb was NOT folded, and the reason is worth keeping.** The obvious hosts are `gr-063`
and `gr-064`, and none of the works either card cites describes the form at all: Rutter's Lesson 19
carries chamber tombs only in its bibliography, the Greek ministry's Mycenae page never uses the
word, and Schuchhardt's Schliemann volume does not either. The standard work is Wace's *Chamber
Tombs at Mycenae* (1932), which is not openable from this sandbox. **A fold that needs a citation
the card has not got is a new card's worth of research wearing a clause's clothes** — leave it here
until the source is reachable. Orchomenos, Anemospilia, archaic Thessaly and archaic Megara have no
neighbouring card whose prose they belong in at all, and stay omitted outright.

### Cult, oracles and festivals — `gr-cult`

    gr-966  Greek religion
    gr-967  Civic cult
    gr-968  What a Greek temple was for
    gr-969  The cult statue
    gr-970  The Greek altar
    gr-971  Animal sacrifice
    gr-972  Hecatomb
    gr-973  Libation
    gr-974  Greek priesthood
    gr-975  Temenos
    gr-976  Votive offering
    gr-977  Oracles
    gr-978  The Delphic oracle
    gr-979  The Pythia
    gr-980  The Delphic maxims
    gr-981  The omphalos
    gr-982  The oracle at Dodona
    gr-983  The Delphic amphictyony and the First Sacred War
    gr-984  Divination
    gr-985  The crown games: Pythian, Isthmian and Nemean
    gr-986  The Panathenaia
    gr-987  The Greek festival calendar
    gr-988  The Thesmophoria
    gr-989  The Anthesteria
    gr-990  The Eleusinian Mysteries
    gr-991  Demeter at Eleusis
    gr-992  Mystery cult
    gr-993  Orphism
    gr-994  Dionysiac mysteries
    gr-995  Asclepius
    gr-996  Epidaurus
    gr-997  Incubation
    gr-998  Hero cult
    gr-999  Greek funerary practice
    gr-1000 Curse tablets
