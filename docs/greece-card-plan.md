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

**AND THE SAME TRAP CAUGHT CALLIMACHUS, WHERE THE ANSWER WAS THE OTHER WAY ROUND** (Sep 2026,
writing `gr-807`). The corpus holds two men of that name: the poet, and the Athenian polemarch of
`gr-405`, whose term is already keyed `Callimachus_(polemarch)`. Measured over the shipped
abstracts before this batch, the bare surface *Callimachus* occurred nine times and **five of them
were the polemarch** (`wh-320`, `gr-403`, `gr-404`, `gr-405`, `gr-515`) against four the poet. So
the poet is keyed **`Callimachus_(poet)`** even though the bare `Callimachus` IS his Wikipedia slug:
a parenthetical key claims no bare name (`bareTaken` in `buildGlossIndex`), so neither man claims
it, nothing already shipped was repointed, and the poet is reached through the alias *Callimachus of
Cyrene*. It is `Life_(biology)`'s decision in a second subject, and it is deliberately NOT
`Cell_(biology)`'s: there the dominant sense was worth buying and the wrong links were a handful of
common nouns, where here a wrong link sends a reader reading about Marathon to a Cyrenean poet.
**Re-measure before claiming the bare name** — the Alexandria deck will make the poet dominant, and
the trade then becomes five hand-written `data-k` links against one alias.

**`Pharos` IS NOT CLAIMED EITHER, AND FOR A CLEANER REASON.** `gr-804`'s term is keyed
`Lighthouse_of_Alexandria` with the aliases *Pharos of Alexandria* and *Pharos lighthouse*. Of the
five shipped abstracts carrying the bare word, **three are Pharos in Illyria** — Demetrius of
Pharos, in `rm-237`, `rm-238` and `rm-239` — which is the island of Hvar and not a lighthouse. The
card's own answer term is therefore *Pharos of Alexandria* rather than *Pharos*, so the answer and
the alias are the same string.

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
    gr-584  The restoration of 403   (carded on the Battle of Munychia, which brought the Thirty down)
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
    gr-598  Ajax   (glossary key `Ajax_(play)`, so it cannot claim the hero's name, carded at gr-950)
    gr-599  Philoctetes
    gr-600  Euripides
    gr-601  Medea   (the PLAY; glossary key `Medea_(play)`, leaving the bare name for gr-935)
    gr-602  Bacchae
    gr-603  Trojan Women
    gr-604  Hippolytus
    gr-605  Satyr play
    gr-606  Old Comedy
    gr-607  Aristophanes
    gr-608  Clouds   (glossary key `Clouds_(play)`, or the term would auto-link the ordinary word)
    gr-609  Lysistrata
    gr-610  Frogs   (glossary key `Frogs_(play)`, for the reason gr-608 carries one)
    gr-611  Birds   (glossary key `Birds_(play)`, for the reason gr-608 carries one)
    gr-612  The Theatre of Dionysus
    gr-613  Greek theatre architecture   (carded on the `theatron`, the auditorium the word theatre descends from)
    gr-614  Skene and orchestra   (carded on the `skene`; the orchestra is described on it and on gr-613)
    gr-615  The tragic mask
    gr-616  Choregos
    gr-617  Herodotus' Histories   (the WORK is carded at gr-439; this cards `historiē`, the word Herodotus
                                    uses for what he is doing, from which history descends)
    gr-618  Thucydides' method   (carded on `ktēma es aei`, his own name for the book at History 1.22.4)
    gr-619  Xenophon
    gr-620  Hellenica
    gr-621  Anabasis
    gr-622  The sophists   (carded on the singular, `Sophist`, with `sophists` as an alias)
    gr-623  Protagoras
    gr-624  Gorgias
    gr-625  Prodicus
    gr-626  Antiphon
    gr-627  Socrates
    gr-628  The Socratic method   (carded on the `elenchus`, the Greek name for the cross-examination;
                                   `Socratic method` is an alias of that term)
    gr-629  The trial of Socrates
    gr-630  Plato's Apology   (glossary key `Apology_(Plato)`, so it cannot claim the ordinary word)
    gr-631  Xenophon's Memorabilia
    gr-632  Hippocrates
    gr-633  The Hippocratic Corpus
    gr-634  The Hippocratic Oath
    gr-635  Humoral theory
    gr-636  Fifth-century Greek mathematics   (carded on `incommensurability`, the century's defining
                                               result; gr-637 carries the rest of the mathematics)
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
    gr-651  The Canon of Polykleitos  — carded on `symmetria`, the Canon's own principle: the treatise and the statue are already at gr-649 and gr-650
    gr-652  Contrapposto
    gr-653  Red-figure masters  — carded on `Euthymides`, since the technique is at gr-330 and Euphronios has gr-654
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
    gr-664  Agesilaus in Asia Minor  — carded on the `battle of Sardis`, the campaign's decisive action; the man himself is at gr-663
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
    gr-675  Battle of Mantinea, 362 BCE  — carded on the `second battle of Mantinea`, since `Battle_of_Mantinea` (418 BCE) is already gr-548 and a glossary term
    gr-676  The Social War
    gr-677  Plato
    gr-678  The Academy
    gr-679  Plato's Republic
    gr-680  The theory of Forms
    gr-681  Plato's Symposium  — carded on the `ladder of love`, Diotima's ascent: `Symposium` the drinking party is already gr-363 and a glossary term
    gr-682  Aristotle
    gr-683  The Lyceum
    gr-684  Aristotle's Politics  — the glossary key is `Politics_(Aristotle)`, since a bare `Politics` would auto-link an ordinary English word
    gr-685  Nicomachean Ethics
    gr-686  Aristotle's biology  — carded on the `History of Animals`, the longest of the zoological works, rather than on the field in the abstract
    gr-687  Diogenes of Sinope
    gr-688  Cynicism
    gr-689  Isocrates
    gr-690  Attic oratory  — carded on the `Attic orators`, the canon of ten, which is the thing the sources actually define
    gr-691  Lysias
    gr-692  Demosthenes the orator  — glossary key `Demosthenes_(orator)`, since `Demosthenes_(general)` is gr-559's term; neither parenthetical key claims the bare surface, so nothing auto-links to the wrong man
    gr-693  The Philippics
    gr-694  Aeschines
    gr-695  Philip II of Macedon
    gr-696  The Macedonian phalanx  — answer term `Macedonian phalanx`, since `phalanx` is already gr-181 and a glossary term
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
    gr-708  Pezhetairoi  — retitled from "Hetairoi and pezhetairoi" when gr-707 was written: the
             hetairoi ARE the Companion cavalry, so the two lines were one card twice; the foot
             companions are the half of the pair that had no card of its own
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
    gr-723  The surrender of Babylon  — retitled from "The fall of Babylon" when the card was
             written: the fall of Babylon is Cyrus in 539 BCE, and Arrian's Babylonians come out
             in a mass with their priests and offer the city, the citadel and the money
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
    gr-736  Bactria and Sogdiana  — the answer term is Sogdiana, chosen when the card was written:
             Bactria is where Bessus was run down (gr-728) and Sogdiana is where the two years went,
             so the campaign card is named for the country that cost the time
    gr-737  Roxana
    gr-738  The invasion of India  — answered by "Indian campaign", the whole 327–325 BCE march,
             so the card can be about the limit of the army's reach rather than about one siege
    gr-739  Battle of the Hydaspes
    gr-740  Porus
    gr-741  The mutiny at the Hyphasis
    gr-742  The Gedrosian march
    gr-743  Nearchus' voyage
    gr-744  The Susa weddings
    gr-745  The mutiny at Opis
    gr-746  The death of Hephaestion
    gr-747  The death of Alexander
    gr-748  Alexander's city foundations  — answered by "Alexandria Eschate", chosen when the card
             was written: "Alexandrias" is the collective term but makes an awkward cloze, and the
             furthest of them carries the whole foundation policy in its own story
    gr-749  The Alexander historians
    gr-750  Alexander's legacy

### Successor kingdoms — `gr-successors`

    gr-751  The Diadochi
    gr-752  The Partition of Babylon
    gr-753  Perdiccas
    gr-754  Antipater
    gr-755  The Lamian War
    gr-756  Battle of Crannon
    gr-757  The death of Demosthenes  — answered by "Calauria", the island whose sanctuary of
             Poseidon he died in: "Demosthenes" is already the answer of gr-559 and gr-692, so the
             card takes the place instead, which also fills a gap in the collection's amphictyonies
    gr-758  Eumenes of Cardia
    gr-759  The Partition of Triparadisus  — answered by "Triparadisus" alone, so that it does not
             begin with the same two words as gr-752
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
    gr-770  Antigonid Macedonia  — the paired glossary entry is keyed `Antigonid_dynasty`, the
             Wikipedia slug, with "Antigonid Macedonia" as an alias, so the term covers the house
             rather than only its years in the homeland
    gr-771  Lysimachus
    gr-772  Battle of Corupedium
    gr-773  Hellenistic kingship
    gr-774  Ruler cult
    gr-775  Hellenistic queens  — answered by "basilissa", the title itself, chosen when the card
             was written: "Hellenistic queens" is a description rather than a term, and the word a
             reader will meet again in an inscription is the one the inscriptions use
    gr-776  Arsinoe II
    gr-777  Berenice II
    gr-778  Ptolemaic administration  — answered by "dioiketes", chosen when the card was written:
             the kingdom itself is already carded at gr-767, so the line wants the office that
             actually ran the country rather than a second card on Ptolemaic Egypt
    gr-779  Seleucid colonisation
    gr-780  Antioch
    gr-781  Seleucia on the Tigris
    gr-782  Ai-Khanoum
    gr-783  The Greco-Bactrian Kingdom
    gr-784  The Indo-Greek Kingdom  — its glossary term `Indo-Greek_Kingdom` ALREADY EXISTED when the
             card was written, cited and illustrated, so the pairing rule was satisfied without a new
             entry: check before running add-glossary.js, which overwrites in silence
    gr-785  Menander I
    gr-786  The Milindapanha
    gr-787  The Celtic invasion of Greece  — answered by "Gallic invasion of Greece", the name the
             sources and the modern literature use; "Brennus" was considered and refused, the glossary
             already holding a Brennus, the Gaul who sacked Rome
    gr-788  The Galatians
    gr-789  Attalid Pergamon  — answered by "Attalid dynasty", chosen when the card was written: the
             line names a city and a house together, and the house is the thing a reader meets again,
             while the altar on that acropolis is the next card
    gr-790  The Great Altar of Pergamon
    gr-791  The Library of Pergamon  — its glossary term is keyed `Library_of_Pergamon`, Folio's own
             spelling and a real Wikipedia address, although the canonical article is at "Library of
             Pergamum"; the Pergamum form is carried as an alias
    gr-792  Antiochus III  — its glossary term `Antiochus_III_the_Great` ALREADY EXISTED when the card
             was written, cited and at the bar, so the pairing rule was satisfied without a new entry
    gr-793  The Syrian Wars
    gr-794  Battle of Raphia
    gr-795  The Aetolian League
    gr-796  The Achaean League  — its glossary term `Achaean_League` ALREADY EXISTED, with four sources,
             so no new entry was written: check before running add-glossary.js, which overwrites in silence
    gr-797  Aratus of Sicyon
    gr-798  Cleomenes III
    gr-799  The Spartan revolution  — answered by "Agis IV", chosen when the card was written: the line
             names a programme with no term of its own, and Agis is the king who framed it and died for
             it, which leaves gr-798 the reign and the war that carried it through by force
    gr-800  Hellenistic siege warfare  — answered by "torsion catapult", chosen when the card was
             written: "poliorcetics" redirects to the Wikipedia article "Siege", whose bare name is an
             ordinary English word no glossary term should claim, and the torsion spring is the advance
             the whole art rests on

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
    gr-814  Pinakes  — retitled from "Alexandrian scholarship" when the card was written:
             Zenodotus correcting Homer is already carded, and Aristarchus is the next line,
             so the general subject was spread over three cards with no term of its own;
             Callimachus's catalogue is the word a reader will meet again, and Athenaeus
             quotes two of its entries in full
    gr-815  Aristarchus of Samothrace
    gr-816  The Septuagint
    gr-817  Euclid
    gr-818  Euclid's Elements
    gr-819  Archimedes
    gr-820  Archimedes' principle
    gr-821  Claw of Archimedes  — retitled from "Archimedes at the siege of Syracuse" when the card
             was written: the siege itself is already carded in Ancient Rome as rm-222, with the
             engines in it, so the line had no term of its own left to teach; the iron hand that
             Polybius and Plutarch both describe is the thing a reader will meet again
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
    gr-834  Alexandrian anatomy  — answered by "human dissection" when the card was written:
             the two anatomists are already gr-832 and gr-833, so the line's own term is the
             PRACTICE they were licensed to carry out, which is what a reader meets again and
             what Celsus argues about at length
    gr-835  The Antikythera mechanism
    gr-836  Hellenistic geography  — answered by "oikoumene" when the card was written:
             Eratosthenes and the measurement of the earth are already gr-824 and gr-825, and the
             thing the period's geography actually bequeathed is the inhabited world itself, as a
             shape with stated dimensions and a grid across it
    gr-837  Pytheas of Massalia
    gr-838  Stoicism
    gr-839  Zeno of Citium
    gr-840  Chrysippus
    gr-841  Epicureanism
    gr-842  Epicurus
    gr-843  The Garden  — answered by "Garden of Epicurus" when the card was written: an
             answer term never carries an article, and a bare "Garden" is an ordinary English
             word that could not be a glossary key
    gr-844  Pyrrho and scepticism  — answered by "Pyrrhonism" when the card was written: the
             line names a man and a doctrine and one card can teach one term, and the tradition
             is the name a reader meets again in Sextus Empiricus and in modern philosophy;
             "Pyrrho" rides as an alias of it
    gr-845  Hellenistic sculpture

### Greece under Rome — `gr-under-rome`

    gr-846  Pyrrhus of Epirus  — written as a DELIBERATE PAIR with rm-164, which carries the
             same answer term: a line named after a man cannot be answered by anything else, so
             the glossary term is REUSED rather than rewritten and the two cards are written from
             opposite sides — Rome's on the Italian campaign, this one on Epirus, the Molossian
             kingship, the two Macedonian reigns and the death at Argos
    gr-847  The Pyrrhic War
    gr-848  Rome and the Greek East  — answered by "symploke" when the card was written:
             "Rome and the Hellenistic world" is already rm-236's answer term, and the thing this
             line is actually about has a name of its own — Polybius' word for the interweaving
             of Greek, Italian and African affairs, dated by him to Naupactus in 217 BCE
    gr-849  The Illyrian Wars  — answered by "Teuta" when the card was written: the wars are
             already rm-237's answer term, and the Greek side of them is the Ardiaean queen whose
             fleets took Phoenice and whose murder of a Roman envoy brought the fleet across
    gr-850  The First Macedonian War  — answered by "Peace of Phoenice" when the card was
             written: the war is already rm-238's answer term, and what it left behind is its
             settlement, negotiated in the Epirote city the Illyrians had sacked a generation
             earlier and resolving nothing between the two powers
    gr-851  Philip V of Macedon  — written as a DELIBERATE PAIR with rm-239, which carries the
             same answer term: a line named after a king cannot be answered by anything else, so
             the glossary term is REUSED and the two cards are written from opposite sides — Rome's
             on Polybius' character sketch, this one on the reign as Greek politics, the Social War,
             Thermum, Messene and the rebuilding of Macedon after 197 BCE
    gr-852  The Second Macedonian War  — answered by "siege of Abydos" when the card was
             written: the war is already rm-240's answer term, and its Greek ground is the city on
             the Hellespont narrows where Philip's last siege and Rome's formal warning met.
             The glossary key is `Siege_of_Abydos` and it claims NO bare "Abydos" alias — three
             World History cards use the name for the EGYPTIAN Abydos, which is a different place
    gr-853  Battle of Cynoscephalae  — the pair `docs/rome-card-plan.md` names by name, so the
             answer term and the glossary entry are shared with rm-241: Rome's card is the day
             itself and this one is Polybius' explanation of why the phalanx lost, written for
             Greeks who thought the defeat incredible
    gr-854  Flamininus  — answered by "Nabis" when the card was written: Flamininus is already
             rm-242's answer term, and the Greek side of his command is the war of 195 BCE against
             the last ruler to make Sparta an independent power, whose land redistribution and
             killing by the Aetolians the collection had nowhere else to put
    gr-855  The declaration at the Isthmus  — answered by "eleutheria" when the card was
             written: "freedom of the Greeks" is already rm-243's answer term, and what this line
             is about is the Greek political formula the declaration used — free, ungarrisoned,
             untaxed, living under its own laws — proclaimed by Antigonus in 315 BCE and by Rome
             at the Isthmus in 196. Flagged `undatable`: a status has no date of its own
    gr-856  The Roman–Seleucid War  — answered by "siege of Ambracia" when the card was
             written: the war is rm-245's answer term and its Greek battle is rm-246's, so what is
             left for this collection is how the war ended IN GREECE — the siege of 189 BCE that
             broke the Aetolian League and bound it to Rome's enemies and friends for good
    gr-857  Battle of Magnesia  — answered by "Eumenes II" when the card was written: the battle
             is already rm-247's answer term, and the Greek who won its decisive action and took
             most of Seleucid Asia Minor at Apamea was absent from the collection, the Attalid deck
             having carded the dynasty, the altar and the library but not the king
    gr-858  The Treaty of Apamea  — written as a DELIBERATE PAIR with rm-248, which carries the
             same answer term and the same glossary entry: Rome's card is the terms imposed on
             Antiochus and this one is what the settlement did to the Greek cities of Asia, freed
             or made tributary to Pergamon according to the side each had taken
    gr-859  The Third Macedonian War  — answered by "Callicrates of Leontium" when the card was
             written: the war is already rm-249's answer term, and the Greek story of those years
             is the Achaean embassy of 180 BCE that taught the senate to govern Greece through its
             own partisans. The key is qualified — `Ictinus_and_Callicrates` holds the architect,
             so `Callicrates_of_Leontium` claims no bare "Callicrates" surface
    gr-860  Perseus of Macedon  — written as a DELIBERATE PAIR with rm-250, on gr-851's reasoning:
             a king's line has no other answer, so the glossary term is REUSED and this card is the
             last Antigonid as Greek opinion saw him — the amnesty posted at Delos and Delphi, the
             states that wished him well, the nerve that failed at Pydna and the flight to Samothrace
    gr-861  Battle of Pydna  — answered by "monument of Aemilius Paullus" when the card was
             written: the battle is already rm-251's answer term, and what is left for this
             collection is what the victor did IN GREECE — the pillar at Delphi that Perseus had
             cut for his own statue and the Roman took over, and the tour of the sanctuaries
    gr-862  The province of Macedonia  — answered by "Via Egnatia" when the card was written: the
             province is rm-257's answer term and the settlement of 167 BCE is rm-253's, so what is
             left is the thing Roman Macedonia built and the Greek world used — the measured road
             from the Adriatic to the Hebrus, with its milestones and its stages
    gr-863  The Achaean War  — answered by "Diaeus" when the card was written: the war is already
             rm-255's answer term, and the Greek side of it is the general who freed slaves to fill
             a beaten army, sent a quarter of it away to Megara, and died at Megalopolis by his own
             hand rather than face Mummius
    gr-864  The sack of Corinth  — written as a DELIBERATE PAIR with rm-256, which carries the same
             answer term and the same glossary entry: Rome's card is the storming and the settlement
             that followed it, and this one is what the Greeks lost — the art diced on by soldiers,
             the walls taken down, the confederacies dissolved and a site left empty until Caesar
    gr-865  Polybius  — no Rome card carries this term, so it is written as itself: the Achaean
             detained in Italy after Pydna who set out to explain how one city took the world in
             about fifty years, and whose relief at Megalopolis says he stayed Rome's wrath
    gr-866  Polybius on the constitution  — answered by "mixed constitution" when the card was
             written: a line naming a person and a subject wants the TERM the reader will meet
             again, and the glossary key is the article title `Mixed_government` with "mixed
             constitution" as its alias. Plato and Aristotle carry the idea's earlier history
    gr-867  Delos as a free port  — answered by "Delos" and paired with the glossary term that
             already existed: the card is the island as the Aegean's market after 167 BCE, the
             grant to Athens, the Delians who were made to leave, and the boom that followed Corinth
    gr-868  The bequest of Attalus III  — answered by "Attalus III" when the card was written: the
             bequest is already rm-259's answer term, and what is left is the king himself, whom
             Strabo dismisses in a line and Justin makes a poisoner and a metalworker. The key is
             `Attalus_III` and claims NO bare "Attalus" surface — the corpus's nineteen mentions
             include Attalus I, Attalus II and a Pergamene general
    gr-869  The Mithridatic Wars  — answered by "Archelaus" when the card was written: the wars are
             rm-310's and rm-333's answer terms, and the Greek theatre of them belongs to the Pontic
             general who took the Aegean, held Athens and then asked Sulla for terms at Delium. The
             key is qualified, `Archelaus_(general)`, and carries the bare alias, the corpus's one
             other mention of the name being this same man
    gr-870  Sulla at Athens  — answered by "siege of Athens" when the card was written: the Roman
             is rm-309's answer term, so this card is the siege — the famine, the abuse from the
             walls, the unguarded stretch at the Heptachalcum and the blood in the Cerameicus. The
             key is dated, `Siege_of_Athens_(87-86_BCE)`, and like `Siege_of_Athens_(404_BCE)` it
             claims no bare surface of its own
    gr-871  Greece in the Roman civil wars  — answered by "Thessalonica" when the card was written: the
             line names a condition rather than a term, and the Greek city that WAS the war is Cassander's
             foundation on the Thermaic Gulf, where Pompey and the consuls ordered the senate to assemble
             and about two hundred of them sat for one winter. The key is `Thessaloniki`, the article
             title, with "Thessalonica" and "Thessalonike" as aliases
    gr-872  Battle of Pharsalus  — answered by "Thessaly" when the card was written: the battle is
             rm-362's answer term AND `Battle_of_Pharsalus` already claims the bare "Pharsalus" surface as
             an alias, so a card answered by the town's name would auto-link to the battle. What is left
             is the plain itself — the corn near ripe that fed both armies, Gomphi stormed and Metropolis
             spared — and `Thessaly` was ALREADY a cited glossary term, so the pairing rule needed nothing
             new
    gr-873  Battle of Philippi  — answered by "Philippi" when the card was written: the battle is
             rm-377's answer term, and the plan had no card anywhere for the city, a Thasian colony of 360
             BCE that Philip II took for its gold. The key is `Philippi` and claims the bare surface, the
             corpus's eleven mentions all being this one place
    gr-874  Battle of Actium  — written as a DELIBERATE PAIR with rm-387, which carries the same answer
             term and the same glossary entry: Rome's card is the end of the civil wars and this one is the
             end of the Hellenistic age — the last Hellenistic fleet, the Greek cities left stripped of
             money, slaves and beasts of burden, and the victory kept as a Greek games at Nicopolis
    gr-875  The end of Ptolemaic Egypt  — answered by "Caesarion" when the card was written:
             `Ptolemaic_Egypt` is gr-767's answer term and the annexation is rm-388's, so what is left is
             the boy the dynasty ended with, whom Antony proclaimed King of Kings and Octavian killed
             because there were too many Caesars
    gr-876  Cleopatra VII  — written as a DELIBERATE PAIR with rm-384, sharing the answer term and the
             glossary entry: Rome's card is the annexation of Egypt and this one is the last of the
             Ptolemies — the queen who spoke the languages her Macedonian family had not troubled to
             learn, running a grain state through a decade of failed Nile floods
    gr-877  The province of Achaea  — the only one of these ten to keep its own line as its answer term.
             Rome plans `rm-775 Achaea` and has not written it, so the collision is the later card's to
             resolve; the key is qualified, `Achaea_(Roman_province)`, and therefore claims no bare
             "Achaea" surface, which the region and the League also use
    gr-878  Hellenisation at Rome  — answered by "Carneades" when the card was written: `Hellenisation`
             is gr-750's answer term and philhellenism is rm-272's, so what is left is the Greek who
             carried it there — the head of the Academy who argued both sides of justice on successive
             days in 155 BCE and whom Cato had voted out of the city
    gr-879  The Second Sophistic  — answered by its own term, and the one card of these ten whose
             question names an ancient author. Philostratus coined the phrase, so `card-focus.js` gained
             `Philostratus` in its ANCIENT set: the diff over the whole corpus took rule 1 from one card
             to none and corrected gr-402, which cites the Life of Apollonius as a witness
    gr-880  The afterlife of Greek learning  — answered by "Manuel Chrysoloras" when the card was
             written: the line is a process and the term is the man it turned on, the Byzantine envoy who
             taught Greek at Florence from 1397 and whose Erotemata was the only Greek grammar in general
             use in Italy until 1476

## Myth and Religion

### Olympians and cosmogony — `gr-olympians`

    gr-881  Greek mythology
    gr-882  Greek cosmogony  — answered by the general word *cosmogony*, which is what the line names:
             the card is about the Greek accounts and the glossary term is deck-agnostic, as the house
             rule requires of a general concept. Its second block is the Near Eastern half of the
             subject, the succession pattern being attested in Hurro-Hittite and Babylonian poetry
             before it appears in Greek. The picture is NOT the Derveni papyrus, which `gr-366` and the
             `Presocratic_philosophy` term already carry
    gr-883  Chaos  — keyed `Chaos_(cosmogony)`, the article title, which claims no bare surface. It is
             given the bare alias **Chaos** with `caseSensitive: true`, so the seven ordinary lower-case
             uses in the corpus are not claimed. Measured before the batch: six capitalised occurrences,
             five of them this god (`gr-141`, `gr-366`, `gr-611`) and one of them NOT — `cnh-027`, where
             Chaos is one of four monsters Shun banished to the four distant regions. That one wrong
             link is the accepted cost of the alias, on `Cell_(biology)`'s reasoning; it is recorded
             here rather than papered over, and if it is ever thought too expensive the answer is to
             narrow the alias, never to reword the China card
    gr-884  Gaia
    gr-885  Uranus  — keyed `Uranus_(mythology)`, the bare name being the planet, with `Ouranos` and
             `Uranus` as aliases: the corpus has no astronomy collection and the bare word occurred
             nowhere in it before this card
    gr-886  The Titans
    gr-887  Cronus
    gr-888  The Titanomachy
    gr-889  Rhea  — keyed `Rhea_(mythology)`, the bare name being a bird and a moon of Saturn, with
             `Rhea` as an alias. That is safe because `Rhea_Silvia` already claims the longer surface
             and `buildGlossIndex` sorts surfaces longest-first, so `rm-054` still resolves to the Vestal
    gr-890  Zeus  — **the one card of the ten that needed no new glossary term**: `Zeus` has been a
             cited term since the citation pass and the pairing rule is satisfied by a term that already
             exists, so `add-glossary.js` was deliberately not run on it. Its description is about cult
             at Olympia and on the Peloponnesian mountaintops where the card is about the myth, which is
             the division of labour the two are meant to have. None of the other nine lines needed a
             retitle either, allowing for the article: "The Titans" is answered by *Titans* and "The
             Titanomachy" by *Titanomachy*
    gr-891  Hera  — **five of these ten needed no new glossary term**: `Hera`, `Poseidon`, `Athena`,
             `Apollo` and `Artemis` have been cited terms since the citation pass, so the pairing rule
             was already satisfied and `add-glossary.js` was deliberately not run on any of them. Check
             the keys before reaching for that helper on an Olympian; it overwrites in silence
    gr-892  Poseidon
    gr-893  Demeter
    gr-894  Hestia  — **carries no locator, deliberately**. A locator names somewhere a reader could
             stand, and the hearth is in every Greek house rather than in one place; the public hearth
             of a particular city would be a claim the card does not make
    gr-895  Hades  — **carries no locator either**, for the same reason one step further: the kingdom
             he drew by lot is not a place with a coordinate, and the one site that advertises itself
             as an entrance to it is disputed
    gr-896  Athena
    gr-897  Apollo
    gr-898  Artemis
    gr-899  Ares  — answered by *Ares*, and its apparatus is three Homeric passages of six sources,
             which `check-cards.js` reports under the ancient-witness carve-out rather than as an
             over-cited author: the god's whole literary character is Homer's, so the passages are the
             evidence and not one scholar's repeated opinion
    gr-900  Aphrodite  — the one card of the ten with a live disagreement to state: Pironti reads her
             province as *mixis* and so as covering war, where Budin holds she was a war goddess at
             Sparta and nowhere else before the Roman period, and the card gives both
    gr-901  Hephaestus
    gr-902  Hermes
    gr-903  Dionysus
    gr-904  The Twelve Olympians  — the one card of the ten with NO locator, deliberately: the set is a
             concept, and an altar in the Athenian Agora would have drawn a second mark on the collection’s
             own anchor city. Nothing openable states which twelve, so the card gives the NUMBER as cult
             attests it — Thucydides’ altar, Plato’s twelve tribal feasts — and does not assert a membership
    gr-905  Mount Olympus  — the summit height and its distance from the sea come from an open GREEK
             GEOLOGICAL journal (Styllas and Kaskaoutis, *Bull. Geol. Soc. Greece* 52), which was the only
             openable source found for either figure: UNESCO’s biosphere pages serve a bot wall, Britannica
             is 403 and the ministry’s own site has no page for the mountain. Reach for an open science
             journal for a physical figure before reaching for a reference work
    gr-906  Persephone  — written WITHOUT the `Kore` alias, as the warning under “Glossary” above requires;
             the term carries no alias at all rather than a near-miss one
    gr-907  The abduction of Persephone  — RETITLED in the writing: answered by `Homeric Hymn to Demeter`,
             the poem the abduction is known from, because the line names an EVENT and gr-906 had already
             taken the goddess with the abduction in her own prose. The card is about the poem — its
             Eleusinian aetiology, its concentration on female experience, the Megaron B question
    gr-908  Prometheus
    gr-909  The theft of fire  — RETITLED in the writing: answered by `narthex`, the giant fennel stalk the
             fire is carried in, which Hesiod, Aeschylus and Pliny all name, because gr-908 had already
             carded the theft and its punishment. Keyed `Ferula_communis`, the real article slug, with
             `narthex` as an alias — the bare word occurs nowhere else in the corpus, so it is safe to claim
    gr-910  Pandora
    gr-911  The Ages of Man
    gr-912  Deucalion's flood  — RETITLED in the writing: answered by `Deucalion` rather than by the event,
             on the rule a line naming an event wants the thing the event is about; the card's own last two
             sentences state that the flood story is unknown to Hesiod and reaches Greece perhaps only in the
             sixth century BCE, which is the one thing about it worth a reader's memory
    gr-913  The Gigantomachy
    gr-914  Typhon
    gr-915  The Muses  — the count of nine is stated as CONTESTED, not as the fact: Pausanias' three
             (Melete, Mneme, Aoede) and the measured rarity of nine in Archaic and Classical evidence are
             both on the card, which is what the sources carry
    gr-916  The Moirai  — no locator: the Fates happen nowhere, and the two genealogies inside one poem of
             Hesiod are the card's subject
    gr-917  The Erinyes  — no locator either, and NOT because the card has no place: the Areopagus is
             `gr-899`'s dot and Delphi is `gr-897`'s, so a third card on the same two pixels would only
             crowd the collection's own map
    gr-918  Nymphs  — answered by `nymph`, the singular, as `gr-909` is by `narthex`; its dot is ITHACA
             rather than the Polis cave above Stavros, which has no article of its own to read a published
             coordinate off, and a hand-typed pair is the one error nothing downstream can see
    gr-919  Satyrs and centaurs  — a card has ONE answer term, so the line was resolved to `centaur`, which
             the corpus had nothing on; the satyr is on the card as the OTHER man-horse, contrasted rather
             than grouped with it, and the satyr play already has `gr-605` and its own glossary term
    gr-920  The Greek underworld  — keyed `Greek_underworld` and DELIBERATELY WITHOUT the bare alias
             `underworld`: measured over the corpus, the word appears on a Chinese and a Maya card
             (`cnh-031`, `cnh-032`, `wh-426`), so claiming it would auto-link two other continents' lands
             of the dead to the Greek one. No locator: the place is nowhere on any map Folio draws

### Heroes and the epic cycle — `gr-heroes`

    gr-921  The Greek hero  — answered by `hero`, keyed `Hero_(Greek_mythology)` and DELIBERATELY
             WITHOUT the bare surface `hero`: a parenthetical key claims no bare name, and measured over
             the corpus the word appears 19 times outside Greece, of which the Chinese culture heroes, a
             Korean mine, a novel's protagonist and two Second World War uses are the wrong sense. It is
             reached by the aliases `Greek hero` / `Greek heroes` instead. No locator: the class happens
             nowhere
    gr-922  Heracles  — the ONE card of this batch whose glossary term ALREADY EXISTED, written as a
             supporting term for an earlier card, so the pairing rule was satisfied and `add-glossary.js`
             was NOT run on it: that helper overwrites in silence, and the shipped entry is at the bar.
             No locator either: Thebes is `gr-069`'s, `gr-705`'s and `gr-903`'s dot and Tiryns is
             `gr-067`'s, so a fourth Theban dot would say nothing this collection's map does not
    gr-923  The Labours of Heracles  — the one card here that `check-cards.js` leaves a NOTE on,
             Apollodorus carrying 4 of its 8 sources, which is the documented ancient-witness carve-out:
             four separate books of the Library are four passages of one witness rather than four pages of
             one scholar. Its date line rests on the ONE dated fact the labours have — the lost poem of
             Peisander of Camirus, which the Loeb note to Pausanias 2.37.4 puts at about 645 BCE — since
             the temple at Olympia's own date is stated by nothing the card cites. No locator: a set of
             twelve tasks is not a place
    gr-924  The Nemean Lion  — answered by `Nemean lion`, the lower-case form both the translations and
             Wikipedia use. Its dot is NEMEA, which no other card had taken
    gr-925  The Lernaean Hydra  — its term CLAIMS the bare alias `hydra`, which is measured rather than
             assumed: the word appears on three cards (`rm-167`, and this batch's two) and every one of
             them means this creature, `Carbohydrate`'s alias being unreachable under the index's own
             word boundaries. Its dot is LERNA
    gr-926  Perseus  — keyed `Perseus_(mythology)` and NOT `Perseus`, which is the Wikipedia slug: the
             bare surface is claimed by nobody today, and of the 48 occurrences in the corpus the
             majority are the Macedonian king `Perseus_of_Macedon` already holds (`rm-176`, `rm-249`–
             `rm-251`, `gr-860`, `gr-861`). A parenthetical key claims no bare name, so the hero's entry
             is reachable by hand-written link and by its own title and mislinks nothing. Its dot is
             SERIPHOS, where the chest came ashore — Mycenae is `gr-058`'s, `gr-060`'s and `gr-061`'s and
             Argos is `gr-195`'s. `check-gloss-links.js` reports one link by eye on this card, "the
             Egyptian Thebaid" resolving to `Ancient_Egypt`, which is the right term for the word
    gr-927  Medusa  — no locator: Hesiod puts the Gorgons beyond Ocean in the frontier land towards
             Night, so there is nowhere on any map Folio draws to mark. Its term claims no `Gorgon`
             alias, the Gorgons being three and the word standing for all of them on seven other cards
    gr-928  Theseus  — its dot is TROEZEN rather than Athens: the anchor city is drawn on every map in
             the collection already, and Troezen is the origin one strand of the argument gives him,
             which the card states. Its date line's second row rests on Plutarch's "after the Median
             wars" rather than on a year he does not give
    gr-929  The Minotaur  — the plan's cross-listing line above would also file this in `gr-crete`; it
             is NOT applied, ONE DECK PER CARD having been the rule since Aug 2026. Its dot is Knossos,
             which `gr-008`, `gr-010` and `gr-051` also carry and which is still the honest place
    gr-930  Ariadne  — its dot is NAXOS, the island Apollodorus and Plutarch put her on, rather than
             Homer's Dia: the card gives both and the dot follows the version with a place a reader can
             find. No `Labyrinth` term was coined, the word standing for the Egyptian labyrinth on
             `wh-267` and for Potnia's title at Knossos on `gr-086`
    gr-931  Daedalus and Icarus  — the line names two people and a card is answered by ONE term, so the
             answer is Daedalus and Icarus is carried in the prose. Its dot is KNOSSOS, which `gr-008`,
             `gr-010`, `gr-051` and `gr-929` also carry and which is still the honest place: the
             labyrinth, the wooden cow and the Dance of Ariadne Pausanias saw are all there
    gr-932  Jason  — keyed **`Jason_(mythology)`**, which claims no bare name, and the measurement is
             why. Over the shipped corpus the bare surface *Jason* occurs eight times and **two are
             modern given names**: the archaeologist Jason Lewis on `wh-014` and the missionary Jason
             Lee on `geo-524`. Six right and two wrong is nearer the `Neville_Chamberlain` case
             CLAUDE.md records as refused than the `Cell_(biology)` case it records as accepted, so
             the parenthetical takes it. Dot: Iolcus
    gr-933  The Argonauts  — NO locator: the subject is a voyage and no one place is it, where
             `gr-932`'s Iolcus is where the crew mustered. Its picture is the Niobid Painter's krater
             and **the caption hedges the identification**, which is one reading of that vase rather
             than a settled one
    gr-934  The Golden Fleece  — dot at PHASIS, the river mouth Pindar has the Argonauts reach,
             rather than a `region` wash over Colchis, whose frontier nobody can draw. Strabo's own
             rationalisation is carded, gold being washed from Caucasian torrents in troughs lined
             with fleeces
    gr-935  Medea in myth  — **the bare name the `gr-601` line reserves for this card was MEASURED and
             REFUSED.** Of the nine corpus surfaces of *Medea*, four are the PLAY title (`gr-600`,
             `gr-840` twice, `gr-601`), which `Medea_(play)` already holds and which a bare key would
             repoint at the woman. So it is **`Medea_(mythology)`**, neither term claims the bare
             surface, and nothing already shipped moved. Dot: Corinth
    gr-936  Bellerophon  — dot at XANTHOS in Lycia, the stream the <i>Iliad</i> sends him to, since
             Corinth is `gr-935`'s
    gr-937  Pegasus  — NO locator, Peirene being in Corinth and that dot spent. The Corinthian
             coinage rests on **Head's <i>Historia Numorum</i> on archive.org**, `numismatics.org`
             being shut from this sandbox; an earlier draft said the horse was struck "for three
             centuries", which nothing openable states, and the card says what Head says instead
    gr-938  Oedipus  — the bare key IS safe here and was measured: all eight corpus surfaces are the
             man or "the house of Oedipus", and `Oedipus_Tyrannus` keeps its own longer surface, which
             `buildGlossIndex` sorts first. Dot: Thebes
    gr-939  The Sphinx  — keyed **`Sphinx_(Greek_mythology)`** with the alias *Theban Sphinx*: bare
             *Sphinx* is six Egyptian occurrences (`wh-209`, `wh-213`, `wh-228`) against five Greek, so
             neither sense may claim it. NO locator — Mount Phikion has no coordinate to fetch and
             Thebes is `gr-938`'s — and the picture is a GRAVE-STELE finial rather than the Theban
             scene, which the card argues is the unusual use of the figure
    gr-940  The Seven Against Thebes → **AMPHIARAUS** — retitled, because the plan line's own words are
             already `gr-594`'s answer term (Aeschylus' play). The card still teaches the expedition and
             is answered by the seer whose swallowing made him a god: the line names an EVENT and the
             term wanted is the thing the event left behind, which here is a cult with a sanctuary, an
             oracle Croesus tested and a healing rite that outlasted the war by a thousand years. Dot:
             Oropos
    gr-941  The Epigoni — written. No Commons picture shows the Epigoni's own war, so both the card
             and the term are illustrated from the FIRST expedition, with captions that say so: an
             Etruscan urn of the fatal duel of Eteocles and Polynices, and Polynices bribing Eriphyle,
             which is what sent Amphiaraus to Thebes and Alcmaeon back a generation later. Dot: Glisas,
             where Pausanias puts the Epigoni's victory
    gr-942  The Judgement of Paris — written. Key `Judgement_of_Paris` with `Judgment of Paris` as an
             alias, the American spelling being the one an auto-link would otherwise miss (the spelling
             transform is one-way from authored British and does not reach a glossary key). Picture: the
             Boccanera panels, among the earliest surviving pictures of the contest. Dot: Mount Ida
    gr-943  Helen — written. Key `Helen_of_Troy` and the bare alias `Helen` is SAFE: measured over the
             shipped corpus, every occurrence of the bare name outside this card's own collection is the
             Spartan queen. The picture is the EARLIER abduction, Theseus carrying her off from Sparta as
             a girl, which the three-sentence term also has to carry. `check-gloss-links` reports
             “Egyptian” → `Ancient_Egypt` here and the link is right — the card gives Herodotus' and
             Stesichorus' version, in which Helen sits out the war in Egypt. Dot: Therapne, her shrine
    gr-944  The Trojan War in myth — written as **Trojan War**. Picture: the Polyxena Sarcophagus, the
             earliest large-scale picture of the cycle found near Troy itself. Dot: Troy
    gr-945  Agamemnon — written. **The glossary term already existed at the bar and was NOT re-run**:
             `add-glossary.js` overwrites in silence, so the check is one command before the work. What
             it lacked was a PICTURE, which this batch gave it. Dot: Mycenae
    gr-946  Achilles — written. Same as `gr-945`: the term was already cited at the bar and only wanted
             a picture. No dot — a hero is not a place, and Phthia is already spent on the card's prose
    gr-947  The wrath of Achilles — written as **mēnis**, the word the *Iliad* opens on, keyed `Mēnis`
             with `mēnis` and `menis` as aliases so the unaccented spelling still links. Difficulty 4:
             the term is the one specialist word in the batch. Muellner's *The Anger of Achilles* is
             cited by its own CHS book URL, the CHS reader being JavaScript-rendered — the `NAGY`
             precedent already in the corpus
    gr-948  Patroclus — written. Picture: the Sosias cup, whose scene appears in no surviving poem,
             which is what the caption says rather than calling it an illustration of the *Iliad*
    gr-949  Hector — written. Bare key `Hector` is safe on the same measurement `Helen` passed. Two of
             its three phrasings were rewritten after `check-questions.js` refused a blank at the end of
             the sentence
    gr-950  Ajax the Great — written, and this is the card `gr-598`'s note above points forward to: the
             glossary key there is `Ajax_(play)`, which by `bareTaken` claims no bare surface, so
             `Ajax_the_Great` takes the alias `Ajax` and the two cannot collide. A first draft said he
             was “never helped by a god”, which nothing openable bears out; it was replaced by the
             *Iliad*'s own “bulwark of the Achaeans”. Dot: Salamis
    gr-951  Odysseus — written. The glossary already held `Odysseus`, cited and at the bar, so the
             pairing rule was satisfied and `add-glossary.js` was NOT run on it; the term was given a
             picture instead. Its locator cost a round: the Wikipedia article *Ithaca* carries no
             primary coordinate, so `add-locators.js` refused it, and a hand-typed pair written while
             drafting had to be removed rather than kept. `Ithaki`, which redirects to *Ithaca
             (island)*, resolves and yields the island's own coordinate — **when an article has no
             coordinate, try its redirects before typing one**
    gr-952  The Trojan Horse — written, answered by `Trojan Horse`. Homer's account of it is a SONG
             INSIDE the poem, sung by Demodocus at Odysseus' own request, which is the shape the card
             takes; the three courses the Trojans debate (cut it open, throw it from the rocks, leave
             it as an offering) are the *Odyssey*'s own. Dot: Troy
    gr-953  The Epic Cycle — written. Answered by `Epic Cycle`, whose bare surface was measured over
             the shipped corpus at three card abstracts, all three correct. Aristotle is cited for the
             contrast between Homer's unity and a poem that strings a period together, and the
             card states that whether the lost poems drew on Homer or on the same older tradition is
             still argued. No locator: a group of poems stands nowhere
    gr-954  The Nostoi — written, answered by `Nostoi`. **It is the batch's one card with no picture,
             recorded rather than skipped**: the subject is a poem that does not survive, and every
             free picture of what it narrated is already carried by a card on that episode — five
             searches (the returns, a bard singing, Diomedes, the wreck off Euboea, a Cycle papyrus)
             returned nothing whose subject is this poem. The `Nostoi` term has none for the same
             reason. Its own theme is carded from the *Odyssey*'s own performance of it, Phemius
             singing the returns until Penelope asks for something else
    gr-955  Clytemnestra — retitled from *The return of Agamemnon*, which is an event where the card
             wants a term, and the term is the one a reader meets again. Homer tells the murder TWICE
             and not alike — Nestor makes Aegisthus the mover and says she at first put the deed from
             her, Agamemnon's own ghost puts her hand on Cassandra — so both passages are cited rather
             than one harmonised account. Dot: Mycenae
    gr-956  Orestes — written. **The key is the bare `Orestes` and the cost is recorded here rather
             than hidden**: the surface matches nine shipped abstracts, of which three are a different
             man — `wh-375` Orestes the patrician, father of Romulus Augustulus, and `rm-255` and
             `gr-863` the Roman commissioner Lucius Aurelius Orestes. The `Neville_Chamberlain`
             refusal (six right, three wrong) says no; `Cell_(biology)`'s dominant-sense rule says
             yes, and on a Greek-myth site the myth is the dominant sense and `Orestes` is the
             Wikipedia slug. Taken deliberately, with those three cards named. Dot: Tegea, where
             Delphi told Sparta the bones lay
    gr-957  The wanderings of Odysseus — retitled to `Apologoi`, the scholarly name for the four
             books in which Odysseus narrates his own adventures. The term was VERIFIED LIVE before
             being adopted, appearing in BMCR 2026.08.28 (Grethlein) and 1996.04.27 (Cook/Ford)
             rather than being coined here. Difficulty 5. No locator: the section is a stretch of
             text, not a place
    gr-958  Polyphemus — written. The card rests on the Cyclops book's finding that the Greeks knew
             THREE kinds of Cyclops — this pastoral ogre, the smiths at the forge, and the builders
             credited with the Cyclopean walls — so the term is not a single creature. No locator:
             Homer does not say where the Cyclopes' land is, and a dot would assert what the poem
             declines to
    gr-959  Circe — written. The card says she is never actually called a magician and that “magic” is
             an anachronism applied to Homer, which is Franco's argument in the Mythologica volume and
             is cited to Edmunds' English review of it rather than asserted. The Italian TITLE is
             the only non-English thing in the apparatus, and it is one source, so `check-cards.js`
             rule 6 does not bind. No locator: Aeaea is not a place on any map
    gr-960  The Sirens — retitled to the singular `Siren`, on the `nymph` precedent at gr-918. Two
             findings shape it: what they sing is KNOWLEDGE, since they claim to know everything
             suffered at Troy and promise the listener goes away wiser, and Homer uses the DUAL of
             them, which is why the names, the parents, the instruments and even the number are all
             later. `Siren` auto-pluralises, so no alias was needed; its bare surface matches three
             abstracts, all of them siren protomai on orientalising cauldrons and all correct
    gr-961  Scylla and Charybdis — written, and answered by `Scylla` alone. Two monsters cannot be
             one answer term, and the Odyssey's own weight is on the one Circe tells Odysseus to
             steer TOWARDS; Charybdis is carried in the prose and as an alias on the glossary key,
             so the plan's own phrase still resolves. The card's third rule-shaping finding is
             Hopman's, read in review: the vase painters' pretty Scylla and Homer's horror are one
             figure because a mythical name is a composite of ideas — dog, sea, woman — rather than
             a body, which is how the card can show a 4th-century krater beside a Homeric question
             without contradicting itself
    gr-962  Calypso — written. The offer refused is the card: `check-cards.js` reports Homer at 4 of
             6 sources, which is the ancient-witness carve-out working as intended. Ogygia is on no
             map and gets no locator
    gr-963  Penelope — written. The bed test is the card's spine, and the review used is a HOSTILE
             one (Olson on Katz), cited for the single point the reviewer himself endorses, that the
             murder of Agamemnon stands in the poem as the homecoming this one might have been. Read
             a review before citing it, and cite it for what it says rather than for what it reviews
    gr-964  Telemachus — written. Its picture is the OTHER SIDE of the same Chiusi skyphos that
             illustrates gr-963, which is not a duplicate by `check-cards.js`'s file-name rule and is
             deliberate: the Penelope Painter's cup is the canonical image of both of them, and the
             obvious alternative was REJECTED — Meynier's *Telemachus, Urged by Mentor, Leaving the
             Island of Calypso* is Fénelon's *Télémaque*, not Homer's, and Telemachus never goes to
             Ogygia in the Odyssey at all. **A beautiful picture of the wrong story is still the
             wrong picture.** Locator at Pylos rather than Ithaca, which gr-951 and gr-963 already
             carry
    gr-965  Aeneas in Greek myth — written, and **the pairing rule was ALREADY SATISFIED**: `Aeneas`
             has been a cited glossary term since the Rome collection reached him, at the bar and
             with a picture. Running `add-glossary.js` blind would have overwritten it in silence.
             What was done instead is a deliberate REWRITE of the existing term, because its three
             sentences were wholly Roman and a Greek card's answer would have auto-linked to a
             definition that never mentions the Iliad: sentence 1 now carries Poseidon's prophecy
             with two Greek sources added beside the four Roman ones, and the cost is stated rather
             than hidden — the Alba Longa king list and Caesar's funeral speech came out to make
             room, the term being held to three sentences and 110 words

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

    gr-966  Greek religion — written, and the deck's opening card. Answered by `Greek religion`,
             keyed `Ancient_Greek_religion` (the Wikipedia slug) with the short form as an alias
    gr-967  Civic cult — retitled, and answered by **`polis religion`**, which is the term the
             literature actually uses and the one a reader meets again; "civic cult" defines nothing
             a reader could look up. The card's answer term IS a modern model, so the
             no-researchers exemption would have covered it — it is deliberately NOT used: the card
             is written about the THING (the calendar, the public funds, the metics admitted to some
             cults) with the model and its critics held to three sentences, so `card-focus.js` rule
             2 is satisfied on its own terms and no `EXEMPT` row was needed
    gr-968  What a Greek temple was for — answered by `Greek temple`. The question the plan's line
             asks is the card's argument: the altar is outside, so the building is the god's house
             and the city's treasury, and many sanctuaries never had one. Thucydides 2.13 carries
             both this card and gr-969 — the forty talents of removable gold on the Parthenos is a
             fact about a temple's wealth and a fact about what a cult image was made of
    gr-969  The cult statue — answered by **`cult image`**, which is the scholarly term and is
             honest about the thing: the Mylonopoulos volume's own point, read in review, is that
             Greek had NO single word for one and that votive and cult image are often the same
             object. A card answered by "cult statue" would assert the distinction the sources deny;
             the phrase survives as the glossary alias
    gr-970  The Greek altar — written. Pausanias on the ash altar at Olympia is what makes the card
             concrete, and the dimensions are his own. The picture is an altar standing in the open
             in FRONT of its temple at Delos, which is the card's claim in one photograph; the
             museum candidates were rejected as mostly modern plaster
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
